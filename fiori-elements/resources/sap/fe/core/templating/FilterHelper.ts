import type { SelectionRangeTypeTypes, SelectionVariantTypeTypes, SelectOptionType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { DefaultTypeForEdmType, isTypeFilterable } from "sap/fe/core/type/EDM";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
export type FilterConditions = {
	operator: string;
	values: Array<string>;
	isEmpty?: boolean | null;
	validated?: string;
	isParameter?: boolean;
};

const oExcludeMap: Record<string, any> = {
	Contains: "NotContains",
	StartsWith: "NotStartsWith",
	EndsWith: "NotEndsWith",
	Empty: "NotEmpty",
	NotEmpty: "Empty",
	LE: "NOTLE",
	GE: "NOTGE",
	LT: "NOTLT",
	GT: "NOTGT",
	BT: "NOTBT",
	NE: "EQ",
	EQ: "NE"
};

export function _getDateTimeOffsetCompliantValue(sValue: any): string | undefined {
	let oValue;
	if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
		oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
	} else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
		oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0]}+0000`;
	} else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
		oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]}T00:00:00+0000`;
	} else if (sValue.indexOf("Z") === sValue.length - 1) {
		oValue = `${sValue.split("Z")[0]}+0100`;
	} else {
		oValue = undefined;
	}
	return oValue;
}

export function _getDateCompliantValue(sValue: any): string | undefined {
	return sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
		? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]
		: sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
}

/**
 * Method to get the compliant value type based on the data type.
 *
 * @param  sValue Raw value
 * @param  sType The property type
 * @returns Value to be propagated to the condition.
 */

export function getTypeCompliantValue(sValue: any, sType: string): string | undefined {
	let oValue;
	if (!isTypeFilterable(sType as keyof typeof DefaultTypeForEdmType)) {
		return undefined;
	}
	oValue = sValue;
	switch (sType) {
		case "Edm.Boolean":
			if (typeof sValue === "boolean") {
				oValue = sValue;
			} else {
				oValue = sValue === "true" || (sValue === "false" ? false : undefined);
			}
			break;
		case "Edm.Double":
		case "Edm.Single":
			oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
			break;
		case "Edm.Byte":
		case "Edm.Int16":
		case "Edm.Int32":
		case "Edm.SByte":
			oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
			break;
		case "Edm.Date":
			oValue = _getDateCompliantValue(sValue);
			break;
		case "Edm.DateTimeOffset":
			oValue = _getDateTimeOffsetCompliantValue(sValue);
			break;
		case "Edm.TimeOfDay":
			oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
			break;
		default:
	}

	return oValue === null ? undefined : oValue;
}

/**
 * Method to create a condition.
 *
 * @param  sOption Operator to be used.
 * @param  oV1 Lower value
 * @param  oV2 Higher value
 * @param sSign
 * @returns Condition to be created
 */
export function resolveConditionValues(sOption: string | undefined, oV1: any, oV2: any, sSign: string | undefined) {
	let oValue = oV1,
		oValue2,
		sInternalOperation: any;
	const oCondition: Record<string, FilterConditions[]> = {};
	oCondition.values = [];
	oCondition.isEmpty = null as any;
	if (oV1 === undefined || oV1 === null) {
		return undefined;
	}

	switch (sOption) {
		case "CP":
			sInternalOperation = "Contains";
			if (oValue) {
				const nIndexOf = oValue.indexOf("*");
				const nLastIndex = oValue.lastIndexOf("*");

				// only when there are '*' at all
				if (nIndexOf > -1) {
					if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
						sInternalOperation = "EndsWith";
						oValue = oValue.substring(1, oValue.length);
					} else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
						sInternalOperation = "StartsWith";
						oValue = oValue.substring(0, oValue.length - 1);
					} else {
						oValue = oValue.substring(1, oValue.length - 1);
					}
				} else {
					Log.warning("Contains Option cannot be used without '*'.");
					return undefined;
				}
			}
			break;
		case "EQ":
			sInternalOperation = oV1 === "" ? "Empty" : sOption;
			break;
		case "NE":
			sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
			break;
		case "BT":
			if (oV2 === undefined || oV2 === null) {
				return;
			}
			oValue2 = oV2;
			sInternalOperation = sOption;
			break;
		case "LE":
		case "GE":
		case "GT":
		case "LT":
			sInternalOperation = sOption;
			break;
		default:
			Log.warning(`Selection Option is not supported : '${sOption}'`);
			return undefined;
	}
	if (sSign === "E") {
		sInternalOperation = oExcludeMap[sInternalOperation];
	}
	oCondition.operator = sInternalOperation;
	if (sInternalOperation !== "Empty") {
		oCondition.values.push(oValue);
		if (oValue2) {
			oCondition.values.push(oValue2);
		}
	}
	return oCondition;
}

