/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.ZoomTo.
sap.ui.define([], function() {
	"use strict";

	/**
	 * ZoomTo options.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.ZoomTo
	 * @public
	 */
	var ZoomTo = {
		All: "all",
		Visible: "visible",
		Selected: "selected",
		Node: "node",
		NodeSetIsolation: "node_setisolation",
		Restore: "restore",
		RestoreRemoveIsolation: "restore_removeisolation",
		ViewLeft: "view_left",
		ViewRight: "view_right",
		ViewTop: "view_top",
		ViewBottom: "view_bottom",
		ViewBack: "view_back",
		ViewFront: "view_front"
	};

	return ZoomTo;

}, /* bExport= */ true);
