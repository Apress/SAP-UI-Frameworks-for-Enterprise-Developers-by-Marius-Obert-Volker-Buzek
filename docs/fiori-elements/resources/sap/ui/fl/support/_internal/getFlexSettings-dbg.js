/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings"
], function(
	Settings
) {
	"use strict";

	/**
	 * Provides an object with the flex Settings.
	 *
	 * @namespace sap.ui.fl.support._internal.getFlexSettings
	 * @since 1.99
	 * @version 1.113.0
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	return function () {
		return Settings.getInstance().then(function (oSettings) {
			return Object.keys(oSettings._oSettings).map(function(sKey) {
				var value = oSettings._oSettings[sKey];

				switch (sKey) {
					case "versioning":
						value = value.CUSTOMER || value.ALL;
						break;
					default:
						break;
				}

				return {
					key: sKey,
					value: value
				};
			});
		});
	};
});
