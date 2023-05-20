/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateEllipseToolGizmo
sap.ui.define([
	"./CreateParametricGizmo",
	"../svg/Element",
	"../svg/Ellipse"
], function(
	Gizmo,
	Element,
	Ellipse
) {
	"use strict";

	/**
	 * Constructor for a new CreateEllipseToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides UI to display tooltips
	 * @extends sap.ui.vk.tools.CreateParametricGizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.CreateEllipseToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreateEllipseToolGizmo = Gizmo.extend("sap.ui.vk.tools.CreateEllipseToolGizmo", /** @lends sap.ui.vk.tools.CreateEllipseToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Indicates that the gizmo is not rendered as part of the viewport HTML element.
	 * @returns {boolean} false
	 */
	CreateEllipseToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.CreateEllipseTool} tool The tool to which this gizmo belongs.
	 */
	CreateEllipseToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;

		this.updateParentNode();
	};

	/**
	 * Hides gizmo.
	 */
	CreateEllipseToolGizmo.prototype.hide = function() {
		this._viewport = null;
		this._tool = null;
		this._root = null;
	};

	// Calculates the node local matrix
	CreateEllipseToolGizmo.prototype._calculateNodeMatrix = function(dx, dy, posx, posy) {
		var matrix = Element._multiplyMatrices(this._invParentMatrix, [dx, dy, -dy, dx, posx, posy]);
		var det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
		if (det < 0) {// invert y-axis if matrix determinant < 0
			matrix[2] *= -1;
			matrix[3] *= -1;
		}
		if (matrix[3] < 0) {// rotate 180° if y-axis is pointing down
			matrix[0] *= -1;
			matrix[1] *= -1;
			matrix[2] *= -1;
			matrix[3] *= -1;
		}
		return matrix;
	};

	/**
	 * Adding an ellipse element at the specified position.
	 * @param {object} pos Position in world space coordinate system.
	 * @private
	 */
	CreateEllipseToolGizmo.prototype._startAdding = function(pos) {
		this._invParentMatrix = Element._invertMatrix(this._root._matrixWorld());
		this._startPos = pos;
		var minRect = this._viewport._camera._transformRect({ x1: 0, y1: 0, x2: 1, y2: 1 });
		this._minRadius = Math.max(minRect.x2 - minRect.x1, minRect.y2 - minRect.y1) * 0.5; // 0.5px
		this._activeElement = new Ellipse({
			subelement: true,
			major: this._minRadius,
			minor: this._minRadius,
			material: this._tool._material,
			lineStyle: this._tool._lineStyle,
			fillStyle: this._tool._fillStyle
		});

		var node = new Element({
			name: "Ellipse",
			matrix: this._calculateNodeMatrix(1, 0, pos.x, pos.y)
		});
		node.add(this._activeElement);
		this._root.add(node);
	};

	/**
	 * Updates the horizontal and vertical radius of the added ellipse to the specified position.
	 * @param {object} pos Position in world space coordinate system.
	 * @param {boolean} invertUniformMode Inverts the uniform mode of the tool.
	 * @private
	 */
	CreateEllipseToolGizmo.prototype._update = function(pos, invertUniformMode) {
		var p1 = this._startPos;
		var activeElement = this._activeElement;
		if (activeElement) {
			var dx = pos.x - p1.x;
			var dy = pos.y - p1.y;
			var len = Math.sqrt(dx * dx + dy * dy);
			var createCircle = this._tool.getUniformMode() ^ invertUniformMode;
			if (len === 0 || createCircle) {
				dx = 1;
				dy = 0;
			} else {
				dx /= len;
				dy /= len;
			}
			var rx = Math.max(len * 0.5, this._minRadius);
			var ry = createCircle ? rx : rx * 0.5;
			activeElement.rx = Math.max(rx, this._minRadius);
			activeElement.ry = Math.max(ry, this._minRadius);
			activeElement.parent.setMatrix(this._calculateNodeMatrix(dx, dy, (pos.x + p1.x) * 0.5, (pos.y + p1.y) * 0.5));
			activeElement.invalidate();
		}
	};

	/**
	 * Finishes adding the ellipse element.
	 * @private
	 */
	CreateEllipseToolGizmo.prototype._stopAdding = function() {
		var activeElement = this._activeElement;
		this._activeElement = null;

		this._tool.fireCompleted({
			node: activeElement.parent,
			request: this._createRequest(activeElement.parent)
		});
	};

	return CreateEllipseToolGizmo;

});
