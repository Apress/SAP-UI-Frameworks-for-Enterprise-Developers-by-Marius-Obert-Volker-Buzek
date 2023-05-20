/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides control sap.ui.vk.ToggleMenuItem.
sap.ui.define([
	"sap/m/MenuItem"
], function(
	MenuItem
) {
	"use strict";

	/**
	 * Constructor for a new <code>ToggleMenuItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables users to trigger actions. For the button UI, you can define some text or an icon, or both.
	 * @extends sap.m.MenuItem
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.m.ToggleMenuItem
	 */
	var ToggleMenuItem = MenuItem.extend("sap.ui.vk.ToggleMenuItem", /** @lends sap.ui.vk.ToggleMenuItem.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Boolean property to define the toggleable item (default is <code>true</code>).
				 */
				toggleable: { type: "boolean", group: "Behavior", defaultValue: true }
			}
		}
	});

	return ToggleMenuItem;
});
