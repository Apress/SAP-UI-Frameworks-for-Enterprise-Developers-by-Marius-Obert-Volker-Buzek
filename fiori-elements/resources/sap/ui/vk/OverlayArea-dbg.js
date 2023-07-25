/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.OverlayArea.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"./getResourceBundle"
], function(
	Element,
	Menu,
	MenuItem,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new OverlayArea.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation element for the Overlay Control
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.OverlayArea
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var OverlayArea = Element.extend("sap.ui.vk.OverlayArea", /** @lends sap.ui.vk.OverlayArea.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties: {
				/**
				 * Unique identifier for the object. This is optional. If not provided the default identifier sId is used. However, sId is generated
				 * if template binding is used and thus it is not stable. Provide the key if the object really needs a unique and stable identifier.
				 */
				key: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The position array for the OverlayArea. The format is "x0;y0;0;...;xN,yN,0".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The fill color of the OverlayArea.
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					group: "Misc",
					defaultValue: "rgba(200, 50, 50, 0.3)"
				},

				/**
				 * The border color of the OverlayArea.
				 */
				colorBorder: {
					type: "sap.ui.core.CSSColor",
					group: "Misc",
					defaultValue: "rgba(200, 50, 50, 1.0)"
				},

				/**
				 * The select color of the OverlayArea in case selection highlighting is desired.
				 */
				colorSelect: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The non-select color of the OverlayArea in case non-selection de-highlighting is desired.
				 */
				colorNonSelect: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Color or color delta when object is hovered. Color deltas can be declared in the format RHLSA(<hue shift in degree>;<lightness
				 * multiplier>;<saturation multiplier>;<opacity multiplier>)
				 */
				deltaColorHot: {
					type: "string",
					group: "Misc",
					defaultValue: "RHLSA(0;1.3;1.0;1.0)"
				},

				/**
				 * set to true if the element is selected
				 */
				select: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Set to true if OverlayArea is changeable.
				 */
				changeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on an OverlayArea.
				 */
				click: {
					/**
					 * Client coordinate X
					 */
					clientX: {
						type: "int"
					},

					/**
					 * Client coordinate Y
					 */
					clientY: {
						type: "int"
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on an OverlayArea.
				 */
				contextMenu: {
					parameters: {

						/**
						 * Menu to open
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						}
					}
				},

				/**
				 * This event is raised when the edge of an OverlayArea is clicked.
				 */
				edgeClick: {
					parameters: {
						/**
						 * Index of the clicked edge. The numbering is zero based and the first edge with index 0 starts at the first position in the
						 * position array and end at the second.
						 */
						index: {
							type: "int"
						}
					}
				},

				/**
				 * This event is raised when the edge of an OverlayArea is right clicked.
				 */
				edgeContextMenu: {
					parameters: {
						/**
						 * Index of the clicked edge. The numbering is zero based and the first edge with index 0 starts at the first position in the
						 * position array and end at the second.
						 */
						index: {
							type: "int"
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
				 * This event is raised when the design handle of a changeable OverlayArea is moved.
				 */
				handleMoved: {},

				/**
				 * This event is raised when the design handle of a changeable OverlayArea is right clicked.
				 */
				handleContextMenu: {
					parameters: {
						/**
						 * Index of the clicked handle. The numbering is zero based.
						 */
						index: {
							type: "int"
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
				 * This event is raised when the design handle of a changeable OverlayArea is clicked.
				 */
				handleClick: {
					/**
					 * Index of the clicked handle. The numbering is zero based.
					 */
					index: {
						type: "int"
					}
				}

			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// OverlayArea.prototype.init = function(){
	// // do something for initialization...
	// };

	/**
	 * open the context menu
	 *
	 * @param {object} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	OverlayArea.prototype.openContextMenu = function(oMenu) {
		this.getParent().openContextMenu("OverlayArea", this, oMenu);
	};

	OverlayArea.prototype.getDataElement = function() {
		var oElement = {};
		var oBindInfo = this.getParent().AreaBindInfo;
		oElement.K = this.getId(); // Use the Id as key here, since the Event dispatching relies on the structure of the Id!

		// add the VO specific properties..................................//
		if (oBindInfo.C) {
			oElement.C = this.getColor();
		}
		if (oBindInfo.CB) {
			oElement.CB = this.getColorBorder();
		}
		if (oBindInfo.DCH) {
			oElement.DCH = this.getDeltaColorHot();
		}
		if (oBindInfo.CS) {
			oElement.CS = this.getColorSelect();
		}
		if (oBindInfo.CNS) {
			oElement.CNS = this.getColorNonSelect();
		}
		if (oBindInfo.TT) {
			oElement.TT = this.getTooltip();
		}
		oElement["VB:s"] = this.getSelect();
		oElement.P = this.getPosition();
		if (oBindInfo.M) {
			oElement["VB:c"] = this.getChangeable();
		}
		return oElement;
	};

	OverlayArea.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
	};

	OverlayArea.prototype.handleEvent = function(event) {
		// construct function name from action name
		var sActionName = event.Action.name;
		var funcname = "fire" + sActionName[0].toUpperCase() + sActionName.slice(1);

		if (sActionName === "contextMenu" || sActionName === "edgeContextMenu" || sActionName === "handleContextMenu") {
			var oParent = this.getParent();
			this.mClickPos = [
				event.Action.Params.Param[0]["#"], event.Action.Params.Param[1]["#"]
			];
			// create an empty menu
			if (oParent.mVBIContext.m_Menus) {
				oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
			}

			var oMenuObject = new Menu();
			oMenuObject["vbi_data"] = {};
			oMenuObject["vbi_data"].menuRef = "CTM";
			oMenuObject["vbi_data"].VBIName = "DynContextMenu";

			// prepare own menu items for certain events
			if (this.getChangeable()) {
				if (sActionName === "edgeContextMenu") {
					var sEdge = event.Action.Params.Param[2]["#"];
					oParent.mAddMenuItems.push(new MenuItem({
						text: getResourceBundle().getText("OVL_AREA_EDGE_SPLIT"),
						select: this._handleCtxFunction.bind(this, "SPLIT", sEdge)
					}));
				} else if (sActionName === "handleContextMenu") {
					var sHandle = event.Action.Params.Param[2]["#"];
					oParent.mAddMenuItems.push(new MenuItem({
						text: getResourceBundle().getText("OVL_AREA_HANDLE_REMOVE"),
						select: this._handleCtxFunction.bind(this, "REMOVE", sHandle)
					}));
				}
			}

			if (this.hasListeners(sActionName)) {
				// fire the event..................................................//
				if (sActionName === "contextMenu") {
					this.firecontextMenu({
						menu: oMenuObject
					});
				} else {
					this[funcname]({
						index: event.Action.Params.Param[2]["#"],
						menu: oMenuObject
					});
				}
			} else {
				oParent._openContextMenu(event.Action.object, this, oMenuObject);
			}

		} else if (sActionName == "click") {
			this.mClickPos = event.Action.AddActionProperties.AddActionProperty[0]["#"];
			this.fireClick({
				clientX: event.Action.Params.Param[0]["#"],
				clientY: event.Action.Params.Param[1]["#"]
			});
		} else if (sActionName.indexOf("Click") > -1) {
			// edgeClick or handleClick
			this[funcname]({
				index: event.Action.Params.Param[2]["#"]
			});
		} else {
			this[funcname]();
		}
	};

	OverlayArea.prototype.getKey = function() {
		var sKey = this.getProperty("key");
		if (!sKey) {
			// Key not given -> return Id instead
			sKey = this.getId();
		}
		return sKey;
	};

	OverlayArea.prototype._handleCtxFunction = function(sFunc, sContext) {
		var aPos = this.getPosition().split(";");
		var offset = sContext * 3;
		if (sFunc === "REMOVE") {
			// delete handle
			aPos.splice(offset, 3);
		} else if (sFunc === "SPLIT") {
			// split edge at midpoint
			var startPos = [
				aPos[offset], aPos[offset + 1]
			];
			var endPos = (offset + 3 < aPos.length) ? [
				aPos[offset + 3], aPos[offset + 4]
			] : [
				aPos[0], aPos[1]
			];
			var midPoint = [
				parseFloat(startPos[0]) + (endPos[0] - startPos[0]) / 2, parseFloat(startPos[1]) + (endPos[1] - startPos[1]) / 2
			];
			aPos.splice(offset + 3, 0, midPoint[0].toString(), midPoint[1].toString(), "0");
		}
		this.setPosition(aPos.toString().replace(/,/g, ";"));
	};

	return OverlayArea;

});