/* Method to get the Range property from the Selection Option */
export function getRangeProperty(sProperty: string): string {
	return sProperty.indexOf("/") > 0 ? sProperty.split("/")[1] : sProperty;
}

function _buildConditionsFromSelectionRanges(
	Ranges: SelectionRangeTypeTypes[],
	oProperty: Record<string, object>,
	sPropertyName: string,
	getCustomConditions?: Function
): any[] {
	const aConditions: any[] = [];
	Ranges?.forEach((Range: any) => {
		const oCondition = getCustomConditions ? getCustomConditions(Range, oProperty, sPropertyName) : getConditions(Range, oProperty);
		if (oCondition) {
			aConditions.push(oCondition);
		}
	});
	return aConditions;
}

function _getProperty(propertyName: string, metaModel: ODataMetaModel, entitySetPath: string): Record<string, object> {
	const lastSlashIndex = propertyName.lastIndexOf("/");
	const navigationPath = lastSlashIndex > -1 ? propertyName.substring(0, propertyName.lastIndexOf("/") + 1) : "";
	const collection = metaModel.getObject(`${entitySetPath}/${navigationPath}`);
	return collection?.[propertyName.replace(navigationPath, "")];
}

function _buildFiltersConditionsFromSelectOption(
	selectOption: SelectOptionType,
	metaModel: ODataMetaModel,
	entitySetPath: string,
	getCustomConditions?: Function
): Record<string, FilterConditions[]> {
	const propertyName: any = selectOption.PropertyName,
		filterConditions: Record<string, FilterConditions[]> = {},
		propertyPath: string = propertyName.value || propertyName.$PropertyPath,
		Ranges: SelectionRangeTypeTypes[] = selectOption.Ranges;
	const targetProperty = _getProperty(propertyPath, metaModel, entitySetPath);
	if (targetProperty) {
		const conditions: any[] = _buildConditionsFromSelectionRanges(Ranges, targetProperty, propertyPath, getCustomConditions);
		if (conditions.length) {
			filterConditions[propertyPath] = (filterConditions[propertyPath] || []).concat(conditions);
		}
	}
	return filterConditions;
}

export function getFiltersConditionsFromSelectionVariant(
	sEntitySetPath: string,
	oMetaModel: ODataMetaModel,
	selectionVariant: SelectionVariantTypeTypes,
	getCustomConditions?: Function
): Record<string, FilterConditions[]> {
	let oFilterConditions: Record<string, FilterConditions[]> = {};
	if (!selectionVariant) {
		return oFilterConditions;
	}
	const aSelectOptions = selectionVariant.SelectOptions,
		aParameters = selectionVariant.Parameters;
	aSelectOptions?.forEach((selectOption: SelectOptionType) => {
		const propertyName: any = selectOption.PropertyName,
			sPropertyName: string = propertyName.value || propertyName.$PropertyPath;
		if (Object.keys(oFilterConditions).includes(sPropertyName)) {
			oFilterConditions[sPropertyName] = oFilterConditions[sPropertyName].concat(
				_buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)[sPropertyName]
			);
		} else {
			oFilterConditions = {
				...oFilterConditions,
				..._buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)
			};
		}
	});
	aParameters?.forEach((parameter: any) => {
		const sPropertyPath = parameter.PropertyName.value || parameter.PropertyName.$PropertyPath;
		const oCondition: any = getCustomConditions
			? { operator: "EQ", value1: parameter.PropertyValue, value2: null, path: sPropertyPath, isParameter: true }
			: {
					operator: "EQ",
					values: [parameter.PropertyValue],
					isEmpty: null,
					validated: ConditionValidated.Validated,
					isParameter: true
			  };
		oFilterConditions[sPropertyPath] = [oCondition];
	});

	return oFilterConditions;
}

export function getConditions(Range: any, oValidProperty: any): ConditionObject | undefined {
	let oCondition;
	const sign: string | undefined = Range.Sign ? getRangeProperty(Range.Sign) : undefined;
	const sOption: string | undefined = Range.Option ? getRangeProperty(Range.Option) : undefined;
	const oValue1: any = getTypeCompliantValue(Range.Low, oValidProperty.$Type || oValidProperty.type);
	const oValue2: any = Range.High ? getTypeCompliantValue(Range.High, oValidProperty.$Type || oValidProperty.type) : undefined;
	const oConditionValues = resolveConditionValues(sOption, oValue1, oValue2, sign) as any;
	if (oConditionValues) {
		oCondition = Condition.createCondition(
			oConditionValues.operator,
			oConditionValues.values,
			null,
			null,
			ConditionValidated.Validated
		);
	}
	return oCondition;
}

