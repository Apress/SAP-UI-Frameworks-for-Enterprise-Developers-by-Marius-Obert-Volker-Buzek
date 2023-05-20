/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/core/Element",
	"./Core",
	"./AnimationMath",
	"./AnimationTrackType",
	"./AnimationTrackValueType",
	"./glMatrix",
	"sap/ui/core/Core"
], function(
	Element,
	vkCore,
	AnimationMath,
	AnimationTrackType,
	AnimationTrackValueType,
	glMatrix,
	core
) {
	"use strict";

	/**
	 * Constructor for a new AnimationPlayer.
	 *
	 * The objects of this class contain necessary information to define how an animation sequence is played
	 *
	 * @class Provides definition for an animation playback
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.AnimationPlayer
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationPlayer = Element.extend("sap.ui.vk.AnimationPlayer", /** @lends sap.ui.vk.AnimationPlayer.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			associations: {
				viewStateManager: { type: "sap.ui.vk.ViewStateManagerBase", multiple: false }
			},
			events: {
				viewActivated: {
					type: "sap.ui.vk.View"
				},
				beforeTimeChanged: {
					time: {
						type: "float"
					},
					nextTime: {
						type: "float"
					},
					currentPlayback: {
						type: "sap.ui.vk.AnimationPlayback"
					},
					nextPlayback: {
						type: "sap.ui.vk.AnimationPlayback"
					}
				},
				timeChanged: {
					time: {
						type: "float"
					},
					previousTime: {
						type: "float"
					},
					currentPlayback: {
						type: "sap.ui.vk.AnimationPlayback"
					},
					previousPlayback: {
						type: "sap.ui.vk.AnimationPlayback"
					}
				},
				stateChanged: {
					playing: {
						type: "boolean"
					},
					stopped: {
						type: "boolean"
					},
					endOfAnimation: {
						type: "boolean"
					}
				}
			}
		},

		constructor: function(id, settings) {
			Element.apply(this, arguments);
			vkCore.observeLifetime(this);
		}
	});

	AnimationPlayer.prototype._getViewStateManager = function() {
		var vsm = this.getViewStateManager();
		return vsm ? core.byId(vsm) : undefined;
	};

	AnimationPlayer.prototype.init = function() {
		this._step = this._step.bind(this);

		this._playbackCollection = null;
		this._currentPlayback = null;

		// absolute time
		this._time = 0;
		this._nodeChanges = new Map();

		vkCore.getEventBus().subscribe("sap.ui.vk", "readyForAnimation", this._onViewApplied, this);
		vkCore.getEventBus().subscribe("sap.ui.vk", "sequenceChanged", this._onSequenceChanged, this);
		vkCore.getEventBus().subscribe("sap.ui.vk", "playbacksChanged", this._onPlaybacksChanged, this);
		vkCore.getEventBus().subscribe("sap.ui.vk", "trackChanged", this._onTrackChanged, this);
		vkCore.getEventBus().subscribe("sap.ui.vk", "nodeAnimationRemoved", this._onNodeAnimationRemoved, this);
	};

	AnimationPlayer.prototype.exit = function() {
		this._playbackCollection = null;
		this._currentPlayback = null;

		vkCore.getEventBus().unsubscribe("sap.ui.vk", "readyForAnimation", this._onViewApplied, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "sequenceChanged", this._onSequenceChanged, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "playbacksChanged", this._onPlaybacksChanged, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "trackChanged", this._onTrackChanged, this);
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "nodeAnimationRemoved", this._onNodeAnimationRemoved, this);
	};

	AnimationPlayer.prototype._onViewApplied = function(channel, eventId, event) {
		if (event.source == null || event.source.getId() !== this.getViewStateManager()) {
			return;
		}

		var view = event.view;
		var ignoreAnimationPosition = event.ignoreAnimationPosition;

		this.activateView(view, ignoreAnimationPosition);
	};

	AnimationPlayer.prototype._onSequenceChanged = function(channel, eventId, event) {

		if (this._currentPlayback) {
			var viewStateManager = this._getViewStateManager();
			var sequence = this._currentPlayback.getSequence();
			if (viewStateManager && sequence) {
				if (sequence.getId() === event.sequenceId) {
					viewStateManager.setJoints(sequence.getJoint(), this._currentPlayback);
				}
			}
		}

		this._clearPlaybackBoundaryProperties();
		this._setPlaybackBoundaryProperties();
	};

	AnimationPlayer.prototype._resetNodesAnimation = function(nodeRefs, property) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var viewStateManager = this._getViewStateManager();

		nodeRefs.forEach(function(nodeRef) {
			if (property) {
				viewStateManager.resetNodeProperty(nodeRef, property);
			} else {
				viewStateManager.resetNodeProperty(nodeRef);
				viewStateManager.resetNodeProperty(nodeRef, AnimationTrackType.Opacity);
			}
		});
	};

	AnimationPlayer.prototype._onPlaybacksChanged = function(channel, eventId, event) {
		if (event.operation === "playbackRemoved" && this._currentPlayback && this._currentPlayback === event.playback && this._currentPlayback.getSequence()) {
			var animations = this._currentPlayback.getSequence().getNodeAnimation();

			var animatedNodes = animations.map(function(animationInfo) { return animationInfo.nodeRef; });
			this._resetNodesAnimation(animatedNodes);
		}

		this._clearPlaybackBoundaryProperties();
	};

	AnimationPlayer.prototype._onTrackChanged = function(channel, eventId, event) {
		if (event.emptyTrack && this._currentPlayback) {
			var viewStateManager = this._getViewStateManager();
			var sequence = this._currentPlayback.getSequence();
			if (viewStateManager && sequence) {
				var animations = sequence.getNodeAnimation();
				animations.forEach(function(animationData) {
					for (var trackType in AnimationTrackType) {
						var type = AnimationTrackType[trackType];
						var track = animationData[type];
						if (track && track.getId() === event.trackId) {
							viewStateManager.resetNodeProperty(animationData.nodeRef, type);
							return;
						}
					}
				});
			}
			this._setPlaybackBoundaryProperties();
		}
	};

	AnimationPlayer.prototype._onNodeAnimationRemoved = function(channel, eventId, event) {
		if (this._currentPlayback) {
			var viewStateManager = this._getViewStateManager();
			var sequence = this._currentPlayback.getSequence();
			if (viewStateManager && sequence) {
				if (sequence.getId() === event.sequenceId) {
					viewStateManager.setJoints(sequence.getJoint(), this._currentPlayback);
					this._resetNodesAnimation(event.nodeRefs, event.property);
				}
			}
		}

		this._clearPlaybackBoundaryProperties();
	};

	/**
	 * Get the animated property of a node at the current time, should be called after
	 * {@link sap.ui.vk.AnimationPlayer#setTime setTime}.
	 *
	 * @param {any} nodeRef A node reference
	 * @param {sap.ui.vk.AnimationTrackType} property A property name
	 * @returns {object} An object with the following properties:
	 * <ul>
	 *   <li>For <code>Translate</code>, <code>Rotate</code>, <code>Scale</code>:
	 *     <ul>
	 *       <li><code>offsetToRest: float[]</code> - translation, scale or rotation in quaternion form relative to the
	 *         values of the rest transformation. If the property is not defined, <code>null</code> is assigned.
	 *       </li>
	 *       <li><code>offsetToPrevious: float[]</code> - translation, scale or rotation relative to the values at the
	 *         end of the previous playback or the values of the rest transformation for the first playback. If the
	 *         property is not defined, <code>null</code> is assigned. Rotation is assigned in the form in which the
	 *         animation track is defined.
	 *       </li>
	 *       <li><code>absolute: float[]</code> - values of translation, scale or rotation in quaternion form in the
	 *         parent's coordinate space.
	 *       </li>
	 *       <li><code>world: float[]</code> - values of translation, scale or rotation in quaternion form in the world
	 *         coordinate space.
	 *       </li>
	 *     </ul>
	 *   </li>
	 *   <li>For <code>Opacity</code>:
	 *     <ul>
	 *       <li><code>offsetToRest: float</code> - opacity relative to the rest opacity. If the property is not
	 *         defined, <code>null</code> is assigned.</li>
	 *       <li><code>offsetToPrevious: float</code> - opacity relative to the value at the end of the previous
	 *         playback or the rest opacity for the first playback. If the property is not defined, <code>null</code> is
	 *         assigned.</li>
	 *       <li><code>opacity: float</code> - the node's own opacity</li>
	 *       <li><code>totalOpacity: float</code> - the product of opacity values from all the ancestors and the node's
	 *         own opacity.</li>
	 *     </ul>
	 *   </li>
	 * </ul>
	 * @public
	 */
	AnimationPlayer.prototype.getAnimatedProperty = function(nodeRef, property) {
		var result = {};

		var viewStateManager = this._getViewStateManager();
		if (!viewStateManager) {
			return null;
		}

		if (property !== AnimationTrackType.Opacity) {

			var wtrans = viewStateManager.getTransformationWorld(nodeRef);

			if (property === AnimationTrackType.Rotate) {
				result.world = wtrans.quaternion;
			} else if (property === AnimationTrackType.Translate) {
				result.world = wtrans.translation;
			} else {
				result.world = wtrans.scale;
			}
		}

		var data = this._nodeChanges.get(nodeRef);
		if (!data || data[property] === undefined) {
			result.offsetToPrevious = null;
			result.offsetToRest = null;
			if (property === AnimationTrackType.Opacity) {
				result.absolute = viewStateManager.getOpacity(nodeRef);
				result.totalOpacity = viewStateManager.getTotalOpacity(nodeRef);
			} else {
				var trans = viewStateManager.getTransformation(nodeRef);

				if (property === AnimationTrackType.Rotate) {
					result.absolute = trans.quaternion;
				} else if (property === AnimationTrackType.Translate) {
					result.absolute = trans.translation;
				} else {
					result.absolute = trans.scale;
				}
			}
			return result;
		}

		if (property === AnimationTrackType.Opacity) {
			var opacity = data[property];
			result.offsetToRest = opacity;
			result.offsetToPrevious = data.offsetToPrevious[property];
			result.opacity = data.absolute.opacity;
			result.totalOpacity = data["totalOpacity"];

			return result;
		}


		var offset = data[property];
		result.offset = offset;
		if (property === AnimationTrackType.Rotate) {
			result.absolute = data.absolute.quaternion;
		} else if (property === AnimationTrackType.Translate) {
			result.absolute = data.absolute.translate;
		} else {
			result.absolute = data.absolute.scale;
		}

		result.offsetToPrevious = data.offsetToPrevious[property];
		result.offsetToRest = data[property];

		return result;
	};

	/**
	 * Moves animation to a specified time.
	 * @param {float} time Time to set
	 * @param {int} [playbackIndex] Optional, when specified, <code>time</code> is relative to beginning of specified playback.
	 * @param {boolean} blockTimeChangeEvents Optional, block the beforeTimeChanged and timeChanged events
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayer.prototype.setTime = function(time, playbackIndex, blockTimeChangeEvents) {
		this._setPlaybackBoundaryProperties();
		this._setTime(time, playbackIndex, blockTimeChangeEvents);
		return this;
	};

	AnimationPlayer.prototype._setTime = function(time, playbackIndex, blockTimeChangeEvents) {
		var previousTime = this._time;
		var previousPlayback = this._currentPlayback;
		if (!this._playbackCollection || !Array.isArray(this._playbackCollection.getPlaybacks())) {
			this._currentPlayback = undefined;
			this._time = 0;
		} else {

			if (playbackIndex != null) {
				time = this._getAbsoluteTime(time, playbackIndex);
			}

			var viewStateManager = this._getViewStateManager();
			var currentPlayback = this._currentPlayback;

			var newPlayback;
			if (time < 0 || time > this.getTotalDuration()) {
				newPlayback = undefined;
			} else if (playbackIndex != null) {
				newPlayback = this._playbackCollection.getPlayback(playbackIndex);
			} else {
				newPlayback = this._findPlaybackByAbsoluteTime(time);
			}

			// next play might not be in order, such as from end to start as a new play, or user clicks it from one place to a previous one
			// It is possibel that opacity animation does not exist in the next (jump) play, it should reset the opacity if it is dirty.
			var bresetOpacity = false;
			if (newPlayback && newPlayback.getReversed()) {
				if (this._currentPlayback && newPlayback.getJSONData().startTime > this._currentPlayback.getJSONData().startTime) {
					bresetOpacity = true;
				}
			} else if (newPlayback && this._currentPlayback && newPlayback.getJSONData().startTime < this._currentPlayback.getJSONData().startTime) {
				bresetOpacity = true;
			}

			if (!blockTimeChangeEvents && (time !== this._time || newPlayback !== this._currentPlayback)) {
				this.fireBeforeTimeChanged({
					time: this._time,
					nextTime: time,
					currentPlayback: this._currentPlayback,
					nextPlayback: newPlayback
				});
			}

			this._time = time;
			this._currentPlayback = newPlayback;
			if (viewStateManager && this._currentPlayback && currentPlayback !== this._currentPlayback) {
				// active playback have been changed, set joints into ViewStateManager
				var sequence = this._currentPlayback.getSequence();
				if (sequence) {
					viewStateManager.setJoints(sequence.getJoint(), this._currentPlayback);
				}
			} else if (!this._currentPlayback || !this._currentPlayback.getSequence()) {
				// no active playback or sequence, remove joints from ViewStateManager
				viewStateManager.setJoints(undefined);
			}


			if (viewStateManager) {

				var transforms = {
					nodeRefs: [],
					positions: []
				};

				var opacityChanges = {
					nodeRefs: [],
					opacities: []
				};

				this._collectNodeChanges();
				this._nodeChanges.forEach(function(value, nodeRef) {
					var offsetValues = {
						rtranslate: value.rtranslate,
						rscale: value.rscale,
						rrotate: value.rrotate,
						Euler: value.Euler,
						ropacity: value.offsetToPrevious && value.offsetToPrevious.ropacity ? value.offsetToPrevious.ropacity : value.ropacity
					};
					viewStateManager.setInterpolatedRelativeValues(nodeRef, offsetValues);
					var restTransformation = viewStateManager.getRestTransformation(nodeRef);
					var transformation = viewStateManager._addToTransformation(restTransformation, value.rtranslate, value.rrotate, value.rscale, value.originalRotationType, value.Euler);
					if (transformation) {
						transforms.nodeRefs.push(nodeRef);
						transforms.positions.push(transformation);
						value.absolute = {};
						value.absolute.translate = transformation.translation;
						value.absolute.scale = transformation.scale;
						value.absolute.quaternion = transformation.quaternion;
					}

					if (bresetOpacity && value[AnimationTrackType.Opacity] === undefined) {
						value[AnimationTrackType.Opacity] = 1.0;
						nodeRef.userData.opacity = undefined;
					}

					if (value[AnimationTrackType.Opacity] !== undefined) {
						var restOpacity = viewStateManager.getRestOpacity(nodeRef);
						// ignore zero rest opacity for animated nodes:
						// if we have zero rest opacity on animated node, it should be ignored as the intent is to have opacity animated.
						if (restOpacity === 0) {
							restOpacity = 1;
						}
						var opacity = value[AnimationTrackType.Opacity] * restOpacity;

						nodeRef.userData.animatedOpacity = true;
						value.absolute = {};
						value.absolute.opacity = opacity;

						opacityChanges.nodeRefs.push(nodeRef);
						opacityChanges.opacities.push(opacity);
					}
				}, this);

				viewStateManager.setTransformation(transforms.nodeRefs, transforms.positions);
				viewStateManager.setOpacity(opacityChanges.nodeRefs, opacityChanges.opacities);
				viewStateManager._propagateOpacityToJointChildren(opacityChanges.nodeRefs, opacityChanges.opacities);
				viewStateManager._setJointNodeMatrix();

				this._nodeChanges.forEach(function(value, nodeRef) { // total opacities have be calculated after all node opacities are available for possible parent-child nodes
					if (value[AnimationTrackType.Opacity] !== undefined) {
						value.totalOpacity = viewStateManager.getTotalOpacity(nodeRef);
					}
				}, this);
			}
		}

		if (!blockTimeChangeEvents && (this._time !== previousTime || this._currentPlayback !== previousPlayback)) {
			this.fireTimeChanged({
				time: this._time,
				previousTime: previousTime,
				currentPlayback: this._currentPlayback,
				previousPlayback: previousPlayback
			});
		}
	};

	/**
	 * Gets current absolute animation time position.
	 * @returns {float} animation time.
	 * @public
	 */
	AnimationPlayer.prototype.getTime = function() {
		return this._time;
	};

	/**
	 * Gets animation playback currently playing.
	 * @returns {sap.ui.vk.AnimationPlayback} animation playback.
	 * @public
	 */
	AnimationPlayer.prototype.getCurrentPlayback = function() {
		return this._currentPlayback;
	};

	/**
	 * Gets current animation time position in the current animation playback.
	 * @returns {float} animation time.
	 * @public
	 */
	AnimationPlayer.prototype.getCurrentPlaybackTime = function() {
		var time = this._time;
		var playbacks = this._playbackCollection.getPlaybacks();
		if (!Array.isArray(playbacks) || !this.getCurrentPlayback()) {
			return -1;
		}

		var idx = 0;
		while (playbacks[idx] != this.getCurrentPlayback()) {
			time -= playbacks[idx].getDuration();
			idx++;
		}

		return time;
	};


	/**
	 * Gets start time for specified animation playback.
	 * @param {sap.ui.vk.AnimationPlayback|int} playback Animation playback or animation playback index in the current view.
	 * @returns {float} animation start time.
	 * @public
	 */
	AnimationPlayer.prototype.getStartTime = function(playback) {
		if (!this._playbackCollection) {
			return undefined;
		}

		if (typeof playback === "number") {
			playback = this._playbackCollection.getPlayback(playback);
		}

		return playback ? playback.getStartTime() : undefined;
	};

	/**
	 * Gets current total animation duration.
	 * @returns {float} animation duration.
	 * @public
	 */
	AnimationPlayer.prototype.getTotalDuration = function() {
		if (!this._playbackCollection) {
			return 0;
		}

		var time = 0;

		this._playbackCollection.getPlaybacks().forEach(function(playback) {
			time += playback.getDuration();
		});

		return time;
	};

	// callback for requestAnimationFrame
	AnimationPlayer.prototype._step = function(timestamp) {
		this._frameId = undefined;
		if (!this._lastFrameTimestamp) {
			this._lastFrameTimestamp = timestamp;
		}

		var progress = timestamp - this._lastFrameTimestamp;

		this._lastFrameTimestamp = timestamp;

		var newTime = this.getTime() + progress / 1000;
		var requestFrame = newTime >= 0 && newTime <= this.getTotalDuration();
		if (newTime > this.getTotalDuration()) {
			newTime = this.getTotalDuration();
		}
		this.setTime(newTime); // time is in seconds

		if (requestFrame) {
			this._frameId = window.requestAnimationFrame(this._step);
		} else {
			this.stop();
		}
	};

	AnimationPlayer.prototype._interpolate = function(valueType, keyBracket, track, trackType, valueToSubtract) {
		if (!keyBracket.before && !keyBracket.after) {
			return undefined;
		}

		if (!keyBracket.before) {
			keyBracket.before = keyBracket.after;
		}

		if (!keyBracket.after) {
			if (valueType === AnimationTrackValueType.AngleAxis) {
				keyBracket.after = { value: [0, 0, 1, 0], time: keyBracket.before.time };
			} else {
				keyBracket.after = keyBracket.before;
			}
		}

		var k;
		if (keyBracket.before.time === keyBracket.after.time) {
			// When the current time is exactly at key's time let's make the `k` factor to interpolate the value to the
			// right side of the frame. For all track value types except axis-angle it is irrelevant as the result will
			// be the same as for any other `k` value. For axis-angle it is important to have `k` be equal 1.
			k = 1;
		} else {
			k = (keyBracket.time - keyBracket.before.time) / (keyBracket.after.time - keyBracket.before.time);
		}

		return AnimationMath.interpolate(valueType, keyBracket.before, keyBracket.after, k, track, trackType, valueToSubtract);
	};

	AnimationPlayer.getBoundaryKey = function(track, isStart) {

		var keyCount = track.getKeysCount();
		if (!keyCount) {
			return null;
		}

		var key;
		if (isStart) {
			key = track.getKey(0);
		} else {
			key = track.getKey(keyCount - 1);
		}

		var valueType = track.getKeysType();
		var q, result = {};
		if (valueType === AnimationTrackValueType.Euler) {
			result[valueType] = key.value;
			q = AnimationMath.neutralEulerToGlMatrixQuat(key.value);
			result.value = AnimationMath.glMatrixQuatToNeutral(q);
			result.time = key.time;
		} else if (valueType === AnimationTrackValueType.Quaternion) {
			q = AnimationMath.neutralQuatToGlMatrixQuat(key.value);
			result.value = AnimationMath.glMatrixQuatToNeutral(q);
			result.time = key.time;
		} else if (valueType !== AnimationTrackValueType.AngleAxis) {
			result.value = key.value; // FIXME: why not AnimationMath.glMatrixQuatToNeutral?
			result.time = key.time;
		} else {
			var key1;
			var k = 1;
			if (isStart) {
				key1 = key;
				if (keyCount > 1) {
					key1 = track.getKey(1);
					k = 0;
				}
			} else {
				key1 = key;
				if (keyCount > 1) {
					key = track.getKey(keyCount - 2);
				}
			}
			result = AnimationMath.interpolate(valueType, key, key1, k, track);
			result.time = isStart ? key.time : key1.time;
		}
		return result;
	};


	AnimationPlayer.prototype._getKeyFramesBracket = function(time, track) {
		var keyCount = track.getKeysCount();
		if (keyCount === 0) {
			return null;
		}

		// keybracket: time + keyframe before that time + keyframe after that time.
		// if the time is exactly at the key then `before` and `after` are equal.
		var result = {
			time: time,
			before: undefined,
			after: undefined
		};

		// get key before and after time specified
		for (var idx = 0; idx < keyCount; idx++) {
			var key = track.getKey(idx);
			if (key.time === time) {
				result.before = result.after = key;
				break;
			} else if (key.time > time) {
				result.before = (idx === 0 ? undefined : track.getKey(idx - 1));
				result.after = key;
				break;
			}
		}

		if (!result.before && !result.after && keyCount > 0) {
			result.before = track.getKey(keyCount - 1);
		}

		// check if we need to cycle forward or backward
		if (keyCount > 1 && (!result.after && track.isCycleForward() || !result.before && track.isCycleBackward())) {
			// map requested time to be inside a time range of the track
			var trackStartTime = track.getKey(0).time;
			var trackDuration = track.getKey(keyCount - 1).time - trackStartTime;

			var repetition = Math.floor((time - trackStartTime) / trackDuration);
			var timeInCycle = time - trackDuration * repetition;

			return this._getKeyFramesBracket(timeInCycle, track);
		}

		return result;
	};

	AnimationPlayer.prototype._collectNodeChangesFromPlaybackBoundaryKeys = function(nodeChanges, playback, isEnd) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return;
		}
		var animations = sequence.getNodeAnimation();
		if (!animations) {
			return;
		}

		var viewStateManager = this._getViewStateManager();
		var that = this;
		var addNodeChange = function(node, property, value) {
			if (!node || !property || value === undefined || value === null) {
				return;
			}
			var data = nodeChanges.get(node);
			if (data && data.hasOwnProperty(property)) {
				return;
			}

			if (!data) {
				data = {};
				nodeChanges.set(node, data);
			}

			if (!data.offsetToPrevious) {
				data.offsetToPrevious = {};
			}

			if (property === AnimationTrackType.Opacity) {
				data[property] = value;
				if (!data.offsetToPrevious[property]) {
					var opacity = viewStateManager.getOpacity(node);
					var restOpacity = viewStateManager.getRestOpacity(node);
					// ignore zero rest opacity for animated nodes:
					// if we have zero rest opacity on animated node, it should be ignored as the intent is to have opacity animated.
					if (restOpacity === 0) {
						restOpacity = 1;
					}
					if (restOpacity > 0 && (opacity !== undefined || opacity !== null)) {
						var opacityOffset = viewStateManager._getEndPropertyInPreviousPlayback(node, property, that._currentPlayback);
						if (opacityOffset) {
							opacity /= opacityOffset;
						}
						data.offsetToPrevious[property] = opacity / restOpacity;
					} else {
						data.offsetToPrevious[property] = 1;
					}
				}
			} else {
				data[property] = value.slice();
				var rtransform = viewStateManager.getRelativeTransformation(node);
				if (property === AnimationTrackType.Scale) {
					if (!data.offsetToPrevious[property]) {
						data.offsetToPrevious[property] = rtransform.scale.slice();
						var scaleOffset = viewStateManager._getEndPropertyInPreviousPlayback(node, property, that._currentPlayback);
						if (scaleOffset) {
							data.offsetToPrevious[property][0] /= scaleOffset[0];
							data.offsetToPrevious[property][1] /= scaleOffset[1];
							data.offsetToPrevious[property][2] /= scaleOffset[2];
						}
					}
				} if (property === AnimationTrackType.Translate) {
					if (!data.offsetToPrevious[property]) {
						data.offsetToPrevious[property] = rtransform.translation.slice();
						var translationOffset = viewStateManager._getEndPropertyInPreviousPlayback(node, property, that._currentPlayback);
						if (translationOffset) {
							data.offsetToPrevious[property][0] -= translationOffset[0];
							data.offsetToPrevious[property][1] -= translationOffset[1];
							data.offsetToPrevious[property][2] -= translationOffset[2];
						}
					}
				} if (property === AnimationTrackType.Rotate) {
					data.offsetToPrevious[property] = [0, 0, 1, 0];
				} else if (!data.offsetToPrevious[property]) {
					data.offsetToPrevious[property] = [0, 0, 0];
				}
			}
		};

		var nodePropertiesMap;
		if (isEnd) {
			nodePropertiesMap = playback._getNodeEndPropertiesMap();
		} else {
			nodePropertiesMap = playback._getNodeStartPropertiesMap();
		}

		if (!nodePropertiesMap) {
			return;
		}

		var currentSequence = this._currentPlayback && this._currentPlayback.getSequence();
		if (currentSequence) {
			nodePropertiesMap.forEach(function(values, node) {
				for (var property in values) {
					if (currentSequence._isNodePropertyDefined(node, property)) {
						continue;
					}
					addNodeChange(node, property, values[property]);
				}
			}, this);
		}
	};

	AnimationPlayer.prototype._collectSequenceNodeChanges = function(time, nodeChanges, playback) {
		var sequence = playback.getSequence();
		var animations = sequence && sequence.getNodeAnimation();
		if (!animations) {
			return;
		}
		var viewStateManager = this._getViewStateManager();

		var addNodeChange = function(node, property, result, valueType) {
			if (!node || !property || !result || result.value === undefined || result.value === null) {
				return;
			}

			var data = nodeChanges.get(node);
			if (!data) {
				data = {};
				nodeChanges.set(node, data);
			}

			if (!data.animationProperties) {
				data.animationProperties = {};
			}

			data.animationProperties[property] = true;
			if (valueType) {
				data.originalRotationType = valueType;
			}

			if (!data.offsetToPrevious) {
				data.offsetToPrevious = {};
			}

			var offset;
			if (property === AnimationTrackType.Opacity) {
				data[property] = result.value;
				data.offsetToPrevious[property] = result.value;
				offset = viewStateManager._getEndPropertyInPreviousPlayback(node, property, playback, true);
				if (offset) {
					data[property] *= offset;
				}
			} else {
				data[property] = result.value.slice();
				data.offsetToPrevious[property] = result.value.slice();
				offset = viewStateManager._getEndPropertyInPreviousPlayback(node, property, playback);
				if (offset) {
					if (property === AnimationTrackType.Translate) {
						data[property][0] += offset[0];
						data[property][1] += offset[1];
						data[property][2] += offset[2];
					} else if (property === AnimationTrackType.Scale) {
						data[property][0] *= offset[0];
						data[property][1] *= offset[1];
						data[property][2] *= offset[2];
					}
				}
			}
			if (valueType === AnimationTrackValueType.Euler || valueType === AnimationTrackValueType.AngleAxis) {
				data[valueType] = result[valueType].slice();
				data.offsetToPrevious[property] = result[valueType].slice();
				if (offset) {
					var q1 = AnimationMath.neutralQuatToGlMatrixQuat(offset);
					var q2 = AnimationMath.neutralQuatToGlMatrixQuat(data[property]);
					var q = glMatrix.quat.multiply(glMatrix.quat.create(), q2, q1);
					data[property] = AnimationMath.glMatrixQuatToNeutral(q);
				}
			}
		};

		var isReversedPlayback = playback.getReversed();
		var endTime = sequence.getDuration();

		animations.forEach(function(animationData) {
			var keyBracket;
			for (var trackType in AnimationTrackType) {
				var type = AnimationTrackType[trackType];
				var track = animationData[type];
				if (track && track.getKeysCount() > 0) {
					keyBracket = this._getKeyFramesBracket(time, track); // FIXME: take bracket for specific time
					if (!keyBracket) {
						return;
					}
					var valueType = track.getKeysType();
					var result = null;

					if (isReversedPlayback) {
						// As we use the *relative* animation the handling of reversed playbacks is different from the
						// usual *absolute* animation.
						if (valueType === AnimationTrackValueType.AngleAxis) {
							// For reversed axis-angle animation we do not need to *subtract* the last value in the
							// track from the keys as the axis-angle animation is cumulative by its nature. So, just
							// pass `true` as an indicator that this is a reversed animation.
							result = this._interpolate(valueType, keyBracket, track, type, true);
						} else {
							// For reversed non-axis-angle animation pass the last value in the track to *subtract* it
							// from all the keys.
							var lastBracketForReversedPlayback = this._getKeyFramesBracket(endTime, track);
							var endValueForReversedPlayback = this._interpolate(valueType, lastBracketForReversedPlayback, track, type);
							result = this._interpolate(valueType, keyBracket, track, type, endValueForReversedPlayback.value);
						}
					} else {
						result = this._interpolate(valueType, keyBracket, track, type);
					}

					if (type === AnimationTrackType.Rotate) {
						addNodeChange(animationData.nodeRef, type, result, valueType);
					} else {
						addNodeChange(animationData.nodeRef, type, result);
					}
				}
			}

		}, this);
	};

	AnimationPlayer.prototype._collectPlaybackNodeChanges = function(currentTime, nodeChanges, playback) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return;
		}

		var timeInPlayback = currentTime - playback.getStartTime();

		// playback isn't started yet
		if (timeInPlayback < 0) {
			return;
		}

		// playback duration without pre- and post- delays
		var barePlaybackDuration = sequence.getDuration() * playback.getTimeScale() * playback.getRepeats();

		// time scaled back to the sequence
		var sequenceTime = (timeInPlayback - playback.getPreDelay()) / playback.getTimeScale();
		// repeats
		var tolerance = 0.0001;
		if (sequenceTime > 0 && sequenceTime % sequence.getDuration() === 0) {
			sequenceTime = sequence.getDuration();
		} else if (sequenceTime > sequence.getDuration() + tolerance) {
			sequenceTime = sequenceTime % sequence.getDuration();
		} else if (sequenceTime > sequence.getDuration()) {
			sequenceTime = sequence.getDuration();
		}

		// take reversed flag into account
		sequenceTime = playback.getReversed() ? sequence.getDuration() - sequenceTime : sequenceTime;

		if (timeInPlayback < playback.getPreDelay()) {
			// reset view to start
			this._collectSequenceNodeChanges(0, nodeChanges, playback);
		} else if (timeInPlayback > playback.getPreDelay() + barePlaybackDuration) {
			// set animation to the very end
			this._collectSequenceNodeChanges(sequence.getDuration() * playback.getRepeats(), nodeChanges, playback);
		} else {
			this._collectSequenceNodeChanges(sequenceTime, nodeChanges, playback);
		}

	};

	AnimationPlayer.prototype._collectNodeChanges = function() {
		this._nodeChanges.clear();

		if (!this._currentPlayback) {
			return;
		}
		var playbacks = this._playbackCollection.getPlaybacks();
		var currentTime = this.getTime();
		var idx;

		var currentPlaybackIndex = 0;
		for (idx = 0; idx < playbacks.length; idx++) {
			if (this._currentPlayback && this._currentPlayback !== playbacks[idx]) {
				continue;
			}
			this._collectPlaybackNodeChanges(currentTime, this._nodeChanges, playbacks[idx]);
			currentPlaybackIndex = idx;
		}

		if (!this._currentPlayback.getReversed()) {
			for (idx = currentPlaybackIndex - 1; idx >= 0; idx--) {
				this._collectNodeChangesFromPlaybackBoundaryKeys(this._nodeChanges, playbacks[idx], true);
			}
			for (idx = currentPlaybackIndex + 1; idx < playbacks.length; idx++) {
				this._collectNodeChangesFromPlaybackBoundaryKeys(this._nodeChanges, playbacks[idx], false);
			}
		} else {
			for (idx = currentPlaybackIndex + 1; idx < playbacks.length; idx++) {
				this._collectNodeChangesFromPlaybackBoundaryKeys(this._nodeChanges, playbacks[idx], false);
			}

			for (idx = currentPlaybackIndex - 1; idx >= 0; idx--) {
				this._collectNodeChangesFromPlaybackBoundaryKeys(this._nodeChanges, playbacks[idx], true);
			}
		}

	};

	AnimationPlayer.prototype._clearPlaybackBoundaryProperties = function() {
		if (!this._playbackCollection) {
			return;
		}

		var playbacks = this._playbackCollection.getPlaybacks();
		for (var idx = 0; playbacks && idx < playbacks.length; idx++) {
			var playback = playbacks[idx];
			if (!playback) {
				continue;
			}
			playback._clearNodesBoundaryProperties();
		}
	};

	AnimationPlayer.prototype._setPlaybackBoundaryProperties = function(forced) {
		if (!this._playbackCollection) {
			return;
		}

		var currentTime = this._time;
		var currentPlayback = this._currentPlayback;
		var needResetTime = false;

		var playbacks = this._playbackCollection.getPlaybacks();

		var idx;
		var time = 0;

		var playback, sequence;
		if (forced) {
			this._clearPlaybackBoundaryProperties();
		}

		for (idx = 0; idx < playbacks.length; idx++) {
			playback = playbacks[idx];
			if (!playback) {
				continue;
			}
			var viewStateManager = this._getViewStateManager();
			sequence = playback.getSequence();
			if (viewStateManager && sequence) {
				if (!forced && playback._hasCompleteNodesBoundaryProperties()) {
					continue;
				}
				time = playback.getPreDelay();
				this._setTime(time, idx, true);
				playback._setCurrentNodesPropertiesAsBoundary(viewStateManager, false, forced);
				time += sequence.getDuration() * playback.getTimeScale() * playback.getRepeats();
				this._setTime(time, idx, true);
				playback._setCurrentNodesPropertiesAsBoundary(viewStateManager, true, forced);
				needResetTime = true;
			}
		}

		if (needResetTime) {

			if (!currentPlayback) {
				this._time = currentTime;
				this._setTime(this._time, null, true);

				// restore player state for proper event generation when time set.
				this._currentPlayback = currentPlayback;
			} else {
				var playbackIndex = -1;
				var startTime = 0;
				for (idx = 0; idx < playbacks.length; idx++) {
					playback = playbacks[idx];
					if (playback === currentPlayback) {
						playbackIndex = idx;
						break;
					}
					var playbackPlayTime = 0;
					sequence = playback.getSequence();
					if (sequence) {
						playbackPlayTime = sequence.getDuration() * playback.getTimeScale() * playback.getRepeats();
					}
					startTime += playback.getPreDelay() + playbackPlayTime + playback.getPostDelay();
				}
				if (playbackIndex !== -1) {
					var playbackTime = currentTime - startTime;
					this._setTime(playbackTime, playbackIndex, true);
				}
			}
		}
	};

	/**
	 * Starts playing animation from the current time position.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayer.prototype.play = function() {
		this._lastFrameTimestamp = undefined;
		this._frameId = this._frameId || window.requestAnimationFrame(this._step);

		vkCore.getEventBus().publish("sap.ui.vk", "animationPlayStateChanged", {
			source: this,
			view: this._playbackCollection,
			playing: true,
			stopped: false,
			endOfAnimation: false
		});

		this.fireStateChanged({
			playing: true,
			stopped: false
		});

		return this;
	};

	/**
	 * Stops playing animation.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationPlayer.prototype.stop = function() {
		if (this._frameId) {
			window.cancelAnimationFrame(this._frameId);
			this._frameId = undefined;
		}

		this._lastFrameTimestamp = undefined;

		this.fireStateChanged({
			playing: false,
			stopped: true,
			endOfAnimation: this.getTime() >= this.getTotalDuration()
		});

		vkCore.getEventBus().publish("sap.ui.vk", "animationPlayStateChanged", {
			source: this,
			view: this._playbackCollection,
			playing: false,
			stopped: true,
			endOfAnimation: this.getTime() >= this.getTotalDuration()
		});

		return this;
	};

	/**
	 * Activate specified view
	 *
	 * @param {sap.ui.vk.View} view view object definition
	 * @param {boolean} preventAnimation if true, doesn't move object into animation's initial position
	 * @returns {sap.ui.vk.AnimationPlayer} return this
	 * @private
	 */
	AnimationPlayer.prototype.activateView = function(view, preventAnimation) {
		this.stop();

		var viewStateManager = this._getViewStateManager();
		var playbacks = view.getPlaybacks();
		if (playbacks && playbacks.length > 0) {
			for (var i = 0; i < playbacks.length; i++) {
				var playback = playbacks[i];
				var sequence = playback.getSequence();
				if (sequence) {
					viewStateManager._convertTracksToRelative(sequence, playback.getReversed());
				}
			}
		}

		if (!preventAnimation) {
			this._playbackCollection = view;
		} else {
			this._playbackCollection = undefined;
		}

		this._currentPlayback = undefined;

		this.setTime(0);

		if (preventAnimation) {
			this._playbackCollection = view;
		}

		this.fireViewActivated({ view: view });

		return this;
	};

	AnimationPlayer.prototype._getAbsoluteTime = function(time, playbackIndex) {
		if (!this._playbackCollection || !Array.isArray(this._playbackCollection.getPlaybacks())) {
			return -1;
		}
		var playbacks = this._playbackCollection.getPlaybacks();
		if (playbackIndex < 0 || playbackIndex >= playbacks.length) {
			return -1;
		}

		var playback = this._playbackCollection.getPlayback(playbackIndex);
		if (!playback || playback.getDuration() < time || time < 0) {
			return -1;
		}

		var absoluteTime = time;
		var idx = 0;
		while (idx < playbackIndex) {
			var duration = playbacks[idx].getDuration();
			absoluteTime += duration;
			idx++;
		}

		return absoluteTime;
	};

	AnimationPlayer.prototype._findPlaybackByAbsoluteTime = function(time) {

		if (!this._playbackCollection || !Array.isArray(this._playbackCollection.getPlaybacks())) {
			return undefined;
		}

		var playbacks = this._playbackCollection.getPlaybacks();
		var lastPlaybackIndex = -1;
		var lastPlaybackStart = -1;
		playbacks.forEach(function(playback, index) {
			if (playback.getStartTime() > lastPlaybackStart) {
				lastPlaybackIndex = index;
				lastPlaybackStart = playback.getStartTime();
			}
		});

		var idx = 0;
		while (idx < playbacks.length) {
			var duration = playbacks[idx].getDuration();
			var startTime = playbacks[idx].getStartTime();


			if ((idx !== lastPlaybackIndex && time >= startTime && time < (startTime + duration)) ||
				(idx === lastPlaybackIndex && time >= startTime && time <= (startTime + duration))) {

				return playbacks[idx];
			}
			idx++;
		}

		return undefined;
	};

	return AnimationPlayer;
});
