/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/macros/CommonHelper"], function (BindingHelper, BindingToolkit, TypeGuards, CommonHelper) {
  "use strict";

  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var bindingContextPathVisitor = BindingHelper.bindingContextPathVisitor;
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
    getMultiSelectDisabledActions(collections) {
      const multiSelectDisabledActions = [];
      const actions = (collections === null || collections === void 0 ? void 0 : collections.filter(collection => collection.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction")) ?? [];
      for (const action of actions) {
        const actionTarget = action === null || action === void 0 ? void 0 : action.ActionTarget;
        if ((actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound) === true) {
          for (const parameter of actionTarget.parameters) {
            var _parameter$annotation, _parameter$annotation2;
            if (isPathAnnotationExpression((_parameter$annotation = parameter.annotations.UI) === null || _parameter$annotation === void 0 ? void 0 : _parameter$annotation.Hidden) || isPathAnnotationExpression((_parameter$annotation2 = parameter.annotations.Common) === null || _parameter$annotation2 === void 0 ? void 0 : _parameter$annotation2.FieldControl)) {
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
    getPressEventDataFieldForActionButton(sId, oAction, oParams, sOperationAvailableMap) {
      const sInvocationGrouping = oAction.InvocationGrouping && oAction.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
      oParams = oParams || {};
      oParams["invocationGrouping"] = CommonHelper.addSingleQuotes(sInvocationGrouping);
      oParams["controlId"] = CommonHelper.addSingleQuotes(sId);
      oParams["operationAvailableMap"] = CommonHelper.addSingleQuotes(sOperationAvailableMap);
      oParams["model"] = "${$source>/}.getModel()";
      oParams["label"] = oAction.Label && CommonHelper.addSingleQuotes(oAction.Label, true);
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oAction.Action), CommonHelper.objectToString(oParams));
    },
    /**
     * Return Number of contexts expression.
     *
     * @function
     * @name getNumberOfContextsExpression
     * @param vActionEnabled Status of action (single or multiselect)
     * @returns Number of contexts expression
     */
    getNumberOfContextsExpression(vActionEnabled) {
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
    getOperationAvailableMap(aCollection, sControl, oContext) {
      let oOperationAvailableMap = {};
      if (aCollection) {
        aCollection.forEach(oRecord => {
          if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
            if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
              const actionName = oRecord.Action;
              if ((actionName === null || actionName === void 0 ? void 0 : actionName.indexOf("/")) < 0 && !oRecord.Determining) {
                if (sControl === "table") {
                  oOperationAvailableMap = this._getOperationAvailableMapOfTable(oRecord, actionName, oOperationAvailableMap, oContext);
                } else if (sControl === "chart") {
                  oOperationAvailableMap = this._getOperationAvailableMapOfChart(actionName, oOperationAvailableMap, oContext);
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
    _getOperationAvailableMapOfTable(oDataFieldForAction, sActionName, oOperationAvailableMap, oConverterContext) {
      var _actionTarget$annotat, _actionTarget$annotat2, _actionTarget$paramet;
      const actionTarget = oDataFieldForAction.ActionTarget;
      if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat = actionTarget.annotations) === null || _actionTarget$annotat === void 0 ? void 0 : (_actionTarget$annotat2 = _actionTarget$annotat.Core) === null || _actionTarget$annotat2 === void 0 ? void 0 : _actionTarget$annotat2.OperationAvailable) === null) {
        // We disabled action advertisement but kept it in the code for the time being
        //oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
      } else if (actionTarget !== null && actionTarget !== void 0 && (_actionTarget$paramet = actionTarget.parameters) !== null && _actionTarget$paramet !== void 0 && _actionTarget$paramet.length) {
        var _actionTarget$annotat3, _actionTarget$annotat4, _actionTarget$annotat5, _actionTarget$annotat6;
        const bindingParameterFullName = actionTarget.parameters[0].fullyQualifiedName,
          targetExpression = getExpressionFromAnnotation(actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat3 = actionTarget.annotations) === null || _actionTarget$annotat3 === void 0 ? void 0 : (_actionTarget$annotat4 = _actionTarget$annotat3.Core) === null || _actionTarget$annotat4 === void 0 ? void 0 : _actionTarget$annotat4.OperationAvailable, [], undefined, path => bindingContextPathVisitor(path, oConverterContext, bindingParameterFullName));
        if (isPathInModelExpression(targetExpression)) {
          oOperationAvailableMap = this._addToMap(sActionName, targetExpression.path, oOperationAvailableMap);
        } else if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat5 = actionTarget.annotations) === null || _actionTarget$annotat5 === void 0 ? void 0 : (_actionTarget$annotat6 = _actionTarget$annotat5.Core) === null || _actionTarget$annotat6 === void 0 ? void 0 : _actionTarget$annotat6.OperationAvailable) !== undefined) {
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
    _getOperationAvailableMapOfChart(sActionName, oOperationAvailableMap, oContext) {
      let oResult = CommonHelper.getActionPath(oContext.context, false, sActionName, true);
      if (oResult === null) {
        oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
      } else {
        oResult = CommonHelper.getActionPath(oContext.context, false, sActionName);
        if (oResult.sProperty) {
          oOperationAvailableMap = this._addToMap(sActionName, oResult.sProperty.substr(oResult.sBindingParameter.length + 1), oOperationAvailableMap);
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
    _addToMap(sKey, oValue, oMap) {
      if (sKey && oMap) {
        oMap[sKey] = oValue;
      }
      return oMap;
    }
  };
  return ActionHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb25IZWxwZXIiLCJnZXRNdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucyIsImNvbGxlY3Rpb25zIiwibXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMiLCJhY3Rpb25zIiwiZmlsdGVyIiwiY29sbGVjdGlvbiIsIiRUeXBlIiwiYWN0aW9uIiwiYWN0aW9uVGFyZ2V0IiwiQWN0aW9uVGFyZ2V0IiwiaXNCb3VuZCIsInBhcmFtZXRlciIsInBhcmFtZXRlcnMiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsImFubm90YXRpb25zIiwiVUkiLCJIaWRkZW4iLCJDb21tb24iLCJGaWVsZENvbnRyb2wiLCJwdXNoIiwibmFtZSIsImdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJzSWQiLCJvQWN0aW9uIiwib1BhcmFtcyIsInNPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzSW52b2NhdGlvbkdyb3VwaW5nIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwiJEVudW1NZW1iZXIiLCJDb21tb25IZWxwZXIiLCJhZGRTaW5nbGVRdW90ZXMiLCJMYWJlbCIsImdlbmVyYXRlRnVuY3Rpb24iLCJBY3Rpb24iLCJvYmplY3RUb1N0cmluZyIsImdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uIiwidkFjdGlvbkVuYWJsZWQiLCJzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYUNvbGxlY3Rpb24iLCJzQ29udHJvbCIsIm9Db250ZXh0Iiwib09wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImZvckVhY2giLCJvUmVjb3JkIiwiYWN0aW9uTmFtZSIsImluZGV4T2YiLCJEZXRlcm1pbmluZyIsIl9nZXRPcGVyYXRpb25BdmFpbGFibGVNYXBPZlRhYmxlIiwiX2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mQ2hhcnQiLCJvRGF0YUZpZWxkRm9yQWN0aW9uIiwic0FjdGlvbk5hbWUiLCJvQ29udmVydGVyQ29udGV4dCIsIkNvcmUiLCJPcGVyYXRpb25BdmFpbGFibGUiLCJsZW5ndGgiLCJiaW5kaW5nUGFyYW1ldGVyRnVsbE5hbWUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJ0YXJnZXRFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwidW5kZWZpbmVkIiwicGF0aCIsImJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IiLCJpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbiIsIl9hZGRUb01hcCIsIm9SZXN1bHQiLCJnZXRBY3Rpb25QYXRoIiwiY29udGV4dCIsInNQcm9wZXJ0eSIsInN1YnN0ciIsInNCaW5kaW5nUGFyYW1ldGVyIiwic0tleSIsIm9WYWx1ZSIsIm9NYXAiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFjdGlvbkhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBVSUFubm90YXRpb25UeXBlcywgdHlwZSBEYXRhRmllbGRGb3JBY3Rpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuXG5jb25zdCBBY3Rpb25IZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFjdGlvbnMgdGhhdCBhcmUgbm90IGVuYWJsZWQgd2l0aCBhIG11bHRpcGxlIHNlbGVjdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zXG5cdCAqIEBwYXJhbSBjb2xsZWN0aW9ucyBBcnJheSBvZiByZWNvcmRzXG5cdCAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGFjdGlvbiBwYXRoc1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zKGNvbGxlY3Rpb25zPzogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1tdKSB7XG5cdFx0Y29uc3QgbXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM6IHN0cmluZ1tdID0gW107XG5cdFx0Y29uc3QgYWN0aW9ucyA9IChjb2xsZWN0aW9ucz8uZmlsdGVyKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pID8/XG5cdFx0XHRbXSkgYXMgRGF0YUZpZWxkRm9yQWN0aW9uW107XG5cdFx0Zm9yIChjb25zdCBhY3Rpb24gb2YgYWN0aW9ucykge1xuXHRcdFx0Y29uc3QgYWN0aW9uVGFyZ2V0ID0gYWN0aW9uPy5BY3Rpb25UYXJnZXQ7XG5cdFx0XHRpZiAoYWN0aW9uVGFyZ2V0Py5pc0JvdW5kID09PSB0cnVlKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIGFjdGlvblRhcmdldC5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0aXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ocGFyYW1ldGVyLmFubm90YXRpb25zLlVJPy5IaWRkZW4pIHx8XG5cdFx0XHRcdFx0XHRpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihwYXJhbWV0ZXIuYW5ub3RhdGlvbnMuQ29tbW9uPy5GaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRtdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucy5wdXNoKGFjdGlvblRhcmdldC5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSAncHJlc3MnIGV2ZW50IGZvciB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKiBAcGFyYW0gc0lkIENvbnRyb2wgSURcblx0ICogQHBhcmFtIG9BY3Rpb24gQWN0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0gb1BhcmFtcyBQYXJhbWV0ZXJzXG5cdCAqIEBwYXJhbSBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwIE9wZXJhdGlvbkF2YWlsYWJsZU1hcCBhcyBzdHJpbmdpZmllZCBKU09OIG9iamVjdFxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKHNJZDogc3RyaW5nLCBvQWN0aW9uOiBhbnksIG9QYXJhbXM6IGFueSwgc09wZXJhdGlvbkF2YWlsYWJsZU1hcDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgc0ludm9jYXRpb25Hcm91cGluZyA9XG5cdFx0XHRvQWN0aW9uLkludm9jYXRpb25Hcm91cGluZyAmJlxuXHRcdFx0b0FjdGlvbi5JbnZvY2F0aW9uR3JvdXBpbmcuJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiXG5cdFx0XHRcdD8gXCJDaGFuZ2VTZXRcIlxuXHRcdFx0XHQ6IFwiSXNvbGF0ZWRcIjtcblx0XHRvUGFyYW1zID0gb1BhcmFtcyB8fCB7fTtcblx0XHRvUGFyYW1zW1wiaW52b2NhdGlvbkdyb3VwaW5nXCJdID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwaW5nKTtcblx0XHRvUGFyYW1zW1wiY29udHJvbElkXCJdID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSWQpO1xuXHRcdG9QYXJhbXNbXCJvcGVyYXRpb25BdmFpbGFibGVNYXBcIl0gPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNPcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdG9QYXJhbXNbXCJtb2RlbFwiXSA9IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIjtcblx0XHRvUGFyYW1zW1wibGFiZWxcIl0gPSBvQWN0aW9uLkxhYmVsICYmIENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0FjdGlvbi5MYWJlbCwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXG5cdFx0XHRcIi5lZGl0Rmxvdy5pbnZva2VBY3Rpb25cIixcblx0XHRcdENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0FjdGlvbi5BY3Rpb24pLFxuXHRcdFx0Q29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpXG5cdFx0KTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybiBOdW1iZXIgb2YgY29udGV4dHMgZXhwcmVzc2lvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uXG5cdCAqIEBwYXJhbSB2QWN0aW9uRW5hYmxlZCBTdGF0dXMgb2YgYWN0aW9uIChzaW5nbGUgb3IgbXVsdGlzZWxlY3QpXG5cdCAqIEByZXR1cm5zIE51bWJlciBvZiBjb250ZXh0cyBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXROdW1iZXJPZkNvbnRleHRzRXhwcmVzc2lvbih2QWN0aW9uRW5hYmxlZDogU3RyaW5nKSB7XG5cdFx0bGV0IHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHM7XG5cdFx0aWYgKHZBY3Rpb25FbmFibGVkID09PSBcInNpbmdsZVwiKSB7XG5cdFx0XHRzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID0gXCIke2ludGVybmFsPm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gPT09IDFcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IFwiJHtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID4gMFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cztcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybiBVSSBDb250cm9sIChMaW5lSXRlbS9DaGFydCkgT3BlcmF0aW9uIEF2YWlsYWJsZSBNYXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRPcGVyYXRpb25BdmFpbGFibGVNYXBcblx0ICogQHBhcmFtIGFDb2xsZWN0aW9uIEFycmF5IG9mIHJlY29yZHNcblx0ICogQHBhcmFtIHNDb250cm9sIENvbnRyb2wgbmFtZSAobGluZUl0ZW0gLyBjaGFydClcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnZlcnRlciBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSByZWNvcmQgY29udGFpbmluZyBhbGwgYWN0aW9uIG5hbWVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzXG5cdCAqL1xuXHRnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoYUNvbGxlY3Rpb246IGFueSwgc0NvbnRyb2w6IHN0cmluZywgb0NvbnRleHQ6IGFueSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuXHRcdGxldCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdFx0aWYgKGFDb2xsZWN0aW9uKSB7XG5cdFx0XHRhQ29sbGVjdGlvbi5mb3JFYWNoKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKG9SZWNvcmQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbikge1xuXHRcdFx0XHRcdGlmIChvUmVjb3JkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFjdGlvbk5hbWUgPSBvUmVjb3JkLkFjdGlvbiBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0XHRpZiAoYWN0aW9uTmFtZT8uaW5kZXhPZihcIi9cIikgPCAwICYmICFvUmVjb3JkLkRldGVybWluaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzQ29udHJvbCA9PT0gXCJ0YWJsZVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRoaXMuX2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mVGFibGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRvUmVjb3JkLFxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dFxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoc0NvbnRyb2wgPT09IFwiY2hhcnRcIikge1xuXHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXAgPSB0aGlzLl9nZXRPcGVyYXRpb25BdmFpbGFibGVNYXBPZkNoYXJ0KFxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dFxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb09wZXJhdGlvbkF2YWlsYWJsZU1hcDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIExpbmVJdGVtIEFjdGlvbiBPcGVyYXRpb24gQXZhaWxhYmxlIE1hcC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9nZXRPcGVyYXRpb25BdmFpbGFibGVNYXBPZlRhYmxlXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkRm9yQWN0aW9uIERhdGEgZmllbGQgZm9yIGFjdGlvbiBvYmplY3Rcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIEFjdGlvbiBuYW1lXG5cdCAqIEBwYXJhbSBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIE9wZXJhdGlvbiBhdmFpbGFibGUgbWFwIG9iamVjdFxuXHQgKiBAcGFyYW0gb0NvbnZlcnRlckNvbnRleHQgQ29udmVydGVyIGNvbnRleHQgb2JqZWN0XG5cdCAqIEByZXR1cm5zIFRoZSByZWNvcmQgY29udGFpbmluZyBhbGwgYWN0aW9uIG5hbWUgb2YgbGluZSBpdGVtIGFuZCB0aGUgY29ycmVzcG9uZGluZyBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHRfZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwT2ZUYWJsZShcblx0XHRvRGF0YUZpZWxkRm9yQWN0aW9uOiBEYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRvT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRcdG9Db252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG5cdCkge1xuXHRcdGNvbnN0IGFjdGlvblRhcmdldCA9IG9EYXRhRmllbGRGb3JBY3Rpb24uQWN0aW9uVGFyZ2V0O1xuXHRcdGlmIChhY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGUgPT09IG51bGwpIHtcblx0XHRcdC8vIFdlIGRpc2FibGVkIGFjdGlvbiBhZHZlcnRpc2VtZW50IGJ1dCBrZXB0IGl0IGluIHRoZSBjb2RlIGZvciB0aGUgdGltZSBiZWluZ1xuXHRcdFx0Ly9vT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGhpcy5fYWRkVG9NYXAoc0FjdGlvbk5hbWUsIG51bGwsIG9PcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdH0gZWxzZSBpZiAoYWN0aW9uVGFyZ2V0Py5wYXJhbWV0ZXJzPy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGJpbmRpbmdQYXJhbWV0ZXJGdWxsTmFtZSA9IGFjdGlvblRhcmdldC5wYXJhbWV0ZXJzWzBdLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0dGFyZ2V0RXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRhY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGUsXG5cdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdChwYXRoOiBzdHJpbmcpID0+IGJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IocGF0aCwgb0NvbnZlcnRlckNvbnRleHQsIGJpbmRpbmdQYXJhbWV0ZXJGdWxsTmFtZSlcblx0XHRcdFx0KTtcblx0XHRcdGlmIChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbih0YXJnZXRFeHByZXNzaW9uKSkge1xuXHRcdFx0XHRvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGhpcy5fYWRkVG9NYXAoc0FjdGlvbk5hbWUsIHRhcmdldEV4cHJlc3Npb24ucGF0aCwgb09wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXAgPSB0aGlzLl9hZGRUb01hcChzQWN0aW9uTmFtZSwgdGFyZ2V0RXhwcmVzc2lvbiwgb09wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gTGluZUl0ZW0gQWN0aW9uIE9wZXJhdGlvbiBBdmFpbGFibGUgTWFwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mQ2hhcnRcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIEFjdGlvbiBuYW1lXG5cdCAqIEBwYXJhbSBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIE9wZXJhdGlvbiBhdmFpbGFibGUgbWFwIG9iamVjdFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvYmplY3Rcblx0ICogQHJldHVybnMgVGhlIHJlY29yZCBjb250YWluaW5nIGFsbCBhY3Rpb24gbmFtZSBvZiBjaGFydCBhbmQgdGhlIGNvcnJlc3BvbmRpbmcgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aFxuXHQgKi9cblx0X2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mQ2hhcnQoc0FjdGlvbk5hbWU6IHN0cmluZywgb09wZXJhdGlvbkF2YWlsYWJsZU1hcDogUmVjb3JkPHN0cmluZywgYW55Piwgb0NvbnRleHQ6IGFueSkge1xuXHRcdGxldCBvUmVzdWx0ID0gQ29tbW9uSGVscGVyLmdldEFjdGlvblBhdGgob0NvbnRleHQuY29udGV4dCwgZmFsc2UsIHNBY3Rpb25OYW1lLCB0cnVlKTtcblx0XHRpZiAob1Jlc3VsdCA9PT0gbnVsbCkge1xuXHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRoaXMuX2FkZFRvTWFwKHNBY3Rpb25OYW1lLCBudWxsLCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Jlc3VsdCA9IENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9Db250ZXh0LmNvbnRleHQsIGZhbHNlLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHRpZiAob1Jlc3VsdC5zUHJvcGVydHkpIHtcblx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRoaXMuX2FkZFRvTWFwKFxuXHRcdFx0XHRcdHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRcdG9SZXN1bHQuc1Byb3BlcnR5LnN1YnN0cihvUmVzdWx0LnNCaW5kaW5nUGFyYW1ldGVyLmxlbmd0aCArIDEpLFxuXHRcdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9PcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBNYXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfYWRkVG9NYXBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHNLZXkgS2V5XG5cdCAqIEBwYXJhbSBvVmFsdWUgVmFsdWVcblx0ICogQHBhcmFtIG9NYXAgTWFwIG9iamVjdFxuXHQgKiBAcmV0dXJucyBNYXAgb2JqZWN0XG5cdCAqL1xuXHRfYWRkVG9NYXAoc0tleTogc3RyaW5nLCBvVmFsdWU6IGFueSwgb01hcDogUmVjb3JkPHN0cmluZywgYW55Pikge1xuXHRcdGlmIChzS2V5ICYmIG9NYXApIHtcblx0XHRcdG9NYXBbc0tleV0gPSBvVmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBvTWFwO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25IZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBT0EsTUFBTUEsWUFBWSxHQUFHO0lBQ3BCO0FB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