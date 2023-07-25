import type { Property } from "@sap-ux/vocabularies-types";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import * as PropertyHelper from "./PropertyHelper";
import type { ComputedAnnotationInterface, MetaModelContext } from "./UIFormatters";
import { getConverterContext } from "./UIFormatters";

export const getProperty = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): Property {
	const sPath = oInterface.context.getPath();
	if (!oContext) {
		throw new Error(`Unresolved context path ${sPath}`);
	}
	let isPath = false;
	if (typeof oContext === "object" && oContext.hasOwnProperty("$Path")) {
		isPath = true;
	} else if (typeof oContext === "object" && oContext.hasOwnProperty("$kind") && oContext.$kind !== "Property") {
		throw new Error(`Context does not resolve to a Property object but to a ${oContext.$kind}`);
	}
	let oConverterContext = getConverterContext(oContext, oInterface) as Property;
	if (isPath) {
		oConverterContext = (oConverterContext as any).$target;
	}
	return oConverterContext;
};

export const getPropertyObjectPath = function (
	oContext: MetaModelContext | string,
	oInterface: ComputedAnnotationInterface
): DataModelObjectPath {
	const sPath = oInterface.context.getPath();
	if (!oContext) {
		throw new Error(`Unresolved context path ${sPath}`);
	}
	if (typeof oContext === "object" && oContext.hasOwnProperty("$kind") && oContext.$kind !== "Property") {
		throw new Error(`Context does not resolve to a Property object but to a ${oContext.$kind}`);
	}
	let involvedDataModelObjects = getInvolvedDataModelObjects(oInterface.context);
	if (involvedDataModelObjects.targetObject && involvedDataModelObjects.targetObject.type === "Path") {
		involvedDataModelObjects = enhanceDataModelPath(involvedDataModelObjects, involvedDataModelObjects.targetObject.path);
	}
	return involvedDataModelObjects;
};

export const isKey = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): boolean {
	const oProperty: Property = getProperty(oContext, oInterface);
	return PropertyHelper.isKey(oProperty);
};

export const hasValueHelp = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): boolean {
	const oProperty: Property = getProperty(oContext, oInterface);
	return PropertyHelper.hasValueHelp(oProperty);
};

export const hasDateType = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): boolean {
	const oProperty: Property = getProperty(oContext, oInterface);
	return PropertyHelper.hasDateType(oProperty);
};

export const hasValueHelpWithFixedValues = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): boolean {
	const oProperty: Property = getProperty(oContext, oInterface);
	return PropertyHelper.hasValueHelpWithFixedValues(oProperty);
};

export const getName = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	const oProperty: Property = getProperty(oContext, oInterface);
	return oProperty.name;
};

export const getLabel = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	const oProperty: Property = getProperty(oContext, oInterface);
	return PropertyHelper.getLabel(oProperty);
};

export const getPropertyPath = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	const propertyPath = getPropertyObjectPath(oContext, oInterface);
	return getTargetObjectPath(propertyPath);
};

export const getRelativePropertyPath = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	const propertyPath = getPropertyObjectPath(oContext, oInterface);
	return getTargetObjectPath(propertyPath, true);
};
