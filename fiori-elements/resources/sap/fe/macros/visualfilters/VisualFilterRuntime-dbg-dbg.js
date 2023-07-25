/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/templating/FilterHelper", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/ui/core/Core", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, VisualFilterUtils, FilterHelper, TypeUtil, CommonHelper, FilterUtils, Core, Condition, MdcFilterUtil, Filter, FilterOperator) {
  "use strict";

  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  /**
   * Static class used by Visual Filter during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const VisualFilterRuntime = {
    selectionChanged(oEvent) {
      const oInteractiveChart = oEvent.getSource();
      const sOutParameter = oInteractiveChart.data("outParameter");
      const sValueListProperty = oInteractiveChart.data("valuelistProperty");
      const sDimension = oInteractiveChart.data("dimension");
      const sDimensionText = oInteractiveChart.data("dimensionText");
      const bMultipleSelectionAllowed = oInteractiveChart.data("multipleSelectionAllowed");
      const sDimensionType = oInteractiveChart.data("dimensionType");
      const oSelectedAggregation = oEvent.getParameter("bar") || oEvent.getParameter("point") || oEvent.getParameter("segment");
      const bIsAggregationSelected = oEvent.getParameter("selected");
      const oConditionModel = oInteractiveChart.getModel("$field");
      let aConditions = oConditionModel.getProperty("/conditions");
      if (!sOutParameter || sValueListProperty !== sDimension) {
        Log.error("VisualFilter: Cannot sync values with regular filter as out parameter is not configured properly!");
      } else {
        let sSelectionChangedValue = oSelectedAggregation.getBindingContext().getObject(sValueListProperty);
        if (sSelectionChangedValue) {
          let sSelectionChangedValueText = oSelectedAggregation.getBindingContext().getObject(sDimensionText);
          if (typeof sSelectionChangedValueText !== "string" && !(sSelectionChangedValueText instanceof String)) {
            sSelectionChangedValueText = undefined;
          }
          // if selection has been done on the aggregation then add to conditions
          if (bIsAggregationSelected) {
            if (bMultipleSelectionAllowed === "false") {
              aConditions = [];
            }
            if (sDimensionType === "Edm.DateTimeOffset") {
              sSelectionChangedValue = VisualFilterUtils._parseDateTime(sSelectionChangedValue);
            }
            const oCondition = Condition.createItemCondition(sSelectionChangedValue, sSelectionChangedValueText || undefined, {}, {});
            aConditions.push(oCondition);
          } else {
            // because selection was removed on the aggregation hence remove this from conditions
            aConditions = aConditions.filter(function (oCondition) {
              if (sDimensionType === "Edm.DateTimeOffset") {
                return oCondition.operator !== "EQ" || Date.parse(oCondition.values[0]) !== Date.parse(sSelectionChangedValue);
              }
              return oCondition.operator !== "EQ" || oCondition.values[0] !== sSelectionChangedValue;
            });
          }
          oConditionModel.setProperty("/conditions", aConditions);
        } else {
          Log.error("VisualFilter: No vaue found for the outParameter");
        }
      }
    },
    // THIS IS A FORMATTER
    getAggregationSelected(aConditions) {
      var _this$getBindingConte;
      let aSelectableValues = [];
      if (!this.getBindingContext()) {
        return;
      }
      for (let i = 0; i <= aConditions.length - 1; i++) {
        const oCondition = aConditions[i];
        // 1. get conditions with EQ operator (since visual filter can only deal with EQ operators) and get their values
        if (oCondition.operator === "EQ") {
          aSelectableValues.push(oCondition.values[0]);
        }
      }

      // access the interactive chart from the control.
      const oInteractiveChart = this.getParent();
      const sDimension = oInteractiveChart.data("dimension");
      const sDimensionType = oInteractiveChart.data("dimensionType");
      let sDimensionValue = (_this$getBindingConte = this.getBindingContext()) === null || _this$getBindingConte === void 0 ? void 0 : _this$getBindingConte.getObject(sDimension);
      if (sDimensionType === "Edm.DateTimeOffset") {
        sDimensionValue = VisualFilterUtils._parseDateTime(sDimensionValue);
      }
      if (oInteractiveChart.data("multipleSelectionAllowed") === "false" && aSelectableValues.length > 1) {
        aSelectableValues = [aSelectableValues[0]];
      }
      return aSelectableValues.indexOf(sDimensionValue) > -1;
    },
    // THIS IS A FORMATTER
    getFiltersFromConditions() {
      var _oInteractiveChart$ge, _oInteractiveChart$ge2, _oInteractiveChart$ge3;
      for (var _len = arguments.length, aArguments = new Array(_len), _key = 0; _key < _len; _key++) {
        aArguments[_key] = arguments[_key];
      }
      const oInteractiveChart = this.getParent();
      const oFilterBar = (_oInteractiveChart$ge = oInteractiveChart.getParent()) === null || _oInteractiveChart$ge === void 0 ? void 0 : (_oInteractiveChart$ge2 = _oInteractiveChart$ge.getParent()) === null || _oInteractiveChart$ge2 === void 0 ? void 0 : (_oInteractiveChart$ge3 = _oInteractiveChart$ge2.getParent()) === null || _oInteractiveChart$ge3 === void 0 ? void 0 : _oInteractiveChart$ge3.getParent();
      const aInParameters = oInteractiveChart.data("inParameters").customData;
      const bIsDraftSupported = oInteractiveChart.data("draftSupported") === "true";
      const aPropertyInfoSet = oFilterBar.getPropertyInfo();
      const mConditions = {};
      const aValueListPropertyInfoSet = [];
      let oFilters;
      let aFilters = [];
      const aParameters = oInteractiveChart.data("parameters").customData;
      const oSelectionVariantAnnotation = CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation"));
      const oInteractiveChartListBinding = oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points") || oInteractiveChart.getBinding("segments");
      const sPath = oInteractiveChartListBinding.getPath();
      const oMetaModel = oInteractiveChart.getModel().getMetaModel();
      const sEntitySetPath = oInteractiveChartListBinding.getPath();
      const filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      for (const i in aPropertyInfoSet) {
        aPropertyInfoSet[i].typeConfig = TypeUtil.getTypeConfig(aPropertyInfoSet[i].dataType, {}, {});
      }
      const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      // aInParameters and the bindings to in parameters are in the same order so we can rely on it to create our conditions
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        mConditions[sKey] = oSelectionVariantConditions[sKey];
        //fetch localDataProperty if selection variant key is based on vaue list property
        const inParameterForKey = aInParameters.find(function (inParameter) {
          return inParameter.valueListProperty === sKey;
        });
        const localDataProperty = inParameterForKey ? inParameterForKey.localDataProperty : sKey;
        if (!aParameters || aParameters && aParameters.indexOf(sKey) === -1) {
          for (const i in aPropertyInfoSet) {
            const propertyInfoSet = aPropertyInfoSet[i];
            if (localDataProperty === propertyInfoSet.name) {
              if (propertyInfoSet.typeConfig.baseType === "DateTime") {
                if (mConditions[sKey]) {
                  mConditions[sKey].forEach(function (condition) {
                    condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
                  });
                }
              }
              aValueListPropertyInfoSet.push({
                name: sKey,
                typeConfig: propertyInfoSet.typeConfig
              });
            }
          }
        }
      });
      aInParameters.forEach(function (oInParameter, index) {
        if (aArguments[index].length > 0) {
          // store conditions with value list property since we are filtering on the value list collection path
          mConditions[oInParameter.valueListProperty] = aArguments[index];
          if (!aParameters || aParameters && aParameters.indexOf(oInParameter.valueListProperty) === -1) {
            // aPropertyInfoSet is list of properties from the filter bar but we need to create conditions for the value list
            // which could have a different collectionPath.
            // Only typeConfig from aPropertyInfoSet is required for getting the converted filters from conditions
            // so we update aPropertyInfoSet to have the valueListProperties only
            // This way conditions will be converted to sap.ui.model.Filter for the value list
            // This works because for in parameter mapping the property from the main entity type should be of the same type as the value list entity type
            // TODO: Follow up with MDC to check if they can provide a clean api to convert conditions into filters
            for (const i in aPropertyInfoSet) {
              // store conditions with value list property since we are filtering on the value list collection path
              const propertyInfoSet = aPropertyInfoSet[i];
              if (propertyInfoSet.name === oInParameter.localDataProperty) {
                if (propertyInfoSet.typeConfig.baseType === "DateTime") {
                  if (mConditions[oInParameter.valueListProperty]) {
                    mConditions[oInParameter.valueListProperty].forEach(function (condition) {
                      condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
                    });
                  }
                }
                aValueListPropertyInfoSet.push({
                  name: oInParameter.valueListProperty,
                  typeConfig: propertyInfoSet.typeConfig
                });
              }
            }
          }
        }
      });
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const sInfoPath = oInteractiveChart.data("infoPath");
      let bEnableBinding;
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const aRequiredProperties = CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties"));
      if (aRequiredProperties.length) {
        const aConditions = Object.keys(mConditions) || [];
        const aNotMatchedConditions = [];
        aRequiredProperties.forEach(function (requiredPropertyPath) {
          if (aConditions.indexOf(requiredPropertyPath) === -1) {
            aNotMatchedConditions.push(requiredPropertyPath);
          }
        });
        if (!aNotMatchedConditions.length) {
          bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: "",
            errorMessage: "",
            showError: false
          });
        } else if (aNotMatchedConditions.length > 1) {
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
            errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF"),
            showError: true
          });
          return;
        } else {
          const sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) || aNotMatchedConditions[0];
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
            errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel),
            showError: true
          });
          return;
        }
      } else {
        bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
        oInternalModelContext.setProperty(sInfoPath, {
          errorMessageTitle: "",
          errorMessage: "",
          showError: false
        });
      }
      const sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      const sChartEntityName = sPath.split("/")[1].split("(")[0];
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        const sBindingPath = bEnableBinding ? FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters) : undefined;
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      if (aParameters && aParameters.length) {
        //Remove parameters from mConditions since it should not be a part of $filter
        aParameters.forEach(function (parameter) {
          if (mConditions[parameter]) {
            delete mConditions[parameter];
          }
        });
      }

      //Only keep the actual value of filters and remove type informations
      Object.keys(mConditions).forEach(function (key) {
        mConditions[key].forEach(function (condition) {
          if (condition.values.length > 1) {
            condition.values = condition.values.slice(0, 1);
          }
        });
      });
      // On InitialLoad when initiallayout is visual, aPropertyInfoSet is always empty and we cannot get filters from MDCFilterUtil.
      // Also when SVQualifier is there then we should not change the listbinding filters to empty as we are not getting filters from MDCFilterUtil but
      // instead we need to not call listbinding.filter and use the template time binding itself.
      if (Object.keys(mConditions).length > 0 && aValueListPropertyInfoSet.length) {
        oFilters = MdcFilterUtil.getFilterInfo(oFilterBar, mConditions, aValueListPropertyInfoSet, []).filters;
        if (oFilters) {
          if (!oFilters.aFilters) {
            aFilters.push(oFilters);
          } else if (oFilters.aFilters) {
            aFilters = oFilters.aFilters;
          }
        }
      }
      if (bIsDraftSupported) {
        aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      }
      if (aFilters && aFilters.length > 0) {
        oInteractiveChartListBinding.filter(aFilters);
      } else if (!Object.keys(mConditions).length) {
        oInteractiveChartListBinding.filter();
      }
      // update the interactive chart binding
      if (bEnableBinding && oInteractiveChartListBinding.isSuspended()) {
        oInteractiveChartListBinding.resume();
      }
      return aFilters;
    },
    getFilterCounts(oConditions) {
      if (this.data("multipleSelectionAllowed") === "false" && oConditions.length > 0) {
        return `(1)`;
      }
      if (oConditions.length > 0) {
        return `(${oConditions.length})`;
      } else {
        return undefined;
      }
    },
    scaleVisualFilterValue(oValue, scaleFactor, numberOfFractionalDigits, currency, oRawValue) {
      // ScaleFactor if defined is priority for formatting
      if (scaleFactor) {
        return VisualFilterUtils.getFormattedNumber(oRawValue, scaleFactor, numberOfFractionalDigits);
        // If Scale Factor is not defined, use currency formatting
      } else if (currency) {
        return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, undefined, currency);
        // No ScaleFactor and no Currency, use numberOfFractionalDigits defined in DataPoint
      } else if (numberOfFractionalDigits > 0) {
        // Number of fractional digits shall not exceed 2, unless required by currency
        numberOfFractionalDigits = numberOfFractionalDigits > 2 ? 2 : numberOfFractionalDigits;
        return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, numberOfFractionalDigits);
      } else {
        return oValue;
      }
    },
    fireValueHelp(oEvent) {
      oEvent.getSource().getParent().getParent().getParent().fireValueHelpRequest();
    }
  };

  /**
   * @global
   */
  return VisualFilterRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJSdW50aW1lIiwic2VsZWN0aW9uQ2hhbmdlZCIsIm9FdmVudCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0U291cmNlIiwic091dFBhcmFtZXRlciIsImRhdGEiLCJzVmFsdWVMaXN0UHJvcGVydHkiLCJzRGltZW5zaW9uIiwic0RpbWVuc2lvblRleHQiLCJiTXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwic0RpbWVuc2lvblR5cGUiLCJvU2VsZWN0ZWRBZ2dyZWdhdGlvbiIsImdldFBhcmFtZXRlciIsImJJc0FnZ3JlZ2F0aW9uU2VsZWN0ZWQiLCJvQ29uZGl0aW9uTW9kZWwiLCJnZXRNb2RlbCIsImFDb25kaXRpb25zIiwiZ2V0UHJvcGVydHkiLCJMb2ciLCJlcnJvciIsInNTZWxlY3Rpb25DaGFuZ2VkVmFsdWUiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldE9iamVjdCIsInNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0IiwiU3RyaW5nIiwidW5kZWZpbmVkIiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJfcGFyc2VEYXRlVGltZSIsIm9Db25kaXRpb24iLCJDb25kaXRpb24iLCJjcmVhdGVJdGVtQ29uZGl0aW9uIiwicHVzaCIsImZpbHRlciIsIm9wZXJhdG9yIiwiRGF0ZSIsInBhcnNlIiwidmFsdWVzIiwic2V0UHJvcGVydHkiLCJnZXRBZ2dyZWdhdGlvblNlbGVjdGVkIiwiYVNlbGVjdGFibGVWYWx1ZXMiLCJpIiwibGVuZ3RoIiwiZ2V0UGFyZW50Iiwic0RpbWVuc2lvblZhbHVlIiwiaW5kZXhPZiIsImdldEZpbHRlcnNGcm9tQ29uZGl0aW9ucyIsImFBcmd1bWVudHMiLCJvRmlsdGVyQmFyIiwiYUluUGFyYW1ldGVycyIsImN1c3RvbURhdGEiLCJiSXNEcmFmdFN1cHBvcnRlZCIsImFQcm9wZXJ0eUluZm9TZXQiLCJnZXRQcm9wZXJ0eUluZm8iLCJtQ29uZGl0aW9ucyIsImFWYWx1ZUxpc3RQcm9wZXJ0eUluZm9TZXQiLCJvRmlsdGVycyIsImFGaWx0ZXJzIiwiYVBhcmFtZXRlcnMiLCJvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24iLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsInNQYXRoIiwiZ2V0UGF0aCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiZ2V0Q3VzdG9tQ29uZGl0aW9ucyIsImJpbmQiLCJ0eXBlQ29uZmlnIiwiVHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwiZGF0YVR5cGUiLCJvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMiLCJjb252ZXJ0RmlsdGVyQ29uZGlvbnMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNLZXkiLCJpblBhcmFtZXRlckZvcktleSIsImZpbmQiLCJpblBhcmFtZXRlciIsInZhbHVlTGlzdFByb3BlcnR5IiwibG9jYWxEYXRhUHJvcGVydHkiLCJwcm9wZXJ0eUluZm9TZXQiLCJuYW1lIiwiYmFzZVR5cGUiLCJjb25kaXRpb24iLCJfZm9ybWF0RGF0ZVRpbWUiLCJvSW5QYXJhbWV0ZXIiLCJpbmRleCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNJbmZvUGF0aCIsImJFbmFibGVCaW5kaW5nIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImFSZXF1aXJlZFByb3BlcnRpZXMiLCJhTm90TWF0Y2hlZENvbmRpdGlvbnMiLCJyZXF1aXJlZFByb3BlcnR5UGF0aCIsImVycm9yTWVzc2FnZVRpdGxlIiwiZXJyb3JNZXNzYWdlIiwic2hvd0Vycm9yIiwiZ2V0VGV4dCIsInNMYWJlbCIsInNGaWx0ZXJFbnRpdHlOYW1lIiwic3BsaXQiLCJzQ2hhcnRFbnRpdHlOYW1lIiwic0JpbmRpbmdQYXRoIiwiRmlsdGVyVXRpbHMiLCJnZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCJrZXkiLCJzbGljZSIsIk1kY0ZpbHRlclV0aWwiLCJnZXRGaWx0ZXJJbmZvIiwiZmlsdGVycyIsIkZpbHRlciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJpc1N1c3BlbmRlZCIsInJlc3VtZSIsImdldEZpbHRlckNvdW50cyIsIm9Db25kaXRpb25zIiwic2NhbGVWaXN1YWxGaWx0ZXJWYWx1ZSIsIm9WYWx1ZSIsInNjYWxlRmFjdG9yIiwibnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIiwiY3VycmVuY3kiLCJvUmF3VmFsdWUiLCJnZXRGb3JtYXR0ZWROdW1iZXIiLCJmaXJlVmFsdWVIZWxwIiwiZmlyZVZhbHVlSGVscFJlcXVlc3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpc3VhbEZpbHRlclJ1bnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgVmlzdWFsRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci91dGlscy9WaXN1YWxGaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgTWRjRmlsdGVyVXRpbCBmcm9tIFwic2FwL3VpL21kYy91dGlsL0ZpbHRlclV0aWxcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbi8qKlxuICogU3RhdGljIGNsYXNzIHVzZWQgYnkgVmlzdWFsIEZpbHRlciBkdXJpbmcgcnVudGltZVxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbmNvbnN0IFZpc3VhbEZpbHRlclJ1bnRpbWUgPSB7XG5cdHNlbGVjdGlvbkNoYW5nZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBzT3V0UGFyYW1ldGVyID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcIm91dFBhcmFtZXRlclwiKTtcblx0XHRjb25zdCBzVmFsdWVMaXN0UHJvcGVydHkgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwidmFsdWVsaXN0UHJvcGVydHlcIik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvbiA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkaW1lbnNpb25cIik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvblRleHQgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwiZGltZW5zaW9uVGV4dFwiKTtcblx0XHRjb25zdCBiTXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcIm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZFwiKTtcblx0XHRjb25zdCBzRGltZW5zaW9uVHlwZSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkaW1lbnNpb25UeXBlXCIpO1xuXHRcdGNvbnN0IG9TZWxlY3RlZEFnZ3JlZ2F0aW9uID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImJhclwiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicG9pbnRcIikgfHwgb0V2ZW50LmdldFBhcmFtZXRlcihcInNlZ21lbnRcIik7XG5cdFx0Y29uc3QgYklzQWdncmVnYXRpb25TZWxlY3RlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzZWxlY3RlZFwiKTtcblx0XHRjb25zdCBvQ29uZGl0aW9uTW9kZWwgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRNb2RlbChcIiRmaWVsZFwiKTtcblx0XHRsZXQgYUNvbmRpdGlvbnMgPSBvQ29uZGl0aW9uTW9kZWwuZ2V0UHJvcGVydHkoXCIvY29uZGl0aW9uc1wiKTtcblxuXHRcdGlmICghc091dFBhcmFtZXRlciB8fCBzVmFsdWVMaXN0UHJvcGVydHkgIT09IHNEaW1lbnNpb24pIHtcblx0XHRcdExvZy5lcnJvcihcIlZpc3VhbEZpbHRlcjogQ2Fubm90IHN5bmMgdmFsdWVzIHdpdGggcmVndWxhciBmaWx0ZXIgYXMgb3V0IHBhcmFtZXRlciBpcyBub3QgY29uZmlndXJlZCBwcm9wZXJseSFcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlID0gb1NlbGVjdGVkQWdncmVnYXRpb24uZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRPYmplY3Qoc1ZhbHVlTGlzdFByb3BlcnR5KTtcblx0XHRcdGlmIChzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlKSB7XG5cdFx0XHRcdGxldCBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCA9IG9TZWxlY3RlZEFnZ3JlZ2F0aW9uLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0T2JqZWN0KHNEaW1lbnNpb25UZXh0KTtcblx0XHRcdFx0aWYgKHR5cGVvZiBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCAhPT0gXCJzdHJpbmdcIiAmJiAhKHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0IGluc3RhbmNlb2YgU3RyaW5nKSkge1xuXHRcdFx0XHRcdHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIHNlbGVjdGlvbiBoYXMgYmVlbiBkb25lIG9uIHRoZSBhZ2dyZWdhdGlvbiB0aGVuIGFkZCB0byBjb25kaXRpb25zXG5cdFx0XHRcdGlmIChiSXNBZ2dyZWdhdGlvblNlbGVjdGVkKSB7XG5cdFx0XHRcdFx0aWYgKGJNdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWQgPT09IFwiZmFsc2VcIikge1xuXHRcdFx0XHRcdFx0YUNvbmRpdGlvbnMgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRcdFx0XHRzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlID0gVmlzdWFsRmlsdGVyVXRpbHMuX3BhcnNlRGF0ZVRpbWUoc1NlbGVjdGlvbkNoYW5nZWRWYWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBDb25kaXRpb24uY3JlYXRlSXRlbUNvbmRpdGlvbihcblx0XHRcdFx0XHRcdHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWUsXG5cdFx0XHRcdFx0XHRzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRcdHt9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhQ29uZGl0aW9ucy5wdXNoKG9Db25kaXRpb24pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGJlY2F1c2Ugc2VsZWN0aW9uIHdhcyByZW1vdmVkIG9uIHRoZSBhZ2dyZWdhdGlvbiBoZW5jZSByZW1vdmUgdGhpcyBmcm9tIGNvbmRpdGlvbnNcblx0XHRcdFx0XHRhQ29uZGl0aW9ucyA9IGFDb25kaXRpb25zLmZpbHRlcihmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9Db25kaXRpb24ub3BlcmF0b3IgIT09IFwiRVFcIiB8fCBEYXRlLnBhcnNlKG9Db25kaXRpb24udmFsdWVzWzBdKSAhPT0gRGF0ZS5wYXJzZShzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBvQ29uZGl0aW9uLm9wZXJhdG9yICE9PSBcIkVRXCIgfHwgb0NvbmRpdGlvbi52YWx1ZXNbMF0gIT09IHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbmRpdGlvbk1vZGVsLnNldFByb3BlcnR5KFwiL2NvbmRpdGlvbnNcIiwgYUNvbmRpdGlvbnMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiVmlzdWFsRmlsdGVyOiBObyB2YXVlIGZvdW5kIGZvciB0aGUgb3V0UGFyYW1ldGVyXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Ly8gVEhJUyBJUyBBIEZPUk1BVFRFUlxuXHRnZXRBZ2dyZWdhdGlvblNlbGVjdGVkKHRoaXM6IE1hbmFnZWRPYmplY3QsIGFDb25kaXRpb25zOiBhbnkpIHtcblx0XHRsZXQgYVNlbGVjdGFibGVWYWx1ZXMgPSBbXTtcblx0XHRpZiAoIXRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZGl0aW9ucy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBhQ29uZGl0aW9uc1tpXTtcblx0XHRcdC8vIDEuIGdldCBjb25kaXRpb25zIHdpdGggRVEgb3BlcmF0b3IgKHNpbmNlIHZpc3VhbCBmaWx0ZXIgY2FuIG9ubHkgZGVhbCB3aXRoIEVRIG9wZXJhdG9ycykgYW5kIGdldCB0aGVpciB2YWx1ZXNcblx0XHRcdGlmIChvQ29uZGl0aW9uLm9wZXJhdG9yID09PSBcIkVRXCIpIHtcblx0XHRcdFx0YVNlbGVjdGFibGVWYWx1ZXMucHVzaChvQ29uZGl0aW9uLnZhbHVlc1swXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWNjZXNzIHRoZSBpbnRlcmFjdGl2ZSBjaGFydCBmcm9tIHRoZSBjb250cm9sLlxuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0ID0gdGhpcy5nZXRQYXJlbnQoKSBhcyBDb250cm9sO1xuXHRcdGNvbnN0IHNEaW1lbnNpb24gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwiZGltZW5zaW9uXCIpO1xuXHRcdGNvbnN0IHNEaW1lbnNpb25UeXBlID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcImRpbWVuc2lvblR5cGVcIik7XG5cdFx0bGV0IHNEaW1lbnNpb25WYWx1ZSA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0T2JqZWN0KHNEaW1lbnNpb24pO1xuXHRcdGlmIChzRGltZW5zaW9uVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0c0RpbWVuc2lvblZhbHVlID0gVmlzdWFsRmlsdGVyVXRpbHMuX3BhcnNlRGF0ZVRpbWUoc0RpbWVuc2lvblZhbHVlKSBhcyBhbnk7XG5cdFx0fVxuXHRcdGlmIChvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkXCIpID09PSBcImZhbHNlXCIgJiYgYVNlbGVjdGFibGVWYWx1ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0YVNlbGVjdGFibGVWYWx1ZXMgPSBbYVNlbGVjdGFibGVWYWx1ZXNbMF1dO1xuXHRcdH1cblx0XHRyZXR1cm4gYVNlbGVjdGFibGVWYWx1ZXMuaW5kZXhPZihzRGltZW5zaW9uVmFsdWUpID4gLTE7XG5cdH0sXG5cdC8vIFRISVMgSVMgQSBGT1JNQVRURVJcblx0Z2V0RmlsdGVyc0Zyb21Db25kaXRpb25zKHRoaXM6IE1hbmFnZWRPYmplY3QsIC4uLmFBcmd1bWVudHM6IGFueVtdKSB7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnQgPSB0aGlzLmdldFBhcmVudCgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKT8uZ2V0UGFyZW50KCk/LmdldFBhcmVudCgpIGFzIGFueTtcblx0XHRjb25zdCBhSW5QYXJhbWV0ZXJzID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcImluUGFyYW1ldGVyc1wiKS5jdXN0b21EYXRhO1xuXHRcdGNvbnN0IGJJc0RyYWZ0U3VwcG9ydGVkID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcImRyYWZ0U3VwcG9ydGVkXCIpID09PSBcInRydWVcIjtcblx0XHRjb25zdCBhUHJvcGVydHlJbmZvU2V0ID0gb0ZpbHRlckJhci5nZXRQcm9wZXJ0eUluZm8oKTtcblx0XHRjb25zdCBtQ29uZGl0aW9uczogYW55ID0ge307XG5cdFx0Y29uc3QgYVZhbHVlTGlzdFByb3BlcnR5SW5mb1NldDogYW55W10gPSBbXTtcblx0XHRsZXQgb0ZpbHRlcnM7XG5cdFx0bGV0IGFGaWx0ZXJzID0gW107XG5cdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicGFyYW1ldGVyc1wiKS5jdXN0b21EYXRhO1xuXHRcdGNvbnN0IG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uXCIpKTtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nID0gKG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJiYXJzXCIpIHx8XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwicG9pbnRzXCIpIHx8XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwic2VnbWVudHNcIikpIGFzIGFueTtcblx0XHRjb25zdCBzUGF0aCA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5nZXRQYXRoKCk7XG5cdFx0Y29uc3QgZmlsdGVyQ29uZGl0aW9ucyA9IGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRzRW50aXR5U2V0UGF0aCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5nZXRDdXN0b21Db25kaXRpb25zLmJpbmQoVmlzdWFsRmlsdGVyVXRpbHMpXG5cdFx0KTtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYVByb3BlcnR5SW5mb1NldCkge1xuXHRcdFx0YVByb3BlcnR5SW5mb1NldFtpXS50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhhUHJvcGVydHlJbmZvU2V0W2ldLmRhdGFUeXBlLCB7fSwge30pO1xuXHRcdH1cblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMgPSBWaXN1YWxGaWx0ZXJVdGlscy5jb252ZXJ0RmlsdGVyQ29uZGlvbnMoZmlsdGVyQ29uZGl0aW9ucyk7XG5cdFx0Ly8gYUluUGFyYW1ldGVycyBhbmQgdGhlIGJpbmRpbmdzIHRvIGluIHBhcmFtZXRlcnMgYXJlIGluIHRoZSBzYW1lIG9yZGVyIHNvIHdlIGNhbiByZWx5IG9uIGl0IHRvIGNyZWF0ZSBvdXIgY29uZGl0aW9uc1xuXHRcdE9iamVjdC5rZXlzKG9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRtQ29uZGl0aW9uc1tzS2V5XSA9IG9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9uc1tzS2V5XTtcblx0XHRcdC8vZmV0Y2ggbG9jYWxEYXRhUHJvcGVydHkgaWYgc2VsZWN0aW9uIHZhcmlhbnQga2V5IGlzIGJhc2VkIG9uIHZhdWUgbGlzdCBwcm9wZXJ0eVxuXHRcdFx0Y29uc3QgaW5QYXJhbWV0ZXJGb3JLZXkgPSBhSW5QYXJhbWV0ZXJzLmZpbmQoZnVuY3Rpb24gKGluUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGluUGFyYW1ldGVyLnZhbHVlTGlzdFByb3BlcnR5ID09PSBzS2V5O1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBsb2NhbERhdGFQcm9wZXJ0eSA9IGluUGFyYW1ldGVyRm9yS2V5ID8gaW5QYXJhbWV0ZXJGb3JLZXkubG9jYWxEYXRhUHJvcGVydHkgOiBzS2V5O1xuXHRcdFx0aWYgKCFhUGFyYW1ldGVycyB8fCAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMuaW5kZXhPZihzS2V5KSA9PT0gLTEpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhUHJvcGVydHlJbmZvU2V0KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlJbmZvU2V0ID0gYVByb3BlcnR5SW5mb1NldFtpXTtcblx0XHRcdFx0XHRpZiAobG9jYWxEYXRhUHJvcGVydHkgPT09IHByb3BlcnR5SW5mb1NldC5uYW1lKSB7XG5cdFx0XHRcdFx0XHRpZiAocHJvcGVydHlJbmZvU2V0LnR5cGVDb25maWcuYmFzZVR5cGUgPT09IFwiRGF0ZVRpbWVcIikge1xuXHRcdFx0XHRcdFx0XHRpZiAobUNvbmRpdGlvbnNbc0tleV0pIHtcblx0XHRcdFx0XHRcdFx0XHRtQ29uZGl0aW9uc1tzS2V5XS5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb246IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uZGl0aW9uLnZhbHVlc1swXSA9IFZpc3VhbEZpbHRlclV0aWxzLl9mb3JtYXREYXRlVGltZShjb25kaXRpb24udmFsdWVzWzBdKTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YVZhbHVlTGlzdFByb3BlcnR5SW5mb1NldC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0bmFtZTogc0tleSxcblx0XHRcdFx0XHRcdFx0dHlwZUNvbmZpZzogcHJvcGVydHlJbmZvU2V0LnR5cGVDb25maWdcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGFJblBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob0luUGFyYW1ldGVyOiBhbnksIGluZGV4OiBhbnkpIHtcblx0XHRcdGlmIChhQXJndW1lbnRzW2luZGV4XS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8vIHN0b3JlIGNvbmRpdGlvbnMgd2l0aCB2YWx1ZSBsaXN0IHByb3BlcnR5IHNpbmNlIHdlIGFyZSBmaWx0ZXJpbmcgb24gdGhlIHZhbHVlIGxpc3QgY29sbGVjdGlvbiBwYXRoXG5cdFx0XHRcdG1Db25kaXRpb25zW29JblBhcmFtZXRlci52YWx1ZUxpc3RQcm9wZXJ0eV0gPSBhQXJndW1lbnRzW2luZGV4XTtcblx0XHRcdFx0aWYgKCFhUGFyYW1ldGVycyB8fCAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMuaW5kZXhPZihvSW5QYXJhbWV0ZXIudmFsdWVMaXN0UHJvcGVydHkpID09PSAtMSkpIHtcblx0XHRcdFx0XHQvLyBhUHJvcGVydHlJbmZvU2V0IGlzIGxpc3Qgb2YgcHJvcGVydGllcyBmcm9tIHRoZSBmaWx0ZXIgYmFyIGJ1dCB3ZSBuZWVkIHRvIGNyZWF0ZSBjb25kaXRpb25zIGZvciB0aGUgdmFsdWUgbGlzdFxuXHRcdFx0XHRcdC8vIHdoaWNoIGNvdWxkIGhhdmUgYSBkaWZmZXJlbnQgY29sbGVjdGlvblBhdGguXG5cdFx0XHRcdFx0Ly8gT25seSB0eXBlQ29uZmlnIGZyb20gYVByb3BlcnR5SW5mb1NldCBpcyByZXF1aXJlZCBmb3IgZ2V0dGluZyB0aGUgY29udmVydGVkIGZpbHRlcnMgZnJvbSBjb25kaXRpb25zXG5cdFx0XHRcdFx0Ly8gc28gd2UgdXBkYXRlIGFQcm9wZXJ0eUluZm9TZXQgdG8gaGF2ZSB0aGUgdmFsdWVMaXN0UHJvcGVydGllcyBvbmx5XG5cdFx0XHRcdFx0Ly8gVGhpcyB3YXkgY29uZGl0aW9ucyB3aWxsIGJlIGNvbnZlcnRlZCB0byBzYXAudWkubW9kZWwuRmlsdGVyIGZvciB0aGUgdmFsdWUgbGlzdFxuXHRcdFx0XHRcdC8vIFRoaXMgd29ya3MgYmVjYXVzZSBmb3IgaW4gcGFyYW1ldGVyIG1hcHBpbmcgdGhlIHByb3BlcnR5IGZyb20gdGhlIG1haW4gZW50aXR5IHR5cGUgc2hvdWxkIGJlIG9mIHRoZSBzYW1lIHR5cGUgYXMgdGhlIHZhbHVlIGxpc3QgZW50aXR5IHR5cGVcblx0XHRcdFx0XHQvLyBUT0RPOiBGb2xsb3cgdXAgd2l0aCBNREMgdG8gY2hlY2sgaWYgdGhleSBjYW4gcHJvdmlkZSBhIGNsZWFuIGFwaSB0byBjb252ZXJ0IGNvbmRpdGlvbnMgaW50byBmaWx0ZXJzXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFQcm9wZXJ0eUluZm9TZXQpIHtcblx0XHRcdFx0XHRcdC8vIHN0b3JlIGNvbmRpdGlvbnMgd2l0aCB2YWx1ZSBsaXN0IHByb3BlcnR5IHNpbmNlIHdlIGFyZSBmaWx0ZXJpbmcgb24gdGhlIHZhbHVlIGxpc3QgY29sbGVjdGlvbiBwYXRoXG5cdFx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eUluZm9TZXQgPSBhUHJvcGVydHlJbmZvU2V0W2ldO1xuXHRcdFx0XHRcdFx0aWYgKHByb3BlcnR5SW5mb1NldC5uYW1lID09PSBvSW5QYXJhbWV0ZXIubG9jYWxEYXRhUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHByb3BlcnR5SW5mb1NldC50eXBlQ29uZmlnLmJhc2VUeXBlID09PSBcIkRhdGVUaW1lXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAobUNvbmRpdGlvbnNbb0luUGFyYW1ldGVyLnZhbHVlTGlzdFByb3BlcnR5XSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bUNvbmRpdGlvbnNbb0luUGFyYW1ldGVyLnZhbHVlTGlzdFByb3BlcnR5XS5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb246IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25kaXRpb24udmFsdWVzWzBdID0gVmlzdWFsRmlsdGVyVXRpbHMuX2Zvcm1hdERhdGVUaW1lKGNvbmRpdGlvbi52YWx1ZXNbMF0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZUxpc3RQcm9wZXJ0eUluZm9TZXQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZTogb0luUGFyYW1ldGVyLnZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRcdHR5cGVDb25maWc6IHByb3BlcnR5SW5mb1NldC50eXBlQ29uZmlnXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBzSW5mb1BhdGggPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwiaW5mb1BhdGhcIik7XG5cdFx0bGV0IGJFbmFibGVCaW5kaW5nO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicmVxdWlyZWRQcm9wZXJ0aWVzXCIpKTtcblx0XHRpZiAoYVJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFDb25kaXRpb25zID0gT2JqZWN0LmtleXMobUNvbmRpdGlvbnMpIHx8IFtdO1xuXHRcdFx0Y29uc3QgYU5vdE1hdGNoZWRDb25kaXRpb25zOiBhbnlbXSA9IFtdO1xuXHRcdFx0YVJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChyZXF1aXJlZFByb3BlcnR5UGF0aDogYW55KSB7XG5cdFx0XHRcdGlmIChhQ29uZGl0aW9ucy5pbmRleE9mKHJlcXVpcmVkUHJvcGVydHlQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTm90TWF0Y2hlZENvbmRpdGlvbnMucHVzaChyZXF1aXJlZFByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFhTm90TWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdGJFbmFibGVCaW5kaW5nID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke3NJbmZvUGF0aH0vc2hvd0Vycm9yYCk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW5mb1BhdGgsIHtcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogXCJcIixcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IFwiXCIsXG5cdFx0XHRcdFx0c2hvd0Vycm9yOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoYU5vdE1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbmZvUGF0aCwge1xuXHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfTVVMVElQTEVWRlwiKSxcblx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNMYWJlbCA9XG5cdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyR7YU5vdE1hdGNoZWRDb25kaXRpb25zWzBdfUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKSB8fFxuXHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9uc1swXTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbmZvUGF0aCwge1xuXHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfU0lOR0xFVkZcIiwgc0xhYmVsKSxcblx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YkVuYWJsZUJpbmRpbmcgPSBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoYCR7c0luZm9QYXRofS9zaG93RXJyb3JgKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW5mb1BhdGgsIHsgZXJyb3JNZXNzYWdlVGl0bGU6IFwiXCIsIGVycm9yTWVzc2FnZTogXCJcIiwgc2hvd0Vycm9yOiBmYWxzZSB9KTtcblx0XHR9XG5cblx0XHRjb25zdCBzRmlsdGVyRW50aXR5TmFtZSA9IG9GaWx0ZXJCYXIuZGF0YShcImVudGl0eVR5cGVcIikuc3BsaXQoXCIvXCIpWzFdO1xuXHRcdGNvbnN0IHNDaGFydEVudGl0eU5hbWUgPSBzUGF0aC5zcGxpdChcIi9cIilbMV0uc3BsaXQoXCIoXCIpWzBdO1xuXHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5sZW5ndGggJiYgc0ZpbHRlckVudGl0eU5hbWUgPT09IHNDaGFydEVudGl0eU5hbWUpIHtcblx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IGJFbmFibGVCaW5kaW5nXG5cdFx0XHRcdD8gRmlsdGVyVXRpbHMuZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIsIG1Db25kaXRpb25zLCBhUHJvcGVydHlJbmZvU2V0LCBhUGFyYW1ldGVycylcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cblx0XHRcdGlmIChzQmluZGluZ1BhdGgpIHtcblx0XHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5zUGF0aCA9IHNCaW5kaW5nUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoKSB7XG5cdFx0XHQvL1JlbW92ZSBwYXJhbWV0ZXJzIGZyb20gbUNvbmRpdGlvbnMgc2luY2UgaXQgc2hvdWxkIG5vdCBiZSBhIHBhcnQgb2YgJGZpbHRlclxuXHRcdFx0YVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0aWYgKG1Db25kaXRpb25zW3BhcmFtZXRlcl0pIHtcblx0XHRcdFx0XHRkZWxldGUgbUNvbmRpdGlvbnNbcGFyYW1ldGVyXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly9Pbmx5IGtlZXAgdGhlIGFjdHVhbCB2YWx1ZSBvZiBmaWx0ZXJzIGFuZCByZW1vdmUgdHlwZSBpbmZvcm1hdGlvbnNcblx0XHRPYmplY3Qua2V5cyhtQ29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdG1Db25kaXRpb25zW2tleV0uZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0aWYgKGNvbmRpdGlvbi52YWx1ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGNvbmRpdGlvbi52YWx1ZXMgPSBjb25kaXRpb24udmFsdWVzLnNsaWNlKDAsIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHQvLyBPbiBJbml0aWFsTG9hZCB3aGVuIGluaXRpYWxsYXlvdXQgaXMgdmlzdWFsLCBhUHJvcGVydHlJbmZvU2V0IGlzIGFsd2F5cyBlbXB0eSBhbmQgd2UgY2Fubm90IGdldCBmaWx0ZXJzIGZyb20gTURDRmlsdGVyVXRpbC5cblx0XHQvLyBBbHNvIHdoZW4gU1ZRdWFsaWZpZXIgaXMgdGhlcmUgdGhlbiB3ZSBzaG91bGQgbm90IGNoYW5nZSB0aGUgbGlzdGJpbmRpbmcgZmlsdGVycyB0byBlbXB0eSBhcyB3ZSBhcmUgbm90IGdldHRpbmcgZmlsdGVycyBmcm9tIE1EQ0ZpbHRlclV0aWwgYnV0XG5cdFx0Ly8gaW5zdGVhZCB3ZSBuZWVkIHRvIG5vdCBjYWxsIGxpc3RiaW5kaW5nLmZpbHRlciBhbmQgdXNlIHRoZSB0ZW1wbGF0ZSB0aW1lIGJpbmRpbmcgaXRzZWxmLlxuXHRcdGlmIChPYmplY3Qua2V5cyhtQ29uZGl0aW9ucykubGVuZ3RoID4gMCAmJiBhVmFsdWVMaXN0UHJvcGVydHlJbmZvU2V0Lmxlbmd0aCkge1xuXHRcdFx0b0ZpbHRlcnMgPSAoTWRjRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXJCYXIsIG1Db25kaXRpb25zLCBhVmFsdWVMaXN0UHJvcGVydHlJbmZvU2V0LCBbXSkgYXMgYW55KS5maWx0ZXJzO1xuXHRcdFx0aWYgKG9GaWx0ZXJzKSB7XG5cdFx0XHRcdGlmICghb0ZpbHRlcnMuYUZpbHRlcnMpIHtcblx0XHRcdFx0XHRhRmlsdGVycy5wdXNoKG9GaWx0ZXJzKTtcblx0XHRcdFx0fSBlbHNlIGlmIChvRmlsdGVycy5hRmlsdGVycykge1xuXHRcdFx0XHRcdGFGaWx0ZXJzID0gb0ZpbHRlcnMuYUZpbHRlcnM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGJJc0RyYWZ0U3VwcG9ydGVkKSB7XG5cdFx0XHRhRmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoXCJJc0FjdGl2ZUVudGl0eVwiLCBGaWx0ZXJPcGVyYXRvci5FUSwgdHJ1ZSkpO1xuXHRcdH1cblx0XHRpZiAoYUZpbHRlcnMgJiYgYUZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5maWx0ZXIoYUZpbHRlcnMpO1xuXHRcdH0gZWxzZSBpZiAoIU9iamVjdC5rZXlzKG1Db25kaXRpb25zKS5sZW5ndGgpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZmlsdGVyKCk7XG5cdFx0fVxuXHRcdC8vIHVwZGF0ZSB0aGUgaW50ZXJhY3RpdmUgY2hhcnQgYmluZGluZ1xuXHRcdGlmIChiRW5hYmxlQmluZGluZyAmJiBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcucmVzdW1lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBhRmlsdGVycztcblx0fSxcblx0Z2V0RmlsdGVyQ291bnRzKHRoaXM6IENvbnRyb2wsIG9Db25kaXRpb25zOiBhbnkpIHtcblx0XHRpZiAodGhpcy5kYXRhKFwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkXCIpID09PSBcImZhbHNlXCIgJiYgb0NvbmRpdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIGAoMSlgO1xuXHRcdH1cblx0XHRpZiAob0NvbmRpdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIGAoJHtvQ29uZGl0aW9ucy5sZW5ndGh9KWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXG5cdHNjYWxlVmlzdWFsRmlsdGVyVmFsdWUob1ZhbHVlOiBhbnksIHNjYWxlRmFjdG9yOiBhbnksIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0czogYW55LCBjdXJyZW5jeTogYW55LCBvUmF3VmFsdWU6IGFueSkge1xuXHRcdC8vIFNjYWxlRmFjdG9yIGlmIGRlZmluZWQgaXMgcHJpb3JpdHkgZm9yIGZvcm1hdHRpbmdcblx0XHRpZiAoc2NhbGVGYWN0b3IpIHtcblx0XHRcdHJldHVybiBWaXN1YWxGaWx0ZXJVdGlscy5nZXRGb3JtYXR0ZWROdW1iZXIob1Jhd1ZhbHVlLCBzY2FsZUZhY3RvciwgbnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzKTtcblx0XHRcdC8vIElmIFNjYWxlIEZhY3RvciBpcyBub3QgZGVmaW5lZCwgdXNlIGN1cnJlbmN5IGZvcm1hdHRpbmdcblx0XHR9IGVsc2UgaWYgKGN1cnJlbmN5KSB7XG5cdFx0XHRyZXR1cm4gVmlzdWFsRmlsdGVyVXRpbHMuZ2V0Rm9ybWF0dGVkTnVtYmVyKG9SYXdWYWx1ZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGN1cnJlbmN5KTtcblx0XHRcdC8vIE5vIFNjYWxlRmFjdG9yIGFuZCBubyBDdXJyZW5jeSwgdXNlIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyBkZWZpbmVkIGluIERhdGFQb2ludFxuXHRcdH0gZWxzZSBpZiAobnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzID4gMCkge1xuXHRcdFx0Ly8gTnVtYmVyIG9mIGZyYWN0aW9uYWwgZGlnaXRzIHNoYWxsIG5vdCBleGNlZWQgMiwgdW5sZXNzIHJlcXVpcmVkIGJ5IGN1cnJlbmN5XG5cdFx0XHRudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgPSBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgPiAyID8gMiA6IG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cztcblx0XHRcdHJldHVybiBWaXN1YWxGaWx0ZXJVdGlscy5nZXRGb3JtYXR0ZWROdW1iZXIob1Jhd1ZhbHVlLCB1bmRlZmluZWQsIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBvVmFsdWU7XG5cdFx0fVxuXHR9LFxuXHRmaXJlVmFsdWVIZWxwKG9FdmVudDogYW55KSB7XG5cdFx0b0V2ZW50LmdldFNvdXJjZSgpLmdldFBhcmVudCgpLmdldFBhcmVudCgpLmdldFBhcmVudCgpLmZpcmVWYWx1ZUhlbHBSZXF1ZXN0KCk7XG5cdH1cbn07XG5cbi8qKlxuICogQGdsb2JhbFxuICovXG5leHBvcnQgZGVmYXVsdCBWaXN1YWxGaWx0ZXJSdW50aW1lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxtQkFBbUIsR0FBRztJQUMzQkMsZ0JBQWdCLENBQUNDLE1BQVcsRUFBRTtNQUM3QixNQUFNQyxpQkFBaUIsR0FBR0QsTUFBTSxDQUFDRSxTQUFTLEVBQUU7TUFDNUMsTUFBTUMsYUFBYSxHQUFHRixpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLGNBQWMsQ0FBQztNQUM1RCxNQUFNQyxrQkFBa0IsR0FBR0osaUJBQWlCLENBQUNHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztNQUN0RSxNQUFNRSxVQUFVLEdBQUdMLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsV0FBVyxDQUFDO01BQ3RELE1BQU1HLGNBQWMsR0FBR04saUJBQWlCLENBQUNHLElBQUksQ0FBQyxlQUFlLENBQUM7TUFDOUQsTUFBTUkseUJBQXlCLEdBQUdQLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7TUFDcEYsTUFBTUssY0FBYyxHQUFHUixpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLGVBQWUsQ0FBQztNQUM5RCxNQUFNTSxvQkFBb0IsR0FBR1YsTUFBTSxDQUFDVyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUlYLE1BQU0sQ0FBQ1csWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJWCxNQUFNLENBQUNXLFlBQVksQ0FBQyxTQUFTLENBQUM7TUFDekgsTUFBTUMsc0JBQXNCLEdBQUdaLE1BQU0sQ0FBQ1csWUFBWSxDQUFDLFVBQVUsQ0FBQztNQUM5RCxNQUFNRSxlQUFlLEdBQUdaLGlCQUFpQixDQUFDYSxRQUFRLENBQUMsUUFBUSxDQUFDO01BQzVELElBQUlDLFdBQVcsR0FBR0YsZUFBZSxDQUFDRyxXQUFXLENBQUMsYUFBYSxDQUFDO01BRTVELElBQUksQ0FBQ2IsYUFBYSxJQUFJRSxrQkFBa0IsS0FBS0MsVUFBVSxFQUFFO1FBQ3hEVyxHQUFHLENBQUNDLEtBQUssQ0FBQyxtR0FBbUcsQ0FBQztNQUMvRyxDQUFDLE1BQU07UUFDTixJQUFJQyxzQkFBc0IsR0FBR1Qsb0JBQW9CLENBQUNVLGlCQUFpQixFQUFFLENBQUNDLFNBQVMsQ0FBQ2hCLGtCQUFrQixDQUFDO1FBQ25HLElBQUljLHNCQUFzQixFQUFFO1VBQzNCLElBQUlHLDBCQUEwQixHQUFHWixvQkFBb0IsQ0FBQ1UsaUJBQWlCLEVBQUUsQ0FBQ0MsU0FBUyxDQUFDZCxjQUFjLENBQUM7VUFDbkcsSUFBSSxPQUFPZSwwQkFBMEIsS0FBSyxRQUFRLElBQUksRUFBRUEsMEJBQTBCLFlBQVlDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RHRCwwQkFBMEIsR0FBR0UsU0FBUztVQUN2QztVQUNBO1VBQ0EsSUFBSVosc0JBQXNCLEVBQUU7WUFDM0IsSUFBSUoseUJBQXlCLEtBQUssT0FBTyxFQUFFO2NBQzFDTyxXQUFXLEdBQUcsRUFBRTtZQUNqQjtZQUNBLElBQUlOLGNBQWMsS0FBSyxvQkFBb0IsRUFBRTtjQUM1Q1Usc0JBQXNCLEdBQUdNLGlCQUFpQixDQUFDQyxjQUFjLENBQUNQLHNCQUFzQixDQUFDO1lBQ2xGO1lBQ0EsTUFBTVEsVUFBVSxHQUFHQyxTQUFTLENBQUNDLG1CQUFtQixDQUMvQ1Ysc0JBQXNCLEVBQ3RCRywwQkFBMEIsSUFBSUUsU0FBUyxFQUN2QyxDQUFDLENBQUMsRUFDRixDQUFDLENBQUMsQ0FDRjtZQUNEVCxXQUFXLENBQUNlLElBQUksQ0FBQ0gsVUFBVSxDQUFDO1VBQzdCLENBQUMsTUFBTTtZQUNOO1lBQ0FaLFdBQVcsR0FBR0EsV0FBVyxDQUFDZ0IsTUFBTSxDQUFDLFVBQVVKLFVBQWUsRUFBRTtjQUMzRCxJQUFJbEIsY0FBYyxLQUFLLG9CQUFvQixFQUFFO2dCQUM1QyxPQUFPa0IsVUFBVSxDQUFDSyxRQUFRLEtBQUssSUFBSSxJQUFJQyxJQUFJLENBQUNDLEtBQUssQ0FBQ1AsVUFBVSxDQUFDUSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBS0YsSUFBSSxDQUFDQyxLQUFLLENBQUNmLHNCQUFzQixDQUFDO2NBQy9HO2NBQ0EsT0FBT1EsVUFBVSxDQUFDSyxRQUFRLEtBQUssSUFBSSxJQUFJTCxVQUFVLENBQUNRLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBS2hCLHNCQUFzQjtZQUN2RixDQUFDLENBQUM7VUFDSDtVQUNBTixlQUFlLENBQUN1QixXQUFXLENBQUMsYUFBYSxFQUFFckIsV0FBVyxDQUFDO1FBQ3hELENBQUMsTUFBTTtVQUNORSxHQUFHLENBQUNDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQztRQUM5RDtNQUNEO0lBQ0QsQ0FBQztJQUNEO0lBQ0FtQixzQkFBc0IsQ0FBc0J0QixXQUFnQixFQUFFO01BQUE7TUFDN0QsSUFBSXVCLGlCQUFpQixHQUFHLEVBQUU7TUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQ2xCLGlCQUFpQixFQUFFLEVBQUU7UUFDOUI7TUFDRDtNQUNBLEtBQUssSUFBSW1CLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsSUFBSXhCLFdBQVcsQ0FBQ3lCLE1BQU0sR0FBRyxDQUFDLEVBQUVELENBQUMsRUFBRSxFQUFFO1FBQ2pELE1BQU1aLFVBQVUsR0FBR1osV0FBVyxDQUFDd0IsQ0FBQyxDQUFDO1FBQ2pDO1FBQ0EsSUFBSVosVUFBVSxDQUFDSyxRQUFRLEtBQUssSUFBSSxFQUFFO1VBQ2pDTSxpQkFBaUIsQ0FBQ1IsSUFBSSxDQUFDSCxVQUFVLENBQUNRLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QztNQUNEOztNQUVBO01BQ0EsTUFBTWxDLGlCQUFpQixHQUFHLElBQUksQ0FBQ3dDLFNBQVMsRUFBYTtNQUNyRCxNQUFNbkMsVUFBVSxHQUFHTCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLFdBQVcsQ0FBQztNQUN0RCxNQUFNSyxjQUFjLEdBQUdSLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsZUFBZSxDQUFDO01BQzlELElBQUlzQyxlQUFlLDRCQUFHLElBQUksQ0FBQ3RCLGlCQUFpQixFQUFFLDBEQUF4QixzQkFBMEJDLFNBQVMsQ0FBQ2YsVUFBVSxDQUFDO01BQ3JFLElBQUlHLGNBQWMsS0FBSyxvQkFBb0IsRUFBRTtRQUM1Q2lDLGVBQWUsR0FBR2pCLGlCQUFpQixDQUFDQyxjQUFjLENBQUNnQixlQUFlLENBQVE7TUFDM0U7TUFDQSxJQUFJekMsaUJBQWlCLENBQUNHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLE9BQU8sSUFBSWtDLGlCQUFpQixDQUFDRSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ25HRixpQkFBaUIsR0FBRyxDQUFDQSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUMzQztNQUNBLE9BQU9BLGlCQUFpQixDQUFDSyxPQUFPLENBQUNELGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ0Q7SUFDQUUsd0JBQXdCLEdBQTRDO01BQUE7TUFBQSxrQ0FBbkJDLFVBQVU7UUFBVkEsVUFBVTtNQUFBO01BQzFELE1BQU01QyxpQkFBaUIsR0FBRyxJQUFJLENBQUN3QyxTQUFTLEVBQWE7TUFDckQsTUFBTUssVUFBVSw0QkFBRzdDLGlCQUFpQixDQUFDd0MsU0FBUyxFQUFFLG9GQUE3QixzQkFBK0JBLFNBQVMsRUFBRSxxRkFBMUMsdUJBQTRDQSxTQUFTLEVBQUUsMkRBQXZELHVCQUF5REEsU0FBUyxFQUFTO01BQzlGLE1BQU1NLGFBQWEsR0FBRzlDLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM0QyxVQUFVO01BQ3ZFLE1BQU1DLGlCQUFpQixHQUFHaEQsaUJBQWlCLENBQUNHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLE1BQU07TUFDN0UsTUFBTThDLGdCQUFnQixHQUFHSixVQUFVLENBQUNLLGVBQWUsRUFBRTtNQUNyRCxNQUFNQyxXQUFnQixHQUFHLENBQUMsQ0FBQztNQUMzQixNQUFNQyx5QkFBZ0MsR0FBRyxFQUFFO01BQzNDLElBQUlDLFFBQVE7TUFDWixJQUFJQyxRQUFRLEdBQUcsRUFBRTtNQUNqQixNQUFNQyxXQUFXLEdBQUd2RCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDNEMsVUFBVTtNQUNuRSxNQUFNUywyQkFBMkIsR0FBR0MsWUFBWSxDQUFDQyxlQUFlLENBQUMxRCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7TUFDdEgsTUFBTXdELDRCQUE0QixHQUFJM0QsaUJBQWlCLENBQUM0RCxVQUFVLENBQUMsTUFBTSxDQUFDLElBQ3pFNUQsaUJBQWlCLENBQUM0RCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQ3RDNUQsaUJBQWlCLENBQUM0RCxVQUFVLENBQUMsVUFBVSxDQUFTO01BQ2pELE1BQU1DLEtBQUssR0FBR0YsNEJBQTRCLENBQUNHLE9BQU8sRUFBRTtNQUNwRCxNQUFNQyxVQUFVLEdBQUcvRCxpQkFBaUIsQ0FBQ2EsUUFBUSxFQUFFLENBQUNtRCxZQUFZLEVBQW9CO01BQ2hGLE1BQU1DLGNBQWMsR0FBR04sNEJBQTRCLENBQUNHLE9BQU8sRUFBRTtNQUM3RCxNQUFNSSxnQkFBZ0IsR0FBR0Msd0NBQXdDLENBQ2hFRixjQUFjLEVBQ2RGLFVBQVUsRUFDVlAsMkJBQTJCLEVBQzNCaEMsaUJBQWlCLENBQUM0QyxtQkFBbUIsQ0FBQ0MsSUFBSSxDQUFDN0MsaUJBQWlCLENBQUMsQ0FDN0Q7TUFDRCxLQUFLLE1BQU1jLENBQUMsSUFBSVcsZ0JBQWdCLEVBQUU7UUFDakNBLGdCQUFnQixDQUFDWCxDQUFDLENBQUMsQ0FBQ2dDLFVBQVUsR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUN2QixnQkFBZ0IsQ0FBQ1gsQ0FBQyxDQUFDLENBQUNtQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDOUY7TUFDQSxNQUFNQywyQkFBMkIsR0FBR2xELGlCQUFpQixDQUFDbUQscUJBQXFCLENBQUNULGdCQUFnQixDQUFDO01BQzdGO01BQ0FVLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDSCwyQkFBMkIsQ0FBQyxDQUFDSSxPQUFPLENBQUMsVUFBVUMsSUFBWSxFQUFFO1FBQ3hFNUIsV0FBVyxDQUFDNEIsSUFBSSxDQUFDLEdBQUdMLDJCQUEyQixDQUFDSyxJQUFJLENBQUM7UUFDckQ7UUFDQSxNQUFNQyxpQkFBaUIsR0FBR2xDLGFBQWEsQ0FBQ21DLElBQUksQ0FBQyxVQUFVQyxXQUFnQixFQUFFO1VBQ3hFLE9BQU9BLFdBQVcsQ0FBQ0MsaUJBQWlCLEtBQUtKLElBQUk7UUFDOUMsQ0FBQyxDQUFDO1FBQ0YsTUFBTUssaUJBQWlCLEdBQUdKLGlCQUFpQixHQUFHQSxpQkFBaUIsQ0FBQ0ksaUJBQWlCLEdBQUdMLElBQUk7UUFDeEYsSUFBSSxDQUFDeEIsV0FBVyxJQUFLQSxXQUFXLElBQUlBLFdBQVcsQ0FBQ2IsT0FBTyxDQUFDcUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFFLEVBQUU7VUFDdEUsS0FBSyxNQUFNekMsQ0FBQyxJQUFJVyxnQkFBZ0IsRUFBRTtZQUNqQyxNQUFNb0MsZUFBZSxHQUFHcEMsZ0JBQWdCLENBQUNYLENBQUMsQ0FBQztZQUMzQyxJQUFJOEMsaUJBQWlCLEtBQUtDLGVBQWUsQ0FBQ0MsSUFBSSxFQUFFO2NBQy9DLElBQUlELGVBQWUsQ0FBQ2YsVUFBVSxDQUFDaUIsUUFBUSxLQUFLLFVBQVUsRUFBRTtnQkFDdkQsSUFBSXBDLFdBQVcsQ0FBQzRCLElBQUksQ0FBQyxFQUFFO2tCQUN0QjVCLFdBQVcsQ0FBQzRCLElBQUksQ0FBQyxDQUFDRCxPQUFPLENBQUMsVUFBVVUsU0FBYyxFQUFFO29CQUNuREEsU0FBUyxDQUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHVixpQkFBaUIsQ0FBQ2lFLGVBQWUsQ0FBQ0QsU0FBUyxDQUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2tCQUM3RSxDQUFDLENBQUM7Z0JBQ0g7Y0FDRDtjQUNBa0IseUJBQXlCLENBQUN2QixJQUFJLENBQUM7Z0JBQzlCeUQsSUFBSSxFQUFFUCxJQUFJO2dCQUNWVCxVQUFVLEVBQUVlLGVBQWUsQ0FBQ2Y7Y0FDN0IsQ0FBQyxDQUFDO1lBQ0g7VUFDRDtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0Z4QixhQUFhLENBQUNnQyxPQUFPLENBQUMsVUFBVVksWUFBaUIsRUFBRUMsS0FBVSxFQUFFO1FBQzlELElBQUkvQyxVQUFVLENBQUMrQyxLQUFLLENBQUMsQ0FBQ3BELE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDakM7VUFDQVksV0FBVyxDQUFDdUMsWUFBWSxDQUFDUCxpQkFBaUIsQ0FBQyxHQUFHdkMsVUFBVSxDQUFDK0MsS0FBSyxDQUFDO1VBQy9ELElBQUksQ0FBQ3BDLFdBQVcsSUFBS0EsV0FBVyxJQUFJQSxXQUFXLENBQUNiLE9BQU8sQ0FBQ2dELFlBQVksQ0FBQ1AsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUUsRUFBRTtZQUNoRztZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBLEtBQUssTUFBTTdDLENBQUMsSUFBSVcsZ0JBQWdCLEVBQUU7Y0FDakM7Y0FDQSxNQUFNb0MsZUFBZSxHQUFHcEMsZ0JBQWdCLENBQUNYLENBQUMsQ0FBQztjQUMzQyxJQUFJK0MsZUFBZSxDQUFDQyxJQUFJLEtBQUtJLFlBQVksQ0FBQ04saUJBQWlCLEVBQUU7Z0JBQzVELElBQUlDLGVBQWUsQ0FBQ2YsVUFBVSxDQUFDaUIsUUFBUSxLQUFLLFVBQVUsRUFBRTtrQkFDdkQsSUFBSXBDLFdBQVcsQ0FBQ3VDLFlBQVksQ0FBQ1AsaUJBQWlCLENBQUMsRUFBRTtvQkFDaERoQyxXQUFXLENBQUN1QyxZQUFZLENBQUNQLGlCQUFpQixDQUFDLENBQUNMLE9BQU8sQ0FBQyxVQUFVVSxTQUFjLEVBQUU7c0JBQzdFQSxTQUFTLENBQUN0RCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUdWLGlCQUFpQixDQUFDaUUsZUFBZSxDQUFDRCxTQUFTLENBQUN0RCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdFLENBQUMsQ0FBQztrQkFDSDtnQkFDRDtnQkFDQWtCLHlCQUF5QixDQUFDdkIsSUFBSSxDQUFDO2tCQUM5QnlELElBQUksRUFBRUksWUFBWSxDQUFDUCxpQkFBaUI7a0JBQ3BDYixVQUFVLEVBQUVlLGVBQWUsQ0FBQ2Y7Z0JBQzdCLENBQUMsQ0FBQztjQUNIO1lBQ0Q7VUFDRDtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BRUYsTUFBTXNCLHFCQUFxQixHQUFHNUYsaUJBQWlCLENBQUNtQixpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO01BQ3JHLE1BQU0wRSxTQUFTLEdBQUc3RixpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLFVBQVUsQ0FBQztNQUNwRCxJQUFJMkYsY0FBYztNQUNsQixNQUFNQyxlQUFlLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsZUFBZSxDQUFDO01BQ3RFLE1BQU1DLG1CQUFtQixHQUFHekMsWUFBWSxDQUFDQyxlQUFlLENBQUMxRCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7TUFDdEcsSUFBSStGLG1CQUFtQixDQUFDM0QsTUFBTSxFQUFFO1FBQy9CLE1BQU16QixXQUFXLEdBQUc4RCxNQUFNLENBQUNDLElBQUksQ0FBQzFCLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDbEQsTUFBTWdELHFCQUE0QixHQUFHLEVBQUU7UUFDdkNELG1CQUFtQixDQUFDcEIsT0FBTyxDQUFDLFVBQVVzQixvQkFBeUIsRUFBRTtVQUNoRSxJQUFJdEYsV0FBVyxDQUFDNEIsT0FBTyxDQUFDMEQsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNyREQscUJBQXFCLENBQUN0RSxJQUFJLENBQUN1RSxvQkFBb0IsQ0FBQztVQUNqRDtRQUNELENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQ0QscUJBQXFCLENBQUM1RCxNQUFNLEVBQUU7VUFDbEN1RCxjQUFjLEdBQUdGLHFCQUFxQixDQUFDN0UsV0FBVyxDQUFFLEdBQUU4RSxTQUFVLFlBQVcsQ0FBQztVQUM1RUQscUJBQXFCLENBQUN6RCxXQUFXLENBQUMwRCxTQUFTLEVBQUU7WUFDNUNRLGlCQUFpQixFQUFFLEVBQUU7WUFDckJDLFlBQVksRUFBRSxFQUFFO1lBQ2hCQyxTQUFTLEVBQUU7VUFDWixDQUFDLENBQUM7UUFDSCxDQUFDLE1BQU0sSUFBSUoscUJBQXFCLENBQUM1RCxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQzVDcUQscUJBQXFCLENBQUN6RCxXQUFXLENBQUMwRCxTQUFTLEVBQUU7WUFDNUNRLGlCQUFpQixFQUFFTixlQUFlLENBQUNTLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQztZQUNsRkYsWUFBWSxFQUFFUCxlQUFlLENBQUNTLE9BQU8sQ0FBQyxnREFBZ0QsQ0FBQztZQUN2RkQsU0FBUyxFQUFFO1VBQ1osQ0FBQyxDQUFDO1VBQ0Y7UUFDRCxDQUFDLE1BQU07VUFDTixNQUFNRSxNQUFNLEdBQ1gxQyxVQUFVLENBQUMzQyxTQUFTLENBQUUsR0FBRTZDLGNBQWUsSUFBR2tDLHFCQUFxQixDQUFDLENBQUMsQ0FBRSx1Q0FBc0MsQ0FBQyxJQUMxR0EscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1VBQ3pCUCxxQkFBcUIsQ0FBQ3pELFdBQVcsQ0FBQzBELFNBQVMsRUFBRTtZQUM1Q1EsaUJBQWlCLEVBQUVOLGVBQWUsQ0FBQ1MsT0FBTyxDQUFDLHNDQUFzQyxDQUFDO1lBQ2xGRixZQUFZLEVBQUVQLGVBQWUsQ0FBQ1MsT0FBTyxDQUFDLDhDQUE4QyxFQUFFQyxNQUFNLENBQUM7WUFDN0ZGLFNBQVMsRUFBRTtVQUNaLENBQUMsQ0FBQztVQUNGO1FBQ0Q7TUFDRCxDQUFDLE1BQU07UUFDTlQsY0FBYyxHQUFHRixxQkFBcUIsQ0FBQzdFLFdBQVcsQ0FBRSxHQUFFOEUsU0FBVSxZQUFXLENBQUM7UUFDNUVELHFCQUFxQixDQUFDekQsV0FBVyxDQUFDMEQsU0FBUyxFQUFFO1VBQUVRLGlCQUFpQixFQUFFLEVBQUU7VUFBRUMsWUFBWSxFQUFFLEVBQUU7VUFBRUMsU0FBUyxFQUFFO1FBQU0sQ0FBQyxDQUFDO01BQzVHO01BRUEsTUFBTUcsaUJBQWlCLEdBQUc3RCxVQUFVLENBQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUN3RyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3JFLE1BQU1DLGdCQUFnQixHQUFHL0MsS0FBSyxDQUFDOEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDQSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzFELElBQUlwRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ2hCLE1BQU0sSUFBSW1FLGlCQUFpQixLQUFLRSxnQkFBZ0IsRUFBRTtRQUNoRixNQUFNQyxZQUFZLEdBQUdmLGNBQWMsR0FDaENnQixXQUFXLENBQUNDLDJCQUEyQixDQUFDbEUsVUFBVSxFQUFFTSxXQUFXLEVBQUVGLGdCQUFnQixFQUFFTSxXQUFXLENBQUMsR0FDL0ZoQyxTQUFTO1FBRVosSUFBSXNGLFlBQVksRUFBRTtVQUNqQmxELDRCQUE0QixDQUFDRSxLQUFLLEdBQUdnRCxZQUFZO1FBQ2xEO01BQ0Q7TUFFQSxJQUFJdEQsV0FBVyxJQUFJQSxXQUFXLENBQUNoQixNQUFNLEVBQUU7UUFDdEM7UUFDQWdCLFdBQVcsQ0FBQ3VCLE9BQU8sQ0FBQyxVQUFVa0MsU0FBYyxFQUFFO1VBQzdDLElBQUk3RCxXQUFXLENBQUM2RCxTQUFTLENBQUMsRUFBRTtZQUMzQixPQUFPN0QsV0FBVyxDQUFDNkQsU0FBUyxDQUFDO1VBQzlCO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7O01BRUE7TUFDQXBDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDMUIsV0FBVyxDQUFDLENBQUMyQixPQUFPLENBQUMsVUFBVW1DLEdBQVcsRUFBRTtRQUN2RDlELFdBQVcsQ0FBQzhELEdBQUcsQ0FBQyxDQUFDbkMsT0FBTyxDQUFDLFVBQVVVLFNBQWMsRUFBRTtVQUNsRCxJQUFJQSxTQUFTLENBQUN0RCxNQUFNLENBQUNLLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDaENpRCxTQUFTLENBQUN0RCxNQUFNLEdBQUdzRCxTQUFTLENBQUN0RCxNQUFNLENBQUNnRixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztVQUNoRDtRQUNELENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztNQUNGO01BQ0E7TUFDQTtNQUNBLElBQUl0QyxNQUFNLENBQUNDLElBQUksQ0FBQzFCLFdBQVcsQ0FBQyxDQUFDWixNQUFNLEdBQUcsQ0FBQyxJQUFJYSx5QkFBeUIsQ0FBQ2IsTUFBTSxFQUFFO1FBQzVFYyxRQUFRLEdBQUk4RCxhQUFhLENBQUNDLGFBQWEsQ0FBQ3ZFLFVBQVUsRUFBRU0sV0FBVyxFQUFFQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBU2lFLE9BQU87UUFDL0csSUFBSWhFLFFBQVEsRUFBRTtVQUNiLElBQUksQ0FBQ0EsUUFBUSxDQUFDQyxRQUFRLEVBQUU7WUFDdkJBLFFBQVEsQ0FBQ3pCLElBQUksQ0FBQ3dCLFFBQVEsQ0FBQztVQUN4QixDQUFDLE1BQU0sSUFBSUEsUUFBUSxDQUFDQyxRQUFRLEVBQUU7WUFDN0JBLFFBQVEsR0FBR0QsUUFBUSxDQUFDQyxRQUFRO1VBQzdCO1FBQ0Q7TUFDRDtNQUNBLElBQUlOLGlCQUFpQixFQUFFO1FBQ3RCTSxRQUFRLENBQUN6QixJQUFJLENBQUMsSUFBSXlGLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRUMsY0FBYyxDQUFDQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7TUFDckU7TUFDQSxJQUFJbEUsUUFBUSxJQUFJQSxRQUFRLENBQUNmLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDcENvQiw0QkFBNEIsQ0FBQzdCLE1BQU0sQ0FBQ3dCLFFBQVEsQ0FBQztNQUM5QyxDQUFDLE1BQU0sSUFBSSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLENBQUMxQixXQUFXLENBQUMsQ0FBQ1osTUFBTSxFQUFFO1FBQzVDb0IsNEJBQTRCLENBQUM3QixNQUFNLEVBQUU7TUFDdEM7TUFDQTtNQUNBLElBQUlnRSxjQUFjLElBQUluQyw0QkFBNEIsQ0FBQzhELFdBQVcsRUFBRSxFQUFFO1FBQ2pFOUQsNEJBQTRCLENBQUMrRCxNQUFNLEVBQUU7TUFDdEM7TUFDQSxPQUFPcEUsUUFBUTtJQUNoQixDQUFDO0lBQ0RxRSxlQUFlLENBQWdCQyxXQUFnQixFQUFFO01BQ2hELElBQUksSUFBSSxDQUFDekgsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssT0FBTyxJQUFJeUgsV0FBVyxDQUFDckYsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNoRixPQUFRLEtBQUk7TUFDYjtNQUNBLElBQUlxRixXQUFXLENBQUNyRixNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzNCLE9BQVEsSUFBR3FGLFdBQVcsQ0FBQ3JGLE1BQU8sR0FBRTtNQUNqQyxDQUFDLE1BQU07UUFDTixPQUFPaEIsU0FBUztNQUNqQjtJQUNELENBQUM7SUFFRHNHLHNCQUFzQixDQUFDQyxNQUFXLEVBQUVDLFdBQWdCLEVBQUVDLHdCQUE2QixFQUFFQyxRQUFhLEVBQUVDLFNBQWMsRUFBRTtNQUNuSDtNQUNBLElBQUlILFdBQVcsRUFBRTtRQUNoQixPQUFPdkcsaUJBQWlCLENBQUMyRyxrQkFBa0IsQ0FBQ0QsU0FBUyxFQUFFSCxXQUFXLEVBQUVDLHdCQUF3QixDQUFDO1FBQzdGO01BQ0QsQ0FBQyxNQUFNLElBQUlDLFFBQVEsRUFBRTtRQUNwQixPQUFPekcsaUJBQWlCLENBQUMyRyxrQkFBa0IsQ0FBQ0QsU0FBUyxFQUFFM0csU0FBUyxFQUFFQSxTQUFTLEVBQUUwRyxRQUFRLENBQUM7UUFDdEY7TUFDRCxDQUFDLE1BQU0sSUFBSUQsd0JBQXdCLEdBQUcsQ0FBQyxFQUFFO1FBQ3hDO1FBQ0FBLHdCQUF3QixHQUFHQSx3QkFBd0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHQSx3QkFBd0I7UUFDdEYsT0FBT3hHLGlCQUFpQixDQUFDMkcsa0JBQWtCLENBQUNELFNBQVMsRUFBRTNHLFNBQVMsRUFBRXlHLHdCQUF3QixDQUFDO01BQzVGLENBQUMsTUFBTTtRQUNOLE9BQU9GLE1BQU07TUFDZDtJQUNELENBQUM7SUFDRE0sYUFBYSxDQUFDckksTUFBVyxFQUFFO01BQzFCQSxNQUFNLENBQUNFLFNBQVMsRUFBRSxDQUFDdUMsU0FBUyxFQUFFLENBQUNBLFNBQVMsRUFBRSxDQUFDQSxTQUFTLEVBQUUsQ0FBQzZGLG9CQUFvQixFQUFFO0lBQzlFO0VBQ0QsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7RUFGQSxPQUdleEksbUJBQW1CO0FBQUEifQ==