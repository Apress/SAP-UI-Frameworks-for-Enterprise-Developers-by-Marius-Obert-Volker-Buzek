/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.HitTestClickType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Describes the type of click or tap event that triggered the hitTest.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.tools.HitTestClickType
	 * @public
	 */
	var HitTestClickType = {
		/**
		 * Single click or tap event
		 * @public
		 */
		Single: "Single",
		/**
		 * Double click or tap
		 * @public
		 */
		Double: "Double",
		/**
		 * Right click or context event
		 * @public
		 */
		Context: "Context"
	};

	return HitTestClickType;

}, /* bExport= */ true);
