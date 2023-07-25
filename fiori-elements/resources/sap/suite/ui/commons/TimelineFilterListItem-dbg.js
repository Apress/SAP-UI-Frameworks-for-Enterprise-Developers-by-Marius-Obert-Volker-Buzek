/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.TimelineFilterListItem.
sap.ui.define(['./library','sap/ui/core/Control'],
	function(library, Control) {
	"use strict";

	/**
	 * Constructor for a new TimelineFilterListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Provides a filter criteria list for the items filter in the Timeline control.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.TimelineFilterListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TimelineFilterListItem = Control.extend("sap.suite.ui.commons.TimelineFilterListItem", /** @lends sap.suite.ui.commons.TimelineFilterListItem.prototype */
	{
		metadata : {
			library : "sap.suite.ui.commons",
			properties : {
				/**
				 * A key for a filter criterion. Each filter criterion must have a unique key.
				 */
				key : {type : "string", group : "Data", defaultValue : null},

				/**
				 * A textual label for the filter criterion. This text is displayed in the filter criteria list in the UI.
				 */
				text : {type : "string", group : "Misc", defaultValue : null}
			}
		},
		renderer: null // this control has no own renderer, it is rendered by the Timeline
	});

	return TimelineFilterListItem;
});
