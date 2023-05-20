/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/EventProvider",
	"sap/ui/core/Core",
	"sap/ui/core/format/NumberFormat",
	"../getResourceBundle",
	"./Measurement",
	"../glMatrix",
	"./Settings",
	"./Utils",
	"../uuidv4"
], function(
	Log,
	EventProvider,
	core,
	NumberFormat,
	getResourceBundle,
	Measurement,
	glMatrix,
	Settings,
	Utils,
	uuidv4
) {
	"use strict";

	var arrowLength = 6; // arrows have 6 pixel length, see "#arrow-start" style
	var lineExtensionLength = 16; // we want to make dashed line a bit bigger than required

	var svgNS = "http://www.w3.org/2000/svg";

	// Objects of this class represent a surface on which all the measurements are rendered,
	// including all the measurement tools.
	//
	// For each MeasurementSurface there is one <svg> element which is a child of the Viewport DOM
	// reference, and the size of the <svg> element is the same as the size of the Viewport.
	//
	// MeasurementSurface has two top level <g> elements. One contains all the measurements sorted
	// in the order of their creation. Another <g> element contains rendered representation of the
	// active measurement tool.
	var Surface = EventProvider.extend("sap.ui.vk.measurements.Surface", /** @lends sap.ui.vk.measurements.Surface */ {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function() {
			EventProvider.call(this);

			// Each viewport has its own <svg> element for rendering measurements.
			var svg = document.createElementNS(svgNS, "svg");
			svg._surface = this;
			svg.setAttribute("id", "measurement-surface-" + uuidv4());
			svg.classList.add("sapUiVizKitMeasurementSurface");
			svg.innerHTML =
				"<defs>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start-highlighted'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end-highlighted'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start0'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end0'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start1'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end1'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start2'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end2'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start3'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end3'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-start4'>" +
				"<polygon points='6 0, 6 4, 0 2'/>" +
				"</marker>" +
				"<marker markerWidth='6' markerHeight='4' refX='3' refY='2' orient='auto' id='arrow-end4'>" +
				"<polygon points='0 0, 6 2, 0 4'/>" +
				"</marker>" +
				"</defs>";

			var featuresDomRef = document.createElementNS(svgNS, "g");
			var measurementsDomRef = document.createElementNS(svgNS, "g");
			var measurementsUnderConstructionDomRef = document.createElementNS(svgNS, "g");
			// note: order is important, so "measurements" will be drawn on top of "features"
			svg.append(featuresDomRef, measurementsDomRef, measurementsUnderConstructionDomRef);

			this._svgDomRef = svg;
			this._featuresDomRef = featuresDomRef;
			this._measurementsDomRef = measurementsDomRef;
			this._measurementsUnderConstructionDomRef = measurementsUnderConstructionDomRef;

			this._features = [];
			this._measurements = [];
			this._measurementsUnderConstruction = [];

			this._settings = Settings.load();
			// Scale is not stored in localStorage. Each scene is loaded with the default scale 1.
			this._settings.scale = 1;
		}
	});

	Surface.prototype.destroy = function() {
		if (this._svgDomRef != null) {
			this._svgDomRef.remove();
			this._svgDomRef._surface = null;
		}
		this._svgDomRef = null;
		this._featuresDomRef = null;
		this._measurementsDomRef = null;
		this._measurementsUnderConstructionDomRef = null;
		this._features = null;
		this._measurements = null;
		this._measurementsUnderConstruction = null;
		this._settings = null;

		EventProvider.prototype.destroy(this);
	};

	Surface.prototype.getDomRef = function() {
		return this._svgDomRef;
	};

	Surface.prototype.addMeasurement = function(measurement) {
		this._addMeasurement(measurement, false);
		this.fireMeasurementsAdded({ measurements: [measurement] });
		return this;
	};

	Surface.prototype._addMeasurement = function(measurement, underConstruction) {
		var domRef;

		if (measurement.isDistance) {
			domRef = document.createElementNS(svgNS, "g");
			domRef.dataset.sapUiVkMeasurement = true;
			var line = document.createElementNS(svgNS, "line");
			var rect = document.createElementNS(svgNS, "rect");
			var text = document.createElementNS(svgNS, "text");
			text.appendChild(document.createTextNode(""));
			domRef.append(line, rect, text);
		} else if (measurement.isAngle) {
			domRef = document.createElementNS(svgNS, "g");
			domRef.dataset.sapUiVkMeasurement = true;
			var angleArc = document.createElementNS(svgNS, "path");
			var anglePath1 = document.createElementNS(svgNS, "path"); // yellow dashed line
			anglePath1.classList.add("sapUiVizKitMeasurementDashed");
			var anglePath2 = document.createElementNS(svgNS, "path"); // grey dotted line
			anglePath2.classList.add("sapUiVizKitMeasurementDotted");
			var anglePath3 = document.createElementNS(svgNS, "path"); // solid line
			var angleRect = document.createElementNS(svgNS, "rect");
			var angleText = document.createElementNS(svgNS, "text");
			angleText.appendChild(document.createTextNode(""));
			// note: "arc" element must be first, because of the measurement selection code that applies special styles to arrows
			domRef.append(angleArc, anglePath1, anglePath2, anglePath3, angleRect, angleText);
		} else if (measurement.isArea) {
			domRef = document.createElementNS(svgNS, "g");
			domRef.dataset.sapUiVkMeasurement = true;
			var faces = document.createElementNS(svgNS, "path");
			faces.classList.add("sapUiVizKitMeasurementFill");
			faces.setAttribute("opacity", 0.5);
			var edges = document.createElementNS(svgNS, "path");
			edges.classList.add("sapUiVizKitMeasurementStroke");
			edges.setAttribute("opacity", 0.5);

			var areaPath = document.createElementNS(svgNS, "path");
			areaPath.classList.add("sapUiVizKitMeasurementArea");
			var areaWarningPath = document.createElementNS(svgNS, "path");
			areaWarningPath.classList.add("sapUiVizKitMeasurementAreaEdgeIntersecting");

			var areaRect = document.createElementNS(svgNS, "rect");
			var areaText = document.createElementNS(svgNS, "text");
			areaText.appendChild(document.createTextNode(""));

			domRef.append(faces, edges, areaPath, areaWarningPath, areaRect, areaText);
		} else {
			throw new Error("Unknown measurement object");
		}

		if (underConstruction) {
			this._measurementsUnderConstruction.push(measurement);
			this._measurementsUnderConstructionDomRef.appendChild(domRef);
		} else {
			this._measurements.push(measurement);
			this._measurementsDomRef.appendChild(domRef);
		}

		domRef._measurement = measurement;

		return this;
	};

	Surface.prototype.removeMeasurement = function(measurement) {
		this.fireMeasurementsRemoving({ measurements: [measurement] });
		this._removeMeasurement(measurement, false);
		return this;
	};

	Surface.prototype._removeMeasurement = function(measurement, underConstruction) {
		var measurements;
		var measurementsDomRef;
		if (underConstruction) {
			measurements = this._measurementsUnderConstruction;
			measurementsDomRef = this._measurementsUnderConstructionDomRef;
		} else {
			measurements = this._measurements;
			measurementsDomRef = this._measurementsDomRef;
		}

		var index = measurements.indexOf(measurement);
		if (index >= 0) {
			measurements.splice(index, 1);
			measurementsDomRef.children[index].remove();
		}

		measurement.getFeatures().forEach(function(feature) {
			if (feature) {
				this.removeFeature(feature);
			}
		}, this);

		return this;
	};

	Surface.prototype.beginMeasurementConstruction = function(measurement) {
		this._addMeasurement(measurement, true);
		return this;
	};

	Surface.prototype.endMeasurementConstruction = function(measurement) {
		var index = this._measurementsUnderConstruction.indexOf(measurement);
		if (index >= 0) {
			this._measurementsUnderConstruction.splice(index, 1);
			this._measurements.push(measurement);
			this._measurementsDomRef.appendChild(this._measurementsUnderConstructionDomRef.children[index]);
			this.fireMeasurementsAdded({ measurements: [measurement] });
		}
		return this;
	};

	Surface.prototype.cancelMeasurementConstruction = function(measurement) {
		this._removeMeasurement(measurement, true);
		return this;
	};

	Surface.prototype.highlightMeasurement = function(measurement, highlight, viewport, camera) {
		var measurements = this._measurements;
		var index = measurements.indexOf(measurement);
		if (index < 0) {
			return;
		}

		measurement.setHighlighted(highlight);

		var domRef = this._measurementsDomRef.children[index];
		var line = domRef.children[0];

		var code = this.getMeasurementArrowColorCode();
		if (highlight) {
			if (code !== "") {
				domRef.classList.remove("sapUiVizKitMeasurement" + code);
			}
			domRef.classList.add("sapUiVizKitMeasurementHighlighted");

			if (measurement.isArea) {
				// see updateArea()
				domRef.children[2].removeAttribute("opacity");
			} else {
				line.setAttribute("marker-start", "url(#arrow-start-highlighted)");
				line.setAttribute("marker-end", "url(#arrow-end-highlighted)");
			}

			measurement.getFeatures().forEach(function(feature) {
				if (feature) {
					this.addFeature(feature);
					var index = this._features.indexOf(feature);
					if (index >= 0) {
						updateFeature(this._featuresDomRef.children[index], feature, viewport, camera, this._settings);
					}
				}
			}, this);
		} else {
			domRef.classList.remove("sapUiVizKitMeasurementHighlighted");
			if (code !== "") {
				domRef.classList.add("sapUiVizKitMeasurement" + code);
			}

			if (measurement.isArea) {
				// see updateArea()
				domRef.children[2].setAttribute("opacity", 0.5);
			} else {
				line.setAttribute("marker-start", "url(#arrow-start" + code + ")");
				line.setAttribute("marker-end", "url(#arrow-end" + code + ")");
			}

			measurement.getFeatures().forEach(function(feature) {
				if (feature) {
					this.removeFeature(feature);
				}
			}, this);
		}
	};

	Surface.prototype.getMeasurements = function() {
		return this._measurements;
	};

	Surface.prototype.getMeasurementById = function(id) {
		return this._measurements.find(function(measurement) {
			return measurement.getId() === id;
		});
	};

	Surface.prototype.addFeature = function(feature) {
		if (this._features.indexOf(feature) >= 0) {
			return this;
		}

		// Create a feature DOM reference.
		var domRef;

		if (feature.isVertex) {
			domRef = document.createElementNS(svgNS, "circle");
		} else if (feature.isEdge) {
			domRef = document.createElementNS(svgNS, "line");
		} else if (feature.isFace) {
			domRef = document.createElementNS(svgNS, "g");
			var faces = document.createElementNS(svgNS, "path");
			var edges = document.createElementNS(svgNS, "path");
			edges.classList.add("sapUiVizKitMeasurementContour");
			domRef.append(faces, edges);
		} else {
			throw new Error("Unknown measurement feature");
		}

		this._features.push(feature);
		this._featuresDomRef.append(domRef);

		return this;
	};

	Surface.prototype.removeFeature = function(feature) {
		var features = this._features;
		var index = features.indexOf(feature);
		if (index >= 0) {
			features.splice(index, 1);
			this._featuresDomRef.children[index].remove();
		}
		return this;
	};

	function updateFeature(featureDomRef, feature, viewport, camera, settings) {
		var func = null;
		if (feature.isVertex) {
			func = updateVertexDomRef;
		} else if (feature.isEdge) {
			func = updateEdgeDomRef;
		} else if (feature.isFace) {
			func = updateFaceDomRef;
		}

		if (func != null) {
			func(featureDomRef, feature, viewport, camera, settings);
		}
	}

	Surface.prototype.update = function(viewport, camera) {
		var i;
		var count;

		// Update measurements.
		var measurements = this._measurements;
		var measurementDomRefs = this._measurementsDomRef.children;
		for (var pass = 0; pass < 2; ++pass) {
			for (i = 0, count = measurements.length; i < count; ++i) {
				var measurement = measurements[i];
				var measurementDomRef = measurementDomRefs[i];

				if (measurement.getVisible()) {
					measurementDomRef.setAttribute("visibility", "visible");
				} else {
					measurementDomRef.setAttribute("visibility", "hidden");
					// No need to update the projection to screen as the object is hidden.
					continue;
				}

				var func = null;
				if (measurement.isDistance) {
					func = updateDistance;
				} else if (measurement.isAngle) {
					func = updateAngle;
				} else if (measurement.isArea) {
					func = updateArea;
				}

				if (func != null) {
					func(measurementDomRef, measurement, viewport, camera, this._settings);
				}
			}
			measurements = this._measurementsUnderConstruction;
			measurementDomRefs = this._measurementsUnderConstructionDomRef.children;
		}

		// Update features.
		var features = this._features;
		var featureDomRefs = this._featuresDomRef.children;
		for (i = 0, count = features.length; i < count; ++i) {
			updateFeature(featureDomRefs[i], features[i], viewport, camera, this._settings);
		}

		return this;
	};

	// A cache on formatters. Clears when the current localization changes.
	var formatters = new Map();

	core.attachLocalizationChanged(function() {
		formatters.clear();
	});

	function updateDistanceText(value, settings) {
		var precision = settings.precision;
		var units = settings.units;
		var scale = settings.scale * Utils.getUnitFactor(units);

		var formatter = formatters.get(precision);
		if (formatter == null) {
			formatter = NumberFormat.getFloatInstance({
				minFractionDigits: precision,
				maxFractionDigits: precision
			});
			formatters.set(precision, formatter);
		}

		var text = getResourceBundle().getText("MEASUREMENTS_DISTANCE_VALUE", [formatter.format(value * scale), Utils.translateUnits(units)]);
		return text;
	}

	function updateDomText(textLabel, textRectangle, text, mx, my, sp1) {
		textLabel.childNodes[0].data = text;

		// update text rectangle
		var width = textLabel.getBBox().width + 10;
		var height = 26; // todo: how to get the value from .less file? textRectangle.getAttribute("height");
		var xRectangle = mx - width * 0.5;
		var yRectangle = my - height * 0.5;
		if (sp1 && sp1.x >= xRectangle && sp1.x <= xRectangle + width && sp1.y >= yRectangle && sp1.y <= yRectangle + height) {
			my -= height;
			yRectangle -= height;
		}

		textRectangle.x.baseVal.value = xRectangle;
		textRectangle.y.baseVal.value = yRectangle;
		textRectangle.width.baseVal.value = width;

		// The position of the text label should be set last as it can be affected by the calculation of the position of
		// the rectangle.
		textLabel.setAttribute("x", mx);
		textLabel.setAttribute("y", my);
	}

	function assignClass(domRef, colorIndex, isHighlighted) {
		var measurementClassName = isHighlighted ? "sapUiVizKitMeasurementHighlighted" : "sapUiVizKitMeasurement" + colorIndex;
		if (!domRef.classList.contains(measurementClassName)) {
			domRef.classList.forEach(function(name, index, list) { list.remove(name); });
			domRef.classList.add(measurementClassName);
		}
	}

	function updateDistance(domRef, distance, viewport, camera, settings) {
		var colorIndex = getColorIndex(settings);
		var isHighlighted = distance.getHighlighted();
		assignClass(domRef, colorIndex, isHighlighted);

		var point1 = distance.getPoint1();
		var point2 = distance.getPoint2();

		var sp1 = viewport.projectToScreen(point1[0], point1[1], point1[2], camera);
		var sp2 = viewport.projectToScreen(point2[0], point2[1], point2[2], camera);

		var line = domRef.children[0];
		if (distance.getShowArrows()) {
			var x = sp2.x - sp1.x;
			var y = sp2.y - sp1.y;
			var d = Math.sqrt(x * x + y * y);
			if (Math.abs(d) < 1e-5) {
				domRef.setAttribute("visibility", "hidden");
				return this;
			}

			var dx = arrowLength * x / d;
			var dy = arrowLength * y / d;

			line.x1.baseVal.value = sp1.x + dx;
			line.y1.baseVal.value = sp1.y + dy;
			line.x2.baseVal.value = sp2.x - dx;
			line.y2.baseVal.value = sp2.y - dy;
			line.setAttribute("marker-start", isHighlighted ? "url(#arrow-start-highlighted)" : "url(#arrow-start" + colorIndex + ")");
			line.setAttribute("marker-end", isHighlighted ? "url(#arrow-end-highlighted)" : "url(#arrow-end" + colorIndex + ")");
		} else {
			line.x1.baseVal.value = sp1.x;
			line.y1.baseVal.value = sp1.y;
			line.x2.baseVal.value = sp2.x;
			line.y2.baseVal.value = sp2.y;
			line.removeAttribute("marker-start");
			line.removeAttribute("marker-end");
		}

		domRef.removeAttribute("visibility");
		var mx = (sp1.x + sp2.x) * 0.5;
		var my = (sp1.y + sp2.y) * 0.5;
		updateDomText(domRef.children[2], domRef.children[1], updateDistanceText(distance.getDistance(), settings), mx, my, sp1);

		return this;
	}

	function worldToScreen(viewport, camera, v, offset) {
		var o = offset | 0;
		var t = viewport.projectToScreen(v[o + 0], v[o + 1], v[o + 2], camera);
		return [t.x, t.y, 0];
	}

	function createTransformed(matrix, v, offset) {
		var o = offset | 0;
		var out = glMatrix.vec3.fromValues(v[o], v[o + 1], v[o + 2]);
		glMatrix.vec3.transformMat4(out, out, matrix);
		return out;
	}

	function planeToScreen(viewport, camera, matrix, v) {
		var o = createTransformed(matrix, v);
		return worldToScreen(viewport, camera, o);
	}

	function sampleCirclePoint(angle, radius) {
		return glMatrix.vec3.fromValues(radius * Math.cos(angle), radius * Math.sin(angle), 0);
	}

	function updateAngle(domRef, angle, viewport, camera, settings) {
		var colorIndex = getColorIndex(settings);
		var isHighlighted = angle.getHighlighted();
		assignClass(domRef, colorIndex, isHighlighted);

		var points = angle.getPoints();
		var closestPoint1 = [points[6], points[7], points[8]];
		var closestPoint2 = [points[9], points[10], points[11]];

		// build a 3D matrix that converts 2D circle to 3D
		var point1projected = Utils.pointMinusPoint(closestPoint1, closestPoint2);
		point1projected = Utils.pointMinusPoint(points, point1projected);
		var point2 = [points[15], points[16], points[17]];
		var upDirection = Utils.normalize(Utils.crossProduct(
			Utils.computeEdgeDirection(closestPoint2, point1projected),
			Utils.computeEdgeDirection(closestPoint2, point2)));

		var matrix = glMatrix.mat4.create();
		var quat = glMatrix.quat.create();
		glMatrix.quat.rotationTo(quat,
			glMatrix.vec3.fromValues(0, 0, 1),
			glMatrix.vec3.fromValues(upDirection[0], upDirection[1], upDirection[2]));

		glMatrix.mat4.fromRotationTranslation(matrix, quat, glMatrix.vec3.fromValues(closestPoint2[0], closestPoint2[1], closestPoint2[2]));

		// also create matrix that turns 3D measurement points into 2D plane
		var invMatrix = glMatrix.mat4.create();
		glMatrix.mat4.invert(invMatrix, matrix);
		var start1 = createTransformed(invMatrix, points, 0);
		var end1 = createTransformed(invMatrix, points, 3);
		var closest1 = createTransformed(invMatrix, closestPoint1);
		var closest2 = createTransformed(invMatrix, closestPoint2);
		var start2 = createTransformed(invMatrix, points, 12);
		var end2 = createTransformed(invMatrix, points, 15);

		// update first line
		var screenStart1 = planeToScreen(viewport, camera, matrix, start1);
		var screenEnd1 = planeToScreen(viewport, camera, matrix, end1);
		var path1 = "M" + screenStart1[0] + " " + screenStart1[1] + " L" + screenEnd1[0] + " " + screenEnd1[1];

		var dist1 = Utils.computePointToPointDistance(start1, end1);
		var dist2s = Utils.computePointToPointDistance(closest2, start2);
		var dist2e = Utils.computePointToPointDistance(closest2, end2);
		var dist2 = dist2s > dist2e ? dist2s : dist2e;
		var state = angle.getState();

		if (state > 0 && dist1 > 0 && dist2 > 0) {
			// update second line
			var screenStart2 = planeToScreen(viewport, camera, matrix, start2);
			var a = screenStart2;
			var b = screenEnd1;
			if (a[0] !== b[0] || a[1] !== b[1]) {
				path1 += " M" + a[0] + " " + a[1];
			}

			var screenEnd2 = planeToScreen(viewport, camera, matrix, end2);
			path1 += " L" + screenEnd2[0] + " " + screenEnd2[1];

			// update the arc
			var dir1 = Utils.computeEdgeDirection(end1, start1);
			var dir2 = Utils.computeEdgeDirection(start2, end2);
			var radiusScale = angle.getRadiusScale();
			var outer = radiusScale < 0;
			var radius = dist2 * Math.abs(radiusScale);
			var startAngle = Utils.angleBetweenVectors2D(1, 0, dir1[0], dir1[1]);
			var deltaAngle = Utils.angleBetweenVectors2D(dir1[0], dir1[1], dir2[0], dir2[1]);
			if (deltaAngle < 0) {
				// todo: angle of "-PI+0.0001" degrees should not have updated startAngle
				startAngle = Utils.angleBetweenVectors2D(dir1[0], dir1[1], -1, 0);
				deltaAngle = -deltaAngle;
			}

			var theta = startAngle + deltaAngle / 2;
			var angleValue = angle.getAngle();

			// make arc a bit shorter to account for 6-pixel arrows
			var oneDegree = Math.PI / 180;
			a = planeToScreen(viewport, camera, matrix, sampleCirclePoint(theta, radius));
			b = planeToScreen(viewport, camera, matrix, sampleCirclePoint(theta + oneDegree, radius));
			var beta = oneDegree * arrowLength / Utils.computePointToPointDistance(a, b);

			if (outer) {
				theta += Math.PI;
				angleValue = 2 * Math.PI - angleValue;
				deltaAngle = deltaAngle - 2 * Math.PI;
				beta = -beta;
			}

			// create an arc from up to 4 bezier curves
			// Note: the control points evaluation formula works precisely only on <90 degrees angles,
			// that's why 1, 2, 3 or 4 curves are necessary to cover 0..360 degrees range
			var bezierCount = Math.ceil(Math.abs(deltaAngle) / (Math.PI / 2));
			var sampleAngleStart = startAngle + beta;
			var sampleAngleStep = (deltaAngle - beta - beta) / bezierCount;
			var path3 = "";
			for (var bezierIndex = 0; bezierIndex < bezierCount; ++bezierIndex) {
				var sp = sampleCirclePoint(sampleAngleStart + sampleAngleStep * bezierIndex, radius);
				var ep = sampleCirclePoint(sampleAngleStart + sampleAngleStep * (1 + bezierIndex), radius);

				// compute cubic bezier control points
				var ax = sp[0];
				var ay = sp[1];
				var bx = ep[0];
				var by = ep[1];
				var q1 = (ax * ax) + (ay * ay);
				var q2 = q1 + (ax * bx) + (ay * by);
				var k2 = 4 / 3 * (Math.sqrt(2 * q1 * q2) - q2) / ((ax * by) - (ay * bx));
				var cp1 = [ax - (k2 * ay), ay + (k2 * ax), 0];
				var cp2 = [bx + (k2 * by), by - (k2 * bx), 0];

				// transform bezier points to 2D screen coordinates
				if (bezierIndex === 0) {
					sp = planeToScreen(viewport, camera, matrix, sp);
					path3 += " M" + sp[0] + " " + sp[1];
				}

				cp1 = planeToScreen(viewport, camera, matrix, cp1);
				cp2 = planeToScreen(viewport, camera, matrix, cp2);
				ep = planeToScreen(viewport, camera, matrix, ep);
				path3 += " C" + cp1[0] + " " + cp1[1] + " " + cp2[0] + " " + cp2[1] + " " + ep[0] + " " + ep[1];
			}

			var pathElement = domRef.children[0];
			pathElement.setAttribute("d", path3);
			pathElement.setAttribute("marker-start", isHighlighted ? "url(#arrow-start-highlighted)" : "url(#arrow-start" + colorIndex + ")");
			pathElement.setAttribute("marker-end", isHighlighted ? "url(#arrow-end-highlighted)" : "url(#arrow-end" + colorIndex + ")");
			pathElement.setAttribute("opacity", state === 1 ? 0.5 : 1);
			pathElement.removeAttribute("visibility");

			// update dashed lines
			pathElement = domRef.children[1];
			var screenClosest1 = planeToScreen(viewport, camera, matrix, closest1);
			var screenClosest2 = planeToScreen(viewport, camera, matrix, closest2);
			var differentScreenClosestPoints = screenClosest1[0] !== screenClosest2[0] || screenClosest1[1] !== screenClosest2[1];

			// projection line (or extension of first line)
			a = screenClosest2;
			b = planeToScreen(viewport, camera, matrix, sampleCirclePoint(startAngle, radius));
			var len = Utils.computePointToPointDistance(a, b) + lineExtensionLength;
			var dir = Utils.computeEdgeDirection(a, b);
			var np = Utils.pointPlusPoint(Utils.scalePoint(dir, len), a);
			var path2 = "";
			if (differentScreenClosestPoints) {
				// show the full line
				path2 = "M" + a[0] + " " + a[1] + " L" + np[0] + " " + np[1];
			} else if (Utils.computeEdgeToPointDistance2(screenStart1, screenEnd1, np) > 0.001) {
				// only show the extension part
				path2 = "M" + screenStart1[0] + " " + screenStart1[1] + " L" + np[0] + " " + np[1];
			}

			// extension of second line
			a = screenClosest2;
			b = planeToScreen(viewport, camera, matrix, sampleCirclePoint(startAngle + deltaAngle, radius));
			len = Utils.computePointToPointDistance(a, b) + lineExtensionLength;
			dir = Utils.computeEdgeDirection(a, b);
			np = Utils.pointPlusPoint(Utils.scalePoint(dir, len), a);
			if (Utils.computeEdgeToPointDistance2(screenStart2, screenEnd2, np) > 0.001) {
				// only show the extension part
				path2 += "M" + screenEnd2[0] + " " + screenEnd2[1] + " L" + np[0] + " " + np[1];
			}

			// BEGIN TEMP: sample 3d arc
			// for (var zi = 0, zc = 200; zi <= zc; ++zi) {
			// 	var zt = planeToScreen(viewport, camera, matrix, sampleCirclePoint(startAngle + deltaAngle * zi / zc, radius));
			// 	path2 += ((zi === 0) ? "M" : "L") + zt[0] + " " + zt[1];
			// }
			// END TEMP: sample 3d arc

			if (path2.length > 0) {
				pathElement.setAttribute("d", path2);
				pathElement.removeAttribute("visibility");
			} else {
				pathElement.setAttribute("d", "");
				pathElement.setAttribute("visibility", "hidden");
			}

			// update dotted lines
			pathElement = domRef.children[2];
			if (differentScreenClosestPoints) {
				a = screenClosest1;
				b = screenClosest2;
				pathElement.setAttribute("d", "M" + a[0] + " " + a[1] + " L" + b[0] + " " + b[1]);
				pathElement.removeAttribute("visibility");
			} else {
				pathElement.setAttribute("d", "");
				pathElement.setAttribute("visibility", "hidden");
			}

			// update text
			var precision = settings.precision;
			var formatter = formatters.get(precision);
			if (formatter == null) {
				formatter = NumberFormat.getFloatInstance({
					minFractionDigits: precision,
					maxFractionDigits: precision
				});
				formatters.set(precision, formatter);
			}

			var text = getResourceBundle().getText("MEASUREMENTS_ANGLE_VALUE", formatter.format(180 * angleValue / Math.PI));
			a = planeToScreen(viewport, camera, matrix, sampleCirclePoint(theta, radius));
			updateDomText(domRef.children[5], domRef.children[4], text, a[0], a[1], null);
			domRef.children[3].removeAttribute("visibility");
			domRef.children[4].removeAttribute("visibility");
			domRef.children[5].removeAttribute("visibility");
		} else {
			domRef.children[0].setAttribute("visibility", "hidden");
			domRef.children[1].setAttribute("visibility", "hidden");
			domRef.children[2].setAttribute("visibility", "hidden");
			domRef.children[4].setAttribute("visibility", "hidden");
			domRef.children[5].setAttribute("visibility", "hidden");
		}

		var pathElementMain = domRef.children[3];
		pathElementMain.setAttribute("d", path1);
		assignClass(pathElementMain, "StrokeColor" + colorIndex, false);
		pathElementMain.removeAttribute("visibility");

		return this;
	}

	function updateAreaText(value, settings) {
		var precision = settings.precision;
		var units = settings.units;
		var scale = settings.scale * Utils.getUnitFactor(units);

		var formatter = formatters.get(precision);
		if (formatter == null) {
			formatter = NumberFormat.getFloatInstance({
				minFractionDigits: precision,
				maxFractionDigits: precision
			});
			formatters.set(precision, formatter);
		}

		var text = getResourceBundle().getText("MEASUREMENTS_AREA_VALUE", [formatter.format(value * scale * scale), Utils.translateUnits(units, "2")]);
		return text;
	}

	function updateArea(domRef, area, viewport, camera, settings) {
		var colorIndex = getColorIndex(settings);
		var isHighlighted = area.getHighlighted();
		assignClass(domRef, colorIndex, isHighlighted);

		var areaValue = area.getArea();
		var beingCreated = areaValue && areaValue < 0;
		if (beingCreated) {
			areaValue = -areaValue;
		}

		var p = area.getPoints();
		var pathRef = domRef.children[2];
		var count3 = p ? p.length : 0;
		if (count3 >= 6) {
			var path = "";
			for (var i = 0; i < count3; i += 3) {
				var pp = worldToScreen(viewport, camera, p, i);
				path += (i === 0 ? "M" : " L") + pp[0] + " " + pp[1];
			}
			if (!beingCreated) {
				path += " Z";
			}
			pathRef.setAttribute("d", path);
			pathRef.removeAttribute("visibility");
		} else {
			pathRef.setAttribute("visibility", "hidden");
		}

		// visual hints in case of self-intersections
		pathRef.classList.remove("sapUiVizKitMeasurementAreaSelfIntersecting");
		var hasIntersections = area.hasSelfIntersections();
		if (hasIntersections) {
			pathRef.classList.add("sapUiVizKitMeasurementAreaSelfIntersecting");
		}

		// also highlight the last edge, as it will prevent used from adding a point
		var warningPath = domRef.children[3];
		if (count3 >= 6 && area.hasSelfIntersectionsLastEdge()) {
			var p1 = worldToScreen(viewport, camera, p, count3 - 6);
			var p2 = worldToScreen(viewport, camera, p, count3 - 3);
			warningPath.setAttribute("d", "M" + p1[0] + " " + p1[1] + " L" + p2[0] + " " + p2[1]);
			warningPath.removeAttribute("visibility");
		} else {
			warningPath.setAttribute("visibility", "hidden");
		}

		// draw face
		var features = area.getFeatures();
		if (features && Array.isArray(features) && features.length === 1 && features[0].isFace) {
			// we have a 3D face to draw
			updateFaceDomRef(domRef, features[0], viewport, camera, null);
		} else {
			// set paths to empty strings, because visibility may be changed outside. See highlightMeasurement()
			domRef.children[0].setAttribute("d", "");
			domRef.children[1].setAttribute("d", "");
		}

		if (isHighlighted || beingCreated) {
			pathRef.removeAttribute("opacity"); // show 2D contour in full opacity
		} else {
			pathRef.setAttribute("opacity", 0.5);
		}

		// update text
		var textRectangle = domRef.children[4];
		var textLabel = domRef.children[5];
		if (areaValue && !hasIntersections) {
			var avg = worldToScreen(viewport, camera, area.getPosition());
			updateDomText(textLabel, textRectangle, updateAreaText(areaValue, settings), avg[0], avg[1], null);
			textLabel.removeAttribute("visibility");
			textRectangle.removeAttribute("visibility");
		} else {
			textLabel.setAttribute("visibility", "hidden");
			textRectangle.setAttribute("visibility", "hidden");
		}

		return this;
	}

	function updateVertexDomRef(domRef, vertex, viewport, camera, _settings) {
		var wP = vertex.getValue();
		var sP = viewport.projectToScreen(wP[0], wP[1], wP[2], camera);
		domRef.cx.baseVal.value = sP.x;
		domRef.cy.baseVal.value = sP.y;
		return this;
	}

	function updateEdgeDomRef(domRef, edge, viewport, camera, _settings) {
		var edgeW = edge.getValue();
		var sP = viewport.projectToScreen(edgeW[0], edgeW[1], edgeW[2], camera);
		domRef.x1.baseVal.value = sP.x;
		domRef.y1.baseVal.value = sP.y;
		sP = viewport.projectToScreen(edgeW[3], edgeW[4], edgeW[5], camera);
		domRef.x2.baseVal.value = sP.x;
		domRef.y2.baseVal.value = sP.y;
		return this;
	}

	function updateFaceDomRef(domRef, face, viewport, camera, _settings) {
		var data = face.getValue();
		var v = data.vertices;
		var t = data.triangles;
		var e = data.edges;
		var o;
		var sP;
		var i;
		var count;
		var path;

		// draw triangles
		path = "";
		for (i = 0, count = t ? t.length : 0; i < count; i += 3) {
			o = t[i] * 3;
			sP = viewport.projectToScreen(v[o], v[o + 1], v[o + 2], camera);
			path += "M" + sP.x + " " + sP.y;
			o = t[i + 1] * 3;
			sP = viewport.projectToScreen(v[o], v[o + 1], v[o + 2], camera);
			path += " L" + sP.x + " " + sP.y;
			o = t[i + 2] * 3;
			sP = viewport.projectToScreen(v[o], v[o + 1], v[o + 2], camera);
			path += " L" + sP.x + " " + sP.y + " Z ";
		}
		domRef.children[0].setAttribute("d", path);

		// draw edges
		path = "";
		for (i = 0, count = e ? e.length : 0; i < count; i += 2) {
			o = e[i] * 3;
			sP = viewport.projectToScreen(v[o], v[o + 1], v[o + 2], camera);
			path += "M" + sP.x + " " + sP.y;
			o = e[i + 1] * 3;
			sP = viewport.projectToScreen(v[o], v[o + 1], v[o + 2], camera);
			path += " L" + sP.x + " " + sP.y;
		}
		domRef.children[1].setAttribute("d", path);

		return this;
	}

	/**
	 * Find a measurement under the mouse cursor.
	 *
	 * @param {int} x The <code>x</code> coordinate of the mouse cursor.
	 * @param {int} y The <code>y</code> coordinate of the mouse cursor.
	 * @returns {SVGGElement|null} A DOM reference of the measurement object under the mouse cursor
	 *     or <code>null</code>.
	 * @public
	 */
	Surface.prototype.hitTest = function(x, y) {
		var domRef = this._svgDomRef;
		var rect = domRef.getBoundingClientRect();
		var domRefStyle = domRef.style;
		// Allow the svg elements inside the measurement surface to be returned from document.elementFromPoint().
		domRefStyle.pointerEvents = "auto";
		var element = document.elementFromPoint(x + rect.x, y + rect.y);
		domRefStyle.pointerEvents = "none";
		var parentElement = element && element.parentElement;
		return parentElement != null && parentElement.dataset.sapUiVkMeasurement === "true" ? parentElement : null;
	};

	/**
	 * Updates the settings that are used for drawing measurements, like color, precision, etc.
	 *
	 * @param {object} settings The settings structure. Some fields may be omitted.
	 * @returns {this} Returns <code>this</code> to allow method chaining.
	 * @public
	 */
	Surface.prototype.updateSettings = function(settings) {
		Object.assign(this._settings, settings);
		return this;
	};

	Surface.prototype.getScale = function() {
		return this._settings.scale;
	};

	Surface.prototype.setScale = function(value) {
		if (value !== this._settings.scale) {
			var parameters = {
				oldScale: this._settings.scale,
				newScale: value
			};
			this._settings.scale = value;
			this.fireScaleChanged(parameters);
		}
		return this;
	};

	function getColorIndex(settings) {
		return settings.color;
	}

	/**
	 * Returns svg arrow style code based on current measurement color setting.
	 *
	 * @returns {string} The color code, which can be an empty string (but not null / undefined).
	 * @private
	 */
	Surface.prototype.getMeasurementArrowColorCode = function() {
		return getColorIndex(this._settings);
	};

	/**
	 * Serializes measurements into JSON object.
	 * @param {sap.ui.vk.measurements.Measurement[]} [measurements] A optional list of measurements to export into JSON.
	 * @returns {object} JSON object.
	 */
	Surface.prototype.toJSON = function(measurements) {
		var measurementsToExport = Array.isArray(measurements) ? measurements : this._measurements;
		return {
			scale: this._settings.scale,
			measurements: measurementsToExport.map(function(measurement) { return measurement.toJSON(); })
		};
	};

	/**
	 * Deserializes measurements from JSON object.
	 * @param {object} json JSON object.
	 * @param {boolean} [removeAllExisting=true] An optional indicator to remove all the existing
	 *                                           measurements before importing new ones.
	 */
	Surface.prototype.fromJSON = function(json, removeAllExisting) {
		if ("scale" in json) {
			if (json.scale > 0) {
				this.setScale(json.scale);
			} else {
				Log.error("Incorrect 'scale' value: " + json.scale);
			}
		}

		var measurementsToAdd = json.measurements.map(Measurement.createFromJSON);
		var measurementsToRemove;

		if (removeAllExisting) {
			measurementsToRemove = this._measurements.slice();
		} else {
			// Find measurements that will be overridden by newly imported measurements.
			measurementsToRemove = json.measurements
				.map(function(item) { return item.id; })
				.map(this.getMeasurementById, this)
				.filter(function(measurement) { return measurement != null; });
		}

		if (measurementsToRemove.length > 0) {
			this.fireMeasurementsRemoving({ measurements: measurementsToRemove });
			measurementsToRemove.forEach(function(measurement) { this._removeMeasurement(measurement, false); }, this);
		}

		if (measurementsToAdd.length > 0) {
			measurementsToAdd.forEach(function(measurement) { this._addMeasurement(measurement, false); }, this);
			this.fireMeasurementsAdded({ measurements: measurementsToAdd });
		}
	};

	var Events = {
		measurementsAdded: "measurementsAdded",
		measurementsRemoving: "measurementsRemoving",
		scaleChanged: "scaleChanged"
	};

	/**
	 * The 'measurementsAdded' event is fired after the measurements are fully constructed and added to the Surface.
	 *
	 * @name sap.ui.vk.measurements.Surface#measurementsAdded
	 * @event
	 * @param {sap.ui.vk.measurements.Measurement[]} measurements An array of added measurements.
	 * @private
	 */

	/**
	 * The 'measurementsRemoving' event is fired when the measurements are about to be removed from the Surface.
	 *
	 * @name sap.ui.vk.measurements.Surface#measurementsRemoving
	 * @event
	 * @param {sap.ui.vk.measurements.Measurement[]} measurements An array of measurements to be removed.
	 * @private
	 */

	/**
	 * The 'scaleChanged' event is fired when the surface's scale factor changes.
	 *
	 * @name sap.ui.vk.measurements.Surface#scaleChanged
	 * @event
	 * @param {float} oldScale The old value of the scale factor.
	 * @param {float} newScale The new value of the scale factor.
	 * @private
	 */

	Surface.prototype.attachMeasurementsAdded = function(data, func, listener) {
		return this.attachEvent(Events.measurementsAdded, data, func, listener);
	};

	Surface.prototype.detachMeasurementsAdded = function(func, listener) {
		return this.detachEvent(Events.measurementsAdded, func, listener);
	};

	Surface.prototype.fireMeasurementsAdded = function(parameters) {
		return this.fireEvent(Events.measurementsAdded, parameters);
	};

	Surface.prototype.attachMeasurementsRemoving = function(data, func, listener) {
		return this.attachEvent(Events.measurementsRemoving, data, func, listener);
	};

	Surface.prototype.detachMeasurementsRemoving = function(func, listener) {
		return this.detachEvent(Events.measurementsRemoving, func, listener);
	};

	Surface.prototype.fireMeasurementsRemoving = function(parameters) {
		return this.fireEvent(Events.measurementsRemoving, parameters);
	};

	Surface.prototype.attachScaleChanged = function(data, func, listener) {
		return this.attachEvent(Events.scaleChanged, data, func, listener);
	};

	Surface.prototype.detachScaleChanged = function(func, listener) {
		return this.detachEvent(Events.scaleChanged, func, listener);
	};

	Surface.prototype.fireScaleChanged = function(parameters) {
		return this.fireEvent(Events.scaleChanged, parameters);
	};

	return Surface;
});
