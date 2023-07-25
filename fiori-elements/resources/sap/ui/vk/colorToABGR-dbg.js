/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.colorToABGR.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts a structure <code>{ red, green, blue, alpha }</code> to a 32-bit integer in the ABGR notation.
	 * @function
	 * @param {object} color       A map of parameters. See below.
	 * @param {int}    color.red   The red component of the color in the range [0, 255].
	 * @param {int}    color.green The green component of the color in the range [0, 255].
	 * @param {int}    color.blue  The blue component of the color in the range [0, 255].
	 * @param {float}  color.alpha The alpha component of the color in the range [0.0, 1.0];
	 * @returns {int} A 32-bit integer in the ABGR notation.
	 * @static
	 * @public
	 */
	var colorToABGR = function(color) {
		// NB: use >>> to convert to 32 bit unsigned.
		return (color.alpha * 255 << 24 | color.blue << 16 | color.green << 8 | color.red) >>> 0;
	};

	return colorToABGR;

}, /* bExport= */ true);
