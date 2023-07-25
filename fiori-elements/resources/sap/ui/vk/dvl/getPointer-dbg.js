/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.dvl.getPointer.
sap.ui.define([
	"sap/base/Log",
	"../DvlException"
], function(
	Log,
	DvlException
) {
	"use strict";

	var getPointer = function(pointer) {
		if (typeof pointer === "number") {
			var result = pointer;
			var message = sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(result) : "";
			Log.error(message, JSON.stringify({ errorCode: result }), "sap.ve.dvl");
			throw new DvlException(result, message);
		}
		return pointer;
	};

	return getPointer;

}, /* bExport= */ true);
