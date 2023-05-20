/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the ViewStateManager class.
sap.ui.define([
	"sap/base/util/ObjectPath",
	"./Scene",
	"./ViewStateManagerBase",
	"sap/ui/core/Core"
], function(
	ObjectPath,
	Scene,
	ViewStateManagerBase,
	core
) {
	"use strict";

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
	 * @alias sap.ui.vk.ViewStateManager
	 * @since 1.32.0
	 */
	var ViewStateManager = ViewStateManagerBase.extend("sap.ui.vk.ViewStateManager", /** @lends sap.ui.vk.ViewStateManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ViewStateManager.getMetadata().getParent().getClass().prototype;

	ViewStateManager.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._implementation = null;
	};

	ViewStateManager.prototype.exit = function() {
		this._destroyImplementation();

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	ViewStateManager.prototype._destroyImplementation = function() {
		if (this._implementation) {
			this._implementation.destroy();
			this._implementation = null;
		}
		return this;
	};

	ViewStateManager.prototype.getImplementation = function() {
		return this._implementation;
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
		if (scene && scene instanceof Scene) {
			var withMultipleViewports = (this.getFeatures() || []).includes("MultipleViewports");
			var sceneType = scene.getMetadata().getName();
			var implementationType = this._implementation && this._implementation.getMetadata().getName();
			var reuseImplementation =
				sceneType === "sap.ui.vk.dvl.Scene" && implementationType === "sap.ui.vk.dvl.ViewStateManager"
				|| sceneType === "sap.ui.vk.threejs.Scene" && (
					implementationType === "sap.ui.vk.threejs.ViewStateManager" && !withMultipleViewports
					|| implementationType === "sap.ui.vk.threejs.v2.ViewStateManager" && withMultipleViewports)
				|| sceneType === "sap.ui.vk.svg.Scene" && implementationType === "sap.ui.vk.svg.ViewStateManager";

			if (!reuseImplementation) {
				this._destroyImplementation();
				var newImplementationType;
				if (sceneType === "sap.ui.vk.dvl.Scene") {
					newImplementationType = "sap.ui.vk.dvl.ViewStateManager";
				} else if (sceneType === "sap.ui.vk.threejs.Scene") {
					if (withMultipleViewports) {
						newImplementationType = "sap.ui.vk.threejs.v2.ViewStateManager";
					} else {
						newImplementationType = "sap.ui.vk.threejs.ViewStateManager";
					}
				} else if (sceneType === "sap.ui.vk.svg.Scene") {
					newImplementationType = "sap.ui.vk.svg.ViewStateManager";
				}

				if (newImplementationType) {
					var that = this;
					// The ViewStateManager implementation classes from the `dvl`, `threejs` and `svg` namespaces are
					// loaded by the corresponding content managers, so there is no need to load them here. We can
					// safely assume that they are available at this point.
					var Class = ObjectPath.get(newImplementationType);
					this._implementation = new Class({
						shouldTrackVisibilityChanges: this.getShouldTrackVisibilityChanges(),
						recursiveSelection: this.getRecursiveSelection(),
						contentConnector: this.getContentConnector(),
						viewManager: this.getViewManager(),
						visibilityChanged: function(event) {
							that.fireVisibilityChanged({
								visible: event.getParameter("visible"),
								hidden: event.getParameter("hidden")
							});
						},
						selectionChanged: function(event) {
							that.fireSelectionChanged({
								selected: event.getParameter("selected"),
								unselected: event.getParameter("unselected")
							});
						},
						outliningChanged: function(event) {
							that.fireOutliningChanged({
								outlined: event.getParameter("outlined"),
								unoutlined: event.getParameter("unoutlined")
							});
						},
						opacityChanged: function(event) {
							that.fireOpacityChanged({
								changed: event.getParameter("changed"),
								opacity: event.getParameter("opacity")
							});
						},
						tintColorChanged: function(event) {
							that.fireTintColorChanged({
								changed: event.getParameter("changed"),
								tintColor: event.getParameter("tintColor"),
								tintColorABGR: event.getParameter("tintColorABGR")
							});
						},
						nodeHierarchyReplaced: function(event) {
							that.fireNodeHierarchyReplaced({
								oldNodeHierarchy: event.getParameter("oldNodeHierarchy"),
								newNodeHierarchy: event.getParameter("newNodeHierarchy")
							});
						},
						viewStateApplying: function(event) {
							that.fireViewStateApplying({
								view: event.getParameter("view")
							});
						},
						viewStateApplied: function(event) {
							that.fireViewStateApplied({
								view: event.getParameter("view")
							});
						},
						transformationChanged: function(event) {
							that.fireTransformationChanged(event.getParameters());
						},
						highlightColorChanged: function(event) {
							that.fireHighlightColorChanged(event.getParameters());
						}
					});

					var viewManager = core.byId(this.getViewManager());
					if (viewManager) {
						var animationPlayer = core.byId(viewManager.getAnimationPlayer());
						if (animationPlayer) {
							animationPlayer.setViewStateManager(this._implementation);
						}
					}
				}
			}
		} else {
			this._destroyImplementation();
		}

		return this;
	};

	// Node hierarchy handling ends.
	////////////////////////////////////////////////////////////////////////


	/**
	 * Gets the Animation player associated with viewManager.
	 * @returns {sap.ui.vk.AnimationPlayer} animation player
	 * @public
	 */
	ViewStateManager.prototype.getAnimationPlayer = function() {
		var animationPlayer;
		var viewManager = core.byId(this.getViewManager());
		if (viewManager) {
			animationPlayer = core.byId(viewManager.getAnimationPlayer());
		}
		return animationPlayer;
	};

	/**
	 * Gets the NodeHierarchy object associated with this ViewStateManager object.
	 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManager object.
	 * @public
	 */
	ViewStateManager.prototype.getNodeHierarchy = function() {
		return this._implementation && this._implementation.getNodeHierarchy();
	};

	/**
	 * Gets the visibility changes in the current ViewStateManager object.
	 * @returns {string[]} The visibility changes are in the form of an array. The array is a list of node VE ids which suffered a visibility changed relative to the default state.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityChanges = function() {
		return this._implementation && this._implementation.getVisibilityChanges();
	};

	/**
	 * Gets the visibility state of all nodes.
	 * @returns {object} An object with following structure.
	 * <pre>
	 * {
	 *     visible: [string, ...] - an array of VE IDs of visible nodes
	 *     hidden:  [string, ...] - an array of VE IDs of hidden nodes
	 * }
	 * </pre>
	 */
	ViewStateManager.prototype.getVisibilityComplete = function() {
		return this._implementation && this._implementation.getVisibilityComplete();
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
		return this._implementation && this._implementation.getVisibilityState(nodeRefs);
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
		if (this._implementation) {
			this._implementation.setVisibilityState(nodeRefs, visible, recursive, force);
		}
		return this;
	};

	/**
	 * Resets the visibility states of all nodes to the initial states.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.resetVisibility = function() {
		if (this._implementation) {
			this._implementation.resetVisibility();
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
		if (this._implementation) {
			this._implementation.enumerateSelection(callback);
		}
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
		if (this._implementation && this._implementation.enumerateOutlinedNodes) {
			this._implementation.enumerateOutlinedNodes(callback);
		}
		return this;
	};

	/**
	 * Sets if showing the bounding box when nodes are selected
	 *
	 * @param {boolean} val <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.setShowSelectionBoundingBox = function(val) {
		if (this._implementation) {
			this._implementation.setShowSelectionBoundingBox(val);
		}
	};

	/**
	 * Gets if showing the bounding box when nodes are selected
	 *
	 * @returns {boolean} <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getShowSelectionBoundingBox = function() {
		if (this._implementation) {
			return this._implementation.getShowSelectionBoundingBox();
		}
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
		return this._implementation && this._implementation.getSelectionState(nodeRefs);
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
		if (this._implementation) {
			this._implementation.setSelectionState(nodeRefs, selected, recursive, blockNotification);
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
		if (this._implementation) {
			this._implementation.setSelectionStates(selectedNodeRefs, unselectedNodeRefs, recursive, blockNotification);
		}
		return this;
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
		if (this._implementation && this._implementation.getOutliningState) {
			return this._implementation.getOutliningState(nodeRefs);
		} else {
			return false;
		}
	};


	/**
	 * Sets or resets the outlining state of the nodes.
	 * @param {any|any[]} outlinedNodeRefs The node reference or the array of node references of selected nodes.
	 * @param {any|any[]} unoutlinedNodeRefs The node reference or the array of node references of unselected nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutliningStates = function(outlinedNodeRefs, unoutlinedNodeRefs, recursive) {
		if (this._implementation && this._implementation.setOutliningStates) {
			this._implementation.setOutliningStates(outlinedNodeRefs, unoutlinedNodeRefs, recursive);
		}
		return this;
	};

	/**
	 * Retrieves list of current joints
	 * @returns {any[]} array of joints or <code>undefined</code>
	 * @see {@link sap.ui.vk.AnimationSequence.getJoint} for joint definition
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */
	ViewStateManager.prototype.getJoints = function() {
		if (this._implementation && this._implementation.getJoints) {
			return this._implementation.getJoints();
		}
		return undefined;
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
		if (this._implementation && this._implementation.setJoints) {
			this._implementation.setJoints(joints, playback);
		}
		return this;
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
		return this._implementation && this._implementation.getOpacity(nodeRefs);
	};

	/**
	 * Sets the opacity of the nodes.
	 *
	 * @param {any|any[]}       nodeRefs          The node reference or the array of node references.
	 * @param {float|null}      opacity           The new opacity of the nodes. If <code>null</code> is passed then the opacity is reset
	 *                                            and the node's own opacity should be used.
	 * @param {boolean}         [recursive=false] The flags indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOpacity = function(nodeRefs, opacity, recursive) {
		if (this._implementation) {
			this._implementation.setOpacity(nodeRefs, opacity, recursive);
		}
		return this;
	};

	/**
	 * Get total opacity - product of all the ancestors' opacities and its own opacity
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @returns {float} total opacity
	 * @public
	 */
	ViewStateManager.prototype.getTotalOpacity = function(nodeRef) {
		if (this._implementation && this._implementation.getTotalOpacity) {
			return this._implementation.getTotalOpacity(nodeRef);
		}
		return 1;
	};

	/**
	 * Set total opacity using current opacity - product of all the ancestors' opacities and its own opacity
	 * The node's opacity is re-calculated based on the total opacity
	 * if the parent's total opacity is zero, the node's total opacity is zero, the node's opacity is not changed
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} totalOpacity product of all the ancestors' opacities and its own opacity
	 * @returns {any} object contains <code>opacity</code> and <code>totalOpacity</code>
	 * @public
	 */
	ViewStateManager.prototype.setTotalOpacity = function(nodeRef, totalOpacity) {
		if (this._implementation && this._implementation.setTotalOpacity) {
			return this._implementation.setTotalOpacity(nodeRef, totalOpacity);
		}
		return null;
	};


	/**
	 * Get node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {float} node opacity
	 * @public
	 */
	ViewStateManager.prototype.getRestOpacity = function(nodeRef) {
		if (this._implementation && this._implementation.getRestOpacity) {
			return this._implementation.getRestOpacity(nodeRef);
		}
		return null;
	};

	/**
	 * Set node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float} opacity The node opacity
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setRestOpacity = function(nodeRef, opacity) {
		if (this._implementation && this._implementation.setRestOpacity) {
			this._implementation.setRestOpacity(nodeRef, opacity);
		}
		return this;
	};

	/**
	 * Replace node's current opacity with its rest opacity stored in active view..
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.restoreRestOpacity = function(nodeRef) {
		if (this._implementation && this._implementation.restoreRestOpacity) {
			this._implementation.restoreRestOpacity(nodeRef);
		}
		return this;
	};

	/**
	 * Copy node's current opacity into its rest opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateRestOpacity = function(nodeRef) {
		if (this._implementation && this._implementation.updateRestOpacity) {
			this._implementation.updateRestOpacity(nodeRef);
		}
		return this;
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
		return this._implementation && this._implementation.getTintColor(nodeRefs, inABGRFormat);
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
		if (this._implementation) {
			this._implementation.setTintColor(nodeRefs, tintColor, recursive);
		}
		return this;
	};

	/**
	 * Sets the default highlighting color
	 * @param {sap.ui.core.CSSColor|string|int} color The new default highlighting color. The value can be defined as a string
	 *                                                in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                is passed then the tint color is reset and the node's own tint color should be used.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setHighlightColor = function(color) {
		if (this._implementation && this._implementation.setHighlightColor) {
			this._implementation.setHighlightColor(color);
		}
		return this;
	};

	/**
	 * Gets the default highlighting color
	 *
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the default highlighting color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getHighlightColor = function(inABGRFormat) {
		if (this._implementation && this._implementation.getHighlightColor) {
			return this._implementation.getHighlightColor(inABGRFormat);
		}
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
		if (this._implementation && this._implementation.setOutlineColor) {
			this._implementation.setOutlineColor(color);
		}
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
		if (this._implementation && this._implementation.getOutlineColor) {
			return this._implementation.getOutlineColor(inABGRFormat);
		} else {
			return null;
		}
	};

	/**
	 * Sets the outline width
	 * @param {float} width Width of outline
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutlineWidth = function(width) {
		if (this._implementation && this._implementation.setOutlineWidth) {
			this._implementation.setOutlineWidth(width);
		}
		return this;
	};

	/**
	 * Gets the outline width
	 * @returns {float} Width of outline
	 * @public
	 */
	ViewStateManager.prototype.getOutlineWidth = function() {
		if (this._implementation && this._implementation.getOutlineWidth) {
			return this._implementation.getOutlineWidth();
		} else {
			return 0.0;
		}
	};

	ViewStateManager.prototype.setRecursiveOutlining = function(oProperty) {
		this.setProperty("recursiveOutlining", oProperty, true);
		if (this._implementation && this._implementation.setRecursiveOutlining) {
			this._implementation.setRecursiveOutlining(oProperty);
		}
		return this;
	};

	ViewStateManager.prototype.setRecursiveSelection = function(oProperty) {
		this.setProperty("recursiveSelection", oProperty, true);
		if (this._implementation) {
			this._implementation.setRecursiveSelection(oProperty);
		}
		return this;
	};

	/**
	 * Set highlight display state.
	 *
	 * @param {sap.ui.vk.HighlightDisplayState} state State for playing highlight - playing, pausing, and stopped
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setHighlightDisplayState = function(state) {
		if (this._implementation && this._implementation.setHighlightDisplayState) {
			this._implementation.setHighlightDisplayState(state);
		}

		return this;
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
		if (this._implementation && this._implementation.setTransformation) {
			this._implementation.setTransformation(nodeRefs, transformations);
		}

		return this;
	};

	/**
	 * Gets the decomposed node local transformation matrix.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformation = function(nodeRef) {
		if (this._implementation && this._implementation.getTransformation) {
			return this._implementation.getTransformation(nodeRef);
		}

		return null;
	};

	/**
	 * Gets the decomposed node transformation matrix under world coordinates
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformationWorld = function(nodeRef) {
		if (this._implementation && this._implementation.getTransformationWorld) {
			return this._implementation.getTransformationWorld(nodeRef);
		}

		return null;
	};

	/**
	 * Get node's rest transformation in world coordinates stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code>, <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationWorld = function(nodeRef) {
		if (this._implementation && this._implementation.getRestTransformationWorld) {
			return this._implementation.getRestTransformationWorld(nodeRef);
		}

		return null;
	};

	/**
	 * Gets the decomposed node rest transformation matrix if node is not linked to a joint, otherwise return decomposed joint transformation
	 *
	 * @param {any} nodeRef The node reference
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationUsingJoint = function(nodeRef) {
		if (this._implementation && this._implementation.getRestTransformationUsingJoint) {
			return this._implementation.getRestTransformationUsingJoint(nodeRef);
		}

		return null;
	};

	/**
	 * Copy nodes' current transformation into their rest transformation stored in active view.
	 *
	 * @param {any[]} nodeRefs Array of node references.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateNodesRestTransformation = function(nodeRefs) {
		if (this._implementation && this._implementation.updateNodesRestTransformation) {
			this._implementation.updateNodesRestTransformation(nodeRefs);
		}
		return this;
	};

	/**
	 * Copy node's current transformation into its rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {boolean} doNotFireSequenceChanged Do not trigger the sequence changed event in case other node references are not updated.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateRestTransformation = function(nodeRef, doNotFireSequenceChanged) {
		if (this._implementation && this._implementation.updateRestTransformation) {
			this._implementation.updateRestTransformation(nodeRef, doNotFireSequenceChanged);
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
		if (this._implementation && this._implementation.restoreRestTransformation) {
			this._implementation.restoreRestTransformation(nodeRef);
		}
		return this;
	};


	/**
	 * Set node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float[]} translation vector for position, array of size 3.
	 * @param {float[]} quaternion quaternion for rotation, array of size 3.
	 * @param {float[]} scale vector for scaling, array of size 3.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setRestTransformation = function(nodeRef, translation, quaternion, scale) {
		if (this._implementation && this._implementation.setRestTransformation) {
			this._implementation.setRestTransformation(nodeRef, translation, quaternion, scale);
		}
		return this;
	};

	/**
	 * Gets the decomposed node local transformation matrix relative to node rest position
	 *
	 * @param {any|any[]} nodeRefs The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRelativeTransformation = function(nodeRefs) {
		if (this._implementation && this._implementation.getRelativeTransformation) {
			return this._implementation.getRelativeTransformation(nodeRefs);
		}
		return null;
	};

	/**
	 * Get node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @public
	 */
	ViewStateManager.prototype.getRestTransformation = function(nodeRef) {
		if (this._implementation && this._implementation.getRestTransformation) {
			return this._implementation.getRestTransformation(nodeRef);
		}
		return null;
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
		if (this._implementation && this._implementation.setInterpolatedRelativeValues) {
			return this._implementation.setInterpolatedRelativeValues(nodeRef, value);
		}
		return null;
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
		if (this._implementation && this._implementation._getEndPropertyInLastPlayback) {
			return this._implementation._getEndPropertyInLastPlayback(nodeRef, property);
		}
		return null;
	};

	/**
	 * Get node property relative to rest position, defined by the last key of previous playback.
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} property translate/rotate/scale/opacity
	 * @param {sap.ui.vk.AnimationPlayback} playback current playback
	 * @returns {float[] | float} translate/rotate/scale/opacity
	 * @private
	 */
	ViewStateManager.prototype._getEndPropertyInPreviousPlayback = function(nodeRef, property, playback) {
		if (this._implementation && this._implementation._getEndPropertyInPreviousPlayback) {
			return this._implementation._getEndPropertyInPreviousPlayback(nodeRef, property, playback);
		}
		return null;
	};

	/**
	 * Convert translate, rotate, and scale tracks in absolute values to the values relative to the rest position defined with active view.
	 *
	 * @param {sap.ui.vk.Animation.sequence} sequence animation sequence
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._convertTracksToRelative = function(sequence) {
		if (this._implementation && this._implementation._convertTracksToRelative) {
			this._implementation._convertTracksToRelative(sequence);
		}
		return this;
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
		if (this._implementation && this._implementation._setJointNodeOffsets) {
			this._implementation._setJointNodeOffsets(nodeRef, trackType);
		}
		return this;
	};

	ViewStateManager.prototype._setJointNodeMatrix = function() {
		if (this._implementation && this._implementation._setJointNodeMatrix) {
			this._implementation._setJointNodeMatrix();
		}
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
		if (this._implementation && this._implementation._propagateOpacityToJointChildren) {
			this._implementation._propagateOpacityToJointChildren(nodeRefs, opacities);
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
	 * 			{float | float[]} <code>keyValue</code> translation relative to rest position
	 *   		{float | float[]} <code>absoluteValue</code> translation
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setTranslationKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		if (this._implementation && this._implementation.setTranslationKey) {
			this._implementation.setTranslationKey(nodeRef, time, playback, blockTrackChangedEvent);
		}
		return this;
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
	 *   		{float[]} <code>absoluteValue</code> scale
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setScaleKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		if (this._implementation && this._implementation.setScaleKey) {
			this._implementation.setScaleKey(nodeRef, time, playback, blockTrackChangedEvent);
		}
		return this;
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
		if (this._implementation && this._implementation.setRotationKey) {
			this._implementation.setRotationKey(nodeRef, time, euler, playback, blockTrackChangedEvent);
		}
		return this;
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
		if (this._implementation && this._implementation.setOpacityKey) {
			this._implementation.setOpacityKey(nodeRef, time, playback, blockTrackChangedEvent);
		}
		return this;
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
		if (this._implementation && this._implementation.getSymbolNodes) {
			return this._implementation.getSymbolNodes(nodeId);
		}
		return [];
	};

	/**
	 * Get the background image type
	 *
	 * @returns {?string} Image type string, or null
	 * @private
	 * @experimental Since 1.82.0 This method is experimental and might be modified or removed in future versions
	 */
	ViewStateManager.prototype.getBackgroundImageType = function() {
		if (this._implementation && this._implementation.getBackgroundImageType) {
			return this._implementation.getBackgroundImageType();
		}
		return null;
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
		if (this._implementation && this._implementation.setBackgroundImageType) {
			return this._implementation.setBackgroundImageType(imageType);
		}
		return undefined;
	};

	ViewStateManager.prototype.getSelectable = function(nodeRefs) {
		var impl = this._implementation;
		if (impl) {
			return impl.getSelectable(nodeRefs);
		}

		if (Array.isArray(nodeRefs)) {
			return new Array(nodeRefs.length).fill(true);
		} else {
			return true;
		}
	};

	ViewStateManager.prototype.setSelectable = function(nodeRefs, selectable) {
		var impl = this._implementation;
		if (impl) {
			return impl.setSelectable(nodeRefs, selectable);
		}
		return this;
	};

	return ViewStateManager;
});
