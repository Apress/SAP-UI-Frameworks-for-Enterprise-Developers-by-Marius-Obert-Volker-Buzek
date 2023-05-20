/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"./SceneContext",
	"./CallbackHandler",
	"./Command",
	"./TotaraUtils",
	"../IncludeUsageIdType",
	"../helpers/WorkerScriptLoader"
], function(
	Log,
	SceneContext,
	CallbackHandler,
	Command,
	TotaraUtils,
	IncludeUsageIdType,
	WorkerScriptLoader
) {
	"use strict";

	var mark = TotaraUtils.mark;  // performance mark

	var TotaraLoader = function() {
		this._performanceTimingMsg = [];
		this._isPostable = true;
		this._suppressSendRequests = false;
		this._loadingFinishedSent = false;

		this.currentSceneInfo = {}; // TODO: should be removed!

		this.contextMap = new Map();      // sceneId -> SceneContext. One 3D model can consist of multiple 3D scenes loaded from the (same?) storage service.
		this.tokenContextMap = new Map(); // token -> SceneContext

		// This flag is used to disable retrieving inner boxes and building marching cubes.
		this._skipLowLODRendering = true;
		this._maxUrlLength = 2048;
		this._maxActiveRequests = 4;
		this._meshesBatchSize = 1024;
		this._materialsBatchSize = 128;
		this._geometriesBatchSize = 1024;
		this._geometriesMaxBatchDataSize = 10 * 1024 * 1024;
		this._geomMeshesBatchSize = 1024;
		this._parametricsBatchSize = 1024;
		this._geomMeshesMaxBatchDataSize = 10 * 1024 * 1024;
		this._annotationsBatchSize = 128;
		this._tracksBatchSize = 128;
		this._sequencesBatchSize = 128;
		this._voxelThreshold = 0.03;

		// event related
		this.onErrorCallbacks = new CallbackHandler();
		this.onImageFinishedCallbacks = new CallbackHandler();
		this.onImageDetailsFinishedCallbacks = new CallbackHandler();
		this.onMaterialFinishedCallbacks = new CallbackHandler();
		this.onAnnotationFinishedCallbacks = new CallbackHandler();
		this.onSetGeometryCallbacks = new CallbackHandler();
		this.onSetSequenceCallbacks = new CallbackHandler();
		this.onSetTrackCallbacks = new CallbackHandler();
		this.onViewGroupUpdatedCallbacks = new CallbackHandler();
		this.onLoadingFinishedCallbacks = new CallbackHandler();
	};

	TotaraLoader.prototype.running = function() {
		return this._worker !== null && this._worker !== undefined;
	};

	/**
	 * Start TotaraLoaderWorker in a separate thread.
	 *
	 * @private
	 * @returns {Promise} A <code>Promise</code> which resolves with a string value when a Worker thread is ready.
	 */
	TotaraLoader.prototype.run = function() {
		if (!this._worker) {
			this._worker = WorkerScriptLoader.loadScript("sap/ui/vk/totara/TotaraLoaderWorker.js");

			var that = this;

			this._worker.onmessage = function(event) {
				var data = event.data;

				data.jsonContent = data.jsonContent || {};

				if (data.jsonString) {
					var jsonContent = JSON.parse(data.jsonString);
					delete data.jsonString;
					data.jsonContent = Object.assign(jsonContent, data.jsonContent);
				}

				var context = that.processCommand(data.name, data.jsonContent, data.binaryContent, data.isInitial);

				if (context) {
					that.sendRequest(context.requestQueue);
				}
			};

			this._worker.onerror = function(event) {
				// Log.error("Error in WebWorker", event);
			};
		}

		return Promise.resolve("TotaraLoader is ready");
	};

	TotaraLoader.prototype.getUrl = function() {
		return this._url;
	};

	TotaraLoader.prototype.setUrl = function(url) {
		this._url = url;
		if (!this._url.endsWith("/")) {
			this._url += "/";
		}
		return this;
	};

	TotaraLoader.prototype.getCorrelationId = function() {
		return this._correlationId;
	};

	TotaraLoader.prototype.setCorrelationId = function(correlationId) {
		this._correlationId = correlationId;
		return this;
	};

	TotaraLoader.prototype.getSkipLowLODRendering = function() {
		return this._skipLowLODRendering;
	};

	TotaraLoader.prototype.setSkipLowLODRendering = function(skipLowLODRendering) {
		this._skipLowLODRendering = skipLowLODRendering;
		return this;
	};

	TotaraLoader.prototype.getMaxUrlLength = function() {
		return this._maxUrlLength;
	};

	TotaraLoader.prototype.setMaxUrlLength = function(maxUrlLength) {
		this._maxUrlLength = maxUrlLength;
		return this;
	};

	TotaraLoader.prototype.getMaxActiveRequests = function() {
		return this._maxActiveRequests;
	};

	TotaraLoader.prototype.setMaxActiveRequests = function(maxActiveRequests) {
		this._maxActiveRequests = maxActiveRequests;
		this.postMessage({
			method: Command.setMaxActiveRequests,
			maxActiveRequests: maxActiveRequests
		});
	};

	TotaraLoader.prototype.getMeshesBatchSize = function() {
		return this._meshesBatchSize;
	};

	TotaraLoader.prototype.setMeshesBatchSize = function(meshesBatchSize) {
		this._meshesBatchSize = meshesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getMaterialsBatchSize = function() {
		return this._materialsBatchSize;
	};

	TotaraLoader.prototype.setMaterialsBatchSize = function(materialsBatchSize) {
		this._materialsBatchSize = materialsBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeometriesBatchSize = function() {
		return this._geometriesBatchSize;
	};

	TotaraLoader.prototype.setGeometriesBatchSize = function(geometriesBatchSize) {
		this._geometriesBatchSize = geometriesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeometriesMaxBatchDataSize = function() {
		return this._geometriesMaxBatchDataSize;
	};

	TotaraLoader.prototype.setGeometriesMaxBatchDataSize = function(geometriesMaxBatchDataSize) {
		this._geometriesMaxBatchDataSize = geometriesMaxBatchDataSize;
		return this;
	};

	TotaraLoader.prototype.getGeomMeshesBatchSize = function() {
		return this._geomMeshesBatchSize;
	};

	TotaraLoader.prototype.setGeomMeshesBatchSize = function(geomMeshesBatchSize) {
		this._geomMeshesBatchSize = geomMeshesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getParametricsBatchSize = function() {
		return this._parametricsBatchSize;
	};

	TotaraLoader.prototype.setParametricsBatchSize = function(parametricsBatchSize) {
		this._parametricsBatchSize = parametricsBatchSize;
		return this;
	};

	TotaraLoader.prototype.getGeomMeshesMaxBatchDataSize = function() {
		return this._geomMeshesMaxBatchDataSize;
	};

	TotaraLoader.prototype.setGeomMeshesMaxBatchDataSize = function(geomMeshesMaxBatchDataSize) {
		this._geomMeshesMaxBatchDataSize = geomMeshesMaxBatchDataSize;
		return this;
	};

	TotaraLoader.prototype.getAnnotationsBatchSize = function() {
		return this._annotationsBatchSize;
	};

	TotaraLoader.prototype.setAnnotationsBatchSize = function(annotationsBatchSize) {
		this._annotationsBatchSize = annotationsBatchSize;
		return this;
	};

	TotaraLoader.prototype.getTracksBatchSize = function() {
		return this._tracksBatchSize;
	};

	TotaraLoader.prototype.setTracksBatchSize = function(tracksBatchSize) {
		this._tracksBatchSize = tracksBatchSize;
		return this;
	};

	TotaraLoader.prototype.getSequencesBatchSize = function() {
		return this._sequencesBatchSize;
	};

	TotaraLoader.prototype.setSequencesBatchSize = function(sequencesBatchSize) {
		this._sequencesBatchSize = sequencesBatchSize;
		return this;
	};

	TotaraLoader.prototype.getVoxelThreshold = function() {
		return this._voxelThreshold;
	};

	TotaraLoader.prototype.setVoxelThreshold = function(voxelThreshold) {
		this._voxelThreshold = voxelThreshold;
		if (this.sceneBuilder) {
			this.sceneBuilder.setVoxelThreshold(voxelThreshold);
		}
		return this;
	};

	TotaraLoader.prototype.setSceneBuilder = function(sceneBuilder) {
		this.sceneBuilder = sceneBuilder;
		this.sceneBuilder.setVoxelThreshold(this.getVoxelThreshold());
	};

	TotaraLoader.prototype.removeContext = function(sceneId) {
		this.contextMap.delete(sceneId);
		return this;
	};

	TotaraLoader.prototype.dispose = function() {
		this.contextMap.forEach(function(context) {
			context.dispose();
		});
		this.contextMap.clear();
		this.tokenContextMap.clear();

		if (this._worker != null) {
			this.postMessage({ method: "close" });
			this._worker = this._worker.onmessage = this._worker.onerror = null;
		}

		this.currentSceneInfo = null;

		if (this.sceneBuilder) {
			this.sceneBuilder.cleanup();
			this.sceneBuilder = null;
		}

		this.onErrorCallbacks = null;
		this.onMaterialFinishedCallbacks = null;
		this.onImageFinishedCallbacks = null;
		this.onImageDetailsFinishedCallbacks = null;
		this.onSetGeometryCallbacks = null;
		this.onSetTrackCallbacks = null;
		this.onSetSequenceCallbacks = null;
		this.onAnnotationFinishedCallbacks = null;
	};

	TotaraLoader.prototype.cleanup = function() {
		this.currentSceneInfo = {};
		this.contextMap.clear();
		this.tokenContextMap.clear();

		this.sceneBuilder.cleanup();
	};

	TotaraLoader.prototype.getSceneBuilder = function() {
		return this.sceneBuilder;
	};

	TotaraLoader.prototype.getContext = function(sceneId) {
		return this.contextMap.get(sceneId);
	};

	TotaraLoader.prototype.createContext = function(sceneId, params) {
		var context = new SceneContext(sceneId, params, this);

		this.contextMap.set(sceneId, context);
		this.tokenContextMap.set(context.requestQueue.token, context);

		// attach callbacks
		if (context.onActiveCamera) {
			context.onActiveCameraCallbacks.attach(context.onActiveCamera);
			delete context.onActiveCamera;
		}

		if (context.onInitialSceneFinished) {
			context.onInitialSceneFinishedCallbacks.attach(context.onInitialSceneFinished);
			delete context.onInitialSceneFinished;
		}

		if (context.onPartialRetrievalFinished) {
			context.onPartialRetrievalFinishedCallbacks.attach(context.onPartialRetrievalFinished);
			delete context.onPartialRetrievalFinished;
		}

		if (context.onViewFinished) {
			context.onViewFinishedCallbacks.attach(context.onViewFinished);
			delete context.onViewFinished;
		}

		if (context.onSceneCompleted) {
			context.onSceneCompletedCallbacks.attach(context.onSceneCompleted);
			delete context.onSceneCompleted;
		}

		if (context.onProgressChanged) {
			context.setOnProgressChanged(context.onProgressChanged);
			delete context.onProgressChanged;
		}

		if (context.onLoadingFinished) {
			this.onLoadingFinishedCallbacks.detachAll();
			this.onLoadingFinishedCallbacks.attach(context.onLoadingFinished);
			delete context.onLoadingFinished;
		}

		if (context.onContentChangesProgress) {
			context.onContentChangesProgressCallbacks.attach(context.onContentChangesProgress);
			delete context.onContentChangesProgress;
		}

		if (context.onInitialViewCompleted) {
			context.onInitialViewCompletedCallbacks.attach(context.onInitialViewCompleted);
			delete context.onInitialViewCompleted;
		}

		return context;
	};

	TotaraLoader.prototype.isLoadingFinished = function() {
		var contextIterator = this.contextMap.values();
		var contextItem = contextIterator.next();
		while (!contextItem.done) {
			if (!contextItem.value.isLoadingFinished()) {
				return false;
			}
			contextItem = contextIterator.next();
		}

		// console.log("!!!!! Loading finished", this);
		return true;
	};

	TotaraLoader.prototype.decrementResourceCountersForDeletedTreeNode = function(context, nodeId) {
		if (context) {
			this.sceneBuilder.decrementResourceCountersForDeletedTreeNode(nodeId, context.sceneId);
		}
	};

	function logPerformance(context, name) {
		if (context.progressLogger) {
			context.progressLogger.logPerformance(name, context.token);
		}
	}

	/**
	 *  Start loading a scene.
	 *
	 * @param {string}   sceneVeId              An ID of the scene to load.
	 * @param {object}   contextParams          Parameters that can affect what type of resources to request from the server.
	 * @param {function} [authorizationHandler] An optional authorization handler function.
	 */
	TotaraLoader.prototype.request = function(sceneVeId, contextParams, authorizationHandler) {
		if (!contextParams.root) {
			throw "Context must include root where loaded objects are attached to";
		}

		var context = this.createContext(sceneVeId, contextParams);
		context.token = context.requestQueue.token;

		this.currentSceneInfo.id = sceneVeId;
		context.retrievalType = SceneContext.RetrievalType.Initial;
		context.authorizationHandler = authorizationHandler;

		context.initialRequestTime = Date.now();

		if (context.enableLogger) {
			TotaraUtils.createLogger(sceneVeId, context, this);
		}

		var maxUrlLength;
		if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
			maxUrlLength = Math.min(2 * 1024, this.getMaxUrlLength());
		} else if (sap.ui.Device.browser.mobile) {
			maxUrlLength = Math.min(8 * 1024, this.getMaxUrlLength());
		} else {
			maxUrlLength = Math.min(64 * 1024, this.getMaxUrlLength());
		}

		var batchSizeInfo = getBatchSizeInfo(
			this.getUrl() + "streaming-http",
			this.getUrl(),
			sceneVeId,
			this.getCorrelationId(),
			maxUrlLength
		);

		var requestQueue = context.requestQueue;
		requestQueue.meshes.setBatchSizeInfo(batchSizeInfo[Command.getMesh]);
		requestQueue.materials.setBatchSizeInfo(batchSizeInfo[Command.getMaterial]);
		requestQueue.geometries.setBatchSizeInfo(batchSizeInfo[Command.getGeometry]);
		requestQueue.geomMeshes.setBatchSizeInfo(batchSizeInfo[Command.getGeomMesh]);
		requestQueue.annotations.setBatchSizeInfo(batchSizeInfo[Command.getAnnotation]);
		requestQueue.tracks.setBatchSizeInfo(batchSizeInfo[Command.getTrack]);
		requestQueue.sequences.setBatchSizeInfo(batchSizeInfo[Command.getSequence]);
		requestQueue.parametric.setBatchSizeInfo(batchSizeInfo[Command.getParametric]);

		var that = this;
		(authorizationHandler && authorizationHandler(this.getUrl()) || Promise.resolve())
			.then(function(accessTokenResponse) {
				logPerformance(context, "modelRequested");
				mark("modelRequested");

				that.postMessage({
					method: "useAccessTokenResponse",
					accessTokenResponse: accessTokenResponse
				});

				that.postMessage({
					method: "initializeConnection",
					url: that.getUrl(),
					cid: that.getCorrelationId(),
					maxActiveRequests: that.getMaxActiveRequests()
				});

				that.postMessage({
					method: Command.getScene,
					sceneId: sceneVeId
				});
			});
	};

	TotaraLoader.prototype.postMessage = function(message) {
		if (this._worker) {
			this._worker.postMessage(message);
		}
	};

	TotaraLoader.prototype.processSetSceneCommand = function(jsonContent) {
		var context = this.getContext(jsonContent.veid);

		if (context) {
			context.defaultViewId = jsonContent.defaultViewId;
			context.defaultViewGroupId = jsonContent.defaultViewGroupId;
			context.sceneThumbnailId = jsonContent.imageId;
			context.dimension = jsonContent.dimension;
			context.defaultRootEntityId = jsonContent.defaultRootEntityId;

			if (context.defaultViewGroupId) {
				context.currentViewGroupId = context.defaultViewGroupId;
			}

			var viewId;

			if (context.activateView) {
				viewId = context.activateView;
			} else if (context.defaultViewId) {
				viewId = context.defaultViewId;
			}

			if (viewId) {
				context.initialViewId = context.currentViewId = viewId;
				context.initialViewDecided = true;
			}

			// getScene is the first streaming API that is called when you load a resource.
			// one of the things it returns is the initialViewId that is used to create the getView command.
			// Set the command's context to have isInitial true so that all contextCommands following setView for this
			// initial default view get it as well and we can determine when initialView is loaded.
			this.postMessage({
				method: Command.getView,
				parameters: {
					sceneId: context.sceneId,
					viewId: viewId,
					query: TotaraUtils.configureSceneViewQuery(context)
				},
				// TODO: this is a temporary workaround
				// Requesting view groups should not be a part of requesting a view, it should be a separate
				// command. But to avoid more refactoring we will request view groups as part of the initial getView
				// like it was done in the Streaming Protocol implementation.
				pushViewGroups: context.pushViewGroups,
				isInitial: true
			});
		}
	};

	// Returns promise that performs partial tree retrieval
	// Partial tree retrieval is considered finished when we get all the meshes
	// If there is no need to retrieve meshes (e.g delete node), it will finish
	// when the tree building is finished.
	// viewId is optional
	TotaraLoader.prototype.update = function(sceneId, sidArray, viewId) {
		this.currentSceneInfo.id = sceneId;

		var context = this.getContext(sceneId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		var that = this;
		return new Promise(function(resolve, reject) {
			context.nodeSidsForPartialTree = new Set(sidArray);
			context.retrievalType = SceneContext.RetrievalType.Partial;

			var callback = function() {
				context.onPartialRetrievalFinishedCallbacks.detach(callback);
				logPerformance(context, "updateFinished(mesh)");
				var rnks = [];
				var rnvs = [];
				context.replacedNodes.forEach(function(value, key) {
					rnvs.push(value);
					rnks.push(key);
				});

				var replacedNodes = rnks; // Array.from(context.replacedNodes.keys());
				var replacementNodes = rnvs; // Array.from(context.replacedNodes.values());
				resolve({
					sceneVeId: sceneId,
					sids: sidArray,
					replacedNodeRefs: replacedNodes,
					replacementNodeRefs: replacementNodes
				}); // successfully finished partial retrieval
			};

			context.onPartialRetrievalFinishedCallbacks.attach(callback);

			logPerformance(context, "updateRequested");

			that.postMessage({
				method: Command.getView,
				parameters: {
					sceneId: sceneId,
					viewId: viewId,
					query: Object.assign(TotaraUtils.configureSceneViewQuery(context), { breadcrumbs: true }),
					sids: sidArray
				},
				isPartialTree: true
			});
		});
	};

	TotaraLoader.prototype.requestViewGroup = function(sceneVeId, viewGroupId, includeAnimation) {
		if (!viewGroupId) {
			return Promise.reject("invalid arg: viewGroupId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		if (includeAnimation !== undefined) {
			context.includeAnimation = includeAnimation;
		}

		var that = this;
		var promise = new Promise(function(resolve, reject) {
			var views = that.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
			if (views && views.length) {
				resolve(views);
				return;
			}

			var callback = function() {
				context.onViewGroupFinishedCallbacks.detach(callback);

				logPerformance(context, "onViewGroupFinished");

				var viewgroup = that.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
				if (viewgroup && viewgroup.length) {
					resolve(viewgroup);
				} else {
					reject("no view ground data");
				}
			};
			context.onViewGroupFinishedCallbacks.attach(callback);

			context.currentViewGroupId = viewGroupId;

			that.postMessage({
				method: "getViewGroups",
				parameters: {
					sceneId: sceneVeId,
					viewGroupId: viewGroupId
				}
			});
		});
		return promise;
	};

	// Request either the whole view or playbacks only.
	// TODO: create a separate method for requesting playbacks only.
	TotaraLoader.prototype.requestView = function(sceneVeId, viewType, viewId, playbackIds, includeAnimation) {
		this.currentSceneInfo.id = sceneVeId;

		if (viewType !== "static") {
			return Promise.reject("invalid arg: supported type - static");
		}

		if (!viewId) {
			return Promise.reject("invalid arg: viewId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		context.currentViewId = viewId;

		var query;
		var methodName;

		if (playbackIds && playbackIds.length > 0) {
			methodName = Command.getViewAnimations;

			// NB: there is a bug in the current Storage Service implementation: the `/scenes/X/views/Y/animations` endpoint
			// returns only playbacks if there is the $expand parameter with any value (including empty).
			// TODO: add a proper implementation of the $expand parameter.
			query = {
				$expand: []
			};

			context.playbackIds = playbackIds; // WTF? this is like a global variable for filtering the response!
		} else {
			methodName = Command.getView;

			query = TotaraUtils.configureSceneViewQuery(context);
		}

		this.hasAnimation = false;   // will be check on callback of setPlayback.

		var that = this;
		var promise = new Promise(function(resolve, reject) {
			context.onSetPlaybackCallbacks.detachAll();
			var setPlaybackCallback = function(resultView) {
				context.onSetPlaybackCallbacks.detach(setPlaybackCallback);

				logPerformance(context, "onSetPlayback");

				if (resultView) {
					resolve(resultView);
				} else {
					reject("no view data");
				}
			};
			context.onSetPlaybackCallbacks.attach(setPlaybackCallback);

			context.onViewFinishedCallbacks.detachAll();
			var callback = function(resultView) {
				context.onViewFinishedCallbacks.detach(callback);

				logPerformance(context, "onViewFinished");

				if (!that.hasAnimation) {
					if (resultView) {
						resolve(resultView);
					} else {
						reject("no view data");
					}
				} else {
					context.currentView = resultView;

				}
			};
			context.onViewFinishedCallbacks.attach(callback);

			that.onSetSequenceCallbacks.detachAll();
			var setSequenceCallback = function() {
				that.onSetSequenceCallbacks.detach(setSequenceCallback);

				logPerformance(context, "onSetSequence");

				if (context.currentView) {
					resolve(context.currentView);
				}
			};
			that.onSetSequenceCallbacks.attach(setSequenceCallback);

			that.onSetTrackCallbacks.detachAll();
			var setTrackCallback = function(resultView) {
				that.onSetTrackCallbacks.detach(setTrackCallback);

				logPerformance(context, "onSetTrack");

				if (context.currentView) {
					resolve(context.currentView);
				}
			};
			that.onSetTrackCallbacks.attach(setTrackCallback);

			logPerformance(context, "viewRequested");

			that.postMessage({
				method: methodName,
				parameters: {
					sceneId: context.sceneId,
					viewId: viewId,
					query: query
				}
			});
		});

		return promise;
	};

	/**
	 * Replace material on an array of nodes; if a node is not a mesh node and has no material,
	 * the material is replaced on its descendants.
	 * @param {string} sceneVeId scene VE ID
	 * @param {string|sap.ve.threejs.Material|object} requestedMaterial requested material. The value can be a string containing material ID, a Material object or object containing material ID or VE ID.
	 * @param {string} originalMaterial.id material id or
	 * @param {string} originalMaterial.veId material VE ID
	 * @returns {Promise} returns promise which gives {THREE.Material} three.js material
	 */
	TotaraLoader.prototype.requestMaterial = function(sceneVeId, requestedMaterial) {
		if (!requestedMaterial) {
			return Promise.reject("invalid arg: requestedMaterial undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		var that = this;
		var promise = new Promise(function(resolve, reject) {
			var materialId = "";
			if (typeof requestedMaterial == "string") {
				materialId = requestedMaterial;
			} else if (typeof requestedMaterial == "object") {
				// sap.ve.threejs.Material
				if (typeof requestedMaterial.getMaterialRef === "function") {
					resolve(requestedMaterial.getMaterialRef());
					return;
				} else if (requestedMaterial.id) {
					materialId = requestedMaterial.id;
				} else if (requestedMaterial.veId) {
					// todo: how do we find a material by VEID?
					materialId = requestedMaterial.veId;
				} else {
					reject("invalid arg: invalid requestedMaterial object");
					return;
				}
			} else {
				reject("invalid arg: requestedMaterial must be an object or a string");
				return;
			}

			var material = context.sceneBuilder.getMaterial(materialId);
			if (material) {
				resolve(material);
				return;
			}

			context.requestQueue.materials.push(materialId);

			var textureAddedToMaterialCallback = function(result) {
				if (materialId !== result.materialId) { // make sure right callback is called
					return;
				}
				var m = that.sceneBuilder.getMaterial(materialId);
				if (m && !m.userData.imageIdsToAddAsTexture) {// no more texture to add, this material is now completed, resolve the promise
					that.sceneBuilder.detachImageAddedToMaterial(textureAddedToMaterialCallback);
					resolve(m);
				}
			};

			var materialFinishedCallback = function(newMaterialId) {
				if (materialId != newMaterialId) {
					return;
				}

				that.onMaterialFinishedCallbacks.detach(materialFinishedCallback);

				var m = that.sceneBuilder.getMaterial(materialId);
				if (!m) {
					that.sceneBuilder.detachImageAddedToMaterial(textureAddedToMaterialCallback);
					reject("no material data");
				}

				if (m.userData.imageIdsToAddAsTexture) {
					// we are waiting for material textures to arrive
					return;
				}

				// no texture images to load, detach texture callback and resolve the promise
				that.sceneBuilder.detachImageAddedToMaterial(textureAddedToMaterialCallback);
				resolve(m);
			};

			that.onMaterialFinishedCallbacks.attach(materialFinishedCallback);

			that.sceneBuilder.attachImageAddedToMaterial(textureAddedToMaterialCallback);

			that.sendRequest(context.requestQueue);
		});

		return promise;
	};

	TotaraLoader.prototype.requestAnnotation = function(sceneVeId, annotationId) {
		if (!annotationId) {
			return Promise.reject("invalid arg: annotationId undefined");
		}

		var context = this.getContext(sceneVeId);
		if (!context) {
			return Promise.reject("no context for ${sceneVeId}");
		}

		var that = this;
		var promise = new Promise(function(resolve, reject) {

			var getAnnotation = function(annotationIdToBeRetrieved) {
				return context.sceneBuilder.getAnnotation ?
					context.sceneBuilder.getAnnotation(annotationIdToBeRetrieved) : null;
			};

			// NYT for threejs SceneBuilder.
			var annotation = getAnnotation(annotationId);
			if (annotation) {
				resolve(annotation);
				return;
			}

			context.requestQueue.annotations.push(annotationId);

			var annotationFinishedCallback;
			var materialFinishedCallback;

			var imageDetailFinishedCallback = function(result) {
				that.onAnnotationFinishedCallbacks.detach(annotationFinishedCallback);

				var fetchedAnnotation = getAnnotation(annotationId);

				var m = that.sceneBuilder._getMaterial(fetchedAnnotation.label.materialId);

				if (m && m.userData.imageDetailsToLoad && !m.userData.imageDetailsToLoad.size) {// no more texture images to load, this material is now completed, resolve the promise
					that.onImageDetailsFinishedCallbacks.detach(imageDetailFinishedCallback);

					if (m.userData.imageIdsToLoad && m.userData.imageIdsToLoad.size) {
						// We are waiting for Images binary content
						return;
					}
					resolve(fetchedAnnotation);
				}
			};

			var imageFinishedCallback = function(result) {
				that.onAnnotationFinishedCallbacks.detach(annotationFinishedCallback);

				var fetchedAnnotation = getAnnotation(annotationId);

				var m = that.sceneBuilder._getMaterial(fetchedAnnotation.label.materialId);

				if (m && m.userData.imageIdsToLoad && !m.userData.imageIdsToLoad.size) {// no more texture images to load, this material is now completed, resolve the promise
					that.onImageFinishedCallbacks.detach(imageFinishedCallback);

					if (m.userData.imageDetailsToLoad && m.userData.imageDetailsToLoad.size) {
						// We are waiting for Image dimensions
						return;
					}
					resolve(fetchedAnnotation);
				}
			};

			materialFinishedCallback = function(newMaterialId) {
				that.onAnnotationFinishedCallbacks.detach(annotationFinishedCallback);
				var fetchedAnnotation = getAnnotation(annotationId);

				if (fetchedAnnotation.label.materialId != newMaterialId) {
					return;
				}

				that.onMaterialFinishedCallbacks.detach(materialFinishedCallback);

				if (!that.sceneBuilder.checkMaterialExists(newMaterialId, false)) {
					that.onImageFinishedCallbacks.detach(imageFinishedCallback);
					reject("no material data");
				}

				var m = that.sceneBuilder._getMaterial(newMaterialId);
				if ((m.userData.imageIdsToLoad && m.userData.imageIdsToLoad.size) ||
					(m.userData.imageDetailsToLoad && m.userData.imageDetailsToLoad.size)) {
					// we are waiting for material textures/texture dimensions to arrive
					return;
				}

				// no texture images/dimensions to load, detach image & image details callback and resolve the promise
				that.onImageFinishedCallbacks.detach(imageFinishedCallback);
				that.onImageDetailsFinishedCallbacks.detach(imageDetailFinishedCallback);
				resolve(fetchedAnnotation);
			};

			annotationFinishedCallback = function(newAnnotationId) {
				// This won't be invoked from SceneContext if annotation refers to a material that isn't
				// available yet
				if (annotationId !== newAnnotationId) {
					return;
				}

				that.onAnnotationFinishedCallbacks.detach(annotationFinishedCallback);

				var fetchedAnnotation = that.sceneBuilder.getAnnotation ? that.sceneBuilder.getAnnotation(annotationId)
					: null;

				if (!fetchedAnnotation) {
					that.onMaterialFinishedCallbacks.detach(materialFinishedCallback);
					that.onImageFinishedCallbacks.detach(imageFinishedCallback);
					that.onImageDetailsFinishedCallbacks.detach(imageDetailFinishedCallback);
					reject("no annotation data");
				}

				// materials (and hence textures) have already been downloaded, else
				that.onMaterialFinishedCallbacks.detach(materialFinishedCallback);
				that.onImageFinishedCallbacks.detach(imageFinishedCallback);
				that.onImageDetailsFinishedCallbacks.detach(imageDetailFinishedCallback);
				resolve(fetchedAnnotation);
			};

			that.onAnnotationFinishedCallbacks.attach(annotationFinishedCallback);

			that.onMaterialFinishedCallbacks.attach(materialFinishedCallback);

			that.onImageFinishedCallbacks.attach(imageFinishedCallback);

			that.onImageDetailsFinishedCallbacks.attach(imageDetailFinishedCallback);

			that.sendRequest(context.requestQueue);
		});

		return promise;
	};

	TotaraLoader.prototype.setSuppressSendRequests = function(suppressSendRequests) {
		this._suppressSendRequests = suppressSendRequests;
	};

	TotaraLoader.prototype.sendRequest = function(requestQueue) {
		if (!this._worker || this._suppressSendRequests) {
			return false;
		}

		var somethingRequested = false;

		while (!requestQueue.isEmpty()) {
			var newCommand = requestQueue.generateRequestCommand();
			// console.log("postMessage", newCommand);
			this.postMessage(newCommand);
			somethingRequested = true;
		}

		return somethingRequested;
	};

	TotaraLoader.prototype.timestamp = function(jsonContent) {
	};

	TotaraLoader.prototype.performanceTiming = function(jsonContent) {
	};

	TotaraLoader.prototype.checkError = function(jsonContent) {
		if (!jsonContent) {
			return true;
		}

		var result = jsonContent.result === "failure";
		if (result) {
			// if error, change the field name a little bit
			if (jsonContent.message) {
				jsonContent.error = jsonContent.message;
				delete jsonContent.message;
			} else {
				jsonContent.error = "Unknown error";
			}
		}

		return result;
	};

	TotaraLoader.prototype.reportError = function(context, errorText) {
		this.onErrorCallbacks.execute({
			error: errorText,
			context: context
		});
	};

	TotaraLoader.prototype.processContextCommand = function(context, name, jsonContent, binaryContent, isInitial) {
		if (!context) {
			var error = name + " error: unknown context - " + JSON.stringify(jsonContent);
			this.contextMap.forEach(function(context) {
				context[name].call(context, jsonContent, binaryContent);
			});
			return { error: error };
		}

		var result;
		try {
			result = context[name].call(context, jsonContent, binaryContent, isInitial);
		} catch (err) {
			Log.error("An error happened while processing an HTTP response", err.toString());
			result = {
				error: err
			};
		}
		return result;
	};

	TotaraLoader.prototype.processCommand = function(name, jsonContent, binaryContent, isInitial) {
		// console.log("process", name, jsonContent.sceneId)
		if (this.checkError(jsonContent)) {
			if (name === Command.setTree) {// ?
				if (jsonContent.events && jsonContent.events.length) { // check if setTree has infomation about the id
					var event = jsonContent.events[0];
					if (event.values && event.values.id) {
						// setTree context carries scene veid. remove it since failed
						this.contextMap.delete(event.values.id);
					}
				}
			}

			this.onErrorCallbacks.execute(jsonContent);
			return null;
		}

		var context = null;
		if (jsonContent.sceneId !== undefined) {
			context = this.getContext(jsonContent.sceneId);
		} else if (jsonContent.token !== undefined) {
			context = this.tokenContextMap.get(jsonContent.token);
		}
		if (context) {
			this.currentSceneInfo.id = context.sceneId;
		}

		this.setPerformance(name, jsonContent, context ? context.sceneId : null);

		var result;
		switch (name) {
			case Command.setScene:
				this.processSetSceneCommand(jsonContent);
				break;
			case Command.setTree:
			case Command.setTreeNode:
			case Command.notifyFinishedTree:

			case Command.setView:
			case Command.setViewNode:
			case Command.setViewGroup:
			case Command.notifyFinishedView:

			case Command.setCamera:
			case Command.allocateMeshBuffer:
			case Command.setMesh:
			case Command.setMaterial:
			case Command.setGeometry:
			case Command.setImage:
			case Command.setAnnotation:
			case Command.setLineStyle:
			case Command.setFillStyle:
			case Command.setTextStyle:
			case Command.setParametric:

			case Command.setPlayback:
			case Command.setHighlightStyle:
			case Command.setSequence:
			case Command.setTrack:

			case Command.suppressSendRequests:
			case Command.unsuppressSendRequests:

				result = this.processContextCommand(context, name, jsonContent, binaryContent, isInitial);

				break;

			case Command.notifyError: result = { error: jsonContent.errorText }; break;
			case Command.timestamp: result = this.timestamp(jsonContent); break;
			case Command.performanceTiming: result = this.performanceTiming(jsonContent); break;

			default: result = { error: "Unknown command: " + name }; break;
		}

		if (this.isLoadingFinished()) {
			if (name !== Command.setScene &&
				name !== Command.setView &&
				name !== Command.setViewNode &&
				name !== Command.timestamp &&
				name !== Command.performanceTiming &&
				name !== Command.suppressSendRequests &&
				name !== Command.unsuppressSendRequests &&
				this._loadingFinishedSent === false) {
				this.onLoadingFinishedCallbacks.execute();

				// Ensure onLoadingFinishedCallbacks are called only once
				this._loadingFinishedSent = true;
				Log.info("Loading is finished - all streaming requests are fulfilled.");
			}
		} else if (this._loadingFinishedSent) {
			// We already called the onLoadingFinished callbacks but now we should do it again as there is more staff in the receiving queue
			this._loadingFinishedSent = false;
		}

		if (result && result.error) {
			Log.error(result.error);
			this.onErrorCallbacks.execute(result);
		}

		return context;
	};

	TotaraLoader.prototype.setPerformance = function(name, jsonContent, sid) {
		var id;
		switch (name) {
			case Command.setGeometry:
				id = jsonContent.id;
				mark("setGeometry-" + id);
				break;
			case Command.setImage:
				id = jsonContent.id;
				mark("setImage-" + id);
				break;
			case Command.setView:
				id = jsonContent.viewId;
				mark("setView-" + id);
				break;
			case Command.setViewGroup:
				id = jsonContent.id;
				mark("setViewGroup-" + id);
				break;
			case Command.setMesh:
				mark("setMesh-" + sid);
				break;
			case Command.setMaterial:
				mark("setMaterial-" + sid);
				break;
			case Command.setTree:
				mark("setTree-" + sid);
				break;
			case Command.performanceTiming:
				this._isPostable = true;
				this.postPerformanceTiming();
				break;
			default:
				break;
		}
	};

	TotaraLoader.prototype.postPerformanceTiming = function(msg) {
		if (msg) {
			this._performanceTimingMsg.push(msg);
		}
		if (this._isPostable && this._performanceTimingMsg.length > 0) {
			this.postMessage(this._performanceTimingMsg.shift());
			this._isPostable = false;
		}
	};

	TotaraLoader.prototype.printLogTokens = function() {
		this.contextMap.forEach(function(context, sceneId) {
			Log.info("log tokens for scene => " + sceneId);
			Log.info("---------------------------------------");
			if (context.progressLogger) {
				context.progressLogger.getTokens().forEach(function(token) {
					Log.info(token);
				});
			}
			Log.info("---------------------------------------");
		});
	};

	function getMaxBatchStringLength(command, urlBase, cachingUrlBase, sceneId, token, maxUrlLength) {
		var baseQueryString;
		var maxBatchStringLength;
		switch (command) {
			case "getGeometry":
				maxBatchStringLength = maxUrlLength - (cachingUrlBase + "geometry?id=").length;
				break;

			case "getGeomMesh":
				maxBatchStringLength = maxUrlLength - (cachingUrlBase + "scenes/" + sceneId + "/meshes?types=box&ids=" + baseQueryString).length;
				break;

			default:
				baseQueryString = "?request=" + encodeURI(command + "[" + maxUrlLength + "]" + JSON.stringify({
					sceneId: sceneId,
					ids: [],
					token: token
				}));
				maxBatchStringLength = maxUrlLength - (urlBase + baseQueryString).length;
				break;
		}
		return maxBatchStringLength;
	}

	function getBatchSeparatorLength(command) {
		switch (command) {
			case "getGeometry":
				return "&id=".length;
			default:
				return ",".length;
		}
	}

	function getBatchSizeInfo(streamingUrl, cachingUrl, sceneId, correlationId, maxUrlLength) {
		streamingUrl = streamingUrl.indexOf("?") === -1 ? streamingUrl : streamingUrl.substring(0, streamingUrl.indexOf("?"));

		var batchedCommands = [
			"getAnnotation",
			"getGeometry",
			"getGeomMesh",
			"getMaterial",
			"getMesh",
			"getParametric",
			"getSequence",
			"getTrack"
		];
		var batchSizeInfo = {};
		batchedCommands.forEach(function(batchedCommand) {
			batchSizeInfo[batchedCommand] = {
				maxBatchStringLength: getMaxBatchStringLength(batchedCommand, streamingUrl, cachingUrl, sceneId, correlationId, maxUrlLength),
				separatorLength: getBatchSeparatorLength(batchedCommand)
			};
		});
		return batchSizeInfo;
	}

	return TotaraLoader;
});
