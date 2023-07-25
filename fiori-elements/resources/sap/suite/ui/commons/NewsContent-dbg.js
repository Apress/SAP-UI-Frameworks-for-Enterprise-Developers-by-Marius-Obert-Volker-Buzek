/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/m/NewsContent', 'sap/m/NewsContentRenderer' ], function(NewsContent, NewsContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new NewsContent.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays the news content text and subheader in a tile.
	 * @extends sap.m.NewsContent
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.m.NewsContent.
	 * @alias sap.suite.ui.commons.NewsContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteNewsContent = NewsContent.extend("sap.suite.ui.commons.NewsContent", /** @lends sap.suite.ui.commons.NewsContent.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: NewsContentRenderer
	});

	return SuiteNewsContent;
});
