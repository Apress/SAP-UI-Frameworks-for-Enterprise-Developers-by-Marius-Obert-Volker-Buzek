/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Element class.
sap.ui.define([
	"../abgrToColor",
	"../cssColorToColor",
	"../NodeContentType",
	"sap/base/assert",
	"sap/base/util/uid"
], function(
	abgrToColor,
	cssColorToColor,
	NodeContentType,
	assert,
	uid
) {
	"use strict";
	var unknownCoordinateSpace = 10;
	var Element = function(parameters) {
		parameters = parameters || {};

		this.type = "Group";
		this.uid = uid();
		this.sid = parameters.sid || undefined;
		this.name = parameters.name || undefined;
		this.vMask = (1 | 0); // visibility mask
		this.sMask = (0 | 0); // selection mask
		this.matrix = new Float32Array(parameters.matrix || [1, 0, 0, 1, 0, 0]);
		this.parent = null;
		this.children = [];
		this.domRef = null;
		this.nodeContentType = NodeContentType.Regular;
		this.materialId = parameters.materialID;
		if (parameters.lineStyle) {
			this.lineStyle = parameters.lineStyle;
		}
		if (parameters.fillStyle) {
			this.fillStyle = parameters.fillStyle;
		}
		this.userData = parameters.subelement ? { skipIt: true } : {};
		this.classList = new Set();
	};

	function parseHexFirstOtherwiseCssConvert(c, defaultAlpha) {
		if (c === null || c === undefined) {
			return Float32Array([0.0, 0.0, 0.0, defaultAlpha]);
		}
		var rgba = c.match(/\w\w/g).map(function(x) { return parseInt(x, 16); });
		if (rgba.length == 4) {
			defaultAlpha = rgba[3] / 255;
		}
		if (rgba.length < 3 || isNaN(rgba[0] + rgba[1] + rgba[2] + defaultAlpha)) {
			c = cssColorToColor(c);
			return new Float32Array([c.red / 255, c.green / 255, c.blue / 255, c.alpha]);
		}
		return new Float32Array([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, defaultAlpha]);
	}

	function convertColor(c, defaultAlpha) {
		if (c) {
			if (typeof c === "string") {
				return parseHexFirstOtherwiseCssConvert(c, defaultAlpha);
			} else if (c.length === 4) {
				return new Float32Array(c);
			} else {
				return new Float32Array([c[0], c[1], c[2], defaultAlpha]);
			}
		}
		return new Float32Array([0, 0, 0, 0]);
	}

	Element.prototype.defaultFillAlpha = 0;

	Element.prototype.setFillStyle = function(fillStyle, invalidate) {
		if (fillStyle) {
			this.fillStyle = fillStyle;
			if (fillStyle.fillURL) {
				this.fillURL = fillStyle.fillURL;
			} else {
				this.fill = convertColor(fillStyle.colour, 1);
			}
		} else {
			this.fill = new Float32Array([0, 0, 0, 0]); // no fill
		}
		if (this._fillStyleId) {
			this.removeClass(this._fillStyleId);
			this._fillStyleId = null;
		}

		if (invalidate) {
			this.invalidate();
		}
	};

	Element.prototype.setLineStyle = function(lineStyle, invalidate) {
		if (lineStyle) {
			this.lineStyle = lineStyle;
			this.stroke = convertColor(lineStyle.colour, 1);
			this.strokeWidth = lineStyle.width || 1;
			this.coordinateSpace = lineStyle.coordinateSpace ? lineStyle.coordinateSpace : unknownCoordinateSpace;
			this.strokeDashArray = Element._convertDashes(lineStyle.dashes || [], this.strokeWidth);
			this.lineCap = lineStyle.linecap;
		} else {
			this.stroke = new Float32Array([0, 0, 0, 0]); // no stroke
			this.strokeWidth = 1;
			this.coordinateSpace = unknownCoordinateSpace;
			this.strokeDashArray = [];
		}
		if (this._lineStyleId) {
			this.removeClass(this._lineStyleId);
			this._lineStyleId = null;
		}

		if (invalidate) {
			this.invalidate();
		}
	};

	Element.prototype.setMaterial = function(material, invalidate) {
		material = material || {};

		// Update material only if original material id is matching.
		if (this.materialId === material.materialId) {
			this.setFillStyle(this.fillStyle);

			var lineStyle = this.lineStyle;
			if (lineStyle) {
				this.setLineStyle(lineStyle);
			} else {
				this.stroke = convertColor(material.lineColor, 1);
				this.strokeWidth = material.lineWidth !== undefined ? material.lineWidth : 1;
				this.strokeDashArray = (material.lineStyle && material.lineStyle.dashPattern) || [];
			}
		}

		// Propagate this call to children as they may use this material
		for (var i = 0, l = this.children.length; i < l; i++) {
			this.children[i].setMaterial(material);
		}

		if (invalidate) {
			this.invalidate();
		}
	};

	Element._convertDashes = function(dashes, strokeWidth) {
		// Convert DWG dash format into CSS dash format
		// DWG: n < 0 is space of length n, n > 0 is solid line length of n, n = 0 is a dot
		// CSS: sequence of visible, invisible intervals
		var dashArray = [];
		for (var i = 0; i < dashes.length; i++) {
			var n = dashes[i] * 10;
			if (n > 0) {
				// Line with length of n
				dashArray.push(n);
				dashArray.push(0);
			} else if (n < 0) {
				// Space with length of n
				dashArray.push(0);
				dashArray.push(-n);
			} else {
				// just a dot, simulated with a line with length equal to its thickness
				dashArray.push(strokeWidth);
				dashArray.push(strokeWidth);
			}
		}
		return dashArray;
	};

	Element._convertToDashes = function(dashArray, strokeWidth) {
		var dashes = [];
		for (var i = 0; i < dashArray.length; i += 2) {
			var a = dashArray[i];
			var b = dashArray[i + 1];
			if (a === strokeWidth && b === strokeWidth) {
				dashes.push(0);
			} else if (b === 0) {
				dashes.push(a * 0.1);
			} else if (a === 0) {
				dashes.push(b * -0.1);
			}
		}
		return dashes;
	};

	Element.prototype.add = function(element) {
		if (element.parent !== null) {
			element.parent.remove(element);
		}

		element.parent = this;
		this.children.push(element);

		// copy current selection state to child element
		element.sMask = this.sMask;
		if (this.highlightColor) {
			element.highlightColor = this.highlightColor;
		}

		var hasHostpotAncestor = this._hasHostpotAncestor();
		if (hasHostpotAncestor || this.nodeContentType === NodeContentType.Hotspot) {
			this._updateHotspotDescendants(hasHostpotAncestor ? null : this);
		}

		if (this.domRef) {
			element.traverse(function(child) {
				if (!child.domRef) {
					child.domRef = isSimpleGroupElement(child) ? child.parent.domRef : child._createDomElement();
				}
				if (child.domRef && child.parent.domRef && child.parent.domRef !== child.domRef && child.domRef.parentNode !== child.parent.domRef) {
					child.parent.domRef.appendChild(child.domRef);
				}
			});
		}

		return this;
	};

	Element.prototype.remove = function(element) {
		var index = this.children.indexOf(element);
		if (index !== -1) {
			if (element.domRef && this.domRef && element.domRef.parentNode === this.domRef) {
				this.domRef.removeChild(element.domRef);
			}
			element.parent = null;
			this.children.splice(index, 1);
		}

		return this;
	};

	Element.prototype.replace = function(element, newElement) {
		var index = this.children.indexOf(element);
		if (index !== -1) {
			element.parent = null;
			newElement.parent = this;
			this.children[index] = newElement;

			newElement.domRef = element.domRef;
			newElement.invalidate();
		}

		return this;
	};

	Element.prototype._vkPersistentId = function() {
		/* eslint-disable consistent-this */
		var obj2D = this;
		do {
			if (obj2D.sid) {
				return obj2D.sid;
			}
			obj2D = obj2D.parent;
		} while (obj2D);
		/* eslint-enable consistent-this */
		return null;
	};

	Element.prototype._vkGetNodeContentType = function() {
		return this.nodeContentType;
	};

	Element.prototype._updateHotspotDescendants = function(hotspotNode) {
		this.traverse(function(node) {
			if (node === hotspotNode) {
				return;
			}

			node.userData.skipIt = true;

			if (node._isGeometryNode()) {
				node.fill = node.stroke = new Float32Array([1, 1, 1, 1]);
				node._updateColor();
			} else if (node.domRef) {
				node.domRef.removeAttribute("filter");
				node.domRef.removeAttribute("opacity");
			}
		});
	};

	Element.prototype._initAsHotspot = function() {
		if (this._hasHostpotAncestor()) {
			return; // ignore this hotspot node because it has a hotspot ancestor
		}

		this._updateHotspotDescendants(this);

		if (this.domRef !== null) {
			if (this.domRef === (this.parent && this.parent.domRef)) {
				this.invalidate();
			} else {
				this._updateColor();
			}
		}
	};

	Element.prototype._vkSetNodeContentType = function(nodeContentType) {
		this.nodeContentType = nodeContentType;
		if (nodeContentType === NodeContentType.Hotspot) {
			this._initAsHotspot();
		}
	};

	Element.prototype.traverse = function(callback) {
		callback(this);

		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			children[i].traverse(callback);
		}
	};

	Element.prototype.traverseAncestors = function(callback) {
		var parent = this.parent;
		if (parent !== null) {
			callback(parent);
			parent.traverseAncestors(callback);
		}
	};

	Element.prototype.traverseVisible = function(callback, mask) {
		if (this.isVisible(mask)) {
			callback(this);

			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i].traverseVisible(callback, mask);
			}
		}
	};

	Element.prototype.setVisible = function(mask, visible) {
		if (!this.userData.skipIt) {
			if (visible) {
				this.vMask |= mask;
			} else {
				this.vMask &= ~mask;
			}
			if (this.domRef !== null) {
				if (this.parent && ((this.domRef === this.parent.domRef) ^ isSimpleGroupElement(this))) {
					this.invalidate();
				} else if (visible) {
					this.domRef.removeAttribute("display");
				} else {
					this.domRef.setAttribute("display", "none");
				}
			}
		}
	};

	Element.prototype.isVisible = function(mask) {
		return this.userData.skipIt || (this.vMask & mask) !== 0;
	};

	Element.prototype._updateColor = function(mask) {
		var domRef = this.domRef;
		if (domRef !== null) {
			if (this.nodeContentType === NodeContentType.Hotspot && !this._hasHostpotAncestor()) {
				domRef.setAttribute("filter", "url(#" + this.getHotspotEffectDef().name + ")");
				domRef.setAttribute("opacity", this._getHotspotOpacity());
			} else {
				var setAttributeFunc = domRef.setAttribute.bind(domRef);
				if (this.highlightColor || this.tintColor) {
					if (this._fillStyleId) {
						this.removeClass(this._fillStyleId);
					}
					this._setFillStyleAttributes(setAttributeFunc);

					if (this._lineStyleId) {
						this.removeClass(this._lineStyleId);
					}
					this._setLineStyleAttributes(setAttributeFunc);
				} else {
					if (this._fillStyleId) {
						this.addClass(this._fillStyleId);
						domRef.removeAttribute("fill");
					} else {
						this._setFillStyleAttributes(setAttributeFunc);
					}
					if (this._lineStyleId) {
						this.addClass(this._lineStyleId);
						domRef.removeAttribute("stroke");
						domRef.removeAttribute("stroke-width");
						domRef.removeAttribute("vector-effect");
						domRef.removeAttribute("stroke-dasharray");
					} else {
						this._setLineStyleAttributes(setAttributeFunc);
					}
				}
			}
		}
	};

	Element.prototype._getHotspotOpacity = function() {
		return this.highlightColor || this.customHotspotColor || this.hotspotColor ? 1 : 0;
	};

	Element._hotspotEffectName = function(color) {
		return "hotspot-effect-" + rgbaToCSS(color.red, color.green, color.blue, color.alpha);
	};

	Element.prototype.getHotspotEffectDef = function() {
		var color;
		if (this.highlightColor) {
			color = abgrToColor(this.highlightColor);
		} else {
			var hotspotColor = this.customHotspotColor || this.hotspotColor;
			if (hotspotColor) {
				color = typeof hotspotColor === "number" ? abgrToColor(hotspotColor) : cssColorToColor(hotspotColor);
			} else {
				color = { red: 0, green: 0, blue: 0, alpha: 0 };
			}
		}

		return {
			name: Element._hotspotEffectName(color),
			color: color
		};
	};

	Element.prototype.setSelected = function(mask, selected, highlightColor) {
		if (selected) {
			this.sMask |= mask;
			this.highlightColor = highlightColor;
		} else {
			this.sMask &= ~mask;
			delete this.highlightColor;
		}
		this._updateColor(mask);
	};

	Element.prototype.isSelected = function(mask) {
		return (this.sMask & mask) !== 0;
	};

	Element.prototype.setTintColor = function(mask, tintColor) {
		assert(this.nodeContentType !== NodeContentType.Hotspot && "setTintColor() method is not for hotspots, use setHotspotColor() method");
		this.tintColor = tintColor;
		this._updateColor(mask);
	};

	Element.prototype.getTintColor = function() {
		return this.tintColor;
	};

	Element.prototype.setHotspotColor = function(mask, color) {
		assert(this.nodeContentType === NodeContentType.Hotspot && "setHotspotColor() method is only for hotspots");
		this.hotspotColor = color;
		this._updateColor(mask);
	};

	Element.prototype.setCustomHotspotColor = function(mask, color) {
		assert(this.nodeContentType === NodeContentType.Hotspot && "setCustomHotspotColor() method is only for hotspots");
		this.customHotspotColor = color;
		this._updateColor(mask);
	};

	Element.prototype._isGeometryNode = function() {
		return this.constructor !== Element;
	};

	Element.prototype.setOpacity = function(opacity) {
		assert(this.nodeContentType !== NodeContentType.Hotspot && "setOpacity() method is not for hotspots");

		if (this._isGeometryNode()) {
			return;
		}

		this.opacity = opacity;

		if (this.domRef !== null) {
			if (this.parent && ((this.domRef === this.parent.domRef) ^ isSimpleGroupElement(this))) {
				this.invalidate();
			} else if (opacity !== undefined) {
				this.domRef.setAttribute("opacity", opacity);
			} else {
				this.domRef.removeAttribute("opacity");
			}
		}
	};

	function isIdentityMatrix(matrix) {
		return matrix[0] === 1 && matrix[1] === 0 && matrix[2] === 0 && matrix[3] === 1 && matrix[4] === 0 && matrix[5] === 0;
	}

	Element.prototype.setMatrix = function(matrix) {
		this.matrix.set(matrix);
		if (this.domRef !== null) {
			if (this.parent && ((this.domRef === this.parent.domRef) ^ isSimpleGroupElement(this))) {
				this.invalidate();
			} else if (!this.parent || this.domRef !== this.parent.domRef) {
				if (!isIdentityMatrix(matrix)) {
					this.domRef.setAttribute("transform", "matrix(" + this.matrix.join(",") + ")");
				} else {
					this.domRef.removeAttribute("transform");
				}
			}
		}
	};

	Element._multiplyMatrices = function(a, b) {
		var a11 = a[0], a12 = a[2], a13 = a[4];
		var a21 = a[1], a22 = a[3], a23 = a[5];

		var b11 = b[0], b12 = b[2], b13 = b[4];
		var b21 = b[1], b22 = b[3], b23 = b[5];

		return new Float32Array([
			a11 * b11 + a12 * b21,
			a21 * b11 + a22 * b21,
			a11 * b12 + a12 * b22,
			a21 * b12 + a22 * b22,
			a11 * b13 + a12 * b23 + a13,
			a21 * b13 + a22 * b23 + a23
		]);
	};

	Element._invertMatrix = function(m) {
		var m11 = m[0], m21 = m[1],
			m12 = m[2], m22 = m[3],
			m13 = m[4], m23 = m[5],
			det = m11 * m22 - m21 * m12;

		if (det === 0) {
			return new Float32Array([0, 0, 0, 0, 0, 0]);
		}

		var detInv = 1 / det;
		var te = new Float32Array(6);
		te[0] = m22 * detInv;
		te[1] = -m21 * detInv;
		te[2] = -m12 * detInv;
		te[3] = m11 * detInv;
		te[4] = (m23 * m12 - m22 * m13) * detInv;
		te[5] = (m21 * m13 - m23 * m11) * detInv;
		return te;
	};

	Element._decompose = function(matrix) {
		var sx = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]);
		var sy = Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]);
		var det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
		if (det < 0) {
			sy *= -1;
		}
		var m11 = matrix[0] / sx, m21 = matrix[1] / sx,
			m12 = matrix[2] / sy, m22 = matrix[3] / sy;

		var q, s;
		if (m11 + m22 + 1 > 0) {
			s = 0.5 / Math.sqrt(2 + m11 + m22);
			q = [0, 0, (m12 - m21) * s, 0.25 / s];
		} else {
			s = 2.0 * Math.sqrt(2 - m11 - m22);
			q = [0, 0, 0.25 * s, (m12 - m21) / s];
		}

		return {
			position: [matrix[4], matrix[5], 0],
			quaternion: q,
			scale: [sx, sy, 1]
		};
	};

	Element._compose = function(position, quaternion, scale) {
		var sx = scale[0], sy = scale[1];
		var x = quaternion[0], y = quaternion[1], z = -quaternion[2], w = quaternion[3];
		var xy = x * y, zz = z * z, wz = w * z;
		return new Float32Array([(1 - (y * y + zz) * 2) * sx, ((xy + wz) * 2) * sx, ((xy - wz) * 2) * sy, (1 - (x * x + zz) * 2) * sy, position[0], position[1]]);
	};

	Element._transformPoint = function(px, py, matrix) {
		return {
			x: px * matrix[0] + py * matrix[2] + matrix[4],
			y: px * matrix[1] + py * matrix[3] + matrix[5]
		};
	};

	Element.prototype._matrixWorld = function(matrixParent) {
		if (matrixParent !== undefined) {
			return Element._multiplyMatrices(matrixParent, this.matrix);
		} else {
			var parent = this.parent;
			var matrix = this.matrix;
			while (parent !== null) {
				matrix = Element._multiplyMatrices(parent.matrix, matrix);
				parent = parent.parent;
			}
			return matrix;
		}
	};

	function expandBoundingBoxWS(boundingBox, x, y, ex, ey) {
		boundingBox.min.x = Math.min(boundingBox.min.x, x - ex);
		boundingBox.min.y = Math.min(boundingBox.min.y, y - ey);
		boundingBox.max.x = Math.max(boundingBox.max.x, x + ex);
		boundingBox.max.y = Math.max(boundingBox.max.y, y + ey);
	}

	function sqr(a) {
		return a * a;
	}

	Element.prototype._expandBoundingBoxCE = function(boundingBox, matrixWorld, centerX, centerY, extX, extY) {
		expandBoundingBoxWS(boundingBox,
			centerX * matrixWorld[0] + centerY * matrixWorld[2] + matrixWorld[4],
			centerX * matrixWorld[1] + centerY * matrixWorld[3] + matrixWorld[5],
			Math.abs(extX * matrixWorld[0]) + Math.abs(extY * matrixWorld[2]),
			Math.abs(extX * matrixWorld[1]) + Math.abs(extY * matrixWorld[3]));
	};

	Element.prototype._expandBoundingBoxCR = function(boundingBox, matrixWorld, centerX, centerY, radiusX, radiusY) {
		expandBoundingBoxWS(boundingBox,
			centerX * matrixWorld[0] + centerY * matrixWorld[2] + matrixWorld[4],
			centerX * matrixWorld[1] + centerY * matrixWorld[3] + matrixWorld[5],
			Math.sqrt(sqr(radiusX * matrixWorld[0]) + sqr(radiusY * matrixWorld[2])),
			Math.sqrt(sqr(radiusX * matrixWorld[1]) + sqr(radiusY * matrixWorld[3])));
	};

	Element.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
	};

	Element.prototype._expandBoundingBoxRecursive = function(boundingBox, mask, matrixParent) {
		if (this.isVisible(mask)) {
			var matrixWorld = this._matrixWorld(matrixParent);
			this._expandBoundingBox(boundingBox, matrixWorld);
			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i]._expandBoundingBoxRecursive(boundingBox, mask, matrixWorld);
			}
		}
	};

	function transformBBox(bbox, matrix) {
		var ex = bbox.width * 0.5;
		var ey = bbox.height * 0.5;
		var cx = bbox.x + ex;
		var cy = bbox.y + ey;
		var tcx = cx * matrix[0] + cy * matrix[2] + matrix[4];
		var tcy = cx * matrix[1] + cy * matrix[3] + matrix[5];
		var tex = Math.abs(ex * matrix[0]) + Math.abs(ey * matrix[2]);
		var tey = Math.abs(ex * matrix[1]) + Math.abs(ey * matrix[3]);
		return { x: tcx - tex, y: tcy - tey, width: tex * 2, height: tey * 2 };
	}

	// This method returns aligned bounding box if the matrix is passed, or oriented bounding box if no matrix is passed
	Element.prototype._getBBox = function(matrix) {
		if (this.domRef) {
			var bbox;
			if (!this.parent || this.domRef !== this.parent.domRef) {
				bbox = this.domRef.getBBox();
				if (matrix && bbox) {// transform bounding box to parent coordinate system
					bbox = transformBBox(bbox, matrix);
				}
				return bbox;
			}

			var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
			for (var i = 0, l = this.children.length; i < l; i++) {
				var child = this.children[i];
				bbox = child._getBBox(matrix ? Element._multiplyMatrices(matrix, child.matrix) : child.matrix);
				if (bbox) {
					minX = Math.min(minX, bbox.x);
					minY = Math.min(minY, bbox.y);
					maxX = Math.max(maxX, bbox.x + bbox.width);
					maxY = Math.max(maxY, bbox.y + bbox.height);
				}
			}

			if (minX <= maxX && minY <= maxY) {
				return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
			}
		}

		return null; // returns null if the node has not been rendered yet or bounding box has not been calculated
	};

	function isSimpleGroupElement(element) {
		return element.parent !== null &&
			element.constructor === Element &&
			isIdentityMatrix(element.matrix) &&
			element.opacity === undefined &&
			(element.nodeContentType !== NodeContentType.Hotspot || element._hasHostpotAncestor()) && // not a hotspot
			element.vMask === 1;
	}

	Element.prototype._getSceneTreeElement = function() {
		/* eslint-disable consistent-this */
		var element = this;
		/* eslint-enable consistent-this */

		var parent = element.parent;
		while (parent) {
			if (parent.userData.closed || parent.nodeContentType !== NodeContentType.Regular) {
				element = parent;
			}
			parent = parent.parent;
		}

		while (element.userData.skipIt) {
			element = element.parent;
		}

		return element;
	};

	function checkIntersection(bbox, matrixWorld, rect) {
		function getMinMax(points, nx, ny) {
			var min, max;
			for (var i = 0, l = points.length; i < l; i++) {
				var p = points[i];
				var proj = nx * p.x + ny * p.y;
				if (i === 0 || min > proj) {
					min = proj;
				}
				if (i === 0 || max < proj) {
					max = proj;
				}
			}
			return { min: min, max: max };
		}

		var pointsA = [
			Element._transformPoint(bbox.x, bbox.y, matrixWorld),
			Element._transformPoint(bbox.x + bbox.width, bbox.y, matrixWorld),
			Element._transformPoint(bbox.x + bbox.width, bbox.y + bbox.height, matrixWorld),
			Element._transformPoint(bbox.x, bbox.y + bbox.height, matrixWorld)
		];
		var pointsB = [
			{ x: rect.x1, y: rect.y1 },
			{ x: rect.x2, y: rect.y1 },
			{ x: rect.x2, y: rect.y2 },
			{ x: rect.x1, y: rect.y2 }
		];
		var points = pointsA.concat(pointsB);
		for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
			var p1 = points[j];
			var p2 = points[i];
			var nx = p2.y - p1.y, ny = p1.x - p2.x;
			var a = getMinMax(pointsA, nx, ny);
			var b = getMinMax(pointsB, nx, ny);

			if (a.max < b.min || b.max < a.min) {
				return false;
			}
		}
		return true;
	}

	Element.prototype._findRectElementsRecursive = function(selection, rect, mask, matrixParent) {
		if (this.isVisible(mask)) {
			var matrixWorld = this._matrixWorld(matrixParent);
			if (this._isGeometryNode()) {
				var bbox = this._getBBox();
				if (bbox && checkIntersection(bbox, matrixWorld, rect)) {
					selection.add(this._getSceneTreeElement());
				}
			}

			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i]._findRectElementsRecursive(selection, rect, mask, matrixWorld);
			}
		}
	};

	Element.prototype.tagName = function() {
		return "g";
	};

	Element.prototype._setBaseAttributes = function(setAttributeFunc, mask) {
		setAttributeFunc("id", this.uid);

		if (this.nodeContentType === NodeContentType.Hotspot) {
			if (!this._hasHostpotAncestor()) {
				setAttributeFunc("filter", "url(#" + this.getHotspotEffectDef().name + ")");
				setAttributeFunc("opacity", this._getHotspotOpacity());
			}
		} else if (this.opacity !== undefined) {
			setAttributeFunc("opacity", this.opacity);
		}
		if (!isIdentityMatrix(this.matrix)) {
			setAttributeFunc("transform", "matrix(" + this.matrix.join(",") + ")");
		}
		if (!this.isVisible(mask)) {
			setAttributeFunc("display", "none");
		}

		if (!this._fillStyleId || !this.classList.has(this._fillStyleId)) {
			this._setFillStyleAttributes(setAttributeFunc);
		}
		if (!this._lineStyleId || !this.classList.has(this._lineStyleId)) {
			this._setLineStyleAttributes(setAttributeFunc);
		}

		if (this.classList.size) {
			setAttributeFunc("class", Array.from(this.classList).join(" "));
		}
	};

	Element.prototype._setSpecificAttributes = function(setAttributeFunc, domRef) {
	};

	Element.prototype._setFillStyleAttributes = function(setAttributeFunc) {
		if (this.fillURL !== undefined) {
			setAttributeFunc("fill", this.fillURL);
		} else if (this.fill !== undefined) {
			setAttributeFunc("fill", this._cssColor(this.fill));
		}
	};

	Element.prototype._setLineStyleAttributes = function(setAttributeFunc) {
		if (this.stroke !== undefined && this.stroke[3] > 0 && this.strokeWidth) {
			setAttributeFunc("stroke", this._cssColor(this.stroke));
			if (this.strokeWidth !== 1) {
				setAttributeFunc("stroke-width", this.strokeWidth);
			}
			if (this.strokeDashArray.length > 0) {
				setAttributeFunc("stroke-dasharray", this.strokeDashArray.join(" "));
			}
			if (this.lineCap != null) {
				setAttributeFunc("stroke-linecap", this.lineCap);
			}
			if (!this.coordinateSpace || this.coordinateSpace === unknownCoordinateSpace) {
				setAttributeFunc("vector-effect", "non-scaling-stroke");
			}
		}
	};

	Element.prototype.render = function(rm, mask, viewport) {
		var skipIt = isSimpleGroupElement(this), tagName;
		if (!skipIt) {
			tagName = this.tagName();
			rm.openStart(tagName);

			if (viewport && this._isGeometryNode()) {
				var fillStyleId = viewport._getFillStyleId(this);
				if (this._fillStyleId !== fillStyleId) {
					if (this._fillStyleId) {
						this.removeClass(this._fillStyleId);
					}
					this._fillStyleId = fillStyleId;
					if (fillStyleId) {
						this.addClass(this._fillStyleId);
					}
				}

				var lineStyleId = viewport._getLineStyleId(this);
				if (this._lineStyleId !== lineStyleId) {
					if (this._lineStyleId) {
						this.removeClass(this._lineStyleId);
					}
					this._lineStyleId = lineStyleId;
					if (lineStyleId) {
						this.addClass(this._lineStyleId);
					}
				}
			}

			var setAttributeFunc = rm.attr.bind(rm);
			this._setBaseAttributes(setAttributeFunc, mask);
			this._setSpecificAttributes(setAttributeFunc, null);

			rm.openEnd();

			if (this._renderContent) {
				this._renderContent(rm);
			}
		}

		var hotspots = [];
		this.children.forEach(function(element) {
			if (element.nodeContentType === NodeContentType.Hotspot) {
				hotspots.push(element);
			} else {
				element.render(rm, mask, viewport);
			}
		});

		// render hotspots after regular geometry
		hotspots.forEach(function(element) {
			element.render(rm, mask);
		});

		if (!skipIt) {
			rm.close(tagName);
		}
	};

	Element._svgNamespace = "http://www.w3.org/2000/svg";

	Element.prototype._createDomElement = function(channel) {
		var domRef = document.createElementNS(Element._svgNamespace, this.tagName());

		var setAttributeFunc = domRef.setAttribute.bind(domRef);
		this._setBaseAttributes(setAttributeFunc, 1 << channel);
		this._setSpecificAttributes(setAttributeFunc, domRef);

		if (this._createContent) {
			this._createContent(domRef);
		}

		return domRef;
	};

	function getNextDomRef(node, parentDomRef) {
		var domRef = node.domRef;
		if (domRef && domRef !== parentDomRef && domRef.parentNode === parentDomRef) {
			return domRef;
		}

		var children = node.children;
		for (var i = 0, l = children.length; i < l; i++) {
			domRef = getNextDomRef(children[i], parentDomRef);
			if (domRef !== null) {
				return domRef;
			}
		}

		return null;
	}

	Element.prototype._replaceParentDomRef = function(oldDomRef, newDomRef) {
		for (var i = 0, l = this.children.length; i < l; i++) {
			var child = this.children[i];
			if (child.domRef) {
				if (child.domRef === oldDomRef) {
					child.domRef = newDomRef;
					child._replaceParentDomRef(oldDomRef, newDomRef);
				} else if (child.domRef.parentNode === oldDomRef) {
					if (oldDomRef.parentNode === newDomRef) {
						newDomRef.insertBefore(child.domRef, oldDomRef);
					} else {
						newDomRef.appendChild(child.domRef);
					}
				}
			}
		}
	};

	Element.prototype.invalidate = function(channel) {
		var oldDomRef = this.domRef;
		if (oldDomRef !== null) {
			var parentDomRef = this.parent && this.parent.domRef;
			if (isSimpleGroupElement(this)) {
				if (oldDomRef !== parentDomRef) {// remove old group node from HTML
					this.domRef = parentDomRef;
					this._replaceParentDomRef(oldDomRef, this.domRef);
					oldDomRef.remove();
				}
			} else {
				this.domRef = this._createDomElement(channel);

				if (oldDomRef === parentDomRef) {
					parentDomRef.insertBefore(this.domRef, getNextDomRef(this, parentDomRef));
				} else if (parentDomRef) {
					parentDomRef.replaceChild(this.domRef, oldDomRef);
				}

				this._replaceParentDomRef(oldDomRef, this.domRef);
			}
		}
	};

	Element.prototype._setDomRef = function(domRef) {
		this.domRef = domRef;
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			var childDomRef = document.getElementById(child.uid);
			if (childDomRef === null && isSimpleGroupElement(child)) {
				childDomRef = domRef;
			}
			child._setDomRef(childDomRef);
		}
	};

	Element.prototype.getElementByProperty = function(name, value) {
		if (this[name] === value) {
			return this;
		}

		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			var element = children[i].getElementByProperty(name, value);
			if (element !== null) {
				return element;
			}
		}

		return null;
	};

	Element.prototype.getElementById = function(id) {
		return this.getElementByProperty("uid", id);
	};

	Element.prototype.copy = function(source, recursive) {
		this.name = source.name;
		this.matrix = source.matrix.slice();
		this.nodeContentType = source.nodeContentType;
		this.materialId = source.materialId;
		this.lineStyle = source.lineStyle;
		this.fillStyle = source.fillStyle;
		this.classList = new Set(source.classList);
		if (source.opacity !== undefined) {
			this.opacity = source.opacity;
		}
		if (source.tintColor !== undefined) {
			this.tintColor = source.tintColor;
		}
		if (source.hotspotColor) {
			this.hotspotColor = source.hotspotColor;
		}
		if (source.customHotspotColor) {
			this.customHotspotColor = source.customHotspotColor;
		}
		// if (source.highlightColor !== undefined) {
		// 	this.highlightColor = source.highlightColor;
		// }
		if (source.fillURL !== undefined) {
			this.fillURL = source.fillURL;
		}
		if (source.fill !== undefined) {
			this.fill = source.fill.slice();
		}
		if (source.stroke !== undefined) {
			this.stroke = source.stroke.slice();
		}
		if (source.strokeWidth !== undefined) {
			this.strokeWidth = source.strokeWidth;
		}
		if (source.coordinateSpace) {
			this.coordinateSpace = source.coordinateSpace;
		}
		if (source.lineCap !== undefined) {
			this.lineCap = source.lineCap;
		}
		if (source.strokeDashArray !== undefined) {
			this.strokeDashArray = source.strokeDashArray.slice();
		}

		if (source.userData.skipIt) {
			this.userData.skipIt = true;
		}

		if (recursive || recursive === undefined) {
			for (var i = 0, l = source.children.length; i < l; i++) {
				this.add(source.children[i].clone());
			}
		}

		return this;
	};

	Element.prototype.clone = function() {
		return new this.constructor().copy(this);
	};

	function lerp(a, b, f) {
		return a + (b - a) * f;
	}

	function rgbaToCSS(r, g, b, a) {
		var hex = ((r << 24) | (g << 16) | (b << 8) | (a * 255)) >>> 0;
		return "#" + hex.toString(16).padStart(8, "0");
	}

	function colorToCSS(c) {
		return rgbaToCSS(c[0] * 255, c[1] * 255, c[2] * 255, c[3]);
	}

	Element.prototype._cssColor = function(color) {
		var a = color[3];
		if (a === 0) {
			return "none";
		}

		var r = color[0] * 255;
		var g = color[1] * 255;
		var b = color[2] * 255;

		var tintColor = this.tintColor;
		if (tintColor) {
			tintColor = abgrToColor(tintColor);
			var ta = tintColor.alpha;
			if (ta > 0) {
				r = lerp(r, tintColor.red, ta);
				g = lerp(g, tintColor.green, ta);
				b = lerp(b, tintColor.blue, ta);
			}
		}

		var highlightColor = this.highlightColor;
		if (highlightColor) {
			highlightColor = abgrToColor(highlightColor);
			var ha = highlightColor.alpha;
			if (ha > 0) {
				r = lerp(r, highlightColor.red, ha);
				g = lerp(g, highlightColor.green, ha);
				b = lerp(b, highlightColor.blue, ha);
				a = lerp(a, ha, ha);
			}
		}

		return rgbaToCSS(r, g, b, a);
	};

	function getStyleIndex(style, styles) {
		function compareObjects(a, b) {
			return Object.entries(a).every(function(entry) { return b[entry[0]] === entry[1]; }) &&
				Object.entries(b).every(function(entry) { return a[entry[0]] === entry[1]; });
		}

		var index = styles.findIndex(function(s) { return compareObjects(s, style); });
		if (index < 0) {
			index = styles.length;
			styles.push(style);
		}
		return index;
	}

	Element.prototype._getParametricShape = function(fillStyles, lineStyles, textStyles) {
		var parametric = {};
		if (!isIdentityMatrix(this.matrix)) {
			var transform = Element._decompose(this.matrix);
			parametric.t = transform.position;
			parametric.r = transform.quaternion;
			parametric.s = transform.scale;
		}

		var isHotspot = this._hasHostpotAncestor();
		var parsedStrokeWidth = parseFloat(this.strokeWidth);
		var lineStyle = {
			width: typeof this.strokeWidth === "number" ? this.strokeWidth + "px" : this.strokeWidth,
			coordinateSpace: this.coordinateSpace
		};
		if (this.strokeDashArray && this.strokeDashArray.length > 0) {
			lineStyle.dashes = Element._convertToDashes(this.strokeDashArray, this.strokeWidth);
		}

		if (!isHotspot) {
			// Does what it was before 4cd4604c8958282ecabe7ccafdee6ee7cb676d32.
			// Combined fixes from Reid
			if (this.fill !== undefined) {
				parametric.fill = getStyleIndex({ colour: colorToCSS(this.fill) }, fillStyles);
			}
			if (this.stroke !== undefined && this.stroke[3] > 0 && parsedStrokeWidth > 0) {
				lineStyle.colour = colorToCSS(this.stroke);
				parametric.stroke = getStyleIndex(lineStyle, lineStyles);
			}
		} else if (this.stroke !== undefined && this.stroke[3] > 0 && parsedStrokeWidth > 0 && (parsedStrokeWidth !== 1 || this.strokeDashArray.length > 0)) {

			// In case of hotspots, no fillstyle, additional checks.
			parametric.stroke = getStyleIndex(lineStyle, lineStyles);
		}
		return parametric;
	};

	Element.prototype.getParametricContent = function(fillStyles, lineStyles, textStyles) {
		var shapes = [];
		this.children.forEach(function(child) {
			var shape = child._getParametricShape(fillStyles, lineStyles, textStyles);
			if (shape.type !== undefined) {
				shapes.push(shape);
			}
		});
		if (shapes.length === 0) {
			return null;
		}
		return shapes.length === 1 ? shapes[0] : { shapes: shapes };
	};

	Element.prototype._hasHostpotAncestor = function() {
		var ancestor = this.parent;
		while (ancestor) {
			if (ancestor.nodeContentType === NodeContentType.Hotspot) {
				return true;
			}
			ancestor = ancestor.parent;
		}

		return false;
	};

	/**
	 * The string given as "className" will be added to the "class" attribute of this element's root HTML element.
	 * @param {string} className the CSS class name to be added
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Element.prototype.addClass = function(className) {
		this.classList.add(className);
		if (this.domRef) {
			this.domRef.setAttribute("class", Array.from(this.classList).join(" "));
		}

		return this;
	};

	/**
	 * Removes the given class from the list of custom style classes that have been set previously.
	 * @param {string} className the CSS class name to be removed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Element.prototype.removeClass = function(className) {
		this.classList.delete(className);
		if (this.domRef) {
			if (this.classList.size) {
				this.domRef.setAttribute("class", Array.from(this.classList).join(" "));
			} else {
				this.domRef.removeAttribute("class");
			}
		}

		return this;
	};

	/**
	 * Returns true if the given style class is already set on the element.
	 *
	 * @param {string} className the class name to check for
	 * @returns {boolean} Whether the given style(s) has been set before
	 */
	Element.prototype.hasClass = function(className) {
		return this.classList.has(className);
	};

	/**
	 * Adds or removes the given class from the list of custom style classes set on this element's
	 * root HTML element. Class will be removed if it is currently present and will be added if not present.
	 * @param {*} className the CSS class name to be added or removed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Element.prototype.toggleClass = function(className) {
		if (this.hasClass(className)) {
			this.removeClass(className);
		} else {
			this.addClass(className);
		}

		return this;
	};

	return Element;
});
