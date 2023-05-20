sap.ui.define([
	"./library",
	"sap/ui/core/Control"
], function(library, Control) {
	"use strict";

	/**
	 * Constructor for a new custom function.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A custom function to be used in the calculation builder.<br>
	 * The default functions available for the calculation builder are defined in
	 * {@link sap.suite.ui.commons.CalculationBuilderFunctionType}.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.56.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.CalculationBuilderFunction
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilderFunction = Control.extend("sap.suite.ui.commons.CalculationBuilderFunction", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * A key associated with the function. This property is mandatory.<br>
				 * The key is displayed in the text editor area of the calculation builder.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Label for the function.<br>
				 * The label is displayed in the visual editor of the calculation builder
				 * and in the functions menu on the calculation builder's toolbar.
				 */
				label: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Description of the function.<br>
				 * The description is displayed in the functions menu on the calculation builder's toolbar.
				 * If no description is specified, it is generated automatically based on the <code>key</code>
				 * property and the parameters defined in the <code>items</code> aggregation.
				 */
				description: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Defines whether default validation should be used.<br>
				 * Set this property to <code>false</code> to provide your own validation algorithm using
				 * {@link sap.suite.ui.commons.CalculationBuilderValidationResult}.<br>
				 * If you do not provide your own validation algorithm for this custom function, set this
				 * property to <code>true</code>, and the function will be validated by the calculation builder.
				 */
				useDefaultValidation: {
					type: "boolean", group: "Misc", defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Holds the parameters that can be passed to the function.<br>
				 * For example, if the function has two parameters, the <code>items</code> aggregation may consist of:
				 * <ol>
				 * <li>A {@link sap.suite.ui.commons.CalculationBuilderItem} with an empty key for the first argument
				 * entered by the user.</li>
				 * <li>A {@link sap.suite.ui.commons.CalculationBuilderItem} with a "<code>,</code>" (comma) key for the comma
				 * that separates the arguments.</li>
				 * <li>A {@link sap.suite.ui.commons.CalculationBuilderItem} with an empty key for the second argument
				 * entered by the user.</li>
				 * </ol>
				 */
				items: {
					type: "sap.suite.ui.commons.CalculationBuilderItem",
					multiple: true,
					singularName: "item"
				}
			}
		},
		renderer: null // this control has no own renderer, it is rendered by the CalculationBuilder
	});

	CalculationBuilderFunction.prototype._getLabel = function () {
		return this.getLabel() || this.getKey();
	};

	return CalculationBuilderFunction;
});
