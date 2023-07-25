/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/messages/MessagePopover", "sap/m/Button", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/mvc/View", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, UriParameters, messageHandling, ClassSupport, ResourceModelHelper, MessagePopover, Button, ColumnListItem, Dialog, FormattedText, library, Core, coreLibrary, View, Filter, FilterOperator, Sorter) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var MessageType = coreLibrary.MessageType;
  var ButtonType = library.ButtonType;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MessageButton = (_dec = defineUI5Class("sap.fe.macros.messages.MessageButton"), _dec2 = aggregation({
    type: "sap.fe.macros.messages.MessageFilter",
    multiple: true,
    singularName: "customFilter"
  }), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Button) {
    _inheritsLoose(MessageButton, _Button);
    function MessageButton(id, settings) {
      var _this;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _this = _Button.call(this, id, settings) || this;
      _initializerDefineProperty(_this, "customFilters", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageChange", _descriptor2, _assertThisInitialized(_this));
      _this.sGeneralGroupText = "";
      _this.sViewId = "";
      _this.sLastActionText = "";
      return _this;
    }
    var _proto = MessageButton.prototype;
    _proto.init = function init() {
      Button.prototype.init.apply(this);
      //press event handler attached to open the message popover
      this.attachPress(this.handleMessagePopoverPress, this);
      this.oMessagePopover = new MessagePopover();
      this.oItemBinding = this.oMessagePopover.getBinding("items");
      this.oItemBinding.attachChange(this._setMessageData, this);
      const messageButtonId = this.getId();
      if (messageButtonId) {
        this.oMessagePopover.addCustomData(new sap.ui.core.CustomData({
          key: "messageButtonId",
          value: messageButtonId
        })); // TODO check for custom data type
      }

      this.attachModelContextChange(this._applyFiltersAndSort.bind(this));
      this.oMessagePopover.attachActiveTitlePress(this._activeTitlePress.bind(this));
    }

    /**
     * The method that is called when a user clicks on the MessageButton control.
     *
     * @param oEvent Event object
     */;
    _proto.handleMessagePopoverPress = function handleMessagePopoverPress(oEvent) {
      this.oMessagePopover.toggle(oEvent.getSource());
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     * This method force the loading of contexts for all tables before to apply the grouping.
     *
     * @param oView Current view.
     * @returns Return promise.
     * @private
     */;
    _proto._applyGroupingAsync = async function _applyGroupingAsync(oView) {
      const aWaitForData = [];
      const oViewBindingContext = oView.getBindingContext();
      const _findTablesRelatedToMessages = view => {
        const oRes = [];
        const aMessages = this.oItemBinding.getContexts().map(function (oContext) {
          return oContext.getObject();
        });
        const oViewContext = view.getBindingContext();
        if (oViewContext) {
          const oObjectPage = view.getContent()[0];
          messageHandling.getVisibleSectionsFromObjectPageLayout(oObjectPage).forEach(function (oSection) {
            oSection.getSubSections().forEach(function (oSubSection) {
              oSubSection.findElements(true).forEach(function (oElem) {
                if (oElem.isA("sap.ui.mdc.Table")) {
                  for (let i = 0; i < aMessages.length; i++) {
                    const oRowBinding = oElem.getRowBinding();
                    if (oRowBinding) {
                      const sElemeBindingPath = `${oViewContext.getPath()}/${oElem.getRowBinding().getPath()}`;
                      if (aMessages[i].target.indexOf(sElemeBindingPath) === 0) {
                        oRes.push({
                          table: oElem,
                          subsection: oSubSection
                        });
                        break;
                      }
                    }
                  }
                }
              });
            });
          });
        }
        return oRes;
      };
      // Search for table related to Messages and initialize the binding context of the parent subsection to retrieve the data
      const oTables = _findTablesRelatedToMessages.bind(this)(oView);
      oTables.forEach(function (_oTable) {
        var _oMDCTable$getBinding;
        const oMDCTable = _oTable.table,
          oSubsection = _oTable.subsection;
        if (!oMDCTable.getBindingContext() || ((_oMDCTable$getBinding = oMDCTable.getBindingContext()) === null || _oMDCTable$getBinding === void 0 ? void 0 : _oMDCTable$getBinding.getPath()) !== (oViewBindingContext === null || oViewBindingContext === void 0 ? void 0 : oViewBindingContext.getPath())) {
          oSubsection.setBindingContext(oViewBindingContext);
          if (!oMDCTable.getRowBinding().isLengthFinal()) {
            aWaitForData.push(new Promise(function (resolve) {
              oMDCTable.getRowBinding().attachEventOnce("dataReceived", function () {
                resolve();
              });
            }));
          }
        }
      });
      const waitForGroupingApplied = new Promise(resolve => {
        setTimeout(async () => {
          this._applyGrouping();
          resolve();
        }, 0);
      });
      try {
        await Promise.all(aWaitForData);
        oView.getModel().checkMessages();
        await waitForGroupingApplied;
      } catch (err) {
        Log.error("Error while grouping the messages in the messagePopOver");
      }
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     *
     * @private
     */;
    _proto._applyGrouping = function _applyGrouping() {
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      if (!this.oObjectPageLayout) {
        return;
      }
      const aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages);
    }

    /**
     * The method retrieves the binding context for the refError object.
     * The refError contains a map to store the indexes of the rows with errors.
     *
     * @param oTable The table for which we want to get the refError Object.
     * @returns Context of the refError.
     * @private
     */;
    _proto._getTableRefErrorContext = function _getTableRefErrorContext(oTable) {
      const oModel = oTable.getModel("internal");
      //initialize the refError property if it doesn't exist
      if (!oTable.getBindingContext("internal").getProperty("refError")) {
        oModel.setProperty("refError", {}, oTable.getBindingContext("internal"));
      }
      const sRefErrorContextPath = oTable.getBindingContext("internal").getPath() + "/refError/" + oTable.getBindingContext().getPath().replace("/", "$") + "$" + oTable.getRowBinding().getPath().replace("/", "$");
      const oContext = oModel.getContext(sRefErrorContextPath);
      if (!oContext.getProperty("")) {
        oModel.setProperty("", {}, oContext);
      }
      return oContext;
    };
    _proto._updateInternalModel = function _updateInternalModel(oTableRowContext, iRowIndex, sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow) {
      let oTemp;
      if (bIsCreationRow) {
        oTemp = {
          rowIndex: "CreationRow",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      } else {
        oTemp = {
          rowIndex: oTableRowContext ? iRowIndex : "",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      }
      const oModel = oTable.getModel("internal"),
        oContext = this._getTableRefErrorContext(oTable);
      //we first remove the entries with obsolete message ids from the internal model before inserting the new error info :
      const aValidMessageIds = sap.ui.getCore().getMessageManager().getMessageModel().getData().map(function (message) {
        return message.id;
      });
      let aObsoleteMessagelIds;
      if (oContext.getProperty()) {
        aObsoleteMessagelIds = Object.keys(oContext.getProperty()).filter(function (internalMessageId) {
          return aValidMessageIds.indexOf(internalMessageId) === -1;
        });
        aObsoleteMessagelIds.forEach(function (obsoleteId) {
          delete oContext.getProperty()[obsoleteId];
        });
      }
      oModel.setProperty(oMessageObject.getId(), Object.assign({}, oContext.getProperty(oMessageObject.getId()) ? oContext.getProperty(oMessageObject.getId()) : {}, oTemp), oContext);
    }

    /**
     * The method that sets groups for transient messages.
     *
     * @param {object} message The transient message for which we want to compute and set group.
     * @param {string} sActionName The action name.
     * @private
     */;
    _proto._setGroupLabelForTransientMsg = function _setGroupLabelForTransientMsg(message, sActionName) {
      this.sLastActionText = this.sLastActionText ? this.sLastActionText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
      message.setGroupName(`${this.sLastActionText}: ${sActionName}`);
    }

    /**
     * The method that groups messages and adds the subtitle.
     *
     * @param {object} message The message we use to compute the group and subtitle.
     * @param {object} section The section containing the controls.
     * @param {object} subSection The subsection containing the controls.
     * @param {object} aElements List of controls from a subsection related to a message.
     * @param {boolean} bMultipleSubSections True if there is more than 1 subsection in the section.
     * @param {string} sActionName The action name.
     * @returns {object} Return the control targeted by the message.
     * @private
     */;
    _proto._computeMessageGroupAndSubTitle = function _computeMessageGroupAndSubTitle(message, section, subSection, aElements, bMultipleSubSections, sActionName) {
      var _message$getBindingCo;
      const resourceModel = getResourceModel(section);
      this.oItemBinding.detachChange(this._setMessageData, this);
      const oMessageObject = (_message$getBindingCo = message.getBindingContext("message")) === null || _message$getBindingCo === void 0 ? void 0 : _message$getBindingCo.getObject();
      const setSectionNameInGroup = true;
      let oElement, oTable, oTargetTableInfo, l, iRowIndex, oTargetedControl, bIsCreationRow;
      const bIsBackendMessage = new RegExp("^/").test(oMessageObject === null || oMessageObject === void 0 ? void 0 : oMessageObject.getTargets()[0]);
      if (bIsBackendMessage) {
        for (l = 0; l < aElements.length; l++) {
          oElement = aElements[l];
          oTargetedControl = oElement;
          if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
            oTable = oElement.getParent();
            const oRowBinding = oTable.getRowBinding();
            const fnCallbackSetGroupName = (oMessageObj, actionName) => {
              this._setGroupLabelForTransientMsg(message, actionName);
            };
            if (oRowBinding && oRowBinding.isLengthFinal() && oTable.getBindingContext()) {
              const obj = messageHandling.getTableColumnDataAndSetSubtile(oMessageObject, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
              oTargetTableInfo = obj.oTargetTableInfo;
              if (obj.subTitle) {
                message.setSubtitle(obj.subTitle);
              }
              message.setActiveTitle(!!oTargetTableInfo.oTableRowContext);
              if (oTargetTableInfo.oTableRowContext) {
                this._formatMessageDescription(message, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable);
              }
              iRowIndex = oTargetTableInfo.oTableRowContext && oTargetTableInfo.oTableRowContext.getIndex();
              this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject);
            }
          } else {
            message.setActiveTitle(true);
            //check if the targeted control is a child of one of the other controls
            const bIsTargetedControlOrphan = messageHandling.bIsOrphanElement(oTargetedControl, aElements);
            if (bIsTargetedControlOrphan) {
              //set the subtitle
              message.setSubtitle("");
              break;
            }
          }
        }
      } else {
        //There is only one elt as this is a frontEnd message
        oTargetedControl = aElements[0];
        oTable = this._getMdcTable(oTargetedControl);
        if (oTable) {
          oTargetTableInfo = {};
          oTargetTableInfo.tableHeader = oTable.getHeader();
          const iTargetColumnIndex = this._getTableColumnIndex(oTargetedControl);
          oTargetTableInfo.sTableTargetColProperty = iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getDataProperty() : undefined;
          oTargetTableInfo.sTableTargetColName = oTargetTableInfo.sTableTargetColProperty && iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getHeader() : undefined;
          bIsCreationRow = this._getTableRow(oTargetedControl).isA("sap.ui.table.CreationRow");
          if (!bIsCreationRow) {
            iRowIndex = this._getTableRowIndex(oTargetedControl);
            oTargetTableInfo.oTableRowBindingContexts = oTable.getRowBinding().getCurrentContexts();
            oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts[iRowIndex];
          }
          const sMessageSubtitle = messageHandling.getMessageSubtitle(oMessageObject, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable, bIsCreationRow, iTargetColumnIndex === 0 && oTargetedControl.getValueState() === "Error" ? oTargetedControl : undefined);
          //set the subtitle
          if (sMessageSubtitle) {
            message.setSubtitle(sMessageSubtitle);
          }
          message.setActiveTitle(true);
          this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow);
        }
      }
      if (setSectionNameInGroup) {
        const sectionBasedGroupName = messageHandling.createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, resourceModel);
        message.setGroupName(sectionBasedGroupName);
        const sViewId = this._getViewId(this.getId());
        const oView = Core.byId(sViewId);
        const oMessageTargetProperty = oMessageObject.getTargets()[0] && oMessageObject.getTargets()[0].split("/").pop();
        const oUIModel = oView === null || oView === void 0 ? void 0 : oView.getModel("internal");
        if (oUIModel && oUIModel.getProperty("/messageTargetProperty") && oMessageTargetProperty && oMessageTargetProperty === oUIModel.getProperty("/messageTargetProperty")) {
          this.oMessagePopover.fireActiveTitlePress({
            item: message
          });
          oUIModel.setProperty("/messageTargetProperty", false);
        }
      }
      this.oItemBinding.attachChange(this._setMessageData, this);
      return oTargetedControl;
    };
    _proto._checkControlIdInSections = function _checkControlIdInSections(aMessages) {
      let section, aSubSections, message, i, j, k;
      this.sGeneralGroupText = this.sGeneralGroupText ? this.sGeneralGroupText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      //Get all sections from the object page layout
      const aVisibleSections = messageHandling.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      if (aVisibleSections) {
        var _oView$getBindingCont;
        const viewId = this._getViewId(this.getId());
        const oView = Core.byId(viewId);
        const sActionName = oView === null || oView === void 0 ? void 0 : (_oView$getBindingCont = oView.getBindingContext("internal")) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.getProperty("sActionName");
        if (sActionName) {
          (oView === null || oView === void 0 ? void 0 : oView.getBindingContext("internal")).setProperty("sActionName", null);
        }
        for (i = aMessages.length - 1; i >= 0; --i) {
          // Loop over all messages
          message = aMessages[i];
          let bIsGeneralGroupName = true;
          for (j = aVisibleSections.length - 1; j >= 0; --j) {
            // Loop over all visible sections
            section = aVisibleSections[j];
            aSubSections = section.getSubSections();
            for (k = aSubSections.length - 1; k >= 0; --k) {
              // Loop over all sub-sections
              const subSection = aSubSections[k];
              const oMessageObject = message.getBindingContext("message").getObject();
              const aControls = messageHandling.getControlFromMessageRelatingToSubSection(subSection, oMessageObject);
              if (aControls.length > 0) {
                const oTargetedControl = this._computeMessageGroupAndSubTitle(message, section, subSection, aControls, aSubSections.length > 1, sActionName);
                // if we found table that matches with the message, we don't stop the loop
                // in case we find an additional control (eg mdc field) that also match with the message
                if (oTargetedControl && !oTargetedControl.isA("sap.m.Table") && !oTargetedControl.isA("sap.ui.table.Table")) {
                  j = k = -1;
                }
                bIsGeneralGroupName = false;
              }
            }
          }
          if (bIsGeneralGroupName) {
            const oMessageObject = message.getBindingContext("message").getObject();
            message.setActiveTitle(false);
            if (oMessageObject.persistent && sActionName) {
              this._setGroupLabelForTransientMsg(message, sActionName);
            } else {
              message.setGroupName(this.sGeneralGroupText);
            }
          }
        }
      }
    };
    _proto._findTargetForMessage = function _findTargetForMessage(message) {
      const messageObject = message.getBindingContext("message") && message.getBindingContext("message").getObject();
      if (messageObject && messageObject.target) {
        const oMetaModel = this.oObjectPageLayout && this.oObjectPageLayout.getModel() && this.oObjectPageLayout.getModel().getMetaModel(),
          contextPath = oMetaModel && oMetaModel.getMetaPath(messageObject.target),
          oContextPathMetadata = oMetaModel && oMetaModel.getObject(contextPath);
        if (oContextPathMetadata && oContextPathMetadata.$kind === "Property") {
          return true;
        }
      }
    };
    _proto._fnEnableBindings = function _fnEnableBindings(aSections) {
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest")) {
        return;
      }
      for (let iSection = 0; iSection < aSections.length; iSection++) {
        const oSection = aSections[iSection];
        let nonTableChartcontrolFound = false;
        const aSubSections = oSection.getSubSections();
        for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++) {
          const oSubSection = aSubSections[iSubSection];
          const oAllBlocks = oSubSection.getBlocks();
          if (oAllBlocks) {
            for (let block = 0; block < oSubSection.getBlocks().length; block++) {
              var _oAllBlocks$block$get;
              if (oAllBlocks[block].getContent && !((_oAllBlocks$block$get = oAllBlocks[block].getContent()) !== null && _oAllBlocks$block$get !== void 0 && _oAllBlocks$block$get.isA("sap.fe.macros.table.TableAPI"))) {
                nonTableChartcontrolFound = true;
                break;
              }
            }
            if (nonTableChartcontrolFound) {
              oSubSection.setBindingContext(undefined);
            }
          }
          if (oSubSection.getBindingContext()) {
            this._findMessageGroupAfterRebinding();
            oSubSection.getBindingContext().getBinding().attachDataReceived(this._findMessageGroupAfterRebinding.bind(this));
          }
        }
      }
    };
    _proto._findMessageGroupAfterRebinding = function _findMessageGroupAfterRebinding() {
      const aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages);
    }

    /**
     * The method that retrieves the view ID (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
     *
     * @param sControlId ID of the control needed to retrieve the view ID
     * @returns The view ID of the control
     */;
    _proto._getViewId = function _getViewId(sControlId) {
      let sViewId,
        oControl = Core.byId(sControlId);
      while (oControl) {
        if (oControl instanceof View) {
          sViewId = oControl.getId();
          break;
        }
        oControl = oControl.getParent();
      }
      return sViewId;
    };
    _proto._setLongtextUrlDescription = function _setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle) {
      this.oMessagePopover.setAsyncDescriptionHandler(function (config) {
        // This stores the old description
        const sOldDescription = sMessageDescriptionContent;
        // Here we can fetch the data and concatenate it to the old one
        // By default, the longtextUrl fetching will overwrite the description (with the default behaviour)
        // Here as we have overwritten the default async handler, which fetches and replaces the description of the item
        // we can manually modify it to include whatever needed.
        const sLongTextUrl = config.item.getLongtextUrl();
        if (sLongTextUrl) {
          jQuery.ajax({
            type: "GET",
            url: sLongTextUrl,
            success: function (data) {
              const sDiagnosisText = oDiagnosisTitle.getHtmlText() + data;
              config.item.setDescription(`${sOldDescription}${sDiagnosisText}`);
              config.promise.resolve();
            },
            error: function () {
              config.item.setDescription(sMessageDescriptionContent);
              const sError = `A request has failed for long text data. URL: ${sLongTextUrl}`;
              Log.error(sError);
              config.promise.reject(sError);
            }
          });
        }
      });
    };
    _proto._formatMessageDescription = function _formatMessageDescription(message, oTableRowContext, sTableTargetColName, oTable) {
      var _message$getBindingCo2;
      const resourceModel = getResourceModel(oTable);
      const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
      let sColumnInfo = "";
      const oMsgObj = (_message$getBindingCo2 = message.getBindingContext("message")) === null || _message$getBindingCo2 === void 0 ? void 0 : _message$getBindingCo2.getObject();
      const oColFromTableSettings = messageHandling.fetchColumnInfo(oMsgObj, oTable);
      if (sTableTargetColName) {
        // if column in present in table definition
        sColumnInfo = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${sTableTargetColName}`;
      } else if (oColFromTableSettings) {
        if (oColFromTableSettings.availability === "Hidden") {
          // if column in neither in table definition nor personalization
          if (message.getType() === "Error") {
            sColumnInfo = sTableFirstColProperty ? `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")}` + ".";
          } else {
            sColumnInfo = sTableFirstColProperty ? `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")}` + ".";
          }
        } else {
          // if column is not in table definition but in personalization
          //if no navigation to sub op then remove link to error field BCP : 2280168899
          if (!this._navigationConfigured(oTable)) {
            message.setActiveTitle(false);
          }
          sColumnInfo = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${oColFromTableSettings.label} (${resourceModel.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")})`;
        }
      }
      const oFieldsAffectedTitle = new FormattedText({
        htmlText: `<html><body><strong>${resourceModel.getText("T_FIELDS_AFFECTED_TITLE")}</strong></body></html><br>`
      });
      let sFieldAffectedText;
      if (sTableFirstColProperty) {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${oTableRowContext.getValue(sTableFirstColProperty)}<br>${sColumnInfo}<br>`;
      } else if (sColumnInfo == "" || !sColumnInfo) {
        sFieldAffectedText = "";
      } else {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${sColumnInfo}<br>`;
      }
      const oDiagnosisTitle = new FormattedText({
        htmlText: `<html><body><strong>${resourceModel.getText("T_DIAGNOSIS_TITLE")}</strong></body></html><br>`
      });
      // get the UI messages from the message context to set it to Diagnosis section
      const sUIMessageDescription = message.getBindingContext("message").getObject().description;
      //set the description to null to reset it below
      message.setDescription(null);
      let sDiagnosisText = "";
      let sMessageDescriptionContent = "";
      if (message.getLongtextUrl()) {
        sMessageDescriptionContent = `${sFieldAffectedText}<br>`;
        this._setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle);
      } else if (sUIMessageDescription) {
        sDiagnosisText = `${oDiagnosisTitle.getHtmlText()}<br>${sUIMessageDescription}`;
        sMessageDescriptionContent = `${sFieldAffectedText}<br>${sDiagnosisText}`;
        message.setDescription(sMessageDescriptionContent);
      } else {
        message.setDescription(sFieldAffectedText);
      }
    }

    /**
     * Method to set the button text, count and icon property based upon the message items
     * ButtonType:  Possible settings for warning and error messages are 'critical' and 'negative'.
     *
     *
     * @private
     */;
    _proto._setMessageData = function _setMessageData() {
      clearTimeout(this._setMessageDataTimeout);
      this._setMessageDataTimeout = setTimeout(async () => {
        const sIcon = "",
          oMessages = this.oMessagePopover.getItems(),
          oMessageCount = {
            Error: 0,
            Warning: 0,
            Success: 0,
            Information: 0
          },
          oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
          iMessageLength = oMessages.length;
        let sButtonType = ButtonType.Default,
          sMessageKey = "",
          sTooltipText = "",
          sMessageText = "";
        if (iMessageLength > 0) {
          for (let i = 0; i < iMessageLength; i++) {
            if (!oMessages[i].getType() || oMessages[i].getType() === "") {
              ++oMessageCount["Information"];
            } else {
              ++oMessageCount[oMessages[i].getType()];
            }
          }
          if (oMessageCount[MessageType.Error] > 0) {
            sButtonType = ButtonType.Negative;
          } else if (oMessageCount[MessageType.Warning] > 0) {
            sButtonType = ButtonType.Critical;
          } else if (oMessageCount[MessageType.Success] > 0) {
            sButtonType = ButtonType.Success;
          } else if (oMessageCount[MessageType.Information] > 0) {
            sButtonType = ButtonType.Neutral;
          }
          const totalNumberOfMessages = oMessageCount[MessageType.Error] + oMessageCount[MessageType.Warning] + oMessageCount[MessageType.Success] + oMessageCount[MessageType.Information];
          this.setText(totalNumberOfMessages.toString());
          if (oMessageCount.Error === 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR";
          } else if (oMessageCount.Error > 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_MULTIPLE_ERROR_TOOLTIP";
          } else if (!oMessageCount.Error && oMessageCount.Warning) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_WARNING_TOOLTIP";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && oMessageCount.Information) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && !oMessageCount.Information && oMessageCount.Success) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS";
          }
          if (sMessageKey) {
            sMessageText = oResourceBundle.getText(sMessageKey);
            sTooltipText = oMessageCount.Error ? `${oMessageCount.Error} ${sMessageText}` : sMessageText;
            this.setTooltip(sTooltipText);
          }
          this.setIcon(sIcon);
          this.setType(sButtonType);
          this.setVisible(true);
          const oView = Core.byId(this.sViewId);
          if (oView) {
            const oPageReady = oView.getController().pageReady;
            try {
              await oPageReady.waitPageReady();
              await this._applyGroupingAsync(oView);
            } catch (err) {
              Log.error("fail grouping messages");
            }
            this.fireMessageChange({
              iMessageLength: iMessageLength
            });
          }
          if (iMessageLength > 1) {
            this.oMessagePopover.navigateBack();
          }
        } else {
          this.setVisible(false);
          this.fireMessageChange({
            iMessageLength: iMessageLength
          });
        }
      }, 100);
    }

    /**
     * The method that is called when a user clicks on the title of the message.
     *
     * @function
     * @name _activeTitlePress
     * @private
     * @param oEvent Event object passed from the handler
     */;
    _proto._activeTitlePress = async function _activeTitlePress(oEvent) {
      const oInternalModelContext = this.getBindingContext("pageInternal");
      oInternalModelContext.setProperty("errorNavigationSectionFlag", true);
      const oItem = oEvent.getParameter("item"),
        oMessage = oItem.getBindingContext("message").getObject(),
        bIsBackendMessage = new RegExp("^/").test(oMessage.getTarget()),
        oView = Core.byId(this.sViewId);
      let oControl, sSectionTitle;
      const _defaultFocus = function (message, mdcTable) {
        const focusInfo = {
          preventScroll: true,
          targetInfo: message
        };
        mdcTable.focus(focusInfo);
      };

      //check if the pressed item is related to a table control
      if (oItem.getGroupName().indexOf("Table:") !== -1) {
        let oTargetMdcTable;
        if (bIsBackendMessage) {
          oTargetMdcTable = oMessage.controlIds.map(function (sControlId) {
            const control = Core.byId(sControlId);
            const oParentControl = control && control.getParent();
            return oParentControl && oParentControl.isA("sap.ui.mdc.Table") && oParentControl.getHeader() === oItem.getGroupName().split(", Table: ")[1] ? oParentControl : null;
          }).reduce(function (acc, val) {
            return val ? val : acc;
          });
          if (oTargetMdcTable) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            try {
              await this._navigateFromMessageToSectionTableInIconTabBarMode(oTargetMdcTable, this.oObjectPageLayout, sSectionTitle);
              const oRefErrorContext = this._getTableRefErrorContext(oTargetMdcTable);
              const oRefError = oRefErrorContext.getProperty(oItem.getBindingContext("message").getObject().getId());
              const _setFocusOnTargetField = async (targetMdcTable, iRowIndex) => {
                const aTargetMdcTableRow = this._getMdcTableRows(targetMdcTable),
                  iFirstVisibleRow = this._getGridTable(targetMdcTable).getFirstVisibleRow();
                if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                  const oTargetRow = aTargetMdcTableRow[iRowIndex - iFirstVisibleRow],
                    oTargetCell = this.getTargetCell(oTargetRow, oMessage);
                  if (oTargetCell) {
                    this.setFocusToControl(oTargetCell);
                    return undefined;
                  } else {
                    // control not found on table
                    const errorProperty = oMessage.getTarget().split("/").pop();
                    if (errorProperty) {
                      oView.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
                    }
                    if (this._navigationConfigured(targetMdcTable)) {
                      return oView.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
                    } else {
                      return false;
                    }
                  }
                }
                return undefined;
              };
              if (oTargetMdcTable.data("tableType") === "GridTable" && oRefError.rowIndex !== "") {
                const iFirstVisibleRow = this._getGridTable(oTargetMdcTable).getFirstVisibleRow();
                try {
                  await oTargetMdcTable.scrollToIndex(oRefError.rowIndex);
                  const aTargetMdcTableRow = this._getMdcTableRows(oTargetMdcTable);
                  let iNewFirstVisibleRow, bScrollNeeded;
                  if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                    iNewFirstVisibleRow = aTargetMdcTableRow[0].getParent().getFirstVisibleRow();
                    bScrollNeeded = iFirstVisibleRow - iNewFirstVisibleRow !== 0;
                  }
                  let oWaitControlIdAdded;
                  if (bScrollNeeded) {
                    //The scrollToIndex function does not wait for the UI update. As a workaround, pending a fix from MDC (BCP: 2170251631) we use the event "UIUpdated".
                    oWaitControlIdAdded = new Promise(function (resolve) {
                      Core.attachEvent("UIUpdated", resolve);
                    });
                  } else {
                    oWaitControlIdAdded = Promise.resolve();
                  }
                  await oWaitControlIdAdded;
                  setTimeout(async function () {
                    const focusOnTargetField = await _setFocusOnTargetField(oTargetMdcTable, oRefError.rowIndex);
                    if (focusOnTargetField === false) {
                      _defaultFocus(oMessage, oTargetMdcTable);
                    }
                  }, 0);
                } catch (err) {
                  Log.error("Error while focusing on error");
                }
              } else if (oTargetMdcTable.data("tableType") === "ResponsiveTable" && oRefError) {
                const focusOnMessageTargetControl = await this.focusOnMessageTargetControl(oView, oMessage, oTargetMdcTable, oRefError.rowIndex);
                if (focusOnMessageTargetControl === false) {
                  _defaultFocus(oMessage, oTargetMdcTable);
                }
              } else {
                this.focusOnMessageTargetControl(oView, oMessage);
              }
            } catch (err) {
              Log.error("Fail to navigate to Error control");
            }
          }
        } else {
          oControl = Core.byId(oMessage.controlIds[0]);
          //If the control underlying the frontEnd message is not within the current section, we first go into the target section:
          const oSelectedSection = Core.byId(this.oObjectPageLayout.getSelectedSection());
          if ((oSelectedSection === null || oSelectedSection === void 0 ? void 0 : oSelectedSection.findElements(true).indexOf(oControl)) === -1) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
          }
          this.setFocusToControl(oControl);
        }
      } else {
        // focus on control
        sSectionTitle = oItem.getGroupName().split(", ")[0];
        this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
        this.focusOnMessageTargetControl(oView, oMessage);
      }
    }

    /**
     * Retrieves a table cell targeted by a message.
     *
     * @param {object} targetRow A table row
     * @param {object} message Message targeting a cell
     * @returns {object} Returns the cell
     * @private
     */;
    _proto.getTargetCell = function getTargetCell(targetRow, message) {
      return message.getControlIds().length > 0 ? message.getControlIds().map(function (controlId) {
        const isControlInTable = targetRow.findElements(true, function (elem) {
          return elem.getId() === controlId;
        });
        return isControlInTable.length > 0 ? Core.byId(controlId) : null;
      }).reduce(function (acc, val) {
        return val ? val : acc;
      }) : null;
    }

    /**
     * Focus on the control targeted by a message.
     *
     * @param {object} view The current view
     * @param {object} message The message targeting the control on which we want to set the focus
     * @param {object} targetMdcTable The table targeted by the message (optional)
     * @param {number} rowIndex The row index of the table targeted by the message (optional)
     * @returns {Promise} Promise
     * @private
     */;
    _proto.focusOnMessageTargetControl = async function focusOnMessageTargetControl(view, message, targetMdcTable, rowIndex) {
      const aAllViewElements = view.findElements(true);
      const aErroneousControls = message.getControlIds().filter(function (sControlId) {
        return aAllViewElements.some(function (oElem) {
          return oElem.getId() === sControlId && oElem.getDomRef();
        });
      }).map(function (sControlId) {
        return Core.byId(sControlId);
      });
      const aNotTableErroneousControls = aErroneousControls.filter(function (oElem) {
        return !oElem.isA("sap.m.Table") && !oElem.isA("sap.ui.table.Table");
      });
      //The focus is set on Not Table control in priority
      if (aNotTableErroneousControls.length > 0) {
        this.setFocusToControl(aNotTableErroneousControls[0]);
        return undefined;
      } else if (aErroneousControls.length > 0) {
        const aTargetMdcTableRow = targetMdcTable ? targetMdcTable.findElements(true, function (oElem) {
          return oElem.isA(ColumnListItem.getMetadata().getName());
        }) : [];
        if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
          const oTargetRow = aTargetMdcTableRow[rowIndex];
          const oTargetCell = this.getTargetCell(oTargetRow, message);
          if (oTargetCell) {
            const oTargetField = oTargetCell.isA("sap.fe.macros.field.FieldAPI") ? oTargetCell.getContent().getContentEdit()[0] : oTargetCell.getItems()[0].getContent().getContentEdit()[0];
            this.setFocusToControl(oTargetField);
            return undefined;
          } else {
            const errorProperty = message.getTarget().split("/").pop();
            if (errorProperty) {
              view.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
            }
            if (this._navigationConfigured(targetMdcTable)) {
              return view.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
            } else {
              return false;
            }
          }
        }
        return undefined;
      }
      return undefined;
    }

    /**
     *
     * @param obj The message object
     * @param aSections The array of sections in the object page
     * @returns The rank of the message
     */;
    _proto._getMessageRank = function _getMessageRank(obj, aSections) {
      if (aSections) {
        let section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
        for (j = aSections.length - 1; j >= 0; --j) {
          // Loop over all sections
          section = aSections[j];
          aSubSections = section.getSubSections();
          for (k = aSubSections.length - 1; k >= 0; --k) {
            // Loop over all sub-sections
            subSection = aSubSections[k];
            aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
            //Try to find the control 1 inside the sub section
            aElements = aAllElements.filter(this._fnFilterUponId.bind(this, obj.getControlId()));
            sectionRank = j + 1;
            if (aElements.length > 0) {
              if (section.getVisible() && subSection.getVisible()) {
                if (!obj.hasOwnProperty("sectionName")) {
                  obj.sectionName = section.getTitle();
                }
                if (!obj.hasOwnProperty("subSectionName")) {
                  obj.subSectionName = subSection.getTitle();
                }
                return sectionRank * 10 + (k + 1);
              } else {
                // if section or subsection is invisible then group name would be Last Action
                // so ranking should be lower
                return 1;
              }
            }
          }
        }
        //if sub section title is Other messages, we return a high number(rank), which ensures
        //that messages belonging to this sub section always come later in messagePopover
        if (!obj.sectionName && !obj.subSectionName && obj.persistent) {
          return 1;
        }
        return 999;
      }
      return 999;
    }

    /**
     * Method to set the filters based upon the message items
     * The desired filter operation is:
     * ( filters provided by user && ( validation = true && Control should be present in view ) || messages for the current matching context ).
     *
     * @private
     */;
    _proto._applyFiltersAndSort = function _applyFiltersAndSort() {
      let oValidationFilters,
        oValidationAndContextFilter,
        oFilters,
        sPath,
        oSorter,
        oDialogFilter,
        objectPageLayoutSections = null;
      const aUserDefinedFilter = [];
      const filterOutMessagesInDialog = () => {
        const fnTest = aControlIds => {
          let index = Infinity,
            oControl = Core.byId(aControlIds[0]);
          const errorFieldControl = Core.byId(aControlIds[0]);
          while (oControl) {
            const fieldRankinDialog = oControl instanceof Dialog ? (errorFieldControl === null || errorFieldControl === void 0 ? void 0 : errorFieldControl.getParent()).findElements(true).indexOf(errorFieldControl) : Infinity;
            if (oControl instanceof Dialog) {
              if (index > fieldRankinDialog) {
                index = fieldRankinDialog;
                // Set the focus to the dialog's control
                this.setFocusToControl(errorFieldControl);
              }
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return true;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      };
      //Filter function to verify if the control is part of the current view or not
      function getCheckControlInViewFilter() {
        const fnTest = function (aControlIds) {
          if (!aControlIds.length) {
            return false;
          }
          let oControl = Core.byId(aControlIds[0]);
          while (oControl) {
            if (oControl.getId() === sViewId) {
              return true;
            }
            if (oControl instanceof Dialog) {
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return false;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      }
      if (!this.sViewId) {
        this.sViewId = this._getViewId(this.getId());
      }
      const sViewId = this.sViewId;
      //Add the filters provided by the user
      const aCustomFilters = this.getAggregation("customFilters");
      if (aCustomFilters) {
        aCustomFilters.forEach(function (filter) {
          aUserDefinedFilter.push(new Filter({
            path: filter.getProperty("path"),
            operator: filter.getProperty("operator"),
            value1: filter.getProperty("value1"),
            value2: filter.getProperty("value2")
          }));
        });
      }
      const oBindingContext = this.getBindingContext();
      if (!oBindingContext) {
        this.setVisible(false);
        return;
      } else {
        sPath = oBindingContext.getPath();
        //Filter for filtering out only validation messages which are currently present in the view
        oValidationFilters = new Filter({
          filters: [new Filter({
            path: "validation",
            operator: FilterOperator.EQ,
            value1: true
          }), getCheckControlInViewFilter()],
          and: true
        });
        //Filter for filtering out the bound messages i.e target starts with the context path
        oValidationAndContextFilter = new Filter({
          filters: [oValidationFilters, new Filter({
            path: "target",
            operator: FilterOperator.StartsWith,
            value1: sPath
          })],
          and: false
        });
        oDialogFilter = new Filter({
          filters: [filterOutMessagesInDialog()]
        });
      }
      const oValidationContextDialogFilters = new Filter({
        filters: [oValidationAndContextFilter, oDialogFilter],
        and: true
      });
      // and finally - if there any - add custom filter (via OR)
      if (aUserDefinedFilter.length > 0) {
        oFilters = new Filter({
          filters: [aUserDefinedFilter, oValidationContextDialogFilters],
          and: false
        });
      } else {
        oFilters = oValidationContextDialogFilters;
      }
      this.oItemBinding.filter(oFilters);
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      // We support sorting only for ObjectPageLayout use-case.
      if (this.oObjectPageLayout) {
        oSorter = new Sorter("", null, null, (obj1, obj2) => {
          if (!objectPageLayoutSections) {
            objectPageLayoutSections = this.oObjectPageLayout && this.oObjectPageLayout.getSections();
          }
          const rankA = this._getMessageRank(obj1, objectPageLayoutSections);
          const rankB = this._getMessageRank(obj2, objectPageLayoutSections);
          if (rankA < rankB) {
            return -1;
          }
          if (rankA > rankB) {
            return 1;
          }
          return 0;
        });
        this.oItemBinding.sort(oSorter);
      }
    }

    /**
     *
     * @param sControlId
     * @param oItem
     * @returns True if the control ID matches the item ID
     */;
    _proto._fnFilterUponId = function _fnFilterUponId(sControlId, oItem) {
      return sControlId === oItem.getId();
    }

    /**
     * Retrieves the section based on section title and visibility.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @returns The section
     * @private
     */;
    _proto._getSectionBySectionTitle = function _getSectionBySectionTitle(oObjectPage, sSectionTitle) {
      let oSection;
      if (sSectionTitle) {
        const aSections = oObjectPage.getSections();
        for (let i = 0; i < aSections.length; i++) {
          if (aSections[i].getVisible() && aSections[i].getTitle() === sSectionTitle) {
            oSection = aSections[i];
            break;
          }
        }
      }
      return oSection;
    }

    /**
     * Navigates to the section if the object page uses an IconTabBar and if the current section is not the target of the navigation.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @private
     */;
    _proto._navigateFromMessageToSectionInIconTabBarMode = function _navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle) {
      const bUseIconTabBar = oObjectPage.getUseIconTabBar();
      if (bUseIconTabBar) {
        const oSection = this._getSectionBySectionTitle(oObjectPage, sSectionTitle);
        const sSelectedSectionId = oObjectPage.getSelectedSection();
        if (oSection && sSelectedSectionId !== oSection.getId()) {
          oObjectPage.setSelectedSection(oSection.getId());
        }
      }
    };
    _proto._navigateFromMessageToSectionTableInIconTabBarMode = async function _navigateFromMessageToSectionTableInIconTabBarMode(oTable, oObjectPage, sSectionTitle) {
      const oRowBinding = oTable.getRowBinding();
      const oTableContext = oTable.getBindingContext();
      const oOPContext = oObjectPage.getBindingContext();
      const bShouldWaitForTableRefresh = !(oTableContext === oOPContext);
      this._navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle);
      return new Promise(function (resolve) {
        if (bShouldWaitForTableRefresh) {
          oRowBinding.attachEventOnce("change", function () {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    /**
     * Retrieves the MdcTable if it is found among any of the parent elements.
     *
     * @param oElement Control
     * @returns MDC table || undefined
     * @private
     */;
    _proto._getMdcTable = function _getMdcTable(oElement) {
      //check if the element has a table within any of its parents
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.mdc.Table")) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && oParentElement.isA("sap.ui.mdc.Table") ? oParentElement : undefined;
    };
    _proto._getGridTable = function _getGridTable(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Table") && /** We check the element belongs to the MdcTable :*/
        oElem.getParent() === oMdcTable;
      })[0];
    }

    /**
     * Retrieves the table row (if available) containing the element.
     *
     * @param oElement Control
     * @returns Table row || undefined
     * @private
     */;
    _proto._getTableRow = function _getTableRow(oElement) {
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.table.Row") && !oParentElement.isA("sap.ui.table.CreationRow") && !oParentElement.isA(ColumnListItem.getMetadata().getName())) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && (oParentElement.isA("sap.ui.table.Row") || oParentElement.isA("sap.ui.table.CreationRow") || oParentElement.isA(ColumnListItem.getMetadata().getName())) ? oParentElement : undefined;
    }

    /**
     * Retrieves the index of the table row containing the element.
     *
     * @param oElement Control
     * @returns Row index || undefined
     * @private
     */;
    _proto._getTableRowIndex = function _getTableRowIndex(oElement) {
      const oTableRow = this._getTableRow(oElement);
      let iRowIndex;
      if (oTableRow.isA("sap.ui.table.Row")) {
        iRowIndex = oTableRow.getIndex();
      } else {
        iRowIndex = oTableRow.getTable().getItems().findIndex(function (element) {
          return element.getId() === oTableRow.getId();
        });
      }
      return iRowIndex;
    }

    /**
     * Retrieves the index of the table column containing the element.
     *
     * @param oElement Control
     * @returns Column index || undefined
     * @private
     */;
    _proto._getTableColumnIndex = function _getTableColumnIndex(oElement) {
      const getTargetCellIndex = function (element, oTargetRow) {
        return oTargetRow.getCells().findIndex(function (oCell) {
          return oCell.getId() === element.getId();
        });
      };
      const getTargetColumnIndex = function (element, oTargetRow) {
        let oTargetElement = element.getParent(),
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        while (oTargetElement && iTargetCellIndex < 0) {
          oTargetElement = oTargetElement.getParent();
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        }
        return iTargetCellIndex;
      };
      const oTargetRow = this._getTableRow(oElement);
      let iTargetColumnIndex;
      iTargetColumnIndex = getTargetColumnIndex(oElement, oTargetRow);
      if (oTargetRow.isA("sap.ui.table.CreationRow")) {
        const sTargetCellId = oTargetRow.getCells()[iTargetColumnIndex].getId(),
          aTableColumns = oTargetRow.getTable().getColumns();
        iTargetColumnIndex = aTableColumns.findIndex(function (column) {
          if (column.getCreationTemplate()) {
            return sTargetCellId.search(column.getCreationTemplate().getId()) > -1 ? true : false;
          } else {
            return false;
          }
        });
      }
      return iTargetColumnIndex;
    };
    _proto._getMdcTableRows = function _getMdcTableRows(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Row") && /** We check the element belongs to the Mdc Table :*/
        oElem.getTable().getParent() === oMdcTable;
      });
    };
    _proto._getObjectPageLayout = function _getObjectPageLayout(oElement, oObjectPageLayout) {
      if (oObjectPageLayout) {
        return oObjectPageLayout;
      }
      oObjectPageLayout = oElement;
      //Iterate over parent till you have not reached the object page layout
      while (oObjectPageLayout && !oObjectPageLayout.isA("sap.uxap.ObjectPageLayout")) {
        oObjectPageLayout = oObjectPageLayout.getParent();
      }
      return oObjectPageLayout;
    }

    /**
     * The method that is called to check if a navigation is configured from the table to a sub object page.
     *
     * @private
     * @param table MdcTable
     * @returns Either true or false
     */;
    _proto._navigationConfigured = function _navigationConfigured(table) {
      // TODO: this logic would be moved to check the same at the template time to avoid the same check happening multiple times.
      const component = sap.ui.require("sap/ui/core/Component"),
        navObject = table && component.getOwnerComponentFor(table) && component.getOwnerComponentFor(table).getNavigation();
      let subOPConfigured = false,
        navConfigured = false;
      if (navObject && Object.keys(navObject).indexOf(table.getRowBinding().sPath) !== -1) {
        subOPConfigured = navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath] && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail.route ? true : false;
      }
      navConfigured = subOPConfigured && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()) && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()[0].mProperties.type.indexOf("Navigation")) !== -1;
      return navConfigured;
    };
    _proto.setFocusToControl = function setFocusToControl(control) {
      const messagePopover = this.oMessagePopover;
      if (messagePopover && control && control.focus) {
        const fnFocus = () => {
          control.focus();
        };
        if (!messagePopover.isOpen()) {
          // when navigating to parent page to child page (on click of message), the child page might have a focus logic that might use a timeout.
          // we use the below timeouts to override this focus so that we focus on the target control of the message in the child page.
          setTimeout(fnFocus, 0);
        } else {
          const fnOnClose = () => {
            setTimeout(fnFocus, 0);
            messagePopover.detachEvent("afterClose", fnOnClose);
          };
          messagePopover.attachEvent("afterClose", fnOnClose);
          messagePopover.close();
        }
      } else {
        Log.warning("FE V4 : MessageButton : element doesn't have focus method for focusing.");
      }
    };
    return MessageButton;
  }(Button), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customFilters", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "messageChange", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MessageButton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlQnV0dG9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImV2ZW50IiwiaWQiLCJzZXR0aW5ncyIsInNHZW5lcmFsR3JvdXBUZXh0Iiwic1ZpZXdJZCIsInNMYXN0QWN0aW9uVGV4dCIsImluaXQiLCJCdXR0b24iLCJwcm90b3R5cGUiLCJhcHBseSIsImF0dGFjaFByZXNzIiwiaGFuZGxlTWVzc2FnZVBvcG92ZXJQcmVzcyIsIm9NZXNzYWdlUG9wb3ZlciIsIk1lc3NhZ2VQb3BvdmVyIiwib0l0ZW1CaW5kaW5nIiwiZ2V0QmluZGluZyIsImF0dGFjaENoYW5nZSIsIl9zZXRNZXNzYWdlRGF0YSIsIm1lc3NhZ2VCdXR0b25JZCIsImdldElkIiwiYWRkQ3VzdG9tRGF0YSIsInNhcCIsInVpIiwiY29yZSIsIkN1c3RvbURhdGEiLCJrZXkiLCJ2YWx1ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsIl9hcHBseUZpbHRlcnNBbmRTb3J0IiwiYmluZCIsImF0dGFjaEFjdGl2ZVRpdGxlUHJlc3MiLCJfYWN0aXZlVGl0bGVQcmVzcyIsIm9FdmVudCIsInRvZ2dsZSIsImdldFNvdXJjZSIsIl9hcHBseUdyb3VwaW5nQXN5bmMiLCJvVmlldyIsImFXYWl0Rm9yRGF0YSIsIm9WaWV3QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIl9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMiLCJ2aWV3Iiwib1JlcyIsImFNZXNzYWdlcyIsImdldENvbnRleHRzIiwibWFwIiwib0NvbnRleHQiLCJnZXRPYmplY3QiLCJvVmlld0NvbnRleHQiLCJvT2JqZWN0UGFnZSIsImdldENvbnRlbnQiLCJtZXNzYWdlSGFuZGxpbmciLCJnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCIsImZvckVhY2giLCJvU2VjdGlvbiIsImdldFN1YlNlY3Rpb25zIiwib1N1YlNlY3Rpb24iLCJmaW5kRWxlbWVudHMiLCJvRWxlbSIsImlzQSIsImkiLCJsZW5ndGgiLCJvUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJzRWxlbWVCaW5kaW5nUGF0aCIsImdldFBhdGgiLCJ0YXJnZXQiLCJpbmRleE9mIiwicHVzaCIsInRhYmxlIiwic3Vic2VjdGlvbiIsIm9UYWJsZXMiLCJfb1RhYmxlIiwib01EQ1RhYmxlIiwib1N1YnNlY3Rpb24iLCJzZXRCaW5kaW5nQ29udGV4dCIsImlzTGVuZ3RoRmluYWwiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaEV2ZW50T25jZSIsIndhaXRGb3JHcm91cGluZ0FwcGxpZWQiLCJzZXRUaW1lb3V0IiwiX2FwcGx5R3JvdXBpbmciLCJhbGwiLCJnZXRNb2RlbCIsImNoZWNrTWVzc2FnZXMiLCJlcnIiLCJMb2ciLCJlcnJvciIsIm9PYmplY3RQYWdlTGF5b3V0IiwiX2dldE9iamVjdFBhZ2VMYXlvdXQiLCJnZXRJdGVtcyIsIl9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMiLCJfZ2V0VGFibGVSZWZFcnJvckNvbnRleHQiLCJvVGFibGUiLCJvTW9kZWwiLCJnZXRQcm9wZXJ0eSIsInNldFByb3BlcnR5Iiwic1JlZkVycm9yQ29udGV4dFBhdGgiLCJyZXBsYWNlIiwiZ2V0Q29udGV4dCIsIl91cGRhdGVJbnRlcm5hbE1vZGVsIiwib1RhYmxlUm93Q29udGV4dCIsImlSb3dJbmRleCIsInNUYWJsZVRhcmdldENvbFByb3BlcnR5Iiwib01lc3NhZ2VPYmplY3QiLCJiSXNDcmVhdGlvblJvdyIsIm9UZW1wIiwicm93SW5kZXgiLCJ0YXJnZXRDb2xQcm9wZXJ0eSIsImFWYWxpZE1lc3NhZ2VJZHMiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwibWVzc2FnZSIsImFPYnNvbGV0ZU1lc3NhZ2VsSWRzIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImludGVybmFsTWVzc2FnZUlkIiwib2Jzb2xldGVJZCIsImFzc2lnbiIsIl9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnIiwic0FjdGlvbk5hbWUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsInNldEdyb3VwTmFtZSIsIl9jb21wdXRlTWVzc2FnZUdyb3VwQW5kU3ViVGl0bGUiLCJzZWN0aW9uIiwic3ViU2VjdGlvbiIsImFFbGVtZW50cyIsImJNdWx0aXBsZVN1YlNlY3Rpb25zIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJkZXRhY2hDaGFuZ2UiLCJzZXRTZWN0aW9uTmFtZUluR3JvdXAiLCJvRWxlbWVudCIsIm9UYXJnZXRUYWJsZUluZm8iLCJsIiwib1RhcmdldGVkQ29udHJvbCIsImJJc0JhY2tlbmRNZXNzYWdlIiwiUmVnRXhwIiwidGVzdCIsImdldFRhcmdldHMiLCJnZXRQYXJlbnQiLCJmbkNhbGxiYWNrU2V0R3JvdXBOYW1lIiwib01lc3NhZ2VPYmoiLCJhY3Rpb25OYW1lIiwib2JqIiwiZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZSIsInN1YlRpdGxlIiwic2V0U3VidGl0bGUiLCJzZXRBY3RpdmVUaXRsZSIsIl9mb3JtYXRNZXNzYWdlRGVzY3JpcHRpb24iLCJzVGFibGVUYXJnZXRDb2xOYW1lIiwiZ2V0SW5kZXgiLCJiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4iLCJiSXNPcnBoYW5FbGVtZW50IiwiX2dldE1kY1RhYmxlIiwidGFibGVIZWFkZXIiLCJnZXRIZWFkZXIiLCJpVGFyZ2V0Q29sdW1uSW5kZXgiLCJfZ2V0VGFibGVDb2x1bW5JbmRleCIsImdldENvbHVtbnMiLCJnZXREYXRhUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJfZ2V0VGFibGVSb3ciLCJfZ2V0VGFibGVSb3dJbmRleCIsIm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsInNNZXNzYWdlU3VidGl0bGUiLCJnZXRNZXNzYWdlU3VidGl0bGUiLCJnZXRWYWx1ZVN0YXRlIiwic2VjdGlvbkJhc2VkR3JvdXBOYW1lIiwiY3JlYXRlU2VjdGlvbkdyb3VwTmFtZSIsIl9nZXRWaWV3SWQiLCJieUlkIiwib01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSIsInNwbGl0IiwicG9wIiwib1VJTW9kZWwiLCJmaXJlQWN0aXZlVGl0bGVQcmVzcyIsIml0ZW0iLCJhU3ViU2VjdGlvbnMiLCJqIiwiayIsImFWaXNpYmxlU2VjdGlvbnMiLCJ2aWV3SWQiLCJiSXNHZW5lcmFsR3JvdXBOYW1lIiwiYUNvbnRyb2xzIiwiZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24iLCJwZXJzaXN0ZW50IiwiX2ZpbmRUYXJnZXRGb3JNZXNzYWdlIiwibWVzc2FnZU9iamVjdCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJjb250ZXh0UGF0aCIsImdldE1ldGFQYXRoIiwib0NvbnRleHRQYXRoTWV0YWRhdGEiLCIka2luZCIsIl9mbkVuYWJsZUJpbmRpbmdzIiwiYVNlY3Rpb25zIiwiVXJpUGFyYW1ldGVycyIsImZyb21RdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiZ2V0IiwiaVNlY3Rpb24iLCJub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kIiwiaVN1YlNlY3Rpb24iLCJvQWxsQmxvY2tzIiwiZ2V0QmxvY2tzIiwiYmxvY2siLCJfZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwic0NvbnRyb2xJZCIsIm9Db250cm9sIiwiVmlldyIsIl9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uIiwic01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQiLCJvRGlhZ25vc2lzVGl0bGUiLCJzZXRBc3luY0Rlc2NyaXB0aW9uSGFuZGxlciIsImNvbmZpZyIsInNPbGREZXNjcmlwdGlvbiIsInNMb25nVGV4dFVybCIsImdldExvbmd0ZXh0VXJsIiwialF1ZXJ5IiwiYWpheCIsInVybCIsInN1Y2Nlc3MiLCJkYXRhIiwic0RpYWdub3Npc1RleHQiLCJnZXRIdG1sVGV4dCIsInNldERlc2NyaXB0aW9uIiwicHJvbWlzZSIsInNFcnJvciIsInJlamVjdCIsInNUYWJsZUZpcnN0Q29sUHJvcGVydHkiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwic0NvbHVtbkluZm8iLCJvTXNnT2JqIiwib0NvbEZyb21UYWJsZVNldHRpbmdzIiwiZmV0Y2hDb2x1bW5JbmZvIiwiYXZhaWxhYmlsaXR5IiwiZ2V0VHlwZSIsImdldFZhbHVlIiwiX25hdmlnYXRpb25Db25maWd1cmVkIiwibGFiZWwiLCJvRmllbGRzQWZmZWN0ZWRUaXRsZSIsIkZvcm1hdHRlZFRleHQiLCJodG1sVGV4dCIsInNGaWVsZEFmZmVjdGVkVGV4dCIsInNVSU1lc3NhZ2VEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uIiwiY2xlYXJUaW1lb3V0IiwiX3NldE1lc3NhZ2VEYXRhVGltZW91dCIsInNJY29uIiwib01lc3NhZ2VzIiwib01lc3NhZ2VDb3VudCIsIkVycm9yIiwiV2FybmluZyIsIlN1Y2Nlc3MiLCJJbmZvcm1hdGlvbiIsIm9SZXNvdXJjZUJ1bmRsZSIsImlNZXNzYWdlTGVuZ3RoIiwic0J1dHRvblR5cGUiLCJCdXR0b25UeXBlIiwiRGVmYXVsdCIsInNNZXNzYWdlS2V5Iiwic1Rvb2x0aXBUZXh0Iiwic01lc3NhZ2VUZXh0IiwiTWVzc2FnZVR5cGUiLCJOZWdhdGl2ZSIsIkNyaXRpY2FsIiwiTmV1dHJhbCIsInRvdGFsTnVtYmVyT2ZNZXNzYWdlcyIsInNldFRleHQiLCJ0b1N0cmluZyIsInNldFRvb2x0aXAiLCJzZXRJY29uIiwic2V0VHlwZSIsInNldFZpc2libGUiLCJvUGFnZVJlYWR5IiwiZ2V0Q29udHJvbGxlciIsInBhZ2VSZWFkeSIsIndhaXRQYWdlUmVhZHkiLCJmaXJlTWVzc2FnZUNoYW5nZSIsIm5hdmlnYXRlQmFjayIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9JdGVtIiwiZ2V0UGFyYW1ldGVyIiwib01lc3NhZ2UiLCJnZXRUYXJnZXQiLCJzU2VjdGlvblRpdGxlIiwiX2RlZmF1bHRGb2N1cyIsIm1kY1RhYmxlIiwiZm9jdXNJbmZvIiwicHJldmVudFNjcm9sbCIsInRhcmdldEluZm8iLCJmb2N1cyIsImdldEdyb3VwTmFtZSIsIm9UYXJnZXRNZGNUYWJsZSIsImNvbnRyb2xJZHMiLCJjb250cm9sIiwib1BhcmVudENvbnRyb2wiLCJyZWR1Y2UiLCJhY2MiLCJ2YWwiLCJfbmF2aWdhdGVGcm9tTWVzc2FnZVRvU2VjdGlvblRhYmxlSW5JY29uVGFiQmFyTW9kZSIsIm9SZWZFcnJvckNvbnRleHQiLCJvUmVmRXJyb3IiLCJfc2V0Rm9jdXNPblRhcmdldEZpZWxkIiwidGFyZ2V0TWRjVGFibGUiLCJhVGFyZ2V0TWRjVGFibGVSb3ciLCJfZ2V0TWRjVGFibGVSb3dzIiwiaUZpcnN0VmlzaWJsZVJvdyIsIl9nZXRHcmlkVGFibGUiLCJnZXRGaXJzdFZpc2libGVSb3ciLCJvVGFyZ2V0Um93Iiwib1RhcmdldENlbGwiLCJnZXRUYXJnZXRDZWxsIiwic2V0Rm9jdXNUb0NvbnRyb2wiLCJlcnJvclByb3BlcnR5IiwiX3JvdXRpbmciLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJzY3JvbGxUb0luZGV4IiwiaU5ld0ZpcnN0VmlzaWJsZVJvdyIsImJTY3JvbGxOZWVkZWQiLCJvV2FpdENvbnRyb2xJZEFkZGVkIiwiYXR0YWNoRXZlbnQiLCJmb2N1c09uVGFyZ2V0RmllbGQiLCJmb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wiLCJvU2VsZWN0ZWRTZWN0aW9uIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlIiwidGFyZ2V0Um93IiwiZ2V0Q29udHJvbElkcyIsImNvbnRyb2xJZCIsImlzQ29udHJvbEluVGFibGUiLCJlbGVtIiwiYUFsbFZpZXdFbGVtZW50cyIsImFFcnJvbmVvdXNDb250cm9scyIsInNvbWUiLCJnZXREb21SZWYiLCJhTm90VGFibGVFcnJvbmVvdXNDb250cm9scyIsIkNvbHVtbkxpc3RJdGVtIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1RhcmdldEZpZWxkIiwiZ2V0Q29udGVudEVkaXQiLCJfZ2V0TWVzc2FnZVJhbmsiLCJhQWxsRWxlbWVudHMiLCJzZWN0aW9uUmFuayIsIl9mbkZpbHRlclVwb25JZCIsImdldENvbnRyb2xJZCIsImdldFZpc2libGUiLCJoYXNPd25Qcm9wZXJ0eSIsInNlY3Rpb25OYW1lIiwiZ2V0VGl0bGUiLCJzdWJTZWN0aW9uTmFtZSIsIm9WYWxpZGF0aW9uRmlsdGVycyIsIm9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciIsIm9GaWx0ZXJzIiwic1BhdGgiLCJvU29ydGVyIiwib0RpYWxvZ0ZpbHRlciIsIm9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyIsImFVc2VyRGVmaW5lZEZpbHRlciIsImZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2ciLCJmblRlc3QiLCJhQ29udHJvbElkcyIsImluZGV4IiwiSW5maW5pdHkiLCJlcnJvckZpZWxkQ29udHJvbCIsImZpZWxkUmFua2luRGlhbG9nIiwiRGlhbG9nIiwiRmlsdGVyIiwicGF0aCIsImNhc2VTZW5zaXRpdmUiLCJnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIiLCJhQ3VzdG9tRmlsdGVycyIsImdldEFnZ3JlZ2F0aW9uIiwib3BlcmF0b3IiLCJ2YWx1ZTEiLCJ2YWx1ZTIiLCJvQmluZGluZ0NvbnRleHQiLCJmaWx0ZXJzIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsImFuZCIsIlN0YXJ0c1dpdGgiLCJvVmFsaWRhdGlvbkNvbnRleHREaWFsb2dGaWx0ZXJzIiwiU29ydGVyIiwib2JqMSIsIm9iajIiLCJnZXRTZWN0aW9ucyIsInJhbmtBIiwicmFua0IiLCJzb3J0IiwiX2dldFNlY3Rpb25CeVNlY3Rpb25UaXRsZSIsImJVc2VJY29uVGFiQmFyIiwiZ2V0VXNlSWNvblRhYkJhciIsInNTZWxlY3RlZFNlY3Rpb25JZCIsInNldFNlbGVjdGVkU2VjdGlvbiIsIm9UYWJsZUNvbnRleHQiLCJvT1BDb250ZXh0IiwiYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2giLCJvUGFyZW50RWxlbWVudCIsIm9NZGNUYWJsZSIsIm9UYWJsZVJvdyIsImdldFRhYmxlIiwiZmluZEluZGV4IiwiZWxlbWVudCIsImdldFRhcmdldENlbGxJbmRleCIsImdldENlbGxzIiwib0NlbGwiLCJnZXRUYXJnZXRDb2x1bW5JbmRleCIsIm9UYXJnZXRFbGVtZW50IiwiaVRhcmdldENlbGxJbmRleCIsInNUYXJnZXRDZWxsSWQiLCJhVGFibGVDb2x1bW5zIiwiY29sdW1uIiwiZ2V0Q3JlYXRpb25UZW1wbGF0ZSIsImNvbXBvbmVudCIsInJlcXVpcmUiLCJuYXZPYmplY3QiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldE5hdmlnYXRpb24iLCJzdWJPUENvbmZpZ3VyZWQiLCJuYXZDb25maWd1cmVkIiwiZGV0YWlsIiwicm91dGUiLCJnZXRSb3dTZXR0aW5ncyIsImdldFJvd0FjdGlvbnMiLCJtUHJvcGVydGllcyIsIm1lc3NhZ2VQb3BvdmVyIiwiZm5Gb2N1cyIsImlzT3BlbiIsImZuT25DbG9zZSIsImRldGFjaEV2ZW50IiwiY2xvc2UiLCJ3YXJuaW5nIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXNzYWdlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlRmlsdGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL21lc3NhZ2VzL01lc3NhZ2VGaWx0ZXJcIjtcbmltcG9ydCBNZXNzYWdlUG9wb3ZlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9tZXNzYWdlcy9NZXNzYWdlUG9wb3ZlclwiO1xuaW1wb3J0IHsgJEJ1dHRvblNldHRpbmdzLCBkZWZhdWx0IGFzIEJ1dHRvbiB9IGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBDb2x1bW5MaXN0SXRlbSBmcm9tIFwic2FwL20vQ29sdW1uTGlzdEl0ZW1cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IEZvcm1hdHRlZFRleHQgZnJvbSBcInNhcC9tL0Zvcm1hdHRlZFRleHRcIjtcbmltcG9ydCB7IEJ1dHRvblR5cGUgfSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2VJdGVtIGZyb20gXCJzYXAvbS9NZXNzYWdlSXRlbVwiO1xuaW1wb3J0IHR5cGUgQ29yZUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuaW1wb3J0IENvbHVtbiBmcm9tIFwic2FwL3VpL3RhYmxlL0NvbHVtblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU2VjdGlvblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTdWJTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU3ViU2VjdGlvblwiO1xuXG50eXBlIE1lc3NhZ2VDb3VudCA9IHtcblx0RXJyb3I6IG51bWJlcjtcblx0V2FybmluZzogbnVtYmVyO1xuXHRTdWNjZXNzOiBudW1iZXI7XG5cdEluZm9ybWF0aW9uOiBudW1iZXI7XG59O1xuXG50eXBlIENvbHVtbkRhdGFXaXRoQXZhaWxhYmlsaXR5VHlwZSA9IENvbHVtbiAmIHtcblx0YXZhaWxhYmlsaXR5Pzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcbn07XG5cbnR5cGUgJE1lc3NhZ2VCdXR0b25TZXR0aW5ncyA9ICRCdXR0b25TZXR0aW5ncyAmIHtcblx0bWVzc2FnZUNoYW5nZTogRnVuY3Rpb247XG59O1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLm1lc3NhZ2VzLk1lc3NhZ2VCdXR0b25cIilcbmNsYXNzIE1lc3NhZ2VCdXR0b24gZXh0ZW5kcyBCdXR0b24ge1xuXHRjb25zdHJ1Y3RvcihpZD86IHN0cmluZyB8ICRNZXNzYWdlQnV0dG9uU2V0dGluZ3MsIHNldHRpbmdzPzogJE1lc3NhZ2VCdXR0b25TZXR0aW5ncykge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIoaWQsIHNldHRpbmdzKTtcblx0fVxuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5tZXNzYWdlcy5NZXNzYWdlRmlsdGVyXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiY3VzdG9tRmlsdGVyXCIgfSlcblx0Y3VzdG9tRmlsdGVycyE6IE1lc3NhZ2VGaWx0ZXI7XG5cblx0QGV2ZW50KClcblx0bWVzc2FnZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgb01lc3NhZ2VQb3BvdmVyOiBhbnk7XG5cblx0cHJpdmF0ZSBvSXRlbUJpbmRpbmc6IGFueTtcblxuXHRwcml2YXRlIG9PYmplY3RQYWdlTGF5b3V0OiBhbnk7XG5cblx0cHJpdmF0ZSBzR2VuZXJhbEdyb3VwVGV4dCA9IFwiXCI7XG5cblx0cHJpdmF0ZSBfc2V0TWVzc2FnZURhdGFUaW1lb3V0OiBhbnk7XG5cblx0cHJpdmF0ZSBzVmlld0lkID0gXCJcIjtcblxuXHRwcml2YXRlIHNMYXN0QWN0aW9uVGV4dCA9IFwiXCI7XG5cblx0aW5pdCgpIHtcblx0XHRCdXR0b24ucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcyk7XG5cdFx0Ly9wcmVzcyBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIG9wZW4gdGhlIG1lc3NhZ2UgcG9wb3ZlclxuXHRcdHRoaXMuYXR0YWNoUHJlc3ModGhpcy5oYW5kbGVNZXNzYWdlUG9wb3ZlclByZXNzLCB0aGlzKTtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3ZlciA9IG5ldyBNZXNzYWdlUG9wb3ZlcigpO1xuXHRcdHRoaXMub0l0ZW1CaW5kaW5nID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0QmluZGluZyhcIml0ZW1zXCIpO1xuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmF0dGFjaENoYW5nZSh0aGlzLl9zZXRNZXNzYWdlRGF0YSwgdGhpcyk7XG5cdFx0Y29uc3QgbWVzc2FnZUJ1dHRvbklkID0gdGhpcy5nZXRJZCgpO1xuXHRcdGlmIChtZXNzYWdlQnV0dG9uSWQpIHtcblx0XHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyLmFkZEN1c3RvbURhdGEobmV3IChzYXAgYXMgYW55KS51aS5jb3JlLkN1c3RvbURhdGEoeyBrZXk6IFwibWVzc2FnZUJ1dHRvbklkXCIsIHZhbHVlOiBtZXNzYWdlQnV0dG9uSWQgfSkpOyAvLyBUT0RPIGNoZWNrIGZvciBjdXN0b20gZGF0YSB0eXBlXG5cdFx0fVxuXHRcdHRoaXMuYXR0YWNoTW9kZWxDb250ZXh0Q2hhbmdlKHRoaXMuX2FwcGx5RmlsdGVyc0FuZFNvcnQuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuYXR0YWNoQWN0aXZlVGl0bGVQcmVzcyh0aGlzLl9hY3RpdmVUaXRsZVByZXNzLmJpbmQodGhpcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgd2hlbiBhIHVzZXIgY2xpY2tzIG9uIHRoZSBNZXNzYWdlQnV0dG9uIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgRXZlbnQgb2JqZWN0XG5cdCAqL1xuXHRoYW5kbGVNZXNzYWdlUG9wb3ZlclByZXNzKG9FdmVudDogQ29yZUV2ZW50KSB7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIudG9nZ2xlKG9FdmVudC5nZXRTb3VyY2UoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGdyb3VwcyB0aGUgbWVzc2FnZXMgYmFzZWQgb24gdGhlIHNlY3Rpb24gb3Igc3Vic2VjdGlvbiB0aGV5IGJlbG9uZyB0by5cblx0ICogVGhpcyBtZXRob2QgZm9yY2UgdGhlIGxvYWRpbmcgb2YgY29udGV4dHMgZm9yIGFsbCB0YWJsZXMgYmVmb3JlIHRvIGFwcGx5IHRoZSBncm91cGluZy5cblx0ICpcblx0ICogQHBhcmFtIG9WaWV3IEN1cnJlbnQgdmlldy5cblx0ICogQHJldHVybnMgUmV0dXJuIHByb21pc2UuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRhc3luYyBfYXBwbHlHcm91cGluZ0FzeW5jKG9WaWV3OiBWaWV3KSB7XG5cdFx0Y29uc3QgYVdhaXRGb3JEYXRhOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcblx0XHRjb25zdCBvVmlld0JpbmRpbmdDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBfZmluZFRhYmxlc1JlbGF0ZWRUb01lc3NhZ2VzID0gKHZpZXc6IFZpZXcpID0+IHtcblx0XHRcdGNvbnN0IG9SZXM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBhTWVzc2FnZXMgPSB0aGlzLm9JdGVtQmluZGluZy5nZXRDb250ZXh0cygpLm1hcChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9WaWV3Q29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdGlmIChvVmlld0NvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb09iamVjdFBhZ2U6IENvbnRyb2wgPSB2aWV3LmdldENvbnRlbnQoKVswXTtcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLmdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KG9PYmplY3RQYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0b1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRvU3ViU2VjdGlvbi5maW5kRWxlbWVudHModHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VsZW0uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9FbGVtLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dC5nZXRQYXRoKCl9LyR7b0VsZW0uZ2V0Um93QmluZGluZygpLmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYU1lc3NhZ2VzW2ldLnRhcmdldC5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXMucHVzaCh7IHRhYmxlOiBvRWxlbSwgc3Vic2VjdGlvbjogb1N1YlNlY3Rpb24gfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvUmVzO1xuXHRcdH07XG5cdFx0Ly8gU2VhcmNoIGZvciB0YWJsZSByZWxhdGVkIHRvIE1lc3NhZ2VzIGFuZCBpbml0aWFsaXplIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhcmVudCBzdWJzZWN0aW9uIHRvIHJldHJpZXZlIHRoZSBkYXRhXG5cdFx0Y29uc3Qgb1RhYmxlcyA9IF9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMuYmluZCh0aGlzKShvVmlldyk7XG5cdFx0b1RhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChfb1RhYmxlKSB7XG5cdFx0XHRjb25zdCBvTURDVGFibGUgPSBfb1RhYmxlLnRhYmxlLFxuXHRcdFx0XHRvU3Vic2VjdGlvbiA9IF9vVGFibGUuc3Vic2VjdGlvbjtcblx0XHRcdGlmICghb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkgfHwgb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKSAhPT0gb1ZpZXdCaW5kaW5nQ29udGV4dD8uZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdG9TdWJzZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KG9WaWV3QmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHRpZiAoIW9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCkuaXNMZW5ndGhGaW5hbCgpKSB7XG5cdFx0XHRcdFx0YVdhaXRGb3JEYXRhLnB1c2goXG5cdFx0XHRcdFx0XHRuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0b01EQ1RhYmxlLmdldFJvd0JpbmRpbmcoKS5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCB3YWl0Rm9yR3JvdXBpbmdBcHBsaWVkID0gbmV3IFByb21pc2UoKHJlc29sdmU6IEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0dGhpcy5fYXBwbHlHcm91cGluZygpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVdhaXRGb3JEYXRhKTtcblx0XHRcdG9WaWV3LmdldE1vZGVsKCkuY2hlY2tNZXNzYWdlcygpO1xuXHRcdFx0YXdhaXQgd2FpdEZvckdyb3VwaW5nQXBwbGllZDtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdyb3VwaW5nIHRoZSBtZXNzYWdlcyBpbiB0aGUgbWVzc2FnZVBvcE92ZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBncm91cHMgdGhlIG1lc3NhZ2VzIGJhc2VkIG9uIHRoZSBzZWN0aW9uIG9yIHN1YnNlY3Rpb24gdGhleSBiZWxvbmcgdG8uXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfYXBwbHlHcm91cGluZygpIHtcblx0XHR0aGlzLm9PYmplY3RQYWdlTGF5b3V0ID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dCh0aGlzLCB0aGlzLm9PYmplY3RQYWdlTGF5b3V0KTtcblx0XHRpZiAoIXRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYU1lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKTtcblx0XHR0aGlzLl9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHJldHJpZXZlcyB0aGUgYmluZGluZyBjb250ZXh0IGZvciB0aGUgcmVmRXJyb3Igb2JqZWN0LlxuXHQgKiBUaGUgcmVmRXJyb3IgY29udGFpbnMgYSBtYXAgdG8gc3RvcmUgdGhlIGluZGV4ZXMgb2YgdGhlIHJvd3Mgd2l0aCBlcnJvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgVGhlIHRhYmxlIGZvciB3aGljaCB3ZSB3YW50IHRvIGdldCB0aGUgcmVmRXJyb3IgT2JqZWN0LlxuXHQgKiBAcmV0dXJucyBDb250ZXh0IG9mIHRoZSByZWZFcnJvci5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdC8vaW5pdGlhbGl6ZSB0aGUgcmVmRXJyb3IgcHJvcGVydHkgaWYgaXQgZG9lc24ndCBleGlzdFxuXHRcdGlmICghb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuZ2V0UHJvcGVydHkoXCJyZWZFcnJvclwiKSkge1xuXHRcdFx0b01vZGVsLnNldFByb3BlcnR5KFwicmVmRXJyb3JcIiwge30sIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1JlZkVycm9yQ29udGV4dFBhdGggPVxuXHRcdFx0b1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuZ2V0UGF0aCgpICtcblx0XHRcdFwiL3JlZkVycm9yL1wiICtcblx0XHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKS5yZXBsYWNlKFwiL1wiLCBcIiRcIikgK1xuXHRcdFx0XCIkXCIgK1xuXHRcdFx0b1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCkucmVwbGFjZShcIi9cIiwgXCIkXCIpO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb01vZGVsLmdldENvbnRleHQoc1JlZkVycm9yQ29udGV4dFBhdGgpO1xuXHRcdGlmICghb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJcIikpIHtcblx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShcIlwiLCB7fSwgb0NvbnRleHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gb0NvbnRleHQ7XG5cdH1cblxuXHRfdXBkYXRlSW50ZXJuYWxNb2RlbChcblx0XHRvVGFibGVSb3dDb250ZXh0OiBhbnksXG5cdFx0aVJvd0luZGV4OiBudW1iZXIsXG5cdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHN0cmluZyxcblx0XHRvVGFibGU6IGFueSxcblx0XHRvTWVzc2FnZU9iamVjdDogYW55LFxuXHRcdGJJc0NyZWF0aW9uUm93PzogYm9vbGVhblxuXHQpIHtcblx0XHRsZXQgb1RlbXA7XG5cdFx0aWYgKGJJc0NyZWF0aW9uUm93KSB7XG5cdFx0XHRvVGVtcCA9IHtcblx0XHRcdFx0cm93SW5kZXg6IFwiQ3JlYXRpb25Sb3dcIixcblx0XHRcdFx0dGFyZ2V0Q29sUHJvcGVydHk6IHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID8gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgOiBcIlwiXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvVGVtcCA9IHtcblx0XHRcdFx0cm93SW5kZXg6IG9UYWJsZVJvd0NvbnRleHQgPyBpUm93SW5kZXggOiBcIlwiLFxuXHRcdFx0XHR0YXJnZXRDb2xQcm9wZXJ0eTogc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPyBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA6IFwiXCJcblx0XHRcdH07XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpLFxuXHRcdFx0b0NvbnRleHQgPSB0aGlzLl9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFibGUpO1xuXHRcdC8vd2UgZmlyc3QgcmVtb3ZlIHRoZSBlbnRyaWVzIHdpdGggb2Jzb2xldGUgbWVzc2FnZSBpZHMgZnJvbSB0aGUgaW50ZXJuYWwgbW9kZWwgYmVmb3JlIGluc2VydGluZyB0aGUgbmV3IGVycm9yIGluZm8gOlxuXHRcdGNvbnN0IGFWYWxpZE1lc3NhZ2VJZHMgPSBzYXAudWlcblx0XHRcdC5nZXRDb3JlKClcblx0XHRcdC5nZXRNZXNzYWdlTWFuYWdlcigpXG5cdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdC5nZXREYXRhKClcblx0XHRcdC5tYXAoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5pZDtcblx0XHRcdH0pO1xuXHRcdGxldCBhT2Jzb2xldGVNZXNzYWdlbElkcztcblx0XHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoKSkge1xuXHRcdFx0YU9ic29sZXRlTWVzc2FnZWxJZHMgPSBPYmplY3Qua2V5cyhvQ29udGV4dC5nZXRQcm9wZXJ0eSgpKS5maWx0ZXIoZnVuY3Rpb24gKGludGVybmFsTWVzc2FnZUlkKSB7XG5cdFx0XHRcdHJldHVybiBhVmFsaWRNZXNzYWdlSWRzLmluZGV4T2YoaW50ZXJuYWxNZXNzYWdlSWQpID09PSAtMTtcblx0XHRcdH0pO1xuXHRcdFx0YU9ic29sZXRlTWVzc2FnZWxJZHMuZm9yRWFjaChmdW5jdGlvbiAob2Jzb2xldGVJZCkge1xuXHRcdFx0XHRkZWxldGUgb0NvbnRleHQuZ2V0UHJvcGVydHkoKVtvYnNvbGV0ZUlkXTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvTW9kZWwuc2V0UHJvcGVydHkoXG5cdFx0XHRvTWVzc2FnZU9iamVjdC5nZXRJZCgpLFxuXHRcdFx0T2JqZWN0LmFzc2lnbih7fSwgb0NvbnRleHQuZ2V0UHJvcGVydHkob01lc3NhZ2VPYmplY3QuZ2V0SWQoKSkgPyBvQ29udGV4dC5nZXRQcm9wZXJ0eShvTWVzc2FnZU9iamVjdC5nZXRJZCgpKSA6IHt9LCBvVGVtcCksXG5cdFx0XHRvQ29udGV4dFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IHNldHMgZ3JvdXBzIGZvciB0cmFuc2llbnQgbWVzc2FnZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXNzYWdlIFRoZSB0cmFuc2llbnQgbWVzc2FnZSBmb3Igd2hpY2ggd2Ugd2FudCB0byBjb21wdXRlIGFuZCBzZXQgZ3JvdXAuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzQWN0aW9uTmFtZSBUaGUgYWN0aW9uIG5hbWUuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0R3JvdXBMYWJlbEZvclRyYW5zaWVudE1zZyhtZXNzYWdlOiBhbnksIHNBY3Rpb25OYW1lOiBzdHJpbmcpIHtcblx0XHR0aGlzLnNMYXN0QWN0aW9uVGV4dCA9IHRoaXMuc0xhc3RBY3Rpb25UZXh0XG5cdFx0XHQ/IHRoaXMuc0xhc3RBY3Rpb25UZXh0XG5cdFx0XHQ6IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIlRfTUVTU0FHRV9CVVRUT05fU0FQRkVfTUVTU0FHRV9HUk9VUF9MQVNUX0FDVElPTlwiKTtcblxuXHRcdG1lc3NhZ2Uuc2V0R3JvdXBOYW1lKGAke3RoaXMuc0xhc3RBY3Rpb25UZXh0fTogJHtzQWN0aW9uTmFtZX1gKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgZ3JvdXBzIG1lc3NhZ2VzIGFuZCBhZGRzIHRoZSBzdWJ0aXRsZS5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2Ugd2UgdXNlIHRvIGNvbXB1dGUgdGhlIGdyb3VwIGFuZCBzdWJ0aXRsZS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNlY3Rpb24gVGhlIHNlY3Rpb24gY29udGFpbmluZyB0aGUgY29udHJvbHMuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBzdWJTZWN0aW9uIFRoZSBzdWJzZWN0aW9uIGNvbnRhaW5pbmcgdGhlIGNvbnRyb2xzLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gYUVsZW1lbnRzIExpc3Qgb2YgY29udHJvbHMgZnJvbSBhIHN1YnNlY3Rpb24gcmVsYXRlZCB0byBhIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYk11bHRpcGxlU3ViU2VjdGlvbnMgVHJ1ZSBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gMSBzdWJzZWN0aW9uIGluIHRoZSBzZWN0aW9uLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0FjdGlvbk5hbWUgVGhlIGFjdGlvbiBuYW1lLlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBSZXR1cm4gdGhlIGNvbnRyb2wgdGFyZ2V0ZWQgYnkgdGhlIG1lc3NhZ2UuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfY29tcHV0ZU1lc3NhZ2VHcm91cEFuZFN1YlRpdGxlKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2VJdGVtLFxuXHRcdHNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uLFxuXHRcdHN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uLFxuXHRcdGFFbGVtZW50czogYW55W10sXG5cdFx0Yk11bHRpcGxlU3ViU2VjdGlvbnM6IGJvb2xlYW4sXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gZ2V0UmVzb3VyY2VNb2RlbChzZWN0aW9uKTtcblx0XHR0aGlzLm9JdGVtQmluZGluZy5kZXRhY2hDaGFuZ2UodGhpcy5fc2V0TWVzc2FnZURhdGEsIHRoaXMpO1xuXHRcdGNvbnN0IG9NZXNzYWdlT2JqZWN0ID0gbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIik/LmdldE9iamVjdCgpIGFzIE1lc3NhZ2U7XG5cdFx0Y29uc3Qgc2V0U2VjdGlvbk5hbWVJbkdyb3VwID0gdHJ1ZTtcblx0XHRsZXQgb0VsZW1lbnQsIG9UYWJsZTogYW55LCBvVGFyZ2V0VGFibGVJbmZvOiBhbnksIGwsIGlSb3dJbmRleCwgb1RhcmdldGVkQ29udHJvbCwgYklzQ3JlYXRpb25Sb3c7XG5cdFx0Y29uc3QgYklzQmFja2VuZE1lc3NhZ2UgPSBuZXcgUmVnRXhwKFwiXi9cIikudGVzdChvTWVzc2FnZU9iamVjdD8uZ2V0VGFyZ2V0cygpWzBdKTtcblx0XHRpZiAoYklzQmFja2VuZE1lc3NhZ2UpIHtcblx0XHRcdGZvciAobCA9IDA7IGwgPCBhRWxlbWVudHMubGVuZ3RoOyBsKyspIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBhRWxlbWVudHNbbF07XG5cdFx0XHRcdG9UYXJnZXRlZENvbnRyb2wgPSBvRWxlbWVudDtcblx0XHRcdFx0aWYgKG9FbGVtZW50LmlzQShcInNhcC5tLlRhYmxlXCIpIHx8IG9FbGVtZW50LmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdG9UYWJsZSA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdFx0XHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0XHRjb25zdCBmbkNhbGxiYWNrU2V0R3JvdXBOYW1lID0gKG9NZXNzYWdlT2JqOiBhbnksIGFjdGlvbk5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0R3JvdXBMYWJlbEZvclRyYW5zaWVudE1zZyhtZXNzYWdlLCBhY3Rpb25OYW1lKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmIChvUm93QmluZGluZyAmJiBvUm93QmluZGluZy5pc0xlbmd0aEZpbmFsKCkgJiYgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9iaiA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlKFxuXHRcdFx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdCxcblx0XHRcdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRvRWxlbWVudCxcblx0XHRcdFx0XHRcdFx0b1Jvd0JpbmRpbmcsXG5cdFx0XHRcdFx0XHRcdHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRcdFx0XHRzZXRTZWN0aW9uTmFtZUluR3JvdXAsXG5cdFx0XHRcdFx0XHRcdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvID0gb2JqLm9UYXJnZXRUYWJsZUluZm87XG5cdFx0XHRcdFx0XHRpZiAob2JqLnN1YlRpdGxlKSB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0U3VidGl0bGUob2JqLnN1YlRpdGxlKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZSghIW9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCk7XG5cblx0XHRcdFx0XHRcdGlmIChvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5fZm9ybWF0TWVzc2FnZURlc2NyaXB0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRvVGFibGVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlSb3dJbmRleCA9IG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCAmJiBvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQuZ2V0SW5kZXgoKTtcblx0XHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUludGVybmFsTW9kZWwoXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0aVJvd0luZGV4LFxuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRvVGFibGUsXG5cdFx0XHRcdFx0XHRcdG9NZXNzYWdlT2JqZWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKHRydWUpO1xuXHRcdFx0XHRcdC8vY2hlY2sgaWYgdGhlIHRhcmdldGVkIGNvbnRyb2wgaXMgYSBjaGlsZCBvZiBvbmUgb2YgdGhlIG90aGVyIGNvbnRyb2xzXG5cdFx0XHRcdFx0Y29uc3QgYklzVGFyZ2V0ZWRDb250cm9sT3JwaGFuID0gbWVzc2FnZUhhbmRsaW5nLmJJc09ycGhhbkVsZW1lbnQob1RhcmdldGVkQ29udHJvbCwgYUVsZW1lbnRzKTtcblx0XHRcdFx0XHRpZiAoYklzVGFyZ2V0ZWRDb250cm9sT3JwaGFuKSB7XG5cdFx0XHRcdFx0XHQvL3NldCB0aGUgc3VidGl0bGVcblx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0U3VidGl0bGUoXCJcIik7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9UaGVyZSBpcyBvbmx5IG9uZSBlbHQgYXMgdGhpcyBpcyBhIGZyb250RW5kIG1lc3NhZ2Vcblx0XHRcdG9UYXJnZXRlZENvbnRyb2wgPSBhRWxlbWVudHNbMF07XG5cdFx0XHRvVGFibGUgPSB0aGlzLl9nZXRNZGNUYWJsZShvVGFyZ2V0ZWRDb250cm9sKTtcblx0XHRcdGlmIChvVGFibGUpIHtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyA9IHt9O1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyID0gb1RhYmxlLmdldEhlYWRlcigpO1xuXHRcdFx0XHRjb25zdCBpVGFyZ2V0Q29sdW1uSW5kZXggPSB0aGlzLl9nZXRUYWJsZUNvbHVtbkluZGV4KG9UYXJnZXRlZENvbnRyb2wpO1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ID1cblx0XHRcdFx0XHRpVGFyZ2V0Q29sdW1uSW5kZXggPiAtMSA/IG9UYWJsZS5nZXRDb2x1bW5zKClbaVRhcmdldENvbHVtbkluZGV4XS5nZXREYXRhUHJvcGVydHkoKSA6IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUgPVxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgJiYgaVRhcmdldENvbHVtbkluZGV4ID4gLTFcblx0XHRcdFx0XHRcdD8gb1RhYmxlLmdldENvbHVtbnMoKVtpVGFyZ2V0Q29sdW1uSW5kZXhdLmdldEhlYWRlcigpXG5cdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0YklzQ3JlYXRpb25Sb3cgPSB0aGlzLl9nZXRUYWJsZVJvdyhvVGFyZ2V0ZWRDb250cm9sKS5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIik7XG5cdFx0XHRcdGlmICghYklzQ3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0XHRpUm93SW5kZXggPSB0aGlzLl9nZXRUYWJsZVJvd0luZGV4KG9UYXJnZXRlZENvbnRyb2wpO1xuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRDdXJyZW50Q29udGV4dHMoKTtcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQgPSBvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0c1tpUm93SW5kZXhdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNNZXNzYWdlU3VidGl0bGUgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZVN1YnRpdGxlKFxuXHRcdFx0XHRcdG9NZXNzYWdlT2JqZWN0LFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzLFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUsXG5cdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdGJJc0NyZWF0aW9uUm93LFxuXHRcdFx0XHRcdGlUYXJnZXRDb2x1bW5JbmRleCA9PT0gMCAmJiBvVGFyZ2V0ZWRDb250cm9sLmdldFZhbHVlU3RhdGUoKSA9PT0gXCJFcnJvclwiID8gb1RhcmdldGVkQ29udHJvbCA6IHVuZGVmaW5lZFxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvL3NldCB0aGUgc3VidGl0bGVcblx0XHRcdFx0aWYgKHNNZXNzYWdlU3VidGl0bGUpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldFN1YnRpdGxlKHNNZXNzYWdlU3VidGl0bGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZSh0cnVlKTtcblxuXHRcdFx0XHR0aGlzLl91cGRhdGVJbnRlcm5hbE1vZGVsKFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRpUm93SW5kZXgsXG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSxcblx0XHRcdFx0XHRvVGFibGUsXG5cdFx0XHRcdFx0b01lc3NhZ2VPYmplY3QsXG5cdFx0XHRcdFx0YklzQ3JlYXRpb25Sb3dcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoc2V0U2VjdGlvbk5hbWVJbkdyb3VwKSB7XG5cdFx0XHRjb25zdCBzZWN0aW9uQmFzZWRHcm91cE5hbWUgPSBtZXNzYWdlSGFuZGxpbmcuY3JlYXRlU2VjdGlvbkdyb3VwTmFtZShcblx0XHRcdFx0c2VjdGlvbixcblx0XHRcdFx0c3ViU2VjdGlvbixcblx0XHRcdFx0Yk11bHRpcGxlU3ViU2VjdGlvbnMsXG5cdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8sXG5cdFx0XHRcdHJlc291cmNlTW9kZWxcblx0XHRcdCk7XG5cblx0XHRcdG1lc3NhZ2Uuc2V0R3JvdXBOYW1lKHNlY3Rpb25CYXNlZEdyb3VwTmFtZSk7XG5cdFx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5fZ2V0Vmlld0lkKHRoaXMuZ2V0SWQoKSk7XG5cdFx0XHRjb25zdCBvVmlldyA9IENvcmUuYnlJZChzVmlld0lkIGFzIHN0cmluZyk7XG5cdFx0XHRjb25zdCBvTWVzc2FnZVRhcmdldFByb3BlcnR5ID0gb01lc3NhZ2VPYmplY3QuZ2V0VGFyZ2V0cygpWzBdICYmIG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXS5zcGxpdChcIi9cIikucG9wKCk7XG5cdFx0XHRjb25zdCBvVUlNb2RlbCA9IG9WaWV3Py5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdGlmIChcblx0XHRcdFx0b1VJTW9kZWwgJiZcblx0XHRcdFx0b1VJTW9kZWwuZ2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIpICYmXG5cdFx0XHRcdG9NZXNzYWdlVGFyZ2V0UHJvcGVydHkgJiZcblx0XHRcdFx0b01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSA9PT0gb1VJTW9kZWwuZ2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuZmlyZUFjdGl2ZVRpdGxlUHJlc3MoeyBpdGVtOiBtZXNzYWdlIH0pO1xuXHRcdFx0XHRvVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi9tZXNzYWdlVGFyZ2V0UHJvcGVydHlcIiwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLm9JdGVtQmluZGluZy5hdHRhY2hDaGFuZ2UodGhpcy5fc2V0TWVzc2FnZURhdGEsIHRoaXMpO1xuXHRcdHJldHVybiBvVGFyZ2V0ZWRDb250cm9sO1xuXHR9XG5cblx0X2NoZWNrQ29udHJvbElkSW5TZWN0aW9ucyhhTWVzc2FnZXM6IGFueVtdKSB7XG5cdFx0bGV0IHNlY3Rpb24sIGFTdWJTZWN0aW9ucywgbWVzc2FnZSwgaSwgaiwgaztcblxuXHRcdHRoaXMuc0dlbmVyYWxHcm91cFRleHQgPSB0aGlzLnNHZW5lcmFsR3JvdXBUZXh0XG5cdFx0XHQ/IHRoaXMuc0dlbmVyYWxHcm91cFRleHRcblx0XHRcdDogQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiVF9NRVNTQUdFX0JVVFRPTl9TQVBGRV9NRVNTQUdFX0dST1VQX0dFTkVSQUxcIik7XG5cdFx0Ly9HZXQgYWxsIHNlY3Rpb25zIGZyb20gdGhlIG9iamVjdCBwYWdlIGxheW91dFxuXHRcdGNvbnN0IGFWaXNpYmxlU2VjdGlvbnMgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQodGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0aWYgKGFWaXNpYmxlU2VjdGlvbnMpIHtcblx0XHRcdGNvbnN0IHZpZXdJZCA9IHRoaXMuX2dldFZpZXdJZCh0aGlzLmdldElkKCkpO1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQodmlld0lkKTtcblx0XHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gb1ZpZXc/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwic0FjdGlvbk5hbWVcIik7XG5cdFx0XHRpZiAoc0FjdGlvbk5hbWUpIHtcblx0XHRcdFx0KG9WaWV3Py5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIGFueSkuc2V0UHJvcGVydHkoXCJzQWN0aW9uTmFtZVwiLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdGZvciAoaSA9IGFNZXNzYWdlcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuXHRcdFx0XHQvLyBMb29wIG92ZXIgYWxsIG1lc3NhZ2VzXG5cdFx0XHRcdG1lc3NhZ2UgPSBhTWVzc2FnZXNbaV07XG5cdFx0XHRcdGxldCBiSXNHZW5lcmFsR3JvdXBOYW1lID0gdHJ1ZTtcblx0XHRcdFx0Zm9yIChqID0gYVZpc2libGVTZWN0aW9ucy5sZW5ndGggLSAxOyBqID49IDA7IC0taikge1xuXHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgdmlzaWJsZSBzZWN0aW9uc1xuXHRcdFx0XHRcdHNlY3Rpb24gPSBhVmlzaWJsZVNlY3Rpb25zW2pdO1xuXHRcdFx0XHRcdGFTdWJTZWN0aW9ucyA9IHNlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdFx0XHRmb3IgKGsgPSBhU3ViU2VjdGlvbnMubGVuZ3RoIC0gMTsgayA+PSAwOyAtLWspIHtcblx0XHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc3ViLXNlY3Rpb25zXG5cdFx0XHRcdFx0XHRjb25zdCBzdWJTZWN0aW9uID0gYVN1YlNlY3Rpb25zW2tdO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01lc3NhZ2VPYmplY3QgPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgYUNvbnRyb2xzID0gbWVzc2FnZUhhbmRsaW5nLmdldENvbnRyb2xGcm9tTWVzc2FnZVJlbGF0aW5nVG9TdWJTZWN0aW9uKHN1YlNlY3Rpb24sIG9NZXNzYWdlT2JqZWN0KTtcblx0XHRcdFx0XHRcdGlmIChhQ29udHJvbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0ZWRDb250cm9sID0gdGhpcy5fY29tcHV0ZU1lc3NhZ2VHcm91cEFuZFN1YlRpdGxlKFxuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0c2VjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRzdWJTZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdGFDb250cm9scyxcblx0XHRcdFx0XHRcdFx0XHRhU3ViU2VjdGlvbnMubGVuZ3RoID4gMSxcblx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHQvLyBpZiB3ZSBmb3VuZCB0YWJsZSB0aGF0IG1hdGNoZXMgd2l0aCB0aGUgbWVzc2FnZSwgd2UgZG9uJ3Qgc3RvcCB0aGUgbG9vcFxuXHRcdFx0XHRcdFx0XHQvLyBpbiBjYXNlIHdlIGZpbmQgYW4gYWRkaXRpb25hbCBjb250cm9sIChlZyBtZGMgZmllbGQpIHRoYXQgYWxzbyBtYXRjaCB3aXRoIHRoZSBtZXNzYWdlXG5cdFx0XHRcdFx0XHRcdGlmIChvVGFyZ2V0ZWRDb250cm9sICYmICFvVGFyZ2V0ZWRDb250cm9sLmlzQShcInNhcC5tLlRhYmxlXCIpICYmICFvVGFyZ2V0ZWRDb250cm9sLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdGogPSBrID0gLTE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0YklzR2VuZXJhbEdyb3VwTmFtZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoYklzR2VuZXJhbEdyb3VwTmFtZSkge1xuXHRcdFx0XHRcdGNvbnN0IG9NZXNzYWdlT2JqZWN0ID0gbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZShmYWxzZSk7XG5cdFx0XHRcdFx0aWYgKG9NZXNzYWdlT2JqZWN0LnBlcnNpc3RlbnQgJiYgc0FjdGlvbk5hbWUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZSwgc0FjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZSh0aGlzLnNHZW5lcmFsR3JvdXBUZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZmluZFRhcmdldEZvck1lc3NhZ2UobWVzc2FnZTogYW55KSB7XG5cdFx0Y29uc3QgbWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpICYmIG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpO1xuXHRcdGlmIChtZXNzYWdlT2JqZWN0ICYmIG1lc3NhZ2VPYmplY3QudGFyZ2V0KSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID1cblx0XHRcdFx0XHR0aGlzLm9PYmplY3RQYWdlTGF5b3V0ICYmIHRoaXMub09iamVjdFBhZ2VMYXlvdXQuZ2V0TW9kZWwoKSAmJiB0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdGNvbnRleHRQYXRoID0gb01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG1lc3NhZ2VPYmplY3QudGFyZ2V0KSxcblx0XHRcdFx0b0NvbnRleHRQYXRoTWV0YWRhdGEgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGNvbnRleHRQYXRoKTtcblx0XHRcdGlmIChvQ29udGV4dFBhdGhNZXRhZGF0YSAmJiBvQ29udGV4dFBhdGhNZXRhZGF0YS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9mbkVuYWJsZUJpbmRpbmdzKGFTZWN0aW9uczogYW55W10pIHtcblx0XHRpZiAoVXJpUGFyYW1ldGVycy5mcm9tUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic2FwLWZlLXh4LWxhenlsb2FkaW5ndGVzdFwiKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3IgKGxldCBpU2VjdGlvbiA9IDA7IGlTZWN0aW9uIDwgYVNlY3Rpb25zLmxlbmd0aDsgaVNlY3Rpb24rKykge1xuXHRcdFx0Y29uc3Qgb1NlY3Rpb24gPSBhU2VjdGlvbnNbaVNlY3Rpb25dO1xuXHRcdFx0bGV0IG5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQgPSBmYWxzZTtcblx0XHRcdGNvbnN0IGFTdWJTZWN0aW9ucyA9IG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRmb3IgKGxldCBpU3ViU2VjdGlvbiA9IDA7IGlTdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgaVN1YlNlY3Rpb24rKykge1xuXHRcdFx0XHRjb25zdCBvU3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1tpU3ViU2VjdGlvbl07XG5cdFx0XHRcdGNvbnN0IG9BbGxCbG9ja3MgPSBvU3ViU2VjdGlvbi5nZXRCbG9ja3MoKTtcblx0XHRcdFx0aWYgKG9BbGxCbG9ja3MpIHtcblx0XHRcdFx0XHRmb3IgKGxldCBibG9jayA9IDA7IGJsb2NrIDwgb1N1YlNlY3Rpb24uZ2V0QmxvY2tzKCkubGVuZ3RoOyBibG9jaysrKSB7XG5cdFx0XHRcdFx0XHRpZiAob0FsbEJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCAmJiAhb0FsbEJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpPy5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRcdFx0XHRcdG5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKG5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQpIHtcblx0XHRcdFx0XHRcdG9TdWJTZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU3ViU2VjdGlvbi5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdFx0dGhpcy5fZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nKCk7XG5cdFx0XHRcdFx0b1N1YlNlY3Rpb24uZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRCaW5kaW5nKCkuYXR0YWNoRGF0YVJlY2VpdmVkKHRoaXMuX2ZpbmRNZXNzYWdlR3JvdXBBZnRlclJlYmluZGluZy5iaW5kKHRoaXMpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9maW5kTWVzc2FnZUdyb3VwQWZ0ZXJSZWJpbmRpbmcoKSB7XG5cdFx0Y29uc3QgYU1lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKTtcblx0XHR0aGlzLl9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgcmV0cmlldmVzIHRoZSB2aWV3IElEIChIVE1MVmlldy9YTUxWaWV3L0pTT052aWV3L0pTVmlldy9UZW1wbGF0ZXZpZXcpIG9mIGFueSBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbnRyb2xJZCBJRCBvZiB0aGUgY29udHJvbCBuZWVkZWQgdG8gcmV0cmlldmUgdGhlIHZpZXcgSURcblx0ICogQHJldHVybnMgVGhlIHZpZXcgSUQgb2YgdGhlIGNvbnRyb2xcblx0ICovXG5cdF9nZXRWaWV3SWQoc0NvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0bGV0IHNWaWV3SWQsXG5cdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKSBhcyBhbnk7XG5cdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBWaWV3KSB7XG5cdFx0XHRcdHNWaWV3SWQgPSBvQ29udHJvbC5nZXRJZCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBzVmlld0lkO1xuXHR9XG5cblx0X3NldExvbmd0ZXh0VXJsRGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQ6IHN0cmluZywgb0RpYWdub3Npc1RpdGxlOiBhbnkpIHtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5zZXRBc3luY0Rlc2NyaXB0aW9uSGFuZGxlcihmdW5jdGlvbiAoY29uZmlnOiBhbnkpIHtcblx0XHRcdC8vIFRoaXMgc3RvcmVzIHRoZSBvbGQgZGVzY3JpcHRpb25cblx0XHRcdGNvbnN0IHNPbGREZXNjcmlwdGlvbiA9IHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50O1xuXHRcdFx0Ly8gSGVyZSB3ZSBjYW4gZmV0Y2ggdGhlIGRhdGEgYW5kIGNvbmNhdGVuYXRlIGl0IHRvIHRoZSBvbGQgb25lXG5cdFx0XHQvLyBCeSBkZWZhdWx0LCB0aGUgbG9uZ3RleHRVcmwgZmV0Y2hpbmcgd2lsbCBvdmVyd3JpdGUgdGhlIGRlc2NyaXB0aW9uICh3aXRoIHRoZSBkZWZhdWx0IGJlaGF2aW91cilcblx0XHRcdC8vIEhlcmUgYXMgd2UgaGF2ZSBvdmVyd3JpdHRlbiB0aGUgZGVmYXVsdCBhc3luYyBoYW5kbGVyLCB3aGljaCBmZXRjaGVzIGFuZCByZXBsYWNlcyB0aGUgZGVzY3JpcHRpb24gb2YgdGhlIGl0ZW1cblx0XHRcdC8vIHdlIGNhbiBtYW51YWxseSBtb2RpZnkgaXQgdG8gaW5jbHVkZSB3aGF0ZXZlciBuZWVkZWQuXG5cdFx0XHRjb25zdCBzTG9uZ1RleHRVcmwgPSBjb25maWcuaXRlbS5nZXRMb25ndGV4dFVybCgpO1xuXHRcdFx0aWYgKHNMb25nVGV4dFVybCkge1xuXHRcdFx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHRcdFx0dHlwZTogXCJHRVRcIixcblx0XHRcdFx0XHR1cmw6IHNMb25nVGV4dFVybCxcblx0XHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0RpYWdub3Npc1RleHQgPSBvRGlhZ25vc2lzVGl0bGUuZ2V0SHRtbFRleHQoKSArIGRhdGE7XG5cdFx0XHRcdFx0XHRjb25maWcuaXRlbS5zZXREZXNjcmlwdGlvbihgJHtzT2xkRGVzY3JpcHRpb259JHtzRGlhZ25vc2lzVGV4dH1gKTtcblx0XHRcdFx0XHRcdGNvbmZpZy5wcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGVycm9yOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRjb25maWcuaXRlbS5zZXREZXNjcmlwdGlvbihzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCk7XG5cdFx0XHRcdFx0XHRjb25zdCBzRXJyb3IgPSBgQSByZXF1ZXN0IGhhcyBmYWlsZWQgZm9yIGxvbmcgdGV4dCBkYXRhLiBVUkw6ICR7c0xvbmdUZXh0VXJsfWA7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3Ioc0Vycm9yKTtcblx0XHRcdFx0XHRcdGNvbmZpZy5wcm9taXNlLnJlamVjdChzRXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRfZm9ybWF0TWVzc2FnZURlc2NyaXB0aW9uKG1lc3NhZ2U6IGFueSwgb1RhYmxlUm93Q29udGV4dDogYW55LCBzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcsIG9UYWJsZTogYW55KSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1RhYmxlKTtcblx0XHRjb25zdCBzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gb1RhYmxlLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRsZXQgc0NvbHVtbkluZm8gPSBcIlwiO1xuXHRcdGNvbnN0IG9Nc2dPYmogPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKT8uZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3Qgb0NvbEZyb21UYWJsZVNldHRpbmdzOiBDb2x1bW5EYXRhV2l0aEF2YWlsYWJpbGl0eVR5cGUgPSBtZXNzYWdlSGFuZGxpbmcuZmV0Y2hDb2x1bW5JbmZvKG9Nc2dPYmosIG9UYWJsZSk7XG5cdFx0aWYgKHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdC8vIGlmIGNvbHVtbiBpbiBwcmVzZW50IGluIHRhYmxlIGRlZmluaXRpb25cblx0XHRcdHNDb2x1bW5JbmZvID0gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX0NPTFVNTlwiKX06ICR7c1RhYmxlVGFyZ2V0Q29sTmFtZX1gO1xuXHRcdH0gZWxzZSBpZiAob0NvbEZyb21UYWJsZVNldHRpbmdzKSB7XG5cdFx0XHRpZiAob0NvbEZyb21UYWJsZVNldHRpbmdzLmF2YWlsYWJpbGl0eSA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHQvLyBpZiBjb2x1bW4gaW4gbmVpdGhlciBpbiB0YWJsZSBkZWZpbml0aW9uIG5vciBwZXJzb25hbGl6YXRpb25cblx0XHRcdFx0aWYgKG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBcIkVycm9yXCIpIHtcblx0XHRcdFx0XHRzQ29sdW1uSW5mbyA9IHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdD8gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9DT0xVTU5fQVZBSUxBQkxFX0RJQUdOT1NJU19NU0dERVNDX0VSUk9SXCIpfSAke29UYWJsZVJvd0NvbnRleHQuZ2V0VmFsdWUoXG5cdFx0XHRcdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0ICApfWAgKyBcIi5cIlxuXHRcdFx0XHRcdFx0OiBgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NfRVJST1JcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNDb2x1bW5JbmZvID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0PyBgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NcIil9ICR7b1RhYmxlUm93Q29udGV4dC5nZXRWYWx1ZShcblx0XHRcdFx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5XG5cdFx0XHRcdFx0XHQgICl9YCArIFwiLlwiXG5cdFx0XHRcdFx0XHQ6IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ1wiKX1gICsgXCIuXCI7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGlmIGNvbHVtbiBpcyBub3QgaW4gdGFibGUgZGVmaW5pdGlvbiBidXQgaW4gcGVyc29uYWxpemF0aW9uXG5cdFx0XHRcdC8vaWYgbm8gbmF2aWdhdGlvbiB0byBzdWIgb3AgdGhlbiByZW1vdmUgbGluayB0byBlcnJvciBmaWVsZCBCQ1AgOiAyMjgwMTY4ODk5XG5cdFx0XHRcdGlmICghdGhpcy5fbmF2aWdhdGlvbkNvbmZpZ3VyZWQob1RhYmxlKSkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUoZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNDb2x1bW5JbmZvID0gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX0NPTFVNTlwiKX06ICR7XG5cdFx0XHRcdFx0b0NvbEZyb21UYWJsZVNldHRpbmdzLmxhYmVsXG5cdFx0XHRcdH0gKCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9DT0xVTU5fSU5ESUNBVE9SX0lOX1RBQkxFX0RFRklOSVRJT05cIil9KWA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IG9GaWVsZHNBZmZlY3RlZFRpdGxlID0gbmV3IEZvcm1hdHRlZFRleHQoe1xuXHRcdFx0aHRtbFRleHQ6IGA8aHRtbD48Ym9keT48c3Ryb25nPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9GSUVMRFNfQUZGRUNURURfVElUTEVcIil9PC9zdHJvbmc+PC9ib2R5PjwvaHRtbD48YnI+YFxuXHRcdH0pO1xuXHRcdGxldCBzRmllbGRBZmZlY3RlZFRleHQ6IFN0cmluZztcblx0XHRpZiAoc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSkge1xuXHRcdFx0c0ZpZWxkQWZmZWN0ZWRUZXh0ID0gYCR7b0ZpZWxkc0FmZmVjdGVkVGl0bGUuZ2V0SHRtbFRleHQoKX08YnI+JHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCJcblx0XHRcdCl9OiAke29UYWJsZS5nZXRIZWFkZXIoKX08YnI+JHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfUk9XXCIpfTogJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5XG5cdFx0XHQpfTxicj4ke3NDb2x1bW5JbmZvfTxicj5gO1xuXHRcdH0gZWxzZSBpZiAoc0NvbHVtbkluZm8gPT0gXCJcIiB8fCAhc0NvbHVtbkluZm8pIHtcblx0XHRcdHNGaWVsZEFmZmVjdGVkVGV4dCA9IFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNGaWVsZEFmZmVjdGVkVGV4dCA9IGAke29GaWVsZHNBZmZlY3RlZFRpdGxlLmdldEh0bWxUZXh0KCl9PGJyPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XHRcIlRfTUVTU0FHRV9HUk9VUF9USVRMRV9UQUJMRV9ERU5PTUlOQVRPUlwiXG5cdFx0XHQpfTogJHtvVGFibGUuZ2V0SGVhZGVyKCl9PGJyPiR7c0NvbHVtbkluZm99PGJyPmA7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0RpYWdub3Npc1RpdGxlID0gbmV3IEZvcm1hdHRlZFRleHQoe1xuXHRcdFx0aHRtbFRleHQ6IGA8aHRtbD48Ym9keT48c3Ryb25nPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9ESUFHTk9TSVNfVElUTEVcIil9PC9zdHJvbmc+PC9ib2R5PjwvaHRtbD48YnI+YFxuXHRcdH0pO1xuXHRcdC8vIGdldCB0aGUgVUkgbWVzc2FnZXMgZnJvbSB0aGUgbWVzc2FnZSBjb250ZXh0IHRvIHNldCBpdCB0byBEaWFnbm9zaXMgc2VjdGlvblxuXHRcdGNvbnN0IHNVSU1lc3NhZ2VEZXNjcmlwdGlvbiA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpLmRlc2NyaXB0aW9uO1xuXHRcdC8vc2V0IHRoZSBkZXNjcmlwdGlvbiB0byBudWxsIHRvIHJlc2V0IGl0IGJlbG93XG5cdFx0bWVzc2FnZS5zZXREZXNjcmlwdGlvbihudWxsKTtcblx0XHRsZXQgc0RpYWdub3Npc1RleHQgPSBcIlwiO1xuXHRcdGxldCBzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCA9IFwiXCI7XG5cdFx0aWYgKG1lc3NhZ2UuZ2V0TG9uZ3RleHRVcmwoKSkge1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPmA7XG5cdFx0XHR0aGlzLl9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50LCBvRGlhZ25vc2lzVGl0bGUpO1xuXHRcdH0gZWxzZSBpZiAoc1VJTWVzc2FnZURlc2NyaXB0aW9uKSB7XG5cdFx0XHRzRGlhZ25vc2lzVGV4dCA9IGAke29EaWFnbm9zaXNUaXRsZS5nZXRIdG1sVGV4dCgpfTxicj4ke3NVSU1lc3NhZ2VEZXNjcmlwdGlvbn1gO1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPiR7c0RpYWdub3Npc1RleHR9YDtcblx0XHRcdG1lc3NhZ2Uuc2V0RGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXNzYWdlLnNldERlc2NyaXB0aW9uKHNGaWVsZEFmZmVjdGVkVGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBzZXQgdGhlIGJ1dHRvbiB0ZXh0LCBjb3VudCBhbmQgaWNvbiBwcm9wZXJ0eSBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIEJ1dHRvblR5cGU6ICBQb3NzaWJsZSBzZXR0aW5ncyBmb3Igd2FybmluZyBhbmQgZXJyb3IgbWVzc2FnZXMgYXJlICdjcml0aWNhbCcgYW5kICduZWdhdGl2ZScuXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0TWVzc2FnZURhdGEoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NldE1lc3NhZ2VEYXRhVGltZW91dCk7XG5cblx0XHR0aGlzLl9zZXRNZXNzYWdlRGF0YVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNJY29uID0gXCJcIixcblx0XHRcdFx0b01lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKSxcblx0XHRcdFx0b01lc3NhZ2VDb3VudDogTWVzc2FnZUNvdW50ID0geyBFcnJvcjogMCwgV2FybmluZzogMCwgU3VjY2VzczogMCwgSW5mb3JtYXRpb246IDAgfSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRcdFx0aU1lc3NhZ2VMZW5ndGggPSBvTWVzc2FnZXMubGVuZ3RoO1xuXHRcdFx0bGV0IHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiXCIsXG5cdFx0XHRcdHNUb29sdGlwVGV4dCA9IFwiXCIsXG5cdFx0XHRcdHNNZXNzYWdlVGV4dCA9IFwiXCI7XG5cdFx0XHRpZiAoaU1lc3NhZ2VMZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaU1lc3NhZ2VMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICghb01lc3NhZ2VzW2ldLmdldFR5cGUoKSB8fCBvTWVzc2FnZXNbaV0uZ2V0VHlwZSgpID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHQrK29NZXNzYWdlQ291bnRbXCJJbmZvcm1hdGlvblwiXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0KytvTWVzc2FnZUNvdW50W29NZXNzYWdlc1tpXS5nZXRUeXBlKCkgYXMga2V5b2YgTWVzc2FnZUNvdW50XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuRXJyb3JdID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5OZWdhdGl2ZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLldhcm5pbmddID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5Dcml0aWNhbDtcblx0XHRcdFx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLlN1Y2Nlc3NdID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5TdWNjZXNzO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuSW5mb3JtYXRpb25dID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5OZXV0cmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgdG90YWxOdW1iZXJPZk1lc3NhZ2VzID1cblx0XHRcdFx0XHRvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkVycm9yXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5XYXJuaW5nXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5TdWNjZXNzXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbl07XG5cblx0XHRcdFx0dGhpcy5zZXRUZXh0KHRvdGFsTnVtYmVyT2ZNZXNzYWdlcy50b1N0cmluZygpKTtcblxuXHRcdFx0XHRpZiAob01lc3NhZ2VDb3VudC5FcnJvciA9PT0gMSkge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0VSUk9SXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudC5FcnJvciA+IDEpIHtcblx0XHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiQ19DT01NT05fU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9NVUxUSVBMRV9FUlJPUl9UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgb01lc3NhZ2VDb3VudC5XYXJuaW5nKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfV0FSTklOR19UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgIW9NZXNzYWdlQ291bnQuV2FybmluZyAmJiBvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0lORk9cIjtcblx0XHRcdFx0fSBlbHNlIGlmICghb01lc3NhZ2VDb3VudC5FcnJvciAmJiAhb01lc3NhZ2VDb3VudC5XYXJuaW5nICYmICFvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uICYmIG9NZXNzYWdlQ291bnQuU3VjY2Vzcykge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9TVUNDRVNTXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNNZXNzYWdlS2V5KSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VUZXh0ID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc01lc3NhZ2VLZXkpO1xuXHRcdFx0XHRcdHNUb29sdGlwVGV4dCA9IG9NZXNzYWdlQ291bnQuRXJyb3IgPyBgJHtvTWVzc2FnZUNvdW50LkVycm9yfSAke3NNZXNzYWdlVGV4dH1gIDogc01lc3NhZ2VUZXh0O1xuXHRcdFx0XHRcdHRoaXMuc2V0VG9vbHRpcChzVG9vbHRpcFRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0SWNvbihzSWNvbik7XG5cdFx0XHRcdHRoaXMuc2V0VHlwZShzQnV0dG9uVHlwZSk7XG5cdFx0XHRcdHRoaXMuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQodGhpcy5zVmlld0lkKSBhcyBWaWV3O1xuXHRcdFx0XHRpZiAob1ZpZXcpIHtcblx0XHRcdFx0XHRjb25zdCBvUGFnZVJlYWR5ID0gKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikucGFnZVJlYWR5O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvUGFnZVJlYWR5LndhaXRQYWdlUmVhZHkoKTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2FwcGx5R3JvdXBpbmdBc3luYyhvVmlldyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmYWlsIGdyb3VwaW5nIG1lc3NhZ2VzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVNZXNzYWdlQ2hhbmdlKHtcblx0XHRcdFx0XHRcdGlNZXNzYWdlTGVuZ3RoOiBpTWVzc2FnZUxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpTWVzc2FnZUxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5maXJlTWVzc2FnZUNoYW5nZSh7XG5cdFx0XHRcdFx0aU1lc3NhZ2VMZW5ndGg6IGlNZXNzYWdlTGVuZ3RoXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIHRpdGxlIG9mIHRoZSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2FjdGl2ZVRpdGxlUHJlc3Ncblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gdGhlIGhhbmRsZXJcblx0ICovXG5cdGFzeW5jIF9hY3RpdmVUaXRsZVByZXNzKG9FdmVudDogQ29yZUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dChcInBhZ2VJbnRlcm5hbFwiKTtcblx0XHQob0ludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSkuc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCB0cnVlKTtcblx0XHRjb25zdCBvSXRlbSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpdGVtXCIpLFxuXHRcdFx0b01lc3NhZ2UgPSBvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCksXG5cdFx0XHRiSXNCYWNrZW5kTWVzc2FnZSA9IG5ldyBSZWdFeHAoXCJeL1wiKS50ZXN0KG9NZXNzYWdlLmdldFRhcmdldCgpKSxcblx0XHRcdG9WaWV3ID0gQ29yZS5ieUlkKHRoaXMuc1ZpZXdJZCkgYXMgVmlldztcblx0XHRsZXQgb0NvbnRyb2wsIHNTZWN0aW9uVGl0bGU7XG5cdFx0Y29uc3QgX2RlZmF1bHRGb2N1cyA9IGZ1bmN0aW9uIChtZXNzYWdlOiBhbnksIG1kY1RhYmxlOiBhbnkpIHtcblx0XHRcdGNvbnN0IGZvY3VzSW5mbyA9IHsgcHJldmVudFNjcm9sbDogdHJ1ZSwgdGFyZ2V0SW5mbzogbWVzc2FnZSB9O1xuXHRcdFx0bWRjVGFibGUuZm9jdXMoZm9jdXNJbmZvKTtcblx0XHR9O1xuXG5cdFx0Ly9jaGVjayBpZiB0aGUgcHJlc3NlZCBpdGVtIGlzIHJlbGF0ZWQgdG8gYSB0YWJsZSBjb250cm9sXG5cdFx0aWYgKG9JdGVtLmdldEdyb3VwTmFtZSgpLmluZGV4T2YoXCJUYWJsZTpcIikgIT09IC0xKSB7XG5cdFx0XHRsZXQgb1RhcmdldE1kY1RhYmxlOiBhbnk7XG5cdFx0XHRpZiAoYklzQmFja2VuZE1lc3NhZ2UpIHtcblx0XHRcdFx0b1RhcmdldE1kY1RhYmxlID0gb01lc3NhZ2UuY29udHJvbElkc1xuXHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRcdFx0XHRcdGNvbnN0IG9QYXJlbnRDb250cm9sID0gY29udHJvbCAmJiAoY29udHJvbC5nZXRQYXJlbnQoKSBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJlbnRDb250cm9sICYmXG5cdFx0XHRcdFx0XHRcdG9QYXJlbnRDb250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiZcblx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wuZ2V0SGVhZGVyKCkgPT09IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBUYWJsZTogXCIpWzFdXG5cdFx0XHRcdFx0XHRcdD8gb1BhcmVudENvbnRyb2xcblx0XHRcdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYWNjOiBhbnksIHZhbDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsID8gdmFsIDogYWNjO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob1RhcmdldE1kY1RhYmxlKSB7XG5cdFx0XHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUoXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRNZGNUYWJsZSxcblx0XHRcdFx0XHRcdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCxcblx0XHRcdFx0XHRcdFx0c1NlY3Rpb25UaXRsZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZWZFcnJvckNvbnRleHQgPSB0aGlzLl9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1JlZkVycm9yID0gb1JlZkVycm9yQ29udGV4dC5nZXRQcm9wZXJ0eShvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkuZ2V0SWQoKSk7XG5cdFx0XHRcdFx0XHRjb25zdCBfc2V0Rm9jdXNPblRhcmdldEZpZWxkID0gYXN5bmMgKHRhcmdldE1kY1RhYmxlOiBhbnksIGlSb3dJbmRleDogbnVtYmVyKTogUHJvbWlzZTxhbnk+ID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVRhcmdldE1kY1RhYmxlUm93ID0gdGhpcy5fZ2V0TWRjVGFibGVSb3dzKHRhcmdldE1kY1RhYmxlKSxcblx0XHRcdFx0XHRcdFx0XHRpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKHRhcmdldE1kY1RhYmxlKS5nZXRGaXJzdFZpc2libGVSb3coKTtcblx0XHRcdFx0XHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRSb3cgPSBhVGFyZ2V0TWRjVGFibGVSb3dbaVJvd0luZGV4IC0gaUZpcnN0VmlzaWJsZVJvd10sXG5cdFx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0Q2VsbCA9IHRoaXMuZ2V0VGFyZ2V0Q2VsbChvVGFyZ2V0Um93LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9UYXJnZXRDZWxsKTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNvbnRyb2wgbm90IGZvdW5kIG9uIHRhYmxlXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvclByb3BlcnR5ID0gb01lc3NhZ2UuZ2V0VGFyZ2V0KCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGVycm9yUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KG9WaWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsKS5zZXRQcm9wZXJ0eShcIi9tZXNzYWdlVGFyZ2V0UHJvcGVydHlcIiwgZXJyb3JQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5fbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFyZ2V0TWRjVGFibGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fcm91dGluZy5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1RhcmdldFJvdy5nZXRCaW5kaW5nQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRNZGNUYWJsZS5kYXRhKFwidGFibGVUeXBlXCIpID09PSBcIkdyaWRUYWJsZVwiICYmIG9SZWZFcnJvci5yb3dJbmRleCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKG9UYXJnZXRNZGNUYWJsZSkuZ2V0Rmlyc3RWaXNpYmxlUm93KCk7XG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgb1RhcmdldE1kY1RhYmxlLnNjcm9sbFRvSW5kZXgob1JlZkVycm9yLnJvd0luZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhVGFyZ2V0TWRjVGFibGVSb3cgPSB0aGlzLl9nZXRNZGNUYWJsZVJvd3Mob1RhcmdldE1kY1RhYmxlKTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaU5ld0ZpcnN0VmlzaWJsZVJvdywgYlNjcm9sbE5lZWRlZDtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYVRhcmdldE1kY1RhYmxlUm93Lmxlbmd0aCA+IDAgJiYgYVRhcmdldE1kY1RhYmxlUm93WzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpTmV3Rmlyc3RWaXNpYmxlUm93ID0gYVRhcmdldE1kY1RhYmxlUm93WzBdLmdldFBhcmVudCgpLmdldEZpcnN0VmlzaWJsZVJvdygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YlNjcm9sbE5lZWRlZCA9IGlGaXJzdFZpc2libGVSb3cgLSBpTmV3Rmlyc3RWaXNpYmxlUm93ICE9PSAwO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRsZXQgb1dhaXRDb250cm9sSWRBZGRlZDogUHJvbWlzZTx2b2lkPjtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYlNjcm9sbE5lZWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9UaGUgc2Nyb2xsVG9JbmRleCBmdW5jdGlvbiBkb2VzIG5vdCB3YWl0IGZvciB0aGUgVUkgdXBkYXRlLiBBcyBhIHdvcmthcm91bmQsIHBlbmRpbmcgYSBmaXggZnJvbSBNREMgKEJDUDogMjE3MDI1MTYzMSkgd2UgdXNlIHRoZSBldmVudCBcIlVJVXBkYXRlZFwiLlxuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdENvcmUuYXR0YWNoRXZlbnQoXCJVSVVwZGF0ZWRcIiwgcmVzb2x2ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBvV2FpdENvbnRyb2xJZEFkZGVkO1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPblRhcmdldEZpZWxkID0gYXdhaXQgX3NldEZvY3VzT25UYXJnZXRGaWVsZChvVGFyZ2V0TWRjVGFibGUsIG9SZWZFcnJvci5yb3dJbmRleCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPblRhcmdldEZpZWxkID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfZGVmYXVsdEZvY3VzKG9NZXNzYWdlLCBvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmb2N1c2luZyBvbiBlcnJvclwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvVGFyZ2V0TWRjVGFibGUuZGF0YShcInRhYmxlVHlwZVwiKSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIiAmJiBvUmVmRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID0gYXdhaXQgdGhpcy5mb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2woXG5cdFx0XHRcdFx0XHRcdFx0b1ZpZXcsXG5cdFx0XHRcdFx0XHRcdFx0b01lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0b1RhcmdldE1kY1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdG9SZWZFcnJvci5yb3dJbmRleFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdF9kZWZhdWx0Rm9jdXMob01lc3NhZ2UsIG9UYXJnZXRNZGNUYWJsZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJGYWlsIHRvIG5hdmlnYXRlIHRvIEVycm9yIGNvbnRyb2xcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5jb250cm9sSWRzWzBdKTtcblx0XHRcdFx0Ly9JZiB0aGUgY29udHJvbCB1bmRlcmx5aW5nIHRoZSBmcm9udEVuZCBtZXNzYWdlIGlzIG5vdCB3aXRoaW4gdGhlIGN1cnJlbnQgc2VjdGlvbiwgd2UgZmlyc3QgZ28gaW50byB0aGUgdGFyZ2V0IHNlY3Rpb246XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZFNlY3Rpb246IGFueSA9IENvcmUuYnlJZCh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpKTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZFNlY3Rpb24/LmZpbmRFbGVtZW50cyh0cnVlKS5pbmRleE9mKG9Db250cm9sKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRzU2VjdGlvblRpdGxlID0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFwiKVswXTtcblx0XHRcdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9Db250cm9sKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9jdXMgb24gY29udHJvbFxuXHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyBhIHRhYmxlIGNlbGwgdGFyZ2V0ZWQgYnkgYSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0Um93IEEgdGFibGUgcm93XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXNzYWdlIE1lc3NhZ2UgdGFyZ2V0aW5nIGEgY2VsbFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBSZXR1cm5zIHRoZSBjZWxsXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRUYXJnZXRDZWxsKHRhcmdldFJvdzogQ29sdW1uTGlzdEl0ZW0sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBVSTVFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0Q29udHJvbElkcygpLmxlbmd0aCA+IDBcblx0XHRcdD8gbWVzc2FnZVxuXHRcdFx0XHRcdC5nZXRDb250cm9sSWRzKClcblx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChjb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgaXNDb250cm9sSW5UYWJsZSA9ICh0YXJnZXRSb3cgYXMgYW55KS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKGVsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZWxlbS5nZXRJZCgpID09PSBjb250cm9sSWQ7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJldHVybiBpc0NvbnRyb2xJblRhYmxlLmxlbmd0aCA+IDAgPyBDb3JlLmJ5SWQoY29udHJvbElkKSA6IG51bGw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhY2M6IGFueSwgdmFsOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWwgPyB2YWwgOiBhY2M7XG5cdFx0XHRcdFx0fSlcblx0XHRcdDogbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb2N1cyBvbiB0aGUgY29udHJvbCB0YXJnZXRlZCBieSBhIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdGFyZ2V0aW5nIHRoZSBjb250cm9sIG9uIHdoaWNoIHdlIHdhbnQgdG8gc2V0IHRoZSBmb2N1c1xuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0TWRjVGFibGUgVGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJvd0luZGV4IFRoZSByb3cgaW5kZXggb2YgdGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIGZvY3VzT25NZXNzYWdlVGFyZ2V0Q29udHJvbCh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlLCB0YXJnZXRNZGNUYWJsZT86IGFueSwgcm93SW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IGFBbGxWaWV3RWxlbWVudHMgPSB2aWV3LmZpbmRFbGVtZW50cyh0cnVlKTtcblx0XHRjb25zdCBhRXJyb25lb3VzQ29udHJvbHMgPSBtZXNzYWdlXG5cdFx0XHQuZ2V0Q29udHJvbElkcygpXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzQ29udHJvbElkOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGFBbGxWaWV3RWxlbWVudHMuc29tZShmdW5jdGlvbiAob0VsZW0pIHtcblx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uZ2V0SWQoKSA9PT0gc0NvbnRyb2xJZCAmJiBvRWxlbS5nZXREb21SZWYoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAoc0NvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBDb3JlLmJ5SWQoc0NvbnRyb2xJZCk7XG5cdFx0XHR9KTtcblx0XHRjb25zdCBhTm90VGFibGVFcnJvbmVvdXNDb250cm9scyA9IGFFcnJvbmVvdXNDb250cm9scy5maWx0ZXIoZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiAhb0VsZW0uaXNBKFwic2FwLm0uVGFibGVcIikgJiYgIW9FbGVtLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKTtcblx0XHR9KTtcblx0XHQvL1RoZSBmb2N1cyBpcyBzZXQgb24gTm90IFRhYmxlIGNvbnRyb2wgaW4gcHJpb3JpdHlcblx0XHRpZiAoYU5vdFRhYmxlRXJyb25lb3VzQ29udHJvbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5zZXRGb2N1c1RvQ29udHJvbChhTm90VGFibGVFcnJvbmVvdXNDb250cm9sc1swXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAoYUVycm9uZW91c0NvbnRyb2xzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGFUYXJnZXRNZGNUYWJsZVJvdyA9IHRhcmdldE1kY1RhYmxlXG5cdFx0XHRcdD8gdGFyZ2V0TWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IFtdO1xuXHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0Um93ID0gYVRhcmdldE1kY1RhYmxlUm93W3Jvd0luZGV4IGFzIG51bWJlcl07XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRDZWxsID0gdGhpcy5nZXRUYXJnZXRDZWxsKG9UYXJnZXRSb3csIG1lc3NhZ2UpIGFzIGFueTtcblx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldEZpZWxkID0gb1RhcmdldENlbGwuaXNBKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKVxuXHRcdFx0XHRcdFx0PyBvVGFyZ2V0Q2VsbC5nZXRDb250ZW50KCkuZ2V0Q29udGVudEVkaXQoKVswXVxuXHRcdFx0XHRcdFx0OiBvVGFyZ2V0Q2VsbC5nZXRJdGVtcygpWzBdLmdldENvbnRlbnQoKS5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2wob1RhcmdldEZpZWxkKTtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yUHJvcGVydHkgPSBtZXNzYWdlLmdldFRhcmdldCgpLnNwbGl0KFwiL1wiKS5wb3AoKTtcblx0XHRcdFx0XHRpZiAoZXJyb3JQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0KHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiLCBlcnJvclByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKHRhcmdldE1kY1RhYmxlKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICh2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX3JvdXRpbmcubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9UYXJnZXRSb3cuZ2V0QmluZGluZ0NvbnRleHQoKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIG9iaiBUaGUgbWVzc2FnZSBvYmplY3Rcblx0ICogQHBhcmFtIGFTZWN0aW9ucyBUaGUgYXJyYXkgb2Ygc2VjdGlvbnMgaW4gdGhlIG9iamVjdCBwYWdlXG5cdCAqIEByZXR1cm5zIFRoZSByYW5rIG9mIHRoZSBtZXNzYWdlXG5cdCAqL1xuXHRfZ2V0TWVzc2FnZVJhbmsob2JqOiBhbnksIGFTZWN0aW9uczogYW55W10pIHtcblx0XHRpZiAoYVNlY3Rpb25zKSB7XG5cdFx0XHRsZXQgc2VjdGlvbiwgYVN1YlNlY3Rpb25zLCBzdWJTZWN0aW9uLCBqLCBrLCBhRWxlbWVudHMsIGFBbGxFbGVtZW50cywgc2VjdGlvblJhbms7XG5cdFx0XHRmb3IgKGogPSBhU2VjdGlvbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyAtLWopIHtcblx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCBzZWN0aW9uc1xuXHRcdFx0XHRzZWN0aW9uID0gYVNlY3Rpb25zW2pdO1xuXHRcdFx0XHRhU3ViU2VjdGlvbnMgPSBzZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdGZvciAoayA9IGFTdWJTZWN0aW9ucy5sZW5ndGggLSAxOyBrID49IDA7IC0taykge1xuXHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc3ViLXNlY3Rpb25zXG5cdFx0XHRcdFx0c3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1trXTtcblx0XHRcdFx0XHRhQWxsRWxlbWVudHMgPSBzdWJTZWN0aW9uLmZpbmRFbGVtZW50cyh0cnVlKTsgLy8gR2V0IGFsbCBlbGVtZW50cyBpbnNpZGUgYSBzdWItc2VjdGlvblxuXHRcdFx0XHRcdC8vVHJ5IHRvIGZpbmQgdGhlIGNvbnRyb2wgMSBpbnNpZGUgdGhlIHN1YiBzZWN0aW9uXG5cdFx0XHRcdFx0YUVsZW1lbnRzID0gYUFsbEVsZW1lbnRzLmZpbHRlcih0aGlzLl9mbkZpbHRlclVwb25JZC5iaW5kKHRoaXMsIG9iai5nZXRDb250cm9sSWQoKSkpO1xuXHRcdFx0XHRcdHNlY3Rpb25SYW5rID0gaiArIDE7XG5cdFx0XHRcdFx0aWYgKGFFbGVtZW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5nZXRWaXNpYmxlKCkgJiYgc3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFvYmouaGFzT3duUHJvcGVydHkoXCJzZWN0aW9uTmFtZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9iai5zZWN0aW9uTmFtZSA9IHNlY3Rpb24uZ2V0VGl0bGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShcInN1YlNlY3Rpb25OYW1lXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0b2JqLnN1YlNlY3Rpb25OYW1lID0gc3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWN0aW9uUmFuayAqIDEwICsgKGsgKyAxKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIGlmIHNlY3Rpb24gb3Igc3Vic2VjdGlvbiBpcyBpbnZpc2libGUgdGhlbiBncm91cCBuYW1lIHdvdWxkIGJlIExhc3QgQWN0aW9uXG5cdFx0XHRcdFx0XHRcdC8vIHNvIHJhbmtpbmcgc2hvdWxkIGJlIGxvd2VyXG5cdFx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9pZiBzdWIgc2VjdGlvbiB0aXRsZSBpcyBPdGhlciBtZXNzYWdlcywgd2UgcmV0dXJuIGEgaGlnaCBudW1iZXIocmFuayksIHdoaWNoIGVuc3VyZXNcblx0XHRcdC8vdGhhdCBtZXNzYWdlcyBiZWxvbmdpbmcgdG8gdGhpcyBzdWIgc2VjdGlvbiBhbHdheXMgY29tZSBsYXRlciBpbiBtZXNzYWdlUG9wb3ZlclxuXHRcdFx0aWYgKCFvYmouc2VjdGlvbk5hbWUgJiYgIW9iai5zdWJTZWN0aW9uTmFtZSAmJiBvYmoucGVyc2lzdGVudCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiA5OTk7XG5cdFx0fVxuXHRcdHJldHVybiA5OTk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHNldCB0aGUgZmlsdGVycyBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIFRoZSBkZXNpcmVkIGZpbHRlciBvcGVyYXRpb24gaXM6XG5cdCAqICggZmlsdGVycyBwcm92aWRlZCBieSB1c2VyICYmICggdmFsaWRhdGlvbiA9IHRydWUgJiYgQ29udHJvbCBzaG91bGQgYmUgcHJlc2VudCBpbiB2aWV3ICkgfHwgbWVzc2FnZXMgZm9yIHRoZSBjdXJyZW50IG1hdGNoaW5nIGNvbnRleHQgKS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9hcHBseUZpbHRlcnNBbmRTb3J0KCkge1xuXHRcdGxldCBvVmFsaWRhdGlvbkZpbHRlcnMsXG5cdFx0XHRvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsXG5cdFx0XHRvRmlsdGVycyxcblx0XHRcdHNQYXRoLFxuXHRcdFx0b1NvcnRlcixcblx0XHRcdG9EaWFsb2dGaWx0ZXIsXG5cdFx0XHRvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnM6IGFueSA9IG51bGw7XG5cdFx0Y29uc3QgYVVzZXJEZWZpbmVkRmlsdGVyOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2cgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSA9PiB7XG5cdFx0XHRcdGxldCBpbmRleCA9IEluZmluaXR5LFxuXHRcdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBhbnk7XG5cdFx0XHRcdGNvbnN0IGVycm9yRmllbGRDb250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmllbGRSYW5raW5EaWFsb2cgPVxuXHRcdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdFx0PyAoZXJyb3JGaWVsZENvbnRyb2w/LmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHRcdDogSW5maW5pdHk7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRpbmRleCA9IGZpZWxkUmFua2luRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBkaWFsb2cncyBjb250cm9sXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2woZXJyb3JGaWVsZENvbnRyb2wpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gbWVzc2FnZXMgZm9yIHNhcC5tLkRpYWxvZyBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbWVzc2FnZSBidXR0b25cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IFwiY29udHJvbElkc1wiLFxuXHRcdFx0XHR0ZXN0OiBmblRlc3QsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IHRydWVcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Ly9GaWx0ZXIgZnVuY3Rpb24gdG8gdmVyaWZ5IGlmIHRoZSBjb250cm9sIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnQgdmlldyBvciBub3Rcblx0XHRmdW5jdGlvbiBnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIoKSB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSBmdW5jdGlvbiAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSB7XG5cdFx0XHRcdGlmICghYUNvbnRyb2xJZHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sLmdldElkKCkgPT09IHNWaWV3SWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRcdC8vIG1lc3NhZ2VzIGZvciBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBhcHBlYXIgaW4gdGhlIG1lc3NhZ2UgYnV0dG9uXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDogXCJjb250cm9sSWRzXCIsXG5cdFx0XHRcdHRlc3Q6IGZuVGVzdCxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICghdGhpcy5zVmlld0lkKSB7XG5cdFx0XHR0aGlzLnNWaWV3SWQgPSB0aGlzLl9nZXRWaWV3SWQodGhpcy5nZXRJZCgpKSBhcyBzdHJpbmc7XG5cdFx0fVxuXHRcdGNvbnN0IHNWaWV3SWQgPSB0aGlzLnNWaWV3SWQ7XG5cdFx0Ly9BZGQgdGhlIGZpbHRlcnMgcHJvdmlkZWQgYnkgdGhlIHVzZXJcblx0XHRjb25zdCBhQ3VzdG9tRmlsdGVycyA9IHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjdXN0b21GaWx0ZXJzXCIpIGFzIGFueTtcblx0XHRpZiAoYUN1c3RvbUZpbHRlcnMpIHtcblx0XHRcdGFDdXN0b21GaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlcjogYW55KSB7XG5cdFx0XHRcdGFVc2VyRGVmaW5lZEZpbHRlci5wdXNoKFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogZmlsdGVyLmdldFByb3BlcnR5KFwicGF0aFwiKSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJvcGVyYXRvclwiKSxcblx0XHRcdFx0XHRcdHZhbHVlMTogZmlsdGVyLmdldFByb3BlcnR5KFwidmFsdWUxXCIpLFxuXHRcdFx0XHRcdFx0dmFsdWUyOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJ2YWx1ZTJcIilcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1BhdGggPSBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly9GaWx0ZXIgZm9yIGZpbHRlcmluZyBvdXQgb25seSB2YWxpZGF0aW9uIG1lc3NhZ2VzIHdoaWNoIGFyZSBjdXJyZW50bHkgcHJlc2VudCBpbiB0aGUgdmlld1xuXHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzID0gbmV3IEZpbHRlcih7XG5cdFx0XHRcdGZpbHRlcnM6IFtcblx0XHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwidmFsaWRhdGlvblwiLFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiB0cnVlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Z2V0Q2hlY2tDb250cm9sSW5WaWV3RmlsdGVyKClcblx0XHRcdFx0XSxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblx0XHRcdC8vRmlsdGVyIGZvciBmaWx0ZXJpbmcgb3V0IHRoZSBib3VuZCBtZXNzYWdlcyBpLmUgdGFyZ2V0IHN0YXJ0cyB3aXRoIHRoZSBjb250ZXh0IHBhdGhcblx0XHRcdG9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbXG5cdFx0XHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzLFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogXCJ0YXJnZXRcIixcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5TdGFydHNXaXRoLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzUGF0aFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0b0RpYWxvZ0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbZmlsdGVyT3V0TWVzc2FnZXNJbkRpYWxvZygpXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnMgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsIG9EaWFsb2dGaWx0ZXJdLFxuXHRcdFx0YW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0Ly8gYW5kIGZpbmFsbHkgLSBpZiB0aGVyZSBhbnkgLSBhZGQgY3VzdG9tIGZpbHRlciAodmlhIE9SKVxuXHRcdGlmIChhVXNlckRlZmluZWRGaWx0ZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlcnMgPSBuZXcgKEZpbHRlciBhcyBhbnkpKHtcblx0XHRcdFx0ZmlsdGVyczogW2FVc2VyRGVmaW5lZEZpbHRlciwgb1ZhbGlkYXRpb25Db250ZXh0RGlhbG9nRmlsdGVyc10sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmlsdGVycyA9IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmZpbHRlcihvRmlsdGVycyk7XG5cdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXQodGhpcywgdGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0Ly8gV2Ugc3VwcG9ydCBzb3J0aW5nIG9ubHkgZm9yIE9iamVjdFBhZ2VMYXlvdXQgdXNlLWNhc2UuXG5cdFx0aWYgKHRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdG9Tb3J0ZXIgPSBuZXcgKFNvcnRlciBhcyBhbnkpKFwiXCIsIG51bGwsIG51bGwsIChvYmoxOiBhbnksIG9iajI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIW9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucykge1xuXHRcdFx0XHRcdG9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyA9IHRoaXMub09iamVjdFBhZ2VMYXlvdXQgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRTZWN0aW9ucygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJhbmtBID0gdGhpcy5fZ2V0TWVzc2FnZVJhbmsob2JqMSwgb2JqZWN0UGFnZUxheW91dFNlY3Rpb25zKTtcblx0XHRcdFx0Y29uc3QgcmFua0IgPSB0aGlzLl9nZXRNZXNzYWdlUmFuayhvYmoyLCBvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnMpO1xuXHRcdFx0XHRpZiAocmFua0EgPCByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmFua0EgPiByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLm9JdGVtQmluZGluZy5zb3J0KG9Tb3J0ZXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbnRyb2xJZFxuXHQgKiBAcGFyYW0gb0l0ZW1cblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBJRCBtYXRjaGVzIHRoZSBpdGVtIElEXG5cdCAqL1xuXHRfZm5GaWx0ZXJVcG9uSWQoc0NvbnRyb2xJZDogc3RyaW5nLCBvSXRlbTogYW55KSB7XG5cdFx0cmV0dXJuIHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9uIGJhc2VkIG9uIHNlY3Rpb24gdGl0bGUgYW5kIHZpc2liaWxpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHJldHVybnMgVGhlIHNlY3Rpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRTZWN0aW9uQnlTZWN0aW9uVGl0bGUob09iamVjdFBhZ2U6IGFueSwgc1NlY3Rpb25UaXRsZTogc3RyaW5nKSB7XG5cdFx0bGV0IG9TZWN0aW9uO1xuXHRcdGlmIChzU2VjdGlvblRpdGxlKSB7XG5cdFx0XHRjb25zdCBhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFTZWN0aW9uc1tpXS5nZXRWaXNpYmxlKCkgJiYgYVNlY3Rpb25zW2ldLmdldFRpdGxlKCkgPT09IHNTZWN0aW9uVGl0bGUpIHtcblx0XHRcdFx0XHRvU2VjdGlvbiA9IGFTZWN0aW9uc1tpXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1NlY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIHRoZSBzZWN0aW9uIGlmIHRoZSBvYmplY3QgcGFnZSB1c2VzIGFuIEljb25UYWJCYXIgYW5kIGlmIHRoZSBjdXJyZW50IHNlY3Rpb24gaXMgbm90IHRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZShvT2JqZWN0UGFnZTogYW55LCBzU2VjdGlvblRpdGxlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBiVXNlSWNvblRhYkJhciA9IG9PYmplY3RQYWdlLmdldFVzZUljb25UYWJCYXIoKTtcblx0XHRpZiAoYlVzZUljb25UYWJCYXIpIHtcblx0XHRcdGNvbnN0IG9TZWN0aW9uID0gdGhpcy5fZ2V0U2VjdGlvbkJ5U2VjdGlvblRpdGxlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdGNvbnN0IHNTZWxlY3RlZFNlY3Rpb25JZCA9IG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpO1xuXHRcdFx0aWYgKG9TZWN0aW9uICYmIHNTZWxlY3RlZFNlY3Rpb25JZCAhPT0gb1NlY3Rpb24uZ2V0SWQoKSkge1xuXHRcdFx0XHRvT2JqZWN0UGFnZS5zZXRTZWxlY3RlZFNlY3Rpb24ob1NlY3Rpb24uZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUob1RhYmxlOiBhbnksIG9PYmplY3RQYWdlOiBhbnksIHNTZWN0aW9uVGl0bGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRjb25zdCBvVGFibGVDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb09QQ29udGV4dCA9IG9PYmplY3RQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2ggPSAhKG9UYWJsZUNvbnRleHQgPT09IG9PUENvbnRleHQpO1xuXHRcdHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uKSB7XG5cdFx0XHRpZiAoYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2gpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgTWRjVGFibGUgaWYgaXQgaXMgZm91bmQgYW1vbmcgYW55IG9mIHRoZSBwYXJlbnQgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIE1EQyB0YWJsZSB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRNZGNUYWJsZShvRWxlbWVudDogYW55KSB7XG5cdFx0Ly9jaGVjayBpZiB0aGUgZWxlbWVudCBoYXMgYSB0YWJsZSB3aXRoaW4gYW55IG9mIGl0cyBwYXJlbnRzXG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKG9QYXJlbnRFbGVtZW50ICYmICFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRvUGFyZW50RWxlbWVudCA9IG9QYXJlbnRFbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmVudEVsZW1lbnQgJiYgb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSA/IG9QYXJlbnRFbGVtZW50IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldEdyaWRUYWJsZShvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikgJiZcblx0XHRcdFx0LyoqIFdlIGNoZWNrIHRoZSBlbGVtZW50IGJlbG9uZ3MgdG8gdGhlIE1kY1RhYmxlIDoqL1xuXHRcdFx0XHRvRWxlbS5nZXRQYXJlbnQoKSA9PT0gb01kY1RhYmxlXG5cdFx0XHQpO1xuXHRcdH0pWzBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdGFibGUgcm93IChpZiBhdmFpbGFibGUpIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIFRhYmxlIHJvdyB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZVJvdyhvRWxlbWVudDogYW55KSB7XG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKFxuXHRcdFx0b1BhcmVudEVsZW1lbnQgJiZcblx0XHRcdCFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKVxuXHRcdCkge1xuXHRcdFx0b1BhcmVudEVsZW1lbnQgPSBvUGFyZW50RWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJlbnRFbGVtZW50ICYmXG5cdFx0XHQob1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSB8fFxuXHRcdFx0XHRvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIikgfHxcblx0XHRcdFx0b1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSlcblx0XHRcdD8gb1BhcmVudEVsZW1lbnRcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIHRhYmxlIHJvdyBjb250YWluaW5nIHRoZSBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VsZW1lbnQgQ29udHJvbFxuXHQgKiBAcmV0dXJucyBSb3cgaW5kZXggfHwgdW5kZWZpbmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0VGFibGVSb3dJbmRleChvRWxlbWVudDogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlUm93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpUm93SW5kZXg7XG5cdFx0aWYgKG9UYWJsZVJvdy5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpKSB7XG5cdFx0XHRpUm93SW5kZXggPSBvVGFibGVSb3cuZ2V0SW5kZXgoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aVJvd0luZGV4ID0gb1RhYmxlUm93XG5cdFx0XHRcdC5nZXRUYWJsZSgpXG5cdFx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKGVsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBlbGVtZW50LmdldElkKCkgPT09IG9UYWJsZVJvdy5nZXRJZCgpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGlSb3dJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSB0YWJsZSBjb2x1bW4gY29udGFpbmluZyB0aGUgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIG9FbGVtZW50IENvbnRyb2xcblx0ICogQHJldHVybnMgQ29sdW1uIGluZGV4IHx8IHVuZGVmaW5lZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhYmxlQ29sdW1uSW5kZXgob0VsZW1lbnQ6IGFueSkge1xuXHRcdGNvbnN0IGdldFRhcmdldENlbGxJbmRleCA9IGZ1bmN0aW9uIChlbGVtZW50OiBhbnksIG9UYXJnZXRSb3c6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKG9DZWxsOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9DZWxsLmdldElkKCkgPT09IGVsZW1lbnQuZ2V0SWQoKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Y29uc3QgZ2V0VGFyZ2V0Q29sdW1uSW5kZXggPSBmdW5jdGlvbiAoZWxlbWVudDogYW55LCBvVGFyZ2V0Um93OiBhbnkpIHtcblx0XHRcdGxldCBvVGFyZ2V0RWxlbWVudCA9IGVsZW1lbnQuZ2V0UGFyZW50KCksXG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0d2hpbGUgKG9UYXJnZXRFbGVtZW50ICYmIGlUYXJnZXRDZWxsSW5kZXggPCAwKSB7XG5cdFx0XHRcdG9UYXJnZXRFbGVtZW50ID0gb1RhcmdldEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlUYXJnZXRDZWxsSW5kZXg7XG5cdFx0fTtcblx0XHRjb25zdCBvVGFyZ2V0Um93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpVGFyZ2V0Q29sdW1uSW5kZXg7XG5cdFx0aVRhcmdldENvbHVtbkluZGV4ID0gZ2V0VGFyZ2V0Q29sdW1uSW5kZXgob0VsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdGlmIChvVGFyZ2V0Um93LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSkge1xuXHRcdFx0Y29uc3Qgc1RhcmdldENlbGxJZCA9IG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKVtpVGFyZ2V0Q29sdW1uSW5kZXhdLmdldElkKCksXG5cdFx0XHRcdGFUYWJsZUNvbHVtbnMgPSBvVGFyZ2V0Um93LmdldFRhYmxlKCkuZ2V0Q29sdW1ucygpO1xuXHRcdFx0aVRhcmdldENvbHVtbkluZGV4ID0gYVRhYmxlQ29sdW1ucy5maW5kSW5kZXgoZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0XHRcdGlmIChjb2x1bW4uZ2V0Q3JlYXRpb25UZW1wbGF0ZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNUYXJnZXRDZWxsSWQuc2VhcmNoKGNvbHVtbi5nZXRDcmVhdGlvblRlbXBsYXRlKCkuZ2V0SWQoKSkgPiAtMSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gaVRhcmdldENvbHVtbkluZGV4O1xuXHR9XG5cblx0X2dldE1kY1RhYmxlUm93cyhvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHRcdC8qKiBXZSBjaGVjayB0aGUgZWxlbWVudCBiZWxvbmdzIHRvIHRoZSBNZGMgVGFibGUgOiovXG5cdFx0XHRcdG9FbGVtLmdldFRhYmxlKCkuZ2V0UGFyZW50KCkgPT09IG9NZGNUYWJsZVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXG5cdF9nZXRPYmplY3RQYWdlTGF5b3V0KG9FbGVtZW50OiBhbnksIG9PYmplY3RQYWdlTGF5b3V0OiBhbnkpIHtcblx0XHRpZiAob09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybiBvT2JqZWN0UGFnZUxheW91dDtcblx0XHR9XG5cdFx0b09iamVjdFBhZ2VMYXlvdXQgPSBvRWxlbWVudDtcblx0XHQvL0l0ZXJhdGUgb3ZlciBwYXJlbnQgdGlsbCB5b3UgaGF2ZSBub3QgcmVhY2hlZCB0aGUgb2JqZWN0IHBhZ2UgbGF5b3V0XG5cdFx0d2hpbGUgKG9PYmplY3RQYWdlTGF5b3V0ICYmICFvT2JqZWN0UGFnZUxheW91dC5pc0EoXCJzYXAudXhhcC5PYmplY3RQYWdlTGF5b3V0XCIpKSB7XG5cdFx0XHRvT2JqZWN0UGFnZUxheW91dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb09iamVjdFBhZ2VMYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB0byBjaGVjayBpZiBhIG5hdmlnYXRpb24gaXMgY29uZmlndXJlZCBmcm9tIHRoZSB0YWJsZSB0byBhIHN1YiBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHRhYmxlIE1kY1RhYmxlXG5cdCAqIEByZXR1cm5zIEVpdGhlciB0cnVlIG9yIGZhbHNlXG5cdCAqL1xuXHRfbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFibGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdC8vIFRPRE86IHRoaXMgbG9naWMgd291bGQgYmUgbW92ZWQgdG8gY2hlY2sgdGhlIHNhbWUgYXQgdGhlIHRlbXBsYXRlIHRpbWUgdG8gYXZvaWQgdGhlIHNhbWUgY2hlY2sgaGFwcGVuaW5nIG11bHRpcGxlIHRpbWVzLlxuXHRcdGNvbnN0IGNvbXBvbmVudCA9IHNhcC51aS5yZXF1aXJlKFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCIpLFxuXHRcdFx0bmF2T2JqZWN0ID0gdGFibGUgJiYgY29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRhYmxlKSAmJiBjb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGFibGUpLmdldE5hdmlnYXRpb24oKTtcblx0XHRsZXQgc3ViT1BDb25maWd1cmVkID0gZmFsc2UsXG5cdFx0XHRuYXZDb25maWd1cmVkID0gZmFsc2U7XG5cdFx0aWYgKG5hdk9iamVjdCAmJiBPYmplY3Qua2V5cyhuYXZPYmplY3QpLmluZGV4T2YodGFibGUuZ2V0Um93QmluZGluZygpLnNQYXRoKSAhPT0gLTEpIHtcblx0XHRcdHN1Yk9QQ29uZmlndXJlZCA9XG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXSAmJlxuXHRcdFx0XHRuYXZPYmplY3RbdGFibGU/LmdldFJvd0JpbmRpbmcoKS5zUGF0aF0uZGV0YWlsICYmXG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXS5kZXRhaWwucm91dGVcblx0XHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH1cblx0XHRuYXZDb25maWd1cmVkID1cblx0XHRcdHN1Yk9QQ29uZmlndXJlZCAmJlxuXHRcdFx0dGFibGU/LmdldFJvd1NldHRpbmdzKCkuZ2V0Um93QWN0aW9ucygpICYmXG5cdFx0XHR0YWJsZT8uZ2V0Um93U2V0dGluZ3MoKS5nZXRSb3dBY3Rpb25zKClbMF0ubVByb3BlcnRpZXMudHlwZS5pbmRleE9mKFwiTmF2aWdhdGlvblwiKSAhPT0gLTE7XG5cdFx0cmV0dXJuIG5hdkNvbmZpZ3VyZWQ7XG5cdH1cblxuXHRzZXRGb2N1c1RvQ29udHJvbChjb250cm9sPzogVUk1RWxlbWVudCkge1xuXHRcdGNvbnN0IG1lc3NhZ2VQb3BvdmVyID0gdGhpcy5vTWVzc2FnZVBvcG92ZXI7XG5cdFx0aWYgKG1lc3NhZ2VQb3BvdmVyICYmIGNvbnRyb2wgJiYgY29udHJvbC5mb2N1cykge1xuXHRcdFx0Y29uc3QgZm5Gb2N1cyA9ICgpID0+IHtcblx0XHRcdFx0Y29udHJvbC5mb2N1cygpO1xuXHRcdFx0fTtcblx0XHRcdGlmICghbWVzc2FnZVBvcG92ZXIuaXNPcGVuKCkpIHtcblx0XHRcdFx0Ly8gd2hlbiBuYXZpZ2F0aW5nIHRvIHBhcmVudCBwYWdlIHRvIGNoaWxkIHBhZ2UgKG9uIGNsaWNrIG9mIG1lc3NhZ2UpLCB0aGUgY2hpbGQgcGFnZSBtaWdodCBoYXZlIGEgZm9jdXMgbG9naWMgdGhhdCBtaWdodCB1c2UgYSB0aW1lb3V0LlxuXHRcdFx0XHQvLyB3ZSB1c2UgdGhlIGJlbG93IHRpbWVvdXRzIHRvIG92ZXJyaWRlIHRoaXMgZm9jdXMgc28gdGhhdCB3ZSBmb2N1cyBvbiB0aGUgdGFyZ2V0IGNvbnRyb2wgb2YgdGhlIG1lc3NhZ2UgaW4gdGhlIGNoaWxkIHBhZ2UuXG5cdFx0XHRcdHNldFRpbWVvdXQoZm5Gb2N1cywgMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbk9uQ2xvc2UgPSAoKSA9PiB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmbkZvY3VzLCAwKTtcblx0XHRcdFx0XHRtZXNzYWdlUG9wb3Zlci5kZXRhY2hFdmVudChcImFmdGVyQ2xvc2VcIiwgZm5PbkNsb3NlKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0bWVzc2FnZVBvcG92ZXIuYXR0YWNoRXZlbnQoXCJhZnRlckNsb3NlXCIsIGZuT25DbG9zZSk7XG5cdFx0XHRcdG1lc3NhZ2VQb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiRkUgVjQgOiBNZXNzYWdlQnV0dG9uIDogZWxlbWVudCBkb2Vzbid0IGhhdmUgZm9jdXMgbWV0aG9kIGZvciBmb2N1c2luZy5cIik7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCdXR0b247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O01BOENNQSxhQUFhLFdBRGxCQyxjQUFjLENBQUMsc0NBQXNDLENBQUMsVUFRckRDLFdBQVcsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0NBQXNDO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFlBQVksRUFBRTtFQUFlLENBQUMsQ0FBQyxVQUczR0MsS0FBSyxFQUFFO0lBQUE7SUFUUix1QkFBWUMsRUFBb0MsRUFBRUMsUUFBaUMsRUFBRTtNQUFBO01BQ3BGO01BQ0E7TUFDQSwyQkFBTUQsRUFBRSxFQUFFQyxRQUFRLENBQUM7TUFBQztNQUFBO01BQUEsTUFlYkMsaUJBQWlCLEdBQUcsRUFBRTtNQUFBLE1BSXRCQyxPQUFPLEdBQUcsRUFBRTtNQUFBLE1BRVpDLGVBQWUsR0FBRyxFQUFFO01BQUE7SUFwQjVCO0lBQUM7SUFBQSxPQXNCREMsSUFBSSxHQUFKLGdCQUFPO01BQ05DLE1BQU0sQ0FBQ0MsU0FBUyxDQUFDRixJQUFJLENBQUNHLEtBQUssQ0FBQyxJQUFJLENBQUM7TUFDakM7TUFDQSxJQUFJLENBQUNDLFdBQVcsQ0FB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