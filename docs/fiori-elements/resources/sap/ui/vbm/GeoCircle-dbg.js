/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.GeoCircle.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new GeoCircle.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>GeoCircle</i>. A GeoCircle is positioned with its centerpoint at the given <i>position</i>.
	 *        Since the actual size of a geocircle may depend on the zoom level it might be only partly visible. Thus detail windows will open at the
	 *        click position.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.GeoCircle
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GeoCircle = VoBase.extend("sap.ui.vbm.GeoCircle", /** @lends sap.ui.vbm.GeoCircle.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position of the geocircle. The format is "lon;lat;0".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: '0;0;0'
				},

				/**
				 * The border color of the geocirle.
				 */
				colorBorder: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0,0,0)'
				},

				/**
				 * The radius in meters of the geocirle.
				 */
				radius: {
					type: "string",
					group: "Misc",
					defaultValue: '10000'
				},

				/**
				 * The color of the geocirle.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0,0,0)'
				},

				/**
				 * The number of slices of the geocircle.
				 */
				slices: {
					type: "string",
					group: "Misc",
					defaultValue: '20'
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.GeoCircle.prototype.init = function(){
	// // do something for initialization...
	// };

	// Overwrite default impl from VoBase
	GeoCircle.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		}, true);
	};

	// Implement function defined in VoBase
	GeoCircle.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("GeoCircle", this, oMenu);
	};

	GeoCircle.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.R) {
			oElement.R = this.getRadius();
		}
		if (oBindInfo.C) {
			oElement.C = this.getColor();
		}
		if (oBindInfo.CB) {
			oElement.CB = this.getColorBorder();
		}
		if (oBindInfo.NS) {
			oElement.NS = this.getSlices();
		}

		return oElement;
	};

	GeoCircle.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.R) {
			this.setRadius(oElement.R);
		}
	};

	return GeoCircle;

});
