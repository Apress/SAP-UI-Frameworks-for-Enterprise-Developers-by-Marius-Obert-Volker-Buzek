/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/NotApplicableContextDialog", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/PasteHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/table/Utils", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/message/Message", "../MacroAPI"], function (Log, CommonUtils, NotApplicableContextDialog, NavigationReason, ManifestSettings, MetaModelConverter, ClassSupport, PasteHelper, ResourceModelHelper, FilterUtils, TableUtils, MessageBox, Core, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  var convertTypes = MetaModelConverter.convertTypes;
  var CreationMode = ManifestSettings.CreationMode;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a table based on the metadata provided by OData V4.
   * <br>
   * Usually, a LineItem or PresentationVariant annotation is expected, but the Table building block can also be used to display an EntitySet.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table id="MyTable" metaPath="@com.sap.vocabularies.UI.v1.LineItem" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Table
   * @public
   */
  let TableAPI = (_dec = defineUI5Class("sap.fe.macros.table.TableAPI"), _dec2 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]
  }), _dec3 = property({
    type: "object"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "boolean"
  }), _dec6 = property({
    type: "string"
  }), _dec7 = property({
    type: "boolean",
    defaultValue: false
  }), _dec8 = property({
    type: "string",
    defaultValue: "ResponsiveTable",
    allowedValues: ["GridTable", "ResponsiveTable"]
  }), _dec9 = property({
    type: "boolean",
    defaultValue: true
  }), _dec10 = property({
    type: "boolean",
    defaultValue: false
  }), _dec11 = property({
    type: "boolean",
    defaultValue: false
  }), _dec12 = property({
    type: "string"
  }), _dec13 = property({
    type: "string",
    allowedValues: ["None", "Single", "Multi", "Auto"]
  }), _dec14 = property({
    type: "string"
  }), _dec15 = property({
    type: "boolean",
    defaultValue: true
  }), _dec16 = property({
    type: "boolean",
    defaultValue: false
  }), _dec17 = property({
    type: "boolean",
    defaultValue: true
  }), _dec18 = aggregation({
    type: "sap.fe.macros.table.Action"
  }), _dec19 = aggregation({
    type: "sap.fe.macros.table.Column"
  }), _dec20 = property({
    type: "boolean",
    defaultValue: false
  }), _dec21 = property({
    type: "boolean",
    defaultValue: false
  }), _dec22 = property({
    type: "boolean",
    defaultValue: false
  }), _dec23 = property({
    type: "boolean",
    defaultValue: false
  }), _dec24 = property({
    type: "boolean",
    defaultValue: false
  }), _dec25 = event(), _dec26 = event(), _dec27 = event(), _dec28 = property({
    type: "boolean | string",
    defaultValue: true
  }), _dec29 = property({
    type: "string",
    allowedValues: ["Control"]
  }), _dec30 = property({
    type: "string"
  }), _dec31 = property({
    type: "boolean",
    defaultValue: true
  }), _dec32 = event(), _dec33 = xmlEventHandler(), _dec34 = xmlEventHandler(), _dec35 = xmlEventHandler(), _dec36 = xmlEventHandler(), _dec37 = xmlEventHandler(), _dec38 = xmlEventHandler(), _dec39 = xmlEventHandler(), _dec40 = xmlEventHandler(), _dec41 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(TableAPI, _MacroAPI);
    function TableAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _MacroAPI.call(this, mSettings, ...others) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entityTypeFullyQualifiedName", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isOptimizedForSmallDevice", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columns", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataInitialized", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingSuspended", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outDatedBinding", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pendingRequest", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "emptyRowsEnabled", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor30, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor31, _assertThisInitialized(_this));
      _this.updateFilterBar();
      if (_this.content) {
        _this.content.attachEvent("selectionChange", {}, _this.onTableSelectionChange, _assertThisInitialized(_this));
      }
      return _this;
    }

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */
    var _proto = TableAPI.prototype;
    /**
     * Gets contexts from the table that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */
    _proto.getSelectedContexts = function getSelectedContexts() {
      return this.content.getSelectedContexts();
    }

    /**
     * Adds a message to the table.
     *
     * The message applies to the whole table and not to an individual table row.
     *
     * @param [parameters] The parameters to create the message
     * @param parameters.type Message type
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The ID of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this._getMessageManager();
      const oTable = this.content;
      const oMessage = new Message({
        target: oTable.getRowBinding().getResolvedPath(),
        type: parameters.type,
        message: parameters.message,
        processor: oTable.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the table.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this._getMessageManager();
      const messages = msgManager.getMessageModel().getData();
      const result = messages.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto._getMessageManager = function _getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    }

    /**
     * An event triggered when the selection in the table changes.
     *
     * @public
     */;
    _proto._getRowBinding = function _getRowBinding() {
      const oTable = this.getContent();
      return oTable.getRowBinding();
    };
    _proto.getCounts = function getCounts() {
      const oTable = this.getContent();
      return TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
        batchGroupId: !this.getProperty("bindingSuspended") ? oTable.data("batchGroupId") : "$auto",
        additionalFilters: TableUtils.getHiddenFilters(oTable)
      }).then(iValue => {
        return TableUtils.getCountFormatted(iValue);
      }).catch(() => {
        return "0";
      });
    };
    _proto.onTableRowPress = function onTableRowPress(oEvent, oController, oContext, mParameters) {
      // prevent navigation to an empty row
      if (oContext && oContext.isInactive() && oContext.isTransient()) {
        return false;
      }
      // In the case of an analytical table, if we're trying to navigate to a context corresponding to a visual group or grand total
      // --> Cancel navigation
      if (this.getTableDefinition().enableAnalytics && oContext && oContext.isA("sap.ui.model.odata.v4.Context") && typeof oContext.getProperty("@$ui5.node.isExpanded") === "boolean") {
        return false;
      } else {
        const navigationParameters = Object.assign({}, mParameters, {
          reason: NavigationReason.RowPress
        });
        oController._routing.navigateForwardToContext(oContext, navigationParameters);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      if (oEvent.getParameter("error")) {
        this.getController().messageHandler.showMessageDialog();
      }
    };
    _proto.onInternalDataRequested = function onInternalDataRequested(oEvent) {
      this.setProperty("dataInitialized", true);
      this.fireEvent("internalDataRequested", oEvent.getParameters());
    };
    _proto.onPaste = function onPaste(oEvent, oController) {
      // If paste is disable or if we're not in edit mode, we can't paste anything
      if (!this.tableDefinition.control.enablePaste || !this.getModel("ui").getProperty("/isEditable")) {
        return;
      }
      const aRawPastedData = oEvent.getParameter("data"),
        oTable = oEvent.getSource();
      if (oTable.getEnablePaste() === true) {
        PasteHelper.pasteData(aRawPastedData, oTable, oController);
      } else {
        const oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
        MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
          title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
        });
      }
    }

    // This event will allow us to intercept the export before is triggered to cover specific cases
    // that couldn't be addressed on the propertyInfos for each column.
    // e.g. Fixed Target Value for the datapoints
    ;
    _proto.onBeforeExport = function onBeforeExport(exportEvent) {
      const isSplitMode = exportEvent.getParameter("userExportSettings").splitCells,
        tableController = exportEvent.getSource(),
        exportSettings = exportEvent.getParameter("exportSettings"),
        tableDefinition = this.getTableDefinition();
      TableAPI.updateExportSettings(exportSettings, tableDefinition, tableController, isSplitMode);
    }

    /**
     * Handles the MDC DataStateIndicator plugin to display messageStrip on a table.
     *
     * @param oMessage
     * @param oTable
     * @name dataStateFilter
     * @returns Whether to render the messageStrip visible
     */;
    TableAPI.dataStateIndicatorFilter = function dataStateIndicatorFilter(oMessage, oTable) {
      var _oTable$getBindingCon;
      const sTableContextBindingPath = (_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath();
      const sTableRowBinding = (sTableContextBindingPath ? `${sTableContextBindingPath}/` : "") + oTable.getRowBinding().getPath();
      return sTableRowBinding === oMessage.getTarget() ? true : false;
    }

    /**
     * This event handles the DataState of the DataStateIndicator plugin from MDC on a table.
     * It's fired when new error messages are sent from the backend to update row highlighting.
     *
     * @name onDataStateChange
     * @param oEvent Event object
     */;
    _proto.onDataStateChange = function onDataStateChange(oEvent) {
      const oDataStateIndicator = oEvent.getSource();
      const aFilteredMessages = oEvent.getParameter("filteredMessages");
      if (aFilteredMessages) {
        const oInternalModel = oDataStateIndicator.getModel("internal");
        oInternalModel.setProperty("filteredMessages", aFilteredMessages, oDataStateIndicator.getBindingContext("internal"));
      }
    }

    /**
     * Updates the columns to be exported of a table.
     *
     * @param exportSettings The table export settings
     * @param tableDefinition The table definition from the table converter
     * @param tableController The table controller
     * @param isSplitMode Defines if the export has been launched using split mode
     * @returns The updated columns to be exported
     */;
    TableAPI.updateExportSettings = function updateExportSettings(exportSettings, tableDefinition, tableController, isSplitMode) {
      //Set static sizeLimit during export
      const columns = tableDefinition.columns;
      if (!tableDefinition.enableAnalytics && (tableDefinition.control.type === "ResponsiveTable" || tableDefinition.control.type === "GridTable")) {
        exportSettings.dataSource.sizeLimit = 1000;
      }
      const exportColumns = exportSettings.workbook.columns;
      for (let index = exportColumns.length - 1; index >= 0; index--) {
        const exportColumn = exportColumns[index];
        const resourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
        exportColumn.label = getLocalizedText(exportColumn.label, tableController);
        //translate boolean values
        if (exportColumn.type === "Boolean") {
          exportColumn.falseValue = resourceBundle.getText("no");
          exportColumn.trueValue = resourceBundle.getText("yes");
        }
        const targetValueColumn = columns === null || columns === void 0 ? void 0 : columns.find(column => {
          if (isSplitMode) {
            return this.columnWithTargetValueToBeAdded(column, exportColumn);
          } else {
            return false;
          }
        });
        if (targetValueColumn) {
          const columnToBeAdded = {
            label: resourceBundle.getText("TargetValue"),
            property: Array.isArray(exportColumn.property) ? exportColumn.property : [exportColumn.property],
            template: targetValueColumn.exportDataPointTargetValue
          };
          exportColumns.splice(index + 1, 0, columnToBeAdded);
        }
      }
      return exportSettings;
    }

    /**
     * Defines if a column that is to be exported and contains a DataPoint with a fixed target value needs to be added.
     *
     * @param column The column from the annotations column
     * @param columnExport The column to be exported
     * @returns `true` if the referenced column has defined a targetValue for the dataPoint, false else
     * @private
     */;
    TableAPI.columnWithTargetValueToBeAdded = function columnWithTargetValueToBeAdded(column, columnExport) {
      var _column$propertyInfos;
      let columnNeedsToBeAdded = false;
      if (column.exportDataPointTargetValue && ((_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.length) === 1) {
        //Add TargetValue column when exporting on split mode
        if (column.relativePath === columnExport.property || columnExport.property[0] === column.propertyInfos[0] || columnExport.property.includes(column.relativePath) || columnExport.property.includes(column.name)) {
          // part of a FieldGroup or from a lineItem or from a column on the entitySet
          delete columnExport.template;
          columnNeedsToBeAdded = true;
        }
      }
      return columnNeedsToBeAdded;
    };
    _proto.resumeBinding = function resumeBinding(bRequestIfNotInitialized) {
      this.setProperty("bindingSuspended", false);
      if (bRequestIfNotInitialized && !this.getDataInitialized() || this.getProperty("outDatedBinding")) {
        var _getContent;
        this.setProperty("outDatedBinding", false);
        (_getContent = this.getContent()) === null || _getContent === void 0 ? void 0 : _getContent.rebind();
      }
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      const oTable = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oTable);
    };
    _proto.suspendBinding = function suspendBinding() {
      this.setProperty("bindingSuspended", true);
    };
    _proto.invalidateContent = function invalidateContent() {
      this.setProperty("dataInitialized", false);
      this.setProperty("outDatedBinding", false);
    };
    _proto.onMassEditButtonPressed = function onMassEditButtonPressed(oEvent, pageController) {
      const oTable = this.content;
      if (pageController && pageController.massEdit) {
        pageController.massEdit.openMassEditDialog(oTable);
      } else {
        Log.warning("The Controller is not enhanced with Mass Edit functionality");
      }
    };
    _proto.onTableSelectionChange = function onTableSelectionChange(oEvent) {
      this.fireEvent("selectionChange", oEvent.getParameters());
    };
    _proto.onActionPress = async function onActionPress(oEvent, pageController, actionName, parameters) {
      parameters.model = oEvent.getSource().getModel();
      let executeAction = true;
      if (parameters.notApplicableContexts && parameters.notApplicableContexts.length > 0) {
        // If we have non applicable contexts, we need to open a dialog to ask the user if he wants to continue
        const convertedMetadata = convertTypes(parameters.model.getMetaModel());
        const entityType = convertedMetadata.resolvePath(this.entityTypeFullyQualifiedName, true).target;
        const myUnapplicableContextDialog = new NotApplicableContextDialog({
          entityType: entityType,
          notApplicableContexts: parameters.notApplicableContexts,
          title: parameters.label,
          resourceModel: getResourceModel(this)
        });
        parameters.contexts = parameters.applicableContexts;
        executeAction = await myUnapplicableContextDialog.open(this);
      }
      if (executeAction) {
        // Direct execution of the action
        try {
          return await pageController.editFlow.invokeAction(actionName, parameters);
        } catch (e) {
          Log.info(e);
        }
      }
    }

    /**
     * Expose the internal table definition for external usage in delegate.
     *
     * @returns The tableDefinition
     */;
    _proto.getTableDefinition = function getTableDefinition() {
      return this.tableDefinition;
    }

    /**
     * connect the filter to the tableAPI if required
     *
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto.updateFilterBar = function updateFilterBar() {
      const table = this.getContent();
      const filterBarRefId = this.getFilterBar();
      if (table && filterBarRefId && table.getFilter() !== filterBarRefId) {
        this._setFilterBar(filterBarRefId);
      }
    }

    /**
     * Sets the filter depending on the type of filterBar.
     *
     * @param filterBarRefId Id of the filter bar
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto._setFilterBar = function _setFilterBar(filterBarRefId) {
      var _CommonUtils$getTarge;
      const table = this.getContent();

      // 'filterBar' property of macro:Table(passed as customData) might be
      // 1. A localId wrt View(FPM explorer example).
      // 2. Absolute Id(this was not supported in older versions).
      // 3. A localId wrt FragmentId(when an XMLComposite or Fragment is independently processed) instead of ViewId.
      //    'filterBar' was supported earlier as an 'association' to the 'mdc:Table' control inside 'macro:Table' in prior versions.
      //    In newer versions 'filterBar' is used like an association to 'macro:TableAPI'.
      //    This means that the Id is relative to 'macro:TableAPI'.
      //    This scenario happens in case of FilterBar and Table in a custom sections in OP of FEV4.

      const tableAPIId = this === null || this === void 0 ? void 0 : this.getId();
      const tableAPILocalId = this.data("tableAPILocalId");
      const potentialfilterBarId = tableAPILocalId && filterBarRefId && tableAPIId && tableAPIId.replace(new RegExp(tableAPILocalId + "$"), filterBarRefId); // 3

      const filterBar = ((_CommonUtils$getTarge = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge === void 0 ? void 0 : _CommonUtils$getTarge.byId(filterBarRefId)) || Core.byId(filterBarRefId) || Core.byId(potentialfilterBarId);
      if (filterBar) {
        if (filterBar.isA("sap.fe.macros.filterBar.FilterBarAPI")) {
          table.setFilter(`${filterBar.getId()}-content`);
        } else if (filterBar.isA("sap.ui.mdc.FilterBar")) {
          table.setFilter(filterBar.getId());
        }
      }
    };
    _proto.checkIfColumnExists = function checkIfColumnExists(aFilteredColummns, columnName) {
      return aFilteredColummns.some(function (oColumn) {
        if ((oColumn === null || oColumn === void 0 ? void 0 : oColumn.columnName) === columnName && oColumn !== null && oColumn !== void 0 && oColumn.sColumnNameVisible || (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) !== undefined && (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) === columnName) {
          return columnName;
        }
      });
    };
    _proto.getIdentifierColumn = function getIdentifierColumn() {
      const oTable = this.getContent();
      const headerInfoTitlePath = this.getTableDefinition().headerInfoTitle;
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath");
      const aTechnicalKeys = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/$Key`);
      const aFilteredTechnicalKeys = [];
      if (aTechnicalKeys && aTechnicalKeys.length > 0) {
        aTechnicalKeys.forEach(function (technicalKey) {
          if (technicalKey !== "IsActiveEntity") {
            aFilteredTechnicalKeys.push(technicalKey);
          }
        });
      }
      const semanticKeyColumns = this.getTableDefinition().semanticKeys;
      const aVisibleColumns = [];
      const aFilteredColummns = [];
      const aTableColumns = oTable.getColumns();
      aTableColumns.forEach(function (oColumn) {
        const column = oColumn === null || oColumn === void 0 ? void 0 : oColumn.getDataProperty();
        aVisibleColumns.push(column);
      });
      aVisibleColumns.forEach(function (oColumn) {
        var _oTextArrangement$Co, _oTextArrangement$Co2;
        const oTextArrangement = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/${oColumn}@`);
        const sTextArrangement = oTextArrangement && ((_oTextArrangement$Co = oTextArrangement["@com.sap.vocabularies.Common.v1.Text"]) === null || _oTextArrangement$Co === void 0 ? void 0 : _oTextArrangement$Co.$Path);
        const sTextPlacement = oTextArrangement && ((_oTextArrangement$Co2 = oTextArrangement["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) === null || _oTextArrangement$Co2 === void 0 ? void 0 : _oTextArrangement$Co2.$EnumMember);
        aFilteredColummns.push({
          columnName: oColumn,
          sTextArrangement: sTextArrangement,
          sColumnNameVisible: !(sTextPlacement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")
        });
      });
      let column;
      if (headerInfoTitlePath !== undefined && this.checkIfColumnExists(aFilteredColummns, headerInfoTitlePath)) {
        column = headerInfoTitlePath;
      } else if (semanticKeyColumns !== undefined && semanticKeyColumns.length === 1 && this.checkIfColumnExists(aFilteredColummns, semanticKeyColumns[0])) {
        column = semanticKeyColumns[0];
      } else if (aFilteredTechnicalKeys !== undefined && aFilteredTechnicalKeys.length === 1 && this.checkIfColumnExists(aFilteredColummns, aFilteredTechnicalKeys[0])) {
        column = aFilteredTechnicalKeys[0];
      }
      return column;
    }

    /**
     * EmptyRowsEnabled setter.
     *
     * @param enablement
     */;
    _proto.setEmptyRowsEnabled = function setEmptyRowsEnabled(enablement) {
      this.setProperty("emptyRowsEnabled", enablement);
      if (enablement) {
        this.setUpEmptyRows(this.content);
      } else {
        // creation is no longer possible we need to delete empty rows
        this.deleteEmptyRows(this.content);
      }
    };
    _proto.setUpEmptyRows = async function setUpEmptyRows(table) {
      var _this$tableDefinition, _this$tableDefinition2, _table$getBindingCont;
      let createButtonWasPressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (((_this$tableDefinition = this.tableDefinition.control) === null || _this$tableDefinition === void 0 ? void 0 : _this$tableDefinition.creationMode) !== CreationMode.InlineCreationRows) {
        return;
      }
      if ((_this$tableDefinition2 = this.tableDefinition.control) !== null && _this$tableDefinition2 !== void 0 && _this$tableDefinition2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode")) && !createButtonWasPressed) {
        return;
      }
      if (!this.emptyRowsEnabled) {
        return;
      }
      const waitTableRendered = new Promise(resolve => {
        if (table.getDomRef()) {
          resolve();
        } else {
          const delegate = {
            onAfterRendering: function () {
              table.removeEventDelegate(delegate);
              resolve();
            }
          };
          table.addEventDelegate(delegate, this);
        }
      });
      await waitTableRendered;
      const uiModel = table.getModel("ui");
      if (uiModel.getProperty("/isEditablePending")) {
        // The edit mode is still being computed, so we wait until this computation is done before checking its value
        const watchBinding = uiModel.bindProperty("/isEditablePending");
        await new Promise(resolve => {
          const fnHandler = () => {
            watchBinding.detachChange(fnHandler);
            watchBinding.destroy();
            resolve();
          };
          watchBinding.attachChange(fnHandler);
        });
      }
      const isInEditMode = uiModel.getProperty("/isEditable");
      if (!isInEditMode) {
        return;
      }
      const binding = table.getRowBinding();
      if (binding.isResolved() && binding.isLengthFinal()) {
        const contextPath = binding.getContext().getPath();
        const inactiveContext = binding.getAllCurrentContexts().find(function (context) {
          // when this is called from controller code we need to check that inactive contexts are still relative to the current table context
          return context.isInactive() && context.getPath().startsWith(contextPath);
        });
        if (!inactiveContext) {
          await this._createEmptyRow(binding, table);
        }
      }
    }

    /**
     * Deletes inactive rows from the table listBinding.
     *
     * @param table
     */;
    _proto.deleteEmptyRows = function deleteEmptyRows(table) {
      const binding = table.getRowBinding();
      if (binding !== null && binding !== void 0 && binding.isResolved() && binding !== null && binding !== void 0 && binding.isLengthFinal()) {
        const contextPath = binding.getContext().getPath();
        for (const context of binding.getAllCurrentContexts()) {
          if (context.isInactive() && context.getPath().startsWith(contextPath)) {
            context.delete();
          }
        }
      }
    };
    _proto._createEmptyRow = async function _createEmptyRow(oBinding, oTable) {
      var _this$tableDefinition3;
      const iInlineCreationRowCount = ((_this$tableDefinition3 = this.tableDefinition.control) === null || _this$tableDefinition3 === void 0 ? void 0 : _this$tableDefinition3.inlineCreationRowCount) || 2;
      const aData = [];
      for (let i = 0; i < iInlineCreationRowCount; i += 1) {
        aData.push({});
      }
      const bAtEnd = oTable.data("tableType") !== "ResponsiveTable";
      const bInactive = true;
      const oView = CommonUtils.getTargetView(oTable);
      const oController = oView.getController();
      const editFlow = oController.editFlow;
      if (!this.creatingEmptyRows) {
        this.creatingEmptyRows = true;
        try {
          const aContexts = await editFlow.createMultipleDocuments(oBinding, aData, bAtEnd, false, oController.editFlow.onBeforeCreate, bInactive);
          aContexts === null || aContexts === void 0 ? void 0 : aContexts.forEach(function (oContext) {
            oContext.created().catch(function (oError) {
              if (!oError.canceled) {
                throw oError;
              }
            });
          });
        } catch (e) {
          Log.error(e);
        } finally {
          this.creatingEmptyRows = false;
        }
      }
    };
    return TableAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "entityTypeFullyQualifiedName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "isOptimizedForSmallDevice", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "columns", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "dataInitialized", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "bindingSuspended", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "outDatedBinding", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "pendingRequest", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "emptyRowsEnabled", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec32], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onTableRowPress", [_dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableRowPress"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataReceived", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPaste", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "onPaste"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeExport", [_dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeExport"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataStateChange", [_dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataStateChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onMassEditButtonPressed", [_dec39], Object.getOwnPropertyDescriptor(_class2.prototype, "onMassEditButtonPressed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onTableSelectionChange", [_dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onActionPress", [_dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "onActionPress"), _class2.prototype)), _class2)) || _class);
  return TableAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZUFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRUeXBlcyIsImV4cGVjdGVkQW5ub3RhdGlvbnMiLCJkZWZhdWx0VmFsdWUiLCJhbGxvd2VkVmFsdWVzIiwiYWdncmVnYXRpb24iLCJldmVudCIsInhtbEV2ZW50SGFuZGxlciIsIm1TZXR0aW5ncyIsIm90aGVycyIsInVwZGF0ZUZpbHRlckJhciIsImNvbnRlbnQiLCJhdHRhY2hFdmVudCIsIm9uVGFibGVTZWxlY3Rpb25DaGFuZ2UiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiYWRkTWVzc2FnZSIsInBhcmFtZXRlcnMiLCJtc2dNYW5hZ2VyIiwiX2dldE1lc3NhZ2VNYW5hZ2VyIiwib1RhYmxlIiwib01lc3NhZ2UiLCJNZXNzYWdlIiwidGFyZ2V0IiwiZ2V0Um93QmluZGluZyIsImdldFJlc29sdmVkUGF0aCIsIm1lc3NhZ2UiLCJwcm9jZXNzb3IiLCJnZXRNb2RlbCIsImRlc2NyaXB0aW9uIiwicGVyc2lzdGVudCIsImFkZE1lc3NhZ2VzIiwiZ2V0SWQiLCJyZW1vdmVNZXNzYWdlIiwiaWQiLCJtZXNzYWdlcyIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJyZXN1bHQiLCJmaW5kIiwiZSIsInJlbW92ZU1lc3NhZ2VzIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJfZ2V0Um93QmluZGluZyIsImdldENvbnRlbnQiLCJnZXRDb3VudHMiLCJUYWJsZVV0aWxzIiwiZ2V0TGlzdEJpbmRpbmdGb3JDb3VudCIsImdldEJpbmRpbmdDb250ZXh0IiwiYmF0Y2hHcm91cElkIiwiZ2V0UHJvcGVydHkiLCJkYXRhIiwiYWRkaXRpb25hbEZpbHRlcnMiLCJnZXRIaWRkZW5GaWx0ZXJzIiwidGhlbiIsImlWYWx1ZSIsImdldENvdW50Rm9ybWF0dGVkIiwiY2F0Y2giLCJvblRhYmxlUm93UHJlc3MiLCJvRXZlbnQiLCJvQ29udHJvbGxlciIsIm9Db250ZXh0IiwibVBhcmFtZXRlcnMiLCJpc0luYWN0aXZlIiwiaXNUcmFuc2llbnQiLCJnZXRUYWJsZURlZmluaXRpb24iLCJlbmFibGVBbmFseXRpY3MiLCJpc0EiLCJuYXZpZ2F0aW9uUGFyYW1ldGVycyIsIk9iamVjdCIsImFzc2lnbiIsInJlYXNvbiIsIk5hdmlnYXRpb25SZWFzb24iLCJSb3dQcmVzcyIsIl9yb3V0aW5nIiwibmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0Iiwib25JbnRlcm5hbERhdGFSZWNlaXZlZCIsImdldFBhcmFtZXRlciIsImdldENvbnRyb2xsZXIiLCJtZXNzYWdlSGFuZGxlciIsInNob3dNZXNzYWdlRGlhbG9nIiwib25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQiLCJzZXRQcm9wZXJ0eSIsImZpcmVFdmVudCIsImdldFBhcmFtZXRlcnMiLCJvblBhc3RlIiwidGFibGVEZWZpbml0aW9uIiwiY29udHJvbCIsImVuYWJsZVBhc3RlIiwiYVJhd1Bhc3RlZERhdGEiLCJnZXRTb3VyY2UiLCJnZXRFbmFibGVQYXN0ZSIsIlBhc3RlSGVscGVyIiwicGFzdGVEYXRhIiwib1Jlc291cmNlTW9kZWwiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJNZXNzYWdlQm94IiwiZXJyb3IiLCJnZXRUZXh0IiwidGl0bGUiLCJvbkJlZm9yZUV4cG9ydCIsImV4cG9ydEV2ZW50IiwiaXNTcGxpdE1vZGUiLCJzcGxpdENlbGxzIiwidGFibGVDb250cm9sbGVyIiwiZXhwb3J0U2V0dGluZ3MiLCJ1cGRhdGVFeHBvcnRTZXR0aW5ncyIsImRhdGFTdGF0ZUluZGljYXRvckZpbHRlciIsInNUYWJsZUNvbnRleHRCaW5kaW5nUGF0aCIsImdldFBhdGgiLCJzVGFibGVSb3dCaW5kaW5nIiwiZ2V0VGFyZ2V0Iiwib25EYXRhU3RhdGVDaGFuZ2UiLCJvRGF0YVN0YXRlSW5kaWNhdG9yIiwiYUZpbHRlcmVkTWVzc2FnZXMiLCJvSW50ZXJuYWxNb2RlbCIsImNvbHVtbnMiLCJkYXRhU291cmNlIiwic2l6ZUxpbWl0IiwiZXhwb3J0Q29sdW1ucyIsIndvcmtib29rIiwiaW5kZXgiLCJsZW5ndGgiLCJleHBvcnRDb2x1bW4iLCJyZXNvdXJjZUJ1bmRsZSIsIkNvcmUiLCJsYWJlbCIsImdldExvY2FsaXplZFRleHQiLCJmYWxzZVZhbHVlIiwidHJ1ZVZhbHVlIiwidGFyZ2V0VmFsdWVDb2x1bW4iLCJjb2x1bW4iLCJjb2x1bW5XaXRoVGFyZ2V0VmFsdWVUb0JlQWRkZWQiLCJjb2x1bW5Ub0JlQWRkZWQiLCJBcnJheSIsImlzQXJyYXkiLCJ0ZW1wbGF0ZSIsImV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlIiwic3BsaWNlIiwiY29sdW1uRXhwb3J0IiwiY29sdW1uTmVlZHNUb0JlQWRkZWQiLCJwcm9wZXJ0eUluZm9zIiwicmVsYXRpdmVQYXRoIiwiaW5jbHVkZXMiLCJuYW1lIiwicmVzdW1lQmluZGluZyIsImJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCIsImdldERhdGFJbml0aWFsaXplZCIsInJlYmluZCIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwib0ZpbHRlckNvbnRyb2wiLCJGaWx0ZXJVdGlscyIsImdldE5vdEFwcGxpY2FibGVGaWx0ZXJzIiwic3VzcGVuZEJpbmRpbmciLCJpbnZhbGlkYXRlQ29udGVudCIsIm9uTWFzc0VkaXRCdXR0b25QcmVzc2VkIiwicGFnZUNvbnRyb2xsZXIiLCJtYXNzRWRpdCIsIm9wZW5NYXNzRWRpdERpYWxvZyIsIkxvZyIsIndhcm5pbmciLCJvbkFjdGlvblByZXNzIiwiYWN0aW9uTmFtZSIsIm1vZGVsIiwiZXhlY3V0ZUFjdGlvbiIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsImNvbnZlcnRlZE1ldGFkYXRhIiwiY29udmVydFR5cGVzIiwiZ2V0TWV0YU1vZGVsIiwiZW50aXR5VHlwZSIsInJlc29sdmVQYXRoIiwiZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSIsIm15VW5hcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsIk5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJjb250ZXh0cyIsImFwcGxpY2FibGVDb250ZXh0cyIsIm9wZW4iLCJlZGl0RmxvdyIsImludm9rZUFjdGlvbiIsImluZm8iLCJ0YWJsZSIsImZpbHRlckJhclJlZklkIiwiZ2V0RmlsdGVyQmFyIiwiZ2V0RmlsdGVyIiwiX3NldEZpbHRlckJhciIsInRhYmxlQVBJSWQiLCJ0YWJsZUFQSUxvY2FsSWQiLCJwb3RlbnRpYWxmaWx0ZXJCYXJJZCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXJCYXIiLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJieUlkIiwic2V0RmlsdGVyIiwiY2hlY2tJZkNvbHVtbkV4aXN0cyIsImFGaWx0ZXJlZENvbHVtbW5zIiwiY29sdW1uTmFtZSIsInNvbWUiLCJvQ29sdW1uIiwic0NvbHVtbk5hbWVWaXNpYmxlIiwic1RleHRBcnJhbmdlbWVudCIsInVuZGVmaW5lZCIsImdldElkZW50aWZpZXJDb2x1bW4iLCJoZWFkZXJJbmZvVGl0bGVQYXRoIiwiaGVhZGVySW5mb1RpdGxlIiwib01ldGFNb2RlbCIsInNDdXJyZW50RW50aXR5U2V0TmFtZSIsImFUZWNobmljYWxLZXlzIiwiZ2V0T2JqZWN0IiwiYUZpbHRlcmVkVGVjaG5pY2FsS2V5cyIsImZvckVhY2giLCJ0ZWNobmljYWxLZXkiLCJwdXNoIiwic2VtYW50aWNLZXlDb2x1bW5zIiwic2VtYW50aWNLZXlzIiwiYVZpc2libGVDb2x1bW5zIiwiYVRhYmxlQ29sdW1ucyIsImdldENvbHVtbnMiLCJnZXREYXRhUHJvcGVydHkiLCJvVGV4dEFycmFuZ2VtZW50IiwiJFBhdGgiLCJzVGV4dFBsYWNlbWVudCIsIiRFbnVtTWVtYmVyIiwic2V0RW1wdHlSb3dzRW5hYmxlZCIsImVuYWJsZW1lbnQiLCJzZXRVcEVtcHR5Um93cyIsImRlbGV0ZUVtcHR5Um93cyIsImNyZWF0ZUJ1dHRvbldhc1ByZXNzZWQiLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvbk1vZGUiLCJJbmxpbmVDcmVhdGlvblJvd3MiLCJpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIiwiZW1wdHlSb3dzRW5hYmxlZCIsIndhaXRUYWJsZVJlbmRlcmVkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXREb21SZWYiLCJkZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsInVpTW9kZWwiLCJ3YXRjaEJpbmRpbmciLCJiaW5kUHJvcGVydHkiLCJmbkhhbmRsZXIiLCJkZXRhY2hDaGFuZ2UiLCJkZXN0cm95IiwiYXR0YWNoQ2hhbmdlIiwiaXNJbkVkaXRNb2RlIiwiYmluZGluZyIsImlzUmVzb2x2ZWQiLCJpc0xlbmd0aEZpbmFsIiwiY29udGV4dFBhdGgiLCJnZXRDb250ZXh0IiwiaW5hY3RpdmVDb250ZXh0IiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiY29udGV4dCIsInN0YXJ0c1dpdGgiLCJfY3JlYXRlRW1wdHlSb3ciLCJkZWxldGUiLCJvQmluZGluZyIsImlJbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiaW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsImFEYXRhIiwiaSIsImJBdEVuZCIsImJJbmFjdGl2ZSIsIm9WaWV3IiwiY3JlYXRpbmdFbXB0eVJvd3MiLCJhQ29udGV4dHMiLCJjcmVhdGVNdWx0aXBsZURvY3VtZW50cyIsIm9uQmVmb3JlQ3JlYXRlIiwiY3JlYXRlZCIsIm9FcnJvciIsImNhbmNlbGVkIiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IE5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9Ob3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZ1wiO1xuaW1wb3J0IE5hdmlnYXRpb25SZWFzb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvTmF2aWdhdGlvblJlYXNvblwiO1xuaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIGNvbHVtbkV4cG9ydFNldHRpbmdzLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IENyZWF0aW9uTW9kZSwgSG9yaXpvbnRhbEFsaWduIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgY29udmVydFR5cGVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhc3RlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Bhc3RlSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRMb2NhbGl6ZWRUZXh0LCBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBEYXRhU3RhdGVJbmRpY2F0b3IgZnJvbSBcInNhcC9tL3BsdWdpbnMvRGF0YVN0YXRlSW5kaWNhdG9yXCI7XG5pbXBvcnQgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IEZpbHRlckJhckFQSSBmcm9tIFwiLi4vZmlsdGVyQmFyL0ZpbHRlckJhckFQSVwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gYWN0aW9uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB0YWJsZSB0b29sYmFyXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MudGFibGUuQWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGlvbiA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRleHQ6IHN0cmluZztcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0b29sYmFyIHRvIHByb3Blcmx5IHBsYWNlIHRoaXMgb25lXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFuY2hvcj86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBhY3Rpb24gc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IFwiQmVmb3JlXCIgfCBcIkFmdGVyXCI7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyB0aGUgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHByZXNzOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIGFjdGlvbiByZXF1aXJlcyBhIHNlbGVjdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVxdWlyZXNTZWxlY3Rpb24/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZW5hYmxlZD86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gQWN0aW9uR3JvdXAgdG8gYmUgdXNlZCBpbnNpZGUgdGhlIHRhYmxlIHRvb2xiYXJcbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy50YWJsZS5BY3Rpb25Hcm91cFxuICogQHB1YmxpY1xuICovXG5leHBvcnQgdHlwZSBBY3Rpb25Hcm91cCA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBBY3Rpb25Hcm91cFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyBuZXN0ZWQgYWN0aW9uc1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhY3Rpb25zOiBBY3Rpb25bXTtcblxuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBhY3Rpb24gZ3JvdXBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dGV4dDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGFjdGlvbiBvciBhY3Rpb24gZ3JvdXAgYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2xiYXIgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgYWN0aW9uIGdyb3VwIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBcIkJlZm9yZVwiIHwgXCJBZnRlclwiO1xufTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGNvbHVtbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUuXG4gKlxuICogVGhlIHRlbXBsYXRlIGZvciB0aGUgY29sdW1uIGhhcyB0byBiZSBwcm92aWRlZCBhcyB0aGUgZGVmYXVsdCBhZ2dyZWdhdGlvblxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblxuICogQHB1YmxpY1xuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBDb2x1bW4gPSB7XG5cdC8qKlxuXHQgKiBVbmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29sdW1uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGtleTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIGNvbHVtbiBoZWFkZXJcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aGVhZGVyOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIGNvbHVtbidzIHdpZHRoLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYGF1dG9gLCBgdmFsdWVgIGFuZCBgaW5oZXJpdGAgYWNjb3JkaW5nIHRvIHtAbGluayBzYXAudWkuY29yZS5DU1NTaXplfVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR3aWR0aD86IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgY29sdW1uIGltcG9ydGFuY2UuXG5cdCAqXG5cdCAqIFlvdSBjYW4gZGVmaW5lIHdoaWNoIGNvbHVtbnMgc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgbW92ZWQgdG8gdGhlIHBvcC1pbiBhcmVhIGJhc2VkIG9uIHRoZWlyIGltcG9ydGFuY2Vcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aW1wb3J0YW5jZT86IHN0cmluZztcblxuXHQvKipcblx0ICogQWxpZ25zIHRoZSBoZWFkZXIgYXMgd2VsbCBhcyB0aGUgY29udGVudCBob3Jpem9udGFsbHlcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aG9yaXpvbnRhbEFsaWduPzogSG9yaXpvbnRhbEFsaWduO1xuXG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGNvbHVtbiBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdGFibGUgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgY29sdW1uIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBcIkJlZm9yZVwiIHwgXCJBZnRlclwiO1xufTtcblxudHlwZSBleHBvcnRDb2x1bW4gPSBjb2x1bW5FeHBvcnRTZXR0aW5ncyAmIHtcblx0cHJvcGVydHk6IHN0cmluZyB8IEFycmF5PHN0cmluZz47XG5cdGxhYmVsOiBzdHJpbmc7XG5cdGNvbHVtbklkPzogc3RyaW5nO1xuXHR3aWR0aD86IG51bWJlcjtcblx0dGV4dEFsaWduPzogc3RyaW5nO1xuXHRkaXNwbGF5VW5pdD86IGJvb2xlYW47XG5cdHRydWVWYWx1ZT86IHN0cmluZztcblx0ZmFsc2VWYWx1ZT86IHN0cmluZztcblx0dmFsdWVNYXA/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBleHBvcnRTZXR0aW5ncyA9IHtcblx0ZGF0YVNvdXJjZToge1xuXHRcdHNpemVMaW1pdD86IG51bWJlcjtcblx0fTtcblx0d29ya2Jvb2s6IHtcblx0XHRjb2x1bW5zOiBleHBvcnRDb2x1bW5bXTtcblx0fTtcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSB0YWJsZSBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBVc3VhbGx5LCBhIExpbmVJdGVtIG9yIFByZXNlbnRhdGlvblZhcmlhbnQgYW5ub3RhdGlvbiBpcyBleHBlY3RlZCwgYnV0IHRoZSBUYWJsZSBidWlsZGluZyBibG9jayBjYW4gYWxzbyBiZSB1c2VkIHRvIGRpc3BsYXkgYW4gRW50aXR5U2V0LlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpUYWJsZSBpZD1cIk15VGFibGVcIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbVwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZVxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpXG5jbGFzcyBUYWJsZUFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0Y3JlYXRpbmdFbXB0eVJvd3M/OiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKG1TZXR0aW5ncz86IFByb3BlcnRpZXNPZjxUYWJsZUFQST4sIC4uLm90aGVyczogYW55W10pIHtcblx0XHRzdXBlcihtU2V0dGluZ3MgYXMgYW55LCAuLi5vdGhlcnMpO1xuXG5cdFx0dGhpcy51cGRhdGVGaWx0ZXJCYXIoKTtcblxuXHRcdGlmICh0aGlzLmNvbnRlbnQpIHtcblx0XHRcdHRoaXMuY29udGVudC5hdHRhY2hFdmVudChcInNlbGVjdGlvbkNoYW5nZVwiLCB7fSwgdGhpcy5vblRhYmxlU2VsZWN0aW9uQ2hhbmdlLCB0aGlzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XCJcblx0XHRdXG5cdH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0dGFibGVEZWZpbml0aW9uITogVGFibGVWaXN1YWxpemF0aW9uO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogQW4gZXhwcmVzc2lvbiB0aGF0IGFsbG93cyB5b3UgdG8gY29udHJvbCB0aGUgJ3JlYWQtb25seScgc3RhdGUgb2YgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBJZiB5b3UgZG8gbm90IHNldCBhbnkgZXhwcmVzc2lvbiwgU0FQIEZpb3JpIGVsZW1lbnRzIGhvb2tzIGludG8gdGhlIHN0YW5kYXJkIGxpZmVjeWNsZSB0byBkZXRlcm1pbmUgdGhlIGN1cnJlbnQgc3RhdGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHJlYWRPbmx5ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIHRhYmxlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEFuIGV4cHJlc3Npb24gdGhhdCBhbGxvd3MgeW91IHRvIGNvbnRyb2wgdGhlICdidXN5JyBzdGF0ZSBvZiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGJ1c3khOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSB0eXBlIG9mIHRhYmxlIHRoYXQgd2lsbCBiZSB1c2VkIGJ5IHRoZSBidWlsZGluZyBibG9jayB0byByZW5kZXIgdGhlIGRhdGEuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgR3JpZFRhYmxlYCBhbmQgYFJlc3BvbnNpdmVUYWJsZWBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIlJlc3BvbnNpdmVUYWJsZVwiLCBhbGxvd2VkVmFsdWVzOiBbXCJHcmlkVGFibGVcIiwgXCJSZXNwb25zaXZlVGFibGVcIl0gfSlcblx0dHlwZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogQ29udHJvbHMgaWYgdGhlIGV4cG9ydCBmdW5jdGlvbmFsaXR5IG9mIHRoZSB0YWJsZSBpcyBlbmFibGVkIG9yIG5vdC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRlbmFibGVFeHBvcnQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyBpZiB0aGUgcGFzdGUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgdGFibGUgaXMgZW5hYmxlZCBvciBub3QuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGVuYWJsZVBhc3RlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ29udHJvbHMgd2hldGhlciB0aGUgdGFibGUgY2FuIGJlIG9wZW5lZCBpbiBmdWxsc2NyZWVuIG1vZGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRlbmFibGVGdWxsU2NyZWVuITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9jayBhc3NvY2lhdGVkIHdpdGggdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhciE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgc2VsZWN0aW9uIG1vZGUgdG8gYmUgdXNlZCBieSB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgTm9uZWAsIGBTaW5nbGVgLCBgTXVsdGlgIG9yIGBBdXRvYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBhbGxvd2VkVmFsdWVzOiBbXCJOb25lXCIsIFwiU2luZ2xlXCIsIFwiTXVsdGlcIiwgXCJBdXRvXCJdIH0pXG5cdHNlbGVjdGlvbk1vZGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aGVhZGVyITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgaWYgdGhlIGNvbHVtbiB3aWR0aCBpcyBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0ZW5hYmxlQXV0b0NvbHVtbldpZHRoITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIGl0IHRoZSB0YWJsZSBpcyBkZXNpZ25lZCBmb3IgYSBtb2JpbGUgZGV2aWNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0aXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGhlYWRlclZpc2libGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBZ2dyZWdhdGUgYWN0aW9ucyBvZiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy50YWJsZS5BY3Rpb25cIiB9KVxuXHRhY3Rpb25zITogQWN0aW9uW107XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBjb2x1bW5zIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblwiIH0pXG5cdGNvbHVtbnMhOiBDb2x1bW5bXTtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGRhdGFJbml0aWFsaXplZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRiaW5kaW5nU3VzcGVuZGVkITogYm9vbGVhbjtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdG91dERhdGVkQmluZGluZyE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRwZW5kaW5nUmVxdWVzdCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyBpZiB0aGUgZW1wdHkgcm93cyBhcmUgZW5hYmxlZC4gVGhpcyBhbGxvd3MgdG8gaGF2ZSBkeW5hbWljIGVuYWJsZW1lbnQgb2YgdGhlIGVtcHR5IHJvd3MgdmlhIHRoZSBzZXR0ZXIgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRlbXB0eVJvd3NFbmFibGVkITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyBhIHJvdzsgdGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHdoaWNoIHJvdyBpcyBjaG9zZW4uXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgaW4gb3JkZXIgdG8gaGFuZGxlIHRoZSBuYXZpZ2F0aW9uIG1hbnVhbGx5LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRyb3dQcmVzcyE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiB0aGUgVGFibGUgU3RhdGUgY2hhbmdlcy5cblx0ICpcblx0ICogWW91IGNhbiBzZXQgdGhpcyBpbiBvcmRlciB0byBzdG9yZSB0aGUgdGFibGUgc3RhdGUgaW4gdGhlIGFwcHN0YXRlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0c3RhdGVDaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbERhdGFSZXF1ZXN0ZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQ29udHJvbHMgd2hpY2ggb3B0aW9ucyBzaG91bGQgYmUgZW5hYmxlZCBmb3IgdGhlIHRhYmxlIHBlcnNvbmFsaXphdGlvbiBkaWFsb2cuXG5cdCAqXG5cdCAqIElmIGl0IGlzIHNldCB0byBgdHJ1ZWAsIGFsbCBwb3NzaWJsZSBvcHRpb25zIGZvciB0aGlzIGtpbmQgb2YgdGFibGUgYXJlIGVuYWJsZWQuPGJyLz5cblx0ICogSWYgaXQgaXMgc2V0IHRvIGBmYWxzZWAsIHBlcnNvbmFsaXphdGlvbiBpcyBkaXNhYmxlZC48YnIvPlxuXHQgKjxici8+XG5cdCAqIFlvdSBjYW4gYWxzbyBwcm92aWRlIGEgbW9yZSBncmFudWxhciBjb250cm9sIGZvciB0aGUgcGVyc29uYWxpemF0aW9uIGJ5IHByb3ZpZGluZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IHdpdGggdGhlIG9wdGlvbnMgeW91IHdhbnQgdG8gYmUgYXZhaWxhYmxlLjxici8+XG5cdCAqIEF2YWlsYWJsZSBvcHRpb25zIGFyZTo8YnIvPlxuXHQgKiAgLSBTb3J0PGJyLz5cblx0ICogIC0gQ29sdW1uPGJyLz5cblx0ICogIC0gRmlsdGVyPGJyLz5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuIHwgc3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRwZXJzb25hbGl6YXRpb24hOiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyB0aGUga2luZCBvZiB2YXJpYW50IG1hbmFnZW1lbnQgdGhhdCBzaG91bGQgYmUgZW5hYmxlZCBmb3IgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlIGlzIGBDb250cm9sYC48YnIvPlxuXHQgKiBJZiBzZXQgd2l0aCB2YWx1ZSBgQ29udHJvbGAsIGEgdmFyaWFudCBtYW5hZ2VtZW50IGNvbnRyb2wgaXMgc2VlbiB3aXRoaW4gdGhlIHRhYmxlIGFuZCB0aGUgdGFibGUgaXMgbGlua2VkIHRvIHRoaXMuPGJyLz5cblx0ICogSWYgbm90IHNldCB3aXRoIGFueSB2YWx1ZSwgY29udHJvbCBsZXZlbCB2YXJpYW50IG1hbmFnZW1lbnQgaXMgbm90IGF2YWlsYWJsZSBmb3IgdGhpcyB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgYWxsb3dlZFZhbHVlczogW1wiQ29udHJvbFwiXSB9KVxuXHR2YXJpYW50TWFuYWdlbWVudCE6IHN0cmluZztcblxuXHQvKipcblx0ICogR3JvdXBzIG1lbnUgYWN0aW9ucyBieSBrZXkuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bWVudT86IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB3aGV0aGVyIHRvIGRpc3BsYXkgdGhlIHNlYXJjaCBhY3Rpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0aXNTZWFyY2hhYmxlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogR2V0cyBjb250ZXh0cyBmcm9tIHRoZSB0YWJsZSB0aGF0IGhhdmUgYmVlbiBzZWxlY3RlZCBieSB0aGUgdXNlci5cblx0ICpcblx0ICogQHJldHVybnMgQ29udGV4dHMgb2YgdGhlIHJvd3Mgc2VsZWN0ZWQgYnkgdGhlIHVzZXJcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0U2VsZWN0ZWRDb250ZXh0cygpOiBDb250ZXh0W10ge1xuXHRcdHJldHVybiAodGhpcy5jb250ZW50IGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBtZXNzYWdlIHRvIHRoZSB0YWJsZS5cblx0ICpcblx0ICogVGhlIG1lc3NhZ2UgYXBwbGllcyB0byB0aGUgd2hvbGUgdGFibGUgYW5kIG5vdCB0byBhbiBpbmRpdmlkdWFsIHRhYmxlIHJvdy5cblx0ICpcblx0ICogQHBhcmFtIFtwYXJhbWV0ZXJzXSBUaGUgcGFyYW1ldGVycyB0byBjcmVhdGUgdGhlIG1lc3NhZ2Vcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMudHlwZSBNZXNzYWdlIHR5cGVcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMubWVzc2FnZSBNZXNzYWdlIHRleHRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMuZGVzY3JpcHRpb24gTWVzc2FnZSBkZXNjcmlwdGlvblxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5wZXJzaXN0ZW50IFRydWUgaWYgdGhlIG1lc3NhZ2UgaXMgcGVyc2lzdGVudFxuXHQgKiBAcmV0dXJucyBUaGUgSUQgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWRkTWVzc2FnZShwYXJhbWV0ZXJzOiB7IHR5cGU/OiBNZXNzYWdlVHlwZTsgbWVzc2FnZT86IHN0cmluZzsgZGVzY3JpcHRpb24/OiBzdHJpbmc7IHBlcnNpc3RlbnQ/OiBib29sZWFuIH0pOiBzdHJpbmcge1xuXHRcdGNvbnN0IG1zZ01hbmFnZXIgPSB0aGlzLl9nZXRNZXNzYWdlTWFuYWdlcigpO1xuXG5cdFx0Y29uc3Qgb1RhYmxlID0gdGhpcy5jb250ZW50IGFzIGFueSBhcyBUYWJsZTtcblxuXHRcdGNvbnN0IG9NZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0dGFyZ2V0OiBvVGFibGUuZ2V0Um93QmluZGluZygpLmdldFJlc29sdmVkUGF0aCgpLFxuXHRcdFx0dHlwZTogcGFyYW1ldGVycy50eXBlLFxuXHRcdFx0bWVzc2FnZTogcGFyYW1ldGVycy5tZXNzYWdlLFxuXHRcdFx0cHJvY2Vzc29yOiBvVGFibGUuZ2V0TW9kZWwoKSxcblx0XHRcdGRlc2NyaXB0aW9uOiBwYXJhbWV0ZXJzLmRlc2NyaXB0aW9uLFxuXHRcdFx0cGVyc2lzdGVudDogcGFyYW1ldGVycy5wZXJzaXN0ZW50XG5cdFx0fSk7XG5cblx0XHRtc2dNYW5hZ2VyLmFkZE1lc3NhZ2VzKG9NZXNzYWdlKTtcblx0XHRyZXR1cm4gb01lc3NhZ2UuZ2V0SWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbWVzc2FnZSBmcm9tIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBpZCBvZiB0aGUgbWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZW1vdmVNZXNzYWdlKGlkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBtc2dNYW5hZ2VyID0gdGhpcy5fZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRjb25zdCBtZXNzYWdlcyA9IG1zZ01hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IG1lc3NhZ2VzLmZpbmQoKGU6IGFueSkgPT4gZS5pZCA9PT0gaWQpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdG1zZ01hbmFnZXIucmVtb3ZlTWVzc2FnZXMocmVzdWx0KTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0TWVzc2FnZU1hbmFnZXIoKSB7XG5cdFx0cmV0dXJuIHNhcC51aS5nZXRDb3JlKCkuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiB0aGUgc2VsZWN0aW9uIGluIHRoZSB0YWJsZSBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRzZWxlY3Rpb25DaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRfZ2V0Um93QmluZGluZygpIHtcblx0XHRjb25zdCBvVGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0fVxuXG5cdGdldENvdW50cygpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBUYWJsZVV0aWxzLmdldExpc3RCaW5kaW5nRm9yQ291bnQob1RhYmxlLCBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKSwge1xuXHRcdFx0YmF0Y2hHcm91cElkOiAhdGhpcy5nZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIikgPyBvVGFibGUuZGF0YShcImJhdGNoR3JvdXBJZFwiKSA6IFwiJGF1dG9cIixcblx0XHRcdGFkZGl0aW9uYWxGaWx0ZXJzOiBUYWJsZVV0aWxzLmdldEhpZGRlbkZpbHRlcnMob1RhYmxlKVxuXHRcdH0pXG5cdFx0XHQudGhlbigoaVZhbHVlOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIFRhYmxlVXRpbHMuZ2V0Q291bnRGb3JtYXR0ZWQoaVZhbHVlKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gXCIwXCI7XG5cdFx0XHR9KTtcblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvblRhYmxlUm93UHJlc3Mob0V2ZW50OiBVSTVFdmVudCwgb0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBvQ29udGV4dDogQ29udGV4dCwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdC8vIHByZXZlbnQgbmF2aWdhdGlvbiB0byBhbiBlbXB0eSByb3dcblx0XHRpZiAob0NvbnRleHQgJiYgb0NvbnRleHQuaXNJbmFjdGl2ZSgpICYmIG9Db250ZXh0LmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gSW4gdGhlIGNhc2Ugb2YgYW4gYW5hbHl0aWNhbCB0YWJsZSwgaWYgd2UncmUgdHJ5aW5nIHRvIG5hdmlnYXRlIHRvIGEgY29udGV4dCBjb3JyZXNwb25kaW5nIHRvIGEgdmlzdWFsIGdyb3VwIG9yIGdyYW5kIHRvdGFsXG5cdFx0Ly8gLS0+IENhbmNlbCBuYXZpZ2F0aW9uXG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5nZXRUYWJsZURlZmluaXRpb24oKS5lbmFibGVBbmFseXRpY3MgJiZcblx0XHRcdG9Db250ZXh0ICYmXG5cdFx0XHRvQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSAmJlxuXHRcdFx0dHlwZW9mIG9Db250ZXh0LmdldFByb3BlcnR5KFwiQCR1aTUubm9kZS5pc0V4cGFuZGVkXCIpID09PSBcImJvb2xlYW5cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGFyYW1ldGVycyA9IE9iamVjdC5hc3NpZ24oe30sIG1QYXJhbWV0ZXJzLCB7IHJlYXNvbjogTmF2aWdhdGlvblJlYXNvbi5Sb3dQcmVzcyB9KTtcblx0XHRcdChvQ29udHJvbGxlciBhcyBhbnkpLl9yb3V0aW5nLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dChvQ29udGV4dCwgbmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvbkludGVybmFsRGF0YVJlY2VpdmVkKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpKSB7XG5cdFx0XHR0aGlzLmdldENvbnRyb2xsZXIoKS5tZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdH1cblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvbkludGVybmFsRGF0YVJlcXVlc3RlZChvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImRhdGFJbml0aWFsaXplZFwiLCB0cnVlKTtcblx0XHQodGhpcyBhcyBhbnkpLmZpcmVFdmVudChcImludGVybmFsRGF0YVJlcXVlc3RlZFwiLCBvRXZlbnQuZ2V0UGFyYW1ldGVycygpKTtcblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvblBhc3RlKG9FdmVudDogVUk1RXZlbnQsIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlcikge1xuXHRcdC8vIElmIHBhc3RlIGlzIGRpc2FibGUgb3IgaWYgd2UncmUgbm90IGluIGVkaXQgbW9kZSwgd2UgY2FuJ3QgcGFzdGUgYW55dGhpbmdcblx0XHRpZiAoIXRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZW5hYmxlUGFzdGUgfHwgIXRoaXMuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgYVJhd1Bhc3RlZERhdGEgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZGF0YVwiKSxcblx0XHRcdG9UYWJsZSA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBUYWJsZTtcblxuXHRcdGlmIChvVGFibGUuZ2V0RW5hYmxlUGFzdGUoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0UGFzdGVIZWxwZXIucGFzdGVEYXRhKGFSYXdQYXN0ZWREYXRhLCBvVGFibGUsIG9Db250cm9sbGVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb1Jlc291cmNlTW9kZWwgPSBzYXAudWkuZ2V0Q29yZSgpLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0TWVzc2FnZUJveC5lcnJvcihvUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9PUF9DT05UUk9MTEVSX1NBUEZFX1BBU1RFX0RJU0FCTEVEX01FU1NBR0VcIiksIHtcblx0XHRcdFx0dGl0bGU6IG9SZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVGhpcyBldmVudCB3aWxsIGFsbG93IHVzIHRvIGludGVyY2VwdCB0aGUgZXhwb3J0IGJlZm9yZSBpcyB0cmlnZ2VyZWQgdG8gY292ZXIgc3BlY2lmaWMgY2FzZXNcblx0Ly8gdGhhdCBjb3VsZG4ndCBiZSBhZGRyZXNzZWQgb24gdGhlIHByb3BlcnR5SW5mb3MgZm9yIGVhY2ggY29sdW1uLlxuXHQvLyBlLmcuIEZpeGVkIFRhcmdldCBWYWx1ZSBmb3IgdGhlIGRhdGFwb2ludHNcblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uQmVmb3JlRXhwb3J0KGV4cG9ydEV2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IGlzU3BsaXRNb2RlID0gZXhwb3J0RXZlbnQuZ2V0UGFyYW1ldGVyKFwidXNlckV4cG9ydFNldHRpbmdzXCIpLnNwbGl0Q2VsbHMsXG5cdFx0XHR0YWJsZUNvbnRyb2xsZXIgPSBleHBvcnRFdmVudC5nZXRTb3VyY2UoKSBhcyBQYWdlQ29udHJvbGxlcixcblx0XHRcdGV4cG9ydFNldHRpbmdzID0gZXhwb3J0RXZlbnQuZ2V0UGFyYW1ldGVyKFwiZXhwb3J0U2V0dGluZ3NcIiksXG5cdFx0XHR0YWJsZURlZmluaXRpb24gPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpO1xuXG5cdFx0VGFibGVBUEkudXBkYXRlRXhwb3J0U2V0dGluZ3MoZXhwb3J0U2V0dGluZ3MsIHRhYmxlRGVmaW5pdGlvbiwgdGFibGVDb250cm9sbGVyLCBpc1NwbGl0TW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgTURDIERhdGFTdGF0ZUluZGljYXRvciBwbHVnaW4gdG8gZGlzcGxheSBtZXNzYWdlU3RyaXAgb24gYSB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIG9NZXNzYWdlXG5cdCAqIEBwYXJhbSBvVGFibGVcblx0ICogQG5hbWUgZGF0YVN0YXRlRmlsdGVyXG5cdCAqIEByZXR1cm5zIFdoZXRoZXIgdG8gcmVuZGVyIHRoZSBtZXNzYWdlU3RyaXAgdmlzaWJsZVxuXHQgKi9cblx0c3RhdGljIGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcihvTWVzc2FnZTogYW55LCBvVGFibGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHNUYWJsZUNvbnRleHRCaW5kaW5nUGF0aCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1RhYmxlUm93QmluZGluZyA9IChzVGFibGVDb250ZXh0QmluZGluZ1BhdGggPyBgJHtzVGFibGVDb250ZXh0QmluZGluZ1BhdGh9L2AgOiBcIlwiKSArIG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBzVGFibGVSb3dCaW5kaW5nID09PSBvTWVzc2FnZS5nZXRUYXJnZXQoKSA/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGhhbmRsZXMgdGhlIERhdGFTdGF0ZSBvZiB0aGUgRGF0YVN0YXRlSW5kaWNhdG9yIHBsdWdpbiBmcm9tIE1EQyBvbiBhIHRhYmxlLlxuXHQgKiBJdCdzIGZpcmVkIHdoZW4gbmV3IGVycm9yIG1lc3NhZ2VzIGFyZSBzZW50IGZyb20gdGhlIGJhY2tlbmQgdG8gdXBkYXRlIHJvdyBoaWdobGlnaHRpbmcuXG5cdCAqXG5cdCAqIEBuYW1lIG9uRGF0YVN0YXRlQ2hhbmdlXG5cdCAqIEBwYXJhbSBvRXZlbnQgRXZlbnQgb2JqZWN0XG5cdCAqL1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25EYXRhU3RhdGVDaGFuZ2Uob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9EYXRhU3RhdGVJbmRpY2F0b3IgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRGF0YVN0YXRlSW5kaWNhdG9yO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZE1lc3NhZ2VzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImZpbHRlcmVkTWVzc2FnZXNcIik7XG5cdFx0aWYgKGFGaWx0ZXJlZE1lc3NhZ2VzKSB7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbCA9IG9EYXRhU3RhdGVJbmRpY2F0b3IuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcImZpbHRlcmVkTWVzc2FnZXNcIiwgYUZpbHRlcmVkTWVzc2FnZXMsIG9EYXRhU3RhdGVJbmRpY2F0b3IuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBDb250ZXh0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgY29sdW1ucyB0byBiZSBleHBvcnRlZCBvZiBhIHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwb3J0U2V0dGluZ3MgVGhlIHRhYmxlIGV4cG9ydCBzZXR0aW5nc1xuXHQgKiBAcGFyYW0gdGFibGVEZWZpbml0aW9uIFRoZSB0YWJsZSBkZWZpbml0aW9uIGZyb20gdGhlIHRhYmxlIGNvbnZlcnRlclxuXHQgKiBAcGFyYW0gdGFibGVDb250cm9sbGVyIFRoZSB0YWJsZSBjb250cm9sbGVyXG5cdCAqIEBwYXJhbSBpc1NwbGl0TW9kZSBEZWZpbmVzIGlmIHRoZSBleHBvcnQgaGFzIGJlZW4gbGF1bmNoZWQgdXNpbmcgc3BsaXQgbW9kZVxuXHQgKiBAcmV0dXJucyBUaGUgdXBkYXRlZCBjb2x1bW5zIHRvIGJlIGV4cG9ydGVkXG5cdCAqL1xuXHRzdGF0aWMgdXBkYXRlRXhwb3J0U2V0dGluZ3MoXG5cdFx0ZXhwb3J0U2V0dGluZ3M6IGV4cG9ydFNldHRpbmdzLFxuXHRcdHRhYmxlRGVmaW5pdGlvbjogVGFibGVWaXN1YWxpemF0aW9uLFxuXHRcdHRhYmxlQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsXG5cdFx0aXNTcGxpdE1vZGU6IGJvb2xlYW5cblx0KTogZXhwb3J0U2V0dGluZ3Mge1xuXHRcdC8vU2V0IHN0YXRpYyBzaXplTGltaXQgZHVyaW5nIGV4cG9ydFxuXHRcdGNvbnN0IGNvbHVtbnMgPSB0YWJsZURlZmluaXRpb24uY29sdW1ucztcblx0XHRpZiAoXG5cdFx0XHQhdGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljcyAmJlxuXHRcdFx0KHRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIgfHwgdGFibGVEZWZpbml0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJHcmlkVGFibGVcIilcblx0XHQpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLmRhdGFTb3VyY2Uuc2l6ZUxpbWl0ID0gMTAwMDtcblx0XHR9XG5cdFx0Y29uc3QgZXhwb3J0Q29sdW1ucyA9IGV4cG9ydFNldHRpbmdzLndvcmtib29rLmNvbHVtbnM7XG5cdFx0Zm9yIChsZXQgaW5kZXggPSBleHBvcnRDb2x1bW5zLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcblx0XHRcdGNvbnN0IGV4cG9ydENvbHVtbiA9IGV4cG9ydENvbHVtbnNbaW5kZXhdO1xuXHRcdFx0Y29uc3QgcmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0XHRleHBvcnRDb2x1bW4ubGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KGV4cG9ydENvbHVtbi5sYWJlbCwgdGFibGVDb250cm9sbGVyKTtcblx0XHRcdC8vdHJhbnNsYXRlIGJvb2xlYW4gdmFsdWVzXG5cdFx0XHRpZiAoZXhwb3J0Q29sdW1uLnR5cGUgPT09IFwiQm9vbGVhblwiKSB7XG5cdFx0XHRcdGV4cG9ydENvbHVtbi5mYWxzZVZhbHVlID0gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIm5vXCIpO1xuXHRcdFx0XHRleHBvcnRDb2x1bW4udHJ1ZVZhbHVlID0gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcInllc1wiKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHRhcmdldFZhbHVlQ29sdW1uID0gY29sdW1ucz8uZmluZCgoY29sdW1uKSA9PiB7XG5cdFx0XHRcdGlmIChpc1NwbGl0TW9kZSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNvbHVtbldpdGhUYXJnZXRWYWx1ZVRvQmVBZGRlZChjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uLCBleHBvcnRDb2x1bW4pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodGFyZ2V0VmFsdWVDb2x1bW4pIHtcblx0XHRcdFx0Y29uc3QgY29sdW1uVG9CZUFkZGVkID0ge1xuXHRcdFx0XHRcdGxhYmVsOiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVGFyZ2V0VmFsdWVcIiksXG5cdFx0XHRcdFx0cHJvcGVydHk6IEFycmF5LmlzQXJyYXkoZXhwb3J0Q29sdW1uLnByb3BlcnR5KSA/IGV4cG9ydENvbHVtbi5wcm9wZXJ0eSA6IFtleHBvcnRDb2x1bW4ucHJvcGVydHldLFxuXHRcdFx0XHRcdHRlbXBsYXRlOiAodGFyZ2V0VmFsdWVDb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uKS5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRleHBvcnRDb2x1bW5zLnNwbGljZShpbmRleCArIDEsIDAsIGNvbHVtblRvQmVBZGRlZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnRTZXR0aW5ncztcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGEgY29sdW1uIHRoYXQgaXMgdG8gYmUgZXhwb3J0ZWQgYW5kIGNvbnRhaW5zIGEgRGF0YVBvaW50IHdpdGggYSBmaXhlZCB0YXJnZXQgdmFsdWUgbmVlZHMgdG8gYmUgYWRkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb2x1bW4gVGhlIGNvbHVtbiBmcm9tIHRoZSBhbm5vdGF0aW9ucyBjb2x1bW5cblx0ICogQHBhcmFtIGNvbHVtbkV4cG9ydCBUaGUgY29sdW1uIHRvIGJlIGV4cG9ydGVkXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgcmVmZXJlbmNlZCBjb2x1bW4gaGFzIGRlZmluZWQgYSB0YXJnZXRWYWx1ZSBmb3IgdGhlIGRhdGFQb2ludCwgZmFsc2UgZWxzZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c3RhdGljIGNvbHVtbldpdGhUYXJnZXRWYWx1ZVRvQmVBZGRlZChjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbiwgY29sdW1uRXhwb3J0OiBleHBvcnRDb2x1bW4pOiBib29sZWFuIHtcblx0XHRsZXQgY29sdW1uTmVlZHNUb0JlQWRkZWQgPSBmYWxzZTtcblx0XHRpZiAoY29sdW1uLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlICYmIGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5sZW5ndGggPT09IDEpIHtcblx0XHRcdC8vQWRkIFRhcmdldFZhbHVlIGNvbHVtbiB3aGVuIGV4cG9ydGluZyBvbiBzcGxpdCBtb2RlXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IGNvbHVtbkV4cG9ydC5wcm9wZXJ0eSB8fFxuXHRcdFx0XHRjb2x1bW5FeHBvcnQucHJvcGVydHlbMF0gPT09IGNvbHVtbi5wcm9wZXJ0eUluZm9zWzBdIHx8XG5cdFx0XHRcdGNvbHVtbkV4cG9ydC5wcm9wZXJ0eS5pbmNsdWRlcyhjb2x1bW4ucmVsYXRpdmVQYXRoKSB8fFxuXHRcdFx0XHRjb2x1bW5FeHBvcnQucHJvcGVydHkuaW5jbHVkZXMoY29sdW1uLm5hbWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gcGFydCBvZiBhIEZpZWxkR3JvdXAgb3IgZnJvbSBhIGxpbmVJdGVtIG9yIGZyb20gYSBjb2x1bW4gb24gdGhlIGVudGl0eVNldFxuXHRcdFx0XHRkZWxldGUgY29sdW1uRXhwb3J0LnRlbXBsYXRlO1xuXHRcdFx0XHRjb2x1bW5OZWVkc1RvQmVBZGRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW5OZWVkc1RvQmVBZGRlZDtcblx0fVxuXG5cdHJlc3VtZUJpbmRpbmcoYlJlcXVlc3RJZk5vdEluaXRpYWxpemVkOiBib29sZWFuKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIiwgZmFsc2UpO1xuXHRcdGlmICgoYlJlcXVlc3RJZk5vdEluaXRpYWxpemVkICYmICEodGhpcyBhcyBhbnkpLmdldERhdGFJbml0aWFsaXplZCgpKSB8fCB0aGlzLmdldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIpKSB7XG5cdFx0XHR0aGlzLnNldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIsIGZhbHNlKTtcblx0XHRcdCh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpPy5yZWJpbmQoKTtcblx0XHR9XG5cdH1cblxuXHRyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkcyhvRmlsdGVyQ29udHJvbDogQ29udHJvbCk6IGFueVtdIHtcblx0XHRjb25zdCBvVGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckNvbnRyb2wsIG9UYWJsZSk7XG5cdH1cblxuXHRzdXNwZW5kQmluZGluZygpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiLCB0cnVlKTtcblx0fVxuXG5cdGludmFsaWRhdGVDb250ZW50KCkge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJkYXRhSW5pdGlhbGl6ZWRcIiwgZmFsc2UpO1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgZmFsc2UpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uTWFzc0VkaXRCdXR0b25QcmVzc2VkKG9FdmVudDogVUk1RXZlbnQsIHBhZ2VDb250cm9sbGVyOiBhbnkpIHtcblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0aWYgKHBhZ2VDb250cm9sbGVyICYmIHBhZ2VDb250cm9sbGVyLm1hc3NFZGl0KSB7XG5cdFx0XHRwYWdlQ29udHJvbGxlci5tYXNzRWRpdC5vcGVuTWFzc0VkaXREaWFsb2cob1RhYmxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJUaGUgQ29udHJvbGxlciBpcyBub3QgZW5oYW5jZWQgd2l0aCBNYXNzIEVkaXQgZnVuY3Rpb25hbGl0eVwiKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25UYWJsZVNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0dGhpcy5maXJlRXZlbnQoXCJzZWxlY3Rpb25DaGFuZ2VcIiwgb0V2ZW50LmdldFBhcmFtZXRlcnMoKSk7XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0YXN5bmMgb25BY3Rpb25QcmVzcyhvRXZlbnQ6IFVJNUV2ZW50LCBwYWdlQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGFjdGlvbk5hbWU6IHN0cmluZywgcGFyYW1ldGVyczogYW55KSB7XG5cdFx0cGFyYW1ldGVycy5tb2RlbCA9IChvRXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbCkuZ2V0TW9kZWwoKTtcblx0XHRsZXQgZXhlY3V0ZUFjdGlvbiA9IHRydWU7XG5cdFx0aWYgKHBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzICYmIHBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIElmIHdlIGhhdmUgbm9uIGFwcGxpY2FibGUgY29udGV4dHMsIHdlIG5lZWQgdG8gb3BlbiBhIGRpYWxvZyB0byBhc2sgdGhlIHVzZXIgaWYgaGUgd2FudHMgdG8gY29udGludWVcblx0XHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKHBhcmFtZXRlcnMubW9kZWwuZ2V0TWV0YU1vZGVsKCkpO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlZE1ldGFkYXRhLnJlc29sdmVQYXRoPEVudGl0eVR5cGU+KHRoaXMuZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSwgdHJ1ZSkudGFyZ2V0ITtcblx0XHRcdGNvbnN0IG15VW5hcHBsaWNhYmxlQ29udGV4dERpYWxvZyA9IG5ldyBOb3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZyh7XG5cdFx0XHRcdGVudGl0eVR5cGU6IGVudGl0eVR5cGUsXG5cdFx0XHRcdG5vdEFwcGxpY2FibGVDb250ZXh0czogcGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dHMsXG5cdFx0XHRcdHRpdGxlOiBwYXJhbWV0ZXJzLmxhYmVsLFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsOiBnZXRSZXNvdXJjZU1vZGVsKHRoaXMpXG5cdFx0XHR9KTtcblx0XHRcdHBhcmFtZXRlcnMuY29udGV4dHMgPSBwYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cztcblx0XHRcdGV4ZWN1dGVBY3Rpb24gPSBhd2FpdCBteVVuYXBwbGljYWJsZUNvbnRleHREaWFsb2cub3Blbih0aGlzKTtcblx0XHR9XG5cdFx0aWYgKGV4ZWN1dGVBY3Rpb24pIHtcblx0XHRcdC8vIERpcmVjdCBleGVjdXRpb24gb2YgdGhlIGFjdGlvblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHBhZ2VDb250cm9sbGVyLmVkaXRGbG93Lmludm9rZUFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbWV0ZXJzKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0TG9nLmluZm8oZSBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFeHBvc2UgdGhlIGludGVybmFsIHRhYmxlIGRlZmluaXRpb24gZm9yIGV4dGVybmFsIHVzYWdlIGluIGRlbGVnYXRlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdGFibGVEZWZpbml0aW9uXG5cdCAqL1xuXHRnZXRUYWJsZURlZmluaXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudGFibGVEZWZpbml0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIGNvbm5lY3QgdGhlIGZpbHRlciB0byB0aGUgdGFibGVBUEkgaWYgcmVxdWlyZWRcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVBUElcblx0ICovXG5cblx0dXBkYXRlRmlsdGVyQmFyKCkge1xuXHRcdGNvbnN0IHRhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0Y29uc3QgZmlsdGVyQmFyUmVmSWQgPSAodGhpcyBhcyBhbnkpLmdldEZpbHRlckJhcigpO1xuXHRcdGlmICh0YWJsZSAmJiBmaWx0ZXJCYXJSZWZJZCAmJiB0YWJsZS5nZXRGaWx0ZXIoKSAhPT0gZmlsdGVyQmFyUmVmSWQpIHtcblx0XHRcdHRoaXMuX3NldEZpbHRlckJhcihmaWx0ZXJCYXJSZWZJZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGZpbHRlciBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgZmlsdGVyQmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyUmVmSWQgSWQgb2YgdGhlIGZpbHRlciBiYXJcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVBUElcblx0ICovXG5cdF9zZXRGaWx0ZXJCYXIoZmlsdGVyQmFyUmVmSWQ6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IHRhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cblx0XHQvLyAnZmlsdGVyQmFyJyBwcm9wZXJ0eSBvZiBtYWNybzpUYWJsZShwYXNzZWQgYXMgY3VzdG9tRGF0YSkgbWlnaHQgYmVcblx0XHQvLyAxLiBBIGxvY2FsSWQgd3J0IFZpZXcoRlBNIGV4cGxvcmVyIGV4YW1wbGUpLlxuXHRcdC8vIDIuIEFic29sdXRlIElkKHRoaXMgd2FzIG5vdCBzdXBwb3J0ZWQgaW4gb2xkZXIgdmVyc2lvbnMpLlxuXHRcdC8vIDMuIEEgbG9jYWxJZCB3cnQgRnJhZ21lbnRJZCh3aGVuIGFuIFhNTENvbXBvc2l0ZSBvciBGcmFnbWVudCBpcyBpbmRlcGVuZGVudGx5IHByb2Nlc3NlZCkgaW5zdGVhZCBvZiBWaWV3SWQuXG5cdFx0Ly8gICAgJ2ZpbHRlckJhcicgd2FzIHN1cHBvcnRlZCBlYXJsaWVyIGFzIGFuICdhc3NvY2lhdGlvbicgdG8gdGhlICdtZGM6VGFibGUnIGNvbnRyb2wgaW5zaWRlICdtYWNybzpUYWJsZScgaW4gcHJpb3IgdmVyc2lvbnMuXG5cdFx0Ly8gICAgSW4gbmV3ZXIgdmVyc2lvbnMgJ2ZpbHRlckJhcicgaXMgdXNlZCBsaWtlIGFuIGFzc29jaWF0aW9uIHRvICdtYWNybzpUYWJsZUFQSScuXG5cdFx0Ly8gICAgVGhpcyBtZWFucyB0aGF0IHRoZSBJZCBpcyByZWxhdGl2ZSB0byAnbWFjcm86VGFibGVBUEknLlxuXHRcdC8vICAgIFRoaXMgc2NlbmFyaW8gaGFwcGVucyBpbiBjYXNlIG9mIEZpbHRlckJhciBhbmQgVGFibGUgaW4gYSBjdXN0b20gc2VjdGlvbnMgaW4gT1Agb2YgRkVWNC5cblxuXHRcdGNvbnN0IHRhYmxlQVBJSWQgPSB0aGlzPy5nZXRJZCgpO1xuXHRcdGNvbnN0IHRhYmxlQVBJTG9jYWxJZCA9IHRoaXMuZGF0YShcInRhYmxlQVBJTG9jYWxJZFwiKTtcblx0XHRjb25zdCBwb3RlbnRpYWxmaWx0ZXJCYXJJZCA9XG5cdFx0XHR0YWJsZUFQSUxvY2FsSWQgJiYgZmlsdGVyQmFyUmVmSWQgJiYgdGFibGVBUElJZCAmJiB0YWJsZUFQSUlkLnJlcGxhY2UobmV3IFJlZ0V4cCh0YWJsZUFQSUxvY2FsSWQgKyBcIiRcIiksIGZpbHRlckJhclJlZklkKTsgLy8gM1xuXG5cdFx0Y29uc3QgZmlsdGVyQmFyID1cblx0XHRcdENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk/LmJ5SWQoZmlsdGVyQmFyUmVmSWQpIHx8IENvcmUuYnlJZChmaWx0ZXJCYXJSZWZJZCkgfHwgQ29yZS5ieUlkKHBvdGVudGlhbGZpbHRlckJhcklkKTtcblxuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdGlmIChmaWx0ZXJCYXIuaXNBPEZpbHRlckJhckFQST4oXCJzYXAuZmUubWFjcm9zLmZpbHRlckJhci5GaWx0ZXJCYXJBUElcIikpIHtcblx0XHRcdFx0dGFibGUuc2V0RmlsdGVyKGAke2ZpbHRlckJhci5nZXRJZCgpfS1jb250ZW50YCk7XG5cdFx0XHR9IGVsc2UgaWYgKGZpbHRlckJhci5pc0E8RmlsdGVyQmFyPihcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRcdHRhYmxlLnNldEZpbHRlcihmaWx0ZXJCYXIuZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1uczogYW55LCBjb2x1bW5OYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gYUZpbHRlcmVkQ29sdW1tbnMuc29tZShmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvQ29sdW1uPy5jb2x1bW5OYW1lID09PSBjb2x1bW5OYW1lICYmIG9Db2x1bW4/LnNDb2x1bW5OYW1lVmlzaWJsZSkgfHxcblx0XHRcdFx0KG9Db2x1bW4/LnNUZXh0QXJyYW5nZW1lbnQgIT09IHVuZGVmaW5lZCAmJiBvQ29sdW1uPy5zVGV4dEFycmFuZ2VtZW50ID09PSBjb2x1bW5OYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBjb2x1bW5OYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0SWRlbnRpZmllckNvbHVtbigpOiBhbnkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IGhlYWRlckluZm9UaXRsZVBhdGggPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLmhlYWRlckluZm9UaXRsZTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIG9UYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKTtcblx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJFR5cGUvJEtleWApO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZFRlY2huaWNhbEtleXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRpZiAoYVRlY2huaWNhbEtleXMgJiYgYVRlY2huaWNhbEtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0YVRlY2huaWNhbEtleXMuZm9yRWFjaChmdW5jdGlvbiAodGVjaG5pY2FsS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKHRlY2huaWNhbEtleSAhPT0gXCJJc0FjdGl2ZUVudGl0eVwiKSB7XG5cdFx0XHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cy5wdXNoKHRlY2huaWNhbEtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBzZW1hbnRpY0tleUNvbHVtbnMgPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLnNlbWFudGljS2V5cztcblxuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1uczogYW55ID0gW107XG5cdFx0Y29uc3QgYUZpbHRlcmVkQ29sdW1tbnM6IGFueSA9IFtdO1xuXHRcdGNvbnN0IGFUYWJsZUNvbHVtbnMgPSBvVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGFUYWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBjb2x1bW4gPSBvQ29sdW1uPy5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdGFWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0fSk7XG5cblx0XHRhVmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBvVGV4dEFycmFuZ2VtZW50ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8kVHlwZS8ke29Db2x1bW59QGApO1xuXHRcdFx0Y29uc3Qgc1RleHRBcnJhbmdlbWVudCA9IG9UZXh0QXJyYW5nZW1lbnQgJiYgb1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXT8uJFBhdGg7XG5cdFx0XHRjb25zdCBzVGV4dFBsYWNlbWVudCA9XG5cdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnQgJiZcblx0XHRcdFx0b1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0/LiRFbnVtTWVtYmVyO1xuXHRcdFx0YUZpbHRlcmVkQ29sdW1tbnMucHVzaCh7XG5cdFx0XHRcdGNvbHVtbk5hbWU6IG9Db2x1bW4sXG5cdFx0XHRcdHNUZXh0QXJyYW5nZW1lbnQ6IHNUZXh0QXJyYW5nZW1lbnQsXG5cdFx0XHRcdHNDb2x1bW5OYW1lVmlzaWJsZTogIShzVGV4dFBsYWNlbWVudCA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRsZXQgY29sdW1uOiBhbnk7XG5cblx0XHRpZiAoaGVhZGVySW5mb1RpdGxlUGF0aCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1ucywgaGVhZGVySW5mb1RpdGxlUGF0aCkpIHtcblx0XHRcdGNvbHVtbiA9IGhlYWRlckluZm9UaXRsZVBhdGg7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdHNlbWFudGljS2V5Q29sdW1ucyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRzZW1hbnRpY0tleUNvbHVtbnMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0aGlzLmNoZWNrSWZDb2x1bW5FeGlzdHMoYUZpbHRlcmVkQ29sdW1tbnMsIHNlbWFudGljS2V5Q29sdW1uc1swXSlcblx0XHQpIHtcblx0XHRcdGNvbHVtbiA9IHNlbWFudGljS2V5Q29sdW1uc1swXTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRhRmlsdGVyZWRUZWNobmljYWxLZXlzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dGhpcy5jaGVja0lmQ29sdW1uRXhpc3RzKGFGaWx0ZXJlZENvbHVtbW5zLCBhRmlsdGVyZWRUZWNobmljYWxLZXlzWzBdKVxuXHRcdCkge1xuXHRcdFx0Y29sdW1uID0gYUZpbHRlcmVkVGVjaG5pY2FsS2V5c1swXTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBFbXB0eVJvd3NFbmFibGVkIHNldHRlci5cblx0ICpcblx0ICogQHBhcmFtIGVuYWJsZW1lbnRcblx0ICovXG5cdHNldEVtcHR5Um93c0VuYWJsZWQoZW5hYmxlbWVudDogYm9vbGVhbikge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJlbXB0eVJvd3NFbmFibGVkXCIsIGVuYWJsZW1lbnQpO1xuXHRcdGlmIChlbmFibGVtZW50KSB7XG5cdFx0XHR0aGlzLnNldFVwRW1wdHlSb3dzKHRoaXMuY29udGVudCBhcyBUYWJsZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNyZWF0aW9uIGlzIG5vIGxvbmdlciBwb3NzaWJsZSB3ZSBuZWVkIHRvIGRlbGV0ZSBlbXB0eSByb3dzXG5cdFx0XHR0aGlzLmRlbGV0ZUVtcHR5Um93cyh0aGlzLmNvbnRlbnQgYXMgVGFibGUpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIHNldFVwRW1wdHlSb3dzKHRhYmxlOiBUYWJsZSwgY3JlYXRlQnV0dG9uV2FzUHJlc3NlZDogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2w/LmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93cykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHR0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sPy5pbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlICYmXG5cdFx0XHQhdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKT8uZ2V0UHJvcGVydHkoXCJjcmVhdGVNb2RlXCIpICYmXG5cdFx0XHQhY3JlYXRlQnV0dG9uV2FzUHJlc3NlZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoIXRoaXMuZW1wdHlSb3dzRW5hYmxlZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCB3YWl0VGFibGVSZW5kZXJlZCA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRpZiAodGFibGUuZ2V0RG9tUmVmKCkpIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZGVsZWdhdGUgPSB7XG5cdFx0XHRcdFx0b25BZnRlclJlbmRlcmluZzogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dGFibGUucmVtb3ZlRXZlbnREZWxlZ2F0ZShkZWxlZ2F0ZSk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHR0YWJsZS5hZGRFdmVudERlbGVnYXRlKGRlbGVnYXRlLCB0aGlzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRhd2FpdCB3YWl0VGFibGVSZW5kZXJlZDtcblxuXHRcdGNvbnN0IHVpTW9kZWwgPSB0YWJsZS5nZXRNb2RlbChcInVpXCIpO1xuXHRcdGlmICh1aU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVQZW5kaW5nXCIpKSB7XG5cdFx0XHQvLyBUaGUgZWRpdCBtb2RlIGlzIHN0aWxsIGJlaW5nIGNvbXB1dGVkLCBzbyB3ZSB3YWl0IHVudGlsIHRoaXMgY29tcHV0YXRpb24gaXMgZG9uZSBiZWZvcmUgY2hlY2tpbmcgaXRzIHZhbHVlXG5cdFx0XHRjb25zdCB3YXRjaEJpbmRpbmcgPSB1aU1vZGVsLmJpbmRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlUGVuZGluZ1wiKTtcblx0XHRcdGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZuSGFuZGxlciA9ICgpID0+IHtcblx0XHRcdFx0XHR3YXRjaEJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlcik7XG5cdFx0XHRcdFx0d2F0Y2hCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHdhdGNoQmluZGluZy5hdHRhY2hDaGFuZ2UoZm5IYW5kbGVyKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBpc0luRWRpdE1vZGUgPSB1aU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cdFx0aWYgKCFpc0luRWRpdE1vZGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKSBhcyBPRGF0YUxpc3RCaW5kaW5nO1xuXHRcdGlmIChiaW5kaW5nLmlzUmVzb2x2ZWQoKSAmJiBiaW5kaW5nLmlzTGVuZ3RoRmluYWwoKSkge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBiaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBpbmFjdGl2ZUNvbnRleHQgPSBiaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmQoZnVuY3Rpb24gKGNvbnRleHQpIHtcblx0XHRcdFx0Ly8gd2hlbiB0aGlzIGlzIGNhbGxlZCBmcm9tIGNvbnRyb2xsZXIgY29kZSB3ZSBuZWVkIHRvIGNoZWNrIHRoYXQgaW5hY3RpdmUgY29udGV4dHMgYXJlIHN0aWxsIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHRhYmxlIGNvbnRleHRcblx0XHRcdFx0cmV0dXJuIGNvbnRleHQuaXNJbmFjdGl2ZSgpICYmIGNvbnRleHQuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgoY29udGV4dFBhdGgpO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIWluYWN0aXZlQ29udGV4dCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLl9jcmVhdGVFbXB0eVJvdyhiaW5kaW5nLCB0YWJsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgaW5hY3RpdmUgcm93cyBmcm9tIHRoZSB0YWJsZSBsaXN0QmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlXG5cdCAqL1xuXHRkZWxldGVFbXB0eVJvd3ModGFibGU6IFRhYmxlKSB7XG5cdFx0Y29uc3QgYmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKSBhcyBPRGF0YUxpc3RCaW5kaW5nO1xuXHRcdGlmIChiaW5kaW5nPy5pc1Jlc29sdmVkKCkgJiYgYmluZGluZz8uaXNMZW5ndGhGaW5hbCgpKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aCA9IGJpbmRpbmcuZ2V0Q29udGV4dCgpLmdldFBhdGgoKTtcblx0XHRcdGZvciAoY29uc3QgY29udGV4dCBvZiBiaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpKSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmlzSW5hY3RpdmUoKSAmJiBjb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKGNvbnRleHRQYXRoKSkge1xuXHRcdFx0XHRcdGNvbnRleHQuZGVsZXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRhc3luYyBfY3JlYXRlRW1wdHlSb3cob0JpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsIG9UYWJsZTogVGFibGUpIHtcblx0XHRjb25zdCBpSW5saW5lQ3JlYXRpb25Sb3dDb3VudCA9IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2w/LmlubGluZUNyZWF0aW9uUm93Q291bnQgfHwgMjtcblx0XHRjb25zdCBhRGF0YSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaUlubGluZUNyZWF0aW9uUm93Q291bnQ7IGkgKz0gMSkge1xuXHRcdFx0YURhdGEucHVzaCh7fSk7XG5cdFx0fVxuXHRcdGNvbnN0IGJBdEVuZCA9IG9UYWJsZS5kYXRhKFwidGFibGVUeXBlXCIpICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHRcdGNvbnN0IGJJbmFjdGl2ZSA9IHRydWU7XG5cdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9UYWJsZSk7XG5cdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0Y29uc3QgZWRpdEZsb3cgPSBvQ29udHJvbGxlci5lZGl0Rmxvdztcblx0XHRpZiAoIXRoaXMuY3JlYXRpbmdFbXB0eVJvd3MpIHtcblx0XHRcdHRoaXMuY3JlYXRpbmdFbXB0eVJvd3MgPSB0cnVlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgYUNvbnRleHRzID0gYXdhaXQgZWRpdEZsb3cuY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMoXG5cdFx0XHRcdFx0b0JpbmRpbmcsXG5cdFx0XHRcdFx0YURhdGEsXG5cdFx0XHRcdFx0YkF0RW5kLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyLmVkaXRGbG93Lm9uQmVmb3JlQ3JlYXRlLFxuXHRcdFx0XHRcdGJJbmFjdGl2ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhQ29udGV4dHM/LmZvckVhY2goZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRvQ29udGV4dC5jcmVhdGVkKCkuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoIW9FcnJvci5jYW5jZWxlZCkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZSBhcyBhbnkpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0dGhpcy5jcmVhdGluZ0VtcHR5Um93cyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1BLFFBQVEsV0FEYkMsY0FBYyxDQUFDLDhCQUE4QixDQUFDLFVBbUI3Q0MsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixDQUFDO0lBQzdFQyxtQkFBbUIsRUFBRSxDQUNwQixxQ0FBcUMsRUFDckMsZ0RBQWdELEVBQ2hELHlEQUF5RDtFQUUzRCxDQUFDLENBQUMsVUFHREgsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQUc1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVU1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENB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QUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQXExQmhCM1IsUUFBUTtBQUFBIn0=