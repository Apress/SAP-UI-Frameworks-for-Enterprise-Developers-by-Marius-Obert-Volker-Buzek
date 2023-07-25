/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding",
	"sap/base/util/restricted/_isNil"
], function (
	IsValidBinding,
	_isNil
) {
	"use strict";

	/**
	 * Validates if the provided value is a boolean or binding string.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsBoolean
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
		errorMessage: "BASE_EDITOR.VALIDATOR.NOT_A_BOOLEAN",
		/**
		 * Validator function
		 *
		 * @param {boolean|string} vValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsBoolean.validate
		 */
		validate: function (vValue) {
			return _isNil(vValue)
				|| typeof vValue === "boolean"
				|| IsValidBinding.validate(vValue, { allowPlainStrings: false });
		}
	};
});
