/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides the ViewStateManager class.
sap.ui.define([
	"sap/base/Log",
	"../Core",
	"../ViewStateManagerBase",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"../AnimationTrackType",
	"../NodeContentType",
	"./Scene",
	"./Element",
	"sap/ui/core/Core"
], function(
	Log,
	vkCore,
	ViewStateManagerBase,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	AnimationTrackType,
	NodeContentType,
	Scene,
	Element,
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
	 * @alias sap.ui.vk.svg.ViewStateManager
	 * @since 1.80.0
	 */
	var ViewStateManager = ViewStateManagerBase.extend("sap.ui.vk.svg.ViewStateManager", /** @lends sap.ui.vk.svg.ViewStateManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ViewStateManager.getMetadata().getParent().getClass().prototype;

	ViewStateManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._mask = (1 | 0); // visibility mask

		this._nodeHierarchy = null;
		this._selectedNodes = new Set(); // a collection of selected nodes for quick access,

		this._visibilityTracker = new VisibilityTracker();

		this.setHighlightColor(0xBF0000BB); // selection highlight color

		vkCore.getEventBus().subscribe("sap.ui.vk", "activateView", this._onActivateView, this);
	};

	ViewStateManager.prototype.exit = function() {
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "activateView", this._onActivateView, this);
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
				this._resetNodesStatusByCurrentView(this._currentView);
			}
		}

		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Node hierarchy handling begins.

	ViewStateManager.prototype._setScene = function(scene) {
		this._setNodeHierarchy(scene ? scene.getDefaultNodeHierarchy() : null);
		if (scene) {
			scene.setViewStateManager(this);
		}
		this._scene = scene;
		return this;
	};

	ViewStateManager.prototype._setNodeHierarchy = function(nodeHierarchy) {
		var oldNodeHierarchy = this._nodeHierarchy;

		if (this._nodeHierarchy) {
			this._nodeHierarchy = null;
			this._selectedNodes.clear();
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
				(nodeRef.isVisible(that._mask) ? that._initialState.visible : that._initialState.hidden).push(nodeRef);
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
		var mask = this._mask;
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(function(nodeRef) {
				return nodeRef ? nodeRef.isVisible(mask) : false;
			});
		}

		return nodeRefs ? nodeRefs.isVisible(mask) : false; // NB: The nodeRefs argument is a single nodeRef.
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

		// check if we got an array of booleans as visibility change
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
		var mask = this._mask;
		var changed = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			var changed = nodeRef ? nodeRef.isVisible(mask) != recursiveVisibility[index] : false;
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
				if (changedVisibility[idx]) {
					nodeRef.setVisible(mask, true);
					eventParameters.visible.push(nodeRef);
					if (force) {
						// Force visibility by traversing ancestor nodes and make them visible
						var node = nodeRef.parent;
						while (node) {
							node.visible = true;
							node = node.parent;
						}
					}
				} else {
					nodeRef.setVisible(mask, false);
					eventParameters.hidden.push(nodeRef);
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

		return Array.isArray(nodeRefs) ? nodeRefs.map(isSelected) : isSelected(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
	};

	ViewStateManager.prototype._getSelectionComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			selected = [];

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

		return { selected: selected };
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

		nodeRef.setSelected(this._mask, selected, this._highlightColorABGR);
		if (nodeRef.nodeContentType !== NodeContentType.Hotspot) {// recursively update highlight color for regular nodes
			var children = nodeRef.children;
			for (var i = 0, l = children.length; i < l; i++) {
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
	 * @deprecated Since version 1.80.0.
	 * @public
	 */
	ViewStateManager.prototype.setSelectionState = function(nodeRefs, selected, recursive, blockNotification) {
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
			return nodeRef && (this._selectedNodes.has(nodeRef) === false);
		}, this);

		var unselected = unselectedNodeRefs.filter(function(nodeRef) {
			return nodeRef && (this._selectedNodes.has(nodeRef) === true);
		}, this);

		if (selected.length > 0 || unselected.length > 0) {
			selected.forEach(function(nodeRef) {
				this._selectedNodes.add(nodeRef);
				this._updateHighlightColor(nodeRef, true);
			}, this);

			unselected.forEach(function(nodeRef) {
				this._selectedNodes.delete(nodeRef);
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

	ViewStateManager.prototype._collectNodesRecursively = function(nodeRefs) {
		var result = [],
			that = this;

		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		nodeRefs.forEach(function collectChildNodes(nodeRef) {
			result.push(nodeRef);
			that._nodeHierarchy.enumerateChildren(nodeRef, collectChildNodes, false, true);
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
		return nodeRef.opacity !== undefined ? nodeRef.opacity : null;
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
	 * Since our implementation of SVG opacity is non-multiplicative, we simply set the node's opacity
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} totalOpacity value to set
	 * @returns {any} object contains <code>opacity</code> and <code>totalOpacity</code>
	 * @private
	 */
	ViewStateManager.prototype.setTotalOpacity = function(nodeRef, totalOpacity) {
		this.setOpacity(nodeRef, totalOpacity);
		return { opacity: totalOpacity, totalOpacity: totalOpacity };
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

		if (opacity === null) {
			opacity = undefined;
		} else if (isBulkChange) {
			opacity.forEach(function(value, idx) {
				if (value === null) {
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

			var changed = nodeRef ? nodeRef.opacity !== recursiveOpacity[index] : false;
			if (changed) {
				changedOpacity.push(recursiveOpacity[index]);
			}

			return changed;
		}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef, idx) {
				nodeRef.setOpacity(changedOpacity[idx]);
			}, this);

			this.fireOpacityChanged({
				changed: changed,
				opacity: isBulkChange ? changedOpacity : changedOpacity[0]
			});
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
		return nodeRef.tintColor !== undefined ? nodeRef.tintColor : null;
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
		return nodeRef.tintColor !== undefined ? colorToCSSColor(abgrToColor(nodeRef.tintColor)) : null;
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

	function toABGR(color) {
		switch (typeof color) {
			case "number":
				return color >>> 0; // use >>> to convert to 32 bit unsigned.
			case "string":
				return sap.ui.core.CSSColor.isValid(color) ? colorToABGR(cssColorToColor(color)) : undefined;
			default:
				return undefined; // The color is invalid, reset it to null.
		}
	}

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
			var changed = nodeRef ? nodeRef.tintColor !== toABGR(recursiveColor[index]) : false;
			if (changed) {
				changedColor.push(recursiveColor[index]);
			}

			return changed;
		}, this);

		if (changed.length > 0) {
			var mask = this._mask;
			var changedABGR = [];
			changed.forEach(function(nodeRef, idx) {
				var color = toABGR(changedColor[idx]);
				nodeRef.setTintColor(mask, color);
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
		color = toABGR(color);
		if (color === undefined) {
			return this;
		}

		this._highlightColorABGR = color;

		if (this._selectedNodes.size > 0) {
			this._selectedNodes.forEach(function(nodeRef) {
				this._updateHighlightColor(nodeRef, true);
			}, this);
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(color)),
			highlightColorABGR: color
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
	 * Gets the decomposed node transformation matrix under world coordinates.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformationWorld = function(nodeRef) {
		function getData(node) {
			return Element._decompose(node._matrixWorld());
		}

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
		function getData(node) {
			var t = Element._decompose(node.matrix);
			return {
				translation: t.position,
				quaternion: t.quaternion,
				scale: t.scale
			};
		}

		if (!Array.isArray(nodeRef)) {
			return getData(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	function arrayToMatrix(array) {
		return new Float32Array([array[0], array[4], array[1], array[5], array[3], array[7]]);
	}

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
			return Element._decompose(node.matrix);
		};

		if (!transformations) {
			nodeRefs.forEach(function(nodeRef) {
				if (nodeRef.userData.matrix) {
					nodeRef.setMatrix(nodeRef.userData.matrix);
					delete nodeRef.userData.matrix;
				}

				eventParameters.changed.push(nodeRef);
				eventParameters.transformation.push(getTransformParametersForEvent(nodeRef));
			}, this);

		} else {
			if (!Array.isArray(transformations)) {
				transformations = [transformations];
			}

			nodeRefs.forEach(function(nodeRef, idx) {
				if (!nodeRef.userData.matrix) {
					nodeRef.userData.matrix = nodeRef.matrix.slice();
				}

				var transformation = transformations[idx];
				if (transformation.transform) {
					nodeRef.setMatrix(arrayToMatrix(transformation.transform));
				} else {
					var quaternion;
					if (transformation.quaternion) {
						quaternion = transformation.quaternion;
					} else if (transformation.angleAxis) {
						var angleAxis = transformation.angleAxis;
						var halfAngle = angleAxis[3] / 2, s = Math.sin(halfAngle);
						quaternion = [angleAxis[0] * s, angleAxis[1] * s, angleAxis[2] * s, Math.cos(halfAngle)];
					} else if (transformation.euler) {
						Log.warning("svg.ViewStateManager.setTransformation: Euler angles are not yet supported");
						quaternion = [0, 0, 0, 1];
					}
					var matrix = Element._compose(transformation.translation, quaternion, transformation.scale);
					nodeRef.setMatrix(matrix);
				}

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

	ViewStateManager.prototype._resetNodesStatusByCurrentView = function(view) {
		var nodeHierarchy = this.getNodeHierarchy();
		var nodeInfos = view.getNodeInfos();
		if (!nodeHierarchy || !nodeInfos) {
			return;
		}

		var nodeRefs = [];
		var transforms = [];

		nodeInfos.forEach(function(nodeInfo) {
			if (nodeInfo.target) {
				if (nodeInfo.transform) {
					nodeRefs.push(nodeInfo.target);
					transforms.push({
						transform: nodeInfo.transform
					});
				} else if (nodeInfo[AnimationTrackType.Translate] && nodeInfo[AnimationTrackType.Rotate] && nodeInfo[AnimationTrackType.Scale]) {
					nodeRefs.push(nodeInfo.target);
					transforms.push({
						translation: nodeInfo[AnimationTrackType.Translate].slice(),
						quaternion: nodeInfo[AnimationTrackType.Rotate].slice(),
						scale: nodeInfo[AnimationTrackType.Scale].slice()
					});
				}
			}
		});

		if (view.userData && view.userData.nodeStartDataByAnimation) {
			view.userData.nodeStartDataByAnimation.forEach(function(data, nodeRef) {
				if (data[AnimationTrackType.Translate] && data[AnimationTrackType.Rotate] && data[AnimationTrackType.Scale]) {
					nodeRefs.push(nodeRef);
					transforms.push({
						translation: data[AnimationTrackType.Translate].slice(),
						quaternion: data[AnimationTrackType.Rotate].slice(),
						scale: data[AnimationTrackType.Scale].slice()
					});
				}
			});
		}

		if (nodeRefs.length) {
			this.setTransformation(nodeRefs, transforms);
		}

		var nodeVisible = [];
		var nodeInvisible = [];
		nodeInfos.forEach(function(info) {
			if (!info.target.userData.skipIt) {
				(info.visible ? nodeVisible : nodeInvisible).push(info.target);
			}
		});

		// hide all root nodes; the roots that have visible nodes will be made visible when these nodes visibility changes
		this.setVisibilityState(nodeHierarchy.getChildren()[0].children, false, true);
		this.setVisibilityState(nodeVisible, true, false);
		this.setVisibilityState(nodeInvisible, false, false);
	};

	ViewStateManager.prototype._onActivateView = function(channel, eventId, event) {
		var viewManager = this.getViewManager();
		if (viewManager && event.source.getId() === viewManager) {
			this.activateView(event.view);
		}
	};

	/**
	 * Activate specified view
	 *
	 * @param {sap.ui.vk.View} view view object definition
	 * @returns {sap.ui.vk.ViewStateManager} return this
	 * @private
	 */
	ViewStateManager.prototype.activateView = function(view) {
		this.fireViewStateApplying({ view: view });

		this._resetNodesStatusByCurrentView(view);

		this.fireViewStateApplied({ view: view });

		vkCore.getEventBus().publish("sap.ui.vk", "viewStateApplied", { source: this, view: view });

		return this;
	};

	/**
	 * Sets list of current joints
	 * @param {any[]} joints Array of joint objects or <code>undefined</code>.
	 * @param {sap.ui.vk.AnimationPlayback} playback animation playback containing the sequence the joints belong to, optional
	 * @see {@link sap.ui.vk.AnimationSequence.setJoint} for joint definition
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */
	ViewStateManager.prototype.setJoints = function(joints, playback) {
		return this;
	};

	/**
	 * Updates joints children opacity according to interpolated values set on joint parents.
	 * @param {any[]} nodeRefs - array of node references
	 * @param {float[]} opacities - array of opacity values
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._propagateOpacityToJointChildren = function(nodeRefs, opacities) {
		return this;
	};

	ViewStateManager.prototype._setJointNodeMatrix = function() {
		return this;
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

	return ViewStateManager;
});
