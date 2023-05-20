/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/comp/smartfield/type/TextArrangement",
	"sap/ui/comp/smartfield/type/String",
	"sap/ui/model/ValidateException"
], function(
	TextArrangementType,
	StringType,
	ValidateException
) {
	"use strict";

	var TextArrangementString = TextArrangementType.extend("sap.ui.comp.smartfield.type.TextArrangementString");

	TextArrangementString.prototype.getName = function() {
		return "sap.ui.comp.smartfield.type.TextArrangementString";
	};

	TextArrangementString.prototype.validateValue = function(vValues) {
		var oConstraints = this.oConstraints || {},
			iMaxLength = oConstraints.maxLength,
			sValue = vValues[0];

		if (this.oFormatOptions.textArrangement === "descriptionOnly" && (sValue && sValue.length > iMaxLength)) {
			throw new ValidateException(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("ENTER_A_VALID_VALUE"));
		} else {
			return TextArrangementType.prototype.validateValue.apply(this, arguments);
		}
	};

	TextArrangementString.prototype.getPrimaryType = function() {
		return StringType;
	};

	return TextArrangementString;
});
