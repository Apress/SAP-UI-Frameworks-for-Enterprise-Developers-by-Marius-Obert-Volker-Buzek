/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/suite/ui/commons/networkgraph/ElementBase"
], function (Control, Text, ElementBase) {
	"use strict";

	/**
	 * Constructor for a new ElementAttribute.
	 *
	 * @class
	 * Holds details of an attribute used in the graph.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.suite.ui.commons.networkgraph.ElementAttribute
	 */
	var ElementAttribute = Control.extend("sap.suite.ui.commons.networkgraph.ElementAttribute", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Label of the attribute. If set to null, the label is not displayed.
				 */
				label: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Value of the attribute. If set to null, the value is not displayed.
				 */
				value: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Name of custom status that can change the color of the label. Note that only contentColor, selectedContentColor and hoverContentColor are relevant to this attribute.
				 */
				labelStatus: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Name of custom status that can change the color of the value. Note that only contentColor, selectedContentColor and hoverContentColor are relevant to this attribute.
				 */
				valueStatus: {
					type: "string", group: "Misc", defaultValue: null
				},
				/**
				 * Defines whether the attribute is visible. This option is used for rectangular nodes.
				 * Visible attributes are displayed right inside the rectangular node. The node's details popup shows
				 * all attributes, including the invisible ones.
				 */
				visible: {
					type: "boolean", group: "Misc", defaultValue: true
				},
				/**
				 * Icon assigned to the attribute.
				 */
				icon: {
					type: "string", group: "Misc", defaultValue: ""
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
			var sId = oControl.getId();
			oRm.openStart("div", sId );
			oRm.attr("data-sap-ui", sId);
			oRm.class("sapSuiteUiCommonsNetworkGraphDivNodeAttributesRow").openEnd();

			if (oControl.getVisible()) {
				oRm.openStart("div").class("sapSuiteUiCommonsNetworkGraphDivNodeAttributesIcons").openEnd();
				if (oControl.getIcon()) {
					oRm.openStart("div", oControl.getId() + "-icon");
					oRm.class("sapSuiteUiCommonsNetworkGraphDivNodeText").class("sapSuiteUiCommonsNetworkGraphDivAttributeIcon").openEnd();
					oControl.getParent()._renderHtmlIcon(oControl.getIcon(), null, null, null, null, oRm);
					oRm.close("div");
				}
				oRm.close("div");

				oRm.openStart("div").class("sapSuiteUiCommonsNetworkGraphDivNodeLabels").openEnd();
				oRm.renderControl(oControl._getLabelControl());
				oRm.close("div");

				oRm.openStart("div").class("sapSuiteUiCommonsNetworkGraphDivNodeValues").openEnd();
				oRm.renderControl(oControl._getValueControl());
				oRm.close("div");
			}

			oRm.close("div");
		}
	},
		onAfterRendering: function () {
			var oParent = this.getParent(),
				sLabelStatus = this.getLabelStatus() || oParent.getStatus(),
				sValueStatus = this.getValueStatus() || oParent.getStatus();

			if (sLabelStatus) {
				var sColor = oParent._getColor(ElementBase.ColorType.Content, sLabelStatus);
				if (sColor) {
					this.$("label").css("color", sColor);
					this.$("icon").css("color", sColor);
				}
			}

			if (sValueStatus) {
				var sColor = oParent._getColor(ElementBase.ColorType.Content, sValueStatus);
				if (sColor) {
					this.$("value").css("color", sColor);
				}
			}
		}
	});

	ElementAttribute.prototype._getLabelControl = function (oRm) {
		if (!this._oLabel) {
			this._oLabel = new Text(this.getId() + "-label", {
				textAlign: "Left",
				wrappingType: "Hyphenated"
			}).addStyleClass("sapSuiteUiCommonsNetworkGraphDivNodeText");
		}

		this._oLabel.setText(this.getLabel());
		return this._oLabel;
	};

	ElementAttribute.prototype._getValueControl = function (oRm) {
		if (!this._oValue) {
			this._oValue = new Text(this.getId() + "-value", {
				textAlign: "Right",
				wrappingType: "Hyphenated"
			}).addStyleClass("sapSuiteUiCommonsNetworkGraphDivNodeText");
		}

		this._oValue.setText(this.getValue());
		return this._oValue;
	};


	ElementAttribute.prototype.exit = function () {
		if (this._oValue) {
			this._oValue.destroy();
			this._oValue = null;
		}

		if (this._oLabel) {
			this._oLabel.destroy();
			this._oLabel = null;
		}
	};

	ElementAttribute.Type = Object.freeze({
		Label: "Label",
		Value: "Value"
	});

	return ElementAttribute;
});
