/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.CameraProjectionType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Camera projection type.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.CameraProjectionType
	 * @public
	 */
	var CameraProjectionType = {
		/**
		 * {@link https://en.wikipedia.org/wiki/3D_projection#Perspective_projection Perspective projection}
		 * @public
		 */
		Perspective: "perspective",
		/**
		 * {@link https://en.wikipedia.org/wiki/3D_projection#Orthographic_projection Orthographic projection}
		 * @public
		 */
		Orthographic: "orthographic"
	};

	return CameraProjectionType;

}, /* bExport= */ true);
