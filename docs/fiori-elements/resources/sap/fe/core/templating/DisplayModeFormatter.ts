/**
 * Separating these methods from the UIFormatters as they are used also in the converter.
 * These methods must NOT use any dependency from the SAP UI5 runtime.
 * When consumed outside of converters, you should call them via UIFormatters.
 */

import type { PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import { isPathAnnotationExpression, isPropertyPathExpression } from "sap/fe/core/helpers/TypeGuards";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";

export type PropertyOrPath<P> = string | P | PathAnnotationExpression<P>;

export const ODATA_TYPE_MAPPING: Record<string, any> = {
	"sap.ui.model.odata.type.Boolean": "Edm.Boolean",
	"sap.ui.model.odata.type.Byte": "Edm.Byte",
	"sap.ui.model.odata.type.Date": "Edm.Date",
	"sap.ui.model.odata.type.DateTimeOffset": "Edm.DateTimeOffset",
	"sap.ui.model.odata.type.Decimal": "Edm.Decimal",
	"sap.ui.model.odata.type.Double": "Edm.Double",
	"sap.ui.model.odata.type.Guid": "Edm.Guid",
	"sap.ui.model.odata.type.Int16": "Edm.Int16",
	"sap.ui.model.odata.type.Int32": "Edm.Int32",
	"sap.ui.model.odata.type.Int64": "Edm.Int64",
	"sap.ui.model.odata.type.SByte": "Edm.SByte",
	"sap.ui.model.odata.type.Single": "Edm.Single",
	"sap.ui.model.odata.type.Stream": "Edm.Stream",
	"sap.ui.model.odata.type.TimeOfDay": "Edm.TimeOfDay",
	"sap.ui.model.odata.type.String": "Edm.String"
};

export type DisplayMode = "Value" | "Description" | "DescriptionValue" | "ValueDescription";
export const getDisplayMode = function (oPropertyPath: PropertyOrPath<Property>, oDataModelObjectPath?: DataModelObjectPath): DisplayMode {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return "Value";
	}
	const oProperty =
		((isPathAnnotationExpression(oPropertyPath) || isPropertyPathExpression(oPropertyPath)) && oPropertyPath.$target) ||
		(oPropertyPath as Property);
	const oEntityType = oDataModelObjectPath && oDataModelObjectPath.targetEntityType;
	const oTextAnnotation = oProperty.annotations?.Common?.Text;
	const oTextArrangementAnnotation =
		(typeof oTextAnnotation !== "string" && oTextAnnotation?.annotations?.UI?.TextArrangement?.toString()) ||
		oEntityType?.annotations?.UI?.TextArrangement?.toString();

	let sDisplayValue = oTextAnnotation ? "DescriptionValue" : "Value";
	if ((oTextAnnotation && oTextArrangementAnnotation) || oEntityType?.annotations?.UI?.TextArrangement?.toString()) {
		if (oTextArrangementAnnotation === "UI.TextArrangementType/TextOnly") {
			sDisplayValue = "Description";
		} else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextLast") {
			sDisplayValue = "ValueDescription";
		} else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextSeparate") {
			sDisplayValue = "Value";
		} else {
			//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
			sDisplayValue = "DescriptionValue";
		}
	}
	return sDisplayValue as DisplayMode;
};
