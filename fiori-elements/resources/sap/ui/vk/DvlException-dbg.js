/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides an exception class for DVL errors.
sap.ui.define(["sap/ui/base/Exception"], function(Exception) {
	"use strict";

	/**
	 * This exception is thrown, when an error occurs in DVL API.
	 *
	 * @class
	 *
	 * @param {sap.ve.dvl.DVLRESULT} code The error code.
	 * @param {string} message The error message.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.Exception
	 * @alias sap.ui.vk.DvlException
	 */
	var DvlException = function(code, message) {
		this.name = "DvlException";
		this.code = code;
		this.message = message;
	};
	DvlException.prototype = Object.create(Exception.prototype);

	return DvlException;
});
