/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.cssColorToColor.
sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Converts a {@link https://www.w3.org/TR/css3-color/#colorunits CSS Color} string to a JSON structure <code>{ red, green, blue, alpha }</code>.
	 *
	 * @function
	 * @param {string} color A {@link https://www.w3.org/TR/css3-color/#colorunits CSS Color} string.
	 * @returns {object} An object with the following structure:
	 * <pre>
	 * {
	 *   red:   <i>int</i>,
	 *   green: <i>int</i>,
	 *   blue:  <i>int</i>,
	 *   alpha: <i>float</i>
	 * }
	 * </pre>
	 * where <i>red</i>, <i>green</i>, <i>blue</i> are integers in the range of [0, 255], and <i>alpha</i> is float in the range of [0.0, 1.0].
	 * @static
	 * @public
	 */
	var cssColorToColor = (function() {
		var initialized = false;
		var div = document.createElement("div");
		div.id = "sap.ui.vk.colorConverter";
		div.style.setProperty("display", "none", "important");
		return function(color) {
			if (!initialized) {
				if (document.body) {
					document.body.appendChild(div);
					initialized = true;
				} else {
					return {
						red:   0,
						green: 0,
						blue:  0,
						alpha: 1
					};
				}
			}
			// In order to get consistent results when the color value is incorrect first reset the color to rgba(0, 0, 0, 0).
			div.style.setProperty("color", "rgba(0, 0, 0, 0)", "important");
			div.style.setProperty("color", color, "important");
			var effectiveColor = window.getComputedStyle(div).color;
			if (effectiveColor === "transparent") {
				// Some browsers (e.g. Firefox) return 'transparent' if alpha component equals 0.
				return {
					red:   0,
					green: 0,
					blue:  0,
					alpha: 0
				};
			} else {
				var components = effectiveColor.split("(")[1].split(")")[0].split(",");
				return {
					red:   parseInt(components[0], 10),
					green: parseInt(components[1], 10),
					blue:  parseInt(components[2], 10),
					alpha: components.length === 4 ? parseFloat(components[3]) : 1
				};
			}
		};
	})();

	return cssColorToColor;

}, /* bExport= */ true);
