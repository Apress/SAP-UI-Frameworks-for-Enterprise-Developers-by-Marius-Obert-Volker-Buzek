/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"
], function (
	IsPatternMatch
) {
	"use strict";

	return {
		async: false,
		errorMessage: "BASE_EDITOR.VALIDATOR.FAILED_PATTERN_TEST",
		validate: function (aValues, oConfig) {
			return (aValues || []).every(function (sValue) {
				return IsPatternMatch.validate(sValue, oConfig);
			});
		}
	};
});
