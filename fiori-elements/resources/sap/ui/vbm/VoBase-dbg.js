/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.VoBase.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/theming/Parameters",
	"sap/base/Log",
	"./library"
], function(Element, Parameters, Log, library) {
	"use strict";

	/**
	 * Constructor for a new VoBase.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract aggregation element for VO aggregations. This element implements the common part for all specific VO elements. It must not be
	 *        used directly, but is the base for further extension.<br>
	 *        As a common feature it provides the Label, which may be attached to any visual object. There are two modes for using labels:
	 *        <ul>
	 *        <li>A controlled mode by providing a label type. In this mode most parameters for the label are automatically set by programmed
	 *        defaults according to the Fiori guidelines.</li>
	 *        <li>A freestyle mode, providing the full control on colors and layout.</li>
	 *        </ul>
	 *        Further all visual objects have common edit capabilities and it is possible to drop content on visual objects.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VoBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VoBase = Element.extend("sap.ui.vbm.VoBase", /** @lends sap.ui.vbm.VoBase.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * Unique identifier for the object. This is optional. If not provided the default identifier sId is used. However, sId is generated
				 * if template binding is used and thus it is not stable. Provide the key if the object really needs to have a unique and stable
				 * identifier.
				 */
				key: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Scaling factor applied when visual object is hovered. This is only supported on selected VOs, which do not present a defined geo
				 * area.
				 */
				hotScale: {
					type: "string",
					group: "Misc",
					defaultValue: '1.0;1.0;1.0'
				},

				/**
				 * Color change applied when visual object is hovered. The format is
				 * RHLSA(&lt;hue&gt;;&lt;lightness&gt;;&lt;saturation&gt;;&lt;opacity&gt;). The hue shift is given in degree (0 to 360). The other
				 * parameters are given as multipliers, where 1 means the component remains unchanged.<br>
				 * Beside the delta color approach it is also possible to specify an absolute color in the usual CSS color formats (except named
				 * colors).
				 */
				hotDeltaColor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RHLSA(0;1.3;1.0;1.0)'
				},

				/**
				 * Color change applied when visual object is selected. This can be explicit or a relative one. See above.
				 */
				selectColor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RHLSA(0.0;1.0;1.0;1.0)'
				},

				/**
				 * The visual object should keep its size when the map is zoomed. Default value is 'true'. Only meaningful for some VOs.
				 */
				fxsize: {
					type: "string",
					group: "Misc",
					defaultValue: 'true'
				},

				/**
				 * The visual object is not rotated when the map is rotated. The property is only required when the PlugIn is used and only meaningful
				 * for some VOs.
				 */
				fxdir: {
					type: "string",
					group: "Misc",
					defaultValue: 'true'
				},

				/**
				 * The visual object builds an entity/group with other VO elements when it is hovered. The property is not supported when the PlugIn
				 * is used.
				 */
				entity: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The visual objects label text. Providing a label text required, but also sufficient the get a label displayed.
				 */
				labelText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Type for semantic labels. A given semantic type will overrule color settings and add an icon.
				 */
				labelType: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: sap.ui.vbm.SemanticType.None
				},

				/**
				 * The visual objects label background color. The default value is white.
				 */
				labelBgColor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(255;255;255)'
				},

				/**
				 * The visual objects label border color. The default is no border.
				 */
				labelBorderColor: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The visual objects label arrow. For left/right/top/bottom aligned labels an additional arrow points to the label's object.
				 */
				labelArrow: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * The visual objects label position. This property determines the positioning of the label relative to the VO it belongs to.
				 * Possible values are:
				 * <ul>
				 * <li>0: centered</li>
				 * <li>1: top</li>
				 * <li>2: top right</li>
				 * <li>3: right</li>
				 * <li>4: bottom right</li>
				 * <li>5: bottom</li>
				 * <li>6: bottom left</li>
				 * <li>7: left</li>
				 * <li>8: top left</li>
				 * </ul>
				 * The default alignment is VO specific. <br>
				 * For multiple position based VOs, like Route, or Area the label is dynamically positioned. If the current display of a VO consists
				 * of multiple disconnected parts, each part gets an own label.
				 */
				labelPos: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Set to true if VO is changeable. Which properties are actually changeable can be controlled on the related VO aggregation.
				 */
				changeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Data to be dragged. This property allows you to provide an arbitrary data string, which is transfered to the target in a drag'n
				 * drop operation
				 */
				dragData: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Set to true if the element is selected
				 */
				select: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			events: {
				// Events are implemented in VoAggregation.js!

				/**
				 * The event is raised when there is a click action on a visual object.
				 */
				click: {},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a visual object.
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
				 * This event is raised when the design handle is moved.
				 */
				handleMoved: {
					parameters: {
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
							type: "int"
						}
					}
				},

				/**
				 * This event is raised when the design handle is right clicked.
				 */
				handleContextMenu: {
					parameters: {
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
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
				 * This event is raised when the design handle is clicked.
				 */
				handleClick: {
					parameters: {
						/**
						 * The number of the handle where the click occured. Handles are numbered zero based.
						 */
						handle: {
							type: "int"
						}
					}
				},

				/**
				 * The event is raised when something is dropped on the object.
				 */
				drop: {
					parameters: {
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

	/**
	 * Open a Detail Window for the visual object at click position. The method relies on the state saved before firing event <i>click</i>.
	 * 
	 * @param {string} sCaption Caption of detail window
	 * @param {string} sOffsetX Position offset in x-direction from the anchor point
	 * @param {string} sOffsetY Position offset in y-direction from the anchor point
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoBase.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		}, false); // the default implementation uses position binding for the detail window
	};

	/**
	 * Open the context menu. The method relies on the state saved before firing event <i>contextMenu</i>. Further the object oMenu is expected to be
	 * the one given as parameter <i>menu</i> of event <i>contextMenu</i>.
	 * 
	 * @param {object} oMenu The context menu to be opened. The object is expected the have an attribute
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoBase.prototype.openContextMenu = function(oMenu) {
		// function is just modelled here and needs to be implemented in the extension
		Log.warning("Implementation missing", "", "sap.ui.vbm.VoBase");
	};

	// /**
	// * This file defines behavior for the control,
	// */
	// VoBase.prototype.init = function() {
	// // do something for initialization...
	// };

	VoBase.prototype.DefaultColorBad = (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartBad") : "rgb(211, 32, 48)";
	VoBase.prototype.DefaultColorCritical = (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartCritical") : "rgb(225, 123, 36)";
	VoBase.prototype.DefaultColorGood = (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartGood") : "rgb(97, 166, 86)";
	VoBase.prototype.DefaultColorNeutral = (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartNeutral") : "rgb(132, 143, 148)";

	// VO Interface implementation ..............................................//

	VoBase.prototype.getDataElement = function() {
		// get the control.....................................................//
		var oElement = {};

		var type = this.getLabelType();

		var oBindInfo = this.oParent.mBindInfo;

		// add the key.........................................................//
		// oElement.K = this.getId(); // Use the Id as key here, since the Event dispatching relies on the structure of the Id!
		oElement.K = this.getUniqueId(); // Use the Id as key here, since the Event dispatching relies on the structure of the Id!

		// changeable...........................................................//
		if (oBindInfo.M) {
			oElement['VB:c'] = this.getChangeable();
		}

		// add the control object description..................................//
		if (oBindInfo.HS) {
			oElement.HS = this.getHotScale();
		}
		if (oBindInfo.HDC) {
			oElement.HDC = this.getHotDeltaColor();
		}
		if (oBindInfo.SC) {
			oElement.SC = this.getSelectColor();
		}
		if (oBindInfo.FS) {
			oElement.FS = this.getFxsize();
		}
		if (oBindInfo.FD) {
			oElement.FD = this.getFxdir();
		}
		if (oBindInfo.ET) {
			oElement.ET = this.getEntity();
		}
		if (type != sap.ui.vbm.SemanticType.Hidden) {
			if (oBindInfo.LT) {
				oElement.LT = this.getLabelText();
			}
			if (oBindInfo.LBC) {
				oElement.LBC = this.getLabelBgColor();
			}
			if (oBindInfo.LP) {
				oElement.LP = this.getLabelPos();
			}
			if (oBindInfo.LBBC) {
				oElement.LBBC = this.getLabelBorderColor();
			}
			if (oBindInfo.AR) {
				oElement.AR = this.getLabelArrow();
			}
		}
		if (oBindInfo.DD) {
			oElement.DD = this.getDragData();
		}
		oElement['VB:s'] = this.getSelect(); // always bound

		var tt = this.getTooltip();

		if (tt instanceof sap.ui.core.TooltipBase) {
			oElement.TT = "rtt#" + oElement.K; // send rtt#id and use RttMap[id] in sapscene.js
			sap.ui.vbm.VBI.RttMap[oElement.K] = tt;
		} else {
			oElement.TT = (tt) ? tt : "";
		}

		var oElem = this.getLabelProps(type);
		if (oElem && oElement.LT) {
			if (oElem.LBC) {
				oElement.LBC = oElem.LBC;
			}
			if (oElem.LBBC) {
				oElement.LBBC = oElem.LBBC;
			}
			if (oElem.LIC) {
				oElement.LIC = oElem.LIC;
			}
			if (oElem.LICC) {
				oElement.LICC = oElem.LICC;
			}
			if (oElem.LICTC) {
				oElement.LICTC = oElem.LICTC;
			}
		}
		if (!oElement.LBC) {
			oElement.LBC = "rgba(255,255,255,1.0)";
		}
		if (oElement.LBBC == "") {
			oElement.LBBC = oElement.LBC;
		}

		// add custom properties
		var aCustomData;
		if ((aCustomData = this.getCustomData())) {
			var oCPMap, oParent = this.getParent();
			if (oParent.getCustomPropertiesMap && (oCPMap = oParent.getCustomPropertiesMap())) {
				for (var i = 0; i < aCustomData.length; ++i) {
					var sKey = aCustomData[i].getKey();
					if (oCPMap[sKey]) {
						oElement[sKey] = aCustomData[i].getValue();
					}
				}
			}
		}

		return oElement;
	};

	VoBase.prototype.handleChangedData = function(oElement) {
		// default impl is empty, but makes interface function available for all VOs
	};

	// VO Base helper functions ..................................................//

	VoBase.prototype.getDragDropDefs = function() {

		var oBindInfo = this.oParent.mBindInfo;
		var aDragDrop = []; // array consisting of Drag and Drop attributes

		if (oBindInfo.DS) {
			// DragSource of VO instance
			var aDragSource = this.getDragSource(), sDS = [];

			// iterate over each DragSource
			for (var nJ = 0, lenDS = aDragSource.length; nJ < lenDS; ++nJ) {
				sDS.push({
					"VB:ix": nJ, // index
					"A": aDragSource[nJ].getType()
				// type
				});
			}
			if (sDS.length) {
				aDragDrop.push({
					"name": "DS",
					"E": sDS
				});
			}
		}

		if (oBindInfo.DT) {
			// DropTarget of VO instance
			var aDropTarget = this.getDropTarget(), sDT = [];

			// iterate over each DropTarget
			for (var nK = 0, lenDT = aDropTarget.length; nK < lenDT; ++nK) {
				sDT.push({
					"VB:ix": nK, // index
					"A": aDropTarget[nK].getType()
				// type
				});
			}
			if (sDT.length) {
				aDragDrop.push({
					"name": "DT",
					"E": sDT
				});
			}
		}
		return aDragDrop;
	};

	VoBase.prototype.getLabelProps = function(type) {
		var oElement = {};

		if (type == sap.ui.vbm.SemanticType.None || type == sap.ui.vbm.SemanticType.Default || type == sap.ui.vbm.SemanticType.Hidden) {
			return null;
		}

		oElement.LBC = oElement.LICTC = "rgba(255,255,255,1.0)";
		switch (type) {
			case sap.ui.vbm.SemanticType.Warning:
				oElement.LBBC = oElement.LICC = this.DefaultColorCritical;
				oElement.LIC = "message-warning";
				break;
			case sap.ui.vbm.SemanticType.Error:
				oElement.LBBC = oElement.LICC = this.DefaultColorBad;
				oElement.LIC = "message-error";
				break;
			case sap.ui.vbm.SemanticType.Success:
				oElement.LBBC = oElement.LICC = this.DefaultColorGood;
				oElement.LIC = "accept";
				break;
			case sap.ui.vbm.SemanticType.Inactive:
				oElement.LBBC = oElement.LICC = this.DefaultColorNeutral;
				oElement.LIC = "hint";
				break;
			default:
				break;
		}
		
		return oElement;
	};

	VoBase.prototype.getKey = function() {
		var sKey = this.getProperty("key");
		if (!sKey) {
			// Key not given -> return Id instead
			sKey = this.getUniqueId();
		}
		return sKey;
	};

	VoBase.prototype.invalidate = function() {
		sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
	};

	VoBase.prototype.getUniqueId = function() {
		if (this.UniqueId == undefined || this.UniqueId == 0) {
			var id = this.getId();
			var newstr = id;
			var matches = id.match(/\d+/g);
			if (matches && matches.length) {
				newstr = id.substring(0, id.lastIndexOf(matches[matches.length - 1]));
			}
			this.UniqueId = newstr + this.getParent().getUniqueIdx();
		}
		return this.UniqueId;
	};

	return VoBase;

});
