/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.HighlightMeasurementTool
sap.ui.define([
	"./HighlightMeasurementToolHandler",
	"./Tool"
], function(
	HighlightMeasurementToolHandler,
	Tool
) {
	"use strict";

	var HighlightMeasurementTool = Tool.extend("sap.ui.vk.tools.HighlightMeasurementTool", /** @lends sap.ui.vk.tools.HighlightMeasurementTool */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = HighlightMeasurementTool.getMetadata().getParent().getClass().prototype;

	HighlightMeasurementTool.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._handler = new HighlightMeasurementToolHandler(this);

		this._highlightedMeasurementDomRef = null;

		this.setFootprint(["sap.ui.vk.threejs.Viewport", "sap.ui.vk.svg.Viewport"]);
	};

	HighlightMeasurementTool.prototype.setActive = function(value, activeViewport, gizmoContainer) {
		basePrototype.setActive.call(this, value, activeViewport, gizmoContainer);

		if (this._viewport) {
			if (value) {
				this._selection = [];
				this._addLocoHandler();
				this._viewport.addStyleClass("sapUiVizKitHighlightDistanceCursor");
			} else {
				this._viewport.removeStyleClass("sapUiVizKitHighlightDistanceCursor");
				this.clearSelection();
				this.highlightMeasurement(null, this._viewport.getMeasurementSurface());
				this._removeLocoHandler();
			}
		}

		return this;
	};

	HighlightMeasurementTool.prototype.highlightMeasurement = function(newMeasurementDomRef) {
		var oldMeasurementDomRef = this._highlightedMeasurementDomRef;
		if (newMeasurementDomRef === oldMeasurementDomRef) {
			return null;
		}

		if (oldMeasurementDomRef != null && this._selection.indexOf(oldMeasurementDomRef) < 0) {
			this._viewport.getMeasurementSurface().highlightMeasurement(oldMeasurementDomRef._measurement, false);
		}

		if (newMeasurementDomRef != null && this._selection.indexOf(newMeasurementDomRef) < 0) {
			this._viewport.getMeasurementSurface().highlightMeasurement(newMeasurementDomRef._measurement, true, this._viewport, this._viewport.getCamera());
		}

		this._highlightedMeasurementDomRef = newMeasurementDomRef;

		return this;
	};

	HighlightMeasurementTool.prototype.selectMeasurement = function(measurementDomRef) {
		var index = this._selection.indexOf(measurementDomRef);
		if (index < 0) {
			this._selection.push(measurementDomRef);
			if (measurementDomRef !== this._highlightedMeasurementDomRef) {
				this._viewport.getMeasurementSurface().highlightMeasurement(measurementDomRef._measurement, true, this._viewport, this._viewport.getCamera());
			}
		} else {
			this._selection.splice(index, 1);
			if (measurementDomRef !== this._highlightedMeasurementDomRef) {
				this._viewport.getMeasurementSurface().highlightMeasurement(measurementDomRef._measurement, false);
			}
		}

		return this;
	};

	HighlightMeasurementTool.prototype.clearSelection = function() {
		this._selection.forEach(function(measurementDomRef) {
			if (measurementDomRef !== this._highlightedMeasurementDomRef) {
				this._viewport.getMeasurementSurface().highlightMeasurement(measurementDomRef._measurement, false);
			}
		}, this);
		this._selection.length = 0;
	};

	return HighlightMeasurementTool;
});
