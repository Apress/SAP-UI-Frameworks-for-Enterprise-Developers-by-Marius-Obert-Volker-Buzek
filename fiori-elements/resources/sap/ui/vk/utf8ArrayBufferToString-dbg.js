/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides function sap.ui.vk.utf8ArrayBufferToString.
sap.ui.define([], function() {
	"use strict";

	var utf8ArrayBufferToString = function(arrayBuffer) {
		return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))));
	};

	return utf8ArrayBufferToString;

}, /* bExport= */ true);
