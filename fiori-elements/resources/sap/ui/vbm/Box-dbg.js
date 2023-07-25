/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Box.
sap.ui.define([
	"./VoBase",
	"./library"
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new Box.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>Box</i>. A Box is a rectangle, which is positioned with its centerpoint at the given <i>position</i>.
	 *        The ratio between width and height can be controlled with property <i>scale</i>. Depending on the property <i>fxsize</i> a box has an
	 *        absolute or relative size.<br>
	 *        Since the actual size of a box may depend on the zoom level it might be only partly visible. Thus detail windows will open at the click
	 *        position.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Box
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Box = VoBase.extend("sap.ui.vbm.Box", /** @lends sap.ui.vbm.Box.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position of the Box. The format is "lon;lat;0".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: '0;0;0'
				},

				/**
				 * The scale of the box. The format is "x-Scale;y-Scale;z-Scale" whereas z-Scale is currently ignored.
				 */
				scale: {
					type: "string",
					group: "Misc",
					defaultValue: '1;1;1'
				},

				/**
				 * The color of the box.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(255;0;0)'
				},

				/**
				 * The border color of the box.
				 */
				colorBorder: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(255;0;0)'
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Box.prototype.init = function(){
	// // do something for initialization...
	// };

	// Overwrite default impl from VoBase
	Box.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		}, true);

	};

	// Implement function defined in VoBase
	Box.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("Box", this, oMenu);

	};

	Box.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			oElement.P = this.getPosition();
		}
		if (oBindInfo.S) {
			oElement.S = this.getScale();
		}
		if (oBindInfo.C) {
			oElement.C = this.getColor();
		}
		if (oBindInfo.CB) {
			oElement.CB = this.getColorBorder();
		}

		return oElement;
	};

	Box.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
		if (oElement.S) {
			this.setScale(oElement.S);
		}
	};

	return Box;

});
