sap.ui.define([
	"sap/suite/ui/commons/statusindicator/Shape",
	"sap/suite/ui/commons/statusindicator/ShapeGroup",
	"sap/suite/ui/commons/statusindicator/CustomShape",
	"sap/base/Log"
], function (Shape, ShapeGroup, CustomShape, Log) {
	"use strict";

	var AnimationPropertiesResolver = function (oStatusIndicator) {
		this._oStatusIndicator = oStatusIndicator;
		this.aOnDiscreteThresholdChange = [];
		this.aOnPropertyThresholdChange = [];
	};

	AnimationPropertiesResolver.prototype.addDiscreteThresholdChange = function (fnChangeHandler) {
		this.aOnDiscreteThresholdChange.push(fnChangeHandler);
	};

	AnimationPropertiesResolver.prototype.addPropertyThresholdChange = function (fnChangeHandler) {
		this.aOnPropertyThresholdChange.push(fnChangeHandler);
	};

	/**
	 * Resolve the value for the given shape.
	 *
	 * @param {Shape} oShape
	 * @param iShapeValue
	 * @returns {int}
	 */
	AnimationPropertiesResolver.prototype.getValue = function (oShape, iShapeValue) {
		var oParent = oShape.getParent();

		if (!oParent instanceof ShapeGroup) {
			Log.fatal("Shape should be always direct child of ShapeGroup.");
			return iShapeValue;
		}

		if (!this._oStatusIndicator._discreteThresholdsEnabled()) {
			return iShapeValue;
		}

		return this._getGroupValue(oParent, this._getCappedValue(oParent, iShapeValue));
	};

	AnimationPropertiesResolver.prototype._getCappedValue = function (oGroup, iShapeValue) {
		var iNewStatusIndicatorValue = this._getStatusIndicatorValue(oGroup, iShapeValue);
		var oDiscreteThreshold = this._oStatusIndicator._getDiscreteThresholdForValue(iNewStatusIndicatorValue);

		return oDiscreteThreshold ? oDiscreteThreshold.getValue() : 0;
	};

	AnimationPropertiesResolver.prototype.propagateValueChange = function (oShape, iNewShapeValue) {
		if (!this._oStatusIndicator._discreteThresholdsEnabled()) {
			return;
		}

		var oGroup = oShape.getParent();
		var iOldCappedValue = this._getCappedValue(oGroup, oShape.getDisplayedValue());
		var iNewCappedValue = this._getCappedValue(oGroup, iNewShapeValue);

		if (iOldCappedValue !== iNewCappedValue) {
			this.aOnDiscreteThresholdChange.forEach(function (fnOnDiscreteThresholdChange) {
				fnOnDiscreteThresholdChange(iNewCappedValue);
			});
		}
	};

	/**
	 * Returns the color that should be valid for the given shape and value
	 *
	 * @param oShape
	 * @param iShapeValue
	 */
	AnimationPropertiesResolver.prototype.getColor = function (oShape, iShapeValue) {
		var oParent = oShape.getParent();
		if (oParent instanceof CustomShape) {
			iShapeValue = oParent.getDisplayedValue();
			oParent = oParent.getParent();
		}

		var iStatusIndicatorValue = this._getStatusIndicatorSliderValue();

		var sNewFillColor = oShape._getCssFillColor();

		if (this._oStatusIndicator._propertyThresholdsEnabled()) {
			var oPropertyThreshold = this._oStatusIndicator._getPropertyThresholdForValue(iStatusIndicatorValue);
			if (oPropertyThreshold) {
				sNewFillColor = oPropertyThreshold._getCssFillColor();
			}
		}

		return sNewFillColor;
	};

	AnimationPropertiesResolver.prototype.propagateColorChange = function (oShape, iShapeValue) {
		if (!this._oStatusIndicator._propertyThresholdsEnabled()) {
			return;
		}
		var oParent = oShape.getParent();
		var oNewPropertyThreshold = this._getPropertyThreshold(oParent, iShapeValue);
		var oOldPropertyThreshold = this._getPropertyThreshold(oParent, oShape.getDisplayedValue());

		if (oNewPropertyThreshold !== oOldPropertyThreshold) {
			this.aOnPropertyThresholdChange.forEach(function (fnOnPropertyThresholdChange) {
				fnOnPropertyThresholdChange(oNewPropertyThreshold._getCssFillColor());
			});
		}
	};

	AnimationPropertiesResolver.prototype._getPropertyThreshold = function (oGroup, iShapeValue) {
		var iStatusIndicatorValue = this._getStatusIndicatorValue(oGroup, iShapeValue);
		return this._oStatusIndicator._getPropertyThresholdForValue(iStatusIndicatorValue);
	};

	AnimationPropertiesResolver.prototype._getStatusIndicatorValue = function (oCurrentGroup, iShapeValue) {
		var that = this;
		var aGroups = this._oStatusIndicator.getGroups();

		var iAccValue = 0;
		aGroups.some(function (oGroup) {
			var fGroupRatio = oGroup.getWeight() / that._getTotalWeight();

			if (oGroup !== oCurrentGroup) {
				var iFullGroupValue = 100 * fGroupRatio;
				iAccValue += iFullGroupValue;
				return false;
			}

			var fGlobalValue = iShapeValue * fGroupRatio;
			iAccValue += fGlobalValue;
			return true;
		});
		return Number(iAccValue.toPrecision(3));
	};

	AnimationPropertiesResolver.prototype._getStatusIndicatorSliderValue = function () {
		var iStatusValue = 0;
		if (this._oStatusIndicator) {
			iStatusValue = this._oStatusIndicator.getValue();
		}
		return iStatusValue;
	};

	AnimationPropertiesResolver.prototype._getGroupValue = function (oCurrentGroup, iStatusIndicatorValue) {
		var aGroups = this._oStatusIndicator.getGroups();
		var iTotalWeight = this._getTotalWeight();
		var iResult = 0;

		aGroups.some(function (oGroup) {
			var fGroupRatio = oGroup.getWeight() / iTotalWeight;
			var iNewGroupValue;

			if (iStatusIndicatorValue === 0) {
				iNewGroupValue = 0;
			} else if (iStatusIndicatorValue >= 100 * fGroupRatio) {
				iNewGroupValue = 100;
			} else {
				iNewGroupValue = iStatusIndicatorValue / fGroupRatio;
			}

			iStatusIndicatorValue -= iNewGroupValue * fGroupRatio;

			if (oCurrentGroup !== oGroup) {
				return false;
			}

			iResult = iNewGroupValue;
			return true;
		});

		return iResult;
	};

	AnimationPropertiesResolver.prototype._getTotalWeight = function () {
		return this._oStatusIndicator.getGroups().reduce(function (iAccumulator, oGroup) {
			return iAccumulator + oGroup.getWeight();
		}, 0);
	};

	return AnimationPropertiesResolver;
});
