/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.dvl.getJSONObject.
sap.ui.define([
	"sap/base/Log",
	"../DvlException"
], function(
	Log,
	DvlException
) {
	"use strict";

	var getJSONObject = function(object) {
		if (typeof object === "number") {
			var result = object;
			var message = sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(result) : "";
			Log.error(message, JSON.stringify({ errorCode: result }), "sap.ve.dvl");
			throw new DvlException(result, message);
		}
		return object;
	};
	return getJSONObject;

}, /* bExport= */ true);
