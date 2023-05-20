/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/m/ActionSheetRenderer',
	'sap/ui/core/Renderer',
	'sap/m/Dialog',
	"sap/ui/Device"
], function(ActionSheetRenderer, Renderer, Dialog, Device) {
	"use strict";

	/**
	 * @class LinkActionSheet renderer.
	 * @static
	 */
	var LinkActionSheetRenderer = Renderer.extend(ActionSheetRenderer);

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	LinkActionSheetRenderer.render = function(oRm, oControl) {
		var aActionItems = oControl.getItems(), i, bMixedButtons = false;

		for (i = 0; i < aActionItems.length; i++) {
			if (aActionItems[i].getIcon && aActionItems[i].getIcon()) {
				bMixedButtons = true;
				break;
			}
		}

		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMActionSheet");
		oRm.addClass("sapUILinkActionSheet");
		if (bMixedButtons) {
			oRm.addClass("sapMActionSheetMixedButtons");
		}
		oRm.writeClasses();

		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.write(">");

		for (i = 0; i < aActionItems.length; i++) {
			if (aActionItems[i].getType) { // if this is a button
				var oButton = aActionItems[i];
				oButton.addStyleClass("sapMActionSheetButton");
				oButton.addStyleClass("sapUILinkActionSheetButton");
				oRm.renderControl(oButton);
			} else if (aActionItems[i].getHref) { // if this is a link
				oRm.renderControl(aActionItems[i].addStyleClass("sapUILinkActionSheetLink"));
			}
		}

		if ((Device.os.ios && Device.system.phone || (Dialog._bOneDesign && Device.system.phone)) && oControl.getShowCancelButton()) {
			oRm.renderControl(oControl._getCancelButton());
		}

		oRm.write("</div>");
	};

	return LinkActionSheetRenderer;
}, /* bExport= */ true);
