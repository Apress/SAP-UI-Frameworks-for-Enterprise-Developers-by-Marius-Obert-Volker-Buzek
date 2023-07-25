/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(['sap/ui/core/Control', "./BusinessCardRenderer"], function(Control, BusinessCardRenderer) {
	"use strict";

	/**
	 * Constructor for a new BusinessCard.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control allows you to display business card information including an image, first title (either URL link or text), second title, and multiple text lines.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.BusinessCard
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BusinessCard = Control.extend("sap.suite.ui.commons.BusinessCard", /** @lends sap.suite.ui.commons.BusinessCard.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Title of the BusinessCard that describes its type.
				 */
				type: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * A path to the BusinessCard icon.
				 */
				iconPath: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * A short text line that describes this BusinessCard.
				 */
				secondTitle: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Width of the BusinessCard. Alternatively, CSS size can be set in %, px, or em.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: null },

				/**
				 * A tooltip that is set for an image.
				 */
				imageTooltip: { type: "string", group: "Misc", defaultValue: null }
			},
			aggregations: {

				/**
				 * The content of the BusinessCard body must be provided by the application developer.
				 */
				content: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * Any control that can display a title. Content of this control appears at the first position in BusinessCard. Recomended controls: sap.ui.commons.Label and sap.ui.commons.Link.
				 */
				firstTitle: { type: "sap.ui.core.Control", multiple: false }
			}
		}
	});
	return BusinessCard;
});