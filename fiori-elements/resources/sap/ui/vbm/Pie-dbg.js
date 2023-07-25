/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Pie.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new Pie.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>Pie Chart</i>. A Pie is a round chart, which is positioned with its centerpoint at the given
	 *        <i>position</i>. The size of the pie can be controlled with property <i>scale</i>. The slices of the pie chart are defined by the
	 *        aggregated <i>PieItem</i> elements. The detail window will open at the center of the pie.<br>
	 *        The property <i>hotDeltaColor</i> borrowed from VoBase is applied only to the hot PieItem and not the whole pie.</b>
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Pie
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Pie = VoBase.extend("sap.ui.vbm.Pie", /** @lends sap.ui.vbm.Pie.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position of the Pie.
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The scaling of the Pie. The scale must be a vector "x-Scale;y-Scale;z-Scale", but currently only the x scaling is applied to the
				 * Pie.
				 */
				scale: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * PieItem object aggregation. A PieItem holds the data for one slice in a Pie.
				 */
				items: {
					type: "sap.ui.vbm.PieItem",
					multiple: true,
					singularName: "item"
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Pie.prototype.init = function(){
	// // do something for initialization...
	// };

	// Implement function defined in VoBase
	Pie.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("Pie", this, oMenu);
	};

	Pie.prototype.getDataElement = function() {
		// determine the series elements.......................................//
		var aSeriesElements = [];

		var aPieItems = this.getItems();
		for (var nK = 0, lenItems = aPieItems.length; nK < lenItems; ++nK) {
			var oItem = aPieItems[nK];

			aSeriesElements.push({
				"T": oItem.getName(),
				"V": oItem.getValue(),
				"C": oItem.getColor()
			});
		}

		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.S) {
			oElement.S = this.getScale();
		}
		oElement.N = {
			"name": "Series",
			"E": aSeriesElements
		};

		return oElement;
	};

	Pie.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.S) {
			this.setScale(oElement.S);
		}
	};

	return Pie;
});
