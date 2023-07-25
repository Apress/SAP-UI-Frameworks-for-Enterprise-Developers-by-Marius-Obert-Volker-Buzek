/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.SimpleShape.
sap.ui.define([
	"../library",
	"sap/ui/core/Control",
	"sap/suite/ui/commons/statusindicator/Shape",
	"sap/suite/ui/commons/statusindicator/util/ThemingUtil",
	"sap/base/Log",
	"./SimpleShapeRenderer"
], function (library, Control, Shape, ThemingUtil, Log, SimpleShapeRenderer) {
	"use strict";

	/**
	 * Constructor for a new SimpleShape.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A simple shape that consists of a single SVG shape.
	 * @extends sap.suite.ui.commons.statusindicator.Shape
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.SimpleShape
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel
	 */
	var SimpleShape = Shape.extend("sap.suite.ui.commons.statusindicator.SimpleShape",
		/** @lends sap.suite.ui.commons.Shape.prototype */
		{
			metadata: {
				"abstract": true,
				library: "sap.suite.ui.commons",
				properties: {
					/**
					 * Specifies the width of the shape's outline.
					 */
					strokeWidth: {type: "float", defaultValue: 0.25},

					/**
					 * Specifies the color of the shape's outline.
					 */
					strokeColor: {type: "sap.m.ValueCSSColor", defaultValue: "Neutral"}
				}
			}
		});

	SimpleShape.prototype._getSimpleShapeElement = function () {
		Log.fatal("Must be overriden!");
	};

	SimpleShape.prototype.init = function () {
		if (Shape.prototype.init) {
			Shape.prototype.init.apply(this, arguments);
		}

		this._iDisplayedValue = 0;
		this._sViewBox = null;
	};

	SimpleShape.prototype.onBeforeRendering = function () {
		if (Shape.prototype.onBeforeRendering) {
			Shape.prototype.onBeforeRendering.apply(this, arguments);
		}

		this.getRenderer()._clearDomReferences(this);
	};

	/**
	 * Updates DOM to visualize passed value. The regular update convert the value before updating.
	 * The plain update simply updates the DOM to the given iDisplayedValue.
	 *
	 * @param {number} iDisplayedValue value to display
	 * @param {boolean} bDirectValueUpdateOnly if true, it updates the DOM to the directly passed value with no other computations.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	SimpleShape.prototype._updateDom = function (iDisplayedValue, bDirectValueUpdateOnly) {
		Log.debug("Updating to " + iDisplayedValue, null, this);
		var oRenderer = this.getRenderer();

		if (!bDirectValueUpdateOnly) {
			var sNewFillColor = this.getDisplayedFillColor(iDisplayedValue);
			oRenderer._updateDomColor(this, sNewFillColor);
			this._oAnimationPropertiesResolver.propagateColorChange(this, iDisplayedValue);
		}

		var iResolvedValue = (bDirectValueUpdateOnly) ? iDisplayedValue :
			this._oAnimationPropertiesResolver.getValue(this, iDisplayedValue);

		if (this._useGradientForAnimation()) {
			oRenderer._updateDomGradient(this, iResolvedValue);
		} else {
			oRenderer._updateDomPolygon(this, iResolvedValue);
		}

		if (!bDirectValueUpdateOnly) {
			this._oAnimationPropertiesResolver.propagateValueChange(this, iDisplayedValue);
			this._iDisplayedValue = iDisplayedValue;
		}
	};

	/**
	 * Returns currently displayed value.
	 *
	 * @public
	 *
	 * @returns {number} currently displayed value
	 */
	SimpleShape.prototype.getDisplayedValue = function () {
		return this._iDisplayedValue;
	};

	SimpleShape.prototype._setInitialValue = function (iInitialValue) {
		this._iDisplayedValue = iInitialValue;
	};

	SimpleShape.prototype._setStyle = function (sStyleAttribute) {
		this._sStyleAttribute = sStyleAttribute;
	};

	SimpleShape.prototype._setInternalViewBox = function (sViewBox) {
		this._sViewBox = sViewBox;
	};

	SimpleShape.prototype._getInternalViewBox = function () {
		return this._sViewBox;
	};

	SimpleShape.prototype._getCssStrokeColor = function () {
		return ThemingUtil.resolveColor(this.getStrokeColor());
	};

	return SimpleShape;

});
