/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/EventProvider",
	"./AnimationSequence",
	"./AnimationTrackType",
	"sap/ui/vk/uuidv4"
], function(
	EventProvider,
	AnimationSequence,
	AnimationTrackType,
	uuidv4
) {
	"use strict";

	/**
	 * Constructor for a new AnimationPlayback.
	 *
	 * The objects of this class contain neccessary information to define how an animation sequence is played
	 *
	 * @class Provides definition for an animation playback
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.EventProvider
	 * @alias sap.ui.vk.AnimationPlayback
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationPlayback = EventProvider.extend("sap.ui.vk.AnimationPlayback", /** @lends sap.ui.vk.AnimationPlayback.prototype */ {

		constructor: function(sId, parameters) {

			if (typeof sId === "object") {
				parameters = sId;
				sId = undefined;
			}

			if (sId == null) {
				sId = uuidv4();
			}

			this._sequence = parameters && parameters.sequence ? parameters.sequence : undefined;
			this._jsonData = {};
			this._jsonData.id = sId;

			this._jsonData.startTime = parameters && parameters.startTime ? parameters.startTime : 0;
			this._jsonData.sequence = this._sequence ? this._sequence.getJSONData() : undefined;
			this._jsonData.timeScale = parameters && parameters.timeScale ? parameters.timeScale : 1.0;
			this._jsonData.preDelay = parameters && parameters.preDelay ? parameters.preDelay : 0.0;
			this._jsonData.postDelay = parameters && parameters.postDelay ? parameters.postDelay : 0.0;
			this._jsonData.repeats = parameters && parameters.repeats ? parameters.repeats : 1;
			this._jsonData.reversed = parameters && parameters.reversed ? parameters.reversed : false;
			this._jsonData.infinite = parameters && parameters.infinite ? parameters.infinite : false;
		}
	});

	/**
	 * Sets the sequence name.
	 * @param {sap.ui.model.Model} model data binding model
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setJSONModel = function(model) {
		this._model = model;
		if (this._sequence) {
			this._sequence.setJSONModel(model);
		}
		return this;
	};

	/**
	 * Gets the playback ID.
	 * @returns {string} The playback ID.
	 * @public
	 */
	AnimationPlayback.prototype.getId = function() {
		return this._jsonData.id;
	};

	/**
	 * Gets the playback start time.
	 *
	 * The start time is usually equal to the time when the previous playback finishes (including
	 * its post-delay) or 0. If the playback has pre-delay then the playback start time is when its
	 * pre-delay starts, not when its tracks start.
	 *
	 * @returns {float} The sequence to be played.
	 * @public
	 */
	AnimationPlayback.prototype.getStartTime = function() {
		return this._jsonData.startTime;
	};

	/**
	 * Sets the playback start time.
	 * @param {float} startTime The playback start time.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setStartTime = function(startTime) {
		this._jsonData.startTime = startTime;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the sequence to be played with the playback.
	 * @returns {sap.ui.vk.AnimationSequence} The sequence to be played.
	 * @public
	 */
	AnimationPlayback.prototype.getSequence = function() {
		return this._sequence;
	};

	/**
	 * Sets the sequence to be played with the playback.
	 * @param {sap.ui.vk.AnimationSequence} sequence The sequence to be played.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setSequence = function(sequence) {
		this._sequence = sequence;
		this._jsonData.sequence = sequence.getJSONData();
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the speed of the playback.
	 * @returns {float} The playback's speed.
	 * @public
	 */
	AnimationPlayback.prototype.getTimeScale = function() {
		return this._jsonData.timeScale;
	};

	/**
	 * Sets the speed of the playback.
	 * @param {float} timeScale playback speed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setTimeScale = function(timeScale) {
		this._jsonData.timeScale = timeScale;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the delay before starting the playback.
	 * @returns {float} The delay before starting the playback.
	 * @public
	 */
	AnimationPlayback.prototype.getPreDelay = function() {
		return this._jsonData.preDelay;
	};

	/**
	 * Sets the delay before starting the playback.
	 * @param {float} preDelay delay before starting the playback.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setPreDelay = function(preDelay) {
		this._jsonData.preDelay = preDelay;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the delay after the playback was played.
	 * @returns {float} The delay after the playback was played.
	 * @public
	 */
	AnimationPlayback.prototype.getPostDelay = function() {
		return this._jsonData.postDelay;
	};

	/**
	 * Sets the delay after the playback was played.
	 * @param {float} postDelay delay after the playback was played.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setPostDelay = function(postDelay) {
		this._jsonData.postDelay = postDelay;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the number of repetitions for the playback.
	 * @returns {int} The number of repetitions for the playback.
	 * @public
	 */
	AnimationPlayback.prototype.getRepeats = function() {
		return this._jsonData.repeats;
	};

	/**
	 * Sets the number of repetitions for the playback.
	 * @param {int} repeats number of repetitions for the playback.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setRepeats = function(repeats) {
		this._jsonData.repeats = repeats;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Determines if the playback is going to be played in reverse direction.
	 * @returns {boolean} If set to true, animation will be played in reverse direction.
	 * @public
	 */
	AnimationPlayback.prototype.getReversed = function() {
		return this._jsonData.reversed;
	};

	/**
	 * Determines if the playback is going to be played in reverse direction.
	 * @param {boolean} reversed play animation sequence in reverse direction or not.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setReversed = function(reversed) {
		this._jsonData.reversed = reversed;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Determines if the playback is going to be played infinitely.
	 * @returns {boolean} The number of repetitions for the playback.
	 * @public
	 */
	AnimationPlayback.prototype.getInfinite = function() {
		return this._jsonData.infinite;
	};

	/**
	 * Determines if the playback is going to be played infinitely.
	 * @param {boolean} infinite play animation sequence infinitely or not.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayback.prototype.setInfinite = function(infinite) {
		this._jsonData.infinite = infinite;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Calculates animation playback duration taking into account pre-delay, post-delay, repeats and time scale.
	 * @returns {float} playback duration.
	 * @public
	 */
	AnimationPlayback.prototype.getDuration = function() {
		var sequenceDuration = this._sequence ? this._sequence.getDuration() : 0;
		return this._jsonData.preDelay + this._jsonData.postDelay + sequenceDuration * this._jsonData.repeats * this._jsonData.timeScale;
	};

	/**
	 * Get JSON data object for playback which contains sequence and track data included in the playback
	 * @returns {object} json data object
	 * @public
	 */
	AnimationPlayback.prototype.getJSONData = function() {
		return this._jsonData;
	};

	/**
	 * Get node property defined at the start or end of playback
	 * @param {any} nodeRef reference to the node
	 * @param {AnimationTrackType} type property type (translate, scale, quaternion, opacity)
	 * @param {boolean} isEnd if true return the property at the end of playback, otherwise at the start
	 * @returns {float|float[]} property
	 * @private
	 */
	AnimationPlayback.prototype.getNodeBoundaryProperty = function(nodeRef, type, isEnd) {
		var property;
		var nodePropertiesMap;
		if (isEnd) {
			nodePropertiesMap = this._nodeEndPropertiesMap;
		} else {
			nodePropertiesMap = this._nodeStartPropertiesMap;
		}

		if (nodePropertiesMap) {
			var properties = nodePropertiesMap.get(nodeRef);
			if (properties) {
				property = properties[type];
			}
		}

		return property;
	};

	AnimationPlayback.prototype._hasCompleteNodesBoundaryProperties = function() {
		if (!this._nodeEndPropertiesMap || !this._nodeEndPropertiesMap.size || !this._nodeStartPropertiesMap || !this._nodeStartPropertiesMap.size) {
			return false;
		}
		return true;
	};

	AnimationPlayback.prototype._clearNodesBoundaryProperties = function() {
		if (this._nodeEndPropertiesMap) {
			this._nodeEndPropertiesMap.clear();
		}
		if (this._nodeStartPropertiesMap) {
			this._nodeStartPropertiesMap.clear();
		}
	};

	AnimationPlayback.prototype._setCurrentNodesPropertiesAsBoundary = function(viewStateManager, isEnd, forced) {
		if (!forced
			&& ((this._nodeEndPropertiesMap && this._nodeEndPropertiesMap.size && isEnd) ||
				(this._nodeStartPropertiesMap && this._nodeStartPropertiesMap.size && !isEnd))) {
			return;
		}

		var nodePropertiesMap;
		if (isEnd) {
			if (!this._nodeEndPropertiesMap) {
				this._nodeEndPropertiesMap = new Map();
			} else {
				this._nodeEndPropertiesMap.clear();
			}
			nodePropertiesMap = this._nodeEndPropertiesMap;
		} else {
			if (!this._nodeStartPropertiesMap) {
				this._nodeStartPropertiesMap = new Map();
			} else {
				this._nodeStartPropertiesMap.clear();
			}
			nodePropertiesMap = this._nodeStartPropertiesMap;
		}

		var sequence = this.getSequence();
		if (sequence) {
			sequence._getCurrentNodesProperties(viewStateManager, nodePropertiesMap);
		}
	};

	AnimationPlayback.prototype._getNodeEndPropertiesMap = function() {
		return this._nodeEndPropertiesMap;
	};

	AnimationPlayback.prototype._getNodeStartPropertiesMap = function() {
		return this._nodeStartPropertiesMap;
	};

	return AnimationPlayback;
});
