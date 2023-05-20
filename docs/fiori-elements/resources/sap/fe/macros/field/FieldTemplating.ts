import type { NavigationProperty, Property } from "@sap-ux/vocabularies-types";
import type { DataFieldAbstractTypes, DataFieldWithUrl, DataPointTypeTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	equal,
	formatWithTypeInformation,
	getExpressionFromAnnotation,
	ifElse,
	isComplexTypeExpression,
	isPathInModelExpression,
	not,
	or,
	pathInModel,
	transformRecursively
} from "sap/fe/core/helpers/BindingToolkit";
import { isNavigationProperty, isPathAnnotationExpression, isProperty } from "sap/fe/core/helpers/TypeGuards";
import * as CommonFormatters from "sap/fe/core/templating/CommonFormatters";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { isReadOnlyExpression } from "sap/fe/core/templating/FieldControlHelper";
import * as PropertyHelper from "sap/fe/core/templating/PropertyHelper";
import * as SemanticObjectHelper from "sap/fe/core/templating/SemanticObjectHelper";
import { getDynamicPathFromSemanticObject, hasSemanticObject } from "sap/fe/core/templating/SemanticObjectHelper";
import type { DisplayMode, PropertyOrPath } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import type { FieldProperties } from "sap/fe/macros/internal/InternalField.block";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * Recursively add the text arrangement to a binding expression.
 *
 * @param bindingExpressionToEnhance The binding expression to be enhanced
 * @param fullContextPath The current context path we're on (to properly resolve the text arrangement properties)
 * @returns An updated expression containing the text arrangement binding.
 */
export const addTextArrangementToBindingExpression = function (
	bindingExpressionToEnhance: BindingToolkitExpression<any>,
	fullContextPath: DataModelObjectPath
): BindingToolkitExpression<any> {
	return transformRecursively(bindingExpressionToEnhance, "PathInModel", (expression) => {
		let outExpression: BindingToolkitExpression<any> = expression;
		if (expression.modelName === undefined) {
			// In case of default model we then need to resolve the text arrangement property
			const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
			outExpression = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelPath, expression);
		}
		return outExpression;
	});
};

export const formatValueRecursively = function (
	bindingExpressionToEnhance: BindingToolkitExpression<any>,
	fullContextPath: DataModelObjectPath
): BindingToolkitExpression<any> {
	return transformRecursively(bindingExpressionToEnhance, "PathInModel", (expression) => {
		let outExpression: BindingToolkitExpression<any> = expression;
		if (expression.modelName === undefined) {
			// In case of default model we then need to resolve the text arrangement property
			const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
			outExpression = formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
		}
		return outExpression;
	});
};
export const getTextBindingExpression = function (
	oPropertyDataModelObjectPath: DataModelObjectPath,
	fieldFormatOptions: { displayMode?: DisplayMode; measureDisplayMode?: string }
): BindingToolkitExpression<string> {
	return getTextBinding(oPropertyDataModelObjectPath, fieldFormatOptions, true) as BindingToolkitExpression<string>;
};
export const getTextBinding = function (
	oPropertyDataModelObjectPath: DataModelObjectPath,
	fieldFormatOptions: {
		displayMode?: DisplayMode;
		measureDisplayMode?: string;
		dateFormatOptions?: { showTime: string; showDate: string; showTimezone: string };
	},
	asObject: boolean = false
): BindingToolkitExpression<string> | CompiledBindingToolkitExpression {
	if (
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataField" ||
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataPointType" ||
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" ||
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" ||
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" ||
		oPropertyDataModelObjectPath.targetObject?.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction"
	) {
		// If there is no resolved property, the value is returned as a constant
		const fieldValue = getExpressionFromAnnotation(oPropertyDataModelObjectPath.targetObject.Value) ?? "";
		return compileExpression(fieldValue);
	}
	if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
		oPropertyDataModelObjectPath = enhanceDataModelPath(oPropertyDataModelObjectPath, oPropertyDataModelObjectPath.targetObject.path);
	}
	const oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
	let oTargetBinding;
	if (
		oPropertyDataModelObjectPath.targetObject?.annotations?.Measures?.Unit ||
		oPropertyDataModelObjectPath.targetObject?.annotations?.Measures?.ISOCurrency
	) {
		oTargetBinding = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression);
		if (fieldFormatOptions?.measureDisplayMode === "Hidden" && isComplexTypeExpression(oTargetBinding)) {
			// TODO: Refactor once types are less generic here
			oTargetBinding.formatOptions = {
				...oTargetBinding.formatOptions,
				showMeasure: false
			};
		}
	} else if (oPropertyDataModelObjectPath.targetObject?.annotations?.Common?.Timezone) {
		oTargetBinding = UIFormatters.getBindingWithTimezone(
			oPropertyDataModelObjectPath,
			oBindingExpression,
			false,
			true,
			fieldFormatOptions.dateFormatOptions
		);
	} else {
		oTargetBinding = CommonFormatters.getBindingWithTextArrangement(
			oPropertyDataModelObjectPath,
			oBindingExpression,
			fieldFormatOptions
		);
	}
	if (asObject) {
		return oTargetBinding;
	}
	// We don't include $$nopatch and parseKeepEmptyString as they make no sense in the text binding case
	return compileExpression(oTargetBinding);
};

