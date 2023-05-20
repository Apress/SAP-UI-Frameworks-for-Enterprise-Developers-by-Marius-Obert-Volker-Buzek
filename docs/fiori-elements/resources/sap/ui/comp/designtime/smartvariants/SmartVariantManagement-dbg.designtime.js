/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartvariants.SmartVariantManagement control.
sap.ui.define(["sap/ui/comp/variants/VariantManagement"], function(VariantManagement) {
	"use strict";
	return {
		actions: {
			compVariant: function(oVariantManagement) {
				return {
					validators: [
						"noEmptyText",
						{
							validatorFunction: function(sNewText) {
								return !oVariantManagement.isNameDuplicate(sNewText);
							},
							errorMessage:
								oVariantManagement.oResourceBundle.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")
						},
						{
							validatorFunction: function(sNewText) {
								return !oVariantManagement.isNameTooLong(sNewText);
							},
							errorMessage: oVariantManagement.oResourceBundle.getText("VARIANT_MANAGEMENT_MAX_LEN", [ VariantManagement.MAX_NAME_LEN ])
						}
					]
				};
			}
		},
		aggregations: {
			personalizableControls: {
				propagateMetadata : function () {
					return {
						actions: "not-adaptable"
					};
				}
			}
		},
		annotations: {},
		properties: {
			persistencyKey: {
				ignore: true
			},
			entitySet: {
				ignore: true
			},
			displayTextForExecuteOnSelectionForStandardVariant: {
				ignore: false
			}
		},
		variantRenameDomRef: function(oVariantManagement) {
			return oVariantManagement.getTitle().getDomRef("inner");
		},
		tool: {
			start: function(oVariantManagement) {
				oVariantManagement.enteringDesignMode();
			},
			stop: function(oVariantManagement) {
				oVariantManagement.leavingDesignMode();
			}
		},
		customData: {}
	};
});
