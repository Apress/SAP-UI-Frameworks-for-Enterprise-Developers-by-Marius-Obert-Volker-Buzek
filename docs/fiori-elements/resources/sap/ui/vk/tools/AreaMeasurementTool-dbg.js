/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AreaMeasurementTool
sap.ui.define([
	"./Tool",
	"./MeasurementToolHandler",
	"./AreaMeasurementToolGizmo"
], function(
	Tool,
	MeasurementToolHandler,
	AreaMeasurementToolGizmo
) {
	"use strict";

	var AreaMeasurementTool = Tool.extend("sap.ui.vk.tools.AreaMeasurementTool", /** @lends sap.ui.vk.tools.AreaMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = AreaMeasurementTool.getMetadata().getParent().getClass().prototype;

	AreaMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new MeasurementToolHandler(this);
		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
		this.setGizmo(new AreaMeasurementToolGizmo());
	};

	AreaMeasurementTool.prototype.exit = function() {
		basePrototype.exit.apply(this, arguments);
	};

	AreaMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show(this._viewport, this);
				}

				this._addLocoHandler();

				this._viewport.addStyleClass("sapUiVizKitAreaCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitAreaCursor");

				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	return AreaMeasurementTool;
});
