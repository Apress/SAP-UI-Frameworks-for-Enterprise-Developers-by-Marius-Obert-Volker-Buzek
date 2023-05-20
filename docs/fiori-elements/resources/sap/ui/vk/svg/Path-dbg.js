/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Path class.
sap.ui.define([
	"sap/base/Log",
	"./Element"
], function(
	Log,
	Element
) {
	"use strict";

	var Path = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Path";
		this.segments = parameters.segments || [];

		this.setMaterial(parameters.material);
	};

	Path.prototype = Object.assign(Object.create(Element.prototype), { constructor: Path });

	Path.prototype.tagName = function() {
		return "path";
	};

	Path.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		if (this.domRef) {
			var bbox = this.domRef.getBBox();
			if (bbox) {
				this._expandBoundingBoxCE(boundingBox, matrixWorld, bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5, bbox.width * 0.5, bbox.height * 0.5);
				return;
			}
		}

		var strokeDelta = isNaN(this.strokeWidth) ? 0 : this.strokeWidth * 0.5;
		var x = 0, y = 0;
		for (var si = 0, sl = this.segments.length; si < sl; si++) {
			var segment = this.segments[si];
			var points = segment.points;
			var dim = segment.dimension || 2, i, l;
			switch (segment.type) {
				case "arc":
					if (segment.relative) {
						x += points[0];
						y += points[1];
					} else {
						x = points[0];
						y = points[1];
					}
					this._expandBoundingBoxCE(boundingBox, matrixWorld, x, y, strokeDelta, strokeDelta);
					break;
				case "move":
					x = points[0];
					y = points[1];
					this._expandBoundingBoxCE(boundingBox, matrixWorld, x, y, strokeDelta, strokeDelta);
					for (i = dim, l = points.length - 1; i < l; i += dim) {
						if (segment.relative) {
							x += points[i];
							y += points[i + 1];
						} else {
							x = points[i];
							y = points[i + 1];
						}
						this._expandBoundingBoxCE(boundingBox, matrixWorld, x, y, strokeDelta, strokeDelta);
					}
					break;
				case "line":
					for (i = 0, l = points.length - 1; i < l; i += dim) {
						if (segment.relative) {
							x += points[i];
							y += points[i + 1];
						} else {
							x = points[i];
							y = points[i + 1];
						}
						this._expandBoundingBoxCE(boundingBox, matrixWorld, x, y, strokeDelta, strokeDelta);
					}
					break;
				case "bezier":
					var degree = segment.degree || 2;
					for (i = 0, l = points.length - 1; i < l; i += dim) {
						if (segment.relative) {
							this._expandBoundingBoxCE(boundingBox, matrixWorld, x + points[i], y + points[i + 1], strokeDelta, strokeDelta);
							if ((i / dim) % degree === degree - 1) {
								x += points[i];
								y += points[i + 1];
							}
						} else {
							x = points[i];
							y = points[i + 1];
							this._expandBoundingBoxCE(boundingBox, matrixWorld, x, y, strokeDelta, strokeDelta);
						}
					}
					break;
				default:
					break;
			}
		}
	};

	function addBezierSegment(d, segment) {
		var i, l;
		var points = segment.points;
		switch (segment.degree || 2) {
			case 2:
				for (i = 0, l = points.length - 3; i < l; i += 4) {
					d.push(segment.relative ? "q" : "Q", points[i], points[i + 1], points[i + 2], points[i + 3]);
				}
				break;
			case 3:
				if (!segment.smooth) {
					for (i = 0, l = points.length - 5; i < l; i += 6) {
						d.push(segment.relative ? "c" : "C", points[i], points[i + 1], points[i + 2], points[i + 3], points[i + 4], points[i + 5]);
					}
				} else {
					for (i = 0, l = points.length - 3; i < l; i += 4) {
						d.push(segment.relative ? "s" : "S", points[i], points[i + 1], points[i + 2], points[i + 3]);
					}
				}
				break;
			default:
				Log.warning("Unsupported bezier segment degree:", segment.type);
				break;
		}
	}

	function addMove(d, segment) {
		var points = segment.points;
		d.push(segment.relative ? "m" : "M", points[0], points[1]);
		var dim = segment.dimension || 2;
		for (var i = dim, l = points.length - 1; i < l; i += dim) {
			d.push(segment.relative ? "l" : "L", points[i], points[i + 1]);
		}
	}

	function addLine(d, segment) {
		var points = segment.points;
		var dim = segment.dimension || 2;
		for (var i = 0, l = points.length - 1; i < l; i += dim) {
			d.push(segment.relative ? "l" : "L", points[i], points[i + 1]);
		}
	}

	function addArc(d, segment) {
		d.push(segment.relative ? "a" : "A", segment.major, segment.minor, "0", segment.short === false ? "1" : "0", segment.clockwise === false ? "0" : "1", segment.points[0], segment.points[1]);
	}

	Path.prototype._setSpecificAttributes = function(setAttributeFunc) {
		var d = [];
		this.segments.forEach(function(segment) {
			switch (segment.type) {
				case "move":
					addMove(d, segment);
					break;
				case "line":
					addLine(d, segment);
					break;
				case "close":
					d.push("Z");
					break;
				case "arc":
					addArc(d, segment);
					break;
				case "bezier":
					addBezierSegment(d, segment);
					break;
				default:
					Log.warning("Unsupported path segment type:", segment.type, JSON.stringify(segment));
					break;
			}
		});

		if (d.length > 0) {
			// console.log(this, d.join(" "));
			setAttributeFunc("d", d.join(" "));
		}
	};

	Path.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = Element.prototype._getParametricShape.call(this, fillStyles, lineStyles, textStyles);
		parametric.type = "path";
		parametric.segments = this.segments;
		return parametric;
	};

	Path.prototype.copy = function(source, recursive) {
		Element.prototype.copy.call(this, source, recursive);

		for (var i = 0, l = source.segments.length; i < l; i++) {
			var sourceSegment = source.segments[i];
			var segment = { type: sourceSegment.type };
			if (sourceSegment.points !== undefined) {
				segment.points = sourceSegment.points.slice();
			}
			if (sourceSegment.dimension !== undefined) {
				segment.dimension = sourceSegment.dimension;
			}
			if (sourceSegment.degree !== undefined) {
				segment.degree = sourceSegment.degree;
			}
			if (sourceSegment.smooth !== undefined) {
				segment.smooth = sourceSegment.smooth;
			}
			if (sourceSegment.relative !== undefined) {
				segment.relative = sourceSegment.relative;
			}
			if (sourceSegment.major !== undefined) {
				segment.major = sourceSegment.major;
			}
			if (sourceSegment.minor !== undefined) {
				segment.minor = sourceSegment.minor;
			}
			if (sourceSegment.short !== undefined) {
				segment.short = sourceSegment.short;
			}
			if (sourceSegment.clockwise !== undefined) {
				segment.clockwise = sourceSegment.clockwise;
			}
			this.segments.push(segment);
		}

		return this;
	};

	Path._extractSegmentsFromDomRef = function(domRef) {
		var segments = [];
		var d = domRef.getAttribute("d").split(" ");
		var i = 0;
		function nextElem() {
			return d[i++];
		}
		function nextFloat() {
			return parseFloat(nextElem());
		}
		for (var e = nextElem(); e !== undefined; e = nextElem()) {
			switch (e) {
				case "M":
					segments.push({
						type: "move",
						points: [nextFloat(), nextFloat()]
					});
					break;
				case "L":
					segments.push({
						type: "line",
						points: [nextFloat(), nextFloat()]
					});
					break;
				case "Q":
					segments.push({
						type: "bezier",
						degree: 2,
						relative: false,
						points: [nextFloat(), nextFloat(), nextFloat(), nextFloat()]
					});
					break;
				case "Z":
					segments.push({ type: "close" });
					break;
				default:
					Log.warning("Path.createFromDomRef: \"" + e + "\" path segment is not supported.");
					break;
			}
		}

		return segments;
	};

	return Path;
});
