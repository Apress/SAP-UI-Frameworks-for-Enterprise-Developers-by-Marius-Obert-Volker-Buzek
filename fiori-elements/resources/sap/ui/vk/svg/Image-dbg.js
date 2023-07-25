/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Image class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Image = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Image";
		this.x = parameters.x || 0;
		this.y = parameters.y || 0;
		this.width = parameters.width || 0;
		this.height = parameters.height || 0;
		this.data = parameters.data || null;

		this.setMaterial(parameters.material);
	};

	Image.prototype = Object.assign(Object.create(Element.prototype), { constructor: Image });

	Image.prototype.tagName = function() {
		return "image";
	};

	Image.prototype.setMaterial = function(material, invalidate) {
		if (material && this.materialId === material.materialId) {
			var imageWidth = material.textureWidth;
			var imageHeight = material.textureHeight;
			if (imageWidth && imageHeight) {
				this.width = imageWidth;
				this.height = imageHeight;
			}

			if (material.texture) {
				this.data = material.texture;
			}

			if (invalidate) {
				this.invalidate();
			}
		}
	};

	Image.prototype._setSpecificAttributes = function(setAttributeFunc, domRef) {
		if (this.x) {
			setAttributeFunc("x", this.x);
		}
		if (this.y) {
			setAttributeFunc("y", this.y);
		}

		if (this.width > 0 && this.height > 0 && this.data) {
			setAttributeFunc("width", this.width);
			setAttributeFunc("height", this.height);

			if (domRef) {
				domRef.setAttribute("href", this.data);
			} else {
				setAttributeFunc("href", this.data);
			}
		}
	};

	Image.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		// No stroke width for images.
		var hw = this.width * 0.5;
		var hh = this.height * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x + hw, this.y + hh, hw, hh);
	};

	Image.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		parametric.type = "rectangle";
		parametric.width = this.width;
		parametric.length = this.height;
		return parametric;
	};

	Image.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		this.x = source.x;
		this.y = source.y;
		this.width = source.width;
		this.height = source.height;
		this.data = source.data;

		return this;
	};

	return Image;
});
