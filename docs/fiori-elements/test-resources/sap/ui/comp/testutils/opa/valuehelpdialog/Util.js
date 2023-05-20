/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Core"], function (oCore) {
	"use strict";

	var oCompBundle = oCore.getLibraryResourceBundle("sap.ui.comp"),
		oMBundle = oCore.getLibraryResourceBundle("sap.m"),
		Util = {
			texts: {
				ok: oCompBundle.getText("VALUEHELPDLG_OK"),
				cancel: oCompBundle.getText("VALUEHELPDLG_CANCEL"),
				addRowButton: oCompBundle.getText("VALUEHELPDLG_CONDITIONPANEL_ADD"),
				placeholderFromField: oMBundle.getText("CONDITIONPANEL_LABELFROM"),
				placeholderToField: oMBundle.getText("CONDITIONPANEL_LABELTO"),
				placeholderValueField: oMBundle.getText("CONDITIONPANEL_LABELVALUE")
			}
		};

	return Util;
});