const getDefaultValueFilters = function (oContext: any, properties: any): Record<string, FilterConditions[]> {
	const filterConditions: Record<string, FilterConditions[]> = {};
	const entitySetPath = oContext.getInterface(1).getPath(),
		oMetaModel = oContext.getInterface(1).getModel();
	if (properties) {
		for (const key in properties) {
			const defaultFilterValue = oMetaModel.getObject(`${entitySetPath}/${key}@com.sap.vocabularies.Common.v1.FilterDefaultValue`);
			if (defaultFilterValue !== undefined) {
				const PropertyName = key;
				filterConditions[PropertyName] = [
					Condition.createCondition("EQ", [defaultFilterValue], null, null, ConditionValidated.Validated) as FilterConditions
				];
			}
		}
	}
	return filterConditions;
};

const getDefaultSemanticDateFilters = function (
	oContext: any,
	properties: any,
	defaultSemanticDates: any
): Record<string, FilterConditions[]> {
	const filterConditions: Record<string, FilterConditions[]> = {};
	const oInterface = oContext.getInterface(1);
	const oMetaModel = oInterface.getModel();
	const sEntityTypePath = oInterface.getPath();
	for (const key in defaultSemanticDates) {
		if (defaultSemanticDates[key][0]) {
			const aPropertyPathParts = key.split("::");
			let sPath = "";
			const iPropertyPathLength = aPropertyPathParts.length;
			const sNavigationPath = aPropertyPathParts.slice(0, aPropertyPathParts.length - 1).join("/");
			const sProperty = aPropertyPathParts[iPropertyPathLength - 1];
			if (sNavigationPath) {
				//Create Proper Condition Path e.g. _Item*/Property or _Item/Property
				const vProperty = oMetaModel.getObject(sEntityTypePath + "/" + sNavigationPath);
				if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
					sPath += `${sNavigationPath}*/`;
				} else if (vProperty.$kind === "NavigationProperty") {
					sPath += `${sNavigationPath}/`;
				}
			}
			sPath += sProperty;
			const operatorParamsArr = "values" in defaultSemanticDates[key][0] ? defaultSemanticDates[key][0].values : [];
			filterConditions[sPath] = [
				Condition.createCondition(defaultSemanticDates[key][0].operator, operatorParamsArr, null, null, null) as FilterConditions
			];
		}
	}
	return filterConditions;
};

function getEditStatusFilter(): Record<string, FilterConditions[]> {
	const ofilterConditions: Record<string, FilterConditions[]> = {};
	ofilterConditions["$editState"] = [
		Condition.createCondition("DRAFT_EDIT_STATE", ["ALL"], null, null, ConditionValidated.Validated) as FilterConditions
	];
	return ofilterConditions;
}

export function getFilterConditions(oContext: any, filterConditions: any): Record<string, FilterConditions[]> {
	let editStateFilter;
	const entitySetPath = oContext.getInterface(1).getPath(),
		oMetaModel = oContext.getInterface(1).getModel(),
		entityTypeAnnotations = oMetaModel.getObject(`${entitySetPath}@`),
		entityTypeProperties = oMetaModel.getObject(`${entitySetPath}/`);
	if (
		entityTypeAnnotations &&
		(entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] ||
			entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftNode"])
	) {
		editStateFilter = getEditStatusFilter();
	}
	const selectionVariant = filterConditions?.selectionVariant;
	const defaultSemanticDates = filterConditions?.defaultSemanticDates || {};
	const defaultFilters = getDefaultValueFilters(oContext, entityTypeProperties);
	const defaultSemanticDateFilters = getDefaultSemanticDateFilters(oContext, entityTypeProperties, defaultSemanticDates);
	if (selectionVariant) {
		filterConditions = getFiltersConditionsFromSelectionVariant(entitySetPath, oMetaModel, selectionVariant);
	} else if (defaultFilters) {
		filterConditions = defaultFilters;
	}
	if (defaultSemanticDateFilters) {
		// only for semantic date:
		// 1. value from manifest get merged with SV
		// 2. manifest value is given preference when there is same semantic date property in SV and manifest
		filterConditions = { ...filterConditions, ...defaultSemanticDateFilters };
	}
	if (editStateFilter) {
		filterConditions = { ...filterConditions, ...editStateFilter };
	}
	return (Object.keys(filterConditions).length > 0 ? JSON.stringify(filterConditions).replace(/([{}])/g, "\\$1") : undefined) as any;
}

getFilterConditions.requiresIContext = true;
