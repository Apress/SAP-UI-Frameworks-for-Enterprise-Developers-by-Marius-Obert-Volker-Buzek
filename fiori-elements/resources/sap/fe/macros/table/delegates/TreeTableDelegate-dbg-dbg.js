/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/macros/table/delegates/TableDelegate"], function (CommonUtils, TableDelegate) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69.0
   * @alias sap.fe.macros.TableDelegate
   */
  const TreeTableDelegate = Object.assign({}, TableDelegate, {
    _internalUpdateBindingInfo: function (table, bindingInfo) {
      var _bindingInfo$paramete;
      TableDelegate._internalUpdateBindingInfo.apply(this, [table, bindingInfo]);
      const payload = table.getPayload();
      bindingInfo.parameters.$$aggregation = {
        ...bindingInfo.parameters.$$aggregation,
        ...{
          hierarchyQualifier: payload === null || payload === void 0 ? void 0 : payload.hierarchyQualifier
        },
        // Setting the expandTo parameter to a high value forces the treeTable to expand all nodes when the search is applied
        ...{
          expandTo: (_bindingInfo$paramete = bindingInfo.parameters.$$aggregation) !== null && _bindingInfo$paramete !== void 0 && _bindingInfo$paramete.search ? 100 : payload === null || payload === void 0 ? void 0 : payload.initialExpansionLevel
        }
      };
    },
    updateBindingInfoWithSearchQuery: function (bindingInfo, filterInfo, filter) {
      bindingInfo.filters = filter;
      if (filterInfo.search) {
        bindingInfo.parameters.$$aggregation = {
          ...bindingInfo.parameters.$$aggregation,
          ...{
            search: CommonUtils.normalizeSearchTerm(filterInfo.search)
          }
        };
      } else {
        var _bindingInfo$paramete2, _bindingInfo$paramete3;
        (_bindingInfo$paramete2 = bindingInfo.parameters) === null || _bindingInfo$paramete2 === void 0 ? true : (_bindingInfo$paramete3 = _bindingInfo$paramete2.$$aggregation) === null || _bindingInfo$paramete3 === void 0 ? true : delete _bindingInfo$paramete3.search;
      }
    }
  });
  return TreeTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUcmVlVGFibGVEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIlRhYmxlRGVsZWdhdGUiLCJfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbyIsInRhYmxlIiwiYmluZGluZ0luZm8iLCJhcHBseSIsInBheWxvYWQiLCJnZXRQYXlsb2FkIiwicGFyYW1ldGVycyIsIiQkYWdncmVnYXRpb24iLCJoaWVyYXJjaHlRdWFsaWZpZXIiLCJleHBhbmRUbyIsInNlYXJjaCIsImluaXRpYWxFeHBhbnNpb25MZXZlbCIsInVwZGF0ZUJpbmRpbmdJbmZvV2l0aFNlYXJjaFF1ZXJ5IiwiZmlsdGVySW5mbyIsImZpbHRlciIsImZpbHRlcnMiLCJDb21tb25VdGlscyIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRyZWVUYWJsZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBUYWJsZURlbGVnYXRlIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UYWJsZURlbGVnYXRlXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvRmlsdGVyXCI7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAudWkubWRjLlRhYmxlLlxuICogPGgzPjxiPk5vdGU6PC9iPjwvaDM+XG4gKiBUaGlzIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgbm90IGludGVuZGVkIGZvciBwcm9kdWN0aXZlIHVzYWdlLCBzaW5jZSB0aGUgQVBJL2JlaGF2aW9yIGhhcyBub3QgYmVlbiBmaW5hbGl6ZWQuXG4gKlxuICogQGF1dGhvciBTQVAgU0VcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAc2luY2UgMS42OS4wXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZURlbGVnYXRlXG4gKi9cbmNvbnN0IFRyZWVUYWJsZURlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgVGFibGVEZWxlZ2F0ZSwge1xuXHRfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKHRhYmxlOiBhbnksIGJpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRUYWJsZURlbGVnYXRlLl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvLmFwcGx5KHRoaXMsIFt0YWJsZSwgYmluZGluZ0luZm9dKTtcblxuXHRcdGNvbnN0IHBheWxvYWQgPSB0YWJsZS5nZXRQYXlsb2FkKCk7XG5cdFx0YmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uID0ge1xuXHRcdFx0Li4uYmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uLFxuXHRcdFx0Li4ueyBoaWVyYXJjaHlRdWFsaWZpZXI6IHBheWxvYWQ/LmhpZXJhcmNoeVF1YWxpZmllciB9LFxuXHRcdFx0Ly8gU2V0dGluZyB0aGUgZXhwYW5kVG8gcGFyYW1ldGVyIHRvIGEgaGlnaCB2YWx1ZSBmb3JjZXMgdGhlIHRyZWVUYWJsZSB0byBleHBhbmQgYWxsIG5vZGVzIHdoZW4gdGhlIHNlYXJjaCBpcyBhcHBsaWVkXG5cdFx0XHQuLi57IGV4cGFuZFRvOiBiaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiQkYWdncmVnYXRpb24/LnNlYXJjaCA/IDEwMCA6IHBheWxvYWQ/LmluaXRpYWxFeHBhbnNpb25MZXZlbCB9XG5cdFx0fTtcblx0fSxcblx0dXBkYXRlQmluZGluZ0luZm9XaXRoU2VhcmNoUXVlcnk6IGZ1bmN0aW9uIChiaW5kaW5nSW5mbzogYW55LCBmaWx0ZXJJbmZvOiBhbnksIGZpbHRlcjogRmlsdGVyKSB7XG5cdFx0YmluZGluZ0luZm8uZmlsdGVycyA9IGZpbHRlcjtcblx0XHRpZiAoZmlsdGVySW5mby5zZWFyY2gpIHtcblx0XHRcdGJpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRhZ2dyZWdhdGlvbiA9IHtcblx0XHRcdFx0Li4uYmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uLFxuXHRcdFx0XHQuLi57XG5cdFx0XHRcdFx0c2VhcmNoOiBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKGZpbHRlckluZm8uc2VhcmNoKVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgYmluZGluZ0luZm8ucGFyYW1ldGVycz8uJCRhZ2dyZWdhdGlvbj8uc2VhcmNoO1xuXHRcdH1cblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFRyZWVUYWJsZURlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLGlCQUFpQixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsYUFBYSxFQUFFO0lBQzFEQywwQkFBMEIsRUFBRSxVQUFVQyxLQUFVLEVBQUVDLFdBQWdCLEVBQUU7TUFBQTtNQUNuRUgsYUFBYSxDQUFDQywwQkFBMEIsQ0FBQ0csS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDRixLQUFLLEVBQUVDLFdBQVcsQ0FBQyxDQUFDO01BRTFFLE1BQU1FLE9BQU8sR0FBR0gsS0FBSyxDQUFDSSxVQUFVLEVBQUU7TUFDbENILFdBQVcsQ0FBQ0ksVUFBVSxDQUFDQyxhQUFhLEdBQUc7UUFDdEMsR0FBR0wsV0FBVyxDQUFDSSxVQUFVLENBQUNDLGFBQWE7UUFDdkMsR0FBRztVQUFFQyxrQkFBa0IsRUFBRUosT0FBTyxhQUFQQSxPQUFPLHVCQUFQQSxPQUFPLENBQUVJO1FBQW1CLENBQUM7UUFDdEQ7UUFDQSxHQUFHO1VBQUVDLFFBQVEsRUFBRSx5QkFBQVAsV0FBVyxDQUFDSSxVQUFVLENBQUNDLGFBQWEsa0RBQXBDLHNCQUFzQ0csTUFBTSxHQUFHLEdBQUcsR0FBR04sT0FBTyxhQUFQQSxPQUFPLHVCQUFQQSxPQUFPLENBQUVPO1FBQXNCO01BQ3BHLENBQUM7SUFDRixDQUFDO0lBQ0RDLGdDQUFnQyxFQUFFLFVBQVVWLFdBQWdCLEVBQUVXLFVBQWUsRUFBRUMsTUFBYyxFQUFFO01BQzlGWixXQUFXLENBQUNhLE9BQU8sR0FBR0QsTUFBTTtNQUM1QixJQUFJRCxVQUFVLENBQUNILE1BQU0sRUFBRTtRQUN0QlIsV0FBVyxDQUFDSSxVQUFVLENBQUNDLGFBQWEsR0FBRztVQUN0QyxHQUFHTCxXQUFXLENBQUNJLFVBQVUsQ0FBQ0MsYUFBYTtVQUN2QyxHQUFHO1lBQ0ZHLE1BQU0sRUFBRU0sV0FBVyxDQUFDQyxtQkFBbUIsQ0FBQ0osVUFBVSxDQUFDSCxNQUFNO1VBQzFEO1FBQ0QsQ0FBQztNQUNGLENBQUMsTUFBTTtRQUFBO1FBQ04sMEJBQU9SLFdBQVcsQ0FBQ0ksVUFBVSxtRkFBdEIsdUJBQXdCQyxhQUFhLHlEQUE1QyxPQUFPLHVCQUF1Q0csTUFBTTtNQUNyRDtJQUNEO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FFWWQsaUJBQWlCO0FBQUEifQ==