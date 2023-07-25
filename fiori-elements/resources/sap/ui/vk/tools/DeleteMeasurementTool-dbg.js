/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.DeleteMeasurementTool
sap.ui.define([
	"./DeleteMeasurementToolHandler",
	"./Tool"
], function(
	DeleteMeasurementToolHandler,
	Tool
) {
	"use strict";

	var DeleteMeasurementTool = Tool.extend("sap.ui.vk.tools.DeleteMeasurementTool", /** @lends sap.ui.vk.tools.DeleteMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = DeleteMeasurementTool.getMetadata().getParent().getClass().prototype;

	DeleteMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new DeleteMeasurementToolHandler(this);

		this._highlightedMeasurementDomRef = null;

		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
	};

	DeleteMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._addLocoHandler();
				this._viewport.addStyleClass("sapUiVizKitDeleteDistanceCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitDeleteDistanceCursor");
				this.highlightMeasurement(null, this._viewport.getMeasurementSurface());
				this._removeLocoHandler();
			}
		}

		return this;
	};

	DeleteMeasurementTool.prototype.highlightMeasurement = function(newMeasurementDomRef, measurementSurface) {
		var oldMeasurementDomRef = this._highlightedMeasurementDomRef;
		if (newMeasurementDomRef === oldMeasurementDomRef) {
			return null;
		}

		if (oldMeasurementDomRef != null) {
			this._viewport.getMeasurementSurface().highlightMeasurement(oldMeasurementDomRef._measurement, false);
		}

		if (newMeasurementDomRef != null) {
			this._viewport.getMeasurementSurface().highlightMeasurement(newMeasurementDomRef._measurement, true, this._viewport, this._viewport.getCamera());
		}

		this._highlightedMeasurementDomRef = newMeasurementDomRef;

		return this;
	};

	DeleteMeasurementTool.prototype.removeMeasurement = function(measurementDomRef) {
		var surface = this._viewport.getMeasurementSurface();
		var measurement = measurementDomRef._measurement;
		surface.removeMeasurement(measurement);
		if (surface.getMeasurements().length === 0) {
			this.setActive(false, this._viewport);
		}
		return this;
	};

	return DeleteMeasurementTool;
});
