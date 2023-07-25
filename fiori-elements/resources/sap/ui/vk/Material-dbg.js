/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Material class.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new Material.
	 *
	 *
	 * @class Provides the interface for the material.
	 *
	 * The objects of this class should not be created directly.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Material
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Material = ManagedObject.extend("sap.ui.vk.Material", /** @lends sap.ui.vk.Material.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {

				/**
				 * Material id
				 */
				"id": {
					type: "string"
				},

				/**
				 * Material name
				 */
				"name": {
					type: "string"
				},

				/**
				 * Ambient colour (optional) - red, green, blue, and alpha
				 */
				"ambientColour": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 1)" // black
				},

				/**
				 * Diffuse colour (optional) - red, green, blue, and alpha
				 */
				"diffuseColour": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 1)" // black
				},

				/**
				 * Specular colour (optional) - red, green, blue, and alpha
				 */
				"specularColour": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 1)" // black
				},

				/**
				 * Emissive colour (optional) - red, green, blue, and alpha
				 */
				"emissiveColour": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 1)" // black
				},

				/**
				 * Opacity (optional)
				 */
				"opacity": {
					type: "float",
					defaultValue: 1.0
				},

				/**
				 * Glossiness (optional)
				 */
				"glossiness": {
					type: "float",
					defaultValue: 0.0
				},

				/**
				 * Line colour (optional) - red, green, blue, and alpha
				 */
				"lineColour": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(0, 0, 0, 1)" // black
				},

				/**
				 * Line width (optional)
				 */
				"lineWidth": {
					type: "float",
					defaultValue: 0.0
				},

				/**
				 * Diffuse texture (optional)
				 */
				"textureDiffuse": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				},

				/**
				 * Bump texture (optional)
				 */
				"textureBump": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				},

				/**
				 * Opacity texture (optional)
				 */
				"textureOpacity": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				},

				/**
				 * Reflection texture (optional)
				 */
				"textureReflection": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				},

				/**
				 * Emissive texture (optional)
				 */
				"textureEmissive": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				},

				/**
				 * Ambient occlusion texture (optional)
				 */
				"textureAmbientOcclusion": {
					type: "sap.ui.vk.Texture",
					defaultValue: null
				}
			}
		}
	});


	/**
	 *
	 * @returns {any} Material reference that this material class wraps
	 * @public
	 */
	Material.prototype.getMaterialRef = function() {
		return null;
	};

	return Material;
});
