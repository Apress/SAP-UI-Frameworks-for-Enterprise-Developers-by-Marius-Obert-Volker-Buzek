/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/m/PanelRenderer"], function (Renderer, PanelRenderer) {
	"use strict";

	/**
	 * TAccountPanel renderer.
	 */
	var TAccountItemPanelRenderer = Renderer.extend(PanelRenderer),
		oBindedControl;

	TAccountItemPanelRenderer.renderContent = function (oRm, oControl) {
		oBindedControl = oControl;
		PanelRenderer.renderContent.apply(this, [oRm, oControl]);
	};

	TAccountItemPanelRenderer.apiVersion = 2;


	TAccountItemPanelRenderer.renderChildren = function (oRm, aChildren) {
		var sId = oBindedControl && oBindedControl.getId();
		if (oBindedControl) {
			var oTable = oBindedControl.getTable();
			if (oTable) {
				oRm.openStart("div")
					.attr("id", sId + "-table")
					.class("sapSuiteUiCommonsAccountPanelTable")
					.openEnd();
				oRm.renderControl(oTable);
				oRm.close("div");
			}
		}

		oRm.openStart("div")
			.attr("id", sId + "-datacontent")
			.class("sapSuiteUiCommonsAccountPanelContent")
			.openEnd();
		aChildren.forEach(oRm.renderControl);
		oRm.close("div");

		var sOverlayVisible = oBindedControl && oBindedControl.getShowOverlay() ? "sapSuiteUiCommonsAccountPanelOverlayVisible" : "";
		oRm.openStart("div")
			.attr("id", sId + "-overlay")
			.class("sapSuiteUiCommonsAccountPanelOverlay")
			.class(sOverlayVisible)
			.openEnd();
		oRm.close("div");

	};

	return TAccountItemPanelRenderer;
}, /* bExport= */ true);
