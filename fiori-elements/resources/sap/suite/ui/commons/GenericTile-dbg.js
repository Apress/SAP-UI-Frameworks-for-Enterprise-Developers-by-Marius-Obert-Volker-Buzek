/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.GenericTile.
sap.ui.define([ 'sap/m/GenericTile', 'sap/m/GenericTileRenderer' ],
	function(GenericTile, GenericTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new GenericTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The tile control that displays the title, description, and customizable main area.
	 * @extends sap.m.GenericTile
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34. Deprecated. Moved to openui5.
	 * @alias sap.suite.ui.commons.GenericTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteGenericTile = GenericTile.extend("sap.suite.ui.commons.GenericTile", /** @lends sap.suite.ui.commons.GenericTile.prototype */ {
		metadata : {
			deprecated: true,
			library : "sap.suite.ui.commons"
		},
		renderer: GenericTileRenderer
	});

	return SuiteGenericTile;
});