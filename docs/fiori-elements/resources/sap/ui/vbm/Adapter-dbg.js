/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.Adapter
sap.ui.define([
	"sap/ui/core/Element",
	"jquery.sap.global",
	"sap/base/Log",
	"./library"
], function(Element, jQuery, Log, library) {
	"use strict";

	var thisModule = "sap.ui.vbm.Adapter";

	/**
	 * Constructor for a new GeoMap Adapter.
	 *
	 * @class
	 * Provides the ability to load VBI JSON into {@link sap.ui.vbm.GeoMap sap.ui.vbm.GeoMap} control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Adapter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Adapter = Element.extend("sap.ui.vbm.Adapter", /** @lends sap.ui.vbm.Adapter.prototype */ {
		metadata: {

			library: "sap.ui.vbm",

			associations: {
				/**
				 * The GeoMap control associated with the Adapter. The adapter would invoke methods and subscribe to events
				 * on this GeoMap instance
				 *
				 **/
				map: {
					type: "sap.ui.vbm.GeoMap"
				}
			},

			events: {
				/**
				 * The event is raised when a when the Adapter receives an event from GeoMap control. It is intended to unify the various
				 * GeoMap events as provided by VBI.
				 */
				submit: {
					parameters: {
						data: {
							type: "string"
						}
					}
				}
			}
		}
	});

	Adapter.prototype.init = function() {
		// event handlers from actions and automations
		this._eventHandlers = [];
		this._actions = [];

		//initialize section
		this._mapConfiguration = {};
		this._clusterVOs = new Map();

		//Dictionary for Data Attributes
		this._dataTypes = {};
		this._data = {};
		this._idKeyMap = {};

		//Properties in VBI JSON that need special handling
		this._propsAnomalies = new Map();
		this._propsAnomalies.set("pos", "position");
		this._propsAnomalies.set("posarray", "position");
		this._propsAnomalies.set("dragdata", "dragData");

		// Allowed Route properties
		this._routeProperties = [
			"color",
			"colorBorder",
			"directionIndicator",
			"dotcolor",
			"dotwidth",
			"dragdata",
			"end",
			"hotDeltaColor",
			"labelBgColor",
			"labelPos",
			"labelText",
			"lineDash",
			"linewidth",
			"posarray",
			"selectColor",
			"start",
			"tooltip"];

		this._areaProperties = [
			"key", //K: VoBase
			"color", //C: Area, OBJECT_BASE_DATA->FILL_COLOR
			"colorBorder", //D/CB: Area, OBJECT_BASE_DATA->BORDER_COLOR
			"posarray", //H, PM (multipart) /P: Area, AREA_EXTENSION->BORDER_POINTS
			"selectColor", //SC: OBJECT_BASE_DATA->SELECT_COLOR
			"dragdata", //DD: VoAggregation, OBJECT_BASE_DATA->DRAG_DATA
			"VB:s", //VB:s: elected, OBJECT_BASE_DATA->SELECTED
			"VB:c", //H/VB:c: VoAggregation (changeable) OBJECT_BASE_DATA->CHANGEABLE
			"hotScale", //HS: VoAggregation
			"hotDeltaColor", //HC/HDC: VoAggregation, OBJECT_BASE_DATA->HOT_COLOR
			"borderDash", //BD: Area
			"selectColor", //SC: VoAggregation
			"fxdir", //FD: VoAggregation
			"fxsize", //FS: VoAggregation
			"entity", //ET: VoAggregation
			"labelBgColor", //LC/LBC: VoAggregation
			"labelBorderColor", //LBBC: VoAggregation
			"labelPos",  //LP: VoAggregation
			"labelText", //LT: VoAggregation
			"labelArrow", //??VOBase
			"label", //L
			"labelAlignment", //"LA"
			"tooltip" //B/TT: VoAggregation
		];

			// Allowed Spot properties
		this._spotProperties = [
			"alignment",
			"contentOffset",
			"dragdata",
			"fxdir",
			"fxsize",
			"hotDeltaColor",
			"icon",
			"image",
			"labelBgColor",
			"labelPos",
			"labelText",
			"pos",
			"selectColor",
			"tooltip",
			"semanticType"];
	};

	Adapter.prototype.exit = function() {
		// stop listening all events
		this._actions.forEach(function(action) { action.detach(); }); // unsubscrube from all actions events handling
		this._detachHandlers(); // unsubscribe from automation events handling
	};

	Adapter.prototype.setMap = function(map) {
		var oldMap = this._map() || null;
		var newMap = sap.ui.getCore().byId(map instanceof sap.ui.vbm.GeoMap ? map.getId() : map);

		if ((oldMap != newMap) && (oldMap != null)) {
			this._detachHandlers();
			this.init();
		}
		this.setAssociation("map", map, true);

		if (newMap != null) {
			var oModel = new sap.ui.model.json.JSONModel();

			//increase the size limit for the model otherwise excess VOs won't display on map
			oModel.setSizeLimit(100000);
			newMap.setModel(oModel);
		}
	};

	/**
	 * Intrernal helper function to get map object out of map association

	 * @returns {sap.ui.vbm.GeoMap} The instance of Geomap
	 * @private
	 */
	Adapter.prototype._map = function() {
		return sap.ui.getCore().byId(this.getMap());
	};

	/**
	 * Attaches the specified event handler to the specified event with the provided listener.
	 * Mainly used for custom events - FCODE_SELECT & DETAILS_FCODE_SELECT
	 *
	 *
	 * @param {string} eventName The name of the event on 'this' to which the handler needs to be attached. <br/>
	 * @param {function} handler The handler needs to be attached. <br/>
	 * @param {object} listener The listener - would turn out to be value of 'this' inside the event handler. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._attachHandler = function(eventName, handler, listener) {
		if ((eventName in this.mEventRegistry) && (this.mEventRegistry[eventName].length > 0)) {
			return this;
		} else {
			if (!listener._eventHandlers.some(function(eh) { return eh === handler; })) {
				listener._eventHandlers.push(handler);
			}
			this.attachEvent(eventName, handler, listener);
			return this;
		}
	};

	/**
	 * Detaches the adapter's event handlers from the instance of GeoMap instance associated with GeoMap
	 *
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._detachHandlers = function() {
		var that = this;
		var detachHandlers = function(sEventId) {
			if (this.hasListeners(sEventId)) {
				var aEventListeners = this.mEventRegistry[sEventId];

				for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
					var index = that._eventHandlers.indexOf(aEventListeners[i].fFunction);
					if (index !== -1 ) {
						this.detachEvent(sEventId, aEventListeners[i].fFunction, aEventListeners[i].oListener);
					}
				}
			}
		};

		var geoMap = this._map();
		if (geoMap != null) {
			var oMapEvents = geoMap.mEventRegistry;

			for (var aEvent in oMapEvents) {
				if (oMapEvents.hasOwnProperty(aEvent)) {
					detachHandlers.call(geoMap, aEvent);
				}
			}

			var detachVoHandlers = function(oVo) {
				var oVoEvents = oVo.mEventRegistry;

				for (var aVoEvent in oVoEvents) {
					if (oVoEvents.hasOwnProperty(aVoEvent)) {
						detachHandlers.call(oVo, aVoEvent);
					}
				}
			};

			geoMap.getVos().forEach(detachVoHandlers);
		}

		return this;
	};

	/**
	 * Parses and process sections of the VBI JSON and loads them into JSON Model bound to the GeoMap
	 *
	 * @param {string | object} data VBI JSON to be loaded into the GeoMap control. <br/>
	 * @returns {Promise} A Promise object that is resolved when the VBI JSON is processed.
	 * @public
	 */
	Adapter.prototype.load = function(data) {
		var obj = null;

		if (typeof data === 'string') {
			try {
				obj = JSON.parse(data);
			} catch (ex) {
				Log.debug("attempt to load invalid JSON string", "", thisModule);
				return this;
			}
		} else if (typeof data === 'object') {
			obj = data;
		}

		if (!obj) {
			Log.debug("nothing to load", "", thisModule);
			return this;
		}
		if (!obj.SAPVB) {
			Log.debug("invalid object supplied for load", "", thisModule);
			return this;
		}
		if (obj.SAPVB.Config) {
			this._processConfiguration(obj.SAPVB.Config);
		}
		if (obj.SAPVB.Resources) {
			this._processResources(obj.SAPVB.Resources);
		}
		if (obj.SAPVB.DataTypes) {
			this._processDataTypes(obj.SAPVB.DataTypes);
		}
		//this has to be processed before scene to mark cluster VOs which must not be created
		if (obj.SAPVB.Clustering) {
			this._processClusters(obj.SAPVB.Clustering);
		}

		return (obj.SAPVB.MapProviders ? this._processMapProviders(obj.SAPVB.MapProviders)
			: Promise.resolve()).then(function() {
				if (obj.SAPVB.MapLayerStacks) {
					this._processMapLayerStacks(obj.SAPVB.MapLayerStacks);
				}

				if (obj.SAPVB.Scenes) {
					this._processScenes(obj.SAPVB.Scenes);
				}

				if (obj.SAPVB.Data) {
					this._processData(obj.SAPVB.Data);
				}

				if (obj.SAPVB.Actions) {
					this._processActions(obj.SAPVB.Actions);
				}

				if (obj.SAPVB.Automation && obj.SAPVB.Automation.Call) {
					this._processAutomation(obj.SAPVB.Automation, obj.SAPVB.Menus);
				}

				if (obj.SAPVB.Windows) {
					this._processDetailWindows(obj);
				}
			}.bind(this));
	};

	/**
	 * Processes the Configuration section of the VBI JSON
	 *
	 * @param {object} configuration Configuration section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processConfiguration = function(configuration) {
		return this;
	};

	/**
	 * Processes the Resources section of the VBI JSON. Delta load is not supported for resources.
	 *
	 * @param {object} resources Resources section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processResources = function(resources) {
		if (resources.Set) {
			var geoMap = this._map();
			geoMap.destroyResources();

			[].concat(resources.Set.Resource).forEach(function(res) {
				geoMap.addResource(new sap.ui.vbm.Resource({"name": res.name, "value": res.value}));
			}, this);
		}

		//Delta load of resources isn't supported from back-end - Need not check resources.Remove

		return this;
	};

	/**
	 * Processes the DataTypes section of the VBI JSON. Delta load is supported for this section but VBI back-end does not
	 * provide an option for it.
	 *
	 * @param {object} dataTypes DataTypes section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processDataTypes = function(dataTypes) {
		if (dataTypes.Set) {
			// Delta - The below check is an assumption - There is now way this can be true since none of the
			// simple transformations on the backend support delta on Data types yet.
			if (dataTypes.Set.name && dataTypes.Set.type && (dataTypes.Set.type === "N")) {
				[].concat(dataTypes.Set.N).foreach(function(dt) {
					this._dataTypes.forEach(function(_dt) {
						if (_dt.name == dt.name) {
							_dt = dt;
						}
					});
				});
			} else {
				// This is Replace all Data types
				this._dataTypes = [].concat(dataTypes.Set.N);
			}
		}
		return this;
	};

	/**
	 * Processes the Data section of the VBI JSON. Delta load is supported for this section.
	 *
	 * @param {object} data Data section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processData = function(data) {
		/*
		 * Helper function to perform a lookup of the DataTypes and fetch the name of the attribute from its alias and data type name
		 *
		 * */
		var findAttribute = function(a, name) {
			var oEntry = sap.ui.vbm.findInArray(this._dataTypes, function(_dt) { return _dt.name == name; });

			if ((oEntry == null) || !(oEntry.A)) {
				return undefined;
			} else {
				var oAttr = sap.ui.vbm.findInArray(oEntry.A, function(_a) { return _a.alias == a; });
				if (oAttr != null) {
					return oAttr.name;
				} else {
					return undefined;
				}
			}
		};

		var set = function(n) {
			if (n.name && n.E) {
				this._data[n.name] = [].concat(n.E).map(function(e) {
					var d = {};
					for (var a in e) {
						if ((a !== "xmlns:VB") &&
							(a !== "n.name") &&
							e.hasOwnProperty(a)) {
							if (a === "VB:c") {
								d["changeable"] = e[a];
							} else if (a === "VB:s") {
								d["select"] = e[a];
							} else {
								var sAttr = findAttribute.call(this, a, n.name);
								if ((sAttr != null) && (sAttr !== "")) {
									d[sAttr] = e[a];
								} else {
									d[a] = e[a];
								}
							}
						}
					}

					return d;
				}, this);
			}
		};

		var update = function(e) {
			var d = {};
			for (var a in e) {
				if ((a !== "xmlns:VB") &&
					(a !== "n.name") &&
					e.hasOwnProperty(a)) {
					if (a === "VB:c") {
						d["changeable"] = e[a];
					} else if (a === "VB:s") {
						d["select"] = e[a];
					} else {
						var sAttr = findAttribute.call(this, a, e["n.name"]);
						if ((sAttr != null) && (sAttr !== "")) {
							d[sAttr] = e[a];
						} else {
							d[a] = e[a];
						}
					}
				}
			}

			//If the aggregation doesn't exist, initialize it to an empty array.
			if (!this._data[e["n.name"]]) {
				this._data[e["n.name"]] = [];
			}

			if (this._data[e["n.name"]].some(function(_d) {return _d.Key == e.K;})) {
				// The instance (Spot) already exists - modify it
				var index = sap.ui.vbm.findIndexInArray(this._data[e["n.name"]], function(_d) { return _d.Key === e.K; });
				if (index !== -1) {
					this._data[e["n.name"]][index] = d;
				}
			} else {
				// The instance (Spot) doesn't exist - push it
				this._data[e["n.name"]].push(d);
			}
		};

		if (data.Remove) {
			[].concat(data.Remove).filter(function(r) {
				return (r.N && r.N.E);
			}).forEach(function(r) {
				[].concat(r.N.E).forEach(function(e) {
					var index = sap.ui.vbm.findIndexInArray(this._data[r.name], function(_d) { return _d.Key === e.K; });

					if (index !== -1) {
						this._data[r.name].splice(index, 1);
					}
				}, this);
			}, this);
		}

		/*
		 * The key to differentiating delta load from full update is the structure of
		 * data.Set. See simple transformation VBI_DYN_DATA_TRANSFER
		 *
		 * --> Delta Load
		 * "Data" : {
		 * 	"Set": [
		 * 		{ "name": "Spots", "type": "N", ....},
		 *      { "name": "Links", "type": "N", ....},
		 *      { "name": "Areas", "type": "N", ....},
		 * 	]
		 * }
		 *
		 * --> Full Update
		 *	"Data": {
	  	 *		"Set": {
		 *			"N": [
		 *				{ "name": "Spots", ... },
		 *				{ "name": "Links", ... },
		 *              { "name": "Areas", ... },
		 *			]
		 *		}
		 *	}
		 *
		 *  Conditions to differentiate full update from full load
		 *  	Data.Set, is an object, does not have has attributes other than N (namely name & type)
		 *  	Other wise delta load
		 * */

		if (data.Set && (typeof data.Set === 'object') && !(jQuery.isEmptyObject(data.Set))) {
			if (!Array.isArray(data.Set) && !(data.Set.name) && !(data.Set.type)) {
				//Full Update - Replace complete Data Section
				this._data = {};
				if (data.Set.N !== null) {
					[].concat(data.Set.N).forEach(set, this);
				}

			} else {
				//Delta Update
				[].concat(data.Set)
					.filter(function(s) { return (s.name) && (s.type); })
					.map(function(s) { return [].concat(s.N); })
					.reduce(function(oAn, oBn) { return oAn.concat(oBn); })
					.map(function(n) {
						var e = n.hasOwnProperty("E") && n.E ? [].concat(n.E) : [];
						return e.map(function(_e) {
							_e["n.name"] = n.name;
							return _e;
						});
					})
					.reduce(function(oAe, oBe) { return oAe.concat(oBe); })
					.forEach(update, this);
			}
		}

		this._map().getModel().setData(this._data, false);
		return this;
	};

	/**
	 * Processes the MapProviders section of the VBI JSON. Delta load is supported for this section.
	 *
	 * @param {object} providers MapProviders section of VBI JSON transformed into map provider structure for GeoMap. <br/>
	 * @returns {Promise} A Promise object that is resolved when the MapProviders in VBI JSON is processed.
	 * @private
	 */
	Adapter.prototype._processMapProviders = function(providers) {
		if (providers.Set && providers.Set.MapProvider) { //support only for "set" verb
			var mapProviders = [].concat(providers.Set.MapProvider).map(function(provider) {
				return {
					name 			: provider.name,
					tileX			: provider.tileX,
					tileY			: provider.tileY,
					minLOD			: provider.minLOD,
					maxLOD			: provider.maxLOD,
					copyright		: provider.copyright,
					MapBase			: provider.MapBase,
					copyrightImage	: provider.copyrightImage,
					copyrightLink	: provider.copyrightLink,
					description		: provider.description,
					projection		: provider.projection,
					resolution		: provider.resolution,
					retries			: provider.retries,
					type			: provider.type,
					Header			: provider.Header ? [].concat(provider.Header).map(function(header) {
						return {
							name  : header.name,
							value : header.value
						};
					}) : provider.Header,
					Source			: provider.Source ? [].concat(provider.Source).map(function(source) {
						return {
							id	: source.id,
							url	: source.url
						};
					}) : provider.Source
				};
			});

			var googleSniffer = function(source) {
				// var sRegex = /:\/\/(.[^/]+)/;
				// var sHostname = sUrl.match(sRegex)[1];
				// return sHostname.endsWith("googleapis.com");
				return source && source.url && source.url.indexOf("google") !== -1;
			};

			var aGoogleTileApiSources = mapProviders
				.map(function(oProvider) { return [].concat(oProvider.Source); })
				.reduce(function(a, b) { return a.concat(b); })
				.filter(googleSniffer);

			if (aGoogleTileApiSources.length > 0) {
				var apiKeys = [];
				var oGoogleTileApiSourcesByApiKey = aGoogleTileApiSources.reduce(function(g, a) {
					var apiKey = a.url.split("key=")[1];
					g[apiKey] = g[apiKey] || [];
					if (sap.ui.vbm.findIndexInArray(apiKeys, function(k) { return k === apiKey; } ) === -1) {
						apiKeys.push(apiKey);
					}
					g[apiKey].push(a);
					return g;
				}, {});

				var getSessionResponse = function(apiKey) {
					return new Promise(function(resolve, reject) {
						var xmlHttp = new XMLHttpRequest();
						xmlHttp.open("POST", 'https://www.googleapis.com/tile/v1/createSession?key=' + apiKey, true); // true for asynchronous
						xmlHttp.setRequestHeader("Content-Type", "application/json");

						xmlHttp.onreadystatechange = function() {
							if (xmlHttp.readyState == 4) {
								if (xmlHttp.status == 200) {
									resolve(JSON.parse(xmlHttp.responseText));
								} else {
									reject(new Error(xmlHttp.statusText));
								}
							}
						};

						var parameters = {
							"mapType": "terrain",
							"language": "en-NZ",
							"region": "nz",
							"layerTypes": [ "layerRoadmap" ],
							"overlay":  false,
							"scale": "scaleFactor1x"
						};
						xmlHttp.send(JSON.stringify(parameters));

					}).then(function(response) {
						// Expected URL from backend
						// https://www.googleapis.com/tile/v1/tiles/{Z}/{X}/{Y}?key=YOUR_API_KEY
						if (response && response.session) {
							oGoogleTileApiSourcesByApiKey[apiKey].forEach(function(source) {
								source.url = source.url + "&session=" + response.session;
							});
						}
					}, function(statusText) {
						Log.debug(statusText, "", thisModule);
					});
				};

				return Promise.all(apiKeys.map(getSessionResponse)).then(function() {
					this._mapConfiguration.MapProvider = mapProviders;
					this._updateMapconfiguration();
				}.bind(this));
			} else {
				this._mapConfiguration.MapProvider = mapProviders;
				this._updateMapconfiguration();
				return Promise.resolve();
			}
		}
		return this;
	};

	/**
	 * Processes the MapLayerStacks section of the VBI JSON. Delta load is supported for this section.
	 *
	 * @param {object} stacks MapLayerStacks section of VBI JSON transformed into map layer stacks structure for GeoMap. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processMapLayerStacks = function(stacks) {
		//support only for "set" verb
		if (stacks.Set && stacks.Set.MapLayerStack) {
			this._mapConfiguration.MapLayerStacks = [];
			[].concat(stacks.Set.MapLayerStack).forEach(function(src) {
				var stack = {name: src.name}, singleBMP = "true"; // single image stack has all layers markes as single image
				if (src.MapLayer) {
					stack.MapLayer = [];
					[].concat(src.MapLayer).forEach(function(item) {
						var layer = {
							name           : item.name,
							refMapProvider : item.refMapProvider,
							opacity        : item.opacity,
							colBkgnd       : item.colBkgnd,
							singleBMP      : item.singleBMP || "false"
						};
						singleBMP = layer.singleBMP !== "true" ? "false" : singleBMP;
						stack.MapLayer.push(layer);
					});
					stack.singleBMP = src.singleBMP || singleBMP; // priority if single image defined on stack level
				}
				this._mapConfiguration.MapLayerStacks.push(stack);
			}, this);
			this._updateMapconfiguration();
		}
		return this;
	};

	/**
	 * Sets the GeoMap's Map configuration to the transformed MapLayerStacks and MapProviders from VBI JSON.
	 *
	 * @param {object} mapLayerStacks MapLayerStacks section of VBI JSON transformed into map layer stacks structure for GeoMap. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._updateMapconfiguration = function() {
		if (this._mapConfiguration.MapProvider && this._mapConfiguration.MapLayerStacks) {
			this._map().setMapConfiguration(this._mapConfiguration);
		}
		return this;
	};

	/**
	 * Generates unique UI5 id by prepending requested id with map id
	 *
	 * @param {string} id Input id of an object <br/>
	 * @returns {string} input id prepended with the map id
	 * @private
	 */
	Adapter.prototype._ui5Id = function(id) {
		return this._map().getId() + "-" + id;
	};

	/**
	 * Processes the VOs array from VBI JSON VBI JSON.
	 *
	 * @param {object[]} oScenes Scenes section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processScenes = function(oScenes) {
		//Process VOs only if scene is SceneGeo
		if (oScenes.Set && oScenes.Set.SceneGeo) {
			var oMap = this._map();

			if (oScenes.Set.SceneGeo.initialStartPosition) {
				oMap.setCenterPosition(oScenes.Set.SceneGeo.initialStartPosition);
			}

			if (oScenes.Set.SceneGeo.initialZoom) {
				oMap.setZoomlevel(Math.floor(oScenes.Set.SceneGeo.initialZoom));
			}

			if (oScenes.Set.SceneGeo.refMapLayerStack) {
				oMap.setRefMapLayerStack(oScenes.Set.SceneGeo.refMapLayerStack);
			}

			var vos = oScenes.Set.SceneGeo.VO;
			oMap.destroyVos();

			if (!vos) {
				return this;
			}

			vos.forEach(function(definition) {
				// skip cluster VOs as we're converting from Spots (VO) based clustering to container based clustering on a fly and do not need cluster VOs at all
				// see _processCluster() for details
				if (this._clusterVOs.has(definition.id)) {
					return;
				}
				var voTemplate, voAggregation, boundProperties = [], settings = {};

				function processProperties(allowedAttributes, propsAnomalies) {
					for (var attribute in definition) {
						var pos = attribute.indexOf('.bind');
						var property = pos !== -1 ? attribute.substring(0, pos) : attribute;

						if (allowedAttributes.indexOf(property) !== -1) {
							property = propsAnomalies.get(property) || property;
							var value = definition[attribute];

							if (pos !== -1) {
								value = definition[attribute].substring(definition[attribute].indexOf('.') + 1);
								boundProperties.push(value);
							}
							settings[property] = pos !== -1 ? "{" + value + "}" : value;
						}
					}
				}
				// This function doesn't support data binding for Drag'N'Drop related subnodes
				// as it will require to change loading for data types and data sections from list like approach to full tree approach
				function processDragAndDrop() {
					if (definition.DragSource && voAggregation.getMetadata().hasAggregation("dragSource")) {
						[].concat(definition.DragSource.DragItem).forEach(function(item) {
							voAggregation.addDragSource(new sap.ui.vbm.DragSource({
								type: item.type
							}));
						});
					}
					if (definition.DropTarget && voAggregation.getMetadata().hasAggregation("dropTarget")) {
						[].concat(definition.DropTarget.DropItem).forEach(function(item) {
							voAggregation.addDropTarget(new sap.ui.vbm.DropTarget({
								type: item.type
							}));
						});
					}
				}

				switch (definition.type) {
					case "{00100000-2012-0004-B001-64592B8DB964}": // Spot
						processProperties(this._spotProperties, this._propsAnomalies);
						voTemplate = new sap.ui.vbm.Spot(settings);
						voAggregation = new sap.ui.vbm.Spots(this._ui5Id(definition.id));
						processDragAndDrop();
						break;
					case "{00100000-2012-0004-B001-C46BD7336A1A}": // Route
						processProperties(this._routeProperties, this._propsAnomalies);
						voTemplate = new sap.ui.vbm.Route(settings);
						voAggregation = new sap.ui.vbm.Routes(this._ui5Id(definition.id));
						processDragAndDrop();
						break;
					case "{00100000-2012-0004-B001-F311DE491C77}": // Area
						processProperties(this._areaProperties, this._propsAnomalies);
						voTemplate = new sap.ui.vbm.Area(settings);
						voAggregation = new sap.ui.vbm.Areas(this._ui5Id(definition.id));
						processDragAndDrop();
						break;
					case "{00100000-2014-0004-BDA8-87B904609063}": // "ExtArea" GUID??? from sapvobase
					case "{00100000-2014-0004-B001-9F1B43BE944A}": // "ExtLink" GUID??? from sapvobase
					case "{00100000-2013-0004-B001-7EB3CCC039C4}": // Circle
					case "{00100000-2013-0004-B001-686F01B57873}": // Geo Circle
					case "{00100000-2012-0004-B001-BFED458C3076}": // Box
					case "{00100000-2012-0004-B001-383477EA1DEB}": // Pie Chart
					case "{388951f5-a66b-4423-a5ad-e0ee13c2246f}": // Decal
					default:
						Log.debug("unsupported VO type", definition.type, thisModule);
						return;
				}

				var index = sap.ui.vbm.findIndexInArray(this._dataTypes, function(_d) { return _d.name === definition.datasource; });

				if (index !== -1) {
					var dataType = this._dataTypes[index];
					/*
					* REF-1
					* The back-end eventing is based on the Key attribute for each VO from the Data section.
					* However, GeoMap does not consider these values. This becomes a problem when converting a GeoMap event into
					* Adapter's submit event - the key corresponding to the VO (ex. Spot) which is the object of the event (clicked) needs to embedded into
					* the event payload to enable backend to continue with it's event pipeline.
					*
					* Hence, the below binds this key to an addition attribute stored on the model bound to the VOAggregation so that the same can be retrieved.
					* */
					voTemplate.bindProperty("key", { path: dataType.key });
					boundProperties.push(dataType.key);

					// custom properties handling
					var customProperties = [];

					dataType.A.forEach(function(attribute) {
						if (boundProperties.indexOf(attribute.name) === -1) {
							customProperties.push(attribute.name);
							var data = new sap.ui.core.CustomData({
								key: attribute.name,
								value: "{" + attribute.name + "}"
							});
							voTemplate.addCustomData(data);
						}
					});

					if (customProperties.length) {
						voAggregation.setCustomProperties(customProperties);
					}
					voAggregation.bindAggregation("items", {
						path: "/" + definition.datasource + "",
						template: voTemplate
					});
				} else {
					voAggregation.addItem(voTemplate);
				}
				oMap.addVo(voAggregation);
			}.bind(this));
		} else if (oScenes.Merge && oScenes.Merge.SceneGeo
			&& oScenes.Merge.SceneGeo.refMapLayerStack) {
				this._map().setRefMapLayerStack(oScenes.Merge.SceneGeo.refMapLayerStack);
		}
		return this;
	};

	/**
	 * Action object
	 *
	 * @param {object} def Action definition object from VBI JSON payload
	 * @param {sap.ui.vbm.Adapter} adapter Adapter object for future references
	 * @private
	 */
	function Action(def, adapter) {
		Object.assign(this, def); //copy all props
		this._adapter = adapter;

		if (!this.refVO) {
			this.refVO = "General";
		}
	}

	/**
	 * Attach action's handler to a target object
	 * @returns {bool} True if handler has been successfully attached, false otherwise
	 * @private
	 */
	Action.prototype.attach = function() {
		var cluster = false;
		this._listener = this._adapter; // default handler context
		this._handler = this._adapter._handler; // default handler

		if (this.refVO === "Map" || this.refVO === "General") {
			this._target = this._adapter._map();
		} else {
			var id = this._adapter._ui5Id(this.refVO);
			this._target = sap.ui.vbm.findInArray(this._adapter._map().getVos(), function(vo) { return vo.getId() === id; }); // find target VO

			if (!this._target) { // if not found check cluster VOs as well
				this._target = this._adapter._clusterVOs.get(this.refVO);
				cluster = !!this._target;
			}
		}

		if (!this._target) {
			Log.warning("unable to attach action", this.id, thisModule);
			return false;
		}

		switch (this.refEvent) {
			case "Click":
				this._event = "click";
				if (cluster) {
					this._listener = this;
					this._handler = function(event) { this._adapter._handler(event, this); }; // pass action definition to the handler for further processing
				}
				break;
			case "ContextMenu":
				this._event = "contextMenu";
				if (cluster) {
					this._listener = this;
					this._handler = function(event) { this._adapter._handler(event, this); }; // pass action definition to the handler for further processing
				}
				break;
			case "DoubleClick":
				this._event = "click";
				this._handler = this._adapter._clickHandler;
				if (cluster) {
					this._listener = this;
					this._handler = function(event) { this._adapter._clickHandler(event, this); }; // pass action definition to the handler for further processing
				}
				break;
			case "Drop":
				this._event = "drop";
				break;
			case "CreateComplete":
				this._event = "createComplete";
				break;
			case "Select":
				this._event = "select";
				break;
			case "KeyPress":
				if (this._target !== this._adapter._map()) { // only map supports key events
					return false;
				}
				this._event = "keyDown";
				this._target.setKeyEventDelay(250);
				this._target.setAllowKeyEventRepeat(false);
				this._handler = this._adapter._getKeyboardHandler(this.name);
				break;
			default:
				if (this.refEvent && this.name) {
					//register for event on map that we don't explicitly handle using its legacy name as its refevent name is unlikely to propagate
					Log.info("No UI5 event found to attach action to. Falling through to default vbi event handling.", this.name, thisModule);
					this._event = this.name;
				} else {
					Log.error("Action invalid. No refEvent or name supplied.", this, thisModule);
					return false;
				}
		}
		this._target.attachEvent(this._event, this._handler, this._listener);
		this._target.invalidate(); // neccessary evil, to force recreation of VO on VBI level, otherwise VO on GeoMap level updated but not on VBI level
		return true;
	};

	/**
	 * Detach action's handler from target object
	 *
	 * @private
	 */
	Action.prototype.detach = function() {
		// unsubscribe from event handling
		if (this._target && this._event && this._handler && this._listener) {
			this._target.detachEvent(this._event, this._handler, this._listener);
			this._target.invalidate(); // neccessary evil, to force recreation of VO on VBI level, otherwise VO on GeoMap level updated but not on VBI level
			this._target = this._event = this._handler = this._listener = undefined;
		}
	};

	/**
	 * Removing action from the list of actions
	 *
	 * @param {number} index Index of action to remove
	 * @private
	 */
	Adapter.prototype._removeAction = function(index) {
		var remove = this._actions[index];
		remove.detach();
		this._actions.splice(index, 1);
		// when both click & double click present -> when removing double click -> click must be activated
		if (remove.refEvent === "DoubleClick") {
			var click = sap.ui.vbm.findInArray(this._actions, function(action) { return action.refVO === remove.refVO && action.refEvent === "Click"; });
			if (click) {
				click.attach();
			}
		}
	};

	/**
	 * Adding action to the list of actions
	 *
	 * @param {object} def Action definition from VBI JSON payload
	 * @private
	 */
	Adapter.prototype._addAction = function(def) {
		var action = new Action(def, this);
		if (def.refEvent === "Click") {
			// if double click is there already -> don't do anything as it's handler handles both click & double click events
			if (this._actions.some(function(action) { return action.refVO === def.refVO && action.refEvent === "DoubleClick"; }, this)) {
				this._actions.push(action);
				return;
			}
		} else if (def.refEvent === "DoubleClick") {
			// if click is there already -> detach it (but keep in the list) and attach double click instead
			var click = sap.ui.vbm.findInArray(this._actions, function(action) { return action.refVO === def.refVO && action.refEvent === "Click"; }, this);
			if (click) {
				click.detach();
			}
		}
		if (action.attach()) {
			this._actions.push(action);
		} else {
			Log.info("unable to attach action", def.id, thisModule);
		}
	};

	/**
	 * Processes the VOs array from VBI JSON.
	 *
	 * @param {object} actions Actions section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processActions = function(actions) {
		var list, index;

		if (actions.Remove) { // process remove section first
			if (actions.Remove.Action) {
				list = [].concat(actions.Remove.Action);
			} else {
				list = [].concat(actions.Remove);
			}
			list.forEach(function(def) {
				index = sap.ui.vbm.findIndexInArray(this._actions, function(action) { return action.id === def.id });
				if (index !== -1) {
					this._removeAction(index);
				} else {
					Log.info("remove of nonexistent action", def.id, thisModule);
				}
			}, this);
		}

		if (actions.Set) { // process delta data
			if (actions.Set.Action) { // process array if any
				list = [].concat(actions.Set.Action);
			} else {
				list = [].concat(actions.Set);
			}

			list.forEach(function(def) { // update or create actions by id
				index = sap.ui.vbm.findIndexInArray(this._actions, function(action) { return action.id === def.id });
				if (index !== -1) {
					this._removeAction(index);
				}
				this._addAction(def);
			}, this);
		}
		return this;
	};

	/**
	 * Returns keyboard handler
	 *
	 * @param {String} name Action name which must be included into JSON payload <br/>
	 * @returns {function} Keyboard	 handler
	 * @private
	 */
	Adapter.prototype._getKeyboardHandler = function(name) {
		return function(event) {
			var param = event.mParameters;
			if (param.key == "Shift" || param.code == 16 ||
				param.key == "Control" || param.code == 17 ||
				param.key == "Alt" || param.code == 18 ||
				param.key == "Meta" || param.code == 91) {
				return;
			}
			var data = {
				"version": "2.0",
				"xmlns:VB": "VB",
				"Action": {
					"name": name,
					"Params": {
						"Param": [
							{
								"name": "code",
								"#": param.code
							},
							{
								"name": "shift",
								"#": param.shift
							},
							{
								"name": "ctrl",
								"#": param.ctrl
							},
							{
								"name": "alt",
								"#": param.alt
							},
							{
								"name": "meta",
								"#": param.meta
							}
						]
					}
				}
			};
			this.fireSubmit({data: JSON.stringify(data)});
		};
	};

	/**
	 * Generates a map of ids and keys.
	 *
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype.idKeyMapGenerator = function() {
		this._map().getVos()
			.map(function(a) { return a.getItems(); })
			.reduce(function(a, b) { return a.concat(b); })
			.forEach(function(i) {
				this._idKeyMap[i.getUniqueId()] = i.getKey();
			}, this);
		return this;
	};

	/**
	 * Processes the Automation section from VBI JSON.
	 *
	 * @param {object} automation Automation section of VBI JSON. <br/>
	 * @param {object} menus Menus section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processAutomation = function(automation, menus) {

		var call = {};

		//If ContextMenu Automation, then the instance ID needs to be patched from VBI (Ex: Spot.NEC1sJ/qHta0xL4LqkzyXg==) to Geo JSON Unique Id
		//Else while returning the FCODE selected event, in OnGeomapSubmit, it wouldn't be able to find an instance for the event.

		// This won't work since the action of the event from VBI would be what's specified in the Menus section of VBI JSON and there is no way
		// that event can be subscribed to.

		if (automation.Call.handler === "CONTEXTMENUHANDLER") {
			var that = this;

			var automationTarget = this._map();
			if (automation.Call.instance && automation.Call.instance.split('.').length == 2) {
				// Menu on a specific instance of VO
				// Fetch the VO with matching Key
				var oVos = this._map().getVos()
					.map(function(oVoAggregation) { return oVoAggregation.getItems(); })
					.reduce(function(oVoA, oVoB) { return oVoA.concat(oVoB); })
					.filter(function(oVo) { return oVo.getKey() ===  automation.Call.instance.split('.')[1]; });

				if (oVos.length > 0) {
					// Expect only one matching Vo. Just being defensive
					automationTarget = oVos[0];
					automation.Call.instance = automationTarget.getUniqueId();
					automation.Call.object = that._ui5Id(automation.Call.object);
				}
			}

			if (menus.Set.Menu) {
				[].concat(menus.Set.Menu).forEach(function(oMenu) {
					that._attachHandler.call(
							automationTarget,
							oMenu.action,
							function(oEvent) {
								var payload;
								if (oEvent.oSource === that._map()) {
									payload = oEvent.getParameters();
									if (payload.Action.object.startsWith(this._map().getId())) {
										payload.Action.object = payload.Action.object.substr(this._map().getId().length + 1)
									}
									if (payload.id && payload.hasOwnProperty("id")) {
										delete payload.id;
									}
								} else {
									payload = oEvent.getParameters().data;
									if (payload.Action.object.startsWith(this._map().getId())) {
										payload.Action.object = payload.Action.object.substr(this._map().getId().length + 1)
									}
									payload.Action.instance = payload.Action.object + '.' + oEvent.oSource.getKey();
								}

								if ((payload.Data) && (payload.Data.Merge) && (payload.Data.Merge.N)) {
									[].concat(payload.Data.Merge.N).forEach(function(n) {
										if (n.name && n.name.startsWith(this._map().getId())) {
											n.name = n.name.substr(this._map().getId().length + 1)
										}
									}, this);

									var uniqueIds = payload.Data.Merge.N.map(function(n) { return n.E; })
														.reduce(function(a, b) { return a.concat(b); })
														.map(function(e) { return e.K; });

									if (jQuery.isEmptyObject(this._idKeyMap)) { // The map was never aggregated - do it the first time
										this.idKeyMapGenerator();
									}
									if (uniqueIds.some(function(u) { return !this._idKeyMap.hasOwnProperty(u); }, this)) {
										//The map could be outdated - needs to be regenerated.
										this.idKeyMapGenerator();
									}
									//At this point, every Unique Id must have a corresponding Key in the map. Replace it in the event payload.
									var idKeyReplacer = function(e) { e.K = this._idKeyMap[e.K]; };
									[].concat(payload.Data.Merge.N).map(function(n) { return n.E; })
										.reduce(function(a, b) { return a.concat(b); })
										.forEach(idKeyReplacer, this);
								}

								this.fireSubmit({
									data: JSON.stringify(payload)
								});
							},
							that);
				});
			}
		}

		call["Automation"] = automation;
		call["Menus"] = menus;

		var oLoad = {};
		oLoad["SAPVB"] = call;

		this._map().load(oLoad);
		return this;
	};

	/**
	 * Processes the Clustering section of the VBI JSON
	 *
	 * @param {object} clusters Clustering section of VBI JSON. <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processClusters = function(clusters) {
		this._clusterVOs.clear(); //always clear list of cluser VOs

		if (clusters.Set) {
			var map = this._map();
			map.destroyClusters();

			[].concat(clusters.Set.Cluster).forEach(function(item) {
				var cluster = null;
				//convert cluster definition
				switch (item.type) {
					case "distance":
						cluster = new sap.ui.vbm.ClusterDistance(item.id);
						if (item.distance) {
							cluster.setDistance(parseFloat(item.distance));
						}
						break;
					case "grid":
						cluster = new sap.ui.vbm.ClusterGrid(item.id);
						if (item.limit) {
							cluster.setLimit(parseInt(item.limit, 10));
						}
						if (item.limitOnSum) {
							cluster.setLimitTotal(parseInt(item.limitOnSum, 10));
						}
						if (item.order) {
							cluster.setOrderIndex(parseInt(item.order, 10));
						}
						if (item.areabordersize) {
							cluster.setCellSpacing(-parseInt(item.areabordersize, 10));
						}
						if (item.distanceX && item.distanceY) {
							cluster.setGridSize(item.distanceX + ";" + item.distanceY);
						}
						if (item.offsetX && item.offsetY) {
							cluster.setOffset(item.offsetX + ";" + item.offsetY);
						}
						break;
					case "tree":
						cluster = new sap.ui.vbm.ClusterTree(item.id, {});
						break;
					default:
						Log.debug("unsupported clustering type", item.type, thisModule);
						break;
				}
				if (cluster) {
					//process common properties
					if (item.rule) {
						cluster.setRule(item.rule);
					}
					cluster.setTextSettings({
						textcolor: item.textcolor,
						textfont: item.textfont,
						textfontsize: item.textfontsize,
						textoffset: item.textoffset,
						textoffsetY: item.textoffsetY
					});
					cluster.setVizTemplate(new sap.ui.vbm.Cluster()); //must be container based cluster
					map.addCluster(cluster);
				}
				// mark cluster VOs, to avoid creating them later in scene processing
				// and attach event listeners in actions section
				this._clusterVOs.set(item.VO, cluster);
			}, this);
		}
		return this;
	};

	/**
	 * Processes the Windows section of the VBI JSON
	 *
	 * @param {object} obj oSAPVB VBI JSON in entirety since processing detail window needs multiple sections <br/>
	 * @returns {sap.ui.vbm.Adapter} <code>this</code> to allow method chaining.
	 * @private
	 */
	Adapter.prototype._processDetailWindows = function(obj) {
		var oGeoMap = this._map();
		var that = this;

		// "Remove" and "Set" verbs supported only
		if (!obj.SAPVB.Windows.Set && !obj.SAPVB.Windows.Remove) {
			return this;
		}
		// No transformation needed for removal - pass it along to VBI as is.
		// Only delta supported for Windows - Set
		if (obj.SAPVB.Windows.Set && obj.SAPVB.Windows.Set.name) {

			var findPredicate =  function(prop, name) {
				return function(d) {
					return d[prop] === name;
				};
			};

			var aWindows = [].concat(obj.SAPVB.Windows.Set).map(function(wnd) {

				var oModelData = oGeoMap.getModel().getData();

				var oWindow = wnd;

				for (var sAttribute in wnd.Window) {
					if (wnd.Window.hasOwnProperty(sAttribute)) {
						if (sAttribute.endsWith(".bind")) {
							// Only known bound attribute is pos - known to have a value like Spots.+hY+jTn2HueNpLoqrc5IAg==.GeoPosition
							if (sAttribute.startsWith("pos")) {
								var aParameters = wnd.Window[sAttribute].split(".");
								if (aParameters[0] in oModelData) {
									var index = sap.ui.vbm.findIndexInArray(oModelData[aParameters[0]], findPredicate("Key", aParameters[1]));

									if (index !== -1) {
										var oData = oModelData[aParameters[0]][index];

										if (aParameters[2] in oData) {
											delete oWindow.Window[sAttribute];
											oWindow.Window[sAttribute.split(".")[0]] = oData[aParameters[2]];
										}
									}
								}
							}
						}
					}
				}
				return oWindow;
			}, this);

			obj.SAPVB.Windows.Set = aWindows;

			// Dereference VOs
			if (obj.SAPVB.Scenes && obj.SAPVB.Scenes.Set && obj.SAPVB.Scenes.Set.name && obj.SAPVB.Scenes.Set.Scene && obj.SAPVB.Scenes.Set.Scene.VO) {

				var aVOs = [].concat(obj.SAPVB.Scenes.Set.Scene.VO).map(function(v) {
					var oVO = v;

					var dereferenceBoundAttributes = function(oVO, sAttribute, aParameters) {
						return function(s) {
							if (s.name && s.type) {
								var oDataList = s[s.type];
								if (oDataList.name === s.name) {
									var oDataType = sap.ui.vbm.findInArray([].concat(this._dataTypes), findPredicate("name", oDataList.name));
									var sAlias = sap.ui.vbm.findInArray([].concat(sap.ui.vbm.findInArray([].concat(oDataType.N), findPredicate("name", aParameters[2])).A),
											findPredicate("name", aParameters[4])).alias;

									var oData = [].concat(oDataList.E)[aParameters[1]];
									var oSubData = [].concat(sap.ui.vbm.findInArray([].concat(oData.N), findPredicate("name", aParameters[2])).E)[aParameters[3]];

									oVO[sAttribute.split(".")[0]] = oSubData[sAlias];
									delete oVO[sAttribute];
								}
							}
						};
					};


					for (var sAttribute in v) {
						if (v.hasOwnProperty(sAttribute)) {
							if (sAttribute.endsWith(".bind")) {
								// Only known bound attribute is text - has values like DetailData.0.Column.1.Text
								var aParameters = v[sAttribute].split(".");

								if (obj.SAPVB.Data && obj.SAPVB.Data.Set) {
									// Only Delta supported for Detail Window
									[].concat(obj.SAPVB.Data.Set).forEach(dereferenceBoundAttributes(oVO, sAttribute, aParameters), this);
								}
							}
						}
					}

					// Process relevant actions
					if (obj.SAPVB.Actions && obj.SAPVB.Actions.Set) {
						[].concat(obj.SAPVB.Actions.Set).filter(function(a) { return a.Action.refVO === oVO.id; }).forEach(function(fa) {
							that._attachHandler.call(oGeoMap, fa.Action.name, that._handler, that);
						});
					}

					return oVO;
				}, this);
				// delete obj.SAPVB["Actions"];
				obj.SAPVB.Scenes.Set.Scene.VO = aVOs;
			}
		}
		// pass it to VBI (this is hazardous as if payload contains something not related to Detail Windows in Scene,
		// VO or Data sections then it will be processed twice with unpredictable results)
		oGeoMap.load(obj);
		return this;
	};

	/**
	 * Generic Geomap event handler that relays the event to the consuming application
	 * This addresses all events.
	 * @param {object} event VBI JSON payload containing the event details. <br/>
	 * @param {action} action definition JSON for the event (if any). <br/>
	 * @private
	 */
	Adapter.prototype._handler = function(event, action) {
		// event from cluser -> no Action object included, need to generate it here
		if (event.oSource instanceof sap.ui.vbm.ClusterBase) {
			var key = event.getParameters().instance.getKey(); // cluster id (cluster instance id)
			var srcEvent = event.getParameters().event;
			var scene = this._map().mVBIContext.GetMainScene();

			if (key && srcEvent && scene) {
				var pos = scene.GetEventVPCoords(srcEvent); // calc relative viewport coordinates based on mouse coordinates
				var coord = scene.GetPosFromVPPoint([pos[0], pos[1], 0]); // calc world coordinates based on relative map viewport coordinates
				var info = this._map().getInfoForCluster(key, sap.ui.vbm.ClusterInfoType.NodeInfo); // retrieve number of objects in cluster
				// construct payload object
				event.getParameters().data = {
					"version": "2.0",
					"xmlns:VB": "VB",
					"id": event.oSource.getId(),
					"Action": {
						"id": action.id,
						"name": action.name,
						"object": action.refVO,
						"instance": key,
						"Params": {
							"Param": [
								{
									"name": "x",
									"#": pos[0].toString()
								},
								{
									"name": "y",
									"#": pos[1].toString()
								}
							]
						},
						"AddActionProperties": {
							"AddActionProperty": [
								{
									"name": "pos",
									"#": coord[0].toString() + ";" + coord[1].toString() + ";0.0"
								},
								{
								"name": "vos",
								"#": info.cnt // number of objects in cluster
								}
							]
						}
					}
				};
				this.fireSubmit({
					data: JSON.stringify(event.getParameters().data)
				});
			}
		} else {
			var oParameters = event.getParameters();
			var oEventData = oParameters.data ? oParameters.data : oParameters;

			//If no event object then fire submit with original data
			if (oEventData.Action && !oEventData.Action.object) {
				this.fireSubmit({
					data: JSON.stringify(oEventData)
				});
				return;
			}

			if (oEventData.Action.object.startsWith(this._map().getId())) {
				oEventData.Action.object = oEventData.Action.object.substr(this._map().getId().length + 1)
			}
			if (oEventData.Action && oEventData.Action.object) {
				// Whatever back-end refers to as Links, they are referred to as Routes by Geomap
				var routeName = "Route", linkName = "Link";
				var actionObjects = [oEventData.Action.object];
				if (oEventData.Action.object === routeName) {
					actionObjects.push(linkName);
					oEventData.Action.object = linkName;
				}

				var oAction = sap.ui.vbm.findInArray(this._actions, function(action) {
					return (actionObjects.indexOf(action.refVO) != -1) && oEventData.Action.name.toLowerCase() === action.refEvent.toLowerCase();
				});

				if (oAction) {
					oEventData.Action.id = oAction.id; //always update id from original data
					oEventData.Action.name = oAction.name; //always update name from original data
					if (oEventData.Action.instance) {
						oEventData.Action.instance = oEventData.Action.object + "." + oParameters.instance.getKey();
					}

					// need to process params prior sending event data to backend
					// this is because Key attributes from backend are not propogated from UI5 level down to VBI
					// i.e key attribute is not used in getDataElement() function, but UI5 Id used instead
					// need to iterate over all params in evend data and replace all UI5 Ids to corresponded Key attibutes
					var params = [];
					if (oEventData.Action.Params) {
						oEventData.Action.Params.Param.forEach(function(item) {
							if (item.name === "strSource") {
								params.push(item);
							}
						});

						if (params.length) {
							if (jQuery.isEmptyObject(this._idKeyMap)) { // The map was never aggregated - do it the first time
								this.idKeyMapGenerator();
							} else if (params.some(function(item) { return !this._idKeyMap.hasOwnProperty(item["#"].split(".")[1]); }, this)) {
								this.idKeyMapGenerator(); // check if it is outdated -> and update if neccessary
							}

							params.forEach(function(item) {
								var parts = item["#"].split(".");
								item["#"] = parts[0] + "." + this._idKeyMap[parts[1]]; // replace UI5 Id with Key attribute
							}, this);
						}
					}
					// same applies to Data section of the event, all UI5 IDs must be replaced with corresponded Key attributes
					if ((oEventData.Data) && (oEventData.Data.Merge) && (oEventData.Data.Merge.N)) {
						[].concat(oEventData.Data.Merge.N).forEach(function(n) {
							if (n.name && n.name.startsWith(this._map().getId())) {
								n.name = n.name.substr(this._map().getId().length + 1)
							}
						}, this);

						var uniqueIds = oEventData.Data.Merge.N.map(function(n) { return n.E; })
											.reduce(function(a, b) { return a.concat(b); })
											.map(function(e) { return e.K; });

						if (jQuery.isEmptyObject(this._idKeyMap)) { // The map was never aggregated - do it the first time
							this.idKeyMapGenerator();
						}
						if (uniqueIds.some(function(u) { return !this._idKeyMap.hasOwnProperty(u); }, this)) {
							//The map could be outdated - needs to be regenerated.
							this.idKeyMapGenerator();
						}
						//At this point, every Unique Id must have a corresponding Key in the map. Replace it in the event payload.
						var idKeyReplacer = function(e) { e.K = this._idKeyMap[e.K]; };
						[].concat(oEventData.Data.Merge.N).map(function(n) { return n.E; })
							.reduce(function(a, b) { return a.concat(b); })
							.forEach(idKeyReplacer, this);
					}

					/*
					 * Additionally every action can seek AddActionProperty. Geomap sends only limited
					 * properties - depending how the Action has been set up.
					 *
					 * Ex. CONTEXT_MENU_REQUEST on Map seeks zoom, centerpoint, pos, pitch, yaw.
			n		 * But GeoMap only provides pos since that is how the action is setup in GeoMap.js at line # 1417
					 */
					[].concat(oAction.AddActionProperty || []).forEach(function(a) {
						var addActionProperties = oEventData.Action.AddActionProperties.AddActionProperty || [];
						var propertyValue = sap.ui.vbm.findInArray(
							[].concat(addActionProperties),
							function(prop) { return prop.name === a.name; });

						if (!propertyValue) {
							switch (a.name) {
								case "zoom":
									addActionProperties.push({
										"name": a.name,
										"#": this._map().getZoomlevel()
									});
									break;
								case "centerpoint":
									addActionProperties.push({
										"name": a.name,
										"#": this._map().getCenterPosition()
									});
									break;
								case "pitch":
									// Not supported by GeoMap
									addActionProperties.push({
										"name": a.name,
										"#": "0.0"
									});
									break;
								case "yaw":
									// Not supported by GeoMap
									addActionProperties.push({
										"name": a.name,
										"#": "0.0"
									});
									break;
								default:
									break;
							}
						}
					}, this);

					this.fireSubmit({
						data: JSON.stringify(oEventData)
					});
				}
			}
		}
		this.timeout = undefined;
	};

	/**
	 * Generic click event handler that relays the click/double click event to the consuming application
	 * When click is received, it waits for 500 ms for another click to assert whether this is double click
	 *
	 * @param {object} event VBI JSON payload containing the event details. <br/>
	 * @param {object} clusterAction action definition if this handler is for cluster object action <br/>
	 * @private
	 */
	Adapter.prototype._clickHandler = function(event, clusterAction) {
		if (this.timeout) {
			clearTimeout(this.timeout);
			if (!clusterAction) {
				event.getParameters().data.Action.name = "doubleclick"; // replace action name as from VBI it bubbles up as "click"
			}
			this._handler(event, clusterAction);
		} else {
			// This needs to be done since by the time callback (event handler) is executed, the object is reclaimed.
			// if this handler is for cluster -> need to find corresponded click (if any) and pass it through
			var click = clusterAction ? sap.ui.vbm.findInArray(this._actions, function(action) { return action.refVO === clusterAction.refVO && action.refEvent === "Click"; }) : undefined;
			this.oEvent = jQuery.extend(true, {}, event);
			this.timeout = setTimeout(this._handler.bind(this, this.oEvent, click), 500);
		}
	};

	return Adapter;
});