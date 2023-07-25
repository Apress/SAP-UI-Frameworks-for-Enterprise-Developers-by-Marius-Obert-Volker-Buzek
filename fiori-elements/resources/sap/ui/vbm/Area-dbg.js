/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Area.
sap.ui.define([
	"./VoBase",
	"sap/base/Log",
	"./library"
], function(VoBase, Log, library) {
	"use strict";

	/**
	 * Constructor for a new Area.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for an <i>Area</i>. An Area is a filled polygon, which border is given as a list of geo-coordinates.
	 *        Areas can have multiple disjunct parts as well as each part can have an arbitrary number of exclusions/holes.<br>
	 *        The inner part and the edges of areas are interactive and fire events on click.<br>
	 *        Since the actual size of an area depends on the zoom level it might be only partly visible. Thus detail windows will open at the click
	 *        position.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Area
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Area = VoBase.extend("sap.ui.vbm.Area", /** @lends sap.ui.vbm.Area.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position array for the Area. For single part areas the format is "lon0;lat0;0.0;...;lonN,latN,0.0". For multi part areas you
				 * need to provide an array of arrays of the above position string: "[['lon0...'],['lon0...']]" (sequence of single and double quotes
				 * is important). <b>Single and Multi part areas must not be mixed within one Areas aggregation.</b><br>
				 * Finally each area part can have multiple exclusions/holes. In that case the position list of excluded areas has follow the list of
				 * the base shape: "['lon0...', 'exLon0...']".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The fill color of the Area.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The border color of the Area.
				 */
				colorBorder: {
					type: "string",
					group: "Misc"
				},

				/**
				 * Defines the dashing style of the area border using an array.
				 */
				borderDash: {
					type: "string",
					group: "Misc"
				}
			},
			events: {
				// Events are implemented in Areas.js!
				
				/**
				 * This event is raised when the edge of an Area is clicked.
				 */
				edgeClick: {
					/**
					 * The number of the edge where the click occured; edges are numbered zero based: e.g. edge from point 1 to point 2 has number 0
					 */
					edge: {
						type: "int"
					}
				},

				/**
				 * This event is raised when the edge of an Area is right clicked.
				 */
				edgeContextMenu: {
					/**
					 * The number of the edge where the click occured; edges are numbered zero based: e.g. edge from point 1 to point 2 has number 0
					 */
					edge: {
						type: "int"
					}

				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Area.prototype.init = function(){
	// // do something for initialization...
	// };

	// Overwrite default impl from VoBase
	Area.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		}, true);

	};

	// Implement function defined in VoBase
	Area.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("Area", this, oMenu);
	};

	Area.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.C) {
			oElement.C = this.getColor();
		}
		if (oBindInfo.CB) {
			var cb = this.getColorBorder();
			if (cb != undefined && cb != "") {
				oElement.CB = cb;
			}
		}
		if (oBindInfo.BD) {
			var bd = this.getBorderDash();
			if (bd != undefined && bd != "") {
				oElement.BD = bd;
			}
		}
		var pos = this.getPosition();
		if (pos.substring(0, 1) === "[") {
			pos = pos.replace(/\'/g, "\"");
			oElement.PM = JSON.parse(pos);
		} else {
			oElement.P = pos;
		}

		return oElement;
	};

	Area.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.PM) {
			Log.error("Change of areas with multiple parts is not supported", "", "sap.ui.vbm.Area");
		}
	};

	return Area;

});
