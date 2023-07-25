/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides AnimationHelper class.

sap.ui.define([
	"../thirdparty/three",
	"../View",
	"../AnimationPlayback",
	"../AnimationTrackType",
	"../AnimationTrackValueType",
	"../AnimationTrackValueTypeSize",
	"../AnimationRotateType",
	"../AnimationMath"
], function(
	THREE,
	View,
	AnimationPlayback,
	AnimationTrackType,
	AnimationTrackValueType,
	AnimationTrackValueTypeSize,
	AnimationRotateType,
	AnimationMath
) {
	"use strict";

	/**
	 * Provides help functions for processing animation data.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationHelper = function() {
	};

	AnimationHelper.prototype._getChildNodesWithMaterial = function(pnode, children) {
		for (var cni = 0; pnode.children && cni < pnode.children.length; cni++) {
			var child = pnode.children[cni];
			if (child && child.material && child.material.color) {
				children.push(child);
			}
			this._getChildNodesWithMaterial(child, children);
		}
	};

	AnimationHelper.prototype._getVkTrackType = function(trackData) {
		switch (trackData.type) {
			case "TRANSLATE":
				return AnimationTrackType.Translate;
			case "ROTATE":
				return AnimationTrackType.Rotate;
			case "SCALE":
				return AnimationTrackType.Scale;
			case "OPACITY":
				return AnimationTrackType.Opacity;
			case "COLOR":
				return AnimationTrackType.Color;
			default:
			// empty
		}
	};

	AnimationHelper.prototype._getVkTrackValueType = function(trackData, rotateType) {
		switch (trackData.type) {
			case "TRANSLATE":
				return AnimationTrackValueType.Vector3;
			case "ROTATE":
				if (rotateType === AnimationRotateType.Quaternion) {
					return AnimationTrackValueType.Quaternion;
				} else if (rotateType === AnimationRotateType.AngleAxis) {
					return AnimationTrackValueType.AngleAxis;
				} else {
					return AnimationTrackValueType.Euler;
				}
				break;
			case "SCALE":
				return AnimationTrackValueType.Vector3;
			case "OPACITY":
				return AnimationTrackValueType.Scalar;
			case "COLOR":
				return AnimationTrackValueType.Vector3;
			default:
			// empty
		}
	};

	AnimationHelper.prototype.insertEmptyTrack = function(track, sequence, node, scene) {
		var trackValueType = this._getVkTrackValueType(track);
		var vkTrack = scene.createTrack(null, {
			trackValueType: trackValueType,
			isAbsoluteValue: track.isAbsoluteValue
		});
		if (sequence && node) {
			sequence.setNodeAnimation(node, this._getVkTrackType(track), vkTrack, true);
		}
	};

	AnimationHelper.prototype.insertTracks = function(tracks, trackIdSequenceNodeMap, nodes, scene) {

		tracks.forEach(function(track) {

			var trackData = trackIdSequenceNodeMap.get(track.id);
			var vkTrack = scene.findTrack(track.id.toString());

			if (Array.isArray(trackData) && trackData.length) {
				if (!vkTrack) {
					var trackValueType = this._getVkTrackValueType(trackData[0], track.rotateType);
					var trackValueComponentsCount = AnimationTrackValueTypeSize.get(trackValueType);

					vkTrack = scene.createTrack(track.id.toString(), {
						trackValueType: trackValueType,
						cycleForward: track.cyclicInfo.cyclicEnd,
						cycleBackward: track.cyclicInfo.cyclicStart,
						infinite: track.infinite,
						isAbsoluteValue: trackData[0].isAbsoluteValue
					});

					if (track.times) {
						track.times.forEach(function(time, index) {
							var value;
							if (trackValueType === AnimationTrackValueType.Scalar) {
								value = track.values[index];
							} else {
								value = [];
								for (var j = 0; j < trackValueComponentsCount; j++) {
									value.push(track.values[index * trackValueComponentsCount + j]);
								}
							}

							vkTrack.insertKey(time, value, true);
						});
					}
				}

				trackData.forEach(function(data) {
					var sequence = scene.findSequence(data.sequenceId);
					var nodeRef = nodes.get(data.targetId);
					if (sequence && nodeRef) {
						sequence.setNodeAnimation(nodeRef, this._getVkTrackType(data), vkTrack, true);
					}
				}, this);
			}
		}, this);

		return this;
	};

	// The node initial positions in a view should not be affected by the animations of the subsequent views
	// This function is to reset the node initial positions which may be changed by those animations
	AnimationHelper.prototype.setInitialNodePositionsFromSubsequentViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		var animationSequence;
		var nodeData;
		var nextEntry;

		var currentNodeData = new Map();

		for (var vi = views.length - 1; vi > 0; vi--) {
			var subsequentView = views[vi];

			var subsequentPlaybacks;
			if (subsequentView) {
				subsequentPlaybacks = subsequentView.getPlaybacks();
			}

			if (subsequentPlaybacks) {
				for (var pi = subsequentPlaybacks.length - 1; pi >= 0; pi--) {
					var subsequentPlayback = subsequentPlaybacks[pi];

					if (subsequentPlayback) {
						animationSequence = scene.findSequence(subsequentPlayback.getSequence().getId());

						if (animationSequence) {

							if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
								continue;
							}
							if (!subsequentPlayback.getReversed()) {
								nodeData = animationSequence.getNodesBoundaryValues(true).entries();
							} else {
								nodeData = animationSequence.getNodesBoundaryValues(false).entries();
							}
							nextEntry = nodeData.next();
							while (!nextEntry.done) {
								currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
								nextEntry = nodeData.next();
							}
						}

					}
				}
			}

			var currentView = views[vi - 1];

			if (currentView) {

				if (!currentView.userData) {
					currentView.userData = {};
				}

				if (!currentView.userData.nodeStartDataByAnimation) {
					currentView.userData.nodeStartDataByAnimation = new Map();
				}

				nodeData = currentNodeData.entries();
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// The node initial positions in a view should be the positions that are changed by the animations of the previous views
	// This function is to reset the node initial positions to those changed positions
	AnimationHelper.prototype.setInitialNodePositionsFromPreviousViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		var animationSequence;
		var nodeData;
		var nextEntry;

		var currentNodeData = new Map();

		for (var vi = 0; vi < views.length - 1; vi++) {
			var previousView = views[vi];

			var previousPlaybacks;
			if (previousView) {
				previousPlaybacks = previousView.getPlaybacks();
			}

			if (previousPlaybacks) {
				for (var pi = 0; pi < previousPlaybacks.length; pi++) {
					var previousPlayback = previousPlaybacks[pi];

					if (previousPlayback) {
						animationSequence = scene.findSequence(previousPlayback.getSequence().getId());
						if (animationSequence) {

							if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
								continue;
							}

							if (!previousPlayback.getReversed()) {
								nodeData = animationSequence.getNodesBoundaryValues(false).entries();
							} else {
								nodeData = animationSequence.getNodesBoundaryValues(true).entries();
							}
							nextEntry = nodeData.next();
							while (!nextEntry.done) {
								currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
								nextEntry = nodeData.next();
							}
						}
					}
				}
			}

			var currentView = views[vi + 1];

			if (currentView) {
				if (!currentView.userData) {
					currentView.userData = {};
				}

				if (!currentView.userData.nodeStartDataByAnimation) {
					currentView.userData.nodeStartDataByAnimation = new Map();
				}

				nodeData = currentNodeData.entries();
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// if a view contains multiple playbacks, the initial state of a node at the start of
	// view activation should be the state of the node at start of the first
	// playback which changes the node properties
	AnimationHelper.prototype.setInitialNodePositionsOnView = function(view, scene, onlyCheckHighlight) {

		if (!view) {
			return;
		}

		var nodeData;
		var nextEntry;

		var currentPlaybackIndex = 0;
		var currentPlaybacks = null;
		currentPlaybacks = view.getPlaybacks();

		if (!currentPlaybacks || !currentPlaybacks.length) {
			return;
		}

		if (!view.userData) {
			view.userData = {};
		}

		if (!view.userData.nodeStartDataByAnimation) {
			view.userData.nodeStartDataByAnimation = new Map();
		}

		for (var cpi = currentPlaybacks.length - 1; cpi >= currentPlaybackIndex; cpi--) {
			var pb = currentPlaybacks[cpi];

			var animationSequence = scene.findSequence(pb.getSequence().getId());
			if (animationSequence) {

				if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
					continue;
				}

				if (pb.getReversed()) {
					nodeData = animationSequence.getNodesBoundaryValues(false).entries();
				} else {
					nodeData = animationSequence.getNodesBoundaryValues(true).entries();
				}
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					view.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// if a view contains multiple playbacks, the initial state of a node at the start of
	// view activation should be the state of the node at start of the first
	// playback which changes the node properties
	AnimationHelper.prototype.setInitialNodePositionsFromCurrenetViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		for (var vi = 0; vi < views.length; vi++) {
			var currentView = views[vi];

			if (!currentView) {
				continue;
			}

			this.setInitialNodePositionsOnView(currentView, scene, onlyCheckHighlight);
		}
	};

	// Used for Matai VDS file reading, as the start time for playback is not set
	AnimationHelper.prototype.setPlaybackStartTimes = function(views, scene) {

		if (!views || !views.length) {
			return;
		}

		for (var vi = 0; vi < views.length; vi++) {
			var currentView = views[vi];

			if (!currentView) {
				continue;
			}

			var currentPlaybacks = null;
			if (currentView) {
				currentPlaybacks = currentView.getPlaybacks();
			}

			if (!currentPlaybacks || !currentPlaybacks.length) {
				continue;
			}
			var time = 0;
			for (var cpi = 0; cpi < currentPlaybacks.length; cpi++) {
				var playback = currentPlaybacks[cpi];
				var sequence = playback.getSequence();
				if (sequence) {
					sequence.resetDuration(true);
				}
				playback.setStartTime(time);
				time += playback.getDuration();
			}
		}
	};

	AnimationHelper.prototype.prepareViewForAnimation = function(view) {

		var nodeInfo = view.getNodeInfos();

		if (!nodeInfo) {
			return;
		}

		if (!view.userData) {
			view.userData = {};
		}

		if (!view.userData.nodesDataByView) {
			view.userData.nodesDataByView = new Map();
		} else {
			return;
		}

		function arrayToMatrixThree(array) {
			return new THREE.Matrix4().set(array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8], array[9], array[10], array[11], 0, 0, 0, 1);
		}

		for (var vi = 0; vi < nodeInfo.length; vi++) {
			var node = nodeInfo[vi];
			if (!node || !node.target) {
				continue;
			}

			var data = {};
			if (node.transform) {
				data.position = new THREE.Vector3();
				data.scale = new THREE.Vector3();
				data.quaternion = new THREE.Quaternion();
				var newMatrix = arrayToMatrixThree(node.transform);
				newMatrix.decompose(data.position, data.quaternion, data.scale);
				view.userData.nodesDataByView.set(node.target, data);
			}
		}
	};

	AnimationHelper.prototype.getNodePositionByView = function(view, nodeRef) {
		var data;
		if (!view) {
			return data;
		}

		if (!view.userData || !view.userData.nodesDataByView) {
			this.prepareViewForAnimation(view);
		}

		if (view.userData && view.userData.nodesDataByView) {
			data = view.userData.nodesDataByView.get(nodeRef);
		}

		return data;
	};

	AnimationHelper.prototype.getNodePositionFromNearestPlayback = function(scene, view, sequenceId, nodeRef) {

		var data;
		if (!view || !scene) {
			return data;
		}

		var playbacks = view.getPlaybacks();
		if (!playbacks) {
			return data;
		}

		var pi;
		var playback;
		var currentStartTime = 0;
		for (pi = 0; pi < playbacks.length; pi++) {
			playback = playbacks[pi];
			if (sequenceId == playback.getSequenceId()) {
				currentStartTime = playback.getStartTime();
				break;
			}
		}

		var maxStartTime = 0;
		for (pi = 0; pi < playbacks.length; pi++) {
			playback = playbacks[pi];
			var startTime = playback.getStartTime();
			if (currentStartTime <= startTime) {
				continue;
			}
			if (sequenceId == playback.getSequenceId()) {
				continue;
			}
			var sequence = scene.findSequence(playback.getSequenceId());
			if (sequence) {
				var nodesData;
				if (playback.getReversed()) {
					nodesData = sequence.getNodesStartValues();
				} else {
					nodesData = sequence.getNodesEndValues();
				}

				var nodeData = nodesData.get(nodeRef);
				if (nodeData && startTime >= maxStartTime) {
					data = nodeData;
					maxStartTime = startTime;
				}
			}
		}

		return data;
	};

	AnimationHelper.prototype._buildViewInitialState = function(view, views, scene) {
		var viewIndex = views.indexOf(view);
		if (viewIndex < 0) {
			return undefined;
		}

		var idx;
		var j;
		var playbacks;

		var data = new Map();

		var setNodeData = function(nodeRef, type, value) {
			var state = data.get(nodeRef);
			if (!state) {
				state = {
					target: nodeRef
				};
				data.set(nodeRef, state);
			}

			state[type] = value;
		};

		var processSequence = function(sequence, useFirstKey) {
			if (!sequence) {
				return;
			}

			var animations = sequence.getNodeAnimation();
			if (animations) {
				animations.forEach(function(animationData) {
					var nodeRef = animationData.nodeRef;
					for (var trackType in AnimationTrackType) {
						var type = AnimationTrackType[trackType];
						var track = animationData[type];
						if (track && track.getKeysCount()) {
							var keyIndex = useFirstKey ? 0 : track.getKeysCount() - 1;
							var key = track.getKey(keyIndex);
							var valueType = track.getKeysType();
							var k = 0;
							if (valueType === AnimationTrackValueType.AngleAxis) {
								k = 1;
							}
							var result = AnimationMath.interpolate(valueType, key, key, k, track);
							setNodeData(nodeRef, type, result.value);
						}
					}
				});
			}
		};

		for (idx = views.length - 1; idx >= viewIndex; idx--) {
			// collect data from the first key in each track going backward
			playbacks = views[idx].getPlaybacks();
			if (Array.isArray(playbacks)) {
				for (j = playbacks.length - 1; j >= 0; j--) {
					processSequence(playbacks[j].getSequence(), true);
				}
			}
		}

		for (idx = 0; idx < viewIndex; idx++) {
			// collect data from the last key in each track going forward
			playbacks = views[idx].getPlaybacks();
			if (Array.isArray(playbacks)) {
				for (j = 0; j < playbacks.length; j++) {
					processSequence(playbacks[j].getSequence(), false);
				}
			}
		}

		return data;
	};

	AnimationHelper.prototype.buildViewsInitialState = function(views, scene) {
		if (!Array.isArray(views)) {
			return;
		}

		var toNodesInfo = function(nodeDataMap) {
			var result = [];
			nodeDataMap.forEach(function(nodeData, nodeRef) {
				result.push(nodeData);
			});

			return result;
		};

		views.forEach(function(view) {
			var nodeDataMap = this._buildViewInitialState(view, views, scene);
			if (nodeDataMap) {
				view.updateNodeInfos(toNodesInfo(nodeDataMap));
			}
		}, this);
	};

	return AnimationHelper;
});
