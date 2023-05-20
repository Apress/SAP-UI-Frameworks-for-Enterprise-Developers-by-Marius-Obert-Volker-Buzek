import type { Property } from "@sap-ux/vocabularies-types";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	compileExpression,
	formatResult,
	formatWithTypeInformation,
	getExpressionFromAnnotation,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getContextRelativeTargetObjectPath, getRelativePaths } from "sap/fe/core/templating/DataModelPathHelper";
import type * as DisplayModeFormatter from "sap/fe/core/templating/DisplayModeFormatter";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import { isReferencePropertyStaticallyHidden } from "../converters/helpers/DataFieldHelper";
export type DisplayMode = DisplayModeFormatter.DisplayMode;

// Import-export methods related to the common annotations used by the converter to use them in the templating through the Common Formatters.

/**
 * Retrieves the expressionBinding created out of a binding expression.
 *
 * @param expression The expression which needs to be compiled
 * @returns The expression-binding string
 */
export const getExpressionBinding = function (expression: BindingToolkitExpression<any>): CompiledBindingToolkitExpression {
	return compileExpression(expression);
};
export const getBindingWithTextArrangement = function (
	oPropertyDataModelPath: DataModelObjectPath,
	propertyBindingExpression: BindingToolkitExpression<string>,
	fieldFormatOptions?: { displayMode?: DisplayMode }
): BindingToolkitExpression<string> {
	const targetDisplayModeOverride = fieldFormatOptions?.displayMode;
	let outExpression = propertyBindingExpression;
	const oPropertyDefinition =
		oPropertyDataModelPath.targetObject.type === "PropertyPath"
			? (oPropertyDataModelPath.targetObject.$target as Property)
			: (oPropertyDataModelPath.targetObject as Property);
	const targetDisplayMode = targetDisplayModeOverride || UIFormatters.getDisplayMode(oPropertyDataModelPath);
	const commonText = oPropertyDefinition.annotations?.Common?.Text;
	const relativeLocation = getRelativePaths(oPropertyDataModelPath);
	propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
	if (targetDisplayMode !== "Value" && commonText) {
		switch (targetDisplayMode) {
			case "Description":
				outExpression = getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>;
				break;
			case "DescriptionValue":
				outExpression = formatResult(
					[
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>,
						propertyBindingExpression
					],
					valueFormatters.formatWithBrackets
				);
				break;
			case "ValueDescription":
				outExpression = formatResult(
					[
						propertyBindingExpression,
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					],
					valueFormatters.formatWithBrackets
				);
				break;
		}
	}
	return outExpression;
};
export const getBindingWithText = function (targetDataModelPath: DataModelObjectPath): CompiledBindingToolkitExpression {
	let propertyDataModelPath = targetDataModelPath;
	if (isPathAnnotationExpression(targetDataModelPath?.targetObject)) {
		propertyDataModelPath = enhanceDataModelPath(targetDataModelPath, targetDataModelPath.targetObject?.path);
	}
	const propertyDefinition = propertyDataModelPath.targetObject as Property;

	let propertyBindingExpression = pathInModel(
		getContextRelativeTargetObjectPath(propertyDataModelPath)
	) as BindingToolkitExpression<string>;

	propertyBindingExpression = formatWithTypeInformation(propertyDefinition, propertyBindingExpression, true);
	const textArrangementBinding = getBindingWithTextArrangement(propertyDataModelPath, propertyBindingExpression);
	return ((propertyDefinition.annotations.UI &&
		!isReferencePropertyStaticallyHidden(propertyDefinition.annotations.UI.DataFieldDefault) &&
		compileExpression(textArrangementBinding)) ||
		undefined) as CompiledBindingToolkitExpression;
};
