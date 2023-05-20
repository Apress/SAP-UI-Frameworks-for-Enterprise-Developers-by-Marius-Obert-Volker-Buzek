/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([], function () {
	"use strict";

	var oCompBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
	var oMBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	var oMdcBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	var Util = {

		texts: {
			resetwarning: oMBundle.getText("MSGBOX_TITLE_WARNING"),
			moreLinks: oCompBundle.getText("POPOVER_DEFINE_LINKS"),
            p13nPopoverTitle: oCompBundle.getText("POPOVER_SELECTION_TITLE"),
            ok: oCompBundle.getText("FORM_PERS_DIALOG_OK"),
            reset: oMdcBundle.getText("p13nDialog.RESET")
		},

		icons: {
			decline: "sap-icon://decline",
			group: "sap-icon://group-2",
			expandGroup: "sap-icon://slim-arrow-right"
		}

	};

	return Util;
});
