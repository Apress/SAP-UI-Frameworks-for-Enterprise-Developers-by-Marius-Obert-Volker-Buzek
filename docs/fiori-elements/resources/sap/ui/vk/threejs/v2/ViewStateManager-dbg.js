/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides the ViewStateManager class.
sap.ui.define([
	"../ViewStateManager",
	"../../thirdparty/three",
	"../../cssColorToColor",
	"../../colorToCSSColor",
	"../../abgrToColor",
	"../../colorToABGR",
	"../ThreeUtils"
], function(
	ViewStateManagerV1,
	THREE,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	ThreeUtils
) {
	"use strict";

	var boundingBoxColor = new THREE.Color(0xC0C000);

	var MaterialCache;

	/**
	 * Constructor for a new ViewStateManager.
	 *
	 * @class
	 * Manages the visibility, selection, opacity and tint color states of nodes in the scene.
	 *
	 * This implementation supports multiple viewports but does not support animation.
	 *
	 * @param {string} [sId] ID for the new ViewStateManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ViewStateManager object.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.threejs.ViewStateManager
	 * @alias sap.ui.vk.threejs.v2.ViewStateManager
	 * @since 1.99.0
	 */
	var ViewStateManager = ViewStateManagerV1.extend("sap.ui.vk.threejs.v2.ViewStateManager", /** @lends sap.ui.vk.threejs.v2.ViewStateManager.prototype */ {
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

		// A map where `key` is `nodeRef` and `value` is a structure:
		//
		// type NodeState {
		//   visible?: bool
		//   selected: bool
		//   ancestorSelected: bool
		//   opacity?: number                       // floating number in range [0, 1]
		//   ancestorOverridesOpacity: bool
		//   tintColor?: int                        // tint color in ABGR format
		//   ancestorTintColor?: int                // tint color of ancestor in ABGR format
		//   boundingBoxNode?: THREE.Box3Helper     // assigned if selected; ancestorSelected does not affect this property
		//   material?: THREE.MeshPhongMaterial     // if selected or ancestorSelected or opacity != null or
		//                                          // tintColor != null or ancestorTintColor != null
		//   needsMaterialUpdate: bool
		// }
		//
		// If a NodeState property is `null`, `undefined` or missing then the property original
		// value is taken from the node itself.
		//
		// The `selected` cannot have value `null` as it is a non-persistent runtime property.
		this._nodeStates = new Map();

		// A collection of selected nodes for quick access, usually there are not many selected objects, so it is OK to
		// store them in a collection.
		this._selectedNodes = new Set();

		// TODO(VSM): outlining is not implemented yet.
		// this._outlineRenderer = new OutlineRenderer(1.0);
		this._outlinedNodes = new Set();
		this.setOutlineColor("rgba(255, 0, 255, 1.0)");
		this.setOutlineWidth(1.0);

		this._materialCache = new MaterialCache();

		this._showSelectionBoundingBox = true;

		// This scene owns and renders boxHelper objects for selected objects. Though the scene owns
		// boxHelpers, the `parent` properties of the boxHelpers are set to the corresponding nodes
		// rather than to this scene as those nodes are used to calculate the world matrices of theOpa
		// boxHelpers.
		this._boundingBoxesScene = new THREE.Scene();
	};

	ViewStateManager.prototype.exit = function() {
		this._clearNodeStates();
		this._selectedNodes.clear();

		// TODO(VSM): outlining is not implemented yet.
		this._outlinedNodes.clear();

		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
			this._boundingBoxesScene = null;
		}

		this._nodeHierarchy = null;

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	ViewStateManager.prototype._clearBoundingBoxScene = function() {
		var all3DNodes = [];
		var allGroupNodes = [];

		ThreeUtils.getAllTHREENodes([this._boundingBoxesScene], all3DNodes, allGroupNodes);
		all3DNodes.forEach(function(n3d) {
			ThreeUtils.disposeObject(n3d);
			// TODO: does not seem to be necessary as bounding boxes are owned by
			// `_boundingBoxesScene` and they are not in `n3d.parent.children` arrays.
			n3d.parent.remove(n3d);
		});

		allGroupNodes.forEach(function(g3d) {
			// TODO: see the comment above.
			g3d.parent.remove(g3d);
		});
	};

	ViewStateManager.prototype._clearNodeStates = function() {
		var nodeStates = this._nodeStates;

		nodeStates.forEach(function(state, nodeRef) {
			if (state.material != null) {
				ThreeUtils.disposeMaterial(state.material);
			}

			if (state.boundingBoxNode) {
				ThreeUtils.disposeObject(state.boundingBoxNode);
			}
		}, this);

		nodeStates.clear();
	};

	////////////////////////////////////////////////////////////////////////
	// Node hierarchy handling begins.

	ViewStateManager.prototype._setScene = function(scene) {
		this._clearNodeStates();

		// TODO(VSM): Move this to _clearNodeStates.
		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
		}
		// TODO(VSM): Move this to _setNodeHierarchy?
		this._boundingBoxesScene = new THREE.Scene();
		this._setNodeHierarchy(scene ? scene.getDefaultNodeHierarchy() : null);

		// TODO(VSM): WTF?! Remove this!
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

	// TODO(VSM): Move the body to _setScene?
	ViewStateManager.prototype._setNodeHierarchy = function(nodeHierarchy) {
		var oldNodeHierarchy = this._nodeHierarchy;

		if (this._nodeHierarchy) {
			this._nodeHierarchy.detachNodeReplaced(this._handleNodeReplaced, this);
			this._nodeHierarchy.detachNodeUpdated(this._handleNodeUpdated, this);
			this._nodeHierarchy.detachNodeRemoving(this._handleNodeRemoving, this);
			this._nodeHierarchy = null;
			this._clearNodeStates();
			this._selectedNodes.clear();
			this._outlinedNodes.clear();
			this._visibilityTracker.clear();
		}

		if (nodeHierarchy) {
			this._nodeHierarchy = nodeHierarchy;

			this._nodeHierarchy.attachNodeReplaced(this._handleNodeReplaced, this);
			this._nodeHierarchy.attachNodeUpdated(this._handleNodeUpdated, this);
			this._nodeHierarchy.attachNodeRemoving(this._handleNodeRemoving, this);

			var visible = [];
			var hidden = [];
			nodeHierarchy.getSceneRef().traverse(function(nodeRef) {
				(nodeRef.visible ? visible : hidden).push(nodeRef);
			});

			this.fireVisibilityChanged({
				visible: visible,
				hidden: hidden
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

		// Node is removed from node hierarchy, remove it from list of selected nodes
		if (this.getSelectionState(nodeRef)) {
			// Since this node is already removed from the scene don't send notification
			this.setSelectionState(nodeRef, false, true, true);
		}
	};

	ViewStateManager.prototype._renderOutline = function(renderer, scene, camera) {
		// TODO(VSM): not implemented.
	};

	// Node hierarchy handling ends.
	////////////////////////////////////////////////////////////////////////

	/**
	 * Reset node property to the value defined by current view.
	 *
	 * @param {object} nodeRef reference to node.
	 * @param {string} property node property
	 * @public
	 */
	ViewStateManager.prototype.resetNodeProperty = function(nodeRef, property) {
		// TODO(VSM): not implemented.
	};

	ViewStateManager.prototype.resetVisibility = function() {
		var toShow = [];
		var toHide = [];
		this._nodeStates.forEach(function(state, nodeRef) {
			var visible = state.visible;
			if (visible === true) {
				toHide.push(nodeRef);
			} else if (visible === false) {
				toShow.push(nodeRef);
			}
			state.visible = null;
		});
		this._deleteUnusedNodeStates();

		this._visibilityTracker.clear();
		this.fireVisibilityChanged({
			visible: toShow,
			hidden: toHide
		});
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
			var result = [];
			this._nodeStates.forEach(function(state, nodeRef) {
				result.push(effectiveVisibility(nodeRef, state));
			});
			return result;
		} else {
			var state = this._getNodeState(nodeRefs, false);
			return effectiveVisibility(nodeRefs, state);
		}
	};

	/**
	 * Sets the visibility state of the nodes.
	 * @param {any|any[]}         nodeRefs  The node reference or the array of node references.
	 * @param {boolean|boolean[]} visible   The new visibility state or array of states of the nodes.
	 * @param {boolean}           recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean}           force     If a node is made visible but its parent is hidden then it will still be
	 *                                      hidden in Viewport. This flag will force node to be visible regardless of
	 *                                      parent's state.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setVisibilityState = function(nodeRefs, visible, recursive, force) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we have got an array of booleans as visibility change
		var isBulkChange = Array.isArray(visible);

		var recursiveVisibilities = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveVisibilities.length;
				recursiveVisibilities.length += collected.length;
				recursiveVisibilities.fill(isBulkChange ? visible[index] : visible, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, visible is a scalar
			recursiveVisibilities.length = allNodeRefs.length;
			recursiveVisibilities.fill(visible);
		} else {
			// not recursive, visible is an array
			recursiveVisibilities = visible;
		}

		if (force) {
			// We use `force` when we un-hide the parents of the un-hidden node recursively up the tree. Extend the
			// array of changed nodes with these ancestors. If they are already visible or there are duplicates they
			// will be filtered out below.
			var additionalNodeRefs = [];
			allNodeRefs.forEach(function(nodeRef, index) {
				var newVisibility = recursiveVisibilities[index];
				if (newVisibility) {
					for (var node = nodeRef; node && !node.isScene; node = node.parent) {
						additionalNodeRefs.push(node);
					}
				}
			});
			allNodeRefs = allNodeRefs.concat(additionalNodeRefs);
			var length = recursiveVisibilities.length;
			recursiveVisibilities.length += additionalNodeRefs.length;
			recursiveVisibilities.fill(true, length);
		}

		// filter out unchanged visibility and duplicate nodes
		var changedVisibility = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var state = this._getNodeState(nodeRef, false);
			var oldVisibility = effectiveVisibility(nodeRef, state);
			var newVisibility = recursiveVisibilities[index];

			var changed = oldVisibility !== newVisibility;
			if (changed) {
				changedVisibility.push(newVisibility);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyVisibilityNodeState(changedNodeRefs, changedVisibility);
			this._deleteUnusedNodeStates();

			var eventParameters = {
				visible: [],
				hidden: []
			};

			changedNodeRefs.forEach(function(nodeRef, index) {
				eventParameters[changedVisibility[index] ? "visible" : "hidden"].push(nodeRef);
			});

			if (this.getShouldTrackVisibilityChanges()) {
				changedNodeRefs.forEach(this._visibilityTracker.trackNodeRef, this._visibilityTracker);
			}

			this.fireVisibilityChanged(eventParameters);
		}
		return this;
	};

	/**
	 * Enumerates IDs of the selected nodes.
	 *
	 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
		var selected = this._selectedNodes.has.bind(this._selectedNodes);

		return Array.isArray(nodeRefs) ? nodeRefs.map(selected) : selected(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
	};

	ViewStateManager.prototype._addBoundingBox = function(nodeRef) {
		var state = this._getNodeState(nodeRef, true);

		if (state.boundingBoxNode == null) {
			var boundingBox = new THREE.Box3();
			ThreeUtils.computeObjectOrientedBoundingBox(nodeRef, boundingBox);

			// TODO(VSM): do we need to check for `!box.isEmpty()` before creating `helper`? What if the bounding box changes
			// later - either to isEmpty() or from isEmpty()? Isn't it better to always have a Box3Helper?
			var boundingBoxNode = new THREE.Box3Helper(boundingBox, boundingBoxColor);
			this._boundingBoxesScene.add(boundingBoxNode);
			// the owner of `boundingBoxNode` is `_boundingBoxesScene`; this parent is used for world matrix calculations only.
			boundingBoxNode.parent = nodeRef;

			state.boundingBoxNode = boundingBoxNode;
		} else {
			// Bounding box was already added.
		}

		return this;
	};

	ViewStateManager.prototype._removeBoundingBox = function(nodeRef) {
		var state = this._getNodeState(nodeRef, false);

		if (state != null && state.boundingBoxNode != null) {
			this._boundingBoxesScene.remove(state.boundingBoxNode);
			ThreeUtils.disposeObject(state.boundingBoxNode);
			state.boundingBoxNode = null;
		} else {
			// Bounding box does not exist or was already removed.
		}

		return this;
	};

	ViewStateManager.prototype._updateBoundingBoxes = function() {
		var nodeStates = this._nodeStates;

		this._selectedNodes.forEach(function(nodeRef) {
			var state = nodeStates.get(nodeRef);

			if (state != null && state.boundingBoxNode != null) {
				ThreeUtils.computeObjectOrientedBoundingBox(nodeRef, state.boundingBoxNode.box);
			} else {
				// Bounding box for node does not exist. Probably `showSelectionBoundingBox === false`.
			}
		});

		return this;
	};


	/**
	 * Sets if showing the bounding box when nodes are selected
	 *
	 * @param {boolean} val <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setShowSelectionBoundingBox = function(val) {
		this._showSelectionBoundingBox = val;
		this._selectedNodes.forEach(val ? this._addBoundingBox : this._removeBoundingBox, this);

		// TODO(VSM): WTF? The selection does not change! Is this to force Viewport to rerender?
		this.fireSelectionChanged({
			selected: this._selectedNodes, // TODO(VSM): WTF? selected is array, this._selected is Set.
			unselected: []
		});

		return this;
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

	/**
	 * Sets the selection state of the nodes.
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} selected The new selection state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} Returns <code>this</code> to allow method chaining
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

		// First, extend `nodeRefs` with descendant nodes based on parameter `recursive` or property `recursiveSelection`.
		nodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(nodeRefs) : nodeRefs)
			.filter(function(value, index, array) {
				return array.indexOf(value) === index;
			});

		// Then, extend `nodeRefs` with ancestors of nodes being unselected if the
		// `recursiveSelection` property (but not necessarily the `recursive` parameter) is `true`.
		if (this.getRecursiveSelection() && !selected) {
			// E.g. if we deselect node D1 while the `recursiveSelection` property is `true` we
			// deselect its ancestors C and B recursively. Nodes E and F are unselected previously,
			// see the code above.
			//
			// The siblings stay as is.
			//
			// [ ] A                  [ ] A
			//    [x] B                  [ ] B
			//       [X] C         ->       [ ] C
			//          [X] *D1*               [ ] *D1*
			//             [X] E                 [ ] E
			//               [X] F                 [ ] F
			//          [X] D2                 [X] D2
			//          [X] D3                 [X] D3
			nodeRefs = this._nodeHierarchy._appendAncestors(nodeRefs);
		}

		var selectedNodes = this._selectedNodes;

		// These are the nodes whose selection state changed.
		var changed = nodeRefs.filter(function(nodeRef) {
			return selectedNodes.has(nodeRef) !== selected;
		}, this);

		if (changed.length > 0) {
			this._applySelectionNodeState(changed, selected);

			if (!selected) {
				this._deleteUnusedNodeStates();
			}

			this._updateNodeStateMaterials();

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
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
			this._applySelectionNodeState(selected, true);
			this._applySelectionNodeState(unselected, false);

			if (unselected.length > 0) {
				this._deleteUnusedNodeStates();
			}

			this._updateNodeStateMaterials();

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
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
		// this._outlineRenderer.setOutlineWidth(width);
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
		var state = this._getNodeState(nodeRef, false);
		return state != null ? state._opacity : null;
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * If a single node is passed to the method then a single value is returned.<br/>
	 * If an array of nodes is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {float|float[]|null|null[]} A single value or an array of values. Value <code>null</code> means that the node's own opacity should be used.
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
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setOpacity = function(nodeRefs, opacity, recursive) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we got an array as opacity
		var isBulkChange = Array.isArray(opacity);

		var recursiveOpacities = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveOpacities.length;
				recursiveOpacities.length += collected.length;
				recursiveOpacities.fill(isBulkChange ? opacity[index] : opacity, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, opacity is a scalar
			recursiveOpacities.length = allNodeRefs.length;
			recursiveOpacities.fill(opacity);
		} else {
			// not recursive, opacity is an array
			recursiveOpacities = opacity;
		}

		// filter out unchanged opacity and duplicate nodes
		var changedOpacities = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var state = this._getNodeState(nodeRef, false);
			var opacity = recursiveOpacities[index];
			var changed = state == null && opacity != null || state != null && state.opacity !== opacity;
			if (changed) {
				changedOpacities.push(opacity);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyOpacityNodeState(changedNodeRefs, changedOpacities);
			this._deleteUnusedNodeStates();
			this._updateNodeStateMaterials();

			var eventParameters = {
				changed: changedNodeRefs,
				opacity: isBulkChange ? changedOpacities : changedOpacities[0]
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
		var state = this._getNodeState(nodeRef, false);
		return state && state.tintColor;
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
		var tintColorABGR = this._getTintColorABGR(nodeRef);
		return tintColorABGR != null ? colorToCSSColor(abgrToColor(tintColorABGR)) : null;
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
		var getTintColorMethod = inABGRFormat ? this._getTintColorABGR : this._getTintColor;
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(getTintColorMethod, this);
		} else {
			return getTintColorMethod.call(this, nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
		}
	};

	function toABGR(color) {
		switch (typeof color) {
			case "number":
				return color;
			case "string":
				return sap.ui.core.CSSColor.isValid(color) ? colorToABGR(cssColorToColor(color)) : null;
			default:
				return null; // The color is invalid, reset it to null.
		}
	}

	/**
	 * Sets the tint color of the nodes.
	 * @param {any|any[]}                   nodeRefs          The node reference or the array of node references.
	 * @param {sap.ui.core.CSSColor|int|sap.ui.core.CSSColor[]|int[]|null} tintColor The new tint color of the nodes. The
	 *                                                        value can be defined as a string in the CSS color format
	 *                                                        or as an integer in the ABGR format or it could be an
	 *                                                        array of these values. If <code>null</code> is passed then
	 *                                                        the tint color is reset and the node's own tint color
	 *                                                        should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate
	 *                                                        recursively to child nodes.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setTintColor = function(nodeRefs, tintColor, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we got an array as tint color
		var isBulkChange = Array.isArray(tintColor);

		var recursiveColors = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveColors.length;
				recursiveColors.length += collected.length;
				recursiveColors.fill(isBulkChange ? tintColor[index] : tintColor, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, tintColor is a scalar
			recursiveColors.length = allNodeRefs.length;
			recursiveColors.fill(tintColor);
		} else {
			// not recursive, tintColor is an array
			recursiveColors = tintColor;
		}

		// filter out unchanged tintColor and duplicate nodes
		var changedColors = [];
		var changedColorsABGR = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var state = this._getNodeState(nodeRef, false);
			var tintColor = recursiveColors[index];
			var tintColorABGR = toABGR(recursiveColors[index]);
			var changed = state == null && tintColor != null || state != null && state.tintColor !== tintColorABGR;
			if (changed) {
				changedColors.push(tintColor);
				changedColorsABGR.push(tintColorABGR);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyTintColorNodeState(changedNodeRefs, changedColorsABGR);
			this._deleteUnusedNodeStates();
			this._updateNodeStateMaterials();

			var eventParameters = {
				changed: changedNodeRefs,
				tintColor: isBulkChange ? changedColors : changedColors[0],
				tintColorABGR: isBulkChange ? changedColorsABGR : changedColorsABGR[0]
			};

			this.fireTintColorChanged(eventParameters);
		}

		return this;
	};

	/**
	 * Sets the default highlighting color
	 * @param {sap.ui.core.CSSColor|string|int} color The new highlighting color. The value can be defined as a string in
	 *                                                the CSS color format or as an integer in the ABGR format. If
	 *                                                <code>null</code> is passed then the tint color is reset and the
	 *                                                node's own tint color should be used.
	 * @returns {this} Returns <code>this</code> to allow method chaining
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
			// NB: above we check if there are any nodes selected and below we traverse `_nodeStates` because unselected
			// descendants of selected nodes are not in `_selectedNodes` and we need to update both classes of nodes.
			this._nodeStates.forEach(function(state) {
				if (state.selected || state.ancestorSelected) {
					state.needsMaterialUpdate = true;
				}
			});
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(this._highlightColorABGR)),
			highlightColorABGR: this._highlightColorABGR
		});

		return this;
	};

	ViewStateManager.prototype._getNodeState = function(nodeRef, createIfNotExists) {
		var nodeStates = this._nodeStates;
		var state = nodeStates.get(nodeRef);
		if (state == null && createIfNotExists) {
			state = {
				visible: null,
				originalVisible: null,
				selected: false,
				ancestorSelected: false,
				tintColor: null,
				ancestorTintColor: null,
				opacity: null,
				ancestorOverridesOpacity: false,
				boundingBoxNode: null,
				material: null,
				originalMaterial: null,
				needsMaterialUpdate: false
			};
			nodeStates.set(nodeRef, state);
		}
		return state;
	};

	ViewStateManager.prototype._deleteUnusedNodeStates = function() {
		var materialCache = this._materialCache;
		this._nodeStates.forEach(function(state, nodeRef, nodeStates) {
			if (state.visible == null
				&& !state.selected
				&& !state.ancestorSelected
				&& state.tintColor == null
				&& state.ancestorTintColor == null
				&& state.opacity == null
				&& !state.ancestorOverridesOpacity
			) {
				nodeStates.delete(nodeRef);
				if (state.material != null) {
					materialCache.releaseMaterial(state.material);
				}
			}
		});

		return this;
	};

	ViewStateManager.prototype._applyVisibilityNodeState = function(nodeRefs, visibilities) {
		nodeRefs.forEach(function(nodeRef, index) {
			var newVisibility = visibilities[index];
			var ownVisibility = nodeRef.visible;
			var newVisibilityIsDifferentFromOwn = newVisibility !== ownVisibility;
			var state = this._getNodeState(nodeRef, newVisibilityIsDifferentFromOwn);
			if (state) {
				if (newVisibilityIsDifferentFromOwn) {
					state.visible = newVisibility;
				} else {
					// When we assign `null` the state is marked for deletion as it might be identical to the unmodified
					// original state.
					state.visible = null;
				}
			}
		}, this);
	};

	ViewStateManager.prototype._applySelectionNodeState = function(nodeRefs, selected) {
		if (selected) {
			nodeRefs.forEach(function(nodeRef) {
				this._selectedNodes.add(nodeRef);
				if (this._showSelectionBoundingBox) {
					this._addBoundingBox(nodeRef);
				}
				var state = this._getNodeState(nodeRef, true);
				var nodeWasHighlighted = nodeIsHighlighted(state);
				state.selected = true;
				if (nodeIsHighlighted(state) !== nodeWasHighlighted) {
					state.needsMaterialUpdate = true;
				}
				// If state.ancestorSelected === true then descendants have already been processed.
				if (!state.ancestorSelected) {
					nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, true), this);
				}
			}, this);
		} else {
			nodeRefs.forEach(function(nodeRef) {
				this._selectedNodes.delete(nodeRef);
				if (this._showSelectionBoundingBox) {
					this._removeBoundingBox(nodeRef);
				}
				var state = this._getNodeState(nodeRef, false);
				if (state != null) {
					var nodeWasHighlighted = nodeIsHighlighted(state);
					state.selected = false;
					if (nodeIsHighlighted(state) !== nodeWasHighlighted) {
						state.needsMaterialUpdate = true;
					}
					// If state.ancestorSelected === true then the descendants also are highlighted and we should not
					// unset the state, they inherit it from the node's ancestor.
					if (!state.ancestorSelected) {
						nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, false), this);
					}
				}
			}, this);
		}

		return this;
	};

	ViewStateManager.prototype._setAncestorSelectedRecursively = function(ancestorSelected, nodeRef) {
		var state = this._getNodeState(nodeRef, ancestorSelected);
		if (state != null && state.ancestorSelected !== ancestorSelected) {
			var nodeWasHighlighted = nodeIsHighlighted(state);
			state.ancestorSelected = ancestorSelected;
			if (nodeIsHighlighted(state) !== nodeWasHighlighted) {
				state.needsMaterialUpdate = true;
			}
			// If state.selected === true then its descendants have already been processed.
			if (!state.selected) {
				nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, ancestorSelected), this);
			}
		}

		return this;
	};

	ViewStateManager.prototype._applyTintColorNodeState = function(nodeRefs, colors) {
		nodeRefs.forEach(function(nodeRef, index) {
			var tintColor = colors[index];
			var state = this._getNodeState(nodeRef, tintColor != null);
			if (state != null) {
				state.tintColor = tintColor;
				state.needsMaterialUpdate = true;
				nodeRef.children.forEach(this._setAncestorTintColorRecursively.bind(this,
					tintColor != null ? tintColor : state.ancestorTintColor), this);
			}
		}, this);

		return this;
	};

	ViewStateManager.prototype._setAncestorTintColorRecursively = function(ancestorTintColor, nodeRef) {
		var state = this._getNodeState(nodeRef, ancestorTintColor != null);
		if (state != null && state.ancestorTintColor !== ancestorTintColor) {
			var previousEffectiveTintColor = effectiveTintColor(state);
			state.ancestorTintColor = ancestorTintColor;
			if (effectiveTintColor(state) !== previousEffectiveTintColor) {
				state.needsMaterialUpdate = true;
			}
			// If this node has its own tint color then this tint color is already propagated to its descendants and we
			// don't need to do anything. But if we remove tint color from this node then we need to propagate its
			// ancestor's tint color (or its absence) to this node's descendants.
			if (state.tintColor == null) {
				nodeRef.children.forEach(this._setAncestorTintColorRecursively.bind(this, ancestorTintColor), this);
			}
		}

		return this;
	};

	ViewStateManager.prototype._applyOpacityNodeState = function(nodeRefs, opacities) {
		nodeRefs.forEach(function(nodeRef, index) {
			var opacity = opacities[index];
			var state = this._getNodeState(nodeRef, opacity != null);
			if (state != null) {
				state.opacity = opacity;
				// We do not compare whether the effective (world) opacity has changed, as this is a relatively
				// expensive computation, and if the opacity is assigned, we expect it to be assigned a new value, so
				// the effective opacity has surely changed.
				state.needsMaterialUpdate = true;

				nodeRef.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this, opacity != null), this);
			}
		}, this);

		return this;
	};

	ViewStateManager.prototype._setAncestorOverridesOpacityRecursively = function(ancestorOverridesOpacity, nodeRef) {
		var state = this._getNodeState(nodeRef, ancestorOverridesOpacity);
		if (state != null) {
			state.ancestorOverridesOpacity = ancestorOverridesOpacity;
			state.needsMaterialUpdate = true;

			nodeRef.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this, state.opacity != null || ancestorOverridesOpacity), this);
		}

		return this;
	};

	ViewStateManager.prototype._computeWorldOpacity = function(nodeRef, state) {
		if (state == null) {
			state = this._getNodeState(nodeRef, false);
		}
		var localOpacity = state && state.opacity;
		if (localOpacity == null) {
			var userData = nodeRef.userData;
			localOpacity = userData && userData.opacity;
			if (localOpacity == null) {
				// Default opacity value is 1.
				localOpacity = 1;
			}
		}
		var parent = nodeRef.parent;
		if (parent == null) {
			return localOpacity;
		} else {
			return localOpacity * this._computeWorldOpacity(parent);
		}
	};

	ViewStateManager.prototype._updateNodeStateMaterials = function() {
		var materialCache = this._materialCache;

		var highlightColorABGR = this.getHighlightColor(true);
		var highlightColor = abgrToColor(highlightColorABGR);
		var highlightColorThreeJS = new THREE.Color(highlightColor.red / 255.0, highlightColor.green / 255.0, highlightColor.blue / 255.0);

		this._nodeStates.forEach(function(state, nodeRef) {
			if (state.needsMaterialUpdate && nodeRef.material != null) {
				if (state.material == null) {
					state.material = materialCache.cloneMaterial(nodeRef.material);
				} else {
					// TODO(VSM): do we really need this? I added this in case if material.color was
					// modified in a previous iteration. When can it happen?
					state.material.color.copy(nodeRef.material.color);
				}

				var material = state.material;
				var color;

				var tintColor = effectiveTintColor(state);
				if (tintColor != null) {
					color = abgrToColor(tintColor);
					material.color.lerp(new THREE.Color(color.red / 255.0, color.green / 255.0, color.blue / 255.0), color.alpha);
					if (material.emissive != null) {
						if (material.userData.defaultHighlightingEmissive) {
							material.emissive.copy(material.userData.defaultHighlightingEmissive);
						} else {
							material.emissive.copy(THREE.Object3D.prototype.defaultEmissive);
						}
					}
					if (material.specular != null) {
						if (material.userData.defaultHighlightingSpecular) {
							material.specular.copy(material.userData.defaultHighlightingSpecular);
						} else {
							material.specular.copy(THREE.Object3D.prototype.defaultSpecular);
						}
					}
				}

				if (state.selected || state.ancestorSelected) {
					material.color.lerp(highlightColorThreeJS, highlightColor.alpha);
					// when highlightColor = 0: total transparent, so do not change original emissive and specular
					if (material.emissive != null && highlightColorABGR !== 0) {
						if (material.userData.defaultHighlightingEmissive) {
							material.emissive.copy(material.userData.defaultHighlightingEmissive);
						} else {
							material.emissive.copy(THREE.Object3D.prototype.defaultEmissive);
						}
					}
					if (material.specular != null && highlightColorABGR !== 0) {
						if (material.userData.defaultHighlightingSpecular) {
							material.specular.copy(material.userData.defaultHighlightingSpecular);
						} else {
							material.specular.copy(THREE.Object3D.prototype.defaultSpecular);
						}
					}
				}

				var worldOpacity = this._computeWorldOpacity(nodeRef, state);
				material.opacity = worldOpacity;
				material.transparent = worldOpacity < 1;
			}

			state.needsMaterialUpdate = false;
		}, this);

		return this;
	};

	ViewStateManager.prototype.applyNodeStates = function() {
		this._nodeStates.forEach(function(state, nodeRef) {
			if (state.material != null) {
				state.originalMaterial = nodeRef.material;
				nodeRef.material = state.material;
			}
			if (state.visible != null) {
				state.originalVisible = nodeRef.visible;
				nodeRef.visible = state.visible;
			}
		});
	};

	ViewStateManager.prototype.revertNodeStates = function() {
		this._nodeStates.forEach(function(state, nodeRef) {
			if (state.originalMaterial) {
				nodeRef.material = state.originalMaterial;
				state.originalMaterial = null;
			}
			if (state.originalVisible != null) {
				nodeRef.visible = state.originalVisible;
				state.originalVisible = null;
			}
		});
	};

	function nodeIsHighlighted(state) {
		return state != null && (state.selected || state.ancestorSelected);
	}

	function effectiveVisibility(nodeRef, state) {
		var visible = state && state.visible;
		return visible != null ? visible : nodeRef.visible;
	}

	function effectiveTintColor(state) {
		return state.tintColor || state.ancestorTintColor;
	}

	MaterialCache = function() {
	};

	MaterialCache.prototype.cloneMaterial = function(material, nodeState) {
		// TODO: a proper implementation required.
		return material.clone();
	};

	MaterialCache.prototype.releaseMaterial = function(material) {
		// TODO: a proper implementation required.
		ThreeUtils.disposeMaterial(material);
		return this;
	};

	return ViewStateManager;
});
