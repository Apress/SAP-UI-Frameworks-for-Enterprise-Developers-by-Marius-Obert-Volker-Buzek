/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Ellipse class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Ellipse = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Ellipse";
		this.cx = parameters.cx || 0;
		this.cy = parameters.cy || 0;

		this.rx = parameters.major || parameters.radius || 0;
		this.ry = parameters.minor || parameters.radius || 0;

		this.setMaterial(parameters.material);
	};

	Ellipse.prototype = Object.assign(Object.create(Element.prototype), { constructor: Ellipse });

	Ellipse.prototype.tagName = function() {
		return "ellipse";
	};

	Ellipse.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = isNaN(this.strokeWidth) ? 0 : this.strokeWidth * 0.5;
		this._expandBoundingBoxCR(boundingBox, matrixWorld, this.cx, this.cy, this.rx + strokeDelta, this.ry + strokeDelta);
	};

	Ellipse.prototype._setSpecificAttributes = function(setAttributeFunc) {
		if (this.cx) {
			setAttributeFunc("cx", this.cx);
		}
		if (this.cy) {
			setAttributeFunc("cy", this.cy);
		}
		setAttributeFunc("rx", this.rx);
		setAttributeFunc("ry", this.ry);
	};

	Ellipse.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		if (this.rx === this.ry) {
			parametric.type = "circle";
			parametric.radius = this.rx;
		} else {
			parametric.type = "ellipse";
			parametric.major = this.rx;
			parametric.minor = this.ry;
		}
		return parametric;
	};

	Ellipse.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		this.cx = source.cx;
		this.cy = source.cy;
		this.rx = source.rx;
		this.ry = source.ry;

		return this;
	};

	return Ellipse;
});
