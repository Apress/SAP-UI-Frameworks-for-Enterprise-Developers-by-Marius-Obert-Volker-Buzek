/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./Measurement",
	"./MeasurementType"
], function(
	Measurement,
	MeasurementType
) {
	"use strict";

	/**
	 * Create a distance measurement object.
	 *
	 * @class
	 * @classdesc Provides functionality to render distance measurements.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Distance
	 * @since 1.101.0
	 */
	var Distance = function(settings) {
		Measurement.apply(this, arguments);

		// plain line or with arrows
		this._showArrows = settings && "showArrows" in settings ? settings.showArrows : true;

		// 1st point of SVG line (world space)
		this._point1 = settings && "point1" in settings ? settings.point1.slice() : [0, 0, 0];

		// 2nd point of SVG line (world space)
		this._point2 = settings && "point2" in settings ? settings.point2.slice() : [0, 0, 0];
	};

	Distance.prototype = Object.create(Measurement.prototype);
	Distance.prototype.constructor = Distance;
	Distance.prototype.isDistance = true;

	Measurement._classMap.set(MeasurementType.Distance, Distance);

	Distance.prototype.getShowArrows = function() {
		return this._showArrows;
	};

	Distance.prototype.setShowArrows = function(value) {
		this._showArrows = value;
		return this;
	};

	Distance.prototype.getPoint1 = function() {
		return this._point1;
	};

	Distance.prototype.setPoint1 = function(value) {
		var p = this._point1;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Distance.prototype.getPoint2 = function() {
		return this._point2;
	};

	Distance.prototype.setPoint2 = function(value) {
		var p = this._point2;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Distance.prototype.toString = function() {
		return "{ visible: " + this._visible +
			", showArrows: " + this._showArrows +
			", p1: [" + this._point1.join(", ") + "]" +
			", p2: [" + this._point2.join(", ") + "]" +
			" }";
	};

	Distance.prototype.getDistance = function() {
		var p1 = this._point1;
		var p2 = this._point2;
		var dx = p1[0] - p2[0];
		var dy = p1[1] - p2[1];
		var dz = p1[2] - p2[2];
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	};

	Distance.prototype.toJSON = function() {
		return {
			type: MeasurementType.Distance,
			id: this._id,
			visible: this._visible,
			showArrows: this._showArrows,
			point1: Array.from(this._point1),
			point2: Array.from(this._point2),
			features: this._features.map(function(feature) { return feature != null ? feature.toJSON() : null; })
		};
	};

	return Distance;
});
