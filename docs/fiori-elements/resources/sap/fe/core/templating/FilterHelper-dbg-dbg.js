/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/type/EDM", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated"], function (Log, EDM, Condition, ConditionValidated) {
  "use strict";

  var _exports = {};
  var isTypeFilterable = EDM.isTypeFilterable;
  const oExcludeMap = {
    Contains: "NotContains",
    StartsWith: "NotStartsWith",
    EndsWith: "NotEndsWith",
    Empty: "NotEmpty",
    NotEmpty: "Empty",
    LE: "NOTLE",
    GE: "NOTGE",
    LT: "NOTLT",
    GT: "NOTGT",
    BT: "NOTBT",
    NE: "EQ",
    EQ: "NE"
  };
  function _getDateTimeOffsetCompliantValue(sValue) {
    let oValue;
    if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
      oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0]}+0000`;
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]}T00:00:00+0000`;
    } else if (sValue.indexOf("Z") === sValue.length - 1) {
      oValue = `${sValue.split("Z")[0]}+0100`;
    } else {
      oValue = undefined;
    }
    return oValue;
  }
  _exports._getDateTimeOffsetCompliantValue = _getDateTimeOffsetCompliantValue;
  function _getDateCompliantValue(sValue) {
    return sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/) ? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0] : sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
  }

  /**
   * Method to get the compliant value type based on the data type.
   *
   * @param  sValue Raw value
   * @param  sType The property type
   * @returns Value to be propagated to the condition.
   */
  _exports._getDateCompliantValue = _getDateCompliantValue;
  function getTypeCompliantValue(sValue, sType) {
    let oValue;
    if (!isTypeFilterable(sType)) {
      return undefined;
    }
    oValue = sValue;
    switch (sType) {
      case "Edm.Boolean":
        if (typeof sValue === "boolean") {
          oValue = sValue;
        } else {
          oValue = sValue === "true" || (sValue === "false" ? false : undefined);
        }
        break;
      case "Edm.Double":
      case "Edm.Single":
        oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
        break;
      case "Edm.Byte":
      case "Edm.Int16":
      case "Edm.Int32":
      case "Edm.SByte":
        oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
        break;
      case "Edm.Date":
        oValue = _getDateCompliantValue(sValue);
        break;
      case "Edm.DateTimeOffset":
        oValue = _getDateTimeOffsetCompliantValue(sValue);
        break;
      case "Edm.TimeOfDay":
        oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
        break;
      default:
    }
    return oValue === null ? undefined : oValue;
  }

  /**
   * Method to create a condition.
   *
   * @param  sOption Operator to be used.
   * @param  oV1 Lower value
   * @param  oV2 Higher value
   * @param sSign
   * @returns Condition to be created
   */
  _exports.getTypeCompliantValue = getTypeCompliantValue;
  function resolveConditionValues(sOption, oV1, oV2, sSign) {
    let oValue = oV1,
      oValue2,
      sInternalOperation;
    const oCondition = {};
    oCondition.values = [];
    oCondition.isEmpty = null;
    if (oV1 === undefined || oV1 === null) {
      return undefined;
    }
    switch (sOption) {
      case "CP":
        sInternalOperation = "Contains";
        if (oValue) {
          const nIndexOf = oValue.indexOf("*");
          const nLastIndex = oValue.lastIndexOf("*");

          // only when there are '*' at all
          if (nIndexOf > -1) {
            if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
              sInternalOperation = "EndsWith";
              oValue = oValue.substring(1, oValue.length);
            } else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
              sInternalOperation = "StartsWith";
              oValue = oValue.substring(0, oValue.length - 1);
            } else {
              oValue = oValue.substring(1, oValue.length - 1);
            }
          } else {
            Log.warning("Contains Option cannot be used without '*'.");
            return undefined;
          }
        }
        break;
      case "EQ":
        sInternalOperation = oV1 === "" ? "Empty" : sOption;
        break;
      case "NE":
        sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
        break;
      case "BT":
        if (oV2 === undefined || oV2 === null) {
          return;
        }
        oValue2 = oV2;
        sInternalOperation = sOption;
        break;
      case "LE":
      case "GE":
      case "GT":
      case "LT":
        sInternalOperation = sOption;
        break;
      default:
        Log.warning(`Selection Option is not supported : '${sOption}'`);
        return undefined;
    }
    if (sSign === "E") {
      sInternalOperation = oExcludeMap[sInternalOperation];
    }
    oCondition.operator = sInternalOperation;
    if (sInternalOperation !== "Empty") {
      oCondition.values.push(oValue);
      if (oValue2) {
        oCondition.values.push(oValue2);
      }
    }
    return oCondition;
  }

  /* Method to get the Range property from the Selection Option */
  _exports.resolveConditionValues = resolveConditionValues;
  function getRangeProperty(sProperty) {
    return sProperty.indexOf("/") > 0 ? sProperty.split("/")[1] : sProperty;
  }
  _exports.getRangeProperty = getRangeProperty;
  function _buildConditionsFromSelectionRanges(Ranges, oProperty, sPropertyName, getCustomConditions) {
    const aConditions = [];
    Ranges === null || Ranges === void 0 ? void 0 : Ranges.forEach(Range => {
      const oCondition = getCustomConditions ? getCustomConditions(Range, oProperty, sPropertyName) : getConditions(Range, oProperty);
      if (oCondition) {
        aConditions.push(oCondition);
      }
    });
    return aConditions;
  }
  function _getProperty(propertyName, metaModel, entitySetPath) {
    const lastSlashIndex = propertyName.lastIndexOf("/");
    const navigationPath = lastSlashIndex > -1 ? propertyName.substring(0, propertyName.lastIndexOf("/") + 1) : "";
    const collection = metaModel.getObject(`${entitySetPath}/${navigationPath}`);
    return collection === null || collection === void 0 ? void 0 : collection[propertyName.replace(navigationPath, "")];
  }
  function _buildFiltersConditionsFromSelectOption(selectOption, metaModel, entitySetPath, getCustomConditions) {
    const propertyName = selectOption.PropertyName,
      filterConditions = {},
      propertyPath = propertyName.value || propertyName.$PropertyPath,
      Ranges = selectOption.Ranges;
    const targetProperty = _getProperty(propertyPath, metaModel, entitySetPath);
    if (targetProperty) {
      const conditions = _buildConditionsFromSelectionRanges(Ranges, targetProperty, propertyPath, getCustomConditions);
      if (conditions.length) {
        filterConditions[propertyPath] = (filterConditions[propertyPath] || []).concat(conditions);
      }
    }
    return filterConditions;
  }
  function getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, selectionVariant, getCustomConditions) {
    let oFilterConditions = {};
    if (!selectionVariant) {
      return oFilterConditions;
    }
    const aSelectOptions = selectionVariant.SelectOptions,
      aParameters = selectionVariant.Parameters;
    aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
      const propertyName = selectOption.PropertyName,
        sPropertyName = propertyName.value || propertyName.$PropertyPath;
      if (Object.keys(oFilterConditions).includes(sPropertyName)) {
        oFilterConditions[sPropertyName] = oFilterConditions[sPropertyName].concat(_buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)[sPropertyName]);
      } else {
        oFilterConditions = {
          ...oFilterConditions,
          ..._buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)
        };
      }
    });
    aParameters === null || aParameters === void 0 ? void 0 : aParameters.forEach(parameter => {
      const sPropertyPath = parameter.PropertyName.value || parameter.PropertyName.$PropertyPath;
      const oCondition = getCustomConditions ? {
        operator: "EQ",
        value1: parameter.PropertyValue,
        value2: null,
        path: sPropertyPath,
        isParameter: true
      } : {
        operator: "EQ",
        values: [parameter.PropertyValue],
        isEmpty: null,
        validated: ConditionValidated.Validated,
        isParameter: true
      };
      oFilterConditions[sPropertyPath] = [oCondition];
    });
    return oFilterConditions;
  }
  _exports.getFiltersConditionsFromSelectionVariant = getFiltersConditionsFromSelectionVariant;
  function getConditions(Range, oValidProperty) {
    let oCondition;
    const sign = Range.Sign ? getRangeProperty(Range.Sign) : undefined;
    const sOption = Range.Option ? getRangeProperty(Range.Option) : undefined;
    const oValue1 = getTypeCompliantValue(Range.Low, oValidProperty.$Type || oValidProperty.type);
    const oValue2 = Range.High ? getTypeCompliantValue(Range.High, oValidProperty.$Type || oValidProperty.type) : undefined;
    const oConditionValues = resolveConditionValues(sOption, oValue1, oValue2, sign);
    if (oConditionValues) {
      oCondition = Condition.createCondition(oConditionValues.operator, oConditionValues.values, null, null, ConditionValidated.Validated);
    }
    return oCondition;
  }
  _exports.getConditions = getConditions;
  const getDefaultValueFilters = function (oContext, properties) {
    const filterConditions = {};
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel();
    if (properties) {
      for (const key in properties) {
        const defaultFilterValue = oMetaModel.getObject(`${entitySetPath}/${key}@com.sap.vocabularies.Common.v1.FilterDefaultValue`);
        if (defaultFilterValue !== undefined) {
          const PropertyName = key;
          filterConditions[PropertyName] = [Condition.createCondition("EQ", [defaultFilterValue], null, null, ConditionValidated.Validated)];
        }
      }
    }
    return filterConditions;
  };
  const getDefaultSemanticDateFilters = function (oContext, properties, defaultSemanticDates) {
    const filterConditions = {};
    const oInterface = oContext.getInterface(1);
    const oMetaModel = oInterface.getModel();
    const sEntityTypePath = oInterface.getPath();
    for (const key in defaultSemanticDates) {
      if (defaultSemanticDates[key][0]) {
        const aPropertyPathParts = key.split("::");
        let sPath = "";
        const iPropertyPathLength = aPropertyPathParts.length;
        const sNavigationPath = aPropertyPathParts.slice(0, aPropertyPathParts.length - 1).join("/");
        const sProperty = aPropertyPathParts[iPropertyPathLength - 1];
        if (sNavigationPath) {
          //Create Proper Condition Path e.g. _Item*/Property or _Item/Property
          const vProperty = oMetaModel.getObject(sEntityTypePath + "/" + sNavigationPath);
          if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
            sPath += `${sNavigationPath}*/`;
          } else if (vProperty.$kind === "NavigationProperty") {
            sPath += `${sNavigationPath}/`;
          }
        }
        sPath += sProperty;
        const operatorParamsArr = "values" in defaultSemanticDates[key][0] ? defaultSemanticDates[key][0].values : [];
        filterConditions[sPath] = [Condition.createCondition(defaultSemanticDates[key][0].operator, operatorParamsArr, null, null, null)];
      }
    }
    return filterConditions;
  };
  function getEditStatusFilter() {
    const ofilterConditions = {};
    ofilterConditions["$editState"] = [Condition.createCondition("DRAFT_EDIT_STATE", ["ALL"], null, null, ConditionValidated.Validated)];
    return ofilterConditions;
  }
  function getFilterConditions(oContext, filterConditions) {
    var _filterConditions, _filterConditions2;
    let editStateFilter;
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel(),
      entityTypeAnnotations = oMetaModel.getObject(`${entitySetPath}@`),
      entityTypeProperties = oMetaModel.getObject(`${entitySetPath}/`);
    if (entityTypeAnnotations && (entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] || entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftNode"])) {
      editStateFilter = getEditStatusFilter();
    }
    const selectionVariant = (_filterConditions = filterConditions) === null || _filterConditions === void 0 ? void 0 : _filterConditions.selectionVariant;
    const defaultSemanticDates = ((_filterConditions2 = filterConditions) === null || _filterConditions2 === void 0 ? void 0 : _filterConditions2.defaultSemanticDates) || {};
    const defaultFilters = getDefaultValueFilters(oContext, entityTypeProperties);
    const defaultSemanticDateFilters = getDefaultSemanticDateFilters(oContext, entityTypeProperties, defaultSemanticDates);
    if (selectionVariant) {
      filterConditions = getFiltersConditionsFromSelectionVariant(entitySetPath, oMetaModel, selectionVariant);
    } else if (defaultFilters) {
      filterConditions = defaultFilters;
    }
    if (defaultSemanticDateFilters) {
      // only for semantic date:
      // 1. value from manifest get merged with SV
      // 2. manifest value is given preference when there is same semantic date property in SV and manifest
      filterConditions = {
        ...filterConditions,
        ...defaultSemanticDateFilters
      };
    }
    if (editStateFilter) {
      filterConditions = {
        ...filterConditions,
        ...editStateFilter
      };
    }
    return Object.keys(filterConditions).length > 0 ? JSON.stringify(filterConditions).replace(/([{}])/g, "\\$1") : undefined;
  }
  _exports.getFilterConditions = getFilterConditions;
  getFilterConditions.requiresIContext = true;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvRXhjbHVkZU1hcCIsIkNvbnRhaW5zIiwiU3RhcnRzV2l0aCIsIkVuZHNXaXRoIiwiRW1wdHkiLCJOb3RFbXB0eSIsIkxFIiwiR0UiLCJMVCIsIkdUIiwiQlQiLCJORSIsIkVRIiwiX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUiLCJzVmFsdWUiLCJvVmFsdWUiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJzcGxpdCIsInVuZGVmaW5lZCIsIl9nZXREYXRlQ29tcGxpYW50VmFsdWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJzVHlwZSIsImlzVHlwZUZpbHRlcmFibGUiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsInJlc29sdmVDb25kaXRpb25WYWx1ZXMiLCJzT3B0aW9uIiwib1YxIiwib1YyIiwic1NpZ24iLCJvVmFsdWUyIiwic0ludGVybmFsT3BlcmF0aW9uIiwib0NvbmRpdGlvbiIsInZhbHVlcyIsImlzRW1wdHkiLCJuSW5kZXhPZiIsIm5MYXN0SW5kZXgiLCJsYXN0SW5kZXhPZiIsInN1YnN0cmluZyIsIkxvZyIsIndhcm5pbmciLCJvcGVyYXRvciIsInB1c2giLCJnZXRSYW5nZVByb3BlcnR5Iiwic1Byb3BlcnR5IiwiX2J1aWxkQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25SYW5nZXMiLCJSYW5nZXMiLCJvUHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiZ2V0Q3VzdG9tQ29uZGl0aW9ucyIsImFDb25kaXRpb25zIiwiZm9yRWFjaCIsIlJhbmdlIiwiZ2V0Q29uZGl0aW9ucyIsIl9nZXRQcm9wZXJ0eSIsInByb3BlcnR5TmFtZSIsIm1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJsYXN0U2xhc2hJbmRleCIsIm5hdmlnYXRpb25QYXRoIiwiY29sbGVjdGlvbiIsImdldE9iamVjdCIsInJlcGxhY2UiLCJfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24iLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJmaWx0ZXJDb25kaXRpb25zIiwicHJvcGVydHlQYXRoIiwidmFsdWUiLCIkUHJvcGVydHlQYXRoIiwidGFyZ2V0UHJvcGVydHkiLCJjb25kaXRpb25zIiwiY29uY2F0IiwiZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInNFbnRpdHlTZXRQYXRoIiwib01ldGFNb2RlbCIsInNlbGVjdGlvblZhcmlhbnQiLCJvRmlsdGVyQ29uZGl0aW9ucyIsImFTZWxlY3RPcHRpb25zIiwiU2VsZWN0T3B0aW9ucyIsImFQYXJhbWV0ZXJzIiwiUGFyYW1ldGVycyIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInBhcmFtZXRlciIsInNQcm9wZXJ0eVBhdGgiLCJ2YWx1ZTEiLCJQcm9wZXJ0eVZhbHVlIiwidmFsdWUyIiwicGF0aCIsImlzUGFyYW1ldGVyIiwidmFsaWRhdGVkIiwiQ29uZGl0aW9uVmFsaWRhdGVkIiwiVmFsaWRhdGVkIiwib1ZhbGlkUHJvcGVydHkiLCJzaWduIiwiU2lnbiIsIk9wdGlvbiIsIm9WYWx1ZTEiLCJMb3ciLCIkVHlwZSIsInR5cGUiLCJIaWdoIiwib0NvbmRpdGlvblZhbHVlcyIsIkNvbmRpdGlvbiIsImNyZWF0ZUNvbmRpdGlvbiIsImdldERlZmF1bHRWYWx1ZUZpbHRlcnMiLCJvQ29udGV4dCIsInByb3BlcnRpZXMiLCJnZXRJbnRlcmZhY2UiLCJnZXRQYXRoIiwiZ2V0TW9kZWwiLCJrZXkiLCJkZWZhdWx0RmlsdGVyVmFsdWUiLCJnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsImRlZmF1bHRTZW1hbnRpY0RhdGVzIiwib0ludGVyZmFjZSIsInNFbnRpdHlUeXBlUGF0aCIsImFQcm9wZXJ0eVBhdGhQYXJ0cyIsInNQYXRoIiwiaVByb3BlcnR5UGF0aExlbmd0aCIsInNOYXZpZ2F0aW9uUGF0aCIsInNsaWNlIiwiam9pbiIsInZQcm9wZXJ0eSIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIm9wZXJhdG9yUGFyYW1zQXJyIiwiZ2V0RWRpdFN0YXR1c0ZpbHRlciIsIm9maWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVyQ29uZGl0aW9ucyIsImVkaXRTdGF0ZUZpbHRlciIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsImVudGl0eVR5cGVQcm9wZXJ0aWVzIiwiZGVmYXVsdEZpbHRlcnMiLCJkZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTZWxlY3Rpb25SYW5nZVR5cGVUeXBlcywgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcywgU2VsZWN0T3B0aW9uVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLCBpc1R5cGVGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuZXhwb3J0IHR5cGUgRmlsdGVyQ29uZGl0aW9ucyA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcblx0dmFsdWVzOiBBcnJheTxzdHJpbmc+O1xuXHRpc0VtcHR5PzogYm9vbGVhbiB8IG51bGw7XG5cdHZhbGlkYXRlZD86IHN0cmluZztcblx0aXNQYXJhbWV0ZXI/OiBib29sZWFuO1xufTtcblxuY29uc3Qgb0V4Y2x1ZGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG5cdENvbnRhaW5zOiBcIk5vdENvbnRhaW5zXCIsXG5cdFN0YXJ0c1dpdGg6IFwiTm90U3RhcnRzV2l0aFwiLFxuXHRFbmRzV2l0aDogXCJOb3RFbmRzV2l0aFwiLFxuXHRFbXB0eTogXCJOb3RFbXB0eVwiLFxuXHROb3RFbXB0eTogXCJFbXB0eVwiLFxuXHRMRTogXCJOT1RMRVwiLFxuXHRHRTogXCJOT1RHRVwiLFxuXHRMVDogXCJOT1RMVFwiLFxuXHRHVDogXCJOT1RHVFwiLFxuXHRCVDogXCJOT1RCVFwiLFxuXHRORTogXCJFUVwiLFxuXHRFUTogXCJORVwiXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUoc1ZhbHVlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRsZXQgb1ZhbHVlO1xuXHRpZiAoc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pXFwrKFxcZHsxLDR9KS8pKSB7XG5cdFx0b1ZhbHVlID0gc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pXFwrKFxcZHsxLDR9KS8pWzBdO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KVQoXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pKSB7XG5cdFx0b1ZhbHVlID0gYCR7c1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pLylbMF19KzAwMDBgO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pKSB7XG5cdFx0b1ZhbHVlID0gYCR7c1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLylbMF19VDAwOjAwOjAwKzAwMDBgO1xuXHR9IGVsc2UgaWYgKHNWYWx1ZS5pbmRleE9mKFwiWlwiKSA9PT0gc1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRvVmFsdWUgPSBgJHtzVmFsdWUuc3BsaXQoXCJaXCIpWzBdfSswMTAwYDtcblx0fSBlbHNlIHtcblx0XHRvVmFsdWUgPSB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIG9WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXREYXRlQ29tcGxpYW50VmFsdWUoc1ZhbHVlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLylcblx0XHQ/IHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pWzBdXG5cdFx0OiBzVmFsdWUubWF0Y2goL14oXFxkezh9KS8pICYmIHNWYWx1ZS5tYXRjaCgvXihcXGR7OH0pLylbMF07XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGdldCB0aGUgY29tcGxpYW50IHZhbHVlIHR5cGUgYmFzZWQgb24gdGhlIGRhdGEgdHlwZS5cbiAqXG4gKiBAcGFyYW0gIHNWYWx1ZSBSYXcgdmFsdWVcbiAqIEBwYXJhbSAgc1R5cGUgVGhlIHByb3BlcnR5IHR5cGVcbiAqIEByZXR1cm5zIFZhbHVlIHRvIGJlIHByb3BhZ2F0ZWQgdG8gdGhlIGNvbmRpdGlvbi5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZUNvbXBsaWFudFZhbHVlKHNWYWx1ZTogYW55LCBzVHlwZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IG9WYWx1ZTtcblx0aWYgKCFpc1R5cGVGaWx0ZXJhYmxlKHNUeXBlIGFzIGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGUpKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRvVmFsdWUgPSBzVmFsdWU7XG5cdHN3aXRjaCAoc1R5cGUpIHtcblx0XHRjYXNlIFwiRWRtLkJvb2xlYW5cIjpcblx0XHRcdGlmICh0eXBlb2Ygc1ZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRvVmFsdWUgPSBzVmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvVmFsdWUgPSBzVmFsdWUgPT09IFwidHJ1ZVwiIHx8IChzVmFsdWUgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogdW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uRG91YmxlXCI6XG5cdFx0Y2FzZSBcIkVkbS5TaW5nbGVcIjpcblx0XHRcdG9WYWx1ZSA9IGlzTmFOKHNWYWx1ZSkgPyB1bmRlZmluZWQgOiBwYXJzZUZsb2F0KHNWYWx1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkJ5dGVcIjpcblx0XHRjYXNlIFwiRWRtLkludDE2XCI6XG5cdFx0Y2FzZSBcIkVkbS5JbnQzMlwiOlxuXHRcdGNhc2UgXCJFZG0uU0J5dGVcIjpcblx0XHRcdG9WYWx1ZSA9IGlzTmFOKHNWYWx1ZSkgPyB1bmRlZmluZWQgOiBwYXJzZUludChzVmFsdWUsIDEwKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0b1ZhbHVlID0gX2dldERhdGVDb21wbGlhbnRWYWx1ZShzVmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0b1ZhbHVlID0gX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUoc1ZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uVGltZU9mRGF5XCI6XG5cdFx0XHRvVmFsdWUgPSBzVmFsdWUubWF0Y2goLyhcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pLykgPyBzVmFsdWUubWF0Y2goLyhcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pLylbMF0gOiB1bmRlZmluZWQ7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHR9XG5cblx0cmV0dXJuIG9WYWx1ZSA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9WYWx1ZTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gY3JlYXRlIGEgY29uZGl0aW9uLlxuICpcbiAqIEBwYXJhbSAgc09wdGlvbiBPcGVyYXRvciB0byBiZSB1c2VkLlxuICogQHBhcmFtICBvVjEgTG93ZXIgdmFsdWVcbiAqIEBwYXJhbSAgb1YyIEhpZ2hlciB2YWx1ZVxuICogQHBhcmFtIHNTaWduXG4gKiBAcmV0dXJucyBDb25kaXRpb24gdG8gYmUgY3JlYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNvbmRpdGlvblZhbHVlcyhzT3B0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQsIG9WMTogYW55LCBvVjI6IGFueSwgc1NpZ246IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRsZXQgb1ZhbHVlID0gb1YxLFxuXHRcdG9WYWx1ZTIsXG5cdFx0c0ludGVybmFsT3BlcmF0aW9uOiBhbnk7XG5cdGNvbnN0IG9Db25kaXRpb246IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0b0NvbmRpdGlvbi52YWx1ZXMgPSBbXTtcblx0b0NvbmRpdGlvbi5pc0VtcHR5ID0gbnVsbCBhcyBhbnk7XG5cdGlmIChvVjEgPT09IHVuZGVmaW5lZCB8fCBvVjEgPT09IG51bGwpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0c3dpdGNoIChzT3B0aW9uKSB7XG5cdFx0Y2FzZSBcIkNQXCI6XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBcIkNvbnRhaW5zXCI7XG5cdFx0XHRpZiAob1ZhbHVlKSB7XG5cdFx0XHRcdGNvbnN0IG5JbmRleE9mID0gb1ZhbHVlLmluZGV4T2YoXCIqXCIpO1xuXHRcdFx0XHRjb25zdCBuTGFzdEluZGV4ID0gb1ZhbHVlLmxhc3RJbmRleE9mKFwiKlwiKTtcblxuXHRcdFx0XHQvLyBvbmx5IHdoZW4gdGhlcmUgYXJlICcqJyBhdCBhbGxcblx0XHRcdFx0aWYgKG5JbmRleE9mID4gLTEpIHtcblx0XHRcdFx0XHRpZiAobkluZGV4T2YgPT09IDAgJiYgbkxhc3RJbmRleCAhPT0gb1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IFwiRW5kc1dpdGhcIjtcblx0XHRcdFx0XHRcdG9WYWx1ZSA9IG9WYWx1ZS5zdWJzdHJpbmcoMSwgb1ZhbHVlLmxlbmd0aCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuSW5kZXhPZiAhPT0gMCAmJiBuTGFzdEluZGV4ID09PSBvVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gXCJTdGFydHNXaXRoXCI7XG5cdFx0XHRcdFx0XHRvVmFsdWUgPSBvVmFsdWUuc3Vic3RyaW5nKDAsIG9WYWx1ZS5sZW5ndGggLSAxKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b1ZhbHVlID0gb1ZhbHVlLnN1YnN0cmluZygxLCBvVmFsdWUubGVuZ3RoIC0gMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKFwiQ29udGFpbnMgT3B0aW9uIGNhbm5vdCBiZSB1c2VkIHdpdGhvdXQgJyonLlwiKTtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRVFcIjpcblx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IG9WMSA9PT0gXCJcIiA/IFwiRW1wdHlcIiA6IHNPcHRpb247XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiTkVcIjpcblx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IG9WMSA9PT0gXCJcIiA/IFwiTm90RW1wdHlcIiA6IHNPcHRpb247XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiQlRcIjpcblx0XHRcdGlmIChvVjIgPT09IHVuZGVmaW5lZCB8fCBvVjIgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0b1ZhbHVlMiA9IG9WMjtcblx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IHNPcHRpb247XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiTEVcIjpcblx0XHRjYXNlIFwiR0VcIjpcblx0XHRjYXNlIFwiR1RcIjpcblx0XHRjYXNlIFwiTFRcIjpcblx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IHNPcHRpb247XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0TG9nLndhcm5pbmcoYFNlbGVjdGlvbiBPcHRpb24gaXMgbm90IHN1cHBvcnRlZCA6ICcke3NPcHRpb259J2ApO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoc1NpZ24gPT09IFwiRVwiKSB7XG5cdFx0c0ludGVybmFsT3BlcmF0aW9uID0gb0V4Y2x1ZGVNYXBbc0ludGVybmFsT3BlcmF0aW9uXTtcblx0fVxuXHRvQ29uZGl0aW9uLm9wZXJhdG9yID0gc0ludGVybmFsT3BlcmF0aW9uO1xuXHRpZiAoc0ludGVybmFsT3BlcmF0aW9uICE9PSBcIkVtcHR5XCIpIHtcblx0XHRvQ29uZGl0aW9uLnZhbHVlcy5wdXNoKG9WYWx1ZSk7XG5cdFx0aWYgKG9WYWx1ZTIpIHtcblx0XHRcdG9Db25kaXRpb24udmFsdWVzLnB1c2gob1ZhbHVlMik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvQ29uZGl0aW9uO1xufVxuXG4vKiBNZXRob2QgdG8gZ2V0IHRoZSBSYW5nZSBwcm9wZXJ0eSBmcm9tIHRoZSBTZWxlY3Rpb24gT3B0aW9uICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZ2VQcm9wZXJ0eShzUHJvcGVydHk6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBzUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPiAwID8gc1Byb3BlcnR5LnNwbGl0KFwiL1wiKVsxXSA6IHNQcm9wZXJ0eTtcbn1cblxuZnVuY3Rpb24gX2J1aWxkQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25SYW5nZXMoXG5cdFJhbmdlczogU2VsZWN0aW9uUmFuZ2VUeXBlVHlwZXNbXSxcblx0b1Byb3BlcnR5OiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+LFxuXHRzUHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdGdldEN1c3RvbUNvbmRpdGlvbnM/OiBGdW5jdGlvblxuKTogYW55W10ge1xuXHRjb25zdCBhQ29uZGl0aW9uczogYW55W10gPSBbXTtcblx0UmFuZ2VzPy5mb3JFYWNoKChSYW5nZTogYW55KSA9PiB7XG5cdFx0Y29uc3Qgb0NvbmRpdGlvbiA9IGdldEN1c3RvbUNvbmRpdGlvbnMgPyBnZXRDdXN0b21Db25kaXRpb25zKFJhbmdlLCBvUHJvcGVydHksIHNQcm9wZXJ0eU5hbWUpIDogZ2V0Q29uZGl0aW9ucyhSYW5nZSwgb1Byb3BlcnR5KTtcblx0XHRpZiAob0NvbmRpdGlvbikge1xuXHRcdFx0YUNvbmRpdGlvbnMucHVzaChvQ29uZGl0aW9uKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYUNvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZywgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0UGF0aDogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgb2JqZWN0PiB7XG5cdGNvbnN0IGxhc3RTbGFzaEluZGV4ID0gcHJvcGVydHlOYW1lLmxhc3RJbmRleE9mKFwiL1wiKTtcblx0Y29uc3QgbmF2aWdhdGlvblBhdGggPSBsYXN0U2xhc2hJbmRleCA+IC0xID8gcHJvcGVydHlOYW1lLnN1YnN0cmluZygwLCBwcm9wZXJ0eU5hbWUubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgOiBcIlwiO1xuXHRjb25zdCBjb2xsZWN0aW9uID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS8ke25hdmlnYXRpb25QYXRofWApO1xuXHRyZXR1cm4gY29sbGVjdGlvbj8uW3Byb3BlcnR5TmFtZS5yZXBsYWNlKG5hdmlnYXRpb25QYXRoLCBcIlwiKV07XG59XG5cbmZ1bmN0aW9uIF9idWlsZEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbihcblx0c2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25UeXBlLFxuXHRtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRlbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdGdldEN1c3RvbUNvbmRpdGlvbnM/OiBGdW5jdGlvblxuKTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGNvbnN0IHByb3BlcnR5TmFtZTogYW55ID0gc2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZSxcblx0XHRmaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge30sXG5cdFx0cHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eU5hbWUudmFsdWUgfHwgcHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGgsXG5cdFx0UmFuZ2VzOiBTZWxlY3Rpb25SYW5nZVR5cGVUeXBlc1tdID0gc2VsZWN0T3B0aW9uLlJhbmdlcztcblx0Y29uc3QgdGFyZ2V0UHJvcGVydHkgPSBfZ2V0UHJvcGVydHkocHJvcGVydHlQYXRoLCBtZXRhTW9kZWwsIGVudGl0eVNldFBhdGgpO1xuXHRpZiAodGFyZ2V0UHJvcGVydHkpIHtcblx0XHRjb25zdCBjb25kaXRpb25zOiBhbnlbXSA9IF9idWlsZENvbmRpdGlvbnNGcm9tU2VsZWN0aW9uUmFuZ2VzKFJhbmdlcywgdGFyZ2V0UHJvcGVydHksIHByb3BlcnR5UGF0aCwgZ2V0Q3VzdG9tQ29uZGl0aW9ucyk7XG5cdFx0aWYgKGNvbmRpdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRmaWx0ZXJDb25kaXRpb25zW3Byb3BlcnR5UGF0aF0gPSAoZmlsdGVyQ29uZGl0aW9uc1twcm9wZXJ0eVBhdGhdIHx8IFtdKS5jb25jYXQoY29uZGl0aW9ucyk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmaWx0ZXJDb25kaXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChcblx0c0VudGl0eVNldFBhdGg6IHN0cmluZyxcblx0b01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdHNlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnRUeXBlVHlwZXMsXG5cdGdldEN1c3RvbUNvbmRpdGlvbnM/OiBGdW5jdGlvblxuKTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGxldCBvRmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRpZiAoIXNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRyZXR1cm4gb0ZpbHRlckNvbmRpdGlvbnM7XG5cdH1cblx0Y29uc3QgYVNlbGVjdE9wdGlvbnMgPSBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMsXG5cdFx0YVBhcmFtZXRlcnMgPSBzZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnM7XG5cdGFTZWxlY3RPcHRpb25zPy5mb3JFYWNoKChzZWxlY3RPcHRpb246IFNlbGVjdE9wdGlvblR5cGUpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWU6IGFueSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUsXG5cdFx0XHRzUHJvcGVydHlOYW1lOiBzdHJpbmcgPSBwcm9wZXJ0eU5hbWUudmFsdWUgfHwgcHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGg7XG5cdFx0aWYgKE9iamVjdC5rZXlzKG9GaWx0ZXJDb25kaXRpb25zKS5pbmNsdWRlcyhzUHJvcGVydHlOYW1lKSkge1xuXHRcdFx0b0ZpbHRlckNvbmRpdGlvbnNbc1Byb3BlcnR5TmFtZV0gPSBvRmlsdGVyQ29uZGl0aW9uc1tzUHJvcGVydHlOYW1lXS5jb25jYXQoXG5cdFx0XHRcdF9idWlsZEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbihzZWxlY3RPcHRpb24sIG9NZXRhTW9kZWwsIHNFbnRpdHlTZXRQYXRoLCBnZXRDdXN0b21Db25kaXRpb25zKVtzUHJvcGVydHlOYW1lXVxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0ZpbHRlckNvbmRpdGlvbnMgPSB7XG5cdFx0XHRcdC4uLm9GaWx0ZXJDb25kaXRpb25zLFxuXHRcdFx0XHQuLi5fYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24oc2VsZWN0T3B0aW9uLCBvTWV0YU1vZGVsLCBzRW50aXR5U2V0UGF0aCwgZ2V0Q3VzdG9tQ29uZGl0aW9ucylcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcblx0YVBhcmFtZXRlcnM/LmZvckVhY2goKHBhcmFtZXRlcjogYW55KSA9PiB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IHBhcmFtZXRlci5Qcm9wZXJ0eU5hbWUudmFsdWUgfHwgcGFyYW1ldGVyLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdGNvbnN0IG9Db25kaXRpb246IGFueSA9IGdldEN1c3RvbUNvbmRpdGlvbnNcblx0XHRcdD8geyBvcGVyYXRvcjogXCJFUVwiLCB2YWx1ZTE6IHBhcmFtZXRlci5Qcm9wZXJ0eVZhbHVlLCB2YWx1ZTI6IG51bGwsIHBhdGg6IHNQcm9wZXJ0eVBhdGgsIGlzUGFyYW1ldGVyOiB0cnVlIH1cblx0XHRcdDoge1xuXHRcdFx0XHRcdG9wZXJhdG9yOiBcIkVRXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBbcGFyYW1ldGVyLlByb3BlcnR5VmFsdWVdLFxuXHRcdFx0XHRcdGlzRW1wdHk6IG51bGwsXG5cdFx0XHRcdFx0dmFsaWRhdGVkOiBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkLFxuXHRcdFx0XHRcdGlzUGFyYW1ldGVyOiB0cnVlXG5cdFx0XHQgIH07XG5cdFx0b0ZpbHRlckNvbmRpdGlvbnNbc1Byb3BlcnR5UGF0aF0gPSBbb0NvbmRpdGlvbl07XG5cdH0pO1xuXG5cdHJldHVybiBvRmlsdGVyQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmRpdGlvbnMoUmFuZ2U6IGFueSwgb1ZhbGlkUHJvcGVydHk6IGFueSk6IENvbmRpdGlvbk9iamVjdCB8IHVuZGVmaW5lZCB7XG5cdGxldCBvQ29uZGl0aW9uO1xuXHRjb25zdCBzaWduOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBSYW5nZS5TaWduID8gZ2V0UmFuZ2VQcm9wZXJ0eShSYW5nZS5TaWduKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgc09wdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gUmFuZ2UuT3B0aW9uID8gZ2V0UmFuZ2VQcm9wZXJ0eShSYW5nZS5PcHRpb24pIDogdW5kZWZpbmVkO1xuXHRjb25zdCBvVmFsdWUxOiBhbnkgPSBnZXRUeXBlQ29tcGxpYW50VmFsdWUoUmFuZ2UuTG93LCBvVmFsaWRQcm9wZXJ0eS4kVHlwZSB8fCBvVmFsaWRQcm9wZXJ0eS50eXBlKTtcblx0Y29uc3Qgb1ZhbHVlMjogYW55ID0gUmFuZ2UuSGlnaCA/IGdldFR5cGVDb21wbGlhbnRWYWx1ZShSYW5nZS5IaWdoLCBvVmFsaWRQcm9wZXJ0eS4kVHlwZSB8fCBvVmFsaWRQcm9wZXJ0eS50eXBlKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb0NvbmRpdGlvblZhbHVlcyA9IHJlc29sdmVDb25kaXRpb25WYWx1ZXMoc09wdGlvbiwgb1ZhbHVlMSwgb1ZhbHVlMiwgc2lnbikgYXMgYW55O1xuXHRpZiAob0NvbmRpdGlvblZhbHVlcykge1xuXHRcdG9Db25kaXRpb24gPSBDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKFxuXHRcdFx0b0NvbmRpdGlvblZhbHVlcy5vcGVyYXRvcixcblx0XHRcdG9Db25kaXRpb25WYWx1ZXMudmFsdWVzLFxuXHRcdFx0bnVsbCxcblx0XHRcdG51bGwsXG5cdFx0XHRDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gb0NvbmRpdGlvbjtcbn1cblxuY29uc3QgZ2V0RGVmYXVsdFZhbHVlRmlsdGVycyA9IGZ1bmN0aW9uIChvQ29udGV4dDogYW55LCBwcm9wZXJ0aWVzOiBhbnkpOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0Y29uc3QgZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldFBhdGgoKSxcblx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldE1vZGVsKCk7XG5cdGlmIChwcm9wZXJ0aWVzKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0Y29uc3QgZGVmYXVsdEZpbHRlclZhbHVlID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0vJHtrZXl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJEZWZhdWx0VmFsdWVgKTtcblx0XHRcdGlmIChkZWZhdWx0RmlsdGVyVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBQcm9wZXJ0eU5hbWUgPSBrZXk7XG5cdFx0XHRcdGZpbHRlckNvbmRpdGlvbnNbUHJvcGVydHlOYW1lXSA9IFtcblx0XHRcdFx0XHRDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKFwiRVFcIiwgW2RlZmF1bHRGaWx0ZXJWYWx1ZV0sIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWQpIGFzIEZpbHRlckNvbmRpdGlvbnNcblx0XHRcdFx0XTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGZpbHRlckNvbmRpdGlvbnM7XG59O1xuXG5jb25zdCBnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyA9IGZ1bmN0aW9uIChcblx0b0NvbnRleHQ6IGFueSxcblx0cHJvcGVydGllczogYW55LFxuXHRkZWZhdWx0U2VtYW50aWNEYXRlczogYW55XG4pOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0Y29uc3QgZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRjb25zdCBvSW50ZXJmYWNlID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBvSW50ZXJmYWNlLmdldFBhdGgoKTtcblx0Zm9yIChjb25zdCBrZXkgaW4gZGVmYXVsdFNlbWFudGljRGF0ZXMpIHtcblx0XHRpZiAoZGVmYXVsdFNlbWFudGljRGF0ZXNba2V5XVswXSkge1xuXHRcdFx0Y29uc3QgYVByb3BlcnR5UGF0aFBhcnRzID0ga2V5LnNwbGl0KFwiOjpcIik7XG5cdFx0XHRsZXQgc1BhdGggPSBcIlwiO1xuXHRcdFx0Y29uc3QgaVByb3BlcnR5UGF0aExlbmd0aCA9IGFQcm9wZXJ0eVBhdGhQYXJ0cy5sZW5ndGg7XG5cdFx0XHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBhUHJvcGVydHlQYXRoUGFydHMuc2xpY2UoMCwgYVByb3BlcnR5UGF0aFBhcnRzLmxlbmd0aCAtIDEpLmpvaW4oXCIvXCIpO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gYVByb3BlcnR5UGF0aFBhcnRzW2lQcm9wZXJ0eVBhdGhMZW5ndGggLSAxXTtcblx0XHRcdGlmIChzTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdFx0Ly9DcmVhdGUgUHJvcGVyIENvbmRpdGlvbiBQYXRoIGUuZy4gX0l0ZW0qL1Byb3BlcnR5IG9yIF9JdGVtL1Byb3BlcnR5XG5cdFx0XHRcdGNvbnN0IHZQcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNFbnRpdHlUeXBlUGF0aCArIFwiL1wiICsgc05hdmlnYXRpb25QYXRoKTtcblx0XHRcdFx0aWYgKHZQcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJiB2UHJvcGVydHkuJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0XHRcdHNQYXRoICs9IGAke3NOYXZpZ2F0aW9uUGF0aH0qL2A7XG5cdFx0XHRcdH0gZWxzZSBpZiAodlByb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0c1BhdGggKz0gYCR7c05hdmlnYXRpb25QYXRofS9gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRzUGF0aCArPSBzUHJvcGVydHk7XG5cdFx0XHRjb25zdCBvcGVyYXRvclBhcmFtc0FyciA9IFwidmFsdWVzXCIgaW4gZGVmYXVsdFNlbWFudGljRGF0ZXNba2V5XVswXSA/IGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0udmFsdWVzIDogW107XG5cdFx0XHRmaWx0ZXJDb25kaXRpb25zW3NQYXRoXSA9IFtcblx0XHRcdFx0Q29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihkZWZhdWx0U2VtYW50aWNEYXRlc1trZXldWzBdLm9wZXJhdG9yLCBvcGVyYXRvclBhcmFtc0FyciwgbnVsbCwgbnVsbCwgbnVsbCkgYXMgRmlsdGVyQ29uZGl0aW9uc1xuXHRcdFx0XTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZpbHRlckNvbmRpdGlvbnM7XG59O1xuXG5mdW5jdGlvbiBnZXRFZGl0U3RhdHVzRmlsdGVyKCk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBvZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRvZmlsdGVyQ29uZGl0aW9uc1tcIiRlZGl0U3RhdGVcIl0gPSBbXG5cdFx0Q29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkRSQUZUX0VESVRfU1RBVEVcIiwgW1wiQUxMXCJdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKSBhcyBGaWx0ZXJDb25kaXRpb25zXG5cdF07XG5cdHJldHVybiBvZmlsdGVyQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlckNvbmRpdGlvbnMob0NvbnRleHQ6IGFueSwgZmlsdGVyQ29uZGl0aW9uczogYW55KTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGxldCBlZGl0U3RhdGVGaWx0ZXI7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0UGF0aCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0TW9kZWwoKSxcblx0XHRlbnRpdHlUeXBlQW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBgKSxcblx0XHRlbnRpdHlUeXBlUHJvcGVydGllcyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9L2ApO1xuXHRpZiAoXG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zICYmXG5cdFx0KGVudGl0eVR5cGVBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdIHx8XG5cdFx0XHRlbnRpdHlUeXBlQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVwiXSlcblx0KSB7XG5cdFx0ZWRpdFN0YXRlRmlsdGVyID0gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpO1xuXHR9XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBmaWx0ZXJDb25kaXRpb25zPy5zZWxlY3Rpb25WYXJpYW50O1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IGZpbHRlckNvbmRpdGlvbnM/LmRlZmF1bHRTZW1hbnRpY0RhdGVzIHx8IHt9O1xuXHRjb25zdCBkZWZhdWx0RmlsdGVycyA9IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMob0NvbnRleHQsIGVudGl0eVR5cGVQcm9wZXJ0aWVzKTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyhvQ29udGV4dCwgZW50aXR5VHlwZVByb3BlcnRpZXMsIGRlZmF1bHRTZW1hbnRpY0RhdGVzKTtcblx0aWYgKHNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0gZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChlbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsLCBzZWxlY3Rpb25WYXJpYW50KTtcblx0fSBlbHNlIGlmIChkZWZhdWx0RmlsdGVycykge1xuXHRcdGZpbHRlckNvbmRpdGlvbnMgPSBkZWZhdWx0RmlsdGVycztcblx0fVxuXHRpZiAoZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMpIHtcblx0XHQvLyBvbmx5IGZvciBzZW1hbnRpYyBkYXRlOlxuXHRcdC8vIDEuIHZhbHVlIGZyb20gbWFuaWZlc3QgZ2V0IG1lcmdlZCB3aXRoIFNWXG5cdFx0Ly8gMi4gbWFuaWZlc3QgdmFsdWUgaXMgZ2l2ZW4gcHJlZmVyZW5jZSB3aGVuIHRoZXJlIGlzIHNhbWUgc2VtYW50aWMgZGF0ZSBwcm9wZXJ0eSBpbiBTViBhbmQgbWFuaWZlc3Rcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5kZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyB9O1xuXHR9XG5cdGlmIChlZGl0U3RhdGVGaWx0ZXIpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5lZGl0U3RhdGVGaWx0ZXIgfTtcblx0fVxuXHRyZXR1cm4gKE9iamVjdC5rZXlzKGZpbHRlckNvbmRpdGlvbnMpLmxlbmd0aCA+IDAgPyBKU09OLnN0cmluZ2lmeShmaWx0ZXJDb25kaXRpb25zKS5yZXBsYWNlKC8oW3t9XSkvZywgXCJcXFxcJDFcIikgOiB1bmRlZmluZWQpIGFzIGFueTtcbn1cblxuZ2V0RmlsdGVyQ29uZGl0aW9ucy5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBZUEsTUFBTUEsV0FBZ0MsR0FBRztJQUN4Q0MsUUFBUSxFQUFFLGFBQWE7SUFDdkJDLFVBQVUsRUFBRSxlQUFlO0lBQzNCQyxRQUFRLEVBQUUsYUFBYTtJQUN2QkMsS0FBSyxFQUFFLFVBQVU7SUFDakJDLFFBQVEsRUFBRSxPQUFPO0lBQ2pCQyxFQUFFLEVBQUUsT0FBTztJQUNYQyxFQUFFLEVBQUUsT0FBTztJQUNYQyxFQUFFLEVBQUUsT0FBTztJQUNYQyxFQUFFLEVBQUUsT0FBTztJQUNYQyxFQUFFLEVBQUUsT0FBTztJQUNYQyxFQUFFLEVBQUUsSUFBSTtJQUNSQyxFQUFFLEVBQUU7RUFDTCxDQUFDO0VBRU0sU0FBU0MsZ0NBQWdDLENBQUNDLE1BQVcsRUFBc0I7SUFDakYsSUFBSUMsTUFBTTtJQUNWLElBQUlELE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLHVFQUF1RSxDQUFDLEVBQUU7TUFDMUZELE1BQU0sR0FBR0QsTUFBTSxDQUFDRSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQyxNQUFNLElBQUlGLE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLDREQUE0RCxDQUFDLEVBQUU7TUFDdEZELE1BQU0sR0FBSSxHQUFFRCxNQUFNLENBQUNFLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDLENBQUMsQ0FBRSxPQUFNO0lBQ2pHLENBQUMsTUFBTSxJQUFJRixNQUFNLENBQUNFLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO01BQ3hERCxNQUFNLEdBQUksR0FBRUQsTUFBTSxDQUFDRSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUUsZ0JBQWU7SUFDNUUsQ0FBQyxNQUFNLElBQUlGLE1BQU0sQ0FBQ0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLSCxNQUFNLENBQUNJLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDckRILE1BQU0sR0FBSSxHQUFFRCxNQUFNLENBQUNLLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUUsT0FBTTtJQUN4QyxDQUFDLE1BQU07TUFDTkosTUFBTSxHQUFHSyxTQUFTO0lBQ25CO0lBQ0EsT0FBT0wsTUFBTTtFQUNkO0VBQUM7RUFFTSxTQUFTTSxzQkFBc0IsQ0FBQ1AsTUFBVyxFQUFzQjtJQUN2RSxPQUFPQSxNQUFNLENBQUNFLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxHQUNoREYsTUFBTSxDQUFDRSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDL0NGLE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJRixNQUFNLENBQUNFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQVFPLFNBQVNNLHFCQUFxQixDQUFDUixNQUFXLEVBQUVTLEtBQWEsRUFBc0I7SUFDckYsSUFBSVIsTUFBTTtJQUNWLElBQUksQ0FBQ1MsZ0JBQWdCLENBQUNELEtBQUssQ0FBdUMsRUFBRTtNQUNuRSxPQUFPSCxTQUFTO0lBQ2pCO0lBQ0FMLE1BQU0sR0FBR0QsTUFBTTtJQUNmLFFBQVFTLEtBQUs7TUFDWixLQUFLLGFBQWE7UUFDakIsSUFBSSxPQUFPVCxNQUFNLEtBQUssU0FBUyxFQUFFO1VBQ2hDQyxNQUFNLEdBQUdELE1BQU07UUFDaEIsQ0FBQyxNQUFNO1VBQ05DLE1BQU0sR0FBR0QsTUFBTSxLQUFLLE1BQU0sS0FBS0EsTUFBTSxLQUFLLE9BQU8sR0FBRyxLQUFLLEdBQUdNLFNBQVMsQ0FBQztRQUN2RTtRQUNBO01BQ0QsS0FBSyxZQUFZO01BQ2pCLEtBQUssWUFBWTtRQUNoQkwsTUFBTSxHQUFHVSxLQUFLLENBQUNYLE1BQU0sQ0FBQyxHQUFHTSxTQUFTLEdBQUdNLFVBQVUsQ0FBQ1osTUFBTSxDQUFDO1FBQ3ZEO01BQ0QsS0FBSyxVQUFVO01BQ2YsS0FBSyxXQUFXO01BQ2hCLEtBQUssV0FBVztNQUNoQixLQUFLLFdBQVc7UUFDZkMsTUFBTSxHQUFHVSxLQUFLLENBQUNYLE1BQU0sQ0FBQyxHQUFHTSxTQUFTLEdBQUdPLFFBQVEsQ0FBQ2IsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQUN6RDtNQUNELEtBQUssVUFBVTtRQUNkQyxNQUFNLEdBQUdNLHNCQUFzQixDQUFDUCxNQUFNLENBQUM7UUFDdkM7TUFDRCxLQUFLLG9CQUFvQjtRQUN4QkMsTUFBTSxHQUFHRixnQ0FBZ0MsQ0FBQ0MsTUFBTSxDQUFDO1FBQ2pEO01BQ0QsS0FBSyxlQUFlO1FBQ25CQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLCtCQUErQixDQUFDLEdBQUdGLE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUdJLFNBQVM7UUFDckg7TUFDRDtJQUFRO0lBR1QsT0FBT0wsTUFBTSxLQUFLLElBQUksR0FBR0ssU0FBUyxHQUFHTCxNQUFNO0VBQzVDOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVJBO0VBU08sU0FBU2Esc0JBQXNCLENBQUNDLE9BQTJCLEVBQUVDLEdBQVEsRUFBRUMsR0FBUSxFQUFFQyxLQUF5QixFQUFFO0lBQ2xILElBQUlqQixNQUFNLEdBQUdlLEdBQUc7TUFDZkcsT0FBTztNQUNQQyxrQkFBdUI7SUFDeEIsTUFBTUMsVUFBOEMsR0FBRyxDQUFDLENBQUM7SUFDekRBLFVBQVUsQ0FBQ0MsTUFBTSxHQUFHLEVBQUU7SUFDdEJELFVBQVUsQ0FBQ0UsT0FBTyxHQUFHLElBQVc7SUFDaEMsSUFBSVAsR0FBRyxLQUFLVixTQUFTLElBQUlVLEdBQUcsS0FBSyxJQUFJLEVBQUU7TUFDdEMsT0FBT1YsU0FBUztJQUNqQjtJQUVBLFFBQVFTLE9BQU87TUFDZCxLQUFLLElBQUk7UUFDUkssa0JBQWtCLEdBQUcsVUFBVTtRQUMvQixJQUFJbkIsTUFBTSxFQUFFO1VBQ1gsTUFBTXVCLFFBQVEsR0FBR3ZCLE1BQU0sQ0FBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQztVQUNwQyxNQUFNc0IsVUFBVSxHQUFHeEIsTUFBTSxDQUFDeUIsV0FBVyxDQUFDLEdBQUcsQ0FBQzs7VUFFMUM7VUFDQSxJQUFJRixRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDbEIsSUFBSUEsUUFBUSxLQUFLLENBQUMsSUFBSUMsVUFBVSxLQUFLeEIsTUFBTSxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2NBQ3ZEZ0Isa0JBQWtCLEdBQUcsVUFBVTtjQUMvQm5CLE1BQU0sR0FBR0EsTUFBTSxDQUFDMEIsU0FBUyxDQUFDLENBQUMsRUFBRTFCLE1BQU0sQ0FBQ0csTUFBTSxDQUFDO1lBQzVDLENBQUMsTUFBTSxJQUFJb0IsUUFBUSxLQUFLLENBQUMsSUFBSUMsVUFBVSxLQUFLeEIsTUFBTSxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2NBQzlEZ0Isa0JBQWtCLEdBQUcsWUFBWTtjQUNqQ25CLE1BQU0sR0FBR0EsTUFBTSxDQUFDMEIsU0FBUyxDQUFDLENBQUMsRUFBRTFCLE1BQU0sQ0FBQ0csTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNoRCxDQUFDLE1BQU07Y0FDTkgsTUFBTSxHQUFHQSxNQUFNLENBQUMwQixTQUFTLENBQUMsQ0FBQyxFQUFFMUIsTUFBTSxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2hEO1VBQ0QsQ0FBQyxNQUFNO1lBQ053QixHQUFHLENBQUNDLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQztZQUMxRCxPQUFPdkIsU0FBUztVQUNqQjtRQUNEO1FBQ0E7TUFDRCxLQUFLLElBQUk7UUFDUmMsa0JBQWtCLEdBQUdKLEdBQUcsS0FBSyxFQUFFLEdBQUcsT0FBTyxHQUFHRCxPQUFPO1FBQ25EO01BQ0QsS0FBSyxJQUFJO1FBQ1JLLGtCQUFrQixHQUFHSixHQUFHLEtBQUssRUFBRSxHQUFHLFVBQVUsR0FBR0QsT0FBTztRQUN0RDtNQUNELEtBQUssSUFBSTtRQUNSLElBQUlFLEdBQUcsS0FBS1gsU0FBUyxJQUFJVyxHQUFHLEtBQUssSUFBSSxFQUFFO1VBQ3RDO1FBQ0Q7UUFDQUUsT0FBTyxHQUFHRixHQUFHO1FBQ2JHLGtCQUFrQixHQUFHTCxPQUFPO1FBQzVCO01BQ0QsS0FBSyxJQUFJO01BQ1QsS0FBSyxJQUFJO01BQ1QsS0FBSyxJQUFJO01BQ1QsS0FBSyxJQUFJO1FBQ1JLLGtCQUFrQixHQUFHTCxPQUFPO1FBQzVCO01BQ0Q7UUFDQ2EsR0FBRyxDQUFDQyxPQUFPLENBQUUsd0NBQXVDZCxPQUFRLEdBQUUsQ0FBQztRQUMvRCxPQUFPVCxTQUFTO0lBQUM7SUFFbkIsSUFBSVksS0FBSyxLQUFLLEdBQUcsRUFBRTtNQUNsQkUsa0JBQWtCLEdBQUdsQyxXQUFXLENBQUNrQyxrQkFBa0IsQ0FBQztJQUNyRDtJQUNBQyxVQUFVLENBQUNTLFFBQVEsR0FBR1Ysa0JBQWtCO0lBQ3hDLElBQUlBLGtCQUFrQixLQUFLLE9BQU8sRUFBRTtNQUNuQ0MsVUFBVSxDQUFDQyxNQUFNLENBQUNTLElBQUksQ0FBQzlCLE1BQU0sQ0FBQztNQUM5QixJQUFJa0IsT0FBTyxFQUFFO1FBQ1pFLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDUyxJQUFJLENBQUNaLE9BQU8sQ0FBQztNQUNoQztJQUNEO0lBQ0EsT0FBT0UsVUFBVTtFQUNsQjs7RUFFQTtFQUFBO0VBQ08sU0FBU1csZ0JBQWdCLENBQUNDLFNBQWlCLEVBQVU7SUFDM0QsT0FBT0EsU0FBUyxDQUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRzhCLFNBQVMsQ0FBQzVCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzRCLFNBQVM7RUFDeEU7RUFBQztFQUVELFNBQVNDLG1DQUFtQyxDQUMzQ0MsTUFBaUMsRUFDakNDLFNBQWlDLEVBQ2pDQyxhQUFxQixFQUNyQkMsbUJBQThCLEVBQ3RCO0lBQ1IsTUFBTUMsV0FBa0IsR0FBRyxFQUFFO0lBQzdCSixNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBRUssT0FBTyxDQUFFQyxLQUFVLElBQUs7TUFDL0IsTUFBTXBCLFVBQVUsR0FBR2lCLG1CQUFtQixHQUFHQSxtQkFBbUIsQ0FBQ0csS0FBSyxFQUFFTCxTQUFTLEVBQUVDLGFBQWEsQ0FBQyxHQUFHSyxhQUFhLENBQUNELEtBQUssRUFBRUwsU0FBUyxDQUFDO01BQy9ILElBQUlmLFVBQVUsRUFBRTtRQUNma0IsV0FBVyxDQUFDUixJQUFJLENBQUNWLFVBQVUsQ0FBQztNQUM3QjtJQUNELENBQUMsQ0FBQztJQUNGLE9BQU9rQixXQUFXO0VBQ25CO0VBRUEsU0FBU0ksWUFBWSxDQUFDQyxZQUFvQixFQUFFQyxTQUF5QixFQUFFQyxhQUFxQixFQUEwQjtJQUNySCxNQUFNQyxjQUFjLEdBQUdILFlBQVksQ0FBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUM7SUFDcEQsTUFBTXNCLGNBQWMsR0FBR0QsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHSCxZQUFZLENBQUNqQixTQUFTLENBQUMsQ0FBQyxFQUFFaUIsWUFBWSxDQUFDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUU7SUFDOUcsTUFBTXVCLFVBQVUsR0FBR0osU0FBUyxDQUFDSyxTQUFTLENBQUUsR0FBRUosYUFBYyxJQUFHRSxjQUFlLEVBQUMsQ0FBQztJQUM1RSxPQUFPQyxVQUFVLGFBQVZBLFVBQVUsdUJBQVZBLFVBQVUsQ0FBR0wsWUFBWSxDQUFDTyxPQUFPLENBQUNILGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUM5RDtFQUVBLFNBQVNJLHVDQUF1QyxDQUMvQ0MsWUFBOEIsRUFDOUJSLFNBQXlCLEVBQ3pCQyxhQUFxQixFQUNyQlIsbUJBQThCLEVBQ087SUFDckMsTUFBTU0sWUFBaUIsR0FBR1MsWUFBWSxDQUFDQyxZQUFZO01BQ2xEQyxnQkFBb0QsR0FBRyxDQUFDLENBQUM7TUFDekRDLFlBQW9CLEdBQUdaLFlBQVksQ0FBQ2EsS0FBSyxJQUFJYixZQUFZLENBQUNjLGFBQWE7TUFDdkV2QixNQUFpQyxHQUFHa0IsWUFBWSxDQUFDbEIsTUFBTTtJQUN4RCxNQUFNd0IsY0FBYyxHQUFHaEIsWUFBWSxDQUFDYSxZQUFZLEVBQUVYLFNBQVMsRUFBRUMsYUFBYSxDQUFDO0lBQzNFLElBQUlhLGNBQWMsRUFBRTtNQUNuQixNQUFNQyxVQUFpQixHQUFHMUIsbUNBQW1DLENBQUNDLE1BQU0sRUFBRXdCLGNBQWMsRUFBRUgsWUFBWSxFQUFFbEIsbUJBQW1CLENBQUM7TUFDeEgsSUFBSXNCLFVBQVUsQ0FBQ3hELE1BQU0sRUFBRTtRQUN0Qm1ELGdCQUFnQixDQUFDQyxZQUFZLENBQUMsR0FBRyxDQUFDRCxnQkFBZ0IsQ0FBQ0MsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFSyxNQUFNLENBQUNELFVBQVUsQ0FBQztNQUMzRjtJQUNEO0lBQ0EsT0FBT0wsZ0JBQWdCO0VBQ3hCO0VBRU8sU0FBU08sd0NBQXdDLENBQ3ZEQyxjQUFzQixFQUN0QkMsVUFBMEIsRUFDMUJDLGdCQUEyQyxFQUMzQzNCLG1CQUE4QixFQUNPO0lBQ3JDLElBQUk0QixpQkFBcUQsR0FBRyxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDRCxnQkFBZ0IsRUFBRTtNQUN0QixPQUFPQyxpQkFBaUI7SUFDekI7SUFDQSxNQUFNQyxjQUFjLEdBQUdGLGdCQUFnQixDQUFDRyxhQUFhO01BQ3BEQyxXQUFXLEdBQUdKLGdCQUFnQixDQUFDSyxVQUFVO0lBQzFDSCxjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRTNCLE9BQU8sQ0FBRWEsWUFBOEIsSUFBSztNQUMzRCxNQUFNVCxZQUFpQixHQUFHUyxZQUFZLENBQUNDLFlBQVk7UUFDbERqQixhQUFxQixHQUFHTyxZQUFZLENBQUNhLEtBQUssSUFBSWIsWUFBWSxDQUFDYyxhQUFhO01BQ3pFLElBQUlhLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDTixpQkFBaUIsQ0FBQyxDQUFDTyxRQUFRLENBQUNwQyxhQUFhLENBQUMsRUFBRTtRQUMzRDZCLGlCQUFpQixDQUFDN0IsYUFBYSxDQUFDLEdBQUc2QixpQkFBaUIsQ0FBQzdCLGFBQWEsQ0FBQyxDQUFDd0IsTUFBTSxDQUN6RVQsdUNBQXVDLENBQUNDLFlBQVksRUFBRVcsVUFBVSxFQUFFRCxjQUFjLEVBQUV6QixtQkFBbUIsQ0FBQyxDQUFDRCxhQUFhLENBQUMsQ0FDckg7TUFDRixDQUFDLE1BQU07UUFDTjZCLGlCQUFpQixHQUFHO1VBQ25CLEdBQUdBLGlCQUFpQjtVQUNwQixHQUFHZCx1Q0FBdUMsQ0FBQ0MsWUFBWSxFQUFFVyxVQUFVLEVBQUVELGNBQWMsRUFBRXpCLG1CQUFtQjtRQUN6RyxDQUFDO01BQ0Y7SUFDRCxDQUFDLENBQUM7SUFDRitCLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFN0IsT0FBTyxDQUFFa0MsU0FBYyxJQUFLO01BQ3hDLE1BQU1DLGFBQWEsR0FBR0QsU0FBUyxDQUFDcEIsWUFBWSxDQUFDRyxLQUFLLElBQUlpQixTQUFTLENBQUNwQixZQUFZLENBQUNJLGFBQWE7TUFDMUYsTUFBTXJDLFVBQWUsR0FBR2lCLG1CQUFtQixHQUN4QztRQUFFUixRQUFRLEVBQUUsSUFBSTtRQUFFOEMsTUFBTSxFQUFFRixTQUFTLENBQUNHLGFBQWE7UUFBRUMsTUFBTSxFQUFFLElBQUk7UUFBRUMsSUFBSSxFQUFFSixhQUFhO1FBQUVLLFdBQVcsRUFBRTtNQUFLLENBQUMsR0FDekc7UUFDQWxELFFBQVEsRUFBRSxJQUFJO1FBQ2RSLE1BQU0sRUFBRSxDQUFDb0QsU0FBUyxDQUFDRyxhQUFhLENBQUM7UUFDakN0RCxPQUFPLEVBQUUsSUFBSTtRQUNiMEQsU0FBUyxFQUFFQyxrQkFBa0IsQ0FBQ0MsU0FBUztRQUN2Q0gsV0FBVyxFQUFFO01BQ2IsQ0FBQztNQUNKZCxpQkFBaUIsQ0FBQ1MsYUFBYSxDQUFDLEdBQUcsQ0FBQ3RELFVBQVUsQ0FBQztJQUNoRCxDQUFDLENBQUM7SUFFRixPQUFPNkMsaUJBQWlCO0VBQ3pCO0VBQUM7RUFFTSxTQUFTeEIsYUFBYSxDQUFDRCxLQUFVLEVBQUUyQyxjQUFtQixFQUErQjtJQUMzRixJQUFJL0QsVUFBVTtJQUNkLE1BQU1nRSxJQUF3QixHQUFHNUMsS0FBSyxDQUFDNkMsSUFBSSxHQUFHdEQsZ0JBQWdCLENBQUNTLEtBQUssQ0FBQzZDLElBQUksQ0FBQyxHQUFHaEYsU0FBUztJQUN0RixNQUFNUyxPQUEyQixHQUFHMEIsS0FBSyxDQUFDOEMsTUFBTSxHQUFHdkQsZ0JBQWdCLENBQUNTLEtBQUssQ0FBQzhDLE1BQU0sQ0FBQyxHQUFHakYsU0FBUztJQUM3RixNQUFNa0YsT0FBWSxHQUFHaEYscUJBQXFCLENBQUNpQyxLQUFLLENBQUNnRCxHQUFHLEVBQUVMLGNBQWMsQ0FBQ00sS0FBSyxJQUFJTixjQUFjLENBQUNPLElBQUksQ0FBQztJQUNsRyxNQUFNeEUsT0FBWSxHQUFHc0IsS0FBSyxDQUFDbUQsSUFBSSxHQUFHcEYscUJBQXFCLENBQUNpQyxLQUFLLENBQUNtRCxJQUFJLEVBQUVSLGNBQWMsQ0FBQ00sS0FBSyxJQUFJTixjQUFjLENBQUNPLElBQUksQ0FBQyxHQUFHckYsU0FBUztJQUM1SCxNQUFNdUYsZ0JBQWdCLEdBQUcvRSxzQkFBc0IsQ0FBQ0MsT0FBTyxFQUFFeUUsT0FBTyxFQUFFckUsT0FBTyxFQUFFa0UsSUFBSSxDQUFRO0lBQ3ZGLElBQUlRLGdCQUFnQixFQUFFO01BQ3JCeEUsVUFBVSxHQUFHeUUsU0FBUyxDQUFDQyxlQUFlLENBQ3JDRixnQkFBZ0IsQ0FBQy9ELFFBQVEsRUFDekIrRCxnQkFBZ0IsQ0FBQ3ZFLE1BQU0sRUFDdkIsSUFBSSxFQUNKLElBQUksRUFDSjRELGtCQUFrQixDQUFDQyxTQUFTLENBQzVCO0lBQ0Y7SUFDQSxPQUFPOUQsVUFBVTtFQUNsQjtFQUFDO0VBRUQsTUFBTTJFLHNCQUFzQixHQUFHLFVBQVVDLFFBQWEsRUFBRUMsVUFBZSxFQUFzQztJQUM1RyxNQUFNM0MsZ0JBQW9ELEdBQUcsQ0FBQyxDQUFDO0lBQy9ELE1BQU1ULGFBQWEsR0FBR21ELFFBQVEsQ0FBQ0UsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxPQUFPLEVBQUU7TUFDdkRwQyxVQUFVLEdBQUdpQyxRQUFRLENBQUNFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsUUFBUSxFQUFFO0lBQ2pELElBQUlILFVBQVUsRUFBRTtNQUNmLEtBQUssTUFBTUksR0FBRyxJQUFJSixVQUFVLEVBQUU7UUFDN0IsTUFBTUssa0JBQWtCLEdBQUd2QyxVQUFVLENBQUNkLFNBQVMsQ0FBRSxHQUFFSixhQUFjLElBQUd3RCxHQUFJLG9EQUFtRCxDQUFDO1FBQzVILElBQUlDLGtCQUFrQixLQUFLakcsU0FBUyxFQUFFO1VBQ3JDLE1BQU1nRCxZQUFZLEdBQUdnRCxHQUFHO1VBQ3hCL0MsZ0JBQWdCLENBQUNELFlBQVksQ0FBQyxHQUFHLENBQ2hDd0MsU0FBUyxDQUFDQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUNRLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRXJCLGtCQUFrQixDQUFDQyxTQUFTLENBQUMsQ0FDL0Y7UUFDRjtNQUNEO0lBQ0Q7SUFDQSxPQUFPNUIsZ0JBQWdCO0VBQ3hCLENBQUM7RUFFRCxNQUFNaUQsNkJBQTZCLEdBQUcsVUFDckNQLFFBQWEsRUFDYkMsVUFBZSxFQUNmTyxvQkFBeUIsRUFDWTtJQUNyQyxNQUFNbEQsZ0JBQW9ELEdBQUcsQ0FBQyxDQUFDO0lBQy9ELE1BQU1tRCxVQUFVLEdBQUdULFFBQVEsQ0FBQ0UsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUMzQyxNQUFNbkMsVUFBVSxHQUFHMEMsVUFBVSxDQUFDTCxRQUFRLEVBQUU7SUFDeEMsTUFBTU0sZUFBZSxHQUFHRCxVQUFVLENBQUNOLE9BQU8sRUFBRTtJQUM1QyxLQUFLLE1BQU1FLEdBQUcsSUFBSUcsb0JBQW9CLEVBQUU7TUFDdkMsSUFBSUEsb0JBQW9CLENBQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2pDLE1BQU1NLGtCQUFrQixHQUFHTixHQUFHLENBQUNqRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzFDLElBQUl3RyxLQUFLLEdBQUcsRUFBRTtRQUNkLE1BQU1DLG1CQUFtQixHQUFHRixrQkFBa0IsQ0FBQ3hHLE1BQU07UUFDckQsTUFBTTJHLGVBQWUsR0FBR0gsa0JBQWtCLENBQUNJLEtBQUssQ0FBQyxDQUFDLEVBQUVKLGtCQUFrQixDQUFDeEcsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDNkcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUM1RixNQUFNaEYsU0FBUyxHQUFHMkUsa0JBQWtCLENBQUNFLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUM3RCxJQUFJQyxlQUFlLEVBQUU7VUFDcEI7VUFDQSxNQUFNRyxTQUFTLEdBQUdsRCxVQUFVLENBQUNkLFNBQVMsQ0FBQ3lELGVBQWUsR0FBRyxHQUFHLEdBQUdJLGVBQWUsQ0FBQztVQUMvRSxJQUFJRyxTQUFTLENBQUNDLEtBQUssS0FBSyxvQkFBb0IsSUFBSUQsU0FBUyxDQUFDRSxhQUFhLEVBQUU7WUFDeEVQLEtBQUssSUFBSyxHQUFFRSxlQUFnQixJQUFHO1VBQ2hDLENBQUMsTUFBTSxJQUFJRyxTQUFTLENBQUNDLEtBQUssS0FBSyxvQkFBb0IsRUFBRTtZQUNwRE4sS0FBSyxJQUFLLEdBQUVFLGVBQWdCLEdBQUU7VUFDL0I7UUFDRDtRQUNBRixLQUFLLElBQUk1RSxTQUFTO1FBQ2xCLE1BQU1vRixpQkFBaUIsR0FBRyxRQUFRLElBQUlaLG9CQUFvQixDQUFDSCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBR0csb0JBQW9CLENBQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDaEYsTUFBTSxHQUFHLEVBQUU7UUFDN0dpQyxnQkFBZ0IsQ0FBQ3NELEtBQUssQ0FBQyxHQUFHLENBQ3pCZixTQUFTLENBQUNDLGVBQWUsQ0FBQ1Usb0JBQW9CLENBQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDeEUsUUFBUSxFQUFFdUYsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FDckc7TUFDRjtJQUNEO0lBQ0EsT0FBTzlELGdCQUFnQjtFQUN4QixDQUFDO0VBRUQsU0FBUytELG1CQUFtQixHQUF1QztJQUNsRSxNQUFNQyxpQkFBcUQsR0FBRyxDQUFDLENBQUM7SUFDaEVBLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ2pDekIsU0FBUyxDQUFDQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFYixrQkFBa0IsQ0FBQ0MsU0FBUyxDQUFDLENBQ2hHO0lBQ0QsT0FBT29DLGlCQUFpQjtFQUN6QjtFQUVPLFNBQVNDLG1CQUFtQixDQUFDdkIsUUFBYSxFQUFFMUMsZ0JBQXFCLEVBQXNDO0lBQUE7SUFDN0csSUFBSWtFLGVBQWU7SUFDbkIsTUFBTTNFLGFBQWEsR0FBR21ELFFBQVEsQ0FBQ0UsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxPQUFPLEVBQUU7TUFDdkRwQyxVQUFVLEdBQUdpQyxRQUFRLENBQUNFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQ0UsUUFBUSxFQUFFO01BQ2hEcUIscUJBQXFCLEdBQUcxRCxVQUFVLENBQUNkLFNBQVMsQ0FBRSxHQUFFSixhQUFjLEdBQUUsQ0FBQztNQUNqRTZFLG9CQUFvQixHQUFHM0QsVUFBVSxDQUFDZCxTQUFTLENBQUUsR0FBRUosYUFBYyxHQUFFLENBQUM7SUFDakUsSUFDQzRFLHFCQUFxQixLQUNwQkEscUJBQXFCLENBQUMsMkNBQTJDLENBQUMsSUFDbEVBLHFCQUFxQixDQUFDLDJDQUEyQyxDQUFDLENBQUMsRUFDbkU7TUFDREQsZUFBZSxHQUFHSCxtQkFBbUIsRUFBRTtJQUN4QztJQUNBLE1BQU1yRCxnQkFBZ0Isd0JBQUdWLGdCQUFnQixzREFBaEIsa0JBQWtCVSxnQkFBZ0I7SUFDM0QsTUFBTXdDLG9CQUFvQixHQUFHLHVCQUFBbEQsZ0JBQWdCLHVEQUFoQixtQkFBa0JrRCxvQkFBb0IsS0FBSSxDQUFDLENBQUM7SUFDekUsTUFBTW1CLGNBQWMsR0FBRzVCLHNCQUFzQixDQUFDQyxRQUFRLEVBQUUwQixvQkFBb0IsQ0FBQztJQUM3RSxNQUFNRSwwQkFBMEIsR0FBR3JCLDZCQUE2QixDQUFDUCxRQUFRLEVBQUUwQixvQkFBb0IsRUFBRWxCLG9CQUFvQixDQUFDO0lBQ3RILElBQUl4QyxnQkFBZ0IsRUFBRTtNQUNyQlYsZ0JBQWdCLEdBQUdPLHdDQUF3QyxDQUFDaEIsYUFBYSxFQUFFa0IsVUFBVSxFQUFFQyxnQkFBZ0IsQ0FBQztJQUN6RyxDQUFDLE1BQU0sSUFBSTJELGNBQWMsRUFBRTtNQUMxQnJFLGdCQUFnQixHQUFHcUUsY0FBYztJQUNsQztJQUNBLElBQUlDLDBCQUEwQixFQUFFO01BQy9CO01BQ0E7TUFDQTtNQUNBdEUsZ0JBQWdCLEdBQUc7UUFBRSxHQUFHQSxnQkFBZ0I7UUFBRSxHQUFHc0U7TUFBMkIsQ0FBQztJQUMxRTtJQUNBLElBQUlKLGVBQWUsRUFBRTtNQUNwQmxFLGdCQUFnQixHQUFHO1FBQUUsR0FBR0EsZ0JBQWdCO1FBQUUsR0FBR2tFO01BQWdCLENBQUM7SUFDL0Q7SUFDQSxPQUFRbEQsTUFBTSxDQUFDQyxJQUFJLENBQUNqQixnQkFBZ0IsQ0FBQyxDQUFDbkQsTUFBTSxHQUFHLENBQUMsR0FBRzBILElBQUksQ0FBQ0MsU0FBUyxDQUFDeEUsZ0JBQWdCLENBQUMsQ0FBQ0osT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsR0FBRzdDLFNBQVM7RUFDM0g7RUFBQztFQUVEa0gsbUJBQW1CLENBQUNRLGdCQUFnQixHQUFHLElBQUk7RUFBQztBQUFBIn0=