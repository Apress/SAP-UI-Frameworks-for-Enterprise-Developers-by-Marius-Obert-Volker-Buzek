import { DataFieldAbstractTypes, UIAnnotationTypes, type DataFieldForAction } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { bindingContextPathVisitor } from "sap/fe/core/converters/helpers/BindingHelper";
import { getExpressionFromAnnotation, isPathInModelExpression } from "sap/fe/core/helpers/BindingToolkit";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import CommonHelper from "sap/fe/macros/CommonHelper";

const ActionHelper = {
	/**
	 * Returns an array of actions that are not enabled with a multiple selection.
	 *
	 * @function
	 * @name getMultiSelectDisabledActions
	 * @param collections Array of records
	 * @returns An array of action paths
	 * @ui5-restricted
	 */
	getMultiSelectDisabledActions(collections?: DataFieldAbstractTypes[]) {
		const multiSelectDisabledActions: string[] = [];
		const actions = (collections?.filter((collection) => collection.$Type === UIAnnotationTypes.DataFieldForAction) ??
			[]) as DataFieldForAction[];
		for (const action of actions) {
			const actionTarget = action?.ActionTarget;
			if (actionTarget?.isBound === true) {
				for (const parameter of actionTarget.parameters) {
					if (
						isPathAnnotationExpression(parameter.annotations.UI?.Hidden) ||
						isPathAnnotationExpression(parameter.annotations.Common?.FieldControl)
					) {
						multiSelectDisabledActions.push(actionTarget.name);
					}
				}
			}
		}

		return multiSelectDisabledActions;
	},

	/**
	 * Method to get the expression for the 'press' event for the DataFieldForActionButton.
	 *
	 * @function
	 * @name getPressEventDataFieldForActionButton
	 * @param sId Control ID
	 * @param oAction Action object
	 * @param oParams Parameters
	 * @param sOperationAvailableMap OperationAvailableMap as stringified JSON object
	 * @returns The binding expression
	 */
	getPressEventDataFieldForActionButton(sId: string, oAction: any, oParams: any, sOperationAvailableMap: string) {
		const sInvocationGrouping =
			oAction.InvocationGrouping &&
			oAction.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"
				? "ChangeSet"
				: "Isolated";
		oParams = oParams || {};
		oParams["invocationGrouping"] = CommonHelper.addSingleQuotes(sInvocationGrouping);
		oParams["controlId"] = CommonHelper.addSingleQuotes(sId);
		oParams["operationAvailableMap"] = CommonHelper.addSingleQuotes(sOperationAvailableMap);
		oParams["model"] = "${$source>/}.getModel()";
		oParams["label"] = oAction.Label && CommonHelper.addSingleQuotes(oAction.Label, true);

		return CommonHelper.generateFunction(
			".editFlow.invokeAction",
			CommonHelper.addSingleQuotes(oAction.Action),
			CommonHelper.objectToString(oParams)
		);
	},
	/**
	 * Return Number of contexts expression.
	 *
	 * @function
	 * @name getNumberOfContextsExpression
	 * @param vActionEnabled Status of action (single or multiselect)
	 * @returns Number of contexts expression
	 */
	getNumberOfContextsExpression(vActionEnabled: String) {
		let sNumberOfSelectedContexts;
		if (vActionEnabled === "single") {
			sNumberOfSelectedContexts = "${internal>numberOfSelectedContexts} === 1";
		} else {
			sNumberOfSelectedContexts = "${internal>numberOfSelectedContexts} > 0";
		}
		return sNumberOfSelectedContexts;
	},
	/**
	 * Return UI Control (LineItem/Chart) Operation Available Map.
	 *
	 * @function
	 * @name getOperationAvailableMap
	 * @param aCollection Array of records
	 * @param sControl Control name (lineItem / chart)
	 * @param oContext Converter context
	 * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
	 */
	getOperationAvailableMap(aCollection: any, sControl: string, oContext: any): Record<string, any> {
		let oOperationAvailableMap: Record<string, any> = {};
		if (aCollection) {
			aCollection.forEach((oRecord: any) => {
				if (oRecord.$Type === UIAnnotationTypes.DataFieldForAction) {
					if (oRecord.$Type === UIAnnotationTypes.DataFieldForAction) {
						const actionName = oRecord.Action as string;
						if (actionName?.indexOf("/") < 0 && !oRecord.Determining) {
							if (sControl === "table") {
								oOperationAvailableMap = this._getOperationAvailableMapOfTable(
									oRecord,
									actionName,
									oOperationAvailableMap,
									oContext
								);
							} else if (sControl === "chart") {
								oOperationAvailableMap = this._getOperationAvailableMapOfChart(
									actionName,
									oOperationAvailableMap,
									oContext
								);
							}
						}
					}
				}
			});
		}
		return oOperationAvailableMap;
	},

	/**
	 * Return LineItem Action Operation Available Map.
	 *
	 * @function
	 * @name _getOperationAvailableMapOfTable
	 * @private
	 * @param oDataFieldForAction Data field for action object
	 * @param sActionName Action name
	 * @param oOperationAvailableMap Operation available map object
	 * @param oConverterContext Converter context object
	 * @returns The record containing all action name of line item and the corresponding Core.OperationAvailable property path
	 */
	_getOperationAvailableMapOfTable(
		oDataFieldForAction: DataFieldForAction,
		sActionName: string,
		oOperationAvailableMap: Record<string, any>,
		oConverterContext: ConverterContext
	) {
		const actionTarget = oDataFieldForAction.ActionTarget;
		if (actionTarget?.annotations?.Core?.OperationAvailable === null) {
			// We disabled action advertisement but kept it in the code for the time being
			//oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
		} else if (actionTarget?.parameters?.length) {
			const bindingParameterFullName = actionTarget.parameters[0].fullyQualifiedName,
				targetExpression = getExpressionFromAnnotation(
					actionTarget?.annotations?.Core?.OperationAvailable,
					[],
					undefined,
					(path: string) => bindingContextPathVisitor(path, oConverterContext, bindingParameterFullName)
				);
			if (isPathInModelExpression(targetExpression)) {
				oOperationAvailableMap = this._addToMap(sActionName, targetExpression.path, oOperationAvailableMap);
			} else if (actionTarget?.annotations?.Core?.OperationAvailable !== undefined) {
				oOperationAvailableMap = this._addToMap(sActionName, targetExpression, oOperationAvailableMap);
			}
		}
		return oOperationAvailableMap;
	},

	/**
	 * Return LineItem Action Operation Available Map.
	 *
	 * @function
	 * @name _getOperationAvailableMapOfChart
	 * @private
	 * @param sActionName Action name
	 * @param oOperationAvailableMap Operation available map object
	 * @param oContext Context object
	 * @returns The record containing all action name of chart and the corresponding Core.OperationAvailable property path
	 */
	_getOperationAvailableMapOfChart(sActionName: string, oOperationAvailableMap: Record<string, any>, oContext: any) {
		let oResult = CommonHelper.getActionPath(oContext.context, false, sActionName, true);
		if (oResult === null) {
			oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
		} else {
			oResult = CommonHelper.getActionPath(oContext.context, false, sActionName);
			if (oResult.sProperty) {
				oOperationAvailableMap = this._addToMap(
					sActionName,
					oResult.sProperty.substr(oResult.sBindingParameter.length + 1),
					oOperationAvailableMap
				);
			}
		}
		return oOperationAvailableMap;
	},

	/**
	 * Return Map.
	 *
	 * @function
	 * @name _addToMap
	 * @private
	 * @param sKey Key
	 * @param oValue Value
	 * @param oMap Map object
	 * @returns Map object
	 */
	_addToMap(sKey: string, oValue: any, oMap: Record<string, any>) {
		if (sKey && oMap) {
			oMap[sKey] = oValue;
		}
		return oMap;
	}
};

export default ActionHelper;
