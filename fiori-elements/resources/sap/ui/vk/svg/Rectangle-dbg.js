/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Rectangle class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Rectangle = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Rectangle";
		this.x = parameters.x || 0;
		this.y = parameters.y || 0;
		this.width = parameters.width || 0;
		this.height = parameters.height || parameters.length || 0;
		this.rx = parameters.rx || parameters.radius || 0;
		this.ry = parameters.ry || parameters.radius || 0;

		this.setMaterial(parameters.material);
	};

	Rectangle.prototype = Object.assign(Object.create(Element.prototype), { constructor: Rectangle });

	Rectangle.prototype.tagName = function() {
		return "rect";
	};

	Rectangle.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = isNaN(this.strokeWidth) ? 0 : this.strokeWidth * 0.5;
		var hw = this.width * 0.5;
		var hh = this.height * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x + hw, this.y + hh, hw + strokeDelta, hh + strokeDelta);
	};

	Rectangle.prototype._setSpecificAttributes = function(setAttributeFunc) {
		if (this.x) {
			setAttributeFunc("x", this.x);
		}
		if (this.y) {
			setAttributeFunc("y", this.y);
		}
		setAttributeFunc("width", this.width);
		setAttributeFunc("height", this.height);
		if (this.rx) {
			setAttributeFunc("rx", this.rx);
		}
		if (this.ry) {
			setAttributeFunc("ry", this.ry);
		}
	};

	Rectangle.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		parametric.type = "rectangle";
		parametric.width = this.width;
		parametric.length = this.height;
		parametric.radius = Math.min(this.rx, this.ry);
		return parametric;
	};

	Rectangle.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		this.x = source.x;
		this.y = source.y;
		this.width = source.width;
		this.height = source.height;
		this.rx = source.rx;
		this.ry = source.ry;

		return this;
	};

	return Rectangle;
});
