/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/operations", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../helpers/MetaModelFunction", "../../helpers/ToES6Promise"], function (Log, CommonUtils, BusyLocker, draft, operations, sticky, messageHandling, deleteHelper, FPMHelper, ModelHelper, ResourceModelHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, MessageToast, Popover, Text, VBox, Core, Fragment, coreLibrary, XMLPreprocessor, XMLTemplateProcessor, JSONModel, MetaModelFunction, toES6Promise) {
  "use strict";

  var getRequiredPropertiesFromInsertRestrictions = MetaModelFunction.getRequiredPropertiesFromInsertRestrictions;
  var getNonComputedVisibleFields = MetaModelFunction.getNonComputedVisibleFields;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  const CreationMode = FELibrary.CreationMode;
  const ProgrammingModel = FELibrary.ProgrammingModel;
  const ValueState = coreLibrary.ValueState;
  /* Make sure that the mParameters is not the oEvent */
  function getParameters(mParameters) {
    if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
      mParameters = {};
    }
    return mParameters || {};
  }
  let TransactionHelper = /*#__PURE__*/function () {
    function TransactionHelper() {}
    var _proto = TransactionHelper.prototype;
    _proto.busyLock = function busyLock(appComponent, busyPath) {
      BusyLocker.lock(appComponent.getModel("ui"), busyPath);
    };
    _proto.busyUnlock = function busyUnlock(appComponent, busyPath) {
      BusyLocker.unlock(appComponent.getModel("ui"), busyPath);
    };
    _proto.getProgrammingModel = function getProgrammingModel(source) {
      let path;
      if (source.isA("sap.ui.model.odata.v4.Context")) {
        path = source.getPath();
      } else {
        path = (source.isRelative() ? source.getResolvedPath() : source.getPath()) ?? "";
      }
      const metaModel = source.getModel().getMetaModel();
      if (ModelHelper.isDraftSupported(metaModel, path)) {
        return ProgrammingModel.Draft;
      } else if (ModelHelper.isStickySessionSupported(metaModel)) {
        return ProgrammingModel.Sticky;
      } else {
        return ProgrammingModel.NonDraft;
      }
    }

    /**
     * Validates a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be validated
     * @param [mParameters] Can contain the following attributes:
     * @param [mParameters.data] A map of data that should be validated
     * @param [mParameters.customValidationFunction] A string representing the path to the validation function
     * @param oView Contains the object of the current view
     * @returns Promise resolves with result of the custom validation function
     * @ui5-restricted
     * @final
     */;
    _proto.validateDocument = function validateDocument(oContext, mParameters, oView) {
      const sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
      if (sCustomValidationFunction) {
        const sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
          sFunctionName = sCustomValidationFunction.substring(sCustomValidationFunction.lastIndexOf(".") + 1, sCustomValidationFunction.length),
          mData = mParameters.data;
        delete mData["@$ui5.context.isTransient"];
        return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
      }
      return Promise.resolve([]);
    }

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oMainListBinding OData V4 ListBinding object
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param [mInParameters.data] A map of data that should be sent within the POST
     * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
     * @param [mInParameters.busyId] ID of the local busy indicator
     * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
     * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
     * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
     * @param appComponent The app component
     * @param messageHandler The message handler extension
     * @param fromCopyPaste True if the creation has been triggered by a paste action
     * @returns Promise resolves with new binding context
     * @ui5-restricted
     * @final
     */;
    _proto.createDocument = async function createDocument(oMainListBinding, mInParameters, appComponent, messageHandler, fromCopyPaste) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const oModel = oMainListBinding.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
        sCreateHash = appComponent.getRouterProxy().getHash(),
        oComponentData = appComponent.getComponentData(),
        oStartupParameters = oComponentData && oComponentData.startupParameters || {},
        sNewAction = !oMainListBinding.isRelative() ? this._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) : undefined;
      const mBindingParameters = {
        $$patchWithoutSideEffects: true
      };
      const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      let sBusyPath = "/busy";
      let sFunctionName = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) || oMetaModel.getObject(`${ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath))}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
      let bFunctionOnNavProp;
      let oNewDocumentContext;
      if (sFunctionName) {
        if (oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) && ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath) {
          bFunctionOnNavProp = true;
        } else {
          bFunctionOnNavProp = false;
        }
      }
      if (sMessagesPath) {
        mBindingParameters["$select"] = sMessagesPath;
      }
      const mParameters = getParameters(mInParameters);
      if (!oMainListBinding) {
        throw new Error("Binding required for new document creation");
      }
      const sProgrammingModel = this.getProgrammingModel(oMainListBinding);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Create document only allowed for draft or sticky session supported services");
      }
      if (mParameters.busyMode === "Local") {
        sBusyPath = `/busyLocal/${mParameters.busyId}`;
      }
      mParameters.beforeCreateCallBack = fromCopyPaste ? null : mParameters.beforeCreateCallBack;
      this.busyLock(appComponent, sBusyPath);
      const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let oResult;
      try {
        if (sNewAction) {
          oResult = await this.callAction(sNewAction, {
            contexts: oMainListBinding.getHeaderContext(),
            showActionParameterDialog: true,
            label: this._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
            bindingParameters: mBindingParameters,
            parentControl: mParameters.parentControl,
            bIsCreateAction: true,
            skipParameterDialog: mParameters.skipParameterDialog
          }, null, appComponent, messageHandler);
        } else {
          const bIsNewPageCreation = mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
          const aNonComputedVisibleKeyFields = bIsNewPageCreation ? getNonComputedVisibleFields(oMetaModel, sMetaPath, appComponent) : [];
          sFunctionName = fromCopyPaste ? null : sFunctionName;
          let sFunctionPath, oFunctionContext;
          if (sFunctionName) {
            //bound to the source entity:
            if (bFunctionOnNavProp) {
              sFunctionPath = oMainListBinding.getContext() && `${oMetaModel.getMetaPath(oMainListBinding.getContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getContext();
            } else {
              sFunctionPath = oMainListBinding.getHeaderContext() && `${oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getHeaderContext();
            }
          }
          const oFunction = sFunctionPath && oMetaModel.createBindingContext(sFunctionPath);
          try {
            let oData;
            try {
              const oContext = oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound ? await operations.callBoundFunction(sFunctionName, oFunctionContext, oModel) : await operations.callFunctionImport(sFunctionName, oModel);
              if (oContext) {
                oData = oContext.getObject();
              }
            } catch (oError) {
              Log.error(`Error while executing the function ${sFunctionName}`, oError);
              throw oError;
            }
            mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
            if (mParameters.data) {
              delete mParameters.data["@odata.context"];
            }
            if (aNonComputedVisibleKeyFields.length > 0) {
              oResult = await this._launchDialogWithKeyFields(oMainListBinding, aNonComputedVisibleKeyFields, oModel, mParameters, appComponent, messageHandler);
              oNewDocumentContext = oResult.newContext;
            } else {
              if (mParameters.beforeCreateCallBack) {
                await toES6Promise(mParameters.beforeCreateCallBack({
                  contextPath: oMainListBinding && oMainListBinding.getPath()
                }));
              }
              oNewDocumentContext = oMainListBinding.create(mParameters.data, true, mParameters.createAtEnd, mParameters.inactive);
              if (!mParameters.inactive) {
                oResult = await this.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters);
              }
            }
          } catch (oError) {
            Log.error("Error while creating the new document", oError);
            throw oError;
          }
        }
        oNewDocumentContext = oNewDocumentContext || oResult;
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        return oNewDocumentContext;
      } catch (error) {
        var _oNewDocumentContext;
        // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        if ((error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) && (_oNewDocumentContext = oNewDocumentContext) !== null && _oNewDocumentContext !== void 0 && _oNewDocumentContext.isTransient()) {
          // This is a workaround suggested by model as Context.delete results in an error
          // TODO: remove the $direct once model resolves this issue
          // this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
          oNewDocumentContext.delete("$direct");
        }
        throw error;
      } finally {
        this.busyUnlock(appComponent, sBusyPath);
      }
    };
    _proto._isDraftEnabled = function _isDraftEnabled(vContexts) {
      const contextForDraftModel = vContexts[0];
      const sProgrammingModel = this.getProgrammingModel(contextForDraftModel);
      return sProgrammingModel === ProgrammingModel.Draft;
    }

    /**
     * Delete one or multiple document(s).
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param contexts Contexts Either one context or an array with contexts to be deleted
     * @param mParameters Optional, can contain the following attributes:
     * @param mParameters.title Title of the object to be deleted
     * @param mParameters.description Description of the object to be deleted
     * @param mParameters.numberOfSelectedContexts Number of objects selected
     * @param mParameters.noDialog To disable the confirmation dialog
     * @param appComponent The appComponent
     * @param resourceModel The resource model to load text resources
     * @param messageHandler The message handler extension
     * @returns A Promise resolved once the documents are deleted
     */;
    _proto.deleteDocument = function deleteDocument(contexts, mParameters, appComponent, resourceModel, messageHandler) {
      const resourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let aParams;
      this.busyLock(appComponent);
      const contextsToDelete = Array.isArray(contexts) ? [...contexts] : [contexts];
      return new Promise((resolve, reject) => {
        try {
          const draftEnabled = this._isDraftEnabled(mParameters.selectedContexts || contextsToDelete);
          const items = [];
          const options = [];
          if (mParameters) {
            if (!mParameters.numberOfSelectedContexts) {
              // non-Table
              if (draftEnabled) {
                // Check if 1 of the drafts is locked by another user
                const lockedContext = contextsToDelete.find(context => {
                  const contextData = context.getObject();
                  return contextData.IsActiveEntity === true && contextData.HasDraftEntity === true && contextData.DraftAdministrativeData && contextData.DraftAdministrativeData.InProcessByUser && !contextData.DraftAdministrativeData.DraftIsCreatedByMe;
                });
                if (lockedContext) {
                  // Show message box with the name of the locking user and return
                  const lockingUserName = lockedContext.getObject().DraftAdministrativeData.InProcessByUser;
                  MessageBox.show(resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [lockingUserName]), {
                    title: resourceModel.getText("C_COMMON_DELETE"),
                    onClose: reject
                  });
                  return;
                }
              }
              mParameters = getParameters(mParameters);
              let nonTableTxt = "";
              if (mParameters.title) {
                if (mParameters.description) {
                  aParams = [mParameters.title + " ", mParameters.description];
                } else {
                  aParams = [mParameters.title, ""];
                }
                nonTableTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", aParams, mParameters.entitySetName);
              } else {
                nonTableTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, mParameters.entitySetName);
              }
              options.push({
                type: "deletableContexts",
                contexts: contextsToDelete,
                text: nonTableTxt,
                selected: true,
                control: "text"
              });
            } else {
              // Table
              let totalDeletable = contextsToDelete.length;
              if (draftEnabled) {
                totalDeletable += mParameters.draftsWithNonDeletableActive.length + mParameters.draftsWithDeletableActive.length + mParameters.unSavedContexts.length + mParameters.createModeContexts.length;
                deleteHelper.updateDraftOptionsForDeletableTexts(mParameters, contextsToDelete, totalDeletable, resourceModel, items, options);
              } else {
                const nonDeletableText = deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
                if (nonDeletableText) {
                  items.push(nonDeletableText);
                }
              }
              deleteHelper.updateOptionsForDeletableTexts(mParameters, contextsToDelete, resourceModel, options);
            }
          }

          // Content of Delete Dialog
          deleteHelper.updateContentForDeleteDialog(options, items);
          const vBox = new VBox({
            items: items
          });
          const sTitle = resourceBundleCore.getText("C_COMMON_DELETE");
          const fnConfirm = async () => {
            this.busyLock(appComponent);
            try {
              await deleteHelper.deleteConfirmHandler(options, mParameters, messageHandler, resourceModel, appComponent, draftEnabled);
              resolve();
            } catch (oError) {
              reject();
            } finally {
              this.busyUnlock(appComponent);
            }
          };
          let dialogConfirmed = false;
          const oDialog = new Dialog({
            title: sTitle,
            state: "Warning",
            content: [vBox],
            ariaLabelledBy: items,
            beginButton: new Button({
              text: resourceBundleCore.getText("C_COMMON_DELETE"),
              type: "Emphasized",
              press: function () {
                messageHandling.removeBoundTransitionMessages();
                dialogConfirmed = true;
                oDialog.close();
                fnConfirm();
              }
            }),
            endButton: new Button({
              text: resourceModel.getText("C_COMMON_DIALOG_CANCEL"),
              press: function () {
                oDialog.close();
              }
            }),
            afterClose: function () {
              oDialog.destroy();
              // if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
              if (!dialogConfirmed) {
                reject();
              }
            }
          });
          if (mParameters.noDialog) {
            fnConfirm();
          } else {
            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open();
          }
        } finally {
          this.busyUnlock(appComponent);
        }
      });
    }

    /**
     * Edits a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the active document
     * @param oView Current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with the new draft context in case of draft programming model
     * @ui5-restricted
     * @final
     */;
    _proto.editDocument = async function editDocument(oContext, oView, appComponent, messageHandler) {
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (!oContext) {
        throw new Error("Binding context to active document is required");
      }
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Edit is only allowed for draft or sticky session supported services");
      }
      this.busyLock(appComponent);
      // before triggering the edit action we'll have to remove all bound transition messages
      messageHandler.removeTransitionMessages();
      try {
        const oNewContext = sProgrammingModel === ProgrammingModel.Draft ? await draft.createDraftFromActiveDocument(oContext, appComponent, {
          bPreserveChanges: true,
          oView: oView
        }) : await sticky.editDocumentInStickySession(oContext, appComponent);
        await messageHandler.showMessageDialog();
        return oNewContext;
      } catch (err) {
        await messageHandler.showMessages({
          concurrentEditFlag: true
        });
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Cancel 'edit' mode of a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be canceled or deleted
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
     * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
     * @param appComponent The appComponent
     * @param resourceModel The model to load text resources
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @param isObjectModified True if the object has been modified by the user
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mInParameters, appComponent, resourceModel, messageHandler, isNewObject, isObjectModified) {
      //context must always be passed - mandatory parameter
      if (!oContext) {
        throw new Error("No context exists. Pass a meaningful context");
      }
      this.busyLock(appComponent);
      const mParameters = getParameters(mInParameters);
      const oModel = oContext.getModel();
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Cancel document only allowed for draft or sticky session supported services");
      }
      try {
        let returnedValue = false;
        if (sProgrammingModel === ProgrammingModel.Draft && !isObjectModified) {
          const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
          const draftAdminData = await draftDataContext.requestObject();
          if (draftAdminData) {
            isObjectModified = draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime;
          }
        }
        if (!mParameters.skipDiscardPopover) {
          await this._confirmDiscard(mParameters.cancelButton, isObjectModified, resourceModel);
        }
        if (oContext.isKeepAlive()) {
          oContext.setKeepAlive(false);
        }
        if (mParameters.beforeCancelCallBack) {
          await mParameters.beforeCancelCallBack({
            context: oContext
          });
        }
        if (sProgrammingModel === ProgrammingModel.Draft) {
          if (isNewObject) {
            if (oContext.hasPendingChanges()) {
              oContext.getBinding().resetChanges();
            }
            returnedValue = await draft.deleteDraft(oContext, appComponent);
          } else {
            const oSiblingContext = oModel.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
            try {
              const sCanonicalPath = await oSiblingContext.requestCanonicalPath();
              if (oContext.hasPendingChanges()) {
                oContext.getBinding().resetChanges();
              }
              returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
            } finally {
              await draft.deleteDraft(oContext, appComponent);
            }
          }
        } else {
          const discardedContext = await sticky.discardDocument(oContext);
          if (discardedContext) {
            if (discardedContext.hasPendingChanges()) {
              discardedContext.getBinding().resetChanges();
            }
            if (!isNewObject) {
              discardedContext.refresh();
              returnedValue = discardedContext;
            }
          }
        }

        // remove existing bound transition messages
        messageHandler.removeTransitionMessages();
        // show unbound messages
        await messageHandler.showMessages();
        return returnedValue;
      } catch (err) {
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Saves the document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param context Context of the document to be saved
     * @param appComponent The appComponent
     * @param resourceModel The model to load text resources
     * @param executeSideEffectsOnError True if we should execute side effects in case of an error
     * @param bindingsForSideEffects The listBindings to be used for executing side effects on error
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.saveDocument = async function saveDocument(context, appComponent, resourceModel, executeSideEffectsOnError, bindingsForSideEffects, messageHandler, isNewObject) {
      const sProgrammingModel = this.getProgrammingModel(context);
      if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
        throw new Error("Save is only allowed for draft or sticky session supported services");
      }
      // in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
      // is sent to the backend
      messageHandler.removeTransitionMessages();
      try {
        this.busyLock(appComponent);
        const oActiveDocument = sProgrammingModel === ProgrammingModel.Draft ? await draft.activateDocument(context, appComponent, {}, messageHandler) : await sticky.activateDocument(context, appComponent);
        const messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
        if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
          // show our object creation toast only if it is not coming from backend
          MessageToast.show(isNewObject ? resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_CREATED") : resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_SAVED"));
        }
        return oActiveDocument;
      } catch (err) {
        if (executeSideEffectsOnError && (bindingsForSideEffects === null || bindingsForSideEffects === void 0 ? void 0 : bindingsForSideEffects.length) > 0) {
          /* The sideEffects are executed only for table items in transient state */
          bindingsForSideEffects.forEach(listBinding => {
            if (!CommonUtils.hasTransientContext(listBinding)) {
              appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), context);
            }
          });
        }
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Calls a bound or unbound action.
     *
     * @function
     * @static
     * @name sap.fe.core.TransactionHelper.callAction
     * @memberof sap.fe.core.TransactionHelper
     * @param sActionName The name of the action to be called
     * @param [mParameters] Contains the following attributes:
     * @param [mParameters.parameterValues] A map of action parameter names and provided values
     * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
     * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
     * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
     * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param [mParameters.label] A human-readable label for the action
     * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
     * @param oView Contains the object of the current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with an array of response objects (TODO: to be changed)
     * @ui5-restricted
     * @final
     */;
    _proto.callAction = async function callAction(sActionName, mParameters, oView, appComponent, messageHandler) {
      mParameters = getParameters(mParameters);
      let contextToProcess, oModel;
      const mBindingParameters = mParameters.bindingParameters;
      if (!sActionName) {
        throw new Error("Provide name of action to be executed");
      }
      // action imports are not directly obtained from the metaModel by it is present inside the entityContainer
      // and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
      // split() on its name was required
      const sName = sActionName.split("/")[1];
      sActionName = sName || sActionName;
      contextToProcess = sName ? undefined : mParameters.contexts;
      //checking whether the context is an array with more than 0 length or not an array(create action)
      if (contextToProcess && (Array.isArray(contextToProcess) && contextToProcess.length || !Array.isArray(contextToProcess))) {
        contextToProcess = Array.isArray(contextToProcess) ? contextToProcess[0] : contextToProcess;
        oModel = contextToProcess.getModel();
      }
      if (mParameters.model) {
        oModel = mParameters.model;
      }
      if (!oModel) {
        throw new Error("Pass a context for a bound action or pass the model for an unbound action");
      }
      // get the binding parameters $select and $expand for the side effect on this action
      // also gather additional property paths to be requested such as text associations
      const mSideEffectsParameters = appComponent.getSideEffectsService().getODataActionSideEffects(sActionName, contextToProcess) || {};
      try {
        let oResult;
        if (contextToProcess && oModel) {
          oResult = await operations.callBoundAction(sActionName, mParameters.contexts, oModel, appComponent, {
            parameterValues: mParameters.parameterValues,
            invocationGrouping: mParameters.invocationGrouping,
            label: mParameters.label,
            skipParameterDialog: mParameters.skipParameterDialog,
            mBindingParameters: mBindingParameters,
            entitySetName: mParameters.entitySetName,
            additionalSideEffect: mSideEffectsParameters,
            onSubmitted: () => {
              messageHandler.removeTransitionMessages();
              this.busyLock(appComponent);
            },
            onResponse: () => {
              this.busyUnlock(appComponent);
            },
            parentControl: mParameters.parentControl,
            controlId: mParameters.controlId,
            internalModelContext: mParameters.internalModelContext,
            operationAvailableMap: mParameters.operationAvailableMap,
            bIsCreateAction: mParameters.bIsCreateAction,
            bGetBoundContext: mParameters.bGetBoundContext,
            bObjectPage: mParameters.bObjectPage,
            messageHandler: messageHandler,
            defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
            selectedItems: mParameters.contexts
          });
        } else {
          oResult = await operations.callActionImport(sActionName, oModel, appComponent, {
            parameterValues: mParameters.parameterValues,
            label: mParameters.label,
            skipParameterDialog: mParameters.skipParameterDialog,
            bindingParameters: mBindingParameters,
            entitySetName: mParameters.entitySetName,
            onSubmitted: () => {
              this.busyLock(appComponent);
            },
            onResponse: () => {
              this.busyUnlock(appComponent);
            },
            parentControl: mParameters.parentControl,
            internalModelContext: mParameters.internalModelContext,
            operationAvailableMap: mParameters.operationAvailableMap,
            messageHandler: messageHandler,
            bObjectPage: mParameters.bObjectPage
          });
        }
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        return oResult;
      } catch (err) {
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        throw err;
      }
    }

    /**
     * Handles messages for action call.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#_handleActionResponse
     * @memberof sap.fe.core.TransactionHelper
     * @param messageHandler The message handler extension
     * @param mParameters Parameters to be considered for the action.
     * @param sActionName The name of the action to be called
     * @returns Promise after message dialog is opened if required.
     * @ui5-restricted
     * @final
     */;
    _proto._handleActionResponse = function _handleActionResponse(messageHandler, mParameters, sActionName) {
      const aTransientMessages = messageHandling.getMessages(true, true);
      const actionName = mParameters.label ? mParameters.label : sActionName;
      if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
        mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
      }
      let control;
      if (mParameters.controlId) {
        control = mParameters.parentControl.byId(mParameters.controlId);
      } else {
        control = mParameters.parentControl;
      }
      return messageHandler.showMessages({
        sActionName: actionName,
        control: control
      });
    }

    /**
     * Handles validation errors for the 'Discard' action.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#handleValidationError
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @ui5-restricted
     * @final
     */;
    _proto.handleValidationError = function handleValidationError() {
      const oMessageManager = Core.getMessageManager(),
        errorToRemove = oMessageManager.getMessageModel().getData().filter(function (error) {
          // only needs to handle validation messages, technical and persistent errors needs not to be checked here.
          if (error.validation) {
            return error;
          }
        });
      oMessageManager.removeMessages(errorToRemove);
    }

    /**
     * Creates a new Popover. Factory method to make unit tests easier.
     *
     * @param settings Initial parameters for the popover
     * @returns A new Popover
     */;
    _proto._createPopover = function _createPopover(settings) {
      return new Popover(settings);
    }

    /**
     * Shows a popover to confirm discard if needed.
     *
     * @static
     * @name sap.fe.core.TransactionHelper._showDiscardPopover
     * @memberof sap.fe.core.TransactionHelper
     * @param cancelButton The control which will open the popover
     * @param isModified True if the object has been modified and a confirmation popover must be shown
     * @param resourceModel The model to load text resources
     * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
     * @ui5-restricted
     * @final
     */;
    _proto._confirmDiscard = function _confirmDiscard(cancelButton, isModified, resourceModel) {
      // If the data isn't modified, do not show any confirmation popover
      if (!isModified) {
        this.handleValidationError();
        return Promise.resolve();
      }
      cancelButton.setEnabled(false);
      return new Promise((resolve, reject) => {
        const confirmationPopover = this._createPopover({
          showHeader: false,
          placement: "Top"
        });
        confirmationPopover.addStyleClass("sapUiContentPadding");

        // Create the content of the popover
        const title = new Text({
          text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE")
        });
        const confirmButton = new Button({
          text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),
          width: "100%",
          press: () => {
            this.handleValidationError();
            confirmationPopover.data("continueDiscard", true);
            confirmationPopover.close();
          },
          ariaLabelledBy: [title]
        });
        confirmationPopover.addContent(new VBox({
          items: [title, confirmButton]
        }));

        // Attach handler
        confirmationPopover.attachBeforeOpen(() => {
          confirmationPopover.setInitialFocus(confirmButton);
        });
        confirmationPopover.attachAfterClose(() => {
          cancelButton.setEnabled(true);
          if (confirmationPopover.data("continueDiscard")) {
            resolve();
          } else {
            reject();
          }
        });
        confirmationPopover.openBy(cancelButton, false);
      });
    };
    _proto._onFieldChange = function _onFieldChange(oEvent, oCreateButton, messageHandler, fnValidateRequiredProperties) {
      messageHandler.removeTransitionMessages();
      const oField = oEvent.getSource();
      const oFieldPromise = oEvent.getParameter("promise");
      if (oFieldPromise) {
        return oFieldPromise.then(function (value) {
          // Setting value of field as '' in case of value help and validating other fields
          oField.setValue(value);
          fnValidateRequiredProperties();
          return oField.getValue();
        }).catch(function (value) {
          if (value !== "") {
            //disabling the continue button in case of invalid value in field
            oCreateButton.setEnabled(false);
          } else {
            // validating all the fields in case of empty value in field
            oField.setValue(value);
            fnValidateRequiredProperties();
          }
        });
      }
    };
    _proto._launchDialogWithKeyFields = function _launchDialogWithKeyFields(oListBinding, mFields, oModel, mParameters, appComponent, messageHandler) {
      let oDialog;
      const oParentControl = mParameters.parentControl;

      // Crate a fake (transient) listBinding and context, just for the binding context of the dialog
      const oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
        $$updateGroupId: "submitLater"
      });
      oTransientListBinding.refreshInternal = function () {
        /* */
      };
      const oTransientContext = oTransientListBinding.create(mParameters.data, true);
      return new Promise(async (resolve, reject) => {
        const sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
        const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
          resourceModel = getResourceModel(oParentControl),
          oMetaModel = oModel.getMetaModel(),
          aImmutableFields = [],
          sPath = oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath(),
          oEntitySetContext = oMetaModel.createBindingContext(sPath),
          sMetaPath = oMetaModel.getMetaPath(sPath);
        for (const i in mFields) {
          aImmutableFields.push(oMetaModel.createBindingContext(`${sMetaPath}/${mFields[i]}`));
        }
        const oImmutableCtxModel = new JSONModel(aImmutableFields);
        const oImmutableCtx = oImmutableCtxModel.createBindingContext("/");
        const aRequiredProperties = getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
        const oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
        const oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/");
        const oNewFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            entitySet: oEntitySetContext,
            fields: oImmutableCtx,
            requiredProperties: oRequiredPropertyPathsCtx
          },
          models: {
            entitySet: oEntitySetContext.getModel(),
            fields: oImmutableCtx.getModel(),
            metaModel: oMetaModel,
            requiredProperties: oRequiredPropertyPathsCtxModel
          }
        });
        let aFormElements = [];
        const mFieldValueMap = {};
        // eslint-disable-next-line prefer-const
        let oCreateButton;
        const validateRequiredProperties = async function () {
          let bEnabled = false;
          try {
            const aResults = await Promise.all(aFormElements.map(function (oFormElement) {
              return oFormElement.getFields()[0];
            }).filter(function (oField) {
              // The continue button should remain disabled in case of empty required fields.
              return oField.getRequired() || oField.getValueState() === ValueState.Error;
            }).map(async function (oField) {
              const sFieldId = oField.getId();
              if (sFieldId in mFieldValueMap) {
                try {
                  const vValue = await mFieldValueMap[sFieldId];
                  return oField.getValue() === "" ? undefined : vValue;
                } catch (err) {
                  return undefined;
                }
              }
              return oField.getValue() === "" ? undefined : oField.getValue();
            }));
            bEnabled = aResults.every(function (vValue) {
              if (Array.isArray(vValue)) {
                vValue = vValue[0];
              }
              return vValue !== undefined && vValue !== null && vValue !== "";
            });
          } catch (err) {
            bEnabled = false;
          }
          oCreateButton.setEnabled(bEnabled);
        };
        const oController = {
          /*
          					fired on focus out from field or on selecting a value from the valuehelp.
          					the create button is enabled when a value is added.
          					liveChange is not fired when value is added from valuehelp.
          					value validation is not done for create button enablement.
          				*/
          handleChange: oEvent => {
            const sFieldId = oEvent.getParameter("id");
            mFieldValueMap[sFieldId] = this._onFieldChange(oEvent, oCreateButton, messageHandler, validateRequiredProperties);
          },
          /*
          					fired on key press. the create button is enabled when a value is added.
          					liveChange is not fired when value is added from valuehelp.
          					value validation is not done for create button enablement.
          				*/
          handleLiveChange: oEvent => {
            const sFieldId = oEvent.getParameter("id");
            const vValue = oEvent.getParameter("value");
            mFieldValueMap[sFieldId] = vValue;
            validateRequiredProperties();
          }
        };
        const oDialogContent = await Fragment.load({
          definition: oNewFragment,
          controller: oController
        });
        let oResult;
        const closeDialog = function () {
          //rejected/resolved the promis returned by _launchDialogWithKeyFields
          //as soon as the dialog is closed. Without waiting for the dialog's
          //animation to finish
          if (oResult.error) {
            reject(oResult.error);
          } else {
            resolve(oResult.response);
          }
          oDialog.close();
        };
        oDialog = new Dialog(generate(["CreateDialog", sMetaPath]), {
          title: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"),
          content: [oDialogContent],
          beginButton: {
            text: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON"),
            type: "Emphasized",
            press: async oEvent => {
              const createButton = oEvent.getSource();
              createButton.setEnabled(false);
              BusyLocker.lock(oDialog);
              mParameters.bIsCreateDialog = true;
              try {
                const aValues = await Promise.all(Object.keys(mFieldValueMap).map(async function (sKey) {
                  const oValue = await mFieldValueMap[sKey];
                  const oDialogValue = {};
                  oDialogValue[sKey] = oValue;
                  return oDialogValue;
                }));
                if (mParameters.beforeCreateCallBack) {
                  await toES6Promise(mParameters.beforeCreateCallBack({
                    contextPath: oListBinding && oListBinding.getPath(),
                    createParameters: aValues
                  }));
                }
                const transientData = oTransientContext.getObject();
                const createData = {};
                Object.keys(transientData).forEach(function (sPropertyPath) {
                  const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
                  // ensure navigation properties are not part of the payload, deep create not supported
                  if (oProperty && oProperty.$kind === "NavigationProperty") {
                    return;
                  }
                  createData[sPropertyPath] = transientData[sPropertyPath];
                });
                const oNewDocumentContext = oListBinding.create(createData, true, mParameters.createAtEnd, mParameters.inactive);
                const oPromise = this.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
                let oResponse = await oPromise;
                if (!oResponse || oResponse && oResponse.bKeepDialogOpen !== true) {
                  oResponse = oResponse ?? {};
                  oDialog.setBindingContext(null);
                  oResponse.newContext = oNewDocumentContext;
                  oResult = {
                    response: oResponse
                  };
                  closeDialog();
                }
              } catch (oError) {
                // in case of creation failed, dialog should stay open - to achieve the same, nothing has to be done (like in case of success with bKeepDialogOpen)
                if (oError !== FELibrary.Constants.CreationFailed) {
                  // other errors are not expected
                  oResult = {
                    error: oError
                  };
                  closeDialog();
                } else {
                  createButton.setEnabled(true);
                }
              } finally {
                BusyLocker.unlock(oDialog);
                messageHandler.showMessages();
              }
            }
          },
          endButton: {
            text: resourceModel.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL"),
            press: function () {
              oResult = {
                error: FELibrary.Constants.CancelActionDialog
              };
              closeDialog();
            }
          },
          afterClose: function () {
            var _oDialog$getBindingCo;
            // show footer as per UX guidelines when dialog is not open
            (_oDialog$getBindingCo = oDialog.getBindingContext("internal")) === null || _oDialog$getBindingCo === void 0 ? void 0 : _oDialog$getBindingCo.setProperty("isCreateDialogOpen", false);
            oDialog.destroy();
            oTransientListBinding.destroy();
          }
        });
        aFormElements = oDialogContent === null || oDialogContent === void 0 ? void 0 : oDialogContent.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
        if (oParentControl && oParentControl.addDependent) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        oCreateButton = oDialog.getBeginButton();
        oDialog.setBindingContext(oTransientContext);
        try {
          await CommonUtils.setUserDefaults(appComponent, aImmutableFields, oTransientContext, false, mParameters.createAction, mParameters.data);
          validateRequiredProperties();
          // footer must not be visible when the dialog is open as per UX guidelines
          oDialog.getBindingContext("internal").setProperty("isCreateDialogOpen", true);
          oDialog.open();
        } catch (oError) {
          await messageHandler.showMessages();
          throw oError;
        }
      });
    };
    _proto.onAfterCreateCompletion = function onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters) {
      let fnResolve;
      const oPromise = new Promise(resolve => {
        fnResolve = resolve;
      });
      const fnCreateCompleted = oEvent => {
        const oContext = oEvent.getParameter("context"),
          bSuccess = oEvent.getParameter("success");
        if (oContext === oNewDocumentContext) {
          oListBinding.detachCreateCompleted(fnCreateCompleted, this);
          fnResolve(bSuccess);
        }
      };
      const fnSafeContextCreated = () => {
        oNewDocumentContext.created().then(undefined, function () {
          Log.trace("transient creation context deleted");
        }).catch(function (contextError) {
          Log.trace("transient creation context deletion error", contextError);
        });
      };
      oListBinding.attachCreateCompleted(fnCreateCompleted, this);
      return oPromise.then(bSuccess => {
        if (!bSuccess) {
          if (!mParameters.keepTransientContextOnFailed) {
            // Cancel the pending POST and delete the context in the listBinding
            fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
            oListBinding.resetChanges();
            oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());
            throw FELibrary.Constants.CreationFailed;
          }
          return {
            bKeepDialogOpen: true
          };
        } else {
          return oNewDocumentContext.created();
        }
      });
    }

    /**
     * Retrieves the name of the NewAction to be executed.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getNewAction
     * @memberof sap.fe.core.TransactionHelper
     * @param oStartupParameters Startup parameters of the application
     * @param sCreateHash Hash to be checked for action type
     * @param oMetaModel The MetaModel used to check for NewAction parameter
     * @param sMetaPath The MetaPath
     * @returns The name of the action
     * @ui5-restricted
     * @final
     */;
    _proto._getNewAction = function _getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) {
      let sNewAction;
      if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else {
        sNewAction = oMetaModel && oMetaModel.getObject !== undefined ? oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`) || oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : undefined;
      }
      return sNewAction;
    }

    /**
     * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
     *
     * The following priority is applied:
     * 1. label of line-item annotation.
     * 2. label annotated in the action.
     * 3. "Create" as a constant from i18n.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
     * @memberof sap.fe.core.TransactionHelper
     * @param oMetaModel The MetaModel used to check for the NewAction parameter
     * @param sMetaPath The MetaPath
     * @param sNewAction Contains the name of the action to be executed
     * @param oResourceBundleCore ResourceBundle to access the default Create label
     * @returns The label for the Create Action Dialog
     * @ui5-restricted
     * @final
     */;
    _proto._getSpecificCreateActionDialogLabel = function _getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore) {
      const fnGetLabelFromLineItemAnnotation = function () {
        if (oMetaModel && oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)) {
          const iLineItemIndex = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`).findIndex(function (oLineItem) {
            const aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
            return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
          });
          return iLineItemIndex > -1 ? oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)[iLineItemIndex].Label : undefined;
        } else {
          return undefined;
        }
      };
      return fnGetLabelFromLineItemAnnotation() || oMetaModel && oMetaModel.getObject(`${sMetaPath}/${sNewAction}@com.sap.vocabularies.Common.v1.Label`) || oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE");
    };
    return TransactionHelper;
  }();
  const singleton = new TransactionHelper();
  return singleton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiVmFsdWVTdGF0ZSIsImNvcmVMaWJyYXJ5IiwiZ2V0UGFyYW1ldGVycyIsIm1QYXJhbWV0ZXJzIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiVHJhbnNhY3Rpb25IZWxwZXIiLCJidXN5TG9jayIsImFwcENvbXBvbmVudCIsImJ1c3lQYXRoIiwiQnVzeUxvY2tlciIsImxvY2siLCJnZXRNb2RlbCIsImJ1c3lVbmxvY2siLCJ1bmxvY2siLCJnZXRQcm9ncmFtbWluZ01vZGVsIiwic291cmNlIiwicGF0aCIsImlzQSIsImdldFBhdGgiLCJpc1JlbGF0aXZlIiwiZ2V0UmVzb2x2ZWRQYXRoIiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwiRHJhZnQiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJTdGlja3kiLCJOb25EcmFmdCIsInZhbGlkYXRlRG9jdW1lbnQiLCJvQ29udGV4dCIsIm9WaWV3Iiwic0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsInNNb2R1bGUiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsInJlcGxhY2UiLCJzRnVuY3Rpb25OYW1lIiwibGVuZ3RoIiwibURhdGEiLCJkYXRhIiwiRlBNSGVscGVyIiwidmFsaWRhdGlvbldyYXBwZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNyZWF0ZURvY3VtZW50Iiwib01haW5MaXN0QmluZGluZyIsIm1JblBhcmFtZXRlcnMiLCJtZXNzYWdlSGFuZGxlciIsImZyb21Db3B5UGFzdGUiLCJvTW9kZWwiLCJvTWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRIZWFkZXJDb250ZXh0Iiwic0NyZWF0ZUhhc2giLCJnZXRSb3V0ZXJQcm94eSIsImdldEhhc2giLCJvQ29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJvU3RhcnR1cFBhcmFtZXRlcnMiLCJzdGFydHVwUGFyYW1ldGVycyIsInNOZXdBY3Rpb24iLCJfZ2V0TmV3QWN0aW9uIiwidW5kZWZpbmVkIiwibUJpbmRpbmdQYXJhbWV0ZXJzIiwiJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyIsInNNZXNzYWdlc1BhdGgiLCJnZXRPYmplY3QiLCJzQnVzeVBhdGgiLCJnZXRUYXJnZXRFbnRpdHlTZXQiLCJnZXRDb250ZXh0IiwiYkZ1bmN0aW9uT25OYXZQcm9wIiwib05ld0RvY3VtZW50Q29udGV4dCIsIkVycm9yIiwic1Byb2dyYW1taW5nTW9kZWwiLCJidXN5TW9kZSIsImJ1c3lJZCIsImJlZm9yZUNyZWF0ZUNhbGxCYWNrIiwib1Jlc291cmNlQnVuZGxlQ29yZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJvUmVzdWx0IiwiY2FsbEFjdGlvbiIsImNvbnRleHRzIiwic2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZyIsImxhYmVsIiwiX2dldFNwZWNpZmljQ3JlYXRlQWN0aW9uRGlhbG9nTGFiZWwiLCJiaW5kaW5nUGFyYW1ldGVycyIsInBhcmVudENvbnRyb2wiLCJiSXNDcmVhdGVBY3Rpb24iLCJza2lwUGFyYW1ldGVyRGlhbG9nIiwiYklzTmV3UGFnZUNyZWF0aW9uIiwiY3JlYXRpb25Nb2RlIiwiQ3JlYXRpb25Sb3ciLCJJbmxpbmUiLCJhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzIiwiZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzIiwic0Z1bmN0aW9uUGF0aCIsIm9GdW5jdGlvbkNvbnRleHQiLCJvRnVuY3Rpb24iLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9EYXRhIiwiJElzQm91bmQiLCJvcGVyYXRpb25zIiwiY2FsbEJvdW5kRnVuY3Rpb24iLCJjYWxsRnVuY3Rpb25JbXBvcnQiLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIk9iamVjdCIsImFzc2lnbiIsIl9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzIiwibmV3Q29udGV4dCIsInRvRVM2UHJvbWlzZSIsImNvbnRleHRQYXRoIiwiY3JlYXRlIiwiY3JlYXRlQXRFbmQiLCJpbmFjdGl2ZSIsIm9uQWZ0ZXJDcmVhdGVDb21wbGV0aW9uIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJjb250cm9sIiwiQ29uc3RhbnRzIiwiQWN0aW9uRXhlY3V0aW9uRmFpbGVkIiwiQ2FuY2VsQWN0aW9uRGlhbG9nIiwiaXNUcmFuc2llbnQiLCJkZWxldGUiLCJfaXNEcmFmdEVuYWJsZWQiLCJ2Q29udGV4dHMiLCJjb250ZXh0Rm9yRHJhZnRNb2RlbCIsImRlbGV0ZURvY3VtZW50IiwicmVzb3VyY2VNb2RlbCIsInJlc291cmNlQnVuZGxlQ29yZSIsImFQYXJhbXMiLCJjb250ZXh0c1RvRGVsZXRlIiwiQXJyYXkiLCJpc0FycmF5IiwicmVqZWN0IiwiZHJhZnRFbmFibGVkIiwic2VsZWN0ZWRDb250ZXh0cyIsIml0ZW1zIiwib3B0aW9ucyIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsImxvY2tlZENvbnRleHQiLCJmaW5kIiwiY29udGV4dCIsImNvbnRleHREYXRhIiwiSXNBY3RpdmVFbnRpdHkiLCJIYXNEcmFmdEVudGl0eSIsIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIiwiSW5Qcm9jZXNzQnlVc2VyIiwiRHJhZnRJc0NyZWF0ZWRCeU1lIiwibG9ja2luZ1VzZXJOYW1lIiwiTWVzc2FnZUJveCIsInNob3ciLCJnZXRUZXh0IiwidGl0bGUiLCJvbkNsb3NlIiwibm9uVGFibGVUeHQiLCJkZXNjcmlwdGlvbiIsImVudGl0eVNldE5hbWUiLCJwdXNoIiwidHlwZSIsInRleHQiLCJzZWxlY3RlZCIsInRvdGFsRGVsZXRhYmxlIiwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSIsImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUiLCJ1blNhdmVkQ29udGV4dHMiLCJjcmVhdGVNb2RlQ29udGV4dHMiLCJkZWxldGVIZWxwZXIiLCJ1cGRhdGVEcmFmdE9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyIsIm5vbkRlbGV0YWJsZVRleHQiLCJnZXROb25EZWxldGFibGVUZXh0IiwidXBkYXRlT3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzIiwidXBkYXRlQ29udGVudEZvckRlbGV0ZURpYWxvZyIsInZCb3giLCJWQm94Iiwic1RpdGxlIiwiZm5Db25maXJtIiwiZGVsZXRlQ29uZmlybUhhbmRsZXIiLCJkaWFsb2dDb25maXJtZWQiLCJvRGlhbG9nIiwiRGlhbG9nIiwic3RhdGUiLCJjb250ZW50IiwiYXJpYUxhYmVsbGVkQnkiLCJiZWdpbkJ1dHRvbiIsIkJ1dHRvbiIsInByZXNzIiwibWVzc2FnZUhhbmRsaW5nIiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJjbG9zZSIsImVuZEJ1dHRvbiIsImFmdGVyQ2xvc2UiLCJkZXN0cm95Iiwibm9EaWFsb2ciLCJhZGRTdHlsZUNsYXNzIiwib3BlbiIsImVkaXREb2N1bWVudCIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsIm9OZXdDb250ZXh0IiwiZHJhZnQiLCJjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudCIsImJQcmVzZXJ2ZUNoYW5nZXMiLCJzdGlja3kiLCJlZGl0RG9jdW1lbnRJblN0aWNreVNlc3Npb24iLCJlcnIiLCJzaG93TWVzc2FnZXMiLCJjb25jdXJyZW50RWRpdEZsYWciLCJjYW5jZWxEb2N1bWVudCIsImlzTmV3T2JqZWN0IiwiaXNPYmplY3RNb2RpZmllZCIsInJldHVybmVkVmFsdWUiLCJkcmFmdERhdGFDb250ZXh0IiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJkcmFmdEFkbWluRGF0YSIsInJlcXVlc3RPYmplY3QiLCJDcmVhdGlvbkRhdGVUaW1lIiwiTGFzdENoYW5nZURhdGVUaW1lIiwic2tpcERpc2NhcmRQb3BvdmVyIiwiX2NvbmZpcm1EaXNjYXJkIiwiY2FuY2VsQnV0dG9uIiwiaXNLZWVwQWxpdmUiLCJzZXRLZWVwQWxpdmUiLCJiZWZvcmVDYW5jZWxDYWxsQmFjayIsImhhc1BlbmRpbmdDaGFuZ2VzIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsImRlbGV0ZURyYWZ0Iiwib1NpYmxpbmdDb250ZXh0Iiwic0Nhbm9uaWNhbFBhdGgiLCJyZXF1ZXN0Q2Fub25pY2FsUGF0aCIsImRpc2NhcmRlZENvbnRleHQiLCJkaXNjYXJkRG9jdW1lbnQiLCJyZWZyZXNoIiwic2F2ZURvY3VtZW50IiwiZXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciIsImJpbmRpbmdzRm9yU2lkZUVmZmVjdHMiLCJvQWN0aXZlRG9jdW1lbnQiLCJhY3RpdmF0ZURvY3VtZW50IiwibWVzc2FnZXNSZWNlaXZlZCIsImdldE1lc3NhZ2VzIiwiY29uY2F0IiwiTWVzc2FnZVR5cGUiLCJTdWNjZXNzIiwiTWVzc2FnZVRvYXN0IiwiZm9yRWFjaCIsImxpc3RCaW5kaW5nIiwiQ29tbW9uVXRpbHMiLCJoYXNUcmFuc2llbnRDb250ZXh0IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5Iiwic0FjdGlvbk5hbWUiLCJjb250ZXh0VG9Qcm9jZXNzIiwic05hbWUiLCJzcGxpdCIsIm1vZGVsIiwibVNpZGVFZmZlY3RzUGFyYW1ldGVycyIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJjYWxsQm91bmRBY3Rpb24iLCJwYXJhbWV0ZXJWYWx1ZXMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsIm9uU3VibWl0dGVkIiwib25SZXNwb25zZSIsImNvbnRyb2xJZCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYkdldEJvdW5kQ29udGV4dCIsImJPYmplY3RQYWdlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwic2VsZWN0ZWRJdGVtcyIsImNhbGxBY3Rpb25JbXBvcnQiLCJfaGFuZGxlQWN0aW9uUmVzcG9uc2UiLCJhVHJhbnNpZW50TWVzc2FnZXMiLCJhY3Rpb25OYW1lIiwic2V0UHJvcGVydHkiLCJieUlkIiwiaGFuZGxlVmFsaWRhdGlvbkVycm9yIiwib01lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJlcnJvclRvUmVtb3ZlIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImZpbHRlciIsInZhbGlkYXRpb24iLCJyZW1vdmVNZXNzYWdlcyIsIl9jcmVhdGVQb3BvdmVyIiwic2V0dGluZ3MiLCJQb3BvdmVyIiwiaXNNb2RpZmllZCIsInNldEVuYWJsZWQiLCJjb25maXJtYXRpb25Qb3BvdmVyIiwic2hvd0hlYWRlciIsInBsYWNlbWVudCIsIlRleHQiLCJjb25maXJtQnV0dG9uIiwid2lkdGgiLCJhZGRDb250ZW50IiwiYXR0YWNoQmVmb3JlT3BlbiIsInNldEluaXRpYWxGb2N1cyIsImF0dGFjaEFmdGVyQ2xvc2UiLCJvcGVuQnkiLCJfb25GaWVsZENoYW5nZSIsIm9FdmVudCIsIm9DcmVhdGVCdXR0b24iLCJmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzIiwib0ZpZWxkIiwiZ2V0U291cmNlIiwib0ZpZWxkUHJvbWlzZSIsImdldFBhcmFtZXRlciIsInRoZW4iLCJ2YWx1ZSIsInNldFZhbHVlIiwiZ2V0VmFsdWUiLCJjYXRjaCIsIm9MaXN0QmluZGluZyIsIm1GaWVsZHMiLCJvUGFyZW50Q29udHJvbCIsIm9UcmFuc2llbnRMaXN0QmluZGluZyIsImJpbmRMaXN0IiwiJCR1cGRhdGVHcm91cElkIiwicmVmcmVzaEludGVybmFsIiwib1RyYW5zaWVudENvbnRleHQiLCJzRnJhZ21lbnROYW1lIiwib0ZyYWdtZW50IiwiWE1MVGVtcGxhdGVQcm9jZXNzb3IiLCJsb2FkVGVtcGxhdGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiYUltbXV0YWJsZUZpZWxkcyIsInNQYXRoIiwib0VudGl0eVNldENvbnRleHQiLCJpIiwib0ltbXV0YWJsZUN0eE1vZGVsIiwiSlNPTk1vZGVsIiwib0ltbXV0YWJsZUN0eCIsImFSZXF1aXJlZFByb3BlcnRpZXMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwib1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsIiwib1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eCIsIm9OZXdGcmFnbWVudCIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJuYW1lIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5U2V0IiwiZmllbGRzIiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwibW9kZWxzIiwiYUZvcm1FbGVtZW50cyIsIm1GaWVsZFZhbHVlTWFwIiwidmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMiLCJiRW5hYmxlZCIsImFSZXN1bHRzIiwiYWxsIiwibWFwIiwib0Zvcm1FbGVtZW50IiwiZ2V0RmllbGRzIiwiZ2V0UmVxdWlyZWQiLCJnZXRWYWx1ZVN0YXRlIiwic0ZpZWxkSWQiLCJnZXRJZCIsInZWYWx1ZSIsImV2ZXJ5Iiwib0NvbnRyb2xsZXIiLCJoYW5kbGVDaGFuZ2UiLCJoYW5kbGVMaXZlQ2hhbmdlIiwib0RpYWxvZ0NvbnRlbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImNsb3NlRGlhbG9nIiwicmVzcG9uc2UiLCJnZW5lcmF0ZSIsImNyZWF0ZUJ1dHRvbiIsImJJc0NyZWF0ZURpYWxvZyIsImFWYWx1ZXMiLCJrZXlzIiwic0tleSIsIm9WYWx1ZSIsIm9EaWFsb2dWYWx1ZSIsImNyZWF0ZVBhcmFtZXRlcnMiLCJ0cmFuc2llbnREYXRhIiwiY3JlYXRlRGF0YSIsInNQcm9wZXJ0eVBhdGgiLCJvUHJvcGVydHkiLCIka2luZCIsIm9Qcm9taXNlIiwib1Jlc3BvbnNlIiwiYktlZXBEaWFsb2dPcGVuIiwic2V0QmluZGluZ0NvbnRleHQiLCJDcmVhdGlvbkZhaWxlZCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJhZGREZXBlbmRlbnQiLCJnZXRCZWdpbkJ1dHRvbiIsInNldFVzZXJEZWZhdWx0cyIsImNyZWF0ZUFjdGlvbiIsImZuUmVzb2x2ZSIsImZuQ3JlYXRlQ29tcGxldGVkIiwiYlN1Y2Nlc3MiLCJkZXRhY2hDcmVhdGVDb21wbGV0ZWQiLCJmblNhZmVDb250ZXh0Q3JlYXRlZCIsImNyZWF0ZWQiLCJ0cmFjZSIsImNvbnRleHRFcnJvciIsImF0dGFjaENyZWF0ZUNvbXBsZXRlZCIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJnZXRVcGRhdGVHcm91cElkIiwicHJlZmVycmVkTW9kZSIsInRvVXBwZXJDYXNlIiwiaW5kZXhPZiIsInNQcmVmZXJyZWRNb2RlIiwic3Vic3RyIiwiZm5HZXRMYWJlbEZyb21MaW5lSXRlbUFubm90YXRpb24iLCJpTGluZUl0ZW1JbmRleCIsImZpbmRJbmRleCIsIm9MaW5lSXRlbSIsImFMaW5lSXRlbUFjdGlvbiIsIkFjdGlvbiIsIkxhYmVsIiwic2luZ2xldG9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUcmFuc2FjdGlvbkhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBvcGVyYXRpb25zIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9vcGVyYXRpb25zXCI7XG5pbXBvcnQgc3RpY2t5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9zdGlja3lcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgZGVsZXRlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0RlbGV0ZUhlbHBlclwiO1xuaW1wb3J0IEZQTUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IE1lc3NhZ2VUb2FzdCBmcm9tIFwic2FwL20vTWVzc2FnZVRvYXN0XCI7XG5pbXBvcnQgUG9wb3ZlciwgeyAkUG9wb3ZlclNldHRpbmdzIH0gZnJvbSBcInNhcC9tL1BvcG92ZXJcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBjb3JlTGlicmFyeSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgeyBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMsIGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IHRvRVM2UHJvbWlzZSBmcm9tIFwiLi4vLi4vaGVscGVycy9Ub0VTNlByb21pc2VcIjtcblxuY29uc3QgQ3JlYXRpb25Nb2RlID0gRkVMaWJyYXJ5LkNyZWF0aW9uTW9kZTtcbmNvbnN0IFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbDtcbmNvbnN0IFZhbHVlU3RhdGUgPSBjb3JlTGlicmFyeS5WYWx1ZVN0YXRlO1xuLyogTWFrZSBzdXJlIHRoYXQgdGhlIG1QYXJhbWV0ZXJzIGlzIG5vdCB0aGUgb0V2ZW50ICovXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmdldE1ldGFkYXRhICYmIG1QYXJhbWV0ZXJzLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpID09PSBcInNhcC51aS5iYXNlLkV2ZW50XCIpIHtcblx0XHRtUGFyYW1ldGVycyA9IHt9O1xuXHR9XG5cdHJldHVybiBtUGFyYW1ldGVycyB8fCB7fTtcbn1cblxuY2xhc3MgVHJhbnNhY3Rpb25IZWxwZXIge1xuXHRidXN5TG9jayhhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgYnVzeVBhdGg/OiBzdHJpbmcpIHtcblx0XHRCdXN5TG9ja2VyLmxvY2soYXBwQ29tcG9uZW50LmdldE1vZGVsKFwidWlcIiksIGJ1c3lQYXRoKTtcblx0fVxuXG5cdGJ1c3lVbmxvY2soYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsIGJ1c3lQYXRoPzogc3RyaW5nKSB7XG5cdFx0QnVzeUxvY2tlci51bmxvY2soYXBwQ29tcG9uZW50LmdldE1vZGVsKFwidWlcIiksIGJ1c3lQYXRoKTtcblx0fVxuXG5cdGdldFByb2dyYW1taW5nTW9kZWwoc291cmNlOiBPRGF0YVY0Q29udGV4dCB8IEJpbmRpbmcpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0bGV0IHBhdGg6IHN0cmluZztcblx0XHRpZiAoc291cmNlLmlzQTxPRGF0YVY0Q29udGV4dD4oXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkge1xuXHRcdFx0cGF0aCA9IHNvdXJjZS5nZXRQYXRoKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhdGggPSAoc291cmNlLmlzUmVsYXRpdmUoKSA/IHNvdXJjZS5nZXRSZXNvbHZlZFBhdGgoKSA6IHNvdXJjZS5nZXRQYXRoKCkpID8/IFwiXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gc291cmNlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsLCBwYXRoKSkge1xuXHRcdFx0cmV0dXJuIFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQobWV0YU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIFByb2dyYW1taW5nTW9kZWwuU3RpY2t5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvZ3JhbW1pbmdNb2RlbC5Ob25EcmFmdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSB2YWxpZGF0ZWRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmRhdGFdIEEgbWFwIG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgdmFsaWRhdGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gdGhlIHZhbGlkYXRpb24gZnVuY3Rpb25cblx0ICogQHBhcmFtIG9WaWV3IENvbnRhaW5zIHRoZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggcmVzdWx0IG9mIHRoZSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHR2YWxpZGF0ZURvY3VtZW50KG9Db250ZXh0OiBPRGF0YVY0Q29udGV4dCwgbVBhcmFtZXRlcnM6IGFueSwgb1ZpZXc6IFZpZXcpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPSBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb247XG5cdFx0aWYgKHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24pIHtcblx0XHRcdGNvbnN0IHNNb2R1bGUgPSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLnN1YnN0cmluZygwLCBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSB8fCAtMSkucmVwbGFjZSgvXFwuL2dpLCBcIi9cIiksXG5cdFx0XHRcdHNGdW5jdGlvbk5hbWUgPSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLnN1YnN0cmluZyhcblx0XHRcdFx0XHRzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSArIDEsXG5cdFx0XHRcdFx0c0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5sZW5ndGhcblx0XHRcdFx0KSxcblx0XHRcdFx0bURhdGEgPSBtUGFyYW1ldGVycy5kYXRhO1xuXHRcdFx0ZGVsZXRlIG1EYXRhW1wiQCR1aTUuY29udGV4dC5pc1RyYW5zaWVudFwiXTtcblx0XHRcdHJldHVybiBGUE1IZWxwZXIudmFsaWRhdGlvbldyYXBwZXIoc01vZHVsZSwgc0Z1bmN0aW9uTmFtZSwgbURhdGEsIG9WaWV3LCBvQ29udGV4dCk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvTWFpbkxpc3RCaW5kaW5nIE9EYXRhIFY0IExpc3RCaW5kaW5nIG9iamVjdFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnNdIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5kYXRhXSBBIG1hcCBvZiBkYXRhIHRoYXQgc2hvdWxkIGJlIHNlbnQgd2l0aGluIHRoZSBQT1NUXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5idXN5TW9kZV0gR2xvYmFsIChkZWZhdWx0KSwgTG9jYWwsIE5vbmUgVE9ETzogdG8gYmUgcmVmYWN0b3JlZFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuYnVzeUlkXSBJRCBvZiB0aGUgbG9jYWwgYnVzeSBpbmRpY2F0b3Jcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWRdIElmIHNldCwgdGhlIGNvbnRleHQgc3RheXMgaW4gdGhlIGxpc3QgaWYgdGhlIFBPU1QgZmFpbGVkIGFuZCBQT1NUIHdpbGwgYmUgcmVwZWF0ZWQgd2l0aCB0aGUgbmV4dCBjaGFuZ2Vcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmluYWN0aXZlXSBJZiBzZXQsIHRoZSBjb250ZXh0IGlzIHNldCBhcyBpbmFjdGl2ZSBmb3IgZW1wdHkgcm93c1xuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZ10gU2tpcHMgdGhlIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcCBjb21wb25lbnRcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEBwYXJhbSBmcm9tQ29weVBhc3RlIFRydWUgaWYgdGhlIGNyZWF0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZCBieSBhIHBhc3RlIGFjdGlvblxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggbmV3IGJpbmRpbmcgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBjcmVhdGVEb2N1bWVudChcblx0XHRvTWFpbkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdG1JblBhcmFtZXRlcnM6XG5cdFx0XHR8IHtcblx0XHRcdFx0XHRkYXRhPzogYW55O1xuXHRcdFx0XHRcdGJ1c3lNb2RlPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGJ1c3lJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGluYWN0aXZlPzogYm9vbGVhbjtcblx0XHRcdCAgfVxuXHRcdFx0fCB1bmRlZmluZWQsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGZyb21Db3B5UGFzdGU6IGJvb2xlYW5cblx0KTogUHJvbWlzZTxPRGF0YVY0Q29udGV4dD4ge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9NYWluTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpIS5nZXRQYXRoKCkpLFxuXHRcdFx0c0NyZWF0ZUhhc2ggPSBhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5nZXRIYXNoKCksXG5cdFx0XHRvQ29tcG9uZW50RGF0YSA9IGFwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCksXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9LFxuXHRcdFx0c05ld0FjdGlvbiA9ICFvTWFpbkxpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKVxuXHRcdFx0XHQ/IHRoaXMuX2dldE5ld0FjdGlvbihvU3RhcnR1cFBhcmFtZXRlcnMsIHNDcmVhdGVIYXNoLCBvTWV0YU1vZGVsLCBzTWV0YVBhdGgpXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG1CaW5kaW5nUGFyYW1ldGVyczogYW55ID0geyAkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzOiB0cnVlIH07XG5cdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcy8kUGF0aGApO1xuXHRcdGxldCBzQnVzeVBhdGggPSBcIi9idXN5XCI7XG5cdFx0bGV0IHNGdW5jdGlvbk5hbWUgPVxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYCkgfHxcblx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgJHtNb2RlbEhlbHBlci5nZXRUYXJnZXRFbnRpdHlTZXQob01ldGFNb2RlbC5nZXRDb250ZXh0KHNNZXRhUGF0aCkpfUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYFxuXHRcdFx0KTtcblx0XHRsZXQgYkZ1bmN0aW9uT25OYXZQcm9wO1xuXHRcdGxldCBvTmV3RG9jdW1lbnRDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRpZiAoc0Z1bmN0aW9uTmFtZSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb25gKSAmJlxuXHRcdFx0XHRNb2RlbEhlbHBlci5nZXRUYXJnZXRFbnRpdHlTZXQob01ldGFNb2RlbC5nZXRDb250ZXh0KHNNZXRhUGF0aCkpICE9PSBzTWV0YVBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRiRnVuY3Rpb25Pbk5hdlByb3AgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YkZ1bmN0aW9uT25OYXZQcm9wID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRtQmluZGluZ1BhcmFtZXRlcnNbXCIkc2VsZWN0XCJdID0gc01lc3NhZ2VzUGF0aDtcblx0XHR9XG5cdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1JblBhcmFtZXRlcnMpO1xuXHRcdGlmICghb01haW5MaXN0QmluZGluZykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyByZXF1aXJlZCBmb3IgbmV3IGRvY3VtZW50IGNyZWF0aW9uXCIpO1xuXHRcdH1cblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvTWFpbkxpc3RCaW5kaW5nKTtcblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDcmVhdGUgZG9jdW1lbnQgb25seSBhbGxvd2VkIGZvciBkcmFmdCBvciBzdGlja3kgc2Vzc2lvbiBzdXBwb3J0ZWQgc2VydmljZXNcIik7XG5cdFx0fVxuXHRcdGlmIChtUGFyYW1ldGVycy5idXN5TW9kZSA9PT0gXCJMb2NhbFwiKSB7XG5cdFx0XHRzQnVzeVBhdGggPSBgL2J1c3lMb2NhbC8ke21QYXJhbWV0ZXJzLmJ1c3lJZH1gO1xuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayA9IGZyb21Db3B5UGFzdGUgPyBudWxsIDogbVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2s7XG5cdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQsIHNCdXN5UGF0aCk7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlQ29yZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0bGV0IG9SZXN1bHQ6IGFueTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAoc05ld0FjdGlvbikge1xuXHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsQWN0aW9uKFxuXHRcdFx0XHRcdHNOZXdBY3Rpb24sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29udGV4dHM6IG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpLFxuXHRcdFx0XHRcdFx0c2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZzogdHJ1ZSxcblx0XHRcdFx0XHRcdGxhYmVsOiB0aGlzLl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsKG9NZXRhTW9kZWwsIHNNZXRhUGF0aCwgc05ld0FjdGlvbiwgb1Jlc291cmNlQnVuZGxlQ29yZSksXG5cdFx0XHRcdFx0XHRiaW5kaW5nUGFyYW1ldGVyczogbUJpbmRpbmdQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0cGFyZW50Q29udHJvbDogbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdGJJc0NyZWF0ZUFjdGlvbjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c6IG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2dcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0YXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBiSXNOZXdQYWdlQ3JlYXRpb24gPVxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93ICYmIG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZTtcblx0XHRcdFx0Y29uc3QgYU5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkcyA9IGJJc05ld1BhZ2VDcmVhdGlvblxuXHRcdFx0XHRcdD8gZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzKG9NZXRhTW9kZWwsIHNNZXRhUGF0aCwgYXBwQ29tcG9uZW50KVxuXHRcdFx0XHRcdDogW107XG5cdFx0XHRcdHNGdW5jdGlvbk5hbWUgPSBmcm9tQ29weVBhc3RlID8gbnVsbCA6IHNGdW5jdGlvbk5hbWU7XG5cdFx0XHRcdGxldCBzRnVuY3Rpb25QYXRoLCBvRnVuY3Rpb25Db250ZXh0O1xuXHRcdFx0XHRpZiAoc0Z1bmN0aW9uTmFtZSkge1xuXHRcdFx0XHRcdC8vYm91bmQgdG8gdGhlIHNvdXJjZSBlbnRpdHk6XG5cdFx0XHRcdFx0aWYgKGJGdW5jdGlvbk9uTmF2UHJvcCkge1xuXHRcdFx0XHRcdFx0c0Z1bmN0aW9uUGF0aCA9XG5cdFx0XHRcdFx0XHRcdG9NYWluTGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpICYmXG5cdFx0XHRcdFx0XHRcdGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpKX0vJHtzRnVuY3Rpb25OYW1lfWA7XG5cdFx0XHRcdFx0XHRvRnVuY3Rpb25Db250ZXh0ID0gb01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNGdW5jdGlvblBhdGggPVxuXHRcdFx0XHRcdFx0XHRvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSAmJlxuXHRcdFx0XHRcdFx0XHRgJHtvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpIS5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YDtcblx0XHRcdFx0XHRcdG9GdW5jdGlvbkNvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgb0Z1bmN0aW9uID0gc0Z1bmN0aW9uUGF0aCAmJiAob01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVuY3Rpb25QYXRoKSBhcyBhbnkpO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0bGV0IG9EYXRhOiBhbnk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Db250ZXh0ID1cblx0XHRcdFx0XHRcdFx0b0Z1bmN0aW9uICYmIG9GdW5jdGlvbi5nZXRPYmplY3QoKSAmJiBvRnVuY3Rpb24uZ2V0T2JqZWN0KClbMF0uJElzQm91bmRcblx0XHRcdFx0XHRcdFx0XHQ/IGF3YWl0IG9wZXJhdGlvbnMuY2FsbEJvdW5kRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZSwgb0Z1bmN0aW9uQ29udGV4dCwgb01vZGVsKVxuXHRcdFx0XHRcdFx0XHRcdDogYXdhaXQgb3BlcmF0aW9ucy5jYWxsRnVuY3Rpb25JbXBvcnQoc0Z1bmN0aW9uTmFtZSwgb01vZGVsKTtcblx0XHRcdFx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRvRGF0YSA9IG9Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIGV4ZWN1dGluZyB0aGUgZnVuY3Rpb24gJHtzRnVuY3Rpb25OYW1lfWAsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGEgPSBvRGF0YSA/IE9iamVjdC5hc3NpZ24oe30sIG9EYXRhLCBtUGFyYW1ldGVycy5kYXRhKSA6IG1QYXJhbWV0ZXJzLmRhdGE7XG5cdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRhdGEpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBtUGFyYW1ldGVycy5kYXRhW1wiQG9kYXRhLmNvbnRleHRcIl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCB0aGlzLl9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdFx0XHRcdFx0XHRvTWFpbkxpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHRhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzLFxuXHRcdFx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9SZXN1bHQubmV3Q29udGV4dDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRvRVM2UHJvbWlzZShcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01haW5MaXN0QmluZGluZyAmJiBvTWFpbkxpc3RCaW5kaW5nLmdldFBhdGgoKVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmNyZWF0ZShcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSxcblx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmluYWN0aXZlXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5pbmFjdGl2ZSkge1xuXHRcdFx0XHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgdGhpcy5vbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTWFpbkxpc3RCaW5kaW5nLCBvTmV3RG9jdW1lbnRDb250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBuZXcgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9OZXdEb2N1bWVudENvbnRleHQgfHwgb1Jlc3VsdDtcblxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coeyBjb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sIH0pO1xuXHRcdFx0cmV0dXJuIG9OZXdEb2N1bWVudENvbnRleHQhO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7IGNvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgfSk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChlcnJvciA9PT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5BY3Rpb25FeGVjdXRpb25GYWlsZWQgfHwgZXJyb3IgPT09IEZFTGlicmFyeS5Db25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKSAmJlxuXHRcdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0Py5pc1RyYW5zaWVudCgpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHdvcmthcm91bmQgc3VnZ2VzdGVkIGJ5IG1vZGVsIGFzIENvbnRleHQuZGVsZXRlIHJlc3VsdHMgaW4gYW4gZXJyb3Jcblx0XHRcdFx0Ly8gVE9ETzogcmVtb3ZlIHRoZSAkZGlyZWN0IG9uY2UgbW9kZWwgcmVzb2x2ZXMgdGhpcyBpc3N1ZVxuXHRcdFx0XHQvLyB0aGlzIGxpbmUgc2hvd3MgdGhlIGV4cGVjdGVkIGNvbnNvbGUgZXJyb3IgVW5jYXVnaHQgKGluIHByb21pc2UpIEVycm9yOiBSZXF1ZXN0IGNhbmNlbGVkOiBQT1NUIFRyYXZlbDsgZ3JvdXA6IHN1Ym1pdExhdGVyXG5cdFx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQuZGVsZXRlKFwiJGRpcmVjdFwiKTtcblx0XHRcdH1cblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50LCBzQnVzeVBhdGgpO1xuXHRcdH1cblx0fVxuXG5cdF9pc0RyYWZ0RW5hYmxlZCh2Q29udGV4dHM6IE9EYXRhVjRDb250ZXh0W10pIHtcblx0XHRjb25zdCBjb250ZXh0Rm9yRHJhZnRNb2RlbCA9IHZDb250ZXh0c1swXTtcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChjb250ZXh0Rm9yRHJhZnRNb2RlbCk7XG5cdFx0cmV0dXJuIHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZSBvbmUgb3IgbXVsdGlwbGUgZG9jdW1lbnQocykuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBjb250ZXh0cyBDb250ZXh0cyBFaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMudGl0bGUgVGl0bGUgb2YgdGhlIG9iamVjdCB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbiBEZXNjcmlwdGlvbiBvZiB0aGUgb2JqZWN0IHRvIGJlIGRlbGV0ZWRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyBOdW1iZXIgb2Ygb2JqZWN0cyBzZWxlY3RlZFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMubm9EaWFsb2cgVG8gZGlzYWJsZSB0aGUgY29uZmlybWF0aW9uIGRpYWxvZ1xuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIHJlc291cmNlTW9kZWwgVGhlIHJlc291cmNlIG1vZGVsIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZlZCBvbmNlIHRoZSBkb2N1bWVudHMgYXJlIGRlbGV0ZWRcblx0ICovXG5cdGRlbGV0ZURvY3VtZW50KFxuXHRcdGNvbnRleHRzOiBPRGF0YVY0Q29udGV4dCB8IE9EYXRhVjRDb250ZXh0W10sXG5cdFx0bVBhcmFtZXRlcnM6IGFueSxcblx0XHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0XHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlclxuXHQpIHtcblx0XHRjb25zdCByZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdGxldCBhUGFyYW1zO1xuXHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblxuXHRcdGNvbnN0IGNvbnRleHRzVG9EZWxldGUgPSBBcnJheS5pc0FycmF5KGNvbnRleHRzKSA/IFsuLi5jb250ZXh0c10gOiBbY29udGV4dHNdO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IGRyYWZ0RW5hYmxlZCA9IHRoaXMuX2lzRHJhZnRFbmFibGVkKG1QYXJhbWV0ZXJzLnNlbGVjdGVkQ29udGV4dHMgfHwgY29udGV4dHNUb0RlbGV0ZSk7XG5cdFx0XHRcdGNvbnN0IGl0ZW1zOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRjb25zdCBvcHRpb25zOiBhbnlbXSA9IFtdO1xuXG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdGlmICghbVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzKSB7XG5cdFx0XHRcdFx0XHQvLyBub24tVGFibGVcblx0XHRcdFx0XHRcdGlmIChkcmFmdEVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgMSBvZiB0aGUgZHJhZnRzIGlzIGxvY2tlZCBieSBhbm90aGVyIHVzZXJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbG9ja2VkQ29udGV4dCA9IGNvbnRleHRzVG9EZWxldGUuZmluZCgoY29udGV4dCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbnRleHREYXRhID0gY29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgPT09IHRydWUgJiZcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhLkhhc0RyYWZ0RW50aXR5ID09PSB0cnVlICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0RGF0YS5EcmFmdEFkbWluaXN0cmF0aXZlRGF0YSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEuSW5Qcm9jZXNzQnlVc2VyICYmXG5cdFx0XHRcdFx0XHRcdFx0XHQhY29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEuRHJhZnRJc0NyZWF0ZWRCeU1lXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChsb2NrZWRDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gU2hvdyBtZXNzYWdlIGJveCB3aXRoIHRoZSBuYW1lIG9mIHRoZSBsb2NraW5nIHVzZXIgYW5kIHJldHVyblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGxvY2tpbmdVc2VyTmFtZSA9IGxvY2tlZENvbnRleHQuZ2V0T2JqZWN0KCkuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEuSW5Qcm9jZXNzQnlVc2VyO1xuXHRcdFx0XHRcdFx0XHRcdE1lc3NhZ2VCb3guc2hvdyhcblx0XHRcdFx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfU0lOR0xFX09CSkVDVF9MT0NLRURcIiwgW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsb2NraW5nVXNlck5hbWVcblx0XHRcdFx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbkNsb3NlOiByZWplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdGxldCBub25UYWJsZVR4dCA9IFwiXCI7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMudGl0bGUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFttUGFyYW1ldGVycy50aXRsZSArIFwiIFwiLCBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbl07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFttUGFyYW1ldGVycy50aXRsZSwgXCJcIl07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0bm9uVGFibGVUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9cIixcblx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zLFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG5vblRhYmxlVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUlwiLFxuXHRcdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcImRlbGV0YWJsZUNvbnRleHRzXCIsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRzOiBjb250ZXh0c1RvRGVsZXRlLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBub25UYWJsZVR4dCxcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2w6IFwidGV4dFwiXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gVGFibGVcblx0XHRcdFx0XHRcdGxldCB0b3RhbERlbGV0YWJsZSA9IGNvbnRleHRzVG9EZWxldGUubGVuZ3RoO1xuXG5cdFx0XHRcdFx0XHRpZiAoZHJhZnRFbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRvdGFsRGVsZXRhYmxlICs9XG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggK1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUubGVuZ3RoICtcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoICtcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVNb2RlQ29udGV4dHMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0XHRkZWxldGVIZWxwZXIudXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMoXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dHNUb0RlbGV0ZSxcblx0XHRcdFx0XHRcdFx0XHR0b3RhbERlbGV0YWJsZSxcblx0XHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdGl0ZW1zLFxuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5vbkRlbGV0YWJsZVRleHQgPSBkZWxldGVIZWxwZXIuZ2V0Tm9uRGVsZXRhYmxlVGV4dChtUGFyYW1ldGVycywgdG90YWxEZWxldGFibGUsIHJlc291cmNlTW9kZWwpO1xuXHRcdFx0XHRcdFx0XHRpZiAobm9uRGVsZXRhYmxlVGV4dCkge1xuXHRcdFx0XHRcdFx0XHRcdGl0ZW1zLnB1c2gobm9uRGVsZXRhYmxlVGV4dCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZGVsZXRlSGVscGVyLnVwZGF0ZU9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyhtUGFyYW1ldGVycywgY29udGV4dHNUb0RlbGV0ZSwgcmVzb3VyY2VNb2RlbCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ29udGVudCBvZiBEZWxldGUgRGlhbG9nXG5cdFx0XHRcdGRlbGV0ZUhlbHBlci51cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nKG9wdGlvbnMsIGl0ZW1zKTtcblx0XHRcdFx0Y29uc3QgdkJveCA9IG5ldyBWQm94KHsgaXRlbXM6IGl0ZW1zIH0pO1xuXHRcdFx0XHRjb25zdCBzVGl0bGUgPSByZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfQ09NTU9OX0RFTEVURVwiKTtcblxuXHRcdFx0XHRjb25zdCBmbkNvbmZpcm0gPSBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBkZWxldGVIZWxwZXIuZGVsZXRlQ29uZmlybUhhbmRsZXIoXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRkcmFmdEVuYWJsZWRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bGV0IGRpYWxvZ0NvbmZpcm1lZCA9IGZhbHNlO1xuXHRcdFx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyh7XG5cdFx0XHRcdFx0dGl0bGU6IHNUaXRsZSxcblx0XHRcdFx0XHRzdGF0ZTogXCJXYXJuaW5nXCIsXG5cdFx0XHRcdFx0Y29udGVudDogW3ZCb3hdLFxuXHRcdFx0XHRcdGFyaWFMYWJlbGxlZEJ5OiBpdGVtcyxcblx0XHRcdFx0XHRiZWdpbkJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHR0ZXh0OiByZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfQ09NTU9OX0RFTEVURVwiKSxcblx0XHRcdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdGRpYWxvZ0NvbmZpcm1lZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0Zm5Db25maXJtKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxcIiksXG5cdFx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0XHQvLyBpZiBkaWFsb2cgaXMgY2xvc2VkIHVuY29uZmlybWVkIChlLmcuIHZpYSBcIkNhbmNlbFwiIG9yIEVzY2FwZSBidXR0b24pLCBlbnN1cmUgdG8gcmVqZWN0IHByb21pc2Vcblx0XHRcdFx0XHRcdGlmICghZGlhbG9nQ29uZmlybWVkKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBhcyBhbnkpO1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMubm9EaWFsb2cpIHtcblx0XHRcdFx0XHRmbkNvbmZpcm0oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvRGlhbG9nLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaUNvbnRlbnRQYWRkaW5nXCIpO1xuXHRcdFx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFZGl0cyBhIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50XG5cdCAqIEBwYXJhbSBvVmlldyBDdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIG5ldyBkcmFmdCBjb250ZXh0IGluIGNhc2Ugb2YgZHJhZnQgcHJvZ3JhbW1pbmcgbW9kZWxcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgZWRpdERvY3VtZW50KFxuXHRcdG9Db250ZXh0OiBPRGF0YVY0Q29udGV4dCxcblx0XHRvVmlldzogVmlldyxcblx0XHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0XHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXJcblx0KTogUHJvbWlzZTxPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZD4ge1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gYWN0aXZlIGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHRcdH1cblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFZGl0IGlzIG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0Ly8gYmVmb3JlIHRyaWdnZXJpbmcgdGhlIGVkaXQgYWN0aW9uIHdlJ2xsIGhhdmUgdG8gcmVtb3ZlIGFsbCBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzXG5cdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb05ld0NvbnRleHQgPVxuXHRcdFx0XHRzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdFxuXHRcdFx0XHRcdD8gYXdhaXQgZHJhZnQuY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQob0NvbnRleHQsIGFwcENvbXBvbmVudCwge1xuXHRcdFx0XHRcdFx0XHRiUHJlc2VydmVDaGFuZ2VzOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRvVmlldzogb1ZpZXdcblx0XHRcdFx0XHQgIH0gYXMgYW55KVxuXHRcdFx0XHRcdDogYXdhaXQgc3RpY2t5LmVkaXREb2N1bWVudEluU3RpY2t5U2Vzc2lvbihvQ29udGV4dCwgYXBwQ29tcG9uZW50KTtcblxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdHJldHVybiBvTmV3Q29udGV4dDtcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKHsgY29uY3VycmVudEVkaXRGbGFnOiB0cnVlIH0pO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FuY2VsICdlZGl0JyBtb2RlIG9mIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSBjYW5jZWxlZCBvciBkZWxldGVkXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uIENhbmNlbCBCdXR0b24gb2YgdGhlIGRpc2NhcmQgcG9wb3ZlciAobWFuZGF0b3J5IGZvciBub3cpXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnNraXBEaXNjYXJkUG9wb3ZlciBPcHRpb25hbCwgc3VwcmVzc2VzIHRoZSBkaXNjYXJkIHBvcG92ZXIgaW5jYXNlIG9mIGRyYWZ0IGFwcGxpY2F0aW9ucyB3aGlsZSBuYXZpZ2F0aW5nIG91dCBvZiBPUFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIHJlc291cmNlTW9kZWwgVGhlIG1vZGVsIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEBwYXJhbSBpc05ld09iamVjdCBUcnVlIGlmIHdlJ3JlIHRyeWluZyB0byBjYW5jZWwgYSBuZXdseSBjcmVhdGVkIG9iamVjdFxuXHQgKiBAcGFyYW0gaXNPYmplY3RNb2RpZmllZCBUcnVlIGlmIHRoZSBvYmplY3QgaGFzIGJlZW4gbW9kaWZpZWQgYnkgdGhlIHVzZXJcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoID8/P1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBjYW5jZWxEb2N1bWVudChcblx0XHRvQ29udGV4dDogT0RhdGFWNENvbnRleHQsXG5cdFx0bUluUGFyYW1ldGVyczogeyBjYW5jZWxCdXR0b246IEJ1dHRvbjsgc2tpcERpc2NhcmRQb3BvdmVyOiBib29sZWFuIH0gfCB1bmRlZmluZWQsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0XHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsXG5cdFx0aXNOZXdPYmplY3Q6IGJvb2xlYW4sXG5cdFx0aXNPYmplY3RNb2RpZmllZDogYm9vbGVhblxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0IHwgYm9vbGVhbj4ge1xuXHRcdC8vY29udGV4dCBtdXN0IGFsd2F5cyBiZSBwYXNzZWQgLSBtYW5kYXRvcnkgcGFyYW1ldGVyXG5cdFx0aWYgKCFvQ29udGV4dCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gY29udGV4dCBleGlzdHMuIFBhc3MgYSBtZWFuaW5nZnVsIGNvbnRleHRcIik7XG5cdFx0fVxuXHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRjb25zdCBtUGFyYW1ldGVycyA9IGdldFBhcmFtZXRlcnMobUluUGFyYW1ldGVycyk7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5jZWwgZG9jdW1lbnQgb25seSBhbGxvd2VkIGZvciBkcmFmdCBvciBzdGlja3kgc2Vzc2lvbiBzdXBwb3J0ZWQgc2VydmljZXNcIik7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRsZXQgcmV0dXJuZWRWYWx1ZTogT0RhdGFWNENvbnRleHQgfCBib29sZWFuID0gZmFsc2U7XG5cblx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCAmJiAhaXNPYmplY3RNb2RpZmllZCkge1xuXHRcdFx0XHRjb25zdCBkcmFmdERhdGFDb250ZXh0ID0gb01vZGVsLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0Y29uc3QgZHJhZnRBZG1pbkRhdGEgPSBhd2FpdCBkcmFmdERhdGFDb250ZXh0LnJlcXVlc3RPYmplY3QoKTtcblx0XHRcdFx0aWYgKGRyYWZ0QWRtaW5EYXRhKSB7XG5cdFx0XHRcdFx0aXNPYmplY3RNb2RpZmllZCA9IGRyYWZ0QWRtaW5EYXRhLkNyZWF0aW9uRGF0ZVRpbWUgIT09IGRyYWZ0QWRtaW5EYXRhLkxhc3RDaGFuZ2VEYXRlVGltZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFtUGFyYW1ldGVycy5za2lwRGlzY2FyZFBvcG92ZXIpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fY29uZmlybURpc2NhcmQobVBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uLCBpc09iamVjdE1vZGlmaWVkLCByZXNvdXJjZU1vZGVsKTtcblx0XHRcdH1cblx0XHRcdGlmIChvQ29udGV4dC5pc0tlZXBBbGl2ZSgpKSB7XG5cdFx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuYmVmb3JlQ2FuY2VsQ2FsbEJhY2spIHtcblx0XHRcdFx0YXdhaXQgbVBhcmFtZXRlcnMuYmVmb3JlQ2FuY2VsQ2FsbEJhY2soeyBjb250ZXh0OiBvQ29udGV4dCB9KTtcblx0XHRcdH1cblx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHRpZiAoaXNOZXdPYmplY3QpIHtcblx0XHRcdFx0XHRpZiAob0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gYXdhaXQgZHJhZnQuZGVsZXRlRHJhZnQob0NvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1NpYmxpbmdDb250ZXh0ID0gb01vZGVsLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vU2libGluZ0VudGl0eWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzQ2Fub25pY2FsUGF0aCA9IGF3YWl0IG9TaWJsaW5nQ29udGV4dC5yZXF1ZXN0Q2Fub25pY2FsUGF0aCgpO1xuXHRcdFx0XHRcdFx0aWYgKG9Db250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuZWRWYWx1ZSA9IG9Nb2RlbC5iaW5kQ29udGV4dChzQ2Fub25pY2FsUGF0aCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdGF3YWl0IGRyYWZ0LmRlbGV0ZURyYWZ0KG9Db250ZXh0LCBhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZGlzY2FyZGVkQ29udGV4dCA9IGF3YWl0IHN0aWNreS5kaXNjYXJkRG9jdW1lbnQob0NvbnRleHQpO1xuXHRcdFx0XHRpZiAoZGlzY2FyZGVkQ29udGV4dCkge1xuXHRcdFx0XHRcdGlmIChkaXNjYXJkZWRDb250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdGRpc2NhcmRlZENvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIWlzTmV3T2JqZWN0KSB7XG5cdFx0XHRcdFx0XHRkaXNjYXJkZWRDb250ZXh0LnJlZnJlc2goKTtcblx0XHRcdFx0XHRcdHJldHVybmVkVmFsdWUgPSBkaXNjYXJkZWRDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW1vdmUgZXhpc3RpbmcgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlc1xuXHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHQvLyBzaG93IHVuYm91bmQgbWVzc2FnZXNcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0cmV0dXJuIHJldHVybmVkVmFsdWU7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZXMgdGhlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSBzYXZlZFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIHJlc291cmNlTW9kZWwgVGhlIG1vZGVsIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHBhcmFtIGV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgVHJ1ZSBpZiB3ZSBzaG91bGQgZXhlY3V0ZSBzaWRlIGVmZmVjdHMgaW4gY2FzZSBvZiBhbiBlcnJvclxuXHQgKiBAcGFyYW0gYmluZGluZ3NGb3JTaWRlRWZmZWN0cyBUaGUgbGlzdEJpbmRpbmdzIHRvIGJlIHVzZWQgZm9yIGV4ZWN1dGluZyBzaWRlIGVmZmVjdHMgb24gZXJyb3Jcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEBwYXJhbSBpc05ld09iamVjdCBUcnVlIGlmIHdlJ3JlIHRyeWluZyB0byBjYW5jZWwgYSBuZXdseSBjcmVhdGVkIG9iamVjdFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggPz8/XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGFzeW5jIHNhdmVEb2N1bWVudChcblx0XHRjb250ZXh0OiBPRGF0YVY0Q29udGV4dCxcblx0XHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0XHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRcdGV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3I6IGJvb2xlYW4sXG5cdFx0YmluZGluZ3NGb3JTaWRlRWZmZWN0czogT0RhdGFMaXN0QmluZGluZ1tdLFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcixcblx0XHRpc05ld09iamVjdDogYm9vbGVhblxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0PiB7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwoY29udGV4dCk7XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSAmJiBzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2F2ZSBpcyBvbmx5IGFsbG93ZWQgZm9yIGRyYWZ0IG9yIHN0aWNreSBzZXNzaW9uIHN1cHBvcnRlZCBzZXJ2aWNlc1wiKTtcblx0XHR9XG5cdFx0Ly8gaW4gY2FzZSBvZiBzYXZpbmcgLyBhY3RpdmF0aW5nIHRoZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIHNoYWxsIGJlIHJlbW92ZWQgYmVmb3JlIHRoZSBQQVRDSC9QT1NUXG5cdFx0Ly8gaXMgc2VudCB0byB0aGUgYmFja2VuZFxuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdGNvbnN0IG9BY3RpdmVEb2N1bWVudCA9XG5cdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0PyBhd2FpdCBkcmFmdC5hY3RpdmF0ZURvY3VtZW50KGNvbnRleHQsIGFwcENvbXBvbmVudCwge30sIG1lc3NhZ2VIYW5kbGVyKVxuXHRcdFx0XHRcdDogYXdhaXQgc3RpY2t5LmFjdGl2YXRlRG9jdW1lbnQoY29udGV4dCwgYXBwQ29tcG9uZW50KTtcblxuXHRcdFx0Y29uc3QgbWVzc2FnZXNSZWNlaXZlZCA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcygpLmNvbmNhdChtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkpOyAvLyBnZXQgdW5ib3VuZCBhbmQgYm91bmQgbWVzc2FnZXMgcHJlc2VudCBpbiB0aGUgbW9kZWxcblx0XHRcdGlmICghKG1lc3NhZ2VzUmVjZWl2ZWQubGVuZ3RoID09PSAxICYmIG1lc3NhZ2VzUmVjZWl2ZWRbMF0udHlwZSA9PT0gY29yZUxpYnJhcnkuTWVzc2FnZVR5cGUuU3VjY2VzcykpIHtcblx0XHRcdFx0Ly8gc2hvdyBvdXIgb2JqZWN0IGNyZWF0aW9uIHRvYXN0IG9ubHkgaWYgaXQgaXMgbm90IGNvbWluZyBmcm9tIGJhY2tlbmRcblx0XHRcdFx0TWVzc2FnZVRvYXN0LnNob3coXG5cdFx0XHRcdFx0aXNOZXdPYmplY3Rcblx0XHRcdFx0XHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfT0JKRUNUX0NSRUFURURcIilcblx0XHRcdFx0XHRcdDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfT0JKRUNUX1NBVkVEXCIpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvQWN0aXZlRG9jdW1lbnQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGlmIChleGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yICYmIGJpbmRpbmdzRm9yU2lkZUVmZmVjdHM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0LyogVGhlIHNpZGVFZmZlY3RzIGFyZSBleGVjdXRlZCBvbmx5IGZvciB0YWJsZSBpdGVtcyBpbiB0cmFuc2llbnQgc3RhdGUgKi9cblx0XHRcdFx0YmluZGluZ3NGb3JTaWRlRWZmZWN0cy5mb3JFYWNoKChsaXN0QmluZGluZykgPT4ge1xuXHRcdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChsaXN0QmluZGluZykpIHtcblx0XHRcdFx0XHRcdGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5yZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkobGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBjb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxscyBhIGJvdW5kIG9yIHVuYm91bmQgYWN0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5jYWxsQWN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBjYWxsZWRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlc10gQSBtYXAgb2YgYWN0aW9uIHBhcmFtZXRlciBuYW1lcyBhbmQgcHJvdmlkZWQgdmFsdWVzXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZ10gU2tpcHMgdGhlIHBhcmFtZXRlciBkaWFsb2cgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIG9mIHRoZW1cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jb250ZXh0c10gTWFuZGF0b3J5IGZvciBhIGJvdW5kIGFjdGlvbjogRWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubW9kZWxdIE1hbmRhdG9yeSBmb3IgYW4gdW5ib3VuZCBhY3Rpb246IEFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nXSBNb2RlIGhvdyBhY3Rpb25zIGFyZSB0byBiZSBjYWxsZWQ6ICdDaGFuZ2VTZXQnIHRvIHB1dCBhbGwgYWN0aW9uIGNhbGxzIGludG8gb25lIGNoYW5nZXNldCwgJ0lzb2xhdGVkJyB0byBwdXQgdGhlbSBpbnRvIHNlcGFyYXRlIGNoYW5nZXNldHNcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5sYWJlbF0gQSBodW1hbi1yZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHRdIElmIHNwZWNpZmllZCwgdGhlIGFjdGlvbiBwcm9taXNlIHJldHVybnMgdGhlIGJvdW5kIGNvbnRleHRcblx0ICogQHBhcmFtIG9WaWV3IENvbnRhaW5zIHRoZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCBhbiBhcnJheSBvZiByZXNwb25zZSBvYmplY3RzIChUT0RPOiB0byBiZSBjaGFuZ2VkKVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBjYWxsQWN0aW9uKFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcsXG5cdFx0bVBhcmFtZXRlcnM6IGFueSxcblx0XHRvVmlldzogVmlldyB8IG51bGwsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCk6IFByb21pc2U8YW55PiB7XG5cdFx0bVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzKTtcblx0XHRsZXQgY29udGV4dFRvUHJvY2Vzcywgb01vZGVsOiBhbnk7XG5cdFx0Y29uc3QgbUJpbmRpbmdQYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMuYmluZGluZ1BhcmFtZXRlcnM7XG5cdFx0aWYgKCFzQWN0aW9uTmFtZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUHJvdmlkZSBuYW1lIG9mIGFjdGlvbiB0byBiZSBleGVjdXRlZFwiKTtcblx0XHR9XG5cdFx0Ly8gYWN0aW9uIGltcG9ydHMgYXJlIG5vdCBkaXJlY3RseSBvYnRhaW5lZCBmcm9tIHRoZSBtZXRhTW9kZWwgYnkgaXQgaXMgcHJlc2VudCBpbnNpZGUgdGhlIGVudGl0eUNvbnRhaW5lclxuXHRcdC8vIGFuZCB0aGUgYWNpb25zIGl0IHJlZmVycyB0byBwcmVzZW50IG91dHNpZGUgdGhlIGVudGl0eWNvbnRhaW5lciwgaGVuY2UgdG8gb2J0YWluIGtpbmQgb2YgdGhlIGFjdGlvblxuXHRcdC8vIHNwbGl0KCkgb24gaXRzIG5hbWUgd2FzIHJlcXVpcmVkXG5cdFx0Y29uc3Qgc05hbWUgPSBzQWN0aW9uTmFtZS5zcGxpdChcIi9cIilbMV07XG5cdFx0c0FjdGlvbk5hbWUgPSBzTmFtZSB8fCBzQWN0aW9uTmFtZTtcblx0XHRjb250ZXh0VG9Qcm9jZXNzID0gc05hbWUgPyB1bmRlZmluZWQgOiBtUGFyYW1ldGVycy5jb250ZXh0cztcblx0XHQvL2NoZWNraW5nIHdoZXRoZXIgdGhlIGNvbnRleHQgaXMgYW4gYXJyYXkgd2l0aCBtb3JlIHRoYW4gMCBsZW5ndGggb3Igbm90IGFuIGFycmF5KGNyZWF0ZSBhY3Rpb24pXG5cdFx0aWYgKGNvbnRleHRUb1Byb2Nlc3MgJiYgKChBcnJheS5pc0FycmF5KGNvbnRleHRUb1Byb2Nlc3MpICYmIGNvbnRleHRUb1Byb2Nlc3MubGVuZ3RoKSB8fCAhQXJyYXkuaXNBcnJheShjb250ZXh0VG9Qcm9jZXNzKSkpIHtcblx0XHRcdGNvbnRleHRUb1Byb2Nlc3MgPSBBcnJheS5pc0FycmF5KGNvbnRleHRUb1Byb2Nlc3MpID8gY29udGV4dFRvUHJvY2Vzc1swXSA6IGNvbnRleHRUb1Byb2Nlc3M7XG5cdFx0XHRvTW9kZWwgPSBjb250ZXh0VG9Qcm9jZXNzLmdldE1vZGVsKCk7XG5cdFx0fVxuXHRcdGlmIChtUGFyYW1ldGVycy5tb2RlbCkge1xuXHRcdFx0b01vZGVsID0gbVBhcmFtZXRlcnMubW9kZWw7XG5cdFx0fVxuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQYXNzIGEgY29udGV4dCBmb3IgYSBib3VuZCBhY3Rpb24gb3IgcGFzcyB0aGUgbW9kZWwgZm9yIGFuIHVuYm91bmQgYWN0aW9uXCIpO1xuXHRcdH1cblx0XHQvLyBnZXQgdGhlIGJpbmRpbmcgcGFyYW1ldGVycyAkc2VsZWN0IGFuZCAkZXhwYW5kIGZvciB0aGUgc2lkZSBlZmZlY3Qgb24gdGhpcyBhY3Rpb25cblx0XHQvLyBhbHNvIGdhdGhlciBhZGRpdGlvbmFsIHByb3BlcnR5IHBhdGhzIHRvIGJlIHJlcXVlc3RlZCBzdWNoIGFzIHRleHQgYXNzb2NpYXRpb25zXG5cdFx0Y29uc3QgbVNpZGVFZmZlY3RzUGFyYW1ldGVycyA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNBY3Rpb25OYW1lLCBjb250ZXh0VG9Qcm9jZXNzKSB8fCB7fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRsZXQgb1Jlc3VsdDogYW55O1xuXHRcdFx0aWYgKGNvbnRleHRUb1Byb2Nlc3MgJiYgb01vZGVsKSB7XG5cdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCBvcGVyYXRpb25zLmNhbGxCb3VuZEFjdGlvbihzQWN0aW9uTmFtZSwgbVBhcmFtZXRlcnMuY29udGV4dHMsIG9Nb2RlbCwgYXBwQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0cGFyYW1ldGVyVmFsdWVzOiBtUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXMsXG5cdFx0XHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBtUGFyYW1ldGVycy5pbnZvY2F0aW9uR3JvdXBpbmcsXG5cdFx0XHRcdFx0bGFiZWw6IG1QYXJhbWV0ZXJzLmxhYmVsLFxuXHRcdFx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c6IG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2csXG5cdFx0XHRcdFx0bUJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRhZGRpdGlvbmFsU2lkZUVmZmVjdDogbVNpZGVFZmZlY3RzUGFyYW1ldGVycyxcblx0XHRcdFx0XHRvblN1Ym1pdHRlZDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvblJlc3BvbnNlOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBhcmVudENvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0Y29udHJvbElkOiBtUGFyYW1ldGVycy5jb250cm9sSWQsXG5cdFx0XHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQ6IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogbVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwLFxuXHRcdFx0XHRcdGJJc0NyZWF0ZUFjdGlvbjogbVBhcmFtZXRlcnMuYklzQ3JlYXRlQWN0aW9uLFxuXHRcdFx0XHRcdGJHZXRCb3VuZENvbnRleHQ6IG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQsXG5cdFx0XHRcdFx0Yk9iamVjdFBhZ2U6IG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlLFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyOiBtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbixcblx0XHRcdFx0XHRzZWxlY3RlZEl0ZW1zOiBtUGFyYW1ldGVycy5jb250ZXh0c1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCBvcGVyYXRpb25zLmNhbGxBY3Rpb25JbXBvcnQoc0FjdGlvbk5hbWUsIG9Nb2RlbCwgYXBwQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0cGFyYW1ldGVyVmFsdWVzOiBtUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXMsXG5cdFx0XHRcdFx0bGFiZWw6IG1QYXJhbWV0ZXJzLmxhYmVsLFxuXHRcdFx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c6IG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2csXG5cdFx0XHRcdFx0YmluZGluZ1BhcmFtZXRlcnM6IG1CaW5kaW5nUGFyYW1ldGVycyxcblx0XHRcdFx0XHRlbnRpdHlTZXROYW1lOiBtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRcdG9uU3VibWl0dGVkOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvblJlc3BvbnNlOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBhcmVudENvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQ6IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogbVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwLFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyOiBtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRiT2JqZWN0UGFnZTogbVBhcmFtZXRlcnMuYk9iamVjdFBhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZUFjdGlvblJlc3BvbnNlKG1lc3NhZ2VIYW5kbGVyLCBtUGFyYW1ldGVycywgc0FjdGlvbk5hbWUpO1xuXHRcdFx0cmV0dXJuIG9SZXN1bHQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZUFjdGlvblJlc3BvbnNlKG1lc3NhZ2VIYW5kbGVyLCBtUGFyYW1ldGVycywgc0FjdGlvbk5hbWUpO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIG1lc3NhZ2VzIGZvciBhY3Rpb24gY2FsbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyI19oYW5kbGVBY3Rpb25SZXNwb25zZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBQYXJhbWV0ZXJzIHRvIGJlIGNvbnNpZGVyZWQgZm9yIHRoZSBhY3Rpb24uXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIGFmdGVyIG1lc3NhZ2UgZGlhbG9nIGlzIG9wZW5lZCBpZiByZXF1aXJlZC5cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2hhbmRsZUFjdGlvblJlc3BvbnNlKG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnM6IGFueSwgc0FjdGlvbk5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGFUcmFuc2llbnRNZXNzYWdlcyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcyh0cnVlLCB0cnVlKTtcblx0XHRjb25zdCBhY3Rpb25OYW1lID0gbVBhcmFtZXRlcnMubGFiZWwgPyBtUGFyYW1ldGVycy5sYWJlbCA6IHNBY3Rpb25OYW1lO1xuXHRcdGlmIChhVHJhbnNpZW50TWVzc2FnZXMubGVuZ3RoID4gMCAmJiBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzQWN0aW9uTmFtZVwiLCBtUGFyYW1ldGVycy5sYWJlbCA/IG1QYXJhbWV0ZXJzLmxhYmVsIDogc0FjdGlvbk5hbWUpO1xuXHRcdH1cblx0XHRsZXQgY29udHJvbDtcblx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRjb250cm9sID0gbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbC5ieUlkKG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXHRcdH1cblx0XHRyZXR1cm4gbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKHsgc0FjdGlvbk5hbWU6IGFjdGlvbk5hbWUsIGNvbnRyb2w6IGNvbnRyb2wgfSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB2YWxpZGF0aW9uIGVycm9ycyBmb3IgdGhlICdEaXNjYXJkJyBhY3Rpb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlciNoYW5kbGVWYWxpZGF0aW9uRXJyb3Jcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0aGFuZGxlVmFsaWRhdGlvbkVycm9yKCkge1xuXHRcdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKSxcblx0XHRcdGVycm9yVG9SZW1vdmUgPSBvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdC5nZXREYXRhKClcblx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdC8vIG9ubHkgbmVlZHMgdG8gaGFuZGxlIHZhbGlkYXRpb24gbWVzc2FnZXMsIHRlY2huaWNhbCBhbmQgcGVyc2lzdGVudCBlcnJvcnMgbmVlZHMgbm90IHRvIGJlIGNoZWNrZWQgaGVyZS5cblx0XHRcdFx0XHRpZiAoZXJyb3IudmFsaWRhdGlvbikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGVycm9yVG9SZW1vdmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgUG9wb3Zlci4gRmFjdG9yeSBtZXRob2QgdG8gbWFrZSB1bml0IHRlc3RzIGVhc2llci5cblx0ICpcblx0ICogQHBhcmFtIHNldHRpbmdzIEluaXRpYWwgcGFyYW1ldGVycyBmb3IgdGhlIHBvcG92ZXJcblx0ICogQHJldHVybnMgQSBuZXcgUG9wb3ZlclxuXHQgKi9cblx0X2NyZWF0ZVBvcG92ZXIoc2V0dGluZ3M/OiAkUG9wb3ZlclNldHRpbmdzKTogUG9wb3ZlciB7XG5cdFx0cmV0dXJuIG5ldyBQb3BvdmVyKHNldHRpbmdzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyBhIHBvcG92ZXIgdG8gY29uZmlybSBkaXNjYXJkIGlmIG5lZWRlZC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fc2hvd0Rpc2NhcmRQb3BvdmVyXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gY2FuY2VsQnV0dG9uIFRoZSBjb250cm9sIHdoaWNoIHdpbGwgb3BlbiB0aGUgcG9wb3ZlclxuXHQgKiBAcGFyYW0gaXNNb2RpZmllZCBUcnVlIGlmIHRoZSBvYmplY3QgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGEgY29uZmlybWF0aW9uIHBvcG92ZXIgbXVzdCBiZSBzaG93blxuXHQgKiBAcGFyYW0gcmVzb3VyY2VNb2RlbCBUaGUgbW9kZWwgdG8gbG9hZCB0ZXh0IHJlc291cmNlc1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIGlmIHVzZXIgY29uZmlybXMgZGlzY2FyZCwgcmVqZWN0cyBpZiBvdGhlcndpc2UsIHJlamVjdHMgaWYgbm8gY29udHJvbCBwYXNzZWQgdG8gb3BlbiBwb3BvdmVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9jb25maXJtRGlzY2FyZChjYW5jZWxCdXR0b246IEJ1dHRvbiwgaXNNb2RpZmllZDogYm9vbGVhbiwgcmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIElmIHRoZSBkYXRhIGlzbid0IG1vZGlmaWVkLCBkbyBub3Qgc2hvdyBhbnkgY29uZmlybWF0aW9uIHBvcG92ZXJcblx0XHRpZiAoIWlzTW9kaWZpZWQpIHtcblx0XHRcdHRoaXMuaGFuZGxlVmFsaWRhdGlvbkVycm9yKCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0Y2FuY2VsQnV0dG9uLnNldEVuYWJsZWQoZmFsc2UpO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBjb25maXJtYXRpb25Qb3BvdmVyID0gdGhpcy5fY3JlYXRlUG9wb3Zlcih7XG5cdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IFwiVG9wXCJcblx0XHRcdH0pO1xuXHRcdFx0Y29uZmlybWF0aW9uUG9wb3Zlci5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBjb250ZW50IG9mIHRoZSBwb3BvdmVyXG5cdFx0XHRjb25zdCB0aXRsZSA9IG5ldyBUZXh0KHtcblx0XHRcdFx0dGV4dDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfRFJBRlRfRElTQ0FSRF9NRVNTQUdFXCIpXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGNvbmZpcm1CdXR0b24gPSBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfRFJBRlRfRElTQ0FSRF9CVVRUT05cIiksXG5cdFx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmhhbmRsZVZhbGlkYXRpb25FcnJvcigpO1xuXHRcdFx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuZGF0YShcImNvbnRpbnVlRGlzY2FyZFwiLCB0cnVlKTtcblx0XHRcdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5OiBbdGl0bGVdXG5cdFx0XHR9KTtcblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuYWRkQ29udGVudChuZXcgVkJveCh7IGl0ZW1zOiBbdGl0bGUsIGNvbmZpcm1CdXR0b25dIH0pKTtcblxuXHRcdFx0Ly8gQXR0YWNoIGhhbmRsZXJcblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuYXR0YWNoQmVmb3JlT3BlbigoKSA9PiB7XG5cdFx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuc2V0SW5pdGlhbEZvY3VzKGNvbmZpcm1CdXR0b24pO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmF0dGFjaEFmdGVyQ2xvc2UoKCkgPT4ge1xuXHRcdFx0XHRjYW5jZWxCdXR0b24uc2V0RW5hYmxlZCh0cnVlKTtcblx0XHRcdFx0aWYgKGNvbmZpcm1hdGlvblBvcG92ZXIuZGF0YShcImNvbnRpbnVlRGlzY2FyZFwiKSkge1xuXHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIub3BlbkJ5KGNhbmNlbEJ1dHRvbiwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9XG5cblx0X29uRmllbGRDaGFuZ2Uob0V2ZW50OiBhbnksIG9DcmVhdGVCdXR0b246IGFueSwgbWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLCBmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzOiBGdW5jdGlvbikge1xuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdGNvbnN0IG9GaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvRmllbGRQcm9taXNlID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInByb21pc2VcIik7XG5cdFx0aWYgKG9GaWVsZFByb21pc2UpIHtcblx0XHRcdHJldHVybiBvRmllbGRQcm9taXNlXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh2YWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0Ly8gU2V0dGluZyB2YWx1ZSBvZiBmaWVsZCBhcyAnJyBpbiBjYXNlIG9mIHZhbHVlIGhlbHAgYW5kIHZhbGlkYXRpbmcgb3RoZXIgZmllbGRzXG5cdFx0XHRcdFx0b0ZpZWxkLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHRmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFZhbHVlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0Ly9kaXNhYmxpbmcgdGhlIGNvbnRpbnVlIGJ1dHRvbiBpbiBjYXNlIG9mIGludmFsaWQgdmFsdWUgaW4gZmllbGRcblx0XHRcdFx0XHRcdG9DcmVhdGVCdXR0b24uc2V0RW5hYmxlZChmYWxzZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIHZhbGlkYXRpbmcgYWxsIHRoZSBmaWVsZHMgaW4gY2FzZSBvZiBlbXB0eSB2YWx1ZSBpbiBmaWVsZFxuXHRcdFx0XHRcdFx0b0ZpZWxkLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHRcdGZuVmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRtRmllbGRzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCkge1xuXHRcdGxldCBvRGlhbG9nOiBEaWFsb2c7XG5cdFx0Y29uc3Qgb1BhcmVudENvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXG5cdFx0Ly8gQ3JhdGUgYSBmYWtlICh0cmFuc2llbnQpIGxpc3RCaW5kaW5nIGFuZCBjb250ZXh0LCBqdXN0IGZvciB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBkaWFsb2dcblx0XHRjb25zdCBvVHJhbnNpZW50TGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3Qob0xpc3RCaW5kaW5nLmdldFBhdGgoKSwgb0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSwgW10sIFtdLCB7XG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdH0pO1xuXHRcdG9UcmFuc2llbnRMaXN0QmluZGluZy5yZWZyZXNoSW50ZXJuYWwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvKiAqL1xuXHRcdH07XG5cdFx0Y29uc3Qgb1RyYW5zaWVudENvbnRleHQgPSBvVHJhbnNpZW50TGlzdEJpbmRpbmcuY3JlYXRlKG1QYXJhbWV0ZXJzLmRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL05vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkc0RpYWxvZ1wiO1xuXHRcdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHRcdHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKSxcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0YUltbXV0YWJsZUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdFx0c1BhdGggPSAob0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSA/IG9MaXN0QmluZGluZy5nZXRSZXNvbHZlZFBhdGgoKSA6IG9MaXN0QmluZGluZy5nZXRQYXRoKCkpIGFzIHN0cmluZyxcblx0XHRcdFx0b0VudGl0eVNldENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKSBhcyBDb250ZXh0LFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRcdGZvciAoY29uc3QgaSBpbiBtRmllbGRzKSB7XG5cdFx0XHRcdGFJbW11dGFibGVGaWVsZHMucHVzaChvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NNZXRhUGF0aH0vJHttRmllbGRzW2ldfWApKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9JbW11dGFibGVDdHhNb2RlbCA9IG5ldyBKU09OTW9kZWwoYUltbXV0YWJsZUZpZWxkcyk7XG5cdFx0XHRjb25zdCBvSW1tdXRhYmxlQ3R4ID0gb0ltbXV0YWJsZUN0eE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRcdGNvbnN0IGFSZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zKHNNZXRhUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0XHRjb25zdCBvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4TW9kZWwgPSBuZXcgSlNPTk1vZGVsKGFSZXF1aXJlZFByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3Qgb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eCA9IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0XHRjb25zdCBvTmV3RnJhZ21lbnQgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2Vzcyhcblx0XHRcdFx0b0ZyYWdtZW50LFxuXHRcdFx0XHR7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdGZpZWxkczogb0ltbXV0YWJsZUN0eCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9FbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRmaWVsZHM6IG9JbW11dGFibGVDdHguZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXG5cdFx0XHRsZXQgYUZvcm1FbGVtZW50czogYW55W10gPSBbXTtcblx0XHRcdGNvbnN0IG1GaWVsZFZhbHVlTWFwOiBhbnkgPSB7fTtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3Rcblx0XHRcdGxldCBvQ3JlYXRlQnV0dG9uOiBCdXR0b247XG5cblx0XHRcdGNvbnN0IHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRsZXQgYkVuYWJsZWQgPSBmYWxzZTtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBhUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0YUZvcm1FbGVtZW50c1xuXHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChvRm9ybUVsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRm9ybUVsZW1lbnQuZ2V0RmllbGRzKClbMF07XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9GaWVsZDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVGhlIGNvbnRpbnVlIGJ1dHRvbiBzaG91bGQgcmVtYWluIGRpc2FibGVkIGluIGNhc2Ugb2YgZW1wdHkgcmVxdWlyZWQgZmllbGRzLlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRmllbGQuZ2V0UmVxdWlyZWQoKSB8fCBvRmllbGQuZ2V0VmFsdWVTdGF0ZSgpID09PSBWYWx1ZVN0YXRlLkVycm9yO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQubWFwKGFzeW5jIGZ1bmN0aW9uIChvRmllbGQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNGaWVsZElkID0gb0ZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNGaWVsZElkIGluIG1GaWVsZFZhbHVlTWFwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB2VmFsdWUgPSBhd2FpdCBtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRmllbGQuZ2V0VmFsdWUoKSA9PT0gXCJcIiA/IHVuZGVmaW5lZCA6IHZWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFZhbHVlKCkgPT09IFwiXCIgPyB1bmRlZmluZWQgOiBvRmllbGQuZ2V0VmFsdWUoKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJFbmFibGVkID0gYVJlc3VsdHMuZXZlcnkoZnVuY3Rpb24gKHZWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2VmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdHZWYWx1ZSA9IHZWYWx1ZVswXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB2VmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2VmFsdWUgIT09IG51bGwgJiYgdlZhbHVlICE9PSBcIlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRiRW5hYmxlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9DcmVhdGVCdXR0b24uc2V0RW5hYmxlZChiRW5hYmxlZCk7XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0XHRmaXJlZCBvbiBmb2N1cyBvdXQgZnJvbSBmaWVsZCBvciBvbiBzZWxlY3RpbmcgYSB2YWx1ZSBmcm9tIHRoZSB2YWx1ZWhlbHAuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGUgY3JlYXRlIGJ1dHRvbiBpcyBlbmFibGVkIHdoZW4gYSB2YWx1ZSBpcyBhZGRlZC5cblx0XHRcdFx0XHRcdFx0XHRcdGxpdmVDaGFuZ2UgaXMgbm90IGZpcmVkIHdoZW4gdmFsdWUgaXMgYWRkZWQgZnJvbSB2YWx1ZWhlbHAuXG5cdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZSB2YWxpZGF0aW9uIGlzIG5vdCBkb25lIGZvciBjcmVhdGUgYnV0dG9uIGVuYWJsZW1lbnQuXG5cdFx0XHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0aGFuZGxlQ2hhbmdlOiAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzRmllbGRJZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpZFwiKTtcblx0XHRcdFx0XHRtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF0gPSB0aGlzLl9vbkZpZWxkQ2hhbmdlKG9FdmVudCwgb0NyZWF0ZUJ1dHRvbiwgbWVzc2FnZUhhbmRsZXIsIHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRcdGZpcmVkIG9uIGtleSBwcmVzcy4gdGhlIGNyZWF0ZSBidXR0b24gaXMgZW5hYmxlZCB3aGVuIGEgdmFsdWUgaXMgYWRkZWQuXG5cdFx0XHRcdFx0XHRcdFx0XHRsaXZlQ2hhbmdlIGlzIG5vdCBmaXJlZCB3aGVuIHZhbHVlIGlzIGFkZGVkIGZyb20gdmFsdWVoZWxwLlxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWUgdmFsaWRhdGlvbiBpcyBub3QgZG9uZSBmb3IgY3JlYXRlIGJ1dHRvbiBlbmFibGVtZW50LlxuXHRcdFx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdGhhbmRsZUxpdmVDaGFuZ2U6IChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNGaWVsZElkID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImlkXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHZWYWx1ZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0XHRtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF0gPSB2VmFsdWU7XG5cdFx0XHRcdFx0dmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3Qgb0RpYWxvZ0NvbnRlbnQ6IGFueSA9IGF3YWl0IEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0XHRkZWZpbml0aW9uOiBvTmV3RnJhZ21lbnQsXG5cdFx0XHRcdGNvbnRyb2xsZXI6IG9Db250cm9sbGVyXG5cdFx0XHR9KTtcblx0XHRcdGxldCBvUmVzdWx0OiBhbnk7XG5cdFx0XHRjb25zdCBjbG9zZURpYWxvZyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly9yZWplY3RlZC9yZXNvbHZlZCB0aGUgcHJvbWlzIHJldHVybmVkIGJ5IF9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzXG5cdFx0XHRcdC8vYXMgc29vbiBhcyB0aGUgZGlhbG9nIGlzIGNsb3NlZC4gV2l0aG91dCB3YWl0aW5nIGZvciB0aGUgZGlhbG9nJ3Ncblx0XHRcdFx0Ly9hbmltYXRpb24gdG8gZmluaXNoXG5cdFx0XHRcdGlmIChvUmVzdWx0LmVycm9yKSB7XG5cdFx0XHRcdFx0cmVqZWN0KG9SZXN1bHQuZXJyb3IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc29sdmUob1Jlc3VsdC5yZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0fTtcblxuXHRcdFx0b0RpYWxvZyA9IG5ldyBEaWFsb2coZ2VuZXJhdGUoW1wiQ3JlYXRlRGlhbG9nXCIsIHNNZXRhUGF0aF0pLCB7XG5cdFx0XHRcdHRpdGxlOiByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9TQVBGRV9BQ1RJT05fQ1JFQVRFXCIpLFxuXHRcdFx0XHRjb250ZW50OiBbb0RpYWxvZ0NvbnRlbnRdLFxuXHRcdFx0XHRiZWdpbkJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVfQlVUVE9OXCIpLFxuXHRcdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRcdHByZXNzOiBhc3luYyAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGNyZWF0ZUJ1dHRvbiA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdFx0XHRcdGNyZWF0ZUJ1dHRvbi5zZXRFbmFibGVkKGZhbHNlKTtcblx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIubG9jayhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJJc0NyZWF0ZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMobUZpZWxkVmFsdWVNYXApLm1hcChhc3luYyBmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvVmFsdWUgPSBhd2FpdCBtRmllbGRWYWx1ZU1hcFtzS2V5XTtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2dWYWx1ZTogYW55ID0ge307XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nVmFsdWVbc0tleV0gPSBvVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0RpYWxvZ1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRvRVM2UHJvbWlzZShcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9MaXN0QmluZGluZyAmJiBvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzOiBhVmFsdWVzXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y29uc3QgdHJhbnNpZW50RGF0YSA9IG9UcmFuc2llbnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjcmVhdGVEYXRhOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXModHJhbnNpZW50RGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdFx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRjcmVhdGVEYXRhW3NQcm9wZXJ0eVBhdGhdID0gdHJhbnNpZW50RGF0YVtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9OZXdEb2N1bWVudENvbnRleHQgPSBvTGlzdEJpbmRpbmcuY3JlYXRlKFxuXHRcdFx0XHRcdFx0XHRcdGNyZWF0ZURhdGEsXG5cdFx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbmFjdGl2ZVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9taXNlID0gdGhpcy5vbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTGlzdEJpbmRpbmcsIG9OZXdEb2N1bWVudENvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdFx0bGV0IG9SZXNwb25zZTogYW55ID0gYXdhaXQgb1Byb21pc2U7XG5cdFx0XHRcdFx0XHRcdGlmICghb1Jlc3BvbnNlIHx8IChvUmVzcG9uc2UgJiYgb1Jlc3BvbnNlLmJLZWVwRGlhbG9nT3BlbiAhPT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRvUmVzcG9uc2UgPSBvUmVzcG9uc2UgPz8ge307XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSk7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3BvbnNlLm5ld0NvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdFx0XHRcdG9SZXN1bHQgPSB7IHJlc3BvbnNlOiBvUmVzcG9uc2UgfTtcblx0XHRcdFx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBpbiBjYXNlIG9mIGNyZWF0aW9uIGZhaWxlZCwgZGlhbG9nIHNob3VsZCBzdGF5IG9wZW4gLSB0byBhY2hpZXZlIHRoZSBzYW1lLCBub3RoaW5nIGhhcyB0byBiZSBkb25lIChsaWtlIGluIGNhc2Ugb2Ygc3VjY2VzcyB3aXRoIGJLZWVwRGlhbG9nT3Blbilcblx0XHRcdFx0XHRcdFx0aWYgKG9FcnJvciAhPT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5DcmVhdGlvbkZhaWxlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG90aGVyIGVycm9ycyBhcmUgbm90IGV4cGVjdGVkXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IG9FcnJvciB9O1xuXHRcdFx0XHRcdFx0XHRcdGNsb3NlRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3JlYXRlQnV0dG9uLnNldEVuYWJsZWQodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZEJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0FDVElPTl9QQVJBTUVURVJfRElBTE9HX0NBTkNFTFwiKSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IEZFTGlicmFyeS5Db25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nIH07XG5cdFx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIHNob3cgZm9vdGVyIGFzIHBlciBVWCBndWlkZWxpbmVzIHdoZW4gZGlhbG9nIGlzIG5vdCBvcGVuXG5cdFx0XHRcdFx0KG9EaWFsb2cuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwiaXNDcmVhdGVEaWFsb2dPcGVuXCIsIGZhbHNlKTtcblx0XHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRvVHJhbnNpZW50TGlzdEJpbmRpbmcuZGVzdHJveSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGFzIGFueSk7XG5cdFx0XHRhRm9ybUVsZW1lbnRzID0gb0RpYWxvZ0NvbnRlbnQ/LmdldEFnZ3JlZ2F0aW9uKFwiZm9ybVwiKS5nZXRBZ2dyZWdhdGlvbihcImZvcm1Db250YWluZXJzXCIpWzBdLmdldEFnZ3JlZ2F0aW9uKFwiZm9ybUVsZW1lbnRzXCIpO1xuXHRcdFx0aWYgKG9QYXJlbnRDb250cm9sICYmIG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudCkge1xuXHRcdFx0XHQvLyBpZiB0aGVyZSBpcyBhIHBhcmVudCBjb250cm9sIHNwZWNpZmllZCBhZGQgdGhlIGRpYWxvZyBhcyBkZXBlbmRlbnRcblx0XHRcdFx0b1BhcmVudENvbnRyb2wuYWRkRGVwZW5kZW50KG9EaWFsb2cpO1xuXHRcdFx0fVxuXHRcdFx0b0NyZWF0ZUJ1dHRvbiA9IG9EaWFsb2cuZ2V0QmVnaW5CdXR0b24oKTtcblx0XHRcdG9EaWFsb2cuc2V0QmluZGluZ0NvbnRleHQob1RyYW5zaWVudENvbnRleHQpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgQ29tbW9uVXRpbHMuc2V0VXNlckRlZmF1bHRzKFxuXHRcdFx0XHRcdGFwcENvbXBvbmVudCxcblx0XHRcdFx0XHRhSW1tdXRhYmxlRmllbGRzLFxuXHRcdFx0XHRcdG9UcmFuc2llbnRDb250ZXh0LFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0ZUFjdGlvbixcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKCk7XG5cdFx0XHRcdC8vIGZvb3RlciBtdXN0IG5vdCBiZSB2aXNpYmxlIHdoZW4gdGhlIGRpYWxvZyBpcyBvcGVuIGFzIHBlciBVWCBndWlkZWxpbmVzXG5cdFx0XHRcdChvRGlhbG9nLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLnNldFByb3BlcnR5KFwiaXNDcmVhdGVEaWFsb2dPcGVuXCIsIHRydWUpO1xuXHRcdFx0XHRvRGlhbG9nLm9wZW4oKTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRvbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTGlzdEJpbmRpbmc6IGFueSwgb05ld0RvY3VtZW50Q29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bGV0IGZuUmVzb2x2ZTogRnVuY3Rpb247XG5cdFx0Y29uc3Qgb1Byb21pc2UgPSBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Zm5SZXNvbHZlID0gcmVzb2x2ZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGZuQ3JlYXRlQ29tcGxldGVkID0gKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb250ZXh0XCIpLFxuXHRcdFx0XHRiU3VjY2VzcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWNjZXNzXCIpO1xuXHRcdFx0aWYgKG9Db250ZXh0ID09PSBvTmV3RG9jdW1lbnRDb250ZXh0KSB7XG5cdFx0XHRcdG9MaXN0QmluZGluZy5kZXRhY2hDcmVhdGVDb21wbGV0ZWQoZm5DcmVhdGVDb21wbGV0ZWQsIHRoaXMpO1xuXHRcdFx0XHRmblJlc29sdmUoYlN1Y2Nlc3MpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3QgZm5TYWZlQ29udGV4dENyZWF0ZWQgPSAoKSA9PiB7XG5cdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0XG5cdFx0XHRcdC5jcmVhdGVkKClcblx0XHRcdFx0LnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGNyZWF0aW9uIGNvbnRleHQgZGVsZXRlZFwiKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChjb250ZXh0RXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy50cmFjZShcInRyYW5zaWVudCBjcmVhdGlvbiBjb250ZXh0IGRlbGV0aW9uIGVycm9yXCIsIGNvbnRleHRFcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRvTGlzdEJpbmRpbmcuYXR0YWNoQ3JlYXRlQ29tcGxldGVkKGZuQ3JlYXRlQ29tcGxldGVkLCB0aGlzKTtcblxuXHRcdHJldHVybiBvUHJvbWlzZS50aGVuKChiU3VjY2VzczogYm9vbGVhbikgPT4ge1xuXHRcdFx0aWYgKCFiU3VjY2Vzcykge1xuXHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQpIHtcblx0XHRcdFx0XHQvLyBDYW5jZWwgdGhlIHBlbmRpbmcgUE9TVCBhbmQgZGVsZXRlIHRoZSBjb250ZXh0IGluIHRoZSBsaXN0QmluZGluZ1xuXHRcdFx0XHRcdGZuU2FmZUNvbnRleHRDcmVhdGVkKCk7IC8vIFRvIGF2b2lkIGEgJ3JlcXVlc3QgY2FuY2VsbGVkJyBlcnJvciBpbiB0aGUgY29uc29sZVxuXHRcdFx0XHRcdG9MaXN0QmluZGluZy5yZXNldENoYW5nZXMoKTtcblx0XHRcdFx0XHRvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKS5yZXNldENoYW5nZXMob0xpc3RCaW5kaW5nLmdldFVwZGF0ZUdyb3VwSWQoKSk7XG5cblx0XHRcdFx0XHR0aHJvdyBGRUxpYnJhcnkuQ29uc3RhbnRzLkNyZWF0aW9uRmFpbGVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB7IGJLZWVwRGlhbG9nT3BlbjogdHJ1ZSB9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9OZXdEb2N1bWVudENvbnRleHQuY3JlYXRlZCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgTmV3QWN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fZ2V0TmV3QWN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFN0YXJ0dXAgcGFyYW1ldGVycyBvZiB0aGUgYXBwbGljYXRpb25cblx0ICogQHBhcmFtIHNDcmVhdGVIYXNoIEhhc2ggdG8gYmUgY2hlY2tlZCBmb3IgYWN0aW9uIHR5cGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE1ldGFNb2RlbCB1c2VkIHRvIGNoZWNrIGZvciBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2dldE5ld0FjdGlvbihvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgc0NyZWF0ZUhhc2g6IHN0cmluZywgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNNZXRhUGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IHNOZXdBY3Rpb247XG5cblx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlICYmIHNDcmVhdGVIYXNoLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIkktQUNUSU9OPUNSRUFURVdJVEhcIikgPiAtMSkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJDUkVBVEVXSVRIOlwiKSA+IC0xXG5cdFx0XHRcdFx0PyBzUHJlZmVycmVkTW9kZS5zdWJzdHIoc1ByZWZlcnJlZE1vZGUubGFzdEluZGV4T2YoXCI6XCIpICsgMSlcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZSAmJlxuXHRcdFx0c0NyZWF0ZUhhc2gudG9VcHBlckNhc2UoKS5pbmRleE9mKFwiSS1BQ1RJT049QVVUT0NSRUFURVdJVEhcIikgPiAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFV0lUSDpcIikgPiAtMVxuXHRcdFx0XHRcdD8gc1ByZWZlcnJlZE1vZGUuc3Vic3RyKHNQcmVmZXJyZWRNb2RlLmxhc3RJbmRleE9mKFwiOlwiKSArIDEpXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0ICE9PSB1bmRlZmluZWRcblx0XHRcdFx0XHQ/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL05ld0FjdGlvbmApIHx8XG5cdFx0XHRcdFx0ICBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvTmV3QWN0aW9uYClcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHNOZXdBY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBsYWJlbCBmb3IgdGhlIHRpdGxlIG9mIGEgc3BlY2lmaWMgY3JlYXRlIGFjdGlvbiBkaWFsb2csIGUuZy4gQ3JlYXRlIFNhbGVzIE9yZGVyIGZyb20gUXVvdGF0aW9uLlxuXHQgKlxuXHQgKiBUaGUgZm9sbG93aW5nIHByaW9yaXR5IGlzIGFwcGxpZWQ6XG5cdCAqIDEuIGxhYmVsIG9mIGxpbmUtaXRlbSBhbm5vdGF0aW9uLlxuXHQgKiAyLiBsYWJlbCBhbm5vdGF0ZWQgaW4gdGhlIGFjdGlvbi5cblx0ICogMy4gXCJDcmVhdGVcIiBhcyBhIGNvbnN0YW50IGZyb20gaTE4bi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuX2dldFNwZWNpZmljQ3JlYXRlQWN0aW9uRGlhbG9nTGFiZWxcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBNZXRhTW9kZWwgdXNlZCB0byBjaGVjayBmb3IgdGhlIE5ld0FjdGlvbiBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIHNNZXRhUGF0aCBUaGUgTWV0YVBhdGhcblx0ICogQHBhcmFtIHNOZXdBY3Rpb24gQ29udGFpbnMgdGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBleGVjdXRlZFxuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlQ29yZSBSZXNvdXJjZUJ1bmRsZSB0byBhY2Nlc3MgdGhlIGRlZmF1bHQgQ3JlYXRlIGxhYmVsXG5cdCAqIEByZXR1cm5zIFRoZSBsYWJlbCBmb3IgdGhlIENyZWF0ZSBBY3Rpb24gRGlhbG9nXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsKFxuXHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRcdHNNZXRhUGF0aDogc3RyaW5nLFxuXHRcdHNOZXdBY3Rpb246IHN0cmluZyxcblx0XHRvUmVzb3VyY2VCdW5kbGVDb3JlOiBSZXNvdXJjZUJ1bmRsZVxuXHQpIHtcblx0XHRjb25zdCBmbkdldExhYmVsRnJvbUxpbmVJdGVtQW5ub3RhdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtYCkpIHtcblx0XHRcdFx0Y29uc3QgaUxpbmVJdGVtSW5kZXggPSBvTWV0YU1vZGVsXG5cdFx0XHRcdFx0LmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApXG5cdFx0XHRcdFx0LmZpbmRJbmRleChmdW5jdGlvbiAob0xpbmVJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFMaW5lSXRlbUFjdGlvbiA9IG9MaW5lSXRlbS5BY3Rpb24gPyBvTGluZUl0ZW0uQWN0aW9uLnNwbGl0KFwiKFwiKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdHJldHVybiBhTGluZUl0ZW1BY3Rpb24gPyBhTGluZUl0ZW1BY3Rpb25bMF0gPT09IHNOZXdBY3Rpb24gOiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGlMaW5lSXRlbUluZGV4ID4gLTFcblx0XHRcdFx0XHQ/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtYClbaUxpbmVJdGVtSW5kZXhdLkxhYmVsXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0Zm5HZXRMYWJlbEZyb21MaW5lSXRlbUFubm90YXRpb24oKSB8fFxuXHRcdFx0KG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS8ke3NOZXdBY3Rpb259QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApKSB8fFxuXHRcdFx0KG9SZXNvdXJjZUJ1bmRsZUNvcmUgJiYgb1Jlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURVwiKSlcblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IHNpbmdsZXRvbiA9IG5ldyBUcmFuc2FjdGlvbkhlbHBlcigpO1xuZXhwb3J0IGRlZmF1bHQgc2luZ2xldG9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQXlDQSxNQUFNQSxZQUFZLEdBQUdDLFNBQVMsQ0FBQ0QsWUFBWTtFQUMzQyxNQUFNRSxnQkFB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