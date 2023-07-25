/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Circle.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new Circle.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for an <i>Circle</i>. A Circle is positioned with its centerpoint at the given <i>position</i>. The
	 *        detail window will open at the center of the circle.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Circle
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Circle = VoBase.extend("sap.ui.vbm.Circle", /** @lends sap.ui.vbm.Circle.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position of the circle.
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: '0;0;0'
				},

				/**
				 * The pixel radius of the circle.
				 */
				radius: {
					type: "string",
					group: "Misc",
					defaultValue: '20'
				},

				/**
				 * The color of the circle.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGBA(0,0,128,128)'
				},

				/**
				 * The border color of the circle.
				 */
				colorBorder: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0,0,0)'
				},

				/**
				 * Number of circle slices. The property is required only when the PlugIn is used.
				 */
				slices: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			events: {}
		}
	});

	// Implement function defined in VoBase
	Circle.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("Circle", this, oMenu);
	};

	Circle.prototype.getDataElement = function() {
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

	Circle.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.R) {
			this.setRadius(oElement.R);
		}
	};

	return Circle;

});
