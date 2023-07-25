import type { BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import { ObjectPageDefinition } from "sap/fe/core/converters/templates/ObjectPageConverter";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	getEditCommandExecutionEnabled,
	getEditCommandExecutionVisible,
	getPressExpressionForPrimaryAction
} from "sap/fe/templates/ObjectPage/ObjectPageTemplating";

export type FinalPageDefinition = ObjectPageDefinition & {
	primaryAction: string;
};

export const extendObjectPageDefinition = function (
	pageDefinition: ObjectPageDefinition,
	converterContext: ConverterContext
): FinalPageDefinition {
	const convertedPageDefinition = pageDefinition as FinalPageDefinition;
	convertedPageDefinition.primaryAction = getPrimaryAction(converterContext, pageDefinition.header.actions, pageDefinition.footerActions);
	return convertedPageDefinition;
};

/**
 * Method to get the expression for the execute event of the forward action.
 * Generates primaryActionExpression to be executed on the keyboard shortcut Ctrl+Enter with the
 * forward flow (priority is the semantic positive action OR if that's not there, then the primary action).
 *
 * @param converterContext The converter context
 * @param headerActions An array containing all the actions for this ObjectPage header
 * @param footerActions An array containing all the actions for this ObjectPage footer
 * @returns  Binding expression or function string
 */
export const getPrimaryAction = function (
	converterContext: ConverterContext,
	headerActions: BaseAction[],
	footerActions: BaseAction[]
): string {
	let primaryActionExpression = "";
	const aActions = [...headerActions, ...footerActions];

	const getBindingExp = function (sExpression: CompiledBindingToolkitExpression | string) {
		if (sExpression && sExpression.indexOf("{=") > -1) {
			return sExpression.replace("{=", "(").slice(0, -1) + ")";
		}
		return sExpression;
	};
	const aSemanticPositiveActions = aActions.filter((oAction) => {
		if (oAction?.annotationPath) {
			const targetObject = converterContext.getConverterContextFor(oAction?.annotationPath).getDataModelObjectPath().targetObject;
			if (targetObject?.Criticality && targetObject?.Criticality === "UI.CriticalityType/Positive") {
				return true;
			}
		}
	});
	const oEntitySet = converterContext.getEntitySet();
	if (aSemanticPositiveActions.length > 0) {
		primaryActionExpression = getPressExpressionForPrimaryAction(
			aSemanticPositiveActions[0].annotationPath &&
				converterContext.getConverterContextFor(aSemanticPositiveActions[0].annotationPath).getDataModelObjectPath().targetObject,
			oEntitySet?.name,
			aSemanticPositiveActions[0],
			getBindingExp(aSemanticPositiveActions[0].visible ?? "true"),
			getBindingExp(aSemanticPositiveActions[0].enabled ?? "true"),
			getBindingExp(getEditCommandExecutionVisible(headerActions)),
			getBindingExp(getEditCommandExecutionEnabled(headerActions))
		);
	} else {
		primaryActionExpression = getPressExpressionForPrimaryAction(
			null,
			oEntitySet?.name,
			null,
			"false",
			"false",
			getBindingExp(getEditCommandExecutionVisible(headerActions)),
			getBindingExp(getEditCommandExecutionEnabled(headerActions))
		);
	}
	return primaryActionExpression;
};
