import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { and, compileExpression, constant, equal, not, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";

/**
 * Method to compute the headerVisible property.
 *
 * @param oProps Object containing the table properties
 * @returns Expression binding for headerVisible
 */
export const buildExpressionForHeaderVisible = (oProps: any): CompiledBindingToolkitExpression => {
	const headerBindingExpression = resolveBindingString(oProps?.header);
	const tabTileBindingExpression = resolveBindingString(oProps?.tabTitle);
	const headerVisibleBindingExpression = constant(oProps.headerVisible);
	return compileExpression(and(headerVisibleBindingExpression, not(equal(headerBindingExpression, tabTileBindingExpression))));
};
