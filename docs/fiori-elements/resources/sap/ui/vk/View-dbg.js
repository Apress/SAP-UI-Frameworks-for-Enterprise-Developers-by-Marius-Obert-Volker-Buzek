/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"./findIndexInArray",
	"./AnimationPlayback",
	"./NavigationMode",
	"./Core"
], function(
	ManagedObject,
	JSONModel,
	findIndexInArray,
	AnimationPlayback,
	NavigationMode,
	vkCore
) {
	"use strict";

	/**
	 * Constructor for a new View.
	 *
	 * The objects of this class contain necessary information to reproduce current view including camera type, position and orientation as well as objects visibility property and their positions (if different from default)
	 *
	 * @class Provides the interface for the view.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @implements sap.ui.vk.IPlaybackCollection
	 * @alias sap.ui.vk.View
	 */
	var View = ManagedObject.extend("sap.ui.vk.View", /** @lends sap.ui.vk.View.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			interfaces: [
				"sap.ui.vk.IPlaybackCollection"
			],
			properties: {
				/**
				 * View persistent ID (optional)
				 */
				viewId: {
					type: "string"
				},
				/**
				 * View name (optional)
				 */
				name: {
					type: "string"
				},
				/**
				 * View description (optional)
				 */
				description: {
					type: "string"
				},
				/**
				 * Aspect ratio for Safe Area (optional). This can be 0 to 25. Values above or below this range will be ignored.
				 */
				aspectRatio: {
					type: "float"
				},
				/**
				 * Flag for auto-playing animation on view activation (optional)
				 */
				autoPlayAnimation: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Background top color (optional)
				 */
				topColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(238, 238, 238, 1)" // default grey
				},
				/**
				 * Background bottom color (optional)
				 */
				bottomColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(255, 255, 255, 1)" // default white
				},
				/**
				 * Navigation mode (optional)
				 */
				navigationMode: {
					type: "sap.ui.vk.NavigationMode",
					defaultValue: NavigationMode.NoChange
				},
				/**
				* Dimension (optional)
				*/
				dimension: {
					type: "int"
				}
			}
		}
	});

	View.prototype.init = function() {
		this._playbacks = [];
		this._playbacksJSONData = [];
		this._model = new JSONModel({ playbacks: this._playbacksJSONData });
		this._model.setSizeLimit(1000 * 1000);
		this._highlightIdNodesMap = new Map();
	};

	View.prototype.exit = function() {
		this._playbacks = undefined;
		this._playbacksJSONData = undefined;
		this._highlightIdNodesMap = undefined;
	};

	/**
	 * Returns view camera
	 *
	 * @returns {sap.ui.vk.Camera} view camera
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getCamera = function() {
		return this._camera;
	};


	/**
	 * Set view camera.
	 *
	 * @param {sap.ui.vk.Camera} camera view camera
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.setCamera = function(camera) {
		this._camera = camera;
		return this;
	};

	/*
	 * Checks if View has highlights.
	 *
	 * @return {boolean} true if highlights are associated with nodes defined in the view
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.hasHighlight = function() {
		return this._highlightIdNodesMap != null && this._highlightIdNodesMap.size > 0;
	};

	/*
	 * Gets Map of highlight id and array of node references.
	 *
	 * @return {Map} map of highlight ids and arrays of nodes that are highlighted
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getHighlightIdNodesMap = function() {
		return this._highlightIdNodesMap;
	};

	/*
	 * Gets Map of highlight id and array of node references.
	 *
	 * @param {string} highlightId id of highlight
	 * @param {object | object []} nodeRefs node reference or array of node references that are highlighted
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.addHighlightedNodes = function(highlightId, nodeRefs) {
		var nodes = this._highlightIdNodesMap.get(highlightId);
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}
		if (!nodes) {
			this._highlightIdNodesMap.set(highlightId, nodeRefs);
		} else {
			nodes = nodes.concat(nodeRefs.filter(function(item) { return nodes.indexOf(item) < 0; }));
			this._highlightIdNodesMap.set(highlightId, nodes);
		}
	};

	/*
	 * Checks if View is animated.
	 *
	 * @return {boolean}
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.hasAnimation = function() {
		return this._playbacks != null && this._playbacks.length > 0;
	};

	/*
	 * Gets all animation playbacks in the play order.
	 *
	 * @return {sap.ui.vk.AnimationPlayback []} all playbacks in view
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getPlaybacks = function() {
		return this._playbacks;
	};

	/*
	 * Gets animation playback by index.
	 *
	 * @param {int} index of playbacks
	 * @return {sap.ui.vk.AnimationPlayback}
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getPlayback = function(index) {
		if (index < 0 || index >= this._playbacks.length) {
			return undefined;
		}
		return this._playbacks[index];
	};

	/*
	 * Finds animation playback index.
	 *
	 * @param {sap.ui.vk.AnimationPlayback} playback
	 * @return {int} index
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.indexOfPlayback = function(playback) {
		return findIndexInArray(this._playbacks, function(item) {
			return item === playback;
		});
	};

	/*
	 * Adds animation playback.
	 *
	 * @param {sap.ui.vk.AnimationPlayback} playback
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.addPlayback = function(playback, blockPlaybacksChangedEvent) {
		this._playbacks.push(playback);
		this._playbacksJSONData.push(playback.getJSONData());
		if (this._model) {
			this._model.updateBindings();
		}
		playback.setJSONModel(this._model);

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbackAdded", playback);
		}

		return this;
	};

	/*
	 * Inserts animation playback to a specified position.
	 *
	 * @param {sap.ui.vk.AnimationPlayback} playback
	 * @param {int} index
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.insertPlayback = function(playback, index, blockPlaybacksChangedEvent) {
		if (index < 0) {
			index = 0;
		} else if (index !== 0 && index >= this._playbacks.length) {
			index = this._playbacks.length;
		}

		this._playbacks.splice(index, 0, playback);
		this._playbacksJSONData.splice(index, 0, playback.getJSONData());
		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbackInserted", playback);
		}

		return this;
	};


	/*
	 * Sort playbacks according to start time.
	 *
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {boolean} <code>true</code> if re-ordering is successful (playbacks have different start times), false otherwise
	 * @private
	 * @experimental Since 1.78.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.sortPlaybacks = function(playback, index, blockPlaybacksChangedEvent) {
		this._playbacks.sort(function(p1, p2) { return p1.getStartTime() - p2.getStartTime(); });
		this._playbacksJSONData = [];
		this._playbacks.forEach(function(playback) {
			this._playbacksJSONData.push(playback.getJSONData());
		}.bind(this));

		var properlyArranged = true;
		for (var i = 0; i < this._playbacks.length - 1; i++) {
			var start1 = this._playbacks[i].getStartTime();
			var start2 = this._playbacks[i + 1].getStartTime();

			if (start2 - start1 < 0.00001) {
				properlyArranged = false;
				break;
			}
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbacksOrderChanged");
		}

		return properlyArranged;
	};

	/*
	 * Removes animation playback.
	 *
	 * @param {int | string | sap.ui.vk.AnimationPlayback} vObject, playback index or playback id or playback
	 * @param {int} index
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.removePlayback = function(vObject, blockPlaybacksChangedEvent) {
		var index;
		if (typeof vObject === "number") {
			index = vObject;
		} else if (typeof vObject === "string") {
			index = findIndexInArray(this._playbacks, function(item) {
				return item.getId() === vObject;
			});
		} else {
			index = findIndexInArray(this._playbacks, function(item) {
				return item === vObject;
			});
		}

		var removedPlayback;
		if (index != null && index >= 0 && index < this._playbacks.length) {
			removedPlayback = this._playbacks[index];
			this._playbacks.splice(index, 1);
			this._playbacksJSONData.splice(index, 1);
			if (this._model) {
				this._model.updateBindings();
			}
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbackRemoved", removedPlayback);
		}

		return this;
	};

	/*
	 * Removes all animation playback.
	 *
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.removePlaybacks = function(blockPlaybacksChangedEvent) {
		this._playbacks.splice(0);
		this._playbacksJSONData.splice(0);
		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbacksRemoved");
		}

		return this;
	};

	/*
	 * Switch positions of two playbacks
	 *
	 * @param {sap.ui.vk.AnimationPlayback} playback1 the first playback
	 * @param {sap.ui.vk.AnimationPlayback} playback2 the second playback
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.switchPlaybacks = function(playback1, playback2, blockPlaybacksChangedEvent) {
		var index1, index2;
		for (var i = 0; i < this._playbacks.length; i++) {
			if (this._playbacks[i] === playback1) {
				index1 = i;
			} else if (this._playbacks[i] === playback2) {
				index2 = i;
			}
		}

		if (index1 !== undefined && index2 !== undefined) {

			var tempPlayback = this._playbacks[index1];
			var tempPlaybackData = this._playbacksJSONData[index1];

			this._playbacks[index1] = this._playbacks[index2];
			this._playbacksJSONData[index1] = this._playbacksJSONData[index2];

			this._playbacks[index2] = tempPlayback;
			this._playbacksJSONData[index2] = tempPlaybackData;
		}

		this.resetPlaybacksStartTimes(true);

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbacksOrderChanged");
		}

		return this;
	};

	/*
	 * Reset the start times of playbacks based on their orders and durations
	 *
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 *
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.resetPlaybacksStartTimes = function(blockPlaybacksChangedEvent) {

		if (this._playbacks.length === 0) {
			return this;
		}

		var startTime = 0;
		for (var i = 0; i < this._playbacks.length; i++) {
			this._playbacks[i].setStartTime(startTime);
			startTime += this._playbacks[i].getDuration();
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged("playbacksStartTimeChanged");
		}

		return this;
	};

	View.prototype._firePlaybacksChanged = function(operation, playback) {
		vkCore.getEventBus().publish("sap.ui.vk", "playbacksChanged", {
			viewId: this.getViewId(),
			operation: operation,
			playback: playback
		});
	};

	/*
	 * Set all playbacks to reversed or not reversed
	 *
	 * @param {boolean} blockPlaybacksChangedEvent block event for playbacks changed
	 * @param {boolean} reversed
	 * @return {sap.ui.vk.View} return this
	 * @public
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.setPlaybacksReversed = function(reversed, blockPlaybacksChangedEvent) {

		for (var i = 0; i < this._playbacks.length; i++) {
			this._playbacks[i].setReversed(reversed);
		}

		if (!blockPlaybacksChangedEvent) {
			this._firePlaybacksChanged();
		}

		return this;
	};

	/**
	 * Get parameters of nodes defined in view
	 *
	 * @return {object[]} Array of objects containing node information, each object contains the following fields
	 * <pre>
	 * {
	 *   target:   <i>object</i> - node reference
	 *   transform: <i>float[]</i> - transformation matrix, array of 16 or 12
	 *   meshId:  <i>string</i> - optional, node mesh Id
	 *   materialId: <i>string</i> - optional, node material Id
	 *   visible: <i>boolean</i> - node visibility
	 *   opacity: <i>float</i> - node opacity
	 * }
	 * </pre>
	 * @public
	 *
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getNodeInfos = function() {
		return this._nodeInfos ? this._nodeInfos : [];
	};

	/**
	 * Set parameters of nodes defined in view
	 *
	 * @param {object[]} infos Array of objects containing node information, each object contains the following fields
	 * @param {object} infos[].target - Node reference
	 * @param {float[]} infos[].transform - Node transformation matrix, array of 16 or 12
	 * @param {string} infos[].meshId - Optional, node mesh Id
	 * @param {string} infos[].materialId - Optional, node material Id
	 * @param {boolean} infos[].visible - Node visibility
	 * @param {float} infos[].opacity - Node opacity
	 * @param {float} infos[].annotationId - Optional, annotation id
	 *
	 * @returns {this} Reference to this in order to allow method chaining
	 *
	 * @public
	 *
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.setNodeInfos = function(infos) {
		this._nodeInfos = infos;
		return this;
	};

	/**
	 * Update parameters of nodes if nodes are already defined, add parameters if the node is not defined in view
	 *
	 * @param {object[]} update Infos array of objects containing node information, each object contains the following fields
	 * @param {object} update[].target - Node reference
	 * @param {float[]} update[].transform - Node transformation matrix, array of 16 or 12
	 * @param {string} update[].meshId - Optional, node mesh Id
	 * @param {string} update[].materialId - Optional, node material Id
	 * @param {boolean} update[].visible - Node visibility
	 * @param {float} update[].opacity - Node opacity
	 * @returns {this} Reference to this in order to allow method chaining
	 *
	 * @public
	 *
	 * @experimental Since 1.73.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.updateNodeInfos = function(update) {
		var currentData = this.getNodeInfos();
		if (!currentData) {
			return this.setNodeInfos(update);
		}

		var indices = new Map();
		currentData.forEach(function(data, idx) {
			indices.set(data.target, idx);
		});

		var mergeInfo = function(destination, source) {
			for (var property in source) {
				destination[property] = source[property];
			}
		};

		update.forEach(function(data) {
			var index = indices.get(data.target);
			if (index == null) {
				currentData.push(data);
			} else {
				mergeInfo(currentData[index], data);
			}
		});

		this.setNodeInfos(currentData);

		return this;
	};

	/*
	 * Get model for data binding
	 *
	 * @return {sap.ui.model.Model} returns the model for this view.
	 * @public
	 * @experimental Since 1.76.0 This class is experimental and might be modified or removed in future versions.
	 */
	View.prototype.getModel = function() {
		return this._model;
	};

	return View;
});
