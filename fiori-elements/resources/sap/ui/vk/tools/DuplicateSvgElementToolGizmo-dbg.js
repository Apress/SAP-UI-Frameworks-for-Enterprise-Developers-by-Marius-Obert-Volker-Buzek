/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.DuplicateSvgElementToolGizmo
sap.ui.define([
	"./CreateParametricGizmo",
	"../svg/Element",
	"./ToolNodeSet"
], function(
	Gizmo,
	Element,
	ToolNodeSet
) {
	"use strict";

	/**
	 * Constructor for a new DuplicateSvgElementToolGizmo.
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
	 * @alias sap.ui.vk.tools.DuplicateSvgElementToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DuplicateSvgElementToolGizmo = Gizmo.extend("sap.ui.vk.tools.DuplicateSvgElementToolGizmo", /** @lends sap.ui.vk.tools.DuplicateSvgElementToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	/**
	 * Indicates that the gizmo is not rendered as part of the viewport HTML element.
	 * @returns {boolean} false
	 */
	DuplicateSvgElementToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	var DEFAULT_OFFSET_X = 30;
	var DEFAULT_OFFSET_Y = 30;

	/**
	 * Shows gizmo.
	 * @param {sap.ui.vk.svg.Viewport} viewport The viewport to which this tool and gizmo belongs.
	 * @param {sap.ui.vk.tools.DuplicateSvgElementTool} tool The tool to which this gizmo belongs.
	 */
	DuplicateSvgElementToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._updateNodeList();
	};

	/**
	 * Hides gizmo.
	 */
	DuplicateSvgElementToolGizmo.prototype.hide = function() {
		this._clearNodeList();
		this._viewport = null;
		this._tool = null;
	};

	/**
	 *  Clears duplicated node list.
	 */
	DuplicateSvgElementToolGizmo.prototype._clearNodeList = function() {
		if (this._nodes && this._nodes.length > 0) {
			this._nodes.forEach(function(nodeInfo) {
				var node = nodeInfo.node;
				node.parent.remove(node);
			});
		}
		this._nodes = [];
	};

	/**
	 *  Updates duplicated nodes.
	 */
	DuplicateSvgElementToolGizmo.prototype._updateNodeList = function() {
		this._clearNodeList();

		this._origin = null;

		var nodeList = this._tool.getNodeList();
		if (Array.isArray(nodeList) && nodeList.length > 0) {
			this.updateParentNode();
			this._parentMatrixWorldInv = Element._invertMatrix(this._root._matrixWorld());
			var bbox = nodeList[0]._getBBox(nodeList[0]._matrixWorld());
			this._origin = bbox ? { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.5 } : { x: 0, y: 0 };

			var rect = this._viewport._camera._transformRect({ x1: 0, y1: 0, x2: DEFAULT_OFFSET_X, y2: DEFAULT_OFFSET_Y });
			this._createNodes({ x: this._origin.x + rect.x2 - rect.x1, y: this._origin.y + rect.x2 - rect.x1 });
		}
	};

	/**
	 *  Creates duplicated nodes.
	 * @param {object} pos Mouse position in world space coordinate system.
	 */
	DuplicateSvgElementToolGizmo.prototype._createNodes = function(pos) {
		var matrixOffset = [1, 0, 0, 1, pos.x - this._origin.x, pos.y - this._origin.y];
		this._nodes = [];
		this._tool.getNodeList().forEach(function(node) {
			var newNode = node.clone();
			newNode.userData.duplicatedFrom = node.sid;
			var matrixWorld = node._matrixWorld();
			newNode.matrix.set(Element._multiplyMatrices(this._parentMatrixWorldInv, Element._multiplyMatrices(matrixOffset, matrixWorld)));
			this._root.add(newNode);
			this._nodes.push({
				node: newNode,
				matrixWorld: node._matrixWorld()
			});
		}.bind(this));
	};

	/**
	 * Moves duplicated nodes to the new mouse position.
	 * @param {object} pos Mouse position in world space coordinate system.
	 * @private
	 */
	DuplicateSvgElementToolGizmo.prototype._move = function(pos) {
		if (this._nodes && this._nodes.length > 0) {
			var matrixOffset = [1, 0, 0, 1, pos.x - this._origin.x, pos.y - this._origin.y];
			var parentMatrixWorldInv = this._parentMatrixWorldInv;
			this._nodes.forEach(function(nodeInfo) {
				var matrix = Element._multiplyMatrices(parentMatrixWorldInv, Element._multiplyMatrices(matrixOffset, nodeInfo.matrixWorld));
				nodeInfo.node.setMatrix(matrix);
			});
		}
	};

	/**
	 * Completes duplicated nodes creation.
	 * @param {object} pos Mouse position in world space coordinate system.
	 * @private
	 */
	DuplicateSvgElementToolGizmo.prototype._complete = function(pos) {
		this._move(pos);
		if (this._nodes && this._nodes.length > 0) {
			var nodes = this._nodes.map(function(nodeInfo) { return nodeInfo.node; });
			this._tool.fireNodesCreated({
				x: pos.x - this._origin.x,
				y: pos.y - this._origin.y,
				nodes: nodes,
				request: this._createRequest(nodes)
			});

			this._createNodes(pos);
		}
	};


	return DuplicateSvgElementToolGizmo;
});
