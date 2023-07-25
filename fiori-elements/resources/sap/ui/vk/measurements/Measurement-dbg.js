/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"./Feature",
	"../uuidv4"
], function(
	Log,
	Feature,
	uuidv4
) {
	"use strict";

	var Measurement = function(settings) {
		this._id = settings && "id" in settings ? settings.id : uuidv4();
		this._visible = settings && "visible" in settings ? settings.visible : true;
		this._highlighted = false;
		this._features = [];
		if (settings.features) {
			settings.features.forEach(function(json) {
				this._features.push(Feature.createFromJSON(json));
			}, this);
		}
	};

	Measurement.prototype.isMeasurement = true;
	Measurement._classMap = new Map();

	Measurement.prototype.getId = function() {
		return this._id;
	};

	Measurement.prototype.getVisible = function() {
		return this._visible;
	};

	Measurement.prototype.setVisible = function(value) {
		this._visible = value;
		return this;
	};

	Measurement.prototype.setHighlighted = function(value) {
		this._highlighted = value;
		return this;
	};

	Measurement.prototype.getHighlighted = function() {
		return this._highlighted;
	};

	Measurement.prototype.setFeatures = function(features) {
		this._features = features.map(function(feature) { return feature != null ? feature.clone() : null; });
		return this;
	};

	Measurement.prototype.getFeatures = function() {
		return this._features;
	};

	Measurement.createFromJSON = function(json) {
		if (json != null) {
			var MeasurementClass = Measurement._classMap.get(json.type);
			if (MeasurementClass) {
				return new MeasurementClass(json);
			}

			Log.warning("Unknown measurement type:", json.type);
		}
		return null;
	};

	Measurement.prototype.clone = function() {
		return Measurement.createFromJSON(this.toJSON());
	};

	return Measurement;
});
