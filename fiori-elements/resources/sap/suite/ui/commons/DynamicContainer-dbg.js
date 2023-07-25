/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.DynamicContainer.
sap.ui.define([ 'sap/m/SlideTile', 'sap/m/SlideTileRenderer' ],
	function(SlideTile, SlideTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new DynamicContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control that displays multiple GenericTile controls as changing slides.
	 * @extends sap.m.SlideTile
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34. Deprecated. Moved to openui5.
	 * @alias sap.suite.ui.commons.DynamicContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicContainer = SlideTile.extend("sap.suite.ui.commons.DynamicContainer", /** @lends sap.suite.ui.commons.DynamicContainer.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: SlideTileRenderer
	});

	return DynamicContainer;

});