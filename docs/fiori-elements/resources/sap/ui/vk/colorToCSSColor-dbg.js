/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.colorToCSSColor.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts a JSON structure <code>{ red, green, blue, alpha }</code> to a {@link https://www.w3.org/TR/css3-color/#colorunits CSS Color} string.
	 *
	 * @function
	 * @param {object} color       A map of parameters. See below.
	 * @param {int}    color.red   The red component of the color in the range [0, 255].
	 * @param {int}    color.green The green component of the color in the range [0, 255].
	 * @param {int}    color.blue  The blue component of the color in the range [0, 255].
	 * @param {float}  color.alpha The alpha component of the color in the range [0.0, 1.0];
	 * @returns {string} A {@link https://www.w3.org/TR/css3-color/#colorunits CSS Color} string in the format "rgba(red, green, blue, alpha)".
	 * @static
	 * @public
	 */
	var colorToCSSColor = function(color) {
		return "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
	};

	return colorToCSSColor;

}, /* bExport= */ true);
