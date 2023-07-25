/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the ViewStateManager class.
sap.ui.define([
	"sap/ui/core/Element",
	"../ViewStateManagerBase",
	"./GraphicsCoreApi",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"./Scene",
	"sap/base/util/array/uniqueSort"
], function(
	Element,
	ViewStateManagerBase,
	GraphicsCoreApi,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	Scene,
	uniqueSort
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
	 * @alias sap.ui.vk.dvl.ViewStateManager
	 * @deprecated Since version 1.72.0.
	 */
	var ViewStateManager = ViewStateManagerBase.extend("sap.ui.vk.dvl.ViewStateManager", /** @lends sap.ui.vk.dvl.ViewStateManager.prototype */ {
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
		this._dvl = null;

		// The keys in this map are node references.
		// The values in this map are structures with the following format:
		// {
		//   flags: number,         // 32-bit integer
		//   opacity: number?,      // optional float
		//   tintColorABGR: number? // optional 32-bit integer
		// }
		this._nodeStates = new Map();

		// A collection of selected nodes for quick access,
		// usually there are not many selected objects,
		// so it is OK to store them in a collection.
		this._selectedNodes = new Set();

		this._visibilityTracker = new VisibilityTracker();

		this._closedNodeProcessed = false;
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	// Overridden sap.ui.vk.ViewStateManagerBase#_setContent.
	ViewStateManager.prototype._setContent = function(content) {
		var scene = null;
		if (content && content instanceof Scene) {
			scene = content;
		}
		this._setScene(scene);
		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Node hierarchy handling begins.

	ViewStateManager.prototype._setScene = function(scene) {
		if (scene) {
			this._setNodeHierarchy(scene.getDefaultNodeHierarchy());
		} else {
			this._setNodeHierarchy(null);
		}
		return this;
	};

	ViewStateManager.prototype._setNodeHierarchy = function(nodeHierarchy) {
		var oldNodeHierarchy = this._nodeHierarchy;

		if (this._nodeHierarchy) {
			this._nodeHierarchy.detachNodeCreated(this._handleNodeCreated, this);
			this._nodeHierarchy.detachNodeRemoving(this._handleNodeRemoving, this);
			this._dvl.Client.detachStepEvent(this._handleStepEvent, this);
			this._nodeHierarchy = null;
			this._dvl = null;
			this._nodeStates.clear();
			this._selectedNodes.clear();
			this._visibilityTracker.clear();
		}

		if (nodeHierarchy) {
			var scene = nodeHierarchy.getScene(),
				dvlSceneId = scene.getSceneRef();

			this._nodeHierarchy = nodeHierarchy;
			this._dvl = scene.getGraphicsCore().getApi(GraphicsCoreApi.LegacyDvl);
			this._dvl.Client.attachStepEvent(this._handleStepEvent, this);
			this._nodeHierarchy.attachNodeCreated(this._handleNodeCreated, this);
			this._nodeHierarchy.attachNodeRemoving(this._handleNodeRemoving, this);
			this._populateNodeStates(this._dvl.Scene.RetrieveSceneInfo(dvlSceneId, sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_CHILDREN | sap.ve.dvl.DVLSCENEINFO.DVLSCENEINFO_HOTSPOTS).ChildNodes);
		}

		if (nodeHierarchy !== oldNodeHierarchy) {
			this.fireNodeHierarchyReplaced({
				oldNodeHierarchy: oldNodeHierarchy,
				newNodeHierarchy: nodeHierarchy
			});
		}

		return this;
	};

	ViewStateManager.prototype._populateNodeStates = function(nodeRefs) {
		var that = this,
			visible = [],
			hidden = [],
			selected = [],
			unselected = [],
			scene = this._nodeHierarchy.getScene(),
			dvlSceneId = scene.getSceneRef();

		nodeRefs.forEach(function addNodeRecursive(nodeRef) {
			var info = that._dvl.Scene.RetrieveNodeInfo(dvlSceneId, nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS | sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_CHILDREN);
			that._nodeStates.set(nodeRef, {
				flags: info.Flags,
				visible: info.Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE
			});
			if (info.Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) {
				that._selectedNodes.add(nodeRef);
			}
			(info.Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE ? visible : hidden).push(nodeRef);
			(info.Flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED ? selected : unselected).push(nodeRef);
			info.ChildNodes.forEach(addNodeRecursive);
		});

		this.fireSelectionChanged({
			selected: selected,
			unselected: unselected
		});

		this.fireVisibilityChanged({
			visible: visible,
			hidden: hidden
		});

		return this;
	};

	ViewStateManager.prototype._handleNodeCreated = function(event) {
		this._populateNodeStates([event.getParameter("nodeRef")]);
	};

	ViewStateManager.prototype._handleNodeRemoving = function(event) {
		var nodeRef = event.getParameter("nodeRef"),
			that = this;

		// If we first delete the nodeRef's node state it will be restored by enumerateChildren as it calls
		// dvl.Scene.RetrieveNodeInfo internally which calls internal ViewportActivator which stores/restores
		// node states. So we delete nodeRef's node state after enumerateChildren.
		var removeChildStates = function(nodeRef) {
			that._nodeHierarchy.enumerateChildren(nodeRef, removeChildStates, true, true);
			that._nodeStates.delete(nodeRef);
		};

		removeChildStates(nodeRef);
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

	ViewStateManager.prototype.getVisibilityComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			allNodeRefs = nodeHierarchy.findNodesByName(),
			visible = [],
			hidden = [];

		allNodeRefs.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef),
				// get the VE_LOCATOR ve id
				veId = jQuery.grep(nodeProxy.getVeIds(), function(veId) {
					return veId.type === "VE_LOCATOR";
				});
			veId = Array.isArray(veId) && veId.length > 0 ? veId[0].fields[0].value : null;
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
		this._dvl.Renderer.ResetView(sap.ve.dvl.DVLRESETVIEWFLAG.VISIBILITY, this._scene);
		return this;
	};

	var getFlagState = function(nodeStates, flagsMask, nodeRef) {
		return nodeStates.has(nodeRef) && (nodeStates.get(nodeRef).flags & flagsMask) !== 0;
	};

	ViewStateManager.prototype._getVisibilityFlagState = function(nodeRef) {
		return getFlagState(this._nodeStates, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE, nodeRef);
	};

	ViewStateManager.prototype._getSelectionFlagState = function(nodeRef) {
		return getFlagState(this._nodeStates, sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED, nodeRef);
	};

	var setFlagState = function(nodeStates, flags, flagsMask, nodeRef) {
		if (nodeStates.has(nodeRef)) {
			var item = nodeStates.get(nodeRef);
			item.flags = item.flags & ~flagsMask | flags & flagsMask;
		} else {
			nodeStates.set(nodeRef, { flags: flags & flagsMask });
		}
	};

	ViewStateManager.prototype._setFlags = function(nodeRef, flags, flagsMask) {
		if (flagsMask & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) {
			this.setVisibilityState(nodeRef, (flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE) !== 0, false);
		}
		if (flagsMask & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) {
			this.setSelectionState(nodeRef, (flags & sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED) !== 0, false);
		}
		// The VISIBLE and SELECTED flags are handled separately above to fire proper events.
		setFlagState(this._nodeStates, flags, flagsMask & ~(sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED), nodeRef);
		return this;
	};

	ViewStateManager.prototype._getFlags = function(nodeRef, flagsMask) {
		var nodeState = this._nodeStates.get(nodeRef),
			flags = nodeState && nodeState.flags;
		return flags !== undefined ? flags & flagsMask : null;
	};

	/**
	 * Gets the visibility state of nodes.
	 *
	 * If a single node reference is passed to the method then a single visibility state is returned.<br/>
	 * If an array of node references is passed to the method then an array of visibility states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityState = function(nodeRefs) {
		return Array.isArray(nodeRefs) ?
			nodeRefs.map(this._getVisibilityFlagState, this) :
			this._getVisibilityFlagState(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
	};

	/**
	 * Sets the visibility state of the nodes.
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} visible The new visibility state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} force If a node is made visible but its parent is hidden then it will still be hidden in Viewport. This flag will force node to be visible regardless of parent's state.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setVisibilityState = function(nodeRefs, visible, recursive, force) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var changed = uniqueSort(recursive ? this._collectNodesRecursively(nodeRefs, true) : nodeRefs)
			.filter(function(nodeRef) {
				return nodeRef && this._getVisibilityFlagState(nodeRef) !== visible;
			}, this);

		var updateVisibility = function(nodeRef, visible) {
			var childNodes = [];
			this._nodeHierarchy.enumerateChildren(nodeRef, function(childNode) { childNodes.push(childNode); }, true, true);

			childNodes.forEach(function(childNode) {
				var nodeState = this._nodeStates.get(childNode);
				if (visible) {
					// Show child node only if it was visible before
					if (nodeState.visible) {
						nodeState.flags |= sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE;
						updateVisibility(childNode, visible);
					}
				} else {
					// Hide all descendent nodes
					nodeState.flags &= ~sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE;
					updateVisibility(childNode, visible);
				}
			}, this);
		}.bind(this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (nodeState.flags === undefined) {
						nodeState.flags = 0;
					}
					if (visible) {
						nodeState.flags |= sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE;
					} else {
						nodeState.flags &= ~sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE;
					}
				} else {
					// A new node was added to the scene. Most likely a camera.
					nodeState = { flags: visible ? sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_VISIBLE : 0 };
					this._nodeStates.set(nodeRef, nodeState);
				}
				nodeState.visible = visible;
				updateVisibility(nodeRef, visible);
			}, this);

			if (this.getShouldTrackVisibilityChanges()) {
				changed.forEach(this._visibilityTracker.trackNodeRef, this._visibilityTracker);
			}

			this.fireVisibilityChanged({
				visible: visible ? changed : [],
				hidden: visible ? [] : changed
			});
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
		return Array.isArray(nodeRefs) ?
			nodeRefs.map(this._getSelectionFlagState, this) :
			this._getSelectionFlagState(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
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
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var changed = uniqueSort(recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(nodeRefs) : nodeRefs);

		if (this.getRecursiveSelection() && !selected) {
			changed = this._nodeHierarchy._appendAncestors(changed);
		}

		changed = changed.filter(function(nodeRef) {
			return nodeRef && this._getSelectionFlagState(nodeRef) !== selected;
		}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (nodeState.flags === undefined) {
						nodeState.flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					}
					if (selected) {
						nodeState.flags |= sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED;
					} else {
						nodeState.flags &= ~sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED;
					}
				} else {
					// A new node was added to the scene. Most likely a camera.
					var flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					this._nodeStates.set(nodeRef, { flags: flags | (selected ? sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED : 0) });
				}
				this._selectedNodes[selected ? "add" : "delete"](nodeRef);
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

		var selected = uniqueSort(recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(selectedNodeRefs) : selectedNodeRefs);
		var unselected = uniqueSort(recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(unselectedNodeRefs) : unselectedNodeRefs);

		if (this.getRecursiveSelection()) {
			unselected = this._nodeHierarchy._appendAncestors(unselected, selected);
		}

		selected = selected.filter(function(nodeRef) {
			return nodeRef && this._getSelectionFlagState(nodeRef) === false;
		}, this);

		unselected = unselected.filter(function(nodeRef) {
			return nodeRef && this._getSelectionFlagState(nodeRef) === true;
		}, this);

		if (selected.length > 0) {
			selected.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (nodeState.flags === undefined) {
						nodeState.flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					}
					nodeState.flags |= sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED;
				} else {
					// A new node was added to the scene. Most likely a camera.
					var flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					this._nodeStates.set(nodeRef, { flags: flags | sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED });
				}
				this._selectedNodes["add"](nodeRef);
			}, this);
		}

		if (unselected.length > 0) {
			unselected.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (nodeState.flags === undefined) {
						nodeState.flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					}
					nodeState.flags &= ~sap.ve.dvl.DVLNODEFLAG.DVLNODEFLAG_SELECTED;
				} else {
					// A new node was added to the scene. Most likely a camera.
					var flags = this._dvl.Scene.RetrieveNodeInfo(this._nodeHierarchy.getScene().getSceneRef(), nodeRef, sap.ve.dvl.DVLNODEINFO.DVLNODEINFO_FLAGS).Flags;
					this._nodeStates.set(nodeRef, { flags: flags });
				}
				this._selectedNodes["delete"](nodeRef);
			}, this);
		}

		if (!blockNotification) {
			if (selected.length > 0 || unselected.length > 0) {
				this.fireSelectionChanged({
					selected: selected,
					unselected: unselected
				});
			}
		}

		return this;
	};

	ViewStateManager.prototype._handleStepEvent = function(event) {
		if (event.type === sap.ve.dvl.DVLSTEPEVENT.DVLSTEPEVENT_STARTED) {
			this._visibilityTracker.clear();
		}
	};

	ViewStateManager.prototype._collectNodesRecursively = function(nodeRefs, includeClosedNodes) {
		var result = [],
			that = this;

		if (includeClosedNodes === undefined) {
			includeClosedNodes = false;
		}

		nodeRefs.forEach(function collectChildNodes(nodeRef) {
			result.push(nodeRef);
			that._nodeHierarchy.enumerateChildren(nodeRef, collectChildNodes, includeClosedNodes, true);
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
		if (this._nodeStates.has(nodeRef)) {
			var opacity = this._nodeStates.get(nodeRef).opacity;
			return opacity === undefined ? null : opacity;
		} else {
			return null;
		}
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
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
	 * @param {any|any[]} nodeRefs                The node reference or the array of node references.
	 * @param {float|null}      opacity           The new opacity of the nodes. If <code>null</code> is passed then the opacity is reset
	 *                                            and the node's own opacity should be used.
	 * @param {boolean}         [recursive=false] The flags indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOpacity = function(nodeRefs, opacity, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var changed = uniqueSort(recursive ? this._collectNodesRecursively(nodeRefs, true) : nodeRefs)
			.filter(function(nodeRef) {
				return nodeRef && this._getOpacity(nodeRef) !== opacity;
			}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (opacity === null) {
						delete nodeState.opacity;
					} else {
						nodeState.opacity = opacity;
					}
				} else if (opacity !== null) {
					// A new node was added to the scene. Most likely a camera.
					this._nodeStates.set(nodeRef, { opacity: opacity });
				}
			}, this);

			this.fireOpacityChanged({
				changed: changed,
				opacity: opacity
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
		if (this._nodeStates.has(nodeRef)) {
			var tintColorABGR = this._nodeStates.get(nodeRef).tintColorABGR;
			return tintColorABGR === undefined ? null : tintColorABGR;
		} else {
			return null;
		}
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
		if (this._nodeStates.has(nodeRef)) {
			var tintColorABGR = this._nodeStates.get(nodeRef).tintColorABGR;
			return tintColorABGR === undefined ? null : colorToCSSColor(abgrToColor(tintColorABGR));
		} else {
			return null;
		}
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
	 * @param {sap.ui.core.CSSColor|int|null} tintColor       The new tint color of the nodes. The value can be defined as a string
	 *                                                        in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                        is passed then the tint color is reset and the node's own tint color should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setTintColor = function(nodeRefs, tintColor, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var tintColorABGR = null;
		switch (typeof tintColor) {
			case "number":
				tintColorABGR = tintColor;
				break;
			case "string":
				if (sap.ui.core.CSSColor.isValid(tintColor)) {
					tintColorABGR = colorToABGR(cssColorToColor(tintColor));
				}
				break;
			default:
				tintColor = null; // The input tint color is invalid, reset it to null.
				break;
		}

		var changed = uniqueSort(recursive ? this._collectNodesRecursively(nodeRefs, true) : nodeRefs)
			.filter(function(nodeRef) {
				return nodeRef && this._getTintColorABGR(nodeRef) !== tintColorABGR;
			}, this);

		if (changed.length > 0) {
			changed.forEach(function(nodeRef) {
				var nodeState = this._nodeStates.get(nodeRef);
				if (nodeState) {
					if (tintColorABGR === null) {
						delete nodeState.tintColorABGR;
					} else {
						nodeState.tintColorABGR = tintColorABGR;
					}
				} else if (tintColorABGR !== null) {
					// A new node was added to the scene. Most likely a camera.
					this._nodeStates.set(nodeRef, { tintColorABGR: tintColorABGR });
				}
			}, this);

			this.fireTintColorChanged({
				changed: changed,
				tintColor: tintColor,
				tintColorABGR: tintColorABGR
			});
		}

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

		var findVeLocator = function(veId) {
			return veId.type === "VE_LOCATOR";
		};

		// converting the collection of changed node references to ve ids
		var changedNodes = [];
		this._visibilityChanges.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef),
				// get the VE_LOCATOR ve id
				veId = jQuery.grep(nodeProxy.getVeIds(), findVeLocator);
			veId = Array.isArray(veId) && veId.length > 0 ? veId[0].fields[0].value : null;
			// destroy the node proxy
			nodeHierarchy.destroyNodeProxy(nodeProxy);
			if (veId) {
				changedNodes.push(veId);
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
