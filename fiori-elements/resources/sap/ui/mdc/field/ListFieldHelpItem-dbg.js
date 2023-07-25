/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.core.ListItem.
sap.ui.define([
	'sap/ui/core/ListItem'
], function(
		ListItem) {
	"use strict";

	/**
	 * Constructor for a new ListFieldHelpItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An item that is used in the {@link sap.ui.mdc.valuehelp.content.FixedList FixedList}.
	 *
	 * @extends sap.ui.core.ListItem
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.86.0
	 * @alias sap.ui.mdc.field.ListFieldHelpItem
	 */
	var ListFieldHelpItem = ListItem.extend("sap.ui.mdc.field.ListFieldHelpItem", /** @lends sap.ui.mdc.field.ListFieldHelpItem.prototype */ { metadata : {

		library: "sap.ui.mdc",
		properties: {

			/**
			 * Key of the group for what the items are grouped
			 */
			groupKey: {
				type: "any",
				group: "Appearance",
				defaultValue : null
			},

			/**
			 * Text of the group for what the items are grouped
			 */
			groupText: {
				type: "string",
				group: "Appearance",
				defaultValue : null
			}
		}
	}});


	return ListFieldHelpItem;

});
