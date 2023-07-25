/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TooltipTool
sap.ui.define([
	"./Tool",
	"./TooltipToolHandler",
	"./TooltipToolGizmo"
], function(
	Tool,
	TooltipToolHandler,
	TooltipToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new TooltipTool.
	 *
	 * @class
	 * The TooltipTool allows applications to display custom tooltip text on top of 3D object over which pointer is hovering

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.TooltipTool
	 */
	var TooltipTool = Tool.extend("sap.ui.vk.tools.TooltipTool", /** @lends sap.ui.vk.tools.TooltipTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				followCursor: {
					type: "boolean",
					defaultValue: true
				},
				animate: {
					type: "boolean",
					defaultValue: false
				},
				offsetX: {
					type: "float",
					defaultValue: 10
				},
				offsetY: {
					type: "float",
					defaultValue: 15
				}
			},
			events: {
				/**
				 * This event will be fired when mouse hover occurs.
				 */
				hover: {
					parameters: {
						x: "int",
						y: "int",
						nodeRef: "any"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (TooltipTool._instance) {
				return TooltipTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new TooltipToolHandler(this);

			TooltipTool._instance = this;
		}
	});

	TooltipTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);

		this.setAggregation("gizmo", new TooltipToolGizmo());
	};

	TooltipTool.prototype.setAnimate = function(val) {
		this.setProperty("animate", val);

		var gizmo = this.getGizmo();
		gizmo.rerender();
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	TooltipTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show(this._viewport, this);
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
	 * Sets the tooltip title
	 *
	 * @param {string} [title] Title
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	TooltipTool.prototype.setTitle = function(title) {
		if (this._gizmo) {
			this._gizmo.setTitle(title);
		}
		return this;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	TooltipTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			var footprint = this.getFootprint();
			for (var n = 0; n < footprint.length; n++) {
				if (this.isViewportType(footprint[n])) {
					command();
					break;
				}
			}
		}
		return this;
	};

	return TooltipTool;
});
