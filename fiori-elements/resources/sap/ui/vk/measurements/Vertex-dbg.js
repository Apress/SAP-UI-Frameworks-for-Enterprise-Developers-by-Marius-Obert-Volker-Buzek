/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/assert",
	"./Feature",
	"./FeatureType"
], function(
	assert,
	Feature,
	FeatureType
) {
	"use strict";

	var defaultVertex = [0, 0, 0];

	/**
	 * Create a vertex feature object.
	 *
	 * @class
	 * @classdesc Provides functionality for highlighting vertices.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @param {float[]} [settings.vertex] World coordinates of the vertex in form <code>[x, y, z]</code>.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Vertex
	 * @since 1.101.0
	 */
	var Vertex = function(settings) {
		Feature.apply(this, arguments);

		this._vertex = new Float64Array(3);
		this.setValue(settings && settings.vertex || defaultVertex);
	};

	Vertex.prototype = Object.create(Feature.prototype);
	Vertex.prototype.constructor = Vertex;
	Vertex.prototype.isVertex = true;

	Feature._classMap.set(FeatureType.Vertex, Vertex);

	/**
	 * Set vertex position.
	 *
	 * @param {float[]|Float64Array} value World coordinates of the vertex in form <code>[x, y, z]</code>.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Vertex.prototype.setValue = function(value) {
		assert(value.length === 3, "Vertex array must have 3 elements");
		this._vertex.set(value);
		return this;
	};

	/**
	 * Get vertex position.
	 *
	 * @returns {Float64Array} World coordinates of the vertex in form <code>[x, y, z]</code>.
	 */
	Vertex.prototype.getValue = function() {
		return this._vertex;
	};

	Vertex.prototype.toJSON = function() {
		return {
			type: FeatureType.Vertex,
			vertex: Array.from(this._vertex)
		};
	};

	return Vertex;
});
