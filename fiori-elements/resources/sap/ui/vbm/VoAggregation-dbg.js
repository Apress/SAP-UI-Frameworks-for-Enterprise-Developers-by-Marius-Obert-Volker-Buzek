/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.VoAggregation.
sap.ui.define([
	"./VoAbstract",
	"sap/ui/unified/Menu",
	"jquery.sap.global",
	"sap/base/Log",
	"./library"
], function(VoAbstract, Menu, jQuery, Log, library) {
	"use strict";

	/**
	 * Constructor for a new VoAggregation.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract VO aggregation container. This element implements the common part for all specific VO aggregations with selection
	 *        cardinatities. It must not be used directly, but is the base for further extension.
	 * @extends sap.ui.vbm.VoAbstract
	 * @abstract
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VoAggregation
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VoAggregation = VoAbstract.extend("sap.ui.vbm.VoAggregation", /** @lends sap.ui.vbm.VoAggregation.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Selection cardinality: minimum selected elements ("0" or "1" )
				 */
				minSel: {
					type: "string",
					group: "Misc",
					defaultValue: "0"
				},

				/**
				 * Selection cardinality: maximum selectable elements ( valid values are "0", "1", and "n" )
				 */
				maxSel: {
					type: "string",
					group: "Misc",
					defaultValue: "n"
				},

				/**
				 * If you want to add custom data to VO instances and make the GeoMap control aware of it, e.g. for basing clustering rules on it, you
				 * can provide an array of property names specifying the keys to consider.
				 */
				customProperties: {
					type: "string[]",
					group: "Misc"
				}
			},
			events: {

				/**
				 * This event is raised when a Design handle is moved.
				 */
				handleMoved: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.VoBase"
						},
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
							type: "int"
						}
					}
				},

				/**
				 * This event is raised when a Design handle is right clicked.
				 */
				handleContextMenu: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.VoBase"
						},
						/**
						 * Menu to open
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						},
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
							type: "int"
						}
					}
				},

				/**
				 * This event is raised when a Design handle is clicked.
				 */
				handleClick: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.VoBase"
						},
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
							type: "int"
						}
					}
				},

				/**
				 * This event is raised when aggregated elements get selected
				 */
				select: {
					parameters: {

						/**
						 * Array of selected VOs
						 */
						selected: {
							type: "array"
						}
					}
				},

				/**
				 * This event is raised when aggregated elements get deselected
				 */
				deselect: {
					parameters: {

						/**
						 * Array of deselected VOs
						 */
						deselected: {
							type: "array"
						}
					}
				},
				/**
				 * The event is raised when there is a click action on a VO.
				 */
				click: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.VoBase"
						}
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a VO.
				 */
				contextMenu: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.VoBase"
						},
						/**
						 * Menu to open
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						}
					}
				},

				/**
				 * The event is raised when something is dropped on a VO.
				 */
				drop: {
					parameters: {

						/**
						 * Drop target instance
						 */
						instance: {
							type: "sap.ui.vbm.Spot"
						},
						/**
						 * Dragged instance
						 */
						dragSource: {
							type: "sap.ui.vbm.VoBase"
						}
					}
				}

			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	VoAggregation.prototype.init = function() {
		// do something for initialization...
		this.aDiff = [];
		this.aUniqueIdx = [];
		this.currentIdx = 1000;
		this.setProperty("customProperties", [], /* bSuppressInvalidate= */true);
		this.bUseExtendedChangeDetection = true;
	};

	VoAggregation.prototype.handleSelectEvent = function(aEl) {

		var aSelect = [];
		var aDeselect = [];
		for (var nK = 0; nK < aEl.length; ++nK) {
			var oEl = aEl[nK];
			var aVO = this.getItems();
			if (aVO) {
				for (var nL = 0, len = aVO.length; nL < len; ++nL) {
					if (aVO[nL].UniqueId == oEl.K) {
						var bEleSel = (oEl["VB:s"] == "true" ? true : false);
						var bModelSel = aVO[nL].getSelect();
						if (bEleSel != bModelSel) {
							if (bEleSel) {
								// to be selected
								aVO[nL].setProperty("select", true, /* bSuppressInvalidate= */true); // set model selection property
								if (this.mEventRegistry["select"]) {
									aSelect.push(aVO[nL]); // add element to array to fire the select on aggregation
								}
							} else {
								// to be deselected
								aVO[nL].setProperty("select", false, /* bSuppressInvalidate= */true); // set model selection property
								if (this.mEventRegistry["deselect"]) {
									aDeselect.push(aVO[nL]); // add element to array to fire the deselect on aggregation
								}
							}
						}
					}
				}
			}
		}
		if (aDeselect.length) {
			this.fireDeselect({
				deselected: aDeselect
			});
		}
		if (aSelect.length) {
			this.fireSelect({
				selected: aSelect
			});
		}
	};

	VoAggregation.prototype.isEventRegistered = function(name) {
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

	VoAggregation.prototype.findSelected = function(select, data) {
		var aVO = this.getItems();
		if (!aVO) {
			return null;
		}
		var aSel = [];
		if (jQuery.type(data) == 'object') {
			if (data["VB:s"] == (select ? "true" : "false")) {
				for (var nI = 0; nI < aVO.length; ++nI) {
					// if (aVO[nI].sId == data["K"]) {
					if (aVO[nI].UniqueId == data["K"]) {
						aSel.push(aVO[nI]);
					}
				}

			}
		} else if (jQuery.type(data) == 'array') {
			for (var nJ = 0; nJ < data.length; ++nJ) {
				if (data[nJ]["VB:s"] == (select ? "true" : "false")) {
					for (var nK = 0; nK < aVO.length; ++nK) {
						// if (aVO[nK].sId == data[nJ]["K"]) {
						if (aVO[nK].UniqueId == data[nJ]["K"]) {
							aSel.push(aVO[nK]);
						}
					}
				}
			}
		}
		return aSel;
	};

	VoAggregation.prototype.findInstance = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = this.aUniqueIdx.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (this.aUniqueIdx[nJ] === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAggregation.prototype.findInstanceByKey = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].getKey() === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAggregation.prototype.getActionArray = function() {
		var id = this.getId();
		var aActions = [];

		if (this.mEventRegistry["handleMoved"] || this.isEventRegistered("handleMoved")) {
			aActions.push({
				"id": id + "4",
				"name": "handleMoved",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleMoved"
			});
		}
		if (this.mEventRegistry["handleContextMenu"] || this.isEventRegistered("handleContextMenu")) {
			aActions.push({
				"id": id + "5",
				"name": "handleContextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleContextMenu"
			});
		}
		if (this.mEventRegistry["handleClick"] || this.isEventRegistered("handleClick")) {
			aActions.push({
				"id": id + "6",
				"name": "handleClick",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleClick"
			});
		}
		// check whether the select/deselect events are subscribed or the select property is part of the template
		// Note: Without template binding all aggregated instances would need to be checked use of select property -> this is not yet done and thus
		// event subscription is needed!
		var oTemplateBindingInfo;
		var bSelectPropertyIsBound = ((oTemplateBindingInfo = this.getTemplateBindingInfo())) ? oTemplateBindingInfo.hasOwnProperty("select") : false;
		if ((this.mEventRegistry["select"] || this.mEventRegistry["deselect"] || bSelectPropertyIsBound) && !this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "9",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click"
			});
		}

		return aActions;
	};

	VoAggregation.prototype.getBindInfo = function() {
		var oBindInfo = VoAbstract.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.HS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("hotScale") : true;
		oBindInfo.HDC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("hotDeltaColor") : true;
		oBindInfo.SC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("selectColor") : true;
		oBindInfo.FS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("fxsize") : true;
		oBindInfo.FD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("fxdir") : true;
		oBindInfo.ET = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("entity") : true;
		oBindInfo.LT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelText") : true;
		oBindInfo.LBC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelBgColor") : true;
		oBindInfo.LBBC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelBorderColor") : true;
		oBindInfo.AR = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelArrow") : true;
		oBindInfo.LP = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelPos") : true;
		oBindInfo.TT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("tooltip") : true;
		oBindInfo.DD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dragData") : true;
		oBindInfo.M = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("changeable") : true;

		oBindInfo.DS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dragSource") : true;
		oBindInfo.DT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dropTarget") : true;

		oBindInfo.LabelType = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelType") : true;

		return oBindInfo;
	};

	// base implementation for object handling corresponding to VoBase
	VoAggregation.prototype.getTemplateObject = function() {
		// get common template from parent class (VoAggregation)
		var oTemp = VoAbstract.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		this.bHasType = oBindInfo.LabelType || (oVoTemplate.mProperties["labelType"] !== sap.ui.vbm.SemanticType.None);

		// add base properties....................................................//
		if (oBindInfo.HS) {
			oTemp['hotScale.bind'] = oTemp.id + ".HS";
		} else {
			oTemp.hotScale = oVoTemplate.getHotScale();
		}
		if (oBindInfo.HDC) {
			oTemp['hotDeltaColor.bind'] = oTemp.id + ".HDC";
		} else {
			oTemp.hotDeltaColor = oVoTemplate.getHotDeltaColor();
		}
		if (oBindInfo.SC) {
			oTemp['selectColor.bind'] = oTemp.id + ".SC";
		} else {
			oTemp.selectColor = oVoTemplate.getSelectColor();
		}
		if (oBindInfo.FS) {
			oTemp['fxsize.bind'] = oTemp.id + ".FS";
		} else {
			oTemp.fxsize = oVoTemplate.getFxsize();
		}
		if (oBindInfo.FD) {
			oTemp['fxdir.bind'] = oTemp.id + ".FD";
		} else {
			oTemp.fxdir = oVoTemplate.getFxdir();
		}
		if (oBindInfo.ET) {
			oTemp['entity.bind'] = oTemp.id + ".ET";
		} else {
			oTemp.entity = oVoTemplate.getEntity();
		}
		if (oBindInfo.LT) {
			oTemp['labelText.bind'] = oTemp.id + ".LT";
		} else {
			oTemp.labelText = oVoTemplate.getLabelText();
		}
		if (this.bHasType) {
			oTemp['labelIcon.bind'] = oTemp.id + ".LIC";
			oTemp['labelIconBgrdCol.bind'] = oTemp.id + ".LICC";
			oTemp['labelIconTextCol.bind'] = oTemp.id + ".LICTC";
			oTemp['labelBgColor.bind'] = oTemp.id + ".LBC";
			oTemp['labelBorderColor.bind'] = oTemp.id + ".LBBC";
		} else {
			if (oBindInfo.LBC) {
				oTemp['labelBgColor.bind'] = oTemp.id + ".LBC";
			} else {
				oTemp.labelBgColor = oVoTemplate.getLabelBgColor();
			}
			if (oBindInfo.LBBC) {
				oTemp['labelBorderColor.bind'] = oTemp.id + ".LBBC";
			} else {
				oTemp.labelBorderColor = oVoTemplate.getLabelBorderColor();
			}
		}
		if (oBindInfo.AR) {
			oTemp['labelArrow.bind'] = oTemp.id + ".AR";
		} else {
			oTemp.labelArrow = oVoTemplate.getLabelArrow();
		}
		if (oBindInfo.LP) {
			oTemp['labelPos.bind'] = oTemp.id + ".LP";
		} else {
			oTemp.labelPos = oVoTemplate.getLabelPos();
		}
		if (oBindInfo.TT) {
			oTemp['tooltip.bind'] = oTemp.id + ".TT";
		} else {
			oTemp.tooltip = oVoTemplate.getTooltip();
		}
		if (oBindInfo.DD) {
			oTemp['dragdata.bind'] = oTemp.id + ".DD";
		} else {
			oTemp.dragdata = oVoTemplate.getDragData();
		}
		// oTemp['select.bind'] = oTemp.id + ".VB:s"; //selection is build in and always bound
		if (!oBindInfo.M) {
			oTemp['VB:c'] = oVoTemplate.getChangeable();
		}

		// set default alternative border color
		oTemp.altBorderDeltaColor = '#676767';

		return oTemp;
	};

	VoAggregation.prototype.getTypeObject = function() {
		var oType = VoAbstract.prototype.getTypeObject.apply(this, arguments);

		var sMinSel = this.getMinSel();
		if (sMinSel != "0" && sMinSel != "1") {
			sMinSel = "0";
		}
		var sMaxSel = this.getMaxSel();
		if (sMaxSel != "0" && sMaxSel != "1" && sMaxSel != "n" || sMaxSel == "n") {
			sMaxSel = "-1";
		}

		oType['minSel'] = sMinSel;
		oType['maxSel'] = sMaxSel;

		var oBindInfo = this.mBindInfo;

		if (oBindInfo.HS) {
			oType.A.push({
				"name": "HS", // hot scale
				"alias": "HS",
				"type": "vector"
			});
		}
		if (oBindInfo.HDC) {
			oType.A.push({
				"name": "HDC", // hot delta color
				"alias": "HDC",
				"type": "string"
			});
		}
		if (oBindInfo.SC) {
			oType.A.push({
				"name": "SC", // select color
				"alias": "SC",
				"type": "string"
			});
		}
		if (oBindInfo.FS) {
			oType.A.push({
				"name": "FS", // fix size
				"alias": "FS",
				"type": "boolean"
			});
		}
		if (oBindInfo.ET) {
			oType.A.push({
				"name": "ET", // entity
				"alias": "ET",
				"type": "string"
			});
		}
		if (oBindInfo.LT) {
			oType.A.push({
				"name": "LT", // label text
				"alias": "LT",
				"type": "string"
			});
		}
		if (this.bHasType) {
			oType.A.push({
				"name": "LBC", // label background color
				"alias": "LBC",
				"type": "color"
			});
			oType.A.push({
				"name": "LBBC", // label background border color
				"alias": "LBBC",
				"type": "color"
			});
			oType.A.push({
				"name": "LIC", // typed label's icon
				"alias": "LIC",
				"type": "string"
			});
			oType.A.push({
				"name": "LICC", // typed label's icon color
				"alias": "LICC",
				"type": "color"
			});
			oType.A.push({
				"name": "LICTC", // typed label's icon text color
				"alias": "LICTC",
				"type": "color"
			});
		} else {
			if (oBindInfo.LBC) {
				oType.A.push({
					"name": "LBC", // label background color
					"alias": "LBC",
					"type": "color"
				});
			}
			if (oBindInfo.LBBC) {
				oType.A.push({
					"name": "LBBC", // label background border color
					"alias": "LBBC",
					"type": "color"
				});
			}
		}
		if (oBindInfo.AR) {
			oType.A.push({
				"name": "AR", // label arrow
				"alias": "AR",
				"type": "boolean"
			});
		}
		if (oBindInfo.LIC) {
			oType.A.push({
				"name": "LIC", // label icon name
				"alias": "LIC",
				"type": "string"
			});
		}
		if (oBindInfo.LP) {
			oType.A.push({
				"name": "LP", // label position
				"alias": "LP",
				"type": "long"
			});
		}
		if (oBindInfo.TT) {
			oType.A.push({
				"name": "TT", // tooltip
				"alias": "TT",
				"type": "string"
			});
		}
		if (oBindInfo.DD) {
			oType.A.push({
				"name": "DD", // dragdata
				"alias": "DD",
				"type": "string"
			});
		}
		if (oBindInfo.DS || oBindInfo.DT) {
			oType.N = [];
			if (oBindInfo.DS) {
				oType.N.push({
					"name": "DS", // DragSource
					"A": {
						"name": "DGT", // DragType
						"alias": "A",
						"type": "string"
					}
				});
			}
			if (oBindInfo.DT) {
				oType.N.push({
					"name": "DT", // DropTarget
					"A": {
						"name": "DPT", // DropType
						"alias": "A",
						"type": "string"
					}
				});
			}
		}

		// custom properties
		var aProperties = this.getCustomProperties();
		for (var i = 0; i < aProperties.length; ++i) {
			oType.A.push({
				"name": aProperties[i],
				"alias": aProperties[i],
				"type": "string"
			});
		}

		return oType;
	};

	VoAggregation.prototype.getDragItemTemplate = function(id) {
		// DragSource of aggregation
		var oBindInfo = this.mBindInfo;
		var aDragSource = this.getDragSource();
		var aDragItem = [];
		for (var nJ = 0, len = aDragSource.length; nJ < len; ++nJ) {
			aDragItem.push({
				"type": aDragSource[nJ].getType()
			});
		}
		if (oBindInfo.DS) {
			aDragItem.push({
				"datasource": id + ".DS",
				"type.bind": id + ".DS.DGT"
			});
		}
		return aDragItem;
	};

	VoAggregation.prototype.getDropItemTemplate = function(id) {
		// DropTarget of aggregation
		var oBindInfo = this.mBindInfo;
		var aDropTarget = this.getDropTarget();
		var aDropItem = [];
		for (var nJ = 0, len = aDropTarget.length; nJ < len; ++nJ) {
			aDropItem.push({
				"type": aDropTarget[nJ].getType()
			});
		}
		if (oBindInfo.DT) {
			aDropItem.push({
				"datasource": id + ".DT",
				"type.bind": id + ".DT.DPT"
			});
		}
		return aDropItem;
	};

	/**
	 * Open a Detail Window
	 *
	 * @param {sap.ui.vbm.VoBase} oVoInst VO instance for which the Detail Window should be opened
	 * @param {object} oParams Parameter object
	 * @param {string} oParams.caption Text for Detail Window caption
	 * @param {string} oParams.offsetX position offset in x-direction from the anchor point
	 * @param {string} oParams.offsetY position offset in y-direction from the anchor point
	 * @param {boolean} bUseClickPos Indicates whether the Detail Window should be located at the click position or object position
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoAggregation.prototype.openDetailWindow = function(oVoInst, oParams, bUseClickPos) {
		var oParent = this.getParent();
		oParent.mDTWindowCxt.bUseClickPos = bUseClickPos;
		oParent.mDTWindowCxt.open = true;
		oParent.mDTWindowCxt.src = oVoInst;
		oParent.mDTWindowCxt.key = oVoInst.getKey();
		oParent.mDTWindowCxt.params = oParams;
		oParent.m_bWindowsDirty = true;
		oParent.invalidate(this);
	};

	VoAggregation.prototype.handleChangedData = function(aElements) {
		if (aElements && aElements.length) {
			for (var nI = 0, oElement, oInst; nI < aElements.length; ++nI) {
				oElement = aElements[nI];
				oInst = this.findInstance(oElement.K);
				if (oInst) {
					oInst.handleChangedData(oElement);
				}
			}
		}
	};

	VoAggregation.prototype.handleEvent = function(event) {
		var sName = event.Action.name;

		var funcname = "fire" + sName[0].toUpperCase() + sName.slice(1);

		// first we try to get the event on a vo instance......................//
		var oVo;
		if ((oVo = this.findInstance(event.Action.instance))) {
			var eventContext = {
				data: event
			};
			if (sName.indexOf("handle") === 0) { // Event name starts with "handle"
				eventContext.handle = event.Action.Params.Param[2]['#'];
			}
			switch (sName) {
				case "click":
					if (event.Action.AddActionProperties && event.Action.AddActionProperties.AddActionProperty.length && event.Action.AddActionProperties.AddActionProperty[0].name == 'pos') {
						oVo.mClickGeoPos = event.Action.AddActionProperties.AddActionProperty[0]['#'];
					}
					break;
				case "contextMenu":
				case "handleContextMenu":
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
			if (oVo.mEventRegistry[sName]) {
				if (funcname in oVo) {
					oVo[funcname](eventContext);
				} else {
					oVo.fireEvent(sName, eventContext);
				}
			}
			if (this.mEventRegistry[sName]) {
				eventContext.instance = oVo;
				this[funcname](eventContext);
			}
		} else {
			Log.error("Instance for event not found", "", "sap.ui.vbm.VoAggregation");
		}

	};

	VoAggregation.prototype.getChangeType = function(diff) {
		var del = 0;
		var ins = 0;
		var chg = 0;
		var length = this.getItems().length;
		var a = [];
		var nK, nJ;
		for (nK = 0; nK < length; ++nK) {
			a.push(2);
		}
		var cA, cV, bFound;
		for (nJ = 0; nJ < diff.length; ++nJ) {
			if (diff[nJ].type == "delete") {
				bFound = false;
				cV = 0;
				cA = 0;
				while (!bFound) {
					if (cV == diff[nJ].index && a[cA] != 0) {
						a[cA] = 0;
						del++;
						break;
					} else if (a[cA] != 0) {
						cV++;
					}
					cA++;
				}
			} else if (diff[nJ].type == "insert") {
				if (diff[nJ].index >= length) {
					ins++;
				} else {
					bFound = false;
					cV = 0;
					cA = 0;
					while (!bFound) {
						if (cV == diff[nJ].index && a[cA] == 0) {
							a[cA] = 2;
							chg++;
							break;
						} else if (a[cA] != 0) {
							cV++;
						}
						cA++;
					}
				}
			}
		}
		if (diff.length && chg == del && del == diff.length / 2) {
			return 1; // update
		}
		if (del == diff.length) {
			return 2; // delete
		}
		if (ins == diff.length) {
			return 3; // add to the end
		}

		return 0;
	};

	VoAggregation.prototype.unbindAggregation = function(name) {
		if (name === "items") {
			this.m_bAggRenew = true;
		}
		VoAbstract.prototype.unbindAggregation.apply(this, arguments);
	};

	VoAggregation.prototype.updateAggregation = function(sName) {
		var oBindingInfo = this.mBindingInfos['items'],
		    oBinding = oBindingInfo && oBindingInfo.binding || null;

		VoAbstract.prototype.updateAggregation.apply(this, arguments);

		if (sName === "items" && oBinding) {
			var aVO = this.getItems();
			var sId = this.sId;
			var K = "0";
			var aContexts = oBinding.getCurrentContexts();
			// var aContexts = oBinding.getContexts();
			if (aContexts.diff && !this.m_bAggChange && !this.m_bAggRenew) {
				var changeType = this.getChangeType(aContexts.diff);
				if (changeType == 2) {
					// elements to remove
					for (var nK = 0; nK < aContexts.diff.length; ++nK) {
						var idx = aContexts.diff[nK].index;
						K = this.aUniqueIdx[idx];
						var E = {
							K: K
						};
						var N = {
							name: sId,
							E: E
						};
						var o = {
							name: sId,
							type: "E",
							N: N
						};
						this.aDiff.push({
							type: "delete",
							object: o
						});
						this.aUniqueIdx.splice(idx, 1);
						for (var nJ = 0; nJ < aVO.length - 1; ++nJ) {
							aVO[nJ].UniqueId = this.aUniqueIdx[nJ];
						}
					}
					this.m_bAggChange = true;
				} else if (changeType == 3 || changeType == 1) {
					// elements to be added to the end or updated
					for (var nL = 0; nL < aContexts.diff.length; ++nL) {
						if (aContexts.diff[nL].type == "insert") {
							this.aDiff.push({
								type: "insert",
								idx: aContexts.diff[nL].index
							});
						}
					}
					this.m_bAggChange = true;
				} else {
					this.m_bAggRenew = true;
				}
			}
		}

	};

	VoAggregation.prototype.invalidate = function(oSource) {
		var idx;
		if (!this.m_bAggRenew) {
			this.m_bAggRenew = true;
			if (oSource && this.getParent()) {
				idx = this.aUniqueIdx.indexOf(oSource.UniqueId);
				if (idx > -1) {
					var bFound = false;
					for (var nJ = 0; nJ < this.aDiff.length && !bFound; ++nJ) {
						if (this.aDiff[nJ].type == "insert" && this.aDiff[nJ].idx == idx) {
							bFound = true;
						}
					}
					if (!bFound) {
						this.aDiff.push({
							type: "insert",
							idx: idx
						});
					}
					this.m_bAggChange = true;
					this.m_bAggRenew = false;
				}
			}
		}
		sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
	};

	VoAggregation.prototype.resetIndices = function() {
		var aVO = this.getItems();
		for (var nK = 0; nK < aVO.length; ++nK) {
			aVO[nK].UniqueId = undefined;
		}
	};

	VoAggregation.prototype.getUniqueIdx = function() {
		return (this.currentIdx++);
	};

	VoAggregation.prototype.updateIdxArray = function() {
		this.aUniqueIdx = [];
		var aVO = this.getItems();
		for (var nK = 0; nK < aVO.length; ++nK) {
			this.aUniqueIdx.push(aVO[nK].UniqueId);
		}
	};

	VoAggregation.prototype.addUnique = function(UniqueId) {
		this.aUniqueIdx.push(UniqueId);
	};

	VoAggregation.prototype.setCustomProperties = function(aProperties) {
		this._oCPMap = null;
		return this.setProperty("customProperties", aProperties);
	};

	VoAggregation.prototype.getCustomPropertiesMap = function() {
		if (!this._oCPMap) {
			this._oCPMap = {};
			var aProperties = this.getCustomProperties();
			for (var i = 0; i < aProperties.length; ++i) {
				this._oCPMap[aProperties[i]] = true;
			}
		}
		return this._oCPMap;
	};

	VoAggregation.prototype.isSelectable = function() {
		return this.getMaxSel() !== "0";
	};

	VoAggregation.prototype.isSubscribed = function(event, instance) {
		// check subscriptions on VO aggregation level
		if (this.hasListeners(event)) {
			return true;
		}
		// check subscriptions on instance level
		if (instance) {
			var item = this.getItems()[instance];
			return item && item.hasListeners(event);
		}
		return false;
	};

	return VoAggregation;

});
