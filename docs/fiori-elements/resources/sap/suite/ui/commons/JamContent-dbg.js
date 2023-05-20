/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/m/FeedContent', 'sap/m/FeedContentRenderer' ], function(FeedContent, FeedContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new JamContent.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays the jam content text, subheader, and numeric value in a tile.
	 * @extends sap.m.FeedContent
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.m.FeedContent.
	 * @alias sap.suite.ui.commons.JamContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var JamContent = FeedContent.extend("sap.suite.ui.commons.JamContent", /** @lends sap.suite.ui.commons.JamContent.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: FeedContentRenderer
	});

	return JamContent;
});