export const getValueBinding = function (
	oPropertyDataModelObjectPath: DataModelObjectPath,
	fieldFormatOptions: { measureDisplayMode?: string },
	ignoreUnit: boolean = false,
	ignoreFormatting: boolean = false,
	bindingParameters?: object,
	targetTypeAny = false,
	keepUnit = false
): CompiledBindingToolkitExpression {
	if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
		const oNavPath = oPropertyDataModelObjectPath.targetEntityType.resolvePath(oPropertyDataModelObjectPath.targetObject.path, true);
		oPropertyDataModelObjectPath.targetObject = oNavPath.target;
		oNavPath.visitedObjects.forEach((oNavObj: any) => {
			if (isNavigationProperty(oNavObj)) {
				oPropertyDataModelObjectPath.navigationProperties.push(oNavObj);
			}
		});
	}

	const targetObject = oPropertyDataModelObjectPath.targetObject;
	if (isProperty(targetObject)) {
		let oBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		if (isPathInModelExpression(oBindingExpression)) {
			if (targetObject.annotations?.Communication?.IsEmailAddress) {
				oBindingExpression.type = "sap.fe.core.type.Email";
			} else if (!ignoreUnit && (targetObject.annotations?.Measures?.ISOCurrency || targetObject.annotations?.Measures?.Unit)) {
				oBindingExpression = UIFormatters.getBindingWithUnitOrCurrency(
					oPropertyDataModelObjectPath,
					oBindingExpression,
					true,
					keepUnit ? undefined : { showMeasure: false }
				) as any;
			} else {
				const oTimezone = oPropertyDataModelObjectPath.targetObject.annotations?.Common?.Timezone;
				if (oTimezone) {
					oBindingExpression = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, true) as any;
				} else {
					oBindingExpression = formatWithTypeInformation(targetObject, oBindingExpression) as any;
				}
				if (isPathInModelExpression(oBindingExpression) && oBindingExpression.type === "sap.ui.model.odata.type.String") {
					oBindingExpression.formatOptions = {
						parseKeepsEmptyString: true
					};
				}
			}
			if (isPathInModelExpression(oBindingExpression)) {
				if (ignoreFormatting) {
					delete oBindingExpression.formatOptions;
					delete oBindingExpression.constraints;
					delete oBindingExpression.type;
				}
				if (bindingParameters) {
					oBindingExpression.parameters = bindingParameters;
				}
				if (targetTypeAny) {
					oBindingExpression.targetType = "any";
				}
			}
			return compileExpression(oBindingExpression);
		} else {
			// if somehow we could not compile the binding -> return empty string
			return "";
		}
	} else if (
		targetObject?.$Type === UIAnnotationTypes.DataFieldWithUrl ||
		targetObject?.$Type === UIAnnotationTypes.DataFieldWithNavigationPath
	) {
		return compileExpression(getExpressionFromAnnotation((targetObject as DataFieldWithUrl).Value));
	} else {
		return "";
	}
};

export const getAssociatedTextBinding = function (
	oPropertyDataModelObjectPath: DataModelObjectPath,
	fieldFormatOptions: { measureDisplayMode?: string }
): CompiledBindingToolkitExpression {
	const textPropertyPath = PropertyHelper.getAssociatedTextPropertyPath(oPropertyDataModelObjectPath.targetObject);
	if (textPropertyPath) {
		const oTextPropertyPath = enhanceDataModelPath(oPropertyDataModelObjectPath, textPropertyPath);
		return getValueBinding(oTextPropertyPath, fieldFormatOptions, true, true, { $$noPatch: true });
	}
	return undefined;
};

