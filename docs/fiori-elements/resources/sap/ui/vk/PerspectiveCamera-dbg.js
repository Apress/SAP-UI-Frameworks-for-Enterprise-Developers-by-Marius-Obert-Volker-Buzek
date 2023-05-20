/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the PerspectiveCamera class.
sap.ui.define([
	"./Camera"
], function(
	Camera
) {
	"use strict";

	/**
	 * Constructor for a new perspective camera.
	 *
	 *
	 * @class Provides the interface for the perspective camera.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.Camera
	 * @alias sap.ui.vk.PerspectiveCamera
	 * @since 1.52.0
	 */
	var PerspectiveCamera = Camera.extend("sap.ui.vk.PerspectiveCamera", /** @lends sap.ui.vk.PerspectiveCamera.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Camera frustum field of view in degree
				 */
				"fov": {
					type: "float"
				}
			}
		}
	});

	return PerspectiveCamera;
});
