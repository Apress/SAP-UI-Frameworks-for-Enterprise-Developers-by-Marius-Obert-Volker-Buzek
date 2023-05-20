// Template Helpers for the List Report
import { generate } from "sap/fe/core/helpers/StableIdHelper";

/**
 * Method returns an VariantBackReference expression based on variantManagement and oConverterContext value.
 *
 * @function
 * @name getVariantBackReference
 * @param {object} oViewData Object Containing View Data
 * @param {object} oConverterContext Object containing converted context
 * @returns {string}
 */

export const getVariantBackReference = function (oViewData: any, oConverterContext: any) {
	if (oViewData && oViewData.variantManagement === "Page") {
		return "fe::PageVariantManagement";
	}
	if (oViewData && oViewData.variantManagement === "Control") {
		return generate([oConverterContext.filterBarId, "VariantManagement"]);
	}
	return undefined;
};

export const getDefaultPath = function (aViews: any) {
	for (let i = 0; i < aViews.length; i++) {
		if (aViews[i].defaultPath) {
			return aViews[i].defaultPath;
		}
	}
};
