/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function(
) {
	"use strict";

	var findIndexInArray = function(array, predicate, thisArg) {
		if (Array.isArray(array) && typeof predicate === "function") {
			for (var index = 0, count = array.length; index < count; index++) {
				if (predicate.call(thisArg, array[index], index, array)) {
					return index;
				}
			}
		}

		return -1;
	};

	return findIndexInArray;
});
