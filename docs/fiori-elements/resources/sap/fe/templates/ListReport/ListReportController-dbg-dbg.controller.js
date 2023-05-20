/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/KPIManagement", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/ui/base/ManagedObject", "sap/ui/core/mvc/OverrideExecution", "sap/ui/Device", "sap/ui/mdc/p13n/StateUtil", "sap/ui/thirdparty/hasher", "./ListReportTemplating", "./overrides/IntentBasedNavigation", "./overrides/Share", "./overrides/ViewState"], function (Log, ObjectPath, ActionRuntime, CommonUtils, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, KPIManagement, MassEdit, Placeholder, Share, SideEffects, ViewState, ClassSupport, DeleteHelper, EditState, MessageStrip, ResourceModelHelper, StableIdHelper, CoreLibrary, PageController, ChartUtils, CommonHelper, DelegateUtil, FilterUtils, ExtensionAPI, TableScroller, ManagedObject, OverrideExecution, Device, StateUtil, hasher, ListReportTemplating, IntentBasedNavigationOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var system = Device.system;
  var bindingParser = ManagedObject.bindingParser;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;

  /**
   * Controller class for the list report page, used inside an SAP Fiori elements application.
   *
   * @hideconstructor
   * @public
   */
  let ListReportController = (_dec = defineUI5Class("sap.fe.templates.ListReport.ListReportController"), _dec2 = usingExtension(InternalRouting.override({
    onAfterBinding: function () {
      this.getView().getController()._onAfterBinding();
    }
  })), _dec3 = usingExtension(InternalIntentBasedNavigation.override({
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  })), _dec4 = usingExtension(SideEffects), _dec5 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec6 = usingExtension(Share.override(ShareOverrides)), _dec7 = usingExtension(ViewState.override(ViewStateOverrides)), _dec8 = usingExtension(KPIManagement), _dec9 = usingExtension(Placeholder), _dec10 = usingExtension(MassEdit), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = extensible(OverrideExecution.After), _dec15 = publicExtension(), _dec16 = extensible(OverrideExecution.After), _dec17 = publicExtension(), _dec18 = extensible(OverrideExecution.After), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ListReportController, _PageController);
    function ListReportController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sideEffects", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiManagement", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor9, _assertThisInitialized(_this));
      _this.formatters = {
        setALPControlMessageStrip(aIgnoredFields, bIsChart, oApplySupported) {
          let sText = "";
          bIsChart = bIsChart === "true" || bIsChart === true;
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
            const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, oFilterBar.data("entityType"), oFilterBar, getResourceModel(oFilterBar));
            const bIsSearchIgnored = !oApplySupported.enableSearch;
            sText = bIsChart ? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored) : MessageStrip.getText(aIgnoredLabels, oFilterBar, "");
            return sText;
          }
        }
      };
      _this.handlers = {
        onFilterSearch() {
          this._getFilterBarControl().triggerSearch();
        },
        onFiltersChanged(oEvent) {
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar) {
            const oInternalModelContext = this.getView().getBindingContext("internal");
            // Pending filters into FilterBar to be used for custom views
            this.onPendingFilters();
            const appliedFiltersText = oFilterBar.getAssignedFiltersText().filtersText;
            const appliedFilterBinding = bindingParser(appliedFiltersText);
            if (appliedFilterBinding) {
              var _this$getView$byId;
              (_this$getView$byId = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId === void 0 ? void 0 : _this$getView$byId.bindText(appliedFilterBinding);
            } else {
              var _this$getView$byId2;
              (_this$getView$byId2 = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId2 === void 0 ? void 0 : _this$getView$byId2.setText(appliedFiltersText);
            }
            if (oInternalModelContext && oEvent.getParameter("conditionsBased")) {
              oInternalModelContext.setProperty("hasPendingFilters", true);
            }
          }
        },
        onVariantSelected(oEvent) {
          const oVM = oEvent.getSource();
          const currentVariantKey = oEvent.getParameter("key");
          const oMultiModeControl = this._getMultiModeControl();
          if (oMultiModeControl && !(oVM !== null && oVM !== void 0 && oVM.getParent().isA("sap.ui.mdc.ActionToolbar"))) {
            //Not a Control Variant
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.invalidateContent();
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.setFreezeContent(true);
          }

          // setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
          setTimeout(() => {
            if (this._shouldAutoTriggerSearch(oVM)) {
              // the app state will be updated via onSearch handler
              return this._getFilterBarControl().triggerSearch();
            } else if (!this._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
              this.getExtensionAPI().updateAppState();
            }
          }, 0);
        },
        onVariantSaved() {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 1000);
        },
        onSearch() {
          const oFilterBar = this._getFilterBarControl();
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oMdcChart = this.getChartControl();
          const bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
          oInternalModelContext.setProperty("hasPendingFilters", false);
          oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);
          if (!this._getMultiModeControl()) {
            this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
          }
          if (oMdcChart) {
            // disable bound actions TODO: this clears everything for the chart?
            oMdcChart.getBindingContext("internal").setProperty("", {});
            const oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal");
            const sTemplateContentView = oPageInternalModelContext.getProperty(`${oPageInternalModelContext.getPath()}/alpContentView`);
            if (sTemplateContentView === TemplateContentView.Chart) {
              this.hasPendingChartChanges = true;
            }
            if (sTemplateContentView === TemplateContentView.Table) {
              this.hasPendingTableChanges = true;
            }
          }
          // store filter bar conditions to use later while navigation
          StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
            this.filterBarConditions = oExternalState.filter;
          }).catch(function (oError) {
            Log.error("Error while retrieving the external state", oError);
          });
          if (this.getView().getViewData().liveMode === false) {
            this.getExtensionAPI().updateAppState();
          }
          if (system.phone) {
            const oDynamicPage = this._getDynamicListReportControl();
            oDynamicPage.setHeaderExpanded(false);
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onChartSelectionChanged(oEvent) {
          const oMdcChart = oEvent.getSource().getContent(),
            oTable = this._getTable(),
            aData = oEvent.getParameter("data"),
            oInternalModelContext = this.getView().getBindingContext("internal");
          if (aData) {
            ChartUtils.setChartFilters(oMdcChart);
          }
          const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
          if (sTemplateContentView === TemplateContentView.Chart) {
            this.hasPendingChartChanges = true;
          } else if (oTable) {
            oTable.rebind();
            this.hasPendingChartChanges = false;
          }
        },
        onSegmentedButtonPressed(oEvent) {
          const sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          oInternalModelContext.setProperty("alpContentView", sSelectedKey);
          const oChart = this.getChartControl();
          const oTable = this._getTable();
          const oSegmentedButtonDelegate = {
            onAfterRendering() {
              const aItems = oSegmentedButton.getItems();
              aItems.forEach(function (oItem) {
                if (oItem.getKey() === sSelectedKey) {
                  oItem.focus();
                }
              });
              oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
            }
          };
          const oSegmentedButton = sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart");
          if (oSegmentedButton !== oEvent.getSource()) {
            oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
          }
          switch (sSelectedKey) {
            case TemplateContentView.Table:
              this._updateTable(oTable);
              break;
            case TemplateContentView.Chart:
              this._updateChart(oChart);
              break;
            case TemplateContentView.Hybrid:
              this._updateTable(oTable);
              this._updateChart(oChart);
              break;
            default:
              break;
          }
          this.getExtensionAPI().updateAppState();
        },
        onFiltersSegmentedButtonPressed(oEvent) {
          const isCompact = oEvent.getParameter("key") === "Compact";
          this._getFilterBarControl().setVisible(isCompact);
          this._getVisualFilterBarControl().setVisible(!isCompact);
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        onDynamicPageTitleStateChanged(oEvent) {
          const filterBar = this._getFilterBarControl();
          if (filterBar && filterBar.getSegmentedButton()) {
            if (oEvent.getParameter("isExpanded")) {
              filterBar.getSegmentedButton().setVisible(true);
            } else {
              filterBar.getSegmentedButton().setVisible(false);
            }
          }
        }
      };
      return _this;
    }
    var _proto = ListReportController.prototype;
    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    };
    _proto.onInit = function onInit() {
      PageController.prototype.onInit.apply(this);
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("hasPendingFilters", true);
      oInternalModelContext.setProperty("hideDraftInfo", false);
      oInternalModelContext.setProperty("uom", {});
      oInternalModelContext.setProperty("scalefactor", {});
      oInternalModelContext.setProperty("scalefactorNumber", {});
      oInternalModelContext.setProperty("currency", {});
      if (this._hasMultiVisualizations()) {
        let alpContentView = this._getDefaultPath();
        if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
          alpContentView = TemplateContentView.Chart;
        }
        oInternalModelContext.setProperty("alpContentView", alpContentView);
      }

      // Store conditions from filter bar
      // this is later used before navigation to get conditions applied on the filter bar
      this.filterBarConditions = {};

      // As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
      // happen after the routeMatch event has been processed (otherwise the router gets broken)
      this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

      // Configure the initial load settings
      this._setInitLoad();
    };
    _proto.onExit = function onExit() {
      delete this.filterBarConditions;
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
    };
    _proto._onAfterBinding = function _onAfterBinding() {
      const aTables = this._getControls("table");
      if (EditState.isEditStateDirty()) {
        var _this$_getMultiModeCo, _this$_getTable;
        (_this$_getMultiModeCo = this._getMultiModeControl()) === null || _this$_getMultiModeCo === void 0 ? void 0 : _this$_getMultiModeCo.invalidateContent();
        const oTableBinding = (_this$_getTable = this._getTable()) === null || _this$_getTable === void 0 ? void 0 : _this$_getTable.getRowBinding();
        if (oTableBinding) {
          if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
            // there is an issue if we use a timeout with a kept alive context used on another page
            oTableBinding.refresh();
          } else {
            if (!this.sUpdateTimer) {
              this.sUpdateTimer = setTimeout(() => {
                oTableBinding.refresh();
                delete this.sUpdateTimer;
              }, 0);
            }

            // Update action enablement and visibility upon table data update.
            const fnUpdateTableActions = () => {
              this._updateTableActions(aTables);
              oTableBinding.detachDataReceived(fnUpdateTableActions);
            };
            oTableBinding.attachDataReceived(fnUpdateTableActions);
          }
        }
        EditState.setEditStateProcessed();
      }
      if (!this.sUpdateTimer) {
        this._updateTableActions(aTables);
      }
      const internalModelContext = this.getView().getBindingContext("internal");
      if (!internalModelContext.getProperty("initialVariantApplied")) {
        const viewId = this.getView().getId();
        this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()));
        internalModelContext.setProperty("initialVariantApplied", true);
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      PageController.prototype.onBeforeRendering.apply(this);
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      if (mParameters.forceFocus) {
        this._setInitialFocus();
      }
      // Remove the handler on back navigation that displays Draft confirmation
      this.getAppComponent().getShellServices().setBackNavigation(undefined);
    }

    /**
     * Method called when the content of a custom view used in a list report needs to be refreshed.
     * This happens either when there is a change on the FilterBar and the search is triggered,
     * or when a tab with custom content is selected.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
     * and the view refresh cause (tabChanged or search).
     * The map looks like this:
     * <code><pre>
     * 	{
     * 		filterConditions: {
     * 			Country: [
     * 				{
     * 					operator: "EQ"
     *					validated: "NotValidated"
     *					values: ["Germany", ...]
     * 				},
     * 				...
     * 			]
     * 			...
     * 		},
     *		currentTabId: "fe::CustomTab::tab1",
     *		refreshCause: "tabChanged" | "search"
     *	}
     * </pre></code>
     * @public
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onViewNeedsRefresh = function onViewNeedsRefresh(mParameters) {
      /* To be overriden */
    }

    /**
     * Method called when a filter or search value has been changed in the FilterBar,
     * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
     * Typically, the content of the current tab is greyed out until the filters are validated.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @public
     */;
    _proto.onPendingFilters = function onPendingFilters() {
      /* To be overriden */
    };
    _proto.getCurrentEntitySet = function getCurrentEntitySet() {
      var _this$_getTable2;
      return (_this$_getTable2 = this._getTable()) === null || _this$_getTable2 === void 0 ? void 0 : _this$_getTable2.data("targetCollectionPath").slice(1);
    }

    /**
     * Method called when the 'Clear' button on the FilterBar is pressed.
     *
     * @public
     */;
    _proto.onAfterClear = function onAfterClear() {
      /* To be overriden */
    }

    /**
     * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
     *
     * @param aTables Array of tables in the list report
     * @private
     */;
    _proto._updateTableActions = function _updateTableActions(aTables) {
      let aIBNActions = [];
      aTables.forEach(function (oTable) {
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oInternalModelContext = oTable.getBindingContext("internal"),
          oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
        oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
        // Refresh enablement of delete button
        DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
      });
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
    }

    /**
     * This method scrolls to a specific row on all the available tables.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
     * @param sRowPath The path of the table row context to be scrolled to
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      this._getControls("table").forEach(function (oTable) {
        TableScroller.scrollTableToRow(oTable, sRowPath);
      });
    }

    /**
     * This method sets the initial focus in a list report based on the User Experience guidelines.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
     */;
    _proto._setInitialFocus = function _setInitialFocus() {
      const dynamicPage = this._getDynamicListReportControl(),
        isHeaderExpanded = dynamicPage.getHeaderExpanded(),
        filterBar = this._getFilterBarControl();
      if (filterBar) {
        //Enabling mandatory filter fields message dialog
        if (!filterBar.getShowMessages()) {
          filterBar.setShowMessages(true);
        }
        if (isHeaderExpanded) {
          const firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem) {
            return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
          });
          //Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
          if (firstEmptyMandatoryField) {
            firstEmptyMandatoryField.focus();
          } else if (this._isInitLoadEnabled() && filterBar.getFilterItems().length > 0) {
            //BCP: 2380008406 Add check for available filterItems
            filterBar.getFilterItems()[0].focus();
          } else {
            var _this$getView$byId3;
            //Focusing on the Go button
            (_this$getView$byId3 = this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`)) === null || _this$getView$byId3 === void 0 ? void 0 : _this$getView$byId3.focus();
          }
        } else if (this._isInitLoadEnabled()) {
          var _this$_getTable3;
          (_this$_getTable3 = this._getTable()) === null || _this$_getTable3 === void 0 ? void 0 : _this$_getTable3.focusRow(0).catch(function (error) {
            Log.error("Error while setting initial focus on the table ", error);
          });
        }
      } else {
        var _this$_getTable4;
        (_this$_getTable4 = this._getTable()) === null || _this$_getTable4 === void 0 ? void 0 : _this$_getTable4.focusRow(0).catch(function (error) {
          Log.error("Error while setting initial focus on the table ", error);
        });
      }
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
      return {
        title: oManifestEntry.title,
        subtitle: oManifestEntry.subTitle || "",
        intent: "",
        icon: ""
      };
    };
    _proto._getFilterBarControl = function _getFilterBarControl() {
      return this.getView().byId(this._getFilterBarControlId());
    };
    _proto._getDynamicListReportControl = function _getDynamicListReportControl() {
      return this.getView().byId(this._getDynamicListReportControlId());
    };
    _proto._getAdaptationFilterBarControl = function _getAdaptationFilterBarControl() {
      // If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
      // and we return the adaptation filter bar as an active control (visible for the user)
      const adaptationFilterBar = this._getFilterBarControl().getInbuiltFilter();
      return adaptationFilterBar !== null && adaptationFilterBar !== void 0 && adaptationFilterBar.getParent() ? adaptationFilterBar : undefined;
    };
    _proto._getSegmentedButton = function _getSegmentedButton(sControl) {
      var _ref;
      const sSegmentedButtonId = (_ref = sControl === "Chart" ? this.getChartControl() : this._getTable()) === null || _ref === void 0 ? void 0 : _ref.data("segmentedButtonId");
      return this.getView().byId(sSegmentedButtonId);
    };
    _proto._getControlFromPageModelProperty = function _getControlFromPageModelProperty(sPath) {
      var _this$_getPageModel;
      const controlId = (_this$_getPageModel = this._getPageModel()) === null || _this$_getPageModel === void 0 ? void 0 : _this$_getPageModel.getProperty(sPath);
      return controlId && this.getView().byId(controlId);
    };
    _proto._getDynamicListReportControlId = function _getDynamicListReportControlId() {
      var _this$_getPageModel2;
      return ((_this$_getPageModel2 = this._getPageModel()) === null || _this$_getPageModel2 === void 0 ? void 0 : _this$_getPageModel2.getProperty("/dynamicListReportId")) || "";
    };
    _proto._getFilterBarControlId = function _getFilterBarControlId() {
      var _this$_getPageModel3;
      return ((_this$_getPageModel3 = this._getPageModel()) === null || _this$_getPageModel3 === void 0 ? void 0 : _this$_getPageModel3.getProperty("/filterBarId")) || "";
    };
    _proto.getChartControl = function getChartControl() {
      return this._getControlFromPageModelProperty("/singleChartId");
    };
    _proto._getVisualFilterBarControl = function _getVisualFilterBarControl() {
      const sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
      return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
    };
    _proto._getFilterBarVariantControl = function _getFilterBarVariantControl() {
      return this._getControlFromPageModelProperty("/variantManagement/id");
    };
    _proto._getMultiModeControl = function _getMultiModeControl() {
      return this.getView().byId("fe::TabMultipleMode::Control");
    };
    _proto._getTable = function _getTable() {
      if (this._isMultiMode()) {
        var _this$_getMultiModeCo2, _this$_getMultiModeCo3;
        const oControl = (_this$_getMultiModeCo2 = this._getMultiModeControl()) === null || _this$_getMultiModeCo2 === void 0 ? void 0 : (_this$_getMultiModeCo3 = _this$_getMultiModeCo2.getSelectedInnerControl()) === null || _this$_getMultiModeCo3 === void 0 ? void 0 : _this$_getMultiModeCo3.content;
        return oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Table") ? oControl : undefined;
      } else {
        return this._getControlFromPageModelProperty("/singleTableId");
      }
    };
    _proto._getControls = function _getControls(sKey) {
      if (this._isMultiMode()) {
        const aControls = [];
        const oTabMultiMode = this._getMultiModeControl().content;
        oTabMultiMode.getItems().forEach(oItem => {
          const oControl = this.getView().byId(oItem.getKey());
          if (oControl && sKey) {
            if (oItem.getKey().indexOf(`fe::${sKey}`) > -1) {
              aControls.push(oControl);
            }
          } else if (oControl !== undefined && oControl !== null) {
            aControls.push(oControl);
          }
        });
        return aControls;
      } else if (sKey === "Chart") {
        const oChart = this.getChartControl();
        return oChart ? [oChart] : [];
      } else {
        const oTable = this._getTable();
        return oTable ? [oTable] : [];
      }
    };
    _proto._getDefaultPath = function _getDefaultPath() {
      var _this$_getPageModel4;
      const defaultPath = ListReportTemplating.getDefaultPath(((_this$_getPageModel4 = this._getPageModel()) === null || _this$_getPageModel4 === void 0 ? void 0 : _this$_getPageModel4.getProperty("/views")) || []);
      switch (defaultPath) {
        case "primary":
          return TemplateContentView.Chart;
        case "secondary":
          return TemplateContentView.Table;
        case "both":
        default:
          return TemplateContentView.Hybrid;
      }
    }

    /**
     * Method to know if ListReport is configured with Multiple Table mode.
     *
     * @function
     * @name _isMultiMode
     * @returns Is Multiple Table mode set?
     */;
    _proto._isMultiMode = function _isMultiMode() {
      var _this$_getPageModel5;
      return !!((_this$_getPageModel5 = this._getPageModel()) !== null && _this$_getPageModel5 !== void 0 && _this$_getPageModel5.getProperty("/multiViewsControl"));
    }

    /**
     * Method to know if ListReport is configured to load data at start up.
     *
     * @function
     * @name _isInitLoadDisabled
     * @returns Is InitLoad enabled?
     */;
    _proto._isInitLoadEnabled = function _isInitLoadEnabled() {
      const initLoadMode = this.getView().getViewData().initialLoad;
      return initLoadMode === InitialLoadMode.Enabled;
    };
    _proto._hasMultiVisualizations = function _hasMultiVisualizations() {
      var _this$_getPageModel6;
      return (_this$_getPageModel6 = this._getPageModel()) === null || _this$_getPageModel6 === void 0 ? void 0 : _this$_getPageModel6.getProperty("/hasMultiVisualizations");
    }

    /**
     * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
     * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
     */;
    _proto._disableInitLoad = function _disableInitLoad() {
      const filterBar = this._getFilterBarControl();
      // check for filter bar hidden
      if (filterBar) {
        filterBar.setSuspendSelection(true);
      }
    }

    /**
     * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
     * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
     *
     * @returns Boolean true if data should be loaded automatically, false otherwise
     */;
    _proto._applyAutomaticallyOnStandardVariant = function _applyAutomaticallyOnStandardVariant() {
      // We always return false and take care of it when view state is set
      return false;
    }

    /**
     * Configure the settings for initial load based on
     * - manifest setting initLoad - Enabled/Disabled/Auto
     * - user's setting of applyAutomatically on variant
     * - if there are default filters
     * We disable the filter bar search at the beginning and enable it when view state is set.
     */;
    _proto._setInitLoad = function _setInitLoad() {
      // if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
      if (!this._isInitLoadEnabled()) {
        this._disableInitLoad();
      }
      // set hook for flex for when standard variant is set (at start or by user at runtime)
      // required to override the user setting 'apply automatically' behaviour if there are no filters
      const variantManagementId = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), this._getPageModel());
      const variantManagement = variantManagementId && this.getView().byId(variantManagementId);
      if (variantManagement) {
        variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
      }
    };
    _proto._setShareModel = function _setShareModel() {
      // TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
      // this method is currently not called anymore from the init method

      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      //var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
      //var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

      //shareModel: Holds all the sharing relevant information and info used in XML view
      const oShareInfo = {
        bookmarkTitle: document.title,
        //To name the bookmark according to the app title.
        bookmarkCustomUrl: function () {
          const sHash = hasher.getHash();
          return sHash ? `#${sHash}` : window.location.href;
        },
        /*
        				To be activated once the FLP shows the count - see comment above
        				bookmarkServiceUrl: function() {
        					//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
        					// we should use table.getListBindingInfo instead of the binding
        					var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
        					return oBinding ? fnGetDownloadUrl(oBinding) : "";
        				},*/
        isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
      };
      const oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
      oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
    }

    /**
     * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
     *
     * @param oInternalModelContext The internal model context
     * @param oFilterBar MDC filter bar
     */;
    _proto._updateALPNotApplicableFields = function _updateALPNotApplicableFields(oInternalModelContext, oFilterBar) {
      const mCache = {};
      const ignoredFields = {},
        aTables = this._getControls("table"),
        aCharts = this._getControls("Chart");
      if (!aTables.length || !aCharts.length) {
        // If there's not a table and a chart, we're not in the ALP case
        return;
      }

      // For the moment, there's nothing for tables...
      aCharts.forEach(function (oChart) {
        const sChartEntityPath = oChart.data("targetCollectionPath"),
          sChartEntitySet = sChartEntityPath.slice(1),
          sCacheKey = `${sChartEntitySet}Chart`;
        if (!mCache[sCacheKey]) {
          mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
        }
        ignoredFields[sCacheKey] = mCache[sCacheKey];
      });
      oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
    };
    _proto._isFilterBarHidden = function _isFilterBarHidden() {
      return this.getView().getViewData().hideFilterBar;
    };
    _proto._getApplyAutomaticallyOnVariant = function _getApplyAutomaticallyOnVariant(VariantManagement, key) {
      if (!VariantManagement || !key) {
        return false;
      }
      const variants = VariantManagement.getVariants();
      const currentVariant = variants.find(function (variant) {
        return variant && variant.key === key;
      });
      return currentVariant && currentVariant.executeOnSelect || false;
    };
    _proto._shouldAutoTriggerSearch = function _shouldAutoTriggerSearch(oVM) {
      if (this.getView().getViewData().initialLoad === InitialLoadMode.Auto && (!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())) {
        const oFilterBar = this._getFilterBarControl();
        if (oFilterBar) {
          const oConditions = oFilterBar.getConditions();
          for (const sKey in oConditions) {
            // ignore filters starting with $ (e.g. $search, $editState)
            if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
              // load data as per user's setting of applyAutomatically on the variant
              const standardVariant = oVM.getVariants().find(variant => {
                return variant.key === oVM.getCurrentVariantKey();
              });
              return standardVariant && standardVariant.executeOnSelect;
            }
          }
        }
      }
      return false;
    };
    _proto._updateTable = function _updateTable(oTable) {
      if (!oTable.isTableBound() || this.hasPendingChartChanges) {
        oTable.rebind();
        this.hasPendingChartChanges = false;
      }
    };
    _proto._updateChart = function _updateChart(oChart) {
      const oInnerChart = oChart.getControlDelegate()._getChart(oChart);
      if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
        oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
        this.hasPendingTableChanges = false;
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      const aTables = this._getControls();
      const sEntitySet = this.getView().getViewData().entitySet;
      const sText = getResourceModel(this.getView()).getText("T_TABLE_AND_CHART_NO_DATA_TEXT", undefined, sEntitySet);
      aTables.forEach(function (oTable) {
        if (oTable.isA("sap.ui.mdc.Table")) {
          oTable.setNoData(sText);
        }
      });
    };
    return ListReportController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sideEffects", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "kpiManagement", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onViewNeedsRefresh", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onViewNeedsRefresh"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPendingFilters", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "onPendingFilters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterClear", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterClear"), _class2.prototype)), _class2)) || _class);
  return ListReportController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiQ29yZUxpYnJhcnkiLCJJbml0aWFsTG9hZE1vZGUiLCJMaXN0UmVwb3J0Q29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJJbnRlcm5hbFJvdXRpbmciLCJvdmVycmlkZSIsIm9uQWZ0ZXJCaW5kaW5nIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfb25BZnRlckJpbmRpbmciLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEVudGl0eVNldCIsImJhc2UiLCJnZXRDdXJyZW50RW50aXR5U2V0IiwiU2lkZUVmZmVjdHMiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIlNoYXJlIiwiU2hhcmVPdmVycmlkZXMiLCJWaWV3U3RhdGUiLCJWaWV3U3RhdGVPdmVycmlkZXMiLCJLUElNYW5hZ2VtZW50IiwiUGxhY2Vob2xkZXIiLCJNYXNzRWRpdCIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiZm9ybWF0dGVycyIsInNldEFMUENvbnRyb2xNZXNzYWdlU3RyaXAiLCJhSWdub3JlZEZpZWxkcyIsImJJc0NoYXJ0Iiwib0FwcGx5U3VwcG9ydGVkIiwic1RleHQiLCJvRmlsdGVyQmFyIiwiX2dldEZpbHRlckJhckNvbnRyb2wiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJhSWdub3JlZExhYmVscyIsIk1lc3NhZ2VTdHJpcCIsImdldExhYmVscyIsImRhdGEiLCJnZXRSZXNvdXJjZU1vZGVsIiwiYklzU2VhcmNoSWdub3JlZCIsImVuYWJsZVNlYXJjaCIsImdldEFMUFRleHQiLCJnZXRUZXh0IiwiaGFuZGxlcnMiLCJvbkZpbHRlclNlYXJjaCIsInRyaWdnZXJTZWFyY2giLCJvbkZpbHRlcnNDaGFuZ2VkIiwib0V2ZW50Iiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJvblBlbmRpbmdGaWx0ZXJzIiwiYXBwbGllZEZpbHRlcnNUZXh0IiwiZ2V0QXNzaWduZWRGaWx0ZXJzVGV4dCIsImZpbHRlcnNUZXh0IiwiYXBwbGllZEZpbHRlckJpbmRpbmciLCJiaW5kaW5nUGFyc2VyIiwiYnlJZCIsImJpbmRUZXh0Iiwic2V0VGV4dCIsImdldFBhcmFtZXRlciIsInNldFByb3BlcnR5Iiwib25WYXJpYW50U2VsZWN0ZWQiLCJvVk0iLCJnZXRTb3VyY2UiLCJjdXJyZW50VmFyaWFudEtleSIsIm9NdWx0aU1vZGVDb250cm9sIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJnZXRQYXJlbnQiLCJpc0EiLCJpbnZhbGlkYXRlQ29udGVudCIsInNldEZyZWV6ZUNvbnRlbnQiLCJzZXRUaW1lb3V0IiwiX3Nob3VsZEF1dG9UcmlnZ2VyU2VhcmNoIiwiX2dldEFwcGx5QXV0b21hdGljYWxseU9uVmFyaWFudCIsImdldEV4dGVuc2lvbkFQSSIsInVwZGF0ZUFwcFN0YXRlIiwib25WYXJpYW50U2F2ZWQiLCJvblNlYXJjaCIsIm9NZGNDaGFydCIsImdldENoYXJ0Q29udHJvbCIsImJIaWRlRHJhZnQiLCJGaWx0ZXJVdGlscyIsImdldEVkaXRTdGF0ZUlzSGlkZURyYWZ0IiwiZ2V0Q29uZGl0aW9ucyIsIl91cGRhdGVBTFBOb3RBcHBsaWNhYmxlRmllbGRzIiwib1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dCIsInNUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiZ2V0UHJvcGVydHkiLCJnZXRQYXRoIiwiQ2hhcnQiLCJoYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzIiwiVGFibGUiLCJoYXNQZW5kaW5nVGFibGVDaGFuZ2VzIiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwidGhlbiIsIm9FeHRlcm5hbFN0YXRlIiwiZmlsdGVyQmFyQ29uZGl0aW9ucyIsImZpbHRlciIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJnZXRWaWV3RGF0YSIsImxpdmVNb2RlIiwic3lzdGVtIiwicGhvbmUiLCJvRHluYW1pY1BhZ2UiLCJfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sIiwic2V0SGVhZGVyRXhwYW5kZWQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJvQ29udHJvbGxlciIsInNPdXRib3VuZFRhcmdldCIsIm9Db250ZXh0Iiwic0NyZWF0ZVBhdGgiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwib25DaGFydFNlbGVjdGlvbkNoYW5nZWQiLCJnZXRDb250ZW50Iiwib1RhYmxlIiwiX2dldFRhYmxlIiwiYURhdGEiLCJDaGFydFV0aWxzIiwic2V0Q2hhcnRGaWx0ZXJzIiwicmViaW5kIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwic1NlbGVjdGVkS2V5IiwibVBhcmFtZXRlcnMiLCJrZXkiLCJvQ2hhcnQiLCJvU2VnbWVudGVkQnV0dG9uRGVsZWdhdGUiLCJvbkFmdGVyUmVuZGVyaW5nIiwiYUl0ZW1zIiwib1NlZ21lbnRlZEJ1dHRvbiIsImdldEl0ZW1zIiwiZm9yRWFjaCIsIm9JdGVtIiwiZ2V0S2V5IiwiZm9jdXMiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiX2dldFNlZ21lbnRlZEJ1dHRvbiIsImFkZEV2ZW50RGVsZWdhdGUiLCJfdXBkYXRlVGFibGUiLCJfdXBkYXRlQ2hhcnQiLCJIeWJyaWQiLCJvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiaXNDb21wYWN0Iiwic2V0VmlzaWJsZSIsIl9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sIiwib25TdGF0ZUNoYW5nZSIsIm9uRHluYW1pY1BhZ2VUaXRsZVN0YXRlQ2hhbmdlZCIsImZpbHRlckJhciIsImdldFNlZ21lbnRlZEJ1dHRvbiIsImV4dGVuc2lvbkFQSSIsIkV4dGVuc2lvbkFQSSIsIm9uSW5pdCIsIlBhZ2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiYXBwbHkiLCJfaGFzTXVsdGlWaXN1YWxpemF0aW9ucyIsImFscENvbnRlbnRWaWV3IiwiX2dldERlZmF1bHRQYXRoIiwiZGVza3RvcCIsImdldEFwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5Iiwid2FpdEZvclJvdXRlTWF0Y2hCZWZvcmVOYXZpZ2F0aW9uIiwiX3NldEluaXRMb2FkIiwib25FeGl0IiwiZGVzdHJveSIsImFUYWJsZXMiLCJfZ2V0Q29udHJvbHMiLCJFZGl0U3RhdGUiLCJpc0VkaXRTdGF0ZURpcnR5Iiwib1RhYmxlQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJDb21tb25VdGlscyIsIl9pc0ZjbEVuYWJsZWQiLCJyZWZyZXNoIiwic1VwZGF0ZVRpbWVyIiwiZm5VcGRhdGVUYWJsZUFjdGlvbnMiLCJfdXBkYXRlVGFibGVBY3Rpb25zIiwiZGV0YWNoRGF0YVJlY2VpdmVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwic2V0RWRpdFN0YXRlUHJvY2Vzc2VkIiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJ2aWV3SWQiLCJnZXRJZCIsInBhZ2VSZWFkeSIsIndhaXRGb3IiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJhcHBseUFwcFN0YXRlIiwib25CZWZvcmVSZW5kZXJpbmciLCJvblBhZ2VSZWFkeSIsImZvcmNlRm9jdXMiLCJfc2V0SW5pdGlhbEZvY3VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwidW5kZWZpbmVkIiwib25WaWV3TmVlZHNSZWZyZXNoIiwic2xpY2UiLCJvbkFmdGVyQ2xlYXIiLCJhSUJOQWN0aW9ucyIsImdldElCTkFjdGlvbnMiLCJvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiSlNPTiIsInBhcnNlIiwiQ29tbW9uSGVscGVyIiwicGFyc2VDdXN0b21EYXRhIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsImFTZWxlY3RlZENvbnRleHRzIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIkRlbGV0ZUhlbHBlciIsInVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJ1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIl9zY3JvbGxUYWJsZXNUb1JvdyIsInNSb3dQYXRoIiwiVGFibGVTY3JvbGxlciIsInNjcm9sbFRhYmxlVG9Sb3ciLCJkeW5hbWljUGFnZSIsImlzSGVhZGVyRXhwYW5kZWQiLCJnZXRIZWFkZXJFeHBhbmRlZCIsImdldFNob3dNZXNzYWdlcyIsInNldFNob3dNZXNzYWdlcyIsImZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCIsImdldEZpbHRlckl0ZW1zIiwiZmluZCIsIm9GaWx0ZXJJdGVtIiwiZ2V0UmVxdWlyZWQiLCJfaXNJbml0TG9hZEVuYWJsZWQiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbElkIiwiZm9jdXNSb3ciLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvTWFuaWZlc3RFbnRyeSIsImdldE1hbmlmZXN0RW50cnkiLCJ0aXRsZSIsInN1YnRpdGxlIiwic3ViVGl0bGUiLCJpbnRlbnQiLCJpY29uIiwiX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbElkIiwiX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sIiwiYWRhcHRhdGlvbkZpbHRlckJhciIsImdldEluYnVpbHRGaWx0ZXIiLCJzQ29udHJvbCIsInNTZWdtZW50ZWRCdXR0b25JZCIsIl9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5Iiwic1BhdGgiLCJjb250cm9sSWQiLCJfZ2V0UGFnZU1vZGVsIiwic1Zpc3VhbEZpbHRlckJhcklkIiwiU3RhYmxlSWRIZWxwZXIiLCJnZW5lcmF0ZSIsIl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCIsIl9pc011bHRpTW9kZSIsIm9Db250cm9sIiwiZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2wiLCJjb250ZW50Iiwic0tleSIsImFDb250cm9scyIsIm9UYWJNdWx0aU1vZGUiLCJpbmRleE9mIiwicHVzaCIsImRlZmF1bHRQYXRoIiwiTGlzdFJlcG9ydFRlbXBsYXRpbmciLCJnZXREZWZhdWx0UGF0aCIsImluaXRMb2FkTW9kZSIsImluaXRpYWxMb2FkIiwiRW5hYmxlZCIsIl9kaXNhYmxlSW5pdExvYWQiLCJzZXRTdXNwZW5kU2VsZWN0aW9uIiwiX2FwcGx5QXV0b21hdGljYWxseU9uU3RhbmRhcmRWYXJpYW50IiwidmFyaWFudE1hbmFnZW1lbnRJZCIsImdldFZhcmlhbnRCYWNrUmVmZXJlbmNlIiwidmFyaWFudE1hbmFnZW1lbnQiLCJyZWdpc3RlckFwcGx5QXV0b21hdGljYWxseU9uU3RhbmRhcmRWYXJpYW50IiwiYmluZCIsIl9zZXRTaGFyZU1vZGVsIiwiZm5HZXRVc2VyIiwiT2JqZWN0UGF0aCIsImdldCIsIm9TaGFyZUluZm8iLCJib29rbWFya1RpdGxlIiwiZG9jdW1lbnQiLCJib29rbWFya0N1c3RvbVVybCIsInNIYXNoIiwiaGFzaGVyIiwiZ2V0SGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImlzU2hhcmVJbkphbUFjdGl2ZSIsImlzSmFtQWN0aXZlIiwib1RlbXBsYXRlUHJpdmF0ZU1vZGVsIiwiZ2V0T3duZXJDb21wb25lbnQiLCJnZXRNb2RlbCIsIm1DYWNoZSIsImlnbm9yZWRGaWVsZHMiLCJhQ2hhcnRzIiwic0NoYXJ0RW50aXR5UGF0aCIsInNDaGFydEVudGl0eVNldCIsInNDYWNoZUtleSIsImdldE5vdEFwcGxpY2FibGVGaWx0ZXJzIiwiX2lzRmlsdGVyQmFySGlkZGVuIiwiaGlkZUZpbHRlckJhciIsIlZhcmlhbnRNYW5hZ2VtZW50IiwidmFyaWFudHMiLCJnZXRWYXJpYW50cyIsImN1cnJlbnRWYXJpYW50IiwidmFyaWFudCIsImV4ZWN1dGVPblNlbGVjdCIsIkF1dG8iLCJnZXRTdGFuZGFyZFZhcmlhbnRLZXkiLCJnZXRDdXJyZW50VmFyaWFudEtleSIsIm9Db25kaXRpb25zIiwic3RhcnRzV2l0aCIsInN0YW5kYXJkVmFyaWFudCIsImlzVGFibGVCb3VuZCIsIm9Jbm5lckNoYXJ0IiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiX2dldENoYXJ0IiwiaXNCb3VuZCIsImdldEJpbmRpbmdJbmZvIiwic0VudGl0eVNldCIsImVudGl0eVNldCIsInNldE5vRGF0YSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTGlzdFJlcG9ydENvbnRyb2xsZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB0eXBlIER5bmFtaWNQYWdlIGZyb20gXCJzYXAvZi9EeW5hbWljUGFnZVwiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IEludGVybmFsUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgS1BJTWFuYWdlbWVudCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvS1BJTWFuYWdlbWVudFwiO1xuaW1wb3J0IE1hc3NFZGl0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NYXNzRWRpdFwiO1xuaW1wb3J0IFBsYWNlaG9sZGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QbGFjZWhvbGRlclwiO1xuaW1wb3J0IFNoYXJlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaGFyZVwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaWRlRWZmZWN0c1wiO1xuaW1wb3J0IFZpZXdTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvVmlld1N0YXRlXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0ZpbHRlckJhclwiO1xuaW1wb3J0IHtcblx0ZGVmaW5lVUk1Q2xhc3MsXG5cdGV4dGVuc2libGUsXG5cdGZpbmFsRXh0ZW5zaW9uLFxuXHRwcml2YXRlRXh0ZW5zaW9uLFxuXHRwdWJsaWNFeHRlbnNpb24sXG5cdHVzaW5nRXh0ZW5zaW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IERlbGV0ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9EZWxldGVIZWxwZXJcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgTWVzc2FnZVN0cmlwIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01lc3NhZ2VTdHJpcFwiO1xuaW1wb3J0IHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFN0YWJsZUlkSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IE11bHRpcGxlTW9kZUNvbnRyb2wgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC9jb250cm9scy9NdWx0aXBsZU1vZGVDb250cm9sXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgVGFibGVTY3JvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9UYWJsZVNjcm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBTZWdtZW50ZWRCdXR0b24gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IHsgYmluZGluZ1BhcnNlciB9IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgaGFzaGVyIGZyb20gXCJzYXAvdWkvdGhpcmRwYXJ0eS9oYXNoZXJcIjtcbmltcG9ydCAqIGFzIExpc3RSZXBvcnRUZW1wbGF0aW5nIGZyb20gXCIuL0xpc3RSZXBvcnRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL0ludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IFNoYXJlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9TaGFyZVwiO1xuaW1wb3J0IFZpZXdTdGF0ZU92ZXJyaWRlcyBmcm9tIFwiLi9vdmVycmlkZXMvVmlld1N0YXRlXCI7XG5cbmNvbnN0IFRlbXBsYXRlQ29udGVudFZpZXcgPSBDb3JlTGlicmFyeS5UZW1wbGF0ZUNvbnRlbnRWaWV3LFxuXHRJbml0aWFsTG9hZE1vZGUgPSBDb3JlTGlicmFyeS5Jbml0aWFsTG9hZE1vZGU7XG5cbi8qKlxuICogQ29udHJvbGxlciBjbGFzcyBmb3IgdGhlIGxpc3QgcmVwb3J0IHBhZ2UsIHVzZWQgaW5zaWRlIGFuIFNBUCBGaW9yaSBlbGVtZW50cyBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5MaXN0UmVwb3J0Q29udHJvbGxlclwiKVxuY2xhc3MgTGlzdFJlcG9ydENvbnRyb2xsZXIgZXh0ZW5kcyBQYWdlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRJbnRlcm5hbFJvdXRpbmcub3ZlcnJpZGUoe1xuXHRcdFx0b25BZnRlckJpbmRpbmc6IGZ1bmN0aW9uICh0aGlzOiBJbnRlcm5hbFJvdXRpbmcpIHtcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcikuX29uQWZ0ZXJCaW5kaW5nKCk7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblxuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0SW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoe1xuXHRcdFx0Z2V0RW50aXR5U2V0OiBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0cmV0dXJuICh0aGlzLmJhc2UgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLmdldEN1cnJlbnRFbnRpdHlTZXQoKTtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdF9pbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbjtcblxuXHRAdXNpbmdFeHRlbnNpb24oU2lkZUVmZmVjdHMpXG5cdHNpZGVFZmZlY3RzITogU2lkZUVmZmVjdHM7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZShJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSkpXG5cdGludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVudEJhc2VkTmF2aWdhdGlvbjtcblxuXHRAdXNpbmdFeHRlbnNpb24oU2hhcmUub3ZlcnJpZGUoU2hhcmVPdmVycmlkZXMpKVxuXHRzaGFyZSE6IFNoYXJlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihWaWV3U3RhdGUub3ZlcnJpZGUoVmlld1N0YXRlT3ZlcnJpZGVzKSlcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihLUElNYW5hZ2VtZW50KVxuXHRrcGlNYW5hZ2VtZW50ITogS1BJTWFuYWdlbWVudDtcblxuXHRAdXNpbmdFeHRlbnNpb24oUGxhY2Vob2xkZXIpXG5cdHBsYWNlaG9sZGVyITogUGxhY2Vob2xkZXI7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXG5cdHByb3RlY3RlZCBleHRlbnNpb25BUEk/OiBFeHRlbnNpb25BUEk7XG5cblx0cHJpdmF0ZSBmaWx0ZXJCYXJDb25kaXRpb25zPzogYW55O1xuXG5cdHByaXZhdGUgc1VwZGF0ZVRpbWVyPzogYW55O1xuXG5cdHByaXZhdGUgaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcz86IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBoYXNQZW5kaW5nVGFibGVDaGFuZ2VzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogR2V0IHRoZSBleHRlbnNpb24gQVBJIGZvciB0aGUgY3VycmVudCBwYWdlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEByZXR1cm5zIFRoZSBleHRlbnNpb24gQVBJLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldEV4dGVuc2lvbkFQSSgpOiBFeHRlbnNpb25BUEkge1xuXHRcdGlmICghdGhpcy5leHRlbnNpb25BUEkpIHtcblx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJID0gbmV3IEV4dGVuc2lvbkFQSSh0aGlzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZXh0ZW5zaW9uQVBJO1xuXHR9XG5cblx0b25Jbml0KCkge1xuXHRcdFBhZ2VDb250cm9sbGVyLnByb3RvdHlwZS5vbkluaXQuYXBwbHkodGhpcyk7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblxuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImhhc1BlbmRpbmdGaWx0ZXJzXCIsIHRydWUpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImhpZGVEcmFmdEluZm9cIiwgZmFsc2UpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInVvbVwiLCB7fSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2NhbGVmYWN0b3JcIiwge30pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNjYWxlZmFjdG9yTnVtYmVyXCIsIHt9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJjdXJyZW5jeVwiLCB7fSk7XG5cblx0XHRpZiAodGhpcy5faGFzTXVsdGlWaXN1YWxpemF0aW9ucygpKSB7XG5cdFx0XHRsZXQgYWxwQ29udGVudFZpZXcgPSB0aGlzLl9nZXREZWZhdWx0UGF0aCgpO1xuXHRcdFx0aWYgKCFzeXN0ZW0uZGVza3RvcCAmJiBhbHBDb250ZW50VmlldyA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5IeWJyaWQpIHtcblx0XHRcdFx0YWxwQ29udGVudFZpZXcgPSBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0fVxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIiwgYWxwQ29udGVudFZpZXcpO1xuXHRcdH1cblxuXHRcdC8vIFN0b3JlIGNvbmRpdGlvbnMgZnJvbSBmaWx0ZXIgYmFyXG5cdFx0Ly8gdGhpcyBpcyBsYXRlciB1c2VkIGJlZm9yZSBuYXZpZ2F0aW9uIHRvIGdldCBjb25kaXRpb25zIGFwcGxpZWQgb24gdGhlIGZpbHRlciBiYXJcblx0XHR0aGlzLmZpbHRlckJhckNvbmRpdGlvbnMgPSB7fTtcblxuXHRcdC8vIEFzIEFwcFN0YXRlSGFuZGxlci5hcHBseUFwcFN0YXRlIHRyaWdnZXJzIGEgbmF2aWdhdGlvbiB3ZSB3YW50IHRvIG1ha2Ugc3VyZSBpdCB3aWxsXG5cdFx0Ly8gaGFwcGVuIGFmdGVyIHRoZSByb3V0ZU1hdGNoIGV2ZW50IGhhcyBiZWVuIHByb2Nlc3NlZCAob3RoZXJ3aXNlIHRoZSByb3V0ZXIgZ2V0cyBicm9rZW4pXG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0ZXJQcm94eSgpLndhaXRGb3JSb3V0ZU1hdGNoQmVmb3JlTmF2aWdhdGlvbigpO1xuXG5cdFx0Ly8gQ29uZmlndXJlIHRoZSBpbml0aWFsIGxvYWQgc2V0dGluZ3Ncblx0XHR0aGlzLl9zZXRJbml0TG9hZCgpO1xuXHR9XG5cblx0b25FeGl0KCkge1xuXHRcdGRlbGV0ZSB0aGlzLmZpbHRlckJhckNvbmRpdGlvbnM7XG5cdFx0aWYgKHRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSB0aGlzLmV4dGVuc2lvbkFQSTtcblx0fVxuXG5cdF9vbkFmdGVyQmluZGluZygpIHtcblx0XHRjb25zdCBhVGFibGVzID0gdGhpcy5fZ2V0Q29udHJvbHMoXCJ0YWJsZVwiKTtcblx0XHRpZiAoRWRpdFN0YXRlLmlzRWRpdFN0YXRlRGlydHkoKSkge1xuXHRcdFx0dGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpPy5pbnZhbGlkYXRlQ29udGVudCgpO1xuXHRcdFx0Y29uc3Qgb1RhYmxlQmluZGluZyA9IHRoaXMuX2dldFRhYmxlKCk/LmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdGlmIChvVGFibGVCaW5kaW5nKSB7XG5cdFx0XHRcdGlmIChDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdC8vIHRoZXJlIGlzIGFuIGlzc3VlIGlmIHdlIHVzZSBhIHRpbWVvdXQgd2l0aCBhIGtlcHQgYWxpdmUgY29udGV4dCB1c2VkIG9uIGFub3RoZXIgcGFnZVxuXHRcdFx0XHRcdG9UYWJsZUJpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmICghdGhpcy5zVXBkYXRlVGltZXIpIHtcblx0XHRcdFx0XHRcdHRoaXMuc1VwZGF0ZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdG9UYWJsZUJpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5zVXBkYXRlVGltZXI7XG5cdFx0XHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBVcGRhdGUgYWN0aW9uIGVuYWJsZW1lbnQgYW5kIHZpc2liaWxpdHkgdXBvbiB0YWJsZSBkYXRhIHVwZGF0ZS5cblx0XHRcdFx0XHRjb25zdCBmblVwZGF0ZVRhYmxlQWN0aW9ucyA9ICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVRhYmxlQWN0aW9ucyhhVGFibGVzKTtcblx0XHRcdFx0XHRcdG9UYWJsZUJpbmRpbmcuZGV0YWNoRGF0YVJlY2VpdmVkKGZuVXBkYXRlVGFibGVBY3Rpb25zKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdG9UYWJsZUJpbmRpbmcuYXR0YWNoRGF0YVJlY2VpdmVkKGZuVXBkYXRlVGFibGVBY3Rpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZVByb2Nlc3NlZCgpO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5zVXBkYXRlVGltZXIpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZVRhYmxlQWN0aW9ucyhhVGFibGVzKTtcblx0XHR9XG5cblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0aWYgKCFpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImluaXRpYWxWYXJpYW50QXBwbGllZFwiKSkge1xuXHRcdFx0Y29uc3Qgdmlld0lkID0gdGhpcy5nZXRWaWV3KCkuZ2V0SWQoKTtcblx0XHRcdHRoaXMucGFnZVJlYWR5LndhaXRGb3IodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRBcHBTdGF0ZUhhbmRsZXIoKS5hcHBseUFwcFN0YXRlKHZpZXdJZCwgdGhpcy5nZXRWaWV3KCkpKTtcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaW5pdGlhbFZhcmlhbnRBcHBsaWVkXCIsIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdFBhZ2VDb250cm9sbGVyLnByb3RvdHlwZS5vbkJlZm9yZVJlbmRlcmluZy5hcHBseSh0aGlzKTtcblx0fVxuXG5cdGZvcm1hdHRlcnMgPSB7XG5cdFx0c2V0QUxQQ29udHJvbE1lc3NhZ2VTdHJpcCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgYUlnbm9yZWRGaWVsZHM6IGFueVtdLCBiSXNDaGFydDogYW55LCBvQXBwbHlTdXBwb3J0ZWQ/OiBhbnkpIHtcblx0XHRcdGxldCBzVGV4dCA9IFwiXCI7XG5cdFx0XHRiSXNDaGFydCA9IGJJc0NoYXJ0ID09PSBcInRydWVcIiB8fCBiSXNDaGFydCA9PT0gdHJ1ZTtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAob0ZpbHRlckJhciAmJiBBcnJheS5pc0FycmF5KGFJZ25vcmVkRmllbGRzKSAmJiBhSWdub3JlZEZpZWxkcy5sZW5ndGggPiAwICYmIGJJc0NoYXJ0KSB7XG5cdFx0XHRcdGNvbnN0IGFJZ25vcmVkTGFiZWxzID0gTWVzc2FnZVN0cmlwLmdldExhYmVscyhcblx0XHRcdFx0XHRhSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0XHRvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0XHRcdG9GaWx0ZXJCYXIsXG5cdFx0XHRcdFx0Z2V0UmVzb3VyY2VNb2RlbChvRmlsdGVyQmFyKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBiSXNTZWFyY2hJZ25vcmVkID0gIW9BcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2g7XG5cdFx0XHRcdHNUZXh0ID0gYklzQ2hhcnRcblx0XHRcdFx0XHQ/IE1lc3NhZ2VTdHJpcC5nZXRBTFBUZXh0KGFJZ25vcmVkTGFiZWxzLCBvRmlsdGVyQmFyLCBiSXNTZWFyY2hJZ25vcmVkKVxuXHRcdFx0XHRcdDogTWVzc2FnZVN0cmlwLmdldFRleHQoYUlnbm9yZWRMYWJlbHMsIG9GaWx0ZXJCYXIsIFwiXCIpO1xuXHRcdFx0XHRyZXR1cm4gc1RleHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUGFnZVJlYWR5KG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRpZiAobVBhcmFtZXRlcnMuZm9yY2VGb2N1cykge1xuXHRcdFx0dGhpcy5fc2V0SW5pdGlhbEZvY3VzKCk7XG5cdFx0fVxuXHRcdC8vIFJlbW92ZSB0aGUgaGFuZGxlciBvbiBiYWNrIG5hdmlnYXRpb24gdGhhdCBkaXNwbGF5cyBEcmFmdCBjb25maXJtYXRpb25cblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbih1bmRlZmluZWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgY29udGVudCBvZiBhIGN1c3RvbSB2aWV3IHVzZWQgaW4gYSBsaXN0IHJlcG9ydCBuZWVkcyB0byBiZSByZWZyZXNoZWQuXG5cdCAqIFRoaXMgaGFwcGVucyBlaXRoZXIgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBvbiB0aGUgRmlsdGVyQmFyIGFuZCB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCxcblx0ICogb3Igd2hlbiBhIHRhYiB3aXRoIGN1c3RvbSBjb250ZW50IGlzIHNlbGVjdGVkLlxuXHQgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGluIGNhc2Ugb2YgY3VzdG9taXphdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIE1hcCBjb250YWluaW5nIHRoZSBmaWx0ZXIgY29uZGl0aW9ucyBvZiB0aGUgRmlsdGVyQmFyLCB0aGUgY3VycmVudFRhYklEXG5cdCAqIGFuZCB0aGUgdmlldyByZWZyZXNoIGNhdXNlICh0YWJDaGFuZ2VkIG9yIHNlYXJjaCkuXG5cdCAqIFRoZSBtYXAgbG9va3MgbGlrZSB0aGlzOlxuXHQgKiA8Y29kZT48cHJlPlxuXHQgKiBcdHtcblx0ICogXHRcdGZpbHRlckNvbmRpdGlvbnM6IHtcblx0ICogXHRcdFx0Q291bnRyeTogW1xuXHQgKiBcdFx0XHRcdHtcblx0ICogXHRcdFx0XHRcdG9wZXJhdG9yOiBcIkVRXCJcblx0ICpcdFx0XHRcdFx0dmFsaWRhdGVkOiBcIk5vdFZhbGlkYXRlZFwiXG5cdCAqXHRcdFx0XHRcdHZhbHVlczogW1wiR2VybWFueVwiLCAuLi5dXG5cdCAqIFx0XHRcdFx0fSxcblx0ICogXHRcdFx0XHQuLi5cblx0ICogXHRcdFx0XVxuXHQgKiBcdFx0XHQuLi5cblx0ICogXHRcdH0sXG5cdCAqXHRcdGN1cnJlbnRUYWJJZDogXCJmZTo6Q3VzdG9tVGFiOjp0YWIxXCIsXG5cdCAqXHRcdHJlZnJlc2hDYXVzZTogXCJ0YWJDaGFuZ2VkXCIgfCBcInNlYXJjaFwiXG5cdCAqXHR9XG5cdCAqIDwvcHJlPjwvY29kZT5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uVmlld05lZWRzUmVmcmVzaChtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0LyogVG8gYmUgb3ZlcnJpZGVuICovXG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIGNhbGxlZCB3aGVuIGEgZmlsdGVyIG9yIHNlYXJjaCB2YWx1ZSBoYXMgYmVlbiBjaGFuZ2VkIGluIHRoZSBGaWx0ZXJCYXIsXG5cdCAqIGJ1dCBoYXMgbm90IGJlZW4gdmFsaWRhdGVkIHlldCBieSB0aGUgZW5kIHVzZXIgKHdpdGggdGhlICdHbycgb3IgJ1NlYXJjaCcgYnV0dG9uKS5cblx0ICogVHlwaWNhbGx5LCB0aGUgY29udGVudCBvZiB0aGUgY3VycmVudCB0YWIgaXMgZ3JleWVkIG91dCB1bnRpbCB0aGUgZmlsdGVycyBhcmUgdmFsaWRhdGVkLlxuXHQgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGluIGNhc2Ugb2YgY3VzdG9taXphdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblBlbmRpbmdGaWx0ZXJzKCkge1xuXHRcdC8qIFRvIGJlIG92ZXJyaWRlbiAqL1xuXHR9XG5cblx0Z2V0Q3VycmVudEVudGl0eVNldCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0VGFibGUoKT8uZGF0YShcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpLnNsaWNlKDEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgJ0NsZWFyJyBidXR0b24gb24gdGhlIEZpbHRlckJhciBpcyBwcmVzc2VkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQWZ0ZXJDbGVhcigpIHtcblx0XHQvKiBUbyBiZSBvdmVycmlkZW4gKi9cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBpbml0aWF0ZXMgdGhlIHVwZGF0ZSBvZiB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCB0aGUgdmlzaWJsZSBzdGF0ZSBvZiB0aGUgRGF0YUZpZWxkRm9ySUJOIGJ1dHRvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhVGFibGVzIEFycmF5IG9mIHRhYmxlcyBpbiB0aGUgbGlzdCByZXBvcnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF91cGRhdGVUYWJsZUFjdGlvbnMoYVRhYmxlczogYW55KSB7XG5cdFx0bGV0IGFJQk5BY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdGFJQk5BY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvVGFibGUsIGFJQk5BY3Rpb25zKTtcblx0XHRcdC8vIFVwZGF0ZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgRGF0YUZpZWxkRm9yQWN0aW9uIGJ1dHRvbnMgb24gdGFibGUgdG9vbGJhclxuXHRcdFx0Ly8gVGhlIHNhbWUgaXMgYWxzbyBwZXJmb3JtZWQgb24gVGFibGUgc2VsZWN0aW9uQ2hhbmdlIGV2ZW50XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSxcblx0XHRcdFx0b0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IEpTT04ucGFyc2UoXG5cdFx0XHRcdFx0Q29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib3BlcmF0aW9uQXZhaWxhYmxlTWFwXCIpKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0cyA9IG9UYWJsZS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzLmxlbmd0aCk7XG5cdFx0XHQvLyBSZWZyZXNoIGVuYWJsZW1lbnQgb2YgZGVsZXRlIGJ1dHRvblxuXHRcdFx0RGVsZXRlSGVscGVyLnVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXG5cdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQob0ludGVybmFsTW9kZWxDb250ZXh0LCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBhU2VsZWN0ZWRDb250ZXh0cywgXCJ0YWJsZVwiKTtcblx0XHR9KTtcblx0XHRDb21tb25VdGlscy51cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eShhSUJOQWN0aW9ucywgdGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIHNjcm9sbHMgdG8gYSBzcGVjaWZpYyByb3cgb24gYWxsIHRoZSBhdmFpbGFibGUgdGFibGVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIjX3Njcm9sbFRhYmxlc1RvUm93XG5cdCAqIEBwYXJhbSBzUm93UGF0aCBUaGUgcGF0aCBvZiB0aGUgdGFibGUgcm93IGNvbnRleHQgdG8gYmUgc2Nyb2xsZWQgdG9cblx0ICovXG5cdF9zY3JvbGxUYWJsZXNUb1JvdyhzUm93UGF0aDogc3RyaW5nKSB7XG5cdFx0dGhpcy5fZ2V0Q29udHJvbHMoXCJ0YWJsZVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0VGFibGVTY3JvbGxlci5zY3JvbGxUYWJsZVRvUm93KG9UYWJsZSwgc1Jvd1BhdGgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIHNldHMgdGhlIGluaXRpYWwgZm9jdXMgaW4gYSBsaXN0IHJlcG9ydCBiYXNlZCBvbiB0aGUgVXNlciBFeHBlcmllbmNlIGd1aWRlbGluZXMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuTGlzdFJlcG9ydENvbnRyb2xsZXIuY29udHJvbGxlciNfc2V0SW5pdGlhbEZvY3VzXG5cdCAqL1xuXHRfc2V0SW5pdGlhbEZvY3VzKCkge1xuXHRcdGNvbnN0IGR5bmFtaWNQYWdlID0gdGhpcy5fZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sKCksXG5cdFx0XHRpc0hlYWRlckV4cGFuZGVkID0gZHluYW1pY1BhZ2UuZ2V0SGVhZGVyRXhwYW5kZWQoKSxcblx0XHRcdGZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKSBhcyBhbnk7XG5cdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0Ly9FbmFibGluZyBtYW5kYXRvcnkgZmlsdGVyIGZpZWxkcyBtZXNzYWdlIGRpYWxvZ1xuXHRcdFx0aWYgKCFmaWx0ZXJCYXIuZ2V0U2hvd01lc3NhZ2VzKCkpIHtcblx0XHRcdFx0ZmlsdGVyQmFyLnNldFNob3dNZXNzYWdlcyh0cnVlKTtcblx0XHRcdH1cblx0XHRcdGlmIChpc0hlYWRlckV4cGFuZGVkKSB7XG5cdFx0XHRcdGNvbnN0IGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCA9IGZpbHRlckJhci5nZXRGaWx0ZXJJdGVtcygpLmZpbmQoZnVuY3Rpb24gKG9GaWx0ZXJJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0ZpbHRlckl0ZW0uZ2V0UmVxdWlyZWQoKSAmJiBvRmlsdGVySXRlbS5nZXRDb25kaXRpb25zKCkubGVuZ3RoID09PSAwO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0Ly9Gb2N1c2luZyBvbiB0aGUgZmlyc3QgZW1wdHkgbWFuZGF0b3J5IGZpbHRlciBmaWVsZCwgb3Igb24gdGhlIGZpcnN0IGZpbHRlciBmaWVsZCBpZiB0aGUgdGFibGUgZGF0YSBpcyBsb2FkZWRcblx0XHRcdFx0aWYgKGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCkge1xuXHRcdFx0XHRcdGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZC5mb2N1cygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkgJiYgZmlsdGVyQmFyLmdldEZpbHRlckl0ZW1zKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdC8vQkNQOiAyMzgwMDA4NDA2IEFkZCBjaGVjayBmb3IgYXZhaWxhYmxlIGZpbHRlckl0ZW1zXG5cdFx0XHRcdFx0ZmlsdGVyQmFyLmdldEZpbHRlckl0ZW1zKClbMF0uZm9jdXMoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL0ZvY3VzaW5nIG9uIHRoZSBHbyBidXR0b25cblx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKS5ieUlkKGAke3RoaXMuX2dldEZpbHRlckJhckNvbnRyb2xJZCgpfS1idG5TZWFyY2hgKT8uZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9pc0luaXRMb2FkRW5hYmxlZCgpKSB7XG5cdFx0XHRcdHRoaXMuX2dldFRhYmxlKClcblx0XHRcdFx0XHQ/LmZvY3VzUm93KDApXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzZXR0aW5nIGluaXRpYWwgZm9jdXMgb24gdGhlIHRhYmxlIFwiLCBlcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2dldFRhYmxlKClcblx0XHRcdFx0Py5mb2N1c1JvdygwKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzZXR0aW5nIGluaXRpYWwgZm9jdXMgb24gdGhlIHRhYmxlIFwiLCBlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbigpIHtcblx0XHRjb25zdCBvTWFuaWZlc3RFbnRyeSA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC5hcHBcIik7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiBvTWFuaWZlc3RFbnRyeS50aXRsZSxcblx0XHRcdHN1YnRpdGxlOiBvTWFuaWZlc3RFbnRyeS5zdWJUaXRsZSB8fCBcIlwiLFxuXHRcdFx0aW50ZW50OiBcIlwiLFxuXHRcdFx0aWNvbjogXCJcIlxuXHRcdH07XG5cdH1cblxuXHRfZ2V0RmlsdGVyQmFyQ29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZCh0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKSkgYXMgRmlsdGVyQmFyO1xuXHR9XG5cblx0X2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZCh0aGlzLl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2xJZCgpKSBhcyBEeW5hbWljUGFnZTtcblx0fVxuXG5cdF9nZXRBZGFwdGF0aW9uRmlsdGVyQmFyQ29udHJvbCgpIHtcblx0XHQvLyBJZiB0aGUgYWRhcHRhdGlvbiBmaWx0ZXIgYmFyIGlzIHBhcnQgb2YgdGhlIERPTSB0cmVlLCB0aGUgXCJBZGFwdCBGaWx0ZXJcIiBkaWFsb2cgaXMgb3Blbixcblx0XHQvLyBhbmQgd2UgcmV0dXJuIHRoZSBhZGFwdGF0aW9uIGZpbHRlciBiYXIgYXMgYW4gYWN0aXZlIGNvbnRyb2wgKHZpc2libGUgZm9yIHRoZSB1c2VyKVxuXHRcdGNvbnN0IGFkYXB0YXRpb25GaWx0ZXJCYXIgPSAodGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpIGFzIGFueSkuZ2V0SW5idWlsdEZpbHRlcigpO1xuXHRcdHJldHVybiBhZGFwdGF0aW9uRmlsdGVyQmFyPy5nZXRQYXJlbnQoKSA/IGFkYXB0YXRpb25GaWx0ZXJCYXIgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZ2V0U2VnbWVudGVkQnV0dG9uKHNDb250cm9sOiBhbnkpIHtcblx0XHRjb25zdCBzU2VnbWVudGVkQnV0dG9uSWQgPSAoc0NvbnRyb2wgPT09IFwiQ2hhcnRcIiA/IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCkgOiB0aGlzLl9nZXRUYWJsZSgpKT8uZGF0YShcInNlZ21lbnRlZEJ1dHRvbklkXCIpO1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5ieUlkKHNTZWdtZW50ZWRCdXR0b25JZCk7XG5cdH1cblxuXHRfZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShzUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgY29udHJvbElkID0gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KHNQYXRoKTtcblx0XHRyZXR1cm4gY29udHJvbElkICYmIHRoaXMuZ2V0VmlldygpLmJ5SWQoY29udHJvbElkKTtcblx0fVxuXG5cdF9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2xJZCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvZHluYW1pY0xpc3RSZXBvcnRJZFwiKSB8fCBcIlwiO1xuXHR9XG5cblx0X2dldEZpbHRlckJhckNvbnRyb2xJZCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvZmlsdGVyQmFySWRcIikgfHwgXCJcIjtcblx0fVxuXG5cdGdldENoYXJ0Q29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShcIi9zaW5nbGVDaGFydElkXCIpO1xuXHR9XG5cblx0X2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2woKSB7XG5cdFx0Y29uc3Qgc1Zpc3VhbEZpbHRlckJhcklkID0gU3RhYmxlSWRIZWxwZXIuZ2VuZXJhdGUoW1widmlzdWFsRmlsdGVyXCIsIHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2xJZCgpXSk7XG5cdFx0cmV0dXJuIHNWaXN1YWxGaWx0ZXJCYXJJZCAmJiB0aGlzLmdldFZpZXcoKS5ieUlkKHNWaXN1YWxGaWx0ZXJCYXJJZCk7XG5cdH1cblxuXHRfZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoXCIvdmFyaWFudE1hbmFnZW1lbnQvaWRcIik7XG5cdH1cblxuXHRfZ2V0TXVsdGlNb2RlQ29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZChcImZlOjpUYWJNdWx0aXBsZU1vZGU6OkNvbnRyb2xcIikgYXMgTXVsdGlwbGVNb2RlQ29udHJvbDtcblx0fVxuXG5cdF9nZXRUYWJsZSgpOiBUYWJsZSB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKHRoaXMuX2lzTXVsdGlNb2RlKCkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpPy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpPy5jb250ZW50O1xuXHRcdFx0cmV0dXJuIG9Db250cm9sPy5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpID8gKG9Db250cm9sIGFzIFRhYmxlKSA6IHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoXCIvc2luZ2xlVGFibGVJZFwiKSBhcyBUYWJsZTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0Q29udHJvbHMoc0tleT86IGFueSkge1xuXHRcdGlmICh0aGlzLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRjb25zdCBhQ29udHJvbHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBvVGFiTXVsdGlNb2RlID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpLmNvbnRlbnQ7XG5cdFx0XHRvVGFiTXVsdGlNb2RlLmdldEl0ZW1zKCkuZm9yRWFjaCgob0l0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQob0l0ZW0uZ2V0S2V5KCkpO1xuXHRcdFx0XHRpZiAob0NvbnRyb2wgJiYgc0tleSkge1xuXHRcdFx0XHRcdGlmIChvSXRlbS5nZXRLZXkoKS5pbmRleE9mKGBmZTo6JHtzS2V5fWApID4gLTEpIHtcblx0XHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbnRyb2wgIT09IHVuZGVmaW5lZCAmJiBvQ29udHJvbCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYUNvbnRyb2xzO1xuXHRcdH0gZWxzZSBpZiAoc0tleSA9PT0gXCJDaGFydFwiKSB7XG5cdFx0XHRjb25zdCBvQ2hhcnQgPSB0aGlzLmdldENoYXJ0Q29udHJvbCgpO1xuXHRcdFx0cmV0dXJuIG9DaGFydCA/IFtvQ2hhcnRdIDogW107XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCk7XG5cdFx0XHRyZXR1cm4gb1RhYmxlID8gW29UYWJsZV0gOiBbXTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0RGVmYXVsdFBhdGgoKSB7XG5cdFx0Y29uc3QgZGVmYXVsdFBhdGggPSBMaXN0UmVwb3J0VGVtcGxhdGluZy5nZXREZWZhdWx0UGF0aCh0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvdmlld3NcIikgfHwgW10pO1xuXHRcdHN3aXRjaCAoZGVmYXVsdFBhdGgpIHtcblx0XHRcdGNhc2UgXCJwcmltYXJ5XCI6XG5cdFx0XHRcdHJldHVybiBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0Y2FzZSBcInNlY29uZGFyeVwiOlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTtcblx0XHRcdGNhc2UgXCJib3RoXCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5IeWJyaWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB3aXRoIE11bHRpcGxlIFRhYmxlIG1vZGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNNdWx0aU1vZGVcblx0ICogQHJldHVybnMgSXMgTXVsdGlwbGUgVGFibGUgbW9kZSBzZXQ/XG5cdCAqL1xuXHRfaXNNdWx0aU1vZGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL211bHRpVmlld3NDb250cm9sXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB0byBsb2FkIGRhdGEgYXQgc3RhcnQgdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNJbml0TG9hZERpc2FibGVkXG5cdCAqIEByZXR1cm5zIElzIEluaXRMb2FkIGVuYWJsZWQ/XG5cdCAqL1xuXHRfaXNJbml0TG9hZEVuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaW5pdExvYWRNb2RlID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5pbml0aWFsTG9hZDtcblx0XHRyZXR1cm4gaW5pdExvYWRNb2RlID09PSBJbml0aWFsTG9hZE1vZGUuRW5hYmxlZDtcblx0fVxuXG5cdF9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvaGFzTXVsdGlWaXN1YWxpemF0aW9uc1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc3VzcGVuZCBzZWFyY2ggb24gdGhlIGZpbHRlciBiYXIuIFRoZSBpbml0aWFsIGxvYWRpbmcgb2YgZGF0YSBpcyBkaXNhYmxlZCBiYXNlZCBvbiB0aGUgbWFuaWZlc3QgY29uZmlndXJhdGlvbiBJbml0TG9hZCAtIERpc2FibGVkL0F1dG8uXG5cdCAqIEl0IGlzIGVuYWJsZWQgbGF0ZXIgd2hlbiB0aGUgdmlldyBzdGF0ZSBpcyBzZXQsIHdoZW4gaXQgaXMgcG9zc2libGUgdG8gcmVhbGl6ZSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzLlxuXHQgKi9cblx0X2Rpc2FibGVJbml0TG9hZCgpIHtcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0Ly8gY2hlY2sgZm9yIGZpbHRlciBiYXIgaGlkZGVuXG5cdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0ZmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24odHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgYnkgZmxleCB0byBkZXRlcm1pbmUgaWYgdGhlIGFwcGx5QXV0b21hdGljYWxseSBzZXR0aW5nIG9uIHRoZSB2YXJpYW50IGlzIHZhbGlkLlxuXHQgKiBDYWxsZWQgb25seSBmb3IgU3RhbmRhcmQgVmFyaWFudCBhbmQgb25seSB3aGVuIHRoZXJlIGlzIGRpc3BsYXkgdGV4dCBzZXQgZm9yIGFwcGx5QXV0b21hdGljYWxseSAoRkUgb25seSBzZXRzIGl0IGZvciBBdXRvKS5cblx0ICpcblx0ICogQHJldHVybnMgQm9vbGVhbiB0cnVlIGlmIGRhdGEgc2hvdWxkIGJlIGxvYWRlZCBhdXRvbWF0aWNhbGx5LCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdF9hcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCgpIHtcblx0XHQvLyBXZSBhbHdheXMgcmV0dXJuIGZhbHNlIGFuZCB0YWtlIGNhcmUgb2YgaXQgd2hlbiB2aWV3IHN0YXRlIGlzIHNldFxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmUgdGhlIHNldHRpbmdzIGZvciBpbml0aWFsIGxvYWQgYmFzZWQgb25cblx0ICogLSBtYW5pZmVzdCBzZXR0aW5nIGluaXRMb2FkIC0gRW5hYmxlZC9EaXNhYmxlZC9BdXRvXG5cdCAqIC0gdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHZhcmlhbnRcblx0ICogLSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzXG5cdCAqIFdlIGRpc2FibGUgdGhlIGZpbHRlciBiYXIgc2VhcmNoIGF0IHRoZSBiZWdpbm5pbmcgYW5kIGVuYWJsZSBpdCB3aGVuIHZpZXcgc3RhdGUgaXMgc2V0LlxuXHQgKi9cblx0X3NldEluaXRMb2FkKCkge1xuXHRcdC8vIGlmIGluaXRMb2FkIGlzIERpc2FibGVkIG9yIEF1dG8sIHN3aXRjaCBvZmYgZmlsdGVyIGJhciBzZWFyY2ggdGVtcG9yYXJpbHkgYXQgc3RhcnRcblx0XHRpZiAoIXRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkpIHtcblx0XHRcdHRoaXMuX2Rpc2FibGVJbml0TG9hZCgpO1xuXHRcdH1cblx0XHQvLyBzZXQgaG9vayBmb3IgZmxleCBmb3Igd2hlbiBzdGFuZGFyZCB2YXJpYW50IGlzIHNldCAoYXQgc3RhcnQgb3IgYnkgdXNlciBhdCBydW50aW1lKVxuXHRcdC8vIHJlcXVpcmVkIHRvIG92ZXJyaWRlIHRoZSB1c2VyIHNldHRpbmcgJ2FwcGx5IGF1dG9tYXRpY2FsbHknIGJlaGF2aW91ciBpZiB0aGVyZSBhcmUgbm8gZmlsdGVyc1xuXHRcdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50SWQ6IGFueSA9IExpc3RSZXBvcnRUZW1wbGF0aW5nLmdldFZhcmlhbnRCYWNrUmVmZXJlbmNlKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCksIHRoaXMuX2dldFBhZ2VNb2RlbCgpKTtcblx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHZhcmlhbnRNYW5hZ2VtZW50SWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZCh2YXJpYW50TWFuYWdlbWVudElkKTtcblx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQpIHtcblx0XHRcdHZhcmlhbnRNYW5hZ2VtZW50LnJlZ2lzdGVyQXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQodGhpcy5fYXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldFNoYXJlTW9kZWwoKSB7XG5cdFx0Ly8gVE9ETzogZGVhY3RpdmF0ZWQgZm9yIG5vdyAtIGN1cnJlbnRseSB0aGVyZSBpcyBubyBfdGVtcGxQcml2IGFueW1vcmUsIHRvIGJlIGRpc2N1c3NlZFxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSBub3QgY2FsbGVkIGFueW1vcmUgZnJvbSB0aGUgaW5pdCBtZXRob2RcblxuXHRcdGNvbnN0IGZuR2V0VXNlciA9IE9iamVjdFBhdGguZ2V0KFwic2FwLnVzaGVsbC5Db250YWluZXIuZ2V0VXNlclwiKTtcblx0XHQvL3ZhciBvTWFuaWZlc3QgPSB0aGlzLmdldE93bmVyQ29tcG9uZW50KCkuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWV0YWRhdGEoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpXCIpO1xuXHRcdC8vdmFyIHNCb29rbWFya0ljb24gPSAob01hbmlmZXN0ICYmIG9NYW5pZmVzdC5pY29ucyAmJiBvTWFuaWZlc3QuaWNvbnMuaWNvbikgfHwgXCJcIjtcblxuXHRcdC8vc2hhcmVNb2RlbDogSG9sZHMgYWxsIHRoZSBzaGFyaW5nIHJlbGV2YW50IGluZm9ybWF0aW9uIGFuZCBpbmZvIHVzZWQgaW4gWE1MIHZpZXdcblx0XHRjb25zdCBvU2hhcmVJbmZvID0ge1xuXHRcdFx0Ym9va21hcmtUaXRsZTogZG9jdW1lbnQudGl0bGUsIC8vVG8gbmFtZSB0aGUgYm9va21hcmsgYWNjb3JkaW5nIHRvIHRoZSBhcHAgdGl0bGUuXG5cdFx0XHRib29rbWFya0N1c3RvbVVybDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBzSGFzaCA9IGhhc2hlci5nZXRIYXNoKCk7XG5cdFx0XHRcdHJldHVybiBzSGFzaCA/IGAjJHtzSGFzaH1gIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cdFx0XHR9LFxuXHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0VG8gYmUgYWN0aXZhdGVkIG9uY2UgdGhlIEZMUCBzaG93cyB0aGUgY291bnQgLSBzZWUgY29tbWVudCBhYm92ZVxuXHRcdFx0XHRcdFx0XHRib29rbWFya1NlcnZpY2VVcmw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vdmFyIG9UYWJsZSA9IG9UYWJsZS5nZXRJbm5lclRhYmxlKCk7IG9UYWJsZSBpcyBhbHJlYWR5IHRoZSBzYXAuZmUgdGFibGUgKGJ1dCBub3QgdGhlIGlubmVyIG9uZSlcblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgdXNlIHRhYmxlLmdldExpc3RCaW5kaW5nSW5mbyBpbnN0ZWFkIG9mIHRoZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9CaW5kaW5nID0gb1RhYmxlLmdldEJpbmRpbmcoXCJyb3dzXCIpIHx8IG9UYWJsZS5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9CaW5kaW5nID8gZm5HZXREb3dubG9hZFVybChvQmluZGluZykgOiBcIlwiO1xuXHRcdFx0XHRcdFx0XHR9LCovXG5cdFx0XHRpc1NoYXJlSW5KYW1BY3RpdmU6ICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKClcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJpdmF0ZU1vZGVsID0gdGhpcy5nZXRPd25lckNvbXBvbmVudCgpLmdldE1vZGVsKFwiX3RlbXBsUHJpdlwiKSBhcyBKU09OTW9kZWw7XG5cdFx0b1RlbXBsYXRlUHJpdmF0ZU1vZGVsLnNldFByb3BlcnR5KFwiL2xpc3RSZXBvcnQvc2hhcmVcIiwgb1NoYXJlSW5mbyk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHVwZGF0ZSB0aGUgbG9jYWwgVUkgbW9kZWwgb2YgdGhlIHBhZ2Ugd2l0aCB0aGUgZmllbGRzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIHRvIHRoZSBmaWx0ZXIgYmFyICh0aGlzIGlzIHNwZWNpZmljIHRvIHRoZSBBTFAgc2NlbmFyaW8pLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ludGVybmFsTW9kZWxDb250ZXh0IFRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRfdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvRmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRjb25zdCBtQ2FjaGU6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGlnbm9yZWRGaWVsZHM6IGFueSA9IHt9LFxuXHRcdFx0YVRhYmxlcyA9IHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIiksXG5cdFx0XHRhQ2hhcnRzID0gdGhpcy5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKTtcblxuXHRcdGlmICghYVRhYmxlcy5sZW5ndGggfHwgIWFDaGFydHMubGVuZ3RoKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSdzIG5vdCBhIHRhYmxlIGFuZCBhIGNoYXJ0LCB3ZSdyZSBub3QgaW4gdGhlIEFMUCBjYXNlXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRm9yIHRoZSBtb21lbnQsIHRoZXJlJ3Mgbm90aGluZyBmb3IgdGFibGVzLi4uXG5cdFx0YUNoYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0NoYXJ0RW50aXR5UGF0aCA9IG9DaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIiksXG5cdFx0XHRcdHNDaGFydEVudGl0eVNldCA9IHNDaGFydEVudGl0eVBhdGguc2xpY2UoMSksXG5cdFx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVNldH1DaGFydGA7XG5cdFx0XHRpZiAoIW1DYWNoZVtzQ2FjaGVLZXldKSB7XG5cdFx0XHRcdG1DYWNoZVtzQ2FjaGVLZXldID0gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckJhciwgb0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGlnbm9yZWRGaWVsZHNbc0NhY2hlS2V5XSA9IG1DYWNoZVtzQ2FjaGVLZXldO1xuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbnRyb2xzL2lnbm9yZWRGaWVsZHNcIiwgaWdub3JlZEZpZWxkcyk7XG5cdH1cblxuXHRfaXNGaWx0ZXJCYXJIaWRkZW4oKSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaGlkZUZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQoVmFyaWFudE1hbmFnZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcpOiBCb29sZWFuIHtcblx0XHRpZiAoIVZhcmlhbnRNYW5hZ2VtZW50IHx8ICFrZXkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgdmFyaWFudHMgPSBWYXJpYW50TWFuYWdlbWVudC5nZXRWYXJpYW50cygpO1xuXHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50ID0gdmFyaWFudHMuZmluZChmdW5jdGlvbiAodmFyaWFudDogYW55KSB7XG5cdFx0XHRyZXR1cm4gdmFyaWFudCAmJiB2YXJpYW50LmtleSA9PT0ga2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiAoY3VycmVudFZhcmlhbnQgJiYgY3VycmVudFZhcmlhbnQuZXhlY3V0ZU9uU2VsZWN0KSB8fCBmYWxzZTtcblx0fVxuXG5cdF9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvVk06IGFueSkge1xuXHRcdGlmIChcblx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaW5pdGlhbExvYWQgPT09IEluaXRpYWxMb2FkTW9kZS5BdXRvICYmXG5cdFx0XHQoIW9WTSB8fCBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBvQ29uZGl0aW9ucykge1xuXHRcdFx0XHRcdC8vIGlnbm9yZSBmaWx0ZXJzIHN0YXJ0aW5nIHdpdGggJCAoZS5nLiAkc2VhcmNoLCAkZWRpdFN0YXRlKVxuXHRcdFx0XHRcdGlmICghc0tleS5zdGFydHNXaXRoKFwiJFwiKSAmJiBBcnJheS5pc0FycmF5KG9Db25kaXRpb25zW3NLZXldKSAmJiBvQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIGxvYWQgZGF0YSBhcyBwZXIgdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHRoZSB2YXJpYW50XG5cdFx0XHRcdFx0XHRjb25zdCBzdGFuZGFyZFZhcmlhbnQ6IGFueSA9IG9WTS5nZXRWYXJpYW50cygpLmZpbmQoKHZhcmlhbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFyaWFudC5rZXkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhbmRhcmRWYXJpYW50ICYmIHN0YW5kYXJkVmFyaWFudC5leGVjdXRlT25TZWxlY3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF91cGRhdGVUYWJsZShvVGFibGU6IGFueSkge1xuXHRcdGlmICghb1RhYmxlLmlzVGFibGVCb3VuZCgpIHx8IHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcykge1xuXHRcdFx0b1RhYmxlLnJlYmluZCgpO1xuXHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZUNoYXJ0KG9DaGFydDogYW55KSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSBvQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuX2dldENoYXJ0KG9DaGFydCk7XG5cdFx0aWYgKCEob0lubmVyQ2hhcnQgJiYgb0lubmVyQ2hhcnQuaXNCb3VuZChcImRhdGFcIikpIHx8IHRoaXMuaGFzUGVuZGluZ1RhYmxlQ2hhbmdlcykge1xuXHRcdFx0b0NoYXJ0LmdldENvbnRyb2xEZWxlZ2F0ZSgpLnJlYmluZChvQ2hhcnQsIG9Jbm5lckNoYXJ0LmdldEJpbmRpbmdJbmZvKFwiZGF0YVwiKSk7XG5cdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHRvbkZpbHRlclNlYXJjaCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpLnRyaWdnZXJTZWFyY2goKTtcblx0XHR9LFxuXHRcdG9uRmlsdGVyc0NoYW5nZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRcdFx0Ly8gUGVuZGluZyBmaWx0ZXJzIGludG8gRmlsdGVyQmFyIHRvIGJlIHVzZWQgZm9yIGN1c3RvbSB2aWV3c1xuXHRcdFx0XHR0aGlzLm9uUGVuZGluZ0ZpbHRlcnMoKTtcblx0XHRcdFx0Y29uc3QgYXBwbGllZEZpbHRlcnNUZXh0ID0gb0ZpbHRlckJhci5nZXRBc3NpZ25lZEZpbHRlcnNUZXh0KCkuZmlsdGVyc1RleHQ7XG5cdFx0XHRcdGNvbnN0IGFwcGxpZWRGaWx0ZXJCaW5kaW5nID0gYmluZGluZ1BhcnNlcihhcHBsaWVkRmlsdGVyc1RleHQpO1xuXHRcdFx0XHRpZiAoYXBwbGllZEZpbHRlckJpbmRpbmcpIHtcblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuYnlJZChcImZlOjphcHBsaWVkRmlsdGVyc1RleHRcIikgYXMgVGV4dCB8IHVuZGVmaW5lZCk/LmJpbmRUZXh0KGFwcGxpZWRGaWx0ZXJCaW5kaW5nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuYnlJZChcImZlOjphcHBsaWVkRmlsdGVyc1RleHRcIikgYXMgVGV4dCB8IHVuZGVmaW5lZCk/LnNldFRleHQoYXBwbGllZEZpbHRlcnNUZXh0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQgJiYgb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbmRpdGlvbnNCYXNlZFwiKSkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImhhc1BlbmRpbmdGaWx0ZXJzXCIsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTZWxlY3RlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9WTSA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50S2V5ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKTtcblx0XHRcdGNvbnN0IG9NdWx0aU1vZGVDb250cm9sID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpO1xuXG5cdFx0XHRpZiAob011bHRpTW9kZUNvbnRyb2wgJiYgIW9WTT8uZ2V0UGFyZW50KCkuaXNBKFwic2FwLnVpLm1kYy5BY3Rpb25Ub29sYmFyXCIpKSB7XG5cdFx0XHRcdC8vTm90IGEgQ29udHJvbCBWYXJpYW50XG5cdFx0XHRcdG9NdWx0aU1vZGVDb250cm9sPy5pbnZhbGlkYXRlQ29udGVudCgpO1xuXHRcdFx0XHRvTXVsdGlNb2RlQ29udHJvbD8uc2V0RnJlZXplQ29udGVudCh0cnVlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2V0VGltZW91dCBjYXVzZSB0aGUgdmFyaWFudCBuZWVkcyB0byBiZSBhcHBsaWVkIGJlZm9yZSBqdWRnaW5nIHRoZSBhdXRvIHNlYXJjaCBvciB1cGRhdGluZyB0aGUgYXBwIHN0YXRlXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuX3Nob3VsZEF1dG9UcmlnZ2VyU2VhcmNoKG9WTSkpIHtcblx0XHRcdFx0XHQvLyB0aGUgYXBwIHN0YXRlIHdpbGwgYmUgdXBkYXRlZCB2aWEgb25TZWFyY2ggaGFuZGxlclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCF0aGlzLl9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQob1ZNLCBjdXJyZW50VmFyaWFudEtleSkpIHtcblx0XHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDApO1xuXHRcdH0sXG5cdFx0b25WYXJpYW50U2F2ZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIpIHtcblx0XHRcdC8vVE9ETzogU2hvdWxkIHJlbW92ZSB0aGlzIHNldFRpbWVPdXQgb25jZSBWYXJpYW50IE1hbmFnZW1lbnQgcHJvdmlkZXMgYW4gYXBpIHRvIGZldGNoIHRoZSBjdXJyZW50IHZhcmlhbnQga2V5IG9uIHNhdmUhISFcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR9LCAxMDAwKTtcblx0XHR9LFxuXHRcdG9uU2VhcmNoKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyKSB7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBiSGlkZURyYWZ0ID0gRmlsdGVyVXRpbHMuZ2V0RWRpdFN0YXRlSXNIaWRlRHJhZnQob0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCkpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgZmFsc2UpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGlkZURyYWZ0SW5mb1wiLCBiSGlkZURyYWZ0KTtcblxuXHRcdFx0aWYgKCF0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCkpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQsIG9GaWx0ZXJCYXIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9NZGNDaGFydCkge1xuXHRcdFx0XHQvLyBkaXNhYmxlIGJvdW5kIGFjdGlvbnMgVE9ETzogdGhpcyBjbGVhcnMgZXZlcnl0aGluZyBmb3IgdGhlIGNoYXJ0P1xuXHRcdFx0XHQob01kY0NoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLnNldFByb3BlcnR5KFwiXCIsIHt9KTtcblxuXHRcdFx0XHRjb25zdCBvUGFnZUludGVybmFsTW9kZWxDb250ZXh0ID0gb01kY0NoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwicGFnZUludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0XHRjb25zdCBzVGVtcGxhdGVDb250ZW50VmlldyA9IG9QYWdlSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoYCR7b1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRcdGlmIChzVGVtcGxhdGVDb250ZW50VmlldyA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydCkge1xuXHRcdFx0XHRcdHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcyA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3LlRhYmxlKSB7XG5cdFx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nVGFibGVDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gc3RvcmUgZmlsdGVyIGJhciBjb25kaXRpb25zIHRvIHVzZSBsYXRlciB3aGlsZSBuYXZpZ2F0aW9uXG5cdFx0XHRTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIpXG5cdFx0XHRcdC50aGVuKChvRXh0ZXJuYWxTdGF0ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5maWx0ZXJCYXJDb25kaXRpb25zID0gb0V4dGVybmFsU3RhdGUuZmlsdGVyO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZXh0ZXJuYWwgc3RhdGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRpZiAoKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5saXZlTW9kZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc3lzdGVtLnBob25lKSB7XG5cdFx0XHRcdGNvbnN0IG9EeW5hbWljUGFnZSA9IHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpO1xuXHRcdFx0XHRvRHluYW1pY1BhZ2Uuc2V0SGVhZGVyRXhwYW5kZWQoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVHJpZ2dlcnMgYW4gb3V0Ym91bmQgbmF2aWdhdGlvbiB3aGVuIGEgdXNlciBjaG9vc2VzIHRoZSBjaGV2cm9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9Db250cm9sbGVyXG5cdFx0ICogQHBhcmFtIHNPdXRib3VuZFRhcmdldCBOYW1lIG9mIHRoZSBvdXRib3VuZCB0YXJnZXQgKG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0KVxuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGUgdGFyZ2V0IGFwcFxuXHRcdCAqIEBwYXJhbSBzQ3JlYXRlUGF0aCBDcmVhdGUgcGF0aCB3aGVuIHRoZSBjaGV2cm9uIGlzIGNyZWF0ZWQuXG5cdFx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlcjogTGlzdFJlcG9ydENvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldDogc3RyaW5nLCBvQ29udGV4dDogQ29udGV4dCwgc0NyZWF0ZVBhdGg6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQsIG9Db250ZXh0LCBzQ3JlYXRlUGF0aCk7XG5cdFx0fSxcblx0XHRvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDb250ZW50KCksXG5cdFx0XHRcdG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCksXG5cdFx0XHRcdGFEYXRhID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIiksXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRpZiAoYURhdGEpIHtcblx0XHRcdFx0Q2hhcnRVdGlscy5zZXRDaGFydEZpbHRlcnMob01kY0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpIHtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlKSB7XG5cdFx0XHRcdChvVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBzU2VsZWN0ZWRLZXkgPSBvRXZlbnQubVBhcmFtZXRlcnMua2V5ID8gb0V2ZW50Lm1QYXJhbWV0ZXJzLmtleSA6IG51bGw7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIiwgc1NlbGVjdGVkS2V5KTtcblx0XHRcdGNvbnN0IG9DaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9nZXRUYWJsZSgpO1xuXHRcdFx0Y29uc3Qgb1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlID0ge1xuXHRcdFx0XHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9TZWdtZW50ZWRCdXR0b24uZ2V0SXRlbXMoKTtcblx0XHRcdFx0XHRhSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKG9JdGVtLmdldEtleSgpID09PSBzU2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0XHRcdFx0b0l0ZW0uZm9jdXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnJlbW92ZUV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9TZWdtZW50ZWRCdXR0b24gPSAoXG5cdFx0XHRcdHNTZWxlY3RlZEtleSA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZSA/IHRoaXMuX2dldFNlZ21lbnRlZEJ1dHRvbihcIlRhYmxlXCIpIDogdGhpcy5fZ2V0U2VnbWVudGVkQnV0dG9uKFwiQ2hhcnRcIilcblx0XHRcdCkgYXMgU2VnbWVudGVkQnV0dG9uO1xuXHRcdFx0aWYgKG9TZWdtZW50ZWRCdXR0b24gIT09IG9FdmVudC5nZXRTb3VyY2UoKSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLmFkZEV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc1NlbGVjdGVkS2V5KSB7XG5cdFx0XHRcdGNhc2UgVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ6XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlQ2hhcnQob0NoYXJ0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZDpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUNoYXJ0KG9DaGFydCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fSxcblx0XHRvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgaXNDb21wYWN0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKSA9PT0gXCJDb21wYWN0XCI7XG5cdFx0XHR0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkuc2V0VmlzaWJsZShpc0NvbXBhY3QpO1xuXHRcdFx0KHRoaXMuX2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2woKSBhcyBDb250cm9sKS5zZXRWaXNpYmxlKCFpc0NvbXBhY3QpO1xuXHRcdH0sXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25EeW5hbWljUGFnZVRpdGxlU3RhdGVDaGFuZ2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyOiBhbnkgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAoZmlsdGVyQmFyICYmIGZpbHRlckJhci5nZXRTZWdtZW50ZWRCdXR0b24oKSkge1xuXHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImlzRXhwYW5kZWRcIikpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRjb25zdCBhVGFibGVzID0gdGhpcy5fZ2V0Q29udHJvbHMoKSBhcyBUYWJsZVtdO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRjb25zdCBzVGV4dCA9IGdldFJlc291cmNlTW9kZWwodGhpcy5nZXRWaWV3KCkpLmdldFRleHQoXCJUX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRcIiwgdW5kZWZpbmVkLCBzRW50aXR5U2V0KTtcblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogQ29udHJvbCkge1xuXHRcdFx0aWYgKG9UYWJsZS5pc0E8VGFibGU+KFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRvVGFibGUuc2V0Tm9EYXRhKHNUZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0UmVwb3J0Q29udHJvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFzREEsTUFBTUEsbUJBQW1CLEdBQUdDLFdBQVcsQ0FBQ0QsbUJBQW1CO0lBQzFERSxlQUFlLEdBQUdELFdBQVcsQ0FBQ0MsZUFBZTs7RUFFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsSUFPTUMsb0JBQW9CLFdBRHpCQyxjQUFjLENBQUMsa0RBQWtELENBQUMsVUFFakVDLGNBQWMsQ0FDZEMsZUFBZSxDQUFDQyxRQUFRLENBQUM7SUFDeEJDLGNBQWMsRUFBRSxZQUFpQztNQUMvQyxJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxhQUFhLEVBQUUsQ0FBMEJDLGVBQWUsRUFBRTtJQUMzRTtFQUNELENBQUMsQ0FBQyxDQUNGLFVBR0FOLGNBQWMsQ0FDZE8sNkJBQTZCLENBQUNMLFFBQVEsQ0FB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