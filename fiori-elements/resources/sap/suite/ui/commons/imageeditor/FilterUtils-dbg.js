sap.ui.define([], function() {
	"use strict";

	/**
	 * This class contains methods that applies image filters on given Canvas ImageData
	 * Filters are based on https://www.w3.org/TR/filter-effects-1/#ShorthandEquivalents
	 * These pixel lvl filters are needed because there is no way to save canvas with css filters applied to it,
	 * instead they have to be recreated manually.
	 * This class can be dropped when IE will be gone and https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter is compatible with other browsers
	 * @private
	 */
	var FilterUtils = function() {
	};

	// filters done manually to pixels and are based on https://www.w3.org/TR/filter-effects-1/#ShorthandEquivalents
	// because simple to use canvas filters are not yet fully supported (and never will be in IE =___=)
	// filters except value in range 0-1 (or more..)


	FilterUtils.grayscale = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * (0.2126 + 0.7874 * (1 - fValue)) + fG * (0.7152 - 0.7152 * (1 - fValue)) + fB * (0.0722 - 0.0722 * (1 - fValue));
			oImageData.data[i + 1] = fR * (0.2126 - 0.2126 * (1 - fValue)) + fG * (0.7152 + 0.2848 * (1 - fValue)) + fB * (0.0722 - 0.0722 * (1 - fValue));
			oImageData.data[i + 2] = fR * (0.2126 - 0.2126 * (1 - fValue)) + fG * (0.7152 - 0.7152 * (1 - fValue)) + fB * (0.0722 + 0.9278 * (1 - fValue));
		}
	};

	FilterUtils.sepia = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * (0.393 + 0.607 * (1 - fValue)) + fG * (0.769 - 0.769 * (1 - fValue)) + fB * (0.189 - 0.189 * (1 - fValue));
			oImageData.data[i + 1] = fR * (0.349 - 0.349 * (1 - fValue)) + fG * (0.686 + 0.314 * (1 - fValue)) + fB * (0.168 - 0.168 * (1 - fValue));
			oImageData.data[i + 2] = fR * (0.272 - 0.272 * (1 - fValue)) + fG * (0.534 - 0.534 * (1 - fValue)) + fB * (0.131 + 0.869 * (1 - fValue));
		}
	};

	FilterUtils.saturate = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * (0.213 + 0.787 * fValue) + fG * (0.715 - 0.715 * fValue) + fB * (0.072 - 0.072 * fValue);
			oImageData.data[i + 1] = fR * (0.213 - 0.213 * fValue) + fG * (0.715 + 0.285 * fValue) + fB * (0.072 - 0.072 * fValue);
			oImageData.data[i + 2] = fR * (0.213 - 0.213 * fValue) + fG * (0.715 - 0.715 * fValue) + fB * (0.072 + 0.928 * fValue);
		}
	};

	FilterUtils.invert = function(oImageData, fValue) {
		var fR, fG, fB, fInvertR, fInvertG, fInvertB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			fInvertR = (255 - fR);
			fInvertG = (255 - fG);
			fInvertB = (255 - fB);

			oImageData.data[i] = fR - ((fR - fInvertR) * fValue);
			oImageData.data[i + 1] = fG - ((fG - fInvertG) * fValue);
			oImageData.data[i + 2] = fB - ((fB - fInvertB) * fValue);
		}
	};

	FilterUtils.brightness = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * fValue;
			oImageData.data[i + 1] = fG * fValue;
			oImageData.data[i + 2] = fB * fValue;
		}
	};

	FilterUtils.contrast = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * fValue + ((-0.5 * fValue) + 0.5) * 255;
			oImageData.data[i + 1] = fG * fValue + ((-0.5 * fValue) + 0.5) * 255;
			oImageData.data[i + 2] = fB * fValue + ((-0.5 * fValue) + 0.5) * 255;
		}
	};

	// https://www.w3.org/TR/filter-effects-1/#attr-valuedef-type-huerotate
	// get the exact matrix values
	// https://stackoverflow.com/questions/52470495/whats-exact-math-behind-hue-rotate-filter
	// doesn't give same results as css hue-rotate, not used at the moment
	FilterUtils.hueRotate = function(oImageData, fValue) {
		var fR, fG, fB;

		for (var i = 0; i < oImageData.data.length; i += 4) {
			fR = oImageData.data[i];
			fG = oImageData.data[i + 1];
			fB = oImageData.data[i + 2];

			oImageData.data[i] = fR * (0.2126 + Math.cos(fValue) * 0.7874 - Math.sin(fValue) * 0.2126) + fG * (0.7152 - Math.cos(fValue) * 0.7152 - Math.sin(fValue) * 0.7152) + fB * (0.0722 - Math.cos(fValue) * 0.0722 + Math.sin(fValue) * 0.9278);
			oImageData.data[i + 1] = fR * (0.2126 - Math.cos(fValue) * 0.2126 + Math.sin(fValue) * 0.143) + fG * (0.7152 + Math.cos(fValue) * 0.285 + Math.sin(fValue) * 0.140) + fB * (0.0722 - Math.cos(fValue) * 0.0722 - Math.sin(fValue) * 0.283);
			oImageData.data[i + 2] = fR * (0.2126 - Math.cos(fValue) * 0.2126 - Math.sin(fValue) * 0.7874) + fG * (0.7152 - Math.cos(fValue) * 0.7152 + Math.sin(fValue) * 0.7152) + fB * (0.0722 + Math.cos(fValue) * 0.9278 + Math.sin(fValue) * 0.0722);
		}
	};

	return FilterUtils;
}, true);
