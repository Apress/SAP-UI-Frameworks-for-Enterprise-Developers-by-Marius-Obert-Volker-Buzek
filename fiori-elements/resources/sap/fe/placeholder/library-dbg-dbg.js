/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */

sap.ui.define(
	[
		"sap/ui/core/Core", // implicit dependency, provides sap.ui.getCore(),
		"sap/ui/core/library" // library dependency
	],
	function () {
		"use strict";

		/**
		 * Fiori Elements Placeholder Library
		 *
		 * @namespace
		 * @name sap.fe.placeholder
		 * @private
		 * @experimental
		 */

		// library dependencies
		// delegate further initialization of this library to the Core
		return sap.ui.getCore().initLibrary({
			name: "sap.fe.placeholder",
			dependencies: ["sap.ui.core"],
			types: [],
			interfaces: [],
			controls: [],
			elements: [],
			// eslint-disable-next-line no-template-curly-in-string
			version: "1.113.0",
			noLibraryCSS: false,
			extensions: {}
		});
	}
);
