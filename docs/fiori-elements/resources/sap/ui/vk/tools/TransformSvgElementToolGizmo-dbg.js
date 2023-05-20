/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TransformSvgElementToolGizmo
sap.ui.define([
	"./Gizmo",
	"./TransformSvgElementToolGizmoRenderer",
	"../svg/Element",
	"./ToolNodeSet"
], function(
	Gizmo,
	GizmoRenderer,
	Element,
	ToolNodeSet
) {
	"use strict";

	/**
	 * Constructor for a new TransformSvgElementToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.TransformSvgElementToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TransformSvgElementToolGizmo = Gizmo.extend("sap.ui.vk.tools.TransformSvgElementToolGizmo", /** @lends sap.ui.vk.tools.TransformSvgElementToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.TransformSvgElementTool} tool The tool to which this gizmo belongs.
	 */
	TransformSvgElementToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes = [];
		this._cursor = null;
		this.handleSelectionChanged();
		viewport.attachCameraChanged(this._handleChanged, this);
		if (viewport._viewStateManager) {
			viewport._viewStateManager.attachTransformationChanged(this._handleChanged, this);
		}
	};

	/**
	 * Hides gizmo.
	 */
	TransformSvgElementToolGizmo.prototype.hide = function() {
		if (this._cursor) {
			this._viewport.removeStyleClass(this._cursor);
			this._cursor = null;
		}
		if (this._viewport._viewStateManager) {
			this._viewport._viewStateManager.detachTransformationChanged(this._handleChanged, this);
		}
		this._viewport.detachCameraChanged(this._handleChanged, this);
		this._viewport = null;
		this._tool = null;
		this._nodes = [];
	};

	/**
	 * Rerenders the gizmo whenever the viewport changes.
	 */
	TransformSvgElementToolGizmo.prototype._handleChanged = function() {
		// var domRef = this.getDomRef();
		// if (domRef) {
		// 	domRef.setAttribute("viewBox", this._viewport._getViewBox().join(" "));
		// }
		if (this.getDomRef()) {
			this.rerender();
		}
	};

	/**
	 * Returns the positions of the gizmo handles for the specified node.
	 * @param {object} nodeInfo Information about the node.
	 * @param {float[]} matrix World node matrix
	 * @returns {float[]} Array of gizmo handles positions.
	 * @private
	 */
	TransformSvgElementToolGizmo.prototype._getHandleLocalPositions = function(nodeInfo, matrix) {
		var bbox = nodeInfo.bbox;
		var x1 = bbox.x;
		var x2 = bbox.x + bbox.width;
		var xc = (x1 + x2) * 0.5;

		var yc = bbox.y + bbox.height * 0.5;
		var dy = bbox.height * 0.5 * nodeInfo.ySign;
		var y1 = yc - dy;
		var y2 = yc + dy;
		var yr = y1 - 48 * nodeInfo.ySign / (this._viewport._camera.zoom * Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]));

		//   8
		// 7 0 1
		// 6   2
		// 5 4 3
		return [xc, y1, x2, y1, x2, yc, x2, y2, xc, y2, x1, y2, x1, yc, x1, y1, xc, yr, xc, yc];
	};

	/**
	 * Selects the specified handle of the specified gizmo
	 * @param {int} gizmoIndex Selected gizmo index
	 * @param {int} handleIndex Handle index of the selected gizmo
	 * @private
	 */
	TransformSvgElementToolGizmo.prototype._selectHandle = function(gizmoIndex, handleIndex) {
		this._gizmoIndex = gizmoIndex;
		this._handleIndex = handleIndex;

		// update mouse cursor
		var newCursor = null;
		if (gizmoIndex >= 0) {
			if (handleIndex >= 0) {
				if (handleIndex < 8) {
					var nodeInfo = this._nodes[gizmoIndex];
					var matrix = nodeInfo.node._matrixWorld();
					var angleIndex = Math.round(Math.atan2(matrix[2], matrix[3]) * 4 / Math.PI);
					newCursor = ["NSResize", "NESWResize", "EWResize", "NWSEResize"][(16 - angleIndex + handleIndex * nodeInfo.xSign * nodeInfo.ySign) % 4];
				} else {
					newCursor = "Rotate";
				}
			} else {
				newCursor = "Move";
			}
			// console.log(newCursor, handle.handleIndex);
			newCursor = "sapUiVkTransformationToolCursor" + newCursor;
		}
		if (this._cursor != newCursor) {
			if (this._cursor) {
				this._viewport.removeStyleClass(this._cursor);
			}
			if (newCursor) {
				this._viewport.addStyleClass(newCursor);
			}
			this._cursor = newCursor;
		}
	};

	// Returns matrix translation
	function getPosition(matrix) {
		return { x: matrix[4], y: matrix[5] };
	}

	// Calculates the scale of the matrix
	function getScale(matrix) {
		return {
			x: Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]),
			y: Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3])
		};
	}

	// Calculates rotation angle of the matrix
	function getAngle(matrix) {
		return Math.atan2(matrix[0], matrix[1]);
	}

	// Normalizes angle to [-π, π]
	function normalizeAngle(angle) {
		if (angle < -Math.PI) {
			return angle + Math.PI * 2;
		} else if (angle > Math.PI) {
			return angle - Math.PI * 2;
		}
		return angle;
	}

	// Calculates the sign of the y-axis of the root node
	function getYSign(node) {
		var root = null;
		while (node.parent) {
			root = node;
			node = node.parent;
		}
		return root && root.matrix[3] < 0 ? -1 : 1;
	}

	// Calculates the two-dimensional dot product
	function dot(v1x, v1y, v2x, v2y) {
		return v1x * v2x + v1y * v2y;
	}

	// Calculates the determinant of the matrix
	function det(matrix) {
		return matrix[0] * matrix[3] - matrix[1] * matrix[2];
	}

	/**
	 * Notifies the gizmo when the list of selected nodes needs to be updated.
	 * @private
	 */
	TransformSvgElementToolGizmo.prototype.handleSelectionChanged = function() {
		var viewStateManager = this._viewport ? this._viewport._viewStateManager : null;
		if (viewStateManager === null) {
			return;
		}

		var nodes = [];
		if (this._tool) {
			// fill the array of selected or outlined nodes
			viewStateManager[this._tool.getNodeSet() === ToolNodeSet.Highlight ? "enumerateSelection" : "enumerateOutlinedNodes"](function(node) {
				var matrix = node._matrixWorld();
				var xSign = det(matrix) < 0 ? -1 : 1;
				if (node.parent) {
					matrix = Element._multiplyMatrices(Element._invertMatrix(node.parent._matrixWorld()), matrix);
				}
				nodes.push({
					node: node, // node reference
					bbox: node._getBBox(), // oriented bounding box
					position: getPosition(matrix), // local position
					scale: getScale(matrix), // local scale
					angle: getAngle(matrix), // local rotation angle
					xSign: xSign, // x-axis sign
					ySign: getYSign(node) // y-axis sign
				});
			});
		}
		if (this._nodes.length === nodes.length && this._nodes.every(function(v, i) { return nodes[i].node === v.node; })) {
			return; // exit if the list of nodes has not changed
		}

		this._nodes = nodes;

		if (this.getDomRef()) {
			this.rerender();
		}
	};

	/**
	 * Begins transformation gesture.
	 * @private
	 */
	TransformSvgElementToolGizmo.prototype._beginGesture = function() {
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			nodeInfo.beginWorldMatrix = node._matrixWorld();
			nodeInfo.bbox = node._getBBox();
		});
		this._eventParameters = null;
	};

	// Calculates the scale factor of an object along the specified direction after moving the mouse
	function getScaleFactor(ax, ay, dirX, dirY, dx, dy) {
		var a = dot(ax, ay, dirX + dx, dirY + dy);
		var b = dot(ax, ay, dirX, dirY);
		return b !== 0 ? a / b : 1;
	}

	/**
	 * Updates transformation gesture.
	 * @param {float} dx Distance of horizontal mouse movement in world space coordinate system.
	 * @param {float} dy Distance of vertical mouse movement in world space coordinate system.
	 * @param {*} invertUniformMode Inverts the uniform mode of the tool.
	 */
	TransformSvgElementToolGizmo.prototype._update = function(dx, dy, invertUniformMode) {
		var hi = this._handleIndex;
		var ohi = hi >= 0 && hi < 8 ? (hi + 4) % 8 : 9;
		var sx = 1, sy = 1, ca = 1, sa = 0;
		var nodesProperties = [];
		var eventType;
		var event = { nodesProperties: nodesProperties };
		if (hi < 0) {// moving event
			eventType = "moving";
			event.x = dx;
			event.y = dy;
		} else {// rotating or scaling event
			var activeNode = this._nodes[this._gizmoIndex];
			var m = activeNode.beginWorldMatrix;
			var handleLocalPositions = this._getHandleLocalPositions(activeNode, m);
			if (hi < 8) {// scaling event
				eventType = "scaling";
				var p0x = handleLocalPositions[ohi * 2];
				var p0y = handleLocalPositions[ohi * 2 + 1];
				var p1x = handleLocalPositions[hi * 2];
				var p1y = handleLocalPositions[hi * 2 + 1];
				var dirX = dot(p1x - p0x, p1y - p0y, m[0], m[2]);
				var dirY = dot(p1x - p0x, p1y - p0y, m[1], m[3]);
				sx = hi === 0 || hi === 4 ? 1 : getScaleFactor(m[0], m[1], dirX, dirY, dx, dy); // scale x
				sy = hi === 2 || hi === 6 ? 1 : getScaleFactor(m[2], m[3], dirX, dirY, dx, dy); // scale y
				if (this._tool.getUniformScaleEnabled() ^ invertUniformMode) {// uniform scale is enabled
					if (hi === 0 || hi === 4) {
						sx = sy;
					} else if (hi === 2 || hi === 6) {
						sy = sx;
					} else {
						sx = sy = Math.max(sx, sy);
					}
				}
				event.x = sx;
				event.y = sy;
			} else {// rotating event
				eventType = "rotating";
				var rc = Element._transformPoint(handleLocalPositions[18], handleLocalPositions[19], m); // rotation center
				var rh = Element._transformPoint(handleLocalPositions[16], handleLocalPositions[17], m); // rotation handle
				var angle1 = Math.atan2(rh.x - rc.x, rh.y - rc.y);
				var angle2 = Math.atan2(rh.x - rc.x + dx, rh.y - rc.y + dy);
				var rotationAngle = normalizeAngle(angle2 - angle1);
				event.angle = rotationAngle;
				ca = Math.cos(rotationAngle);
				sa = Math.sin(rotationAngle);
			}
		}

		// transform selected nodes
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			var matrix = nodeInfo.beginWorldMatrix.slice();
			var nodesProperty = { node: node };
			if (hi < 0) {// translation
				matrix[4] += dx;
				matrix[5] += dy;
			} else {
				var handleLocalPositions = this._getHandleLocalPositions(nodeInfo, matrix);

				if (hi < 8) {// scale
					// pivot point
					var px = handleLocalPositions[ohi * 2];
					var py = handleLocalPositions[ohi * 2 + 1];

					matrix[4] += (px * matrix[0] + py * matrix[2]);
					matrix[5] += (px * matrix[1] + py * matrix[3]);
					matrix[0] *= sx;
					matrix[1] *= sx;
					matrix[2] *= sy;
					matrix[3] *= sy;
					matrix[4] -= (px * matrix[0] + py * matrix[2]);
					matrix[5] -= (px * matrix[1] + py * matrix[3]);
				} else {// rotation
					var rc = Element._transformPoint(handleLocalPositions[18], handleLocalPositions[19], matrix); // rotation center
					var matRotation = new Float32Array([ca, -sa, sa, ca, rc.x - (rc.x * ca + rc.y * sa), rc.y - (rc.x * -sa + rc.y * ca)]);
					matrix = Element._multiplyMatrices(matRotation, matrix);
				}
			}

			nodeInfo.xSign = det(matrix) < 0 ? -1 : 1;

			if (node.parent) {
				matrix = Element._multiplyMatrices(Element._invertMatrix(node.parent._matrixWorld()), matrix);
			}

			if (hi < 0) {
				var pos = getPosition(matrix);
				nodesProperty.x = pos.x - nodeInfo.position.x;
				nodesProperty.y = pos.y - nodeInfo.position.y;
			} else if (hi < 8) {
				var scale = getScale(matrix);
				nodesProperty.x = scale.x / nodeInfo.scale.x;
				nodesProperty.y = scale.y / nodeInfo.scale.y;
			} else {
				nodesProperty.angle = normalizeAngle(getAngle(matrix) - nodeInfo.angle);
			}

			node.setMatrix(matrix);
			nodesProperties.push(nodesProperty);
		}.bind(this));
		this.rerender();

		this._eventParameters = event;
		this._tool.fireEvent(eventType, event, true);
	};

	/**
	 * Ends transformation gesture.
	 * @private
	 */
	TransformSvgElementToolGizmo.prototype._endGesture = function() {
		if (this._eventParameters) {
			var hi = this._handleIndex;
			var eventType;
			if (hi < 0) {
				eventType = "moved";
			} else if (hi < 8) {
				eventType = "scaled";
			} else {
				eventType = "rotated";
			}
			this._tool.fireEvent(eventType, this._eventParameters, true);
		}
	};

	return TransformSvgElementToolGizmo;
});
