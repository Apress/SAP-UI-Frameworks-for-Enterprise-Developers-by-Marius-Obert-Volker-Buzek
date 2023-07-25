/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility is a static class providing support functions for other Network Graph classes.
	 *
	 * @static
	 * @private
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.Utils
	 */
	var Utils = {};

	/**
	 * Polyfill for array find in IE.
	 * @param {array} arr Array to search in
	 * @param {object} callback Predicate function used to identify the item that is searched for
	 * @param {object} thisArg Argument of the callback function
	 * @returns {object} Object that has been searched for, or undefined if none was found
	 */
	Utils.find = function (arr, callback, thisArg) {
		var i;
		if (typeof arr.find === "function") {
			return arr.find(callback, thisArg);
		} else {
			for (i = 0; i < arr.length; i++) {
				if (callback.call(thisArg, arr[i], i, arr)) {
					return arr[i];
				}
			}
			return undefined;
		}
	};

	/**
	 * Trims string to given character count.
	 * @param {string} sText Text to trim
	 * @param {number} iCount Number of maximum character text can have (minus "...")
	 * @returns {string} Trimmed string
	 */
	Utils.trimText = function (sText, iCount) {
		if (sText && sText.length > iCount) {
			return sText.substring(0, iCount) + " ... ";
		}

		return sText;
	};

	return Utils;
}, true);
