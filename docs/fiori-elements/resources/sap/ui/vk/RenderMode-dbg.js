/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.RenderMode.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Render mode for {@link sap.ui.vk.Viewport}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.RenderMode
	 * @public
	 */
	var RenderMode = {
		/**
		 * The default render mode.
		 * @public
		 */
		Default: "Default",
		/**
		 * The XRay render mode.
		 * @public
		 */
		XRay: "XRay",
		/**
		 * The line illustration render mode.
		 * @public
		 */
		LineIllustration: "LineIllustration",
		/**
		 * The shaded illustration render mode.
		 * @public
		 */
		ShadedIllustration: "ShadedIllustration",
		/**
		 * The solid outline render mode.
		 * @public
		 */
		SolidOutline: "SolidOutline"
	};

	return RenderMode;

}, /* bExport= */ true);
