/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.AnalyticMap.
sap.ui.define([
	"./GeoMap",
	"./VoBase",
	"sap/ui/core/theming/Parameters",
	"jquery.sap.global",
	"sap/base/Log",
	"./library",
	"./AnalyticMapRenderer"
], function(GeoMap, VoBase, Parameters, jQuery, Log, library, AnalyticMapRenderer) {
	"use strict";

	/**
	 * Constructor for a new AnalyticMap.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The AnalyticMap control. This control renders a Map based on a GeoJSON source. The GeoJSON file is searched in the following places in
	 *        the given sequence:
	 *        <ul>
	 *        <li> &lt;server&gt;:&lt;port&gt;/sap/bc/vbi/geojson/L0.json
	 *        <li> ./media/analyticmap/L0.json
	 *        </ul>
	 *        Further it is possible to specify a different URL by setting static attribute sap.ui.vbm.AnalyticMap.GeoJSONURL.<br>
	 *        The Features from the GeoJSON get rendered as neutral background in gray. They are not active, but may report a name via tooltip. Each
	 *        feature is expected to have a property id or id2, where as id2 should be an ISO country according to ISO 3166-2.<br>
	 *        By adding Region elements to the regions aggregation it is possible to make feature from the GeoJSON interactive. Region elements need
	 *        to match by ISO code.
	 * @extends sap.ui.vbm.GeoMap
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.AnalyticMap
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalyticMap = GeoMap.extend("sap.ui.vbm.AnalyticMap", /** @lends sap.ui.vbm.AnalyticMap.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {},
			aggregations: {
				/**
				 * Regions that are different from the defaults. It is possible to specify the tooltip and color for regions. The region code must
				 * match the GeoJSON id2 identifier.
				 */
				regions: {
					type: "sap.ui.vbm.Region",
					multiple: true,
					singularName: "region"
				}
			},
			events: {
				/**
				 * The event is raised when there is a click or a tap on a region.
				 */
				regionClick: {
					parameters: {
						/**
						 * The regions code.
						 */
						code: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a region.
				 */
				regionContextMenu: {
					parameters: {
						/**
						 * The regions code.
						 */
						code: {
							type: "string"
						}
					}
				},

				/**
				 * Raised when regions get selected
				 */
				 regionSelect: {},

				 /**
				 * Event is raised when regions get deselected
				 */
				regionDeselect: {}
			}
		},
		
		renderer: AnalyticMapRenderer
	});

	// ...........................................................................//
	// Author: Ulrich Roegelein
	// ...........................................................................//
	// Static Configuration......................................................//
	// ...........................................................................//
	// on abap systems the GeoJSON is requested from this handler................//
	AnalyticMap.DefaultABAPGeoJSONURL = "/sap/bc/vbi/geojson/L0.json";
	AnalyticMap.DefaultGeoJSONURL = "media/analyticmap/L0.json";
	AnalyticMap.DefaultRegionColor = (Parameters && Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBG")) ? Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBG") : "rgb(213,218,221)";
	AnalyticMap.DefaultRegionColorBorder = (Parameters && Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBorder")) ? Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBorder") : "rgb(255,255,255)";
	AnalyticMap.DefaultRegionSelectColor = "RHLSA(0;1;1;1)"; // no change!
	AnalyticMap.DefaultHotDeltaColor = "RHLSA(0;1;1;1.0)"; // default regions should not be hot
	AnalyticMap.AltBorderColor = (Parameters && Parameters.get("_sap_ui_vbm_shared_ChartDataPointBorderHoverSelectedColor")) ? Parameters.get("_sap_ui_vbm_shared_ChartDataPointBorderHoverSelectedColor") : "#676767";
	// reduce opacity to 60%
	var nonSelectOpacity = (Parameters && Parameters.get("_sap_ui_vbm_shared_ChartDataPointNotSelectedBackgroundOpacity") ? Parameters.get("_sap_ui_vbm_shared_ChartDataPointNotSelectedBackgroundOpacity") : "0.6");
	AnalyticMap.DefaultRegionNonSelectColor = "RHLSA(0;1;1;" + nonSelectOpacity + ")";

	// ...........................................................................//
	// This section defines behavior for the control,............................//
	// ...........................................................................//

	AnalyticMap.prototype.exit = function() {
		GeoMap.prototype.exit.apply(this, arguments);

		// detach the event.......................................................//
		this.detachEvent('submit', AnalyticMap.prototype.onAnalyticsSubmit, this);
	};

	AnalyticMap.prototype.onAfterRendering = function() {
		sap.ui.vbm.VBI.prototype.onAfterRendering.apply(this, arguments);
	};

	// changes in regions........................................................//

	AnalyticMap.prototype.destroyRegions = function() {
		this.mbRegionsDirty = true;
		this.destroyAggregation("regions");
	};

	AnalyticMap.prototype.addRegion = function(o) {
		this.mbRegionsDirty = true;
		this.addAggregation("regions", o);
	};

	AnalyticMap.prototype.removeRegion = function(o) {
		this.mbRegionsDirty = true;
		this.removeAggregation("regions", o);
	};

	AnalyticMap.prototype.insertRegion = function(o, index) {
		this.mbRegionsDirty = true;
		this.insertAggregation("regions", o, index);
	};

	AnalyticMap.prototype.removeAllRegions = function() {
		this.mbRegionsDirty = true;
		this.removeAllAggregation("regions");
	};

	// changes in legend..........................................................//

	AnalyticMap.prototype.destroyLegend = function() {
		this.mbLegendDirty = true;
		this.destroyAggregation("legend");
	};

	AnalyticMap.prototype.setLegend = function(o) {
		this.mbLegendDirty = true;
		this.setAggregation("legend", o);
	};

	AnalyticMap.prototype.onAnalyticsSubmit = function(e) {
		// analyze the event......................................................//
		var datEvent = JSON.parse(e.mParameters.data);

		// when clicking a region, the key is provided in the instance parameter..//
		var code, o, oParams;
		// fire the events........................................................//
		switch (datEvent.Action.name) {
			case "RGN_CONTEXTMENU":
				code = datEvent.Action.instance.split(".")[1];
				oParams = {
					code: code
				};
				if ((o = this.findRegionInAggregation(code))) {
					o.fireContextMenu(oParams);
				}

				this.fireRegionContextMenu(oParams);
				break;
			case "RGN_CLICK":
				code = datEvent.Action.instance.split(".")[1];
				oParams = {
					code: code
				};
				if ((o = this.findRegionInAggregation(code))) {
					o.fireClick(oParams);
				}
				this.fireRegionClick(oParams);
				if (datEvent.Data && datEvent.Data.Merge) {
					this.setSelectionPropFireSelect(datEvent.Data.Merge); // set selection property on model and call select and deselect on
				}
				// Aggregation
				break;
			default:
				break;
		}

	};

	AnalyticMap.prototype.init = function() {
		// set control specific property defaults
		// explicitely set properties will still be applied later!
		this.mProperties.scaleVisible = false;

		// call base class first.................................................//
		GeoMap.prototype.init.apply(this, arguments);

		// initially we set the dirty states.....................................//
		this.mbRegionsDirty = false;
		this.mbLegendDirty = false;

		// indicate that theming is not applied
		this.mbThemingDirty = true;

		// attach the event
		this.attachEvent('submit', AnalyticMap.prototype.onAnalyticsSubmit, this);

		this.createRegions();
	};

	AnalyticMap.prototype.createRegions = function() {
		// set some default colors
		var colC = this.mColC = AnalyticMap.DefaultRegionColor;
		var colCB = this.mColCB = AnalyticMap.DefaultRegionColorBorder;

		// helper function. returns {} as jQuery.extend can deep copy 'plain' objects only.
		function _createRegion(id, array, type, color, colorBorder, tooltip, entity) {
			var region = {};
			region.K = id;
			region.P = [];
			region.T = tooltip;
			region.C = color;
			region.CB = colorBorder;
			region.HDC = AnalyticMap.DefaultHotDeltaColor;
			region.ACB = region.CB; // no alternative border color per default
			region.G = entity;
			region.S = "false"; // per default nothing selected

			var str, area, areaParts;
			for (var nI = 0, alen = array.length; nI < alen; ++nI) {
				area = array[nI];
				areaParts = [];
				for (var nJ = 0, blen = area.length; nJ < blen; ++nJ) {
					str = "";
					for (var nK = 0, clen = area[nJ].length; nK < clen; ++nK) {
						if (nK) {
							(str += ";");
						}
						str += area[nJ][nK];
					}
					areaParts.push(str);
				}
				region.P.push(areaParts);
			}
			return region;
		}

		// ........................................................................//
		// load the geojson trying different location.............................//
		// first the explicit path, second abap third the default.................//

		var oData = null, aPathGeoJSON = [], oResponse, sPathGeoJSON = "";

		// build array of URLs to check for source JSON in the prioritized order
		aPathGeoJSON[0] = AnalyticMap.GeoJSONURL; // explicit specified
		var oUri = window.URI(AnalyticMap.DefaultABAPGeoJSONURL); // abap system
		oUri.addQuery("sap-language", sap.ui.getCore().getConfiguration().getLanguage()); // append the language parameter to the uri
		aPathGeoJSON[1] = oUri.toString();
		aPathGeoJSON[2] = sap.ui.resource("sap.ui.vbm", AnalyticMap.DefaultGeoJSONURL); // default path

		for (var mI = 0; mI < 3; ++mI) {
			sPathGeoJSON = aPathGeoJSON[mI];
			if (!oData && sPathGeoJSON) {
				oResponse = jQuery.sap.syncGetJSON(sPathGeoJSON);
				if (oResponse.statusCode === 200 && oResponse.data && !oResponse.error) {
					oData = oResponse.data;
					break;
				}
				// else: JSON not found under current URL -> try next
			}
		}

		// verify that the json at the specified location was loaded..............//
		if (!oData) {
			Log.error("The GeoJSON file is invalid or could not be parsed.\r\nPlease contact your Administrator.", sPathGeoJSON, "sap.ui.vbm.AnalyticMap");
			return;
		}

		// load the data with the default settings................................//
		var E = [];
		this.mRegionApplicationTable = E;

		this.mRegionBox = []; // region box
		this.mNames = []; // array of names
		this.mRegionProps = []; // array of properties
		var minX, maxX, minY, maxY;

		var af = oData.features, tt = '', va;
		var xa; // array of bounding boxes for multi parts
		var mpa; // multi polygon array
		var ppa; // polygon parts array - with holes
		for (var nJ = 0, aflen = af.length; nJ < aflen; ++nJ) {
			va = [];
			mpa = [];
			ppa = [];
			xa = [];
			var f = af[nJ];

			// skip the Antarctica.................................................//
			if (f.id2 === "AQ") {
				continue;
			}

			// use id in case id2 is not given
			if (!f.id2) {
				f.id2 = f.id;
			}

			// get the name of the fragment........................................//
			if (f.properties && f.properties.name) {
				tt = f.properties.name;
			} else if (f.properties && f.properties.NAME) {
				tt = f.properties.NAME;
			} else {
				tt = "";
			}
			this.mNames[f.id2] = tt;
			this.mRegionProps[f.id2] = f.properties;

			var coord = f.geometry.coordinates;
			var acn, x, y, tmp, coordlen;
			var nI, nK;

			switch (f.geometry.type) {
				case "Polygon":
					minY = Number.MAX_VALUE;
					maxY = -Number.MAX_VALUE;
					minX = Number.MAX_VALUE;
					maxX = -Number.MAX_VALUE;

					coordlen = coord.length;
					for (nI = 0; nI < coordlen; ++nI) {
						acn = coord[nI];

						// create the vbi float array for regions
						va = [];
						for (nK = 0; nK < acn.length; ++nK) {
							tmp = acn[nK];
							if (!nI) {
								// do min max detection -> only on null'th, since holes will not contribute //
								if ((x = tmp[0]) < minX) {
									minX = x;
								}
								if (x > maxX) {
									maxX = x;
								}
								if ((y = tmp[1]) < minY) {
									minY = y;
								}
								if (y > maxY) {
									maxY = y;
								}
							}
							va.push(tmp[0], tmp[1], "0");
						}
						ppa.push(va);
					}
					mpa.push(ppa);
					xa.push([
						minX, maxX, minY, maxY
					]);
					break;
				case "MultiPolygon":
					for (var nL = 0, acmlen = coord.length; nL < acmlen; ++nL) {
						minY = Number.MAX_VALUE;
						maxY = -Number.MAX_VALUE;
						minX = Number.MAX_VALUE;
						maxX = -Number.MAX_VALUE;

						ppa = [];
						coordlen = coord[nL].length;
						for (nI = 0; nI < coordlen; ++nI) {
							acn = coord[nL][nI];

							// create the vbi float array for regions.....................//
							va = [];
							for (nK = 0; nK < acn.length; ++nK) {
								tmp = acn[nK];
								if (!nI) {
									// do min max detection -> only on null'th, since holes will not contribute //
									if ((x = tmp[0]) < minX) {
										minX = x;
									}
									if (x > maxX) {
										maxX = x;
									}
									if ((y = tmp[1]) < minY) {
										minY = y;
									}
									if (y > maxY) {
										maxY = y;
									}
								}
								va.push(tmp[0], tmp[1], "0");
							}
							ppa.push(va);
						}
						xa.push([
							minX, maxX, minY, maxY
						]);
						mpa.push(ppa);
					}
					break;
				default:
					// ignore all other feature types!
					continue;
			}
			E.push(_createRegion(f.id2, mpa, f.geometry.type, colC, colCB, tt, f.id2));

			// get surrounding box for all parts -> this needs to consider round world for optimized bounding box size!
			this.mRegionBox[f.id2] = window.VBI.MathLib.GetSurroundingBox(xa);
		}
	};

	// ...........................................................................//
	// helper functions for analytic content.....................................//

	AnalyticMap.prototype.getRegionsTemplateObject = function() {
		return {
			"id": "Region",
			"type": "{00100000-2012-0004-B001-F311DE491C77}",
			"entity.bind": "Regions.Entity",
			"datasource": "Regions",
			"posarraymulti.bind": "Regions.PosList",
			"color.bind": "Regions.Color",
			"selectColor": AnalyticMap.DefaultRegionSelectColor,
			"nonSelectColor": AnalyticMap.DefaultRegionNonSelectColor,
			"colorBorder.bind": "Regions.BorderColor",
			"tooltip.bind": "Regions.ToolTip",
			"hotDeltaColor.bind": "Regions.HotDeltaColor",
			"altBorderDeltaColor.bind": "Regions.AltBorderColor",
			"select.bind": "Regions.VB:s",
			"labelText.bind": "Regions.LT",
			"labelPos.bind": "Regions.LP",
			"labelBgColor.bind": "Regions.LBC",
			"labelBorderColor.bind": "Regions.LBBC",
			"labelArrow.bind": "Regions.AR",
			"labelType.bind": "Regions.LabelType"
		};
	};

	AnalyticMap.prototype.getRegionsTypeObject = function() {
		var arr = [
			{
				"name": "Key",
				"alias": "K",
				"type": "string"
			}, {
				"name": "PosList",
				"alias": "P",
				"type": "vectorarraymulti"
			}, {
				"name": "ToolTip",
				"alias": "T",
				"type": "string"
			}, {
				"name": "Color",
				"alias": "C",
				"type": "color"
			}, {
				"name": "BorderColor",
				"alias": "CB",
				"type": "color"
			}, {
				"name": "HotDeltaColor",
				"alias": "HDC",
				"type": "string"
			}, {
				"name": "AltBorderColor",
				"alias": "ACB",
				"type": "color"
			}, {
				"name": "Entity",
				"alias": "G",
				"type": "string"
			}, {
				"name": "VB:s", // selection flag
				"alias": "S",
				"type": "boolean"
			}, {
				"name": "LT", // label text
				"alias": "LT",
				"type": "string"
			}, {
				"name": "LP", // label position
				"alias": "LP",
				"type": "string"
			}, {
				"name": "LBC",
				"alias": "LBC", // label background color
				"type": "color"
			}, {
				"name": "LBBC",
				"alias": "LBBC", // label border color,
				"type": "color"
			}, {
				"name": "AR",
				"alias": "AR", // label arrow
				"type": "boolean"
			}, {
				"name": "LabelType",
				"alias": "LabelType", // label semantic type
				"type": "string"
			}
		];
		return {
			"name": "Regions",
			"minSel": "0",
			"maxSel": "-1",
			"key": "Key",
			"A": arr
		};
	};

	AnalyticMap.prototype.getRegionsDataObjects = function() {
		// apply the region properties to the vbi datacontext.....................//
		// do a real clone of the original data, to be able to handle complete....//
		// model changes..........................................................//
		var aElements = [];
		var aElementsRegions = [];
		var aElementsNonRegions = [];
		var aElementsAll = [];
		jQuery.extend(true, aElements, this.mRegionApplicationTable);

		if (!aElements.length) {
			return null; // return immediately when no regions are available.....//
		}

		// get lookup for modified properties..................................//
		var oRegionMap = this.getRegionMap();

		// iterate over region tables.............................................//
		for (var nJ = 0, len = aElements.length, oRegion, item, tmp; nJ < len; ++nJ) {
			item = aElements[nJ];

			if ((oRegion = oRegionMap[item.K])) {
				// item found, apply properties.....................................//
				item.HDC = "RHLSA(0;1.0;1.0;0.4)"; // lower opacity to 40%
				item.ACB = AnalyticMap.AltBorderColor;
				if ((tmp = oRegion.getColor())) {
					item.C = (this.getPlugin()) ? window.VBI.Utilities.String2VBColor(tmp) : tmp;
				}
				if ((tmp = oRegion.getTooltip())) {
					item.T = tmp;
				}
				item.LT = oRegion.getLabelText();

				item.S = oRegion.getSelect();

				// Label Position 0 means CENTERED
				item.LP = "0";

				item.LBC = oRegion.getLabelBgColor();

				item.LBBC = oRegion.getLabelBorderColor();

				item.AR = oRegion.getLabelArrow();

				var type = oRegion.getLabelType();

				// Applying changes according to the label type
				var oElem = VoBase.prototype.getLabelProps(type);
				if (oElem && item.LT) {
					if (oElem.LBC) {
						item.LBC = oElem.LBC;
					}
					if (oElem.LBBC) {
						item.LBBC = oElem.LBBC;
					}
					if (oElem.LIC) {
						item.LIC = oElem.LIC;
					}
					if (oElem.LICC) {
						item.LICC = oElem.LICC;
					}
					if (oElem.LICTC) {
						item.LICTC = oElem.LICTC;
					}
				}
				if (!item.LBC) {
					item.LBC = "rgba(255,255,255,1.0)";
				}
				if (item.LBBC == "") {
					item.LBBC = item.LBC;
				}

				aElementsRegions.push(item);
			} else {
				aElementsNonRegions.push(item);
			}
		}
		aElementsAll = aElementsNonRegions.concat(aElementsRegions);
		return {
			"name": "Regions",
			"type": "N",
			"E": aElementsAll
		};
	};

	AnalyticMap.prototype.addRegionsActions = function(aActions) {
		// check if the different vo events are registered........................//
		aActions.push({
			"id": "AMap1",
			"name": "RGN_CLICK",
			"refScene": "MainScene",
			"refVO": "Region",
			"refEvent": "Click"
		});
		aActions.push({
			"id": "AMap2",
			"name": "RGN_CONTEXTMENU",
			"refScene": "MainScene",
			"refVO": "Region",
			"refEvent": "ContextMenu"
		});
		// UR: Seems not to be used at all
		// aActions.push( { "id": "AMap3", "name": "regionSelect", "refScene": "MainScene", "refVO": "Region", "refEvent": "regionSelect" });
		// aActions.push( { "id": "AMap4", "name": "regionDeselect", "refScene": "MainScene", "refVO": "Region", "refEvent": "regionDeselect" });

		return aActions;
	};

	// ...........................................................................//
	// helper functions..........................................................//
	AnalyticMap.prototype.findSelected = function(select, data) {
		var aCP = this.getRegions();
		if (!aCP) {
			return null;
		}
		var aSel = [];
		if (jQuery.type(data) == 'object') {
			if (data.S == (select ? "true" : "false")) {
				for (var nI = 0; nI < aCP.length; ++nI) {
					if (aCP[nI].sId == data.K) {
						aSel.push(aCP[nI]);
					}
				}

			}
		} else if (jQuery.type(data) == 'array') {
			for (var nJ = 0; nJ < data.length; ++nJ) {
				if (data[nJ].S == (select ? "true" : "false")) {
					for (var nK = 0; nK < aCP.length; ++nK) {
						if (aCP[nK].mProperties.code === data[nJ].K) {
							aSel.push(aCP[nK]);
						}
					}
				}
			}
		}
		return aSel;
	};

	AnalyticMap.prototype.setSelectionPropFireSelect = function(dat) {
		var oGMDat = {};
		oGMDat.N = [];
		var aN = dat.N;
		for (var nJ = 0; nJ < aN.length; ++nJ) {
			var oAgg = aN[nJ];
			var aEl = oAgg.E;
			var aChangedSel, aChangedDesel;
			var bNonOverlaySelected = false;
			if (oAgg.name == "Regions") {
				aChangedSel = [];
				aChangedDesel = [];

				// get map region overlays..................................//
				var oRegionMap = this.getRegionMap();

				// collect overlay regions which selectin state changes
				for (var nK = 0; nK < aEl.length; ++nK) {
					var oEl = aEl[nK];
					var bEleSel = (oEl.S == "true" ? true : false);
					var oRegion = oRegionMap[oEl.K];
					if (oRegion) {
						var bModelSel = oRegion.getSelect();
						if (bEleSel != bModelSel) {
							oRegion.setProperty("select", bEleSel, /* bSuppressInvalidate= */true); // set selection property
							if (bEleSel && this.mEventRegistry["regionSelect"]) {
								// to be selected according to value
								aChangedSel.push(oRegion); // add element to array to fire the select on aggregation
							} else if (!bEleSel && this.mEventRegistry["regionDeselect"]) {
								// to be deselected
								aChangedDesel.push(oRegion); // add element to array to fire the deselect on aggregation
							}
						}
					} else {
						bNonOverlaySelected = true;
					}
				}

				// fire events
				if (aChangedDesel.length) {
					this.fireRegionDeselect({
						deselected: aChangedDesel
					});
				}
				if (aChangedSel.length) {
					this.fireRegionSelect({
						selected: aChangedSel
					});
				}

				if (bNonOverlaySelected) {
					// non-overlayed region selected -> invalidate to reset this selection
					// Selection state for overlayed regions already written to elements and will be read correctly on update
					this.invalidate();
					this.mbForceDataUpdate = true; // Make sure the data section passes the Minimizer!
				}
			} else {
				oGMDat.N.push(oAgg);
			}
		}
		// let geomap process all other VOs
		if (oGMDat.N.length) {
			GeoMap.prototype.setSelectionPropFireSelect.call(this, oGMDat);
		}
	};

	AnalyticMap.prototype.getSelectedItems = function(data) {
		var aSel = [];
		if (!data) {
			return null;
		}

		for (var nJ = 0; nJ < data.length; ++nJ) {
			if (data[nJ].name === "Regions") {
				var aRegSel = this.findSelected(true, data[nJ].E);
				if (aRegSel && aRegSel.length) {
					aSel = aSel.concat(aRegSel);
				}
			} else {
				var cont = this.getAggregatorContainer(data[nJ].name);
				var aContSel = cont.findSelected(true, data[nJ].E);
				if (aContSel && aContSel.length) {
					aSel = aSel.concat(aContSel);
				}
			}
		}

		return aSel;

	};

	AnalyticMap.prototype.findRegionInAggregation = function(code) {
		var aCP = this.getRegions();
		if (aCP) {
			for (var nJ = 0, len = aCP.length; nJ < len; ++nJ) {
				if (aCP[nJ].mProperties.code === code) {
					return aCP[nJ];
				}
			}
		}
		return null;
	};

	AnalyticMap.prototype.updateVOData = function(saVO, saData, saRemoveData, saType, saAction) {
		if (this.mbThemingDirty) {
			this.applyTheming(this.mRegionApplicationTable);
		}

		// get analytics specific data first.....................................//
		// Note: This ensures Analytic Map lays behind GeoMap objects
		saVO.push(this.getRegionsTemplateObject()); // template object
		saType.push(this.getRegionsTypeObject()); // template type
		// renew all data
		saRemoveData.push({
			name: "Regions",
			type: "N"
		});

		saData.push(this.getRegionsDataObjects()); // data objects containing colors

		// call base class and add GeoMap stuff..................................//
		GeoMap.prototype.updateVOData.apply(this, arguments);

		this.addRegionsActions(saAction);
		// set scale visibility
		// ( t = oGeoMapData ) && (t = t.SAPVB) && (t = t.Scenes) && (t = t.Set) && (t = t.SceneGeo ) && ( !( t.scaleVisible ) ) && (t.scaleVisible =
		// this.getScaleVisible().toString() );

	};

	AnalyticMap.prototype.resetDirtyStates = function() {
		GeoMap.prototype.resetDirtyStates.apply(this, arguments);
		this.mbRegionsDirty = false;
	};

	AnalyticMap.prototype.minimizeApp = function(oApp) {
		GeoMap.prototype.minimizeApp.apply(this, arguments);
		// when no map configuraton is set we remove it because the default......//
		// of the geomap should not be used......................................//
		var t, r;
		if (!this.getMapConfiguration()) {
			(t = oApp) && (t = t.SAPVB) && (t = t.Scenes) && ((r = t.Set) || (r = t.Merge)) && (t = r.SceneGeo) && (t.refMapLayerStack) && (t.refMapLayerStack = "");
		}
		return oApp;
	};

	AnalyticMap.prototype.invalidate = function(oSource) {
		// set the regions dirty state when a property has changed in the region..//
		if (oSource instanceof sap.ui.vbm.Region) {
			this.mbRegionsDirty = true;
		}

		// call base class........................................................//
		GeoMap.prototype.invalidate.apply(this, arguments);
	};

	AnalyticMap.prototype.getRegionMap = function() {
		var oRegionMap = {};
		var aCP = this.getRegions();
		for (var nJ = 0, len = aCP ? aCP.length : 0, item; nJ < len; ++nJ) {
			item = aCP[nJ];
			oRegionMap[item.getCode()] = item;
		}
		return oRegionMap;
	};

	/**
	 * Zoom to one ore more regions.
	 *
	 * @param {string[]} aCodes Array of region codes. The region codes must match the geo json tags.
	 * @param {object} oCorr Correction for the calculated zoom factor. You can either a factor, the calculated zoom is multplied with or a array with
	 *        pixels to be added as border in the sequence [left, top,right, bottom].
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	AnalyticMap.prototype.zoomToRegions = function(aCodes, oCorr) {
		if (oCorr == undefined) {
			oCorr = 0.9999;
		}

		// get the bounding box around............................................//
		var areaList = [];

		// get the min max values from the region boxes...........................//
		for (var nJ = 0, len = aCodes.length; nJ < len; ++nJ) {
			var rb = this.mRegionBox[aCodes[nJ]];
			if (rb != undefined) {
				areaList.push(rb);
			}
		}

		// return immediately when no bounds found................................//
		if (!areaList.length) {
			return;
		}

		// the project must be loaded already.....................................//
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			scene.ZoomToAreas(areaList, oCorr);
		}
	};

	/**
	 * Returns Infos for Regions like name, bounding box and midpoint
	 *
	 * @param {string[]} aCodes Array of region codes. The region code must match the geo json tag.
	 * @returns {array} Array of Region Information Objects. Each object in the array has the properties BBox: Bounding Box for Region in format
	 *          "lonMin;latMin;lonMax;latMax", Midpoint: Centerpoint for Region in format "lon;lat", Name: Name of the region, and Properties: Array
	 *          of name-value-pair associated with the region
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	AnalyticMap.prototype.getRegionsInfo = function(aCodes) {
		var result = [];
		for (var nJ = 0, len = aCodes.length, code; nJ < len; ++nJ) {
			code = aCodes[nJ];
			result[code] = {};
			result[code].BBox = this.mRegionBox[code];
			result[code].Midpoint = [
				(this.mRegionBox[code][0] + this.mRegionBox[code][1]) / 2, (this.mRegionBox[code][2] + this.mRegionBox[code][3]) / 2
			];
			result[code].Name = this.mNames[code];
			result[code].Properties = this.mRegionProps[code];
		}
		return result;
	};

	AnalyticMap.prototype.onThemeChanged = function(oEvent) {
		// suppose colors have changed
		this.mbThemingDirty = true;
		this.invalidate();
	};

	AnalyticMap.prototype.applyTheming = function(aRegions) {
		if (sap.ui.core.theming && Parameters) { // only if theming parameters are available
			var sColC = AnalyticMap.DefaultRegionColor;
			if (Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBG") != undefined) {
				sColC = AnalyticMap.DefaultRegionColor = Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBG");
			}
			var sColCB = AnalyticMap.DefaultRegionColorBorder;
			if (Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBorder") != undefined) {
				sColCB = AnalyticMap.DefaultRegionColorBorder = Parameters.get("_sap_ui_vbm_shared_ChoroplethRegionBorder");
			}
			if (this.getPlugin()) { // plug-in mode -> make sure color format matches plugin requirements
				sColC = window.VBI.Utilities.String2VBColor(sColC);
				sColCB = window.VBI.Utilities.String2VBColor(sColCB);
			}
			if (sColC != this.mColC || sColCB != this.mColCB) {
				// apply new colors colors
				for (var i = 0; i < aRegions.length; ++i) {
					// Note: Only change default colors
					if (aRegions[i].C === this.mColC) {
						aRegions[i].C = sColC;
					}
					if (aRegions[i].CB === this.mColCB) {
						aRegions[i].CB = sColCB;
					}
				}
				// remember new default colors
				this.mColC = sColC;
				this.mColCB = sColCB;
			}
			this.mbThemingDirty = false;
		}
	};

	AnalyticMap.prototype.isRegionSubscribed = function(event, region) {
		// check subscriptions on region level only
		if (region) {
			var item = this.findRegionInAggregation(region)
			return item && item.hasListeners(event);
		}
		return false;
	};

	return AnalyticMap;
});
