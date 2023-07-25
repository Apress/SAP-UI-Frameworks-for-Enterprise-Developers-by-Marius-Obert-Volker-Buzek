import type { Property } from "@sap-ux/vocabularies-types";
import CommonUtils from "sap/fe/core/CommonUtils";
import { compileExpression, EDM_TYPE_MAPPING, getFiscalType, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { DataModelObjectPath, getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getProperty } from "sap/fe/core/templating/PropertyFormatters";
import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import FiscalDate from "sap/fe/core/type/FiscalDate";
import CommonHelper from "sap/fe/macros/CommonHelper";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

/**
 * Checks whether the property with the given path is required in the filter for the given annotation interface.
 *
 * @param path Property path - ignored when provided as string
 * @param annotationInterface Structure returned by the ODataMetaModel when using the @@ operator in XML templates
 * @returns The value true if the given input is requird for filtering
 */
export function isRequiredInFilter(path: string | unknown, annotationInterface: ComputedAnnotationInterface) {
	const model = annotationInterface.context.getModel() as ODataMetaModel;
	const propertyPath = annotationInterface.context.getPath();
	const propertyLocationPath = CommonHelper.getLocationForPropertyPath(model, propertyPath);

	let property: string;
	let required = model.getObject(`${propertyLocationPath}/@com.sap.vocabularies.Common.v1.ResultContext`);

	if (!required) {
		if (typeof path === "string") {
			property = path;
		} else {
			property = model.getObject(`${propertyPath}@sapui.name`);
		}
		const oFR = CommonUtils.getFilterRestrictionsByPath(propertyLocationPath, model);
		required = oFR?.RequiredProperties?.includes(property);
	}
	return required;
}

/**
 * Checks the maximum number of conditions for the given path and given annotation interface.
 *
 * @param path Property path - ignored when provided as string
 * @param annotationInterface Structure returned by the ODataMetaModel when using the @@ operator in XML templates
 * @returns The number of maximum allowed conditions or -1 if there is no limit.
 */
export function maxConditions(path: string | unknown, annotationInterface: ComputedAnnotationInterface) {
	const model = annotationInterface.context.getModel() as ODataMetaModel;
	const propertyPath = annotationInterface.context.getPath();
	const propertyLocationPath = CommonHelper.getLocationForPropertyPath(model, propertyPath);

	let property: string;
	let max = -1;

	if (model.getObject(`${propertyLocationPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
		return 1;
	}

	if (typeof path === "string") {
		property = path;
	} else {
		property = model.getObject(`${propertyPath}@sapui.name`);
	}
	const filterRestrictions = CommonUtils.getFilterRestrictionsByPath(propertyLocationPath, model);
	let propertyInfo = model.getObject(`${propertyLocationPath}/${property}`);
	if (!propertyInfo) {
		propertyInfo = model.getObject(propertyPath);
	}
	if (propertyInfo.$Type === "Edm.Boolean") {
		max = 1;
	} else if (filterRestrictions?.FilterAllowedExpressions?.[property]) {
		const allowedExpression = CommonUtils.getSpecificAllowedExpression(filterRestrictions.FilterAllowedExpressions[property]);
		if (allowedExpression === "SingleValue" || allowedExpression === "SingleRange") {
			max = 1;
		}
	}
	return max;
}

/**
 * To Create binding for mdc:filterfield conditions.
 *
 * @param dataModelObjectPath Data Model Object path to filter field property
 * @returns Expression binding for conditions for the field
 */
export function getConditionsBinding(dataModelObjectPath: DataModelObjectPath) {
	const relativePropertyPath = getContextRelativeTargetObjectPath(dataModelObjectPath, false, true);
	return compileExpression(pathInModel(`/conditions/${relativePropertyPath}`, "$filters"));
}

/**
 * Get the contraints string for the given property and interface.
 *
 * @param context
 * @param annotationInterface Structure returned by the ODataMetaModel when using the @@ operator in XML templates
 * @returns Constraints as string if available otherwise undefined
 */
export function constraints(context: MetaModelContext, annotationInterface: ComputedAnnotationInterface) {
	const value = (AnnotationHelper.format(context, annotationInterface) as string) || "";
	const matches = value.match(/constraints:.*?({.*?})/);
	let propertyContraints = matches?.[1] || "";
	// Workaround. Add "V4: true" to DateTimeOffset constraints. AnnotationHelper is not aware of this flag.
	if (value.includes("sap.ui.model.odata.type.DateTimeOffset")) {
		if (propertyContraints) {
			propertyContraints = `${propertyContraints.substring(0, matches?.[1].indexOf("}"))}, V4: true}`;
		} else {
			propertyContraints = "{V4: true}";
		}
	}
	// Remove {nullable:false} from the constraints as it prevents from having an empty filter field
	// in the case of a single-value filter
	if (propertyContraints.includes("'nullable':false")) {
		propertyContraints = propertyContraints.replace(/,[ ]*'nullable':false/, "").replace(/'nullable':false[, ]*/, "");
		if (propertyContraints === "{}") {
			propertyContraints = "";
		}
	}
	return propertyContraints || undefined;
}

/**
 * Get the format options as string for the given path and given annotation interface.
 *
 * @param context
 * @param annotationInterface Structure returned by the ODataMetaModel when using the @@ operator in XML templates
 * @returns Format options as string if available otherwise undefined
 */
export function formatOptions(context: MetaModelContext, annotationInterface: ComputedAnnotationInterface) {
	// as the Annotation helper always returns "parseKeepsEmptyString: true" we need to prevent this in case a property (of type string) is nullable
	// Filling annotationInterface.arguments with an array where the first parameter is null, and the second contains the "expected"
	// parseKeepsEmptyString value follows a proposal from the model colleagues to "overrule" the behavior of the AnnotationHelper
	if (context.$Type === "Edm.String") {
		if (!context.hasOwnProperty("$Nullable") || context.$Nullable === true) {
			annotationInterface.arguments = [null, { parseKeepsEmptyString: false }];
		}
		const fiscalType = getFiscalType(getProperty(context, annotationInterface));
		if (fiscalType) {
			if (!annotationInterface.arguments) {
				annotationInterface.arguments = [null, {}];
			}
			annotationInterface.arguments[1].fiscalType = fiscalType;
		}
	}
	const value = (AnnotationHelper.format(context, annotationInterface) as string) || "";
	return value.match(/formatOptions:.*?({.*?})/)?.[1] || undefined;
}

/**
 * Get the data type for a given property.
 *
 * @param property Property information
 * @returns Type as string
 */
export function getDataType(property: Property) {
	if (property.type === "Edm.String") {
		const fiscalType = getFiscalType(property);
		if (fiscalType) {
			return "sap.fe.core.type.FiscalDate";
		}
	}
	const typeMapping = EDM_TYPE_MAPPING[property.type];
	return typeMapping ? typeMapping.type : property.type;
}

/**
 * Get the placeholder of properties of type Edm.String.
 *
 * @param property Property information
 * @returns Placeholder as string if available otherwise undefined
 */
export function getPlaceholder(property: Property): string | undefined {
	if (property.type === "Edm.String") {
		const fiscalType = getFiscalType(property);
		if (fiscalType) {
			return new FiscalDate({ fiscalType }, {}).getPattern();
		}
	}
	return undefined;
}