export const isUsedInNavigationWithQuickViewFacets = function (oDataModelPath: DataModelObjectPath, oProperty: Property): boolean {
	const aNavigationProperties = oDataModelPath?.targetEntityType?.navigationProperties || [];
	const aSemanticObjects = oDataModelPath?.targetEntityType?.annotations?.Common?.SemanticKey || [];
	let bIsUsedInNavigationWithQuickViewFacets = false;
	aNavigationProperties.forEach((oNavProp: NavigationProperty) => {
		if (oNavProp.referentialConstraint && oNavProp.referentialConstraint.length) {
			oNavProp.referentialConstraint.forEach((oRefConstraint) => {
				if (oRefConstraint?.sourceProperty === oProperty.name) {
					if (oNavProp?.targetType?.annotations?.UI?.QuickViewFacets) {
						bIsUsedInNavigationWithQuickViewFacets = true;
					}
				}
			});
		}
	});
	if (oDataModelPath.contextLocation?.targetEntitySet !== oDataModelPath.targetEntitySet) {
		const aIsTargetSemanticKey = aSemanticObjects.some(function (oSemantic) {
			return oSemantic?.$target?.name === oProperty.name;
		});
		if ((aIsTargetSemanticKey || oProperty.isKey) && oDataModelPath?.targetEntityType?.annotations?.UI?.QuickViewFacets) {
			bIsUsedInNavigationWithQuickViewFacets = true;
		}
	}
	return bIsUsedInNavigationWithQuickViewFacets;
};

export const isRetrieveTextFromValueListEnabled = function (
	oPropertyPath: PropertyOrPath<Property>,
	fieldFormatOptions: { displayMode?: DisplayMode; textAlignMode?: string }
): boolean {
	const oProperty: Property = (isPathAnnotationExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	if (
		!oProperty.annotations?.Common?.Text &&
		!oProperty.annotations?.Measures &&
		PropertyHelper.hasValueHelp(oProperty) &&
		fieldFormatOptions.textAlignMode === "Form"
	) {
		return true;
	}
	return false;
};

/**
 * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
 *
 * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
 *
 * @param dataFieldModelPath The metapath referring to the annotation we are evaluating.
 * @param [formatOptions] FormatOptions optional.
 * @param formatOptions.isAnalytics This flag is set when using an analytical table.
 * @returns An expression that you can bind to the UI.
 */
export const getVisibleExpression = function (
	dataFieldModelPath: DataModelObjectPath,
	formatOptions?: { isAnalytics?: boolean }
): CompiledBindingToolkitExpression {
	const targetObject: DataFieldAbstractTypes | DataPointTypeTypes = dataFieldModelPath.targetObject;
	let propertyValue;
	if (targetObject) {
		switch (targetObject.$Type) {
			case UIAnnotationTypes.DataField:
			case UIAnnotationTypes.DataFieldWithUrl:
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldWithAction:
			case UIAnnotationTypes.DataPointType:
				propertyValue = targetObject.Value.$target;
				break;
			case UIAnnotationTypes.DataFieldForAnnotation:
				// if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
				if (targetObject?.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
					propertyValue = targetObject.Target.$target?.Value.$target;
					break;
				}
			// eslint-disable-next-line no-fallthrough
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldForAction:
			default:
				propertyValue = undefined;
		}
	}
	const isAnalyticalGroupHeaderExpanded = formatOptions?.isAnalytics ? UI.IsExpanded : constant(false);
	const isAnalyticalLeaf = formatOptions?.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

	// A data field is visible if:
	// - the UI.Hidden expression in the original annotation does not evaluate to 'true'
	// - the UI.Hidden expression in the target property does not evaluate to 'true'
	// - in case of Analytics it's not visible for an expanded GroupHeader
	return compileExpression(
		and(
			...[
				not(equal(getExpressionFromAnnotation(targetObject?.annotations?.UI?.Hidden), true)),
				ifElse(
					!!propertyValue,
					propertyValue && not(equal(getExpressionFromAnnotation(propertyValue.annotations?.UI?.Hidden), true)),
					true
				),
				or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)
			]
		)
	);
};

