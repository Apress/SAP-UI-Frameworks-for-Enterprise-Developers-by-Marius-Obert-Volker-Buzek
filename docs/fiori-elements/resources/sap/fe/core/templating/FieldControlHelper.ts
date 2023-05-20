import type { Property } from "@sap-ux/vocabularies-types";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { constant, equal, getExpressionFromAnnotation, or } from "sap/fe/core/helpers/BindingToolkit";

/**
 * Create the binding expression to check if the property is read only or not.
 *
 * @param oTarget The target property or DataField
 * @param relativePath Array of navigation properties pointing to the location of field control property
 * @returns The binding expression resolving to a Boolean being true if it's read only
 */
export const isReadOnlyExpression = function (oTarget: Property | undefined, relativePath?: string[]): BindingToolkitExpression<boolean> {
	const oFieldControlValue = oTarget?.annotations?.Common?.FieldControl?.valueOf();
	if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
		return or(
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 1),
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "1")
		);
	}
	return constant(oFieldControlValue === "Common.FieldControlType/ReadOnly");
};

/**
 * Create the binding expression to check if the property is disabled or not.
 *
 * @param oTarget The target property or DataField
 * @param relativePath Array of navigation properties pointing to the location of field control property
 * @returns The binding expression resolving to a Boolean being true if it's disabled
 */
export const isDisabledExpression = function (oTarget: Property, relativePath?: string[]): BindingToolkitExpression<boolean> {
	const oFieldControlValue = oTarget?.annotations?.Common?.FieldControl?.valueOf();
	if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
		return or(
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 0),
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "0")
		);
	}
	return constant(oFieldControlValue === "Common.FieldControlType/Inapplicable");
};

/**
 * Create the binding expression to check if the property is editable or not.
 *
 * @param oTarget The target property or DataField
 * @param relativePath Array of navigation properties pointing to the location of field control property
 * @returns The binding expression resolving to a Boolean being true if it's not editable
 */
export const isNonEditableExpression = function (oTarget: Property, relativePath?: string[]): BindingToolkitExpression<boolean> {
	return or(isReadOnlyExpression(oTarget, relativePath), isDisabledExpression(oTarget, relativePath));
};

/**
 * Create the binding expression to check if the property is read only or not.
 *
 * @param oTarget The target property or DataField
 * @param relativePath Array of navigation properties pointing to the location of field control property
 * @returns The binding expression resolving to a Boolean being true if it's read only
 */
export const isRequiredExpression = function (oTarget: Property, relativePath?: string[]): BindingToolkitExpression<boolean> {
	const oFieldControlValue = oTarget?.annotations?.Common?.FieldControl?.valueOf();
	if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
		return or(
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 7),
			equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "7")
		);
	}
	return constant(oFieldControlValue === "Common.FieldControlType/Mandatory");
};
