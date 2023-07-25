/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(function() {
	"use strict";

	return {
		getAppInfo: function getAppInfo() {
			var oAppLifeCycleService = sap.ushell.Container.getService("AppLifeCycle"),
				oCurrentApplication = oAppLifeCycleService.getCurrentApplication(),
				oComponent, oMetadata, oManifest, oAppInfo = {};

			if (oCurrentApplication) {
				oComponent = oCurrentApplication.componentInstance;
				oAppInfo.homePage = oCurrentApplication.homePage;
			}

			if (oComponent) {
				oMetadata = oComponent.getMetadata();
			}

			if (oMetadata) {
				oManifest = oMetadata.getManifest();
			}

			if (oManifest) {
				oAppInfo.id = oManifest["sap.app"].id;
			}

			return oAppInfo;
		}
	};
});
