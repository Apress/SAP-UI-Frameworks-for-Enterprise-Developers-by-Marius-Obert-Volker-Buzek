/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/Text", "sap/ui/core/Core", "../../operationsHelper", "./draftDataLossPopup"], function (Log, CommonUtils, messageHandling, ResourceModelHelper, Button, Dialog, MessageBox, Text, Core, operationsHelper, draftDataLossPopup) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  /**
   * Interface for callbacks used in the functions
   *
   *
   * @author SAP SE
   * @since 1.54.0
   * @interface
   * @name sap.fe.core.actions.draft.ICallback
   * @private
   */

  /**
   * Callback to approve or reject the creation of a draft
   *
   * @name sap.fe.core.actions.draft.ICallback.beforeCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval of draft creation [true|false] or Promise that resolves with the boolean value
   * @private
   */

  /**
   * Callback after a draft was successully created
   *
   * @name sap.fe.core.actions.draft.ICallback.afterCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the new draft
   * @param {sap.ui.model.odata.v4.Context} oActiveDocumentContext Context of the active document for the new draft
   * @returns {sap.ui.model.odata.v4.Context} oActiveDocumentContext
   * @private
   */

  /**
   * Callback to approve or reject overwriting an unsaved draft of another user
   *
   * @name sap.fe.core.actions.draft.ICallback.whenDecisionToOverwriteDocumentIsRequired
   * @function
   * @public
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval to overwrite unsaved draft [true|false] or Promise that resolves with the boolean value
   * @ui5-restricted
   */
  /* Constants for draft operations */
  const draftOperations = {
    EDIT: "EditAction",
    ACTIVATION: "ActivationAction",
    DISCARD: "DiscardAction",
    PREPARE: "PreparationAction"
  };

  /**
   * Static functions for the draft programming model
   *
   * @namespace
   * @alias sap.fe.core.actions.draft
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.54.0
   */

  /**
   * Determines the action name for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The name of the draft operation
   */
  function getActionName(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}`);
  }
  /**
   * Creates an operation context binding for the given context and operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation (action or function import)
   * @param oOptions Options to create the operation context
   * @returns The context binding of the bound operation
   */
  function createOperation(oContext, sOperation, oOptions) {
    const sOperationName = getActionName(oContext, sOperation);
    return oContext.getModel().bindContext(`${sOperationName}(...)`, oContext, oOptions);
  }
  /**
   * Determines the return type for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The return type of the draft operation
   */
  function getReturnType(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}/$ReturnType`);
  }
  /**
   * Check if optional draft prepare action exists.
   *
   * @param oContext The context that should be bound to the operation
   * @returns True if a a prepare action exists
   */
  function hasPrepareAction(oContext) {
    return !!getActionName(oContext, draftOperations.PREPARE);
  }
  /**
   * Creates a new draft from an active document.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param bPreserveChanges If true - existing changes from another user that are not locked are preserved and an error is sent from the backend, otherwise false - existing changes from another user that are not locked are overwritten</li>
   * @param oView If true - existing changes from another
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftEditAction(oContext, bPreserveChanges, oView) {
    if (oContext.getProperty("IsActiveEntity")) {
      const oOptions = {
        $$inheritExpandSelect: true
      };
      const oOperation = createOperation(oContext, draftOperations.EDIT, oOptions);
      oOperation.setParameter("PreserveChanges", bPreserveChanges);
      const sGroupId = "direct";
      const resourceModel = getResourceModel(oView);
      const sActionName = resourceModel.getText("C_COMMON_OBJECT_PAGE_EDIT");
      //If the context is coming from a list binding we pass the flag true to replace the context by the active one
      const oEditPromise = oOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, resourceModel, null, null, null, undefined, undefined), oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      oOperation.getModel().submitBatch(sGroupId);
      return await oEditPromise;
    } else {
      throw new Error("You cannot edit this draft document");
    }
  }

  /**
   * Executes the validation of the draft. The PrepareAction is triggered if the messages are annotated and entitySet gets a PreparationAction annotated.
   * If the operation succeeds and operation doesn't get a return type (RAP system) the messages are requested.
   *
   * @function
   * @param context Context for which the PrepareAction should be performed
   * @param appComponent The AppComponent
   * @param ignoreETag If set to true, ETags are ignored when executing the action
   * @returns Resolve function returns
   *  - the context of the operation if the action has been successfully executed
   *  - void if the action has failed
   *  - undefined if the action has not been triggered since the prerequisites are not met
   * @private
   * @ui5-restricted
   */
  async function executeDraftValidation(context, appComponent, ignoreETag) {
    if (draft.getMessagesPath(context) && draft.hasPrepareAction(context)) {
      try {
        const operation = await draft.executeDraftPreparationAction(context, context.getUpdateGroupId(), true, ignoreETag);
        // if there is no returned operation by executeDraftPreparationAction -> the action has failed
        if (operation && !getReturnType(context, draftOperations.PREPARE)) {
          requestMessages(context, appComponent.getSideEffectsService());
        }
        return operation;
      } catch (error) {
        Log.error("Error while requesting messages", error);
      }
    }
    return undefined;
  }

  /**
   * Activates a draft document. The draft will replace the sibling entity and will be deleted by the back end.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent The AppComponent
   * @param [sGroupId] The optional batch group in which the operation is to be executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftActivationAction(oContext, oAppComponent, sGroupId) {
    const bHasPrepareAction = hasPrepareAction(oContext);

    // According to the draft spec if the service contains a prepare action and we trigger both prepare and
    // activate in one $batch the activate action is called with iF-Match=*
    const bIgnoreEtag = bHasPrepareAction;
    if (!oContext.getProperty("IsActiveEntity")) {
      const oOperation = createOperation(oContext, draftOperations.ACTIVATION, {
        $$inheritExpandSelect: true
      });
      const resourceModel = getResourceModel(oAppComponent);
      const sActionName = resourceModel.getText("C_OP_OBJECT_PAGE_SAVE");
      try {
        return await oOperation.execute(sGroupId, bIgnoreEtag, sGroupId ? operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
          label: sActionName,
          model: oContext.getModel()
        }, resourceModel, null, null, null, undefined, undefined) : undefined, oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      } catch (e) {
        if (bHasPrepareAction) {
          const actionName = getActionName(oContext, draftOperations.PREPARE),
            oSideEffectsService = oAppComponent.getSideEffectsService(),
            oBindingParameters = oSideEffectsService.getODataActionSideEffects(actionName, oContext),
            aTargetPaths = oBindingParameters && oBindingParameters.pathExpressions;
          if (aTargetPaths && aTargetPaths.length > 0) {
            try {
              await oSideEffectsService.requestSideEffects(aTargetPaths, oContext);
            } catch (oError) {
              Log.error("Error while requesting side effects", oError);
            }
          } else {
            try {
              await requestMessages(oContext, oSideEffectsService);
            } catch (oError) {
              Log.error("Error while requesting messages", oError);
            }
          }
        }
        throw e;
      }
    } else {
      throw new Error("The activation action cannot be executed on an active document");
    }
  }

  /**
   * Gets the supported message property path on the PrepareAction for a context.
   *
   * @function
   * @param oContext Context to be checked
   * @returns Path to the message
   * @private
   * @ui5-restricted
   */
  function getMessagePathForPrepare(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    const sContextPath = oMetaModel.getMetaPath(oContext.getPath());
    const oReturnType = getReturnType(oContext, draftOperations.PREPARE);
    // If there is no return parameter, it is not possible to request Messages.
    // RAP draft prepare has no return parameter
    return oReturnType ? oMetaModel.getObject(`${sContextPath}/@${"com.sap.vocabularies.Common.v1.Messages"}/$Path`) : null;
  }

  /**
   * Execute a preparation action.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param groupId The optional batch group in which we want to execute the operation
   * @param bMessages If set to true, the PREPARE action retrieves SAP_Messages
   * @param ignoreETag If set to true, ETag information is ignored when the action is executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  function executeDraftPreparationAction(oContext, groupId, bMessages, ignoreETag) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const sMessagesPath = bMessages ? getMessagePathForPrepare(oContext) : null;
      const oOperation = createOperation(oContext, draftOperations.PREPARE, sMessagesPath ? {
        $select: sMessagesPath
      } : null);

      // TODO: side effects qualifier shall be even deprecated to be checked
      oOperation.setParameter("SideEffectsQualifier", "");
      const sGroupId = groupId || oOperation.getGroupId();
      return oOperation.execute(sGroupId, ignoreETag).then(function () {
        return oOperation;
      }).catch(function (oError) {
        Log.error("Error while executing the operation", oError);
      });
    } else {
      throw new Error("The preparation action cannot be executed on an active document");
    }
  }
  /**
   * Determines the message path for a context.
   *
   * @function
   * @param oContext Context for which the path shall be determined
   * @returns Message path, empty if not annotated
   * @private
   * @ui5-restricted
   */
  function getMessagesPath(oContext) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
  }
  /**
   * Requests the messages if annotated for a given context.
   *
   * @function
   * @param oContext Context for which the messages shall be requested
   * @param oSideEffectsService Service for the SideEffects on SAP Fiori elements
   * @returns Promise which is resolved once messages were requested
   * @private
   * @ui5-restricted
   */
  function requestMessages(oContext, oSideEffectsService) {
    const sMessagesPath = draft.getMessagesPath(oContext);
    if (sMessagesPath) {
      return oSideEffectsService.requestSideEffects([sMessagesPath], oContext);
    }
    return Promise.resolve();
  }
  /**
   * Executes discard of a draft function using HTTP Post.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent App Component
   * @param bEnableStrictHandling
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const oDiscardOperation = draft.createOperation(oContext, draftOperations.DISCARD);
      const resourceModel = oAppComponent && getResourceModel(oAppComponent);
      const sGroupId = "direct";
      const sActionName = (resourceModel === null || resourceModel === void 0 ? void 0 : resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON")) || "";
      // as the discard action doesnt' send the active version in the response we do not use the replace in cache
      const oDiscardPromise = !bEnableStrictHandling ? oDiscardOperation.execute(sGroupId) : oDiscardOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, resourceModel, null, null, null, undefined, undefined), false);
      oContext.getModel().submitBatch(sGroupId);
      return oDiscardPromise;
    } else {
      throw new Error("The discard action cannot be executed on an active document");
    }
  }

  /**
   * This method creates a sibling context for a subobject page and calculates a sibling path for all intermediate paths
   * between the object page and the subobject page.
   *
   * @param rootCurrentContext The context for the root of the draft
   * @param rightmostCurrentContext The context of the subobject page
   * @returns The siblingInformation object
   */
  async function computeSiblingInformation(rootCurrentContext, rightmostCurrentContext) {
    if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
      // Wrong usage !!
      Log.error("Cannot compute rightmost sibling context");
      throw new Error("Cannot compute rightmost sibling context");
    }
    if (rightmostCurrentContext.getProperty("IsActiveEntity") === false && rightmostCurrentContext.getProperty("HasActiveEntity") === false) {
      // We already know the sibling for rightmostCurrentContext doesn't exist
      // --> No need to check canonical paths etc...
      return undefined;
    }
    const model = rootCurrentContext.getModel();
    try {
      // //////////////////////////////////////////////////////////////////
      // 1. Find all segments between the root object and the sub-object
      // Example: for root = /Param(aa)/Entity(bb) and rightMost = /Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)
      // ---> ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]

      // Find all segments in the rightmost path
      const additionalPath = rightmostCurrentContext.getPath().replace(rootCurrentContext.getPath(), "");
      const segments = additionalPath ? additionalPath.substring(1).split("/") : [];
      // First segment is always the full path of the root object, which can contain '/' in case of a parametrized entity
      segments.unshift(rootCurrentContext.getPath().substring(1));

      // //////////////////////////////////////////////////////////////////
      // 2. Request canonical paths of the sibling entity for each segment
      // Example: for ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]
      // --> request canonical paths for "Param(aa)/Entity(bb)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)/SiblingEntity"
      const oldPaths = [];
      const newPaths = [];
      let currentPath = "";
      const canonicalPathPromises = segments.map(segment => {
        currentPath += `/${segment}`;
        oldPaths.unshift(currentPath);
        if (currentPath.endsWith(")")) {
          const siblingContext = model.bindContext(`${currentPath}/SiblingEntity`).getBoundContext();
          return siblingContext.requestCanonicalPath();
        } else {
          return Promise.resolve(undefined); // 1-1 relation
        }
      });

      // //////////////////////////////////////////////////////////////////
      // 3. Reconstruct the full paths from canonical paths (for path mapping)
      // Example: for canonical paths "/Param(aa)/Entity(bb-sibling)", "/Entity2(cc-sibling)", "/Entity3(dd-sibling)"
      // --> ["Param(aa)/Entity(bb-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)/_SubNav(dd-sibling)"]
      const canonicalPaths = await Promise.all(canonicalPathPromises);
      let siblingPath = "";
      canonicalPaths.forEach((canonicalPath, index) => {
        if (index !== 0) {
          if (segments[index].endsWith(")")) {
            const navigation = segments[index].replace(/\(.*$/, ""); // Keep only navigation name from the segment, i.e. aaa(xxx) --> aaa
            const keys = canonicalPath.replace(/.*\(/, "("); // Keep only the keys from the canonical path, i.e. aaa(xxx) --> (xxx)
            siblingPath += `/${navigation}${keys}`;
          } else {
            siblingPath += `/${segments[index]}`; // 1-1 relation
          }
        } else {
          siblingPath = canonicalPath; // To manage parametrized entities
        }

        newPaths.unshift(siblingPath);
      });
      return {
        targetContext: model.bindContext(siblingPath).getBoundContext(),
        // Create the rightmost sibling context from its path
        pathMapping: oldPaths.map((oldPath, index) => {
          return {
            oldPath,
            newPath: newPaths[index]
          };
        })
      };
    } catch (error) {
      // A canonical path couldn't be resolved (because a sibling doesn't exist)
      return undefined;
    }
  }

  /**
   * Creates a draft document from an existing document.
   *
   * The function supports several hooks as there is a certain coreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#createDraftFromActiveDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.oView] The view
   * @param [mParameters.bPreserveChanges] Preserve changes of an existing draft of another user
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function createDraftFromActiveDocument(oContext, oAppComponent, mParameters) {
    const mParam = mParameters || {},
      bRunPreserveChangesFlow = typeof mParam.bPreserveChanges === "undefined" || typeof mParam.bPreserveChanges === "boolean" && mParam.bPreserveChanges; //default true

    /**
     * Overwrite the existing change.
     *
     * @returns Resolves with result of {@link sap.fe.core.actions#executeDraftEditAction}
     */
    async function overwriteChange() {
      //Overwrite existing changes
      const oModel = oContext.getModel();
      const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
      const resourceModel = getResourceModel(mParameters.oView);
      const draftAdminData = await draftDataContext.requestObject();
      if (draftAdminData) {
        // remove all unbound transition messages as we show a special dialog
        messageHandling.removeUnboundTransitionMessages();
        let sInfo = draftAdminData.InProcessByUserDescription || draftAdminData.InProcessByUser;
        const sEntitySet = mParameters.oView.getViewData().entitySet;
        if (sInfo) {
          const sLockedByUserMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER", sInfo, sEntitySet);
          MessageBox.error(sLockedByUserMsg);
          throw new Error(sLockedByUserMsg);
        } else {
          sInfo = draftAdminData.CreatedByUserDescription || draftAdminData.CreatedByUser;
          const sUnsavedChangesMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES", sInfo, sEntitySet);
          await draft.showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext);
          return draft.executeDraftEditAction(oContext, false, mParameters.oView);
        }
      }
      throw new Error(`Draft creation aborted for document: ${oContext.getPath()}`);
    }
    if (!oContext) {
      throw new Error("Binding context to active document is required");
    }
    let oDraftContext;
    try {
      oDraftContext = await draft.executeDraftEditAction(oContext, bRunPreserveChangesFlow, mParameters.oView);
    } catch (oResponse) {
      if (oResponse.status === 409 || oResponse.status === 412 || oResponse.status === 423) {
        messageHandling.removeBoundTransitionMessages();
        messageHandling.removeUnboundTransitionMessages();
        const siblingInfo = await draft.computeSiblingInformation(oContext, oContext);
        if (siblingInfo !== null && siblingInfo !== void 0 && siblingInfo.targetContext) {
          //there is a context authorized to be edited by the current user
          await CommonUtils.waitForContextRequested(siblingInfo.targetContext);
          return siblingInfo.targetContext;
        } else {
          //there is no draft owned by the current user
          oDraftContext = await overwriteChange();
        }
      } else if (!(oResponse && oResponse.canceled)) {
        throw new Error(oResponse);
      }
    }
    if (oDraftContext) {
      var _oSideEffects$trigger;
      const sEditActionName = draft.getActionName(oDraftContext, draftOperations.EDIT);
      const oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditActionName, oDraftContext);
      if (oSideEffects !== null && oSideEffects !== void 0 && (_oSideEffects$trigger = oSideEffects.triggerActions) !== null && _oSideEffects$trigger !== void 0 && _oSideEffects$trigger.length) {
        await oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oDraftContext);
        return oDraftContext;
      } else {
        return oDraftContext;
      }
    } else {
      return undefined;
    }
  }
  /**
   * Creates an active document from a draft document.
   *
   * The function supports several hooks as there is a certain choreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#activateDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.fnBeforeActivateDocument] Callback that allows a veto before the 'Create' request is executed
   * @param [mParameters.fnAfterActivateDocument] Callback for postprocessing after document was activated.
   * @param messageHandler The message handler
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function activateDocument(oContext, oAppComponent, mParameters, messageHandler) {
    const mParam = mParameters || {};
    if (!oContext) {
      throw new Error("Binding context to draft document is required");
    }
    const bExecute = mParam.fnBeforeActivateDocument ? await mParam.fnBeforeActivateDocument(oContext) : true;
    if (!bExecute) {
      throw new Error(`Activation of the document was aborted by extension for document: ${oContext.getPath()}`);
    }
    let oActiveDocumentContext;
    if (!hasPrepareAction(oContext)) {
      oActiveDocumentContext = await executeDraftActivationAction(oContext, oAppComponent);
    } else {
      /* activation requires preparation */
      const sBatchGroup = "draft";
      // we use the same batchGroup to force prepare and activate in a same batch but with different changeset
      let oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, false);
      oContext.getModel().submitBatch(sBatchGroup);
      const oActivatePromise = draft.executeDraftActivationAction(oContext, oAppComponent, sBatchGroup);
      try {
        const values = await Promise.all([oPreparePromise, oActivatePromise]);
        oActiveDocumentContext = values[1];
      } catch (err) {
        // BCP 2270084075
        // if the Activation fails, then the messages are retrieved from PREPARATION action
        const sMessagesPath = getMessagePathForPrepare(oContext);
        if (sMessagesPath) {
          oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, true);
          oContext.getModel().submitBatch(sBatchGroup);
          await oPreparePromise;
          const data = await oContext.requestObject();
          if (data[sMessagesPath].length > 0) {
            //if messages are available from the PREPARATION action, then previous transition messages are removed
            messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages(false, false, oContext.getPath());
          }
        }
        throw err;
      }
    }
    return mParam.fnAfterActivateDocument ? mParam.fnAfterActivateDocument(oContext, oActiveDocumentContext) : oActiveDocumentContext;
  }

  /**
   * Display the confirmation dialog box after pressing the edit button of an object page with unsaved changes.
   *
   *
   * @function
   * @name sap.fe.core.actions.draft#showEditConfirmationMessageBox
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param sUnsavedChangesMsg Dialog box message informing the user that if he starts editing, the previous unsaved changes will be lost
   * @param oContext Context of the active document for the new draft
   * @returns Promise resolves
   * @private
   * @ui5-restricted
   */
  function showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext) {
    const localI18nRef = Core.getLibraryResourceBundle("sap.fe.core");
    return new Promise(function (resolve, reject) {
      const oDialog = new Dialog({
        title: localI18nRef.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),
        state: "Warning",
        content: new Text({
          text: sUnsavedChangesMsg
        }),
        beginButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_EDIT"),
          type: "Emphasized",
          press: function () {
            oDialog.close();
            resolve(true);
          }
        }),
        endButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
          press: function () {
            oDialog.close();
            reject(`Draft creation aborted for document: ${oContext.getPath()}`);
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });
      oDialog.addStyleClass("sapUiContentPadding");
      oDialog.open();
    });
  }

  /**
   * HTTP POST call when DraftAction is present for Draft Delete; HTTP DELETE call when there is no DraftAction
   * and Active Instance always uses DELETE.
   *
   * @function
   * @name sap.fe.core.actions.draft#deleteDraft
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the document to be discarded
   * @param oAppComponent Context of the document to be discarded
   * @param bEnableStrictHandling
   * @private
   * @returns A Promise resolved when the context is deleted
   * @ui5-restricted
   */
  function deleteDraft(oContext, oAppComponent, bEnableStrictHandling) {
    const sDiscardAction = getActionName(oContext, draftOperations.DISCARD),
      bIsActiveEntity = oContext.getObject().IsActiveEntity;
    if (bIsActiveEntity || !bIsActiveEntity && !sDiscardAction) {
      //Use Delete in case of active entity and no discard action available for draft
      if (oContext.hasPendingChanges()) {
        return oContext.getBinding().resetChanges().then(function () {
          return oContext.delete();
        }).catch(function (error) {
          return Promise.reject(error);
        });
      } else {
        return oContext.delete();
      }
    } else {
      //Use Discard Post Action if it is a draft entity and discard action exists
      return executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling);
    }
  }
  const draft = {
    createDraftFromActiveDocument: createDraftFromActiveDocument,
    activateDocument: activateDocument,
    deleteDraft: deleteDraft,
    executeDraftEditAction: executeDraftEditAction,
    executeDraftValidation: executeDraftValidation,
    executeDraftPreparationAction: executeDraftPreparationAction,
    executeDraftActivationAction: executeDraftActivationAction,
    hasPrepareAction: hasPrepareAction,
    getMessagesPath: getMessagesPath,
    computeSiblingInformation: computeSiblingInformation,
    processDataLossOrDraftDiscardConfirmation: draftDataLossPopup.processDataLossOrDraftDiscardConfirmation,
    silentlyKeepDraftOnForwardNavigation: draftDataLossPopup.silentlyKeepDraftOnForwardNavigation,
    createOperation: createOperation,
    executeDraftDiscardAction: executeDraftDiscardAction,
    NavigationType: draftDataLossPopup.NavigationType,
    getActionName: getActionName,
    showEditConfirmationMessageBox: showEditConfirmationMessageBox
  };
  return draft;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkcmFmdE9wZXJhdGlvbnMiLCJFRElUIiwiQUNUSVZBVElPTiIsIkRJU0NBUkQiLCJQUkVQQVJFIiwiZ2V0QWN0aW9uTmFtZSIsIm9Db250ZXh0Iiwic09wZXJhdGlvbiIsIm9Nb2RlbCIsImdldE1vZGVsIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwiZ2V0T2JqZWN0IiwiY3JlYXRlT3BlcmF0aW9uIiwib09wdGlvbnMiLCJzT3BlcmF0aW9uTmFtZSIsImJpbmRDb250ZXh0IiwiZ2V0UmV0dXJuVHlwZSIsImhhc1ByZXBhcmVBY3Rpb24iLCJleGVjdXRlRHJhZnRFZGl0QWN0aW9uIiwiYlByZXNlcnZlQ2hhbmdlcyIsIm9WaWV3IiwiZ2V0UHJvcGVydHkiLCIkJGluaGVyaXRFeHBhbmRTZWxlY3QiLCJvT3BlcmF0aW9uIiwic2V0UGFyYW1ldGVyIiwic0dyb3VwSWQiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0UmVzb3VyY2VNb2RlbCIsInNBY3Rpb25OYW1lIiwiZ2V0VGV4dCIsIm9FZGl0UHJvbWlzZSIsImV4ZWN1dGUiLCJ1bmRlZmluZWQiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwiYmluZCIsImRyYWZ0IiwibGFiZWwiLCJtb2RlbCIsImdldEJpbmRpbmciLCJpc0EiLCJzdWJtaXRCYXRjaCIsIkVycm9yIiwiZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbiIsImNvbnRleHQiLCJhcHBDb21wb25lbnQiLCJpZ25vcmVFVGFnIiwiZ2V0TWVzc2FnZXNQYXRoIiwib3BlcmF0aW9uIiwiZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24iLCJnZXRVcGRhdGVHcm91cElkIiwicmVxdWVzdE1lc3NhZ2VzIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZXJyb3IiLCJMb2ciLCJleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uIiwib0FwcENvbXBvbmVudCIsImJIYXNQcmVwYXJlQWN0aW9uIiwiYklnbm9yZUV0YWciLCJlIiwiYWN0aW9uTmFtZSIsIm9TaWRlRWZmZWN0c1NlcnZpY2UiLCJvQmluZGluZ1BhcmFtZXRlcnMiLCJnZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzIiwiYVRhcmdldFBhdGhzIiwicGF0aEV4cHJlc3Npb25zIiwibGVuZ3RoIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwib0Vycm9yIiwiZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlIiwic0NvbnRleHRQYXRoIiwib1JldHVyblR5cGUiLCJncm91cElkIiwiYk1lc3NhZ2VzIiwic01lc3NhZ2VzUGF0aCIsIiRzZWxlY3QiLCJnZXRHcm91cElkIiwidGhlbiIsImNhdGNoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uIiwiYkVuYWJsZVN0cmljdEhhbmRsaW5nIiwib0Rpc2NhcmRPcGVyYXRpb24iLCJvRGlzY2FyZFByb21pc2UiLCJjb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwicm9vdEN1cnJlbnRDb250ZXh0IiwicmlnaHRtb3N0Q3VycmVudENvbnRleHQiLCJzdGFydHNXaXRoIiwiYWRkaXRpb25hbFBhdGgiLCJyZXBsYWNlIiwic2VnbWVudHMiLCJzdWJzdHJpbmciLCJzcGxpdCIsInVuc2hpZnQiLCJvbGRQYXRocyIsIm5ld1BhdGhzIiwiY3VycmVudFBhdGgiLCJjYW5vbmljYWxQYXRoUHJvbWlzZXMiLCJtYXAiLCJzZWdtZW50IiwiZW5kc1dpdGgiLCJzaWJsaW5nQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInJlcXVlc3RDYW5vbmljYWxQYXRoIiwiY2Fub25pY2FsUGF0aHMiLCJhbGwiLCJzaWJsaW5nUGF0aCIsImZvckVhY2giLCJjYW5vbmljYWxQYXRoIiwiaW5kZXgiLCJuYXZpZ2F0aW9uIiwia2V5cyIsInRhcmdldENvbnRleHQiLCJwYXRoTWFwcGluZyIsIm9sZFBhdGgiLCJuZXdQYXRoIiwiY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQiLCJtUGFyYW1ldGVycyIsIm1QYXJhbSIsImJSdW5QcmVzZXJ2ZUNoYW5nZXNGbG93Iiwib3ZlcndyaXRlQ2hhbmdlIiwiZHJhZnREYXRhQ29udGV4dCIsImRyYWZ0QWRtaW5EYXRhIiwicmVxdWVzdE9iamVjdCIsIm1lc3NhZ2VIYW5kbGluZyIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJzSW5mbyIsIkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uIiwiSW5Qcm9jZXNzQnlVc2VyIiwic0VudGl0eVNldCIsImdldFZpZXdEYXRhIiwiZW50aXR5U2V0Iiwic0xvY2tlZEJ5VXNlck1zZyIsIk1lc3NhZ2VCb3giLCJDcmVhdGVkQnlVc2VyRGVzY3JpcHRpb24iLCJDcmVhdGVkQnlVc2VyIiwic1Vuc2F2ZWRDaGFuZ2VzTXNnIiwic2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94Iiwib0RyYWZ0Q29udGV4dCIsIm9SZXNwb25zZSIsInN0YXR1cyIsInJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwic2libGluZ0luZm8iLCJDb21tb25VdGlscyIsIndhaXRGb3JDb250ZXh0UmVxdWVzdGVkIiwiY2FuY2VsZWQiLCJzRWRpdEFjdGlvbk5hbWUiLCJvU2lkZUVmZmVjdHMiLCJ0cmlnZ2VyQWN0aW9ucyIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uIiwiYWN0aXZhdGVEb2N1bWVudCIsIm1lc3NhZ2VIYW5kbGVyIiwiYkV4ZWN1dGUiLCJmbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnQiLCJvQWN0aXZlRG9jdW1lbnRDb250ZXh0Iiwic0JhdGNoR3JvdXAiLCJvUHJlcGFyZVByb21pc2UiLCJvQWN0aXZhdGVQcm9taXNlIiwidmFsdWVzIiwiZXJyIiwiZGF0YSIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsImZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50IiwibG9jYWxJMThuUmVmIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInJlamVjdCIsIm9EaWFsb2ciLCJEaWFsb2ciLCJ0aXRsZSIsInN0YXRlIiwiY29udGVudCIsIlRleHQiLCJ0ZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJ0eXBlIiwicHJlc3MiLCJjbG9zZSIsImVuZEJ1dHRvbiIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsIm9wZW4iLCJkZWxldGVEcmFmdCIsInNEaXNjYXJkQWN0aW9uIiwiYklzQWN0aXZlRW50aXR5IiwiSXNBY3RpdmVFbnRpdHkiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsInJlc2V0Q2hhbmdlcyIsImRlbGV0ZSIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiZHJhZnREYXRhTG9zc1BvcHVwIiwic2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwiTmF2aWdhdGlvblR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImRyYWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFNpZGVFZmZlY3RzU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgb3BlcmF0aW9uc0hlbHBlciBmcm9tIFwiLi4vLi4vb3BlcmF0aW9uc0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcIi4uL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgZHJhZnREYXRhTG9zc1BvcHVwIGZyb20gXCIuL2RyYWZ0RGF0YUxvc3NQb3B1cFwiO1xuXG5leHBvcnQgdHlwZSBTaWJsaW5nSW5mb3JtYXRpb24gPSB7XG5cdHRhcmdldENvbnRleHQ6IENvbnRleHQ7XG5cdHBhdGhNYXBwaW5nOiB7IG9sZFBhdGg6IHN0cmluZzsgbmV3UGF0aDogc3RyaW5nIH1bXTtcbn07XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBjYWxsYmFja3MgdXNlZCBpbiB0aGUgZnVuY3Rpb25zXG4gKlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAc2luY2UgMS41NC4wXG4gKiBAaW50ZXJmYWNlXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIENhbGxiYWNrIHRvIGFwcHJvdmUgb3IgcmVqZWN0IHRoZSBjcmVhdGlvbiBvZiBhIGRyYWZ0XG4gKlxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdC5JQ2FsbGJhY2suYmVmb3JlQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQGFic3RyYWN0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEByZXR1cm5zIHsoYm9vbGVhbnxQcm9taXNlKX0gQXBwcm92YWwgb2YgZHJhZnQgY3JlYXRpb24gW3RydWV8ZmFsc2VdIG9yIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBib29sZWFuIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogQ2FsbGJhY2sgYWZ0ZXIgYSBkcmFmdCB3YXMgc3VjY2Vzc3VsbHkgY3JlYXRlZFxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLmFmdGVyQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQGFic3RyYWN0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBuZXcgZHJhZnRcbiAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9BY3RpdmVEb2N1bWVudENvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9BY3RpdmVEb2N1bWVudENvbnRleHRcbiAqIEBwcml2YXRlXG4gKi9cblxuLyoqXG4gKiBDYWxsYmFjayB0byBhcHByb3ZlIG9yIHJlamVjdCBvdmVyd3JpdGluZyBhbiB1bnNhdmVkIGRyYWZ0IG9mIGFub3RoZXIgdXNlclxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLndoZW5EZWNpc2lvblRvT3ZlcndyaXRlRG9jdW1lbnRJc1JlcXVpcmVkXG4gKiBAZnVuY3Rpb25cbiAqIEBwdWJsaWNcbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7KGJvb2xlYW58UHJvbWlzZSl9IEFwcHJvdmFsIHRvIG92ZXJ3cml0ZSB1bnNhdmVkIGRyYWZ0IFt0cnVlfGZhbHNlXSBvciBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYm9vbGVhbiB2YWx1ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbi8qIENvbnN0YW50cyBmb3IgZHJhZnQgb3BlcmF0aW9ucyAqL1xuY29uc3QgZHJhZnRPcGVyYXRpb25zID0ge1xuXHRFRElUOiBcIkVkaXRBY3Rpb25cIixcblx0QUNUSVZBVElPTjogXCJBY3RpdmF0aW9uQWN0aW9uXCIsXG5cdERJU0NBUkQ6IFwiRGlzY2FyZEFjdGlvblwiLFxuXHRQUkVQQVJFOiBcIlByZXBhcmF0aW9uQWN0aW9uXCJcbn07XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyBmb3IgdGhlIGRyYWZ0IHByb2dyYW1taW5nIG1vZGVsXG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGV4cGVyaW1lbnRhbCB1c2UhIDxici8+PGI+VGhpcyBpcyBvbmx5IGEgUE9DIGFuZCBtYXliZSBkZWxldGVkPC9iPlxuICogQHNpbmNlIDEuNTQuMFxuICovXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgYWN0aW9uIG5hbWUgZm9yIGEgZHJhZnQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIG5hbWVcbiAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBkcmFmdCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0QWN0aW9uTmFtZShvQ29udGV4dDogQ29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvJHtzT3BlcmF0aW9ufWApO1xufVxuLyoqXG4gKiBDcmVhdGVzIGFuIG9wZXJhdGlvbiBjb250ZXh0IGJpbmRpbmcgZm9yIHRoZSBnaXZlbiBjb250ZXh0IGFuZCBvcGVyYXRpb24uXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEBwYXJhbSBzT3BlcmF0aW9uIFRoZSBvcGVyYXRpb24gKGFjdGlvbiBvciBmdW5jdGlvbiBpbXBvcnQpXG4gKiBAcGFyYW0gb09wdGlvbnMgT3B0aW9ucyB0byBjcmVhdGUgdGhlIG9wZXJhdGlvbiBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY29udGV4dCBiaW5kaW5nIG9mIHRoZSBib3VuZCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0OiBDb250ZXh0LCBzT3BlcmF0aW9uOiBzdHJpbmcsIG9PcHRpb25zPzogYW55KSB7XG5cdGNvbnN0IHNPcGVyYXRpb25OYW1lID0gZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgc09wZXJhdGlvbik7XG5cblx0cmV0dXJuIG9Db250ZXh0LmdldE1vZGVsKCkuYmluZENvbnRleHQoYCR7c09wZXJhdGlvbk5hbWV9KC4uLilgLCBvQ29udGV4dCwgb09wdGlvbnMpO1xufVxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSByZXR1cm4gdHlwZSBmb3IgYSBkcmFmdCBvcGVyYXRpb24uXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEBwYXJhbSBzT3BlcmF0aW9uIFRoZSBvcGVyYXRpb24gbmFtZVxuICogQHJldHVybnMgVGhlIHJldHVybiB0eXBlIG9mIHRoZSBkcmFmdCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0UmV0dXJuVHlwZShvQ29udGV4dDogQ29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvJHtzT3BlcmF0aW9ufS8kUmV0dXJuVHlwZWApO1xufVxuLyoqXG4gKiBDaGVjayBpZiBvcHRpb25hbCBkcmFmdCBwcmVwYXJlIGFjdGlvbiBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIFRydWUgaWYgYSBhIHByZXBhcmUgYWN0aW9uIGV4aXN0c1xuICovXG5mdW5jdGlvbiBoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0OiBDb250ZXh0KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIWdldEFjdGlvbk5hbWUob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBkcmFmdCBmcm9tIGFuIGFjdGl2ZSBkb2N1bWVudC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBiUHJlc2VydmVDaGFuZ2VzIElmIHRydWUgLSBleGlzdGluZyBjaGFuZ2VzIGZyb20gYW5vdGhlciB1c2VyIHRoYXQgYXJlIG5vdCBsb2NrZWQgYXJlIHByZXNlcnZlZCBhbmQgYW4gZXJyb3IgaXMgc2VudCBmcm9tIHRoZSBiYWNrZW5kLCBvdGhlcndpc2UgZmFsc2UgLSBleGlzdGluZyBjaGFuZ2VzIGZyb20gYW5vdGhlciB1c2VyIHRoYXQgYXJlIG5vdCBsb2NrZWQgYXJlIG92ZXJ3cml0dGVuPC9saT5cbiAqIEBwYXJhbSBvVmlldyBJZiB0cnVlIC0gZXhpc3RpbmcgY2hhbmdlcyBmcm9tIGFub3RoZXJcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdEVkaXRBY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIGJQcmVzZXJ2ZUNoYW5nZXM6IGJvb2xlYW4sIG9WaWV3OiBhbnkpOiBQcm9taXNlPENvbnRleHQ+IHtcblx0aWYgKG9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBvT3B0aW9ucyA9IHsgJCRpbmhlcml0RXhwYW5kU2VsZWN0OiB0cnVlIH07XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkVESVQsIG9PcHRpb25zKTtcblx0XHRvT3BlcmF0aW9uLnNldFBhcmFtZXRlcihcIlByZXNlcnZlQ2hhbmdlc1wiLCBiUHJlc2VydmVDaGFuZ2VzKTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiZGlyZWN0XCI7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1ZpZXcpO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fT0JKRUNUX1BBR0VfRURJVFwiKTtcblx0XHQvL0lmIHRoZSBjb250ZXh0IGlzIGNvbWluZyBmcm9tIGEgbGlzdCBiaW5kaW5nIHdlIHBhc3MgdGhlIGZsYWcgdHJ1ZSB0byByZXBsYWNlIHRoZSBjb250ZXh0IGJ5IHRoZSBhY3RpdmUgb25lXG5cdFx0Y29uc3Qgb0VkaXRQcm9taXNlID0gb09wZXJhdGlvbi5leGVjdXRlKFxuXHRcdFx0c0dyb3VwSWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRkcmFmdCxcblx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdHsgbGFiZWw6IHNBY3Rpb25OYW1lLCBtb2RlbDogb0NvbnRleHQuZ2V0TW9kZWwoKSB9LFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0KSxcblx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKVxuXHRcdCk7XG5cdFx0b09wZXJhdGlvbi5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRyZXR1cm4gYXdhaXQgb0VkaXRQcm9taXNlO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3QgZWRpdCB0aGlzIGRyYWZ0IGRvY3VtZW50XCIpO1xuXHR9XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgdGhlIHZhbGlkYXRpb24gb2YgdGhlIGRyYWZ0LiBUaGUgUHJlcGFyZUFjdGlvbiBpcyB0cmlnZ2VyZWQgaWYgdGhlIG1lc3NhZ2VzIGFyZSBhbm5vdGF0ZWQgYW5kIGVudGl0eVNldCBnZXRzIGEgUHJlcGFyYXRpb25BY3Rpb24gYW5ub3RhdGVkLlxuICogSWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkcyBhbmQgb3BlcmF0aW9uIGRvZXNuJ3QgZ2V0IGEgcmV0dXJuIHR5cGUgKFJBUCBzeXN0ZW0pIHRoZSBtZXNzYWdlcyBhcmUgcmVxdWVzdGVkLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIFByZXBhcmVBY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gaWdub3JlRVRhZyBJZiBzZXQgdG8gdHJ1ZSwgRVRhZ3MgYXJlIGlnbm9yZWQgd2hlbiBleGVjdXRpbmcgdGhlIGFjdGlvblxuICogQHJldHVybnMgUmVzb2x2ZSBmdW5jdGlvbiByZXR1cm5zXG4gKiAgLSB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uIGlmIHRoZSBhY3Rpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gKiAgLSB2b2lkIGlmIHRoZSBhY3Rpb24gaGFzIGZhaWxlZFxuICogIC0gdW5kZWZpbmVkIGlmIHRoZSBhY3Rpb24gaGFzIG5vdCBiZWVuIHRyaWdnZXJlZCBzaW5jZSB0aGUgcHJlcmVxdWlzaXRlcyBhcmUgbm90IG1ldFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnRWYWxpZGF0aW9uKFxuXHRjb250ZXh0OiBDb250ZXh0LFxuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0aWdub3JlRVRhZzogYm9vbGVhblxuKTogUHJvbWlzZTxPRGF0YUNvbnRleHRCaW5kaW5nIHwgdm9pZCB8IHVuZGVmaW5lZD4ge1xuXHRpZiAoZHJhZnQuZ2V0TWVzc2FnZXNQYXRoKGNvbnRleHQpICYmIGRyYWZ0Lmhhc1ByZXBhcmVBY3Rpb24oY29udGV4dCkpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb3BlcmF0aW9uID0gYXdhaXQgZHJhZnQuZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24oY29udGV4dCwgY29udGV4dC5nZXRVcGRhdGVHcm91cElkKCksIHRydWUsIGlnbm9yZUVUYWcpO1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gcmV0dXJuZWQgb3BlcmF0aW9uIGJ5IGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uIC0+IHRoZSBhY3Rpb24gaGFzIGZhaWxlZFxuXHRcdFx0aWYgKG9wZXJhdGlvbiAmJiAhZ2V0UmV0dXJuVHlwZShjb250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSkpIHtcblx0XHRcdFx0cmVxdWVzdE1lc3NhZ2VzKGNvbnRleHQsIGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3BlcmF0aW9uO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgbWVzc2FnZXNcIiwgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQWN0aXZhdGVzIGEgZHJhZnQgZG9jdW1lbnQuIFRoZSBkcmFmdCB3aWxsIHJlcGxhY2UgdGhlIHNpYmxpbmcgZW50aXR5IGFuZCB3aWxsIGJlIGRlbGV0ZWQgYnkgdGhlIGJhY2sgZW5kLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIFtzR3JvdXBJZF0gVGhlIG9wdGlvbmFsIGJhdGNoIGdyb3VwIGluIHdoaWNoIHRoZSBvcGVyYXRpb24gaXMgdG8gYmUgZXhlY3V0ZWRcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc0dyb3VwSWQ/OiBzdHJpbmcpOiBQcm9taXNlPENvbnRleHQ+IHtcblx0Y29uc3QgYkhhc1ByZXBhcmVBY3Rpb24gPSBoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0KTtcblxuXHQvLyBBY2NvcmRpbmcgdG8gdGhlIGRyYWZ0IHNwZWMgaWYgdGhlIHNlcnZpY2UgY29udGFpbnMgYSBwcmVwYXJlIGFjdGlvbiBhbmQgd2UgdHJpZ2dlciBib3RoIHByZXBhcmUgYW5kXG5cdC8vIGFjdGl2YXRlIGluIG9uZSAkYmF0Y2ggdGhlIGFjdGl2YXRlIGFjdGlvbiBpcyBjYWxsZWQgd2l0aCBpRi1NYXRjaD0qXG5cdGNvbnN0IGJJZ25vcmVFdGFnID0gYkhhc1ByZXBhcmVBY3Rpb247XG5cblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkFDVElWQVRJT04sIHsgJCRpbmhlcml0RXhwYW5kU2VsZWN0OiB0cnVlIH0pO1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9BcHBDb21wb25lbnQpO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19PUF9PQkpFQ1RfUEFHRV9TQVZFXCIpO1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgb09wZXJhdGlvbi5leGVjdXRlKFxuXHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0Yklnbm9yZUV0YWcsXG5cdFx0XHRcdHNHcm91cElkXG5cdFx0XHRcdFx0PyAob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0XHRkcmFmdCxcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdHsgbGFiZWw6IHNBY3Rpb25OYW1lLCBtb2RlbDogb0NvbnRleHQuZ2V0TW9kZWwoKSB9LFxuXHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIilcblx0XHRcdCk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGJIYXNQcmVwYXJlQWN0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGFjdGlvbk5hbWUgPSBnZXRBY3Rpb25OYW1lKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSksXG5cdFx0XHRcdFx0b1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCksXG5cdFx0XHRcdFx0b0JpbmRpbmdQYXJhbWV0ZXJzID0gb1NpZGVFZmZlY3RzU2VydmljZS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKGFjdGlvbk5hbWUsIG9Db250ZXh0KSxcblx0XHRcdFx0XHRhVGFyZ2V0UGF0aHMgPSBvQmluZGluZ1BhcmFtZXRlcnMgJiYgb0JpbmRpbmdQYXJhbWV0ZXJzLnBhdGhFeHByZXNzaW9ucztcblx0XHRcdFx0aWYgKGFUYXJnZXRQYXRocyAmJiBhVGFyZ2V0UGF0aHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhhVGFyZ2V0UGF0aHMsIG9Db250ZXh0KTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IHJlcXVlc3RNZXNzYWdlcyhvQ29udGV4dCwgb1NpZGVFZmZlY3RzU2VydmljZSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgbWVzc2FnZXNcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlRoZSBhY3RpdmF0aW9uIGFjdGlvbiBjYW5ub3QgYmUgZXhlY3V0ZWQgb24gYW4gYWN0aXZlIGRvY3VtZW50XCIpO1xuXHR9XG59XG5cbi8qKlxuICogR2V0cyB0aGUgc3VwcG9ydGVkIG1lc3NhZ2UgcHJvcGVydHkgcGF0aCBvbiB0aGUgUHJlcGFyZUFjdGlvbiBmb3IgYSBjb250ZXh0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgUGF0aCB0byB0aGUgbWVzc2FnZVxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlUGF0aEZvclByZXBhcmUob0NvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcgfCBudWxsIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0Y29uc3Qgb1JldHVyblR5cGUgPSBnZXRSZXR1cm5UeXBlKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSk7XG5cdC8vIElmIHRoZXJlIGlzIG5vIHJldHVybiBwYXJhbWV0ZXIsIGl0IGlzIG5vdCBwb3NzaWJsZSB0byByZXF1ZXN0IE1lc3NhZ2VzLlxuXHQvLyBSQVAgZHJhZnQgcHJlcGFyZSBoYXMgbm8gcmV0dXJuIHBhcmFtZXRlclxuXHRyZXR1cm4gb1JldHVyblR5cGUgPyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Ake0NvbW1vbkFubm90YXRpb25UZXJtcy5NZXNzYWdlc30vJFBhdGhgKSA6IG51bGw7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIHByZXBhcmF0aW9uIGFjdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBncm91cElkIFRoZSBvcHRpb25hbCBiYXRjaCBncm91cCBpbiB3aGljaCB3ZSB3YW50IHRvIGV4ZWN1dGUgdGhlIG9wZXJhdGlvblxuICogQHBhcmFtIGJNZXNzYWdlcyBJZiBzZXQgdG8gdHJ1ZSwgdGhlIFBSRVBBUkUgYWN0aW9uIHJldHJpZXZlcyBTQVBfTWVzc2FnZXNcbiAqIEBwYXJhbSBpZ25vcmVFVGFnIElmIHNldCB0byB0cnVlLCBFVGFnIGluZm9ybWF0aW9uIGlzIGlnbm9yZWQgd2hlbiB0aGUgYWN0aW9uIGlzIGV4ZWN1dGVkXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBleGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihvQ29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZywgYk1lc3NhZ2VzPzogYm9vbGVhbiwgaWdub3JlRVRhZz86IGJvb2xlYW4pIHtcblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IGJNZXNzYWdlcyA/IGdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZShvQ29udGV4dCkgOiBudWxsO1xuXHRcdGNvbnN0IG9PcGVyYXRpb24gPSBjcmVhdGVPcGVyYXRpb24ob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFLCBzTWVzc2FnZXNQYXRoID8geyAkc2VsZWN0OiBzTWVzc2FnZXNQYXRoIH0gOiBudWxsKTtcblxuXHRcdC8vIFRPRE86IHNpZGUgZWZmZWN0cyBxdWFsaWZpZXIgc2hhbGwgYmUgZXZlbiBkZXByZWNhdGVkIHRvIGJlIGNoZWNrZWRcblx0XHRvT3BlcmF0aW9uLnNldFBhcmFtZXRlcihcIlNpZGVFZmZlY3RzUXVhbGlmaWVyXCIsIFwiXCIpO1xuXG5cdFx0Y29uc3Qgc0dyb3VwSWQgPSBncm91cElkIHx8IG9PcGVyYXRpb24uZ2V0R3JvdXBJZCgpO1xuXHRcdHJldHVybiBvT3BlcmF0aW9uXG5cdFx0XHQuZXhlY3V0ZShzR3JvdXBJZCwgaWdub3JlRVRhZylcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIG9PcGVyYXRpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBleGVjdXRpbmcgdGhlIG9wZXJhdGlvblwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhlIHByZXBhcmF0aW9uIGFjdGlvbiBjYW5ub3QgYmUgZXhlY3V0ZWQgb24gYW4gYWN0aXZlIGRvY3VtZW50XCIpO1xuXHR9XG59XG4vKipcbiAqIERldGVybWluZXMgdGhlIG1lc3NhZ2UgcGF0aCBmb3IgYSBjb250ZXh0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBwYXRoIHNoYWxsIGJlIGRldGVybWluZWRcbiAqIEByZXR1cm5zIE1lc3NhZ2UgcGF0aCwgZW1wdHkgaWYgbm90IGFubm90YXRlZFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlc1BhdGgob0NvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0VudGl0eVNldFBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cdHJldHVybiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcy8kUGF0aGApO1xufVxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbWVzc2FnZXMgaWYgYW5ub3RhdGVkIGZvciBhIGdpdmVuIGNvbnRleHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIG1lc3NhZ2VzIHNoYWxsIGJlIHJlcXVlc3RlZFxuICogQHBhcmFtIG9TaWRlRWZmZWN0c1NlcnZpY2UgU2VydmljZSBmb3IgdGhlIFNpZGVFZmZlY3RzIG9uIFNBUCBGaW9yaSBlbGVtZW50c1xuICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIG1lc3NhZ2VzIHdlcmUgcmVxdWVzdGVkXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3RNZXNzYWdlcyhvQ29udGV4dDogQ29udGV4dCwgb1NpZGVFZmZlY3RzU2VydmljZTogU2lkZUVmZmVjdHNTZXJ2aWNlKSB7XG5cdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBkcmFmdC5nZXRNZXNzYWdlc1BhdGgob0NvbnRleHQpO1xuXHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdHJldHVybiBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbc01lc3NhZ2VzUGF0aF0sIG9Db250ZXh0KTtcblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59XG4vKipcbiAqIEV4ZWN1dGVzIGRpc2NhcmQgb2YgYSBkcmFmdCBmdW5jdGlvbiB1c2luZyBIVFRQIFBvc3QuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIGFjdGlvbiBzaG91bGQgYmUgcGVyZm9ybWVkXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBBcHAgQ29tcG9uZW50XG4gKiBAcGFyYW0gYkVuYWJsZVN0cmljdEhhbmRsaW5nXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uKG9Db250ZXh0OiBDb250ZXh0LCBvQXBwQ29tcG9uZW50PzogYW55LCBiRW5hYmxlU3RyaWN0SGFuZGxpbmc/OiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdGlmICghb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSkge1xuXHRcdGNvbnN0IG9EaXNjYXJkT3BlcmF0aW9uID0gZHJhZnQuY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuRElTQ0FSRCk7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IG9BcHBDb21wb25lbnQgJiYgZ2V0UmVzb3VyY2VNb2RlbChvQXBwQ29tcG9uZW50KTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiZGlyZWN0XCI7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSByZXNvdXJjZU1vZGVsPy5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfRFJBRlRfRElTQ0FSRF9CVVRUT05cIikgfHwgXCJcIjtcblx0XHQvLyBhcyB0aGUgZGlzY2FyZCBhY3Rpb24gZG9lc250JyBzZW5kIHRoZSBhY3RpdmUgdmVyc2lvbiBpbiB0aGUgcmVzcG9uc2Ugd2UgZG8gbm90IHVzZSB0aGUgcmVwbGFjZSBpbiBjYWNoZVxuXHRcdGNvbnN0IG9EaXNjYXJkUHJvbWlzZSA9ICFiRW5hYmxlU3RyaWN0SGFuZGxpbmdcblx0XHRcdD8gb0Rpc2NhcmRPcGVyYXRpb24uZXhlY3V0ZShzR3JvdXBJZClcblx0XHRcdDogb0Rpc2NhcmRPcGVyYXRpb24uZXhlY3V0ZShcblx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0XHRcdGRyYWZ0LFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHR7IGxhYmVsOiBzQWN0aW9uTmFtZSwgbW9kZWw6IG9Db250ZXh0LmdldE1vZGVsKCkgfSxcblx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWRcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGZhbHNlXG5cdFx0XHQgICk7XG5cdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0cmV0dXJuIG9EaXNjYXJkUHJvbWlzZTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZGlzY2FyZCBhY3Rpb24gY2Fubm90IGJlIGV4ZWN1dGVkIG9uIGFuIGFjdGl2ZSBkb2N1bWVudFwiKTtcblx0fVxufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBzaWJsaW5nIGNvbnRleHQgZm9yIGEgc3Vib2JqZWN0IHBhZ2UgYW5kIGNhbGN1bGF0ZXMgYSBzaWJsaW5nIHBhdGggZm9yIGFsbCBpbnRlcm1lZGlhdGUgcGF0aHNcbiAqIGJldHdlZW4gdGhlIG9iamVjdCBwYWdlIGFuZCB0aGUgc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIHJvb3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHJvb3Qgb2YgdGhlIGRyYWZ0XG4gKiBAcGFyYW0gcmlnaHRtb3N0Q3VycmVudENvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIHN1Ym9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBUaGUgc2libGluZ0luZm9ybWF0aW9uIG9iamVjdFxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRyb290Q3VycmVudENvbnRleHQ6IENvbnRleHQsXG5cdHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0OiBDb250ZXh0XG4pOiBQcm9taXNlPFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZD4ge1xuXHRpZiAoIXJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpKSB7XG5cdFx0Ly8gV3JvbmcgdXNhZ2UgISFcblx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjb21wdXRlIHJpZ2h0bW9zdCBzaWJsaW5nIGNvbnRleHRcIik7XG5cdH1cblxuXHRpZiAoXG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gZmFsc2UgJiZcblx0XHRyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKSA9PT0gZmFsc2Vcblx0KSB7XG5cdFx0Ly8gV2UgYWxyZWFkeSBrbm93IHRoZSBzaWJsaW5nIGZvciByaWdodG1vc3RDdXJyZW50Q29udGV4dCBkb2Vzbid0IGV4aXN0XG5cdFx0Ly8gLS0+IE5vIG5lZWQgdG8gY2hlY2sgY2Fub25pY2FsIHBhdGhzIGV0Yy4uLlxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRjb25zdCBtb2RlbCA9IHJvb3RDdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpO1xuXHR0cnkge1xuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDEuIEZpbmQgYWxsIHNlZ21lbnRzIGJldHdlZW4gdGhlIHJvb3Qgb2JqZWN0IGFuZCB0aGUgc3ViLW9iamVjdFxuXHRcdC8vIEV4YW1wbGU6IGZvciByb290ID0gL1BhcmFtKGFhKS9FbnRpdHkoYmIpIGFuZCByaWdodE1vc3QgPSAvUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvX1N1Yk5hdihkZClcblx0XHQvLyAtLS0+IFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXG5cdFx0Ly8gRmluZCBhbGwgc2VnbWVudHMgaW4gdGhlIHJpZ2h0bW9zdCBwYXRoXG5cdFx0Y29uc3QgYWRkaXRpb25hbFBhdGggPSByaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkucmVwbGFjZShyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLCBcIlwiKTtcblx0XHRjb25zdCBzZWdtZW50cyA9IGFkZGl0aW9uYWxQYXRoID8gYWRkaXRpb25hbFBhdGguc3Vic3RyaW5nKDEpLnNwbGl0KFwiL1wiKSA6IFtdO1xuXHRcdC8vIEZpcnN0IHNlZ21lbnQgaXMgYWx3YXlzIHRoZSBmdWxsIHBhdGggb2YgdGhlIHJvb3Qgb2JqZWN0LCB3aGljaCBjYW4gY29udGFpbiAnLycgaW4gY2FzZSBvZiBhIHBhcmFtZXRyaXplZCBlbnRpdHlcblx0XHRzZWdtZW50cy51bnNoaWZ0KHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3Vic3RyaW5nKDEpKTtcblxuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDIuIFJlcXVlc3QgY2Fub25pY2FsIHBhdGhzIG9mIHRoZSBzaWJsaW5nIGVudGl0eSBmb3IgZWFjaCBzZWdtZW50XG5cdFx0Ly8gRXhhbXBsZTogZm9yIFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXHRcdC8vIC0tPiByZXF1ZXN0IGNhbm9uaWNhbCBwYXRocyBmb3IgXCJQYXJhbShhYSkvRW50aXR5KGJiKS9TaWJsaW5nRW50aXR5XCIsIFwiUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvU2libGluZ0VudGl0eVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmIpL19OYXYoY2MpL19TdWJOYXYoZGQpL1NpYmxpbmdFbnRpdHlcIlxuXHRcdGNvbnN0IG9sZFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IG5ld1BhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGxldCBjdXJyZW50UGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgY2Fub25pY2FsUGF0aFByb21pc2VzID0gc2VnbWVudHMubWFwKChzZWdtZW50KSA9PiB7XG5cdFx0XHRjdXJyZW50UGF0aCArPSBgLyR7c2VnbWVudH1gO1xuXHRcdFx0b2xkUGF0aHMudW5zaGlmdChjdXJyZW50UGF0aCk7XG5cdFx0XHRpZiAoY3VycmVudFBhdGguZW5kc1dpdGgoXCIpXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHNpYmxpbmdDb250ZXh0ID0gbW9kZWwuYmluZENvbnRleHQoYCR7Y3VycmVudFBhdGh9L1NpYmxpbmdFbnRpdHlgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0cmV0dXJuIHNpYmxpbmdDb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7IC8vIDEtMSByZWxhdGlvblxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gMy4gUmVjb25zdHJ1Y3QgdGhlIGZ1bGwgcGF0aHMgZnJvbSBjYW5vbmljYWwgcGF0aHMgKGZvciBwYXRoIG1hcHBpbmcpXG5cdFx0Ly8gRXhhbXBsZTogZm9yIGNhbm9uaWNhbCBwYXRocyBcIi9QYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpXCIsIFwiL0VudGl0eTIoY2Mtc2libGluZylcIiwgXCIvRW50aXR5MyhkZC1zaWJsaW5nKVwiXG5cdFx0Ly8gLS0+IFtcIlBhcmFtKGFhKS9FbnRpdHkoYmItc2libGluZylcIiwgXCJQYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpL19OYXYoY2Mtc2libGluZylcIiwgXCJQYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpL19OYXYoY2Mtc2libGluZykvX1N1Yk5hdihkZC1zaWJsaW5nKVwiXVxuXHRcdGNvbnN0IGNhbm9uaWNhbFBhdGhzID0gKGF3YWl0IFByb21pc2UuYWxsKGNhbm9uaWNhbFBhdGhQcm9taXNlcykpIGFzIHN0cmluZ1tdO1xuXHRcdGxldCBzaWJsaW5nUGF0aCA9IFwiXCI7XG5cdFx0Y2Fub25pY2FsUGF0aHMuZm9yRWFjaCgoY2Fub25pY2FsUGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdGlmIChpbmRleCAhPT0gMCkge1xuXHRcdFx0XHRpZiAoc2VnbWVudHNbaW5kZXhdLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hdmlnYXRpb24gPSBzZWdtZW50c1tpbmRleF0ucmVwbGFjZSgvXFwoLiokLywgXCJcIik7IC8vIEtlZXAgb25seSBuYXZpZ2F0aW9uIG5hbWUgZnJvbSB0aGUgc2VnbWVudCwgaS5lLiBhYWEoeHh4KSAtLT4gYWFhXG5cdFx0XHRcdFx0Y29uc3Qga2V5cyA9IGNhbm9uaWNhbFBhdGgucmVwbGFjZSgvLipcXCgvLCBcIihcIik7IC8vIEtlZXAgb25seSB0aGUga2V5cyBmcm9tIHRoZSBjYW5vbmljYWwgcGF0aCwgaS5lLiBhYWEoeHh4KSAtLT4gKHh4eClcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7bmF2aWdhdGlvbn0ke2tleXN9YDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7c2VnbWVudHNbaW5kZXhdfWA7IC8vIDEtMSByZWxhdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzaWJsaW5nUGF0aCA9IGNhbm9uaWNhbFBhdGg7IC8vIFRvIG1hbmFnZSBwYXJhbWV0cml6ZWQgZW50aXRpZXNcblx0XHRcdH1cblx0XHRcdG5ld1BhdGhzLnVuc2hpZnQoc2libGluZ1BhdGgpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRhcmdldENvbnRleHQ6IG1vZGVsLmJpbmRDb250ZXh0KHNpYmxpbmdQYXRoKS5nZXRCb3VuZENvbnRleHQoKSwgLy8gQ3JlYXRlIHRoZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0IGZyb20gaXRzIHBhdGhcblx0XHRcdHBhdGhNYXBwaW5nOiBvbGRQYXRocy5tYXAoKG9sZFBhdGgsIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b2xkUGF0aCxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdQYXRoc1tpbmRleF1cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0fTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBBIGNhbm9uaWNhbCBwYXRoIGNvdWxkbid0IGJlIHJlc29sdmVkIChiZWNhdXNlIGEgc2libGluZyBkb2Vzbid0IGV4aXN0KVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZHJhZnQgZG9jdW1lbnQgZnJvbSBhbiBleGlzdGluZyBkb2N1bWVudC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gc3VwcG9ydHMgc2V2ZXJhbCBob29rcyBhcyB0aGVyZSBpcyBhIGNlcnRhaW4gY29yZW9ncmFwaHkgZGVmaW5lZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQjY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gbVBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMub1ZpZXddIFRoZSB2aWV3XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJQcmVzZXJ2ZUNoYW5nZXNdIFByZXNlcnZlIGNoYW5nZXMgb2YgYW4gZXhpc3RpbmcgZHJhZnQgb2YgYW5vdGhlciB1c2VyXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dCBjb250ZXh0fSBvZiB0aGUgbmV3IGRyYWZ0IGRvY3VtZW50XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50KFxuXHRvQ29udGV4dDogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiB7XG5cdFx0b1ZpZXc6IFZpZXc7XG5cdFx0YlByZXNlcnZlQ2hhbmdlcz86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdH1cbik6IFByb21pc2U8Q29udGV4dCB8IHVuZGVmaW5lZD4ge1xuXHRjb25zdCBtUGFyYW0gPSBtUGFyYW1ldGVycyB8fCB7fSxcblx0XHRiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdyA9XG5cdFx0XHR0eXBlb2YgbVBhcmFtLmJQcmVzZXJ2ZUNoYW5nZXMgPT09IFwidW5kZWZpbmVkXCIgfHwgKHR5cGVvZiBtUGFyYW0uYlByZXNlcnZlQ2hhbmdlcyA9PT0gXCJib29sZWFuXCIgJiYgbVBhcmFtLmJQcmVzZXJ2ZUNoYW5nZXMpOyAvL2RlZmF1bHQgdHJ1ZVxuXG5cdC8qKlxuXHQgKiBPdmVyd3JpdGUgdGhlIGV4aXN0aW5nIGNoYW5nZS5cblx0ICpcblx0ICogQHJldHVybnMgUmVzb2x2ZXMgd2l0aCByZXN1bHQgb2Yge0BsaW5rIHNhcC5mZS5jb3JlLmFjdGlvbnMjZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbn1cblx0ICovXG5cdGFzeW5jIGZ1bmN0aW9uIG92ZXJ3cml0ZUNoYW5nZSgpIHtcblx0XHQvL092ZXJ3cml0ZSBleGlzdGluZyBjaGFuZ2VzXG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBkcmFmdERhdGFDb250ZXh0ID0gb01vZGVsLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gZ2V0UmVzb3VyY2VNb2RlbChtUGFyYW1ldGVycy5vVmlldyk7XG5cdFx0Y29uc3QgZHJhZnRBZG1pbkRhdGEgPSBhd2FpdCBkcmFmdERhdGFDb250ZXh0LnJlcXVlc3RPYmplY3QoKTtcblx0XHRpZiAoZHJhZnRBZG1pbkRhdGEpIHtcblx0XHRcdC8vIHJlbW92ZSBhbGwgdW5ib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIGFzIHdlIHNob3cgYSBzcGVjaWFsIGRpYWxvZ1xuXHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdGxldCBzSW5mbyA9IGRyYWZ0QWRtaW5EYXRhLkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uIHx8IGRyYWZ0QWRtaW5EYXRhLkluUHJvY2Vzc0J5VXNlcjtcblx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAobVBhcmFtZXRlcnMub1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRcdGlmIChzSW5mbykge1xuXHRcdFx0XHRjb25zdCBzTG9ja2VkQnlVc2VyTXNnID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19EUkFGVF9PQkpFQ1RfUEFHRV9EUkFGVF9MT0NLRURfQllfVVNFUlwiLCBzSW5mbywgc0VudGl0eVNldCk7XG5cdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3Ioc0xvY2tlZEJ5VXNlck1zZyk7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihzTG9ja2VkQnlVc2VyTXNnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNJbmZvID0gZHJhZnRBZG1pbkRhdGEuQ3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uIHx8IGRyYWZ0QWRtaW5EYXRhLkNyZWF0ZWRCeVVzZXI7XG5cdFx0XHRcdGNvbnN0IHNVbnNhdmVkQ2hhbmdlc01zZyA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfRFJBRlRfT0JKRUNUX1BBR0VfRFJBRlRfVU5TQVZFRF9DSEFOR0VTXCIsIHNJbmZvLCBzRW50aXR5U2V0KTtcblx0XHRcdFx0YXdhaXQgZHJhZnQuc2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94KHNVbnNhdmVkQ2hhbmdlc01zZywgb0NvbnRleHQpO1xuXHRcdFx0XHRyZXR1cm4gZHJhZnQuZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbihvQ29udGV4dCwgZmFsc2UsIG1QYXJhbWV0ZXJzLm9WaWV3KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBEcmFmdCBjcmVhdGlvbiBhYm9ydGVkIGZvciBkb2N1bWVudDogJHtvQ29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdH1cblxuXHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyBjb250ZXh0IHRvIGFjdGl2ZSBkb2N1bWVudCBpcyByZXF1aXJlZFwiKTtcblx0fVxuXHRsZXQgb0RyYWZ0Q29udGV4dDogQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0dHJ5IHtcblx0XHRvRHJhZnRDb250ZXh0ID0gYXdhaXQgZHJhZnQuZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbihvQ29udGV4dCwgYlJ1blByZXNlcnZlQ2hhbmdlc0Zsb3csIG1QYXJhbWV0ZXJzLm9WaWV3KTtcblx0fSBjYXRjaCAob1Jlc3BvbnNlOiBhbnkpIHtcblx0XHRpZiAob1Jlc3BvbnNlLnN0YXR1cyA9PT0gNDA5IHx8IG9SZXNwb25zZS5zdGF0dXMgPT09IDQxMiB8fCBvUmVzcG9uc2Uuc3RhdHVzID09PSA0MjMpIHtcblx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdGNvbnN0IHNpYmxpbmdJbmZvID0gYXdhaXQgZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvQ29udGV4dCwgb0NvbnRleHQpO1xuXHRcdFx0aWYgKHNpYmxpbmdJbmZvPy50YXJnZXRDb250ZXh0KSB7XG5cdFx0XHRcdC8vdGhlcmUgaXMgYSBjb250ZXh0IGF1dGhvcml6ZWQgdG8gYmUgZWRpdGVkIGJ5IHRoZSBjdXJyZW50IHVzZXJcblx0XHRcdFx0YXdhaXQgQ29tbW9uVXRpbHMud2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCk7XG5cdFx0XHRcdHJldHVybiBzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly90aGVyZSBpcyBubyBkcmFmdCBvd25lZCBieSB0aGUgY3VycmVudCB1c2VyXG5cdFx0XHRcdG9EcmFmdENvbnRleHQgPSBhd2FpdCBvdmVyd3JpdGVDaGFuZ2UoKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCEob1Jlc3BvbnNlICYmIG9SZXNwb25zZS5jYW5jZWxlZCkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihvUmVzcG9uc2UpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChvRHJhZnRDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc0VkaXRBY3Rpb25OYW1lID0gZHJhZnQuZ2V0QWN0aW9uTmFtZShvRHJhZnRDb250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuRURJVCk7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNFZGl0QWN0aW9uTmFtZSwgb0RyYWZ0Q29udGV4dCk7XG5cdFx0aWYgKG9TaWRlRWZmZWN0cz8udHJpZ2dlckFjdGlvbnM/Lmxlbmd0aCkge1xuXHRcdFx0YXdhaXQgb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5yZXF1ZXN0U2lkZUVmZmVjdHNGb3JPRGF0YUFjdGlvbihvU2lkZUVmZmVjdHMsIG9EcmFmdENvbnRleHQpO1xuXHRcdFx0cmV0dXJuIG9EcmFmdENvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBvRHJhZnRDb250ZXh0O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG4vKipcbiAqIENyZWF0ZXMgYW4gYWN0aXZlIGRvY3VtZW50IGZyb20gYSBkcmFmdCBkb2N1bWVudC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gc3VwcG9ydHMgc2V2ZXJhbCBob29rcyBhcyB0aGVyZSBpcyBhIGNlcnRhaW4gY2hvcmVvZ3JhcGh5IGRlZmluZWQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2FjdGl2YXRlRG9jdW1lbnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gbVBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50XSBDYWxsYmFjayB0aGF0IGFsbG93cyBhIHZldG8gYmVmb3JlIHRoZSAnQ3JlYXRlJyByZXF1ZXN0IGlzIGV4ZWN1dGVkXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50XSBDYWxsYmFjayBmb3IgcG9zdHByb2Nlc3NpbmcgYWZ0ZXIgZG9jdW1lbnQgd2FzIGFjdGl2YXRlZC5cbiAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dCBjb250ZXh0fSBvZiB0aGUgbmV3IGRyYWZ0IGRvY3VtZW50XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlRG9jdW1lbnQoXG5cdG9Db250ZXh0OiBDb250ZXh0LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiB7IGZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudD86IGFueTsgZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQ/OiBhbnkgfSxcblx0bWVzc2FnZUhhbmRsZXI/OiBNZXNzYWdlSGFuZGxlclxuKSB7XG5cdGNvbnN0IG1QYXJhbSA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyBjb250ZXh0IHRvIGRyYWZ0IGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHR9XG5cblx0Y29uc3QgYkV4ZWN1dGUgPSBtUGFyYW0uZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50ID8gYXdhaXQgbVBhcmFtLmZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudChvQ29udGV4dCkgOiB0cnVlO1xuXHRpZiAoIWJFeGVjdXRlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBBY3RpdmF0aW9uIG9mIHRoZSBkb2N1bWVudCB3YXMgYWJvcnRlZCBieSBleHRlbnNpb24gZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0fVxuXG5cdGxldCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0OiBhbnk7XG5cdGlmICghaGFzUHJlcGFyZUFjdGlvbihvQ29udGV4dCkpIHtcblx0XHRvQWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gYXdhaXQgZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbihvQ29udGV4dCwgb0FwcENvbXBvbmVudCk7XG5cdH0gZWxzZSB7XG5cdFx0LyogYWN0aXZhdGlvbiByZXF1aXJlcyBwcmVwYXJhdGlvbiAqL1xuXHRcdGNvbnN0IHNCYXRjaEdyb3VwID0gXCJkcmFmdFwiO1xuXHRcdC8vIHdlIHVzZSB0aGUgc2FtZSBiYXRjaEdyb3VwIHRvIGZvcmNlIHByZXBhcmUgYW5kIGFjdGl2YXRlIGluIGEgc2FtZSBiYXRjaCBidXQgd2l0aCBkaWZmZXJlbnQgY2hhbmdlc2V0XG5cdFx0bGV0IG9QcmVwYXJlUHJvbWlzZSA9IGRyYWZ0LmV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uKG9Db250ZXh0LCBzQmF0Y2hHcm91cCwgZmFsc2UpO1xuXHRcdG9Db250ZXh0LmdldE1vZGVsKCkuc3VibWl0QmF0Y2goc0JhdGNoR3JvdXApO1xuXHRcdGNvbnN0IG9BY3RpdmF0ZVByb21pc2UgPSBkcmFmdC5leGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uKG9Db250ZXh0LCBvQXBwQ29tcG9uZW50LCBzQmF0Y2hHcm91cCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKFtvUHJlcGFyZVByb21pc2UsIG9BY3RpdmF0ZVByb21pc2VdKTtcblx0XHRcdG9BY3RpdmVEb2N1bWVudENvbnRleHQgPSB2YWx1ZXNbMV07XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHQvLyBCQ1AgMjI3MDA4NDA3NVxuXHRcdFx0Ly8gaWYgdGhlIEFjdGl2YXRpb24gZmFpbHMsIHRoZW4gdGhlIG1lc3NhZ2VzIGFyZSByZXRyaWV2ZWQgZnJvbSBQUkVQQVJBVElPTiBhY3Rpb25cblx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBnZXRNZXNzYWdlUGF0aEZvclByZXBhcmUob0NvbnRleHQpO1xuXHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0b1ByZXBhcmVQcm9taXNlID0gZHJhZnQuZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24ob0NvbnRleHQsIHNCYXRjaEdyb3VwLCB0cnVlKTtcblx0XHRcdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzQmF0Y2hHcm91cCk7XG5cdFx0XHRcdGF3YWl0IG9QcmVwYXJlUHJvbWlzZTtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IGF3YWl0IG9Db250ZXh0LnJlcXVlc3RPYmplY3QoKTtcblx0XHRcdFx0aWYgKGRhdGFbc01lc3NhZ2VzUGF0aF0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdC8vaWYgbWVzc2FnZXMgYXJlIGF2YWlsYWJsZSBmcm9tIHRoZSBQUkVQQVJBVElPTiBhY3Rpb24sIHRoZW4gcHJldmlvdXMgdHJhbnNpdGlvbiBtZXNzYWdlcyBhcmUgcmVtb3ZlZFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyPy5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoZmFsc2UsIGZhbHNlLCBvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtUGFyYW0uZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQgPyBtUGFyYW0uZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQob0NvbnRleHQsIG9BY3RpdmVEb2N1bWVudENvbnRleHQpIDogb0FjdGl2ZURvY3VtZW50Q29udGV4dDtcbn1cblxuLyoqXG4gKiBEaXNwbGF5IHRoZSBjb25maXJtYXRpb24gZGlhbG9nIGJveCBhZnRlciBwcmVzc2luZyB0aGUgZWRpdCBidXR0b24gb2YgYW4gb2JqZWN0IHBhZ2Ugd2l0aCB1bnNhdmVkIGNoYW5nZXMuXG4gKlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdCNzaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3hcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gc1Vuc2F2ZWRDaGFuZ2VzTXNnIERpYWxvZyBib3ggbWVzc2FnZSBpbmZvcm1pbmcgdGhlIHVzZXIgdGhhdCBpZiBoZSBzdGFydHMgZWRpdGluZywgdGhlIHByZXZpb3VzIHVuc2F2ZWQgY2hhbmdlcyB3aWxsIGJlIGxvc3RcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXNcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gc2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94KHNVbnNhdmVkQ2hhbmdlc01zZzogc3RyaW5nLCBvQ29udGV4dDogQ29udGV4dCkge1xuXHRjb25zdCBsb2NhbEkxOG5SZWYgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyh7XG5cdFx0XHR0aXRsZTogbG9jYWxJMThuUmVmLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9XQVJOSU5HXCIpLFxuXHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0Y29udGVudDogbmV3IFRleHQoe1xuXHRcdFx0XHR0ZXh0OiBzVW5zYXZlZENoYW5nZXNNc2dcblx0XHRcdH0pLFxuXHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHR0ZXh0OiBsb2NhbEkxOG5SZWYuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0VESVRcIiksXG5cdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRyZXNvbHZlKHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IGxvY2FsSTE4blJlZi5nZXRUZXh0KFwiQ19DT01NT05fT0JKRUNUX1BBR0VfQ0FOQ0VMXCIpLFxuXHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRyZWplY3QoYERyYWZ0IGNyZWF0aW9uIGFib3J0ZWQgZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSksXG5cdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG9EaWFsb2cuYWRkU3R5bGVDbGFzcyhcInNhcFVpQ29udGVudFBhZGRpbmdcIik7XG5cdFx0b0RpYWxvZy5vcGVuKCk7XG5cdH0pO1xufVxuXG4vKipcbiAqIEhUVFAgUE9TVCBjYWxsIHdoZW4gRHJhZnRBY3Rpb24gaXMgcHJlc2VudCBmb3IgRHJhZnQgRGVsZXRlOyBIVFRQIERFTEVURSBjYWxsIHdoZW4gdGhlcmUgaXMgbm8gRHJhZnRBY3Rpb25cbiAqIGFuZCBBY3RpdmUgSW5zdGFuY2UgYWx3YXlzIHVzZXMgREVMRVRFLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdCNkZWxldGVEcmFmdFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSBkaXNjYXJkZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIGRpc2NhcmRlZFxuICogQHBhcmFtIGJFbmFibGVTdHJpY3RIYW5kbGluZ1xuICogQHByaXZhdGVcbiAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBjb250ZXh0IGlzIGRlbGV0ZWRcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBkZWxldGVEcmFmdChvQ29udGV4dDogQ29udGV4dCwgb0FwcENvbXBvbmVudD86IEFwcENvbXBvbmVudCwgYkVuYWJsZVN0cmljdEhhbmRsaW5nPzogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRjb25zdCBzRGlzY2FyZEFjdGlvbiA9IGdldEFjdGlvbk5hbWUob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5ESVNDQVJEKSxcblx0XHRiSXNBY3RpdmVFbnRpdHkgPSBvQ29udGV4dC5nZXRPYmplY3QoKS5Jc0FjdGl2ZUVudGl0eTtcblxuXHRpZiAoYklzQWN0aXZlRW50aXR5IHx8ICghYklzQWN0aXZlRW50aXR5ICYmICFzRGlzY2FyZEFjdGlvbikpIHtcblx0XHQvL1VzZSBEZWxldGUgaW4gY2FzZSBvZiBhY3RpdmUgZW50aXR5IGFuZCBubyBkaXNjYXJkIGFjdGlvbiBhdmFpbGFibGUgZm9yIGRyYWZ0XG5cdFx0aWYgKG9Db250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdHJldHVybiBvQ29udGV4dFxuXHRcdFx0XHQuZ2V0QmluZGluZygpXG5cdFx0XHRcdC5yZXNldENoYW5nZXMoKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250ZXh0LmRlbGV0ZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG9Db250ZXh0LmRlbGV0ZSgpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvL1VzZSBEaXNjYXJkIFBvc3QgQWN0aW9uIGlmIGl0IGlzIGEgZHJhZnQgZW50aXR5IGFuZCBkaXNjYXJkIGFjdGlvbiBleGlzdHNcblx0XHRyZXR1cm4gZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbihvQ29udGV4dCwgb0FwcENvbXBvbmVudCwgYkVuYWJsZVN0cmljdEhhbmRsaW5nKTtcblx0fVxufVxuXG5jb25zdCBkcmFmdCA9IHtcblx0Y3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQ6IGNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50LFxuXHRhY3RpdmF0ZURvY3VtZW50OiBhY3RpdmF0ZURvY3VtZW50LFxuXHRkZWxldGVEcmFmdDogZGVsZXRlRHJhZnQsXG5cdGV4ZWN1dGVEcmFmdEVkaXRBY3Rpb246IGV4ZWN1dGVEcmFmdEVkaXRBY3Rpb24sXG5cdGV4ZWN1dGVEcmFmdFZhbGlkYXRpb246IGV4ZWN1dGVEcmFmdFZhbGlkYXRpb24sXG5cdGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uOiBleGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbixcblx0ZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbjogZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbixcblx0aGFzUHJlcGFyZUFjdGlvbjogaGFzUHJlcGFyZUFjdGlvbixcblx0Z2V0TWVzc2FnZXNQYXRoOiBnZXRNZXNzYWdlc1BhdGgsXG5cdGNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb246IGNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24sXG5cdHByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uOiBkcmFmdERhdGFMb3NzUG9wdXAucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24sXG5cdHNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbjogZHJhZnREYXRhTG9zc1BvcHVwLnNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbixcblx0Y3JlYXRlT3BlcmF0aW9uOiBjcmVhdGVPcGVyYXRpb24sXG5cdGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb246IGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24sXG5cdE5hdmlnYXRpb25UeXBlOiBkcmFmdERhdGFMb3NzUG9wdXAuTmF2aWdhdGlvblR5cGUsXG5cdGdldEFjdGlvbk5hbWU6IGdldEFjdGlvbk5hbWUsXG5cdHNob3dFZGl0Q29uZmlybWF0aW9uTWVzc2FnZUJveDogc2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkcmFmdDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUF3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQSxNQUFNQSxlQUFlLEdBQUc7SUFDdkJDLElBQUksRUFBRSxZQUFZO0lBQ2xCQyxVQUFVLEVBQUUsa0JBQWtCO0lBQzlCQyxPQUFPLEVBQUUsZUFBZTtJQUN4QkMsT0FBTyxFQUFFO0VBQ1YsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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