/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/Manage", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/PageController", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/TableHelper", "sap/fe/macros/table/Utils", "sap/fe/navigation/SelectionVariant", "sap/fe/templates/ObjectPage/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/m/InstanceManager", "sap/m/Link", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "./overrides/IntentBasedNavigation", "./overrides/InternalRouting", "./overrides/MessageHandler", "./overrides/Paginator", "./overrides/Share", "./overrides/ViewState"], function (Log, merge, ActionRuntime, CommonUtils, BusyLocker, ActivitySync, Manage, draft, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Share, ViewState, ClassSupport, ModelHelper, ResourceModelHelper, PageController, CommonHelper, DelegateUtil, TableHelper, TableUtils, SelectionVariant, ExtensionAPI, TableScroller, InstanceManager, Link, MessageBox, Core, OverrideExecution, ODataListBinding, IntentBasedNavigationOverride, InternalRoutingOverride, MessageHandlerOverride, PaginatorOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var showUserDetails = Manage.showUserDetails;
  var openManageDialog = Manage.openManageDialog;
  var isConnected = ActivitySync.isConnected;
  var disconnect = ActivitySync.disconnect;
  var connect = ActivitySync.connect;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ObjectPageController = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(Share.override(ShareOverrides)), _dec4 = usingExtension(InternalRouting.override(InternalRoutingOverride)), _dec5 = usingExtension(Paginator.override(PaginatorOverride)), _dec6 = usingExtension(MessageHandler.override(MessageHandlerOverride)), _dec7 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec8 = usingExtension(InternalIntentBasedNavigation.override({
    getNavigationMode: function () {
      const bIsStickyEditMode = this.getView().getController().getStickyEditMode && this.getView().getController().getStickyEditMode();
      return bIsStickyEditMode ? "explace" : undefined;
    }
  })), _dec9 = usingExtension(ViewState.override(ViewStateOverrides)), _dec10 = usingExtension(PageReady.override({
    isContextExpected: function () {
      return true;
    }
  })), _dec11 = usingExtension(MassEdit), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ObjectPageController, _PageController);
    function ObjectPageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "placeholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor10, _assertThisInitialized(_this));
      _this.handlers = {
        /**
         * Invokes the page primary action on press of Ctrl+Enter.
         *
         * @param oController The page controller
         * @param oView
         * @param oContext Context for which the action is called
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @param [mConditions] Contains the following attributes:
         * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
         * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
         * @param [mConditions.editActionVisible] The Edit button visibility
         * @param [mConditions.editActionEnabled] The enablement of Edit button
         * @ui5-restricted
         * @final
         */
        onPrimaryAction(oController, oView, oContext, sActionName, mParameters, mConditions) {
          const iViewLevel = oController.getView().getViewData().viewLevel,
            oObjectPage = oController._getObjectPageLayoutControl();
          if (mConditions.positiveActionVisible) {
            if (mConditions.positiveActionEnabled) {
              oController.handlers.onCallAction(oView, sActionName, mParameters);
            }
          } else if (mConditions.editActionVisible) {
            if (mConditions.editActionEnabled) {
              oController._editDocument(oContext);
            }
          } else if (iViewLevel === 1 && oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._saveDocument(oContext);
          } else if (oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._applyDocument(oContext);
          }
        },
        onTableContextChange(oEvent) {
          var _fastCreationRow$_oIn;
          const oSource = oEvent.getSource();
          let oTable;
          this._findTables().some(function (_oTable) {
            if (_oTable.getRowBinding() === oSource) {
              oTable = _oTable;
              return true;
            }
            return false;
          });

          // set correct binding context for fast creation row
          const fastCreationRow = oTable.getCreationRow();
          if (fastCreationRow && !((_fastCreationRow$_oIn = fastCreationRow._oInnerCreationRow) !== null && _fastCreationRow$_oIn !== void 0 && _fastCreationRow$_oIn.getBindingContext())) {
            const tableBinding = this._getTableBinding(oTable);
            if (!tableBinding) {
              Log.error(`Expected binding missing for table: ${oTable.getId()}`);
              return;
            }
            if (tableBinding.getContext()) {
              const objectPage = this._getObjectPageLayoutControl();
              const bindingContext = objectPage.getBindingContext();
              const model = bindingContext.getModel();
              TableHelper.enableFastCreationRow(fastCreationRow, tableBinding.getPath(), tableBinding.getContext(), model, oTable.getModel("ui").getProperty("/isEditable"));
            }
          }
          const oCurrentActionPromise = this.editFlow.getCurrentActionPromise();
          if (oCurrentActionPromise) {
            let aTableContexts;
            if (oTable.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")) {
              aTableContexts = oSource.getContexts(0);
            } else {
              aTableContexts = oSource.getCurrentContexts();
            }
            //if contexts are not fully loaded the getcontexts function above will trigger a new change event call
            if (!aTableContexts[0]) {
              return;
            }
            oCurrentActionPromise.then(oActionResponse => {
              if (!oActionResponse || oActionResponse.controlId !== oTable.sId) {
                return;
              }
              const oActionData = oActionResponse.oData;
              const aKeys = oActionResponse.keys;
              let iNewItemp = -1;
              aTableContexts.find(function (oTableContext, i) {
                const oTableData = oTableContext.getObject();
                const bCompare = aKeys.every(function (sKey) {
                  return oTableData[sKey] === oActionData[sKey];
                });
                if (bCompare) {
                  iNewItemp = i;
                }
                return bCompare;
              });
              if (iNewItemp !== -1) {
                const aDialogs = InstanceManager.getOpenDialogs();
                const oDialog = aDialogs.length > 0 ? aDialogs.find(dialog => dialog.data("FullScreenDialog") !== true) : null;
                if (oDialog) {
                  // by design, a sap.m.dialog set the focus to the previous focused element when closing.
                  // we should wait for the dialog to be close before to focus another element
                  oDialog.attachEventOnce("afterClose", function () {
                    oTable.focusRow(iNewItemp, true);
                  });
                } else {
                  oTable.focusRow(iNewItemp, true);
                }
                this.editFlow.deleteCurrentActionPromise();
              }
            }).catch(function (err) {
              Log.error(`An error occurs while scrolling to the newly created Item: ${err}`);
            });
          }
          // fire ModelContextChange on the message button whenever the table context changes
          this.messageButton.fireModelContextChange();
        },
        /**
         * Invokes an action - bound/unbound and sets the page dirty.
         *
         * @param oView
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @returns The action promise
         * @ui5-restricted
         * @final
         */
        onCallAction(oView, sActionName, mParameters) {
          const oController = oView.getController();
          return oController.editFlow.invokeAction(sActionName, mParameters).then(oController._showMessagePopover.bind(oController, undefined)).catch(oController._showMessagePopover.bind(oController));
        },
        onDataPointTitlePressed(oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
          oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
          const oTargetInfo = oManifestOutbound[sControlConfig],
            aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
            oDataPointOrChartBindingContext = oSource.getBindingContext(),
            sMetaPath = oDataPointOrChartBindingContext.getModel().getMetaModel().getMetaPath(oDataPointOrChartBindingContext.getPath());
          let aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
          let additionalNavigationParameters;
          aNavigationData = aNavigationData.map(function (oNavigationData) {
            return {
              data: oNavigationData,
              metaPath: sMetaPath + (sCollectionPath ? `/${sCollectionPath}` : "")
            };
          });
          if (oTargetInfo && oTargetInfo.parameters) {
            const oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
            if (Object.keys(oParams).length > 0) {
              additionalNavigationParameters = oParams;
            }
          }
          if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
            oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
              navigationContexts: aNavigationData,
              semanticObjectMapping: aSemanticObjectMapping,
              additionalNavigationParameters: additionalNavigationParameters
            });
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onNavigateChange(oEvent) {
          //will be called always when we click on a section tab
          this.getExtensionAPI().updateAppState();
          this.bSectionNavigated = true;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oObjectPage = this._getObjectPageLayoutControl();
          if (oObjectPage.getModel("ui").getProperty("/isEditable") && this.getView().getViewData().sectionLayout === "Tabs" && oInternalModelContext.getProperty("errorNavigationSectionFlag") === false) {
            const oSubSection = oEvent.getParameter("subSection");
            this._updateFocusInEditMode([oSubSection]);
          }
        },
        onVariantSelected: function () {
          this.getExtensionAPI().updateAppState();
        },
        onVariantSaved: function () {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 2000);
        },
        navigateToSubSection: function (oController, vDetailConfig) {
          const oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
          const oObjectPage = oController.getView().byId("fe::ObjectPage");
          let oSection;
          let oSubSection;
          if (oDetailConfig.sectionId) {
            oSection = oController.getView().byId(oDetailConfig.sectionId);
            oSubSection = oDetailConfig.subSectionId ? oController.getView().byId(oDetailConfig.subSectionId) : oSection && oSection.getSubSections() && oSection.getSubSections()[0];
          } else if (oDetailConfig.subSectionId) {
            oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
            oSection = oSubSection && oSubSection.getParent();
          }
          if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
            const sTitle = getResourceModel(oController).getText("C_ROUTING_NAVIGATION_DISABLED_TITLE", undefined, oController.getView().getViewData().entitySet);
            Log.error(sTitle);
            MessageBox.error(sTitle);
          } else {
            oObjectPage.scrollToSection(oSubSection.getId());
            // trigger iapp state change
            oObjectPage.fireNavigate({
              section: oSection,
              subSection: oSubSection
            });
          }
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        closeOPMessageStrip: function () {
          this.getExtensionAPI().hideMessage();
        }
      };
      return _this;
    }
    var _proto = ObjectPageController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI(sId) {
      if (sId) {
        // to allow local ID usage for custom pages we'll create/return own instances for custom sections
        this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};
        if (!this.mCustomSectionExtensionAPIs[sId]) {
          this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
        }
        return this.mCustomSectionExtensionAPIs[sId];
      } else {
        if (!this.extensionAPI) {
          this.extensionAPI = new ExtensionAPI(this);
        }
        return this.extensionAPI;
      }
    };
    _proto.onInit = function onInit() {
      _PageController.prototype.onInit.call(this);
      const oObjectPage = this._getObjectPageLayoutControl();

      // Setting defaults of internal model context
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("externalNavigationContext", {
        page: true
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("relatedApps", {
        visibility: false,
        items: null
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("batchGroups", this._getBatchGroupsForView());
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      if (oObjectPage.getEnableLazyLoading()) {
        //Attaching the event to make the subsection context binding active when it is visible.
        oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
      }
      this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
      this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditEnabled", true);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditVisible", true);
    };
    _proto.onExit = function onExit() {
      if (this.mCustomSectionExtensionAPIs) {
        for (const sId of Object.keys(this.mCustomSectionExtensionAPIs)) {
          if (this.mCustomSectionExtensionAPIs[sId]) {
            this.mCustomSectionExtensionAPIs[sId].destroy();
          }
        }
        delete this.mCustomSectionExtensionAPIs;
      }
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
      const oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
      if (oMessagePopover && oMessagePopover.isOpen()) {
        oMessagePopover.close();
      }
      //when exiting we set keepAlive context to false
      const oContext = this.getView().getBindingContext();
      if (oContext && oContext.isKeepAlive()) {
        oContext.setKeepAlive(false);
      }
      if (isConnected(this.getView())) {
        disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
      }
    }

    /**
     * Method to show the message strip on the object page.
     *
     * @private
     */;
    _proto._fnShowOPMessage = function _fnShowOPMessage() {
      const extensionAPI = this.getExtensionAPI();
      const view = this.getView();
      const messages = this.messageButton.oMessagePopover.getItems().map(item => item.getBindingContext("message").getObject()).filter(message => {
        var _view$getBindingConte;
        return message.getTargets()[0] === ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath());
      });
      if (extensionAPI) {
        extensionAPI.showMessages(messages);
      }
    };
    _proto._getTableBinding = function _getTableBinding(oTable) {
      return oTable && oTable.getRowBinding();
    }

    /**
     * Find the last visible subsection and add the sapUxAPObjectPageSubSectionFitContainer CSS class if it contains only a gridTable.
     *
     * @param subSections The sub sections to look for
     * @private
     */;
    _proto.checkSectionsForGridTable = function checkSectionsForGridTable(subSections) {
      const changeClassForTables = (event, lastVisibleSubSection) => {
        var _this$searchTableInBl, _this$searchTableInBl2;
        const blocks = [...lastVisibleSubSection.getBlocks(), ...lastVisibleSubSection.getMoreBlocks()];
        if (blocks.length === 1 && (_this$searchTableInBl = this.searchTableInBlock(blocks[0])) !== null && _this$searchTableInBl !== void 0 && (_this$searchTableInBl2 = _this$searchTableInBl.getType()) !== null && _this$searchTableInBl2 !== void 0 && _this$searchTableInBl2.isA("sap.ui.mdc.table.GridTableType")) {
          //In case there is only a single table in a subSection we fit that to the whole page so that the scrollbar comes only on table and not on page
          lastVisibleSubSection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
          lastVisibleSubSection.detachEvent("modelContextChange", changeClassForTables, this);
        }
      };
      for (let subSectionIndex = subSections.length - 1; subSectionIndex >= 0; subSectionIndex--) {
        if (subSections[subSectionIndex].getVisible()) {
          const lastVisibleSubSection = subSections[subSectionIndex];
          // We need to attach this event in order to manage the Object Page Lazy Loading mechanism
          lastVisibleSubSection.attachEvent("modelContextChange", lastVisibleSubSection, changeClassForTables, this);
          break;
        }
      }
    }

    /**
     * Find a table in blocks of section.
     *
     * @param block One sub section block
     * @returns Table if exists
     */;
    _proto.searchTableInBlock = function searchTableInBlock(block) {
      const control = block.content;
      let tableAPI;
      if (block.isA("sap.fe.templates.ObjectPage.controls.SubSectionBlock")) {
        // The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
        // control from the custom data of the place holder panel
        if (control.isA("sap.m.Panel") && control.data("FullScreenTablePlaceHolder")) {
          tableAPI = control.data("tableAPIreference");
        } else if (control.isA("sap.fe.macros.table.TableAPI")) {
          tableAPI = control;
        }
        if (tableAPI) {
          return tableAPI.content;
        }
      }
      return undefined;
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var _this$oView$oViewData;
      PageController.prototype.onBeforeRendering.apply(this);
      // In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
      if ((_this$oView$oViewData = this.oView.oViewData) !== null && _this$oView$oViewData !== void 0 && _this$oView$oViewData.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
        CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      let subSections;
      if (this._getObjectPageLayoutControl().getUseIconTabBar()) {
        const sections = this._getObjectPageLayoutControl().getSections();
        for (const section of sections) {
          subSections = section.getSubSections();
          this.checkSectionsForGridTable(subSections);
        }
      } else {
        subSections = this._getAllSubSections();
        this.checkSectionsForGridTable(subSections);
      }
    };
    _proto._onBeforeBinding = function _onBeforeBinding(oContext, mParameters) {
      // TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
      const aTables = this._findTables(),
        oObjectPage = this._getObjectPageLayoutControl(),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oInternalModel = this.getView().getModel("internal"),
        aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
        iViewLevel = this.getView().getViewData().viewLevel;
      let oFastCreationRow;
      aBatchGroups.push("$auto");
      if (mParameters.bDraftNavigation !== true) {
        this._closeSideContent();
      }
      const opContext = oObjectPage.getBindingContext();
      if (opContext && opContext.hasPendingChanges() && !aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))) {
        /* 	In case there are pending changes for the creation row and no others we need to reset the changes
        					TODO: this is just a quick solution, this needs to be reworked
        					*/

        opContext.getBinding().resetChanges();
      }

      // For now we have to set the binding context to null for every fast creation row
      // TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
      for (let i = 0; i < aTables.length; i++) {
        oFastCreationRow = aTables[i].getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      }

      // Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
      const fnScrollToPresentSection = function () {
        if (!oObjectPage.isFirstRendering() && !mParameters.bPersistOPScroll) {
          oObjectPage.setSelectedSection(null);
        }
      };
      oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

      // if the structure of the ObjectPageLayout is changed then scroll to present Section
      // FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
      const oDelegateOnBefore = {
        onAfterRendering: fnScrollToPresentSection
      };
      oObjectPage.addEventDelegate(oDelegateOnBefore, this);
      this.pageReady.attachEventOnce("pageReady", function () {
        oObjectPage.removeEventDelegate(oDelegateOnBefore);
      });

      //Set the Binding for Paginators using ListBinding ID
      if (iViewLevel > 1) {
        let oBinding = mParameters && mParameters.listBinding;
        const oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
        if (oPaginatorCurrentContext) {
          const oBindingToUse = oPaginatorCurrentContext.getBinding();
          this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
          oInternalModel.setProperty("/paginatorCurrentContext", null);
        } else if (oBinding) {
          if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
            this.paginator.initialize(oBinding, oContext);
          } else {
            // if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
            // we need to create it
            const sBindingPath = oBinding.getPath();
            if (/\([^)]*\)$/.test(sBindingPath)) {
              // The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
              const sListBindingPath = sBindingPath.replace(/\([^)]*\)$/, "");
              oBinding = new ODataListBinding(oBinding.oModel, sListBindingPath);
              const _setListBindingAsync = () => {
                if (oBinding.getContexts().length > 0) {
                  this.paginator.initialize(oBinding, oContext);
                  oBinding.detachEvent("change", _setListBindingAsync);
                }
              };
              oBinding.getContexts(0);
              oBinding.attachEvent("change", _setListBindingAsync);
            } else {
              // The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
              this.paginator.initialize(undefined);
            }
          }
        }
      }
      if (oObjectPage.getEnableLazyLoading()) {
        const aSections = oObjectPage.getSections();
        const bUseIconTabBar = oObjectPage.getUseIconTabBar();
        let iSkip = 2;
        const bIsInEditMode = oObjectPage.getModel("ui").getProperty("/isEditable");
        const bEditableHeader = this.getView().getViewData().editableHeaderContent;
        for (let iSection = 0; iSection < aSections.length; iSection++) {
          const oSection = aSections[iSection];
          const aSubSections = oSection.getSubSections();
          for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
            // In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
            if (iSkip < 1 || bUseIconTabBar && (iSection > 1 || iSection === 1 && !bEditableHeader && !bIsInEditMode)) {
              const oSubSection = aSubSections[iSubSection];
              if (oSubSection.data().isVisibilityDynamic !== "true") {
                oSubSection.setBindingContext(null);
              }
            }
          }
        }
      }
      if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
        const oView = this.getView();
        const oNavContainer = oView.getParent().oContainer.getParent();
        if (oNavContainer) {
          oNavContainer.showPlaceholder({});
        }
      }
    };
    _proto._getFirstClickableElement = function _getFirstClickableElement(oObjectPage) {
      let oFirstClickableElement;
      const aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
      if (aActions && aActions.length) {
        oFirstClickableElement = aActions.find(function (oAction) {
          // Due to the left alignment of the Draft switch and the collaborative draft avatar controls
          // there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
          // Due to the ACC report, we also need not to check for the InvisibleText elements
          if (oAction.isA("sap.fe.macros.share.ShareAPI")) {
            // since ShareAPI does not have a disable property
            // hence there is no need to check if it is disbaled or not
            return oAction.getVisible();
          } else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
            return oAction.getVisible() && oAction.getEnabled();
          }
        });
      }
      return oFirstClickableElement;
    };
    _proto._getFirstEmptyMandatoryFieldFromSubSection = function _getFirstEmptyMandatoryFieldFromSubSection(aSubSections) {
      if (aSubSections) {
        for (let subSection = 0; subSection < aSubSections.length; subSection++) {
          const aBlocks = aSubSections[subSection].getBlocks();
          if (aBlocks) {
            for (let block = 0; block < aBlocks.length; block++) {
              let aFormContainers;
              if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getFormContainers();
              } else if (aBlocks[block].getContent && aBlocks[block].getContent() && aBlocks[block].getContent().isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getContent().getFormContainers();
              }
              if (aFormContainers) {
                for (let formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
                  const aFormElements = aFormContainers[formContainer].getFormElements();
                  if (aFormElements) {
                    for (let formElement = 0; formElement < aFormElements.length; formElement++) {
                      const aFields = aFormElements[formElement].getFields();

                      // The first field is not necessarily an InputBase (e.g. could be a Text)
                      // So we need to check whether it has a getRequired method
                      try {
                        if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
                          return aFields[0];
                        }
                      } catch (error) {
                        Log.debug(`Error when searching for mandaotry empty field: ${error}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return undefined;
    };
    _proto._updateFocusInEditMode = function _updateFocusInEditMode(aSubSections) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
      let oFieldToFocus;
      if (oMandatoryField) {
        oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
      } else {
        oFieldToFocus = oObjectPage._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
      }
      if (oFieldToFocus) {
        setTimeout(function () {
          // We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
          oFieldToFocus.focus();
        }, 0);
      }
    };
    _proto._handleSubSectionEnteredViewPort = function _handleSubSectionEnteredViewPort(oEvent) {
      const oSubSection = oEvent.getParameter("subSection");
      oSubSection.setBindingContext(undefined);
    };
    _proto._onBackNavigationInDraft = function _onBackNavigationInDraft(oContext) {
      this.messageHandler.removeTransitionMessages();
      if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
        // Back nav will keep the same context --> no need to display the dialog
        history.back();
      } else {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          history.back();
        }, Function.prototype, oContext, this, false, draft.NavigationType.BackNavigation);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._onAfterBinding = function _onAfterBinding(oBindingContext, mParameters) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const aTables = this._findTables();
      this._sideEffects.clearFieldGroupsValidity();

      // TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
      // binding with ownRequest
      oBindingContext = oObjectPage.getBindingContext();
      let aIBNActions = [];
      oObjectPage.getSections().forEach(function (oSection) {
        oSection.getSubSections().forEach(function (oSubSection) {
          aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
        });
      });

      // Assign internal binding contexts to oFormContainer:
      // 1. It is not possible to assign the internal binding context to the XML fragment
      // (FormContainer.fragment.xml) yet - it is used already for the data-structure.
      // 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
      // internal model context at all.

      aTables.forEach(function (oTable) {
        const oInternalModelContext = oTable.getBindingContext("internal");
        if (oInternalModelContext) {
          oInternalModelContext.setProperty("creationRowFieldValidity", {});
          oInternalModelContext.setProperty("creationRowCustomValidity", {});
          aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);

          // temporary workaround for BCP: 2080218004
          // Need to fix with BLI: FIORITECHP1-15274
          // only for edit mode, we clear the table cache
          // Workaround starts here!!
          const oTableRowBinding = oTable.getRowBinding();
          if (oTableRowBinding) {
            if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
              // apply for both edit and display mode in sticky
              oTableRowBinding.removeCachesAndMessages("");
            }
          }
          // Workaround ends here!!

          // Update 'enabled' property of DataFieldForAction buttons on table toolbar
          // The same is also performed on Table selectionChange event
          const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
            aSelectedContexts = oTable.getSelectedContexts();
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
          // Clear the selection in the table, need to be fixed and review with BLI: FIORITECHP1-24318
          oTable.clearSelection();
        }
      });
      CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
      //Retrieve Object Page header actions from Object Page title control
      const oObjectPageTitle = oObjectPage.getHeaderTitle();
      let aIBNHeaderActions = [];
      aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
      aIBNActions = aIBNActions.concat(aIBNHeaderActions);
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
      let oModel, oFinalUIState;

      // this should not be needed at the all
      /**
       * @param oTable
       */
      const handleTableModifications = oTable => {
        const oBinding = this._getTableBinding(oTable),
          fnHandleTablePatchEvents = function () {
            TableHelper.enableFastCreationRow(oTable.getCreationRow(), oBinding.getPath(), oBinding.getContext(), oModel, oFinalUIState);
          };
        if (!oBinding) {
          Log.error(`Expected binding missing for table: ${oTable.getId()}`);
          return;
        }
        if (oBinding.oContext) {
          fnHandleTablePatchEvents();
        } else {
          const fnHandleChange = function () {
            if (oBinding.oContext) {
              fnHandleTablePatchEvents();
              oBinding.detachChange(fnHandleChange);
            }
          };
          oBinding.attachChange(fnHandleChange);
        }
      };
      if (oBindingContext) {
        oModel = oBindingContext.getModel();

        // Compute Edit Mode
        oFinalUIState = this.editFlow.computeEditMode(oBindingContext);
        if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
          oFinalUIState.then(() => {
            if (this.getView().getModel("ui").getProperty("/isEditable")) {
              connect(this.getView());
            } else if (isConnected(this.getView())) {
              disconnect(this.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
            }
          }).catch(function (oError) {
            Log.error("Error while waiting for the final UI State", oError);
          });
        }
        // update related apps
        this._updateRelatedApps();

        //Attach the patch sent and patch completed event to the object page binding so that we can react
        const oBinding = oBindingContext.getBinding && oBindingContext.getBinding() || oBindingContext;

        // Attach the event handler only once to the same binding
        if (this.currentBinding !== oBinding) {
          oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
          this.currentBinding = oBinding;
        }
        aTables.forEach(function (oTable) {
          // access binding only after table is bound
          TableUtils.whenBound(oTable).then(handleTableModifications).catch(function (oError) {
            Log.error("Error while waiting for the table to be bound", oError);
          });
        });

        // should be called only after binding is ready hence calling it in onAfterBinding
        oObjectPage._triggerVisibleSubSectionsEvents();

        //To Compute the Edit Binding of the subObject page using root object page, create a context for draft root and update the edit button in sub OP using the context
        ActionRuntime.updateEditButtonVisibilityAndEnablement(this.getView());
      }
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const setFocus = () => {
        // Set the focus to the first action button, or to the first editable input if in editable mode
        const oObjectPage = this._getObjectPageLayoutControl();
        const isInDisplayMode = !oObjectPage.getModel("ui").getProperty("/isEditable");
        if (isInDisplayMode) {
          const oFirstClickableElement = this._getFirstClickableElement(oObjectPage);
          if (oFirstClickableElement) {
            oFirstClickableElement.focus();
          }
        } else {
          const oSelectedSection = Core.byId(oObjectPage.getSelectedSection());
          if (oSelectedSection) {
            this._updateFocusInEditMode(oSelectedSection.getSubSections());
          }
        }
      };
      // Apply app state only after the page is ready with the first section selected
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oBindingContext = oView.getBindingContext();
      //Show popup while navigating back from object page in case of draft
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (!bIsStickyMode) {
          const oAppComponent = CommonUtils.getAppComponent(oView);
          oAppComponent.getShellServices().setBackNavigation(() => this._onBackNavigationInDraft(oBindingContext));
        }
      }
      const viewId = this.getView().getId();
      this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()).then(() => {
        if (mParameters.forceFocus) {
          setFocus();
        }
      }).catch(function (Error) {
        Log.error("Error while setting the focus", Error);
      });
      oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      this._checkDataPointTitleForExternalNavigation();
    }

    /**
     * Get the status of edit mode for sticky session.
     *
     * @returns The status of edit mode for sticky session
     */;
    _proto.getStickyEditMode = function getStickyEditMode() {
      const oBindingContext = this.getView().getBindingContext && this.getView().getBindingContext();
      let bIsStickyEditMode = false;
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (bIsStickyMode) {
          bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        }
      }
      return bIsStickyEditMode;
    };
    _proto._getObjectPageLayoutControl = function _getObjectPageLayoutControl() {
      return this.byId("fe::ObjectPage");
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData) {
        return oCustomData.getKey() === "ObjectPageSubtitle";
      });
      return {
        title: oObjectPage.data("ObjectPageTitle") || "",
        subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
        intent: "",
        icon: ""
      };
    };
    _proto._executeHeaderShortcut = function _executeHeaderShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function (oElement) {
          return oElement.getId() === sButtonId;
        });
      if (oButton) {
        CommonUtils.fireButtonPress(oButton);
      }
    };
    _proto._executeFooterShortcut = function _executeFooterShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getFooter().getContent().find(function (oElement) {
          return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeTabShortCut = function _executeTabShortCut(oExecution) {
      const oObjectPage = this._getObjectPageLayoutControl(),
        aSections = oObjectPage.getSections(),
        iSectionIndexMax = aSections.length - 1,
        sCommand = oExecution.oSource.getCommand();
      let newSection,
        iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()));
      if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
        if (sCommand === "NextTab") {
          if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
            newSection = aSections[++iSelectedSectionIndex];
          }
        } else if (iSelectedSectionIndex !== 0) {
          // PreviousTab
          newSection = aSections[--iSelectedSectionIndex];
        }
        if (newSection) {
          oObjectPage.setSelectedSection(newSection);
          newSection.focus();
        }
      }
    };
    _proto._getFooterVisibility = function _getFooterVisibility() {
      const oInternalModelContext = this.getView().getBindingContext("internal");
      const sViewId = this.getView().getId();
      oInternalModelContext.setProperty("messageFooterContainsErrors", false);
      sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (oMessage) {
        if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
          oInternalModelContext.setProperty("messageFooterContainsErrors", true);
        }
      });
    };
    _proto._showMessagePopover = function _showMessagePopover(err, oRet) {
      if (err) {
        Log.error(err);
      }
      const rootViewController = this.getAppComponent().getRootViewController();
      const currentPageView = rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : this.getAppComponent().getRootContainer().getCurrentPage();
      if (!currentPageView.isA("sap.m.MessagePage")) {
        const oMessageButton = this.messageButton,
          oMessagePopover = oMessageButton.oMessagePopover,
          oItemBinding = oMessagePopover.getBinding("items");
        if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
          oMessageButton.setVisible(true);
          // workaround to ensure that oMessageButton is rendered when openBy is called
          setTimeout(function () {
            oMessagePopover.openBy(oMessageButton);
          }, 0);
        }
      }
      return oRet;
    };
    _proto._editDocument = function _editDocument(oContext) {
      const oModel = this.getView().getModel("ui");
      BusyLocker.lock(oModel);
      return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
        BusyLocker.unlock(oModel);
      });
    }

    /**
     * Gets the context of the DraftRoot path.
     * If a view has been created with the draft Root Path, this method returns its bindingContext.
     * Where no view is found a new created context is returned.
     * The new created context request the key of the entity in order to get the Etag of this entity.
     *
     * @function
     * @name getDraftRootPath
     * @returns Returns a Promise
     */;
    _proto.getDraftRootContext = async function getDraftRootContext() {
      const view = this.getView();
      const context = view.getBindingContext();
      if (context) {
        const draftRootContextPath = ModelHelper.getDraftRootPath(context);
        let simpleDraftRootContext;
        if (draftRootContextPath) {
          var _this$getAppComponent, _simpleDraftRootConte;
          // Check if a view matches with the draft root path
          const existingBindingContextOnPage = (_this$getAppComponent = this.getAppComponent().getRootViewController().getInstancedViews().find(pageView => {
            var _pageView$getBindingC;
            return ((_pageView$getBindingC = pageView.getBindingContext()) === null || _pageView$getBindingC === void 0 ? void 0 : _pageView$getBindingC.getPath()) === draftRootContextPath;
          })) === null || _this$getAppComponent === void 0 ? void 0 : _this$getAppComponent.getBindingContext();
          if (existingBindingContextOnPage) {
            return existingBindingContextOnPage;
          }
          const internalModel = view.getModel("internal");
          simpleDraftRootContext = internalModel.getProperty("/simpleDraftRootContext");
          if (((_simpleDraftRootConte = simpleDraftRootContext) === null || _simpleDraftRootConte === void 0 ? void 0 : _simpleDraftRootConte.getPath()) === draftRootContextPath) {
            return simpleDraftRootContext;
          }
          const model = context.getModel();
          simpleDraftRootContext = model.bindContext(draftRootContextPath).getBoundContext();
          await CommonUtils.waitForContextRequested(simpleDraftRootContext);
          // Store this new created context to use it on the next iterations
          internalModel.setProperty("/simpleDraftRootContext", simpleDraftRootContext);
          return simpleDraftRootContext;
        }
        return undefined;
      }
      return undefined;
    };
    _proto._validateDocument = async function _validateDocument() {
      const appComponent = this.getAppComponent();
      const control = Core.byId(Core.getCurrentFocusedControlId());
      const context = control === null || control === void 0 ? void 0 : control.getBindingContext();
      if (context && !context.isTransient()) {
        const sideEffectsService = appComponent.getSideEffectsService();
        const entityType = sideEffectsService.getEntityTypeFromContext(context);
        const globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
        // If there is at least one global SideEffects for the related entity, execute it/them
        if (globalSideEffects.length) {
          await this.editFlow.syncTask();
          return Promise.all(globalSideEffects.map(sideEffects => this._sideEffects.requestSideEffects(sideEffects, context)));
        }
        const draftRootContext = await this.getDraftRootContext();
        //Execute the draftValidation if there is no globalSideEffects (ignore ETags in collaboration draft)
        if (draftRootContext) {
          await this.editFlow.syncTask();
          return draft.executeDraftValidation(draftRootContext, appComponent, isConnected(this.getView()));
        }
      }
      return undefined;
    };
    _proto._saveDocument = async function _saveDocument(oContext) {
      const oModel = this.getView().getModel("ui"),
        aWaitCreateDocuments = [];
      // indicates if we are creating a new row in the OP
      let bExecuteSideEffectsOnError = false;
      BusyLocker.lock(oModel);
      this._findTables().forEach(oTable => {
        const oBinding = this._getTableBinding(oTable);
        const mParameters = {
          creationMode: oTable.data("creationMode"),
          creationRow: oTable.getCreationRow(),
          createAtEnd: oTable.data("createAtEnd") === "true"
        };
        const bCreateDocument = mParameters.creationRow && mParameters.creationRow.getBindingContext() && Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
        if (bCreateDocument) {
          // the bSkipSideEffects is a parameter created when we click the save key. If we press this key
          // we don't execute the handleSideEffects funciton to avoid batch redundancy
          mParameters.bSkipSideEffects = true;
          bExecuteSideEffectsOnError = true;
          aWaitCreateDocuments.push(this.editFlow.createDocument(oBinding, mParameters).then(function () {
            return oBinding;
          }));
        }
      });
      try {
        const aBindings = await Promise.all(aWaitCreateDocuments);
        const mParameters = {
          bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
          bindings: aBindings
        };
        // We need to either reject or resolve a promise here and return it since this save
        // function is not only called when pressing the save button in the footer, but also
        // when the user selects create or save in a dataloss popup.
        // The logic of the dataloss popup needs to detect if the save had errors or not in order
        // to decide if the subsequent action - like a back navigation - has to be executed or not.
        try {
          await this.editFlow.saveDocument(oContext, mParameters);
        } catch (error) {
          // If the saveDocument in editFlow returns errors we need
          // to show the message popover here and ensure that the
          // dataloss logic does not perform the follow up function
          // like e.g. a back navigation hence we return a promise and reject it
          this._showMessagePopover(error);
          throw error;
        }
      } finally {
        if (BusyLocker.isLocked(oModel)) {
          BusyLocker.unlock(oModel);
        }
      }
    };
    _proto._manageCollaboration = function _manageCollaboration() {
      openManageDialog(this.getView());
    };
    _proto._showCollaborationUserDetails = function _showCollaborationUserDetails(event) {
      showUserDetails(event, this.getView());
    };
    _proto._cancelDocument = function _cancelDocument(oContext, mParameters) {
      mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
      return this.editFlow.cancelDocument(oContext, mParameters);
    };
    _proto._applyDocument = function _applyDocument(oContext) {
      return this.editFlow.applyDocument(oContext).catch(() => this._showMessagePopover());
    };
    _proto._updateRelatedApps = function _updateRelatedApps() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const showRelatedApps = oObjectPage.data("showRelatedApps");
      if (showRelatedApps === "true" || showRelatedApps === true) {
        const appComponent = CommonUtils.getAppComponent(this.getView());
        CommonUtils.updateRelatedAppsDetails(oObjectPage, appComponent);
      }
    };
    _proto._findControlInSubSection = function _findControlInSubSection(aParentElement, aSubsection, aControls, bIsChart) {
      for (let element = 0; element < aParentElement.length; element++) {
        let oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
        if (bIsChart) {
          if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
            const aItems = oElement.getAggregation("items");
            aItems.forEach(function (oItem) {
              if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
                oElement = oItem;
              }
            });
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
          oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        // The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
        // control from the custom data of the place holder panel
        if (oElement && oElement.isA && oElement.isA("sap.m.Panel") && oElement.data("FullScreenTablePlaceHolder")) {
          oElement = oElement.data("tableAPIreference");
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
          aControls.push(oElement);
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
          aControls.push(oElement);
        }
      }
    };
    _proto._getAllSubSections = function _getAllSubSections() {
      const oObjectPage = this._getObjectPageLayoutControl();
      let aSubSections = [];
      oObjectPage.getSections().forEach(function (oSection) {
        aSubSections = aSubSections.concat(oSection.getSubSections());
      });
      return aSubSections;
    };
    _proto._getAllBlocks = function _getAllBlocks() {
      let aBlocks = [];
      this._getAllSubSections().forEach(function (oSubSection) {
        aBlocks = aBlocks.concat(oSubSection.getBlocks());
      });
      return aBlocks;
    };
    _proto._findTables = function _findTables() {
      const aSubSections = this._getAllSubSections();
      const aTables = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
      }
      return aTables;
    };
    _proto._findCharts = function _findCharts() {
      const aSubSections = this._getAllSubSections();
      const aCharts = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
      }
      return aCharts;
    };
    _proto._closeSideContent = function _closeSideContent() {
      this._getAllBlocks().forEach(function (oBlock) {
        const oContent = oBlock.getContent instanceof Function && oBlock.getContent();
        if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
          if (oContent.setShowSideContent instanceof Function) {
            oContent.setShowSideContent(false);
          }
        }
      });
    }

    /**
     * Chart Context is resolved for 1:n microcharts.
     *
     * @param oChartContext The Context of the MicroChart
     * @param sChartPath The collectionPath of the the chart
     * @returns Array of Attributes of the chart Context
     */;
    _proto._getChartContextData = function _getChartContextData(oChartContext, sChartPath) {
      const oContextData = oChartContext.getObject();
      let oChartContextData = [oContextData];
      if (oChartContext && sChartPath) {
        if (oContextData[sChartPath]) {
          oChartContextData = oContextData[sChartPath];
          delete oContextData[sChartPath];
          oChartContextData.push(oContextData);
        }
      }
      return oChartContextData;
    }

    /**
     * Scroll the tables to the row with the sPath
     *
     * @function
     * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
     * @param {string} sRowPath 'sPath of the table row'
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      if (this._findTables && this._findTables().length > 0) {
        const aTables = this._findTables();
        for (let i = 0; i < aTables.length; i++) {
          TableScroller.scrollTableToRow(aTables[i], sRowPath);
        }
      }
    }

    /**
     * Method to merge selected contexts and filters.
     *
     * @function
     * @name _mergeMultipleContexts
     * @param oPageContext Page context
     * @param aLineContext Selected Contexts
     * @param sChartPath Collection name of the chart
     * @returns Selection Variant Object
     */;
    _proto._mergeMultipleContexts = function _mergeMultipleContexts(oPageContext, aLineContext, sChartPath) {
      let aAttributes = [],
        aPageAttributes = [],
        oContext,
        sMetaPathLine,
        sPathLine;
      const sPagePath = oPageContext.getPath();
      const oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
      const sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

      // Get single line context if necessary
      if (aLineContext && aLineContext.length) {
        oContext = aLineContext[0];
        sPathLine = oContext.getPath();
        sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");
        aLineContext.forEach(oSingleContext => {
          if (sChartPath) {
            const oChartContextData = this._getChartContextData(oSingleContext, sChartPath);
            if (oChartContextData) {
              aAttributes = oChartContextData.map(function (oSubChartContextData) {
                return {
                  contextData: oSubChartContextData,
                  entitySet: `${sMetaPathPage}/${sChartPath}`
                };
              });
            }
          } else {
            aAttributes.push({
              contextData: oSingleContext.getObject(),
              entitySet: sMetaPathLine
            });
          }
        });
      }
      aPageAttributes.push({
        contextData: oPageContext.getObject(),
        entitySet: sMetaPathPage
      });
      // Adding Page Context to selection variant
      aPageAttributes = this._intentBasedNavigation.removeSensitiveData(aPageAttributes, sMetaPathPage);
      const oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
      aAttributes = this._intentBasedNavigation.removeSensitiveData(aAttributes, sMetaPathPage);
      return {
        selectionVariant: oPageLevelSV,
        attributes: aAttributes
      };
    };
    _proto._getBatchGroupsForView = function _getBatchGroupsForView() {
      const oViewData = this.getView().getViewData(),
        oConfigurations = oViewData.controlConfiguration,
        aConfigurations = oConfigurations && Object.keys(oConfigurations),
        aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];
      if (aConfigurations && aConfigurations.length > 0) {
        aConfigurations.forEach(function (sKey) {
          const oConfiguration = oConfigurations[sKey];
          if (oConfiguration.requestGroupId === "LongRunners") {
            aBatchGroups.push("$auto.LongRunners");
          }
        });
      }
      return aBatchGroups;
    }

    /*
     * Reset Breadcrumb links
     *
     * @function
     * @param {sap.m.Breadcrumbs} [oSource] parent control
     * @description Used when context of the object page changes.
     *              This event callback is attached to modelContextChange
     *              event of the Breadcrumb control to catch context change.
     *              Then element binding and hrefs are updated for each link.
     *
     * @ui5-restricted
     * @experimental
     */;
    _proto._setBreadcrumbLinks = async function _setBreadcrumbLinks(oSource) {
      const oContext = oSource.getBindingContext(),
        oAppComponent = this.getAppComponent(),
        aPromises = [],
        aSkipParameterized = [],
        sNewPath = oContext === null || oContext === void 0 ? void 0 : oContext.getPath(),
        aPathParts = (sNewPath === null || sNewPath === void 0 ? void 0 : sNewPath.split("/")) ?? [],
        oMetaModel = oAppComponent && oAppComponent.getMetaModel();
      let sPath = "";
      try {
        aPathParts.shift();
        aPathParts.splice(-1, 1);
        aPathParts.forEach(function (sPathPart) {
          sPath += `/${sPathPart}`;
          const oRootViewController = oAppComponent.getRootViewController();
          const sParameterPath = oMetaModel.getMetaPath(sPath);
          const bResultContext = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
          if (bResultContext) {
            // We dont need to create a breadcrumb for Parameter path
            aSkipParameterized.push(1);
            return;
          } else {
            aSkipParameterized.push(0);
          }
          aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
        });
        const titleHierarchyInfos = await Promise.all(aPromises);
        let idx, hierarchyPosition, oLink;
        for (const titleHierarchyInfo of titleHierarchyInfos) {
          hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
          idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
          oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
          //sCurrentEntity is a fallback value in case of empty title
          oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
          //We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
          oLink.setHref(encodeURI(titleHierarchyInfo.intent));
          if (!oSource.getLinks()[idx]) {
            oSource.addLink(oLink);
          }
        }
      } catch (error) {
        Log.error("Error while setting the breadcrumb links:" + error);
      }
    };
    _proto._checkDataPointTitleForExternalNavigation = function _checkDataPointTitleForExternalNavigation() {
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(oView.getViewData(), this.getAppComponent().getRoutingService().getOutbounds());
      const oShellServices = this.getAppComponent().getShellServices();
      const oPageContext = oView && oView.getBindingContext();
      oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
      if (oPageContext) {
        oPageContext.requestObject().then(function (oData) {
          fnGetLinks(oDataPoints, oData);
        }).catch(function (oError) {
          Log.error("Cannot retrieve the links from the shell service", oError);
        });
      }

      /**
       * @param oError
       */
      function fnOnError(oError) {
        Log.error(oError);
      }
      function fnSetLinkEnablement(id, aSupportedLinks) {
        const sLinkId = id;
        // process viable links from getLinks for all datapoints having outbound
        if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
          oInternalModelContext.setProperty(`isHeaderDPLinkVisible/${sLinkId}`, true);
        }
      }

      /**
       * @param oSubDataPoints
       * @param oPageData
       */
      function fnGetLinks(oSubDataPoints, oPageData) {
        for (const sId in oSubDataPoints) {
          const oDataPoint = oSubDataPoints[sId];
          const oParams = {};
          const oLink = oView.byId(sId);
          if (!oLink) {
            // for data points configured in app descriptor but not annotated in the header
            continue;
          }
          const oLinkContext = oLink.getBindingContext();
          const oLinkData = oLinkContext && oLinkContext.getObject();
          let oMixedContext = merge({}, oPageData, oLinkData);
          // process semantic object mappings
          if (oDataPoint.semanticObjectMapping) {
            const aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
            for (const item in aSemanticObjectMapping) {
              const oMapping = aSemanticObjectMapping[item];
              const sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
              const sMappedProperty = oMapping["SemanticObjectProperty"];
              if (sMainProperty !== sMappedProperty) {
                if (oMixedContext.hasOwnProperty(sMainProperty)) {
                  const oNewMapping = {};
                  oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
                  oMixedContext = merge({}, oMixedContext, oNewMapping);
                  delete oMixedContext[sMainProperty];
                }
              }
            }
          }
          if (oMixedContext) {
            for (const sKey in oMixedContext) {
              if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
                oParams[sKey] = oMixedContext[sKey];
              }
            }
          }
          // validate if a link must be rendered
          oShellServices.isNavigationSupported([{
            target: {
              semanticObject: oDataPoint.semanticObject,
              action: oDataPoint.action
            },
            params: oParams
          }]).then(aLinks => {
            return fnSetLinkEnablement(sId, aLinks);
          }).catch(fnOnError);
        }
      }
    };
    return ObjectPageController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return ObjectPageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3RQYWdlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJQbGFjZWhvbGRlciIsIlNoYXJlIiwib3ZlcnJpZGUiLCJTaGFyZU92ZXJyaWRlcyIsIkludGVybmFsUm91dGluZyIsIkludGVybmFsUm91dGluZ092ZXJyaWRlIiwiUGFnaW5hdG9yIiwiUGFnaW5hdG9yT3ZlcnJpZGUiLCJNZXNzYWdlSGFuZGxlciIsIk1lc3NhZ2VIYW5kbGVyT3ZlcnJpZGUiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIkludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbk1vZGUiLCJiSXNTdGlja3lFZGl0TW9kZSIsImdldFZpZXciLCJnZXRDb250cm9sbGVyIiwiZ2V0U3RpY2t5RWRpdE1vZGUiLCJ1bmRlZmluZWQiLCJWaWV3U3RhdGUiLCJWaWV3U3RhdGVPdmVycmlkZXMiLCJQYWdlUmVhZHkiLCJpc0NvbnRleHRFeHBlY3RlZCIsIk1hc3NFZGl0IiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsImhhbmRsZXJzIiwib25QcmltYXJ5QWN0aW9uIiwib0NvbnRyb2xsZXIiLCJvVmlldyIsIm9Db250ZXh0Iiwic0FjdGlvbk5hbWUiLCJtUGFyYW1ldGVycyIsIm1Db25kaXRpb25zIiwiaVZpZXdMZXZlbCIsImdldFZpZXdEYXRhIiwidmlld0xldmVsIiwib09iamVjdFBhZ2UiLCJfZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2wiLCJwb3NpdGl2ZUFjdGlvblZpc2libGUiLCJwb3NpdGl2ZUFjdGlvbkVuYWJsZWQiLCJvbkNhbGxBY3Rpb24iLCJlZGl0QWN0aW9uVmlzaWJsZSIsImVkaXRBY3Rpb25FbmFibGVkIiwiX2VkaXREb2N1bWVudCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJfc2F2ZURvY3VtZW50IiwiX2FwcGx5RG9jdW1lbnQiLCJvblRhYmxlQ29udGV4dENoYW5nZSIsIm9FdmVudCIsIm9Tb3VyY2UiLCJnZXRTb3VyY2UiLCJvVGFibGUiLCJfZmluZFRhYmxlcyIsInNvbWUiLCJfb1RhYmxlIiwiZ2V0Um93QmluZGluZyIsImZhc3RDcmVhdGlvblJvdyIsImdldENyZWF0aW9uUm93IiwiX29Jbm5lckNyZWF0aW9uUm93IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ0YWJsZUJpbmRpbmciLCJfZ2V0VGFibGVCaW5kaW5nIiwiTG9nIiwiZXJyb3IiLCJnZXRJZCIsImdldENvbnRleHQiLCJvYmplY3RQYWdlIiwiYmluZGluZ0NvbnRleHQiLCJtb2RlbCIsIlRhYmxlSGVscGVyIiwiZW5hYmxlRmFzdENyZWF0aW9uUm93IiwiZ2V0UGF0aCIsIm9DdXJyZW50QWN0aW9uUHJvbWlzZSIsImVkaXRGbG93IiwiZ2V0Q3VycmVudEFjdGlvblByb21pc2UiLCJhVGFibGVDb250ZXh0cyIsImdldFR5cGUiLCJnZXRNZXRhZGF0YSIsImlzQSIsImdldENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwidGhlbiIsIm9BY3Rpb25SZXNwb25zZSIsImNvbnRyb2xJZCIsInNJZCIsIm9BY3Rpb25EYXRhIiwib0RhdGEiLCJhS2V5cyIsImtleXMiLCJpTmV3SXRlbXAiLCJmaW5kIiwib1RhYmxlQ29udGV4dCIsImkiLCJvVGFibGVEYXRhIiwiZ2V0T2JqZWN0IiwiYkNvbXBhcmUiLCJldmVyeSIsInNLZXkiLCJhRGlhbG9ncyIsIkluc3RhbmNlTWFuYWdlciIsImdldE9wZW5EaWFsb2dzIiwib0RpYWxvZyIsImxlbmd0aCIsImRpYWxvZyIsImRhdGEiLCJhdHRhY2hFdmVudE9uY2UiLCJmb2N1c1JvdyIsImRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlQnV0dG9uIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsImludm9rZUFjdGlvbiIsIl9zaG93TWVzc2FnZVBvcG92ZXIiLCJiaW5kIiwib25EYXRhUG9pbnRUaXRsZVByZXNzZWQiLCJvTWFuaWZlc3RPdXRib3VuZCIsInNDb250cm9sQ29uZmlnIiwic0NvbGxlY3Rpb25QYXRoIiwiSlNPTiIsInBhcnNlIiwib1RhcmdldEluZm8iLCJhU2VtYW50aWNPYmplY3RNYXBwaW5nIiwiQ29tbW9uVXRpbHMiLCJnZXRTZW1hbnRpY09iamVjdE1hcHBpbmciLCJvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0Iiwic01ldGFQYXRoIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0TWV0YVBhdGgiLCJhTmF2aWdhdGlvbkRhdGEiLCJfZ2V0Q2hhcnRDb250ZXh0RGF0YSIsImFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm1hcCIsIm9OYXZpZ2F0aW9uRGF0YSIsIm1ldGFQYXRoIiwicGFyYW1ldGVycyIsIm9QYXJhbXMiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJPYmplY3QiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm5hdmlnYXRlIiwibmF2aWdhdGlvbkNvbnRleHRzIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwib25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kIiwic091dGJvdW5kVGFyZ2V0Iiwic0NyZWF0ZVBhdGgiLCJvbk5hdmlnYXRlQ2hhbmdlIiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJiU2VjdGlvbk5hdmlnYXRlZCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNlY3Rpb25MYXlvdXQiLCJvU3ViU2VjdGlvbiIsImdldFBhcmFtZXRlciIsIl91cGRhdGVGb2N1c0luRWRpdE1vZGUiLCJvblZhcmlhbnRTZWxlY3RlZCIsIm9uVmFyaWFudFNhdmVkIiwic2V0VGltZW91dCIsIm5hdmlnYXRlVG9TdWJTZWN0aW9uIiwidkRldGFpbENvbmZpZyIsIm9EZXRhaWxDb25maWciLCJieUlkIiwib1NlY3Rpb24iLCJzZWN0aW9uSWQiLCJzdWJTZWN0aW9uSWQiLCJnZXRTdWJTZWN0aW9ucyIsImdldFBhcmVudCIsImdldFZpc2libGUiLCJzVGl0bGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImVudGl0eVNldCIsIk1lc3NhZ2VCb3giLCJzY3JvbGxUb1NlY3Rpb24iLCJmaXJlTmF2aWdhdGUiLCJzZWN0aW9uIiwic3ViU2VjdGlvbiIsIm9uU3RhdGVDaGFuZ2UiLCJjbG9zZU9QTWVzc2FnZVN0cmlwIiwiaGlkZU1lc3NhZ2UiLCJtQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMiLCJFeHRlbnNpb25BUEkiLCJleHRlbnNpb25BUEkiLCJvbkluaXQiLCJzZXRQcm9wZXJ0eSIsInBhZ2UiLCJ2aXNpYmlsaXR5IiwiaXRlbXMiLCJfZ2V0QmF0Y2hHcm91cHNGb3JWaWV3IiwiZ2V0RW5hYmxlTGF6eUxvYWRpbmciLCJhdHRhY2hFdmVudCIsIl9oYW5kbGVTdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0Iiwib0l0ZW1CaW5kaW5nIiwiYXR0YWNoQ2hhbmdlIiwiX2ZuU2hvd09QTWVzc2FnZSIsIm9uRXhpdCIsImRlc3Ryb3kiLCJvTWVzc2FnZVBvcG92ZXIiLCJpc09wZW4iLCJjbG9zZSIsImlzS2VlcEFsaXZlIiwic2V0S2VlcEFsaXZlIiwiaXNDb25uZWN0ZWQiLCJkaXNjb25uZWN0IiwidmlldyIsIm1lc3NhZ2VzIiwiZ2V0SXRlbXMiLCJpdGVtIiwiZmlsdGVyIiwibWVzc2FnZSIsImdldFRhcmdldHMiLCJzaG93TWVzc2FnZXMiLCJjaGVja1NlY3Rpb25zRm9yR3JpZFRhYmxlIiwic3ViU2VjdGlvbnMiLCJjaGFuZ2VDbGFzc0ZvclRhYmxlcyIsImV2ZW50IiwibGFzdFZpc2libGVTdWJTZWN0aW9uIiwiYmxvY2tzIiwiZ2V0QmxvY2tzIiwiZ2V0TW9yZUJsb2NrcyIsInNlYXJjaFRhYmxlSW5CbG9jayIsImFkZFN0eWxlQ2xhc3MiLCJkZXRhY2hFdmVudCIsInN1YlNlY3Rpb25JbmRleCIsImJsb2NrIiwiY29udHJvbCIsImNvbnRlbnQiLCJ0YWJsZUFQSSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiUGFnZUNvbnRyb2xsZXIiLCJwcm90b3R5cGUiLCJhcHBseSIsIm9WaWV3RGF0YSIsInJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QiLCJDb21tb25IZWxwZXIiLCJzZXRNZXRhTW9kZWwiLCJnZXRBcHBDb21wb25lbnQiLCJvbkFmdGVyUmVuZGVyaW5nIiwiZ2V0VXNlSWNvblRhYkJhciIsInNlY3Rpb25zIiwiZ2V0U2VjdGlvbnMiLCJfZ2V0QWxsU3ViU2VjdGlvbnMiLCJfb25CZWZvcmVCaW5kaW5nIiwiYVRhYmxlcyIsIm9JbnRlcm5hbE1vZGVsIiwiYUJhdGNoR3JvdXBzIiwib0Zhc3RDcmVhdGlvblJvdyIsInB1c2giLCJiRHJhZnROYXZpZ2F0aW9uIiwiX2Nsb3NlU2lkZUNvbnRlbnQiLCJvcENvbnRleHQiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJzZXRCaW5kaW5nQ29udGV4dCIsImZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvbiIsImlzRmlyc3RSZW5kZXJpbmciLCJiUGVyc2lzdE9QU2Nyb2xsIiwic2V0U2VsZWN0ZWRTZWN0aW9uIiwib0RlbGVnYXRlT25CZWZvcmUiLCJhZGRFdmVudERlbGVnYXRlIiwicGFnZVJlYWR5IiwicmVtb3ZlRXZlbnREZWxlZ2F0ZSIsIm9CaW5kaW5nIiwibGlzdEJpbmRpbmciLCJvUGFnaW5hdG9yQ3VycmVudENvbnRleHQiLCJvQmluZGluZ1RvVXNlIiwicGFnaW5hdG9yIiwiaW5pdGlhbGl6ZSIsInNCaW5kaW5nUGF0aCIsInRlc3QiLCJzTGlzdEJpbmRpbmdQYXRoIiwicmVwbGFjZSIsIk9EYXRhTGlzdEJpbmRpbmciLCJvTW9kZWwiLCJfc2V0TGlzdEJpbmRpbmdBc3luYyIsImFTZWN0aW9ucyIsImJVc2VJY29uVGFiQmFyIiwiaVNraXAiLCJiSXNJbkVkaXRNb2RlIiwiYkVkaXRhYmxlSGVhZGVyIiwiZWRpdGFibGVIZWFkZXJDb250ZW50IiwiaVNlY3Rpb24iLCJhU3ViU2VjdGlvbnMiLCJpU3ViU2VjdGlvbiIsImlzVmlzaWJpbGl0eUR5bmFtaWMiLCJwbGFjZWhvbGRlciIsImlzUGxhY2Vob2xkZXJFbmFibGVkIiwic2hvd1BsYWNlaG9sZGVyIiwib05hdkNvbnRhaW5lciIsIm9Db250YWluZXIiLCJfZ2V0Rmlyc3RDbGlja2FibGVFbGVtZW50Iiwib0ZpcnN0Q2xpY2thYmxlRWxlbWVudCIsImFBY3Rpb25zIiwiZ2V0SGVhZGVyVGl0bGUiLCJnZXRBY3Rpb25zIiwib0FjdGlvbiIsImdldEVuYWJsZWQiLCJfZ2V0Rmlyc3RFbXB0eU1hbmRhdG9yeUZpZWxkRnJvbVN1YlNlY3Rpb24iLCJhQmxvY2tzIiwiYUZvcm1Db250YWluZXJzIiwiZ2V0Rm9ybUNvbnRhaW5lcnMiLCJnZXRDb250ZW50IiwiZm9ybUNvbnRhaW5lciIsImFGb3JtRWxlbWVudHMiLCJnZXRGb3JtRWxlbWVudHMiLCJmb3JtRWxlbWVudCIsImFGaWVsZHMiLCJnZXRGaWVsZHMiLCJnZXRSZXF1aXJlZCIsImdldFZhbHVlIiwiZGVidWciLCJvTWFuZGF0b3J5RmllbGQiLCJvRmllbGRUb0ZvY3VzIiwiZ2V0Q29udGVudEVkaXQiLCJfZ2V0Rmlyc3RFZGl0YWJsZUlucHV0IiwiZm9jdXMiLCJfb25CYWNrTmF2aWdhdGlvbkluRHJhZnQiLCJtZXNzYWdlSGFuZGxlciIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsImdldFJvdXRlclByb3h5IiwiY2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCIsImhpc3RvcnkiLCJiYWNrIiwiZHJhZnQiLCJwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbiIsIkZ1bmN0aW9uIiwiTmF2aWdhdGlvblR5cGUiLCJCYWNrTmF2aWdhdGlvbiIsIl9vbkFmdGVyQmluZGluZyIsIm9CaW5kaW5nQ29udGV4dCIsIl9zaWRlRWZmZWN0cyIsImNsZWFyRmllbGRHcm91cHNWYWxpZGl0eSIsImFJQk5BY3Rpb25zIiwiZm9yRWFjaCIsImdldElCTkFjdGlvbnMiLCJvVGFibGVSb3dCaW5kaW5nIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJyZW1vdmVDYWNoZXNBbmRNZXNzYWdlcyIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAiLCJwYXJzZUN1c3RvbURhdGEiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJjbGVhclNlbGVjdGlvbiIsImdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwiLCJvT2JqZWN0UGFnZVRpdGxlIiwiYUlCTkhlYWRlckFjdGlvbnMiLCJjb25jYXQiLCJ1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIm9GaW5hbFVJU3RhdGUiLCJoYW5kbGVUYWJsZU1vZGlmaWNhdGlvbnMiLCJmbkhhbmRsZVRhYmxlUGF0Y2hFdmVudHMiLCJmbkhhbmRsZUNoYW5nZSIsImRldGFjaENoYW5nZSIsImNvbXB1dGVFZGl0TW9kZSIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwiY29ubmVjdCIsIm9FcnJvciIsIl91cGRhdGVSZWxhdGVkQXBwcyIsImN1cnJlbnRCaW5kaW5nIiwiaGFuZGxlUGF0Y2hTZW50IiwiVGFibGVVdGlscyIsIndoZW5Cb3VuZCIsIl90cmlnZ2VyVmlzaWJsZVN1YlNlY3Rpb25zRXZlbnRzIiwidXBkYXRlRWRpdEJ1dHRvblZpc2liaWxpdHlBbmRFbmFibGVtZW50Iiwib25QYWdlUmVhZHkiLCJzZXRGb2N1cyIsImlzSW5EaXNwbGF5TW9kZSIsIm9TZWxlY3RlZFNlY3Rpb24iLCJDb3JlIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiYklzU3RpY2t5TW9kZSIsIm9BcHBDb21wb25lbnQiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJ2aWV3SWQiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJhcHBseUFwcFN0YXRlIiwiZm9yY2VGb2N1cyIsIkVycm9yIiwiX2NoZWNrRGF0YVBvaW50VGl0bGVGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvT2JqZWN0UGFnZVN1YnRpdGxlIiwib0N1c3RvbURhdGEiLCJnZXRLZXkiLCJ0aXRsZSIsInN1YnRpdGxlIiwiaW50ZW50IiwiaWNvbiIsIl9leGVjdXRlSGVhZGVyU2hvcnRjdXQiLCJzQnV0dG9uSWQiLCJvQnV0dG9uIiwib0VsZW1lbnQiLCJmaXJlQnV0dG9uUHJlc3MiLCJfZXhlY3V0ZUZvb3RlclNob3J0Y3V0IiwiZ2V0Rm9vdGVyIiwiZ2V0TmFtZSIsIl9leGVjdXRlVGFiU2hvcnRDdXQiLCJvRXhlY3V0aW9uIiwiaVNlY3Rpb25JbmRleE1heCIsInNDb21tYW5kIiwiZ2V0Q29tbWFuZCIsIm5ld1NlY3Rpb24iLCJpU2VsZWN0ZWRTZWN0aW9uSW5kZXgiLCJpbmRleE9mU2VjdGlvbiIsIl9nZXRGb290ZXJWaXNpYmlsaXR5Iiwic1ZpZXdJZCIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsIm9NZXNzYWdlIiwidmFsaWRhdGlvbiIsInR5cGUiLCJ0YXJnZXQiLCJpbmRleE9mIiwib1JldCIsInJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImN1cnJlbnRQYWdlVmlldyIsImlzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdFZpZXciLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q3VycmVudFBhZ2UiLCJvTWVzc2FnZUJ1dHRvbiIsImdldExlbmd0aCIsInNldFZpc2libGUiLCJvcGVuQnkiLCJCdXN5TG9ja2VyIiwibG9jayIsImVkaXREb2N1bWVudCIsImZpbmFsbHkiLCJ1bmxvY2siLCJnZXREcmFmdFJvb3RDb250ZXh0IiwiY29udGV4dCIsImRyYWZ0Um9vdENvbnRleHRQYXRoIiwiZ2V0RHJhZnRSb290UGF0aCIsInNpbXBsZURyYWZ0Um9vdENvbnRleHQiLCJleGlzdGluZ0JpbmRpbmdDb250ZXh0T25QYWdlIiwiZ2V0SW5zdGFuY2VkVmlld3MiLCJwYWdlVmlldyIsImludGVybmFsTW9kZWwiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsIndhaXRGb3JDb250ZXh0UmVxdWVzdGVkIiwiX3ZhbGlkYXRlRG9jdW1lbnQiLCJhcHBDb21wb25lbnQiLCJnZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCIsImlzVHJhbnNpZW50Iiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVGcm9tQ29udGV4dCIsImdsb2JhbFNpZGVFZmZlY3RzIiwiZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyIsInN5bmNUYXNrIiwiUHJvbWlzZSIsImFsbCIsInNpZGVFZmZlY3RzIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZHJhZnRSb290Q29udGV4dCIsImV4ZWN1dGVEcmFmdFZhbGlkYXRpb24iLCJhV2FpdENyZWF0ZURvY3VtZW50cyIsImJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwiY3JlYXRpb25Nb2RlIiwiY3JlYXRpb25Sb3ciLCJjcmVhdGVBdEVuZCIsImJDcmVhdGVEb2N1bWVudCIsImJTa2lwU2lkZUVmZmVjdHMiLCJjcmVhdGVEb2N1bWVudCIsImFCaW5kaW5ncyIsImJpbmRpbmdzIiwic2F2ZURvY3VtZW50IiwiaXNMb2NrZWQiLCJfbWFuYWdlQ29sbGFib3JhdGlvbiIsIm9wZW5NYW5hZ2VEaWFsb2ciLCJfc2hvd0NvbGxhYm9yYXRpb25Vc2VyRGV0YWlscyIsInNob3dVc2VyRGV0YWlscyIsIl9jYW5jZWxEb2N1bWVudCIsImNhbmNlbEJ1dHRvbiIsImNhbmNlbERvY3VtZW50IiwiYXBwbHlEb2N1bWVudCIsInNob3dSZWxhdGVkQXBwcyIsInVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyIsIl9maW5kQ29udHJvbEluU3ViU2VjdGlvbiIsImFQYXJlbnRFbGVtZW50IiwiYVN1YnNlY3Rpb24iLCJhQ29udHJvbHMiLCJiSXNDaGFydCIsImVsZW1lbnQiLCJtQWdncmVnYXRpb25zIiwiZ2V0QWdncmVnYXRpb24iLCJhSXRlbXMiLCJvSXRlbSIsImdldE1haW5Db250ZW50IiwiX2dldEFsbEJsb2NrcyIsIl9maW5kQ2hhcnRzIiwiYUNoYXJ0cyIsIm9CbG9jayIsIm9Db250ZW50Iiwic2V0U2hvd1NpZGVDb250ZW50Iiwib0NoYXJ0Q29udGV4dCIsInNDaGFydFBhdGgiLCJvQ29udGV4dERhdGEiLCJvQ2hhcnRDb250ZXh0RGF0YSIsIl9zY3JvbGxUYWJsZXNUb1JvdyIsInNSb3dQYXRoIiwiVGFibGVTY3JvbGxlciIsInNjcm9sbFRhYmxlVG9Sb3ciLCJfbWVyZ2VNdWx0aXBsZUNvbnRleHRzIiwib1BhZ2VDb250ZXh0IiwiYUxpbmVDb250ZXh0IiwiYUF0dHJpYnV0ZXMiLCJhUGFnZUF0dHJpYnV0ZXMiLCJzTWV0YVBhdGhMaW5lIiwic1BhdGhMaW5lIiwic1BhZ2VQYXRoIiwib01ldGFNb2RlbCIsInNNZXRhUGF0aFBhZ2UiLCJvU2luZ2xlQ29udGV4dCIsIm9TdWJDaGFydENvbnRleHREYXRhIiwiY29udGV4dERhdGEiLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwib1BhZ2VMZXZlbFNWIiwiYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudCIsImF0dHJpYnV0ZXMiLCJvQ29uZmlndXJhdGlvbnMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsImFDb25maWd1cmF0aW9ucyIsIm9Db25maWd1cmF0aW9uIiwicmVxdWVzdEdyb3VwSWQiLCJfc2V0QnJlYWRjcnVtYkxpbmtzIiwiYVByb21pc2VzIiwiYVNraXBQYXJhbWV0ZXJpemVkIiwic05ld1BhdGgiLCJhUGF0aFBhcnRzIiwic3BsaXQiLCJzUGF0aCIsInNoaWZ0Iiwic3BsaWNlIiwic1BhdGhQYXJ0Iiwib1Jvb3RWaWV3Q29udHJvbGxlciIsInNQYXJhbWV0ZXJQYXRoIiwiYlJlc3VsdENvbnRleHQiLCJnZXRUaXRsZUluZm9Gcm9tUGF0aCIsInRpdGxlSGllcmFyY2h5SW5mb3MiLCJpZHgiLCJoaWVyYXJjaHlQb3NpdGlvbiIsIm9MaW5rIiwidGl0bGVIaWVyYXJjaHlJbmZvIiwiZ2V0TGlua3MiLCJMaW5rIiwic2V0VGV4dCIsInNldEhyZWYiLCJlbmNvZGVVUkkiLCJhZGRMaW5rIiwib0RhdGFQb2ludHMiLCJnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9TaGVsbFNlcnZpY2VzIiwicmVxdWVzdE9iamVjdCIsImZuR2V0TGlua3MiLCJmbk9uRXJyb3IiLCJmblNldExpbmtFbmFibGVtZW50IiwiaWQiLCJhU3VwcG9ydGVkTGlua3MiLCJzTGlua0lkIiwic3VwcG9ydGVkIiwib1N1YkRhdGFQb2ludHMiLCJvUGFnZURhdGEiLCJvRGF0YVBvaW50Iiwib0xpbmtDb250ZXh0Iiwib0xpbmtEYXRhIiwib01peGVkQ29udGV4dCIsIm1lcmdlIiwib01hcHBpbmciLCJzTWFpblByb3BlcnR5Iiwic01hcHBlZFByb3BlcnR5IiwiaGFzT3duUHJvcGVydHkiLCJvTmV3TWFwcGluZyIsImlzTmF2aWdhdGlvblN1cHBvcnRlZCIsInBhcmFtcyIsImFMaW5rcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiT2JqZWN0UGFnZUNvbnRyb2xsZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBjb25uZWN0LCBkaXNjb25uZWN0LCBpc0Nvbm5lY3RlZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgb3Blbk1hbmFnZURpYWxvZywgc2hvd1VzZXJEZXRhaWxzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vTWFuYWdlXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IE1hc3NFZGl0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NYXNzRWRpdFwiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IFBhZ2VSZWFkeSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnZVJlYWR5XCI7XG5pbXBvcnQgUGFnaW5hdG9yIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QYWdpbmF0b3JcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24sIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUhlbHBlclwiO1xuaW1wb3J0IFRhYmxlVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVXRpbHNcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBTdWJTZWN0aW9uQmxvY2sgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9jb250cm9scy9TdWJTZWN0aW9uQmxvY2tcIjtcbmltcG9ydCB0eXBlIHsgZGVmYXVsdCBhcyBPYmplY3RQYWdlRXh0ZW5zaW9uQVBJIH0gZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB7IGRlZmF1bHQgYXMgRXh0ZW5zaW9uQVBJIH0gZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCBUYWJsZVNjcm9sbGVyIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL1RhYmxlU2Nyb2xsZXJcIjtcbmltcG9ydCBJbnN0YW5jZU1hbmFnZXIgZnJvbSBcInNhcC9tL0luc3RhbmNlTWFuYWdlclwiO1xuaW1wb3J0IExpbmsgZnJvbSBcInNhcC9tL0xpbmtcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBQb3BvdmVyIGZyb20gXCJzYXAvbS9Qb3BvdmVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFDb250ZXh0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhQ29udGV4dEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIEJyZWFkQ3J1bWJzIGZyb20gXCJzYXAvdXhhcC9CcmVhZENydW1ic1wiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZSBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZVwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUxheW91dCBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUxheW91dFwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZVNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTZWN0aW9uXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlU3ViU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVN1YlNlY3Rpb25cIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUGFnaW5hdG9yT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL1BhZ2luYXRvclwiO1xuaW1wb3J0IFNoYXJlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9TaGFyZVwiO1xuaW1wb3J0IFZpZXdTdGF0ZU92ZXJyaWRlcyBmcm9tIFwiLi9vdmVycmlkZXMvVmlld1N0YXRlXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlQ29udHJvbGxlclwiKVxuY2xhc3MgT2JqZWN0UGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBQYWdlQ29udHJvbGxlciB7XG5cdG9WaWV3ITogYW55O1xuXG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oU2hhcmUub3ZlcnJpZGUoU2hhcmVPdmVycmlkZXMpKVxuXHRzaGFyZSE6IFNoYXJlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbFJvdXRpbmcub3ZlcnJpZGUoSW50ZXJuYWxSb3V0aW5nT3ZlcnJpZGUpKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblxuXHRAdXNpbmdFeHRlbnNpb24oUGFnaW5hdG9yLm92ZXJyaWRlKFBhZ2luYXRvck92ZXJyaWRlKSlcblx0cGFnaW5hdG9yITogUGFnaW5hdG9yO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihNZXNzYWdlSGFuZGxlci5vdmVycmlkZShNZXNzYWdlSGFuZGxlck92ZXJyaWRlKSlcblx0bWVzc2FnZUhhbmRsZXIhOiBNZXNzYWdlSGFuZGxlcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oSW50ZW50QmFzZWROYXZpZ2F0aW9uLm92ZXJyaWRlKEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlKSlcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZSh7XG5cdFx0XHRnZXROYXZpZ2F0aW9uTW9kZTogZnVuY3Rpb24gKHRoaXM6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGJJc1N0aWNreUVkaXRNb2RlID1cblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyKS5nZXRTdGlja3lFZGl0TW9kZSAmJlxuXHRcdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgT2JqZWN0UGFnZUNvbnRyb2xsZXIpLmdldFN0aWNreUVkaXRNb2RlKCk7XG5cdFx0XHRcdHJldHVybiBiSXNTdGlja3lFZGl0TW9kZSA/IFwiZXhwbGFjZVwiIDogdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihWaWV3U3RhdGUub3ZlcnJpZGUoVmlld1N0YXRlT3ZlcnJpZGVzKSlcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRQYWdlUmVhZHkub3ZlcnJpZGUoe1xuXHRcdFx0aXNDb250ZXh0RXhwZWN0ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHRwYWdlUmVhZHkhOiBQYWdlUmVhZHk7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXG5cdHByaXZhdGUgbUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzPzogUmVjb3JkPHN0cmluZywgT2JqZWN0UGFnZUV4dGVuc2lvbkFQST47XG5cblx0cHJvdGVjdGVkIGV4dGVuc2lvbkFQST86IE9iamVjdFBhZ2VFeHRlbnNpb25BUEk7XG5cblx0cHJpdmF0ZSBiU2VjdGlvbk5hdmlnYXRlZD86IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBzd2l0Y2hEcmFmdEFuZEFjdGl2ZVBvcE92ZXI/OiBQb3BvdmVyO1xuXG5cdHByaXZhdGUgY3VycmVudEJpbmRpbmc/OiBCaW5kaW5nO1xuXG5cdHByaXZhdGUgbWVzc2FnZUJ1dHRvbjogYW55O1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRFeHRlbnNpb25BUEkoc0lkPzogc3RyaW5nKTogRXh0ZW5zaW9uQVBJIHtcblx0XHRpZiAoc0lkKSB7XG5cdFx0XHQvLyB0byBhbGxvdyBsb2NhbCBJRCB1c2FnZSBmb3IgY3VzdG9tIHBhZ2VzIHdlJ2xsIGNyZWF0ZS9yZXR1cm4gb3duIGluc3RhbmNlcyBmb3IgY3VzdG9tIHNlY3Rpb25zXG5cdFx0XHR0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyA9IHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzIHx8IHt9O1xuXG5cdFx0XHRpZiAoIXRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzW3NJZF0pIHtcblx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcywgc0lkKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIXRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJID0gbmV3IEV4dGVuc2lvbkFQSSh0aGlzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmV4dGVuc2lvbkFQSTtcblx0XHR9XG5cdH1cblxuXHRvbkluaXQoKSB7XG5cdFx0c3VwZXIub25Jbml0KCk7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXG5cdFx0Ly8gU2V0dGluZyBkZWZhdWx0cyBvZiBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiZXh0ZXJuYWxOYXZpZ2F0aW9uQ29udGV4dFwiLCB7IHBhZ2U6IHRydWUgfSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzXCIsIHtcblx0XHRcdHZpc2liaWxpdHk6IGZhbHNlLFxuXHRcdFx0aXRlbXM6IG51bGxcblx0XHR9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiYmF0Y2hHcm91cHNcIiwgdGhpcy5fZ2V0QmF0Y2hHcm91cHNGb3JWaWV3KCkpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCBmYWxzZSk7XG5cdFx0aWYgKG9PYmplY3RQYWdlLmdldEVuYWJsZUxhenlMb2FkaW5nKCkpIHtcblx0XHRcdC8vQXR0YWNoaW5nIHRoZSBldmVudCB0byBtYWtlIHRoZSBzdWJzZWN0aW9uIGNvbnRleHQgYmluZGluZyBhY3RpdmUgd2hlbiBpdCBpcyB2aXNpYmxlLlxuXHRcdFx0b09iamVjdFBhZ2UuYXR0YWNoRXZlbnQoXCJzdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0XCIsIHRoaXMuX2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbiA9IHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6Rm9vdGVyQmFyOjpNZXNzYWdlQnV0dG9uXCIpO1xuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbi5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX2ZuU2hvd09QTWVzc2FnZSwgdGhpcyk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJvb3RFZGl0RW5hYmxlZFwiLCB0cnVlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwicm9vdEVkaXRWaXNpYmxlXCIsIHRydWUpO1xuXHR9XG5cblx0b25FeGl0KCkge1xuXHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcykge1xuXHRcdFx0Zm9yIChjb25zdCBzSWQgb2YgT2JqZWN0LmtleXModGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMpKSB7XG5cdFx0XHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdKSB7XG5cdFx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXS5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRlbGV0ZSB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcztcblx0XHR9XG5cdFx0aWYgKHRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSB0aGlzLmV4dGVuc2lvbkFQSTtcblxuXHRcdGNvbnN0IG9NZXNzYWdlUG9wb3ZlciA9IHRoaXMubWVzc2FnZUJ1dHRvbiA/IHRoaXMubWVzc2FnZUJ1dHRvbi5vTWVzc2FnZVBvcG92ZXIgOiBudWxsO1xuXHRcdGlmIChvTWVzc2FnZVBvcG92ZXIgJiYgb01lc3NhZ2VQb3BvdmVyLmlzT3BlbigpKSB7XG5cdFx0XHRvTWVzc2FnZVBvcG92ZXIuY2xvc2UoKTtcblx0XHR9XG5cdFx0Ly93aGVuIGV4aXRpbmcgd2Ugc2V0IGtlZXBBbGl2ZSBjb250ZXh0IHRvIGZhbHNlXG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0aWYgKG9Db250ZXh0ICYmIG9Db250ZXh0LmlzS2VlcEFsaXZlKCkpIHtcblx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShmYWxzZSk7XG5cdFx0fVxuXHRcdGlmIChpc0Nvbm5lY3RlZCh0aGlzLmdldFZpZXcoKSkpIHtcblx0XHRcdGRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpOyAvLyBDbGVhbnVwIGNvbGxhYm9yYXRpb24gY29ubmVjdGlvbiB3aGVuIGxlYXZpbmcgdGhlIGFwcFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2hvdyB0aGUgbWVzc2FnZSBzdHJpcCBvbiB0aGUgb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5TaG93T1BNZXNzYWdlKCkge1xuXHRcdGNvbnN0IGV4dGVuc2lvbkFQSSA9IHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCk7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3ZlclxuXHRcdFx0LmdldEl0ZW1zKClcblx0XHRcdC5tYXAoKGl0ZW06IGFueSkgPT4gaXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkpXG5cdFx0XHQuZmlsdGVyKChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldHMoKVswXSA9PT0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0XHR9KTtcblxuXHRcdGlmIChleHRlbnNpb25BUEkpIHtcblx0XHRcdGV4dGVuc2lvbkFQSS5zaG93TWVzc2FnZXMobWVzc2FnZXMpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRUYWJsZUJpbmRpbmcob1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb1RhYmxlICYmIG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZCB0aGUgbGFzdCB2aXNpYmxlIHN1YnNlY3Rpb24gYW5kIGFkZCB0aGUgc2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uRml0Q29udGFpbmVyIENTUyBjbGFzcyBpZiBpdCBjb250YWlucyBvbmx5IGEgZ3JpZFRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3ViU2VjdGlvbnMgVGhlIHN1YiBzZWN0aW9ucyB0byBsb29rIGZvclxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBjaGVja1NlY3Rpb25zRm9yR3JpZFRhYmxlKHN1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdKSB7XG5cdFx0Y29uc3QgY2hhbmdlQ2xhc3NGb3JUYWJsZXMgPSAoZXZlbnQ6IEV2ZW50LCBsYXN0VmlzaWJsZVN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCBibG9ja3MgPSBbLi4ubGFzdFZpc2libGVTdWJTZWN0aW9uLmdldEJsb2NrcygpLCAuLi5sYXN0VmlzaWJsZVN1YlNlY3Rpb24uZ2V0TW9yZUJsb2NrcygpXTtcblx0XHRcdGlmIChcblx0XHRcdFx0YmxvY2tzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0XHR0aGlzLnNlYXJjaFRhYmxlSW5CbG9jayhibG9ja3NbMF0gYXMgU3ViU2VjdGlvbkJsb2NrKVxuXHRcdFx0XHRcdD8uZ2V0VHlwZSgpXG5cdFx0XHRcdFx0Py5pc0EoXCJzYXAudWkubWRjLnRhYmxlLkdyaWRUYWJsZVR5cGVcIilcblx0XHRcdCkge1xuXHRcdFx0XHQvL0luIGNhc2UgdGhlcmUgaXMgb25seSBhIHNpbmdsZSB0YWJsZSBpbiBhIHN1YlNlY3Rpb24gd2UgZml0IHRoYXQgdG8gdGhlIHdob2xlIHBhZ2Ugc28gdGhhdCB0aGUgc2Nyb2xsYmFyIGNvbWVzIG9ubHkgb24gdGFibGUgYW5kIG5vdCBvbiBwYWdlXG5cdFx0XHRcdGxhc3RWaXNpYmxlU3ViU2VjdGlvbi5hZGRTdHlsZUNsYXNzKFwic2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uRml0Q29udGFpbmVyXCIpO1xuXHRcdFx0XHRsYXN0VmlzaWJsZVN1YlNlY3Rpb24uZGV0YWNoRXZlbnQoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgY2hhbmdlQ2xhc3NGb3JUYWJsZXMsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbkluZGV4ID0gc3ViU2VjdGlvbnMubGVuZ3RoIC0gMTsgc3ViU2VjdGlvbkluZGV4ID49IDA7IHN1YlNlY3Rpb25JbmRleC0tKSB7XG5cdFx0XHRpZiAoc3ViU2VjdGlvbnNbc3ViU2VjdGlvbkluZGV4XS5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0Y29uc3QgbGFzdFZpc2libGVTdWJTZWN0aW9uID0gc3ViU2VjdGlvbnNbc3ViU2VjdGlvbkluZGV4XTtcblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBhdHRhY2ggdGhpcyBldmVudCBpbiBvcmRlciB0byBtYW5hZ2UgdGhlIE9iamVjdCBQYWdlIExhenkgTG9hZGluZyBtZWNoYW5pc21cblx0XHRcdFx0bGFzdFZpc2libGVTdWJTZWN0aW9uLmF0dGFjaEV2ZW50KFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsIGxhc3RWaXNpYmxlU3ViU2VjdGlvbiwgY2hhbmdlQ2xhc3NGb3JUYWJsZXMsIHRoaXMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmluZCBhIHRhYmxlIGluIGJsb2NrcyBvZiBzZWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmxvY2sgT25lIHN1YiBzZWN0aW9uIGJsb2NrXG5cdCAqIEByZXR1cm5zIFRhYmxlIGlmIGV4aXN0c1xuXHQgKi9cblx0cHJpdmF0ZSBzZWFyY2hUYWJsZUluQmxvY2soYmxvY2s6IFN1YlNlY3Rpb25CbG9jaykge1xuXHRcdGNvbnN0IGNvbnRyb2wgPSBibG9jay5jb250ZW50O1xuXHRcdGxldCB0YWJsZUFQSTogVGFibGVBUEkgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKGJsb2NrLmlzQShcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdWJTZWN0aW9uQmxvY2tcIikpIHtcblx0XHRcdC8vIFRoZSB0YWJsZSBtYXkgY3VycmVudGx5IGJlIHNob3duIGluIGEgZnVsbCBzY3JlZW4gZGlhbG9nLCB3ZSBjYW4gdGhlbiBnZXQgdGhlIHJlZmVyZW5jZSB0byB0aGUgVGFibGVBUElcblx0XHRcdC8vIGNvbnRyb2wgZnJvbSB0aGUgY3VzdG9tIGRhdGEgb2YgdGhlIHBsYWNlIGhvbGRlciBwYW5lbFxuXHRcdFx0aWYgKGNvbnRyb2wuaXNBKFwic2FwLm0uUGFuZWxcIikgJiYgY29udHJvbC5kYXRhKFwiRnVsbFNjcmVlblRhYmxlUGxhY2VIb2xkZXJcIikpIHtcblx0XHRcdFx0dGFibGVBUEkgPSBjb250cm9sLmRhdGEoXCJ0YWJsZUFQSXJlZmVyZW5jZVwiKTtcblx0XHRcdH0gZWxzZSBpZiAoY29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRcdHRhYmxlQVBJID0gY29udHJvbCBhcyBUYWJsZUFQSTtcblx0XHRcdH1cblx0XHRcdGlmICh0YWJsZUFQSSkge1xuXHRcdFx0XHRyZXR1cm4gdGFibGVBUEkuY29udGVudCBhcyBUYWJsZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25CZWZvcmVSZW5kZXJpbmcuYXBwbHkodGhpcyk7XG5cdFx0Ly8gSW4gdGhlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgc2NlbmFyaW8gd2UgbmVlZCB0byBlbnN1cmUgaW4gY2FzZSBvZiByZWxvYWQvcmVmcmVzaCB0aGF0IHRoZSBtZXRhIG1vZGVsIGluIHRoZSBtZXRob2RlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgb2YgdGhlIEZpZWxkUnVudGltZSBpcyBhdmFpbGFibGVcblx0XHRpZiAodGhpcy5vVmlldy5vVmlld0RhdGE/LnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgJiYgQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdENvbW1vbkhlbHBlci5zZXRNZXRhTW9kZWwodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRsZXQgc3ViU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW107XG5cdFx0aWYgKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0VXNlSWNvblRhYkJhcigpKSB7XG5cdFx0XHRjb25zdCBzZWN0aW9ucyA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0U2VjdGlvbnMoKTtcblx0XHRcdGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xuXHRcdFx0XHRzdWJTZWN0aW9ucyA9IHNlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdFx0dGhpcy5jaGVja1NlY3Rpb25zRm9yR3JpZFRhYmxlKHN1YlNlY3Rpb25zKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdFx0dGhpcy5jaGVja1NlY3Rpb25zRm9yR3JpZFRhYmxlKHN1YlNlY3Rpb25zKTtcblx0XHR9XG5cdH1cblxuXHRfb25CZWZvcmVCaW5kaW5nKG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHQvLyBUT0RPOiB3ZSBzaG91bGQgY2hlY2sgaG93IHRoaXMgY29tZXMgdG9nZXRoZXIgd2l0aCB0aGUgdHJhbnNhY3Rpb24gaGVscGVyLCBzYW1lIHRvIHRoZSBjaGFuZ2UgaW4gdGhlIGFmdGVyQmluZGluZ1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCksXG5cdFx0XHRvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCksXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0b0ludGVybmFsTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbCxcblx0XHRcdGFCYXRjaEdyb3VwcyA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImJhdGNoR3JvdXBzXCIpLFxuXHRcdFx0aVZpZXdMZXZlbCA9ICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkudmlld0xldmVsO1xuXHRcdGxldCBvRmFzdENyZWF0aW9uUm93O1xuXHRcdGFCYXRjaEdyb3Vwcy5wdXNoKFwiJGF1dG9cIik7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmJEcmFmdE5hdmlnYXRpb24gIT09IHRydWUpIHtcblx0XHRcdHRoaXMuX2Nsb3NlU2lkZUNvbnRlbnQoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb3BDb250ZXh0ID0gb09iamVjdFBhZ2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGlmIChcblx0XHRcdG9wQ29udGV4dCAmJlxuXHRcdFx0b3BDb250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkgJiZcblx0XHRcdCFhQmF0Y2hHcm91cHMuc29tZShvcENvbnRleHQuZ2V0TW9kZWwoKS5oYXNQZW5kaW5nQ2hhbmdlcy5iaW5kKG9wQ29udGV4dC5nZXRNb2RlbCgpKSlcblx0XHQpIHtcblx0XHRcdC8qIFx0SW4gY2FzZSB0aGVyZSBhcmUgcGVuZGluZyBjaGFuZ2VzIGZvciB0aGUgY3JlYXRpb24gcm93IGFuZCBubyBvdGhlcnMgd2UgbmVlZCB0byByZXNldCB0aGUgY2hhbmdlc1xuXHRcdFx0XHRcdFx0XHRcdFRPRE86IHRoaXMgaXMganVzdCBhIHF1aWNrIHNvbHV0aW9uLCB0aGlzIG5lZWRzIHRvIGJlIHJld29ya2VkXG5cdFx0XHRcdFx0XHRcdFx0Ki9cblxuXHRcdFx0b3BDb250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHR9XG5cblx0XHQvLyBGb3Igbm93IHdlIGhhdmUgdG8gc2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gbnVsbCBmb3IgZXZlcnkgZmFzdCBjcmVhdGlvbiByb3dcblx0XHQvLyBUT0RPOiBHZXQgcmlkIG9mIHRoaXMgY29kaW5nIG9yIG1vdmUgaXQgdG8gYW5vdGhlciBsYXllciAtIHRvIGJlIGRpc2N1c3NlZCB3aXRoIE1EQyBhbmQgbW9kZWxcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFUYWJsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cgPSBhVGFibGVzW2ldLmdldENyZWF0aW9uUm93KCk7XG5cdFx0XHRpZiAob0Zhc3RDcmVhdGlvblJvdykge1xuXHRcdFx0XHRvRmFzdENyZWF0aW9uUm93LnNldEJpbmRpbmdDb250ZXh0KG51bGwpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFNjcm9sbCB0byBwcmVzZW50IFNlY3Rpb24gc28gdGhhdCBiaW5kaW5ncyBhcmUgZW5hYmxlZCBkdXJpbmcgbmF2aWdhdGlvbiB0aHJvdWdoIHBhZ2luYXRvciBidXR0b25zLCBhcyB0aGVyZSBpcyBubyB2aWV3IHJlcmVuZGVyaW5nL3JlYmluZFxuXHRcdGNvbnN0IGZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghKG9PYmplY3RQYWdlIGFzIGFueSkuaXNGaXJzdFJlbmRlcmluZygpICYmICFtUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsKSB7XG5cdFx0XHRcdG9PYmplY3RQYWdlLnNldFNlbGVjdGVkU2VjdGlvbihudWxsIGFzIGFueSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRvT2JqZWN0UGFnZS5hdHRhY2hFdmVudE9uY2UoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uKTtcblxuXHRcdC8vIGlmIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIE9iamVjdFBhZ2VMYXlvdXQgaXMgY2hhbmdlZCB0aGVuIHNjcm9sbCB0byBwcmVzZW50IFNlY3Rpb25cblx0XHQvLyBGSVhNRSBJcyB0aGlzIHJlYWxseSB3b3JraW5nIGFzIGludGVuZGVkID8gSW5pdGlhbGx5IHRoaXMgd2FzIG9uQmVmb3JlUmVuZGVyaW5nLCBidXQgbmV2ZXIgdHJpZ2dlcmVkIG9uQmVmb3JlUmVuZGVyaW5nIGJlY2F1c2UgaXQgd2FzIHJlZ2lzdGVyZWQgYWZ0ZXIgaXRcblx0XHRjb25zdCBvRGVsZWdhdGVPbkJlZm9yZSA9IHtcblx0XHRcdG9uQWZ0ZXJSZW5kZXJpbmc6IGZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvblxuXHRcdH07XG5cdFx0b09iamVjdFBhZ2UuYWRkRXZlbnREZWxlZ2F0ZShvRGVsZWdhdGVPbkJlZm9yZSwgdGhpcyk7XG5cdFx0dGhpcy5wYWdlUmVhZHkuYXR0YWNoRXZlbnRPbmNlKFwicGFnZVJlYWR5XCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdG9PYmplY3RQYWdlLnJlbW92ZUV2ZW50RGVsZWdhdGUob0RlbGVnYXRlT25CZWZvcmUpO1xuXHRcdH0pO1xuXG5cdFx0Ly9TZXQgdGhlIEJpbmRpbmcgZm9yIFBhZ2luYXRvcnMgdXNpbmcgTGlzdEJpbmRpbmcgSURcblx0XHRpZiAoaVZpZXdMZXZlbCA+IDEpIHtcblx0XHRcdGxldCBvQmluZGluZyA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmxpc3RCaW5kaW5nO1xuXHRcdFx0Y29uc3Qgb1BhZ2luYXRvckN1cnJlbnRDb250ZXh0ID0gb0ludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIik7XG5cdFx0XHRpZiAob1BhZ2luYXRvckN1cnJlbnRDb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nVG9Vc2UgPSBvUGFnaW5hdG9yQ3VycmVudENvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nVG9Vc2UsIG9QYWdpbmF0b3JDdXJyZW50Q29udGV4dCk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG51bGwpO1xuXHRcdFx0fSBlbHNlIGlmIChvQmluZGluZykge1xuXHRcdFx0XHRpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nLCBvQ29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhlIGJpbmRpbmcgdHlwZSBpcyBub3QgT0RhdGFMaXN0QmluZGluZyBiZWNhdXNlIG9mIGEgZGVlcGxpbmsgbmF2aWdhdGlvbiBvciBhIHJlZnJlc2ggb2YgdGhlIHBhZ2Vcblx0XHRcdFx0XHQvLyB3ZSBuZWVkIHRvIGNyZWF0ZSBpdFxuXHRcdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9CaW5kaW5nLmdldFBhdGgoKTtcblx0XHRcdFx0XHRpZiAoL1xcKFteKV0qXFwpJC8udGVzdChzQmluZGluZ1BhdGgpKSB7XG5cdFx0XHRcdFx0XHQvLyBUaGUgY3VycmVudCBiaW5kaW5nIHBhdGggZW5kcyB3aXRoICh4eHgpLCBzbyB3ZSBjcmVhdGUgdGhlIGxpc3RCaW5kaW5nIGJ5IHJlbW92aW5nICh4eHgpXG5cdFx0XHRcdFx0XHRjb25zdCBzTGlzdEJpbmRpbmdQYXRoID0gc0JpbmRpbmdQYXRoLnJlcGxhY2UoL1xcKFteKV0qXFwpJC8sIFwiXCIpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcgPSBuZXcgKE9EYXRhTGlzdEJpbmRpbmcgYXMgYW55KShvQmluZGluZy5vTW9kZWwsIHNMaXN0QmluZGluZ1BhdGgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgX3NldExpc3RCaW5kaW5nQXN5bmMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvQmluZGluZy5nZXRDb250ZXh0cygpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nLCBvQ29udGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoRXZlbnQoXCJjaGFuZ2VcIiwgX3NldExpc3RCaW5kaW5nQXN5bmMpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRvQmluZGluZy5nZXRDb250ZXh0cygwKTtcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmF0dGFjaEV2ZW50KFwiY2hhbmdlXCIsIF9zZXRMaXN0QmluZGluZ0FzeW5jKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gVGhlIGN1cnJlbnQgYmluZGluZyBkb2Vzbid0IGVuZCB3aXRoICh4eHgpIC0tPiB0aGUgbGFzdCBzZWdtZW50IGlzIGEgMS0xIG5hdmlnYXRpb24sIHNvIHdlIGRvbid0IGRpc3BsYXkgdGhlIHBhZ2luYXRvclxuXHRcdFx0XHRcdFx0dGhpcy5wYWdpbmF0b3IuaW5pdGlhbGl6ZSh1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChvT2JqZWN0UGFnZS5nZXRFbmFibGVMYXp5TG9hZGluZygpKSB7XG5cdFx0XHRjb25zdCBhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpO1xuXHRcdFx0Y29uc3QgYlVzZUljb25UYWJCYXIgPSBvT2JqZWN0UGFnZS5nZXRVc2VJY29uVGFiQmFyKCk7XG5cdFx0XHRsZXQgaVNraXAgPSAyO1xuXHRcdFx0Y29uc3QgYklzSW5FZGl0TW9kZSA9IG9PYmplY3RQYWdlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0XHRcdGNvbnN0IGJFZGl0YWJsZUhlYWRlciA9ICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZWRpdGFibGVIZWFkZXJDb250ZW50O1xuXHRcdFx0Zm9yIChsZXQgaVNlY3Rpb24gPSAwOyBpU2VjdGlvbiA8IGFTZWN0aW9ucy5sZW5ndGg7IGlTZWN0aW9uKyspIHtcblx0XHRcdFx0Y29uc3Qgb1NlY3Rpb24gPSBhU2VjdGlvbnNbaVNlY3Rpb25dO1xuXHRcdFx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0XHRmb3IgKGxldCBpU3ViU2VjdGlvbiA9IDA7IGlTdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgaVN1YlNlY3Rpb24rKywgaVNraXAtLSkge1xuXHRcdFx0XHRcdC8vIEluIEljb25UYWJCYXIgbW9kZSBrZWVwIHRoZSBzZWNvbmQgc2VjdGlvbiBib3VuZCBpZiB0aGVyZSBpcyBhbiBlZGl0YWJsZSBoZWFkZXIgYW5kIHdlIGFyZSBzd2l0Y2hpbmcgdG8gZGlzcGxheSBtb2RlXG5cdFx0XHRcdFx0aWYgKGlTa2lwIDwgMSB8fCAoYlVzZUljb25UYWJCYXIgJiYgKGlTZWN0aW9uID4gMSB8fCAoaVNlY3Rpb24gPT09IDEgJiYgIWJFZGl0YWJsZUhlYWRlciAmJiAhYklzSW5FZGl0TW9kZSkpKSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBhU3ViU2VjdGlvbnNbaVN1YlNlY3Rpb25dO1xuXHRcdFx0XHRcdFx0aWYgKG9TdWJTZWN0aW9uLmRhdGEoKS5pc1Zpc2liaWxpdHlEeW5hbWljICE9PSBcInRydWVcIikge1xuXHRcdFx0XHRcdFx0XHRvU3ViU2VjdGlvbi5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXIuaXNQbGFjZWhvbGRlckVuYWJsZWQoKSAmJiBtUGFyYW1ldGVycy5zaG93UGxhY2Vob2xkZXIpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRjb25zdCBvTmF2Q29udGFpbmVyID0gKG9WaWV3LmdldFBhcmVudCgpIGFzIGFueSkub0NvbnRhaW5lci5nZXRQYXJlbnQoKTtcblx0XHRcdGlmIChvTmF2Q29udGFpbmVyKSB7XG5cdFx0XHRcdG9OYXZDb250YWluZXIuc2hvd1BsYWNlaG9sZGVyKHt9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZ2V0Rmlyc3RDbGlja2FibGVFbGVtZW50KG9PYmplY3RQYWdlOiBhbnkpIHtcblx0XHRsZXQgb0ZpcnN0Q2xpY2thYmxlRWxlbWVudDtcblx0XHRjb25zdCBhQWN0aW9ucyA9IG9PYmplY3RQYWdlLmdldEhlYWRlclRpdGxlKCkgJiYgb09iamVjdFBhZ2UuZ2V0SGVhZGVyVGl0bGUoKS5nZXRBY3Rpb25zKCk7XG5cdFx0aWYgKGFBY3Rpb25zICYmIGFBY3Rpb25zLmxlbmd0aCkge1xuXHRcdFx0b0ZpcnN0Q2xpY2thYmxlRWxlbWVudCA9IGFBY3Rpb25zLmZpbmQoZnVuY3Rpb24gKG9BY3Rpb246IGFueSkge1xuXHRcdFx0XHQvLyBEdWUgdG8gdGhlIGxlZnQgYWxpZ25tZW50IG9mIHRoZSBEcmFmdCBzd2l0Y2ggYW5kIHRoZSBjb2xsYWJvcmF0aXZlIGRyYWZ0IGF2YXRhciBjb250cm9sc1xuXHRcdFx0XHQvLyB0aGVyZSBpcyBhIFRvb2xiYXJTcGFjZXIgaW4gdGhlIGFjdGlvbnMgYWdncmVnYXRpb24gd2hpY2ggd2UgbmVlZCB0byBleGNsdWRlIGhlcmUhXG5cdFx0XHRcdC8vIER1ZSB0byB0aGUgQUNDIHJlcG9ydCwgd2UgYWxzbyBuZWVkIG5vdCB0byBjaGVjayBmb3IgdGhlIEludmlzaWJsZVRleHQgZWxlbWVudHNcblx0XHRcdFx0aWYgKG9BY3Rpb24uaXNBKFwic2FwLmZlLm1hY3Jvcy5zaGFyZS5TaGFyZUFQSVwiKSkge1xuXHRcdFx0XHRcdC8vIHNpbmNlIFNoYXJlQVBJIGRvZXMgbm90IGhhdmUgYSBkaXNhYmxlIHByb3BlcnR5XG5cdFx0XHRcdFx0Ly8gaGVuY2UgdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBpZiBpdCBpcyBkaXNiYWxlZCBvciBub3Rcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRWaXNpYmxlKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9BY3Rpb24uaXNBKFwic2FwLnVpLmNvcmUuSW52aXNpYmxlVGV4dFwiKSAmJiAhb0FjdGlvbi5pc0EoXCJzYXAubS5Ub29sYmFyU3BhY2VyXCIpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZ2V0VmlzaWJsZSgpICYmIG9BY3Rpb24uZ2V0RW5hYmxlZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG9GaXJzdENsaWNrYWJsZUVsZW1lbnQ7XG5cdH1cblxuXHRfZ2V0Rmlyc3RFbXB0eU1hbmRhdG9yeUZpZWxkRnJvbVN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zOiBhbnkpIHtcblx0XHRpZiAoYVN1YlNlY3Rpb25zKSB7XG5cdFx0XHRmb3IgKGxldCBzdWJTZWN0aW9uID0gMDsgc3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IHN1YlNlY3Rpb24rKykge1xuXHRcdFx0XHRjb25zdCBhQmxvY2tzID0gYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLmdldEJsb2NrcygpO1xuXG5cdFx0XHRcdGlmIChhQmxvY2tzKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgYmxvY2sgPSAwOyBibG9jayA8IGFCbG9ja3MubGVuZ3RoOyBibG9jaysrKSB7XG5cdFx0XHRcdFx0XHRsZXQgYUZvcm1Db250YWluZXJzO1xuXG5cdFx0XHRcdFx0XHRpZiAoYUJsb2Nrc1tibG9ja10uaXNBKFwic2FwLnVpLmxheW91dC5mb3JtLkZvcm1cIikpIHtcblx0XHRcdFx0XHRcdFx0YUZvcm1Db250YWluZXJzID0gYUJsb2Nrc1tibG9ja10uZ2V0Rm9ybUNvbnRhaW5lcnMoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdGFCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQgJiZcblx0XHRcdFx0XHRcdFx0YUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpICYmXG5cdFx0XHRcdFx0XHRcdGFCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQoKS5pc0EoXCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybVwiKVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdGFGb3JtQ29udGFpbmVycyA9IGFCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQoKS5nZXRGb3JtQ29udGFpbmVycygpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoYUZvcm1Db250YWluZXJzKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGZvcm1Db250YWluZXIgPSAwOyBmb3JtQ29udGFpbmVyIDwgYUZvcm1Db250YWluZXJzLmxlbmd0aDsgZm9ybUNvbnRhaW5lcisrKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgYUZvcm1FbGVtZW50cyA9IGFGb3JtQ29udGFpbmVyc1tmb3JtQ29udGFpbmVyXS5nZXRGb3JtRWxlbWVudHMoKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYUZvcm1FbGVtZW50cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgZm9ybUVsZW1lbnQgPSAwOyBmb3JtRWxlbWVudCA8IGFGb3JtRWxlbWVudHMubGVuZ3RoOyBmb3JtRWxlbWVudCsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFGaWVsZHMgPSBhRm9ybUVsZW1lbnRzW2Zvcm1FbGVtZW50XS5nZXRGaWVsZHMoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGUgZmlyc3QgZmllbGQgaXMgbm90IG5lY2Vzc2FyaWx5IGFuIElucHV0QmFzZSAoZS5nLiBjb3VsZCBiZSBhIFRleHQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFNvIHdlIG5lZWQgdG8gY2hlY2sgd2hldGhlciBpdCBoYXMgYSBnZXRSZXF1aXJlZCBtZXRob2Rcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUZpZWxkc1swXS5nZXRSZXF1aXJlZCAmJiBhRmllbGRzWzBdLmdldFJlcXVpcmVkKCkgJiYgIWFGaWVsZHNbMF0uZ2V0VmFsdWUoKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFGaWVsZHNbMF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5kZWJ1ZyhgRXJyb3Igd2hlbiBzZWFyY2hpbmcgZm9yIG1hbmRhb3RyeSBlbXB0eSBmaWVsZDogJHtlcnJvcn1gKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0X3VwZGF0ZUZvY3VzSW5FZGl0TW9kZShhU3ViU2VjdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblxuXHRcdGNvbnN0IG9NYW5kYXRvcnlGaWVsZCA9IHRoaXMuX2dldEZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZEZyb21TdWJTZWN0aW9uKGFTdWJTZWN0aW9ucyk7XG5cdFx0bGV0IG9GaWVsZFRvRm9jdXM6IGFueTtcblx0XHRpZiAob01hbmRhdG9yeUZpZWxkKSB7XG5cdFx0XHRvRmllbGRUb0ZvY3VzID0gb01hbmRhdG9yeUZpZWxkLmNvbnRlbnQuZ2V0Q29udGVudEVkaXQoKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0ZpZWxkVG9Gb2N1cyA9IChvT2JqZWN0UGFnZSBhcyBhbnkpLl9nZXRGaXJzdEVkaXRhYmxlSW5wdXQoKSB8fCB0aGlzLl9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQob09iamVjdFBhZ2UpO1xuXHRcdH1cblxuXHRcdGlmIChvRmllbGRUb0ZvY3VzKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gV2Ugc2V0IHRoZSBmb2N1cyBpbiBhIHRpbWVlb3V0LCBvdGhlcndpc2UgdGhlIGZvY3VzIHNvbWV0aW1lcyBnb2VzIHRvIHRoZSBUYWJCYXJcblx0XHRcdFx0b0ZpZWxkVG9Gb2N1cy5mb2N1cygpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHR9XG5cblx0X2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBvU3ViU2VjdGlvbiA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWJTZWN0aW9uXCIpO1xuXHRcdG9TdWJTZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KHVuZGVmaW5lZCk7XG5cdH1cblxuXHRfb25CYWNrTmF2aWdhdGlvbkluRHJhZnQob0NvbnRleHQ6IGFueSkge1xuXHRcdHRoaXMubWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0aWYgKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyUHJveHkoKS5jaGVja0lmQmFja0hhc1NhbWVDb250ZXh0KCkpIHtcblx0XHRcdC8vIEJhY2sgbmF2IHdpbGwga2VlcCB0aGUgc2FtZSBjb250ZXh0IC0tPiBubyBuZWVkIHRvIGRpc3BsYXkgdGhlIGRpYWxvZ1xuXHRcdFx0aGlzdG9yeS5iYWNrKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRyYWZ0LnByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uKFxuXHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aGlzdG9yeS5iYWNrKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRkcmFmdC5OYXZpZ2F0aW9uVHlwZS5CYWNrTmF2aWdhdGlvblxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdF9vbkFmdGVyQmluZGluZyhvQmluZGluZ0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRjb25zdCBhVGFibGVzID0gdGhpcy5fZmluZFRhYmxlcygpO1xuXG5cdFx0dGhpcy5fc2lkZUVmZmVjdHMuY2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5KCk7XG5cblx0XHQvLyBUT0RPOiB0aGlzIGlzIG9ubHkgYSB0ZW1wIHNvbHV0aW9uIGFzIGxvbmcgYXMgdGhlIG1vZGVsIGZpeCB0aGUgY2FjaGUgaXNzdWUgYW5kIHdlIHVzZSB0aGlzIGFkZGl0aW9uYWxcblx0XHQvLyBiaW5kaW5nIHdpdGggb3duUmVxdWVzdFxuXHRcdG9CaW5kaW5nQ29udGV4dCA9IG9PYmplY3RQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHRsZXQgYUlCTkFjdGlvbnM6IGFueVtdID0gW107XG5cdFx0b09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKG9TdWJTZWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0YUlCTkFjdGlvbnMgPSBDb21tb25VdGlscy5nZXRJQk5BY3Rpb25zKG9TdWJTZWN0aW9uLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEFzc2lnbiBpbnRlcm5hbCBiaW5kaW5nIGNvbnRleHRzIHRvIG9Gb3JtQ29udGFpbmVyOlxuXHRcdC8vIDEuIEl0IGlzIG5vdCBwb3NzaWJsZSB0byBhc3NpZ24gdGhlIGludGVybmFsIGJpbmRpbmcgY29udGV4dCB0byB0aGUgWE1MIGZyYWdtZW50XG5cdFx0Ly8gKEZvcm1Db250YWluZXIuZnJhZ21lbnQueG1sKSB5ZXQgLSBpdCBpcyB1c2VkIGFscmVhZHkgZm9yIHRoZSBkYXRhLXN0cnVjdHVyZS5cblx0XHQvLyAyLiBBbm90aGVyIHByb2JsZW0gaXMsIHRoYXQgRm9ybUNvbnRhaW5lcnMgYXNzaWduZWQgdG8gYSAnTW9yZUJsb2NrJyBkb2VzIG5vdCBoYXZlIGFuXG5cdFx0Ly8gaW50ZXJuYWwgbW9kZWwgY29udGV4dCBhdCBhbGwuXG5cblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIHt9KTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dDdXN0b21WYWxpZGl0eVwiLCB7fSk7XG5cblx0XHRcdFx0YUlCTkFjdGlvbnMgPSBDb21tb25VdGlscy5nZXRJQk5BY3Rpb25zKG9UYWJsZSwgYUlCTkFjdGlvbnMpO1xuXG5cdFx0XHRcdC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIGZvciBCQ1A6IDIwODAyMTgwMDRcblx0XHRcdFx0Ly8gTmVlZCB0byBmaXggd2l0aCBCTEk6IEZJT1JJVEVDSFAxLTE1Mjc0XG5cdFx0XHRcdC8vIG9ubHkgZm9yIGVkaXQgbW9kZSwgd2UgY2xlYXIgdGhlIHRhYmxlIGNhY2hlXG5cdFx0XHRcdC8vIFdvcmthcm91bmQgc3RhcnRzIGhlcmUhIVxuXHRcdFx0XHRjb25zdCBvVGFibGVSb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0aWYgKG9UYWJsZVJvd0JpbmRpbmcpIHtcblx0XHRcdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9UYWJsZVJvd0JpbmRpbmcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0XHRcdC8vIGFwcGx5IGZvciBib3RoIGVkaXQgYW5kIGRpc3BsYXkgbW9kZSBpbiBzdGlja3lcblx0XHRcdFx0XHRcdG9UYWJsZVJvd0JpbmRpbmcucmVtb3ZlQ2FjaGVzQW5kTWVzc2FnZXMoXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFdvcmthcm91bmQgZW5kcyBoZXJlISFcblxuXHRcdFx0XHQvLyBVcGRhdGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBidXR0b25zIG9uIHRhYmxlIHRvb2xiYXJcblx0XHRcdFx0Ly8gVGhlIHNhbWUgaXMgYWxzbyBwZXJmb3JtZWQgb24gVGFibGUgc2VsZWN0aW9uQ2hhbmdlIGV2ZW50XG5cdFx0XHRcdGNvbnN0IG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdFx0Q29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib3BlcmF0aW9uQXZhaWxhYmxlTWFwXCIpKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChvSW50ZXJuYWxNb2RlbENvbnRleHQsIG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAsIGFTZWxlY3RlZENvbnRleHRzLCBcInRhYmxlXCIpO1xuXHRcdFx0XHQvLyBDbGVhciB0aGUgc2VsZWN0aW9uIGluIHRoZSB0YWJsZSwgbmVlZCB0byBiZSBmaXhlZCBhbmQgcmV2aWV3IHdpdGggQkxJOiBGSU9SSVRFQ0hQMS0yNDMxOFxuXHRcdFx0XHRvVGFibGUuY2xlYXJTZWxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsKHRoaXMsIFwiX3BhZ2VNb2RlbFwiKTtcblx0XHQvL1JldHJpZXZlIE9iamVjdCBQYWdlIGhlYWRlciBhY3Rpb25zIGZyb20gT2JqZWN0IFBhZ2UgdGl0bGUgY29udHJvbFxuXHRcdGNvbnN0IG9PYmplY3RQYWdlVGl0bGUgPSBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpIGFzIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGU7XG5cdFx0bGV0IGFJQk5IZWFkZXJBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGFJQk5IZWFkZXJBY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvT2JqZWN0UGFnZVRpdGxlLCBhSUJOSGVhZGVyQWN0aW9ucyk7XG5cdFx0YUlCTkFjdGlvbnMgPSBhSUJOQWN0aW9ucy5jb25jYXQoYUlCTkhlYWRlckFjdGlvbnMpO1xuXHRcdENvbW1vblV0aWxzLnVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zLCB0aGlzLmdldFZpZXcoKSk7XG5cblx0XHRsZXQgb01vZGVsOiBhbnksIG9GaW5hbFVJU3RhdGU6IGFueTtcblxuXHRcdC8vIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWVkZWQgYXQgdGhlIGFsbFxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvVGFibGVcblx0XHQgKi9cblx0XHRjb25zdCBoYW5kbGVUYWJsZU1vZGlmaWNhdGlvbnMgPSAob1RhYmxlOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gdGhpcy5fZ2V0VGFibGVCaW5kaW5nKG9UYWJsZSksXG5cdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRUYWJsZUhlbHBlci5lbmFibGVGYXN0Q3JlYXRpb25Sb3coXG5cdFx0XHRcdFx0XHRvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKSxcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmdldENvbnRleHQoKSxcblx0XHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRcdG9GaW5hbFVJU3RhdGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZiAoIW9CaW5kaW5nKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgRXhwZWN0ZWQgYmluZGluZyBtaXNzaW5nIGZvciB0YWJsZTogJHtvVGFibGUuZ2V0SWQoKX1gKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0Zm5IYW5kbGVUYWJsZVBhdGNoRXZlbnRzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbkhhbmRsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cygpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlQ2hhbmdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaENoYW5nZShmbkhhbmRsZUNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdG9Nb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXG5cdFx0XHQvLyBDb21wdXRlIEVkaXQgTW9kZVxuXHRcdFx0b0ZpbmFsVUlTdGF0ZSA9IHRoaXMuZWRpdEZsb3cuY29tcHV0ZUVkaXRNb2RlKG9CaW5kaW5nQ29udGV4dCk7XG5cblx0XHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdG9GaW5hbFVJU3RhdGVcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbm5lY3QodGhpcy5nZXRWaWV3KCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpc0Nvbm5lY3RlZCh0aGlzLmdldFZpZXcoKSkpIHtcblx0XHRcdFx0XHRcdFx0ZGlzY29ubmVjdCh0aGlzLmdldFZpZXcoKSk7IC8vIENsZWFudXAgY29sbGFib3JhdGlvbiBjb25uZWN0aW9uIGluIGNhc2Ugd2Ugc3dpdGNoIHRvIGFub3RoZXIgZWxlbWVudCAoZS5nLiBpbiBGQ0wpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZmluYWwgVUkgU3RhdGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIHVwZGF0ZSByZWxhdGVkIGFwcHNcblx0XHRcdHRoaXMuX3VwZGF0ZVJlbGF0ZWRBcHBzKCk7XG5cblx0XHRcdC8vQXR0YWNoIHRoZSBwYXRjaCBzZW50IGFuZCBwYXRjaCBjb21wbGV0ZWQgZXZlbnQgdG8gdGhlIG9iamVjdCBwYWdlIGJpbmRpbmcgc28gdGhhdCB3ZSBjYW4gcmVhY3Rcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gKG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nICYmIG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkpIHx8IG9CaW5kaW5nQ29udGV4dDtcblxuXHRcdFx0Ly8gQXR0YWNoIHRoZSBldmVudCBoYW5kbGVyIG9ubHkgb25jZSB0byB0aGUgc2FtZSBiaW5kaW5nXG5cdFx0XHRpZiAodGhpcy5jdXJyZW50QmluZGluZyAhPT0gb0JpbmRpbmcpIHtcblx0XHRcdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnQoXCJwYXRjaFNlbnRcIiwgdGhpcy5lZGl0Rmxvdy5oYW5kbGVQYXRjaFNlbnQsIHRoaXMpO1xuXHRcdFx0XHR0aGlzLmN1cnJlbnRCaW5kaW5nID0gb0JpbmRpbmc7XG5cdFx0XHR9XG5cblx0XHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdFx0Ly8gYWNjZXNzIGJpbmRpbmcgb25seSBhZnRlciB0YWJsZSBpcyBib3VuZFxuXHRcdFx0XHRUYWJsZVV0aWxzLndoZW5Cb3VuZChvVGFibGUpXG5cdFx0XHRcdFx0LnRoZW4oaGFuZGxlVGFibGVNb2RpZmljYXRpb25zKVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHdhaXRpbmcgZm9yIHRoZSB0YWJsZSB0byBiZSBib3VuZFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHNob3VsZCBiZSBjYWxsZWQgb25seSBhZnRlciBiaW5kaW5nIGlzIHJlYWR5IGhlbmNlIGNhbGxpbmcgaXQgaW4gb25BZnRlckJpbmRpbmdcblx0XHRcdChvT2JqZWN0UGFnZSBhcyBhbnkpLl90cmlnZ2VyVmlzaWJsZVN1YlNlY3Rpb25zRXZlbnRzKCk7XG5cblx0XHRcdC8vVG8gQ29tcHV0ZSB0aGUgRWRpdCBCaW5kaW5nIG9mIHRoZSBzdWJPYmplY3QgcGFnZSB1c2luZyByb290IG9iamVjdCBwYWdlLCBjcmVhdGUgYSBjb250ZXh0IGZvciBkcmFmdCByb290IGFuZCB1cGRhdGUgdGhlIGVkaXQgYnV0dG9uIGluIHN1YiBPUCB1c2luZyB0aGUgY29udGV4dFxuXHRcdFx0QWN0aW9uUnVudGltZS51cGRhdGVFZGl0QnV0dG9uVmlzaWJpbGl0eUFuZEVuYWJsZW1lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25QYWdlUmVhZHkobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IHNldEZvY3VzID0gKCkgPT4ge1xuXHRcdFx0Ly8gU2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3QgYWN0aW9uIGJ1dHRvbiwgb3IgdG8gdGhlIGZpcnN0IGVkaXRhYmxlIGlucHV0IGlmIGluIGVkaXRhYmxlIG1vZGVcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGNvbnN0IGlzSW5EaXNwbGF5TW9kZSA9ICFvT2JqZWN0UGFnZS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cblx0XHRcdGlmIChpc0luRGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y29uc3Qgb0ZpcnN0Q2xpY2thYmxlRWxlbWVudCA9IHRoaXMuX2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudChvT2JqZWN0UGFnZSk7XG5cdFx0XHRcdGlmIChvRmlyc3RDbGlja2FibGVFbGVtZW50KSB7XG5cdFx0XHRcdFx0b0ZpcnN0Q2xpY2thYmxlRWxlbWVudC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRTZWN0aW9uOiBhbnkgPSBDb3JlLmJ5SWQob09iamVjdFBhZ2UuZ2V0U2VsZWN0ZWRTZWN0aW9uKCkpO1xuXHRcdFx0XHRpZiAob1NlbGVjdGVkU2VjdGlvbikge1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUZvY3VzSW5FZGl0TW9kZShvU2VsZWN0ZWRTZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHQvLyBBcHBseSBhcHAgc3RhdGUgb25seSBhZnRlciB0aGUgcGFnZSBpcyByZWFkeSB3aXRoIHRoZSBmaXJzdCBzZWN0aW9uIHNlbGVjdGVkXG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Ly9TaG93IHBvcHVwIHdoaWxlIG5hdmlnYXRpbmcgYmFjayBmcm9tIG9iamVjdCBwYWdlIGluIGNhc2Ugb2YgZHJhZnRcblx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKChvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0XHRpZiAoIWJJc1N0aWNreU1vZGUpIHtcblx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCgpID0+IHRoaXMuX29uQmFja05hdmlnYXRpb25JbkRyYWZ0KG9CaW5kaW5nQ29udGV4dCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCB2aWV3SWQgPSB0aGlzLmdldFZpZXcoKS5nZXRJZCgpO1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KClcblx0XHRcdC5nZXRBcHBTdGF0ZUhhbmRsZXIoKVxuXHRcdFx0LmFwcGx5QXBwU3RhdGUodmlld0lkLCB0aGlzLmdldFZpZXcoKSlcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmZvcmNlRm9jdXMpIHtcblx0XHRcdFx0XHRzZXRGb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChFcnJvcikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzZXR0aW5nIHRoZSBmb2N1c1wiLCBFcnJvcik7XG5cdFx0XHR9KTtcblxuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImVycm9yTmF2aWdhdGlvblNlY3Rpb25GbGFnXCIsIGZhbHNlKTtcblx0XHR0aGlzLl9jaGVja0RhdGFQb2ludFRpdGxlRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBzdGF0dXMgb2YgZWRpdCBtb2RlIGZvciBzdGlja3kgc2Vzc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHN0YXR1cyBvZiBlZGl0IG1vZGUgZm9yIHN0aWNreSBzZXNzaW9uXG5cdCAqL1xuXHRnZXRTdGlja3lFZGl0TW9kZSgpIHtcblx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCAmJiAodGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRsZXQgYklzU3RpY2t5RWRpdE1vZGUgPSBmYWxzZTtcblx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKTtcblx0XHRcdGlmIChiSXNTdGlja3lNb2RlKSB7XG5cdFx0XHRcdGJJc1N0aWNreUVkaXRNb2RlID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYklzU3RpY2t5RWRpdE1vZGU7XG5cdH1cblxuXHRfZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuYnlJZChcImZlOjpPYmplY3RQYWdlXCIpIGFzIE9iamVjdFBhZ2VMYXlvdXQ7XG5cdH1cblxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlU3VidGl0bGUgPSBvT2JqZWN0UGFnZS5nZXRDdXN0b21EYXRhKCkuZmluZChmdW5jdGlvbiAob0N1c3RvbURhdGE6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9DdXN0b21EYXRhLmdldEtleSgpID09PSBcIk9iamVjdFBhZ2VTdWJ0aXRsZVwiO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogb09iamVjdFBhZ2UuZGF0YShcIk9iamVjdFBhZ2VUaXRsZVwiKSB8fCBcIlwiLFxuXHRcdFx0c3VidGl0bGU6IG9PYmplY3RQYWdlU3VidGl0bGUgJiYgb09iamVjdFBhZ2VTdWJ0aXRsZS5nZXRWYWx1ZSgpLFxuXHRcdFx0aW50ZW50OiBcIlwiLFxuXHRcdFx0aWNvbjogXCJcIlxuXHRcdH07XG5cdH1cblxuXHRfZXhlY3V0ZUhlYWRlclNob3J0Y3V0KHNJZDogYW55KSB7XG5cdFx0Y29uc3Qgc0J1dHRvbklkID0gYCR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX0tLSR7c0lkfWAsXG5cdFx0XHRvQnV0dG9uID0gKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0SGVhZGVyVGl0bGUoKSBhcyBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlKVxuXHRcdFx0XHQuZ2V0QWN0aW9ucygpXG5cdFx0XHRcdC5maW5kKGZ1bmN0aW9uIChvRWxlbWVudDogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9FbGVtZW50LmdldElkKCkgPT09IHNCdXR0b25JZDtcblx0XHRcdFx0fSk7XG5cdFx0aWYgKG9CdXR0b24pIHtcblx0XHRcdENvbW1vblV0aWxzLmZpcmVCdXR0b25QcmVzcyhvQnV0dG9uKTtcblx0XHR9XG5cdH1cblxuXHRfZXhlY3V0ZUZvb3RlclNob3J0Y3V0KHNJZDogYW55KSB7XG5cdFx0Y29uc3Qgc0J1dHRvbklkID0gYCR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX0tLSR7c0lkfWAsXG5cdFx0XHRvQnV0dG9uID0gKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0Rm9vdGVyKCkgYXMgYW55KS5nZXRDb250ZW50KCkuZmluZChmdW5jdGlvbiAob0VsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0VsZW1lbnQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLm0uQnV0dG9uXCIgJiYgb0VsZW1lbnQuZ2V0SWQoKSA9PT0gc0J1dHRvbklkO1xuXHRcdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMuZmlyZUJ1dHRvblByZXNzKG9CdXR0b24pO1xuXHR9XG5cblx0X2V4ZWN1dGVUYWJTaG9ydEN1dChvRXhlY3V0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCksXG5cdFx0XHRhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpLFxuXHRcdFx0aVNlY3Rpb25JbmRleE1heCA9IGFTZWN0aW9ucy5sZW5ndGggLSAxLFxuXHRcdFx0c0NvbW1hbmQgPSBvRXhlY3V0aW9uLm9Tb3VyY2UuZ2V0Q29tbWFuZCgpO1xuXHRcdGxldCBuZXdTZWN0aW9uLFxuXHRcdFx0aVNlbGVjdGVkU2VjdGlvbkluZGV4ID0gb09iamVjdFBhZ2UuaW5kZXhPZlNlY3Rpb24odGhpcy5ieUlkKG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gLTEgJiYgaVNlY3Rpb25JbmRleE1heCA+IDApIHtcblx0XHRcdGlmIChzQ29tbWFuZCA9PT0gXCJOZXh0VGFiXCIpIHtcblx0XHRcdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCA8PSBpU2VjdGlvbkluZGV4TWF4IC0gMSkge1xuXHRcdFx0XHRcdG5ld1NlY3Rpb24gPSBhU2VjdGlvbnNbKytpU2VsZWN0ZWRTZWN0aW9uSW5kZXhdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gMCkge1xuXHRcdFx0XHQvLyBQcmV2aW91c1RhYlxuXHRcdFx0XHRuZXdTZWN0aW9uID0gYVNlY3Rpb25zWy0taVNlbGVjdGVkU2VjdGlvbkluZGV4XTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5ld1NlY3Rpb24pIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG5ld1NlY3Rpb24pO1xuXHRcdFx0XHRuZXdTZWN0aW9uLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEZvb3RlclZpc2liaWxpdHkoKSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5nZXRWaWV3KCkuZ2V0SWQoKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgZmFsc2UpO1xuXHRcdHNhcC51aVxuXHRcdFx0LmdldENvcmUoKVxuXHRcdFx0LmdldE1lc3NhZ2VNYW5hZ2VyKClcblx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0LmdldERhdGEoKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24gJiYgb01lc3NhZ2UudHlwZSA9PT0gXCJFcnJvclwiICYmIG9NZXNzYWdlLnRhcmdldC5pbmRleE9mKHNWaWV3SWQpID4gLTEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0X3Nob3dNZXNzYWdlUG9wb3ZlcihlcnI/OiBhbnksIG9SZXQ/OiBhbnkpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHR9XG5cdFx0Y29uc3Qgcm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0Y29uc3QgY3VycmVudFBhZ2VWaWV3ID0gcm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpXG5cdFx0XHQ/IHJvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RWaWV3KClcblx0XHRcdDogKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um9vdENvbnRhaW5lcigpIGFzIGFueSkuZ2V0Q3VycmVudFBhZ2UoKTtcblx0XHRpZiAoIWN1cnJlbnRQYWdlVmlldy5pc0EoXCJzYXAubS5NZXNzYWdlUGFnZVwiKSkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2VCdXR0b24gPSB0aGlzLm1lc3NhZ2VCdXR0b24sXG5cdFx0XHRcdG9NZXNzYWdlUG9wb3ZlciA9IG9NZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3Zlcixcblx0XHRcdFx0b0l0ZW1CaW5kaW5nID0gb01lc3NhZ2VQb3BvdmVyLmdldEJpbmRpbmcoXCJpdGVtc1wiKTtcblxuXHRcdFx0aWYgKG9JdGVtQmluZGluZy5nZXRMZW5ndGgoKSA+IDAgJiYgIW9NZXNzYWdlUG9wb3Zlci5pc09wZW4oKSkge1xuXHRcdFx0XHRvTWVzc2FnZUJ1dHRvbi5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0XHQvLyB3b3JrYXJvdW5kIHRvIGVuc3VyZSB0aGF0IG9NZXNzYWdlQnV0dG9uIGlzIHJlbmRlcmVkIHdoZW4gb3BlbkJ5IGlzIGNhbGxlZFxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvTWVzc2FnZVBvcG92ZXIub3BlbkJ5KG9NZXNzYWdlQnV0dG9uKTtcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvUmV0O1xuXHR9XG5cblx0X2VkaXREb2N1bWVudChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKTtcblx0XHRCdXN5TG9ja2VyLmxvY2sob01vZGVsKTtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdy5lZGl0RG9jdW1lbnQuYXBwbHkodGhpcy5lZGl0RmxvdywgW29Db250ZXh0XSkuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTW9kZWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGNvbnRleHQgb2YgdGhlIERyYWZ0Um9vdCBwYXRoLlxuXHQgKiBJZiBhIHZpZXcgaGFzIGJlZW4gY3JlYXRlZCB3aXRoIHRoZSBkcmFmdCBSb290IFBhdGgsIHRoaXMgbWV0aG9kIHJldHVybnMgaXRzIGJpbmRpbmdDb250ZXh0LlxuXHQgKiBXaGVyZSBubyB2aWV3IGlzIGZvdW5kIGEgbmV3IGNyZWF0ZWQgY29udGV4dCBpcyByZXR1cm5lZC5cblx0ICogVGhlIG5ldyBjcmVhdGVkIGNvbnRleHQgcmVxdWVzdCB0aGUga2V5IG9mIHRoZSBlbnRpdHkgaW4gb3JkZXIgdG8gZ2V0IHRoZSBFdGFnIG9mIHRoaXMgZW50aXR5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RHJhZnRSb290UGF0aFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZVxuXHQgKi9cblx0YXN5bmMgZ2V0RHJhZnRSb290Q29udGV4dCgpOiBQcm9taXNlPENvbnRleHQgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3QgY29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRjb25zdCBkcmFmdFJvb3RDb250ZXh0UGF0aCA9IE1vZGVsSGVscGVyLmdldERyYWZ0Um9vdFBhdGgoY29udGV4dCk7XG5cdFx0XHRsZXQgc2ltcGxlRHJhZnRSb290Q29udGV4dDogQ29udGV4dDtcblx0XHRcdGlmIChkcmFmdFJvb3RDb250ZXh0UGF0aCkge1xuXHRcdFx0XHQvLyBDaGVjayBpZiBhIHZpZXcgbWF0Y2hlcyB3aXRoIHRoZSBkcmFmdCByb290IHBhdGhcblx0XHRcdFx0Y29uc3QgZXhpc3RpbmdCaW5kaW5nQ29udGV4dE9uUGFnZSA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KClcblx0XHRcdFx0XHQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKClcblx0XHRcdFx0XHQuZ2V0SW5zdGFuY2VkVmlld3MoKVxuXHRcdFx0XHRcdC5maW5kKChwYWdlVmlldzogVmlldykgPT4gcGFnZVZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpID09PSBkcmFmdFJvb3RDb250ZXh0UGF0aClcblx0XHRcdFx0XHQ/LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdFx0aWYgKGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXhpc3RpbmdCaW5kaW5nQ29udGV4dE9uUGFnZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0c2ltcGxlRHJhZnRSb290Q29udGV4dCA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvc2ltcGxlRHJhZnRSb290Q29udGV4dFwiKTtcblx0XHRcdFx0aWYgKHNpbXBsZURyYWZ0Um9vdENvbnRleHQ/LmdldFBhdGgoKSA9PT0gZHJhZnRSb290Q29udGV4dFBhdGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gc2ltcGxlRHJhZnRSb290Q29udGV4dDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBtb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRcdFx0c2ltcGxlRHJhZnRSb290Q29udGV4dCA9IG1vZGVsLmJpbmRDb250ZXh0KGRyYWZ0Um9vdENvbnRleHRQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0YXdhaXQgQ29tbW9uVXRpbHMud2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQoc2ltcGxlRHJhZnRSb290Q29udGV4dCk7XG5cdFx0XHRcdC8vIFN0b3JlIHRoaXMgbmV3IGNyZWF0ZWQgY29udGV4dCB0byB1c2UgaXQgb24gdGhlIG5leHQgaXRlcmF0aW9uc1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3NpbXBsZURyYWZ0Um9vdENvbnRleHRcIiwgc2ltcGxlRHJhZnRSb290Q29udGV4dCk7XG5cdFx0XHRcdHJldHVybiBzaW1wbGVEcmFmdFJvb3RDb250ZXh0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGFzeW5jIF92YWxpZGF0ZURvY3VtZW50KCk6IFByb21pc2U8dm9pZCB8IGFueVtdIHwgT0RhdGFDb250ZXh0QmluZGluZz4ge1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0Y29uc3QgY29udHJvbCA9IENvcmUuYnlJZChDb3JlLmdldEN1cnJlbnRGb2N1c2VkQ29udHJvbElkKCkpO1xuXHRcdGNvbnN0IGNvbnRleHQgPSBjb250cm9sPy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKGNvbnRleHQgJiYgIWNvbnRleHQuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHNpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dCk7XG5cdFx0XHRjb25zdCBnbG9iYWxTaWRlRWZmZWN0cyA9IGVudGl0eVR5cGUgPyBzaWRlRWZmZWN0c1NlcnZpY2UuZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlKSA6IFtdO1xuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGdsb2JhbCBTaWRlRWZmZWN0cyBmb3IgdGhlIHJlbGF0ZWQgZW50aXR5LCBleGVjdXRlIGl0L3RoZW1cblx0XHRcdGlmIChnbG9iYWxTaWRlRWZmZWN0cy5sZW5ndGgpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5lZGl0Rmxvdy5zeW5jVGFzaygpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoZ2xvYmFsU2lkZUVmZmVjdHMubWFwKChzaWRlRWZmZWN0cykgPT4gdGhpcy5fc2lkZUVmZmVjdHMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzLCBjb250ZXh0KSkpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZHJhZnRSb290Q29udGV4dCA9IGF3YWl0IHRoaXMuZ2V0RHJhZnRSb290Q29udGV4dCgpO1xuXHRcdFx0Ly9FeGVjdXRlIHRoZSBkcmFmdFZhbGlkYXRpb24gaWYgdGhlcmUgaXMgbm8gZ2xvYmFsU2lkZUVmZmVjdHMgKGlnbm9yZSBFVGFncyBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0KVxuXHRcdFx0aWYgKGRyYWZ0Um9vdENvbnRleHQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5lZGl0Rmxvdy5zeW5jVGFzaygpO1xuXHRcdFx0XHRyZXR1cm4gZHJhZnQuZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbihkcmFmdFJvb3RDb250ZXh0LCBhcHBDb21wb25lbnQsIGlzQ29ubmVjdGVkKHRoaXMuZ2V0VmlldygpKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRhc3luYyBfc2F2ZURvY3VtZW50KG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpLFxuXHRcdFx0YVdhaXRDcmVhdGVEb2N1bWVudHM6IGFueVtdID0gW107XG5cdFx0Ly8gaW5kaWNhdGVzIGlmIHdlIGFyZSBjcmVhdGluZyBhIG5ldyByb3cgaW4gdGhlIE9QXG5cdFx0bGV0IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gZmFsc2U7XG5cdFx0QnVzeUxvY2tlci5sb2NrKG9Nb2RlbCk7XG5cdFx0dGhpcy5fZmluZFRhYmxlcygpLmZvckVhY2goKG9UYWJsZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHRoaXMuX2dldFRhYmxlQmluZGluZyhvVGFibGUpO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlcnM6IGFueSA9IHtcblx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBvVGFibGUuZGF0YShcImNyZWF0aW9uTW9kZVwiKSxcblx0XHRcdFx0Y3JlYXRpb25Sb3c6IG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLFxuXHRcdFx0XHRjcmVhdGVBdEVuZDogb1RhYmxlLmRhdGEoXCJjcmVhdGVBdEVuZFwiKSA9PT0gXCJ0cnVlXCJcblx0XHRcdH07XG5cdFx0XHRjb25zdCBiQ3JlYXRlRG9jdW1lbnQgPVxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvblJvdyAmJlxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpICYmXG5cdFx0XHRcdE9iamVjdC5rZXlzKG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93LmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0T2JqZWN0KCkpLmxlbmd0aCA+IDE7XG5cdFx0XHRpZiAoYkNyZWF0ZURvY3VtZW50KSB7XG5cdFx0XHRcdC8vIHRoZSBiU2tpcFNpZGVFZmZlY3RzIGlzIGEgcGFyYW1ldGVyIGNyZWF0ZWQgd2hlbiB3ZSBjbGljayB0aGUgc2F2ZSBrZXkuIElmIHdlIHByZXNzIHRoaXMga2V5XG5cdFx0XHRcdC8vIHdlIGRvbid0IGV4ZWN1dGUgdGhlIGhhbmRsZVNpZGVFZmZlY3RzIGZ1bmNpdG9uIHRvIGF2b2lkIGJhdGNoIHJlZHVuZGFuY3lcblx0XHRcdFx0bVBhcmFtZXRlcnMuYlNraXBTaWRlRWZmZWN0cyA9IHRydWU7XG5cdFx0XHRcdGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gdHJ1ZTtcblx0XHRcdFx0YVdhaXRDcmVhdGVEb2N1bWVudHMucHVzaChcblx0XHRcdFx0XHR0aGlzLmVkaXRGbG93LmNyZWF0ZURvY3VtZW50KG9CaW5kaW5nLCBtUGFyYW1ldGVycykudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0JpbmRpbmc7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhQmluZGluZ3MgPSBhd2FpdCBQcm9taXNlLmFsbChhV2FpdENyZWF0ZURvY3VtZW50cyk7XG5cdFx0XHRjb25zdCBtUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0YkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3I6IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yLFxuXHRcdFx0XHRiaW5kaW5nczogYUJpbmRpbmdzXG5cdFx0XHR9O1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBlaXRoZXIgcmVqZWN0IG9yIHJlc29sdmUgYSBwcm9taXNlIGhlcmUgYW5kIHJldHVybiBpdCBzaW5jZSB0aGlzIHNhdmVcblx0XHRcdC8vIGZ1bmN0aW9uIGlzIG5vdCBvbmx5IGNhbGxlZCB3aGVuIHByZXNzaW5nIHRoZSBzYXZlIGJ1dHRvbiBpbiB0aGUgZm9vdGVyLCBidXQgYWxzb1xuXHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBzZWxlY3RzIGNyZWF0ZSBvciBzYXZlIGluIGEgZGF0YWxvc3MgcG9wdXAuXG5cdFx0XHQvLyBUaGUgbG9naWMgb2YgdGhlIGRhdGFsb3NzIHBvcHVwIG5lZWRzIHRvIGRldGVjdCBpZiB0aGUgc2F2ZSBoYWQgZXJyb3JzIG9yIG5vdCBpbiBvcmRlclxuXHRcdFx0Ly8gdG8gZGVjaWRlIGlmIHRoZSBzdWJzZXF1ZW50IGFjdGlvbiAtIGxpa2UgYSBiYWNrIG5hdmlnYXRpb24gLSBoYXMgdG8gYmUgZXhlY3V0ZWQgb3Igbm90LlxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5lZGl0Rmxvdy5zYXZlRG9jdW1lbnQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0Ly8gSWYgdGhlIHNhdmVEb2N1bWVudCBpbiBlZGl0RmxvdyByZXR1cm5zIGVycm9ycyB3ZSBuZWVkXG5cdFx0XHRcdC8vIHRvIHNob3cgdGhlIG1lc3NhZ2UgcG9wb3ZlciBoZXJlIGFuZCBlbnN1cmUgdGhhdCB0aGVcblx0XHRcdFx0Ly8gZGF0YWxvc3MgbG9naWMgZG9lcyBub3QgcGVyZm9ybSB0aGUgZm9sbG93IHVwIGZ1bmN0aW9uXG5cdFx0XHRcdC8vIGxpa2UgZS5nLiBhIGJhY2sgbmF2aWdhdGlvbiBoZW5jZSB3ZSByZXR1cm4gYSBwcm9taXNlIGFuZCByZWplY3QgaXRcblx0XHRcdFx0dGhpcy5fc2hvd01lc3NhZ2VQb3BvdmVyKGVycm9yKTtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9Nb2RlbCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob01vZGVsKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfbWFuYWdlQ29sbGFib3JhdGlvbigpIHtcblx0XHRvcGVuTWFuYWdlRGlhbG9nKHRoaXMuZ2V0VmlldygpKTtcblx0fVxuXG5cdF9zaG93Q29sbGFib3JhdGlvblVzZXJEZXRhaWxzKGV2ZW50OiBhbnkpIHtcblx0XHRzaG93VXNlckRldGFpbHMoZXZlbnQsIHRoaXMuZ2V0VmlldygpKTtcblx0fVxuXG5cdF9jYW5jZWxEb2N1bWVudChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bVBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uID0gdGhpcy5nZXRWaWV3KCkuYnlJZChtUGFyYW1ldGVycy5jYW5jZWxCdXR0b24pOyAvL3RvIGdldCB0aGUgcmVmZXJlbmNlIG9mIHRoZSBjYW5jZWwgYnV0dG9uIGZyb20gY29tbWFuZCBleGVjdXRpb25cblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdy5jYW5jZWxEb2N1bWVudChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHR9XG5cblx0X2FwcGx5RG9jdW1lbnQob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLmVkaXRGbG93LmFwcGx5RG9jdW1lbnQob0NvbnRleHQpLmNhdGNoKCgpID0+IHRoaXMuX3Nob3dNZXNzYWdlUG9wb3ZlcigpKTtcblx0fVxuXG5cdF91cGRhdGVSZWxhdGVkQXBwcygpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cdFx0Y29uc3Qgc2hvd1JlbGF0ZWRBcHBzID0gb09iamVjdFBhZ2UuZGF0YShcInNob3dSZWxhdGVkQXBwc1wiKTtcblx0XHRpZiAoc2hvd1JlbGF0ZWRBcHBzID09PSBcInRydWVcIiB8fCBzaG93UmVsYXRlZEFwcHMgPT09IHRydWUpIHtcblx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLmdldFZpZXcoKSk7XG5cdFx0XHRDb21tb25VdGlscy51cGRhdGVSZWxhdGVkQXBwc0RldGFpbHMob09iamVjdFBhZ2UsIGFwcENvbXBvbmVudCk7XG5cdFx0fVxuXHR9XG5cblx0X2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFQYXJlbnRFbGVtZW50OiBhbnksIGFTdWJzZWN0aW9uOiBhbnksIGFDb250cm9sczogYW55LCBiSXNDaGFydD86IGJvb2xlYW4pIHtcblx0XHRmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFQYXJlbnRFbGVtZW50Lmxlbmd0aDsgZWxlbWVudCsrKSB7XG5cdFx0XHRsZXQgb0VsZW1lbnQgPSBhUGFyZW50RWxlbWVudFtlbGVtZW50XS5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgYVBhcmVudEVsZW1lbnRbZWxlbWVudF0uZ2V0Q29udGVudCgpO1xuXHRcdFx0aWYgKGJJc0NoYXJ0KSB7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5tQWdncmVnYXRpb25zICYmIG9FbGVtZW50LmdldEFnZ3JlZ2F0aW9uKFwiaXRlbXNcIikpIHtcblx0XHRcdFx0XHRjb25zdCBhSXRlbXMgPSBvRWxlbWVudC5nZXRBZ2dyZWdhdGlvbihcIml0ZW1zXCIpO1xuXHRcdFx0XHRcdGFJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob0l0ZW0uaXNBKFwic2FwLmZlLm1hY3Jvcy5jaGFydC5DaGFydEFQSVwiKSkge1xuXHRcdFx0XHRcdFx0XHRvRWxlbWVudCA9IG9JdGVtO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC51aS5sYXlvdXQuRHluYW1pY1NpZGVDb250ZW50XCIpKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnQuZ2V0TWFpbkNvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvRWxlbWVudC5nZXRNYWluQ29udGVudCgpO1xuXHRcdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFRoZSB0YWJsZSBtYXkgY3VycmVudGx5IGJlIHNob3duIGluIGEgZnVsbCBzY3JlZW4gZGlhbG9nLCB3ZSBjYW4gdGhlbiBnZXQgdGhlIHJlZmVyZW5jZSB0byB0aGUgVGFibGVBUElcblx0XHRcdC8vIGNvbnRyb2wgZnJvbSB0aGUgY3VzdG9tIGRhdGEgb2YgdGhlIHBsYWNlIGhvbGRlciBwYW5lbFxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAubS5QYW5lbFwiKSAmJiBvRWxlbWVudC5kYXRhKFwiRnVsbFNjcmVlblRhYmxlUGxhY2VIb2xkZXJcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5kYXRhKFwidGFibGVBUElyZWZlcmVuY2VcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgb0VsZW1lbnQuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRhQ29udHJvbHMucHVzaChvRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC5mZS5tYWNyb3MuY2hhcnQuQ2hhcnRBUElcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgb0VsZW1lbnQuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0XHRhQ29udHJvbHMucHVzaChvRWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEFsbFN1YlNlY3Rpb25zKCkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRsZXQgYVN1YlNlY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IGFueSkge1xuXHRcdFx0YVN1YlNlY3Rpb25zID0gYVN1YlNlY3Rpb25zLmNvbmNhdChvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gYVN1YlNlY3Rpb25zO1xuXHR9XG5cblx0X2dldEFsbEJsb2NrcygpIHtcblx0XHRsZXQgYUJsb2NrczogYW55W10gPSBbXTtcblx0XHR0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKG9TdWJTZWN0aW9uOiBhbnkpIHtcblx0XHRcdGFCbG9ja3MgPSBhQmxvY2tzLmNvbmNhdChvU3ViU2VjdGlvbi5nZXRCbG9ja3MoKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFCbG9ja3M7XG5cdH1cblxuXHRfZmluZFRhYmxlcygpIHtcblx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdGNvbnN0IGFUYWJsZXM6IGFueVtdID0gW107XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbiA9IDA7IHN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBzdWJTZWN0aW9uKyspIHtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhVGFibGVzKTtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRNb3JlQmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYVRhYmxlcyk7XG5cdFx0fVxuXHRcdHJldHVybiBhVGFibGVzO1xuXHR9XG5cblx0X2ZpbmRDaGFydHMoKSB7XG5cdFx0Y29uc3QgYVN1YlNlY3Rpb25zID0gdGhpcy5fZ2V0QWxsU3ViU2VjdGlvbnMoKTtcblx0XHRjb25zdCBhQ2hhcnRzOiBhbnlbXSA9IFtdO1xuXHRcdGZvciAobGV0IHN1YlNlY3Rpb24gPSAwOyBzdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgc3ViU2VjdGlvbisrKSB7XG5cdFx0XHR0aGlzLl9maW5kQ29udHJvbEluU3ViU2VjdGlvbihhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0QmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYUNoYXJ0cywgdHJ1ZSk7XG5cdFx0XHR0aGlzLl9maW5kQ29udHJvbEluU3ViU2VjdGlvbihhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0TW9yZUJsb2NrcygpLCBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0sIGFDaGFydHMsIHRydWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gYUNoYXJ0cztcblx0fVxuXG5cdF9jbG9zZVNpZGVDb250ZW50KCkge1xuXHRcdHRoaXMuX2dldEFsbEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKG9CbG9jazogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udGVudCA9IG9CbG9jay5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgb0Jsb2NrLmdldENvbnRlbnQoKTtcblx0XHRcdGlmIChvQ29udGVudCAmJiBvQ29udGVudC5pc0EgJiYgb0NvbnRlbnQuaXNBKFwic2FwLnVpLmxheW91dC5EeW5hbWljU2lkZUNvbnRlbnRcIikpIHtcblx0XHRcdFx0aWYgKG9Db250ZW50LnNldFNob3dTaWRlQ29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0b0NvbnRlbnQuc2V0U2hvd1NpZGVDb250ZW50KGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYXJ0IENvbnRleHQgaXMgcmVzb2x2ZWQgZm9yIDE6biBtaWNyb2NoYXJ0cy5cblx0ICpcblx0ICogQHBhcmFtIG9DaGFydENvbnRleHQgVGhlIENvbnRleHQgb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHBhcmFtIHNDaGFydFBhdGggVGhlIGNvbGxlY3Rpb25QYXRoIG9mIHRoZSB0aGUgY2hhcnRcblx0ICogQHJldHVybnMgQXJyYXkgb2YgQXR0cmlidXRlcyBvZiB0aGUgY2hhcnQgQ29udGV4dFxuXHQgKi9cblx0X2dldENoYXJ0Q29udGV4dERhdGEob0NoYXJ0Q29udGV4dDogYW55LCBzQ2hhcnRQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvQ2hhcnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGxldCBvQ2hhcnRDb250ZXh0RGF0YSA9IFtvQ29udGV4dERhdGFdO1xuXHRcdGlmIChvQ2hhcnRDb250ZXh0ICYmIHNDaGFydFBhdGgpIHtcblx0XHRcdGlmIChvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF0pIHtcblx0XHRcdFx0b0NoYXJ0Q29udGV4dERhdGEgPSBvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF07XG5cdFx0XHRcdGRlbGV0ZSBvQ29udGV4dERhdGFbc0NoYXJ0UGF0aF07XG5cdFx0XHRcdG9DaGFydENvbnRleHREYXRhLnB1c2gob0NvbnRleHREYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9DaGFydENvbnRleHREYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNjcm9sbCB0aGUgdGFibGVzIHRvIHRoZSByb3cgd2l0aCB0aGUgc1BhdGhcblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlQ29udHJvbGxlci5jb250cm9sbGVyI19zY3JvbGxUYWJsZXNUb1Jvd1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc1Jvd1BhdGggJ3NQYXRoIG9mIHRoZSB0YWJsZSByb3cnXG5cdCAqL1xuXG5cdF9zY3JvbGxUYWJsZXNUb1JvdyhzUm93UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuX2ZpbmRUYWJsZXMgJiYgdGhpcy5fZmluZFRhYmxlcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFUYWJsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0VGFibGVTY3JvbGxlci5zY3JvbGxUYWJsZVRvUm93KGFUYWJsZXNbaV0sIHNSb3dQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIG1lcmdlIHNlbGVjdGVkIGNvbnRleHRzIGFuZCBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX21lcmdlTXVsdGlwbGVDb250ZXh0c1xuXHQgKiBAcGFyYW0gb1BhZ2VDb250ZXh0IFBhZ2UgY29udGV4dFxuXHQgKiBAcGFyYW0gYUxpbmVDb250ZXh0IFNlbGVjdGVkIENvbnRleHRzXG5cdCAqIEBwYXJhbSBzQ2hhcnRQYXRoIENvbGxlY3Rpb24gbmFtZSBvZiB0aGUgY2hhcnRcblx0ICogQHJldHVybnMgU2VsZWN0aW9uIFZhcmlhbnQgT2JqZWN0XG5cdCAqL1xuXHRfbWVyZ2VNdWx0aXBsZUNvbnRleHRzKG9QYWdlQ29udGV4dDogQ29udGV4dCwgYUxpbmVDb250ZXh0OiBhbnlbXSwgc0NoYXJ0UGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IGFBdHRyaWJ1dGVzOiBhbnlbXSA9IFtdLFxuXHRcdFx0YVBhZ2VBdHRyaWJ1dGVzID0gW10sXG5cdFx0XHRvQ29udGV4dCxcblx0XHRcdHNNZXRhUGF0aExpbmU6IHN0cmluZyxcblx0XHRcdHNQYXRoTGluZTtcblxuXHRcdGNvbnN0IHNQYWdlUGF0aCA9IG9QYWdlQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9QYWdlQ29udGV4dCAmJiBvUGFnZUNvbnRleHQuZ2V0TW9kZWwoKSAmJiBvUGFnZUNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzTWV0YVBhdGhQYWdlID0gb01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYWdlUGF0aCkucmVwbGFjZSgvXlxcLyovLCBcIlwiKTtcblxuXHRcdC8vIEdldCBzaW5nbGUgbGluZSBjb250ZXh0IGlmIG5lY2Vzc2FyeVxuXHRcdGlmIChhTGluZUNvbnRleHQgJiYgYUxpbmVDb250ZXh0Lmxlbmd0aCkge1xuXHRcdFx0b0NvbnRleHQgPSBhTGluZUNvbnRleHRbMF07XG5cdFx0XHRzUGF0aExpbmUgPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRzTWV0YVBhdGhMaW5lID0gb01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoTGluZSkucmVwbGFjZSgvXlxcLyovLCBcIlwiKTtcblxuXHRcdFx0YUxpbmVDb250ZXh0LmZvckVhY2goKG9TaW5nbGVDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHNDaGFydFBhdGgpIHtcblx0XHRcdFx0XHRjb25zdCBvQ2hhcnRDb250ZXh0RGF0YSA9IHRoaXMuX2dldENoYXJ0Q29udGV4dERhdGEob1NpbmdsZUNvbnRleHQsIHNDaGFydFBhdGgpO1xuXHRcdFx0XHRcdGlmIChvQ2hhcnRDb250ZXh0RGF0YSkge1xuXHRcdFx0XHRcdFx0YUF0dHJpYnV0ZXMgPSBvQ2hhcnRDb250ZXh0RGF0YS5tYXAoZnVuY3Rpb24gKG9TdWJDaGFydENvbnRleHREYXRhOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0RGF0YTogb1N1YkNoYXJ0Q29udGV4dERhdGEsXG5cdFx0XHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBgJHtzTWV0YVBhdGhQYWdlfS8ke3NDaGFydFBhdGh9YFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFBdHRyaWJ1dGVzLnB1c2goe1xuXHRcdFx0XHRcdFx0Y29udGV4dERhdGE6IG9TaW5nbGVDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBzTWV0YVBhdGhMaW5lXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRhUGFnZUF0dHJpYnV0ZXMucHVzaCh7XG5cdFx0XHRjb250ZXh0RGF0YTogb1BhZ2VDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0ZW50aXR5U2V0OiBzTWV0YVBhdGhQYWdlXG5cdFx0fSk7XG5cdFx0Ly8gQWRkaW5nIFBhZ2UgQ29udGV4dCB0byBzZWxlY3Rpb24gdmFyaWFudFxuXHRcdGFQYWdlQXR0cmlidXRlcyA9IHRoaXMuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5yZW1vdmVTZW5zaXRpdmVEYXRhKGFQYWdlQXR0cmlidXRlcywgc01ldGFQYXRoUGFnZSk7XG5cdFx0Y29uc3Qgb1BhZ2VMZXZlbFNWID0gQ29tbW9uVXRpbHMuYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQobmV3IFNlbGVjdGlvblZhcmlhbnQoKSwgYVBhZ2VBdHRyaWJ1dGVzLCB0aGlzLmdldFZpZXcoKSk7XG5cdFx0YUF0dHJpYnV0ZXMgPSB0aGlzLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ucmVtb3ZlU2Vuc2l0aXZlRGF0YShhQXR0cmlidXRlcywgc01ldGFQYXRoUGFnZSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG9QYWdlTGV2ZWxTVixcblx0XHRcdGF0dHJpYnV0ZXM6IGFBdHRyaWJ1dGVzXG5cdFx0fTtcblx0fVxuXG5cdF9nZXRCYXRjaEdyb3Vwc0ZvclZpZXcoKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnksXG5cdFx0XHRvQ29uZmlndXJhdGlvbnMgPSBvVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24sXG5cdFx0XHRhQ29uZmlndXJhdGlvbnMgPSBvQ29uZmlndXJhdGlvbnMgJiYgT2JqZWN0LmtleXMob0NvbmZpZ3VyYXRpb25zKSxcblx0XHRcdGFCYXRjaEdyb3VwcyA9IFtcIiRhdXRvLkhlcm9lc1wiLCBcIiRhdXRvLkRlY29yYXRpb25cIiwgXCIkYXV0by5Xb3JrZXJzXCJdO1xuXG5cdFx0aWYgKGFDb25maWd1cmF0aW9ucyAmJiBhQ29uZmlndXJhdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0YUNvbmZpZ3VyYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IG9Db25maWd1cmF0aW9uc1tzS2V5XTtcblx0XHRcdFx0aWYgKG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkID09PSBcIkxvbmdSdW5uZXJzXCIpIHtcblx0XHRcdFx0XHRhQmF0Y2hHcm91cHMucHVzaChcIiRhdXRvLkxvbmdSdW5uZXJzXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFCYXRjaEdyb3Vwcztcblx0fVxuXG5cdC8qXG5cdCAqIFJlc2V0IEJyZWFkY3J1bWIgbGlua3Ncblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7c2FwLm0uQnJlYWRjcnVtYnN9IFtvU291cmNlXSBwYXJlbnQgY29udHJvbFxuXHQgKiBAZGVzY3JpcHRpb24gVXNlZCB3aGVuIGNvbnRleHQgb2YgdGhlIG9iamVjdCBwYWdlIGNoYW5nZXMuXG5cdCAqICAgICAgICAgICAgICBUaGlzIGV2ZW50IGNhbGxiYWNrIGlzIGF0dGFjaGVkIHRvIG1vZGVsQ29udGV4dENoYW5nZVxuXHQgKiAgICAgICAgICAgICAgZXZlbnQgb2YgdGhlIEJyZWFkY3J1bWIgY29udHJvbCB0byBjYXRjaCBjb250ZXh0IGNoYW5nZS5cblx0ICogICAgICAgICAgICAgIFRoZW4gZWxlbWVudCBiaW5kaW5nIGFuZCBocmVmcyBhcmUgdXBkYXRlZCBmb3IgZWFjaCBsaW5rLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGV4cGVyaW1lbnRhbFxuXHQgKi9cblx0YXN5bmMgX3NldEJyZWFkY3J1bWJMaW5rcyhvU291cmNlOiBCcmVhZENydW1icykge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0b0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdLFxuXHRcdFx0YVNraXBQYXJhbWV0ZXJpemVkOiBhbnlbXSA9IFtdLFxuXHRcdFx0c05ld1BhdGggPSBvQ29udGV4dD8uZ2V0UGF0aCgpLFxuXHRcdFx0YVBhdGhQYXJ0cyA9IHNOZXdQYXRoPy5zcGxpdChcIi9cIikgPz8gW10sXG5cdFx0XHRvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudCAmJiBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cdFx0dHJ5IHtcblx0XHRcdGFQYXRoUGFydHMuc2hpZnQoKTtcblx0XHRcdGFQYXRoUGFydHMuc3BsaWNlKC0xLCAxKTtcblx0XHRcdGFQYXRoUGFydHMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0c1BhdGggKz0gYC8ke3NQYXRoUGFydH1gO1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRcdFx0Y29uc3QgYlJlc3VsdENvbnRleHQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGFyYW1ldGVyUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0XHRcdGlmIChiUmVzdWx0Q29udGV4dCkge1xuXHRcdFx0XHRcdC8vIFdlIGRvbnQgbmVlZCB0byBjcmVhdGUgYSBicmVhZGNydW1iIGZvciBQYXJhbWV0ZXIgcGF0aFxuXHRcdFx0XHRcdGFTa2lwUGFyYW1ldGVyaXplZC5wdXNoKDEpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhU2tpcFBhcmFtZXRlcml6ZWQucHVzaCgwKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhUHJvbWlzZXMucHVzaChvUm9vdFZpZXdDb250cm9sbGVyLmdldFRpdGxlSW5mb0Zyb21QYXRoKHNQYXRoKSk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IHRpdGxlSGllcmFyY2h5SW5mb3M6IGFueVtdID0gYXdhaXQgUHJvbWlzZS5hbGwoYVByb21pc2VzKTtcblx0XHRcdGxldCBpZHgsIGhpZXJhcmNoeVBvc2l0aW9uLCBvTGluaztcblx0XHRcdGZvciAoY29uc3QgdGl0bGVIaWVyYXJjaHlJbmZvIG9mIHRpdGxlSGllcmFyY2h5SW5mb3MpIHtcblx0XHRcdFx0aGllcmFyY2h5UG9zaXRpb24gPSB0aXRsZUhpZXJhcmNoeUluZm9zLmluZGV4T2YodGl0bGVIaWVyYXJjaHlJbmZvKTtcblx0XHRcdFx0aWR4ID0gaGllcmFyY2h5UG9zaXRpb24gLSBhU2tpcFBhcmFtZXRlcml6ZWRbaGllcmFyY2h5UG9zaXRpb25dO1xuXHRcdFx0XHRvTGluayA9IG9Tb3VyY2UuZ2V0TGlua3MoKVtpZHhdID8gb1NvdXJjZS5nZXRMaW5rcygpW2lkeF0gOiBuZXcgTGluaygpO1xuXHRcdFx0XHQvL3NDdXJyZW50RW50aXR5IGlzIGEgZmFsbGJhY2sgdmFsdWUgaW4gY2FzZSBvZiBlbXB0eSB0aXRsZVxuXHRcdFx0XHRvTGluay5zZXRUZXh0KHRpdGxlSGllcmFyY2h5SW5mby5zdWJ0aXRsZSB8fCB0aXRsZUhpZXJhcmNoeUluZm8udGl0bGUpO1xuXHRcdFx0XHQvL1dlIGFwcGx5IGFuIGFkZGl0aW9uYWwgZW5jb2RlVVJJIGluIGNhc2Ugb2Ygc3BlY2lhbCBjaGFyYWN0ZXJzIChpZSBcIi9cIikgdXNlZCBpbiB0aGUgdXJsIHRocm91Z2ggdGhlIHNlbWFudGljIGtleXNcblx0XHRcdFx0b0xpbmsuc2V0SHJlZihlbmNvZGVVUkkodGl0bGVIaWVyYXJjaHlJbmZvLmludGVudCkpO1xuXHRcdFx0XHRpZiAoIW9Tb3VyY2UuZ2V0TGlua3MoKVtpZHhdKSB7XG5cdFx0XHRcdFx0b1NvdXJjZS5hZGRMaW5rKG9MaW5rKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHNldHRpbmcgdGhlIGJyZWFkY3J1bWIgbGlua3M6XCIgKyBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0X2NoZWNrRGF0YVBvaW50VGl0bGVGb3JFeHRlcm5hbE5hdmlnYXRpb24oKSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IG9EYXRhUG9pbnRzID0gQ29tbW9uVXRpbHMuZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKFxuXHRcdFx0b1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRPdXRib3VuZHMoKVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRjb25zdCBvUGFnZUNvbnRleHQgPSBvVmlldyAmJiAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJpc0hlYWRlckRQTGlua1Zpc2libGVcIiwge30pO1xuXHRcdGlmIChvUGFnZUNvbnRleHQpIHtcblx0XHRcdG9QYWdlQ29udGV4dFxuXHRcdFx0XHQucmVxdWVzdE9iamVjdCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvRGF0YTogYW55KSB7XG5cdFx0XHRcdFx0Zm5HZXRMaW5rcyhvRGF0YVBvaW50cywgb0RhdGEpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBsaW5rcyBmcm9tIHRoZSBzaGVsbCBzZXJ2aWNlXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvRXJyb3Jcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmbk9uRXJyb3Iob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihvRXJyb3IpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGZuU2V0TGlua0VuYWJsZW1lbnQoaWQ6IHN0cmluZywgYVN1cHBvcnRlZExpbmtzOiBhbnkpIHtcblx0XHRcdGNvbnN0IHNMaW5rSWQgPSBpZDtcblx0XHRcdC8vIHByb2Nlc3MgdmlhYmxlIGxpbmtzIGZyb20gZ2V0TGlua3MgZm9yIGFsbCBkYXRhcG9pbnRzIGhhdmluZyBvdXRib3VuZFxuXHRcdFx0aWYgKGFTdXBwb3J0ZWRMaW5rcyAmJiBhU3VwcG9ydGVkTGlua3MubGVuZ3RoID09PSAxICYmIGFTdXBwb3J0ZWRMaW5rc1swXS5zdXBwb3J0ZWQpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBpc0hlYWRlckRQTGlua1Zpc2libGUvJHtzTGlua0lkfWAsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvU3ViRGF0YVBvaW50c1xuXHRcdCAqIEBwYXJhbSBvUGFnZURhdGFcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmbkdldExpbmtzKG9TdWJEYXRhUG9pbnRzOiBhbnksIG9QYWdlRGF0YTogYW55KSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNJZCBpbiBvU3ViRGF0YVBvaW50cykge1xuXHRcdFx0XHRjb25zdCBvRGF0YVBvaW50ID0gb1N1YkRhdGFQb2ludHNbc0lkXTtcblx0XHRcdFx0Y29uc3Qgb1BhcmFtczogYW55ID0ge307XG5cdFx0XHRcdGNvbnN0IG9MaW5rID0gb1ZpZXcuYnlJZChzSWQpO1xuXHRcdFx0XHRpZiAoIW9MaW5rKSB7XG5cdFx0XHRcdFx0Ly8gZm9yIGRhdGEgcG9pbnRzIGNvbmZpZ3VyZWQgaW4gYXBwIGRlc2NyaXB0b3IgYnV0IG5vdCBhbm5vdGF0ZWQgaW4gdGhlIGhlYWRlclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG9MaW5rQ29udGV4dCA9IG9MaW5rLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IG9MaW5rRGF0YTogYW55ID0gb0xpbmtDb250ZXh0ICYmIG9MaW5rQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0bGV0IG9NaXhlZENvbnRleHQ6IGFueSA9IG1lcmdlKHt9LCBvUGFnZURhdGEsIG9MaW5rRGF0YSk7XG5cdFx0XHRcdC8vIHByb2Nlc3Mgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzXG5cdFx0XHRcdGlmIChvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0TWFwcGluZztcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGl0ZW0gaW4gYVNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01hcHBpbmcgPSBhU2VtYW50aWNPYmplY3RNYXBwaW5nW2l0ZW1dO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc01haW5Qcm9wZXJ0eSA9IG9NYXBwaW5nW1wiTG9jYWxQcm9wZXJ0eVwiXVtcIiRQcm9wZXJ0eVBhdGhcIl07XG5cdFx0XHRcdFx0XHRjb25zdCBzTWFwcGVkUHJvcGVydHkgPSBvTWFwcGluZ1tcIlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl07XG5cdFx0XHRcdFx0XHRpZiAoc01haW5Qcm9wZXJ0eSAhPT0gc01hcHBlZFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvTWl4ZWRDb250ZXh0Lmhhc093blByb3BlcnR5KHNNYWluUHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb05ld01hcHBpbmc6IGFueSA9IHt9O1xuXHRcdFx0XHRcdFx0XHRcdG9OZXdNYXBwaW5nW3NNYXBwZWRQcm9wZXJ0eV0gPSBvTWl4ZWRDb250ZXh0W3NNYWluUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0XHRcdG9NaXhlZENvbnRleHQgPSBtZXJnZSh7fSwgb01peGVkQ29udGV4dCwgb05ld01hcHBpbmcpO1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBvTWl4ZWRDb250ZXh0W3NNYWluUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9NaXhlZENvbnRleHQpIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb01peGVkQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihcIl9cIikgIT09IDAgJiYgc0tleS5pbmRleE9mKFwib2RhdGEuY29udGV4dFwiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtc1tzS2V5XSA9IG9NaXhlZENvbnRleHRbc0tleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHZhbGlkYXRlIGlmIGEgbGluayBtdXN0IGJlIHJlbmRlcmVkXG5cdFx0XHRcdG9TaGVsbFNlcnZpY2VzXG5cdFx0XHRcdFx0LmlzTmF2aWdhdGlvblN1cHBvcnRlZChbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogb0RhdGFQb2ludC5hY3Rpb25cblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0cGFyYW1zOiBvUGFyYW1zXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XHQudGhlbigoYUxpbmtzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZm5TZXRMaW5rRW5hYmxlbWVudChzSWQsIGFMaW5rcyk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZm5PbkVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHQvKipcblx0XHQgKiBJbnZva2VzIHRoZSBwYWdlIHByaW1hcnkgYWN0aW9uIG9uIHByZXNzIG9mIEN0cmwrRW50ZXIuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIHBhZ2UgY29udHJvbGxlclxuXHRcdCAqIEBwYXJhbSBvVmlld1xuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmNvbnRleHRzXSBNYW5kYXRvcnkgZm9yIGEgYm91bmQgYWN0aW9uLCBlaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyBmb3Igd2hpY2ggdGhlIGFjdGlvbiBpcyBjYWxsZWRcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOyBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uVmlzaWJsZV0gVGhlIHZpc2liaWxpdHkgb2Ygc2VtYXRpYyBwb3NpdGl2ZSBhY3Rpb25cblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uRW5hYmxlZF0gVGhlIGVuYWJsZW1lbnQgb2Ygc2VtYW50aWMgcG9zaXRpdmUgYWN0aW9uXG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9ucy5lZGl0QWN0aW9uVmlzaWJsZV0gVGhlIEVkaXQgYnV0dG9uIHZpc2liaWxpdHlcblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLmVkaXRBY3Rpb25FbmFibGVkXSBUaGUgZW5hYmxlbWVudCBvZiBFZGl0IGJ1dHRvblxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uUHJpbWFyeUFjdGlvbihcblx0XHRcdG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlcixcblx0XHRcdG9WaWV3OiBWaWV3LFxuXHRcdFx0b0NvbnRleHQ6IENvbnRleHQsXG5cdFx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdFx0bVBhcmFtZXRlcnM6IHVua25vd24sXG5cdFx0XHRtQ29uZGl0aW9uczoge1xuXHRcdFx0XHRwb3NpdGl2ZUFjdGlvblZpc2libGU6IGJvb2xlYW47XG5cdFx0XHRcdHBvc2l0aXZlQWN0aW9uRW5hYmxlZDogYm9vbGVhbjtcblx0XHRcdFx0ZWRpdEFjdGlvblZpc2libGU6IGJvb2xlYW47XG5cdFx0XHRcdGVkaXRBY3Rpb25FbmFibGVkOiBib29sZWFuO1xuXHRcdFx0fVxuXHRcdCkge1xuXHRcdFx0Y29uc3QgaVZpZXdMZXZlbCA9IChvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnZpZXdMZXZlbCxcblx0XHRcdFx0b09iamVjdFBhZ2UgPSBvQ29udHJvbGxlci5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGlmIChtQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvblZpc2libGUpIHtcblx0XHRcdFx0aWYgKG1Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uRW5hYmxlZCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLmhhbmRsZXJzLm9uQ2FsbEFjdGlvbihvVmlldywgc0FjdGlvbk5hbWUsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtQ29uZGl0aW9ucy5lZGl0QWN0aW9uVmlzaWJsZSkge1xuXHRcdFx0XHRpZiAobUNvbmRpdGlvbnMuZWRpdEFjdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdERvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpVmlld0xldmVsID09PSAxICYmIG9PYmplY3RQYWdlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRvQ29udHJvbGxlci5fc2F2ZURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH0gZWxzZSBpZiAob09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9hcHBseURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25UYWJsZUNvbnRleHRDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdFx0bGV0IG9UYWJsZTogYW55O1xuXHRcdFx0dGhpcy5fZmluZFRhYmxlcygpLnNvbWUoZnVuY3Rpb24gKF9vVGFibGU6IGFueSkge1xuXHRcdFx0XHRpZiAoX29UYWJsZS5nZXRSb3dCaW5kaW5nKCkgPT09IG9Tb3VyY2UpIHtcblx0XHRcdFx0XHRvVGFibGUgPSBfb1RhYmxlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBzZXQgY29ycmVjdCBiaW5kaW5nIGNvbnRleHQgZm9yIGZhc3QgY3JlYXRpb24gcm93XG5cdFx0XHRjb25zdCBmYXN0Q3JlYXRpb25Sb3cgPSBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKTtcblxuXHRcdFx0aWYgKGZhc3RDcmVhdGlvblJvdyAmJiAhZmFzdENyZWF0aW9uUm93Ll9vSW5uZXJDcmVhdGlvblJvdz8uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0XHRjb25zdCB0YWJsZUJpbmRpbmcgPSB0aGlzLl9nZXRUYWJsZUJpbmRpbmcob1RhYmxlKTtcblxuXHRcdFx0XHRpZiAoIXRhYmxlQmluZGluZykge1xuXHRcdFx0XHRcdExvZy5lcnJvcihgRXhwZWN0ZWQgYmluZGluZyBtaXNzaW5nIGZvciB0YWJsZTogJHtvVGFibGUuZ2V0SWQoKX1gKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGFibGVCaW5kaW5nLmdldENvbnRleHQoKSkge1xuXHRcdFx0XHRcdGNvbnN0IG9iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdFx0XHRcdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gb2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdFx0Y29uc3QgbW9kZWwgPSBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXG5cdFx0XHRcdFx0VGFibGVIZWxwZXIuZW5hYmxlRmFzdENyZWF0aW9uUm93KFxuXHRcdFx0XHRcdFx0ZmFzdENyZWF0aW9uUm93LFxuXHRcdFx0XHRcdFx0dGFibGVCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdHRhYmxlQmluZGluZy5nZXRDb250ZXh0KCksXG5cdFx0XHRcdFx0XHRtb2RlbCxcblx0XHRcdFx0XHRcdG9UYWJsZS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIilcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9DdXJyZW50QWN0aW9uUHJvbWlzZSA9IHRoaXMuZWRpdEZsb3cuZ2V0Q3VycmVudEFjdGlvblByb21pc2UoKTtcblxuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uUHJvbWlzZSkge1xuXHRcdFx0XHRsZXQgYVRhYmxlQ29udGV4dHM6IGFueTtcblx0XHRcdFx0aWYgKG9UYWJsZS5nZXRUeXBlKCkuZ2V0TWV0YWRhdGEoKS5pc0EoXCJzYXAudWkubWRjLnRhYmxlLkdyaWRUYWJsZVR5cGVcIikpIHtcblx0XHRcdFx0XHRhVGFibGVDb250ZXh0cyA9IG9Tb3VyY2UuZ2V0Q29udGV4dHMoMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVRhYmxlQ29udGV4dHMgPSBvU291cmNlLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vaWYgY29udGV4dHMgYXJlIG5vdCBmdWxseSBsb2FkZWQgdGhlIGdldGNvbnRleHRzIGZ1bmN0aW9uIGFib3ZlIHdpbGwgdHJpZ2dlciBhIG5ldyBjaGFuZ2UgZXZlbnQgY2FsbFxuXHRcdFx0XHRpZiAoIWFUYWJsZUNvbnRleHRzWzBdKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uUHJvbWlzZVxuXHRcdFx0XHRcdC50aGVuKChvQWN0aW9uUmVzcG9uc2U6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCFvQWN0aW9uUmVzcG9uc2UgfHwgb0FjdGlvblJlc3BvbnNlLmNvbnRyb2xJZCAhPT0gb1RhYmxlLnNJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBvQWN0aW9uRGF0YSA9IG9BY3Rpb25SZXNwb25zZS5vRGF0YTtcblx0XHRcdFx0XHRcdGNvbnN0IGFLZXlzID0gb0FjdGlvblJlc3BvbnNlLmtleXM7XG5cdFx0XHRcdFx0XHRsZXQgaU5ld0l0ZW1wID0gLTE7XG5cdFx0XHRcdFx0XHRhVGFibGVDb250ZXh0cy5maW5kKGZ1bmN0aW9uIChvVGFibGVDb250ZXh0OiBhbnksIGk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvVGFibGVEYXRhID0gb1RhYmxlQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYkNvbXBhcmUgPSBhS2V5cy5ldmVyeShmdW5jdGlvbiAoc0tleTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9UYWJsZURhdGFbc0tleV0gPT09IG9BY3Rpb25EYXRhW3NLZXldO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGJDb21wYXJlKSB7XG5cdFx0XHRcdFx0XHRcdFx0aU5ld0l0ZW1wID0gaTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYkNvbXBhcmU7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChpTmV3SXRlbXAgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFEaWFsb2dzID0gSW5zdGFuY2VNYW5hZ2VyLmdldE9wZW5EaWFsb2dzKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2cgPVxuXHRcdFx0XHRcdFx0XHRcdGFEaWFsb2dzLmxlbmd0aCA+IDAgPyBhRGlhbG9ncy5maW5kKChkaWFsb2cpID0+IGRpYWxvZy5kYXRhKFwiRnVsbFNjcmVlbkRpYWxvZ1wiKSAhPT0gdHJ1ZSkgOiBudWxsO1xuXHRcdFx0XHRcdFx0XHRpZiAob0RpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGJ5IGRlc2lnbiwgYSBzYXAubS5kaWFsb2cgc2V0IHRoZSBmb2N1cyB0byB0aGUgcHJldmlvdXMgZm9jdXNlZCBlbGVtZW50IHdoZW4gY2xvc2luZy5cblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgd2FpdCBmb3IgdGhlIGRpYWxvZyB0byBiZSBjbG9zZSBiZWZvcmUgdG8gZm9jdXMgYW5vdGhlciBlbGVtZW50XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5hdHRhY2hFdmVudE9uY2UoXCJhZnRlckNsb3NlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHRoaXMuZWRpdEZsb3cuZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihgQW4gZXJyb3Igb2NjdXJzIHdoaWxlIHNjcm9sbGluZyB0byB0aGUgbmV3bHkgY3JlYXRlZCBJdGVtOiAke2Vycn1gKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIGZpcmUgTW9kZWxDb250ZXh0Q2hhbmdlIG9uIHRoZSBtZXNzYWdlIGJ1dHRvbiB3aGVuZXZlciB0aGUgdGFibGUgY29udGV4dCBjaGFuZ2VzXG5cdFx0XHR0aGlzLm1lc3NhZ2VCdXR0b24uZmlyZU1vZGVsQ29udGV4dENoYW5nZSgpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbnZva2VzIGFuIGFjdGlvbiAtIGJvdW5kL3VuYm91bmQgYW5kIHNldHMgdGhlIHBhZ2UgZGlydHkuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb1ZpZXdcblx0XHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBjYWxsZWRcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jb250ZXh0c10gTWFuZGF0b3J5IGZvciBhIGJvdW5kIGFjdGlvbiwgZWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgY2FsbGVkXG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5tb2RlbF0gTWFuZGF0b3J5IGZvciBhbiB1bmJvdW5kIGFjdGlvbjsgYW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgVjQgbW9kZWxcblx0XHQgKiBAcmV0dXJucyBUaGUgYWN0aW9uIHByb21pc2Vcblx0XHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0XHQgKiBAZmluYWxcblx0XHQgKi9cblx0XHRvbkNhbGxBY3Rpb24ob1ZpZXc6IGFueSwgc0FjdGlvbk5hbWU6IHN0cmluZywgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIuZWRpdEZsb3dcblx0XHRcdFx0Lmludm9rZUFjdGlvbihzQWN0aW9uTmFtZSwgbVBhcmFtZXRlcnMpXG5cdFx0XHRcdC50aGVuKG9Db250cm9sbGVyLl9zaG93TWVzc2FnZVBvcG92ZXIuYmluZChvQ29udHJvbGxlciwgdW5kZWZpbmVkKSlcblx0XHRcdFx0LmNhdGNoKG9Db250cm9sbGVyLl9zaG93TWVzc2FnZVBvcG92ZXIuYmluZChvQ29udHJvbGxlcikpO1xuXHRcdH0sXG5cdFx0b25EYXRhUG9pbnRUaXRsZVByZXNzZWQob0NvbnRyb2xsZXI6IGFueSwgb1NvdXJjZTogYW55LCBvTWFuaWZlc3RPdXRib3VuZDogYW55LCBzQ29udHJvbENvbmZpZzogYW55LCBzQ29sbGVjdGlvblBhdGg6IGFueSkge1xuXHRcdFx0b01hbmlmZXN0T3V0Ym91bmQgPSB0eXBlb2Ygb01hbmlmZXN0T3V0Ym91bmQgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKG9NYW5pZmVzdE91dGJvdW5kKSA6IG9NYW5pZmVzdE91dGJvdW5kO1xuXHRcdFx0Y29uc3Qgb1RhcmdldEluZm8gPSBvTWFuaWZlc3RPdXRib3VuZFtzQ29udHJvbENvbmZpZ10sXG5cdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdE1hcHBpbmcob1RhcmdldEluZm8pLFxuXHRcdFx0XHRvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0XG5cdFx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHQuZ2V0TWV0YVBhdGgob0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0bGV0IGFOYXZpZ2F0aW9uRGF0YSA9IG9Db250cm9sbGVyLl9nZXRDaGFydENvbnRleHREYXRhKG9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHQsIHNDb2xsZWN0aW9uUGF0aCk7XG5cdFx0XHRsZXQgYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzO1xuXG5cdFx0XHRhTmF2aWdhdGlvbkRhdGEgPSBhTmF2aWdhdGlvbkRhdGEubWFwKGZ1bmN0aW9uIChvTmF2aWdhdGlvbkRhdGE6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGRhdGE6IG9OYXZpZ2F0aW9uRGF0YSxcblx0XHRcdFx0XHRtZXRhUGF0aDogc01ldGFQYXRoICsgKHNDb2xsZWN0aW9uUGF0aCA/IGAvJHtzQ29sbGVjdGlvblBhdGh9YCA6IFwiXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRcdGlmIChvVGFyZ2V0SW5mbyAmJiBvVGFyZ2V0SW5mby5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdGNvbnN0IG9QYXJhbXMgPSBvVGFyZ2V0SW5mby5wYXJhbWV0ZXJzICYmIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24uZ2V0T3V0Ym91bmRQYXJhbXMob1RhcmdldEluZm8ucGFyYW1ldGVycyk7XG5cdFx0XHRcdGlmIChPYmplY3Qua2V5cyhvUGFyYW1zKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1BhcmFtcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9UYXJnZXRJbmZvICYmIG9UYXJnZXRJbmZvLnNlbWFudGljT2JqZWN0ICYmIG9UYXJnZXRJbmZvLmFjdGlvbikge1xuXHRcdFx0XHRvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlKG9UYXJnZXRJbmZvLnNlbWFudGljT2JqZWN0LCBvVGFyZ2V0SW5mby5hY3Rpb24sIHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IGFOYXZpZ2F0aW9uRGF0YSxcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc6IGFTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdFx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnNcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUcmlnZ2VycyBhbiBvdXRib3VuZCBuYXZpZ2F0aW9uIHdoZW4gYSB1c2VyIGNob29zZXMgdGhlIGNoZXZyb24uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb0NvbnRyb2xsZXJcblx0XHQgKiBAcGFyYW0gc091dGJvdW5kVGFyZ2V0IE5hbWUgb2YgdGhlIG91dGJvdW5kIHRhcmdldCAobmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpXG5cdFx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdFx0ICogQHBhcmFtIHNDcmVhdGVQYXRoIENyZWF0ZSBwYXRoIHdoZW4gdGhlIGNoZXZyb24gaXMgY3JlYXRlZC5cblx0XHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkICg/Pz8gbWF5YmUgb25seSBvbmNlIGZpbmlzaGVkPylcblx0XHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0XHQgKiBAZmluYWxcblx0XHQgKi9cblx0XHRvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQob0NvbnRyb2xsZXI6IE9iamVjdFBhZ2VDb250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQ6IHN0cmluZywgb0NvbnRleHQ6IGFueSwgc0NyZWF0ZVBhdGg6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQsIG9Db250ZXh0LCBzQ3JlYXRlUGF0aCk7XG5cdFx0fSxcblxuXHRcdG9uTmF2aWdhdGVDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHQvL3dpbGwgYmUgY2FsbGVkIGFsd2F5cyB3aGVuIHdlIGNsaWNrIG9uIGEgc2VjdGlvbiB0YWJcblx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdHRoaXMuYlNlY3Rpb25OYXZpZ2F0ZWQgPSB0cnVlO1xuXG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvT2JqZWN0UGFnZS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgJiZcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5zZWN0aW9uTGF5b3V0ID09PSBcIlRhYnNcIiAmJlxuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiKSA9PT0gZmFsc2Vcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBvU3ViU2VjdGlvbiA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWJTZWN0aW9uXCIpO1xuXHRcdFx0XHR0aGlzLl91cGRhdGVGb2N1c0luRWRpdE1vZGUoW29TdWJTZWN0aW9uXSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTZWxlY3RlZDogZnVuY3Rpb24gKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTYXZlZDogZnVuY3Rpb24gKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0XHQvL1RPRE86IFNob3VsZCByZW1vdmUgdGhpcyBzZXRUaW1lT3V0IG9uY2UgVmFyaWFudCBNYW5hZ2VtZW50IHByb3ZpZGVzIGFuIGFwaSB0byBmZXRjaCB0aGUgY3VycmVudCB2YXJpYW50IGtleSBvbiBzYXZlXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdFx0fSwgMjAwMCk7XG5cdFx0fSxcblx0XHRuYXZpZ2F0ZVRvU3ViU2VjdGlvbjogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlciwgdkRldGFpbENvbmZpZzogYW55KSB7XG5cdFx0XHRjb25zdCBvRGV0YWlsQ29uZmlnID0gdHlwZW9mIHZEZXRhaWxDb25maWcgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEZXRhaWxDb25maWcpIDogdkRldGFpbENvbmZpZztcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQoXCJmZTo6T2JqZWN0UGFnZVwiKSBhcyBPYmplY3RQYWdlTGF5b3V0O1xuXHRcdFx0bGV0IG9TZWN0aW9uO1xuXHRcdFx0bGV0IG9TdWJTZWN0aW9uO1xuXHRcdFx0aWYgKG9EZXRhaWxDb25maWcuc2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRcdFx0XHRvU3ViU2VjdGlvbiA9IChcblx0XHRcdFx0XHRvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZFxuXHRcdFx0XHRcdFx0PyBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZClcblx0XHRcdFx0XHRcdDogb1NlY3Rpb24gJiYgb1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKSAmJiBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpWzBdXG5cdFx0XHRcdCkgYXMgT2JqZWN0UGFnZVN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2UgaWYgKG9EZXRhaWxDb25maWcuc3ViU2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TdWJTZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zdWJTZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTdWJTZWN0aW9uO1xuXHRcdFx0XHRvU2VjdGlvbiA9IG9TdWJTZWN0aW9uICYmIChvU3ViU2VjdGlvbi5nZXRQYXJlbnQoKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9TZWN0aW9uIHx8ICFvU3ViU2VjdGlvbiB8fCAhb1NlY3Rpb24uZ2V0VmlzaWJsZSgpIHx8ICFvU3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0Y29uc3Qgc1RpdGxlID0gZ2V0UmVzb3VyY2VNb2RlbChvQ29udHJvbGxlcikuZ2V0VGV4dChcblx0XHRcdFx0XHRcIkNfUk9VVElOR19OQVZJR0FUSU9OX0RJU0FCTEVEX1RJVExFXCIsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRMb2cuZXJyb3Ioc1RpdGxlKTtcblx0XHRcdFx0TWVzc2FnZUJveC5lcnJvcihzVGl0bGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2Nyb2xsVG9TZWN0aW9uKG9TdWJTZWN0aW9uLmdldElkKCkpO1xuXHRcdFx0XHQvLyB0cmlnZ2VyIGlhcHAgc3RhdGUgY2hhbmdlXG5cdFx0XHRcdG9PYmplY3RQYWdlLmZpcmVOYXZpZ2F0ZSh7XG5cdFx0XHRcdFx0c2VjdGlvbjogb1NlY3Rpb24sXG5cdFx0XHRcdFx0c3ViU2VjdGlvbjogb1N1YlNlY3Rpb25cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9uU3RhdGVDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIpIHtcblx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHR9LFxuXHRcdGNsb3NlT1BNZXNzYWdlU3RyaXA6IGZ1bmN0aW9uICh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS5oaWRlTWVzc2FnZSgpO1xuXHRcdH1cblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0UGFnZUNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUE2RE1BLG9CQUFvQixXQUR6QkMsY0FBYyxDQUFDLGtEQUFrRCxDQUFDLFVBSWpFQyxjQUFjLENBQUNDLFdBQVcsQ0FBQyxVQUczQkQsY0FBYyxDQUFDRSxLQUFLLENBQUNDLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDLENBQUMsVUFHOUNKLGNBQWMsQ0FBQ0ssZUFBZSxDQUFDRixRQUFRLENBQUNHLHVCQUF1QixDQUFDLENBQUMsVUFHakVOLGNBQWMsQ0FBQ08sU0FBUyxDQUFDSixRQUFRLENBQUNLLGlCQUFpQixDQUFDLENBQUMsVUFHckRSLGNBQWMsQ0FBQ1MsY0FBYyxDQUFDTixRQUFRLENBQUNPLHNCQUFzQixDQUFDLENBQUMsVUFHL0RWLGNBQWMsQ0FBQ1cscUJBQXFCLENBQUNSLFFBQVEsQ0FBQ1MsNkJBQTZCLENBQUMsQ0FBQyxVQUc3RVosY0FBYyxDQUNkYSw2QkFBNkIsQ0FBQ1YsUUFBUSxDQUFDO0lBQ3RDVyxpQkFBaUIsRUFBRSxZQUErQztNQUNqRSxNQUFNQyxpQkFBaUIsR0FDckIsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ0MsYUFBYSxFQUFFLENBQTBCQyxpQkFBaUIsSUFDekUsSUFBSSxDQUFDRixPQUFPLEVBQUUsQ0FBQ0MsYUFBYSxFQUFFLENBQTBCQyxpQkFBaUIsRUFBRTtNQUM3RSxPQUFPSCxpQkFBaUIsR0FBRyxTQUFTLEdBQUdJLFNBQVM7SUFDakQ7RUFDRCxDQUFDLENBQUMsQ0FD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QyxDQUFDO2tCQUMzQkEsV0FBVyxDQUFDRixlQUFlLENBQUMsR0FBR0osYUFBYSxDQUFDRyxhQUFhLENBQUM7a0JBQzNESCxhQUFhLEdBQUdDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRUQsYUFBYSxFQUFFTSxXQUFXLENBQUM7a0JBQ3JELE9BQU9OLGFBQWEsQ0FBQ0csYUFBYSxDQUFDO2dCQUNwQztjQUNEO1lBQ0Q7VUFDRDtVQUVBLElBQUlILGFBQWEsRUFBRTtZQUNsQixLQUFLLE1BQU14ZSxJQUFJLElBQUl3ZSxhQUFhLEVBQUU7Y0FDakMsSUFBSXhlLElBQUksQ0FBQ3VVLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUl2VSxJQUFJLENBQUN1VSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BFaFMsT0FBTyxDQUFDdkMsSUFBSSxDQUFDLEdBQUd3ZSxhQUFhLENBQUN4ZSxJQUFJLENBQUM7Y0FDcEM7WUFDRDtVQUNEO1VBQ0E7VUFDQTBkLGNBQWMsQ0FDWnFCLHFCQUFxQixDQUFDLENBQ3RCO1lBQ0N6SyxNQUFNLEVBQUU7Y0FDUDNSLGNBQWMsRUFBRTBiLFVBQVUsQ0FBQzFiLGNBQWM7Y0FDekNDLE1BQU0sRUFBRXliLFVBQVUsQ0FBQ3piO1lBQ3BCLENBQUM7WUFDRG9jLE1BQU0sRUFBRXpjO1VBQ1QsQ0FBQyxDQUNELENBQUMsQ0FDRHZELElBQUksQ0FBRWlnQixNQUFNLElBQUs7WUFDakIsT0FBT25CLG1CQUFtQixDQUFDM2UsR0FBRyxFQUFFOGYsTUFBTSxDQUFDO1VBQ3hDLENBQUMsQ0FBQyxDQUNEdGUsS0FBSyxDQUFDa2QsU0FBUyxDQUFDO1FBQ25CO01BQ0Q7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQTF3Q2lDdlYsY0FBYztJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQStoRGxDL08sb0JBQW9CO0FBQUEifQ==