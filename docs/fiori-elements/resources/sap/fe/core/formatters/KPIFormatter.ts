/**
 * KPI label formatting.
 * The KPI label is an abbreviation of the complete global KPI title. It is formed using the first three letters of the first three words of the KPI title.
 * If there is only one word in the global KPI title, the first three letters of the word are displayed.
 * If the KPI title has only two words, only the first letters of these two words are displayed.
 *
 * @param {string} kpiTitle KPI title value
 * @returns {string} The formatted criticality
 */

import Core from "sap/ui/core/Core";

const labelFormat = function (kpiTitle: string): string {
	if (kpiTitle) {
		// Split the title in words
		const titleParts = kpiTitle.split(" ");

		let kpiLabel: string;
		if (titleParts.length === 1) {
			// Only 1 word --> first 3 capitalized letters of the word
			kpiLabel = titleParts[0].substring(0, 3).toUpperCase();
		} else if (titleParts.length === 2) {
			// 2 words --> first capitalized letters of these two words
			kpiLabel = (titleParts[0].substring(0, 1) + titleParts[1].substring(0, 1)).toUpperCase();
		} else {
			// 3 words or more --> first capitalized letters of the first 3 words
			kpiLabel = (titleParts[0].substring(0, 1) + titleParts[1].substring(0, 1) + titleParts[2].substring(0, 1)).toUpperCase();
		}

		return kpiLabel;
	} else {
		// No KPI title --> no label
		return "";
	}
};
labelFormat.__functionName = "sap.fe.core.formatters.KPIFormatter#labelFormat";

/**
 * KPI tooltip formatting.
 *
 * @param kpiTitle KPI title
 * @param kpiValue KPI value
 * @param kpiUnit KPI unit or currency (can be undefined)
 * @param kpiStatus KPI status
 * @param hasUnit Is "true" if the KPI value has a unit or a currency
 * @returns Returns the text for the KPI tooltip.
 */
const tooltipFormat = function (kpiTitle: string, kpiValue: string, kpiUnit: string, kpiStatus: string, hasUnit: string): string {
	const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
	const msgKey = kpiStatus ? `C_KPI_TOOLTIP_${kpiStatus.toUpperCase()}` : "C_KPI_TOOLTIP_NONE";
	let amountWithUnit: string;
	if (hasUnit === "true") {
		if (!kpiUnit) {
			// No unit means multi-unit situation
			amountWithUnit = resBundle.getText("C_KPI_TOOLTIP_AMOUNT_MULTIUNIT");
		} else {
			amountWithUnit = `${kpiValue} ${kpiUnit}`;
		}
	} else {
		amountWithUnit = kpiValue;
	}

	return resBundle.getText(msgKey, [kpiTitle, amountWithUnit]);
};
tooltipFormat.__functionName = "sap.fe.core.formatters.KPIFormatter#tooltipFormat";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const kpiFormatters = function (this: object, sName: string, ...oArgs: any[]): any {
	if (kpiFormatters.hasOwnProperty(sName)) {
		return (kpiFormatters as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

kpiFormatters.labelFormat = labelFormat;
kpiFormatters.tooltipFormat = tooltipFormat;

/**
 * @global
 */
export default kpiFormatters;
