sap.ui.define([
	"./library",
	"sap/ui/core/Control"
], function(library, Control) {
	"use strict";

	/**
	 * Constructor for a new variable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A variable used in the expression entered into the calculation builder.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.CalculationBuilderVariable
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilderVariable = Control.extend("sap.suite.ui.commons.CalculationBuilderVariable", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * A key associated with the variable. This property is mandatory.<br>
				 * The key is displayed in the text editor area of the calculation builder.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Label for the variable.<br>
				 * The label is displayed in the visual editor of the calculation builder
				 * and in the variables menu on the calculation builder's toolbar.
				 */
				label: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * The group where this variable belongs.<br>
				 * To define variable groups, use {@link sap.suite.ui.commons.CalculationBuilderGroup}.
				 */
				group: {
					type: "string", group: "Misc"
				}
			},
			aggregations: {
				/**
				 * Holds the items included in the variable.
				 */
				items: {
					type: "sap.suite.ui.commons.CalculationBuilderItem",
					multiple: true,
					singularName: "Item"
				}
			}
		},
		renderer: null // this control has no own renderer, it is rendered by the CalculationBuilder
	});

	CalculationBuilderVariable.prototype._getLabel = function () {
		return this.getLabel() || this.getKey();
	};

	return CalculationBuilderVariable;

});
