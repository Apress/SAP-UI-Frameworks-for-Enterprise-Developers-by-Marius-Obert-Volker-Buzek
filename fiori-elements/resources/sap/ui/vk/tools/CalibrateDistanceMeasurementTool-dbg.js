/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CalibrateDistanceMeasurementTool
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"./CalibrateDistanceMeasurementToolHandler",
	"./Tool",
	"../getResourceBundle",
	"../measurements/Settings",
	"../measurements/Utils"
], function(
	MessageBox,
	Fragment,
	JSONModel,
	ResourceModel,
	CalibrateDistanceMeasurementToolHandler,
	Tool,
	getResourceBundle,
	Settings,
	Utils
) {
	"use strict";

	var CalibrateDistanceMeasurementTool = Tool.extend("sap.ui.vk.tools.CalibrateDistanceMeasurementTool", /** @lends sap.ui.vk.tools.CalibrateDistanceMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = CalibrateDistanceMeasurementTool.getMetadata().getParent().getClass().prototype;

	CalibrateDistanceMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new CalibrateDistanceMeasurementToolHandler(this);

		this._highlightedMeasurementDomRef = null;

		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
	};

	CalibrateDistanceMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._addLocoHandler();
				this._viewport.addStyleClass("sapUiVizKitCalibrateDistanceCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitCalibrateDistanceCursor");
				this.highlightMeasurement(null, this._viewport.getMeasurementSurface());
				this._removeLocoHandler();
			}
		}

		return this;
	};

	CalibrateDistanceMeasurementTool.prototype.highlightMeasurement = function(newMeasurementDomRef) {
		var oldMeasurementDomRef = this._highlightedMeasurementDomRef;
		if (newMeasurementDomRef === oldMeasurementDomRef) {
			return null;
		}

		var surface = this._viewport.getMeasurementSurface();

		if (oldMeasurementDomRef != null) {
			surface.highlightMeasurement(oldMeasurementDomRef._measurement, false);
		}

		if (newMeasurementDomRef != null) {
			if (newMeasurementDomRef._measurement.isDistance) {
				surface.highlightMeasurement(newMeasurementDomRef._measurement, true, this._viewport, this._viewport.getCamera());
			} else {
				newMeasurementDomRef = null;
			}
		}

		this._highlightedMeasurementDomRef = newMeasurementDomRef;

		return this;
	};

	CalibrateDistanceMeasurementTool.prototype.calibrateMeasurement = function(measurementDomRef) {
		var measurement = measurementDomRef._measurement;

		if (!measurement.isDistance) {
			return this;
		}

		var viewport = this._viewport;
		var surface = viewport.getMeasurementSurface();
		var settings = Settings.load();
		var unitFactor = Utils.getUnitFactor(settings.units);
		var scale = surface.getScale();

		var distanceInMM = measurement.getDistance();
		var distance = distanceInMM * unitFactor * scale;

		var data = {
			label: getResourceBundle().getText("MEASUREMENTS_CALIBRATION_DISTANCE_LABEL", [Utils.translateUnits(Settings.load().units)]),
			distance: distance
		};
		var model = new JSONModel(data);

		var that = this;

		var fragmentId = this.getId() + "-calibration-dialog";
		var dialog;
		Fragment.load(
			{
				name: "sap.ui.vk.measurements.Calibration",
				id: fragmentId,
				controller: {
					onResetPressed: function(event) {
						model.setProperty("/distance", distanceInMM * unitFactor);
					},
					onOkPressed: function() {
						if (data.distance <= 0) {
							MessageBox.error(getResourceBundle().getText("MEASUREMENTS_CALIBRATION_DISTANCE_ERROR_MESSAGE"), {
								onClose: function() {
									Fragment.byId(fragmentId, "distance").focus();
								}
							});
							return;
						}
						if (data.distance !== distance) {
							surface.setScale(data.distance / unitFactor / distanceInMM);
							surface.update(viewport, viewport.getCamera());
						}
						dialog.close();
						that.setActive(false, viewport);
					},
					onCancelPressed: function() {
						dialog.close();
					},
					onAfterClose: function() {
						dialog.destroy();
						dialog = null;
					}
				}
			}
		).then(function(control) {
			dialog = control;
			dialog.setModel(model);
			dialog.setModel(new ResourceModel({ bundle: getResourceBundle() }), "i18n");
			dialog.open();
		});

		return this;
	};

	return CalibrateDistanceMeasurementTool;
});
