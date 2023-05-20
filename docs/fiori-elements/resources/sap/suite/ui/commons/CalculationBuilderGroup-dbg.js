sap.ui.define([
	"./library",
	"sap/ui/core/Control"
], function(library, Control) {
	"use strict";

	/**
	 * Constructor for a new calculation builder variable group.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A variable group is used to organize the variables that the user can insert into the {@link sap.suite.ui.commons.CalculationBuilder} expression.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.60.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.CalculationBuilderGroup
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var CalculationBuilderGroup = Control.extend("sap.suite.ui.commons.CalculationBuilderGroup", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * A key associated with the group. This property is mandatory.<br>
				 * The key is displayed in the text editor area of the calculation builder.
				 */
				key: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Label for the group.<br>
				 * The label is displayed in the visual editor of the calculation builder
				 * and in the variables menu on the calculation builder's toolbar.
				 */
				title: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Additional description for the variable group.
				 */
				description: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Icon for the variable group. This icon is displayed in the Variables menu.
				 */
				icon: {
					type: "string", group: "Misc", defaultValue: null
				}
			},
			events: {
				/**
				 * This event is fired when the user selects the variable group.
				 */
				setSelection: {
					parameters: {
						key: "string"
					}
				}
			},
			aggregations: {
				/**
				 * Holds the variables included in the variable group.
				 */
				customView: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});

	CalculationBuilderGroup.prototype._getTitle = function () {
		return this.getTitle() || this.getKey();
	};

	return CalculationBuilderGroup;

});
