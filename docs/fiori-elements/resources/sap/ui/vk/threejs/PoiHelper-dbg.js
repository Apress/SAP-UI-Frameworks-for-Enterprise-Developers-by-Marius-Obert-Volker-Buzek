/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides PoiHelper class.

sap.ui.define([
	"../NodeContentType",
	"../TransformationMatrix",
	"../thirdparty/three",
	"sap/base/util/uid"
], function(
	NodeContentType,
	TransformationMatrix,
	THREE,
	uid
) {
	"use strict";

	var PoiHelper = function() {
		this._currentSceneId = null;
	};

	PoiHelper.prototype.createPOI = function(currentScene, poiSceneId, viewport, poiPosition, poiScale, nodeInfo) {
		viewport = viewport._implementation || viewport;
		poiScale = poiScale || { x: 1, y: 1 };
		nodeInfo = nodeInfo || {};
		nodeInfo.sid = nodeInfo.sid || uid();
		if (!nodeInfo.transform) {
			var viewportRect = viewport.getDomRef().getBoundingClientRect();
			var screenX = poiPosition.x - viewportRect.left;
			var screenY = poiPosition.y - viewportRect.top;
			var hit = viewport.hitTest(screenX, screenY, { ignoreOverlay: true });
			if (!hit) {
				return Promise.reject();
			}

			var matrix = new THREE.Matrix4().compose(hit.point, viewport._getNativeCamera().quaternion, new THREE.Vector3(Number(poiScale.x), Number(poiScale.y), 1));

			// To get closest entity nodes as references.
			nodeInfo.transform = TransformationMatrix.convertTo4x3(matrix.elements);
			var parameters = {
				picked: hit.object ? [hit.object] : []
			};
			viewport.fireNodesPicked(parameters);
			if (parameters.picked && parameters.picked.length > 0) {
				var nodePicked = parameters.picked[0];
				if (nodePicked && nodePicked.userData) {
					nodeInfo.referenceNode = parameters.picked[0].userData.nodeId;
				}
			} else {
				nodeInfo.referenceNode = hit.object.userData.nodeId;
			}
		} else if (nodeInfo.transform.length === 16) {
			nodeInfo.transform = TransformationMatrix.convertTo4x3(nodeInfo.transform);
		}
		nodeInfo.transformType = nodeInfo.transformType || "BILLBOARD_VIEW";

		if (this._currentSceneId) {
			currentScene.getSceneBuilder()._resetCurrentScene(this._currentSceneId);
		}

		var loader = viewport._cdsLoader;
		if (loader) {
			var skipLowLODRendering = loader.getSkipLowLODRendering();
			// disable skip low LOD rendering when load POI
			loader.setSkipLowLODRendering(true);
			var nodeHierarchy = currentScene.getDefaultNodeHierarchy();
			var symbolNode = nodeHierarchy.createNode(null, "Sample POI", null, NodeContentType.Symbol, nodeInfo);
			var view = viewport.getCurrentView() || currentScene.getViews()[0];
			view.updateNodeInfos([{ target: symbolNode, visible: true }]);
			return loader.loadTransientScene(poiSceneId, symbolNode).then(function(transitionNode) {
				loader.setSkipLowLODRendering(skipLowLODRendering);
				viewport.setShouldRenderFrame();
				var nodeRef = transitionNode.nodeRef;
				nodeRef.traverse(function(child) { child.userData.skipIt = true; });
				this._currentSceneId = nodeRef.userData.currentSceneId;
				Object.assign(nodeRef.userData.treeNode, nodeInfo);
				// response data that can be directly passed to Storage Service to create POI
				var response = {
					transform: TransformationMatrix.convertTo4x4(nodeInfo.transform),
					veid: nodeInfo.sid,
					entityId: nodeRef.userData.entityId,
					name: nodeInfo.name || "Sample POI",
					transformType: "view",
					contentType: "symbol",
					referenceNode: nodeInfo.referenceNode
				};
				return response;
			}.bind(this));
		}

		return Promise.reject();
	};

	PoiHelper.prototype.removePOI = function(currentScene, nodeRef) {
		var nodeHierarchy = currentScene.getDefaultNodeHierarchy();
		var vsm = currentScene.getViewStateManager();
		vsm.setVisibilityState(nodeRef, false, true);
		nodeHierarchy.removeNode(nodeRef);
	};

	PoiHelper.prototype.getPOIList = function(viewport) {
		var vsm = viewport.getViewStateManager();
		return vsm ? vsm.getSymbolNodes() : [];
	};

	var backgroundProjectionToImageType = {
		"spherical": "360Image",
		"planar": "2DImage"
	};

	PoiHelper.prototype.getBackgroundImageType = function(viewport) {
		return backgroundProjectionToImageType[viewport.getBackgroundProjection()];
	};

	PoiHelper.prototype.getPoiRect = function(viewport, nodeRef) {
		var camera = viewport._getNativeCamera();
		var boundingBox = new THREE.Box3();
		boundingBox.setFromObject(nodeRef);
		var vertices = [
			new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
			new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
			new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
			new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
			new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
			new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
			new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
			new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z)
		];

		var frustum = new THREE.Frustum();
		frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		if (!frustum.intersectsBox(boundingBox)) { return false; }

		var min = new THREE.Vector3(1, 1, 1);
		var max = new THREE.Vector3(-1, -1, -1);
		var vertex = new THREE.Vector3();
		for (var i = 0; i < vertices.length; ++i) {
			if (!frustum.containsPoint(vertices[i])) { return false; }
			var vertexWorldCoord = vertex.copy(vertices[i]);
			var vertexScreenSpace = vertexWorldCoord.project(camera);
			min.min(vertexScreenSpace);
			max.max(vertexScreenSpace);
		}

		var box2 = new THREE.Box2(min, max);
		var viewportRect = viewport.getDomRef().getBoundingClientRect();
		var halfScreen = new THREE.Vector2(viewportRect.width / 2, viewportRect.height / 2);
		var box2min = box2.min.clone().multiply(halfScreen);
		var box2max = box2.max.clone().multiply(halfScreen);
		var width = box2max.x - box2min.x;
		var height = box2max.y - box2min.y;
		return { width: width, height: height };
	};

	PoiHelper.prototype.adjustPoi = function(viewport, poiNodeRef) {
		if (viewport.getBackgroundProjection() !== "planar") {
			var screenPos = poiNodeRef.getWorldPosition(new THREE.Vector3()).project(viewport._getNativeCamera());
			var hit = viewport.hitTest((screenPos.x * 0.5 + 0.5) * viewport._width, (screenPos.y * -0.5 + 0.5) * viewport._height, { ignoreOverlay: true });
			if (hit) {
				poiNodeRef.position.copy(hit.point);
			}
			poiNodeRef.quaternion.copy(viewport._getNativeCamera().quaternion);
			poiNodeRef.updateMatrix();
			poiNodeRef.updateMatrixWorld();
			poiNodeRef.userData.direction = new THREE.Vector3().setFromMatrixColumn(poiNodeRef.matrixWorld, 2).normalize();
		}

		poiNodeRef.userData.transform = TransformationMatrix.convertTo4x3(poiNodeRef.matrixWorld.elements);
	};

	PoiHelper.prototype.updateNodeId = function(currentScene, nodeId, newNodeId) {
		var vsm = currentScene.getViewStateManager();
		var poiNode = vsm ? vsm.getSymbolNodes(nodeId)[0] : null;
		if (poiNode) {
			poiNode.userData.nodeId = newNodeId;
			poiNode.userData.treeNode.sid = newNodeId;
			currentScene.setNodePersistentId(poiNode, newNodeId);
		}
		return poiNode;
	};

	PoiHelper.prototype.updatePOI = function(viewport, nodeId, poiSceneId, poiScale, nodeInfo) {
		var currentScene = viewport.getScene();
		var symbolNode = viewport._viewStateManager.getSymbolNodes(nodeId)[0];
		nodeInfo = nodeInfo || {};
		var loader = viewport._cdsLoader;
		if (symbolNode && loader) {
			symbolNode.name = nodeInfo.name || symbolNode.name;
			if (poiScale) {
				symbolNode.baseScale.set(poiScale.x, poiScale.y);
			}
			var skipLowLODRendering = loader.getSkipLowLODRendering();
			loader.setSkipLowLODRendering(true);
			if (nodeInfo.transform) {
				if (nodeInfo.transform.length === 16) {
					nodeInfo.transform = TransformationMatrix.convertTo4x3(nodeInfo.transform);
				}
				symbolNode.position.set(nodeInfo.transform[9], nodeInfo.transform[10], nodeInfo.transform[11]);
			}
			if (poiSceneId) {
				var nodeHierarchy = viewport._viewStateManager.getNodeHierarchy();
				symbolNode.children.forEach(function(nodeRef) { nodeHierarchy.removeNode(nodeRef); });
				return loader.loadTransientScene(poiSceneId, symbolNode).then(function(transitionNode) {
					loader.setSkipLowLODRendering(skipLowLODRendering);
					var nodeRef = transitionNode.nodeRef;
					nodeRef.traverse(function(child) { child.userData.skipIt = true; });
					currentScene.getSceneBuilder()._resetCurrentScene(nodeRef.userData.currentSceneId);
					nodeRef.userData.treeNode.sid = symbolNode.userData.treeNode.sid;
					symbolNode.userData._symbolCenterFixed = false; // HACK: center symbol geometry
					viewport.setShouldRenderFrame();
					return {
						target: nodeRef,
						entityId: nodeRef.userData.entityId
					};
				});
			} else {
				viewport.setShouldRenderFrame();
				var nodeRef = symbolNode.children[0];
				return Promise.resolve({
					target: nodeRef,
					entityId: symbolNode.userData.treeNode.entityId || nodeRef.userData.entityId
				});
			}
		}
	};

	return PoiHelper;
});
