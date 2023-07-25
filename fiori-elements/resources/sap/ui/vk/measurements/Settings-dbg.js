/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function(
) {
	"use strict";

	var localStorageKey = "sap.ui.vk.measurements.Settings";
	var defaultSettings = {
		color: 0,
		precision: 1,
		units: "mm",
		featureVertex: true,
		featureEdge: true,
		featureFace: true
	};

	var Settings = {};

	Settings.load = function() {
		var settings = self.localStorage.getItem(localStorageKey);
		if (settings == null) {
			settings = {};
		} else {
			try {
				settings = JSON.parse(settings);
			} catch (e) {
				settings = {};
			}
		}

		// The inner Object.assign copies the default settings, the outer Object.assign overrides
		// them with the stored settings if any.
		return Object.assign(Object.assign({}, defaultSettings), settings);
	};

	Settings.save = function(settings) {
		var scale;
		if ("scale" in settings) {
			scale = settings.scale;
			delete settings.scale;
		}
		self.localStorage.setItem(localStorageKey, JSON.stringify(settings));
		if (scale != null) {
			settings.scale = scale;
		}
		return this;
	};

	return Settings;
});
