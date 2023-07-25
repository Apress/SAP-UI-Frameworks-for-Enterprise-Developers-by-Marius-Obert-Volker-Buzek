/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchHelper","sap/m/Label"],function(e,r){var n=r.extend("sap.esh.search.ui.controls.SearchLabel",{renderer:{apiVersion:2},onAfterRendering:function r(){var n=this.getDomRef();e.boldTagUnescaper(n);e.forwardEllipsis4Whyfound(n)}});return n})})();