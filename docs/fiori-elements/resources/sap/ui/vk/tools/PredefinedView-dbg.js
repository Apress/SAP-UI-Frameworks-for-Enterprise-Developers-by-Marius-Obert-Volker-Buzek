/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.PredefinedView.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the predefined view type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.tools.PredefinedView
	 * @public
	 */
	var PredefinedView = {
		/**
		 * Initial view
		 * @public
		 */
		Initial: "Initial",
		/**
		 * Front view
		 * @public
		 */
		Front: "Front",
		/**
		 * Back view
		 * @public
		 */
		Back: "Back",
		/**
		 * Left view
		 * @public
		 */
		Left: "Left",
		/**
		 * Right view
		 * @public
		 */
		Right: "Right",
		/**
		 * Top view
		 * @public
		 */
		Top: "Top",
		/**
		 * Bottom view
		 * @public
		 */
		Bottom: "Bottom"
	};

	return PredefinedView;

}, /* bExport= */ true);
