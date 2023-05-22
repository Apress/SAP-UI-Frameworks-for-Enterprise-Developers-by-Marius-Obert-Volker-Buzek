
/* global QUnit */
/** @type {import("qunit")} */ (QUnit).config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/apress/openui5/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});