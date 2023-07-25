/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.AnchorPointToolOperation.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the allowed operations on the anchor point tool
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.tools.AnchorPointToolOperation
	 * @public
	 */
	var AnchorPointToolOperation = {
		/**
		 * Allow both rotation and move
		 * @public
		 */
		All: "All",
		/**
		 * Allow only rotation
		 * @public
		 */
		Rotate: "Rotate",
		/**
		 * Allow only move
		 * @public
		 */
		Move: "Move"
	};

	return AnchorPointToolOperation;

}, /* bExport= */ true);
