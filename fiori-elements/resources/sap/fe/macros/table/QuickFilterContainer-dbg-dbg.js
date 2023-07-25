/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/StableIdHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/Select", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/core/Item", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ClassSupport, StableIdHelper, ChartUtils, DelegateUtil, TableUtils, SegmentedButton, SegmentedButtonItem, Select, Control, Core, Item, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var generate = StableIdHelper.generate;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const PROPERTY_QUICKFILTER_KEY = "quickFilterKey";
  const FILTER_MODEL = "filters";
  /**
   *  Container Control for Table QuickFilters
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  let QuickFilterContainer = (_dec = defineUI5Class("sap.fe.macros.table.QuickFilterContainer", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    defaultValue: "$auto"
  }), _dec6 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(QuickFilterContainer, _Control);
    function QuickFilterContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showCounts", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "parentEntityType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "batchGroupId", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selector", _descriptor5, _assertThisInitialized(_this));
      _this._attachedToView = false;
      return _this;
    }
    QuickFilterContainer.render = function render(oRm, oControl) {
      const macroBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      oRm.renderControl(oControl.selector);
      oRm.attr("aria-label", macroBundle.getText("M_TABLE_QUICKFILTER_ARIA"));
    };
    var _proto = QuickFilterContainer.prototype;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      this._attachedToView = false;
      this.attachEvent("modelContextChange", this._initControl);
      const oDelegateOnBeforeRendering = {
        onBeforeRendering: () => {
          // Need to wait for Control rendering to get parent view (.i.e into OP the highest parent is the Object Section)
          this._createControlSideEffects();
          this._attachedToView = true;
          this.removeEventDelegate(oDelegateOnBeforeRendering);
        }
      };
      this.addEventDelegate(oDelegateOnBeforeRendering, this);
    };
    _proto._initControl = function _initControl(oEvent) {
      // Need to wait for the OData Model to be propagated (models are propagated one by one when we come from FLP)
      if (this.getModel()) {
        this.detachEvent(oEvent.getId(), this._initControl);
        this._manageTable();
        this._createContent();
      }
    };
    _proto._manageTable = function _manageTable() {
      var _this$_oTable, _this$_oTable$getPare;
      let oControl = this.getParent();
      const oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        sDefaultFilter = Array.isArray(aFilters) && aFilters.length > 0 ? aFilters[0].annotationPath : undefined;
      while (oControl && !oControl.isA("sap.ui.mdc.Table")) {
        oControl = oControl.getParent();
      }
      this._oTable = oControl;
      const FilterControl = Core.byId(this._oTable.getFilter());
      if (FilterControl && FilterControl.isA("sap.ui.mdc.FilterBar")) {
        FilterControl.attachFiltersChanged(this._onFiltersChanged.bind(this));
      }
      (_this$_oTable = this._oTable) === null || _this$_oTable === void 0 ? void 0 : (_this$_oTable$getPare = _this$_oTable.getParent()) === null || _this$_oTable$getPare === void 0 ? void 0 : _this$_oTable$getPare.attachEvent("internalDataRequested", this._onTableDataRequested.bind(this));
      DelegateUtil.setCustomData(oControl, PROPERTY_QUICKFILTER_KEY, sDefaultFilter);
    };
    _proto._onFiltersChanged = function _onFiltersChanged(event) {
      if (event.getParameter("conditionsBased")) {
        this.selector.setProperty("enabled", false);
      }
    };
    _proto._onTableDataRequested = function _onTableDataRequested() {
      this.selector.setProperty("enabled", true);
      if (this.showCounts) {
        this._updateCounts();
      }
    };
    _proto.setSelectorKey = function setSelectorKey(sKey) {
      const oSelector = this.selector;
      if (oSelector && oSelector.getSelectedKey() !== sKey) {
        oSelector.setSelectedKey(sKey);
        DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, sKey);

        // Rebind the table to reflect the change in quick filter key.
        // We don't rebind the table if the filterbar for the table is suspended
        // as rebind will be done when the filterbar is resumed
        const sFilterBarID = this._oTable.getFilter && this._oTable.getFilter();
        const oFilterBar = sFilterBarID && Core.byId(sFilterBarID);
        const bSkipRebind = oFilterBar && oFilterBar.getSuspendSelection && oFilterBar.getSuspendSelection();
        if (!bSkipRebind) {
          this._oTable.rebind();
        }
      }
    };
    _proto.getSelectorKey = function getSelectorKey() {
      const oSelector = this.selector;
      return oSelector ? oSelector.getSelectedKey() : null;
    };
    _proto.getDomRef = function getDomRef(sSuffix) {
      const oSelector = this.selector;
      return oSelector ? oSelector.getDomRef(sSuffix) : null;
    };
    _proto._getFilterModel = function _getFilterModel() {
      let oModel = this.getModel(FILTER_MODEL);
      if (!oModel) {
        const mFilters = DelegateUtil.getCustomData(this, FILTER_MODEL);
        oModel = new JSONModel(mFilters);
        this.setModel(oModel, FILTER_MODEL);
      }
      return oModel;
    }

    /**
     * Create QuickFilter Selector (Select or SegmentedButton).
     */;
    _proto._createContent = function _createContent() {
      const oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        bIsSelect = aFilters.length > 3,
        mSelectorOptions = {
          id: generate([this._oTable.getId(), "QuickFilter"]),
          enabled: oModel.getObject("/enabled"),
          items: {
            path: `${FILTER_MODEL}>/paths`,
            factory: (sId, oBindingContext) => {
              const mItemOptions = {
                key: oBindingContext.getObject().annotationPath,
                text: this._getSelectorItemText(oBindingContext)
              };
              return bIsSelect ? new Item(mItemOptions) : new SegmentedButtonItem(mItemOptions);
            }
          }
        };
      if (bIsSelect) {
        mSelectorOptions.autoAdjustWidth = true;
      }
      mSelectorOptions[bIsSelect ? "change" : "selectionChange"] = this._onSelectionChange.bind(this);
      this.selector = bIsSelect ? new Select(mSelectorOptions) : new SegmentedButton(mSelectorOptions);
    }

    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {object} Returns the configuration of IOverflowToolbarContent
     */;
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: true
      };
    }

    /**
     * Creates SideEffects control that must be executed when table cells that are related to configured filter(s) change.
     *
     */;
    _proto._createControlSideEffects = function _createControlSideEffects() {
      const oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        sTableNavigationPath = DelegateUtil.getCustomData(this._oTable, "navigationPath");
      /**
       * Cannot execute SideEffects with targetEntity = current Table collection
       */

      if (sTableNavigationPath) {
        var _this$_getSideEffectC;
        const aSourceProperties = [];
        for (const k in oSvItems) {
          const sItemKey = oSvItems[k].getKey(),
            oFilterInfos = CommonUtils.getFiltersInfoForSV(this._oTable, sItemKey);
          oFilterInfos.properties.forEach(function (sProperty) {
            const sPropertyPath = `${sTableNavigationPath}/${sProperty}`;
            if (!aSourceProperties.includes(sPropertyPath)) {
              aSourceProperties.push(sPropertyPath);
            }
          });
        }
        (_this$_getSideEffectC = this._getSideEffectController()) === null || _this$_getSideEffectC === void 0 ? void 0 : _this$_getSideEffectC.addControlSideEffects(this.parentEntityType, {
          sourceProperties: aSourceProperties,
          targetEntities: [{
            $NavigationPropertyPath: sTableNavigationPath
          }],
          sourceControlId: this.getId()
        });
      }
    };
    _proto._getSelectorItemText = function _getSelectorItemText(oItemContext) {
      const annotationPath = oItemContext.getObject().annotationPath,
        itemPath = oItemContext.getPath(),
        oMetaModel = this.getModel().getMetaModel(),
        oQuickFilter = oMetaModel.getObject(`${this.entitySet}/${annotationPath}`);
      return oQuickFilter.Text + (this.showCounts ? ` ({${FILTER_MODEL}>${itemPath}/count})` : "");
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      const oController = this._getViewController();
      return oController ? oController._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const oView = CommonUtils.getTargetView(this);
      return oView && oView.getController();
    }

    /**
     * Manage List Binding request related to Counts on QuickFilter control and update text
     * in line with batch result.
     *
     */;
    _proto._updateCounts = function _updateCounts() {
      const oTable = this._oTable,
        oController = this._getViewController(),
        oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        oModel = this._getFilterModel(),
        aBindingPromises = [],
        aInitialItemTexts = [];
      let aAdditionalFilters = [];
      let aChartFilters = [];
      const sCurrentFilterKey = DelegateUtil.getCustomData(oTable, PROPERTY_QUICKFILTER_KEY);

      // Add filters related to the chart for ALP
      if (oController && oController.getChartControl) {
        const oChart = oController.getChartControl();
        if (oChart) {
          const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart);
          if (oChartFilterInfo && oChartFilterInfo.filters.length) {
            aChartFilters = CommonUtils.getChartPropertiesWithoutPrefixes(oChartFilterInfo.filters);
          }
        }
        aAdditionalFilters = ChartUtils.getChartSelectionsExist(oChart, oTable) ? aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable)).concat(aChartFilters) : aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable));
      }
      for (const k in oSvItems) {
        const sItemKey = oSvItems[k].getKey(),
          oFilterInfos = CommonUtils.getFiltersInfoForSV(oTable, sItemKey);
        aInitialItemTexts.push(oFilterInfos.text);
        oModel.setProperty(`/paths/${k}/count`, "...");
        aBindingPromises.push(TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
          batchGroupId: sItemKey === sCurrentFilterKey ? this.batchGroupId : "$auto",
          additionalFilters: aAdditionalFilters.concat(oFilterInfos.filters)
        }));
      }
      Promise.all(aBindingPromises).then(function (aCounts) {
        for (const k in aCounts) {
          oModel.setProperty(`/paths/${k}/count`, TableUtils.getCountFormatted(aCounts[k]));
        }
      }).catch(function (oError) {
        Log.error("Error while retrieving the binding promises", oError);
      });
    };
    _proto._onSelectionChange = function _onSelectionChange(oEvent) {
      const oControl = oEvent.getSource();
      DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, oControl.getSelectedKey());
      this._oTable.rebind();
      const oController = this._getViewController();
      if (oController && oController.getExtensionAPI && oController.getExtensionAPI().updateAppState) {
        oController.getExtensionAPI().updateAppState();
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      if (this._attachedToView) {
        const oSideEffects = this._getSideEffectController();
        if (oSideEffects) {
          // if "destroy" signal comes when view is destroyed there is not anymore reference to Controller Extension
          oSideEffects.removeControlSideEffects(this);
        }
      }
      delete this._oTable;
      _Control.prototype.destroy.call(this, bSuppressInvalidate);
    };
    return QuickFilterContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showCounts", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "parentEntityType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "batchGroupId", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "selector", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return QuickFilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVkiLCJGSUxURVJfTU9ERUwiLCJRdWlja0ZpbHRlckNvbnRhaW5lciIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJfYXR0YWNoZWRUb1ZpZXciLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm1hY3JvQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInJlbmRlckNvbnRyb2wiLCJzZWxlY3RvciIsImF0dHIiLCJnZXRUZXh0IiwiaW5pdCIsImF0dGFjaEV2ZW50IiwiX2luaXRDb250cm9sIiwib0RlbGVnYXRlT25CZWZvcmVSZW5kZXJpbmciLCJvbkJlZm9yZVJlbmRlcmluZyIsIl9jcmVhdGVDb250cm9sU2lkZUVmZmVjdHMiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9FdmVudCIsImdldE1vZGVsIiwiZGV0YWNoRXZlbnQiLCJnZXRJZCIsIl9tYW5hZ2VUYWJsZSIsIl9jcmVhdGVDb250ZW50IiwiZ2V0UGFyZW50Iiwib01vZGVsIiwiX2dldEZpbHRlck1vZGVsIiwiYUZpbHRlcnMiLCJnZXRPYmplY3QiLCJzRGVmYXVsdEZpbHRlciIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImFubm90YXRpb25QYXRoIiwidW5kZWZpbmVkIiwiaXNBIiwiX29UYWJsZSIsIkZpbHRlckNvbnRyb2wiLCJieUlkIiwiZ2V0RmlsdGVyIiwiYXR0YWNoRmlsdGVyc0NoYW5nZWQiLCJfb25GaWx0ZXJzQ2hhbmdlZCIsImJpbmQiLCJfb25UYWJsZURhdGFSZXF1ZXN0ZWQiLCJEZWxlZ2F0ZVV0aWwiLCJzZXRDdXN0b21EYXRhIiwiZXZlbnQiLCJnZXRQYXJhbWV0ZXIiLCJzZXRQcm9wZXJ0eSIsInNob3dDb3VudHMiLCJfdXBkYXRlQ291bnRzIiwic2V0U2VsZWN0b3JLZXkiLCJzS2V5Iiwib1NlbGVjdG9yIiwiZ2V0U2VsZWN0ZWRLZXkiLCJzZXRTZWxlY3RlZEtleSIsInNGaWx0ZXJCYXJJRCIsIm9GaWx0ZXJCYXIiLCJiU2tpcFJlYmluZCIsImdldFN1c3BlbmRTZWxlY3Rpb24iLCJyZWJpbmQiLCJnZXRTZWxlY3RvcktleSIsImdldERvbVJlZiIsInNTdWZmaXgiLCJtRmlsdGVycyIsImdldEN1c3RvbURhdGEiLCJKU09OTW9kZWwiLCJzZXRNb2RlbCIsImJJc1NlbGVjdCIsIm1TZWxlY3Rvck9wdGlvbnMiLCJpZCIsImdlbmVyYXRlIiwiZW5hYmxlZCIsIml0ZW1zIiwicGF0aCIsImZhY3RvcnkiLCJzSWQiLCJvQmluZGluZ0NvbnRleHQiLCJtSXRlbU9wdGlvbnMiLCJrZXkiLCJ0ZXh0IiwiX2dldFNlbGVjdG9ySXRlbVRleHQiLCJJdGVtIiwiU2VnbWVudGVkQnV0dG9uSXRlbSIsImF1dG9BZGp1c3RXaWR0aCIsIl9vblNlbGVjdGlvbkNoYW5nZSIsIlNlbGVjdCIsIlNlZ21lbnRlZEJ1dHRvbiIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwib1N2Q29udHJvbCIsIm9Tdkl0ZW1zIiwiZ2V0SXRlbXMiLCJzVGFibGVOYXZpZ2F0aW9uUGF0aCIsImFTb3VyY2VQcm9wZXJ0aWVzIiwiayIsInNJdGVtS2V5IiwiZ2V0S2V5Iiwib0ZpbHRlckluZm9zIiwiQ29tbW9uVXRpbHMiLCJnZXRGaWx0ZXJzSW5mb0ZvclNWIiwicHJvcGVydGllcyIsImZvckVhY2giLCJzUHJvcGVydHkiLCJzUHJvcGVydHlQYXRoIiwiaW5jbHVkZXMiLCJwdXNoIiwiX2dldFNpZGVFZmZlY3RDb250cm9sbGVyIiwiYWRkQ29udHJvbFNpZGVFZmZlY3RzIiwicGFyZW50RW50aXR5VHlwZSIsInNvdXJjZVByb3BlcnRpZXMiLCJ0YXJnZXRFbnRpdGllcyIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwic291cmNlQ29udHJvbElkIiwib0l0ZW1Db250ZXh0IiwiaXRlbVBhdGgiLCJnZXRQYXRoIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIm9RdWlja0ZpbHRlciIsImVudGl0eVNldCIsIlRleHQiLCJvQ29udHJvbGxlciIsIl9nZXRWaWV3Q29udHJvbGxlciIsIl9zaWRlRWZmZWN0cyIsIm9WaWV3IiwiZ2V0VGFyZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJvVGFibGUiLCJhQmluZGluZ1Byb21pc2VzIiwiYUluaXRpYWxJdGVtVGV4dHMiLCJhQWRkaXRpb25hbEZpbHRlcnMiLCJhQ2hhcnRGaWx0ZXJzIiwic0N1cnJlbnRGaWx0ZXJLZXkiLCJnZXRDaGFydENvbnRyb2wiLCJvQ2hhcnQiLCJvQ2hhcnRGaWx0ZXJJbmZvIiwiQ2hhcnRVdGlscyIsImdldEFsbEZpbHRlckluZm8iLCJmaWx0ZXJzIiwiZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzIiwiZ2V0Q2hhcnRTZWxlY3Rpb25zRXhpc3QiLCJjb25jYXQiLCJUYWJsZVV0aWxzIiwiZ2V0SGlkZGVuRmlsdGVycyIsImdldExpc3RCaW5kaW5nRm9yQ291bnQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImJhdGNoR3JvdXBJZCIsImFkZGl0aW9uYWxGaWx0ZXJzIiwiUHJvbWlzZSIsImFsbCIsInRoZW4iLCJhQ291bnRzIiwiZ2V0Q291bnRGb3JtYXR0ZWQiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiZ2V0U291cmNlIiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJkZXN0cm95IiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIm9TaWRlRWZmZWN0cyIsInJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlF1aWNrRmlsdGVyQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENoYXJ0VXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRVdGlsc1wiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgU2VnbWVudGVkQnV0dG9uIGZyb20gXCJzYXAvbS9TZWdtZW50ZWRCdXR0b25cIjtcbmltcG9ydCBTZWdtZW50ZWRCdXR0b25JdGVtIGZyb20gXCJzYXAvbS9TZWdtZW50ZWRCdXR0b25JdGVtXCI7XG5pbXBvcnQgU2VsZWN0IGZyb20gXCJzYXAvbS9TZWxlY3RcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgSXRlbSBmcm9tIFwic2FwL3VpL2NvcmUvSXRlbVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5jb25zdCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVkgPSBcInF1aWNrRmlsdGVyS2V5XCI7XG5jb25zdCBGSUxURVJfTU9ERUwgPSBcImZpbHRlcnNcIjtcbi8qKlxuICogIENvbnRhaW5lciBDb250cm9sIGZvciBUYWJsZSBRdWlja0ZpbHRlcnNcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlF1aWNrRmlsdGVyQ29udGFpbmVyXCIsIHtcblx0aW50ZXJmYWNlczogW1wic2FwLm0uSU92ZXJmbG93VG9vbGJhckNvbnRlbnRcIl1cbn0pXG5jbGFzcyBRdWlja0ZpbHRlckNvbnRhaW5lciBleHRlbmRzIENvbnRyb2wge1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KSBzaG93Q291bnRzITogYm9vbGVhbjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGVudGl0eVNldCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHBhcmVudEVudGl0eVR5cGUhOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIiRhdXRvXCIgfSlcblx0YmF0Y2hHcm91cElkITogc3RyaW5nO1xuXG5cdEBhZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsXG5cdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdGlzRGVmYXVsdDogdHJ1ZVxuXHR9KVxuXHRzZWxlY3RvciE6IFNlbGVjdCB8IFNlZ21lbnRlZEJ1dHRvbjtcblxuXHRwcml2YXRlIF9vVGFibGU/OiBUYWJsZTtcblxuXHRwcml2YXRlIF9hdHRhY2hlZFRvVmlldzogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdHN0YXRpYyByZW5kZXIob1JtOiBSZW5kZXJNYW5hZ2VyLCBvQ29udHJvbDogUXVpY2tGaWx0ZXJDb250YWluZXIpIHtcblx0XHRjb25zdCBtYWNyb0J1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHRvUm0ucmVuZGVyQ29udHJvbChvQ29udHJvbC5zZWxlY3Rvcik7XG5cdFx0b1JtLmF0dHIoXCJhcmlhLWxhYmVsXCIsIG1hY3JvQnVuZGxlLmdldFRleHQoXCJNX1RBQkxFX1FVSUNLRklMVEVSX0FSSUFcIikpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0dGhpcy5fYXR0YWNoZWRUb1ZpZXcgPSBmYWxzZTtcblx0XHR0aGlzLmF0dGFjaEV2ZW50KFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsIHRoaXMuX2luaXRDb250cm9sKTtcblx0XHRjb25zdCBvRGVsZWdhdGVPbkJlZm9yZVJlbmRlcmluZyA9IHtcblx0XHRcdG9uQmVmb3JlUmVuZGVyaW5nOiAoKSA9PiB7XG5cdFx0XHRcdC8vIE5lZWQgdG8gd2FpdCBmb3IgQ29udHJvbCByZW5kZXJpbmcgdG8gZ2V0IHBhcmVudCB2aWV3ICguaS5lIGludG8gT1AgdGhlIGhpZ2hlc3QgcGFyZW50IGlzIHRoZSBPYmplY3QgU2VjdGlvbilcblx0XHRcdFx0dGhpcy5fY3JlYXRlQ29udHJvbFNpZGVFZmZlY3RzKCk7XG5cdFx0XHRcdHRoaXMuX2F0dGFjaGVkVG9WaWV3ID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5yZW1vdmVFdmVudERlbGVnYXRlKG9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuYWRkRXZlbnREZWxlZ2F0ZShvRGVsZWdhdGVPbkJlZm9yZVJlbmRlcmluZywgdGhpcyk7XG5cdH1cblxuXHRfaW5pdENvbnRyb2wob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBOZWVkIHRvIHdhaXQgZm9yIHRoZSBPRGF0YSBNb2RlbCB0byBiZSBwcm9wYWdhdGVkIChtb2RlbHMgYXJlIHByb3BhZ2F0ZWQgb25lIGJ5IG9uZSB3aGVuIHdlIGNvbWUgZnJvbSBGTFApXG5cdFx0aWYgKHRoaXMuZ2V0TW9kZWwoKSkge1xuXHRcdFx0dGhpcy5kZXRhY2hFdmVudChvRXZlbnQuZ2V0SWQoKSwgdGhpcy5faW5pdENvbnRyb2wpO1xuXHRcdFx0dGhpcy5fbWFuYWdlVGFibGUoKTtcblx0XHRcdHRoaXMuX2NyZWF0ZUNvbnRlbnQoKTtcblx0XHR9XG5cdH1cblxuXHRfbWFuYWdlVGFibGUoKSB7XG5cdFx0bGV0IG9Db250cm9sID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRGaWx0ZXJNb2RlbCgpLFxuXHRcdFx0YUZpbHRlcnMgPSBvTW9kZWwuZ2V0T2JqZWN0KFwiL3BhdGhzXCIpLFxuXHRcdFx0c0RlZmF1bHRGaWx0ZXIgPSBBcnJheS5pc0FycmF5KGFGaWx0ZXJzKSAmJiBhRmlsdGVycy5sZW5ndGggPiAwID8gYUZpbHRlcnNbMF0uYW5ub3RhdGlvblBhdGggOiB1bmRlZmluZWQ7XG5cblx0XHR3aGlsZSAob0NvbnRyb2wgJiYgIW9Db250cm9sLmlzQTxUYWJsZT4oXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHR0aGlzLl9vVGFibGUgPSBvQ29udHJvbCE7XG5cblx0XHRjb25zdCBGaWx0ZXJDb250cm9sID0gQ29yZS5ieUlkKHRoaXMuX29UYWJsZS5nZXRGaWx0ZXIoKSk7XG5cdFx0aWYgKEZpbHRlckNvbnRyb2wgJiYgRmlsdGVyQ29udHJvbC5pc0E8RmlsdGVyQmFyPihcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRGaWx0ZXJDb250cm9sLmF0dGFjaEZpbHRlcnNDaGFuZ2VkKHRoaXMuX29uRmlsdGVyc0NoYW5nZWQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdHRoaXMuX29UYWJsZT8uZ2V0UGFyZW50KCk/LmF0dGFjaEV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIsIHRoaXMuX29uVGFibGVEYXRhUmVxdWVzdGVkLmJpbmQodGhpcykpO1xuXHRcdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKG9Db250cm9sLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVksIHNEZWZhdWx0RmlsdGVyKTtcblx0fVxuXG5cdF9vbkZpbHRlcnNDaGFuZ2VkKGV2ZW50OiBVSTVFdmVudCkge1xuXHRcdGlmIChldmVudC5nZXRQYXJhbWV0ZXIoXCJjb25kaXRpb25zQmFzZWRcIikpIHtcblx0XHRcdHRoaXMuc2VsZWN0b3Iuc2V0UHJvcGVydHkoXCJlbmFibGVkXCIsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRfb25UYWJsZURhdGFSZXF1ZXN0ZWQoKSB7XG5cdFx0dGhpcy5zZWxlY3Rvci5zZXRQcm9wZXJ0eShcImVuYWJsZWRcIiwgdHJ1ZSk7XG5cdFx0aWYgKHRoaXMuc2hvd0NvdW50cykge1xuXHRcdFx0dGhpcy5fdXBkYXRlQ291bnRzKCk7XG5cdFx0fVxuXHR9XG5cblx0c2V0U2VsZWN0b3JLZXkoc0tleTogYW55KSB7XG5cdFx0Y29uc3Qgb1NlbGVjdG9yID0gdGhpcy5zZWxlY3Rvcjtcblx0XHRpZiAob1NlbGVjdG9yICYmIG9TZWxlY3Rvci5nZXRTZWxlY3RlZEtleSgpICE9PSBzS2V5KSB7XG5cdFx0XHRvU2VsZWN0b3Iuc2V0U2VsZWN0ZWRLZXkoc0tleSk7XG5cdFx0XHREZWxlZ2F0ZVV0aWwuc2V0Q3VzdG9tRGF0YSh0aGlzLl9vVGFibGUsIFBST1BFUlRZX1FVSUNLRklMVEVSX0tFWSwgc0tleSk7XG5cblx0XHRcdC8vIFJlYmluZCB0aGUgdGFibGUgdG8gcmVmbGVjdCB0aGUgY2hhbmdlIGluIHF1aWNrIGZpbHRlciBrZXkuXG5cdFx0XHQvLyBXZSBkb24ndCByZWJpbmQgdGhlIHRhYmxlIGlmIHRoZSBmaWx0ZXJiYXIgZm9yIHRoZSB0YWJsZSBpcyBzdXNwZW5kZWRcblx0XHRcdC8vIGFzIHJlYmluZCB3aWxsIGJlIGRvbmUgd2hlbiB0aGUgZmlsdGVyYmFyIGlzIHJlc3VtZWRcblx0XHRcdGNvbnN0IHNGaWx0ZXJCYXJJRCA9IHRoaXMuX29UYWJsZSEuZ2V0RmlsdGVyICYmIHRoaXMuX29UYWJsZSEuZ2V0RmlsdGVyKCk7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gc0ZpbHRlckJhcklEICYmIChDb3JlLmJ5SWQoc0ZpbHRlckJhcklEKSBhcyBGaWx0ZXJCYXIpO1xuXHRcdFx0Y29uc3QgYlNraXBSZWJpbmQgPSBvRmlsdGVyQmFyICYmIG9GaWx0ZXJCYXIuZ2V0U3VzcGVuZFNlbGVjdGlvbiAmJiBvRmlsdGVyQmFyLmdldFN1c3BlbmRTZWxlY3Rpb24oKTtcblxuXHRcdFx0aWYgKCFiU2tpcFJlYmluZCkge1xuXHRcdFx0XHQodGhpcy5fb1RhYmxlIGFzIGFueSkucmViaW5kKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0U2VsZWN0b3JLZXkoKSB7XG5cdFx0Y29uc3Qgb1NlbGVjdG9yID0gdGhpcy5zZWxlY3Rvcjtcblx0XHRyZXR1cm4gb1NlbGVjdG9yID8gb1NlbGVjdG9yLmdldFNlbGVjdGVkS2V5KCkgOiBudWxsO1xuXHR9XG5cblx0Z2V0RG9tUmVmKHNTdWZmaXg/OiBzdHJpbmcpIHtcblx0XHRjb25zdCBvU2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yO1xuXHRcdHJldHVybiBvU2VsZWN0b3IgPyBvU2VsZWN0b3IuZ2V0RG9tUmVmKHNTdWZmaXgpIDogKG51bGwgYXMgYW55KTtcblx0fVxuXG5cdF9nZXRGaWx0ZXJNb2RlbCgpIHtcblx0XHRsZXQgb01vZGVsID0gdGhpcy5nZXRNb2RlbChGSUxURVJfTU9ERUwpO1xuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHRjb25zdCBtRmlsdGVycyA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRoaXMsIEZJTFRFUl9NT0RFTCk7XG5cdFx0XHRvTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1GaWx0ZXJzKTtcblx0XHRcdHRoaXMuc2V0TW9kZWwob01vZGVsLCBGSUxURVJfTU9ERUwpO1xuXHRcdH1cblx0XHRyZXR1cm4gb01vZGVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBRdWlja0ZpbHRlciBTZWxlY3RvciAoU2VsZWN0IG9yIFNlZ21lbnRlZEJ1dHRvbikuXG5cdCAqL1xuXHRfY3JlYXRlQ29udGVudCgpIHtcblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRGaWx0ZXJNb2RlbCgpLFxuXHRcdFx0YUZpbHRlcnMgPSBvTW9kZWwuZ2V0T2JqZWN0KFwiL3BhdGhzXCIpLFxuXHRcdFx0YklzU2VsZWN0ID0gYUZpbHRlcnMubGVuZ3RoID4gMyxcblx0XHRcdG1TZWxlY3Rvck9wdGlvbnM6IGFueSA9IHtcblx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLl9vVGFibGUhLmdldElkKCksIFwiUXVpY2tGaWx0ZXJcIl0pLFxuXHRcdFx0XHRlbmFibGVkOiBvTW9kZWwuZ2V0T2JqZWN0KFwiL2VuYWJsZWRcIiksXG5cdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0cGF0aDogYCR7RklMVEVSX01PREVMfT4vcGF0aHNgLFxuXHRcdFx0XHRcdGZhY3Rvcnk6IChzSWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IG1JdGVtT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0a2V5OiBvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCkuYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IHRoaXMuX2dldFNlbGVjdG9ySXRlbVRleHQob0JpbmRpbmdDb250ZXh0KVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJldHVybiBiSXNTZWxlY3QgPyBuZXcgSXRlbShtSXRlbU9wdGlvbnMpIDogbmV3IFNlZ21lbnRlZEJ1dHRvbkl0ZW0obUl0ZW1PcHRpb25zKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0aWYgKGJJc1NlbGVjdCkge1xuXHRcdFx0bVNlbGVjdG9yT3B0aW9ucy5hdXRvQWRqdXN0V2lkdGggPSB0cnVlO1xuXHRcdH1cblx0XHRtU2VsZWN0b3JPcHRpb25zW2JJc1NlbGVjdCA/IFwiY2hhbmdlXCIgOiBcInNlbGVjdGlvbkNoYW5nZVwiXSA9IHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5zZWxlY3RvciA9IGJJc1NlbGVjdCA/IG5ldyBTZWxlY3QobVNlbGVjdG9yT3B0aW9ucykgOiBuZXcgU2VnbWVudGVkQnV0dG9uKG1TZWxlY3Rvck9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcHJvcGVydGllcyBmb3IgdGhlIGludGVyZmFjZSBJT3ZlcmZsb3dUb29sYmFyQ29udGVudC5cblx0ICpcblx0ICogQHJldHVybnMge29iamVjdH0gUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvZiBJT3ZlcmZsb3dUb29sYmFyQ29udGVudFxuXHQgKi9cblx0Z2V0T3ZlcmZsb3dUb29sYmFyQ29uZmlnKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjYW5PdmVyZmxvdzogdHJ1ZVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBTaWRlRWZmZWN0cyBjb250cm9sIHRoYXQgbXVzdCBiZSBleGVjdXRlZCB3aGVuIHRhYmxlIGNlbGxzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gY29uZmlndXJlZCBmaWx0ZXIocykgY2hhbmdlLlxuXHQgKlxuXHQgKi9cblxuXHRfY3JlYXRlQ29udHJvbFNpZGVFZmZlY3RzKCkge1xuXHRcdGNvbnN0IG9TdkNvbnRyb2wgPSB0aGlzLnNlbGVjdG9yLFxuXHRcdFx0b1N2SXRlbXMgPSBvU3ZDb250cm9sLmdldEl0ZW1zKCksXG5cdFx0XHRzVGFibGVOYXZpZ2F0aW9uUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRoaXMuX29UYWJsZSwgXCJuYXZpZ2F0aW9uUGF0aFwiKTtcblx0XHQvKipcblx0XHQgKiBDYW5ub3QgZXhlY3V0ZSBTaWRlRWZmZWN0cyB3aXRoIHRhcmdldEVudGl0eSA9IGN1cnJlbnQgVGFibGUgY29sbGVjdGlvblxuXHRcdCAqL1xuXG5cdFx0aWYgKHNUYWJsZU5hdmlnYXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBhU291cmNlUHJvcGVydGllczogYW55W10gPSBbXTtcblx0XHRcdGZvciAoY29uc3QgayBpbiBvU3ZJdGVtcykge1xuXHRcdFx0XHRjb25zdCBzSXRlbUtleSA9IG9Tdkl0ZW1zW2tdLmdldEtleSgpLFxuXHRcdFx0XHRcdG9GaWx0ZXJJbmZvcyA9IENvbW1vblV0aWxzLmdldEZpbHRlcnNJbmZvRm9yU1YodGhpcy5fb1RhYmxlISwgc0l0ZW1LZXkpO1xuXHRcdFx0XHRvRmlsdGVySW5mb3MucHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHk6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBgJHtzVGFibGVOYXZpZ2F0aW9uUGF0aH0vJHtzUHJvcGVydHl9YDtcblx0XHRcdFx0XHRpZiAoIWFTb3VyY2VQcm9wZXJ0aWVzLmluY2x1ZGVzKHNQcm9wZXJ0eVBhdGgpKSB7XG5cdFx0XHRcdFx0XHRhU291cmNlUHJvcGVydGllcy5wdXNoKHNQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9nZXRTaWRlRWZmZWN0Q29udHJvbGxlcigpPy5hZGRDb250cm9sU2lkZUVmZmVjdHModGhpcy5wYXJlbnRFbnRpdHlUeXBlLCB7XG5cdFx0XHRcdHNvdXJjZVByb3BlcnRpZXM6IGFTb3VyY2VQcm9wZXJ0aWVzLFxuXHRcdFx0XHR0YXJnZXRFbnRpdGllczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzVGFibGVOYXZpZ2F0aW9uUGF0aFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XSxcblx0XHRcdFx0c291cmNlQ29udHJvbElkOiB0aGlzLmdldElkKClcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRTZWxlY3Rvckl0ZW1UZXh0KG9JdGVtQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBvSXRlbUNvbnRleHQuZ2V0T2JqZWN0KCkuYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRpdGVtUGF0aCA9IG9JdGVtQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpISxcblx0XHRcdG9RdWlja0ZpbHRlciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3RoaXMuZW50aXR5U2V0fS8ke2Fubm90YXRpb25QYXRofWApO1xuXHRcdHJldHVybiBvUXVpY2tGaWx0ZXIuVGV4dCArICh0aGlzLnNob3dDb3VudHMgPyBgICh7JHtGSUxURVJfTU9ERUx9PiR7aXRlbVBhdGh9L2NvdW50fSlgIDogXCJcIik7XG5cdH1cblxuXHRfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIoKSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRWaWV3Q29udHJvbGxlcigpO1xuXHRcdHJldHVybiBvQ29udHJvbGxlciA/IG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cyA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdF9nZXRWaWV3Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0cmV0dXJuIG9WaWV3ICYmIChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZSBMaXN0IEJpbmRpbmcgcmVxdWVzdCByZWxhdGVkIHRvIENvdW50cyBvbiBRdWlja0ZpbHRlciBjb250cm9sIGFuZCB1cGRhdGUgdGV4dFxuXHQgKiBpbiBsaW5lIHdpdGggYmF0Y2ggcmVzdWx0LlxuXHQgKlxuXHQgKi9cblx0X3VwZGF0ZUNvdW50cygpIHtcblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9vVGFibGUsXG5cdFx0XHRvQ29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCkgYXMgYW55LFxuXHRcdFx0b1N2Q29udHJvbCA9IHRoaXMuc2VsZWN0b3IsXG5cdFx0XHRvU3ZJdGVtcyA9IG9TdkNvbnRyb2wuZ2V0SXRlbXMoKSxcblx0XHRcdG9Nb2RlbDogYW55ID0gdGhpcy5fZ2V0RmlsdGVyTW9kZWwoKSxcblx0XHRcdGFCaW5kaW5nUHJvbWlzZXMgPSBbXSxcblx0XHRcdGFJbml0aWFsSXRlbVRleHRzOiBhbnlbXSA9IFtdO1xuXHRcdGxldCBhQWRkaXRpb25hbEZpbHRlcnM6IGFueVtdID0gW107XG5cdFx0bGV0IGFDaGFydEZpbHRlcnM6IHsgc1BhdGg6IHN0cmluZyB9W10gPSBbXTtcblx0XHRjb25zdCBzQ3VycmVudEZpbHRlcktleSA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgUFJPUEVSVFlfUVVJQ0tGSUxURVJfS0VZKTtcblxuXHRcdC8vIEFkZCBmaWx0ZXJzIHJlbGF0ZWQgdG8gdGhlIGNoYXJ0IGZvciBBTFBcblx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIuZ2V0Q2hhcnRDb250cm9sKSB7XG5cdFx0XHRjb25zdCBvQ2hhcnQgPSBvQ29udHJvbGxlci5nZXRDaGFydENvbnRyb2woKTtcblx0XHRcdGlmIChvQ2hhcnQpIHtcblx0XHRcdFx0Y29uc3Qgb0NoYXJ0RmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvQ2hhcnQpO1xuXHRcdFx0XHRpZiAob0NoYXJ0RmlsdGVySW5mbyAmJiBvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YUNoYXJ0RmlsdGVycyA9IENvbW1vblV0aWxzLmdldENoYXJ0UHJvcGVydGllc1dpdGhvdXRQcmVmaXhlcyhvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRhQWRkaXRpb25hbEZpbHRlcnMgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0aW9uc0V4aXN0KG9DaGFydCwgb1RhYmxlKVxuXHRcdFx0XHQ/IGFBZGRpdGlvbmFsRmlsdGVycy5jb25jYXQoVGFibGVVdGlscy5nZXRIaWRkZW5GaWx0ZXJzKG9UYWJsZSEpKS5jb25jYXQoYUNoYXJ0RmlsdGVycylcblx0XHRcdFx0OiBhQWRkaXRpb25hbEZpbHRlcnMuY29uY2F0KFRhYmxlVXRpbHMuZ2V0SGlkZGVuRmlsdGVycyhvVGFibGUhKSk7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBrIGluIG9Tdkl0ZW1zKSB7XG5cdFx0XHRjb25zdCBzSXRlbUtleSA9IG9Tdkl0ZW1zW2tdLmdldEtleSgpLFxuXHRcdFx0XHRvRmlsdGVySW5mb3MgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZSEsIHNJdGVtS2V5KTtcblx0XHRcdGFJbml0aWFsSXRlbVRleHRzLnB1c2gob0ZpbHRlckluZm9zLnRleHQpO1xuXHRcdFx0b01vZGVsLnNldFByb3BlcnR5KGAvcGF0aHMvJHtrfS9jb3VudGAsIFwiLi4uXCIpO1xuXHRcdFx0YUJpbmRpbmdQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRUYWJsZVV0aWxzLmdldExpc3RCaW5kaW5nRm9yQ291bnQob1RhYmxlISwgb1RhYmxlIS5nZXRCaW5kaW5nQ29udGV4dCgpLCB7XG5cdFx0XHRcdFx0YmF0Y2hHcm91cElkOiBzSXRlbUtleSA9PT0gc0N1cnJlbnRGaWx0ZXJLZXkgPyB0aGlzLmJhdGNoR3JvdXBJZCA6IFwiJGF1dG9cIixcblx0XHRcdFx0XHRhZGRpdGlvbmFsRmlsdGVyczogYUFkZGl0aW9uYWxGaWx0ZXJzLmNvbmNhdChvRmlsdGVySW5mb3MuZmlsdGVycylcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXHRcdFByb21pc2UuYWxsKGFCaW5kaW5nUHJvbWlzZXMpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoYUNvdW50czogYW55W10pIHtcblx0XHRcdFx0Zm9yIChjb25zdCBrIGluIGFDb3VudHMpIHtcblx0XHRcdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoYC9wYXRocy8ke2t9L2NvdW50YCwgVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChhQ291bnRzW2tdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIGJpbmRpbmcgcHJvbWlzZXNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0X29uU2VsZWN0aW9uQ2hhbmdlKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEodGhpcy5fb1RhYmxlLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVksIG9Db250cm9sLmdldFNlbGVjdGVkS2V5KCkpO1xuXHRcdCh0aGlzLl9vVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLmdldEV4dGVuc2lvbkFQSSAmJiBvQ29udHJvbGxlci5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSkge1xuXHRcdFx0b0NvbnRyb2xsZXIuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHR9XG5cdH1cblxuXHRkZXN0cm95KGJTdXBwcmVzc0ludmFsaWRhdGU/OiBib29sZWFuKSB7XG5cdFx0aWYgKHRoaXMuX2F0dGFjaGVkVG9WaWV3KSB7XG5cdFx0XHRjb25zdCBvU2lkZUVmZmVjdHMgPSB0aGlzLl9nZXRTaWRlRWZmZWN0Q29udHJvbGxlcigpO1xuXHRcdFx0aWYgKG9TaWRlRWZmZWN0cykge1xuXHRcdFx0XHQvLyBpZiBcImRlc3Ryb3lcIiBzaWduYWwgY29tZXMgd2hlbiB2aWV3IGlzIGRlc3Ryb3llZCB0aGVyZSBpcyBub3QgYW55bW9yZSByZWZlcmVuY2UgdG8gQ29udHJvbGxlciBFeHRlbnNpb25cblx0XHRcdFx0b1NpZGVFZmZlY3RzLnJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyh0aGlzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZGVsZXRlIHRoaXMuX29UYWJsZTtcblx0XHRzdXBlci5kZXN0cm95KGJTdXBwcmVzc0ludmFsaWRhdGUpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFF1aWNrRmlsdGVyQ29udGFpbmVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUFvQkEsTUFBTUEsd0JBQXdCLEdBQUcsZ0JBQWdCO0VBQ2pELE1BQU1DLFlBQVksR0FBRyxTQUFTO0VBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLElBU01DLG9CQUFvQixXQUh6QkMsY0FBYyxDQUFDLDBDQUEwQyxFQUFFO0lBQzNEQyxVQUFVLEVBQUUsQ0FBQywrQkFBK0I7RUFDN0MsQ0FBQyxDQUFDLFVBRUFDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFFN0JELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFHNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFHNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxZQUFZLEVBQUU7RUFBUSxDQUFDLENBQUMsVUFHbkRDLFdBQVcsQ0FBQztJQUNaRixJQUFJLEVBQUUscUJBQXFCO0lBQzNCRyxRQUFRLEVB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