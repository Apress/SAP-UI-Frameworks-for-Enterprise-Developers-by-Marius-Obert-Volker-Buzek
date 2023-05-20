/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Spot.
sap.ui.define([
	"./VoBase",
	"sap/ui/core/theming/Parameters",
	"./library"
], function(VoBase, Parameters, library) {
	"use strict";

	/**
	 * Constructor for a new Spot.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>Spot</i>. A Spot is actually an image drawn at the given <i>position</i>. There are two modes
	 *        for using spots:
	 *        <ul>
	 *        <li>A controlled mode by providing a spot type. In this mode many properties for the spot are automatically set by programmed defaults
	 *        according to the Fiori guidelines.</li>
	 *        <li>A freestyle mode, providing the full control on colors and layout.</li>
	 *        </ul>
	 *        Beside the visualization with an image a spot can have an <i>icon</i> or <i>text</i>, which can be controlled and positioned using the
	 *        content properties. <br>
	 *        A Spot supports GeoMap internal drag'n drop with fine grained control on matching drag sources and drop targets. A drag'n drop operation
	 *        is possible if any type in the drag source aggregation of the dragged visual object matches a type in the drop target aggregation of the
	 *        target vo. Drag source and drop target types defined on element level apply only for a single element instance, except the element is
	 *        used as template.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Spot
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Spot = VoBase.extend("sap.ui.vbm.Spot", /** @lends sap.ui.vbm.Spot.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position of the spot. The format is "lon;lat;0"
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: '0;0;0'
				},

				/**
				 * The text that is displayed on the spot. The text should not exceed a few characters. Note that either text or icon may be displayed (
				 * not both together ).
				 */
				text: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The image for the spot. This must be a reference to a resource.
				 */
				image: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Alignment of the spot to its position:
				 * <ul>
				 * <li>0: center
				 * <li>1: top center
				 * <li>2: top right
				 * <li>3: center right
				 * <li>4: bottom right
				 * <li>5: bottom center
				 * <li>6: bottom left
				 * <li>7: center left
				 * <li>8: top left
				 * </ul>
				 */
				alignment: {
					type: "string",
					group: "Misc",
					defaultValue: '5'
				},

				/**
				 * The scale of the spot. The format is "x-Scale;y-Scale;z-Scale". The z-Scale is curretly ignored.
				 */
				scale: {
					type: "string",
					group: "Misc",
					defaultValue: '1;1;1'
				},

				/**
				 * The image for the spot when selected. This must be a reference to a resource.
				 */
				imageSelected: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The icon to be rendered on the spot. Note that either text or icon may be displayed ( not both together ). Use the CharCode-Id of
				 * SAPUI5-Icons (e.g.: "\ue146")
				 */
				icon: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The color of the content ( icon or text ).
				 */
				contentColor: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The offset from the center of the image where to place the content ( text or icon ) in x;y- direction
				 */
				contentOffset: {
					type: "string",
					group: "Misc",
					defaultValue: '0;0'
				},

				/**
				 * The font of the spot's text. If icon is used then the font is automatically set to"SAP-icons".
				 */
				contentFont: {
					type: "string",
					group: "Misc",
					defaultValue: 'arial'
				},

				/**
				 * The font size to be used for text or icon
				 */
				contentSize: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Spot type for semantic spots. A given semantic type will overrule settings for image, scale, and content.
				 */
				type: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: null
				}
			},
			aggregations: {

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
			events: {}
		}
	});

	Spot.prototype.init = function() {
		// set control specific property defaults
		// explicitly set properties will still be applied later!
		this.mProperties.contentColor = "#000000";
		this.mProperties.contentSize = (Parameters) ? Parameters.get("sapMFontMediumSize") : null;
	};

	// Implement function defined in VoBase
	Spot.prototype.openContextMenu = function(oMenu) {
		this.getParent().openContextMenu("Spot", this, oMenu);
	};

	Spot.prototype.getImageProps = function(type, txtLen, bHasIcon) {
		var oElement = {};

		if (type !== sap.ui.vbm.SemanticType.None) {
			if (type === sap.ui.vbm.SemanticType.Hidden) {
				oElement.I = "Pin_Hidden.png";
			} else {
				if (type === sap.ui.vbm.SemanticType.Error) {
					oElement.I = "Pin_Red_";
				}
				if (type === sap.ui.vbm.SemanticType.Warning) {
					oElement.I = "Pin_Orange_";
				}
				if (type === sap.ui.vbm.SemanticType.Success) {
					oElement.I = "Pin_Green_";
				}
				if (type === sap.ui.vbm.SemanticType.Inactive) {
					oElement.I = "Pin_Grey_";
				}
				if (type === sap.ui.vbm.SemanticType.Default) {
					oElement.I = "Pin_Blue_";
				}
				if (txtLen) {
					if (txtLen > 3) {
						oElement.I += "5-digit_space.png";
						oElement.CO = "15;-3";
					} else if (txtLen > 1) {
						oElement.I += "3-digit_space.png";
						oElement.CO = "9;-3";
					} else {
						oElement.I += "1-digit.png";
						oElement.CO = "0;-3";
					}
				} else if (oElement.I) {
					oElement.I += (bHasIcon) ? "1_Icon.png" : "0_Icon.png";
					if (bHasIcon) {
						oElement.CO = "0;-5";
					}
				}
			}

			if (oElement.I) {
				this.getParent().getParent().addResourceIfNeeded(oElement.I);
			}
		}

		return oElement;
	};

	Spot.prototype.getDataElement = function() {

		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.S) {
			oElement.S = this.getScale();
		}
		if (oBindInfo.T) {
			oElement.T = this.getText();
		}
		if (oBindInfo.I) {
			oElement.I = this.getImage();
		}
		if (oBindInfo.IS) {
			oElement.IS = this.getImageSelected();
		}
		if (oBindInfo.AL) {
			oElement.AL = this.getAlignment();
		}
		if (oBindInfo.IC) {
			oElement.IC = this.getIcon();
		}
		if (oBindInfo.CC) {
			oElement.CC = this.getContentColor();
		}
		if (oBindInfo.CO) {
			oElement.CO = this.getContentOffset();
		}
		if (oBindInfo.CF) {
			oElement.CF = this.getContentFont();
		}
		if (oBindInfo.CS) {
			oElement.CS = this.getContentSize();
		}
		if (oBindInfo.DS || oBindInfo.DT) {
			oElement.N = this.getDragDropDefs();
		}

		// get the image properties for this instance
		var txt = this.getText(); // Note: Use getter since text may be static/not bound! 
		var txtLen = txt ? txt.length : 0;
		var icon = this.getIcon(); // Note: Use getter since icon may be static/not bound!
		var bHasIcon = (icon.length > 0 ) ? true : false;

		var oElem = this.getImageProps(this.getType(), txtLen, bHasIcon);
		if (oElem.I) {
			oElement.I = oElem.I;
		}
		if (oElem.CO) {
			oElement.CO = oElem.CO;
		}

		return oElement;
	};

	Spot.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.S) {
			this.setScale(oElement.S);
		}
	};

	return Spot;

});
