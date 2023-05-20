/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (CommonUtils, messageHandling, ClassSupport, Core, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * A controller extension offering message handling.
   *
   * @hideconstructor
   * @public
   * @experimental As of version 1.90.0
   * @since 1.90.0
   */
  let MessageHandler = (_dec = defineUI5Class("sap.fe.core.controllerextensions.MessageHandler"), _dec2 = privateExtension(), _dec3 = extensible(OverrideExecution.Instead), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(MessageHandler, _ControllerExtension);
    function MessageHandler() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = MessageHandler.prototype;
    /**
     * Determines whether or not bound messages are shown in the message dialog.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * If the bound messages are shown to the user with a different control like the (TODO:Link) MessageButton
     * this method has to be overridden.
     *
     * @returns Determines whether or not bound messages are shown in the message dialog.
     * @private
     */
    _proto.getShowBoundMessagesInMessageDialog = function getShowBoundMessagesInMessageDialog() {
      return true;
    }

    /**
     * Shows a message dialog with transition messages if there are any.
     * The message dialog is shown as a modal dialog. Once the user confirms the dialog, all transition messages
     * are removed from the message model. If there is more than one message, a list of messages is shown. The user
     * can filter on message types and can display details as well as the long text. If there is one message,
     * the dialog immediately shows the details of the message. If there is just one success message, a message
     * toast is shown instead.
     *
     * @param mParameters PRIVATE
     * @returns A promise that is resolved once the user closes the dialog. If there are no messages
     * to be shown, the promise is resolved immediately
     * @alias sap.fe.core.controllerextensions.MessageHandler#showMessageDialog
     * @public
     * @experimental As of version 1.90.0
     * @since 1.90.0
     */;
    _proto.showMessageDialog = function showMessageDialog(mParameters) {
      const customMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : undefined,
        oOPInternalBindingContext = this.base.getView().getBindingContext("internal");
      const viewType = this.base.getView().getViewData().converterType;
      // set isActionParameterDialog open so that it can be used in the controller extension to decide whether message dialog should open or not
      if (mParameters && mParameters.isActionParameterDialogOpen && oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", true);
      }
      const bShowBoundMessages = this.getShowBoundMessagesInMessageDialog();
      const oBindingContext = mParameters && mParameters.context ? mParameters.context : this.getView().getBindingContext();
      //const bEtagMessage = mParameters && mParameters.bHasEtagMessage;
      // reset  isActionParameterDialogOpen
      // cannot do this operations.js since it is not aware of the view
      if (oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", false);
      }
      return new Promise(function (resolve, reject) {
        // we have to set a timeout to be able to access the most recent messages
        setTimeout(function () {
          // TODO: great API - will be changed later
          messageHandling.showUnboundMessages(customMessages, oBindingContext, bShowBoundMessages, mParameters === null || mParameters === void 0 ? void 0 : mParameters.concurrentEditFlag, mParameters === null || mParameters === void 0 ? void 0 : mParameters.control, mParameters === null || mParameters === void 0 ? void 0 : mParameters.sActionName, undefined, mParameters === null || mParameters === void 0 ? void 0 : mParameters.onBeforeShowMessage, viewType).then(resolve).catch(reject);
        }, 0);
      });
    }

    /**
     * You can remove the existing transition message from the message model with this method.
     * With every user interaction that causes server communication (like clicking on an action, changing data),
     * this method removes the existing transition messages from the message model.
     *
     * @param [keepBoundMessage] Checks if the bound transition messages are not to be removed
     * @param keepUnboundMessage
     * @param sPathToBeRemoved
     * @alias sap.fe.core.controllerextensions.MessageHandler#removesTransitionMessages
     * @private
     */;
    _proto.removeTransitionMessages = function removeTransitionMessages(keepBoundMessage, keepUnboundMessage, sPathToBeRemoved) {
      if (!keepBoundMessage) {
        messageHandling.removeBoundTransitionMessages(sPathToBeRemoved);
      }
      if (!keepUnboundMessage) {
        messageHandling.removeUnboundTransitionMessages();
      }
    }

    /**
     * Method that returns all the parameters needed to handle the navigation to the error page.
     *
     * @param mParameters
     * @returns The parameters necessary for the navigation to the error page
     * @alias sap.fe.core.controllerextensions.MessageHandler#_checkNavigationToErrorPage
     * @private
     */;
    _proto._checkNavigationToErrorPage = function _checkNavigationToErrorPage(mParameters) {
      const aUnboundMessages = messageHandling.getMessages();
      const bShowBoundTransitionMessages = this.getShowBoundMessagesInMessageDialog();
      const aBoundTransitionMessages = bShowBoundTransitionMessages ? messageHandling.getMessages(true, true) : [];
      const aCustomMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : [];
      const bIsStickyEditMode = CommonUtils.isStickyEditMode(this.base.getView());
      let mMessagePageParameters;

      // TODO: Stick mode check is okay as long as the controller extension is used with sap.fe.core and sap.fe.core.AppComponent.
      // It might be better to provide an extension to the consumer of the controller extension to provide this value.

      // The message page can only show 1 message today, so we navigate to it when :
      // 1. There are no bound transition messages to show,
      // 2. There are no custom messages to show, &
      // 3. There is exactly 1 unbound message in the message model with statusCode=503 and retry-After available
      // 4. retryAfter is greater than 120 seconds
      //
      // In Addition, navigating away from a sticky session will destroy the session so we do not navigate to message page for now.
      // TODO: check if navigation should be done in sticky edit mode.
      if (mParameters && mParameters.isDataReceivedError) {
        mMessagePageParameters = {
          title: mParameters.title,
          description: mParameters.description,
          navigateBackToOrigin: true,
          errorType: "PageNotFound"
        };
      } else if (!bIsStickyEditMode && !aBoundTransitionMessages.length && !aCustomMessages.length && (aUnboundMessages.length === 1 || mParameters && mParameters.isInitialLoad503Error)) {
        const oMessage = aUnboundMessages[0],
          oTechnicalDetails = oMessage.getTechnicalDetails();
        let sRetryAfterMessage;
        if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503) {
          if (oTechnicalDetails.retryAfter) {
            const iSecondsBeforeRetry = this._getSecondsBeforeRetryAfter(oTechnicalDetails.retryAfter);
            if (iSecondsBeforeRetry > 120) {
              // TODO: For now let's keep getRetryAfterMessage in messageHandling because it is needed also by the dialog.
              // We can plan to move this and the dialog logic both to messageHandler controller extension if required.
              sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
              mMessagePageParameters = {
                description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
                navigateBackToOrigin: true,
                errorType: "UnableToLoad"
              };
            }
          } else {
            sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
            mMessagePageParameters = {
              description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
              navigateBackToOrigin: true,
              errorType: "UnableToLoad"
            };
          }
        }
      }
      return mMessagePageParameters;
    };
    _proto._getSecondsBeforeRetryAfter = function _getSecondsBeforeRetryAfter(dRetryAfter) {
      const dCurrentDateTime = new Date(),
        iCurrentDateTimeInMilliSeconds = dCurrentDateTime.getTime(),
        iRetryAfterDateTimeInMilliSeconds = dRetryAfter.getTime(),
        iSecondsBeforeRetry = (iRetryAfterDateTimeInMilliSeconds - iCurrentDateTimeInMilliSeconds) / 1000;
      return iSecondsBeforeRetry;
    }

    /**
     * Shows a message page or a message dialog based on the messages in the message dialog.
     *
     * @param [mParameters]
     * @returns A promise that is resolved once the user closes the message dialog or when navigation to the message page is complete. If there are no messages
     * to be shown, the promise is resolved immediately
     * @private
     */;
    _proto.showMessages = async function showMessages(mParameters) {
      const oAppComponent = CommonUtils.getAppComponent(this.getView());
      let mMessagePageParameters;
      if (!oAppComponent._isFclEnabled()) {
        mMessagePageParameters = this._checkNavigationToErrorPage(mParameters);
      }
      if (mMessagePageParameters) {
        // navigate to message page.
        // handler before page navigation is triggered, for example to close the action parameter dialog
        if (mParameters && mParameters.messagePageNavigationCallback) {
          mParameters.messagePageNavigationCallback();
        }
        mMessagePageParameters.handleShellBack = !(mParameters && mParameters.shellBack);
        // TODO: Use Illustrated message instead of normal message page
        // TODO: Return value needs to provided but since this function is private for now hence we can skip this.
        this.removeTransitionMessages();
        const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
        if (this.base._routing) {
          return new Promise((resolve, reject) => {
            // we have to set a timeout to be able to access the most recent messages
            setTimeout(() => {
              // TODO: great API - will be changed later
              this.base._routing.navigateToMessagePage(mParameters && mParameters.isDataReceivedError ? oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR") : oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"), mMessagePageParameters).then(resolve).catch(reject);
            }, 0);
          });
        }
      } else {
        // navigate to message dialog
        return this.showMessageDialog(mParameters);
      }
    };
    return MessageHandler;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessageDialog", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeTransitionMessages", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeTransitionMessages"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessages"), _class2.prototype)), _class2)) || _class);
  return MessageHandler;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlSGFuZGxlciIsImRlZmluZVVJNUNsYXNzIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJtUGFyYW1ldGVycyIsImN1c3RvbU1lc3NhZ2VzIiwidW5kZWZpbmVkIiwib09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImJhc2UiLCJnZXRWaWV3IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ2aWV3VHlwZSIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiIsInNldFByb3BlcnR5IiwiYlNob3dCb3VuZE1lc3NhZ2VzIiwib0JpbmRpbmdDb250ZXh0IiwiY29udGV4dCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2V0VGltZW91dCIsIm1lc3NhZ2VIYW5kbGluZyIsInNob3dVbmJvdW5kTWVzc2FnZXMiLCJjb25jdXJyZW50RWRpdEZsYWciLCJjb250cm9sIiwic0FjdGlvbk5hbWUiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwidGhlbiIsImNhdGNoIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwia2VlcEJvdW5kTWVzc2FnZSIsImtlZXBVbmJvdW5kTWVzc2FnZSIsInNQYXRoVG9CZVJlbW92ZWQiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJfY2hlY2tOYXZpZ2F0aW9uVG9FcnJvclBhZ2UiLCJhVW5ib3VuZE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZXMiLCJiU2hvd0JvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUN1c3RvbU1lc3NhZ2VzIiwiYklzU3RpY2t5RWRpdE1vZGUiLCJDb21tb25VdGlscyIsImlzU3RpY2t5RWRpdE1vZGUiLCJtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzIiwiaXNEYXRhUmVjZWl2ZWRFcnJvciIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJuYXZpZ2F0ZUJhY2tUb09yaWdpbiIsImVycm9yVHlwZSIsImxlbmd0aCIsImlzSW5pdGlhbExvYWQ1MDNFcnJvciIsIm9NZXNzYWdlIiwib1RlY2huaWNhbERldGFpbHMiLCJnZXRUZWNobmljYWxEZXRhaWxzIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwiaHR0cFN0YXR1cyIsInJldHJ5QWZ0ZXIiLCJpU2Vjb25kc0JlZm9yZVJldHJ5IiwiX2dldFNlY29uZHNCZWZvcmVSZXRyeUFmdGVyIiwiZ2V0UmV0cnlBZnRlck1lc3NhZ2UiLCJnZXRNZXNzYWdlIiwiZFJldHJ5QWZ0ZXIiLCJkQ3VycmVudERhdGVUaW1lIiwiRGF0ZSIsImlDdXJyZW50RGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyIsImdldFRpbWUiLCJpUmV0cnlBZnRlckRhdGVUaW1lSW5NaWxsaVNlY29uZHMiLCJzaG93TWVzc2FnZXMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiX2lzRmNsRW5hYmxlZCIsIm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrIiwiaGFuZGxlU2hlbGxCYWNrIiwic2hlbGxCYWNrIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIl9yb3V0aW5nIiwibmF2aWdhdGVUb01lc3NhZ2VQYWdlIiwiZ2V0VGV4dCIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1lc3NhZ2VIYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG50eXBlIE9iamVjdFdpdGhDb252ZXJ0ZXJUeXBlID0gb2JqZWN0ICYge1xuXHRjb252ZXJ0ZXJUeXBlOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgbWVzc2FnZSBoYW5kbGluZy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45MC4wXG4gKiBAc2luY2UgMS45MC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLk1lc3NhZ2VIYW5kbGVyXCIpXG5jbGFzcyBNZXNzYWdlSGFuZGxlciBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcm90ZWN0ZWQgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IGJvdW5kIG1lc3NhZ2VzIGFyZSBzaG93biBpbiB0aGUgbWVzc2FnZSBkaWFsb2cuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkfS5cblx0ICpcblx0ICogSWYgdGhlIGJvdW5kIG1lc3NhZ2VzIGFyZSBzaG93biB0byB0aGUgdXNlciB3aXRoIGEgZGlmZmVyZW50IGNvbnRyb2wgbGlrZSB0aGUgKFRPRE86TGluaykgTWVzc2FnZUJ1dHRvblxuXHQgKiB0aGlzIG1ldGhvZCBoYXMgdG8gYmUgb3ZlcnJpZGRlbi5cblx0ICpcblx0ICogQHJldHVybnMgRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBib3VuZCBtZXNzYWdlcyBhcmUgc2hvd24gaW4gdGhlIG1lc3NhZ2UgZGlhbG9nLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRnZXRTaG93Qm91bmRNZXNzYWdlc0luTWVzc2FnZURpYWxvZygpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyBhIG1lc3NhZ2UgZGlhbG9nIHdpdGggdHJhbnNpdGlvbiBtZXNzYWdlcyBpZiB0aGVyZSBhcmUgYW55LlxuXHQgKiBUaGUgbWVzc2FnZSBkaWFsb2cgaXMgc2hvd24gYXMgYSBtb2RhbCBkaWFsb2cuIE9uY2UgdGhlIHVzZXIgY29uZmlybXMgdGhlIGRpYWxvZywgYWxsIHRyYW5zaXRpb24gbWVzc2FnZXNcblx0ICogYXJlIHJlbW92ZWQgZnJvbSB0aGUgbWVzc2FnZSBtb2RlbC4gSWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBtZXNzYWdlLCBhIGxpc3Qgb2YgbWVzc2FnZXMgaXMgc2hvd24uIFRoZSB1c2VyXG5cdCAqIGNhbiBmaWx0ZXIgb24gbWVzc2FnZSB0eXBlcyBhbmQgY2FuIGRpc3BsYXkgZGV0YWlscyBhcyB3ZWxsIGFzIHRoZSBsb25nIHRleHQuIElmIHRoZXJlIGlzIG9uZSBtZXNzYWdlLFxuXHQgKiB0aGUgZGlhbG9nIGltbWVkaWF0ZWx5IHNob3dzIHRoZSBkZXRhaWxzIG9mIHRoZSBtZXNzYWdlLiBJZiB0aGVyZSBpcyBqdXN0IG9uZSBzdWNjZXNzIG1lc3NhZ2UsIGEgbWVzc2FnZVxuXHQgKiB0b2FzdCBpcyBzaG93biBpbnN0ZWFkLlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgUFJJVkFURVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSB1c2VyIGNsb3NlcyB0aGUgZGlhbG9nLiBJZiB0aGVyZSBhcmUgbm8gbWVzc2FnZXNcblx0ICogdG8gYmUgc2hvd24sIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIGltbWVkaWF0ZWx5XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5NZXNzYWdlSGFuZGxlciNzaG93TWVzc2FnZURpYWxvZ1xuXHQgKiBAcHVibGljXG5cdCAqIEBleHBlcmltZW50YWwgQXMgb2YgdmVyc2lvbiAxLjkwLjBcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHNob3dNZXNzYWdlRGlhbG9nKG1QYXJhbWV0ZXJzPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgY3VzdG9tTWVzc2FnZXMgPSBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5jdXN0b21NZXNzYWdlcyA/IG1QYXJhbWV0ZXJzLmN1c3RvbU1lc3NhZ2VzIDogdW5kZWZpbmVkLFxuXHRcdFx0b09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCB2aWV3VHlwZSA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgT2JqZWN0V2l0aENvbnZlcnRlclR5cGUpLmNvbnZlcnRlclR5cGU7XG5cdFx0Ly8gc2V0IGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIG9wZW4gc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiB0aGUgY29udHJvbGxlciBleHRlbnNpb24gdG8gZGVjaWRlIHdoZXRoZXIgbWVzc2FnZSBkaWFsb2cgc2hvdWxkIG9wZW4gb3Igbm90XG5cdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiAmJiBvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KFwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuXCIsIHRydWUpO1xuXHRcdH1cblx0XHRjb25zdCBiU2hvd0JvdW5kTWVzc2FnZXMgPSB0aGlzLmdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nKCk7XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY29udGV4dCA/IG1QYXJhbWV0ZXJzLmNvbnRleHQgOiB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdC8vY29uc3QgYkV0YWdNZXNzYWdlID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuYkhhc0V0YWdNZXNzYWdlO1xuXHRcdC8vIHJlc2V0ICBpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW5cblx0XHQvLyBjYW5ub3QgZG8gdGhpcyBvcGVyYXRpb25zLmpzIHNpbmNlIGl0IGlzIG5vdCBhd2FyZSBvZiB0aGUgdmlld1xuXHRcdGlmIChvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KFwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuXCIsIGZhbHNlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHQvLyB3ZSBoYXZlIHRvIHNldCBhIHRpbWVvdXQgdG8gYmUgYWJsZSB0byBhY2Nlc3MgdGhlIG1vc3QgcmVjZW50IG1lc3NhZ2VzXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gVE9ETzogZ3JlYXQgQVBJIC0gd2lsbCBiZSBjaGFuZ2VkIGxhdGVyXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZ1xuXHRcdFx0XHRcdC5zaG93VW5ib3VuZE1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0XHRiU2hvd0JvdW5kTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycz8uY29uY3VycmVudEVkaXRGbGFnLFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmNvbnRyb2wsXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycz8uc0FjdGlvbk5hbWUsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycz8ub25CZWZvcmVTaG93TWVzc2FnZSxcblx0XHRcdFx0XHRcdHZpZXdUeXBlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC50aGVuKHJlc29sdmUpXG5cdFx0XHRcdFx0LmNhdGNoKHJlamVjdCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBZb3UgY2FuIHJlbW92ZSB0aGUgZXhpc3RpbmcgdHJhbnNpdGlvbiBtZXNzYWdlIGZyb20gdGhlIG1lc3NhZ2UgbW9kZWwgd2l0aCB0aGlzIG1ldGhvZC5cblx0ICogV2l0aCBldmVyeSB1c2VyIGludGVyYWN0aW9uIHRoYXQgY2F1c2VzIHNlcnZlciBjb21tdW5pY2F0aW9uIChsaWtlIGNsaWNraW5nIG9uIGFuIGFjdGlvbiwgY2hhbmdpbmcgZGF0YSksXG5cdCAqIHRoaXMgbWV0aG9kIHJlbW92ZXMgdGhlIGV4aXN0aW5nIHRyYW5zaXRpb24gbWVzc2FnZXMgZnJvbSB0aGUgbWVzc2FnZSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIFtrZWVwQm91bmRNZXNzYWdlXSBDaGVja3MgaWYgdGhlIGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgYXJlIG5vdCB0byBiZSByZW1vdmVkXG5cdCAqIEBwYXJhbSBrZWVwVW5ib3VuZE1lc3NhZ2Vcblx0ICogQHBhcmFtIHNQYXRoVG9CZVJlbW92ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLk1lc3NhZ2VIYW5kbGVyI3JlbW92ZXNUcmFuc2l0aW9uTWVzc2FnZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoa2VlcEJvdW5kTWVzc2FnZT86IGJvb2xlYW4sIGtlZXBVbmJvdW5kTWVzc2FnZT86IGJvb2xlYW4sIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIWtlZXBCb3VuZE1lc3NhZ2UpIHtcblx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyhzUGF0aFRvQmVSZW1vdmVkKTtcblx0XHR9XG5cdFx0aWYgKCFrZWVwVW5ib3VuZE1lc3NhZ2UpIHtcblx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgYWxsIHRoZSBwYXJhbWV0ZXJzIG5lZWRlZCB0byBoYW5kbGUgdGhlIG5hdmlnYXRpb24gdG8gdGhlIGVycm9yIHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBUaGUgcGFyYW1ldGVycyBuZWNlc3NhcnkgZm9yIHRoZSBuYXZpZ2F0aW9uIHRvIHRoZSBlcnJvciBwYWdlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5NZXNzYWdlSGFuZGxlciNfY2hlY2tOYXZpZ2F0aW9uVG9FcnJvclBhZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9jaGVja05hdmlnYXRpb25Ub0Vycm9yUGFnZShtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Y29uc3QgYVVuYm91bmRNZXNzYWdlcyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcygpO1xuXHRcdGNvbnN0IGJTaG93Qm91bmRUcmFuc2l0aW9uTWVzc2FnZXMgPSB0aGlzLmdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nKCk7XG5cdFx0Y29uc3QgYUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzID0gYlNob3dCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyA/IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcyh0cnVlLCB0cnVlKSA6IFtdO1xuXHRcdGNvbnN0IGFDdXN0b21NZXNzYWdlcyA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmN1c3RvbU1lc3NhZ2VzID8gbVBhcmFtZXRlcnMuY3VzdG9tTWVzc2FnZXMgOiBbXTtcblx0XHRjb25zdCBiSXNTdGlja3lFZGl0TW9kZSA9IENvbW1vblV0aWxzLmlzU3RpY2t5RWRpdE1vZGUodGhpcy5iYXNlLmdldFZpZXcoKSk7XG5cdFx0bGV0IG1NZXNzYWdlUGFnZVBhcmFtZXRlcnM7XG5cblx0XHQvLyBUT0RPOiBTdGljayBtb2RlIGNoZWNrIGlzIG9rYXkgYXMgbG9uZyBhcyB0aGUgY29udHJvbGxlciBleHRlbnNpb24gaXMgdXNlZCB3aXRoIHNhcC5mZS5jb3JlIGFuZCBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQuXG5cdFx0Ly8gSXQgbWlnaHQgYmUgYmV0dGVyIHRvIHByb3ZpZGUgYW4gZXh0ZW5zaW9uIHRvIHRoZSBjb25zdW1lciBvZiB0aGUgY29udHJvbGxlciBleHRlbnNpb24gdG8gcHJvdmlkZSB0aGlzIHZhbHVlLlxuXG5cdFx0Ly8gVGhlIG1lc3NhZ2UgcGFnZSBjYW4gb25seSBzaG93IDEgbWVzc2FnZSB0b2RheSwgc28gd2UgbmF2aWdhdGUgdG8gaXQgd2hlbiA6XG5cdFx0Ly8gMS4gVGhlcmUgYXJlIG5vIGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgdG8gc2hvdyxcblx0XHQvLyAyLiBUaGVyZSBhcmUgbm8gY3VzdG9tIG1lc3NhZ2VzIHRvIHNob3csICZcblx0XHQvLyAzLiBUaGVyZSBpcyBleGFjdGx5IDEgdW5ib3VuZCBtZXNzYWdlIGluIHRoZSBtZXNzYWdlIG1vZGVsIHdpdGggc3RhdHVzQ29kZT01MDMgYW5kIHJldHJ5LUFmdGVyIGF2YWlsYWJsZVxuXHRcdC8vIDQuIHJldHJ5QWZ0ZXIgaXMgZ3JlYXRlciB0aGFuIDEyMCBzZWNvbmRzXG5cdFx0Ly9cblx0XHQvLyBJbiBBZGRpdGlvbiwgbmF2aWdhdGluZyBhd2F5IGZyb20gYSBzdGlja3kgc2Vzc2lvbiB3aWxsIGRlc3Ryb3kgdGhlIHNlc3Npb24gc28gd2UgZG8gbm90IG5hdmlnYXRlIHRvIG1lc3NhZ2UgcGFnZSBmb3Igbm93LlxuXHRcdC8vIFRPRE86IGNoZWNrIGlmIG5hdmlnYXRpb24gc2hvdWxkIGJlIGRvbmUgaW4gc3RpY2t5IGVkaXQgbW9kZS5cblx0XHRpZiAobVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuaXNEYXRhUmVjZWl2ZWRFcnJvcikge1xuXHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0dGl0bGU6IG1QYXJhbWV0ZXJzLnRpdGxlLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24sXG5cdFx0XHRcdG5hdmlnYXRlQmFja1RvT3JpZ2luOiB0cnVlLFxuXHRcdFx0XHRlcnJvclR5cGU6IFwiUGFnZU5vdEZvdW5kXCJcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdCFiSXNTdGlja3lFZGl0TW9kZSAmJlxuXHRcdFx0IWFCb3VuZFRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggJiZcblx0XHRcdCFhQ3VzdG9tTWVzc2FnZXMubGVuZ3RoICYmXG5cdFx0XHQoYVVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDEgfHwgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzSW5pdGlhbExvYWQ1MDNFcnJvcikpXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBvTWVzc2FnZSA9IGFVbmJvdW5kTWVzc2FnZXNbMF0sXG5cdFx0XHRcdG9UZWNobmljYWxEZXRhaWxzID0gb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscygpO1xuXHRcdFx0bGV0IHNSZXRyeUFmdGVyTWVzc2FnZTtcblx0XHRcdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA1MDMpIHtcblx0XHRcdFx0aWYgKG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRcdFx0XHRjb25zdCBpU2Vjb25kc0JlZm9yZVJldHJ5ID0gdGhpcy5fZ2V0U2Vjb25kc0JlZm9yZVJldHJ5QWZ0ZXIob1RlY2huaWNhbERldGFpbHMucmV0cnlBZnRlcik7XG5cdFx0XHRcdFx0aWYgKGlTZWNvbmRzQmVmb3JlUmV0cnkgPiAxMjApIHtcblx0XHRcdFx0XHRcdC8vIFRPRE86IEZvciBub3cgbGV0J3Mga2VlcCBnZXRSZXRyeUFmdGVyTWVzc2FnZSBpbiBtZXNzYWdlSGFuZGxpbmcgYmVjYXVzZSBpdCBpcyBuZWVkZWQgYWxzbyBieSB0aGUgZGlhbG9nLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuIHBsYW4gdG8gbW92ZSB0aGlzIGFuZCB0aGUgZGlhbG9nIGxvZ2ljIGJvdGggdG8gbWVzc2FnZUhhbmRsZXIgY29udHJvbGxlciBleHRlbnNpb24gaWYgcmVxdWlyZWQuXG5cdFx0XHRcdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNSZXRyeUFmdGVyTWVzc2FnZSA/IGAke3NSZXRyeUFmdGVyTWVzc2FnZX0gJHtvTWVzc2FnZS5nZXRNZXNzYWdlKCl9YCA6IG9NZXNzYWdlLmdldE1lc3NhZ2UoKSxcblx0XHRcdFx0XHRcdFx0bmF2aWdhdGVCYWNrVG9PcmlnaW46IHRydWUsXG5cdFx0XHRcdFx0XHRcdGVycm9yVHlwZTogXCJVbmFibGVUb0xvYWRcIlxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gbWVzc2FnZUhhbmRsaW5nLmdldFJldHJ5QWZ0ZXJNZXNzYWdlKG9NZXNzYWdlKTtcblx0XHRcdFx0XHRtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNSZXRyeUFmdGVyTWVzc2FnZSA/IGAke3NSZXRyeUFmdGVyTWVzc2FnZX0gJHtvTWVzc2FnZS5nZXRNZXNzYWdlKCl9YCA6IG9NZXNzYWdlLmdldE1lc3NhZ2UoKSxcblx0XHRcdFx0XHRcdG5hdmlnYXRlQmFja1RvT3JpZ2luOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JUeXBlOiBcIlVuYWJsZVRvTG9hZFwiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbU1lc3NhZ2VQYWdlUGFyYW1ldGVycztcblx0fVxuXG5cdF9nZXRTZWNvbmRzQmVmb3JlUmV0cnlBZnRlcihkUmV0cnlBZnRlcjogYW55KSB7XG5cdFx0Y29uc3QgZEN1cnJlbnREYXRlVGltZSA9IG5ldyBEYXRlKCksXG5cdFx0XHRpQ3VycmVudERhdGVUaW1lSW5NaWxsaVNlY29uZHMgPSBkQ3VycmVudERhdGVUaW1lLmdldFRpbWUoKSxcblx0XHRcdGlSZXRyeUFmdGVyRGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyA9IGRSZXRyeUFmdGVyLmdldFRpbWUoKSxcblx0XHRcdGlTZWNvbmRzQmVmb3JlUmV0cnkgPSAoaVJldHJ5QWZ0ZXJEYXRlVGltZUluTWlsbGlTZWNvbmRzIC0gaUN1cnJlbnREYXRlVGltZUluTWlsbGlTZWNvbmRzKSAvIDEwMDA7XG5cdFx0cmV0dXJuIGlTZWNvbmRzQmVmb3JlUmV0cnk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgYSBtZXNzYWdlIHBhZ2Ugb3IgYSBtZXNzYWdlIGRpYWxvZyBiYXNlZCBvbiB0aGUgbWVzc2FnZXMgaW4gdGhlIG1lc3NhZ2UgZGlhbG9nLlxuXHQgKlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSB1c2VyIGNsb3NlcyB0aGUgbWVzc2FnZSBkaWFsb2cgb3Igd2hlbiBuYXZpZ2F0aW9uIHRvIHRoZSBtZXNzYWdlIHBhZ2UgaXMgY29tcGxldGUuIElmIHRoZXJlIGFyZSBubyBtZXNzYWdlc1xuXHQgKiB0byBiZSBzaG93biwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgaW1tZWRpYXRlbHlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBzaG93TWVzc2FnZXMobVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRsZXQgbU1lc3NhZ2VQYWdlUGFyYW1ldGVyczogYW55O1xuXHRcdGlmICghb0FwcENvbXBvbmVudC5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdG1NZXNzYWdlUGFnZVBhcmFtZXRlcnMgPSB0aGlzLl9jaGVja05hdmlnYXRpb25Ub0Vycm9yUGFnZShtUGFyYW1ldGVycyk7XG5cdFx0fVxuXHRcdGlmIChtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzKSB7XG5cdFx0XHQvLyBuYXZpZ2F0ZSB0byBtZXNzYWdlIHBhZ2UuXG5cdFx0XHQvLyBoYW5kbGVyIGJlZm9yZSBwYWdlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkLCBmb3IgZXhhbXBsZSB0byBjbG9zZSB0aGUgYWN0aW9uIHBhcmFtZXRlciBkaWFsb2dcblx0XHRcdGlmIChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5tZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjaykge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5tZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjaygpO1xuXHRcdFx0fVxuXG5cdFx0XHRtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzLmhhbmRsZVNoZWxsQmFjayA9ICEobVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuc2hlbGxCYWNrKTtcblx0XHRcdC8vIFRPRE86IFVzZSBJbGx1c3RyYXRlZCBtZXNzYWdlIGluc3RlYWQgb2Ygbm9ybWFsIG1lc3NhZ2UgcGFnZVxuXHRcdFx0Ly8gVE9ETzogUmV0dXJuIHZhbHVlIG5lZWRzIHRvIHByb3ZpZGVkIGJ1dCBzaW5jZSB0aGlzIGZ1bmN0aW9uIGlzIHByaXZhdGUgZm9yIG5vdyBoZW5jZSB3ZSBjYW4gc2tpcCB0aGlzLlxuXHRcdFx0dGhpcy5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRpZiAodGhpcy5iYXNlLl9yb3V0aW5nKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIHdlIGhhdmUgdG8gc2V0IGEgdGltZW91dCB0byBiZSBhYmxlIHRvIGFjY2VzcyB0aGUgbW9zdCByZWNlbnQgbWVzc2FnZXNcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdC8vIFRPRE86IGdyZWF0IEFQSSAtIHdpbGwgYmUgY2hhbmdlZCBsYXRlclxuXHRcdFx0XHRcdFx0dGhpcy5iYXNlLl9yb3V0aW5nXG5cdFx0XHRcdFx0XHRcdC5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuaXNEYXRhUmVjZWl2ZWRFcnJvclxuXHRcdFx0XHRcdFx0XHRcdFx0PyBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0RBVEFfUkVDRUlWRURfRVJST1JcIilcblx0XHRcdFx0XHRcdFx0XHRcdDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0XHRcdG1NZXNzYWdlUGFnZVBhcmFtZXRlcnNcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQudGhlbihyZXNvbHZlKVxuXHRcdFx0XHRcdFx0XHQuY2F0Y2gocmVqZWN0KTtcblx0XHRcdFx0XHR9LCAwKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5hdmlnYXRlIHRvIG1lc3NhZ2UgZGlhbG9nXG5cdFx0XHRyZXR1cm4gdGhpcy5zaG93TWVzc2FnZURpYWxvZyhtUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlSGFuZGxlcjtcbiJd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