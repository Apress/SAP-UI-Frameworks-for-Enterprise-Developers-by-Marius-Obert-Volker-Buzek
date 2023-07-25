/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AngleMeasurementTool
sap.ui.define([
	"./Tool",
	"./MeasurementToolHandler",
	"./AngleMeasurementToolGizmo"
], function(
	Tool,
	MeasurementToolHandler,
	AngleMeasurementToolGizmo
) {
	"use strict";

	var AngleMeasurementTool = Tool.extend("sap.ui.vk.tools.AngleMeasurementTool", /** @lends sap.ui.vk.tools.AngleMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = AngleMeasurementTool.getMetadata().getParent().getClass().prototype;

	AngleMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new MeasurementToolHandler(this);
		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
		this.setGizmo(new AngleMeasurementToolGizmo());
	};

	AngleMeasurementTool.prototype.exit = function() {
		basePrototype.exit.apply(this, arguments);
	};

	AngleMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show(this._viewport, this);
				}

				this._addLocoHandler();

				this._viewport.addStyleClass("sapUiVizKitAngleCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitAngleCursor");

				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	return AngleMeasurementTool;
});
