/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides control sap.ui.vk.svg.ContentDeliveryService.
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"../totara/TotaraLoader",
	"../svg/SceneBuilder",
	"../getResourceBundle",
	"../ObjectType"
], function(
	Log,
	ManagedObject,
	TotaraLoader,
	SceneBuilder,
	getResourceBundle,
	ObjectType
) {
	"use strict";

	/**
	 *  Constructor for a new ContentDeliveryService.
	 *
	 * @class Provides a class to communicate with content delivery service.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.svg.ContentDeliveryService
	 */
	var ContentDeliveryService = ManagedObject.extend("sap.ui.vk.svg.ContentDeliveryService", {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Callback function to provide authorization token.
				 */
				authorizationHandler: "any",
				/*
				 * The maximum number of simultaneous HTTP requests.
				 */
				maxActiveRequests: {
					type: "int",
					defaultValue: 4
				},
				/*
				 * The maximum length of URLs used by the TotaraLoader.
				 */
				maxUrlLength: {
					type: "int",
					defaultValue: 2048
				},
				/*
				 * Max items per getMesh request
				 * Responses contain data used for generating low LOD meshes.
				 */
				meshesBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max items per getMaterial request.
				 */
				materialsBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max items per getGeometry request.
				 */
				geometriesBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max total size of requested geometry objects (in bytes) per getGeometry request.
				 */
				geometriesMaxBatchDataSize: {
					type: "int",
					defaultValue: 1048576
				},
				/*
				 * Max items per mesh request.
				 */
				geomMeshesBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max total size of requested meshes (in bytes) per mesh request.
				 */
				geomMeshesMaxBatchDataSize: {
					type: "int",
					defaultValue: 1048576
				},
				/*
				 * Max items per getAnnotation request.
				 */
				annotationsBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max items per getTrack request.
				 */
				tracksBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Max items per getSequence request.
				 */
				sequencesBatchSize: {
					type: "int",
					defaultValue: 128
				},
				/*
				 * Low LOD rendering will use a mesh generated from voxel data (as opposed to a box) if
				 * the ratio of the item bounding box to the scene/view bounding box is greater than this threshold.
				 */
				voxelThreshold: {
					type: "number",
					defaultValue: 0.0
				},
				/*
				 * If true, rendering of low LOD geometry will be skipped and only high detail geometry will be rendered.
				 */
				skipLowLODRendering: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				cameraChanged: {
					parameters: {
						sceneId: {
							type: "string"
						},
						camera: {
							type: "any"
						}
					},
					enableEventBubbling: true
				},
				sceneUpdated: {
					parameters: {
					},
					enableEventBubbling: true
				},
				viewGroupUpdated: {
					parameters: {
						currentViewGroupId: "string"
					},
					enableEventBubbling: true
				},
				sceneCompleted: {
					parameters: {
						sceneId: {
							type: "string"
						}
					},
					enableEventBubbling: true
				},
				loadingFinished: {
					parameters: {
						currentViewId: "string",
						currentViewGroupId: "string"
					},
					enableEventBubbling: true
				},
				contentChangesProgress: {
					parameters: {
						percent: "float"
					}
				},
				errorReported: {
					parameters: {
						error: {
							type: "any"
						}
					}
				},
				initialViewCompleted: {
					parameters: {
						sceneId: {
							type: "string"
						}
					},
					enableEventBubbling: true
				}
			}
		},

		constructor: function(sId, mSettings) {
			this._loader = new TotaraLoader();
			this._loader.setSceneBuilder(new SceneBuilder());
			ManagedObject.apply(this, arguments);
			this._loader.setSkipLowLODRendering(this.getSkipLowLODRendering());

			// note we keep transientRoot in the map for reference.
			// we do not increase reference counter for resources (e.g geometry)
			// as transient ones will be removed anyway
			// We keep the original tree with userData in '_transientSceneMap'. and give cloned ones
			// when requested.
			// For now, we will keep the transient scene reference for the life time of
			// contentDeliveryService (totara)
			this._transientSceneMap = new Map(); // keeps transient scene. Typically POIs and symbols.

			this._currentNodeHierarchy = null;
		}
	});

	ContentDeliveryService.prototype.getMaxActiveRequests = function() {
		return this._loader.getMaxActiveRequests();
	};
	ContentDeliveryService.prototype.setMaxActiveRequests = function(maxActiveRequests) {
		this._loader.setMaxActiveRequests(maxActiveRequests);
		return this;
	};

	ContentDeliveryService.prototype.getMaxUrlLength = function() {
		return this._loader.getMaxUrlLength();
	};
	ContentDeliveryService.prototype.setMaxUrlLength = function(maxUrlLength) {
		this._loader.setMaxUrlLength(maxUrlLength);
		return this;
	};

	ContentDeliveryService.prototype.getMeshesBatchSize = function() {
		return this._loader.getMeshesBatchSize();
	};
	ContentDeliveryService.prototype.setMeshesBatchSize = function(meshesBatchSize) {
		this._loader.setMeshesBatchSize(meshesBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getMaterialsBatchSize = function() {
		return this._loader.getMaterialsBatchSize();
	};
	ContentDeliveryService.prototype.setMaterialsBatchSize = function(materialsBatchSize) {
		this._loader.setMaterialsBatchSize(materialsBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getGeometriesBatchSize = function() {
		return this._loader.getGeometriesBatchSize();
	};
	ContentDeliveryService.prototype.setGeometriesBatchSize = function(geometriesBatchSize) {
		this._loader.setGeometriesBatchSize(geometriesBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getGeometriesMaxBatchDataSize = function() {
		return this._loader.getGeometriesMaxBatchDataSize();
	};
	ContentDeliveryService.prototype.setGeometriesMaxBatchDataSize = function(geometriesMaxBatchDataSize) {
		this._loader.setGeometriesMaxBatchDataSize(geometriesMaxBatchDataSize);
		return this;
	};

	ContentDeliveryService.prototype.getGeomMeshesBatchSize = function() {
		return this._loader.getGeomMeshesBatchSize();
	};
	ContentDeliveryService.prototype.setGeomMeshesBatchSize = function(geomMeshesBatchSize) {
		this._loader.setGeomMeshesBatchSize(geomMeshesBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getGeomMeshesMaxBatchDataSize = function() {
		return this._loader.getGeomMeshesMaxBatchDataSize();
	};
	ContentDeliveryService.prototype.setGeomMeshesMaxBatchDataSize = function(geomMeshesMaxBatchDataSize) {
		this._loader.setGeomMeshesMaxBatchDataSize(geomMeshesMaxBatchDataSize);
		return this;
	};

	ContentDeliveryService.prototype.getAnnotationsBatchSize = function() {
		return this._loader.getAnnotationsBatchSize();
	};
	ContentDeliveryService.prototype.setAnnotationsBatchSize = function(annotationsBatchSize) {
		this._loader.setAnnotationsBatchSize(annotationsBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getTracksBatchSize = function() {
		return this._loader.getTracksBatchSize();
	};
	ContentDeliveryService.prototype.setTracksBatchSize = function(tracksBatchSize) {
		this._loader.setTracksBatchSize(tracksBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getSequencesBatchSize = function() {
		return this._loader.getSequencesBatchSize();
	};
	ContentDeliveryService.prototype.setSequencesBatchSize = function(sequencesBatchSize) {
		this._loader.setSequencesBatchSize(sequencesBatchSize);
		return this;
	};

	ContentDeliveryService.prototype.getVoxelThreshold = function() {
		return this._loader.getVoxelThreshold();
	};
	ContentDeliveryService.prototype.setVoxelThreshold = function(voxelThreshold) {
		this._loader.setVoxelThreshold(voxelThreshold);
		return this;
	};

	ContentDeliveryService.prototype.setSkipLowLODRendering = function(skipLowLODRendering) {
		this.setProperty("skipLowLODRendering", skipLowLODRendering, true);
		this._loader.setSkipLowLODRendering(skipLowLODRendering);
		return this;
	};

	function uuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16).toLowerCase();
		});
	}

	/**
	 * Sets url of content delivery service server.
	 * @param {string} url Url of content delivery service. Allowed protocols are HTTP, HTTPS, WS and WSS.
	 * @param {boolean} keepCachedData flag for keeping cached data in the loader
	 * @param {string} correlationId uuid for X-CorrelationID http header
	 * @returns {Promise} returns promise which will be resolved when initialization is finished.
	 */
	ContentDeliveryService.prototype.initUrl = function(url, keepCachedData, correlationId) {
		if (!url.endsWith("/")) {
			url += "/";
		}

		var that = this;

		function notifyUpdate() {
			that.fireSceneUpdated({});
		}

		function notifyViewGroupUpdate() {
			var currentViewGroupId;
			if (that._loader && that._loader.currentSceneInfo) {
				var context = that._loader.getContext(that._loader.currentSceneInfo.id);
				if (context) {
					currentViewGroupId = context.currentViewGroupId;
				}
			}
			that.fireViewGroupUpdated({ currentViewGroupId: currentViewGroupId });
		}

		if (!this._loader.running() || this._loader.getUrl() !== url) {
			if (this._loader.running()) {
				var sceneBuilder = this._loader.sceneBuilder;
				this._loader.dispose();
				this._loader = new TotaraLoader();
				this._loader.setSceneBuilder(sceneBuilder);
			}

			this._loader.onErrorCallbacks.attach(this._reportError.bind(that));
			this._loader.onMaterialFinishedCallbacks.attach(notifyUpdate);
			this._loader.onImageFinishedCallbacks.attach(notifyUpdate);
			this._loader.onImageDetailsFinishedCallbacks.attach(notifyUpdate);
			this._loader.onSetGeometryCallbacks.attach(notifyUpdate);
			this._loader.onViewGroupUpdatedCallbacks.attach(notifyViewGroupUpdate);
			this._loader.setUrl(url);
			this._loader.setCorrelationId(correlationId ? correlationId : uuid());
			return this._loader.run();
		} else if (!keepCachedData) {
			this._loader.cleanup();
		}
		return Promise.resolve("Loader is ready");
	};

	ContentDeliveryService.prototype._reportError = function(error) {
		this.fireErrorReported(error);
	};

	ContentDeliveryService.prototype._createLoadParam = function(resolve, reject, parentNode, contentResource) {
		var that = this;
		var initialCamera;
		var sceneLoaded = false;
		var scene;
		if (this._currentNodeHierarchy) {
			scene = this._currentNodeHierarchy.getScene();
		}

		var contextParams = {
			root: parentNode,
			includeHidden: contentResource.getIncludeHidden(),
			includeAnimation: contentResource.getIncludeAnimation(),
			pushPMI: contentResource.getPushPMI(),
			includeBackground: contentResource.getIncludeBackground(),
			includeParametric: contentResource.getIncludeParametric(),
			includeUsageId: contentResource.getIncludeUsageId(),
			metadataFilter: contentResource.getMetadataFilter(),
			useSecureConnection: contentResource.getUseSecureConnection(),
			activateView: contentResource.getActivateView(),
			enableLogger: contentResource.getEnableLogger(),
			pushViewGroups: contentResource.getPushViewGroups(),
			vkScene: scene,

			onActiveCamera: function(newCam) {
				var isInitialCam = false;
				var context = that._loader.getContext(contentResource.getVeid());
				if (context && context.phase < 2) { // 2 -> FinishedMesh
					// CDS is still getting the model
					initialCamera = newCam;
					isInitialCam = true;
				}

				if (!isInitialCam) {
					that.fireCameraChanged({
						sceneId: contentResource.getVeid(),
						camera: newCam
					});
				}
			},
			onInitialSceneFinished: function(initialView) {
				sceneLoaded = true;
				resolve({
					node: parentNode,
					camera: initialCamera,
					contentResource: contentResource,
					initialView: initialView,
					annotations: that.getSceneBuilder()._annotations,
					loader: that // passing cds as loader
				});
			},
			onSceneCompleted: function() {
				that.fireSceneCompleted({
					sceneId: contentResource.getVeid()
				});
			},
			onLoadingFinished: function() {
				var currentViewId, currentViewGroupId;
				if (that._loader && that._loader.currentSceneInfo) {
					var context = that._loader.getContext(that._loader.currentSceneInfo.id);
					if (context) {
						currentViewId = context.currentViewId;
						currentViewGroupId = context.currentViewGroupId;
					}
				}
				that.fireLoadingFinished({
					currentViewId: currentViewId,
					currentViewGroupId: currentViewGroupId
				});
			},
			onContentChangesProgress: function(event) {
				that.fireContentChangesProgress({ source: event.source, phase: event.phase, percentage: event.percentage });
			},
			onInitialViewCompleted: function() {
				that.fireInitialViewCompleted({
					sceneId: contentResource.getVeid()
				});
			}
		};

		var errorCallback = function(info) {
			Log.warning("Content loading error reported:", JSON.stringify(info.getParameters()));

			var reason;
			if (info.getParameter("errorText")) {
				reason = info.getParameter("errorText");
			} else if (info.getParameter("error")) {
				reason = info.getParameter("error");
			} else if (info.getParameter("reason")) {
				reason = info.getParameter("reason");
			} else {
				reason = "failed to load: unknown reason";
			}

			if (sceneLoaded) {
				var errorCode = info.getParameter("error");
				if (errorCode && errorCode === 4) {
					// We had a good connection and now we lost it. Try to re-create connection
					that.initUrl(this._loader.getUrl(), true);
				}
			} else {
				that.detachErrorReported(errorCallback);

				// error from server has some detailed info
				if (info.getParameter("events")) {
					reason = reason + "\n" + JSON.stringify(info.getParameter("events"));
				}

				// if error happened before initial scene finished, we reject
				reject(reason);
			}
		};

		that.attachErrorReported(errorCallback);

		return contextParams;
	};

	ContentDeliveryService.prototype.load = function(parentNode, contentResource, authorizationHandler) {
		var that = this;

		var nodeProxy = contentResource.getNodeProxy();
		if (nodeProxy) {
			this._currentNodeHierarchy = nodeProxy.getNodeHierarchy();
		}

		return new Promise(function(resolve, reject) {
			if (!contentResource.getSource() || !contentResource.getVeid()) {
				reject(getResourceBundle().getText("CONTENTDELIVERYSERVICE_MSG_NOURLORVEID"));
				return;
			}

			that.initUrl(contentResource.getSource(), true);

			var contextParams = that._createLoadParam(resolve, reject, parentNode, contentResource);
			if (that._loader) {
				that._loader.request(contentResource.getVeid(), contextParams, authorizationHandler);
			}
		});
	};

	ContentDeliveryService.prototype.getSceneBuilder = function() {
		if (this._loader) {
			return this._loader.getSceneBuilder();
		}
		return null;
	};

	// as scene node which is a tree node can be dropped by nodeHierarchy.removeNode, we need to update it to cds
	ContentDeliveryService.prototype.decrementResourceCountersForDeletedTreeNode = function(sid) {
		var context = this._loader.getContext(this._loader.currentSceneInfo.id);
		this._loader.decrementResourceCountersForDeletedTreeNode(context, sid);
	};

	// We want to use this for light scene such as POIs and symbols
	// This is mainly used by authoring and whoever loaded transient scene should remove it when done with it.

	/**
	 * Add the transient scene to target parent.
	 * This method returns a promise which is resolved when we get all geometries for simplicity for now.
	 * @param {string} sceneVeId target scene id to update.
	 * @param {any} parentNodeRef parent nodeRef where this transient scene will be added
	 * @param {boolean} useSecureConnection <code>true</code> if use secure connection, otherwise <code>false</code> or <code>undefined</code>
	 * @returns {Promise} returns promise which gives nodeRef for transient scene.
	 */
	ContentDeliveryService.prototype.loadTransientScene = function(sceneVeId, parentNodeRef, useSecureConnection) {
		var that = this;

		return new Promise(function(resolve, reject) {

			if (!sceneVeId || !parentNodeRef) {
				reject(getResourceBundle().getText("CONTENTDELIVERYSERVICE_MSG_INVALIDARGUMENTS"));
				return;
			}

			if (that._transientSceneMap.has(sceneVeId)) {
				// if we already loaded this transientScene, just clone it
				var cloned = that._transientSceneMap.get(sceneVeId).clone(); // note this is cloned

				parentNodeRef.add(cloned);
				resolve({
					nodeRef: cloned
				});
				return;
			}

			if (!that._loader) { // check again
				reject(getResourceBundle().getText("CONTENTDELIVERYSERVICE_MSG_CONTENTDELIVERYSERVICENOTINITIALISED"));
				return;
			}

			var handleLoadingFinished = function() {
				that.detachLoadingFinished(handleLoadingFinished);
				if (that._transientSceneMap.get(sceneVeId)) {
					var cloned = that._transientSceneMap.get(sceneVeId).clone();
					parentNodeRef.add(cloned);
					resolve({
						nodeRef: cloned
					});
				}
			};

			// for load multiple same sceneIds at once
			if (that._loader.contextMap.has(sceneVeId)) {
				that.attachLoadingFinished(handleLoadingFinished);
				return;
			}

			var transientRoot = {};
			transientRoot.name = "transient";
			transientRoot.userData.currentSceneId = that.getSceneBuilder()._currentSceneId;
			var onSceneCompleted = function() {
				var context = that._loader.getContext(sceneVeId);
				context.onSceneCompletedCallbacks.detach(onSceneCompleted); // clean up callback
				transientRoot.userData.entityId = context.defaultRootEntityId;
				that._transientSceneMap.set(sceneVeId, transientRoot);

				var cloned = transientRoot.clone(); // note this is cloned.
				parentNodeRef.add(cloned);

				resolve({
					nodeRef: cloned
				});
			};

			var contextParams = {
				root: transientRoot,
				onSceneCompleted: onSceneCompleted,
				useSecureConnection: useSecureConnection
			};

			that._loader.request(sceneVeId, contextParams); // .request ends

		}); // promise ends
	};

	/**
	 * Update contents from Content delivery service
	 * @param {string} sceneId target scene id to update.
	 * @param {string[]} sids target sids to update.
	 * @param {string} viewId optional. Associated view if exists
	 * @returns {Promise} returns promise of content deliver service update
	 */
	ContentDeliveryService.prototype.update = function(sceneId, sids, viewId) {
		var that = this;

		return new Promise(function(resolve, reject) {

			if (!that._loader) {
				reject(getResourceBundle().getText("CONTENTDELIVERYSERVICE_MSG_CONTENTDELIVERYSERVICENOTINITIALISED"));
				return;
			}

			that._loader.update(sceneId, sids, viewId).then(function(result) {

				if (that._currentNodeHierarchy) {
					for (var i = 0; i < result.replacedNodeRefs.length; i++) {
						that._currentNodeHierarchy.fireNodeReplaced({
							ReplacedNodeRef: result.replacedNodeRefs[i],
							ReplacementNodeRef: result.replacementNodeRefs[i],
							ReplacedNodeId: result.replacedNodeRefs[i],
							ReplacementNodeId: result.replacementNodeRefs[i]
						});
					}
				}
				resolve({
					sceneVeId: result.sceneVeId,
					sids: result.sidArray
				});
			}).catch(function(error) {
				return reject(error);
			});
		}); // promise ends
	};

	ContentDeliveryService.prototype.exit = function() {
		if (this._loader) {
			this._loader.dispose();
			this._loader = null;
		}

		this._transientSceneMap = null;
	};

	/**
	 * Gets view object definition
	 * @param {string} sceneId target scene id
	 * @param {string} viewId view id
	 * @param {string} type type of view. (static or dynamic) - default static
	 * @param {boolean} includeAnimation if loading playbacks/animation sequences contained in the view
	 * @returns {sap.ui.vk.View} returns View object with definition
	 */
	ContentDeliveryService.prototype.loadView = function(sceneId, viewId, type, includeAnimation) {

		if (typeof type === "undefined") {
			type = "static";
		}
		var that = this;
		return this._loader.requestView(sceneId, type, viewId, null, includeAnimation).then(function(view) {

			if (that._currentNodeHierarchy && view.updatedNodes) {
				for (var i = 0; i < view.updatedNodes.length; i++) {
					that._currentNodeHierarchy.fireNodeUpdated({ nodeRef: view.updatedNodes[i] });
				}
			}
			that.fireSceneUpdated({});
			return view;
		}).catch(function(error) {
			Log.error(error);
			return null;
		});
	};

	/**
	 * Gets view object definition
	 * @param {string} sceneId target scene id
	 * @param {string} viewId view id
	 * @param {string[]} playbackIds array of playback ids
	 * @returns {sap.ui.vk.View} returns View object with definition
	 */
	ContentDeliveryService.prototype.updatePlaybacks = function(sceneId, viewId, playbackIds) {

		var that = this;

		return this._loader.requestView(sceneId, "static", viewId, playbackIds, true).then(function(view) {

			if (that._currentNodeHierarchy && view.updatedNodes) {
				for (var i = 0; i < view.updatedNodes.length; i++) {
					that._currentNodeHierarchy.fireNodeUpdated({ nodeRef: view.updatedNodes[i] });
				}
			}
			that.fireSceneUpdated({});
			return view;
		}).catch(function(error) {
			Log.error(error);
			return null;
		});
	};

	/**
	 * Gets view object definition
	 * @param {string} sceneId target scene id
	 * @param {string} viewGroupId view group id
	 * @param {boolean} includeAnimation if loading playbacks/animation sequences contained in the view
	 * @returns {sap.ui.vk.View[]} returns array of views
	 */
	ContentDeliveryService.prototype.loadViewGroup = function(sceneId, viewGroupId, includeAnimation) {

		var that = this;
		return this._loader.requestViewGroup(sceneId, viewGroupId, includeAnimation).then(function(views) {
			that.fireSceneUpdated({});
			return views;
		}).catch(function(error) {
			Log.error(error);
			return null;
		});
	};

	/**
	 * Gets annotation
	 * @param {string} sceneId target scene id
	 * @param {string} annotationId id
	 * @returns {sap.ui.vk.Annotation} returns annotation
	 */
	ContentDeliveryService.prototype.loadAnnotation = function(sceneId, annotationId) {

		var that = this;
		return this._loader.requestAnnotation(sceneId, annotationId).then(function(annotation) {
			that.fireSceneUpdated({});
			return annotation;
		}).catch(function(error) {
			Log.error(error);
			return null;
		});
	};



	/**
	 * Assign material to an array of nodes, or to the nodes in the scene tree but not in the array of nodes, if a node is not a mesh node
	 * and has no material, the material is assigned to its descendent nodes.
	 * @param {string} sceneId target scene id
	 * @param {string|sap.ve.threejs.Material|object} material material to be assigned to the nodes. The value can be a string containing material ID, a Material object or object containing material ID or VE ID.
	 * @param {string} material.id material id or
	 * @param {string} material.veId material VE ID
	 * @param {any[]} nodeRefs the array of node references.
	 * @param {boolean} assignToRestOfSceneTree if <code>false</code> or <code>undefined</code> assign material to the nodes in <code>nodeRefs</code>;
	 * 		  if <code>true</code> assign material to the nodes in the scene tree but not in <code>nodeRefs</code>
	 * @returns {Promise} returns promise which gives <code>true</code> if material is successfully assigned, and <code>false</code> otherwise
	 */
	ContentDeliveryService.prototype.assignMaterialToNodes = function(sceneId, material, nodeRefs, assignToRestOfSceneTree) {
		// Not implemented for 2D

		return (Promise.resolve());
	};

	/**
	 * Replace material on an array of nodes; if a node is not a mesh node and has no material,
	 * the material is replaced on its descendants.
	 * @param {string} sceneId target scene id
	 * @param {string|sap.ve.threejs.Material|object} originalMaterial material to be replaced. The value can be a string containing material ID, a Material object or object containing material ID or VE ID.
	 * @param {string} originalMaterial.id original material id or
	 * @param {string} originalMaterial.veId original material VE ID
	 * @param {string|sap.ve.threejs.Material|object} replacementMaterial replacement material. The value can be a string containing material ID, a Material object or object containing material ID or VE ID.
	 * @param {string} replacementMaterial.id original material id or
	 * @param {string} replacementMaterial.veId original material VE ID
	 * @param {any|any[]} nodeRefs node reference or array of node references. If null, then the
	 * replacement occurs on the Scene
	 * @returns {Promise} returns promise which gives <code>true</code> if material is successfully
	 * replaced, and <code>false</code> otherwise
	 */
	ContentDeliveryService.prototype.replaceMaterialOnNodes = function(sceneId, originalMaterial, replacementMaterial, nodeRefs) {
		// Not implemented for 2D

		return (Promise.resolve());
	};

	ContentDeliveryService.prototype.printLogTokens = function() {
		if (this._loader) {
			this._loader.printLogTokens();
			return true;
		} else {
			return false;
		}
	};

	return ContentDeliveryService;
});
