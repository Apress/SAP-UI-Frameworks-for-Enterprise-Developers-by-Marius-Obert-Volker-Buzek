/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

/* globals Promise:true */

// Provides control sap.suite.ui.commons.statusindicator.ShapeGroup.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	"sap/suite/ui/commons/statusindicator/util/ProgressHandler",
	"sap/base/Log"
], function (Control, Core, Configuration, ProgressHandler, Log) {
	"use strict";

	/**
	 * Constructor for a new ShapeGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Group of shapes that display status indicator value. Shapes in the group are filled in parallel, actual
	 * animation might depend on particular shape setting.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.ShapeGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ShapeGroup = Control.extend("sap.suite.ui.commons.statusindicator.ShapeGroup",
		/** @lends sap.suite.ui.commons.ShapeGroup.prototype */
		{
			metadata: {
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * Weight of the group, relative to other groups in the status indicator. This property
					 * allows you to distribute the status indicator's value between groups of shapes that it
					 * contains. For example, for three groups with weights 10, 10, and 20 (total weight 40),
					 * the status indicator's value is distributed in the following way:
					 * <ul>
					 *   <li>If the status indicator's value is below 25% (10 out of 40), the first group
					 * of shapes (weight 10) is partially filled, depending on the percentage value. For example,
					 * if the percentage value is 5, the first group of shapes is 1/5-full. The second
					 * and the third groups are empty.</li>
					 *   <li>If the status indicator's value is at least 25% but below 50%, the first group
					 * of shapes (weight 10) is filled, the second group (also weight 10) is partially filled, and
					 * the third group (weight 20) appears empty.</li>
					 *   <li>If the status indicator's value is at least 50% but below 100%, the first two
					 * groups of shapes (weight 10 each) are filled, but the third group (weight 20) is only
					 * partially filled.</li>
					 *   <li>If the status indicator's value is 100, all three groups of shapes are filled.</li>
					 * </ul>
					 *
					 */
					weight: {type: "int", defaultValue: 10} // TODO: always positive
				},
				defaultAggregation: "shapes",
				aggregations: {
					/**
					 * List of shapes that belong to this group.
					 */
					shapes: {type: "sap.suite.ui.commons.statusindicator.Shape", multiple: true}
				}
			},
			renderer: null // this control has no own renderer, it is rendered by the StatusIndicator
		});

	ShapeGroup.prototype.init = function () {
		this._iTargetValue = 0;
		this._oAnimationPropertiesResolver = null;
		this._iLastDirectValueUpdate = 0;
	};

	ShapeGroup.prototype.discreteThresholdsChangeHandler = function (iCurrentValue) {
		var iNewValue = this._oAnimationPropertiesResolver._getGroupValue(this, iCurrentValue);

		if (iNewValue !== this._iLastDirectValueUpdate) {
			this.getShapes().forEach(function (oShape) {
				oShape._updateDom(iNewValue, true);
			});

			this._iLastDirectValueUpdate = iNewValue;
		}
	};

	ShapeGroup.prototype.propertyThresholdsChangeHandler = function (sNewFillColor) {
		this.getShapes().forEach(function (oShape) {
			if (oShape.getDisplayedValue() !== 0) {
				oShape.getRenderer()._updateDomColor(oShape, sNewFillColor);
			}
		});
	};

	ShapeGroup.prototype._injectAnimationPropertiesResolver = function (oAnimationPropertiesResolver) {
		this._oAnimationPropertiesResolver = oAnimationPropertiesResolver;
		this._oAnimationPropertiesResolver.addDiscreteThresholdChange(this.discreteThresholdsChangeHandler.bind(this));
		this._oAnimationPropertiesResolver.addPropertyThresholdChange(this.propertyThresholdsChangeHandler.bind(this));
		this.getShapes().forEach(function (oShape) {
			oShape._injectAnimationPropertiesResolver(oAnimationPropertiesResolver);
		});
	};

	ShapeGroup.prototype.addShape = function (oShape) {
		this.addAggregation("shapes", oShape, true);
		oShape._injectAnimationPropertiesResolver(this._oAnimationPropertiesResolver);
		return this;
	};

	ShapeGroup.prototype._setValue = function (iValue, bNoAnimationFlag) {
		var that = this;
		bNoAnimationFlag = bNoAnimationFlag || false;
		this._iTargetValue = iValue;

		if (!this._isAnimationAllowed() || bNoAnimationFlag) {
			this.getShapes().forEach(function (oShape) {
				oShape._updateDom(that._iTargetValue);
			});
			return Promise.resolve();
		}

		// if animation on change is not allowed, the shapes are immediately updated
		this.getShapes().forEach(function (oShape) {
			if (!oShape.getAnimationOnChange()) {
				oShape._updateDom(that._iTargetValue);
			}
		});

		// cancel any ongoing group animation
		if (this.oCurrentProgressHandler && this.oCurrentProgressHandler.isInProgress()) {
			this.oCurrentProgressHandler.cancel();
		}

		this.oCurrentProgressHandler = new ProgressHandler(function (oProgressNotifier) {
			var iNow = performance.now();

			that._animationStep(iNow, oProgressNotifier, iNow);
		});
		return this.oCurrentProgressHandler.start();
	};

	ShapeGroup.prototype._animationStep = function (iLastUpdateTime, oProgressHandler, iCurrentTime) {
		Log.debug("AnimationStep at time: " + iCurrentTime.toString(10), null, this);
		// sometimes browsers (Chrome) return current time from the past, hence, animation would get screwed as
		// we rely on the assumption that iLastUpdateTime <= iCurrentTime
		iCurrentTime = Math.max(iCurrentTime, iLastUpdateTime);

		if (oProgressHandler.isCanceled()) {
			oProgressHandler.stop({
				cancelled: true
			});
			return;
		}

		var bAnimationFinished = true;
		var iTargetValue = this._iTargetValue;

		this.getShapes().forEach(function (oShape) {
			var iDisplayedValue = oShape.getDisplayedValue();

			if (iDisplayedValue === iTargetValue) {
				return;
			}

			var iTargetTime = iLastUpdateTime + oShape.getFullAnimationDuration() * Math.abs(iTargetValue - iDisplayedValue) / 100;
			var iValueToUpdate = iTargetValue;

			if (iCurrentTime < iTargetTime) {
				var iDifferenceOfValue = iTargetValue - iDisplayedValue;
				var iDifferenceOfTimes = iTargetTime - iLastUpdateTime;
				var currentRatio = (iCurrentTime - iLastUpdateTime) / iDifferenceOfTimes;
				iValueToUpdate = iDifferenceOfValue * currentRatio + iDisplayedValue;

				bAnimationFinished = false;
			}

			oShape._updateDom(iValueToUpdate);
		});

		if (bAnimationFinished) {
			oProgressHandler.finish();
		} else {
			window.requestAnimationFrame(this._animationStep.bind(this, iCurrentTime, oProgressHandler));
		}
	};

	ShapeGroup.prototype._showsFullProgress = function () {
		return !this.getShapes().some(function (oShape) {
			return oShape.getDisplayedValue() !== 100;
		});
	};

	ShapeGroup.prototype._setInitialValue = function (iInitialValue) {
		this._iTargetValue = iInitialValue;
		this._iLastDirectValueUpdate = iInitialValue;

		this.getShapes().forEach(function (oShape) {
			oShape._setInitialValue(iInitialValue);
		});
	};

	ShapeGroup.prototype._isAnimationAllowed = function () {
		var oApplicationConfiguration = Core.getConfiguration();
		var sAnimationMode = oApplicationConfiguration.getAnimationMode();

		return sAnimationMode !== Configuration.AnimationMode.none;
	};

	return ShapeGroup;

});
