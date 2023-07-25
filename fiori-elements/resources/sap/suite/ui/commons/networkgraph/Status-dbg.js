/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/theming/Parameters",
	"sap/m/library"
], function (Element, Parameters, MobileLibrary) {
	"use strict";

	// shortcut for sap.m.ValueCSSColor
	var ValueCSSColor = MobileLibrary.ValueCSSColor;

	/**
	 * Constructor for a new Status.
	 *
	 * @class
	 * The status element holds information about a custom status that can be applied to nodes,
	 * lines, and groups of nodes.<br>
	 * <br>
	 * You can create multiple custom statuses and assign them to your graph using the
	 * <code>statuses</code> aggregation of the {@link sap.suite.ui.commons.networkgraph.Graph}
	 * control.<br>
	 * <br>
	 * Alternatively, you can use default statuses provided by the
	 * {@link sap.suite.ui.commons.networkgraph.ElementStatus} element.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @since 1.50
	 * @public
	 * @alias sap.suite.ui.commons.networkgraph.Status
	 */
	var Status = Element.extend("sap.suite.ui.commons.networkgraph.Status", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				key: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Title of the node.<br>
				 * The title that is applied to elements that are in this custom status. The title is displayed in the legend.
				 */
				title: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Border color.<br>
				 * The border color that is applied to elements in this custom status.
				 */
				borderColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Fill color.<br>
				 * The fill color that is applied to elements and lines that are in
				 * this custom status.
				 */
				backgroundColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Color of the content (text or icon) inside the node.<br>
				 * The color is applied to a node's content when it enters this
				 * custom status.
				 */
				contentColor: {
					type: "string", group: "Appearance", defaultValue: null
				},

				/**
				 * Color of the header content (title and icon) of the node.<br>
				 * Applicable only to the rectangular nodes.
				 */
				headerContentColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Fill color on hover.<br>
				 * The fill color of a custom status element, line, or group when you
				 * hover over it.
				 */
				hoverBackgroundColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Border color on hover.<br>
				 * The border color of a custom status element when you hover over it.
				 */
				hoverBorderColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Content color on hover.
				 * Color of the content (text or icon) inside the custom status element
				 * when you hover over it.
				 */
				hoverContentColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Fill color when selected.<br>
				 * The fill color of a custom status element when you
				 * select it.
				 */
				selectedBackgroundColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Border color when selected.
				 * The border color of a custom status element when you select it.
				 */
				selectedBorderColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Content color when selected.
				 * Color of the content (text or icon) inside the custom status node
				 * when you select it.
				 */
				selectedContentColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Color displayed in the graph's legend.<br>
				 * If not set, the fill color defined in the <code>backgroundColor</code>
				 * property is used.
				 */
				legendColor: {
					type: "string", group: "Appearance", defaultValue: null
				},
				/**
				 * Defines whether the focus border should match the color of the content in focus. If false,
				 * the focus border has the default color.<br>This property can be used only for nodes and groups of nodes.
				 */
				useFocusColorAsContentColor: {
					type: "boolean", group: "Appearance", defaultValue: false
				},
				/**
				 * Border width of the element in specific units (for example 2px).
				 */
				borderWidth: {
					type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null
				},
				/**
				 * Style of the border. For {@link sap.suite.ui.commons.networkgraph.Line} elements use this value as parameter for <code>stroke-dasharray</code>.
				 */
				borderStyle: {
					type: "string", group: "Appearance", defaultValue: null
				}
			}
		}
	});

	Status.prototype._getLegendColor = function () {
		var sLegendColor = this.getLegendColor() || this.getBackgroundColor();

		if (sLegendColor) {
			var sColor = Parameters.get(sLegendColor);
			if (!sColor && ValueCSSColor.isValid(sLegendColor)) {
				sColor = sLegendColor;
			}

			return sColor;
		}

		return null;
	};

	return Status;
});
