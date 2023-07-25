/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../../operationsHelper", "./_internal"], function (Log, ActionRuntime, CommonUtils, BusyLocker, messageHandling, FPMHelper, ResourceModelHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, Core, Fragment, library, Message, XMLPreprocessor, XMLTemplateProcessor, JSONModel, operationsHelper, _internal) {
  "use strict";

  var _validateProperties = _internal._validateProperties;
  var _addMessageForActionParameter = _internal._addMessageForActionParameter;
  var MessageType = library.MessageType;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  const Constants = FELibrary.Constants,
    InvocationGrouping = FELibrary.InvocationGrouping;
  const Action = MessageBox.Action;

  /**
   * Calls a bound action for one or multiple contexts.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callBoundAction
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action to be called
   * @param contexts Either one context or an array with contexts for which the action is to be be called
   * @param oModel OData Model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.mBindingParameters] A map of binding parameters that would be part of $select and $expand coming from side effects for bound actions
   * @param [mParameters.additionalSideEffect] Array of property paths to be requested in addition to actual target properties of the side effect
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.invocationGrouping] Mode how actions are to be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets, defaults to Isolated
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [mParameters.parentControl] If specified, the dialogs are added as dependent of the parent control
   * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callBoundAction(sActionName, contexts, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!strictHandlingUtilities) {
      strictHandlingUtilities = {
        is412Executed: false,
        strictHandlingTransitionFails: [],
        strictHandlingPromises: [],
        strictHandlingWarningMessages: [],
        delaySuccessMessages: [],
        processedMessageIds: []
      };
    }
    if (!contexts || contexts.length === 0) {
      //In Freestyle apps bound actions can have no context
      return Promise.reject("Bound actions always requires at least one context");
    }
    // this method either accepts single context or an array of contexts
    // TODO: Refactor to an unambiguos API
    const isCalledWithArray = Array.isArray(contexts);

    // in case of single context wrap into an array for called methods (esp. callAction)
    mParameters.aContexts = isCalledWithArray ? contexts : [contexts];
    const oMetaModel = oModel.getMetaModel(),
      // Analyzing metaModelPath for action only from first context seems weird, but probably works in all existing szenarios - if several contexts are passed, they probably
      // belong to the same metamodelpath. TODO: Check, whether this can be improved / szenarios with different metaModelPaths might exist
      sActionPath = `${oMetaModel.getMetaPath(mParameters.aContexts[0].getPath())}/${sActionName}`,
      oBoundAction = oMetaModel.createBindingContext(`${sActionPath}/@$ui5.overload/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, sActionPath, mParameters.aContexts, oBoundAction);

    // Promise returned by callAction currently is rejected in case of execution for multiple contexts partly failing. This should be changed (some failing contexts do not mean
    // that function did not fulfill its task), but as this is a bigger refactoring, for the time being we need to deal with that at the calling place (i.e. here)
    // => provide the same handler (mapping back from array to single result/error if needed) for resolved/rejected case
    const extractSingleResult = function (result) {
      // single action could be resolved or rejected
      if (result[0].status === "fulfilled") {
        return result[0].value;
      } else {
        // In case of dialog cancellation, no array is returned => throw the result.
        // Ideally, differentiating should not be needed here => TODO: Find better solution when separating dialog handling (single object with single result) from backend
        // execution (potentially multiple objects)
        throw result[0].reason || result;
      }
    };
    return callAction(sActionName, oModel, oBoundAction, oAppComponent, mParameters, strictHandlingUtilities).then(result => {
      if (isCalledWithArray) {
        return result;
      } else {
        return extractSingleResult(result);
      }
    }, result => {
      if (isCalledWithArray) {
        throw result;
      } else {
        return extractSingleResult(result);
      }
    });
  }
  /**
   * Calls an action import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callActionImport
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action import to be called
   * @param oModel An instance of an OData V4 model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callActionImport(sActionName, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!oModel) {
      return Promise.reject("Action expects a model/context for execution");
    }
    const oMetaModel = oModel.getMetaModel(),
      sActionPath = oModel.bindContext(`/${sActionName}`).getPath(),
      oActionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sActionPath).getObject("$Action")}/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, `${sActionPath}/@$ui5.overload`);
    return callAction(sActionName, oModel, oActionImport, oAppComponent, mParameters, strictHandlingUtilities);
  }
  function callBoundFunction(sFunctionName, context, oModel) {
    if (!context) {
      return Promise.reject("Bound functions always requires a context");
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = `${oMetaModel.getMetaPath(context.getPath())}/${sFunctionName}`,
      oBoundFunction = oMetaModel.createBindingContext(sFunctionPath);
    return _executeFunction(sFunctionName, oModel, oBoundFunction, context);
  }
  /**
   * Calls a function import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callFunctionImport
   * @memberof sap.fe.core.actions.operations
   * @param sFunctionName The name of the function to be called
   * @param oModel An instance of an OData v4 model
   * @returns Promise resolves
   * @private
   */
  function callFunctionImport(sFunctionName, oModel) {
    if (!sFunctionName) {
      return Promise.resolve();
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = oModel.bindContext(`/${sFunctionName}`).getPath(),
      oFunctionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sFunctionPath).getObject("$Function")}/0`);
    return _executeFunction(sFunctionName, oModel, oFunctionImport);
  }
  function _executeFunction(sFunctionName, oModel, oFunction, context) {
    let sGroupId;
    if (!oFunction || !oFunction.getObject()) {
      return Promise.reject(new Error(`Function ${sFunctionName} not found`));
    }
    if (context) {
      oFunction = oModel.bindContext(`${context.getPath()}/${sFunctionName}(...)`);
      sGroupId = "functionGroup";
    } else {
      oFunction = oModel.bindContext(`/${sFunctionName}(...)`);
      sGroupId = "functionImport";
    }
    const oFunctionPromise = oFunction.execute(sGroupId);
    oModel.submitBatch(sGroupId);
    return oFunctionPromise.then(function () {
      return oFunction.getBoundContext();
    });
  }
  function callAction(sActionName, oModel, oAction, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!strictHandlingUtilities) {
      strictHandlingUtilities = {
        is412Executed: false,
        strictHandlingTransitionFails: [],
        strictHandlingPromises: [],
        strictHandlingWarningMessages: [],
        delaySuccessMessages: [],
        processedMessageIds: []
      };
    }
    mParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
    return new Promise(async function (resolve, reject) {
      let mActionExecutionParameters = {};
      let fnDialog;
      let oActionPromise;
      //let failedActionPromise: any;
      const sActionLabel = mParameters.label;
      const bSkipParameterDialog = mParameters.skipParameterDialog;
      const aContexts = mParameters.aContexts;
      const bIsCreateAction = mParameters.bIsCreateAction;
      const bIsCriticalAction = mParameters.isCriticalAction;
      let oMetaModel;
      let sMetaPath;
      let sMessagesPath;
      let iMessageSideEffect;
      let bIsSameEntity;
      let oReturnType;
      let bValuesProvidedForAllParameters;
      const actionDefinition = oAction.getObject();
      if (!oAction || !oAction.getObject()) {
        return reject(new Error(`Action ${sActionName} not found`));
      }

      // Get the parameters of the action
      const aActionParameters = getActionParameters(oAction);

      // Check if the action has parameters and would need a parameter dialog
      // The parameter ResultIsActiveEntity is always hidden in the dialog! Hence if
      // this is the only parameter, this is treated as no parameter here because the
      // dialog would be empty!
      // FIXME: Should only ignore this if this is a 'create' action, otherwise it is just some normal parameter that happens to have this name
      const bActionNeedsParameterDialog = aActionParameters.length > 0 && !(aActionParameters.length === 1 && aActionParameters[0].$Name === "ResultIsActiveEntity");

      // Provided values for the action parameters from invokeAction call
      const aParameterValues = mParameters.parameterValues;

      // Determine startup parameters if provided
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};

      // In case an action parameter is needed, and we shall skip the dialog, check if values are provided for all parameters
      if (bActionNeedsParameterDialog && bSkipParameterDialog) {
        bValuesProvidedForAllParameters = _valuesProvidedForAllParameters(bIsCreateAction, aActionParameters, aParameterValues, oStartupParameters);
      }

      // Depending on the previously determined data, either set a dialog or leave it empty which
      // will lead to direct execution of the action without a dialog
      fnDialog = null;
      if (bActionNeedsParameterDialog) {
        if (!(bSkipParameterDialog && bValuesProvidedForAllParameters)) {
          fnDialog = showActionParameterDialog;
        }
      } else if (bIsCriticalAction) {
        fnDialog = confirmCriticalAction;
      }
      mActionExecutionParameters = {
        fnOnSubmitted: mParameters.onSubmitted,
        fnOnResponse: mParameters.onResponse,
        actionName: sActionName,
        model: oModel,
        aActionParameters: aActionParameters,
        bGetBoundContext: mParameters.bGetBoundContext,
        defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
        label: mParameters.label,
        selectedItems: mParameters.selectedItems
      };
      if (oAction.getObject("$IsBound")) {
        if (mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions) {
          oMetaModel = oModel.getMetaModel();
          sMetaPath = oMetaModel.getMetaPath(aContexts[0].getPath());
          sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            iMessageSideEffect = mParameters.additionalSideEffect.pathExpressions.findIndex(function (exp) {
              return typeof exp === "string" && exp === sMessagesPath;
            });

            // Add SAP_Messages by default if not annotated by side effects, action does not return a collection and
            // the return type is the same as the bound type
            oReturnType = oAction.getObject("$ReturnType");
            bIsSameEntity = oReturnType && !oReturnType.$isCollection && oAction.getModel().getObject(sMetaPath).$Type === oReturnType.$Type;
            if (iMessageSideEffect > -1 || bIsSameEntity) {
              // the message path is annotated as side effect. As there's no binding for it and the model does currently not allow
              // to add it at a later point of time we have to take care it's part of the $select of the POST, therefore moving it.
              mParameters.mBindingParameters = mParameters.mBindingParameters || {};
              if (oAction.getObject(`$ReturnType/$Type/${sMessagesPath}`) && (!mParameters.mBindingParameters.$select || mParameters.mBindingParameters.$select.split(",").indexOf(sMessagesPath) === -1)) {
                mParameters.mBindingParameters.$select = mParameters.mBindingParameters.$select ? `${mParameters.mBindingParameters.$select},${sMessagesPath}` : sMessagesPath;
                // Add side effects at entity level because $select stops these being returned by the action
                // Only if no other side effects were added for Messages
                if (iMessageSideEffect === -1) {
                  mParameters.additionalSideEffect.pathExpressions.push("*");
                }
                if (mParameters.additionalSideEffect.triggerActions.length === 0 && iMessageSideEffect > -1) {
                  // no trigger action therefore no need to request messages again
                  mParameters.additionalSideEffect.pathExpressions.splice(iMessageSideEffect, 1);
                }
              }
            }
          }
        }
        mActionExecutionParameters.aContexts = aContexts;
        mActionExecutionParameters.mBindingParameters = mParameters.mBindingParameters;
        mActionExecutionParameters.additionalSideEffect = mParameters.additionalSideEffect;
        mActionExecutionParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
        mActionExecutionParameters.internalModelContext = mParameters.internalModelContext;
        mActionExecutionParameters.operationAvailableMap = mParameters.operationAvailableMap;
        mActionExecutionParameters.isCreateAction = bIsCreateAction;
        mActionExecutionParameters.bObjectPage = mParameters.bObjectPage;
        if (mParameters.controlId) {
          mActionExecutionParameters.control = mParameters.parentControl.byId(mParameters.controlId);
          mParameters.control = mActionExecutionParameters.control;
        } else {
          mActionExecutionParameters.control = mParameters.parentControl;
          mParameters.control = mParameters.parentControl;
        }
      }
      if (bIsCreateAction) {
        mActionExecutionParameters.bIsCreateAction = bIsCreateAction;
      }
      //check for skipping static actions
      const isStatic = (actionDefinition.$Parameter || []).some(aParameter => {
        return (actionDefinition.$EntitySetPath && actionDefinition.$EntitySetPath === aParameter.$Name || actionDefinition.$IsBound) && aParameter.$isCollection;
      });
      mActionExecutionParameters.isStatic = isStatic;
      if (fnDialog) {
        oActionPromise = fnDialog(sActionName, oAppComponent, sActionLabel, mActionExecutionParameters, aActionParameters, aParameterValues, oAction, mParameters.parentControl, mParameters.entitySetName, mParameters.messageHandler, strictHandlingUtilities);
        return oActionPromise.then(function (oOperationResult) {
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        }).catch(function (oOperationResult) {
          reject(oOperationResult);
        });
      } else {
        // Take over all provided parameter values and call the action.
        // This shall only happen if values are provided for all the parameters, otherwise the parameter dialog shall be shown which is ensured earlier
        if (aParameterValues) {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _aParameterValues$fin;
            mActionExecutionParameters.aActionParameters[i].value = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin = aParameterValues.find(element => element.name === mActionExecutionParameters.aActionParameters[i].$Name)) === null || _aParameterValues$fin === void 0 ? void 0 : _aParameterValues$fin.value;
          }
        } else {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _oStartupParameters$m;
            mActionExecutionParameters.aActionParameters[i].value = (_oStartupParameters$m = oStartupParameters[mActionExecutionParameters.aActionParameters[i].$Name]) === null || _oStartupParameters$m === void 0 ? void 0 : _oStartupParameters$m[0];
          }
        }
        let oOperationResult;
        try {
          oOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
          const messages = Core.getMessageManager().getMessageModel().getData();
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
          }
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        } catch {
          reject(oOperationResult);
        } finally {
          var _mParameters$messageH, _mActionExecutionPara;
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            try {
              const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
              const aFailedContexts = [];
              strictHandlingFails.forEach(function (fail) {
                aFailedContexts.push(fail.oAction.getContext());
              });
              mActionExecutionParameters.aContexts = aFailedContexts;
              const oFailedOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
              strictHandlingUtilities.strictHandlingTransitionFails = [];
              Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
              afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
              resolve(oFailedOperationResult);
            } catch (oFailedOperationResult) {
              reject(oFailedOperationResult);
            }
          }
          let showGenericErrorMessageForChangeSet = false;
          if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
            showGenericErrorMessageForChangeSet = true;
          }
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$messageH = mParameters.messageHandler) === null || _mParameters$messageH === void 0 ? void 0 : _mParameters$messageH.showMessageDialog({
            control: (_mActionExecutionPara = mActionExecutionParameters) === null || _mActionExecutionPara === void 0 ? void 0 : _mActionExecutionPara.control,
            onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
              return actionParameterShowMessageCallback(mParameters, aContexts, undefined, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
            },
            aSelectedContexts: mParameters.aContexts,
            sActionName: sActionLabel
          });
          if (strictHandlingUtilities) {
            strictHandlingUtilities = {
              is412Executed: false,
              strictHandlingTransitionFails: [],
              strictHandlingPromises: [],
              strictHandlingWarningMessages: [],
              delaySuccessMessages: [],
              processedMessageIds: []
            };
          }
        }
      }
    });
  }
  function confirmCriticalAction(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler) {
    return new Promise((resolve, reject) => {
      let boundActionName = sActionName ? sActionName : null;
      boundActionName = boundActionName.indexOf(".") >= 0 ? boundActionName.split(".")[boundActionName.split(".").length - 1] : boundActionName;
      const suffixResourceKey = boundActionName && entitySetName ? `${entitySetName}|${boundActionName}` : "";
      const resourceModel = getResourceModel(oParentControl);
      const sConfirmationText = resourceModel.getText("C_OPERATIONS_ACTION_CONFIRM_MESSAGE", undefined, suffixResourceKey);
      MessageBox.confirm(sConfirmationText, {
        onClose: async function (sAction) {
          if (sAction === Action.OK) {
            try {
              const oOperation = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler);
              resolve(oOperation);
            } catch (oError) {
              try {
                await messageHandler.showMessageDialog();
                reject(oError);
              } catch (e) {
                reject(oError);
              }
            }
          } else {
            resolve();
          }
        }
      });
    });
  }
  async function executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, after412, strictHandlingUtilities) {
    var _mParameters$aContext;
    const aResult = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities);
    // If some entries were successful, and others have failed, the overall process is still successful. However, this was treated as rejection
    // before, and this currently is still kept, as long as dialog handling is mixed with backend process handling.
    // TODO: Refactor to only reject in case of overall process error.
    // For the time being: map to old logic to reject if at least one entry has failed
    // This check is only done for bound actions => aContexts not empty
    if ((_mParameters$aContext = mParameters.aContexts) !== null && _mParameters$aContext !== void 0 && _mParameters$aContext.length) {
      if (aResult !== null && aResult !== void 0 && aResult.some(oSingleResult => oSingleResult.status === "rejected")) {
        throw aResult;
      }
    }
    const messages = Core.getMessageManager().getMessageModel().getData();
    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
      if (!after412) {
        strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
      } else {
        Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
        let showGenericErrorMessageForChangeSet = false;
        if (mParameters.bGrouped && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
          showGenericErrorMessageForChangeSet = true;
        }
        if (messages.length) {
          // BOUND TRANSITION AS PART OF SAP_MESSAGE
          oDialog.attachEventOnce("afterClose", function () {
            messageHandler.showMessageDialog({
              onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
              },
              control: mParameters.control,
              aSelectedContexts: mParameters.aContexts,
              sActionName: mParameters.label
            });
          });
        }
      }
    } else if (messages.length) {
      // BOUND TRANSITION AS PART OF SAP_MESSAGE
      let showGenericErrorMessageForChangeSet = false;
      if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
        showGenericErrorMessageForChangeSet = true;
      }
      oDialog.attachEventOnce("afterClose", function () {
        messageHandler.showMessageDialog({
          isActionParameterDialogOpen: mParameters === null || mParameters === void 0 ? void 0 : mParameters.oDialog.isOpen(),
          onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
            return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
          },
          control: mParameters.control,
          aSelectedContexts: mParameters.aContexts,
          sActionName: mParameters.label
        });
      });
    }
    return aResult;
  }
  function afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition) {
    if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.operationAvailableMap && mActionExecutionParameters.aContexts && mActionExecutionParameters.aContexts.length && actionDefinition.$IsBound) {
      //check for skipping static actions
      const isStatic = mActionExecutionParameters.isStatic;
      if (!isStatic) {
        ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), mParameters.selectedItems, "table");
      } else if (mActionExecutionParameters.control) {
        const oControl = mActionExecutionParameters.control;
        if (oControl.isA("sap.ui.mdc.Table")) {
          const aSelectedContexts = oControl.getSelectedContexts();
          ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), aSelectedContexts, "table");
        }
      }
    }
  }
  function actionParameterShowMessageCallback(mParameters, aContexts, oDialog, messages, showMessageParametersIn, showGenericErrorMessageForChangeSet) {
    let showMessageBox = showMessageParametersIn.showMessageBox,
      showMessageDialog = showMessageParametersIn.showMessageDialog;
    const oControl = mParameters.control;
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    const unboundMessages = messages.filter(function (message) {
      return message.getTarget() === "";
    });
    const APDmessages = messages.filter(function (message) {
      var _mParameters$aActionP;
      return message.getTarget && message.getTarget().indexOf(mParameters.actionName) !== -1 && (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$aActionP = mParameters.aActionParameters) === null || _mParameters$aActionP === void 0 ? void 0 : _mParameters$aActionP.some(function (actionParam) {
        return message.getTarget().indexOf(actionParam.$Name) !== -1;
      }));
    });
    APDmessages === null || APDmessages === void 0 ? void 0 : APDmessages.forEach(function (APDMessage) {
      APDMessage.isAPDTarget = true;
    });
    const errorTargetsInAPD = APDmessages.length ? true : false;
    let hasChangeSetModifiedMessage = false;
    if (showGenericErrorMessageForChangeSet && !errorTargetsInAPD) {
      hasChangeSetModifiedMessage = true;
      let sMessage = oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_ERROR_MESSAGES_TEXT");
      let sDescriptionText = oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_ERROR_MESSAGES_DETAIL_TEXT");
      const messageModel = Core.getMessageManager().getMessageModel();
      const messagesInModel = messageModel.getData();
      const aBoundMessages = messageHandling.getMessages(true);
      let genericMessage;
      const isEditable = oControl && oControl.getModel("ui").getProperty("/isEditable");
      const nonErrorMessageExistsInDialog = messages.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
      const nonErrorMessageExistsInModel = messagesInModel.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
      if (nonErrorMessageExistsInDialog !== 1 && nonErrorMessageExistsInModel !== -1) {
        if (messagesInModel.length === 1 && aBoundMessages.length === 1) {
          if (isEditable === false) {
            messagesInModel[0].setMessage(oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT") + "\n\n" + messagesInModel[0].getMessage());
          } else {
            sMessage = isEditable ? oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT_EDIT") : oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT");
            sDescriptionText = "";
            genericMessage = new Message({
              message: sMessage,
              type: MessageType.Error,
              target: "",
              persistent: true,
              description: sDescriptionText,
              code: "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED"
            });
            messages.unshift(genericMessage);
            if (messages.length === 1) {
              showMessageBox = true;
              showMessageDialog = false;
            } else {
              showMessageDialog = true;
              showMessageBox = false;
            }
          }
        } else {
          genericMessage = new Message({
            message: sMessage,
            type: MessageType.Error,
            target: "",
            persistent: true,
            description: sDescriptionText,
            code: "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED"
          });
          messages.unshift(genericMessage);
          if (messages.length === 1) {
            showMessageBox = true;
            showMessageDialog = false;
          } else {
            showMessageDialog = true;
            showMessageBox = false;
          }
        }
      }
    }
    if (oDialog && oDialog.isOpen() && aContexts.length !== 0 && !mParameters.isStatic) {
      if (!mParameters.bGrouped) {
        //isolated
        if (aContexts.length > 1 || !errorTargetsInAPD) {
          // does not matter if error is in APD or not, if there are multiple contexts selected or if the error is not the APD, we close it.
          // TODO: Dilaog handling should not be part of message handling. Refactor accordingly - dialog should not be needed inside this method - neither
          // to ask whether it's open, nor to close/destroy it!
          oDialog.close();
          oDialog.destroy();
        }
      } else if (!errorTargetsInAPD) {
        //changeset
        oDialog.close();
        oDialog.destroy();
      }
    }
    let filteredMessages = [];
    const bIsAPDOpen = oDialog && oDialog.isOpen();
    if (!hasChangeSetModifiedMessage) {
      if (messages.length === 1 && messages[0].getTarget && messages[0].getTarget() !== undefined && messages[0].getTarget() !== "") {
        if (oControl && oControl.getModel("ui").getProperty("/isEditable") === false || !oControl) {
          // OP edit or LR
          showMessageBox = !errorTargetsInAPD;
          showMessageDialog = false;
        } else if (oControl && oControl.getModel("ui").getProperty("/isEditable") === true) {
          showMessageBox = false;
          showMessageDialog = false;
        }
      } else if (oControl) {
        if (oControl.getModel("ui").getProperty("/isEditable") === false) {
          if (bIsAPDOpen && errorTargetsInAPD) {
            showMessageDialog = false;
          }
        } else if (oControl.getModel("ui").getProperty("/isEditable") === true) {
          if (!bIsAPDOpen && errorTargetsInAPD) {
            showMessageDialog = true;
            filteredMessages = unboundMessages.concat(APDmessages);
          } else if (!bIsAPDOpen && unboundMessages.length === 0) {
            // error targets in APD => there is atleast one bound message. If there are unbound messages, dialog must be shown.
            // for draft entity, we already closed the APD
            showMessageDialog = false;
          }
        }
      }
    }
    return {
      showMessageBox: showMessageBox,
      showMessageDialog: showMessageDialog,
      filteredMessages: filteredMessages.length ? filteredMessages : messages,
      fnGetMessageSubtitle: oControl && oControl.isA("sap.ui.mdc.Table") && messageHandling.setMessageSubtitle.bind({}, oControl, aContexts),
      showChangeSetErrorDialog: mParameters.bGrouped
    };
  }

  /*
   * Currently, this method is responsible for showing the dialog and executing the action. The promise returned is pending while waiting for user input, as well as while the
   * back-end request is running. The promise is rejected when the user cancels the dialog and also when the back-end request fails.
   * TODO: Refactoring: Separate dialog handling from backend processing. Dialog handling should return a Promise resolving to parameters to be provided to backend. If dialog is
   * cancelled, that promise can be rejected. Method responsible for backend processing need to deal with multiple contexts - i.e. it should either return an array of Promises or
   * a Promise resolving to an array. In the latter case, that Promise should be resolved also when some or even all contexts failed in backend - the overall process still was
   * successful.
   *
   */

  function showActionParameterDialog(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler, strictHandlingUtilities) {
    const sPath = _getPath(oActionContext, sActionName),
      metaModel = oActionContext.getModel().oModel.getMetaModel(),
      entitySetContext = metaModel.createBindingContext(sPath),
      sActionNamePath = oActionContext.getObject("$IsBound") ? oActionContext.getPath().split("/@$ui5.overload/0")[0] : oActionContext.getPath().split("/0")[0],
      actionNameContext = metaModel.createBindingContext(sActionNamePath),
      bIsCreateAction = mParameters.isCreateAction,
      sFragmentName = "sap/fe/core/controls/ActionParameterDialog";
    return new Promise(async function (resolve, reject) {
      let actionParameterInfos; // to be filled after fragment (for action parameter dialog) is loaded. Actually only needed during dialog processing, i.e. could be moved into the controller and directly initialized there, but only after moving all handlers (esp. press handler for action button) to controller.

      const messageManager = Core.getMessageManager();
      const _removeMessagesForActionParamter = parameter => {
        const allMessages = messageManager.getMessageModel().getData();
        const controlId = generate(["APD_", parameter.$Name]);
        // also remove messages assigned to inner controls, but avoid removing messages for different paramters (with name being substring of another parameter name)
        const relevantMessages = allMessages.filter(msg => msg.getControlIds().some(id => controlId.split("-").includes(id)));
        messageManager.removeMessages(relevantMessages);
      };
      const oController = {
        handleChange: async function (oEvent) {
          const field = oEvent.getSource();
          const actionParameterInfo = actionParameterInfos.find(actionParameterInfo => actionParameterInfo.field === field);
          // field value is being changed, thus existing messages related to that field are not valid anymore
          _removeMessagesForActionParamter(actionParameterInfo.parameter);
          // adapt info. Promise is resolved to value or rejected with exception containing message
          actionParameterInfo.validationPromise = oEvent.getParameter("promise");
          try {
            actionParameterInfo.value = await actionParameterInfo.validationPromise;
            actionParameterInfo.hasError = false;
          } catch (error) {
            delete actionParameterInfo.value;
            actionParameterInfo.hasError = true;
            _addMessageForActionParameter(messageManager, [{
              actionParameterInfo: actionParameterInfo,
              message: error.message
            }]);
          }
        }
      };
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oParameterModel = new JSONModel({
        $displayMode: {}
      });
      try {
        const createdFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            action: oActionContext,
            actionName: actionNameContext,
            entitySet: entitySetContext
          },
          models: {
            action: oActionContext.getModel(),
            actionName: actionNameContext.getModel(),
            entitySet: entitySetContext.getModel(),
            metaModel: entitySetContext.getModel()
          }
        });
        // TODO: move the dialog into the fragment and move the handlers to the oController
        const aContexts = mParameters.aContexts || [];
        const aFunctionParams = [];
        // eslint-disable-next-line prefer-const
        let oOperationBinding;
        await CommonUtils.setUserDefaults(oAppComponent, aActionParameters, oParameterModel, true);
        const oDialogContent = await Fragment.load({
          definition: createdFragment,
          controller: oController
        });
        actionParameterInfos = aActionParameters.map(actionParameter => {
          const field = Core.byId(generate(["APD_", actionParameter.$Name]));
          const isMultiValue = field.isA("sap.ui.mdc.MultiValueField");
          return {
            parameter: actionParameter,
            field: field,
            isMultiValue: isMultiValue
          };
        });
        const resourceModel = getResourceModel(oParentControl);
        let actionResult = {
          dialogCancelled: true,
          // to be set to false in case of successful action exection
          result: undefined
        };
        const oDialog = new Dialog(generate(["fe", "APD_", sActionName]), {
          title: sActionLabel || resourceModel.getText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_TITLE"),
          content: [oDialogContent],
          escapeHandler: function () {
            // escape handler is meant to possibly suppress or postpone closing the dialog on escape (by calling "reject" on the provided object, or "resolve" only when
            // done with all tasks to happen before dialog can be closed). It's not intended to explicetly close the dialog here (that happens automatically when no
            // escapeHandler is provided or the resolve-callback is called) or for own wrap up tasks (like removing validition messages - this should happen in the
            // afterClose).
            // TODO: Move wrap up tasks to afterClose, and remove this method completely. Take care to also adapt end button press handler accordingly.
            // Currently only still needed to differentiate closing dialog after successful execution (uses resolve) from user cancellation (using reject)
            oDialog.close();
            //		reject(Constants.CancelActionDialog);
          },

          beginButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Ok"]), {
            text: bIsCreateAction ? resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON") : _getActionParameterActionName(resourceModel, sActionLabel, sActionName, entitySetName),
            type: "Emphasized",
            press: async function () {
              try {
                if (!(await _validateProperties(messageManager, actionParameterInfos, resourceModel))) {
                  return;
                }
                BusyLocker.lock(oDialog);
                try {
                  // TODO: due to using the search and value helps on the action dialog transient messages could appear
                  // we need an UX design for those to show them to the user - for now remove them before continuing
                  messageHandler.removeTransitionMessages();
                  // move parameter values from Dialog (SimpleForm) to mParameters.actionParameters so that they are available in the operation bindings for all contexts
                  let vParameterValue;
                  const oParameterContext = oOperationBinding && oOperationBinding.getParameterContext();
                  for (const i in aActionParameters) {
                    if (aActionParameters[i].$isCollection) {
                      const aMVFContent = oDialog.getModel("mvfview").getProperty(`/${aActionParameters[i].$Name}`),
                        aKeyValues = [];
                      for (const j in aMVFContent) {
                        aKeyValues.push(aMVFContent[j].Key);
                      }
                      vParameterValue = aKeyValues;
                    } else {
                      vParameterValue = oParameterContext.getProperty(aActionParameters[i].$Name);
                    }
                    aActionParameters[i].value = vParameterValue; // writing the current value (ueser input!) into the metamodel => should be refactored to use ActionParameterInfos instead. Used in setActionParameterDefaultValue
                    vParameterValue = undefined;
                  }
                  mParameters.label = sActionLabel;
                  try {
                    const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, false, strictHandlingUtilities);
                    actionResult = {
                      dialogCancelled: false,
                      result: aResult
                    };
                    oDialog.close();
                    // resolve(aResult);
                  } catch (oError) {
                    const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
                    }
                    throw oError;
                  } finally {
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      try {
                        const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
                        const aFailedContexts = [];
                        strictHandlingFails.forEach(function (fail) {
                          aFailedContexts.push(fail.oAction.getContext());
                        });
                        mParameters.aContexts = aFailedContexts;
                        const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, true, strictHandlingUtilities);
                        strictHandlingUtilities.strictHandlingTransitionFails = [];
                        actionResult = {
                          dialogCancelled: false,
                          result: aResult
                        };
                        // resolve(aResult);
                      } catch {
                        if (strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                          Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
                        }
                        let showGenericErrorMessageForChangeSet = false;
                        if (mParameters.bGrouped && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
                          showGenericErrorMessageForChangeSet = true;
                        }
                        await messageHandler.showMessageDialog({
                          isActionParameterDialogOpen: oDialog.isOpen(),
                          onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                            return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
                          },
                          aSelectedContexts: mParameters.aContexts,
                          sActionName: sActionLabel
                        });
                      }
                    }
                    if (BusyLocker.isLocked(oDialog)) {
                      BusyLocker.unlock(oDialog);
                    }
                  }
                } catch (oError) {
                  let showMessageDialog = true;
                  let showGenericErrorMessageForChangeSet = false;
                  if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
                    showGenericErrorMessageForChangeSet = true;
                  }
                  await messageHandler.showMessages({
                    context: mParameters.aContexts[0],
                    isActionParameterDialogOpen: oDialog.isOpen(),
                    messagePageNavigationCallback: function () {
                      oDialog.close();
                    },
                    onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                      // Why is this implemented as callback? Apparently, all needed information is available beforehand
                      // TODO: refactor accordingly
                      const showMessageParameters = actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
                      showMessageDialog = showMessageParameters.showMessageDialog;
                      return showMessageParameters;
                    },
                    aSelectedContexts: mParameters.aContexts,
                    sActionName: sActionLabel,
                    control: mParameters.control
                  });

                  // In case of backend validation error(s?), message shall not be shown in message dialog but next to the field on parameter dialog, which should
                  // stay open in this case => in this case, we must not resolve or reject the promise controlling the parameter dialog.
                  // In all other cases (e.g. other backend errors or user cancellation), the promise controlling the parameter dialog needs to be rejected to allow
                  // callers to react. (Example: If creation in backend after navigation to transient context fails, back navigation needs to be triggered)
                  // TODO: Refactor to separate dialog handling from backend request istead of taking decision based on message handling
                  if (showMessageDialog) {
                    if (oDialog.isOpen()) {
                      // do nothing, do not reject promise here
                      // We do not close the APM dialog if user enters a wrong value in of the fields that results in an error from the backend.
                      // The user can close the message dialog and the APM dialog would still be open on which he could enter a new value and trigger the action again.
                      // Earlier we were rejecting the promise on error here, and the call stack was destroyed as the promise was rejected and returned to EditFlow invoke action.
                      // But since the APM dialog was still open, a new promise was resolved in case the user retried the action and the object was created, but the navigation to object page was not taking place.
                    } else {
                      reject(oError);
                    }
                  }
                }
              } finally {
                if (strictHandlingUtilities) {
                  strictHandlingUtilities = {
                    is412Executed: false,
                    strictHandlingTransitionFails: [],
                    strictHandlingPromises: [],
                    strictHandlingWarningMessages: [],
                    delaySuccessMessages: [],
                    processedMessageIds: []
                  };
                }
                if (BusyLocker.isLocked(oDialog)) {
                  BusyLocker.unlock(oDialog);
                }
              }
            }
          }),
          endButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Cancel"]), {
            text: resourceModel.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL"),
            press: function () {
              // TODO: cancel button should just close the dialog (similar to using escape). All wrap up tasks should be moved to afterClose.
              oDialog.close();
              // reject(Constants.CancelActionDialog);
            }
          }),

          // TODO: beforeOpen is just an event, i.e. not waiting for the Promise to be resolved. Check if tasks of this function need to be done before opening the dialog
          // - if yes, they need to be moved outside.
          // Assumption: Sometimes dialog can be seen without any fields for a short time - maybe this is caused by this asynchronity
          beforeOpen: async function (oEvent) {
            // clone event for actionWrapper as oEvent.oSource gets lost during processing of beforeOpen event handler
            const oCloneEvent = Object.assign({}, oEvent);
            messageHandler.removeTransitionMessages();
            const getDefaultValuesFunction = function () {
              const oMetaModel = oDialog.getModel().getMetaModel(),
                sActionPath = oActionContext.sPath && oActionContext.sPath.split("/@")[0],
                sDefaultValuesFunction = oMetaModel.getObject(`${sActionPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
              return sDefaultValuesFunction;
            };
            const fnSetDefaultsAndOpenDialog = async function (sBindingParameter) {
              const sBoundFunctionName = getDefaultValuesFunction();
              const prefillParameter = async function (sParamName, vParamDefaultValue) {
                // Case 1: There is a ParameterDefaultValue annotation
                if (vParamDefaultValue !== undefined) {
                  if (aContexts.length > 0 && vParamDefaultValue.$Path) {
                    try {
                      let vParamValue = await CommonUtils.requestSingletonProperty(vParamDefaultValue.$Path, oOperationBinding.getModel());
                      if (vParamValue === null) {
                        vParamValue = await oOperationBinding.getParameterContext().requestProperty(vParamDefaultValue.$Path);
                      }
                      if (aContexts.length > 1) {
                        // For multi select, need to loop over aContexts (as contexts cannot be retrieved via binding parameter of the operation binding)
                        let sPathForContext = vParamDefaultValue.$Path;
                        if (sPathForContext.indexOf(`${sBindingParameter}/`) === 0) {
                          sPathForContext = sPathForContext.replace(`${sBindingParameter}/`, "");
                        }
                        for (let i = 1; i < aContexts.length; i++) {
                          if (aContexts[i].getProperty(sPathForContext) !== vParamValue) {
                            // if the values from the contexts are not all the same, do not prefill
                            return {
                              paramName: sParamName,
                              value: undefined,
                              bNoPossibleValue: true
                            };
                          }
                        }
                      }
                      return {
                        paramName: sParamName,
                        value: vParamValue
                      };
                    } catch (oError) {
                      Log.error("Error while reading default action parameter", sParamName, mParameters.actionName);
                      return {
                        paramName: sParamName,
                        value: undefined,
                        bLatePropertyError: true
                      };
                    }
                  } else {
                    // Case 1.2: ParameterDefaultValue defines a fixed string value (i.e. vParamDefaultValue = 'someString')
                    return {
                      paramName: sParamName,
                      value: vParamDefaultValue
                    };
                  }
                } else if (oParameterModel && oParameterModel.oData[sParamName]) {
                  // Case 2: There is no ParameterDefaultValue annotation (=> look into the FLP User Defaults)

                  return {
                    paramName: sParamName,
                    value: oParameterModel.oData[sParamName]
                  };
                } else {
                  return {
                    paramName: sParamName,
                    value: undefined
                  };
                }
              };
              const getParameterDefaultValue = function (sParamName) {
                const oMetaModel = oDialog.getModel().getMetaModel(),
                  sActionParameterAnnotationPath = CommonUtils.getParameterPath(oActionContext.getPath(), sParamName) + "@",
                  oParameterAnnotations = oMetaModel.getObject(sActionParameterAnnotationPath),
                  oParameterDefaultValue = oParameterAnnotations && oParameterAnnotations["@com.sap.vocabularies.UI.v1.ParameterDefaultValue"]; // either { $Path: 'somePath' } or 'someString'
                return oParameterDefaultValue;
              };
              const aCurrentParamDefaultValue = [];
              let sParamName, vParameterDefaultValue;
              for (const i in aActionParameters) {
                sParamName = aActionParameters[i].$Name;
                vParameterDefaultValue = getParameterDefaultValue(sParamName);
                aCurrentParamDefaultValue.push(prefillParameter(sParamName, vParameterDefaultValue));
              }
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                if (sBoundFunctionName && sBoundFunctionName.length > 0 && typeof sBoundFunctionName === "string") {
                  for (const i in aContexts) {
                    aFunctionParams.push(callBoundFunction(sBoundFunctionName, aContexts[i], mParameters.model));
                  }
                }
              }
              const aPrefillParamPromises = Promise.all(aCurrentParamDefaultValue);
              let aExecFunctionPromises = Promise.resolve([]);
              let oExecFunctionFromManifestPromise;
              if (aFunctionParams && aFunctionParams.length > 0) {
                aExecFunctionPromises = Promise.all(aFunctionParams);
              }
              if (mParameters.defaultValuesExtensionFunction) {
                const sModule = mParameters.defaultValuesExtensionFunction.substring(0, mParameters.defaultValuesExtensionFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
                  sFunctionName = mParameters.defaultValuesExtensionFunction.substring(mParameters.defaultValuesExtensionFunction.lastIndexOf(".") + 1, mParameters.defaultValuesExtensionFunction.length);
                oExecFunctionFromManifestPromise = FPMHelper.actionWrapper(oCloneEvent, sModule, sFunctionName, {
                  contexts: aContexts
                });
              }
              try {
                const aPromises = await Promise.all([aPrefillParamPromises, aExecFunctionPromises, oExecFunctionFromManifestPromise]);
                const currentParamDefaultValue = aPromises[0];
                const functionParams = aPromises[1];
                const oFunctionParamsFromManifest = aPromises[2];
                let sDialogParamName;

                // Fill the dialog with the earlier determined parameter values from the different sources
                for (const i in aActionParameters) {
                  var _aParameterValues$fin2;
                  sDialogParamName = aActionParameters[i].$Name;
                  // Parameter values provided in the call of invokeAction overrule other sources
                  const vParameterProvidedValue = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin2 = aParameterValues.find(element => element.name === aActionParameters[i].$Name)) === null || _aParameterValues$fin2 === void 0 ? void 0 : _aParameterValues$fin2.value;
                  if (vParameterProvidedValue) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, vParameterProvidedValue);
                  } else if (oFunctionParamsFromManifest && oFunctionParamsFromManifest.hasOwnProperty(sDialogParamName)) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, oFunctionParamsFromManifest[sDialogParamName]);
                  } else if (currentParamDefaultValue[i] && currentParamDefaultValue[i].value !== undefined) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, currentParamDefaultValue[i].value);
                    // if the default value had not been previously determined due to different contexts, we do nothing else
                  } else if (sBoundFunctionName && !currentParamDefaultValue[i].bNoPossibleValue) {
                    if (aContexts.length > 1) {
                      // we check if the function retrieves the same param value for all the contexts:
                      let j = 0;
                      while (j < aContexts.length - 1) {
                        if (functionParams[j] && functionParams[j + 1] && functionParams[j].getObject(sDialogParamName) === functionParams[j + 1].getObject(sDialogParamName)) {
                          j++;
                        } else {
                          break;
                        }
                      }
                      //param values are all the same:
                      if (j === aContexts.length - 1) {
                        oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[j].getObject(sDialogParamName));
                      }
                    } else if (functionParams[0] && functionParams[0].getObject(sDialogParamName)) {
                      //Only one context, then the default param values are to be verified from the function:

                      oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[0].getObject(sDialogParamName));
                    }
                  }
                }
                const bErrorFound = currentParamDefaultValue.some(function (oValue) {
                  if (oValue.bLatePropertyError) {
                    return oValue.bLatePropertyError;
                  }
                });
                // If at least one Default Property is a Late Property and an eTag error was raised.
                if (bErrorFound) {
                  const sText = resourceModel.getText("C_APP_COMPONENT_SAPFE_ETAG_LATE_PROPERTY");
                  MessageBox.warning(sText, {
                    contentWidth: "25em"
                  });
                }
              } catch (oError) {
                Log.error("Error while retrieving the parameter", oError);
              }
            };
            const fnAsyncBeforeOpen = async function () {
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                const aParameters = oActionContext.getObject("$Parameter");
                const sBindingParameter = aParameters[0] && aParameters[0].$Name;
                try {
                  const oContextObject = await aContexts[0].requestObject();
                  if (oContextObject) {
                    oOperationBinding.setParameter(sBindingParameter, oContextObject);
                  }
                  await fnSetDefaultsAndOpenDialog(sBindingParameter);
                } catch (oError) {
                  Log.error("Error while retrieving the parameter", oError);
                }
              } else {
                await fnSetDefaultsAndOpenDialog();
              }
            };
            await fnAsyncBeforeOpen();

            // adding defaulted values only here after they are not set to the fields
            for (const actionParameterInfo of actionParameterInfos) {
              const value = actionParameterInfo.isMultiValue ? actionParameterInfo.field.getItems() : actionParameterInfo.field.getValue();
              actionParameterInfo.value = value;
              actionParameterInfo.validationPromise = Promise.resolve(value);
            }
          },
          afterClose: function () {
            // when the dialog is cancelled, messages need to be removed in case the same action should be executed again
            aActionParameters.forEach(_removeMessagesForActionParamter);
            oDialog.destroy();
            if (actionResult.dialogCancelled) {
              reject(Constants.CancelActionDialog);
            } else {
              resolve(actionResult.result);
            }
          }
        });
        mParameters.oDialog = oDialog;
        oDialog.setModel(oActionContext.getModel().oModel);
        oDialog.setModel(oParameterModel, "paramsModel");
        oDialog.bindElement({
          path: "/",
          model: "paramsModel"
        });

        // empty model to add elements dynamically depending on number of MVF fields defined on the dialog
        const oMVFModel = new JSONModel({});
        oDialog.setModel(oMVFModel, "mvfview");

        /* Event needed for removing messages of valid changed field */
        for (const actionParameterInfo of actionParameterInfos) {
          if (actionParameterInfo.isMultiValue) {
            var _actionParameterInfo$, _actionParameterInfo$2;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$ = actionParameterInfo.field) === null || _actionParameterInfo$ === void 0 ? void 0 : (_actionParameterInfo$2 = _actionParameterInfo$.getBinding("items")) === null || _actionParameterInfo$2 === void 0 ? void 0 : _actionParameterInfo$2.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          } else {
            var _actionParameterInfo$3, _actionParameterInfo$4;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$3 = actionParameterInfo.field) === null || _actionParameterInfo$3 === void 0 ? void 0 : (_actionParameterInfo$4 = _actionParameterInfo$3.getBinding("value")) === null || _actionParameterInfo$4 === void 0 ? void 0 : _actionParameterInfo$4.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          }
        }
        let sActionPath = `${sActionName}(...)`;
        if (!aContexts.length) {
          sActionPath = `/${sActionPath}`;
        }
        oDialog.bindElement({
          path: sActionPath
        });
        if (oParentControl) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        if (aContexts.length > 0) {
          oDialog.setBindingContext(aContexts[0]); // use context of first selected line item
        }

        oOperationBinding = oDialog.getObjectBinding();
        oDialog.open();
      } catch (oError) {
        reject(oError);
      }
    });
  }
  function getActionParameters(oAction) {
    const aParameters = oAction.getObject("$Parameter") || [];
    if (aParameters && aParameters.length) {
      if (oAction.getObject("$IsBound")) {
        //in case of bound actions, ignore the first parameter and consider the rest
        return aParameters.slice(1, aParameters.length) || [];
      }
    }
    return aParameters;
  }
  function getIsActionCritical(oMetaModel, sPath, contexts, oBoundAction) {
    const vActionCritical = oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.IsActionCritical`);
    let sCriticalPath = vActionCritical && vActionCritical.$Path;
    if (!sCriticalPath) {
      // the static value scenario for isActionCritical
      return !!vActionCritical;
    }
    const aBindingParams = oBoundAction && oBoundAction.getObject("$Parameter"),
      aPaths = sCriticalPath && sCriticalPath.split("/"),
      bCondition = aBindingParams && aBindingParams.length && typeof aBindingParams === "object" && sCriticalPath && contexts && contexts.length;
    if (bCondition) {
      //in case binding patameters are there in path need to remove eg: - _it/isVerified => need to remove _it and the path should be isVerified
      aBindingParams.filter(function (oParams) {
        const index = aPaths && aPaths.indexOf(oParams.$Name);
        if (index > -1) {
          aPaths.splice(index, 1);
        }
      });
      sCriticalPath = aPaths.join("/");
      return contexts[0].getObject(sCriticalPath);
    } else if (sCriticalPath) {
      //if scenario is path based return the path value
      return contexts[0].getObject(sCriticalPath);
    }
  }
  function _getActionParameterActionName(resourceModel, sActionLabel, sActionName, sEntitySetName) {
    let boundActionName = sActionName ? sActionName : null;
    const aActionName = boundActionName.split(".");
    boundActionName = boundActionName.indexOf(".") >= 0 ? aActionName[aActionName.length - 1] : boundActionName;
    const suffixResourceKey = boundActionName && sEntitySetName ? `${sEntitySetName}|${boundActionName}` : "";
    const sKey = "ACTION_PARAMETER_DIALOG_ACTION_NAME";
    const bResourceKeyExists = resourceModel.checkIfResourceKeyExists(`${sKey}|${suffixResourceKey}`);
    if (sActionLabel) {
      if (bResourceKeyExists) {
        return resourceModel.getText(sKey, undefined, suffixResourceKey);
      } else if (resourceModel.checkIfResourceKeyExists(`${sKey}|${sEntitySetName}`)) {
        return resourceModel.getText(sKey, undefined, `${sEntitySetName}`);
      } else if (resourceModel.checkIfResourceKeyExists(`${sKey}`)) {
        return resourceModel.getText(sKey);
      } else {
        return sActionLabel;
      }
    } else {
      return resourceModel.getText("C_COMMON_DIALOG_OK");
    }
  }
  function executeDependingOnSelectedContexts(oAction, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, internalOperationsPromiseResolve, internalOperationsPromiseReject, strictHandlingUtilities) {
    let oActionPromise,
      bEnableStrictHandling = true;
    if (mParameters) {
      mParameters.internalOperationsPromiseResolve = internalOperationsPromiseResolve;
    }
    if (bGetBoundContext) {
      var _oProperty$;
      const sPath = oAction.getBoundContext().getPath();
      const sMetaPath = oAction.getModel().getMetaModel().getMetaPath(sPath);
      const oProperty = oAction.getModel().getMetaModel().getObject(sMetaPath);
      if (oProperty && ((_oProperty$ = oProperty[0]) === null || _oProperty$ === void 0 ? void 0 : _oProperty$.$kind) !== "Action") {
        //do not enable the strict handling if its not an action
        bEnableStrictHandling = false;
      }
    }
    if (!bEnableStrictHandling) {
      oActionPromise = oAction.execute(sGroupId).then(function () {
        internalOperationsPromiseResolve(oAction.getBoundContext());
        return oAction.getBoundContext();
      });
    } else {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, resourceModel, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function () {
        internalOperationsPromiseResolve(oAction.getBoundContext());
        return oAction.getBoundContext();
      }).catch(function () {
        internalOperationsPromiseReject();
        return Promise.reject();
      }) : oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, resourceModel, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function (result) {
        internalOperationsPromiseResolve(result);
        return result;
      }).catch(function () {
        internalOperationsPromiseReject();
        return Promise.reject();
      });
    }
    return oActionPromise.catch(() => {
      throw Constants.ActionExecutionFailed;
    });
  }
  function createinternalOperationsPromiseForActionExecution() {
    let internalOperationsPromiseResolve = null,
      internalOperationsPromiseReject = null;
    const oLocalActionPromise = new Promise(function (resolve, reject) {
      internalOperationsPromiseResolve = resolve;
      internalOperationsPromiseReject = reject;
    });
    return {
      oLocalActionPromise,
      internalOperationsPromiseResolve,
      internalOperationsPromiseReject
    };
  }
  function checkforOtherMessages(isChangeSet) {
    if (isChangeSet) {
      const aMessages = Core.getMessageManager().getMessageModel().getData();
      return aMessages.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
    }
    return -1;
  }
  function _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities) {
    const aContexts = mParameters.aContexts || [];
    const oModel = mParameters.model;
    const aActionParameters = mParameters.aActionParameters || [];
    const sActionName = mParameters.actionName;
    const fnOnSubmitted = mParameters.fnOnSubmitted;
    const fnOnResponse = mParameters.fnOnResponse;
    const resourceModel = getResourceModel(oParentControl);
    let oAction;
    function setActionParameterDefaultValue() {
      if (aActionParameters && aActionParameters.length) {
        for (let j = 0; j < aActionParameters.length; j++) {
          if (!aActionParameters[j].value) {
            switch (aActionParameters[j].$Type) {
              case "Edm.String":
                aActionParameters[j].value = "";
                break;
              case "Edm.Boolean":
                aActionParameters[j].value = false;
                break;
              case "Edm.Byte":
              case "Edm.Int16":
              case "Edm.Int32":
              case "Edm.Int64":
                aActionParameters[j].value = 0;
                break;
              // tbc
              default:
                break;
            }
          }
          oAction.setParameter(aActionParameters[j].$Name, aActionParameters[j].value);
        }
      }
    }
    if (aContexts.length) {
      // TODO: refactor to direct use of Promise.allSettled
      return new Promise(function (resolve) {
        const mBindingParameters = mParameters.mBindingParameters;
        const bGrouped = mParameters.bGrouped;
        const bGetBoundContext = mParameters.bGetBoundContext;
        const aActionPromises = [];
        let oActionPromise;
        let i;
        let sGroupId;
        const ointernalOperationsPromiseObject = createinternalOperationsPromiseForActionExecution();
        const fnExecuteAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          setActionParameterDefaultValue();
          const individualActionPromise = [];
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = !bGrouped ? `$auto.${current_context_index}` : actionContext.getUpdateGroupId();
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, ointernalOperationsPromiseObject.internalOperationsPromiseResolve, ointernalOperationsPromiseObject.internalOperationsPromiseReject, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          individualActionPromise.push(ointernalOperationsPromiseObject.oLocalActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          return Promise.allSettled(individualActionPromise);
        };
        const fnExecuteSingleAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          const individualActionPromise = [];
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = `apiMode${current_context_index}`;
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, ointernalOperationsPromiseObject.internalOperationsPromiseResolve, ointernalOperationsPromiseObject.internalOperationsPromiseReject, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          individualActionPromise.push(ointernalOperationsPromiseObject.oLocalActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oModel.submitBatch(sGroupId);
          return Promise.allSettled(individualActionPromise);
        };
        async function fnExecuteChangeset() {
          const aChangeSetLocalPromises = [];
          for (i = 0; i < aContexts.length; i++) {
            oAction = oModel.bindContext(`${sActionName}(...)`, aContexts[i], mBindingParameters);
            aChangeSetLocalPromises.push(fnExecuteAction(oAction, aContexts.length <= 1 ? null : i, {
              context: aContexts[i],
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, aContexts.length));
          }
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          await Promise.allSettled(aChangeSetLocalPromises);
          if (strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length) {
            try {
              const otherErrorMessageIndex = checkforOtherMessages(true);
              if (otherErrorMessageIndex === -1) {
                await operationsHelper.renderMessageView(mParameters, resourceModel, messageHandler, strictHandlingUtilities.strictHandlingWarningMessages, strictHandlingUtilities, aContexts.length > 1);
              } else {
                strictHandlingUtilities.strictHandlingPromises.forEach(function (shPromise) {
                  shPromise.resolve(false);
                });
                const messageModel = Core.getMessageManager().getMessageModel();
                const messagesInModel = messageModel.getData();
                messageModel.setData(messagesInModel.concat(strictHandlingUtilities.strictHandlingWarningMessages));
              }
            } catch {
              Log.error("Retriggering of strict handling actions failed");
            }
          }
          fnHandleResults();
        }
        async function fnExecuteSequentially(contextsToExecute) {
          // One action and its side effects are completed before the next action is executed
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          function processOneAction(context, actionIndex, iContextLength) {
            oAction = oModel.bindContext(`${sActionName}(...)`, context, mBindingParameters);
            return fnExecuteSingleAction(oAction, actionIndex, {
              context: context,
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, iContextLength);
          }

          // serialization: processOneAction to be called for each entry in contextsToExecute only after the promise returned from the one before has been resolved
          await contextsToExecute.reduce(async (promise, context, id) => {
            await promise;
            await processOneAction(context, id + 1, aContexts.length);
          }, Promise.resolve());
          if (strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length) {
            await operationsHelper.renderMessageView(mParameters, resourceModel, messageHandler, strictHandlingUtilities.strictHandlingWarningMessages, strictHandlingUtilities, aContexts.length > 1);
          }
          fnHandleResults();
        }
        if (!bGrouped) {
          // For invocation grouping "isolated", ensure that each action and matching side effects
          // are processed before the next set is submitted. Workaround until JSON batch is available.
          // Allow also for List Report.
          fnExecuteSequentially(aContexts);
        } else {
          fnExecuteChangeset();
        }
        function fnHandleResults() {
          // Promise.allSettled will never be rejected. However, eslint requires either catch or return - thus we return the resulting Promise although no one will use it.
          return Promise.allSettled(aActionPromises).then(resolve);
        }
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    } else {
      oAction = oModel.bindContext(`/${sActionName}(...)`);
      setActionParameterDefaultValue();
      const sGroupId = "actionImport";
      const oActionPromise = oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, {
        label: mParameters.label,
        model: oModel
      }, resourceModel, null, null, null, messageHandler, strictHandlingUtilities));
      oModel.submitBatch(sGroupId);
      // trigger onSubmitted "event"
      (fnOnSubmitted || function noop() {
        /**/
      })(oActionPromise);
      return oActionPromise.then(function (currentPromiseValue) {
        // Here we ensure that we return the response we got from an unbound action to the
        // caller BCP : 2270139279
        if (currentPromiseValue) {
          return currentPromiseValue;
        } else {
          var _oAction$getBoundCont, _oAction, _oAction$getBoundCont2;
          return (_oAction$getBoundCont = (_oAction = oAction).getBoundContext) === null || _oAction$getBoundCont === void 0 ? void 0 : (_oAction$getBoundCont2 = _oAction$getBoundCont.call(_oAction)) === null || _oAction$getBoundCont2 === void 0 ? void 0 : _oAction$getBoundCont2.getObject();
        }
      }).catch(function (oError) {
        Log.error("Error while executing action " + sActionName, oError);
        throw oError;
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    }
  }
  function _getPath(oActionContext, sActionName) {
    let sPath = oActionContext.getPath();
    sPath = oActionContext.getObject("$IsBound") ? sPath.split("@$ui5.overload")[0] : sPath.split("/0")[0];
    return sPath.split(`/${sActionName}`)[0];
  }
  function _valuesProvidedForAllParameters(isCreateAction, actionParameters, parameterValues, startupParameters) {
    if (parameterValues) {
      // If showDialog is false but there are parameters from the invokeAction call, we need to check that values have been
      // provided for all of them
      for (const actionParameter of actionParameters) {
        if (actionParameter.$Name !== "ResultIsActiveEntity" && !(parameterValues !== null && parameterValues !== void 0 && parameterValues.find(element => element.name === actionParameter.$Name))) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    } else if (isCreateAction && startupParameters) {
      // If parameters have been provided during application launch, we need to check if the set is complete
      // If not, the parameter dialog still needs to be shown.
      for (const actionParameter of actionParameters) {
        if (!startupParameters[actionParameter.$Name]) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    }
    return true;
  }
  function fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise) {
    const oSideEffectsService = oAppComponent.getSideEffectsService();
    let oLocalPromise;
    // trigger actions from side effects
    if (oSideEffect && oSideEffect.triggerActions && oSideEffect.triggerActions.length) {
      oSideEffect.triggerActions.forEach(function (sTriggerAction) {
        if (sTriggerAction) {
          oLocalPromise = oSideEffectsService.executeAction(sTriggerAction, oSideEffect.context, sGroupId);
          if (aLocalPromise) {
            aLocalPromise.push(oLocalPromise);
          }
        }
      });
    }
    // request side effects for this action
    // as we move the messages request to POST $select we need to be prepared for an empty array
    if (oSideEffect && oSideEffect.pathExpressions && oSideEffect.pathExpressions.length > 0) {
      oLocalPromise = oSideEffectsService.requestSideEffects(oSideEffect.pathExpressions, oSideEffect.context, sGroupId);
      if (aLocalPromise) {
        aLocalPromise.push(oLocalPromise);
      }
      oLocalPromise.then(function () {
        if (mParameters.operationAvailableMap && mParameters.internalModelContext) {
          ActionRuntime.setActionEnablement(mParameters.internalModelContext, JSON.parse(mParameters.operationAvailableMap), mParameters.selectedItems, "table");
        }
      }).catch(function (oError) {
        Log.error("Error while requesting side effects", oError);
      });
    }
  }

  /**
   * Static functions to call OData actions (bound/import) and functions (bound/import)
   *
   * @namespace
   * @alias sap.fe.core.actions.operations
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const operations = {
    callBoundAction: callBoundAction,
    callActionImport: callActionImport,
    callBoundFunction: callBoundFunction,
    callFunctionImport: callFunctionImport,
    executeDependingOnSelectedContexts: executeDependingOnSelectedContexts,
    valuesProvidedForAllParameters: _valuesProvidedForAllParameters,
    getActionParameterActionName: _getActionParameterActionName,
    actionParameterShowMessageCallback: actionParameterShowMessageCallback,
    afterActionResolution: afterActionResolution
  };
  return operations;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25zdGFudHMiLCJGRUxpYnJhcnkiLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJBY3Rpb24iLCJNZXNzYWdlQm94IiwiY2FsbEJvdW5kQWN0aW9uIiwic0FjdGlvbk5hbWUiLCJjb250ZXh0cyIsIm9Nb2RlbCIsIm9BcHBDb21wb25lbnQiLCJtUGFyYW1ldGVycyIsInN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIiwiaXM0MTJFeGVjdXRlZCIsInN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzIiwic3RyaWN0SGFuZGxpbmdQcm9taXNlcyIsInN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzIiwiZGVsYXlTdWNjZXNzTWVzc2FnZXMiLCJwcm9jZXNzZWRNZXNzYWdlSWRzIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlamVjdCIsImlzQ2FsbGVkV2l0aEFycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwiYUNvbnRleHRzIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNBY3Rpb25QYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwib0JvdW5kQWN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc0NyaXRpY2FsQWN0aW9uIiwiZ2V0SXNBY3Rpb25Dcml0aWNhbCIsImV4dHJhY3RTaW5nbGVSZXN1bHQiLCJyZXN1bHQiLCJzdGF0dXMiLCJ2YWx1ZSIsInJlYXNvbiIsImNhbGxBY3Rpb24iLCJ0aGVuIiwiY2FsbEFjdGlvbkltcG9ydCIsImJpbmRDb250ZXh0Iiwib0FjdGlvbkltcG9ydCIsImdldE9iamVjdCIsImNhbGxCb3VuZEZ1bmN0aW9uIiwic0Z1bmN0aW9uTmFtZSIsImNvbnRleHQiLCJzRnVuY3Rpb25QYXRoIiwib0JvdW5kRnVuY3Rpb24iLCJfZXhlY3V0ZUZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0IiwicmVzb2x2ZSIsIm9GdW5jdGlvbkltcG9ydCIsIm9GdW5jdGlvbiIsInNHcm91cElkIiwiRXJyb3IiLCJvRnVuY3Rpb25Qcm9taXNlIiwiZXhlY3V0ZSIsInN1Ym1pdEJhdGNoIiwiZ2V0Qm91bmRDb250ZXh0Iiwib0FjdGlvbiIsImJHcm91cGVkIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiQ2hhbmdlU2V0IiwibUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMiLCJmbkRpYWxvZyIsIm9BY3Rpb25Qcm9taXNlIiwic0FjdGlvbkxhYmVsIiwibGFiZWwiLCJiU2tpcFBhcmFtZXRlckRpYWxvZyIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJiSXNDcmVhdGVBY3Rpb24iLCJiSXNDcml0aWNhbEFjdGlvbiIsInNNZXRhUGF0aCIsInNNZXNzYWdlc1BhdGgiLCJpTWVzc2FnZVNpZGVFZmZlY3QiLCJiSXNTYW1lRW50aXR5Iiwib1JldHVyblR5cGUiLCJiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzIiwiYWN0aW9uRGVmaW5pdGlvbiIsImFBY3Rpb25QYXJhbWV0ZXJzIiwiZ2V0QWN0aW9uUGFyYW1ldGVycyIsImJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyIsIiROYW1lIiwiYVBhcmFtZXRlclZhbHVlcyIsInBhcmFtZXRlclZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwiX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsInNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJjb25maXJtQ3JpdGljYWxBY3Rpb24iLCJmbk9uU3VibWl0dGVkIiwib25TdWJtaXR0ZWQiLCJmbk9uUmVzcG9uc2UiLCJvblJlc3BvbnNlIiwiYWN0aW9uTmFtZSIsIm1vZGVsIiwiYkdldEJvdW5kQ29udGV4dCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsInNlbGVjdGVkSXRlbXMiLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsInBhdGhFeHByZXNzaW9ucyIsImZpbmRJbmRleCIsImV4cCIsIiRpc0NvbGxlY3Rpb24iLCJnZXRNb2RlbCIsIiRUeXBlIiwibUJpbmRpbmdQYXJhbWV0ZXJzIiwiJHNlbGVjdCIsInNwbGl0IiwiaW5kZXhPZiIsInB1c2giLCJ0cmlnZ2VyQWN0aW9ucyIsInNwbGljZSIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiaXNDcmVhdGVBY3Rpb24iLCJiT2JqZWN0UGFnZSIsImNvbnRyb2xJZCIsImNvbnRyb2wiLCJwYXJlbnRDb250cm9sIiwiYnlJZCIsImlzU3RhdGljIiwiJFBhcmFtZXRlciIsInNvbWUiLCJhUGFyYW1ldGVyIiwiJEVudGl0eVNldFBhdGgiLCIkSXNCb3VuZCIsImVudGl0eVNldE5hbWUiLCJtZXNzYWdlSGFuZGxlciIsIm9PcGVyYXRpb25SZXN1bHQiLCJhZnRlckFjdGlvblJlc29sdXRpb24iLCJjYXRjaCIsImkiLCJmaW5kIiwiZWxlbWVudCIsIm5hbWUiLCJfZXhlY3V0ZUFjdGlvbiIsIm1lc3NhZ2VzIiwiQ29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImNvbmNhdCIsInN0cmljdEhhbmRsaW5nRmFpbHMiLCJhRmFpbGVkQ29udGV4dHMiLCJmb3JFYWNoIiwiZmFpbCIsImdldENvbnRleHQiLCJvRmFpbGVkT3BlcmF0aW9uUmVzdWx0IiwiYWRkTWVzc2FnZXMiLCJzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCIsImNoZWNrZm9yT3RoZXJNZXNzYWdlcyIsInNob3dNZXNzYWdlRGlhbG9nIiwib25CZWZvcmVTaG93TWVzc2FnZSIsImFNZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVyc0luIiwiYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayIsInVuZGVmaW5lZCIsImFTZWxlY3RlZENvbnRleHRzIiwib0FjdGlvbkNvbnRleHQiLCJvUGFyZW50Q29udHJvbCIsImJvdW5kQWN0aW9uTmFtZSIsInN1ZmZpeFJlc291cmNlS2V5IiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJzQ29uZmlybWF0aW9uVGV4dCIsImdldFRleHQiLCJjb25maXJtIiwib25DbG9zZSIsInNBY3Rpb24iLCJPSyIsIm9PcGVyYXRpb24iLCJvRXJyb3IiLCJlIiwiZXhlY3V0ZUFQTUFjdGlvbiIsIm9EaWFsb2ciLCJhZnRlcjQxMiIsImFSZXN1bHQiLCJvU2luZ2xlUmVzdWx0IiwiYXR0YWNoRXZlbnRPbmNlIiwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuIiwiaXNPcGVuIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJKU09OIiwicGFyc2UiLCJvQ29udHJvbCIsImlzQSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJzaG93TWVzc2FnZUJveCIsIm9SZXNvdXJjZUJ1bmRsZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInVuYm91bmRNZXNzYWdlcyIsImZpbHRlciIsIm1lc3NhZ2UiLCJnZXRUYXJnZXQiLCJBUERtZXNzYWdlcyIsImFjdGlvblBhcmFtIiwiQVBETWVzc2FnZSIsImlzQVBEVGFyZ2V0IiwiZXJyb3JUYXJnZXRzSW5BUEQiLCJoYXNDaGFuZ2VTZXRNb2RpZmllZE1lc3NhZ2UiLCJzTWVzc2FnZSIsInNEZXNjcmlwdGlvblRleHQiLCJtZXNzYWdlTW9kZWwiLCJtZXNzYWdlc0luTW9kZWwiLCJhQm91bmRNZXNzYWdlcyIsIm1lc3NhZ2VIYW5kbGluZyIsImdldE1lc3NhZ2VzIiwiZ2VuZXJpY01lc3NhZ2UiLCJpc0VkaXRhYmxlIiwiZ2V0UHJvcGVydHkiLCJub25FcnJvck1lc3NhZ2VFeGlzdHNJbkRpYWxvZyIsImdldFR5cGUiLCJub25FcnJvck1lc3NhZ2VFeGlzdHNJbk1vZGVsIiwic2V0TWVzc2FnZSIsImdldE1lc3NhZ2UiLCJNZXNzYWdlIiwidHlwZSIsIk1lc3NhZ2VUeXBlIiwidGFyZ2V0IiwicGVyc2lzdGVudCIsImRlc2NyaXB0aW9uIiwiY29kZSIsInVuc2hpZnQiLCJjbG9zZSIsImRlc3Ryb3kiLCJmaWx0ZXJlZE1lc3NhZ2VzIiwiYklzQVBET3BlbiIsImZuR2V0TWVzc2FnZVN1YnRpdGxlIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwiYmluZCIsInNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZyIsInNQYXRoIiwiX2dldFBhdGgiLCJtZXRhTW9kZWwiLCJlbnRpdHlTZXRDb250ZXh0Iiwic0FjdGlvbk5hbWVQYXRoIiwiYWN0aW9uTmFtZUNvbnRleHQiLCJzRnJhZ21lbnROYW1lIiwiYWN0aW9uUGFyYW1ldGVySW5mb3MiLCJtZXNzYWdlTWFuYWdlciIsIl9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyIiwicGFyYW1ldGVyIiwiYWxsTWVzc2FnZXMiLCJnZW5lcmF0ZSIsInJlbGV2YW50TWVzc2FnZXMiLCJtc2ciLCJnZXRDb250cm9sSWRzIiwiaWQiLCJpbmNsdWRlcyIsInJlbW92ZU1lc3NhZ2VzIiwib0NvbnRyb2xsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJmaWVsZCIsImdldFNvdXJjZSIsImFjdGlvblBhcmFtZXRlckluZm8iLCJ2YWxpZGF0aW9uUHJvbWlzZSIsImdldFBhcmFtZXRlciIsImhhc0Vycm9yIiwiZXJyb3IiLCJfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib1BhcmFtZXRlck1vZGVsIiwiSlNPTk1vZGVsIiwiJGRpc3BsYXlNb2RlIiwiY3JlYXRlZEZyYWdtZW50IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsImJpbmRpbmdDb250ZXh0cyIsImFjdGlvbiIsImVudGl0eVNldCIsIm1vZGVscyIsImFGdW5jdGlvblBhcmFtcyIsIm9PcGVyYXRpb25CaW5kaW5nIiwiQ29tbW9uVXRpbHMiLCJzZXRVc2VyRGVmYXVsdHMiLCJvRGlhbG9nQ29udGVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwibWFwIiwiYWN0aW9uUGFyYW1ldGVyIiwiaXNNdWx0aVZhbHVlIiwiYWN0aW9uUmVzdWx0IiwiZGlhbG9nQ2FuY2VsbGVkIiwiRGlhbG9nIiwidGl0bGUiLCJjb250ZW50IiwiZXNjYXBlSGFuZGxlciIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsIl9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIiwicHJlc3MiLCJfdmFsaWRhdGVQcm9wZXJ0aWVzIiwiQnVzeUxvY2tlciIsImxvY2siLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJ2UGFyYW1ldGVyVmFsdWUiLCJvUGFyYW1ldGVyQ29udGV4dCIsImdldFBhcmFtZXRlckNvbnRleHQiLCJhTVZGQ29udGVudCIsImFLZXlWYWx1ZXMiLCJqIiwiS2V5Iiwic2FwIiwidWkiLCJnZXRDb3JlIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJzaG93TWVzc2FnZXMiLCJtZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjayIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImVuZEJ1dHRvbiIsImJlZm9yZU9wZW4iLCJvQ2xvbmVFdmVudCIsIk9iamVjdCIsImFzc2lnbiIsImdldERlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsInNEZWZhdWx0VmFsdWVzRnVuY3Rpb24iLCJmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyIsInNCaW5kaW5nUGFyYW1ldGVyIiwic0JvdW5kRnVuY3Rpb25OYW1lIiwicHJlZmlsbFBhcmFtZXRlciIsInNQYXJhbU5hbWUiLCJ2UGFyYW1EZWZhdWx0VmFsdWUiLCIkUGF0aCIsInZQYXJhbVZhbHVlIiwicmVxdWVzdFNpbmdsZXRvblByb3BlcnR5IiwicmVxdWVzdFByb3BlcnR5Iiwic1BhdGhGb3JDb250ZXh0IiwicmVwbGFjZSIsInBhcmFtTmFtZSIsImJOb1Bvc3NpYmxlVmFsdWUiLCJMb2ciLCJiTGF0ZVByb3BlcnR5RXJyb3IiLCJvRGF0YSIsImdldFBhcmFtZXRlckRlZmF1bHRWYWx1ZSIsInNBY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uUGF0aCIsImdldFBhcmFtZXRlclBhdGgiLCJvUGFyYW1ldGVyQW5ub3RhdGlvbnMiLCJvUGFyYW1ldGVyRGVmYXVsdFZhbHVlIiwiYUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSIsInZQYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJhUHJlZmlsbFBhcmFtUHJvbWlzZXMiLCJhbGwiLCJhRXhlY0Z1bmN0aW9uUHJvbWlzZXMiLCJvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZSIsInNNb2R1bGUiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsIkZQTUhlbHBlciIsImFjdGlvbldyYXBwZXIiLCJhUHJvbWlzZXMiLCJjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUiLCJmdW5jdGlvblBhcmFtcyIsIm9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCIsInNEaWFsb2dQYXJhbU5hbWUiLCJ2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSIsInNldFBhcmFtZXRlciIsImhhc093blByb3BlcnR5IiwiYkVycm9yRm91bmQiLCJvVmFsdWUiLCJzVGV4dCIsIndhcm5pbmciLCJjb250ZW50V2lkdGgiLCJmbkFzeW5jQmVmb3JlT3BlbiIsImFQYXJhbWV0ZXJzIiwib0NvbnRleHRPYmplY3QiLCJyZXF1ZXN0T2JqZWN0IiwiZ2V0SXRlbXMiLCJnZXRWYWx1ZSIsImFmdGVyQ2xvc2UiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJzZXRNb2RlbCIsImJpbmRFbGVtZW50IiwicGF0aCIsIm9NVkZNb2RlbCIsImdldEJpbmRpbmciLCJhdHRhY2hDaGFuZ2UiLCJhZGREZXBlbmRlbnQiLCJzZXRCaW5kaW5nQ29udGV4dCIsImdldE9iamVjdEJpbmRpbmciLCJvcGVuIiwic2xpY2UiLCJ2QWN0aW9uQ3JpdGljYWwiLCJzQ3JpdGljYWxQYXRoIiwiYUJpbmRpbmdQYXJhbXMiLCJhUGF0aHMiLCJiQ29uZGl0aW9uIiwib1BhcmFtcyIsImluZGV4Iiwiam9pbiIsInNFbnRpdHlTZXROYW1lIiwiYUFjdGlvbk5hbWUiLCJzS2V5IiwiYlJlc291cmNlS2V5RXhpc3RzIiwiY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzIiwiZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyIsImlDb250ZXh0TGVuZ3RoIiwiY3VycmVudF9jb250ZXh0X2luZGV4IiwiaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUiLCJpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVqZWN0IiwiYkVuYWJsZVN0cmljdEhhbmRsaW5nIiwib1Byb3BlcnR5IiwiJGtpbmQiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwib3BlcmF0aW9ucyIsIkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCIsImNyZWF0ZWludGVybmFsT3BlcmF0aW9uc1Byb21pc2VGb3JBY3Rpb25FeGVjdXRpb24iLCJvTG9jYWxBY3Rpb25Qcm9taXNlIiwiaXNDaGFuZ2VTZXQiLCJzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJhQWN0aW9uUHJvbWlzZXMiLCJvaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZU9iamVjdCIsImZuRXhlY3V0ZUFjdGlvbiIsImFjdGlvbkNvbnRleHQiLCJvU2lkZUVmZmVjdCIsImluZGl2aWR1YWxBY3Rpb25Qcm9taXNlIiwiZ2V0VXBkYXRlR3JvdXBJZCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImZuUmVxdWVzdFNpZGVFZmZlY3RzIiwiYWxsU2V0dGxlZCIsImZuRXhlY3V0ZVNpbmdsZUFjdGlvbiIsImZuRXhlY3V0ZUNoYW5nZXNldCIsImFDaGFuZ2VTZXRMb2NhbFByb21pc2VzIiwibm9vcCIsIm90aGVyRXJyb3JNZXNzYWdlSW5kZXgiLCJyZW5kZXJNZXNzYWdlVmlldyIsInNoUHJvbWlzZSIsInNldERhdGEiLCJmbkhhbmRsZVJlc3VsdHMiLCJmbkV4ZWN1dGVTZXF1ZW50aWFsbHkiLCJjb250ZXh0c1RvRXhlY3V0ZSIsInByb2Nlc3NPbmVBY3Rpb24iLCJhY3Rpb25JbmRleCIsInJlZHVjZSIsInByb21pc2UiLCJmaW5hbGx5IiwiY3VycmVudFByb21pc2VWYWx1ZSIsImFjdGlvblBhcmFtZXRlcnMiLCJhTG9jYWxQcm9taXNlIiwib1NpZGVFZmZlY3RzU2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsIm9Mb2NhbFByb21pc2UiLCJzVHJpZ2dlckFjdGlvbiIsImV4ZWN1dGVBY3Rpb24iLCJ2YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMiLCJnZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJmYWNhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwic2FwL2ZlL2NvcmUvQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IEZQTUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXJcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmllbGRcIjtcbmltcG9ydCB0eXBlIE11bHRpVmFsdWVGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9NdWx0aVZhbHVlRmllbGRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwiLi4vLi4vLi4vQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgb3BlcmF0aW9uc0hlbHBlciwgeyB0eXBlIFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIH0gZnJvbSBcIi4uLy4uLy4uL29wZXJhdGlvbnNIZWxwZXJcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCIuLi8uLi9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGFyYW1ldGVyLCBBY3Rpb25QYXJhbWV0ZXJJbmZvLCBfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciwgX3ZhbGlkYXRlUHJvcGVydGllcyB9IGZyb20gXCIuL19pbnRlcm5hbFwiO1xuXG5jb25zdCBDb25zdGFudHMgPSBGRUxpYnJhcnkuQ29uc3RhbnRzLFxuXHRJbnZvY2F0aW9uR3JvdXBpbmcgPSBGRUxpYnJhcnkuSW52b2NhdGlvbkdyb3VwaW5nO1xuY29uc3QgQWN0aW9uID0gKE1lc3NhZ2VCb3ggYXMgYW55KS5BY3Rpb247XG5cbi8qKlxuICogQ2FsbHMgYSBib3VuZCBhY3Rpb24gZm9yIG9uZSBvciBtdWx0aXBsZSBjb250ZXh0cy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsQm91bmRBY3Rpb25cbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuICogQHBhcmFtIGNvbnRleHRzIEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGJlIGNhbGxlZFxuICogQHBhcmFtIG9Nb2RlbCBPRGF0YSBNb2RlbFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzXSBBIG1hcCBvZiBhY3Rpb24gcGFyYW1ldGVyIG5hbWVzIGFuZCBwcm92aWRlZCB2YWx1ZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzXSBBIG1hcCBvZiBiaW5kaW5nIHBhcmFtZXRlcnMgdGhhdCB3b3VsZCBiZSBwYXJ0IG9mICRzZWxlY3QgYW5kICRleHBhbmQgY29taW5nIGZyb20gc2lkZSBlZmZlY3RzIGZvciBib3VuZCBhY3Rpb25zXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0XSBBcnJheSBvZiBwcm9wZXJ0eSBwYXRocyB0byBiZSByZXF1ZXN0ZWQgaW4gYWRkaXRpb24gdG8gYWN0dWFsIHRhcmdldCBwcm9wZXJ0aWVzIG9mIHRoZSBzaWRlIGVmZmVjdFxuICogQHBhcmFtIFttUGFyYW1ldGVycy5zaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nXSBJZiBzZXQgYW5kIGlmIHBhcmFtZXRlcnMgZXhpc3QgdGhlIHVzZXIgcmV0cmlldmVzIGEgZGlhbG9nIHRvIGZpbGwgaW4gcGFyYW1ldGVycywgaWYgYWN0aW9uUGFyYW1ldGVycyBhcmUgcGFzc2VkIHRoZXkgYXJlIHNob3duIHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmxhYmVsXSBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZ10gTW9kZSBob3cgYWN0aW9ucyBhcmUgdG8gYmUgY2FsbGVkOiBDaGFuZ2VzZXQgdG8gcHV0IGFsbCBhY3Rpb24gY2FsbHMgaW50byBvbmUgY2hhbmdlc2V0LCBJc29sYXRlZCB0byBwdXQgdGhlbSBpbnRvIHNlcGFyYXRlIGNoYW5nZXNldHMsIGRlZmF1bHRzIHRvIElzb2xhdGVkXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm9uU3VibWl0dGVkXSBGdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgb25jZSB0aGUgYWN0aW9ucyBhcmUgc3VibWl0dGVkIHdpdGggYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZGVmYXVsdFBhcmFtZXRlcnNdIENhbiBjb250YWluIGRlZmF1bHQgcGFyYW1ldGVycyBmcm9tIEZMUCB1c2VyIGRlZmF1bHRzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2xdIElmIHNwZWNpZmllZCwgdGhlIGRpYWxvZ3MgYXJlIGFkZGVkIGFzIGRlcGVuZGVudCBvZiB0aGUgcGFyZW50IGNvbnRyb2xcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYkdldEJvdW5kQ29udGV4dF0gSWYgc3BlY2lmaWVkLCB0aGUgYWN0aW9uIHByb21pc2UgcmV0dXJucyB0aGUgYm91bmQgY29udGV4dFxuICogQHBhcmFtIFtzdHJpY3RIYW5kbGluZ1V0aWxpdGllc10gT3B0aW9uYWwsIHV0aWxpdHkgZmxhZ3MgYW5kIG1lc3NhZ2VzIGZvciBzdHJpY3RIYW5kbGluZ1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIGFuIGFycmF5IG9mIHJlc3BvbnNlIG9iamVjdHMgKFRPRE86IHRvIGJlIGNoYW5nZWQpXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGNhbGxCb3VuZEFjdGlvbihcblx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0Y29udGV4dHM6IGFueSxcblx0b01vZGVsOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGlmICghc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdH07XG5cdH1cblx0aWYgKCFjb250ZXh0cyB8fCBjb250ZXh0cy5sZW5ndGggPT09IDApIHtcblx0XHQvL0luIEZyZWVzdHlsZSBhcHBzIGJvdW5kIGFjdGlvbnMgY2FuIGhhdmUgbm8gY29udGV4dFxuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkJvdW5kIGFjdGlvbnMgYWx3YXlzIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBjb250ZXh0XCIpO1xuXHR9XG5cdC8vIHRoaXMgbWV0aG9kIGVpdGhlciBhY2NlcHRzIHNpbmdsZSBjb250ZXh0IG9yIGFuIGFycmF5IG9mIGNvbnRleHRzXG5cdC8vIFRPRE86IFJlZmFjdG9yIHRvIGFuIHVuYW1iaWd1b3MgQVBJXG5cdGNvbnN0IGlzQ2FsbGVkV2l0aEFycmF5ID0gQXJyYXkuaXNBcnJheShjb250ZXh0cyk7XG5cblx0Ly8gaW4gY2FzZSBvZiBzaW5nbGUgY29udGV4dCB3cmFwIGludG8gYW4gYXJyYXkgZm9yIGNhbGxlZCBtZXRob2RzIChlc3AuIGNhbGxBY3Rpb24pXG5cdG1QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGlzQ2FsbGVkV2l0aEFycmF5ID8gY29udGV4dHMgOiBbY29udGV4dHNdO1xuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0Ly8gQW5hbHl6aW5nIG1ldGFNb2RlbFBhdGggZm9yIGFjdGlvbiBvbmx5IGZyb20gZmlyc3QgY29udGV4dCBzZWVtcyB3ZWlyZCwgYnV0IHByb2JhYmx5IHdvcmtzIGluIGFsbCBleGlzdGluZyBzemVuYXJpb3MgLSBpZiBzZXZlcmFsIGNvbnRleHRzIGFyZSBwYXNzZWQsIHRoZXkgcHJvYmFibHlcblx0XHQvLyBiZWxvbmcgdG8gdGhlIHNhbWUgbWV0YW1vZGVscGF0aC4gVE9ETzogQ2hlY2ssIHdoZXRoZXIgdGhpcyBjYW4gYmUgaW1wcm92ZWQgLyBzemVuYXJpb3Mgd2l0aCBkaWZmZXJlbnQgbWV0YU1vZGVsUGF0aHMgbWlnaHQgZXhpc3Rcblx0XHRzQWN0aW9uUGF0aCA9IGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgobVBhcmFtZXRlcnMuYUNvbnRleHRzWzBdLmdldFBhdGgoKSl9LyR7c0FjdGlvbk5hbWV9YCxcblx0XHRvQm91bmRBY3Rpb24gPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NBY3Rpb25QYXRofS9AJHVpNS5vdmVybG9hZC8wYCk7XG5cdG1QYXJhbWV0ZXJzLmlzQ3JpdGljYWxBY3Rpb24gPSBnZXRJc0FjdGlvbkNyaXRpY2FsKG9NZXRhTW9kZWwsIHNBY3Rpb25QYXRoLCBtUGFyYW1ldGVycy5hQ29udGV4dHMsIG9Cb3VuZEFjdGlvbik7XG5cblx0Ly8gUHJvbWlzZSByZXR1cm5lZCBieSBjYWxsQWN0aW9uIGN1cnJlbnRseSBpcyByZWplY3RlZCBpbiBjYXNlIG9mIGV4ZWN1dGlvbiBmb3IgbXVsdGlwbGUgY29udGV4dHMgcGFydGx5IGZhaWxpbmcuIFRoaXMgc2hvdWxkIGJlIGNoYW5nZWQgKHNvbWUgZmFpbGluZyBjb250ZXh0cyBkbyBub3QgbWVhblxuXHQvLyB0aGF0IGZ1bmN0aW9uIGRpZCBub3QgZnVsZmlsbCBpdHMgdGFzayksIGJ1dCBhcyB0aGlzIGlzIGEgYmlnZ2VyIHJlZmFjdG9yaW5nLCBmb3IgdGhlIHRpbWUgYmVpbmcgd2UgbmVlZCB0byBkZWFsIHdpdGggdGhhdCBhdCB0aGUgY2FsbGluZyBwbGFjZSAoaS5lLiBoZXJlKVxuXHQvLyA9PiBwcm92aWRlIHRoZSBzYW1lIGhhbmRsZXIgKG1hcHBpbmcgYmFjayBmcm9tIGFycmF5IHRvIHNpbmdsZSByZXN1bHQvZXJyb3IgaWYgbmVlZGVkKSBmb3IgcmVzb2x2ZWQvcmVqZWN0ZWQgY2FzZVxuXHRjb25zdCBleHRyYWN0U2luZ2xlUmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdDogYW55KSB7XG5cdFx0Ly8gc2luZ2xlIGFjdGlvbiBjb3VsZCBiZSByZXNvbHZlZCBvciByZWplY3RlZFxuXHRcdGlmIChyZXN1bHRbMF0uc3RhdHVzID09PSBcImZ1bGZpbGxlZFwiKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRpYWxvZyBjYW5jZWxsYXRpb24sIG5vIGFycmF5IGlzIHJldHVybmVkID0+IHRocm93IHRoZSByZXN1bHQuXG5cdFx0XHQvLyBJZGVhbGx5LCBkaWZmZXJlbnRpYXRpbmcgc2hvdWxkIG5vdCBiZSBuZWVkZWQgaGVyZSA9PiBUT0RPOiBGaW5kIGJldHRlciBzb2x1dGlvbiB3aGVuIHNlcGFyYXRpbmcgZGlhbG9nIGhhbmRsaW5nIChzaW5nbGUgb2JqZWN0IHdpdGggc2luZ2xlIHJlc3VsdCkgZnJvbSBiYWNrZW5kXG5cdFx0XHQvLyBleGVjdXRpb24gKHBvdGVudGlhbGx5IG11bHRpcGxlIG9iamVjdHMpXG5cdFx0XHR0aHJvdyByZXN1bHRbMF0ucmVhc29uIHx8IHJlc3VsdDtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIGNhbGxBY3Rpb24oc0FjdGlvbk5hbWUsIG9Nb2RlbCwgb0JvdW5kQWN0aW9uLCBvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpLnRoZW4oXG5cdFx0KHJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRpZiAoaXNDYWxsZWRXaXRoQXJyYXkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBleHRyYWN0U2luZ2xlUmVzdWx0KHJlc3VsdCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQocmVzdWx0OiBhbnkpID0+IHtcblx0XHRcdGlmIChpc0NhbGxlZFdpdGhBcnJheSkge1xuXHRcdFx0XHR0aHJvdyByZXN1bHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZXh0cmFjdFNpbmdsZVJlc3VsdChyZXN1bHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcbn1cbi8qKlxuICogQ2FsbHMgYW4gYWN0aW9uIGltcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsQWN0aW9uSW1wb3J0XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiBpbXBvcnQgdG8gYmUgY2FsbGVkXG4gKiBAcGFyYW0gb01vZGVsIEFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5sYWJlbF0gQSBodW1hbi1yZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGFjdGlvblxuICogQHBhcmFtIFttUGFyYW1ldGVycy5zaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nXSBJZiBzZXQgYW5kIGlmIHBhcmFtZXRlcnMgZXhpc3QgdGhlIHVzZXIgcmV0cmlldmVzIGEgZGlhbG9nIHRvIGZpbGwgaW4gcGFyYW1ldGVycywgaWYgYWN0aW9uUGFyYW1ldGVycyBhcmUgcGFzc2VkIHRoZXkgYXJlIHNob3duIHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm9uU3VibWl0dGVkXSBGdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgb25jZSB0aGUgYWN0aW9ucyBhcmUgc3VibWl0dGVkIHdpdGggYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZGVmYXVsdFBhcmFtZXRlcnNdIENhbiBjb250YWluIGRlZmF1bHQgcGFyYW1ldGVycyBmcm9tIEZMUCB1c2VyIGRlZmF1bHRzXG4gKiBAcGFyYW0gW3N0cmljdEhhbmRsaW5nVXRpbGl0aWVzXSBPcHRpb25hbCwgdXRpbGl0eSBmbGFncyBhbmQgbWVzc2FnZXMgZm9yIHN0cmljdEhhbmRsaW5nXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggYW4gYXJyYXkgb2YgcmVzcG9uc2Ugb2JqZWN0cyAoVE9ETzogdG8gYmUgY2hhbmdlZClcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2FsbEFjdGlvbkltcG9ydChcblx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0b01vZGVsOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGlmICghb01vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiQWN0aW9uIGV4cGVjdHMgYSBtb2RlbC9jb250ZXh0IGZvciBleGVjdXRpb25cIik7XG5cdH1cblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzQWN0aW9uUGF0aCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgLyR7c0FjdGlvbk5hbWV9YCkuZ2V0UGF0aCgpLFxuXHRcdG9BY3Rpb25JbXBvcnQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHtvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBY3Rpb25QYXRoKS5nZXRPYmplY3QoXCIkQWN0aW9uXCIpfS8wYCk7XG5cdG1QYXJhbWV0ZXJzLmlzQ3JpdGljYWxBY3Rpb24gPSBnZXRJc0FjdGlvbkNyaXRpY2FsKG9NZXRhTW9kZWwsIGAke3NBY3Rpb25QYXRofS9AJHVpNS5vdmVybG9hZGApO1xuXHRyZXR1cm4gY2FsbEFjdGlvbihzQWN0aW9uTmFtZSwgb01vZGVsLCBvQWN0aW9uSW1wb3J0LCBvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpO1xufVxuZnVuY3Rpb24gY2FsbEJvdW5kRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogc3RyaW5nLCBjb250ZXh0OiBhbnksIG9Nb2RlbDogYW55KSB7XG5cdGlmICghY29udGV4dCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkJvdW5kIGZ1bmN0aW9ucyBhbHdheXMgcmVxdWlyZXMgYSBjb250ZXh0XCIpO1xuXHR9XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0Z1bmN0aW9uUGF0aCA9IGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dC5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YCxcblx0XHRvQm91bmRGdW5jdGlvbiA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0JvdW5kRnVuY3Rpb24sIGNvbnRleHQpO1xufVxuLyoqXG4gKiBDYWxscyBhIGZ1bmN0aW9uIGltcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsRnVuY3Rpb25JbXBvcnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzRnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBvTW9kZWwgQW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgdjQgbW9kZWxcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNhbGxGdW5jdGlvbkltcG9ydChzRnVuY3Rpb25OYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdGlmICghc0Z1bmN0aW9uTmFtZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNGdW5jdGlvblBhdGggPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NGdW5jdGlvbk5hbWV9YCkuZ2V0UGF0aCgpLFxuXHRcdG9GdW5jdGlvbkltcG9ydCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke29NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCkuZ2V0T2JqZWN0KFwiJEZ1bmN0aW9uXCIpfS8wYCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0Z1bmN0aW9uSW1wb3J0KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogYW55LCBvTW9kZWw6IGFueSwgb0Z1bmN0aW9uOiBhbnksIGNvbnRleHQ/OiBhbnkpIHtcblx0bGV0IHNHcm91cElkO1xuXHRpZiAoIW9GdW5jdGlvbiB8fCAhb0Z1bmN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgRnVuY3Rpb24gJHtzRnVuY3Rpb25OYW1lfSBub3QgZm91bmRgKSk7XG5cdH1cblx0aWYgKGNvbnRleHQpIHtcblx0XHRvRnVuY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYCR7Y29udGV4dC5nZXRQYXRoKCl9LyR7c0Z1bmN0aW9uTmFtZX0oLi4uKWApO1xuXHRcdHNHcm91cElkID0gXCJmdW5jdGlvbkdyb3VwXCI7XG5cdH0gZWxzZSB7XG5cdFx0b0Z1bmN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAvJHtzRnVuY3Rpb25OYW1lfSguLi4pYCk7XG5cdFx0c0dyb3VwSWQgPSBcImZ1bmN0aW9uSW1wb3J0XCI7XG5cdH1cblx0Y29uc3Qgb0Z1bmN0aW9uUHJvbWlzZSA9IG9GdW5jdGlvbi5leGVjdXRlKHNHcm91cElkKTtcblx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0cmV0dXJuIG9GdW5jdGlvblByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG9GdW5jdGlvbi5nZXRCb3VuZENvbnRleHQoKTtcblx0fSk7XG59XG5mdW5jdGlvbiBjYWxsQWN0aW9uKFxuXHRzQWN0aW9uTmFtZTogYW55LFxuXHRvTW9kZWw6IGFueSxcblx0b0FjdGlvbjogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPzogU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcbikge1xuXHRpZiAoIXN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgPSB7XG5cdFx0XHRpczQxMkV4ZWN1dGVkOiBmYWxzZSxcblx0XHRcdHN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzOiBbXSxcblx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXM6IFtdLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXM6IFtdLFxuXHRcdFx0ZGVsYXlTdWNjZXNzTWVzc2FnZXM6IFtdLFxuXHRcdFx0cHJvY2Vzc2VkTWVzc2FnZUlkczogW11cblx0XHR9O1xuXHR9XG5cdG1QYXJhbWV0ZXJzLmJHcm91cGVkID0gbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nID09PSBJbnZvY2F0aW9uR3JvdXBpbmcuQ2hhbmdlU2V0O1xuXHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRsZXQgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdGxldCBmbkRpYWxvZztcblx0XHRsZXQgb0FjdGlvblByb21pc2U7XG5cdFx0Ly9sZXQgZmFpbGVkQWN0aW9uUHJvbWlzZTogYW55O1xuXHRcdGNvbnN0IHNBY3Rpb25MYWJlbCA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRcdGNvbnN0IGJTa2lwUGFyYW1ldGVyRGlhbG9nID0gbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZztcblx0XHRjb25zdCBhQ29udGV4dHMgPSBtUGFyYW1ldGVycy5hQ29udGV4dHM7XG5cdFx0Y29uc3QgYklzQ3JlYXRlQWN0aW9uID0gbVBhcmFtZXRlcnMuYklzQ3JlYXRlQWN0aW9uO1xuXHRcdGNvbnN0IGJJc0NyaXRpY2FsQWN0aW9uID0gbVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbjtcblx0XHRsZXQgb01ldGFNb2RlbDtcblx0XHRsZXQgc01ldGFQYXRoO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoOiBhbnk7XG5cdFx0bGV0IGlNZXNzYWdlU2lkZUVmZmVjdDtcblx0XHRsZXQgYklzU2FtZUVudGl0eTtcblx0XHRsZXQgb1JldHVyblR5cGU7XG5cdFx0bGV0IGJWYWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM7XG5cdFx0Y29uc3QgYWN0aW9uRGVmaW5pdGlvbiA9IG9BY3Rpb24uZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKCFvQWN0aW9uIHx8ICFvQWN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0XHRyZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgQWN0aW9uICR7c0FjdGlvbk5hbWV9IG5vdCBmb3VuZGApKTtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIGFjdGlvblxuXHRcdGNvbnN0IGFBY3Rpb25QYXJhbWV0ZXJzID0gZ2V0QWN0aW9uUGFyYW1ldGVycyhvQWN0aW9uKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoZSBhY3Rpb24gaGFzIHBhcmFtZXRlcnMgYW5kIHdvdWxkIG5lZWQgYSBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0Ly8gVGhlIHBhcmFtZXRlciBSZXN1bHRJc0FjdGl2ZUVudGl0eSBpcyBhbHdheXMgaGlkZGVuIGluIHRoZSBkaWFsb2chIEhlbmNlIGlmXG5cdFx0Ly8gdGhpcyBpcyB0aGUgb25seSBwYXJhbWV0ZXIsIHRoaXMgaXMgdHJlYXRlZCBhcyBubyBwYXJhbWV0ZXIgaGVyZSBiZWNhdXNlIHRoZVxuXHRcdC8vIGRpYWxvZyB3b3VsZCBiZSBlbXB0eSFcblx0XHQvLyBGSVhNRTogU2hvdWxkIG9ubHkgaWdub3JlIHRoaXMgaWYgdGhpcyBpcyBhICdjcmVhdGUnIGFjdGlvbiwgb3RoZXJ3aXNlIGl0IGlzIGp1c3Qgc29tZSBub3JtYWwgcGFyYW1ldGVyIHRoYXQgaGFwcGVucyB0byBoYXZlIHRoaXMgbmFtZVxuXHRcdGNvbnN0IGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyA9XG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGggPiAwICYmICEoYUFjdGlvblBhcmFtZXRlcnMubGVuZ3RoID09PSAxICYmIGFBY3Rpb25QYXJhbWV0ZXJzWzBdLiROYW1lID09PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIpO1xuXG5cdFx0Ly8gUHJvdmlkZWQgdmFsdWVzIGZvciB0aGUgYWN0aW9uIHBhcmFtZXRlcnMgZnJvbSBpbnZva2VBY3Rpb24gY2FsbFxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJWYWx1ZXMgPSBtUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXM7XG5cblx0XHQvLyBEZXRlcm1pbmUgc3RhcnR1cCBwYXJhbWV0ZXJzIGlmIHByb3ZpZGVkXG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSBvQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKTtcblx0XHRjb25zdCBvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9O1xuXG5cdFx0Ly8gSW4gY2FzZSBhbiBhY3Rpb24gcGFyYW1ldGVyIGlzIG5lZWRlZCwgYW5kIHdlIHNoYWxsIHNraXAgdGhlIGRpYWxvZywgY2hlY2sgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIHBhcmFtZXRlcnNcblx0XHRpZiAoYkFjdGlvbk5lZWRzUGFyYW1ldGVyRGlhbG9nICYmIGJTa2lwUGFyYW1ldGVyRGlhbG9nKSB7XG5cdFx0XHRiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzID0gX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyhcblx0XHRcdFx0YklzQ3JlYXRlQWN0aW9uLFxuXHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YVBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8vIERlcGVuZGluZyBvbiB0aGUgcHJldmlvdXNseSBkZXRlcm1pbmVkIGRhdGEsIGVpdGhlciBzZXQgYSBkaWFsb2cgb3IgbGVhdmUgaXQgZW1wdHkgd2hpY2hcblx0XHQvLyB3aWxsIGxlYWQgdG8gZGlyZWN0IGV4ZWN1dGlvbiBvZiB0aGUgYWN0aW9uIHdpdGhvdXQgYSBkaWFsb2dcblx0XHRmbkRpYWxvZyA9IG51bGw7XG5cdFx0aWYgKGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZykge1xuXHRcdFx0aWYgKCEoYlNraXBQYXJhbWV0ZXJEaWFsb2cgJiYgYlZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycykpIHtcblx0XHRcdFx0Zm5EaWFsb2cgPSBzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoYklzQ3JpdGljYWxBY3Rpb24pIHtcblx0XHRcdGZuRGlhbG9nID0gY29uZmlybUNyaXRpY2FsQWN0aW9uO1xuXHRcdH1cblxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0Zm5PblN1Ym1pdHRlZDogbVBhcmFtZXRlcnMub25TdWJtaXR0ZWQsXG5cdFx0XHRmbk9uUmVzcG9uc2U6IG1QYXJhbWV0ZXJzLm9uUmVzcG9uc2UsXG5cdFx0XHRhY3Rpb25OYW1lOiBzQWN0aW9uTmFtZSxcblx0XHRcdG1vZGVsOiBvTW9kZWwsXG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVyczogYUFjdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRiR2V0Qm91bmRDb250ZXh0OiBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24sXG5cdFx0XHRsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwsXG5cdFx0XHRzZWxlY3RlZEl0ZW1zOiBtUGFyYW1ldGVycy5zZWxlY3RlZEl0ZW1zXG5cdFx0fTtcblx0XHRpZiAob0FjdGlvbi5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSkge1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucykge1xuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGFDb250ZXh0c1swXS5nZXRQYXRoKCkpO1xuXHRcdFx0XHRzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRpTWVzc2FnZVNpZGVFZmZlY3QgPSBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMuZmluZEluZGV4KGZ1bmN0aW9uIChleHA6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiBleHAgPT09IFwic3RyaW5nXCIgJiYgZXhwID09PSBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly8gQWRkIFNBUF9NZXNzYWdlcyBieSBkZWZhdWx0IGlmIG5vdCBhbm5vdGF0ZWQgYnkgc2lkZSBlZmZlY3RzLCBhY3Rpb24gZG9lcyBub3QgcmV0dXJuIGEgY29sbGVjdGlvbiBhbmRcblx0XHRcdFx0XHQvLyB0aGUgcmV0dXJuIHR5cGUgaXMgdGhlIHNhbWUgYXMgdGhlIGJvdW5kIHR5cGVcblx0XHRcdFx0XHRvUmV0dXJuVHlwZSA9IG9BY3Rpb24uZ2V0T2JqZWN0KFwiJFJldHVyblR5cGVcIik7XG5cdFx0XHRcdFx0YklzU2FtZUVudGl0eSA9XG5cdFx0XHRcdFx0XHRvUmV0dXJuVHlwZSAmJiAhb1JldHVyblR5cGUuJGlzQ29sbGVjdGlvbiAmJiBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0T2JqZWN0KHNNZXRhUGF0aCkuJFR5cGUgPT09IG9SZXR1cm5UeXBlLiRUeXBlO1xuXG5cdFx0XHRcdFx0aWYgKGlNZXNzYWdlU2lkZUVmZmVjdCA+IC0xIHx8IGJJc1NhbWVFbnRpdHkpIHtcblx0XHRcdFx0XHRcdC8vIHRoZSBtZXNzYWdlIHBhdGggaXMgYW5ub3RhdGVkIGFzIHNpZGUgZWZmZWN0LiBBcyB0aGVyZSdzIG5vIGJpbmRpbmcgZm9yIGl0IGFuZCB0aGUgbW9kZWwgZG9lcyBjdXJyZW50bHkgbm90IGFsbG93XG5cdFx0XHRcdFx0XHQvLyB0byBhZGQgaXQgYXQgYSBsYXRlciBwb2ludCBvZiB0aW1lIHdlIGhhdmUgdG8gdGFrZSBjYXJlIGl0J3MgcGFydCBvZiB0aGUgJHNlbGVjdCBvZiB0aGUgUE9TVCwgdGhlcmVmb3JlIG1vdmluZyBpdC5cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldE9iamVjdChgJFJldHVyblR5cGUvJFR5cGUvJHtzTWVzc2FnZXNQYXRofWApICYmXG5cdFx0XHRcdFx0XHRcdCghbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgfHxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdC5zcGxpdChcIixcIikuaW5kZXhPZihzTWVzc2FnZXNQYXRoKSA9PT0gLTEpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgPSBtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdFxuXHRcdFx0XHRcdFx0XHRcdD8gYCR7bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3R9LCR7c01lc3NhZ2VzUGF0aH1gXG5cdFx0XHRcdFx0XHRcdFx0OiBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdFx0XHQvLyBBZGQgc2lkZSBlZmZlY3RzIGF0IGVudGl0eSBsZXZlbCBiZWNhdXNlICRzZWxlY3Qgc3RvcHMgdGhlc2UgYmVpbmcgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHRcdFx0XHRcdFx0XHQvLyBPbmx5IGlmIG5vIG90aGVyIHNpZGUgZWZmZWN0cyB3ZXJlIGFkZGVkIGZvciBNZXNzYWdlc1xuXHRcdFx0XHRcdFx0XHRpZiAoaU1lc3NhZ2VTaWRlRWZmZWN0ID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucy5wdXNoKFwiKlwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9ucy5sZW5ndGggPT09IDAgJiYgaU1lc3NhZ2VTaWRlRWZmZWN0ID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBubyB0cmlnZ2VyIGFjdGlvbiB0aGVyZWZvcmUgbm8gbmVlZCB0byByZXF1ZXN0IG1lc3NhZ2VzIGFnYWluXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLnNwbGljZShpTWVzc2FnZVNpZGVFZmZlY3QsIDEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGFDb250ZXh0cztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ID0gbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3Q7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5iR3JvdXBlZCA9IG1QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZyA9PT0gSW52b2NhdGlvbkdyb3VwaW5nLkNoYW5nZVNldDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgPSBtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pc0NyZWF0ZUFjdGlvbiA9IGJJc0NyZWF0ZUFjdGlvbjtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmJPYmplY3RQYWdlID0gbVBhcmFtZXRlcnMuYk9iamVjdFBhZ2U7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udHJvbCA9IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2w7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5jb250cm9sID0gbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbDtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udHJvbCA9IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2w7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChiSXNDcmVhdGVBY3Rpb24pIHtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmJJc0NyZWF0ZUFjdGlvbiA9IGJJc0NyZWF0ZUFjdGlvbjtcblx0XHR9XG5cdFx0Ly9jaGVjayBmb3Igc2tpcHBpbmcgc3RhdGljIGFjdGlvbnNcblx0XHRjb25zdCBpc1N0YXRpYyA9IChhY3Rpb25EZWZpbml0aW9uLiRQYXJhbWV0ZXIgfHwgW10pLnNvbWUoKGFQYXJhbWV0ZXI6IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0KChhY3Rpb25EZWZpbml0aW9uLiRFbnRpdHlTZXRQYXRoICYmIGFjdGlvbkRlZmluaXRpb24uJEVudGl0eVNldFBhdGggPT09IGFQYXJhbWV0ZXIuJE5hbWUpIHx8IGFjdGlvbkRlZmluaXRpb24uJElzQm91bmQpICYmXG5cdFx0XHRcdGFQYXJhbWV0ZXIuJGlzQ29sbGVjdGlvblxuXHRcdFx0KTtcblx0XHR9KTtcblx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuXHRcdGlmIChmbkRpYWxvZykge1xuXHRcdFx0b0FjdGlvblByb21pc2UgPSBmbkRpYWxvZyhcblx0XHRcdFx0c0FjdGlvbk5hbWUsXG5cdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdHNBY3Rpb25MYWJlbCxcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRhUGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRtUGFyYW1ldGVycy5tZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gb0FjdGlvblByb21pc2Vcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9PcGVyYXRpb25SZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVycywgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsIGFjdGlvbkRlZmluaXRpb24pO1xuXHRcdFx0XHRcdHJlc29sdmUob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob09wZXJhdGlvblJlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0cmVqZWN0KG9PcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gVGFrZSBvdmVyIGFsbCBwcm92aWRlZCBwYXJhbWV0ZXIgdmFsdWVzIGFuZCBjYWxsIHRoZSBhY3Rpb24uXG5cdFx0XHQvLyBUaGlzIHNoYWxsIG9ubHkgaGFwcGVuIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCB0aGUgcGFyYW1ldGVycywgb3RoZXJ3aXNlIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIHNoYWxsIGJlIHNob3duIHdoaWNoIGlzIGVuc3VyZWQgZWFybGllclxuXHRcdFx0aWYgKGFQYXJhbWV0ZXJWYWx1ZXMpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpIGluIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0udmFsdWUgPSBhUGFyYW1ldGVyVmFsdWVzPy5maW5kKFxuXHRcdFx0XHRcdFx0KGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5uYW1lID09PSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZVxuXHRcdFx0XHRcdCk/LnZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS52YWx1ZSA9XG5cdFx0XHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNbbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWVdPy5bMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGxldCBvT3BlcmF0aW9uUmVzdWx0OiBhbnk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRvT3BlcmF0aW9uUmVzdWx0ID0gYXdhaXQgX2V4ZWN1dGVBY3Rpb24oXG5cdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiZcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMubGVuZ3RoXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzID0gc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuZGVsYXlTdWNjZXNzTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhZnRlckFjdGlvblJlc29sdXRpb24obVBhcmFtZXRlcnMsIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLCBhY3Rpb25EZWZpbml0aW9uKTtcblx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRyZWplY3Qob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiZcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMubGVuZ3RoXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzdHJpY3RIYW5kbGluZ0ZhaWxzID0gc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM7XG5cdFx0XHRcdFx0XHRjb25zdCBhRmFpbGVkQ29udGV4dHMgPSBbXSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ0ZhaWxzLmZvckVhY2goZnVuY3Rpb24gKGZhaWw6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRhRmFpbGVkQ29udGV4dHMucHVzaChmYWlsLm9BY3Rpb24uZ2V0Q29udGV4dCgpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzID0gYUZhaWxlZENvbnRleHRzO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0ZhaWxlZE9wZXJhdGlvblJlc3VsdCA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMgPSBbXTtcblx0XHRcdFx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRcdFx0XHRhZnRlckFjdGlvblJlc29sdXRpb24obVBhcmFtZXRlcnMsIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLCBhY3Rpb25EZWZpbml0aW9uKTtcblx0XHRcdFx0XHRcdHJlc29sdmUob0ZhaWxlZE9wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0ZhaWxlZE9wZXJhdGlvblJlc3VsdCkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KG9GYWlsZWRPcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdChtUGFyYW1ldGVycy5iR3JvdXBlZCAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmxlbmd0aCkgfHxcblx0XHRcdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhcmFtZXRlcnM/Lm1lc3NhZ2VIYW5kbGVyPy5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0Y29udHJvbDogbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnM/LmNvbnRyb2wsXG5cdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRhTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLFxuXHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGFTZWxlY3RlZENvbnRleHRzOiBtUGFyYW1ldGVycy5hQ29udGV4dHMsXG5cdFx0XHRcdFx0c0FjdGlvbk5hbWU6IHNBY3Rpb25MYWJlbFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgPSB7XG5cdFx0XHRcdFx0XHRpczQxMkV4ZWN1dGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzOiBbXSxcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXM6IFtdLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXM6IFtdLFxuXHRcdFx0XHRcdFx0ZGVsYXlTdWNjZXNzTWVzc2FnZXM6IFtdLFxuXHRcdFx0XHRcdFx0cHJvY2Vzc2VkTWVzc2FnZUlkczogW11cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cbmZ1bmN0aW9uIGNvbmZpcm1Dcml0aWNhbEFjdGlvbihcblx0c0FjdGlvbk5hbWU6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRzQWN0aW9uTGFiZWw6IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0YUFjdGlvblBhcmFtZXRlcnM6IGFueSxcblx0YVBhcmFtZXRlclZhbHVlczogYW55LFxuXHRvQWN0aW9uQ29udGV4dDogYW55LFxuXHRvUGFyZW50Q29udHJvbDogYW55LFxuXHRlbnRpdHlTZXROYW1lOiBhbnksXG5cdG1lc3NhZ2VIYW5kbGVyOiBhbnlcbikge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGxldCBib3VuZEFjdGlvbk5hbWUgPSBzQWN0aW9uTmFtZSA/IHNBY3Rpb25OYW1lIDogbnVsbDtcblx0XHRib3VuZEFjdGlvbk5hbWUgPVxuXHRcdFx0Ym91bmRBY3Rpb25OYW1lLmluZGV4T2YoXCIuXCIpID49IDAgPyBib3VuZEFjdGlvbk5hbWUuc3BsaXQoXCIuXCIpW2JvdW5kQWN0aW9uTmFtZS5zcGxpdChcIi5cIikubGVuZ3RoIC0gMV0gOiBib3VuZEFjdGlvbk5hbWU7XG5cdFx0Y29uc3Qgc3VmZml4UmVzb3VyY2VLZXkgPSBib3VuZEFjdGlvbk5hbWUgJiYgZW50aXR5U2V0TmFtZSA/IGAke2VudGl0eVNldE5hbWV9fCR7Ym91bmRBY3Rpb25OYW1lfWAgOiBcIlwiO1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKTtcblx0XHRjb25zdCBzQ29uZmlybWF0aW9uVGV4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfT1BFUkFUSU9OU19BQ1RJT05fQ09ORklSTV9NRVNTQUdFXCIsIHVuZGVmaW5lZCwgc3VmZml4UmVzb3VyY2VLZXkpO1xuXG5cdFx0TWVzc2FnZUJveC5jb25maXJtKHNDb25maXJtYXRpb25UZXh0LCB7XG5cdFx0XHRvbkNsb3NlOiBhc3luYyBmdW5jdGlvbiAoc0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdGlmIChzQWN0aW9uID09PSBBY3Rpb24uT0spIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzLCBvUGFyZW50Q29udHJvbCwgbWVzc2FnZUhhbmRsZXIpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBUE1BY3Rpb24oXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRhQ29udGV4dHM6IGFueSxcblx0b0RpYWxvZzogYW55LFxuXHRhZnRlcjQxMjogYm9vbGVhbixcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgb1BhcmVudENvbnRyb2wsIG1lc3NhZ2VIYW5kbGVyLCBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyk7XG5cdC8vIElmIHNvbWUgZW50cmllcyB3ZXJlIHN1Y2Nlc3NmdWwsIGFuZCBvdGhlcnMgaGF2ZSBmYWlsZWQsIHRoZSBvdmVyYWxsIHByb2Nlc3MgaXMgc3RpbGwgc3VjY2Vzc2Z1bC4gSG93ZXZlciwgdGhpcyB3YXMgdHJlYXRlZCBhcyByZWplY3Rpb25cblx0Ly8gYmVmb3JlLCBhbmQgdGhpcyBjdXJyZW50bHkgaXMgc3RpbGwga2VwdCwgYXMgbG9uZyBhcyBkaWFsb2cgaGFuZGxpbmcgaXMgbWl4ZWQgd2l0aCBiYWNrZW5kIHByb2Nlc3MgaGFuZGxpbmcuXG5cdC8vIFRPRE86IFJlZmFjdG9yIHRvIG9ubHkgcmVqZWN0IGluIGNhc2Ugb2Ygb3ZlcmFsbCBwcm9jZXNzIGVycm9yLlxuXHQvLyBGb3IgdGhlIHRpbWUgYmVpbmc6IG1hcCB0byBvbGQgbG9naWMgdG8gcmVqZWN0IGlmIGF0IGxlYXN0IG9uZSBlbnRyeSBoYXMgZmFpbGVkXG5cdC8vIFRoaXMgY2hlY2sgaXMgb25seSBkb25lIGZvciBib3VuZCBhY3Rpb25zID0+IGFDb250ZXh0cyBub3QgZW1wdHlcblx0aWYgKG1QYXJhbWV0ZXJzLmFDb250ZXh0cz8ubGVuZ3RoKSB7XG5cdFx0aWYgKGFSZXN1bHQ/LnNvbWUoKG9TaW5nbGVSZXN1bHQ6IGFueSkgPT4gb1NpbmdsZVJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikpIHtcblx0XHRcdHRocm93IGFSZXN1bHQ7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGgpIHtcblx0XHRpZiAoIWFmdGVyNDEyKSB7XG5cdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzLmNvbmNhdChtZXNzYWdlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRcdGlmIChcblx0XHRcdFx0KG1QYXJhbWV0ZXJzLmJHcm91cGVkICYmIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMubGVuZ3RoKSB8fFxuXHRcdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdFx0Ly8gQk9VTkQgVFJBTlNJVElPTiBBUyBQQVJUIE9GIFNBUF9NRVNTQUdFXG5cdFx0XHRcdG9EaWFsb2cuYXR0YWNoRXZlbnRPbmNlKFwiYWZ0ZXJDbG9zZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coe1xuXHRcdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnNJbixcblx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNvbnRyb2w6IG1QYXJhbWV0ZXJzLmNvbnRyb2wsXG5cdFx0XHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0c0FjdGlvbk5hbWU6IG1QYXJhbWV0ZXJzLmxhYmVsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHQvLyBCT1VORCBUUkFOU0lUSU9OIEFTIFBBUlQgT0YgU0FQX01FU1NBR0Vcblx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRpZiAoXG5cdFx0XHQobVBhcmFtZXRlcnMuYkdyb3VwZWQgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5sZW5ndGgpIHx8XG5cdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdCkge1xuXHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSB0cnVlO1xuXHRcdH1cblx0XHRvRGlhbG9nLmF0dGFjaEV2ZW50T25jZShcImFmdGVyQ2xvc2VcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0bWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coe1xuXHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW46IG1QYXJhbWV0ZXJzPy5vRGlhbG9nLmlzT3BlbigpLFxuXHRcdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAoYU1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLFxuXHRcdFx0XHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb250cm9sOiBtUGFyYW1ldGVycy5jb250cm9sLFxuXHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRzQWN0aW9uTmFtZTogbVBhcmFtZXRlcnMubGFiZWxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFSZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVyczogYW55LCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVyczogYW55LCBhY3Rpb25EZWZpbml0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzLmxlbmd0aCAmJlxuXHRcdGFjdGlvbkRlZmluaXRpb24uJElzQm91bmRcblx0KSB7XG5cdFx0Ly9jaGVjayBmb3Igc2tpcHBpbmcgc3RhdGljIGFjdGlvbnNcblx0XHRjb25zdCBpc1N0YXRpYyA9IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzU3RhdGljO1xuXHRcdGlmICghaXNTdGF0aWMpIHtcblx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdEpTT04ucGFyc2UobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0bVBhcmFtZXRlcnMuc2VsZWN0ZWRJdGVtcyxcblx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbCkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5jb250cm9sO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBvQ29udHJvbC5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRKU09OLnBhcnNlKG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGFDb250ZXh0czogYW55LFxuXHRvRGlhbG9nOiBhbnksXG5cdG1lc3NhZ2VzOiBhbnksXG5cdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiB7IHNob3dNZXNzYWdlQm94OiBib29sZWFuOyBzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbiB9LFxuXHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldDogYm9vbGVhblxuKToge1xuXHRmbkdldE1lc3NhZ2VTdWJ0aXRsZTogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cdHNob3dNZXNzYWdlQm94OiBib29sZWFuO1xuXHRzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbjtcblx0ZmlsdGVyZWRNZXNzYWdlczogYW55W107XG5cdHNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZzogYm9vbGVhbjtcbn0ge1xuXHRsZXQgc2hvd01lc3NhZ2VCb3ggPSBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbi5zaG93TWVzc2FnZUJveCxcblx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRjb25zdCBvQ29udHJvbCA9IG1QYXJhbWV0ZXJzLmNvbnRyb2w7XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGNvbnN0IHVuYm91bmRNZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0KCkgPT09IFwiXCI7XG5cdH0pO1xuXHRjb25zdCBBUERtZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG1lc3NhZ2UuZ2V0VGFyZ2V0ICYmXG5cdFx0XHRtZXNzYWdlLmdldFRhcmdldCgpLmluZGV4T2YobVBhcmFtZXRlcnMuYWN0aW9uTmFtZSkgIT09IC0xICYmXG5cdFx0XHRtUGFyYW1ldGVycz8uYUFjdGlvblBhcmFtZXRlcnM/LnNvbWUoZnVuY3Rpb24gKGFjdGlvblBhcmFtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0KCkuaW5kZXhPZihhY3Rpb25QYXJhbS4kTmFtZSkgIT09IC0xO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9KTtcblx0QVBEbWVzc2FnZXM/LmZvckVhY2goZnVuY3Rpb24gKEFQRE1lc3NhZ2U6IGFueSkge1xuXHRcdEFQRE1lc3NhZ2UuaXNBUERUYXJnZXQgPSB0cnVlO1xuXHR9KTtcblxuXHRjb25zdCBlcnJvclRhcmdldHNJbkFQRCA9IEFQRG1lc3NhZ2VzLmxlbmd0aCA/IHRydWUgOiBmYWxzZTtcblx0bGV0IGhhc0NoYW5nZVNldE1vZGlmaWVkTWVzc2FnZSA9IGZhbHNlO1xuXHRpZiAoc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgJiYgIWVycm9yVGFyZ2V0c0luQVBEKSB7XG5cdFx0aGFzQ2hhbmdlU2V0TW9kaWZpZWRNZXNzYWdlID0gdHJ1ZTtcblx0XHRsZXQgc01lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxfRVJST1JfTUVTU0FHRVNfVEVYVFwiKTtcblx0XHRsZXQgc0Rlc2NyaXB0aW9uVGV4dCA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9FUlJPUl9NRVNTQUdFU19ERVRBSUxfVEVYVFwiKTtcblx0XHRjb25zdCBtZXNzYWdlTW9kZWwgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCk7XG5cdFx0Y29uc3QgbWVzc2FnZXNJbk1vZGVsID0gbWVzc2FnZU1vZGVsLmdldERhdGEoKTtcblx0XHRjb25zdCBhQm91bmRNZXNzYWdlcyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcyh0cnVlKTtcblx0XHRsZXQgZ2VuZXJpY01lc3NhZ2U7XG5cdFx0Y29uc3QgaXNFZGl0YWJsZSA9IG9Db250cm9sICYmIG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblxuXHRcdGNvbnN0IG5vbkVycm9yTWVzc2FnZUV4aXN0c0luRGlhbG9nID0gbWVzc2FnZXMuZmluZEluZGV4KGZ1bmN0aW9uIChtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiRXJyb3JcIiB8fCBtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJXYXJuaW5nXCI7XG5cdFx0fSk7XG5cdFx0Y29uc3Qgbm9uRXJyb3JNZXNzYWdlRXhpc3RzSW5Nb2RlbCA9IG1lc3NhZ2VzSW5Nb2RlbC5maW5kSW5kZXgoZnVuY3Rpb24gKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRcdHJldHVybiBtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJFcnJvclwiIHx8IG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBcIldhcm5pbmdcIjtcblx0XHR9KTtcblxuXHRcdGlmIChub25FcnJvck1lc3NhZ2VFeGlzdHNJbkRpYWxvZyAhPT0gMSAmJiBub25FcnJvck1lc3NhZ2VFeGlzdHNJbk1vZGVsICE9PSAtMSkge1xuXHRcdFx0aWYgKG1lc3NhZ2VzSW5Nb2RlbC5sZW5ndGggPT09IDEgJiYgYUJvdW5kTWVzc2FnZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdGlmIChpc0VkaXRhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdG1lc3NhZ2VzSW5Nb2RlbFswXS5zZXRNZXNzYWdlKFxuXHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfQ0FOQ0VMX1NJTkdMRV9FUlJPUl9NRVNTQUdFX1RFWFRcIikgK1xuXHRcdFx0XHRcdFx0XHRcIlxcblxcblwiICtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZXNJbk1vZGVsWzBdLmdldE1lc3NhZ2UoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01lc3NhZ2UgPSBpc0VkaXRhYmxlXG5cdFx0XHRcdFx0XHQ/IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9TSU5HTEVfRVJST1JfTUVTU0FHRV9URVhUX0VESVRcIilcblx0XHRcdFx0XHRcdDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfQ0FOQ0VMX1NJTkdMRV9FUlJPUl9NRVNTQUdFX1RFWFRcIik7XG5cdFx0XHRcdFx0c0Rlc2NyaXB0aW9uVGV4dCA9IFwiXCI7XG5cdFx0XHRcdFx0Z2VuZXJpY01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBzTWVzc2FnZSxcblx0XHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBcIlwiLFxuXHRcdFx0XHRcdFx0cGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25UZXh0LFxuXHRcdFx0XHRcdFx0Y29kZTogXCJGRV9DVVNUT01fTUVTU0FHRV9DSEFOR0VTRVRfQUxMX0ZBSUxFRFwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bWVzc2FnZXMudW5zaGlmdChnZW5lcmljTWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdlbmVyaWNNZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IHNNZXNzYWdlLFxuXHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yLFxuXHRcdFx0XHRcdHRhcmdldDogXCJcIixcblx0XHRcdFx0XHRwZXJzaXN0ZW50OiB0cnVlLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25UZXh0LFxuXHRcdFx0XHRcdGNvZGU6IFwiRkVfQ1VTVE9NX01FU1NBR0VfQ0hBTkdFU0VUX0FMTF9GQUlMRURcIlxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bWVzc2FnZXMudW5zaGlmdChnZW5lcmljTWVzc2FnZSk7XG5cdFx0XHRcdGlmIChtZXNzYWdlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZUJveCA9IHRydWU7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChvRGlhbG9nICYmIG9EaWFsb2cuaXNPcGVuKCkgJiYgYUNvbnRleHRzLmxlbmd0aCAhPT0gMCAmJiAhbVBhcmFtZXRlcnMuaXNTdGF0aWMpIHtcblx0XHRpZiAoIW1QYXJhbWV0ZXJzLmJHcm91cGVkKSB7XG5cdFx0XHQvL2lzb2xhdGVkXG5cdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDEgfHwgIWVycm9yVGFyZ2V0c0luQVBEKSB7XG5cdFx0XHRcdC8vIGRvZXMgbm90IG1hdHRlciBpZiBlcnJvciBpcyBpbiBBUEQgb3Igbm90LCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgY29udGV4dHMgc2VsZWN0ZWQgb3IgaWYgdGhlIGVycm9yIGlzIG5vdCB0aGUgQVBELCB3ZSBjbG9zZSBpdC5cblx0XHRcdFx0Ly8gVE9ETzogRGlsYW9nIGhhbmRsaW5nIHNob3VsZCBub3QgYmUgcGFydCBvZiBtZXNzYWdlIGhhbmRsaW5nLiBSZWZhY3RvciBhY2NvcmRpbmdseSAtIGRpYWxvZyBzaG91bGQgbm90IGJlIG5lZWRlZCBpbnNpZGUgdGhpcyBtZXRob2QgLSBuZWl0aGVyXG5cdFx0XHRcdC8vIHRvIGFzayB3aGV0aGVyIGl0J3Mgb3Blbiwgbm9yIHRvIGNsb3NlL2Rlc3Ryb3kgaXQhXG5cdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdC8vY2hhbmdlc2V0XG5cdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHR9XG5cdH1cblx0bGV0IGZpbHRlcmVkTWVzc2FnZXM6IGFueVtdID0gW107XG5cdGNvbnN0IGJJc0FQRE9wZW4gPSBvRGlhbG9nICYmIG9EaWFsb2cuaXNPcGVuKCk7XG5cdGlmICghaGFzQ2hhbmdlU2V0TW9kaWZpZWRNZXNzYWdlKSB7XG5cdFx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQgJiYgbWVzc2FnZXNbMF0uZ2V0VGFyZ2V0KCkgIT09IHVuZGVmaW5lZCAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQoKSAhPT0gXCJcIikge1xuXHRcdFx0aWYgKChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IGZhbHNlKSB8fCAhb0NvbnRyb2wpIHtcblx0XHRcdFx0Ly8gT1AgZWRpdCBvciBMUlxuXHRcdFx0XHRzaG93TWVzc2FnZUJveCA9ICFlcnJvclRhcmdldHNJbkFQRDtcblx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZiAob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSB0cnVlKSB7XG5cdFx0XHRcdHNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbCkge1xuXHRcdFx0aWYgKG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0aWYgKGJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRpZiAoIWJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0ZmlsdGVyZWRNZXNzYWdlcyA9IHVuYm91bmRNZXNzYWdlcy5jb25jYXQoQVBEbWVzc2FnZXMpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFiSXNBUERPcGVuICYmIHVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHQvLyBlcnJvciB0YXJnZXRzIGluIEFQRCA9PiB0aGVyZSBpcyBhdGxlYXN0IG9uZSBib3VuZCBtZXNzYWdlLiBJZiB0aGVyZSBhcmUgdW5ib3VuZCBtZXNzYWdlcywgZGlhbG9nIG11c3QgYmUgc2hvd24uXG5cdFx0XHRcdFx0Ly8gZm9yIGRyYWZ0IGVudGl0eSwgd2UgYWxyZWFkeSBjbG9zZWQgdGhlIEFQRFxuXHRcdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNob3dNZXNzYWdlQm94OiBzaG93TWVzc2FnZUJveCxcblx0XHRzaG93TWVzc2FnZURpYWxvZzogc2hvd01lc3NhZ2VEaWFsb2csXG5cdFx0ZmlsdGVyZWRNZXNzYWdlczogZmlsdGVyZWRNZXNzYWdlcy5sZW5ndGggPyBmaWx0ZXJlZE1lc3NhZ2VzIDogbWVzc2FnZXMsXG5cdFx0Zm5HZXRNZXNzYWdlU3VidGl0bGU6XG5cdFx0XHRvQ29udHJvbCAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmIG1lc3NhZ2VIYW5kbGluZy5zZXRNZXNzYWdlU3VidGl0bGUuYmluZCh7fSwgb0NvbnRyb2wsIGFDb250ZXh0cyksXG5cdFx0c2hvd0NoYW5nZVNldEVycm9yRGlhbG9nOiBtUGFyYW1ldGVycy5iR3JvdXBlZFxuXHR9O1xufVxuXG4vKlxuICogQ3VycmVudGx5LCB0aGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3Igc2hvd2luZyB0aGUgZGlhbG9nIGFuZCBleGVjdXRpbmcgdGhlIGFjdGlvbi4gVGhlIHByb21pc2UgcmV0dXJuZWQgaXMgcGVuZGluZyB3aGlsZSB3YWl0aW5nIGZvciB1c2VyIGlucHV0LCBhcyB3ZWxsIGFzIHdoaWxlIHRoZVxuICogYmFjay1lbmQgcmVxdWVzdCBpcyBydW5uaW5nLiBUaGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aGVuIHRoZSB1c2VyIGNhbmNlbHMgdGhlIGRpYWxvZyBhbmQgYWxzbyB3aGVuIHRoZSBiYWNrLWVuZCByZXF1ZXN0IGZhaWxzLlxuICogVE9ETzogUmVmYWN0b3Jpbmc6IFNlcGFyYXRlIGRpYWxvZyBoYW5kbGluZyBmcm9tIGJhY2tlbmQgcHJvY2Vzc2luZy4gRGlhbG9nIGhhbmRsaW5nIHNob3VsZCByZXR1cm4gYSBQcm9taXNlIHJlc29sdmluZyB0byBwYXJhbWV0ZXJzIHRvIGJlIHByb3ZpZGVkIHRvIGJhY2tlbmQuIElmIGRpYWxvZyBpc1xuICogY2FuY2VsbGVkLCB0aGF0IHByb21pc2UgY2FuIGJlIHJlamVjdGVkLiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGJhY2tlbmQgcHJvY2Vzc2luZyBuZWVkIHRvIGRlYWwgd2l0aCBtdWx0aXBsZSBjb250ZXh0cyAtIGkuZS4gaXQgc2hvdWxkIGVpdGhlciByZXR1cm4gYW4gYXJyYXkgb2YgUHJvbWlzZXMgb3JcbiAqIGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gYW4gYXJyYXkuIEluIHRoZSBsYXR0ZXIgY2FzZSwgdGhhdCBQcm9taXNlIHNob3VsZCBiZSByZXNvbHZlZCBhbHNvIHdoZW4gc29tZSBvciBldmVuIGFsbCBjb250ZXh0cyBmYWlsZWQgaW4gYmFja2VuZCAtIHRoZSBvdmVyYWxsIHByb2Nlc3Mgc3RpbGwgd2FzXG4gKiBzdWNjZXNzZnVsLlxuICpcbiAqL1xuXG5mdW5jdGlvbiBzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nKFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdHNBY3Rpb25MYWJlbDogc3RyaW5nLFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRhQWN0aW9uUGFyYW1ldGVyczogQWN0aW9uUGFyYW1ldGVyW10sXG5cdGFQYXJhbWV0ZXJWYWx1ZXM6IGFueSxcblx0b0FjdGlvbkNvbnRleHQ6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0ZW50aXR5U2V0TmFtZTogYW55LFxuXHRtZXNzYWdlSGFuZGxlcjogYW55LFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0Y29uc3Qgc1BhdGggPSBfZ2V0UGF0aChvQWN0aW9uQ29udGV4dCwgc0FjdGlvbk5hbWUpLFxuXHRcdG1ldGFNb2RlbCA9IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCkub01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdGVudGl0eVNldENvbnRleHQgPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpLFxuXHRcdHNBY3Rpb25OYW1lUGF0aCA9IG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRJc0JvdW5kXCIpXG5cdFx0XHQ/IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIi9AJHVpNS5vdmVybG9hZC8wXCIpWzBdXG5cdFx0XHQ6IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIi8wXCIpWzBdLFxuXHRcdGFjdGlvbk5hbWVDb250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBY3Rpb25OYW1lUGF0aCksXG5cdFx0YklzQ3JlYXRlQWN0aW9uID0gbVBhcmFtZXRlcnMuaXNDcmVhdGVBY3Rpb24sXG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwL2ZlL2NvcmUvY29udHJvbHMvQWN0aW9uUGFyYW1ldGVyRGlhbG9nXCI7XG5cdHJldHVybiBuZXcgUHJvbWlzZShhc3luYyBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0bGV0IGFjdGlvblBhcmFtZXRlckluZm9zOiBBY3Rpb25QYXJhbWV0ZXJJbmZvW107IC8vIHRvIGJlIGZpbGxlZCBhZnRlciBmcmFnbWVudCAoZm9yIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nKSBpcyBsb2FkZWQuIEFjdHVhbGx5IG9ubHkgbmVlZGVkIGR1cmluZyBkaWFsb2cgcHJvY2Vzc2luZywgaS5lLiBjb3VsZCBiZSBtb3ZlZCBpbnRvIHRoZSBjb250cm9sbGVyIGFuZCBkaXJlY3RseSBpbml0aWFsaXplZCB0aGVyZSwgYnV0IG9ubHkgYWZ0ZXIgbW92aW5nIGFsbCBoYW5kbGVycyAoZXNwLiBwcmVzcyBoYW5kbGVyIGZvciBhY3Rpb24gYnV0dG9uKSB0byBjb250cm9sbGVyLlxuXG5cdFx0Y29uc3QgbWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cblx0XHRjb25zdCBfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlciA9IChwYXJhbWV0ZXI6IEFjdGlvblBhcmFtZXRlcikgPT4ge1xuXHRcdFx0Y29uc3QgYWxsTWVzc2FnZXMgPSBtZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0XHRjb25zdCBjb250cm9sSWQgPSBnZW5lcmF0ZShbXCJBUERfXCIsIHBhcmFtZXRlci4kTmFtZV0pO1xuXHRcdFx0Ly8gYWxzbyByZW1vdmUgbWVzc2FnZXMgYXNzaWduZWQgdG8gaW5uZXIgY29udHJvbHMsIGJ1dCBhdm9pZCByZW1vdmluZyBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IHBhcmFtdGVycyAod2l0aCBuYW1lIGJlaW5nIHN1YnN0cmluZyBvZiBhbm90aGVyIHBhcmFtZXRlciBuYW1lKVxuXHRcdFx0Y29uc3QgcmVsZXZhbnRNZXNzYWdlcyA9IGFsbE1lc3NhZ2VzLmZpbHRlcigobXNnOiBNZXNzYWdlKSA9PlxuXHRcdFx0XHRtc2cuZ2V0Q29udHJvbElkcygpLnNvbWUoKGlkOiBzdHJpbmcpID0+IGNvbnRyb2xJZC5zcGxpdChcIi1cIikuaW5jbHVkZXMoaWQpKVxuXHRcdFx0KTtcblx0XHRcdG1lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlbGV2YW50TWVzc2FnZXMpO1xuXHRcdH07XG5cblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHtcblx0XHRcdGhhbmRsZUNoYW5nZTogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogRXZlbnQpIHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0XHRcdGNvbnN0IGFjdGlvblBhcmFtZXRlckluZm8gPSBhY3Rpb25QYXJhbWV0ZXJJbmZvcy5maW5kKFxuXHRcdFx0XHRcdChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PiBhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkID09PSBmaWVsZFxuXHRcdFx0XHQpIGFzIEFjdGlvblBhcmFtZXRlckluZm87XG5cdFx0XHRcdC8vIGZpZWxkIHZhbHVlIGlzIGJlaW5nIGNoYW5nZWQsIHRodXMgZXhpc3RpbmcgbWVzc2FnZXMgcmVsYXRlZCB0byB0aGF0IGZpZWxkIGFyZSBub3QgdmFsaWQgYW55bW9yZVxuXHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihhY3Rpb25QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlcik7XG5cdFx0XHRcdC8vIGFkYXB0IGluZm8uIFByb21pc2UgaXMgcmVzb2x2ZWQgdG8gdmFsdWUgb3IgcmVqZWN0ZWQgd2l0aCBleGNlcHRpb24gY29udGFpbmluZyBtZXNzYWdlXG5cdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2UgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKSBhcyBQcm9taXNlPHN0cmluZz47XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZSA9IGF3YWl0IGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2U7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby5oYXNFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGRlbGV0ZSBhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlO1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8uaGFzRXJyb3IgPSB0cnVlO1xuXHRcdFx0XHRcdF9hZGRNZXNzYWdlRm9yQWN0aW9uUGFyYW1ldGVyKG1lc3NhZ2VNYW5hZ2VyLCBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IChlcnJvciBhcyB7IG1lc3NhZ2U6IHN0cmluZyB9KS5tZXNzYWdlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0Y29uc3Qgb1BhcmFtZXRlck1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHQkZGlzcGxheU1vZGU6IHt9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY3JlYXRlZEZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogb0FjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dCxcblx0XHRcdFx0XHRcdGVudGl0eVNldDogZW50aXR5U2V0Q29udGV4dFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBlbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IGVudGl0eVNldENvbnRleHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHRcdC8vIFRPRE86IG1vdmUgdGhlIGRpYWxvZyBpbnRvIHRoZSBmcmFnbWVudCBhbmQgbW92ZSB0aGUgaGFuZGxlcnMgdG8gdGhlIG9Db250cm9sbGVyXG5cdFx0XHRjb25zdCBhQ29udGV4dHM6IGFueVtdID0gbVBhcmFtZXRlcnMuYUNvbnRleHRzIHx8IFtdO1xuXHRcdFx0Y29uc3QgYUZ1bmN0aW9uUGFyYW1zOiBhbnlbXSA9IFtdO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuXHRcdFx0bGV0IG9PcGVyYXRpb25CaW5kaW5nOiBhbnk7XG5cdFx0XHRhd2FpdCBDb21tb25VdGlscy5zZXRVc2VyRGVmYXVsdHMob0FwcENvbXBvbmVudCwgYUFjdGlvblBhcmFtZXRlcnMsIG9QYXJhbWV0ZXJNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogY3JlYXRlZEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSkpIGFzIENvbnRyb2w7XG5cblx0XHRcdGFjdGlvblBhcmFtZXRlckluZm9zID0gYUFjdGlvblBhcmFtZXRlcnMubWFwKChhY3Rpb25QYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBDb3JlLmJ5SWQoZ2VuZXJhdGUoW1wiQVBEX1wiLCBhY3Rpb25QYXJhbWV0ZXIuJE5hbWVdKSkgYXMgRmllbGQgfCBNdWx0aVZhbHVlRmllbGQ7XG5cdFx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IGZpZWxkLmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHBhcmFtZXRlcjogYWN0aW9uUGFyYW1ldGVyLFxuXHRcdFx0XHRcdGZpZWxkOiBmaWVsZCxcblx0XHRcdFx0XHRpc011bHRpVmFsdWU6IGlzTXVsdGlWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKTtcblx0XHRcdGxldCBhY3Rpb25SZXN1bHQgPSB7XG5cdFx0XHRcdGRpYWxvZ0NhbmNlbGxlZDogdHJ1ZSwgLy8gdG8gYmUgc2V0IHRvIGZhbHNlIGluIGNhc2Ugb2Ygc3VjY2Vzc2Z1bCBhY3Rpb24gZXhlY3Rpb25cblx0XHRcdFx0cmVzdWx0OiB1bmRlZmluZWRcblx0XHRcdH07XG5cdFx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyhnZW5lcmF0ZShbXCJmZVwiLCBcIkFQRF9cIiwgc0FjdGlvbk5hbWVdKSwge1xuXHRcdFx0XHR0aXRsZTogc0FjdGlvbkxhYmVsIHx8IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfT1BFUkFUSU9OU19BQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19USVRMRVwiKSxcblx0XHRcdFx0Y29udGVudDogW29EaWFsb2dDb250ZW50XSxcblx0XHRcdFx0ZXNjYXBlSGFuZGxlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIGVzY2FwZSBoYW5kbGVyIGlzIG1lYW50IHRvIHBvc3NpYmx5IHN1cHByZXNzIG9yIHBvc3Rwb25lIGNsb3NpbmcgdGhlIGRpYWxvZyBvbiBlc2NhcGUgKGJ5IGNhbGxpbmcgXCJyZWplY3RcIiBvbiB0aGUgcHJvdmlkZWQgb2JqZWN0LCBvciBcInJlc29sdmVcIiBvbmx5IHdoZW5cblx0XHRcdFx0XHQvLyBkb25lIHdpdGggYWxsIHRhc2tzIHRvIGhhcHBlbiBiZWZvcmUgZGlhbG9nIGNhbiBiZSBjbG9zZWQpLiBJdCdzIG5vdCBpbnRlbmRlZCB0byBleHBsaWNldGx5IGNsb3NlIHRoZSBkaWFsb2cgaGVyZSAodGhhdCBoYXBwZW5zIGF1dG9tYXRpY2FsbHkgd2hlbiBub1xuXHRcdFx0XHRcdC8vIGVzY2FwZUhhbmRsZXIgaXMgcHJvdmlkZWQgb3IgdGhlIHJlc29sdmUtY2FsbGJhY2sgaXMgY2FsbGVkKSBvciBmb3Igb3duIHdyYXAgdXAgdGFza3MgKGxpa2UgcmVtb3ZpbmcgdmFsaWRpdGlvbiBtZXNzYWdlcyAtIHRoaXMgc2hvdWxkIGhhcHBlbiBpbiB0aGVcblx0XHRcdFx0XHQvLyBhZnRlckNsb3NlKS5cblx0XHRcdFx0XHQvLyBUT0RPOiBNb3ZlIHdyYXAgdXAgdGFza3MgdG8gYWZ0ZXJDbG9zZSwgYW5kIHJlbW92ZSB0aGlzIG1ldGhvZCBjb21wbGV0ZWx5LiBUYWtlIGNhcmUgdG8gYWxzbyBhZGFwdCBlbmQgYnV0dG9uIHByZXNzIGhhbmRsZXIgYWNjb3JkaW5nbHkuXG5cdFx0XHRcdFx0Ly8gQ3VycmVudGx5IG9ubHkgc3RpbGwgbmVlZGVkIHRvIGRpZmZlcmVudGlhdGUgY2xvc2luZyBkaWFsb2cgYWZ0ZXIgc3VjY2Vzc2Z1bCBleGVjdXRpb24gKHVzZXMgcmVzb2x2ZSkgZnJvbSB1c2VyIGNhbmNlbGxhdGlvbiAodXNpbmcgcmVqZWN0KVxuXHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHQvL1x0XHRyZWplY3QoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKGdlbmVyYXRlKFtcImZlXCIsIFwiQVBEX1wiLCBzQWN0aW9uTmFtZSwgXCJBY3Rpb25cIiwgXCJPa1wiXSksIHtcblx0XHRcdFx0XHR0ZXh0OiBiSXNDcmVhdGVBY3Rpb25cblx0XHRcdFx0XHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURV9CVVRUT05cIilcblx0XHRcdFx0XHRcdDogX2dldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUocmVzb3VyY2VNb2RlbCwgc0FjdGlvbkxhYmVsLCBzQWN0aW9uTmFtZSwgZW50aXR5U2V0TmFtZSksXG5cdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0cHJlc3M6IGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGlmICghKGF3YWl0IF92YWxpZGF0ZVByb3BlcnRpZXMobWVzc2FnZU1hbmFnZXIsIGFjdGlvblBhcmFtZXRlckluZm9zLCByZXNvdXJjZU1vZGVsKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRCdXN5TG9ja2VyLmxvY2sob0RpYWxvZyk7XG5cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBkdWUgdG8gdXNpbmcgdGhlIHNlYXJjaCBhbmQgdmFsdWUgaGVscHMgb24gdGhlIGFjdGlvbiBkaWFsb2cgdHJhbnNpZW50IG1lc3NhZ2VzIGNvdWxkIGFwcGVhclxuXHRcdFx0XHRcdFx0XHRcdC8vIHdlIG5lZWQgYW4gVVggZGVzaWduIGZvciB0aG9zZSB0byBzaG93IHRoZW0gdG8gdGhlIHVzZXIgLSBmb3Igbm93IHJlbW92ZSB0aGVtIGJlZm9yZSBjb250aW51aW5nXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbW92ZSBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gRGlhbG9nIChTaW1wbGVGb3JtKSB0byBtUGFyYW1ldGVycy5hY3Rpb25QYXJhbWV0ZXJzIHNvIHRoYXQgdGhleSBhcmUgYXZhaWxhYmxlIGluIHRoZSBvcGVyYXRpb24gYmluZGluZ3MgZm9yIGFsbCBjb250ZXh0c1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1ldGVyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1BhcmFtZXRlckNvbnRleHQgPSBvT3BlcmF0aW9uQmluZGluZyAmJiBvT3BlcmF0aW9uQmluZGluZy5nZXRQYXJhbWV0ZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUFjdGlvblBhcmFtZXRlcnNbaV0uJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhTVZGQ29udGVudCA9IG9EaWFsb2cuZ2V0TW9kZWwoXCJtdmZ2aWV3XCIpLmdldFByb3BlcnR5KGAvJHthQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZX1gKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhS2V5VmFsdWVzID0gW107XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgaiBpbiBhTVZGQ29udGVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFLZXlWYWx1ZXMucHVzaChhTVZGQ29udGVudFtqXS5LZXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IGFLZXlWYWx1ZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1ldGVyVmFsdWUgPSBvUGFyYW1ldGVyQ29udGV4dC5nZXRQcm9wZXJ0eShhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tpXS52YWx1ZSA9IHZQYXJhbWV0ZXJWYWx1ZTsgLy8gd3JpdGluZyB0aGUgY3VycmVudCB2YWx1ZSAodWVzZXIgaW5wdXQhKSBpbnRvIHRoZSBtZXRhbW9kZWwgPT4gc2hvdWxkIGJlIHJlZmFjdG9yZWQgdG8gdXNlIEFjdGlvblBhcmFtZXRlckluZm9zIGluc3RlYWQuIFVzZWQgaW4gc2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1ldGVyVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmxhYmVsID0gc0FjdGlvbkxhYmVsO1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhUmVzdWx0ID0gYXdhaXQgZXhlY3V0ZUFQTUFjdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9QYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb25SZXN1bHQgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZ0NhbmNlbGxlZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdDogYVJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIHJlc29sdmUoYVJlc3VsdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2VzID0gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyA9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuZGVsYXlTdWNjZXNzTWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3RyaWN0SGFuZGxpbmdGYWlscyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFGYWlsZWRDb250ZXh0cyA9IFtdIGFzIGFueTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ0ZhaWxzLmZvckVhY2goZnVuY3Rpb24gKGZhaWw6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUZhaWxlZENvbnRleHRzLnB1c2goZmFpbC5vQWN0aW9uLmdldENvbnRleHQoKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuYUNvbnRleHRzID0gYUZhaWxlZENvbnRleHRzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBleGVjdXRlQVBNQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb25SZXN1bHQgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkaWFsb2dDYW5jZWxsZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0OiBhUmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyByZXNvbHZlKGFSZXN1bHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdChtUGFyYW1ldGVycy5iR3JvdXBlZCAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmxlbmd0aCkgfHxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNoZWNrZm9yT3RoZXJNZXNzYWdlcyhtUGFyYW1ldGVycy5iR3JvdXBlZCkgIT09IC0xXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3Blbjogb0RpYWxvZy5pc09wZW4oKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQmVmb3JlU2hvd01lc3NhZ2U6IGZ1bmN0aW9uIChhTWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW46IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c0FjdGlvbk5hbWU6IHNBY3Rpb25MYWJlbFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvRGlhbG9nKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHNob3dNZXNzYWdlRGlhbG9nID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHQobVBhcmFtZXRlcnMuYkdyb3VwZWQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5sZW5ndGgpIHx8XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dDogbVBhcmFtZXRlcnMuYUNvbnRleHRzWzBdLFxuXHRcdFx0XHRcdFx0XHRcdFx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuOiBvRGlhbG9nLmlzT3BlbigpLFxuXHRcdFx0XHRcdFx0XHRcdFx0bWVzc2FnZVBhZ2VOYXZpZ2F0aW9uQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdG9uQmVmb3JlU2hvd01lc3NhZ2U6IGZ1bmN0aW9uIChhTWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW46IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBXaHkgaXMgdGhpcyBpbXBsZW1lbnRlZCBhcyBjYWxsYmFjaz8gQXBwYXJlbnRseSwgYWxsIG5lZWRlZCBpbmZvcm1hdGlvbiBpcyBhdmFpbGFibGUgYmVmb3JlaGFuZFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiByZWZhY3RvciBhY2NvcmRpbmdseVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaG93TWVzc2FnZVBhcmFtZXRlcnMgPSBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnNJbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93TWVzc2FnZURpYWxvZztcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNob3dNZXNzYWdlUGFyYW1ldGVycztcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0c0FjdGlvbk5hbWU6IHNBY3Rpb25MYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRyb2w6IG1QYXJhbWV0ZXJzLmNvbnRyb2xcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIEluIGNhc2Ugb2YgYmFja2VuZCB2YWxpZGF0aW9uIGVycm9yKHM/KSwgbWVzc2FnZSBzaGFsbCBub3QgYmUgc2hvd24gaW4gbWVzc2FnZSBkaWFsb2cgYnV0IG5leHQgdG8gdGhlIGZpZWxkIG9uIHBhcmFtZXRlciBkaWFsb2csIHdoaWNoIHNob3VsZFxuXHRcdFx0XHRcdFx0XHRcdC8vIHN0YXkgb3BlbiBpbiB0aGlzIGNhc2UgPT4gaW4gdGhpcyBjYXNlLCB3ZSBtdXN0IG5vdCByZXNvbHZlIG9yIHJlamVjdCB0aGUgcHJvbWlzZSBjb250cm9sbGluZyB0aGUgcGFyYW1ldGVyIGRpYWxvZy5cblx0XHRcdFx0XHRcdFx0XHQvLyBJbiBhbGwgb3RoZXIgY2FzZXMgKGUuZy4gb3RoZXIgYmFja2VuZCBlcnJvcnMgb3IgdXNlciBjYW5jZWxsYXRpb24pLCB0aGUgcHJvbWlzZSBjb250cm9sbGluZyB0aGUgcGFyYW1ldGVyIGRpYWxvZyBuZWVkcyB0byBiZSByZWplY3RlZCB0byBhbGxvd1xuXHRcdFx0XHRcdFx0XHRcdC8vIGNhbGxlcnMgdG8gcmVhY3QuIChFeGFtcGxlOiBJZiBjcmVhdGlvbiBpbiBiYWNrZW5kIGFmdGVyIG5hdmlnYXRpb24gdG8gdHJhbnNpZW50IGNvbnRleHQgZmFpbHMsIGJhY2sgbmF2aWdhdGlvbiBuZWVkcyB0byBiZSB0cmlnZ2VyZWQpXG5cdFx0XHRcdFx0XHRcdFx0Ly8gVE9ETzogUmVmYWN0b3IgdG8gc2VwYXJhdGUgZGlhbG9nIGhhbmRsaW5nIGZyb20gYmFja2VuZCByZXF1ZXN0IGlzdGVhZCBvZiB0YWtpbmcgZGVjaXNpb24gYmFzZWQgb24gbWVzc2FnZSBoYW5kbGluZ1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzaG93TWVzc2FnZURpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9EaWFsb2cuaXNPcGVuKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gZG8gbm90aGluZywgZG8gbm90IHJlamVjdCBwcm9taXNlIGhlcmVcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gV2UgZG8gbm90IGNsb3NlIHRoZSBBUE0gZGlhbG9nIGlmIHVzZXIgZW50ZXJzIGEgd3JvbmcgdmFsdWUgaW4gb2YgdGhlIGZpZWxkcyB0aGF0IHJlc3VsdHMgaW4gYW4gZXJyb3IgZnJvbSB0aGUgYmFja2VuZC5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVGhlIHVzZXIgY2FuIGNsb3NlIHRoZSBtZXNzYWdlIGRpYWxvZyBhbmQgdGhlIEFQTSBkaWFsb2cgd291bGQgc3RpbGwgYmUgb3BlbiBvbiB3aGljaCBoZSBjb3VsZCBlbnRlciBhIG5ldyB2YWx1ZSBhbmQgdHJpZ2dlciB0aGUgYWN0aW9uIGFnYWluLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBFYXJsaWVyIHdlIHdlcmUgcmVqZWN0aW5nIHRoZSBwcm9taXNlIG9uIGVycm9yIGhlcmUsIGFuZCB0aGUgY2FsbCBzdGFjayB3YXMgZGVzdHJveWVkIGFzIHRoZSBwcm9taXNlIHdhcyByZWplY3RlZCBhbmQgcmV0dXJuZWQgdG8gRWRpdEZsb3cgaW52b2tlIGFjdGlvbi5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gQnV0IHNpbmNlIHRoZSBBUE0gZGlhbG9nIHdhcyBzdGlsbCBvcGVuLCBhIG5ldyBwcm9taXNlIHdhcyByZXNvbHZlZCBpbiBjYXNlIHRoZSB1c2VyIHJldHJpZWQgdGhlIGFjdGlvbiBhbmQgdGhlIG9iamVjdCB3YXMgY3JlYXRlZCwgYnV0IHRoZSBuYXZpZ2F0aW9uIHRvIG9iamVjdCBwYWdlIHdhcyBub3QgdGFraW5nIHBsYWNlLlxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRcdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob0RpYWxvZykpIHtcblx0XHRcdFx0XHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSksXG5cdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbihnZW5lcmF0ZShbXCJmZVwiLCBcIkFQRF9cIiwgc0FjdGlvbk5hbWUsIFwiQWN0aW9uXCIsIFwiQ2FuY2VsXCJdKSwge1xuXHRcdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0FDVElPTl9QQVJBTUVURVJfRElBTE9HX0NBTkNFTFwiKSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ly8gVE9ETzogY2FuY2VsIGJ1dHRvbiBzaG91bGQganVzdCBjbG9zZSB0aGUgZGlhbG9nIChzaW1pbGFyIHRvIHVzaW5nIGVzY2FwZSkuIEFsbCB3cmFwIHVwIHRhc2tzIHNob3VsZCBiZSBtb3ZlZCB0byBhZnRlckNsb3NlLlxuXHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0Ly8gcmVqZWN0KENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSksXG5cdFx0XHRcdC8vIFRPRE86IGJlZm9yZU9wZW4gaXMganVzdCBhbiBldmVudCwgaS5lLiBub3Qgd2FpdGluZyBmb3IgdGhlIFByb21pc2UgdG8gYmUgcmVzb2x2ZWQuIENoZWNrIGlmIHRhc2tzIG9mIHRoaXMgZnVuY3Rpb24gbmVlZCB0byBiZSBkb25lIGJlZm9yZSBvcGVuaW5nIHRoZSBkaWFsb2dcblx0XHRcdFx0Ly8gLSBpZiB5ZXMsIHRoZXkgbmVlZCB0byBiZSBtb3ZlZCBvdXRzaWRlLlxuXHRcdFx0XHQvLyBBc3N1bXB0aW9uOiBTb21ldGltZXMgZGlhbG9nIGNhbiBiZSBzZWVuIHdpdGhvdXQgYW55IGZpZWxkcyBmb3IgYSBzaG9ydCB0aW1lIC0gbWF5YmUgdGhpcyBpcyBjYXVzZWQgYnkgdGhpcyBhc3luY2hyb25pdHlcblx0XHRcdFx0YmVmb3JlT3BlbjogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Ly8gY2xvbmUgZXZlbnQgZm9yIGFjdGlvbldyYXBwZXIgYXMgb0V2ZW50Lm9Tb3VyY2UgZ2V0cyBsb3N0IGR1cmluZyBwcm9jZXNzaW5nIG9mIGJlZm9yZU9wZW4gZXZlbnQgaGFuZGxlclxuXHRcdFx0XHRcdGNvbnN0IG9DbG9uZUV2ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgb0V2ZW50KTtcblxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdGNvbnN0IGdldERlZmF1bHRWYWx1ZXNGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvRGlhbG9nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdHNBY3Rpb25QYXRoID0gb0FjdGlvbkNvbnRleHQuc1BhdGggJiYgb0FjdGlvbkNvbnRleHQuc1BhdGguc3BsaXQoXCIvQFwiKVswXSxcblx0XHRcdFx0XHRcdFx0c0RlZmF1bHRWYWx1ZXNGdW5jdGlvbiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdFx0XHRcdGAke3NBY3Rpb25QYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0VmFsdWVzRnVuY3Rpb247XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyA9IGFzeW5jIGZ1bmN0aW9uIChzQmluZGluZ1BhcmFtZXRlcj86IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0JvdW5kRnVuY3Rpb25OYW1lID0gZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBwcmVmaWxsUGFyYW1ldGVyID0gYXN5bmMgZnVuY3Rpb24gKHNQYXJhbU5hbWU6IGFueSwgdlBhcmFtRGVmYXVsdFZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ2FzZSAxOiBUaGVyZSBpcyBhIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uXG5cdFx0XHRcdFx0XHRcdGlmICh2UGFyYW1EZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMCAmJiB2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1WYWx1ZSA9IGF3YWl0IENvbW1vblV0aWxzLnJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodlBhcmFtVmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1WYWx1ZSA9IGF3YWl0IG9PcGVyYXRpb25CaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuZ2V0UGFyYW1ldGVyQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQucmVxdWVzdFByb3BlcnR5KHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gRm9yIG11bHRpIHNlbGVjdCwgbmVlZCB0byBsb29wIG92ZXIgYUNvbnRleHRzIChhcyBjb250ZXh0cyBjYW5ub3QgYmUgcmV0cmlldmVkIHZpYSBiaW5kaW5nIHBhcmFtZXRlciBvZiB0aGUgb3BlcmF0aW9uIGJpbmRpbmcpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNQYXRoRm9yQ29udGV4dCA9IHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoc1BhdGhGb3JDb250ZXh0LmluZGV4T2YoYCR7c0JpbmRpbmdQYXJhbWV0ZXJ9L2ApID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzUGF0aEZvckNvbnRleHQgPSBzUGF0aEZvckNvbnRleHQucmVwbGFjZShgJHtzQmluZGluZ1BhcmFtZXRlcn0vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgYUNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUNvbnRleHRzW2ldLmdldFByb3BlcnR5KHNQYXRoRm9yQ29udGV4dCkgIT09IHZQYXJhbVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHRoZSB2YWx1ZXMgZnJvbSB0aGUgY29udGV4dHMgYXJlIG5vdCBhbGwgdGhlIHNhbWUsIGRvIG5vdCBwcmVmaWxsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1OYW1lOiBzUGFyYW1OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Yk5vUG9zc2libGVWYWx1ZTogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4geyBwYXJhbU5hbWU6IHNQYXJhbU5hbWUsIHZhbHVlOiB2UGFyYW1WYWx1ZSB9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlYWRpbmcgZGVmYXVsdCBhY3Rpb24gcGFyYW1ldGVyXCIsIHNQYXJhbU5hbWUsIG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJMYXRlUHJvcGVydHlFcnJvcjogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDEuMjogUGFyYW1ldGVyRGVmYXVsdFZhbHVlIGRlZmluZXMgYSBmaXhlZCBzdHJpbmcgdmFsdWUgKGkuZS4gdlBhcmFtRGVmYXVsdFZhbHVlID0gJ3NvbWVTdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgcGFyYW1OYW1lOiBzUGFyYW1OYW1lLCB2YWx1ZTogdlBhcmFtRGVmYXVsdFZhbHVlIH07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9QYXJhbWV0ZXJNb2RlbCAmJiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV0pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDI6IFRoZXJlIGlzIG5vIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uICg9PiBsb29rIGludG8gdGhlIEZMUCBVc2VyIERlZmF1bHRzKVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7IHBhcmFtTmFtZTogc1BhcmFtTmFtZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRjb25zdCBnZXRQYXJhbWV0ZXJEZWZhdWx0VmFsdWUgPSBmdW5jdGlvbiAoc1BhcmFtTmFtZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvRGlhbG9nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0c0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoID0gQ29tbW9uVXRpbHMuZ2V0UGFyYW1ldGVyUGF0aChvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCksIHNQYXJhbU5hbWUpICsgXCJAXCIsXG5cdFx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlckFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoKSxcblx0XHRcdFx0XHRcdFx0XHRvUGFyYW1ldGVyRGVmYXVsdFZhbHVlID1cblx0XHRcdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJBbm5vdGF0aW9ucyAmJiBvUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFyYW1ldGVyRGVmYXVsdFZhbHVlXCJdOyAvLyBlaXRoZXIgeyAkUGF0aDogJ3NvbWVQYXRoJyB9IG9yICdzb21lU3RyaW5nJ1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1BhcmFtZXRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGNvbnN0IGFDdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUgPSBbXTtcblx0XHRcdFx0XHRcdGxldCBzUGFyYW1OYW1lLCB2UGFyYW1ldGVyRGVmYXVsdFZhbHVlO1xuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdHNQYXJhbU5hbWUgPSBhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZTtcblx0XHRcdFx0XHRcdFx0dlBhcmFtZXRlckRlZmF1bHRWYWx1ZSA9IGdldFBhcmFtZXRlckRlZmF1bHRWYWx1ZShzUGFyYW1OYW1lKTtcblx0XHRcdFx0XHRcdFx0YUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZS5wdXNoKHByZWZpbGxQYXJhbWV0ZXIoc1BhcmFtTmFtZSwgdlBhcmFtZXRlckRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJElzQm91bmRcIikgJiYgYUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNCb3VuZEZ1bmN0aW9uTmFtZSAmJiBzQm91bmRGdW5jdGlvbk5hbWUubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc0JvdW5kRnVuY3Rpb25OYW1lID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0YUZ1bmN0aW9uUGFyYW1zLnB1c2goY2FsbEJvdW5kRnVuY3Rpb24oc0JvdW5kRnVuY3Rpb25OYW1lLCBhQ29udGV4dHNbaV0sIG1QYXJhbWV0ZXJzLm1vZGVsKSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IGFQcmVmaWxsUGFyYW1Qcm9taXNlcyA9IFByb21pc2UuYWxsKGFDdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUpO1xuXHRcdFx0XHRcdFx0bGV0IGFFeGVjRnVuY3Rpb25Qcm9taXNlczogUHJvbWlzZTxhbnlbXT4gPSBQcm9taXNlLnJlc29sdmUoW10pO1xuXHRcdFx0XHRcdFx0bGV0IG9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlO1xuXHRcdFx0XHRcdFx0aWYgKGFGdW5jdGlvblBhcmFtcyAmJiBhRnVuY3Rpb25QYXJhbXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRhRXhlY0Z1bmN0aW9uUHJvbWlzZXMgPSBQcm9taXNlLmFsbChhRnVuY3Rpb25QYXJhbXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTW9kdWxlID0gbVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3Vic3RyaW5nKDAsIG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgfHwgLTEpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFwuL2dpLCBcIi9cIiksXG5cdFx0XHRcdFx0XHRcdFx0c0Z1bmN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5zdWJzdHJpbmcoXG5cdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24ubGFzdEluZGV4T2YoXCIuXCIpICsgMSxcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZSA9IEZQTUhlbHBlci5hY3Rpb25XcmFwcGVyKG9DbG9uZUV2ZW50LCBzTW9kdWxlLCBzRnVuY3Rpb25OYW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dHM6IGFDb250ZXh0c1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVByb21pc2VzID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdFx0XHRcdGFQcmVmaWxsUGFyYW1Qcm9taXNlcyxcblx0XHRcdFx0XHRcdFx0XHRhRXhlY0Z1bmN0aW9uUHJvbWlzZXMsXG5cdFx0XHRcdFx0XHRcdFx0b0V4ZWNGdW5jdGlvbkZyb21NYW5pZmVzdFByb21pc2Vcblx0XHRcdFx0XHRcdFx0XSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZTogYW55ID0gYVByb21pc2VzWzBdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBmdW5jdGlvblBhcmFtcyA9IGFQcm9taXNlc1sxXTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0ID0gYVByb21pc2VzWzJdO1xuXHRcdFx0XHRcdFx0XHRsZXQgc0RpYWxvZ1BhcmFtTmFtZTogc3RyaW5nO1xuXG5cdFx0XHRcdFx0XHRcdC8vIEZpbGwgdGhlIGRpYWxvZyB3aXRoIHRoZSBlYXJsaWVyIGRldGVybWluZWQgcGFyYW1ldGVyIHZhbHVlcyBmcm9tIHRoZSBkaWZmZXJlbnQgc291cmNlc1xuXHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRcdFx0XHRzRGlhbG9nUGFyYW1OYW1lID0gYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gUGFyYW1ldGVyIHZhbHVlcyBwcm92aWRlZCBpbiB0aGUgY2FsbCBvZiBpbnZva2VBY3Rpb24gb3ZlcnJ1bGUgb3RoZXIgc291cmNlc1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlID0gYVBhcmFtZXRlclZhbHVlcz8uZmluZChcblx0XHRcdFx0XHRcdFx0XHRcdChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQubmFtZSA9PT0gYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWVcblx0XHRcdFx0XHRcdFx0XHQpPy52YWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRpZiAodlBhcmFtZXRlclByb3ZpZGVkVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSwgdlBhcmFtZXRlclByb3ZpZGVkVmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0ICYmIG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eShzRGlhbG9nUGFyYW1OYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0W3NEaWFsb2dQYXJhbU5hbWVdXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlW2ldICYmIGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZVtpXS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsIGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZVtpXS52YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBpZiB0aGUgZGVmYXVsdCB2YWx1ZSBoYWQgbm90IGJlZW4gcHJldmlvdXNseSBkZXRlcm1pbmVkIGR1ZSB0byBkaWZmZXJlbnQgY29udGV4dHMsIHdlIGRvIG5vdGhpbmcgZWxzZVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoc0JvdW5kRnVuY3Rpb25OYW1lICYmICFjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0uYk5vUG9zc2libGVWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHdlIGNoZWNrIGlmIHRoZSBmdW5jdGlvbiByZXRyaWV2ZXMgdGhlIHNhbWUgcGFyYW0gdmFsdWUgZm9yIGFsbCB0aGUgY29udGV4dHM6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCBqID0gMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0d2hpbGUgKGogPCBhQ29udGV4dHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2pdICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqICsgMV0gJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2pdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKSA9PT1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbaiArIDFdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aisrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9wYXJhbSB2YWx1ZXMgYXJlIGFsbCB0aGUgc2FtZTpcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGogPT09IGFDb250ZXh0cy5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGZ1bmN0aW9uUGFyYW1zWzBdICYmIGZ1bmN0aW9uUGFyYW1zWzBdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL09ubHkgb25lIGNvbnRleHQsIHRoZW4gdGhlIGRlZmF1bHQgcGFyYW0gdmFsdWVzIGFyZSB0byBiZSB2ZXJpZmllZCBmcm9tIHRoZSBmdW5jdGlvbjpcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbMF0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGJFcnJvckZvdW5kID0gY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlLnNvbWUoZnVuY3Rpb24gKG9WYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9WYWx1ZS5iTGF0ZVByb3BlcnR5RXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvVmFsdWUuYkxhdGVQcm9wZXJ0eUVycm9yO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdC8vIElmIGF0IGxlYXN0IG9uZSBEZWZhdWx0IFByb3BlcnR5IGlzIGEgTGF0ZSBQcm9wZXJ0eSBhbmQgYW4gZVRhZyBlcnJvciB3YXMgcmFpc2VkLlxuXHRcdFx0XHRcdFx0XHRpZiAoYkVycm9yRm91bmQpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzVGV4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9FVEFHX0xBVEVfUFJPUEVSVFlcIik7XG5cdFx0XHRcdFx0XHRcdFx0TWVzc2FnZUJveC53YXJuaW5nKHNUZXh0LCB7IGNvbnRlbnRXaWR0aDogXCIyNWVtXCIgfSBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBwYXJhbWV0ZXJcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGZuQXN5bmNCZWZvcmVPcGVuID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRJc0JvdW5kXCIpICYmIGFDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJFBhcmFtZXRlclwiKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXJhbWV0ZXIgPSBhUGFyYW1ldGVyc1swXSAmJiBhUGFyYW1ldGVyc1swXS4kTmFtZTtcblxuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0ID0gYXdhaXQgYUNvbnRleHRzWzBdLnJlcXVlc3RPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAob0NvbnRleHRPYmplY3QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihzQmluZGluZ1BhcmFtZXRlciwgb0NvbnRleHRPYmplY3QpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyhzQmluZGluZ1BhcmFtZXRlcik7XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgcGFyYW1ldGVyXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IGZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGF3YWl0IGZuQXN5bmNCZWZvcmVPcGVuKCk7XG5cblx0XHRcdFx0XHQvLyBhZGRpbmcgZGVmYXVsdGVkIHZhbHVlcyBvbmx5IGhlcmUgYWZ0ZXIgdGhleSBhcmUgbm90IHNldCB0byB0aGUgZmllbGRzXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvIG9mIGFjdGlvblBhcmFtZXRlckluZm9zKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IGFjdGlvblBhcmFtZXRlckluZm8uaXNNdWx0aVZhbHVlXG5cdFx0XHRcdFx0XHRcdD8gKGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgYXMgTXVsdGlWYWx1ZUZpZWxkKS5nZXRJdGVtcygpXG5cdFx0XHRcdFx0XHRcdDogKGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgYXMgRmllbGQpLmdldFZhbHVlKCk7XG5cdFx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbGlkYXRpb25Qcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyB3aGVuIHRoZSBkaWFsb2cgaXMgY2FuY2VsbGVkLCBtZXNzYWdlcyBuZWVkIHRvIGJlIHJlbW92ZWQgaW4gY2FzZSB0aGUgc2FtZSBhY3Rpb24gc2hvdWxkIGJlIGV4ZWN1dGVkIGFnYWluXG5cdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnMuZm9yRWFjaChfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcik7XG5cdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0aWYgKGFjdGlvblJlc3VsdC5kaWFsb2dDYW5jZWxsZWQpIHtcblx0XHRcdFx0XHRcdHJlamVjdChDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShhY3Rpb25SZXN1bHQucmVzdWx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0bVBhcmFtZXRlcnMub0RpYWxvZyA9IG9EaWFsb2c7XG5cdFx0XHRvRGlhbG9nLnNldE1vZGVsKG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCkub01vZGVsKTtcblx0XHRcdG9EaWFsb2cuc2V0TW9kZWwob1BhcmFtZXRlck1vZGVsLCBcInBhcmFtc01vZGVsXCIpO1xuXHRcdFx0b0RpYWxvZy5iaW5kRWxlbWVudCh7XG5cdFx0XHRcdHBhdGg6IFwiL1wiLFxuXHRcdFx0XHRtb2RlbDogXCJwYXJhbXNNb2RlbFwiXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gZW1wdHkgbW9kZWwgdG8gYWRkIGVsZW1lbnRzIGR5bmFtaWNhbGx5IGRlcGVuZGluZyBvbiBudW1iZXIgb2YgTVZGIGZpZWxkcyBkZWZpbmVkIG9uIHRoZSBkaWFsb2dcblx0XHRcdGNvbnN0IG9NVkZNb2RlbCA9IG5ldyBKU09OTW9kZWwoe30pO1xuXHRcdFx0b0RpYWxvZy5zZXRNb2RlbChvTVZGTW9kZWwsIFwibXZmdmlld1wiKTtcblxuXHRcdFx0LyogRXZlbnQgbmVlZGVkIGZvciByZW1vdmluZyBtZXNzYWdlcyBvZiB2YWxpZCBjaGFuZ2VkIGZpZWxkICovXG5cdFx0XHRmb3IgKGNvbnN0IGFjdGlvblBhcmFtZXRlckluZm8gb2YgYWN0aW9uUGFyYW1ldGVySW5mb3MpIHtcblx0XHRcdFx0aWYgKGFjdGlvblBhcmFtZXRlckluZm8uaXNNdWx0aVZhbHVlKSB7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mbz8uZmllbGQ/LmdldEJpbmRpbmcoXCJpdGVtc1wiKT8uYXR0YWNoQ2hhbmdlKCgpID0+IHtcblx0XHRcdFx0XHRcdF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyKGFjdGlvblBhcmFtZXRlckluZm8ucGFyYW1ldGVyKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvPy5maWVsZD8uZ2V0QmluZGluZyhcInZhbHVlXCIpPy5hdHRhY2hDaGFuZ2UoKCkgPT4ge1xuXHRcdFx0XHRcdFx0X3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIoYWN0aW9uUGFyYW1ldGVySW5mby5wYXJhbWV0ZXIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBzQWN0aW9uUGF0aCA9IGAke3NBY3Rpb25OYW1lfSguLi4pYDtcblx0XHRcdGlmICghYUNvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRzQWN0aW9uUGF0aCA9IGAvJHtzQWN0aW9uUGF0aH1gO1xuXHRcdFx0fVxuXHRcdFx0b0RpYWxvZy5iaW5kRWxlbWVudCh7XG5cdFx0XHRcdHBhdGg6IHNBY3Rpb25QYXRoXG5cdFx0XHR9KTtcblx0XHRcdGlmIChvUGFyZW50Q29udHJvbCkge1xuXHRcdFx0XHQvLyBpZiB0aGVyZSBpcyBhIHBhcmVudCBjb250cm9sIHNwZWNpZmllZCBhZGQgdGhlIGRpYWxvZyBhcyBkZXBlbmRlbnRcblx0XHRcdFx0b1BhcmVudENvbnRyb2wuYWRkRGVwZW5kZW50KG9EaWFsb2cpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdG9EaWFsb2cuc2V0QmluZGluZ0NvbnRleHQoYUNvbnRleHRzWzBdKTsgLy8gdXNlIGNvbnRleHQgb2YgZmlyc3Qgc2VsZWN0ZWQgbGluZSBpdGVtXG5cdFx0XHR9XG5cdFx0XHRvT3BlcmF0aW9uQmluZGluZyA9IG9EaWFsb2cuZ2V0T2JqZWN0QmluZGluZygpO1xuXHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdH1cblx0fSk7XG59XG5mdW5jdGlvbiBnZXRBY3Rpb25QYXJhbWV0ZXJzKG9BY3Rpb246IGFueSkge1xuXHRjb25zdCBhUGFyYW1ldGVycyA9IG9BY3Rpb24uZ2V0T2JqZWN0KFwiJFBhcmFtZXRlclwiKSB8fCBbXTtcblx0aWYgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmxlbmd0aCkge1xuXHRcdGlmIChvQWN0aW9uLmdldE9iamVjdChcIiRJc0JvdW5kXCIpKSB7XG5cdFx0XHQvL2luIGNhc2Ugb2YgYm91bmQgYWN0aW9ucywgaWdub3JlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgYW5kIGNvbnNpZGVyIHRoZSByZXN0XG5cdFx0XHRyZXR1cm4gYVBhcmFtZXRlcnMuc2xpY2UoMSwgYVBhcmFtZXRlcnMubGVuZ3RoKSB8fCBbXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFQYXJhbWV0ZXJzO1xufVxuZnVuY3Rpb24gZ2V0SXNBY3Rpb25Dcml0aWNhbChvTWV0YU1vZGVsOiBhbnksIHNQYXRoOiBhbnksIGNvbnRleHRzPzogYW55LCBvQm91bmRBY3Rpb24/OiBhbnkpIHtcblx0Y29uc3QgdkFjdGlvbkNyaXRpY2FsID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0FjdGlvbkNyaXRpY2FsYCk7XG5cdGxldCBzQ3JpdGljYWxQYXRoID0gdkFjdGlvbkNyaXRpY2FsICYmIHZBY3Rpb25Dcml0aWNhbC4kUGF0aDtcblx0aWYgKCFzQ3JpdGljYWxQYXRoKSB7XG5cdFx0Ly8gdGhlIHN0YXRpYyB2YWx1ZSBzY2VuYXJpbyBmb3IgaXNBY3Rpb25Dcml0aWNhbFxuXHRcdHJldHVybiAhIXZBY3Rpb25Dcml0aWNhbDtcblx0fVxuXHRjb25zdCBhQmluZGluZ1BhcmFtcyA9IG9Cb3VuZEFjdGlvbiAmJiBvQm91bmRBY3Rpb24uZ2V0T2JqZWN0KFwiJFBhcmFtZXRlclwiKSxcblx0XHRhUGF0aHMgPSBzQ3JpdGljYWxQYXRoICYmIHNDcml0aWNhbFBhdGguc3BsaXQoXCIvXCIpLFxuXHRcdGJDb25kaXRpb24gPVxuXHRcdFx0YUJpbmRpbmdQYXJhbXMgJiYgYUJpbmRpbmdQYXJhbXMubGVuZ3RoICYmIHR5cGVvZiBhQmluZGluZ1BhcmFtcyA9PT0gXCJvYmplY3RcIiAmJiBzQ3JpdGljYWxQYXRoICYmIGNvbnRleHRzICYmIGNvbnRleHRzLmxlbmd0aDtcblx0aWYgKGJDb25kaXRpb24pIHtcblx0XHQvL2luIGNhc2UgYmluZGluZyBwYXRhbWV0ZXJzIGFyZSB0aGVyZSBpbiBwYXRoIG5lZWQgdG8gcmVtb3ZlIGVnOiAtIF9pdC9pc1ZlcmlmaWVkID0+IG5lZWQgdG8gcmVtb3ZlIF9pdCBhbmQgdGhlIHBhdGggc2hvdWxkIGJlIGlzVmVyaWZpZWRcblx0XHRhQmluZGluZ1BhcmFtcy5maWx0ZXIoZnVuY3Rpb24gKG9QYXJhbXM6IGFueSkge1xuXHRcdFx0Y29uc3QgaW5kZXggPSBhUGF0aHMgJiYgYVBhdGhzLmluZGV4T2Yob1BhcmFtcy4kTmFtZSk7XG5cdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRhUGF0aHMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRzQ3JpdGljYWxQYXRoID0gYVBhdGhzLmpvaW4oXCIvXCIpO1xuXHRcdHJldHVybiBjb250ZXh0c1swXS5nZXRPYmplY3Qoc0NyaXRpY2FsUGF0aCk7XG5cdH0gZWxzZSBpZiAoc0NyaXRpY2FsUGF0aCkge1xuXHRcdC8vaWYgc2NlbmFyaW8gaXMgcGF0aCBiYXNlZCByZXR1cm4gdGhlIHBhdGggdmFsdWVcblx0XHRyZXR1cm4gY29udGV4dHNbMF0uZ2V0T2JqZWN0KHNDcml0aWNhbFBhdGgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lKHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsIHNBY3Rpb25MYWJlbDogc3RyaW5nLCBzQWN0aW9uTmFtZTogc3RyaW5nLCBzRW50aXR5U2V0TmFtZTogc3RyaW5nKSB7XG5cdGxldCBib3VuZEFjdGlvbk5hbWU6IGFueSA9IHNBY3Rpb25OYW1lID8gc0FjdGlvbk5hbWUgOiBudWxsO1xuXHRjb25zdCBhQWN0aW9uTmFtZSA9IGJvdW5kQWN0aW9uTmFtZS5zcGxpdChcIi5cIik7XG5cdGJvdW5kQWN0aW9uTmFtZSA9IGJvdW5kQWN0aW9uTmFtZS5pbmRleE9mKFwiLlwiKSA+PSAwID8gYUFjdGlvbk5hbWVbYUFjdGlvbk5hbWUubGVuZ3RoIC0gMV0gOiBib3VuZEFjdGlvbk5hbWU7XG5cdGNvbnN0IHN1ZmZpeFJlc291cmNlS2V5ID0gYm91bmRBY3Rpb25OYW1lICYmIHNFbnRpdHlTZXROYW1lID8gYCR7c0VudGl0eVNldE5hbWV9fCR7Ym91bmRBY3Rpb25OYW1lfWAgOiBcIlwiO1xuXHRjb25zdCBzS2V5ID0gXCJBQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19BQ1RJT05fTkFNRVwiO1xuXHRjb25zdCBiUmVzb3VyY2VLZXlFeGlzdHMgPSByZXNvdXJjZU1vZGVsLmNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhgJHtzS2V5fXwke3N1ZmZpeFJlc291cmNlS2V5fWApO1xuXHRpZiAoc0FjdGlvbkxhYmVsKSB7XG5cdFx0aWYgKGJSZXNvdXJjZUtleUV4aXN0cykge1xuXHRcdFx0cmV0dXJuIHJlc291cmNlTW9kZWwuZ2V0VGV4dChzS2V5LCB1bmRlZmluZWQsIHN1ZmZpeFJlc291cmNlS2V5KTtcblx0XHR9IGVsc2UgaWYgKHJlc291cmNlTW9kZWwuY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKGAke3NLZXl9fCR7c0VudGl0eVNldE5hbWV9YCkpIHtcblx0XHRcdHJldHVybiByZXNvdXJjZU1vZGVsLmdldFRleHQoc0tleSwgdW5kZWZpbmVkLCBgJHtzRW50aXR5U2V0TmFtZX1gKTtcblx0XHR9IGVsc2UgaWYgKHJlc291cmNlTW9kZWwuY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKGAke3NLZXl9YCkpIHtcblx0XHRcdHJldHVybiByZXNvdXJjZU1vZGVsLmdldFRleHQoc0tleSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzQWN0aW9uTGFiZWw7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfT0tcIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyhcblx0b0FjdGlvbjogYW55LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRiR2V0Qm91bmRDb250ZXh0OiBib29sZWFuLFxuXHRzR3JvdXBJZDogc3RyaW5nLFxuXHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIgfCB1bmRlZmluZWQsXG5cdGlDb250ZXh0TGVuZ3RoOiBudW1iZXIgfCBudWxsLFxuXHRjdXJyZW50X2NvbnRleHRfaW5kZXg6IG51bWJlciB8IG51bGwsXG5cdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlOiBGdW5jdGlvbixcblx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdDogRnVuY3Rpb24sXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPzogU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcbikge1xuXHRsZXQgb0FjdGlvblByb21pc2UsXG5cdFx0YkVuYWJsZVN0cmljdEhhbmRsaW5nID0gdHJ1ZTtcblx0aWYgKG1QYXJhbWV0ZXJzKSB7XG5cdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUgPSBpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZTtcblx0fVxuXHRpZiAoYkdldEJvdW5kQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc01ldGFQYXRoID0gb0FjdGlvbi5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRjb25zdCBvUHJvcGVydHkgPSBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KHNNZXRhUGF0aCk7XG5cdFx0aWYgKG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHlbMF0/LiRraW5kICE9PSBcIkFjdGlvblwiKSB7XG5cdFx0XHQvL2RvIG5vdCBlbmFibGUgdGhlIHN0cmljdCBoYW5kbGluZyBpZiBpdHMgbm90IGFuIGFjdGlvblxuXHRcdFx0YkVuYWJsZVN0cmljdEhhbmRsaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFiRW5hYmxlU3RyaWN0SGFuZGxpbmcpIHtcblx0XHRvQWN0aW9uUHJvbWlzZSA9IG9BY3Rpb24uZXhlY3V0ZShzR3JvdXBJZCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZShvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpKTtcblx0XHRcdHJldHVybiBvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdG9BY3Rpb25Qcm9taXNlID0gYkdldEJvdW5kQ29udGV4dFxuXHRcdFx0PyBvQWN0aW9uXG5cdFx0XHRcdFx0LmV4ZWN1dGUoXG5cdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdFx0XHRcdG9wZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldENvbnRleHQoKSxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZShvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpKTtcblx0XHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZWplY3QoKTtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHQ6IG9BY3Rpb25cblx0XHRcdFx0XHQuZXhlY3V0ZShcblx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0XHRcdG9BY3Rpb24uZ2V0Q29udGV4dCgpLFxuXHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdCgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KCk7XG5cdFx0XHRcdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gb0FjdGlvblByb21pc2UuY2F0Y2goKCkgPT4ge1xuXHRcdHRocm93IENvbnN0YW50cy5BY3Rpb25FeGVjdXRpb25GYWlsZWQ7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlRm9yQWN0aW9uRXhlY3V0aW9uKCkge1xuXHRsZXQgaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmU6IGFueSA9IG51bGwsXG5cdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdDogYW55ID0gbnVsbDtcblx0Y29uc3Qgb0xvY2FsQWN0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdCA9IHJlamVjdDtcblx0fSk7XG5cblx0cmV0dXJuIHsgb0xvY2FsQWN0aW9uUHJvbWlzZSwgaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUsIGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZWplY3QgfTtcbn1cblxuZnVuY3Rpb24gY2hlY2tmb3JPdGhlck1lc3NhZ2VzKGlzQ2hhbmdlU2V0OiBib29sZWFuKSB7XG5cdGlmIChpc0NoYW5nZVNldCkge1xuXHRcdGNvbnN0IGFNZXNzYWdlczogTWVzc2FnZVtdID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRyZXR1cm4gYU1lc3NhZ2VzLmZpbmRJbmRleChmdW5jdGlvbiAobWVzc2FnZTogTWVzc2FnZSkge1xuXHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBcIkVycm9yXCIgfHwgbWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiV2FybmluZ1wiO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gX2V4ZWN1dGVBY3Rpb24oXG5cdG9BcHBDb21wb25lbnQ6IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b1BhcmVudENvbnRyb2w/OiBhbnksXG5cdG1lc3NhZ2VIYW5kbGVyPzogTWVzc2FnZUhhbmRsZXIsXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPzogU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcbikge1xuXHRjb25zdCBhQ29udGV4dHMgPSBtUGFyYW1ldGVycy5hQ29udGV4dHMgfHwgW107XG5cdGNvbnN0IG9Nb2RlbCA9IG1QYXJhbWV0ZXJzLm1vZGVsO1xuXHRjb25zdCBhQWN0aW9uUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzIHx8IFtdO1xuXHRjb25zdCBzQWN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWU7XG5cdGNvbnN0IGZuT25TdWJtaXR0ZWQgPSBtUGFyYW1ldGVycy5mbk9uU3VibWl0dGVkO1xuXHRjb25zdCBmbk9uUmVzcG9uc2UgPSBtUGFyYW1ldGVycy5mbk9uUmVzcG9uc2U7XG5cdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKTtcblx0bGV0IG9BY3Rpb246IGFueTtcblxuXHRmdW5jdGlvbiBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKSB7XG5cdFx0aWYgKGFBY3Rpb25QYXJhbWV0ZXJzICYmIGFBY3Rpb25QYXJhbWV0ZXJzLmxlbmd0aCkge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoIWFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlKSB7XG5cdFx0XHRcdFx0c3dpdGNoIChhQWN0aW9uUGFyYW1ldGVyc1tqXS4kVHlwZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5TdHJpbmdcIjpcblx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUgPSBcIlwiO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJFZG0uQnl0ZVwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQxNlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQzMlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQ2NFwiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Ly8gdGJjXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0b0FjdGlvbi5zZXRQYXJhbWV0ZXIoYUFjdGlvblBhcmFtZXRlcnNbal0uJE5hbWUsIGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKGFDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBUT0RPOiByZWZhY3RvciB0byBkaXJlY3QgdXNlIG9mIFByb21pc2UuYWxsU2V0dGxlZFxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IG1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdGNvbnN0IGJHcm91cGVkID0gbVBhcmFtZXRlcnMuYkdyb3VwZWQ7XG5cdFx0XHRjb25zdCBiR2V0Qm91bmRDb250ZXh0ID0gbVBhcmFtZXRlcnMuYkdldEJvdW5kQ29udGV4dDtcblx0XHRcdGNvbnN0IGFBY3Rpb25Qcm9taXNlczogYW55W10gPSBbXTtcblx0XHRcdGxldCBvQWN0aW9uUHJvbWlzZTtcblx0XHRcdGxldCBpO1xuXHRcdFx0bGV0IHNHcm91cElkOiBzdHJpbmc7XG5cdFx0XHRjb25zdCBvaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZU9iamVjdCA9IGNyZWF0ZWludGVybmFsT3BlcmF0aW9uc1Byb21pc2VGb3JBY3Rpb25FeGVjdXRpb24oKTtcblx0XHRcdGNvbnN0IGZuRXhlY3V0ZUFjdGlvbiA9IGZ1bmN0aW9uIChhY3Rpb25Db250ZXh0OiBhbnksIGN1cnJlbnRfY29udGV4dF9pbmRleDogYW55LCBvU2lkZUVmZmVjdDogYW55LCBpQ29udGV4dExlbmd0aDogYW55KSB7XG5cdFx0XHRcdHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpO1xuXHRcdFx0XHRjb25zdCBpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZTogYW55ID0gW107XG5cdFx0XHRcdC8vIEZvciBpbnZvY2F0aW9uIGdyb3VwaW5nIFwiaXNvbGF0ZWRcIiBuZWVkIGJhdGNoIGdyb3VwIHBlciBhY3Rpb24gY2FsbFxuXHRcdFx0XHRzR3JvdXBJZCA9ICFiR3JvdXBlZCA/IGAkYXV0by4ke2N1cnJlbnRfY29udGV4dF9pbmRleH1gIDogYWN0aW9uQ29udGV4dC5nZXRVcGRhdGVHcm91cElkKCk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cyA9IGZuUmVxdWVzdFNpZGVFZmZlY3RzLmJpbmQoXG5cdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0LFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG9BY3Rpb25Qcm9taXNlID0gZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyhcblx0XHRcdFx0XHRhY3Rpb25Db250ZXh0LFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdGJHZXRCb3VuZENvbnRleHQsXG5cdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0b2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3QuaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUsXG5cdFx0XHRcdFx0b2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3QuaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdCxcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRhQWN0aW9uUHJvbWlzZXMucHVzaChvQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHRcdGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlLnB1c2gob2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3Qub0xvY2FsQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHRcdGZuUmVxdWVzdFNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQsIG9TaWRlRWZmZWN0LCBtUGFyYW1ldGVycywgc0dyb3VwSWQsIGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZChpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3QgZm5FeGVjdXRlU2luZ2xlQWN0aW9uID0gZnVuY3Rpb24gKGFjdGlvbkNvbnRleHQ6IGFueSwgY3VycmVudF9jb250ZXh0X2luZGV4OiBhbnksIG9TaWRlRWZmZWN0OiBhbnksIGlDb250ZXh0TGVuZ3RoOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgaW5kaXZpZHVhbEFjdGlvblByb21pc2U6IGFueSA9IFtdO1xuXHRcdFx0XHRzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKTtcblx0XHRcdFx0Ly8gRm9yIGludm9jYXRpb24gZ3JvdXBpbmcgXCJpc29sYXRlZFwiIG5lZWQgYmF0Y2ggZ3JvdXAgcGVyIGFjdGlvbiBjYWxsXG5cdFx0XHRcdHNHcm91cElkID0gYGFwaU1vZGUke2N1cnJlbnRfY29udGV4dF9pbmRleH1gO1xuXHRcdFx0XHRtUGFyYW1ldGVycy5yZXF1ZXN0U2lkZUVmZmVjdHMgPSBmblJlcXVlc3RTaWRlRWZmZWN0cy5iaW5kKFxuXHRcdFx0XHRcdG9wZXJhdGlvbnMsXG5cdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRvU2lkZUVmZmVjdCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRvQWN0aW9uUHJvbWlzZSA9IGV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMoXG5cdFx0XHRcdFx0YWN0aW9uQ29udGV4dCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRiR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdG9pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlT2JqZWN0LmludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlLFxuXHRcdFx0XHRcdG9pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlT2JqZWN0LmludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZWplY3QsXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0KTtcblx0XHRcdFx0YUFjdGlvblByb21pc2VzLnB1c2gob0FjdGlvblByb21pc2UpO1xuXHRcdFx0XHRpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZS5wdXNoKG9pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlT2JqZWN0Lm9Mb2NhbEFjdGlvblByb21pc2UpO1xuXHRcdFx0XHRmblJlcXVlc3RTaWRlRWZmZWN0cyhvQXBwQ29tcG9uZW50LCBvU2lkZUVmZmVjdCwgbVBhcmFtZXRlcnMsIHNHcm91cElkLCBpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbFNldHRsZWQoaW5kaXZpZHVhbEFjdGlvblByb21pc2UpO1xuXHRcdFx0fTtcblxuXHRcdFx0YXN5bmMgZnVuY3Rpb24gZm5FeGVjdXRlQ2hhbmdlc2V0KCkge1xuXHRcdFx0XHRjb25zdCBhQ2hhbmdlU2V0TG9jYWxQcm9taXNlcyA9IFtdIGFzIGFueTtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYCR7c0FjdGlvbk5hbWV9KC4uLilgLCBhQ29udGV4dHNbaV0sIG1CaW5kaW5nUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0YUNoYW5nZVNldExvY2FsUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdGZuRXhlY3V0ZUFjdGlvbihcblx0XHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aCA8PSAxID8gbnVsbCA6IGksXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiBhQ29udGV4dHNbaV0sXG5cdFx0XHRcdFx0XHRcdFx0cGF0aEV4cHJlc3Npb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdFx0XHRcdFx0dHJpZ2dlckFjdGlvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGFDb250ZXh0cy5sZW5ndGhcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdChcblx0XHRcdFx0XHRmbk9uU3VibWl0dGVkIHx8XG5cdFx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkoYUFjdGlvblByb21pc2VzKTtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoYUNoYW5nZVNldExvY2FsUHJvbWlzZXMpO1xuXHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5sZW5ndGgpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb3RoZXJFcnJvck1lc3NhZ2VJbmRleCA9IGNoZWNrZm9yT3RoZXJNZXNzYWdlcyh0cnVlKTtcblx0XHRcdFx0XHRcdGlmIChvdGhlckVycm9yTWVzc2FnZUluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCBvcGVyYXRpb25zSGVscGVyLnJlbmRlck1lc3NhZ2VWaWV3KFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMsXG5cdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aCA+IDFcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMuZm9yRWFjaChmdW5jdGlvbiAoc2hQcm9taXNlKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2hQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbWVzc2FnZU1vZGVsID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBtZXNzYWdlc0luTW9kZWwgPSBtZXNzYWdlTW9kZWwuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlTW9kZWwuc2V0RGF0YShtZXNzYWdlc0luTW9kZWwuY29uY2F0KHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJSZXRyaWdnZXJpbmcgb2Ygc3RyaWN0IGhhbmRsaW5nIGFjdGlvbnMgZmFpbGVkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRmbkhhbmRsZVJlc3VsdHMoKTtcblx0XHRcdH1cblxuXHRcdFx0YXN5bmMgZnVuY3Rpb24gZm5FeGVjdXRlU2VxdWVudGlhbGx5KGNvbnRleHRzVG9FeGVjdXRlOiBDb250ZXh0W10pIHtcblx0XHRcdFx0Ly8gT25lIGFjdGlvbiBhbmQgaXRzIHNpZGUgZWZmZWN0cyBhcmUgY29tcGxldGVkIGJlZm9yZSB0aGUgbmV4dCBhY3Rpb24gaXMgZXhlY3V0ZWRcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHRcdFx0LyoqL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KShhQWN0aW9uUHJvbWlzZXMpO1xuXHRcdFx0XHRmdW5jdGlvbiBwcm9jZXNzT25lQWN0aW9uKGNvbnRleHQ6IGFueSwgYWN0aW9uSW5kZXg6IGFueSwgaUNvbnRleHRMZW5ndGg6IGFueSkge1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYCR7c0FjdGlvbk5hbWV9KC4uLilgLCBjb250ZXh0LCBtQmluZGluZ1BhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdHJldHVybiBmbkV4ZWN1dGVTaW5nbGVBY3Rpb24oXG5cdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uSW5kZXgsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQ6IGNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdHBhdGhFeHByZXNzaW9uczogbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QgJiYgbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLFxuXHRcdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9uczogbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QgJiYgbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnNcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBzZXJpYWxpemF0aW9uOiBwcm9jZXNzT25lQWN0aW9uIHRvIGJlIGNhbGxlZCBmb3IgZWFjaCBlbnRyeSBpbiBjb250ZXh0c1RvRXhlY3V0ZSBvbmx5IGFmdGVyIHRoZSBwcm9taXNlIHJldHVybmVkIGZyb20gdGhlIG9uZSBiZWZvcmUgaGFzIGJlZW4gcmVzb2x2ZWRcblx0XHRcdFx0YXdhaXQgY29udGV4dHNUb0V4ZWN1dGUucmVkdWNlKGFzeW5jIChwcm9taXNlOiBQcm9taXNlPHZvaWQ+LCBjb250ZXh0OiBDb250ZXh0LCBpZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgcHJvbWlzZTtcblx0XHRcdFx0XHRhd2FpdCBwcm9jZXNzT25lQWN0aW9uKGNvbnRleHQsIGlkICsgMSwgYUNvbnRleHRzLmxlbmd0aCk7XG5cdFx0XHRcdH0sIFByb21pc2UucmVzb2x2ZSgpKTtcblxuXHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRhd2FpdCBvcGVyYXRpb25zSGVscGVyLnJlbmRlck1lc3NhZ2VWaWV3KFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyxcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aCA+IDFcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZuSGFuZGxlUmVzdWx0cygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWJHcm91cGVkKSB7XG5cdFx0XHRcdC8vIEZvciBpbnZvY2F0aW9uIGdyb3VwaW5nIFwiaXNvbGF0ZWRcIiwgZW5zdXJlIHRoYXQgZWFjaCBhY3Rpb24gYW5kIG1hdGNoaW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyBhcmUgcHJvY2Vzc2VkIGJlZm9yZSB0aGUgbmV4dCBzZXQgaXMgc3VibWl0dGVkLiBXb3JrYXJvdW5kIHVudGlsIEpTT04gYmF0Y2ggaXMgYXZhaWxhYmxlLlxuXHRcdFx0XHQvLyBBbGxvdyBhbHNvIGZvciBMaXN0IFJlcG9ydC5cblx0XHRcdFx0Zm5FeGVjdXRlU2VxdWVudGlhbGx5KGFDb250ZXh0cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmbkV4ZWN1dGVDaGFuZ2VzZXQoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZm5IYW5kbGVSZXN1bHRzKCkge1xuXHRcdFx0XHQvLyBQcm9taXNlLmFsbFNldHRsZWQgd2lsbCBuZXZlciBiZSByZWplY3RlZC4gSG93ZXZlciwgZXNsaW50IHJlcXVpcmVzIGVpdGhlciBjYXRjaCBvciByZXR1cm4gLSB0aHVzIHdlIHJldHVybiB0aGUgcmVzdWx0aW5nIFByb21pc2UgYWx0aG91Z2ggbm8gb25lIHdpbGwgdXNlIGl0LlxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKGFBY3Rpb25Qcm9taXNlcykudGhlbihyZXNvbHZlKTtcblx0XHRcdH1cblx0XHR9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdChcblx0XHRcdFx0Zm5PblJlc3BvbnNlIHx8XG5cdFx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdFx0LyoqL1xuXHRcdFx0XHR9XG5cdFx0XHQpKCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgLyR7c0FjdGlvbk5hbWV9KC4uLilgKTtcblx0XHRzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiYWN0aW9uSW1wb3J0XCI7XG5cdFx0Y29uc3Qgb0FjdGlvblByb21pc2UgPSBvQWN0aW9uLmV4ZWN1dGUoXG5cdFx0XHRzR3JvdXBJZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdG9wZXJhdGlvbnMsXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHR7IGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCwgbW9kZWw6IG9Nb2RlbCB9LFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdClcblx0XHQpO1xuXHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0Ly8gdHJpZ2dlciBvblN1Ym1pdHRlZCBcImV2ZW50XCJcblx0XHQoXG5cdFx0XHRmbk9uU3VibWl0dGVkIHx8XG5cdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHQvKiovXG5cdFx0XHR9XG5cdFx0KShvQWN0aW9uUHJvbWlzZSk7XG5cdFx0cmV0dXJuIG9BY3Rpb25Qcm9taXNlXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoY3VycmVudFByb21pc2VWYWx1ZTogdW5rbm93bikge1xuXHRcdFx0XHQvLyBIZXJlIHdlIGVuc3VyZSB0aGF0IHdlIHJldHVybiB0aGUgcmVzcG9uc2Ugd2UgZ290IGZyb20gYW4gdW5ib3VuZCBhY3Rpb24gdG8gdGhlXG5cdFx0XHRcdC8vIGNhbGxlciBCQ1AgOiAyMjcwMTM5Mjc5XG5cdFx0XHRcdGlmIChjdXJyZW50UHJvbWlzZVZhbHVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGN1cnJlbnRQcm9taXNlVmFsdWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZ2V0Qm91bmRDb250ZXh0Py4oKT8uZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGV4ZWN1dGluZyBhY3Rpb24gXCIgKyBzQWN0aW9uTmFtZSwgb0Vycm9yKTtcblx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGZuT25SZXNwb25zZSB8fFxuXHRcdFx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdFx0XHQvKiovXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpKCk7XG5cdFx0XHR9KTtcblx0fVxufVxuZnVuY3Rpb24gX2dldFBhdGgob0FjdGlvbkNvbnRleHQ6IGFueSwgc0FjdGlvbk5hbWU6IGFueSkge1xuXHRsZXQgc1BhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCk7XG5cdHNQYXRoID0gb0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJElzQm91bmRcIikgPyBzUGF0aC5zcGxpdChcIkAkdWk1Lm92ZXJsb2FkXCIpWzBdIDogc1BhdGguc3BsaXQoXCIvMFwiKVswXTtcblx0cmV0dXJuIHNQYXRoLnNwbGl0KGAvJHtzQWN0aW9uTmFtZX1gKVswXTtcbn1cblxuZnVuY3Rpb24gX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyhcblx0aXNDcmVhdGVBY3Rpb246IGJvb2xlYW4sXG5cdGFjdGlvblBhcmFtZXRlcnM6IFJlY29yZDxzdHJpbmcsIGFueT5bXSxcblx0cGFyYW1ldGVyVmFsdWVzPzogUmVjb3JkPHN0cmluZywgYW55PltdLFxuXHRzdGFydHVwUGFyYW1ldGVycz86IGFueVxuKTogYm9vbGVhbiB7XG5cdGlmIChwYXJhbWV0ZXJWYWx1ZXMpIHtcblx0XHQvLyBJZiBzaG93RGlhbG9nIGlzIGZhbHNlIGJ1dCB0aGVyZSBhcmUgcGFyYW1ldGVycyBmcm9tIHRoZSBpbnZva2VBY3Rpb24gY2FsbCwgd2UgbmVlZCB0byBjaGVjayB0aGF0IHZhbHVlcyBoYXZlIGJlZW5cblx0XHQvLyBwcm92aWRlZCBmb3IgYWxsIG9mIHRoZW1cblx0XHRmb3IgKGNvbnN0IGFjdGlvblBhcmFtZXRlciBvZiBhY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGFjdGlvblBhcmFtZXRlci4kTmFtZSAhPT0gXCJSZXN1bHRJc0FjdGl2ZUVudGl0eVwiICYmXG5cdFx0XHRcdCFwYXJhbWV0ZXJWYWx1ZXM/LmZpbmQoKGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5uYW1lID09PSBhY3Rpb25QYXJhbWV0ZXIuJE5hbWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gQXQgbGVhc3QgZm9yIG9uZSBwYXJhbWV0ZXIgbm8gdmFsdWUgaGFzIGJlZW4gcHJvdmlkZWQsIHNvIHdlIGNhbid0IHNraXAgdGhlIGRpYWxvZ1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlzQ3JlYXRlQWN0aW9uICYmIHN0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0Ly8gSWYgcGFyYW1ldGVycyBoYXZlIGJlZW4gcHJvdmlkZWQgZHVyaW5nIGFwcGxpY2F0aW9uIGxhdW5jaCwgd2UgbmVlZCB0byBjaGVjayBpZiB0aGUgc2V0IGlzIGNvbXBsZXRlXG5cdFx0Ly8gSWYgbm90LCB0aGUgcGFyYW1ldGVyIGRpYWxvZyBzdGlsbCBuZWVkcyB0byBiZSBzaG93bi5cblx0XHRmb3IgKGNvbnN0IGFjdGlvblBhcmFtZXRlciBvZiBhY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRpZiAoIXN0YXJ0dXBQYXJhbWV0ZXJzW2FjdGlvblBhcmFtZXRlci4kTmFtZV0pIHtcblx0XHRcdFx0Ly8gQXQgbGVhc3QgZm9yIG9uZSBwYXJhbWV0ZXIgbm8gdmFsdWUgaGFzIGJlZW4gcHJvdmlkZWQsIHNvIHdlIGNhbid0IHNraXAgdGhlIGRpYWxvZ1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBmblJlcXVlc3RTaWRlRWZmZWN0cyhvQXBwQ29tcG9uZW50OiBhbnksIG9TaWRlRWZmZWN0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnksIHNHcm91cElkOiBhbnksIGFMb2NhbFByb21pc2U/OiBhbnkpIHtcblx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdGxldCBvTG9jYWxQcm9taXNlO1xuXHQvLyB0cmlnZ2VyIGFjdGlvbnMgZnJvbSBzaWRlIGVmZmVjdHNcblx0aWYgKG9TaWRlRWZmZWN0ICYmIG9TaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zICYmIG9TaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zLmxlbmd0aCkge1xuXHRcdG9TaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKHNUcmlnZ2VyQWN0aW9uOiBhbnkpIHtcblx0XHRcdGlmIChzVHJpZ2dlckFjdGlvbikge1xuXHRcdFx0XHRvTG9jYWxQcm9taXNlID0gb1NpZGVFZmZlY3RzU2VydmljZS5leGVjdXRlQWN0aW9uKHNUcmlnZ2VyQWN0aW9uLCBvU2lkZUVmZmVjdC5jb250ZXh0LCBzR3JvdXBJZCk7XG5cdFx0XHRcdGlmIChhTG9jYWxQcm9taXNlKSB7XG5cdFx0XHRcdFx0YUxvY2FsUHJvbWlzZS5wdXNoKG9Mb2NhbFByb21pc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Ly8gcmVxdWVzdCBzaWRlIGVmZmVjdHMgZm9yIHRoaXMgYWN0aW9uXG5cdC8vIGFzIHdlIG1vdmUgdGhlIG1lc3NhZ2VzIHJlcXVlc3QgdG8gUE9TVCAkc2VsZWN0IHdlIG5lZWQgdG8gYmUgcHJlcGFyZWQgZm9yIGFuIGVtcHR5IGFycmF5XG5cdGlmIChvU2lkZUVmZmVjdCAmJiBvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMgJiYgb1NpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLmxlbmd0aCA+IDApIHtcblx0XHRvTG9jYWxQcm9taXNlID0gb1NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMob1NpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLCBvU2lkZUVmZmVjdC5jb250ZXh0LCBzR3JvdXBJZCk7XG5cdFx0aWYgKGFMb2NhbFByb21pc2UpIHtcblx0XHRcdGFMb2NhbFByb21pc2UucHVzaChvTG9jYWxQcm9taXNlKTtcblx0XHR9XG5cdFx0b0xvY2FsUHJvbWlzZVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmIG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0XHRcdFx0QWN0aW9uUnVudGltZS5zZXRBY3Rpb25FbmFibGVtZW50KFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdFx0XHRKU09OLnBhcnNlKG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5zZWxlY3RlZEl0ZW1zLFxuXHRcdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyB0byBjYWxsIE9EYXRhIGFjdGlvbnMgKGJvdW5kL2ltcG9ydCkgYW5kIGZ1bmN0aW9ucyAoYm91bmQvaW1wb3J0KVxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGV4cGVyaW1lbnRhbCB1c2UhIDxici8+PGI+VGhpcyBpcyBvbmx5IGEgUE9DIGFuZCBtYXliZSBkZWxldGVkPC9iPlxuICogQHNpbmNlIDEuNTYuMFxuICovXG5jb25zdCBvcGVyYXRpb25zID0ge1xuXHRjYWxsQm91bmRBY3Rpb246IGNhbGxCb3VuZEFjdGlvbixcblx0Y2FsbEFjdGlvbkltcG9ydDogY2FsbEFjdGlvbkltcG9ydCxcblx0Y2FsbEJvdW5kRnVuY3Rpb246IGNhbGxCb3VuZEZ1bmN0aW9uLFxuXHRjYWxsRnVuY3Rpb25JbXBvcnQ6IGNhbGxGdW5jdGlvbkltcG9ydCxcblx0ZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0czogZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyxcblx0dmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzOiBfdmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzLFxuXHRnZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lOiBfZ2V0QWN0aW9uUGFyYW1ldGVyQWN0aW9uTmFtZSxcblx0YWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjazogYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayxcblx0YWZ0ZXJBY3Rpb25SZXNvbHV0aW9uOiBhZnRlckFjdGlvblJlc29sdXRpb25cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9wZXJhdGlvbnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQStCQSxNQUFNQSxTQUFTLEdBQUdDLFNBQVMsQ0FBQ0QsU0FBUztJQUNwQ0Usa0JBQWtCLEdBQUdELFNBQVMsQ0FBQ0Msa0JBQWtCO0VBQ2xELE1BQU1DLE1BQU0sR0FBSUMsVUFBVSxDQUFTRCxNQUFNOztFQUV6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTRSxlQUFlLENBQ3ZCQyxXQUFtQixFQUNuQkMsUUFBYSxFQUNiQyxNQUFXLEVBQ1hDLGFBQTJCLEVBQzNCQyxXQUFnQixFQUNoQkMsdUJBQWlELEVBQ2hEO0lBQ0QsSUFBSSxDQUFDQSx1QkFBdUIsRUFBRTtNQUM3QkEsdUJBQXVCLEdBQUc7UUFDekJDLGFBQWEsRUFBRSxLQUFLO1FBQ3BCQyw2QkFBNkIsRUFBRSxFQUFFO1FBQ2pDQyxzQkFBc0IsRUFBRSxFQUFFO1FBQzFCQyw2QkFBNkIsRUFBRSxFQUFFO1FBQ2pDQyxvQkFBb0IsRUFBRSxFQUFFO1FBQ3hCQyxtQkFBbUIsRUFBRTtNQUN0QixDQUFDO0lBQ0Y7SUFDQSxJQUFJLENBQUNWLFFBQVEsSUFBSUEsUUFBUSxDQUFDVyxNQUFNLEtBQUssQ0FBQyxFQUFFO01BQ3ZDO01BQ0EsT0FBT0MsT0FBTyxDQUFDQyxNQUFN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