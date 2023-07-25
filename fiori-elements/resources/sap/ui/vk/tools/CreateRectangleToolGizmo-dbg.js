/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateRectangleToolGizmo
sap.ui.define([
	"./CreateParametricGizmo",
	"../svg/Element",
	"../svg/Rectangle"
], function(
	Gizmo,
	Element,
	Rectangle
) {
	"use strict";

	/**
	 * Constructor for a new CreateRectangleToolGizmo.
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
	 * @alias sap.ui.vk.tools.CreateRectangleToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreateRectangleToolGizmo = Gizmo.extend("sap.ui.vk.tools.CreateRectangleToolGizmo", /** @lends sap.ui.vk.tools.CreateRectangleToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Indicates that the gizmo is not rendered as part of the viewport HTML element.
	 * @returns {boolean} false
	 */
	CreateRectangleToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.CreateRectangleTool} tool The tool to which this gizmo belongs.
	 */
	CreateRectangleToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;

		this.updateParentNode();
	};

	/**
	 * Hides gizmo.
	 */
	CreateRectangleToolGizmo.prototype.hide = function() {
		this._viewport = null;
		this._tool = null;
		this._root = null;
	};

	/**
	 * Adding a rectangle element at the specified position.
	 * @param {object} pos Position in world space coordinate system.
	 * @private
	 */
	CreateRectangleToolGizmo.prototype._startAdding = function(pos) {
		this._startPos = pos;
		var minRect = this._viewport._camera._transformRect({ x1: 0, y1: 0, x2: 1, y2: 1 });
		this._minWidth = minRect.x2 - minRect.x1; // 1px width
		this._minHeight = minRect.y2 - minRect.y1; // 1px height
		this._activeElement = new Rectangle({
			subelement: true,
			width: this._minWidth,
			height: this._minHeight,
			material: this._tool._material,
			lineStyle: this._tool._lineStyle,
			fillStyle: this._tool._fillStyle
		});

		var node = new Element({
			name: "Rectangle",
			matrix: [1, 0, 0, 1, pos.x, pos.y]
		});
		node.add(this._activeElement);
		this._root.add(node);
	};

	/**
	 * Updates the width and height of the added rectangle to the specified position.
	 * @param {object} pos Position in world space coordinate system.
	 * @param {boolean} invertUniformMode Inverts the uniform mode of the tool.
	 * @private
	 */
	CreateRectangleToolGizmo.prototype._update = function(pos, invertUniformMode) {
		var p1 = this._startPos;
		var activeElement = this._activeElement;
		if (activeElement) {
			var minX = Math.min(p1.x, pos.x);
			var minY = Math.min(p1.y, pos.y);
			var width = Math.max(Math.abs(p1.x - pos.x), this._minWidth);
			var height = Math.max(Math.abs(p1.y - pos.y), this._minHeight);
			if (this._tool.getUniformMode() ^ invertUniformMode) {// transform rectangle into square
				if (width < height) {
					width = height;
					if (pos.x < p1.x) {
						minX = p1.x - width;
					}
				} else {
					height = width;
					if (pos.y < p1.y) {
						minY = p1.y - height;
					}
				}
			}
			activeElement.parent.setMatrix([1, 0, 0, 1, minX, minY]);
			activeElement.width = width;
			activeElement.height = height;
			activeElement.invalidate();
		}
	};

	/**
	 * Finishes adding the rectangle element.
	 * @private
	 */
	CreateRectangleToolGizmo.prototype._stopAdding = function() {
		var activeElement = this._activeElement;
		this._activeElement = null;

		this._tool.fireCompleted({
			node: activeElement.parent,
			request: this._createRequest(activeElement.parent)
		});
	};

	return CreateRectangleToolGizmo;

});
