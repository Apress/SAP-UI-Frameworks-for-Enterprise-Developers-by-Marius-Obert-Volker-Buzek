/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/Object",
	"./AnimationTrackValueType",
	"./findIndexInArray",
	"./Core"
], function(
	BaseObject,
	AnimationTrackValueType,
	findIndexInArray,
	vkCore
) {

	"use strict";

	/**
	 * Constructor for an animation sequence.
	 *
	 * @class Provides the interface for animation track. The objects of this class should not be created directly.
	 *
	 * @param {string} sId track's ID
	 * @param {any} parameters track's parameters
	 * @param {sap.ui.vk.AnimationTrackValueType} parameters.trackValueType type of values track contains
	 * @param {boolean} parameters.cycleForward cycle forward flag
	 * @param {boolean} parameters.cycleBackward cycle backward flag
	 * @param {boolean} parameters.infinite infinite flag
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.AnimationTrack
	 *
	 * @private
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationTrack = BaseObject.extend("sap.ui.vk.AnimationTrack", /** @lends sap.ui.vk.AnimationTrack.prototype */ {

		constructor: function(sId, parameters) {

			this._jsonData = {};

			this._jsonData.id = sId;
			this._jsonData.type = parameters && parameters.trackValueType ? parameters.trackValueType : AnimationTrackValueType.Scalar;
			this._jsonData.keys = [];
			this._jsonData.cycleForward = !!(parameters && parameters.cycleForward);
			this._jsonData.cycleBackward = !!(parameters && parameters.cycleBackward);
			this._jsonData.infinite = !!(parameters && parameters.infinite);

			this._jsonData._isAbsoluteValue = parameters && parameters.isAbsoluteValue ? parameters.isAbsoluteValue : false;
		}
	});

	/**
	 * Sets the sequence name.
	 * @param {sap.ui.model.Model} model data binding model
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.setJSONModel = function(model) {
		this._model = model;
		return this;
	};

	/**
	 * Gets if using absolute value (not relative to rest position)
	 * @returns {boolean} is absolute value.
	 * @public
	 */
	 AnimationTrack.prototype.getIsAbsoluteValue = function() {
		return this._jsonData._isAbsoluteValue;
	};

	/**
	 * Sets if using absolute value (not relative to rest position)
	 * @param {boolean} isAbsolutevalue if the track values are absolute.
	 * @public
	 */
	AnimationTrack.prototype.setIsAbsoluteValue = function(isAbsolutevalue) {
		this._jsonData._isAbsoluteValue = isAbsolutevalue;
	};

	/**
	 * Gets the track ID.
	 * @returns {string} The track ID.
	 * @public
	 */
	AnimationTrack.prototype.getId = function() {
		return this._jsonData.id;
	};

	/**
	 * Gets the track keys value type.
	 * @returns {sap.ui.vk.AnimationTrackValueType} The keys value type.
	 * @public
	 */
	AnimationTrack.prototype.getKeysType = function() {
		return this._jsonData.type;
	};

	/**
	 * Sets track keys value type if there are no keys defined yet.
	 * @param {sap.ui.vk.AnimationTrackValueType} type The keys value type.
	 * @returns {boolean} <code>true</code> if keys type has been changed or <code>false</code> if track already has keys defined and type was not changed.
	 * @public
	 */
	AnimationTrack.prototype.setKeysType = function(type) {
		if (this.getKeysCount() > 0) {
			return false;
		}

		this._jsonData.type = type;
		return true;
	};

	/**
	 * Returns value of Cycle Forward flag.
	 * @returns {boolean} value of Cycle Forward flag.
	 * @public
	 */
	AnimationTrack.prototype.isCycleForward = function() {
		return this._jsonData.cycleForward;
	};

	/**
	 * Sets Cycle Forward flag.
	 * @param {boolean} cycleForward of Cycle Forward flag.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.setCycleForward = function(cycleForward) {
		this._jsonData.cycleForward = cycleForward;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Returns value of Cycle Backward flag.
	 * @returns {boolean} value of Cycle Backward flag.
	 * @public
	 */
	AnimationTrack.prototype.isCycleBackward = function() {
		return this._jsonData.cycleBackward;
	};

	/**
	 * Sets Cycle Backward flag.
	 * @param {boolean} cycleBackward of Cycle Backward flag.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.setCycleBackward = function(cycleBackward) {
		this._jsonData.cycleBackward = cycleBackward;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Returns value of Play Infinite flag.
	 * @returns {boolean} value of Play Infinite flag.
	 * @public
	 */
	AnimationTrack.prototype.isInfinite = function() {
		return this._jsonData.infinite;
	};

	/**
	 * Sets Play Infinite flag.
	 * @param {boolean} infinite of Play Infinite flag.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.setInfinite = function(infinite) {
		this._jsonData.infinite = infinite;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the track keys count.
	 * @returns {int} The keys count.
	 * @public
	 */
	AnimationTrack.prototype.getKeysCount = function() {
		return this._jsonData.keys.length;
	};

	/**
	 * Gets the specified key value.
	 * @param {int} index key's index
	 * @returns {float|float[]} key value.
	 * @public
	 */
	AnimationTrack.prototype.getKey = function(index) {
		if (index < 0 || index >= this._jsonData.keys.length) {
			return undefined;
		}

		return this._jsonData.keys[index];
	};

	/**
	 * Updates the specified key value.
	 * @param {int} index key's index
	 * @param {float|float[]} value key's value
	 * @param {boolean} blockTrackChangedEvent block event for track changed
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.updateKey = function(index, value, blockTrackChangedEvent) {
		if (index >= 0 || index < this._jsonData.keys.length) {
			this._jsonData.keys[index].value = value;
			if (this._model) {
				this._model.updateBindings();
			}
		}
		if (!blockTrackChangedEvent) {
			this._fireTrackChanged();
		}
		return this;
	};

	/**
	 * Removes the specified key from the track.
	 * @param {int} index key's index
	 * @param {boolean} blockTrackChangedEvent block event for track changed
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.removeKey = function(index, blockTrackChangedEvent) {
		var emptyTrack = false;
		if (index >= 0 || index < this._jsonData.keys.length) {
			this._jsonData.keys.splice(index, 1);
			if (this._jsonData.keys.length === 0) {
				emptyTrack = true;
			}
			if (this._model) {
				this._model.updateBindings();
			}
		}

		if (!blockTrackChangedEvent) {
			this._fireTrackChanged(emptyTrack);
		}
		return this;
	};

	/**
	 * Finds a nearest key index for the specifie time.
	 * @param {float} time time to find
	 * @returns {int} index key's index or -1 if track has no keys yet
	 * @public
	 */
	AnimationTrack.prototype.findKeyIndex = function(time) {
		var index = -1;
		if (this._jsonData.keys.length === 1) {
			index = 0;
		} else if (this._jsonData.keys.length > 1) {
			for (var idx = 1; idx < this._jsonData.keys.length; idx++) {
				var leftKey = this.getKey(idx - 1);
				var rightKey = this.getKey(idx);
				if (time >= leftKey.time && time <= rightKey.time) {
					index = time - leftKey.time < rightKey.time - time ? idx - 1 : idx;
					break;
				}
			}
		}
		return index;
	};

	/**
	 * Adds a key at time specified.
	 * @param {float} time key's time
	 * @param {float|float[]} value key's value
	 * @param {boolean} blockTrackChangedEvent block event for track changed
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationTrack.prototype.insertKey = function(time, value, blockTrackChangedEvent) {

		var index = findIndexInArray(this._jsonData.keys, function(key) {
			return key.time === time;
		});

		if (index < 0) {
			this._jsonData.keys.push({
				time: time,
				value: value
			});

			this._jsonData.keys.sort(function(a, b) {
				return a.time - b.time;
			});
		} else {
			this.updateKey(index, value, true);
			if (this._model) {
				this._model.updateBindings();
			}
		}
		if (!blockTrackChangedEvent) {
			this._fireTrackChanged();
		}

		return this;
	};

	AnimationTrack.prototype._fireTrackChanged = function(emptyTrack) {
		vkCore.getEventBus().publish("sap.ui.vk", "trackChanged", {
			trackId: this._jsonData.id,
			emptyTrack: emptyTrack
		});
	};


	/**
	 * Get JSON data object for track
	 * @returns {object} json data object
	 * @public
	 */
	AnimationTrack.prototype.getJSONData = function() {
		return this._jsonData;
	};

	return AnimationTrack;
});

