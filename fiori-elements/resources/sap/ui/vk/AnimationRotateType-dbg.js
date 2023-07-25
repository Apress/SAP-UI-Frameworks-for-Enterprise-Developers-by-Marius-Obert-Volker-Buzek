/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Animation rotation type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.AnimationRotateType
	 * @private
	 */
	var AnimationRotateType = {
		AngleAxis: "AngleAxis",
		Euler: "Euler",
		Quaternion: "Quaternion"
	};

	return AnimationRotateType;
});
