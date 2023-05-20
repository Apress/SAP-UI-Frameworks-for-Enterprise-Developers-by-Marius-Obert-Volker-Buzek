/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.SceneOrientationTool
sap.ui.define([
	"./Tool",
	"./SceneOrientationToolGizmo"
], function(
	Tool,
	SceneOrientationToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new SceneOrientationTool.
	 *
	 * @class
	 * Tool to display current scene orientation and to provide pre-defined camera positions

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.SceneOrientationTool
	 */
	var SceneOrientationTool = Tool.extend("sap.ui.vk.tools.SceneOrientationTool", /** @lends sap.ui.vk.tools.SceneOrientationTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				enablePredefinedViews: {
					type: "boolean",
					defaultValue: true
				},
				enableInitialView: {
					type: "boolean",
					defaultValue: true
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (SceneOrientationTool._instance) {
				return SceneOrientationTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._menu = null;

			SceneOrientationTool._instance = this;
		}
	});

	SceneOrientationTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		this.setAggregation("gizmo", new SceneOrientationToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	SceneOrientationTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		this.getGizmo()._viewport = this._viewport;

		return this;
	};

	/**
	 * Performs camera "fly to" animation to the predefined view.
	 *
	 * @param {sap.ui.vk.tools.PredefinedView} [view] Predefined view.
	 * @param {number} [milliseconds] Time to perform the "fly to" animation.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneOrientationTool.prototype.setView = function(view, milliseconds) {
		this.getGizmo().setView(view, milliseconds);
		return this;
	};

	SceneOrientationTool.prototype.setEnableInitialView = function(value) {
		this.setProperty("enableInitialView", value);
		this.getGizmo().setEnableInitialView(value);
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneOrientationTool.prototype.queueCommand = function(command) {
		if (this.isViewportType("sap.ui.vk.dvl.Viewport")) {
			if (this._dvlRendererId) {
				this._dvl.Renderer._queueCommand(command, this._dvlRendererId);
			}
		} else if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
			command();
		}
		return this;
	};

	SceneOrientationTool.prototype.destroy = function() {
		// Destroy tool resources
		Tool.prototype.destroy.call(this);

		this._viewport = null;
		delete SceneOrientationTool._instance;
	};

	return SceneOrientationTool;
});
