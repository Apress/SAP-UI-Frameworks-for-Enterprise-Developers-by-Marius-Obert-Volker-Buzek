/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Containers.
sap.ui.define([
	"./VoAggregation",
	"sap/ui/unified/Menu",
	"./library"
], function(VoAggregation, Menu, library) {
	"use strict";

	/**
	 * Constructor for a new Containers.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Container</i> instances.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Containers
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Containers = VoAggregation.extend("sap.ui.vbm.Containers", /** @lends sap.ui.vbm.Containers.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Container object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Container",
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
	// sap.ui.vbm.Containers.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//

	Containers.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.AL = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("alignment") : true;

		return oBindInfo;
	};

	Containers.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-2297943F0CE6}";
		oTemp["key.bind"] = oTemp.id + ".IK"; // IK is the key
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.AL) {
			oTemp["alignment.bind"] = oTemp.id + ".AL";
		} else {
			oTemp.alignment = oVoTemplate.getAlignment(); // AL is the alignment
		}

		return oTemp;
	};

	Containers.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		oType.A.push({
			"name": "IK", // key
			"alias": "IK",
			"type": "key"
		});
		if (oBindInfo.P) {
			oType.A.push({
				"changeable": "true",
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.AL) {
			oType.A.push({
				"name": "AL", // alignment
				"alias": "AL",
				"type": "string"
			});
		}
		return oType;
	};

	Containers.prototype.getActionArray = function() {
		var aActions = VoAggregation.prototype.getActionArray.apply(this, arguments);

		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}

		return aActions;
	};

	// ...........................................................................//
	// helper functions..........................................................//

	Containers.prototype.handleContainerCreated = function(event) {
		// get the right container aggregation
		var cont = this.findInstance(event.mParameters.id);
		// get the child control
		var oItem = cont.getItem();
		if (oItem) {
			// attach to container div events
			var oDomRef = event.getParameter("contentarea");
			oDomRef.addEventListener("click", this, false);
			oDomRef.addEventListener("contextmenu", this, false);

			var oParent;
			if ((oParent = this.getParent())) {
				// determine the id of the div to place the item in
				var id = oDomRef.id;
				oParent.addRenderItem( oItem, id );
			}
		}
	};

	Containers.prototype.handleContainerDestroyed = function(event) {
		// detach container div events
		var oDomRef = event.getParameter("contentarea");
		oDomRef.removeEventListener("click", this, false);
		oDomRef.removeEventListener("contextmenu", this, false);
	};

	Containers.prototype.findInstance = function(key) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = this.aUniqueIdx.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (this.aUniqueIdx[nJ] === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	/**
	 * Generic event handler for DOM events from container divs
	 * Note: This is not a redefinition of handleEvent from base class VOAggregation!
	 * @param oEvent DOM event
	 */
	Containers.prototype.handleEvent = function(oEvent) {
		var sContainerId = oEvent.currentTarget.m_Key;
		var oContainer = this.findInstance(sContainerId);

		switch (oEvent.type) {
			case "click":
				oContainer.fireClick();
				this.fireClick( {instance: oContainer } );
				break;
			case "contextmenu":
				var eventContext = {};
				var oMapDivRect = this.oParent.getDomRef().getBoundingClientRect();
				oContainer.mClickPos = [
					oEvent.clientX - oMapDivRect.left, oEvent.clientY - oMapDivRect.top
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

					oContainer.fireContextMenu(eventContext);

					eventContext.instance = oContainer;
					this.fireContextMenu(eventContext);
				} catch (e) {
					// TODO: handle error?
				}
				break;
		}
	};

	return Containers;

});
