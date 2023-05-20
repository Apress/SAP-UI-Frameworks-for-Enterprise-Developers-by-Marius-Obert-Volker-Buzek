/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.statusindicator.FillingOption.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/base/Log"
], function (Control, Log) {
	"use strict";

	/**
	 * Constructor for a new FillingOption.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Filling options for an SVG shape included in a custom shape.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.50
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.statusindicator.FillingOption
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time metamodel.
	 */
	var FillingOption = Control.extend("sap.suite.ui.commons.statusindicator.FillingOption",
		/** @lends sap.suite.ui.commons.statusindicator.Control.prototype */
		{
			metadata: {
				library: "sap.suite.ui.commons",
				properties: {

					/**
					 * ID of the fillable SVG shape included in a custom shape.
					 */
					shapeId: {type: "string", defaultValue: null},

					/**
					 * Weight of the fillable shape, relative to other fillable shapes included in this
					 * custom shape. This property allows you to distribute the status indicator's value
					 * between distinct SVG shapes included in the custom shape. For example, for four SVG
					 * shapes with weights 1, 2, 3, and 4 (total weight 10), the status indicator's value
					 * is distributed in the following way:
					 * <ul>
					 *   <li>If the status indicator's value is below 10% (1 out of 10), the first SVG shape
					 * (weight 1) is partially filled, depending on the percentage value. For example,
					 * if the percentage value of the status indicator is 5, the first SVG shape appears
					 * half-full. The rest of the SVG shapes appear empty.</li>
					 *   <li>If the status indicator's value is at least 10% but below 30%, the first SVG
					 * shape (weight 1) is filled, and the second shape (weight 2) is filled only partially,
					 * depending on the percentage value. The rest of the SVG shapes in this custom shape
					 * appear empty.</li>
					 *   <li>If the status indicator's value is at least 30% but below 60%, the first two
					 * SVG shapes (weight 1 and 2) are filled, and the third SVG shape (weight 3) is filled
					 * only partially. The fourth SVG shape (weight 4) appears empty.</li>
					 *   <li>If the status indicator's value is at least 60% but below 100%, the first three
					 * SVG shapes (weight 1, 2, and 3) are filled, but the fourth SVG shape is filled only
					 * partially, depending on the percentage value.</li>
					 *   <li>If the status indicator's value is 100, all four SVG shapes appear filled.</li>
					 * </ul>
					 */
					weight: {type: "int", defaultValue: 1},

					/**
					 * Order in which this fillable SVG shape must be filled, relative to other SVG shapes
					 * included in the custom shape. For example, if you have three SVG shapes with order
					 * values 1, 2, and 4 assigned, the first shape will be filled first, then the second
					 * shape, and, finally, the third shape, regardless of their order in the SVG definition.
					 * The value of this property must be unique.
					 */
					order: {type: "int"}
				}
			}
		});

	FillingOption.prototype.setWeight = function (iWeight) {
		if (iWeight <= 0) {
			Log.fatal("An invalid weight is passed. Weight should be a positive integer. Given: " + iWeight);
		}

		this.setProperty("weight", iWeight);
	};

	return FillingOption;
});
