/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Material class.
sap.ui.define([
	"../Material",
	"../thirdparty/three",
	"./MaterialType",
	"./Texture",
	"../cssColorToColor",
	"../colorToCSSColor",
	"./ThreeUtils"
], function(
	MaterialBase,
	THREE,
	MaterialType,
	Texture,
	cssColorToColor,
	colorToCSSColor,
	ThreeUtils
) {
	"use strict";

	/**
	 * Constructor for a new Material.
	 *
	 *
	 * @class Provides the interface for the material.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.Material
	 * @alias sap.ui.vk.threejs.Material
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Material = MaterialBase.extend("sap.ui.vk.threejs.Material", /** @lends sap.ui.vk.three.Material.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(type) {
			switch (type) {
				default:
				case MaterialType.MeshPhongMaterial:
					this._nativeMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
					break;
				case MaterialType.LineBasicMaterial:
					this._nativeMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
					break;
				case MaterialType.MeshBasicMaterial:
					this._nativeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
					break;
			}

			MaterialBase.call(this);
		}
	});

	var basePrototype = Material.getMetadata().getParent().getClass().prototype;

	Material.prototype.init = function() {

		if (basePrototype.init) {
			basePrototype.init.call(this);
		}
	};

	Material.prototype.exit = function() {
		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}

		if (this._nativeMaterial) {
			ThreeUtils.disposeMaterial(this._nativeMaterial);
			this._nativeMaterial = null;
		}
	};

	Material.prototype.getMaterialRef = function() {
		return this._nativeMaterial;
	};

	Material.prototype.setMaterialRef = function(materialRef) {
		this._nativeMaterial = materialRef;
		return this;
	};

	Material.prototype.getId = function() {
		if (this._nativeMaterial && this._nativeMaterial.userData && this._nativeMaterial.userData.materialId) {
			return this._nativeMaterial.userData.materialId;
		}
	};

	Material.prototype.setId = function(val) {
		this._nativeMaterial.userData.materialId = val;
		return this;
	};

	Material.prototype.getName = function() {
		if (this._nativeMaterial.userData && this._nativeMaterial.userData.name) {
			return this._nativeMaterial.userData.name;
		}
	};

	Material.prototype.setName = function(val) {
		this._nativeMaterial.userData.name = val;
		return this;
	};

	Material.prototype.getAmbientColour = function() {
	};

	Material.prototype.setAmbientColour = function(val) {
		return this;
	};

	Material.prototype.getDiffuseColour = function() {
		if (this._nativeMaterial.isMeshPhongMaterial && this._nativeMaterial.color) {
			var c = {
				red: Math.round(this._nativeMaterial.color.r * 255),
				green: Math.round(this._nativeMaterial.color.g * 255),
				blue: Math.round(this._nativeMaterial.color.b * 255),
				alpha: 1.0
			};
			return colorToCSSColor(c);
		}
	};

	Material.prototype.setDiffuseColour = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial) {
			var c = cssColorToColor(val);
			this._nativeMaterial.color = new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0);
		}
		return this;
	};

	Material.prototype.getEmissiveColour = function() {
		if (this._nativeMaterial.isMeshPhongMaterial && this._nativeMaterial.emissive) {
			var c = {
				red: Math.round(this._nativeMaterial.emissive.r * 255),
				green: Math.round(this._nativeMaterial.emissive.g * 255),
				blue: Math.round(this._nativeMaterial.emissive.b * 255),
				alpha: 1.0
			};
			return colorToCSSColor(c);
		}
	};

	Material.prototype.setEmissiveColour = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial) {
			var c = cssColorToColor(val);
			this._nativeMaterial.emissive = new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0);
		}
		return this;
	};

	Material.prototype.getSpecularColour = function() {
		if (this._nativeMaterial.isMeshPhongMaterial && this._nativeMaterial.specular) {
			var c = {
				red: Math.round(this._nativeMaterial.specular.r * 255),
				green: Math.round(this._nativeMaterial.specular.g * 255),
				blue: Math.round(this._nativeMaterial.specular.b * 255),
				alpha: 1.0
			};
			return colorToCSSColor(c);
		}
	};

	Material.prototype.setSpecularColour = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial) {
			var c = cssColorToColor(val);
			this._nativeMaterial.specular = new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0);
		}
		return this;
	};

	Material.prototype.getOpacity = function() {
		if (this._nativeMaterial.opacity !== undefined) {
			return this._nativeMaterial.opacity;
		}
	};

	Material.prototype.setOpacity = function(val) {
		if (val >= 0.0 && val <= 1.0) {
			this._nativeMaterial.opacity = val;
			this._nativeMaterial.transparent = this._nativeMaterial.opacity < 1;
		}
		return this;
	};

	Material.prototype.getGlossiness = function() {
		if (this._nativeMaterial.isMeshPhongMaterial && this._nativeMaterial.shininess) {
			return this._nativeMaterial.shininess / 100.0;
		}
	};

	Material.prototype.setGlossiness = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial) {
			this._nativeMaterial.shininess = val * 100.0;
		}
		return this;
	};

	Material.prototype.getLineColour = function() {
		if (this._nativeMaterial.isLineBasicMaterial && this._nativeMaterial.color) {
			var c = {
				red: Math.round(this._nativeMaterial.color.r * 255),
				green: Math.round(this._nativeMaterial.color.g * 255),
				blue: Math.round(this._nativeMaterial.color.b * 255),
				alpha: 1.0
			};
			return colorToCSSColor(c);
		}
	};

	Material.prototype.setLineColour = function(val) {
		if (this._nativeMaterial.isLineBasicMaterial) {
			var c = cssColorToColor(val);
			this._nativeMaterial.color = new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0);
		}
		return this;
	};

	Material.prototype.getLineWidth = function() {
		if (this._nativeMaterial.isLineBasicMaterial && this._nativeMaterial.linewidth !== undefined) {
			return this._nativeMaterial.linewidth;
		}
	};

	Material.prototype.setLineWidth = function(val) {
		if (this._nativeMaterial.isLineBasicMaterial) {
			this._nativeMaterial.linewidth = val;
		}
		return this;
	};

	Material.prototype.getTextureDiffuse = function() {
		if (this._nativeMaterial.map) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.map);
			return texture;
		}
	};

	Material.prototype.setTextureDiffuse = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.map = val.getTextureRef();
		}
		return this;
	};

	Material.prototype.getTextureBump = function() {
		if (this._nativeMaterial.bumpMap) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.bumpMap);
			return texture;
		}
	};

	Material.prototype.setTextureBump = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.bumpMap = val.getTextureRef();
		}
		return this;
	};

	Material.prototype.getTextureOpacity = function() {
		if (this._nativeMaterial.alphaMap) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.alphaMap);
			return texture;
		}
	};

	Material.prototype.setTextureOpacity = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.alphaMap = val.getTextureRef();
		}
		return this;
	};

	Material.prototype.getTextureReflection = function() {
		if (this._nativeMaterial.envMap) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.envMap);
			return texture;
		}
	};

	Material.prototype.setTextureReflection = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.envMap = val.getTextureRef();
			if (this._nativeMaterial.envMap) {
				this._nativeMaterial.envMap.mapping = THREE.SphericalReflectionMapping;
				this._nativeMaterial.combine = THREE.AddOperation;
			}
		}
		return this;
	};

	Material.prototype.getTextureEmissive = function() {
		if (this._nativeMaterial.emissiveMap) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.emissiveMap);
			return texture;
		}
	};

	Material.prototype.setTextureEmissive = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.emissiveMap = val.getTextureRef();
		}
		return this;
	};

	Material.prototype.getTextureAmbientOcclusion = function() {
		if (this._nativeMaterial.aoMap) {
			var texture = new Texture();
			texture.setTextureRef(this._nativeMaterial.aoMap);
			return texture;
		}
	};

	Material.prototype.setTextureAmbientOcclusion = function(val) {
		if (this._nativeMaterial.isMeshPhongMaterial && val) {
			this._nativeMaterial.aoMap = val.getTextureRef();
		}
		return this;
	};

	return Material;
});
