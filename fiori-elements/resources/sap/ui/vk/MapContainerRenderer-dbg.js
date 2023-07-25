/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./ContainerBaseRenderer", "sap/ui/core/Renderer", "sap/ui/Device"
], function(BaseContainerRenderer, Renderer, Device) {
	"use strict";

	/*
	 * @class MapContainer renderer. @static
	 */
	var MapContainerRenderer = Renderer.extend(BaseContainerRenderer);

	MapContainerRenderer.apiVersion = 2;

	MapContainerRenderer.writeToolbarArea = function(oRm, oControl) {
		oRm.openStart("div");
		oRm.class("sapUiVkMapContainerOverlay");
		oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
		oRm.openEnd();
		if (oControl.getShowNavbar()) {
			oRm.openStart("div");
			oRm.class("sapUiVkMapContainerNavbarArea");
			oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
			oRm.openEnd();

			// navbar
			if (oControl.getShowMapLayer() && oControl._shouldRenderMapLayerSwitch) {
				oRm.renderControl(oControl._currentText);
				oRm.renderControl(oControl._selectionMap);
			}
			oRm.openStart("div");
			oRm.class("sapUiVkMapContainerNavbarContainer");
			oRm.attr("role", sap.ui.core.AccessibleRole.Navigation);
			oRm.openEnd();
			oRm.renderControl(oControl._oNavbar);
			oRm.close("div");// end navbar
			oRm.close("div");// end navbar
		}

		// list panel
		if (!Device.system.phone && oControl._shouldRenderListPanel) {
			oControl._oScrollCont.addStyleClass("sapUiVkMapContainerListPanelArea");
			oRm.renderControl(oControl._oScrollCont);
		}

		BaseContainerRenderer.writeToolbarArea(oRm, oControl);

		oRm.close("div");
		if (Device.system.phone) {
			oRm.openStart("div");
			oRm.attr("id", oControl.getId() + "-LPW");
			oRm.class("sapUiVkMapContainerLPW");
			oRm.openEnd();
			// close button
			oRm.renderControl(oControl._oMenuCloseButton);
			// list panel
			oControl._oScrollCont.addStyleClass("sapUiVkMapContainerListPanelArea");
			oRm.renderControl(oControl._oScrollCont);
			oRm.close("div");// end list panel container
		}
	};

	return MapContainerRenderer;

}, /* bExport= */true);
