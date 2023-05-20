/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ExplodeTool
sap.ui.define([
	"./Tool",
	"./ExplodeAxis",
	"./ExplodeDirection",
	"./ExplodeItemGroup",
	"./ExplodeType",
	"./ExplodeToolHandler",
	"./ExplodeToolGizmo",
	"../AnimationPlayback",
	"../AnimationTrackType",
	"../AnimationTrackValueType",
	"../OrthographicCamera",
	"sap/ui/base/ManagedObjectObserver",
	"../getResourceBundle",
	"../TransformationMatrix",
	"../thirdparty/three"
], function(
	Tool,
	ExplodeAxis,
	ExplodeDirection,
	ExplodeItemGroup,
	ExplodeType,
	ExplodeToolHandler,
	ExplodeToolGizmo,
	AnimationPlayback,
	AnimationTrackType,
	AnimationTrackValueType,
	OrthographicCamera,
	ManagedObjectObserver,
	getResourceBundle,
	TransformationMatrix,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new ExplodeTool.
	 *
	 * @class
	 * Tool used to move objects in 3D space

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.ExplodeTool
	 */
	var ExplodeTool = Tool.extend("sap.ui.vk.tools.ExplodeTool", /** @lends sap.ui.vk.tools.ExplodeTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				// it is expected that type, axis and direction properties cannot be set
				// after user drags the gizmo and/or application sets a non-zero magnitude value
				type: { type: "sap.ui.vk.tools.ExplodeType", defaultValue: ExplodeType.Linear },
				axis: { type: "sap.ui.vk.tools.ExplodeAxis" },
				direction: { type: "sap.ui.vk.tools.ExplodeDirection" },

				magnitude: { type: "float", defaultValue: 0.0 },

				// anchor transformation matrix
				anchor: { type: "float[]", defaultValue: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
			},
			aggregations: {
				items: { type: "sap.ui.vk.tools.ExplodeItemGroup", multiple: true }
			},
			associations: {
				selectedItem: { type: "sap.ui.vk.tools.ExplodeItemGroup", multiple: false }
			},
			events: {
				axisSelected: {
					parameters: {
						axis: { type: "sap.ui.vk.tools.ExplodeAxis" },
						direction: { type: "sap.ui.vk.tools.ExplodeDirection" }
					}
				},
				magnitudeChanging: {
					parameters: {
						type: { type: "sap.ui.vk.tools.ExplodeType" },
						axis: { type: "sap.ui.vk.tools.ExplodeAxis" },
						direction: { type: "sap.ui.vk.tools.ExplodeDirection" },
						magnitude: { type: "float" }
					}
				},
				magnitudeChanged: {
					parameters: {
						type: { type: "sap.ui.vk.tools.ExplodeType" },
						axis: { type: "sap.ui.vk.tools.ExplodeAxis" },
						direction: { type: "sap.ui.vk.tools.ExplodeDirection" },
						magnitude: { type: "float" }
					}
				},
				itemSequenceChangePressed: {
					parameters: {
						item: { type: "sap.ui.vk.tools.ExplodeItemGroup" },
						moveUp: { type: "boolean" }
					}
				},
				itemPositionAdjusting: {
					parameters: {
						item: { type: "sap.ui.vk.tools.ExplodeItemGroup" },
						magnitudeAdjustmentMultiplier: { type: "float" }
					}
				},
				itemPositionAdjusted: {
					parameters: {
						item: { type: "sap.ui.vk.tools.ExplodeItemGroup" },
						magnitudeAdjustmentMultiplier: { type: "float" }
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new ExplodeToolHandler(this);
			this._gizmo = null;
		}
	});

	ExplodeTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		this.setAggregation("gizmo", new ExplodeToolGizmo());

		this._groupObserver = new ManagedObjectObserver(this._onGroupChanged.bind(this));
		this._groupsObserver = new ManagedObjectObserver(this._onGroupsChanged.bind(this));
		this._groupsObserver.observe(this, { aggregations: ["items"] });
	};

	ExplodeTool.prototype.destroy = function() {
		ExplodeTool._cleanAssociatedLoaders();
		this._groupsObserver.disconnect();
		this._groupsObserver = null;
		this._groupObserver.disconnect();
		this._groupObserver = null;
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	ExplodeTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.show(this._viewport, this);

				this._addLocoHandler();
			} else {
				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ExplodeTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	ExplodeTool.prototype.setType = function(value) {
		this.setProperty("type", value, true);
		if (this._gizmo) {
			this._gizmo._recalculateOffsets();
		}
	};

	ExplodeTool.prototype.setAxis = function(value) {
		this.setProperty("axis", value, true);
		if (this._gizmo) {
			this._gizmo._updateAxis();
		}
	};

	ExplodeTool.prototype.setDirection = function(value) {
		this.setProperty("direction", value, true);
		if (this._gizmo) {
			this._gizmo._updateAxis();
		}
	};

	ExplodeTool.prototype.setAnchor = function(value) {
		this.setProperty("anchor", value, true);
		if (this._gizmo) {
			this._gizmo._updateAxis();
		}
	};

	ExplodeTool.prototype.pickAnchorFromNodesList = function(nodeRefs) {
		var target = null;
		var maxSize = -1;
		var center = new THREE.Vector3();
		(Array.isArray(nodeRefs) ? nodeRefs : [nodeRefs]).forEach(function(nodeRef) {
			var boundingBox = new THREE.Box3();
			nodeRef._expandBoundingBox(boundingBox, false, true, true);
			var size = boundingBox.getSize(new THREE.Vector3()).manhattanLength();
			if (maxSize < size) {
				maxSize = size;
				target = nodeRef;
				boundingBox.getCenter(center);
			}
		});

		if (target !== null) {
			this.setAnchor(target.matrixWorld.clone().setPosition(center).elements);
		}

		return target;
	};

	ExplodeTool.prototype.setMagnitude = function(value) {
		value = Math.max(value, 0);
		this.setProperty("magnitude", value, true);
		if (this._gizmo) {
			this._gizmo._setMagnitude(value);
		}
	};

	ExplodeTool.prototype.setSelectedItem = function(value) {
		this.setAssociation("selectedItem", value);
		if (this._gizmo) {
			this._gizmo._handleSelectedItemChanged();
		}
	};

	ExplodeTool.prototype._onGroupsChanged = function(event) {
		// console.log("_onGroupsChanged", event.object, event.child);
		this._groupObserver.disconnect();
		this.getItems().forEach(function(item) {
			this._groupObserver.observe(item, { aggregations: ["items"] });
		}.bind(this));

		if (this._gizmo) {
			this._gizmo._handleGroupsChanged(event);
		}
	};

	ExplodeTool.prototype._onGroupChanged = function(event) {
		// console.log("_onGroupChanged", event.object, event.child);
		if (this._gizmo) {
			this._gizmo._handleGroupsChanged(event);
		}
	};

	ExplodeTool.prototype.reset = function() {
		this.getItems().forEach(function(item) {
			item.setMagnitudeAdjustmentMultiplier(0);
		});
		this.setMagnitude(0);
		this.setType(ExplodeType.Linear);
		this.setAxis(undefined);
		this.setDirection(undefined);
	};

	ExplodeTool.prototype._activateView = function(index) {
		var scene = this._viewport.getScene();
		var vsm = scene.getViewStateManager();
		var view = scene.getViews()[index];
		vsm.activateView(view);
		var animationPlayer = this._viewport._viewStateManager.getAnimationPlayer();
		if (animationPlayer) {
			setTimeout(function() { animationPlayer.play(); }, 100);
		}
	};


	ExplodeTool.prototype._createView = function(currentView, name, views, nodes, nodePositionData, groupId, seq) {
		var scene = this._viewport.getScene();
		var vsm = scene.getViewStateManager();
		var view = scene.createView({ name: name });
		var targetInfos = [];
		if (currentView) {
			var infos = currentView.getNodeInfos();
			infos.forEach(function(info) {
				var nodeInfo = {
					target: info.target,
					transform: info.transform ? info.transform.slice() : null,
					meshId: info.meshId,
					materialId: info.materialId,
					visible: info.visible,
					opacity: info.opacity
				};
				targetInfos.push(nodeInfo);
			});
		} else {
			var hierarchy = vsm.getNodeHierarchy();
			var enumerateR = function(node) {
				if (node.visible) {
					targetInfos.push({
						target: node,
						visible: node.visible
					});
				}
				hierarchy.enumerateChildren(node, enumerateR, false, true);
			};
			hierarchy.enumerateChildren(null, enumerateR, false, true);
		}
		view.setNodeInfos(targetInfos);

		var viewdata = { name: name, nodes: [] };
		if (currentView) {
			viewdata.sourceId = currentView.getViewId();
			viewdata.exclude = "PLAYBACK";

			var camera = this._viewport.getCamera();
			var cameraInfo = {
				origin: camera.getPosition(),
				target: camera.getTargetDirection(),
				up: camera.getUpDirection(),
				ortho: camera instanceof OrthographicCamera
			};

			if (cameraInfo.ortho) {
				cameraInfo.zoom = camera.getZoomFactor();
			} else {
				cameraInfo.fov = camera.getFov() / 180 * Math.PI;
			}

			viewdata.camera = cameraInfo;

			var animationPlayer = this._viewport._viewStateManager.getAnimationPlayer();
			if (animationPlayer) {
				viewdata.time = animationPlayer.getTime();
			}
		}

		targetInfos = [];
		nodes.forEach(function(node) {
			var nodeRef = node.node;
			var data = nodePositionData.get(nodeRef);

			viewdata.nodes.push({
				sid: scene.nodeRefToPersistentId(nodeRef),
				transform: data.localMatrix
			});
			targetInfos.push({
				target: nodeRef,
				transform: data.localMatrix
			});

		});
		view.updateNodeInfos(targetInfos);

		var currentGroup = scene.findViewGroupByView(currentView);
		viewdata.groupIds = currentGroup ? [currentGroup.getViewGroupId()] : [groupId];
		if (seq !== null) {
			viewdata.sequence = seq;
		}
		if (views) {
			views.push(viewdata);
		}
		return view;

	};

	/**
	 * Generates JSON describing the current state of explosion suitable for passing to the Storage Service
	 * @param {any} options options for JSON generation
	 * @param {string} options.viewPrefix name prefix for generated view(s)
	 * @param {any} options.animation animation options
	 * @param {boolean} options.animation.enabled generate animation data
	 * @param {boolean} options.animation.separateAnimations generate separate animation for each explosion group
	 * @param {boolean} options.animation.separateViews generate a view for each animation sequence
	 *                  When animation.separateViews option set, view definition will have a single playback for a particular
	 *                  explosion group.
	 *                  The view definition should also contain initial positions for all nodes included in previous groups.
	 * @param {any} group target group data
	 * @returns {any} JSON data for view and animation creation
	 */
	ExplodeTool.prototype.generateRequestData = function(options, group) {
		var prefix = options ? options.viewPrefix : null;
		var views = [];
		var duration = 1.0;
		var scene = this._viewport.getScene();
		var currentView = this._viewport.getCurrentView();
		var nodeOriginals = new Map();
		var nodePositions = new Map();
		var tracks = [];
		var sequences = [];
		var referenceNodes = [];
		var joints = [];
		var nextSeq = null;
		var viewsNeedUpdate = [];
		var groupSid = null;
		var explosionType = this.getType();

		if (group) {
			if (Array.isArray(group.views)) {
				var index = group.views.findIndex(function(v) { return v.id === currentView.getViewId(); });
				if (index >= 0) {
					nextSeq = group.views[index].sequence + 1;
				}
				viewsNeedUpdate = group.views.slice(index + 1);
			}
			groupSid = group.id;
		}

		var nodeData = new Map();

		if (options && options.animation && options.animation.enabled) {
			// Record node end positions
			this.getItems().forEach(function(group) {
				group.getItems().forEach(function(nodeProxy) {
					var nodeRef = nodeProxy.getNodeRef();
					// WARNING (EPDVISUALIZATION-2692, EPDVISUALIZATION-1132): We must perform animation in world CS, setting
					// reference nodes transformation will not work. If any changes are made to how joints animation is processed
					// in VIT, this code will require to use `nodeRef.matrix` for local transformation instead. See also
					// the code below for original position calculation.
					nodeRef.updateMatrixWorld();
					var position = (new THREE.Vector3()).setFromMatrixPosition(nodeRef.matrixWorld);
					nodePositions.set(nodeRef.uuid, position);

					// recalc local matrix as node might be a joint child
					var localMatrix = new THREE.Matrix4();
					localMatrix.copy(nodeRef.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
					var pos = new THREE.Vector3();
					var rotation = new THREE.Quaternion();
					var scale = new THREE.Vector3();
					localMatrix.decompose(pos, rotation, scale);

					nodeData.set(nodeRef, {
						localMatrix: TransformationMatrix.convertTo4x3(localMatrix.elements),
						position: pos,
						worldPosition: position
					});
				});
			});

			// Restore node transforms for track initial positions
			this._gizmo._nodes.forEach(function(node) {
				var nodeRef = node.node;
				nodeRef.matrix.elements[12] = node.local.x;
				nodeRef.matrix.elements[13] = node.local.y;
				nodeRef.matrix.elements[14] = node.local.z;
				nodeRef.position.setFromMatrixPosition(nodeRef.matrix);
				nodeRef.updateMatrixWorld(true);
				nodeOriginals.set(nodeRef, [node.local.x, node.local.y, node.local.z]);

				var worldPosition = (new THREE.Vector3()).setFromMatrixPosition(nodeRef.matrixWorld);

				var localMatrix = new THREE.Matrix4();
				localMatrix.copy(nodeRef.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
				var position = new THREE.Vector3();
				var rotation = new THREE.Quaternion();
				var scale = new THREE.Vector3();
				localMatrix.decompose(position, rotation, scale);
				var data = nodeData.get(nodeRef);
				data.originalPosition = position;
				data.originalWorldPosition = worldPosition;

			});
		}

		var nodesWithModifiedPosition = new Set();

		var view = this._createView(
			currentView,
			prefix ? prefix : getResourceBundle().getText("EXPLODETOOL_VIEW"),
			views,
			nodesWithModifiedPosition,
			nodeData,
			groupSid,
			nextSeq);

		var jsonView = views[views.length - 1];

		if (options && options.animation && options.animation.enabled) {
			if (!options.animation.separateAnimations) {
				options.animation.separateViews = false;
			}
			var seqPrefix = options.animation.sequencePrefix;
			// Animated
			var groupId = 1;
			var offsetMap = new Map();
			var sequence = null;
			var seqNodes = [];
			var seqJoints = [];
			var seqName = "";

			this.getItems().forEach(function(group) {
				referenceNodes.push({
					name: group.getName() ? group.getName() : getResourceBundle().getText("EXPLODETOOL_GROUP_NODE", groupId),
					contentType: "REFERENCE",
					transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
				});
				jsonView = views[views.length - 1];
				if (options.animation.separateAnimations || options.animation.separateViews || groupId == 1) {
					if (seqNodes.length > 0) {
						sequences.push({ name: seqName, endTime: duration, joints: seqJoints, nodes: seqNodes });
						seqNodes = [];
						seqJoints = [];
					}
					// Separate animations/views per group
					if (options.animation.separateViews) {
						seqName = getResourceBundle().getText("EXPLODETOOL_SEQUENCE_NAME", [jsonView.name, 1]);
					} else {
						seqName = getResourceBundle().getText("EXPLODETOOL_SEQUENCE_NAME", [jsonView.name, groupId]);
					}
					seqName = seqPrefix ? getResourceBundle().getText("EXPLODETOOL_PREFIX_n", [seqPrefix, groupId]) : seqName;
					sequence = scene.createSequence(view.getId() + "_seq" + groupId, { name: seqName, duration: duration });
					var playback = new AnimationPlayback({
						sequence: sequence
					});
					view.addPlayback(playback);
					view.resetPlaybacksStartTimes();
					if (!jsonView.playbacks) {
						jsonView.playbacks = [];
					}
					jsonView.playbacks.push({ start: options.animation.separateViews ? 0 : (groupId - 1) * duration, sequence: sequences.length });
				}
				var track = scene.createTrack(null, {
					trackValueType: AnimationTrackValueType.Vector3,
					isAbsoluteValue: false
				});
				this._gizmo._nodes.forEach(function(node) {
					if (node.group == group) {
						var nodeRef = node.node;
						var sid = scene.nodeRefToPersistentId(nodeRef);
						seqJoints.push(joints.length);
						joints.push({
							parent: groupId - 1,
							childSid: sid
						});
						var final = nodePositions.get(nodeRef.uuid);
						if (explosionType === ExplodeType.Radial || track.getKeysCount() == 0) {

							// Create a new track for each node in radial mode
							if (explosionType === ExplodeType.Radial && track.getKeysCount() > 0) {
								track = scene.createTrack(null, {
									trackValueType: AnimationTrackValueType.Vector3,
									isAbsoluteValue: false
								});
							}

							// NOTE: track offsets should take reference node matrix into account;
							// currently reference nodes have identity matrices, so this calculation is correct

							var data = nodeData.get(nodeRef);
							var offset = [
								data.worldPosition.x - data.originalWorldPosition.x,
								data.worldPosition.y - data.originalWorldPosition.y,
								data.worldPosition.z - data.originalWorldPosition.z
							];

							track.insertKey(0, [0, 0, 0]);
							track.insertKey(duration, offset);
							tracks.push({
								time: [0, duration],
								vector3: [0, 0, 0, offset[0], offset[1], offset[2]]
							});
						}
						if (explosionType === ExplodeType.Radial) {
							seqNodes.push({
								sid: sid,
								rtranslate: {
									track: tracks.length - 1
								}
							});
						}

						sequence.setNodeAnimation(nodeRef, AnimationTrackType.Translate, track);
						offsetMap.set(nodeRef, [final.x, final.y, final.z]);

						nodesWithModifiedPosition.add(node);
					}
				});
				if (explosionType === ExplodeType.Linear) {
					seqNodes.push({
						node: groupId - 1,
						rtranslate: {
							track: tracks.length - 1
						}
					});
				}

				groupId++;
				// Generate a new view per sequence
				if (options.animation.separateViews && groupId <= this.getItems().length) {
					view = this._createView(
						currentView,
						prefix ? getResourceBundle().getText("EXPLODETOOL_PREFIX_n", [prefix, groupId]) : getResourceBundle().getText("EXPLODETOOL_VIEW_n", groupId),
						views,
						nodesWithModifiedPosition,
						nodeData,
						groupSid,
						nextSeq ? ++nextSeq : nextSeq);

				}
			}.bind(this));
			if (seqNodes.length > 0) {
				sequences.push({ name: seqName, endTime: duration, joints: seqJoints, nodes: seqNodes });
			}
		} else {
			// Static view
			var nodeInfos = [];
			jsonView.nodes = [];
			this.getItems().forEach(function(group) {
				group.getItems().forEach(function(nodeProxy) {
					var nodeRef = nodeProxy.getNodeRef();
					var te = nodeRef.matrix.elements;
					var transform = [te[0], te[4], te[8], te[1], te[5], te[9], te[2], te[6], te[10], te[12], te[13], te[14]];
					nodeInfos.push({
						target: nodeRef,
						transform: transform
					});
					jsonView.nodes.push({
						sid: scene.nodeRefToPersistentId(nodeRef),
						transform: transform
					});
				});
			});
			view.updateNodeInfos(nodeInfos);
		}

		var formatRequest = function() {
			var requestData = {
				data: {
					views: views
				}
			};

			viewsNeedUpdate.forEach(function(v) {
				requestData.data.views.push({
					id: v.id,
					sequence: ++nextSeq
				});
			});

			if (sequences.length > 0) {
				requestData.data.tree = {
					nodes: referenceNodes
				};
				requestData.data.animation = {
					sequences: sequences,
					tracks: tracks,
					joints: joints
				};
			}
			return requestData;
		};

		return formatRequest();
	};

	return ExplodeTool;
});
