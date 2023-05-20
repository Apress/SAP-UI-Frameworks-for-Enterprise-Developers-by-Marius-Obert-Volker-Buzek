/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/Device",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
], function (
	UriParameters,
	Device,
	AppLifeCycleUtils
) {
	"use strict";

	var CheckConditions = {

		// determine manifest out of found component
		_getAppDescriptor: function (oComponent) {
			if (oComponent && oComponent.getMetadata) {
				var oComponentMetaData = oComponent.getMetadata();
				if (oComponentMetaData && oComponentMetaData.getManifest) {
					return oComponentMetaData.getManifest();
				}
			}
			return {};
		},

		/**
		 * Checks if RTA needs to be restarted, e.g after 'Reset to default'.
		 * The sap.ui.fl library also reacts on the session storage entry and may start RTA
		 * as well as remove the entry before this function is called.
		 * @param {string} sLayer - Object with information about the current application
		 * @returns {boolean} Returns <code>true</code> if RTA restart is required.
		 * @private
		 */
		checkRestartRTA: function (sLayer) {
			var oUriParams = UriParameters.fromQuery(window.location.search);
			var sUriLayer = oUriParams.get("sap-ui-layer");
			// if a layer is given in the URI it has priority over the config
			sLayer = sUriLayer || sLayer;

			return !!window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
		},

		/**
		 * Check if we are in a SAPUI5 application.
		 * @returns {Promise<boolean>} Resolves to <code>true</code> if we are in a SAPUI5 application.
		 * @private
		 */
		checkUI5App: function () {
			return AppLifeCycleUtils.getCurrentRunningApplication()
				.then(function (oCurrentApplication) {
					if (oCurrentApplication) {
						var bIsUI5App = oCurrentApplication.applicationType === "UI5";
						var bIsApplication = oCurrentApplication.componentInstance && oCurrentApplication.componentInstance.getManifestEntry
							&& oCurrentApplication.componentInstance.getManifestEntry("sap.app").type === "application";
						return bIsUI5App && bIsApplication;
					}
					return false;
				});
		},

		/**
		 * Check if we are runninng on a desktop device.
		 * @returns {boolean} Returns <code>true</code> if we are on a desktop device
		 * @private
		 */
		checkDesktopDevice: function () {
			return Device.system.desktop;
		}
	};

	return CheckConditions;
}, true);
