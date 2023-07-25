/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"
], function (
	IsValidBinding
) {
	"use strict";

	/**
	 * Validates if the provided value is an integer or binding string.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsInteger
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @static
	 * @since 1.81
	 * @public
	 * @experimental 1.81
	 */
	return {
		async: false,
		errorMessage: "BASE_EDITOR.VALIDATOR.NOT_AN_INTEGER",
		/**
		 * Validator function
		 *
		 * @param {number|string} vValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsInteger.validate
		 */
		validate: function (vValue) {
			return vValue === undefined
				|| IsValidBinding.validate(vValue, { allowPlainStrings: false })
				|| (!isNaN(vValue) && Number.isInteger(vValue));
		}
	};
});
