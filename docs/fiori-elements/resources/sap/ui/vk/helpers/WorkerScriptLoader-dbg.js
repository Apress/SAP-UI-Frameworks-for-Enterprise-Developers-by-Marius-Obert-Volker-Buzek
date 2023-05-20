/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/thirdparty/URI"
], function(
	URI
) {
	"use strict";

	var WorkerScriptLoader = {};

	/**
	 * Convert URL string into absolute URI
	 * @param {string} scriptUrl Script URL to be converted to absolute URI
	 * @returns {sap.ui.thirdparty.URI} URI to the scriptUrl
	 */
	WorkerScriptLoader.absoluteUri = function(scriptUrl) {
		var uri = new URI(sap.ui.require.toUrl(scriptUrl));
		if (uri.is("relative")) {
			uri = uri.absoluteTo(new URI(document.baseURI));
		}
		return uri;
	};

	/**
	 * Create Web Worker from the script provided as input parameter
	 * @param {string} workerScriptUrl URL to Web Worker script
	 * @param {string[]} [additionalScripts] Array of additional script URL's to be loaded together with the main script.
	 * @returns {any} Web Worker instance
	 * @private
	 */
	WorkerScriptLoader.loadScript = function(workerScriptUrl, additionalScripts) {
		// The script URL cannot be used directly with WebWorker as this causes CORS error with FLP
		// As a workaround we can pass script URL to WebWorker as a Blob

		var uri = this.absoluteUri(workerScriptUrl);

		var scriptList = [];
		if (additionalScripts && additionalScripts.length > 0) {
			additionalScripts.forEach(function(script) {
				scriptList.push("'" + this.absoluteUri(script) + "'");
			}, this);
		}

		// Main script must be the last to load
		scriptList.push("'" + uri.toString() + "'");

		return new Worker((window.URL || window.webkitURL).createObjectURL(
			new Blob(["importScripts(" + scriptList.join() + ");"], { "type": "application/javascript" })));
	};

	return WorkerScriptLoader;
});
