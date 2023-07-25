/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/controls/FieldWrapper", "sap/fe/macros/field/FieldAPI", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageType", "sap/m/library", "sap/m/MessageBox", "sap/m/ResponsivePopover", "sap/ui/core/Core", "sap/ui/core/IconPool", "sap/ui/model/Filter", "sap/ui/unified/FileUploaderParameter", "sap/ui/util/openWindow"], function (Log, CommonUtils, CollaborationActivitySync, CollaborationCommon, draft, KeepAliveHelper, ModelHelper, ResourceModelHelper, CommonHelper, FieldWrapper, FieldAPI, IllustratedMessage, IllustratedMessageType, mobilelibrary, MessageBox, ResponsivePopover, Core, IconPool, Filter, FileUploaderParameter, openWindow) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  var Activity = CollaborationCommon.Activity;
  /**
   * Gets the binding used for collaboration notifications.
   *
   * @param field
   * @returns The binding
   */
  function getCollaborationBinding(field) {
    let binding = field.getBindingContext().getBinding();
    if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
      const oView = CommonUtils.getTargetView(field);
      binding = oView.getBindingContext().getBinding();
    }
    return binding;
  }

  /**
   * Static class used by "sap.ui.mdc.Field" during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const FieldRuntime = {
    resetChangesHandler: undefined,
    uploadPromises: undefined,
    /**
     * Triggers an internal navigation on the link pertaining to DataFieldWithNavigationPath.
     *
     * @param oSource Source of the press event
     * @param oController Instance of the controller
     * @param sNavPath The navigation path
     */
    onDataFieldWithNavigationPath: function (oSource, oController, sNavPath) {
      if (oController._routing) {
        let oBindingContext = oSource.getBindingContext();
        const oView = CommonUtils.getTargetView(oSource),
          oMetaModel = oBindingContext.getModel().getMetaModel(),
          fnNavigate = function (oContext) {
            if (oContext) {
              oBindingContext = oContext;
            }
            oController._routing.navigateToTarget(oBindingContext, sNavPath, true);
          };
        // Show draft loss confirmation dialog in case of Object page
        if (oView.getViewData().converterType === "ObjectPage" && !ModelHelper.isStickySessionSupported(oMetaModel)) {
          draft.processDataLossOrDraftDiscardConfirmation(fnNavigate, Function.prototype, oBindingContext, oView.getController(), true, draft.NavigationType.ForwardNavigation);
        } else {
          fnNavigate();
        }
      } else {
        Log.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.", "sap.fe.macros.field.FieldRuntime", "onDataFieldWithNavigationPath");
      }
    },
    isDraftIndicatorVisible: function (sPropertyPath, sSemanticKeyHasDraftIndicator, HasDraftEntity, IsActiveEntity, hideDraftInfo) {
      if (IsActiveEntity !== undefined && HasDraftEntity !== undefined && (!IsActiveEntity || HasDraftEntity) && !hideDraftInfo) {
        return sPropertyPath === sSemanticKeyHasDraftIndicator;
      } else {
        return false;
      }
    },
    /**
     * Handler for the validateFieldGroup event.
     *
     * @function
     * @name onValidateFieldGroup
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the validateFieldGroup event
     */
    onValidateFieldGroup: function (oController, oEvent) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._sideEffects.handleFieldGroupChange(oEvent);
    },
    /**
     * Handler for the change event.
     * Store field group IDs of this field for requesting side effects when required.
     * We store them here to ensure a change in the value of the field has taken place.
     *
     * @function
     * @name handleChange
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the change event
     */
    handleChange: function (oController, oEvent) {
      const oSourceField = oEvent.getSource(),
        bIsTransient = oSourceField && oSourceField.getBindingContext().isTransient(),
        pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
        oSource = oEvent.getSource(),
        bValid = oEvent.getParameter("valid"),
        fieldValidity = this.getFieldStateOnChange(oEvent).state["validity"];

      // TODO: currently we have undefined and true... and our creation row implementation relies on this.
      // I would move this logic to this place as it's hard to understand for field consumer

      pValueResolved.then(function () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: bValid
        };
        FieldAPI.handleChange(oEvent, oController);
      }).catch(function /*oError: any*/
      () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: false
        };

        // as the UI might need to react on. We could provide a parameter to inform if validation
        // was successful?
        FieldAPI.handleChange(oEvent, oController);
      });

      // Use the FE Controller instead of the extensionAPI to access internal FE controllers
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController.editFlow.syncTask(pValueResolved);

      // if the context is transient, it means the request would fail anyway as the record does not exist in reality
      // TODO: should the request be made in future if the context is transient?
      if (bIsTransient) {
        return;
      }

      // SIDE EFFECTS
      oFEController._sideEffects.handleFieldChange(oEvent, fieldValidity, pValueResolved);

      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled && fieldValidity) {
        var _ref, _oField$getBindingInf;
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const binding = getCollaborationBinding(oField);
        const data = [...(((_ref = oField.getBindingInfo("value") || oField.getBindingInfo("selected")) === null || _ref === void 0 ? void 0 : _ref.parts) || []), ...(((_oField$getBindingInf = oField.getBindingInfo("additionalValue")) === null || _oField$getBindingInf === void 0 ? void 0 : _oField$getBindingInf.parts) || [])].map(function (part) {
          if (part) {
            var _oField$getBindingCon;
            return `${(_oField$getBindingCon = oField.getBindingContext()) === null || _oField$getBindingCon === void 0 ? void 0 : _oField$getBindingCon.getPath()}/${part.path}`;
          }
        });
        const updateCollaboration = () => {
          if (binding.hasPendingChanges()) {
            // The value has been changed by the user --> wait until it's sent to the server before sending a notification to other users
            binding.attachEventOnce("patchCompleted", function () {
              CollaborationActivitySync.send(oField, Activity.Change, data);
            });
          } else {
            // No changes --> send a Undo notification
            CollaborationActivitySync.send(oField, Activity.Undo, data);
          }
        };
        if (oSourceField.isA("sap.ui.mdc.Field")) {
          pValueResolved.then(() => {
            updateCollaboration();
          }).catch(() => {
            updateCollaboration();
          });
        } else {
          updateCollaboration();
        }
      }
    },
    handleLiveChange: function (event) {
      // Collaboration Draft Activity Sync
      const field = event.getSource();
      if (CollaborationActivitySync.isConnected(field)) {
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const bindingPath = field.getBindingInfo("value").parts[0].path;
        const fullPath = `${field.getBindingContext().getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(field, Activity.LiveChange, fullPath);

        // If the user reverted the change no change event is sent therefore we have to handle it here
        if (!this.resetChangesHandler) {
          this.resetChangesHandler = () => {
            // We need to wait a little bit for the focus to be updated
            setTimeout(() => {
              if (field.isA("sap.ui.mdc.Field")) {
                const focusedControl = Core.byId(Core.getCurrentFocusedControlId());
                if ((focusedControl === null || focusedControl === void 0 ? void 0 : focusedControl.getParent()) === field) {
                  // We're still un the same MDC Field --> do nothing
                  return;
                }
              }
              field.detachBrowserEvent("focusout", this.resetChangesHandler);
              delete this.resetChangesHandler;
              CollaborationActivitySync.send(field, Activity.Undo, fullPath);
            }, 100);
          };
          field.attachBrowserEvent("focusout", this.resetChangesHandler);
        }
      }
    },
    handleOpenPicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const sBindingPath = oField.getBindingInfo("value").parts[0].path;
        const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
      }
    },
    handleClosePicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const binding = getCollaborationBinding(oField);
        if (!binding.hasPendingChanges()) {
          // If there are no pending changes, the picker was closed without changing the value --> send a UNDO notification
          // In case there were changes, notifications are managed in handleChange
          const sBindingPath = oField.getBindingInfo("value").parts[0].path;
          const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
          CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
        }
      }
    },
    _sendCollaborationMessageForFileUploader(fileUploader, activity) {
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (isCollaborationEnabled) {
        var _fileUploader$getPare, _fileUploader$getBind;
        const bindingPath = (_fileUploader$getPare = fileUploader.getParent()) === null || _fileUploader$getPare === void 0 ? void 0 : _fileUploader$getPare.getProperty("propertyPath");
        const fullPath = `${(_fileUploader$getBind = fileUploader.getBindingContext()) === null || _fileUploader$getBind === void 0 ? void 0 : _fileUploader$getBind.getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(fileUploader, activity, fullPath);
      }
    },
    handleOpenUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.LiveChange);
    },
    handleCloseUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.Undo);
    },
    /**
     * Gets the field value and validity on a change event.
     *
     * @function
     * @name fieldValidityOnChange
     * @param oEvent The event object passed by the change event
     * @returns Field value and validity
     */
    getFieldStateOnChange: function (oEvent) {
      let oSourceField = oEvent.getSource(),
        mFieldState = {};
      const _isBindingStateMessages = function (oBinding) {
        return oBinding && oBinding.getDataState() ? oBinding.getDataState().getInvalidValue() === undefined : true;
      };
      if (oSourceField.isA("sap.fe.macros.field.FieldAPI")) {
        oSourceField = oSourceField.getContent();
      }
      if (oSourceField.isA(FieldWrapper.getMetadata().getName()) && oSourceField.getEditMode() === "Editable") {
        oSourceField = oSourceField.getContentEdit()[0];
      }
      if (oSourceField.isA("sap.ui.mdc.Field")) {
        let bIsValid = oEvent.getParameter("valid") || oEvent.getParameter("isValid");
        if (bIsValid === undefined) {
          if (oSourceField.getMaxConditions() === 1) {
            const oValueBindingInfo = oSourceField.getBindingInfo("value");
            bIsValid = _isBindingStateMessages(oValueBindingInfo && oValueBindingInfo.binding);
          }
          if (oSourceField.getValue() === "" && !oSourceField.getProperty("required")) {
            bIsValid = true;
          }
        }
        mFieldState = {
          fieldValue: oSourceField.getValue(),
          validity: !!bIsValid
        };
      } else {
        // oSourceField extends from a FileUploader || Input || is a CheckBox
        const oBinding = oSourceField.getBinding("uploadUrl") || oSourceField.getBinding("value") || oSourceField.getBinding("selected");
        mFieldState = {
          fieldValue: oBinding && oBinding.getValue(),
          validity: _isBindingStateMessages(oBinding)
        };
      }
      return {
        field: oSourceField,
        state: mFieldState
      };
    },
    _fnFixHashQueryString: function (sCurrentHash) {
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      return sCurrentHash;
    },
    _fnGetLinkInformation: function (_oSource, _oLink, _sPropertyPath, _sValue, fnSetActive) {
      const oModel = _oLink && _oLink.getModel();
      const oMetaModel = oModel && oModel.getMetaModel();
      const sSemanticObjectName = _sValue || _oSource && _oSource.getValue();
      const oView = _oLink && CommonUtils.getTargetView(_oLink);
      const oInternalModelContext = oView && oView.getBindingContext("internal");
      const oAppComponent = oView && CommonUtils.getAppComponent(oView);
      const oShellServiceHelper = oAppComponent && oAppComponent.getShellServices();
      const pGetLinksPromise = oShellServiceHelper && oShellServiceHelper.getLinksWithCache([[{
        semanticObject: sSemanticObjectName
      }]]);
      const aSemanticObjectUnavailableActions = oMetaModel && oMetaModel.getObject(`${_sPropertyPath}@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions`);
      return {
        SemanticObjectName: sSemanticObjectName,
        SemanticObjectFullPath: _sPropertyPath,
        //sSemanticObjectFullPath,
        MetaModel: oMetaModel,
        InternalModelContext: oInternalModelContext,
        ShellServiceHelper: oShellServiceHelper,
        GetLinksPromise: pGetLinksPromise,
        SemanticObjectUnavailableActions: aSemanticObjectUnavailableActions,
        fnSetActive: fnSetActive
      };
    },
    _fnQuickViewHasNewCondition: function (oSemanticObjectPayload, _oLinkInfo) {
      if (oSemanticObjectPayload && oSemanticObjectPayload.path && oSemanticObjectPayload.path === _oLinkInfo.SemanticObjectFullPath) {
        // Got the resolved Semantic Object!
        const bResultingNewConditionForConditionalWrapper = oSemanticObjectPayload[!_oLinkInfo.SemanticObjectUnavailableActions ? "HasTargetsNotFiltered" : "HasTargets"];
        _oLinkInfo.fnSetActive(!!bResultingNewConditionForConditionalWrapper);
        return true;
      } else {
        return false;
      }
    },
    _fnQuickViewSetNewConditionForConditionalWrapper: function (_oLinkInfo, _oFinalSemanticObjects) {
      if (_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]) {
        let sTmpPath, oSemanticObjectPayload;
        const aSemanticObjectPaths = Object.keys(_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]);
        for (const iPathsCount in aSemanticObjectPaths) {
          sTmpPath = aSemanticObjectPaths[iPathsCount];
          oSemanticObjectPayload = _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName] && _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName][sTmpPath];
          if (FieldRuntime._fnQuickViewHasNewCondition(oSemanticObjectPayload, _oLinkInfo)) {
            break;
          }
        }
      }
    },
    _fnUpdateSemanticObjectsTargetModel: function (oEvent, sValue, oControl, _sPropertyPath) {
      const oSource = oEvent && oEvent.getSource();
      let fnSetActive;
      if (oControl.isA("sap.m.ObjectStatus")) {
        fnSetActive = bActive => oControl.setActive(bActive);
      }
      if (oControl.isA("sap.m.ObjectIdentifier")) {
        fnSetActive = bActive => oControl.setTitleActive(bActive);
      }
      const oConditionalWrapper = oControl && oControl.getParent();
      if (oConditionalWrapper && oConditionalWrapper.isA("sap.fe.macros.controls.ConditionalWrapper")) {
        fnSetActive = bActive => oConditionalWrapper.setCondition(bActive);
      }
      if (fnSetActive !== undefined) {
        const oLinkInfo = FieldRuntime._fnGetLinkInformation(oSource, oControl, _sPropertyPath, sValue, fnSetActive);
        oLinkInfo.fnSetActive = fnSetActive;
        const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getAppComponent(oControl).getShellServices().getHash());
        CommonUtils.updateSemanticTargets([oLinkInfo.GetLinksPromise], [{
          semanticObject: oLinkInfo.SemanticObjectName,
          path: oLinkInfo.SemanticObjectFullPath
        }], oLinkInfo.InternalModelContext, sCurrentHash).then(function (oFinalSemanticObjects) {
          if (oFinalSemanticObjects) {
            FieldRuntime._fnQuickViewSetNewConditionForConditionalWrapper(oLinkInfo, oFinalSemanticObjects);
          }
        }).catch(function (oError) {
          Log.error("Cannot update Semantic Targets model", oError);
        });
      }
    },
    _checkControlHasModelAndBindingContext(_control) {
      if (!_control.getModel() || !_control.getBindingContext()) {
        return false;
      } else {
        return true;
      }
    },
    _checkCustomDataValueBeforeUpdatingSemanticObjectModel(_control, propertyPath, aCustomData) {
      let sSemanticObjectPathValue;
      let oValueBinding;
      const _fnCustomDataValueIsString = function (semanticObjectPathValue) {
        return !(semanticObjectPathValue !== null && typeof semanticObjectPathValue === "object");
      };
      // remove technical custom datas set by UI5
      aCustomData = aCustomData.filter(customData => customData.getKey() !== "sap-ui-custom-settings");
      for (const index in aCustomData) {
        sSemanticObjectPathValue = aCustomData[index].getValue();
        if (!sSemanticObjectPathValue && _fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          oValueBinding = aCustomData[index].getBinding("value");
          if (oValueBinding) {
            oValueBinding.attachEventOnce("change", function (_oChangeEvent) {
              FieldRuntime._fnUpdateSemanticObjectsTargetModel(_oChangeEvent, null, _control, propertyPath);
            });
          }
        } else if (_fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          FieldRuntime._fnUpdateSemanticObjectsTargetModel(null, sSemanticObjectPathValue, _control, propertyPath);
        }
      }
    },
    LinkModelContextChange: function (oEvent, sProperty, sPathToProperty) {
      const control = oEvent.getSource();
      if (FieldRuntime._checkControlHasModelAndBindingContext(control)) {
        const sPropertyPath = `${sPathToProperty}/${sProperty}`;
        const mdcLink = control.getDependents().length ? control.getDependents()[0] : undefined;
        const aCustomData = mdcLink === null || mdcLink === void 0 ? void 0 : mdcLink.getCustomData();
        if (aCustomData && aCustomData.length > 0) {
          FieldRuntime._checkCustomDataValueBeforeUpdatingSemanticObjectModel(control, sPropertyPath, aCustomData);
        }
      }
    },
    openExternalLink: function (event) {
      const source = event.getSource();
      if (source.data("url") && source.getProperty("text") !== "") {
        openWindow(source.data("url"));
      }
    },
    createPopoverWithNoTargets: function (mdcLink) {
      const mdcLinkId = mdcLink.getId();
      const illustratedMessageSettings = {
        title: getResourceModel(mdcLink).getText("M_ILLUSTRATEDMESSAGE_TITLE"),
        description: getResourceModel(mdcLink).getText("M_ILLUSTRATEDMESSAGE_DESCRIPTION"),
        enableFormattedText: true,
        illustrationSize: "Dot",
        // IllustratedMessageSize.Dot not available in "@types/openui5": "1.107.0"
        illustrationType: IllustratedMessageType.Tent
      };
      const illustratedMessage = new IllustratedMessage(`${mdcLinkId}-illustratedmessage`, illustratedMessageSettings);
      const popoverSettings = {
        horizontalScrolling: false,
        showHeader: sap.ui.Device.system.phone,
        placement: mobilelibrary.PlacementType.Auto,
        content: [illustratedMessage],
        afterClose: function (event) {
          if (event.getSource()) {
            event.getSource().destroy();
          }
        }
      };
      return new ResponsivePopover(`${mdcLinkId}-popover`, popoverSettings);
    },
    openLink: async function (mdcLink, sapmLink) {
      try {
        const hRef = await mdcLink.getTriggerHref();
        if (!hRef) {
          try {
            const linkItems = await mdcLink.retrieveLinkItems();
            if ((linkItems === null || linkItems === void 0 ? void 0 : linkItems.length) === 0 && mdcLink.getPayload().hasQuickViewFacets === "false") {
              const popover = FieldRuntime.createPopoverWithNoTargets(mdcLink);
              mdcLink.addDependent(popover);
              popover.openBy(sapmLink);
            } else {
              await mdcLink.open(sapmLink);
            }
          } catch (error) {
            Log.error(`Cannot retrieve the QuickView Popover dialog: ${error}`);
          }
        } else {
          const view = CommonUtils.getTargetView(sapmLink);
          const appComponent = CommonUtils.getAppComponent(view);
          const shellService = appComponent.getShellServices();
          const shellHash = shellService.parseShellHash(hRef);
          const navArgs = {
            target: {
              semanticObject: shellHash.semanticObject,
              action: shellHash.action
            },
            params: shellHash.params
          };
          KeepAliveHelper.storeControlRefreshStrategyForHash(view, shellHash);
          if (CommonUtils.isStickyEditMode(sapmLink) !== true) {
            //URL params and xappState has been generated earlier hence using toExternal
            shellService.toExternal(navArgs, appComponent);
          } else {
            try {
              const newHref = await shellService.hrefForExternalAsync(navArgs, appComponent);
              openWindow(newHref);
            } catch (error) {
              Log.error(`Error while retireving hrefForExternal : ${error}`);
            }
          }
        }
      } catch (error) {
        Log.error(`Error triggering link Href: ${error}`);
      }
    },
    pressLink: async function (oEvent) {
      const oSource = oEvent.getSource();
      const sapmLink = oSource.isA("sap.m.ObjectIdentifier") ? oSource.findElements(false, elem => {
        return elem.isA("sap.m.Link");
      })[0] : oSource;
      if (oSource.getDependents() && oSource.getDependents().length > 0 && sapmLink.getProperty("text") !== "") {
        const oFieldInfo = oSource.getDependents()[0];
        if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
          await FieldRuntime.openLink(oFieldInfo, sapmLink);
        }
      }
      return sapmLink;
    },
    uploadStream: function (controller, event) {
      const fileUploader = event.getSource(),
        FEController = FieldRuntime._getExtensionController(controller),
        fileWrapper = fileUploader.getParent(),
        uploadUrl = fileWrapper.getUploadUrl();
      if (uploadUrl !== "") {
        var _fileUploader$getMode, _fileUploader$getBind2;
        fileWrapper.setUIBusy(true);

        // use uploadUrl from FileWrapper which returns a canonical URL
        fileUploader.setUploadUrl(uploadUrl);
        fileUploader.removeAllHeaderParameters();
        const token = (_fileUploader$getMode = fileUploader.getModel()) === null || _fileUploader$getMode === void 0 ? void 0 : _fileUploader$getMode.getHttpHeaders()["X-CSRF-Token"];
        if (token) {
          const headerParameterCSRFToken = new FileUploaderParameter();
          headerParameterCSRFToken.setName("x-csrf-token");
          headerParameterCSRFToken.setValue(token);
          fileUploader.addHeaderParameter(headerParameterCSRFToken);
        }
        const eTag = (_fileUploader$getBind2 = fileUploader.getBindingContext()) === null || _fileUploader$getBind2 === void 0 ? void 0 : _fileUploader$getBind2.getProperty("@odata.etag");
        if (eTag) {
          const headerParameterETag = new FileUploaderParameter();
          headerParameterETag.setName("If-Match");
          // Ignore ETag in collaboration draft
          headerParameterETag.setValue(CollaborationActivitySync.isConnected(fileUploader) ? "*" : eTag);
          fileUploader.addHeaderParameter(headerParameterETag);
        }
        const headerParameterAccept = new FileUploaderParameter();
        headerParameterAccept.setName("Accept");
        headerParameterAccept.setValue("application/json");
        fileUploader.addHeaderParameter(headerParameterAccept);

        // synchronize upload with other requests
        const uploadPromise = new Promise((resolve, reject) => {
          this.uploadPromises = this.uploadPromises || {};
          this.uploadPromises[fileUploader.getId()] = {
            resolve: resolve,
            reject: reject
          };
          fileUploader.upload();
        });
        FEController.editFlow.syncTask(uploadPromise);
      } else {
        MessageBox.error(getResourceModel(controller).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"));
      }
    },
    handleUploadComplete: function (event, propertyFileName, propertyPath, controller) {
      const status = event.getParameter("status"),
        fileUploader = event.getSource(),
        fileWrapper = fileUploader.getParent();
      fileWrapper.setUIBusy(false);
      const context = fileUploader.getBindingContext();
      if (status === 0 || status >= 400) {
        this._displayMessageForFailedUpload(event);
        this.uploadPromises[fileUploader.getId()].reject();
      } else {
        const newETag = event.getParameter("headers").etag;
        if (newETag) {
          // set new etag for filename update, but without sending patch request
          context === null || context === void 0 ? void 0 : context.setProperty("@odata.etag", newETag, null);
        }

        // set filename for link text
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          context === null || context === void 0 ? void 0 : context.setProperty(propertyFileName.path, fileUploader.getValue());
        }

        // invalidate the property that not gets updated otherwise
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, null, null);
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, undefined, null);
        this._callSideEffectsForStream(event, fileWrapper, controller);
        this.uploadPromises[fileUploader.getId()].resolve();
      }
      delete this.uploadPromises[fileUploader.getId()];

      // Collaboration Draft Activity Sync
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (!isCollaborationEnabled || !context) {
        return;
      }
      const notificationData = [`${context.getPath()}/${propertyPath}`];
      if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
        notificationData.push(`${context.getPath()}/${propertyFileName.path}`);
      }
      let binding = context.getBinding();
      if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oView = CommonUtils.getTargetView(fileUploader);
        binding = oView.getBindingContext().getBinding();
      }
      if (binding.hasPendingChanges()) {
        binding.attachEventOnce("patchCompleted", () => {
          CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
        });
      } else {
        CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
      }
    },
    _displayMessageForFailedUpload: function (oEvent) {
      // handling of backend errors
      const sError = oEvent.getParameter("responseRaw") || oEvent.getParameter("response");
      let sMessageText, oError;
      try {
        oError = sError && JSON.parse(sError);
        sMessageText = oError.error && oError.error.message;
      } catch (e) {
        sMessageText = sError || getResourceModel(oEvent.getSource()).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT");
      }
      MessageBox.error(sMessageText);
    },
    removeStream: function (event, propertyFileName, propertyPath, controller) {
      const deleteButton = event.getSource();
      const fileWrapper = deleteButton.getParent();
      const context = fileWrapper.getBindingContext();

      // streams are removed by assigning the null value
      context.setProperty(propertyPath, null);
      // When setting the property to null, the uploadUrl (@@MODEL.format) is set to "" by the model
      //	with that another upload is not possible before refreshing the page
      // (refreshing the page would recreate the URL)
      //	This is the workaround:
      //	We set the property to undefined only on the frontend which will recreate the uploadUrl
      context.setProperty(propertyPath, undefined, null);
      this._callSideEffectsForStream(event, fileWrapper, controller);

      // Collaboration Draft Activity Sync
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(deleteButton);
      if (bCollaborationEnabled) {
        let binding = context.getBinding();
        if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          const oView = CommonUtils.getTargetView(deleteButton);
          binding = oView.getBindingContext().getBinding();
        }
        const data = [`${context.getPath()}/${propertyPath}`];
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          data.push(`${context.getPath()}/${propertyFileName.path}`);
        }
        CollaborationActivitySync.send(deleteButton, Activity.LiveChange, data);
        binding.attachEventOnce("patchCompleted", function () {
          CollaborationActivitySync.send(deleteButton, Activity.Change, data);
        });
      }
    },
    _callSideEffectsForStream: function (oEvent, oControl, oController) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      if (oControl && oControl.getBindingContext().isTransient()) {
        return;
      }
      if (oControl) {
        oEvent.oSource = oControl;
      }
      oFEController._sideEffects.handleFieldChange(oEvent, this.getFieldStateOnChange(oEvent).state["validity"]);
    },
    getIconForMimeType: function (sMimeType) {
      return IconPool.getIconForMimeType(sMimeType);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param sPropertyValue The property value of the datafield
     * @param sPropertyFullPath The property full path's
     * @param sDisplayFormat The display format for the datafield
     * @returns The formatted value in corresponding display format.
     */
    retrieveTextFromValueList: function (sPropertyValue, sPropertyFullPath, sDisplayFormat) {
      let sTextProperty;
      let oMetaModel;
      let sPropertyName;
      if (sPropertyValue) {
        oMetaModel = CommonHelper.getMetaModel();
        sPropertyName = oMetaModel.getObject(`${sPropertyFullPath}@sapui.name`);
        return oMetaModel.requestValueListInfo(sPropertyFullPath, true).then(function (mValueListInfo) {
          // take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
          const oValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
          const oValueListModel = oValueListInfo.$model;
          const oMetaModelValueList = oValueListModel.getMetaModel();
          const oParamWithKey = oValueListInfo.Parameters.find(function (oParameter) {
            return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
          });
          if (oParamWithKey && !oParamWithKey.ValueListProperty) {
            return Promise.reject(`Inconsistent value help annotation for ${sPropertyName}`);
          }
          const oTextAnnotation = oMetaModelValueList.getObject(`/${oValueListInfo.CollectionPath}/${oParamWithKey.ValueListProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (oTextAnnotation && oTextAnnotation.$Path) {
            sTextProperty = oTextAnnotation.$Path;
            const oFilter = new Filter({
              path: oParamWithKey.ValueListProperty,
              operator: "EQ",
              value1: sPropertyValue
            });
            const oListBinding = oValueListModel.bindList(`/${oValueListInfo.CollectionPath}`, undefined, undefined, oFilter, {
              $select: sTextProperty
            });
            return oListBinding.requestContexts(0, 2);
          } else {
            sDisplayFormat = "Value";
            return sPropertyValue;
          }
        }).then(function (aContexts) {
          var _aContexts$;
          const sDescription = sTextProperty ? (_aContexts$ = aContexts[0]) === null || _aContexts$ === void 0 ? void 0 : _aContexts$.getObject()[sTextProperty] : "";
          switch (sDisplayFormat) {
            case "Description":
              return sDescription;
            case "DescriptionValue":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sDescription, sPropertyValue]);
            case "ValueDescription":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sPropertyValue, sDescription]);
            default:
              return sPropertyValue;
          }
        }).catch(function (oError) {
          const sMsg = oError.status && oError.status === 404 ? `Metadata not found (${oError.status}) for value help of property ${sPropertyFullPath}` : oError.message;
          Log.error(sMsg);
        });
      }
      return sPropertyValue;
    },
    handleTypeMissmatch: function (oEvent) {
      const resourceModel = getResourceModel(oEvent.getSource());
      MessageBox.error(resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"), {
        details: `<p><strong>${resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED")}</strong></p>${oEvent.getParameters().mimeType}<br><br>` + `<p><strong>${resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED")}</strong></p>${oEvent.getSource().getMimeType().toString().replaceAll(",", ", ")}`,
        contentWidth: "150px"
      });
    },
    handleFileSizeExceed: function (oEvent) {
      MessageBox.error(getResourceModel(oEvent.getSource()).getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG", oEvent.getSource().getMaximumFileSize().toFixed(3)), {
        contentWidth: "150px"
      });
    },
    _getExtensionController: function (oController) {
      return oController.isA("sap.fe.core.ExtensionAPI") ? oController._controller : oController;
    }
  };

  /**
   * @global
   */
  return FieldRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb2xsYWJvcmF0aW9uQmluZGluZyIsImZpZWxkIiwiYmluZGluZyIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZyIsImlzQSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiRmllbGRSdW50aW1lIiwicmVzZXRDaGFuZ2VzSGFuZGxlciIsInVuZGVmaW5lZCIsInVwbG9hZFByb21pc2VzIiwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgiLCJvU291cmNlIiwib0NvbnRyb2xsZXIiLCJzTmF2UGF0aCIsIl9yb3V0aW5nIiwib0JpbmRpbmdDb250ZXh0Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZm5OYXZpZ2F0ZSIsIm9Db250ZXh0IiwibmF2aWdhdGVUb1RhcmdldCIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsIk1vZGVsSGVscGVyIiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZHJhZnQiLCJwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbiIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiZ2V0Q29udHJvbGxlciIsIk5hdmlnYXRpb25UeXBlIiwiRm9yd2FyZE5hdmlnYXRpb24iLCJMb2ciLCJlcnJvciIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlIiwic1Byb3BlcnR5UGF0aCIsInNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yIiwiSGFzRHJhZnRFbnRpdHkiLCJJc0FjdGl2ZUVudGl0eSIsImhpZGVEcmFmdEluZm8iLCJvblZhbGlkYXRlRmllbGRHcm91cCIsIm9FdmVudCIsIm9GRUNvbnRyb2xsZXIiLCJfZ2V0RXh0ZW5zaW9uQ29udHJvbGxlciIsIl9zaWRlRWZmZWN0cyIsImhhbmRsZUZpZWxkR3JvdXBDaGFuZ2UiLCJoYW5kbGVDaGFuZ2UiLCJvU291cmNlRmllbGQiLCJnZXRTb3VyY2UiLCJiSXNUcmFuc2llbnQiLCJpc1RyYW5zaWVudCIsInBWYWx1ZVJlc29sdmVkIiwiZ2V0UGFyYW1ldGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJiVmFsaWQiLCJmaWVsZFZhbGlkaXR5IiwiZ2V0RmllbGRTdGF0ZU9uQ2hhbmdlIiwic3RhdGUiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJ2YWxpZCIsIkZpZWxkQVBJIiwiY2F0Y2giLCJlZGl0RmxvdyIsInN5bmNUYXNrIiwiaGFuZGxlRmllbGRDaGFuZ2UiLCJvRmllbGQiLCJiQ29sbGFib3JhdGlvbkVuYWJsZWQiLCJDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jIiwiaXNDb25uZWN0ZWQiLCJkYXRhIiwiZ2V0QmluZGluZ0luZm8iLCJwYXJ0cyIsIm1hcCIsInBhcnQiLCJnZXRQYXRoIiwicGF0aCIsInVwZGF0ZUNvbGxhYm9yYXRpb24iLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImF0dGFjaEV2ZW50T25jZSIsInNlbmQiLCJBY3Rpdml0eSIsIkNoYW5nZSIsIlVuZG8iLCJoYW5kbGVMaXZlQ2hhbmdlIiwiZXZlbnQiLCJiaW5kaW5nUGF0aCIsImZ1bGxQYXRoIiwiTGl2ZUNoYW5nZSIsInNldFRpbWVvdXQiLCJmb2N1c2VkQ29udHJvbCIsIkNvcmUiLCJieUlkIiwiZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQiLCJnZXRQYXJlbnQiLCJkZXRhY2hCcm93c2VyRXZlbnQiLCJhdHRhY2hCcm93c2VyRXZlbnQiLCJoYW5kbGVPcGVuUGlja2VyIiwic0JpbmRpbmdQYXRoIiwic0Z1bGxQYXRoIiwiaGFuZGxlQ2xvc2VQaWNrZXIiLCJfc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyIiwiZmlsZVVwbG9hZGVyIiwiYWN0aXZpdHkiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwiZ2V0UHJvcGVydHkiLCJoYW5kbGVPcGVuVXBsb2FkZXIiLCJoYW5kbGVDbG9zZVVwbG9hZGVyIiwibUZpZWxkU3RhdGUiLCJfaXNCaW5kaW5nU3RhdGVNZXNzYWdlcyIsIm9CaW5kaW5nIiwiZ2V0RGF0YVN0YXRlIiwiZ2V0SW52YWxpZFZhbHVlIiwiZ2V0Q29udGVudCIsIkZpZWxkV3JhcHBlciIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEVkaXRNb2RlIiwiZ2V0Q29udGVudEVkaXQiLCJiSXNWYWxpZCIsImdldE1heENvbmRpdGlvbnMiLCJvVmFsdWVCaW5kaW5nSW5mbyIsImdldFZhbHVlIiwiZmllbGRWYWx1ZSIsInZhbGlkaXR5IiwiX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nIiwic0N1cnJlbnRIYXNoIiwiaW5kZXhPZiIsInNwbGl0IiwiX2ZuR2V0TGlua0luZm9ybWF0aW9uIiwiX29Tb3VyY2UiLCJfb0xpbmsiLCJfc1Byb3BlcnR5UGF0aCIsIl9zVmFsdWUiLCJmblNldEFjdGl2ZSIsIm9Nb2RlbCIsInNTZW1hbnRpY09iamVjdE5hbWUiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJwR2V0TGlua3NQcm9taXNlIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJzZW1hbnRpY09iamVjdCIsImFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldE9iamVjdCIsIlNlbWFudGljT2JqZWN0TmFtZSIsIlNlbWFudGljT2JqZWN0RnVsbFBhdGgiLCJNZXRhTW9kZWwiLCJJbnRlcm5hbE1vZGVsQ29udGV4dCIsIlNoZWxsU2VydmljZUhlbHBlciIsIkdldExpbmtzUHJvbWlzZSIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uIiwib1NlbWFudGljT2JqZWN0UGF5bG9hZCIsIl9vTGlua0luZm8iLCJiUmVzdWx0aW5nTmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX29GaW5hbFNlbWFudGljT2JqZWN0cyIsInNUbXBQYXRoIiwiYVNlbWFudGljT2JqZWN0UGF0aHMiLCJPYmplY3QiLCJrZXlzIiwiaVBhdGhzQ291bnQiLCJfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbCIsInNWYWx1ZSIsIm9Db250cm9sIiwiYkFjdGl2ZSIsInNldEFjdGl2ZSIsInNldFRpdGxlQWN0aXZlIiwib0NvbmRpdGlvbmFsV3JhcHBlciIsInNldENvbmRpdGlvbiIsIm9MaW5rSW5mbyIsImdldEhhc2giLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJvRXJyb3IiLCJfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dCIsIl9jb250cm9sIiwiX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsIiwicHJvcGVydHlQYXRoIiwiYUN1c3RvbURhdGEiLCJzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUiLCJvVmFsdWVCaW5kaW5nIiwiX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmciLCJzZW1hbnRpY09iamVjdFBhdGhWYWx1ZSIsImZpbHRlciIsImN1c3RvbURhdGEiLCJnZXRLZXkiLCJpbmRleCIsIl9vQ2hhbmdlRXZlbnQiLCJMaW5rTW9kZWxDb250ZXh0Q2hhbmdlIiwic1Byb3BlcnR5Iiwic1BhdGhUb1Byb3BlcnR5IiwiY29udHJvbCIsIm1kY0xpbmsiLCJnZXREZXBlbmRlbnRzIiwibGVuZ3RoIiwiZ2V0Q3VzdG9tRGF0YSIsIm9wZW5FeHRlcm5hbExpbmsiLCJzb3VyY2UiLCJvcGVuV2luZG93IiwiY3JlYXRlUG9wb3ZlcldpdGhOb1RhcmdldHMiLCJtZGNMaW5rSWQiLCJnZXRJZCIsImlsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzIiwidGl0bGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImRlc2NyaXB0aW9uIiwiZW5hYmxlRm9ybWF0dGVkVGV4dCIsImlsbHVzdHJhdGlvblNpemUiLCJpbGx1c3RyYXRpb25UeXBlIiwiSWxsdXN0cmF0ZWRNZXNzYWdlVHlwZSIsIlRlbnQiLCJpbGx1c3RyYXRlZE1lc3NhZ2UiLCJJbGx1c3RyYXRlZE1lc3NhZ2UiLCJwb3BvdmVyU2V0dGluZ3MiLCJob3Jpem9udGFsU2Nyb2xsaW5nIiwic2hvd0hlYWRlciIsInNhcCIsInVpIiwiRGV2aWNlIiwic3lzdGVtIiwicGhvbmUiLCJwbGFjZW1lbnQiLCJtb2JpbGVsaWJyYXJ5IiwiUGxhY2VtZW50VHlwZSIsIkF1dG8iLCJjb250ZW50IiwiYWZ0ZXJDbG9zZSIsImRlc3Ryb3kiLCJSZXNwb25zaXZlUG9wb3ZlciIsIm9wZW5MaW5rIiwic2FwbUxpbmsiLCJoUmVmIiwiZ2V0VHJpZ2dlckhyZWYiLCJsaW5rSXRlbXMiLCJyZXRyaWV2ZUxpbmtJdGVtcyIsImdldFBheWxvYWQiLCJoYXNRdWlja1ZpZXdGYWNldHMiLCJwb3BvdmVyIiwiYWRkRGVwZW5kZW50Iiwib3BlbkJ5Iiwib3BlbiIsInZpZXciLCJhcHBDb21wb25lbnQiLCJzaGVsbFNlcnZpY2UiLCJzaGVsbEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsIm5hdkFyZ3MiLCJ0YXJnZXQiLCJhY3Rpb24iLCJwYXJhbXMiLCJLZWVwQWxpdmVIZWxwZXIiLCJzdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoIiwiaXNTdGlja3lFZGl0TW9kZSIsInRvRXh0ZXJuYWwiLCJuZXdIcmVmIiwiaHJlZkZvckV4dGVybmFsQXN5bmMiLCJwcmVzc0xpbmsiLCJmaW5kRWxlbWVudHMiLCJlbGVtIiwib0ZpZWxkSW5mbyIsInVwbG9hZFN0cmVhbSIsImNvbnRyb2xsZXIiLCJGRUNvbnRyb2xsZXIiLCJmaWxlV3JhcHBlciIsInVwbG9hZFVybCIsImdldFVwbG9hZFVybCIsInNldFVJQnVzeSIsInNldFVwbG9hZFVybCIsInJlbW92ZUFsbEhlYWRlclBhcmFtZXRlcnMiLCJ0b2tlbiIsImdldEh0dHBIZWFkZXJzIiwiaGVhZGVyUGFyYW1ldGVyQ1NSRlRva2VuIiwiRmlsZVVwbG9hZGVyUGFyYW1ldGVyIiwic2V0TmFtZSIsInNldFZhbHVlIiwiYWRkSGVhZGVyUGFyYW1ldGVyIiwiZVRhZyIsImhlYWRlclBhcmFtZXRlckVUYWciLCJoZWFkZXJQYXJhbWV0ZXJBY2NlcHQiLCJ1cGxvYWRQcm9taXNlIiwicmVqZWN0IiwidXBsb2FkIiwiTWVzc2FnZUJveCIsImhhbmRsZVVwbG9hZENvbXBsZXRlIiwicHJvcGVydHlGaWxlTmFtZSIsInN0YXR1cyIsImNvbnRleHQiLCJfZGlzcGxheU1lc3NhZ2VGb3JGYWlsZWRVcGxvYWQiLCJuZXdFVGFnIiwiZXRhZyIsInNldFByb3BlcnR5IiwiX2NhbGxTaWRlRWZmZWN0c0ZvclN0cmVhbSIsIm5vdGlmaWNhdGlvbkRhdGEiLCJwdXNoIiwic0Vycm9yIiwic01lc3NhZ2VUZXh0IiwiSlNPTiIsInBhcnNlIiwibWVzc2FnZSIsImUiLCJyZW1vdmVTdHJlYW0iLCJkZWxldGVCdXR0b24iLCJnZXRJY29uRm9yTWltZVR5cGUiLCJzTWltZVR5cGUiLCJJY29uUG9vbCIsInJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QiLCJzUHJvcGVydHlWYWx1ZSIsInNQcm9wZXJ0eUZ1bGxQYXRoIiwic0Rpc3BsYXlGb3JtYXQiLCJzVGV4dFByb3BlcnR5Iiwic1Byb3BlcnR5TmFtZSIsIkNvbW1vbkhlbHBlciIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwibVZhbHVlTGlzdEluZm8iLCJvVmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RNb2RlbCIsIiRtb2RlbCIsIm9NZXRhTW9kZWxWYWx1ZUxpc3QiLCJvUGFyYW1XaXRoS2V5IiwiUGFyYW1ldGVycyIsImZpbmQiLCJvUGFyYW1ldGVyIiwiTG9jYWxEYXRhUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwiVmFsdWVMaXN0UHJvcGVydHkiLCJvVGV4dEFubm90YXRpb24iLCJDb2xsZWN0aW9uUGF0aCIsIiRQYXRoIiwib0ZpbHRlciIsIkZpbHRlciIsIm9wZXJhdG9yIiwidmFsdWUxIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkc2VsZWN0IiwicmVxdWVzdENvbnRleHRzIiwiYUNvbnRleHRzIiwic0Rlc2NyaXB0aW9uIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic01zZyIsImhhbmRsZVR5cGVNaXNzbWF0Y2giLCJyZXNvdXJjZU1vZGVsIiwiZGV0YWlscyIsImdldFBhcmFtZXRlcnMiLCJtaW1lVHlwZSIsImdldE1pbWVUeXBlIiwidG9TdHJpbmciLCJyZXBsYWNlQWxsIiwiY29udGVudFdpZHRoIiwiaGFuZGxlRmlsZVNpemVFeGNlZWQiLCJnZXRNYXhpbXVtRmlsZVNpemUiLCJ0b0ZpeGVkIiwiX2NvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkUnVudGltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgQWN0aXZpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IEZpZWxkV3JhcHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jb250cm9scy9GaWVsZFdyYXBwZXJcIjtcbmltcG9ydCB0eXBlIEZpbGVXcmFwcGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NvbnRyb2xzL0ZpbGVXcmFwcGVyXCI7XG5pbXBvcnQgRmllbGRBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRBUElcIjtcbmltcG9ydCB0eXBlIEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgSWxsdXN0cmF0ZWRNZXNzYWdlLCB7ICRJbGx1c3RyYXRlZE1lc3NhZ2VTZXR0aW5ncyB9IGZyb20gXCJzYXAvbS9JbGx1c3RyYXRlZE1lc3NhZ2VcIjtcbmltcG9ydCBJbGx1c3RyYXRlZE1lc3NhZ2VUeXBlIGZyb20gXCJzYXAvbS9JbGx1c3RyYXRlZE1lc3NhZ2VUeXBlXCI7XG5pbXBvcnQgbW9iaWxlbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgTGluayBmcm9tIFwic2FwL20vTGlua1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBSZXNwb25zaXZlUG9wb3ZlciwgeyAkUmVzcG9uc2l2ZVBvcG92ZXJTZXR0aW5ncyB9IGZyb20gXCJzYXAvbS9SZXNwb25zaXZlUG9wb3ZlclwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgQ3VzdG9tRGF0YSBmcm9tIFwic2FwL3VpL2NvcmUvQ3VzdG9tRGF0YVwiO1xuaW1wb3J0IEljb25Qb29sIGZyb20gXCJzYXAvdWkvY29yZS9JY29uUG9vbFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbGxlciBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgZGVmYXVsdCBhcyBNZGNMaW5rIH0gZnJvbSBcInNhcC91aS9tZGMvTGlua1wiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgRmlsZVVwbG9hZGVyIGZyb20gXCJzYXAvdWkvdW5pZmllZC9GaWxlVXBsb2FkZXJcIjtcbmltcG9ydCBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclBhcmFtZXRlclwiO1xuaW1wb3J0IG9wZW5XaW5kb3cgZnJvbSBcInNhcC91aS91dGlsL29wZW5XaW5kb3dcIjtcblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIHVzZWQgZm9yIGNvbGxhYm9yYXRpb24gbm90aWZpY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZmllbGRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nXG4gKi9cbmZ1bmN0aW9uIGdldENvbGxhYm9yYXRpb25CaW5kaW5nKGZpZWxkOiBDb250cm9sKTogT0RhdGFMaXN0QmluZGluZyB8IE9EYXRhQ29udGV4dEJpbmRpbmcge1xuXHRsZXQgYmluZGluZyA9IChmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpLmdldEJpbmRpbmcoKTtcblxuXHRpZiAoIWJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoZmllbGQpO1xuXHRcdGJpbmRpbmcgPSAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KS5nZXRCaW5kaW5nKCk7XG5cdH1cblxuXHRyZXR1cm4gYmluZGluZztcbn1cblxuLyoqXG4gKiBTdGF0aWMgY2xhc3MgdXNlZCBieSBcInNhcC51aS5tZGMuRmllbGRcIiBkdXJpbmcgcnVudGltZVxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbmNvbnN0IEZpZWxkUnVudGltZSA9IHtcblx0cmVzZXRDaGFuZ2VzSGFuZGxlcjogdW5kZWZpbmVkIGFzIGFueSxcblx0dXBsb2FkUHJvbWlzZXM6IHVuZGVmaW5lZCBhcyBhbnksXG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIGludGVybmFsIG5hdmlnYXRpb24gb24gdGhlIGxpbmsgcGVydGFpbmluZyB0byBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBvU291cmNlIFNvdXJjZSBvZiB0aGUgcHJlc3MgZXZlbnRcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIEluc3RhbmNlIG9mIHRoZSBjb250cm9sbGVyXG5cdCAqIEBwYXJhbSBzTmF2UGF0aCBUaGUgbmF2aWdhdGlvbiBwYXRoXG5cdCAqL1xuXHRvbkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDogZnVuY3Rpb24gKG9Tb3VyY2U6IENvbnRyb2wsIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc05hdlBhdGg6IHN0cmluZykge1xuXHRcdGlmIChvQ29udHJvbGxlci5fcm91dGluZykge1xuXHRcdFx0bGV0IG9CaW5kaW5nQ29udGV4dCA9IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9Tb3VyY2UpLFxuXHRcdFx0XHRvTWV0YU1vZGVsID0gb0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdGZuTmF2aWdhdGUgPSBmdW5jdGlvbiAob0NvbnRleHQ/OiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dCA9IG9Db250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvQ29udHJvbGxlci5fcm91dGluZy5uYXZpZ2F0ZVRvVGFyZ2V0KG9CaW5kaW5nQ29udGV4dCwgc05hdlBhdGgsIHRydWUpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Ly8gU2hvdyBkcmFmdCBsb3NzIGNvbmZpcm1hdGlvbiBkaWFsb2cgaW4gY2FzZSBvZiBPYmplY3QgcGFnZVxuXHRcdFx0aWYgKChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuY29udmVydGVyVHlwZSA9PT0gXCJPYmplY3RQYWdlXCIgJiYgIU1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKSkge1xuXHRcdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0XHRmbk5hdmlnYXRlLFxuXHRcdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0b1ZpZXcuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb25cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZuTmF2aWdhdGUoKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcIkZpZWxkUnVudGltZTogTm8gcm91dGluZyBsaXN0ZW5lciBjb250cm9sbGVyIGV4dGVuc2lvbiBmb3VuZC4gSW50ZXJuYWwgbmF2aWdhdGlvbiBhYm9ydGVkLlwiLFxuXHRcdFx0XHRcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRSdW50aW1lXCIsXG5cdFx0XHRcdFwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIlxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdGlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlOiBmdW5jdGlvbiAoXG5cdFx0c1Byb3BlcnR5UGF0aDogYW55LFxuXHRcdHNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yOiBhbnksXG5cdFx0SGFzRHJhZnRFbnRpdHk6IGFueSxcblx0XHRJc0FjdGl2ZUVudGl0eTogYW55LFxuXHRcdGhpZGVEcmFmdEluZm86IGFueVxuXHQpIHtcblx0XHRpZiAoSXNBY3RpdmVFbnRpdHkgIT09IHVuZGVmaW5lZCAmJiBIYXNEcmFmdEVudGl0eSAhPT0gdW5kZWZpbmVkICYmICghSXNBY3RpdmVFbnRpdHkgfHwgSGFzRHJhZnRFbnRpdHkpICYmICFoaWRlRHJhZnRJbmZvKSB7XG5cdFx0XHRyZXR1cm4gc1Byb3BlcnR5UGF0aCA9PT0gc1NlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXIgZm9yIHRoZSB2YWxpZGF0ZUZpZWxkR3JvdXAgZXZlbnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvblZhbGlkYXRlRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIGNvbnRyb2xsZXIgb2YgdGhlIHBhZ2UgY29udGFpbmluZyB0aGUgZmllbGRcblx0ICogQHBhcmFtIG9FdmVudCBUaGUgZXZlbnQgb2JqZWN0IHBhc3NlZCBieSB0aGUgdmFsaWRhdGVGaWVsZEdyb3VwIGV2ZW50XG5cdCAqL1xuXHRvblZhbGlkYXRlRmllbGRHcm91cDogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBvYmplY3QsIG9FdmVudDogb2JqZWN0KSB7XG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cdFx0b0ZFQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuaGFuZGxlRmllbGRHcm91cENoYW5nZShvRXZlbnQpO1xuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIGNoYW5nZSBldmVudC5cblx0ICogU3RvcmUgZmllbGQgZ3JvdXAgSURzIG9mIHRoaXMgZmllbGQgZm9yIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzIHdoZW4gcmVxdWlyZWQuXG5cdCAqIFdlIHN0b3JlIHRoZW0gaGVyZSB0byBlbnN1cmUgYSBjaGFuZ2UgaW4gdGhlIHZhbHVlIG9mIHRoZSBmaWVsZCBoYXMgdGFrZW4gcGxhY2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVDaGFuZ2Vcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjb250cm9sbGVyIG9mIHRoZSBwYWdlIGNvbnRhaW5pbmcgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IG9iamVjdCBwYXNzZWQgYnkgdGhlIGNoYW5nZSBldmVudFxuXHQgKi9cblx0aGFuZGxlQ2hhbmdlOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IG9iamVjdCwgb0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9Tb3VyY2VGaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBDb250cm9sLFxuXHRcdFx0YklzVHJhbnNpZW50ID0gb1NvdXJjZUZpZWxkICYmIChvU291cmNlRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBhbnkpLmlzVHJhbnNpZW50KCksXG5cdFx0XHRwVmFsdWVSZXNvbHZlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpIHx8IFByb21pc2UucmVzb2x2ZSgpLFxuXHRcdFx0b1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdGJWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSxcblx0XHRcdGZpZWxkVmFsaWRpdHkgPSB0aGlzLmdldEZpZWxkU3RhdGVPbkNoYW5nZShvRXZlbnQpLnN0YXRlW1widmFsaWRpdHlcIl07XG5cblx0XHQvLyBUT0RPOiBjdXJyZW50bHkgd2UgaGF2ZSB1bmRlZmluZWQgYW5kIHRydWUuLi4gYW5kIG91ciBjcmVhdGlvbiByb3cgaW1wbGVtZW50YXRpb24gcmVsaWVzIG9uIHRoaXMuXG5cdFx0Ly8gSSB3b3VsZCBtb3ZlIHRoaXMgbG9naWMgdG8gdGhpcyBwbGFjZSBhcyBpdCdzIGhhcmQgdG8gdW5kZXJzdGFuZCBmb3IgZmllbGQgY29uc3VtZXJcblxuXHRcdHBWYWx1ZVJlc29sdmVkXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFRoZSBldmVudCBpcyBnb25lLiBGb3Igbm93IHdlJ2xsIGp1c3QgcmVjcmVhdGUgaXQgYWdhaW5cblx0XHRcdFx0KG9FdmVudCBhcyBhbnkpLm9Tb3VyY2UgPSBvU291cmNlO1xuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkubVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFx0dmFsaWQ6IGJWYWxpZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQoRmllbGRBUEkgYXMgYW55KS5oYW5kbGVDaGFuZ2Uob0V2ZW50LCBvQ29udHJvbGxlcik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgvKm9FcnJvcjogYW55Ki8pIHtcblx0XHRcdFx0Ly8gVGhlIGV2ZW50IGlzIGdvbmUuIEZvciBub3cgd2UnbGwganVzdCByZWNyZWF0ZSBpdCBhZ2FpblxuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkub1NvdXJjZSA9IG9Tb3VyY2U7XG5cdFx0XHRcdChvRXZlbnQgYXMgYW55KS5tUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHR2YWxpZDogZmFsc2Vcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQvLyBhcyB0aGUgVUkgbWlnaHQgbmVlZCB0byByZWFjdCBvbi4gV2UgY291bGQgcHJvdmlkZSBhIHBhcmFtZXRlciB0byBpbmZvcm0gaWYgdmFsaWRhdGlvblxuXHRcdFx0XHQvLyB3YXMgc3VjY2Vzc2Z1bD9cblx0XHRcdFx0KEZpZWxkQVBJIGFzIGFueSkuaGFuZGxlQ2hhbmdlKG9FdmVudCwgb0NvbnRyb2xsZXIpO1xuXHRcdFx0fSk7XG5cblx0XHQvLyBVc2UgdGhlIEZFIENvbnRyb2xsZXIgaW5zdGVhZCBvZiB0aGUgZXh0ZW5zaW9uQVBJIHRvIGFjY2VzcyBpbnRlcm5hbCBGRSBjb250cm9sbGVyc1xuXHRcdGNvbnN0IG9GRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIob0NvbnRyb2xsZXIpO1xuXG5cdFx0b0ZFQ29udHJvbGxlci5lZGl0Rmxvdy5zeW5jVGFzayhwVmFsdWVSZXNvbHZlZCk7XG5cblx0XHQvLyBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQsIGl0IG1lYW5zIHRoZSByZXF1ZXN0IHdvdWxkIGZhaWwgYW55d2F5IGFzIHRoZSByZWNvcmQgZG9lcyBub3QgZXhpc3QgaW4gcmVhbGl0eVxuXHRcdC8vIFRPRE86IHNob3VsZCB0aGUgcmVxdWVzdCBiZSBtYWRlIGluIGZ1dHVyZSBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQ/XG5cdFx0aWYgKGJJc1RyYW5zaWVudCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNJREUgRUZGRUNUU1xuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkQ2hhbmdlKG9FdmVudCwgZmllbGRWYWxpZGl0eSwgcFZhbHVlUmVzb2x2ZWQpO1xuXG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKG9GaWVsZCk7XG5cblx0XHRpZiAoYkNvbGxhYm9yYXRpb25FbmFibGVkICYmIGZpZWxkVmFsaWRpdHkpIHtcblx0XHRcdC8qIFRPRE86IGZvciBub3cgd2UgdXNlIGFsd2F5cyB0aGUgZmlyc3QgYmluZGluZyBwYXJ0IChzbyBpbiBjYXNlIG9mIGNvbXBvc2l0ZSBiaW5kaW5ncyBsaWtlIGFtb3VudCBhbmRcblx0XHRcdFx0XHR1bml0IG9yIGN1cnJlbmN5IG9ubHkgdGhlIGFtb3VudCBpcyBjb25zaWRlcmVkKSAqL1xuXHRcdFx0Y29uc3QgYmluZGluZyA9IGdldENvbGxhYm9yYXRpb25CaW5kaW5nKG9GaWVsZCk7XG5cblx0XHRcdGNvbnN0IGRhdGEgPSBbXG5cdFx0XHRcdC4uLigoKG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpIHx8IG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInNlbGVjdGVkXCIpKSBhcyBhbnkpPy5wYXJ0cyB8fCBbXSksXG5cdFx0XHRcdC4uLigob0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwiYWRkaXRpb25hbFZhbHVlXCIpIGFzIGFueSk/LnBhcnRzIHx8IFtdKVxuXHRcdFx0XS5tYXAoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAocGFydCkge1xuXHRcdFx0XHRcdHJldHVybiBgJHtvRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpfS8ke3BhcnQucGF0aH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSBhcyBbXTtcblxuXHRcdFx0Y29uc3QgdXBkYXRlQ29sbGFib3JhdGlvbiA9ICgpID0+IHtcblx0XHRcdFx0aWYgKGJpbmRpbmcuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdC8vIFRoZSB2YWx1ZSBoYXMgYmVlbiBjaGFuZ2VkIGJ5IHRoZSB1c2VyIC0tPiB3YWl0IHVudGlsIGl0J3Mgc2VudCB0byB0aGUgc2VydmVyIGJlZm9yZSBzZW5kaW5nIGEgbm90aWZpY2F0aW9uIHRvIG90aGVyIHVzZXJzXG5cdFx0XHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQob0ZpZWxkLCBBY3Rpdml0eS5DaGFuZ2UsIGRhdGEpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIE5vIGNoYW5nZXMgLS0+IHNlbmQgYSBVbmRvIG5vdGlmaWNhdGlvblxuXHRcdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LlVuZG8sIGRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKG9Tb3VyY2VGaWVsZC5pc0EoXCJzYXAudWkubWRjLkZpZWxkXCIpKSB7XG5cdFx0XHRcdHBWYWx1ZVJlc29sdmVkXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0dXBkYXRlQ29sbGFib3JhdGlvbigpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0XHRcdHVwZGF0ZUNvbGxhYm9yYXRpb24oKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHVwZGF0ZUNvbGxhYm9yYXRpb24oKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTGl2ZUNoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpO1xuXG5cdFx0aWYgKENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmllbGQpKSB7XG5cdFx0XHQvKiBUT0RPOiBmb3Igbm93IHdlIHVzZSBhbHdheXMgdGhlIGZpcnN0IGJpbmRpbmcgcGFydCAoc28gaW4gY2FzZSBvZiBjb21wb3NpdGUgYmluZGluZ3MgbGlrZSBhbW91bnQgYW5kXG5cdFx0XHRcdFx0dW5pdCBvciBjdXJyZW5jeSBvbmx5IHRoZSBhbW91bnQgaXMgY29uc2lkZXJlZCkgKi9cblx0XHRcdGNvbnN0IGJpbmRpbmdQYXRoID0gZmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKS5wYXJ0c1swXS5wYXRoO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGggPSBgJHtmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtiaW5kaW5nUGF0aH1gO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGZpZWxkLCBBY3Rpdml0eS5MaXZlQ2hhbmdlLCBmdWxsUGF0aCk7XG5cblx0XHRcdC8vIElmIHRoZSB1c2VyIHJldmVydGVkIHRoZSBjaGFuZ2Ugbm8gY2hhbmdlIGV2ZW50IGlzIHNlbnQgdGhlcmVmb3JlIHdlIGhhdmUgdG8gaGFuZGxlIGl0IGhlcmVcblx0XHRcdGlmICghdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKSB7XG5cdFx0XHRcdHRoaXMucmVzZXRDaGFuZ2VzSGFuZGxlciA9ICgpID0+IHtcblx0XHRcdFx0XHQvLyBXZSBuZWVkIHRvIHdhaXQgYSBsaXR0bGUgYml0IGZvciB0aGUgZm9jdXMgdG8gYmUgdXBkYXRlZFxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNlZENvbnRyb2wgPSBDb3JlLmJ5SWQoQ29yZS5nZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCgpKTtcblx0XHRcdFx0XHRcdFx0aWYgKGZvY3VzZWRDb250cm9sPy5nZXRQYXJlbnQoKSA9PT0gZmllbGQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBXZSdyZSBzdGlsbCB1biB0aGUgc2FtZSBNREMgRmllbGQgLS0+IGRvIG5vdGhpbmdcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZmllbGQuZGV0YWNoQnJvd3NlckV2ZW50KFwiZm9jdXNvdXRcIiwgdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKTtcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXI7XG5cdFx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZmllbGQsIEFjdGl2aXR5LlVuZG8sIGZ1bGxQYXRoKTtcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWVsZC5hdHRhY2hCcm93c2VyRXZlbnQoXCJmb2N1c291dFwiLCB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVPcGVuUGlja2VyOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBvRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgYkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LkxpdmVDaGFuZ2UsIHNGdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVDbG9zZVBpY2tlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0ZpZWxkKTtcblxuXHRcdGlmIChiQ29sbGFib3JhdGlvbkVuYWJsZWQpIHtcblx0XHRcdGNvbnN0IGJpbmRpbmcgPSBnZXRDb2xsYWJvcmF0aW9uQmluZGluZyhvRmllbGQpO1xuXHRcdFx0aWYgKCFiaW5kaW5nLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgYXJlIG5vIHBlbmRpbmcgY2hhbmdlcywgdGhlIHBpY2tlciB3YXMgY2xvc2VkIHdpdGhvdXQgY2hhbmdpbmcgdGhlIHZhbHVlIC0tPiBzZW5kIGEgVU5ETyBub3RpZmljYXRpb25cblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSB3ZXJlIGNoYW5nZXMsIG5vdGlmaWNhdGlvbnMgYXJlIG1hbmFnZWQgaW4gaGFuZGxlQ2hhbmdlXG5cdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpLnBhcnRzWzBdLnBhdGg7XG5cdFx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuVW5kbywgc0Z1bGxQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXI6IEZpbGVVcGxvYWRlciwgYWN0aXZpdHk6IEFjdGl2aXR5KSB7XG5cdFx0Y29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmlsZVVwbG9hZGVyKTtcblxuXHRcdGlmIChpc0NvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nUGF0aCA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKT8uZ2V0UHJvcGVydHkoXCJwcm9wZXJ0eVBhdGhcIik7XG5cdFx0XHRjb25zdCBmdWxsUGF0aCA9IGAke2ZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7YmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlVXBsb2FkZXIsIGFjdGl2aXR5LCBmdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU9wZW5VcGxvYWRlcjogZnVuY3Rpb24gKGV2ZW50OiBFdmVudCkge1xuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGZpbGVVcGxvYWRlciA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIEZpbGVVcGxvYWRlcjtcblx0XHRGaWVsZFJ1bnRpbWUuX3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXIsIEFjdGl2aXR5LkxpdmVDaGFuZ2UpO1xuXHR9LFxuXHRoYW5kbGVDbG9zZVVwbG9hZGVyOiBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3QgZmlsZVVwbG9hZGVyID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsZVVwbG9hZGVyO1xuXHRcdEZpZWxkUnVudGltZS5fc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRlciwgQWN0aXZpdHkuVW5kbyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpZWxkIHZhbHVlIGFuZCB2YWxpZGl0eSBvbiBhIGNoYW5nZSBldmVudC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGZpZWxkVmFsaWRpdHlPbkNoYW5nZVxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBvYmplY3QgcGFzc2VkIGJ5IHRoZSBjaGFuZ2UgZXZlbnRcblx0ICogQHJldHVybnMgRmllbGQgdmFsdWUgYW5kIHZhbGlkaXR5XG5cdCAqL1xuXHRnZXRGaWVsZFN0YXRlT25DaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KTogYW55IHtcblx0XHRsZXQgb1NvdXJjZUZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIGFueSxcblx0XHRcdG1GaWVsZFN0YXRlID0ge307XG5cdFx0Y29uc3QgX2lzQmluZGluZ1N0YXRlTWVzc2FnZXMgPSBmdW5jdGlvbiAob0JpbmRpbmc6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9CaW5kaW5nICYmIG9CaW5kaW5nLmdldERhdGFTdGF0ZSgpID8gb0JpbmRpbmcuZ2V0RGF0YVN0YXRlKCkuZ2V0SW52YWxpZFZhbHVlKCkgPT09IHVuZGVmaW5lZCA6IHRydWU7XG5cdFx0fTtcblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRBUElcIikpIHtcblx0XHRcdG9Tb3VyY2VGaWVsZCA9IChvU291cmNlRmllbGQgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRBUEk+KS5nZXRDb250ZW50KCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9Tb3VyY2VGaWVsZC5pc0EoRmllbGRXcmFwcGVyLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSAmJiBvU291cmNlRmllbGQuZ2V0RWRpdE1vZGUoKSA9PT0gXCJFZGl0YWJsZVwiKSB7XG5cdFx0XHRvU291cmNlRmllbGQgPSBvU291cmNlRmllbGQuZ2V0Q29udGVudEVkaXQoKVswXTtcblx0XHR9XG5cblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdGxldCBiSXNWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaXNWYWxpZFwiKTtcblx0XHRcdGlmIChiSXNWYWxpZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlQmluZGluZ0luZm8gPSBvU291cmNlRmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKTtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9WYWx1ZUJpbmRpbmdJbmZvICYmIG9WYWx1ZUJpbmRpbmdJbmZvLmJpbmRpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0VmFsdWUoKSA9PT0gXCJcIiAmJiAhb1NvdXJjZUZpZWxkLmdldFByb3BlcnR5KFwicmVxdWlyZWRcIikpIHtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1GaWVsZFN0YXRlID0ge1xuXHRcdFx0XHRmaWVsZFZhbHVlOiBvU291cmNlRmllbGQuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6ICEhYklzVmFsaWRcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG9Tb3VyY2VGaWVsZCBleHRlbmRzIGZyb20gYSBGaWxlVXBsb2FkZXIgfHwgSW5wdXQgfHwgaXMgYSBDaGVja0JveFxuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPVxuXHRcdFx0XHRvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInVwbG9hZFVybFwiKSB8fCBvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInZhbHVlXCIpIHx8IG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRtRmllbGRTdGF0ZSA9IHtcblx0XHRcdFx0ZmllbGRWYWx1ZTogb0JpbmRpbmcgJiYgb0JpbmRpbmcuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9CaW5kaW5nKVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpZWxkOiBvU291cmNlRmllbGQsXG5cdFx0XHRzdGF0ZTogbUZpZWxkU3RhdGVcblx0XHR9O1xuXHR9LFxuXHRfZm5GaXhIYXNoUXVlcnlTdHJpbmc6IGZ1bmN0aW9uIChzQ3VycmVudEhhc2g6IGFueSkge1xuXHRcdGlmIChzQ3VycmVudEhhc2ggJiYgc0N1cnJlbnRIYXNoLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuXHRcdFx0Ly8gc0N1cnJlbnRIYXNoIGNhbiBjb250YWluIHF1ZXJ5IHN0cmluZywgY3V0IGl0IG9mZiFcblx0XHRcdHNDdXJyZW50SGFzaCA9IHNDdXJyZW50SGFzaC5zcGxpdChcIj9cIilbMF07XG5cdFx0fVxuXHRcdHJldHVybiBzQ3VycmVudEhhc2g7XG5cdH0sXG5cdF9mbkdldExpbmtJbmZvcm1hdGlvbjogZnVuY3Rpb24gKF9vU291cmNlOiBhbnksIF9vTGluazogYW55LCBfc1Byb3BlcnR5UGF0aDogYW55LCBfc1ZhbHVlOiBhbnksIGZuU2V0QWN0aXZlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBfb0xpbmsgJiYgX29MaW5rLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbCAmJiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0TmFtZSA9IF9zVmFsdWUgfHwgKF9vU291cmNlICYmIF9vU291cmNlLmdldFZhbHVlKCkpO1xuXHRcdGNvbnN0IG9WaWV3ID0gX29MaW5rICYmIENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoX29MaW5rKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldyAmJiBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBvVmlldyAmJiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VIZWxwZXIgPSBvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGNvbnN0IHBHZXRMaW5rc1Byb21pc2UgPSBvU2hlbGxTZXJ2aWNlSGVscGVyICYmIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3NXaXRoQ2FjaGUoW1t7IHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3ROYW1lIH1dXSk7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID1cblx0XHRcdG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7X3NQcm9wZXJ0eVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc2ApO1xuXHRcdHJldHVybiB7XG5cdFx0XHRTZW1hbnRpY09iamVjdE5hbWU6IHNTZW1hbnRpY09iamVjdE5hbWUsXG5cdFx0XHRTZW1hbnRpY09iamVjdEZ1bGxQYXRoOiBfc1Byb3BlcnR5UGF0aCwgLy9zU2VtYW50aWNPYmplY3RGdWxsUGF0aCxcblx0XHRcdE1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdEludGVybmFsTW9kZWxDb250ZXh0OiBvSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRTaGVsbFNlcnZpY2VIZWxwZXI6IG9TaGVsbFNlcnZpY2VIZWxwZXIsXG5cdFx0XHRHZXRMaW5rc1Byb21pc2U6IHBHZXRMaW5rc1Byb21pc2UsXG5cdFx0XHRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0Zm5TZXRBY3RpdmU6IGZuU2V0QWN0aXZlXG5cdFx0fTtcblx0fSxcblx0X2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uOiBmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0UGF5bG9hZDogYW55LCBfb0xpbmtJbmZvOiBhbnkpIHtcblx0XHRpZiAob1NlbWFudGljT2JqZWN0UGF5bG9hZCAmJiBvU2VtYW50aWNPYmplY3RQYXlsb2FkLnBhdGggJiYgb1NlbWFudGljT2JqZWN0UGF5bG9hZC5wYXRoID09PSBfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0RnVsbFBhdGgpIHtcblx0XHRcdC8vIEdvdCB0aGUgcmVzb2x2ZWQgU2VtYW50aWMgT2JqZWN0IVxuXHRcdFx0Y29uc3QgYlJlc3VsdGluZ05ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlciA9XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWRbIV9vTGlua0luZm8uU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPyBcIkhhc1RhcmdldHNOb3RGaWx0ZXJlZFwiIDogXCJIYXNUYXJnZXRzXCJdO1xuXHRcdFx0X29MaW5rSW5mby5mblNldEFjdGl2ZSghIWJSZXN1bHRpbmdOZXdDb25kaXRpb25Gb3JDb25kaXRpb25hbFdyYXBwZXIpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdF9mblF1aWNrVmlld1NldE5ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlcjogZnVuY3Rpb24gKF9vTGlua0luZm86IGFueSwgX29GaW5hbFNlbWFudGljT2JqZWN0czogYW55KSB7XG5cdFx0aWYgKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKSB7XG5cdFx0XHRsZXQgc1RtcFBhdGgsIG9TZW1hbnRpY09iamVjdFBheWxvYWQ7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RQYXRocyA9IE9iamVjdC5rZXlzKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKTtcblx0XHRcdGZvciAoY29uc3QgaVBhdGhzQ291bnQgaW4gYVNlbWFudGljT2JqZWN0UGF0aHMpIHtcblx0XHRcdFx0c1RtcFBhdGggPSBhU2VtYW50aWNPYmplY3RQYXRoc1tpUGF0aHNDb3VudF07XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWQgPVxuXHRcdFx0XHRcdF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdICYmXG5cdFx0XHRcdFx0X29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV1bc1RtcFBhdGhdO1xuXHRcdFx0XHRpZiAoRmllbGRSdW50aW1lLl9mblF1aWNrVmlld0hhc05ld0NvbmRpdGlvbihvU2VtYW50aWNPYmplY3RQYXlsb2FkLCBfb0xpbmtJbmZvKSkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbDogZnVuY3Rpb24gKG9FdmVudDogYW55LCBzVmFsdWU6IGFueSwgb0NvbnRyb2w6IGFueSwgX3NQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdGNvbnN0IG9Tb3VyY2UgPSBvRXZlbnQgJiYgb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGxldCBmblNldEFjdGl2ZTtcblx0XHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLm0uT2JqZWN0U3RhdHVzXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRBY3RpdmUoYkFjdGl2ZSk7XG5cdFx0fVxuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRUaXRsZUFjdGl2ZShiQWN0aXZlKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0NvbmRpdGlvbmFsV3JhcHBlciA9IG9Db250cm9sICYmIG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdGlmIChvQ29uZGl0aW9uYWxXcmFwcGVyICYmIG9Db25kaXRpb25hbFdyYXBwZXIuaXNBKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIikpIHtcblx0XHRcdGZuU2V0QWN0aXZlID0gKGJBY3RpdmU6IGJvb2xlYW4pID0+IG9Db25kaXRpb25hbFdyYXBwZXIuc2V0Q29uZGl0aW9uKGJBY3RpdmUpO1xuXHRcdH1cblx0XHRpZiAoZm5TZXRBY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgb0xpbmtJbmZvID0gRmllbGRSdW50aW1lLl9mbkdldExpbmtJbmZvcm1hdGlvbihvU291cmNlLCBvQ29udHJvbCwgX3NQcm9wZXJ0eVBhdGgsIHNWYWx1ZSwgZm5TZXRBY3RpdmUpO1xuXHRcdFx0b0xpbmtJbmZvLmZuU2V0QWN0aXZlID0gZm5TZXRBY3RpdmU7XG5cdFx0XHRjb25zdCBzQ3VycmVudEhhc2ggPSBGaWVsZFJ1bnRpbWUuX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nKENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvQ29udHJvbCkuZ2V0U2hlbGxTZXJ2aWNlcygpLmdldEhhc2goKSk7XG5cdFx0XHRDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoXG5cdFx0XHRcdFtvTGlua0luZm8uR2V0TGlua3NQcm9taXNlXSxcblx0XHRcdFx0W3sgc2VtYW50aWNPYmplY3Q6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWUsIHBhdGg6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdEZ1bGxQYXRoIH1dLFxuXHRcdFx0XHRvTGlua0luZm8uSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdHNDdXJyZW50SGFzaFxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0ZpbmFsU2VtYW50aWNPYmplY3RzOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0ZpbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyKG9MaW5rSW5mbywgb0ZpbmFsU2VtYW50aWNPYmplY3RzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgdXBkYXRlIFNlbWFudGljIFRhcmdldHMgbW9kZWxcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dChfY29udHJvbDogQ29udHJvbCkge1xuXHRcdGlmICghX2NvbnRyb2wuZ2V0TW9kZWwoKSB8fCAhX2NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdF9jaGVja0N1c3RvbURhdGFWYWx1ZUJlZm9yZVVwZGF0aW5nU2VtYW50aWNPYmplY3RNb2RlbChfY29udHJvbDogQ29udHJvbCwgcHJvcGVydHlQYXRoOiBzdHJpbmcsIGFDdXN0b21EYXRhOiBDdXN0b21EYXRhW10pOiB2b2lkIHtcblx0XHRsZXQgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnk7XG5cdFx0bGV0IG9WYWx1ZUJpbmRpbmc7XG5cdFx0Y29uc3QgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcgPSBmdW5jdGlvbiAoc2VtYW50aWNPYmplY3RQYXRoVmFsdWU6IGFueSkge1xuXHRcdFx0cmV0dXJuICEoc2VtYW50aWNPYmplY3RQYXRoVmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHNlbWFudGljT2JqZWN0UGF0aFZhbHVlID09PSBcIm9iamVjdFwiKTtcblx0XHR9O1xuXHRcdC8vIHJlbW92ZSB0ZWNobmljYWwgY3VzdG9tIGRhdGFzIHNldCBieSBVSTVcblx0XHRhQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhLmZpbHRlcigoY3VzdG9tRGF0YSkgPT4gY3VzdG9tRGF0YS5nZXRLZXkoKSAhPT0gXCJzYXAtdWktY3VzdG9tLXNldHRpbmdzXCIpO1xuXHRcdGZvciAoY29uc3QgaW5kZXggaW4gYUN1c3RvbURhdGEpIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSA9IGFDdXN0b21EYXRhW2luZGV4XS5nZXRWYWx1ZSgpO1xuXHRcdFx0aWYgKCFzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUgJiYgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRvVmFsdWVCaW5kaW5nID0gYUN1c3RvbURhdGFbaW5kZXhdLmdldEJpbmRpbmcoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0aWYgKG9WYWx1ZUJpbmRpbmcpIHtcblx0XHRcdFx0XHRvVmFsdWVCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoX29DaGFuZ2VFdmVudDogYW55KSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwoX29DaGFuZ2VFdmVudCwgbnVsbCwgX2NvbnRyb2wsIHByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwobnVsbCwgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlLCBfY29udHJvbCwgcHJvcGVydHlQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdExpbmtNb2RlbENvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgc1Byb3BlcnR5OiBhbnksIHNQYXRoVG9Qcm9wZXJ0eTogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udHJvbCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRpZiAoRmllbGRSdW50aW1lLl9jaGVja0NvbnRyb2xIYXNNb2RlbEFuZEJpbmRpbmdDb250ZXh0KGNvbnRyb2wpKSB7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1BhdGhUb1Byb3BlcnR5fS8ke3NQcm9wZXJ0eX1gO1xuXHRcdFx0Y29uc3QgbWRjTGluayA9IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA/IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpWzBdIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgYUN1c3RvbURhdGEgPSBtZGNMaW5rPy5nZXRDdXN0b21EYXRhKCk7XG5cdFx0XHRpZiAoYUN1c3RvbURhdGEgJiYgYUN1c3RvbURhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsKGNvbnRyb2wsIHNQcm9wZXJ0eVBhdGgsIGFDdXN0b21EYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG9wZW5FeHRlcm5hbExpbms6IGZ1bmN0aW9uIChldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBzb3VyY2UgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBhbnk7XG5cdFx0aWYgKHNvdXJjZS5kYXRhKFwidXJsXCIpICYmIHNvdXJjZS5nZXRQcm9wZXJ0eShcInRleHRcIikgIT09IFwiXCIpIHtcblx0XHRcdG9wZW5XaW5kb3coc291cmNlLmRhdGEoXCJ1cmxcIikpO1xuXHRcdH1cblx0fSxcblx0Y3JlYXRlUG9wb3ZlcldpdGhOb1RhcmdldHM6IGZ1bmN0aW9uIChtZGNMaW5rOiBNZGNMaW5rKSB7XG5cdFx0Y29uc3QgbWRjTGlua0lkID0gbWRjTGluay5nZXRJZCgpO1xuXHRcdGNvbnN0IGlsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzOiAkSWxsdXN0cmF0ZWRNZXNzYWdlU2V0dGluZ3MgPSB7XG5cdFx0XHR0aXRsZTogZ2V0UmVzb3VyY2VNb2RlbChtZGNMaW5rIGFzIHVua25vd24gYXMgQ29udHJvbCkuZ2V0VGV4dChcIk1fSUxMVVNUUkFURURNRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0ZGVzY3JpcHRpb246IGdldFJlc291cmNlTW9kZWwobWRjTGluayBhcyB1bmtub3duIGFzIENvbnRyb2wpLmdldFRleHQoXCJNX0lMTFVTVFJBVEVETUVTU0FHRV9ERVNDUklQVElPTlwiKSxcblx0XHRcdGVuYWJsZUZvcm1hdHRlZFRleHQ6IHRydWUsXG5cdFx0XHRpbGx1c3RyYXRpb25TaXplOiBcIkRvdFwiLCAvLyBJbGx1c3RyYXRlZE1lc3NhZ2VTaXplLkRvdCBub3QgYXZhaWxhYmxlIGluIFwiQHR5cGVzL29wZW51aTVcIjogXCIxLjEwNy4wXCJcblx0XHRcdGlsbHVzdHJhdGlvblR5cGU6IElsbHVzdHJhdGVkTWVzc2FnZVR5cGUuVGVudFxuXHRcdH07XG5cdFx0Y29uc3QgaWxsdXN0cmF0ZWRNZXNzYWdlID0gbmV3IElsbHVzdHJhdGVkTWVzc2FnZShgJHttZGNMaW5rSWR9LWlsbHVzdHJhdGVkbWVzc2FnZWAsIGlsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzKTtcblx0XHRjb25zdCBwb3BvdmVyU2V0dGluZ3M6ICRSZXNwb25zaXZlUG9wb3ZlclNldHRpbmdzID0ge1xuXHRcdFx0aG9yaXpvbnRhbFNjcm9sbGluZzogZmFsc2UsXG5cdFx0XHRzaG93SGVhZGVyOiBzYXAudWkuRGV2aWNlLnN5c3RlbS5waG9uZSxcblx0XHRcdHBsYWNlbWVudDogbW9iaWxlbGlicmFyeS5QbGFjZW1lbnRUeXBlLkF1dG8sXG5cdFx0XHRjb250ZW50OiBbaWxsdXN0cmF0ZWRNZXNzYWdlXSxcblx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0XHRpZiAoZXZlbnQuZ2V0U291cmNlKCkpIHtcblx0XHRcdFx0XHRldmVudC5nZXRTb3VyY2UoKS5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHJldHVybiBuZXcgUmVzcG9uc2l2ZVBvcG92ZXIoYCR7bWRjTGlua0lkfS1wb3BvdmVyYCwgcG9wb3ZlclNldHRpbmdzKTtcblx0fSxcblx0b3Blbkxpbms6IGFzeW5jIGZ1bmN0aW9uIChtZGNMaW5rOiBNZGNMaW5rLCBzYXBtTGluazogTGluaykge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBoUmVmID0gYXdhaXQgbWRjTGluay5nZXRUcmlnZ2VySHJlZigpO1xuXHRcdFx0aWYgKCFoUmVmKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgbGlua0l0ZW1zID0gYXdhaXQgbWRjTGluay5yZXRyaWV2ZUxpbmtJdGVtcygpO1xuXHRcdFx0XHRcdGlmIChsaW5rSXRlbXM/Lmxlbmd0aCA9PT0gMCAmJiAobWRjTGluayBhcyBhbnkpLmdldFBheWxvYWQoKS5oYXNRdWlja1ZpZXdGYWNldHMgPT09IFwiZmFsc2VcIikge1xuXHRcdFx0XHRcdFx0Y29uc3QgcG9wb3ZlcjogUmVzcG9uc2l2ZVBvcG92ZXIgPSBGaWVsZFJ1bnRpbWUuY3JlYXRlUG9wb3ZlcldpdGhOb1RhcmdldHMobWRjTGluayk7XG5cdFx0XHRcdFx0XHRtZGNMaW5rLmFkZERlcGVuZGVudChwb3BvdmVyKTtcblx0XHRcdFx0XHRcdHBvcG92ZXIub3BlbkJ5KHNhcG1MaW5rIGFzIHVua25vd24gYXMgQ29udHJvbCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGF3YWl0IG1kY0xpbmsub3BlbihzYXBtTGluayBhcyB1bmtub3duIGFzIENvbnRyb2wpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoYENhbm5vdCByZXRyaWV2ZSB0aGUgUXVpY2tWaWV3IFBvcG92ZXIgZGlhbG9nOiAke2Vycm9yfWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCB2aWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhzYXBtTGluayk7XG5cdFx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh2aWV3KTtcblx0XHRcdFx0Y29uc3Qgc2hlbGxTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRcdFx0Y29uc3Qgc2hlbGxIYXNoID0gc2hlbGxTZXJ2aWNlLnBhcnNlU2hlbGxIYXNoKGhSZWYpO1xuXHRcdFx0XHRjb25zdCBuYXZBcmdzID0ge1xuXHRcdFx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHNoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogc2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cGFyYW1zOiBzaGVsbEhhc2gucGFyYW1zXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0S2VlcEFsaXZlSGVscGVyLnN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2godmlldywgc2hlbGxIYXNoKTtcblxuXHRcdFx0XHRpZiAoQ29tbW9uVXRpbHMuaXNTdGlja3lFZGl0TW9kZShzYXBtTGluayBhcyB1bmtub3duIGFzIENvbnRyb2wpICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly9VUkwgcGFyYW1zIGFuZCB4YXBwU3RhdGUgaGFzIGJlZW4gZ2VuZXJhdGVkIGVhcmxpZXIgaGVuY2UgdXNpbmcgdG9FeHRlcm5hbFxuXHRcdFx0XHRcdHNoZWxsU2VydmljZS50b0V4dGVybmFsKG5hdkFyZ3MgYXMgYW55LCBhcHBDb21wb25lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBuZXdIcmVmID0gYXdhaXQgc2hlbGxTZXJ2aWNlLmhyZWZGb3JFeHRlcm5hbEFzeW5jKG5hdkFyZ3MsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0XHRvcGVuV2luZG93KG5ld0hyZWYpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIHJldGlyZXZpbmcgaHJlZkZvckV4dGVybmFsIDogJHtlcnJvcn1gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKGBFcnJvciB0cmlnZ2VyaW5nIGxpbmsgSHJlZjogJHtlcnJvcn1gKTtcblx0XHR9XG5cdH0sXG5cdHByZXNzTGluazogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBzYXBtTGluayA9IG9Tb3VyY2UuaXNBKFwic2FwLm0uT2JqZWN0SWRlbnRpZmllclwiKVxuXHRcdFx0PyBvU291cmNlLmZpbmRFbGVtZW50cyhmYWxzZSwgKGVsZW06IEV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW0uaXNBKFwic2FwLm0uTGlua1wiKTtcblx0XHRcdCAgfSlbMF1cblx0XHRcdDogb1NvdXJjZTtcblxuXHRcdGlmIChvU291cmNlLmdldERlcGVuZGVudHMoKSAmJiBvU291cmNlLmdldERlcGVuZGVudHMoKS5sZW5ndGggPiAwICYmIHNhcG1MaW5rLmdldFByb3BlcnR5KFwidGV4dFwiKSAhPT0gXCJcIikge1xuXHRcdFx0Y29uc3Qgb0ZpZWxkSW5mbyA9IG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpWzBdO1xuXHRcdFx0aWYgKG9GaWVsZEluZm8gJiYgb0ZpZWxkSW5mby5pc0EoXCJzYXAudWkubWRjLkxpbmtcIikpIHtcblx0XHRcdFx0YXdhaXQgRmllbGRSdW50aW1lLm9wZW5MaW5rKG9GaWVsZEluZm8sIHNhcG1MaW5rKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNhcG1MaW5rO1xuXHR9LFxuXHR1cGxvYWRTdHJlYW06IGZ1bmN0aW9uIChjb250cm9sbGVyOiBDb250cm9sbGVyLCBldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBmaWxlVXBsb2FkZXIgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBGaWxlVXBsb2FkZXIsXG5cdFx0XHRGRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIoY29udHJvbGxlciksXG5cdFx0XHRmaWxlV3JhcHBlciA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKSBhcyB1bmtub3duIGFzIEZpbGVXcmFwcGVyLFxuXHRcdFx0dXBsb2FkVXJsID0gZmlsZVdyYXBwZXIuZ2V0VXBsb2FkVXJsKCk7XG5cblx0XHRpZiAodXBsb2FkVXJsICE9PSBcIlwiKSB7XG5cdFx0XHRmaWxlV3JhcHBlci5zZXRVSUJ1c3kodHJ1ZSk7XG5cblx0XHRcdC8vIHVzZSB1cGxvYWRVcmwgZnJvbSBGaWxlV3JhcHBlciB3aGljaCByZXR1cm5zIGEgY2Fub25pY2FsIFVSTFxuXHRcdFx0ZmlsZVVwbG9hZGVyLnNldFVwbG9hZFVybCh1cGxvYWRVcmwpO1xuXG5cdFx0XHRmaWxlVXBsb2FkZXIucmVtb3ZlQWxsSGVhZGVyUGFyYW1ldGVycygpO1xuXHRcdFx0Y29uc3QgdG9rZW4gPSAoZmlsZVVwbG9hZGVyLmdldE1vZGVsKCkgYXMgYW55KT8uZ2V0SHR0cEhlYWRlcnMoKVtcIlgtQ1NSRi1Ub2tlblwiXTtcblx0XHRcdGlmICh0b2tlbikge1xuXHRcdFx0XHRjb25zdCBoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4gPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbi5zZXROYW1lKFwieC1jc3JmLXRva2VuXCIpO1xuXHRcdFx0XHRoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4uc2V0VmFsdWUodG9rZW4pO1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIuYWRkSGVhZGVyUGFyYW1ldGVyKGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBlVGFnID0gKGZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQgfCBudWxsKT8uZ2V0UHJvcGVydHkoXCJAb2RhdGEuZXRhZ1wiKTtcblx0XHRcdGlmIChlVGFnKSB7XG5cdFx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckVUYWcgPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckVUYWcuc2V0TmFtZShcIklmLU1hdGNoXCIpO1xuXHRcdFx0XHQvLyBJZ25vcmUgRVRhZyBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckVUYWcuc2V0VmFsdWUoQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChmaWxlVXBsb2FkZXIpID8gXCIqXCIgOiBlVGFnKTtcblx0XHRcdFx0ZmlsZVVwbG9hZGVyLmFkZEhlYWRlclBhcmFtZXRlcihoZWFkZXJQYXJhbWV0ZXJFVGFnKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckFjY2VwdCA9IG5ldyBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIoKTtcblx0XHRcdGhlYWRlclBhcmFtZXRlckFjY2VwdC5zZXROYW1lKFwiQWNjZXB0XCIpO1xuXHRcdFx0aGVhZGVyUGFyYW1ldGVyQWNjZXB0LnNldFZhbHVlKFwiYXBwbGljYXRpb24vanNvblwiKTtcblx0XHRcdGZpbGVVcGxvYWRlci5hZGRIZWFkZXJQYXJhbWV0ZXIoaGVhZGVyUGFyYW1ldGVyQWNjZXB0KTtcblxuXHRcdFx0Ly8gc3luY2hyb25pemUgdXBsb2FkIHdpdGggb3RoZXIgcmVxdWVzdHNcblx0XHRcdGNvbnN0IHVwbG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuXHRcdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzID0gdGhpcy51cGxvYWRQcm9taXNlcyB8fCB7fTtcblx0XHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0gPSB7XG5cdFx0XHRcdFx0cmVzb2x2ZTogcmVzb2x2ZSxcblx0XHRcdFx0XHRyZWplY3Q6IHJlamVjdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIudXBsb2FkKCk7XG5cdFx0XHR9KTtcblx0XHRcdEZFQ29udHJvbGxlci5lZGl0Rmxvdy5zeW5jVGFzayh1cGxvYWRQcm9taXNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TWVzc2FnZUJveC5lcnJvcihnZXRSZXNvdXJjZU1vZGVsKGNvbnRyb2xsZXIpLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9BQk9SVEVEX1RFWFRcIikpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVVcGxvYWRDb21wbGV0ZTogZnVuY3Rpb24gKFxuXHRcdGV2ZW50OiBFdmVudCxcblx0XHRwcm9wZXJ0eUZpbGVOYW1lOiB7IHBhdGg6IHN0cmluZyB9IHwgdW5kZWZpbmVkLFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRcdGNvbnRyb2xsZXI6IENvbnRyb2xsZXJcblx0KSB7XG5cdFx0Y29uc3Qgc3RhdHVzID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwic3RhdHVzXCIpLFxuXHRcdFx0ZmlsZVVwbG9hZGVyID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsZVVwbG9hZGVyLFxuXHRcdFx0ZmlsZVdyYXBwZXIgPSBmaWxlVXBsb2FkZXIuZ2V0UGFyZW50KCkgYXMgdW5rbm93biBhcyBGaWxlV3JhcHBlcjtcblxuXHRcdGZpbGVXcmFwcGVyLnNldFVJQnVzeShmYWxzZSk7XG5cblx0XHRjb25zdCBjb250ZXh0ID0gZmlsZVVwbG9hZGVyLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZCB8IG51bGw7XG5cdFx0aWYgKHN0YXR1cyA9PT0gMCB8fCBzdGF0dXMgPj0gNDAwKSB7XG5cdFx0XHR0aGlzLl9kaXNwbGF5TWVzc2FnZUZvckZhaWxlZFVwbG9hZChldmVudCk7XG5cdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXS5yZWplY3QoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbmV3RVRhZyA9IGV2ZW50LmdldFBhcmFtZXRlcihcImhlYWRlcnNcIikuZXRhZztcblxuXHRcdFx0aWYgKG5ld0VUYWcpIHtcblx0XHRcdFx0Ly8gc2V0IG5ldyBldGFnIGZvciBmaWxlbmFtZSB1cGRhdGUsIGJ1dCB3aXRob3V0IHNlbmRpbmcgcGF0Y2ggcmVxdWVzdFxuXHRcdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShcIkBvZGF0YS5ldGFnXCIsIG5ld0VUYWcsIG51bGwgYXMgYW55KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2V0IGZpbGVuYW1lIGZvciBsaW5rIHRleHRcblx0XHRcdGlmIChwcm9wZXJ0eUZpbGVOYW1lPy5wYXRoKSB7XG5cdFx0XHRcdGNvbnRleHQ/LnNldFByb3BlcnR5KHByb3BlcnR5RmlsZU5hbWUucGF0aCwgZmlsZVVwbG9hZGVyLmdldFZhbHVlKCkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbnZhbGlkYXRlIHRoZSBwcm9wZXJ0eSB0aGF0IG5vdCBnZXRzIHVwZGF0ZWQgb3RoZXJ3aXNlXG5cdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIG51bGwsIG51bGwgYXMgYW55KTtcblx0XHRcdGNvbnRleHQ/LnNldFByb3BlcnR5KHByb3BlcnR5UGF0aCwgdW5kZWZpbmVkLCBudWxsIGFzIGFueSk7XG5cblx0XHRcdHRoaXMuX2NhbGxTaWRlRWZmZWN0c0ZvclN0cmVhbShldmVudCwgZmlsZVdyYXBwZXIsIGNvbnRyb2xsZXIpO1xuXG5cdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMudXBsb2FkUHJvbWlzZXNbZmlsZVVwbG9hZGVyLmdldElkKCldO1xuXG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmlsZVVwbG9hZGVyKTtcblx0XHRpZiAoIWlzQ29sbGFib3JhdGlvbkVuYWJsZWQgfHwgIWNvbnRleHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBub3RpZmljYXRpb25EYXRhID0gW2Ake2NvbnRleHQuZ2V0UGF0aCgpfS8ke3Byb3BlcnR5UGF0aH1gXTtcblx0XHRpZiAocHJvcGVydHlGaWxlTmFtZT8ucGF0aCkge1xuXHRcdFx0bm90aWZpY2F0aW9uRGF0YS5wdXNoKGAke2NvbnRleHQuZ2V0UGF0aCgpfS8ke3Byb3BlcnR5RmlsZU5hbWUucGF0aH1gKTtcblx0XHR9XG5cblx0XHRsZXQgYmluZGluZyA9IGNvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdGlmICghYmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KGZpbGVVcGxvYWRlcik7XG5cdFx0XHRiaW5kaW5nID0gKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCkuZ2V0QmluZGluZygpO1xuXHRcdH1cblx0XHRpZiAoYmluZGluZy5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsICgpID0+IHtcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGZpbGVXcmFwcGVyLCBBY3Rpdml0eS5DaGFuZ2UsIG5vdGlmaWNhdGlvbkRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlV3JhcHBlciwgQWN0aXZpdHkuQ2hhbmdlLCBub3RpZmljYXRpb25EYXRhKTtcblx0XHR9XG5cdH0sXG5cblx0X2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBoYW5kbGluZyBvZiBiYWNrZW5kIGVycm9yc1xuXHRcdGNvbnN0IHNFcnJvciA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJyZXNwb25zZVJhd1wiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicmVzcG9uc2VcIik7XG5cdFx0bGV0IHNNZXNzYWdlVGV4dCwgb0Vycm9yO1xuXHRcdHRyeSB7XG5cdFx0XHRvRXJyb3IgPSBzRXJyb3IgJiYgSlNPTi5wYXJzZShzRXJyb3IpO1xuXHRcdFx0c01lc3NhZ2VUZXh0ID0gb0Vycm9yLmVycm9yICYmIG9FcnJvci5lcnJvci5tZXNzYWdlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHNNZXNzYWdlVGV4dCA9IHNFcnJvciB8fCBnZXRSZXNvdXJjZU1vZGVsKG9FdmVudC5nZXRTb3VyY2UoKSkuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX0FCT1JURURfVEVYVFwiKTtcblx0XHR9XG5cdFx0TWVzc2FnZUJveC5lcnJvcihzTWVzc2FnZVRleHQpO1xuXHR9LFxuXG5cdHJlbW92ZVN0cmVhbTogZnVuY3Rpb24gKGV2ZW50OiBFdmVudCwgcHJvcGVydHlGaWxlTmFtZTogeyBwYXRoOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCwgcHJvcGVydHlQYXRoOiBzdHJpbmcsIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIpIHtcblx0XHRjb25zdCBkZWxldGVCdXR0b24gPSBldmVudC5nZXRTb3VyY2UoKSBhcyBCdXR0b247XG5cdFx0Y29uc3QgZmlsZVdyYXBwZXIgPSBkZWxldGVCdXR0b24uZ2V0UGFyZW50KCkgYXMgdW5rbm93biBhcyBGaWxlV3JhcHBlcjtcblx0XHRjb25zdCBjb250ZXh0ID0gZmlsZVdyYXBwZXIuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXG5cdFx0Ly8gc3RyZWFtcyBhcmUgcmVtb3ZlZCBieSBhc3NpZ25pbmcgdGhlIG51bGwgdmFsdWVcblx0XHRjb250ZXh0LnNldFByb3BlcnR5KHByb3BlcnR5UGF0aCwgbnVsbCk7XG5cdFx0Ly8gV2hlbiBzZXR0aW5nIHRoZSBwcm9wZXJ0eSB0byBudWxsLCB0aGUgdXBsb2FkVXJsIChAQE1PREVMLmZvcm1hdCkgaXMgc2V0IHRvIFwiXCIgYnkgdGhlIG1vZGVsXG5cdFx0Ly9cdHdpdGggdGhhdCBhbm90aGVyIHVwbG9hZCBpcyBub3QgcG9zc2libGUgYmVmb3JlIHJlZnJlc2hpbmcgdGhlIHBhZ2Vcblx0XHQvLyAocmVmcmVzaGluZyB0aGUgcGFnZSB3b3VsZCByZWNyZWF0ZSB0aGUgVVJMKVxuXHRcdC8vXHRUaGlzIGlzIHRoZSB3b3JrYXJvdW5kOlxuXHRcdC8vXHRXZSBzZXQgdGhlIHByb3BlcnR5IHRvIHVuZGVmaW5lZCBvbmx5IG9uIHRoZSBmcm9udGVuZCB3aGljaCB3aWxsIHJlY3JlYXRlIHRoZSB1cGxvYWRVcmxcblx0XHRjb250ZXh0LnNldFByb3BlcnR5KHByb3BlcnR5UGF0aCwgdW5kZWZpbmVkLCBudWxsIGFzIGFueSk7XG5cblx0XHR0aGlzLl9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW0oZXZlbnQsIGZpbGVXcmFwcGVyLCBjb250cm9sbGVyKTtcblxuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZGVsZXRlQnV0dG9uKTtcblx0XHRpZiAoYkNvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRsZXQgYmluZGluZyA9IGNvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0aWYgKCFiaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhkZWxldGVCdXR0b24pO1xuXHRcdFx0XHRiaW5kaW5nID0gKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCkuZ2V0QmluZGluZygpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBkYXRhID0gW2Ake2NvbnRleHQuZ2V0UGF0aCgpfS8ke3Byb3BlcnR5UGF0aH1gXTtcblx0XHRcdGlmIChwcm9wZXJ0eUZpbGVOYW1lPy5wYXRoKSB7XG5cdFx0XHRcdGRhdGEucHVzaChgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eUZpbGVOYW1lLnBhdGh9YCk7XG5cdFx0XHR9XG5cdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZGVsZXRlQnV0dG9uLCBBY3Rpdml0eS5MaXZlQ2hhbmdlLCBkYXRhKTtcblxuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChkZWxldGVCdXR0b24sIEFjdGl2aXR5LkNoYW5nZSwgZGF0YSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbGxTaWRlRWZmZWN0c0ZvclN0cmVhbTogZnVuY3Rpb24gKG9FdmVudDogYW55LCBvQ29udHJvbDogYW55LCBvQ29udHJvbGxlcjogYW55KSB7XG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cdFx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KCkuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2wpIHtcblx0XHRcdG9FdmVudC5vU291cmNlID0gb0NvbnRyb2w7XG5cdFx0fVxuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkQ2hhbmdlKG9FdmVudCwgdGhpcy5nZXRGaWVsZFN0YXRlT25DaGFuZ2Uob0V2ZW50KS5zdGF0ZVtcInZhbGlkaXR5XCJdKTtcblx0fSxcblxuXHRnZXRJY29uRm9yTWltZVR5cGU6IGZ1bmN0aW9uIChzTWltZVR5cGU6IGFueSkge1xuXHRcdHJldHVybiBJY29uUG9vbC5nZXRJY29uRm9yTWltZVR5cGUoc01pbWVUeXBlKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHJpZXZlIHRleHQgZnJvbSB2YWx1ZSBsaXN0IGZvciBEYXRhRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlWYWx1ZSBUaGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGRhdGFmaWVsZFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5RnVsbFBhdGggVGhlIHByb3BlcnR5IGZ1bGwgcGF0aCdzXG5cdCAqIEBwYXJhbSBzRGlzcGxheUZvcm1hdCBUaGUgZGlzcGxheSBmb3JtYXQgZm9yIHRoZSBkYXRhZmllbGRcblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCB2YWx1ZSBpbiBjb3JyZXNwb25kaW5nIGRpc3BsYXkgZm9ybWF0LlxuXHQgKi9cblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdDogZnVuY3Rpb24gKHNQcm9wZXJ0eVZhbHVlOiBzdHJpbmcsIHNQcm9wZXJ0eUZ1bGxQYXRoOiBzdHJpbmcsIHNEaXNwbGF5Rm9ybWF0OiBzdHJpbmcpIHtcblx0XHRsZXQgc1RleHRQcm9wZXJ0eTogc3RyaW5nO1xuXHRcdGxldCBvTWV0YU1vZGVsO1xuXHRcdGxldCBzUHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdFx0aWYgKHNQcm9wZXJ0eVZhbHVlKSB7XG5cdFx0XHRvTWV0YU1vZGVsID0gQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0c1Byb3BlcnR5TmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQcm9wZXJ0eUZ1bGxQYXRofUBzYXB1aS5uYW1lYCk7XG5cdFx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0XHQucmVxdWVzdFZhbHVlTGlzdEluZm8oc1Byb3BlcnR5RnVsbFBhdGgsIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChtVmFsdWVMaXN0SW5mbzogYW55KSB7XG5cdFx0XHRcdFx0Ly8gdGFrZSB0aGUgXCJcIiBvbmUgaWYgZXhpc3RzLCBvdGhlcndpc2UgdGFrZSB0aGUgZmlyc3Qgb25lIGluIHRoZSBvYmplY3QgVE9ETzogdG8gYmUgZGlzY3Vzc2VkXG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlTGlzdEluZm8gPSBtVmFsdWVMaXN0SW5mb1ttVmFsdWVMaXN0SW5mb1tcIlwiXSA/IFwiXCIgOiBPYmplY3Qua2V5cyhtVmFsdWVMaXN0SW5mbylbMF1dO1xuXHRcdFx0XHRcdGNvbnN0IG9WYWx1ZUxpc3RNb2RlbCA9IG9WYWx1ZUxpc3RJbmZvLiRtb2RlbDtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsVmFsdWVMaXN0ID0gb1ZhbHVlTGlzdE1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGNvbnN0IG9QYXJhbVdpdGhLZXkgPSBvVmFsdWVMaXN0SW5mby5QYXJhbWV0ZXJzLmZpbmQoZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkgJiYgb1BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoID09PSBzUHJvcGVydHlOYW1lO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChvUGFyYW1XaXRoS2V5ICYmICFvUGFyYW1XaXRoS2V5LlZhbHVlTGlzdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYEluY29uc2lzdGVudCB2YWx1ZSBoZWxwIGFubm90YXRpb24gZm9yICR7c1Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb01ldGFNb2RlbFZhbHVlTGlzdC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0XHRgLyR7b1ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7b1BhcmFtV2l0aEtleS5WYWx1ZUxpc3RQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGlmIChvVGV4dEFubm90YXRpb24gJiYgb1RleHRBbm5vdGF0aW9uLiRQYXRoKSB7XG5cdFx0XHRcdFx0XHRzVGV4dFByb3BlcnR5ID0gb1RleHRBbm5vdGF0aW9uLiRQYXRoO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0XHRwYXRoOiBvUGFyYW1XaXRoS2V5LlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdFx0XHR2YWx1ZTE6IHNQcm9wZXJ0eVZhbHVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9WYWx1ZUxpc3RNb2RlbC5iaW5kTGlzdChgLyR7b1ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9GaWx0ZXIsIHtcblx0XHRcdFx0XHRcdFx0JHNlbGVjdDogc1RleHRQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0Rpc3BsYXlGb3JtYXQgPSBcIlZhbHVlXCI7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYUNvbnRleHRzOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzRGVzY3JpcHRpb24gPSBzVGV4dFByb3BlcnR5ID8gYUNvbnRleHRzWzBdPy5nZXRPYmplY3QoKVtzVGV4dFByb3BlcnR5XSA6IFwiXCI7XG5cdFx0XHRcdFx0c3dpdGNoIChzRGlzcGxheUZvcm1hdCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzRGVzY3JpcHRpb247XG5cdFx0XHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiQ19GT1JNQVRfRk9SX1RFWFRfQVJSQU5HRU1FTlRcIiwgW1xuXHRcdFx0XHRcdFx0XHRcdHNEZXNjcmlwdGlvbixcblx0XHRcdFx0XHRcdFx0XHRzUHJvcGVydHlWYWx1ZVxuXHRcdFx0XHRcdFx0XHRdKTtcblx0XHRcdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0ZPUk1BVF9GT1JfVEVYVF9BUlJBTkdFTUVOVFwiLCBbXG5cdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWUsXG5cdFx0XHRcdFx0XHRcdFx0c0Rlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNNc2cgPVxuXHRcdFx0XHRcdFx0b0Vycm9yLnN0YXR1cyAmJiBvRXJyb3Iuc3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdFx0PyBgTWV0YWRhdGEgbm90IGZvdW5kICgke29FcnJvci5zdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3NQcm9wZXJ0eUZ1bGxQYXRofWBcblx0XHRcdFx0XHRcdFx0OiBvRXJyb3IubWVzc2FnZTtcblx0XHRcdFx0XHRMb2cuZXJyb3Ioc01zZyk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdH0sXG5cblx0aGFuZGxlVHlwZU1pc3NtYXRjaDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob0V2ZW50LmdldFNvdXJjZSgpKTtcblx0XHRNZXNzYWdlQm94LmVycm9yKHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX1dST05HX01JTUVUWVBFXCIpLCB7XG5cdFx0XHRkZXRhaWxzOlxuXHRcdFx0XHRgPHA+PHN0cm9uZz4ke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX1dST05HX01JTUVUWVBFX0RFVEFJTFNfU0VMRUNURURcIil9PC9zdHJvbmc+PC9wPiR7XG5cdFx0XHRcdFx0b0V2ZW50LmdldFBhcmFtZXRlcnMoKS5taW1lVHlwZVxuXHRcdFx0XHR9PGJyPjxicj5gICtcblx0XHRcdFx0YDxwPjxzdHJvbmc+JHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRV9ERVRBSUxTX0FMTE9XRURcIil9PC9zdHJvbmc+PC9wPiR7b0V2ZW50XG5cdFx0XHRcdFx0LmdldFNvdXJjZSgpXG5cdFx0XHRcdFx0LmdldE1pbWVUeXBlKClcblx0XHRcdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0XHRcdC5yZXBsYWNlQWxsKFwiLFwiLCBcIiwgXCIpfWAsXG5cdFx0XHRjb250ZW50V2lkdGg6IFwiMTUwcHhcIlxuXHRcdH0gYXMgYW55KTtcblx0fSxcblxuXHRoYW5kbGVGaWxlU2l6ZUV4Y2VlZDogZnVuY3Rpb24gKG9FdmVudDogYW55IC8qaUZpbGVTaXplOiBhbnkqLykge1xuXHRcdE1lc3NhZ2VCb3guZXJyb3IoXG5cdFx0XHRnZXRSZXNvdXJjZU1vZGVsKG9FdmVudC5nZXRTb3VyY2UoKSkuZ2V0VGV4dChcblx0XHRcdFx0XCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9GSUxFX1RPT19CSUdcIixcblx0XHRcdFx0b0V2ZW50LmdldFNvdXJjZSgpLmdldE1heGltdW1GaWxlU2l6ZSgpLnRvRml4ZWQoMylcblx0XHRcdCksXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRlbnRXaWR0aDogXCIxNTBweFwiXG5cdFx0XHR9IGFzIGFueVxuXHRcdCk7XG5cdH0sXG5cblx0X2dldEV4dGVuc2lvbkNvbnRyb2xsZXI6IGZ1bmN0aW9uIChvQ29udHJvbGxlcjogYW55KSB7XG5cdFx0cmV0dXJuIG9Db250cm9sbGVyLmlzQShcInNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSVwiKSA/IG9Db250cm9sbGVyLl9jb250cm9sbGVyIDogb0NvbnRyb2xsZXI7XG5cdH1cbn07XG5cbi8qKlxuICogQGdsb2JhbFxuICovXG5leHBvcnQgZGVmYXVsdCBGaWVsZFJ1bnRpbWU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQW9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSx1QkFBdUIsQ0FBQ0MsS0FBYyxFQUEwQztJQUN4RixJQUFJQyxPQUFPLEdBQUlELEtBQUssQ0FBQ0UsaUJBQWlCLEVBQUUsQ0FBYUMsVUFBVSxFQUFFO0lBRWpFLElBQUksQ0FBQ0YsT0FBTyxDQUFDRyxHQUFHLENBQUMsd0NBQXdDLENBQUMsRUFBRTtNQUMzRCxNQUFNQyxLQUFLLEdBQUdDLFdBQVcsQ0FBQ0MsYUFBYSxDQUFDUCxLQUFLLENBQUM7TUFDOUNDLE9BQU8sR0FBSUksS0FBSyxDQUFDSCxpQkFBaUIsRUFBRSxDQUFhQyxVQUFVLEVBQUU7SUFDOUQ7SUFFQSxPQUFPRixPQUFPO0VBQ2Y7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTU8sWUFBWSxHQUFHO0lBQ3BCQyxtQkFBbUIsRUFBRUMsU0FBZ0I7SUFDckNDLGNBQWMsRUFBRUQsU0FBZ0I7SUFFaEM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0UsNkJBQTZCLEVBQUUsVUFBVUMsT0FBZ0IsRUFBRUMsV0FBMkIsRUFBRUMsUUFBZ0IsRUFBRTtNQUN6RyxJQUFJRCxXQUFXLENBQUNFLFFBQVEsRUFBRTtRQUN6QixJQUFJQyxlQUFlLEdBQUdKLE9BQU8sQ0FBQ1gsaUJBQWlCLEVBQWE7UUFDNUQsTUFBTUcsS0FBSyxHQUFHQyxXQUFXLENBQUNDLGFBQWEsQ0FBQ00sT0FBTyxDQUFDO1VBQy9DSyxVQUFVLEdBQUdELGVBQWUsQ0FBQ0UsUUFBUSxFQUFFLENBQUNDLFlBQVksRUFBRTtVQUN0REMsVUFBVSxHQUFHLFVBQVVDLFFBQWMsRUFBRTtZ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