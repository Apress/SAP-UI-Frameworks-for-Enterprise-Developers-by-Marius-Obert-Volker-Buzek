/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./TotaraUtils",
	"./Command"
], function(
	TotaraUtils,
	Command
) {
	"use strict";

	function ResourceQueue(getBatchSize) {
		this.getBatchSize = getBatchSize;

		// This list (set) contains IDs which were ever requested, they can be not processed yet or
		// already processed.
		this.globalList = new Set();

		// This list (map) contains IDs which are requested and whose processing may have been
		// started but has not been finished yet.
		//
		// When fetchBatch is called it deletes the item from requestedList but keeps it in the waitingList
		// However, we need the requestData to figure out whether the request is part of the initialView
		// (determined by the isInitial property).
		// So, we make waitingList a map with id as key and requestData as val
		this.waitingList = new Map();

		// A list (Set) contains IDs which are requested but whose processing has not started yet.
		this.requestedList = new Set();

		//             ID is in these lists                 ID is in these lists                                ID is in this list
		//                     |                                     |                                                  |
		//                     v                                     v                                                  v
		//              | globalList    |                     | globalList  |                                     | globalList |
		// ID -> add -> | waitingList   | -> start request -> | waitingList | -> receive and finish processing -> |            |
		//              | requestedList |                     |             |                                     |            |
	}

	ResourceQueue.prototype.push = function(id, requestData) {
		if (!this.globalList.has(id)) {
			this.globalList.add(id);
			this.waitingList.set(id, requestData);
			this.requestedList.add(id);
		}
	};

	ResourceQueue.prototype.setBatchSizeInfo = function(batchSizeInfo) {
		this.batchSizeInfo = batchSizeInfo;
	};

	ResourceQueue.prototype.fetchBatch = function() {
		var batchSize = this.getBatchSize ? this.getBatchSize : 1;
		if (typeof this.getBatchSize === "function") {
			batchSize = this.getBatchSize();
		}
		var batchStringLength = 0;
		var batch = [];
		var iterator = this.requestedList.keys();
		var entry = iterator.next();
		for (var i = 0; i < batchSize && !entry.done; i++, entry = iterator.next()) {
			var id = entry.value;
			batchStringLength += id.toString().length + (i == 0 || !this.batchSizeInfo ? 0 : this.batchSizeInfo.separatorLength);
			if (this.batchSizeInfo && batchStringLength > this.batchSizeInfo.maxBatchStringLength) {
				break;
			} else {
				this.requestedList.delete(id);
			}
			batch.push(id);
		}
		return batch;
	};

	ResourceQueue.prototype.pop = function(id) {
		this.requestedList.delete(id);
		return this.waitingList.delete(id);
	};

	ResourceQueue.prototype.isReady = function(id) {
		return this.globalList.has(id) && !this.waitingList.has(id);
	};

	ResourceQueue.prototype.clear = function(id) {
		this.globalList.clear();
		this.waitingList.clear();
		this.requestedList.clear();
	};

	ResourceQueue.prototype.isEmpty = function() {
		return this.requestedList.size === 0;
	};

	ResourceQueue.prototype.isWaiting = function() {
		return this.waitingList.size > 0;
	};

	ResourceQueue.prototype.isInitialViewCompleted = function() {
		var map = this.waitingList;
		for (var iterator = map.values(), entry = iterator.next(); !entry.done; entry = iterator.next()) {
			var value = entry.value;
			if (value && value.isInitial) {
				return false;
			}
		}
		return true;
	};

	function PriorityResourceQueue(getBatchSize, getMaxBatchDataSize) {
		ResourceQueue.call(this, getBatchSize);
		this.getMaxBatchDataSize = getMaxBatchDataSize;
		this.priorityMap = new Map();
	}

	PriorityResourceQueue.prototype = Object.create(ResourceQueue.prototype);

	PriorityResourceQueue.prototype.constructor = PriorityResourceQueue;

	PriorityResourceQueue.prototype.push = function(id, priority, size, requestData) {
		if (!this.globalList.has(id)) {
			size = size || 1;
			this.globalList.add(id);
			this.waitingList.set(id, requestData);
			this.requestedList.add(id);
			this.priorityMap.set(id, { p: priority, s: size });
		}
	};

	PriorityResourceQueue.prototype.clear = function() {
		ResourceQueue.prototype.clear.call(this);
		this.priorityMap.clear();
	};

	PriorityResourceQueue.prototype.setBatchSizeInfo = function(batchSizeInfo) {
		this.batchSizeInfo = batchSizeInfo;
	};

	PriorityResourceQueue.prototype.fetchBatch = function() {
		var priorityMap = this.priorityMap;
		var requestedList = this.requestedList;
		var sortedList = Array.from(requestedList.keys()).sort(function(a, b) {
			return priorityMap.get(a).p - priorityMap.get(b).p;
		});

		var batch = [];
		var size = 0;
		var batchSize = this.getBatchSize ? this.getBatchSize() : 1;
		var batchStringLength = 0;
		var maxBatchDataSize = this.getMaxBatchDataSize ? this.getMaxBatchDataSize() : 1024 * 1024;
		var minBatchDataSize = maxBatchDataSize >> 1;
		for (var i = 0; i < batchSize && sortedList.length > 0; i++) {
			var id = sortedList.pop();
			batchStringLength += id.toString().length + (i == 0 || !this.batchSizeInfo ? 0 : this.batchSizeInfo.separatorLength);
			var resSize = priorityMap.get(id).s;
			if (this.batchSizeInfo && batchStringLength > this.batchSizeInfo.maxBatchStringLength || size > minBatchDataSize && size + resSize > maxBatchDataSize) {
				break;
			}

			size += resSize;
			requestedList.delete(id);
			priorityMap.delete(id);
			batch.push(id);
		}
		return batch;
	};

	var RequestQueue = function(context, sceneId) {
		this.context = context; // SceneContext
		this.sceneId = sceneId;
		this.token = context.token || TotaraUtils.generateToken();
		var loader = context.loader;
		this.meshes = new ResourceQueue(loader.getMeshesBatchSize.bind(loader));
		this.materials = new ResourceQueue(loader.getMaterialsBatchSize.bind(loader));
		this.textures = new ResourceQueue();
		this.geometries = new PriorityResourceQueue(loader.getGeometriesBatchSize.bind(loader), loader.getGeometriesMaxBatchDataSize.bind(loader));
		this.geomMeshes = new PriorityResourceQueue(loader.getGeomMeshesBatchSize.bind(loader), loader.getGeomMeshesMaxBatchDataSize.bind(loader));
		this.annotations = new ResourceQueue(loader.getAnnotationsBatchSize.bind(loader));
		this.parametric = new ResourceQueue(loader.getParametricsBatchSize.bind(loader));
		this.views = new ResourceQueue();
		this.thumbnails = new ResourceQueue();
		this.tracks = new ResourceQueue(loader.getTracksBatchSize.bind(loader));
		this.sequences = new ResourceQueue(loader.getSequencesBatchSize.bind(loader));
		this.highlights = new ResourceQueue();
	};

	RequestQueue.prototype.isEmpty = function() {
		return this.meshes.isEmpty()
			&& this.annotations.isEmpty()
			&& this.parametric.isEmpty()
			&& this.materials.isEmpty()
			&& this.textures.isEmpty()
			&& this.geometries.isEmpty()
			&& this.geomMeshes.isEmpty()
			&& this.views.isEmpty()
			&& this.thumbnails.isEmpty()
			&& this.tracks.isEmpty()
			&& this.sequences.isEmpty()
			&& this.highlights.isEmpty();
	};

	RequestQueue.prototype.isWaitingForContent = function() {
		return this.meshes.isWaiting()
			|| this.textures.isWaiting()
			|| this.materials.isWaiting()
			|| this.geometries.isWaiting()
			|| this.geomMeshes.isWaiting()
			|| this.annotations.isWaiting()
			|| this.parametric.isWaiting()
			|| this.views.isWaiting()
			|| this.thumbnails.isWaiting()
			|| this.tracks.isWaiting()
			|| this.sequences.isWaiting()
			|| this.highlights.isWaiting();
	};

	RequestQueue.prototype.clearContent = function() {
		this.meshes.clear();
		this.annotations.clear();
		this.parametric.clear();
		this.materials.clear();
		this.textures.clear();
		this.geometries.clear();
		this.geomMeshes.clear();
		this.views.clear();
		this.thumbnails.clear();
		this.tracks.clear();
		this.sequences.clear();
		this.highlights.clear();
	};

	RequestQueue.prototype.createGetContentCommand = function(commandName, ids, extraOptions) {
		var options = {
			sceneId: this.sceneId,
			ids: ids.map(function(id) { return parseInt(id, 10); }),
			token: this.token
		};
		return TotaraUtils.createRequestCommand(commandName, extraOptions ? Object.assign(options, extraOptions) : options);
	};

	function removeFirstFromMap(map) {
		var entry = map.keys().next();
		if (entry.done) {
			return null;
		}
		var value = entry.value;
		map.delete(value);
		return value;
	}

	RequestQueue.prototype.generateRequestCommand = function() {
		var id;
		var ids;
		var requestData;
		var command = null;
		if (!this.meshes.isEmpty()) {
			// This call is used to retrieve inner boxes only.
			ids = this.meshes.fetchBatch();
			var meshIds = ids.map(function(i) { return (i.id ? i.id : i); });
			command = this.createGetContentCommand(Command.getMesh, meshIds);
			command.sceneId = this.sceneId;
			command.meshIds = meshIds;
		} else if (!this.geomMeshes.isEmpty()) {
			ids = this.geomMeshes.fetchBatch();
			command = this.createGetContentCommand(Command.getGeomMesh, ids);
			command.sceneId = this.sceneId;
			command.meshIds = ids;
		} else if (!this.annotations.isEmpty()) {
			ids = this.annotations.fetchBatch();
			command = {
				method: Command.getAnnotation,
				parameters: {
					sceneId: this.sceneId,
					annotationIds: ids
				}
			};
		} else if (!this.parametric.isEmpty()) {
			// TODO: delete this branch.
			ids = this.parametric.fetchBatch();
			throw new Error("Command " + Command.getParametric + " is not implemented");
		} else if (!this.materials.isEmpty()) {
			ids = this.materials.fetchBatch();
			command = {
				method: Command.getMaterial,
				parameters: {
					sceneId: this.sceneId,
					materialIds: ids
				}
			};
		} else if (!this.textures.isEmpty()) {
			id = removeFirstFromMap(this.textures.requestedList);
			requestData = this.textures.waitingList.get(id);
			command = this.createGetContentCommand(Command.getImage, [id]);
			command.sceneId = this.sceneId;
			command = Object.assign(command, requestData);
		} else if (!this.sequences.isEmpty()) {
			// TODO: delete this branch.
			ids = this.sequences.fetchBatch();
			throw new Error("Command " + Command.getSequence + " is not implemented");
		} else if (!this.tracks.isEmpty()) {
			// TODO: delete this branch.
			ids = this.tracks.fetchBatch();
			throw new Error("Command " + Command.getTrack + " is not implemented");
		} else if (!this.views.isEmpty()) {
			id = removeFirstFromMap(this.views.requestedList);
			command = {
				method: Command.getView,
				parameters: {
					sceneId: this.sceneId,
					viewId: id,
					query: TotaraUtils.configureSceneViewQuery(this.context)
				}
			};
		} else if (!this.highlights.isEmpty()) {
			// TODO: delete this branch.
			id = removeFirstFromMap(this.highlights.requestedList);
			throw new Error("Command " + Command.getHighlightStyle + " is not implemented");
		} else if (!this.thumbnails.isEmpty()) {
			id = removeFirstFromMap(this.thumbnails.requestedList);
			requestData = this.thumbnails.waitingList.get(id);
			command = this.createGetContentCommand(Command.getImage, [id]);
			command.sceneId = this.sceneId;
			command = Object.assign(command, requestData);
		}

		return command;
	};

	return RequestQueue;
});
