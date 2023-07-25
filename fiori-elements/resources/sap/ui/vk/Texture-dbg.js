/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Texture class.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new texture
	 *
	 *
	 * @class Provides the interface for the texture.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Texture
	 * @experimental Since 1.58.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Texture = ManagedObject.extend("sap.ui.vk.Texture", /** @lends sap.ui.vk.Texture.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * texture ID (optional)
				 */
				"id": {
					type: "string"
				},
				/**
				 * filter mode -  Bilinear = 0, NearestNeighbor = 1
				 */
				"filterMode": {
					type: "int",
					defaultValue: 0
				},
				/**
				 * Rotation angle of uv coordinates
				 */
				"uvRotationAngle": {
					type: "float",
					defaultValue: 0.0
				},
				/**
				 * Horizontal offset of uv coordinates
				 */
				"uvHorizontalOffset": {
					type: "float",
					defaultValue: 0.0
				},
				/**
				 * VerticalOffset offset of uv coordinates
				 */
				"uvVerticalOffset": {
					type: "float",
					defaultValue: 0.0
				},
				/**
				 * Horizontal scale of uv coordinates
				 */
				"uvHorizontalScale": {
					type: "float",
					defaultValue: 0.0
				},
				/**
				 * Vertical scale of uv coordinates
				 */
				"uvVerticalScale": {
					type: "float",
					defaultValue: 0.0
				},
				/**
				 * Is the uv horizontal tiling enabled
				 */
				"uvHorizontalTilingEnabled": {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Is the uv vertical tiling enabled
				 */
				"uvVerticalTilingEnabled": {
					type: "boolean",
					defaultValue: true
				}
			}
		}
	});

	/**
	 * Load texture image.
	 * @param {string} imageUrl resource url for image.
	 * @returns {sap.ui.vk.Texture} This allows method chaining
	 * @public
	 */
	Texture.prototype.load = function(imageUrl) {
		return this;
	};

	/**
	 *
	 * @returns {any} Texture reference that this texture class wraps
	 * @public
	 */
	Texture.prototype.getTextRef = function() {
		return null;
	};

	return Texture;
});
