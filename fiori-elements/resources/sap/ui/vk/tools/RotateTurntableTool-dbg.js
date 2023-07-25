/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides class sap.ui.vk.tools.move.
sap.ui.define([
	"./Tool",
	"../helpers/RotateTurntableHelperDvl",
	"../helpers/RotateTurntableHelperThree"
], function(
	Tool,
	RotateTurntableHelperDvl,
	RotateTurntableHelperThree
) {
	"use strict";

	/**
	 * Constructor for a new RotateTurntableTool tool.
	 *
	 * @class
	 * Tool to rotate scene in turntable mode

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.tools.Tool
	 * @alias sap.ui.vk.tools.RotateTurntableTool
	 */
	var RotateTurntableTool = Tool.extend("sap.ui.vk.tools.RotateTurntableTool", /** @lends sap.ui.vk.tools.RotateTurntableTool.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			events: {
				/**
				 * This event will be fired when rotation occurs.
				 */
				rotate: {
					parameters: {
						dx: "int",
						dy: "int"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Treat tool instantiation as singleton
			if (RotateTurntableTool._instance) {
				return RotateTurntableTool._instance;
			}

			Tool.apply(this, arguments);

			// Set the GUID for this tool. For VIT native tools, used to avoid naming conflicts with third party tools
			this.setToolid("f271c082-676c-adc6-167f-0d5ce602aa45");

			// Configure dependencies
			this._viewport = null;
			this._rotateTurntableHelper = null;

			RotateTurntableTool._instance = this;
		}
	});

	RotateTurntableTool.prototype.init = function() {
		if (Tool.prototype.init) {
			Tool.prototype.init.call(this);
		}
		// set footprint for tool
		this.setFootprint(["sap.ui.vk.dvl.Viewport", "sap.ui.vk.threejs.Viewport"]);
	};

	// Override the active property setter so that we execute activation / deactivation code at the same time
	RotateTurntableTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		Tool.prototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				if (this._prepare()) {
					this._rotateTurntableHelper.activateTurntableMode();
				}
			} else if (this._rotateTurntableHelper) {
				this._rotateTurntableHelper.deactivateTurntableMode();
				this._rotateTurntableHelper = null;
			}
		}

		return this;
	};

	/*
	 * Checks that the execution criteria for this tool are met before execution of tool commands
	 */
	RotateTurntableTool.prototype._prepare = function() {
		if (this.isViewportType("sap.ui.vk.dvl.Viewport") && this._viewport._dvl) {
			if (this._rotateTurntableHelper == null) {
				this._dvlRendererId = this._viewport._dvlRendererId;
				this._dvl = this._viewport._dvl;
				this._rotateTurntableHelper = new RotateTurntableHelperDvl(this, this._dvl);
			}
		} else if (this.isViewportType("sap.ui.vk.threejs.Viewport")) {
			if (this._rotateTurntableHelper == null) {
				this._rotateTurntableHelper = new RotateTurntableHelperThree(this);
			}
		} else {
			return false;
		}

		return true;
	};

	/**
   * Executes Turntable rotation for the target Viewport.
   *
   * @param {int} dx The change in x-coordinate used to define the desired rotation.
   * @param {int} dy The change in y-coordinate used to define the desired rotation.
   * @public
   */
	RotateTurntableTool.prototype.rotate = function(dx, dy) {
		// This function figures out which helper is needed (dvl/threejs) and calls rotate method of appropriate helper
		if (this._prepare()) {
			// rotateOrbitHelper will be either an instance of RotateOrbitHelperDvl or RotateOrbitHelperThree depending on the Viewport being used
			this._rotateTurntableHelper.rotate(dx, dy);
		}
	};

	RotateTurntableTool.prototype.destroy = function() {
		// Destroy tool resources
		Tool.prototype.destroy.call(this);

		this._viewport = null;
		this._rotateTurntableHelper = null;
	};

	return RotateTurntableTool;
});
