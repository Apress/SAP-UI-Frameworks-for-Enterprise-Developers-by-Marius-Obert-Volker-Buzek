/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(['sap/ui/core/Renderer','sap/ui/Device'],
	function (Renderer, Device) {
		"use strict";

		return {
			_appendHeightAndWidth: function (oNetworkGraphMap, oRm) {
				oRm.style("height", oNetworkGraphMap.getHeight());
				oRm.style("width", oNetworkGraphMap.getWidth());
			},
			apiVersion:2,
			render: function (oRM, oNetworkGraphMap) {
				oRM.openStart("div", oNetworkGraphMap);
				oRM.class("sapSuiteUiCommonsNetworkGraphMap");
				this._appendHeightAndWidth(oNetworkGraphMap, oRM);
				oRM.openEnd();

				oRM.openStart("div");
				oRM.class("sapSuiteUiCommonsNetworkGraphMapTitle");
				oRM.openEnd();
				oRM.openStart("span");
				oRM.class("sapSuiteUiCommonsNetworkGraphMapTitleText");
				oRM.openEnd();
				oRM.text(oNetworkGraphMap.getTitle());
				oRM.close("span");

				oRM.close("div");

				oRM.openStart("div");
				oRM.class("sapSuiteUiCommonsNetworkGraphMapContent");
				if (Device.browser.msie) {
					if (oNetworkGraphMap.getHeight()) {
						// IE is not recognizing the right: 0 offset applied to the absolutely-positioned flex container.
						// By row-reverse issue is fixed.
						oRM.style("flex-direction", "row-reverse");
						// if user specifies height, fill content to its height (it would overflow otherwise)
						oRM.style("height", "100%");
					} else {
						oRM.style("flex-direction", "row-reverse");
					}
				} else {
					if (oNetworkGraphMap.getHeight()) {
						// if user specifies height, fill content to its height (it would overflow otherwise)
						oRM.style("height", "100%");
					}
				}
				oRM.openEnd();
				oRM.close("div");

				oRM.close("div");
			}
		};
	}, true);
