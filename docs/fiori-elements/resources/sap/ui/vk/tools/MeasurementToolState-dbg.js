/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([], function() {
	"use strict";

	// Possible transitions:
	// Off <-> SearchingFirstFeature <-> SearchingSecondFeature <-> SearchingThirdFeature <-> DefiningAngle -> Off
	var State = {
		Off: "Off",
		SearchingFirstFeature: "SearchingFirstFeature",
		SearchingSecondFeature: "SearchingSecondFeature",
		SearchingThirdFeature: "SearchingThirdFeature",
		DefiningAngle: "DefiningAngle"
	};

	return State;

}, /* bExport= */ true);
