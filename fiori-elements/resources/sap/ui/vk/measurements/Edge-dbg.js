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

	var defaultEdge = [0, 0, 0, 0, 0, 0];

	/**
	 * Create an edge feature object.
	 *
	 * @class
	 * @classdesc Provides functionality for highlighting edges.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @param {float[]} [settings.edge] World coordinates of the edge ends in form <code>[x1, y1, z1, x2, y2, z2]</code>.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Edge
	 * @since 1.101.0
	 */
	var Edge = function(settings) {
		Feature.apply(this, arguments);

		this._edge = new Float64Array(6);
		this.setValue(settings && settings.edge || defaultEdge);
	};

	Edge.prototype = Object.create(Feature.prototype);
	Edge.prototype.constructor = Edge;
	Edge.prototype.isEdge = true;

	Feature._classMap.set(FeatureType.Edge, Edge);

	/**
	 * Set edge position.
	 *
	 * @param {float[]|Float64Array} value World coordinates of the edge ends in form <code>[x1, y1, z1, x2, y2, z2]</code>.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Edge.prototype.setValue = function(value) {
		assert(value.length === 6, "Edge array must have 6 elements");
		this._edge.set(value);
		return this;
	};

	/**
	 * Get edge position.
	 *
	 * @returns {Float64Array} World coordinates of the edge ends in form <code>[x1, y1, z1, x2, y2, z2]</code>.
	 */
	Edge.prototype.getValue = function() {
		return this._edge;
	};

	Edge.prototype.toJSON = function() {
		return {
			type: FeatureType.Edge,
			edge: Array.from(this._edge)
		};
	};

	return Edge;
});
