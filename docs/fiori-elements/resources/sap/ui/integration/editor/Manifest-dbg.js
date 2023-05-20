/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/integration/util/Manifest",
	"./Merger"
], function (
	BaseManifest,
	Merger
) {
	"use strict";
	/*
	 *
	 * @extends sap.ui.integration.util.Manifest
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @since 1.94
	 * @private
	 * @param {Object} oManifestJson A manifest JSON.
	 * @alias sap.ui.integration.editor.Manifest
	 */
	var Manifest = BaseManifest.extend("sap.ui.integration.editor.Manifest");

	Manifest.prototype.mergeDeltaChanges = function (oManifestJson) {
		return Merger.mergeDelta(oManifestJson, this._aChanges, this._sSection);
	};

	return Manifest;
});
