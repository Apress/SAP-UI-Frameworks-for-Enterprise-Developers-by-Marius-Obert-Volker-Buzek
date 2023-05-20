/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.Threshold.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/suite/ui/commons/statusindicator/util/ThemingUtil"
], function (Control, ThemingUtil) {
	"use strict";

	/**
	 * Constructor for a new PropertyThreshold.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is provided
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Property threshold defines how the shapes included in the status indicator should be filled
	 * when the status indicator's percentage value is below the given threshold.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.PropertyThreshold
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var PropertyThreshold = Control.extend("sap.suite.ui.commons.statusindicator.PropertyThreshold",
		{
			metadata: {
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * Defines the color used to fill the shapes included in the status indicator.
					 */
					fillColor: {type: "sap.m.ValueCSSColor", defaultValue: "Neutral"},

					/**
					 * Defines the maximum value up to which the threshold setting should apply.
					 */
					toValue: {type: "int", defaultValue: 0},

					/**
					 * ARIA label for this threshold to be used by screen reader software.
					 */
					ariaLabel: {type: "string", defaultValue: null}
				}
			},
			renderer: null // this control has no own renderer, it is rendered by the StatusIndicator
		});

	PropertyThreshold.prototype._getCssFillColor = function () {
		if (!this._cssFillColor) {
			this._cssFillColor = ThemingUtil.resolveColor(this.getFillColor());
		}

		return this._cssFillColor;
	};

	return PropertyThreshold;

});
