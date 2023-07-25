/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/helpers/ActionHelper", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, DataVisualization, CommonHelper, ActionHelper, JSONModel, ODataModelAnnotationHelper) {
  "use strict";

  var getUiControl = DataVisualization.getUiControl;
  function getEntitySetPath(annotationContext) {
    return annotationContext.getPath().replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant).*/, "");
  }
  var ChartTypeEnum;
  (function (ChartTypeEnum) {
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Column"] = "column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/ColumnStacked"] = "stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/ColumnDual"] = "dual_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual"] = "dual_stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100"] = "100_stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100"] = "100_dual_stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Bar"] = "bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/BarStacked"] = "stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/BarDual"] = "dual_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/BarStackedDual"] = "dual_stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/BarStacked100"] = "100_stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100"] = "100_dual_stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Area"] = "area";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/AreaStacked"] = "stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/AreaStacked100"] = "100_stacked_column";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalArea"] = "bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked"] = "stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100"] = "100_stacked_bar";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Line"] = "line";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/LineDual"] = "dual_line";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Combination"] = "combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/CombinationStacked"] = "stacked_combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/CombinationDual"] = "dual_combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual"] = "dual_stacked_combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked"] = "horizontal_stacked_combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Pie"] = "pie";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Donut"] = "donut";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Scatter"] = "scatter";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Bubble"] = "bubble";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Radar"] = "line";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HeatMap"] = "heatmap";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/TreeMap"] = "treemap";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Waterfall"] = "waterfall";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/Bullet"] = "bullet";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/VerticalBullet"] = "vertical_bullet";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalWaterfall"] = "horizontal_waterfall";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationDual"] = "dual_horizontal_combination";
    ChartTypeEnum["com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStackedDual"] = "dual_horizontal_stacked_combination";
  })(ChartTypeEnum || (ChartTypeEnum = {}));
  var DimensionRoleTypeEnum;
  /**
   * Helper class for sap.fe.macros Chart phantom control for preprocessing.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API/behaviour is not finalised
   * and hence this should not be used for productive usage.
   * Especially this class is not intended to be used for the FE scenario,
   * here we shall use sap.fe.macros.ChartHelper that is especially tailored for V4
   * meta model
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.62.0
   * @alias sap.fe.macros.ChartHelper
   */
  (function (DimensionRoleTypeEnum) {
    DimensionRoleTypeEnum["com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category"] = "category";
    DimensionRoleTypeEnum["com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series"] = "series";
    DimensionRoleTypeEnum["com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category2"] = "category2";
  })(DimensionRoleTypeEnum || (DimensionRoleTypeEnum = {}));
  const ChartHelper = {
    formatJSONToString(crit) {
      if (!crit) {
        return undefined;
      }
      let criticality = JSON.stringify(crit);
      criticality = criticality.replace(new RegExp("{", "g"), "\\{");
      criticality = criticality.replace(new RegExp("}", "g"), "\\}");
      return criticality;
    },
    formatChartType(chartType) {
      return ChartTypeEnum[chartType === null || chartType === void 0 ? void 0 : chartType.$EnumMember];
    },
    formatDimensions(annotationContext) {
      const annotation = annotationContext.getObject("./"),
        metaModel = annotationContext.getModel(),
        entitySetPath = getEntitySetPath(annotationContext),
        dimensions = [];
      let isNavigationText = false;

      //perhaps there are no dimension
      annotation.DimensionAttributes = annotation.DimensionAttributes || [];
      for (const dimension of annotation.Dimensions) {
        const key = dimension.$PropertyPath;
        const text = metaModel.getObject(`${entitySetPath + key}@${"com.sap.vocabularies.Common.v1.Text"}`) || {};
        if (key.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Dimension: ${key} from an association cannot be used`);
        }
        if (text.$Path && text.$Path.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Text Property: ${text.$Path} from an association cannot be used for the dimension ${key}`);
          isNavigationText = true;
        }
        const chartDimension = {
          key: key,
          textPath: !isNavigationText ? text.$Path : undefined,
          label: metaModel.getObject(`${entitySetPath + key}@${"com.sap.vocabularies.Common.v1.Label"}`),
          role: "category"
        };
        for (const attribute of annotation.DimensionAttributes) {
          var _attribute$Dimension;
          if (chartDimension.key === ((_attribute$Dimension = attribute.Dimension) === null || _attribute$Dimension === void 0 ? void 0 : _attribute$Dimension.$PropertyPath)) {
            var _attribute$Role;
            chartDimension.role = DimensionRoleTypeEnum[(_attribute$Role = attribute.Role) === null || _attribute$Role === void 0 ? void 0 : _attribute$Role.$EnumMember] || chartDimension.role;
            break;
          }
        }
        chartDimension.criticality = this.fetchCriticality(metaModel, metaModel.createBindingContext(entitySetPath + key)).then(this.formatJSONToString);
        dimensions.push(chartDimension);
      }
      const dimensionModel = new JSONModel(dimensions);
      dimensionModel.$$valueAsPromise = true;
      return dimensionModel.createBindingContext("/");
    },
    fetchCriticality(oMetaModel, oCtx) {
      const UI = "@com.sap.vocabularies.UI.v1";
      return oMetaModel.requestObject(`${UI}.ValueCriticality`, oCtx).then(function (aValueCriticality) {
        let oCriticality, oValueCriticality;
        if (aValueCriticality) {
          oCriticality = {
            VeryPositive: [],
            Positive: [],
            Critical: [],
            VeryNegative: [],
            Negative: [],
            Neutral: []
          };
          for (let i = 0; i < aValueCriticality.length; i++) {
            oValueCriticality = aValueCriticality[i];
            if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryPositive")) {
              oCriticality.VeryPositive.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Positive")) {
              oCriticality.Positive.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Critical")) {
              oCriticality.Critical.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryNegative")) {
              oCriticality.VeryNegative.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Negative")) {
              oCriticality.Negative.push(oValueCriticality.Value);
            } else {
              oCriticality.Neutral.push(oValueCriticality.Value);
            }
          }
          for (const sKey in oCriticality) {
            if (oCriticality[sKey].length == 0) {
              delete oCriticality[sKey];
            }
          }
        }
        return oCriticality;
      });
    },
    formatMeasures(annotationContext) {
      return annotationContext.getModel().getData();
    },
    getUiChart(presentationContext) {
      return getUiControl(presentationContext, `@${"com.sap.vocabularies.UI.v1.Chart"}`);
    },
    getOperationAvailableMap(chart, contextContext) {
      const chartCollection = (chart === null || chart === void 0 ? void 0 : chart.Actions) || [];
      return JSON.stringify(ActionHelper.getOperationAvailableMap(chartCollection, "chart", contextContext));
    },
    /**
     * Returns a stringified JSON object containing Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation Variant annotation
     * @param sPresentationVariantPath
     * @param oApplySupported
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath, oApplySupported) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        const aSortConditions = {
          sorters: []
        };
        const sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          let oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          let oSortProperty = "";
          const oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = "_fe_aggregatable_" + ((_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name);
          } else if (oCondition.Property) {
            const aGroupableProperties = oApplySupported.GroupableProperties;
            if (aGroupableProperties && aGroupableProperties.length) {
              for (let i = 0; i < aGroupableProperties.length; i++) {
                if (aGroupableProperties[i].$PropertyPath === oCondition.Property.$PropertyPath) {
                  oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
                  break;
                }
                if (!oSortProperty) {
                  oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
                }
              }
            } else if (oContext.getModel(0).getObject(`${sEntityPath + oCondition.Property.$PropertyPath}@${"Org.OData.Aggregation.V1.Groupable"}`)) {
              oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
            } else {
              oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
            }
          }
          if (oSortProperty) {
            oSorter.name = oSortProperty;
            oSorter.descending = !!oCondition.Descending;
            aSortConditions.sorters.push(oSorter);
          } else {
            throw new Error("Please define the right path to the sort property");
          }
        });
        return JSON.stringify(aSortConditions);
      }
      return undefined;
    },
    getBindingData(sTargetCollection, oContext, aActions) {
      const aOperationAvailablePath = [];
      let sSelect;
      for (const i in aActions) {
        if (aActions[i].$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          const sActionName = aActions[i].Action;
          const oActionOperationAvailable = CommonHelper.getActionPath(oContext, false, sActionName, true);
          if (oActionOperationAvailable && oActionOperationAvailable.$Path) {
            aOperationAvailablePath.push(`'${oActionOperationAvailable.$Path}'`);
          } else if (oActionOperationAvailable === null) {
            // We disabled action advertisement but kept it in the code for the time being
            //aOperationAvailablePath.push(sActionName);
          }
        }
      }
      if (aOperationAvailablePath.length > 0) {
        //TODO: request fails with $select. check this with odata v4 model
        sSelect = " $select: '" + aOperationAvailablePath.join() + "'";
      }
      return "'{path: '" + (oContext.getObject("$kind") === "EntitySet" ? "/" : "") + oContext.getObject("@sapui.name") + "'" + (sSelect ? ",parameters:{" + sSelect + "}" : "") + "}'";
    },
    _getModel(oCollection, oInterface) {
      return oInterface.context;
    },
    // TODO: combine this one with the one from the table
    isDataFieldForActionButtonEnabled(bIsBound, sAction, oCollection, sOperationAvailableMap, sEnableSelectOn) {
      if (bIsBound !== true) {
        return "true";
      }
      const oModel = oCollection.getModel();
      const sNavPath = oCollection.getPath();
      const sPartner = oModel.getObject(sNavPath).$Partner;
      const oOperationAvailableMap = sOperationAvailableMap && JSON.parse(sOperationAvailableMap);
      const aPath = oOperationAvailableMap && oOperationAvailableMap[sAction] && oOperationAvailableMap[sAction].split("/");
      const sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(sEnableSelectOn);
      if (aPath && aPath[0] === sPartner) {
        const sPath = oOperationAvailableMap[sAction].replace(sPartner + "/", "");
        return "{= ${" + sNumberOfSelectedContexts + " && ${" + sPath + "}}";
      } else {
        return "{= ${" + sNumberOfSelectedContexts + "}";
      }
    },
    getHiddenPathExpressionForTableActionsAndIBN(sHiddenPath, oDetails) {
      const oContext = oDetails.context,
        sPropertyPath = oContext.getPath(),
        sEntitySetPath = ODataModelAnnotationHelper.getNavigationPath(sPropertyPath);
      if (sHiddenPath.indexOf("/") > 0) {
        const aSplitHiddenPath = sHiddenPath.split("/");
        const sNavigationPath = aSplitHiddenPath[0];
        // supports visiblity based on the property from the partner association
        if (oContext.getObject(sEntitySetPath + "/$Partner") === sNavigationPath) {
          return "{= !%{" + aSplitHiddenPath.slice(1).join("/") + "} }";
        }
        // any other association will be ignored and the button will be made visible
      }

      return true;
    },
    /**
     * Method to get press event for DataFieldForActionButton.
     *
     * @function
     * @name getPressEventForDataFieldForActionButton
     * @param id Current control ID
     * @param action DataFieldForAction model
     * @param operationAvailableMap Stringified JSON object
     * @returns A binding expression for the press property of the DataFieldForActionButton
     */
    getPressEventForDataFieldForActionButton(id, action, operationAvailableMap) {
      return ActionHelper.getPressEventDataFieldForActionButton(id, action, {
        contexts: "${internal>selectedContexts}"
      }, operationAvailableMap);
    },
    /**
     * @function
     * @name getActionType
     * @param action DataFieldForAction model
     * @returns A Boolean value depending on the action type
     */
    getActionType(action) {
      return (action["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") > -1 || action["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForAction") > -1) && action["Inline"];
    },
    getCollectionName(collection) {
      return collection.split("/")[collection.split("/").length - 1];
    }
  };
  ChartHelper.getSortConditions.requiresIContext = true;
  return ChartHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRFbnRpdHlTZXRQYXRoIiwiYW5ub3RhdGlvbkNvbnRleHQiLCJnZXRQYXRoIiwicmVwbGFjZSIsIkNoYXJ0VHlwZUVudW0iLCJEaW1lbnNpb25Sb2xlVHlwZUVudW0iLCJDaGFydEhlbHBlciIsImZvcm1hdEpTT05Ub1N0cmluZyIsImNyaXQiLCJ1bmRlZmluZWQiLCJjcml0aWNhbGl0eSIsIkpTT04iLCJzdHJpbmdpZnkiLCJSZWdFeHAiLCJmb3JtYXRDaGFydFR5cGUiLCJjaGFydFR5cGUiLCIkRW51bU1lbWJlciIsImZvcm1hdERpbWVuc2lvbnMiLCJhbm5vdGF0aW9uIiwiZ2V0T2JqZWN0IiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJlbnRpdHlTZXRQYXRoIiwiZGltZW5zaW9ucyIsImlzTmF2aWdhdGlvblRleHQiLCJEaW1lbnNpb25BdHRyaWJ1dGVzIiwiZGltZW5zaW9uIiwiRGltZW5zaW9ucyIsImtleSIsIiRQcm9wZXJ0eVBhdGgiLCJ0ZXh0IiwiaW5kZXhPZiIsIkxvZyIsImVycm9yIiwiJFBhdGgiLCJjaGFydERpbWVuc2lvbiIsInRleHRQYXRoIiwibGFiZWwiLCJyb2xlIiwiYXR0cmlidXRlIiwiRGltZW5zaW9uIiwiUm9sZSIsImZldGNoQ3JpdGljYWxpdHkiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInRoZW4iLCJwdXNoIiwiZGltZW5zaW9uTW9kZWwiLCJKU09OTW9kZWwiLCIkJHZhbHVlQXNQcm9taXNlIiwib01ldGFNb2RlbCIsIm9DdHgiLCJVSSIsInJlcXVlc3RPYmplY3QiLCJhVmFsdWVDcml0aWNhbGl0eSIsIm9Dcml0aWNhbGl0eSIsIm9WYWx1ZUNyaXRpY2FsaXR5IiwiVmVyeVBvc2l0aXZlIiwiUG9zaXRpdmUiLCJDcml0aWNhbCIsIlZlcnlOZWdhdGl2ZSIsIk5lZ2F0aXZlIiwiTmV1dHJhbCIsImkiLCJsZW5ndGgiLCJDcml0aWNhbGl0eSIsImVuZHNXaXRoIiwiVmFsdWUiLCJzS2V5IiwiZm9ybWF0TWVhc3VyZXMiLCJnZXREYXRhIiwiZ2V0VWlDaGFydCIsInByZXNlbnRhdGlvbkNvbnRleHQiLCJnZXRVaUNvbnRyb2wiLCJnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJjaGFydCIsImNvbnRleHRDb250ZXh0IiwiY2hhcnRDb2xsZWN0aW9uIiwiQWN0aW9ucyIsIkFjdGlvbkhlbHBlciIsImdldFNvcnRDb25kaXRpb25zIiwib0NvbnRleHQiLCJvUHJlc2VudGF0aW9uVmFyaWFudCIsInNQcmVzZW50YXRpb25WYXJpYW50UGF0aCIsIm9BcHBseVN1cHBvcnRlZCIsIkNvbW1vbkhlbHBlciIsIl9pc1ByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIiwiU29ydE9yZGVyIiwiYVNvcnRDb25kaXRpb25zIiwic29ydGVycyIsInNFbnRpdHlQYXRoIiwic3BsaXQiLCJmb3JFYWNoIiwib0NvbmRpdGlvbiIsIm9Tb3J0UHJvcGVydHkiLCJvU29ydGVyIiwiRHluYW1pY1Byb3BlcnR5IiwiJEFubm90YXRpb25QYXRoIiwiTmFtZSIsIlByb3BlcnR5IiwiYUdyb3VwYWJsZVByb3BlcnRpZXMiLCJHcm91cGFibGVQcm9wZXJ0aWVzIiwibmFtZSIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwiRXJyb3IiLCJnZXRCaW5kaW5nRGF0YSIsInNUYXJnZXRDb2xsZWN0aW9uIiwiYUFjdGlvbnMiLCJhT3BlcmF0aW9uQXZhaWxhYmxlUGF0aCIsInNTZWxlY3QiLCIkVHlwZSIsInNBY3Rpb25OYW1lIiwiQWN0aW9uIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSIsImdldEFjdGlvblBhdGgiLCJqb2luIiwiX2dldE1vZGVsIiwib0NvbGxlY3Rpb24iLCJvSW50ZXJmYWNlIiwiY29udGV4dCIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uRW5hYmxlZCIsImJJc0JvdW5kIiwic0FjdGlvbiIsInNPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzRW5hYmxlU2VsZWN0T24iLCJvTW9kZWwiLCJzTmF2UGF0aCIsInNQYXJ0bmVyIiwiJFBhcnRuZXIiLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwicGFyc2UiLCJhUGF0aCIsInNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJnZXROdW1iZXJPZkNvbnRleHRzRXhwcmVzc2lvbiIsInNQYXRoIiwiZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4iLCJzSGlkZGVuUGF0aCIsIm9EZXRhaWxzIiwic1Byb3BlcnR5UGF0aCIsInNFbnRpdHlTZXRQYXRoIiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImFTcGxpdEhpZGRlblBhdGgiLCJzTmF2aWdhdGlvblBhdGgiLCJzbGljZSIsImdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJpZCIsImFjdGlvbiIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJjb250ZXh0cyIsImdldEFjdGlvblR5cGUiLCJnZXRDb2xsZWN0aW9uTmFtZSIsImNvbGxlY3Rpb24iLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSAqIGFzIEVkbSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvRWRtXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0LCBDaGFydFR5cGUsIERhdGFGaWVsZEZvckFjdGlvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXR0cmlidXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0F0dHJpYnV0ZU1vZGVsXCI7XG5pbXBvcnQgeyBnZXRVaUNvbnRyb2wgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IEFjdGlvbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9oZWxwZXJzL0FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQW5ub3RhdGlvbkhlbHBlclwiO1xuaW1wb3J0IHsgRXhwYW5kUGF0aFR5cGUsIE1ldGFNb2RlbEVudW0gfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbmZ1bmN0aW9uIGdldEVudGl0eVNldFBhdGgoYW5ub3RhdGlvbkNvbnRleHQ6IENvbnRleHQpIHtcblx0cmV0dXJuIGFubm90YXRpb25Db250ZXh0LmdldFBhdGgoKS5yZXBsYWNlKC9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuKENoYXJ0fFByZXNlbnRhdGlvblZhcmlhbnQpLiovLCBcIlwiKTtcbn1cblxuZW51bSBDaGFydFR5cGVFbnVtIHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29sdW1uXCIgPSBcImNvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkXCIgPSBcInN0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtbkR1YWxcIiA9IFwiZHVhbF9jb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29sdW1uU3RhY2tlZER1YWxcIiA9IFwiZHVhbF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkMTAwXCIgPSBcIjEwMF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkRHVhbDEwMFwiID0gXCIxMDBfZHVhbF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CYXJcIiA9IFwiYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWRcIiA9IFwic3RhY2tlZF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQmFyRHVhbFwiID0gXCJkdWFsX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CYXJTdGFja2VkRHVhbFwiID0gXCJkdWFsX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWQxMDBcIiA9IFwiMTAwX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWREdWFsMTAwXCIgPSBcIjEwMF9kdWFsX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0FyZWFcIiA9IFwiYXJlYVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9BcmVhU3RhY2tlZFwiID0gXCJzdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9BcmVhU3RhY2tlZDEwMFwiID0gXCIxMDBfc3RhY2tlZF9jb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvSG9yaXpvbnRhbEFyZWFcIiA9IFwiYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxBcmVhU3RhY2tlZFwiID0gXCJzdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQXJlYVN0YWNrZWQxMDBcIiA9IFwiMTAwX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0xpbmVcIiA9IFwibGluZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9MaW5lRHVhbFwiID0gXCJkdWFsX2xpbmVcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25cIiA9IFwiY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25TdGFja2VkXCIgPSBcInN0YWNrZWRfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25EdWFsXCIgPSBcImR1YWxfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25TdGFja2VkRHVhbFwiID0gXCJkdWFsX3N0YWNrZWRfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvSG9yaXpvbnRhbENvbWJpbmF0aW9uU3RhY2tlZFwiID0gXCJob3Jpem9udGFsX3N0YWNrZWRfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvUGllXCIgPSBcInBpZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Eb251dFwiID0gXCJkb251dFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9TY2F0dGVyXCIgPSBcInNjYXR0ZXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQnViYmxlXCIgPSBcImJ1YmJsZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9SYWRhclwiID0gXCJsaW5lXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hlYXRNYXBcIiA9IFwiaGVhdG1hcFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9UcmVlTWFwXCIgPSBcInRyZWVtYXBcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvV2F0ZXJmYWxsXCIgPSBcIndhdGVyZmFsbFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CdWxsZXRcIiA9IFwiYnVsbGV0XCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL1ZlcnRpY2FsQnVsbGV0XCIgPSBcInZlcnRpY2FsX2J1bGxldFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsV2F0ZXJmYWxsXCIgPSBcImhvcml6b250YWxfd2F0ZXJmYWxsXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxDb21iaW5hdGlvbkR1YWxcIiA9IFwiZHVhbF9ob3Jpem9udGFsX2NvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxDb21iaW5hdGlvblN0YWNrZWREdWFsXCIgPSBcImR1YWxfaG9yaXpvbnRhbF9zdGFja2VkX2NvbWJpbmF0aW9uXCJcbn1cbmVudW0gRGltZW5zaW9uUm9sZVR5cGVFbnVtIHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERpbWVuc2lvblJvbGVUeXBlL0NhdGVnb3J5XCIgPSBcImNhdGVnb3J5XCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREaW1lbnNpb25Sb2xlVHlwZS9TZXJpZXNcIiA9IFwic2VyaWVzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREaW1lbnNpb25Sb2xlVHlwZS9DYXRlZ29yeTJcIiA9IFwiY2F0ZWdvcnkyXCJcbn1cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAuZmUubWFjcm9zIENoYXJ0IHBoYW50b20gY29udHJvbCBmb3IgcHJlcHJvY2Vzc2luZy5cbiAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuICogVGhlIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgdGhlIEFQSS9iZWhhdmlvdXIgaXMgbm90IGZpbmFsaXNlZFxuICogYW5kIGhlbmNlIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuICogRXNwZWNpYWxseSB0aGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciB0aGUgRkUgc2NlbmFyaW8sXG4gKiBoZXJlIHdlIHNoYWxsIHVzZSBzYXAuZmUubWFjcm9zLkNoYXJ0SGVscGVyIHRoYXQgaXMgZXNwZWNpYWxseSB0YWlsb3JlZCBmb3IgVjRcbiAqIG1ldGEgbW9kZWxcbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjYyLjBcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkNoYXJ0SGVscGVyXG4gKi9cbmNvbnN0IENoYXJ0SGVscGVyID0ge1xuXHRmb3JtYXRKU09OVG9TdHJpbmcoY3JpdDogb2JqZWN0KSB7XG5cdFx0aWYgKCFjcml0KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGxldCBjcml0aWNhbGl0eSA9IEpTT04uc3RyaW5naWZ5KGNyaXQpO1xuXHRcdGNyaXRpY2FsaXR5ID0gY3JpdGljYWxpdHkucmVwbGFjZShuZXcgUmVnRXhwKFwie1wiLCBcImdcIiksIFwiXFxcXHtcIik7XG5cdFx0Y3JpdGljYWxpdHkgPSBjcml0aWNhbGl0eS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJ9XCIsIFwiZ1wiKSwgXCJcXFxcfVwiKTtcblx0XHRyZXR1cm4gY3JpdGljYWxpdHk7XG5cdH0sXG5cdGZvcm1hdENoYXJ0VHlwZShjaGFydFR5cGU6IENoYXJ0VHlwZSkge1xuXHRcdHJldHVybiBDaGFydFR5cGVFbnVtWyhjaGFydFR5cGUgYXMgdW5rbm93biBhcyBNZXRhTW9kZWxFbnVtPENoYXJ0VHlwZUVudW0+KT8uJEVudW1NZW1iZXIgYXMga2V5b2YgdHlwZW9mIENoYXJ0VHlwZUVudW1dO1xuXHR9LFxuXHRmb3JtYXREaW1lbnNpb25zKGFubm90YXRpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvbiA9IGFubm90YXRpb25Db250ZXh0LmdldE9iamVjdChcIi4vXCIpIGFzIENoYXJ0LFxuXHRcdFx0bWV0YU1vZGVsID0gYW5ub3RhdGlvbkNvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdGVudGl0eVNldFBhdGggPSBnZXRFbnRpdHlTZXRQYXRoKGFubm90YXRpb25Db250ZXh0KSxcblx0XHRcdGRpbWVuc2lvbnMgPSBbXTtcblxuXHRcdGxldCBpc05hdmlnYXRpb25UZXh0ID0gZmFsc2U7XG5cblx0XHQvL3BlcmhhcHMgdGhlcmUgYXJlIG5vIGRpbWVuc2lvblxuXHRcdGFubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlcyA9IGFubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlcyB8fCBbXTtcblxuXHRcdGZvciAoY29uc3QgZGltZW5zaW9uIG9mIGFubm90YXRpb24uRGltZW5zaW9ucykge1xuXHRcdFx0Y29uc3Qga2V5ID0gKGRpbWVuc2lvbiBhcyB1bmtub3duIGFzIEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+KS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0Y29uc3QgdGV4dCA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aCArIGtleX1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuVGV4dH1gKSB8fCB7fTtcblx0XHRcdGlmIChrZXkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIERpbWVuc2lvbjogJHtrZXl9IGZyb20gYW4gYXNzb2NpYXRpb24gY2Fubm90IGJlIHVzZWRgKTtcblx0XHRcdH1cblx0XHRcdGlmICh0ZXh0LiRQYXRoICYmIHRleHQuJFBhdGguaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0YCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIFRleHQgUHJvcGVydHk6ICR7dGV4dC4kUGF0aH0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZCBmb3IgdGhlIGRpbWVuc2lvbiAke2tleX1gXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlzTmF2aWdhdGlvblRleHQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBjaGFydERpbWVuc2lvbjogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcblx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdHRleHRQYXRoOiAhaXNOYXZpZ2F0aW9uVGV4dCA/IHRleHQuJFBhdGggOiB1bmRlZmluZWQsXG5cdFx0XHRcdGxhYmVsOiBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGggKyBrZXl9QCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLkxhYmVsfWApLFxuXHRcdFx0XHRyb2xlOiBcImNhdGVnb3J5XCJcblx0XHRcdH07XG5cblx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGFubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlcykge1xuXHRcdFx0XHRpZiAoY2hhcnREaW1lbnNpb24ua2V5ID09PSAoYXR0cmlidXRlLkRpbWVuc2lvbiBhcyB1bmtub3duIGFzIEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+KT8uJFByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRcdGNoYXJ0RGltZW5zaW9uLnJvbGUgPVxuXHRcdFx0XHRcdFx0RGltZW5zaW9uUm9sZVR5cGVFbnVtW1xuXHRcdFx0XHRcdFx0XHQoYXR0cmlidXRlLlJvbGUgYXMgdW5rbm93biBhcyBNZXRhTW9kZWxFbnVtPERpbWVuc2lvblJvbGVUeXBlRW51bT4pXG5cdFx0XHRcdFx0XHRcdFx0Py4kRW51bU1lbWJlciBhcyBrZXlvZiB0eXBlb2YgRGltZW5zaW9uUm9sZVR5cGVFbnVtXG5cdFx0XHRcdFx0XHRdIHx8IGNoYXJ0RGltZW5zaW9uLnJvbGU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y2hhcnREaW1lbnNpb24uY3JpdGljYWxpdHkgPSB0aGlzLmZldGNoQ3JpdGljYWxpdHkobWV0YU1vZGVsLCBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoZW50aXR5U2V0UGF0aCArIGtleSkpLnRoZW4oXG5cdFx0XHRcdHRoaXMuZm9ybWF0SlNPTlRvU3RyaW5nXG5cdFx0XHQpO1xuXG5cdFx0XHRkaW1lbnNpb25zLnB1c2goY2hhcnREaW1lbnNpb24pO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRpbWVuc2lvbk1vZGVsID0gbmV3IEpTT05Nb2RlbChkaW1lbnNpb25zKTtcblx0XHQoZGltZW5zaW9uTW9kZWwgYXMgQXR0cmlidXRlTW9kZWwpLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBkaW1lbnNpb25Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH0sXG5cblx0ZmV0Y2hDcml0aWNhbGl0eShvTWV0YU1vZGVsOiBhbnksIG9DdHg6IGFueSkge1xuXHRcdGNvbnN0IFVJID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIjtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke1VJfS5WYWx1ZUNyaXRpY2FsaXR5YCwgb0N0eCkudGhlbihmdW5jdGlvbiAoYVZhbHVlQ3JpdGljYWxpdHk6IGFueSkge1xuXHRcdFx0bGV0IG9Dcml0aWNhbGl0eSwgb1ZhbHVlQ3JpdGljYWxpdHk6IGFueTtcblxuXHRcdFx0aWYgKGFWYWx1ZUNyaXRpY2FsaXR5KSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRWZXJ5UG9zaXRpdmU6IFtdLFxuXHRcdFx0XHRcdFBvc2l0aXZlOiBbXSxcblx0XHRcdFx0XHRDcml0aWNhbDogW10sXG5cdFx0XHRcdFx0VmVyeU5lZ2F0aXZlOiBbXSxcblx0XHRcdFx0XHROZWdhdGl2ZTogW10sXG5cdFx0XHRcdFx0TmV1dHJhbDogW11cblx0XHRcdFx0fSBhcyBhbnk7XG5cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVmFsdWVDcml0aWNhbGl0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG9WYWx1ZUNyaXRpY2FsaXR5ID0gYVZhbHVlQ3JpdGljYWxpdHlbaV07XG5cblx0XHRcdFx0XHRpZiAob1ZhbHVlQ3JpdGljYWxpdHkuQ3JpdGljYWxpdHkuJEVudW1NZW1iZXIuZW5kc1dpdGgoXCJWZXJ5UG9zaXRpdmVcIikpIHtcblx0XHRcdFx0XHRcdG9Dcml0aWNhbGl0eS5WZXJ5UG9zaXRpdmUucHVzaChvVmFsdWVDcml0aWNhbGl0eS5WYWx1ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvVmFsdWVDcml0aWNhbGl0eS5Dcml0aWNhbGl0eS4kRW51bU1lbWJlci5lbmRzV2l0aChcIlBvc2l0aXZlXCIpKSB7XG5cdFx0XHRcdFx0XHRvQ3JpdGljYWxpdHkuUG9zaXRpdmUucHVzaChvVmFsdWVDcml0aWNhbGl0eS5WYWx1ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvVmFsdWVDcml0aWNhbGl0eS5Dcml0aWNhbGl0eS4kRW51bU1lbWJlci5lbmRzV2l0aChcIkNyaXRpY2FsXCIpKSB7XG5cdFx0XHRcdFx0XHRvQ3JpdGljYWxpdHkuQ3JpdGljYWwucHVzaChvVmFsdWVDcml0aWNhbGl0eS5WYWx1ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvVmFsdWVDcml0aWNhbGl0eS5Dcml0aWNhbGl0eS4kRW51bU1lbWJlci5lbmRzV2l0aChcIlZlcnlOZWdhdGl2ZVwiKSkge1xuXHRcdFx0XHRcdFx0b0NyaXRpY2FsaXR5LlZlcnlOZWdhdGl2ZS5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9WYWx1ZUNyaXRpY2FsaXR5LkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLmVuZHNXaXRoKFwiTmVnYXRpdmVcIikpIHtcblx0XHRcdFx0XHRcdG9Dcml0aWNhbGl0eS5OZWdhdGl2ZS5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b0NyaXRpY2FsaXR5Lk5ldXRyYWwucHVzaChvVmFsdWVDcml0aWNhbGl0eS5WYWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIG9Dcml0aWNhbGl0eSkge1xuXHRcdFx0XHRcdGlmIChvQ3JpdGljYWxpdHlbc0tleV0ubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvQ3JpdGljYWxpdHlbc0tleV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvQ3JpdGljYWxpdHk7XG5cdFx0fSk7XG5cdH0sXG5cblx0Zm9ybWF0TWVhc3VyZXMoYW5ub3RhdGlvbkNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRyZXR1cm4gKGFubm90YXRpb25Db250ZXh0LmdldE1vZGVsKCkgYXMgSlNPTk1vZGVsKS5nZXREYXRhKCk7XG5cdH0sXG5cblx0Z2V0VWlDaGFydChwcmVzZW50YXRpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0cmV0dXJuIGdldFVpQ29udHJvbChwcmVzZW50YXRpb25Db250ZXh0LCBgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YCk7XG5cdH0sXG5cdGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChjaGFydDogQ2hhcnQsIGNvbnRleHRDb250ZXh0OiBDb21wdXRlZEFubm90YXRpb25JbnRlcmZhY2UpIHtcblx0XHRjb25zdCBjaGFydENvbGxlY3Rpb24gPSBjaGFydD8uQWN0aW9ucyB8fCBbXTtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoQWN0aW9uSGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChjaGFydENvbGxlY3Rpb24sIFwiY2hhcnRcIiwgY29udGV4dENvbnRleHQpKTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgYSBzdHJpbmdpZmllZCBKU09OIG9iamVjdCBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IHNvcnQgY29uZGl0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0XG5cdCAqIEBwYXJhbSBvUHJlc2VudGF0aW9uVmFyaWFudCBQcmVzZW50YXRpb24gVmFyaWFudCBhbm5vdGF0aW9uXG5cdCAqIEBwYXJhbSBzUHJlc2VudGF0aW9uVmFyaWFudFBhdGhcblx0ICogQHBhcmFtIG9BcHBseVN1cHBvcnRlZFxuXHQgKiBAcmV0dXJucyBTdHJpbmdpZmllZCBKU09OIG9iamVjdFxuXHQgKi9cblx0Z2V0U29ydENvbmRpdGlvbnM6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55LCBvUHJlc2VudGF0aW9uVmFyaWFudDogYW55LCBzUHJlc2VudGF0aW9uVmFyaWFudFBhdGg6IHN0cmluZywgb0FwcGx5U3VwcG9ydGVkOiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHRvUHJlc2VudGF0aW9uVmFyaWFudCAmJlxuXHRcdFx0Q29tbW9uSGVscGVyLl9pc1ByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uKHNQcmVzZW50YXRpb25WYXJpYW50UGF0aCkgJiZcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50LlNvcnRPcmRlclxuXHRcdCkge1xuXHRcdFx0Y29uc3QgYVNvcnRDb25kaXRpb25zOiBhbnkgPSB7XG5cdFx0XHRcdHNvcnRlcnM6IFtdXG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKDApLnNwbGl0KFwiQFwiKVswXTtcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50LlNvcnRPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnkgPSB7fSkge1xuXHRcdFx0XHRsZXQgb1NvcnRQcm9wZXJ0eTogYW55ID0gXCJcIjtcblx0XHRcdFx0Y29uc3Qgb1NvcnRlcjogYW55ID0ge307XG5cdFx0XHRcdGlmIChvQ29uZGl0aW9uLkR5bmFtaWNQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0UHJvcGVydHkgPVxuXHRcdFx0XHRcdFx0XCJfZmVfYWdncmVnYXRhYmxlX1wiICtcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldE1vZGVsKDApLmdldE9iamVjdChzRW50aXR5UGF0aCArIG9Db25kaXRpb24uRHluYW1pY1Byb3BlcnR5LiRBbm5vdGF0aW9uUGF0aCk/Lk5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbmRpdGlvbi5Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGNvbnN0IGFHcm91cGFibGVQcm9wZXJ0aWVzID0gb0FwcGx5U3VwcG9ydGVkLkdyb3VwYWJsZVByb3BlcnRpZXM7XG5cdFx0XHRcdFx0aWYgKGFHcm91cGFibGVQcm9wZXJ0aWVzICYmIGFHcm91cGFibGVQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhR3JvdXBhYmxlUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoYUdyb3VwYWJsZVByb3BlcnRpZXNbaV0uJFByb3BlcnR5UGF0aCA9PT0gb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IFwiX2ZlX2dyb3VwYWJsZV9cIiArIG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIW9Tb3J0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdG9Db250ZXh0XG5cdFx0XHRcdFx0XHRcdC5nZXRNb2RlbCgwKVxuXHRcdFx0XHRcdFx0XHQuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRoICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRofUAke0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRlcm1zLkdyb3VwYWJsZX1gKVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IFwiX2ZlX2dyb3VwYWJsZV9cIiArIG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IFwiX2ZlX2FnZ3JlZ2F0YWJsZV9cIiArIG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9Tb3J0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRvU29ydGVyLm5hbWUgPSBvU29ydFByb3BlcnR5O1xuXHRcdFx0XHRcdG9Tb3J0ZXIuZGVzY2VuZGluZyA9ICEhb0NvbmRpdGlvbi5EZXNjZW5kaW5nO1xuXHRcdFx0XHRcdGFTb3J0Q29uZGl0aW9ucy5zb3J0ZXJzLnB1c2gob1NvcnRlcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGRlZmluZSB0aGUgcmlnaHQgcGF0aCB0byB0aGUgc29ydCBwcm9wZXJ0eVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoYVNvcnRDb25kaXRpb25zKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0Z2V0QmluZGluZ0RhdGEoc1RhcmdldENvbGxlY3Rpb246IGFueSwgb0NvbnRleHQ6IGFueSwgYUFjdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IGFPcGVyYXRpb25BdmFpbGFibGVQYXRoID0gW107XG5cdFx0bGV0IHNTZWxlY3Q7XG5cdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25zKSB7XG5cdFx0XHRpZiAoYUFjdGlvbnNbaV0uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbikge1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IGFBY3Rpb25zW2ldLkFjdGlvbjtcblx0XHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9Db250ZXh0LCBmYWxzZSwgc0FjdGlvbk5hbWUsIHRydWUpO1xuXHRcdFx0XHRpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSAmJiBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlLiRQYXRoKSB7XG5cdFx0XHRcdFx0YU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChgJyR7b0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZS4kUGF0aH0nYCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIFdlIGRpc2FibGVkIGFjdGlvbiBhZHZlcnRpc2VtZW50IGJ1dCBrZXB0IGl0IGluIHRoZSBjb2RlIGZvciB0aGUgdGltZSBiZWluZ1xuXHRcdFx0XHRcdC8vYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vVE9ETzogcmVxdWVzdCBmYWlscyB3aXRoICRzZWxlY3QuIGNoZWNrIHRoaXMgd2l0aCBvZGF0YSB2NCBtb2RlbFxuXHRcdFx0c1NlbGVjdCA9IFwiICRzZWxlY3Q6ICdcIiArIGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmpvaW4oKSArIFwiJ1wiO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0XCIne3BhdGg6ICdcIiArXG5cdFx0XHQob0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgPyBcIi9cIiA6IFwiXCIpICtcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpICtcblx0XHRcdFwiJ1wiICtcblx0XHRcdChzU2VsZWN0ID8gXCIscGFyYW1ldGVyczp7XCIgKyBzU2VsZWN0ICsgXCJ9XCIgOiBcIlwiKSArXG5cdFx0XHRcIn0nXCJcblx0XHQpO1xuXHR9LFxuXHRfZ2V0TW9kZWwob0NvbGxlY3Rpb246IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0cmV0dXJuIG9JbnRlcmZhY2UuY29udGV4dDtcblx0fSxcblx0Ly8gVE9ETzogY29tYmluZSB0aGlzIG9uZSB3aXRoIHRoZSBvbmUgZnJvbSB0aGUgdGFibGVcblx0aXNEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25FbmFibGVkKFxuXHRcdGJJc0JvdW5kOiBib29sZWFuLFxuXHRcdHNBY3Rpb246IHN0cmluZyxcblx0XHRvQ29sbGVjdGlvbjogQ29udGV4dCxcblx0XHRzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcsXG5cdFx0c0VuYWJsZVNlbGVjdE9uOiBzdHJpbmdcblx0KSB7XG5cdFx0aWYgKGJJc0JvdW5kICE9PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db2xsZWN0aW9uLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc05hdlBhdGggPSBvQ29sbGVjdGlvbi5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1BhcnRuZXIgPSBvTW9kZWwuZ2V0T2JqZWN0KHNOYXZQYXRoKS4kUGFydG5lcjtcblx0XHRjb25zdCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBKU09OLnBhcnNlKHNPcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdGNvbnN0IGFQYXRoID0gb09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwW3NBY3Rpb25dICYmIG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0uc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBBY3Rpb25IZWxwZXIuZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24oc0VuYWJsZVNlbGVjdE9uKTtcblx0XHRpZiAoYVBhdGggJiYgYVBhdGhbMF0gPT09IHNQYXJ0bmVyKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0ucmVwbGFjZShzUGFydG5lciArIFwiL1wiLCBcIlwiKTtcblx0XHRcdHJldHVybiBcIns9ICR7XCIgKyBzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICsgXCIgJiYgJHtcIiArIHNQYXRoICsgXCJ9fVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJ7PSAke1wiICsgc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwifVwiO1xuXHRcdH1cblx0fSxcblx0Z2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4oc0hpZGRlblBhdGg6IGFueSwgb0RldGFpbHM6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb0RldGFpbHMuY29udGV4dCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzRW50aXR5U2V0UGF0aCA9IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChzSGlkZGVuUGF0aC5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdGNvbnN0IGFTcGxpdEhpZGRlblBhdGggPSBzSGlkZGVuUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBhU3BsaXRIaWRkZW5QYXRoWzBdO1xuXHRcdFx0Ly8gc3VwcG9ydHMgdmlzaWJsaXR5IGJhc2VkIG9uIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBwYXJ0bmVyIGFzc29jaWF0aW9uXG5cdFx0XHRpZiAob0NvbnRleHQuZ2V0T2JqZWN0KHNFbnRpdHlTZXRQYXRoICsgXCIvJFBhcnRuZXJcIikgPT09IHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAhJXtcIiArIGFTcGxpdEhpZGRlblBhdGguc2xpY2UoMSkuam9pbihcIi9cIikgKyBcIn0gfVwiO1xuXHRcdFx0fVxuXHRcdFx0Ly8gYW55IG90aGVyIGFzc29jaWF0aW9uIHdpbGwgYmUgaWdub3JlZCBhbmQgdGhlIGJ1dHRvbiB3aWxsIGJlIG1hZGUgdmlzaWJsZVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZm9yIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25cblx0ICogQHBhcmFtIGlkIEN1cnJlbnQgY29udHJvbCBJRFxuXHQgKiBAcGFyYW0gYWN0aW9uIERhdGFGaWVsZEZvckFjdGlvbiBtb2RlbFxuXHQgKiBAcGFyYW0gb3BlcmF0aW9uQXZhaWxhYmxlTWFwIFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgcHJlc3MgcHJvcGVydHkgb2YgdGhlIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKi9cblx0Z2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihpZDogc3RyaW5nLCBhY3Rpb246IERhdGFGaWVsZEZvckFjdGlvbiwgb3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBBY3Rpb25IZWxwZXIuZ2V0UHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihcblx0XHRcdGlkLFxuXHRcdFx0YWN0aW9uLFxuXHRcdFx0e1xuXHRcdFx0XHRjb250ZXh0czogXCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9XCJcblx0XHRcdH0sXG5cdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXBcblx0XHQpO1xuXHR9LFxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFjdGlvblR5cGVcblx0ICogQHBhcmFtIGFjdGlvbiBEYXRhRmllbGRGb3JBY3Rpb24gbW9kZWxcblx0ICogQHJldHVybnMgQSBCb29sZWFuIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgYWN0aW9uIHR5cGVcblx0ICovXG5cdGdldEFjdGlvblR5cGUoYWN0aW9uOiBEYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KGFjdGlvbltcIiRUeXBlXCJdLmluZGV4T2YoVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKSA+IC0xIHx8XG5cdFx0XHRcdGFjdGlvbltcIiRUeXBlXCJdLmluZGV4T2YoVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uKSA+IC0xKSAmJlxuXHRcdFx0YWN0aW9uW1wiSW5saW5lXCJdXG5cdFx0KTtcblx0fSxcblx0Z2V0Q29sbGVjdGlvbk5hbWUoY29sbGVjdGlvbjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIGNvbGxlY3Rpb24uc3BsaXQoXCIvXCIpW2NvbGxlY3Rpb24uc3BsaXQoXCIvXCIpLmxlbmd0aCAtIDFdO1xuXHR9XG59O1xuKENoYXJ0SGVscGVyLmdldFNvcnRDb25kaXRpb25zIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWdCQSxTQUFTQSxnQkFBZ0IsQ0FBQ0MsaUJBQTBCLEVBQUU7SUFDckQsT0FBT0EsaUJBQWlCLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxPQUFPLENBQUMsMkRBQTJELEVBQUUsRUFBRSxD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