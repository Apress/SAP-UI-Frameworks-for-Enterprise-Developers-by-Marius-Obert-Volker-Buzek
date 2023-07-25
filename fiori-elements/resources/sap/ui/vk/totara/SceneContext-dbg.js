/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"./CallbackHandler",
	"./TotaraUtils",
	"./GeometryFactory",
	"./ProgressCounter",
	"./RequestQueue",
	"../getResourceBundle",
	"../AnimationRotateType"
], function(
	Log,
	CallbackHandler,
	TotaraUtils,
	GeometryFactory,
	ProgressCounter,
	RequestQueue,
	getResourceBundle,
	AnimationRotateType
) {
	"use strict";

	/**
	 * A class with public properties containing helper structures for a single 3D scene loaded from a storage service.
	 *
	 * Instances of this class are owned by TotaraLoader.
	 *
	 * All properties are public without getters/setters.
	 *
	 * @param {string} sceneId The loading scene identifier
	 * @param {any}    params  The ContentDeliveryService loading context parameters
	 * @param {object} loader  The TotaraLoader object
	 *
	 * @private
	 */
	var SceneContext = function(sceneId, params, loader) {

		this.root = null;

		// event related
		this.onActiveCameraCallbacks = new CallbackHandler();
		this.onInitialSceneFinishedCallbacks = new CallbackHandler();
		this.onPartialRetrievalFinishedCallbacks = new CallbackHandler();
		this.onSceneCompletedCallbacks = new CallbackHandler();
		this.onSetPlaybackCallbacks = new CallbackHandler();
		this.onViewFinishedCallbacks = new CallbackHandler();
		this.onViewGroupFinishedCallbacks = new CallbackHandler();
		this.onContentChangesProgressCallbacks = new CallbackHandler();
		this.onInitialViewCompletedCallbacks = new CallbackHandler();

		Object.assign(this, params);

		this.sceneId = sceneId;
		this.loader = loader;
		this.sceneBuilder = loader.sceneBuilder;
		this.requestQueue = new RequestQueue(this, sceneId);

		// mesh update related
		// first mesh(bounding box)
		// then geometry (blob)
		this.phase = SceneContext.Phase.Started;
		this.retrievalType = SceneContext.RetrievalType.Initial;
		this.rootNodeId = null;

		this.meshNodes = new Map(); // meshId -> [ nodeId ]
		this.parametricNodeMap = new Map(); // parametricId -> [ nodeId ]
		this.annotationNodeMap = new Map(); // annotationId -> [ nodeId ]
		this.leaderLineMaterialIdMap = new Map(); // materialId -> [ leaderLine ]
		this.imageNoteMaterialIdMap = new Map();  // materialId -> [ annotation ]

		this.thumbnailViewMap = new Map(); // imageId -> viewId
		this.viewThumbnailMap = new Map(); // viewId  -> imageId
		this.viewAnimatedThumbnailMap = new Map(); // viewId  -> imageId

		// when geometries are loaded these temporary bounding box
		// will be replaced with real geometry

		this.progressCount = new ProgressCounter();

		this.treeNodes = []; // for tree

		this.viewIdTreeNodesMap = new Map();
		this.viewIdBoxMap = new Map();

		this.nodeSidsForPartialTree = new Set();

		this.replacedNodes = new Map();    // existing nodes that are replaced - removed first, then reloaded

		this.updatedNodes = new Set();    // existing nodes that are updated (material, opacity)

		this.currentViewId = null;

		this.initialViewId = null;

		this.initialViewDecided = false;
		this.initialViewFired = false;
		this.eventObject = {};
		this.eventObject.percentage = 0;
		this.loadingGeometry = 0;
	};

	SceneContext.Phase = {
		Started: 0,
		FinishedHierarchy: 1,
		FinishedMesh: 2,
		FinishedGeometry: 3
	};

	SceneContext.RetrievalType = {
		Initial: 0, // Full retrieval when the model is loaded
		Partial: 1  // Partial retrieval for updates
	};

	SceneContext.ProgressPhase = {
		FinishedTree: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_TREE"),
		FinishedMeshes: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_MESHES"),
		FinishedMaterials: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_MATERIALS"),
		FinishedGeomMeshes: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_GEOMETRIES"),
		LoadingGeomMeshes: getResourceBundle().getText("SCENE_CONTEXT_LOADING_GEOMETRIES"),
		FinishedTextures: getResourceBundle().getText("SCENE_CONTEXT_FINISHED_TEXTURES")
	};

	SceneContext.prototype.setOnProgressChanged = function(callback) {
		this.progressCount.setOnProgressChanged(callback);
	};

	SceneContext.prototype.isLoadingFinished = function() {
		if (!this.requestQueue.isEmpty() || this.requestQueue.isWaitingForContent() ||
			this.thumbnailViewMap.size > 0 || this.viewThumbnailMap.size > 0 || this.viewAnimatedThumbnailMap.size > 0 ||
			this.meshNodes.size > 0 || this.annotationNodeMap.size > 0 || this.parametricNodeMap.size > 0 ||
			this.leaderLineMaterialIdMap.size > 0 || this.imageNoteMaterialIdMap.size > 0 ||
			this.viewIdTreeNodesMap.size > 0 || this.nodeSidsForPartialTree.size > 0) {
			return false;
		}

		return true;
	};

	// check if the scene is completed
	// meaning we have updated all meshes, textures, geometries.
	// This function should be called after scene tree is built
	SceneContext.prototype.isSceneCompleted = function() {
		return !this.requestQueue.meshes.isWaiting() &&
			!this.requestQueue.annotations.isWaiting() &&
			!this.requestQueue.materials.isWaiting() &&
			!this.requestQueue.parametric.isWaiting() &&
			!this.requestQueue.geomMeshes.isWaiting() &&
			!this.requestQueue.geometries.isWaiting() &&
			!this.requestQueue.textures.isWaiting();
	};

	SceneContext.prototype.isInitialViewCompleted = function() {
		var texturesDone = this.requestQueue.textures.isInitialViewCompleted();
		var meshesDone = this.requestQueue.meshes.isInitialViewCompleted();
		var geomMeshesDone = this.requestQueue.geomMeshes.isInitialViewCompleted();
		return texturesDone && meshesDone && geomMeshesDone;
	};

	SceneContext.prototype._checkSceneCompletion = function() {
		if (!this.initialViewFired && this.isInitialViewCompleted()) {
			Log.info("initialView completed.");
			this.initialViewFired = true;
			this.onInitialViewCompletedCallbacks.execute();
		}

		if (this.isSceneCompleted()) {
			if (this.eventObject.percentage < 100) {
				this.eventObject.percentage = 100;
				this.onContentChangesProgressCallbacks.execute(this.eventObject);
			}

			this.onSceneCompletedCallbacks.execute();

			Log.info("Scene completed.");
			TotaraUtils.mark("sceneCompleted");
			this.logPerformance("sceneCompleted");
		}
	};

	SceneContext.prototype._fireProgress = function(Phase) {
		switch (Phase) {
			case SceneContext.ProgressPhase.FinishedTree:
				this.eventObject.percentage += 10;
				this.eventObject.phase = SceneContext.ProgressPhase.FinishedTree;
				this.onContentChangesProgressCallbacks.execute(this.eventObject);
				break;
			case SceneContext.ProgressPhase.FinishedMeshes:
				if (!this.requestQueue.meshes.isWaiting()) {
					this.eventObject.percentage += 10;
					this.eventObject.phase = SceneContext.ProgressPhase.FinishedMeshes;
					this.onContentChangesProgressCallbacks.execute(this.eventObject);
				}
				break;
			case SceneContext.ProgressPhase.FinishedMaterials:
				if (!this.requestQueue.materials.isWaiting()) {
					this.eventObject.percentage += 10;
					this.eventObject.phase = SceneContext.ProgressPhase.FinishedMaterials;
					this.onContentChangesProgressCallbacks.execute(this.eventObject);
				}
				break;
			case SceneContext.ProgressPhase.LoadingGeomMeshes:
				this.eventObject.percentage += 61 * (1 / this.requestQueue.geomMeshes.globalList.size); // Due to using Math.floor in vk Viewer progress would sometime get stuck at 99%, so we use cap geometry at 61% instead of 60% to avoid this
				if (this.eventObject.percentage > 100) { // Occasionally geometry will cause progress to go above 100%, so if it does we set it back to 100%
					this.eventObject.percentage = 100;
				}
				this.loadingGeometry += 61 * (1 / this.requestQueue.geomMeshes.globalList.size);
				if (this.loadingGeometry >= 60) {
					this.eventObject.phase = SceneContext.ProgressPhase.FinishedGeomMeshes;
				} else {
					this.eventObject.phase = SceneContext.ProgressPhase.LoadingGeomMeshes;
				}
				this.onContentChangesProgressCallbacks.execute(this.eventObject);
				break;
			case SceneContext.ProgressPhase.FinishedTextures:
				if (!this.requestQueue.textures.isWaiting()) {
					this.eventObject.percentage += 10;
					this.eventObject.phase = SceneContext.ProgressPhase.FinishedTextures;
					this.onContentChangesProgressCallbacks.execute(this.eventObject);
				}
				break;
			default:
		}
	};

	SceneContext.prototype.dispose = function() {
		this.sceneId = null;

		this.progressCount = null;

		this.requestQueue = null;
		this.suppressedBoundingBoxListMap = null;

		this.treeNodes = null;

		this.nodeSidsForPartialTree = null;

		this.meshNodes = null;
		this.annotationNodeMap = null;
		this.parametricNodeMap = null;
		this.leaderLineMaterialIdMap = null;
		this.imageNoteMaterialIdMap = null;

		this.thumbnailViewMap = null;
		this.viewThumbnailMap = null;
		this.viewAnimatedThumbnailMap = null;

		this.replacedNodes = null;

		this.updatedNodes = null;

		this.viewIdTreeNodesMap = null;
		this.viewIdBoxMap = null;

		this.onActiveCameraCallbacks = null;
		this.onInitialSceneFinishedCallbacks = null;
		this.onPartialRetrievalFinishedCallbacks = null;
		this.onSceneCompletedCallbacks = null;
		this.onViewFinishedCallbacks = null;
		this.onSetPlaybackCallbacks = null;
		this.onContentChangesProgressCallbacks = null;
		this.onInitialViewCompletedCallbacks = null;
	};

	SceneContext.prototype.logPerformance = function(name) {
		if (this.progressLogger && this.token) {
			this.progressLogger.logPerformance(name, this.token);
		}
	};

	SceneContext.prototype.setCameraSingle = function(cameraInfo) {
		this.sceneBuilder.createCamera(cameraInfo, this.sceneId);
		return this.sceneBuilder.getCamera(cameraInfo.id);
	};

	SceneContext.prototype.getPartialTreeNodes = function(treeNodes) {
		var partialTreeRoots = [];
		var partialTreeNodes = [];

		var i, j, treeNode;

		if (treeNodes && treeNodes.length) {
			for (i = 0; i < treeNodes.length; i++) {
				treeNode = treeNodes[i];
				if (treeNode == null) {
					continue;
				}

				if (treeNode && treeNode.children) {
					// If an entity has only one child element then it looks ugly in the scene tree
					// control. We mark the element as non-visualisable. It's the scene tree
					// control's responsibility not to display non-visualisable nodes.
					//
					// JSON payload         three.js tree                       scene tree control
					// ---------------      ---------------                     -------------
					// entity_1             entity_1                            entity_1
					//   entity_2             entity_2                            entity_2
					//     element_a            element_a (non-visualisable)        element_b
					//       element_b   ->       element_b                  ->     element_c
					//       element_c            element_c                         ...
					//       ...                  ...                               element_z
					//       element_z            element_z
					if (treeNode.entityId != null && treeNode.children.length === 1) {
						var childNode = treeNodes[treeNode.children[0]];
						if (childNode.entityId == null) {
							// This is an element node, not an entity one.
							childNode.visualisable = false; // This node shall not be displayed in scene tree
							if (childNode.visible === false) {
								treeNode.visible = false;
							} else if (treeNode.visible === false) {
								childNode.visible = false;
							}
						}
					}

					// 1. Propagate renderOrder to children. (Why?)
					// 2. Assign treeNode as parent reference to its children's parentNode property.
					//    The only place which uses it is the next 'for' loop in this method.
					if (treeNode.children) {
						for (j = 0; j < treeNode.children.length; j++) {
							var childIndex = treeNode.children[j];
							treeNodes[childIndex].parentNode = treeNode;
							if (treeNode.renderOrder) {
								treeNodes[childIndex].renderOrder = treeNode.renderOrder;
							}
						}
					}
				}
			}

			for (i = 0; i < treeNodes.length; i++) {
				treeNode = treeNodes[i];
				if (treeNode == null) {
					continue;
				}
				if (treeNode.parent) {
					// Nodes with the `parent` (sid) property are supposed to have parent nodes
					// defined in other payloads, in this payload we treat them as top-level (root)
					// nodes (why?).
					partialTreeRoots.push(treeNode);
				} else if (!treeNode.parentNode) {
					// Nodes that have no parents in this payload are also treated as root nodes (why?).
					partialTreeRoots.push(treeNode);
					if (this.rootNodeId) {
						treeNode.parent = this.rootNodeId;
					}
				}

				if (this.nodeSidsForPartialTree.has(treeNode.sid)) {
					partialTreeNodes.push(treeNode);
				}
			}
		}

		this.nodeSidsForPartialTree.clear();

		if (!partialTreeNodes.length) { // full tree retrieval
			return partialTreeRoots;
		}

		partialTreeRoots = [];
		for (j = 0; j < partialTreeNodes.length; j++) {
			var node = partialTreeNodes[j];
			var parentNode = node.parentNode;
			while (parentNode) {
				if (this.sceneBuilder.getNode(parentNode.sid, this.sceneId)) {
					node.parent = parentNode.sid;
					partialTreeRoots.push(node);
					break;
				} else {
					node = parentNode;
					parentNode = parentNode.parentNode;
				}
			}
		}

		return partialTreeRoots.length ? partialTreeRoots : partialTreeNodes;
	};

	SceneContext.prototype.buildTree = function(isInitial) {
		var result = {};

		if (!this.treeNodes || !this.treeNodes.length) {
			result.error = "no tree information";
			return result;
		}

		var treeNodes = this.treeNodes;
		var partialTreeRoots = this.getPartialTreeNodes(treeNodes);

		this.replacedNodes.clear();

		var retryList = []; // depending on the treeNode order, some of the parent(sid) might not have been created yet. so we keep them and try again.
		// if we have any partial trees, we assume this is partial tree update
		var i;
		var parentSid;
		for (i = 0; i < partialTreeRoots.length; i++) {

			parentSid = partialTreeRoots[i].parent;

			if (this.sceneBuilder.getNode(parentSid, this.sceneId)) {
				// TODO: add at a certain index when server provides the information
				this.buildNode(partialTreeRoots[i], parentSid, true, isInitial);
			} else {
				retryList.push(partialTreeRoots[i]);
			}
		}

		for (i = 0; i < retryList.length; i++) {
			parentSid = retryList[i].parent;
			if (this.sceneBuilder.getNode(parentSid, this.sceneId)) {
				// TODO: add at a certain index when server provides the information
				this.buildNode(partialTreeRoots[i], parentSid, true, isInitial);
			} else {
				result.error = (result.error || "") + "parent ${parentSid} does not exist in the scene. \n";
			}
		}

		if (this.retrievalType === SceneContext.RetrievalType.Partial) {
			this.sceneBuilder.updateViewsForReplacedNodes(this.treeNodes);
		}
		// Reset tree nodes as indices of tree node only valid in one payload
		// we don't need this list after tree is built.
		// sceneBuilder.resourcesCleanUp(state);
		this.treeNodes = [];

		this.progressCount.mesh.total = this.requestQueue.meshes.globalList.size;

		return result;
	};

	SceneContext.prototype.buildNode = function(tNode, parentId, recursively, isInitial) {
		if (!tNode || !parentId) {
			this.loader.reportError(this, "SceneContext - buildNode - invalid args");
			return null;
		}

		var existingTreeNode = this.sceneBuilder.getNode(tNode.sid, this.sceneId);

		// This TreeNode is about to be updated and existing one should be removed.
		if (existingTreeNode) {
			this.sceneBuilder.remove(tNode.sid, this.sceneId);
		}

		// TreeNode delete
		if (tNode.suppressed === true) {
			// this is already deleted node. we don't want to build tree for this.
			return null;
		}

		if (!tNode.sid) {
			this.loader.reportError(this, "sid is missing in treeNode");
			return null;
		}

		tNode.parentId = parentId;
		this.sceneBuilder.createNode(tNode, this.sceneId);

		var parametricId = tNode.parametricId;
		var meshId = tNode.meshId;
		if (parametricId && meshId) {
			// There are both definitions present, ask SceneBuilder which one to use
			if (this.sceneBuilder.preferMeshes()) {
				parametricId = null;
			} else {
				meshId = null;
			}
		}

		if (parametricId) {
			if (this.parametricNodeMap.get(parametricId) == null) {
				this.parametricNodeMap.set(parametricId, [tNode.sid]);
				this.requestQueue.parametric.push(parametricId);
			} else {
				this.parametricNodeMap.get(parametricId).push(tNode.sid);
			}
		} else if (meshId && !this.sceneBuilder.hasMesh(meshId)) {
			TotaraUtils.pushElementIntoMapArray(this.meshNodes, meshId, tNode.sid);
			if (this.loader.getSkipLowLODRendering()) {
				this.requestQueue.geomMeshes.push(meshId, null, null, { id: meshId, isInitial: isInitial });
			} else {
				// This call is used to retrieve inner boxes only.
				this.requestQueue.meshes.push(meshId, { id: meshId, isInitial: isInitial });
			}
		}

		if (tNode.annotationId && !this.sceneBuilder.hasAnnotation(tNode.annotationId)) {
			this._requestAnnotationForNode(tNode.annotationId, tNode.sid);
		}

		var newTreeNode = this.sceneBuilder.getNode(tNode.sid, this.sceneId);

		if (existingTreeNode && newTreeNode) {
			this.replacedNodes.set(existingTreeNode, newTreeNode);
		}

		if (recursively && tNode.children) {
			for (var i = 0; i < tNode.children.length; i++) {
				this.buildNode(this.treeNodes[tNode.children[i]], tNode.sid, recursively, isInitial);
			}
		}

		return newTreeNode;
	};

	SceneContext.prototype.setTree = function(jsonContent) {
		// setTree gives root node directly.
		if (jsonContent.sid) {
			var root = this.sceneBuilder.getNode(jsonContent.sid, this.sceneId);
			if (!root || root !== this.root) {
				var rootGroup = this.root;
				// make dummy tree node for root as server only gives sid
				rootGroup.userData.treeNode = {
					sid: jsonContent.sid,
					name: this.root.name ? this.root.name : "root"
				};
				rootGroup.userData.skipIt = !this.root.name; // If application didn't assign name to the root then ignore it in scene tree

				this.sceneBuilder.setRootNode(rootGroup, jsonContent.sid, this.sceneId, this.vkScene);
				this.rootNodeId = jsonContent.sid;
			}
		}

		if (jsonContent.camera) {
			// Don't use view camera as default scene camera for the viewport.
			// This way the view camera will not change when user interacts with the viewport
			jsonContent.camera.id = "initial";
			var camera = this.setCameraSingle(jsonContent.camera);
			if (camera) {
				this.onActiveCameraCallbacks.execute(camera);
			}
		}

		TotaraUtils.measure("setTreeMeasure-" + this.sceneId, "setTree-" + this.sceneId);
	};

	SceneContext.prototype.setTreeNode = function(jsonContent) {
		if (!Array.isArray(jsonContent.nodes)) {
			return { error: "setTreeNode error: nodes are not properly defined" };
		}

		this.treeNodes = this.treeNodes.concat(jsonContent.nodes);

		return {};
	};

	SceneContext.prototype.suppressSendRequests = function() {
		this.loader.setSuppressSendRequests(true);
	};

	SceneContext.prototype.unsuppressSendRequests = function() {
		this.loader.setSuppressSendRequests(false);
		this.loader.sendRequest(this.requestQueue);
	};

	SceneContext.prototype.notifyFinishedTree = function(command, isInitial) {
		this.buildTree(isInitial);

		this.phase = SceneContext.Phase.FinishedHierarchy;
		this._fireProgress(SceneContext.ProgressPhase.FinishedTree);

		if (this.retrievalType === SceneContext.RetrievalType.Initial) {
			this.onInitialSceneFinishedCallbacks.execute(this.initialView);
		} else if (this.retrievalType === SceneContext.RetrievalType.Partial) {
			this.onPartialRetrievalFinishedCallbacks.execute();
		}

		this._checkSceneCompletion();
	};

	SceneContext.prototype.setViewGroup = function(jsonContent) {
		this.sceneBuilder.insertViewGroup(jsonContent, this.sceneId);

		if (!Array.isArray(jsonContent.views)) {
			return;
		}

		var viewGroupId = jsonContent.id;
		var i, view;
		if (!this.currentViewGroupId) {
			if (this.currentViewId) {
				for (i = 0; i < jsonContent.views.length; i++) {
					view = jsonContent.views[i];
					if (view.id === this.currentViewId) {
						this.currentViewGroupId = viewGroupId;
						break;
					}
				}
			} else {
				this.currentViewGroupId = viewGroupId;
			}
		}

		if (this.currentViewGroupId !== viewGroupId) {
			return;
		}

		if (!this.currentViewId) {
			this.currentViewId = jsonContent.views[0].id;
		}

		for (i = 0; i < jsonContent.views.length; i++) {
			view = jsonContent.views[i];
			var existingView = this.sceneBuilder.getView(view.id, this.sceneId);

			for (var ti = 0; ti < 2; ti++) {
				var param = ["thumbnailId", "animatedThumbnailId"][ti];
				var thumbnailId = view[param];
				if (thumbnailId !== undefined) {
					view[param] = thumbnailId = thumbnailId.toString();

					if (this.sceneBuilder.hasImage(thumbnailId)) {
						this.sceneBuilder.setViewThumbnail(thumbnailId, view.id, this.sceneId);
						this.loader.onViewGroupUpdatedCallbacks.execute();
					} else {
						this.thumbnailViewMap.set(thumbnailId, view.id);
						this.requestQueue.thumbnails.push(thumbnailId, { imageId: thumbnailId, viewId: view.id });
					}

					if (!existingView) {
						this[["viewThumbnailMap", "viewAnimatedThumbnailMap"][ti]].set(view.id, thumbnailId);
					}
				}
			}

			if (existingView) {
				existingView.userData.viewInfo.thumbnailId = view.thumbnailId;
				existingView.userData.viewInfo.animatedThumbnailId = view.animatedThumbnailId;
				continue;
			}

			this.requestQueue.views.push(view.id, { viewId: view.id, viewGroupId: viewGroupId });
		}

		if (!this.requestQueue.views.isWaiting()) {
			this.sceneBuilder.finalizeViewGroups(this.sceneId);
			this.loader.onViewGroupUpdatedCallbacks.execute();
			if (this.requestQueue.sequences.isEmpty()) {
				this.onViewGroupFinishedCallbacks.execute();
			}
		}

		TotaraUtils.measure("setViewGroupMeasure-" + viewGroupId, "setViewGroup-" + viewGroupId);
	};

	SceneContext.prototype.setView = function(jsonContent) {
		var viewId = jsonContent.viewId;
		this.viewIdBoxMap.set(viewId !== undefined ? viewId : "default", jsonContent.box);

		if (!viewId) {
			this.setTree(jsonContent);
			this.initialViewDecided = true;
			return;
		}

		if (!this.initialViewId && !this.initialViewDecided) {
			this.initialViewId = viewId;
			this.currentViewId = viewId;
			this.initialViewDecided = true;
		}

		var cameraId;
		if (this.initialViewId === viewId) {
			if (jsonContent.camera) {
				cameraId = jsonContent.camera.id; // will be changed in setTree function, so to remember
			}
			this.setTree(jsonContent);
		}

		var thumbnailId = this.viewThumbnailMap.get(viewId);
		if (thumbnailId) {
			this.viewThumbnailMap.delete(viewId);
			jsonContent.thumbnailId = thumbnailId;
		}

		var animatedThumbnailId = this.viewAnimatedThumbnailMap.get(viewId);
		if (animatedThumbnailId) {
			this.viewAnimatedThumbnailMap.delete(viewId);
			jsonContent.animatedThumbnailId = animatedThumbnailId;
		}

		this.sceneBuilder.insertView(jsonContent, this.sceneId);

		var view = this.sceneBuilder.getView(jsonContent.viewId, jsonContent.sceneId);
		if (view && this.initialViewId === jsonContent.viewId) {
			this.initialView = view;
		}

		var viewNodes = [];
		this.viewIdTreeNodesMap.set(viewId, viewNodes);
		this.viewIdBoxMap.set(viewId, jsonContent.box);

		if (jsonContent.camera) {
			if (cameraId) {
				jsonContent.camera.id = cameraId;
			}
			this.setCameraSingle(jsonContent.camera);
			this.sceneBuilder.setViewCamera(jsonContent.camera.id, viewId, this.sceneId);
		}

		this.logPerformance("setView");
		TotaraUtils.measure("setViewMeasure-" + viewId, "setView-" + viewId);
	};

	// View data is actually the same as tree data.
	// however, we process them slightly differently.
	// for existing tree node, we need to update it's properties (e.g) transform, visibility
	// for new tree node, we need to add
	// for missing tree node, we need to hide (or drop). Currently we are only hiding.
	// this is because the actual action is happening async as ActivateView.
	// and it does transition effect. we need them to be alive until activate view is finished.
	SceneContext.prototype.setViewNode = function(command, binaryContent, isInitial) {
		var result = { context: this };

		if (!command.viewId) {
			this.setTreeNode(command, isInitial);
			return result;
		}

		if (this.initialViewId === command.viewId) {
			this.setTreeNode(command, isInitial);
		}

		var view = this.sceneBuilder.getView(command.viewId, command.sceneId);
		if (!view) {
			result.error = "setViewNode error: setViewNode - no setView was in the chain";
			return result;
		}

		if (this.initialViewId === command.viewId) {
			this.initialView = view;
		}

		var treeNodes = this.viewIdTreeNodesMap.get(command.viewId);
		treeNodes = treeNodes.concat(command.nodes);
		this.viewIdTreeNodesMap.set(command.viewId, treeNodes);

		return result;
	};

	SceneContext.prototype.notifyFinishedView = function(jsonContent) {
		var viewId = jsonContent.viewId;
		if (!viewId) {
			return this.notifyFinishedTree(jsonContent);
		}

		this.requestQueue.views.pop(viewId);

		if (this.initialViewId === viewId) {
			this.notifyFinishedTree(jsonContent, true);
			this.initialViewId = null;  // make sure TreeHandler functions are only called for initial loading
		}

		var view = this.sceneBuilder.getView(viewId, this.sceneId);
		if (!view) {
			return { error: "notifyFinishedView error: setViewNode - no setView was in the chain" };
		}

		// add three js camera if camera id is there
		// note cameraId can be zero, which is a generated camera which is not stored in service side
		if (view.activeCameraId !== undefined) {
			view.setCamera(this.sceneBuilder.getCamera(view.activeCameraId));
		}

		this.updatedNodes.clear();

		var viewResult = this.buildView(viewId);
		this.sceneBuilder.setViewNodeInfos(viewResult.nodeInfos, viewId, this.sceneId);

		// this view does not require any mesh request
		// meaning we can handle the view without any request
		// let't declare view is finished
		view.updatedNodes = Array.from(this.updatedNodes);

		if (!this.requestQueue.views.isWaiting()) {
			this.sceneBuilder.finalizeViewGroups(this.sceneId);
			this.loader.onViewGroupUpdatedCallbacks.execute();
			if (this.requestQueue.sequences.isEmpty()) {
				this.onViewGroupFinishedCallbacks.execute();
			}
		}

		this.onViewFinishedCallbacks.execute(view);

		this.logPerformance("notifyFinishedView");
	};

	SceneContext.prototype.buildView = function(viewId) {
		var result = {};

		this.treeNodes = this.viewIdTreeNodesMap.get(viewId);

		var partialTreeRoots = this.getPartialTreeNodes(this.treeNodes);

		var nodeInfos = []; // nodeInfo { sid, transform(optional), visibility(optional) }
		// if we have any partial trees, we assume this is partial tree update
		for (var i = 0; i < partialTreeRoots.length; i++) {

			var parentSid = partialTreeRoots[i].parent;

			this.processNodeRecursively(viewId, partialTreeRoots[i], nodeInfos, parentSid, true);
		}

		result.nodeInfos = nodeInfos;
		// Reset tree nodes as indices of tree node only valid in one payload
		// we don't need this list after tree is built.
		// resourcesCleanUp(state); // we currently cannot delete node for view.. so no need to clean up? // TODO: find out how to clean up
		this.treeNodes = [];
		this.viewIdTreeNodesMap.delete(viewId);
		return result;
	};

	// check if this sid already exist.
	// for now, just check if it is in the map.
	// as we don't restructure tree, checking if exist in the map is good enough
	// if we restructure trees, we need to search in the children of existing threejs tree
	SceneContext.prototype.processNodeRecursively = function(viewId, tNode, nodeInfos, parentSid, parentVisible) {

		var treeNode = this.sceneBuilder.getNode(tNode.sid, this.sceneId);

		var annotationId = "annotationId" in tNode ? tNode.annotationId : null;

		// The same html annotation node in different views may have different annotation content
		// and hence different annotation IDs. This may happen if we edited the annotation in one
		// view, in which it was created, in other views it will not be visible and will stay
		// original. We can edit only html annotations.
		if (annotationId != null && treeNode != null && treeNode.userData.annotationType === "html" && !this.sceneBuilder.hasAnnotation(annotationId)) {
			this._requestAnnotationForNode(annotationId, tNode.sid);
		}

		if (!treeNode) {
			treeNode = this.buildNode(tNode, parentSid, false);
			if (!treeNode) {
				return;
			}

			treeNode.visible = false; // newly built node should be hidden until we activate the view
		}

		if (tNode.materialId) {
			this._checkIfNeededAndOrderMaterial(tNode.materialId, true);
		}

		// if tNode has no visible property, then that means it is visible (visible by default)
		var visible = tNode.visible == undefined ? true : tNode.visible;

		// push node info
		nodeInfos.push({
			target: treeNode,
			visible: visible,
			materialId: tNode.materialId,
			opacity: tNode.opacity,
			meshId: tNode.meshId,
			annotationId: tNode.annotationId,
			transform: Array.isArray(tNode.transform) ? TotaraUtils.arrayToColumnMajorMatrixArray16(tNode.transform) :
				[1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]
		});

		// check tree
		// if tree node already exist, we build item list for view which will be passed as info for activate view later
		// if tree node does not exist, we need to retrieve them. we consider view is finished when we retrieve all bounding box meshes

		var treeNodes = this.treeNodes;
		var existingChildrenSids = this.sceneBuilder.getChildNodeIds(tNode.sid, this.sceneId);
		var incomingChildrenSids = tNode.children ? tNode.children.map(function(index) { return treeNodes[index].sid; }) : [];

		var currentSid;
		var i;
		for (i = 0; i < existingChildrenSids.length; i++) {
			currentSid = existingChildrenSids[i];

			for (var j = 0; j < incomingChildrenSids.length; j++) {
				if (currentSid === incomingChildrenSids[j]) {
					existingChildrenSids[i] = undefined; // we have this sid in new tree as well.. remove it from the list
					break;
				}
			}
		}

		// now existingChildrenSids only contains sids which should be hidden from the new view.
		for (i = 0; i < existingChildrenSids.length; i++) {
			var childSid = existingChildrenSids[i];
			if (childSid !== undefined) {
				var childNode = this.sceneBuilder.getNode(childSid, this.sceneId);
				var childVisibility = false;
				nodeInfos.push({
					target: childNode,
					visible: childVisibility
				});
			}
		}

		// check other children
		if (tNode.children) {
			for (i = 0; i < tNode.children.length; i++) {
				this.processNodeRecursively(viewId, treeNodes[tNode.children[i]], nodeInfos, tNode.sid, visible);
			}
		}

		if (tNode.highlightStyleId) {
			this.sceneBuilder.recordHighlightedNodeInView(tNode.highlightStyleId, tNode.sid, viewId, this.sceneId);
			if (!this.sceneBuilder.highlightStyleExists(tNode.highlightStyleId)) {
				this.requestQueue.highlights.push(tNode.highlightStyleId);
			}
		}
	};

	SceneContext.prototype.setAnnotationSingle = function(singleAnnotation) {
		// this.annotationNodeMap -> Backend nodes referring to an annotation
		// Previously node.annotationId was set only on backend node (only at tree load).
		// Now node.annotationId can be set for local nodes(NodeHierarchy.createNode which will fetch the annotation from backend)
		// In this case, annotationNodeMap will not have an entry for the annotation id
		var nodeIds = this.annotationNodeMap.get(singleAnnotation.id) || [];

		this.annotationNodeMap.delete(singleAnnotation.id);

		var createAnnotation = function(nodeId) {
			var annotation = JSON.parse(JSON.stringify(singleAnnotation));
			if (nodeId) {
				// NB: nodeId is an sid of the tree node which has the annotation as its content.
				// The node reference from the annotation breaks the requirement that one annotation
				// can be shared by many nodes.
				annotation.nodeId = nodeId;
			}

			if (annotation.detailView || annotation.cutaway) { // detail view
				this.sceneBuilder.createDetailView(annotation, this.sceneId);
			} else if (annotation.labelMaterialId || (annotation.label && annotation.label.materialId)) { // image note
				var materialId = annotation.labelMaterialId || annotation.label.materialId;
				if (this.sceneBuilder.checkMaterialExists(materialId, false)) {
					this.sceneBuilder.createImageNote(annotation, this.sceneId);
					this.loader.onAnnotationFinishedCallbacks.execute(annotation.id);
				} else {
					this.requestQueue.materials.push(materialId);
					TotaraUtils.pushElementIntoMapArray(this.imageNoteMaterialIdMap, materialId, annotation);
				}
			} else { // callout or text note
				this.sceneBuilder.createAnnotation(annotation, this.sceneId);

				var leaderLines = annotation.leaderLines;
				if (leaderLines) {
					for (var i = 0, l = leaderLines.length; i < l; i++) {
						var leaderLine = leaderLines[i];
						leaderLine.annotationId = annotation.id;
						if (this.sceneBuilder.checkMaterialExists(leaderLine.materialId, false)) {
							this.sceneBuilder.insertLeaderLine(leaderLine, this.sceneId);
						} else {
							this.requestQueue.materials.push(leaderLine.materialId);
							TotaraUtils.pushElementIntoMapArray(this.leaderLineMaterialIdMap, leaderLine.materialId, leaderLine);
						}
					}
				}
			}
		}.bind(this);

		if (nodeIds.length > 0) {
			// We get here when processing responses from /scenes/{sceneId}/views/{viewId}.
			for (var j = 0; j < nodeIds.length; j++) {
				createAnnotation(nodeIds[j]);
			}
		} else {
			// We get here when processing responses from /scenes/{sceneId}/annotations.
			// Such responses do not contain nodes corresponding to the requested annotations,
			// so nodeIds is empty.
			createAnnotation();
		}

		this.requestQueue.annotations.pop(singleAnnotation.id);
	};

	SceneContext.prototype.setCamera = function(jsonContent) {
		if (!Array.isArray(jsonContent.cameras)) {
			return { error: "setCamera error: cameras are not properly defined" };
		}

		jsonContent.cameras.forEach(this.setCameraSingle.bind(this));
	};

	SceneContext.prototype.allocateMeshBuffer = function(jsonContent) {
		var meshes = jsonContent.meshes;
		for (var k = 0, count = meshes.length; k < count; ++k) {
			var mesh = meshes[k];
			var meshId = mesh.id;
			if (!this.sceneBuilder.hasMesh(meshId)) {
				var i, submesh, viewBoundingBox;
				this.meshNodes.delete(meshId);
				if (Array.isArray(mesh.submeshes)) {
					for (i = 0; i < mesh.submeshes.length; i++) {
						submesh = mesh.submeshes[i];
						submesh.meshId = meshId;

						this._checkIfNeededAndOrderMaterial(submesh.materialId, true);

						viewBoundingBox = this.viewIdBoxMap.has(this.currentViewId)
							? this.viewIdBoxMap.get(this.currentViewId)
							: this.viewIdBoxMap.get("default");
						this.sceneBuilder.insertSubmesh(submesh, viewBoundingBox);
					}
				}
				this.progressCount.mesh.count++;
			}
		}
		// must be changed!!! - this takes over a minute on OilRig load
		// this._fireProgress(SceneContext.ProgressPhase.LoadingGeomMeshes);
		// must be changed!!! - this takes over a minute on OilRig load
	};

	SceneContext.prototype.setMesh = function(jsonContent, binaryData) {
		var meshes = jsonContent.meshes;
		if (!Array.isArray(meshes)) {
			return { error: "setMesh error: meshes are not properly defined" };
		}

		var requestedMeshes = this.requestQueue.geomMeshes;
		meshes.forEach(function(mesh) {
			requestedMeshes.pop(mesh.id);
		});

		if (binaryData) { // set meshes geometries
			var dataView = new DataView(binaryData.buffer, binaryData.byteOffset, binaryData.byteLength);
			// var version = dataView.getUint16(0, true);
			var bufferCount = dataView.getUint16(2, true), offset = 0;
			while (bufferCount-- > 0 && offset < binaryData.byteLength) {
				var geomInfo = {
					sceneId: this.sceneId,
					id: dataView.getUint32(offset + 4, true).toString(),
					box: [
						dataView.getFloat32(offset + 14, true),
						dataView.getFloat32(offset + 18, true),
						dataView.getFloat32(offset + 22, true),
						dataView.getFloat32(offset + 26, true),
						dataView.getFloat32(offset + 30, true),
						dataView.getFloat32(offset + 34, true)
					]
				};

				var geometryType = dataView.getUint16(offset + 12, true);
				offset += 38;

				if (geometryType !== 3) { // for geometry which is not of type 3 (box)
					geomInfo.flags = dataView.getUint16(offset, true);
					// geomInfo.uvChannelCount = dataView.getUint16(offset + 2, true);
					geomInfo.quality = dataView.getFloat32(offset + 4, true);
					geomInfo.pointCount = dataView.getUint16(offset + 8, true);
					geomInfo.elementCount = dataView.getUint16(offset + 10, true);
					geomInfo.encodingType = dataView.getUint16(offset + 12, true);
					offset += 14;
				}

				var bufferLength = dataView.getUint32(offset, true);
				var buffer = binaryData.subarray(offset + 4, offset + 4 + bufferLength);
				offset += bufferLength;

				this.setGeometry(geomInfo, buffer);
			}
		}

		TotaraUtils.measure("setMeshMeasure-" + this.sceneId, "setMesh-" + this.sceneId);

		this._checkSceneCompletion();
	};

	SceneContext.prototype.setMaterialSingle = function(material, isInitial) {
		var materialId = material.id;
		this.requestQueue.materials.pop(materialId);

		var i;
		var texturesToLoad = this.sceneBuilder.createMaterial(material);
		for (i = 0; i < texturesToLoad.length; i++) {
			var imageId = texturesToLoad[i].imageId;
			this.requestQueue.textures.push(imageId, { imageId: imageId, materialId: materialId, isInitial: isInitial });
		}

		var leaderLines = this.leaderLineMaterialIdMap.get(materialId);
		if (leaderLines) {
			this.leaderLineMaterialIdMap.delete(materialId);
			for (i = 0; i < leaderLines.length; i++) {
				this.sceneBuilder.insertLeaderLine(leaderLines[i], this.sceneId);
			}
		}

		var imageNotes = this.imageNoteMaterialIdMap.get(materialId);
		if (imageNotes) {
			this.imageNoteMaterialIdMap.delete(materialId);
			for (i = 0; i < imageNotes.length; i++) {
				this.sceneBuilder.createImageNote(imageNotes[i], this.sceneId);
			}
		}

		this.loader.onMaterialFinishedCallbacks.execute(materialId);
	};

	SceneContext.prototype.setMaterial = function(jsonContent, binaryContent, isInitial) {
		if (!Array.isArray(jsonContent.materials)) {
			return { error: "setMaterial error: materials are not properly defined" };
		}

		jsonContent.materials.forEach(function(m) {
			this.setMaterialSingle(m, isInitial);
		}.bind(this));

		TotaraUtils.measure("setMaterialMeasure-" + this.sceneId, "setMaterial-" + this.sceneId);

		this._fireProgress(SceneContext.ProgressPhase.FinishedMaterials);
		this._checkSceneCompletion();
	};

	SceneContext.prototype.setGeometry = function(jsonContent, binaryContent) {
		var geometryId = jsonContent.id;
		this.requestQueue.geometries.pop(geometryId);

		if (jsonContent.data && !binaryContent) {
			binaryContent = TotaraUtils.base64ToUint8Array(jsonContent.data);
		}

		if (!binaryContent || binaryContent.length === 0) {
			return { error: "setGeometry error: no data for geometry " + geometryId };
		}

		var geometryInfo = GeometryFactory.getGeometryInfo(jsonContent, binaryContent);
		if (!geometryInfo) {
			return { error: "setGeometry error: failed to parse geometry " + geometryId + " data" };
		}
		this.sceneBuilder.setGeometry(geometryInfo);

		// if (jsonContent && jsonContent.flags) {
		// 	var bHasNormals = (jsonContent.flags & 2) > 0;
		// 	if (!bHasNormals) { // PMI
		// 		var materialId = this.geometryIdMaterialIdMap.get(geometryId);
		// 		if (materialId) {
		// 			this.sceneBuilder.updateMaterialForGeometryWithoutNormal(materialId);
		// 		}
		// 	}
		// }

		this.loader.onSetGeometryCallbacks.execute({ id: geometryId });

		// upgrade boundings with actual geometry
		if (!this.requestQueue.geometries.isWaiting()) {
			this.phase = SceneContext.Phase.FinishedGeometry;
			this.logPerformance("geometryFinished");
		}

		this.progressCount.geometry.count++;
		TotaraUtils.measure("setGeometryMeasure-" + geometryId, "setGeometry-" + geometryId);
	};

	SceneContext.prototype.setImage = function(jsonContent, binaryContent) {
		var imageId = jsonContent.id;

		if (!binaryContent) {
			return { error: "setImage error: no image content for " + imageId };
		}

		jsonContent.binaryData = binaryContent;
		this.sceneBuilder.createImage(jsonContent);

		if (this.requestQueue.textures.pop(imageId)) {
			Log.info("Received texture image id: " + imageId);
			this.loader.onImageFinishedCallbacks.execute({ id: imageId });
			this._fireProgress(SceneContext.ProgressPhase.FinishedTextures);
			this._checkSceneCompletion();
		} else if (this.requestQueue.thumbnails.pop(imageId)) {
			var viewId = this.thumbnailViewMap.get(imageId);
			if (viewId) {
				this.thumbnailViewMap.delete(imageId);
				this.sceneBuilder.setViewThumbnail(imageId, viewId, this.sceneId, jsonContent.tileWidth);
				this.loader.onViewGroupUpdatedCallbacks.execute();
			}
		}

		TotaraUtils.measure("setImageMeasure-" + imageId, "setImage-" + imageId);
	};

	SceneContext.prototype.setAnnotation = function(jsonContent) {
		if (!Array.isArray(jsonContent.annotations)) {
			return { error: "setAnnotation error: annotations are not properly defined" };
		}

		jsonContent.annotations.forEach(this.setAnnotationSingle, this);

		this._checkSceneCompletion();
	};

	SceneContext.prototype.setHighlightStyle = function(jsonContent) {
		jsonContent.id = jsonContent.id.toString();
		this.sceneBuilder.insertHighlightStyle(jsonContent);
		this.requestQueue.highlights.pop(jsonContent.id);
	};

	SceneContext.prototype.setLineStyle = function(jsonContent) {
		jsonContent.lineStyles.forEach(function(lineStyle) {
			this.sceneBuilder.insertLineStyle(lineStyle);
		}, this);
	};

	SceneContext.prototype.setFillStyle = function(jsonContent) {
		jsonContent.fillStyles.forEach(function(fillStyle) {
			this.sceneBuilder.insertFillStyle(fillStyle);
		}, this);
	};

	SceneContext.prototype.setTextStyle = function(jsonContent) {
		jsonContent.textStyles.forEach(function(textStyle) {
			this.sceneBuilder.insertTextStyle(textStyle);
		}, this);
	};

	SceneContext.prototype._checkIfNeededAndOrderMaterial = function(materialId, temporaryMaterialNeeded, parametricContent) {
		if (materialId && this.sceneBuilder.materialNeeded(parametricContent) && this.sceneBuilder.checkMaterialExists(materialId, temporaryMaterialNeeded) === false) {
			this.requestQueue.materials.push(materialId);
		}
	};

	SceneContext.prototype.setParametric = function(jsonContent) {
		for (var i = 0; i < jsonContent.parametrics.length; i++) {
			var parametricContent = jsonContent.parametrics[i];
			var parametricId = parametricContent.id.toString();
			var nodeIds = this.parametricNodeMap.get(parametricId);
			this.requestQueue.parametric.pop(parametricId);
			this.parametricNodeMap.delete(parametricId);
			for (var j = 0; nodeIds && j < nodeIds.length; j++) {
				if (parametricContent.shapes != null) {
					// This is a composite object, with array of shape objects
					for (var k = 0; k < parametricContent.shapes.length; k++) {
						this._checkIfNeededAndOrderMaterial(parametricContent.shapes[k].materialID, false, parametricContent);
					}
				} else {
					// A single shape object
					this._checkIfNeededAndOrderMaterial(parametricContent.materialID, false, parametricContent);
				}
				this.sceneBuilder.setParametricContent(nodeIds[j], parametricContent, this.sceneId);
			}
		}

		this._checkSceneCompletion();
	};

	// Expected payload:
	// {
	//     viewId: "string",
	//     playbacks: []     // reference sequences by sequenceId.
	// }
	SceneContext.prototype.setPlayback = function(jsonContent) {
		// NB: This method expects that sequences are referenced by `sequenceId`, not by index.

		if (!Array.isArray(jsonContent.playbacks)) {
			return { error: "setPlayback error: playbacks are not properly defined" };
		}

		var view = this.sceneBuilder.getView(jsonContent.viewId, this.sceneId);
		var onlyLoadingPlaybacks = false;
		var i, playback;

		if (this.playbackIds) {
			for (i = 0; i < jsonContent.playbacks.length; i++) {
				playback = jsonContent.playbacks[i];
				for (var j = 0; j < this.playbackIds.length; j++) {
					if (playback.id === this.playbackIds[j]) {
						playback.notLoading = false;
						break;
					}
				}
				if (playback.notLoading === undefined) {
					playback.notLoading = true;
				}
			}
			delete this.playbackIds;
			onlyLoadingPlaybacks = true;
			if (!view.sortPlaybacks(true)) {
				view.resetPlaybacksStartTimes(true);
			}
		}

		if (Array.isArray(jsonContent.joints)) {// joints must be defined before sequences
			this.sceneBuilder.insertJoints(jsonContent.joints, this.sceneId);
		}

		for (i = 0; i < jsonContent.playbacks.length; i++) {
			playback = jsonContent.playbacks[i];

			if (playback.notLoading) {
				continue;
			}

			if (playback.id == null) {
				// This is the case when whole playback is sent inline, there are no playbacks, sequences or tracks ids
				// Usually happens with temporary playbacks. Setting initial positions of objects is typical use case
				// We'll create ids here so that scene builder code treats them like any other playback or sequence
				playback.id = jsonContent.viewId + "-playback";
				playback.sequence.id = jsonContent.viewId + "-cont";
				playback.sequenceId = playback.sequence.id;
				this.setSequence({ sequences: [playback.sequence] });
			}
			this.sceneBuilder.insertPlayback(playback, jsonContent.viewId, this.sceneId);
			if (playback.sequenceId) {
				var existingSequence = this.sceneBuilder.getSequence(playback.sequenceId);
				if (existingSequence) {
					// Already received, don't ask for it again
					continue;
				} else {
					// Send it to the queue, to be requested
					this.requestQueue.sequences.push(playback.sequenceId);
				}
			}
		}

		if (!this.requestQueue.sequences.isEmpty()) {
			this.loader.hasAnimation = true;
		} else {
			this.sceneBuilder.finalizeAnimation();
			this.sceneBuilder.finalizePlaybacks();
			this.loader.hasAnimation = false;

			if (onlyLoadingPlaybacks) {
				this.onSetPlaybackCallbacks.execute(view);
			}
		}
	};

	SceneContext.prototype.setSequenceSingle = function(sequence, tracks) {
		var sequenceId = sequence.id;
		this.requestQueue.sequences.pop(sequenceId);

		function isEmpty(obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					return false;
				}
			}
			return true;
		}

		if (sequence.nodes) {
			var nodes = [];
			for (var nj = 0; nj < sequence.nodes.length; nj++) {
				var seqNode = sequence.nodes[nj];
				var rotate = seqNode.rrotate || seqNode.rotate;
				if (rotate) {
					var rotateNode = {};

					if (rotate.trackId) {
						rotateNode.trackId = rotate.trackId;
					} else if (tracks && rotate.track !== undefined) {
						rotateNode.trackId = tracks[rotate.track].id;
					}

					if (rotateNode.trackId) {
						if (!tracks) {
							this.requestQueue.tracks.push(rotateNode.trackId);
						}
					}
					rotateNode.sid = seqNode.sid;
					rotateNode.binding = "ROTATE";
					if (rotate.pivot) {
						rotateNode.pivot = rotate.pivot;
					}
					if (seqNode.rotate) {
						rotateNode.isAbsoluteValue = true;
					}

					if (isEmpty(rotate)) {
						rotateNode.empty = true;
					}

					nodes.push(rotateNode);
				}

				var translate = seqNode.rtranslate || seqNode.translate;
				if (translate) {
					var translateNode = {};

					if (translate.trackId) {
						translateNode.trackId = translate.trackId;
					} else if (tracks && translate.track !== undefined) {
						translateNode.trackId = tracks[translate.track].id;
					}

					if (translateNode.trackId) {
						if (!tracks) {
							this.requestQueue.tracks.push(translateNode.trackId);
						}
					}
					translateNode.sid = seqNode.sid;
					translateNode.binding = "TRANSLATE";
					if (translate.pivot) {
						translateNode.pivot = translate.pivot;
					}
					if (seqNode.translate) {
						translateNode.isAbsoluteValue = true;
					}

					if (isEmpty(translate)) {
						translateNode.empty = true;
					}

					nodes.push(translateNode);
				}

				var scale = seqNode.rscale || seqNode.scale;
				if (scale) {
					var scaleNode = {};

					if (scale.trackId) {
						scaleNode.trackId = scale.trackId;
					} else if (tracks && scale.track !== undefined) {
						scaleNode.trackId = tracks[scale.track].id;
					}

					if (scaleNode.trackId) {
						if (!tracks) {
							this.requestQueue.tracks.push(scaleNode.trackId);
						}
					}
					scaleNode.sid = seqNode.sid;
					scaleNode.binding = "SCALE";
					if (scale.pivot) {
						scaleNode.pivot = scale.pivot;
					}
					if (seqNode.scale) {
						scaleNode.isAbsoluteValue = true;
					}

					if (isEmpty(scale)) {
						scaleNode.empty = true;
					}

					nodes.push(scaleNode);
				}

				if (seqNode.opacity !== undefined || seqNode.ropacity !== undefined) {
					var opacity;
					if (seqNode.opacity) {
						opacity = seqNode.opacity;
					} else {
						opacity = seqNode.ropacity;
					}

					var opacityNode = {};

					if (opacity.trackId) {
						opacityNode.trackId = opacity.trackId;
					} else if (tracks && opacity.track !== undefined) {
						opacityNode.trackId = tracks[opacity.track].id;
					}

					if (opacityNode.trackId) {
						if (!tracks) {
							this.requestQueue.tracks.push(opacityNode.trackId);
						}
					}

					opacityNode.sid = seqNode.sid;
					opacityNode.binding = "OPACITY";

					if (seqNode.opacity) {
						opacityNode.isAbsoluteValue = true;
					}

					if (isEmpty(opacity)) {
						opacityNode.empty = true;
					}

					nodes.push(opacityNode);
				}
			}

			sequence.nodes = nodes;
		}

		this.sceneBuilder.insertSequence(sequence, this.sceneId);
	};

	// Expected payload:
	// {
	//     sceneId: "string",
	//     joints: [],
	//     tracks: []
	//     sequences: [], // reference joints and tracks by index
	// }
	//
	SceneContext.prototype.setSequence = function(jsonContent) {
		if (!Array.isArray(jsonContent.sequences)) {
			return { error: "setSequence error: sequences are not properly defined" };
		}

		if (Array.isArray(jsonContent.joints)) {// joints must be defined before sequences
			this.sceneBuilder.insertJoints(jsonContent.joints, this.sceneId);
		}

		for (var i = 0; i < jsonContent.sequences.length; i++) {
			this.setSequenceSingle(jsonContent.sequences[i], jsonContent.tracks);
		}

		if (jsonContent.tracks) {
			this.setTrack(jsonContent);
		}

		if (this.requestQueue.tracks.isEmpty()) {
			this.loader.hasAnimation = false;
			this.loader.onSetSequenceCallbacks.execute();

			if (!this.requestQueue.views.isWaiting()) {
				this.onViewGroupFinishedCallbacks.execute();
			}
		}
	};

	SceneContext.prototype.setTrack = function(jsonContent) {
		if (!Array.isArray(jsonContent.tracks)) {
			return { error: "setTrack error: tracks are not properly defined" };
		}

		var tracks = [];
		for (var ti = 0; ti < jsonContent.tracks.length; ti++) {
			var track = jsonContent.tracks[ti];
			this.requestQueue.tracks.pop(track.id);

			// convert track ----------------
			track.times = track.time;
			if (track.vector3) {
				track.values = track.vector3;
			} else if (track.quaternion) {
				track.values = track.quaternion;
				track.rotateType = AnimationRotateType.Quaternion;
			} else if (track.angleAxis) {
				track.values = track.angleAxis;
				track.rotateType = AnimationRotateType.AngleAxis;
			} else if (track.euler) {
				track.values = track.euler;
				track.rotateType = AnimationRotateType.Euler;
			} else if (track.scalar) {
				track.values = track.scalar;
			}
			track.cyclicInfo = {};
			track.cyclicInfo.cyclicStart = track.cyclicStart;
			track.cyclicInfo.cyclicEnd = track.cyclicEnd;
			// convert track ----------------

			tracks.push(track);
		}

		this.sceneBuilder.insertTracks(tracks);

		if (!this.requestQueue.tracks.isWaiting()) {
			this.sceneBuilder.finalizeAnimation();
			this.sceneBuilder.finalizePlaybacks();
			this.loader.onSetTrackCallbacks.execute();

			if (!this.requestQueue.views.isWaiting() &&
				!this.requestQueue.sequences.isWaiting()) {
				this.onViewGroupFinishedCallbacks.execute();
			}
		}
	};

	SceneContext.prototype.notifyError = function(jsonContent) {
		if (!jsonContent.error) {
			jsonContent.error = "Unknown error";
		}
		return jsonContent;
	};

	SceneContext.prototype._requestAnnotationForNode = function(annotationId, nodeId) {
		var nodes = this.annotationNodeMap.get(annotationId);
		if (nodes == null) {
			this.annotationNodeMap.set(annotationId, [nodeId]);
			this.requestQueue.annotations.push(annotationId);
		} else if (!nodes.includes(nodeId)) {
			nodes.push(nodeId);
		}
		return this;
	};

	return SceneContext;
});
