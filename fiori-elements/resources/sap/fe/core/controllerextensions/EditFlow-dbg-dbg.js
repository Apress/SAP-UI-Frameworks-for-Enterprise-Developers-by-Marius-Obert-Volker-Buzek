/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/editFlow/TransactionHelper", "sap/fe/core/controllerextensions/Feedback", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "../ActionRuntime"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, draft, sticky, TransactionHelper, Feedback, MetaModelConverter, ClassSupport, EditState, MetaModelFunction, ModelHelper, ResourceModelHelper, SemanticKeyHelper, FELibrary, Button, Dialog, MessageToast, Text, Core, coreLibrary, Message, ControllerExtension, OverrideExecution, ODataListBinding, ActionRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _class, _class2;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getNonComputedVisibleFields = MetaModelFunction.getNonComputedVisibleFields;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertTypes = MetaModelConverter.convertTypes;
  var TriggerType = Feedback.TriggerType;
  var triggerConfiguredSurvey = Feedback.triggerConfiguredSurvey;
  var StandardActions = Feedback.StandardActions;
  var shareObject = CollaborationCommon.shareObject;
  var Activity = CollaborationCommon.Activity;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const CreationMode = FELibrary.CreationMode,
    ProgrammingModel = FELibrary.ProgrammingModel,
    Constants = FELibrary.Constants,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    StartupMode = FELibrary.StartupMode,
    MessageType = coreLibrary.MessageType;

  /**
   * A controller extension offering hooks into the edit flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  let EditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.EditFlow"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = finalExtension(), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(EditFlow, _ControllerExtension);
    function EditFlow() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call(this, ...args) || this;
      _this.syncTasks = Promise.resolve();
      return _this;
    }
    var _proto = EditFlow.prototype;
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    _proto.getAppComponent = function getAppComponent() {
      return this.base.getAppComponent();
    }

    /**
     * Creates a draft document for an existing active document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext Context of the active document
     * @returns Promise resolves once the editable document is available
     * @alias sap.fe.core.controllerextensions.EditFlow#editDocument
     * @public
     * @since 1.90.0
     */;
    _proto.editDocument = async function editDocument(oContext) {
      const bDraftNavigation = true;
      const transactionHelper = this.getTransactionHelper();
      const oRootViewController = this._getRootViewController();
      const model = oContext.getModel();
      let rightmostContext, siblingInfo;
      const oViewData = this.getView().getViewData();
      const sProgrammingModel = this.getProgrammingModel(oContext);
      let oRootContext = oContext;
      const oView = this.getView();
      try {
        if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
          if (sProgrammingModel === ProgrammingModel.Draft) {
            const draftRootPath = ModelHelper.getDraftRootPath(oContext);
            oRootContext = oView.getModel().bindContext(draftRootPath).getBoundContext();
            await oRootContext.requestObject(draftRootPath);
          } else if (sProgrammingModel === ProgrammingModel.Sticky) {
            const sStickyRootPath = ModelHelper.getStickyRootPath(oContext);
            oRootContext = oView.getModel().bindContext(sStickyRootPath).getBoundContext();
            await oRootContext.requestObject(sStickyRootPath);
          }
        }
        await this.base.editFlow.onBeforeEdit({
          context: oRootContext
        });
        const oNewDocumentContext = await transactionHelper.editDocument(oRootContext, this.getView(), this.getAppComponent(), this.getMessageHandler());
        this._setStickySessionInternalProperties(sProgrammingModel, model);
        if (oNewDocumentContext) {
          this.setEditMode(EditMode.Editable, false);
          this.setDocumentModified(false);
          this.getMessageHandler().showMessageDialog();
          if (oNewDocumentContext !== oRootContext) {
            let contextToNavigate = oNewDocumentContext;
            if (this._isFclEnabled()) {
              rightmostContext = oRootViewController.getRightmostContext();
              siblingInfo = await this._computeSiblingInformation(oRootContext, rightmostContext, sProgrammingModel, true);
              siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oNewDocumentContext);
              this._updatePathsInHistory(siblingInfo.pathMapping);
              if (siblingInfo.targetContext.getPath() != oNewDocumentContext.getPath()) {
                contextToNavigate = siblingInfo.targetContext;
              }
            } else if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
              siblingInfo = await this._computeSiblingInformation(oRootContext, oContext, sProgrammingModel, true);
              contextToNavigate = this._getNavigationTargetForEdit(oContext, oNewDocumentContext, siblingInfo);
            }
            await this._handleNewContext(contextToNavigate, true, false, bDraftNavigation, true);
            if (sProgrammingModel === ProgrammingModel.Sticky) {
              // The stickyOn handler must be set after the navigation has been done,
              // as the URL may change in the case of FCL
              let stickyContext;
              if (this._isFclEnabled()) {
                // We need to use the kept-alive context used to bind the page
                stickyContext = oNewDocumentContext.getModel().getKeepAliveContext(oNewDocumentContext.getPath());
              } else {
                stickyContext = oNewDocumentContext;
              }
              this.handleStickyOn(stickyContext);
            } else if (ModelHelper.isCollaborationDraftSupported(model.getMetaModel())) {
              // according to UX in case of enabled collaboration draft we share the object immediately
              await shareObject(oNewDocumentContext);
            }
          }
        }
      } catch (oError) {
        Log.error("Error while editing the document", oError);
      }
    }

    /**
     * Deletes several documents.
     *
     * @param contextsToDelete The contexts of the documents to delete
     * @param parameters The parameters
     * @returns Promise resolved once the documents are deleted
     */;
    _proto.deleteMultipleDocuments = async function deleteMultipleDocuments(contextsToDelete, parameters) {
      if (parameters) {
        parameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      } else {
        parameters = {
          beforeDeleteCallBack: this.base.editFlow.onBeforeDelete
        };
      }
      const lockObject = this.getGlobalUIModel();
      const parentControl = this.getView().byId(parameters.controlId);
      if (!parentControl) {
        throw new Error("parameter controlId missing or incorrect");
      } else {
        parameters.parentControl = parentControl;
      }
      const listBinding = parentControl.getBinding("items") || parentControl.getRowBinding();
      parameters.bFindActiveContexts = true;
      BusyLocker.lock(lockObject);
      try {
        await this.deleteDocumentTransaction(contextsToDelete, parameters);
        let result;

        // Multiple object deletion is triggered from a list
        // First clear the selection in the table as it's not valid any more
        if (parentControl.isA("sap.ui.mdc.Table")) {
          parentControl.clearSelection();
        }

        // Then refresh the list-binding (LR), or require side-effects (OP)
        const viewBindingContext = this.getView().getBindingContext();
        if (listBinding.isRoot()) {
          // keep promise chain pending until refresh of listbinding is completed
          result = new Promise(resolve => {
            listBinding.attachEventOnce("dataReceived", function () {
              resolve();
            });
          });
          listBinding.refresh();
        } else if (viewBindingContext) {
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (!CommonUtils.hasTransientContext(listBinding)) {
            this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), viewBindingContext);
          }
        }

        // deleting at least one object should also set the UI to dirty
        if (!this.getAppComponent()._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        ActivitySync.send(this.getView(), Activity.Delete, contextsToDelete.map(context => context.getPath()));
        return result;
      } catch (error) {
        Log.error("Error while deleting the document(s)", error);
      } finally {
        BusyLocker.unlock(lockObject);
      }
    }

    /**
     * Updates the draft status and displays the error messages if there are errors during an update.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param updatedContext Context of the updated field
     * @param updatePromise Promise to determine when the update operation is completed. The promise should be resolved when the update operation is completed, so the draft status can be updated.
     * @returns Promise resolves once draft status has been updated
     * @alias sap.fe.core.controllerextensions.EditFlow#updateDocument
     * @public
     * @since 1.90.0
     */;
    _proto.updateDocument = function updateDocument(updatedContext, updatePromise) {
      const originalBindingContext = this.getView().getBindingContext();
      const isDraft = this.getProgrammingModel(updatedContext) === ProgrammingModel.Draft;
      this.getMessageHandler().removeTransitionMessages();
      return this.syncTask(async () => {
        if (originalBindingContext) {
          this.setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (isDraft) {
            this.setDraftStatus(DraftStatus.Saving);
          }
        }
        try {
          await updatePromise;
          const currentBindingContext = this.getView().getBindingContext();
          if (!isDraft || !currentBindingContext || currentBindingContext !== originalBindingContext) {
            // If a navigation happened while oPromise was being resolved, the binding context of the page changed
            return;
          }

          // We're still on the same context
          const metaModel = currentBindingContext.getModel().getMetaModel();
          const entitySetName = metaModel.getMetaContext(currentBindingContext.getPath()).getObject("@sapui.name");
          const semanticKeys = SemanticKeyHelper.getSemanticKeys(metaModel, entitySetName);
          if (semanticKeys !== null && semanticKeys !== void 0 && semanticKeys.length) {
            const currentSemanticMapping = this._getSemanticMapping();
            const currentSemanticPath = currentSemanticMapping === null || currentSemanticMapping === void 0 ? void 0 : currentSemanticMapping.semanticPath,
              sChangedPath = SemanticKeyHelper.getSemanticPath(currentBindingContext, true);
            // currentSemanticPath could be null if we have navigated via deep link then there are no semanticMappings to calculate it from
            if (currentSemanticPath && currentSemanticPath !== sChangedPath) {
              await this._handleNewContext(currentBindingContext, true, false, true);
            }
          }
          this.setDraftStatus(DraftStatus.Saved);
        } catch (error) {
          Log.error("Error while updating the document", error);
          if (isDraft && originalBindingContext) {
            this.setDraftStatus(DraftStatus.Clear);
          }
        } finally {
          await this.getMessageHandler().showMessages();
        }
      });
    }

    // Internal only params ---
    // * @param {string} mParameters.creationMode The creation mode using one of the following:
    // *                    Sync - the creation is triggered and once the document is created, the navigation is done
    // *                    Async - the creation and the navigation to the instance are done in parallel
    // *                    Deferred - the creation is done on the target page
    // *                    CreationRow - The creation is done inline async so the user is not blocked
    // mParameters.creationRow Instance of the creation row - (TODO: get rid but use list bindings only)

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param vListBinding  ODataListBinding object or the binding path for a temporary list binding
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.creationMode The creation mode using one of the following:
     *                    NewPage - the created document is shown in a new page, depending on whether metadata 'Sync', 'Async' or 'Deferred' is used
     *                    Inline - The creation is done inline (in a table)
     *                    External - The creation is done in a different application specified via the parameter 'outbound'
     * @param mInParameters.tableId ID of the table
     * @param mInParameters.outbound The navigation target where the document is created in case of creationMode 'External'
     * @param mInParameters.createAtEnd Specifies if the new entry should be created at the top or bottom of a table in case of creationMode 'Inline'
     * @returns Promise resolves once the object has been created
     * @alias sap.fe.core.controllerextensions.EditFlow#createDocument
     * @public
     * @since 1.90.0
     */;
    _proto.createDocument = async function createDocument(vListBinding, mInParameters) {
      var _oCreation;
      const transactionHelper = this.getTransactionHelper(),
        oLockObject = this.getGlobalUIModel();
      let oTable; //should be Table but there are missing methods into the def
      let mParameters = mInParameters;
      let oCreation;
      const bShouldBusyLock = !mParameters || mParameters.creationMode !== CreationMode.Inline && mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.External;
      let oExecCustomValidation = Promise.resolve([]);
      const oAppComponent = this.getAppComponent();
      oAppComponent.getRouterProxy().removeIAppStateKey();
      if (mParameters.creationMode === CreationMode.External) {
        // Create by navigating to an external target
        // TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
        await this.syncTask();
        const oController = this.getView().getController();
        const sCreatePath = ModelHelper.getAbsoluteMetaPathForListBinding(this.getView(), vListBinding);
        oController.handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined, sCreatePath);
        return;
      }
      if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
        const oCreationRowObjects = mParameters.creationRow.getBindingContext().getObject();
        delete oCreationRowObjects["@$ui5.context.isTransient"];
        oTable = mParameters.creationRow.getParent();
        oExecCustomValidation = this.validateDocument(oTable.getBindingContext(), {
          data: oCreationRowObjects,
          customValidationFunction: oTable.getCreationRow().data("customValidationFunction")
        });

        // disableAddRowButtonForEmptyData is set to false in manifest converter (Table.ts) if customValidationFunction exists
        if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
          const oInternalModelContext = oTable.getBindingContext("internal");
          oInternalModelContext.setProperty("creationRowFieldValidity", {});
        }
      }
      if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
        oTable = this.getView().byId(mParameters.tableId);
      }
      if (oTable && oTable.isA("sap.ui.mdc.Table")) {
        const fnFocusOrScroll = mParameters.creationMode === CreationMode.Inline ? oTable.focusRow.bind(oTable) : oTable.scrollToIndex.bind(oTable);
        oTable.getRowBinding().attachEventOnce("change", async function () {
          await oCreation;
          fnFocusOrScroll(mParameters.createAtEnd ? oTable.getRowBinding().getLength() : 0, true);
        });
      }
      const handleSideEffects = async (oListBinding, oCreationPromise) => {
        try {
          const oNewContext = await oCreationPromise;
          // transient contexts are reliably removed once oNewContext.created() is resolved
          await oNewContext.created();
          const oBindingContext = this.getView().getBindingContext();
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (!CommonUtils.hasTransientContext(oListBinding)) {
            const appComponent = this.getAppComponent();
            appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
          }
        } catch (oError) {
          Log.error("Error while creating the document", oError);
        }
      };

      /**
       * @param aValidationMessages Error messages from custom validation function
       */
      const createCustomValidationMessages = aValidationMessages => {
        var _oTable$getBindingCon;
        const sCustomValidationFunction = oTable && oTable.getCreationRow().data("customValidationFunction");
        const mCustomValidity = oTable && ((_oTable$getBindingCon = oTable.getBindingContext("internal")) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getProperty("creationRowCustomValidity"));
        const oMessageManager = Core.getMessageManager();
        const aCustomMessages = [];
        let oFieldControl;
        let sTarget;

        // Remove existing CustomValidation message
        oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
          if (oMessage.code === sCustomValidationFunction) {
            oMessageManager.removeMessages(oMessage);
          }
        });
        aValidationMessages.forEach(oValidationMessage => {
          // Handle Bound CustomValidation message
          if (oValidationMessage.messageTarget) {
            var _oFieldControl$getBin;
            oFieldControl = Core.getControl(mCustomValidity[oValidationMessage.messageTarget].fieldId);
            sTarget = `${(_oFieldControl$getBin = oFieldControl.getBindingContext()) === null || _oFieldControl$getBin === void 0 ? void 0 : _oFieldControl$getBin.getPath()}/${oFieldControl.getBindingPath("value")}`;
            // Add validation message if still not exists
            if (oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            }).length === 0) {
              oMessageManager.addMessages(new Message({
                message: oValidationMessage.messageText,
                processor: this.getView().getModel(),
                type: MessageType.Error,
                code: sCustomValidationFunction,
                technical: false,
                persistent: false,
                target: sTarget
              }));
            }
            // Add controlId in order to get the focus handling of the error popover runable
            const aExistingValidationMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            });
            aExistingValidationMessages[0].addControlId(mCustomValidity[oValidationMessage.messageTarget].fieldId);

            // Handle Unbound CustomValidation message
          } else {
            aCustomMessages.push({
              code: sCustomValidationFunction,
              text: oValidationMessage.messageText,
              persistent: true,
              type: MessageType.Error
            });
          }
        });
        if (aCustomMessages.length > 0) {
          this.getMessageHandler().showMessageDialog({
            customMessages: aCustomMessages
          });
        }
      };
      const resolveCreationMode = (initialCreationMode, programmingModel, oListBinding, oMetaModel) => {
        if (initialCreationMode && initialCreationMode !== CreationMode.NewPage) {
          // use the passed creation mode
          return initialCreationMode;
        } else {
          // NewAction is not yet supported for NavigationProperty collection
          if (!oListBinding.isRelative()) {
            const sPath = oListBinding.getPath(),
              // if NewAction with parameters is present, then creation is 'Deferred'
              // in the absence of NewAction or NewAction with parameters, creation is async
              sNewAction = programmingModel === ProgrammingModel.Draft ? oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`);
            if (sNewAction) {
              const aParameters = oMetaModel.getObject(`/${sNewAction}/@$ui5.overload/0/$Parameter`) || [];
              // binding parameter (eg: _it) is not considered
              if (aParameters.length > 1) {
                return CreationMode.Deferred;
              }
            }
          }
          const sMetaPath = oMetaModel.getMetaPath(oListBinding === null || oListBinding === void 0 ? void 0 : oListBinding.getHeaderContext().getPath());
          const aNonComputedVisibleKeyFields = getNonComputedVisibleFields(oMetaModel, sMetaPath, this.getAppComponent());
          if (aNonComputedVisibleKeyFields.length > 0) {
            return CreationMode.Deferred;
          }
          return CreationMode.Async;
        }
      };
      if (bShouldBusyLock) {
        BusyLocker.lock(oLockObject);
      }
      try {
        const aValidationMessages = await this.syncTask(oExecCustomValidation);
        if (aValidationMessages.length > 0) {
          createCustomValidationMessages(aValidationMessages);
          Log.error("Custom Validation failed");
          // if custom validation fails, we leave the method immediately
          return;
        }
        let oListBinding;
        mParameters = mParameters || {};
        if (vListBinding && typeof vListBinding === "object") {
          // we already get a list binding use this one
          oListBinding = vListBinding;
        } else if (typeof vListBinding === "string") {
          oListBinding = new ODataListBinding(this.getView().getModel(), vListBinding);
          mParameters.creationMode = CreationMode.Sync;
          delete mParameters.createAtEnd;
        } else {
          throw new Error("Binding object or path expected");
        }
        const oModel = oListBinding.getModel();
        const sProgrammingModel = this.getProgrammingModel(oListBinding);
        const resolvedCreationMode = resolveCreationMode(mParameters.creationMode, sProgrammingModel, oListBinding, oModel.getMetaModel());
        let mArgs;
        const oCreationRow = mParameters.creationRow;
        let oCreationRowContext;
        let oPayload;
        let sMetaPath;
        const oMetaModel = oModel.getMetaModel();
        const oRoutingListener = this.getInternalRouting();
        if (resolvedCreationMode !== CreationMode.Deferred) {
          if (resolvedCreationMode === CreationMode.CreationRow) {
            oCreationRowContext = oCreationRow.getBindingContext();
            sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
            // prefill data from creation row
            oPayload = oCreationRowContext.getObject();
            mParameters.data = {};
            Object.keys(oPayload).forEach(function (sPropertyPath) {
              const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
              // ensure navigation properties are not part of the payload, deep create not supported
              if (oProperty && oProperty.$kind === "NavigationProperty") {
                return;
              }
              mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
            });
            await this._checkForValidationErrors( /*oCreationRowContext*/);
          }
          if (resolvedCreationMode === CreationMode.CreationRow || resolvedCreationMode === CreationMode.Inline) {
            var _oTable, _oTable$getParent, _oTable$getParent$get;
            mParameters.keepTransientContextOnFailed = false; // currently not fully supported
            // busy handling shall be done locally only
            mParameters.busyMode = "Local";
            mParameters.busyId = (_oTable = oTable) === null || _oTable === void 0 ? void 0 : (_oTable$getParent = _oTable.getParent()) === null || _oTable$getParent === void 0 ? void 0 : (_oTable$getParent$get = _oTable$getParent.getTableDefinition()) === null || _oTable$getParent$get === void 0 ? void 0 : _oTable$getParent$get.annotation.id;

            // take care on message handling, draft indicator (in case of draft)
            // Attach the create sent and create completed event to the object page binding so that we can react
            this.handleCreateEvents(oListBinding);
          }
          if (!mParameters.parentControl) {
            mParameters.parentControl = this.getView();
          }
          mParameters.beforeCreateCallBack = this.onBeforeCreate;

          // In case the application was called with preferredMode=autoCreateWith, we want to skip the
          // action parameter dialog
          mParameters.skipParameterDialog = oAppComponent.getStartupMode() === StartupMode.AutoCreate;
          oCreation = transactionHelper.createDocument(oListBinding, mParameters, this.getAppComponent(), this.getMessageHandler(), false);
          // SideEffects on Create
          // if Save is pressed directly after filling the CreationRow, no SideEffects request
          if (!mParameters.bSkipSideEffects) {
            handleSideEffects(oListBinding, oCreation);
          }
        }
        let oNavigation;
        switch (resolvedCreationMode) {
          case CreationMode.Deferred:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              bDeferredContext: true,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Async:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              asyncContext: oCreation,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Sync:
            mArgs = {
              editable: true,
              bForceFocus: true
            };
            if (sProgrammingModel == ProgrammingModel.Sticky || mParameters.createAction) {
              mArgs.transient = true;
            }
            oNavigation = (_oCreation = oCreation) === null || _oCreation === void 0 ? void 0 : _oCreation.then(function (oNewDocumentContext) {
              if (!oNewDocumentContext) {
                const coreResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                return oRoutingListener.navigateToMessagePage(coreResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
                  title: coreResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
                  description: coreResourceBundle.getText("C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION")
                });
              } else {
                // In case the Sync creation was triggered for a deferred creation, we don't navigate forward
                // as we're already on the corresponding ObjectPage
                return mParameters.bFromDeferred ? oRoutingListener.navigateToContext(oNewDocumentContext, mArgs) : oRoutingListener.navigateForwardToContext(oNewDocumentContext, mArgs);
              }
            });
            break;
          case CreationMode.Inline:
            this.syncTask(oCreation);
            break;
          case CreationMode.CreationRow:
            // the creation row shall be cleared once the validation check was successful and
            // therefore the POST can be sent async to the backend
            try {
              const oCreationRowListBinding = oCreationRowContext.getBinding();
              const oNewTransientContext = oCreationRowListBinding.create();
              oCreationRow.setBindingContext(oNewTransientContext);

              // this is needed to avoid console errors TO be checked with model colleagues
              oNewTransientContext.created().catch(function () {
                Log.trace("transient fast creation context deleted");
              });
              oNavigation = oCreationRowContext.delete("$direct");
            } catch (oError) {
              // Reset busy indicator after a validation error
              if (BusyLocker.isLocked(this.getView().getModel("ui"))) {
                BusyLocker.unlock(this.getView().getModel("ui"));
              }
              Log.error("CreationRow navigation error: ", oError);
            }
            break;
          default:
            oNavigation = Promise.reject(`Unhandled creationMode ${resolvedCreationMode}`);
            break;
        }
        if (oCreation) {
          try {
            const aParams = await Promise.all([oCreation, oNavigation]);
            this._setStickySessionInternalProperties(sProgrammingModel, oModel);
            this.setEditMode(EditMode.Editable); // The createMode flag will be set in computeEditMode
            if (!oListBinding.isRelative() && sProgrammingModel === ProgrammingModel.Sticky) {
              var _entitySet$annotation, _entitySet$annotation2;
              // Workaround to tell the OP that we've created a new object from the LR
              const metaModel = oListBinding.getModel().getMetaModel();
              const metaContext = metaModel.bindContext(metaModel.getMetaPath(oListBinding.getPath()));
              const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet;
              const newAction = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Session) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.StickySessionSupported) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.NewAction;
              this.getInternalModel().setProperty("/lastInvokedAction", newAction);
            }
            const oNewDocumentContext = aParams[0];
            if (oNewDocumentContext) {
              this.setDocumentModifiedOnCreate(oListBinding);
              if (!this._isFclEnabled()) {
                EditState.setEditStateDirty();
              }
              this._sendActivity(Activity.Create, oNewDocumentContext);
              if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel()) && !ActivitySync.isConnected(this.getView())) {
                // according to UX in case of enabled collaboration draft we share the object immediately
                await shareObject(oNewDocumentContext);
              }
            }
          } catch (error) {
            // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
            if (error === Constants.CancelActionDialog || error === Constants.ActionExecutionFailed || error === Constants.CreationFailed) {
              // creation has been cancelled by user or failed in backend => in case we have navigated to transient context before, navigate back
              // the switch-statement above seems to indicate that this happens in creationModes deferred and async. But in fact, in these cases after the navigation from routeMatched in OP component
              // createDeferredContext is triggerd, which calls this method (createDocument) again - this time with creationMode sync. Therefore, also in that mode we need to trigger back navigation.
              // The other cases might still be needed in case the navigation fails.
              if (resolvedCreationMode === CreationMode.Sync || resolvedCreationMode === CreationMode.Deferred || resolvedCreationMode === CreationMode.Async) {
                oRoutingListener.navigateBackFromTransientState();
              }
            }
            throw error;
          }
        }
      } finally {
        if (bShouldBusyLock) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    /**
     * Validates a document.
     *
     * @returns Promise resolves with result of the custom validation function
     */;
    _proto.validateDocument = function validateDocument(context, parameters) {
      return this.getTransactionHelper().validateDocument(context, parameters, this.getView());
    }

    /**
     * Creates several documents.
     *
     * @param listBinding The listBinding used to create the documents
     * @param dataForCreate The initial data for the new documents
     * @param createAtEnd True if the new contexts need to be crated at the end of the list binding
     * @param isFromCopyPaste True if the creation has been triggered by a paste action
     * @param beforeCreateCallBack Callback to be called before the creation
     * @param createAsInactive True if the contexts need to be created inactive
     * @returns A Promise with the newly created contexts.
     */;
    _proto.createMultipleDocuments = async function createMultipleDocuments(listBinding, dataForCreate, createAtEnd, isFromCopyPaste, beforeCreateCallBack) {
      let createAsInactive = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      const transactionHelper = this.getTransactionHelper();
      const lockObject = this.getGlobalUIModel();
      const targetListBinding = listBinding;
      BusyLocker.lock(lockObject);
      try {
        await this.syncTask();
        if (beforeCreateCallBack) {
          await beforeCreateCallBack({
            contextPath: targetListBinding.getPath()
          });
        }
        const metaModel = targetListBinding.getModel().getMetaModel();
        let metaPath;
        if (targetListBinding.getContext()) {
          metaPath = metaModel.getMetaPath(`${targetListBinding.getContext().getPath()}/${targetListBinding.getPath()}`);
        } else {
          metaPath = metaModel.getMetaPath(targetListBinding.getPath());
        }
        this.handleCreateEvents(targetListBinding);

        // Iterate on all items and store the corresponding creation promise
        const creationPromises = dataForCreate.map(propertyValues => {
          const createParameters = {
            data: {}
          };
          createParameters.keepTransientContextOnFailed = false; // currently not fully supported
          createParameters.busyMode = "None";
          createParameters.creationMode = CreationMode.CreationRow;
          createParameters.parentControl = this.getView();
          createParameters.createAtEnd = createAtEnd;
          createParameters.inactive = createAsInactive;

          // Remove navigation properties as we don't support deep create
          for (const propertyPath in propertyValues) {
            const property = metaModel.getObject(`${metaPath}/${propertyPath}`);
            if (property && property.$kind !== "NavigationProperty" && propertyPath.indexOf("/") < 0 && propertyValues[propertyPath]) {
              createParameters.data[propertyPath] = propertyValues[propertyPath];
            }
          }
          return transactionHelper.createDocument(targetListBinding, createParameters, this.getAppComponent(), this.getMessageHandler(), isFromCopyPaste);
        });
        const createdContexts = await Promise.all(creationPromises);
        if (!createAsInactive) {
          this.setDocumentModifiedOnCreate(targetListBinding);
        }
        // transient contexts are reliably removed once oNewContext.created() is resolved
        await Promise.all(createdContexts.map(newContext => {
          if (!newContext.bInactive) {
            return newContext.created();
          }
        }));
        const viewBindingContext = this.getView().getBindingContext();

        // if there are transient contexts, we must avoid requesting side effects
        // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
        // if list binding is refreshed, transient contexts might be lost
        if (!CommonUtils.hasTransientContext(targetListBinding)) {
          this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(targetListBinding.getPath(), viewBindingContext);
        }
        return createdContexts;
      } catch (err) {
        Log.error("Error while creating multiple documents.");
        throw err;
      } finally {
        BusyLocker.unlock(lockObject);
      }
    }

    /**
     * This function can be used to intercept the 'Save' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Save' action.
     * If you reject the promise, the 'Save' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeSave
     * @param _mParameters.context Page context that is going to be saved.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Save' action is triggered. If rejected, the 'Save' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeSave
     * @public
     * @since 1.90.0
     */;
    _proto.onBeforeSave = function onBeforeSave(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Create' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Create' action.
     * If you reject the promise, the 'Create' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeCreate
     * @param _mParameters.contextPath Path pointing to the context on which Create action is triggered
     * @param _mParameters.createParameters Array of values that are filled in the Action Parameter Dialog
     * @returns A promise to be returned by the overridden method. If resolved, the 'Create' action is triggered. If rejected, the 'Create' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeCreate
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeCreate = function onBeforeCreate(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Edit' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Edit' action.
     * If you reject the promise, the 'Edit' action is stopped and the user stays in display mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeEdit
     * @param _mParameters.context Page context that is going to be edited.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Edit' action is triggered. If rejected, the 'Edit' action is not triggered and the user stays in display mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeEdit
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeEdit = function onBeforeEdit(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Discard' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Discard' action.
     * If you reject the promise, the 'Discard' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDiscard
     * @param _mParameters.context Page context that is going to be discarded.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Discard' action is triggered. If rejected, the 'Discard' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDiscard
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDiscard = function onBeforeDiscard(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Delete' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Delete' action.
     * If you reject the promise, the 'Delete' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDelete
     * @param _mParameters.contexts An array of contexts that are going to be deleted
     * @returns A promise to be returned by the overridden method. If resolved, the 'Delete' action is triggered. If rejected, the 'Delete' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDelete
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDelete = function onBeforeDelete(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    // Internal only params ---
    // @param {boolean} mParameters.bExecuteSideEffectsOnError Indicates whether SideEffects need to be ignored when user clicks on Save during an Inline creation
    // @param {object} mParameters.bindings List bindings of the tables in the view.
    // Both of the above parameters are for the same purpose. User can enter some information in the creation row(s) but does not 'Add row', instead clicks Save.
    // There can be more than one in the view.

    /**
     * Saves a new document after checking it.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters PRIVATE
     * @returns Promise resolves once save is complete
     * @alias sap.fe.core.controllerextensions.EditFlow#saveDocument
     * @public
     * @since 1.90.0
     */;
    _proto.saveDocument = async function saveDocument(oContext, mParameters) {
      mParameters = mParameters || {};
      const bExecuteSideEffectsOnError = mParameters.bExecuteSideEffectsOnError || undefined;
      const bDraftNavigation = true;
      const transactionHelper = this.getTransactionHelper();
      const aBindings = mParameters.bindings;
      try {
        await this.syncTask();
        await this._submitOpenChanges(oContext);
        await this._checkForValidationErrors();
        await this.base.editFlow.onBeforeSave({
          context: oContext
        });
        const sProgrammingModel = this.getProgrammingModel(oContext);
        const oRootViewController = this._getRootViewController();
        let siblingInfo;
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && oRootViewController.isFclEnabled()) {
          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const activeDocumentContext = await transactionHelper.saveDocument(oContext, this.getAppComponent(), this._getResourceModel(), bExecuteSideEffectsOnError, aBindings, this.getMessageHandler(), this.getCreationMode());
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this._sendActivity(Activity.Activate, activeDocumentContext);
        ActivitySync.disconnect(this.getView());
        this._triggerConfiguredSurvey(StandardActions.save, TriggerType.standardAction);
        this.setDocumentModified(false);
        this.setEditMode(EditMode.Display, false);
        this.getMessageHandler().showMessageDialog();
        if (activeDocumentContext !== oContext) {
          let contextToNavigate = activeDocumentContext;
          if (oRootViewController.isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, activeDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== activeDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
        }
      } catch (oError) {
        if (!(oError && oError.canceled)) {
          Log.error("Error while saving the document", oError);
        }
        throw oError;
      }
    }

    /**
     * Switches the UI between draft and active document.
     *
     * @param oContext The context to switch from
     * @returns Promise resolved once the switch is done
     */;
    _proto.toggleDraftActive = async function toggleDraftActive(oContext) {
      const oContextData = oContext.getObject();
      let bEditable;
      const bIsDraft = oContext && this.getProgrammingModel(oContext) === ProgrammingModel.Draft;

      //toggle between draft and active document is only available for edit drafts and active documents with draft)
      if (!bIsDraft || !(!oContextData.IsActiveEntity && oContextData.HasActiveEntity || oContextData.IsActiveEntity && oContextData.HasDraftEntity)) {
        return;
      }
      if (!oContextData.IsActiveEntity && oContextData.HasActiveEntity) {
        //start Point: edit draft
        bEditable = false;
      } else {
        // start point active document
        bEditable = true;
      }
      try {
        const oRootViewController = this._getRootViewController();
        const oRightmostContext = oRootViewController.isFclEnabled() ? oRootViewController.getRightmostContext() : oContext;
        let siblingInfo = await this._computeSiblingInformation(oContext, oRightmostContext, ProgrammingModel.Draft, false);
        if (!siblingInfo && oContext !== oRightmostContext) {
          // Try to compute sibling info for the root context if it fails for the rightmost context
          // --> In case of FCL, if we try to switch between draft and active but a child entity has no sibling, the switch will close the child column
          siblingInfo = await this._computeSiblingInformation(oContext, oContext, ProgrammingModel.Draft, false);
        }
        if (siblingInfo) {
          this.setEditMode(bEditable ? EditMode.Editable : EditMode.Display, false); //switch to edit mode only if a draft is available

          if (oRootViewController.isFclEnabled()) {
            const lastSemanticMapping = this._getSemanticMapping();
            if ((lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === oContext.getPath()) {
              const targetPath = siblingInfo.pathMapping[siblingInfo.pathMapping.length - 1].newPath;
              siblingInfo.pathMapping.push({
                oldPath: lastSemanticMapping.semanticPath,
                newPath: targetPath
              });
            }
            this._updatePathsInHistory(siblingInfo.pathMapping);
          }
          await this._handleNewContext(siblingInfo.targetContext, bEditable, true, true, true);
        } else {
          throw new Error("Error in EditFlow.toggleDraftActive - Cannot find sibling");
        }
      } catch (oError) {
        throw new Error(`Error in EditFlow.toggleDraftActive:${oError}`);
      }
    }

    // Internal only params ---
    // @param {sap.m.Button} mParameters.cancelButton - Currently this is passed as cancelButton internally (replaced by mParameters.control in the JSDoc below). Currently it is also mandatory.
    // Plan - This should not be mandatory. If not provided, we should have a default that can act as reference control for the discard popover OR we can show a dialog instead of a popover.

    /**
     * Discard the editable document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters Can contain the following attributes:
     * @param mParameters.control This is the control used to open the discard popover
     * @param mParameters.skipDiscardPopover Optional, supresses the discard popover and allows custom handling
     * @returns Promise resolves once editable document has been discarded
     * @alias sap.fe.core.controllerextensions.EditFlow#cancelDocument
     * @public
     * @since 1.90.0
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mParameters) {
      const transactionHelper = this.getTransactionHelper();
      const mInParameters = mParameters;
      let siblingInfo;
      let isNewDocument = false;
      mInParameters.cancelButton = mParameters.control || mInParameters.cancelButton;
      mInParameters.beforeCancelCallBack = this.base.editFlow.onBeforeDiscard;
      try {
        await this.syncTask();
        const sProgrammingModel = this.getProgrammingModel(oContext);
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && this._isFclEnabled()) {
          const oRootViewController = this._getRootViewController();

          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const cancelResult = await transactionHelper.cancelDocument(oContext, mInParameters, this.getAppComponent(), this._getResourceModel(), this.getMessageHandler(), this.getCreationMode(), this.isDocumentModified());
        const bDraftNavigation = true;
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this.setEditMode(EditMode.Display, false);
        this.setDocumentModified(false);
        this.setDraftStatus(DraftStatus.Clear);
        // we force the edit state even for FCL because the draft discard might not be implemented
        // and we may just delete the draft
        EditState.setEditStateDirty();
        if (!cancelResult) {
          this._sendActivity(Activity.Discard, undefined);
          ActivitySync.disconnect(this.getView());
          //in case of a new document, no activeContext is returned --> navigate back.
          if (!mInParameters.skipBackNavigation) {
            await this.getInternalRouting().navigateBackFromContext(oContext);
            isNewDocument = true;
          }
        } else {
          const oActiveDocumentContext = cancelResult;
          this._sendActivity(Activity.Discard, oActiveDocumentContext);
          ActivitySync.disconnect(this.getView());
          let contextToNavigate = oActiveDocumentContext;
          if (this._isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oActiveDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== oActiveDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          if (sProgrammingModel === ProgrammingModel.Draft) {
            // We need to load the semantic keys of the active context, as we need them
            // for the navigation
            await this._fetchSemanticKeyValues(oActiveDocumentContext);
            // We force the recreation of the context, so that it's created and bound in the same microtask,
            // so that all properties are loaded together by autoExpandSelect, so that when switching back to Edit mode
            // $$inheritExpandSelect takes all loaded properties into account (BCP 2070462265)
            if (!mInParameters.skipBindingToView) {
              await this._handleNewContext(contextToNavigate, false, true, bDraftNavigation, true);
            } else {
              return oActiveDocumentContext;
            }
          } else {
            //active context is returned in case of cancel of existing document
            await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
          }
        }
        this.showDocumentDiscardMessage(isNewDocument);
      } catch (oError) {
        Log.error("Error while discarding the document", oError);
      }
    }

    /**
     * Brings up a message toast when a draft is discarded.
     *
     * @param isNewDocument This is a Boolean flag that determines whether the document is new or it is an existing document.
     */;
    _proto.showDocumentDiscardMessage = function showDocumentDiscardMessage(isNewDocument) {
      const resourceModel = this._getResourceModel();
      const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
      if (isNewDocument == true) {
        const appComponent = this.getAppComponent();
        appComponent.getRoutingService().attachAfterRouteMatched(this.showMessageWhenNoContext, this);
      } else {
        MessageToast.show(message);
      }
    }

    /**
     * We use this function in showDocumentDiscardMessage when no context is passed.
     */;
    _proto.showMessageWhenNoContext = function showMessageWhenNoContext() {
      const resourceModel = this._getResourceModel();
      const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
      const appComponent = this.getAppComponent();
      MessageToast.show(message);
      appComponent.getRoutingService().detachAfterRouteMatched(this.showMessageWhenNoContext, this);
    }
    /**
     * Checks if a context corresponds to a draft root.
     *
     * @param context The context to check
     * @returns True if the context points to a draft root
     * @private
     */;
    _proto.isDraftRoot = function isDraftRoot(context) {
      const metaModel = context.getModel().getMetaModel();
      const metaContext = metaModel.getMetaContext(context.getPath());
      return ModelHelper.isDraftRoot(getInvolvedDataModelObjects(metaContext).targetEntitySet);
    }

    // Internal only params ---
    // @param {string} mParameters.entitySetName Name of the EntitySet to which the object belongs

    /**
     * Deletes the document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @param mInParameters Can contain the following attributes:
     * @param mInParameters.title Title of the object being deleted
     * @param mInParameters.description Description of the object being deleted
     * @returns Promise resolves once document has been deleted
     * @alias sap.fe.core.controllerextensions.EditFlow#deleteDocument
     * @public
     * @since 1.90.0
     */;
    _proto.deleteDocument = async function deleteDocument(oContext, mInParameters) {
      const oAppComponent = this.getAppComponent();
      let mParameters = mInParameters;
      if (!mParameters) {
        mParameters = {
          bFindActiveContexts: false
        };
      } else {
        mParameters.bFindActiveContexts = false;
      }
      mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      try {
        if (this._isFclEnabled() && this.isDraftRoot(oContext) && oContext.getIndex() === undefined && oContext.getProperty("IsActiveEntity") === true && oContext.getProperty("HasDraftEntity") === true) {
          // Deleting an active entity which has a draft that could potentially be displayed in the ListReport (FCL case)
          // --> need to remove the draft from the LR and replace it with the active version, so that the ListBinding is properly refreshed
          // The condition 'oContext.getIndex() === undefined' makes sure the active version isn't already displayed in the LR
          mParameters.beforeDeleteCallBack = async parameters => {
            await this.base.editFlow.onBeforeDelete(parameters);
            try {
              const model = oContext.getModel();
              const siblingContext = model.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
              const draftPath = await siblingContext.requestCanonicalPath();
              const draftContextToRemove = model.getKeepAliveContext(draftPath);
              draftContextToRemove.replaceWith(oContext);
            } catch (error) {
              Log.error("Error while replacing the draft instance in the LR ODLB", error);
            }
          };
        }
        await this.deleteDocumentTransaction(oContext, mParameters);

        // Single objet deletion is triggered from an OP header button (not from a list)
        // --> Mark UI dirty and navigate back to dismiss the OP
        if (!this._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        this._sendActivity(Activity.Delete, oContext);

        // After delete is successfull, we need to detach the setBackNavigation Methods
        if (oAppComponent) {
          oAppComponent.getShellServices().setBackNavigation();
        }
        if ((oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getStartupMode()) === StartupMode.Deeplink && !this._isFclEnabled()) {
          // In case the app has been launched with semantic keys, deleting the object we've landed on shall navigate back
          // to the app we came from (except for FCL, where we navigate to LR as usual)
          oAppComponent.getRouterProxy().exitFromApp();
        } else {
          this.getInternalRouting().navigateBackFromContext(oContext);
        }
      } catch (error) {
        Log.error("Error while deleting the document", error);
      }
    }

    /**
     * Submit the current set of changes and navigate back.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @returns Promise resolves once the changes have been saved
     * @alias sap.fe.core.controllerextensions.EditFlow#applyDocument
     * @public
     * @since 1.90.0
     */;
    _proto.applyDocument = async function applyDocument(oContext) {
      const oLockObject = this.getGlobalUIModel();
      BusyLocker.lock(oLockObject);
      try {
        await this.syncTask();
        await this._submitOpenChanges(oContext);
        await this._checkForValidationErrors();
        await this.getMessageHandler().showMessageDialog();
        await this.getInternalRouting().navigateBackFromContext(oContext);
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    // Internal only params ---
    // @param {boolean} [mParameters.bStaticAction] Boolean value for static action, undefined for other actions
    // @param {boolean} [mParameters.isNavigable] Boolean value indicating whether navigation is required after the action has been executed
    // Currently the parameter isNavigable is used internally and should be changed to requiresNavigation as it is a more apt name for this param

    /**
     * Invokes an action (bound or unbound) and tracks the changes so that other pages can be refreshed and show the updated data upon navigation.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action to be called
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.parameterValues A map of action parameter names and provided values
     * @param mInParameters.parameterValues.name Name of the parameter
     * @param mInParameters.parameterValues.value Value of the parameter
     * @param mInParameters.skipParameterDialog Skips the action parameter dialog if values are provided for all of them in parameterValues
     * @param mInParameters.contexts For a bound action, a context or an array with contexts for which the action is to be called must be provided
     * @param mInParameters.model For an unbound action, an instance of an OData V4 model must be provided
     * @param mInParameters.requiresNavigation Boolean value indicating whether navigation is required after the action has been executed. Navigation takes place to the context returned by the action
     * @param mInParameters.label A human-readable label for the action. This is needed in case the action has a parameter and a parameter dialog is shown to the user. The label will be used for the title of the dialog and for the confirmation button
     * @param mInParameters.invocationGrouping Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param mExtraParams PRIVATE
     * @returns A promise which resolves once the action has been executed, providing the response
     * @alias sap.fe.core.controllerextensions.EditFlow#invokeAction
     * @public
     * @since 1.90.0
     * @final
     */;
    _proto.invokeAction = async function invokeAction(sActionName, mInParameters, mExtraParams) {
      var _this$getView$getMode;
      let oControl;
      const transactionHelper = this.getTransactionHelper();
      let aParts;
      let sOverloadEntityType;
      let oCurrentActionCallBacks;
      const oView = this.getView();
      let mParameters = mInParameters || {};
      // Due to a mistake the invokeAction in the extensionAPI had a different API than this one.
      // The one from the extensionAPI doesn't exist anymore as we expose the full edit flow now but
      // due to compatibility reasons we still need to support the old signature
      if (mParameters.isA && mParameters.isA("sap.ui.model.odata.v4.Context") || Array.isArray(mParameters) || mExtraParams !== undefined) {
        const contexts = mParameters;
        mParameters = mExtraParams || {};
        if (contexts) {
          mParameters.contexts = contexts;
        } else {
          mParameters.model = this.getView().getModel();
        }
      }
      mParameters.isNavigable = mParameters.requiresNavigation || mParameters.isNavigable;

      // Determine if the referenced action is bound or unbound
      const convertedMetadata = convertTypes((_this$getView$getMode = this.getView().getModel()) === null || _this$getView$getMode === void 0 ? void 0 : _this$getView$getMode.getMetaModel());
      // The EntityContainer may NOT be missing, so it should not be able to be undefined, but since in our converted Metadata
      // it can be undefined, I need this workaround here of adding "" since indexOf does not accept something that's
      // undefined.
      if (sActionName.indexOf("" + convertedMetadata.entityContainer.name) > -1) {
        // Unbound actions are always referenced via the action import and we found the EntityContainer in the sActionName so
        // an unbound action is referenced!
        mParameters.isBound = false;
      } else {
        // No entity container in the sActionName, so either a bound or static action is referenced which is also bound!
        mParameters.isBound = true;
      }
      if (!mParameters.parentControl) {
        mParameters.parentControl = this.getView();
      }
      if (mParameters.controlId) {
        oControl = this.getView().byId(mParameters.controlId);
        if (oControl) {
          // TODO: currently this selected contexts update is done within the operation, should be moved out
          mParameters.internalModelContext = oControl.getBindingContext("internal");
        }
      } else {
        mParameters.internalModelContext = oView.getBindingContext("internal");
      }
      if (sActionName && sActionName.indexOf("(") > -1) {
        // get entity type of action overload and remove it from the action path
        // Example sActionName = "<ActionName>(Collection(<OverloadEntityType>))"
        // sActionName = aParts[0] --> <ActionName>
        // sOverloadEntityType = aParts[2] --> <OverloadEntityType>
        aParts = sActionName.split("(");
        sActionName = aParts[0];
        sOverloadEntityType = aParts[aParts.length - 1].replaceAll(")", "");
      }
      if (mParameters.bStaticAction) {
        if (oControl.isTableBound()) {
          mParameters.contexts = oControl.getRowBinding().getHeaderContext();
        } else {
          const sBindingPath = oControl.data("rowsBindingInfo").path,
            oListBinding = new ODataListBinding(this.getView().getModel(), sBindingPath);
          mParameters.contexts = oListBinding.getHeaderContext();
        }
        if (sOverloadEntityType && oControl.getBindingContext()) {
          mParameters.contexts = this._getActionOverloadContextFromMetadataPath(oControl.getBindingContext(), oControl.getRowBinding(), sOverloadEntityType);
        }
        if (mParameters.enableAutoScroll) {
          oCurrentActionCallBacks = this.createActionPromise(sActionName, oControl.sId);
        }
      }
      mParameters.bGetBoundContext = this._getBoundContext(oView, mParameters);
      // Need to know that the action is called from ObjectPage for changeSet Isolated workaround
      mParameters.bObjectPage = oView.getViewData().converterType === "ObjectPage";
      try {
        await this.syncTask();
        const oResponse = await transactionHelper.callAction(sActionName, mParameters, this.getView(), this.getAppComponent(), this.getMessageHandler());
        let listRefreshed;
        if (mParameters.contexts && mParameters.isBound === true) {
          listRefreshed = await this._refreshListIfRequired(this.getActionResponseDataAndKeys(sActionName, oResponse), mParameters.contexts[0]);
        }
        if (ActivitySync.isConnected(this.getView())) {
          let actionRequestedProperties = [];
          if (oResponse) {
            actionRequestedProperties = Array.isArray(oResponse) ? Object.keys(oResponse[0].value.getObject()) : Object.keys(oResponse.getObject());
          }
          this._sendActivity(Activity.Action, mParameters.contexts, sActionName, listRefreshed, actionRequestedProperties);
        }
        this._triggerConfiguredSurvey(sActionName, TriggerType.action);
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fResolver(oResponse);
        }
        /*
        		We set the (upper) pages to dirty after an execution of an action
        		TODO: get rid of this workaround
        		This workaround is only needed as long as the model does not support the synchronization.
        		Once this is supported we don't need to set the pages to dirty anymore as the context itself
        		is already refreshed (it's just not reflected in the object page)
        		we explicitly don't call this method from the list report but only call it from the object page
        		as if it is called in the list report it's not needed - as we anyway will remove this logic
        		we can live with this
        		we need a context to set the upper pages to dirty - if there are more than one we use the
        		first one as they are anyway siblings
        		*/
        if (mParameters.contexts) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this.getInternalModel().setProperty("/lastInvokedAction", sActionName);
        }
        if (mParameters.isNavigable) {
          let vContext = oResponse;
          if (Array.isArray(vContext) && vContext.length === 1) {
            vContext = vContext[0].value;
          }
          if (vContext && !Array.isArray(vContext)) {
            const oMetaModel = oView.getModel().getMetaModel();
            const sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
            const _fnValidContexts = (contexts, applicableContexts) => {
              return contexts.filter(element => {
                if (applicableContexts) {
                  return applicableContexts.indexOf(element) > -1;
                }
                return true;
              });
            };
            const oActionContext = Array.isArray(mParameters.contexts) ? _fnValidContexts(mParameters.contexts, mParameters.applicableContexts)[0] : mParameters.contexts;
            const sActionContextMetaPath = oActionContext && oMetaModel.getMetaPath(oActionContext.getPath());
            if (sContextMetaPath != undefined && sContextMetaPath === sActionContextMetaPath) {
              if (oActionContext.getPath() !== vContext.getPath()) {
                this.getInternalRouting().navigateForwardToContext(vContext, {
                  checkNoHashChange: true,
                  noHistoryEntry: false
                });
              } else {
                Log.info("Navigation to the same context is not allowed");
              }
            }
          }
        }
        return oResponse;
      } catch (err) {
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fRejector();
        }
        // FIXME: in most situations there is no handler for the rejected promises returnedq
        if (err === Constants.CancelActionDialog) {
          // This leads to console error. Actually the error is already handled (currently directly in press handler of end button in dialog), so it should not be forwarded
          // up to here. However, when dialog handling and backend execution are separated, information whether dialog was cancelled, or backend execution has failed needs
          // to be transported to the place responsible for connecting these two things.
          // TODO: remove special handling one dialog handling and backend execution are separated
          throw new Error("Dialog cancelled");
        } else if (!(err && (err.canceled || err.rejectedItems && err.rejectedItems[0].canceled))) {
          // TODO: analyze, whether this is of the same category as above
          throw new Error(`Error in EditFlow.invokeAction:${err}`);
        }
        // TODO: Any unexpected errors probably should not be ignored!
      }
    }

    /**
     * Secured execution of the given function. Ensures that the function is only executed when certain conditions are fulfilled.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param fnFunction The function to be executed. Should return a promise that is settled after completion of the execution. If nothing is returned, immediate completion is assumed.
     * @param mParameters Definitions of the preconditions to be checked before execution
     * @param mParameters.busy Defines the busy indicator
     * @param mParameters.busy.set Triggers a busy indicator when the function is executed.
     * @param mParameters.busy.check Executes function only if application isn't busy.
     * @param mParameters.updatesDocument This operation updates the current document without using the bound model and context. As a result, the draft status is updated if a draft document exists, and the user has to confirm the cancellation of the editing process.
     * @returns A promise that is rejected if the execution is prohibited and resolved by the promise returned by the fnFunction.
     * @alias sap.fe.core.controllerextensions.EditFlow#securedExecution
     * @public
     * @since 1.90.0
     */;
    _proto.securedExecution = function securedExecution(fnFunction, mParameters) {
      var _mParameters$busy, _mParameters$busy2;
      const bBusySet = (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$busy = mParameters.busy) === null || _mParameters$busy === void 0 ? void 0 : _mParameters$busy.set) ?? true,
        bBusyCheck = (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$busy2 = mParameters.busy) === null || _mParameters$busy2 === void 0 ? void 0 : _mParameters$busy2.check) ?? true,
        bUpdatesDocument = (mParameters === null || mParameters === void 0 ? void 0 : mParameters.updatesDocument) ?? false,
        oLockObject = this.getGlobalUIModel(),
        oContext = this.getView().getBindingContext(),
        bIsDraft = oContext && this.getProgrammingModel(oContext) === ProgrammingModel.Draft;
      if (bBusyCheck && BusyLocker.isLocked(oLockObject)) {
        return Promise.reject("Application already busy therefore execution rejected");
      }

      // we have to set busy and draft indicator immediately also the function might be executed later in queue
      if (bBusySet) {
        BusyLocker.lock(oLockObject);
      }
      if (bUpdatesDocument && bIsDraft) {
        this.setDraftStatus(DraftStatus.Saving);
      }
      this.getMessageHandler().removeTransitionMessages();
      return this.syncTask(fnFunction).then(() => {
        if (bUpdatesDocument) {
          this.setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (bIsDraft) {
            this.setDraftStatus(DraftStatus.Saved);
          }
        }
      }).catch(oError => {
        if (bUpdatesDocument && bIsDraft) {
          this.setDraftStatus(DraftStatus.Clear);
        }
        return Promise.reject(oError);
      }).finally(() => {
        if (bBusySet) {
          BusyLocker.unlock(oLockObject);
        }
        this.getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Handles the patchSent event: register document modification.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handlePatchSent = function handlePatchSent(oEvent) {
      var _this$getView, _this$getView$getBind;
      // In collaborative draft, disable ETag check for PATCH requests
      const isInCollaborativeDraft = ActivitySync.isConnected(this.getView());
      if (isInCollaborativeDraft) {
        oEvent.getSource().getModel().setIgnoreETag(true);
      }
      if (!((_this$getView = this.getView()) !== null && _this$getView !== void 0 && (_this$getView$getBind = _this$getView.getBindingContext("internal")) !== null && _this$getView$getBind !== void 0 && _this$getView$getBind.getProperty("skipPatchHandlers"))) {
        const sourceBinding = oEvent.getSource();
        // Create a promise that will be resolved or rejected when the path is completed
        const oPatchPromise = new Promise((resolve, reject) => {
          oEvent.getSource().attachEventOnce("patchCompleted", patchCompletedEvent => {
            // Re-enable ETag checks
            if (isInCollaborativeDraft) {
              oEvent.getSource().getModel().setIgnoreETag(false);
            }
            if (oEvent.getSource().isA("sap.ui.model.odata.v4.ODataListBinding")) {
              var _this$getView2;
              ActionRuntime.setActionEnablementAfterPatch(this.getView(), sourceBinding, (_this$getView2 = this.getView()) === null || _this$getView2 === void 0 ? void 0 : _this$getView2.getBindingContext("internal"));
            }
            const bSuccess = patchCompletedEvent.getParameter("success");
            if (bSuccess) {
              resolve();
            } else {
              reject();
            }
          });
        });
        this.updateDocument(sourceBinding, oPatchPromise);
      }
    }

    /**
     * Handles the CreateActivate event.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handleCreateActivate = async function handleCreateActivate(oEvent) {
      const oBinding = oEvent.getSource();
      const transactionHelper = this.getTransactionHelper();
      const bAtEnd = true;
      const bInactive = true;
      const oParams = {
        creationMode: CreationMode.Inline,
        createAtEnd: bAtEnd,
        inactive: bInactive,
        keepTransientContextOnFailed: false,
        // currently not fully supported
        busyMode: "None"
      };
      try {
        var _activatedContext$cre;
        // Send notification to other users only after the creation has been finalized
        const activatedContext = oEvent.getParameter("context");
        (_activatedContext$cre = activatedContext.created()) === null || _activatedContext$cre === void 0 ? void 0 : _activatedContext$cre.then(() => {
          this._sendActivity(Activity.Create, activatedContext);
        }).catch(() => {
          Log.warning(`Failed to activate context ${activatedContext.getPath()}`);
        });

        // Create a new inactive context (empty row in the table)
        const newInactiveContext = await transactionHelper.createDocument(oBinding, oParams, this.getAppComponent(), this.getMessageHandler(), false);
        if (newInactiveContext) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
        }
      } catch (error) {
        Log.error("Failed to activate new row -", error);
      }
    }

    /**
     * Performs a task in sync with other tasks created via this function.
     * Returns the promise chain of the task.
     *
     * @param [newTask] Optional, a promise or function to be executed synchronously
     * @returns Promise resolves once the task is completed
     * @private
     */;
    _proto.syncTask = function syncTask(newTask) {
      if (newTask) {
        if (typeof newTask === "function") {
          this.syncTasks = this.syncTasks.then(newTask).catch(function () {
            return Promise.resolve();
          });
        } else {
          this.syncTasks = this.syncTasks.then(() => newTask).catch(function () {
            return Promise.resolve();
          });
        }
      }
      return this.syncTasks;
    }

    /**
     * Decides if a document is to be shown in display or edit mode.
     *
     * @param {sap.ui.model.odata.v4.Context} oContext The context to be displayed or edited
     * @returns {Promise} Promise resolves once the edit mode is computed
     */;
    _proto.computeEditMode = async function computeEditMode(context) {
      const programmingModel = this.getProgrammingModel(context);
      if (programmingModel === ProgrammingModel.Draft) {
        try {
          this.setDraftStatus(DraftStatus.Clear);
          const globalModel = this.getGlobalUIModel();
          globalModel.setProperty("/isEditablePending", true, undefined, true);
          const isActiveEntity = await context.requestObject("IsActiveEntity");
          if (isActiveEntity === false) {
            // in case the document is draft set it in edit mode
            this.setEditMode(EditMode.Editable);
            const hasActiveEntity = await context.requestObject("HasActiveEntity");
            this.setEditMode(undefined, !hasActiveEntity);
          } else {
            // active document, stay on display mode
            this.setEditMode(EditMode.Display, false);
          }
          globalModel.setProperty("/isEditablePending", false, undefined, true);
        } catch (error) {
          Log.error("Error while determining the editMode for draft", error);
          throw error;
        }
      } else if (programmingModel === ProgrammingModel.Sticky) {
        const lastInvokedActionName = this.getInternalModel().getProperty("/lastInvokedAction");
        if (lastInvokedActionName && this.isNewActionForSticky(lastInvokedActionName, context)) {
          this.setEditMode(EditMode.Editable, true);
          if (!this.getAppComponent()._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this.handleStickyOn(context);
          this.getInternalModel().setProperty("/lastInvokedAction", undefined);
        }
      }
    }

    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////

    /**
     * Internal method to delete a context or an array of contexts.
     *
     * @param contexts The context(s) to be deleted
     * @param parameters Parameters for deletion
     */;
    _proto.deleteDocumentTransaction = async function deleteDocumentTransaction(contexts, parameters) {
      var _sap$ui$getCore$byId;
      const resourceModel = getResourceModel(this);
      const transactionHelper = this.getTransactionHelper();

      // TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
      // for the time being I kept it and provide the internal model context to not break something
      parameters.internalModelContext = parameters.controlId ? (_sap$ui$getCore$byId = sap.ui.getCore().byId(parameters.controlId)) === null || _sap$ui$getCore$byId === void 0 ? void 0 : _sap$ui$getCore$byId.getBindingContext("internal") : null;
      await this.syncTask();
      await transactionHelper.deleteDocument(contexts, parameters, this.getAppComponent(), resourceModel, this.getMessageHandler());
    };
    _proto._getResourceModel = function _getResourceModel() {
      return getResourceModel(this.getView());
    };
    _proto.getTransactionHelper = function getTransactionHelper() {
      return TransactionHelper;
    };
    _proto.getMessageHandler = function getMessageHandler() {
      if (this.base.messageHandler) {
        return this.base.messageHandler;
      } else {
        throw new Error("Edit Flow works only with a given message handler");
      }
    };
    _proto.getInternalModel = function getInternalModel() {
      return this.getView().getModel("internal");
    };
    _proto.getGlobalUIModel = function getGlobalUIModel() {
      return this.getView().getModel("ui");
    }

    /**
     * Sets that the current page contains a newly created object.
     *
     * @param bCreationMode True if the object is new
     */;
    _proto.setCreationMode = function setCreationMode(bCreationMode) {
      const uiModelContext = this.getView().getBindingContext("ui");
      this.getGlobalUIModel().setProperty("createMode", bCreationMode, uiModelContext, true);
    }

    /**
     * Indicates whether the current page contains a newly created object or not.
     *
     * @returns True if the object is new
     */;
    _proto.getCreationMode = function getCreationMode() {
      const uiModelContext = this.getView().getBindingContext("ui");
      return !!this.getGlobalUIModel().getProperty("createMode", uiModelContext);
    }

    /**
     * Indicates whether the object being edited (or one of its sub-objects) has been modified or not.
     *
     * @returns True if the object has been modified
     */;
    _proto.isDocumentModified = function isDocumentModified() {
      return !!this.getGlobalUIModel().getProperty("/isDocumentModified");
    }

    /**
     * Sets that the object being edited (or one of its sub-objects) has been modified.
     *
     * @param modified True if the object has been modified
     */;
    _proto.setDocumentModified = function setDocumentModified(modified) {
      this.getGlobalUIModel().setProperty("/isDocumentModified", modified);
    }

    /**
     * Sets that the object being edited has been modified by creating a sub-object.
     *
     * @param listBinding The list binding on which the object has been created
     */;
    _proto.setDocumentModifiedOnCreate = function setDocumentModifiedOnCreate(listBinding) {
      // Set the modified flag only on relative listBindings, i.e. when creating a sub-object
      // If the listBinding is not relative, then it's a creation from the ListReport, and by default a newly created root object isn't considered as modified
      if (listBinding.isRelative()) {
        this.setDocumentModified(true);
      }
    }

    /**
     * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param binding OData list binding object
     */;
    _proto.handleCreateEvents = function handleCreateEvents(binding) {
      this.setDraftStatus(DraftStatus.Clear);
      const programmingModel = this.getProgrammingModel(binding);
      binding.attachEvent("createSent", () => {
        if (programmingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(DraftStatus.Saving);
        }
      });
      binding.attachEvent("createCompleted", oEvent => {
        const success = oEvent.getParameter("success");
        if (programmingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(success ? DraftStatus.Saved : DraftStatus.Clear);
        }
        this.getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Updates the draft status message (displayed at the bottom of the page).
     *
     * @param draftStatus The draft status message
     */;
    _proto.setDraftStatus = function setDraftStatus(draftStatus) {
      this.getView().getModel("ui").setProperty("/draftStatus", draftStatus, undefined, true);
    }

    /**
     * Gets the programming model from a binding or a context.
     *
     * @param source The binding or context
     * @returns The programming model
     */;
    _proto.getProgrammingModel = function getProgrammingModel(source) {
      return this.getTransactionHelper().getProgrammingModel(source);
    }

    /**
     * Sets the edit mode.
     *
     * @param editMode The edit mode
     * @param isCreation True if the object has been newly created
     */;
    _proto.setEditMode = function setEditMode(editMode, isCreation) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      const globalModel = this.getGlobalUIModel();
      if (editMode) {
        globalModel.setProperty("/isEditable", editMode === "Editable", undefined, true);
      }
      if (isCreation !== undefined) {
        // Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
        // to ensure any overrides are taken into account
        this.setCreationMode(isCreation);
      }
    }

    /**
     * Checks if an action corresponds to a create action for a sticky session.
     *
     * @param actionName The name of the action
     * @param context Context for the sticky session
     * @returns True if the action is a create action
     */;
    _proto.isNewActionForSticky = function isNewActionForSticky(actionName, context) {
      try {
        var _entitySet$annotation3;
        const metaModel = context.getModel().getMetaModel();
        const metaContext = metaModel.getMetaContext(context.getPath());
        const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet;
        const stickySession = (_entitySet$annotation3 = entitySet.annotations.Session) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.StickySessionSupported;
        if ((stickySession === null || stickySession === void 0 ? void 0 : stickySession.NewAction) === actionName) {
          return true;
        }
        if (stickySession !== null && stickySession !== void 0 && stickySession.AdditionalNewActions && (stickySession === null || stickySession === void 0 ? void 0 : stickySession.AdditionalNewActions.indexOf(actionName)) !== -1) {
          return true;
        }
        return false;
      } catch (error) {
        Log.info(error);
        return false;
      }
    }

    // TODO Move all sticky-related below to a sticky session manager class

    /**
     * Enables the sticky edit session.
     *
     * @param context The context being edited
     * @returns True in case of success, false otherwise
     */;
    _proto.handleStickyOn = function handleStickyOn(context) {
      const appComponent = this.getAppComponent();
      try {
        if (appComponent === undefined) {
          throw new Error("undefined AppComponent for function handleStickyOn");
        }
        if (!appComponent.getRouterProxy().hasNavigationGuard()) {
          const hashTracker = appComponent.getRouterProxy().getHash();
          const internalModel = this.getInternalModel();

          // Set a guard in the RouterProxy
          // A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
          // the new hash, and the guard cannot be found in the managed history of the router proxy
          setTimeout(function () {
            appComponent.getRouterProxy().setNavigationGuard(context.getPath().substring(1));
          }, 0);

          // Setting back navigation on shell service, to get the dicard message box in case of sticky
          appComponent.getShellServices().setBackNavigation(this.onBackNavigationInSession.bind(this));
          this.dirtyStateProviderFunction = this.getDirtyStateProvider(appComponent, internalModel, hashTracker);
          appComponent.getShellServices().registerDirtyStateProvider(this.dirtyStateProviderFunction);

          // handle session timeout
          const i18nModel = this.getView().getModel("sap.fe.i18n");
          this.sessionTimeoutFunction = this.getSessionTimeoutFunction(context, i18nModel);
          this.getView().getModel().attachSessionTimeout(this.sessionTimeoutFunction);
          this.stickyDiscardAfterNavigationFunction = this.getRouteMatchedFunction(context, appComponent);
          appComponent.getRoutingService().attachRouteMatched(this.stickyDiscardAfterNavigationFunction);
        }
      } catch (error) {
        Log.info(error);
        return false;
      }
      return true;
    }

    /**
     * Disables the sticky edit session.
     *
     * @returns True in case of success, false otherwise
     */;
    _proto.handleStickyOff = function handleStickyOff() {
      const appComponent = this.getAppComponent();
      try {
        if (appComponent === undefined) {
          throw new Error("undefined AppComponent for function handleStickyOff");
        }
        if (appComponent.getRouterProxy) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          appComponent.getRouterProxy().discardNavigationGuard();
        }
        if (this.dirtyStateProviderFunction) {
          appComponent.getShellServices().deregisterDirtyStateProvider(this.dirtyStateProviderFunction);
          this.dirtyStateProviderFunction = undefined;
        }
        const model = this.getView().getModel();
        if (model && this.sessionTimeoutFunction) {
          model.detachSessionTimeout(this.sessionTimeoutFunction);
        }
        appComponent.getRoutingService().detachRouteMatched(this.stickyDiscardAfterNavigationFunction);
        this.stickyDiscardAfterNavigationFunction = undefined;
        this.setEditMode(EditMode.Display, false);
        if (appComponent.getShellServices) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          appComponent.getShellServices().setBackNavigation();
        }
      } catch (error) {
        Log.info(error);
        return false;
      }
      return true;
    };
    _proto._setStickySessionInternalProperties = function _setStickySessionInternalProperties(programmingModel, model) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this.getInternalModel();
        internalModel.setProperty("/sessionOn", true);
        internalModel.setProperty("/stickySessionToken", model.getHttpHeaders(true)["SAP-ContextId"]);
      }
    }

    /**
     * Returns a callback function to be used as a DirtyStateProvider in the Shell.
     *
     * @param appComponent The app component
     * @param internalModel The model "internal"
     * @param hashTracker Hash tracker
     * @returns The callback function
     */;
    _proto.getDirtyStateProvider = function getDirtyStateProvider(appComponent, internalModel, hashTracker) {
      return navigationContext => {
        try {
          if (navigationContext === undefined) {
            throw new Error("Invalid input parameters for DirtyStateProvider function");
          }
          const targetHash = navigationContext.innerAppRoute;
          const routerProxy = appComponent.getRouterProxy();
          let lclHashTracker = "";
          let isDirty;
          const isSessionOn = internalModel.getProperty("/sessionOn");
          if (!isSessionOn) {
            // If the sticky session was terminated before hand.
            // Example in case of navigating away from application using IBN.
            return undefined;
          }
          if (!routerProxy.isNavigationFinalized()) {
            // If navigation is currently happening in RouterProxy, it's a transient state
            // (not dirty)
            isDirty = false;
            lclHashTracker = targetHash;
          } else if (hashTracker === targetHash) {
            // the hash didn't change so either the user attempts to refresh or to leave the app
            isDirty = true;
          } else if (routerProxy.checkHashWithGuard(targetHash) || routerProxy.isGuardCrossAllowedByUser()) {
            // the user attempts to navigate within the root object
            // or crossing the guard has already been allowed by the RouterProxy
            lclHashTracker = targetHash;
            isDirty = false;
          } else {
            // the user attempts to navigate within the app, for example back to the list report
            isDirty = true;
          }
          if (isDirty) {
            // the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
            // change this due to compatibility reasons we set it back to not-dirty
            setTimeout(function () {
              appComponent.getShellServices().setDirtyFlag(false);
            }, 0);
          } else {
            hashTracker = lclHashTracker;
          }
          return isDirty;
        } catch (error) {
          Log.info(error);
          return undefined;
        }
      };
    }

    /**
     * Returns a callback function to be used when a sticky session times out.
     *
     * @param stickyContext The context for the sticky session
     * @param i18nModel
     * @returns The callback function
     */;
    _proto.getSessionTimeoutFunction = function getSessionTimeoutFunction(stickyContext, i18nModel) {
      return () => {
        try {
          if (stickyContext === undefined) {
            throw new Error("Context missing for SessionTimeout function");
          }
          // remove transient messages since we will showing our own message
          this.getMessageHandler().removeTransitionMessages();
          const warningDialog = new Dialog({
            title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
            state: "Warning",
            content: new Text({
              text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}"
            }),
            beginButton: new Button({
              text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
              type: "Emphasized",
              press: () => {
                // remove sticky handling after navigation since session has already been terminated
                this.handleStickyOff();
                this.getInternalRouting().navigateBackFromContext(stickyContext);
              }
            }),
            afterClose: function () {
              warningDialog.destroy();
            }
          });
          warningDialog.addStyleClass("sapUiContentPadding");
          warningDialog.setModel(i18nModel, "sap.fe.i18n");
          this.getView().addDependent(warningDialog);
          warningDialog.open();
        } catch (error) {
          Log.info(error);
          return undefined;
        }
        return true;
      };
    }

    /**
     * Returns a callback function for the onRouteMatched event in case of sticky edition.
     *
     * @param context The context being edited (root of the sticky session)
     * @param appComponent The app component
     * @returns The callback function
     */;
    _proto.getRouteMatchedFunction = function getRouteMatchedFunction(context, appComponent) {
      return () => {
        const currentHash = appComponent.getRouterProxy().getHash();
        // either current hash is empty so the user left the app or he navigated away from the object
        if (!currentHash || !appComponent.getRouterProxy().checkHashWithGuard(currentHash)) {
          this.discardStickySession(context);
          setTimeout(() => {
            //clear the session context to ensure the LR refreshes the list without a session
            context.getModel().clearSessionContext();
          }, 0);
        }
      };
    }

    /**
     * Ends a sticky session by discarding changes.
     *
     * @param context The context being edited (root of the sticky session)
     */;
    _proto.discardStickySession = async function discardStickySession(context) {
      const discardedContext = await sticky.discardDocument(context);
      if (discardedContext !== null && discardedContext !== void 0 && discardedContext.hasPendingChanges()) {
        discardedContext.getBinding().resetChanges();
      }
      discardedContext === null || discardedContext === void 0 ? void 0 : discardedContext.refresh();
      this.handleStickyOff();
    }

    /**
     * Gets the internal routing extension.
     *
     * @returns The internal routing extension
     */;
    _proto.getInternalRouting = function getInternalRouting() {
      if (this.base._routing) {
        return this.base._routing;
      } else {
        throw new Error("Edit Flow works only with a given routing listener");
      }
    };
    _proto._getRootViewController = function _getRootViewController() {
      return this.getAppComponent().getRootViewController();
    };
    _proto._getSemanticMapping = function _getSemanticMapping() {
      return this.getAppComponent().getRoutingService().getLastSemanticMapping();
    }

    /**
     * Creates a new promise to wait for an action to be executed.
     *
     * @param actionName The name of the action
     * @param controlId The ID of the control
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto.createActionPromise = function createActionPromise(actionName, controlId) {
      let resolveFunction, rejectFunction;
      this.actionPromise = new Promise((resolve, reject) => {
        resolveFunction = resolve;
        rejectFunction = reject;
      }).then(oResponse => {
        return Object.assign({
          controlId
        }, this.getActionResponseDataAndKeys(actionName, oResponse));
      });
      return {
        fResolver: resolveFunction,
        fRejector: rejectFunction
      };
    }

    /**
     *
     * @param actionName The name of the action that is executed
     * @param response The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto.getActionResponseDataAndKeys = function getActionResponseDataAndKeys(actionName, response) {
      if (Array.isArray(response)) {
        if (response.length === 1) {
          response = response[0].value;
        } else {
          return null;
        }
      }
      if (!response) {
        return null;
      }
      const currentView = this.getView();
      const metaModelData = currentView.getModel().getMetaModel().getData();
      const actionReturnType = metaModelData && metaModelData[actionName] && metaModelData[actionName][0] && metaModelData[actionName][0].$ReturnType ? metaModelData[actionName][0].$ReturnType.$Type : null;
      const keys = actionReturnType && metaModelData[actionReturnType] ? metaModelData[actionReturnType].$Key : null;
      return {
        oData: response.getObject(),
        keys
      };
    };
    _proto.getCurrentActionPromise = function getCurrentActionPromise() {
      return this.actionPromise;
    };
    _proto.deleteCurrentActionPromise = function deleteCurrentActionPromise() {
      this.actionPromise = undefined;
    };
    _proto._scrollAndFocusOnInactiveRow = function _scrollAndFocusOnInactiveRow(table) {
      const rowBinding = table.getRowBinding();
      const activeRowIndex = rowBinding.getCount() || 0;
      if (table.data("tableType") !== "ResponsiveTable") {
        if (activeRowIndex > 0) {
          table.scrollToIndex(activeRowIndex - 1);
        }
        table.focusRow(activeRowIndex, true);
      } else {
        /* In a responsive table, the empty rows appear at the beginning of the table. But when we create more, they appear below the new line.
         * So we check the first inactive row first, then we set the focus on it when we press the button.
         * This doesn't impact the GridTable because they appear at the end, and we already focus the before-the-last row (because 2 empty rows exist)
         */
        const allRowContexts = rowBinding.getContexts();
        if (!(allRowContexts !== null && allRowContexts !== void 0 && allRowContexts.length)) {
          table.focusRow(activeRowIndex, true);
          return;
        }
        let focusRow = activeRowIndex,
          index = 0;
        for (const singleContext of allRowContexts) {
          if (singleContext.isInactive() && index < focusRow) {
            focusRow = index;
          }
          index++;
        }
        if (focusRow > 0) {
          table.scrollToIndex(focusRow);
        }
        table.focusRow(focusRow, true);
      }
    };
    _proto.createEmptyRowsAndFocus = async function createEmptyRowsAndFocus(table) {
      var _tableAPI$tableDefini, _tableAPI$tableDefini2, _table$getBindingCont;
      const tableAPI = table.getParent();
      if (tableAPI !== null && tableAPI !== void 0 && (_tableAPI$tableDefini = tableAPI.tableDefinition) !== null && _tableAPI$tableDefini !== void 0 && (_tableAPI$tableDefini2 = _tableAPI$tableDefini.control) !== null && _tableAPI$tableDefini2 !== void 0 && _tableAPI$tableDefini2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode"))) {
        // With the parameter, we don't have empty rows in Edit mode, so we need to create them before setting the focus on them
        await tableAPI.setUpEmptyRows(table, true);
      }
      this._scrollAndFocusOnInactiveRow(table);
    };
    _proto._sendActivity = function _sendActivity(action, relatedContexts, actionName, refreshListBinding, actionRequestedProperties) {
      const content = Array.isArray(relatedContexts) ? relatedContexts.map(context => context.getPath()) : relatedContexts === null || relatedContexts === void 0 ? void 0 : relatedContexts.getPath();
      ActivitySync.send(this.getView(), action, content, actionName, refreshListBinding, actionRequestedProperties);
    };
    _proto._triggerConfiguredSurvey = function _triggerConfiguredSurvey(sActionName, triggerType) {
      triggerConfiguredSurvey(this.getView(), sActionName, triggerType);
    };
    _proto._submitOpenChanges = async function _submitOpenChanges(oContext) {
      const oModel = oContext.getModel(),
        oLockObject = this.getGlobalUIModel();
      try {
        // Submit any leftover changes that are not yet submitted
        // Currently we are using only 1 updateGroupId, hence submitting the batch directly here
        await oModel.submitBatch("$auto");

        // Wait for all currently running changes
        // For the time being we agreed with the v4 model team to use an internal method. We'll replace it once
        // a public or restricted method was provided
        await oModel.oRequestor.waitForRunningChangeRequests("$auto");

        // Check if all changes were submitted successfully
        if (oModel.hasPendingChanges("$auto")) {
          throw new Error("submit of open changes failed");
        }
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    };
    _proto._removeStickySessionInternalProperties = function _removeStickySessionInternalProperties(programmingModel) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this.getInternalModel();
        internalModel.setProperty("/sessionOn", false);
        internalModel.setProperty("/stickySessionToken", undefined);
        this.handleStickyOff();
      }
    }

    /**
     * Method to display a 'discard' popover when exiting a sticky session.
     */;
    _proto.onBackNavigationInSession = function onBackNavigationInSession() {
      const view = this.getView();
      const routerProxy = this.getAppComponent().getRouterProxy();
      if (routerProxy.checkIfBackIsOutOfGuard()) {
        const bindingContext = view.getBindingContext();
        const programmingModel = this.getProgrammingModel(bindingContext);
        sticky.processDataLossConfirmation(async () => {
          await this.discardStickySession(bindingContext);
          this._removeStickySessionInternalProperties(programmingModel);
          history.back();
        }, view, programmingModel);
        return;
      }
      history.back();
    };
    _proto._handleNewContext = async function _handleNewContext(oContext, bEditable, bRecreateContext, bDraftNavigation) {
      let bForceFocus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (!this._isFclEnabled()) {
        EditState.setEditStateDirty();
      }
      await this.getInternalRouting().navigateToContext(oContext, {
        checkNoHashChange: true,
        editable: bEditable,
        bPersistOPScroll: true,
        bRecreateContext: bRecreateContext,
        bDraftNavigation: bDraftNavigation,
        showPlaceholder: false,
        bForceFocus: bForceFocus,
        keepCurrentLayout: true
      });
    };
    _proto._getBoundContext = function _getBoundContext(view, params) {
      const viewLevel = view.getViewData().viewLevel;
      const bRefreshAfterAction = viewLevel > 1 || viewLevel === 1 && params.controlId;
      return !params.isNavigable || !!bRefreshAfterAction;
    }

    /**
     * Checks if there are validation (parse) errors for controls bound to a given context
     *
     * @function
     * @name _checkForValidationErrors
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Promise} Promise resolves if there are no validation errors, and rejects if there are validation errors
     */;
    _proto._checkForValidationErrors = function _checkForValidationErrors() {
      return this.syncTask().then(() => {
        const sViewId = this.getView().getId();
        const aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
        let oControl;
        let oMessage;
        if (!aMessages.length) {
          return Promise.resolve("No validation errors found");
        }
        for (let i = 0; i < aMessages.length; i++) {
          oMessage = aMessages[i];
          if (oMessage.validation) {
            oControl = Core.byId(oMessage.getControlId());
            while (oControl) {
              if (oControl.getId() === sViewId) {
                return Promise.reject("validation errors exist");
              }
              oControl = oControl.getParent();
            }
          }
        }
      });
    }

    /**
     * @function
     * @name _refreshListIfRequired
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oResponse The response of the bound action and the names of the key fields
     * @param oContext The bound context on which the action was executed
     * @returns Always resolves to param oResponse
     */;
    _proto._refreshListIfRequired = function _refreshListIfRequired(oResponse, oContext) {
      if (!oContext || !oResponse || !oResponse.oData) {
        return Promise.resolve(undefined);
      }
      const oBinding = oContext.getBinding();
      // refresh only lists
      if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oContextData = oResponse.oData;
        const aKeys = oResponse.keys;
        const oCurrentData = oContext.getObject();
        let bReturnedContextIsSame = true;
        // ensure context is in the response
        if (Object.keys(oContextData).length) {
          // check if context in response is different than the bound context
          bReturnedContextIsSame = aKeys.every(function (sKey) {
            return oCurrentData[sKey] === oContextData[sKey];
          });
          if (!bReturnedContextIsSame) {
            return new Promise(resolve => {
              if (oBinding.isRoot()) {
                oBinding.attachEventOnce("dataReceived", function () {
                  resolve(!bReturnedContextIsSame);
                });
                oBinding.refresh();
              } else {
                const oAppComponent = this.getAppComponent();
                oAppComponent.getSideEffectsService().requestSideEffects([{
                  $NavigationPropertyPath: oBinding.getPath()
                }], oBinding.getContext()).then(function () {
                  resolve(!bReturnedContextIsSame);
                }, function () {
                  Log.error("Error while refreshing the table");
                  resolve(!bReturnedContextIsSame);
                }).catch(function (e) {
                  Log.error("Error while refreshing the table", e);
                });
              }
            });
          }
        }
      }
      // resolve with oResponse to not disturb the promise chain afterwards
      return Promise.resolve(undefined);
    };
    _proto._fetchSemanticKeyValues = function _fetchSemanticKeyValues(oContext) {
      const oMetaModel = oContext.getModel().getMetaModel(),
        sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name"),
        aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);
      if (aSemanticKeys && aSemanticKeys.length) {
        const aRequestPromises = aSemanticKeys.map(function (oKey) {
          return oContext.requestObject(oKey.$PropertyPath);
        });
        return Promise.all(aRequestPromises);
      } else {
        return Promise.resolve();
      }
    }

    /**
     * Provides the latest context in the metadata hierarchy from rootBinding to given context pointing to given entityType
     * if any such context exists. Otherwise, it returns the original context.
     * Note: It is only needed as work-around for incorrect modelling. Correct modelling would imply a DataFieldForAction in a LineItem
     * to point to an overload defined either on the corresponding EntityType or a collection of the same.
     *
     * @param rootContext The context to start searching from
     * @param listBinding The listBinding of the table
     * @param overloadEntityType The ActionOverload entity type to search for
     * @returns Returns the context of the ActionOverload entity
     */;
    _proto._getActionOverloadContextFromMetadataPath = function _getActionOverloadContextFromMetadataPath(rootContext, listBinding, overloadEntityType) {
      const model = rootContext.getModel();
      const metaModel = model.getMetaModel();
      let contextSegments = listBinding.getPath().split("/");
      let currentContext = rootContext;

      // We expect that the last segment of the listBinding is the ListBinding of the table. Remove this from contextSegments
      // because it is incorrect to execute bindContext on a list. We do not anyway need to search this context for the overload.
      contextSegments.pop();
      if (contextSegments.length === 0) {
        contextSegments = [""]; // Don't leave contextSegments undefined
      }

      if (contextSegments[0] !== "") {
        contextSegments.unshift(""); // to also get the root context, i.e. the bindingContext of the table
      }
      // load all the parent contexts into an array
      const parentContexts = contextSegments.map(pathSegment => {
        if (pathSegment !== "") {
          currentContext = model.bindContext(pathSegment, currentContext).getBoundContext();
        } else {
          // Creating a new context using bindContext(...).getBoundContext() does not work if the etag is needed. According to model colleagues,
          // we should always use an existing context if possible.
          // Currently, the only example we know about is using the rootContext - and in this case, we can obviously reuse that existing context.
          // If other examples should come up, the best possible work around would be to request some data to get an existing context. To keep the
          // request as small and fast as possible, we should request only the first key property. As this would introduce asynchronism, and anyway
          // the whole logic is only part of work-around for incorrect modelling, we wait until we have an example needing it before implementing this.
          currentContext = rootContext;
        }
        return currentContext;
      }).reverse();
      // search for context backwards
      const overloadContext = parentContexts.find(parentContext => metaModel.getMetaContext(parentContext.getPath()).getObject("$Type") === overloadEntityType);
      return overloadContext || listBinding.getHeaderContext();
    };
    _proto._createSiblingInfo = function _createSiblingInfo(currentContext, newContext) {
      return {
        targetContext: newContext,
        pathMapping: [{
          oldPath: currentContext.getPath(),
          newPath: newContext.getPath()
        }]
      };
    };
    _proto._updatePathsInHistory = function _updatePathsInHistory(mappings) {
      const oAppComponent = this.getAppComponent();
      oAppComponent.getRouterProxy().setPathMapping(mappings);

      // Also update the semantic mapping in the routing service
      const lastSemanticMapping = this._getSemanticMapping();
      if (mappings.length && (lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === mappings[mappings.length - 1].oldPath) {
        lastSemanticMapping.technicalPath = mappings[mappings.length - 1].newPath;
      }
    };
    _proto._getNavigationTargetForEdit = function _getNavigationTargetForEdit(context, newDocumentContext, siblingInfo) {
      let contextToNavigate;
      siblingInfo = siblingInfo ?? this._createSiblingInfo(context, newDocumentContext);
      this._updatePathsInHistory(siblingInfo.pathMapping);
      if (siblingInfo.targetContext.getPath() != newDocumentContext.getPath()) {
        contextToNavigate = siblingInfo.targetContext;
      }
      return contextToNavigate;
    }

    /**
     * This method creates a sibling context for a subobject page, and calculates a sibling path
     * for all intermediate paths between the object page and the subobject page.
     *
     * @param rootCurrentContext The context for the root of the draft
     * @param rightmostCurrentContext The context of the subobject
     * @param sProgrammingModel The programming model
     * @param doNotComputeIfRoot If true, we don't compute siblingInfo if the root and the rightmost contexts are the same
     * @returns Returns the siblingInformation object
     */;
    _proto._computeSiblingInformation = async function _computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, sProgrammingModel, doNotComputeIfRoot) {
      rightmostCurrentContext = rightmostCurrentContext ?? rootCurrentContext;
      if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
        // Wrong usage !!
        Log.error("Cannot compute rightmost sibling context");
        throw new Error("Cannot compute rightmost sibling context");
      }
      if (doNotComputeIfRoot && rightmostCurrentContext.getPath() === rootCurrentContext.getPath()) {
        return Promise.resolve(undefined);
      }
      const model = rootCurrentContext.getModel();
      if (sProgrammingModel === ProgrammingModel.Draft) {
        return draft.computeSiblingInformation(rootCurrentContext, rightmostCurrentContext);
      } else {
        // If not in draft mode, we just recreate a context from the path of the rightmost context
        // No path mapping is needed
        return {
          targetContext: model.bindContext(rightmostCurrentContext.getPath()).getBoundContext(),
          pathMapping: []
        };
      }
    };
    _proto._isFclEnabled = function _isFclEnabled() {
      return this.getAppComponent()._isFclEnabled();
    };
    return EditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "editDocument", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "editDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateDocument", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "updateDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createDocument", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "createDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeSave", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeSave"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeCreate", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeCreate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeEdit", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeEdit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDiscard", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDiscard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDelete", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDelete"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "saveDocument", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "saveDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cancelDocument", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "cancelDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocument", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyDocument", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "applyDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "invokeAction", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "invokeAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "securedExecution", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "securedExecution"), _class2.prototype)), _class2)) || _class);
  return EditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiQ29uc3RhbnRzIiwiRHJhZnRTdGF0dXMiLCJFZGl0TW9kZSIsIlN0YXJ0dXBNb2RlIiwiTWVzc2FnZVR5cGUiLCJjb3JlTGlicmFyeSIsIkVkaXRGbG93IiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwic3luY1Rhc2tzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRBcHBDb21wb25lbnQiLCJiYXNlIiwiZWRpdERvY3VtZW50Iiwib0NvbnRleHQiLCJiRHJhZnROYXZpZ2F0aW9uIiwidHJhbnNhY3Rpb25IZWxwZXIiLCJnZXRUcmFuc2FjdGlvbkhlbHBlciIsIm9Sb290Vmlld0NvbnRyb2xsZXIiLCJfZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwibW9kZWwiLCJnZXRNb2RlbCIsInJpZ2h0bW9zdENvbnRleHQiLCJzaWJsaW5nSW5mbyIsIm9WaWV3RGF0YSIsImdldFZpZXciLCJnZXRWaWV3RGF0YSIsInNQcm9ncmFtbWluZ01vZGVsIiwiZ2V0UHJvZ3JhbW1pbmdNb2RlbCIsIm9Sb290Q29udGV4dCIsIm9WaWV3Iiwidmlld0xldmVsIiwiRHJhZnQiLCJkcmFmdFJvb3RQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXREcmFmdFJvb3RQYXRoIiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJyZXF1ZXN0T2JqZWN0IiwiU3RpY2t5Iiwic1N0aWNreVJvb3RQYXRoIiwiZ2V0U3RpY2t5Um9vdFBhdGgiLCJlZGl0RmxvdyIsIm9uQmVmb3JlRWRpdCIsImNvbnRleHQiLCJvTmV3RG9jdW1lbnRDb250ZXh0IiwiZ2V0TWVzc2FnZUhhbmRsZXIiLCJfc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyIsInNldEVkaXRNb2RlIiwiRWRpdGFibGUiLCJzZXREb2N1bWVudE1vZGlmaWVkIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJjb250ZXh0VG9OYXZpZ2F0ZSIsIl9pc0ZjbEVuYWJsZWQiLCJnZXRSaWdodG1vc3RDb250ZXh0IiwiX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24iLCJfY3JlYXRlU2libGluZ0luZm8iLCJfdXBkYXRlUGF0aHNJbkhpc3RvcnkiLCJwYXRoTWFwcGluZyIsInRhcmdldENvbnRleHQiLCJnZXRQYXRoIiwiX2dldE5hdmlnYXRpb25UYXJnZXRGb3JFZGl0IiwiX2hhbmRsZU5ld0NvbnRleHQiLCJzdGlja3lDb250ZXh0IiwiZ2V0S2VlcEFsaXZlQ29udGV4dCIsImhhbmRsZVN0aWNreU9uIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJnZXRNZXRhTW9kZWwiLCJzaGFyZU9iamVjdCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiZGVsZXRlTXVsdGlwbGVEb2N1bWVudHMiLCJjb250ZXh0c1RvRGVsZXRlIiwicGFyYW1ldGVycyIsImJlZm9yZURlbGV0ZUNhbGxCYWNrIiwib25CZWZvcmVEZWxldGUiLCJsb2NrT2JqZWN0IiwiZ2V0R2xvYmFsVUlNb2RlbCIsInBhcmVudENvbnRyb2wiLCJieUlkIiwiY29udHJvbElkIiwiRXJyb3IiLCJsaXN0QmluZGluZyIsImdldEJpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwiYkZpbmRBY3RpdmVDb250ZXh0cyIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbiIsInJlc3VsdCIsImlzQSIsImNsZWFyU2VsZWN0aW9uIiwidmlld0JpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJpc1Jvb3QiLCJhdHRhY2hFdmVudE9uY2UiLCJyZWZyZXNoIiwiQ29tbW9uVXRpbHMiLCJoYXNUcmFuc2llbnRDb250ZXh0IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5IiwiRWRpdFN0YXRlIiwic2V0RWRpdFN0YXRlRGlydHkiLCJBY3Rpdml0eVN5bmMiLCJzZW5kIiwiQWN0aXZpdHkiLCJEZWxldGUiLCJtYXAiLCJ1bmxvY2siLCJ1cGRhdGVEb2N1bWVudCIsInVwZGF0ZWRDb250ZXh0IiwidXBkYXRlUHJvbWlzZSIsIm9yaWdpbmFsQmluZGluZ0NvbnRleHQiLCJpc0RyYWZ0IiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwic3luY1Rhc2siLCJzZXREcmFmdFN0YXR1cyIsIlNhdmluZyIsImN1cnJlbnRCaW5kaW5nQ29udGV4dCIsIm1ldGFNb2RlbCIsImVudGl0eVNldE5hbWUiLCJnZXRNZXRhQ29udGV4dCIsImdldE9iamVjdCIsInNlbWFudGljS2V5cyIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNLZXlzIiwibGVuZ3RoIiwiY3VycmVudFNlbWFudGljTWFwcGluZyIsIl9nZXRTZW1hbnRpY01hcHBpbmciLCJjdXJyZW50U2VtYW50aWNQYXRoIiwic2VtYW50aWNQYXRoIiwic0NoYW5nZWRQYXRoIiwiZ2V0U2VtYW50aWNQYXRoIiwiU2F2ZWQiLCJDbGVhciIsInNob3dNZXNzYWdlcyIsImNyZWF0ZURvY3VtZW50Iiwidkxpc3RCaW5kaW5nIiwibUluUGFyYW1ldGVycyIsIm9Mb2NrT2JqZWN0Iiwib1RhYmxlIiwibVBhcmFtZXRlcnMiLCJvQ3JlYXRpb24iLCJiU2hvdWxkQnVzeUxvY2siLCJjcmVhdGlvbk1vZGUiLCJJbmxpbmUiLCJDcmVhdGlvblJvdyIsIkV4dGVybmFsIiwib0V4ZWNDdXN0b21WYWxpZGF0aW9uIiwib0FwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5IiwicmVtb3ZlSUFwcFN0YXRlS2V5Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic0NyZWF0ZVBhdGgiLCJnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmciLCJoYW5kbGVycyIsIm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCIsIm91dGJvdW5kIiwidW5kZWZpbmVkIiwiY3JlYXRpb25Sb3ciLCJvQ3JlYXRpb25Sb3dPYmplY3RzIiwiZ2V0UGFyZW50IiwidmFsaWRhdGVEb2N1bWVudCIsImRhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJnZXRDcmVhdGlvblJvdyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNldFByb3BlcnR5IiwidGFibGVJZCIsImZuRm9jdXNPclNjcm9sbCIsImZvY3VzUm93IiwiYmluZCIsInNjcm9sbFRvSW5kZXgiLCJjcmVhdGVBdEVuZCIsImdldExlbmd0aCIsImhhbmRsZVNpZGVFZmZlY3RzIiwib0xpc3RCaW5kaW5nIiwib0NyZWF0aW9uUHJvbWlzZSIsIm9OZXdDb250ZXh0IiwiY3JlYXRlZCIsIm9CaW5kaW5nQ29udGV4dCIsImFwcENvbXBvbmVudCIsImNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyIsImFWYWxpZGF0aW9uTWVzc2FnZXMiLCJzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwibUN1c3RvbVZhbGlkaXR5IiwiZ2V0UHJvcGVydHkiLCJvTWVzc2FnZU1hbmFnZXIiLCJDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJhQ3VzdG9tTWVzc2FnZXMiLCJvRmllbGRDb250cm9sIiwic1RhcmdldCIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJmb3JFYWNoIiwib01lc3NhZ2UiLCJjb2RlIiwicmVtb3ZlTWVzc2FnZXMiLCJvVmFsaWRhdGlvbk1lc3NhZ2UiLCJtZXNzYWdlVGFyZ2V0IiwiZ2V0Q29udHJvbCIsImZpZWxkSWQiLCJnZXRCaW5kaW5nUGF0aCIsImZpbHRlciIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiTWVzc2FnZSIsIm1lc3NhZ2UiLCJtZXNzYWdlVGV4dCIsInByb2Nlc3NvciIsInR5cGUiLCJ0ZWNobmljYWwiLCJwZXJzaXN0ZW50IiwiYUV4aXN0aW5nVmFsaWRhdGlvbk1lc3NhZ2VzIiwiYWRkQ29udHJvbElkIiwicHVzaCIsInRleHQiLCJjdXN0b21NZXNzYWdlcyIsInJlc29sdmVDcmVhdGlvbk1vZGUiLCJpbml0aWFsQ3JlYXRpb25Nb2RlIiwicHJvZ3JhbW1pbmdNb2RlbCIsIm9NZXRhTW9kZWwiLCJOZXdQYWdlIiwiaXNSZWxhdGl2ZSIsInNQYXRoIiwic05ld0FjdGlvbiIsImFQYXJhbWV0ZXJzIiwiRGVmZXJyZWQiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldEhlYWRlckNvbnRleHQiLCJhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzIiwiZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzIiwiQXN5bmMiLCJPRGF0YUxpc3RCaW5kaW5nIiwiU3luYyIsIm9Nb2RlbCIsInJlc29sdmVkQ3JlYXRpb25Nb2RlIiwibUFyZ3MiLCJvQ3JlYXRpb25Sb3ciLCJvQ3JlYXRpb25Sb3dDb250ZXh0Iiwib1BheWxvYWQiLCJvUm91dGluZ0xpc3RlbmVyIiwiZ2V0SW50ZXJuYWxSb3V0aW5nIiwiT2JqZWN0Iiwia2V5cyIsInNQcm9wZXJ0eVBhdGgiLCJvUHJvcGVydHkiLCIka2luZCIsIl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMiLCJrZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkIiwiYnVzeU1vZGUiLCJidXN5SWQiLCJnZXRUYWJsZURlZmluaXRpb24iLCJhbm5vdGF0aW9uIiwiaWQiLCJoYW5kbGVDcmVhdGVFdmVudHMiLCJiZWZvcmVDcmVhdGVDYWxsQmFjayIsIm9uQmVmb3JlQ3JlYXRlIiwic2tpcFBhcmFtZXRlckRpYWxvZyIsImdldFN0YXJ0dXBNb2RlIiwiQXV0b0NyZWF0ZSIsImJTa2lwU2lkZUVmZmVjdHMiLCJvTmF2aWdhdGlvbiIsIm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCIsImJEZWZlcnJlZENvbnRleHQiLCJlZGl0YWJsZSIsImJGb3JjZUZvY3VzIiwiYXN5bmNDb250ZXh0IiwiY3JlYXRlQWN0aW9uIiwidHJhbnNpZW50IiwidGhlbiIsImNvcmVSZXNvdXJjZUJ1bmRsZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIm5hdmlnYXRlVG9NZXNzYWdlUGFnZSIsImdldFRleHQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYkZyb21EZWZlcnJlZCIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NyZWF0aW9uUm93TGlzdEJpbmRpbmciLCJvTmV3VHJhbnNpZW50Q29udGV4dCIsImNyZWF0ZSIsInNldEJpbmRpbmdDb250ZXh0IiwiY2F0Y2giLCJ0cmFjZSIsImRlbGV0ZSIsImlzTG9ja2VkIiwicmVqZWN0IiwiYVBhcmFtcyIsImFsbCIsIm1ldGFDb250ZXh0IiwiZW50aXR5U2V0IiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuZXdBY3Rpb24iLCJhbm5vdGF0aW9ucyIsIlNlc3Npb24iLCJTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiTmV3QWN0aW9uIiwiZ2V0SW50ZXJuYWxNb2RlbCIsInNldERvY3VtZW50TW9kaWZpZWRPbkNyZWF0ZSIsIl9zZW5kQWN0aXZpdHkiLCJDcmVhdGUiLCJpc0Nvbm5lY3RlZCIsIkNhbmNlbEFjdGlvbkRpYWxvZyIsIkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCIsIkNyZWF0aW9uRmFpbGVkIiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwiY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMiLCJkYXRhRm9yQ3JlYXRlIiwiaXNGcm9tQ29weVBhc3RlIiwiY3JlYXRlQXNJbmFjdGl2ZSIsInRhcmdldExpc3RCaW5kaW5nIiwiY29udGV4dFBhdGgiLCJtZXRhUGF0aCIsImdldENvbnRleHQiLCJjcmVhdGlvblByb21pc2VzIiwicHJvcGVydHlWYWx1ZXMiLCJjcmVhdGVQYXJhbWV0ZXJzIiwiaW5hY3RpdmUiLCJwcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eSIsImluZGV4T2YiLCJjcmVhdGVkQ29udGV4dHMiLCJuZXdDb250ZXh0IiwiYkluYWN0aXZlIiwiZXJyIiwib25CZWZvcmVTYXZlIiwiX21QYXJhbWV0ZXJzIiwib25CZWZvcmVEaXNjYXJkIiwic2F2ZURvY3VtZW50IiwiYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IiLCJhQmluZGluZ3MiLCJiaW5kaW5ncyIsIl9zdWJtaXRPcGVuQ2hhbmdlcyIsImlzRmNsRW5hYmxlZCIsImFjdGl2ZURvY3VtZW50Q29udGV4dCIsIl9nZXRSZXNvdXJjZU1vZGVsIiwiZ2V0Q3JlYXRpb25Nb2RlIiwiX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMiLCJBY3RpdmF0ZSIsImRpc2Nvbm5lY3QiLCJfdHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkiLCJTdGFuZGFyZEFjdGlvbnMiLCJzYXZlIiwiVHJpZ2dlclR5cGUiLCJzdGFuZGFyZEFjdGlvbiIsIkRpc3BsYXkiLCJjYW5jZWxlZCIsInRvZ2dsZURyYWZ0QWN0aXZlIiwib0NvbnRleHREYXRhIiwiYkVkaXRhYmxlIiwiYklzRHJhZnQiLCJJc0FjdGl2ZUVudGl0eSIsIkhhc0FjdGl2ZUVudGl0eSIsIkhhc0RyYWZ0RW50aXR5Iiwib1JpZ2h0bW9zdENvbnRleHQiLCJsYXN0U2VtYW50aWNNYXBwaW5nIiwidGVjaG5pY2FsUGF0aCIsInRhcmdldFBhdGgiLCJuZXdQYXRoIiwib2xkUGF0aCIsImNhbmNlbERvY3VtZW50IiwiaXNOZXdEb2N1bWVudCIsImNhbmNlbEJ1dHRvbiIsImNvbnRyb2wiLCJiZWZvcmVDYW5jZWxDYWxsQmFjayIsImNhbmNlbFJlc3VsdCIsImlzRG9jdW1lbnRNb2RpZmllZCIsIkRpc2NhcmQiLCJza2lwQmFja05hdmlnYXRpb24iLCJuYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dCIsIm9BY3RpdmVEb2N1bWVudENvbnRleHQiLCJfZmV0Y2hTZW1hbnRpY0tleVZhbHVlcyIsInNraXBCaW5kaW5nVG9WaWV3Iiwic2hvd0RvY3VtZW50RGlzY2FyZE1lc3NhZ2UiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0Um91dGluZ1NlcnZpY2UiLCJhdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsInNob3dNZXNzYWdlV2hlbk5vQ29udGV4dCIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsImlzRHJhZnRSb290IiwidGFyZ2V0RW50aXR5U2V0IiwiZGVsZXRlRG9jdW1lbnQiLCJnZXRJbmRleCIsInNpYmxpbmdDb250ZXh0IiwiZHJhZnRQYXRoIiwicmVxdWVzdENhbm9uaWNhbFBhdGgiLCJkcmFmdENvbnRleHRUb1JlbW92ZSIsInJlcGxhY2VXaXRoIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwiRGVlcGxpbmsiLCJleGl0RnJvbUFwcCIsImFwcGx5RG9jdW1lbnQiLCJpbnZva2VBY3Rpb24iLCJzQWN0aW9uTmFtZSIsIm1FeHRyYVBhcmFtcyIsIm9Db250cm9sIiwiYVBhcnRzIiwic092ZXJsb2FkRW50aXR5VHlwZSIsIm9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzIiwiQXJyYXkiLCJpc0FycmF5IiwiY29udGV4dHMiLCJpc05hdmlnYWJsZSIsInJlcXVpcmVzTmF2aWdhdGlvbiIsImNvbnZlcnRlZE1ldGFkYXRhIiwiY29udmVydFR5cGVzIiwiZW50aXR5Q29udGFpbmVyIiwibmFtZSIsImlzQm91bmQiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInNwbGl0IiwicmVwbGFjZUFsbCIsImJTdGF0aWNBY3Rpb24iLCJpc1RhYmxlQm91bmQiLCJzQmluZGluZ1BhdGgiLCJwYXRoIiwiX2dldEFjdGlvbk92ZXJsb2FkQ29udGV4dEZyb21NZXRhZGF0YVBhdGgiLCJlbmFibGVBdXRvU2Nyb2xsIiwiY3JlYXRlQWN0aW9uUHJvbWlzZSIsInNJZCIsImJHZXRCb3VuZENvbnRleHQiLCJfZ2V0Qm91bmRDb250ZXh0IiwiYk9iamVjdFBhZ2UiLCJjb252ZXJ0ZXJUeXBlIiwib1Jlc3BvbnNlIiwiY2FsbEFjdGlvbiIsImxpc3RSZWZyZXNoZWQiLCJfcmVmcmVzaExpc3RJZlJlcXVpcmVkIiwiZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyIsImFjdGlvblJlcXVlc3RlZFByb3BlcnRpZXMiLCJ2YWx1ZSIsIkFjdGlvbiIsImFjdGlvbiIsImZSZXNvbHZlciIsInZDb250ZXh0Iiwic0NvbnRleHRNZXRhUGF0aCIsIl9mblZhbGlkQ29udGV4dHMiLCJhcHBsaWNhYmxlQ29udGV4dHMiLCJlbGVtZW50Iiwib0FjdGlvbkNvbnRleHQiLCJzQWN0aW9uQ29udGV4dE1ldGFQYXRoIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJub0hpc3RvcnlFbnRyeSIsImluZm8iLCJmUmVqZWN0b3IiLCJyZWplY3RlZEl0ZW1zIiwic2VjdXJlZEV4ZWN1dGlvbiIsImZuRnVuY3Rpb24iLCJiQnVzeVNldCIsImJ1c3kiLCJzZXQiLCJiQnVzeUNoZWNrIiwiY2hlY2siLCJiVXBkYXRlc0RvY3VtZW50IiwidXBkYXRlc0RvY3VtZW50IiwiZmluYWxseSIsImhhbmRsZVBhdGNoU2VudCIsIm9FdmVudCIsImlzSW5Db2xsYWJvcmF0aXZlRHJhZnQiLCJnZXRTb3VyY2UiLCJzZXRJZ25vcmVFVGFnIiwic291cmNlQmluZGluZyIsIm9QYXRjaFByb21pc2UiLCJwYXRjaENvbXBsZXRlZEV2ZW50IiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnRBZnRlclBhdGNoIiwiYlN1Y2Nlc3MiLCJnZXRQYXJhbWV0ZXIiLCJoYW5kbGVDcmVhdGVBY3RpdmF0ZSIsIm9CaW5kaW5nIiwiYkF0RW5kIiwib1BhcmFtcyIsImFjdGl2YXRlZENvbnRleHQiLCJ3YXJuaW5nIiwibmV3SW5hY3RpdmVDb250ZXh0IiwibmV3VGFzayIsImNvbXB1dGVFZGl0TW9kZSIsImdsb2JhbE1vZGVsIiwiaXNBY3RpdmVFbnRpdHkiLCJoYXNBY3RpdmVFbnRpdHkiLCJsYXN0SW52b2tlZEFjdGlvbk5hbWUiLCJpc05ld0FjdGlvbkZvclN0aWNreSIsImdldFJlc291cmNlTW9kZWwiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJUcmFuc2FjdGlvbkhlbHBlciIsIm1lc3NhZ2VIYW5kbGVyIiwic2V0Q3JlYXRpb25Nb2RlIiwiYkNyZWF0aW9uTW9kZSIsInVpTW9kZWxDb250ZXh0IiwibW9kaWZpZWQiLCJiaW5kaW5nIiwiYXR0YWNoRXZlbnQiLCJzdWNjZXNzIiwiZHJhZnRTdGF0dXMiLCJzb3VyY2UiLCJlZGl0TW9kZSIsImlzQ3JlYXRpb24iLCJhY3Rpb25OYW1lIiwic3RpY2t5U2Vzc2lvbiIsIkFkZGl0aW9uYWxOZXdBY3Rpb25zIiwiaGFzTmF2aWdhdGlvbkd1YXJkIiwiaGFzaFRyYWNrZXIiLCJnZXRIYXNoIiwiaW50ZXJuYWxNb2RlbCIsInNldFRpbWVvdXQiLCJzZXROYXZpZ2F0aW9uR3VhcmQiLCJzdWJzdHJpbmciLCJvbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uIiwiZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24iLCJnZXREaXJ0eVN0YXRlUHJvdmlkZXIiLCJyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImkxOG5Nb2RlbCIsInNlc3Npb25UaW1lb3V0RnVuY3Rpb24iLCJnZXRTZXNzaW9uVGltZW91dEZ1bmN0aW9uIiwiYXR0YWNoU2Vzc2lvblRpbWVvdXQiLCJzdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24iLCJnZXRSb3V0ZU1hdGNoZWRGdW5jdGlvbiIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsImhhbmRsZVN0aWNreU9mZiIsImRpc2NhcmROYXZpZ2F0aW9uR3VhcmQiLCJkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGV0YWNoU2Vzc2lvblRpbWVvdXQiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJnZXRIdHRwSGVhZGVycyIsIm5hdmlnYXRpb25Db250ZXh0IiwidGFyZ2V0SGFzaCIsImlubmVyQXBwUm91dGUiLCJyb3V0ZXJQcm94eSIsImxjbEhhc2hUcmFja2VyIiwiaXNEaXJ0eSIsImlzU2Vzc2lvbk9uIiwiaXNOYXZpZ2F0aW9uRmluYWxpemVkIiwiY2hlY2tIYXNoV2l0aEd1YXJkIiwiaXNHdWFyZENyb3NzQWxsb3dlZEJ5VXNlciIsInNldERpcnR5RmxhZyIsIndhcm5pbmdEaWFsb2ciLCJEaWFsb2ciLCJzdGF0ZSIsImNvbnRlbnQiLCJUZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJwcmVzcyIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsInNldE1vZGVsIiwiYWRkRGVwZW5kZW50Iiwib3BlbiIsImN1cnJlbnRIYXNoIiwiZGlzY2FyZFN0aWNreVNlc3Npb24iLCJjbGVhclNlc3Npb25Db250ZXh0IiwiZGlzY2FyZGVkQ29udGV4dCIsInN0aWNreSIsImRpc2NhcmREb2N1bWVudCIsImhhc1BlbmRpbmdDaGFuZ2VzIiwicmVzZXRDaGFuZ2VzIiwiX3JvdXRpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJnZXRMYXN0U2VtYW50aWNNYXBwaW5nIiwicmVzb2x2ZUZ1bmN0aW9uIiwicmVqZWN0RnVuY3Rpb24iLCJhY3Rpb25Qcm9taXNlIiwiYXNzaWduIiwicmVzcG9uc2UiLCJjdXJyZW50VmlldyIsIm1ldGFNb2RlbERhdGEiLCJhY3Rpb25SZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCIkVHlwZSIsIiRLZXkiLCJvRGF0YSIsImdldEN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UiLCJfc2Nyb2xsQW5kRm9jdXNPbkluYWN0aXZlUm93IiwidGFibGUiLCJyb3dCaW5kaW5nIiwiYWN0aXZlUm93SW5kZXgiLCJnZXRDb3VudCIsImFsbFJvd0NvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJpbmRleCIsInNpbmdsZUNvbnRleHQiLCJpc0luYWN0aXZlIiwiY3JlYXRlRW1wdHlSb3dzQW5kRm9jdXMiLCJ0YWJsZUFQSSIsInRhYmxlRGVmaW5pdGlvbiIsImlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUiLCJzZXRVcEVtcHR5Um93cyIsInJlbGF0ZWRDb250ZXh0cyIsInJlZnJlc2hMaXN0QmluZGluZyIsInRyaWdnZXJUeXBlIiwidHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkiLCJzdWJtaXRCYXRjaCIsIm9SZXF1ZXN0b3IiLCJ3YWl0Rm9yUnVubmluZ0NoYW5nZVJlcXVlc3RzIiwidmlldyIsImNoZWNrSWZCYWNrSXNPdXRPZkd1YXJkIiwiYmluZGluZ0NvbnRleHQiLCJwcm9jZXNzRGF0YUxvc3NDb25maXJtYXRpb24iLCJoaXN0b3J5IiwiYmFjayIsImJSZWNyZWF0ZUNvbnRleHQiLCJiUGVyc2lzdE9QU2Nyb2xsIiwic2hvd1BsYWNlaG9sZGVyIiwia2VlcEN1cnJlbnRMYXlvdXQiLCJwYXJhbXMiLCJiUmVmcmVzaEFmdGVyQWN0aW9uIiwic1ZpZXdJZCIsImdldElkIiwiYU1lc3NhZ2VzIiwiaSIsInZhbGlkYXRpb24iLCJnZXRDb250cm9sSWQiLCJhS2V5cyIsIm9DdXJyZW50RGF0YSIsImJSZXR1cm5lZENvbnRleHRJc1NhbWUiLCJldmVyeSIsInNLZXkiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImUiLCJzRW50aXR5U2V0TmFtZSIsImFTZW1hbnRpY0tleXMiLCJhUmVxdWVzdFByb21pc2VzIiwib0tleSIsIiRQcm9wZXJ0eVBhdGgiLCJyb290Q29udGV4dCIsIm92ZXJsb2FkRW50aXR5VHlwZSIsImNvbnRleHRTZWdtZW50cyIsImN1cnJlbnRDb250ZXh0IiwicG9wIiwidW5zaGlmdCIsInBhcmVudENvbnRleHRzIiwicGF0aFNlZ21lbnQiLCJyZXZlcnNlIiwib3ZlcmxvYWRDb250ZXh0IiwiZmluZCIsInBhcmVudENvbnRleHQiLCJtYXBwaW5ncyIsInNldFBhdGhNYXBwaW5nIiwibmV3RG9jdW1lbnRDb250ZXh0Iiwicm9vdEN1cnJlbnRDb250ZXh0IiwicmlnaHRtb3N0Q3VycmVudENvbnRleHQiLCJkb05vdENvbXB1dGVJZlJvb3QiLCJzdGFydHNXaXRoIiwiZHJhZnQiLCJjb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRWRpdEZsb3cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgQWN0aXZpdHlTeW5jIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgQWN0aXZpdHksIHNoYXJlT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHR5cGUgeyBTaWJsaW5nSW5mb3JtYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBzdGlja3kgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L3N0aWNreVwiO1xuaW1wb3J0IFRyYW5zYWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9UcmFuc2FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IHsgU3RhbmRhcmRBY3Rpb25zLCB0cmlnZ2VyQ29uZmlndXJlZFN1cnZleSwgVHJpZ2dlclR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvRmVlZGJhY2tcIjtcbmltcG9ydCB0eXBlIEludGVybmFsUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgeyBjb252ZXJ0VHlwZXMsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgeyBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNLZXlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNLZXlIZWxwZXJcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNNYXBwaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgY29yZUxpYnJhcnkgZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwiLi4vQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcblxuY29uc3QgQ3JlYXRpb25Nb2RlID0gRkVMaWJyYXJ5LkNyZWF0aW9uTW9kZSxcblx0UHJvZ3JhbW1pbmdNb2RlbCA9IEZFTGlicmFyeS5Qcm9ncmFtbWluZ01vZGVsLFxuXHRDb25zdGFudHMgPSBGRUxpYnJhcnkuQ29uc3RhbnRzLFxuXHREcmFmdFN0YXR1cyA9IEZFTGlicmFyeS5EcmFmdFN0YXR1cyxcblx0RWRpdE1vZGUgPSBGRUxpYnJhcnkuRWRpdE1vZGUsXG5cdFN0YXJ0dXBNb2RlID0gRkVMaWJyYXJ5LlN0YXJ0dXBNb2RlLFxuXHRNZXNzYWdlVHlwZSA9IGNvcmVMaWJyYXJ5Lk1lc3NhZ2VUeXBlO1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgZWRpdCBmbG93IG9mIHRoZSBhcHBsaWNhdGlvblxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcIilcbmNsYXNzIEVkaXRGbG93IGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBkaXJ0eVN0YXRlUHJvdmlkZXJGdW5jdGlvbj86IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgc2Vzc2lvblRpbWVvdXRGdW5jdGlvbj86IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgc3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbkZ1bmN0aW9uPzogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBzeW5jVGFza3M6IFByb21pc2U8YW55PiA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5cdHByaXZhdGUgYWN0aW9uUHJvbWlzZT86IFByb21pc2U8YW55PjtcblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBQdWJsaWMgbWV0aG9kc1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdGdldEFwcENvbXBvbmVudCgpOiBBcHBDb21wb25lbnQge1xuXHRcdHJldHVybiB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGRyYWZ0IGRvY3VtZW50IGZvciBhbiBleGlzdGluZyBhY3RpdmUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgZWRpdGFibGUgZG9jdW1lbnQgaXMgYXZhaWxhYmxlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNlZGl0RG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgZWRpdERvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYkRyYWZ0TmF2aWdhdGlvbiA9IHRydWU7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX2dldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueTtcblx0XHRjb25zdCBtb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0bGV0IHJpZ2h0bW9zdENvbnRleHQsIHNpYmxpbmdJbmZvO1xuXHRcdGNvbnN0IG9WaWV3RGF0YSA9IHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3M7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXHRcdGxldCBvUm9vdENvbnRleHQ6IENvbnRleHQgPSBvQ29udGV4dDtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoKG9WaWV3RGF0YT8udmlld0xldmVsIGFzIG51bWJlcikgPiAxKSB7XG5cdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHRcdGNvbnN0IGRyYWZ0Um9vdFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IE1vZGVsSGVscGVyLmdldERyYWZ0Um9vdFBhdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdG9Sb290Q29udGV4dCA9IG9WaWV3XG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmJpbmRDb250ZXh0KGRyYWZ0Um9vdFBhdGggYXMgc3RyaW5nKVxuXHRcdFx0XHRcdFx0LmdldEJvdW5kQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdFx0YXdhaXQgb1Jvb3RDb250ZXh0LnJlcXVlc3RPYmplY3QoZHJhZnRSb290UGF0aCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1N0aWNreVJvb3RQYXRoID0gTW9kZWxIZWxwZXIuZ2V0U3RpY2t5Um9vdFBhdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdG9Sb290Q29udGV4dCA9IG9WaWV3XG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmJpbmRDb250ZXh0KHNTdGlja3lSb290UGF0aCBhcyBzdHJpbmcpXG5cdFx0XHRcdFx0XHQuZ2V0Qm91bmRDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdFx0XHRhd2FpdCBvUm9vdENvbnRleHQucmVxdWVzdE9iamVjdChzU3RpY2t5Um9vdFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRhd2FpdCB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVFZGl0KHsgY29udGV4dDogb1Jvb3RDb250ZXh0IH0pO1xuXHRcdFx0Y29uc3Qgb05ld0RvY3VtZW50Q29udGV4dCA9IGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmVkaXREb2N1bWVudChcblx0XHRcdFx0b1Jvb3RDb250ZXh0LFxuXHRcdFx0XHR0aGlzLmdldFZpZXcoKSxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpXG5cdFx0XHQpO1xuXG5cdFx0XHR0aGlzLl9zZXRTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHNQcm9ncmFtbWluZ01vZGVsLCBtb2RlbCk7XG5cblx0XHRcdGlmIChvTmV3RG9jdW1lbnRDb250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRWRpdGFibGUsIGZhbHNlKTtcblx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkKGZhbHNlKTtcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cblx0XHRcdFx0aWYgKG9OZXdEb2N1bWVudENvbnRleHQgIT09IG9Sb290Q29udGV4dCkge1xuXHRcdFx0XHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZTogQ29udGV4dCB8IHVuZGVmaW5lZCA9IG9OZXdEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0XHRyaWdodG1vc3RDb250ZXh0ID0gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob1Jvb3RDb250ZXh0LCByaWdodG1vc3RDb250ZXh0LCBzUHJvZ3JhbW1pbmdNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRzaWJsaW5nSW5mbyA9IHNpYmxpbmdJbmZvID8/IHRoaXMuX2NyZWF0ZVNpYmxpbmdJbmZvKG9Db250ZXh0LCBvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVBhdGhzSW5IaXN0b3J5KHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nKTtcblx0XHRcdFx0XHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPSBvTmV3RG9jdW1lbnRDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmICgob1ZpZXdEYXRhPy52aWV3TGV2ZWwgYXMgbnVtYmVyKSA+IDEpIHtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gYXdhaXQgdGhpcy5fY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvUm9vdENvbnRleHQsIG9Db250ZXh0LCBzUHJvZ3JhbW1pbmdNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHRoaXMuX2dldE5hdmlnYXRpb25UYXJnZXRGb3JFZGl0KG9Db250ZXh0LCBvTmV3RG9jdW1lbnRDb250ZXh0LCBzaWJsaW5nSW5mbykgYXMgQ29udGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChjb250ZXh0VG9OYXZpZ2F0ZSwgdHJ1ZSwgZmFsc2UsIGJEcmFmdE5hdmlnYXRpb24sIHRydWUpO1xuXHRcdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdFx0XHRcdC8vIFRoZSBzdGlja3lPbiBoYW5kbGVyIG11c3QgYmUgc2V0IGFmdGVyIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIGRvbmUsXG5cdFx0XHRcdFx0XHQvLyBhcyB0aGUgVVJMIG1heSBjaGFuZ2UgaW4gdGhlIGNhc2Ugb2YgRkNMXG5cdFx0XHRcdFx0XHRsZXQgc3RpY2t5Q29udGV4dDogQ29udGV4dDtcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBXZSBuZWVkIHRvIHVzZSB0aGUga2VwdC1hbGl2ZSBjb250ZXh0IHVzZWQgdG8gYmluZCB0aGUgcGFnZVxuXHRcdFx0XHRcdFx0XHRzdGlja3lDb250ZXh0ID0gb05ld0RvY3VtZW50Q29udGV4dC5nZXRNb2RlbCgpLmdldEtlZXBBbGl2ZUNvbnRleHQob05ld0RvY3VtZW50Q29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3RpY2t5Q29udGV4dCA9IG9OZXdEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZVN0aWNreU9uKHN0aWNreUNvbnRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobW9kZWwuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdFx0XHQvLyBhY2NvcmRpbmcgdG8gVVggaW4gY2FzZSBvZiBlbmFibGVkIGNvbGxhYm9yYXRpb24gZHJhZnQgd2Ugc2hhcmUgdGhlIG9iamVjdCBpbW1lZGlhdGVseVxuXHRcdFx0XHRcdFx0YXdhaXQgc2hhcmVPYmplY3Qob05ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBlZGl0aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBzZXZlcmFsIGRvY3VtZW50cy5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRzVG9EZWxldGUgVGhlIGNvbnRleHRzIG9mIHRoZSBkb2N1bWVudHMgdG8gZGVsZXRlXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzIFRoZSBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgZG9jdW1lbnRzIGFyZSBkZWxldGVkXG5cdCAqL1xuXHRhc3luYyBkZWxldGVNdWx0aXBsZURvY3VtZW50cyhjb250ZXh0c1RvRGVsZXRlOiBDb250ZXh0W10sIHBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGlmIChwYXJhbWV0ZXJzKSB7XG5cdFx0XHRwYXJhbWV0ZXJzLmJlZm9yZURlbGV0ZUNhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRiZWZvcmVEZWxldGVDYWxsQmFjazogdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjb25zdCBsb2NrT2JqZWN0ID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0Y29uc3QgcGFyZW50Q29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQocGFyYW1ldGVycy5jb250cm9sSWQpO1xuXHRcdGlmICghcGFyZW50Q29udHJvbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicGFyYW1ldGVyIGNvbnRyb2xJZCBtaXNzaW5nIG9yIGluY29ycmVjdFwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gcGFyZW50Q29udHJvbDtcblx0XHR9XG5cdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSAocGFyZW50Q29udHJvbC5nZXRCaW5kaW5nKFwiaXRlbXNcIikgfHwgKHBhcmVudENvbnRyb2wgYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKSkgYXMgT0RhdGFMaXN0QmluZGluZztcblx0XHRwYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMgPSB0cnVlO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhsb2NrT2JqZWN0KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24oY29udGV4dHNUb0RlbGV0ZSwgcGFyYW1ldGVycyk7XG5cdFx0XHRsZXQgcmVzdWx0O1xuXG5cdFx0XHQvLyBNdWx0aXBsZSBvYmplY3QgZGVsZXRpb24gaXMgdHJpZ2dlcmVkIGZyb20gYSBsaXN0XG5cdFx0XHQvLyBGaXJzdCBjbGVhciB0aGUgc2VsZWN0aW9uIGluIHRoZSB0YWJsZSBhcyBpdCdzIG5vdCB2YWxpZCBhbnkgbW9yZVxuXHRcdFx0aWYgKHBhcmVudENvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHQocGFyZW50Q29udHJvbCBhcyBhbnkpLmNsZWFyU2VsZWN0aW9uKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRoZW4gcmVmcmVzaCB0aGUgbGlzdC1iaW5kaW5nIChMUiksIG9yIHJlcXVpcmUgc2lkZS1lZmZlY3RzIChPUClcblx0XHRcdGNvbnN0IHZpZXdCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRpZiAoKGxpc3RCaW5kaW5nIGFzIGFueSkuaXNSb290KCkpIHtcblx0XHRcdFx0Ly8ga2VlcCBwcm9taXNlIGNoYWluIHBlbmRpbmcgdW50aWwgcmVmcmVzaCBvZiBsaXN0YmluZGluZyBpcyBjb21wbGV0ZWRcblx0XHRcdFx0cmVzdWx0ID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRsaXN0QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0bGlzdEJpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0fSBlbHNlIGlmICh2aWV3QmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIHRyYW5zaWVudCBjb250ZXh0cywgd2UgbXVzdCBhdm9pZCByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdC8vIGlmIGxpc3QgYmluZGluZyBpcyByZWZyZXNoZWQsIHRyYW5zaWVudCBjb250ZXh0cyBtaWdodCBiZSBsb3N0XG5cdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChsaXN0QmluZGluZykpIHtcblx0XHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdC5yZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkobGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCB2aWV3QmluZGluZ0NvbnRleHQgYXMgQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gZGVsZXRpbmcgYXQgbGVhc3Qgb25lIG9iamVjdCBzaG91bGQgYWxzbyBzZXQgdGhlIFVJIHRvIGRpcnR5XG5cdFx0XHRpZiAoIXRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRBY3Rpdml0eVN5bmMuc2VuZChcblx0XHRcdFx0dGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdEFjdGl2aXR5LkRlbGV0ZSxcblx0XHRcdFx0Y29udGV4dHNUb0RlbGV0ZS5tYXAoKGNvbnRleHQ6IENvbnRleHQpID0+IGNvbnRleHQuZ2V0UGF0aCgpKVxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkZWxldGluZyB0aGUgZG9jdW1lbnQocylcIiwgZXJyb3IpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhsb2NrT2JqZWN0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZHJhZnQgc3RhdHVzIGFuZCBkaXNwbGF5cyB0aGUgZXJyb3IgbWVzc2FnZXMgaWYgdGhlcmUgYXJlIGVycm9ycyBkdXJpbmcgYW4gdXBkYXRlLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHVwZGF0ZWRDb250ZXh0IENvbnRleHQgb2YgdGhlIHVwZGF0ZWQgZmllbGRcblx0ICogQHBhcmFtIHVwZGF0ZVByb21pc2UgUHJvbWlzZSB0byBkZXRlcm1pbmUgd2hlbiB0aGUgdXBkYXRlIG9wZXJhdGlvbiBpcyBjb21wbGV0ZWQuIFRoZSBwcm9taXNlIHNob3VsZCBiZSByZXNvbHZlZCB3aGVuIHRoZSB1cGRhdGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlZCwgc28gdGhlIGRyYWZ0IHN0YXR1cyBjYW4gYmUgdXBkYXRlZC5cblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIGRyYWZ0IHN0YXR1cyBoYXMgYmVlbiB1cGRhdGVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyN1cGRhdGVEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHR1cGRhdGVEb2N1bWVudCh1cGRhdGVkQ29udGV4dDogb2JqZWN0LCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPGFueT4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvcmlnaW5hbEJpbmRpbmdDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBpc0RyYWZ0ID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKHVwZGF0ZWRDb250ZXh0IGFzIEJpbmRpbmcgfCBDb250ZXh0KSA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdDtcblxuXHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRyZXR1cm4gdGhpcy5zeW5jVGFzayhhc3luYyAoKSA9PiB7XG5cdFx0XHRpZiAob3JpZ2luYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQodHJ1ZSk7XG5cdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChpc0RyYWZ0KSB7XG5cdFx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHVwZGF0ZVByb21pc2U7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGlmICghaXNEcmFmdCB8fCAhY3VycmVudEJpbmRpbmdDb250ZXh0IHx8IGN1cnJlbnRCaW5kaW5nQ29udGV4dCAhPT0gb3JpZ2luYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRcdC8vIElmIGEgbmF2aWdhdGlvbiBoYXBwZW5lZCB3aGlsZSBvUHJvbWlzZSB3YXMgYmVpbmcgcmVzb2x2ZWQsIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgY2hhbmdlZFxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHN0aWxsIG9uIHRoZSBzYW1lIGNvbnRleHRcblx0XHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gY3VycmVudEJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVNldE5hbWUgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoY3VycmVudEJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSkuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIik7XG5cdFx0XHRcdGNvbnN0IHNlbWFudGljS2V5cyA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljS2V5cyhtZXRhTW9kZWwsIGVudGl0eVNldE5hbWUpO1xuXHRcdFx0XHRpZiAoc2VtYW50aWNLZXlzPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fZ2V0U2VtYW50aWNNYXBwaW5nKCk7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFNlbWFudGljUGF0aCA9IGN1cnJlbnRTZW1hbnRpY01hcHBpbmc/LnNlbWFudGljUGF0aCxcblx0XHRcdFx0XHRcdHNDaGFuZ2VkUGF0aCA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChjdXJyZW50QmluZGluZ0NvbnRleHQsIHRydWUpO1xuXHRcdFx0XHRcdC8vIGN1cnJlbnRTZW1hbnRpY1BhdGggY291bGQgYmUgbnVsbCBpZiB3ZSBoYXZlIG5hdmlnYXRlZCB2aWEgZGVlcCBsaW5rIHRoZW4gdGhlcmUgYXJlIG5vIHNlbWFudGljTWFwcGluZ3MgdG8gY2FsY3VsYXRlIGl0IGZyb21cblx0XHRcdFx0XHRpZiAoY3VycmVudFNlbWFudGljUGF0aCAmJiBjdXJyZW50U2VtYW50aWNQYXRoICE9PSBzQ2hhbmdlZFBhdGgpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY3VycmVudEJpbmRpbmdDb250ZXh0IGFzIENvbnRleHQsIHRydWUsIGZhbHNlLCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgdXBkYXRpbmcgdGhlIGRvY3VtZW50XCIsIGVycm9yKTtcblx0XHRcdFx0aWYgKGlzRHJhZnQgJiYgb3JpZ2luYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gKiBAcGFyYW0ge3N0cmluZ30gbVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlIFRoZSBjcmVhdGlvbiBtb2RlIHVzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBTeW5jIC0gdGhlIGNyZWF0aW9uIGlzIHRyaWdnZXJlZCBhbmQgb25jZSB0aGUgZG9jdW1lbnQgaXMgY3JlYXRlZCwgdGhlIG5hdmlnYXRpb24gaXMgZG9uZVxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBBc3luYyAtIHRoZSBjcmVhdGlvbiBhbmQgdGhlIG5hdmlnYXRpb24gdG8gdGhlIGluc3RhbmNlIGFyZSBkb25lIGluIHBhcmFsbGVsXG5cdC8vICogICAgICAgICAgICAgICAgICAgIERlZmVycmVkIC0gdGhlIGNyZWF0aW9uIGlzIGRvbmUgb24gdGhlIHRhcmdldCBwYWdlXG5cdC8vICogICAgICAgICAgICAgICAgICAgIENyZWF0aW9uUm93IC0gVGhlIGNyZWF0aW9uIGlzIGRvbmUgaW5saW5lIGFzeW5jIHNvIHRoZSB1c2VyIGlzIG5vdCBibG9ja2VkXG5cdC8vIG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93IEluc3RhbmNlIG9mIHRoZSBjcmVhdGlvbiByb3cgLSAoVE9ETzogZ2V0IHJpZCBidXQgdXNlIGxpc3QgYmluZGluZ3Mgb25seSlcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSB2TGlzdEJpbmRpbmcgIE9EYXRhTGlzdEJpbmRpbmcgb2JqZWN0IG9yIHRoZSBiaW5kaW5nIHBhdGggZm9yIGEgdGVtcG9yYXJ5IGxpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycyBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSBUaGUgY3JlYXRpb24gbW9kZSB1c2luZyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0ICogICAgICAgICAgICAgICAgICAgIE5ld1BhZ2UgLSB0aGUgY3JlYXRlZCBkb2N1bWVudCBpcyBzaG93biBpbiBhIG5ldyBwYWdlLCBkZXBlbmRpbmcgb24gd2hldGhlciBtZXRhZGF0YSAnU3luYycsICdBc3luYycgb3IgJ0RlZmVycmVkJyBpcyB1c2VkXG5cdCAqICAgICAgICAgICAgICAgICAgICBJbmxpbmUgLSBUaGUgY3JlYXRpb24gaXMgZG9uZSBpbmxpbmUgKGluIGEgdGFibGUpXG5cdCAqICAgICAgICAgICAgICAgICAgICBFeHRlcm5hbCAtIFRoZSBjcmVhdGlvbiBpcyBkb25lIGluIGEgZGlmZmVyZW50IGFwcGxpY2F0aW9uIHNwZWNpZmllZCB2aWEgdGhlIHBhcmFtZXRlciAnb3V0Ym91bmQnXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnRhYmxlSWQgSUQgb2YgdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLm91dGJvdW5kIFRoZSBuYXZpZ2F0aW9uIHRhcmdldCB3aGVyZSB0aGUgZG9jdW1lbnQgaXMgY3JlYXRlZCBpbiBjYXNlIG9mIGNyZWF0aW9uTW9kZSAnRXh0ZXJuYWwnXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNyZWF0ZUF0RW5kIFNwZWNpZmllcyBpZiB0aGUgbmV3IGVudHJ5IHNob3VsZCBiZSBjcmVhdGVkIGF0IHRoZSB0b3Agb3IgYm90dG9tIG9mIGEgdGFibGUgaW4gY2FzZSBvZiBjcmVhdGlvbk1vZGUgJ0lubGluZSdcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBvYmplY3QgaGFzIGJlZW4gY3JlYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjY3JlYXRlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgY3JlYXRlRG9jdW1lbnQoXG5cdFx0dkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nIHwgc3RyaW5nLFxuXHRcdG1JblBhcmFtZXRlcnM6IHtcblx0XHRcdGNyZWF0aW9uTW9kZTogc3RyaW5nO1xuXHRcdFx0dGFibGVJZD86IHN0cmluZztcblx0XHRcdG91dGJvdW5kPzogc3RyaW5nO1xuXHRcdFx0Y3JlYXRlQXRFbmQ/OiBib29sZWFuO1xuXHRcdH1cblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXHRcdGxldCBvVGFibGU6IGFueTsgLy9zaG91bGQgYmUgVGFibGUgYnV0IHRoZXJlIGFyZSBtaXNzaW5nIG1ldGhvZHMgaW50byB0aGUgZGVmXG5cdFx0bGV0IG1QYXJhbWV0ZXJzOiBhbnkgPSBtSW5QYXJhbWV0ZXJzO1xuXHRcdGxldCBvQ3JlYXRpb246IFByb21pc2U8Q29udGV4dD4gfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgYlNob3VsZEJ1c3lMb2NrID1cblx0XHRcdCFtUGFyYW1ldGVycyB8fFxuXHRcdFx0KG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZSAmJlxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJlxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5FeHRlcm5hbCk7XG5cdFx0bGV0IG9FeGVjQ3VzdG9tVmFsaWRhdGlvbiA9IFByb21pc2UucmVzb2x2ZShbXSk7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLnJlbW92ZUlBcHBTdGF0ZUtleSgpO1xuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkV4dGVybmFsKSB7XG5cdFx0XHQvLyBDcmVhdGUgYnkgbmF2aWdhdGluZyB0byBhbiBleHRlcm5hbCB0YXJnZXRcblx0XHRcdC8vIFRPRE86IENhbGwgYXBwcm9wcmlhdGUgZnVuY3Rpb24gKGN1cnJlbnRseSB1c2luZyB0aGUgc2FtZSBhcyBmb3Igb3V0Ym91bmQgY2hldnJvbiBuYXYsIGFuZCB3aXRob3V0IGFueSBjb250ZXh0IC0gM3JkIHBhcmFtKVxuXHRcdFx0YXdhaXQgdGhpcy5zeW5jVGFzaygpO1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRjb25zdCBzQ3JlYXRlUGF0aCA9IE1vZGVsSGVscGVyLmdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyh0aGlzLmdldFZpZXcoKSwgdkxpc3RCaW5kaW5nKTtcblxuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuaGFuZGxlcnMub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBtUGFyYW1ldGVycy5vdXRib3VuZCwgdW5kZWZpbmVkLCBzQ3JlYXRlUGF0aCk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cpIHtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvd09iamVjdHMgPSBtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldE9iamVjdCgpO1xuXHRcdFx0ZGVsZXRlIG9DcmVhdGlvblJvd09iamVjdHNbXCJAJHVpNS5jb250ZXh0LmlzVHJhbnNpZW50XCJdO1xuXHRcdFx0b1RhYmxlID0gbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0UGFyZW50KCk7XG5cdFx0XHRvRXhlY0N1c3RvbVZhbGlkYXRpb24gPSB0aGlzLnZhbGlkYXRlRG9jdW1lbnQob1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCksIHtcblx0XHRcdFx0ZGF0YTogb0NyZWF0aW9uUm93T2JqZWN0cyxcblx0XHRcdFx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSBpcyBzZXQgdG8gZmFsc2UgaW4gbWFuaWZlc3QgY29udmVydGVyIChUYWJsZS50cykgaWYgY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIGV4aXN0c1xuXHRcdFx0aWYgKG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLmRhdGEoXCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhXCIpID09PSBcInRydWVcIikge1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIHt9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lICYmIG1QYXJhbWV0ZXJzLnRhYmxlSWQpIHtcblx0XHRcdG9UYWJsZSA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMudGFibGVJZCkgYXMgVGFibGU7XG5cdFx0fVxuXG5cdFx0aWYgKG9UYWJsZSAmJiBvVGFibGUuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0Y29uc3QgZm5Gb2N1c09yU2Nyb2xsID1cblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lID8gb1RhYmxlLmZvY3VzUm93LmJpbmQob1RhYmxlKSA6IG9UYWJsZS5zY3JvbGxUb0luZGV4LmJpbmQob1RhYmxlKTtcblx0XHRcdG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuYXR0YWNoRXZlbnRPbmNlKFwiY2hhbmdlXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0YXdhaXQgb0NyZWF0aW9uO1xuXHRcdFx0XHRmbkZvY3VzT3JTY3JvbGwobVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQgPyBvVGFibGUuZ2V0Um93QmluZGluZygpLmdldExlbmd0aCgpIDogMCwgdHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdCBoYW5kbGVTaWRlRWZmZWN0cyA9IGFzeW5jIChvTGlzdEJpbmRpbmc6IGFueSwgb0NyZWF0aW9uUHJvbWlzZTogUHJvbWlzZTxDb250ZXh0PikgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb05ld0NvbnRleHQgPSBhd2FpdCBvQ3JlYXRpb25Qcm9taXNlO1xuXHRcdFx0XHQvLyB0cmFuc2llbnQgY29udGV4dHMgYXJlIHJlbGlhYmx5IHJlbW92ZWQgb25jZSBvTmV3Q29udGV4dC5jcmVhdGVkKCkgaXMgcmVzb2x2ZWRcblx0XHRcdFx0YXdhaXQgb05ld0NvbnRleHQuY3JlYXRlZCgpO1xuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdFx0Ly8gdGhpcyBpcyBhdm9pZCBhIHBvdGVudGlhbCBsaXN0IHJlZnJlc2gsIHRoZXJlIGNvdWxkIGJlIGEgc2lkZSBlZmZlY3QgdGhhdCByZWZyZXNoZXMgdGhlIGxpc3QgYmluZGluZ1xuXHRcdFx0XHQvLyBpZiBsaXN0IGJpbmRpbmcgaXMgcmVmcmVzaGVkLCB0cmFuc2llbnQgY29udGV4dHMgbWlnaHQgYmUgbG9zdFxuXHRcdFx0XHRpZiAoIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQob0xpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBvQmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjcmVhdGluZyB0aGUgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIGFWYWxpZGF0aW9uTWVzc2FnZXMgRXJyb3IgbWVzc2FnZXMgZnJvbSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHRcdCAqL1xuXHRcdGNvbnN0IGNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyA9IChhVmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnlbXSkgPT4ge1xuXHRcdFx0Y29uc3Qgc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpO1xuXHRcdFx0Y29uc3QgbUN1c3RvbVZhbGlkaXR5ID0gb1RhYmxlICYmIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcImNyZWF0aW9uUm93Q3VzdG9tVmFsaWRpdHlcIik7XG5cdFx0XHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdFx0XHRjb25zdCBhQ3VzdG9tTWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0XHRsZXQgb0ZpZWxkQ29udHJvbDtcblx0XHRcdGxldCBzVGFyZ2V0OiBzdHJpbmc7XG5cblx0XHRcdC8vIFJlbW92ZSBleGlzdGluZyBDdXN0b21WYWxpZGF0aW9uIG1lc3NhZ2Vcblx0XHRcdG9NZXNzYWdlTWFuYWdlclxuXHRcdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdFx0LmdldERhdGEoKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdGlmIChvTWVzc2FnZS5jb2RlID09PSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdGFWYWxpZGF0aW9uTWVzc2FnZXMuZm9yRWFjaCgob1ZhbGlkYXRpb25NZXNzYWdlOiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gSGFuZGxlIEJvdW5kIEN1c3RvbVZhbGlkYXRpb24gbWVzc2FnZVxuXHRcdFx0XHRpZiAob1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUYXJnZXQpIHtcblx0XHRcdFx0XHRvRmllbGRDb250cm9sID0gQ29yZS5nZXRDb250cm9sKG1DdXN0b21WYWxpZGl0eVtvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldF0uZmllbGRJZCkgYXMgQ29udHJvbDtcblx0XHRcdFx0XHRzVGFyZ2V0ID0gYCR7b0ZpZWxkQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7b0ZpZWxkQ29udHJvbC5nZXRCaW5kaW5nUGF0aChcInZhbHVlXCIpfWA7XG5cdFx0XHRcdFx0Ly8gQWRkIHZhbGlkYXRpb24gbWVzc2FnZSBpZiBzdGlsbCBub3QgZXhpc3RzXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0b01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb01lc3NhZ2UudGFyZ2V0ID09PSBzVGFyZ2V0O1xuXHRcdFx0XHRcdFx0XHR9KS5sZW5ndGggPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhcblx0XHRcdFx0XHRcdFx0bmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IG9WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGV4dCxcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzb3I6IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogTWVzc2FnZVR5cGUuRXJyb3IsXG5cdFx0XHRcdFx0XHRcdFx0Y29kZTogc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRcdFx0XHRcdFx0XHR0ZWNobmljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHRhcmdldDogc1RhcmdldFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQWRkIGNvbnRyb2xJZCBpbiBvcmRlciB0byBnZXQgdGhlIGZvY3VzIGhhbmRsaW5nIG9mIHRoZSBlcnJvciBwb3BvdmVyIHJ1bmFibGVcblx0XHRcdFx0XHRjb25zdCBhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXMgPSBvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldERhdGEoKVxuXHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb01lc3NhZ2UudGFyZ2V0ID09PSBzVGFyZ2V0O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YUV4aXN0aW5nVmFsaWRhdGlvbk1lc3NhZ2VzWzBdLmFkZENvbnRyb2xJZChtQ3VzdG9tVmFsaWRpdHlbb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUYXJnZXRdLmZpZWxkSWQpO1xuXG5cdFx0XHRcdFx0Ly8gSGFuZGxlIFVuYm91bmQgQ3VzdG9tVmFsaWRhdGlvbiBtZXNzYWdlXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUN1c3RvbU1lc3NhZ2VzLnB1c2goe1xuXHRcdFx0XHRcdFx0Y29kZTogc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRcdFx0XHRcdHRleHQ6IG9WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGV4dCxcblx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0XHR0eXBlOiBNZXNzYWdlVHlwZS5FcnJvclxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGFDdXN0b21NZXNzYWdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXM6IGFDdXN0b21NZXNzYWdlc1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgcmVzb2x2ZUNyZWF0aW9uTW9kZSA9IChcblx0XHRcdGluaXRpYWxDcmVhdGlvbk1vZGU6IHN0cmluZyxcblx0XHRcdHByb2dyYW1taW5nTW9kZWw6IHN0cmluZyxcblx0XHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdFx0KTogc3RyaW5nID0+IHtcblx0XHRcdGlmIChpbml0aWFsQ3JlYXRpb25Nb2RlICYmIGluaXRpYWxDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0XHRcdC8vIHVzZSB0aGUgcGFzc2VkIGNyZWF0aW9uIG1vZGVcblx0XHRcdFx0cmV0dXJuIGluaXRpYWxDcmVhdGlvbk1vZGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOZXdBY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgZm9yIE5hdmlnYXRpb25Qcm9wZXJ0eSBjb2xsZWN0aW9uXG5cdFx0XHRcdGlmICghb0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoID0gb0xpc3RCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdC8vIGlmIE5ld0FjdGlvbiB3aXRoIHBhcmFtZXRlcnMgaXMgcHJlc2VudCwgdGhlbiBjcmVhdGlvbiBpcyAnRGVmZXJyZWQnXG5cdFx0XHRcdFx0XHQvLyBpbiB0aGUgYWJzZW5jZSBvZiBOZXdBY3Rpb24gb3IgTmV3QWN0aW9uIHdpdGggcGFyYW1ldGVycywgY3JlYXRpb24gaXMgYXN5bmNcblx0XHRcdFx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9OZXdBY3Rpb25gKVxuXHRcdFx0XHRcdFx0XHRcdDogb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZC9OZXdBY3Rpb25gKTtcblx0XHRcdFx0XHRpZiAoc05ld0FjdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c05ld0FjdGlvbn0vQCR1aTUub3ZlcmxvYWQvMC8kUGFyYW1ldGVyYCkgfHwgW107XG5cdFx0XHRcdFx0XHQvLyBiaW5kaW5nIHBhcmFtZXRlciAoZWc6IF9pdCkgaXMgbm90IGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0xpc3RCaW5kaW5nPy5nZXRIZWFkZXJDb250ZXh0KCkhLmdldFBhdGgoKSk7XG5cdFx0XHRcdGNvbnN0IGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMgPSBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB0aGlzLmdldEFwcENvbXBvbmVudCgpKTtcblx0XHRcdFx0aWYgKGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIENyZWF0aW9uTW9kZS5Bc3luYztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKGJTaG91bGRCdXN5TG9jaykge1xuXHRcdFx0QnVzeUxvY2tlci5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGFWYWxpZGF0aW9uTWVzc2FnZXMgPSBhd2FpdCB0aGlzLnN5bmNUYXNrKG9FeGVjQ3VzdG9tVmFsaWRhdGlvbik7XG5cdFx0XHRpZiAoYVZhbGlkYXRpb25NZXNzYWdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyhhVmFsaWRhdGlvbk1lc3NhZ2VzKTtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ3VzdG9tIFZhbGlkYXRpb24gZmFpbGVkXCIpO1xuXHRcdFx0XHQvLyBpZiBjdXN0b20gdmFsaWRhdGlvbiBmYWlscywgd2UgbGVhdmUgdGhlIG1ldGhvZCBpbW1lZGlhdGVseVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCBvTGlzdEJpbmRpbmc6IGFueTtcblx0XHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRcdGlmICh2TGlzdEJpbmRpbmcgJiYgdHlwZW9mIHZMaXN0QmluZGluZyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQvLyB3ZSBhbHJlYWR5IGdldCBhIGxpc3QgYmluZGluZyB1c2UgdGhpcyBvbmVcblx0XHRcdFx0b0xpc3RCaW5kaW5nID0gdkxpc3RCaW5kaW5nO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksIHZMaXN0QmluZGluZyk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5TeW5jO1xuXHRcdFx0XHRkZWxldGUgbVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIG9iamVjdCBvciBwYXRoIGV4cGVjdGVkXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBvTW9kZWwgPSBvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0xpc3RCaW5kaW5nKTtcblx0XHRcdGNvbnN0IHJlc29sdmVkQ3JlYXRpb25Nb2RlID0gcmVzb2x2ZUNyZWF0aW9uTW9kZShcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlLFxuXHRcdFx0XHRzUHJvZ3JhbW1pbmdNb2RlbCxcblx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRvTW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdCk7XG5cdFx0XHRsZXQgbUFyZ3M6IGFueTtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvdyA9IG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93O1xuXHRcdFx0bGV0IG9DcmVhdGlvblJvd0NvbnRleHQ6IGFueTtcblx0XHRcdGxldCBvUGF5bG9hZDogYW55O1xuXHRcdFx0bGV0IHNNZXRhUGF0aDogc3RyaW5nO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IG9Sb3V0aW5nTGlzdGVuZXIgPSB0aGlzLmdldEludGVybmFsUm91dGluZygpO1xuXG5cdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5EZWZlcnJlZCkge1xuXHRcdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdykge1xuXHRcdFx0XHRcdG9DcmVhdGlvblJvd0NvbnRleHQgPSBvQ3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHQvLyBwcmVmaWxsIGRhdGEgZnJvbSBjcmVhdGlvbiByb3dcblx0XHRcdFx0XHRvUGF5bG9hZCA9IG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG9QYXlsb2FkKS5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzUHJvcGVydHlQYXRofWApO1xuXHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGFbc1Byb3BlcnR5UGF0aF0gPSBvUGF5bG9hZFtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoLypvQ3JlYXRpb25Sb3dDb250ZXh0Ki8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93IHx8IHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCA9IGZhbHNlOyAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0XHRcdC8vIGJ1c3kgaGFuZGxpbmcgc2hhbGwgYmUgZG9uZSBsb2NhbGx5IG9ubHlcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5TW9kZSA9IFwiTG9jYWxcIjtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5SWQgPSBvVGFibGU/LmdldFBhcmVudCgpPy5nZXRUYWJsZURlZmluaXRpb24oKT8uYW5ub3RhdGlvbi5pZDtcblxuXHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvbiBtZXNzYWdlIGhhbmRsaW5nLCBkcmFmdCBpbmRpY2F0b3IgKGluIGNhc2Ugb2YgZHJhZnQpXG5cdFx0XHRcdFx0Ly8gQXR0YWNoIHRoZSBjcmVhdGUgc2VudCBhbmQgY3JlYXRlIGNvbXBsZXRlZCBldmVudCB0byB0aGUgb2JqZWN0IHBhZ2UgYmluZGluZyBzbyB0aGF0IHdlIGNhbiByZWFjdFxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlQ3JlYXRlRXZlbnRzKG9MaXN0QmluZGluZyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2sgPSB0aGlzLm9uQmVmb3JlQ3JlYXRlO1xuXG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIGFwcGxpY2F0aW9uIHdhcyBjYWxsZWQgd2l0aCBwcmVmZXJyZWRNb2RlPWF1dG9DcmVhdGVXaXRoLCB3ZSB3YW50IHRvIHNraXAgdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2cgPSBvQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBNb2RlKCkgPT09IFN0YXJ0dXBNb2RlLkF1dG9DcmVhdGU7XG5cblx0XHRcdFx0b0NyZWF0aW9uID0gdHJhbnNhY3Rpb25IZWxwZXIuY3JlYXRlRG9jdW1lbnQoXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHRcdGZhbHNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdC8vIFNpZGVFZmZlY3RzIG9uIENyZWF0ZVxuXHRcdFx0XHQvLyBpZiBTYXZlIGlzIHByZXNzZWQgZGlyZWN0bHkgYWZ0ZXIgZmlsbGluZyB0aGUgQ3JlYXRpb25Sb3csIG5vIFNpZGVFZmZlY3RzIHJlcXVlc3Rcblx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5iU2tpcFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBvTmF2aWdhdGlvbjtcblx0XHRcdHN3aXRjaCAocmVzb2x2ZWRDcmVhdGlvbk1vZGUpIHtcblx0XHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ6XG5cdFx0XHRcdFx0b05hdmlnYXRpb24gPSBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dChvTGlzdEJpbmRpbmcsIHtcblx0XHRcdFx0XHRcdGJEZWZlcnJlZENvbnRleHQ6IHRydWUsXG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkFzeW5jOlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0xpc3RCaW5kaW5nLCB7XG5cdFx0XHRcdFx0XHRhc3luY0NvbnRleHQ6IG9DcmVhdGlvbixcblx0XHRcdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuU3luYzpcblx0XHRcdFx0XHRtQXJncyA9IHtcblx0XHRcdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSB8fCBtUGFyYW1ldGVycy5jcmVhdGVBY3Rpb24pIHtcblx0XHRcdFx0XHRcdG1BcmdzLnRyYW5zaWVudCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb0NyZWF0aW9uPy50aGVuKGZ1bmN0aW9uIChvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb3JlUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0Y29yZVJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBjb3JlUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGNvcmVSZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19FRElURkxPV19TQVBGRV9DUkVBVElPTl9GQUlMRURfREVTQ1JJUFRJT05cIilcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBTeW5jIGNyZWF0aW9uIHdhcyB0cmlnZ2VyZWQgZm9yIGEgZGVmZXJyZWQgY3JlYXRpb24sIHdlIGRvbid0IG5hdmlnYXRlIGZvcndhcmRcblx0XHRcdFx0XHRcdFx0Ly8gYXMgd2UncmUgYWxyZWFkeSBvbiB0aGUgY29ycmVzcG9uZGluZyBPYmplY3RQYWdlXG5cdFx0XHRcdFx0XHRcdHJldHVybiBtUGFyYW1ldGVycy5iRnJvbURlZmVycmVkXG5cdFx0XHRcdFx0XHRcdFx0PyBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlVG9Db250ZXh0KG9OZXdEb2N1bWVudENvbnRleHQsIG1BcmdzKVxuXHRcdFx0XHRcdFx0XHRcdDogb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob05ld0RvY3VtZW50Q29udGV4dCwgbUFyZ3MpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdFx0dGhpcy5zeW5jVGFzayhvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdzpcblx0XHRcdFx0XHQvLyB0aGUgY3JlYXRpb24gcm93IHNoYWxsIGJlIGNsZWFyZWQgb25jZSB0aGUgdmFsaWRhdGlvbiBjaGVjayB3YXMgc3VjY2Vzc2Z1bCBhbmRcblx0XHRcdFx0XHQvLyB0aGVyZWZvcmUgdGhlIFBPU1QgY2FuIGJlIHNlbnQgYXN5bmMgdG8gdGhlIGJhY2tlbmRcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0NyZWF0aW9uUm93TGlzdEJpbmRpbmcgPSBvQ3JlYXRpb25Sb3dDb250ZXh0LmdldEJpbmRpbmcoKTtcblxuXHRcdFx0XHRcdFx0Y29uc3Qgb05ld1RyYW5zaWVudENvbnRleHQgPSBvQ3JlYXRpb25Sb3dMaXN0QmluZGluZy5jcmVhdGUoKTtcblx0XHRcdFx0XHRcdG9DcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChvTmV3VHJhbnNpZW50Q29udGV4dCk7XG5cblx0XHRcdFx0XHRcdC8vIHRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIGNvbnNvbGUgZXJyb3JzIFRPIGJlIGNoZWNrZWQgd2l0aCBtb2RlbCBjb2xsZWFndWVzXG5cdFx0XHRcdFx0XHRvTmV3VHJhbnNpZW50Q29udGV4dC5jcmVhdGVkKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgZmFzdCBjcmVhdGlvbiBjb250ZXh0IGRlbGV0ZWRcIik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb0NyZWF0aW9uUm93Q29udGV4dC5kZWxldGUoXCIkZGlyZWN0XCIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHQvLyBSZXNldCBidXN5IGluZGljYXRvciBhZnRlciBhIHZhbGlkYXRpb24gZXJyb3Jcblx0XHRcdFx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikpKSB7XG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ3JlYXRpb25Sb3cgbmF2aWdhdGlvbiBlcnJvcjogXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gUHJvbWlzZS5yZWplY3QoYFVuaGFuZGxlZCBjcmVhdGlvbk1vZGUgJHtyZXNvbHZlZENyZWF0aW9uTW9kZX1gKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9DcmVhdGlvbikge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGFQYXJhbXMgPSBhd2FpdCBQcm9taXNlLmFsbChbb0NyZWF0aW9uLCBvTmF2aWdhdGlvbl0pO1xuXHRcdFx0XHRcdHRoaXMuX3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwsIG9Nb2RlbCk7XG5cblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlKTsgLy8gVGhlIGNyZWF0ZU1vZGUgZmxhZyB3aWxsIGJlIHNldCBpbiBjb21wdXRlRWRpdE1vZGVcblx0XHRcdFx0XHRpZiAoIW9MaXN0QmluZGluZy5pc1JlbGF0aXZlKCkgJiYgc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0XHQvLyBXb3JrYXJvdW5kIHRvIHRlbGwgdGhlIE9QIHRoYXQgd2UndmUgY3JlYXRlZCBhIG5ldyBvYmplY3QgZnJvbSB0aGUgTFJcblx0XHRcdFx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IG9MaXN0QmluZGluZy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgbWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuYmluZENvbnRleHQobWV0YU1vZGVsLmdldE1ldGFQYXRoKG9MaXN0QmluZGluZy5nZXRQYXRoKCkpKTtcblx0XHRcdFx0XHRcdGNvbnN0IGVudGl0eVNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhQ29udGV4dCkuc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXHRcdFx0XHRcdFx0Y29uc3QgbmV3QWN0aW9uID0gZW50aXR5U2V0Py5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5OZXdBY3Rpb247XG5cdFx0XHRcdFx0XHR0aGlzLmdldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiLCBuZXdBY3Rpb24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBvTmV3RG9jdW1lbnRDb250ZXh0ID0gYVBhcmFtc1swXTtcblx0XHRcdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuQ3JlYXRlLCBvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpICYmICFBY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGFjY29yZGluZyB0byBVWCBpbiBjYXNlIG9mIGVuYWJsZWQgY29sbGFib3JhdGlvbiBkcmFmdCB3ZSBzaGFyZSB0aGUgb2JqZWN0IGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHNoYXJlT2JqZWN0KG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZXJyb3IgPT09IENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cgfHxcblx0XHRcdFx0XHRcdGVycm9yID09PSBDb25zdGFudHMuQWN0aW9uRXhlY3V0aW9uRmFpbGVkIHx8XG5cdFx0XHRcdFx0XHRlcnJvciA9PT0gQ29uc3RhbnRzLkNyZWF0aW9uRmFpbGVkXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQvLyBjcmVhdGlvbiBoYXMgYmVlbiBjYW5jZWxsZWQgYnkgdXNlciBvciBmYWlsZWQgaW4gYmFja2VuZCA9PiBpbiBjYXNlIHdlIGhhdmUgbmF2aWdhdGVkIHRvIHRyYW5zaWVudCBjb250ZXh0IGJlZm9yZSwgbmF2aWdhdGUgYmFja1xuXHRcdFx0XHRcdFx0Ly8gdGhlIHN3aXRjaC1zdGF0ZW1lbnQgYWJvdmUgc2VlbXMgdG8gaW5kaWNhdGUgdGhhdCB0aGlzIGhhcHBlbnMgaW4gY3JlYXRpb25Nb2RlcyBkZWZlcnJlZCBhbmQgYXN5bmMuIEJ1dCBpbiBmYWN0LCBpbiB0aGVzZSBjYXNlcyBhZnRlciB0aGUgbmF2aWdhdGlvbiBmcm9tIHJvdXRlTWF0Y2hlZCBpbiBPUCBjb21wb25lbnRcblx0XHRcdFx0XHRcdC8vIGNyZWF0ZURlZmVycmVkQ29udGV4dCBpcyB0cmlnZ2VyZCwgd2hpY2ggY2FsbHMgdGhpcyBtZXRob2QgKGNyZWF0ZURvY3VtZW50KSBhZ2FpbiAtIHRoaXMgdGltZSB3aXRoIGNyZWF0aW9uTW9kZSBzeW5jLiBUaGVyZWZvcmUsIGFsc28gaW4gdGhhdCBtb2RlIHdlIG5lZWQgdG8gdHJpZ2dlciBiYWNrIG5hdmlnYXRpb24uXG5cdFx0XHRcdFx0XHQvLyBUaGUgb3RoZXIgY2FzZXMgbWlnaHQgc3RpbGwgYmUgbmVlZGVkIGluIGNhc2UgdGhlIG5hdmlnYXRpb24gZmFpbHMuXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuU3luYyB8fFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkRlZmVycmVkIHx8XG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQXN5bmNcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoYlNob3VsZEJ1c3lMb2NrKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCByZXN1bHQgb2YgdGhlIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG5cdCAqL1xuXG5cdHZhbGlkYXRlRG9jdW1lbnQoY29udGV4dDogQ29udGV4dCwgcGFyYW1ldGVyczogYW55KTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLnZhbGlkYXRlRG9jdW1lbnQoY29udGV4dCwgcGFyYW1ldGVycywgdGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgc2V2ZXJhbCBkb2N1bWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBsaXN0QmluZGluZyBUaGUgbGlzdEJpbmRpbmcgdXNlZCB0byBjcmVhdGUgdGhlIGRvY3VtZW50c1xuXHQgKiBAcGFyYW0gZGF0YUZvckNyZWF0ZSBUaGUgaW5pdGlhbCBkYXRhIGZvciB0aGUgbmV3IGRvY3VtZW50c1xuXHQgKiBAcGFyYW0gY3JlYXRlQXRFbmQgVHJ1ZSBpZiB0aGUgbmV3IGNvbnRleHRzIG5lZWQgdG8gYmUgY3JhdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gaXNGcm9tQ29weVBhc3RlIFRydWUgaWYgdGhlIGNyZWF0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZCBieSBhIHBhc3RlIGFjdGlvblxuXHQgKiBAcGFyYW0gYmVmb3JlQ3JlYXRlQ2FsbEJhY2sgQ2FsbGJhY2sgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgY3JlYXRpb25cblx0ICogQHBhcmFtIGNyZWF0ZUFzSW5hY3RpdmUgVHJ1ZSBpZiB0aGUgY29udGV4dHMgbmVlZCB0byBiZSBjcmVhdGVkIGluYWN0aXZlXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSB3aXRoIHRoZSBuZXdseSBjcmVhdGVkIGNvbnRleHRzLlxuXHQgKi9cblx0YXN5bmMgY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMoXG5cdFx0bGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsXG5cdFx0ZGF0YUZvckNyZWF0ZTogYW55W10sXG5cdFx0Y3JlYXRlQXRFbmQ6IGJvb2xlYW4sXG5cdFx0aXNGcm9tQ29weVBhc3RlOiBib29sZWFuLFxuXHRcdGJlZm9yZUNyZWF0ZUNhbGxCYWNrPzogRnVuY3Rpb24sXG5cdFx0Y3JlYXRlQXNJbmFjdGl2ZSA9IGZhbHNlXG5cdCkge1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGxvY2tPYmplY3QgPSB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKTtcblx0XHRjb25zdCB0YXJnZXRMaXN0QmluZGluZyA9IGxpc3RCaW5kaW5nO1xuXG5cdFx0QnVzeUxvY2tlci5sb2NrKGxvY2tPYmplY3QpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGlmIChiZWZvcmVDcmVhdGVDYWxsQmFjaykge1xuXHRcdFx0XHRhd2FpdCBiZWZvcmVDcmVhdGVDYWxsQmFjayh7IGNvbnRleHRQYXRoOiB0YXJnZXRMaXN0QmluZGluZy5nZXRQYXRoKCkgfSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IHRhcmdldExpc3RCaW5kaW5nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRsZXQgbWV0YVBhdGg6IHN0cmluZztcblxuXHRcdFx0aWYgKHRhcmdldExpc3RCaW5kaW5nLmdldENvbnRleHQoKSkge1xuXHRcdFx0XHRtZXRhUGF0aCA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChgJHt0YXJnZXRMaXN0QmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpfS8ke3RhcmdldExpc3RCaW5kaW5nLmdldFBhdGgoKX1gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1ldGFQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKHRhcmdldExpc3RCaW5kaW5nLmdldFBhdGgoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuaGFuZGxlQ3JlYXRlRXZlbnRzKHRhcmdldExpc3RCaW5kaW5nKTtcblxuXHRcdFx0Ly8gSXRlcmF0ZSBvbiBhbGwgaXRlbXMgYW5kIHN0b3JlIHRoZSBjb3JyZXNwb25kaW5nIGNyZWF0aW9uIHByb21pc2Vcblx0XHRcdGNvbnN0IGNyZWF0aW9uUHJvbWlzZXMgPSBkYXRhRm9yQ3JlYXRlLm1hcCgocHJvcGVydHlWYWx1ZXMpID0+IHtcblx0XHRcdFx0Y29uc3QgY3JlYXRlUGFyYW1ldGVyczogYW55ID0geyBkYXRhOiB7fSB9O1xuXG5cdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCA9IGZhbHNlOyAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLmJ1c3lNb2RlID0gXCJOb25lXCI7XG5cdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93O1xuXHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRcdFx0Y3JlYXRlUGFyYW1ldGVycy5jcmVhdGVBdEVuZCA9IGNyZWF0ZUF0RW5kO1xuXHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLmluYWN0aXZlID0gY3JlYXRlQXNJbmFjdGl2ZTtcblxuXHRcdFx0XHQvLyBSZW1vdmUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGFzIHdlIGRvbid0IHN1cHBvcnQgZGVlcCBjcmVhdGVcblx0XHRcdFx0Zm9yIChjb25zdCBwcm9wZXJ0eVBhdGggaW4gcHJvcGVydHlWYWx1ZXMpIHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7bWV0YVBhdGh9LyR7cHJvcGVydHlQYXRofWApO1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdHByb3BlcnR5ICYmXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eS4ka2luZCAhPT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJlxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpIDwgMCAmJlxuXHRcdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXNbcHJvcGVydHlQYXRoXVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Y3JlYXRlUGFyYW1ldGVycy5kYXRhW3Byb3BlcnR5UGF0aF0gPSBwcm9wZXJ0eVZhbHVlc1twcm9wZXJ0eVBhdGhdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbkhlbHBlci5jcmVhdGVEb2N1bWVudChcblx0XHRcdFx0XHR0YXJnZXRMaXN0QmluZGluZyxcblx0XHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHRcdGlzRnJvbUNvcHlQYXN0ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IGNyZWF0ZWRDb250ZXh0cyA9IGF3YWl0IFByb21pc2UuYWxsKGNyZWF0aW9uUHJvbWlzZXMpO1xuXHRcdFx0aWYgKCFjcmVhdGVBc0luYWN0aXZlKSB7XG5cdFx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZE9uQ3JlYXRlKHRhcmdldExpc3RCaW5kaW5nKTtcblx0XHRcdH1cblx0XHRcdC8vIHRyYW5zaWVudCBjb250ZXh0cyBhcmUgcmVsaWFibHkgcmVtb3ZlZCBvbmNlIG9OZXdDb250ZXh0LmNyZWF0ZWQoKSBpcyByZXNvbHZlZFxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdGNyZWF0ZWRDb250ZXh0cy5tYXAoKG5ld0NvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGlmICghbmV3Q29udGV4dC5iSW5hY3RpdmUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBuZXdDb250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCB2aWV3QmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0XHQvLyBpZiB0aGVyZSBhcmUgdHJhbnNpZW50IGNvbnRleHRzLCB3ZSBtdXN0IGF2b2lkIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzXG5cdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHQvLyBpZiBsaXN0IGJpbmRpbmcgaXMgcmVmcmVzaGVkLCB0cmFuc2llbnQgY29udGV4dHMgbWlnaHQgYmUgbG9zdFxuXHRcdFx0aWYgKCFDb21tb25VdGlscy5oYXNUcmFuc2llbnRDb250ZXh0KHRhcmdldExpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHRcdFx0LmdldFNpZGVFZmZlY3RzU2VydmljZSgpXG5cdFx0XHRcdFx0LnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSh0YXJnZXRMaXN0QmluZGluZy5nZXRQYXRoKCksIHZpZXdCaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGNyZWF0ZWRDb250ZXh0cztcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgbXVsdGlwbGUgZG9jdW1lbnRzLlwiKTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sobG9ja09iamVjdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnU2F2ZScgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ1NhdmUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdTYXZlJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZVNhdmVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIHNhdmVkLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgdHJpZ2dlcmVkLiBJZiByZWplY3RlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I29uQmVmb3JlU2F2ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVTYXZlKF9tUGFyYW1ldGVycz86IHsgY29udGV4dD86IENvbnRleHQgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdDcmVhdGUnIGFjdGlvbi4gWW91IGNhbiBleGVjdXRlIGN1c3RvbSBjb2RpbmcgaW4gdGhpcyBmdW5jdGlvbi5cblx0ICogVGhlIGZyYW1ld29yayB3YWl0cyBmb3IgdGhlIHJldHVybmVkIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmcgdGhlICdDcmVhdGUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdDcmVhdGUnIGFjdGlvbiBpcyBzdG9wcGVkLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZUNyZWF0ZVxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzLmNvbnRleHRQYXRoIFBhdGggcG9pbnRpbmcgdG8gdGhlIGNvbnRleHQgb24gd2hpY2ggQ3JlYXRlIGFjdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jcmVhdGVQYXJhbWV0ZXJzIEFycmF5IG9mIHZhbHVlcyB0aGF0IGFyZSBmaWxsZWQgaW4gdGhlIEFjdGlvbiBQYXJhbWV0ZXIgRGlhbG9nXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0NyZWF0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnQ3JlYXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUNyZWF0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVDcmVhdGUoX21QYXJhbWV0ZXJzPzogeyBjb250ZXh0UGF0aD86IHN0cmluZzsgY3JlYXRlUGFyYW1ldGVycz86IGFueVtdIH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRWRpdCcgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0VkaXQnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdFZGl0JyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZGlzcGxheSBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZUVkaXRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGVkaXRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGRpc3BsYXkgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUVkaXRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRWRpdChfbVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRGlzY2FyZCcgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0Rpc2NhcmQnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdEaXNjYXJkJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZURpc2NhcmRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGVkaXQgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURpc2NhcmRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRGlzY2FyZChfbVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRGVsZXRlJyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG5cdCAqIElmIHlvdSByZWplY3QgdGhlIHByb21pc2UsIHRoZSAnRGVsZXRlJyBhY3Rpb24gaXMgc3RvcHBlZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVEZWxldGVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0cyBBbiBhcnJheSBvZiBjb250ZXh0cyB0aGF0IGFyZSBnb2luZyB0byBiZSBkZWxldGVkXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0RlbGV0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGVsZXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURlbGV0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVEZWxldGUoX21QYXJhbWV0ZXJzPzogeyBjb250ZXh0cz86IENvbnRleHRbXSB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge2Jvb2xlYW59IG1QYXJhbWV0ZXJzLmJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIEluZGljYXRlcyB3aGV0aGVyIFNpZGVFZmZlY3RzIG5lZWQgdG8gYmUgaWdub3JlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIFNhdmUgZHVyaW5nIGFuIElubGluZSBjcmVhdGlvblxuXHQvLyBAcGFyYW0ge29iamVjdH0gbVBhcmFtZXRlcnMuYmluZGluZ3MgTGlzdCBiaW5kaW5ncyBvZiB0aGUgdGFibGVzIGluIHRoZSB2aWV3LlxuXHQvLyBCb3RoIG9mIHRoZSBhYm92ZSBwYXJhbWV0ZXJzIGFyZSBmb3IgdGhlIHNhbWUgcHVycG9zZS4gVXNlciBjYW4gZW50ZXIgc29tZSBpbmZvcm1hdGlvbiBpbiB0aGUgY3JlYXRpb24gcm93KHMpIGJ1dCBkb2VzIG5vdCAnQWRkIHJvdycsIGluc3RlYWQgY2xpY2tzIFNhdmUuXG5cdC8vIFRoZXJlIGNhbiBiZSBtb3JlIHRoYW4gb25lIGluIHRoZSB2aWV3LlxuXG5cdC8qKlxuXHQgKiBTYXZlcyBhIG5ldyBkb2N1bWVudCBhZnRlciBjaGVja2luZyBpdC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZWRpdGFibGUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBSSVZBVEVcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHNhdmUgaXMgY29tcGxldGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I3NhdmVEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBzYXZlRG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQsIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdGNvbnN0IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gbVBhcmFtZXRlcnMuYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgfHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGJEcmFmdE5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGFCaW5kaW5ncyA9IG1QYXJhbWV0ZXJzLmJpbmRpbmdzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGF3YWl0IHRoaXMuX3N1Ym1pdE9wZW5DaGFuZ2VzKG9Db250ZXh0KTtcblx0XHRcdGF3YWl0IHRoaXMuX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycygpO1xuXHRcdFx0YXdhaXQgdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlU2F2ZSh7IGNvbnRleHQ6IG9Db250ZXh0IH0pO1xuXG5cdFx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdFx0bGV0IHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kgfHwgb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNBY3RpdmVFbnRpdHlcIikpICYmXG5cdFx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKClcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBObyBuZWVkIHRvIHRyeSB0byBnZXQgcmlnaHRtb3N0IGNvbnRleHQgaW4gY2FzZSBvZiBhIG5ldyBvYmplY3Rcblx0XHRcdFx0c2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpLFxuXHRcdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsLFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgYWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gYXdhaXQgdHJhbnNhY3Rpb25IZWxwZXIuc2F2ZURvY3VtZW50KFxuXHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0dGhpcy5fZ2V0UmVzb3VyY2VNb2RlbCgpLFxuXHRcdFx0XHRiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcixcblx0XHRcdFx0YUJpbmRpbmdzLFxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCksXG5cdFx0XHRcdHRoaXMuZ2V0Q3JlYXRpb25Nb2RlKClcblx0XHRcdCk7XG5cdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHNQcm9ncmFtbWluZ01vZGVsKTtcblxuXHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkFjdGl2YXRlLCBhY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0QWN0aXZpdHlTeW5jLmRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpO1xuXG5cdFx0XHR0aGlzLl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleShTdGFuZGFyZEFjdGlvbnMuc2F2ZSwgVHJpZ2dlclR5cGUuc3RhbmRhcmRBY3Rpb24pO1xuXG5cdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQoZmFsc2UpO1xuXHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7XG5cdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblxuXHRcdFx0aWYgKGFjdGl2ZURvY3VtZW50Q29udGV4dCAhPT0gb0NvbnRleHQpIHtcblx0XHRcdFx0bGV0IGNvbnRleHRUb05hdmlnYXRlID0gYWN0aXZlRG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIGFjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPT0gYWN0aXZlRG9jdW1lbnRDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dFRvTmF2aWdhdGUgPSBzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIGZhbHNlLCBmYWxzZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdGlmICghKG9FcnJvciAmJiBvRXJyb3IuY2FuY2VsZWQpKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHNhdmluZyB0aGUgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHRcdHRocm93IG9FcnJvcjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3dpdGNoZXMgdGhlIFVJIGJldHdlZW4gZHJhZnQgYW5kIGFjdGl2ZSBkb2N1bWVudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRvIHN3aXRjaCBmcm9tXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgc3dpdGNoIGlzIGRvbmVcblx0ICovXG5cdGFzeW5jIHRvZ2dsZURyYWZ0QWN0aXZlKG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IGJFZGl0YWJsZTogYm9vbGVhbjtcblx0XHRjb25zdCBiSXNEcmFmdCA9IG9Db250ZXh0ICYmIHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCkgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cblx0XHQvL3RvZ2dsZSBiZXR3ZWVuIGRyYWZ0IGFuZCBhY3RpdmUgZG9jdW1lbnQgaXMgb25seSBhdmFpbGFibGUgZm9yIGVkaXQgZHJhZnRzIGFuZCBhY3RpdmUgZG9jdW1lbnRzIHdpdGggZHJhZnQpXG5cdFx0aWYgKFxuXHRcdFx0IWJJc0RyYWZ0IHx8XG5cdFx0XHQhKFxuXHRcdFx0XHQoIW9Db250ZXh0RGF0YS5Jc0FjdGl2ZUVudGl0eSAmJiBvQ29udGV4dERhdGEuSGFzQWN0aXZlRW50aXR5KSB8fFxuXHRcdFx0XHQob0NvbnRleHREYXRhLklzQWN0aXZlRW50aXR5ICYmIG9Db250ZXh0RGF0YS5IYXNEcmFmdEVudGl0eSlcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIW9Db250ZXh0RGF0YS5Jc0FjdGl2ZUVudGl0eSAmJiBvQ29udGV4dERhdGEuSGFzQWN0aXZlRW50aXR5KSB7XG5cdFx0XHQvL3N0YXJ0IFBvaW50OiBlZGl0IGRyYWZ0XG5cdFx0XHRiRWRpdGFibGUgPSBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gc3RhcnQgcG9pbnQgYWN0aXZlIGRvY3VtZW50XG5cdFx0XHRiRWRpdGFibGUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdFx0Y29uc3Qgb1JpZ2h0bW9zdENvbnRleHQgPSBvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpID8gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCkgOiBvQ29udGV4dDtcblx0XHRcdGxldCBzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob0NvbnRleHQsIG9SaWdodG1vc3RDb250ZXh0LCBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0LCBmYWxzZSk7XG5cdFx0XHRpZiAoIXNpYmxpbmdJbmZvICYmIG9Db250ZXh0ICE9PSBvUmlnaHRtb3N0Q29udGV4dCkge1xuXHRcdFx0XHQvLyBUcnkgdG8gY29tcHV0ZSBzaWJsaW5nIGluZm8gZm9yIHRoZSByb290IGNvbnRleHQgaWYgaXQgZmFpbHMgZm9yIHRoZSByaWdodG1vc3QgY29udGV4dFxuXHRcdFx0XHQvLyAtLT4gSW4gY2FzZSBvZiBGQ0wsIGlmIHdlIHRyeSB0byBzd2l0Y2ggYmV0d2VlbiBkcmFmdCBhbmQgYWN0aXZlIGJ1dCBhIGNoaWxkIGVudGl0eSBoYXMgbm8gc2libGluZywgdGhlIHN3aXRjaCB3aWxsIGNsb3NlIHRoZSBjaGlsZCBjb2x1bW5cblx0XHRcdFx0c2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKG9Db250ZXh0LCBvQ29udGV4dCwgUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNpYmxpbmdJbmZvKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoYkVkaXRhYmxlID8gRWRpdE1vZGUuRWRpdGFibGUgOiBFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7IC8vc3dpdGNoIHRvIGVkaXQgbW9kZSBvbmx5IGlmIGEgZHJhZnQgaXMgYXZhaWxhYmxlXG5cblx0XHRcdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRjb25zdCBsYXN0U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fZ2V0U2VtYW50aWNNYXBwaW5nKCk7XG5cdFx0XHRcdFx0aWYgKGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPT09IG9Db250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0UGF0aCA9IHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nW3NpYmxpbmdJbmZvLnBhdGhNYXBwaW5nLmxlbmd0aCAtIDFdLm5ld1BhdGg7XG5cdFx0XHRcdFx0XHRzaWJsaW5nSW5mby5wYXRoTWFwcGluZy5wdXNoKHsgb2xkUGF0aDogbGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGgsIG5ld1BhdGg6IHRhcmdldFBhdGggfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVBhdGhzSW5IaXN0b3J5KHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCwgYkVkaXRhYmxlLCB0cnVlLCB0cnVlLCB0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVycm9yIGluIEVkaXRGbG93LnRvZ2dsZURyYWZ0QWN0aXZlIC0gQ2Fubm90IGZpbmQgc2libGluZ1wiKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3IgaW4gRWRpdEZsb3cudG9nZ2xlRHJhZnRBY3RpdmU6JHtvRXJyb3J9YCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gSW50ZXJuYWwgb25seSBwYXJhbXMgLS0tXG5cdC8vIEBwYXJhbSB7c2FwLm0uQnV0dG9ufSBtUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gLSBDdXJyZW50bHkgdGhpcyBpcyBwYXNzZWQgYXMgY2FuY2VsQnV0dG9uIGludGVybmFsbHkgKHJlcGxhY2VkIGJ5IG1QYXJhbWV0ZXJzLmNvbnRyb2wgaW4gdGhlIEpTRG9jIGJlbG93KS4gQ3VycmVudGx5IGl0IGlzIGFsc28gbWFuZGF0b3J5LlxuXHQvLyBQbGFuIC0gVGhpcyBzaG91bGQgbm90IGJlIG1hbmRhdG9yeS4gSWYgbm90IHByb3ZpZGVkLCB3ZSBzaG91bGQgaGF2ZSBhIGRlZmF1bHQgdGhhdCBjYW4gYWN0IGFzIHJlZmVyZW5jZSBjb250cm9sIGZvciB0aGUgZGlzY2FyZCBwb3BvdmVyIE9SIHdlIGNhbiBzaG93IGEgZGlhbG9nIGluc3RlYWQgb2YgYSBwb3BvdmVyLlxuXG5cdC8qKlxuXHQgKiBEaXNjYXJkIHRoZSBlZGl0YWJsZSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZWRpdGFibGUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIENhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmNvbnRyb2wgVGhpcyBpcyB0aGUgY29udHJvbCB1c2VkIHRvIG9wZW4gdGhlIGRpc2NhcmQgcG9wb3ZlclxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuc2tpcERpc2NhcmRQb3BvdmVyIE9wdGlvbmFsLCBzdXByZXNzZXMgdGhlIGRpc2NhcmQgcG9wb3ZlciBhbmQgYWxsb3dzIGN1c3RvbSBoYW5kbGluZ1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgZWRpdGFibGUgZG9jdW1lbnQgaGFzIGJlZW4gZGlzY2FyZGVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNjYW5jZWxEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBjYW5jZWxEb2N1bWVudChvQ29udGV4dDogQ29udGV4dCwgbVBhcmFtZXRlcnM6IHsgY29udHJvbDogb2JqZWN0OyBza2lwRGlzY2FyZFBvcG92ZXI/OiBib29sZWFuIH0pOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IG1JblBhcmFtZXRlcnM6IGFueSA9IG1QYXJhbWV0ZXJzO1xuXHRcdGxldCBzaWJsaW5nSW5mbzogU2libGluZ0luZm9ybWF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBpc05ld0RvY3VtZW50ID0gZmFsc2U7XG5cdFx0bUluUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gPSBtUGFyYW1ldGVycy5jb250cm9sIHx8IG1JblBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uO1xuXHRcdG1JblBhcmFtZXRlcnMuYmVmb3JlQ2FuY2VsQ2FsbEJhY2sgPSB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEaXNjYXJkO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRcdGlmICgoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5IHx8IG9Db250ZXh0LmdldFByb3BlcnR5KFwiSGFzQWN0aXZlRW50aXR5XCIpKSAmJiB0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXG5cdFx0XHRcdC8vIE5vIG5lZWQgdG8gdHJ5IHRvIGdldCByaWdodG1vc3QgY29udGV4dCBpbiBjYXNlIG9mIGEgbmV3IG9iamVjdFxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24oXG5cdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCksXG5cdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYW5jZWxEb2N1bWVudChcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdG1JblBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdHRoaXMuX2dldFJlc291cmNlTW9kZWwoKSxcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHR0aGlzLmdldENyZWF0aW9uTW9kZSgpLFxuXHRcdFx0XHR0aGlzLmlzRG9jdW1lbnRNb2RpZmllZCgpXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgYkRyYWZ0TmF2aWdhdGlvbiA9IHRydWU7XG5cdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHNQcm9ncmFtbWluZ01vZGVsKTtcblxuXHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7XG5cdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQoZmFsc2UpO1xuXHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHQvLyB3ZSBmb3JjZSB0aGUgZWRpdCBzdGF0ZSBldmVuIGZvciBGQ0wgYmVjYXVzZSB0aGUgZHJhZnQgZGlzY2FyZCBtaWdodCBub3QgYmUgaW1wbGVtZW50ZWRcblx0XHRcdC8vIGFuZCB3ZSBtYXkganVzdCBkZWxldGUgdGhlIGRyYWZ0XG5cdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdGlmICghY2FuY2VsUmVzdWx0KSB7XG5cdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5EaXNjYXJkLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRBY3Rpdml0eVN5bmMuZGlzY29ubmVjdCh0aGlzLmdldFZpZXcoKSk7XG5cdFx0XHRcdC8vaW4gY2FzZSBvZiBhIG5ldyBkb2N1bWVudCwgbm8gYWN0aXZlQ29udGV4dCBpcyByZXR1cm5lZCAtLT4gbmF2aWdhdGUgYmFjay5cblx0XHRcdFx0aWYgKCFtSW5QYXJhbWV0ZXJzLnNraXBCYWNrTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0XHRcdGlzTmV3RG9jdW1lbnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gY2FuY2VsUmVzdWx0IGFzIENvbnRleHQ7XG5cdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5EaXNjYXJkLCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0QWN0aXZpdHlTeW5jLmRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpO1xuXHRcdFx0XHRsZXQgY29udGV4dFRvTmF2aWdhdGUgPSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRpZiAodGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRzaWJsaW5nSW5mbyA9IHNpYmxpbmdJbmZvID8/IHRoaXMuX2NyZWF0ZVNpYmxpbmdJbmZvKG9Db250ZXh0LCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVQYXRoc0luSGlzdG9yeShzaWJsaW5nSW5mby5wYXRoTWFwcGluZyk7XG5cdFx0XHRcdFx0aWYgKHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQuZ2V0UGF0aCgpICE9PSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dFRvTmF2aWdhdGUgPSBzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHRcdC8vIFdlIG5lZWQgdG8gbG9hZCB0aGUgc2VtYW50aWMga2V5cyBvZiB0aGUgYWN0aXZlIGNvbnRleHQsIGFzIHdlIG5lZWQgdGhlbVxuXHRcdFx0XHRcdC8vIGZvciB0aGUgbmF2aWdhdGlvblxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2ZldGNoU2VtYW50aWNLZXlWYWx1ZXMob0FjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0Ly8gV2UgZm9yY2UgdGhlIHJlY3JlYXRpb24gb2YgdGhlIGNvbnRleHQsIHNvIHRoYXQgaXQncyBjcmVhdGVkIGFuZCBib3VuZCBpbiB0aGUgc2FtZSBtaWNyb3Rhc2ssXG5cdFx0XHRcdFx0Ly8gc28gdGhhdCBhbGwgcHJvcGVydGllcyBhcmUgbG9hZGVkIHRvZ2V0aGVyIGJ5IGF1dG9FeHBhbmRTZWxlY3QsIHNvIHRoYXQgd2hlbiBzd2l0Y2hpbmcgYmFjayB0byBFZGl0IG1vZGVcblx0XHRcdFx0XHQvLyAkJGluaGVyaXRFeHBhbmRTZWxlY3QgdGFrZXMgYWxsIGxvYWRlZCBwcm9wZXJ0aWVzIGludG8gYWNjb3VudCAoQkNQIDIwNzA0NjIyNjUpXG5cdFx0XHRcdFx0aWYgKCFtSW5QYXJhbWV0ZXJzLnNraXBCaW5kaW5nVG9WaWV3KSB7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGNvbnRleHRUb05hdmlnYXRlLCBmYWxzZSwgdHJ1ZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQWN0aXZlRG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL2FjdGl2ZSBjb250ZXh0IGlzIHJldHVybmVkIGluIGNhc2Ugb2YgY2FuY2VsIG9mIGV4aXN0aW5nIGRvY3VtZW50XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChjb250ZXh0VG9OYXZpZ2F0ZSwgZmFsc2UsIGZhbHNlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zaG93RG9jdW1lbnREaXNjYXJkTWVzc2FnZShpc05ld0RvY3VtZW50KTtcblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGRpc2NhcmRpbmcgdGhlIGRvY3VtZW50XCIsIG9FcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCcmluZ3MgdXAgYSBtZXNzYWdlIHRvYXN0IHdoZW4gYSBkcmFmdCBpcyBkaXNjYXJkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpc05ld0RvY3VtZW50IFRoaXMgaXMgYSBCb29sZWFuIGZsYWcgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGRvY3VtZW50IGlzIG5ldyBvciBpdCBpcyBhbiBleGlzdGluZyBkb2N1bWVudC5cblx0ICovXG5cdHNob3dEb2N1bWVudERpc2NhcmRNZXNzYWdlKGlzTmV3RG9jdW1lbnQ/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IHRoaXMuX2dldFJlc291cmNlTW9kZWwoKTtcblx0XHRjb25zdCBtZXNzYWdlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfRElTQ0FSRF9EUkFGVF9UT0FTVFwiKTtcblx0XHRpZiAoaXNOZXdEb2N1bWVudCA9PSB0cnVlKSB7XG5cdFx0XHRjb25zdCBhcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdFx0YXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuYXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQodGhpcy5zaG93TWVzc2FnZVdoZW5Ob0NvbnRleHQsIHRoaXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNZXNzYWdlVG9hc3Quc2hvdyhtZXNzYWdlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogV2UgdXNlIHRoaXMgZnVuY3Rpb24gaW4gc2hvd0RvY3VtZW50RGlzY2FyZE1lc3NhZ2Ugd2hlbiBubyBjb250ZXh0IGlzIHBhc3NlZC5cblx0ICovXG5cdHNob3dNZXNzYWdlV2hlbk5vQ29udGV4dCgpIHtcblx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gdGhpcy5fZ2V0UmVzb3VyY2VNb2RlbCgpO1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9ESVNDQVJEX0RSQUZUX1RPQVNUXCIpO1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0TWVzc2FnZVRvYXN0LnNob3cobWVzc2FnZSk7XG5cdFx0YXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuZGV0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQodGhpcy5zaG93TWVzc2FnZVdoZW5Ob0NvbnRleHQsIHRoaXMpO1xuXHR9XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBjb250ZXh0IGNvcnJlc3BvbmRzIHRvIGEgZHJhZnQgcm9vdC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgdG8gY2hlY2tcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udGV4dCBwb2ludHMgdG8gYSBkcmFmdCByb290XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgaXNEcmFmdFJvb3QoY29udGV4dDogQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBtZXRhQ29udGV4dCA9IG1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChjb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0cmV0dXJuIE1vZGVsSGVscGVyLmlzRHJhZnRSb290KGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhQ29udGV4dCkudGFyZ2V0RW50aXR5U2V0KTtcblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge3N0cmluZ30gbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSBOYW1lIG9mIHRoZSBFbnRpdHlTZXQgdG8gd2hpY2ggdGhlIG9iamVjdCBiZWxvbmdzXG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0ICBDb250ZXh0IG9mIHRoZSBkb2N1bWVudFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycyBDYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnRpdGxlIFRpdGxlIG9mIHRoZSBvYmplY3QgYmVpbmcgZGVsZXRlZFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5kZXNjcmlwdGlvbiBEZXNjcmlwdGlvbiBvZiB0aGUgb2JqZWN0IGJlaW5nIGRlbGV0ZWRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIGRvY3VtZW50IGhhcyBiZWVuIGRlbGV0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2RlbGV0ZURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGRlbGV0ZURvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0LCBtSW5QYXJhbWV0ZXJzOiB7IHRpdGxlOiBzdHJpbmc7IGRlc2NyaXB0aW9uOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGxldCBtUGFyYW1ldGVyczogYW55ID0gbUluUGFyYW1ldGVycztcblx0XHRpZiAoIW1QYXJhbWV0ZXJzKSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0YkZpbmRBY3RpdmVDb250ZXh0czogZmFsc2Vcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMgPSBmYWxzZTtcblx0XHR9XG5cdFx0bVBhcmFtZXRlcnMuYmVmb3JlRGVsZXRlQ2FsbEJhY2sgPSB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEZWxldGU7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5faXNGY2xFbmFibGVkKCkgJiZcblx0XHRcdFx0dGhpcy5pc0RyYWZ0Um9vdChvQ29udGV4dCkgJiZcblx0XHRcdFx0b0NvbnRleHQuZ2V0SW5kZXgoKSA9PT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikgPT09IHRydWUgJiZcblx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNEcmFmdEVudGl0eVwiKSA9PT0gdHJ1ZVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIERlbGV0aW5nIGFuIGFjdGl2ZSBlbnRpdHkgd2hpY2ggaGFzIGEgZHJhZnQgdGhhdCBjb3VsZCBwb3RlbnRpYWxseSBiZSBkaXNwbGF5ZWQgaW4gdGhlIExpc3RSZXBvcnQgKEZDTCBjYXNlKVxuXHRcdFx0XHQvLyAtLT4gbmVlZCB0byByZW1vdmUgdGhlIGRyYWZ0IGZyb20gdGhlIExSIGFuZCByZXBsYWNlIGl0IHdpdGggdGhlIGFjdGl2ZSB2ZXJzaW9uLCBzbyB0aGF0IHRoZSBMaXN0QmluZGluZyBpcyBwcm9wZXJseSByZWZyZXNoZWRcblx0XHRcdFx0Ly8gVGhlIGNvbmRpdGlvbiAnb0NvbnRleHQuZ2V0SW5kZXgoKSA9PT0gdW5kZWZpbmVkJyBtYWtlcyBzdXJlIHRoZSBhY3RpdmUgdmVyc2lvbiBpc24ndCBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgTFJcblx0XHRcdFx0bVBhcmFtZXRlcnMuYmVmb3JlRGVsZXRlQ2FsbEJhY2sgPSBhc3luYyAocGFyYW1ldGVycz86IHsgY29udGV4dHM/OiBDb250ZXh0W10gfSkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZURlbGV0ZShwYXJhbWV0ZXJzKTtcblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBtb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBzaWJsaW5nQ29udGV4dCA9IG1vZGVsLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vU2libGluZ0VudGl0eWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZHJhZnRQYXRoID0gYXdhaXQgc2libGluZ0NvbnRleHQucmVxdWVzdENhbm9uaWNhbFBhdGgoKTtcblx0XHRcdFx0XHRcdGNvbnN0IGRyYWZ0Q29udGV4dFRvUmVtb3ZlID0gbW9kZWwuZ2V0S2VlcEFsaXZlQ29udGV4dChkcmFmdFBhdGgpO1xuXHRcdFx0XHRcdFx0ZHJhZnRDb250ZXh0VG9SZW1vdmUucmVwbGFjZVdpdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXBsYWNpbmcgdGhlIGRyYWZ0IGluc3RhbmNlIGluIHRoZSBMUiBPRExCXCIsIGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24ob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblxuXHRcdFx0Ly8gU2luZ2xlIG9iamV0IGRlbGV0aW9uIGlzIHRyaWdnZXJlZCBmcm9tIGFuIE9QIGhlYWRlciBidXR0b24gKG5vdCBmcm9tIGEgbGlzdClcblx0XHRcdC8vIC0tPiBNYXJrIFVJIGRpcnR5IGFuZCBuYXZpZ2F0ZSBiYWNrIHRvIGRpc21pc3MgdGhlIE9QXG5cdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkRlbGV0ZSwgb0NvbnRleHQpO1xuXG5cdFx0XHQvLyBBZnRlciBkZWxldGUgaXMgc3VjY2Vzc2Z1bGwsIHdlIG5lZWQgdG8gZGV0YWNoIHRoZSBzZXRCYWNrTmF2aWdhdGlvbiBNZXRob2RzXG5cdFx0XHRpZiAob0FwcENvbXBvbmVudCkge1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbigpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0FwcENvbXBvbmVudD8uZ2V0U3RhcnR1cE1vZGUoKSA9PT0gU3RhcnR1cE1vZGUuRGVlcGxpbmsgJiYgIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIGFwcCBoYXMgYmVlbiBsYXVuY2hlZCB3aXRoIHNlbWFudGljIGtleXMsIGRlbGV0aW5nIHRoZSBvYmplY3Qgd2UndmUgbGFuZGVkIG9uIHNoYWxsIG5hdmlnYXRlIGJhY2tcblx0XHRcdFx0Ly8gdG8gdGhlIGFwcCB3ZSBjYW1lIGZyb20gKGV4Y2VwdCBmb3IgRkNMLCB3aGVyZSB3ZSBuYXZpZ2F0ZSB0byBMUiBhcyB1c3VhbClcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmV4aXRGcm9tQXBwKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmdldEludGVybmFsUm91dGluZygpLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGhlIGRvY3VtZW50XCIsIGVycm9yIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN1Ym1pdCB0aGUgY3VycmVudCBzZXQgb2YgY2hhbmdlcyBhbmQgbmF2aWdhdGUgYmFjay5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBjaGFuZ2VzIGhhdmUgYmVlbiBzYXZlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjYXBwbHlEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBhcHBseURvY3VtZW50KG9Db250ZXh0OiBvYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5zeW5jVGFzaygpO1xuXHRcdFx0YXdhaXQgdGhpcy5fc3VibWl0T3BlbkNoYW5nZXMob0NvbnRleHQpO1xuXHRcdFx0YXdhaXQgdGhpcy5fY2hlY2tGb3JWYWxpZGF0aW9uRXJyb3JzKCk7XG5cdFx0XHRhd2FpdCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdGF3YWl0IHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge2Jvb2xlYW59IFttUGFyYW1ldGVycy5iU3RhdGljQWN0aW9uXSBCb29sZWFuIHZhbHVlIGZvciBzdGF0aWMgYWN0aW9uLCB1bmRlZmluZWQgZm9yIG90aGVyIGFjdGlvbnNcblx0Ly8gQHBhcmFtIHtib29sZWFufSBbbVBhcmFtZXRlcnMuaXNOYXZpZ2FibGVdIEJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIG5hdmlnYXRpb24gaXMgcmVxdWlyZWQgYWZ0ZXIgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZFxuXHQvLyBDdXJyZW50bHkgdGhlIHBhcmFtZXRlciBpc05hdmlnYWJsZSBpcyB1c2VkIGludGVybmFsbHkgYW5kIHNob3VsZCBiZSBjaGFuZ2VkIHRvIHJlcXVpcmVzTmF2aWdhdGlvbiBhcyBpdCBpcyBhIG1vcmUgYXB0IG5hbWUgZm9yIHRoaXMgcGFyYW1cblxuXHQvKipcblx0ICogSW52b2tlcyBhbiBhY3Rpb24gKGJvdW5kIG9yIHVuYm91bmQpIGFuZCB0cmFja3MgdGhlIGNoYW5nZXMgc28gdGhhdCBvdGhlciBwYWdlcyBjYW4gYmUgcmVmcmVzaGVkIGFuZCBzaG93IHRoZSB1cGRhdGVkIGRhdGEgdXBvbiBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXMubmFtZSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLnZhbHVlIFZhbHVlIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZyBTa2lwcyB0aGUgYWN0aW9uIHBhcmFtZXRlciBkaWFsb2cgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIG9mIHRoZW0gaW4gcGFyYW1ldGVyVmFsdWVzXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNvbnRleHRzIEZvciBhIGJvdW5kIGFjdGlvbiwgYSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgdG8gYmUgY2FsbGVkIG11c3QgYmUgcHJvdmlkZWRcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMubW9kZWwgRm9yIGFuIHVuYm91bmQgYWN0aW9uLCBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbCBtdXN0IGJlIHByb3ZpZGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnJlcXVpcmVzTmF2aWdhdGlvbiBCb29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBuYXZpZ2F0aW9uIGlzIHJlcXVpcmVkIGFmdGVyIHRoZSBhY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQuIE5hdmlnYXRpb24gdGFrZXMgcGxhY2UgdG8gdGhlIGNvbnRleHQgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5sYWJlbCBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uLiBUaGlzIGlzIG5lZWRlZCBpbiBjYXNlIHRoZSBhY3Rpb24gaGFzIGEgcGFyYW1ldGVyIGFuZCBhIHBhcmFtZXRlciBkaWFsb2cgaXMgc2hvd24gdG8gdGhlIHVzZXIuIFRoZSBsYWJlbCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nIGFuZCBmb3IgdGhlIGNvbmZpcm1hdGlvbiBidXR0b25cblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nIE1vZGUgaG93IGFjdGlvbnMgYXJlIHRvIGJlIGNhbGxlZDogJ0NoYW5nZVNldCcgdG8gcHV0IGFsbCBhY3Rpb24gY2FsbHMgaW50byBvbmUgY2hhbmdlc2V0LCAnSXNvbGF0ZWQnIHRvIHB1dCB0aGVtIGludG8gc2VwYXJhdGUgY2hhbmdlc2V0c1xuXHQgKiBAcGFyYW0gbUV4dHJhUGFyYW1zIFBSSVZBVEVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIG9uY2UgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZCwgcHJvdmlkaW5nIHRoZSByZXNwb25zZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjaW52b2tlQWN0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKiBAZmluYWxcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBpbnZva2VBY3Rpb24oXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRtSW5QYXJhbWV0ZXJzPzoge1xuXHRcdFx0cGFyYW1ldGVyVmFsdWVzPzogeyBuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnkgfTtcblx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c/OiBib29sZWFuO1xuXHRcdFx0Y29udGV4dHM/OiBDb250ZXh0IHwgQ29udGV4dFtdO1xuXHRcdFx0bW9kZWw/OiBPRGF0YU1vZGVsO1xuXHRcdFx0cmVxdWlyZXNOYXZpZ2F0aW9uPzogYm9vbGVhbjtcblx0XHRcdGxhYmVsPzogc3RyaW5nO1xuXHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nPzogc3RyaW5nO1xuXHRcdH0sXG5cdFx0bUV4dHJhUGFyYW1zPzogYW55XG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBvQ29udHJvbDogYW55O1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGxldCBhUGFydHM7XG5cdFx0bGV0IHNPdmVybG9hZEVudGl0eVR5cGU7XG5cdFx0bGV0IG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzOiBhbnk7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblxuXHRcdGxldCBtUGFyYW1ldGVyczogYW55ID0gbUluUGFyYW1ldGVycyB8fCB7fTtcblx0XHQvLyBEdWUgdG8gYSBtaXN0YWtlIHRoZSBpbnZva2VBY3Rpb24gaW4gdGhlIGV4dGVuc2lvbkFQSSBoYWQgYSBkaWZmZXJlbnQgQVBJIHRoYW4gdGhpcyBvbmUuXG5cdFx0Ly8gVGhlIG9uZSBmcm9tIHRoZSBleHRlbnNpb25BUEkgZG9lc24ndCBleGlzdCBhbnltb3JlIGFzIHdlIGV4cG9zZSB0aGUgZnVsbCBlZGl0IGZsb3cgbm93IGJ1dFxuXHRcdC8vIGR1ZSB0byBjb21wYXRpYmlsaXR5IHJlYXNvbnMgd2Ugc3RpbGwgbmVlZCB0byBzdXBwb3J0IHRoZSBvbGQgc2lnbmF0dXJlXG5cdFx0aWYgKFxuXHRcdFx0KG1QYXJhbWV0ZXJzLmlzQSAmJiBtUGFyYW1ldGVycy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkgfHxcblx0XHRcdEFycmF5LmlzQXJyYXkobVBhcmFtZXRlcnMpIHx8XG5cdFx0XHRtRXh0cmFQYXJhbXMgIT09IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0Y29uc3QgY29udGV4dHMgPSBtUGFyYW1ldGVycztcblx0XHRcdG1QYXJhbWV0ZXJzID0gbUV4dHJhUGFyYW1zIHx8IHt9O1xuXHRcdFx0aWYgKGNvbnRleHRzKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gY29udGV4dHM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5tb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bVBhcmFtZXRlcnMuaXNOYXZpZ2FibGUgPSBtUGFyYW1ldGVycy5yZXF1aXJlc05hdmlnYXRpb24gfHwgbVBhcmFtZXRlcnMuaXNOYXZpZ2FibGU7XG5cblx0XHQvLyBEZXRlcm1pbmUgaWYgdGhlIHJlZmVyZW5jZWQgYWN0aW9uIGlzIGJvdW5kIG9yIHVuYm91bmRcblx0XHRjb25zdCBjb252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpPy5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0Ly8gVGhlIEVudGl0eUNvbnRhaW5lciBtYXkgTk9UIGJlIG1pc3NpbmcsIHNvIGl0IHNob3VsZCBub3QgYmUgYWJsZSB0byBiZSB1bmRlZmluZWQsIGJ1dCBzaW5jZSBpbiBvdXIgY29udmVydGVkIE1ldGFkYXRhXG5cdFx0Ly8gaXQgY2FuIGJlIHVuZGVmaW5lZCwgSSBuZWVkIHRoaXMgd29ya2Fyb3VuZCBoZXJlIG9mIGFkZGluZyBcIlwiIHNpbmNlIGluZGV4T2YgZG9lcyBub3QgYWNjZXB0IHNvbWV0aGluZyB0aGF0J3Ncblx0XHQvLyB1bmRlZmluZWQuXG5cdFx0aWYgKHNBY3Rpb25OYW1lLmluZGV4T2YoXCJcIiArIGNvbnZlcnRlZE1ldGFkYXRhLmVudGl0eUNvbnRhaW5lci5uYW1lKSA+IC0xKSB7XG5cdFx0XHQvLyBVbmJvdW5kIGFjdGlvbnMgYXJlIGFsd2F5cyByZWZlcmVuY2VkIHZpYSB0aGUgYWN0aW9uIGltcG9ydCBhbmQgd2UgZm91bmQgdGhlIEVudGl0eUNvbnRhaW5lciBpbiB0aGUgc0FjdGlvbk5hbWUgc29cblx0XHRcdC8vIGFuIHVuYm91bmQgYWN0aW9uIGlzIHJlZmVyZW5jZWQhXG5cdFx0XHRtUGFyYW1ldGVycy5pc0JvdW5kID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE5vIGVudGl0eSBjb250YWluZXIgaW4gdGhlIHNBY3Rpb25OYW1lLCBzbyBlaXRoZXIgYSBib3VuZCBvciBzdGF0aWMgYWN0aW9uIGlzIHJlZmVyZW5jZWQgd2hpY2ggaXMgYWxzbyBib3VuZCFcblx0XHRcdG1QYXJhbWV0ZXJzLmlzQm91bmQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICghbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCkge1xuXHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycy5jb250cm9sSWQpIHtcblx0XHRcdG9Db250cm9sID0gdGhpcy5nZXRWaWV3KCkuYnlJZChtUGFyYW1ldGVycy5jb250cm9sSWQpO1xuXHRcdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRcdC8vIFRPRE86IGN1cnJlbnRseSB0aGlzIHNlbGVjdGVkIGNvbnRleHRzIHVwZGF0ZSBpcyBkb25lIHdpdGhpbiB0aGUgb3BlcmF0aW9uLCBzaG91bGQgYmUgbW92ZWQgb3V0XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gb0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdH1cblxuXHRcdGlmIChzQWN0aW9uTmFtZSAmJiBzQWN0aW9uTmFtZS5pbmRleE9mKFwiKFwiKSA+IC0xKSB7XG5cdFx0XHQvLyBnZXQgZW50aXR5IHR5cGUgb2YgYWN0aW9uIG92ZXJsb2FkIGFuZCByZW1vdmUgaXQgZnJvbSB0aGUgYWN0aW9uIHBhdGhcblx0XHRcdC8vIEV4YW1wbGUgc0FjdGlvbk5hbWUgPSBcIjxBY3Rpb25OYW1lPihDb2xsZWN0aW9uKDxPdmVybG9hZEVudGl0eVR5cGU+KSlcIlxuXHRcdFx0Ly8gc0FjdGlvbk5hbWUgPSBhUGFydHNbMF0gLS0+IDxBY3Rpb25OYW1lPlxuXHRcdFx0Ly8gc092ZXJsb2FkRW50aXR5VHlwZSA9IGFQYXJ0c1syXSAtLT4gPE92ZXJsb2FkRW50aXR5VHlwZT5cblx0XHRcdGFQYXJ0cyA9IHNBY3Rpb25OYW1lLnNwbGl0KFwiKFwiKTtcblx0XHRcdHNBY3Rpb25OYW1lID0gYVBhcnRzWzBdO1xuXHRcdFx0c092ZXJsb2FkRW50aXR5VHlwZSA9IChhUGFydHNbYVBhcnRzLmxlbmd0aCAtIDFdIGFzIGFueSkucmVwbGFjZUFsbChcIilcIiwgXCJcIik7XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmJTdGF0aWNBY3Rpb24pIHtcblx0XHRcdGlmIChvQ29udHJvbC5pc1RhYmxlQm91bmQoKSkge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250ZXh0cyA9IG9Db250cm9sLmdldFJvd0JpbmRpbmcoKS5nZXRIZWFkZXJDb250ZXh0KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBvQ29udHJvbC5kYXRhKFwicm93c0JpbmRpbmdJbmZvXCIpLnBhdGgsXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nID0gbmV3IChPRGF0YUxpc3RCaW5kaW5nIGFzIGFueSkodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSwgc0JpbmRpbmdQYXRoKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSBvTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc092ZXJsb2FkRW50aXR5VHlwZSAmJiBvQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gdGhpcy5fZ2V0QWN0aW9uT3ZlcmxvYWRDb250ZXh0RnJvbU1ldGFkYXRhUGF0aChcblx0XHRcdFx0XHRvQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0XHRcdG9Db250cm9sLmdldFJvd0JpbmRpbmcoKSxcblx0XHRcdFx0XHRzT3ZlcmxvYWRFbnRpdHlUeXBlXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtUGFyYW1ldGVycy5lbmFibGVBdXRvU2Nyb2xsKSB7XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzID0gdGhpcy5jcmVhdGVBY3Rpb25Qcm9taXNlKHNBY3Rpb25OYW1lLCBvQ29udHJvbC5zSWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0ID0gdGhpcy5fZ2V0Qm91bmRDb250ZXh0KG9WaWV3LCBtUGFyYW1ldGVycyk7XG5cdFx0Ly8gTmVlZCB0byBrbm93IHRoYXQgdGhlIGFjdGlvbiBpcyBjYWxsZWQgZnJvbSBPYmplY3RQYWdlIGZvciBjaGFuZ2VTZXQgSXNvbGF0ZWQgd29ya2Fyb3VuZFxuXHRcdG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlID0gKG9WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KS5jb252ZXJ0ZXJUeXBlID09PSBcIk9iamVjdFBhZ2VcIjtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLnN5bmNUYXNrKCk7XG5cdFx0XHRjb25zdCBvUmVzcG9uc2UgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYWxsQWN0aW9uKFxuXHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKClcblx0XHRcdCk7XG5cdFx0XHRsZXQgbGlzdFJlZnJlc2hlZDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5jb250ZXh0cyAmJiBtUGFyYW1ldGVycy5pc0JvdW5kID09PSB0cnVlKSB7XG5cdFx0XHRcdGxpc3RSZWZyZXNoZWQgPSBhd2FpdCB0aGlzLl9yZWZyZXNoTGlzdElmUmVxdWlyZWQoXG5cdFx0XHRcdFx0dGhpcy5nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKHNBY3Rpb25OYW1lLCBvUmVzcG9uc2UpLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzWzBdXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKHRoaXMuZ2V0VmlldygpKSkge1xuXHRcdFx0XHRsZXQgYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0XHRcdFx0aWYgKG9SZXNwb25zZSkge1xuXHRcdFx0XHRcdGFjdGlvblJlcXVlc3RlZFByb3BlcnRpZXMgPSBBcnJheS5pc0FycmF5KG9SZXNwb25zZSlcblx0XHRcdFx0XHRcdD8gT2JqZWN0LmtleXMob1Jlc3BvbnNlWzBdLnZhbHVlLmdldE9iamVjdCgpKVxuXHRcdFx0XHRcdFx0OiBPYmplY3Qua2V5cyhvUmVzcG9uc2UuZ2V0T2JqZWN0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5BY3Rpb24sIG1QYXJhbWV0ZXJzLmNvbnRleHRzLCBzQWN0aW9uTmFtZSwgbGlzdFJlZnJlc2hlZCwgYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleShzQWN0aW9uTmFtZSwgVHJpZ2dlclR5cGUuYWN0aW9uKTtcblxuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzKSB7XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzLmZSZXNvbHZlcihvUmVzcG9uc2UpO1xuXHRcdFx0fVxuXHRcdFx0Lypcblx0XHRcdFx0XHRXZSBzZXQgdGhlICh1cHBlcikgcGFnZXMgdG8gZGlydHkgYWZ0ZXIgYW4gZXhlY3V0aW9uIG9mIGFuIGFjdGlvblxuXHRcdFx0XHRcdFRPRE86IGdldCByaWQgb2YgdGhpcyB3b3JrYXJvdW5kXG5cdFx0XHRcdFx0VGhpcyB3b3JrYXJvdW5kIGlzIG9ubHkgbmVlZGVkIGFzIGxvbmcgYXMgdGhlIG1vZGVsIGRvZXMgbm90IHN1cHBvcnQgdGhlIHN5bmNocm9uaXphdGlvbi5cblx0XHRcdFx0XHRPbmNlIHRoaXMgaXMgc3VwcG9ydGVkIHdlIGRvbid0IG5lZWQgdG8gc2V0IHRoZSBwYWdlcyB0byBkaXJ0eSBhbnltb3JlIGFzIHRoZSBjb250ZXh0IGl0c2VsZlxuXHRcdFx0XHRcdGlzIGFscmVhZHkgcmVmcmVzaGVkIChpdCdzIGp1c3Qgbm90IHJlZmxlY3RlZCBpbiB0aGUgb2JqZWN0IHBhZ2UpXG5cdFx0XHRcdFx0d2UgZXhwbGljaXRseSBkb24ndCBjYWxsIHRoaXMgbWV0aG9kIGZyb20gdGhlIGxpc3QgcmVwb3J0IGJ1dCBvbmx5IGNhbGwgaXQgZnJvbSB0aGUgb2JqZWN0IHBhZ2Vcblx0XHRcdFx0XHRhcyBpZiBpdCBpcyBjYWxsZWQgaW4gdGhlIGxpc3QgcmVwb3J0IGl0J3Mgbm90IG5lZWRlZCAtIGFzIHdlIGFueXdheSB3aWxsIHJlbW92ZSB0aGlzIGxvZ2ljXG5cdFx0XHRcdFx0d2UgY2FuIGxpdmUgd2l0aCB0aGlzXG5cdFx0XHRcdFx0d2UgbmVlZCBhIGNvbnRleHQgdG8gc2V0IHRoZSB1cHBlciBwYWdlcyB0byBkaXJ0eSAtIGlmIHRoZXJlIGFyZSBtb3JlIHRoYW4gb25lIHdlIHVzZSB0aGVcblx0XHRcdFx0XHRmaXJzdCBvbmUgYXMgdGhleSBhcmUgYW55d2F5IHNpYmxpbmdzXG5cdFx0XHRcdFx0Ki9cblx0XHRcdGlmIChtUGFyYW1ldGVycy5jb250ZXh0cykge1xuXHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5nZXRJbnRlcm5hbE1vZGVsKCkuc2V0UHJvcGVydHkoXCIvbGFzdEludm9rZWRBY3Rpb25cIiwgc0FjdGlvbk5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmlzTmF2aWdhYmxlKSB7XG5cdFx0XHRcdGxldCB2Q29udGV4dCA9IG9SZXNwb25zZTtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodkNvbnRleHQpICYmIHZDb250ZXh0Lmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdHZDb250ZXh0ID0gdkNvbnRleHRbMF0udmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZDb250ZXh0ICYmICFBcnJheS5pc0FycmF5KHZDb250ZXh0KSkge1xuXHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvVmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdFx0XHRcdGNvbnN0IHNDb250ZXh0TWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHZDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0Y29uc3QgX2ZuVmFsaWRDb250ZXh0cyA9IChjb250ZXh0czogYW55LCBhcHBsaWNhYmxlQ29udGV4dHM6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRleHRzLmZpbHRlcigoZWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHBsaWNhYmxlQ29udGV4dHMpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYXBwbGljYWJsZUNvbnRleHRzLmluZGV4T2YoZWxlbWVudCkgPiAtMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y29uc3Qgb0FjdGlvbkNvbnRleHQgPSBBcnJheS5pc0FycmF5KG1QYXJhbWV0ZXJzLmNvbnRleHRzKVxuXHRcdFx0XHRcdFx0PyBfZm5WYWxpZENvbnRleHRzKG1QYXJhbWV0ZXJzLmNvbnRleHRzLCBtUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dHMpWzBdXG5cdFx0XHRcdFx0XHQ6IG1QYXJhbWV0ZXJzLmNvbnRleHRzO1xuXHRcdFx0XHRcdGNvbnN0IHNBY3Rpb25Db250ZXh0TWV0YVBhdGggPSBvQWN0aW9uQ29udGV4dCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0aWYgKHNDb250ZXh0TWV0YVBhdGggIT0gdW5kZWZpbmVkICYmIHNDb250ZXh0TWV0YVBhdGggPT09IHNBY3Rpb25Db250ZXh0TWV0YVBhdGgpIHtcblx0XHRcdFx0XHRcdGlmIChvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkgIT09IHZDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmdldEludGVybmFsUm91dGluZygpLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCh2Q29udGV4dCwge1xuXHRcdFx0XHRcdFx0XHRcdGNoZWNrTm9IYXNoQ2hhbmdlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdG5vSGlzdG9yeUVudHJ5OiBmYWxzZVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdExvZy5pbmZvKFwiTmF2aWdhdGlvbiB0byB0aGUgc2FtZSBjb250ZXh0IGlzIG5vdCBhbGxvd2VkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9SZXNwb25zZTtcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzKSB7XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzLmZSZWplY3RvcigpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRklYTUU6IGluIG1vc3Qgc2l0dWF0aW9ucyB0aGVyZSBpcyBubyBoYW5kbGVyIGZvciB0aGUgcmVqZWN0ZWQgcHJvbWlzZXMgcmV0dXJuZWRxXG5cdFx0XHRpZiAoZXJyID09PSBDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKSB7XG5cdFx0XHRcdC8vIFRoaXMgbGVhZHMgdG8gY29uc29sZSBlcnJvci4gQWN0dWFsbHkgdGhlIGVycm9yIGlzIGFscmVhZHkgaGFuZGxlZCAoY3VycmVudGx5IGRpcmVjdGx5IGluIHByZXNzIGhhbmRsZXIgb2YgZW5kIGJ1dHRvbiBpbiBkaWFsb2cpLCBzbyBpdCBzaG91bGQgbm90IGJlIGZvcndhcmRlZFxuXHRcdFx0XHQvLyB1cCB0byBoZXJlLiBIb3dldmVyLCB3aGVuIGRpYWxvZyBoYW5kbGluZyBhbmQgYmFja2VuZCBleGVjdXRpb24gYXJlIHNlcGFyYXRlZCwgaW5mb3JtYXRpb24gd2hldGhlciBkaWFsb2cgd2FzIGNhbmNlbGxlZCwgb3IgYmFja2VuZCBleGVjdXRpb24gaGFzIGZhaWxlZCBuZWVkc1xuXHRcdFx0XHQvLyB0byBiZSB0cmFuc3BvcnRlZCB0byB0aGUgcGxhY2UgcmVzcG9uc2libGUgZm9yIGNvbm5lY3RpbmcgdGhlc2UgdHdvIHRoaW5ncy5cblx0XHRcdFx0Ly8gVE9ETzogcmVtb3ZlIHNwZWNpYWwgaGFuZGxpbmcgb25lIGRpYWxvZyBoYW5kbGluZyBhbmQgYmFja2VuZCBleGVjdXRpb24gYXJlIHNlcGFyYXRlZFxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEaWFsb2cgY2FuY2VsbGVkXCIpO1xuXHRcdFx0fSBlbHNlIGlmICghKGVyciAmJiAoZXJyLmNhbmNlbGVkIHx8IChlcnIucmVqZWN0ZWRJdGVtcyAmJiBlcnIucmVqZWN0ZWRJdGVtc1swXS5jYW5jZWxlZCkpKSkge1xuXHRcdFx0XHQvLyBUT0RPOiBhbmFseXplLCB3aGV0aGVyIHRoaXMgaXMgb2YgdGhlIHNhbWUgY2F0ZWdvcnkgYXMgYWJvdmVcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciBpbiBFZGl0Rmxvdy5pbnZva2VBY3Rpb246JHtlcnJ9YCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBUT0RPOiBBbnkgdW5leHBlY3RlZCBlcnJvcnMgcHJvYmFibHkgc2hvdWxkIG5vdCBiZSBpZ25vcmVkIVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZWN1cmVkIGV4ZWN1dGlvbiBvZiB0aGUgZ2l2ZW4gZnVuY3Rpb24uIEVuc3VyZXMgdGhhdCB0aGUgZnVuY3Rpb24gaXMgb25seSBleGVjdXRlZCB3aGVuIGNlcnRhaW4gY29uZGl0aW9ucyBhcmUgZnVsZmlsbGVkLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIGZuRnVuY3Rpb24gVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLiBTaG91bGQgcmV0dXJuIGEgcHJvbWlzZSB0aGF0IGlzIHNldHRsZWQgYWZ0ZXIgY29tcGxldGlvbiBvZiB0aGUgZXhlY3V0aW9uLiBJZiBub3RoaW5nIGlzIHJldHVybmVkLCBpbW1lZGlhdGUgY29tcGxldGlvbiBpcyBhc3N1bWVkLlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgRGVmaW5pdGlvbnMgb2YgdGhlIHByZWNvbmRpdGlvbnMgdG8gYmUgY2hlY2tlZCBiZWZvcmUgZXhlY3V0aW9uXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5idXN5IERlZmluZXMgdGhlIGJ1c3kgaW5kaWNhdG9yXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5idXN5LnNldCBUcmlnZ2VycyBhIGJ1c3kgaW5kaWNhdG9yIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkLlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuYnVzeS5jaGVjayBFeGVjdXRlcyBmdW5jdGlvbiBvbmx5IGlmIGFwcGxpY2F0aW9uIGlzbid0IGJ1c3kuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy51cGRhdGVzRG9jdW1lbnQgVGhpcyBvcGVyYXRpb24gdXBkYXRlcyB0aGUgY3VycmVudCBkb2N1bWVudCB3aXRob3V0IHVzaW5nIHRoZSBib3VuZCBtb2RlbCBhbmQgY29udGV4dC4gQXMgYSByZXN1bHQsIHRoZSBkcmFmdCBzdGF0dXMgaXMgdXBkYXRlZCBpZiBhIGRyYWZ0IGRvY3VtZW50IGV4aXN0cywgYW5kIHRoZSB1c2VyIGhhcyB0byBjb25maXJtIHRoZSBjYW5jZWxsYXRpb24gb2YgdGhlIGVkaXRpbmcgcHJvY2Vzcy5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVqZWN0ZWQgaWYgdGhlIGV4ZWN1dGlvbiBpcyBwcm9oaWJpdGVkIGFuZCByZXNvbHZlZCBieSB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZm5GdW5jdGlvbi5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I3NlY3VyZWRFeGVjdXRpb25cblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c2VjdXJlZEV4ZWN1dGlvbihcblx0XHRmbkZ1bmN0aW9uOiBGdW5jdGlvbixcblx0XHRtUGFyYW1ldGVycz86IHtcblx0XHRcdGJ1c3k/OiB7XG5cdFx0XHRcdHNldD86IGJvb2xlYW47XG5cdFx0XHRcdGNoZWNrPzogYm9vbGVhbjtcblx0XHRcdH07XG5cdFx0XHR1cGRhdGVzRG9jdW1lbnQ/OiBib29sZWFuO1xuXHRcdH1cblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYkJ1c3lTZXQgPSBtUGFyYW1ldGVycz8uYnVzeT8uc2V0ID8/IHRydWUsXG5cdFx0XHRiQnVzeUNoZWNrID0gbVBhcmFtZXRlcnM/LmJ1c3k/LmNoZWNrID8/IHRydWUsXG5cdFx0XHRiVXBkYXRlc0RvY3VtZW50ID0gbVBhcmFtZXRlcnM/LnVwZGF0ZXNEb2N1bWVudCA/PyBmYWxzZSxcblx0XHRcdG9Mb2NrT2JqZWN0ID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCksXG5cdFx0XHRvQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRiSXNEcmFmdCA9IG9Db250ZXh0ICYmIHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCBhcyBDb250ZXh0KSA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdDtcblxuXHRcdGlmIChiQnVzeUNoZWNrICYmIEJ1c3lMb2NrZXIuaXNMb2NrZWQob0xvY2tPYmplY3QpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJBcHBsaWNhdGlvbiBhbHJlYWR5IGJ1c3kgdGhlcmVmb3JlIGV4ZWN1dGlvbiByZWplY3RlZFwiKTtcblx0XHR9XG5cblx0XHQvLyB3ZSBoYXZlIHRvIHNldCBidXN5IGFuZCBkcmFmdCBpbmRpY2F0b3IgaW1tZWRpYXRlbHkgYWxzbyB0aGUgZnVuY3Rpb24gbWlnaHQgYmUgZXhlY3V0ZWQgbGF0ZXIgaW4gcXVldWVcblx0XHRpZiAoYkJ1c3lTZXQpIHtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cdFx0fVxuXHRcdGlmIChiVXBkYXRlc0RvY3VtZW50ICYmIGJJc0RyYWZ0KSB7XG5cdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmluZyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0cmV0dXJuIHRoaXMuc3luY1Rhc2soZm5GdW5jdGlvbiBhcyAoKSA9PiBhbnkpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGlmIChiVXBkYXRlc0RvY3VtZW50KSB7XG5cdFx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkKHRydWUpO1xuXHRcdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoYklzRHJhZnQpIHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQgJiYgYklzRHJhZnQpIHtcblx0XHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3Qob0Vycm9yKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdGlmIChiQnVzeVNldCkge1xuXHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIHBhdGNoU2VudCBldmVudDogcmVnaXN0ZXIgZG9jdW1lbnQgbW9kaWZpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBzZW50IGJ5IHRoZSBiaW5kaW5nXG5cdCAqL1xuXHRoYW5kbGVQYXRjaFNlbnQob0V2ZW50OiBFdmVudCkge1xuXHRcdC8vIEluIGNvbGxhYm9yYXRpdmUgZHJhZnQsIGRpc2FibGUgRVRhZyBjaGVjayBmb3IgUEFUQ0ggcmVxdWVzdHNcblx0XHRjb25zdCBpc0luQ29sbGFib3JhdGl2ZURyYWZ0ID0gQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKHRoaXMuZ2V0VmlldygpKTtcblx0XHRpZiAoaXNJbkNvbGxhYm9yYXRpdmVEcmFmdCkge1xuXHRcdFx0KChvRXZlbnQuZ2V0U291cmNlKCkgYXMgQmluZGluZykuZ2V0TW9kZWwoKSBhcyBhbnkpLnNldElnbm9yZUVUYWcodHJ1ZSk7XG5cdFx0fVxuXHRcdGlmICghKHRoaXMuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uZ2V0UHJvcGVydHkoXCJza2lwUGF0Y2hIYW5kbGVyc1wiKSkge1xuXHRcdFx0Y29uc3Qgc291cmNlQmluZGluZyA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBPRGF0YUxpc3RCaW5kaW5nO1xuXHRcdFx0Ly8gQ3JlYXRlIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgd2hlbiB0aGUgcGF0aCBpcyBjb21wbGV0ZWRcblx0XHRcdGNvbnN0IG9QYXRjaFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdG9FdmVudC5nZXRTb3VyY2UoKS5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCAocGF0Y2hDb21wbGV0ZWRFdmVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0Ly8gUmUtZW5hYmxlIEVUYWcgY2hlY2tzXG5cdFx0XHRcdFx0aWYgKGlzSW5Db2xsYWJvcmF0aXZlRHJhZnQpIHtcblx0XHRcdFx0XHRcdCgob0V2ZW50LmdldFNvdXJjZSgpIGFzIEJpbmRpbmcpLmdldE1vZGVsKCkgYXMgYW55KS5zZXRJZ25vcmVFVGFnKGZhbHNlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAob0V2ZW50LmdldFNvdXJjZSgpLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnRBZnRlclBhdGNoKFxuXHRcdFx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKSxcblx0XHRcdFx0XHRcdFx0c291cmNlQmluZGluZyxcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGJTdWNjZXNzID0gcGF0Y2hDb21wbGV0ZWRFdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdGlmIChiU3VjY2Vzcykge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnVwZGF0ZURvY3VtZW50KHNvdXJjZUJpbmRpbmcsIG9QYXRjaFByb21pc2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSBDcmVhdGVBY3RpdmF0ZSBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudCBUaGUgZXZlbnQgc2VudCBieSB0aGUgYmluZGluZ1xuXHQgKi9cblx0YXN5bmMgaGFuZGxlQ3JlYXRlQWN0aXZhdGUob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9CaW5kaW5nID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGJBdEVuZCA9IHRydWU7XG5cdFx0Y29uc3QgYkluYWN0aXZlID0gdHJ1ZTtcblx0XHRjb25zdCBvUGFyYW1zOiBhbnkgPSB7XG5cdFx0XHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZS5JbmxpbmUsXG5cdFx0XHRjcmVhdGVBdEVuZDogYkF0RW5kLFxuXHRcdFx0aW5hY3RpdmU6IGJJbmFjdGl2ZSxcblx0XHRcdGtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQ6IGZhbHNlLCAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0YnVzeU1vZGU6IFwiTm9uZVwiXG5cdFx0fTtcblx0XHR0cnkge1xuXHRcdFx0Ly8gU2VuZCBub3RpZmljYXRpb24gdG8gb3RoZXIgdXNlcnMgb25seSBhZnRlciB0aGUgY3JlYXRpb24gaGFzIGJlZW4gZmluYWxpemVkXG5cdFx0XHRjb25zdCBhY3RpdmF0ZWRDb250ZXh0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRleHRcIikgYXMgQ29udGV4dDtcblx0XHRcdGFjdGl2YXRlZENvbnRleHRcblx0XHRcdFx0LmNyZWF0ZWQoKVxuXHRcdFx0XHQ/LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5DcmVhdGUsIGFjdGl2YXRlZENvbnRleHQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKGBGYWlsZWQgdG8gYWN0aXZhdGUgY29udGV4dCAke2FjdGl2YXRlZENvbnRleHQuZ2V0UGF0aCgpfWApO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IGluYWN0aXZlIGNvbnRleHQgKGVtcHR5IHJvdyBpbiB0aGUgdGFibGUpXG5cdFx0XHRjb25zdCBuZXdJbmFjdGl2ZUNvbnRleHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jcmVhdGVEb2N1bWVudChcblx0XHRcdFx0b0JpbmRpbmcgYXMgT0RhdGFMaXN0QmluZGluZyxcblx0XHRcdFx0b1BhcmFtcyxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHRcdGlmIChuZXdJbmFjdGl2ZUNvbnRleHQpIHtcblx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihcIkZhaWxlZCB0byBhY3RpdmF0ZSBuZXcgcm93IC1cIiwgZXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybXMgYSB0YXNrIGluIHN5bmMgd2l0aCBvdGhlciB0YXNrcyBjcmVhdGVkIHZpYSB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBSZXR1cm5zIHRoZSBwcm9taXNlIGNoYWluIG9mIHRoZSB0YXNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gW25ld1Rhc2tdIE9wdGlvbmFsLCBhIHByb21pc2Ugb3IgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgc3luY2hyb25vdXNseVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIHRhc2sgaXMgY29tcGxldGVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzeW5jVGFzayhuZXdUYXNrPzogKCgpID0+IGFueSkgfCBQcm9taXNlPGFueT4pIHtcblx0XHRpZiAobmV3VGFzaykge1xuXHRcdFx0aWYgKHR5cGVvZiBuZXdUYXNrID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhpcy5zeW5jVGFza3MgPSB0aGlzLnN5bmNUYXNrcy50aGVuKG5ld1Rhc2spLmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zeW5jVGFza3MgPSB0aGlzLnN5bmNUYXNrc1xuXHRcdFx0XHRcdC50aGVuKCgpID0+IG5ld1Rhc2spXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5zeW5jVGFza3M7XG5cdH1cblxuXHQvKipcblx0ICogRGVjaWRlcyBpZiBhIGRvY3VtZW50IGlzIHRvIGJlIHNob3duIGluIGRpc3BsYXkgb3IgZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBUaGUgY29udGV4dCB0byBiZSBkaXNwbGF5ZWQgb3IgZWRpdGVkXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIGVkaXQgbW9kZSBpcyBjb21wdXRlZFxuXHQgKi9cblxuXHRhc3luYyBjb21wdXRlRWRpdE1vZGUoY29udGV4dDogQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHByb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwoY29udGV4dCk7XG5cblx0XHRpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdGNvbnN0IGdsb2JhbE1vZGVsID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0XHRcdGdsb2JhbE1vZGVsLnNldFByb3BlcnR5KFwiL2lzRWRpdGFibGVQZW5kaW5nXCIsIHRydWUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0XHRcdGNvbnN0IGlzQWN0aXZlRW50aXR5ID0gYXdhaXQgY29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRcdGlmIChpc0FjdGl2ZUVudGl0eSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHQvLyBpbiBjYXNlIHRoZSBkb2N1bWVudCBpcyBkcmFmdCBzZXQgaXQgaW4gZWRpdCBtb2RlXG5cdFx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSk7XG5cdFx0XHRcdFx0Y29uc3QgaGFzQWN0aXZlRW50aXR5ID0gYXdhaXQgY29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiSGFzQWN0aXZlRW50aXR5XCIpO1xuXHRcdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUodW5kZWZpbmVkLCAhaGFzQWN0aXZlRW50aXR5KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBhY3RpdmUgZG9jdW1lbnQsIHN0YXkgb24gZGlzcGxheSBtb2RlXG5cdFx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Z2xvYmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVBlbmRpbmdcIiwgZmFsc2UsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGRldGVybWluaW5nIHRoZSBlZGl0TW9kZSBmb3IgZHJhZnRcIiwgZXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRjb25zdCBsYXN0SW52b2tlZEFjdGlvbk5hbWUgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKS5nZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiKTtcblx0XHRcdGlmIChsYXN0SW52b2tlZEFjdGlvbk5hbWUgJiYgdGhpcy5pc05ld0FjdGlvbkZvclN0aWNreShsYXN0SW52b2tlZEFjdGlvbk5hbWUsIGNvbnRleHQpKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRWRpdGFibGUsIHRydWUpO1xuXHRcdFx0XHRpZiAoIXRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPbihjb250ZXh0KTtcblx0XHRcdFx0dGhpcy5nZXRJbnRlcm5hbE1vZGVsKCkuc2V0UHJvcGVydHkoXCIvbGFzdEludm9rZWRBY3Rpb25cIiwgdW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBQcml2YXRlIG1ldGhvZHNcblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHQvKipcblx0ICogSW50ZXJuYWwgbWV0aG9kIHRvIGRlbGV0ZSBhIGNvbnRleHQgb3IgYW4gYXJyYXkgb2YgY29udGV4dHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0cyBUaGUgY29udGV4dChzKSB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzIFBhcmFtZXRlcnMgZm9yIGRlbGV0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24oY29udGV4dHM6IENvbnRleHQgfCBDb250ZXh0W10sIHBhcmFtZXRlcnM6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKHRoaXMpO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXG5cdFx0Ly8gVE9ETzogdGhpcyBzZXR0aW5nIGFuZCByZW1vdmluZyBvZiBjb250ZXh0cyBzaG91bGRuJ3QgYmUgaW4gdGhlIHRyYW5zYWN0aW9uIGhlbHBlciBhdCBhbGxcblx0XHQvLyBmb3IgdGhlIHRpbWUgYmVpbmcgSSBrZXB0IGl0IGFuZCBwcm92aWRlIHRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0IHRvIG5vdCBicmVhayBzb21ldGhpbmdcblx0XHRwYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gcGFyYW1ldGVycy5jb250cm9sSWRcblx0XHRcdD8gc2FwLnVpLmdldENvcmUoKS5ieUlkKHBhcmFtZXRlcnMuY29udHJvbElkKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0YXdhaXQgdGhpcy5zeW5jVGFzaygpO1xuXHRcdGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmRlbGV0ZURvY3VtZW50KGNvbnRleHRzLCBwYXJhbWV0ZXJzLCB0aGlzLmdldEFwcENvbXBvbmVudCgpLCByZXNvdXJjZU1vZGVsLCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkpO1xuXHR9XG5cblx0X2dldFJlc291cmNlTW9kZWwoKTogUmVzb3VyY2VNb2RlbCB7XG5cdFx0cmV0dXJuIGdldFJlc291cmNlTW9kZWwodGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRUcmFuc2FjdGlvbkhlbHBlcigpIHtcblx0XHRyZXR1cm4gVHJhbnNhY3Rpb25IZWxwZXI7XG5cdH1cblxuXHRwcml2YXRlIGdldE1lc3NhZ2VIYW5kbGVyKCkge1xuXHRcdGlmICh0aGlzLmJhc2UubWVzc2FnZUhhbmRsZXIpIHtcblx0XHRcdHJldHVybiB0aGlzLmJhc2UubWVzc2FnZUhhbmRsZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVkaXQgRmxvdyB3b3JrcyBvbmx5IHdpdGggYSBnaXZlbiBtZXNzYWdlIGhhbmRsZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRJbnRlcm5hbE1vZGVsKCk6IEpTT05Nb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRHbG9iYWxVSU1vZGVsKCk6IEpTT05Nb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikgYXMgSlNPTk1vZGVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhhdCB0aGUgY3VycmVudCBwYWdlIGNvbnRhaW5zIGEgbmV3bHkgY3JlYXRlZCBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBiQ3JlYXRpb25Nb2RlIFRydWUgaWYgdGhlIG9iamVjdCBpcyBuZXdcblx0ICovXG5cdHByaXZhdGUgc2V0Q3JlYXRpb25Nb2RlKGJDcmVhdGlvbk1vZGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCB1aU1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwidWlcIikgYXMgQ29udGV4dDtcblx0XHR0aGlzLmdldEdsb2JhbFVJTW9kZWwoKS5zZXRQcm9wZXJ0eShcImNyZWF0ZU1vZGVcIiwgYkNyZWF0aW9uTW9kZSwgdWlNb2RlbENvbnRleHQsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBjdXJyZW50IHBhZ2UgY29udGFpbnMgYSBuZXdseSBjcmVhdGVkIG9iamVjdCBvciBub3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG9iamVjdCBpcyBuZXdcblx0ICovXG5cdHByaXZhdGUgZ2V0Q3JlYXRpb25Nb2RlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHVpTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKSBhcyBDb250ZXh0O1xuXHRcdHJldHVybiAhIXRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLmdldFByb3BlcnR5KFwiY3JlYXRlTW9kZVwiLCB1aU1vZGVsQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIG9iamVjdCBiZWluZyBlZGl0ZWQgKG9yIG9uZSBvZiBpdHMgc3ViLW9iamVjdHMpIGhhcyBiZWVuIG1vZGlmaWVkIG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBiZWVuIG1vZGlmaWVkXG5cdCAqL1xuXHRwcml2YXRlIGlzRG9jdW1lbnRNb2RpZmllZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISF0aGlzLmdldEdsb2JhbFVJTW9kZWwoKS5nZXRQcm9wZXJ0eShcIi9pc0RvY3VtZW50TW9kaWZpZWRcIik7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGF0IHRoZSBvYmplY3QgYmVpbmcgZWRpdGVkIChvciBvbmUgb2YgaXRzIHN1Yi1vYmplY3RzKSBoYXMgYmVlbiBtb2RpZmllZC5cblx0ICpcblx0ICogQHBhcmFtIG1vZGlmaWVkIFRydWUgaWYgdGhlIG9iamVjdCBoYXMgYmVlbiBtb2RpZmllZFxuXHQgKi9cblx0cHJpdmF0ZSBzZXREb2N1bWVudE1vZGlmaWVkKG1vZGlmaWVkOiBib29sZWFuKSB7XG5cdFx0dGhpcy5nZXRHbG9iYWxVSU1vZGVsKCkuc2V0UHJvcGVydHkoXCIvaXNEb2N1bWVudE1vZGlmaWVkXCIsIG1vZGlmaWVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoYXQgdGhlIG9iamVjdCBiZWluZyBlZGl0ZWQgaGFzIGJlZW4gbW9kaWZpZWQgYnkgY3JlYXRpbmcgYSBzdWItb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gbGlzdEJpbmRpbmcgVGhlIGxpc3QgYmluZGluZyBvbiB3aGljaCB0aGUgb2JqZWN0IGhhcyBiZWVuIGNyZWF0ZWRcblx0ICovXG5cdHByaXZhdGUgc2V0RG9jdW1lbnRNb2RpZmllZE9uQ3JlYXRlKGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdFx0Ly8gU2V0IHRoZSBtb2RpZmllZCBmbGFnIG9ubHkgb24gcmVsYXRpdmUgbGlzdEJpbmRpbmdzLCBpLmUuIHdoZW4gY3JlYXRpbmcgYSBzdWItb2JqZWN0XG5cdFx0Ly8gSWYgdGhlIGxpc3RCaW5kaW5nIGlzIG5vdCByZWxhdGl2ZSwgdGhlbiBpdCdzIGEgY3JlYXRpb24gZnJvbSB0aGUgTGlzdFJlcG9ydCwgYW5kIGJ5IGRlZmF1bHQgYSBuZXdseSBjcmVhdGVkIHJvb3Qgb2JqZWN0IGlzbid0IGNvbnNpZGVyZWQgYXMgbW9kaWZpZWRcblx0XHRpZiAobGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpKSB7XG5cdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQodHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIGNyZWF0ZSBldmVudDogc2hvd3MgbWVzc2FnZXMgYW5kIGluIGNhc2Ugb2YgYSBkcmFmdCwgdXBkYXRlcyB0aGUgZHJhZnQgaW5kaWNhdG9yLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIGJpbmRpbmcgT0RhdGEgbGlzdCBiaW5kaW5nIG9iamVjdFxuXHQgKi9cblx0cHJpdmF0ZSBoYW5kbGVDcmVhdGVFdmVudHMoYmluZGluZzogT0RhdGFMaXN0QmluZGluZykge1xuXHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXG5cdFx0Y29uc3QgcHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChiaW5kaW5nKTtcblxuXHRcdGJpbmRpbmcuYXR0YWNoRXZlbnQoXCJjcmVhdGVTZW50XCIsICgpID0+IHtcblx0XHRcdGlmIChwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2aW5nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50KFwiY3JlYXRlQ29tcGxldGVkXCIsIChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgc3VjY2VzcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWNjZXNzXCIpO1xuXHRcdFx0aWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhzdWNjZXNzID8gRHJhZnRTdGF0dXMuU2F2ZWQgOiBEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkcmFmdCBzdGF0dXMgbWVzc2FnZSAoZGlzcGxheWVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UpLlxuXHQgKlxuXHQgKiBAcGFyYW0gZHJhZnRTdGF0dXMgVGhlIGRyYWZ0IHN0YXR1cyBtZXNzYWdlXG5cdCAqL1xuXHRzZXREcmFmdFN0YXR1cyhkcmFmdFN0YXR1czogc3RyaW5nKSB7XG5cdFx0KHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikgYXMgSlNPTk1vZGVsKS5zZXRQcm9wZXJ0eShcIi9kcmFmdFN0YXR1c1wiLCBkcmFmdFN0YXR1cywgdW5kZWZpbmVkLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwcm9ncmFtbWluZyBtb2RlbCBmcm9tIGEgYmluZGluZyBvciBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzb3VyY2UgVGhlIGJpbmRpbmcgb3IgY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgcHJvZ3JhbW1pbmcgbW9kZWxcblx0ICovXG5cdHByaXZhdGUgZ2V0UHJvZ3JhbW1pbmdNb2RlbChzb3VyY2U6IENvbnRleHQgfCBCaW5kaW5nKTogdHlwZW9mIFByb2dyYW1taW5nTW9kZWwge1xuXHRcdHJldHVybiB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCkuZ2V0UHJvZ3JhbW1pbmdNb2RlbChzb3VyY2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGVkaXQgbW9kZS5cblx0ICpcblx0ICogQHBhcmFtIGVkaXRNb2RlIFRoZSBlZGl0IG1vZGVcblx0ICogQHBhcmFtIGlzQ3JlYXRpb24gVHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBiZWVuIG5ld2x5IGNyZWF0ZWRcblx0ICovXG5cdHByaXZhdGUgc2V0RWRpdE1vZGUoZWRpdE1vZGU/OiBzdHJpbmcsIGlzQ3JlYXRpb24/OiBib29sZWFuKSB7XG5cdFx0Ly8gYXQgdGhpcyBwb2ludCBvZiB0aW1lIGl0J3Mgbm90IG1lYW50IHRvIHJlbGVhc2UgdGhlIGVkaXQgZmxvdyBmb3IgZnJlZXN0eWxlIHVzYWdlIHRoZXJlZm9yZSB3ZSBjYW5cblx0XHQvLyByZWx5IG9uIHRoZSBnbG9iYWwgVUkgbW9kZWwgdG8gZXhpc3Rcblx0XHRjb25zdCBnbG9iYWxNb2RlbCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXG5cdFx0aWYgKGVkaXRNb2RlKSB7XG5cdFx0XHRnbG9iYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIsIGVkaXRNb2RlID09PSBcIkVkaXRhYmxlXCIsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0aWYgKGlzQ3JlYXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gU2luY2Ugc2V0Q3JlYXRpb25Nb2RlIGlzIHB1YmxpYyBpbiBFZGl0RmxvdyBhbmQgY2FuIGJlIG92ZXJyaWRlbiwgbWFrZSBzdXJlIHRvIGNhbGwgaXQgdmlhIHRoZSBjb250cm9sbGVyXG5cdFx0XHQvLyB0byBlbnN1cmUgYW55IG92ZXJyaWRlcyBhcmUgdGFrZW4gaW50byBhY2NvdW50XG5cdFx0XHR0aGlzLnNldENyZWF0aW9uTW9kZShpc0NyZWF0aW9uKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGFuIGFjdGlvbiBjb3JyZXNwb25kcyB0byBhIGNyZWF0ZSBhY3Rpb24gZm9yIGEgc3RpY2t5IHNlc3Npb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBhY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCBmb3IgdGhlIHN0aWNreSBzZXNzaW9uXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGFjdGlvbiBpcyBhIGNyZWF0ZSBhY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaXNOZXdBY3Rpb25Gb3JTdGlja3koYWN0aW9uTmFtZTogc3RyaW5nLCBjb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IGVudGl0eVNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhQ29udGV4dCkuc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXHRcdFx0Y29uc3Qgc3RpY2t5U2Vzc2lvbiA9IGVudGl0eVNldC5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkO1xuXHRcdFx0aWYgKHN0aWNreVNlc3Npb24/Lk5ld0FjdGlvbiA9PT0gYWN0aW9uTmFtZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChzdGlja3lTZXNzaW9uPy5BZGRpdGlvbmFsTmV3QWN0aW9ucyAmJiBzdGlja3lTZXNzaW9uPy5BZGRpdGlvbmFsTmV3QWN0aW9ucy5pbmRleE9mKGFjdGlvbk5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE8gTW92ZSBhbGwgc3RpY2t5LXJlbGF0ZWQgYmVsb3cgdG8gYSBzdGlja3kgc2Vzc2lvbiBtYW5hZ2VyIGNsYXNzXG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhlIHN0aWNreSBlZGl0IHNlc3Npb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IGJlaW5nIGVkaXRlZFxuXHQgKiBAcmV0dXJucyBUcnVlIGluIGNhc2Ugb2Ygc3VjY2VzcywgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRwcml2YXRlIGhhbmRsZVN0aWNreU9uKGNvbnRleHQ6IENvbnRleHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBhcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChhcHBDb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgQXBwQ29tcG9uZW50IGZvciBmdW5jdGlvbiBoYW5kbGVTdGlja3lPblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5oYXNOYXZpZ2F0aW9uR3VhcmQoKSkge1xuXHRcdFx0XHRjb25zdCBoYXNoVHJhY2tlciA9IGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmdldEhhc2goKTtcblx0XHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRoaXMuZ2V0SW50ZXJuYWxNb2RlbCgpO1xuXG5cdFx0XHRcdC8vIFNldCBhIGd1YXJkIGluIHRoZSBSb3V0ZXJQcm94eVxuXHRcdFx0XHQvLyBBIHRpbWVvdXQgaXMgbmVjZXNzYXJ5LCBhcyB3aXRoIGRlZmVycmVkIGNyZWF0aW9uIHRoZSBoYXNoQ2hhbmdlciBpcyBub3QgdXBkYXRlZCB5ZXQgd2l0aFxuXHRcdFx0XHQvLyB0aGUgbmV3IGhhc2gsIGFuZCB0aGUgZ3VhcmQgY2Fubm90IGJlIGZvdW5kIGluIHRoZSBtYW5hZ2VkIGhpc3Rvcnkgb2YgdGhlIHJvdXRlciBwcm94eVxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXROYXZpZ2F0aW9uR3VhcmQoY29udGV4dC5nZXRQYXRoKCkuc3Vic3RyaW5nKDEpKTtcblx0XHRcdFx0fSwgMCk7XG5cblx0XHRcdFx0Ly8gU2V0dGluZyBiYWNrIG5hdmlnYXRpb24gb24gc2hlbGwgc2VydmljZSwgdG8gZ2V0IHRoZSBkaWNhcmQgbWVzc2FnZSBib3ggaW4gY2FzZSBvZiBzdGlja3lcblx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbih0aGlzLm9uQmFja05hdmlnYXRpb25JblNlc3Npb24uYmluZCh0aGlzKSk7XG5cblx0XHRcdFx0dGhpcy5kaXJ0eVN0YXRlUHJvdmlkZXJGdW5jdGlvbiA9IHRoaXMuZ2V0RGlydHlTdGF0ZVByb3ZpZGVyKGFwcENvbXBvbmVudCwgaW50ZXJuYWxNb2RlbCwgaGFzaFRyYWNrZXIpO1xuXHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKHRoaXMuZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24pO1xuXG5cdFx0XHRcdC8vIGhhbmRsZSBzZXNzaW9uIHRpbWVvdXRcblx0XHRcdFx0Y29uc3QgaTE4bk1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKTtcblx0XHRcdFx0dGhpcy5zZXNzaW9uVGltZW91dEZ1bmN0aW9uID0gdGhpcy5nZXRTZXNzaW9uVGltZW91dEZ1bmN0aW9uKGNvbnRleHQsIGkxOG5Nb2RlbCk7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpIGFzIGFueSkuYXR0YWNoU2Vzc2lvblRpbWVvdXQodGhpcy5zZXNzaW9uVGltZW91dEZ1bmN0aW9uKTtcblxuXHRcdFx0XHR0aGlzLnN0aWNreURpc2NhcmRBZnRlck5hdmlnYXRpb25GdW5jdGlvbiA9IHRoaXMuZ2V0Um91dGVNYXRjaGVkRnVuY3Rpb24oY29udGV4dCwgYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuYXR0YWNoUm91dGVNYXRjaGVkKHRoaXMuc3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbkZ1bmN0aW9uKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmluZm8oZXJyb3IgYXMgYW55KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNhYmxlcyB0aGUgc3RpY2t5IGVkaXQgc2Vzc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpbiBjYXNlIG9mIHN1Y2Nlc3MsIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0cHJpdmF0ZSBoYW5kbGVTdGlja3lPZmYoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKGFwcENvbXBvbmVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBBcHBDb21wb25lbnQgZm9yIGZ1bmN0aW9uIGhhbmRsZVN0aWNreU9mZlwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSkge1xuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGV4aXRlZCBmcm9tIHRoZSBhcHAsIENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCBkb2Vzbid0IHJldHVybiBhXG5cdFx0XHRcdC8vIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCwgaGVuY2UgdGhlICdpZicgYWJvdmVcblx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZGlzY2FyZE5hdmlnYXRpb25HdWFyZCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5kaXJ0eVN0YXRlUHJvdmlkZXJGdW5jdGlvbikge1xuXHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIodGhpcy5kaXJ0eVN0YXRlUHJvdmlkZXJGdW5jdGlvbik7XG5cdFx0XHRcdHRoaXMuZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRcdFx0aWYgKG1vZGVsICYmIHRoaXMuc2Vzc2lvblRpbWVvdXRGdW5jdGlvbikge1xuXHRcdFx0XHRtb2RlbC5kZXRhY2hTZXNzaW9uVGltZW91dCh0aGlzLnNlc3Npb25UaW1lb3V0RnVuY3Rpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHRhcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5zdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24pO1xuXHRcdFx0dGhpcy5zdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24gPSB1bmRlZmluZWQ7XG5cblx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRGlzcGxheSwgZmFsc2UpO1xuXG5cdFx0XHRpZiAoYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMpIHtcblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBleGl0ZWQgZnJvbSB0aGUgYXBwLCBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQgZG9lc24ndCByZXR1cm4gYVxuXHRcdFx0XHQvLyBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQsIGhlbmNlIHRoZSAnaWYnIGFib3ZlXG5cdFx0XHRcdGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24oKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmluZm8oZXJyb3IgYXMgYW55KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdF9zZXRTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHByb2dyYW1taW5nTW9kZWw6IHN0cmluZywgbW9kZWw6IE9EYXRhTW9kZWwpIHtcblx0XHRpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2Vzc2lvbk9uXCIsIHRydWUpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zdGlja3lTZXNzaW9uVG9rZW5cIiwgKG1vZGVsLmdldEh0dHBIZWFkZXJzKHRydWUpIGFzIGFueSlbXCJTQVAtQ29udGV4dElkXCJdKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHVzZWQgYXMgYSBEaXJ0eVN0YXRlUHJvdmlkZXIgaW4gdGhlIFNoZWxsLlxuXHQgKlxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHAgY29tcG9uZW50XG5cdCAqIEBwYXJhbSBpbnRlcm5hbE1vZGVsIFRoZSBtb2RlbCBcImludGVybmFsXCJcblx0ICogQHBhcmFtIGhhc2hUcmFja2VyIEhhc2ggdHJhY2tlclxuXHQgKiBAcmV0dXJucyBUaGUgY2FsbGJhY2sgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgZ2V0RGlydHlTdGF0ZVByb3ZpZGVyKGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LCBpbnRlcm5hbE1vZGVsOiBKU09OTW9kZWwsIGhhc2hUcmFja2VyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gKG5hdmlnYXRpb25Db250ZXh0OiBhbnkpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChuYXZpZ2F0aW9uQ29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzIGZvciBEaXJ0eVN0YXRlUHJvdmlkZXIgZnVuY3Rpb25cIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB0YXJnZXRIYXNoID0gbmF2aWdhdGlvbkNvbnRleHQuaW5uZXJBcHBSb3V0ZTtcblx0XHRcdFx0Y29uc3Qgcm91dGVyUHJveHkgPSBhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblx0XHRcdFx0bGV0IGxjbEhhc2hUcmFja2VyID0gXCJcIjtcblx0XHRcdFx0bGV0IGlzRGlydHk6IGJvb2xlYW47XG5cdFx0XHRcdGNvbnN0IGlzU2Vzc2lvbk9uID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9zZXNzaW9uT25cIik7XG5cblx0XHRcdFx0aWYgKCFpc1Nlc3Npb25Pbikge1xuXHRcdFx0XHRcdC8vIElmIHRoZSBzdGlja3kgc2Vzc2lvbiB3YXMgdGVybWluYXRlZCBiZWZvcmUgaGFuZC5cblx0XHRcdFx0XHQvLyBFeGFtcGxlIGluIGNhc2Ugb2YgbmF2aWdhdGluZyBhd2F5IGZyb20gYXBwbGljYXRpb24gdXNpbmcgSUJOLlxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIXJvdXRlclByb3h5LmlzTmF2aWdhdGlvbkZpbmFsaXplZCgpKSB7XG5cdFx0XHRcdFx0Ly8gSWYgbmF2aWdhdGlvbiBpcyBjdXJyZW50bHkgaGFwcGVuaW5nIGluIFJvdXRlclByb3h5LCBpdCdzIGEgdHJhbnNpZW50IHN0YXRlXG5cdFx0XHRcdFx0Ly8gKG5vdCBkaXJ0eSlcblx0XHRcdFx0XHRpc0RpcnR5ID0gZmFsc2U7XG5cdFx0XHRcdFx0bGNsSGFzaFRyYWNrZXIgPSB0YXJnZXRIYXNoO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGhhc2hUcmFja2VyID09PSB0YXJnZXRIYXNoKSB7XG5cdFx0XHRcdFx0Ly8gdGhlIGhhc2ggZGlkbid0IGNoYW5nZSBzbyBlaXRoZXIgdGhlIHVzZXIgYXR0ZW1wdHMgdG8gcmVmcmVzaCBvciB0byBsZWF2ZSB0aGUgYXBwXG5cdFx0XHRcdFx0aXNEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocm91dGVyUHJveHkuY2hlY2tIYXNoV2l0aEd1YXJkKHRhcmdldEhhc2gpIHx8IHJvdXRlclByb3h5LmlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIoKSkge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgcm9vdCBvYmplY3Rcblx0XHRcdFx0XHQvLyBvciBjcm9zc2luZyB0aGUgZ3VhcmQgaGFzIGFscmVhZHkgYmVlbiBhbGxvd2VkIGJ5IHRoZSBSb3V0ZXJQcm94eVxuXHRcdFx0XHRcdGxjbEhhc2hUcmFja2VyID0gdGFyZ2V0SGFzaDtcblx0XHRcdFx0XHRpc0RpcnR5ID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdGhlIHVzZXIgYXR0ZW1wdHMgdG8gbmF2aWdhdGUgd2l0aGluIHRoZSBhcHAsIGZvciBleGFtcGxlIGJhY2sgdG8gdGhlIGxpc3QgcmVwb3J0XG5cdFx0XHRcdFx0aXNEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNEaXJ0eSkge1xuXHRcdFx0XHRcdC8vIHRoZSBGTFAgZG9lc24ndCBjYWxsIHRoZSBkaXJ0eSBzdGF0ZSBwcm92aWRlciBhbnltb3JlIG9uY2UgaXQncyBkaXJ0eSwgYXMgdGhleSBjYW4ndFxuXHRcdFx0XHRcdC8vIGNoYW5nZSB0aGlzIGR1ZSB0byBjb21wYXRpYmlsaXR5IHJlYXNvbnMgd2Ugc2V0IGl0IGJhY2sgdG8gbm90LWRpcnR5XG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldERpcnR5RmxhZyhmYWxzZSk7XG5cdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGFzaFRyYWNrZXIgPSBsY2xIYXNoVHJhY2tlcjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBpc0RpcnR5O1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0TG9nLmluZm8oZXJyb3IgYXMgYW55KTtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSB1c2VkIHdoZW4gYSBzdGlja3kgc2Vzc2lvbiB0aW1lcyBvdXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdGlja3lDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgc3RpY2t5IHNlc3Npb25cblx0ICogQHBhcmFtIGkxOG5Nb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgY2FsbGJhY2sgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgZ2V0U2Vzc2lvblRpbWVvdXRGdW5jdGlvbihzdGlja3lDb250ZXh0OiBDb250ZXh0LCBpMThuTW9kZWw6IE1vZGVsKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChzdGlja3lDb250ZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb250ZXh0IG1pc3NpbmcgZm9yIFNlc3Npb25UaW1lb3V0IGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlbW92ZSB0cmFuc2llbnQgbWVzc2FnZXMgc2luY2Ugd2Ugd2lsbCBzaG93aW5nIG91ciBvd24gbWVzc2FnZVxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHRcdFx0Y29uc3Qgd2FybmluZ0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdHRpdGxlOiBcIntzYXAuZmUuaTE4bj5DX0VESVRGTE9XX09CSkVDVF9QQUdFX1NFU1NJT05fRVhQSVJFRF9ESUFMT0dfVElUTEV9XCIsXG5cdFx0XHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IG5ldyBUZXh0KHsgdGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19FRElURkxPV19PQkpFQ1RfUEFHRV9TRVNTSU9OX0VYUElSRURfRElBTE9HX01FU1NBR0V9XCIgfSksXG5cdFx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0dGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fRElBTE9HX09LfVwiLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0XHRwcmVzczogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHQvLyByZW1vdmUgc3RpY2t5IGhhbmRsaW5nIGFmdGVyIG5hdmlnYXRpb24gc2luY2Ugc2Vzc2lvbiBoYXMgYWxyZWFkeSBiZWVuIHRlcm1pbmF0ZWRcblx0XHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRJbnRlcm5hbFJvdXRpbmcoKS5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChzdGlja3lDb250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR3YXJuaW5nRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR3YXJuaW5nRGlhbG9nLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaUNvbnRlbnRQYWRkaW5nXCIpO1xuXHRcdFx0XHR3YXJuaW5nRGlhbG9nLnNldE1vZGVsKGkxOG5Nb2RlbCwgXCJzYXAuZmUuaTE4blwiKTtcblx0XHRcdFx0dGhpcy5nZXRWaWV3KCkuYWRkRGVwZW5kZW50KHdhcm5pbmdEaWFsb2cpO1xuXHRcdFx0XHR3YXJuaW5nRGlhbG9nLm9wZW4oKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIG9uUm91dGVNYXRjaGVkIGV2ZW50IGluIGNhc2Ugb2Ygc3RpY2t5IGVkaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IGJlaW5nIGVkaXRlZCAocm9vdCBvZiB0aGUgc3RpY2t5IHNlc3Npb24pXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcCBjb21wb25lbnRcblx0ICogQHJldHVybnMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldFJvdXRlTWF0Y2hlZEZ1bmN0aW9uKGNvbnRleHQ6IENvbnRleHQsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGNvbnN0IGN1cnJlbnRIYXNoID0gYXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZ2V0SGFzaCgpO1xuXHRcdFx0Ly8gZWl0aGVyIGN1cnJlbnQgaGFzaCBpcyBlbXB0eSBzbyB0aGUgdXNlciBsZWZ0IHRoZSBhcHAgb3IgaGUgbmF2aWdhdGVkIGF3YXkgZnJvbSB0aGUgb2JqZWN0XG5cdFx0XHRpZiAoIWN1cnJlbnRIYXNoIHx8ICFhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5jaGVja0hhc2hXaXRoR3VhcmQoY3VycmVudEhhc2gpKSB7XG5cdFx0XHRcdHRoaXMuZGlzY2FyZFN0aWNreVNlc3Npb24oY29udGV4dCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdC8vY2xlYXIgdGhlIHNlc3Npb24gY29udGV4dCB0byBlbnN1cmUgdGhlIExSIHJlZnJlc2hlcyB0aGUgbGlzdCB3aXRob3V0IGEgc2Vzc2lvblxuXHRcdFx0XHRcdChjb250ZXh0LmdldE1vZGVsKCkgYXMgYW55KS5jbGVhclNlc3Npb25Db250ZXh0KCk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogRW5kcyBhIHN0aWNreSBzZXNzaW9uIGJ5IGRpc2NhcmRpbmcgY2hhbmdlcy5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgYmVpbmcgZWRpdGVkIChyb290IG9mIHRoZSBzdGlja3kgc2Vzc2lvbilcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZGlzY2FyZFN0aWNreVNlc3Npb24oY29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IGRpc2NhcmRlZENvbnRleHQgPSBhd2FpdCBzdGlja3kuZGlzY2FyZERvY3VtZW50KGNvbnRleHQpO1xuXHRcdGlmIChkaXNjYXJkZWRDb250ZXh0Py5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRkaXNjYXJkZWRDb250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHR9XG5cdFx0ZGlzY2FyZGVkQ29udGV4dD8ucmVmcmVzaCgpO1xuXHRcdHRoaXMuaGFuZGxlU3RpY2t5T2ZmKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgaW50ZXJuYWwgcm91dGluZyBleHRlbnNpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBpbnRlcm5hbCByb3V0aW5nIGV4dGVuc2lvblxuXHQgKi9cblx0cHJpdmF0ZSBnZXRJbnRlcm5hbFJvdXRpbmcoKTogSW50ZXJuYWxSb3V0aW5nIHtcblx0XHRpZiAodGhpcy5iYXNlLl9yb3V0aW5nKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5iYXNlLl9yb3V0aW5nO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFZGl0IEZsb3cgd29ya3Mgb25seSB3aXRoIGEgZ2l2ZW4gcm91dGluZyBsaXN0ZW5lclwiKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHR9XG5cblx0X2dldFNlbWFudGljTWFwcGluZygpOiBTZW1hbnRpY01hcHBpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRpbmdTZXJ2aWNlKCkuZ2V0TGFzdFNlbWFudGljTWFwcGluZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB0byB3YWl0IGZvciBhbiBhY3Rpb24gdG8gYmUgZXhlY3V0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBhY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRyb2xJZCBUaGUgSUQgb2YgdGhlIGNvbnRyb2xcblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmVzb2x2ZXIgZnVuY3Rpb24gd2hpY2ggY2FuIGJlIHVzZWQgdG8gZXh0ZXJuYWxseSByZXNvbHZlIHRoZSBwcm9taXNlXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZUFjdGlvblByb21pc2UoYWN0aW9uTmFtZTogc3RyaW5nLCBjb250cm9sSWQ6IHN0cmluZykge1xuXHRcdGxldCByZXNvbHZlRnVuY3Rpb24sIHJlamVjdEZ1bmN0aW9uO1xuXHRcdHRoaXMuYWN0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHJlc29sdmVGdW5jdGlvbiA9IHJlc29sdmU7XG5cdFx0XHRyZWplY3RGdW5jdGlvbiA9IHJlamVjdDtcblx0XHR9KS50aGVuKChvUmVzcG9uc2U6IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oeyBjb250cm9sSWQgfSwgdGhpcy5nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKGFjdGlvbk5hbWUsIG9SZXNwb25zZSkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7IGZSZXNvbHZlcjogcmVzb2x2ZUZ1bmN0aW9uLCBmUmVqZWN0b3I6IHJlamVjdEZ1bmN0aW9uIH07XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGFjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0aGF0IGlzIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSByZXNwb25zZSBUaGUgYm91bmQgYWN0aW9uJ3MgcmVzcG9uc2UgZGF0YSBvciByZXNwb25zZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIE9iamVjdCB3aXRoIGRhdGEgYW5kIG5hbWVzIG9mIHRoZSBrZXkgZmllbGRzIG9mIHRoZSByZXNwb25zZVxuXHQgKi9cblx0cHJpdmF0ZSBnZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKGFjdGlvbk5hbWU6IHN0cmluZywgcmVzcG9uc2U6IGFueSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xuXHRcdFx0aWYgKHJlc3BvbnNlLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXNwb25zZSA9IHJlc3BvbnNlWzBdLnZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghcmVzcG9uc2UpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRjb25zdCBjdXJyZW50VmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG1ldGFNb2RlbERhdGEgPSAoY3VycmVudFZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLmdldERhdGEoKTtcblx0XHRjb25zdCBhY3Rpb25SZXR1cm5UeXBlID1cblx0XHRcdG1ldGFNb2RlbERhdGEgJiYgbWV0YU1vZGVsRGF0YVthY3Rpb25OYW1lXSAmJiBtZXRhTW9kZWxEYXRhW2FjdGlvbk5hbWVdWzBdICYmIG1ldGFNb2RlbERhdGFbYWN0aW9uTmFtZV1bMF0uJFJldHVyblR5cGVcblx0XHRcdFx0PyBtZXRhTW9kZWxEYXRhW2FjdGlvbk5hbWVdWzBdLiRSZXR1cm5UeXBlLiRUeXBlXG5cdFx0XHRcdDogbnVsbDtcblx0XHRjb25zdCBrZXlzID0gYWN0aW9uUmV0dXJuVHlwZSAmJiBtZXRhTW9kZWxEYXRhW2FjdGlvblJldHVyblR5cGVdID8gbWV0YU1vZGVsRGF0YVthY3Rpb25SZXR1cm5UeXBlXS4kS2V5IDogbnVsbDtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRvRGF0YTogcmVzcG9uc2UuZ2V0T2JqZWN0KCksXG5cdFx0XHRrZXlzXG5cdFx0fTtcblx0fVxuXG5cdGdldEN1cnJlbnRBY3Rpb25Qcm9taXNlKCkge1xuXHRcdHJldHVybiB0aGlzLmFjdGlvblByb21pc2U7XG5cdH1cblxuXHRkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSgpIHtcblx0XHR0aGlzLmFjdGlvblByb21pc2UgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRfc2Nyb2xsQW5kRm9jdXNPbkluYWN0aXZlUm93KHRhYmxlOiBUYWJsZSkge1xuXHRcdGNvbnN0IHJvd0JpbmRpbmcgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCkgYXMgT0RhdGFMaXN0QmluZGluZztcblx0XHRjb25zdCBhY3RpdmVSb3dJbmRleDogbnVtYmVyID0gcm93QmluZGluZy5nZXRDb3VudCgpIHx8IDA7XG5cdFx0aWYgKHRhYmxlLmRhdGEoXCJ0YWJsZVR5cGVcIikgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRcdGlmIChhY3RpdmVSb3dJbmRleCA+IDApIHtcblx0XHRcdFx0dGFibGUuc2Nyb2xsVG9JbmRleChhY3RpdmVSb3dJbmRleCAtIDEpO1xuXHRcdFx0fVxuXHRcdFx0dGFibGUuZm9jdXNSb3coYWN0aXZlUm93SW5kZXgsIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKiBJbiBhIHJlc3BvbnNpdmUgdGFibGUsIHRoZSBlbXB0eSByb3dzIGFwcGVhciBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0YWJsZS4gQnV0IHdoZW4gd2UgY3JlYXRlIG1vcmUsIHRoZXkgYXBwZWFyIGJlbG93IHRoZSBuZXcgbGluZS5cblx0XHRcdCAqIFNvIHdlIGNoZWNrIHRoZSBmaXJzdCBpbmFjdGl2ZSByb3cgZmlyc3QsIHRoZW4gd2Ugc2V0IHRoZSBmb2N1cyBvbiBpdCB3aGVuIHdlIHByZXNzIHRoZSBidXR0b24uXG5cdFx0XHQgKiBUaGlzIGRvZXNuJ3QgaW1wYWN0IHRoZSBHcmlkVGFibGUgYmVjYXVzZSB0aGV5IGFwcGVhciBhdCB0aGUgZW5kLCBhbmQgd2UgYWxyZWFkeSBmb2N1cyB0aGUgYmVmb3JlLXRoZS1sYXN0IHJvdyAoYmVjYXVzZSAyIGVtcHR5IHJvd3MgZXhpc3QpXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IGFsbFJvd0NvbnRleHRzID0gcm93QmluZGluZy5nZXRDb250ZXh0cygpO1xuXHRcdFx0aWYgKCFhbGxSb3dDb250ZXh0cz8ubGVuZ3RoKSB7XG5cdFx0XHRcdHRhYmxlLmZvY3VzUm93KGFjdGl2ZVJvd0luZGV4LCB0cnVlKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGZvY3VzUm93ID0gYWN0aXZlUm93SW5kZXgsXG5cdFx0XHRcdGluZGV4ID0gMDtcblx0XHRcdGZvciAoY29uc3Qgc2luZ2xlQ29udGV4dCBvZiBhbGxSb3dDb250ZXh0cykge1xuXHRcdFx0XHRpZiAoc2luZ2xlQ29udGV4dC5pc0luYWN0aXZlKCkgJiYgaW5kZXggPCBmb2N1c1Jvdykge1xuXHRcdFx0XHRcdGZvY3VzUm93ID0gaW5kZXg7XG5cdFx0XHRcdH1cblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblx0XHRcdGlmIChmb2N1c1JvdyA+IDApIHtcblx0XHRcdFx0dGFibGUuc2Nyb2xsVG9JbmRleChmb2N1c1Jvdyk7XG5cdFx0XHR9XG5cdFx0XHR0YWJsZS5mb2N1c1Jvdyhmb2N1c1JvdywgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cdGFzeW5jIGNyZWF0ZUVtcHR5Um93c0FuZEZvY3VzKHRhYmxlOiBUYWJsZSkge1xuXHRcdGNvbnN0IHRhYmxlQVBJID0gdGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0aWYgKFxuXHRcdFx0dGFibGVBUEk/LnRhYmxlRGVmaW5pdGlvbj8uY29udHJvbD8uaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSAmJlxuXHRcdFx0IXRhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwidWlcIik/LmdldFByb3BlcnR5KFwiY3JlYXRlTW9kZVwiKVxuXHRcdCkge1xuXHRcdFx0Ly8gV2l0aCB0aGUgcGFyYW1ldGVyLCB3ZSBkb24ndCBoYXZlIGVtcHR5IHJvd3MgaW4gRWRpdCBtb2RlLCBzbyB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGVtIGJlZm9yZSBzZXR0aW5nIHRoZSBmb2N1cyBvbiB0aGVtXG5cdFx0XHRhd2FpdCB0YWJsZUFQSS5zZXRVcEVtcHR5Um93cyh0YWJsZSwgdHJ1ZSk7XG5cdFx0fVxuXHRcdHRoaXMuX3Njcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyh0YWJsZSk7XG5cdH1cblxuXHRfc2VuZEFjdGl2aXR5KFxuXHRcdGFjdGlvbjogQWN0aXZpdHksXG5cdFx0cmVsYXRlZENvbnRleHRzOiBDb250ZXh0IHwgQ29udGV4dFtdIHwgdW5kZWZpbmVkLFxuXHRcdGFjdGlvbk5hbWU/OiBzdHJpbmcsXG5cdFx0cmVmcmVzaExpc3RCaW5kaW5nPzogYm9vbGVhbixcblx0XHRhY3Rpb25SZXF1ZXN0ZWRQcm9wZXJ0aWVzPzogc3RyaW5nW11cblx0KSB7XG5cdFx0Y29uc3QgY29udGVudCA9IEFycmF5LmlzQXJyYXkocmVsYXRlZENvbnRleHRzKSA/IHJlbGF0ZWRDb250ZXh0cy5tYXAoKGNvbnRleHQpID0+IGNvbnRleHQuZ2V0UGF0aCgpKSA6IHJlbGF0ZWRDb250ZXh0cz8uZ2V0UGF0aCgpO1xuXHRcdEFjdGl2aXR5U3luYy5zZW5kKHRoaXMuZ2V0VmlldygpLCBhY3Rpb24sIGNvbnRlbnQsIGFjdGlvbk5hbWUsIHJlZnJlc2hMaXN0QmluZGluZywgYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcyk7XG5cdH1cblxuXHRfdHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkoc0FjdGlvbk5hbWU6IHN0cmluZywgdHJpZ2dlclR5cGU6IFRyaWdnZXJUeXBlKSB7XG5cdFx0dHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkodGhpcy5nZXRWaWV3KCksIHNBY3Rpb25OYW1lLCB0cmlnZ2VyVHlwZSk7XG5cdH1cblxuXHRhc3luYyBfc3VibWl0T3BlbkNoYW5nZXMob0NvbnRleHQ6IGFueSk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdG9Mb2NrT2JqZWN0ID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cblx0XHR0cnkge1xuXHRcdFx0Ly8gU3VibWl0IGFueSBsZWZ0b3ZlciBjaGFuZ2VzIHRoYXQgYXJlIG5vdCB5ZXQgc3VibWl0dGVkXG5cdFx0XHQvLyBDdXJyZW50bHkgd2UgYXJlIHVzaW5nIG9ubHkgMSB1cGRhdGVHcm91cElkLCBoZW5jZSBzdWJtaXR0aW5nIHRoZSBiYXRjaCBkaXJlY3RseSBoZXJlXG5cdFx0XHRhd2FpdCBvTW9kZWwuc3VibWl0QmF0Y2goXCIkYXV0b1wiKTtcblxuXHRcdFx0Ly8gV2FpdCBmb3IgYWxsIGN1cnJlbnRseSBydW5uaW5nIGNoYW5nZXNcblx0XHRcdC8vIEZvciB0aGUgdGltZSBiZWluZyB3ZSBhZ3JlZWQgd2l0aCB0aGUgdjQgbW9kZWwgdGVhbSB0byB1c2UgYW4gaW50ZXJuYWwgbWV0aG9kLiBXZSdsbCByZXBsYWNlIGl0IG9uY2Vcblx0XHRcdC8vIGEgcHVibGljIG9yIHJlc3RyaWN0ZWQgbWV0aG9kIHdhcyBwcm92aWRlZFxuXHRcdFx0YXdhaXQgb01vZGVsLm9SZXF1ZXN0b3Iud2FpdEZvclJ1bm5pbmdDaGFuZ2VSZXF1ZXN0cyhcIiRhdXRvXCIpO1xuXG5cdFx0XHQvLyBDaGVjayBpZiBhbGwgY2hhbmdlcyB3ZXJlIHN1Ym1pdHRlZCBzdWNjZXNzZnVsbHlcblx0XHRcdGlmIChvTW9kZWwuaGFzUGVuZGluZ0NoYW5nZXMoXCIkYXV0b1wiKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzdWJtaXQgb2Ygb3BlbiBjaGFuZ2VzIGZhaWxlZFwiKTtcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob0xvY2tPYmplY3QpKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfcmVtb3ZlU3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhwcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcpIHtcblx0XHRpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2Vzc2lvbk9uXCIsIGZhbHNlKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc3RpY2t5U2Vzc2lvblRva2VuXCIsIHVuZGVmaW5lZCk7XG5cdFx0XHR0aGlzLmhhbmRsZVN0aWNreU9mZigpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGlzcGxheSBhICdkaXNjYXJkJyBwb3BvdmVyIHdoZW4gZXhpdGluZyBhIHN0aWNreSBzZXNzaW9uLlxuXHQgKi9cblx0cHJpdmF0ZSBvbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCkge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCByb3V0ZXJQcm94eSA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyUHJveHkoKTtcblxuXHRcdGlmIChyb3V0ZXJQcm94eS5jaGVja0lmQmFja0lzT3V0T2ZHdWFyZCgpKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3QgcHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChiaW5kaW5nQ29udGV4dCk7XG5cblx0XHRcdHN0aWNreS5wcm9jZXNzRGF0YUxvc3NDb25maXJtYXRpb24oXG5cdFx0XHRcdGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmRpc2NhcmRTdGlja3lTZXNzaW9uKGJpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHByb2dyYW1taW5nTW9kZWwpO1xuXHRcdFx0XHRcdGhpc3RvcnkuYmFjaygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2aWV3LFxuXHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGhpc3RvcnkuYmFjaygpO1xuXHR9XG5cblx0YXN5bmMgX2hhbmRsZU5ld0NvbnRleHQoXG5cdFx0b0NvbnRleHQ6IENvbnRleHQsXG5cdFx0YkVkaXRhYmxlOiBib29sZWFuLFxuXHRcdGJSZWNyZWF0ZUNvbnRleHQ6IGJvb2xlYW4sXG5cdFx0YkRyYWZ0TmF2aWdhdGlvbjogYm9vbGVhbixcblx0XHRiRm9yY2VGb2N1cyA9IGZhbHNlXG5cdCkge1xuXHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIHtcblx0XHRcdGNoZWNrTm9IYXNoQ2hhbmdlOiB0cnVlLFxuXHRcdFx0ZWRpdGFibGU6IGJFZGl0YWJsZSxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IHRydWUsXG5cdFx0XHRiUmVjcmVhdGVDb250ZXh0OiBiUmVjcmVhdGVDb250ZXh0LFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdHNob3dQbGFjZWhvbGRlcjogZmFsc2UsXG5cdFx0XHRiRm9yY2VGb2N1czogYkZvcmNlRm9jdXMsXG5cdFx0XHRrZWVwQ3VycmVudExheW91dDogdHJ1ZVxuXHRcdH0pO1xuXHR9XG5cblx0X2dldEJvdW5kQ29udGV4dCh2aWV3OiBhbnksIHBhcmFtczogYW55KSB7XG5cdFx0Y29uc3Qgdmlld0xldmVsID0gdmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbDtcblx0XHRjb25zdCBiUmVmcmVzaEFmdGVyQWN0aW9uID0gdmlld0xldmVsID4gMSB8fCAodmlld0xldmVsID09PSAxICYmIHBhcmFtcy5jb250cm9sSWQpO1xuXHRcdHJldHVybiAhcGFyYW1zLmlzTmF2aWdhYmxlIHx8ICEhYlJlZnJlc2hBZnRlckFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlcmUgYXJlIHZhbGlkYXRpb24gKHBhcnNlKSBlcnJvcnMgZm9yIGNvbnRyb2xzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9yc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZXMgaWYgdGhlcmUgYXJlIG5vIHZhbGlkYXRpb24gZXJyb3JzLCBhbmQgcmVqZWN0cyBpZiB0aGVyZSBhcmUgdmFsaWRhdGlvbiBlcnJvcnNcblx0ICovXG5cblx0X2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycygpIHtcblx0XHRyZXR1cm4gdGhpcy5zeW5jVGFzaygpLnRoZW4oKCkgPT4ge1xuXHRcdFx0Y29uc3Qgc1ZpZXdJZCA9IHRoaXMuZ2V0VmlldygpLmdldElkKCk7XG5cdFx0XHRjb25zdCBhTWVzc2FnZXMgPSBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0bGV0IG9Db250cm9sO1xuXHRcdFx0bGV0IG9NZXNzYWdlO1xuXG5cdFx0XHRpZiAoIWFNZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIk5vIHZhbGlkYXRpb24gZXJyb3JzIGZvdW5kXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFNZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvTWVzc2FnZSA9IGFNZXNzYWdlc1tpXTtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24pIHtcblx0XHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5nZXRDb250cm9sSWQoKSk7XG5cdFx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRyb2wuZ2V0SWQoKSA9PT0gc1ZpZXdJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJ2YWxpZGF0aW9uIGVycm9ycyBleGlzdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9yZWZyZXNoTGlzdElmUmVxdWlyZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvUmVzcG9uc2UgVGhlIHJlc3BvbnNlIG9mIHRoZSBib3VuZCBhY3Rpb24gYW5kIHRoZSBuYW1lcyBvZiB0aGUga2V5IGZpZWxkc1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGJvdW5kIGNvbnRleHQgb24gd2hpY2ggdGhlIGFjdGlvbiB3YXMgZXhlY3V0ZWRcblx0ICogQHJldHVybnMgQWx3YXlzIHJlc29sdmVzIHRvIHBhcmFtIG9SZXNwb25zZVxuXHQgKi9cblx0X3JlZnJlc2hMaXN0SWZSZXF1aXJlZChvUmVzcG9uc2U6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4gfCB1bmRlZmluZWQ+IHtcblx0XHRpZiAoIW9Db250ZXh0IHx8ICFvUmVzcG9uc2UgfHwgIW9SZXNwb25zZS5vRGF0YSkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHRcdH1cblx0XHRjb25zdCBvQmluZGluZyA9IG9Db250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHQvLyByZWZyZXNoIG9ubHkgbGlzdHNcblx0XHRpZiAob0JpbmRpbmcgJiYgb0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9SZXNwb25zZS5vRGF0YTtcblx0XHRcdGNvbnN0IGFLZXlzID0gb1Jlc3BvbnNlLmtleXM7XG5cdFx0XHRjb25zdCBvQ3VycmVudERhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdGxldCBiUmV0dXJuZWRDb250ZXh0SXNTYW1lID0gdHJ1ZTtcblx0XHRcdC8vIGVuc3VyZSBjb250ZXh0IGlzIGluIHRoZSByZXNwb25zZVxuXHRcdFx0aWYgKE9iamVjdC5rZXlzKG9Db250ZXh0RGF0YSkubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIGNvbnRleHQgaW4gcmVzcG9uc2UgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGJvdW5kIGNvbnRleHRcblx0XHRcdFx0YlJldHVybmVkQ29udGV4dElzU2FtZSA9IGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChzS2V5OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0N1cnJlbnREYXRhW3NLZXldID09PSBvQ29udGV4dERhdGFbc0tleV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoIWJSZXR1cm5lZENvbnRleHRJc1NhbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRcdGlmICgob0JpbmRpbmcgYXMgYW55KS5pc1Jvb3QoKSkge1xuXHRcdFx0XHRcdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoIWJSZXR1cm5lZENvbnRleHRJc1NhbWUpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0b0JpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdFx0XHQucmVxdWVzdFNpZGVFZmZlY3RzKFt7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBvQmluZGluZy5nZXRQYXRoKCkgfV0sIG9CaW5kaW5nLmdldENvbnRleHQoKSBhcyBDb250ZXh0KVxuXHRcdFx0XHRcdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCFiUmV0dXJuZWRDb250ZXh0SXNTYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCFiUmV0dXJuZWRDb250ZXh0SXNTYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIsIGUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIHJlc29sdmUgd2l0aCBvUmVzcG9uc2UgdG8gbm90IGRpc3R1cmIgdGhlIHByb21pc2UgY2hhaW4gYWZ0ZXJ3YXJkc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0fVxuXG5cdF9mZXRjaFNlbWFudGljS2V5VmFsdWVzKG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnksXG5cdFx0XHRzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSxcblx0XHRcdGFTZW1hbnRpY0tleXMgPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMob01ldGFNb2RlbCwgc0VudGl0eVNldE5hbWUpO1xuXG5cdFx0aWYgKGFTZW1hbnRpY0tleXMgJiYgYVNlbWFudGljS2V5cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFSZXF1ZXN0UHJvbWlzZXMgPSBhU2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAob0tleTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KG9LZXkuJFByb3BlcnR5UGF0aCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXF1ZXN0UHJvbWlzZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIHRoZSBsYXRlc3QgY29udGV4dCBpbiB0aGUgbWV0YWRhdGEgaGllcmFyY2h5IGZyb20gcm9vdEJpbmRpbmcgdG8gZ2l2ZW4gY29udGV4dCBwb2ludGluZyB0byBnaXZlbiBlbnRpdHlUeXBlXG5cdCAqIGlmIGFueSBzdWNoIGNvbnRleHQgZXhpc3RzLiBPdGhlcndpc2UsIGl0IHJldHVybnMgdGhlIG9yaWdpbmFsIGNvbnRleHQuXG5cdCAqIE5vdGU6IEl0IGlzIG9ubHkgbmVlZGVkIGFzIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLiBDb3JyZWN0IG1vZGVsbGluZyB3b3VsZCBpbXBseSBhIERhdGFGaWVsZEZvckFjdGlvbiBpbiBhIExpbmVJdGVtXG5cdCAqIHRvIHBvaW50IHRvIGFuIG92ZXJsb2FkIGRlZmluZWQgZWl0aGVyIG9uIHRoZSBjb3JyZXNwb25kaW5nIEVudGl0eVR5cGUgb3IgYSBjb2xsZWN0aW9uIG9mIHRoZSBzYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdENvbnRleHQgVGhlIGNvbnRleHQgdG8gc3RhcnQgc2VhcmNoaW5nIGZyb21cblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIFRoZSBsaXN0QmluZGluZyBvZiB0aGUgdGFibGVcblx0ICogQHBhcmFtIG92ZXJsb2FkRW50aXR5VHlwZSBUaGUgQWN0aW9uT3ZlcmxvYWQgZW50aXR5IHR5cGUgdG8gc2VhcmNoIGZvclxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBBY3Rpb25PdmVybG9hZCBlbnRpdHlcblx0ICovXG5cdF9nZXRBY3Rpb25PdmVybG9hZENvbnRleHRGcm9tTWV0YWRhdGFQYXRoKHJvb3RDb250ZXh0OiBDb250ZXh0LCBsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgb3ZlcmxvYWRFbnRpdHlUeXBlOiBzdHJpbmcpOiBDb250ZXh0IHtcblx0XHRjb25zdCBtb2RlbDogT0RhdGFNb2RlbCA9IHJvb3RDb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBjb250ZXh0U2VnbWVudHM6IHN0cmluZ1tdID0gbGlzdEJpbmRpbmcuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgY3VycmVudENvbnRleHQ6IENvbnRleHQgPSByb290Q29udGV4dDtcblxuXHRcdC8vIFdlIGV4cGVjdCB0aGF0IHRoZSBsYXN0IHNlZ21lbnQgb2YgdGhlIGxpc3RCaW5kaW5nIGlzIHRoZSBMaXN0QmluZGluZyBvZiB0aGUgdGFibGUuIFJlbW92ZSB0aGlzIGZyb20gY29udGV4dFNlZ21lbnRzXG5cdFx0Ly8gYmVjYXVzZSBpdCBpcyBpbmNvcnJlY3QgdG8gZXhlY3V0ZSBiaW5kQ29udGV4dCBvbiBhIGxpc3QuIFdlIGRvIG5vdCBhbnl3YXkgbmVlZCB0byBzZWFyY2ggdGhpcyBjb250ZXh0IGZvciB0aGUgb3ZlcmxvYWQuXG5cdFx0Y29udGV4dFNlZ21lbnRzLnBvcCgpO1xuXHRcdGlmIChjb250ZXh0U2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMgPSBbXCJcIl07IC8vIERvbid0IGxlYXZlIGNvbnRleHRTZWdtZW50cyB1bmRlZmluZWRcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dFNlZ21lbnRzWzBdICE9PSBcIlwiKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMudW5zaGlmdChcIlwiKTsgLy8gdG8gYWxzbyBnZXQgdGhlIHJvb3QgY29udGV4dCwgaS5lLiB0aGUgYmluZGluZ0NvbnRleHQgb2YgdGhlIHRhYmxlXG5cdFx0fVxuXHRcdC8vIGxvYWQgYWxsIHRoZSBwYXJlbnQgY29udGV4dHMgaW50byBhbiBhcnJheVxuXHRcdGNvbnN0IHBhcmVudENvbnRleHRzOiBDb250ZXh0W10gPSBjb250ZXh0U2VnbWVudHNcblx0XHRcdC5tYXAoKHBhdGhTZWdtZW50OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHBhdGhTZWdtZW50ICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0Y3VycmVudENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChwYXRoU2VnbWVudCwgY3VycmVudENvbnRleHQpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENyZWF0aW5nIGEgbmV3IGNvbnRleHQgdXNpbmcgYmluZENvbnRleHQoLi4uKS5nZXRCb3VuZENvbnRleHQoKSBkb2VzIG5vdCB3b3JrIGlmIHRoZSBldGFnIGlzIG5lZWRlZC4gQWNjb3JkaW5nIHRvIG1vZGVsIGNvbGxlYWd1ZXMsXG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdWxkIGFsd2F5cyB1c2UgYW4gZXhpc3RpbmcgY29udGV4dCBpZiBwb3NzaWJsZS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHksIHRoZSBvbmx5IGV4YW1wbGUgd2Uga25vdyBhYm91dCBpcyB1c2luZyB0aGUgcm9vdENvbnRleHQgLSBhbmQgaW4gdGhpcyBjYXNlLCB3ZSBjYW4gb2J2aW91c2x5IHJldXNlIHRoYXQgZXhpc3RpbmcgY29udGV4dC5cblx0XHRcdFx0XHQvLyBJZiBvdGhlciBleGFtcGxlcyBzaG91bGQgY29tZSB1cCwgdGhlIGJlc3QgcG9zc2libGUgd29yayBhcm91bmQgd291bGQgYmUgdG8gcmVxdWVzdCBzb21lIGRhdGEgdG8gZ2V0IGFuIGV4aXN0aW5nIGNvbnRleHQuIFRvIGtlZXAgdGhlXG5cdFx0XHRcdFx0Ly8gcmVxdWVzdCBhcyBzbWFsbCBhbmQgZmFzdCBhcyBwb3NzaWJsZSwgd2Ugc2hvdWxkIHJlcXVlc3Qgb25seSB0aGUgZmlyc3Qga2V5IHByb3BlcnR5LiBBcyB0aGlzIHdvdWxkIGludHJvZHVjZSBhc3luY2hyb25pc20sIGFuZCBhbnl3YXlcblx0XHRcdFx0XHQvLyB0aGUgd2hvbGUgbG9naWMgaXMgb25seSBwYXJ0IG9mIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLCB3ZSB3YWl0IHVudGlsIHdlIGhhdmUgYW4gZXhhbXBsZSBuZWVkaW5nIGl0IGJlZm9yZSBpbXBsZW1lbnRpbmcgdGhpcy5cblx0XHRcdFx0XHRjdXJyZW50Q29udGV4dCA9IHJvb3RDb250ZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50Q29udGV4dDtcblx0XHRcdH0pXG5cdFx0XHQucmV2ZXJzZSgpO1xuXHRcdC8vIHNlYXJjaCBmb3IgY29udGV4dCBiYWNrd2FyZHNcblx0XHRjb25zdCBvdmVybG9hZENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQgPSBwYXJlbnRDb250ZXh0cy5maW5kKFxuXHRcdFx0KHBhcmVudENvbnRleHQ6IENvbnRleHQpID0+XG5cdFx0XHRcdChtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocGFyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIiRUeXBlXCIpIGFzIHVua25vd24gYXMgc3RyaW5nKSA9PT0gb3ZlcmxvYWRFbnRpdHlUeXBlXG5cdFx0KTtcblx0XHRyZXR1cm4gb3ZlcmxvYWRDb250ZXh0IHx8IGxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSE7XG5cdH1cblxuXHRfY3JlYXRlU2libGluZ0luZm8oY3VycmVudENvbnRleHQ6IENvbnRleHQsIG5ld0NvbnRleHQ6IENvbnRleHQpOiBTaWJsaW5nSW5mb3JtYXRpb24ge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRDb250ZXh0OiBuZXdDb250ZXh0LFxuXHRcdFx0cGF0aE1hcHBpbmc6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9sZFBhdGg6IGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdDb250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0fVxuXG5cdF91cGRhdGVQYXRoc0luSGlzdG9yeShtYXBwaW5nczogeyBvbGRQYXRoOiBzdHJpbmc7IG5ld1BhdGg6IHN0cmluZyB9W10pIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuc2V0UGF0aE1hcHBpbmcobWFwcGluZ3MpO1xuXG5cdFx0Ly8gQWxzbyB1cGRhdGUgdGhlIHNlbWFudGljIG1hcHBpbmcgaW4gdGhlIHJvdXRpbmcgc2VydmljZVxuXHRcdGNvbnN0IGxhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9nZXRTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRpZiAobWFwcGluZ3MubGVuZ3RoICYmIGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPT09IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm9sZFBhdGgpIHtcblx0XHRcdGxhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm5ld1BhdGg7XG5cdFx0fVxuXHR9XG5cblx0X2dldE5hdmlnYXRpb25UYXJnZXRGb3JFZGl0KGNvbnRleHQ6IENvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dDogQ29udGV4dCwgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZCkge1xuXHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZTogQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRzaWJsaW5nSW5mbyA9IHNpYmxpbmdJbmZvID8/IHRoaXMuX2NyZWF0ZVNpYmxpbmdJbmZvKGNvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPSBuZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0fVxuXHRcdHJldHVybiBjb250ZXh0VG9OYXZpZ2F0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgc2libGluZyBjb250ZXh0IGZvciBhIHN1Ym9iamVjdCBwYWdlLCBhbmQgY2FsY3VsYXRlcyBhIHNpYmxpbmcgcGF0aFxuXHQgKiBmb3IgYWxsIGludGVybWVkaWF0ZSBwYXRocyBiZXR3ZWVuIHRoZSBvYmplY3QgcGFnZSBhbmQgdGhlIHN1Ym9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgcm9vdCBvZiB0aGUgZHJhZnRcblx0ICogQHBhcmFtIHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBzdWJvYmplY3Rcblx0ICogQHBhcmFtIHNQcm9ncmFtbWluZ01vZGVsIFRoZSBwcm9ncmFtbWluZyBtb2RlbFxuXHQgKiBAcGFyYW0gZG9Ob3RDb21wdXRlSWZSb290IElmIHRydWUsIHdlIGRvbid0IGNvbXB1dGUgc2libGluZ0luZm8gaWYgdGhlIHJvb3QgYW5kIHRoZSByaWdodG1vc3QgY29udGV4dHMgYXJlIHRoZSBzYW1lXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIHNpYmxpbmdJbmZvcm1hdGlvbiBvYmplY3Rcblx0ICovXG5cdGFzeW5jIF9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRcdHJvb3RDdXJyZW50Q29udGV4dDogQ29udGV4dCxcblx0XHRyaWdodG1vc3RDdXJyZW50Q29udGV4dDogQ29udGV4dCB8IG51bGwgfCB1bmRlZmluZWQsXG5cdFx0c1Byb2dyYW1taW5nTW9kZWw6IHN0cmluZyxcblx0XHRkb05vdENvbXB1dGVJZlJvb3Q6IGJvb2xlYW5cblx0KTogUHJvbWlzZTxTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ+IHtcblx0XHRyaWdodG1vc3RDdXJyZW50Q29udGV4dCA9IHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0ID8/IHJvb3RDdXJyZW50Q29udGV4dDtcblx0XHRpZiAoIXJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpKSB7XG5cdFx0XHQvLyBXcm9uZyB1c2FnZSAhIVxuXHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IGNvbXB1dGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dFwiKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjb21wdXRlIHJpZ2h0bW9zdCBzaWJsaW5nIGNvbnRleHRcIik7XG5cdFx0fVxuXHRcdGlmIChkb05vdENvbXB1dGVJZlJvb3QgJiYgcmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpID09PSByb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbW9kZWwgPSByb290Q3VycmVudENvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdHJldHVybiBkcmFmdC5jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKHJvb3RDdXJyZW50Q29udGV4dCwgcmlnaHRtb3N0Q3VycmVudENvbnRleHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJZiBub3QgaW4gZHJhZnQgbW9kZSwgd2UganVzdCByZWNyZWF0ZSBhIGNvbnRleHQgZnJvbSB0aGUgcGF0aCBvZiB0aGUgcmlnaHRtb3N0IGNvbnRleHRcblx0XHRcdC8vIE5vIHBhdGggbWFwcGluZyBpcyBuZWVkZWRcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRhcmdldENvbnRleHQ6IG1vZGVsLmJpbmRDb250ZXh0KHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSkuZ2V0Qm91bmRDb250ZXh0KCksXG5cdFx0XHRcdHBhdGhNYXBwaW5nOiBbXVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRfaXNGY2xFbmFibGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbXBvbmVudCgpLl9pc0ZjbEVuYWJsZWQoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBFZGl0Rmxvdztc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