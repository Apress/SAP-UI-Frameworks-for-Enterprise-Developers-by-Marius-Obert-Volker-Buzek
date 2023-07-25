/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the ViewStateManagerBase class.
sap.ui.define([
	"sap/ui/core/Element",
	"./Core"
], function(
	Element,
	vkCore
) {
	"use strict";

	/**
	 * Constructor for a new ViewStateManagerBase.
	 *
	 * @class
	 * Manages the visibility and selection states of nodes in the scene.
	 *
	 * @param {string} [sId] ID for the new ViewStateManagerBase object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ViewStateManagerBase object.
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.ViewStateManagerBase
	 * @since 1.32.0
	 */
	var ViewStateManagerBase = Element.extend("sap.ui.vk.ViewStateManagerBase", /** @lends sap.ui.vk.ViewStateManagerBase.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			"abstract": true,

			properties: {
				shouldTrackVisibilityChanges: {
					type: "boolean",
					defaultValue: false
				},
				recursiveSelection: {
					type: "boolean",
					defaultValue: false
				},
				recursiveOutlining: {
					type: "boolean",
					defaultValue: false
				},
				features: {
					type: "string[]",
					defaultValue: []
				}
			},

			associations: {
				contentConnector: {
					type: "sap.ui.vk.ContentConnector"
				},
				viewManager: {
					type: "sap.ui.vk.ViewManager"
				}
			},

			events: {
				/**
				 * This event is fired when the visibility of the node changes.
				 */
				visibilityChanged: {
					parameters: {
						/**
						 * References of newly shown nodes.
						 */
						visible: {
							type: "any[]"
						},
						/**
						 * References of newly hidden nodes.
						 */
						hidden: {
							type: "any[]"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the nodes are selected/unselected.
				 */
				selectionChanged: {
					parameters: {
						/**
						 * References of newly selected nodes.
						 */
						selected: {
							type: "any[]"
						},
						/**
						 * References of newly unselected nodes.
						 */
						unselected: {
							type: "any[]"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the nodes are outlined/unoutlined.
				 */
				outliningChanged: {
					parameters: {
						/**
						 * References of newly outlined nodes.
						 */
						outlined: {
							type: "any[]"
						},
						/**
						 * References of newly unoutlined nodes.
						 */
						unoutlined: {
							type: "any[]"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when opacity of the nodes is changed.
				 */
				opacityChanged: {
					parameters: {
						/**
						 * References of nodes whose opacity changed.
						 */
						changed: {
							type: "any[]"
						},
						/**
						 * Opacity assigned to the nodes. Could be either <code>float</code> or <code>float[]</code> if event was fired from a bulk operation.
						 */
						opacity: {
							type: "any"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when tint color of the nodes is changed.
				 */
				tintColorChanged: {
					parameters: {
						/**
						 * References of nodes whose tint color changed.
						 */
						changed: {
							type: "any[]"
						},
						/**
						 * Tint color assigned to the nodes. Could be either <code>sap.ui.core.CSSColor</code> or <code>sap.ui.core.CSSColor[]</code> if event was fired from a bulk operation.
						 */
						tintColor: {
							type: "any"
						},
						/**
						 * Tint color in the ABGR format assigned to the nodes.  Could be either <code>int</code> or <code>int[]</code> if event was fired from a bulk operation.
						 */
						tintColorABGR: {
							type: "any"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the node hierarchy is replaced.
				 */
				nodeHierarchyReplaced: {
					parameters: {
						/**
						 * Old node hierarchy
						 */
						oldNodeHierarchy: {
							type: "sap.ui.vk.NodeHierarchy"
						},

						/**
						 * New node hierarchy
						 */
						newNodeHierarchy: {
							type: "sap.ui.vk.NodeHierarchy"
						}
					}
				},

				/**
				 * This event is fired when highlighting color is changed.
				 */
				highlightColorChanged: {
					parameters: {
						/**
						 * Highlighting color
						 */
						highlightColor: {
							type: "sap.ui.core.CSSColor"
						},
						/**
						 * Highlighting color in the ABGR format.
						 */
						highlightColorABGR: {
							type: "int"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when node's transformation changed.
				 */
				transformationChanged: {
					parameters: {

						/**
						 * Reference to a changed node or array of node references.
						 */
						changed: {
							type: "any"
						},

						/**
						 * Node's transformation or array of nodes' transforms
						 * Transformation object will contain the following fields of type <code>float[]</code>:
						 * translation
						 * scale
						 * angleAxis | euler | quaternion
						 */
						transformation: {
							type: "any"
						}
					}
				},

				/**
				 * This event is fired when View is about to be activated.
				 */
				viewStateApplying: {
					parameters: {
						view: {
							type: "sap.ui.vk.View"
						}
					}
				},

				/**
				 * This event is fired when View activated.
				 */
				viewStateApplied: {
					parameters: {
						view: {
							type: "sap.ui.vk.View"
						}
					}
				},

				/**
				 * This event is fired when viewport is ready for playing animation (e.g, camera is ready).
				 */
				readyForAnimation: {
					parameters: {
						view: {
							type: "sap.ui.vk.View"
						}
					}
				},

				/**
				 * This event is fired when outlining color  is changed.
				 */
				outlineColorChanged: {
					parameters: {
						/**
						 * Outlining color
						 */
						outlineColor: {
							type: "sap.ui.core.CSSColor"
						},
						/**
						 * Outlining color in the ABGR format.
						 */
						outlineColorABGR: {
							type: "int"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when outline width is changed.
				 */
				outlineWidthChanged: {
					parameters: {
						/**
						 * Outline width
						 */
						width: {
							type: "float"
						}
					},
					enableEventBubbling: true
				}
			}
		},

		constructor: function(sId, mSettings) {
			Element.apply(this, arguments);

			// This object can be referenced via associations.
			vkCore.observeLifetime(this);

			// This object references other objects via associations.
			vkCore.observeAssociations(this);
		}
	});

	ViewStateManagerBase.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(contentConnector.getContent());
	};

	ViewStateManagerBase.prototype.onUnsetContentConnector = function(contentConnector) {
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
		this._setContent(null);
	};

	ViewStateManagerBase.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	/**
	 * Sets a scene obtained as content from the associated content connector.
	 *
	 * This method should be overridden in derived classes.
	 *
	 * @param {sap.ui.vk.Scene} content New content or <code>null</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @protected
	 */
	ViewStateManagerBase.prototype._setContent = function(content) {
		// This is a base class - do nothing.
		return this;
	};

	/**
	 * Gets the NodeHierarchy object associated with this ViewStateManagerBase object.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getNodeHierarchy
	 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManagerBase object.
	 * @public
	 */

	/**
	 * Gets the visibility changes in the current ViewStateManagerBase object.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getVisibilityChanges
	 * @returns {string[]} The visibility changes are in the form of an array. The array is a list of node VE ids which suffered a visibility changed relative to the default state.
	 * @public
	 */

	/**
	 * Gets the visibility state of all nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getVisibilityComplete
	 * @returns {object} An object with following structure.
	 * <pre>
	 * {
	 *     visible: [string, ...] - an array of VE IDs of visible nodes
	 *     hidden:  [string, ...] - an array of VE IDs of hidden nodes
	 * }
	 * </pre>
	 */

	/**
	 * Gets the visibility state of nodes.
	 *
	 * If a single node reference is passed to the method then a single visibility state is returned.<br/>
	 * If an array of node references is passed to the method then an array of visibility states is returned.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getVisibilityState
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
	 * @public
	 */

	/**
	 * Sets the visibility state of the nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setVisibilityState
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} visible The new visibility state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} force If a node is made visible but its parent is hidden then it will still be hidden in Viewport. This flag will force node to be visible regardless of parent's state.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Resets the visibility states of all nodes to the initial states.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#resetVisibility
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Enumerates IDs of the selected nodes.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#enumerateSelection
	 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the selection state of the node.
	 *
	 * If a single node reference is passed to the method then a single selection state is returned.<br/>
	 * If an array of node references is passed to the method then an array of selection states is returned.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getSelectionState
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */

	/**
	 * Sets the selection state of the nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setSelectionState
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} selected The new selection state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @deprecated Since version 1.56.3.
	 * @public
	 */

	/**
	 * Sets or resets the selection state of the nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setSelectionStates
	 * @param {any|any[]} selectedNodeRefs The node reference or the array of node references of selected nodes.
	 * @param {any|any[]} unselectedNodeRefs The node reference or the array of node references of unselected nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the outlining state of the node.
	 *
	 * If a single node reference is passed to the method then a single outlining state is returned.<br/>
	 * If an array of node references is passed to the method then an array of outlining states is returned.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getOutliningState
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is outlined, <code>false</code> otherwise.
	 * @public
	 */


	/**
	 * Sets or resets the outlining state of the nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setOutliningStates
	 * @param {any|any[]} outlinedNodeRefs The node reference or the array of node references of outlined nodes.
	 * @param {any|any[]} unoutlinedNodeRefs The node reference or the array of node references of unoutlined nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress outlineChanged event.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the opacity of the node.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getOpacity
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {float|float[]} A single value or an array of values. Value <code>null</code> means that the node's own opacity should be used.
	 * @public
	 */

	/**
	 * Sets the opacity of the nodes.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setOpacity
	 * @param {any|any[]}       nodeRefs          The node reference or the array of node references.
	 * @param {float|null}      opacity           The new opacity of the nodes. If <code>null</code> is passed then the opacity is reset
	 *                                            and the node's own opacity should be used.
	 * @param {boolean}         [recursive=false] The flags indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the tint color of the node.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getTintColor
	 * @param {any|any[]}       nodeRefs             The node reference or the array of node references.
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the tint color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|sap.ui.core.CSSColor[]|int|int[]}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */

	/**
	 * Sets the tint color of the nodes.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setTintColor
	 * @param {any|any[]}                   nodeRefs          The node reference or the array of node references.
	 * @param {sap.ui.core.CSSColor|int|null} tintColor       The new tint color of the nodes. The value can be defined as a string
	 *                                                        in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                        is passed then the tint color is reset and the node's own tint color should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate recursively to child nodes.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the decomposed node local transformation matrix.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getTransformation
	 * @param {any|any[]} nodeRef The node reference.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @public
	 */

	/**
	 * Gets the node transformation translation component.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getTranslation
	 * @param {any} nodeRef The node reference.
	 * @returns {float[]|Array<Array<float>>} vector A translation component of node's transformation matrix.
	 * @public
	 */

	/**
	 * Gets the node transformation scale component.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getScale
	 * @param {any|any[]} nodeRef The node reference.
	 * @returns {float[]|Array<Array<float>>} vector A scale component of node's transformation matrix.
	 * @public
	 */

	/**
	 * Gets the node transformation rotation component in specified format.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getRotation
	 * @param {any|any[]} nodeRef The node reference or the array of node references.
	 * @param {sap.ui.vk.RotationType} rotationType Rotation representation type.
	 * @returns {float[]|Array<Array<float>>} vector A rotation component of node(s) transformation matrix.
	 * @public
	 */

	/**
	 * Sets the node transformation components.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setTransformation
	 * @param {any|any[]} nodeRef The node reference.
	 * @param {any|any[]} transformations Node's transformation matrix or it components or array of such.
	 *                                    Each object should contain one transform matrix or exactly one of angleAxis, euler or quaternion components.
	 * @param {float[]} [transformation.transform] 12-element array representing 4 x 3 transformation matrix stored row-wise, or
	 * @param {float[]} transformation.translation translation component.
	 * @param {float[]} transformation.scale scale component.
	 * @param {float[]} [transformation.angleAxis] rotation component as angle-axis, or
	 * @param {float[]} [transformation.euler] rotation component as Euler angles, or
	 * @param {float[]} [transformation.quaternion] rotation component as quaternion.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Gets the decomposed node transformation matrix under world coordinates.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getTransformationWorld
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */

	/**
	 * Sets node joints.
	 * This method will add new joints into View State Manager. If child node is already specified as a child of another parent node
	 * that joint will be removed.
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setJoints
	 * @param {any[]}    jointData                    joint data
	 * @param {any}      jointData.parent             parent node
	 * @param {any}      jointData.node               child node
	 * @param {sap.ui.vk.AnimationPlayback} playback animation playback containing the sequence the joints belong to, optional
	 * @returns {this} <code>this</code> to allow method chaining.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */

	/**
	 * Gets node joints
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getJoints
	 *
	 * @returns {any[]} Object(s) containing joint and positioning data or <code>undefined</code> if no such joint present.
	 *
	 * @experimental Since 1.71.0 This class is experimental and might be modified or removed in future versions.
	 * @private
	 */

	/**
	 * Sets the outline color
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setOutlineColor
	 * @param {sap.ui.core.CSSColor|string|int} color The new outline color. The value can be defined as a string
	 *                                                in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                is passed then the tint color is reset and the node's own tint color should be used.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */


	/**
	 * Gets the outline color
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getOutlineColor
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the outline color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */

	/**
	 * Sets the outline width
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setOutlineWidth
	 * @param {float} width                     width of outline
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */


	/**
	 * Gets the outline width
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getOutlineWidth
	 * @returns {float} width of outline
	 * @public
	 */

	/**
	 * Enumerates IDs of the outlined nodes.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#enumerateOutlinedNodes
	 * @param {function} callback A function to call when the outlined nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Set highlight display state.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setHighlightDisplayState
	 * @param {sap.ui.vk.HighlightDisplayState} state for playing highlight - playing, pausing, and stopped
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Copy node's current transformation into its rest transformation stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#updateRestTransformation
	 * @param {any} nodeRef The node reference.
	 * @param {boolean} doNotFireSequenceChanged Do not trigger the sequence changed event in case other node references are not updated.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Replace node's current transformation with its rest transformation stored in active view..
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#restoreRestTransformation
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	/**
	 * Set node's rest transformation stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setRestTransformation
	 * @param {any} nodeRef The node reference.
	 * @param {float[]} translation vector for position, array of size 3.
	 * @param {float[]} quaternion quaternion for rotation, array of size 4.
	 * @param {float[]} scale vector for scaling, array of size 3.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Get node's rest transformation stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getRestTransformation
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */

	/**
	 * Set translation/scale/rotation/opacity values came from animation interpolation to a node.
	 * These values are used by various tools and for effective opacity calculations.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setInterpolatedRelativeValues
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

	/**
	 * Get total opacity - product of all the ancestors' opacities and its own opacity
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManageBaser#getTotalOpacity
	 * @param {any} nodeRef The node reference of the opacity track
	 * @returns {float} total opacity
	 * @private
	 */

	/**
	 * Set total opacity using current opacity - product of all the ancestors' opacities and its own opacity
	 * The node's opacity is re-calculated based on the total opacity
	 * if the parent's total opacity is zero, the node's total opacity is zero, the node's opacity is not changed
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setTotalOpacity
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} totalOpacity product of all the ancestors' opacities and its own opacity
	 * @returns {any} object contains <code>opacity</code> and <code>totalOpacity</code>
	 * @private
	 */

	/**
	 * Get node's opacity stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#getRestOpacity
	 * @param {any} nodeRef The node reference.
	 * @returns {float} node opacity
	 * @private
	 */

	/**
	 * Set node's opacity stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManageBaser#setRestOpacity
	 * @param {any} nodeRef The node reference.
	 * @param {float} opacity The node opacity
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Replace node's current opacity with its rest opacity stored in active view..
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#restoreRestOpacity
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Copy node's current opacity into its rest opacity stored in active view.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#updateRestOpacity
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */

	/**
	 * Add key to a translation track according to the current node position
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setTranslationKey
	 * @param {any} nodeRef The node reference of the translation track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationSequence} sequence The animation sequence containing the translate track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 *          {float[]} <code>keyValue</code> translation relative to end position of previous sequence
	 *          {float[]} <code>absoluteValue</code> node translation
	 *          {any} <code>PreviousTrack</code> array of keys (time and value)
	 *          {any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */

	/**
	 * Add key to a scale track according to the current node scale
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setScaleKey
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationSequence} sequence The animation sequence containing the scale track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 *          {float[]} <code>keyValue</code> scale relative to end position of previous sequence
	 *          {float[]} <code>absoluteValue</code> scale
	 *          {any} <code>PreviousTrack</code> array of keys (time and value)
	 *          {any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */

	/**
	 * Add key to a scale track according to the current node scale
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManager#setRotationKey
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {float[]} euler The euler rotation relative to the end position of previous sequence or rest position for the first sequence
	 * @param {sap.ui.vk.AnimationSequence} sequence The animation sequence containing the scale track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 *          {float[]} <code>keyValue</code> euler rotation relative to end position of previous sequence
	 *          {float[]} <code>offset</code> quaternion of end position of previous sequence relative to rest position
	 *          {float[]} <code>absoluteValue</code> quaternion rotation
	 *          {any} <code>PreviousTrack</code> array of keys (time and value)
	 *          {any} <code>CurrentTrack</code> array of keys (time and value)
	 *
	 * @private
	 */

	/**
	 * Add key to a opacity track according to the opacity of current node
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setOpacityKey
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationSequence} sequence The animation sequence containing the opacity track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 *          {float} <code>keyValue</code> scale relative to rest position
	 *          {float} <code>totalOpacity</code> scale
	 *          {any} <code>PreviousTrack</code> array of keys (time and value)
	 *          {any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */

	/**
	 * Gets the <code>selectable</code> property of the nodes.
	 *
	 * <em>Selectable</em> nodes can be selected in the viewport by mouse click or by using a
	 * selection tool. This property does not affect rendering.
	 *
	 * By default nodes are <em>selectable</em>.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {float|float[]} A single value or an array of values. Value <code>null</code> means that the node's own
	 *                          <code>selectable</code> property should be used.
	 * @public
	 * @experimental Since 1.111.0 This method is experimental and might be modified or removed in future versions.
	 */
	ViewStateManagerBase.prototype.getSelectable = function(nodeRefs) {
		// Return default value which is `true`.
		if (Array.isArray(nodeRefs)) {
			return new Array(nodeRefs.length).fill(true);
		} else {
			return true;
		}
	};

	/** Sets the <code>selectable</code> property of the nodes.
	 *
	 * <em>Selectable</em> nodes can be selected in the viewport by mouse click or by using a
	 * selection tool. This property does not affect rendering.
	 *
	 * By default nodes are <em>selectable</em>.
	 *
	 * If a grouping node is <em>unselectable</em> then all its descendant nodes are
	 * <em>unselectable</em> too. If a grouping node is <em>selectable</em> then its descendants can
	 * be either <em>selectable</em> or <em>unselectable</em> based on their <code>selectable</code>
	 * property.
	 *
	 * @function
	 * @name sap.ui.vk.ViewStateManagerBase#setSelectable
	 * @param {any|any[]}    nodeRefs   The node reference or the array of node references.
	 * @param {boolean|null} selectable The new value of the <code>selectable</code> property. If <code>null</code> is
	 *                                  passed then the <code>selectable</code> property is reset and the value of the
	 *                                  node's own <code>selectable</code> property is in use.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @experimental Since 1.111.0 This method is experimental and might be modified or removed in future versions.
	 */
	ViewStateManagerBase.prototype.setSelectable = function(nodeRefs, selectable) {
		// Do nothing.
		return this;
	};

	return ViewStateManagerBase;
});
