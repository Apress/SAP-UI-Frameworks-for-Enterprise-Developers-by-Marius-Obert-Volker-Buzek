/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/base/util/restricted/_uniq"
], function (
	_uniq
) {
	"use strict";

	/**
	 * Validates if the provided list contains no duplicates.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsUniqueList
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
		errorMessage: "BASE_EDITOR.VALIDATOR.DUPLICATE_ENTRY",
		/**
		 * Validator function
		 *
		 * @param {string} aValue - List to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsUniqueList.validate
		 */
		validate: function (aValue) {
			return aValue === undefined
				|| aValue.length === _uniq(aValue).length;
		}
	};
});
