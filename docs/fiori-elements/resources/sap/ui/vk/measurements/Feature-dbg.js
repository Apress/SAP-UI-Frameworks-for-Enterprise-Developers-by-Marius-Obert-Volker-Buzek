/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log"
], function(
	Log
) {
	"use strict";

	/**
	 * Create a new feature object.
	 *
	 * @class
	 * @classdesc A base class for a feature object such as Vertex, Edge, Face.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @param {any} [settings.context] A reference to a context, e.g. a node in the scene or a
	 *     instance of MeshAnalyzer or anything else.
	 * @param {any} [settings.featureId] An arbitrary identifier of the detected feature. It can be
	 *     an arbitrary string or an object ID or a numeric index.
	 *
	 * @abstract
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Feature
	 * @since 1.101.0
	 */
	var Feature = function(settings) {
		this._context = settings != null && "context" in settings ? settings.context : null;
		this._featureId = settings != null && "featureId" in settings ? settings.featureId : null;
	};

	Feature.prototype.isFeature = true;
	Feature._classMap = new Map();

	Feature.prototype.setContext = function(context) {
		this._context = context;
		return this;
	};

	Feature.prototype.getContext = function() {
		return this._context;
	};

	Feature.prototype.setFeatureId = function(id) {
		this._featureId = id;
		return this;
	};

	Feature.prototype.getFeatureId = function() {
		return this._featureId;
	};

	Feature.prototype.toJSON = function() {
		return {};
	};

	Feature.createFromJSON = function(json) {
		if (json != null) {
			var FeatureClass = Feature._classMap.get(json.type);
			if (FeatureClass) {
				return new FeatureClass(json);
			}

			Log.warning("Unknown feature type:", json.type);
		}
		return null;
	};

	Feature.prototype.clone = function() {
		return Feature.createFromJSON(this.toJSON(true));
	};

	return Feature;
});
