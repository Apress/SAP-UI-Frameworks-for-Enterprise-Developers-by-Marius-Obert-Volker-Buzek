/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards"], function (TypeGuards) {
  "use strict";

  var _exports = {};
  var isEntitySet = TypeGuards.isEntitySet;
  function getIsRequired(converterContext, sPropertyPath) {
    var _capabilities, _capabilities$FilterR;
    const entitySet = converterContext.getEntitySet();
    let capabilities;
    if (isEntitySet(entitySet)) {
      capabilities = entitySet.annotations.Capabilities;
    }
    const aRequiredProperties = (_capabilities = capabilities) === null || _capabilities === void 0 ? void 0 : (_capabilities$FilterR = _capabilities.FilterRestrictions) === null || _capabilities$FilterR === void 0 ? void 0 : _capabilities$FilterR.RequiredProperties;
    let bIsRequired = false;
    if (aRequiredProperties) {
      aRequiredProperties.forEach(function (oRequiredProperty) {
        if (sPropertyPath === (oRequiredProperty === null || oRequiredProperty === void 0 ? void 0 : oRequiredProperty.value)) {
          bIsRequired = true;
        }
      });
    }
    return bIsRequired;
  }
  _exports.getIsRequired = getIsRequired;
  function isPropertyFilterable(converterContext, valueListProperty) {
    var _capabilities2, _capabilities2$Filter;
    let bNotFilterable, bHidden;
    const entityType = converterContext.getEntityType();
    const entitySet = converterContext.getEntitySet();
    let capabilities;
    if (isEntitySet(entitySet)) {
      capabilities = entitySet.annotations.Capabilities;
    }
    const nonFilterableProperties = (_capabilities2 = capabilities) === null || _capabilities2 === void 0 ? void 0 : (_capabilities2$Filter = _capabilities2.FilterRestrictions) === null || _capabilities2$Filter === void 0 ? void 0 : _capabilities2$Filter.NonFilterableProperties;
    const properties = entityType.entityProperties;
    properties.forEach(property => {
      const PropertyPath = property.name;
      if (PropertyPath === valueListProperty) {
        var _property$annotations, _property$annotations2, _property$annotations3;
        bHidden = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf();
      }
    });
    if (nonFilterableProperties && nonFilterableProperties.length > 0) {
      for (let i = 0; i < nonFilterableProperties.length; i++) {
        var _nonFilterablePropert;
        const sPropertyName = (_nonFilterablePropert = nonFilterableProperties[i]) === null || _nonFilterablePropert === void 0 ? void 0 : _nonFilterablePropert.value;
        if (sPropertyName === valueListProperty) {
          bNotFilterable = true;
        }
      }
    }
    return bNotFilterable || bHidden;
  }
  _exports.isPropertyFilterable = isPropertyFilterable;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJc1JlcXVpcmVkIiwiY29udmVydGVyQ29udGV4dCIsInNQcm9wZXJ0eVBhdGgiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJjYXBhYmlsaXRpZXMiLCJpc0VudGl0eVNldCIsImFubm90YXRpb25zIiwiQ2FwYWJpbGl0aWVzIiwiYVJlcXVpcmVkUHJvcGVydGllcyIsIkZpbHRlclJlc3RyaWN0aW9ucyIsIlJlcXVpcmVkUHJvcGVydGllcyIsImJJc1JlcXVpcmVkIiwiZm9yRWFjaCIsIm9SZXF1aXJlZFByb3BlcnR5IiwidmFsdWUiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsInZhbHVlTGlzdFByb3BlcnR5IiwiYk5vdEZpbHRlcmFibGUiLCJiSGlkZGVuIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJub25GaWx0ZXJhYmxlUHJvcGVydGllcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsImVudGl0eVByb3BlcnRpZXMiLCJwcm9wZXJ0eSIsIlByb3BlcnR5UGF0aCIsIm5hbWUiLCJVSSIsIkhpZGRlbiIsInZhbHVlT2YiLCJsZW5ndGgiLCJpIiwic1Byb3BlcnR5TmFtZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyVGVtcGxhdGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGlzRW50aXR5U2V0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SXNSZXF1aXJlZChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBzUHJvcGVydHlQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0bGV0IGNhcGFiaWxpdGllcztcblxuXHRpZiAoaXNFbnRpdHlTZXQoZW50aXR5U2V0KSkge1xuXHRcdGNhcGFiaWxpdGllcyA9IGVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM7XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllcyA9IGNhcGFiaWxpdGllcz8uRmlsdGVyUmVzdHJpY3Rpb25zPy5SZXF1aXJlZFByb3BlcnRpZXMgYXMgYW55W107XG5cdGxldCBiSXNSZXF1aXJlZCA9IGZhbHNlO1xuXHRpZiAoYVJlcXVpcmVkUHJvcGVydGllcykge1xuXHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAob1JlcXVpcmVkUHJvcGVydHkpIHtcblx0XHRcdGlmIChzUHJvcGVydHlQYXRoID09PSBvUmVxdWlyZWRQcm9wZXJ0eT8udmFsdWUpIHtcblx0XHRcdFx0YklzUmVxdWlyZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiSXNSZXF1aXJlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlGaWx0ZXJhYmxlKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZhbHVlTGlzdFByb3BlcnR5OiBzdHJpbmcpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0bGV0IGJOb3RGaWx0ZXJhYmxlLCBiSGlkZGVuO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGxldCBjYXBhYmlsaXRpZXM7XG5cdGlmIChpc0VudGl0eVNldChlbnRpdHlTZXQpKSB7XG5cdFx0Y2FwYWJpbGl0aWVzID0gZW50aXR5U2V0LmFubm90YXRpb25zLkNhcGFiaWxpdGllcztcblx0fVxuXHRjb25zdCBub25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IGNhcGFiaWxpdGllcz8uRmlsdGVyUmVzdHJpY3Rpb25zPy5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyBhcyBhbnlbXTtcblx0Y29uc3QgcHJvcGVydGllcyA9IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcztcblx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRjb25zdCBQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eS5uYW1lO1xuXHRcdGlmIChQcm9wZXJ0eVBhdGggPT09IHZhbHVlTGlzdFByb3BlcnR5KSB7XG5cdFx0XHRiSGlkZGVuID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKTtcblx0XHR9XG5cdH0pO1xuXHRpZiAobm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgJiYgbm9uRmlsdGVyYWJsZVByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbm9uRmlsdGVyYWJsZVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBub25GaWx0ZXJhYmxlUHJvcGVydGllc1tpXT8udmFsdWU7XG5cdFx0XHRpZiAoc1Byb3BlcnR5TmFtZSA9PT0gdmFsdWVMaXN0UHJvcGVydHkpIHtcblx0XHRcdFx0Yk5vdEZpbHRlcmFibGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYk5vdEZpbHRlcmFibGUgfHwgYkhpZGRlbjtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBSU8sU0FBU0EsYUFBYSxDQUFDQyxnQkFBa0MsRUFBRUMsYUFBcUIsRUFBVztJQUFBO0lBQ2pHLE1BQU1DLFNBQVMsR0FBR0YsZ0JBQWdCLENBQUNHLFlBQVksRUFBRTtJQUNqRCxJQUFJQyxZQUFZO0lBRWhCLElBQUlDLFdBQVcsQ0FBQ0gsU0FBUyxDQUFDLEVBQUU7TUFDM0JFLFlBQVksR0FBR0YsU0FBUyxDQUFDSSxXQUFXLENBQUNDLFlBQVk7SUFDbEQ7SUFDQSxNQUFNQyxtQkFBbUIsb0JBQUdKLFlBQVksMkVBQVosY0FBY0ssa0JBQWtCLDBEQUFoQyxzQkFBa0NDLGtCQUEyQjtJQUN6RixJQUFJQyxXQUFXLEdBQUcsS0FBSztJQUN2QixJQUFJSCxtQkFBbUIsRUFBRTtNQUN4QkEsbUJBQW1CLENBQUNJLE9BQU8sQ0FBQyxVQUFVQyxpQkFBaUIsRUFBRTtRQUN4RCxJQUFJWixhQUFhLE1BQUtZLGlCQUFpQixhQUFqQkEsaUJBQWlCLHVCQUFqQkEsaUJBQWlCLENBQUVDLEtBQUssR0FBRTtVQUMvQ0gsV0FBVyxHQUFHLElBQUk7UUFDbkI7TUFDRCxDQUFDLENBQUM7SUFDSDtJQUNBLE9BQU9BLFdBQVc7RUFDbkI7RUFBQztFQUVNLFNBQVNJLG9CQUFvQixDQUFDZixnQkFBa0MsRUFBRWdCLGlCQUF5QixFQUF1QjtJQUFBO0lBQ3hILElBQUlDLGNBQWMsRUFBRUMsT0FBTztJQUMzQixNQUFNQyxVQUFVLEdBQUduQixnQkFBZ0IsQ0FBQ29CLGFBQWEsRUFBRTtJQUNuRCxNQUFNbEIsU0FBUyxHQUFHRixnQkFBZ0IsQ0FBQ0csWUFBWSxFQUFFO0lBQ2pELElBQUlDLFlBQVk7SUFDaEIsSUFBSUMsV0FBVyxDQUFDSCxTQUFTLENBQUMsRUFBRTtNQUMzQkUsWUFBWSxHQUFHRixTQUFTLENBQUNJLFdBQVcsQ0FBQ0MsWUFBWTtJQUNsRDtJQUNBLE1BQU1jLHVCQUF1QixxQkFBR2pCLFlBQVksNEVBQVosZUFBY0ssa0JBQWtCLDBEQUFoQyxzQkFBa0NhLHVCQUFnQztJQUNsRyxNQUFNQyxVQUFVLEdBQUdKLFVBQVUsQ0FBQ0ssZ0JBQWdCO0lBQzlDRCxVQUFVLENBQUNYLE9BQU8sQ0FBRWEsUUFBa0IsSUFBSztNQUMxQyxNQUFNQyxZQUFZLEdBQUdELFFBQVEsQ0FBQ0UsSUFBSTtNQUNsQyxJQUFJRCxZQUFZLEtBQUtWLGlCQUFpQixFQUFFO1FBQUE7UUFDdkNFLE9BQU8sNEJBQUdPLFFBQVEsQ0FBQ25CLFdBQVcsb0ZBQXBCLHNCQUFzQnNCLEVBQUUscUZBQXhCLHVCQUEwQkMsTUFBTSwyREFBaEMsdUJBQWtDQyxPQUFPLEVBQUU7TUFDdEQ7SUFDRCxDQUFDLENBQUM7SUFDRixJQUFJVCx1QkFBdUIsSUFBSUEsdUJBQXVCLENBQUNVLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDbEUsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdYLHVCQUF1QixDQUFDVSxNQUFNLEVBQUVDLENBQUMsRUFBRSxFQUFFO1FBQUE7UUFDeEQsTUFBTUMsYUFBYSw0QkFBR1osdUJBQXVCLENBQUNXLENBQUMsQ0FBQywwREFBMUIsc0JBQTRCbEIsS0FBSztRQUN2RCxJQUFJbUIsYUFBYSxLQUFLakIsaUJBQWlCLEVBQUU7VUFDeENDLGNBQWMsR0FBRyxJQUFJO1FBQ3RCO01BQ0Q7SUFDRDtJQUNBLE9BQU9BLGNBQWMsSUFBSUMsT0FBTztFQUNqQztFQUFDO0VBQUE7QUFBQSJ9