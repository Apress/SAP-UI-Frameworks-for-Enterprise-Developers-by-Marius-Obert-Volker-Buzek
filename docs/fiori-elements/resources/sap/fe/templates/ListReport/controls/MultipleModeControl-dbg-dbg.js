/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/IconTabFilter", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, MetaModelConverter, ClassSupport, MessageStrip, ResourceModelHelper, IconTabFilter, Control, Core, ControlPersonalizationWriteAPI, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var BindingAction;
  (function (BindingAction) {
    BindingAction["Suspend"] = "suspendBinding";
    BindingAction["Resume"] = "resumeBinding";
  })(BindingAction || (BindingAction = {}));
  let MultipleModeControl = (_dec = defineUI5Class("sap.fe.templates.ListReport.controls.MultipleModeControl"), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: false
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = aggregation({
    type: "sap.m.IconTabBar",
    multiple: false,
    isDefault: true
  }), _dec6 = association({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec7 = association({
    type: "sap.fe.core.controls.FilterBar",
    multiple: false
  }), _dec8 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MultipleModeControl, _Control);
    function MultipleModeControl() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showCounts", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "freezeContent", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "countsOutDated", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "innerControls", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterControl", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "select", _descriptor7, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = MultipleModeControl.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      this.getTabsModel(); // Generate the model which is mandatory for some bindings

      const oFilterControl = this._getFilterControl();
      if (!oFilterControl) {
        // In case there's no filterbar, we have to update the counts in the tabs immediately
        this.setCountsOutDated(true);
      }
      const oFilterBarAPI = oFilterControl === null || oFilterControl === void 0 ? void 0 : oFilterControl.getParent();
      this.getAllInnerControls().forEach(oMacroAPI => {
        var _oMacroAPI$suspendBin;
        if (this.showCounts) {
          oMacroAPI.attachEvent("internalDataRequested", this._refreshTabsCount.bind(this));
        }
        (_oMacroAPI$suspendBin = oMacroAPI.suspendBinding) === null || _oMacroAPI$suspendBin === void 0 ? void 0 : _oMacroAPI$suspendBin.call(oMacroAPI);
      });
      if (oFilterBarAPI) {
        oFilterBarAPI.attachEvent("internalSearch", this._onSearch.bind(this));
        oFilterBarAPI.attachEvent("internalFilterChanged", this._onFilterChanged.bind(this));
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      var _this$getSelectedInne, _this$getSelectedInne2;
      (_this$getSelectedInne = this.getSelectedInnerControl()) === null || _this$getSelectedInne === void 0 ? void 0 : (_this$getSelectedInne2 = _this$getSelectedInne.resumeBinding) === null || _this$getSelectedInne2 === void 0 ? void 0 : _this$getSelectedInne2.call(_this$getSelectedInne, !this.getProperty("freezeContent"));
    };
    MultipleModeControl.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.content);
    }

    /**
     * Gets the model containing information related to the IconTabFilters.
     *
     * @returns {sap.ui.model.Model | undefined} The model
     */;
    _proto.getTabsModel = function getTabsModel() {
      const sTabsModel = "tabsInternal";
      const oContent = this.content;
      if (!oContent) {
        return undefined;
      }
      let oModel = oContent.getModel(sTabsModel);
      if (!oModel) {
        oModel = new JSONModel({});
        oContent.setModel(oModel, sTabsModel);
      }
      return oModel;
    }

    /**
     * Gets the inner control of the displayed tab.
     *
     * @returns {InnerControlType | undefined} The control
     */;
    _proto.getSelectedInnerControl = function getSelectedInnerControl() {
      var _this$content;
      const oSelectedTab = (_this$content = this.content) === null || _this$content === void 0 ? void 0 : _this$content.getItems().find(oItem => oItem.getKey() === this.content.getSelectedKey());
      return oSelectedTab ? this.getAllInnerControls().find(oMacroAPI => this._getTabFromInnerControl(oMacroAPI) === oSelectedTab) : undefined;
    }

    /**
     * Manages the binding of all inner controls when the selected IconTabFilter is changed.
     *
     * @param {sap.ui.base.Event} oEvent Event fired by the IconTabBar
     */;
    MultipleModeControl.handleTabChange = function handleTabChange(oEvent) {
      var _oMultiControl$_getVi, _oMultiControl$_getVi2;
      const oIconTabBar = oEvent.getSource();
      const oMultiControl = oIconTabBar.getParent();
      const mParameters = oEvent.getParameters();
      oMultiControl._setInnerBinding(true);
      const sPreviousSelectedKey = mParameters === null || mParameters === void 0 ? void 0 : mParameters.previousKey;
      const sSelectedKey = mParameters === null || mParameters === void 0 ? void 0 : mParameters.selectedKey;
      if (sSelectedKey && sPreviousSelectedKey !== sSelectedKey) {
        const oFilterBar = oMultiControl._getFilterControl();
        if (oFilterBar && !oMultiControl.getProperty("freezeContent")) {
          if (!oMultiControl.getSelectedInnerControl()) {
            //custom tab
            oMultiControl._refreshCustomView(oFilterBar.getFilterConditions(), "tabChanged");
          }
        }
        ControlPersonalizationWriteAPI.add({
          changes: [{
            changeSpecificData: {
              changeType: "selectIconTabBarFilter",
              content: {
                selectedKey: sSelectedKey,
                previousSelectedKey: sPreviousSelectedKey
              }
            },
            selectorElement: oIconTabBar
          }]
        });
      }
      (_oMultiControl$_getVi = oMultiControl._getViewController()) === null || _oMultiControl$_getVi === void 0 ? void 0 : (_oMultiControl$_getVi2 = _oMultiControl$_getVi.getExtensionAPI()) === null || _oMultiControl$_getVi2 === void 0 ? void 0 : _oMultiControl$_getVi2.updateAppState();
      oMultiControl.fireEvent("select", {
        iconTabBar: oIconTabBar,
        selectedKey: sSelectedKey,
        previousKey: sPreviousSelectedKey
      });
    }

    /**
     * Invalidates the content of all inner controls.
     */;
    _proto.invalidateContent = function invalidateContent() {
      this.setCountsOutDated(true);
      this.getAllInnerControls().forEach(oMacroAPI => {
        var _oMacroAPI$invalidate;
        (_oMacroAPI$invalidate = oMacroAPI.invalidateContent) === null || _oMacroAPI$invalidate === void 0 ? void 0 : _oMacroAPI$invalidate.call(oMacroAPI);
      });
    }

    /**
     * Sets the counts to out of date or up to date
     * If the counts are set to "out of date" and the selected IconTabFilter doesn't contain an inner control all inner controls are requested to get the new counts.
     *
     * @param {boolean} bValue Freeze or not the control
     */;
    _proto.setCountsOutDated = function setCountsOutDated() {
      let bValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.setProperty("countsOutDated", bValue);
      // if the current tab is not configured with no inner Control
      // the tab counts must be manually refreshed since no Macro API will sent event internalDataRequested
      if (bValue && !this.getSelectedInnerControl()) {
        this._refreshTabsCount();
      }
    }

    /**
     * Freezes the content :
     *  - content is frozen: the binding of the inner controls are suspended.
     *  - content is unfrozen: the binding of inner control related to the selected IconTabFilter is resumed.
     *
     * @param {boolean} bValue Freeze or not the control
     */;
    _proto.setFreezeContent = function setFreezeContent(bValue) {
      this.setProperty("freezeContent", bValue);
      this._setInnerBinding();
    }

    /**
     * Updates the internal model with the properties that are not applicable on each IconTabFilter (containing inner control) according to the entityType of the filter control.
     *
     */;
    _proto._updateMultiTabNotApplicableFields = function _updateMultiTabNotApplicableFields() {
      const tabsModel = this.getTabsModel();
      const oFilterControl = this._getFilterControl();
      if (tabsModel && oFilterControl) {
        const results = {};
        this.getAllInnerControls().forEach(oMacroAPI => {
          const oTab = this._getTabFromInnerControl(oMacroAPI);
          if (oTab) {
            var _oMacroAPI$refreshNot;
            const sTabId = oTab.getKey();
            const mIgnoredFields = ((_oMacroAPI$refreshNot = oMacroAPI.refreshNotApplicableFields) === null || _oMacroAPI$refreshNot === void 0 ? void 0 : _oMacroAPI$refreshNot.call(oMacroAPI, oFilterControl)) || [];
            results[sTabId] = {
              notApplicable: {
                fields: mIgnoredFields,
                title: this._setTabMessageStrip({
                  entityTypePath: oFilterControl.data("entityType"),
                  ignoredFields: mIgnoredFields,
                  title: oTab.getText()
                })
              }
            };
            if (oMacroAPI && oMacroAPI.isA("sap.fe.macros.chart.ChartAPI")) {
              results[sTabId] = this.checkNonFilterableEntitySet(oMacroAPI, sTabId, results);
            }
          }
        });
        tabsModel.setData(results);
      }
    }

    /**
     * Modifies the messagestrip message based on entity set is filerable or not.
     *
     * @param {InnerControlType} oMacroAPI Macro chart api
     * @param {string} sTabId Tab key ID
     * @param {object} results Should contain fields and title
     * @returns {object} An object of modified fields and title
     */;
    _proto.checkNonFilterableEntitySet = function checkNonFilterableEntitySet(oMacroAPI, sTabId, results) {
      var _MetaModelConverter$g, _MetaModelConverter$g2, _MetaModelConverter$g3, _MetaModelConverter$g4, _MetaModelConverter$g5;
      const resourceModel = getResourceModel(oMacroAPI);
      const oChart = oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.getContent ? oMacroAPI.getContent() : undefined;
      const bEntitySetFilerable = oChart && ((_MetaModelConverter$g = MetaModelConverter.getInvolvedDataModelObjects(oChart.getModel().getMetaModel().getContext(`${oChart.data("targetCollectionPath")}`))) === null || _MetaModelConverter$g === void 0 ? void 0 : (_MetaModelConverter$g2 = _MetaModelConverter$g.targetObject) === null || _MetaModelConverter$g2 === void 0 ? void 0 : (_MetaModelConverter$g3 = _MetaModelConverter$g2.annotations) === null || _MetaModelConverter$g3 === void 0 ? void 0 : (_MetaModelConverter$g4 = _MetaModelConverter$g3.Capabilities) === null || _MetaModelConverter$g4 === void 0 ? void 0 : (_MetaModelConverter$g5 = _MetaModelConverter$g4.FilterRestrictions) === null || _MetaModelConverter$g5 === void 0 ? void 0 : _MetaModelConverter$g5.Filterable);
      if (bEntitySetFilerable !== undefined && !bEntitySetFilerable) {
        if (results[sTabId].notApplicable.fields.indexOf("$search") > -1) {
          results[sTabId].notApplicable.title += " " + resourceModel.getText("C_LR_MULTIVIZ_CHART_MULTI_NON_FILTERABLE");
        } else {
          results[sTabId].notApplicable.fields = ["nonFilterable"];
          results[sTabId].notApplicable.title = resourceModel.getText("C_LR_MULTIVIZ_CHART_MULTI_NON_FILTERABLE");
        }
      }
      return results[sTabId];
    }
    /**
     * Gets the inner controls.
     *
     * @param {boolean} bOnlyForVisibleTab Should display only the visible controls
     * @returns {InnerControlType[]} An array of controls
     */;
    _proto.getAllInnerControls = function getAllInnerControls() {
      let bOnlyForVisibleTab = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.innerControls.reduce((aInnerControls, sInnerControl) => {
        const oControl = Core.byId(sInnerControl);
        if (oControl) {
          aInnerControls.push(oControl);
        }
        return aInnerControls.filter(oInnerControl => {
          var _this$_getTabFromInne;
          return !bOnlyForVisibleTab || ((_this$_getTabFromInne = this._getTabFromInnerControl(oInnerControl)) === null || _this$_getTabFromInne === void 0 ? void 0 : _this$_getTabFromInne.getVisible());
        });
      }, []) || [];
    };
    _proto._getFilterControl = function _getFilterControl() {
      return Core.byId(this.filterControl);
    };
    _proto._getTabFromInnerControl = function _getTabFromInnerControl(oControl) {
      const sSupportedClass = IconTabFilter.getMetadata().getName();
      let oTab = oControl;
      if (oTab && !oTab.isA(sSupportedClass) && oTab.getParent) {
        oTab = oControl.getParent();
      }
      return oTab && oTab.isA(sSupportedClass) ? oTab : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const oView = CommonUtils.getTargetView(this);
      return oView && oView.getController();
    };
    _proto._refreshCustomView = function _refreshCustomView(oFilterConditions, sRefreshCause) {
      var _this$_getViewControl, _this$_getViewControl2;
      (_this$_getViewControl = this._getViewController()) === null || _this$_getViewControl === void 0 ? void 0 : (_this$_getViewControl2 = _this$_getViewControl.onViewNeedsRefresh) === null || _this$_getViewControl2 === void 0 ? void 0 : _this$_getViewControl2.call(_this$_getViewControl, {
        filterConditions: oFilterConditions,
        currentTabId: this.content.getSelectedKey(),
        refreshCause: sRefreshCause
      });
    };
    _proto._refreshTabsCount = function _refreshTabsCount(tableEvent) {
      var _this$_getTabFromInne2, _this$content2;
      // If the refresh is triggered by an event (internalDataRequested)
      // we cannot use the selected key as reference since table can be refreshed by SideEffects
      // so the table could be into a different tab -> we use the source of the event to find the targeted tab
      // If not triggered by an event -> refresh at least the counts of the current MacroAPI
      // In any case if the counts are set to Outdated for the MultipleModeControl all the counts are refreshed
      const eventMacroAPI = tableEvent === null || tableEvent === void 0 ? void 0 : tableEvent.getSource();
      const targetKey = eventMacroAPI ? (_this$_getTabFromInne2 = this._getTabFromInnerControl(eventMacroAPI)) === null || _this$_getTabFromInne2 === void 0 ? void 0 : _this$_getTabFromInne2.getKey() : (_this$content2 = this.content) === null || _this$content2 === void 0 ? void 0 : _this$content2.getSelectedKey();
      this.getAllInnerControls(true).forEach(oMacroAPI => {
        const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
        if (oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.getCounts && (this.countsOutDated || targetKey === (oIconTabFilter === null || oIconTabFilter === void 0 ? void 0 : oIconTabFilter.getKey()))) {
          if (oIconTabFilter && oIconTabFilter.setCount) {
            oIconTabFilter.setCount("...");
            oMacroAPI.getCounts().then(iCount => oIconTabFilter.setCount(iCount || "0")).catch(function (oError) {
              Log.error("Error while requesting Counts for Control", oError);
            });
          }
        }
      });
      this.setCountsOutDated(false);
    };
    _proto._setInnerBinding = function _setInnerBinding() {
      let bRequestIfNotInitialized = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (this.content) {
        this.getAllInnerControls().forEach(oMacroAPI => {
          var _oMacroAPI$sAction;
          const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
          const bIsSelectedKey = (oIconTabFilter === null || oIconTabFilter === void 0 ? void 0 : oIconTabFilter.getKey()) === this.content.getSelectedKey();
          const sAction = bIsSelectedKey && !this.getProperty("freezeContent") ? BindingAction.Resume : BindingAction.Suspend;
          (_oMacroAPI$sAction = oMacroAPI[sAction]) === null || _oMacroAPI$sAction === void 0 ? void 0 : _oMacroAPI$sAction.call(oMacroAPI, sAction === BindingAction.Resume ? bRequestIfNotInitialized && bIsSelectedKey : undefined);
        });
      }
    };
    _proto._setTabMessageStrip = function _setTabMessageStrip(properties) {
      let sText = "";
      const aIgnoredFields = properties.ignoredFields;
      const oFilterControl = this._getFilterControl();
      if (oFilterControl && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && properties.title) {
        const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, properties.entityTypePath, oFilterControl, getResourceModel(oFilterControl));
        sText = MessageStrip.getText(aIgnoredLabels, oFilterControl, properties.title);
        return sText;
      }
    };
    _proto._onSearch = function _onSearch(oEvent) {
      this.setCountsOutDated(true);
      this.setFreezeContent(false);
      if (this.getSelectedInnerControl()) {
        this._updateMultiTabNotApplicableFields();
      } else {
        // custom tab
        this._refreshCustomView(oEvent.getParameter("conditions"), "search");
      }
    };
    _proto._onFilterChanged = function _onFilterChanged(oEvent) {
      if (oEvent.getParameter("conditionsBased")) {
        this.setFreezeContent(true);
      }
    };
    return MultipleModeControl;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showCounts", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "freezeContent", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "countsOutDated", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "innerControls", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "filterControl", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "select", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MultipleModeControl;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCaW5kaW5nQWN0aW9uIiwiTXVsdGlwbGVNb2RlQ29udHJvbCIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsImlzRGVmYXVsdCIsImFzc29jaWF0aW9uIiwiZXZlbnQiLCJvbkJlZm9yZVJlbmRlcmluZyIsImdldFRhYnNNb2RlbCIsIm9GaWx0ZXJDb250cm9sIiwiX2dldEZpbHRlckNvbnRyb2wiLCJzZXRDb3VudHNPdXREYXRlZCIsIm9GaWx0ZXJCYXJBUEkiLCJnZXRQYXJlbnQiLCJnZXRBbGxJbm5lckNvbnRyb2xzIiwiZm9yRWFjaCIsIm9NYWNyb0FQSSIsInNob3dDb3VudHMiLCJhdHRhY2hFdmVudCIsIl9yZWZyZXNoVGFic0NvdW50IiwiYmluZCIsInN1c3BlbmRCaW5kaW5nIiwiX29uU2VhcmNoIiwiX29uRmlsdGVyQ2hhbmdlZCIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJnZXRTZWxlY3RlZElubmVyQ29udHJvbCIsInJlc3VtZUJpbmRpbmciLCJnZXRQcm9wZXJ0eSIsInJlbmRlciIsIm9SbSIsIm9Db250cm9sIiwicmVuZGVyQ29udHJvbCIsImNvbnRlbnQiLCJzVGFic01vZGVsIiwib0NvbnRlbnQiLCJ1bmRlZmluZWQiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIkpTT05Nb2RlbCIsInNldE1vZGVsIiwib1NlbGVjdGVkVGFiIiwiZ2V0SXRlbXMiLCJmaW5kIiwib0l0ZW0iLCJnZXRLZXkiLCJnZXRTZWxlY3RlZEtleSIsIl9nZXRUYWJGcm9tSW5uZXJDb250cm9sIiwiaGFuZGxlVGFiQ2hhbmdlIiwib0V2ZW50Iiwib0ljb25UYWJCYXIiLCJnZXRTb3VyY2UiLCJvTXVsdGlDb250cm9sIiwibVBhcmFtZXRlcnMiLCJnZXRQYXJhbWV0ZXJzIiwiX3NldElubmVyQmluZGluZyIsInNQcmV2aW91c1NlbGVjdGVkS2V5IiwicHJldmlvdXNLZXkiLCJzU2VsZWN0ZWRLZXkiLCJzZWxlY3RlZEtleSIsIm9GaWx0ZXJCYXIiLCJfcmVmcmVzaEN1c3RvbVZpZXciLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiQ29udHJvbFBlcnNvbmFsaXphdGlvbldyaXRlQVBJIiwiYWRkIiwiY2hhbmdlcyIsImNoYW5nZVNwZWNpZmljRGF0YSIsImNoYW5nZVR5cGUiLCJwcmV2aW91c1NlbGVjdGVkS2V5Iiwic2VsZWN0b3JFbGVtZW50IiwiX2dldFZpZXdDb250cm9sbGVyIiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJmaXJlRXZlbnQiLCJpY29uVGFiQmFyIiwiaW52YWxpZGF0ZUNvbnRlbnQiLCJiVmFsdWUiLCJzZXRQcm9wZXJ0eSIsInNldEZyZWV6ZUNvbnRlbnQiLCJfdXBkYXRlTXVsdGlUYWJOb3RBcHBsaWNhYmxlRmllbGRzIiwidGFic01vZGVsIiwicmVzdWx0cyIsIm9UYWIiLCJzVGFiSWQiLCJtSWdub3JlZEZpZWxkcyIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwibm90QXBwbGljYWJsZSIsImZpZWxkcyIsInRpdGxlIiwiX3NldFRhYk1lc3NhZ2VTdHJpcCIsImVudGl0eVR5cGVQYXRoIiwiZGF0YSIsImlnbm9yZWRGaWVsZHMiLCJnZXRUZXh0IiwiaXNBIiwiY2hlY2tOb25GaWx0ZXJhYmxlRW50aXR5U2V0Iiwic2V0RGF0YSIsInJlc291cmNlTW9kZWwiLCJnZXRSZXNvdXJjZU1vZGVsIiwib0NoYXJ0IiwiZ2V0Q29udGVudCIsImJFbnRpdHlTZXRGaWxlcmFibGUiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRNZXRhTW9kZWwiLCJnZXRDb250ZXh0IiwidGFyZ2V0T2JqZWN0IiwiYW5ub3RhdGlvbnMiLCJDYXBhYmlsaXRpZXMiLCJGaWx0ZXJSZXN0cmljdGlvbnMiLCJGaWx0ZXJhYmxlIiwiaW5kZXhPZiIsImJPbmx5Rm9yVmlzaWJsZVRhYiIsImlubmVyQ29udHJvbHMiLCJyZWR1Y2UiLCJhSW5uZXJDb250cm9scyIsInNJbm5lckNvbnRyb2wiLCJDb3JlIiwiYnlJZCIsInB1c2giLCJmaWx0ZXIiLCJvSW5uZXJDb250cm9sIiwiZ2V0VmlzaWJsZSIsImZpbHRlckNvbnRyb2wiLCJzU3VwcG9ydGVkQ2xhc3MiLCJJY29uVGFiRmlsdGVyIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1ZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJnZXRDb250cm9sbGVyIiwib0ZpbHRlckNvbmRpdGlvbnMiLCJzUmVmcmVzaENhdXNlIiwib25WaWV3TmVlZHNSZWZyZXNoIiwiZmlsdGVyQ29uZGl0aW9ucyIsImN1cnJlbnRUYWJJZCIsInJlZnJlc2hDYXVzZSIsInRhYmxlRXZlbnQiLCJldmVudE1hY3JvQVBJIiwidGFyZ2V0S2V5Iiwib0ljb25UYWJGaWx0ZXIiLCJnZXRDb3VudHMiLCJjb3VudHNPdXREYXRlZCIsInNldENvdW50IiwidGhlbiIsImlDb3VudCIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQiLCJiSXNTZWxlY3RlZEtleSIsInNBY3Rpb24iLCJSZXN1bWUiLCJTdXNwZW5kIiwicHJvcGVydGllcyIsInNUZXh0IiwiYUlnbm9yZWRGaWVsZHMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJhSWdub3JlZExhYmVscyIsIk1lc3NhZ2VTdHJpcCIsImdldExhYmVscyIsImdldFBhcmFtZXRlciIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk11bHRpcGxlTW9kZUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0ZpbHRlckJhclwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTWVzc2FnZVN0cmlwIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01lc3NhZ2VTdHJpcFwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb0FQSVwiO1xuaW1wb3J0IEljb25UYWJCYXIgZnJvbSBcInNhcC9tL0ljb25UYWJCYXJcIjtcbmltcG9ydCBJY29uVGFiRmlsdGVyIGZyb20gXCJzYXAvbS9JY29uVGFiRmlsdGVyXCI7XG5pbXBvcnQgdHlwZSBDb3JlRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgQ29udHJvbFBlcnNvbmFsaXphdGlvbldyaXRlQVBJIGZyb20gXCJzYXAvdWkvZmwvd3JpdGUvYXBpL0NvbnRyb2xQZXJzb25hbGl6YXRpb25Xcml0ZUFQSVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuXG5leHBvcnQgdHlwZSBJbm5lckNvbnRyb2xUeXBlID0gTWFjcm9BUEkgJlxuXHRQYXJ0aWFsPHtcblx0XHRyZXN1bWVCaW5kaW5nOiBGdW5jdGlvbjtcblx0XHRzdXNwZW5kQmluZGluZzogRnVuY3Rpb247XG5cdFx0Z2V0Q291bnRzOiBGdW5jdGlvbjtcblx0XHRyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkczogRnVuY3Rpb247XG5cdFx0aW52YWxpZGF0ZUNvbnRlbnQ6IEZ1bmN0aW9uO1xuXHRcdGdldENvbnRlbnQ6IEZ1bmN0aW9uO1xuXHR9PjtcblxudHlwZSBNZXNzYWdlU3RyaXBQcm9wZXJ0aWVzID0ge1xuXHRlbnRpdHlUeXBlUGF0aDogc3RyaW5nO1xuXHRpZ25vcmVkRmllbGRzOiBhbnlbXTtcblx0dGl0bGU6IHN0cmluZztcbn07XG5cbmVudW0gQmluZGluZ0FjdGlvbiB7XG5cdFN1c3BlbmQgPSBcInN1c3BlbmRCaW5kaW5nXCIsXG5cdFJlc3VtZSA9IFwicmVzdW1lQmluZGluZ1wiXG59XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5jb250cm9scy5NdWx0aXBsZU1vZGVDb250cm9sXCIpXG5jbGFzcyBNdWx0aXBsZU1vZGVDb250cm9sIGV4dGVuZHMgQ29udHJvbCB7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHNob3dDb3VudHMhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGZyZWV6ZUNvbnRlbnQhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGNvdW50c091dERhdGVkITogYm9vbGVhbjtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLkljb25UYWJCYXJcIiwgbXVsdGlwbGU6IGZhbHNlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Y29udGVudCE6IEljb25UYWJCYXI7XG5cblx0QGFzc29jaWF0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiB0cnVlIH0pXG5cdGlubmVyQ29udHJvbHMhOiBzdHJpbmdbXTtcblxuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0ZmlsdGVyQ29udHJvbCE6IHN0cmluZztcblxuXHRAZXZlbnQoKVxuXHRzZWxlY3QhOiBGdW5jdGlvbjtcblxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHR0aGlzLmdldFRhYnNNb2RlbCgpOyAvLyBHZW5lcmF0ZSB0aGUgbW9kZWwgd2hpY2ggaXMgbWFuZGF0b3J5IGZvciBzb21lIGJpbmRpbmdzXG5cblx0XHRjb25zdCBvRmlsdGVyQ29udHJvbCA9IHRoaXMuX2dldEZpbHRlckNvbnRyb2woKTtcblx0XHRpZiAoIW9GaWx0ZXJDb250cm9sKSB7XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlJ3Mgbm8gZmlsdGVyYmFyLCB3ZSBoYXZlIHRvIHVwZGF0ZSB0aGUgY291bnRzIGluIHRoZSB0YWJzIGltbWVkaWF0ZWx5XG5cdFx0XHR0aGlzLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdH1cblx0XHRjb25zdCBvRmlsdGVyQmFyQVBJID0gb0ZpbHRlckNvbnRyb2w/LmdldFBhcmVudCgpO1xuXHRcdHRoaXMuZ2V0QWxsSW5uZXJDb250cm9scygpLmZvckVhY2goKG9NYWNyb0FQSSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc2hvd0NvdW50cykge1xuXHRcdFx0XHRvTWFjcm9BUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbERhdGFSZXF1ZXN0ZWRcIiwgdGhpcy5fcmVmcmVzaFRhYnNDb3VudC5iaW5kKHRoaXMpKTtcblx0XHRcdH1cblx0XHRcdG9NYWNyb0FQSS5zdXNwZW5kQmluZGluZz8uKCk7XG5cdFx0fSk7XG5cdFx0aWYgKG9GaWx0ZXJCYXJBUEkpIHtcblx0XHRcdG9GaWx0ZXJCYXJBUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbFNlYXJjaFwiLCB0aGlzLl9vblNlYXJjaC5iaW5kKHRoaXMpKTtcblx0XHRcdG9GaWx0ZXJCYXJBUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbEZpbHRlckNoYW5nZWRcIiwgdGhpcy5fb25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxuXG5cdG9uQWZ0ZXJSZW5kZXJpbmcoKSB7XG5cdFx0dGhpcy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpPy5yZXN1bWVCaW5kaW5nPy4oIXRoaXMuZ2V0UHJvcGVydHkoXCJmcmVlemVDb250ZW50XCIpKTtcblx0fVxuXG5cdHN0YXRpYyByZW5kZXIob1JtOiBSZW5kZXJNYW5hZ2VyLCBvQ29udHJvbDogTXVsdGlwbGVNb2RlQ29udHJvbCkge1xuXHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIG1vZGVsIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gcmVsYXRlZCB0byB0aGUgSWNvblRhYkZpbHRlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtzYXAudWkubW9kZWwuTW9kZWwgfCB1bmRlZmluZWR9IFRoZSBtb2RlbFxuXHQgKi9cblx0Z2V0VGFic01vZGVsKCk6IE1vZGVsIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBzVGFic01vZGVsID0gXCJ0YWJzSW50ZXJuYWxcIjtcblx0XHRjb25zdCBvQ29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRpZiAoIW9Db250ZW50KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRsZXQgb01vZGVsID0gb0NvbnRlbnQuZ2V0TW9kZWwoc1RhYnNNb2RlbCk7XG5cdFx0aWYgKCFvTW9kZWwpIHtcblx0XHRcdG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwoe30pO1xuXHRcdFx0b0NvbnRlbnQuc2V0TW9kZWwob01vZGVsLCBzVGFic01vZGVsKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Nb2RlbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbm5lciBjb250cm9sIG9mIHRoZSBkaXNwbGF5ZWQgdGFiLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7SW5uZXJDb250cm9sVHlwZSB8IHVuZGVmaW5lZH0gVGhlIGNvbnRyb2xcblx0ICovXG5cdGdldFNlbGVjdGVkSW5uZXJDb250cm9sKCk6IElubmVyQ29udHJvbFR5cGUgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9TZWxlY3RlZFRhYiA9IHRoaXMuY29udGVudD8uZ2V0SXRlbXMoKS5maW5kKChvSXRlbSkgPT4gKG9JdGVtIGFzIEljb25UYWJGaWx0ZXIpLmdldEtleSgpID09PSB0aGlzLmNvbnRlbnQuZ2V0U2VsZWN0ZWRLZXkoKSk7XG5cdFx0cmV0dXJuIG9TZWxlY3RlZFRhYlxuXHRcdFx0PyB0aGlzLmdldEFsbElubmVyQ29udHJvbHMoKS5maW5kKChvTWFjcm9BUEkpID0+IHRoaXMuX2dldFRhYkZyb21Jbm5lckNvbnRyb2wob01hY3JvQVBJKSA9PT0gb1NlbGVjdGVkVGFiKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogTWFuYWdlcyB0aGUgYmluZGluZyBvZiBhbGwgaW5uZXIgY29udHJvbHMgd2hlbiB0aGUgc2VsZWN0ZWQgSWNvblRhYkZpbHRlciBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3NhcC51aS5iYXNlLkV2ZW50fSBvRXZlbnQgRXZlbnQgZmlyZWQgYnkgdGhlIEljb25UYWJCYXJcblx0ICovXG5cdHN0YXRpYyBoYW5kbGVUYWJDaGFuZ2Uob0V2ZW50OiBhbnkpOiB2b2lkIHtcblx0XHRjb25zdCBvSWNvblRhYkJhciA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvTXVsdGlDb250cm9sID0gb0ljb25UYWJCYXIuZ2V0UGFyZW50KCk7XG5cblx0XHRjb25zdCBtUGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdFx0b011bHRpQ29udHJvbC5fc2V0SW5uZXJCaW5kaW5nKHRydWUpO1xuXHRcdGNvbnN0IHNQcmV2aW91c1NlbGVjdGVkS2V5ID0gbVBhcmFtZXRlcnM/LnByZXZpb3VzS2V5O1xuXHRcdGNvbnN0IHNTZWxlY3RlZEtleSA9IG1QYXJhbWV0ZXJzPy5zZWxlY3RlZEtleTtcblxuXHRcdGlmIChzU2VsZWN0ZWRLZXkgJiYgc1ByZXZpb3VzU2VsZWN0ZWRLZXkgIT09IHNTZWxlY3RlZEtleSkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9NdWx0aUNvbnRyb2wuX2dldEZpbHRlckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyICYmICFvTXVsdGlDb250cm9sLmdldFByb3BlcnR5KFwiZnJlZXplQ29udGVudFwiKSkge1xuXHRcdFx0XHRpZiAoIW9NdWx0aUNvbnRyb2wuZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2woKSkge1xuXHRcdFx0XHRcdC8vY3VzdG9tIHRhYlxuXHRcdFx0XHRcdG9NdWx0aUNvbnRyb2wuX3JlZnJlc2hDdXN0b21WaWV3KG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpLCBcInRhYkNoYW5nZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdENvbnRyb2xQZXJzb25hbGl6YXRpb25Xcml0ZUFQSS5hZGQoe1xuXHRcdFx0XHRjaGFuZ2VzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2hhbmdlU3BlY2lmaWNEYXRhOiB7XG5cdFx0XHRcdFx0XHRcdGNoYW5nZVR5cGU6IFwic2VsZWN0SWNvblRhYkJhckZpbHRlclwiLFxuXHRcdFx0XHRcdFx0XHRjb250ZW50OiB7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRLZXk6IHNTZWxlY3RlZEtleSxcblx0XHRcdFx0XHRcdFx0XHRwcmV2aW91c1NlbGVjdGVkS2V5OiBzUHJldmlvdXNTZWxlY3RlZEtleVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0c2VsZWN0b3JFbGVtZW50OiBvSWNvblRhYkJhclxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0b011bHRpQ29udHJvbC5fZ2V0Vmlld0NvbnRyb2xsZXIoKT8uZ2V0RXh0ZW5zaW9uQVBJKCk/LnVwZGF0ZUFwcFN0YXRlKCk7XG5cblx0XHRvTXVsdGlDb250cm9sLmZpcmVFdmVudChcInNlbGVjdFwiLCB7XG5cdFx0XHRpY29uVGFiQmFyOiBvSWNvblRhYkJhcixcblx0XHRcdHNlbGVjdGVkS2V5OiBzU2VsZWN0ZWRLZXksXG5cdFx0XHRwcmV2aW91c0tleTogc1ByZXZpb3VzU2VsZWN0ZWRLZXlcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnZhbGlkYXRlcyB0aGUgY29udGVudCBvZiBhbGwgaW5uZXIgY29udHJvbHMuXG5cdCAqL1xuXHRpbnZhbGlkYXRlQ29udGVudCgpIHtcblx0XHR0aGlzLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdHRoaXMuZ2V0QWxsSW5uZXJDb250cm9scygpLmZvckVhY2goKG9NYWNyb0FQSSkgPT4ge1xuXHRcdFx0b01hY3JvQVBJLmludmFsaWRhdGVDb250ZW50Py4oKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb3VudHMgdG8gb3V0IG9mIGRhdGUgb3IgdXAgdG8gZGF0ZVxuXHQgKiBJZiB0aGUgY291bnRzIGFyZSBzZXQgdG8gXCJvdXQgb2YgZGF0ZVwiIGFuZCB0aGUgc2VsZWN0ZWQgSWNvblRhYkZpbHRlciBkb2Vzbid0IGNvbnRhaW4gYW4gaW5uZXIgY29udHJvbCBhbGwgaW5uZXIgY29udHJvbHMgYXJlIHJlcXVlc3RlZCB0byBnZXQgdGhlIG5ldyBjb3VudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYlZhbHVlIEZyZWV6ZSBvciBub3QgdGhlIGNvbnRyb2xcblx0ICovXG5cdHNldENvdW50c091dERhdGVkKGJWYWx1ZSA9IHRydWUpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiY291bnRzT3V0RGF0ZWRcIiwgYlZhbHVlKTtcblx0XHQvLyBpZiB0aGUgY3VycmVudCB0YWIgaXMgbm90IGNvbmZpZ3VyZWQgd2l0aCBubyBpbm5lciBDb250cm9sXG5cdFx0Ly8gdGhlIHRhYiBjb3VudHMgbXVzdCBiZSBtYW51YWxseSByZWZyZXNoZWQgc2luY2Ugbm8gTWFjcm8gQVBJIHdpbGwgc2VudCBldmVudCBpbnRlcm5hbERhdGFSZXF1ZXN0ZWRcblx0XHRpZiAoYlZhbHVlICYmICF0aGlzLmdldFNlbGVjdGVkSW5uZXJDb250cm9sKCkpIHtcblx0XHRcdHRoaXMuX3JlZnJlc2hUYWJzQ291bnQoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRnJlZXplcyB0aGUgY29udGVudCA6XG5cdCAqICAtIGNvbnRlbnQgaXMgZnJvemVuOiB0aGUgYmluZGluZyBvZiB0aGUgaW5uZXIgY29udHJvbHMgYXJlIHN1c3BlbmRlZC5cblx0ICogIC0gY29udGVudCBpcyB1bmZyb3plbjogdGhlIGJpbmRpbmcgb2YgaW5uZXIgY29udHJvbCByZWxhdGVkIHRvIHRoZSBzZWxlY3RlZCBJY29uVGFiRmlsdGVyIGlzIHJlc3VtZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYlZhbHVlIEZyZWV6ZSBvciBub3QgdGhlIGNvbnRyb2xcblx0ICovXG5cdHNldEZyZWV6ZUNvbnRlbnQoYlZhbHVlOiBib29sZWFuKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImZyZWV6ZUNvbnRlbnRcIiwgYlZhbHVlKTtcblx0XHR0aGlzLl9zZXRJbm5lckJpbmRpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBpbnRlcm5hbCBtb2RlbCB3aXRoIHRoZSBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIG9uIGVhY2ggSWNvblRhYkZpbHRlciAoY29udGFpbmluZyBpbm5lciBjb250cm9sKSBhY2NvcmRpbmcgdG8gdGhlIGVudGl0eVR5cGUgb2YgdGhlIGZpbHRlciBjb250cm9sLlxuXHQgKlxuXHQgKi9cblx0X3VwZGF0ZU11bHRpVGFiTm90QXBwbGljYWJsZUZpZWxkcygpIHtcblx0XHRjb25zdCB0YWJzTW9kZWwgPSB0aGlzLmdldFRhYnNNb2RlbCgpO1xuXHRcdGNvbnN0IG9GaWx0ZXJDb250cm9sID0gdGhpcy5fZ2V0RmlsdGVyQ29udHJvbCgpIGFzIENvbnRyb2w7XG5cdFx0aWYgKHRhYnNNb2RlbCAmJiBvRmlsdGVyQ29udHJvbCkge1xuXHRcdFx0Y29uc3QgcmVzdWx0czogYW55ID0ge307XG5cdFx0XHR0aGlzLmdldEFsbElubmVyQ29udHJvbHMoKS5mb3JFYWNoKChvTWFjcm9BUEkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb1RhYiA9IHRoaXMuX2dldFRhYkZyb21Jbm5lckNvbnRyb2wob01hY3JvQVBJKTtcblx0XHRcdFx0aWYgKG9UYWIpIHtcblx0XHRcdFx0XHRjb25zdCBzVGFiSWQgPSBvVGFiLmdldEtleSgpO1xuXHRcdFx0XHRcdGNvbnN0IG1JZ25vcmVkRmllbGRzID0gb01hY3JvQVBJLnJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzPy4ob0ZpbHRlckNvbnRyb2wpIHx8IFtdO1xuXHRcdFx0XHRcdHJlc3VsdHNbc1RhYklkXSA9IHtcblx0XHRcdFx0XHRcdG5vdEFwcGxpY2FibGU6IHtcblx0XHRcdFx0XHRcdFx0ZmllbGRzOiBtSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IHRoaXMuX3NldFRhYk1lc3NhZ2VTdHJpcCh7XG5cdFx0XHRcdFx0XHRcdFx0ZW50aXR5VHlwZVBhdGg6IG9GaWx0ZXJDb250cm9sLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0XHRcdFx0XHRcdGlnbm9yZWRGaWVsZHM6IG1JZ25vcmVkRmllbGRzLFxuXHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBvVGFiLmdldFRleHQoKVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aWYgKG9NYWNyb0FQSSAmJiBvTWFjcm9BUEkuaXNBKFwic2FwLmZlLm1hY3Jvcy5jaGFydC5DaGFydEFQSVwiKSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0c1tzVGFiSWRdID0gdGhpcy5jaGVja05vbkZpbHRlcmFibGVFbnRpdHlTZXQob01hY3JvQVBJLCBzVGFiSWQsIHJlc3VsdHMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHQodGFic01vZGVsIGFzIGFueSkuc2V0RGF0YShyZXN1bHRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW9kaWZpZXMgdGhlIG1lc3NhZ2VzdHJpcCBtZXNzYWdlIGJhc2VkIG9uIGVudGl0eSBzZXQgaXMgZmlsZXJhYmxlIG9yIG5vdC5cblx0ICpcblx0ICogQHBhcmFtIHtJbm5lckNvbnRyb2xUeXBlfSBvTWFjcm9BUEkgTWFjcm8gY2hhcnQgYXBpXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzVGFiSWQgVGFiIGtleSBJRFxuXHQgKiBAcGFyYW0ge29iamVjdH0gcmVzdWx0cyBTaG91bGQgY29udGFpbiBmaWVsZHMgYW5kIHRpdGxlXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCBvZiBtb2RpZmllZCBmaWVsZHMgYW5kIHRpdGxlXG5cdCAqL1xuXHRjaGVja05vbkZpbHRlcmFibGVFbnRpdHlTZXQob01hY3JvQVBJOiBJbm5lckNvbnRyb2xUeXBlLCBzVGFiSWQ6IHN0cmluZywgcmVzdWx0czogYW55KSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob01hY3JvQVBJKTtcblx0XHRjb25zdCBvQ2hhcnQgPSBvTWFjcm9BUEk/LmdldENvbnRlbnQgPyBvTWFjcm9BUEkuZ2V0Q29udGVudCgpIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGJFbnRpdHlTZXRGaWxlcmFibGUgPVxuXHRcdFx0b0NoYXJ0ICYmXG5cdFx0XHRNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0XHRvQ2hhcnRcblx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHRcdC5nZXRDb250ZXh0KGAke29DaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIil9YClcblx0XHRcdCk/LnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uRmlsdGVyUmVzdHJpY3Rpb25zPy5GaWx0ZXJhYmxlO1xuXHRcdGlmIChiRW50aXR5U2V0RmlsZXJhYmxlICE9PSB1bmRlZmluZWQgJiYgIWJFbnRpdHlTZXRGaWxlcmFibGUpIHtcblx0XHRcdGlmIChyZXN1bHRzW3NUYWJJZF0ubm90QXBwbGljYWJsZS5maWVsZHMuaW5kZXhPZihcIiRzZWFyY2hcIikgPiAtMSkge1xuXHRcdFx0XHRyZXN1bHRzW3NUYWJJZF0ubm90QXBwbGljYWJsZS50aXRsZSArPSBcIiBcIiArIHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfTFJfTVVMVElWSVpfQ0hBUlRfTVVMVElfTk9OX0ZJTFRFUkFCTEVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHRzW3NUYWJJZF0ubm90QXBwbGljYWJsZS5maWVsZHMgPSBbXCJub25GaWx0ZXJhYmxlXCJdO1xuXHRcdFx0XHRyZXN1bHRzW3NUYWJJZF0ubm90QXBwbGljYWJsZS50aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfTFJfTVVMVElWSVpfQ0hBUlRfTVVMVElfTk9OX0ZJTFRFUkFCTEVcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRzW3NUYWJJZF07XG5cdH1cblx0LyoqXG5cdCAqIEdldHMgdGhlIGlubmVyIGNvbnRyb2xzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGJPbmx5Rm9yVmlzaWJsZVRhYiBTaG91bGQgZGlzcGxheSBvbmx5IHRoZSB2aXNpYmxlIGNvbnRyb2xzXG5cdCAqIEByZXR1cm5zIHtJbm5lckNvbnRyb2xUeXBlW119IEFuIGFycmF5IG9mIGNvbnRyb2xzXG5cdCAqL1xuXHRnZXRBbGxJbm5lckNvbnRyb2xzKGJPbmx5Rm9yVmlzaWJsZVRhYiA9IGZhbHNlKTogSW5uZXJDb250cm9sVHlwZVtdIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dGhpcy5pbm5lckNvbnRyb2xzLnJlZHVjZSgoYUlubmVyQ29udHJvbHM6IElubmVyQ29udHJvbFR5cGVbXSwgc0lubmVyQ29udHJvbDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9Db250cm9sID0gQ29yZS5ieUlkKHNJbm5lckNvbnRyb2wpIGFzIElubmVyQ29udHJvbFR5cGU7XG5cdFx0XHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0XHRcdGFJbm5lckNvbnRyb2xzLnB1c2gob0NvbnRyb2wpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhSW5uZXJDb250cm9scy5maWx0ZXIoXG5cdFx0XHRcdFx0KG9Jbm5lckNvbnRyb2wpID0+ICFiT25seUZvclZpc2libGVUYWIgfHwgdGhpcy5fZ2V0VGFiRnJvbUlubmVyQ29udHJvbChvSW5uZXJDb250cm9sKT8uZ2V0VmlzaWJsZSgpXG5cdFx0XHRcdCk7XG5cdFx0XHR9LCBbXSkgfHwgW11cblx0XHQpO1xuXHR9XG5cblx0X2dldEZpbHRlckNvbnRyb2woKTogRmlsdGVyQmFyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gQ29yZS5ieUlkKHRoaXMuZmlsdGVyQ29udHJvbCkgYXMgRmlsdGVyQmFyIHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldFRhYkZyb21Jbm5lckNvbnRyb2wob0NvbnRyb2w6IENvbnRyb2wpOiBJY29uVGFiRmlsdGVyIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBzU3VwcG9ydGVkQ2xhc3MgPSBJY29uVGFiRmlsdGVyLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpO1xuXHRcdGxldCBvVGFiOiBhbnkgPSBvQ29udHJvbDtcblx0XHRpZiAob1RhYiAmJiAhb1RhYi5pc0Eoc1N1cHBvcnRlZENsYXNzKSAmJiBvVGFiLmdldFBhcmVudCkge1xuXHRcdFx0b1RhYiA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1RhYiAmJiBvVGFiLmlzQShzU3VwcG9ydGVkQ2xhc3MpID8gKG9UYWIgYXMgSWNvblRhYkZpbHRlcikgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZ2V0Vmlld0NvbnRyb2xsZXIoKSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpO1xuXHRcdHJldHVybiBvVmlldyAmJiBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdH1cblxuXHRfcmVmcmVzaEN1c3RvbVZpZXcob0ZpbHRlckNvbmRpdGlvbnM6IGFueSwgc1JlZnJlc2hDYXVzZTogc3RyaW5nKSB7XG5cdFx0KHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCkgYXMgYW55KT8ub25WaWV3TmVlZHNSZWZyZXNoPy4oe1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uczogb0ZpbHRlckNvbmRpdGlvbnMsXG5cdFx0XHRjdXJyZW50VGFiSWQ6IHRoaXMuY29udGVudC5nZXRTZWxlY3RlZEtleSgpLFxuXHRcdFx0cmVmcmVzaENhdXNlOiBzUmVmcmVzaENhdXNlXG5cdFx0fSk7XG5cdH1cblxuXHRfcmVmcmVzaFRhYnNDb3VudCh0YWJsZUV2ZW50PzogQ29yZUV2ZW50KTogdm9pZCB7XG5cdFx0Ly8gSWYgdGhlIHJlZnJlc2ggaXMgdHJpZ2dlcmVkIGJ5IGFuIGV2ZW50IChpbnRlcm5hbERhdGFSZXF1ZXN0ZWQpXG5cdFx0Ly8gd2UgY2Fubm90IHVzZSB0aGUgc2VsZWN0ZWQga2V5IGFzIHJlZmVyZW5jZSBzaW5jZSB0YWJsZSBjYW4gYmUgcmVmcmVzaGVkIGJ5IFNpZGVFZmZlY3RzXG5cdFx0Ly8gc28gdGhlIHRhYmxlIGNvdWxkIGJlIGludG8gYSBkaWZmZXJlbnQgdGFiIC0+IHdlIHVzZSB0aGUgc291cmNlIG9mIHRoZSBldmVudCB0byBmaW5kIHRoZSB0YXJnZXRlZCB0YWJcblx0XHQvLyBJZiBub3QgdHJpZ2dlcmVkIGJ5IGFuIGV2ZW50IC0+IHJlZnJlc2ggYXQgbGVhc3QgdGhlIGNvdW50cyBvZiB0aGUgY3VycmVudCBNYWNyb0FQSVxuXHRcdC8vIEluIGFueSBjYXNlIGlmIHRoZSBjb3VudHMgYXJlIHNldCB0byBPdXRkYXRlZCBmb3IgdGhlIE11bHRpcGxlTW9kZUNvbnRyb2wgYWxsIHRoZSBjb3VudHMgYXJlIHJlZnJlc2hlZFxuXHRcdGNvbnN0IGV2ZW50TWFjcm9BUEkgPSB0YWJsZUV2ZW50Py5nZXRTb3VyY2UoKSBhcyBNYWNyb0FQSTtcblx0XHRjb25zdCB0YXJnZXRLZXkgPSBldmVudE1hY3JvQVBJID8gdGhpcy5fZ2V0VGFiRnJvbUlubmVyQ29udHJvbChldmVudE1hY3JvQVBJKT8uZ2V0S2V5KCkgOiB0aGlzLmNvbnRlbnQ/LmdldFNlbGVjdGVkS2V5KCk7XG5cblx0XHR0aGlzLmdldEFsbElubmVyQ29udHJvbHModHJ1ZSkuZm9yRWFjaCgob01hY3JvQVBJKSA9PiB7XG5cdFx0XHRjb25zdCBvSWNvblRhYkZpbHRlciA9IHRoaXMuX2dldFRhYkZyb21Jbm5lckNvbnRyb2wob01hY3JvQVBJKTtcblx0XHRcdGlmIChvTWFjcm9BUEk/LmdldENvdW50cyAmJiAodGhpcy5jb3VudHNPdXREYXRlZCB8fCB0YXJnZXRLZXkgPT09IG9JY29uVGFiRmlsdGVyPy5nZXRLZXkoKSkpIHtcblx0XHRcdFx0aWYgKG9JY29uVGFiRmlsdGVyICYmIG9JY29uVGFiRmlsdGVyLnNldENvdW50KSB7XG5cdFx0XHRcdFx0b0ljb25UYWJGaWx0ZXIuc2V0Q291bnQoXCIuLi5cIik7XG5cdFx0XHRcdFx0b01hY3JvQVBJXG5cdFx0XHRcdFx0XHQuZ2V0Q291bnRzKClcblx0XHRcdFx0XHRcdC50aGVuKChpQ291bnQ6IHN0cmluZykgPT4gb0ljb25UYWJGaWx0ZXIuc2V0Q291bnQoaUNvdW50IHx8IFwiMFwiKSlcblx0XHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVxdWVzdGluZyBDb3VudHMgZm9yIENvbnRyb2xcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRDb3VudHNPdXREYXRlZChmYWxzZSk7XG5cdH1cblxuXHRfc2V0SW5uZXJCaW5kaW5nKGJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMuY29udGVudCkge1xuXHRcdFx0dGhpcy5nZXRBbGxJbm5lckNvbnRyb2xzKCkuZm9yRWFjaCgob01hY3JvQVBJKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9JY29uVGFiRmlsdGVyID0gdGhpcy5fZ2V0VGFiRnJvbUlubmVyQ29udHJvbChvTWFjcm9BUEkpO1xuXHRcdFx0XHRjb25zdCBiSXNTZWxlY3RlZEtleSA9IG9JY29uVGFiRmlsdGVyPy5nZXRLZXkoKSA9PT0gdGhpcy5jb250ZW50LmdldFNlbGVjdGVkS2V5KCk7XG5cdFx0XHRcdGNvbnN0IHNBY3Rpb24gPSBiSXNTZWxlY3RlZEtleSAmJiAhdGhpcy5nZXRQcm9wZXJ0eShcImZyZWV6ZUNvbnRlbnRcIikgPyBCaW5kaW5nQWN0aW9uLlJlc3VtZSA6IEJpbmRpbmdBY3Rpb24uU3VzcGVuZDtcblx0XHRcdFx0b01hY3JvQVBJW3NBY3Rpb25dPy4oc0FjdGlvbiA9PT0gQmluZGluZ0FjdGlvbi5SZXN1bWUgPyBiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQgJiYgYklzU2VsZWN0ZWRLZXkgOiB1bmRlZmluZWQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldFRhYk1lc3NhZ2VTdHJpcChwcm9wZXJ0aWVzOiBNZXNzYWdlU3RyaXBQcm9wZXJ0aWVzKSB7XG5cdFx0bGV0IHNUZXh0ID0gXCJcIjtcblx0XHRjb25zdCBhSWdub3JlZEZpZWxkcyA9IHByb3BlcnRpZXMuaWdub3JlZEZpZWxkcztcblx0XHRjb25zdCBvRmlsdGVyQ29udHJvbCA9IHRoaXMuX2dldEZpbHRlckNvbnRyb2woKSBhcyBDb250cm9sO1xuXHRcdGlmIChvRmlsdGVyQ29udHJvbCAmJiBBcnJheS5pc0FycmF5KGFJZ25vcmVkRmllbGRzKSAmJiBhSWdub3JlZEZpZWxkcy5sZW5ndGggPiAwICYmIHByb3BlcnRpZXMudGl0bGUpIHtcblx0XHRcdGNvbnN0IGFJZ25vcmVkTGFiZWxzID0gTWVzc2FnZVN0cmlwLmdldExhYmVscyhcblx0XHRcdFx0YUlnbm9yZWRGaWVsZHMsXG5cdFx0XHRcdHByb3BlcnRpZXMuZW50aXR5VHlwZVBhdGgsXG5cdFx0XHRcdG9GaWx0ZXJDb250cm9sLFxuXHRcdFx0XHRnZXRSZXNvdXJjZU1vZGVsKG9GaWx0ZXJDb250cm9sKVxuXHRcdFx0KTtcblx0XHRcdHNUZXh0ID0gTWVzc2FnZVN0cmlwLmdldFRleHQoYUlnbm9yZWRMYWJlbHMsIG9GaWx0ZXJDb250cm9sLCBwcm9wZXJ0aWVzLnRpdGxlKTtcblx0XHRcdHJldHVybiBzVGV4dDtcblx0XHR9XG5cdH1cblxuXHRfb25TZWFyY2gob0V2ZW50OiBDb3JlRXZlbnQpOiB2b2lkIHtcblx0XHR0aGlzLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdHRoaXMuc2V0RnJlZXplQ29udGVudChmYWxzZSk7XG5cdFx0aWYgKHRoaXMuZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2woKSkge1xuXHRcdFx0dGhpcy5fdXBkYXRlTXVsdGlUYWJOb3RBcHBsaWNhYmxlRmllbGRzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGN1c3RvbSB0YWJcblx0XHRcdHRoaXMuX3JlZnJlc2hDdXN0b21WaWV3KG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb25kaXRpb25zXCIpLCBcInNlYXJjaFwiKTtcblx0XHR9XG5cdH1cblxuXHRfb25GaWx0ZXJDaGFuZ2VkKG9FdmVudDogQ29yZUV2ZW50KTogdm9pZCB7XG5cdFx0aWYgKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb25kaXRpb25zQmFzZWRcIikpIHtcblx0XHRcdHRoaXMuc2V0RnJlZXplQ29udGVudCh0cnVlKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTXVsdGlwbGVNb2RlQ29udHJvbDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFrQ0tBLGFBQWE7RUFBQSxXQUFiQSxhQUFhO0lBQWJBLGFBQWE7SUFBYkEsYUFBYTtFQUFBLEdBQWJBLGFBQWEsS0FBYkEsYUFBYTtFQUFBLElBTVpDLG1CQUFtQixXQUR4QkMsY0FBYyxDQUFDLDBEQUEwRCxDQUFDLFVBRXpFQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBRzdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBR2xERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBR2xEQyxXQUFXLENBQUM7SUFBRUYsSUFBSSxFQUFFLGtCQUFrQjtJQUFFRyxRQUFRLEVBQUUsS0FBSztJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHM0VDLFdBQVcsQ0FBQztJQUFFTCxJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUc1REUsV0FBVyxDQUFDO0lBQUVMLElBQUksRUFBRSxnQ0FBZ0M7SUFBRUcsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBR3hFRyxLQUFLLEVBQUU7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FHUkMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQixJQUFJLENBQUNDLFlBQVksRUFBRSxDQUFDLENBQUM7O01BRXJCLE1B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