export const QVTextBinding = function (
	oPropertyDataModelObjectPath: DataModelObjectPath,
	oPropertyValueDataModelObjectPath: DataModelObjectPath,
	fieldFormatOptions: { displayMode?: DisplayMode; measureDisplayMode?: string },
	asObject: boolean = false
) {
	let returnValue: any = getValueBinding(oPropertyDataModelObjectPath, fieldFormatOptions, asObject);
	if (returnValue === "") {
		returnValue = getTextBinding(oPropertyValueDataModelObjectPath, fieldFormatOptions, asObject);
	}
	return returnValue;
};

export const getQuickViewType = function (oPropertyDataModelObjectPath: DataModelObjectPath): string {
	const targetObject = oPropertyDataModelObjectPath.targetObject;
	if (targetObject?.$target?.annotations?.Communication?.IsEmailAddress) {
		return "email";
	}
	if (targetObject?.$target?.annotations?.Communication?.IsPhoneNumber) {
		return "phone";
	}
	return "text";
};

export type SemanticObjectCustomData = {
	key: string;
	value: string;
};

/**
 * Get the customData key value pair of SemanticObjects.
 *
 * @param propertyAnnotations The value of the Common annotation.
 * @param [dynamicSemanticObjectsOnly] Flag for retrieving dynamic Semantic Objects only.
 * @returns The array of the semantic Objects.
 */
export const getSemanticObjectExpressionToResolve = function (
	propertyAnnotations: any,
	dynamicSemanticObjectsOnly?: boolean
): SemanticObjectCustomData[] {
	const aSemObjExprToResolve: SemanticObjectCustomData[] = [];
	let sSemObjExpression: string;
	let annotation;
	if (propertyAnnotations) {
		const semanticObjectsKeys = Object.keys(propertyAnnotations).filter(function (element) {
			return element === "SemanticObject" || element.startsWith("SemanticObject#");
		});
		for (const semanticObject of semanticObjectsKeys) {
			annotation = propertyAnnotations[semanticObject];
			sSemObjExpression = compileExpression(getExpressionFromAnnotation(annotation)) as string;
			if (!dynamicSemanticObjectsOnly || (dynamicSemanticObjectsOnly && isPathAnnotationExpression(annotation))) {
				aSemObjExprToResolve.push({
					key: getDynamicPathFromSemanticObject(sSemObjExpression) || sSemObjExpression,
					value: sSemObjExpression
				});
			}
		}
	}
	return aSemObjExprToResolve;
};

export const getSemanticObjects = function (aSemObjExprToResolve: any[]): any {
	if (aSemObjExprToResolve.length > 0) {
		let sCustomDataKey: string = "";
		let sCustomDataValue: any = "";
		const aSemObjCustomData: any[] = [];
		for (let iSemObjCount = 0; iSemObjCount < aSemObjExprToResolve.length; iSemObjCount++) {
			sCustomDataKey = aSemObjExprToResolve[iSemObjCount].key;
			sCustomDataValue = compileExpression(getExpressionFromAnnotation(aSemObjExprToResolve[iSemObjCount].value));
			aSemObjCustomData.push({
				key: sCustomDataKey,
				value: sCustomDataValue
			});
		}
		const oSemanticObjectsModel: any = new JSONModel(aSemObjCustomData);
		oSemanticObjectsModel.$$valueAsPromise = true;
		const oSemObjBindingContext: any = oSemanticObjectsModel.createBindingContext("/");
		return oSemObjBindingContext;
	} else {
		return new JSONModel([]).createBindingContext("/");
	}
};

/**
 * Method to get MultipleLines for a DataField.
 *
 * @name getMultipleLinesForDataField
 * @param {any} oThis The current object
 * @param {string} sPropertyType The property type
 * @param {boolean} isMultiLineText The property isMultiLineText
 * @returns {CompiledBindingToolkitExpression<string>} The binding expression to determine if a data field should be a MultiLineText or not
 * @public
 */

export const getMultipleLinesForDataField = function (oThis: any, sPropertyType: string, isMultiLineText: boolean): any {
	if (oThis.wrap === false) {
		return false;
	}
	if (sPropertyType !== "Edm.String") {
		return isMultiLineText;
	}
	if (oThis.editMode === "Display") {
		return true;
	}
	if (oThis.editMode.indexOf("{") > -1) {
		// If the editMode is computed then we just care about the page editMode to determine if the multiline property should be taken into account
		return compileExpression(or(not(UI.IsEditable), isMultiLineText));
	}
	return isMultiLineText;
};

