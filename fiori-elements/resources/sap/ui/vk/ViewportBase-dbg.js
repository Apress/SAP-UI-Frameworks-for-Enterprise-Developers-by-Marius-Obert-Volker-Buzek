/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ViewportBase.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"./tools/Tool",
	"./library",
	"./Core",
	"./SelectionMode",
	"./SelectionDisplayMode",
	"./RenderMode",
	"./SafeArea"
], function(
	Control,
	core,
	Tool,
	vkLibrary,
	vkCore,
	SelectionMode,
	SelectionDisplayMode,
	RenderMode,
	SafeArea
) {
	"use strict";

	/**
	 * Constructor for a new Viewport.
	 *
	 * @class
	 * Provides a rendering canvas for the 3D elements of a loaded scene.
	 *
	 * @param {string} [sId] ID for the new Viewport control. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new Viewport control.
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.ViewportBase
	 * @since 1.50.0
	 */
	var ViewportBase = Control.extend("sap.ui.vk.ViewportBase", /** @lends sap.ui.vk.ViewportBase.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			"abstract": true,

			properties: {
				/**
				 * Shows or hides the debug info.
				 */
				showDebugInfo: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Viewport background top color in the CSS Color format
				 */
				backgroundColorTop: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(50, 50, 50, 1)" // dark grey
				},

				/**
				 * Viewport background bottom color in the CSS Color format
				 */
				backgroundColorBottom: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(255, 255, 255, 1)" // white
				},

				/**
				 * Viewport width
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Viewport height
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Selection mode
				 */
				selectionMode: {
					type: "sap.ui.vk.SelectionMode",
					defaultValue: SelectionMode.Sticky
				},

				/**
				 * Selection display mode
				 */
				selectionDisplayMode: {
					type: "sap.ui.vk.SelectionDisplayMode",
					defaultValue: SelectionDisplayMode.Highlight
				},

				/**
				 * Show selection bounding boxes
				 */
				showSelectionBoundingBoxes: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Freeze camera
				 */
				freezeCamera: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Viewport render mode
				 */
				renderMode: {
					type: "sap.ui.vk.RenderMode",
					defaultValue: RenderMode.Default
				},

				/**
				 * Shows or hides the Safe Area
				 */
				showSafeArea: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Enables or disables showing of all hotspots
				 */
				showAllHotspots: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Disables hotspot hovering
				 */
				disableHotspotHovering: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Color used for highlighting hotspots in the ABGR format
				 */
				hotspotColorABGR: {
					type: "int",
					defaultValue: 0x590000BB
				},

				/**
				 * Color used for highlighting hotspots in the CSS Color format
				 */
				hotspotColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(89, 0, 0, 0.73)"
				},

				/*
				 * Enables or disables output size
				 */
				keepOutputSize: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Color used to highlight all hotspots when the showAllHotspots property has a value of true.
				 */
				showAllHotspotsTintColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(255, 255, 0, .35)"
				},

				/**
				 * Automatically start rendering
				 * This will allow client code to control if viewport rendering should commence automatically or not.
				 */
				autoStartRendering: {
					type: "boolean",
					defaultValue: true
				}
			},

			associations: {
				/**
				 * An association to the <code>ContentConnector</code> instance that manages content resources.
				 */
				contentConnector: {
					type: "sap.ui.vk.ContentConnector",
					multiple: false
				},

				/**
				 * An association to the <code>ViewStateManager</code> instance.
				 */
				viewStateManager: {
					type: "sap.ui.vk.ViewStateManagerBase",
					multiple: false
				},
				/**
				 * The tools of this viewport.
				 */
				tools: {
					type: "sap.ui.vk.tools.Tool",
					multiple: true
				}
			},

			aggregations: {
				/**
				 * The controls inside the viewport.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				/**
				 * SafeArea control for viewport
				 */
				safeArea: {
					type: "sap.ui.vk.SafeArea",
					multiple: false
				},
				/**
				 * HTML Annotations present in the active view
				 */
				annotations: {
					type: "sap.ui.vk.Annotation",
					multiple: true
				},
				/**
				 * Output size settings of the viewport
				 */
				outputSettings: {
					type: "sap.ui.vk.OutputSettings",
					multiple: false
				}
			},

			events: {
				/**
				 * This event is fired when a URL in a note is clicked.
				 */
				urlClicked: {
					parameters: {
						/**
						 * Returns a node reference of the note that contains the URL.
						 */
						nodeRef: "any",
						/**
						 * Returns a URL that was clicked.
						 */
						url: "string"
					},
					enableEventBubbling: true
				},
				/**
				 * This event will be fired when a node is clicked.
				 */
				nodeClicked: {
					parameters: {
						/**
						 * Returns a node reference.
						 */
						nodeRef: "any",
						x: "int",
						y: "int"
					},
					enableEventBubbling: true
				},
				/**
				 * This event is fired when viewport size is changed.
				 */
				resize: {
					parameters: {
						/**
						 * Returns the width and height of new size <code>\{ width: number, height: number \}</code> in CSS pixels.
						 */
						size: "object"
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when nodes in the scene are picked by user action.
				 * If application requires different selection behaviour then it can handle this event and implement its own selection method.
				 * In this case {@link sap.ui.vk.Viewport#selectionMode selectionMode} property should be set to <code>sap.ui.vk.SelectionMode.None</code>
				 * Application can modify list of picked node references to alter selection behaviour.
				 */
				nodesPicked: {
					parameters: {
						/**
						 * References of the nodes that are picked.
						 */
						picked: {
							type: "any[]"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when a node in the scene is zoomed in/out by double-clicking.
				 */
				nodeZoomed: {
					parameters: {
						/**
						 * Reference of the node that is zoomed.
						 */
						zoomed: {
							type: "any"
						},
						/**
						 * True for zoom in, and false for zoom out.
						 */
						isZoomIn: {
							type: "boolean"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when a view in the viewport is activated
				 */
				viewActivated: {
					parameters: {
						/**
						 * Index of the activated view
						 */
						viewIndex: "int",

						/**
						 * The activated view
						 */
						view: "sap.ui.vk.View",

						/**
						 * The type of content loaded into the Viewport (for example: 2D, 3D).
						 */
						type: {
							type: "string"
						}
					},
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the current procedure is done playing
				 * @private
				 */
				procedureFinished: {
					enableEventBubbling: true
				},

				/**
				 * This event is fired when the current view is done playing
				 * @private
				 */
				viewFinished: {
					parameters: {
						viewIndex: "int"
					},
					enableEventBubbling: true
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	var basePrototype = ViewportBase.getMetadata().getParent().getClass().prototype;

	ViewportBase.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		if (this.getSafeArea() == null) {
			this.setSafeArea(new SafeArea());
		}
		this._camera = null;
	};

	ViewportBase.prototype.exit = function() {
		if (this._camera) {
			var contentConnector = core.byId(this.getContentConnector());
			if (contentConnector) {
				var contentManager = contentConnector.getContentManager();
				if (contentManager) {
					contentManager.destroyCamera(this._camera);
				}
				this._camera = null;
			}
		}

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
	};

	ViewportBase.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(contentConnector.getContent());
	};

	ViewportBase.prototype.onUnsetContentConnector = function(contentConnector) {
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
		this._setContent(null);
		this.setCamera(null);
	};

	ViewportBase.prototype._onContentReplaced = function(event) {
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
	ViewportBase.prototype._setContent = function(content) {
		// If there is no explicitly assigned view state manager then use the content connector's default one.
		if (content && !this.getViewStateManager()) {
			var contentConnector = core.byId(this.getContentConnector());
			if (contentConnector) {
				var defaultViewStateManager = contentConnector.getDefaultViewStateManager();
				if (defaultViewStateManager) {
					this.setViewStateManager(defaultViewStateManager);
				}
			}
		}

		return this;
	};

	ViewportBase.prototype.addTool = function(tool) {
		this.addAssociation("tools", tool);

		tool = tool instanceof Tool ? tool : core.byId(tool);
		tool.setViewport(this);
	};

	/**
	 * Returns viewport content as an image of desired size.
	 *
	 * @param {int} width Requested image width in pixels (allowed values 8 to 2048)
	 * @param {int} height Requested image height in pixels (allowed values 8 to 2048)
	 * @returns {string} Base64 encoded PNG image
	 */
	ViewportBase.prototype.getImage = function(width, height) {
		return null;
	};

	/**
	 * Helper method to provide "sticky" selection method. If this method is used then nodes are
	 * added into selection if they were not selected before, otherwise they are removed from selection.
	 * If this is called with empty nodes list then all already selected nodes are deselected.
	 *
	 * @param {any[]} nodes Array of node references
	 * @protected
	 */
	ViewportBase.prototype.stickySelectionHandler = function(nodes) {
		if (this._viewStateManager == null) {
			return;
		}

		if (nodes.length === 0) {
			// Clear selection.
			var currentlySelected = [];
			if (this.getSelectionDisplayMode() === SelectionDisplayMode.Outline) {
				this._viewStateManager.enumerateOutlinedNodes(function(selectedNode) {
					currentlySelected.push(selectedNode);
				});
				if (currentlySelected.length > 0) {
					this._viewStateManager.setOutliningStates([], currentlySelected);
				}
			} else {
				this._viewStateManager.enumerateSelection(function(selectedNode) {
					currentlySelected.push(selectedNode);
				});
				if (currentlySelected.length > 0) {
					this._viewStateManager.setSelectionStates([], currentlySelected);
				}
			}
		} else {
			var select = [];
			var deselect = [];
			var isSelected, ni;
			if (this.getSelectionDisplayMode() === SelectionDisplayMode.Outline) {
				isSelected = this._viewStateManager.getOutliningState(nodes);
				for (ni = 0; ni < isSelected.length; ni++) {
					if (isSelected[ni]) {
						deselect.push(nodes[ni]);
					} else {
						select.push(nodes[ni]);
					}
				}
				this._viewStateManager.setOutliningStates(select, deselect);
			} else {
				isSelected = this._viewStateManager.getSelectionState(nodes);
				for (ni = 0; ni < isSelected.length; ni++) {
					if (isSelected[ni]) {
						deselect.push(nodes[ni]);
					} else {
						select.push(nodes[ni]);
					}
				}
				this._viewStateManager.setSelectionStates(select, deselect);
			}
		}
	};

	/**
	 * Helper method used to provide exclusive selection method. If this method is used then nodes are
	 * marked as selected while all previously selected objects are deselected.
	 * If this is called with empty nodes list then all already selected nodes are deselected.
	 *
	 * @param {any[]} nodes Array of node references
	 * @protected
	 */
	ViewportBase.prototype.exclusiveSelectionHandler = function(nodes) {
		if (this._viewStateManager == null) {
			return;
		}

		var notInCurrentSelection = true;
		if (nodes.length === 1) {
			notInCurrentSelection = !this._viewStateManager.getSelectionState(nodes[0]);
		} else if (nodes.length > 1) {
			var isSelected;
			if (this.getSelectionDisplayMode() === SelectionDisplayMode.Outline) {
				isSelected = this._viewStateManager.getOutliningState(nodes);
			} else {
				isSelected = this._viewStateManager.getSelectionState(nodes);
			}
			for (var ni = 0; ni < isSelected.length; ni++) {
				if (isSelected[ni]) {
					notInCurrentSelection = false;
					break;
				}
			}
		}

		var unselected = [];
		if (nodes.length === 0 || notInCurrentSelection) {
			// Clear selection.
			if (this.getSelectionDisplayMode() === SelectionDisplayMode.Outline) {
				this._viewStateManager.enumerateOutlinedNodes(function(selectedNode) {
					unselected.push(selectedNode);
				});
			} else {
				this._viewStateManager.enumerateSelection(function(selectedNode) {
					unselected.push(selectedNode);
				});
			}

		}
		if (this.getSelectionDisplayMode() === SelectionDisplayMode.Outline) {
			this._viewStateManager.setOutliningStates(nodes, unselected);
		} else {
			this._viewStateManager.setSelectionStates(nodes, unselected);
		}
	};

	/**
	 * Sets current camera to the viewport
	 *
	 * @param {sap.ui.vk.Camera} camera
	 * If the <code>camera</code> parameter is not <code>null</code>, the camera is replaced.
	 * If the <code>camera</code> parameter is <code>null</code>, the current camera is destroyed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 * @since 1.52.0
	 */
	ViewportBase.prototype.setCamera = function(camera) {

		if (camera !== this._camera) {
			var contentConnector = core.byId(this.getContentConnector());
			if (this._camera && contentConnector) {
				var contentManager = contentConnector.getContentManager();
				if (contentManager) {
					contentManager.destroyCamera(this._camera);
				}
			}
		}
		this._camera = camera;
		return this;
	};

	/**
	 * Gets current camera to the viewport
	 *
	 * @returns {sap.ui.vk.Camera} Current camera in this viewport.
	 * @public
	 */
	ViewportBase.prototype.getCamera = function() {
		return this._camera;
	};

	/**
	 * Calls activateView with view definition
	 *
	 * @param {sap.ui.vk.View} view view object definition
	 * @param {boolean} playViewGroup true if view activation is part of playing view group
	 * @param {boolean} skipCameraTransitionAnimation true if not animating the change of camera
	 * @returns {sap.ui.vk.ViewportBase} return this
	 * @public
	 */
	ViewportBase.prototype.activateView = function(view, playViewGroup, skipCameraTransitionAnimation) {
		return this;
	};


	/**
	 * Performs a <code>pan</code> gesture to pan across the Viewport.
	 *
	 * @param {int} dx The change in distance along the x-coordinate.
	 * @param {int} dy The change in distance along the y-coordinate.
	 * @returns {sap.ui.vk.ViewportBase} return this
	 * @public
	 */
	ViewportBase.prototype.pan = function(dx, dy) {
		return this;
	};

	/**
	 * Rotates the content resource displayed on the Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.ViewportBase} return this
	 * @public
	 */
	ViewportBase.prototype.rotate = function(dx, dy) {
		return this;
	};

	/**
	 * Performs a <code>zoom</code> gesture to zoom in or out on the beginGesture coordinate.
	 * @param {float} dy Zoom factor. A scale factor that specifies how much to zoom in or out by.
	 * @returns {sap.ui.vk.ViewportBase} return this
	 * @public
	 */
	ViewportBase.prototype.zoom = function(dy) {
		return this;
	};

	/**
	 * Project 3D point to screen space
	 * @param {float} x X coordinate in world space
	 * @param {float} y Y coordinate in world space
	 * @param {float} z Z coordinate in world space
	 * @param {sap.ui.vk.Camera} camera Camera to be used with calculation of projection
	 * @private
	 * @returns {object} Object with x and y screen coordinates in pixels of projected point.
	 * Third parameter 'depth' is distance from the point to the camera normalized to camera's frustrum (range from -1 to +1).
	 * More information about normalized depth can be found here: {@link https://learnopengl.com/Getting-started/Coordinate-Systems}
	 */
	ViewportBase.prototype.projectToScreen = function(x, y, z, camera) {
		return { x: 0, y: 0, depth: 0 };
	};

	/**
	 * Convert screen rectangle coordinates and size (in pixels) into coordinates and size relative to safe area in range -0.5 to +0.5
	 * @param {int} x Horizontal position in screen pixels
	 * @param {int} y Vertical position in screen pixels
	 * @param {int} width Rectangle width in screen pixels
	 * @param {int} height Rectangle height in screen pixels
	 * @return {object} Object with converted x, y, width and height in normalized units
	 * @private
	 */
	ViewportBase.prototype.normalizeRectangle = function(x, y, width, height) {
		return { x: 0, y: 0, width: 0, height: 0 };
	};

	/**
	 * Convert normalized coordinates and size (relative to safe area in range -0.5 to +0.5) into screen rectangle coordinates and size (in pixels)
	 * @param {int} x Horizontal position
	 * @param {int} y Vertical position
	 * @param {int} width Rectangle width
	 * @param {int} height Rectangle height
	 * @return {object} Object with converted x, y, width and height in screen pixels
	 * @private
	 */
	ViewportBase.prototype.deNormalizeRectangle = function(x, y, width, height) {
		return { x: 0, y: 0, width: 0, height: 0 };
	};

	/**
	 * Renders viewport tools.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @protected
	 */
	ViewportBase.prototype.renderTools = function(rm) {
		// Render gizmos of active tools
		var tools = this.getTools();
		for (var i = 0, l = tools.length; i < l; i++) { // loop over all oTools
			var tool = core.byId(tools[i]); // get control for associated control
			var gizmo = tool.getGizmoForContainer(this);
			if (gizmo && gizmo.hasDomElement()) {
				rm.renderControl(gizmo);
			}
		}
	};

	/**
	 * Renders viewport content.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @protected
	 */
	ViewportBase.prototype.renderContent = function(rm) {
		var content = this.getContent();
		for (var i = 0, l = content.length; i < l; i++) {
			rm.renderControl(content[i]);
		}
	};

	ViewportBase.prototype.getMeasurementSurface = function() {
		return null;
	};

	return ViewportBase;
});
