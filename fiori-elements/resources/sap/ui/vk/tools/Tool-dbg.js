/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides class sap.ui.vk.tools.Tool
sap.ui.define([
	"sap/ui/core/Element",
	"sap/base/Log"
], function(
	Element,
	Log
) {
	"use strict";

	/**
	 * Base for all tool controls.
	 *
	 * @class
	 * Specifies base for all tools to extend

	 * @param {string} [sId] ID of the new tool instance. <code>sId</code>is generated automatically if no non-empty ID is given.
	 *                       Note: this can be omitted, regardless of whether <code>mSettings</code> will be provided or not.
	 * @param {object} [mSettings] An optional map/JSON object with initial property values, aggregated objects etc. for the new tool instance.
	 * @param {object} [oScope] scope An object for resolving string-based type and formatter references in bindings.
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @alias sap.ui.vk.tools.Tool
	 */
	var Tool = Element.extend("sap.ui.vk.tools.Tool", /** @lends sap.ui.vk.tools.Tool.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 *
				 */
				targetViewportType: "any",

				/**
				 * GUID identifier for the tool to prevent naming conflicts.
				 */
				toolid: "string",

				/**
				 * Used to control the tool rendering and interaction pipeline.
				 */
				active: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Used to decide whether this tool should be enabled for the target viewport.
				 */
				footprint: {
					type: "string[]"
				}
			},
			associations: {
				/**
				 * Control into which the gizmo is intended to render .
				 */
				gizmoContainer: {
					type: "sap.ui.core.Control",
					multiple: false

				}
			},
			aggregations: {
				/**
				 * sap.ui.vk.tools.Gizmo owned by this control and used for rendering floating UI
				 */
				gizmo: {
					type: "sap.ui.vk.tools.Gizmo",
					multiple: false
				}
			},
			events: {
				enabled: {
					parameters: {
						/**
						 * Returns the true or false to indicated that the tool is enabled or not.
						 * This event is fired by the tool under various conditions,
						 * including an attempt to set an activeViewport that is incompatible with the tool.
						 * use getActive / setActive to turn the tool on or off
						 */
						enabled: "boolean",
						reason: "string"
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			// Configure dependencies
			this._viewport = null;
			this._handler = null;

			Element.apply(this, arguments);
		}
	});

	Tool.prototype.init = function() {
		if (Element.prototype.init) {
			Element.prototype.init.call(this);
		}
	};

	Tool.prototype.getViewport = function() {
		return this._viewport;
	};

	Tool.prototype.setViewport = function(viewport) {
		var type = viewport && viewport.getMetadata().getName(); // get control class name for viewport implementation
		this._viewport = type != null && this.getFootprint().indexOf(type) >= 0 ? viewport : null;
	};

	// Checks if the current viewport is of a specified type
	Tool.prototype.isViewportType = function(typeString) {
		if (this._viewport && this._viewport.getMetadata().getName() === typeString) {
			return true;
		}
		return false;
	};

	Tool.prototype.getViewportImplementation = function(viewport) {
		var ret = viewport;
		if (viewport && typeof viewport.getImplementation === "function") {
			ret = viewport.getImplementation() || viewport;
		}

		return ret;
	};

	/**
	 * Manages the 'active' flag for this tool and any other internals required
	 *
	 * @param {boolean} [value] indicates whether this tools is active or not
	 * @param {object} [activeTarget] the tool target is used by the tool to carry out its operations
	 * @param {object} [gizmoContainer] used to evaluate whether a tool should be rendered as part of the activeTarget
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Tool.prototype.setActive = function(value, activeTarget, gizmoContainer) {
		if (value === this.getProperty("active")) {
			return;
		}

		var viewport = this.getViewportImplementation(activeTarget) || this._viewport;
		var type = viewport && viewport.getMetadata().getName(); // get control class name for viewport implementation

		var reason;
		if (this.getFootprint().indexOf(type) >= 0) {
			this._viewport = viewport;
			this.setProperty("active", value, true);

			// If a gizmo has been set, but no gizmoContainer specified, then use the target for rendering gizmo
			if (this.getGizmo()) {
				gizmoContainer = gizmoContainer || viewport;
				this.setAssociation("gizmoContainer", gizmoContainer);
				if (gizmoContainer.getDomRef()) {
					gizmoContainer.invalidate();
				}
			}

			this._viewport.setShouldRenderFrame();

			reason = value ? "" : "Disabled by application logic";
		} else {
			this._viewport = null;
			this.setProperty("active", false, true);

			reason = "Tool does not support Viewport type: " + type;
			Log.warning(reason);
		}

		this.fireEnabled({
			enabled: this.getActive(),
			reason: reason
		});
	};

	/* Evaluates default conditions for rendering a gizmo in a container and returns the gizmo instance if true
	 *
	 * @param {object} [renderingControl] the potential rendering target for the gizmo
	 * @returns {sap.ui.vk.tools.Gizmo}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Tool.prototype.getGizmoForContainer = function(renderingControl) {
		var _gizmo = this.getGizmo(); // Get the gizmo instance if it exists
		// Don't return the gizmo for rendering if it already exists
		if ((renderingControl.getId() === this.getGizmoContainer()) && _gizmo && this.getActive()) {
			return _gizmo;
		}
	};

	Tool.prototype.destroy = function() {
		// Destroy tool resources
		Element.prototype.destroy.call(this);

		this._viewport = null;
		this._handler = null;
	};


	Tool.prototype._addLocoHandler = function() {
		if (!this._viewport || !this._viewport._loco) {
			return false;
		}

		// Add tool handler to loco stack for viewport so that the tool can handle input from user
		this._viewport._loco.addHandler(this._handler, this._handler._priority);
		return true;
	};

	Tool.prototype._removeLocoHandler = function(priority) {
		// Remove tool handler from loco stack for viewport so that the tool no longer handles input from user
		if (this._viewport && this._viewport._loco) {
			this._viewport._loco.removeHandler(this._handler);
		}
	};

	return Tool;
});
