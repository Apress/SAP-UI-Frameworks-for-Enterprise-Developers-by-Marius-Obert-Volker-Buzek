/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.DistanceMeasurementTool
sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/IconPool",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"./Tool",
	"./MeasurementToolHandler",
	"./DistanceMeasurementToolGizmo",
	"../measurements/Settings",
	"../getResourceBundle"
], function(
	Fragment,
	IconPool,
	NumberFormat,
	JSONModel,
	ResourceModel,
	Tool,
	MeasurementToolHandler,
	DistanceMeasurementToolGizmo,
	Settings,
	getResourceBundle
) {
	"use strict";

	var collectionName = "vk-icons";
	var fontFamily = "vk-icons";

	IconPool.addIcon("measurement-vertex", collectionName, fontFamily, "e965");
	IconPool.addIcon("measurement-edge", collectionName, fontFamily, "e964");
	IconPool.addIcon("measurement-face", collectionName, fontFamily, "e963");
	IconPool.addIcon("fill-color", collectionName, fontFamily, "e92f");

	var DistanceMeasurementTool = Tool.extend("sap.ui.vk.tools.DistanceMeasurementTool", /** @lends sap.ui.vk.tools.DistanceMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = DistanceMeasurementTool.getMetadata().getParent().getClass().prototype;

	DistanceMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new MeasurementToolHandler(this);

		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
		this.setGizmo(new DistanceMeasurementToolGizmo());
	};

	DistanceMeasurementTool.prototype.exit = function() {
		basePrototype.exit.apply(this, arguments);
	};

	DistanceMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._gizmo = this.getGizmo();
				if (this._gizmo) {
					this._gizmo.show(this._viewport, this);
				}

				this._addLocoHandler();

				this._viewport.addStyleClass("sapUiVizKitDistanceCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitDistanceCursor");

				this._removeLocoHandler();

				if (this._gizmo) {
					this._gizmo.hide();
					this._gizmo = null;
				}
			}
		}

		return this;
	};

	DistanceMeasurementTool.prototype.showSettingsDialog = function(viewport) {
		var settings = Settings.load();

		var camera = viewport.getCamera();
		var surface = viewport.getMeasurementSurface();

		var dialog;
		Fragment.load(
			{
				name: "sap.ui.vk.measurements.Settings",
				id: this.getId() + "-settings-dialog",
				controller: {
					formatPrecision: function(precision) {
						var formatter = NumberFormat.getFloatInstance({
							minFractionDigits: precision,
							maxFractionDigits: precision
						});
						return formatter.format(Math.pow(10, -precision));
					},
					onClosePressed: function(event) {
						dialog.close();
					},
					onAfterClose: function(event) {
						dialog.destroy();
						dialog = null;
					},
					onChange: function(event) {
						Settings.save(settings);
						surface.updateSettings(settings);
						surface.update(viewport, camera);
					}
				}
			}
		).then(function(control) {
			dialog = control;
			dialog.setModel(new ResourceModel({ bundle: getResourceBundle() }), "i18n");
			dialog.setModel(new JSONModel(settings), "settings");
			dialog.setModel(new JSONModel({ is2D: viewport.getScene().getMetadata().getName() === "sap.ui.vk.svg.Scene" }), "extra");
			dialog.open();
		});
	};

	return DistanceMeasurementTool;
});
