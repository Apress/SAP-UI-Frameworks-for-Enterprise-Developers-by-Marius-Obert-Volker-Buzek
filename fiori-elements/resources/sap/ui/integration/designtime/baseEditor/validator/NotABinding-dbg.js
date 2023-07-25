/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
], function (
	isValidBindingString
) {
	"use strict";

	/**
	 * Validates if the provided value doesn't contain a binding.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.NotABinding
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
		errorMessage: "BASE_EDITOR.VALIDATOR.FORBIDDEN_BINDING",
		/**
		 * Validator function
		 *
		 * @param {string} sValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.NotABinding.validate
		 */
		validate: function (sValue) {
			return !isValidBindingString(sValue, false);
		}
	};
});
