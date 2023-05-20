
sap.ui.define([
	"sap/ui/core/theming/Parameters",
	"sap/m/library",
	"sap/ui/core/library"
], function (Parameters, mobileLibrary, coreLibrary) {
	"use strict";

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

	// shortcut for sap.ui.core.CSSColor
	var CSSColor = coreLibrary.CSSColor;

	var ThemingUtil = function() {
		throw new Error();
	};

	ThemingUtil.resolveColor = function (sColor) {
		if (CSSColor.isValid(sColor)) {
			return sColor;
		}

		switch (sColor) {
			case ValueColor.Good:
				return Parameters.get("sapPositiveColor");
			case ValueColor.Error:
				return Parameters.get("sapNegativeColor");
			case ValueColor.Critical:
				return Parameters.get("sapCriticalColor");
			case ValueColor.Neutral:
				return Parameters.get("sapNeutralColor");
			default:
				return Parameters.get(sColor);
		}
	};

	return ThemingUtil;
}, true);
