/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
// Provides control sap.suite.ui.commons.StatusIndicator.
sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";

	/**
	 * Constructor for a new DiscreteThreshold.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Discrete threshold specifies which values should be displayed by the status indicator.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.DiscreteThreshold
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var DiscreteThreshold = Control.extend("sap.suite.ui.commons.statusindicator.DiscreteThreshold",
		{
			metadata: {
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * Defines the value threshold. This value is displayed when the status indicator's
					 * percentage value is above or equal to this value but below the value of
					 * the next threshold.
					 */
					value: {type: "int", defaultValue: 0},

					/**
					 * ARIA label for this threshold to be used by screen reader software.
					 */
					ariaLabel: {type: "string", defaultValue: null}
				}
			},
			renderer: null // this control has no own renderer, it is rendered by the StatusIndicator
		});

	return DiscreteThreshold;

});
