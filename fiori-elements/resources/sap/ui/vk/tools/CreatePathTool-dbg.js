/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreatePathTool
sap.ui.define([
	"../library",
	"./Tool",
	"./CreatePathToolHandler",
	"./CreatePathToolGizmo"
], function(
	vkLibrary,
	Tool,
	CreatePathToolHandler,
	CreatePathToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new CreatePathTool.
	 *
	 * @class
	 * The CreatePathTool allows applications to create a path svg element.

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.CreatePathTool
	 */
	var CreatePathTool = Tool.extend("sap.ui.vk.tools.CreatePathTool", /** @lends sap.ui.vk.tools.CreatePathTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Parent node for new elements.
				 */
				parentNode: {
					type: "any",
					defaultValue: null
				},
				/**
				 * Flag to always create closed path elements.
				 */
				closePath: {
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
						request: { type: "any" },
						/**
						 * Indicates whether the created path is closed.
						 */
						closed: "boolean"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (CreatePathTool._instance) {
				return CreatePathTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new CreatePathToolHandler(this);

			CreatePathTool._instance = this;
		}
	});

	// Override initialization method
	CreatePathTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.svg.Viewport"]);

		this.setAggregation("gizmo", new CreatePathToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	CreatePathTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
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
	 * Sets the material, lineStyle and fillStyle for the path element that will be created.
	 * @param {object} material Material.
	 * @param {object} lineStyle Line style.
	 * @param {object} fillStyle Fill style.
	 */
	CreatePathTool.prototype.setMaterial = function(material, lineStyle, fillStyle) {
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
	CreatePathTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.svg.Viewport")) {
				command();
			}
		}
		return this;
	};

	// Override the parentNode property setter
	CreatePathTool.prototype.setParentNode = function(value) {
		if (value === this.getParentNode()) {
			return this;
		}

		this.setProperty("parentNode", value, true);

		if (this._gizmo) {
			this._gizmo.updateParentNode();
		}
		return this;
	};

	return CreatePathTool;
});
