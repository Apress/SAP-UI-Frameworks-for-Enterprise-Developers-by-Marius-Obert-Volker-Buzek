/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies"
], function(
	getFlexSettings,
	getChangeDependencies
) {
	"use strict";

	/**
	 * Provides an API for support tools
	 *
	 * @namespace sap.ui.fl.support.api.SupportAPI
	 * @since 1.98
	 * @version 1.113.0
	 * @private
	 * @ui5-restricted ui5 support tools
	 */
	var SupportAPI = /** @lends sap.ui.fl.support.api.SupportAPI */{
		getChangeDependencies: getChangeDependencies,
		getFlexSettings: getFlexSettings
	};

	return SupportAPI;
});
