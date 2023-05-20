/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Element"
], function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new AriaProperties.
	 *
	 * @class
	 * <code>AriaProperties</code> provides ARIA-compliant properties for screen reader software that can be added to any control renderer.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.65.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.commons.AriaProperties
	 */
	var AriaProperties = Element.extend("sap.suite.ui.commons.AriaProperties", {
		metadata: {
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Defines a string value that labels the current element. See the related <code>labelledBy</code> property.
				 */
				label: {type: "string", defaultValue: null},

				/**
				 * Identifies one or more elements that label the current element. See the related <code>label</code> and <code>describedBy</code> properties.
				 */
				labelledBy: {type: "string", defaultValue: null},

				/**
				 * Identifies one or more elements that describe the object. See the related <code>labelledBy</code> property.
				 */
				describedBy: {type: "string", defaultValue: null},

				/**
				 * Identifies the element role.
				 */
				role: {type: "string", defaultValue: null},

				/**
				 * Indicates that the element has a popup context menu or a submenu.
				 */
				hasPopup: {type: "string", defaultValue: null}
			}
		}
	});

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	/**
	 * Adds the provided ARIA-compliant properties to a control.
	 *
	 * @public
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {object} oDefaultProperties Default ARIA-compliant properties of the control
	 * @param {sap.suite.ui.commons.AriaProperties} oAriaProperties ARIA-compliant properties from data binding
	 */
	AriaProperties.writeAriaProperties = function (oRm, oDefaultProperties, oAriaProperties) {
		var sLabel = (oAriaProperties && oAriaProperties.getLabel()) || oDefaultProperties.label;
		if (sLabel) {
			oRm.attr("aria-label", sLabel);
		}

		var sLabelledBy = (oAriaProperties && oAriaProperties.getLabelledBy()) || oDefaultProperties.labelledBy;
		if (sLabelledBy) {
			oRm.attr("aria-labelledby", sLabelledBy);
		}

		var sDescribedBy = (oAriaProperties && oAriaProperties.getDescribedBy()) || oDefaultProperties.describedBy;
		if (sDescribedBy) {
			oRm.attr("aria-describedby", sDescribedBy);
		}

		var sRole = (oAriaProperties && oAriaProperties.getRole()) || oDefaultProperties.role;
		if (sRole) {
			oRm.attr("role", sRole);
		}

		var sHasPopup = (oAriaProperties && oAriaProperties.getHasPopup()) || oDefaultProperties.hasPopup;
		if (sHasPopup) {
			oRm.attr("aria-haspopup", sHasPopup);
		}
	};

	return AriaProperties;
});
