/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([], function () {
	"use strict";

	var oCompBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
	var Util = {
		texts: {
			go: oCompBundle.getText("FILTER_BAR_GO"),
			adaptFilters: oCompBundle.getText("FILTER_BAR_ADAPT_FILTERS_DIALOG")
		},
		icons: {
			decline: "sap-icon://decline",
			valueHelp: "sap-icon://value-help"
		}
	};

	return Util;
});
