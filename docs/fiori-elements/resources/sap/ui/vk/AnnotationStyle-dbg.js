/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.AnnotationStyle.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the animation style type for annotation text.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.AnnotationStyle
	 * @public
	 */
	var AnnotationStyle = {
		/**
		 * Style 1
		 * @public
		 */
		Default: "Default",
		/**
		 * Style 2
		 * @public
		 */
		Explode: "Explode",
		/**
		 * Style 3
		 * @public
		 */
		Square: "Square",
		/**
		 * Style 4
		 * @public
		 */
		Random: "Random",
		/**
		 * Style 5
		 * @public
		 */
		Expand: "Expand"
	};

	return AnnotationStyle;

}, /* bExport= */ true);
