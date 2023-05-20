/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/editFlow/draft", "sap/m/CheckBox", "sap/m/MessageToast", "sap/m/Text"], function (Log, draft, CheckBox, MessageToast, Text) {
  "use strict";

  var _exports = {};
  let DeleteOptionTypes;
  (function (DeleteOptionTypes) {
    DeleteOptionTypes["deletableContexts"] = "deletableContexts";
    DeleteOptionTypes["draftsWithDeletableActive"] = "draftsWithDeletableActive";
    DeleteOptionTypes["createModeContexts"] = "createModeContexts";
    DeleteOptionTypes["unSavedContexts"] = "unSavedContexts";
    DeleteOptionTypes["draftsWithNonDeletableActive"] = "draftsWithNonDeletableActive";
    DeleteOptionTypes["draftsToDeleteBeforeActive"] = "draftsToDeleteBeforeActive";
  })(DeleteOptionTypes || (DeleteOptionTypes = {}));
  _exports.DeleteOptionTypes = DeleteOptionTypes;
  let DeleteDialogContentControl;
  (function (DeleteDialogContentControl) {
    DeleteDialogContentControl["CHECKBOX"] = "checkBox";
    DeleteDialogContentControl["TEXT"] = "text";
  })(DeleteDialogContentControl || (DeleteDialogContentControl = {}));
  _exports.DeleteDialogContentControl = DeleteDialogContentControl;
  function getUpdatedSelections(internalModelContext, type, selectedContexts, contextsToRemove) {
    contextsToRemove.forEach(context => {
      const idx = selectedContexts.indexOf(context);
      if (idx !== -1) {
        selectedContexts.splice(idx, 1);
      }
    });
    internalModelContext.setProperty(type, []);
    return [...selectedContexts];
  }
  function clearSelectedContextsForOption(internalModelContext, option) {
    let selectedContexts = internalModelContext.getProperty("selectedContexts") || [];
    if (option.type === DeleteOptionTypes.deletableContexts) {
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.deletableContexts, selectedContexts, internalModelContext.getProperty(DeleteOptionTypes.deletableContexts) || []);
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.createModeContexts, selectedContexts, internalModelContext.getProperty(DeleteOptionTypes.createModeContexts) || []);
      const draftSiblingPairs = internalModelContext.getProperty(DeleteOptionTypes.draftsWithDeletableActive) || [];
      const drafts = draftSiblingPairs.map(contextPair => {
        return contextPair.draft;
      });
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.draftsWithDeletableActive, selectedContexts, drafts);
    } else {
      const contextsToRemove = internalModelContext.getProperty(option.type) || [];
      selectedContexts = getUpdatedSelections(internalModelContext, option.type, selectedContexts, contextsToRemove);
    }
    internalModelContext.setProperty("selectedContexts", selectedContexts);
    internalModelContext.setProperty("numberOfSelectedContexts", selectedContexts.length);
  }
  function afterDeleteProcess(parameters, options, contexts, resourceModel) {
    const {
      internalModelContext,
      entitySetName
    } = parameters;
    if (internalModelContext) {
      if (internalModelContext.getProperty("deleteEnabled") != undefined) {
        options.forEach(option => {
          // if an option is selected, then it is deleted. So, we need to remove them from selected contexts.
          if (option.selected) {
            clearSelectedContextsForOption(internalModelContext, option);
          }
        });
      }
      // if atleast one of the options is not selected, then the delete button needs to be enabled.
      internalModelContext.setProperty("deleteEnabled", options.some(option => !option.selected));
    }
    if (contexts.length === 1) {
      MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", undefined, entitySetName));
    } else {
      MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", undefined, entitySetName));
    }
  }
  function getLockedContextUser(lockedContext) {
    const draftAdminData = lockedContext.getObject()["DraftAdministrativeData"];
    return draftAdminData && draftAdminData["InProcessByUser"] || "";
  }
  function getLockedObjectsText(resourceModel, numberOfSelectedContexts, lockedContexts) {
    let retTxt = "";
    if (numberOfSelectedContexts === 1 && lockedContexts.length === 1) {
      //only one unsaved object
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [lockedUser]);
    } else if (lockedContexts.length == 1) {
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", [numberOfSelectedContexts, lockedUser]);
    } else if (lockedContexts.length > 1) {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", [lockedContexts.length, numberOfSelectedContexts]);
    }
    return retTxt;
  }
  function getNonDeletableActivesOfDraftsText(resourceModel, numberOfDrafts, totalDeletable) {
    let retTxt = "";
    if (totalDeletable === numberOfDrafts) {
      if (numberOfDrafts === 1) {
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFT_OF_NON_DELETABLE_ACTIVE");
      } else {
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFTS_OF_NON_DELETABLE_ACTIVE");
      }
    } else if (numberOfDrafts === 1) {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFT_OF_NON_DELETABLE_ACTIVE");
    } else {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFTS_OF_NON_DELETABLE_ACTIVE");
    }
    return retTxt;
  }
  function getUnSavedContextUser(unSavedContext) {
    const draftAdminData = unSavedContext.getObject()["DraftAdministrativeData"];
    let sLastChangedByUser = "";
    if (draftAdminData) {
      sLastChangedByUser = draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
    }
    return sLastChangedByUser;
  }
  function getUnsavedContextsText(resourceModel, numberOfSelectedContexts, unSavedContexts, totalDeletable) {
    let infoTxt = "",
      optionTxt = "",
      optionWithoutTxt = false;
    if (numberOfSelectedContexts === 1 && unSavedContexts.length === 1) {
      //only one unsaved object are selected
      const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
      infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", [lastChangedByUser]);
      optionWithoutTxt = true;
    } else if (numberOfSelectedContexts === unSavedContexts.length) {
      //only multiple unsaved objects are selected
      infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS");
      optionWithoutTxt = true;
    } else if (totalDeletable === unSavedContexts.length) {
      // non-deletable/locked exists, all deletable are unsaved by others
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR", [lastChangedByUser]);
      } else {
        infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL");
      }
      optionWithoutTxt = true;
    } else if (totalDeletable > unSavedContexts.length) {
      // non-deletable/locked exists, deletable include unsaved and other types.
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR", [lastChangedByUser]);
      } else {
        optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL");
      }
    }
    return {
      infoTxt,
      optionTxt,
      optionWithoutTxt
    };
  }
  function getNonDeletableText(mParameters, totalNumDeletableContexts, resourceModel) {
    const {
      numberOfSelectedContexts,
      lockedContexts = [],
      draftsWithNonDeletableActive = []
    } = mParameters;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalNumDeletableContexts - draftsWithNonDeletableActive.length);
    let retTxt = "";
    if (nonDeletableContexts > 0 && (totalNumDeletableContexts === 0 || draftsWithNonDeletableActive.length === totalNumDeletableContexts)) {
      // 1. None of the ccontexts are deletable
      // 2. Only drafts of non deletable contexts exist.
      if (lockedContexts.length > 0) {
        // Locked contexts exist
        if (nonDeletableContexts === 1) {
          retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_SINGULAR");
        } else {
          retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_PLURAL");
        }
      } else if (nonDeletableContexts === 1) {
        // Only pure non-deletable contexts exist single
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_AND_ONE_OBJECT_NON_DELETABLE");
      } else {
        // Only pure non-deletable contexts exist multiple
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_MULTIPLE_AND_ALL_OBJECT_NON_DELETABLE");
      }
    } else if (nonDeletableContexts === 1) {
      // deletable and non-deletable exists together, single
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE", [numberOfSelectedContexts]);
    } else if (nonDeletableContexts > 1) {
      // deletable and non-deletable exists together, multiple
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", [nonDeletableContexts, numberOfSelectedContexts]);
    }
    return retTxt ? new Text({
      text: retTxt
    }) : undefined;
  }
  function getConfirmedDeletableContext(contexts, options) {
    return options.reduce((result, option) => {
      return option.selected && option.type !== DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
    }, contexts);
  }
  function getDraftsToDeleteBeforeActive(options) {
    const contexts = [];
    return options.reduce((result, option) => {
      return option.selected && option.type === DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
    }, contexts);
  }
  function updateDraftOptionsForDeletableTexts(mParameters, vContexts, totalDeletable, resourceModel, items, options) {
    const {
      numberOfSelectedContexts,
      draftsWithDeletableActive,
      unSavedContexts,
      createModeContexts,
      lockedContexts,
      draftsWithNonDeletableActive
    } = mParameters;
    let lockedContextsTxt = "";

    // drafts with active
    if (draftsWithDeletableActive.length > 0) {
      const draftsToDeleteBeforeActive = [];
      draftsWithDeletableActive.forEach(deletableDraftInfo => {
        if (deletableDraftInfo.draft.getProperty("DraftAdministrativeData/InProcessByUser")) {
          // If an own draft is locked then the draft needs to be discarded before deleting active record.
          draftsToDeleteBeforeActive.push(deletableDraftInfo.draft);
        }
        vContexts.push(deletableDraftInfo.siblingInfo.targetContext);
      });
      if (draftsToDeleteBeforeActive.length > 0) {
        options.push({
          type: DeleteOptionTypes.draftsToDeleteBeforeActive,
          contexts: draftsToDeleteBeforeActive,
          selected: true
        });
      }
    }

    // create mode drafts
    if (createModeContexts.length > 0) {
      // create mode drafts
      createModeContexts.forEach(context => vContexts.push(context));
    }

    // items locked msg
    if (lockedContexts.length > 0) {
      lockedContextsTxt = deleteHelper.getLockedObjectsText(resourceModel, numberOfSelectedContexts, lockedContexts) || "";
      items.push(new Text({
        text: lockedContextsTxt
      }));
    }

    // non deletable msg
    const nonDeletableExists = numberOfSelectedContexts != totalDeletable - draftsWithNonDeletableActive.length + lockedContexts.length;
    const nonDeletableTextCtrl = nonDeletableExists && deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
    if (nonDeletableTextCtrl) {
      items.push(nonDeletableTextCtrl);
    }

    // option: unsaved changes by others
    if (unSavedContexts.length > 0) {
      const unsavedChangesTxts = deleteHelper.getUnsavedContextsText(resourceModel, numberOfSelectedContexts, unSavedContexts, totalDeletable) || {};
      if (unsavedChangesTxts.infoTxt) {
        items.push(new Text({
          text: unsavedChangesTxts.infoTxt
        }));
      }
      if (unsavedChangesTxts.optionTxt || unsavedChangesTxts.optionWithoutTxt) {
        options.push({
          type: DeleteOptionTypes.unSavedContexts,
          contexts: unSavedContexts,
          text: unsavedChangesTxts.optionTxt,
          selected: true,
          control: DeleteDialogContentControl.CHECKBOX
        });
      }
    }

    // option: drafts with active not deletable
    if (draftsWithNonDeletableActive.length > 0) {
      const nonDeletableActivesOfDraftsText = deleteHelper.getNonDeletableActivesOfDraftsText(resourceModel, draftsWithNonDeletableActive.length, totalDeletable) || "";
      if (nonDeletableActivesOfDraftsText) {
        options.push({
          type: DeleteOptionTypes.draftsWithNonDeletableActive,
          contexts: draftsWithNonDeletableActive,
          text: nonDeletableActivesOfDraftsText,
          selected: true,
          control: totalDeletable > 0 ? DeleteDialogContentControl.CHECKBOX : DeleteDialogContentControl.TEXT
        });
      }
    }
  }
  function updateContentForDeleteDialog(options, items) {
    if (options.length === 1) {
      // Single option doesn't need checkBox
      const option = options[0];
      if (option.text) {
        items.push(new Text({
          text: option.text
        }));
      }
    } else if (options.length > 1) {
      // Multiple Options

      // Texts
      options.forEach(option => {
        if (option.control === "text" && option.text) {
          items.push(new Text({
            text: option.text
          }));
        }
      });
      // CheckBoxs
      options.forEach(option => {
        if (option.control === "checkBox" && option.text) {
          items.push(new CheckBox({
            text: option.text,
            selected: true,
            select: function (oEvent) {
              const checkBox = oEvent.getSource();
              const selected = checkBox.getSelected();
              option.selected = selected;
            }
          }));
        }
      });
    }
  }
  function updateOptionsForDeletableTexts(mParameters, directDeletableContexts, resourceModel, options) {
    const {
      numberOfSelectedContexts,
      entitySetName,
      parentControl,
      description,
      lockedContexts,
      draftsWithNonDeletableActive,
      unSavedContexts
    } = mParameters;
    const totalDeletable = directDeletableContexts.length + draftsWithNonDeletableActive.length + unSavedContexts.length;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalDeletable - draftsWithNonDeletableActive.length);
    if (numberOfSelectedContexts === 1 && numberOfSelectedContexts === directDeletableContexts.length) {
      // single deletable context
      const oLineContextData = directDeletableContexts[0].getObject();
      const oTable = parentControl;
      const sKey = oTable && oTable.getParent().getIdentifierColumn();
      let txt;
      let aParams = [];
      if (sKey) {
        const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
        const sDescription = description && description.path ? oLineContextData[description.path] : undefined;
        if (sKeyValue) {
          if (sDescription && description && sKey !== description.path) {
            aParams = [sKeyValue + " ", sDescription];
          } else {
            aParams = [sKeyValue, ""];
          }
          txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", aParams, entitySetName);
        } else {
          txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
        }
      } else {
        txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
      }
      options.push({
        type: DeleteOptionTypes.deletableContexts,
        contexts: directDeletableContexts,
        text: txt,
        selected: true,
        control: DeleteDialogContentControl.TEXT
      });
    } else if (unSavedContexts.length !== totalDeletable && numberOfSelectedContexts > 0 && (directDeletableContexts.length > 0 || unSavedContexts.length > 0 && draftsWithNonDeletableActive.length > 0)) {
      if (numberOfSelectedContexts > directDeletableContexts.length && nonDeletableContexts + lockedContexts.length > 0) {
        // other types exists with pure deletable ones
        let deletableOptionTxt = "";
        if (totalDeletable === 1) {
          deletableOptionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE", undefined, entitySetName);
        } else {
          deletableOptionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE", undefined, entitySetName);
        }
        options.unshift({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: deletableOptionTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      } else {
        // only deletable
        const allDeletableTxt = totalDeletable === 1 ? resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName) : resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL", undefined, entitySetName);
        options.push({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: allDeletableTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      }
    }
  }
  async function deleteConfirmHandler(options, mParameters, messageHandler, resourceModel, appComponent, draftEnabled) {
    try {
      const contexts = deleteHelper.getConfirmedDeletableContext([], options);
      const draftsToDeleteBeforeActive = getDraftsToDeleteBeforeActive(options);
      const {
        beforeDeleteCallBack,
        parentControl
      } = mParameters;
      if (beforeDeleteCallBack) {
        await beforeDeleteCallBack({
          contexts: contexts
        });
      }
      if (contexts && contexts.length) {
        try {
          const enableStrictHandling = contexts.length === 1 ? true : false;
          const draftErrors = [];
          await Promise.allSettled(draftsToDeleteBeforeActive.map(function (context) {
            try {
              return draft.deleteDraft(context, appComponent, enableStrictHandling);
            } catch (e) {
              Log.error(`FE : core : DeleteHelper : Error while discrding draft with path : ${context.getPath()}`);
              draftErrors.push(e);
            }
          }));
          await Promise.all(contexts.map(function (context) {
            if (draftEnabled && !context.getProperty("IsActiveEntity")) {
              //delete the draft
              return draft.deleteDraft(context, appComponent, enableStrictHandling);
            }
            return context.delete();
          }));
          deleteHelper.afterDeleteProcess(mParameters, options, contexts, resourceModel);
          if (draftErrors.length > 0) {
            throw Error(`FE : core : DeleteHelper : Errors on draft delete : ${draftErrors}`);
          }
        } catch (error) {
          await messageHandler.showMessageDialog({
            control: parentControl
          });
          // re-throw error to enforce rejecting the general promise
          throw error;
        }
      }
    } catch (oError) {
      await messageHandler.showMessages();
      // re-throw error to enforce rejecting the general promise
      throw oError;
    }
  }

  // Table Runtime Helpers:

  /* refreshes data in internal model relevant for enablement of delete button according to selected contexts
  relevant data are: deletableContexts, draftsWithDeletableActive, draftsWithNonDeletableActive, createModeContexts, unSavedContexts, deleteEnabled
  not relevant: lockedContexts
  */
  async function updateDeleteInfoForSelectedContexts(internalModelContext, selectedContexts) {
    const contextInfos = selectedContexts.map(context => {
      // assuming metaContext is the same for all contexts, still not relying on this assumption
      const metaContext = context.getModel().getMetaModel().getMetaContext(context.getCanonicalPath());
      const deletablePath = metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable/$Path");
      const staticDeletable = !deletablePath && metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable") !== false;
      // default values according to non-draft case (sticky behaves the same as non-draft from UI point of view regarding deletion)
      const info = {
        context: context,
        isDraftRoot: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftRoot"),
        isDraftNode: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftNode"),
        isActive: true,
        hasActive: false,
        hasDraft: false,
        locked: false,
        deletable: deletablePath ? context.getProperty(deletablePath) : staticDeletable,
        siblingPromise: Promise.resolve(undefined),
        siblingInfo: undefined,
        siblingDeletable: false
      };
      if (info.isDraftRoot) {
        var _context$getObject;
        info.locked = !!((_context$getObject = context.getObject("DraftAdministrativeData")) !== null && _context$getObject !== void 0 && _context$getObject.InProcessByUser);
        info.hasDraft = context.getProperty("HasDraftEntity");
      }
      if (info.isDraftRoot) {
        info.isActive = context.getProperty("IsActiveEntity");
        info.hasActive = context.getProperty("HasActiveEntity");
        if (!info.isActive && info.hasActive) {
          // get sibling contexts (only relevant for draft root, not for nodes)
          // draft.computeSiblingInformation expects draft root as first parameter - if we are on a subnode, this is not given
          // - done wrong also above, but seems not to break anything
          // - why is draft.computeSiblingInformation not able to calculate draft root on its own?!
          // - and why is it not able to deal with contexts not draft enabled (of course they never have a sibling - could just return undefined)
          info.siblingPromise = draft.computeSiblingInformation(context, context).then(async siblingInformation => {
            // For draftWithDeletableActive bucket, currently also siblingInformation is put into internalModel and used
            // from there in case of deletion. Therefore, sibling needs to be retrieved in case of staticDeletable.
            // Possible improvement: Only read siblingInfo here if needed for determination of delete button enablement,
            // in other cases, read it only if deletion really happens.
            info.siblingInfo = siblingInformation;
            if (deletablePath) {
              var _siblingInformation$t;
              info.siblingDeletable = await (siblingInformation === null || siblingInformation === void 0 ? void 0 : (_siblingInformation$t = siblingInformation.targetContext) === null || _siblingInformation$t === void 0 ? void 0 : _siblingInformation$t.requestProperty(deletablePath));
            } else {
              info.siblingDeletable = staticDeletable;
            }
          });
        }
      }
      return info;
    });
    // wait for all siblingPromises. If no sibling exists, promise is resolved to undefined (but it's still a promise)
    await Promise.all(contextInfos.map(info => info.siblingPromise));
    const buckets = [{
      key: "draftsWithDeletableActive",
      // only for draft root: In that case, the delete request needs to be sent for the active (i.e. the sibling),
      // while in draft node, the delete request needs to be send for the draft itself
      value: contextInfos.filter(info => info.isDraftRoot && !info.isActive && info.hasActive && info.siblingDeletable)
    }, {
      key: "draftsWithNonDeletableActive",
      // only for draft root: For draft node, we only rely on information in the draft itself (not its active sibling)
      // application has to take care to set this correctly (in case active sibling must not be deletable, activation
      // of draft with deleted node would also delte active sibling => deletion of draft node to be avoided)
      value: contextInfos.filter(info => info.isDraftRoot && !info.isActive && info.hasActive && !info.siblingDeletable)
    }, {
      key: "lockedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && info.locked)
    }, {
      key: "unSavedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && !info.locked)
    },
    // non-draft/sticky and deletable
    // active draft root without any draft and deletable
    // created draft root (regardless of deletable)
    // draft node only according to its annotation
    {
      key: "deletableContexts",
      value: contextInfos.filter(info => !info.isDraftRoot && !info.isDraftNode && info.deletable || info.isDraftRoot && info.isActive && !info.hasDraft && info.deletable || info.isDraftRoot && !info.isActive && !info.hasActive || info.isDraftNode && info.deletable)
    }];
    for (const {
      key,
      value
    } of buckets) {
      internalModelContext.setProperty(key,
      // Currently, bucket draftsWithDeletableActive has a different structure (containing also sibling information, which is used
      // in case of deletion). Possible improvement: Read sibling information only when needed, and build all buckets with same
      // structure. However, in that case siblingInformation might need to be read twice (if already needed for button enablement),
      // thus a buffer probably would make sense.
      value.map(info => key === "draftsWithDeletableActive" ? {
        draft: info.context,
        siblingInfo: info.siblingInfo
      } : info.context));
    }
  }
  const deleteHelper = {
    getNonDeletableText,
    deleteConfirmHandler,
    updateOptionsForDeletableTexts,
    updateContentForDeleteDialog,
    updateDraftOptionsForDeletableTexts,
    getConfirmedDeletableContext,
    getLockedObjectsText,
    getUnsavedContextsText,
    getNonDeletableActivesOfDraftsText,
    afterDeleteProcess,
    updateDeleteInfoForSelectedContexts
  };
  return deleteHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWxldGVPcHRpb25UeXBlcyIsIkRlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sIiwiZ2V0VXBkYXRlZFNlbGVjdGlvbnMiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInR5cGUiLCJzZWxlY3RlZENvbnRleHRzIiwiY29udGV4dHNUb1JlbW92ZSIsImZvckVhY2giLCJjb250ZXh0IiwiaWR4IiwiaW5kZXhPZiIsInNwbGljZSIsInNldFByb3BlcnR5IiwiY2xlYXJTZWxlY3RlZENvbnRleHRzRm9yT3B0aW9uIiwib3B0aW9uIiwiZ2V0UHJvcGVydHkiLCJkZWxldGFibGVDb250ZXh0cyIsImNyZWF0ZU1vZGVDb250ZXh0cyIsImRyYWZ0U2libGluZ1BhaXJzIiwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSIsImRyYWZ0cyIsIm1hcCIsImNvbnRleHRQYWlyIiwiZHJhZnQiLCJsZW5ndGgiLCJhZnRlckRlbGV0ZVByb2Nlc3MiLCJwYXJhbWV0ZXJzIiwib3B0aW9ucyIsImNvbnRleHRzIiwicmVzb3VyY2VNb2RlbCIsImVudGl0eVNldE5hbWUiLCJ1bmRlZmluZWQiLCJzZWxlY3RlZCIsInNvbWUiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwiZ2V0VGV4dCIsImdldExvY2tlZENvbnRleHRVc2VyIiwibG9ja2VkQ29udGV4dCIsImRyYWZ0QWRtaW5EYXRhIiwiZ2V0T2JqZWN0IiwiZ2V0TG9ja2VkT2JqZWN0c1RleHQiLCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJsb2NrZWRDb250ZXh0cyIsInJldFR4dCIsImxvY2tlZFVzZXIiLCJnZXROb25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0IiwibnVtYmVyT2ZEcmFmdHMiLCJ0b3RhbERlbGV0YWJsZSIsImdldFVuU2F2ZWRDb250ZXh0VXNlciIsInVuU2F2ZWRDb250ZXh0Iiwic0xhc3RDaGFuZ2VkQnlVc2VyIiwiZ2V0VW5zYXZlZENvbnRleHRzVGV4dCIsInVuU2F2ZWRDb250ZXh0cyIsImluZm9UeHQiLCJvcHRpb25UeHQiLCJvcHRpb25XaXRob3V0VHh0IiwibGFzdENoYW5nZWRCeVVzZXIiLCJnZXROb25EZWxldGFibGVUZXh0IiwibVBhcmFtZXRlcnMiLCJ0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzIiwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSIsIm5vbkRlbGV0YWJsZUNvbnRleHRzIiwiVGV4dCIsInRleHQiLCJnZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0IiwicmVkdWNlIiwicmVzdWx0IiwiZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUiLCJjb25jYXQiLCJnZXREcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZSIsInVwZGF0ZURyYWZ0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzIiwidkNvbnRleHRzIiwiaXRlbXMiLCJsb2NrZWRDb250ZXh0c1R4dCIsImRlbGV0YWJsZURyYWZ0SW5mbyIsInB1c2giLCJzaWJsaW5nSW5mbyIsInRhcmdldENvbnRleHQiLCJkZWxldGVIZWxwZXIiLCJub25EZWxldGFibGVFeGlzdHMiLCJub25EZWxldGFibGVUZXh0Q3RybCIsInVuc2F2ZWRDaGFuZ2VzVHh0cyIsImNvbnRyb2wiLCJDSEVDS0JPWCIsIm5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQiLCJURVhUIiwidXBkYXRlQ29udGVudEZvckRlbGV0ZURpYWxvZyIsIkNoZWNrQm94Iiwic2VsZWN0Iiwib0V2ZW50IiwiY2hlY2tCb3giLCJnZXRTb3VyY2UiLCJnZXRTZWxlY3RlZCIsInVwZGF0ZU9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyIsImRpcmVjdERlbGV0YWJsZUNvbnRleHRzIiwicGFyZW50Q29udHJvbCIsImRlc2NyaXB0aW9uIiwib0xpbmVDb250ZXh0RGF0YSIsIm9UYWJsZSIsInNLZXkiLCJnZXRQYXJlbnQiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwidHh0IiwiYVBhcmFtcyIsInNLZXlWYWx1ZSIsInNEZXNjcmlwdGlvbiIsInBhdGgiLCJkZWxldGFibGVPcHRpb25UeHQiLCJ1bnNoaWZ0IiwiYWxsRGVsZXRhYmxlVHh0IiwiZGVsZXRlQ29uZmlybUhhbmRsZXIiLCJtZXNzYWdlSGFuZGxlciIsImFwcENvbXBvbmVudCIsImRyYWZ0RW5hYmxlZCIsImJlZm9yZURlbGV0ZUNhbGxCYWNrIiwiZW5hYmxlU3RyaWN0SGFuZGxpbmciLCJkcmFmdEVycm9ycyIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwiZGVsZXRlRHJhZnQiLCJlIiwiTG9nIiwiZXJyb3IiLCJnZXRQYXRoIiwiYWxsIiwiZGVsZXRlIiwiRXJyb3IiLCJzaG93TWVzc2FnZURpYWxvZyIsIm9FcnJvciIsInNob3dNZXNzYWdlcyIsInVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzIiwiY29udGV4dEluZm9zIiwibWV0YUNvbnRleHQiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsImdldE1ldGFDb250ZXh0IiwiZ2V0Q2Fub25pY2FsUGF0aCIsImRlbGV0YWJsZVBhdGgiLCJzdGF0aWNEZWxldGFibGUiLCJpbmZvIiwiaXNEcmFmdFJvb3QiLCJpc0RyYWZ0Tm9kZSIsImlzQWN0aXZlIiwiaGFzQWN0aXZlIiwiaGFzRHJhZnQiLCJsb2NrZWQiLCJkZWxldGFibGUiLCJzaWJsaW5nUHJvbWlzZSIsInJlc29sdmUiLCJzaWJsaW5nRGVsZXRhYmxlIiwiSW5Qcm9jZXNzQnlVc2VyIiwiY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsInRoZW4iLCJzaWJsaW5nSW5mb3JtYXRpb24iLCJyZXF1ZXN0UHJvcGVydHkiLCJidWNrZXRzIiwia2V5IiwidmFsdWUiLCJmaWx0ZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRlbGV0ZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IGRyYWZ0LCB7IFNpYmxpbmdJbmZvcm1hdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQ2hlY2tCb3ggZnJvbSBcInNhcC9tL0NoZWNrQm94XCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5cbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwiLi9Nb2RlbEhlbHBlclwiO1xuXG5leHBvcnQgZW51bSBEZWxldGVPcHRpb25UeXBlcyB7XG5cdGRlbGV0YWJsZUNvbnRleHRzID0gXCJkZWxldGFibGVDb250ZXh0c1wiLFxuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlID0gXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIsXG5cdGNyZWF0ZU1vZGVDb250ZXh0cyA9IFwiY3JlYXRlTW9kZUNvbnRleHRzXCIsXG5cdHVuU2F2ZWRDb250ZXh0cyA9IFwidW5TYXZlZENvbnRleHRzXCIsXG5cdGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgPSBcImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmVcIixcblx0ZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUgPSBcImRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlXCJcbn1cblxuZXhwb3J0IGVudW0gRGVsZXRlRGlhbG9nQ29udGVudENvbnRyb2wge1xuXHRDSEVDS0JPWCA9IFwiY2hlY2tCb3hcIixcblx0VEVYVCA9IFwidGV4dFwiXG59XG5cbmV4cG9ydCB0eXBlIERyYWZ0U2libGluZ1BhaXIgPSB7XG5cdGRyYWZ0OiBDb250ZXh0O1xuXHRzaWJsaW5nSW5mbzogU2libGluZ0luZm9ybWF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgRGVsZXRlT3B0aW9uID0ge1xuXHR0eXBlOiBEZWxldGVPcHRpb25UeXBlcztcblx0Y29udGV4dHM6IENvbnRleHRbXTtcblx0c2VsZWN0ZWQ6IGJvb2xlYW47XG5cdHRleHQ/OiBzdHJpbmc7XG5cdGNvbnRyb2w/OiBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbDtcbn07XG5cbmV4cG9ydCB0eXBlIE1vZGVsT2JqZWN0UHJvcGVydGllcyA9IHtcblx0ZGVsZXRhYmxlQ29udGV4dHM6IENvbnRleHRbXTtcblx0dW5TYXZlZENvbnRleHRzOiBDb250ZXh0W107XG5cdGNyZWF0ZU1vZGVDb250ZXh0czogQ29udGV4dFtdO1xuXHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlOiBDb250ZXh0W107XG5cdGxvY2tlZENvbnRleHRzOiBDb250ZXh0W107XG5cdGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmU6IERyYWZ0U2libGluZ1BhaXJbXTtcblx0ZGVsZXRlRW5hYmxlZDogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZSA9IHtcblx0RHJhZnRVVUlEOiBzdHJpbmc7XG5cdEluUHJvY2Vzc0J5VXNlcj86IHN0cmluZztcblx0SW5Qcm9jZXNzQnlVc2VyRGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cdENyZWF0ZWRCeVVzZXJEZXNjcmlwdGlvbj86IHN0cmluZztcblx0Q3JlYXRlZEJ5VXNlcj86IHN0cmluZztcblx0TGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvbj86IHN0cmluZztcblx0TGFzdENoYW5nZWRCeVVzZXI/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVQYXJhbWV0ZXJzID0ge1xuXHRpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0czogbnVtYmVyO1xuXHRlbnRpdHlTZXROYW1lOiBzdHJpbmc7XG5cdHBhcmVudENvbnRyb2w6IENvbnRyb2w7XG5cdGRlc2NyaXB0aW9uOiB7IHBhdGg6IHN0cmluZyB9O1xuXHRiZWZvcmVEZWxldGVDYWxsQmFjazogRnVuY3Rpb247XG5cdGRlbGV0YWJsZUNvbnRleHRzOiBDb250ZXh0W107XG5cdHVuU2F2ZWRDb250ZXh0czogQ29udGV4dFtdO1xuXHRjcmVhdGVNb2RlQ29udGV4dHM6IENvbnRleHRbXTtcblx0ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZTogQ29udGV4dFtdO1xuXHRsb2NrZWRDb250ZXh0czogQ29udGV4dFtdO1xuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlOiBEcmFmdFNpYmxpbmdQYWlyW107XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVUZXh0SW5mbyA9IHtcblx0aW5mb1R4dD86IHN0cmluZztcblx0b3B0aW9uVHh0Pzogc3RyaW5nO1xuXHRvcHRpb25XaXRob3V0VHh0PzogYm9vbGVhbjtcbn07XG5cbmZ1bmN0aW9uIGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLFxuXHRzZWxlY3RlZENvbnRleHRzOiBDb250ZXh0W10sXG5cdGNvbnRleHRzVG9SZW1vdmU6IENvbnRleHRbXVxuKTogQ29udGV4dFtdIHtcblx0Y29udGV4dHNUb1JlbW92ZS5mb3JFYWNoKChjb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgaWR4ID0gc2VsZWN0ZWRDb250ZXh0cy5pbmRleE9mKGNvbnRleHQpO1xuXHRcdGlmIChpZHggIT09IC0xKSB7XG5cdFx0XHRzZWxlY3RlZENvbnRleHRzLnNwbGljZShpZHgsIDEpO1xuXHRcdH1cblx0fSk7XG5cdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHR5cGUsIFtdKTtcblxuXHRyZXR1cm4gWy4uLnNlbGVjdGVkQ29udGV4dHNdO1xufVxuXG5mdW5jdGlvbiBjbGVhclNlbGVjdGVkQ29udGV4dHNGb3JPcHRpb24oaW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvcHRpb246IERlbGV0ZU9wdGlvbikge1xuXHRsZXQgc2VsZWN0ZWRDb250ZXh0cyA9IChpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIikgYXMgQ29udGV4dFtdKSB8fCBbXTtcblxuXHRpZiAob3B0aW9uLnR5cGUgPT09IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzKSB7XG5cdFx0c2VsZWN0ZWRDb250ZXh0cyA9IGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHREZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cyxcblx0XHRcdHNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShEZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cykgfHwgW11cblx0XHQpO1xuXHRcdHNlbGVjdGVkQ29udGV4dHMgPSBnZXRVcGRhdGVkU2VsZWN0aW9ucyhcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0RGVsZXRlT3B0aW9uVHlwZXMuY3JlYXRlTW9kZUNvbnRleHRzLFxuXHRcdFx0c2VsZWN0ZWRDb250ZXh0cyxcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KERlbGV0ZU9wdGlvblR5cGVzLmNyZWF0ZU1vZGVDb250ZXh0cykgfHwgW11cblx0XHQpO1xuXG5cdFx0Y29uc3QgZHJhZnRTaWJsaW5nUGFpcnMgPSBpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShEZWxldGVPcHRpb25UeXBlcy5kcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlKSB8fCBbXTtcblx0XHRjb25zdCBkcmFmdHMgPSBkcmFmdFNpYmxpbmdQYWlycy5tYXAoKGNvbnRleHRQYWlyOiBEcmFmdFNpYmxpbmdQYWlyKSA9PiB7XG5cdFx0XHRyZXR1cm4gY29udGV4dFBhaXIuZHJhZnQ7XG5cdFx0fSk7XG5cdFx0c2VsZWN0ZWRDb250ZXh0cyA9IGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHREZWxldGVPcHRpb25UeXBlcy5kcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLFxuXHRcdFx0c2VsZWN0ZWRDb250ZXh0cyxcblx0XHRcdGRyYWZ0c1xuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgY29udGV4dHNUb1JlbW92ZSA9IGludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KG9wdGlvbi50eXBlKSB8fCBbXTtcblx0XHRzZWxlY3RlZENvbnRleHRzID0gZ2V0VXBkYXRlZFNlbGVjdGlvbnMoaW50ZXJuYWxNb2RlbENvbnRleHQsIG9wdGlvbi50eXBlLCBzZWxlY3RlZENvbnRleHRzLCBjb250ZXh0c1RvUmVtb3ZlKTtcblx0fVxuXHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgc2VsZWN0ZWRDb250ZXh0cyk7XG5cdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIHNlbGVjdGVkQ29udGV4dHMubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gYWZ0ZXJEZWxldGVQcm9jZXNzKHBhcmFtZXRlcnM6IERlbGV0ZVBhcmFtZXRlcnMsIG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdLCBjb250ZXh0czogQ29udGV4dFtdLCByZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsKSB7XG5cdGNvbnN0IHsgaW50ZXJuYWxNb2RlbENvbnRleHQsIGVudGl0eVNldE5hbWUgfSA9IHBhcmFtZXRlcnM7XG5cdGlmIChpbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdGlmIChpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImRlbGV0ZUVuYWJsZWRcIikgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4ge1xuXHRcdFx0XHQvLyBpZiBhbiBvcHRpb24gaXMgc2VsZWN0ZWQsIHRoZW4gaXQgaXMgZGVsZXRlZC4gU28sIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZW0gZnJvbSBzZWxlY3RlZCBjb250ZXh0cy5cblx0XHRcdFx0aWYgKG9wdGlvbi5zZWxlY3RlZCkge1xuXHRcdFx0XHRcdGNsZWFyU2VsZWN0ZWRDb250ZXh0c0Zvck9wdGlvbihpbnRlcm5hbE1vZGVsQ29udGV4dCwgb3B0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vIGlmIGF0bGVhc3Qgb25lIG9mIHRoZSBvcHRpb25zIGlzIG5vdCBzZWxlY3RlZCwgdGhlbiB0aGUgZGVsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBlbmFibGVkLlxuXHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0XCJkZWxldGVFbmFibGVkXCIsXG5cdFx0XHRvcHRpb25zLnNvbWUoKG9wdGlvbikgPT4gIW9wdGlvbi5zZWxlY3RlZClcblx0XHQpO1xuXHR9XG5cblx0aWYgKGNvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdE1lc3NhZ2VUb2FzdC5zaG93KHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RFTEVURV9UT0FTVF9TSU5HVUxBUlwiLCB1bmRlZmluZWQsIGVudGl0eVNldE5hbWUpKTtcblx0fSBlbHNlIHtcblx0XHRNZXNzYWdlVG9hc3Quc2hvdyhyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9ERUxFVEVfVE9BU1RfUExVUkFMXCIsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSkpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldExvY2tlZENvbnRleHRVc2VyKGxvY2tlZENvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcge1xuXHRjb25zdCBkcmFmdEFkbWluRGF0YSA9IGxvY2tlZENvbnRleHQuZ2V0T2JqZWN0KClbXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVwiXSBhcyBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVR5cGU7XG5cdHJldHVybiAoZHJhZnRBZG1pbkRhdGEgJiYgZHJhZnRBZG1pbkRhdGFbXCJJblByb2Nlc3NCeVVzZXJcIl0pIHx8IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGdldExvY2tlZE9iamVjdHNUZXh0KHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsIG51bWJlck9mU2VsZWN0ZWRDb250ZXh0czogbnVtYmVyLCBsb2NrZWRDb250ZXh0czogQ29udGV4dFtdKTogc3RyaW5nIHtcblx0bGV0IHJldFR4dCA9IFwiXCI7XG5cblx0aWYgKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gMSAmJiBsb2NrZWRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHQvL29ubHkgb25lIHVuc2F2ZWQgb2JqZWN0XG5cdFx0Y29uc3QgbG9ja2VkVXNlciA9IGdldExvY2tlZENvbnRleHRVc2VyKGxvY2tlZENvbnRleHRzWzBdKTtcblx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9PQkpFQ1RfTE9DS0VEXCIsIFtsb2NrZWRVc2VyXSk7XG5cdH0gZWxzZSBpZiAobG9ja2VkQ29udGV4dHMubGVuZ3RoID09IDEpIHtcblx0XHRjb25zdCBsb2NrZWRVc2VyID0gZ2V0TG9ja2VkQ29udGV4dFVzZXIobG9ja2VkQ29udGV4dHNbMF0pO1xuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfT05FX09CSkVDVF9MT0NLRURcIiwgW1xuXHRcdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLFxuXHRcdFx0bG9ja2VkVXNlclxuXHRcdF0pO1xuXHR9IGVsc2UgaWYgKGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX0xPQ0tFRFwiLCBbXG5cdFx0XHRsb2NrZWRDb250ZXh0cy5sZW5ndGgsXG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcblx0XHRdKTtcblx0fVxuXG5cdHJldHVybiByZXRUeHQ7XG59XG5cbmZ1bmN0aW9uIGdldE5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQocmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCwgbnVtYmVyT2ZEcmFmdHM6IG51bWJlciwgdG90YWxEZWxldGFibGU6IG51bWJlcik6IHN0cmluZyB7XG5cdGxldCByZXRUeHQgPSBcIlwiO1xuXG5cdGlmICh0b3RhbERlbGV0YWJsZSA9PT0gbnVtYmVyT2ZEcmFmdHMpIHtcblx0XHRpZiAobnVtYmVyT2ZEcmFmdHMgPT09IDEpIHtcblx0XHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX09OTFlfRFJBRlRfT0ZfTk9OX0RFTEVUQUJMRV9BQ1RJVkVcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX09OTFlfRFJBRlRTX09GX05PTl9ERUxFVEFCTEVfQUNUSVZFXCIpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChudW1iZXJPZkRyYWZ0cyA9PT0gMSkge1xuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX0RSQUZUX09GX05PTl9ERUxFVEFCTEVfQUNUSVZFXCIpO1xuXHR9IGVsc2Uge1xuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX0RSQUZUU19PRl9OT05fREVMRVRBQkxFX0FDVElWRVwiKTtcblx0fVxuXG5cdHJldHVybiByZXRUeHQ7XG59XG5cbmZ1bmN0aW9uIGdldFVuU2F2ZWRDb250ZXh0VXNlcih1blNhdmVkQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gdW5TYXZlZENvbnRleHQuZ2V0T2JqZWN0KClbXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVwiXSBhcyBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVR5cGU7XG5cdGxldCBzTGFzdENoYW5nZWRCeVVzZXIgPSBcIlwiO1xuXHRpZiAoZHJhZnRBZG1pbkRhdGEpIHtcblx0XHRzTGFzdENoYW5nZWRCeVVzZXIgPSBkcmFmdEFkbWluRGF0YVtcIkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb25cIl0gfHwgZHJhZnRBZG1pbkRhdGFbXCJMYXN0Q2hhbmdlZEJ5VXNlclwiXSB8fCBcIlwiO1xuXHR9XG5cblx0cmV0dXJuIHNMYXN0Q2hhbmdlZEJ5VXNlcjtcbn1cblxuZnVuY3Rpb24gZ2V0VW5zYXZlZENvbnRleHRzVGV4dChcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBudW1iZXIsXG5cdHVuU2F2ZWRDb250ZXh0czogQ29udGV4dFtdLFxuXHR0b3RhbERlbGV0YWJsZTogbnVtYmVyXG4pOiBEZWxldGVUZXh0SW5mbyB7XG5cdGxldCBpbmZvVHh0ID0gXCJcIixcblx0XHRvcHRpb25UeHQgPSBcIlwiLFxuXHRcdG9wdGlvbldpdGhvdXRUeHQgPSBmYWxzZTtcblx0aWYgKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gMSAmJiB1blNhdmVkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0Ly9vbmx5IG9uZSB1bnNhdmVkIG9iamVjdCBhcmUgc2VsZWN0ZWRcblx0XHRjb25zdCBsYXN0Q2hhbmdlZEJ5VXNlciA9IGdldFVuU2F2ZWRDb250ZXh0VXNlcih1blNhdmVkQ29udGV4dHNbMF0pO1xuXHRcdGluZm9UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1VOU0FWRURfQ0hBTkdFU1wiLCBbbGFzdENoYW5nZWRCeVVzZXJdKTtcblx0XHRvcHRpb25XaXRob3V0VHh0ID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPT09IHVuU2F2ZWRDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvL29ubHkgbXVsdGlwbGUgdW5zYXZlZCBvYmplY3RzIGFyZSBzZWxlY3RlZFxuXHRcdGluZm9UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1VOU0FWRURfQ0hBTkdFU19NVUxUSVBMRV9PQkpFQ1RTXCIpO1xuXHRcdG9wdGlvbldpdGhvdXRUeHQgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKHRvdGFsRGVsZXRhYmxlID09PSB1blNhdmVkQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly8gbm9uLWRlbGV0YWJsZS9sb2NrZWQgZXhpc3RzLCBhbGwgZGVsZXRhYmxlIGFyZSB1bnNhdmVkIGJ5IG90aGVyc1xuXHRcdGlmICh1blNhdmVkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRjb25zdCBsYXN0Q2hhbmdlZEJ5VXNlciA9IGdldFVuU2F2ZWRDb250ZXh0VXNlcih1blNhdmVkQ29udGV4dHNbMF0pO1xuXHRcdFx0aW5mb1R4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9BTkRfRkVXX09CSkVDVFNfTE9DS0VEX1NJTkdVTEFSXCIsIFtcblx0XHRcdFx0bGFzdENoYW5nZWRCeVVzZXJcblx0XHRcdF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbmZvVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9VTlNBVkVEX0FORF9GRVdfT0JKRUNUU19MT0NLRURfUExVUkFMXCIpO1xuXHRcdH1cblx0XHRvcHRpb25XaXRob3V0VHh0ID0gdHJ1ZTtcblx0fSBlbHNlIGlmICh0b3RhbERlbGV0YWJsZSA+IHVuU2F2ZWRDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBub24tZGVsZXRhYmxlL2xvY2tlZCBleGlzdHMsIGRlbGV0YWJsZSBpbmNsdWRlIHVuc2F2ZWQgYW5kIG90aGVyIHR5cGVzLlxuXHRcdGlmICh1blNhdmVkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRjb25zdCBsYXN0Q2hhbmdlZEJ5VXNlciA9IGdldFVuU2F2ZWRDb250ZXh0VXNlcih1blNhdmVkQ29udGV4dHNbMF0pO1xuXHRcdFx0b3B0aW9uVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9GRVdfT0JKRUNUU19VTlNBVkVEX1NJTkdVTEFSXCIsIFtcblx0XHRcdFx0bGFzdENoYW5nZWRCeVVzZXJcblx0XHRcdF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvcHRpb25UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX1VOU0FWRURfUExVUkFMXCIpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7IGluZm9UeHQsIG9wdGlvblR4dCwgb3B0aW9uV2l0aG91dFR4dCB9O1xufVxuXG5mdW5jdGlvbiBnZXROb25EZWxldGFibGVUZXh0KFxuXHRtUGFyYW1ldGVyczogRGVsZXRlUGFyYW1ldGVycyxcblx0dG90YWxOdW1EZWxldGFibGVDb250ZXh0czogbnVtYmVyLFxuXHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsXG4pOiBUZXh0IHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgeyBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsIGxvY2tlZENvbnRleHRzID0gW10sIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgPSBbXSB9ID0gbVBhcmFtZXRlcnM7XG5cdGNvbnN0IG5vbkRlbGV0YWJsZUNvbnRleHRzID1cblx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgLSAobG9ja2VkQ29udGV4dHMubGVuZ3RoICsgdG90YWxOdW1EZWxldGFibGVDb250ZXh0cyAtIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoKTtcblx0bGV0IHJldFR4dCA9IFwiXCI7XG5cblx0aWYgKFxuXHRcdG5vbkRlbGV0YWJsZUNvbnRleHRzID4gMCAmJlxuXHRcdCh0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzID09PSAwIHx8IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoID09PSB0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzKVxuXHQpIHtcblx0XHQvLyAxLiBOb25lIG9mIHRoZSBjY29udGV4dHMgYXJlIGRlbGV0YWJsZVxuXHRcdC8vIDIuIE9ubHkgZHJhZnRzIG9mIG5vbiBkZWxldGFibGUgY29udGV4dHMgZXhpc3QuXG5cdFx0aWYgKGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIExvY2tlZCBjb250ZXh0cyBleGlzdFxuXHRcdFx0aWYgKG5vbkRlbGV0YWJsZUNvbnRleHRzID09PSAxKSB7XG5cdFx0XHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfQUxMX1JFTUFJTklOR19OT05fREVMRVRBQkxFX1NJTkdVTEFSXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9BTExfUkVNQUlOSU5HX05PTl9ERUxFVEFCTEVfUExVUkFMXCIpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAobm9uRGVsZXRhYmxlQ29udGV4dHMgPT09IDEpIHtcblx0XHRcdC8vIE9ubHkgcHVyZSBub24tZGVsZXRhYmxlIGNvbnRleHRzIGV4aXN0IHNpbmdsZVxuXHRcdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9TSU5HTEVfQU5EX09ORV9PQkpFQ1RfTk9OX0RFTEVUQUJMRVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT25seSBwdXJlIG5vbi1kZWxldGFibGUgY29udGV4dHMgZXhpc3QgbXVsdGlwbGVcblx0XHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfTVVMVElQTEVfQU5EX0FMTF9PQkpFQ1RfTk9OX0RFTEVUQUJMRVwiKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobm9uRGVsZXRhYmxlQ29udGV4dHMgPT09IDEpIHtcblx0XHQvLyBkZWxldGFibGUgYW5kIG5vbi1kZWxldGFibGUgZXhpc3RzIHRvZ2V0aGVyLCBzaW5nbGVcblx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX09ORV9PQkpFQ1RfTk9OX0RFTEVUQUJMRVwiLCBbXG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcblx0XHRdKTtcblx0fSBlbHNlIGlmIChub25EZWxldGFibGVDb250ZXh0cyA+IDEpIHtcblx0XHQvLyBkZWxldGFibGUgYW5kIG5vbi1kZWxldGFibGUgZXhpc3RzIHRvZ2V0aGVyLCBtdWx0aXBsZVxuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfTk9OX0RFTEVUQUJMRVwiLCBbXG5cdFx0XHRub25EZWxldGFibGVDb250ZXh0cyxcblx0XHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1xuXHRcdF0pO1xuXHR9XG5cblx0cmV0dXJuIHJldFR4dCA/IG5ldyBUZXh0KHsgdGV4dDogcmV0VHh0IH0pIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0KGNvbnRleHRzOiBDb250ZXh0W10sIG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdKTogQ29udGV4dFtdIHtcblx0cmV0dXJuIG9wdGlvbnMucmVkdWNlKChyZXN1bHQsIG9wdGlvbikgPT4ge1xuXHRcdHJldHVybiBvcHRpb24uc2VsZWN0ZWQgJiYgb3B0aW9uLnR5cGUgIT09IERlbGV0ZU9wdGlvblR5cGVzLmRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlID8gcmVzdWx0LmNvbmNhdChvcHRpb24uY29udGV4dHMpIDogcmVzdWx0O1xuXHR9LCBjb250ZXh0cyk7XG59XG5cbmZ1bmN0aW9uIGdldERyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlKG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdKTogQ29udGV4dFtdIHtcblx0Y29uc3QgY29udGV4dHM6IENvbnRleHRbXSA9IFtdO1xuXHRyZXR1cm4gb3B0aW9ucy5yZWR1Y2UoKHJlc3VsdCwgb3B0aW9uKSA9PiB7XG5cdFx0cmV0dXJuIG9wdGlvbi5zZWxlY3RlZCAmJiBvcHRpb24udHlwZSA9PT0gRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUgPyByZXN1bHQuY29uY2F0KG9wdGlvbi5jb250ZXh0cykgOiByZXN1bHQ7XG5cdH0sIGNvbnRleHRzKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMoXG5cdG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHR2Q29udGV4dHM6IENvbnRleHRbXSxcblx0dG90YWxEZWxldGFibGU6IG51bWJlcixcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0aXRlbXM6IENvbnRyb2xbXSxcblx0b3B0aW9uczogRGVsZXRlT3B0aW9uW11cbikge1xuXHRjb25zdCB7XG5cdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLFxuXHRcdGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUsXG5cdFx0dW5TYXZlZENvbnRleHRzLFxuXHRcdGNyZWF0ZU1vZGVDb250ZXh0cyxcblx0XHRsb2NrZWRDb250ZXh0cyxcblx0XHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlXG5cdH0gPSBtUGFyYW1ldGVycztcblx0bGV0IGxvY2tlZENvbnRleHRzVHh0ID0gXCJcIjtcblxuXHQvLyBkcmFmdHMgd2l0aCBhY3RpdmVcblx0aWYgKGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlOiBDb250ZXh0W10gPSBbXTtcblx0XHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLmZvckVhY2goKGRlbGV0YWJsZURyYWZ0SW5mbzogRHJhZnRTaWJsaW5nUGFpcikgPT4ge1xuXHRcdFx0aWYgKGRlbGV0YWJsZURyYWZ0SW5mby5kcmFmdC5nZXRQcm9wZXJ0eShcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSkge1xuXHRcdFx0XHQvLyBJZiBhbiBvd24gZHJhZnQgaXMgbG9ja2VkIHRoZW4gdGhlIGRyYWZ0IG5lZWRzIHRvIGJlIGRpc2NhcmRlZCBiZWZvcmUgZGVsZXRpbmcgYWN0aXZlIHJlY29yZC5cblx0XHRcdFx0ZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUucHVzaChkZWxldGFibGVEcmFmdEluZm8uZHJhZnQpO1xuXHRcdFx0fVxuXHRcdFx0dkNvbnRleHRzLnB1c2goZGVsZXRhYmxlRHJhZnRJbmZvLnNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQpO1xuXHRcdH0pO1xuXHRcdGlmIChkcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBEZWxldGVPcHRpb25UeXBlcy5kcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZSxcblx0XHRcdFx0Y29udGV4dHM6IGRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlLFxuXHRcdFx0XHRzZWxlY3RlZDogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gY3JlYXRlIG1vZGUgZHJhZnRzXG5cdGlmIChjcmVhdGVNb2RlQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdC8vIGNyZWF0ZSBtb2RlIGRyYWZ0c1xuXHRcdGNyZWF0ZU1vZGVDb250ZXh0cy5mb3JFYWNoKChjb250ZXh0KSA9PiB2Q29udGV4dHMucHVzaChjb250ZXh0KSk7XG5cdH1cblxuXHQvLyBpdGVtcyBsb2NrZWQgbXNnXG5cdGlmIChsb2NrZWRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0bG9ja2VkQ29udGV4dHNUeHQgPSBkZWxldGVIZWxwZXIuZ2V0TG9ja2VkT2JqZWN0c1RleHQocmVzb3VyY2VNb2RlbCwgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLCBsb2NrZWRDb250ZXh0cykgfHwgXCJcIjtcblx0XHRpdGVtcy5wdXNoKG5ldyBUZXh0KHsgdGV4dDogbG9ja2VkQ29udGV4dHNUeHQgfSkpO1xuXHR9XG5cblx0Ly8gbm9uIGRlbGV0YWJsZSBtc2dcblx0Y29uc3Qgbm9uRGVsZXRhYmxlRXhpc3RzID0gbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICE9IHRvdGFsRGVsZXRhYmxlIC0gZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggKyBsb2NrZWRDb250ZXh0cy5sZW5ndGg7XG5cdGNvbnN0IG5vbkRlbGV0YWJsZVRleHRDdHJsID0gbm9uRGVsZXRhYmxlRXhpc3RzICYmIGRlbGV0ZUhlbHBlci5nZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzLCB0b3RhbERlbGV0YWJsZSwgcmVzb3VyY2VNb2RlbCk7XG5cdGlmIChub25EZWxldGFibGVUZXh0Q3RybCkge1xuXHRcdGl0ZW1zLnB1c2gobm9uRGVsZXRhYmxlVGV4dEN0cmwpO1xuXHR9XG5cblx0Ly8gb3B0aW9uOiB1bnNhdmVkIGNoYW5nZXMgYnkgb3RoZXJzXG5cdGlmICh1blNhdmVkQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IHVuc2F2ZWRDaGFuZ2VzVHh0cyA9XG5cdFx0XHRkZWxldGVIZWxwZXIuZ2V0VW5zYXZlZENvbnRleHRzVGV4dChyZXNvdXJjZU1vZGVsLCBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsIHVuU2F2ZWRDb250ZXh0cywgdG90YWxEZWxldGFibGUpIHx8IHt9O1xuXHRcdGlmICh1bnNhdmVkQ2hhbmdlc1R4dHMuaW5mb1R4dCkge1xuXHRcdFx0aXRlbXMucHVzaChuZXcgVGV4dCh7IHRleHQ6IHVuc2F2ZWRDaGFuZ2VzVHh0cy5pbmZvVHh0IH0pKTtcblx0XHR9XG5cdFx0aWYgKHVuc2F2ZWRDaGFuZ2VzVHh0cy5vcHRpb25UeHQgfHwgdW5zYXZlZENoYW5nZXNUeHRzLm9wdGlvbldpdGhvdXRUeHQpIHtcblx0XHRcdG9wdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLnVuU2F2ZWRDb250ZXh0cyxcblx0XHRcdFx0Y29udGV4dHM6IHVuU2F2ZWRDb250ZXh0cyxcblx0XHRcdFx0dGV4dDogdW5zYXZlZENoYW5nZXNUeHRzLm9wdGlvblR4dCxcblx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLkNIRUNLQk9YXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBvcHRpb246IGRyYWZ0cyB3aXRoIGFjdGl2ZSBub3QgZGVsZXRhYmxlXG5cdGlmIChkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBub25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0ID1cblx0XHRcdGRlbGV0ZUhlbHBlci5nZXROb25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0KHJlc291cmNlTW9kZWwsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoLCB0b3RhbERlbGV0YWJsZSkgfHwgXCJcIjtcblx0XHRpZiAobm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSxcblx0XHRcdFx0Y29udGV4dHM6IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsXG5cdFx0XHRcdHRleHQ6IG5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiB0b3RhbERlbGV0YWJsZSA+IDAgPyBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5DSEVDS0JPWCA6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nKG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdLCBpdGVtczogQ29udHJvbFtdKSB7XG5cdGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8vIFNpbmdsZSBvcHRpb24gZG9lc24ndCBuZWVkIGNoZWNrQm94XG5cdFx0Y29uc3Qgb3B0aW9uID0gb3B0aW9uc1swXTtcblx0XHRpZiAob3B0aW9uLnRleHQpIHtcblx0XHRcdGl0ZW1zLnB1c2gobmV3IFRleHQoeyB0ZXh0OiBvcHRpb24udGV4dCB9KSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9wdGlvbnMubGVuZ3RoID4gMSkge1xuXHRcdC8vIE11bHRpcGxlIE9wdGlvbnNcblxuXHRcdC8vIFRleHRzXG5cdFx0b3B0aW9ucy5mb3JFYWNoKChvcHRpb246IERlbGV0ZU9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbi5jb250cm9sID09PSBcInRleHRcIiAmJiBvcHRpb24udGV4dCkge1xuXHRcdFx0XHRpdGVtcy5wdXNoKG5ldyBUZXh0KHsgdGV4dDogb3B0aW9uLnRleHQgfSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8vIENoZWNrQm94c1xuXHRcdG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uOiBEZWxldGVPcHRpb24pID0+IHtcblx0XHRcdGlmIChvcHRpb24uY29udHJvbCA9PT0gXCJjaGVja0JveFwiICYmIG9wdGlvbi50ZXh0KSB7XG5cdFx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdFx0bmV3IENoZWNrQm94KHtcblx0XHRcdFx0XHRcdHRleHQ6IG9wdGlvbi50ZXh0LFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRzZWxlY3Q6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNoZWNrQm94ID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENoZWNrQm94O1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzZWxlY3RlZCA9IGNoZWNrQm94LmdldFNlbGVjdGVkKCk7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbi5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlT3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKFxuXHRtUGFyYW1ldGVyczogRGVsZXRlUGFyYW1ldGVycyxcblx0ZGlyZWN0RGVsZXRhYmxlQ29udGV4dHM6IENvbnRleHRbXSxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0b3B0aW9uczogRGVsZXRlT3B0aW9uW11cbikge1xuXHRjb25zdCB7XG5cdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLFxuXHRcdGVudGl0eVNldE5hbWUsXG5cdFx0cGFyZW50Q29udHJvbCxcblx0XHRkZXNjcmlwdGlvbixcblx0XHRsb2NrZWRDb250ZXh0cyxcblx0XHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLFxuXHRcdHVuU2F2ZWRDb250ZXh0c1xuXHR9ID0gbVBhcmFtZXRlcnM7XG5cdGNvbnN0IHRvdGFsRGVsZXRhYmxlID0gZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoICsgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggKyB1blNhdmVkQ29udGV4dHMubGVuZ3RoO1xuXHRjb25zdCBub25EZWxldGFibGVDb250ZXh0cyA9IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyAtIChsb2NrZWRDb250ZXh0cy5sZW5ndGggKyB0b3RhbERlbGV0YWJsZSAtIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoKTtcblxuXHRpZiAobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSAxICYmIG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly8gc2luZ2xlIGRlbGV0YWJsZSBjb250ZXh0XG5cdFx0Y29uc3Qgb0xpbmVDb250ZXh0RGF0YSA9IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzWzBdLmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IG9UYWJsZSA9IHBhcmVudENvbnRyb2wgYXMgVGFibGU7XG5cdFx0Y29uc3Qgc0tleSA9IG9UYWJsZSAmJiAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0bGV0IHR4dDtcblx0XHRsZXQgYVBhcmFtcyA9IFtdO1xuXHRcdGlmIChzS2V5KSB7XG5cdFx0XHRjb25zdCBzS2V5VmFsdWUgPSBzS2V5ID8gb0xpbmVDb250ZXh0RGF0YVtzS2V5XSA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IHNEZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uICYmIGRlc2NyaXB0aW9uLnBhdGggPyBvTGluZUNvbnRleHREYXRhW2Rlc2NyaXB0aW9uLnBhdGhdIDogdW5kZWZpbmVkO1xuXHRcdFx0aWYgKHNLZXlWYWx1ZSkge1xuXHRcdFx0XHRpZiAoc0Rlc2NyaXB0aW9uICYmIGRlc2NyaXB0aW9uICYmIHNLZXkgIT09IGRlc2NyaXB0aW9uLnBhdGgpIHtcblx0XHRcdFx0XHRhUGFyYW1zID0gW3NLZXlWYWx1ZSArIFwiIFwiLCBzRGVzY3JpcHRpb25dO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFQYXJhbXMgPSBbc0tleVZhbHVlLCBcIlwiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0eHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9cIiwgYVBhcmFtcywgZW50aXR5U2V0TmFtZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0eHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSXCIsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIiwgdW5kZWZpbmVkLCBlbnRpdHlTZXROYW1lKTtcblx0XHR9XG5cdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0Y29udGV4dHM6IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0dGV4dDogdHh0LFxuXHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRjb250cm9sOiBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5URVhUXG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoXG5cdFx0dW5TYXZlZENvbnRleHRzLmxlbmd0aCAhPT0gdG90YWxEZWxldGFibGUgJiZcblx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPiAwICYmXG5cdFx0KGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLmxlbmd0aCA+IDAgfHwgKHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPiAwICYmIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoID4gMCkpXG5cdCkge1xuXHRcdGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPiBkaXJlY3REZWxldGFibGVDb250ZXh0cy5sZW5ndGggJiYgbm9uRGVsZXRhYmxlQ29udGV4dHMgKyBsb2NrZWRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHQvLyBvdGhlciB0eXBlcyBleGlzdHMgd2l0aCBwdXJlIGRlbGV0YWJsZSBvbmVzXG5cdFx0XHRsZXQgZGVsZXRhYmxlT3B0aW9uVHh0ID0gXCJcIjtcblx0XHRcdGlmICh0b3RhbERlbGV0YWJsZSA9PT0gMSkge1xuXHRcdFx0XHRkZWxldGFibGVPcHRpb25UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSX05PTl9ERUxFVEFCTEVcIixcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGVsZXRhYmxlT3B0aW9uVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9QTFVSQUxfTk9OX0RFTEVUQUJMRVwiLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRlbnRpdHlTZXROYW1lXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRvcHRpb25zLnVuc2hpZnQoe1xuXHRcdFx0XHR0eXBlOiBEZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cyxcblx0XHRcdFx0Y29udGV4dHM6IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0XHR0ZXh0OiBkZWxldGFibGVPcHRpb25UeHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5URVhUXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb25seSBkZWxldGFibGVcblx0XHRcdGNvbnN0IGFsbERlbGV0YWJsZVR4dCA9XG5cdFx0XHRcdHRvdGFsRGVsZXRhYmxlID09PSAxXG5cdFx0XHRcdFx0PyByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSXCIsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSlcblx0XHRcdFx0XHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfUExVUkFMXCIsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSk7XG5cdFx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBEZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cyxcblx0XHRcdFx0Y29udGV4dHM6IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0XHR0ZXh0OiBhbGxEZWxldGFibGVUeHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5URVhUXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ29uZmlybUhhbmRsZXIoXG5cdG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdLFxuXHRtUGFyYW1ldGVyczogRGVsZXRlUGFyYW1ldGVycyxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0ZHJhZnRFbmFibGVkOiBib29sZWFuXG4pIHtcblx0dHJ5IHtcblx0XHRjb25zdCBjb250ZXh0cyA9IGRlbGV0ZUhlbHBlci5nZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0KFtdLCBvcHRpb25zKTtcblx0XHRjb25zdCBkcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZSA9IGdldERyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlKG9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgeyBiZWZvcmVEZWxldGVDYWxsQmFjaywgcGFyZW50Q29udHJvbCB9ID0gbVBhcmFtZXRlcnM7XG5cdFx0aWYgKGJlZm9yZURlbGV0ZUNhbGxCYWNrKSB7XG5cdFx0XHRhd2FpdCBiZWZvcmVEZWxldGVDYWxsQmFjayh7IGNvbnRleHRzOiBjb250ZXh0cyB9KTtcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dHMgJiYgY29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBlbmFibGVTdHJpY3RIYW5kbGluZyA9IGNvbnRleHRzLmxlbmd0aCA9PT0gMSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0Y29uc3QgZHJhZnRFcnJvcnM6IHVua25vd25bXSA9IFtdO1xuXHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoXG5cdFx0XHRcdFx0ZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUubWFwKGZ1bmN0aW9uIChjb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZHJhZnQuZGVsZXRlRHJhZnQoY29udGV4dCwgYXBwQ29tcG9uZW50LCBlbmFibGVTdHJpY3RIYW5kbGluZyk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlOiB1bmtub3duKSB7XG5cdFx0XHRcdFx0XHRcdExvZy5lcnJvcihgRkUgOiBjb3JlIDogRGVsZXRlSGVscGVyIDogRXJyb3Igd2hpbGUgZGlzY3JkaW5nIGRyYWZ0IHdpdGggcGF0aCA6ICR7Y29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdFx0XHRcdGRyYWZ0RXJyb3JzLnB1c2goZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRjb250ZXh0cy5tYXAoZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRcdFx0XHRcdGlmIChkcmFmdEVuYWJsZWQgJiYgIWNvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSkge1xuXHRcdFx0XHRcdFx0XHQvL2RlbGV0ZSB0aGUgZHJhZnRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRyYWZ0LmRlbGV0ZURyYWZ0KGNvbnRleHQsIGFwcENvbXBvbmVudCwgZW5hYmxlU3RyaWN0SGFuZGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQuZGVsZXRlKCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdFx0ZGVsZXRlSGVscGVyLmFmdGVyRGVsZXRlUHJvY2VzcyhtUGFyYW1ldGVycywgb3B0aW9ucywgY29udGV4dHMsIHJlc291cmNlTW9kZWwpO1xuXHRcdFx0XHRpZiAoZHJhZnRFcnJvcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHRocm93IEVycm9yKGBGRSA6IGNvcmUgOiBEZWxldGVIZWxwZXIgOiBFcnJvcnMgb24gZHJhZnQgZGVsZXRlIDogJHtkcmFmdEVycm9yc31gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coeyBjb250cm9sOiBwYXJlbnRDb250cm9sIH0pO1xuXHRcdFx0XHQvLyByZS10aHJvdyBlcnJvciB0byBlbmZvcmNlIHJlamVjdGluZyB0aGUgZ2VuZXJhbCBwcm9taXNlXG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0Ly8gcmUtdGhyb3cgZXJyb3IgdG8gZW5mb3JjZSByZWplY3RpbmcgdGhlIGdlbmVyYWwgcHJvbWlzZVxuXHRcdHRocm93IG9FcnJvcjtcblx0fVxufVxuXG4vLyBUYWJsZSBSdW50aW1lIEhlbHBlcnM6XG5cbi8qIHJlZnJlc2hlcyBkYXRhIGluIGludGVybmFsIG1vZGVsIHJlbGV2YW50IGZvciBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b24gYWNjb3JkaW5nIHRvIHNlbGVjdGVkIGNvbnRleHRzXG5yZWxldmFudCBkYXRhIGFyZTogZGVsZXRhYmxlQ29udGV4dHMsIGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsIGNyZWF0ZU1vZGVDb250ZXh0cywgdW5TYXZlZENvbnRleHRzLCBkZWxldGVFbmFibGVkXG5ub3QgcmVsZXZhbnQ6IGxvY2tlZENvbnRleHRzXG4qL1xuYXN5bmMgZnVuY3Rpb24gdXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMoaW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBzZWxlY3RlZENvbnRleHRzOiBDb250ZXh0W10pIHtcblx0dHlwZSBjb250ZXh0SW5mbyA9IHtcblx0XHRjb250ZXh0OiBDb250ZXh0O1xuXHRcdHNpYmxpbmdQcm9taXNlOiBQcm9taXNlPFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZCB8IHZvaWQ+O1xuXHRcdHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0aXNEcmFmdFJvb3Q6IGJvb2xlYW47XG5cdFx0aXNEcmFmdE5vZGU6IGJvb2xlYW47XG5cdFx0aXNBY3RpdmU6IGJvb2xlYW47XG5cdFx0aGFzQWN0aXZlOiBib29sZWFuO1xuXHRcdGhhc0RyYWZ0OiBib29sZWFuO1xuXHRcdGxvY2tlZDogYm9vbGVhbjtcblx0XHRkZWxldGFibGU6IGJvb2xlYW47XG5cdFx0c2libGluZ0RlbGV0YWJsZTogYm9vbGVhbjtcblx0fTtcblx0Y29uc3QgY29udGV4dEluZm9zID0gc2VsZWN0ZWRDb250ZXh0cy5tYXAoKGNvbnRleHQpID0+IHtcblx0XHQvLyBhc3N1bWluZyBtZXRhQ29udGV4dCBpcyB0aGUgc2FtZSBmb3IgYWxsIGNvbnRleHRzLCBzdGlsbCBub3QgcmVseWluZyBvbiB0aGlzIGFzc3VtcHRpb25cblx0XHRjb25zdCBtZXRhQ29udGV4dCA9IGNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRNZXRhQ29udGV4dChjb250ZXh0LmdldENhbm9uaWNhbFBhdGgoKSk7XG5cdFx0Y29uc3QgZGVsZXRhYmxlUGF0aCA9IG1ldGFDb250ZXh0LmdldFByb3BlcnR5KFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVsZXRlUmVzdHJpY3Rpb25zL0RlbGV0YWJsZS8kUGF0aFwiKTtcblx0XHRjb25zdCBzdGF0aWNEZWxldGFibGUgPVxuXHRcdFx0IWRlbGV0YWJsZVBhdGggJiYgbWV0YUNvbnRleHQuZ2V0UHJvcGVydHkoXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnMvRGVsZXRhYmxlXCIpICE9PSBmYWxzZTtcblx0XHQvLyBkZWZhdWx0IHZhbHVlcyBhY2NvcmRpbmcgdG8gbm9uLWRyYWZ0IGNhc2UgKHN0aWNreSBiZWhhdmVzIHRoZSBzYW1lIGFzIG5vbi1kcmFmdCBmcm9tIFVJIHBvaW50IG9mIHZpZXcgcmVnYXJkaW5nIGRlbGV0aW9uKVxuXHRcdGNvbnN0IGluZm86IGNvbnRleHRJbmZvID0ge1xuXHRcdFx0Y29udGV4dDogY29udGV4dCxcblx0XHRcdGlzRHJhZnRSb290OiAhIW1ldGFDb250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIiksXG5cdFx0XHRpc0RyYWZ0Tm9kZTogISFtZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnROb2RlXCIpLFxuXHRcdFx0aXNBY3RpdmU6IHRydWUsXG5cdFx0XHRoYXNBY3RpdmU6IGZhbHNlLFxuXHRcdFx0aGFzRHJhZnQ6IGZhbHNlLFxuXHRcdFx0bG9ja2VkOiBmYWxzZSxcblx0XHRcdGRlbGV0YWJsZTogZGVsZXRhYmxlUGF0aCA/IGNvbnRleHQuZ2V0UHJvcGVydHkoZGVsZXRhYmxlUGF0aCkgOiBzdGF0aWNEZWxldGFibGUsXG5cdFx0XHRzaWJsaW5nUHJvbWlzZTogUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCksXG5cdFx0XHRzaWJsaW5nSW5mbzogdW5kZWZpbmVkLFxuXHRcdFx0c2libGluZ0RlbGV0YWJsZTogZmFsc2Vcblx0XHR9O1xuXG5cdFx0aWYgKGluZm8uaXNEcmFmdFJvb3QpIHtcblx0XHRcdGluZm8ubG9ja2VkID0gISFjb250ZXh0LmdldE9iamVjdChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCIpPy5JblByb2Nlc3NCeVVzZXI7XG5cdFx0XHRpbmZvLmhhc0RyYWZ0ID0gY29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0RyYWZ0RW50aXR5XCIpO1xuXHRcdH1cblx0XHRpZiAoaW5mby5pc0RyYWZ0Um9vdCkge1xuXHRcdFx0aW5mby5pc0FjdGl2ZSA9IGNvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKTtcblx0XHRcdGluZm8uaGFzQWN0aXZlID0gY29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKTtcblx0XHRcdGlmICghaW5mby5pc0FjdGl2ZSAmJiBpbmZvLmhhc0FjdGl2ZSkge1xuXHRcdFx0XHQvLyBnZXQgc2libGluZyBjb250ZXh0cyAob25seSByZWxldmFudCBmb3IgZHJhZnQgcm9vdCwgbm90IGZvciBub2Rlcylcblx0XHRcdFx0Ly8gZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiBleHBlY3RzIGRyYWZ0IHJvb3QgYXMgZmlyc3QgcGFyYW1ldGVyIC0gaWYgd2UgYXJlIG9uIGEgc3Vibm9kZSwgdGhpcyBpcyBub3QgZ2l2ZW5cblx0XHRcdFx0Ly8gLSBkb25lIHdyb25nIGFsc28gYWJvdmUsIGJ1dCBzZWVtcyBub3QgdG8gYnJlYWsgYW55dGhpbmdcblx0XHRcdFx0Ly8gLSB3aHkgaXMgZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiBub3QgYWJsZSB0byBjYWxjdWxhdGUgZHJhZnQgcm9vdCBvbiBpdHMgb3duPyFcblx0XHRcdFx0Ly8gLSBhbmQgd2h5IGlzIGl0IG5vdCBhYmxlIHRvIGRlYWwgd2l0aCBjb250ZXh0cyBub3QgZHJhZnQgZW5hYmxlZCAob2YgY291cnNlIHRoZXkgbmV2ZXIgaGF2ZSBhIHNpYmxpbmcgLSBjb3VsZCBqdXN0IHJldHVybiB1bmRlZmluZWQpXG5cdFx0XHRcdGluZm8uc2libGluZ1Byb21pc2UgPSBkcmFmdC5jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKGNvbnRleHQsIGNvbnRleHQpLnRoZW4oYXN5bmMgKHNpYmxpbmdJbmZvcm1hdGlvbikgPT4ge1xuXHRcdFx0XHRcdC8vIEZvciBkcmFmdFdpdGhEZWxldGFibGVBY3RpdmUgYnVja2V0LCBjdXJyZW50bHkgYWxzbyBzaWJsaW5nSW5mb3JtYXRpb24gaXMgcHV0IGludG8gaW50ZXJuYWxNb2RlbCBhbmQgdXNlZFxuXHRcdFx0XHRcdC8vIGZyb20gdGhlcmUgaW4gY2FzZSBvZiBkZWxldGlvbi4gVGhlcmVmb3JlLCBzaWJsaW5nIG5lZWRzIHRvIGJlIHJldHJpZXZlZCBpbiBjYXNlIG9mIHN0YXRpY0RlbGV0YWJsZS5cblx0XHRcdFx0XHQvLyBQb3NzaWJsZSBpbXByb3ZlbWVudDogT25seSByZWFkIHNpYmxpbmdJbmZvIGhlcmUgaWYgbmVlZGVkIGZvciBkZXRlcm1pbmF0aW9uIG9mIGRlbGV0ZSBidXR0b24gZW5hYmxlbWVudCxcblx0XHRcdFx0XHQvLyBpbiBvdGhlciBjYXNlcywgcmVhZCBpdCBvbmx5IGlmIGRlbGV0aW9uIHJlYWxseSBoYXBwZW5zLlxuXHRcdFx0XHRcdGluZm8uc2libGluZ0luZm8gPSBzaWJsaW5nSW5mb3JtYXRpb247XG5cdFx0XHRcdFx0aWYgKGRlbGV0YWJsZVBhdGgpIHtcblx0XHRcdFx0XHRcdGluZm8uc2libGluZ0RlbGV0YWJsZSA9IGF3YWl0IHNpYmxpbmdJbmZvcm1hdGlvbj8udGFyZ2V0Q29udGV4dD8ucmVxdWVzdFByb3BlcnR5KGRlbGV0YWJsZVBhdGgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpbmZvLnNpYmxpbmdEZWxldGFibGUgPSBzdGF0aWNEZWxldGFibGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZm87XG5cdH0pO1xuXHQvLyB3YWl0IGZvciBhbGwgc2libGluZ1Byb21pc2VzLiBJZiBubyBzaWJsaW5nIGV4aXN0cywgcHJvbWlzZSBpcyByZXNvbHZlZCB0byB1bmRlZmluZWQgKGJ1dCBpdCdzIHN0aWxsIGEgcHJvbWlzZSlcblx0YXdhaXQgUHJvbWlzZS5hbGwoY29udGV4dEluZm9zLm1hcCgoaW5mbykgPT4gaW5mby5zaWJsaW5nUHJvbWlzZSkpO1xuXG5cdGNvbnN0IGJ1Y2tldHMgPSBbXG5cdFx0e1xuXHRcdFx0a2V5OiBcImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmVcIixcblx0XHRcdC8vIG9ubHkgZm9yIGRyYWZ0IHJvb3Q6IEluIHRoYXQgY2FzZSwgdGhlIGRlbGV0ZSByZXF1ZXN0IG5lZWRzIHRvIGJlIHNlbnQgZm9yIHRoZSBhY3RpdmUgKGkuZS4gdGhlIHNpYmxpbmcpLFxuXHRcdFx0Ly8gd2hpbGUgaW4gZHJhZnQgbm9kZSwgdGhlIGRlbGV0ZSByZXF1ZXN0IG5lZWRzIHRvIGJlIHNlbmQgZm9yIHRoZSBkcmFmdCBpdHNlbGZcblx0XHRcdHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKChpbmZvKSA9PiBpbmZvLmlzRHJhZnRSb290ICYmICFpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzQWN0aXZlICYmIGluZm8uc2libGluZ0RlbGV0YWJsZSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogXCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlXCIsXG5cdFx0XHQvLyBvbmx5IGZvciBkcmFmdCByb290OiBGb3IgZHJhZnQgbm9kZSwgd2Ugb25seSByZWx5IG9uIGluZm9ybWF0aW9uIGluIHRoZSBkcmFmdCBpdHNlbGYgKG5vdCBpdHMgYWN0aXZlIHNpYmxpbmcpXG5cdFx0XHQvLyBhcHBsaWNhdGlvbiBoYXMgdG8gdGFrZSBjYXJlIHRvIHNldCB0aGlzIGNvcnJlY3RseSAoaW4gY2FzZSBhY3RpdmUgc2libGluZyBtdXN0IG5vdCBiZSBkZWxldGFibGUsIGFjdGl2YXRpb25cblx0XHRcdC8vIG9mIGRyYWZ0IHdpdGggZGVsZXRlZCBub2RlIHdvdWxkIGFsc28gZGVsdGUgYWN0aXZlIHNpYmxpbmcgPT4gZGVsZXRpb24gb2YgZHJhZnQgbm9kZSB0byBiZSBhdm9pZGVkKVxuXHRcdFx0dmFsdWU6IGNvbnRleHRJbmZvcy5maWx0ZXIoKGluZm8pID0+IGluZm8uaXNEcmFmdFJvb3QgJiYgIWluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNBY3RpdmUgJiYgIWluZm8uc2libGluZ0RlbGV0YWJsZSlcblx0XHR9LFxuXHRcdHsga2V5OiBcImxvY2tlZENvbnRleHRzXCIsIHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKChpbmZvKSA9PiBpbmZvLmlzRHJhZnRSb290ICYmIGluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNEcmFmdCAmJiBpbmZvLmxvY2tlZCkgfSxcblx0XHR7XG5cdFx0XHRrZXk6IFwidW5TYXZlZENvbnRleHRzXCIsXG5cdFx0XHR2YWx1ZTogY29udGV4dEluZm9zLmZpbHRlcigoaW5mbykgPT4gaW5mby5pc0RyYWZ0Um9vdCAmJiBpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzRHJhZnQgJiYgIWluZm8ubG9ja2VkKVxuXHRcdH0sXG5cdFx0Ly8gbm9uLWRyYWZ0L3N0aWNreSBhbmQgZGVsZXRhYmxlXG5cdFx0Ly8gYWN0aXZlIGRyYWZ0IHJvb3Qgd2l0aG91dCBhbnkgZHJhZnQgYW5kIGRlbGV0YWJsZVxuXHRcdC8vIGNyZWF0ZWQgZHJhZnQgcm9vdCAocmVnYXJkbGVzcyBvZiBkZWxldGFibGUpXG5cdFx0Ly8gZHJhZnQgbm9kZSBvbmx5IGFjY29yZGluZyB0byBpdHMgYW5ub3RhdGlvblxuXHRcdHtcblx0XHRcdGtleTogXCJkZWxldGFibGVDb250ZXh0c1wiLFxuXHRcdFx0dmFsdWU6IGNvbnRleHRJbmZvcy5maWx0ZXIoXG5cdFx0XHRcdChpbmZvKSA9PlxuXHRcdFx0XHRcdCghaW5mby5pc0RyYWZ0Um9vdCAmJiAhaW5mby5pc0RyYWZ0Tm9kZSAmJiBpbmZvLmRlbGV0YWJsZSkgfHxcblx0XHRcdFx0XHQoaW5mby5pc0RyYWZ0Um9vdCAmJiBpbmZvLmlzQWN0aXZlICYmICFpbmZvLmhhc0RyYWZ0ICYmIGluZm8uZGVsZXRhYmxlKSB8fFxuXHRcdFx0XHRcdChpbmZvLmlzRHJhZnRSb290ICYmICFpbmZvLmlzQWN0aXZlICYmICFpbmZvLmhhc0FjdGl2ZSkgfHxcblx0XHRcdFx0XHQoaW5mby5pc0RyYWZ0Tm9kZSAmJiBpbmZvLmRlbGV0YWJsZSlcblx0XHRcdClcblx0XHR9XG5cdF07XG5cblx0Zm9yIChjb25zdCB7IGtleSwgdmFsdWUgfSBvZiBidWNrZXRzKSB7XG5cdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXG5cdFx0XHRrZXksXG5cdFx0XHQvLyBDdXJyZW50bHksIGJ1Y2tldCBkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIGhhcyBhIGRpZmZlcmVudCBzdHJ1Y3R1cmUgKGNvbnRhaW5pbmcgYWxzbyBzaWJsaW5nIGluZm9ybWF0aW9uLCB3aGljaCBpcyB1c2VkXG5cdFx0XHQvLyBpbiBjYXNlIG9mIGRlbGV0aW9uKS4gUG9zc2libGUgaW1wcm92ZW1lbnQ6IFJlYWQgc2libGluZyBpbmZvcm1hdGlvbiBvbmx5IHdoZW4gbmVlZGVkLCBhbmQgYnVpbGQgYWxsIGJ1Y2tldHMgd2l0aCBzYW1lXG5cdFx0XHQvLyBzdHJ1Y3R1cmUuIEhvd2V2ZXIsIGluIHRoYXQgY2FzZSBzaWJsaW5nSW5mb3JtYXRpb24gbWlnaHQgbmVlZCB0byBiZSByZWFkIHR3aWNlIChpZiBhbHJlYWR5IG5lZWRlZCBmb3IgYnV0dG9uIGVuYWJsZW1lbnQpLFxuXHRcdFx0Ly8gdGh1cyBhIGJ1ZmZlciBwcm9iYWJseSB3b3VsZCBtYWtlIHNlbnNlLlxuXHRcdFx0dmFsdWUubWFwKChpbmZvKSA9PlxuXHRcdFx0XHRrZXkgPT09IFwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZVwiID8geyBkcmFmdDogaW5mby5jb250ZXh0LCBzaWJsaW5nSW5mbzogaW5mby5zaWJsaW5nSW5mbyB9IDogaW5mby5jb250ZXh0XG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBkZWxldGVIZWxwZXIgPSB7XG5cdGdldE5vbkRlbGV0YWJsZVRleHQsXG5cdGRlbGV0ZUNvbmZpcm1IYW5kbGVyLFxuXHR1cGRhdGVPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMsXG5cdHVwZGF0ZUNvbnRlbnRGb3JEZWxldGVEaWFsb2csXG5cdHVwZGF0ZURyYWZ0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzLFxuXHRnZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0LFxuXHRnZXRMb2NrZWRPYmplY3RzVGV4dCxcblx0Z2V0VW5zYXZlZENvbnRleHRzVGV4dCxcblx0Z2V0Tm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCxcblx0YWZ0ZXJEZWxldGVQcm9jZXNzLFxuXHR1cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0c1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVsZXRlSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztNQWdCWUEsaUJBQWlCO0VBQUEsV0FBakJBLGlCQUFpQjtJQUFqQkEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtJQUFqQkEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtFQUFBLEdBQWpCQSxpQkFBaUIsS0FBakJBLGlCQUFpQjtFQUFBO0VBQUEsSUFTakJDLDBCQUEwQjtFQUFBLFdBQTFCQSwwQkFBMEI7SUFBMUJBLDBCQUEwQjtJQUExQkEsMEJBQTBCO0VBQUEsR0FBMUJBLDBCQUEwQixLQUExQkEsMEJBQTBCO0VBQUE7RUEyRHRDLFNB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