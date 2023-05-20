/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/Operator", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/ValidateException"], function (FilterOperatorUtil, Operator, Filter, ModelOperator, ValidateException) {
  "use strict";

  const aSupportedOperations = ["DATE", "FROM", "TO", "DATERANGE"];
  const DYNAMIC_DATE_CATEGORY = "DYNAMIC.DATE";
  const FIXED_DATE_CATEGORY = "FIXED.DATE";
  const DYNAMIC_DATE_INT_CATEGORY = "DYNAMIC.DATE.INT";
  const DYNAMIC_DATERANGE_CATEGORY = "DYNAMIC.DATERANGE";
  const DYNAMIC_MONTH_CATEGORY = "DYNAMIC.MONTH";
  const FIXED_WEEK_CATEGORY = "FIXED.WEEK";
  const FIXED_MONTH_CATEGORY = "FIXED.MONTH";
  const FIXED_QUARTER_CATEGORY = "FIXED.QUARTER";
  const FIXED_YEAR_CATEGORY = "FIXED.YEAR";
  const DYNAMIC_WEEK_INT_CATEGORY = "DYNAMIC.WEEK.INT";
  const DYNAMIC_MONTH_INT_CATEGORY = "DYNAMIC.MONTH.INT";
  const DYNAMIC_QUARTER_INT_CATEGORY = "DYNAMIC.QUARTER.INT";
  const DYNAMIC_YEAR_INT_CATEGORY = "DYNAMIC.YEAR.INT";
  const DYNAMIC_MINUTE_INT_CATEGORY = "DYNAMIC.MINUTE.INT";
  const DYNAMIC_HOUR_INT_CATEGORY = "DYNAMIC.HOUR.INT";
  const basicDateTimeOps = {
    EQ: {
      key: "EQ",
      category: DYNAMIC_DATE_CATEGORY
    },
    BT: {
      key: "BT",
      category: DYNAMIC_DATERANGE_CATEGORY
    }
  };
  const mSemanticDateOperations = {
    DATE: {
      key: "DATE",
      category: DYNAMIC_DATE_CATEGORY
    },
    FROM: {
      key: "FROM",
      category: DYNAMIC_DATE_CATEGORY
    },
    TO: {
      key: "TO",
      category: DYNAMIC_DATE_CATEGORY
    },
    DATERANGE: {
      key: "DATERANGE",
      category: DYNAMIC_DATERANGE_CATEGORY
    },
    SPECIFICMONTH: {
      key: "SPECIFICMONTH",
      category: DYNAMIC_MONTH_CATEGORY
    },
    TODAY: {
      key: "TODAY",
      category: FIXED_DATE_CATEGORY
    },
    TODAYFROMTO: {
      key: "TODAYFROMTO",
      category: DYNAMIC_DATE_INT_CATEGORY
    },
    YESTERDAY: {
      key: "YESTERDAY",
      category: FIXED_DATE_CATEGORY
    },
    TOMORROW: {
      key: "TOMORROW",
      category: FIXED_DATE_CATEGORY
    },
    LASTDAYS: {
      key: "LASTDAYS",
      category: DYNAMIC_DATE_INT_CATEGORY
    },
    NEXTDAYS: {
      key: "NEXTDAYS",
      category: DYNAMIC_DATE_INT_CATEGORY
    },
    THISWEEK: {
      key: "THISWEEK",
      category: FIXED_WEEK_CATEGORY
    },
    LASTWEEK: {
      key: "LASTWEEK",
      category: FIXED_WEEK_CATEGORY
    },
    LASTWEEKS: {
      key: "LASTWEEKS",
      category: DYNAMIC_WEEK_INT_CATEGORY
    },
    NEXTWEEK: {
      key: "NEXTWEEK",
      category: FIXED_WEEK_CATEGORY
    },
    NEXTWEEKS: {
      key: "NEXTWEEKS",
      category: DYNAMIC_WEEK_INT_CATEGORY
    },
    THISMONTH: {
      key: "THISMONTH",
      category: FIXED_MONTH_CATEGORY
    },
    LASTMONTH: {
      key: "LASTMONTH",
      category: FIXED_MONTH_CATEGORY
    },
    LASTMONTHS: {
      key: "LASTMONTHS",
      category: DYNAMIC_MONTH_INT_CATEGORY
    },
    NEXTMONTH: {
      key: "NEXTMONTH",
      category: FIXED_MONTH_CATEGORY
    },
    NEXTMONTHS: {
      key: "NEXTMONTHS",
      category: DYNAMIC_MONTH_INT_CATEGORY
    },
    THISQUARTER: {
      key: "THISQUARTER",
      category: FIXED_QUARTER_CATEGORY
    },
    LASTQUARTER: {
      key: "LASTQUARTER",
      category: FIXED_QUARTER_CATEGORY
    },
    LASTQUARTERS: {
      key: "LASTQUARTERS",
      category: DYNAMIC_QUARTER_INT_CATEGORY
    },
    NEXTQUARTER: {
      key: "NEXTQUARTER",
      category: FIXED_QUARTER_CATEGORY
    },
    NEXTQUARTERS: {
      key: "NEXTQUARTERS",
      category: DYNAMIC_QUARTER_INT_CATEGORY
    },
    QUARTER1: {
      key: "QUARTER1",
      category: FIXED_QUARTER_CATEGORY
    },
    QUARTER2: {
      key: "QUARTER2",
      category: FIXED_QUARTER_CATEGORY
    },
    QUARTER3: {
      key: "QUARTER3",
      category: FIXED_QUARTER_CATEGORY
    },
    QUARTER4: {
      key: "QUARTER4",
      category: FIXED_QUARTER_CATEGORY
    },
    THISYEAR: {
      key: "THISYEAR",
      category: FIXED_YEAR_CATEGORY
    },
    LASTYEAR: {
      key: "LASTYEAR",
      category: FIXED_YEAR_CATEGORY
    },
    LASTYEARS: {
      key: "LASTYEARS",
      category: DYNAMIC_YEAR_INT_CATEGORY
    },
    NEXTYEAR: {
      key: "NEXTYEAR",
      category: FIXED_YEAR_CATEGORY
    },
    NEXTYEARS: {
      key: "NEXTYEARS",
      category: DYNAMIC_YEAR_INT_CATEGORY
    },
    LASTMINUTES: {
      key: "LASTMINUTES",
      category: DYNAMIC_MINUTE_INT_CATEGORY
    },
    NEXTMINUTES: {
      key: "NEXTMINUTES",
      category: DYNAMIC_MINUTE_INT_CATEGORY
    },
    LASTHOURS: {
      key: "LASTHOURS",
      category: DYNAMIC_HOUR_INT_CATEGORY
    },
    NEXTHOURS: {
      key: "NEXTHOURS",
      category: DYNAMIC_HOUR_INT_CATEGORY
    },
    YEARTODATE: {
      key: "YEARTODATE",
      category: FIXED_YEAR_CATEGORY
    },
    DATETOYEAR: {
      key: "DATETOYEAR",
      category: FIXED_YEAR_CATEGORY
    }
  };
  function _getDateRangeOperator() {
    return new Operator({
      name: "DATERANGE",
      filterOperator: ModelOperator.BT,
      alias: {
        Date: "DATERANGE",
        DateTime: "DATERANGE"
      },
      valueTypes: [{
        name: "sap.ui.model.odata.type.Date"
      }, {
        name: "sap.ui.model.odata.type.Date"
      }],
      // use date type to have no time part,
      getModelFilter: function (oCondition, sFieldPath, oType) {
        return SemanticDateOperators.getModelFilterForDateRange(oCondition, sFieldPath, oType, this);
      },
      validate: function (aValues, oType) {
        if (aValues.length < 2) {
          throw new ValidateException("Date Range must have two values");
        } else {
          const fromDate = new Date(aValues[0]);
          const toDate = new Date(aValues[1]);
          if (fromDate.getTime() > toDate.getTime()) {
            throw new ValidateException("From Date Should Be Less Than To Date");
          }
        }
        Operator.prototype.validate.apply(this, [aValues, oType]);
      }
    });
  }
  function _getDateOperator() {
    return new Operator({
      name: "DATE",
      alias: {
        Date: "DATE",
        DateTime: "DATE"
      },
      filterOperator: ModelOperator.EQ,
      valueTypes: [{
        name: "sap.ui.model.odata.type.Date"
      }],
      getModelFilter: function (oCondition, sFieldPath, oType) {
        return SemanticDateOperators.getModelFilterForDate(oCondition, sFieldPath, oType, this);
      }
    });
  }
  function _getFromOperator() {
    return new Operator({
      name: "FROM",
      alias: {
        Date: "FROM",
        DateTime: "FROM"
      },
      filterOperator: ModelOperator.GE,
      valueTypes: [{
        name: "sap.ui.model.odata.type.Date"
      }],
      getModelFilter: function (oCondition, sFieldPath, oType) {
        return SemanticDateOperators.getModelFilterForFrom(oCondition, sFieldPath, oType, this);
      }
    });
  }
  function _getToOperator() {
    return new Operator({
      name: "TO",
      alias: {
        Date: "TO",
        DateTime: "TO"
      },
      filterOperator: ModelOperator.LE,
      valueTypes: [{
        name: "sap.ui.model.odata.type.Date"
      }],
      getModelFilter: function (oCondition, sFieldPath, oType) {
        return SemanticDateOperators.getModelFilterForTo(oCondition, sFieldPath, oType, this);
      }
    });
  }
  function _filterOperation(oOperation, aOperatorConfiguration) {
    if (!aOperatorConfiguration) {
      return true;
    }
    aOperatorConfiguration = Array.isArray(aOperatorConfiguration) ? aOperatorConfiguration : [aOperatorConfiguration];
    let bResult;
    aOperatorConfiguration.some(function (oOperatorConfiguration) {
      let j;
      if (!oOperatorConfiguration.path) {
        return false;
      }
      const sValue = oOperation[oOperatorConfiguration.path];
      const bExclude = oOperatorConfiguration.exclude || false;
      let aOperatorValues;
      if (oOperatorConfiguration.contains && sValue) {
        aOperatorValues = oOperatorConfiguration.contains.split(",");
        bResult = bExclude;
        for (j = 0; j < aOperatorValues.length; j++) {
          if (bExclude && sValue.indexOf(aOperatorValues[j]) > -1) {
            bResult = false;
            return true;
          } else if (!bExclude && sValue.indexOf(aOperatorValues[j]) > -1) {
            bResult = true;
            return true;
          }
        }
      }
      if (oOperatorConfiguration.equals && sValue) {
        aOperatorValues = oOperatorConfiguration.equals.split(",");
        bResult = bExclude;
        for (j = 0; j < aOperatorValues.length; j++) {
          if (bExclude && sValue === aOperatorValues[j]) {
            bResult = false;
            return true;
          } else if (!bExclude && sValue === aOperatorValues[j]) {
            bResult = true;
            return true;
          }
        }
      }
      return false;
    });
    return bResult;
  }
  // Get the operators based on type
  function _getOperators(type) {
    return type === "Edm.DateTimeOffset" ? Object.assign({}, mSemanticDateOperations, basicDateTimeOps) : mSemanticDateOperations;
  }
  const SemanticDateOperators = {
    // Extending operators for Sematic Date Control
    addSemanticDateOperators: function () {
      FilterOperatorUtil.addOperator(_getDateRangeOperator());
      FilterOperatorUtil.addOperator(_getDateOperator());
      FilterOperatorUtil.addOperator(_getFromOperator());
      FilterOperatorUtil.addOperator(_getToOperator());
    },
    getSupportedOperations: function () {
      return aSupportedOperations;
    },
    getSemanticDateOperations: function (type) {
      const operators = _getOperators(type);
      return Object.keys(operators);
    },
    // TODO: Would need to check with MDC for removeOperator method
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    removeSemanticDateOperators: function () {},
    // To filter operators based on manifest aOperatorConfiguration settings
    getFilterOperations: function (aOperatorConfiguration, type) {
      const aOperations = [];
      const operators = _getOperators(type);
      for (const n in operators) {
        const oOperation = operators[n];
        if (_filterOperation(oOperation, aOperatorConfiguration)) {
          aOperations.push(oOperation);
        }
      }
      return aOperations.map(function (oOperation) {
        return oOperation.key;
      });
    },
    hasSemanticDateOperations: function (oConditions) {
      const aSemanticDateOps = this.getSemanticDateOperations();
      for (const n in oConditions) {
        const aFilterCondtion = oConditions[n];
        const oSemanticOperator = aFilterCondtion.find(function (oCondition) {
          return aSemanticDateOps.indexOf(oCondition.operator) > -1;
        });
        if (oSemanticOperator) {
          return false;
        }
      }
      return true;
    },
    getModelFilterForDate: function (oCondition, sFieldPath, oType, operator) {
      if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
        const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
        let sFrom = oCondition.values[0];
        const oOperatorModelFormat = oOperatorType.getModelFormat();
        const oDate = oOperatorModelFormat.parse(sFrom, false);
        sFrom = oType.getModelValue(oDate);
        oDate.setHours(23);
        oDate.setMinutes(59);
        oDate.setSeconds(59);
        oDate.setMilliseconds(999);
        const sTo = oType.getModelValue(oDate);
        return new Filter({
          path: sFieldPath,
          operator: ModelOperator.BT,
          value1: sFrom,
          value2: sTo
        });
      } else {
        return new Filter({
          path: sFieldPath,
          operator: operator.filterOperator,
          value1: oCondition.values[0]
        });
      }
    },
    getModelFilterForTo: function (oCondition, sFieldPath, oType, operator) {
      if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
        const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
        const value = oCondition.values[0];
        const oOperatorModelFormat = oOperatorType.getModelFormat();
        const oDate = oOperatorModelFormat.parse(value, false);
        oDate.setHours(23);
        oDate.setMinutes(59);
        oDate.setSeconds(59);
        oDate.setMilliseconds(999);
        const sTo = oType.getModelValue(oDate);
        return new Filter({
          path: sFieldPath,
          operator: ModelOperator.LE,
          value1: sTo
        });
      } else {
        return new Filter({
          path: sFieldPath,
          operator: operator.filterOperator,
          value1: oCondition.values[0]
        });
      }
    },
    getModelFilterForFrom: function (oCondition, sFieldPath, oType, operator) {
      if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
        const oOperatorType = operator._createLocalType(operator.valueTypes[0]);
        const value = oCondition.values[0];
        const oOperatorModelFormat = oOperatorType.getModelFormat();
        const oDate = oOperatorModelFormat.parse(value, false);
        oDate.setHours(0);
        oDate.setMinutes(0);
        oDate.setSeconds(0);
        oDate.setMilliseconds(0);
        const sFrom = oType.getModelValue(oDate);
        return new Filter({
          path: sFieldPath,
          operator: ModelOperator.GE,
          value1: sFrom
        });
      } else {
        return new Filter({
          path: sFieldPath,
          operator: operator.filterOperator,
          value1: oCondition.values[0]
        });
      }
    },
    getModelFilterForDateRange: function (oCondition, sFieldPath, oType, operator) {
      if (oType.isA("sap.ui.model.odata.type.DateTimeOffset")) {
        let oOperatorType = operator._createLocalType(operator.valueTypes[0]);
        let sFrom = oCondition.values[0];
        let oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
        let oDate = oOperatorModelFormat.parse(sFrom, false);
        sFrom = oType.getModelValue(oDate);
        oOperatorType = operator._createLocalType(operator.valueTypes[1]);
        oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
        let sTo = oCondition.values[1];
        oDate = oOperatorModelFormat.parse(sTo, false);
        oDate.setHours(23);
        oDate.setMinutes(59);
        oDate.setSeconds(59);
        oDate.setMilliseconds(999);
        sTo = oType.getModelValue(oDate);
        return new Filter({
          path: sFieldPath,
          operator: ModelOperator.BT,
          value1: sFrom,
          value2: sTo
        });
      } else {
        return new Filter({
          path: sFieldPath,
          operator: operator.filterOperator,
          value1: oCondition.values[0],
          value2: oCondition.values[1]
        });
      }
    }
  };
  return SemanticDateOperators;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhU3VwcG9ydGVkT3BlcmF0aW9ucyIsIkRZTkFNSUNfREFURV9DQVRFR09SWSIsIkZJWEVEX0RBVEVfQ0FURUdPUlkiLCJEWU5BTUlDX0RBVEVfSU5UX0NBVEVHT1JZIiwiRFlOQU1JQ19EQVRFUkFOR0VfQ0FURUdPUlkiLCJEWU5BTUlDX01PTlRIX0NBVEVHT1JZIiwiRklYRURfV0VFS19DQVRFR09SWSIsIkZJWEVEX01PTlRIX0NBVEVHT1JZIiwiRklYRURfUVVBUlRFUl9DQVRFR09SWSIsIkZJWEVEX1lFQVJfQ0FURUdPUlkiLCJEWU5BTUlDX1dFRUtfSU5UX0NBVEVHT1JZIiwiRFlOQU1JQ19NT05USF9JTlRfQ0FURUdPUlkiLCJEWU5BTUlDX1FVQVJURVJfSU5UX0NBVEVHT1JZIiwiRFlOQU1JQ19ZRUFSX0lOVF9DQVRFR09SWSIsIkRZTkFNSUNfTUlOVVRFX0lOVF9DQVRFR09SWSIsIkRZTkFNSUNfSE9VUl9JTlRfQ0FURUdPUlkiLCJiYXNpY0RhdGVUaW1lT3BzIiwiRVEiLCJrZXkiLCJjYXRlZ29yeSIsIkJUIiwibVNlbWFudGljRGF0ZU9wZXJhdGlvbnMiLCJEQVRFIiwiRlJPTSIsIlRPIiwiREFURVJBTkdFIiwiU1BFQ0lGSUNNT05USCIsIlRPREFZIiwiVE9EQVlGUk9NVE8iLCJZRVNURVJEQVkiLCJUT01PUlJPVyIsIkxBU1REQVlTIiwiTkVYVERBWVMiLCJUSElTV0VFSyIsIkxBU1RXRUVLIiwiTEFTVFdFRUtTIiwiTkVYVFdFRUsiLCJORVhUV0VFS1MiLCJUSElTTU9OVEgiLCJMQVNUTU9OVEgiLCJMQVNUTU9OVEhTIiwiTkVYVE1PTlRIIiwiTkVYVE1PTlRIUyIsIlRISVNRVUFSVEVSIiwiTEFTVFFVQVJURVIiLCJMQVNUUVVBUlRFUlMiLCJORVhUUVVBUlRFUiIsIk5FWFRRVUFSVEVSUyIsIlFVQVJURVIxIiwiUVVBUlRFUjIiLCJRVUFSVEVSMyIsIlFVQVJURVI0IiwiVEhJU1lFQVIiLCJMQVNUWUVBUiIsIkxBU1RZRUFSUyIsIk5FWFRZRUFSIiwiTkVYVFlFQVJTIiwiTEFTVE1JTlVURVMiLCJORVhUTUlOVVRFUyIsIkxBU1RIT1VSUyIsIk5FWFRIT1VSUyIsIllFQVJUT0RBVEUiLCJEQVRFVE9ZRUFSIiwiX2dldERhdGVSYW5nZU9wZXJhdG9yIiwiT3BlcmF0b3IiLCJuYW1lIiwiZmlsdGVyT3BlcmF0b3IiLCJNb2RlbE9wZXJhdG9yIiwiYWxpYXMiLCJEYXRlIiwiRGF0ZVRpbWUiLCJ2YWx1ZVR5cGVzIiwiZ2V0TW9kZWxGaWx0ZXIiLCJvQ29uZGl0aW9uIiwic0ZpZWxkUGF0aCIsIm9UeXBlIiwiU2VtYW50aWNEYXRlT3BlcmF0b3JzIiwiZ2V0TW9kZWxGaWx0ZXJGb3JEYXRlUmFuZ2UiLCJ2YWxpZGF0ZSIsImFWYWx1ZXMiLCJsZW5ndGgiLCJWYWxpZGF0ZUV4Y2VwdGlvbiIsImZyb21EYXRlIiwidG9EYXRlIiwiZ2V0VGltZSIsInByb3RvdHlwZSIsImFwcGx5IiwiX2dldERhdGVPcGVyYXRvciIsImdldE1vZGVsRmlsdGVyRm9yRGF0ZSIsIl9nZXRGcm9tT3BlcmF0b3IiLCJHRSIsImdldE1vZGVsRmlsdGVyRm9yRnJvbSIsIl9nZXRUb09wZXJhdG9yIiwiTEUiLCJnZXRNb2RlbEZpbHRlckZvclRvIiwiX2ZpbHRlck9wZXJhdGlvbiIsIm9PcGVyYXRpb24iLCJhT3BlcmF0b3JDb25maWd1cmF0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwiYlJlc3VsdCIsInNvbWUiLCJvT3BlcmF0b3JDb25maWd1cmF0aW9uIiwiaiIsInBhdGgiLCJzVmFsdWUiLCJiRXhjbHVkZSIsImV4Y2x1ZGUiLCJhT3BlcmF0b3JWYWx1ZXMiLCJjb250YWlucyIsInNwbGl0IiwiaW5kZXhPZiIsImVxdWFscyIsIl9nZXRPcGVyYXRvcnMiLCJ0eXBlIiwiT2JqZWN0IiwiYXNzaWduIiwiYWRkU2VtYW50aWNEYXRlT3BlcmF0b3JzIiwiRmlsdGVyT3BlcmF0b3JVdGlsIiwiYWRkT3BlcmF0b3IiLCJnZXRTdXBwb3J0ZWRPcGVyYXRpb25zIiwiZ2V0U2VtYW50aWNEYXRlT3BlcmF0aW9ucyIsIm9wZXJhdG9ycyIsImtleXMiLCJyZW1vdmVTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRGaWx0ZXJPcGVyYXRpb25zIiwiYU9wZXJhdGlvbnMiLCJuIiwicHVzaCIsIm1hcCIsImhhc1NlbWFudGljRGF0ZU9wZXJhdGlvbnMiLCJvQ29uZGl0aW9ucyIsImFTZW1hbnRpY0RhdGVPcHMiLCJhRmlsdGVyQ29uZHRpb24iLCJvU2VtYW50aWNPcGVyYXRvciIsImZpbmQiLCJvcGVyYXRvciIsImlzQSIsIm9PcGVyYXRvclR5cGUiLCJfY3JlYXRlTG9jYWxUeXBlIiwic0Zyb20iLCJ2YWx1ZXMiLCJvT3BlcmF0b3JNb2RlbEZvcm1hdCIsImdldE1vZGVsRm9ybWF0Iiwib0RhdGUiLCJwYXJzZSIsImdldE1vZGVsVmFsdWUiLCJzZXRIb3VycyIsInNldE1pbnV0ZXMiLCJzZXRTZWNvbmRzIiwic2V0TWlsbGlzZWNvbmRzIiwic1RvIiwiRmlsdGVyIiwidmFsdWUxIiwidmFsdWUyIiwidmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNlbWFudGljRGF0ZU9wZXJhdG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRmlsdGVyT3BlcmF0b3JVdGlsIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9GaWx0ZXJPcGVyYXRvclV0aWxcIjtcbmltcG9ydCBPcGVyYXRvciBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vT3BlcmF0b3JcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBNb2RlbE9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBWYWxpZGF0ZUV4Y2VwdGlvbiBmcm9tIFwic2FwL3VpL21vZGVsL1ZhbGlkYXRlRXhjZXB0aW9uXCI7XG5cbmNvbnN0IGFTdXBwb3J0ZWRPcGVyYXRpb25zID0gW1wiREFURVwiLCBcIkZST01cIiwgXCJUT1wiLCBcIkRBVEVSQU5HRVwiXTtcbmNvbnN0IERZTkFNSUNfREFURV9DQVRFR09SWSA9IFwiRFlOQU1JQy5EQVRFXCI7XG5jb25zdCBGSVhFRF9EQVRFX0NBVEVHT1JZID0gXCJGSVhFRC5EQVRFXCI7XG5jb25zdCBEWU5BTUlDX0RBVEVfSU5UX0NBVEVHT1JZID0gXCJEWU5BTUlDLkRBVEUuSU5UXCI7XG5jb25zdCBEWU5BTUlDX0RBVEVSQU5HRV9DQVRFR09SWSA9IFwiRFlOQU1JQy5EQVRFUkFOR0VcIjtcbmNvbnN0IERZTkFNSUNfTU9OVEhfQ0FURUdPUlkgPSBcIkRZTkFNSUMuTU9OVEhcIjtcbmNvbnN0IEZJWEVEX1dFRUtfQ0FURUdPUlkgPSBcIkZJWEVELldFRUtcIjtcbmNvbnN0IEZJWEVEX01PTlRIX0NBVEVHT1JZID0gXCJGSVhFRC5NT05USFwiO1xuY29uc3QgRklYRURfUVVBUlRFUl9DQVRFR09SWSA9IFwiRklYRUQuUVVBUlRFUlwiO1xuY29uc3QgRklYRURfWUVBUl9DQVRFR09SWSA9IFwiRklYRUQuWUVBUlwiO1xuY29uc3QgRFlOQU1JQ19XRUVLX0lOVF9DQVRFR09SWSA9IFwiRFlOQU1JQy5XRUVLLklOVFwiO1xuY29uc3QgRFlOQU1JQ19NT05USF9JTlRfQ0FURUdPUlkgPSBcIkRZTkFNSUMuTU9OVEguSU5UXCI7XG5jb25zdCBEWU5BTUlDX1FVQVJURVJfSU5UX0NBVEVHT1JZID0gXCJEWU5BTUlDLlFVQVJURVIuSU5UXCI7XG5jb25zdCBEWU5BTUlDX1lFQVJfSU5UX0NBVEVHT1JZID0gXCJEWU5BTUlDLllFQVIuSU5UXCI7XG5jb25zdCBEWU5BTUlDX01JTlVURV9JTlRfQ0FURUdPUlkgPSBcIkRZTkFNSUMuTUlOVVRFLklOVFwiO1xuY29uc3QgRFlOQU1JQ19IT1VSX0lOVF9DQVRFR09SWSA9IFwiRFlOQU1JQy5IT1VSLklOVFwiO1xuY29uc3QgYmFzaWNEYXRlVGltZU9wcyA9IHtcblx0RVE6IHtcblx0XHRrZXk6IFwiRVFcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19EQVRFX0NBVEVHT1JZXG5cdH0sXG5cdEJUOiB7XG5cdFx0a2V5OiBcIkJUXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfREFURVJBTkdFX0NBVEVHT1JZXG5cdH1cbn07XG5jb25zdCBtU2VtYW50aWNEYXRlT3BlcmF0aW9uczogYW55ID0ge1xuXHREQVRFOiB7XG5cdFx0a2V5OiBcIkRBVEVcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19EQVRFX0NBVEVHT1JZXG5cdH0sXG5cdEZST006IHtcblx0XHRrZXk6IFwiRlJPTVwiLFxuXHRcdGNhdGVnb3J5OiBEWU5BTUlDX0RBVEVfQ0FURUdPUllcblx0fSxcblx0VE86IHtcblx0XHRrZXk6IFwiVE9cIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19EQVRFX0NBVEVHT1JZXG5cdH0sXG5cdERBVEVSQU5HRToge1xuXHRcdGtleTogXCJEQVRFUkFOR0VcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19EQVRFUkFOR0VfQ0FURUdPUllcblx0fSxcblx0U1BFQ0lGSUNNT05USDoge1xuXHRcdGtleTogXCJTUEVDSUZJQ01PTlRIXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfTU9OVEhfQ0FURUdPUllcblx0fSxcblx0VE9EQVk6IHtcblx0XHRrZXk6IFwiVE9EQVlcIixcblx0XHRjYXRlZ29yeTogRklYRURfREFURV9DQVRFR09SWVxuXHR9LFxuXHRUT0RBWUZST01UTzoge1xuXHRcdGtleTogXCJUT0RBWUZST01UT1wiLFxuXHRcdGNhdGVnb3J5OiBEWU5BTUlDX0RBVEVfSU5UX0NBVEVHT1JZXG5cdH0sXG5cdFlFU1RFUkRBWToge1xuXHRcdGtleTogXCJZRVNURVJEQVlcIixcblx0XHRjYXRlZ29yeTogRklYRURfREFURV9DQVRFR09SWVxuXHR9LFxuXHRUT01PUlJPVzoge1xuXHRcdGtleTogXCJUT01PUlJPV1wiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9EQVRFX0NBVEVHT1JZXG5cdH0sXG5cdExBU1REQVlTOiB7XG5cdFx0a2V5OiBcIkxBU1REQVlTXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfREFURV9JTlRfQ0FURUdPUllcblx0fSxcblx0TkVYVERBWVM6IHtcblx0XHRrZXk6IFwiTkVYVERBWVNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19EQVRFX0lOVF9DQVRFR09SWVxuXHR9LFxuXHRUSElTV0VFSzoge1xuXHRcdGtleTogXCJUSElTV0VFS1wiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9XRUVLX0NBVEVHT1JZXG5cdH0sXG5cdExBU1RXRUVLOiB7XG5cdFx0a2V5OiBcIkxBU1RXRUVLXCIsXG5cdFx0Y2F0ZWdvcnk6IEZJWEVEX1dFRUtfQ0FURUdPUllcblx0fSxcblx0TEFTVFdFRUtTOiB7XG5cdFx0a2V5OiBcIkxBU1RXRUVLU1wiLFxuXHRcdGNhdGVnb3J5OiBEWU5BTUlDX1dFRUtfSU5UX0NBVEVHT1JZXG5cdH0sXG5cdE5FWFRXRUVLOiB7XG5cdFx0a2V5OiBcIk5FWFRXRUVLXCIsXG5cdFx0Y2F0ZWdvcnk6IEZJWEVEX1dFRUtfQ0FURUdPUllcblx0fSxcblx0TkVYVFdFRUtTOiB7XG5cdFx0a2V5OiBcIk5FWFRXRUVLU1wiLFxuXHRcdGNhdGVnb3J5OiBEWU5BTUlDX1dFRUtfSU5UX0NBVEVHT1JZXG5cdH0sXG5cdFRISVNNT05USDoge1xuXHRcdGtleTogXCJUSElTTU9OVEhcIixcblx0XHRjYXRlZ29yeTogRklYRURfTU9OVEhfQ0FURUdPUllcblx0fSxcblx0TEFTVE1PTlRIOiB7XG5cdFx0a2V5OiBcIkxBU1RNT05USFwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9NT05USF9DQVRFR09SWVxuXHR9LFxuXHRMQVNUTU9OVEhTOiB7XG5cdFx0a2V5OiBcIkxBU1RNT05USFNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19NT05USF9JTlRfQ0FURUdPUllcblx0fSxcblx0TkVYVE1PTlRIOiB7XG5cdFx0a2V5OiBcIk5FWFRNT05USFwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9NT05USF9DQVRFR09SWVxuXHR9LFxuXHRORVhUTU9OVEhTOiB7XG5cdFx0a2V5OiBcIk5FWFRNT05USFNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19NT05USF9JTlRfQ0FURUdPUllcblx0fSxcblx0VEhJU1FVQVJURVI6IHtcblx0XHRrZXk6IFwiVEhJU1FVQVJURVJcIixcblx0XHRjYXRlZ29yeTogRklYRURfUVVBUlRFUl9DQVRFR09SWVxuXHR9LFxuXHRMQVNUUVVBUlRFUjoge1xuXHRcdGtleTogXCJMQVNUUVVBUlRFUlwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9RVUFSVEVSX0NBVEVHT1JZXG5cdH0sXG5cdExBU1RRVUFSVEVSUzoge1xuXHRcdGtleTogXCJMQVNUUVVBUlRFUlNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19RVUFSVEVSX0lOVF9DQVRFR09SWVxuXHR9LFxuXHRORVhUUVVBUlRFUjoge1xuXHRcdGtleTogXCJORVhUUVVBUlRFUlwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9RVUFSVEVSX0NBVEVHT1JZXG5cdH0sXG5cdE5FWFRRVUFSVEVSUzoge1xuXHRcdGtleTogXCJORVhUUVVBUlRFUlNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19RVUFSVEVSX0lOVF9DQVRFR09SWVxuXHR9LFxuXHRRVUFSVEVSMToge1xuXHRcdGtleTogXCJRVUFSVEVSMVwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9RVUFSVEVSX0NBVEVHT1JZXG5cdH0sXG5cdFFVQVJURVIyOiB7XG5cdFx0a2V5OiBcIlFVQVJURVIyXCIsXG5cdFx0Y2F0ZWdvcnk6IEZJWEVEX1FVQVJURVJfQ0FURUdPUllcblx0fSxcblx0UVVBUlRFUjM6IHtcblx0XHRrZXk6IFwiUVVBUlRFUjNcIixcblx0XHRjYXRlZ29yeTogRklYRURfUVVBUlRFUl9DQVRFR09SWVxuXHR9LFxuXHRRVUFSVEVSNDoge1xuXHRcdGtleTogXCJRVUFSVEVSNFwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9RVUFSVEVSX0NBVEVHT1JZXG5cdH0sXG5cdFRISVNZRUFSOiB7XG5cdFx0a2V5OiBcIlRISVNZRUFSXCIsXG5cdFx0Y2F0ZWdvcnk6IEZJWEVEX1lFQVJfQ0FURUdPUllcblx0fSxcblx0TEFTVFlFQVI6IHtcblx0XHRrZXk6IFwiTEFTVFlFQVJcIixcblx0XHRjYXRlZ29yeTogRklYRURfWUVBUl9DQVRFR09SWVxuXHR9LFxuXHRMQVNUWUVBUlM6IHtcblx0XHRrZXk6IFwiTEFTVFlFQVJTXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfWUVBUl9JTlRfQ0FURUdPUllcblx0fSxcblx0TkVYVFlFQVI6IHtcblx0XHRrZXk6IFwiTkVYVFlFQVJcIixcblx0XHRjYXRlZ29yeTogRklYRURfWUVBUl9DQVRFR09SWVxuXHR9LFxuXHRORVhUWUVBUlM6IHtcblx0XHRrZXk6IFwiTkVYVFlFQVJTXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfWUVBUl9JTlRfQ0FURUdPUllcblx0fSxcblx0TEFTVE1JTlVURVM6IHtcblx0XHRrZXk6IFwiTEFTVE1JTlVURVNcIixcblx0XHRjYXRlZ29yeTogRFlOQU1JQ19NSU5VVEVfSU5UX0NBVEVHT1JZXG5cdH0sXG5cdE5FWFRNSU5VVEVTOiB7XG5cdFx0a2V5OiBcIk5FWFRNSU5VVEVTXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfTUlOVVRFX0lOVF9DQVRFR09SWVxuXHR9LFxuXHRMQVNUSE9VUlM6IHtcblx0XHRrZXk6IFwiTEFTVEhPVVJTXCIsXG5cdFx0Y2F0ZWdvcnk6IERZTkFNSUNfSE9VUl9JTlRfQ0FURUdPUllcblx0fSxcblx0TkVYVEhPVVJTOiB7XG5cdFx0a2V5OiBcIk5FWFRIT1VSU1wiLFxuXHRcdGNhdGVnb3J5OiBEWU5BTUlDX0hPVVJfSU5UX0NBVEVHT1JZXG5cdH0sXG5cdFlFQVJUT0RBVEU6IHtcblx0XHRrZXk6IFwiWUVBUlRPREFURVwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9ZRUFSX0NBVEVHT1JZXG5cdH0sXG5cdERBVEVUT1lFQVI6IHtcblx0XHRrZXk6IFwiREFURVRPWUVBUlwiLFxuXHRcdGNhdGVnb3J5OiBGSVhFRF9ZRUFSX0NBVEVHT1JZXG5cdH1cbn07XG5cbmZ1bmN0aW9uIF9nZXREYXRlUmFuZ2VPcGVyYXRvcigpIHtcblx0cmV0dXJuIG5ldyBPcGVyYXRvcih7XG5cdFx0bmFtZTogXCJEQVRFUkFOR0VcIixcblx0XHRmaWx0ZXJPcGVyYXRvcjogTW9kZWxPcGVyYXRvci5CVCxcblx0XHRhbGlhczogeyBEYXRlOiBcIkRBVEVSQU5HRVwiLCBEYXRlVGltZTogXCJEQVRFUkFOR0VcIiB9LFxuXHRcdHZhbHVlVHlwZXM6IFt7IG5hbWU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGF0ZVwiIH0sIHsgbmFtZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlXCIgfV0sIC8vIHVzZSBkYXRlIHR5cGUgdG8gaGF2ZSBubyB0aW1lIHBhcnQsXG5cdFx0Z2V0TW9kZWxGaWx0ZXI6IGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnksIHNGaWVsZFBhdGg6IGFueSwgb1R5cGU6IGFueSkge1xuXHRcdFx0cmV0dXJuIFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRNb2RlbEZpbHRlckZvckRhdGVSYW5nZShvQ29uZGl0aW9uLCBzRmllbGRQYXRoLCBvVHlwZSwgdGhpcyk7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGFWYWx1ZXM6IGFueSwgb1R5cGU6IGFueSkge1xuXHRcdFx0aWYgKGFWYWx1ZXMubGVuZ3RoIDwgMikge1xuXHRcdFx0XHR0aHJvdyBuZXcgVmFsaWRhdGVFeGNlcHRpb24oXCJEYXRlIFJhbmdlIG11c3QgaGF2ZSB0d28gdmFsdWVzXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZnJvbURhdGUgPSBuZXcgRGF0ZShhVmFsdWVzWzBdKTtcblx0XHRcdFx0Y29uc3QgdG9EYXRlID0gbmV3IERhdGUoYVZhbHVlc1sxXSk7XG5cdFx0XHRcdGlmIChmcm9tRGF0ZS5nZXRUaW1lKCkgPiB0b0RhdGUuZ2V0VGltZSgpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IFZhbGlkYXRlRXhjZXB0aW9uKFwiRnJvbSBEYXRlIFNob3VsZCBCZSBMZXNzIFRoYW4gVG8gRGF0ZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0T3BlcmF0b3IucHJvdG90eXBlLnZhbGlkYXRlLmFwcGx5KHRoaXMsIFthVmFsdWVzLCBvVHlwZV0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIF9nZXREYXRlT3BlcmF0b3IoKSB7XG5cdHJldHVybiBuZXcgT3BlcmF0b3Ioe1xuXHRcdG5hbWU6IFwiREFURVwiLFxuXHRcdGFsaWFzOiB7IERhdGU6IFwiREFURVwiLCBEYXRlVGltZTogXCJEQVRFXCIgfSxcblx0XHRmaWx0ZXJPcGVyYXRvcjogTW9kZWxPcGVyYXRvci5FUSxcblx0XHR2YWx1ZVR5cGVzOiBbeyBuYW1lOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRhdGVcIiB9XSxcblx0XHRnZXRNb2RlbEZpbHRlcjogZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSwgc0ZpZWxkUGF0aDogYW55LCBvVHlwZTogYW55KSB7XG5cdFx0XHRyZXR1cm4gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldE1vZGVsRmlsdGVyRm9yRGF0ZShvQ29uZGl0aW9uLCBzRmllbGRQYXRoLCBvVHlwZSwgdGhpcyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gX2dldEZyb21PcGVyYXRvcigpIHtcblx0cmV0dXJuIG5ldyBPcGVyYXRvcih7XG5cdFx0bmFtZTogXCJGUk9NXCIsXG5cdFx0YWxpYXM6IHsgRGF0ZTogXCJGUk9NXCIsIERhdGVUaW1lOiBcIkZST01cIiB9LFxuXHRcdGZpbHRlck9wZXJhdG9yOiBNb2RlbE9wZXJhdG9yLkdFLFxuXHRcdHZhbHVlVHlwZXM6IFt7IG5hbWU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGF0ZVwiIH1dLFxuXHRcdGdldE1vZGVsRmlsdGVyOiBmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55LCBzRmllbGRQYXRoOiBhbnksIG9UeXBlOiBhbnkpIHtcblx0XHRcdHJldHVybiBTZW1hbnRpY0RhdGVPcGVyYXRvcnMuZ2V0TW9kZWxGaWx0ZXJGb3JGcm9tKG9Db25kaXRpb24sIHNGaWVsZFBhdGgsIG9UeXBlLCB0aGlzKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBfZ2V0VG9PcGVyYXRvcigpIHtcblx0cmV0dXJuIG5ldyBPcGVyYXRvcih7XG5cdFx0bmFtZTogXCJUT1wiLFxuXHRcdGFsaWFzOiB7IERhdGU6IFwiVE9cIiwgRGF0ZVRpbWU6IFwiVE9cIiB9LFxuXHRcdGZpbHRlck9wZXJhdG9yOiBNb2RlbE9wZXJhdG9yLkxFLFxuXHRcdHZhbHVlVHlwZXM6IFt7IG5hbWU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGF0ZVwiIH1dLFxuXHRcdGdldE1vZGVsRmlsdGVyOiBmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55LCBzRmllbGRQYXRoOiBhbnksIG9UeXBlOiBhbnkpIHtcblx0XHRcdHJldHVybiBTZW1hbnRpY0RhdGVPcGVyYXRvcnMuZ2V0TW9kZWxGaWx0ZXJGb3JUbyhvQ29uZGl0aW9uLCBzRmllbGRQYXRoLCBvVHlwZSwgdGhpcyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gX2ZpbHRlck9wZXJhdGlvbihvT3BlcmF0aW9uOiBhbnksIGFPcGVyYXRvckNvbmZpZ3VyYXRpb246IGFueSkge1xuXHRpZiAoIWFPcGVyYXRvckNvbmZpZ3VyYXRpb24pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRhT3BlcmF0b3JDb25maWd1cmF0aW9uID0gQXJyYXkuaXNBcnJheShhT3BlcmF0b3JDb25maWd1cmF0aW9uKSA/IGFPcGVyYXRvckNvbmZpZ3VyYXRpb24gOiBbYU9wZXJhdG9yQ29uZmlndXJhdGlvbl07XG5cdGxldCBiUmVzdWx0O1xuXG5cdGFPcGVyYXRvckNvbmZpZ3VyYXRpb24uc29tZShmdW5jdGlvbiAob09wZXJhdG9yQ29uZmlndXJhdGlvbjogYW55KSB7XG5cdFx0bGV0IGo7XG5cdFx0aWYgKCFvT3BlcmF0b3JDb25maWd1cmF0aW9uLnBhdGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBzVmFsdWUgPSBvT3BlcmF0aW9uW29PcGVyYXRvckNvbmZpZ3VyYXRpb24ucGF0aF07XG5cdFx0Y29uc3QgYkV4Y2x1ZGUgPSBvT3BlcmF0b3JDb25maWd1cmF0aW9uLmV4Y2x1ZGUgfHwgZmFsc2U7XG5cdFx0bGV0IGFPcGVyYXRvclZhbHVlcztcblxuXHRcdGlmIChvT3BlcmF0b3JDb25maWd1cmF0aW9uLmNvbnRhaW5zICYmIHNWYWx1ZSkge1xuXHRcdFx0YU9wZXJhdG9yVmFsdWVzID0gb09wZXJhdG9yQ29uZmlndXJhdGlvbi5jb250YWlucy5zcGxpdChcIixcIik7XG5cdFx0XHRiUmVzdWx0ID0gYkV4Y2x1ZGU7XG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgYU9wZXJhdG9yVmFsdWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmIChiRXhjbHVkZSAmJiBzVmFsdWUuaW5kZXhPZihhT3BlcmF0b3JWYWx1ZXNbal0pID4gLTEpIHtcblx0XHRcdFx0XHRiUmVzdWx0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIWJFeGNsdWRlICYmIHNWYWx1ZS5pbmRleE9mKGFPcGVyYXRvclZhbHVlc1tqXSkgPiAtMSkge1xuXHRcdFx0XHRcdGJSZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9PcGVyYXRvckNvbmZpZ3VyYXRpb24uZXF1YWxzICYmIHNWYWx1ZSkge1xuXHRcdFx0YU9wZXJhdG9yVmFsdWVzID0gb09wZXJhdG9yQ29uZmlndXJhdGlvbi5lcXVhbHMuc3BsaXQoXCIsXCIpO1xuXHRcdFx0YlJlc3VsdCA9IGJFeGNsdWRlO1xuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGFPcGVyYXRvclZhbHVlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoYkV4Y2x1ZGUgJiYgc1ZhbHVlID09PSBhT3BlcmF0b3JWYWx1ZXNbal0pIHtcblx0XHRcdFx0XHRiUmVzdWx0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIWJFeGNsdWRlICYmIHNWYWx1ZSA9PT0gYU9wZXJhdG9yVmFsdWVzW2pdKSB7XG5cdFx0XHRcdFx0YlJlc3VsdCA9IHRydWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXHRyZXR1cm4gYlJlc3VsdDtcbn1cbi8vIEdldCB0aGUgb3BlcmF0b3JzIGJhc2VkIG9uIHR5cGVcbmZ1bmN0aW9uIF9nZXRPcGVyYXRvcnModHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdHJldHVybiB0eXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiID8gT2JqZWN0LmFzc2lnbih7fSwgbVNlbWFudGljRGF0ZU9wZXJhdGlvbnMsIGJhc2ljRGF0ZVRpbWVPcHMpIDogbVNlbWFudGljRGF0ZU9wZXJhdGlvbnM7XG59XG5jb25zdCBTZW1hbnRpY0RhdGVPcGVyYXRvcnMgPSB7XG5cdC8vIEV4dGVuZGluZyBvcGVyYXRvcnMgZm9yIFNlbWF0aWMgRGF0ZSBDb250cm9sXG5cdGFkZFNlbWFudGljRGF0ZU9wZXJhdG9yczogZnVuY3Rpb24gKCkge1xuXHRcdEZpbHRlck9wZXJhdG9yVXRpbC5hZGRPcGVyYXRvcihfZ2V0RGF0ZVJhbmdlT3BlcmF0b3IoKSk7XG5cdFx0RmlsdGVyT3BlcmF0b3JVdGlsLmFkZE9wZXJhdG9yKF9nZXREYXRlT3BlcmF0b3IoKSk7XG5cdFx0RmlsdGVyT3BlcmF0b3JVdGlsLmFkZE9wZXJhdG9yKF9nZXRGcm9tT3BlcmF0b3IoKSk7XG5cdFx0RmlsdGVyT3BlcmF0b3JVdGlsLmFkZE9wZXJhdG9yKF9nZXRUb09wZXJhdG9yKCkpO1xuXHR9LFxuXHRnZXRTdXBwb3J0ZWRPcGVyYXRpb25zOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGFTdXBwb3J0ZWRPcGVyYXRpb25zO1xuXHR9LFxuXHRnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zOiBmdW5jdGlvbiAodHlwZT86IHN0cmluZykge1xuXHRcdGNvbnN0IG9wZXJhdG9ycyA9IF9nZXRPcGVyYXRvcnModHlwZSk7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9wZXJhdG9ycyk7XG5cdH0sXG5cdC8vIFRPRE86IFdvdWxkIG5lZWQgdG8gY2hlY2sgd2l0aCBNREMgZm9yIHJlbW92ZU9wZXJhdG9yIG1ldGhvZFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG5cdHJlbW92ZVNlbWFudGljRGF0ZU9wZXJhdG9yczogZnVuY3Rpb24gKCkge30sXG5cdC8vIFRvIGZpbHRlciBvcGVyYXRvcnMgYmFzZWQgb24gbWFuaWZlc3QgYU9wZXJhdG9yQ29uZmlndXJhdGlvbiBzZXR0aW5nc1xuXHRnZXRGaWx0ZXJPcGVyYXRpb25zOiBmdW5jdGlvbiAoYU9wZXJhdG9yQ29uZmlndXJhdGlvbjogYW55LCB0eXBlPzogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYU9wZXJhdGlvbnMgPSBbXTtcblx0XHRjb25zdCBvcGVyYXRvcnMgPSBfZ2V0T3BlcmF0b3JzKHR5cGUpO1xuXHRcdGZvciAoY29uc3QgbiBpbiBvcGVyYXRvcnMpIHtcblx0XHRcdGNvbnN0IG9PcGVyYXRpb24gPSBvcGVyYXRvcnNbbl07XG5cdFx0XHRpZiAoX2ZpbHRlck9wZXJhdGlvbihvT3BlcmF0aW9uLCBhT3BlcmF0b3JDb25maWd1cmF0aW9uKSkge1xuXHRcdFx0XHRhT3BlcmF0aW9ucy5wdXNoKG9PcGVyYXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYU9wZXJhdGlvbnMubWFwKGZ1bmN0aW9uIChvT3BlcmF0aW9uOiBhbnkpIHtcblx0XHRcdHJldHVybiBvT3BlcmF0aW9uLmtleTtcblx0XHR9KTtcblx0fSxcblx0aGFzU2VtYW50aWNEYXRlT3BlcmF0aW9uczogZnVuY3Rpb24gKG9Db25kaXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBhU2VtYW50aWNEYXRlT3BzID0gdGhpcy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCk7XG5cdFx0Zm9yIChjb25zdCBuIGluIG9Db25kaXRpb25zKSB7XG5cdFx0XHRjb25zdCBhRmlsdGVyQ29uZHRpb24gPSBvQ29uZGl0aW9uc1tuXTtcblx0XHRcdGNvbnN0IG9TZW1hbnRpY09wZXJhdG9yID0gYUZpbHRlckNvbmR0aW9uLmZpbmQoZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gYVNlbWFudGljRGF0ZU9wcy5pbmRleE9mKG9Db25kaXRpb24ub3BlcmF0b3IpID4gLTE7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChvU2VtYW50aWNPcGVyYXRvcikge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldE1vZGVsRmlsdGVyRm9yRGF0ZTogZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSwgc0ZpZWxkUGF0aDogYW55LCBvVHlwZTogYW55LCBvcGVyYXRvcjogYW55KSB7XG5cdFx0aWYgKG9UeXBlLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRhdGVUaW1lT2Zmc2V0XCIpKSB7XG5cdFx0XHRjb25zdCBvT3BlcmF0b3JUeXBlID0gb3BlcmF0b3IuX2NyZWF0ZUxvY2FsVHlwZShvcGVyYXRvci52YWx1ZVR5cGVzWzBdKTtcblx0XHRcdGxldCBzRnJvbSA9IG9Db25kaXRpb24udmFsdWVzWzBdO1xuXHRcdFx0Y29uc3Qgb09wZXJhdG9yTW9kZWxGb3JtYXQgPSBvT3BlcmF0b3JUeXBlLmdldE1vZGVsRm9ybWF0KCk7XG5cdFx0XHRjb25zdCBvRGF0ZSA9IG9PcGVyYXRvck1vZGVsRm9ybWF0LnBhcnNlKHNGcm9tLCBmYWxzZSk7XG5cdFx0XHRzRnJvbSA9IG9UeXBlLmdldE1vZGVsVmFsdWUob0RhdGUpO1xuXHRcdFx0b0RhdGUuc2V0SG91cnMoMjMpO1xuXHRcdFx0b0RhdGUuc2V0TWludXRlcyg1OSk7XG5cdFx0XHRvRGF0ZS5zZXRTZWNvbmRzKDU5KTtcblx0XHRcdG9EYXRlLnNldE1pbGxpc2Vjb25kcyg5OTkpO1xuXHRcdFx0Y29uc3Qgc1RvID0gb1R5cGUuZ2V0TW9kZWxWYWx1ZShvRGF0ZSk7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7IHBhdGg6IHNGaWVsZFBhdGgsIG9wZXJhdG9yOiBNb2RlbE9wZXJhdG9yLkJULCB2YWx1ZTE6IHNGcm9tLCB2YWx1ZTI6IHNUbyB9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWx0ZXIoeyBwYXRoOiBzRmllbGRQYXRoLCBvcGVyYXRvcjogb3BlcmF0b3IuZmlsdGVyT3BlcmF0b3IsIHZhbHVlMTogb0NvbmRpdGlvbi52YWx1ZXNbMF0gfSk7XG5cdFx0fVxuXHR9LFxuXG5cdGdldE1vZGVsRmlsdGVyRm9yVG86IGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnksIHNGaWVsZFBhdGg6IGFueSwgb1R5cGU6IGFueSwgb3BlcmF0b3I6IGFueSkge1xuXHRcdGlmIChvVHlwZS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiKSkge1xuXHRcdFx0Y29uc3Qgb09wZXJhdG9yVHlwZSA9IG9wZXJhdG9yLl9jcmVhdGVMb2NhbFR5cGUob3BlcmF0b3IudmFsdWVUeXBlc1swXSk7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IG9Db25kaXRpb24udmFsdWVzWzBdO1xuXHRcdFx0Y29uc3Qgb09wZXJhdG9yTW9kZWxGb3JtYXQgPSBvT3BlcmF0b3JUeXBlLmdldE1vZGVsRm9ybWF0KCk7XG5cdFx0XHRjb25zdCBvRGF0ZSA9IG9PcGVyYXRvck1vZGVsRm9ybWF0LnBhcnNlKHZhbHVlLCBmYWxzZSk7XG5cdFx0XHRvRGF0ZS5zZXRIb3VycygyMyk7XG5cdFx0XHRvRGF0ZS5zZXRNaW51dGVzKDU5KTtcblx0XHRcdG9EYXRlLnNldFNlY29uZHMoNTkpO1xuXHRcdFx0b0RhdGUuc2V0TWlsbGlzZWNvbmRzKDk5OSk7XG5cdFx0XHRjb25zdCBzVG8gPSBvVHlwZS5nZXRNb2RlbFZhbHVlKG9EYXRlKTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHsgcGF0aDogc0ZpZWxkUGF0aCwgb3BlcmF0b3I6IE1vZGVsT3BlcmF0b3IuTEUsIHZhbHVlMTogc1RvIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7IHBhdGg6IHNGaWVsZFBhdGgsIG9wZXJhdG9yOiBvcGVyYXRvci5maWx0ZXJPcGVyYXRvciwgdmFsdWUxOiBvQ29uZGl0aW9uLnZhbHVlc1swXSB9KTtcblx0XHR9XG5cdH0sXG5cblx0Z2V0TW9kZWxGaWx0ZXJGb3JGcm9tOiBmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55LCBzRmllbGRQYXRoOiBhbnksIG9UeXBlOiBhbnksIG9wZXJhdG9yOiBhbnkpIHtcblx0XHRpZiAob1R5cGUuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGF0ZVRpbWVPZmZzZXRcIikpIHtcblx0XHRcdGNvbnN0IG9PcGVyYXRvclR5cGUgPSBvcGVyYXRvci5fY3JlYXRlTG9jYWxUeXBlKG9wZXJhdG9yLnZhbHVlVHlwZXNbMF0pO1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBvQ29uZGl0aW9uLnZhbHVlc1swXTtcblx0XHRcdGNvbnN0IG9PcGVyYXRvck1vZGVsRm9ybWF0ID0gb09wZXJhdG9yVHlwZS5nZXRNb2RlbEZvcm1hdCgpO1xuXHRcdFx0Y29uc3Qgb0RhdGUgPSBvT3BlcmF0b3JNb2RlbEZvcm1hdC5wYXJzZSh2YWx1ZSwgZmFsc2UpO1xuXHRcdFx0b0RhdGUuc2V0SG91cnMoMCk7XG5cdFx0XHRvRGF0ZS5zZXRNaW51dGVzKDApO1xuXHRcdFx0b0RhdGUuc2V0U2Vjb25kcygwKTtcblx0XHRcdG9EYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcblx0XHRcdGNvbnN0IHNGcm9tID0gb1R5cGUuZ2V0TW9kZWxWYWx1ZShvRGF0ZSk7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7IHBhdGg6IHNGaWVsZFBhdGgsIG9wZXJhdG9yOiBNb2RlbE9wZXJhdG9yLkdFLCB2YWx1ZTE6IHNGcm9tIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7IHBhdGg6IHNGaWVsZFBhdGgsIG9wZXJhdG9yOiBvcGVyYXRvci5maWx0ZXJPcGVyYXRvciwgdmFsdWUxOiBvQ29uZGl0aW9uLnZhbHVlc1swXSB9KTtcblx0XHR9XG5cdH0sXG5cblx0Z2V0TW9kZWxGaWx0ZXJGb3JEYXRlUmFuZ2U6IGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnksIHNGaWVsZFBhdGg6IGFueSwgb1R5cGU6IGFueSwgb3BlcmF0b3I6IGFueSkge1xuXHRcdGlmIChvVHlwZS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiKSkge1xuXHRcdFx0bGV0IG9PcGVyYXRvclR5cGUgPSBvcGVyYXRvci5fY3JlYXRlTG9jYWxUeXBlKG9wZXJhdG9yLnZhbHVlVHlwZXNbMF0pO1xuXHRcdFx0bGV0IHNGcm9tID0gb0NvbmRpdGlvbi52YWx1ZXNbMF07XG5cdFx0XHRsZXQgb09wZXJhdG9yTW9kZWxGb3JtYXQgPSBvT3BlcmF0b3JUeXBlLmdldE1vZGVsRm9ybWF0KCk7IC8vIHVzZSBNb2RlbEZvcm1hdCB0byBjb252ZXJ0IGluIEpTLURhdGUgYW5kIGFkZCAyMzo1OTo1OVxuXHRcdFx0bGV0IG9EYXRlID0gb09wZXJhdG9yTW9kZWxGb3JtYXQucGFyc2Uoc0Zyb20sIGZhbHNlKTtcblx0XHRcdHNGcm9tID0gb1R5cGUuZ2V0TW9kZWxWYWx1ZShvRGF0ZSk7XG5cdFx0XHRvT3BlcmF0b3JUeXBlID0gb3BlcmF0b3IuX2NyZWF0ZUxvY2FsVHlwZShvcGVyYXRvci52YWx1ZVR5cGVzWzFdKTtcblx0XHRcdG9PcGVyYXRvck1vZGVsRm9ybWF0ID0gb09wZXJhdG9yVHlwZS5nZXRNb2RlbEZvcm1hdCgpOyAvLyB1c2UgTW9kZWxGb3JtYXQgdG8gY29udmVydCBpbiBKUy1EYXRlIGFuZCBhZGQgMjM6NTk6NTlcblx0XHRcdGxldCBzVG8gPSBvQ29uZGl0aW9uLnZhbHVlc1sxXTtcblx0XHRcdG9EYXRlID0gb09wZXJhdG9yTW9kZWxGb3JtYXQucGFyc2Uoc1RvLCBmYWxzZSk7XG5cdFx0XHRvRGF0ZS5zZXRIb3VycygyMyk7XG5cdFx0XHRvRGF0ZS5zZXRNaW51dGVzKDU5KTtcblx0XHRcdG9EYXRlLnNldFNlY29uZHMoNTkpO1xuXHRcdFx0b0RhdGUuc2V0TWlsbGlzZWNvbmRzKDk5OSk7XG5cdFx0XHRzVG8gPSBvVHlwZS5nZXRNb2RlbFZhbHVlKG9EYXRlKTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHsgcGF0aDogc0ZpZWxkUGF0aCwgb3BlcmF0b3I6IE1vZGVsT3BlcmF0b3IuQlQsIHZhbHVlMTogc0Zyb20sIHZhbHVlMjogc1RvIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IHNGaWVsZFBhdGgsXG5cdFx0XHRcdG9wZXJhdG9yOiBvcGVyYXRvci5maWx0ZXJPcGVyYXRvcixcblx0XHRcdFx0dmFsdWUxOiBvQ29uZGl0aW9uLnZhbHVlc1swXSxcblx0XHRcdFx0dmFsdWUyOiBvQ29uZGl0aW9uLnZhbHVlc1sxXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTZW1hbnRpY0RhdGVPcGVyYXRvcnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFNQSxNQUFNQSxvQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztFQUNoRSxNQUFNQyxxQkFBcUIsR0FBRyxjQUFjO0VBQzVDLE1BQU1DLG1CQUFtQixHQUFHLFlBQVk7RUFDeEMsTUFBTUMseUJBQXlCLEdBQUcs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