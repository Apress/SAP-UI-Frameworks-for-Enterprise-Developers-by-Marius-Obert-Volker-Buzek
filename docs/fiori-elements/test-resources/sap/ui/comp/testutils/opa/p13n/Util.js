/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/Core"
], function(oCore) {
	"use strict";

	var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

	var Util = {

		texts: {
			filter: oMDCBundle.getText("p13nDialog.TAB_Filter"),
			ok: oMDCBundle.getText("p13nDialog.OK")
		},

		icons: {
			decline: "sap-icon://decline",
			settings: "sap-icon://action-settings"
		}

	};

	return Util;
});
