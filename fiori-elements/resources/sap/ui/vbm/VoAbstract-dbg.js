/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.VoAbstract.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new VoAbstract.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract VO aggregation container. This element implements the common part for VOs. It must not be used
	 *        directly, but is the base for further extension.
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VoAbstract
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VoAbstract = Element.extend("sap.ui.vbm.VoAbstract", /** @lends sap.ui.vbm.VoAbstract.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

			},
			events: {}
		}
	});

// // /**
// // * This file defines behavior for the control,
// // */
// VoAbstract.prototype.init = function() {
// // do something for initialization...
// this.BindingDiff = [];
// };

	VoAbstract.prototype.isEventRegistered = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oInstance = aVO[nJ];

			// if one registers for an event we can return........................//
			if (oInstance.mEventRegistry[name]) {
				return true;
			}
		}

		return false;
	};

	VoAbstract.prototype.findInstance = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].sId === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAbstract.prototype.findInstanceByKey = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].sId === key || aVO[nJ].getKey() === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAbstract.prototype.getActionArray = function() {
		// var id = this.getId();
		var aActions = [];

		return aActions;
	};

	VoAbstract.prototype.getTemplateBindingInfo = function() {
		// read binding info to check what is bound and what is static
		var oBindingInfo = this.getBindingInfo("items");
		if (oBindingInfo && oBindingInfo.template) {
			return oBindingInfo.template.mBindingInfos;
		}
	};

	VoAbstract.prototype.getBindInfo = function() {
		var oBindInfo = {};
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		oBindInfo.hasTemplate = (oTemplateBindingInfo) ? true : false;

		return oBindInfo;
	};

	// base implementation for object handling corresponding to VoBase
	VoAbstract.prototype.getTemplateObject = function() {
		var oTemp = {};
		oTemp['id'] = this.getId();

		// the data source name is equivalent to the controls id..................//
		oTemp['datasource'] = oTemp.id;

		return oTemp;
	};

	VoAbstract.prototype.getTypeObject = function() {
		var oType = {};

		// set the id.............................................................//
		oType['name'] = this.getId();

		oType['key'] = 'K';

		// extend the object type.................................................//
		oType.A = [
			{
				"name": "K", // key
				"alias": "K",
				"type": "string"
			}, {
				"name": "VB:s", // selection flag
				"alias": "VB:s",
				"type": "boolean"
			}
		];

		return oType;
	};

	VoAbstract.prototype.getDataDeltaObject = function(oDiff) {
		var oData = {};
		var aRemoveData = [];

		var aItems = this.getItems();
		oData['name'] = this.getId();
		oData.E = [];

		for (var nK = 0; nK < oDiff.length; ++nK) {
			if (oDiff[nK].type == "delete") {
				aRemoveData.push(oDiff[nK].object);
			} else if (oDiff[nK].type == "insert") {
				var i = oDiff[nK].idx;
				oData.E.push(aItems[i].getDataElement());
			}
		}
		return {
			oData: oData,
			aRemoveData: aRemoveData
		};
	};

	VoAbstract.prototype.getDataRemoveObject = function() {
		var oData = {
			name: this.getId(),
			type: "N"
		};
		return oData;
	};

	VoAbstract.prototype.getDataObject = function() {
		var oData = {};

		// set the id of the table................................................//
		oData['name'] = this.getId();
		oData.E = [];

		var aVO = this.getItems();
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			oData.E.push(aVO[nJ].getDataElement());
		}

		return oData;
	};

	/**
	 * Open a context menu
	 * 
	 * @param {string} sType Type of VO
	 * @param {sap.ui.vbm.VoBase} oVoInst VO instance for which the Context Menu should be opened
	 * @param {sap.ui.unified.Menu} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoAbstract.prototype.openContextMenu = function(sType, oVoInst, oMenu) {
		this.oParent.openContextMenu(sType, oVoInst, oMenu);
	};

	return VoAbstract;

});
