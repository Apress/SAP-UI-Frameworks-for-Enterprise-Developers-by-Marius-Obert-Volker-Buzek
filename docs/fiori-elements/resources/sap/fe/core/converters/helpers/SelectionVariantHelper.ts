import type { SelectionRangeType, SelectionVariantType } from "@sap-ux/vocabularies-types/vocabularies/UI";

export type RangeDefinition = {
	operator: string;
	rangeLow: any;
	rangeHigh?: any;
};

export type FilterDefinition = {
	propertyPath: string;
	propertyType: string;
	ranges: RangeDefinition[];
};

function getRangeDefinition(range: SelectionRangeType, propertyType: string | undefined): RangeDefinition {
	let operator: String;
	const bInclude = range.Sign === "UI.SelectionRangeSignType/I" ? true : false;

	switch (range.Option as string) {
		case "UI.SelectionRangeOptionType/BT":
			operator = bInclude ? "BT" : "NB";
			break;

		case "UI.SelectionRangeOptionType/CP":
			operator = bInclude ? "Contains" : "NotContains";
			break;

		case "UI.SelectionRangeOptionType/EQ":
			operator = bInclude ? "EQ" : "NE";
			break;

		case "UI.SelectionRangeOptionType/GE":
			operator = bInclude ? "GE" : "LT";
			break;

		case "UI.SelectionRangeOptionType/GT":
			operator = bInclude ? "GT" : "LE";
			break;

		case "UI.SelectionRangeOptionType/LE":
			operator = bInclude ? "LE" : "GT";
			break;

		case "UI.SelectionRangeOptionType/LT":
			operator = bInclude ? "LT" : "GE";
			break;

		case "UI.SelectionRangeOptionType/NB":
			operator = bInclude ? "NB" : "BT";
			break;

		case "UI.SelectionRangeOptionType/NE":
			operator = bInclude ? "NE" : "EQ";
			break;

		case "UI.SelectionRangeOptionType/NP":
			operator = bInclude ? "NotContains" : "Contains";
			break;

		default:
			operator = "EQ";
	}

	return {
		operator: operator as string,
		rangeLow: propertyType && propertyType.indexOf("Edm.Date") === 0 ? new Date(range.Low) : range.Low,
		rangeHigh: range.High && propertyType && propertyType.indexOf("Edm.Date") === 0 ? new Date(range.High) : range.High
	};
}

/**
 * Parses a SelectionVariant annotations and creates the corresponding filter definitions.
 *
 * @param selectionVariant SelectionVariant annotation
 * @returns Returns an array of filter definitions corresponding to the SelectionVariant.
 */
export function getFilterDefinitionsFromSelectionVariant(selectionVariant: SelectionVariantType): FilterDefinition[] {
	const aFilterDefs: FilterDefinition[] = [];

	if (selectionVariant.SelectOptions) {
		selectionVariant.SelectOptions.forEach((selectOption) => {
			if (selectOption.PropertyName && selectOption.Ranges.length > 0) {
				aFilterDefs.push({
					propertyPath: selectOption.PropertyName.value,
					propertyType: selectOption.PropertyName.$target.type,
					ranges: selectOption.Ranges.map((range) => {
						return getRangeDefinition(range, selectOption.PropertyName?.$target.type);
					})
				});
			}
		});
	}

	return aFilterDefs;
}
