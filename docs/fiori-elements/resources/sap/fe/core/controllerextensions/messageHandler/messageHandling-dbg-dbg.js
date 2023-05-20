/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ResourceModelHelper", "sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/MessageBox", "sap/m/MessageItem", "sap/m/MessageToast", "sap/m/MessageView", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/IconPool", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter"], function (ResourceModelHelper, Bar, Button, Dialog, FormattedText, MessageBox, MessageItem, MessageToast, MessageView, Text, Core, DateFormat, IconPool, CoreLib, Message, Filter, FilterOperator, JSONModel, Sorter) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  const MessageType = CoreLib.MessageType;
  let aMessageList = [];
  let aMessageDataList = [];
  let aResolveFunctions = [];
  let oDialog;
  let oBackButton;
  let oMessageView;
  function fnFormatTechnicalDetails() {
    let sPreviousGroupName;

    // Insert technical detail if it exists
    function insertDetail(oProperty) {
      return oProperty.property ? "( ${" + oProperty.property + '} ? ("<p>' + oProperty.property.substr(Math.max(oProperty.property.lastIndexOf("/"), oProperty.property.lastIndexOf(".")) + 1) + ' : " + ' + "${" + oProperty.property + '} + "</p>") : "" )' : "";
    }
    // Insert groupname if it exists
    function insertGroupName(oProperty) {
      let sHTML = "";
      if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
        sHTML += "( ${" + oProperty.property + '} ? "<br><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
        sPreviousGroupName = oProperty.groupName;
      }
      return sHTML;
    }

    // List of technical details to be shown
    function getPaths() {
      const sTD = "technicalDetails"; // name of property in message model data for technical details
      return [{
        groupName: "",
        property: `${sTD}/status`
      }, {
        groupName: "",
        property: `${sTD}/statusText`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ComponentId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceRepository`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceVersion`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Analysis`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Note`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/DetailedNote`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ExceptionCategory`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TimeStamp`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TransactionId`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/code`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/message`
      }];
    }
    let sHTML = "Object.keys(" + "${technicalDetails}" + ').length > 0 ? "<h2>Technical Details</h2>" : "" ';
    getPaths().forEach(function (oProperty) {
      sHTML = `${sHTML + insertGroupName(oProperty)}${insertDetail(oProperty)} + `;
    });
    return sHTML;
  }
  function fnFormatDescription() {
    return "(${" + 'description} ? ("<h2>Description</h2>" + ${' + 'description}) : "")';
  }
  /**
   * Calculates the highest priority message type(Error/Warning/Success/Information) from the available messages.
   *
   * @function
   * @name sap.fe.core.actions.messageHandling.fnGetHighestMessagePriority
   * @memberof sap.fe.core.actions.messageHandling
   * @param [aMessages] Messages list
   * @returns Highest priority message from the available messages
   * @private
   * @ui5-restricted
   */
  function fnGetHighestMessagePriority(aMessages) {
    let sMessagePriority = MessageType.None;
    const iLength = aMessages.length;
    const oMessageCount = {
      Error: 0,
      Warning: 0,
      Success: 0,
      Information: 0
    };
    for (let i = 0; i < iLength; i++) {
      ++oMessageCount[aMessages[i].getType()];
    }
    if (oMessageCount[MessageType.Error] > 0) {
      sMessagePriority = MessageType.Error;
    } else if (oMessageCount[MessageType.Warning] > 0) {
      sMessagePriority = MessageType.Warning;
    } else if (oMessageCount[MessageType.Success] > 0) {
      sMessagePriority = MessageType.Success;
    } else if (oMessageCount[MessageType.Information] > 0) {
      sMessagePriority = MessageType.Information;
    }
    return sMessagePriority;
  }
  // function which modify e-Tag messages only.
  // returns : true, if any e-Tag message is modified, otherwise false.
  function fnModifyETagMessagesOnly(oMessageManager, oResourceBundle, concurrentEditFlag) {
    const aMessages = oMessageManager.getMessageModel().getObject("/");
    let bMessagesModified = false;
    let sEtagMessage = "";
    aMessages.forEach(function (oMessage, i) {
      const oTechnicalDetails = oMessage.getTechnicalDetails && oMessage.getTechnicalDetails();
      if (oTechnicalDetails && oTechnicalDetails.httpStatus === 412 && oTechnicalDetails.isConcurrentModification) {
        if (concurrentEditFlag) {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES_CONCURRENT_MODIFICATION");
        } else {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES");
        }
        oMessageManager.removeMessages(aMessages[i]);
        oMessage.setMessage(sEtagMessage);
        oMessage.target = "";
        oMessageManager.addMessages(oMessage);
        bMessagesModified = true;
      }
    });
    return bMessagesModified;
  }
  // Dialog close Handling
  function dialogCloseHandler() {
    oDialog.close();
    oBackButton.setVisible(false);
    aMessageList = [];
    const oMessageDialogModel = oMessageView.getModel();
    if (oMessageDialogModel) {
      oMessageDialogModel.setData({});
    }
    removeUnboundTransitionMessages();
  }
  function getRetryAfterMessage(oMessage, bMessageDialog) {
    const dNow = new Date();
    const oTechnicalDetails = oMessage.getTechnicalDetails();
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    let sRetryAfterMessage;
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && oTechnicalDetails.retryAfter) {
      const dRetryAfter = oTechnicalDetails.retryAfter;
      let oDateFormat;
      if (dNow.getFullYear() !== dRetryAfter.getFullYear()) {
        //different years
        oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "MMMM dd, yyyy 'at' hh:mm a"
        });
        sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
      } else if (dNow.getFullYear() == dRetryAfter.getFullYear()) {
        //same year
        if (bMessageDialog) {
          //less than 2 min
          sRetryAfterMessage = `${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE")} ${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_DESC")}`;
        } else if (dNow.getMonth() !== dRetryAfter.getMonth() || dNow.getDate() !== dRetryAfter.getDate()) {
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "MMMM dd 'at' hh:mm a"
          }); //different months or different days of same month
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
        } else {
          //same day
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "hh:mm a"
          });
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_DAY", [oDateFormat.format(dRetryAfter)]);
        }
      }
    }
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && !oTechnicalDetails.retryAfter) {
      sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_NO_RETRY_AFTER");
    }
    return sRetryAfterMessage;
  }
  function prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, multi412) {
    let oMessageTemplate;
    if (!bStrictHandlingFlow) {
      const descriptionBinding = '{= ${description} ? "<html><body>" + ' + fnFormatDescription() + ' + "</html></body>" : "" }';
      const technicalDetailsBinding = '{= ${technicalDetails} ? "<html><body>" + ' + fnFormatTechnicalDetails() + ' + "</html></body>" : "" }';
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        groupName: "{headerName}",
        description: descriptionBinding + technicalDetailsBinding,
        markupDescription: true
      });
    } else if (multi412) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        description: "{description}",
        markupDescription: true
      });
    } else {
      oMessageTemplate = new MessageItem({
        title: "{message}",
        type: {
          path: "type"
        },
        longtextUrl: "{descriptionUrl}"
      });
    }
    oMessageView = new MessageView({
      showDetailsPageHeader: false,
      itemSelect: function () {
        oBackButton.setVisible(true);
      },
      items: {
        path: "/",
        template: oMessageTemplate
      }
    });
    oMessageView.setGroupItems(true);
    oBackButton = oBackButton || new Button({
      icon: IconPool.getIconURI("nav-back"),
      visible: false,
      press: function () {
        oMessageView.navigateBack();
        this.setVisible(false);
      }
    });
    // Update proper ETag Mismatch error
    oMessageView.setModel(oMessageDialogModel);
    return {
      oMessageView,
      oBackButton
    };
  }
  function showUnboundMessages(aCustomMessages, oContext, bShowBoundTransition, concurrentEditFlag, control, sActionName, bOnlyForTest, onBeforeShowMessage, viewType) {
    let aTransitionMessages = this.getMessages();
    const oMessageManager = Core.getMessageManager();
    let sHighestPriority;
    let sHighestPriorityText;
    const aFilters = [new Filter({
      path: "persistent",
      operator: FilterOperator.NE,
      value1: false
    })];
    let showMessageDialog = false,
      showMessageBox = false;
    if (bShowBoundTransition) {
      aTransitionMessages = aTransitionMessages.concat(getMessages(true, true));
      // we only want to show bound transition messages not bound state messages hence add a filter for the same
      aFilters.push(new Filter({
        path: "persistent",
        operator: FilterOperator.EQ,
        value1: true
      }));
      const fnCheckControlIdInDialog = function (aControlIds) {
        let index = Infinity,
          oControl = Core.byId(aControlIds[0]);
        const errorFieldControl = Core.byId(aControlIds[0]);
        while (oControl) {
          const fieldRankinDialog = oControl instanceof Dialog ? errorFieldControl.getParent().findElements(true).indexOf(errorFieldControl) : Infinity;
          if (oControl instanceof Dialog) {
            if (index > fieldRankinDialog) {
              index = fieldRankinDialog;
              // Set the focus to the dialog's control
              errorFieldControl.focus();
            }
            // messages with target inside sap.m.Dialog should not bring up the message dialog
            return false;
          }
          oControl = oControl.getParent();
        }
        return true;
      };
      aFilters.push(new Filter({
        path: "controlIds",
        test: fnCheckControlIdInDialog,
        caseSensitive: true
      }));
    } else {
      // only unbound messages have to be shown so add filter accordingly
      aFilters.push(new Filter({
        path: "target",
        operator: FilterOperator.EQ,
        value1: ""
      }));
    }
    if (aCustomMessages && aCustomMessages.length) {
      aCustomMessages.forEach(function (oMessage) {
        const messageCode = oMessage.code ? oMessage.code : "";
        oMessageManager.addMessages(new Message({
          message: oMessage.text,
          type: oMessage.type,
          target: "",
          persistent: true,
          code: messageCode
        }));
        //The target and persistent properties of the message are hardcoded as "" and true because the function deals with only unbound messages.
      });
    }

    const oMessageDialogModel = oMessageView && oMessageView.getModel() || new JSONModel();
    const bHasEtagMessage = this.modifyETagMessagesOnly(oMessageManager, Core.getLibraryResourceBundle("sap.fe.core"), concurrentEditFlag);
    if (aTransitionMessages.length === 1 && aTransitionMessages[0].getCode() === "503") {
      showMessageBox = true;
    } else if (aTransitionMessages.length !== 0) {
      showMessageDialog = true;
    }
    let showMessageParameters;
    let aModelDataArray = [];
    if (showMessageDialog || !showMessageBox && !onBeforeShowMessage) {
      const oListBinding = oMessageManager.getMessageModel().bindList("/", undefined, undefined, aFilters),
        aCurrentContexts = oListBinding.getCurrentContexts();
      if (aCurrentContexts && aCurrentContexts.length > 0) {
        showMessageDialog = true;
        // Don't show dialog incase there are no errors to show

        // if false, show messages in dialog
        // As fitering has already happened here hence
        // using the message model again for the message dialog view and then filtering on that binding again is unnecessary.
        // So we create new json model to use for the message dialog view.
        const aMessages = [];
        aCurrentContexts.forEach(function (currentContext) {
          const oMessage = currentContext.getObject();
          aMessages.push(oMessage);
          aMessageDataList = aMessages;
        });
        let existingMessages = [];
        if (Array.isArray(oMessageDialogModel.getData())) {
          existingMessages = oMessageDialogModel.getData();
        }
        const oUniqueObj = {};
        aModelDataArray = aMessageDataList.concat(existingMessages).filter(function (obj) {
          // remove entries having duplicate message ids
          return !oUniqueObj[obj.id] && (oUniqueObj[obj.id] = true);
        });
        oMessageDialogModel.setData(aModelDataArray);
      }
    }
    if (onBeforeShowMessage) {
      showMessageParameters = {
        showMessageBox,
        showMessageDialog
      };
      showMessageParameters = onBeforeShowMessage(aTransitionMessages, showMessageParameters);
      showMessageBox = showMessageParameters.showMessageBox;
      showMessageDialog = showMessageParameters.showMessageDialog;
      if (showMessageDialog || showMessageParameters.showChangeSetErrorDialog) {
        aModelDataArray = showMessageParameters.filteredMessages ? showMessageParameters.filteredMessages : aModelDataArray;
      }
    }
    if (aTransitionMessages.length === 0 && !aCustomMessages && !bHasEtagMessage) {
      // Don't show the popup if there are no transient messages
      return Promise.resolve(true);
    } else if (aTransitionMessages.length === 1 && aTransitionMessages[0].getType() === MessageType.Success && !aCustomMessages) {
      return new Promise(resolve => {
        MessageToast.show(aTransitionMessages[0].message);
        if (oMessageDialogModel) {
          oMessageDialogModel.setData({});
        }
        oMessageManager.removeMessages(aTransitionMessages);
        resolve();
      });
    } else if (showMessageDialog) {
      messageHandling.updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType);
      oMessageDialogModel.setData(aModelDataArray); // set the messages here so that if any of them are filtered for APD, they are filtered here as well.
      aResolveFunctions = aResolveFunctions || [];
      return new Promise(function (resolve, reject) {
        aResolveFunctions.push(resolve);
        Core.getLibraryResourceBundle("sap.fe.core", true).then(function (oResourceBundle) {
          const bStrictHandlingFlow = false;
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            oMessageDialogModel.getData().forEach(function (oMessage) {
              showMessageParameters.fnGetMessageSubtitle(oMessage);
            });
          }
          const oMessageObject = prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow);
          const oSorter = new Sorter("", undefined, undefined, (obj1, obj2) => {
            const rankA = getMessageRank(obj1);
            const rankB = getMessageRank(obj2);
            if (rankA < rankB) {
              return -1;
            }
            if (rankA > rankB) {
              return 1;
            }
            return 0;
          });
          oMessageObject.oMessageView.getBinding("items").sort(oSorter);
          oDialog = oDialog && oDialog.isOpen() ? oDialog : new Dialog({
            resizable: true,
            endButton: new Button({
              press: function () {
                dialogCloseHandler();
                // also remove bound transition messages if we were showing them
                oMessageManager.removeMessages(aModelDataArray);
              },
              text: oResourceBundle.getText("C_COMMON_SAPFE_CLOSE")
            }),
            customHeader: new Bar({
              contentMiddle: [new Text({
                text: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE")
              })],
              contentLeft: [oBackButton]
            }),
            contentWidth: "37.5em",
            contentHeight: "21.5em",
            verticalScrolling: false,
            afterClose: function () {
              for (let i = 0; i < aResolveFunctions.length; i++) {
                aResolveFunctions[i].call();
              }
              aResolveFunctions = [];
            }
          });
          oDialog.removeAllContent();
          oDialog.addContent(oMessageObject.oMessageView);
          if (bHasEtagMessage) {
            sap.ui.require(["sap/m/ButtonType"], function (ButtonType) {
              oDialog.setBeginButton(new Button({
                press: function () {
                  dialogCloseHandler();
                  if (oContext.hasPendingChanges()) {
                    oContext.getBinding().resetChanges();
                  }
                  oContext.refresh();
                },
                text: oResourceBundle.getText("C_COMMON_SAPFE_REFRESH"),
                type: ButtonType.Emphasized
              }));
            });
          } else {
            oDialog.destroyBeginButton();
          }
          sHighestPriority = fnGetHighestMessagePriority(oMessageView.getItems());
          sHighestPriorityText = getTranslatedTextForMessageDialog(sHighestPriority);
          oDialog.setState(sHighestPriority);
          oDialog.getCustomHeader().getContentMiddle()[0].setText(sHighestPriorityText);
          oMessageView.navigateBack();
          oDialog.open();
          if (bOnlyForTest) {
            resolve(oDialog);
          }
        }).catch(reject);
      });
    } else if (showMessageBox) {
      return new Promise(function (resolve) {
        const oMessage = aTransitionMessages[0];
        if (oMessage.technicalDetails && aMessageList.indexOf(oMessage.technicalDetails.originalMessage.message) === -1 || showMessageParameters && showMessageParameters.showChangeSetErrorDialog) {
          if (!showMessageParameters || !showMessageParameters.showChangeSetErrorDialog) {
            aMessageList.push(oMessage.technicalDetails.originalMessage.message);
          }
          let formattedTextString = "<html><body>";
          const retryAfterMessage = getRetryAfterMessage(oMessage, true);
          if (retryAfterMessage) {
            formattedTextString = `<h6>${retryAfterMessage}</h6><br>`;
          }
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            showMessageParameters.fnGetMessageSubtitle(oMessage);
          }
          if (oMessage.getCode() !== "503" && oMessage.getAdditionalText() !== undefined) {
            formattedTextString = `${formattedTextString + oMessage.getAdditionalText()}: ${oMessage.getMessage()}</html></body>`;
          } else {
            formattedTextString = `${formattedTextString + oMessage.getMessage()}</html></body>`;
          }
          const formattedText = new FormattedText({
            htmlText: formattedTextString
          });
          MessageBox.error(formattedText, {
            onClose: function () {
              aMessageList = [];
              if (bShowBoundTransition) {
                removeBoundTransitionMessages();
              }
              removeUnboundTransitionMessages();
              resolve(true);
            }
          });
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * This function sets the group name for all messages in a dialog.
   *
   * @param aModelDataArray Messages array
   * @param control
   * @param sActionName
   * @param viewType
   */
  function updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType) {
    aModelDataArray.forEach(aModelData => {
      var _aModelData$target, _aModelData$getCode, _aModelData$target2;
      aModelData["headerName"] = "";
      if (!((_aModelData$target = aModelData.target) !== null && _aModelData$target !== void 0 && _aModelData$target.length) && ((_aModelData$getCode = aModelData.getCode) === null || _aModelData$getCode === void 0 ? void 0 : _aModelData$getCode.call(aModelData)) !== "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED") {
        // unbound transiiton messages
        aModelData["headerName"] = "General";
      } else if ((_aModelData$target2 = aModelData.target) !== null && _aModelData$target2 !== void 0 && _aModelData$target2.length) {
        // LR flow
        if (viewType === "ListReport") {
          messageHandling.setGroupNameLRTable(control, aModelData, sActionName);
        } else if (viewType === "ObjectPage") {
          // OP Display mode
          messageHandling.setGroupNameOPDisplayMode(aModelData, sActionName, control);
        } else {
          aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
        }
      }
    });
  }

  /**
   * This function will set the group name of Message Object for LR table.
   *
   * @param oElem
   * @param aModelData
   * @param sActionName
   */
  function setGroupNameLRTable(oElem, aModelData, sActionName) {
    const oRowBinding = oElem && oElem.getRowBinding();
    if (oRowBinding) {
      var _aModelData$target3;
      const sElemeBindingPath = `${oElem.getRowBinding().getPath()}`;
      if (((_aModelData$target3 = aModelData.target) === null || _aModelData$target3 === void 0 ? void 0 : _aModelData$target3.indexOf(sElemeBindingPath)) === 0) {
        const allRowContexts = oElem.getRowBinding().getContexts();
        allRowContexts.forEach(rowContext => {
          var _aModelData$target4;
          if ((_aModelData$target4 = aModelData.target) !== null && _aModelData$target4 !== void 0 && _aModelData$target4.includes(rowContext.getPath())) {
            const contextPath = `${rowContext.getPath()}/`;
            const identifierColumn = oElem.getParent().getIdentifierColumn();
            const rowIdentifier = identifierColumn && rowContext.getObject()[identifierColumn];
            const columnPropertyName = messageHandling.getTableColProperty(oElem, aModelData, contextPath);
            const {
              sTableTargetColName
            } = messageHandling.getTableColInfo(oElem, columnPropertyName);

            // if target has some column name and column is visible in UI
            if (columnPropertyName && sTableTargetColName) {
              // header will be row Identifier, if found from above code otherwise it should be table name
              aModelData["headerName"] = rowIdentifier ? ` ${rowIdentifier}` : oElem.getHeader();
            } else {
              // if column data not found (may be the column is hidden), add grouping as Last Action
              aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
            }
          }
        });
      }
    }
  }

  /**
   * This function will set the group name of Message Object in OP Display mode.
   *
   * @param aModelData Message Object
   * @param sActionName  Action name
   * @param control
   */
  function setGroupNameOPDisplayMode(aModelData, sActionName, control) {
    const oViewContext = control === null || control === void 0 ? void 0 : control.getBindingContext();
    const opLayout = (control === null || control === void 0 ? void 0 : control.getContent) && (control === null || control === void 0 ? void 0 : control.getContent()[0]);
    let bIsGeneralGroupName = true;
    if (opLayout) {
      messageHandling.getVisibleSectionsFromObjectPageLayout(opLayout).forEach(function (oSection) {
        const subSections = oSection.getSubSections();
        subSections.forEach(function (oSubSection) {
          oSubSection.findElements(true).forEach(function (oElem) {
            if (oElem.isA("sap.ui.mdc.Table")) {
              const oRowBinding = oElem.getRowBinding(),
                setSectionNameInGroup = true;
              let childTableElement;
              oElem.findElements(true).forEach(oElement => {
                if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
                  childTableElement = oElement;
                }
              });
              if (oRowBinding) {
                var _oElem$getRowBinding, _aModelData$target5;
                const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}/${(_oElem$getRowBinding = oElem.getRowBinding()) === null || _oElem$getRowBinding === void 0 ? void 0 : _oElem$getRowBinding.getPath()}`;
                if (((_aModelData$target5 = aModelData.target) === null || _aModelData$target5 === void 0 ? void 0 : _aModelData$target5.indexOf(sElemeBindingPath)) === 0) {
                  const obj = messageHandling.getTableColumnDataAndSetSubtile(aModelData, oElem, childTableElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
                  const {
                    oTargetTableInfo
                  } = obj;
                  if (setSectionNameInGroup) {
                    const identifierColumn = oElem.getParent().getIdentifierColumn();
                    if (identifierColumn) {
                      const allRowContexts = oElem.getRowBinding().getContexts();
                      allRowContexts.forEach(rowContext => {
                        var _aModelData$target6;
                        if ((_aModelData$target6 = aModelData.target) !== null && _aModelData$target6 !== void 0 && _aModelData$target6.includes(rowContext.getPath())) {
                          const rowIdentifier = identifierColumn ? rowContext.getObject()[identifierColumn] : undefined;
                          aModelData["additionalText"] = `${rowIdentifier}, ${oTargetTableInfo.sTableTargetColName}`;
                        }
                      });
                    } else {
                      aModelData["additionalText"] = `${oTargetTableInfo.sTableTargetColName}`;
                    }
                    let headerName = oElem.getHeaderVisible() && oTargetTableInfo.tableHeader;
                    if (!headerName) {
                      headerName = oSubSection.getTitle();
                    } else {
                      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                      headerName = `${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${headerName}`;
                    }
                    aModelData["headerName"] = headerName;
                    bIsGeneralGroupName = false;
                  }
                }
              }
            }
          });
        });
      });
    }
    if (bIsGeneralGroupName) {
      var _aModelData$target7;
      const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}`;
      if (((_aModelData$target7 = aModelData.target) === null || _aModelData$target7 === void 0 ? void 0 : _aModelData$target7.indexOf(sElemeBindingPath)) === 0) {
        // check if OP context path is part of target, set Last Action as group name
        const headerName = messageHandling.getLastActionTextAndActionName(sActionName);
        aModelData["headerName"] = headerName;
      } else {
        aModelData["headerName"] = "General";
      }
    }
  }
  function getLastActionTextAndActionName(sActionName) {
    const sLastActionText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
    return sActionName ? `${sLastActionText}: ${sActionName}` : "";
  }

  /**
   * This function will give rank based on Message Group/Header name, which will be used for Sorting messages in Message dialog
   * Last Action should be shown at top, next Row Id and last General.
   *
   * @param obj
   * @returns Rank of message
   */
  function getMessageRank(obj) {
    var _obj$headerName, _obj$headerName2;
    if ((_obj$headerName = obj.headerName) !== null && _obj$headerName !== void 0 && _obj$headerName.toString().includes("Last Action")) {
      return 1;
    } else if ((_obj$headerName2 = obj.headerName) !== null && _obj$headerName2 !== void 0 && _obj$headerName2.toString().includes("General")) {
      return 3;
    } else {
      return 2;
    }
  }

  /**
   * This function will set the group name which can either General or Last Action.
   *
   * @param aMessage
   * @param sActionName
   * @param bIsGeneralGroupName
   */
  const fnCallbackSetGroupName = (aMessage, sActionName, bIsGeneralGroupName) => {
    if (bIsGeneralGroupName) {
      const sGeneralGroupText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      aMessage["headerName"] = sGeneralGroupText;
    } else {
      aMessage["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
    }
  };

  /**
   * This function will get the table row/column info and set subtitle.
   *
   * @param aMessage
   * @param oTable
   * @param oElement
   * @param oRowBinding
   * @param sActionName
   * @param setSectionNameInGroup
   * @param fnSetGroupName
   * @returns Table info and Subtitle.
   */
  function getTableColumnDataAndSetSubtile(aMessage, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnSetGroupName) {
    const oTargetTableInfo = messageHandling.getTableAndTargetInfo(oTable, aMessage, oElement, oRowBinding);
    oTargetTableInfo.tableHeader = oTable.getHeader();
    let sControlId, bIsCreationRow;
    if (!oTargetTableInfo.oTableRowContext) {
      sControlId = aMessage.getControlIds().find(function (sId) {
        return messageHandling.isControlInTable(oTable, sId);
      });
    }
    if (sControlId) {
      const oControl = Core.byId(sControlId);
      bIsCreationRow = messageHandling.isControlPartOfCreationRow(oControl);
    }
    if (!oTargetTableInfo.sTableTargetColName) {
      // if the column is not present on UI or the target does not have a table field in it, use Last Action for grouping
      if (aMessage.persistent && sActionName) {
        fnSetGroupName(aMessage, sActionName);
        setSectionNameInGroup = false;
      }
    }
    const subTitle = messageHandling.getMessageSubtitle(aMessage, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable, bIsCreationRow);
    return {
      oTargetTableInfo,
      subTitle
    };
  }

  /**
   * This function will create the subtitle based on Table Row/Column data.
   *
   * @param message
   * @param oTableRowBindingContexts
   * @param oTableRowContext
   * @param sTableTargetColName
   * @param oTable
   * @param bIsCreationRow
   * @param oTargetedControl
   * @returns Message subtitle.
   */
  function getMessageSubtitle(message, oTableRowBindingContexts, oTableRowContext, sTableTargetColName, oTable, bIsCreationRow, oTargetedControl) {
    let sMessageSubtitle;
    let sRowSubtitleValue;
    const resourceModel = getResourceModel(oTable);
    const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
    const oColFromTableSettings = messageHandling.fetchColumnInfo(message, oTable);
    if (bIsCreationRow) {
      sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE_CREATION_ROW_INDICATOR"), sTableTargetColName ? sTableTargetColName : oColFromTableSettings.label]);
    } else {
      const oTableFirstColBindingContextTextAnnotation = messageHandling.getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty);
      const sTableFirstColTextAnnotationPath = oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("$Path") : undefined;
      const sTableFirstColTextArrangement = sTableFirstColTextAnnotationPath && oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember") : undefined;
      if (oTableRowBindingContexts.length > 0) {
        // set Row subtitle text
        if (oTargetedControl) {
          // The UI error is on the first column, we then get the control input as the row indicator:
          sRowSubtitleValue = oTargetedControl.getValue();
        } else if (oTableRowContext && sTableFirstColProperty) {
          sRowSubtitleValue = messageHandling.getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTableFirstColTextAnnotationPath, sTableFirstColTextArrangement);
        } else {
          sRowSubtitleValue = undefined;
        }
        // set the message subtitle
        const oColumnInfo = messageHandling.determineColumnInfo(oColFromTableSettings, resourceModel);
        if (sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [sRowSubtitleValue, sTableTargetColName]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}, ${oColumnInfo.sColumnValue}`;
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Unknown") {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [sRowSubtitleValue, oColumnInfo.sColumnValue]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "undefined") {
          sMessageSubtitle = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}`;
        } else if (!sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN") + ": " + sTableTargetColName;
        } else if (!sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = oColumnInfo.sColumnValue;
        } else {
          sMessageSubtitle = null;
        }
      } else {
        sMessageSubtitle = null;
      }
    }
    return sMessageSubtitle;
  }

  /**
   * This function will get the first column for text Annotation, this is needed to set subtitle of Message.
   *
   * @param oTable
   * @param oTableRowContext
   * @param sTableFirstColProperty
   * @returns Binding context.
   */
  function getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty) {
    let oBindingContext;
    if (oTableRowContext && sTableFirstColProperty) {
      const oModel = oTable === null || oTable === void 0 ? void 0 : oTable.getModel();
      const oMetaModel = oModel === null || oModel === void 0 ? void 0 : oModel.getMetaModel();
      const sMetaPath = oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.getMetaPath(oTableRowContext.getPath());
      if (oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.getObject(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text/$Path`)) {
        oBindingContext = oMetaModel.createBindingContext(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text`);
      }
    }
    return oBindingContext;
  }

  /**
   * This function will get the value of first Column of Table, with its text Arrangement.
   *
   * @param sTableFirstColProperty
   * @param oTableRowContext
   * @param sTextAnnotationPath
   * @param sTextArrangement
   * @returns Column Value.
   */
  function getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTextAnnotationPath, sTextArrangement) {
    const sCodeValue = oTableRowContext.getValue(sTableFirstColProperty);
    let sTextValue;
    let sComputedValue = sCodeValue;
    if (sTextAnnotationPath) {
      if (sTableFirstColProperty.lastIndexOf("/") > 0) {
        // the target property is replaced with the text annotation path
        sTableFirstColProperty = sTableFirstColProperty.slice(0, sTableFirstColProperty.lastIndexOf("/") + 1);
        sTableFirstColProperty = sTableFirstColProperty.concat(sTextAnnotationPath);
      } else {
        sTableFirstColProperty = sTextAnnotationPath;
      }
      sTextValue = oTableRowContext.getValue(sTableFirstColProperty);
      if (sTextValue) {
        if (sTextArrangement) {
          const sEnumNumber = sTextArrangement.slice(sTextArrangement.indexOf("/") + 1);
          switch (sEnumNumber) {
            case "TextOnly":
              sComputedValue = sTextValue;
              break;
            case "TextFirst":
              sComputedValue = `${sTextValue} (${sCodeValue})`;
              break;
            case "TextLast":
              sComputedValue = `${sCodeValue} (${sTextValue})`;
              break;
            case "TextSeparate":
              sComputedValue = sCodeValue;
              break;
            default:
          }
        } else {
          sComputedValue = `${sTextValue} (${sCodeValue})`;
        }
      }
    }
    return sComputedValue;
  }

  /**
   * The method that is called to retrieve the column info from the associated message of the message popover.
   *
   * @private
   * @param oMessage Message object
   * @param oTable MdcTable
   * @returns Returns the column info.
   */
  function fetchColumnInfo(oMessage, oTable) {
    const sColNameFromMessageObj = oMessage === null || oMessage === void 0 ? void 0 : oMessage.getTargets()[0].split("/").pop();
    return oTable.getParent().getTableDefinition().columns.find(function (oColumn) {
      return oColumn.key.split("::").pop() === sColNameFromMessageObj;
    });
  }

  /**
   * This function get the Column data depending on its availability in Table, this is needed for setting subtitle of Message.
   *
   * @param oColFromTableSettings
   * @param resourceModel
   * @returns Column data.
   */
  function determineColumnInfo(oColFromTableSettings, resourceModel) {
    const oColumnInfo = {
      sColumnIndicator: String,
      sColumnValue: String
    };
    if (oColFromTableSettings) {
      // if column is neither in table definition nor personalization, show only row subtitle text
      if (oColFromTableSettings.availability === "Hidden") {
        oColumnInfo.sColumnValue = undefined;
        oColumnInfo.sColumnIndicator = "undefined";
      } else {
        //if column is in table personalization but not in table definition, show Column (Hidden) : <colName>
        oColumnInfo.sColumnValue = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")} (${resourceModel.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")}): ${oColFromTableSettings.label}`;
        oColumnInfo.sColumnIndicator = "Hidden";
      }
    } else {
      oColumnInfo.sColumnValue = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE_INDICATOR_UNKNOWN");
      oColumnInfo.sColumnIndicator = "Unknown";
    }
    return oColumnInfo;
  }

  /**
   * This function check if a given control id is a part of Table.
   *
   * @param oTable
   * @param sControlId
   * @returns True if control is part of table.
   */
  function isControlInTable(oTable, sControlId) {
    const oControl = Core.byId(sControlId);
    if (oControl && !oControl.isA("sap.ui.table.Table") && !oControl.isA("sap.m.Table")) {
      return oTable.findElements(true, function (oElem) {
        return oElem.getId() === oControl;
      });
    }
    return false;
  }
  function isControlPartOfCreationRow(oControl) {
    let oParentControl = oControl === null || oControl === void 0 ? void 0 : oControl.getParent();
    while (oParentControl && !((_oParentControl = oParentControl) !== null && _oParentControl !== void 0 && _oParentControl.isA("sap.ui.table.Row")) && !((_oParentControl2 = oParentControl) !== null && _oParentControl2 !== void 0 && _oParentControl2.isA("sap.ui.table.CreationRow")) && !((_oParentControl3 = oParentControl) !== null && _oParentControl3 !== void 0 && _oParentControl3.isA("sap.m.ColumnListItem"))) {
      var _oParentControl, _oParentControl2, _oParentControl3;
      oParentControl = oParentControl.getParent();
    }
    return !!oParentControl && oParentControl.isA("sap.ui.table.CreationRow");
  }
  function getTranslatedTextForMessageDialog(sHighestPriority) {
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    switch (sHighestPriority) {
      case "Error":
        return oResourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERRORS");
      case "Information":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO");
      case "Success":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS");
      case "Warning":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNINGS");
      default:
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE");
    }
  }
  function removeUnboundTransitionMessages() {
    removeTransitionMessages(false);
  }
  function removeBoundTransitionMessages(sPathToBeRemoved) {
    removeTransitionMessages(true, sPathToBeRemoved);
  }
  function getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved) {
    if (sPathToBeRemoved === undefined) {
      return oMessageModel.getObject("/");
    }
    const listBinding = oMessageModel.bindList("/");
    listBinding.filter(new Filter({
      path: "target",
      operator: FilterOperator.StartsWith,
      value1: sPathToBeRemoved
    }));
    return listBinding.getCurrentContexts().map(function (oContext) {
      return oContext.getObject();
    });
  }
  function getMessages() {
    let bBoundMessages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let bTransitionOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let sPathToBeRemoved = arguments.length > 2 ? arguments[2] : undefined;
    let i;
    const oMessageManager = Core.getMessageManager(),
      oMessageModel = oMessageManager.getMessageModel(),
      oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
      aTransitionMessages = [];
    let aMessages = [];
    if (bBoundMessages && bTransitionOnly && sPathToBeRemoved) {
      aMessages = getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved);
    } else {
      aMessages = oMessageModel.getObject("/");
    }
    for (i = 0; i < aMessages.length; i++) {
      if ((!bTransitionOnly || aMessages[i].persistent) && (bBoundMessages && aMessages[i].target !== "" || !bBoundMessages && (!aMessages[i].target || aMessages[i].target === ""))) {
        aTransitionMessages.push(aMessages[i]);
      }
    }
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].code === "503" && aTransitionMessages[i].message !== "" && aTransitionMessages[i].message.indexOf(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")) === -1) {
        aTransitionMessages[i].message = `\n${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")}${aTransitionMessages[i].message}`;
      }
    }
    //Filtering messages again here to avoid showing pure technical messages raised by the model
    const backendMessages = [];
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].technicalDetails && (aTransitionMessages[i].technicalDetails.originalMessage !== undefined && aTransitionMessages[i].technicalDetails.originalMessage !== null || aTransitionMessages[i].technicalDetails.httpStatus !== undefined && aTransitionMessages[i].technicalDetails.httpStatus !== null) || aTransitionMessages[i].code) {
        backendMessages.push(aTransitionMessages[i]);
      }
    }
    return backendMessages;
  }
  function removeTransitionMessages(bBoundMessages, sPathToBeRemoved) {
    const aMessagesToBeDeleted = getMessages(bBoundMessages, true, sPathToBeRemoved);
    if (aMessagesToBeDeleted.length > 0) {
      Core.getMessageManager().removeMessages(aMessagesToBeDeleted);
    }
  }
  //TODO: This must be moved out of message handling
  function setMessageSubtitle(oTable, aContexts, message) {
    if (message.additionalText === undefined) {
      const subtitleColumn = oTable.getParent().getIdentifierColumn();
      const errorContext = aContexts.find(function (oContext) {
        return message.getTargets()[0].indexOf(oContext.getPath()) !== -1;
      });
      message.additionalText = errorContext ? errorContext.getObject()[subtitleColumn] : undefined;
    }
  }

  /**
   * The method retrieves the visible sections from an object page.
   *
   * @param oObjectPageLayout The objectPageLayout object for which we want to retrieve the visible sections.
   * @returns Array of visible sections.
   * @private
   */
  function getVisibleSectionsFromObjectPageLayout(oObjectPageLayout) {
    return oObjectPageLayout.getSections().filter(function (oSection) {
      return oSection.getVisible();
    });
  }

  /**
   * This function checks if control ids from message are a part of a given subsection.
   *
   * @param subSection
   * @param oMessageObject
   * @returns SubSection matching control ids.
   */
  function getControlFromMessageRelatingToSubSection(subSection, oMessageObject) {
    return subSection.findElements(true, oElem => {
      return fnFilterUponIds(oMessageObject.getControlIds(), oElem);
    }).sort(function (a, b) {
      // controls are sorted in order to have the table on top of the array
      // it will help to compute the subtitle of the message based on the type of related controls
      if (a.isA("sap.ui.mdc.Table") && !b.isA("sap.ui.mdc.Table")) {
        return -1;
      }
      return 1;
    });
  }
  function getTableColProperty(oTable, oMessageObject, oContextPath) {
    //this function escapes a string to use it as a regex
    const fnRegExpescape = function (s) {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    // based on the target path of the message we retrieve the property name.
    // to achieve it we remove the bindingContext path and the row binding path from the target
    if (!oContextPath) {
      var _oTable$getBindingCon;
      oContextPath = new RegExp(`${fnRegExpescape(`${(_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath()}/${oTable.getRowBinding().getPath()}`)}\\(.*\\)/`);
    }
    return oMessageObject.getTargets()[0].replace(oContextPath, "");
  }

  /**
   * This function gives the column information if it matches with the property name from target of message.
   *
   * @param oTable
   * @param sTableTargetColProperty
   * @returns Column name and property.
   */
  function getTableColInfo(oTable, sTableTargetColProperty) {
    let sTableTargetColName;
    let oTableTargetCol = oTable.getColumns().find(function (column) {
      return column.getDataProperty() == sTableTargetColProperty;
    });
    if (!oTableTargetCol) {
      /* If the target column is not found, we check for a custom column */
      const oCustomColumn = oTable.getControlDelegate().getColumnsFor(oTable).find(function (oColumn) {
        if (!!oColumn.template && oColumn.propertyInfos) {
          return oColumn.propertyInfos[0] === sTableTargetColProperty || oColumn.propertyInfos[0].replace("Property::", "") === sTableTargetColProperty;
        } else {
          return false;
        }
      });
      if (oCustomColumn) {
        var _oTableTargetCol;
        oTableTargetCol = oCustomColumn;
        sTableTargetColProperty = (_oTableTargetCol = oTableTargetCol) === null || _oTableTargetCol === void 0 ? void 0 : _oTableTargetCol.name;
        sTableTargetColName = oTable.getColumns().find(function (oColumn) {
          return sTableTargetColProperty === oColumn.getDataProperty();
        }).getHeader();
      } else {
        /* If the target column is not found, we check for a field group */
        const aColumns = oTable.getControlDelegate().getColumnsFor(oTable);
        oTableTargetCol = aColumns.find(function (oColumn) {
          if (oColumn.key.indexOf("::FieldGroup::") !== -1) {
            var _oColumn$propertyInfo;
            return (_oColumn$propertyInfo = oColumn.propertyInfos) === null || _oColumn$propertyInfo === void 0 ? void 0 : _oColumn$propertyInfo.find(function () {
              return aColumns.find(function (tableColumn) {
                return tableColumn.relativePath === sTableTargetColProperty;
              });
            });
          }
        });
        /* check if the column with the field group is visible in the table: */
        let bIsTableTargetColVisible = false;
        if (oTableTargetCol && oTableTargetCol.label) {
          bIsTableTargetColVisible = oTable.getColumns().some(function (column) {
            return column.getHeader() === oTableTargetCol.label;
          });
        }
        sTableTargetColName = bIsTableTargetColVisible && oTableTargetCol.label;
        sTableTargetColProperty = bIsTableTargetColVisible && oTableTargetCol.key;
      }
    } else {
      sTableTargetColName = oTableTargetCol && oTableTargetCol.getHeader();
    }
    return {
      sTableTargetColName: sTableTargetColName,
      sTableTargetColProperty: sTableTargetColProperty
    };
  }

  /**
   * This function gives Table and column info if any of it matches the target from Message.
   *
   * @param oTable
   * @param oMessageObject
   * @param oElement
   * @param oRowBinding
   * @returns Table info matching the message target.
   */
  function getTableAndTargetInfo(oTable, oMessageObject, oElement, oRowBinding) {
    const oTargetTableInfo = {};
    oTargetTableInfo.sTableTargetColProperty = getTableColProperty(oTable, oMessageObject);
    const oTableColInfo = getTableColInfo(oTable, oTargetTableInfo.sTableTargetColProperty);
    oTargetTableInfo.oTableRowBindingContexts = oElement.isA("sap.ui.table.Table") ? oRowBinding.getContexts() : oRowBinding.getCurrentContexts();
    oTargetTableInfo.sTableTargetColName = oTableColInfo.sTableTargetColName;
    oTargetTableInfo.sTableTargetColProperty = oTableColInfo.sTableTargetColProperty;
    oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts.find(function (rowContext) {
      return rowContext && oMessageObject.getTargets()[0].indexOf(rowContext.getPath()) === 0;
    });
    return oTargetTableInfo;
  }

  /**
   *
   * @param aControlIds
   * @param oItem
   * @returns True if the item matches one of the controls
   */
  function fnFilterUponIds(aControlIds, oItem) {
    return aControlIds.some(function (sControlId) {
      if (sControlId === oItem.getId()) {
        return true;
      }
      return false;
    });
  }

  /**
   * This function gives the group name having section and subsection data.
   *
   * @param section
   * @param subSection
   * @param bMultipleSubSections
   * @param oTargetTableInfo
   * @param resourceModel
   * @returns Group name.
   */
  function createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, resourceModel) {
    return section.getTitle() + (subSection.getTitle() && bMultipleSubSections ? `, ${subSection.getTitle()}` : "") + (oTargetTableInfo ? `, ${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTargetTableInfo.tableHeader}` : "");
  }
  function bIsOrphanElement(oElement, aElements) {
    return !aElements.some(function (oElem) {
      let oParentElement = oElement.getParent();
      while (oParentElement && oParentElement !== oElem) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement ? true : false;
    });
  }

  /**
   * Static functions for Fiori Message Handling
   *
   * @namespace
   * @alias sap.fe.core.actions.messageHandling
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const messageHandling = {
    getMessages: getMessages,
    showUnboundMessages: showUnboundMessages,
    removeUnboundTransitionMessages: removeUnboundTransitionMessages,
    removeBoundTransitionMessages: removeBoundTransitionMessages,
    modifyETagMessagesOnly: fnModifyETagMessagesOnly,
    getRetryAfterMessage: getRetryAfterMessage,
    prepareMessageViewForDialog: prepareMessageViewForDialog,
    setMessageSubtitle: setMessageSubtitle,
    getVisibleSectionsFromObjectPageLayout: getVisibleSectionsFromObjectPageLayout,
    getControlFromMessageRelatingToSubSection: getControlFromMessageRelatingToSubSection,
    fnFilterUponIds: fnFilterUponIds,
    getTableAndTargetInfo: getTableAndTargetInfo,
    createSectionGroupName: createSectionGroupName,
    bIsOrphanElement: bIsOrphanElement,
    getLastActionTextAndActionName: getLastActionTextAndActionName,
    getTableColumnDataAndSetSubtile: getTableColumnDataAndSetSubtile,
    getTableColInfo: getTableColInfo,
    getTableColProperty: getTableColProperty,
    getMessageSubtitle: getMessageSubtitle,
    determineColumnInfo: determineColumnInfo,
    fetchColumnInfo: fetchColumnInfo,
    getTableFirstColBindingContextForTextAnnotation: getTableFirstColBindingContextForTextAnnotation,
    getMessageRank: getMessageRank,
    fnCallbackSetGroupName: fnCallbackSetGroupName,
    getTableFirstColValue: getTableFirstColValue,
    setGroupNameOPDisplayMode: setGroupNameOPDisplayMode,
    updateMessageObjectGroupName: updateMessageObjectGroupName,
    setGroupNameLRTable: setGroupNameLRTable,
    isControlInTable: isControlInTable,
    isControlPartOfCreationRow: isControlPartOfCreationRow
  };
  return messageHandling;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIkNvcmVMaWIiLCJhTWVzc2FnZUxpc3QiLCJhTWVzc2FnZURhdGFMaXN0IiwiYVJlc29sdmVGdW5jdGlvbnMiLCJvRGlhbG9nIiwib0JhY2tCdXR0b24iLCJvTWVzc2FnZVZpZXciLCJmbkZvcm1hdFRlY2huaWNhbERldGFpbHMiLCJzUHJldmlvdXNHcm91cE5hbWUiLCJpbnNlcnREZXRhaWwiLCJvUHJvcGVydHkiLCJwcm9wZXJ0eSIsInN1YnN0ciIsIk1hdGgiLCJtYXgiLCJsYXN0SW5kZXhPZiIsImluc2VydEdyb3VwTmFtZSIsInNIVE1MIiwiZ3JvdXBOYW1lIiwiZ2V0UGF0aHMiLCJzVEQiLCJmb3JFYWNoIiwiZm5Gb3JtYXREZXNjcmlwdGlvbiIsImZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eSIsImFNZXNzYWdlcyIsInNNZXNzYWdlUHJpb3JpdHkiLCJOb25lIiwiaUxlbmd0aCIsImxlbmd0aCIsIm9NZXNzYWdlQ291bnQiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJpIiwiZ2V0VHlwZSIsImZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsIm9NZXNzYWdlTWFuYWdlciIsIm9SZXNvdXJjZUJ1bmRsZSIsImNvbmN1cnJlbnRFZGl0RmxhZyIsImdldE1lc3NhZ2VNb2RlbCIsImdldE9iamVjdCIsImJNZXNzYWdlc01vZGlmaWVkIiwic0V0YWdNZXNzYWdlIiwib01lc3NhZ2UiLCJvVGVjaG5pY2FsRGV0YWlscyIsImdldFRlY2huaWNhbERldGFpbHMiLCJodHRwU3RhdHVzIiwiaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uIiwiZ2V0VGV4dCIsInJlbW92ZU1lc3NhZ2VzIiwic2V0TWVzc2FnZSIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiZGlhbG9nQ2xvc2VIYW5kbGVyIiwiY2xvc2UiLCJzZXRWaXNpYmxlIiwib01lc3NhZ2VEaWFsb2dNb2RlbCIsImdldE1vZGVsIiwic2V0RGF0YSIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJnZXRSZXRyeUFmdGVyTWVzc2FnZSIsImJNZXNzYWdlRGlhbG9nIiwiZE5vdyIsIkRhdGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwicmV0cnlBZnRlciIsImRSZXRyeUFmdGVyIiwib0RhdGVGb3JtYXQiLCJnZXRGdWxsWWVhciIsIkRhdGVGb3JtYXQiLCJnZXREYXRlVGltZUluc3RhbmNlIiwicGF0dGVybiIsImZvcm1hdCIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsInByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyIsImJTdHJpY3RIYW5kbGluZ0Zsb3ciLCJtdWx0aTQxMiIsIm9NZXNzYWdlVGVtcGxhdGUiLCJkZXNjcmlwdGlvbkJpbmRpbmciLCJ0ZWNobmljYWxEZXRhaWxzQmluZGluZyIsIk1lc3NhZ2VJdGVtIiwidW5kZWZpbmVkIiwiY291bnRlciIsInBhdGgiLCJ0aXRsZSIsInN1YnRpdGxlIiwibG9uZ3RleHRVcmwiLCJ0eXBlIiwiZGVzY3JpcHRpb24iLCJtYXJrdXBEZXNjcmlwdGlvbiIsIk1lc3NhZ2VWaWV3Iiwic2hvd0RldGFpbHNQYWdlSGVhZGVyIiwiaXRlbVNlbGVjdCIsIml0ZW1zIiwidGVtcGxhdGUiLCJzZXRHcm91cEl0ZW1zIiwiQnV0dG9uIiwiaWNvbiIsIkljb25Qb29sIiwiZ2V0SWNvblVSSSIsInZpc2libGUiLCJwcmVzcyIsIm5hdmlnYXRlQmFjayIsInNldE1vZGVsIiwic2hvd1VuYm91bmRNZXNzYWdlcyIsImFDdXN0b21NZXNzYWdlcyIsIm9Db250ZXh0IiwiYlNob3dCb3VuZFRyYW5zaXRpb24iLCJjb250cm9sIiwic0FjdGlvbk5hbWUiLCJiT25seUZvclRlc3QiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwidmlld1R5cGUiLCJhVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZ2V0TWVzc2FnZXMiLCJnZXRNZXNzYWdlTWFuYWdlciIsInNIaWdoZXN0UHJpb3JpdHkiLCJzSGlnaGVzdFByaW9yaXR5VGV4dCIsImFGaWx0ZXJzIiwiRmlsdGVyIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIk5FIiwidmFsdWUxIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJzaG93TWVzc2FnZUJveCIsImNvbmNhdCIsInB1c2giLCJFUSIsImZuQ2hlY2tDb250cm9sSWRJbkRpYWxvZyIsImFDb250cm9sSWRzIiwiaW5kZXgiLCJJbmZpbml0eSIsIm9Db250cm9sIiwiYnlJZCIsImVycm9yRmllbGRDb250cm9sIiwiZmllbGRSYW5raW5EaWFsb2ciLCJEaWFsb2ciLCJnZXRQYXJlbnQiLCJmaW5kRWxlbWVudHMiLCJpbmRleE9mIiwiZm9jdXMiLCJ0ZXN0IiwiY2FzZVNlbnNpdGl2ZSIsIm1lc3NhZ2VDb2RlIiwiY29kZSIsIk1lc3NhZ2UiLCJtZXNzYWdlIiwidGV4dCIsInBlcnNpc3RlbnQiLCJKU09OTW9kZWwiLCJiSGFzRXRhZ01lc3NhZ2UiLCJtb2RpZnlFVGFnTWVzc2FnZXNPbmx5IiwiZ2V0Q29kZSIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImFNb2RlbERhdGFBcnJheSIsIm9MaXN0QmluZGluZyIsImJpbmRMaXN0IiwiYUN1cnJlbnRDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsImN1cnJlbnRDb250ZXh0IiwiZXhpc3RpbmdNZXNzYWdlcyIsIkFycmF5IiwiaXNBcnJheSIsImdldERhdGEiLCJvVW5pcXVlT2JqIiwiZmlsdGVyIiwib2JqIiwiaWQiLCJzaG93Q2hhbmdlU2V0RXJyb3JEaWFsb2ciLCJmaWx0ZXJlZE1lc3NhZ2VzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwibWVzc2FnZUhhbmRsaW5nIiwidXBkYXRlTWVzc2FnZU9iamVjdEdyb3VwTmFtZSIsInJlamVjdCIsInRoZW4iLCJmbkdldE1lc3NhZ2VTdWJ0aXRsZSIsIm9NZXNzYWdlT2JqZWN0Iiwib1NvcnRlciIsIlNvcnRlciIsIm9iajEiLCJvYmoyIiwicmFua0EiLCJnZXRNZXNzYWdlUmFuayIsInJhbmtCIiwiZ2V0QmluZGluZyIsInNvcnQiLCJpc09wZW4iLCJyZXNpemFibGUiLCJlbmRCdXR0b24iLCJjdXN0b21IZWFkZXIiLCJCYXIiLCJjb250ZW50TWlkZGxlIiwiVGV4dCIsImNvbnRlbnRMZWZ0IiwiY29udGVudFdpZHRoIiwiY29udGVudEhlaWdodCIsInZlcnRpY2FsU2Nyb2xsaW5nIiwiYWZ0ZXJDbG9zZSIsImNhbGwiLCJyZW1vdmVBbGxDb250ZW50IiwiYWRkQ29udGVudCIsInNhcCIsInVpIiwicmVxdWlyZSIsIkJ1dHRvblR5cGUiLCJzZXRCZWdpbkJ1dHRvbiIsImhhc1BlbmRpbmdDaGFuZ2VzIiwicmVzZXRDaGFuZ2VzIiwicmVmcmVzaCIsIkVtcGhhc2l6ZWQiLCJkZXN0cm95QmVnaW5CdXR0b24iLCJnZXRJdGVtcyIsImdldFRyYW5zbGF0ZWRUZXh0Rm9yTWVzc2FnZURpYWxvZyIsInNldFN0YXRlIiwiZ2V0Q3VzdG9tSGVhZGVyIiwiZ2V0Q29udGVudE1pZGRsZSIsInNldFRleHQiLCJvcGVuIiwiY2F0Y2giLCJ0ZWNobmljYWxEZXRhaWxzIiwib3JpZ2luYWxNZXNzYWdlIiwiZm9ybWF0dGVkVGV4dFN0cmluZyIsInJldHJ5QWZ0ZXJNZXNzYWdlIiwiZ2V0QWRkaXRpb25hbFRleHQiLCJnZXRNZXNzYWdlIiwiZm9ybWF0dGVkVGV4dCIsIkZvcm1hdHRlZFRleHQiLCJodG1sVGV4dCIsIk1lc3NhZ2VCb3giLCJlcnJvciIsIm9uQ2xvc2UiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsImFNb2RlbERhdGEiLCJzZXRHcm91cE5hbWVMUlRhYmxlIiwic2V0R3JvdXBOYW1lT1BEaXNwbGF5TW9kZSIsImdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZSIsIm9FbGVtIiwib1Jvd0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwic0VsZW1lQmluZGluZ1BhdGgiLCJnZXRQYXRoIiwiYWxsUm93Q29udGV4dHMiLCJnZXRDb250ZXh0cyIsInJvd0NvbnRleHQiLCJpbmNsdWRlcyIsImNvbnRleHRQYXRoIiwiaWRlbnRpZmllckNvbHVtbiIsImdldElkZW50aWZpZXJDb2x1bW4iLCJyb3dJZGVudGlmaWVyIiwiY29sdW1uUHJvcGVydHlOYW1lIiwiZ2V0VGFibGVDb2xQcm9wZXJ0eSIsInNUYWJsZVRhcmdldENvbE5hbWUiLCJnZXRUYWJsZUNvbEluZm8iLCJnZXRIZWFkZXIiLCJvVmlld0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9wTGF5b3V0IiwiZ2V0Q29udGVudCIsImJJc0dlbmVyYWxHcm91cE5hbWUiLCJnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCIsIm9TZWN0aW9uIiwic3ViU2VjdGlvbnMiLCJnZXRTdWJTZWN0aW9ucyIsIm9TdWJTZWN0aW9uIiwiaXNBIiwic2V0U2VjdGlvbk5hbWVJbkdyb3VwIiwiY2hpbGRUYWJsZUVsZW1lbnQiLCJvRWxlbWVudCIsImdldFRhYmxlQ29sdW1uRGF0YUFuZFNldFN1YnRpbGUiLCJmbkNhbGxiYWNrU2V0R3JvdXBOYW1lIiwib1RhcmdldFRhYmxlSW5mbyIsImhlYWRlck5hbWUiLCJnZXRIZWFkZXJWaXNpYmxlIiwidGFibGVIZWFkZXIiLCJnZXRUaXRsZSIsInNMYXN0QWN0aW9uVGV4dCIsInRvU3RyaW5nIiwiYU1lc3NhZ2UiLCJzR2VuZXJhbEdyb3VwVGV4dCIsIm9UYWJsZSIsImZuU2V0R3JvdXBOYW1lIiwiZ2V0VGFibGVBbmRUYXJnZXRJbmZvIiwic0NvbnRyb2xJZCIsImJJc0NyZWF0aW9uUm93Iiwib1RhYmxlUm93Q29udGV4dCIsImdldENvbnRyb2xJZHMiLCJmaW5kIiwic0lkIiwiaXNDb250cm9sSW5UYWJsZSIsImlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93Iiwic3ViVGl0bGUiLCJnZXRNZXNzYWdlU3VidGl0bGUiLCJvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMiLCJvVGFyZ2V0ZWRDb250cm9sIiwic01lc3NhZ2VTdWJ0aXRsZSIsInNSb3dTdWJ0aXRsZVZhbHVlIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJzVGFibGVGaXJzdENvbFByb3BlcnR5Iiwib0NvbEZyb21UYWJsZVNldHRpbmdzIiwiZmV0Y2hDb2x1bW5JbmZvIiwibGFiZWwiLCJvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24iLCJnZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbiIsInNUYWJsZUZpcnN0Q29sVGV4dEFubm90YXRpb25QYXRoIiwic1RhYmxlRmlyc3RDb2xUZXh0QXJyYW5nZW1lbnQiLCJnZXRWYWx1ZSIsImdldFRhYmxlRmlyc3RDb2xWYWx1ZSIsIm9Db2x1bW5JbmZvIiwiZGV0ZXJtaW5lQ29sdW1uSW5mbyIsInNDb2x1bW5JbmRpY2F0b3IiLCJzQ29sdW1uVmFsdWUiLCJvQmluZGluZ0NvbnRleHQiLCJvTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNUZXh0QW5ub3RhdGlvblBhdGgiLCJzVGV4dEFycmFuZ2VtZW50Iiwic0NvZGVWYWx1ZSIsInNUZXh0VmFsdWUiLCJzQ29tcHV0ZWRWYWx1ZSIsInNsaWNlIiwic0VudW1OdW1iZXIiLCJzQ29sTmFtZUZyb21NZXNzYWdlT2JqIiwiZ2V0VGFyZ2V0cyIsInNwbGl0IiwicG9wIiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm9Db2x1bW4iLCJrZXkiLCJTdHJpbmciLCJhdmFpbGFiaWxpdHkiLCJnZXRJZCIsIm9QYXJlbnRDb250cm9sIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwic1BhdGhUb0JlUmVtb3ZlZCIsImdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbCIsIm9NZXNzYWdlTW9kZWwiLCJsaXN0QmluZGluZyIsIlN0YXJ0c1dpdGgiLCJtYXAiLCJiQm91bmRNZXNzYWdlcyIsImJUcmFuc2l0aW9uT25seSIsImJhY2tlbmRNZXNzYWdlcyIsImFNZXNzYWdlc1RvQmVEZWxldGVkIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwiYUNvbnRleHRzIiwiYWRkaXRpb25hbFRleHQiLCJzdWJ0aXRsZUNvbHVtbiIsImVycm9yQ29udGV4dCIsIm9PYmplY3RQYWdlTGF5b3V0IiwiZ2V0U2VjdGlvbnMiLCJnZXRWaXNpYmxlIiwiZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24iLCJzdWJTZWN0aW9uIiwiZm5GaWx0ZXJVcG9uSWRzIiwiYSIsImIiLCJvQ29udGV4dFBhdGgiLCJmblJlZ0V4cGVzY2FwZSIsInMiLCJyZXBsYWNlIiwiUmVnRXhwIiwic1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkiLCJvVGFibGVUYXJnZXRDb2wiLCJnZXRDb2x1bW5zIiwiY29sdW1uIiwiZ2V0RGF0YVByb3BlcnR5Iiwib0N1c3RvbUNvbHVtbiIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldENvbHVtbnNGb3IiLCJwcm9wZXJ0eUluZm9zIiwibmFtZSIsImFDb2x1bW5zIiwidGFibGVDb2x1bW4iLCJyZWxhdGl2ZVBhdGgiLCJiSXNUYWJsZVRhcmdldENvbFZpc2libGUiLCJzb21lIiwib1RhYmxlQ29sSW5mbyIsIm9JdGVtIiwiY3JlYXRlU2VjdGlvbkdyb3VwTmFtZSIsInNlY3Rpb24iLCJiTXVsdGlwbGVTdWJTZWN0aW9ucyIsImJJc09ycGhhbkVsZW1lbnQiLCJhRWxlbWVudHMiLCJvUGFyZW50RWxlbWVudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibWVzc2FnZUhhbmRsaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgQmFyIGZyb20gXCJzYXAvbS9CYXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgRm9ybWF0dGVkVGV4dCBmcm9tIFwic2FwL20vRm9ybWF0dGVkVGV4dFwiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBNZXNzYWdlSXRlbSBmcm9tIFwic2FwL20vTWVzc2FnZUl0ZW1cIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IE1lc3NhZ2VWaWV3IGZyb20gXCJzYXAvbS9NZXNzYWdlVmlld1wiO1xuaW1wb3J0IFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgVUk1RWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IERhdGVGb3JtYXQgZnJvbSBcInNhcC91aS9jb3JlL2Zvcm1hdC9EYXRlRm9ybWF0XCI7XG5pbXBvcnQgSWNvblBvb2wgZnJvbSBcInNhcC91aS9jb3JlL0ljb25Qb29sXCI7XG5pbXBvcnQgQ29yZUxpYiBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJPcGVyYXRvclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCBTb3J0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9Tb3J0ZXJcIjtcbmltcG9ydCBDb2x1bW4gZnJvbSBcInNhcC91aS90YWJsZS9Db2x1bW5cIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VMYXlvdXQgZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VMYXlvdXRcIjtcbmltcG9ydCBPYmplY3RQYWdlU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVNlY3Rpb25cIjtcbmltcG9ydCBPYmplY3RQYWdlU3ViU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVN1YlNlY3Rpb25cIjtcblxuY29uc3QgTWVzc2FnZVR5cGUgPSBDb3JlTGliLk1lc3NhZ2VUeXBlO1xubGV0IGFNZXNzYWdlTGlzdDogYW55W10gPSBbXTtcbmxldCBhTWVzc2FnZURhdGFMaXN0OiBhbnlbXSA9IFtdO1xubGV0IGFSZXNvbHZlRnVuY3Rpb25zOiBhbnlbXSA9IFtdO1xubGV0IG9EaWFsb2c6IERpYWxvZztcbmxldCBvQmFja0J1dHRvbjogQnV0dG9uO1xubGV0IG9NZXNzYWdlVmlldzogTWVzc2FnZVZpZXc7XG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VXaXRoSGVhZGVyID0gTWVzc2FnZSAmIHtcblx0aGVhZGVyTmFtZT86IHN0cmluZztcblx0dGFyZ2V0Pzogc3RyaW5nO1xuXHRhZGRpdGlvbmFsVGV4dD86IHN0cmluZztcbn07XG5cbnR5cGUgVGFyZ2V0VGFibGVJbmZvVHlwZSA9IHtcblx0b1RhYmxlUm93QmluZGluZ0NvbnRleHRzOiBPRGF0YVY0Q29udGV4dFtdO1xuXHRvVGFibGVSb3dDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZDtcblx0c1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nIHwgYm9vbGVhbjtcblx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHN0cmluZztcblx0dGFibGVIZWFkZXI6IHN0cmluZztcbn07XG5cbnR5cGUgQ29sSW5mb0FuZFN1YnRpdGxlVHlwZSA9IHtcblx0b1RhcmdldFRhYmxlSW5mbzogVGFyZ2V0VGFibGVJbmZvVHlwZTtcblx0c3ViVGl0bGU/OiBzdHJpbmcgfCBudWxsO1xufTtcblxudHlwZSBDb2x1bW5JbmZvVHlwZSA9IHtcblx0c0NvbHVtblZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHNDb2x1bW5JbmRpY2F0b3I6IHN0cmluZztcbn07XG5cbnR5cGUgQ29sdW1uV2l0aExhYmVsVHlwZSA9IENvbHVtbiAmIHtcblx0bGFiZWw/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBtZXNzYWdlSGFuZGxpbmdUeXBlID0ge1xuXHRnZXRNZXNzYWdlczogKGJCb3VuZE1lc3NhZ2VzPzogYW55LCBiVHJhbnNpdGlvbk9ubHk/OiBhbnkpID0+IGFueVtdO1xuXHRzaG93VW5ib3VuZE1lc3NhZ2VzOiAoXG5cdFx0YUN1c3RvbU1lc3NhZ2VzPzogYW55W10sXG5cdFx0b0NvbnRleHQ/OiBhbnksXG5cdFx0YlNob3dCb3VuZFRyYW5zaXRpb24/OiBib29sZWFuLFxuXHRcdGNvbmN1cnJlbnRFZGl0RmxhZz86IGJvb2xlYW4sXG5cdFx0b0NvbnRyb2w/OiBDb250cm9sLFxuXHRcdHNBY3Rpb25OYW1lPzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdGJPbmx5Rm9yVGVzdD86IGJvb2xlYW4sXG5cdFx0b25CZWZvcmVTaG93TWVzc2FnZT86IChtZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnM6IGFueSkgPT4gYW55LFxuXHRcdHZpZXdUeXBlPzogc3RyaW5nXG5cdCkgPT4gUHJvbWlzZTxhbnk+O1xuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiAoKSA9PiB2b2lkO1xuXHRtb2RpZnlFVGFnTWVzc2FnZXNPbmx5OiAob01lc3NhZ2VNYW5hZ2VyOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsIGNvbmN1cnJlbnRFZGl0RmxhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCkgPT4gYm9vbGVhbjtcblx0cmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXM6IChzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSA9PiB2b2lkO1xuXHRnZXRSZXRyeUFmdGVyTWVzc2FnZTogKG9NZXNzYWdlOiBhbnksIGJNZXNzYWdlRGlhbG9nPzogYW55KSA9PiBhbnk7XG5cdHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZzogKG9NZXNzYWdlRGlhbG9nTW9kZWw6IEpTT05Nb2RlbCwgYlN0cmljdEhhbmRsaW5nRmxvdzogYm9vbGVhbiwgaXNNdWx0aTQxMj86IGJvb2xlYW4pID0+IGFueTtcblx0c2V0TWVzc2FnZVN1YnRpdGxlOiAob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBDb250ZXh0W10sIG1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyKSA9PiB2b2lkO1xuXHRnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dDogKG9PYmplY3RQYWdlTGF5b3V0OiBDb250cm9sKSA9PiBhbnk7XG5cdGdldENvbnRyb2xGcm9tTWVzc2FnZVJlbGF0aW5nVG9TdWJTZWN0aW9uOiAoc3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24sIG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlcikgPT4gVUk1RWxlbWVudFtdO1xuXHRmbkZpbHRlclVwb25JZHM6IChhQ29udHJvbElkczogc3RyaW5nW10sIG9JdGVtOiBVSTVFbGVtZW50KSA9PiBib29sZWFuO1xuXHRnZXRUYWJsZUFuZFRhcmdldEluZm86IChcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlcixcblx0XHRvRWxlbWVudDogVUk1RWxlbWVudCB8IHVuZGVmaW5lZCxcblx0XHRvUm93QmluZGluZzogQmluZGluZ1xuXHQpID0+IFRhcmdldFRhYmxlSW5mb1R5cGU7XG5cdGNyZWF0ZVNlY3Rpb25Hcm91cE5hbWU6IChcblx0XHRzZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbixcblx0XHRzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbixcblx0XHRiTXVsdGlwbGVTdWJTZWN0aW9uczogYm9vbGVhbixcblx0XHRvVGFyZ2V0VGFibGVJbmZvOiBUYXJnZXRUYWJsZUluZm9UeXBlLFxuXHRcdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWxcblx0KSA9PiBzdHJpbmc7XG5cdGJJc09ycGhhbkVsZW1lbnQ6IChvRWxlbWVudDogVUk1RWxlbWVudCwgYUVsZW1lbnRzOiBVSTVFbGVtZW50W10pID0+IGJvb2xlYW47XG5cdGdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZTogKHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IHN0cmluZztcblx0Z2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZTogKFxuXHRcdGFNZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlcixcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdG9FbGVtZW50OiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkLFxuXHRcdG9Sb3dCaW5kaW5nOiBCaW5kaW5nLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0c2V0U2VjdGlvbk5hbWVJbkdyb3VwOiBCb29sZWFuLFxuXHRcdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWU6IGFueVxuXHQpID0+IENvbEluZm9BbmRTdWJ0aXRsZVR5cGU7XG5cdGdldFRhYmxlQ29sSW5mbzogKG9UYWJsZTogQ29udHJvbCwgc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHN0cmluZykgPT4gYW55O1xuXHRnZXRUYWJsZUNvbFByb3BlcnR5OiAob1RhYmxlOiBDb250cm9sLCBvTWVzc2FnZU9iamVjdDogTWVzc2FnZVdpdGhIZWFkZXIsIG9Db250ZXh0UGF0aD86IGFueSkgPT4gYW55O1xuXHRnZXRNZXNzYWdlU3VidGl0bGU6IChcblx0XHRtZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlcixcblx0XHRvVGFibGVSb3dCaW5kaW5nQ29udGV4dHM6IE9EYXRhVjRDb250ZXh0W10sXG5cdFx0b1RhYmxlUm93Q29udGV4dDogT0RhdGFWNENvbnRleHQgfCB1bmRlZmluZWQsXG5cdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nIHwgYm9vbGVhbixcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdGJJc0NyZWF0aW9uUm93OiBib29sZWFuIHwgdW5kZWZpbmVkLFxuXHRcdG9UYXJnZXRlZENvbnRyb2w/OiBDb250cm9sXG5cdCkgPT4gc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblx0ZGV0ZXJtaW5lQ29sdW1uSW5mbzogKG9Db2xGcm9tVGFibGVTZXR0aW5nczogYW55LCByZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsKSA9PiBDb2x1bW5JbmZvVHlwZTtcblx0ZmV0Y2hDb2x1bW5JbmZvOiAob01lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLCBvVGFibGU6IFRhYmxlKSA9PiBDb2x1bW47XG5cdGdldFRhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dEZvclRleHRBbm5vdGF0aW9uOiAoXG5cdFx0b1RhYmxlOiBUYWJsZSxcblx0XHRvVGFibGVSb3dDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZCxcblx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmdcblx0KSA9PiBDb250ZXh0IHwgbnVsbCB8IHVuZGVmaW5lZDtcblx0Z2V0TWVzc2FnZVJhbms6IChvYmo6IE1lc3NhZ2VXaXRoSGVhZGVyKSA9PiBudW1iZXI7XG5cdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWU6IChhTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGJJc0dlbmVyYWxHcm91cE5hbWU/OiBCb29sZWFuKSA9PiBhbnk7XG5cdGdldFRhYmxlRmlyc3RDb2xWYWx1ZTogKFxuXHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZyxcblx0XHRvVGFibGVSb3dDb250ZXh0OiBDb250ZXh0LFxuXHRcdHNUZXh0QW5ub3RhdGlvblBhdGg6IHN0cmluZyxcblx0XHRzVGV4dEFycmFuZ2VtZW50OiBzdHJpbmdcblx0KSA9PiBzdHJpbmc7XG5cdHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGU6IChhTW9kZWxEYXRhOiBNZXNzYWdlV2l0aEhlYWRlciwgc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgY29udHJvbDogYW55KSA9PiB2b2lkO1xuXHR1cGRhdGVNZXNzYWdlT2JqZWN0R3JvdXBOYW1lOiAoXG5cdFx0YU1vZGVsRGF0YUFycmF5OiBNZXNzYWdlV2l0aEhlYWRlcltdLFxuXHRcdGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQsXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHR2aWV3VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cdCkgPT4gdm9pZDtcblx0c2V0R3JvdXBOYW1lTFJUYWJsZTogKGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQsIGFNb2RlbERhdGE6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiB2b2lkO1xuXHRpc0NvbnRyb2xJblRhYmxlOiAob1RhYmxlOiBUYWJsZSwgc0NvbnRyb2xJZDogc3RyaW5nKSA9PiBVSTVFbGVtZW50W10gfCBib29sZWFuO1xuXHRpc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdzogKG9Db250cm9sOiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkKSA9PiBib29sZWFuO1xufTtcblxuZnVuY3Rpb24gZm5Gb3JtYXRUZWNobmljYWxEZXRhaWxzKCkge1xuXHRsZXQgc1ByZXZpb3VzR3JvdXBOYW1lOiBzdHJpbmc7XG5cblx0Ly8gSW5zZXJ0IHRlY2huaWNhbCBkZXRhaWwgaWYgaXQgZXhpc3RzXG5cdGZ1bmN0aW9uIGluc2VydERldGFpbChvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiBvUHJvcGVydHkucHJvcGVydHlcblx0XHRcdD8gXCIoICR7XCIgK1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eS5wcm9wZXJ0eSArXG5cdFx0XHRcdFx0J30gPyAoXCI8cD4nICtcblx0XHRcdFx0XHRvUHJvcGVydHkucHJvcGVydHkuc3Vic3RyKE1hdGgubWF4KG9Qcm9wZXJ0eS5wcm9wZXJ0eS5sYXN0SW5kZXhPZihcIi9cIiksIG9Qcm9wZXJ0eS5wcm9wZXJ0eS5sYXN0SW5kZXhPZihcIi5cIikpICsgMSkgK1xuXHRcdFx0XHRcdCcgOiBcIiArICcgK1xuXHRcdFx0XHRcdFwiJHtcIiArXG5cdFx0XHRcdFx0b1Byb3BlcnR5LnByb3BlcnR5ICtcblx0XHRcdFx0XHQnfSArIFwiPC9wPlwiKSA6IFwiXCIgKSdcblx0XHRcdDogXCJcIjtcblx0fVxuXHQvLyBJbnNlcnQgZ3JvdXBuYW1lIGlmIGl0IGV4aXN0c1xuXHRmdW5jdGlvbiBpbnNlcnRHcm91cE5hbWUob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRsZXQgc0hUTUwgPSBcIlwiO1xuXHRcdGlmIChvUHJvcGVydHkuZ3JvdXBOYW1lICYmIG9Qcm9wZXJ0eS5wcm9wZXJ0eSAmJiBvUHJvcGVydHkuZ3JvdXBOYW1lICE9PSBzUHJldmlvdXNHcm91cE5hbWUpIHtcblx0XHRcdHNIVE1MICs9IFwiKCAke1wiICsgb1Byb3BlcnR5LnByb3BlcnR5ICsgJ30gPyBcIjxicj48aDM+JyArIG9Qcm9wZXJ0eS5ncm91cE5hbWUgKyAnPC9oMz5cIiA6IFwiXCIgKSArICc7XG5cdFx0XHRzUHJldmlvdXNHcm91cE5hbWUgPSBvUHJvcGVydHkuZ3JvdXBOYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4gc0hUTUw7XG5cdH1cblxuXHQvLyBMaXN0IG9mIHRlY2huaWNhbCBkZXRhaWxzIHRvIGJlIHNob3duXG5cdGZ1bmN0aW9uIGdldFBhdGhzKCkge1xuXHRcdGNvbnN0IHNURCA9IFwidGVjaG5pY2FsRGV0YWlsc1wiOyAvLyBuYW1lIG9mIHByb3BlcnR5IGluIG1lc3NhZ2UgbW9kZWwgZGF0YSBmb3IgdGVjaG5pY2FsIGRldGFpbHNcblx0XHRyZXR1cm4gW1xuXHRcdFx0eyBncm91cE5hbWU6IFwiXCIsIHByb3BlcnR5OiBgJHtzVER9L3N0YXR1c2AgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIlwiLCBwcm9wZXJ0eTogYCR7c1REfS9zdGF0dXNUZXh0YCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiQXBwbGljYXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL0NvbXBvbmVudElkYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiQXBwbGljYXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL1NlcnZpY2VJZGAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkFwcGxpY2F0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5BcHBsaWNhdGlvbi9TZXJ2aWNlUmVwb3NpdG9yeWAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkFwcGxpY2F0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5BcHBsaWNhdGlvbi9TZXJ2aWNlVmVyc2lvbmAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXJyb3JSZXNvbHV0aW9uL0FuYWx5c2lzYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5FcnJvclJlc29sdXRpb24vTm90ZWAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXJyb3JSZXNvbHV0aW9uL0RldGFpbGVkTm90ZWAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXhjZXB0aW9uQ2F0ZWdvcnlgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLlRpbWVTdGFtcGAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uVHJhbnNhY3Rpb25JZGAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIk1lc3NhZ2VzXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL2NvZGVgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJNZXNzYWdlc1wiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9tZXNzYWdlYCB9XG5cdFx0XTtcblx0fVxuXG5cdGxldCBzSFRNTCA9IFwiT2JqZWN0LmtleXMoXCIgKyBcIiR7dGVjaG5pY2FsRGV0YWlsc31cIiArICcpLmxlbmd0aCA+IDAgPyBcIjxoMj5UZWNobmljYWwgRGV0YWlsczwvaDI+XCIgOiBcIlwiICc7XG5cdGdldFBhdGhzKCkuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BlcnR5OiB7IGdyb3VwTmFtZTogc3RyaW5nOyBwcm9wZXJ0eTogc3RyaW5nIH0pIHtcblx0XHRzSFRNTCA9IGAke3NIVE1MICsgaW5zZXJ0R3JvdXBOYW1lKG9Qcm9wZXJ0eSl9JHtpbnNlcnREZXRhaWwob1Byb3BlcnR5KX0gKyBgO1xuXHR9KTtcblx0cmV0dXJuIHNIVE1MO1xufVxuZnVuY3Rpb24gZm5Gb3JtYXREZXNjcmlwdGlvbigpIHtcblx0cmV0dXJuIFwiKCR7XCIgKyAnZGVzY3JpcHRpb259ID8gKFwiPGgyPkRlc2NyaXB0aW9uPC9oMj5cIiArICR7JyArICdkZXNjcmlwdGlvbn0pIDogXCJcIiknO1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoaWdoZXN0IHByaW9yaXR5IG1lc3NhZ2UgdHlwZShFcnJvci9XYXJuaW5nL1N1Y2Nlc3MvSW5mb3JtYXRpb24pIGZyb20gdGhlIGF2YWlsYWJsZSBtZXNzYWdlcy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMubWVzc2FnZUhhbmRsaW5nLmZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eVxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMubWVzc2FnZUhhbmRsaW5nXG4gKiBAcGFyYW0gW2FNZXNzYWdlc10gTWVzc2FnZXMgbGlzdFxuICogQHJldHVybnMgSGlnaGVzdCBwcmlvcml0eSBtZXNzYWdlIGZyb20gdGhlIGF2YWlsYWJsZSBtZXNzYWdlc1xuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBmbkdldEhpZ2hlc3RNZXNzYWdlUHJpb3JpdHkoYU1lc3NhZ2VzOiBhbnlbXSkge1xuXHRsZXQgc01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLk5vbmU7XG5cdGNvbnN0IGlMZW5ndGggPSBhTWVzc2FnZXMubGVuZ3RoO1xuXHRjb25zdCBvTWVzc2FnZUNvdW50OiBhbnkgPSB7IEVycm9yOiAwLCBXYXJuaW5nOiAwLCBTdWNjZXNzOiAwLCBJbmZvcm1hdGlvbjogMCB9O1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgaUxlbmd0aDsgaSsrKSB7XG5cdFx0KytvTWVzc2FnZUNvdW50W2FNZXNzYWdlc1tpXS5nZXRUeXBlKCldO1xuXHR9XG5cdGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkVycm9yXSA+IDApIHtcblx0XHRzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5XYXJuaW5nXSA+IDApIHtcblx0XHRzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLlN1Y2Nlc3NdID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5TdWNjZXNzO1xuXHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuSW5mb3JtYXRpb25dID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbjtcblx0fVxuXHRyZXR1cm4gc01lc3NhZ2VQcmlvcml0eTtcbn1cbi8vIGZ1bmN0aW9uIHdoaWNoIG1vZGlmeSBlLVRhZyBtZXNzYWdlcyBvbmx5LlxuLy8gcmV0dXJucyA6IHRydWUsIGlmIGFueSBlLVRhZyBtZXNzYWdlIGlzIG1vZGlmaWVkLCBvdGhlcndpc2UgZmFsc2UuXG5mdW5jdGlvbiBmbk1vZGlmeUVUYWdNZXNzYWdlc09ubHkob01lc3NhZ2VNYW5hZ2VyOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsIGNvbmN1cnJlbnRFZGl0RmxhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRjb25zdCBhTWVzc2FnZXMgPSBvTWVzc2FnZU1hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0T2JqZWN0KFwiL1wiKTtcblx0bGV0IGJNZXNzYWdlc01vZGlmaWVkID0gZmFsc2U7XG5cdGxldCBzRXRhZ01lc3NhZ2UgPSBcIlwiO1xuXHRhTWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSwgaTogYW55KSB7XG5cdFx0Y29uc3Qgb1RlY2huaWNhbERldGFpbHMgPSBvTWVzc2FnZS5nZXRUZWNobmljYWxEZXRhaWxzICYmIG9NZXNzYWdlLmdldFRlY2huaWNhbERldGFpbHMoKTtcblx0XHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNDEyICYmIG9UZWNobmljYWxEZXRhaWxzLmlzQ29uY3VycmVudE1vZGlmaWNhdGlvbikge1xuXHRcdFx0aWYgKGNvbmN1cnJlbnRFZGl0RmxhZykge1xuXHRcdFx0XHRzRXRhZ01lc3NhZ2UgPVxuXHRcdFx0XHRcdHNFdGFnTWVzc2FnZSB8fCBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9FVEFHX1RFQ0hOSUNBTF9JU1NVRVNfQ09OQ1VSUkVOVF9NT0RJRklDQVRJT05cIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzRXRhZ01lc3NhZ2UgPSBzRXRhZ01lc3NhZ2UgfHwgb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0FQUF9DT01QT05FTlRfU0FQRkVfRVRBR19URUNITklDQUxfSVNTVUVTXCIpO1xuXHRcdFx0fVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGFNZXNzYWdlc1tpXSk7XG5cdFx0XHRvTWVzc2FnZS5zZXRNZXNzYWdlKHNFdGFnTWVzc2FnZSk7XG5cdFx0XHRvTWVzc2FnZS50YXJnZXQgPSBcIlwiO1xuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLmFkZE1lc3NhZ2VzKG9NZXNzYWdlKTtcblx0XHRcdGJNZXNzYWdlc01vZGlmaWVkID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYk1lc3NhZ2VzTW9kaWZpZWQ7XG59XG4vLyBEaWFsb2cgY2xvc2UgSGFuZGxpbmdcbmZ1bmN0aW9uIGRpYWxvZ0Nsb3NlSGFuZGxlcigpIHtcblx0b0RpYWxvZy5jbG9zZSgpO1xuXHRvQmFja0J1dHRvbi5zZXRWaXNpYmxlKGZhbHNlKTtcblx0YU1lc3NhZ2VMaXN0ID0gW107XG5cdGNvbnN0IG9NZXNzYWdlRGlhbG9nTW9kZWw6IGFueSA9IG9NZXNzYWdlVmlldy5nZXRNb2RlbCgpO1xuXHRpZiAob01lc3NhZ2VEaWFsb2dNb2RlbCkge1xuXHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdH1cblx0cmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xufVxuZnVuY3Rpb24gZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2U6IGFueSwgYk1lc3NhZ2VEaWFsb2c/OiBhbnkpIHtcblx0Y29uc3QgZE5vdyA9IG5ldyBEYXRlKCk7XG5cdGNvbnN0IG9UZWNobmljYWxEZXRhaWxzID0gb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscygpO1xuXHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRsZXQgc1JldHJ5QWZ0ZXJNZXNzYWdlO1xuXHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNTAzICYmIG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRjb25zdCBkUmV0cnlBZnRlciA9IG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXI7XG5cdFx0bGV0IG9EYXRlRm9ybWF0O1xuXHRcdGlmIChkTm93LmdldEZ1bGxZZWFyKCkgIT09IGRSZXRyeUFmdGVyLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdC8vZGlmZmVyZW50IHllYXJzXG5cdFx0XHRvRGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZVRpbWVJbnN0YW5jZSh7XG5cdFx0XHRcdHBhdHRlcm46IFwiTU1NTSBkZCwgeXl5eSAnYXQnIGhoOm1tIGFcIlxuXHRcdFx0fSk7XG5cdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JcIiwgW29EYXRlRm9ybWF0LmZvcm1hdChkUmV0cnlBZnRlcildKTtcblx0XHR9IGVsc2UgaWYgKGROb3cuZ2V0RnVsbFllYXIoKSA9PSBkUmV0cnlBZnRlci5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHQvL3NhbWUgeWVhclxuXHRcdFx0aWYgKGJNZXNzYWdlRGlhbG9nKSB7XG5cdFx0XHRcdC8vbGVzcyB0aGFuIDIgbWluXG5cdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19USVRMRVwiKX0gJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcblx0XHRcdFx0XHRcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfREVTQ1wiXG5cdFx0XHRcdCl9YDtcblx0XHRcdH0gZWxzZSBpZiAoZE5vdy5nZXRNb250aCgpICE9PSBkUmV0cnlBZnRlci5nZXRNb250aCgpIHx8IGROb3cuZ2V0RGF0ZSgpICE9PSBkUmV0cnlBZnRlci5nZXREYXRlKCkpIHtcblx0XHRcdFx0b0RhdGVGb3JtYXQgPSBEYXRlRm9ybWF0LmdldERhdGVUaW1lSW5zdGFuY2Uoe1xuXHRcdFx0XHRcdHBhdHRlcm46IFwiTU1NTSBkZCAnYXQnIGhoOm1tIGFcIlxuXHRcdFx0XHR9KTsgLy9kaWZmZXJlbnQgbW9udGhzIG9yIGRpZmZlcmVudCBkYXlzIG9mIHNhbWUgbW9udGhcblx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SXCIsIFtvRGF0ZUZvcm1hdC5mb3JtYXQoZFJldHJ5QWZ0ZXIpXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3NhbWUgZGF5XG5cdFx0XHRcdG9EYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlVGltZUluc3RhbmNlKHtcblx0XHRcdFx0XHRwYXR0ZXJuOiBcImhoOm1tIGFcIlxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SX0RBWVwiLCBbb0RhdGVGb3JtYXQuZm9ybWF0KGRSZXRyeUFmdGVyKV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA1MDMgJiYgIW9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JfTk9fUkVUUllfQUZURVJcIik7XG5cdH1cblx0cmV0dXJuIHNSZXRyeUFmdGVyTWVzc2FnZTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nKG9NZXNzYWdlRGlhbG9nTW9kZWw6IEpTT05Nb2RlbCwgYlN0cmljdEhhbmRsaW5nRmxvdzogYm9vbGVhbiwgbXVsdGk0MTI/OiBib29sZWFuKSB7XG5cdGxldCBvTWVzc2FnZVRlbXBsYXRlOiBNZXNzYWdlSXRlbTtcblx0aWYgKCFiU3RyaWN0SGFuZGxpbmdGbG93KSB7XG5cdFx0Y29uc3QgZGVzY3JpcHRpb25CaW5kaW5nID0gJ3s9ICR7ZGVzY3JpcHRpb259ID8gXCI8aHRtbD48Ym9keT5cIiArICcgKyBmbkZvcm1hdERlc2NyaXB0aW9uKCkgKyAnICsgXCI8L2h0bWw+PC9ib2R5PlwiIDogXCJcIiB9Jztcblx0XHRjb25zdCB0ZWNobmljYWxEZXRhaWxzQmluZGluZyA9XG5cdFx0XHQnez0gJHt0ZWNobmljYWxEZXRhaWxzfSA/IFwiPGh0bWw+PGJvZHk+XCIgKyAnICsgZm5Gb3JtYXRUZWNobmljYWxEZXRhaWxzKCkgKyAnICsgXCI8L2h0bWw+PC9ib2R5PlwiIDogXCJcIiB9Jztcblx0XHRvTWVzc2FnZVRlbXBsYXRlID0gbmV3IE1lc3NhZ2VJdGVtKHVuZGVmaW5lZCwge1xuXHRcdFx0Y291bnRlcjogeyBwYXRoOiBcImNvdW50ZXJcIiB9LFxuXHRcdFx0dGl0bGU6IFwie21lc3NhZ2V9XCIsXG5cdFx0XHRzdWJ0aXRsZTogXCJ7YWRkaXRpb25hbFRleHR9XCIsXG5cdFx0XHRsb25ndGV4dFVybDogXCJ7ZGVzY3JpcHRpb25Vcmx9XCIsXG5cdFx0XHR0eXBlOiB7IHBhdGg6IFwidHlwZVwiIH0sXG5cdFx0XHRncm91cE5hbWU6IFwie2hlYWRlck5hbWV9XCIsXG5cdFx0XHRkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25CaW5kaW5nICsgdGVjaG5pY2FsRGV0YWlsc0JpbmRpbmcsXG5cdFx0XHRtYXJrdXBEZXNjcmlwdGlvbjogdHJ1ZVxuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKG11bHRpNDEyKSB7XG5cdFx0b01lc3NhZ2VUZW1wbGF0ZSA9IG5ldyBNZXNzYWdlSXRlbSh1bmRlZmluZWQsIHtcblx0XHRcdGNvdW50ZXI6IHsgcGF0aDogXCJjb3VudGVyXCIgfSxcblx0XHRcdHRpdGxlOiBcInttZXNzYWdlfVwiLFxuXHRcdFx0c3VidGl0bGU6IFwie2FkZGl0aW9uYWxUZXh0fVwiLFxuXHRcdFx0bG9uZ3RleHRVcmw6IFwie2Rlc2NyaXB0aW9uVXJsfVwiLFxuXHRcdFx0dHlwZTogeyBwYXRoOiBcInR5cGVcIiB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IFwie2Rlc2NyaXB0aW9ufVwiLFxuXHRcdFx0bWFya3VwRGVzY3JpcHRpb246IHRydWVcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvTWVzc2FnZVRlbXBsYXRlID0gbmV3IE1lc3NhZ2VJdGVtKHtcblx0XHRcdHRpdGxlOiBcInttZXNzYWdlfVwiLFxuXHRcdFx0dHlwZTogeyBwYXRoOiBcInR5cGVcIiB9LFxuXHRcdFx0bG9uZ3RleHRVcmw6IFwie2Rlc2NyaXB0aW9uVXJsfVwiXG5cdFx0fSk7XG5cdH1cblx0b01lc3NhZ2VWaWV3ID0gbmV3IE1lc3NhZ2VWaWV3KHtcblx0XHRzaG93RGV0YWlsc1BhZ2VIZWFkZXI6IGZhbHNlLFxuXHRcdGl0ZW1TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHRcdG9CYWNrQnV0dG9uLnNldFZpc2libGUodHJ1ZSk7XG5cdFx0fSxcblx0XHRpdGVtczoge1xuXHRcdFx0cGF0aDogXCIvXCIsXG5cdFx0XHR0ZW1wbGF0ZTogb01lc3NhZ2VUZW1wbGF0ZVxuXHRcdH1cblx0fSk7XG5cdG9NZXNzYWdlVmlldy5zZXRHcm91cEl0ZW1zKHRydWUpO1xuXHRvQmFja0J1dHRvbiA9XG5cdFx0b0JhY2tCdXR0b24gfHxcblx0XHRuZXcgQnV0dG9uKHtcblx0XHRcdGljb246IEljb25Qb29sLmdldEljb25VUkkoXCJuYXYtYmFja1wiKSxcblx0XHRcdHZpc2libGU6IGZhbHNlLFxuXHRcdFx0cHJlc3M6IGZ1bmN0aW9uICh0aGlzOiBCdXR0b24pIHtcblx0XHRcdFx0b01lc3NhZ2VWaWV3Lm5hdmlnYXRlQmFjaygpO1xuXHRcdFx0XHR0aGlzLnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHQvLyBVcGRhdGUgcHJvcGVyIEVUYWcgTWlzbWF0Y2ggZXJyb3Jcblx0b01lc3NhZ2VWaWV3LnNldE1vZGVsKG9NZXNzYWdlRGlhbG9nTW9kZWwpO1xuXHRyZXR1cm4ge1xuXHRcdG9NZXNzYWdlVmlldyxcblx0XHRvQmFja0J1dHRvblxuXHR9O1xufVxuXG5mdW5jdGlvbiBzaG93VW5ib3VuZE1lc3NhZ2VzKFxuXHR0aGlzOiBtZXNzYWdlSGFuZGxpbmdUeXBlLFxuXHRhQ3VzdG9tTWVzc2FnZXM/OiBhbnlbXSxcblx0b0NvbnRleHQ/OiBhbnksXG5cdGJTaG93Qm91bmRUcmFuc2l0aW9uPzogYm9vbGVhbixcblx0Y29uY3VycmVudEVkaXRGbGFnPzogYm9vbGVhbixcblx0Y29udHJvbD86IENvbnRyb2wsXG5cdHNBY3Rpb25OYW1lPzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRiT25seUZvclRlc3Q/OiBib29sZWFuLFxuXHRvbkJlZm9yZVNob3dNZXNzYWdlPzogKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSA9PiBhbnksXG5cdHZpZXdUeXBlPzogc3RyaW5nXG4pOiBQcm9taXNlPGFueT4ge1xuXHRsZXQgYVRyYW5zaXRpb25NZXNzYWdlcyA9IHRoaXMuZ2V0TWVzc2FnZXMoKTtcblx0Y29uc3Qgb01lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRsZXQgc0hpZ2hlc3RQcmlvcml0eTtcblx0bGV0IHNIaWdoZXN0UHJpb3JpdHlUZXh0O1xuXHRjb25zdCBhRmlsdGVycyA9IFtuZXcgRmlsdGVyKHsgcGF0aDogXCJwZXJzaXN0ZW50XCIsIG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5ORSwgdmFsdWUxOiBmYWxzZSB9KV07XG5cdGxldCBzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IGZhbHNlLFxuXHRcdHNob3dNZXNzYWdlQm94OiBib29sZWFuIHwgdW5kZWZpbmVkID0gZmFsc2U7XG5cblx0aWYgKGJTaG93Qm91bmRUcmFuc2l0aW9uKSB7XG5cdFx0YVRyYW5zaXRpb25NZXNzYWdlcyA9IGFUcmFuc2l0aW9uTWVzc2FnZXMuY29uY2F0KGdldE1lc3NhZ2VzKHRydWUsIHRydWUpKTtcblx0XHQvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIG5vdCBib3VuZCBzdGF0ZSBtZXNzYWdlcyBoZW5jZSBhZGQgYSBmaWx0ZXIgZm9yIHRoZSBzYW1lXG5cdFx0YUZpbHRlcnMucHVzaChuZXcgRmlsdGVyKHsgcGF0aDogXCJwZXJzaXN0ZW50XCIsIG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSwgdmFsdWUxOiB0cnVlIH0pKTtcblx0XHRjb25zdCBmbkNoZWNrQ29udHJvbElkSW5EaWFsb2cgPSBmdW5jdGlvbiAoYUNvbnRyb2xJZHM6IGFueSkge1xuXHRcdFx0bGV0IGluZGV4ID0gSW5maW5pdHksXG5cdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBNYW5hZ2VkT2JqZWN0IHwgbnVsbDtcblx0XHRcdGNvbnN0IGVycm9yRmllbGRDb250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBDb250cm9sO1xuXHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdGNvbnN0IGZpZWxkUmFua2luRGlhbG9nID1cblx0XHRcdFx0XHRvQ29udHJvbCBpbnN0YW5jZW9mIERpYWxvZ1xuXHRcdFx0XHRcdFx0PyAoZXJyb3JGaWVsZENvbnRyb2wuZ2V0UGFyZW50KCkgYXMgYW55KS5maW5kRWxlbWVudHModHJ1ZSkuaW5kZXhPZihlcnJvckZpZWxkQ29udHJvbClcblx0XHRcdFx0XHRcdDogSW5maW5pdHk7XG5cdFx0XHRcdGlmIChvQ29udHJvbCBpbnN0YW5jZW9mIERpYWxvZykge1xuXHRcdFx0XHRcdGlmIChpbmRleCA+IGZpZWxkUmFua2luRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IGZpZWxkUmFua2luRGlhbG9nO1xuXHRcdFx0XHRcdFx0Ly8gU2V0IHRoZSBmb2N1cyB0byB0aGUgZGlhbG9nJ3MgY29udHJvbFxuXHRcdFx0XHRcdFx0ZXJyb3JGaWVsZENvbnRyb2wuZm9jdXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gbWVzc2FnZXMgd2l0aCB0YXJnZXQgaW5zaWRlIHNhcC5tLkRpYWxvZyBzaG91bGQgbm90IGJyaW5nIHVwIHRoZSBtZXNzYWdlIGRpYWxvZ1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0XHRhRmlsdGVycy5wdXNoKFxuXHRcdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IFwiY29udHJvbElkc1wiLFxuXHRcdFx0XHR0ZXN0OiBmbkNoZWNrQ29udHJvbElkSW5EaWFsb2csXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IHRydWVcblx0XHRcdH0pXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHQvLyBvbmx5IHVuYm91bmQgbWVzc2FnZXMgaGF2ZSB0byBiZSBzaG93biBzbyBhZGQgZmlsdGVyIGFjY29yZGluZ2x5XG5cdFx0YUZpbHRlcnMucHVzaChuZXcgRmlsdGVyKHsgcGF0aDogXCJ0YXJnZXRcIiwgb3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLCB2YWx1ZTE6IFwiXCIgfSkpO1xuXHR9XG5cdGlmIChhQ3VzdG9tTWVzc2FnZXMgJiYgYUN1c3RvbU1lc3NhZ2VzLmxlbmd0aCkge1xuXHRcdGFDdXN0b21NZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRjb25zdCBtZXNzYWdlQ29kZSA9IG9NZXNzYWdlLmNvZGUgPyBvTWVzc2FnZS5jb2RlIDogXCJcIjtcblx0XHRcdG9NZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhcblx0XHRcdFx0bmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IG9NZXNzYWdlLnRleHQsXG5cdFx0XHRcdFx0dHlwZTogb01lc3NhZ2UudHlwZSxcblx0XHRcdFx0XHR0YXJnZXQ6IFwiXCIsXG5cdFx0XHRcdFx0cGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRjb2RlOiBtZXNzYWdlQ29kZVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHRcdC8vVGhlIHRhcmdldCBhbmQgcGVyc2lzdGVudCBwcm9wZXJ0aWVzIG9mIHRoZSBtZXNzYWdlIGFyZSBoYXJkY29kZWQgYXMgXCJcIiBhbmQgdHJ1ZSBiZWNhdXNlIHRoZSBmdW5jdGlvbiBkZWFscyB3aXRoIG9ubHkgdW5ib3VuZCBtZXNzYWdlcy5cblx0XHR9KTtcblx0fVxuXHRjb25zdCBvTWVzc2FnZURpYWxvZ01vZGVsID0gKG9NZXNzYWdlVmlldyAmJiAob01lc3NhZ2VWaWV3LmdldE1vZGVsKCkgYXMgSlNPTk1vZGVsKSkgfHwgbmV3IEpTT05Nb2RlbCgpO1xuXHRjb25zdCBiSGFzRXRhZ01lc3NhZ2UgPSB0aGlzLm1vZGlmeUVUYWdNZXNzYWdlc09ubHkob01lc3NhZ2VNYW5hZ2VyLCBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLCBjb25jdXJyZW50RWRpdEZsYWcpO1xuXG5cdGlmIChhVHJhbnNpdGlvbk1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBhVHJhbnNpdGlvbk1lc3NhZ2VzWzBdLmdldENvZGUoKSA9PT0gXCI1MDNcIikge1xuXHRcdHNob3dNZXNzYWdlQm94ID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChhVHJhbnNpdGlvbk1lc3NhZ2VzLmxlbmd0aCAhPT0gMCkge1xuXHRcdHNob3dNZXNzYWdlRGlhbG9nID0gdHJ1ZTtcblx0fVxuXHRsZXQgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzOiBhbnk7XG5cdGxldCBhTW9kZWxEYXRhQXJyYXk6IE1lc3NhZ2VXaXRoSGVhZGVyW10gPSBbXTtcblx0aWYgKHNob3dNZXNzYWdlRGlhbG9nIHx8ICghc2hvd01lc3NhZ2VCb3ggJiYgIW9uQmVmb3JlU2hvd01lc3NhZ2UpKSB7XG5cdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb01lc3NhZ2VNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLmJpbmRMaXN0KFwiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgYUZpbHRlcnMpLFxuXHRcdFx0YUN1cnJlbnRDb250ZXh0cyA9IG9MaXN0QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKTtcblx0XHRpZiAoYUN1cnJlbnRDb250ZXh0cyAmJiBhQ3VycmVudENvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gdHJ1ZTtcblx0XHRcdC8vIERvbid0IHNob3cgZGlhbG9nIGluY2FzZSB0aGVyZSBhcmUgbm8gZXJyb3JzIHRvIHNob3dcblxuXHRcdFx0Ly8gaWYgZmFsc2UsIHNob3cgbWVzc2FnZXMgaW4gZGlhbG9nXG5cdFx0XHQvLyBBcyBmaXRlcmluZyBoYXMgYWxyZWFkeSBoYXBwZW5lZCBoZXJlIGhlbmNlXG5cdFx0XHQvLyB1c2luZyB0aGUgbWVzc2FnZSBtb2RlbCBhZ2FpbiBmb3IgdGhlIG1lc3NhZ2UgZGlhbG9nIHZpZXcgYW5kIHRoZW4gZmlsdGVyaW5nIG9uIHRoYXQgYmluZGluZyBhZ2FpbiBpcyB1bm5lY2Vzc2FyeS5cblx0XHRcdC8vIFNvIHdlIGNyZWF0ZSBuZXcganNvbiBtb2RlbCB0byB1c2UgZm9yIHRoZSBtZXNzYWdlIGRpYWxvZyB2aWV3LlxuXHRcdFx0Y29uc3QgYU1lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRcdFx0YUN1cnJlbnRDb250ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9NZXNzYWdlID0gY3VycmVudENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdGFNZXNzYWdlcy5wdXNoKG9NZXNzYWdlKTtcblx0XHRcdFx0YU1lc3NhZ2VEYXRhTGlzdCA9IGFNZXNzYWdlcztcblx0XHRcdH0pO1xuXHRcdFx0bGV0IGV4aXN0aW5nTWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShvTWVzc2FnZURpYWxvZ01vZGVsLmdldERhdGEoKSkpIHtcblx0XHRcdFx0ZXhpc3RpbmdNZXNzYWdlcyA9IG9NZXNzYWdlRGlhbG9nTW9kZWwuZ2V0RGF0YSgpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgb1VuaXF1ZU9iajogYW55ID0ge307XG5cblx0XHRcdGFNb2RlbERhdGFBcnJheSA9IGFNZXNzYWdlRGF0YUxpc3QuY29uY2F0KGV4aXN0aW5nTWVzc2FnZXMpLmZpbHRlcihmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRcdC8vIHJlbW92ZSBlbnRyaWVzIGhhdmluZyBkdXBsaWNhdGUgbWVzc2FnZSBpZHNcblx0XHRcdFx0cmV0dXJuICFvVW5pcXVlT2JqW29iai5pZF0gJiYgKG9VbmlxdWVPYmpbb2JqLmlkXSA9IHRydWUpO1xuXHRcdFx0fSk7XG5cdFx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoYU1vZGVsRGF0YUFycmF5KTtcblx0XHR9XG5cdH1cblx0aWYgKG9uQmVmb3JlU2hvd01lc3NhZ2UpIHtcblx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMgPSB7IHNob3dNZXNzYWdlQm94LCBzaG93TWVzc2FnZURpYWxvZyB9O1xuXHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycyA9IG9uQmVmb3JlU2hvd01lc3NhZ2UoYVRyYW5zaXRpb25NZXNzYWdlcywgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzKTtcblx0XHRzaG93TWVzc2FnZUJveCA9IHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93TWVzc2FnZUJveDtcblx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93TWVzc2FnZURpYWxvZztcblx0XHRpZiAoc2hvd01lc3NhZ2VEaWFsb2cgfHwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZykge1xuXHRcdFx0YU1vZGVsRGF0YUFycmF5ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZpbHRlcmVkTWVzc2FnZXMgPyBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZmlsdGVyZWRNZXNzYWdlcyA6IGFNb2RlbERhdGFBcnJheTtcblx0XHR9XG5cdH1cblx0aWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoID09PSAwICYmICFhQ3VzdG9tTWVzc2FnZXMgJiYgIWJIYXNFdGFnTWVzc2FnZSkge1xuXHRcdC8vIERvbid0IHNob3cgdGhlIHBvcHVwIGlmIHRoZXJlIGFyZSBubyB0cmFuc2llbnQgbWVzc2FnZXNcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9IGVsc2UgaWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoID09PSAxICYmIGFUcmFuc2l0aW9uTWVzc2FnZXNbMF0uZ2V0VHlwZSgpID09PSBNZXNzYWdlVHlwZS5TdWNjZXNzICYmICFhQ3VzdG9tTWVzc2FnZXMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KGFUcmFuc2l0aW9uTWVzc2FnZXNbMF0ubWVzc2FnZSk7XG5cdFx0XHRpZiAob01lc3NhZ2VEaWFsb2dNb2RlbCkge1xuXHRcdFx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoe30pO1xuXHRcdFx0fVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGFUcmFuc2l0aW9uTWVzc2FnZXMpO1xuXHRcdFx0cmVzb2x2ZSgpO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHNob3dNZXNzYWdlRGlhbG9nKSB7XG5cdFx0bWVzc2FnZUhhbmRsaW5nLnVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWUoYU1vZGVsRGF0YUFycmF5LCBjb250cm9sLCBzQWN0aW9uTmFtZSwgdmlld1R5cGUpO1xuXHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YShhTW9kZWxEYXRhQXJyYXkpOyAvLyBzZXQgdGhlIG1lc3NhZ2VzIGhlcmUgc28gdGhhdCBpZiBhbnkgb2YgdGhlbSBhcmUgZmlsdGVyZWQgZm9yIEFQRCwgdGhleSBhcmUgZmlsdGVyZWQgaGVyZSBhcyB3ZWxsLlxuXHRcdGFSZXNvbHZlRnVuY3Rpb25zID0gYVJlc29sdmVGdW5jdGlvbnMgfHwgW107XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRhUmVzb2x2ZUZ1bmN0aW9ucy5wdXNoKHJlc29sdmUpO1xuXHRcdFx0Q29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiLCB0cnVlKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSkge1xuXHRcdFx0XHRcdGNvbnN0IGJTdHJpY3RIYW5kbGluZ0Zsb3cgPSBmYWxzZTtcblx0XHRcdFx0XHRpZiAoc2hvd01lc3NhZ2VQYXJhbWV0ZXJzICYmIHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZSkge1xuXHRcdFx0XHRcdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5nZXREYXRhKCkuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUob01lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgb01lc3NhZ2VPYmplY3QgPSBwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2cob01lc3NhZ2VEaWFsb2dNb2RlbCwgYlN0cmljdEhhbmRsaW5nRmxvdyk7XG5cdFx0XHRcdFx0Y29uc3Qgb1NvcnRlciA9IG5ldyBTb3J0ZXIoXCJcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIChvYmoxOiBhbnksIG9iajI6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgcmFua0EgPSBnZXRNZXNzYWdlUmFuayhvYmoxKTtcblx0XHRcdFx0XHRcdGNvbnN0IHJhbmtCID0gZ2V0TWVzc2FnZVJhbmsob2JqMik7XG5cblx0XHRcdFx0XHRcdGlmIChyYW5rQSA8IHJhbmtCKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChyYW5rQSA+IHJhbmtCKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQob01lc3NhZ2VPYmplY3Qub01lc3NhZ2VWaWV3LmdldEJpbmRpbmcoXCJpdGVtc1wiKSBhcyBPRGF0YUxpc3RCaW5kaW5nKS5zb3J0KG9Tb3J0ZXIpO1xuXG5cdFx0XHRcdFx0b0RpYWxvZyA9XG5cdFx0XHRcdFx0XHRvRGlhbG9nICYmIG9EaWFsb2cuaXNPcGVuKClcblx0XHRcdFx0XHRcdFx0PyBvRGlhbG9nXG5cdFx0XHRcdFx0XHRcdDogbmV3IERpYWxvZyh7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXNpemFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRlbmRCdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZ0Nsb3NlSGFuZGxlcigpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGFsc28gcmVtb3ZlIGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgaWYgd2Ugd2VyZSBzaG93aW5nIHRoZW1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMoYU1vZGVsRGF0YUFycmF5KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9DTE9TRVwiKVxuXHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdFx0XHRjdXN0b21IZWFkZXI6IG5ldyBCYXIoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50TWlkZGxlOiBbXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IFRleHQoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRVwiKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnRMZWZ0OiBbb0JhY2tCdXR0b25dXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnRXaWR0aDogXCIzNy41ZW1cIixcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnRIZWlnaHQ6IFwiMjEuNWVtXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR2ZXJ0aWNhbFNjcm9sbGluZzogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVJlc29sdmVGdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhUmVzb2x2ZUZ1bmN0aW9uc1tpXS5jYWxsKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0YVJlc29sdmVGdW5jdGlvbnMgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ICB9KTtcblx0XHRcdFx0XHRvRGlhbG9nLnJlbW92ZUFsbENvbnRlbnQoKTtcblx0XHRcdFx0XHRvRGlhbG9nLmFkZENvbnRlbnQob01lc3NhZ2VPYmplY3Qub01lc3NhZ2VWaWV3KTtcblxuXHRcdFx0XHRcdGlmIChiSGFzRXRhZ01lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC9tL0J1dHRvblR5cGVcIl0sIGZ1bmN0aW9uIChCdXR0b25UeXBlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0b0RpYWxvZy5zZXRCZWdpbkJ1dHRvbihcblx0XHRcdFx0XHRcdFx0XHRuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZ0Nsb3NlSGFuZGxlcigpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAob0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dC5yZWZyZXNoKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9SRUZSRVNIXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5FbXBoYXNpemVkXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3lCZWdpbkJ1dHRvbigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzSGlnaGVzdFByaW9yaXR5ID0gZm5HZXRIaWdoZXN0TWVzc2FnZVByaW9yaXR5KG9NZXNzYWdlVmlldy5nZXRJdGVtcygpKTtcblx0XHRcdFx0XHRzSGlnaGVzdFByaW9yaXR5VGV4dCA9IGdldFRyYW5zbGF0ZWRUZXh0Rm9yTWVzc2FnZURpYWxvZyhzSGlnaGVzdFByaW9yaXR5KTtcblx0XHRcdFx0XHRvRGlhbG9nLnNldFN0YXRlKHNIaWdoZXN0UHJpb3JpdHkpO1xuXHRcdFx0XHRcdChvRGlhbG9nLmdldEN1c3RvbUhlYWRlcigpIGFzIGFueSkuZ2V0Q29udGVudE1pZGRsZSgpWzBdLnNldFRleHQoc0hpZ2hlc3RQcmlvcml0eVRleHQpO1xuXHRcdFx0XHRcdG9NZXNzYWdlVmlldy5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0XHRvRGlhbG9nLm9wZW4oKTtcblx0XHRcdFx0XHRpZiAoYk9ubHlGb3JUZXN0KSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKG9EaWFsb2cpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKHJlamVjdCk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoc2hvd01lc3NhZ2VCb3gpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdGNvbnN0IG9NZXNzYWdlID0gYVRyYW5zaXRpb25NZXNzYWdlc1swXTtcblx0XHRcdGlmIChcblx0XHRcdFx0KG9NZXNzYWdlLnRlY2huaWNhbERldGFpbHMgJiYgYU1lc3NhZ2VMaXN0LmluZGV4T2Yob01lc3NhZ2UudGVjaG5pY2FsRGV0YWlscy5vcmlnaW5hbE1lc3NhZ2UubWVzc2FnZSkgPT09IC0xKSB8fFxuXHRcdFx0XHQoc2hvd01lc3NhZ2VQYXJhbWV0ZXJzICYmIHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93Q2hhbmdlU2V0RXJyb3JEaWFsb2cpXG5cdFx0XHQpIHtcblx0XHRcdFx0aWYgKCFzaG93TWVzc2FnZVBhcmFtZXRlcnMgfHwgIXNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93Q2hhbmdlU2V0RXJyb3JEaWFsb2cpIHtcblx0XHRcdFx0XHRhTWVzc2FnZUxpc3QucHVzaChvTWVzc2FnZS50ZWNobmljYWxEZXRhaWxzLm9yaWdpbmFsTWVzc2FnZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgZm9ybWF0dGVkVGV4dFN0cmluZyA9IFwiPGh0bWw+PGJvZHk+XCI7XG5cdFx0XHRcdGNvbnN0IHJldHJ5QWZ0ZXJNZXNzYWdlID0gZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2UsIHRydWUpO1xuXHRcdFx0XHRpZiAocmV0cnlBZnRlck1lc3NhZ2UpIHtcblx0XHRcdFx0XHRmb3JtYXR0ZWRUZXh0U3RyaW5nID0gYDxoNj4ke3JldHJ5QWZ0ZXJNZXNzYWdlfTwvaDY+PGJyPmA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNob3dNZXNzYWdlUGFyYW1ldGVycyAmJiBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUob01lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvTWVzc2FnZS5nZXRDb2RlKCkgIT09IFwiNTAzXCIgJiYgb01lc3NhZ2UuZ2V0QWRkaXRpb25hbFRleHQoKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Zm9ybWF0dGVkVGV4dFN0cmluZyA9IGAke2Zvcm1hdHRlZFRleHRTdHJpbmcgKyBvTWVzc2FnZS5nZXRBZGRpdGlvbmFsVGV4dCgpfTogJHtvTWVzc2FnZS5nZXRNZXNzYWdlKCl9PC9odG1sPjwvYm9keT5gO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvcm1hdHRlZFRleHRTdHJpbmcgPSBgJHtmb3JtYXR0ZWRUZXh0U3RyaW5nICsgb01lc3NhZ2UuZ2V0TWVzc2FnZSgpfTwvaHRtbD48L2JvZHk+YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBmb3JtYXR0ZWRUZXh0OiBhbnkgPSBuZXcgRm9ybWF0dGVkVGV4dCh7XG5cdFx0XHRcdFx0aHRtbFRleHQ6IGZvcm1hdHRlZFRleHRTdHJpbmdcblx0XHRcdFx0fSk7XG5cdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3IoZm9ybWF0dGVkVGV4dCwge1xuXHRcdFx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGFNZXNzYWdlTGlzdCA9IFtdO1xuXHRcdFx0XHRcdFx0aWYgKGJTaG93Qm91bmRUcmFuc2l0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgZ3JvdXAgbmFtZSBmb3IgYWxsIG1lc3NhZ2VzIGluIGEgZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBhTW9kZWxEYXRhQXJyYXkgTWVzc2FnZXMgYXJyYXlcbiAqIEBwYXJhbSBjb250cm9sXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqIEBwYXJhbSB2aWV3VHlwZVxuICovXG5mdW5jdGlvbiB1cGRhdGVNZXNzYWdlT2JqZWN0R3JvdXBOYW1lKFxuXHRhTW9kZWxEYXRhQXJyYXk6IE1lc3NhZ2VXaXRoSGVhZGVyW10sXG5cdGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQsXG5cdHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdHZpZXdUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWRcbikge1xuXHRhTW9kZWxEYXRhQXJyYXkuZm9yRWFjaCgoYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIpID0+IHtcblx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IFwiXCI7XG5cdFx0aWYgKCFhTW9kZWxEYXRhLnRhcmdldD8ubGVuZ3RoICYmIGFNb2RlbERhdGEuZ2V0Q29kZT8uKCkgIT09IFwiRkVfQ1VTVE9NX01FU1NBR0VfQ0hBTkdFU0VUX0FMTF9GQUlMRURcIikge1xuXHRcdFx0Ly8gdW5ib3VuZCB0cmFuc2lpdG9uIG1lc3NhZ2VzXG5cdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IFwiR2VuZXJhbFwiO1xuXHRcdH0gZWxzZSBpZiAoYU1vZGVsRGF0YS50YXJnZXQ/Lmxlbmd0aCkge1xuXHRcdFx0Ly8gTFIgZmxvd1xuXHRcdFx0aWYgKHZpZXdUeXBlID09PSBcIkxpc3RSZXBvcnRcIikge1xuXHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcuc2V0R3JvdXBOYW1lTFJUYWJsZShjb250cm9sLCBhTW9kZWxEYXRhLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHZpZXdUeXBlID09PSBcIk9iamVjdFBhZ2VcIikge1xuXHRcdFx0XHQvLyBPUCBEaXNwbGF5IG1vZGVcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUoYU1vZGVsRGF0YSwgc0FjdGlvbk5hbWUsIGNvbnRyb2wpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBzZXQgdGhlIGdyb3VwIG5hbWUgb2YgTWVzc2FnZSBPYmplY3QgZm9yIExSIHRhYmxlLlxuICpcbiAqIEBwYXJhbSBvRWxlbVxuICogQHBhcmFtIGFNb2RlbERhdGFcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZVxuICovXG5mdW5jdGlvbiBzZXRHcm91cE5hbWVMUlRhYmxlKG9FbGVtOiBDb250cm9sIHwgdW5kZWZpbmVkLCBhTW9kZWxEYXRhOiBNZXNzYWdlV2l0aEhlYWRlciwgc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRjb25zdCBvUm93QmluZGluZyA9IG9FbGVtICYmIChvRWxlbSBhcyBUYWJsZSkuZ2V0Um93QmluZGluZygpO1xuXHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAkeyhvRWxlbSBhcyBUYWJsZSkuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKX1gO1xuXHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5kZXhPZihzRWxlbWVCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdGNvbnN0IGFsbFJvd0NvbnRleHRzID0gKChvRWxlbSBhcyBUYWJsZSkuZ2V0Um93QmluZGluZygpIGFzIE9EYXRhTGlzdEJpbmRpbmcpLmdldENvbnRleHRzKCk7XG5cdFx0XHRhbGxSb3dDb250ZXh0cy5mb3JFYWNoKChyb3dDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0XHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5jbHVkZXMocm93Q29udGV4dC5nZXRQYXRoKCkpKSB7XG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBgJHtyb3dDb250ZXh0LmdldFBhdGgoKX0vYDtcblx0XHRcdFx0XHRjb25zdCBpZGVudGlmaWVyQ29sdW1uID0gKG9FbGVtLmdldFBhcmVudCgpIGFzIGFueSkuZ2V0SWRlbnRpZmllckNvbHVtbigpO1xuXHRcdFx0XHRcdGNvbnN0IHJvd0lkZW50aWZpZXIgPSBpZGVudGlmaWVyQ29sdW1uICYmIHJvd0NvbnRleHQuZ2V0T2JqZWN0KClbaWRlbnRpZmllckNvbHVtbl07XG5cdFx0XHRcdFx0Y29uc3QgY29sdW1uUHJvcGVydHlOYW1lID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlQ29sUHJvcGVydHkob0VsZW0sIGFNb2RlbERhdGEsIGNvbnRleHRQYXRoKTtcblx0XHRcdFx0XHRjb25zdCB7IHNUYWJsZVRhcmdldENvbE5hbWUgfSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUNvbEluZm8ob0VsZW0sIGNvbHVtblByb3BlcnR5TmFtZSk7XG5cblx0XHRcdFx0XHQvLyBpZiB0YXJnZXQgaGFzIHNvbWUgY29sdW1uIG5hbWUgYW5kIGNvbHVtbiBpcyB2aXNpYmxlIGluIFVJXG5cdFx0XHRcdFx0aWYgKGNvbHVtblByb3BlcnR5TmFtZSAmJiBzVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0XHRcdFx0XHQvLyBoZWFkZXIgd2lsbCBiZSByb3cgSWRlbnRpZmllciwgaWYgZm91bmQgZnJvbSBhYm92ZSBjb2RlIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgdGFibGUgbmFtZVxuXHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSByb3dJZGVudGlmaWVyID8gYCAke3Jvd0lkZW50aWZpZXJ9YCA6IChvRWxlbSBhcyBUYWJsZSkuZ2V0SGVhZGVyKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGlmIGNvbHVtbiBkYXRhIG5vdCBmb3VuZCAobWF5IGJlIHRoZSBjb2x1bW4gaXMgaGlkZGVuKSwgYWRkIGdyb3VwaW5nIGFzIExhc3QgQWN0aW9uXG5cdFx0XHRcdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHNldCB0aGUgZ3JvdXAgbmFtZSBvZiBNZXNzYWdlIE9iamVjdCBpbiBPUCBEaXNwbGF5IG1vZGUuXG4gKlxuICogQHBhcmFtIGFNb2RlbERhdGEgTWVzc2FnZSBPYmplY3RcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZSAgQWN0aW9uIG5hbWVcbiAqIEBwYXJhbSBjb250cm9sXG4gKi9cbmZ1bmN0aW9uIHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUoYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvVmlld0NvbnRleHQgPSBjb250cm9sPy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRjb25zdCBvcExheW91dDogQ29udHJvbCA9IGNvbnRyb2w/LmdldENvbnRlbnQgJiYgY29udHJvbD8uZ2V0Q29udGVudCgpWzBdO1xuXHRsZXQgYklzR2VuZXJhbEdyb3VwTmFtZSA9IHRydWU7XG5cdGlmIChvcExheW91dCkge1xuXHRcdG1lc3NhZ2VIYW5kbGluZy5nZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dChvcExheW91dCkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uKSB7XG5cdFx0XHRjb25zdCBzdWJTZWN0aW9ucyA9IG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRzdWJTZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24pIHtcblx0XHRcdFx0b1N1YlNlY3Rpb24uZmluZEVsZW1lbnRzKHRydWUpLmZvckVhY2goZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0VsZW0uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvRWxlbS5nZXRSb3dCaW5kaW5nKCksXG5cdFx0XHRcdFx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCA9IHRydWU7XG5cdFx0XHRcdFx0XHRsZXQgY2hpbGRUYWJsZUVsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHRcdG9FbGVtLmZpbmRFbGVtZW50cyh0cnVlKS5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRWxlbWVudC5pc0EoXCJzYXAubS5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRjaGlsZFRhYmxlRWxlbWVudCA9IG9FbGVtZW50O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dD8uZ2V0UGF0aCgpfS8ke29FbGVtLmdldFJvd0JpbmRpbmcoKT8uZ2V0UGF0aCgpfWA7XG5cdFx0XHRcdFx0XHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5kZXhPZihzRWxlbWVCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvYmogPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZShcblx0XHRcdFx0XHRcdFx0XHRcdGFNb2RlbERhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRvRWxlbSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoaWxkVGFibGVFbGVtZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0b1Jvd0JpbmRpbmcsXG5cdFx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCxcblx0XHRcdFx0XHRcdFx0XHRcdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWVcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHsgb1RhcmdldFRhYmxlSW5mbyB9ID0gb2JqO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNldFNlY3Rpb25OYW1lSW5Hcm91cCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgaWRlbnRpZmllckNvbHVtbiA9IG9FbGVtLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChpZGVudGlmaWVyQ29sdW1uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFsbFJvd0NvbnRleHRzID0gb0VsZW0uZ2V0Um93QmluZGluZygpLmdldENvbnRleHRzKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFsbFJvd0NvbnRleHRzLmZvckVhY2goKHJvd0NvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYU1vZGVsRGF0YS50YXJnZXQ/LmluY2x1ZGVzKHJvd0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgcm93SWRlbnRpZmllciA9IGlkZW50aWZpZXJDb2x1bW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PyByb3dDb250ZXh0LmdldE9iamVjdCgpW2lkZW50aWZpZXJDb2x1bW5dXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImFkZGl0aW9uYWxUZXh0XCJdID0gYCR7cm93SWRlbnRpZmllcn0sICR7b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lfWA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFNb2RlbERhdGFbXCJhZGRpdGlvbmFsVGV4dFwiXSA9IGAke29UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaGVhZGVyTmFtZSA9IG9FbGVtLmdldEhlYWRlclZpc2libGUoKSAmJiBvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFoZWFkZXJOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhlYWRlck5hbWUgPSBvU3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aGVhZGVyTmFtZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCIpfTogJHtoZWFkZXJOYW1lfWA7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IGhlYWRlck5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRiSXNHZW5lcmFsR3JvdXBOYW1lID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKGJJc0dlbmVyYWxHcm91cE5hbWUpIHtcblx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dD8uZ2V0UGF0aCgpfWA7XG5cdFx0aWYgKGFNb2RlbERhdGEudGFyZ2V0Py5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0Ly8gY2hlY2sgaWYgT1AgY29udGV4dCBwYXRoIGlzIHBhcnQgb2YgdGFyZ2V0LCBzZXQgTGFzdCBBY3Rpb24gYXMgZ3JvdXAgbmFtZVxuXHRcdFx0Y29uc3QgaGVhZGVyTmFtZSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBoZWFkZXJOYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IFwiR2VuZXJhbFwiO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cdGNvbnN0IHNMYXN0QWN0aW9uVGV4dCA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIlRfTUVTU0FHRV9CVVRUT05fU0FQRkVfTUVTU0FHRV9HUk9VUF9MQVNUX0FDVElPTlwiKTtcblx0cmV0dXJuIHNBY3Rpb25OYW1lID8gYCR7c0xhc3RBY3Rpb25UZXh0fTogJHtzQWN0aW9uTmFtZX1gIDogXCJcIjtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2l2ZSByYW5rIGJhc2VkIG9uIE1lc3NhZ2UgR3JvdXAvSGVhZGVyIG5hbWUsIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgU29ydGluZyBtZXNzYWdlcyBpbiBNZXNzYWdlIGRpYWxvZ1xuICogTGFzdCBBY3Rpb24gc2hvdWxkIGJlIHNob3duIGF0IHRvcCwgbmV4dCBSb3cgSWQgYW5kIGxhc3QgR2VuZXJhbC5cbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJucyBSYW5rIG9mIG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZVJhbmsob2JqOiBNZXNzYWdlV2l0aEhlYWRlcik6IG51bWJlciB7XG5cdGlmIChvYmouaGVhZGVyTmFtZT8udG9TdHJpbmcoKS5pbmNsdWRlcyhcIkxhc3QgQWN0aW9uXCIpKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH0gZWxzZSBpZiAob2JqLmhlYWRlck5hbWU/LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJHZW5lcmFsXCIpKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIDI7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2V0IHRoZSBncm91cCBuYW1lIHdoaWNoIGNhbiBlaXRoZXIgR2VuZXJhbCBvciBMYXN0IEFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gYU1lc3NhZ2VcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZVxuICogQHBhcmFtIGJJc0dlbmVyYWxHcm91cE5hbWVcbiAqL1xuY29uc3QgZm5DYWxsYmFja1NldEdyb3VwTmFtZSA9IChhTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGJJc0dlbmVyYWxHcm91cE5hbWU/OiBCb29sZWFuKSA9PiB7XG5cdGlmIChiSXNHZW5lcmFsR3JvdXBOYW1lKSB7XG5cdFx0Y29uc3Qgc0dlbmVyYWxHcm91cFRleHQgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfR0VORVJBTFwiKTtcblx0XHRhTWVzc2FnZVtcImhlYWRlck5hbWVcIl0gPSBzR2VuZXJhbEdyb3VwVGV4dDtcblx0fSBlbHNlIHtcblx0XHRhTWVzc2FnZVtcImhlYWRlck5hbWVcIl0gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2V0IHRoZSB0YWJsZSByb3cvY29sdW1uIGluZm8gYW5kIHNldCBzdWJ0aXRsZS5cbiAqXG4gKiBAcGFyYW0gYU1lc3NhZ2VcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBvRWxlbWVudFxuICogQHBhcmFtIG9Sb3dCaW5kaW5nXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqIEBwYXJhbSBzZXRTZWN0aW9uTmFtZUluR3JvdXBcbiAqIEBwYXJhbSBmblNldEdyb3VwTmFtZVxuICogQHJldHVybnMgVGFibGUgaW5mbyBhbmQgU3VidGl0bGUuXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQ29sdW1uRGF0YUFuZFNldFN1YnRpbGUoXG5cdGFNZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlcixcblx0b1RhYmxlOiBUYWJsZSxcblx0b0VsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQsXG5cdG9Sb3dCaW5kaW5nOiBCaW5kaW5nLFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRzZXRTZWN0aW9uTmFtZUluR3JvdXA6IEJvb2xlYW4sXG5cdGZuU2V0R3JvdXBOYW1lOiBhbnlcbikge1xuXHRjb25zdCBvVGFyZ2V0VGFibGVJbmZvID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlQW5kVGFyZ2V0SW5mbyhvVGFibGUsIGFNZXNzYWdlLCBvRWxlbWVudCwgb1Jvd0JpbmRpbmcpO1xuXHRvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyID0gb1RhYmxlLmdldEhlYWRlcigpO1xuXG5cdGxldCBzQ29udHJvbElkLCBiSXNDcmVhdGlvblJvdztcblx0aWYgKCFvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpIHtcblx0XHRzQ29udHJvbElkID0gYU1lc3NhZ2UuZ2V0Q29udHJvbElkcygpLmZpbmQoZnVuY3Rpb24gKHNJZDogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZUhhbmRsaW5nLmlzQ29udHJvbEluVGFibGUob1RhYmxlLCBzSWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKHNDb250cm9sSWQpIHtcblx0XHRjb25zdCBvQ29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRiSXNDcmVhdGlvblJvdyA9IG1lc3NhZ2VIYW5kbGluZy5pc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdyhvQ29udHJvbCk7XG5cdH1cblxuXHRpZiAoIW9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSkge1xuXHRcdC8vIGlmIHRoZSBjb2x1bW4gaXMgbm90IHByZXNlbnQgb24gVUkgb3IgdGhlIHRhcmdldCBkb2VzIG5vdCBoYXZlIGEgdGFibGUgZmllbGQgaW4gaXQsIHVzZSBMYXN0IEFjdGlvbiBmb3IgZ3JvdXBpbmdcblx0XHRpZiAoKGFNZXNzYWdlIGFzIGFueSkucGVyc2lzdGVudCAmJiBzQWN0aW9uTmFtZSkge1xuXHRcdFx0Zm5TZXRHcm91cE5hbWUoYU1lc3NhZ2UsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHN1YlRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VTdWJ0aXRsZShcblx0XHRhTWVzc2FnZSxcblx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyxcblx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lLFxuXHRcdG9UYWJsZSxcblx0XHRiSXNDcmVhdGlvblJvd1xuXHQpO1xuXG5cdHJldHVybiB7IG9UYXJnZXRUYWJsZUluZm8sIHN1YlRpdGxlIH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSB0aGUgc3VidGl0bGUgYmFzZWQgb24gVGFibGUgUm93L0NvbHVtbiBkYXRhLlxuICpcbiAqIEBwYXJhbSBtZXNzYWdlXG4gKiBAcGFyYW0gb1RhYmxlUm93QmluZGluZ0NvbnRleHRzXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZVRhcmdldENvbE5hbWVcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBiSXNDcmVhdGlvblJvd1xuICogQHBhcmFtIG9UYXJnZXRlZENvbnRyb2xcbiAqIEByZXR1cm5zIE1lc3NhZ2Ugc3VidGl0bGUuXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VTdWJ0aXRsZShcblx0bWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsXG5cdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogQ29udGV4dFtdLFxuXHRvVGFibGVSb3dDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZCxcblx0c1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nIHwgYm9vbGVhbixcblx0b1RhYmxlOiBUYWJsZSxcblx0YklzQ3JlYXRpb25Sb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQsXG5cdG9UYXJnZXRlZENvbnRyb2w/OiBDb250cm9sXG4pOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0bGV0IHNNZXNzYWdlU3VidGl0bGU7XG5cdGxldCBzUm93U3VidGl0bGVWYWx1ZTtcblx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1RhYmxlKTtcblx0Y29uc3Qgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IChvVGFibGUgYXMgYW55KS5nZXRQYXJlbnQoKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdGNvbnN0IG9Db2xGcm9tVGFibGVTZXR0aW5ncyA9IG1lc3NhZ2VIYW5kbGluZy5mZXRjaENvbHVtbkluZm8obWVzc2FnZSwgb1RhYmxlKTtcblx0aWYgKGJJc0NyZWF0aW9uUm93KSB7XG5cdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIFtcblx0XHRcdHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFX0NSRUFUSU9OX1JPV19JTkRJQ0FUT1JcIiksXG5cdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID8gc1RhYmxlVGFyZ2V0Q29sTmFtZSA6IChvQ29sRnJvbVRhYmxlU2V0dGluZ3MgYXMgQ29sdW1uV2l0aExhYmVsVHlwZSkubGFiZWxcblx0XHRdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24oXG5cdFx0XHRvVGFibGUsXG5cdFx0XHRvVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdCk7XG5cdFx0Y29uc3Qgc1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGggPSBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb25cblx0XHRcdD8gb1RhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dFRleHRBbm5vdGF0aW9uLmdldE9iamVjdChcIiRQYXRoXCIpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBzVGFibGVGaXJzdENvbFRleHRBcnJhbmdlbWVudCA9XG5cdFx0XHRzVGFibGVGaXJzdENvbFRleHRBbm5vdGF0aW9uUGF0aCAmJiBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb25cblx0XHRcdFx0PyBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24uZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudC8kRW51bU1lbWJlclwiKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRpZiAob1RhYmxlUm93QmluZGluZ0NvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIHNldCBSb3cgc3VidGl0bGUgdGV4dFxuXHRcdFx0aWYgKG9UYXJnZXRlZENvbnRyb2wpIHtcblx0XHRcdFx0Ly8gVGhlIFVJIGVycm9yIGlzIG9uIHRoZSBmaXJzdCBjb2x1bW4sIHdlIHRoZW4gZ2V0IHRoZSBjb250cm9sIGlucHV0IGFzIHRoZSByb3cgaW5kaWNhdG9yOlxuXHRcdFx0XHRzUm93U3VidGl0bGVWYWx1ZSA9IChvVGFyZ2V0ZWRDb250cm9sIGFzIGFueSkuZ2V0VmFsdWUoKTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlUm93Q29udGV4dCAmJiBzVGFibGVGaXJzdENvbFByb3BlcnR5KSB7XG5cdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlRmlyc3RDb2xWYWx1ZShcblx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5LFxuXHRcdFx0XHRcdG9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0Ly8gc2V0IHRoZSBtZXNzYWdlIHN1YnRpdGxlXG5cdFx0XHRjb25zdCBvQ29sdW1uSW5mbzogQ29sdW1uSW5mb1R5cGUgPSBtZXNzYWdlSGFuZGxpbmcuZGV0ZXJtaW5lQ29sdW1uSW5mbyhvQ29sRnJvbVRhYmxlU2V0dGluZ3MsIHJlc291cmNlTW9kZWwpO1xuXHRcdFx0aWYgKHNSb3dTdWJ0aXRsZVZhbHVlICYmIHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIFtzUm93U3VidGl0bGVWYWx1ZSwgc1RhYmxlVGFyZ2V0Q29sTmFtZV0pO1xuXHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfUk9XXCIpfTogJHtzUm93U3VidGl0bGVWYWx1ZX0sICR7XG5cdFx0XHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlXG5cdFx0XHRcdH1gO1xuXHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIlVua25vd25cIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVcIiwgW3NSb3dTdWJ0aXRsZVZhbHVlLCBvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWVdKTtcblx0XHRcdH0gZWxzZSBpZiAoc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX1JPV1wiKX06ICR7c1Jvd1N1YnRpdGxlVmFsdWV9YDtcblx0XHRcdH0gZWxzZSBpZiAoIXNSb3dTdWJ0aXRsZVZhbHVlICYmIHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIikgKyBcIjogXCIgKyBzVGFibGVUYXJnZXRDb2xOYW1lO1xuXHRcdFx0fSBlbHNlIGlmICghc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gb0NvbHVtbkluZm8uc0NvbHVtblZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzTWVzc2FnZVN1YnRpdGxlO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBnZXQgdGhlIGZpcnN0IGNvbHVtbiBmb3IgdGV4dCBBbm5vdGF0aW9uLCB0aGlzIGlzIG5lZWRlZCB0byBzZXQgc3VidGl0bGUgb2YgTWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcbiAqIEByZXR1cm5zIEJpbmRpbmcgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24oXG5cdG9UYWJsZTogVGFibGUsXG5cdG9UYWJsZVJvd0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmdcbik6IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0bGV0IG9CaW5kaW5nQ29udGV4dDtcblx0aWYgKG9UYWJsZVJvd0NvbnRleHQgJiYgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZT8uZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsPy5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzTWV0YVBhdGggPSAob01ldGFNb2RlbCBhcyBhbnkpPy5nZXRNZXRhUGF0aChvVGFibGVSb3dDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0aWYgKG9NZXRhTW9kZWw/LmdldE9iamVjdChgJHtzTWV0YVBhdGh9LyR7c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHQvJFBhdGhgKSkge1xuXHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzTWV0YVBhdGh9LyR7c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9CaW5kaW5nQ29udGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2V0IHRoZSB2YWx1ZSBvZiBmaXJzdCBDb2x1bW4gb2YgVGFibGUsIHdpdGggaXRzIHRleHQgQXJyYW5nZW1lbnQuXG4gKlxuICogQHBhcmFtIHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcbiAqIEBwYXJhbSBvVGFibGVSb3dDb250ZXh0XG4gKiBAcGFyYW0gc1RleHRBbm5vdGF0aW9uUGF0aFxuICogQHBhcmFtIHNUZXh0QXJyYW5nZW1lbnRcbiAqIEByZXR1cm5zIENvbHVtbiBWYWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVGaXJzdENvbFZhbHVlKFxuXHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmcsXG5cdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQsXG5cdHNUZXh0QW5ub3RhdGlvblBhdGg6IHN0cmluZyxcblx0c1RleHRBcnJhbmdlbWVudDogc3RyaW5nXG4pOiBzdHJpbmcge1xuXHRjb25zdCBzQ29kZVZhbHVlID0gKG9UYWJsZVJvd0NvbnRleHQgYXMgYW55KS5nZXRWYWx1ZShzVGFibGVGaXJzdENvbFByb3BlcnR5KTtcblx0bGV0IHNUZXh0VmFsdWU7XG5cdGxldCBzQ29tcHV0ZWRWYWx1ZSA9IHNDb2RlVmFsdWU7XG5cdGlmIChzVGV4dEFubm90YXRpb25QYXRoKSB7XG5cdFx0aWYgKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkubGFzdEluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly8gdGhlIHRhcmdldCBwcm9wZXJ0eSBpcyByZXBsYWNlZCB3aXRoIHRoZSB0ZXh0IGFubm90YXRpb24gcGF0aFxuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHNUYWJsZUZpcnN0Q29sUHJvcGVydHkuc2xpY2UoMCwgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHkgPSBzVGFibGVGaXJzdENvbFByb3BlcnR5LmNvbmNhdChzVGV4dEFubm90YXRpb25QYXRoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHNUZXh0QW5ub3RhdGlvblBhdGg7XG5cdFx0fVxuXHRcdHNUZXh0VmFsdWUgPSAob1RhYmxlUm93Q29udGV4dCBhcyBhbnkpLmdldFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpO1xuXHRcdGlmIChzVGV4dFZhbHVlKSB7XG5cdFx0XHRpZiAoc1RleHRBcnJhbmdlbWVudCkge1xuXHRcdFx0XHRjb25zdCBzRW51bU51bWJlciA9IHNUZXh0QXJyYW5nZW1lbnQuc2xpY2Uoc1RleHRBcnJhbmdlbWVudC5pbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0XHRzd2l0Y2ggKHNFbnVtTnVtYmVyKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIlRleHRPbmx5XCI6XG5cdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IHNUZXh0VmFsdWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiVGV4dEZpcnN0XCI6XG5cdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IGAke3NUZXh0VmFsdWV9ICgke3NDb2RlVmFsdWV9KWA7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiVGV4dExhc3RcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c0NvZGVWYWx1ZX0gKCR7c1RleHRWYWx1ZX0pYDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJUZXh0U2VwYXJhdGVcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gc0NvZGVWYWx1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c1RleHRWYWx1ZX0gKCR7c0NvZGVWYWx1ZX0pYDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHNDb21wdXRlZFZhbHVlO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgdG8gcmV0cmlldmUgdGhlIGNvbHVtbiBpbmZvIGZyb20gdGhlIGFzc29jaWF0ZWQgbWVzc2FnZSBvZiB0aGUgbWVzc2FnZSBwb3BvdmVyLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb01lc3NhZ2UgTWVzc2FnZSBvYmplY3RcbiAqIEBwYXJhbSBvVGFibGUgTWRjVGFibGVcbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIGNvbHVtbiBpbmZvLlxuICovXG5mdW5jdGlvbiBmZXRjaENvbHVtbkluZm8ob01lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLCBvVGFibGU6IFRhYmxlKTogQ29sdW1uIHtcblx0Y29uc3Qgc0NvbE5hbWVGcm9tTWVzc2FnZU9iaiA9IG9NZXNzYWdlPy5nZXRUYXJnZXRzKClbMF0uc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRyZXR1cm4gKG9UYWJsZSBhcyBhbnkpXG5cdFx0LmdldFBhcmVudCgpXG5cdFx0LmdldFRhYmxlRGVmaW5pdGlvbigpXG5cdFx0LmNvbHVtbnMuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5rZXkuc3BsaXQoXCI6OlwiKS5wb3AoKSA9PT0gc0NvbE5hbWVGcm9tTWVzc2FnZU9iajtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdldCB0aGUgQ29sdW1uIGRhdGEgZGVwZW5kaW5nIG9uIGl0cyBhdmFpbGFiaWxpdHkgaW4gVGFibGUsIHRoaXMgaXMgbmVlZGVkIGZvciBzZXR0aW5nIHN1YnRpdGxlIG9mIE1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIG9Db2xGcm9tVGFibGVTZXR0aW5nc1xuICogQHBhcmFtIHJlc291cmNlTW9kZWxcbiAqIEByZXR1cm5zIENvbHVtbiBkYXRhLlxuICovXG5mdW5jdGlvbiBkZXRlcm1pbmVDb2x1bW5JbmZvKG9Db2xGcm9tVGFibGVTZXR0aW5nczogYW55LCByZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsKTogQ29sdW1uSW5mb1R5cGUge1xuXHRjb25zdCBvQ29sdW1uSW5mbzogYW55ID0geyBzQ29sdW1uSW5kaWNhdG9yOiBTdHJpbmcsIHNDb2x1bW5WYWx1ZTogU3RyaW5nIH07XG5cdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MpIHtcblx0XHQvLyBpZiBjb2x1bW4gaXMgbmVpdGhlciBpbiB0YWJsZSBkZWZpbml0aW9uIG5vciBwZXJzb25hbGl6YXRpb24sIHNob3cgb25seSByb3cgc3VidGl0bGUgdGV4dFxuXHRcdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID0gXCJ1bmRlZmluZWRcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9pZiBjb2x1bW4gaXMgaW4gdGFibGUgcGVyc29uYWxpemF0aW9uIGJ1dCBub3QgaW4gdGFibGUgZGVmaW5pdGlvbiwgc2hvdyBDb2x1bW4gKEhpZGRlbikgOiA8Y29sTmFtZT5cblx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5WYWx1ZSA9IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIil9ICgke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcblx0XHRcdFx0XCJUX0NPTFVNTl9JTkRJQ0FUT1JfSU5fVEFCTEVfREVGSU5JVElPTlwiXG5cdFx0XHQpfSk6ICR7b0NvbEZyb21UYWJsZVNldHRpbmdzLmxhYmVsfWA7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID0gXCJIaWRkZW5cIjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVfSU5ESUNBVE9SX1VOS05PV05cIik7XG5cdFx0b0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9IFwiVW5rbm93blwiO1xuXHR9XG5cdHJldHVybiBvQ29sdW1uSW5mbztcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrIGlmIGEgZ2l2ZW4gY29udHJvbCBpZCBpcyBhIHBhcnQgb2YgVGFibGUuXG4gKlxuICogQHBhcmFtIG9UYWJsZVxuICogQHBhcmFtIHNDb250cm9sSWRcbiAqIEByZXR1cm5zIFRydWUgaWYgY29udHJvbCBpcyBwYXJ0IG9mIHRhYmxlLlxuICovXG5mdW5jdGlvbiBpc0NvbnRyb2xJblRhYmxlKG9UYWJsZTogVGFibGUsIHNDb250cm9sSWQ6IHN0cmluZyk6IFVJNUVsZW1lbnRbXSB8IGJvb2xlYW4ge1xuXHRjb25zdCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRpZiAob0NvbnRyb2wgJiYgIW9Db250cm9sLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKSAmJiAhb0NvbnRyb2wuaXNBKFwic2FwLm0uVGFibGVcIikpIHtcblx0XHRyZXR1cm4gb1RhYmxlLmZpbmRFbGVtZW50cyh0cnVlLCBmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0cmV0dXJuIG9FbGVtLmdldElkKCkgPT09IG9Db250cm9sO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNDb250cm9sUGFydE9mQ3JlYXRpb25Sb3cob0NvbnRyb2w6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQpIHtcblx0bGV0IG9QYXJlbnRDb250cm9sID0gb0NvbnRyb2w/LmdldFBhcmVudCgpO1xuXHR3aGlsZSAoXG5cdFx0b1BhcmVudENvbnRyb2wgJiZcblx0XHQhb1BhcmVudENvbnRyb2w/LmlzQShcInNhcC51aS50YWJsZS5Sb3dcIikgJiZcblx0XHQhb1BhcmVudENvbnRyb2w/LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSAmJlxuXHRcdCFvUGFyZW50Q29udHJvbD8uaXNBKFwic2FwLm0uQ29sdW1uTGlzdEl0ZW1cIilcblx0KSB7XG5cdFx0b1BhcmVudENvbnRyb2wgPSBvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKTtcblx0fVxuXG5cdHJldHVybiAhIW9QYXJlbnRDb250cm9sICYmIG9QYXJlbnRDb250cm9sLmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhbnNsYXRlZFRleHRGb3JNZXNzYWdlRGlhbG9nKHNIaWdoZXN0UHJpb3JpdHk6IGFueSkge1xuXHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRzd2l0Y2ggKHNIaWdoZXN0UHJpb3JpdHkpIHtcblx0XHRjYXNlIFwiRXJyb3JcIjpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfRVJST1JTXCIpO1xuXHRcdGNhc2UgXCJJbmZvcm1hdGlvblwiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfSU5GT1wiKTtcblx0XHRjYXNlIFwiU3VjY2Vzc1wiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfU1VDQ0VTU1wiKTtcblx0XHRjYXNlIFwiV2FybmluZ1wiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfV0FSTklOR1NcIik7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFXCIpO1xuXHR9XG59XG5mdW5jdGlvbiByZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCkge1xuXHRyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoZmFsc2UpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykge1xuXHRyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXModHJ1ZSwgc1BhdGhUb0JlUmVtb3ZlZCk7XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbChvTWVzc2FnZU1vZGVsOiBhbnksIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0aWYgKHNQYXRoVG9CZVJlbW92ZWQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBvTWVzc2FnZU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdH1cblx0Y29uc3QgbGlzdEJpbmRpbmcgPSBvTWVzc2FnZU1vZGVsLmJpbmRMaXN0KFwiL1wiKTtcblxuXHRsaXN0QmluZGluZy5maWx0ZXIoXG5cdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRwYXRoOiBcInRhcmdldFwiLFxuXHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLlN0YXJ0c1dpdGgsXG5cdFx0XHR2YWx1ZTE6IHNQYXRoVG9CZVJlbW92ZWRcblx0XHR9KVxuXHQpO1xuXG5cdHJldHVybiBsaXN0QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKS5tYXAoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdH0pO1xufVxuZnVuY3Rpb24gZ2V0TWVzc2FnZXMoYkJvdW5kTWVzc2FnZXM6IGJvb2xlYW4gPSBmYWxzZSwgYlRyYW5zaXRpb25Pbmx5OiBib29sZWFuID0gZmFsc2UsIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0bGV0IGk7XG5cdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKSxcblx0XHRvTWVzc2FnZU1vZGVsID0gb01lc3NhZ2VNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLFxuXHRcdG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksXG5cdFx0YVRyYW5zaXRpb25NZXNzYWdlcyA9IFtdO1xuXHRsZXQgYU1lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRpZiAoYkJvdW5kTWVzc2FnZXMgJiYgYlRyYW5zaXRpb25Pbmx5ICYmIHNQYXRoVG9CZVJlbW92ZWQpIHtcblx0XHRhTWVzc2FnZXMgPSBnZXRNZXNzYWdlc0Zyb21NZXNzYWdlTW9kZWwob01lc3NhZ2VNb2RlbCwgc1BhdGhUb0JlUmVtb3ZlZCk7XG5cdH0gZWxzZSB7XG5cdFx0YU1lc3NhZ2VzID0gb01lc3NhZ2VNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHR9XG5cdGZvciAoaSA9IDA7IGkgPCBhTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoXG5cdFx0XHQoIWJUcmFuc2l0aW9uT25seSB8fCBhTWVzc2FnZXNbaV0ucGVyc2lzdGVudCkgJiZcblx0XHRcdCgoYkJvdW5kTWVzc2FnZXMgJiYgYU1lc3NhZ2VzW2ldLnRhcmdldCAhPT0gXCJcIikgfHwgKCFiQm91bmRNZXNzYWdlcyAmJiAoIWFNZXNzYWdlc1tpXS50YXJnZXQgfHwgYU1lc3NhZ2VzW2ldLnRhcmdldCA9PT0gXCJcIikpKVxuXHRcdCkge1xuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlcy5wdXNoKGFNZXNzYWdlc1tpXSk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoXG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLmNvZGUgPT09IFwiNTAzXCIgJiZcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZSAhPT0gXCJcIiAmJlxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5tZXNzYWdlLmluZGV4T2Yob1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0JBQ0tFTkRfUFJFRklYXCIpKSA9PT0gLTFcblx0XHQpIHtcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZSA9IGBcXG4ke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19CQUNLRU5EX1BSRUZJWFwiKX0ke1xuXHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLm1lc3NhZ2Vcblx0XHRcdH1gO1xuXHRcdH1cblx0fVxuXHQvL0ZpbHRlcmluZyBtZXNzYWdlcyBhZ2FpbiBoZXJlIHRvIGF2b2lkIHNob3dpbmcgcHVyZSB0ZWNobmljYWwgbWVzc2FnZXMgcmFpc2VkIGJ5IHRoZSBtb2RlbFxuXHRjb25zdCBiYWNrZW5kTWVzc2FnZXM6IGFueSA9IFtdO1xuXHRmb3IgKGkgPSAwOyBpIDwgYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChcblx0XHRcdChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMgJiZcblx0XHRcdFx0KChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlICE9PSBudWxsKSB8fFxuXHRcdFx0XHRcdChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyAhPT0gbnVsbCkpKSB8fFxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5jb2RlXG5cdFx0KSB7XG5cdFx0XHRiYWNrZW5kTWVzc2FnZXMucHVzaChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGJhY2tlbmRNZXNzYWdlcztcbn1cbmZ1bmN0aW9uIHJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyhiQm91bmRNZXNzYWdlczogYW55LCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdGNvbnN0IGFNZXNzYWdlc1RvQmVEZWxldGVkID0gZ2V0TWVzc2FnZXMoYkJvdW5kTWVzc2FnZXMsIHRydWUsIHNQYXRoVG9CZVJlbW92ZWQpO1xuXG5cdGlmIChhTWVzc2FnZXNUb0JlRGVsZXRlZC5sZW5ndGggPiAwKSB7XG5cdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLnJlbW92ZU1lc3NhZ2VzKGFNZXNzYWdlc1RvQmVEZWxldGVkKTtcblx0fVxufVxuLy9UT0RPOiBUaGlzIG11c3QgYmUgbW92ZWQgb3V0IG9mIG1lc3NhZ2UgaGFuZGxpbmdcbmZ1bmN0aW9uIHNldE1lc3NhZ2VTdWJ0aXRsZShvVGFibGU6IFRhYmxlLCBhQ29udGV4dHM6IENvbnRleHRbXSwgbWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIpIHtcblx0aWYgKG1lc3NhZ2UuYWRkaXRpb25hbFRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHN1YnRpdGxlQ29sdW1uID0gKG9UYWJsZS5nZXRQYXJlbnQoKSBhcyBhbnkpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRjb25zdCBlcnJvckNvbnRleHQgPSBhQ29udGV4dHMuZmluZChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0cygpWzBdLmluZGV4T2Yob0NvbnRleHQuZ2V0UGF0aCgpKSAhPT0gLTE7XG5cdFx0fSk7XG5cdFx0bWVzc2FnZS5hZGRpdGlvbmFsVGV4dCA9IGVycm9yQ29udGV4dCA/IGVycm9yQ29udGV4dC5nZXRPYmplY3QoKVtzdWJ0aXRsZUNvbHVtbl0gOiB1bmRlZmluZWQ7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgbWV0aG9kIHJldHJpZXZlcyB0aGUgdmlzaWJsZSBzZWN0aW9ucyBmcm9tIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvT2JqZWN0UGFnZUxheW91dCBUaGUgb2JqZWN0UGFnZUxheW91dCBvYmplY3QgZm9yIHdoaWNoIHdlIHdhbnQgdG8gcmV0cmlldmUgdGhlIHZpc2libGUgc2VjdGlvbnMuXG4gKiBAcmV0dXJucyBBcnJheSBvZiB2aXNpYmxlIHNlY3Rpb25zLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQob09iamVjdFBhZ2VMYXlvdXQ6IENvbnRyb2wgfCBPYmplY3RQYWdlTGF5b3V0KSB7XG5cdHJldHVybiAob09iamVjdFBhZ2VMYXlvdXQgYXMgT2JqZWN0UGFnZUxheW91dCkuZ2V0U2VjdGlvbnMoKS5maWx0ZXIoZnVuY3Rpb24gKG9TZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbikge1xuXHRcdHJldHVybiBvU2VjdGlvbi5nZXRWaXNpYmxlKCk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGNvbnRyb2wgaWRzIGZyb20gbWVzc2FnZSBhcmUgYSBwYXJ0IG9mIGEgZ2l2ZW4gc3Vic2VjdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3ViU2VjdGlvblxuICogQHBhcmFtIG9NZXNzYWdlT2JqZWN0XG4gKiBAcmV0dXJucyBTdWJTZWN0aW9uIG1hdGNoaW5nIGNvbnRyb2wgaWRzLlxuICovXG5mdW5jdGlvbiBnZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbihzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbiwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyKTogVUk1RWxlbWVudFtdIHtcblx0cmV0dXJuIHN1YlNlY3Rpb25cblx0XHQuZmluZEVsZW1lbnRzKHRydWUsIChvRWxlbTogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gZm5GaWx0ZXJVcG9uSWRzKG9NZXNzYWdlT2JqZWN0LmdldENvbnRyb2xJZHMoKSwgb0VsZW0pO1xuXHRcdH0pXG5cdFx0LnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHQvLyBjb250cm9scyBhcmUgc29ydGVkIGluIG9yZGVyIHRvIGhhdmUgdGhlIHRhYmxlIG9uIHRvcCBvZiB0aGUgYXJyYXlcblx0XHRcdC8vIGl0IHdpbGwgaGVscCB0byBjb21wdXRlIHRoZSBzdWJ0aXRsZSBvZiB0aGUgbWVzc2FnZSBiYXNlZCBvbiB0aGUgdHlwZSBvZiByZWxhdGVkIGNvbnRyb2xzXG5cdFx0XHRpZiAoYS5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmICFiLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldFRhYmxlQ29sUHJvcGVydHkob1RhYmxlOiBDb250cm9sLCBvTWVzc2FnZU9iamVjdDogTWVzc2FnZVdpdGhIZWFkZXIsIG9Db250ZXh0UGF0aD86IGFueSkge1xuXHQvL3RoaXMgZnVuY3Rpb24gZXNjYXBlcyBhIHN0cmluZyB0byB1c2UgaXQgYXMgYSByZWdleFxuXHRjb25zdCBmblJlZ0V4cGVzY2FwZSA9IGZ1bmN0aW9uIChzOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gcy5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKTtcblx0fTtcblx0Ly8gYmFzZWQgb24gdGhlIHRhcmdldCBwYXRoIG9mIHRoZSBtZXNzYWdlIHdlIHJldHJpZXZlIHRoZSBwcm9wZXJ0eSBuYW1lLlxuXHQvLyB0byBhY2hpZXZlIGl0IHdlIHJlbW92ZSB0aGUgYmluZGluZ0NvbnRleHQgcGF0aCBhbmQgdGhlIHJvdyBiaW5kaW5nIHBhdGggZnJvbSB0aGUgdGFyZ2V0XG5cdGlmICghb0NvbnRleHRQYXRoKSB7XG5cdFx0b0NvbnRleHRQYXRoID0gbmV3IFJlZ0V4cChcblx0XHRcdGAke2ZuUmVnRXhwZXNjYXBlKGAke29UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7KG9UYWJsZSBhcyBUYWJsZSkuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKX1gKX1cXFxcKC4qXFxcXCkvYFxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXS5yZXBsYWNlKG9Db250ZXh0UGF0aCwgXCJcIik7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBnaXZlcyB0aGUgY29sdW1uIGluZm9ybWF0aW9uIGlmIGl0IG1hdGNoZXMgd2l0aCB0aGUgcHJvcGVydHkgbmFtZSBmcm9tIHRhcmdldCBvZiBtZXNzYWdlLlxuICpcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eVxuICogQHJldHVybnMgQ29sdW1uIG5hbWUgYW5kIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBnZXRUYWJsZUNvbEluZm8ob1RhYmxlOiBDb250cm9sLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nKSB7XG5cdGxldCBzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmc7XG5cdGxldCBvVGFibGVUYXJnZXRDb2wgPSAob1RhYmxlIGFzIFRhYmxlKS5nZXRDb2x1bW5zKCkuZmluZChmdW5jdGlvbiAoY29sdW1uOiBhbnkpIHtcblx0XHRyZXR1cm4gY29sdW1uLmdldERhdGFQcm9wZXJ0eSgpID09IHNUYWJsZVRhcmdldENvbFByb3BlcnR5O1xuXHR9KTtcblx0aWYgKCFvVGFibGVUYXJnZXRDb2wpIHtcblx0XHQvKiBJZiB0aGUgdGFyZ2V0IGNvbHVtbiBpcyBub3QgZm91bmQsIHdlIGNoZWNrIGZvciBhIGN1c3RvbSBjb2x1bW4gKi9cblx0XHRjb25zdCBvQ3VzdG9tQ29sdW1uID0gKG9UYWJsZSBhcyBUYWJsZSlcblx0XHRcdC5nZXRDb250cm9sRGVsZWdhdGUoKVxuXHRcdFx0LmdldENvbHVtbnNGb3Iob1RhYmxlKVxuXHRcdFx0LmZpbmQoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRpZiAoISFvQ29sdW1uLnRlbXBsYXRlICYmIG9Db2x1bW4ucHJvcGVydHlJbmZvcykge1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRvQ29sdW1uLnByb3BlcnR5SW5mb3NbMF0gPT09IHNUYWJsZVRhcmdldENvbFByb3BlcnR5IHx8XG5cdFx0XHRcdFx0XHRvQ29sdW1uLnByb3BlcnR5SW5mb3NbMF0ucmVwbGFjZShcIlByb3BlcnR5OjpcIiwgXCJcIikgPT09IHNUYWJsZVRhcmdldENvbFByb3BlcnR5XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGlmIChvQ3VzdG9tQ29sdW1uKSB7XG5cdFx0XHRvVGFibGVUYXJnZXRDb2wgPSBvQ3VzdG9tQ29sdW1uO1xuXHRcdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSAob1RhYmxlVGFyZ2V0Q29sIGFzIGFueSk/Lm5hbWU7XG5cblx0XHRcdHNUYWJsZVRhcmdldENvbE5hbWUgPSAob1RhYmxlIGFzIGFueSlcblx0XHRcdFx0LmdldENvbHVtbnMoKVxuXHRcdFx0XHQuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID09PSBvQ29sdW1uLmdldERhdGFQcm9wZXJ0eSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZ2V0SGVhZGVyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8qIElmIHRoZSB0YXJnZXQgY29sdW1uIGlzIG5vdCBmb3VuZCwgd2UgY2hlY2sgZm9yIGEgZmllbGQgZ3JvdXAgKi9cblx0XHRcdGNvbnN0IGFDb2x1bW5zID0gKG9UYWJsZSBhcyBUYWJsZSkuZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0Q29sdW1uc0ZvcihvVGFibGUpO1xuXHRcdFx0b1RhYmxlVGFyZ2V0Q29sID0gYUNvbHVtbnMuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRcdGlmIChvQ29sdW1uLmtleS5pbmRleE9mKFwiOjpGaWVsZEdyb3VwOjpcIikgIT09IC0xKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db2x1bW4ucHJvcGVydHlJbmZvcz8uZmluZChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYUNvbHVtbnMuZmluZChmdW5jdGlvbiAodGFibGVDb2x1bW46IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoID09PSBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdC8qIGNoZWNrIGlmIHRoZSBjb2x1bW4gd2l0aCB0aGUgZmllbGQgZ3JvdXAgaXMgdmlzaWJsZSBpbiB0aGUgdGFibGU6ICovXG5cdFx0XHRsZXQgYklzVGFibGVUYXJnZXRDb2xWaXNpYmxlID0gZmFsc2U7XG5cdFx0XHRpZiAob1RhYmxlVGFyZ2V0Q29sICYmIChvVGFibGVUYXJnZXRDb2wgYXMgYW55KS5sYWJlbCkge1xuXHRcdFx0XHRiSXNUYWJsZVRhcmdldENvbFZpc2libGUgPSAob1RhYmxlIGFzIFRhYmxlKS5nZXRDb2x1bW5zKCkuc29tZShmdW5jdGlvbiAoY29sdW1uOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29sdW1uLmdldEhlYWRlcigpID09PSAob1RhYmxlVGFyZ2V0Q29sIGFzIGFueSkubGFiZWw7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZSA9IGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSAmJiAob1RhYmxlVGFyZ2V0Q29sIGFzIGFueSkubGFiZWw7XG5cdFx0XHRzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9IGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSAmJiAob1RhYmxlVGFyZ2V0Q29sIGFzIGFueSkua2V5O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID0gb1RhYmxlVGFyZ2V0Q29sICYmIG9UYWJsZVRhcmdldENvbC5nZXRIZWFkZXIoKTtcblx0fVxuXHRyZXR1cm4geyBzVGFibGVUYXJnZXRDb2xOYW1lOiBzVGFibGVUYXJnZXRDb2xOYW1lLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgfTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdpdmVzIFRhYmxlIGFuZCBjb2x1bW4gaW5mbyBpZiBhbnkgb2YgaXQgbWF0Y2hlcyB0aGUgdGFyZ2V0IGZyb20gTWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gb01lc3NhZ2VPYmplY3RcbiAqIEBwYXJhbSBvRWxlbWVudFxuICogQHBhcmFtIG9Sb3dCaW5kaW5nXG4gKiBAcmV0dXJucyBUYWJsZSBpbmZvIG1hdGNoaW5nIHRoZSBtZXNzYWdlIHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVBbmRUYXJnZXRJbmZvKG9UYWJsZTogVGFibGUsIG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlciwgb0VsZW1lbnQ6IGFueSwgb1Jvd0JpbmRpbmc6IEJpbmRpbmcpOiBUYXJnZXRUYWJsZUluZm9UeXBlIHtcblx0Y29uc3Qgb1RhcmdldFRhYmxlSW5mbzogYW55ID0ge307XG5cdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBnZXRUYWJsZUNvbFByb3BlcnR5KG9UYWJsZSwgb01lc3NhZ2VPYmplY3QpO1xuXHRjb25zdCBvVGFibGVDb2xJbmZvID0gZ2V0VGFibGVDb2xJbmZvKG9UYWJsZSwgb1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSk7XG5cdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzID0gb0VsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpXG5cdFx0PyAob1Jvd0JpbmRpbmcgYXMgT0RhdGFMaXN0QmluZGluZykuZ2V0Q29udGV4dHMoKVxuXHRcdDogKG9Sb3dCaW5kaW5nIGFzIE9EYXRhTGlzdEJpbmRpbmcpLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUgPSBvVGFibGVDb2xJbmZvLnNUYWJsZVRhcmdldENvbE5hbWU7XG5cdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBvVGFibGVDb2xJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5O1xuXHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQgPSBvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cy5maW5kKGZ1bmN0aW9uIChyb3dDb250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gcm93Q29udGV4dCAmJiBvTWVzc2FnZU9iamVjdC5nZXRUYXJnZXRzKClbMF0uaW5kZXhPZihyb3dDb250ZXh0LmdldFBhdGgoKSkgPT09IDA7XG5cdH0pO1xuXHRyZXR1cm4gb1RhcmdldFRhYmxlSW5mbztcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIGFDb250cm9sSWRzXG4gKiBAcGFyYW0gb0l0ZW1cbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGl0ZW0gbWF0Y2hlcyBvbmUgb2YgdGhlIGNvbnRyb2xzXG4gKi9cbmZ1bmN0aW9uIGZuRmlsdGVyVXBvbklkcyhhQ29udHJvbElkczogc3RyaW5nW10sIG9JdGVtOiBVSTVFbGVtZW50KTogYm9vbGVhbiB7XG5cdHJldHVybiBhQ29udHJvbElkcy5zb21lKGZ1bmN0aW9uIChzQ29udHJvbElkKSB7XG5cdFx0aWYgKHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gZ2l2ZXMgdGhlIGdyb3VwIG5hbWUgaGF2aW5nIHNlY3Rpb24gYW5kIHN1YnNlY3Rpb24gZGF0YS5cbiAqXG4gKiBAcGFyYW0gc2VjdGlvblxuICogQHBhcmFtIHN1YlNlY3Rpb25cbiAqIEBwYXJhbSBiTXVsdGlwbGVTdWJTZWN0aW9uc1xuICogQHBhcmFtIG9UYXJnZXRUYWJsZUluZm9cbiAqIEBwYXJhbSByZXNvdXJjZU1vZGVsXG4gKiBAcmV0dXJucyBHcm91cCBuYW1lLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTZWN0aW9uR3JvdXBOYW1lKFxuXHRzZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbixcblx0c3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24sXG5cdGJNdWx0aXBsZVN1YlNlY3Rpb25zOiBib29sZWFuLFxuXHRvVGFyZ2V0VGFibGVJbmZvOiBUYXJnZXRUYWJsZUluZm9UeXBlLFxuXHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsXG4pOiBzdHJpbmcge1xuXHRyZXR1cm4gKFxuXHRcdHNlY3Rpb24uZ2V0VGl0bGUoKSArXG5cdFx0KHN1YlNlY3Rpb24uZ2V0VGl0bGUoKSAmJiBiTXVsdGlwbGVTdWJTZWN0aW9ucyA/IGAsICR7c3ViU2VjdGlvbi5nZXRUaXRsZSgpfWAgOiBcIlwiKSArXG5cdFx0KG9UYXJnZXRUYWJsZUluZm8gPyBgLCAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9USVRMRV9UQUJMRV9ERU5PTUlOQVRPUlwiKX06ICR7b1RhcmdldFRhYmxlSW5mby50YWJsZUhlYWRlcn1gIDogXCJcIilcblx0KTtcbn1cblxuZnVuY3Rpb24gYklzT3JwaGFuRWxlbWVudChvRWxlbWVudDogVUk1RWxlbWVudCwgYUVsZW1lbnRzOiBVSTVFbGVtZW50W10pOiBib29sZWFuIHtcblx0cmV0dXJuICFhRWxlbWVudHMuc29tZShmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdGxldCBvUGFyZW50RWxlbWVudCA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdHdoaWxlIChvUGFyZW50RWxlbWVudCAmJiBvUGFyZW50RWxlbWVudCAhPT0gb0VsZW0pIHtcblx0XHRcdG9QYXJlbnRFbGVtZW50ID0gb1BhcmVudEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyZW50RWxlbWVudCA/IHRydWUgOiBmYWxzZTtcblx0fSk7XG59XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyBmb3IgRmlvcmkgTWVzc2FnZSBIYW5kbGluZ1xuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLm1lc3NhZ2VIYW5kbGluZ1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG1lc3NhZ2VIYW5kbGluZzogbWVzc2FnZUhhbmRsaW5nVHlwZSA9IHtcblx0Z2V0TWVzc2FnZXM6IGdldE1lc3NhZ2VzLFxuXHRzaG93VW5ib3VuZE1lc3NhZ2VzOiBzaG93VW5ib3VuZE1lc3NhZ2VzLFxuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiByZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzLFxuXHRyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlczogcmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMsXG5cdG1vZGlmeUVUYWdNZXNzYWdlc09ubHk6IGZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSxcblx0Z2V0UmV0cnlBZnRlck1lc3NhZ2U6IGdldFJldHJ5QWZ0ZXJNZXNzYWdlLFxuXHRwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2c6IHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyxcblx0c2V0TWVzc2FnZVN1YnRpdGxlOiBzZXRNZXNzYWdlU3VidGl0bGUsXG5cdGdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0OiBnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCxcblx0Z2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb246IGdldENvbnRyb2xGcm9tTWVzc2FnZVJlbGF0aW5nVG9TdWJTZWN0aW9uLFxuXHRmbkZpbHRlclVwb25JZHM6IGZuRmlsdGVyVXBvbklkcyxcblx0Z2V0VGFibGVBbmRUYXJnZXRJbmZvOiBnZXRUYWJsZUFuZFRhcmdldEluZm8sXG5cdGNyZWF0ZVNlY3Rpb25Hcm91cE5hbWU6IGNyZWF0ZVNlY3Rpb25Hcm91cE5hbWUsXG5cdGJJc09ycGhhbkVsZW1lbnQ6IGJJc09ycGhhbkVsZW1lbnQsXG5cdGdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZTogZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lLFxuXHRnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlOiBnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlLFxuXHRnZXRUYWJsZUNvbEluZm86IGdldFRhYmxlQ29sSW5mbyxcblx0Z2V0VGFibGVDb2xQcm9wZXJ0eTogZ2V0VGFibGVDb2xQcm9wZXJ0eSxcblx0Z2V0TWVzc2FnZVN1YnRpdGxlOiBnZXRNZXNzYWdlU3VidGl0bGUsXG5cdGRldGVybWluZUNvbHVtbkluZm86IGRldGVybWluZUNvbHVtbkluZm8sXG5cdGZldGNoQ29sdW1uSW5mbzogZmV0Y2hDb2x1bW5JbmZvLFxuXHRnZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbjogZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24sXG5cdGdldE1lc3NhZ2VSYW5rOiBnZXRNZXNzYWdlUmFuayxcblx0Zm5DYWxsYmFja1NldEdyb3VwTmFtZTogZm5DYWxsYmFja1NldEdyb3VwTmFtZSxcblx0Z2V0VGFibGVGaXJzdENvbFZhbHVlOiBnZXRUYWJsZUZpcnN0Q29sVmFsdWUsXG5cdHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGU6IHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUsXG5cdHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWU6IHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWUsXG5cdHNldEdyb3VwTmFtZUxSVGFibGU6IHNldEdyb3VwTmFtZUxSVGFibGUsXG5cdGlzQ29udHJvbEluVGFibGU6IGlzQ29udHJvbEluVGFibGUsXG5cdGlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93OiBpc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvd1xufTtcblxuZXhwb3J0IGRlZmF1bHQgbWVzc2FnZUhhbmRsaW5nO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWtDQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0QsV0FBVztFQUN2QyxJQUFJRSxZQUFtQixHQUFHLEVBQUU7RUFDNUIsSUFBSUMsZ0JBQXVCLEdBQUcsRUFBRTtFQUNoQyxJQUFJQyxpQkFBd0IsR0FBRyxFQUFFO0VBQ2pDLElBQUlDLE9BQWU7RUFDbkIsSUFBSUMsV0FBbUI7RUFDdkIsSUFBSUMsWUFBeUI7RUFrSDdCLFNBQVNDLHdCQUF3QixHQUFHO0lBQ25DLElBQUlDLGtCQUEwQjs7SUFFOUI7SUFDQSxTQUFTQyxZQUFZLENBQUNDLFNBQWMsRUFBRTtNQUNyQyxPQUFPQSxTQUFTLENBQUNDLFFBQVEsR0FDdEIsTUFBTSxHQUNORCxTQUFTLENBQUNDLFFBQVEsR0FDbEIsV0FBVyxHQUNYRCxTQUFTLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUNDLEdBQUcsQ0FBQ0osU0FBUyxDQUFDQyxRQUFRLENBQUNJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRUwsU0FBUyxDQUFDQyxRQUFRLENBQUNJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUNqSCxTQUFTLEdBQ1QsSUFBSSxHQUNKTCxT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