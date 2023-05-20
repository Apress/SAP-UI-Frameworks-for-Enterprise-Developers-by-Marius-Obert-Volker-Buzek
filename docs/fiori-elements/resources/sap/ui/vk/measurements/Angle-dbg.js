/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./Measurement",
	"./MeasurementType",
	"./Utils"
], function(
	Measurement,
	MeasurementType,
	Utils
) {
	"use strict";

	/**
	 * Create an angle measurement object.
	 *
	 * @class
	 * @classdesc Provides functionality to render angle measurements.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Angle
	 * @since 1.101.0
	 */
	var Angle = function(settings) {
		Measurement.apply(this, arguments);

		// angle in radians
		this._angle = settings && "angle" in settings ? settings.angle : 0;

		// state 0 - only show first line, 1 - show everything but arc is transparent, 2 - all opaque
		this._state = settings && "state" in settings ? settings.state : 0;

		// negative radius scale means "outer" angle
		this._scale = settings && "scale" in settings ? settings.scale : 1;

		// 1st point of first edge (world space)
		this._point1 = settings && "point1" in settings ? settings.point1.slice() : [0, 0, 0];

		// 2nd point of first (world space)
		this._point2 = settings && "point2" in settings ? settings.point2.slice() : [0, 0, 0];

		// 1st point of second edge (world space)
		this._point3 = settings && "point3" in settings ? settings.point3.slice() : [0, 0, 0];

		// 2nd point of second edge (world space)
		this._point4 = settings && "point4" in settings ? settings.point4.slice() : [0, 0, 0];
	};

	Angle.prototype = Object.create(Measurement.prototype);
	Angle.prototype.constructor = Angle;
	Angle.prototype.isAngle = true;

	Measurement._classMap.set(MeasurementType.Angle, Angle);

	Angle.prototype.getAngle = function() {
		return this._angle;
	};

	Angle.prototype.setAngle = function(value) {
		this._angle = value;
		return this;
	};

	Angle.prototype.getState = function() {
		return this._state;
	};

	Angle.prototype.setState = function(value) {
		this._state = value;
		return this;
	};

	Angle.prototype.getPoint1 = function() {
		return this._point1;
	};

	Angle.prototype.setPoint1 = function(value) {
		var p = this._point1;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Angle.prototype.setPoint2 = function(value) {
		var p = this._point2;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Angle.prototype.setPoint3 = function(value) {
		var p = this._point3;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Angle.prototype.setPoint4 = function(value) {
		var p = this._point4;
		p[0] = value[0];
		p[1] = value[1];
		p[2] = value[2];
		return this;
	};

	Angle.prototype.getRadiusScale = function() {
		return this._scale;
	};

	Angle.prototype.setRadiusScale = function(value) {
		this._scale = value;
		return this;
	};

	// computes angle radius in screen space
	Angle.prototype.setAngleRadius = function(s1, e1, pivot, s2, e2, wp) {
		var edge1dir = Utils.computeEdgeDirection(e1, s1);
		var edge2dir = Utils.computeEdgeDirection(s2, e2);
		var wpDir = Utils.computeEdgeDirection(pivot, wp);

		var d1 = Utils.computePointToPointDistance(wp, pivot);
		var d2 = Utils.computePointToPointDistance(e2, pivot);
		var d2reverse = Utils.computePointToPointDistance(s2, pivot);
		if (d2reverse > d2) {
			d2 = d2reverse;
		}

		var scale = d2 > 0 ? d1 / d2 : 1;
		var a = Utils.angleBetweenVectors2D(edge1dir[0], edge1dir[1], wpDir[0], wpDir[1]);
		var b = Utils.angleBetweenVectors2D(edge1dir[0], edge1dir[1], edge2dir[0], edge2dir[1]);
		if (a < 0) {
			a += 2 * Math.PI;
		}
		if (b < 0) {
			b += 2 * Math.PI;
			if (a < b) {
				scale = -scale;
			}
		} else if (a > b) {
			scale = -scale;
		}

		return this.setRadiusScale(scale);
	};

	Angle.prototype.toString = function() {
		return "{ visible: " + this._visible +
			", angle: " + this._angle +
			", state: " + this._state +
			", scale: " + this._scale +
			", p1: [" + this._point1.join(", ") + "]" +
			", p2: [" + this._point2.join(", ") + "]" +
			", p3: [" + this._point3.join(", ") + "]" +
			", p4: [" + this._point4.join(", ") + "]" +
			" }";
	};

	Angle.prototype.isEdge1Defined = function() {
		var p1 = this._point1;
		var p2 = this._point2;
		var dx = p1[0] - p2[0];
		var dy = p1[1] - p2[1];
		var dz = p1[2] - p2[2];
		return Math.sqrt(dx * dx + dy * dy + dz * dz) > 1e-5;
	};

	Angle.prototype.isEdge2Defined = function() {
		var p1 = this._point3;
		var p2 = this._point4;
		var dx = p1[0] - p2[0];
		var dy = p1[1] - p2[1];
		var dz = p1[2] - p2[2];
		return Math.sqrt(dx * dx + dy * dy + dz * dz) > 1e-5;
	};

	// returns 18 floats [start1, end1, pivot1, pivot2, start2, end2]. pivot1==pivot2 in 2D, but can be different in 3D.
	Angle.prototype.getPoints = function() {
		var p1 = this._point1;
		var p2 = this._point2;
		var p3 = this._point3;
		var p4 = this._point4;

		var s1 = p1;
		var e1 = p2;
		var o1 = p2;
		var s2 = p2;
		var e2 = p2;
		var o2 = p2;

		var t;
		if ((Utils.computePointToPointDistance2(p1, p2) > 0) &&
			(Utils.computePointToPointDistance2(p3, p4) > 0)) {
			var closest = Utils.findClosestPointEdgeToEdge([p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]], [p3[0], p3[1], p3[2], p4[0], p4[1], p4[2]]);
			o1 = [closest[0], closest[1], closest[2]];
			o2 = [closest[3], closest[4], closest[5]];

			var d1 = Utils.computeEdgeDirection(p1, p2);
			var d2 = Utils.computeEdgeDirection(p3, p4);
			var ab = Utils.compareNormal(d1, d2, true) ? null : Utils.findClosestPointLineToLine(
				[p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]],
				[p3[0], p3[1], p3[2], p4[0], p4[1], p4[2]]);

			if (ab) {
				// intersection found
				t = Utils.computePointToPointDistance2(p1, o1) > Utils.computePointToPointDistance2(p2, o1);
				s1 = t ? p1 : p2;
				e1 = t ? p2 : p1;

				t = Utils.computePointToPointDistance2(p3, o2) > Utils.computePointToPointDistance2(p4, o2);
				s2 = t ? p4 : p3;
				e2 = t ? p3 : p4;
			} else if (Utils.compareNormal(d1, d2, false)) {
				// parallel / coincident -> find the closest point and make sure lines give 180 degrees (opposite directions), not 0 or 360
				s2 = p3;
				e2 = p4;
			} else {
				s2 = p4;
				e2 = p3;
			}
		}

		return [s1[0], s1[1], s1[2], e1[0], e1[1], e1[2], o1[0], o1[1], o1[2], o2[0], o2[1], o2[2], s2[0], s2[1], s2[2], e2[0], e2[1], e2[2]];
	};

	Angle.prototype.computeAngle = function() {
		var p1 = this._point1;
		var p2 = this._point2;
		var p3 = this._point3;
		var p4 = this._point4;

		if ((Utils.computePointToPointDistance2(p1, p2) > 0) &&
			(Utils.computePointToPointDistance2(p3, p4) > 0)) {
			var d1 = Utils.computeEdgeDirection(p2, p1);
			var d2 = Utils.computeEdgeDirection(p3, p4);
			var dot = Utils.dotProduct(d1, d2);
			this.setAngle(Math.acos(dot));
		} else {
			this.setAngle(0);
		}
	};

	Angle.prototype.toJSON = function() {
		return {
			type: MeasurementType.Angle,
			id: this._id,
			visible: this._visible,
			angle: this._angle,
			state: this._state,
			scale: this._scale,
			point1: Array.from(this._point1),
			point2: Array.from(this._point2),
			point3: Array.from(this._point3),
			point4: Array.from(this._point4),
			features: this._features.map(function(feature) { return feature != null ? feature.toJSON() : null; })
		};
	};

	return Angle;
});
