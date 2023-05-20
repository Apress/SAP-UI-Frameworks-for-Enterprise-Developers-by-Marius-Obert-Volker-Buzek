/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/ux3/library', 'sap/ui/ux3/NavigationItem' ], function(Ux3Library, NavigationItem) {
	"use strict";

	/**
	 * Constructor for a new CountingNavigationItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control extends the sap.ui.ux3.NavigationItem control. This control can display the quantity of items on a corresponding content area. It also provides a rich tooltip that can appear and disappear after a certain delay.
	 * @extends sap.ui.ux3.NavigationItem
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.CountingNavigationItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	return NavigationItem.extend("sap.suite.ui.commons.CountingNavigationItem", /** @lends sap.suite.ui.commons.CountingNavigationItem.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Stores the number of content items associated with this navigation item. This number appears in brackets next to the navigation item name. For example, Employes (10000).
				 */
				quantity: { type: "string", group: "Misc", defaultValue: null }
			}
		}
	});
});
