sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject"
], function (jQuery, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new validation result.
	 *
	 * @class
	 * This can be used for creating your own validation algorithm for custom functions.<br>
	 * Custom functions can be defined using {@link sap.suite.ui.commons.CalculationBuilderFunction}.
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.CalculationBuilderValidationResult
	 */

	var CalculationBuilderValidationResult = ManagedObject.extend("sap.suite.ui.commons.CalculationBuilderValidationResult", {
		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this._aErrors = [];
		}
	});

	CalculationBuilderValidationResult.prototype.addError = function (oError) {
		this._aErrors.push(oError);
	};

	CalculationBuilderValidationResult.prototype.addErrors = function (aErrors) {
		jQuery.merge(this._aErrors, aErrors);
	};

	CalculationBuilderValidationResult.prototype.getErrors = function () {
		return this._aErrors;
	};

	return CalculationBuilderValidationResult;
});