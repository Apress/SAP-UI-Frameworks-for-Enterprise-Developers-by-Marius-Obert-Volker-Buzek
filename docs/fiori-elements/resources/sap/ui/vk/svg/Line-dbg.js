/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Line class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Line = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Line";
		this.x1 = parameters.x1 || 0;
		this.y1 = parameters.y1 || 0;
		this.x2 = parameters.x2 || 0;
		this.y2 = parameters.y2 || 0;

		this.setMaterial(parameters.material);
	};

	Line.prototype = Object.assign(Object.create(Element.prototype), { constructor: Line });

	Line.prototype.tagName = function() {
		return "line";
	};

	Line.prototype.setFillStyle = function(fillStyle, invalidate) {}; // no fill

	Line.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = isNaN(this.strokeWidth) ? 0 : this.strokeWidth * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x1, this.y1, strokeDelta, strokeDelta);
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x2, this.y2, strokeDelta, strokeDelta);
	};

	Line.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("x1", this.x1);
		setAttributeFunc("y1", this.y1);
		setAttributeFunc("x2", this.x2);
		setAttributeFunc("y2", this.y2);
	};

	Line.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		parametric.type = "line";
		parametric.x1 = this.x1;
		parametric.y1 = this.y1;
		parametric.x2 = this.x2;
		parametric.y2 = this.y2;
		return parametric;
	};

	Line.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		this.x1 = source.x1;
		this.y1 = source.y1;
		this.x2 = source.x2;
		this.y2 = source.y2;

		return this;
	};

	return Line;
});
