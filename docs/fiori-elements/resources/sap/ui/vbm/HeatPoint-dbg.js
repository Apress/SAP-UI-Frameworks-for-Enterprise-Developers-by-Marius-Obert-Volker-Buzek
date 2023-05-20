/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
// Provides control sap.ui.vbm.HeatPoint.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new HeatPoint.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>HeatPoint</i>.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.HeatPoint
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HeatPoint = VoBase.extend("sap.ui.vbm.HeatPoint", /** @lends sap.ui.vbm.HeatPoint.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * The position of a sample element of the heatmap. Should be bound. The format is "lon;lat;0"
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Heat Value of the sample element of the heatmap. May be bound.
				 */
				value: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Radius of the sample values. May be bound
				 */
				radius: {
					type: "string",
					group: "Misc",
					defaultValue: '5'
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.HeatPoint.prototype.init = function(){
	// // do something for initialization...
	// };

	// Overwrite default impl from VoBase
	HeatPoint.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		}, true);

	};

	HeatPoint.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.V) {
			oElement.V = this.getValue();
		}

		if (oBindInfo.R) {
			oElement.R = this.getRadius();
		}
		return oElement;
	};

	HeatPoint.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.V) {
			this.setScale(oElement.V);
		}
		if (oElement.R) {
			this.setRadius(oElement.R);
		}
	};

	HeatPoint.prototype.getUniqueId = function() {
		return (this.getId());
	};

	return HeatPoint;

});
