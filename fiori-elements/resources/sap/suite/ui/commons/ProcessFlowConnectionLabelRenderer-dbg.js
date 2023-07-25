/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/m/ButtonRenderer','sap/ui/core/Renderer'],
	function(ButtonRenderer, Renderer) {
	"use strict";

	/**
	 * @class ProcessFlowConnectionLabel renderer.
	 * @static
	 */
	var ProcessFlowConnectionLabelRenderer = Renderer.extend(ButtonRenderer);
	ProcessFlowConnectionLabelRenderer.apiVersion = 2;


	return ProcessFlowConnectionLabelRenderer;

}, /* bExport= */ true);
