import whitespaceReplacer from "sap/base/strings/whitespaceReplacer";
import Core from "sap/ui/core/Core";
import DateFormat from "sap/ui/core/format/DateFormat";
/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const valueFormatters = function (this: object, sName: string, ...oArgs: any[]): any {
	if (valueFormatters.hasOwnProperty(sName)) {
		return (valueFormatters as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

const formatWithBrackets = (firstPart?: string, secondPart?: string): string => {
	if (firstPart && secondPart) {
		return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [firstPart, secondPart]);
	} else {
		return firstPart || secondPart || "";
	}
};
formatWithBrackets.__functionName = "sap.fe.core.formatters.ValueFormatter#formatWithBrackets";

const formatIdentifierTitle = (
	resource_NEW_OBJECT: string,
	resource_NO_HEADER_INFO: string,
	hasActiveEntity: boolean,
	isActiveEntity: boolean,
	firstPart?: string,
	secondPart?: string
): string => {
	let result = secondPart
		? formatWithBrackets(whitespaceReplacer(firstPart), whitespaceReplacer(secondPart))
		: whitespaceReplacer(firstPart);
	if (!result) {
		const newObjectResource = resource_NEW_OBJECT
			? resource_NEW_OBJECT
			: Core.getLibraryResourceBundle("sap.fe.templates").getText("T_NEW_OBJECT");
		const noHeaderInfoResource = resource_NO_HEADER_INFO
			? resource_NO_HEADER_INFO
			: Core.getLibraryResourceBundle("sap.fe.templates").getText(
					"T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO"
			  );
		result = !isActiveEntity && !hasActiveEntity ? newObjectResource : noHeaderInfoResource;
	}
	return result;
};
formatIdentifierTitle.__functionName = "sap.fe.core.formatters.ValueFormatter#formatIdentifierTitle";

const formatWithPercentage = (sValue?: string): string => {
	return sValue !== null && sValue !== undefined ? `${sValue} %` : "";
};
formatWithPercentage.__functionName = "sap.fe.core.formatters.ValueFormatter#formatWithPercentage";

const computePercentage = (value: string | number, target: string | number, sUnit?: string): string | undefined => {
	let sPercentString: string;
	//BCP: 2370008548 If the base value is undefined return "0" by default
	if (value === undefined) {
		return "0";
	}

	const iValue: number = typeof value === "string" ? parseFloat(value) : value;
	const iTarget: number = typeof target === "string" ? parseFloat(target) : target;

	if (sUnit === "%") {
		if (iValue > 100) {
			sPercentString = "100";
		} else if (iValue <= 0) {
			sPercentString = "0";
		} else {
			sPercentString = typeof value === "string" ? value : value?.toString();
		}
	} else if (iValue > iTarget) {
		sPercentString = "100";
	} else if (iValue <= 0) {
		sPercentString = "0";
	} else {
		sPercentString = iValue && iTarget ? ((iValue / iTarget) * 100).toString() : "0";
	}
	return sPercentString;
};
computePercentage.__functionName = "sap.fe.core.formatters.ValueFormatter#computePercentage";

export const formatCriticalityIcon = (val?: string | number): string | undefined => {
	let sIcon: string;
	if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
		sIcon = "sap-icon://message-error";
	} else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
		sIcon = "sap-icon://message-warning";
	} else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
		sIcon = "sap-icon://message-success";
	} else if (val === "UI.CriticalityType/Information" || val === "5" || val === 5) {
		sIcon = "sap-icon://message-information";
	} else {
		sIcon = "";
	}
	return sIcon;
};
formatCriticalityIcon.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityIcon";

export const formatCriticalityValueState = (val?: string | number): string | undefined => {
	let sValueState: string;
	if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
		sValueState = "Error";
	} else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
		sValueState = "Warning";
	} else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
		sValueState = "Success";
	} else if (val === "UI.CriticalityType/Information" || val === "5" || val === 5) {
		sValueState = "Information";
	} else {
		sValueState = "None";
	}
	return sValueState;
};
formatCriticalityValueState.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityValueState";

export const formatCriticalityButtonType = (val?: string | number): string | undefined => {
	let sType: string;
	if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
		sType = "Reject";
	} else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
		sType = "Accept";
	} else {
		sType = "Default";
	}
	return sType;
};
formatCriticalityButtonType.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityButtonType";

export const formatCriticalityColorMicroChart = (val?: string | number): string | undefined => {
	let sColor: string;
	if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
		sColor = "Error";
	} else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
		sColor = "Critical";
	} else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
		sColor = "Good";
	} else {
		sColor = "Neutral";
	}
	return sColor;
};
formatCriticalityColorMicroChart.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityColorMicroChart";

export const formatProgressIndicatorText = (value: any, target: any, unit: any): string | undefined => {
	if (value && target && unit) {
		const unitSplit = unit.split("-");
		const searchUnit = `${unitSplit[1] === undefined ? unit : unitSplit[1]}-narrow`;
		const dateFormat = DateFormat.getDateInstance() as any;
		const localeData = dateFormat.oLocaleData.mData;
		const oResourceModel = Core.getLibraryResourceBundle("sap.fe.macros");
		let unitDisplayed = unit;
		if (localeData?.dateFields[searchUnit]?.displayName) {
			unitDisplayed = localeData.dateFields[searchUnit].displayName;
		} else if (localeData?.units?.short[unit]?.displayName) {
			unitDisplayed = localeData.units.short[unit].displayName;
		}

		return oResourceModel.getText("T_COMMON_PROGRESS_INDICATOR_DISPLAY_VALUE_WITH_UOM", [value, target, unitDisplayed]);
	}
};
formatProgressIndicatorText.__functionName = "sap.fe.core.formatters.ValueFormatter#formatProgressIndicatorText";

export const formatToKeepWhitespace = (value: string | boolean | number): string => {
	return value === null || value === undefined ? "" : whitespaceReplacer(value + "");
};
formatToKeepWhitespace.__functionName = "sap.fe.core.formatters.ValueFormatter#formatToKeepWhitespace";

valueFormatters.formatWithBrackets = formatWithBrackets;
valueFormatters.formatIdentifierTitle = formatIdentifierTitle;
valueFormatters.formatWithPercentage = formatWithPercentage;
valueFormatters.computePercentage = computePercentage;
valueFormatters.formatCriticalityIcon = formatCriticalityIcon;
valueFormatters.formatCriticalityValueState = formatCriticalityValueState;
valueFormatters.formatCriticalityButtonType = formatCriticalityButtonType;
valueFormatters.formatCriticalityColorMicroChart = formatCriticalityColorMicroChart;
valueFormatters.formatProgressIndicatorText = formatProgressIndicatorText;
valueFormatters.formatToKeepWhitespace = formatToKeepWhitespace;
/**
 * @global
 */
export default valueFormatters;
