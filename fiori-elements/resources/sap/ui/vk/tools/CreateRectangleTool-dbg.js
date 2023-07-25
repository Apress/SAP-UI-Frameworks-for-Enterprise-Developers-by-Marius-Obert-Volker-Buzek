/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateRectangleTool
sap.ui.define([
	"../library",
	"./Tool",
	"./CreateRectangleToolHandler",
	"./CreateRectangleToolGizmo"
], function(
	vkLibrary,
	Tool,
	CreateRectangleToolHandler,
	CreateRectangleToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new CreateRectangleTool.
	 *
	 * @class
	 * The CreateRectangleTool allows applications to create a rectangle/square svg element.

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.CreateRectangleTool
	 */
	var CreateRectangleTool = Tool.extend("sap.ui.vk.tools.CreateRectangleTool", /** @lends sap.ui.vk.tools.CreateRectangleTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Parent node for the rectangle that will be created.
				 */
				parentNode: {
					type: "any",
					defaultValue: null
				},
				/**
				 * Indicates that the tool creates a square instead of a rectangle.
				 */
				uniformMode: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				/**
				 * Fired when a new element is created.
				 */
				completed: {
					parameters: {
						/**
						 * Created node.
						 *
						 * node.sid - node's sid
						 * node.nodeContentType - node content type
						 * node.materialId - assigned material sid
						 * node.name - node's name
						 * node.matrix - node transformation matrix
						 * node.parametric - index of created parametric object in parametrics array
						 */
						node: { type: "any" },
						/**
						 * Request payload for a storage server to create a parametric primitive.
						 */
						request: { type: "any" }
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (CreateRectangleTool._instance) {
				return CreateRectangleTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new CreateRectangleToolHandler(this);

			CreateRectangleTool._instance = this;
		}
	});

	// Override initialization method
	CreateRectangleTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.svg.Viewport"]);

		this.setAggregation("gizmo", new CreateRectangleToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	CreateRectangleTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
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

	/**
	 * Sets the material, lineStyle and fillStyle for the rectangle that will be created.
	 * @param {object} material Material.
	 * @param {object} lineStyle Line style.
	 * @param {object} fillStyle Fill style.
	 */
	CreateRectangleTool.prototype.setMaterial = function(material, lineStyle, fillStyle) {
		this._material = material;
		this._lineStyle = lineStyle;
		this._fillStyle = fillStyle;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	CreateRectangleTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.svg.Viewport")) {
				command();
			}
		}
		return this;
	};

	// Override the parentNode property setter
	CreateRectangleTool.prototype.setParentNode = function(value) {
		if (value === this.getParentNode()) {
			return this;
		}

		this.setProperty("parentNode", value, true);

		if (this._gizmo) {
			this._gizmo.updateParentNode();
		}
		return this;
	};

	return CreateRectangleTool;
});
