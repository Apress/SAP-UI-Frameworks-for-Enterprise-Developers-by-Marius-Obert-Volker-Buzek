/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.CameraFOVBindingType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Camera field of view binding types.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.CameraFOVBindingType
	 * @public
	 */
	var CameraFOVBindingType = {
		/**
		 * The field of view is bound to the width or the height of the viewport, whichever is smaller.
		 * @public
		 */
		Minimum: "minimum",
		/**
		 * The field of view is bound to the width or the height of the viewport, whichever is bigger.
		 * @public
		 */
		Maximum: "maximum",
		/**
		 * The field of view is bound to the width of the viewport.
		 * @public
		 */
		Horizontal: "horizontal",
		/**
		 * The field of view is bound to the height of the viewport.
		 * @public
		 */
		Vertical: "vertical"
	};

	return CameraFOVBindingType;

}, /* bExport= */ true);
