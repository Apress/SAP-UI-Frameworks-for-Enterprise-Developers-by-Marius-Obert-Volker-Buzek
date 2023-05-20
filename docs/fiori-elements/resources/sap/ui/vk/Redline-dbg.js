/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.Redline.
sap.ui.define([], function() {
	"use strict";

	var Redline = {
		ElementType: {
			Line: "line",
			Rectangle: "rectangle",
			Ellipse: "ellipse",
			Freehand: "freehand",
			Text: "text",
			Comment: "comment"
		},
		svgNamespace: "http://www.w3.org/2000/svg"
	};

	return Redline;

}, /* bExport= */ true);
