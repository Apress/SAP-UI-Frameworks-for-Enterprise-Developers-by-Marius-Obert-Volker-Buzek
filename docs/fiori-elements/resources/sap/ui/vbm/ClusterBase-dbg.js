/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterBase.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/theming/Parameters",
	"./ClusterContainer",
	"sap/ui/unified/Menu",
	"jquery.sap.global",
	"sap/base/Log",
	"./library"
], function(Element, Parameters, ClusterContainer, Menu, jQuery, Log, library) {
	"use strict";

	var thisModule = "sap.ui.vbm.ClusterBase";

	/**
	 * Constructor for a new ClusterBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abtract base class for Clustering types. This element implements the common part for all specific Cluster elements. It must not be used
	 *        directly, but is the base for further extension.<br>
	 *        There are two optional aggregations: <code>vizTemplate</code> and <code>vizVo</code> determining how cluster objects should be
	 *        visualized. Only the one or the other should be provided.<br>
	 *        With aggregation <code>vizTemplate</code> you can provide an arbitrary SAPUI5 control for the actual visualization. If you want this control
	 *        to display the number of clustered object you need to provide the name of the receiving property of the template via property <code>textProperty</code>.
	 *        For interaction with the cluster you can either use the events provided by the visualization template or, if it does not provide appropriate events,
	 *        the cluster element events <code>click</code> and <code>contextMenu</code>. The event handler will receive an instance of <code>sap.ui.vbm.ClusterContainer</code>.<br>
	 *        With aggregation <code>vizVo</code> you provide an instance of <code>sap.ui.vbm.Spot</code> as visualization object. Spots are based on an image. The text
	 *        for the number of clustered objects needs to be placed over the image. The actual color, font, size, and positioning of the text can be influence via property
	 *        <code>textSettings</code>. For interaction with the cluster you can use the events provided by the spot.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterBase = Element.extend("sap.ui.vbm.ClusterBase", /** @lends sap.ui.vbm.ClusterBase.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Flag controlling the visibility of the area convered by a cluster object.
				 */
				areaAlwaysVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * Fill color for the area covered by a cluster object
				 */
				areaColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(200,0,0,0.2)"
				},

				/**
				 * Border color for the area covered by a cluster object
				 */
				areaColorBorder: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(220,220,220,0.5)"
				},

				/**
				 * Name of property of the visualization control receiving the number of clustered objects. This setting applys only if aggregation
				 * vizTemplate is used.
				 */
				textProperty: {
					type: "string",
					group: "Misc",
					defaultValue: "text"
				},

				/**
				 * Settings for the text placed on the given Spot telling the number of clustered objects. This setting applys only if aggregation
				 * vizVo is used. If omitted the number of clustered object will <b>not</b> be shown!
				 */
				textSettings: {
					type: "object",
					group: "Appearance"
				},

				/**
				 * Clustering rule, describing which visual objects should be considered for clustering
				 */
				rule: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			defaultAggregation: "vizTemplate",
			aggregations: {

				/**
				 * Optional: Instance of a control, which is used as template for visualizing cluster objects. This is the prefered choise.
				 */
				vizTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Optional: Instance of a spot, which is used as template for visualizing cluster objects
				 */
				vizVo: {
					type: "sap.ui.vbm.Spot",
					multiple: false
				},
				/**
				 * Hidden aggregation for cluster visualization controls
				 */
				clusterVos: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden",
					singularName: "clusterVo"
				},
				/**
				 * Hidden aggregation for host container VOs
				 */
				clusterContainers: {
					type: "sap.ui.vbm.ClusterContainer",
					multiple: true,
					visibility: "hidden",
					singularName: "clusterContainer"
				}

			},
			events: {
				/**
				 * The event is raised when there is a click action on a Cluster Object.
				 */
				click: {
					parameters: {
						/**
						 * ID of the clicked cluster object. Can serve as input for GeoMap function getInfoForCluster
						 */
						clusterID: {
							type: "string"
						}
					}
				},
				/**
				 * The event is raised when there is a right click or a tap and hold action on a Cluster.
				 */
				contextMenu: {
					parameters: {
						/**
						 * ID of the clicked cluster object. Can serve as input for GeoMap function getInfoForCluster
						 */
						clusterID: {
							type: "string"
						},
						/**
						 * Menu to open
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						}
					}
				}
			}
		}
	});

	/**
	 * Open a Detail Window. This function can only be used with a Spot as Cluster visualization object!
	 *
	 * @param {sap.ui.vbm.Spot} oSpotInst Spot instance for which the Detail Window should be opened
	 * @param {object} oParams Parameter object
	 * @param {string} oParams.caption Text for Detail Window caption
	 * @param {string} oParams.offsetX position offset in x-direction from the anchor point
	 * @param {string} oParams.offsetY position offset in y-direction from the anchor point
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ClusterBase.prototype.openDetailWindow = function(oSpotInst, oParams) {
		var oParent = this.getParent();
		oParent.mDTWindowCxt.bUseClickPos = true;
		oParent.mDTWindowCxt.open = true;
		oParent.mDTWindowCxt.src = oSpotInst;
		oParent.mDTWindowCxt.key = oSpotInst.getKey();
		oParent.mDTWindowCxt.params = oParams;
		oParent.m_bWindowsDirty = true;
		oParent.invalidate();
	};

	/**
	 * Open a context menu
	 *
	 * @param {string} sType Type of VO
	 * @param {sap.ui.vbm.ClusterContainer} oContainer VO instance for which the Context Menu should be opened
	 * @param {sap.ui.unified.Menu} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ClusterBase.prototype.openContextMenu = function(sType, oContainer, oMenu) {
		this.oParent.openContextMenu(sType, oContainer, oMenu);
	};

	/**
	 * This file defines behavior for the control,
	 */
	ClusterBase.prototype.init = function() {
		// do something for initialization...
		this.mVizObjMap = {};
		this.mContObjMap = {};
		var sDefaultFontFamily = Parameters.get("sapUiFontFamily");
		this.setProperty("textSettings", {
			textcolor: "#000000",
			textfont: (sDefaultFontFamily) ? sDefaultFontFamily : "Arial, Helvetica, sans-serif",
			textfontsize: "10"
		}, true);
	};

	ClusterBase.prototype.exit = function() {
		// clean up
		this.mVizObjMap = null;
		this.mContObjMap = null;
		if (this.oSpotAggr) {
			this.oSpotAggr.destroy();
			this.oSpotAggr = null;
		}
	};

	/**
	 * Set the settings for the text placed on the Spot for number of clustered objects
	 *
	 * @param {object} oSettings Settings object
	 * @param {CSSColor} ?oSettings.textcolor Text color. Default is black
	 * @param {string} ?oSettings.textfont Text font family. Default take from theming parameter <i>sapUiFontFamily</i>
	 * @param {string} ?oSettings.textfontsize Text font size. Default is 10.
	 * @param {string} ?oSettings.textoffset Text horizontal offset in pixels. Default is 0.
	 * @param {string} ?oSettings.textoffsetY Text vertical offset in pixels. Default is 0.
	 * @returns this To allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ClusterBase.prototype.setTextSettings = function(oSettings) {
		// apply new settings to existing ones
		var oNewSettings = this.getTextSettings();
		jQuery.extend(oNewSettings, oSettings);
		return this.setProperty("textSettings", oNewSettings);
	};

	// ...........................................................................//
	// model creators............................................................//

	// A cluster needs a reference VO for rendering. Thus we return a container object as ref VO.
	ClusterBase.prototype.getTemplateObject = function() {
		var oTemplate = {};

		// Ref VO id is given in handleOpenWindow event and must match cluster id for event dispatching
		var sId = this.getId();

		if (this.getVizTemplate()) {
			// vizTemplate given -> use a container VO as reference
			oTemplate = {
				id: sId,
				type: "{00100000-2012-0004-B001-2297943F0CE6}",
				datasource: sId
			};
		} else if (this.getVizVo()) {
			// Spot given
			this.oSpotAggr = new sap.ui.vbm.Spots({
				items: {
					path: "/",
					template: this.getVizVo()
				}
			});
			oTemplate = this.oSpotAggr.getTemplateObject();
			// change id to id of cluster for right relation to actions and event routing
			oTemplate.id = sId;
		} else {
			// nothing given
			Log.error("No visualization object given for cluster", "", thisModule);
		}
		return oTemplate;
	};

	ClusterBase.prototype.getActionArray = function() {
		// Note: If we use a Spot for cluster visualization we need to register actions, otherwise we directly use DOM events from the container div
		if (this.oSpotAggr) {
			var aActions = this.oSpotAggr.getActionArray(/* bForce= */true);
			for (var i = 0; i < aActions.length; ++i) {
				// change refVO for right event routing in GeoMap
				aActions[i].refVO = this.getId();
			}
			return aActions;
		} else {
			return [];
		}
	};

	ClusterBase.prototype.getClusterDefinition = function() {

		return jQuery.extend(this.getTextSettings(), {
			id: this.getId(),
			VO: this.getId(),
			rule: this.getRule(),
			areapermanent: this.getAreaAlwaysVisible().toString(),
			areabordersize: "2",
			areafillcol: this.getAreaColor(),
			areabordercol: this.getAreaColorBorder()
		});
	};

	// ...........................................................................//
	// Internal API functions.....................................................//

	ClusterBase.prototype.handleContainerCreated = function(event) {
		// get the control
		var sClusterId = event.mParameters.id;
		var oItem = this._getVizObjInst(sClusterId);
		if (oItem) {
			// read cluster info data for given Id
			var oNodeInfo = this.getParent().getInfoForCluster(sClusterId, sap.ui.vbm.ClusterInfoType.NodeInfo);
			if (!oItem.getBindingInfo("text")) {
				oItem.setProperty(this.getTextProperty(), oNodeInfo.cnt.toString(), /* suppress invaidate */true);
			}

			if (!this.oDOMHandler) {
				this.oDOMHander = new ClusterBase._DOMHandler(this);
			}

			// attach to container div events
			var oDomRef = event.getParameter("contentarea");
			oDomRef.addEventListener("click", this.oDOMHander);
			oDomRef.addEventListener("contextmenu", this.oDOMHander);
			// attach to container div touch events
			oDomRef.addEventListener("touchstart", this.oDOMHander);
			oDomRef.addEventListener("touchend", this.oDOMHander);
			oDomRef.addEventListener("touchcancel", this.oDOMHander);

			var oParent;
			if ((oParent = this.getParent())) {
				// determine the id of the div to place the item in
				var id = oDomRef.id;
				oParent.addRenderItem(oItem, id);
			}
		}
	};

	ClusterBase.prototype.handleContainerDestroyed = function(event) {
		var oDomRef = event.getParameter("contentarea");
		// detach container div events
		oDomRef.removeEventListener("click", this.oDOMHander);
		oDomRef.removeEventListener("contextmenu", this.oDOMHander);
		oDomRef.removeEventListener("touchstart", this.oDOMHander);
		oDomRef.removeEventListener("touchend", this.oDOMHander);
		oDomRef.removeEventListener("touchcancel", this.oDOMHander);
		// remove associate control instance
		this._removeVizObjInst(event.mParameters.id);
	};

	ClusterBase.prototype.handleEvent = function(event) {
		var sName = event.Action.name;

		var funcname = "fire" + sName[0].toUpperCase() + sName.slice(1);

		// first we try to get the event on a vo instance......................//
		var oVo;
		if ((oVo = this.getVizVo())) {
			var eventContext = {
				data: event
			};
			var nodeInfo = this.getParent().getInfoForCluster(event.Action.instance, sap.ui.vbm.ClusterInfoType.NodeInfo);
			oVo.setProperty("key", event.Action.instance, /* bSuppressInvalidate= */true);
			oVo.setProperty("position", nodeInfo.pos[0] + ";" + nodeInfo.pos[1] + ";0", /* bSuppressInvalidate= */true);
			switch (sName) {
				case "click":
					oVo.mClickGeoPos = event.Action.AddActionProperties.AddActionProperty[0]['#'];
					break;
				case "contextMenu":
					// store screen coordinates where the menu should open
					oVo.mClickPos = [
						event.Action.Params.Param[0]['#'], event.Action.Params.Param[1]['#']
					];

					if (this.oParent.mVBIContext.m_Menus) {
						this.oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
					}
					// create an empty menu
					var oMenuObject = new Menu();
					oMenuObject.vbi_data = {};
					oMenuObject.vbi_data.menuRef = "CTM";
					oMenuObject.vbi_data.VBIName = "DynContextMenu";

					eventContext.menu = oMenuObject;
					break;
				case "drop":
					var src = event.Action.Params.Param[0]['#'].split("|");
					var aggr = src[1];
					var inst = src[2].split(".")[1];
					var oDragSource = this.getParent().getAggregatorContainer(aggr).findInstanceByKey(inst);
					eventContext.oDragSource = oDragSource;
					break;
				default:
					break;

			}
			oVo[funcname](eventContext);

			eventContext.instance = oVo;
			this[funcname](eventContext);
		} else {
			Log.error("Instance for event not found", "", thisModule);
		}
	};

	ClusterBase.prototype.findInstance = function(sKey) {
		if (this.oSpotAggr) {
			return this.getVizVo();
		} else {
			return this._getContainer(sKey);
		}
	};

	// ...........................................................................//
	// private helper functions...................................................//

	ClusterBase.prototype._getVizObjInst = function(key) {
		var oResult = this.mVizObjMap[key];
		if (!oResult) {
			// no instance found for given key -> create it
			var oVizObj = this.getVizTemplate();
			if (oVizObj) {
				oResult = this.mVizObjMap[key] = oVizObj.clone();
				oResult.mClusterId = key;
				this.addAggregation("clusterVos", oResult, /* suppress invaidate */true);
			}
		}

		return oResult;
	};

	ClusterBase.prototype._removeVizObjInst = function(key) {
		var oResult = this.mVizObjMap[key];
		if (oResult) {
			this.removeAggregation("clusterVos", oResult, /* suppress invaidate */true);
			this.mVizObjMap[key] = null;
		}
	};

	/**
	 * It retrieves a {sap.ui.vbm.ClusterContainer} by key from the list of current containers.
	 * @param {string} key The key of the container that we want to retrieve.
	 * @returns {sap.ui.vbm.ClusterContainer} oResult
	 * @private
	 */
	ClusterBase.prototype._getContainer = function(key) {
		var oResult = this.mContObjMap[key];
		if (!oResult) {
			// no instance found for given key -> create it
			oResult = this.mContObjMap[key] = new ClusterContainer({
				key: key
			});
			// add item if we do not use spots for visualization
			if (!this.oSpotAggr) {
				oResult.setItem(this._getVizObjInst(key));
			}
			this.addAggregation("clusterContainers", oResult, /* suppress invaidate */true);
		}

		return oResult;
	};

	ClusterBase.prototype._removeContainer = function(key) {
		var oResult = this.mContObjMap[key];
		if (oResult) {
			this.removeAggregation("clusterContainers", oResult, /* suppress invaidate */true);
			this.mContObjMap[key] = null;
		}
	};

	/**
	 * Generic event handler for DOM events from container divs Note: Naming conventions apply here. Thus the hadler cannot be used directly, but via
	 * sub object _DOMHandler!
	 *
	 * @param {object} oEvent DOM event
	 * @private
	 */
	ClusterBase.prototype._handleDOMEvent = function(oEvent) {
		var sClusterId = oEvent.currentTarget.m_Key;
		//oCluster is an instance of sap.ui.vbm.ClusterContainer
		var oCluster = this.parent._getContainer(sClusterId);
		switch (oEvent.type) {
			case "click":
				this.parent.fireClick({
					instance: oCluster,
					event: oEvent // include original event to get mouse coordinates later
				});
				break;
			case "contextmenu":
				this.parent._onContextMenu(oEvent, oCluster);
				break;
			case "touchstart":
				oCluster.touch = true;
				oCluster.touchTime = Date.now();
				break;
			case "touchend":
				if (oCluster.touch) {
					oCluster.touch = false;
					var time = (Date.now() - oCluster.touchTime) / 1000; //delta time in seconds

					if (time < 1.0) { // tap
						this.parent.fireClick({
							instance: oCluster,
							event: oEvent // include original event to get mouse coordinates later
						});
					} else { // long tap
						this.parent._onContextMenu(oEvent, oCluster);
					}
				}
				break;
			case "touch cancel":
				oCluster.touch = false;
				break;
			default:
				break;
		}
	};

	ClusterBase.prototype._onContextMenu = function(oEvent, oCluster) {
		var eventContext = {};
		var oMapDiv = this.oParent.getDomRef();
		oCluster.mClickPos = [
			oEvent.clientX - oMapDiv.offsetLeft, oEvent.clientY - oMapDiv.offsetTop
		];

		try {
			if (this.oParent.mVBIContext.m_Menus) {
				this.oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
			}
			// create an empty menu
			var oMenuObject = new Menu();
			oMenuObject.vbi_data = {};
			oMenuObject.vbi_data.menuRef = "CTM";
			oMenuObject.vbi_data.VBIName = "DynContextMenu";

			eventContext.menu = oMenuObject;
			oEvent.preventDefault();

			eventContext.instance = oCluster;
			eventContext.event = oEvent; // include original event to get mouse coordinates later
			this.fireContextMenu(eventContext);
		} catch (e) {
			// TODO: handle error?
		}
	};

	ClusterBase._DOMHandler = function(oParent) {
		this.parent = oParent;
		this.handleEvent = oParent._handleDOMEvent;
		return this;
	};

	return ClusterBase;

});
