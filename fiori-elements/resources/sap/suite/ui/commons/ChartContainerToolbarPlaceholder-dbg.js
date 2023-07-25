/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/core/Control', './ChartContainerToolbarPlaceholderRenderer' ], function(Control, ChartContainerToolbarPlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new ChartContainerToolbarPlaceholder.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Provides a placeholder for the embedded chart container toolbar.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.ChartContainerToolbarPlaceholder
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ChartContainerToolbarPlaceholder = Control.extend("sap.suite.ui.commons.ChartContainerToolbarPlaceholder", /** @lends sap.suite.ui.commons.ChartContainerToolbarPlaceholder.prototype */ {
		metadata: {
			library: "sap.suite.ui.commons"
		}
	});

	return ChartContainerToolbarPlaceholder;
});
