/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/Object",
	"./AnimationTrackType",
	"./findIndexInArray",
	"./AnimationPlayer",
	"./AnimationTrack",
	"./Core"
], function(
	BaseObject,
	AnimationTrackType,
	findIndexInArray,
	AnimationPlayer,
	AnimationTrack,
	vkCore
) {
	"use strict";

	/**
	 * Constructor for an animation sequence.
	 *
	 * @class Provides the interface for animation sequence. The objects of this class should not be created directly.
	 * @param {string} sId Sequence ID
	 * @param {any} parameters Sequence parameters
	 * @param {string} parameters.name Sequence name
	 * @param {float} parameters.duration Sequence duration
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.AnimationSequence
	 * @implements sap.ui.vk.IJointCollection
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationSequence = BaseObject.extend("sap.ui.vk.AnimationSequence", /** @lends sap.ui.vk.AnimationSequence.prototype */ {

		constructor: function(sId, parameters) {
			this._jsonData = {};

			this._jsonData.id = sId;

			this._jsonData.name = parameters && parameters.name ? parameters.name : "";
			this._jsonData.duration = parameters && parameters.duration ? parameters.duration : 1.0;

			this._jsonData.joints = [];
			this._jsonData.nodes = [];
			this._trackMap = new Map();
		}
	});

	/**
	 * Sets the sequence name.
	 * @param {sap.ui.model.Model} model data binding model
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationSequence.prototype.setJSONModel = function(model) {
		this._model = model;
		return this;
	};

	/**
	 * Gets the sequence ID.
	 * @returns {string} The sequence ID.
	 * @public
	 */
	AnimationSequence.prototype.getId = function() {
		return this._jsonData.id;
	};

	/**
	 * Gets the sequence name.
	 * @returns {string} The sequence name.
	 * @public
	 */
	AnimationSequence.prototype.getName = function() {
		return this._jsonData.name;
	};

	/**
	 * Sets the sequence name.
	 * @param {string} name The sequence name.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationSequence.prototype.setName = function(name) {
		this._jsonData.name = name;
		if (this._model) {
			this._model.updateBindings();
		}
		return this;
	};

	/**
	 * Gets the sequence duration.
	 * @returns {float} The sequence duration.
	 * @public
	 */
	AnimationSequence.prototype.getDuration = function() {
		return this._jsonData.duration;
	};

	/**
	 * Sets the sequence duration.
	 * @param {float} duration The sequence duration.
	 * @param {boolean} blockSequenceChangedEvent block event for sequence changed
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationSequence.prototype.setDuration = function(duration, blockSequenceChangedEvent) {
		this._jsonData.duration = duration;
		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockSequenceChangedEvent) {
			this._fireSequenceChanged();
		}
		return this;
	};

	AnimationSequence.prototype._findJointIndex = function(parent, node) {
		var joints = this._jsonData.joints.filter(function(joint) {
			return joint.node && joint.parent;
		});
		return findIndexInArray(joints, function(joint) {
			return (parent ? joint.parent == parent : true) && (node ? joint.node == node : true);
		});
	};

	/**
	 * Sets node joint(s)
	 *
	 * @param {any|any[]} jointData              joint data
	 * @param {any}       jointData.parent       parent node
	 * @param {any}       jointData.node         child node
	 * @param {float[]}   jointData.translation  child's translation relative to parent
	 * @param {float[]}   jointData.quaternion   child's rotation relative to parent
	 * @param {float[]}   jointData.scale        child's scale relative to parent
	 *                                           During rendering, translation rotation and scale components are combined into
	 *                                           a matrix in the RTS order.
	 *
	 * @param {boolean} blockSequenceChangedEvent block event for sequence changed
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */
	AnimationSequence.prototype.setJoint = function(jointData, blockSequenceChangedEvent) {
		if (!Array.isArray(jointData)) {
			jointData = [jointData];
		}

		jointData.forEach(function(data) {

			var index = this._findJointIndex(data.parent, data.node);
			if (index < 0) {
				if (!data.parentSid && data.parent && data.parent.userData && data.parent.userData.treeNode) {
					data.parentSid = data.parent.userData.treeNode.sid;
				}
				if (!data.nodeSid && data.node && data.node.userData && data.node.userData.treeNode) {
					data.nodeSid = data.node.userData.treeNode.sid;
				}
				data.type = "RELATIVE";
				this._jsonData.joints.push(data);

			} /* else {
				this._jsonData.joints[index].translation = data.translation;
				this._jsonData.joints[index].quaternion = data.quaternion;
				this._jsonData.joints[index].scale = data.scale;
			} */
		}, this);

		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockSequenceChangedEvent) {
			this._fireSequenceChanged();
		}

		return this;
	};

	/**
	 * Gets node joint(s)
	 *
	 * @param {any}     [jointData]                    node joint data. If omitted, all node joints will be returned.
	 * @param {any}     [jointData.parent]             parent node.
	 * @param {any}     [jointData.node]               child node. If omitted, all children for the specified parent node will be returned.
	 *
	 * @returns {any|any[]} Object(s) containing joint and positioning data or <code>undefined</code> if no such joint present.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */
	AnimationSequence.prototype.getJoint = function(jointData) {
		var result;

		if (!jointData || (!jointData.parent && !jointData.node)) {

			// return all
			result = this._jsonData.joints;

		} else if (jointData && jointData.node) {

			// return a specific joint
			result = this._jsonData.joints.filter(function(item) {
				return item.node == jointData.node && (jointData.parent ? item.parent == jointData.parent : true);
			});

		} else if (jointData && jointData.parent && !jointData.node) {

			// return joints for a given parent
			result = this._jsonData.joints.filter(function(item) {
				return item.parent == jointData.parent;
			});
		}

		return result;
	};

	/**
	 * Removes node joint
	 *
	 * @param {any} [jointData]               joint data. If omitted, all node joints will be removed.
	 * @param {any} [jointData.parent]        parent node. If omitted, all joints for the specified child will be removed.
	 * @param {any} [jointData.node]          child node. If omitted, all joints for the specified parent will be removed.
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */
	AnimationSequence.prototype.removeJoint = function(jointData) {

		var nodes = [];
		if (!jointData) {
			this._jsonData.joints.forEach(function(joint) {
				nodes.push(joint.node);
			});
			// remove all joints
			this._jsonData.joints.splice(0);

		} else if (jointData && (jointData.node || jointData.parent)) {

			var index;
			do {
				index = this._findJointIndex(jointData.parent, jointData.node);
				if (index >= 0) {
					nodes.push(this._jsonData.joints[index].node);
					this._jsonData.joints.splice(index, 1);
				}
			} while (index >= 0);
		}

		if (this._model) {
			this._model.updateBindings();
		}

		if (nodes.length) {
			vkCore.getEventBus().publish("sap.ui.vk", "nodeAnimationRemoved", {
				nodeRefs: nodes,
				sequenceId: this._jsonData.id
			});
		}

		return this;
	};

	AnimationSequence.prototype._findNodeIndex = function(nodeRef) {
		return findIndexInArray(this._jsonData.nodes, function(node) {
			return (node ? node.nodeRef == nodeRef : true);
		});
	};

	/**
	 * Gets the animation track for specified property for a node.
	 * @param {object} [nodeRef] node to animate
	 * @param {sap.ui.vk.AnimationTrackType} [property] node's property to animate
	 *
	 * @returns {sap.ui.vk.AnimationTrack|any} animation data requested.
	 * @public
	 */
	AnimationSequence.prototype.getNodeAnimation = function(nodeRef, property) {

		var createInfo = function(nodeRef, property) {
			var index = this._findNodeIndex(nodeRef);
			var data, result;
			if (index !== -1) {
				data = this._jsonData.nodes[index];
			}

			if (data) {
				if (property) {
					if (data[property]) {
						result = this._trackMap.get(data[property]);
					}
				} else {
					result = {
						nodeRef: nodeRef
					};

					for (var trackType in AnimationTrackType) {
						var type = AnimationTrackType[trackType];
						if (data[type]) {
							result[type] = this._trackMap.get(data[type]);
						}
					}
				}
			}
			return result;
		}.bind(this);

		var result;

		if (nodeRef && !Array.isArray(nodeRef)) {

			return createInfo(nodeRef, property);

		} else if (!nodeRef) {
			// get all animation tracks
			result = [];
			this._jsonData.nodes.forEach(function(node) {
				result.push(createInfo(node.nodeRef, property));
			}, this);
		} else {
			// get animation track(s) for the set of nodes
			result = [];
			nodeRef.forEach(function(node) {
				result.push(createInfo(node, property));
			}, this);
		}

		return result;
	};

	/**
	 * Assigns animation track to animate node's specific property.
	 * @param {object} nodeRef node to animate
	 * @param {sap.ui.vk.AnimationTrackType} property node's property to animate
	 * @param {sap.ui.vk.AnimationTrack} track type of values used for animation
	 * @param {boolean} blockSequenceChangedEvent block event for sequence changed
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationSequence.prototype.setNodeAnimation = function(nodeRef, property, track, blockSequenceChangedEvent) {
		var index = this._findNodeIndex(nodeRef);
		var data;
		if (index !== -1) {
			data = this._jsonData.nodes[index];
		}
		if (!data) {
			data = {};
			data.nodeRef = nodeRef;
			if (nodeRef.userData && nodeRef.userData.treeNode) {
				data.sid = nodeRef.userData.treeNode.sid;
			}

			this._jsonData.nodes.push(data);
		}

		data[property] = track.getJSONData();
		this._trackMap.set(track.getJSONData(), track);
		track.setJSONModel(this._model);
		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockSequenceChangedEvent) {
			this._fireSequenceChanged();
		}

		return this;
	};

	/**
	 * Removes the animation of specified type for a node(s).
	 * @param {object} nodeRef node to remove animation
	 * @param {sap.ui.vk.AnimationTrackType} [property] node's property to animate
	 * @param {boolean} blockSequenceChangedEvent block event for sequence changed
	 *
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	AnimationSequence.prototype.removeNodeAnimation = function(nodeRef, property, blockSequenceChangedEvent) {
		var index = this._findNodeIndex(nodeRef);
		if (index === -1) {
			return this;
		}
		var data = this._jsonData.nodes[index];

		var track;
		if (!property) {
			for (var p in data) {
				track = this._trackMap.get(data[p]);
				if (track) {
					track.setJSONModel(null);
					this._trackMap.delete(data[p]);
				}
			}

			this._jsonData.nodes.splice(index, 1);
		} else {
			track = this._trackMap.get(data[property]);
			if (track) {
				track.setJSONModel(null);
				this._trackMap.delete(data[property]);
				delete data[property];
			}
		}

		if (this._model) {
			this._model.updateBindings();
		}

		if (!blockSequenceChangedEvent) {
			vkCore.getEventBus().publish("sap.ui.vk", "nodeAnimationRemoved", {
				nodeRefs: [nodeRef],
				property: property,
				sequenceId: this._jsonData.id
			});
		}
		return this;
	};

	/**
	 * Reset sequence duration to maximum length of tracks.
	 * @param {boolean} blockSequenceChangedEvent block event for sequence changed
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	AnimationSequence.prototype.resetDuration = function(blockSequenceChangedEvent) {

		var maxTrackLength = 0;
		this._jsonData.nodes.forEach(function(node) {
			var trackLength;
			for (var trackType in node) {
				if (trackType === "sid") {
					continue;
				}
				var track = this._trackMap.get(node[trackType]);
				if (track) {
					if (track.getKeysCount()) {
						var key = track.getKey(track.getKeysCount() - 1);
						trackLength = key.time;
					}
					if (trackLength && trackLength > maxTrackLength) {
						maxTrackLength = trackLength;
					}
				}
			}
		}, this);

		if (maxTrackLength > 0.0) {
			this._jsonData.duration = maxTrackLength;
			if (this._model) {
				this._model.updateBindings();
			}
		}

		if (!blockSequenceChangedEvent) {
			this._fireSequenceChanged();
		}

		return this;
	};

	AnimationSequence.prototype.getNodesBoundaryValues = function(isStart) {
		var result = new Map();

		var setNodeValue = function(nodeRef, property, value) {
			var data = result.get(nodeRef);
			if (!data) {
				data = {};
				result.set(nodeRef, data);
			}
			data[property] = value;
		};

		this._jsonData.nodes.forEach(function(node) {
			for (var trackType in node) {
				if (trackType === "sid") {
					continue;
				}
				var track = this._trackMap.get(node[trackType]);
				if (track && track.getKeysCount()) {
					var startKey = AnimationPlayer.getBoundaryKey(track, isStart);
					setNodeValue(node.nodeRef, trackType, startKey.value);
				}
			}
		}.bind(this));

		return result;
	};

	AnimationSequence.prototype._fireSequenceChanged = function() {
		vkCore.getEventBus().publish("sap.ui.vk", "sequenceChanged", {
			sequenceId: this._jsonData.id
		});
	};

	AnimationSequence.prototype._isNodePropertyDefined = function(nodeRef, property) {
		var track = this.getNodeAnimation(nodeRef, property);

		if (track && track.getKeysCount()) {
			return true;
		}

		var jointData = { node: nodeRef };
		var joints = this.getJoint(jointData);
		if (joints && joints.length) {
			return true;
		}
		return false;
	};

	AnimationSequence.prototype._getCurrentNodesProperties = function(viewStateManager, nodePropertiesMap) {

		this._jsonData.nodes.forEach(function(nodeProperties) {
			var data = {};
			var trans = viewStateManager.getRelativeTransformation(nodeProperties.nodeRef);
			for (var property in nodeProperties) {
				if (property === AnimationTrackType.Rotate) {
					data[AnimationTrackType.Rotate] = trans.quaternion.slice();
				} else if (property === AnimationTrackType.Translate) {
					data[AnimationTrackType.Translate] = trans.translation.slice();
				} else if (property === AnimationTrackType.Scale) {
					data[AnimationTrackType.Scale] = trans.scale.slice();
				} else if (property === AnimationTrackType.Opacity) {
					var opacity = viewStateManager.getOpacity(nodeProperties.nodeRef);
					var restOpacity = viewStateManager.getRestOpacity(nodeProperties.nodeRef);
					if (opacity !== null && opacity !== undefined) {
						if (!restOpacity) {
							restOpacity = 1;
						}
						data[AnimationTrackType.Opacity] = opacity / restOpacity;
					}
				}
			}
			nodePropertiesMap.set(nodeProperties.nodeRef, data);
		});

		// FIXME: This loop will iterate over some of the nodes iterated in the previous loop. And all their properties,
		// including non-animated, will be added to the map.
		this._jsonData.joints.forEach(function(joint) {
			if (!joint.node || !joint.parent) {
				return;
			}
			var data = {};
			var trans = viewStateManager.getRelativeTransformation(joint.node);
			data[AnimationTrackType.Rotate] = trans.quaternion.slice();
			data[AnimationTrackType.Translate] = trans.translation.slice();
			data[AnimationTrackType.Scale] = trans.scale.slice();
			var opacity = viewStateManager.getOpacity(joint.node);
			var restOpacity = viewStateManager.getRestOpacity(joint.node);
			if (opacity !== null && opacity !== undefined) {
				if (!restOpacity) {
					restOpacity = 1;
				}
				data[AnimationTrackType.Opacity] = opacity / restOpacity;
			}
			nodePropertiesMap.set(joint.node, data);
		});
	};

	/**
	 * Get JSON data object for sequence which contain track and joint data included in the sequence
	 * @returns {object} json data object
	 * @public
	 */
	AnimationSequence.prototype.getJSONData = function() {
		return this._jsonData;
	};

	return AnimationSequence;
});
