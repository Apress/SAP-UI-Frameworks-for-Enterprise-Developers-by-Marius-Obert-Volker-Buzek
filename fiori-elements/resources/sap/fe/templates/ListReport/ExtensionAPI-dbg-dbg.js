/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/LRMessageStrip", "sap/ui/core/InvisibleMessage", "sap/ui/core/library"], function (ExtensionAPI, ClassSupport, ChartUtils, FilterUtils, $LRMessageStrip, InvisibleMessage, library) {
  "use strict";

  var _dec, _class;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var LRMessageStrip = $LRMessageStrip.LRMessageStrip;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for list reports in SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.templates.ListReport.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ListReportExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ListReportExtensionAPI, _ExtensionAPI);
    function ListReportExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ListReportExtensionAPI.prototype;
    /**
     * Refreshes the List Report.
     * This method currently only supports triggering the search (by clicking on the GO button)
     * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
     * currently shown data based on the filters entered by the user.
     * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh() {
      const oFilterBar = this._controller._getFilterBarControl();
      if (oFilterBar) {
        return oFilterBar.waitForInitialization().then(function () {
          oFilterBar.triggerSearch();
        });
      } else {
        // TODO: if there is no filter bar, make refresh work
        return Promise.resolve();
      }
    }

    /**
     * Gets the list entries currently selected for the displayed control.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$_controller$_ge, _this$_controller$_ge2;
      const oControl = this._controller._isMultiMode() && ((_this$_controller$_ge = this._controller._getMultiModeControl()) === null || _this$_controller$_ge === void 0 ? void 0 : (_this$_controller$_ge2 = _this$_controller$_ge.getSelectedInnerControl()) === null || _this$_controller$_ge2 === void 0 ? void 0 : _this$_controller$_ge2.content) || this._controller._getTable();
      if (oControl.isA("sap.ui.mdc.Chart")) {
        const aSelectedContexts = [];
        if (oControl && oControl.get_chart()) {
          const aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
          for (let i = 0; i < aSelectedDataPoints.length; i++) {
            aSelectedContexts.push(aSelectedDataPoints[i].context);
          }
        }
        return aSelectedContexts;
      } else {
        return oControl && oControl.getSelectedContexts() || [];
      }
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      // The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
      // when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
      const filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
    }

    /**
     * This method converts filter conditions to filters.
     *
     * @param mFilterConditions Map containing the filter conditions of the FilterBar.
     * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
     * @returns Object containing the converted FilterBar filters.
     * @public
     */;
    _proto.createFiltersFromFilterConditions = function createFiltersFromFilterConditions(mFilterConditions) {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
    }

    /**
     * Provides all the model filters from the filter bar that are currently active
     * along with the search expression.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilters(oFilterBar);
    }

    /**
     * Provide an option for showing a custom message in the message strip above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} message.message Message string to be displayed.
     * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
     * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @public
     */;
    _proto.setCustomMessage = function setCustomMessage(message, tabKey, onClose) {
      if (!this.ListReportMessageStrip) {
        this.ListReportMessageStrip = new LRMessageStrip();
      }
      this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
      if (message !== null && message !== void 0 && message.message) {
        InvisibleMessage.getInstance().announce(message.message, InvisibleMessageMode.Assertive);
      }
    };
    return ListReportExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ListReportExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwib0ZpbHRlckJhciIsIl9jb250cm9sbGVyIiwiX2dldEZpbHRlckJhckNvbnRyb2wiLCJ3YWl0Rm9ySW5pdGlhbGl6YXRpb24iLCJ0aGVuIiwidHJpZ2dlclNlYXJjaCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIm9Db250cm9sIiwiX2lzTXVsdGlNb2RlIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJnZXRTZWxlY3RlZElubmVyQ29udHJvbCIsImNvbnRlbnQiLCJfZ2V0VGFibGUiLCJpc0EiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldF9jaGFydCIsImFTZWxlY3RlZERhdGFQb2ludHMiLCJDaGFydFV0aWxzIiwiZ2V0Q2hhcnRTZWxlY3RlZERhdGEiLCJpIiwibGVuZ3RoIiwicHVzaCIsImNvbnRleHQiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJmaWx0ZXJCYXIiLCJfZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2wiLCJhcmd1bWVudHMiLCJGaWx0ZXJVdGlscyIsImNyZWF0ZUZpbHRlcnNGcm9tRmlsdGVyQ29uZGl0aW9ucyIsIm1GaWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVySW5mbyIsInVuZGVmaW5lZCIsImdldEZpbHRlcnMiLCJzZXRDdXN0b21NZXNzYWdlIiwibWVzc2FnZSIsInRhYktleSIsIm9uQ2xvc2UiLCJMaXN0UmVwb3J0TWVzc2FnZVN0cmlwIiwiTFJNZXNzYWdlU3RyaXAiLCJzaG93Q3VzdG9tTWVzc2FnZSIsIkludmlzaWJsZU1lc3NhZ2UiLCJnZXRJbnN0YW5jZSIsImFubm91bmNlIiwiSW52aXNpYmxlTWVzc2FnZU1vZGUiLCJBc3NlcnRpdmUiLCJFeHRlbnNpb25BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4dGVuc2lvbkFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvY29yZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBMaXN0UmVwb3J0Q29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IExSQ3VzdG9tTWVzc2FnZSwgTFJNZXNzYWdlU3RyaXAgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xSTWVzc2FnZVN0cmlwXCI7XG5pbXBvcnQgSW52aXNpYmxlTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvSW52aXNpYmxlTWVzc2FnZVwiO1xuaW1wb3J0IHsgSW52aXNpYmxlTWVzc2FnZU1vZGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBBUEkgZm9yIGxpc3QgcmVwb3J0cyBpbiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIFRvIGNvcnJlY3RseSBpbnRlZ3JhdGUgeW91ciBhcHAgZXh0ZW5zaW9uIGNvZGluZyB3aXRoIFNBUCBGaW9yaSBlbGVtZW50cywgdXNlIG9ubHkgdGhlIGV4dGVuc2lvbkFQSSBvZiBTQVAgRmlvcmkgZWxlbWVudHMuIERvbid0IGFjY2VzcyBvciBtYW5pcHVsYXRlIGNvbnRyb2xzLCBwcm9wZXJ0aWVzLCBtb2RlbHMsIG9yIG90aGVyIGludGVybmFsIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIGZyYW1ld29yay5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSVxuICogQHB1YmxpY1xuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQGZpbmFsXG4gKiBAc2luY2UgMS43OS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUElcIilcbmNsYXNzIExpc3RSZXBvcnRFeHRlbnNpb25BUEkgZXh0ZW5kcyBFeHRlbnNpb25BUEkge1xuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXIhOiBMaXN0UmVwb3J0Q29udHJvbGxlcjtcblxuXHRMaXN0UmVwb3J0TWVzc2FnZVN0cmlwITogTFJNZXNzYWdlU3RyaXA7XG5cblx0LyoqXG5cdCAqIFJlZnJlc2hlcyB0aGUgTGlzdCBSZXBvcnQuXG5cdCAqIFRoaXMgbWV0aG9kIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIHRyaWdnZXJpbmcgdGhlIHNlYXJjaCAoYnkgY2xpY2tpbmcgb24gdGhlIEdPIGJ1dHRvbilcblx0ICogaW4gdGhlIExpc3QgUmVwb3J0IEZpbHRlciBCYXIuIEl0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgdGhlIGluaXRpYWwgbG9hZCBvciB0byByZWZyZXNoIHRoZVxuXHQgKiBjdXJyZW50bHkgc2hvd24gZGF0YSBiYXNlZCBvbiB0aGUgZmlsdGVycyBlbnRlcmVkIGJ5IHRoZSB1c2VyLlxuXHQgKiBQbGVhc2Ugbm90ZTogVGhlIFByb21pc2UgaXMgcmVzb2x2ZWQgb25jZSB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCBhbmQgbm90IG9uY2UgdGhlIGRhdGEgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI3JlZnJlc2hcblx0ICogQHJldHVybnMgUmVzb2x2ZWQgb25jZSB0aGUgZGF0YSBpcyByZWZyZXNoZWQgb3IgcmVqZWN0ZWQgaWYgdGhlIHJlcXVlc3QgZmFpbGVkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlZnJlc2goKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKSBhcyBhbnk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdHJldHVybiBvRmlsdGVyQmFyLndhaXRGb3JJbml0aWFsaXphdGlvbigpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvRmlsdGVyQmFyLnRyaWdnZXJTZWFyY2goKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBUT0RPOiBpZiB0aGVyZSBpcyBubyBmaWx0ZXIgYmFyLCBtYWtlIHJlZnJlc2ggd29ya1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsaXN0IGVudHJpZXMgY3VycmVudGx5IHNlbGVjdGVkIGZvciB0aGUgZGlzcGxheWVkIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI2dldFNlbGVjdGVkQ29udGV4dHNcblx0ICogQHJldHVybnMgQXJyYXkgY29udGFpbmluZyB0aGUgc2VsZWN0ZWQgY29udGV4dHNcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0U2VsZWN0ZWRDb250ZXh0cygpIHtcblx0XHRjb25zdCBvQ29udHJvbCA9ICgodGhpcy5fY29udHJvbGxlci5faXNNdWx0aU1vZGUoKSAmJlxuXHRcdFx0dGhpcy5fY29udHJvbGxlci5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpPy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpPy5jb250ZW50KSB8fFxuXHRcdFx0dGhpcy5fY29udHJvbGxlci5fZ2V0VGFibGUoKSkgYXMgYW55O1xuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRjb25zdCBhU2VsZWN0ZWRDb250ZXh0cyA9IFtdO1xuXHRcdFx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmdldF9jaGFydCgpKSB7XG5cdFx0XHRcdGNvbnN0IGFTZWxlY3RlZERhdGFQb2ludHMgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0ZWREYXRhKG9Db250cm9sLmdldF9jaGFydCgpKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VsZWN0ZWREYXRhUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMucHVzaChhU2VsZWN0ZWREYXRhUG9pbnRzW2ldLmNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVNlbGVjdGVkQ29udGV4dHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0U2VsZWN0ZWRDb250ZXh0cygpKSB8fCBbXTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmaWx0ZXIgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gcHJvcGVydHkgaW4gdGhlIGZpbHRlciBiYXIuXG5cdCAqIFRoZSBmaWx0ZXIgdmFsdWVzIGNhbiBiZSBlaXRoZXIgYSBzaW5nbGUgdmFsdWUgb3IgYW4gYXJyYXkgb2YgdmFsdWVzLlxuXHQgKiBFYWNoIGZpbHRlciB2YWx1ZSBtdXN0IGJlIHJlcHJlc2VudGVkIGFzIGEgcHJpbWl0aXZlIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbmRpdGlvblBhdGggVGhlIHBhdGggdG8gdGhlIHByb3BlcnR5IGFzIGEgY29uZGl0aW9uIHBhdGhcblx0ICogQHBhcmFtIFtzT3BlcmF0b3JdIFRoZSBvcGVyYXRvciB0byBiZSB1c2VkIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCB0aGUgZGVmYXVsdCBvcGVyYXRvciAoRVEpIHdpbGwgYmUgdXNlZFxuXHQgKiBAcGFyYW0gdlZhbHVlcyBUaGUgdmFsdWVzIHRvIGJlIGFwcGxpZWRcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjc2V0RmlsdGVyVmFsdWVzXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgYXN5bmNocm9ub3VzIGhhbmRsaW5nXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldEZpbHRlclZhbHVlcyhcblx0XHRzQ29uZGl0aW9uUGF0aDogc3RyaW5nLFxuXHRcdHNPcGVyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdHZWYWx1ZXM/OiB1bmRlZmluZWQgfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXVxuXHQpIHtcblx0XHQvLyBUaGUgTGlzdCBSZXBvcnQgaGFzIHR3byBmaWx0ZXIgYmFyczogVGhlIGZpbHRlciBiYXIgaW4gdGhlIGhlYWRlciBhbmQgdGhlIGZpbHRlciBiYXIgaW4gdGhlIFwiQWRhcHQgRmlsdGVyXCIgZGlhbG9nO1xuXHRcdC8vIHdoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQsIHRoZSB1c2VyIGlzIHdvcmtpbmcgd2l0aCB0aGF0IGFjdGl2ZSBjb250cm9sOiBQYXNzIGl0IHRvIHRoZSBzZXRGaWx0ZXJWYWx1ZXMgbWV0aG9kIVxuXHRcdGNvbnN0IGZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sKCkgfHwgdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR2VmFsdWVzID0gc09wZXJhdG9yO1xuXHRcdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyhmaWx0ZXJCYXIsIHNDb25kaXRpb25QYXRoLCB2VmFsdWVzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKGZpbHRlckJhciwgc0NvbmRpdGlvblBhdGgsIHNPcGVyYXRvciwgdlZhbHVlcyk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgY29udmVydHMgZmlsdGVyIGNvbmRpdGlvbnMgdG8gZmlsdGVycy5cblx0ICpcblx0ICogQHBhcmFtIG1GaWx0ZXJDb25kaXRpb25zIE1hcCBjb250YWluaW5nIHRoZSBmaWx0ZXIgY29uZGl0aW9ucyBvZiB0aGUgRmlsdGVyQmFyLlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNjcmVhdGVGaWx0ZXJzRnJvbUZpbHRlckNvbmRpdGlvbnNcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNvbnZlcnRlZCBGaWx0ZXJCYXIgZmlsdGVycy5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Y3JlYXRlRmlsdGVyc0Zyb21GaWx0ZXJDb25kaXRpb25zKG1GaWx0ZXJDb25kaXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXJCYXIsIHVuZGVmaW5lZCwgbUZpbHRlckNvbmRpdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGFsbCB0aGUgbW9kZWwgZmlsdGVycyBmcm9tIHRoZSBmaWx0ZXIgYmFyIHRoYXQgYXJlIGN1cnJlbnRseSBhY3RpdmVcblx0ICogYWxvbmcgd2l0aCB0aGUgc2VhcmNoIGV4cHJlc3Npb24uXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI2dldEZpbHRlcnNcblx0ICogQHJldHVybnMge3tmaWx0ZXJzOiBzYXAudWkubW9kZWwuRmlsdGVyW118dW5kZWZpbmVkLCBzZWFyY2g6IHN0cmluZ3x1bmRlZmluZWR9fSBBbiBhcnJheSBvZiBhY3RpdmUgZmlsdGVycyBhbmQgdGhlIHNlYXJjaCBleHByZXNzaW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRGaWx0ZXJzKCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9jb250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLmdldEZpbHRlcnMob0ZpbHRlckJhcik7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZSBhbiBvcHRpb24gZm9yIHNob3dpbmcgYSBjdXN0b20gbWVzc2FnZSBpbiB0aGUgbWVzc2FnZSBzdHJpcCBhYm92ZSB0aGUgbGlzdCByZXBvcnQgdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbbWVzc2FnZV0gQ3VzdG9tIG1lc3NhZ2UgYWxvbmcgd2l0aCB0aGUgbWVzc2FnZSB0eXBlIHRvIGJlIHNldCBvbiB0aGUgdGFibGUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlLm1lc3NhZ2UgTWVzc2FnZSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkLlxuXHQgKiBAcGFyYW0ge3NhcC51aS5jb3JlLk1lc3NhZ2VUeXBlfSBtZXNzYWdlLnR5cGUgSW5kaWNhdGVzIHRoZSB0eXBlIG9mIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSB7c3RyaW5nW118c3RyaW5nfSBbdGFiS2V5XSBUaGUgdGFiS2V5IGlkZW50aWZ5aW5nIHRoZSB0YWJsZSB3aGVyZSB0aGUgY3VzdG9tIG1lc3NhZ2UgaXMgZGlzcGxheWVkLiBJZiB0YWJLZXkgaXMgZW1wdHksIHRoZSBtZXNzYWdlIGlzIGRpc3BsYXllZCBpbiBhbGwgdGFicyAuIElmIHRhYktleSA9IFsnMScsJzInXSwgdGhlIG1lc3NhZ2UgaXMgZGlzcGxheWVkIGluIHRhYnMgMSBhbmQgMiBvbmx5XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkNsb3NlXSBBIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xvc2VzIHRoZSBtZXNzYWdlIGJhci5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2V0Q3VzdG9tTWVzc2FnZShtZXNzYWdlOiBMUkN1c3RvbU1lc3NhZ2UgfCB1bmRlZmluZWQsIHRhYktleT86IHN0cmluZ1tdIHwgc3RyaW5nIHwgbnVsbCwgb25DbG9zZT86IEZ1bmN0aW9uKSB7XG5cdFx0aWYgKCF0aGlzLkxpc3RSZXBvcnRNZXNzYWdlU3RyaXApIHtcblx0XHRcdHRoaXMuTGlzdFJlcG9ydE1lc3NhZ2VTdHJpcCA9IG5ldyBMUk1lc3NhZ2VTdHJpcCgpO1xuXHRcdH1cblx0XHR0aGlzLkxpc3RSZXBvcnRNZXNzYWdlU3RyaXAuc2hvd0N1c3RvbU1lc3NhZ2UobWVzc2FnZSwgdGhpcy5fY29udHJvbGxlciwgdGFiS2V5LCBvbkNsb3NlKTtcblx0XHRpZiAobWVzc2FnZT8ubWVzc2FnZSkge1xuXHRcdFx0SW52aXNpYmxlTWVzc2FnZS5nZXRJbnN0YW5jZSgpLmFubm91bmNlKG1lc3NhZ2UubWVzc2FnZSwgSW52aXNpYmxlTWVzc2FnZU1vZGUuQXNzZXJ0aXZlKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlzdFJlcG9ydEV4dGVuc2lvbkFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFWQSxJQVlNQSxzQkFBc0IsV0FEM0JDLGNBQWMsQ0FBQywwQ0FBMEMsQ0FBQztJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFNMUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVZDLE9BV0FDLE9BQU8sR0FBUCxtQkFBVTtNQUNULE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNDLFdBQVcsQ0FBQ0Msb0JBQW9CLEVBQVM7TUFDakUsSUFBSUYsVUFBVSxFQUFFO1FBQ2YsT0FBT0EsVUFBVSxDQUFDRyxxQkFBcUIsRUFBRSxDQUFDQyxJQUFJ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