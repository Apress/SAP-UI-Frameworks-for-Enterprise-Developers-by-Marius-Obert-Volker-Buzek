/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/filter/FilterUtils", "../MacroAPI"], function (merge, ClassSupport, FilterUtils, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   * <br>
   * Usually, a SelectionFields annotation is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar id="MyFilterBar" metaPath="@com.sap.vocabularies.UI.v1.SelectionFields" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.FilterBar
   * @public
   */
  let FilterBarAPI = (_dec = defineUI5Class("sap.fe.macros.filterBar.FilterBarAPI"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    expectedTypes: ["EntitySet", "EntityType"]
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: true
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: false
  }), _dec8 = aggregation({
    type: "sap.fe.macros.FilterField",
    multiple: true
  }), _dec9 = event(), _dec10 = event(), _dec11 = event(), _dec12 = event(), _dec13 = event(), _dec14 = event(), _dec15 = xmlEventHandler(), _dec16 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FilterBarAPI, _MacroAPI);
    function FilterBarAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor13, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FilterBarAPI.prototype;
    _proto.handleSearch = function handleSearch(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalSearch(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireSearch(eventParameters);
      }
    };
    _proto.handleFilterChanged = function handleFilterChanged(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalFilterChanged(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireFilterChanged(eventParameters);
      }
    };
    _proto._prepareEventParameters = function _prepareEventParameters(oFilterBar) {
      const {
        parameters,
        filters,
        search
      } = FilterUtils.getFilters(oFilterBar);
      return {
        parameters,
        filters,
        search
      };
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(this.content, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(this.content, sConditionPath, sOperator, vValues);
    }

    /**
     * Get the Active Filters Text Summary for the filter bar.
     *
     * @returns Active filters summary as text
     * @public
     */;
    _proto.getActiveFiltersText = function getActiveFiltersText() {
      var _oFilterBar$getAssign;
      const oFilterBar = this.content;
      return (oFilterBar === null || oFilterBar === void 0 ? void 0 : (_oFilterBar$getAssign = oFilterBar.getAssignedFiltersText()) === null || _oFilterBar$getAssign === void 0 ? void 0 : _oFilterBar$getAssign.filtersText) || "";
    }

    /**
     * Provides all the filters that are currently active
     * along with the search expression.
     *
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      return FilterUtils.getFilters(this.content);
    };
    return FilterBarAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSearch", [_dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSearch"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFilterChanged", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFilterChanged"), _class2.prototype)), _class2)) || _class);
  return FilterBarAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXJBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImV4cGVjdGVkQW5ub3RhdGlvbnMiLCJleHBlY3RlZFR5cGVzIiwiZGVmYXVsdFZhbHVlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsImV2ZW50IiwieG1sRXZlbnRIYW5kbGVyIiwiaGFuZGxlU2VhcmNoIiwib0V2ZW50Iiwib0ZpbHRlckJhciIsImdldFNvdXJjZSIsIm9FdmVudFBhcmFtZXRlcnMiLCJnZXRQYXJhbWV0ZXJzIiwib0NvbmRpdGlvbnMiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiZXZlbnRQYXJhbWV0ZXJzIiwiX3ByZXBhcmVFdmVudFBhcmFtZXRlcnMiLCJmaXJlSW50ZXJuYWxTZWFyY2giLCJtZXJnZSIsImNvbmRpdGlvbnMiLCJmaXJlU2VhcmNoIiwiaGFuZGxlRmlsdGVyQ2hhbmdlZCIsImZpcmVJbnRlcm5hbEZpbHRlckNoYW5nZWQiLCJmaXJlRmlsdGVyQ2hhbmdlZCIsInBhcmFtZXRlcnMiLCJmaWx0ZXJzIiwic2VhcmNoIiwiRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXJzIiwic2V0RmlsdGVyVmFsdWVzIiwic0NvbmRpdGlvblBhdGgiLCJzT3BlcmF0b3IiLCJ2VmFsdWVzIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiY29udGVudCIsImdldEFjdGl2ZUZpbHRlcnNUZXh0IiwiZ2V0QXNzaWduZWRGaWx0ZXJzVGV4dCIsImZpbHRlcnNUZXh0IiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhckFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5LCB4bWxFdmVudEhhbmRsZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gZmlsdGVyIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBGaWx0ZXJCYXIuXG4gKlxuICogVGhlIHRlbXBsYXRlIGZvciB0aGUgRmlsdGVyRmllbGQgaGFzIHRvIGJlIHByb3ZpZGVkIGFzIHRoZSBkZWZhdWx0IGFnZ3JlZ2F0aW9uXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcbiAqIEBwdWJsaWNcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgRmlsdGVyRmllbGQgPSB7XG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgbmFtZSBvZiB0aGUgRmlsdGVyRmllbGRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIEZpbHRlckZpZWxkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxhYmVsOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGZpbHRlciBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdGFibGUgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGZpbHRlciBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50PzogXCJCZWZvcmVcIiB8IFwiQWZ0ZXJcIjtcblx0LyoqXG5cdCAqIElmIHNldCwgcG9zc2libGUgZXJyb3JzIHRoYXQgb2NjdXIgZHVyaW5nIHRoZSBzZWFyY2ggd2lsbCBiZSBkaXNwbGF5ZWQgaW4gYSBtZXNzYWdlIGJveC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2hvd01lc3NhZ2VzPzogYm9vbGVhbjtcblxuXHRzbG90TmFtZT86IHN0cmluZztcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyQmFyIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgU2VsZWN0aW9uRmllbGRzIGFubm90YXRpb24gaXMgZXhwZWN0ZWQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckJhciBpZD1cIk15RmlsdGVyQmFyXCIgbWV0YVBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkZpbHRlckJhclxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmZpbHRlckJhci5GaWx0ZXJCYXJBUElcIilcbmNsYXNzIEZpbHRlckJhckFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBGaWx0ZXJCYXIgY29udHJvbC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZEFubm90YXRpb25zOiBbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0sXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogSWYgdHJ1ZSwgdGhlIHNlYXJjaCBpcyB0cmlnZ2VyZWQgYXV0b21hdGljYWxseSB3aGVuIGEgZmlsdGVyIHZhbHVlIGlzIGNoYW5nZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGxpdmVNb2RlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHZpc2libGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEaXNwbGF5cyBwb3NzaWJsZSBlcnJvcnMgZHVyaW5nIHRoZSBzZWFyY2ggaW4gYSBtZXNzYWdlIGJveFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHNob3dNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlICdDbGVhcicgYnV0dG9uIG9uIHRoZSBGaWx0ZXJCYXIuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdHNob3dDbGVhckJ1dHRvbj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBmaWx0ZXIgZmllbGRzIG9mIHRoZSBGaWx0ZXJCYXIgYnVpbGRpbmcgYmxvY2tcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLkZpbHRlckZpZWxkXCIsIG11bHRpcGxlOiB0cnVlIH0pXG5cdGZpbHRlckZpZWxkcz86IEZpbHRlckZpZWxkW107XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiB0aGUgJ0dvJyBidXR0b24gaXMgcHJlc3NlZCBvciBhZnRlciBhIGNvbmRpdGlvbiBjaGFuZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlYXJjaCE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIHdoZW4gdGhlICdHbycgYnV0dG9uIGlzIHByZXNzZWQgb3IgYWZ0ZXIgYSBjb25kaXRpb24gY2hhbmdlLiBUaGlzIGlzIG9ubHkgaW50ZXJuYWxseSB1c2VkIGJ5IHNhcC5mZSAoRmlvcmkgZWxlbWVudHMpIGFuZFxuXHQgKiBleHBvc2VzIHBhcmFtZXRlcnMgZnJvbSBpbnRlcm5hbCBNREMtRmlsdGVyQmFyIHNlYXJjaCBldmVudFxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0aW50ZXJuYWxTZWFyY2ghOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCBhZnRlciBlaXRoZXIgYSBmaWx0ZXIgdmFsdWUgb3IgdGhlIHZpc2liaWxpdHkgb2YgYSBmaWx0ZXIgaXRlbSBoYXMgYmVlbiBjaGFuZ2VkLiBUaGUgZXZlbnQgY29udGFpbnMgY29uZGl0aW9ucyB0aGF0IHdpbGwgYmUgdXNlZCBhcyBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRmaWx0ZXJDaGFuZ2VkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiB0aGUgJ0NsZWFyJyBidXR0b24gaXMgcHJlc3NlZC4gVGhpcyBpcyBvbmx5IHBvc3NpYmxlIHdoZW4gdGhlICdDbGVhcicgYnV0dG9uIGlzIGVuYWJsZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdGFmdGVyQ2xlYXIhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCBhZnRlciBlaXRoZXIgYSBmaWx0ZXIgdmFsdWUgb3IgdGhlIHZpc2liaWxpdHkgb2YgYSBmaWx0ZXIgaXRlbSBoYXMgYmVlbiBjaGFuZ2VkLiBUaGUgZXZlbnQgY29udGFpbnMgY29uZGl0aW9ucyB0aGF0IHdpbGwgYmUgdXNlZCBhcyBmaWx0ZXJzLlxuXHQgKiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxseSBvbmx5IGJ5IHNhcC5mZSAoRmlvcmkgRWxlbWVudHMpLiBUaGlzIGV4cG9zZXMgcGFyYW1ldGVycyBmcm9tIHRoZSBNREMtRmlsdGVyQmFyIGZpbHRlckNoYW5nZWQgZXZlbnQgdGhhdCBpcyB1c2VkIGJ5IHNhcC5mZSBpbiBzb21lIGNhc2VzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0aW50ZXJuYWxGaWx0ZXJDaGFuZ2VkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIEZpbHRlckJhciBTdGF0ZSBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBZb3UgY2FuIHNldCB0aGlzIHRvIHN0b3JlIHRoZSBzdGF0ZSBvZiB0aGUgZmlsdGVyIGJhciBpbiB0aGUgYXBwIHN0YXRlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0c3RhdGVDaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0aGFuZGxlU2VhcmNoKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIEZpbHRlckJhcjtcblx0XHRjb25zdCBvRXZlbnRQYXJhbWV0ZXJzID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0XHRpZiAob0ZpbHRlckJhcikge1xuXHRcdFx0Y29uc3Qgb0NvbmRpdGlvbnMgPSBvRmlsdGVyQmFyLmdldEZpbHRlckNvbmRpdGlvbnMoKTtcblx0XHRcdGNvbnN0IGV2ZW50UGFyYW1ldGVyczogb2JqZWN0ID0gdGhpcy5fcHJlcGFyZUV2ZW50UGFyYW1ldGVycyhvRmlsdGVyQmFyKTtcblx0XHRcdCh0aGlzIGFzIGFueSkuZmlyZUludGVybmFsU2VhcmNoKG1lcmdlKHsgY29uZGl0aW9uczogb0NvbmRpdGlvbnMgfSwgb0V2ZW50UGFyYW1ldGVycykpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlU2VhcmNoKGV2ZW50UGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdGhhbmRsZUZpbHRlckNoYW5nZWQob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsdGVyQmFyO1xuXHRcdGNvbnN0IG9FdmVudFBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRjb25zdCBvQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpO1xuXHRcdFx0Y29uc3QgZXZlbnRQYXJhbWV0ZXJzOiBvYmplY3QgPSB0aGlzLl9wcmVwYXJlRXZlbnRQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlSW50ZXJuYWxGaWx0ZXJDaGFuZ2VkKG1lcmdlKHsgY29uZGl0aW9uczogb0NvbmRpdGlvbnMgfSwgb0V2ZW50UGFyYW1ldGVycykpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlRmlsdGVyQ2hhbmdlZChldmVudFBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdF9wcmVwYXJlRXZlbnRQYXJhbWV0ZXJzKG9GaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdGNvbnN0IHsgcGFyYW1ldGVycywgZmlsdGVycywgc2VhcmNoIH0gPSBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJzKG9GaWx0ZXJCYXIpO1xuXG5cdFx0cmV0dXJuIHsgcGFyYW1ldGVycywgZmlsdGVycywgc2VhcmNoIH07XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmaWx0ZXIgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkgaW4gdGhlIGZpbHRlciBiYXIuXG5cdCAqIFRoZSBmaWx0ZXIgdmFsdWVzIGNhbiBiZSBlaXRoZXIgYSBzaW5nbGUgdmFsdWUgb3IgYW4gYXJyYXkgb2YgdmFsdWVzLlxuXHQgKiBFYWNoIGZpbHRlciB2YWx1ZSBtdXN0IGJlIHJlcHJlc2VudGVkIGFzIGEgcHJpbWl0aXZlIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbmRpdGlvblBhdGggVGhlIHBhdGggdG8gdGhlIHByb3BlcnR5IGFzIGEgY29uZGl0aW9uIHBhdGhcblx0ICogQHBhcmFtIFtzT3BlcmF0b3JdIFRoZSBvcGVyYXRvciB0byBiZSB1c2VkIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCB0aGUgZGVmYXVsdCBvcGVyYXRvciAoRVEpIHdpbGwgYmUgdXNlZFxuXHQgKiBAcGFyYW0gdlZhbHVlcyBUaGUgdmFsdWVzIHRvIGJlIGFwcGxpZWRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGZvciBhc3luY2hyb25vdXMgaGFuZGxpbmdcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2V0RmlsdGVyVmFsdWVzKFxuXHRcdHNDb25kaXRpb25QYXRoOiBzdHJpbmcsXG5cdFx0c09wZXJhdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0dlZhbHVlcz86IHVuZGVmaW5lZCB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmdbXSB8IG51bWJlcltdIHwgYm9vbGVhbltdXG5cdCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR2VmFsdWVzID0gc09wZXJhdG9yO1xuXHRcdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyh0aGlzLmNvbnRlbnQsIHNDb25kaXRpb25QYXRoLCB2VmFsdWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyh0aGlzLmNvbnRlbnQsIHNDb25kaXRpb25QYXRoLCBzT3BlcmF0b3IsIHZWYWx1ZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgQWN0aXZlIEZpbHRlcnMgVGV4dCBTdW1tYXJ5IGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICpcblx0ICogQHJldHVybnMgQWN0aXZlIGZpbHRlcnMgc3VtbWFyeSBhcyB0ZXh0XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldEFjdGl2ZUZpbHRlcnNUZXh0KCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyO1xuXHRcdHJldHVybiBvRmlsdGVyQmFyPy5nZXRBc3NpZ25lZEZpbHRlcnNUZXh0KCk/LmZpbHRlcnNUZXh0IHx8IFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgYWxsIHRoZSBmaWx0ZXJzIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmVcblx0ICogYWxvbmcgd2l0aCB0aGUgc2VhcmNoIGV4cHJlc3Npb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt7ZmlsdGVyczogc2FwLnVpLm1vZGVsLkZpbHRlcltdfHVuZGVmaW5lZCwgc2VhcmNoOiBzdHJpbmd8dW5kZWZpbmVkfX0gQW4gYXJyYXkgb2YgYWN0aXZlIGZpbHRlcnMgYW5kIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0RmlsdGVycygpIHtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVycyh0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJCYXJBUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1BLFlBQVksV0FEakJDLGNBQWMsQ0FBQyxzQ0FBc0MsQ0FBQyxVQU9yREMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVE1QkQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLG1CQUFtQixFQUFFLENBQUMsNENBQTRDLENBQUM7SUFDbkVDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZO0VBQzFDLENBQUMsQ0FBQyxVQVFESCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcs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