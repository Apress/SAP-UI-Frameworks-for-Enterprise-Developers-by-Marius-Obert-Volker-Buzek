/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Texture class.
sap.ui.define([
	"../Texture",
	"../thirdparty/three"
], function(
	TextureBase,
	THREE
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
	 * @extends sap.ui.vk.Texture
	 * @alias sap.ui.vk.threejs.Texture
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Texture = TextureBase.extend("sap.ui.vk.threejs.Texture", /** @lends sap.ui.vk.three.Texture.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(imageUrl) {
			if (imageUrl) {
				var textureLoader = new THREE.TextureLoader();
				this._nativeTexture = textureLoader.load(imageUrl);
				if (!this._nativeTexture.userData) {
					this._nativeTexture.userData = {};
				}
			}
		}
	});

	var basePrototype = Texture.getMetadata().getParent().getClass().prototype;

	Texture.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}
	};

	Texture.prototype.load = function(imageUrl) {
		var textureLoader = new THREE.TextureLoader();
		this._nativeTexture = textureLoader.load(imageUrl);
		if (!this._nativeTexture.userData) {
			this._nativeTexture.userData = {};
		}
		return this;
	};

	Texture.prototype.getTextureRef = function() {
		return this._nativeTexture;
	};

	Texture.prototype.setTextureRef = function(textureRef) {
		this._nativeTexture = textureRef;
		if (!this._nativeTexture.userData) {
			this._nativeTexture.userData = {};
		}
		return this;
	};

	Texture.prototype.getId = function() {
		if (this._nativeTexture && this._nativeTexture.userData && this._nativeTexture.userData.id) {
			return this._nativeTexture.userData.id;
		}
	};

	Texture.prototype.setId = function(val) {
		if (this._nativeTexture) {
			if (!this._nativeTexture.userData) {
				this._nativeTexture.userData = {};
			}
			this._nativeTexture.userData.id = val;
		}
		return this;
	};

	Texture.prototype.getFilterMode = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.magFilter === THREE.NearestFilter ? 1 : 0;
		}
	};

	Texture.prototype.setFilterMode = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.magFilter = val === 1 ? THREE.NearestFilter : THREE.LinearFilter;
		}
	};

	Texture.prototype.getUvRotationAngle = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.rotation;
		}
	};

	Texture.prototype.setUvRotationAngle = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.rotation = val;
		}
	};

	Texture.prototype.getUvHorizontalOffset = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.offset.x;
		}
	};

	Texture.prototype.setUvHorizontalOffset = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.offset.x = val;
		}
	};

	Texture.prototype.getUvVerticalOffset = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.offset.y;
		}
	};

	Texture.prototype.setUvVerticalOffset = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.offset.y = val;
		}
	};

	Texture.prototype.getUvHorizontalScale = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.repeat.x;
		}
	};

	Texture.prototype.setUvHorizontalScale = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.repeat.x = val;
		}
	};

	Texture.prototype.getUvVerticalScale = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.repeat.y;
		}
	};

	Texture.prototype.setUvVerticalScale = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.repeat.y = val;
		}
	};

	Texture.prototype.getUvHorizontalTilingEnabled = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.wrapS === THREE.RepeatWrapping;
		}
	};

	Texture.prototype.setUvHorizontalTilingEnabled = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.wrapS = val ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		}
	};

	Texture.prototype.getUvVerticalTilingEnabled = function() {
		if (this._nativeTexture) {
			return this._nativeTexture.wrapT === THREE.RepeatWrapping;
		}
	};

	Texture.prototype.setUvVerticalTilingEnabled = function(val) {
		if (this._nativeTexture) {
			this._nativeTexture.wrapT = val ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		}
	};

	return Texture;
});
