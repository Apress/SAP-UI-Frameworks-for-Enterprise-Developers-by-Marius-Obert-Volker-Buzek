/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function (
	ObjectPath
) {
	"use strict";


	var AppLifeCycleUtils = {

		/**
		 * Gets the app life cycle service.
		 * @returns {Promise<object>} Resolves to the app life cycle service
		 * @private
		 */
		getAppLifeCycleService: function () {
			var oContainer = AppLifeCycleUtils.getContainer();
			return oContainer.getServiceAsync("AppLifeCycle")
				.catch(function (vError) {
					var sError = "Error getting AppLifeCycle service from ushell container: " + vError;
					throw new Error(sError);
				});
		},

		/**
		 * Gets the ushell container.
		 * @returns {sap.ushell.Container} ushell container
		 * @private
		 */
		getContainer: function () {
			var oContainer = ObjectPath.get("sap.ushell.Container");
			if (!oContainer) {
				throw new Error(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			}
			return oContainer;
		},

		/**
		 * Gets the current root application.
		 * @returns {Promise<object>} Resolves to the currently running application
		 * @private
		 */
		getCurrentRunningApplication: function () {
			return AppLifeCycleUtils.getAppLifeCycleService()
				.then(function (oAppLifeCycleService) {
					return oAppLifeCycleService.getCurrentApplication();
				});
		}
	};

	return AppLifeCycleUtils;
});
