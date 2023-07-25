/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.abgrToColor.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts a 32-bit integer in the ABGR notation to a JSON structure <code>{ red, green, blue, alpha }</code>.
	 *
	 * @function
	 * @param {int} abgr A 32-bit integer in the ABGR notation.
	 * @returns {object} An object with the following structure:
	 * <pre>
	 * {
	 *   red:   <i>int</i>,
	 *   green: <i>int</i>,
	 *   blue:  <i>int</i>,
	 *   alpha: <i>float</i>
	 * }
	 * </pre>
	 * where <i>red</i>, <i>green</i>, <i>blue</i> are integer in the range [0, 255], and <i>alpha</i> is float in the range from [0.0, 1.0].
	 * @static
	 * @public
	 */
	var abgrToColor = function(abgr) {
		return {
			red:    abgr        & 0xff,
			green:  abgr >>> 8  & 0xff,
			blue:   abgr >>> 16 & 0xff,
			alpha: (abgr >>> 24 & 0xff) / 255
		};
	};

	return abgrToColor;

}, /* bExport= */ true);
