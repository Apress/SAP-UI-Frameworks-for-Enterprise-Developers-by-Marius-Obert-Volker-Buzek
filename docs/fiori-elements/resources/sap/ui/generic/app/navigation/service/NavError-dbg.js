/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/fe/navigation/NavError"], function(FENavError) {

	"use strict";

	/**
	 * @class
	 * An object that provides error handling information during runtime.
	 * @extends sap.fe.navigation.NavError
	 * @constructor
	 * @public
	 * @deprecated Since version 1.83.0. Please use {@link sap.fe.navigation.NavError} instead.
	 * @alias sap.ui.generic.app.navigation.service.NavError
	 * @param {string} sErrorCode The code for an internal error of a consumer that allows you to track the source locations
	 */
	var NavError = FENavError.extend("sap.ui.generic.app.navigation.service.NavError", /** @lends sap.ui.generic.app.navigation.service.NavError */
	{

		metadata: {
			publicMethods: [
				// getter methods of properties
				"getErrorCode"
			],
			properties: {},
			library: "sap.ui.generic.app"
		},

		constructor: function(sErrorCode) {
			FENavError.apply(this);
			this._sErrorCode = sErrorCode;
		}

	});

	/**
	 * Returns the error code with which the instance has been created.
	 * @public
	 * @deprecated Since version 1.83.0
	 * @returns {string} The error code of the error
	 *
	 */
	NavError.prototype.getErrorCode = function() {
		return this._sErrorCode;
	};

	// final step for library
	return NavError;
});