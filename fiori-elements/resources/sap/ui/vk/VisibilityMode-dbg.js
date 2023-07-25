/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.VisibilityMode.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Visibility mode for {@link sap.ui.vk.Viewport#getViewInfo sap.ui.vk.Viewport.getViewInfo}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.VisibilityMode
	 * @public
	 */
	var VisibilityMode = {
		/**
		 * The view information contains a full definition of all nodes that are visible or hidden.
		 * @public
		 */
		Complete: "complete",
		/**
		 * The view information contains a list of nodes that have inverted visibility state compared to their original state.
		 * @public
		 */
		Differences: "differences"
	};

	return VisibilityMode;

}, /* bExport= */ true);
