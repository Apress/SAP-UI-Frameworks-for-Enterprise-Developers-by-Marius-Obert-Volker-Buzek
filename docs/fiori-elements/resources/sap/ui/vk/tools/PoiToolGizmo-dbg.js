/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.PoiToolGizmo
sap.ui.define([
	"../thirdparty/three",
	"./Gizmo",
	"./PoiToolGizmoRenderer",
	"./GizmoPlacementMode",
	"../NodeContentType",
	"sap/base/assert"
], function(
	THREE,
	Gizmo,
	PoiToolGizmoRenderer,
	GizmoPlacementMode,
	NodeContentType,
	assert
) {
	"use strict";

	var PoiToolGizmo = Gizmo.extend("sap.ui.vk.tools.PoiToolGizmo", /** @lends sap.ui.vk.tools.PoiToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	PoiToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._viewport = null;
		this._tool = null;

		this._placementMode = GizmoPlacementMode.ObjectCenter;
		this._nodes = [];
		this._poiIndex = -1;
		this._moveDelta = new THREE.Vector3();
		this._ignoreNonPoiNode = false;
	};

	PoiToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	PoiToolGizmo.prototype.setIgnoreNonPoiNode = function(value) {
		this._ignoreNonPoiNode = value;
	};

	PoiToolGizmo.prototype.getIgnoreNonPoiNode = function() {
		return this._ignoreNonPoiNode;
	};

	PoiToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes.length = 0;
		this._updateSelection(viewport._viewStateManager);
		var nodesProperties = this._getNodesProperties();
		this._tool.fireEvent("moving", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
	};

	PoiToolGizmo.prototype.hide = function() {
		this._cleanTempData();

		this._viewport = null;
		this._tool = null;
		this._poiIndex = -1;
	};

	PoiToolGizmo.prototype.getPOICount = function() {
		return this._nodes.length;
	};

	PoiToolGizmo.prototype.getPOI = function(i) {
		return i < this._nodes.length ? this._nodes[i].node : null;
	};

	PoiToolGizmo.prototype.selectPOI = function(poiIndex) {
		this._poiIndex = poiIndex;
		this._viewport.setShouldRenderFrame();
	};

	PoiToolGizmo.prototype.beginGesture = function() {
		this._moveDelta.setScalar(0);
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (this._ignoreNonPoiNode && node._vkGetNodeContentType() !== NodeContentType.Symbol) {
				return;
			}
			nodeInfo.origin = new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
			nodeInfo.matParentInv = new THREE.Matrix4();
			if (node.parent) {
				nodeInfo.matParentInv.copy(node.parent.matrixWorld).invert();
			}
		}, this);
	};

	PoiToolGizmo.prototype._getNodesProperties = function() {
		var nodesProperties = [];
		this._nodes.forEach(function(nodeInfo) {
			nodesProperties.push({ node: nodeInfo.node });
		});

		return nodesProperties;
	};

	PoiToolGizmo.prototype.endGesture = function() {
		this._tool.fireMoved({ x: this._moveDelta.x, y: this._moveDelta.y, z: this._moveDelta.z, nodesProperties: this._getNodesProperties() });
	};

	PoiToolGizmo.prototype._setOffset = function(offset) {
		if (this._tool.fireEvent("moving", { x: offset.x, y: offset.y, z: offset.z, nodesProperties: this._getNodesProperties() }, true)) {
			this._move(offset);
		}
	};

	PoiToolGizmo.prototype._move = function(offset) {
		this._moveDelta.copy(offset);

		var isPanoramicActivated = this._viewport._isPanoramicActivated();
		var cameraPosition = new THREE.Vector3().setFromMatrixPosition(this._viewport.getCamera().getCameraRef().matrixWorld);

		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (this._ignoreNonPoiNode && node._vkGetNodeContentType() !== NodeContentType.Symbol) {
				return;
			}
			if (!nodeInfo.origin) {
				nodeInfo.origin = new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
			}
			var pos = nodeInfo.origin.clone();
			if (isPanoramicActivated) {
				var cameraDistance = pos.distanceTo(cameraPosition);
				pos.add(offset).sub(cameraPosition).setLength(cameraDistance).add(cameraPosition);
			} else {
				pos.add(offset);
			}
			node.matrixWorld.setPosition(pos);
			node.matrix.multiplyMatrices(nodeInfo.matParentInv, node.matrixWorld);
			node.position.setFromMatrixPosition(node.matrix);
			node.matrixWorldNeedsUpdate = true;
		}, this);

		this._viewport.setShouldRenderFrame();
	};

	PoiToolGizmo.prototype.move = function(x, y, z) {
		this.beginGesture();
		this._move(new THREE.Vector3(x, y, z || 0));
	};

	PoiToolGizmo.prototype.handleSelectionChanged = function(event) {
		if (this._viewport) {
			this._updateSelection(this._viewport._viewStateManager);
			var nodesProperties = this._getNodesProperties();
			this._tool.fireEvent("moving", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
			this._poiIndex = -1;
		}
	};

	PoiToolGizmo.prototype._getSelectionCenter = function(target) {
		Gizmo.prototype._getSelectionCenter.apply(this, arguments);
		var center = new THREE.Vector3();
		if (this._nodes[0].node.userData.boundingBox) {
			this._nodes[0].node.userData.boundingBox.getCenter(center);
		} else {
			var boundingBox = new THREE.Box3();
			boundingBox.expandByObject(this._nodes[0].node);
			boundingBox.getCenter(center);
		}
		target.copy(center.applyMatrix4(this._nodes[0].node.matrixWorld));
	};

	PoiToolGizmo.prototype._updatePoiButtons = function() {
		this._tool.updateButtons();
	};

	PoiToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		this._updatePoiButtons();
	};

	return PoiToolGizmo;
});
