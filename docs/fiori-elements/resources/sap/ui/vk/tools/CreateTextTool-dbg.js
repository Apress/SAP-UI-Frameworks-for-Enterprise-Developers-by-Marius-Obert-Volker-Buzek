/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateTextTool
sap.ui.define([
	"./Tool",
	"./CreateTextToolHandler",
	"./CreateTextToolGizmo"
], function(
	Tool,
	CreateTextToolHandler,
	CreateTextToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new CreateTextTool.
	 *
	 * @class
	 * The CreateTextTool allows applications to create a text svg element.

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.CreateTextTool
	 */
	var CreateTextTool = Tool.extend("sap.ui.vk.tools.CreateTextTool", /** @lends sap.ui.vk.tools.CreateTextTool.prototype */ {
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
				 * Font size
				 */
				fontSize: {
					type: "string",
					defaultValue: "14"
				},
				/**
				 * Font face
				 */
				fontFace: {
					type: "string",
					defaultValue: "Verdana,Arial,Helvetica,sans-serif"
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
			if (CreateTextTool._instance) {
				return CreateTextTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new CreateTextToolHandler(this);

			CreateTextTool._instance = this;
		}
	});

	// Override initialization method
	CreateTextTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.svg.Viewport"]);

		this.setAggregation("gizmo", new CreateTextToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	CreateTextTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
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
	 * Sets the material, lineStyle and fillStyle for the text element that will be created.
	 * @param {object} material Material.
	 * @param {object} lineStyle Line style.
	 * @param {object} fillStyle Fill style.
	 */
	CreateTextTool.prototype.setMaterial = function(material, lineStyle, fillStyle) {
		this._material = material;
		this._lineStyle = lineStyle;
		this._fillStyle = fillStyle;
	};

	/**
	 * Opens a text editor for the given text element.
	 * @param {object} textElement Text element to edit.
	 * @private
	 */
	CreateTextTool.prototype._editText = function(textElement) {
		if (this._gizmo) {
			this._gizmo._editText(textElement);
		}
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	CreateTextTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.svg.Viewport")) {
				command();
			}
		}
		return this;
	};

	// Override the parentNode property setter
	CreateTextTool.prototype.setParentNode = function(value) {
		if (value === this.getParentNode()) {
			return this;
		}

		this.setProperty("parentNode", value, true);

		if (this._gizmo) {
			this._gizmo.updateParentNode();
		}
		return this;
	};

	return CreateTextTool;
});
