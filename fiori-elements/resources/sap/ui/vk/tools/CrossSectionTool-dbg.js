/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CrossSectionTool
sap.ui.define([
	"./Tool",
	"./CrossSectionToolHandler",
	"./CrossSectionToolGizmo"
], function(
	Tool,
	CrossSectionToolHandler,
	CrossSectionToolGizmo
) {
	"use strict";

	/**
	 * Constructor for a new CrossSectionTool.
	 *
	 * @class
	 * The CrossSection tool can be used to cut all 3D objects along one of three spatial axis to expose their internal structures.

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.CrossSectionTool
	 */
	var CrossSectionTool = Tool.extend("sap.ui.vk.tools.CrossSectionTool", /** @lends sap.ui.vk.tools.CrossSectionTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Display text box with current value, which can also be used to directly modify the value
				 */
				showEditingUI: {
					type: "boolean",
					defaultValue: false
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (CrossSectionTool._instance) {
				return CrossSectionTool._instance;
			}

			Tool.apply(this, arguments);

			// Configure dependencies
			this._viewport = null;
			this._handler = new CrossSectionToolHandler(this);
			this._gizmo = null;

			CrossSectionTool._instance = this;
		}
	});

	CrossSectionTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}

		// set footprint for tool
		this.setFootprint(["sap.ui.vk.threejs.Viewport"]);

		this.setAggregation("gizmo", new CrossSectionToolGizmo());
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	CrossSectionTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				this._gizmo.show(this._viewport, this);

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
	 * Sets the clipping plane axis.
	 *
	 * @param {number} [index] Axis index from 0 to 2: 0 - X, 1 - Y, 2 - Z.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	CrossSectionTool.prototype.setAxis = function(index) {
		if (this._gizmo) {
			this._gizmo.setAxis(index);
		}
		return this;
	};

	/**
	 * Flips the clipping plane.
	 *
	 * @param {boolean} [flip] If set to <code>true</code>, the clipping plane will be flipped.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	CrossSectionTool.prototype.setFlip = function(flip) {
		if (this._gizmo) {
			this._gizmo.setFlip(flip);
		}
		return this;
	};

	CrossSectionTool.prototype.getFlip = function() {
		return this._gizmo ? this._gizmo._flip : undefined;
	};

	CrossSectionTool.prototype.setShowEditingUI = function(value) {
		this.setProperty("showEditingUI", value, true);
		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	/** MOVE TO BASE
	 * Queues a command for execution during the rendering cycle. All gesture operations should be called using this method.
	 *
	 * @param {function} command The command to be executed.
	 * @returns {sap.ui.vk.Viewport} this
	 * @public
	 */
	CrossSectionTool.prototype.queueCommand = function(command) {
		if (this._addLocoHandler()) {
			if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
				command();
			}
		}
		return this;
	};

	CrossSectionTool.prototype.destroy = function() {
		// Destroy tool resources
		Tool.prototype.destroy.call(this);

		this._viewport = null;
		delete CrossSectionTool._instance;
	};

	return CrossSectionTool;
});
