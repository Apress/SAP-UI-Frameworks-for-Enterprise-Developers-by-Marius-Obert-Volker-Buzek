/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Spots.
sap.ui.define([
	"./VoAggregation",
	"./library"
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new Spots.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Spot</i> elements.<br>
	 *        Spots support GeoMap internal drag'n drop with fine grained control on matching drag sources and drop targets. A drag'n drop operation
	 *        is possible if any type in the drag source aggregation of the dragged visual object matches a type in the drop target aggregation of the
	 *        target vo. If drag source and drop target types are defined on aggregation level they apply for all aggregated elements.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Spots
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Spots = VoAggregation.extend("sap.ui.vbm.Spots", /** @lends sap.ui.vbm.Spots.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Set to true if position may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				posChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Set to true if scale may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				scaleChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * spot object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Spot",
					multiple: true,
					singularName: "item"
				},

				/**
				 * DragSource aggregation
				 */
				dragSource: {
					type: "sap.ui.vbm.DragSource",
					multiple: true,
					singularName: "dragSource"
				},

				/**
				 * DropTarget aggregation
				 */
				dropTarget: {
					type: "sap.ui.vbm.DropTarget",
					multiple: true,
					singularName: "dropTarget"
				}
			},
			events: {
				
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Spots.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//

	Spots.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.S = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("scale") : true;
		oBindInfo.I = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("image") : true;
		oBindInfo.IS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("imageSelected") : true;
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.T = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("text") : true;
		oBindInfo.AL = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("alignment") : true;
		oBindInfo.IC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("icon") : true;
		oBindInfo.CC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("contentColor") : true;
		oBindInfo.CO = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("contentOffset") : true;
		oBindInfo.CF = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("contentFont") : true;
		oBindInfo.CS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("contentSize") : true;
		oBindInfo.Type = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("type") : true;

		return oBindInfo;
	};

	Spots.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		if (oBindInfo.Type || oVoTemplate.mProperties["type"] !== sap.ui.vbm.SemanticType.None) {
			// type is given -> set all properties influenced by the type to bound
			// the actual influence of the type is determined in Spot.getDataElement()
			oBindInfo.T = oBindInfo.I = oBindInfo.CO = oBindInfo.CC = true;
		}

		oTemp["type"] = "{00100000-2012-0004-B001-64592B8DB964}";
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.IC) {
			oTemp["icon.bind"] = oTemp.id + ".IC";
		} else {
			oTemp.icon = oVoTemplate.getIcon(); // IC is the icon
		}
		if (oBindInfo.S) {
			oTemp["scale.bind"] = oTemp.id + ".S";
		} else {
			oTemp.scale = oVoTemplate.getScale(); // S is the scaling
		}
		if (oBindInfo.IS) {
			oTemp["imageSelected.bind"] = oTemp.id + ".IS";
		} else {
			oTemp.imageSelected = oVoTemplate.getImageSelected(); // IS is the image when selected
		}
		if (oBindInfo.AL) {
			oTemp["alignment.bind"] = oTemp.id + ".AL";
		} else {
			oTemp.alignment = oVoTemplate.getAlignment(); // AL is the alignment
		}
		if (oBindInfo.CF) {
			oTemp["contentFont.bind"] = oTemp.id + ".CF";
		} else {
			oTemp.contentFont = oVoTemplate.getContentFont(); // CF is the the font for icon/text
		}
		if (oBindInfo.CS) {
			oTemp["contentSize.bind"] = oTemp.id + ".CS";
		} else {
			oTemp.contentSize = oVoTemplate.getContentSize(); // CS is the the font size for icon/text
		}
		if (oBindInfo.T) {
			oTemp["text.bind"] = oTemp.id + ".T";
		} else {
			oTemp.text = oVoTemplate.getText(); // T is the text
		}
		if (oBindInfo.I) {
			oTemp["image.bind"] = oTemp.id + ".I";
		} else {
			oTemp.image = oVoTemplate.getImage(); // I is the image
		}
		if (oBindInfo.CO) {
			oTemp["contentOffset.bind"] = oTemp.id + ".CO";
		} else {
			oTemp.contentOffset = oVoTemplate.getContentOffset(); // CO is the content offset
		}
		if (oBindInfo.CC) {
			oTemp["contentColor.bind"] = oTemp.id + ".CC";
		} else {
			oTemp.contentColor = oVoTemplate.getContentColor(); // CC is the the color of the icon or text
		}

		oTemp["DragSource"] = {
			"DragItem": this.getDragItemTemplate(oTemp.id)
		};
		oTemp["DropTarget"] = {
			"DropItem": this.getDropItemTemplate(oTemp.id)
		};

		return oTemp;
	};

	Spots.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		if (oBindInfo.P) {
			oType.A.push({
				"changeable": this.getPosChangeable().toString(),
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.S) {
			oType.A.push({
				"changeable": this.getScaleChangeable().toString(),
				"name": "S", // scale
				"alias": "S",
				"type": "vector"
			});
		}
		if (oBindInfo.T) {
			oType.A.push({
				"name": "T", // text
				"alias": "T",
				"type": "string"
			});
		}
		if (oBindInfo.I) {
			oType.A.push({
				"name": "I", // image
				"alias": "I",
				"type": "string"
			});
		}
		if (oBindInfo.IS) {
			oType.A.push({
				"name": "IS", // image selected
				"alias": "IS",
				"type": "string"
			});
		}
		if (oBindInfo.AL) {
			oType.A.push({
				"name": "AL", // alignment
				"alias": "AL",
				"type": "string"
			});
		}
		if (oBindInfo.IC) {
			oType.A.push({
				"name": "IC", // icon
				"alias": "IC",
				"type": "string"
			});
		}
		if (oBindInfo.CC) {
			oType.A.push({
				"name": "CC", // contentColor
				"alias": "CC",
				"type": "string"
			});
		}
		if (oBindInfo.CO) {
			oType.A.push({
				"name": "CO", // contentOffset
				"alias": "CO",
				"type": "string"
			});
		}
		if (oBindInfo.CF) {
			oType.A.push({
				"name": "CF", // contentFont
				"alias": "CF",
				"type": "string"
			});
		}
		if (oBindInfo.CF) {
			oType.A.push({
				"name": "CS", // contentsize
				"alias": "CS",
				"type": "string"
			});
		}
		return oType;
	};

	Spots.prototype.getActionArray = function(bForce) {
		var aActions = VoAggregation.prototype.getActionArray.apply(this, arguments);

		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (bForce || this.mEventRegistry["click"] || this.isEventRegistered("click")) {
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
		if (bForce || this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}
		if (bForce || this.mEventRegistry["drop"] || this.isEventRegistered("drop")) {
			aActions.push({
				"id": id + "3",
				"name": "drop",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Drop"
			});
		}

		return aActions;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	return Spots;

});
