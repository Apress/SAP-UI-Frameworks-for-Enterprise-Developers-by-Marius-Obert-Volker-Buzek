/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides the ViewStateManager class.
sap.ui.define([
	"../Core",
	"../ViewStateManagerBase",
	"../thirdparty/three",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"./Scene",
	"../ObjectType",
	"../RotationType",
	"./NodesTransitionHelper",
	"./OutlineRenderer",
	"./HighlightPlayer",
	"../HighlightDisplayState",
	"../Highlight",
	"../AnimationTrackType",
	"../AnimationTrackValueType",
	"../AnimationMath",
	"../NodeContentType",
	"./ThreeUtils",
	"sap/ui/core/Core"
], function(
	vkCore,
	ViewStateManagerBase,
	THREE,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	Scene,
	ObjectType,
	RotationType,
	NodesTransitionHelper,
	OutlineRenderer,
	HighlightPlayer,
	HighlightDisplayState,
	Highlight,
	AnimationTrackType,
	AnimationTrackValueType,
	AnimationMath,
	NodeContentType,
	ThreeUtils,
	core
) {
	"use strict";

	var VisibilityTracker;

	/**
	 * Constructor for a new ViewStateManager.
	 *
	 * @class
	 * Manages the visibility and selection states of nodes in the scene.
	 *
	 * @param {string} [sId] ID for the new ViewStateManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ViewStateManager object.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.ViewStateManagerBase
	 * @alias sap.ui.vk.threejs.ViewStateManager
	 * @since 1.32.0
	 */
	var ViewStateManager = ViewStateManagerBase.extend("sap.ui.vk.threejs.ViewStateManager", /** @lends sap.ui.vk.threejs.ViewStateManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ViewStateManager.getMetadata().getParent().getClass().prototype;

	ViewStateManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._nodeHierarchy = null;
		this._nodeStates = new Map();
		this._selectedNodes = new Set(); // a collection of selected nodes for quick access,
		// usually there are not many selected objects,
		// so it is OK to store them in a collection.
		this._outlineRenderer = new OutlineRenderer(1.0);
		this._outlinedNodes = new Set();
		this.setOutlineColor("rgba(255, 0, 255, 1.0)");
		this.setOutlineWidth(1.0);

		this._visibilityTracker = new VisibilityTracker();

		this._showSelectionBoundingBox = true;
		this._boundingBoxesScene = new THREE.Scene();
		this._selectionColor = new THREE.Color(0xC0C000);

		this.setHighlightColor("rgba(255, 0, 0, 1.0)");

		this._joints = [];

		this._nodesTransitionHelper = new NodesTransitionHelper();
		this._nodesTransitionHelper.setViewStateManager(this);

		this._highlightPlayer = new HighlightPlayer();
		this._highlightPlayer.setViewStateManager(this);
		this._transitionPlayer = new HighlightPlayer();
		this._transitionPlayer.setViewStateManager(this);

		vkCore.getEventBus().subscribe("sap.ui.vk", "activateView", this._onActivateView, this);
	};

	ViewStateManager.prototype._clearBoundingBoxScene = function() {
		var all3DNodes = [];
		var allGroupNodes = [];

		ThreeUtils.getAllTHREENodes([this._boundingBoxesScene], all3DNodes, allGroupNodes);
		all3DNodes.forEach(function(n3d) {
			ThreeUtils.disposeObject(n3d);
			n3d.parent.remove(n3d);
		});

		allGroupNodes.forEach(function(g3d) {
			g3d.parent.remove(g3d);
		});
	};

	ViewStateManager.prototype.exit = function() {
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "activateView", this._onActivateView, this);

		if (this._nodesTransitionHelper) {
			this._nodesTransitionHelper.destroy();
		}

		if (this._outlineRenderer) {
			this._outlineRenderer.dispose();
			this._outlineRenderer = null;
		}

		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
			this._boundingBoxesScene = null;
		}
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	// Overridden sap.ui.vk.ViewStateManagerBase#_setContent.
	ViewStateManager.prototype._setContent = function(content) {
		if (content === this._scene) {
			return this;
		}

		var scene = null;
		if (content && content instanceof Scene) {
			scene = content;
		}
		this._setScene(scene);

		if (scene) {
			var initialView = scene.getInitialView();
			if (initialView) {
				this._currentView = initialView;
				this._resetNodesMaterialAndOpacityByCurrentView(this._currentView);
			}
		}

		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Node hierarchy handling begins.

	ViewStateManager.prototype._setScene = function(scene) {
		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
		}
		this._boundingBoxesScene = new THREE.Scene();
		this._setNodeHierarchy(scene ? scene.getDefaultNodeHierarchy() : null);
		if (scene) {
			scene.setViewStateManager(this);
		}
		this._scene = scene;

		if (this._scene) {
			var initialView = this._scene.getInitialView();
			if (initialView) {
				this.activateView(initialView);
			}
		}
		return this;
	};

	ViewStateManager.prototype._setNodeHierarchy = function(nodeHierarchy) {
		var oldNodeHierarchy = this._nodeHierarchy;

		if (this._nodeHierarchy) {
			this._nodeHierarchy = null;
			this._nodeStates.clear();
			this._selectedNodes.clear();
			this._outlinedNodes.clear();
			this._visibilityTracker.clear();
		}

		if (nodeHierarchy) {
			this._nodeHierarchy = nodeHierarchy;

			this._nodeHierarchy.attachNodeReplaced(this._handleNodeReplaced, this);
			this._nodeHierarchy.attachNodeUpdated(this._handleNodeUpdated, this);
			this._nodeHierarchy.attachNodeRemoving(this._handleNodeRemoving, this);

			this._initialState = { visible: [], hidden: [] };
			var that = this;

			var allNodeRefs = nodeHierarchy.findNodesByName();
			allNodeRefs.forEach(function(nodeRef) {
				that._initialState[nodeRef.visible ? "visible" : "hidden"].push(nodeRef);
			});

			this.fireVisibilityChanged({
				visible: this._initialState.visible,
				hidden: this._initialState.hidden
			});
		}

		if (nodeHierarchy !== oldNodeHierarchy) {
			this.fireNodeHierarchyReplaced({
				oldNodeHierarchy: oldNodeHierarchy,
				newNodeHierarchy: nodeHierarchy
			});
		}

		return this;
	};

	ViewStateManager.prototype._getJointByChildNode = function(nodeRef) {
		var joint;
		if (this._jointCollection) {
			for (var i = 0; i < this._jointCollection.length; i++) {
				if (this._jointCollection[i].node === nodeRef) {
					joint = this._jointCollection[i];
					break;
				}
			}
		}
		return joint;
	};

	ViewStateManager.prototype._handleNodeReplaced = function(event) {
		var replacedNodeRef = event.getParameter("ReplacedNodeRef");
		var replacementNodeRef = event.getParameter("ReplacementNodeRef");

		if (this.getSelectionState(replacedNodeRef)) {
			this.setSelectionState(replacementNodeRef, true);
			this.setSelectionState(replacedNodeRef, false);
		}
	};

	ViewStateManager.prototype._handleNodeUpdated = function(event) {
		var nodeRef = event.getParameter("nodeRef");

		if (this.getSelectionState(nodeRef)) {
			this.setSelectionState(nodeRef, false);
			this.setSelectionState(nodeRef, true);
		}
	};

	ViewStateManager.prototype._handleNodeRemoving = function(event) {
		var nodeRef = event.getParameter("nodeRef");

		if (this._jointCollection) {
			for (var i = 0; i < this._jointCollection.length; i++) {
				if (this._jointCollection[i].node === nodeRef) {
					this._jointCollection[i].node = null;
					break;
				}

				if (this._jointCollection[i].parent === nodeRef) {
					this._jointCollection[i].parent = null;
					break;
				}
			}
		}
		// Node is removed from node hierarchy, remove it from list of selected nodes
		if (this.getSelectionState(nodeRef)) {
			// Since this node is already removed from the scene don't send notification
			this.setSelectionState(nodeRef, false, true, true);
		}
	};

	ViewStateManager.prototype._renderOutline = function(renderer, scene, camera) {
		var c = abgrToColor(this._outlineColorABGR);
		var color = new THREE.Color(c.red / 255.0, c.green / 255.0, c.blue / 255.0);
		this._outlineRenderer.render(renderer, scene, camera, Array.from(this._outlinedNodes), color, this._jointCollection);
	};

	// Node hierarchy handling ends.
	////////////////////////////////////////////////////////////////////////

	/**
	 * Gets the NodeHierarchy object associated with this ViewStateManager object.
	 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManager object.
	 * @public
	 */
	ViewStateManager.prototype.getNodeHierarchy = function() {
		return this._nodeHierarchy;
	};

	/**
	 * Gets the visibility changes in the current ViewStateManager object.
	 * @returns {string[]} The visibility changes are in the form of an array. The array is a list of node VE ids which suffered a visibility changed relative to the default state.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityChanges = function() {
		return this.getShouldTrackVisibilityChanges() ? this._visibilityTracker.getInfo(this.getNodeHierarchy()) : null;
	};

	ViewStateManager.prototype.getCurrentView = function() {
		var viewManager = core.byId(this.getViewManager());
		if (!viewManager) {
			return null;
		}

		var currentView = viewManager.getActiveView();
		return currentView;
	};

	/**
	 * Reset node property to the value defined by current view..
	 *
	 * @param {object} nodeRef reference to node.
	 * @param {string} property node property
	 * @public
	 */
	ViewStateManager.prototype.resetNodeProperty = function(nodeRef, property) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			var nodes = [];
			nodes.push(nodeRef);
			if (this._jointCollection && this._jointCollection.length > 0) {

				for (var ji = 0; ji < this._jointCollection.length; ji++) {
					var joint = this._jointCollection[ji];
					if (!joint.node || !joint.parent) {
						continue;
					}
					var parent = joint.parent;
					if (parent !== nodeRef) {
						break;
					}
					nodes.push(joint.node);
				}
			}

			nodeInfo.forEach(function(node) {

				if (!nodes.includes(node.target)) {
					return;
				}

				if (!property || property !== AnimationTrackType.Opacity) {

					var transforms = {
						nodeRefs: [],
						positions: []
					};

					var newPosition;
					var newRotation;
					var newScale;

					if (node.transform) {
						var position = new THREE.Vector3();
						var rotation = new THREE.Quaternion();
						var scale = new THREE.Vector3();
						var newMatrix = arrayToMatrixThree(node.transform);
						newMatrix.decompose(position, rotation, scale);
						newPosition = position.toArray();
						newRotation = rotation.toArray();
						newScale = scale.toArray();
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						newPosition = node[AnimationTrackType.Translate].slice();
						newRotation = node[AnimationTrackType.Rotate].slice();
						newScale = node[AnimationTrackType.Scale].slice();
					}

					if (newPosition) {
						transforms.nodeRefs.push(node.target);
						transforms.positions.push({
							translation: newPosition,
							quaternion: newRotation,
							scale: newScale
						});

						this.setTransformation(transforms.nodeRefs, transforms.positions);
					}
				} else {
					nodeRef._vkSetOpacity(node.opacity, this._jointCollection);
					var eventParameters = {
						changed: nodeRef,
						opacity: nodeInfo.opacity
					};

					this.fireOpacityChanged(eventParameters);
				}
			}.bind(this));
		}
	};

	ViewStateManager.prototype.getVisibilityComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			allNodeRefs = nodeHierarchy.findNodesByName(),
			visible = [],
			hidden = [];

		allNodeRefs.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
			var veId = nodeProxy.getVeId();
			// destroy the node proxy
			nodeHierarchy.destroyNodeProxy(nodeProxy);
			if (veId) {
				// push the ve id to either visible/hidden array
				if (this.getVisibilityState(nodeRef)) {
					visible.push(veId);
				} else {
					hidden.push(veId);
				}
			}
		}, this);

		return {
			visible: visible,
			hidden: hidden
		};
	};

	ViewStateManager.prototype.resetVisibility = function() {
		this.setVisibilityState(this._initialState.visible, true, false);
		this.setVisibilityState(this._initialState.hidden, false, false);
		this._visibilityTracker.clear();
		return this;
	};

	/**
	 * Gets the visibility state of nodes.
	 *
	 * If a single node is passed to the method then a single visibility state is returned.<br/>
	 * If an array of nodes is passed to the method then an array of visibility states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityState = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(function(nodeRef) {
				return nodeRef ? nodeRef.visible : false;
			});
		}

		return nodeRefs ? nodeRefs.visible : false; // NB: The nodeRefs argument is a single nodeRef.
	};

	/**
	 * Sets the visibility state of the nodes.
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean|boolean[]} visible The new visibility state or array of states of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} force If a node is made visible but its parent is hidden then it will still be hidden in Viewport. This flag will force node to be visible regardless of parent's state.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setVisibilityState = function(nodeRefs, visible, recursive, force) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we have got an array of booleans as visibility change
		var isBulkChange = Array.isArray(visible);

		var recursiveVisibility = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, idx) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveVisibility.length;
				recursiveVisibility.length = length + collected.length;
				recursiveVisibility.fill(isBulkChange ? visible[idx] : visible, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, visible is a scalar
			recursiveVisibility.length = allNodeRefs.length;
			recursiveVisibility.fill(visible);
		} else {
			// not recursive, visible is an array
			recursiveVisibility = visible;
		}

		// filter out unchanged visibility and duplicate nodes
		var changedVisibility = [];
		var usedNodeRefs = new Set();
		var changed = allNodeRefs.filter(function(nodeRef, index) {
			if (nodeRef == null || (nodeRef.userData.skipIt && nodeRef.visible) || usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var changed = nodeRef ? nodeRef.visible != recursiveVisibility[index] : false;
			if (changed) {
				changedVisibility.push(recursiveVisibility[index]);
			}

			return changed;
		}, this);

		if (changed.length > 0) {

			var eventParameters = {
				visible: [],
				hidden: []
			};

			changed.forEach(function(nodeRef, idx) {
				nodeRef.visible = changedVisibility[idx];
				eventParameters[nodeRef.visible ? "visible" : "hidden"].push(nodeRef);

				if (force && nodeRef.visible) {
					// Force visibility by traversing ancestor nodes and make them visible
					var node = nodeRef.parent;
					while (node) {
						node.visible = true;
						node = node.parent;
					}
				}
			}, this);

			if (this.getShouldTrackVisibilityChanges()) {
				changed.forEach(this._visibilityTracker.trackNodeRef, this._visibilityTracker);
			}

			this.fireVisibilityChanged(eventParameters);
		}
		return this;
	};


	/**
	 * Enumerates IDs of the selected nodes.
	 *
	 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.enumerateSelection = function(callback) {
		this._selectedNodes.forEach(callback);
		return this;
	};

	/**
	 * Enumerates IDs of the outlined nodes.
	 *
	 * @param {function} callback A function to call when the outlined nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.enumerateOutlinedNodes = function(callback) {
		this._outlinedNodes.forEach(callback);
		return this;
	};

	/**
	 * Gets the selection state of the node.
	 *
	 * If a single node reference is passed to the method then a single selection state is returned.<br/>
	 * If an array of node references is passed to the method then an array of selection states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getSelectionState = function(nodeRefs) {
		var selectionSet = this._selectedNodes;
		function isSelected(nodeRef) {
			return selectionSet.has(nodeRef);
		}

		return Array.isArray(nodeRefs) ?
			nodeRefs.map(isSelected) : isSelected(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
	};

	ViewStateManager.prototype._getSelectionComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			selected = [],
			outlined = [];

		function getVeId(nodeRef) {
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef); // create node proxy based on dynamic node reference
			var veId = nodeProxy.getVeId();
			nodeHierarchy.destroyNodeProxy(nodeProxy); // destroy the node proxy
			return veId;
		}

		this._selectedNodes.forEach(function(nodeRef) {
			var veId = getVeId(nodeRef);
			if (veId) {
				selected.push(veId);
			}
		});

		this._outlinedNodes.forEach(function(nodeRef) {
			var veId = getVeId(nodeRef);
			if (veId) {
				outlined.push(veId);
			}
		});

		return {
			selected: selected,
			outlined: outlined
		};
	};

	ViewStateManager.prototype._isAChild = function(childNodeRef, nodeRefs) {
		var ancestor = childNodeRef.parent;
		while (ancestor) {
			if (nodeRefs.has(ancestor)) {
				return true;
			}
			ancestor = ancestor.parent;
		}
		return false;
	};

	ViewStateManager.prototype._AddBoundingBox = function(nodeRef) {
		if (nodeRef.userData.boundingBox === undefined) {
			nodeRef.userData.boundingBox = new THREE.Box3();
			nodeRef._vkCalculateObjectOrientedBoundingBox();
		}

		if (!nodeRef.userData.boundingBox.isEmpty() && this._boundingBoxesScene && nodeRef.userData.boxHelper === undefined) {
			var boxHelper = new THREE.Box3Helper(nodeRef.userData.boundingBox, 0xffff00);
			boxHelper.material.color = this._selectionColor;
			this._boundingBoxesScene.add(boxHelper);
			boxHelper.parent = nodeRef;
			nodeRef.userData.boxHelper = boxHelper;
		}
	};

	ViewStateManager.prototype._RemoveBoundingBox = function(nodeRef) {
		if (nodeRef.userData.boundingBox !== undefined) {
			delete nodeRef.userData.boundingBox;
		}

		if (nodeRef.userData.boxHelper !== undefined) {
			this._boundingBoxesScene.remove(nodeRef.userData.boxHelper);
			ThreeUtils.disposeObject(nodeRef.userData.boxHelper);
			delete nodeRef.userData.boxHelper;
		}
	};

	ViewStateManager.prototype._updateBoundingBoxes = function() {
		this._selectedNodes.forEach(function(nodeRef) {
			var ud = nodeRef.userData;
			if (ud.boundingBox) {
				nodeRef._vkCalculateObjectOrientedBoundingBox();
				var boxObject = ud.boxHelper;
				if (boxObject) {
					boxObject.box.set(ud.boundingBox.min, ud.boundingBox.max);
					boxObject.updateMatrixWorld();
				}
			}
		});
	};


	/**
	 * Sets if showing the bounding box when nodes are selected
	 *
	 * @param {boolean} val <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.setShowSelectionBoundingBox = function(val) {
		this._showSelectionBoundingBox = val;
		if (this._showSelectionBoundingBox) {
			this._selectedNodes.forEach(function(node) { this._AddBoundingBox(node); }.bind(this));
		} else {
			this._selectedNodes.forEach(function(node) { this._RemoveBoundingBox(node); }.bind(this));
		}

		this.fireSelectionChanged({
			selected: this._selectedNodes,
			unselected: []
		});
	};

	/**
	 * Gets if showing the bounding box when nodes are selected
	 *
	 * @returns {boolean} <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getShowSelectionBoundingBox = function() {
		return this._showSelectionBoundingBox;
	};

	ViewStateManager.prototype._isAncestorSelected = function(nodeRef) {
		nodeRef = nodeRef.parent;
		while (nodeRef) {
			if (this._selectedNodes.has(nodeRef)) {
				return true;
			}

			nodeRef = nodeRef.parent;
		}

		return false;
	};

	ViewStateManager.prototype._updateHighlightColor = function(nodeRef, parentSelected) {
		var selected = parentSelected || this._selectedNodes.has(nodeRef);
		var nodeContentType = nodeRef._vkGetNodeContentType();
		if (nodeContentType === NodeContentType.Background
			|| nodeContentType === NodeContentType.Symbol) {
			return;
		} else {
			nodeRef.userData.highlightColor = selected ? this._highlightColorABGR : undefined;
			nodeRef._vkUpdateMaterialColor();
			var children = nodeRef.children;
			for (var i = 0, l = children.length; i < l; i++) {
				var userData = children[i].userData;
				if (userData && userData.objectType === ObjectType.Hotspot) {
					continue;
				}
				this._updateHighlightColor(children[i], selected);
			}
		}
	};

	/**
	 * Sets the selection state of the nodes.
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} selected The new selection state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @deprecated Since version 1.56.3.
	 * @public
	 */
	ViewStateManager.prototype.setSelectionState = function(nodeRefs, selected, recursive, blockNotification) {
		if (!nodeRefs) {
			return this;
		}

		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		nodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(nodeRefs) : nodeRefs).filter(function(value, index, self) {
			return self.indexOf(value) === index;
		});

		if (this.getRecursiveSelection() && !selected) {
			nodeRefs = this._nodeHierarchy._appendAncestors(nodeRefs);
		}

		var changed = nodeRefs.filter(function(nodeRef) {
			return this._selectedNodes.has(nodeRef) !== selected;
		}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef) {
				if (nodeRef) {
					this._selectedNodes[selected ? "add" : "delete"](nodeRef);
					if (this._showSelectionBoundingBox) {
						this[selected ? "_AddBoundingBox" : "_RemoveBoundingBox"](nodeRef);
					}
				}
			}, this);

			// we need to update this._selectedNodes before updating nodes highlight color
			changed.forEach(function(nodeRef) {
				if (nodeRef) {
					this._updateHighlightColor(nodeRef, selected || this._isAncestorSelected(nodeRef));
				}
			}, this);

			if (!blockNotification) {
				this.fireSelectionChanged({
					selected: selected ? changed : [],
					unselected: selected ? [] : changed
				});
			}
		}

		return this;
	};

	/**
	 * Sets or resets the selection state of the nodes.
	 * @param {any|any[]} selectedNodeRefs The node reference or the array of node references of selected nodes.
	 * @param {any|any[]} unselectedNodeRefs The node reference or the array of node references of unselected nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setSelectionStates = function(selectedNodeRefs, unselectedNodeRefs, recursive, blockNotification) {
		if (!Array.isArray(selectedNodeRefs)) {
			selectedNodeRefs = [selectedNodeRefs];
		}

		if (!Array.isArray(unselectedNodeRefs)) {
			unselectedNodeRefs = [unselectedNodeRefs];
		}

		selectedNodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(selectedNodeRefs) : selectedNodeRefs);
		unselectedNodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(unselectedNodeRefs) : unselectedNodeRefs);

		if (this.getRecursiveSelection()) {
			unselectedNodeRefs = this._nodeHierarchy._appendAncestors(unselectedNodeRefs, selectedNodeRefs);
		}

		var selected = selectedNodeRefs.filter(function(nodeRef) {
			return this._selectedNodes.has(nodeRef) === false;
		}, this);

		var unselected = unselectedNodeRefs.filter(function(nodeRef) {
			return this._selectedNodes.has(nodeRef) === true;
		}, this);

		if (selected.length > 0 || unselected.length > 0) {
			selected.forEach(function(nodeRef) {
				this._selectedNodes.add(nodeRef);
				this._updateHighlightColor(nodeRef, true);
				if (this._showSelectionBoundingBox) {
					this._AddBoundingBox(nodeRef);
				}
			}, this);

			unselected.forEach(function(nodeRef) {
				this._selectedNodes.delete(nodeRef);
				if (this._showSelectionBoundingBox) {
					this._RemoveBoundingBox(nodeRef);
				}
			}, this);

			// we need to remove all unselected nodes from this._selectedNodes before updating unselected nodes highlight color
			unselected.forEach(function(nodeRef) {
				this._updateHighlightColor(nodeRef, this._isAncestorSelected(nodeRef));
			}, this);

			if (!blockNotification) {
				this.fireSelectionChanged({
					selected: selected,
					unselected: unselected
				});
			}
		}

		return this;
	};

	/**
	 * Sets the outline color
	 * @param {sap.ui.core.CSSColor|string|int} color The new outline color. The value can be defined as a string
	 *                                                in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                is passed then the tint color is reset and the node's own tint color should be used.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutlineColor = function(color) {
		switch (typeof color) {
			case "number":
				this._outlineColorABGR = color;
				break;
			case "string":
				if (sap.ui.core.CSSColor.isValid(color)) {
					this._outlineColorABGR = colorToABGR(cssColorToColor(color));
				}
				break;
			default:
				return this;
		}

		this.fireOutlineColorChanged({
			outlineColor: colorToCSSColor(abgrToColor(this._outlineColorABGR)),
			outlineColorABGR: this._outlineColorABGR
		});

		return this;
	};


	/**
	 * Gets the outline color
	 *
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the outline color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getOutlineColor = function(inABGRFormat) {
		return inABGRFormat ? this._outlineColorABGR : colorToCSSColor(abgrToColor(this._outlineColorABGR));
	};


	/**
	 * Gets the outlining state of the node.
	 *
	 * If a single node reference is passed to the method then a single outlining state is returned.<br/>
	 * If an array of node references is passed to the method then an array of outlining states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getOutliningState = function(nodeRefs) {
		var outliningSet = this._outlinedNodes;
		function isOutlined(nodeRef) {
			return outliningSet.has(nodeRef);
		}

		return Array.isArray(nodeRefs) ?
			nodeRefs.map(isOutlined) : isOutlined(nodeRefs); // NB: The nodeRefs argument is a single no
	};


	/**
	 * Sets or resets the outlining state of the nodes.
	 * @param {any|any[]} outlinedNodeRefs The node reference or the array of node references of outlined nodes.
	 * @param {any|any[]} unoutlinedNodeRefs The node reference or the array of node references of un-outlined nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress outlineChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutliningStates = function(outlinedNodeRefs, unoutlinedNodeRefs, recursive, blockNotification) {
		if (!Array.isArray(outlinedNodeRefs)) {
			outlinedNodeRefs = [outlinedNodeRefs];
		}

		if (!Array.isArray(unoutlinedNodeRefs)) {
			unoutlinedNodeRefs = [unoutlinedNodeRefs];
		}

		outlinedNodeRefs = (recursive || this.getRecursiveOutlining() ? this._collectNodesRecursively(outlinedNodeRefs) : outlinedNodeRefs);
		unoutlinedNodeRefs = (recursive || this.getRecursiveOutlining() ? this._collectNodesRecursively(unoutlinedNodeRefs) : unoutlinedNodeRefs);

		if (this.getRecursiveOutlining()) {
			unoutlinedNodeRefs = this._nodeHierarchy._appendAncestors(unoutlinedNodeRefs, outlinedNodeRefs);
		}

		var outlined = outlinedNodeRefs.filter(function(nodeRef) {
			return this._outlinedNodes.has(nodeRef) === false;
		}, this);

		var unoutlined = unoutlinedNodeRefs.filter(function(nodeRef) {
			return this._outlinedNodes.has(nodeRef) === true;
		}, this);

		if (outlined.length > 0 || unoutlined.length > 0) {
			outlined.forEach(function(nodeRef) {
				this._outlinedNodes.add(nodeRef);
			}, this);

			unoutlined.forEach(function(nodeRef) {
				this._outlinedNodes.delete(nodeRef);
			}, this);

			if (!blockNotification) {
				this.fireOutliningChanged({
					outlined: outlined,
					unoutlined: unoutlined
				});
			}
		}

		return this;
	};

	/**
	 * Sets the outline width
	 * @param {float} width           			width of outline
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutlineWidth = function(width) {
		this._outlineWidth = width;
		this._outlineRenderer.setOutlineWidth(width);
		this.fireOutlineWidthChanged({
			width: width
		});
		return this;
	};

	/**
	 * Gets the outline width
	 * @returns {float} width of outline
	 * @public
	 */
	ViewStateManager.prototype.getOutlineWidth = function() {
		return this._outlineWidth;
	};

	ViewStateManager.prototype._collectNodesRecursively = function(nodeRefs) {
		var result = [];
		var nodeHierarchy = this._nodeHierarchy;

		(Array.isArray(nodeRefs) ? nodeRefs : [nodeRefs]).forEach(function collectChildNodes(nodeRef) {
			result.push(nodeRef);
			nodeHierarchy.enumerateChildren(nodeRef, collectChildNodes, false, true);
		});
		return result;
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * A helper method to ensure the returned value is either <code>float</code> or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {float|null} The opacity or <code>null</code> if no opacity set.
	 * @private
	 */
	ViewStateManager.prototype._getOpacity = function(nodeRef) {
		return nodeRef.userData.opacity !== undefined ? nodeRef.userData.opacity : null;
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * If a single node is passed to the method then a single value is returned.<br/>
	 * If an array of nodes is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]}	nodeRefs	The node reference or the array of node references.
	 * @returns {float|float[]} A single value or an array of values. Value <code>null</code> means that the node's own opacity should be used.
	 * @public
	 */
	ViewStateManager.prototype.getOpacity = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(this._getOpacity, this);
		} else {
			return this._getOpacity(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
		}
	};

	/**
	 * Sets the opacity of the nodes.
	 *
	 * @param {any|any[]}               nodeRefs          The node reference or the array of node references.
	 * @param {float|float[]|null}      opacity           The new opacity of the nodes. If <code>null</code> is passed then the opacity is reset
	 *                                                    and the node's own opacity should be used.
	 * @param {boolean}         [recursive=false] This flag is not used, as opacity is always recursively applied to the offspring nodes by multiplication
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOpacity = function(nodeRefs, opacity, recursive) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we got an array as opacity
		var isBulkChange = Array.isArray(opacity);

		if (opacity == null) {
			opacity = undefined;
		} else if (isBulkChange) {
			opacity.forEach(function(value, idx) {
				if (value == null) {
					opacity[idx] = undefined;
				}
			});
		}

		var recursiveOpacity = [];
		var allNodeRefs = nodeRefs;

		if (!isBulkChange) {
			// not recursive, opacity is a scalar
			recursiveOpacity.length = allNodeRefs.length;
			recursiveOpacity.fill(opacity);
		} else {
			// not recursive, opacity is an array
			recursiveOpacity = opacity;
		}

		// filter out unchanged opacity and duplicate nodes
		var changedOpacity = [];
		var usedNodeRefs = new Set();
		var changed = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var changed = nodeRef ? nodeRef.userData.opacity !== recursiveOpacity[index] : false;
			if (changed) {
				changedOpacity.push(recursiveOpacity[index]);
			}

			return changed;
		}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef, idx) {
				nodeRef._vkSetOpacity(changedOpacity[idx], this._jointCollection);
			}, this);

			var eventParameters = {
				changed: changed,
				opacity: isBulkChange ? changedOpacity : changedOpacity[0]
			};

			this.fireOpacityChanged(eventParameters);
		}

		return this;
	};

	/**
	 * Gets the tint color of the node in the ABGR format.
	 *
	 * A helper method to ensure that the returned value is either <code>int</code> or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {int|null} The color in the ABGR format or <code>null</code> if no tint color is set.
	 * @private
	 */
	ViewStateManager.prototype._getTintColorABGR = function(nodeRef) {
		return nodeRef.userData.tintColor !== undefined ? nodeRef.userData.tintColor : null;
	};

	/**
	 * Gets the tint color in the CSS color format.
	 *
	 * A helper method to ensure that the returned value is either {@link sap.ui.core.CSSColor} or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {sap.ui.core.CSSColor|null} The color in the CSS color format or <code>null</code> if no tint color is set.
	 * @private
	 */
	ViewStateManager.prototype._getTintColor = function(nodeRef) {
		return nodeRef.userData.tintColor !== undefined ?
			colorToCSSColor(abgrToColor(nodeRef.userData.tintColor)) : null;
	};

	/**
	 * Gets the tint color of the node.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]}       nodeRefs             The node reference or the array of node references.
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the tint color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|sap.ui.core.CSSColor[]|int|int[]}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getTintColor = function(nodeRefs, inABGRFormat) {
		var getTintColorMethodName = inABGRFormat ? "_getTintColorABGR" : "_getTintColor";
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(this[getTintColorMethodName], this);
		} else {
			return this[getTintColorMethodName](nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
		}
	};

	/**
	 * Sets the tint color of the nodes.
	 * @param {any|any[]}                   nodeRefs          The node reference or the array of node references.
	 * @param {sap.ui.core.CSSColor|int|sap.ui.core.CSSColor[]|int[]|null} tintColor The new tint color of the nodes.
	 *                                                        The value can be defined as a string in the CSS color format or as an integer in the ABGR format or
	 *                                                        it could be array of these values. If <code>null</code>
	 *                                                        is passed then the tint color is reset and the node's own tint color should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setTintColor = function(nodeRefs, tintColor, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var toABGR = function(color) {
			var result = null;
			switch (typeof color) {
				case "number":
					result = color;
					break;
				case "string":
					if (sap.ui.core.CSSColor.isValid(color)) {
						result = colorToABGR(cssColorToColor(color));
					}
					break;
				default:
					result = undefined; // The color is invalid, reset it to null.
					break;
			}

			return result;
		};

		// check if we got an array as tint color
		var isBulkChange = Array.isArray(tintColor);

		var recursiveColor = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, idx) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveColor.length;
				recursiveColor.length = length + collected.length;
				recursiveColor.fill(isBulkChange ? tintColor[idx] : tintColor, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, opacity is a scalar
			recursiveColor.length = allNodeRefs.length;
			recursiveColor.fill(tintColor);
		} else {
			// not recursive, opacity is an array
			recursiveColor = tintColor;
		}

		// filter out unchanged opacity and duplicate nodes
		var changedColor = [];
		var usedNodeRefs = new Set();
		var changed = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);
			var changed = nodeRef ? nodeRef.userData.tintColor !== toABGR(recursiveColor[index]) : false;
			if (changed) {
				changedColor.push(recursiveColor[index]);
			}

			return changed;
		}, this);

		if (changed.length > 0) {
			var changedABGR = [];
			changed.forEach(function(nodeRef, idx) {
				var color = toABGR(changedColor[idx]);
				nodeRef._vkSetTintColor(color);
				changedABGR.push(color);
			}, this);

			var eventParameters = {
				changed: changed,
				tintColor: isBulkChange ? changedColor : changedColor[0],
				tintColorABGR: isBulkChange ? changedABGR : changedABGR[0]
			};

			this.fireTintColorChanged(eventParameters);
		}

		return this;
	};

	/**
	 * Sets the default highlighting color
	 * @param {sap.ui.core.CSSColor|string|int} color The new highlighting color. The value can be defined as a string
	 *                                                in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                is passed then the tint color is reset and the node's own tint color should be used.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setHighlightColor = function(color) {

		switch (typeof color) {
			case "number":
				this._highlightColorABGR = color;
				break;
			case "string":
				if (sap.ui.core.CSSColor.isValid(color)) {
					this._highlightColorABGR = colorToABGR(cssColorToColor(color));
				}
				break;
			default:
				return this;
		}

		if (this._selectedNodes.size > 0) {
			this._selectedNodes.forEach(function(nodeRef) {
				this._updateHighlightColor(nodeRef, true);
			}, this);
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(this._highlightColorABGR)),
			highlightColorABGR: this._highlightColorABGR
		});

		return this;
	};


	/**
	 * Gets the default highlighting color
	 *
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the highlighting color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getHighlightColor = function(inABGRFormat) {
		return inABGRFormat ? this._highlightColorABGR : colorToCSSColor(abgrToColor(this._highlightColorABGR));
	};

	/**
	 * Gets the decomposed node rest transformation matrix if node is not linked to a joint, otherwise return decomposed joint transformation
	 *
	 * @param {any} nodeRef The node reference
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationUsingJoint = function(nodeRef) {
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && joint.translation && joint.scale && joint.quaternion) {
			return joint;
		} else {
			return this.getRestTransformation(nodeRef);
		}
	};

	/**
	 * Gets the decomposed node local transformation matrix relative to node rest position
	 *
	 * @param {any|any[]} nodeRefs The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRelativeTransformation = function(nodeRefs) {
		var getData = function(node) {
			var restPosition = this.getRestTransformation(node);

			var rTranslation = [node.position.x - restPosition.translation[0],
			node.position.y - restPosition.translation[1],
			node.position.z - restPosition.translation[2]];

			var rQuaternion = new THREE.Quaternion().fromArray(restPosition.quaternion).invert().premultiply(node.quaternion).toArray();

			var rScale = [node.scale.x / restPosition.scale[0],
			node.scale.y / restPosition.scale[1],
			node.scale.z / restPosition.scale[2]];

			return { translation: rTranslation, quaternion: rQuaternion, scale: rScale };
		}.bind(this);

		if (!Array.isArray(nodeRefs)) {
			return getData(nodeRefs);
		}

		var result = [];
		nodeRefs.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the decomposed node transformation matrix under world coordinates.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformationWorld = function(nodeRef) {
		var getData = function(node) {

			var position = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			node.updateMatrixWorld();
			node.matrixWorld.decompose(position, quaternion, scale);
			return {
				translation: position.toArray(),
				quaternion: quaternion.toArray(),
				scale: scale.toArray()
			};
		};

		if (!Array.isArray(nodeRef)) {
			return getData(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the decomposed node local transformation matrix.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformation = function(nodeRef) {
		var getData = function(node) {


			return {
				translation: this.getTranslation(node),
				quaternion: this.getRotation(node, RotationType.Quaternion),
				scale: this.getScale(node)
			};
		}.bind(this);

		if (!Array.isArray(nodeRef)) {
			return getData(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the node transformation translation component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {float[]|Array<Array<float>>} A translation component of node's transformation matrix or array of components.
	 * @private
	 */
	ViewStateManager.prototype.getTranslation = function(nodeRef) {
		var getComponent = function(node) {
			// return !node.userData.position ? node.position.toArray() : node.userData.position.toArray();
			return node.position.toArray();
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;
	};

	/**
	 * Gets the node transformation scale component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {float[]|Array<Array<float>>} A scale component of node's transformation matrix or array of components.
	 * @private
	 */
	ViewStateManager.prototype.getScale = function(nodeRef) {
		var getComponent = function(node) {
			// return !node.userData.scale ? node.scale.toArray() : node.userData.scale.toArray();
			return node.scale.toArray();
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;
	};


	ViewStateManager.prototype._convertQuaternionToAngleAxis = function(quaternion) {
		if (quaternion.w > 1) {
			quaternion.normalize();
		}

		if (quaternion.w > 0.9999 && quaternion.x < 0.0001 && quaternion.y < 0.0001 && quaternion.z < 0.0001) {
			quaternion.w = 1;
			quaternion.x = 0;
			quaternion.y = 0;
			quaternion.z = 0;
		}

		var angle = 2 * Math.acos(quaternion.w);
		var x;
		var y;
		var z;
		var s = Math.sqrt(1 - quaternion.w * quaternion.w); // assuming quaternion normalized then w is less than 1, so term always positive.
		if (s < 0.0001) { // test to avoid divide by zero, s is always positive due to sqrt
			// if s close to zero then direction of axis not important
			x = 1;
			y = 0;
			z = 0;
		} else {
			x = quaternion.x / s; // normalize axis
			y = quaternion.y / s;
			z = quaternion.z / s;
		}

		return [x, y, z, angle];
	};

	/**
	 * Gets the node transformation rotation component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @param {sap.ui.vk.RotationType} rotationType Rotation representation type.
	 * @returns {float[]|Array<Array<float>>} A rotation component of node's transformation matrix or array of components in specified format.
	 * @private
	 */
	ViewStateManager.prototype.getRotation = function(nodeRef, rotationType) {
		var getComponent = function(node) {
			// var quaternion = !node.userData.quaternion ? node.quaternion : node.userData.quaternion;
			var quaternion = node.quaternion;
			var result;
			switch (rotationType) {
				case RotationType.AngleAxis:
					result = this._convertQuaternionToAngleAxis(quaternion);
					break;
				case RotationType.Euler:
					var euler = new THREE.Euler();
					euler.setFromQuaternion(quaternion);

					result = euler.toArray();
					break;
				default:
					result = quaternion.toArray();
			}
			return result;
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;

	};

	/**
	 * Sets the node transformation components.
	 *
	 * @param {any|any[]} nodeRefs The node reference or array of node references.
	 * @param {any|any[]} transformations Node's transformation matrix or it components or array of such.
	 * 									  Each object should contain one transform matrix or exactly one of angleAxis, euler or quaternion components.
	 * @param {float[]} [transformation.transform] 12-element array representing 4 x 3 transformation matrix stored row-wise, or
	 * @param {float[]} transformation.translation translation component.
	 * @param {float[]} transformation.scale scale component.
	 * @param {float[]} [transformation.angleAxis] rotation component as angle-axis, or
	 * @param {float[]} [transformation.euler] rotation component as Euler angles, or
	 * @param {float[]} [transformation.quaternion] rotation component as quaternion.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setTransformation = function(nodeRefs, transformations) {
		var isBulkChange = Array.isArray(nodeRefs);

		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var eventParameters = {
			changed: [],
			transformation: []
		};

		var getTransformParametersForEvent = function(node) {
			return {
				position: node.position.toArray(),
				quaternion: node.quaternion.toArray(),
				scale: node.scale.toArray()
			};
		};

		if (!transformations) {

			nodeRefs.forEach(function(nodeRef) {
				if (nodeRef.userData.position && nodeRef.userData.quaternion && nodeRef.userData.scale) {
					nodeRef.position = nodeRef.userData.position;
					nodeRef.quaternion = nodeRef.userData.quaternion;
					nodeRef.scale = nodeRef.userData.scale;
					nodeRef.updateMatrix();

					delete nodeRef.userData.position;
					delete nodeRef.userData.quaternion;
					delete nodeRef.userData.scale;
				}

				eventParameters.changed.push(nodeRef);
				eventParameters.transformation.push(getTransformParametersForEvent(nodeRef));
			}, this);

		} else {

			if (!Array.isArray(transformations)) {
				transformations = [transformations];
			}

			nodeRefs.forEach(function(nodeRef, idx) {
				var userData = nodeRef.userData;

				if (!userData) {
					return;
				}

				if (!userData.position) {
					userData.position = nodeRef.position.clone();
				}

				if (!userData.quaternion) {
					userData.quaternion = nodeRef.quaternion.clone();
				}

				if (!userData.scale) {
					userData.scale = nodeRef.scale.clone();
				}

				var transformation = transformations[idx];

				if (transformation.transform) {
					var newMatrix = arrayToMatrixThree(transformation.transform);
					newMatrix.decompose(nodeRef.position, nodeRef.quaternion, nodeRef.scale);
				} else {
					nodeRef.position.fromArray(transformation.translation);

					nodeRef.scale.fromArray(transformation.scale);

					if (transformation.quaternion) {
						nodeRef.quaternion.fromArray(transformation.quaternion);
					} else if (transformation.angleAxis) {
						var axis = new THREE.Vector3(transformation.angleAxis[0], transformation.angleAxis[1], transformation.angleAxis[2]);
						nodeRef.quaternion.setFromAxisAngle(axis, transformation.angleAxis[3]);
					} else if (transformation.euler) {
						var euler = new THREE.Euler();
						euler.fromArray(transformation.euler[0], transformation.euler[1], transformation.euler[2], transformation.euler[3]);
						nodeRef.quaternion.setFromEuler(euler);
					}
				}

				nodeRef.updateMatrix();

				eventParameters.changed.push(nodeRef);
				eventParameters.transformation.push(getTransformParametersForEvent(nodeRef));
			}, this);
		}

		if (!isBulkChange) {
			eventParameters.changed = eventParameters.changed[0];
			eventParameters.transformation = eventParameters.transformation[0];
		}

		this.fireTransformationChanged(eventParameters);

		return this;
	};

	ViewStateManager.prototype.getJoints = function() {
		return this._jointCollection;
	};

	ViewStateManager.prototype.setJoints = function(joints, playback) {
		this._jointCollection = [];
		this._playbackAssociatedWithJoints = null;

		if (!joints) {
			return this;
		}

		var jointSet = new Set();
		var jointMap = new Map();
		joints.forEach(function(joint) {
			if (!joint.node || !joint.parent) {
				return;
			}
			jointSet.add(joint.node);
			jointMap.set(joint.node, joint);
		});

		while (jointSet.size > 0) {
			var node = jointSet.values().next().value;
			jointSet.delete(node);
			var joint = jointMap.get(node);
			var jointSequence = [joint];

			var intermediateNodes = [];
			var ancestor = joint.parent;
			while (ancestor) {
				joint = jointMap.get(ancestor);
				if (joint !== undefined) {
					if (jointSet.delete(ancestor)) {
						jointSequence.push(joint);
					}

					if (intermediateNodes.length > 0) {
						joint.nodesToUpdate = joint.nodesToUpdate || [];
						while (intermediateNodes.length > 0) {
							var imNode = intermediateNodes.pop();
							if (joint.nodesToUpdate.indexOf(imNode) >= 0) {
								break;
							}
							joint.nodesToUpdate.push(imNode); // add intermediate node
						}
					}

					intermediateNodes.length = 0;
					ancestor = joint.parent;
				} else {
					intermediateNodes.push(ancestor);
					ancestor = ancestor.parent;
				}
			}

			while (jointSequence.length > 0) {
				this._jointCollection.push(jointSequence.pop());
			}
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._playbackAssociatedWithJoints = playback;
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				joint.translation = null;
				joint.scale = null;
				joint.quaternion = null;
				joint.opacity = null;
				if (joint.node.userData) {
					joint.node.userData.offsetTranslation = null;
					joint.node.userData.offsetQuaternion = null;
					joint.node.userData.offsetScale = null;
					joint.node.userData.originalRotationType = null;
					joint.node.userData.offsetOpacity = null;
				}
			});

			this._jointCollection.forEach(function(joint) {
				this._updateJointNode(joint, this._playbackAssociatedWithJoints);
			}.bind(this));
		}

		return this;
	};

	ViewStateManager.prototype._updateJointNode = function(joint, playback) {
		if (!joint.node || !joint.parent) {
			return;
		}

		if (joint.translation && joint.quaternion && joint.scale && joint.opacity) {
			return;
		}

		var jointMap = new Map();
		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				jointMap.set(joint.node, joint);
			});
		}

		var position, scale, quaternion, nodeMatrix, restTransformation, restOpacity;

		var node = joint.node;
		var worldMatrix = new THREE.Matrix4();
		var opacity, totalOpacity = 1;
		while (node) {
			restOpacity = this.getRestOpacity(node);
			restTransformation = this.getRestTransformation(node);
			if (!restTransformation) {
				node = node.parent;
				continue;
			}

			position = new THREE.Vector3(restTransformation.translation[0],
				restTransformation.translation[1],
				restTransformation.translation[2]);
			scale = new THREE.Vector3(restTransformation.scale[0],
				restTransformation.scale[1],
				restTransformation.scale[2]);
			quaternion = new THREE.Quaternion(restTransformation.quaternion[0],
				restTransformation.quaternion[1],
				restTransformation.quaternion[2],
				restTransformation.quaternion[3]);

			opacity = restOpacity;

			if (playback) {
				var offsetTrans = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Translate, playback, true);
				if (offsetTrans) {
					position.x += offsetTrans[0];
					position.y += offsetTrans[1];
					position.z += offsetTrans[2];
				}

				var offsetScale = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Scale, playback, true);
				if (offsetScale) {
					scale.x *= offsetScale[0];
					scale.y *= offsetScale[1];
					scale.z *= offsetScale[2];
				}

				var offsetRotate = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Rotate, playback, true);
				if (offsetRotate) {
					var offsetQ = new THREE.Quaternion(offsetRotate[0], offsetRotate[1], offsetRotate[2], offsetRotate[3]);
					quaternion = offsetQ.multiply(quaternion);
				}

				var offsetOpacity = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Opacity, playback, true);
				if (offsetOpacity != null) {
					opacity *= offsetOpacity;
				}
			}
			nodeMatrix = new THREE.Matrix4().compose(position, quaternion, scale);
			worldMatrix.premultiply(nodeMatrix);

			totalOpacity *= opacity;

			node = node.parent;
		}

		var parent = joint.parent;
		var jParentWorldMatrix = new THREE.Matrix4();
		var jParentOpacity = 1;

		while (parent) {
			var parentJoint = jointMap.get(parent);
			if (parentJoint) {
				if (!parentJoint.translation) {
					this._updateJointNode(parentJoint);
				}

				position = new THREE.Vector3(parentJoint.translation[0],
					parentJoint.translation[1],
					parentJoint.translation[2]);
				scale = new THREE.Vector3(parentJoint.scale[0],
					parentJoint.scale[1],
					parentJoint.scale[2]);
				quaternion = new THREE.Quaternion(parentJoint.quaternion[0],
					parentJoint.quaternion[1],
					parentJoint.quaternion[2],
					parentJoint.quaternion[3]);

				opacity = parentJoint.opacity;

				parent = parentJoint.parent;
			} else {
				restOpacity = this.getRestOpacity(parent);
				restTransformation = this.getRestTransformation(parent);
				if (!restTransformation) {
					parent = parent.parent;
					continue;
				}

				position = new THREE.Vector3(restTransformation.translation[0],
					restTransformation.translation[1],
					restTransformation.translation[2]);
				scale = new THREE.Vector3(restTransformation.scale[0],
					restTransformation.scale[1],
					restTransformation.scale[2]);
				quaternion = new THREE.Quaternion(restTransformation.quaternion[0],
					restTransformation.quaternion[1],
					restTransformation.quaternion[2],
					restTransformation.quaternion[3]);
				opacity = restOpacity;

				if (playback) {
					var poffsetTrans = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Translate, playback, true);
					if (poffsetTrans) {
						position.x += poffsetTrans[0];
						position.y += poffsetTrans[1];
						position.z += poffsetTrans[2];
					}

					var poffsetScale = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Scale, playback, true);
					if (poffsetScale) {
						scale.x *= poffsetScale[0];
						scale.y *= poffsetScale[1];
						scale.z *= poffsetScale[2];
					}

					var poffsetRotate = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Rotate, playback, true);
					if (poffsetRotate) {
						var poffsetQ = new THREE.Quaternion(poffsetRotate[0], poffsetRotate[1], poffsetRotate[2], poffsetRotate[3]);
						quaternion = poffsetQ.multiply(quaternion);
					}

					var poffsetOpacity = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Opacity, playback, true);
					if (poffsetOpacity != null) {
						opacity *= poffsetOpacity;
					}
				}
				parent = parent.parent;
			}

			nodeMatrix = new THREE.Matrix4().compose(position, quaternion, scale);
			jParentWorldMatrix.premultiply(nodeMatrix);
			jParentOpacity *= opacity;
		}

		var jointMatrix = jParentWorldMatrix.copy(jParentWorldMatrix).invert().multiply(worldMatrix);
		jointMatrix.decompose(position, quaternion, scale);

		joint.translation = position.toArray();
		joint.quaternion = quaternion.toArray();
		joint.scale = scale.toArray();

		var calcJointOpacity = function(treeOpacity, jointParentOpacity) {
			if (treeOpacity === jointParentOpacity) {
				return 1;
			} else if (Math.abs(jointParentOpacity) < 0.0001) {
				return 1;
			}

			return treeOpacity / jointParentOpacity;
		};

		joint.opacity = calcJointOpacity(totalOpacity, jParentOpacity);
	};

	ViewStateManager.prototype._propagateOpacityToJointChildren = function(nodeRefs, opacities) {
		if (!nodeRefs || !opacities || nodeRefs.length !== opacities.length) {
			return this;
		}

		if (!this._jointCollection || !this._jointCollection.length) {
			return this;
		}

		var jointParentMap = new Map();
		this._jointCollection.forEach(function(joint) {
			var joints = jointParentMap.get(joint.parent);
			if (!joints) {
				joints = [];
				jointParentMap.set(joint.parent, joints);
			}
			joints.push(joint);
		});

		var applyOpacity = function(joint, opacity) {
			if (joint.opacity != null && joint.node && joint.node.userData) {
				joint.node.userData.opacity = joint.opacity * opacity;

				if (joint.node.userData.offsetOpacity != null) {
					joint.node.userData.opacity *= joint.node.userData.offsetOpacity;
				}
			}
		};

		nodeRefs.forEach(function(nodeRef, index) {
			var joints = jointParentMap.get(nodeRef);
			if (joints) {
				joints.forEach(function(joint) {
					applyOpacity(joint, opacities[index]);
				});
			}
		});

		return this;
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Moved from Viewport class: view activation - related
	//
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	ViewStateManager.prototype._updateMaterialInNode = function(nodeInfo) {

		var node = nodeInfo.target;

		for (var i = 0, l = node.children.length; i < l; i++) {
			var child = node.children[i];
			if (child.userData.animatedColor) {
				child._vkUpdateMaterialColor();
			}
		}

		var materialId = nodeInfo.materialId;
		if (node.userData.materialId !== materialId) {
			node.userData.materialId = materialId;
			this._scene._setNodeMaterial(node, materialId);
		}
	};

	/**
	 * Get the Symbol node from nodeId,
	 * if nodeId is not set, returns a collection of all Symbol nodes
	 *
	 * @param {string} nodeId node Id string, optional
	 * @returns {any[]} An array of nodes
	 * @public
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	ViewStateManager.prototype.getSymbolNodes = function(nodeId) {
		var view = this.getCurrentView() || this._scene.getViews()[0];
		var symbolNodes = view ? view.getNodeInfos().reduce(function(nodeInfos, currNode) {
			if (currNode.target._vkGetNodeContentType() === NodeContentType.Symbol && currNode.target.parent) {
				if (!nodeId || nodeId === currNode.target.userData.treeNode.sid) {
					nodeInfos.push(currNode.target);
				}
			}
			return nodeInfos;
		}, []) : [];
		return symbolNodes;
	};

	var backgroundNodeNameImageType = {
		"sphere": "360Image",
		"plane": "2DImage"
	};

	ViewStateManager.prototype._getBackgroundNodeInfos = function() {
		var currBackgroundNode = null, backgroundNodes = [];

		function traverse(nodeRef) {
			if (nodeRef.visible) {
				if (nodeRef._vkGetNodeContentType() === NodeContentType.Background && backgroundNodeNameImageType[nodeRef.name]) {
					currBackgroundNode = nodeRef;
					return;
				}

				var children = nodeRef.children;
				for (var i = 0, l = children.length; i < l && currBackgroundNode === null; i++) {
					traverse(children[i]);
				}
			}
		}

		traverse(this._scene.getSceneRef());

		if (currBackgroundNode) {
			backgroundNodes = currBackgroundNode.parent.children.filter(function(child) {
				return child._vkGetNodeContentType() === NodeContentType.Background;
			});
		}

		return { current: currBackgroundNode, all: backgroundNodes };
	};

	/**
	 * Get the background image type
	 *
	 * @returns {?string} Image type string, or null
	 * @private
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	ViewStateManager.prototype.getBackgroundImageType = function() {
		// currently can only use background node name to determine the image type
		var currBackgroundNode = this._getBackgroundNodeInfos().current;
		return currBackgroundNode ? backgroundNodeNameImageType[currBackgroundNode.name] : null;
	};

	/**
	 * Set the background image type
	 *
	 * @param {string} imageType Image type string
	 * @returns {object} Background node object
	 * @private
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	ViewStateManager.prototype.setBackgroundImageType = function(imageType) {
		var backgroundNodes = this._getBackgroundNodeInfos();
		var targetBackgroundNode = backgroundNodes.all.find(function(nodeRef) {
			return imageType === backgroundNodeNameImageType[nodeRef.name];
		});
		if (targetBackgroundNode && !this.getVisibilityState(targetBackgroundNode)) {
			if (backgroundNodes.current) {
				backgroundNodes.current.visible = false;
			}
			targetBackgroundNode.visible = true;
			this.setVisibilityState(backgroundNodes.all, false, false);
			this.setVisibilityState(targetBackgroundNode, true, false);
		}
		return targetBackgroundNode;
	};

	function arrayToMatrixThree(array) {
		return new THREE.Matrix4().set(array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8], array[9], array[10], array[11], 0, 0, 0, 1);
	}

	ViewStateManager.prototype._resetNodesStatusByCurrentView = function(view, setVisibility, animationNodeTransition) {

		var nodeHierarchy = this.getNodeHierarchy();
		if (nodeHierarchy) {

			var playbacks;
			if (view) {
				playbacks = view.getPlaybacks();
			}

			var nodeInfo = view.getNodeInfos();

			if (nodeInfo) {  // for totaraLoader
				this._nodesTransitionHelper.clear();
				var transforms = {
					nodeRefs: [],
					positions: []
				};
				var newPosition = new THREE.Vector3();
				var newRotation = new THREE.Quaternion();
				var newScale = new THREE.Vector3();

				nodeInfo.forEach(function(node) {
					if (node.target === null) {
						return;
					}

					if (node.transform) {
						var newMatrix = arrayToMatrixThree(node.transform);
						if (!AnimationMath.equalMatrices(newMatrix, node.target.matrix, 1e-6)) {
							// Transition node to its view position as it differs from original node position
							if ((!playbacks || !playbacks.length) && animationNodeTransition) {
								// If view does not have animations then we will perform an interpolation animation for node transform
								var nodeProxy = nodeHierarchy.createNodeProxy(node.target);
								this._nodesTransitionHelper.setNodeForDisplay(nodeProxy, newMatrix);
							} else {

								newMatrix.decompose(newPosition, newRotation, newScale);
								transforms.nodeRefs.push(node.target);
								transforms.positions.push({
									translation: newPosition.toArray(),
									quaternion: newRotation.toArray(),
									scale: newScale.toArray()
								});
							}
						}
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						transforms.nodeRefs.push(node.target);
						transforms.positions.push({
							translation: node[AnimationTrackType.Translate].slice(),
							quaternion: node[AnimationTrackType.Rotate].slice(),
							scale: node[AnimationTrackType.Scale].slice()
						});
					}
				}.bind(this));

				if (view.userData && view.userData.nodeStartDataByAnimation) {
					view.userData.nodeStartDataByAnimation.forEach(function(data, nodeRef) {
						if (data[AnimationTrackType.Translate] && data[AnimationTrackType.Rotate] && data[AnimationTrackType.Scale]) {
							transforms.nodeRefs.push(nodeRef);
							transforms.positions.push({
								translation: data[AnimationTrackType.Translate].slice(),
								quaternion: data[AnimationTrackType.Rotate].slice(),
								scale: data[AnimationTrackType.Scale].slice()
							});
						}
					}, this);
				}

				if (transforms.nodeRefs.length) {
					this.setTransformation(transforms.nodeRefs, transforms.positions);
				}

				if (setVisibility) {
					// Apply nodes visibility for the current view
					var nodeVisible = [];
					var nodeInvisible = [];
					nodeInfo.forEach(function(info) {
						if (!info.target.userData.skipIt) {
							(info.visible ? nodeVisible : nodeInvisible).push(info.target);
						}
					});

					// Hide all root nodes. The roots that have visible nodes will be made visible when these nodes visibility changes.
					this.setVisibilityState(nodeHierarchy.getChildren()[0].children, false, true);
					if (this.getSymbolNodes().length) {
						this.getSymbolNodes().forEach(function(symbolNode) {
							symbolNode.traverse(function(node) { node.visible = true; });
						});
					}
					this.setVisibilityState(nodeVisible, true, false);
					this.setVisibilityState(nodeInvisible, false, false);

					this._startViewChangeNodeTransition();

					// TODO

				}
			}
		}
	};

	ViewStateManager.prototype._startViewChangeNodeTransition = function() {

		this._nodesTransitionHelper.startDisplay(500);

		var displaying = true;

		this._nodesTransitionHelper.attachEventOnce("displayed", function() {
			displaying = false;
		});

		var display = function() {
			if (displaying) {
				this._nodesTransitionHelper.displayNodesMoving();
				window.requestAnimationFrame(display);
			}
		}.bind(this);

		window.requestAnimationFrame(display);
	};

	ViewStateManager.prototype._resetNodesMaterialAndOpacityByCurrentView = function(view) {

		if (!view) {
			return;
		}

		var nodeInfo = view.getNodeInfos();

		if (nodeInfo) {  // for totaraLoader
			nodeInfo.forEach(function(node) {
				if (!node.target) {
					return;
				}

				this._updateMaterialInNode(node);
			}.bind(this));

			nodeInfo.forEach(function(node) {
				if (!node.target || !node.target.userData) {
					return;
				}

				node.target.userData.opacity = node.opacity;
			});

			var nativeScene = this._scene.getSceneRef();
			nativeScene._vkSetOpacity(undefined, this._jointCollection);
		}

		this._selectedNodes.forEach(function(nodeRef) {
			this._updateHighlightColor(nodeRef);
		}.bind(this));
	};

	ViewStateManager.prototype._onActivateView = function(channel, eventId, event) {
		var viewManager = this.getViewManager();
		if (!viewManager || event.source.getId() !== viewManager) {
			return;
		}
		this.activateView(event.view, false, event.playViewGroup, event.skipCameraTransitionAnimation);
	};

	/**
	 * Activate specified view
	 *
	 * @param {sap.ui.vk.View} view view object definition
	 * @param {boolean} ignoreAnimationPosition when set to true, initial animation state is not applied to the view
	 * @param {boolean} playViewGroup true if view activation is part of playing view group
	 * @param {boolean} skipCameraTransitionAnimation do not animate the change of camera
	 * @returns {sap.ui.vk.ViewStateManager} return this
	 * @private
	 */
	ViewStateManager.prototype.activateView = function(view, ignoreAnimationPosition, playViewGroup, skipCameraTransitionAnimation) {
		this.fireViewStateApplying({
			view: view
		});

		// remove joints
		this.setJoints(undefined);

		this._resetNodesMaterialAndOpacityByCurrentView(view);
		this._prepareTransition(view);
		this._resetNodesStatusByCurrentView(view, true, false);
		this._highlightPlayer.reset(view, this._scene);

		this.fireViewStateApplied({
			view: view,
			ignoreAnimationPosition: ignoreAnimationPosition,
			skipCameraTransitionAnimation: skipCameraTransitionAnimation,
			playViewGroup: playViewGroup
		});

		vkCore.getEventBus().publish("sap.ui.vk", "viewStateApplied", {
			source: this,
			view: view,
			ignoreAnimationPosition: ignoreAnimationPosition,
			skipCameraTransitionAnimation: skipCameraTransitionAnimation,
			playViewGroup: playViewGroup
		});

		return this;
	};

	/**
	 * Set highlight display state.
	 *
	 * @param {sap.ui.vk.HighlightDisplayState} state for playing highlight - playing, pausing, and stopped
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setHighlightDisplayState = function(state) {

		if (state === HighlightDisplayState.playing) {
			this._highlightPlayer.start(Date.now());
		} else if (state === HighlightDisplayState.stopped) {
			this._highlightPlayer.stop();
		} else if (state === HighlightDisplayState.pausing) {
			this._highlightPlayer.pause(Date.now());
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(this._highlightColorABGR)),
			highlightColorABGR: this._highlightColorABGR
		});
		return this;
	};

	ViewStateManager.prototype._startHighlight = function() {

		this._highlightPlayer.start(Date.now());
		return this;
	};

	ViewStateManager.prototype._playHighlight = function() {

		return this._highlightPlayer.play(Date.now());
	};

	ViewStateManager.prototype._prepareTransition = function(view) {
		this._transitionPlayer.reset();
		this._transitionPlayer.fadeInNodes = [];
		this._transitionPlayer.fadeOutNodes = [];
		this._fadeInBackground = null;
		this._fadeOutBackground = null;

		var nodeInfos = view.getNodeInfos();
		if (!nodeInfos) {
			return;
		}

		// console.log("_prepareTransition", nodeInfos);

		var visibleNodes = new Set();
		var hiddenNodes = new Set();
		nodeInfos.forEach(function(info) {
			(info.visible ? visibleNodes : hiddenNodes).add(info.target);
		});

		var fadeInNodes = this._transitionPlayer.fadeInNodes;
		var fadeOutNodes = this._transitionPlayer.fadeOutNodes;
		var nodeHierarchy = this._nodeHierarchy;

		var collectTransitionMeshes = function(nodeRef, newVisible, oldVisible) {
			if (!nodeRef.userData.skipIt) {
				newVisible = newVisible && visibleNodes.has(nodeRef);
				oldVisible = oldVisible && nodeRef.visible;
			}

			if (nodeRef.geometry && newVisible !== oldVisible) {
				if (nodeRef.parent && nodeRef.parent.userData.symbolContent) {
					nodeRef.renderOrder = 2;  // background nodes should be rendered before POIs
				}
				(newVisible ? fadeInNodes : fadeOutNodes).push(nodeRef);
			}

			if (nodeRef._vkGetNodeContentType() === NodeContentType.Background) {
				if (newVisible) {
					this._fadeInBackground = nodeRef;
					// return; // skip fade-in animation for the new background
				} else if (oldVisible) {
					this._fadeOutBackground = nodeRef;
				}
			}

			nodeRef.children.forEach(function(child) {
				collectTransitionMeshes(child, newVisible, oldVisible);
			});
		}.bind(this);

		nodeHierarchy.getChildren()[0].children.forEach(function(child) {
			collectTransitionMeshes(child, true, true);
		});

		if (this._fadeInBackground) {
			this._fadeInBackground.traverse(function(child) {
				if (child.material) {
					child.renderOrder = -2; // transparent fade-in background should be rendered before POIs
				}
			});
		}

		if (this._fadeOutBackground) {
			this._fadeOutBackground.traverse(function(child) {
				if (child.material) {
					child.renderOrder = 1; // fix geometry interpenetration during fade-out sphere background, JIRA: EPDVISUALIZATION-1327
				}
			});
		}

		// console.log("+", Array.from(visibleNodes), fadeInNodes);
		// console.log("-", Array.from(hiddenNodes), fadeOutNodes);
		// console.log(this._fadeOutBackground, "->", this._fadeInBackground);
	};

	ViewStateManager.prototype._startTransition = function(timeInterval) {
		var fadeInNodes = this._transitionPlayer.fadeInNodes;
		var fadeOutNodes = this._transitionPlayer.fadeOutNodes;

		if (fadeInNodes && fadeInNodes.length) {
			var fadeInHighlight = new Highlight("FadeIn", {
				duration: timeInterval / 500.0,
				opacities: [0.0, 1.0],
				cycles: 1
			});
			this._transitionPlayer.addHighlights(fadeInHighlight, fadeInNodes);
		}

		if (fadeOutNodes && fadeOutNodes.length) {
			var fadeOutHighlight = new Highlight("FadeOut", {
				duration: timeInterval / 500.0,
				opacities: [1.0, 0.0],
				cycles: 1,
				fadeOut: true
			});
			this._transitionPlayer.addHighlights(fadeOutHighlight, fadeOutNodes);
		}

		if ((fadeInNodes && fadeInNodes.length) || (fadeOutNodes && fadeOutNodes.length)) {
			this._transitionPlayer.start(Date.now());
			this._transitionPlayer.play(Date.now());
			return timeInterval;
		}

		return 0;
	};

	ViewStateManager.prototype._playTransition = function() {
		return this._transitionPlayer.play(Date.now());
	};

	/**
	 * Copy nodes' current transformation into their rest transformation stored in active view.
	 *
	 * @param {any[]} nodeRefs Array of node references.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateNodesRestTransformation = function(nodeRefs) {
		for (var i = 0; i < nodeRefs.length; i++) {
			this.updateRestTransformation(nodeRefs[i], true);
			// only fire the sequence changed event at last to avoid unintentionally changing
			// the joint nodes whose rest transformations have not been updated in the event handler.
			if (this._playbackAssociatedWithJoints && i === nodeRefs.length - 1) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}
		return this;
	};

	/**
	 * Copy node's current transformation into its rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {boolean} DoNotFireSequenceChanged Do not fire sequence changed event if true
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateRestTransformation = function(nodeRef, DoNotFireSequenceChanged) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				nodeRef.updateMatrix();

				var te = nodeRef.matrix.elements;
				var transform = [te[0], te[4], te[8], te[12], te[1], te[5], te[9], te[13], te[2], te[6], te[10], te[14]];
				node.transform = transform;
			});
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.translation = null;
					joint.scale = null;
					joint.quaternion = null;

					if (joint.node.userData) {
						joint.node.userData.offsetTranslation = null;
						joint.node.userData.offsetQuaternion = null;
						joint.node.userData.offsetScale = null;
						joint.node.userData.originalRotationType = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestTransformation(joint.node);
				}
			}.bind(this));

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					// this.restoreRestTransformation(joint.node);
				}
			}, this);

			if (this._playbackAssociatedWithJoints && !DoNotFireSequenceChanged) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Replace node's current transformation with its rest transformation stored in active view..
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.restoreRestTransformation = function(nodeRef) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (node.transform) {
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(nodeRef.position, nodeRef.quaternion, nodeRef.scale);
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					nodeRef.position.set(node[AnimationTrackType.Translate][0],
						node[AnimationTrackType.Translate][1],
						node[AnimationTrackType.Translate][2]);

					nodeRef.quaternion.set(node[AnimationTrackType.Rotate][0],
						node[AnimationTrackType.Rotate][1],
						node[AnimationTrackType.Rotate][2],
						node[AnimationTrackType.Rotate][3]);

					nodeRef.scale.set(node[AnimationTrackType.Scale][0],
						node[AnimationTrackType.Scale][1],
						node[AnimationTrackType.Scale][2]);
				}

				nodeRef.updateMatrix();
			});
		}

		var eventParameters = {
			changed: [nodeRef],
			transformation: [{
				position: nodeRef.position.toArray(),
				quaternion: nodeRef.quaternion.toArray(),
				scale: nodeRef.scale.toArray()
			}]
		};

		this.fireTransformationChanged(eventParameters);
		return this;
	};


	/**
	 * Set node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float[]} translation vector for position, array of size 3, if null current rest translation is used
	 * @param {float[]} quaternion quaternion for rotation, array of size 4, if null current rest quaternion is used
	 * @param {float[]} scale vector for scaling, array of size 3, if null current rest scale is used
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setRestTransformation = function(nodeRef, translation, quaternion, scale) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (!translation || !quaternion || !scale) {
					if (node.transform) {
						var po = new THREE.Vector3();
						var ro = new THREE.Quaternion();
						var sc = new THREE.Vector3();
						var mat = arrayToMatrixThree(node.transform);
						mat.decompose(po, ro, sc);
						if (!translation) {
							translation = [po.x, po.y, po.z];
						}

						if (!scale) {
							scale = [sc.x, sc.y, sc.z];
						}

						if (!quaternion) {
							quaternion = [ro.x, ro.y, ro.z, ro.w];
						}
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						if (!translation) {
							translation = node[AnimationTrackType.Translate].slice();
						}

						if (!scale) {
							scale = node[AnimationTrackType.Scale].slice();
						}

						if (!quaternion) {
							quaternion = node[AnimationTrackType.Rotate].slice();
						}
					}
				}

				var positionThree = new THREE.Vector3(translation[0], translation[1], translation[2]);
				var quaternionThree = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
				var scaleThree = new THREE.Vector3(scale[0], scale[1], scale[2]);

				var newMatrix = new THREE.Matrix4();
				newMatrix.compose(positionThree, quaternionThree, scaleThree);

				var te = newMatrix.elements;
				node.transform = [te[0], te[4], te[8], te[12], te[1], te[5], te[9], te[13], te[2], te[6], te[10], te[14]];
			});
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.translation = null;
					joint.scale = null;
					joint.quaternion = null;

					if (joint.node.userData) {
						joint.node.userData.offsetTranslation = null;
						joint.node.userData.offsetQuaternion = null;
						joint.node.userData.offsetScale = null;
						joint.node.userData.originalRotationType = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestTransformation(joint.node);
				}
			}, this);

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					// this.restoreRestTransformation(joint.node);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Get node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {float} node opacity
	 * @private
	 */
	ViewStateManager.prototype.getRestOpacity = function(nodeRef) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		var result = 1;

		if (nodeInfo && nodeInfo.length) {

			for (var i = 0; i < nodeInfo.length; i++) {
				var node = nodeInfo[i];
				if (node.target !== nodeRef) {
					continue;
				}

				if (node.opacity !== undefined && node.opacity !== null) {
					result = node.opacity;
				}
				break;
			}
		}
		return result;
	};

	/**
	 * Set node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float} opacity The node opacity
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setRestOpacity = function(nodeRef, opacity) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}
				node.opacity = opacity;
			});
		}
		return this;
	};

	/**
	 * Replace node's current opacity with its rest opacity stored in active view..
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.restoreRestOpacity = function(nodeRef) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				var opacity = 1;
				if (node.opacity !== undefined) {
					opacity = node.opacity;
				}
				this.setOpacity(nodeRef, opacity);

			}.bind(this));
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.opacity = null;

					if (joint.node.userData) {
						joint.node.userData.offsetOpacity = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestOpacity(joint.node);
				}
			}, this);

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Copy node's current opacity into its rest opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.updateRestOpacity = function(nodeRef) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}
				if (nodeRef.userData && nodeRef.userData.opacity !== undefined && nodeRef.userData.opacity !== null) {
					node.opacity = nodeRef.userData.opacity;
				} else {
					delete node.opacity;
				}
			});
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.opacity = null;

					if (joint.node.userData) {
						joint.node.userData.offsetOpacity = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Get node's rest transformation in world coordinates stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code>, <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationWorld = function(nodeRef) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		var result;
		if (nodeInfo) {
			var wMat = new THREE.Matrix4();
			while (nodeRef) {
				for (var i = 0; i < nodeInfo.length; i++) {
					var node = nodeInfo[i];

					if (node.target !== nodeRef) {
						continue;
					}

					var newMatrix;
					if (node.transform) {
						newMatrix = arrayToMatrixThree(node.transform);
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						var position = new THREE.Vector3(node[AnimationTrackType.Translate][0],
							node[AnimationTrackType.Translate][1],
							node[AnimationTrackType.Translate][2]);

						var rotation = new THREE.Quaternion(node[AnimationTrackType.Rotate][0],
							node[AnimationTrackType.Rotate][1],
							node[AnimationTrackType.Rotate][2],
							node[AnimationTrackType.Rotate][3]);

						var scale = new THREE.Vector3(node[AnimationTrackType.Scale][0],
							node[AnimationTrackType.Scale][1],
							node[AnimationTrackType.Scale][2]);

						newMatrix = new THREE.Matrix4().compose(position, rotation, scale);
					}

					if (newMatrix) {
						wMat.premultiply(newMatrix);
					}

					break;
				}
				nodeRef = nodeRef.parent;
			}
			var po = new THREE.Vector3();
			var ro = new THREE.Quaternion();
			var sc = new THREE.Vector3();
			wMat.decompose(po, ro, sc);
			result = {};
			result.translation = po.toArray();
			result.quaternion = ro.toArray();
			result.scale = sc.toArray();
		}

		if (!result) {
			result = this.getTransformationWorld(nodeRef);
		}
		return result;
	};


	/**
	 * Get node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code>, <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformation = function(nodeRef) {
		var nodeInfo;
		var currentView = this.getCurrentView();
		if (currentView) {
			nodeInfo = currentView.getNodeInfos();
		}

		var result;
		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (node.transform) {
					var position = new THREE.Vector3();
					var rotation = new THREE.Quaternion();
					var scale = new THREE.Vector3();
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(position, rotation, scale);

					result = {};
					result.translation = position.toArray();
					result.quaternion = rotation.toArray();
					result.scale = scale.toArray();
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					result = {};
					result.translation = node[AnimationTrackType.Translate].slice();
					result.quaternion = node[AnimationTrackType.Rotate].slice();
					result.scale = node[AnimationTrackType.Scale].slice();
				}
			});
		}

		if (!result && nodeRef) {
			result = {};
			result.translation = nodeRef.userData.position ? nodeRef.userData.position.toArray() : nodeRef.position.toArray();
			result.quaternion = nodeRef.userData.quaternion ? nodeRef.userData.quaternion.toArray() : nodeRef.quaternion.toArray();
			result.scale = nodeRef.userData.scale ? nodeRef.userData.scale.toArray() : nodeRef.scale.toArray();
			result.matrix = nodeRef.matrix.clone();
		}
		return result;
	};

	ViewStateManager.prototype._addToTransformation = function(position, translation, quaternion, scale, originalRotationType, euler) {

		var result = {};

		var i;
		if (translation) {
			result.translation = [];
			for (i = 0; i < 3; i++) {
				result.translation.push(translation[i] + position.translation[i]);
			}
		} else {
			result.translation = position.translation;
		}

		if (scale) {
			result.scale = [];
			for (i = 0; i < 3; i++) {
				result.scale.push(scale[i] * position.scale[i]);
			}
		} else {
			result.scale = position.scale;
		}

		if (quaternion) {
			var quat = new THREE.Quaternion(position.quaternion[0], position.quaternion[1], position.quaternion[2], position.quaternion[3]);
			var quata = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
			if (originalRotationType === RotationType.Euler) { // Euler just does addition of X, Y, Z rotation components
				var order = euler ? euler[3] : 6;
				var eul = AnimationMath.threeQuatToNeutralEuler(quat, order);
				var nr = euler ? euler : AnimationMath.threeQuatToNeutralEuler(quata, order);
				eul[0] += nr[0];
				eul[1] += nr[1];
				eul[2] += nr[2];
				result.quaternion = AnimationMath.glMatrixQuatToNeutral(AnimationMath.neutralEulerToGlMatrixQuat(eul));
			} else { // Quaternion and angle-axis rotation are computed with quaternion maths
				var matrix = new THREE.Matrix4().makeRotationFromQuaternion(quat);
				var matrixa = new THREE.Matrix4().makeRotationFromQuaternion(quata);
				matrix.premultiply(matrixa);
				quat.setFromRotationMatrix(matrix);
				result.quaternion = [quat.x, quat.y, quat.z, quat.w];
			}
		} else {
			result.quaternion = position.quaternion;
		}

		return result;
	};

	/**
	 * Set translation/scale/rotation/opacity values came from animation interpolation to a node.
	 * These values are used by various tools and for effective opacity calculations.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {object} value - Structure containing the transformation components and opacity
	 * @param {float[]} value.rtranslate vector for additional position, array of size 3, optional
	 * @param {float[]} value.rrotate quaternion for additional rotation, array of size 4, optional
	 * @param {float[]} value.rscale vector for additional scaling, array of size 3, optional
	 * @param {float[]} value.Euler vector for Euler rotation, array of size 4, used if value.originalRotationType === Euler
	 * @param {sap.ui.vk.AnimationTrackValueType} value.originalRotationType AngleAxis, Euler, Quaternion
	 * @param {float} value.ropacity value for additional opacity, optional
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setInterpolatedRelativeValues = function(nodeRef, value) {

		if (!nodeRef.userData) {
			nodeRef.userData = {};
		}

		if (value.rtranslate) {
			nodeRef.userData.offsetTranslation = value.rtranslate;
		} else {
			nodeRef.userData.offsetTranslation = null;
		}

		if (value.rscale) {
			nodeRef.userData.offsetScale = value.rscale;
		} else {
			nodeRef.userData.offsetScale = null;
		}

		if (value.rrotate) {
			nodeRef.userData.offsetQuaternion = value.rrotate;
			nodeRef.userData.originalRotationType = value.originalRotationType;
		} else {
			nodeRef.userData.offsetQuaternion = null;
			nodeRef.userData.originalRotationType = null;
		}

		if (value.Euler) {
			nodeRef.userData.Euler = value.Euler;
		} else {
			nodeRef.userData.Euler = null;
		}

		if (value.ropacity != null) {
			nodeRef.userData.offsetOpacity = value.ropacity;
		} else {
			nodeRef.userData.offsetOpacity = null;
		}

		return this;
	};

	ViewStateManager.prototype._setJointNodeMatrix = function() {
		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				var node = joint.node;

				if (node.userData.skipUpdateJointNode) {
					return;
				}

				var position = {};
				position.translation = joint.translation.slice();
				position.scale = joint.scale.slice();
				position.quaternion = joint.quaternion.slice();
				var newTransformation = this._addToTransformation(position, node.userData.offsetTranslation,
					node.userData.offsetQuaternion,
					node.userData.offsetScale,
					node.userData.originalRotationType,
					node.userData.Euler);

				node.position.fromArray(newTransformation.translation);
				node.scale.fromArray(newTransformation.scale);
				node.quaternion.fromArray(newTransformation.quaternion);
				node.updateMatrix();

				var jointQuaternion = node.quaternion.clone();

				var jointParentMatrix = new THREE.Matrix4();
				if (joint.parent) {
					joint.parent.updateMatrixWorld();
					jointParentMatrix = joint.parent.matrixWorld.clone();
					node.matrixWorld.multiplyMatrices(joint.parent.matrixWorld, node.matrix);
				} else {
					node.matrixWorld.copy(node.matrix);
				}

				var nodeParentMatrix = new THREE.Matrix4();
				if (node.parent) {
					node.parent.updateWorldMatrix(true, false); // update ancestor world matrices
					nodeParentMatrix.copy(node.parent.matrixWorld);
					node.matrix.copy(node.parent.matrixWorld).invert().multiply(node.matrixWorld);
				} else {
					node.matrix.copy(node.matrixWorld);
				}

				node.matrix.decompose(node.position, node.quaternion, node.scale);
				// node.matrixWorldNeedsUpdate = false;

				var scale = [node.scale.x, node.scale.y, node.scale.z];
				this._adjustQuaternionAndScale(jointParentMatrix, nodeParentMatrix, jointQuaternion, node.quaternion, newTransformation.scale, scale);
				node.scale.x = scale[0];
				node.scale.y = scale[1];
				node.scale.z = scale[2];

				if (joint.nodesToUpdate) {// update dependent intermediate nodes
					joint.nodesToUpdate.forEach(function(subnode) {
						if (subnode.matrixAutoUpdate) { subnode.updateMatrix(); }
						subnode.matrixWorld.multiplyMatrices(subnode.parent.matrixWorld, subnode.matrix);
						// subnode.matrixWorldNeedsUpdate = false;
					});
				}
			}.bind(this));
		}
	};

	/**
	 * Get node property relative to rest position, defined by the last key in last playback.
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} property translate/rotate/scale/opacity
	 * @returns {float[] | float} translate/rotate/scale/opacity
	 * @private
	 */
	ViewStateManager.prototype._getEndPropertyInLastPlayback = function(nodeRef, property) {

		var propertyValue;

		var currentView = this.getCurrentView();
		if (!currentView) {
			return propertyValue;
		}

		var playbacks = currentView.getPlaybacks();
		if (!playbacks || !playbacks.length) {
			return propertyValue;
		}

		for (var k = playbacks.length - 1; k >= 0; k--) {
			var lastPlayback = playbacks[k];
			var lastSequence = lastPlayback.getSequence();
			if (lastSequence._convertedFromAbsolute) { // old sequence
				return propertyValue;
			}
			propertyValue = lastPlayback.getNodeBoundaryProperty(nodeRef, property, true);
			if (propertyValue) {
				break;
			}
		}

		return propertyValue;
	};

	/**
	 * Get node property relative to rest position, defined by the last key of previous playback.
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} property translate/rotate/scale/opacity
	 * @param {sap.ui.vk.AnimationPlayback} playback current playback
	 * @param {boolean} includeJointNode default false as end properties are already used for joint calculation
	 * @returns {float[] | float} translate/rotate/scale/opacity
	 * @private
	 */
	ViewStateManager.prototype._getEndPropertyInPreviousPlayback = function(nodeRef, property, playback, includeJointNode) {

		var propertyValue;
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && !includeJointNode) {
			return propertyValue;
		}

		var sequence = playback.getSequence();
		if (sequence && sequence._convertedFromAbsolute) {
			return propertyValue;
		}

		var currentView = this.getCurrentView();
		if (!currentView) {
			return propertyValue;
		}

		var playbacks = currentView.getPlaybacks();
		for (var i = 1; i < playbacks.length; i++) {
			var pb = playbacks[i];
			if (pb !== playback) {
				continue;
			}

			for (var j = i - 1; j >= 0; j--) {
				var previousPlayback = playbacks[j];
				propertyValue = previousPlayback.getNodeBoundaryProperty(nodeRef, property, true);
				if (propertyValue) {
					break;
				}
			}
		}

		return propertyValue;
	};


	/**
	 * Convert translate, rotate, and scale tracks in absolute values to the values relative to the rest position defined with active view.
	 *
	 * @param {sap.ui.vk.AnimationSequence} sequence animation sequence
	 * @param {boolean} reversedPlayback true if sequence is in reversed playback
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._convertTracksToRelative = function(sequence, reversedPlayback) {

		if ((reversedPlayback && sequence._conversionDoneForReversed) || (!reversedPlayback && sequence._conversionDone)) {
			return this;
		}

		sequence._convertedFromAbsolute = false;

		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodesAnimation = sequence.getNodeAnimation();
		if (!nodesAnimation || !nodesAnimation.length) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				var nodeAnimation;
				for (var i = 0; i < nodesAnimation.length; i++) {
					if (node.target === nodesAnimation[i].nodeRef) {
						nodeAnimation = nodesAnimation[i];
						break;
					}
				}

				if (!nodeAnimation) {
					return;
				}

				var startT = [0, 0, 0];
				var startS = [1, 1, 1];
				var startQ = new THREE.Quaternion();
				var position = new THREE.Vector3();
				var scale = new THREE.Vector3();

				if (node.transform) {
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(position, startQ, scale);
					startT = position.toArray();
					startS = scale.toArray();
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					startT = node[AnimationTrackType.Translate].slice();
					startQ = new THREE.Quaternion(node[AnimationTrackType.Rotate][0], node[AnimationTrackType.Rotate][1],
						node[AnimationTrackType.Rotate][2], node[AnimationTrackType.Rotate][3]);
					startS = node[AnimationTrackType.Scale].slice();
				} else {
					node.target.matrix.decompose(position, startQ, scale);
					startT = position.toArray();
					startS = scale.toArray();
				}

				var j, count, key, value;
				var translateTrack = nodeAnimation[AnimationTrackType.Translate];
				if (translateTrack && translateTrack.getIsAbsoluteValue()) {
					count = translateTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = translateTrack.getKey(j);
						value = [key.value[0] - startT[0], key.value[1] - startT[1], key.value[2] - startT[2]];
						translateTrack.updateKey(j, value, true);
					}
					translateTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var scaleTrack = nodeAnimation[AnimationTrackType.Scale];
				if (scaleTrack && scaleTrack.getIsAbsoluteValue()) {
					count = scaleTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = scaleTrack.getKey(j);
						value = [key.value[0] / startS[0], key.value[1] / startS[1], key.value[2] / startS[2]];
						scaleTrack.updateKey(j, value, true);
					}
					scaleTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var opacityTrack = nodeAnimation[AnimationTrackType.Opacity];
				if (opacityTrack && opacityTrack.getIsAbsoluteValue()) {
					var restOpacity = this.getRestOpacity(node.target);
					// assuming rest opacity as 1, rely on opacity track at time 0 for correct opacity in rest position
					if (!restOpacity) {
						restOpacity = 1.0;
					}

					count = opacityTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = opacityTrack.getKey(j);
						value = key.value / restOpacity;
						opacityTrack.updateKey(j, value, true);
					}
					opacityTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var rotateTrack = nodeAnimation[AnimationTrackType.Rotate];
				if (rotateTrack && rotateTrack.getIsAbsoluteValue()) {

					var quaternion;
					var startRMatrix = new THREE.Matrix4().makeRotationFromQuaternion(startQ);
					var invStartRMatrix = new THREE.Matrix4().copy(startRMatrix).invert();
					var aMatrix = new THREE.Matrix4();
					var rMatrix = new THREE.Matrix4();
					count = rotateTrack.getKeysCount();
					var valueType = rotateTrack.getKeysType();

					for (j = 0; j < count; j++) {
						key = rotateTrack.getKey(j);
						if (valueType === AnimationTrackValueType.Quaternion) {

							quaternion = new THREE.Quaternion(key.value[0], key.value[1], key.value[2], key.value[3]);
							aMatrix.makeRotationFromQuaternion(quaternion);
							rMatrix.multiplyMatrices(aMatrix, invStartRMatrix);
							quaternion.setFromRotationMatrix(rMatrix);
							value = quaternion.toArray();
							rotateTrack.updateKey(j, value, true);

						} else if (valueType === AnimationTrackValueType.Euler) {

							var k = key.value;
							var e0 = AnimationMath.threeQuatToNeutralEuler(startQ, k[3]);
							value = [k[0] - e0[0] + AnimationMath.getModulatedAngularValue(k[0]),
							k[1] - e0[1] + AnimationMath.getModulatedAngularValue(k[1]),
							k[2] - e0[2] + AnimationMath.getModulatedAngularValue(k[2]),
							k[3]];
							rotateTrack.updateKey(j, value, true);

						} else if (j === 0) { // only change first key of angular axis

							var axis = new THREE.Vector3(key.value[0], key.value[1], key.value[2]);
							aMatrix.makeRotationAxis(axis, key.value[3]);
							rMatrix.multiplyMatrices(aMatrix, invStartRMatrix);
							quaternion = new THREE.Quaternion().setFromRotationMatrix(rMatrix);
							value = this._convertQuaternionToAngleAxis(quaternion);
							rotateTrack.updateKey(j, value, true);
							break;
						}
					}
					rotateTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}
			}.bind(this));
		}

		if (!reversedPlayback) {
			sequence._conversionDone = true;
			sequence._conversionDoneForReversed = false;
		} else {
			sequence._conversionDone = false;
			sequence._conversionDoneForReversed = true;
		}

		return this;
	};

	ViewStateManager.prototype._getTrackKeys = function(track) {
		var keys = [];
		var count = track.getKeysCount();

		for (var j = 0; j < count; j++) {
			var key = track.getKey(j);
			var value;
			if (Array.isArray(key.value)) {
				value = key.value.slice();
			} else {
				value = key.value;
			}

			keys.push({
				time: key.time,
				value: value
			});

		}

		return keys;
	};

	/**
	 * Reset joint node offsets, which are scale/translation/quaternion relative to rest position in animation track.
	 * Called by scale/move/rotate tools to evaluate offset values under joint, as tools only make changes under scene tree
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType animation track type
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._setJointNodeOffsets = function(nodeRef, trackType) {
		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			var nodeParentMatrix = new THREE.Matrix4();
			if (nodeRef.parent) {
				nodeParentMatrix = nodeRef.parent.matrixWorld.clone();
			}

			var nodeMatrix = new THREE.Matrix4();
			nodeRef.updateMatrixWorld();
			var jointParentMatrix = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				jointParentMatrix = joint.parent.matrixWorld.clone();
				nodeMatrix.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMatrix.copy(nodeRef.matrixWorld);
			}

			var position = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			nodeMatrix.decompose(position, quaternion, scale);

			if (trackType === AnimationTrackType.Translate) {
				var currentTranslation = position.toArray();
				nodeRef.userData.offsetTranslation = [currentTranslation[0] - joint.translation[0],
				currentTranslation[1] - joint.translation[1],
				currentTranslation[2] - joint.translation[2]];
			} else if (trackType === AnimationTrackType.Scale) {

				var currentScale = scale.toArray();

				this._adjustQuaternionAndScale(nodeParentMatrix, jointParentMatrix, nodeRef.quaternion, quaternion, nodeRef.scale.toArray(), currentScale);

				nodeRef.userData.offsetScale = [currentScale[0] / joint.scale[0],
				currentScale[1] / joint.scale[1],
				currentScale[2] / joint.scale[2]];

			} else {
				this._adjustQuaternionAndScale(nodeParentMatrix, jointParentMatrix, nodeRef.quaternion, quaternion, nodeRef.scale.toArray(), scale.toArray());

				var startQ = new THREE.Quaternion(joint.quaternion[0], joint.quaternion[1], joint.quaternion[2], joint.quaternion[3]);
				var startRMatrix = new THREE.Matrix4().makeRotationFromQuaternion(startQ);
				var invStartRMatrix = new THREE.Matrix4().copy(startRMatrix).invert();
				var aMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
				var rMatrix = new THREE.Matrix4().multiplyMatrices(aMatrix, invStartRMatrix);
				var offsetQ = new THREE.Quaternion().setFromRotationMatrix(rMatrix);
				nodeRef.userData.offsetQuaternion = offsetQ.toArray();
			}
		}

		return this;
	};

	/**
	 * Add key to a translation track according to the current node position
	 *
	 * @param {any} nodeRef The node reference of the translation track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the translation track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 * 			{float[]} <code>keyValue</code> translation relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> translation of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> node translation
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setTranslationKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var restTranslation;

		var position = new THREE.Vector3();
		nodeRef.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			restTranslation = joint.translation.slice();
			nodeRef.updateMatrixWorld();
			var nodeMat = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				nodeMat.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMat.matrix.copy(nodeRef.matrixWorld);
			}
			nodeMat.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restTranslation = restTrans.translation;
		}

		var currentTranslation = position.toArray();
		var value = [currentTranslation[0] - restTranslation[0],
		currentTranslation[1] - restTranslation[1],
		currentTranslation[2] - restTranslation[2]];


		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Translate, playback);
		if (offset) {
			value[0] -= offset[0];
			value[1] -= offset[1];
			value[2] -= offset[2];
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Translate);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Vector3,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Translate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, absoluteValue: currentTranslation, offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	// For maintaining the signs of scale components when converting between scale under joint parent and under scene parent
	// To overcome the problem caused by threejs decompose function, which always puts negative sign in x scale.
	ViewStateManager.prototype._adjustQuaternionAndScale = function(parentMatrix1, parentMatrix2, quaternion1, quaternion2, scale1, scale2) {
		function getClosestAligned(v, v1, v2, v3) {
			var d1 = Math.abs(v.dot(v1));
			var d2 = Math.abs(v.dot(v2));
			var d3 = Math.abs(v.dot(v3));

			if (d1 >= d2 && d1 >= d3) {
				return 0;
			} else if (d2 >= d1 && d2 >= d3) {
				return 1;
			} else {
				return 2;
			}
		}

		if (scale1[0] > 0 && scale1[1] > 0 && scale1[2] > 0) {
			return;
		}
		var mat1 = parentMatrix1.clone().multiply(new THREE.Matrix4().makeRotationFromQuaternion(quaternion1));
		var rotMat2 = new THREE.Matrix4().makeRotationFromQuaternion(quaternion2);
		var mat2 = parentMatrix2.clone().multiply(rotMat2);

		var vx1 = new THREE.Vector3();
		var vy1 = new THREE.Vector3();
		var vz1 = new THREE.Vector3();
		mat1.extractBasis(vx1, vy1, vz1);
		var basis1 = [vx1, vy1, vz1];

		var vx2 = new THREE.Vector3();
		var vy2 = new THREE.Vector3();
		var vz2 = new THREE.Vector3();
		mat2.extractBasis(vx2, vy2, vz2);

		var scale = [1, 1, 1];
		for (var i = 0; i < 3; i++) {
			var index = getClosestAligned(basis1[i], vx2, vy2, vz2);
			if (scale1[i] * scale2[index] < 0) {
				scale[index] = -1;
				scale2[index] = -scale2[index];
			}
		}

		rotMat2.scale(new THREE.Vector3(scale[0], scale[1], scale[2]));

		var quat2 = new THREE.Quaternion().setFromRotationMatrix(rotMat2);
		quaternion2.x = quat2.x;
		quaternion2.y = quat2.y;
		quaternion2.z = quat2.z;
		quaternion2.w = quat2.w;
	};

	/**
	 * Add key to a scale track according to the current node scale
	 *
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the scale track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 * 			{float[]} <code>keyValue</code> scale relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> scale of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> scale
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setScaleKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var restScale;

		var currentScale = nodeRef.scale.toArray();
		var nodeQuaternion = nodeRef.quaternion.clone();
		// nodeRef.matrix.decompose(new THREE.Vector3(), quaternion, scale);

		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			var nodeParentMatrix = new THREE.Matrix4();
			if (nodeRef.parent) {
				nodeParentMatrix = nodeRef.parent.matrixWorld.clone();
			}

			restScale = joint.scale.slice();

			nodeRef.updateMatrixWorld();
			var nodeMat = new THREE.Matrix4();

			var jointParentMatrix = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				jointParentMatrix = joint.parent.matrixWorld.clone();
				nodeMat.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMat.copy(nodeRef.matrixWorld);
			}

			var quaternion = new THREE.Quaternion();
			var scale = new THREE.Vector3();
			nodeMat.decompose(new THREE.Vector3(), quaternion, scale);

			var qScaleArray = scale.toArray();
			this._adjustQuaternionAndScale(nodeParentMatrix,
				jointParentMatrix,
				nodeQuaternion,
				quaternion,
				currentScale,
				qScaleArray);
			currentScale = qScaleArray;

		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restScale = restTrans.scale;
		}

		var value = [currentScale[0] / restScale[0],
		currentScale[1] / restScale[1],
		currentScale[2] / restScale[2]];

		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Scale, playback);
		if (offset) {
			value[0] /= offset[0];
			value[1] /= offset[1];
			value[2] /= offset[2];
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Scale);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Vector3,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Scale, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, absoluteValue: currentScale, offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Add key to a rotation track
	 *
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {float[]} euler The euler rotation relative to the end position of previous sequence or rest position for the first sequence
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the rotation track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 * 			{float[]} <code>keyValue</code> euler rotation relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> quaternion of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> quaternion rotation
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 *
	 * @private
	 */
	ViewStateManager.prototype.setRotationKey = function(nodeRef, time, euler, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}
		var order = 36; // "XYZ"
		var value = [euler[0], euler[1], euler[2], order];


		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Rotate);

		if (track && track.getKeysType() !== AnimationTrackValueType.Euler) {
			return null;
		}

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Euler,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Rotate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		var quat = new THREE.Quaternion();
		var eulerRotation = new THREE.Euler(euler[0], euler[1], euler[2]);
		quat.setFromEuler(eulerRotation);

		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Rotate, playback);
		if (offset) {
			var offsetQuat = new THREE.Quaternion(offset[0], offset[1], offset[2], offset[3]);
			quat.multiply(offsetQuat);
		}

		var joint = this._getJointByChildNode(nodeRef);
		var restQuat = new THREE.Quaternion();
		if (joint) {
			restQuat.fromArray(joint.quaternion);
		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restQuat.fromArray(restTrans.quaternion);
		}

		quat.multiply(restQuat);

		return { KeyValue: value, absoluteValue: quat.toArray(), offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Add an axis-angle key to the animation track.
	 *
	 * @param {any} nodeRef A node reference to add the key for.
	 * @param {float} time A time of the key.
	 * @param {float[]} axisAngle An axis-angle rotation value.
	 * @param {sap.ui.vk.AnimationPlayback} playback A playback containing a sequence owning the track.
	 * @param {*} blockTrackChangedEvent A flag to indicate whether to block firing events.
	 * @returns {object|null} An object with the following properties:
	 *   <ul>
	 *     <li><code>KeyValue: float[]</code> - an axis-angle value of the key</li>
	 *     <li><code>PreviousTrack - object[]</code> - the track's old keys.</li>
	 *     <li><code>CurrentTrack: object[]</code> - the track's new keys.</li>
	 *   </ul>
	 * @private
	 */
	ViewStateManager.prototype.setAxisAngleRotationKey = function(nodeRef, time, axisAngle, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Rotate);
		if (track && track.getKeysType() !== AnimationTrackValueType.AngleAxis) {
			if (!track.setKeysType(AnimationTrackValueType.AngleAxis)) {
				// Log.error()
				return null;
			}
		}

		var value = [axisAngle[0], axisAngle[1], axisAngle[2], axisAngle[3]];

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.AngleAxis,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Rotate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Get total opacity - product of all the ancestors' opacities and its own opacity
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @returns {float} total opacity
	 * @private
	 */
	ViewStateManager.prototype.getTotalOpacity = function(nodeRef) {
		return nodeRef._vkGetTotalOpacity(this._jointCollection);
	};

	/**
	 * Set total opacity using current opacity - product of all the ancestors' opacities and its own opacity
	 * The node's opacity is re-calculated based on the total opacity
	 * if the parent's total opacity is zero, the node's total opacity is zero, the node's opacity is not changed
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} totalOpacity product of all the ancestors' opacities and its own opacity
	 * @returns {any} object contains <code>opacity</code> and <code>totalOpacity</code>
	 * @private
	 */
	ViewStateManager.prototype.setTotalOpacity = function(nodeRef, totalOpacity) {

		var parentTotal = 1;
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && joint.parent) {
			parentTotal = joint.parent._vkGetTotalOpacity(this._jointCollection);
		} else if (nodeRef.parent) {
			parentTotal = nodeRef.parent._vkGetTotalOpacity(this._jointCollection);
		}

		if (!nodeRef.userData) {
			nodeRef.userData = {};
		}

		var opacity = this.getOpacity(nodeRef);

		if (parentTotal !== 0.0) {
			opacity = totalOpacity / parentTotal;
		} else {
			totalOpacity = 0.0;
		}

		nodeRef._vkSetOpacity(opacity, this._jointCollection);

		var eventParameters = {
			changed: nodeRef,
			opacity: opacity
		};

		this.fireOpacityChanged(eventParameters);

		return { opacity: opacity, totalOpacity: totalOpacity };
	};

	/**
	 * Add key to a opacity track according to the opacity of current node
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the opacity track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 * 			{float} <code>keyValue</code> scale relative to rest position
	 *   		{float} <code>totalOpacity</code> scale
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setOpacityKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var value = 1;
		if (nodeRef.userData && nodeRef.userData.opacity !== undefined && nodeRef.userData.opacity !== null) {
			value = nodeRef.userData.opacity;
		}

		var restOpacity = this.getRestOpacity(nodeRef);
		// for converted absolute track, 0 rest opacity is assumed to be 1 when being converted to relative track
		if (!restOpacity && sequence._convertedFromAbsolute) {
			restOpacity = 1;
		}
		value /= restOpacity;

		var offsetOpacity = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Opacity, playback);
		if (offsetOpacity) {
			value /= offsetOpacity;
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Opacity);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Opacity
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Opacity, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, totalOpacity: this.getTotalOpacity(nodeRef), PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: VisibilityTracker

	// Visibility Tracker is an object which keeps track of visibility changes.
	// These changes will be used in Viewport getViewInfo/setViewInfo
	VisibilityTracker = function() {
		// all visibility changes are saved in a Set. When a node changes visibility,
		// we add that id to the Set. When the visibility is changed back, we remove
		// the node reference from the set.
		this._visibilityChanges = new Set();
	};

	// It returns an object with all the relevant information about the node visibility
	// changes. In this case, we need to retrieve a list of all nodes that suffered changes
	// and an overall state against which the node visibility changes is applied.
	// For example: The overall visibility state is ALL VISIBLE and these 2 nodes changed state.
	VisibilityTracker.prototype.getInfo = function(nodeHierarchy) {
		// converting the collection of changed node references to ve ids
		var changedNodes = [];
		this._visibilityChanges.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
			var veId = nodeProxy.getVeId();
			// destroy the node proxy
			nodeHierarchy.destroyNodeProxy(nodeProxy);
			if (veId) {
				changedNodes.push(veId);
			} else {
				changedNodes.push(nodeHierarchy.getScene().nodeRefToPersistentId(nodeRef));
			}
		});

		return changedNodes;
	};

	// It clears all the node references from the _visibilityChanges set.
	// This action can be performed for example, when a step is activated or
	// when the nodes are either all visible or all not visible.
	VisibilityTracker.prototype.clear = function() {
		this._visibilityChanges.clear();
	};

	// If a node suffers a visibility change, we check if that node is already tracked.
	// If it is, we remove it from the list of changed nodes. If it isn't, we add it.
	VisibilityTracker.prototype.trackNodeRef = function(nodeRef) {
		if (this._visibilityChanges.has(nodeRef)) {
			this._visibilityChanges.delete(nodeRef);
		} else {
			this._visibilityChanges.add(nodeRef);
		}
	};

	// END: VisibilityTracker
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: `selectable` property
	//
	// In this implementation we prefer to optimize the `setSelectable` method and make the
	// `getSelectable` method non-optimized as the `selectable` property is going to be used rarely
	// and for specific use cases to mark some nodes as unselectable in the viewport.
	//
	// We assign values to the `selectable` property only for nodes that are passed to method
	// `setSelectable` and do not propagate it *explicitly* to the descendants because the
	// descendants will be filtered out implicitly the same way as the `hidden` nodes based on the
	// `visible` property during the HitTester.hitTest scene traversal.

	function getSelectable(nodeRef) {
		// This implementation is not optimal but very simple. We expect that the `getSelectable`
		// method will not be called often. And the `HitTester.hitTest` method will check the
		// `userData.selectable` property directly.
		//
		// If the `selectable` property is assigned on the the node itself we return it otherwise we
		// find the closest ancestor with the `selectable` property assigned a non-null value.
		while (!nodeRef.isScene) {
			var value = nodeRef.userData.selectable;
			if (value != null) {
				return value;
			}
			nodeRef = nodeRef.parent;
		}

		// By default the node is *selectable*.
		return true;
	}

	ViewStateManager.prototype.getSelectable = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(getSelectable);
		} else {
			return getSelectable(nodeRefs);
		}
	};

	ViewStateManager.prototype.setSelectable = function(nodeRefs, selectable) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		nodeRefs.forEach(function(nodeRef) {
			nodeRef.userData.selectable = selectable;
		});

		return this;
	};

	// END: `selectable` property
	////////////////////////////////////////////////////////////////////////////

	return ViewStateManager;
});
