/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
/**
 * Initialization Code and shared classes of library sap.esh.search.ui.
 */
sap.ui.define(["sap/ui/core/library", "sap/m/library", "sap/f/library", "sap/ui/layout/library", "sap/ui/export/library", "sap/ui/vbm/library", "sap/ui/vk/library", "sap/suite/ui/microchart/library"], function () {
  "use strict";

  /**
   * UI5 library: sap.esh.search.ui.
   *
   * @namespace
   * @name sap.esh.search.ui
   * @public
   */

  // delegate further initialization of this library to the Core
  return sap.ui.getCore().initLibrary({
    name: "sap.esh.search.ui",
    dependencies: ["sap.ui.core", "sap.m", "sap.f", "sap.ui.layout", "sap.ui.export", "sap.ui.vbm", "sap.ui.vk", "sap.suite.ui.microchart"],
    types: [
      //"sap.esh.search.ui.ExampleType"
    ],
    interfaces: [],
    controls: [
      //"sap.esh.search.ui.Example"
    ],
    elements: [],
    noLibraryCSS: false,
    version: "1.113.0"
  });
});
})();