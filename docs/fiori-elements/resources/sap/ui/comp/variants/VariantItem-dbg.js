/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.variants.VariantItem.
sap.ui.define([
	'sap/ui/comp/library', 'sap/m/VariantItem'
], function (library, Item) {
	"use strict";

	/**
	 * Constructor for a new variants/VariantItem.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The VariantItem class describes a variant item.
	 * @extends sap.m.VariantItem
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.variants.VariantItem
	 */
	var VariantItem = Item.extend("sap.ui.comp.variants.VariantItem", /** @lends sap.ui.comp.variants.VariantItem.prototype */
		{
			metadata: {

				library: "sap.ui.comp",
				properties: {

					/**
					 * Attribute for usage in <code>SmartFilterBar</code>
					 * @since 1.26.0
					 */
					executeOnSelection: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					},

					/**
					 * If set to <code>false</code>, the user is allowed to change the item's data
					 * @since 1.26.0
					 */
					readOnly: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					},

					/**
					 * Identifier of the transport object the variant is assigned to.
					 * @since 1.26.0
					 */
					lifecycleTransportId: {
						type: "string",
						group: "Misc",
						defaultValue: null
					},

					/**
					 * Indicator if a variant is visible for all users.
					 * @since 1.26.0
					 */
					global: {
						type: "boolean",
						group: "Misc",
						defaultValue: null
					},

					/**
					 * ABAP package the variant is assigned to. Used for transport functionality.
					 * @since 1.26.0
					 */
					lifecyclePackage: {
						type: "string",
						group: "Misc",
						defaultValue: null
					},

					/**
					 * Variant namespace
					 * @since 1.26.0
					 */
					namespace: {
						type: "string",
						group: "Misc",
						defaultValue: null
					},

					/**
					 * Flags for a variant to indicate why it might be read-only.
					 * @since 1.26.0
					 * @deprecated Since version 1.28.0. Replaced by property <code>labelReadOnly</code>
					 */
					accessOptions: {
						type: "string",
						group: "Misc",
						defaultValue: null,
						deprecated: true
					},

					/**
					 * Indicates if the variant title can be changed.
					 * @since 1.26.0
					 */
					labelReadOnly: {
						type: "boolean",
						group: "Misc",
						defaultValue: false
					},


					/**
					 * Assigned contexts.
					 * @since 1.88
					 */
					_contexts: {
						type: "object",
						group: "Misc",
						visibility: "hidden",
						defaultValue: {}
					}
				},
				events: {

					/**
					 * This event is fired when one of the properties is changed.
					 */
					change: {
						parameters: {

							/**
							 * Name of the changed property
							 */
							propertyName: {
								type: "string"
							}
						}
					}
				}
			}
		});

	/**
	 * Setter for text property.
	 * @public
	 * @param {string} sText New text
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 */
	VariantItem.prototype.setText = function (sText) {
		this.setProperty("text", sText);
		this.fireChange({
			propertyName: "text"
		});
		return this;
	};

	VariantItem.prototype.setContexts = function (mContexts) {
		this.setProperty("_contexts", mContexts);
		return this;
	};
	VariantItem.prototype.getContexts = function () {
		return this.getProperty("_contexts");
	};

	return VariantItem;
});
