/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.colorToABGR.
sap.ui.define([
	"./AnimationTrackValueType"
], function(
	AnimationTrackValueType
) {
	"use strict";

	var AnimationTrackValueTypeSize = {};

	/**
	 * Returns a number of components for the given value type.
	 * @function
	 * @param {sap.ui.vk.AnimationTrackValueType} valueType       A value type.
	 * @returns {int} Number of components in the given type.
	 * @static
	 * @public
	 */
	AnimationTrackValueTypeSize.get = function(valueType) {
		switch (valueType) {
			case AnimationTrackValueType.Vector3:
				return 3;
			case AnimationTrackValueType.AngleAxis:
				return 4;
			case AnimationTrackValueType.Quaternion:
				return 4;
			case AnimationTrackValueType.Euler:
				return 4;
			default:
				return 1;
		}
	};

	return AnimationTrackValueTypeSize;

}, /* bExport= */ true);
