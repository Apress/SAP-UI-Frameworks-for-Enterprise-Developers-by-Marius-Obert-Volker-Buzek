import type { ConnectedFieldsTypeTypes, DataFieldTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath } from "sap/fe/core/templating/DataModelPathHelper";
import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import { getConverterContext } from "sap/fe/core/templating/UIFormatters";

export const getDataField = function (
	oContext: MetaModelContext,
	oInterface: ComputedAnnotationInterface
): DataFieldTypes | ConnectedFieldsTypeTypes {
	const sPath = oInterface.context.getPath();
	if (!oContext) {
		throw new Error(`Unresolved context path ${sPath}`);
	}
	let isPath = false;
	if (typeof oContext === "object" && (oContext.hasOwnProperty("$Path") || oContext.hasOwnProperty("$AnnotationPath"))) {
		isPath = true;
	} else if (typeof oContext === "object" && oContext.hasOwnProperty("$kind") && oContext.$kind !== "Property") {
		throw new Error(`Context does not resolve to a DataField object but to a ${oContext.$kind}`);
	}
	let oConverterContext = getConverterContext(oContext, oInterface) as DataFieldTypes;
	if (isPath) {
		oConverterContext = (oConverterContext as any).$target;
	}
	return oConverterContext;
};

export const getDataFieldObjectPath = function (
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
	if (involvedDataModelObjects.targetObject && involvedDataModelObjects.targetObject.type === "AnnotationPath") {
		involvedDataModelObjects = enhanceDataModelPath(involvedDataModelObjects, involvedDataModelObjects.targetObject);
	}
	if (sPath.endsWith("$Path") || sPath.endsWith("$AnnotationPath")) {
		involvedDataModelObjects = enhanceDataModelPath(involvedDataModelObjects, oContext as string);
	}
	return involvedDataModelObjects;
};

export const isSemanticallyConnectedFields = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): boolean {
	const oDataField: DataFieldTypes | ConnectedFieldsTypeTypes = getDataField(oContext, oInterface);
	return (oDataField as ConnectedFieldsTypeTypes).$Type === UIAnnotationTypes.ConnectedFieldsType;
};
