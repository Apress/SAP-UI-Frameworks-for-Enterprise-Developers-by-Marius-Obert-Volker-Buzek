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
	 * Create an area measurement object.
	 *
	 * @class
	 * @classdesc Provides functionality to render area measurements.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Area
	 * @since 1.101.0
	 */
	var Area = function(settings) {
		Measurement.apply(this, arguments);

		// area value - negative value means that this measurement is still being created
		this._area = settings && "area" in settings ? settings.area : 0;

		// label position - world space, 3 values
		this._position = settings && "position" in settings ? settings.position.slice() : [0, 0, 0];

		// points - world space, 3 values per point, all points are considered lying on the plane
		this._points = settings && "points" in settings ? settings.points.slice() : [];
	};

	Area.prototype = Object.create(Measurement.prototype);
	Area.prototype.constructor = Area;
	Area.prototype.isArea = true;

	Measurement._classMap.set(MeasurementType.Area, Area);

	Area.prototype.getPoints = function() {
		return this._points;
	};

	Area.prototype.getPosition = function() {
		return this._position;
	};

	Area.prototype.getArea = function() {
		return this._area;
	};

	Area.prototype.duplicateLastPoint = function() {
		var p = this._points;
		var i = p.length - 3;
		p.push(p[i]);
		p.push(p[i + 1]);
		p.push(p[i + 2]);
		this.updateContourPositionAndArea();
		return this;
	};

	Area.prototype.replaceLastPoints = function(removeCount, points, reverse) {
		if (removeCount) {
			this._points.splice(-removeCount * 3, removeCount * 3);
		}
		if (reverse) {
			for (var i = points.length - 3; i >= 0; i -= 3) {
				this._points.push(points[i], points[i + 1], points[i + 2]);
			}
		} else {
			this._points = this._points.concat(points);
		}

		this.updateContourPositionAndArea();
		return this;
	};

	Area.prototype.replaceLastPoint = function(value) {
		var p = this._points;
		var i = p.length - 3;
		p[i] = value[0];
		p[i + 1] = value[1];
		p[i + 2] = value[2];
		this.updateContourPositionAndArea();
		return this;
	};

	Area.prototype.deletePredLastPoints = function(count) {
		var p = this._points;
		var z = p.pop();
		var y = p.pop();
		var x = p.pop();
		var toRemove = (count - 1) * 3;
		if (toRemove > 0) {
			this._points.splice(-toRemove, toRemove);
		}

		var l = p.length;
		if (l >= 3) {
			p[l - 3] = x;
			p[l - 2] = y;
			p[l - 1] = z;
		}
		this.updateContourPositionAndArea();
		return this;
	};

	Area.prototype.toString = function() {
		return "{ visible: " + this._visible +
			", area: " + this._area +
			", position: [" + this._position.join(", ") + "]" +
			", points: [" + this._points.join(", ") + "]" +
			" }";
	};

	Area.prototype.updateContourPositionAndArea = function() {
		var p = this._points;
		var count3 = p.length;
		if (Utils.equalPoints(p, 0, p, count3 - 3)) {
			// if first and last are the same, then skip last point
			count3 -= 3;
		}

		var shoeLaceArea = 0;
		var centroidX = 0;
		var centroidY = 0;
		var t;
		for (var i = 0; i < count3; i += 3) {
			var j = i + 3;
			if (j >= count3) {
				j = 0;
			}
			shoeLaceArea += p[i] * p[j + 1] - p[i + 1] * p[j]; // the "shoelace formula" of area computation (2D only)
			t = (p[i] * p[j + 1] - p[j] * p[i + 1]);
			centroidX += (p[i] + p[j]) * t;
			centroidY += (p[i + 1] + p[j + 1]) * t;
		}

		shoeLaceArea *= 0.5;
		t = (count3 >= 9) ? (1 / (6 * shoeLaceArea)) : 0;
		this._position = [centroidX * t, centroidY * t, 0];
		this._area = (count3 < 9) ? null : -Math.abs(shoeLaceArea);
	};

	Area.prototype.setFromFace = function(face) {
		var val = face.getValue();
		var v = val.vertices;
		if (face.isClosedContour()) {
			this._points = Array.from(v);
			this.updateContourPositionAndArea();
		} else {
			var t = val.triangles;
			var area, avg, totalArea = 0;
			var centroid = [0, 0, 0];
			for (var i = 0, count = t.length; i < count; i += 3) {
				area = Utils.computeTriangleArea(v, t[i] * 3, t[i + 1] * 3, t[i + 2] * 3);
				avg = Utils.computeTriangleAverageCoordinate(v, t[i] * 3, t[i + 1] * 3, t[i + 2] * 3);
				centroid[0] += area * avg[0];
				centroid[1] += area * avg[1];
				centroid[2] += area * avg[2];
				totalArea += area;
			}

			this._area = totalArea;
			this._position = Utils.scalePoint(centroid, 1 / totalArea);
		}
	};

	Area.prototype.finalize = function() {
		var p = this._points;
		if (Utils.isClosedContour(p)) {
			// get rid of the last point if it is equal to the first (since it is a closed contour anyways)
			p.pop();
			p.pop();
			p.pop();
		}

		this._area = Math.abs(this._area);
	};

	// checks for contour self intersections
	Area.prototype.hasSelfIntersections = function() {
		return Utils.hasSelfIntersections(this._points, false);
	};

	// checks the last edge for contour self intersections
	Area.prototype.hasSelfIntersectionsLastEdge = function() {
		return Utils.hasSelfIntersectionsLastEdge(this._points);
	};

	Area.prototype.toJSON = function() {
		return {
			type: MeasurementType.Area,
			id: this._id,
			visible: this._visible,
			area: this._area,
			position: Array.from(this._position),
			points: Array.from(this._points),
			features: this._features.map(function(feature) { return feature != null ? feature.toJSON() : null; })
		};
	};

	return Area;
});
