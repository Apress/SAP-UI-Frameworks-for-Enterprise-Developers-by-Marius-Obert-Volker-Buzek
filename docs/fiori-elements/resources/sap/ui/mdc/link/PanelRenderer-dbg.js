/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([], function() {
	"use strict";

	var PanelRenderer = {
		apiVersion: 2
	};

	PanelRenderer.render = function(oRenderManager, oPanel) {
		var oContent = oPanel.getAggregation("_content");

		oRenderManager.openStart("div", oPanel);
		oRenderManager.class("mdcbaseinfoPanel");
		oRenderManager.openEnd();

		oRenderManager.renderControl(oContent);

		oRenderManager.close("div");
	};

	return PanelRenderer;
});