/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Control',
	'sap/ui/base/Event',
	'sap/m/SelectionDetails',
	'sap/m/SelectionDetailsItem',
	'sap/m/SelectionDetailsItemLine',
	'sap/suite/ui/commons/ChartContainer',
	'./ChartContainerContentRenderer'
], function (jQuery, Control, Event, SelectionDetails, SelectionDetailsItem, SelectionDetailsItemLine, ChartContainer, ChartContainerContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new ChartContainerContent.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Content aggregation for ChartContainer.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ChartContainerContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ChartContainerContent = Control.extend("sap.suite.ui.commons.ChartContainerContent", /** @lends sap.suite.ui.commons.ChartContainerContent.prototype */ {
		metadata: {

			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Icon of the Chart.
				 */
				icon: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Title of the Chart/Table
				 */
				title: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 * Chart or Table as content of the ChartToolBar. Supported Types: sap.viz.ui5.controls.VizFrame, sap.m.Table, sap.ui.table.Table
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			}
		}
	});

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	ChartContainerContent.prototype.init = function () {
		this._oSelectionDetails = new SelectionDetails();
		this._oSelectionDetails.registerSelectionDetailsItemFactory(ChartContainerContent._selectionDetailsItemFactory);
	};

	ChartContainerContent.prototype.onBeforeRendering = function () {
		var oParent = this.getParent(),
			oChart;

		this._oSelectionDetails.detachSelectionHandler("_selectionDetails");
		oChart = this.getContent();
		if (oChart && oChart.getMetadata().getName() === "sap.viz.ui5.controls.VizFrame") {
			this._oSelectionDetails.attachSelectionHandler("_selectionDetails", oChart);
		}

		if (oParent instanceof ChartContainer) {
			this._oSelectionDetails.setWrapLabels(oParent.getWrapLabels());
		}
	};

	ChartContainerContent.prototype.exit = function () {
		if (this._oSelectionDetails) {
			this._oSelectionDetails.destroy();
			this._oSelectionDetails = null;
		}
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */
	/**
	 * Getter for the Selection Details facade.
	 *
	 * @returns {sap.m.SelectionDetailsFacade} The reduced Selection Details facade for outer framework usages.
	 * @since 1.48
	 * @public
	 */
	ChartContainerContent.prototype.getSelectionDetails = function () {
		ChartContainerContent._addEventMapping(this._oSelectionDetails);
		return this._oSelectionDetails.getFacade();
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */
	/**
	 * Gets SelectionDetails instance
	 *
	 * @returns {sap.m.SelectionDetails} The newly created SelectionDetails for ChartContainer.
	 * @private
	 */
	ChartContainerContent.prototype._getSelectionDetails = function () {
		var oContent = this.getContent();
		if (oContent && oContent.getMetadata().getName() === "sap.viz.ui5.controls.VizFrame") {
			return this._oSelectionDetails;
		}
	};

	/**
	 * This function creates items that will be displayed in the Selection Details.
	 *
	 * @param {object[]} displayData The display data that is provided by the vizFrame event for the item being created.
	 * @param {object} data The data related to the line as provided by vizFrame.
	 * @param {object} context Context of the line as provided by vizFrame.
	 * @param {object} factoryData Data which were registered with the factory.
	 * @param {object} shapeString A string or a map of strings of shapeStrings provided by vizFrame.
	 * @returns {sap.m.SelectionDetailsItem} The newly created SelectionDetailsItem that will be added to the items aggregation of SelectionDetails.
	 * @private
	 * @static
	 */
	ChartContainerContent._selectionDetailsItemFactory = function (displayData, data, context, factoryData, shapeString) {
		shapeString = shapeString || "";
		var aLines = [],
			oLineItem,
			bIsSimpleShape = typeof shapeString === "string";
		for (var i = 0; i < displayData.length; i++) {
			oLineItem = new SelectionDetailsItemLine({
				label: displayData[i].label,
				value: displayData[i].value,
				unit: displayData[i].unit
			});
			if (!bIsSimpleShape) {
				oLineItem.setLineMarker(shapeString[displayData[i].id]);
			} else if (i === 0) {
				oLineItem.setLineMarker(shapeString);
			}
			aLines.push(oLineItem);
		}
		return new SelectionDetailsItem({
			lines: aLines
		});
	};

	ChartContainerContent._aProxyEvent = ["beforeOpen", "beforeClose", "navigate", "actionPress"];

	/**
	 * Event mapping in order to return SelectionDetails facade for facade events
	 *
	 * @param {sap.m.SelectionDetails} selectionDetails The instance for which the event mapping should be done.
	 * @private
	 */
	ChartContainerContent._addEventMapping = function (selectionDetails) {
		var fnAttachEvent = selectionDetails.attachEvent;
		selectionDetails.attachEvent = function (eventId, data, callback, listener) {
			// Only proxy facade events. Not core events.
			if (ChartContainerContent._aProxyEvent.indexOf(eventId) === -1) {
				fnAttachEvent.apply(this, arguments);
				return;
			} else if (jQuery.type(data) === "function") {
				listener = callback;
				callback = data;
				data = null;
			}
			fnAttachEvent.apply(selectionDetails, [eventId, data, proxy, listener || selectionDetails.getFacade()]);

			function proxy(event) {
				var oEvent = new Event(eventId, event.oSource, event.mParameters);
				oEvent.getSource = selectionDetails.getFacade;
				if (eventId === "actionPress") {
					event.getParameters().items = getFacades(event);
				} else if (eventId === "navigate") {
					event.getParameters().item = event.getParameter("item").getFacade();
				}
				callback.call(listener || selectionDetails.getFacade(), oEvent, data);
			}

			function getFacades(event) {
				var aItems = event.getParameter("items"),
					aItemsFacades = [];
				for (var i = 0; i < aItems.length; i++) {
					aItemsFacades.push(aItems[i].getFacade());
				}
				return aItemsFacades;
			}
		};
	};

	return ChartContainerContent;
});