const _hasValueHelpToShow = function (oProperty: Property, measureDisplayMode: string | undefined): boolean | undefined {
	// we show a value help if teh property has one or if its visible unit has one
	const oPropertyUnit = PropertyHelper.getAssociatedUnitProperty(oProperty);
	const oPropertyCurrency = PropertyHelper.getAssociatedCurrencyProperty(oProperty);
	return (
		(PropertyHelper.hasValueHelp(oProperty) && oProperty.type !== "Edm.Boolean") ||
		(measureDisplayMode !== "Hidden" &&
			((oPropertyUnit && PropertyHelper.hasValueHelp(oPropertyUnit)) ||
				(oPropertyCurrency && PropertyHelper.hasValueHelp(oPropertyCurrency))))
	);
};

/**
 * Sets Edit Style properties for Field in case of Macro Field and MassEditDialog fields.
 *
 * @param oProps Field Properties for the Macro Field.
 * @param oDataField DataField Object.
 * @param oDataModelPath DataModel Object Path to the property.
 * @param onlyEditStyle To add only editStyle.
 */
export const setEditStyleProperties = function (
	oProps: FieldProperties,
	oDataField: any,
	oDataModelPath: DataModelObjectPath,
	onlyEditStyle?: boolean
): void {
	const oProperty = oDataModelPath.targetObject;
	if (!isProperty(oProperty)) {
		oProps.editStyle = null;
		return;
	}
	if (!onlyEditStyle) {
		oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions);
	}

	switch (oDataField.$Type) {
		case UIAnnotationTypes.DataFieldForAnnotation:
			if (oDataField.Target?.$target?.Visualization === "UI.VisualizationType/Rating") {
				oProps.editStyle = "RatingIndicator";
				return;
			}
			break;
		case UIAnnotationTypes.DataPointType:
			if (oDataField?.Visualization === "UI.VisualizationType/Rating") {
				oProps.editStyle = "RatingIndicator";
				return;
			}
			break;
		case UIAnnotationTypes.DataFieldForAction:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			oProps.editStyle = null;
			return;
		default:
	}
	if (_hasValueHelpToShow(oProperty, oProps.formatOptions?.measureDisplayMode)) {
		if (!onlyEditStyle) {
			oProps.textBindingExpression = getAssociatedTextBinding(oDataModelPath, oProps.formatOptions);
			if (oProps.formatOptions?.measureDisplayMode !== "Hidden") {
				// for the MDC Field we need to keep the unit inside the valueBindingExpression
				oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions, false, false, undefined, false, true);
			}
		}
		oProps.editStyle = "InputWithValueHelp";
		return;
	}

	switch (oProperty.type) {
		case "Edm.Date":
			oProps.editStyle = "DatePicker";
			return;
		case "Edm.Time":
		case "Edm.TimeOfDay":
			oProps.editStyle = "TimePicker";
			return;
		case "Edm.DateTime":
		case "Edm.DateTimeOffset":
			oProps.editStyle = "DateTimePicker";
			// No timezone defined. Also for compatibility reasons.
			if (!oProperty.annotations?.Common?.Timezone) {
				oProps.showTimezone = undefined;
			} else {
				oProps.showTimezone = true;
			}
			return;
		case "Edm.Boolean":
			oProps.editStyle = "CheckBox";
			return;
		case "Edm.Stream":
			oProps.editStyle = "File";
			return;
		case "Edm.String":
			if (oProperty.annotations?.UI?.MultiLineText?.valueOf()) {
				oProps.editStyle = "TextArea";
				if (!(onlyEditStyle ?? false)) {
					const textAreaPlaceholder =
						oDataField.annotations?.UI?.Placeholder || oDataField.Value?.$target?.annotations?.UI?.Placeholder;

					if (textAreaPlaceholder) {
						oProps.textAreaPlaceholder = compileExpression(getExpressionFromAnnotation(textAreaPlaceholder));
					}
				}
				return;
			}
			break;
		default:
			oProps.editStyle = "Input";
	}
	if (oProperty.annotations?.Measures?.ISOCurrency || oProperty.annotations?.Measures?.Unit) {
		if (!onlyEditStyle) {
			oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
			oProps.descriptionBindingExpression = UIFormatters.ifUnitEditable(
				oProperty,
				"",
				UIFormatters.getBindingForUnitOrCurrency(oDataModelPath)
			);
			const unitProperty =
				PropertyHelper.getAssociatedCurrencyProperty(oProperty) || PropertyHelper.getAssociatedUnitProperty(oProperty);
			oProps.unitEditable = compileExpression(not(isReadOnlyExpression(unitProperty)));
		}
		oProps.editStyle = "InputWithUnit";
		return;
	}

	oProps.editStyle = "Input";
};

