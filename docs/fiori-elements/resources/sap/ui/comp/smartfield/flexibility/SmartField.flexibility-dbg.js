/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/fl/apply/api/DelegateMediatorAPI"
], function (
	DelegateMediator
) {
	"use strict";

	DelegateMediator.registerDefaultDelegate({
		modelType: "sap.ui.model.odata.v2.ODataModel",
		delegate: "sap/ui/comp/smartfield/flexibility/ODataV2Delegate",
		requiredLibraries: {
			"sap.ui.comp": {
				minVersion: "1.81",
				lazy: false
			}
		}
	});

	DelegateMediator.registerDefaultDelegate({
		modelType: "sap.ui.model.odata.ODataModel",
		delegate: "sap/ui/comp/smartfield/flexibility/ODataV2Delegate",
		requiredLibraries: {
			"sap.ui.comp": {
				minVersion: "1.81",
				lazy: false
			}
		}
	});

	return {};
}, /* bExport= */true);
