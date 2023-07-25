/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.TileContent.
sap.ui.define([ 'sap/m/TileContent', 'sap/m/TileContentRenderer' ],
	function(MobileTileContent, TileContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new TileContent.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class This control serves a universal container for different types of content and footer.
	 * @extends sap.m.TileContent
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.m.TileContent.
	 * @alias sap.suite.ui.commons.TileContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TileContent = MobileTileContent.extend("sap.suite.ui.commons.TileContent", /** @lends sap.suite.ui.commons.TileContent.prototype */ {
		metadata : {
			deprecated: true,
			library : "sap.suite.ui.commons"
		},
		renderer: TileContentRenderer
	});

	return TileContent;
});