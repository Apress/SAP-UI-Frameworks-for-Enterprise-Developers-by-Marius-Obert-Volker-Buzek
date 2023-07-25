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
	 * Validates if none of the provided values is an invalid binding.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsStringList
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
		errorMessage: IsValidBinding.errorMessage,
		/**
		 * Validator function
		 *
		 * @param {string[]} aValue - Strings to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsStringList.validate
		 */
		validate: function (aValue) {
			return aValue === undefined
				|| aValue.every(function (sItem) {
					return IsValidBinding.validate(sItem);
				});
		}
	};
});
