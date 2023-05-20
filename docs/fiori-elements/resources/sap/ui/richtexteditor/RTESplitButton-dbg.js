/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
// Provides control sap.ui.richtexteditor.RTESplitButton.
sap.ui.define([
	"sap/m/SplitButton",
	"./RTESplitButtonRenderer" // Control renderer
], function(SplitButton){
		"use strict";

		/**
		 * Constructor for a new <code>RTSplitButton</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The RTESplitButton control replaces the SplitButton used as a font color button of the Custom Toolbar in RichTextEditor
		 * @extends sap.m.SplitButton
		 *
		 * @constructor
		 * @private
		 * @alias sap.ui.richtexteditor.RTESplitButton
		 *
		 * @author SAP SE
		 * @version 1.113.0
		 */
		var RTESplitButton = SplitButton.extend("sap.ui.richtexteditor.RTESplitButton", {
			metadata: {
				properties : {
					/**
					 * The currently selected color
					 */
					currentColor : { type: "sap.ui.core.CSSColor", group: "Appearance", defaultValue: 'rgb(0, 0, 0)' }
				},
				interfaces : [
					"sap.m.IOverflowToolbarContent"
				],
				library: "sap.ui.richtexteditor"
			}
		});

		RTESplitButton.prototype.init = function () {
			SplitButton.prototype.init.apply(this, arguments);

			this._cachedElem = this._createIcon();
		};

		RTESplitButton.prototype._createIcon = function () {
			var oIcon, oPath, oRect1, oRect2, propName,
				oRectData = {x: "1", y: "12", width: "14", height: "3", rx: "0.2", ry: "0.2"},
				sSVGNameSpace = "http://www.w3.org/2000/svg";

			oIcon = document.createElementNS(sSVGNameSpace, "svg");
			oIcon.setAttribute("class", "rteFontColorIcon");
			oIcon.setAttribute("viewBox", "0 0 16 16");
			oIcon.style.fill = this.getCurrentColor();

			oPath = document.createElementNS(sSVGNameSpace, "path");
			oPath.setAttribute("d", "M662.477,379.355h3.038l.806,2.7h1.163l-2.729-9h-1.518l-2.753,9h1.21Zm1.519-5.4,1.281,4.5h-2.586Z");
			oPath.setAttribute("transform", "translate(-656.047 -373.055)");
			oIcon.appendChild(oPath);

			oRect1 = document.createElementNS(sSVGNameSpace, "rect");
			oRect1.setAttribute("class", "outline");

			oRect2 = document.createElementNS(sSVGNameSpace, "rect");
			oRect2.setAttribute("class", "fill");

			for (propName in oRectData) {
				oRect1.setAttribute(propName, oRectData[propName]);
				oRect2.setAttribute(propName, oRectData[propName]);
			}

			oIcon.appendChild(oRect1);
			oIcon.appendChild(oRect2);

			return oIcon;
		};

		RTESplitButton.prototype.onAfterRendering = function () {
			SplitButton.prototype.onAfterRendering.apply(this, arguments);

			//RTESplitButton extend the SplitButton, which renders sam.m.Button controls.
			//As we need to inject an svg icon in the inner buttons, this would increase
			//immensely the code complexity if we are to overwrite the rendering methods
			//ot those controls. That is why we have chosen to inject it with jQuery.

			// Add the svg icon  used for the font color button to the RTESplitButton
			this.$().find(".sapMSBText .sapMBtnInner").html(this._cachedElem);
		};

		RTESplitButton.prototype.onBeforeRendering = function () {
			this.addStyleClass('sapRTESB');
		};

		RTESplitButton.prototype.exit = function(){
			SplitButton.prototype.exit.apply(this, arguments);
			this._cachedElem = null;
		};

		/**
		 * Helper function for selecting the svg fill rectangle
		 *
		 * @returns {object} The svg fill rectangle
		 * @private
		 */
		RTESplitButton.prototype._getIconSvgFill = function(){
			return this._cachedElem && this._cachedElem.querySelector(".fill");
		};

		/**
		 * Helper function used to get the font color
		 *
		 * @returns {string} Selected font color from the color palette
		 * @public
		 */
		RTESplitButton.prototype.getIconColor = function(){
			return this.getCurrentColor();
		};

		/**
		 * Helper function for updating the color of the fill with the selected font color
		 *
		 * @param {string} [sColor] Font color
		 * @returns {object} The RTESplitButton instance
		 * @public
		 */
		RTESplitButton.prototype.setIconColor = function (sColor) {
			var oColorNode = this._getIconSvgFill();

			if (oColorNode) {
				oColorNode.style.fill = sColor;
			}

			this.setProperty("currentColor", sColor, false);

			return this;
		};
	return RTESplitButton;
});
