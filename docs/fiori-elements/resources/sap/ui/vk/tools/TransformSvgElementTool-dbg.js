/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TransformSvgElementTool
sap.ui.define([
	"sap/base/Log",
	"../library",
	"./Tool",
	"./TransformSvgElementToolHandler",
	"./TransformSvgElementToolGizmo",
	"./ToolNodeSet",
	"../svg/Rectangle"
], function(
	Log,
	vkLibrary,
	Tool,
	TransformSvgElementToolHandler,
	TransformSvgElementToolGizmo,
	ToolNodeSet,
	Rectangle
) {
	"use strict";

	/**
	 * Constructor for a new TransformSvgElementTool.
	 *
	 * @class
	 * The TransformSvgElementTool allows applications to transform an svg element.

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.TransformSvgElementTool
	 */
	var TransformSvgElementTool = Tool.extend("sap.ui.vk.tools.TransformSvgElementTool", /** @lends sap.ui.vk.tools.TransformSvgElementTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Determine what set of nodes will be transformed with this tool
				 */
				nodeSet: {
					type: "sap.ui.vk.tools.ToolNodeSet",
					defaultValue: ToolNodeSet.Highlight
				},
				/**
				 * If set to <code>true</code> then this tool will enable uniform scaling.
				 */
				uniformScaleEnabled: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				/**
				 * This event will be fired when movement occurs.
				 */
				moving: {
					parameters: {
						x: "float", // relative offset in x direction
						y: "float", // relative offset in x direction
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 * {any} node - node reference
						 * {float} x - offset in x direction
						 * {float} y - offset in y direction
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				},
				/**
				 * This event will be fired when movement finished.
				 */
				moved: {
					parameters: {
						x: "float", // relative offset in x direction
						y: "float", // relative offset in x direction
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 * {any} node - node reference
						 * {float} x - offset in x direction
						 * {float} y - offset in y direction
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				},
				/**
				 * This event will be fired when rotation occurs.
				 */
				rotating: {
					parameters: {
						angle: "float", // relative angle of rotation
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 *      {any} node - node reference
						 *      {float} angle - angle of rotation
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				},
				/**
				 * This event will be fired when rotation finished.
				 */
				rotated: {
					parameters: {
						angle: "float", // relative angle of rotation
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 *      {any} node - node reference
						 *      {float} angle - angle of rotation
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				},
				/**
				 * This event will be fired when scaling occurs.
				 */
				scaling: {
					parameters: {
						x: "float", // relative scale in x direction
						y: "float", // relative scale in y direction
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 *      {any} node - node reference
						 *      {float} x - scale in x direction
						 *      {float} y - scale in y direction
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				},
				/**
				 * This event will be fired when scaling finished.
				 */
				scaled: {
					parameters: {
						x: "float", // relative scale in x direction
						y: "float", // relative scale in y direction
						/**
						 * Array of affected nodes properties. Each object contains following properties:
						 *      {any} node - node reference
						 *      {float} x - scale in x direction
						 *      {float} y - scale in y direction
						 */
						nodesProperties: {
							type: "any[]"
						}
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (TransformSvgElementTool._instance) {
				return TransformSvgElementTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new TransformSvgElementToolHandler(this);

			TransformSvgElementTool._instance = this;
		}
	});

	// Override initialization method
	TransformSvgElementTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.svg.Viewport"]);

		this.setAggregation("gizmo", new TransformSvgElementToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	TransformSvgElementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		var viewport = this._viewport;
		if (viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show(viewport, this);
				}

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

	// Override the nodeSet property setter to notify the gizmo when the selection has changed
	TransformSvgElementTool.prototype.setNodeSet = function(value) {
		this.setProperty("nodeSet", value, true);
		if (this._gizmo) {
			this._gizmo.handleSelectionChanged();
		}
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	TransformSvgElementTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.svg.Viewport")) {
				command();
			}
		}
		return this;
	};

	return TransformSvgElementTool;
});