export const hasSemanticObjectInNavigationOrProperty = (propertyDataModelObjectPath: DataModelObjectPath) => {
	const property = propertyDataModelObjectPath.targetObject as Property;
	if (SemanticObjectHelper.hasSemanticObject(property)) {
		return true;
	}
	const lastNavProp = propertyDataModelObjectPath?.navigationProperties?.length
		? propertyDataModelObjectPath?.navigationProperties[propertyDataModelObjectPath?.navigationProperties?.length - 1]
		: null;
	if (
		!lastNavProp ||
		propertyDataModelObjectPath.contextLocation?.navigationProperties?.find(
			(contextNavProp) => contextNavProp.name === lastNavProp.name
		)
	) {
		return false;
	}
	return SemanticObjectHelper.hasSemanticObject(lastNavProp);
};

/**
 * Get the dataModelObjectPath with the value property as targetObject if it exists
 * for a dataModelObjectPath targeting a DataField or a DataPoint annotation.
 *
 * @param initialDataModelObjectPath
 * @returns The dataModelObjectPath targetiing the value property or undefined
 */
export const getDataModelObjectPathForValue = (initialDataModelObjectPath: DataModelObjectPath): DataModelObjectPath | undefined => {
	if (!initialDataModelObjectPath.targetObject) {
		return undefined;
	}
	let valuePath = "";
	// data point annotations need not have $Type defined, so add it if missing
	if (initialDataModelObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.DataPoint") {
		initialDataModelObjectPath.targetObject.$Type = initialDataModelObjectPath.targetObject.$Type || UIAnnotationTypes.DataPointType;
	}
	switch (initialDataModelObjectPath.targetObject.$Type) {
		case UIAnnotationTypes.DataField:
		case UIAnnotationTypes.DataPointType:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
		case UIAnnotationTypes.DataFieldWithUrl:
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
		case UIAnnotationTypes.DataFieldWithAction:
			if (typeof initialDataModelObjectPath.targetObject.Value === "object") {
				valuePath = initialDataModelObjectPath.targetObject.Value.path;
			}
			break;
		case UIAnnotationTypes.DataFieldForAnnotation:
			if (initialDataModelObjectPath.targetObject.Target.$target) {
				if (
					initialDataModelObjectPath.targetObject.Target.$target.$Type === UIAnnotationTypes.DataField ||
					initialDataModelObjectPath.targetObject.Target.$target.$Type === UIAnnotationTypes.DataPointType
				) {
					if (initialDataModelObjectPath.targetObject.Target.value.indexOf("/") > 0) {
						valuePath = initialDataModelObjectPath.targetObject.Target.value.replace(
							/\/@.*/,
							`/${initialDataModelObjectPath.targetObject.Target.$target.Value?.path}`
						);
					} else {
						valuePath = initialDataModelObjectPath.targetObject.Target.$target.Value?.path;
					}
				} else {
					valuePath = initialDataModelObjectPath.targetObject.Target?.path;
				}
			}
			break;
	}

	if (valuePath && valuePath.length > 0) {
		return enhanceDataModelPath(initialDataModelObjectPath, valuePath);
	} else {
		return undefined;
	}
};

/**
 * Get the property or the navigation property in  its relative path that holds semanticObject annotation if it exists.
 *
 * @param dataModelObjectPath
 * @returns A property or a NavProperty or undefined
 */
export const getPropertyWithSemanticObject = (dataModelObjectPath: DataModelObjectPath) => {
	let propertyWithSemanticObject: Property | NavigationProperty | undefined;
	if (hasSemanticObject(dataModelObjectPath.targetObject as Property | NavigationProperty)) {
		propertyWithSemanticObject = dataModelObjectPath.targetObject as Property | NavigationProperty;
	} else if (dataModelObjectPath.navigationProperties.length > 0) {
		// there are no semantic objects on the property itself so we look for some on nav properties
		for (const navProperty of dataModelObjectPath.navigationProperties) {
			if (
				!dataModelObjectPath.contextLocation?.navigationProperties.find(
					(contextNavProp) => contextNavProp.fullyQualifiedName === navProperty.fullyQualifiedName
				) &&
				!propertyWithSemanticObject &&
				hasSemanticObject(navProperty)
			) {
				propertyWithSemanticObject = navProperty;
			}
		}
	}
	return propertyWithSemanticObject;
};
