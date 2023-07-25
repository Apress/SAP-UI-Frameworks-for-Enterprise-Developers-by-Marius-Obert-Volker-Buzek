/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/deepExtend", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/ExcelFormatHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/SizeHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filterBar/FilterBarDelegate", "sap/fe/macros/table/TableSizeHelper", "sap/fe/macros/table/Utils", "sap/ui/core/Fragment", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel", "../TableHelper"], function (Log, deepClone, deepEqual, deepExtend, ActionRuntime, CommonUtils, MetaModelConverter, ValueFormatter, DeleteHelper, ExcelFormat, ModelHelper, ResourceModelHelper, SizeHelper, TypeGuards, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterBarDelegate, TableSizeHelper, TableUtils, Fragment, TableDelegateBase, Filter, JSONModel, TableHelper) {
  "use strict";

  var isTypeFilterable = EDM.isTypeFilterable;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  const SEMANTICKEY_HAS_DRAFTINDICATOR = "/semanticKeyHasDraftIndicator";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API and the behavior are not finalized. This class is not intended for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69.0
   * @alias sap.fe.macros.TableDelegate
   */
  return Object.assign({}, TableDelegateBase, {
    /**
     * This function calculates the width for a FieldGroup column.
     * The width of the FieldGroup is the width of the widest property contained in the FieldGroup (including the label if showDataFieldsLabel is true)
     * The result of this calculation is stored in the visualSettings.widthCalculation.minWidth property, which is used by the MDCtable.
     *
     * @param oTable Instance of the MDCtable
     * @param oProperty Current property
     * @param aProperties Array of properties
     * @private
     * @alias sap.fe.macros.TableDelegate
     */
    _computeVisualSettingsForFieldGroup: function (oTable, oProperty, aProperties) {
      if (oProperty.name.indexOf("DataFieldForAnnotation::FieldGroup::") === 0) {
        const oColumn = oTable.getColumns().find(function (oCol) {
          return oCol.getDataProperty() === oProperty.name;
        });
        const bShowDataFieldsLabel = oColumn ? oColumn.data("showDataFieldsLabel") === "true" : false;
        const oMetaModel = oTable.getModel().getMetaModel();
        const involvedDataModelObjects = getInvolvedDataModelObjects(oMetaModel.getContext(oProperty.metadataPath));
        const convertedMetaData = involvedDataModelObjects.convertedTypes;
        const oDataField = involvedDataModelObjects.targetObject;
        const oFieldGroup = oDataField.Target.$target;
        const aFieldWidth = [];
        oFieldGroup.Data.forEach(function (oData) {
          let oDataFieldWidth;
          switch (oData.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
              oDataFieldWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(oData, aProperties, convertedMetaData, bShowDataFieldsLabel);
              break;
            case "com.sap.vocabularies.UI.v1.DataField":
              oDataFieldWidth = TableSizeHelper.getWidthForDataField(oData, bShowDataFieldsLabel, aProperties, convertedMetaData);
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              oDataFieldWidth = {
                labelWidth: 0,
                propertyWidth: SizeHelper.getButtonWidth(oData.Label)
              };
              break;
            default:
          }
          if (oDataFieldWidth) {
            aFieldWidth.push(oDataFieldWidth.labelWidth + oDataFieldWidth.propertyWidth);
          }
        });
        const nWidest = aFieldWidth.reduce(function (acc, value) {
          return Math.max(acc, value);
        }, 0);
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            verticalArrangement: true,
            minWidth: Math.ceil(nWidest)
          }
        });
      }
    },
    _computeVisualSettingsForPropertyWithValueHelp: function (table, property) {
      const tableAPI = table.getParent();
      if (!property.propertyInfos) {
        const metaModel = table.getModel().getMetaModel();
        if (property.metadataPath && metaModel) {
          const dataField = metaModel.getObject(`${property.metadataPath}@`);
          if (dataField && dataField["@com.sap.vocabularies.Common.v1.ValueList"]) {
            property.visualSettings = deepExtend(property.visualSettings || {}, {
              widthCalculation: {
                gap: tableAPI.getProperty("readOnly") ? 0 : 4
              }
            });
          }
        }
      }
    },
    _computeVisualSettingsForPropertyWithUnit: function (oTable, oProperty, oUnit, oUnitText, oTimezoneText) {
      const oTableAPI = oTable ? oTable.getParent() : null;
      // update gap for properties with string unit
      const sUnitText = oUnitText || oTimezoneText;
      if (sUnitText) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            gap: Math.ceil(SizeHelper.getButtonWidth(sUnitText))
          }
        });
      }
      if (oUnit) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            // For properties with unit, a gap needs to be added to properly render the column width on edit mode
            gap: oTableAPI && oTableAPI.getReadOnly() ? 0 : 6
          }
        });
      }
    },
    _computeLabel: function (property, labelMap) {
      if (property.label) {
        var _property$path;
        const propertiesWithSameLabel = labelMap[property.label];
        if ((propertiesWithSameLabel === null || propertiesWithSameLabel === void 0 ? void 0 : propertiesWithSameLabel.length) > 1 && (_property$path = property.path) !== null && _property$path !== void 0 && _property$path.includes("/") && property.additionalLabels) {
          property.label = property.label + " (" + property.additionalLabels.join(" / ") + ")";
        }
        delete property.additionalLabels;
      }
    },
    //Update VisualSetting for columnWidth calculation and labels on navigation properties
    _updatePropertyInfo: function (table, properties) {
      const labelMap = {};
      // Check available p13n modes
      const p13nMode = table.getP13nMode();
      properties.forEach(property => {
        if (!property.propertyInfos && property.label) {
          // Only for non-complex properties
          if ((p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Sort")) > -1 && property.sortable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Filter")) > -1 && property.filterable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Group")) > -1 && property.groupable) {
            labelMap[property.label] = labelMap[property.label] !== undefined ? labelMap[property.label].concat([property]) : [property];
          }
        }
      });
      properties.forEach(property => {
        this._computeVisualSettingsForFieldGroup(table, property, properties);
        this._computeVisualSettingsForPropertyWithValueHelp(table, property);
        // bcp: 2270003577
        // Some columns (eg: custom columns) have no typeConfig property.
        // initializing it prevents an exception throw
        property.typeConfig = deepExtend(property.typeConfig, {});
        this._computeLabel(property, labelMap);
      });
      return properties;
    },
    getColumnsFor: function (table) {
      return table.getParent().getTableDefinition().columns;
    },
    _getAggregatedPropertyMap: function (oTable) {
      return oTable.getParent().getTableDefinition().aggregates;
    },
    /**
     * Returns the export capabilities for the given sap.ui.mdc.Table instance.
     *
     * @param oTable Instance of the table
     * @returns Promise representing the export capabilities of the table instance
     */
    fetchExportCapabilities: function (oTable) {
      const oCapabilities = {
        XLSX: {}
      };
      let oModel;
      return DelegateUtil.fetchModel(oTable).then(function (model) {
        oModel = model;
        return oModel.getMetaModel().getObject("/$EntityContainer@Org.OData.Capabilities.V1.SupportedFormats");
      }).then(function (aSupportedFormats) {
        const aLowerFormats = (aSupportedFormats || []).map(element => {
          return element.toLowerCase();
        });
        if (aLowerFormats.indexOf("application/pdf") > -1) {
          return oModel.getMetaModel().getObject("/$EntityContainer@com.sap.vocabularies.PDF.v1.Features");
        }
        return undefined;
      }).then(function (oAnnotation) {
        if (oAnnotation) {
          oCapabilities["PDF"] = Object.assign({}, oAnnotation);
        }
      }).catch(function (err) {
        Log.error(`An error occurs while computing export capabilities: ${err}`);
      }).then(function () {
        return oCapabilities;
      });
    },
    /**
     * Filtering on 1:n navigation properties and navigation
     * properties not part of the LineItem annotation is forbidden.
     *
     * @param columnInfo
     * @param metaModel
     * @param table
     * @returns Boolean true if filtering is allowed, false otherwise
     */
    _isFilterableNavigationProperty: function (columnInfo, metaModel, table) {
      // get the DataModelObjectPath for the table
      const tableDataModelObjectPath = getInvolvedDataModelObjects(metaModel.getContext(DelegateUtil.getCustomData(table, "metaPath"))),
        // get all navigation properties leading to the column
        columnNavigationProperties = getInvolvedDataModelObjects(metaModel.getContext(columnInfo.annotationPath)).navigationProperties,
        // we are only interested in navigation properties relative to the table, so all before and including the tables targetType can be filtered
        tableTargetEntityIndex = columnNavigationProperties.findIndex(prop => {
          var _prop$targetType;
          return ((_prop$targetType = prop.targetType) === null || _prop$targetType === void 0 ? void 0 : _prop$targetType.name) === tableDataModelObjectPath.targetEntityType.name;
        }),
        relativeNavigationProperties = columnNavigationProperties.slice(tableTargetEntityIndex > 0 ? tableTargetEntityIndex : 0);
      return !columnInfo.relativePath.includes("/") || columnInfo.isPartOfLineItem === true && !relativeNavigationProperties.some(isMultipleNavigationProperty);
    },
    _fetchPropertyInfo: function (metaModel, columnInfo, table, appComponent) {
      var _columnInfo$typeConfi, _columnInfo$typeConfi2, _columnInfo$propertyI;
      const sAbsoluteNavigationPath = columnInfo.annotationPath,
        oDataField = metaModel.getObject(sAbsoluteNavigationPath),
        oNavigationContext = metaModel.createBindingContext(sAbsoluteNavigationPath),
        oTypeConfig = (_columnInfo$typeConfi = columnInfo.typeConfig) !== null && _columnInfo$typeConfi !== void 0 && _columnInfo$typeConfi.className && isTypeFilterable(columnInfo.typeConfig.className) ? TypeUtil.getTypeConfig(columnInfo.typeConfig.className, columnInfo.typeConfig.formatOptions, columnInfo.typeConfig.constraints) : {},
        bFilterable = CommonHelper.isPropertyFilterable(oNavigationContext, oDataField),
        isComplexType = columnInfo.typeConfig && columnInfo.typeConfig.className && ((_columnInfo$typeConfi2 = columnInfo.typeConfig.className) === null || _columnInfo$typeConfi2 === void 0 ? void 0 : _columnInfo$typeConfi2.indexOf("Edm.")) !== 0,
        bIsAnalyticalTable = DelegateUtil.getCustomData(table, "enableAnalytics") === "true",
        aAggregatedPropertyMapUnfilterable = bIsAnalyticalTable ? this._getAggregatedPropertyMap(table) : {},
        label = getLocalizedText(columnInfo.label ?? "", appComponent ?? table);
      const propertyInfo = {
        name: columnInfo.name,
        metadataPath: sAbsoluteNavigationPath,
        groupLabel: columnInfo.groupLabel,
        group: columnInfo.group,
        label: label,
        tooltip: columnInfo.tooltip,
        typeConfig: oTypeConfig,
        visible: columnInfo.availability !== "Hidden" && !isComplexType,
        exportSettings: this._setPropertyInfoExportSettings(columnInfo.exportSettings, columnInfo),
        unit: columnInfo.unit
      };

      // Set visualSettings only if it exists
      if (columnInfo.visualSettings && Object.keys(columnInfo.visualSettings).length > 0) {
        propertyInfo.visualSettings = columnInfo.visualSettings;
      }
      if (columnInfo.exportDataPointTargetValue) {
        propertyInfo.exportDataPointTargetValue = columnInfo.exportDataPointTargetValue;
      }

      // MDC expects  'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if ((_columnInfo$propertyI = columnInfo.propertyInfos) !== null && _columnInfo$propertyI !== void 0 && _columnInfo$propertyI.length) {
        propertyInfo.propertyInfos = columnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content	on the excel exported file
        if (propertyInfo.exportSettings) {
          var _columnInfo$exportSet;
          propertyInfo.exportSettings.wrap = (_columnInfo$exportSet = columnInfo.exportSettings) === null || _columnInfo$exportSet === void 0 ? void 0 : _columnInfo$exportSet.wrap;
        }
      } else {
        var _extension;
        // Add properties which are supported only by simple PropertyInfos.
        propertyInfo.path = columnInfo.relativePath;
        // TODO with the new complex property info, a lot of "Description" fields are added as filter/sort fields
        propertyInfo.sortable = columnInfo.sortable;
        if (bIsAnalyticalTable) {
          this._updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo);
        }
        propertyInfo.filterable = !!bFilterable && this._isFilterableNavigationProperty(columnInfo, metaModel, table) && (
        // TODO ignoring all properties that are not also available for adaptation for now, but proper concept required
        !bIsAnalyticalTable || !aAggregatedPropertyMapUnfilterable[propertyInfo.name] && !((_extension = columnInfo.extension) !== null && _extension !== void 0 && _extension.technicallyGroupable));
        propertyInfo.key = columnInfo.isKey;
        propertyInfo.groupable = columnInfo.isGroupable;
        if (columnInfo.textArrangement) {
          const descriptionColumn = this.getColumnsFor(table).find(function (oCol) {
            var _columnInfo$textArran;
            return oCol.name === ((_columnInfo$textArran = columnInfo.textArrangement) === null || _columnInfo$textArran === void 0 ? void 0 : _columnInfo$textArran.textProperty);
          });
          if (descriptionColumn) {
            propertyInfo.mode = columnInfo.textArrangement.mode;
            propertyInfo.valueProperty = columnInfo.relativePath;
            propertyInfo.descriptionProperty = descriptionColumn.relativePath;
          }
        }
        propertyInfo.text = columnInfo.textArrangement && columnInfo.textArrangement.textProperty;
        propertyInfo.caseSensitive = columnInfo.caseSensitive;
        if (columnInfo.additionalLabels) {
          propertyInfo.additionalLabels = columnInfo.additionalLabels.map(additionalLabel => {
            return getLocalizedText(additionalLabel, appComponent || table);
          });
        }
      }
      this._computeVisualSettingsForPropertyWithUnit(table, propertyInfo, columnInfo.unit, columnInfo.unitText, columnInfo.timezoneText);
      return propertyInfo;
    },
    /**
     * Extend the export settings based on the column info.
     *
     * @param exportSettings The export settings to be extended
     * @param columnInfo The columnInfo object
     * @returns The extended export settings
     */
    _setPropertyInfoExportSettings: function (exportSettings, columnInfo) {
      var _columnInfo$typeConfi3;
      const exportFormat = this._getExportFormat((_columnInfo$typeConfi3 = columnInfo.typeConfig) === null || _columnInfo$typeConfi3 === void 0 ? void 0 : _columnInfo$typeConfi3.className);
      if (exportSettings) {
        if (exportFormat && !exportSettings.timezoneProperty) {
          exportSettings.format = exportFormat;
        }
        // Set the exportSettings template only if it exists.
        if (exportSettings.template) {
          var _columnInfo$exportSet2;
          exportSettings.template = (_columnInfo$exportSet2 = columnInfo.exportSettings) === null || _columnInfo$exportSet2 === void 0 ? void 0 : _columnInfo$exportSet2.template;
        }
      }
      return exportSettings;
    },
    _updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo) {
      if (columnInfo.aggregatable) {
        propertyInfo.aggregatable = columnInfo.aggregatable;
      }
      if (columnInfo.extension) {
        propertyInfo.extension = columnInfo.extension;
      }
    },
    _fetchCustomPropertyInfo: function (oColumnInfo, oTable, oAppComponent) {
      const sLabel = getLocalizedText(oColumnInfo.header, oAppComponent || oTable); // Todo: To be removed once MDC provides translation support
      const oPropertyInfo = {
        name: oColumnInfo.name,
        groupLabel: undefined,
        group: undefined,
        label: sLabel,
        type: "Edm.String",
        // TBD
        visible: oColumnInfo.availability !== "Hidden",
        exportSettings: oColumnInfo.exportSettings,
        visualSettings: oColumnInfo.visualSettings
      };

      // MDC expects 'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if (oColumnInfo.propertyInfos && oColumnInfo.propertyInfos.length) {
        oPropertyInfo.propertyInfos = oColumnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content on the excel exported file
        oPropertyInfo.exportSettings = {
          wrap: oColumnInfo.exportSettings.wrap,
          template: oColumnInfo.exportSettings.template
        };
      } else {
        // Add properties which are supported only by simple PropertyInfos.
        oPropertyInfo.path = oColumnInfo.name;
        oPropertyInfo.sortable = false;
        oPropertyInfo.filterable = false;
      }
      return oPropertyInfo;
    },
    _bColumnHasPropertyWithDraftIndicator: function (oColumnInfo) {
      return !!(oColumnInfo.formatOptions && oColumnInfo.formatOptions.hasDraftIndicator || oColumnInfo.formatOptions && oColumnInfo.formatOptions.fieldGroupDraftIndicatorPropertyPath);
    },
    _updateDraftIndicatorModel: function (_oTable, _oColumnInfo) {
      const aVisibleColumns = _oTable.getColumns();
      const oInternalBindingContext = _oTable.getBindingContext("internal");
      const sInternalPath = oInternalBindingContext && oInternalBindingContext.getPath();
      if (aVisibleColumns && oInternalBindingContext) {
        for (const index in aVisibleColumns) {
          if (this._bColumnHasPropertyWithDraftIndicator(_oColumnInfo) && _oColumnInfo.name === aVisibleColumns[index].getDataProperty()) {
            if (oInternalBindingContext.getProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR) === undefined) {
              oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, _oColumnInfo.name);
              break;
            }
          }
        }
      }
    },
    _fetchPropertiesForEntity: function (oTable, sEntityTypePath, oMetaModel, oAppComponent) {
      // when fetching properties, this binding context is needed - so lets create it only once and use if for all properties/data-fields/line-items
      const sBindingPath = ModelHelper.getEntitySetPath(sEntityTypePath);
      let aFetchedProperties = [];
      const oFR = CommonUtils.getFilterRestrictionsByPath(sBindingPath, oMetaModel);
      const aNonFilterableProps = oFR.NonFilterableProperties;
      return Promise.resolve(this.getColumnsFor(oTable)).then(aColumns => {
        // DraftAdministrativeData does not work via 'entitySet/$NavigationPropertyBinding/DraftAdministrativeData'
        if (aColumns) {
          let oPropertyInfo;
          aColumns.forEach(oColumnInfo => {
            this._updateDraftIndicatorModel(oTable, oColumnInfo);
            switch (oColumnInfo.type) {
              case "Annotation":
                oPropertyInfo = this._fetchPropertyInfo(oMetaModel, oColumnInfo, oTable, oAppComponent);
                if (oPropertyInfo && aNonFilterableProps.indexOf(oPropertyInfo.name) === -1) {
                  oPropertyInfo.maxConditions = DelegateUtil.isMultiValue(oPropertyInfo) ? -1 : 1;
                }
                break;
              case "Slot":
              case "Default":
                oPropertyInfo = this._fetchCustomPropertyInfo(oColumnInfo, oTable, oAppComponent);
                break;
              default:
                throw new Error(`unhandled switch case ${oColumnInfo.type}`);
            }
            aFetchedProperties.push(oPropertyInfo);
          });
        }
      }).then(() => {
        aFetchedProperties = this._updatePropertyInfo(oTable, aFetchedProperties);
      }).catch(function (err) {
        Log.error(`An error occurs while updating fetched properties: ${err}`);
      }).then(function () {
        return aFetchedProperties;
      });
    },
    _getCachedOrFetchPropertiesForEntity: function (table, entityTypePath, metaModel, appComponent) {
      const fetchedProperties = DelegateUtil.getCachedProperties(table);
      if (fetchedProperties) {
        return Promise.resolve(fetchedProperties);
      }
      return this._fetchPropertiesForEntity(table, entityTypePath, metaModel, appComponent).then(function (subFetchedProperties) {
        DelegateUtil.setCachedProperties(table, subFetchedProperties);
        return subFetchedProperties;
      });
    },
    _setTableNoDataText: function (oTable, oBindingInfo) {
      let sNoDataKey = "";
      const oTableFilterInfo = TableUtils.getAllFilterInfo(oTable),
        suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
      const _getNoDataTextWithFilters = function () {
        if (oTable.data("hiddenFilters") || oTable.data("quickFilterKey")) {
          return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
        } else {
          return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
        }
      };
      const sFilterAssociation = oTable.getFilter();
      if (sFilterAssociation && !/BasicSearch$/.test(sFilterAssociation)) {
        // check if a FilterBar is associated to the Table (basic search on toolBar is excluded)
        if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
          // check if table has any Filterbar filters or personalization filters
          sNoDataKey = _getNoDataTextWithFilters();
        } else {
          sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
        }
      } else if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
        //check if table has any personalization filters
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
      }
      oTable.setNoData(getResourceModel(oTable).getText(sNoDataKey, undefined, suffixResourceKey));
    },
    handleTableDataReceived: function (oTable, oInternalModelContext) {
      const oBinding = oTable && oTable.getRowBinding(),
        bDataReceivedAttached = oInternalModelContext && oInternalModelContext.getProperty("dataReceivedAttached");
      if (oInternalModelContext && !bDataReceivedAttached) {
        oBinding.attachDataReceived(function () {
          // Refresh the selected contexts to trigger re-calculation of enabled state of actions.
          oInternalModelContext.setProperty("selectedContexts", []);
          const aSelectedContexts = oTable.getSelectedContexts();
          oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
          oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
          const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap")));
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
          // Refresh enablement of delete button
          DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
          const oTableAPI = oTable ? oTable.getParent() : null;
          if (oTableAPI) {
            oTableAPI.setUpEmptyRows(oTable);
          }
        });
        oInternalModelContext.setProperty("dataReceivedAttached", true);
      }
    },
    rebind: function (oTable, oBindingInfo) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
      if (!bIsSuspended) {
        TableUtils.clearSelection(oTable);
        TableDelegateBase.rebind.apply(this, [oTable, oBindingInfo]);
        TableUtils.onTableBound(oTable);
        this._setTableNoDataText(oTable, oBindingInfo);
        return TableUtils.whenBound(oTable).then(this.handleTableDataReceived(oTable, oTable.getBindingContext("internal"))).catch(function (oError) {
          Log.error("Error while waiting for the table to be bound", oError);
        });
      }
      return Promise.resolve();
    },
    /**
     * Fetches the relevant metadata for the table and returns property info array.
     *
     * @param table Instance of the MDCtable
     * @returns Array of property info
     */
    fetchProperties: function (table) {
      return DelegateUtil.fetchModel(table).then(model => {
        return this._getCachedOrFetchPropertiesForEntity(table, DelegateUtil.getCustomData(table, "entityType"), model.getMetaModel());
      }).then(properties => {
        table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
        return properties;
      });
    },
    preInit: function (oTable) {
      return TableDelegateBase.preInit.apply(this, [oTable]).then(function () {
        /**
         * Set the binding context to null for every fast creation row to avoid it inheriting
         * the wrong context and requesting the table columns on the parent entity
         * Set the correct binding context in ObjectPageController.enableFastCreationRow()
         */
        const oFastCreationRow = oTable.getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      });
    },
    updateBindingInfo: function (oTable, oBindingInfo) {
      TableDelegateBase.updateBindingInfo.apply(this, [oTable, oBindingInfo]);
      this._internalUpdateBindingInfo(oTable, oBindingInfo);
      oBindingInfo.events.dataReceived = oTable.getParent().onInternalDataReceived.bind(oTable.getParent());
      oBindingInfo.events.dataRequested = oTable.getParent().onInternalDataRequested.bind(oTable.getParent());
      this._setTableNoDataText(oTable, oBindingInfo);
      /**
       * We have to set the binding context to null for every fast creation row to avoid it inheriting
       * the wrong context and requesting the table columns on the parent entity
       * The correct binding context is set in ObjectPageController.enableFastCreationRow()
       */
      TableHelper.enableFastCreationRow(oTable.getCreationRow(), oBindingInfo.path, oTable.getBindingContext(), oTable.getModel(), oTable.getModel("ui").getProperty("/isEditable"));
    },
    _manageSemanticTargets: function (oMDCTable) {
      const oRowBinding = oMDCTable.getRowBinding();
      if (oRowBinding) {
        oRowBinding.attachEventOnce("dataRequested", function () {
          setTimeout(function () {
            const _oView = CommonUtils.getTargetView(oMDCTable);
            if (_oView) {
              TableUtils.getSemanticTargetsFromTable(_oView.getController(), oMDCTable);
            }
          }, 0);
        });
      }
    },
    updateBinding: function (oTable, oBindingInfo, oBinding) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      if (!bIsSuspended) {
        let bNeedManualRefresh = false;
        const _oView = CommonUtils.getTargetView(oTable);
        const oInternalBindingContext = oTable.getBindingContext("internal");
        const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
        const bPendingManualUpdate = oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
        const oRowBinding = oTable.getRowBinding();
        if (oRowBinding) {
          /**
           * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
           * is not enough to trigger a batch request.
           * Removing columns creates one batch request that was not executed before
           */
          const oldFilters = oRowBinding.getFilters("Application");
          bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate && _oView && _oView.getViewData().converterType === "ListReport";
        }
        TableDelegateBase.updateBinding.apply(this, [oTable, oBindingInfo, oBinding]);
        oTable.fireEvent("bindingUpdated");
        if (bNeedManualRefresh && oTable.getFilter() && oBinding) {
          oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
            oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
          }).catch(function (oError) {
            Log.error("Error while refreshing the table", oError);
          });
          oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
        }
        this._manageSemanticTargets(oTable);
      }
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
    },
    _computeRowBindingInfoFromTemplate: function (oTable) {
      // We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
      // be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
      const rowBindingInfo = deepClone(DelegateUtil.getCustomData(oTable, "rowsBindingInfo"));
      // if the rowBindingInfo has a $$getKeepAliveContext parameter we need to check it is the only Table with such a
      // parameter for the collectionMetaPath
      if (rowBindingInfo.parameters.$$getKeepAliveContext) {
        const collectionPath = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
        const internalModel = oTable.getModel("internal");
        const keptAliveLists = internalModel.getObject("/keptAliveLists") || {};
        if (!keptAliveLists[collectionPath]) {
          keptAliveLists[collectionPath] = oTable.getId();
          internalModel.setProperty("/keptAliveLists", keptAliveLists);
        } else if (keptAliveLists[collectionPath] !== oTable.getId()) {
          delete rowBindingInfo.parameters.$$getKeepAliveContext;
        }
      }
      return rowBindingInfo;
    },
    _internalUpdateBindingInfo: function (oTable, oBindingInfo) {
      const oInternalModelContext = oTable.getBindingContext("internal");
      Object.assign(oBindingInfo, this._computeRowBindingInfoFromTemplate(oTable));
      /**
       * Binding info might be suspended at the beginning when the first bindRows is called:
       * To avoid duplicate requests but still have a binding to create new entries.				 *
       * After the initial binding step, follow up bindings should no longer be suspended.
       */
      if (oTable.getRowBinding()) {
        oBindingInfo.suspended = false;
      }
      // The previously added handler for the event 'dataReceived' is not anymore there
      // since the bindingInfo is recreated from scratch so we need to set the flag to false in order
      // to again add the handler on this event if needed
      if (oInternalModelContext) {
        oInternalModelContext.setProperty("dataReceivedAttached", false);
      }
      let oFilter;
      const oFilterInfo = TableUtils.getAllFilterInfo(oTable);
      // Prepare binding info with filter/search parameters
      if (oFilterInfo.filters.length > 0) {
        oFilter = new Filter({
          filters: oFilterInfo.filters,
          and: true
        });
      }
      if (oFilterInfo.bindingPath) {
        oBindingInfo.path = oFilterInfo.bindingPath;
      }
      const oDataStateIndicator = oTable.getDataStateIndicator();
      if (oDataStateIndicator && oDataStateIndicator.isFiltering()) {
        // Include filters on messageStrip
        if (oBindingInfo.filters.length > 0) {
          oFilter = new Filter({
            filters: oBindingInfo.filters.concat(oFilterInfo.filters),
            and: true
          });
          this.updateBindingInfoWithSearchQuery(oBindingInfo, oFilterInfo, oFilter);
        }
      } else {
        this.updateBindingInfoWithSearchQuery(oBindingInfo, oFilterInfo, oFilter);
      }
    },
    updateBindingInfoWithSearchQuery: function (bindingInfo, filterInfo, filter) {
      bindingInfo.filters = filter;
      if (filterInfo.search) {
        bindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(filterInfo.search);
      } else {
        bindingInfo.parameters.$search = undefined;
      }
    },
    _templateCustomColumnFragment: function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      return DelegateUtil.templateControlFragment("sap.fe.macros.table.CustomColumn", oPreprocessorSettings, {
        view: oView
      }, oModifier).then(function (oItem) {
        oColumnModel.destroy();
        return oItem;
      });
    },
    _templateSlotColumnFragment: async function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      const slotColumnsXML = await DelegateUtil.templateControlFragment("sap.fe.macros.table.SlotColumn", oPreprocessorSettings, {
        isXML: true
      });
      if (!slotColumnsXML) {
        return Promise.resolve(null);
      }
      const slotXML = slotColumnsXML.getElementsByTagName("slot")[0],
        mdcTableTemplateXML = slotColumnsXML.getElementsByTagName("mdcTable:template")[0];
      mdcTableTemplateXML.removeChild(slotXML);
      if (oColumnInfo.template) {
        const oTemplate = new DOMParser().parseFromString(oColumnInfo.template, "text/xml");
        mdcTableTemplateXML.appendChild(oTemplate.firstElementChild);
      } else {
        Log.error(`Please provide content inside this Building Block Column: ${oColumnInfo.header}`);
        return Promise.resolve(null);
      }
      if (oModifier.targets !== "jsControlTree") {
        return slotColumnsXML;
      }
      return Fragment.load({
        type: "XML",
        definition: slotColumnsXML
      });
    },
    _getExportFormat: function (dataType) {
      switch (dataType) {
        case "Edm.Date":
          return ExcelFormat.getExcelDatefromJSDate();
        case "Edm.DateTimeOffset":
          return ExcelFormat.getExcelDateTimefromJSDateTime();
        case "Edm.TimeOfDay":
          return ExcelFormat.getExcelTimefromJSTime();
        default:
          return undefined;
      }
    },
    _getVHRelevantFields: function (oMetaModel, sMetadataPath, sBindingPath) {
      let aFields = [],
        oDataFieldData = oMetaModel.getObject(sMetadataPath);
      if (oDataFieldData.$kind && oDataFieldData.$kind === "Property") {
        oDataFieldData = oMetaModel.getObject(`${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
        sMetadataPath = `${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`;
      }
      switch (oDataFieldData.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath`).includes("com.sap.vocabularies.UI.v1.FieldGroup")) {
            oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath/Data`).forEach((oValue, iIndex) => {
              aFields = aFields.concat(this._getVHRelevantFields(oMetaModel, `${sMetadataPath}/Target/$AnnotationPath/Data/${iIndex}`));
            });
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          aFields.push(oMetaModel.getObject(`${sMetadataPath}/Value/$Path`));
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          break;
        default:
          // property
          // temporary workaround to make sure VH relevant field path do not contain the bindingpath
          if (sMetadataPath.indexOf(sBindingPath) === 0) {
            aFields.push(sMetadataPath.substring(sBindingPath.length + 1));
            break;
          }
          aFields.push(CommonHelper.getNavigationPath(sMetadataPath, true));
          break;
      }
      return aFields;
    },
    _setDraftIndicatorOnVisibleColumn: function (oTable, aColumns, oColumnInfo) {
      const oInternalBindingContext = oTable.getBindingContext("internal");
      if (!oInternalBindingContext) {
        return;
      }
      const sInternalPath = oInternalBindingContext.getPath();
      const aColumnsWithDraftIndicator = aColumns.filter(oColumn => {
        return this._bColumnHasPropertyWithDraftIndicator(oColumn);
      });
      const aVisibleColumns = oTable.getColumns();
      let sAddVisibleColumnName, sVisibleColumnName, bFoundColumnVisibleWithDraft, sColumnNameWithDraftIndicator;
      for (const i in aVisibleColumns) {
        sVisibleColumnName = aVisibleColumns[i].getDataProperty();
        for (const j in aColumnsWithDraftIndicator) {
          sColumnNameWithDraftIndicator = aColumnsWithDraftIndicator[j].name;
          if (sVisibleColumnName === sColumnNameWithDraftIndicator) {
            bFoundColumnVisibleWithDraft = true;
            break;
          }
          if (oColumnInfo && oColumnInfo.name === sColumnNameWithDraftIndicator) {
            sAddVisibleColumnName = oColumnInfo.name;
          }
        }
        if (bFoundColumnVisibleWithDraft) {
          oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sVisibleColumnName);
          break;
        }
      }
      if (!bFoundColumnVisibleWithDraft && sAddVisibleColumnName) {
        oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sAddVisibleColumnName);
      }
    },
    removeItem: function (oPropertyInfoName, oTable, mPropertyBag) {
      let doRemoveItem = true;
      if (!oPropertyInfoName) {
        // 1. Application removed the property from their data model
        // 2. addItem failed before revertData created
        return Promise.resolve(doRemoveItem);
      }
      const oModifier = mPropertyBag.modifier;
      const sDataProperty = oModifier.getProperty(oPropertyInfoName, "dataProperty");
      if (sDataProperty && sDataProperty.indexOf && sDataProperty.indexOf("InlineXML") !== -1) {
        oModifier.insertAggregation(oTable, "dependents", oPropertyInfoName);
        doRemoveItem = false;
      }
      if (oTable.isA && oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorStatus(oModifier, oTable, this.getColumnsFor(oTable));
      }
      return Promise.resolve(doRemoveItem);
    },
    _getMetaModel: function (mPropertyBag) {
      return mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
    },
    _setDraftIndicatorStatus: function (oModifier, oTable, aColumns, oColumnInfo) {
      if (oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorOnVisibleColumn(oTable, aColumns, oColumnInfo);
      }
    },
    _getGroupId: function (sRetrievedGroupId) {
      return sRetrievedGroupId || undefined;
    },
    _getDependent: function (oDependent, sPropertyInfoName, sDataProperty) {
      if (sPropertyInfoName === sDataProperty) {
        return oDependent;
      }
      return undefined;
    },
    _fnTemplateValueHelp: function (fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists) {
      if (bValueHelpRequired && !bValueHelpExists) {
        return fnTemplateValueHelp("sap.fe.macros.table.ValueHelp");
      }
      return Promise.resolve();
    },
    _getDisplayMode: function (bDisplayMode) {
      let columnEditMode;
      if (bDisplayMode !== undefined) {
        bDisplayMode = typeof bDisplayMode === "boolean" ? bDisplayMode : bDisplayMode === "true";
        columnEditMode = bDisplayMode ? "Display" : "Editable";
        return {
          displaymode: bDisplayMode,
          columnEditMode: columnEditMode
        };
      }
      return {
        displaymode: undefined,
        columnEditMode: undefined
      };
    },
    _insertAggregation: function (oValueHelp, oModifier, oTable) {
      if (oValueHelp) {
        return oModifier.insertAggregation(oTable, "dependents", oValueHelp, 0);
      }
      return undefined;
    },
    /**
     * Invoked when a column is added using the table personalization dialog.
     *
     * @param sPropertyInfoName Name of the property for which the column is added
     * @param oTable Instance of table control
     * @param mPropertyBag Instance of property bag from the flexibility API
     * @returns Once resolved, a table column definition is returned
     */
    addItem: async function (sPropertyInfoName, oTable, mPropertyBag) {
      const oMetaModel = this._getMetaModel(mPropertyBag),
        oModifier = mPropertyBag.modifier,
        sTableId = oModifier.getId(oTable),
        aColumns = oTable.isA ? this.getColumnsFor(oTable) : null;
      if (!aColumns) {
        return Promise.resolve(null);
      }
      const oColumnInfo = aColumns.find(function (oColumn) {
        return oColumn.name === sPropertyInfoName;
      });
      if (!oColumnInfo) {
        Log.error(`${sPropertyInfoName} not found while adding column`);
        return Promise.resolve(null);
      }
      this._setDraftIndicatorStatus(oModifier, oTable, aColumns, oColumnInfo);
      // render custom column
      if (oColumnInfo.type === "Default") {
        return this._templateCustomColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      if (oColumnInfo.type === "Slot") {
        return this._templateSlotColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      // fall-back
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      const sPath = await DelegateUtil.getCustomData(oTable, "metaPath", oModifier);
      const sEntityTypePath = await DelegateUtil.getCustomData(oTable, "entityType", oModifier);
      const sRetrievedGroupId = await DelegateUtil.getCustomData(oTable, "requestGroupId", oModifier);
      const sGroupId = this._getGroupId(sRetrievedGroupId);
      const oTableContext = oMetaModel.createBindingContext(sPath);
      const aFetchedProperties = await this._getCachedOrFetchPropertiesForEntity(oTable, sEntityTypePath, oMetaModel, mPropertyBag.appComponent);
      const oPropertyInfo = aFetchedProperties.find(function (oInfo) {
        return oInfo.name === sPropertyInfoName;
      });
      const oPropertyContext = oMetaModel.createBindingContext(oPropertyInfo.metadataPath);
      const aVHProperties = this._getVHRelevantFields(oMetaModel, oPropertyInfo.metadataPath, sPath);
      const oParameters = {
        sBindingPath: sPath,
        sValueHelpType: "TableValueHelp",
        oControl: oTable,
        oMetaModel,
        oModifier,
        oPropertyInfo
      };
      const fnTemplateValueHelp = async sFragmentName => {
        const oThis = new JSONModel({
            id: sTableId,
            requestGroupId: sGroupId
          }),
          oPreprocessorSettings = {
            bindingContexts: {
              this: oThis.createBindingContext("/"),
              dataField: oPropertyContext,
              contextPath: oTableContext
            },
            models: {
              this: oThis,
              dataField: oMetaModel,
              metaModel: oMetaModel,
              contextPath: oMetaModel
            }
          };
        try {
          const oValueHelp = await DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {}, oModifier);
          return await this._insertAggregation(oValueHelp, oModifier, oTable);
        } catch (oError) {
          //We always resolve the promise to ensure that the app does not crash
          Log.error(`ValueHelp not loaded : ${oError.message}`);
          return null;
        } finally {
          oThis.destroy();
        }
      };
      const fnTemplateFragment = (oInPropertyInfo, oView) => {
        const sFragmentName = "sap.fe.macros.table.Column";
        let bDisplayMode;
        let sTableTypeCustomData;
        let sOnChangeCustomData;
        let sCreationModeCustomData;
        return Promise.all([DelegateUtil.getCustomData(oTable, "displayModePropertyBinding", oModifier), DelegateUtil.getCustomData(oTable, "tableType", oModifier), DelegateUtil.getCustomData(oTable, "onChange", oModifier), DelegateUtil.getCustomData(oTable, "creationMode", oModifier)]).then(aCustomData => {
          bDisplayMode = aCustomData[0];
          sTableTypeCustomData = aCustomData[1];
          sOnChangeCustomData = aCustomData[2];
          sCreationModeCustomData = aCustomData[3];
          // Read Only and Column Edit Mode can both have three state
          // Undefined means that the framework decides what to do
          // True / Display means always read only
          // False / Editable means editable but while still respecting the low level principle (immutable property will not be editable)
          const oDisplayModes = this._getDisplayMode(bDisplayMode);
          bDisplayMode = oDisplayModes.displaymode;
          const columnEditMode = oDisplayModes.columnEditMode;
          const oThis = new JSONModel({
              enableAutoColumnWidth: oTable.getParent().enableAutoColumnWidth,
              isOptimizedForSmallDevice: oTable.getParent().isOptimizedForSmallDevice,
              readOnly: bDisplayMode,
              columnEditMode: columnEditMode,
              tableType: sTableTypeCustomData,
              onChange: sOnChangeCustomData,
              id: sTableId,
              navigationPropertyPath: sPropertyInfoName,
              columnInfo: oColumnInfo,
              collection: {
                sPath: sPath,
                oModel: oMetaModel
              },
              creationMode: sCreationModeCustomData
            }),
            oPreprocessorSettings = {
              bindingContexts: {
                entitySet: oTableContext,
                collection: oTableContext,
                dataField: oPropertyContext,
                this: oThis.createBindingContext("/"),
                column: oThis.createBindingContext("/columnInfo")
              },
              models: {
                this: oThis,
                entitySet: oMetaModel,
                collection: oMetaModel,
                dataField: oMetaModel,
                metaModel: oMetaModel,
                column: oThis
              },
              appComponent: mPropertyBag.appComponent
            };
          return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {
            view: oView
          }, oModifier).finally(function () {
            oThis.destroy();
          });
        });
      };
      await Promise.all(aVHProperties.map(async sPropertyName => {
        const mParameters = Object.assign({}, oParameters, {
          sPropertyName: sPropertyName
        });
        const aResults = await Promise.all([DelegateUtil.isValueHelpRequired(mParameters), DelegateUtil.doesValueHelpExist(mParameters)]);
        const bValueHelpRequired = aResults[0],
          bValueHelpExists = aResults[1];
        return this._fnTemplateValueHelp(fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists);
      }));
      // If view is not provided try to get it by accessing to the parental hierarchy
      // If it doesn't work (table into an unattached OP section) get the view via the AppComponent
      const view = mPropertyBag.view || CommonUtils.getTargetView(oTable) || (mPropertyBag.appComponent ? CommonUtils.getCurrentPageView(mPropertyBag.appComponent) : undefined);
      return fnTemplateFragment(oPropertyInfo, view);
    },
    /**
     * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields.
     *
     * @returns Object for the Tables filter personalization.
     */
    getFilterDelegate: function () {
      return Object.assign({}, FilterBarDelegate, {
        addItem: function (sPropertyInfoName, oParentControl) {
          if (sPropertyInfoName.indexOf("Property::") === 0) {
            // Correct the name of complex property info references.
            sPropertyInfoName = sPropertyInfoName.replace("Property::", "");
          }
          return FilterBarDelegate.addItem(sPropertyInfoName, oParentControl);
        }
      });
    },
    /**
     * Returns the TypeUtil attached to this delegate.
     *
     * @returns Any instance of TypeUtil
     */
    getTypeUtil: function /*oPayload: object*/
    () {
      return TypeUtil;
    },
    formatGroupHeader(oTable, oContext, sProperty) {
      var _oFormatInfo$typeConf, _oFormatInfo$typeConf2;
      const mFormatInfos = DelegateUtil.getCachedProperties(oTable),
        oFormatInfo = mFormatInfos && mFormatInfos.filter(obj => {
          return obj.name === sProperty;
        })[0],
        /*For a Date or DateTime property, the value is returned in external format using a UI5 type for the
              given property path that formats corresponding to the property's EDM type and constraints*/
        bExternalFormat = (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf === void 0 ? void 0 : _oFormatInfo$typeConf.baseType) === "DateTime" || (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf2 = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf2 === void 0 ? void 0 : _oFormatInfo$typeConf2.baseType) === "Date";
      let sValue;
      if (oFormatInfo && oFormatInfo.mode) {
        switch (oFormatInfo.mode) {
          case "Description":
            sValue = oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat);
            break;
          case "DescriptionValue":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat), oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat));
            break;
          case "ValueDescription":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat), oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat));
            break;
          default:
            break;
        }
      } else {
        sValue = oContext.getProperty(oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.path, bExternalFormat);
      }
      return getResourceModel(oTable).getText("M_TABLE_GROUP_HEADER_TITLE", [oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.label, sValue]);
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlQmFzZSIsIl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JGaWVsZEdyb3VwIiwib1RhYmxlIiwib1Byb3BlcnR5IiwiYVByb3BlcnRpZXMiLCJuYW1lIiwiaW5kZXhPZiIsIm9Db2x1bW4iLCJnZXRDb2x1bW5zIiwiZmluZCIsIm9Db2wiLCJnZXREYXRhUHJvcGVydHkiLCJiU2hvd0RhdGFGaWVsZHNMYWJlbCIsImRhdGEiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJpbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRDb250ZXh0IiwibWV0YWRhdGFQYXRoIiwiY29udmVydGVkTWV0YURhdGEiLCJjb252ZXJ0ZWRUeXBlcyIsIm9EYXRhRmllbGQiLCJ0YXJnZXRPYmplY3QiLCJvRmllbGRHcm91cCIsIlRhcmdldCIsIiR0YXJnZXQiLCJhRmllbGRXaWR0aCIsIkRhdGEiLCJmb3JFYWNoIiwib0RhdGEiLCJvRGF0YUZpZWxkV2lkdGgiLCIkVHlwZSIsIlRhYmxlU2l6ZUhlbHBlciIsImdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsImdldFdpZHRoRm9yRGF0YUZpZWxkIiwibGFiZWxXaWR0aCIsInByb3BlcnR5V2lkdGgiLCJTaXplSGVscGVyIiwiZ2V0QnV0dG9uV2lkdGgiLCJMYWJlbCIsInB1c2giLCJuV2lkZXN0IiwicmVkdWNlIiwiYWNjIiwidmFsdWUiLCJNYXRoIiwibWF4IiwidmlzdWFsU2V0dGluZ3MiLCJkZWVwRXh0ZW5kIiwid2lkdGhDYWxjdWxhdGlvbiIsInZlcnRpY2FsQXJyYW5nZW1lbnQiLCJtaW5XaWR0aCIsImNlaWwiLCJfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVmFsdWVIZWxwIiwidGFibGUiLCJwcm9wZXJ0eSIsInRhYmxlQVBJIiwiZ2V0UGFyZW50IiwicHJvcGVydHlJbmZvcyIsIm1ldGFNb2RlbCIsImRhdGFGaWVsZCIsImdldE9iamVjdCIsImdhcCIsImdldFByb3BlcnR5IiwiX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFVuaXQiLCJvVW5pdCIsIm9Vbml0VGV4dCIsIm9UaW1lem9uZVRleHQiLCJvVGFibGVBUEkiLCJzVW5pdFRleHQiLCJnZXRSZWFkT25seSIsIl9jb21wdXRlTGFiZWwiLCJsYWJlbE1hcCIsImxhYmVsIiwicHJvcGVydGllc1dpdGhTYW1lTGFiZWwiLCJsZW5ndGgiLCJwYXRoIiwiaW5jbHVkZXMiLCJhZGRpdGlvbmFsTGFiZWxzIiwiam9pbiIsIl91cGRhdGVQcm9wZXJ0eUluZm8iLCJwcm9wZXJ0aWVzIiwicDEzbk1vZGUiLCJnZXRQMTNuTW9kZSIsInNvcnRhYmxlIiwiZmlsdGVyYWJsZSIsImdyb3VwYWJsZSIsInVuZGVmaW5lZCIsImNvbmNhdCIsInR5cGVDb25maWciLCJnZXRDb2x1bW5zRm9yIiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIl9nZXRBZ2dyZWdhdGVkUHJvcGVydHlNYXAiLCJhZ2dyZWdhdGVzIiwiZmV0Y2hFeHBvcnRDYXBhYmlsaXRpZXMiLCJvQ2FwYWJpbGl0aWVzIiwiWExTWCIsIm9Nb2RlbCIsIkRlbGVnYXRlVXRpbCIsImZldGNoTW9kZWwiLCJ0aGVuIiwibW9kZWwiLCJhU3VwcG9ydGVkRm9ybWF0cyIsImFMb3dlckZvcm1hdHMiLCJtYXAiLCJlbGVtZW50IiwidG9Mb3dlckNhc2UiLCJvQW5ub3RhdGlvbiIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5IiwiY29sdW1uSW5mbyIsInRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aCIsImdldEN1c3RvbURhdGEiLCJjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcyIsImFubm90YXRpb25QYXRoIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJ0YWJsZVRhcmdldEVudGl0eUluZGV4IiwiZmluZEluZGV4IiwicHJvcCIsInRhcmdldFR5cGUiLCJ0YXJnZXRFbnRpdHlUeXBlIiwicmVsYXRpdmVOYXZpZ2F0aW9uUHJvcGVydGllcyIsInNsaWNlIiwicmVsYXRpdmVQYXRoIiwiaXNQYXJ0T2ZMaW5lSXRlbSIsInNvbWUiLCJpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5IiwiX2ZldGNoUHJvcGVydHlJbmZvIiwiYXBwQ29tcG9uZW50Iiwic0Fic29sdXRlTmF2aWdhdGlvblBhdGgiLCJvTmF2aWdhdGlvbkNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9UeXBlQ29uZmlnIiwiY2xhc3NOYW1lIiwiaXNUeXBlRmlsdGVyYWJsZSIsIlR5cGVVdGlsIiwiZ2V0VHlwZUNvbmZpZyIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsImJGaWx0ZXJhYmxlIiwiQ29tbW9uSGVscGVyIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJpc0NvbXBsZXhUeXBlIiwiYklzQW5hbHl0aWNhbFRhYmxlIiwiYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcFVuZmlsdGVyYWJsZSIsImdldExvY2FsaXplZFRleHQiLCJwcm9wZXJ0eUluZm8iLCJncm91cExhYmVsIiwiZ3JvdXAiLCJ0b29sdGlwIiwidmlzaWJsZSIsImF2YWlsYWJpbGl0eSIsImV4cG9ydFNldHRpbmdzIiwiX3NldFByb3BlcnR5SW5mb0V4cG9ydFNldHRpbmdzIiwidW5pdCIsImtleXMiLCJleHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSIsIndyYXAiLCJfdXBkYXRlQW5hbHl0aWNhbFByb3BlcnR5SW5mb0F0dHJpYnV0ZXMiLCJleHRlbnNpb24iLCJ0ZWNobmljYWxseUdyb3VwYWJsZSIsImtleSIsImlzS2V5IiwiaXNHcm91cGFibGUiLCJ0ZXh0QXJyYW5nZW1lbnQiLCJkZXNjcmlwdGlvbkNvbHVtbiIsInRleHRQcm9wZXJ0eSIsIm1vZGUiLCJ2YWx1ZVByb3BlcnR5IiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsInRleHQiLCJjYXNlU2Vuc2l0aXZlIiwiYWRkaXRpb25hbExhYmVsIiwidW5pdFRleHQiLCJ0aW1lem9uZVRleHQiLCJleHBvcnRGb3JtYXQiLCJfZ2V0RXhwb3J0Rm9ybWF0IiwidGltZXpvbmVQcm9wZXJ0eSIsImZvcm1hdCIsInRlbXBsYXRlIiwiYWdncmVnYXRhYmxlIiwiX2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvIiwib0NvbHVtbkluZm8iLCJvQXBwQ29tcG9uZW50Iiwic0xhYmVsIiwiaGVhZGVyIiwib1Byb3BlcnR5SW5mbyIsInR5cGUiLCJfYkNvbHVtbkhhc1Byb3BlcnR5V2l0aERyYWZ0SW5kaWNhdG9yIiwiaGFzRHJhZnRJbmRpY2F0b3IiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJfdXBkYXRlRHJhZnRJbmRpY2F0b3JNb2RlbCIsIl9vVGFibGUiLCJfb0NvbHVtbkluZm8iLCJhVmlzaWJsZUNvbHVtbnMiLCJvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic0ludGVybmFsUGF0aCIsImdldFBhdGgiLCJpbmRleCIsInNldFByb3BlcnR5IiwiX2ZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsInNFbnRpdHlUeXBlUGF0aCIsInNCaW5kaW5nUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0RW50aXR5U2V0UGF0aCIsImFGZXRjaGVkUHJvcGVydGllcyIsIm9GUiIsIkNvbW1vblV0aWxzIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoIiwiYU5vbkZpbHRlcmFibGVQcm9wcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhQ29sdW1ucyIsIm1heENvbmRpdGlvbnMiLCJpc011bHRpVmFsdWUiLCJFcnJvciIsIl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsImVudGl0eVR5cGVQYXRoIiwiZmV0Y2hlZFByb3BlcnRpZXMiLCJnZXRDYWNoZWRQcm9wZXJ0aWVzIiwic3ViRmV0Y2hlZFByb3BlcnRpZXMiLCJzZXRDYWNoZWRQcm9wZXJ0aWVzIiwiX3NldFRhYmxlTm9EYXRhVGV4dCIsIm9CaW5kaW5nSW5mbyIsInNOb0RhdGFLZXkiLCJvVGFibGVGaWx0ZXJJbmZvIiwiVGFibGVVdGlscyIsImdldEFsbEZpbHRlckluZm8iLCJzdWZmaXhSZXNvdXJjZUtleSIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzIiwic0ZpbHRlckFzc29jaWF0aW9uIiwiZ2V0RmlsdGVyIiwidGVzdCIsInNlYXJjaCIsImZpbHRlcnMiLCJzZXROb0RhdGEiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkIiwib0ludGVybmFsTW9kZWxDb250ZXh0Iiwib0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwiYkRhdGFSZWNlaXZlZEF0dGFjaGVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsIkpTT04iLCJwYXJzZSIsInBhcnNlQ3VzdG9tRGF0YSIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50IiwiRGVsZXRlSGVscGVyIiwidXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMiLCJzZXRVcEVtcHR5Um93cyIsInJlYmluZCIsImJJc1N1c3BlbmRlZCIsImNsZWFyU2VsZWN0aW9uIiwiYXBwbHkiLCJvblRhYmxlQm91bmQiLCJ3aGVuQm91bmQiLCJvRXJyb3IiLCJmZXRjaFByb3BlcnRpZXMiLCJwcmVJbml0Iiwib0Zhc3RDcmVhdGlvblJvdyIsImdldENyZWF0aW9uUm93Iiwic2V0QmluZGluZ0NvbnRleHQiLCJ1cGRhdGVCaW5kaW5nSW5mbyIsIl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvIiwiZXZlbnRzIiwiZGF0YVJlY2VpdmVkIiwib25JbnRlcm5hbERhdGFSZWNlaXZlZCIsImJpbmQiLCJkYXRhUmVxdWVzdGVkIiwib25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQiLCJUYWJsZUhlbHBlciIsImVuYWJsZUZhc3RDcmVhdGlvblJvdyIsIl9tYW5hZ2VTZW1hbnRpY1RhcmdldHMiLCJvTURDVGFibGUiLCJvUm93QmluZGluZyIsImF0dGFjaEV2ZW50T25jZSIsInNldFRpbWVvdXQiLCJfb1ZpZXciLCJnZXRUYXJnZXRWaWV3IiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlIiwiZ2V0Q29udHJvbGxlciIsInVwZGF0ZUJpbmRpbmciLCJiTmVlZE1hbnVhbFJlZnJlc2giLCJzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkiLCJiUGVuZGluZ01hbnVhbFVwZGF0ZSIsIm9sZEZpbHRlcnMiLCJnZXRGaWx0ZXJzIiwiZGVlcEVxdWFsIiwiZ2V0UXVlcnlPcHRpb25zRnJvbVBhcmFtZXRlcnMiLCIkc2VhcmNoIiwicGFyYW1ldGVycyIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsImZpcmVFdmVudCIsInJlcXVlc3RSZWZyZXNoIiwiZ2V0R3JvdXBJZCIsImZpbmFsbHkiLCJfY29tcHV0ZVJvd0JpbmRpbmdJbmZvRnJvbVRlbXBsYXRlIiwicm93QmluZGluZ0luZm8iLCJkZWVwQ2xvbmUiLCIkJGdldEtlZXBBbGl2ZUNvbnRleHQiLCJjb2xsZWN0aW9uUGF0aCIsImludGVybmFsTW9kZWwiLCJrZXB0QWxpdmVMaXN0cyIsImdldElkIiwic3VzcGVuZGVkIiwib0ZpbHRlciIsIm9GaWx0ZXJJbmZvIiwiRmlsdGVyIiwiYW5kIiwiYmluZGluZ1BhdGgiLCJvRGF0YVN0YXRlSW5kaWNhdG9yIiwiZ2V0RGF0YVN0YXRlSW5kaWNhdG9yIiwiaXNGaWx0ZXJpbmciLCJ1cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeSIsImJpbmRpbmdJbmZvIiwiZmlsdGVySW5mbyIsImZpbHRlciIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iLCJfdGVtcGxhdGVDdXN0b21Db2x1bW5GcmFnbWVudCIsIm9WaWV3Iiwib01vZGlmaWVyIiwic1RhYmxlSWQiLCJvQ29sdW1uTW9kZWwiLCJKU09OTW9kZWwiLCJvVGhpcyIsImlkIiwib1ByZXByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwidGhpcyIsImNvbHVtbiIsIm1vZGVscyIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwidmlldyIsIm9JdGVtIiwiZGVzdHJveSIsIl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudCIsInNsb3RDb2x1bW5zWE1MIiwiaXNYTUwiLCJzbG90WE1MIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJtZGNUYWJsZVRlbXBsYXRlWE1MIiwicmVtb3ZlQ2hpbGQiLCJvVGVtcGxhdGUiLCJET01QYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJhcHBlbmRDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwidGFyZ2V0cyIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJkYXRhVHlwZSIsIkV4Y2VsRm9ybWF0IiwiZ2V0RXhjZWxEYXRlZnJvbUpTRGF0ZSIsImdldEV4Y2VsRGF0ZVRpbWVmcm9tSlNEYXRlVGltZSIsImdldEV4Y2VsVGltZWZyb21KU1RpbWUiLCJfZ2V0VkhSZWxldmFudEZpZWxkcyIsInNNZXRhZGF0YVBhdGgiLCJhRmllbGRzIiwib0RhdGFGaWVsZERhdGEiLCIka2luZCIsIm9WYWx1ZSIsImlJbmRleCIsInN1YnN0cmluZyIsImdldE5hdmlnYXRpb25QYXRoIiwiX3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uIiwiYUNvbHVtbnNXaXRoRHJhZnRJbmRpY2F0b3IiLCJzQWRkVmlzaWJsZUNvbHVtbk5hbWUiLCJzVmlzaWJsZUNvbHVtbk5hbWUiLCJiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0Iiwic0NvbHVtbk5hbWVXaXRoRHJhZnRJbmRpY2F0b3IiLCJpIiwiaiIsInJlbW92ZUl0ZW0iLCJvUHJvcGVydHlJbmZvTmFtZSIsIm1Qcm9wZXJ0eUJhZyIsImRvUmVtb3ZlSXRlbSIsIm1vZGlmaWVyIiwic0RhdGFQcm9wZXJ0eSIsImluc2VydEFnZ3JlZ2F0aW9uIiwiaXNBIiwiX3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzIiwiX2dldE1ldGFNb2RlbCIsIl9nZXRHcm91cElkIiwic1JldHJpZXZlZEdyb3VwSWQiLCJfZ2V0RGVwZW5kZW50Iiwib0RlcGVuZGVudCIsInNQcm9wZXJ0eUluZm9OYW1lIiwiX2ZuVGVtcGxhdGVWYWx1ZUhlbHAiLCJmblRlbXBsYXRlVmFsdWVIZWxwIiwiYlZhbHVlSGVscFJlcXVpcmVkIiwiYlZhbHVlSGVscEV4aXN0cyIsIl9nZXREaXNwbGF5TW9kZSIsImJEaXNwbGF5TW9kZSIsImNvbHVtbkVkaXRNb2RlIiwiZGlzcGxheW1vZGUiLCJfaW5zZXJ0QWdncmVnYXRpb24iLCJvVmFsdWVIZWxwIiwiYWRkSXRlbSIsInNQYXRoIiwic0dyb3VwSWQiLCJvVGFibGVDb250ZXh0Iiwib0luZm8iLCJvUHJvcGVydHlDb250ZXh0IiwiYVZIUHJvcGVydGllcyIsIm9QYXJhbWV0ZXJzIiwic1ZhbHVlSGVscFR5cGUiLCJvQ29udHJvbCIsInNGcmFnbWVudE5hbWUiLCJyZXF1ZXN0R3JvdXBJZCIsImNvbnRleHRQYXRoIiwibWVzc2FnZSIsImZuVGVtcGxhdGVGcmFnbWVudCIsIm9JblByb3BlcnR5SW5mbyIsInNUYWJsZVR5cGVDdXN0b21EYXRhIiwic09uQ2hhbmdlQ3VzdG9tRGF0YSIsInNDcmVhdGlvbk1vZGVDdXN0b21EYXRhIiwiYWxsIiwiYUN1c3RvbURhdGEiLCJvRGlzcGxheU1vZGVzIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSIsInJlYWRPbmx5IiwidGFibGVUeXBlIiwib25DaGFuZ2UiLCJuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiY29sbGVjdGlvbiIsImNyZWF0aW9uTW9kZSIsImVudGl0eVNldCIsInNQcm9wZXJ0eU5hbWUiLCJtUGFyYW1ldGVycyIsImFSZXN1bHRzIiwiaXNWYWx1ZUhlbHBSZXF1aXJlZCIsImRvZXNWYWx1ZUhlbHBFeGlzdCIsImdldEN1cnJlbnRQYWdlVmlldyIsImdldEZpbHRlckRlbGVnYXRlIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJvUGFyZW50Q29udHJvbCIsInJlcGxhY2UiLCJnZXRUeXBlVXRpbCIsImZvcm1hdEdyb3VwSGVhZGVyIiwib0NvbnRleHQiLCJzUHJvcGVydHkiLCJtRm9ybWF0SW5mb3MiLCJvRm9ybWF0SW5mbyIsIm9iaiIsImJFeHRlcm5hbEZvcm1hdCIsImJhc2VUeXBlIiwic1ZhbHVlIiwiVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRXaXRoQnJhY2tldHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiwgRmllbGRHcm91cFR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBFcXVhbFwiO1xuaW1wb3J0IGRlZXBFeHRlbmQgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcEV4dGVuZFwiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdGNvbHVtbkV4cG9ydFNldHRpbmdzLFxuXHRDdXN0b21CYXNlZFRhYmxlQ29sdW1uLFxuXHRUYWJsZUNvbHVtbixcblx0VGVjaG5pY2FsQ29sdW1uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgeyBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFZhbHVlRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1ZhbHVlRm9ybWF0dGVyXCI7XG5pbXBvcnQgRGVsZXRlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0RlbGV0ZUhlbHBlclwiO1xuaW1wb3J0IEV4Y2VsRm9ybWF0IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0V4Y2VsRm9ybWF0SGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldExvY2FsaXplZFRleHQsIGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2l6ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TaXplSGVscGVyXCI7XG5pbXBvcnQgeyBpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUluZm8sIHRhYmxlRGVsZWdhdGVNb2RlbCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJCYXJEZWxlZ2F0ZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGVCYXNlIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L1RhYmxlRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZUFQSSBmcm9tIFwiLi4vVGFibGVBUElcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwiLi4vVGFibGVIZWxwZXJcIjtcblxuY29uc3QgU0VNQU5USUNLRVlfSEFTX0RSQUZUSU5ESUNBVE9SID0gXCIvc2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvclwiO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3Igc2FwLnVpLm1kYy5UYWJsZS5cbiAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuICogVGhlIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgdGhlIEFQSSBhbmQgdGhlIGJlaGF2aW9yIGFyZSBub3QgZmluYWxpemVkLiBUaGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZS5cbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjY5LjBcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlRGVsZWdhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgVGFibGVEZWxlZ2F0ZUJhc2UsIHtcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FsY3VsYXRlcyB0aGUgd2lkdGggZm9yIGEgRmllbGRHcm91cCBjb2x1bW4uXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgRmllbGRHcm91cCBpcyB0aGUgd2lkdGggb2YgdGhlIHdpZGVzdCBwcm9wZXJ0eSBjb250YWluZWQgaW4gdGhlIEZpZWxkR3JvdXAgKGluY2x1ZGluZyB0aGUgbGFiZWwgaWYgc2hvd0RhdGFGaWVsZHNMYWJlbCBpcyB0cnVlKVxuXHQgKiBUaGUgcmVzdWx0IG9mIHRoaXMgY2FsY3VsYXRpb24gaXMgc3RvcmVkIGluIHRoZSB2aXN1YWxTZXR0aW5ncy53aWR0aENhbGN1bGF0aW9uLm1pbldpZHRoIHByb3BlcnR5LCB3aGljaCBpcyB1c2VkIGJ5IHRoZSBNREN0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZSBJbnN0YW5jZSBvZiB0aGUgTURDdGFibGVcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBDdXJyZW50IHByb3BlcnR5XG5cdCAqIEBwYXJhbSBhUHJvcGVydGllcyBBcnJheSBvZiBwcm9wZXJ0aWVzXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlRGVsZWdhdGVcblx0ICovXG5cdF9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JGaWVsZEdyb3VwOiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgb1Byb3BlcnR5OiBhbnksIGFQcm9wZXJ0aWVzOiBhbnlbXSkge1xuXHRcdGlmIChvUHJvcGVydHkubmFtZS5pbmRleE9mKFwiRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjo6RmllbGRHcm91cDo6XCIpID09PSAwKSB7XG5cdFx0XHRjb25zdCBvQ29sdW1uID0gb1RhYmxlLmdldENvbHVtbnMoKS5maW5kKGZ1bmN0aW9uIChvQ29sOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db2wuZ2V0RGF0YVByb3BlcnR5KCkgPT09IG9Qcm9wZXJ0eS5uYW1lO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBiU2hvd0RhdGFGaWVsZHNMYWJlbCA9IG9Db2x1bW4gPyBvQ29sdW1uLmRhdGEoXCJzaG93RGF0YUZpZWxkc0xhYmVsXCIpID09PSBcInRydWVcIiA6IGZhbHNlO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9UYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdFx0Y29uc3QgaW52b2x2ZWREYXRhTW9kZWxPYmplY3RzID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuZ2V0Q29udGV4dChvUHJvcGVydHkubWV0YWRhdGFQYXRoKSk7XG5cdFx0XHRjb25zdCBjb252ZXJ0ZWRNZXRhRGF0YSA9IGludm9sdmVkRGF0YU1vZGVsT2JqZWN0cy5jb252ZXJ0ZWRUeXBlcztcblx0XHRcdGNvbnN0IG9EYXRhRmllbGQgPSBpbnZvbHZlZERhdGFNb2RlbE9iamVjdHMudGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZEZvckFubm90YXRpb247XG5cdFx0XHRjb25zdCBvRmllbGRHcm91cCA9IG9EYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQgYXMgRmllbGRHcm91cFR5cGU7XG5cdFx0XHRjb25zdCBhRmllbGRXaWR0aDogYW55ID0gW107XG5cdFx0XHRvRmllbGRHcm91cC5EYXRhLmZvckVhY2goZnVuY3Rpb24gKG9EYXRhOiBhbnkpIHtcblx0XHRcdFx0bGV0IG9EYXRhRmllbGRXaWR0aDogYW55O1xuXHRcdFx0XHRzd2l0Y2ggKG9EYXRhLiRUeXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IFRhYmxlU2l6ZUhlbHBlci5nZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdG9EYXRhLFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVkTWV0YURhdGEsXG5cdFx0XHRcdFx0XHRcdGJTaG93RGF0YUZpZWxkc0xhYmVsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiOlxuXHRcdFx0XHRcdFx0b0RhdGFGaWVsZFdpZHRoID0gVGFibGVTaXplSGVscGVyLmdldFdpZHRoRm9yRGF0YUZpZWxkKG9EYXRhLCBiU2hvd0RhdGFGaWVsZHNMYWJlbCwgYVByb3BlcnRpZXMsIGNvbnZlcnRlZE1ldGFEYXRhKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IHtcblx0XHRcdFx0XHRcdFx0bGFiZWxXaWR0aDogMCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlXaWR0aDogU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChvRGF0YS5MYWJlbClcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkV2lkdGgpIHtcblx0XHRcdFx0XHRhRmllbGRXaWR0aC5wdXNoKG9EYXRhRmllbGRXaWR0aC5sYWJlbFdpZHRoICsgb0RhdGFGaWVsZFdpZHRoLnByb3BlcnR5V2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG5XaWRlc3QgPSBhRmllbGRXaWR0aC5yZWR1Y2UoZnVuY3Rpb24gKGFjYzogYW55LCB2YWx1ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBNYXRoLm1heChhY2MsIHZhbHVlKTtcblx0XHRcdH0sIDApO1xuXHRcdFx0b1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzID0gZGVlcEV4dGVuZChvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MsIHtcblx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdHZlcnRpY2FsQXJyYW5nZW1lbnQ6IHRydWUsXG5cdFx0XHRcdFx0bWluV2lkdGg6IE1hdGguY2VpbChuV2lkZXN0KVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgcHJvcGVydHk6IFByb3BlcnR5SW5mbykge1xuXHRcdGNvbnN0IHRhYmxlQVBJID0gdGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0aWYgKCFwcm9wZXJ0eS5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSB0YWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0aWYgKHByb3BlcnR5Lm1ldGFkYXRhUGF0aCAmJiBtZXRhTW9kZWwpIHtcblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eS5tZXRhZGF0YVBhdGh9QGApO1xuXHRcdFx0XHRpZiAoZGF0YUZpZWxkICYmIGRhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdKSB7XG5cdFx0XHRcdFx0cHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKHByb3BlcnR5LnZpc3VhbFNldHRpbmdzIHx8IHt9LCB7XG5cdFx0XHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdGdhcDogdGFibGVBUEkuZ2V0UHJvcGVydHkoXCJyZWFkT25seVwiKSA/IDAgOiA0XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFVuaXQ6IGZ1bmN0aW9uIChcblx0XHRvVGFibGU6IGFueSxcblx0XHRvUHJvcGVydHk6IGFueSxcblx0XHRvVW5pdD86IHN0cmluZyxcblx0XHRvVW5pdFRleHQ/OiBzdHJpbmcsXG5cdFx0b1RpbWV6b25lVGV4dD86IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUgPyBvVGFibGUuZ2V0UGFyZW50KCkgOiBudWxsO1xuXHRcdC8vIHVwZGF0ZSBnYXAgZm9yIHByb3BlcnRpZXMgd2l0aCBzdHJpbmcgdW5pdFxuXHRcdGNvbnN0IHNVbml0VGV4dCA9IG9Vbml0VGV4dCB8fCBvVGltZXpvbmVUZXh0O1xuXHRcdGlmIChzVW5pdFRleHQpIHtcblx0XHRcdG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyA9IGRlZXBFeHRlbmQob1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzLCB7XG5cdFx0XHRcdHdpZHRoQ2FsY3VsYXRpb246IHtcblx0XHRcdFx0XHRnYXA6IE1hdGguY2VpbChTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKHNVbml0VGV4dCkpXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAob1VuaXQpIHtcblx0XHRcdG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyA9IGRlZXBFeHRlbmQob1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzLCB7XG5cdFx0XHRcdHdpZHRoQ2FsY3VsYXRpb246IHtcblx0XHRcdFx0XHQvLyBGb3IgcHJvcGVydGllcyB3aXRoIHVuaXQsIGEgZ2FwIG5lZWRzIHRvIGJlIGFkZGVkIHRvIHByb3Blcmx5IHJlbmRlciB0aGUgY29sdW1uIHdpZHRoIG9uIGVkaXQgbW9kZVxuXHRcdFx0XHRcdGdhcDogb1RhYmxlQVBJICYmIG9UYWJsZUFQSS5nZXRSZWFkT25seSgpID8gMCA6IDZcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jb21wdXRlTGFiZWw6IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHlJbmZvLCBsYWJlbE1hcDogeyBbbGFiZWw6IHN0cmluZ106IFByb3BlcnR5SW5mb1tdIH0pIHtcblx0XHRpZiAocHJvcGVydHkubGFiZWwpIHtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXNXaXRoU2FtZUxhYmVsID0gbGFiZWxNYXBbcHJvcGVydHkubGFiZWxdO1xuXHRcdFx0aWYgKHByb3BlcnRpZXNXaXRoU2FtZUxhYmVsPy5sZW5ndGggPiAxICYmIHByb3BlcnR5LnBhdGg/LmluY2x1ZGVzKFwiL1wiKSAmJiBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzKSB7XG5cdFx0XHRcdHByb3BlcnR5LmxhYmVsID0gcHJvcGVydHkubGFiZWwgKyBcIiAoXCIgKyBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzLmpvaW4oXCIgLyBcIikgKyBcIilcIjtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzO1xuXHRcdH1cblx0fSxcblx0Ly9VcGRhdGUgVmlzdWFsU2V0dGluZyBmb3IgY29sdW1uV2lkdGggY2FsY3VsYXRpb24gYW5kIGxhYmVscyBvbiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0X3VwZGF0ZVByb3BlcnR5SW5mbzogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgcHJvcGVydGllczogUHJvcGVydHlJbmZvW10pIHtcblx0XHRjb25zdCBsYWJlbE1hcDogeyBbbGFiZWw6IHN0cmluZ106IFByb3BlcnR5SW5mb1tdIH0gPSB7fTtcblx0XHQvLyBDaGVjayBhdmFpbGFibGUgcDEzbiBtb2Rlc1xuXHRcdGNvbnN0IHAxM25Nb2RlID0gdGFibGUuZ2V0UDEzbk1vZGUoKTtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eUluZm8pID0+IHtcblx0XHRcdGlmICghcHJvcGVydHkucHJvcGVydHlJbmZvcyAmJiBwcm9wZXJ0eS5sYWJlbCkge1xuXHRcdFx0XHQvLyBPbmx5IGZvciBub24tY29tcGxleCBwcm9wZXJ0aWVzXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQocDEzbk1vZGU/LmluZGV4T2YoXCJTb3J0XCIpID4gLTEgJiYgcHJvcGVydHkuc29ydGFibGUpIHx8XG5cdFx0XHRcdFx0KHAxM25Nb2RlPy5pbmRleE9mKFwiRmlsdGVyXCIpID4gLTEgJiYgcHJvcGVydHkuZmlsdGVyYWJsZSkgfHxcblx0XHRcdFx0XHQocDEzbk1vZGU/LmluZGV4T2YoXCJHcm91cFwiKSA+IC0xICYmIHByb3BlcnR5Lmdyb3VwYWJsZSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0bGFiZWxNYXBbcHJvcGVydHkubGFiZWxdID1cblx0XHRcdFx0XHRcdGxhYmVsTWFwW3Byb3BlcnR5LmxhYmVsXSAhPT0gdW5kZWZpbmVkID8gbGFiZWxNYXBbcHJvcGVydHkubGFiZWxdLmNvbmNhdChbcHJvcGVydHldKSA6IFtwcm9wZXJ0eV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBhbnkpID0+IHtcblx0XHRcdHRoaXMuX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvckZpZWxkR3JvdXAodGFibGUsIHByb3BlcnR5LCBwcm9wZXJ0aWVzKTtcblx0XHRcdHRoaXMuX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscCh0YWJsZSwgcHJvcGVydHkpO1xuXHRcdFx0Ly8gYmNwOiAyMjcwMDAzNTc3XG5cdFx0XHQvLyBTb21lIGNvbHVtbnMgKGVnOiBjdXN0b20gY29sdW1ucykgaGF2ZSBubyB0eXBlQ29uZmlnIHByb3BlcnR5LlxuXHRcdFx0Ly8gaW5pdGlhbGl6aW5nIGl0IHByZXZlbnRzIGFuIGV4Y2VwdGlvbiB0aHJvd1xuXHRcdFx0cHJvcGVydHkudHlwZUNvbmZpZyA9IGRlZXBFeHRlbmQocHJvcGVydHkudHlwZUNvbmZpZywge30pO1xuXHRcdFx0dGhpcy5fY29tcHV0ZUxhYmVsKHByb3BlcnR5LCBsYWJlbE1hcCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdH0sXG5cblx0Z2V0Q29sdW1uc0ZvcjogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSk6IFRhYmxlQ29sdW1uW10ge1xuXHRcdHJldHVybiAodGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmdldFRhYmxlRGVmaW5pdGlvbigpLmNvbHVtbnM7XG5cdH0sXG5cblx0X2dldEFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcDogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0cmV0dXJuIG9UYWJsZS5nZXRQYXJlbnQoKS5nZXRUYWJsZURlZmluaXRpb24oKS5hZ2dyZWdhdGVzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBleHBvcnQgY2FwYWJpbGl0aWVzIGZvciB0aGUgZ2l2ZW4gc2FwLnVpLm1kYy5UYWJsZSBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZSBJbnN0YW5jZSBvZiB0aGUgdGFibGVcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXByZXNlbnRpbmcgdGhlIGV4cG9ydCBjYXBhYmlsaXRpZXMgb2YgdGhlIHRhYmxlIGluc3RhbmNlXG5cdCAqL1xuXHRmZXRjaEV4cG9ydENhcGFiaWxpdGllczogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgb0NhcGFiaWxpdGllczogYW55ID0geyBYTFNYOiB7fSB9O1xuXHRcdGxldCBvTW9kZWwhOiBhbnk7XG5cdFx0cmV0dXJuIERlbGVnYXRlVXRpbC5mZXRjaE1vZGVsKG9UYWJsZSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChtb2RlbDogYW55KSB7XG5cdFx0XHRcdG9Nb2RlbCA9IG1vZGVsO1xuXHRcdFx0XHRyZXR1cm4gb01vZGVsLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi8kRW50aXR5Q29udGFpbmVyQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU3VwcG9ydGVkRm9ybWF0c1wiKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoYVN1cHBvcnRlZEZvcm1hdHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnN0IGFMb3dlckZvcm1hdHMgPSAoYVN1cHBvcnRlZEZvcm1hdHMgfHwgW10pLm1hcCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBlbGVtZW50LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoYUxvd2VyRm9ybWF0cy5pbmRleE9mKFwiYXBwbGljYXRpb24vcGRmXCIpID4gLTEpIHtcblx0XHRcdFx0XHRyZXR1cm4gb01vZGVsLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi8kRW50aXR5Q29udGFpbmVyQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBERi52MS5GZWF0dXJlc1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChvQW5ub3RhdGlvbjogYW55KSB7XG5cdFx0XHRcdGlmIChvQW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNbXCJQREZcIl0gPSBPYmplY3QuYXNzaWduKHt9LCBvQW5ub3RhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihgQW4gZXJyb3Igb2NjdXJzIHdoaWxlIGNvbXB1dGluZyBleHBvcnQgY2FwYWJpbGl0aWVzOiAke2Vycn1gKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBvQ2FwYWJpbGl0aWVzO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZpbHRlcmluZyBvbiAxOm4gbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGFuZCBuYXZpZ2F0aW9uXG5cdCAqIHByb3BlcnRpZXMgbm90IHBhcnQgb2YgdGhlIExpbmVJdGVtIGFubm90YXRpb24gaXMgZm9yYmlkZGVuLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29sdW1uSW5mb1xuXHQgKiBAcGFyYW0gbWV0YU1vZGVsXG5cdCAqIEBwYXJhbSB0YWJsZVxuXHQgKiBAcmV0dXJucyBCb29sZWFuIHRydWUgaWYgZmlsdGVyaW5nIGlzIGFsbG93ZWQsIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0X2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eTogZnVuY3Rpb24gKGNvbHVtbkluZm86IEFubm90YXRpb25UYWJsZUNvbHVtbiwgbWV0YU1vZGVsOiBNZXRhTW9kZWwsIHRhYmxlOiBUYWJsZSk6IEJvb2xlYW4ge1xuXHRcdC8vIGdldCB0aGUgRGF0YU1vZGVsT2JqZWN0UGF0aCBmb3IgdGhlIHRhYmxlXG5cdFx0Y29uc3QgdGFibGVEYXRhTW9kZWxPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcIm1ldGFQYXRoXCIpKSksXG5cdFx0XHQvLyBnZXQgYWxsIG5hdmlnYXRpb24gcHJvcGVydGllcyBsZWFkaW5nIHRvIHRoZSBjb2x1bW5cblx0XHRcdGNvbHVtbk5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KGNvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgpKS5uYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRcdC8vIHdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHJlbGF0aXZlIHRvIHRoZSB0YWJsZSwgc28gYWxsIGJlZm9yZSBhbmQgaW5jbHVkaW5nIHRoZSB0YWJsZXMgdGFyZ2V0VHlwZSBjYW4gYmUgZmlsdGVyZWRcblx0XHRcdHRhYmxlVGFyZ2V0RW50aXR5SW5kZXggPSBjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kSW5kZXgoXG5cdFx0XHRcdChwcm9wKSA9PiBwcm9wLnRhcmdldFR5cGU/Lm5hbWUgPT09IHRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLm5hbWVcblx0XHRcdCksXG5cdFx0XHRyZWxhdGl2ZU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29sdW1uTmF2aWdhdGlvblByb3BlcnRpZXMuc2xpY2UodGFibGVUYXJnZXRFbnRpdHlJbmRleCA+IDAgPyB0YWJsZVRhcmdldEVudGl0eUluZGV4IDogMCk7XG5cdFx0cmV0dXJuIChcblx0XHRcdCFjb2x1bW5JbmZvLnJlbGF0aXZlUGF0aC5pbmNsdWRlcyhcIi9cIikgfHxcblx0XHRcdChjb2x1bW5JbmZvLmlzUGFydE9mTGluZUl0ZW0gPT09IHRydWUgJiYgIXJlbGF0aXZlTmF2aWdhdGlvblByb3BlcnRpZXMuc29tZShpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5KSlcblx0XHQpO1xuXHR9LFxuXG5cdF9mZXRjaFByb3BlcnR5SW5mbzogZnVuY3Rpb24gKG1ldGFNb2RlbDogTWV0YU1vZGVsLCBjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIHRhYmxlOiBUYWJsZSwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCA9IGNvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRvRGF0YUZpZWxkID0gbWV0YU1vZGVsLmdldE9iamVjdChzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCksXG5cdFx0XHRvTmF2aWdhdGlvbkNvbnRleHQgPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Fic29sdXRlTmF2aWdhdGlvblBhdGgpIGFzIENvbnRleHQsXG5cdFx0XHRvVHlwZUNvbmZpZyA9XG5cdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZz8uY2xhc3NOYW1lICYmIGlzVHlwZUZpbHRlcmFibGUoY29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSlcblx0XHRcdFx0XHQ/IFR5cGVVdGlsLmdldFR5cGVDb25maWcoXG5cdFx0XHRcdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZy5jbGFzc05hbWUsXG5cdFx0XHRcdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcuY29uc3RyYWludHNcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IHt9LFxuXHRcdFx0YkZpbHRlcmFibGUgPSBDb21tb25IZWxwZXIuaXNQcm9wZXJ0eUZpbHRlcmFibGUob05hdmlnYXRpb25Db250ZXh0LCBvRGF0YUZpZWxkKSxcblx0XHRcdGlzQ29tcGxleFR5cGUgPVxuXHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcgJiYgY29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSAmJiBjb2x1bW5JbmZvLnR5cGVDb25maWcuY2xhc3NOYW1lPy5pbmRleE9mKFwiRWRtLlwiKSAhPT0gMCxcblx0XHRcdGJJc0FuYWx5dGljYWxUYWJsZSA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcImVuYWJsZUFuYWx5dGljc1wiKSA9PT0gXCJ0cnVlXCIsXG5cdFx0XHRhQWdncmVnYXRlZFByb3BlcnR5TWFwVW5maWx0ZXJhYmxlID0gYklzQW5hbHl0aWNhbFRhYmxlID8gdGhpcy5fZ2V0QWdncmVnYXRlZFByb3BlcnR5TWFwKHRhYmxlKSA6IHt9LFxuXHRcdFx0bGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KGNvbHVtbkluZm8ubGFiZWwgPz8gXCJcIiwgYXBwQ29tcG9uZW50ID8/IHRhYmxlKTtcblxuXHRcdGNvbnN0IHByb3BlcnR5SW5mbzogUHJvcGVydHlJbmZvID0ge1xuXHRcdFx0bmFtZTogY29sdW1uSW5mby5uYW1lLFxuXHRcdFx0bWV0YWRhdGFQYXRoOiBzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCxcblx0XHRcdGdyb3VwTGFiZWw6IGNvbHVtbkluZm8uZ3JvdXBMYWJlbCxcblx0XHRcdGdyb3VwOiBjb2x1bW5JbmZvLmdyb3VwLFxuXHRcdFx0bGFiZWw6IGxhYmVsLFxuXHRcdFx0dG9vbHRpcDogY29sdW1uSW5mby50b29sdGlwLFxuXHRcdFx0dHlwZUNvbmZpZzogb1R5cGVDb25maWcsXG5cdFx0XHR2aXNpYmxlOiBjb2x1bW5JbmZvLmF2YWlsYWJpbGl0eSAhPT0gXCJIaWRkZW5cIiAmJiAhaXNDb21wbGV4VHlwZSxcblx0XHRcdGV4cG9ydFNldHRpbmdzOiB0aGlzLl9zZXRQcm9wZXJ0eUluZm9FeHBvcnRTZXR0aW5ncyhjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLCBjb2x1bW5JbmZvKSxcblx0XHRcdHVuaXQ6IGNvbHVtbkluZm8udW5pdFxuXHRcdH07XG5cblx0XHQvLyBTZXQgdmlzdWFsU2V0dGluZ3Mgb25seSBpZiBpdCBleGlzdHNcblx0XHRpZiAoY29sdW1uSW5mby52aXN1YWxTZXR0aW5ncyAmJiBPYmplY3Qua2V5cyhjb2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8udmlzdWFsU2V0dGluZ3MgPSBjb2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzO1xuXHRcdH1cblxuXHRcdGlmIChjb2x1bW5JbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgPSBjb2x1bW5JbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIE1EQyBleHBlY3RzICAncHJvcGVydHlJbmZvcycgb25seSBmb3IgY29tcGxleCBwcm9wZXJ0aWVzLlxuXHRcdC8vIEFuIGVtcHR5IGFycmF5IHRocm93cyB2YWxpZGF0aW9uIGVycm9yIGFuZCB1bmRlZmluZWQgdmFsdWUgaXMgdW5oYW5kbGVkLlxuXHRcdGlmIChjb2x1bW5JbmZvLnByb3BlcnR5SW5mb3M/Lmxlbmd0aCkge1xuXHRcdFx0cHJvcGVydHlJbmZvLnByb3BlcnR5SW5mb3MgPSBjb2x1bW5JbmZvLnByb3BlcnR5SW5mb3M7XG5cdFx0XHQvL29ubHkgaW4gY2FzZSBvZiBjb21wbGV4IHByb3BlcnRpZXMsIHdyYXAgdGhlIGNlbGwgY29udGVudFx0b24gdGhlIGV4Y2VsIGV4cG9ydGVkIGZpbGVcblx0XHRcdGlmIChwcm9wZXJ0eUluZm8uZXhwb3J0U2V0dGluZ3MpIHtcblx0XHRcdFx0cHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzLndyYXAgPSBjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzPy53cmFwO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBBZGQgcHJvcGVydGllcyB3aGljaCBhcmUgc3VwcG9ydGVkIG9ubHkgYnkgc2ltcGxlIFByb3BlcnR5SW5mb3MuXG5cdFx0XHRwcm9wZXJ0eUluZm8ucGF0aCA9IGNvbHVtbkluZm8ucmVsYXRpdmVQYXRoO1xuXHRcdFx0Ly8gVE9ETyB3aXRoIHRoZSBuZXcgY29tcGxleCBwcm9wZXJ0eSBpbmZvLCBhIGxvdCBvZiBcIkRlc2NyaXB0aW9uXCIgZmllbGRzIGFyZSBhZGRlZCBhcyBmaWx0ZXIvc29ydCBmaWVsZHNcblx0XHRcdHByb3BlcnR5SW5mby5zb3J0YWJsZSA9IGNvbHVtbkluZm8uc29ydGFibGU7XG5cdFx0XHRpZiAoYklzQW5hbHl0aWNhbFRhYmxlKSB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUFuYWx5dGljYWxQcm9wZXJ0eUluZm9BdHRyaWJ1dGVzKHByb3BlcnR5SW5mbywgY29sdW1uSW5mbyk7XG5cdFx0XHR9XG5cdFx0XHRwcm9wZXJ0eUluZm8uZmlsdGVyYWJsZSA9XG5cdFx0XHRcdCEhYkZpbHRlcmFibGUgJiZcblx0XHRcdFx0dGhpcy5faXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5KGNvbHVtbkluZm8sIG1ldGFNb2RlbCwgdGFibGUpICYmXG5cdFx0XHRcdC8vIFRPRE8gaWdub3JpbmcgYWxsIHByb3BlcnRpZXMgdGhhdCBhcmUgbm90IGFsc28gYXZhaWxhYmxlIGZvciBhZGFwdGF0aW9uIGZvciBub3csIGJ1dCBwcm9wZXIgY29uY2VwdCByZXF1aXJlZFxuXHRcdFx0XHQoIWJJc0FuYWx5dGljYWxUYWJsZSB8fFxuXHRcdFx0XHRcdCghYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcFVuZmlsdGVyYWJsZVtwcm9wZXJ0eUluZm8ubmFtZV0gJiZcblx0XHRcdFx0XHRcdCEoY29sdW1uSW5mbyBhcyBUZWNobmljYWxDb2x1bW4pLmV4dGVuc2lvbj8udGVjaG5pY2FsbHlHcm91cGFibGUpKTtcblx0XHRcdHByb3BlcnR5SW5mby5rZXkgPSBjb2x1bW5JbmZvLmlzS2V5O1xuXHRcdFx0cHJvcGVydHlJbmZvLmdyb3VwYWJsZSA9IGNvbHVtbkluZm8uaXNHcm91cGFibGU7XG5cdFx0XHRpZiAoY29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgZGVzY3JpcHRpb25Db2x1bW4gPSAodGhpcy5nZXRDb2x1bW5zRm9yKHRhYmxlKSBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSkuZmluZChmdW5jdGlvbiAob0NvbCkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29sLm5hbWUgPT09IGNvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50Py50ZXh0UHJvcGVydHk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoZGVzY3JpcHRpb25Db2x1bW4pIHtcblx0XHRcdFx0XHRwcm9wZXJ0eUluZm8ubW9kZSA9IGNvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50Lm1vZGU7XG5cdFx0XHRcdFx0cHJvcGVydHlJbmZvLnZhbHVlUHJvcGVydHkgPSBjb2x1bW5JbmZvLnJlbGF0aXZlUGF0aDtcblx0XHRcdFx0XHRwcm9wZXJ0eUluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSA9IGRlc2NyaXB0aW9uQ29sdW1uLnJlbGF0aXZlUGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cHJvcGVydHlJbmZvLnRleHQgPSBjb2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudCAmJiBjb2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudC50ZXh0UHJvcGVydHk7XG5cdFx0XHRwcm9wZXJ0eUluZm8uY2FzZVNlbnNpdGl2ZSA9IGNvbHVtbkluZm8uY2FzZVNlbnNpdGl2ZTtcblx0XHRcdGlmIChjb2x1bW5JbmZvLmFkZGl0aW9uYWxMYWJlbHMpIHtcblx0XHRcdFx0cHJvcGVydHlJbmZvLmFkZGl0aW9uYWxMYWJlbHMgPSBjb2x1bW5JbmZvLmFkZGl0aW9uYWxMYWJlbHMubWFwKChhZGRpdGlvbmFsTGFiZWw6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBnZXRMb2NhbGl6ZWRUZXh0KGFkZGl0aW9uYWxMYWJlbCwgYXBwQ29tcG9uZW50IHx8IHRhYmxlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVW5pdCh0YWJsZSwgcHJvcGVydHlJbmZvLCBjb2x1bW5JbmZvLnVuaXQsIGNvbHVtbkluZm8udW5pdFRleHQsIGNvbHVtbkluZm8udGltZXpvbmVUZXh0KTtcblxuXHRcdHJldHVybiBwcm9wZXJ0eUluZm87XG5cdH0sXG5cblx0LyoqXG5cdCAqIEV4dGVuZCB0aGUgZXhwb3J0IHNldHRpbmdzIGJhc2VkIG9uIHRoZSBjb2x1bW4gaW5mby5cblx0ICpcblx0ICogQHBhcmFtIGV4cG9ydFNldHRpbmdzIFRoZSBleHBvcnQgc2V0dGluZ3MgdG8gYmUgZXh0ZW5kZWRcblx0ICogQHBhcmFtIGNvbHVtbkluZm8gVGhlIGNvbHVtbkluZm8gb2JqZWN0XG5cdCAqIEByZXR1cm5zIFRoZSBleHRlbmRlZCBleHBvcnQgc2V0dGluZ3Ncblx0ICovXG5cdF9zZXRQcm9wZXJ0eUluZm9FeHBvcnRTZXR0aW5nczogZnVuY3Rpb24gKFxuXHRcdGV4cG9ydFNldHRpbmdzOiBjb2x1bW5FeHBvcnRTZXR0aW5ncyB8IHVuZGVmaW5lZCB8IG51bGwsXG5cdFx0Y29sdW1uSW5mbzogQW5ub3RhdGlvblRhYmxlQ29sdW1uXG5cdCk6IGNvbHVtbkV4cG9ydFNldHRpbmdzIHwgdW5kZWZpbmVkIHwgbnVsbCB7XG5cdFx0Y29uc3QgZXhwb3J0Rm9ybWF0ID0gdGhpcy5fZ2V0RXhwb3J0Rm9ybWF0KGNvbHVtbkluZm8udHlwZUNvbmZpZz8uY2xhc3NOYW1lKTtcblx0XHRpZiAoZXhwb3J0U2V0dGluZ3MpIHtcblx0XHRcdGlmIChleHBvcnRGb3JtYXQgJiYgIWV4cG9ydFNldHRpbmdzLnRpbWV6b25lUHJvcGVydHkpIHtcblx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MuZm9ybWF0ID0gZXhwb3J0Rm9ybWF0O1xuXHRcdFx0fVxuXHRcdFx0Ly8gU2V0IHRoZSBleHBvcnRTZXR0aW5ncyB0ZW1wbGF0ZSBvbmx5IGlmIGl0IGV4aXN0cy5cblx0XHRcdGlmIChleHBvcnRTZXR0aW5ncy50ZW1wbGF0ZSkge1xuXHRcdFx0XHRleHBvcnRTZXR0aW5ncy50ZW1wbGF0ZSA9IGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3M/LnRlbXBsYXRlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZXhwb3J0U2V0dGluZ3M7XG5cdH0sXG5cblx0X3VwZGF0ZUFuYWx5dGljYWxQcm9wZXJ0eUluZm9BdHRyaWJ1dGVzKHByb3BlcnR5SW5mbzogUHJvcGVydHlJbmZvLCBjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4pIHtcblx0XHRpZiAoY29sdW1uSW5mby5hZ2dyZWdhdGFibGUpIHtcblx0XHRcdHByb3BlcnR5SW5mby5hZ2dyZWdhdGFibGUgPSBjb2x1bW5JbmZvLmFnZ3JlZ2F0YWJsZTtcblx0XHR9XG5cdFx0aWYgKGNvbHVtbkluZm8uZXh0ZW5zaW9uKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8uZXh0ZW5zaW9uID0gY29sdW1uSW5mby5leHRlbnNpb247XG5cdFx0fVxuXHR9LFxuXG5cdF9mZXRjaEN1c3RvbVByb3BlcnR5SW5mbzogZnVuY3Rpb24gKG9Db2x1bW5JbmZvOiBhbnksIG9UYWJsZTogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHRjb25zdCBzTGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KG9Db2x1bW5JbmZvLmhlYWRlciwgb0FwcENvbXBvbmVudCB8fCBvVGFibGUpOyAvLyBUb2RvOiBUbyBiZSByZW1vdmVkIG9uY2UgTURDIHByb3ZpZGVzIHRyYW5zbGF0aW9uIHN1cHBvcnRcblx0XHRjb25zdCBvUHJvcGVydHlJbmZvOiBhbnkgPSB7XG5cdFx0XHRuYW1lOiBvQ29sdW1uSW5mby5uYW1lLFxuXHRcdFx0Z3JvdXBMYWJlbDogdW5kZWZpbmVkLFxuXHRcdFx0Z3JvdXA6IHVuZGVmaW5lZCxcblx0XHRcdGxhYmVsOiBzTGFiZWwsXG5cdFx0XHR0eXBlOiBcIkVkbS5TdHJpbmdcIiwgLy8gVEJEXG5cdFx0XHR2aXNpYmxlOiBvQ29sdW1uSW5mby5hdmFpbGFiaWxpdHkgIT09IFwiSGlkZGVuXCIsXG5cdFx0XHRleHBvcnRTZXR0aW5nczogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxTZXR0aW5nczogb0NvbHVtbkluZm8udmlzdWFsU2V0dGluZ3Ncblx0XHR9O1xuXG5cdFx0Ly8gTURDIGV4cGVjdHMgJ3Byb3BlcnR5SW5mb3MnIG9ubHkgZm9yIGNvbXBsZXggcHJvcGVydGllcy5cblx0XHQvLyBBbiBlbXB0eSBhcnJheSB0aHJvd3MgdmFsaWRhdGlvbiBlcnJvciBhbmQgdW5kZWZpbmVkIHZhbHVlIGlzIHVuaGFuZGxlZC5cblx0XHRpZiAob0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcyAmJiBvQ29sdW1uSW5mby5wcm9wZXJ0eUluZm9zLmxlbmd0aCkge1xuXHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gb0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcztcblx0XHRcdC8vb25seSBpbiBjYXNlIG9mIGNvbXBsZXggcHJvcGVydGllcywgd3JhcCB0aGUgY2VsbCBjb250ZW50IG9uIHRoZSBleGNlbCBleHBvcnRlZCBmaWxlXG5cdFx0XHRvUHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0XHR3cmFwOiBvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy53cmFwLFxuXHRcdFx0XHR0ZW1wbGF0ZTogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGVtcGxhdGVcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFkZCBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgb25seSBieSBzaW1wbGUgUHJvcGVydHlJbmZvcy5cblx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IG9Db2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRvUHJvcGVydHlJbmZvLnNvcnRhYmxlID0gZmFsc2U7XG5cdFx0XHRvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPSBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH0sXG5cdF9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3I6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuICEhKFxuXHRcdFx0KG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMgJiYgb0NvbHVtbkluZm8uZm9ybWF0T3B0aW9ucy5oYXNEcmFmdEluZGljYXRvcikgfHxcblx0XHRcdChvQ29sdW1uSW5mby5mb3JtYXRPcHRpb25zICYmIG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoKVxuXHRcdCk7XG5cdH0sXG5cdF91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsOiBmdW5jdGlvbiAoX29UYWJsZTogYW55LCBfb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IF9vVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gX29UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IHNJbnRlcm5hbFBhdGggPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKGFWaXNpYmxlQ29sdW1ucyAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHRoaXMuX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvcihfb0NvbHVtbkluZm8pICYmXG5cdFx0XHRcdFx0X29Db2x1bW5JbmZvLm5hbWUgPT09IGFWaXNpYmxlQ29sdW1uc1tpbmRleF0uZ2V0RGF0YVByb3BlcnR5KClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIF9vQ29sdW1uSW5mby5uYW1lKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2ZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHQvLyB3aGVuIGZldGNoaW5nIHByb3BlcnRpZXMsIHRoaXMgYmluZGluZyBjb250ZXh0IGlzIG5lZWRlZCAtIHNvIGxldHMgY3JlYXRlIGl0IG9ubHkgb25jZSBhbmQgdXNlIGlmIGZvciBhbGwgcHJvcGVydGllcy9kYXRhLWZpZWxkcy9saW5lLWl0ZW1zXG5cdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpO1xuXHRcdGxldCBhRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdFx0Y29uc3Qgb0ZSID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNCaW5kaW5nUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9GUi5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcztcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpKVxuXHRcdFx0LnRoZW4oKGFDb2x1bW5zOiBUYWJsZUNvbHVtbltdKSA9PiB7XG5cdFx0XHRcdC8vIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIGRvZXMgbm90IHdvcmsgdmlhICdlbnRpdHlTZXQvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEnXG5cdFx0XHRcdGlmIChhQ29sdW1ucykge1xuXHRcdFx0XHRcdGxldCBvUHJvcGVydHlJbmZvO1xuXHRcdFx0XHRcdGFDb2x1bW5zLmZvckVhY2goKG9Db2x1bW5JbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsKG9UYWJsZSwgb0NvbHVtbkluZm8pO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChvQ29sdW1uSW5mby50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoUHJvcGVydHlJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db2x1bW5JbmZvIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvICYmIGFOb25GaWx0ZXJhYmxlUHJvcHMuaW5kZXhPZihvUHJvcGVydHlJbmZvLm5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5tYXhDb25kaXRpb25zID0gRGVsZWdhdGVVdGlsLmlzTXVsdGlWYWx1ZShvUHJvcGVydHlJbmZvKSA/IC0xIDogMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJTbG90XCI6XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJEZWZhdWx0XCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvKG9Db2x1bW5JbmZvLCBvVGFibGUsIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5oYW5kbGVkIHN3aXRjaCBjYXNlICR7b0NvbHVtbkluZm8udHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMgPSB0aGlzLl91cGRhdGVQcm9wZXJ0eUluZm8ob1RhYmxlLCBhRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGBBbiBlcnJvciBvY2N1cnMgd2hpbGUgdXBkYXRpbmcgZmV0Y2hlZCBwcm9wZXJ0aWVzOiAke2Vycn1gKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBhRmV0Y2hlZFByb3BlcnRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHRfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHk6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIGVudGl0eVR5cGVQYXRoOiBzdHJpbmcsIG1ldGFNb2RlbDogYW55LCBhcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBmZXRjaGVkUHJvcGVydGllcyA9IERlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKHRhYmxlKTtcblxuXHRcdGlmIChmZXRjaGVkUHJvcGVydGllcykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShmZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkodGFibGUsIGVudGl0eVR5cGVQYXRoLCBtZXRhTW9kZWwsIGFwcENvbXBvbmVudCkudGhlbihmdW5jdGlvbiAoc3ViRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdKSB7XG5cdFx0XHREZWxlZ2F0ZVV0aWwuc2V0Q2FjaGVkUHJvcGVydGllcyh0YWJsZSwgc3ViRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRcdFx0cmV0dXJuIHN1YkZldGNoZWRQcm9wZXJ0aWVzO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF9zZXRUYWJsZU5vRGF0YVRleHQ6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRsZXQgc05vRGF0YUtleSA9IFwiXCI7XG5cdFx0Y29uc3Qgb1RhYmxlRmlsdGVySW5mbyA9IFRhYmxlVXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvVGFibGUpLFxuXHRcdFx0c3VmZml4UmVzb3VyY2VLZXkgPSBvQmluZGluZ0luZm8ucGF0aC5zdGFydHNXaXRoKFwiL1wiKSA/IG9CaW5kaW5nSW5mby5wYXRoLnN1YnN0cigxKSA6IG9CaW5kaW5nSW5mby5wYXRoO1xuXG5cdFx0Y29uc3QgX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvVGFibGUuZGF0YShcImhpZGRlbkZpbHRlcnNcIikgfHwgb1RhYmxlLmRhdGEoXCJxdWlja0ZpbHRlcktleVwiKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfTVVMVElfVklFV1wiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX1dJVEhfRklMVEVSXCI7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzRmlsdGVyQXNzb2NpYXRpb24gPSBvVGFibGUuZ2V0RmlsdGVyKCk7XG5cblx0XHRpZiAoc0ZpbHRlckFzc29jaWF0aW9uICYmICEvQmFzaWNTZWFyY2gkLy50ZXN0KHNGaWx0ZXJBc3NvY2lhdGlvbikpIHtcblx0XHRcdC8vIGNoZWNrIGlmIGEgRmlsdGVyQmFyIGlzIGFzc29jaWF0ZWQgdG8gdGhlIFRhYmxlIChiYXNpYyBzZWFyY2ggb24gdG9vbEJhciBpcyBleGNsdWRlZClcblx0XHRcdGlmIChvVGFibGVGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob1RhYmxlRmlsdGVySW5mby5maWx0ZXJzICYmIG9UYWJsZUZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIHRhYmxlIGhhcyBhbnkgRmlsdGVyYmFyIGZpbHRlcnMgb3IgcGVyc29uYWxpemF0aW9uIGZpbHRlcnNcblx0XHRcdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNOb0RhdGFLZXkgPSBcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob1RhYmxlRmlsdGVySW5mby5zZWFyY2ggfHwgKG9UYWJsZUZpbHRlckluZm8uZmlsdGVycyAmJiBvVGFibGVGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSkge1xuXHRcdFx0Ly9jaGVjayBpZiB0YWJsZSBoYXMgYW55IHBlcnNvbmFsaXphdGlvbiBmaWx0ZXJzXG5cdFx0XHRzTm9EYXRhS2V5ID0gX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTm9EYXRhS2V5ID0gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19GSUxURVJTX05PX0RBVEFfVEVYVFwiO1xuXHRcdH1cblxuXHRcdG9UYWJsZS5zZXROb0RhdGEoZ2V0UmVzb3VyY2VNb2RlbChvVGFibGUpLmdldFRleHQoc05vRGF0YUtleSwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSkpO1xuXHR9LFxuXG5cdGhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9JbnRlcm5hbE1vZGVsQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvVGFibGUgJiYgb1RhYmxlLmdldFJvd0JpbmRpbmcoKSxcblx0XHRcdGJEYXRhUmVjZWl2ZWRBdHRhY2hlZCA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJkYXRhUmVjZWl2ZWRBdHRhY2hlZFwiKTtcblxuXHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQgJiYgIWJEYXRhUmVjZWl2ZWRBdHRhY2hlZCkge1xuXHRcdFx0b0JpbmRpbmcuYXR0YWNoRGF0YVJlY2VpdmVkKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gUmVmcmVzaCB0aGUgc2VsZWN0ZWQgY29udGV4dHMgdG8gdHJpZ2dlciByZS1jYWxjdWxhdGlvbiBvZiBlbmFibGVkIHN0YXRlIG9mIGFjdGlvbnMuXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgW10pO1xuXHRcdFx0XHRjb25zdCBhU2VsZWN0ZWRDb250ZXh0cyA9IG9UYWJsZS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgYVNlbGVjdGVkQ29udGV4dHMubGVuZ3RoKTtcblx0XHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IEpTT04ucGFyc2UoXG5cdFx0XHRcdFx0Q29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib3BlcmF0aW9uQXZhaWxhYmxlTWFwXCIpKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQob0ludGVybmFsTW9kZWxDb250ZXh0LCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBhU2VsZWN0ZWRDb250ZXh0cywgXCJ0YWJsZVwiKTtcblx0XHRcdFx0Ly8gUmVmcmVzaCBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b25cblx0XHRcdFx0RGVsZXRlSGVscGVyLnVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXHRcdFx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUgPyBvVGFibGUuZ2V0UGFyZW50KCkgOiBudWxsO1xuXHRcdFx0XHRpZiAob1RhYmxlQVBJKSB7XG5cdFx0XHRcdFx0b1RhYmxlQVBJLnNldFVwRW1wdHlSb3dzKG9UYWJsZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGF0YVJlY2VpdmVkQXR0YWNoZWRcIiwgdHJ1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlYmluZDogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGNvbnN0IGJJc1N1c3BlbmRlZCA9IG9UYWJsZUFQST8uZ2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIpO1xuXHRcdG9UYWJsZUFQST8uc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgYklzU3VzcGVuZGVkKTtcblx0XHRpZiAoIWJJc1N1c3BlbmRlZCkge1xuXHRcdFx0VGFibGVVdGlscy5jbGVhclNlbGVjdGlvbihvVGFibGUpO1xuXHRcdFx0VGFibGVEZWxlZ2F0ZUJhc2UucmViaW5kLmFwcGx5KHRoaXMsIFtvVGFibGUsIG9CaW5kaW5nSW5mb10pO1xuXHRcdFx0VGFibGVVdGlscy5vblRhYmxlQm91bmQob1RhYmxlKTtcblx0XHRcdHRoaXMuX3NldFRhYmxlTm9EYXRhVGV4dChvVGFibGUsIG9CaW5kaW5nSW5mbyk7XG5cdFx0XHRyZXR1cm4gVGFibGVVdGlscy53aGVuQm91bmQob1RhYmxlKVxuXHRcdFx0XHQudGhlbih0aGlzLmhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkKG9UYWJsZSwgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikpKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgd2FpdGluZyBmb3IgdGhlIHRhYmxlIHRvIGJlIGJvdW5kXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZldGNoZXMgdGhlIHJlbGV2YW50IG1ldGFkYXRhIGZvciB0aGUgdGFibGUgYW5kIHJldHVybnMgcHJvcGVydHkgaW5mbyBhcnJheS5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBwcm9wZXJ0eSBpbmZvXG5cdCAqL1xuXHRmZXRjaFByb3BlcnRpZXM6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUpIHtcblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwodGFibGUpXG5cdFx0XHQudGhlbigobW9kZWwpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KFxuXHRcdFx0XHRcdHRhYmxlLFxuXHRcdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcImVudGl0eVR5cGVcIiksXG5cdFx0XHRcdFx0bW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigocHJvcGVydGllcykgPT4ge1xuXHRcdFx0XHQodGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBDb250ZXh0KS5zZXRQcm9wZXJ0eShcInRhYmxlUHJvcGVydGllc0F2YWlsYWJsZVwiLCB0cnVlKTtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHRwcmVJbml0OiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSkge1xuXHRcdHJldHVybiBUYWJsZURlbGVnYXRlQmFzZS5wcmVJbml0LmFwcGx5KHRoaXMsIFtvVGFibGVdKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gbnVsbCBmb3IgZXZlcnkgZmFzdCBjcmVhdGlvbiByb3cgdG8gYXZvaWQgaXQgaW5oZXJpdGluZ1xuXHRcdFx0ICogdGhlIHdyb25nIGNvbnRleHQgYW5kIHJlcXVlc3RpbmcgdGhlIHRhYmxlIGNvbHVtbnMgb24gdGhlIHBhcmVudCBlbnRpdHlcblx0XHRcdCAqIFNldCB0aGUgY29ycmVjdCBiaW5kaW5nIGNvbnRleHQgaW4gT2JqZWN0UGFnZUNvbnRyb2xsZXIuZW5hYmxlRmFzdENyZWF0aW9uUm93KClcblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgb0Zhc3RDcmVhdGlvblJvdyA9IG9UYWJsZS5nZXRDcmVhdGlvblJvdygpO1xuXHRcdFx0aWYgKG9GYXN0Q3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0b0Zhc3RDcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSBhcyBDb250ZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0dXBkYXRlQmluZGluZ0luZm86IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRUYWJsZURlbGVnYXRlQmFzZS51cGRhdGVCaW5kaW5nSW5mby5hcHBseSh0aGlzLCBbb1RhYmxlLCBvQmluZGluZ0luZm9dKTtcblx0XHR0aGlzLl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvKG9UYWJsZSwgb0JpbmRpbmdJbmZvKTtcblx0XHRvQmluZGluZ0luZm8uZXZlbnRzLmRhdGFSZWNlaXZlZCA9IG9UYWJsZS5nZXRQYXJlbnQoKS5vbkludGVybmFsRGF0YVJlY2VpdmVkLmJpbmQob1RhYmxlLmdldFBhcmVudCgpKTtcblx0XHRvQmluZGluZ0luZm8uZXZlbnRzLmRhdGFSZXF1ZXN0ZWQgPSBvVGFibGUuZ2V0UGFyZW50KCkub25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQuYmluZChvVGFibGUuZ2V0UGFyZW50KCkpO1xuXHRcdHRoaXMuX3NldFRhYmxlTm9EYXRhVGV4dChvVGFibGUsIG9CaW5kaW5nSW5mbyk7XG5cdFx0LyoqXG5cdFx0ICogV2UgaGF2ZSB0byBzZXQgdGhlIGJpbmRpbmcgY29udGV4dCB0byBudWxsIGZvciBldmVyeSBmYXN0IGNyZWF0aW9uIHJvdyB0byBhdm9pZCBpdCBpbmhlcml0aW5nXG5cdFx0ICogdGhlIHdyb25nIGNvbnRleHQgYW5kIHJlcXVlc3RpbmcgdGhlIHRhYmxlIGNvbHVtbnMgb24gdGhlIHBhcmVudCBlbnRpdHlcblx0XHQgKiBUaGUgY29ycmVjdCBiaW5kaW5nIGNvbnRleHQgaXMgc2V0IGluIE9iamVjdFBhZ2VDb250cm9sbGVyLmVuYWJsZUZhc3RDcmVhdGlvblJvdygpXG5cdFx0ICovXG5cdFx0VGFibGVIZWxwZXIuZW5hYmxlRmFzdENyZWF0aW9uUm93KFxuXHRcdFx0b1RhYmxlLmdldENyZWF0aW9uUm93KCksXG5cdFx0XHRvQmluZGluZ0luZm8ucGF0aCxcblx0XHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0b1RhYmxlLmdldE1vZGVsKCksXG5cdFx0XHRvVGFibGUuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpXG5cdFx0KTtcblx0fSxcblxuXHRfbWFuYWdlU2VtYW50aWNUYXJnZXRzOiBmdW5jdGlvbiAob01EQ1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBvUm93QmluZGluZyA9IG9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0XHRvUm93QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVxdWVzdGVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3QgX29WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvTURDVGFibGUpO1xuXHRcdFx0XHRcdGlmIChfb1ZpZXcpIHtcblx0XHRcdFx0XHRcdFRhYmxlVXRpbHMuZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlKF9vVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIsIG9NRENUYWJsZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVCaW5kaW5nOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55LCBvQmluZGluZzogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGNvbnN0IGJJc1N1c3BlbmRlZCA9IG9UYWJsZUFQST8uZ2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIpO1xuXHRcdGlmICghYklzU3VzcGVuZGVkKSB7XG5cdFx0XHRsZXQgYk5lZWRNYW51YWxSZWZyZXNoID0gZmFsc2U7XG5cdFx0XHRjb25zdCBfb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9UYWJsZSk7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdFx0Y29uc3Qgc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5ID0gXCJwZW5kaW5nTWFudWFsQmluZGluZ1VwZGF0ZVwiO1xuXHRcdFx0Y29uc3QgYlBlbmRpbmdNYW51YWxVcGRhdGUgPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkpO1xuXHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXG5cdFx0XHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIE1hbnVhbCByZWZyZXNoIGlmIGZpbHRlcnMgYXJlIG5vdCBjaGFuZ2VkIGJ5IGJpbmRpbmcucmVmcmVzaCgpIHNpbmNlIHVwZGF0aW5nIHRoZSBiaW5kaW5nSW5mb1xuXHRcdFx0XHQgKiBpcyBub3QgZW5vdWdoIHRvIHRyaWdnZXIgYSBiYXRjaCByZXF1ZXN0LlxuXHRcdFx0XHQgKiBSZW1vdmluZyBjb2x1bW5zIGNyZWF0ZXMgb25lIGJhdGNoIHJlcXVlc3QgdGhhdCB3YXMgbm90IGV4ZWN1dGVkIGJlZm9yZVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y29uc3Qgb2xkRmlsdGVycyA9IG9Sb3dCaW5kaW5nLmdldEZpbHRlcnMoXCJBcHBsaWNhdGlvblwiKTtcblx0XHRcdFx0Yk5lZWRNYW51YWxSZWZyZXNoID1cblx0XHRcdFx0XHRkZWVwRXF1YWwob0JpbmRpbmdJbmZvLmZpbHRlcnMsIG9sZEZpbHRlcnNbMF0pICYmXG5cdFx0XHRcdFx0b1Jvd0JpbmRpbmcuZ2V0UXVlcnlPcHRpb25zRnJvbVBhcmFtZXRlcnMoKS4kc2VhcmNoID09PSBvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoICYmXG5cdFx0XHRcdFx0IWJQZW5kaW5nTWFudWFsVXBkYXRlICYmXG5cdFx0XHRcdFx0X29WaWV3ICYmXG5cdFx0XHRcdFx0KF9vVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuY29udmVydGVyVHlwZSA9PT0gXCJMaXN0UmVwb3J0XCI7XG5cdFx0XHR9XG5cdFx0XHRUYWJsZURlbGVnYXRlQmFzZS51cGRhdGVCaW5kaW5nLmFwcGx5KHRoaXMsIFtvVGFibGUsIG9CaW5kaW5nSW5mbywgb0JpbmRpbmddKTtcblx0XHRcdG9UYWJsZS5maXJlRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiKTtcblx0XHRcdGlmIChiTmVlZE1hbnVhbFJlZnJlc2ggJiYgb1RhYmxlLmdldEZpbHRlcigpICYmIG9CaW5kaW5nKSB7XG5cdFx0XHRcdG9Sb3dCaW5kaW5nXG5cdFx0XHRcdFx0LnJlcXVlc3RSZWZyZXNoKG9Sb3dCaW5kaW5nLmdldEdyb3VwSWQoKSlcblx0XHRcdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXksIGZhbHNlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9tYW5hZ2VTZW1hbnRpY1RhcmdldHMob1RhYmxlKTtcblx0XHR9XG5cdFx0b1RhYmxlQVBJPy5zZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiLCBiSXNTdXNwZW5kZWQpO1xuXHR9LFxuXG5cdF9jb21wdXRlUm93QmluZGluZ0luZm9Gcm9tVGVtcGxhdGU6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdC8vIFdlIG5lZWQgdG8gZGVlcENsb25lIHRoZSBpbmZvIHdlIGdldCBmcm9tIHRoZSBjdXN0b20gZGF0YSwgb3RoZXJ3aXNlIHNvbWUgb2YgaXRzIHN1Ym9iamVjdHMgKGUuZy4gcGFyYW1ldGVycykgd2lsbFxuXHRcdC8vIGJlIHNoYXJlZCB3aXRoIG9CaW5kaW5nSW5mbyBhbmQgbW9kaWZpZWQgbGF0ZXIgKE9iamVjdC5hc3NpZ24gb25seSBkb2VzIGEgc2hhbGxvdyBjbG9uZSlcblx0XHRjb25zdCByb3dCaW5kaW5nSW5mbyA9IGRlZXBDbG9uZShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwicm93c0JpbmRpbmdJbmZvXCIpKTtcblx0XHQvLyBpZiB0aGUgcm93QmluZGluZ0luZm8gaGFzIGEgJCRnZXRLZWVwQWxpdmVDb250ZXh0IHBhcmFtZXRlciB3ZSBuZWVkIHRvIGNoZWNrIGl0IGlzIHRoZSBvbmx5IFRhYmxlIHdpdGggc3VjaCBhXG5cdFx0Ly8gcGFyYW1ldGVyIGZvciB0aGUgY29sbGVjdGlvbk1ldGFQYXRoXG5cdFx0aWYgKHJvd0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRnZXRLZWVwQWxpdmVDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBjb2xsZWN0aW9uUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKTtcblx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKTtcblx0XHRcdGNvbnN0IGtlcHRBbGl2ZUxpc3RzID0gaW50ZXJuYWxNb2RlbC5nZXRPYmplY3QoXCIva2VwdEFsaXZlTGlzdHNcIikgfHwge307XG5cdFx0XHRpZiAoIWtlcHRBbGl2ZUxpc3RzW2NvbGxlY3Rpb25QYXRoXSkge1xuXHRcdFx0XHRrZXB0QWxpdmVMaXN0c1tjb2xsZWN0aW9uUGF0aF0gPSBvVGFibGUuZ2V0SWQoKTtcblx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9rZXB0QWxpdmVMaXN0c1wiLCBrZXB0QWxpdmVMaXN0cyk7XG5cdFx0XHR9IGVsc2UgaWYgKGtlcHRBbGl2ZUxpc3RzW2NvbGxlY3Rpb25QYXRoXSAhPT0gb1RhYmxlLmdldElkKCkpIHtcblx0XHRcdFx0ZGVsZXRlIHJvd0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRnZXRLZWVwQWxpdmVDb250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcm93QmluZGluZ0luZm87XG5cdH0sXG5cdF9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0T2JqZWN0LmFzc2lnbihvQmluZGluZ0luZm8sIHRoaXMuX2NvbXB1dGVSb3dCaW5kaW5nSW5mb0Zyb21UZW1wbGF0ZShvVGFibGUpKTtcblx0XHQvKipcblx0XHQgKiBCaW5kaW5nIGluZm8gbWlnaHQgYmUgc3VzcGVuZGVkIGF0IHRoZSBiZWdpbm5pbmcgd2hlbiB0aGUgZmlyc3QgYmluZFJvd3MgaXMgY2FsbGVkOlxuXHRcdCAqIFRvIGF2b2lkIGR1cGxpY2F0ZSByZXF1ZXN0cyBidXQgc3RpbGwgaGF2ZSBhIGJpbmRpbmcgdG8gY3JlYXRlIG5ldyBlbnRyaWVzLlx0XHRcdFx0ICpcblx0XHQgKiBBZnRlciB0aGUgaW5pdGlhbCBiaW5kaW5nIHN0ZXAsIGZvbGxvdyB1cCBiaW5kaW5ncyBzaG91bGQgbm8gbG9uZ2VyIGJlIHN1c3BlbmRlZC5cblx0XHQgKi9cblx0XHRpZiAob1RhYmxlLmdldFJvd0JpbmRpbmcoKSkge1xuXHRcdFx0b0JpbmRpbmdJbmZvLnN1c3BlbmRlZCA9IGZhbHNlO1xuXHRcdH1cblx0XHQvLyBUaGUgcHJldmlvdXNseSBhZGRlZCBoYW5kbGVyIGZvciB0aGUgZXZlbnQgJ2RhdGFSZWNlaXZlZCcgaXMgbm90IGFueW1vcmUgdGhlcmVcblx0XHQvLyBzaW5jZSB0aGUgYmluZGluZ0luZm8gaXMgcmVjcmVhdGVkIGZyb20gc2NyYXRjaCBzbyB3ZSBuZWVkIHRvIHNldCB0aGUgZmxhZyB0byBmYWxzZSBpbiBvcmRlclxuXHRcdC8vIHRvIGFnYWluIGFkZCB0aGUgaGFuZGxlciBvbiB0aGlzIGV2ZW50IGlmIG5lZWRlZFxuXHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImRhdGFSZWNlaXZlZEF0dGFjaGVkXCIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRsZXQgb0ZpbHRlcjtcblx0XHRjb25zdCBvRmlsdGVySW5mbyA9IFRhYmxlVXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvVGFibGUpO1xuXHRcdC8vIFByZXBhcmUgYmluZGluZyBpbmZvIHdpdGggZmlsdGVyL3NlYXJjaCBwYXJhbWV0ZXJzXG5cdFx0aWYgKG9GaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlciA9IG5ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBvRmlsdGVySW5mby5maWx0ZXJzLCBhbmQ6IHRydWUgfSk7XG5cdFx0fVxuXHRcdGlmIChvRmlsdGVySW5mby5iaW5kaW5nUGF0aCkge1xuXHRcdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBvRmlsdGVySW5mby5iaW5kaW5nUGF0aDtcblx0XHR9XG5cblx0XHRjb25zdCBvRGF0YVN0YXRlSW5kaWNhdG9yID0gb1RhYmxlLmdldERhdGFTdGF0ZUluZGljYXRvcigpO1xuXHRcdGlmIChvRGF0YVN0YXRlSW5kaWNhdG9yICYmIG9EYXRhU3RhdGVJbmRpY2F0b3IuaXNGaWx0ZXJpbmcoKSkge1xuXHRcdFx0Ly8gSW5jbHVkZSBmaWx0ZXJzIG9uIG1lc3NhZ2VTdHJpcFxuXHRcdFx0aWYgKG9CaW5kaW5nSW5mby5maWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b0ZpbHRlciA9IG5ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBvQmluZGluZ0luZm8uZmlsdGVycy5jb25jYXQob0ZpbHRlckluZm8uZmlsdGVycyksIGFuZDogdHJ1ZSB9KTtcblx0XHRcdFx0dGhpcy51cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeShvQmluZGluZ0luZm8sIG9GaWx0ZXJJbmZvLCBvRmlsdGVyKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy51cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeShvQmluZGluZ0luZm8sIG9GaWx0ZXJJbmZvLCBvRmlsdGVyKTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlQmluZGluZ0luZm9XaXRoU2VhcmNoUXVlcnk6IGZ1bmN0aW9uIChiaW5kaW5nSW5mbzogYW55LCBmaWx0ZXJJbmZvOiBhbnksIGZpbHRlcj86IEZpbHRlcikge1xuXHRcdGJpbmRpbmdJbmZvLmZpbHRlcnMgPSBmaWx0ZXI7XG5cdFx0aWYgKGZpbHRlckluZm8uc2VhcmNoKSB7XG5cdFx0XHRiaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKGZpbHRlckluZm8uc2VhcmNoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblx0X3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQ6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogVGFibGVDb2x1bW4sIG9WaWV3OiBhbnksIG9Nb2RpZmllcjogYW55LCBzVGFibGVJZDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbHVtbk1vZGVsID0gbmV3IEpTT05Nb2RlbChvQ29sdW1uSW5mbyksXG5cdFx0XHRvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRpZDogc1RhYmxlSWRcblx0XHRcdH0pLFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0Y29sdW1uOiBvQ29sdW1uTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLFxuXHRcdFx0XHRcdGNvbHVtbjogb0NvbHVtbk1vZGVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRcdFx0XCJzYXAuZmUubWFjcm9zLnRhYmxlLkN1c3RvbUNvbHVtblwiLFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzLFxuXHRcdFx0eyB2aWV3OiBvVmlldyB9LFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KS50aGVuKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRvQ29sdW1uTW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0cmV0dXJuIG9JdGVtO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdG9Db2x1bW5JbmZvOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+LFxuXHRcdG9WaWV3OiBhbnksXG5cdFx0b01vZGlmaWVyOiBhbnksXG5cdFx0c1RhYmxlSWQ6IGFueVxuXHQpIHtcblx0XHRjb25zdCBvQ29sdW1uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9Db2x1bW5JbmZvKSxcblx0XHRcdG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBzVGFibGVJZFxuXHRcdFx0fSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRjb2x1bW46IG9Db2x1bW5Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0Y29sdW1uOiBvQ29sdW1uTW9kZWxcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRjb25zdCBzbG90Q29sdW1uc1hNTCA9IChhd2FpdCBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlNsb3RDb2x1bW5cIiwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0XHRpc1hNTDogdHJ1ZVxuXHRcdH0pKSBhcyBFbGVtZW50O1xuXHRcdGlmICghc2xvdENvbHVtbnNYTUwpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXHRcdGNvbnN0IHNsb3RYTUwgPSBzbG90Q29sdW1uc1hNTC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNsb3RcIilbMF0sXG5cdFx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MID0gc2xvdENvbHVtbnNYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtZGNUYWJsZTp0ZW1wbGF0ZVwiKVswXTtcblx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MLnJlbW92ZUNoaWxkKHNsb3RYTUwpO1xuXHRcdGlmIChvQ29sdW1uSW5mby50ZW1wbGF0ZSkge1xuXHRcdFx0Y29uc3Qgb1RlbXBsYXRlID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhvQ29sdW1uSW5mby50ZW1wbGF0ZSwgXCJ0ZXh0L3htbFwiKTtcblx0XHRcdG1kY1RhYmxlVGVtcGxhdGVYTUwuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkISk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy5lcnJvcihgUGxlYXNlIHByb3ZpZGUgY29udGVudCBpbnNpZGUgdGhpcyBCdWlsZGluZyBCbG9jayBDb2x1bW46ICR7b0NvbHVtbkluZm8uaGVhZGVyfWApO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0aWYgKG9Nb2RpZmllci50YXJnZXRzICE9PSBcImpzQ29udHJvbFRyZWVcIikge1xuXHRcdFx0cmV0dXJuIHNsb3RDb2x1bW5zWE1MO1xuXHRcdH1cblx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHR0eXBlOiBcIlhNTFwiLFxuXHRcdFx0ZGVmaW5pdGlvbjogc2xvdENvbHVtbnNYTUxcblx0XHR9KTtcblx0fSxcblxuXHRfZ2V0RXhwb3J0Rm9ybWF0OiBmdW5jdGlvbiAoZGF0YVR5cGU6IGFueSkge1xuXHRcdHN3aXRjaCAoZGF0YVR5cGUpIHtcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxEYXRlZnJvbUpTRGF0ZSgpO1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxEYXRlVGltZWZyb21KU0RhdGVUaW1lKCk7XG5cdFx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxUaW1lZnJvbUpTVGltZSgpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0X2dldFZIUmVsZXZhbnRGaWVsZHM6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIHNNZXRhZGF0YVBhdGg6IGFueSwgc0JpbmRpbmdQYXRoPzogYW55KSB7XG5cdFx0bGV0IGFGaWVsZHM6IGFueVtdID0gW10sXG5cdFx0XHRvRGF0YUZpZWxkRGF0YSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNNZXRhZGF0YVBhdGgpO1xuXG5cdFx0aWYgKG9EYXRhRmllbGREYXRhLiRraW5kICYmIG9EYXRhRmllbGREYXRhLiRraW5kID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHRcdG9EYXRhRmllbGREYXRhID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGApO1xuXHRcdFx0c01ldGFkYXRhUGF0aCA9IGAke3NNZXRhZGF0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRgO1xuXHRcdH1cblx0XHRzd2l0Y2ggKG9EYXRhRmllbGREYXRhLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiOlxuXHRcdFx0XHRpZiAob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aGApLmluY2x1ZGVzKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiKSkge1xuXHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhZGF0YVBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YWApLmZvckVhY2goKG9WYWx1ZTogYW55LCBpSW5kZXg6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0YUZpZWxkcyA9IGFGaWVsZHMuY29uY2F0KFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9nZXRWSFJlbGV2YW50RmllbGRzKG9NZXRhTW9kZWwsIGAke3NNZXRhZGF0YVBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS8ke2lJbmRleH1gKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIjpcblx0XHRcdFx0YUZpZWxkcy5wdXNoKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhZGF0YVBhdGh9L1ZhbHVlLyRQYXRoYCkpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBwcm9wZXJ0eVxuXHRcdFx0XHQvLyB0ZW1wb3Jhcnkgd29ya2Fyb3VuZCB0byBtYWtlIHN1cmUgVkggcmVsZXZhbnQgZmllbGQgcGF0aCBkbyBub3QgY29udGFpbiB0aGUgYmluZGluZ3BhdGhcblx0XHRcdFx0aWYgKHNNZXRhZGF0YVBhdGguaW5kZXhPZihzQmluZGluZ1BhdGgpID09PSAwKSB7XG5cdFx0XHRcdFx0YUZpZWxkcy5wdXNoKHNNZXRhZGF0YVBhdGguc3Vic3RyaW5nKHNCaW5kaW5nUGF0aC5sZW5ndGggKyAxKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0YUZpZWxkcy5wdXNoKENvbW1vbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzTWV0YWRhdGFQYXRoLCB0cnVlKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gYUZpZWxkcztcblx0fSxcblx0X3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIGFDb2x1bW5zOiBhbnksIG9Db2x1bW5JbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGlmICghb0ludGVybmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc0ludGVybmFsUGF0aCA9IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvciA9IGFDb2x1bW5zLmZpbHRlcigob0NvbHVtbjogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYkNvbHVtbkhhc1Byb3BlcnR5V2l0aERyYWZ0SW5kaWNhdG9yKG9Db2x1bW4pO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IG9UYWJsZS5nZXRDb2x1bW5zKCk7XG5cdFx0bGV0IHNBZGRWaXNpYmxlQ29sdW1uTmFtZSwgc1Zpc2libGVDb2x1bW5OYW1lLCBiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0LCBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcjtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYVZpc2libGVDb2x1bW5zKSB7XG5cdFx0XHRzVmlzaWJsZUNvbHVtbk5hbWUgPSBhVmlzaWJsZUNvbHVtbnNbaV0uZ2V0RGF0YVByb3BlcnR5KCk7XG5cdFx0XHRmb3IgKGNvbnN0IGogaW4gYUNvbHVtbnNXaXRoRHJhZnRJbmRpY2F0b3IpIHtcblx0XHRcdFx0c0NvbHVtbk5hbWVXaXRoRHJhZnRJbmRpY2F0b3IgPSBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvcltqXS5uYW1lO1xuXHRcdFx0XHRpZiAoc1Zpc2libGVDb2x1bW5OYW1lID09PSBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRcdGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvQ29sdW1uSW5mbyAmJiBvQ29sdW1uSW5mby5uYW1lID09PSBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRcdHNBZGRWaXNpYmxlQ29sdW1uTmFtZSA9IG9Db2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0KSB7XG5cdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIHNWaXNpYmxlQ29sdW1uTmFtZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQgJiYgc0FkZFZpc2libGVDb2x1bW5OYW1lKSB7XG5cdFx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxQYXRoICsgU0VNQU5USUNLRVlfSEFTX0RSQUZUSU5ESUNBVE9SLCBzQWRkVmlzaWJsZUNvbHVtbk5hbWUpO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm9OYW1lOiBhbnksIG9UYWJsZTogYW55LCBtUHJvcGVydHlCYWc6IGFueSkge1xuXHRcdGxldCBkb1JlbW92ZUl0ZW0gPSB0cnVlO1xuXHRcdGlmICghb1Byb3BlcnR5SW5mb05hbWUpIHtcblx0XHRcdC8vIDEuIEFwcGxpY2F0aW9uIHJlbW92ZWQgdGhlIHByb3BlcnR5IGZyb20gdGhlaXIgZGF0YSBtb2RlbFxuXHRcdFx0Ly8gMi4gYWRkSXRlbSBmYWlsZWQgYmVmb3JlIHJldmVydERhdGEgY3JlYXRlZFxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShkb1JlbW92ZUl0ZW0pO1xuXHRcdH1cblx0XHRjb25zdCBvTW9kaWZpZXIgPSBtUHJvcGVydHlCYWcubW9kaWZpZXI7XG5cdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9Nb2RpZmllci5nZXRQcm9wZXJ0eShvUHJvcGVydHlJbmZvTmFtZSwgXCJkYXRhUHJvcGVydHlcIik7XG5cdFx0aWYgKHNEYXRhUHJvcGVydHkgJiYgc0RhdGFQcm9wZXJ0eS5pbmRleE9mICYmIHNEYXRhUHJvcGVydHkuaW5kZXhPZihcIklubGluZVhNTFwiKSAhPT0gLTEpIHtcblx0XHRcdG9Nb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvVGFibGUsIFwiZGVwZW5kZW50c1wiLCBvUHJvcGVydHlJbmZvTmFtZSk7XG5cdFx0XHRkb1JlbW92ZUl0ZW0gPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG9UYWJsZS5pc0EgJiYgb01vZGlmaWVyLnRhcmdldHMgPT09IFwianNDb250cm9sVHJlZVwiKSB7XG5cdFx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvclN0YXR1cyhvTW9kaWZpZXIsIG9UYWJsZSwgdGhpcy5nZXRDb2x1bW5zRm9yKG9UYWJsZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvUmVtb3ZlSXRlbSk7XG5cdH0sXG5cdF9nZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChtUHJvcGVydHlCYWc6IGFueSkge1xuXHRcdHJldHVybiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0fSxcblx0X3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzOiBmdW5jdGlvbiAob01vZGlmaWVyOiBhbnksIG9UYWJsZTogYW55LCBhQ29sdW1uczogYW55LCBvQ29sdW1uSW5mbz86IGFueSkge1xuXHRcdGlmIChvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJqc0NvbnRyb2xUcmVlXCIpIHtcblx0XHRcdHRoaXMuX3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uKG9UYWJsZSwgYUNvbHVtbnMsIG9Db2x1bW5JbmZvKTtcblx0XHR9XG5cdH0sXG5cdF9nZXRHcm91cElkOiBmdW5jdGlvbiAoc1JldHJpZXZlZEdyb3VwSWQ6IGFueSkge1xuXHRcdHJldHVybiBzUmV0cmlldmVkR3JvdXBJZCB8fCB1bmRlZmluZWQ7XG5cdH0sXG5cdF9nZXREZXBlbmRlbnQ6IGZ1bmN0aW9uIChvRGVwZW5kZW50OiBhbnksIHNQcm9wZXJ0eUluZm9OYW1lOiBhbnksIHNEYXRhUHJvcGVydHk6IGFueSkge1xuXHRcdGlmIChzUHJvcGVydHlJbmZvTmFtZSA9PT0gc0RhdGFQcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIG9EZXBlbmRlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cdF9mblRlbXBsYXRlVmFsdWVIZWxwOiBmdW5jdGlvbiAoZm5UZW1wbGF0ZVZhbHVlSGVscDogYW55LCBiVmFsdWVIZWxwUmVxdWlyZWQ6IGFueSwgYlZhbHVlSGVscEV4aXN0czogYW55KSB7XG5cdFx0aWYgKGJWYWx1ZUhlbHBSZXF1aXJlZCAmJiAhYlZhbHVlSGVscEV4aXN0cykge1xuXHRcdFx0cmV0dXJuIGZuVGVtcGxhdGVWYWx1ZUhlbHAoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlZhbHVlSGVscFwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9LFxuXHRfZ2V0RGlzcGxheU1vZGU6IGZ1bmN0aW9uIChiRGlzcGxheU1vZGU6IGFueSkge1xuXHRcdGxldCBjb2x1bW5FZGl0TW9kZTtcblx0XHRpZiAoYkRpc3BsYXlNb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGJEaXNwbGF5TW9kZSA9IHR5cGVvZiBiRGlzcGxheU1vZGUgPT09IFwiYm9vbGVhblwiID8gYkRpc3BsYXlNb2RlIDogYkRpc3BsYXlNb2RlID09PSBcInRydWVcIjtcblx0XHRcdGNvbHVtbkVkaXRNb2RlID0gYkRpc3BsYXlNb2RlID8gXCJEaXNwbGF5XCIgOiBcIkVkaXRhYmxlXCI7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkaXNwbGF5bW9kZTogYkRpc3BsYXlNb2RlLFxuXHRcdFx0XHRjb2x1bW5FZGl0TW9kZTogY29sdW1uRWRpdE1vZGVcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRkaXNwbGF5bW9kZTogdW5kZWZpbmVkLFxuXHRcdFx0Y29sdW1uRWRpdE1vZGU6IHVuZGVmaW5lZFxuXHRcdH07XG5cdH0sXG5cdF9pbnNlcnRBZ2dyZWdhdGlvbjogZnVuY3Rpb24gKG9WYWx1ZUhlbHA6IGFueSwgb01vZGlmaWVyOiBhbnksIG9UYWJsZTogYW55KSB7XG5cdFx0aWYgKG9WYWx1ZUhlbHApIHtcblx0XHRcdHJldHVybiBvTW9kaWZpZXIuaW5zZXJ0QWdncmVnYXRpb24ob1RhYmxlLCBcImRlcGVuZGVudHNcIiwgb1ZhbHVlSGVscCwgMCk7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBJbnZva2VkIHdoZW4gYSBjb2x1bW4gaXMgYWRkZWQgdXNpbmcgdGhlIHRhYmxlIHBlcnNvbmFsaXphdGlvbiBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIGNvbHVtbiBpcyBhZGRlZFxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRhYmxlIGNvbnRyb2xcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSB0aGUgZmxleGliaWxpdHkgQVBJXG5cdCAqIEByZXR1cm5zIE9uY2UgcmVzb2x2ZWQsIGEgdGFibGUgY29sdW1uIGRlZmluaXRpb24gaXMgcmV0dXJuZWRcblx0ICovXG5cdGFkZEl0ZW06IGFzeW5jIGZ1bmN0aW9uIChzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBvVGFibGU6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5fZ2V0TWV0YU1vZGVsKG1Qcm9wZXJ0eUJhZyksXG5cdFx0XHRvTW9kaWZpZXIgPSBtUHJvcGVydHlCYWcubW9kaWZpZXIsXG5cdFx0XHRzVGFibGVJZCA9IG9Nb2RpZmllci5nZXRJZChvVGFibGUpLFxuXHRcdFx0YUNvbHVtbnMgPSBvVGFibGUuaXNBID8gdGhpcy5nZXRDb2x1bW5zRm9yKG9UYWJsZSkgOiBudWxsO1xuXHRcdGlmICghYUNvbHVtbnMpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0NvbHVtbkluZm8gPSBhQ29sdW1ucy5maW5kKGZ1bmN0aW9uIChvQ29sdW1uKSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5uYW1lID09PSBzUHJvcGVydHlJbmZvTmFtZTtcblx0XHR9KTtcblx0XHRpZiAoIW9Db2x1bW5JbmZvKSB7XG5cdFx0XHRMb2cuZXJyb3IoYCR7c1Byb3BlcnR5SW5mb05hbWV9IG5vdCBmb3VuZCB3aGlsZSBhZGRpbmcgY29sdW1uYCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvclN0YXR1cyhvTW9kaWZpZXIsIG9UYWJsZSwgYUNvbHVtbnMsIG9Db2x1bW5JbmZvKTtcblx0XHQvLyByZW5kZXIgY3VzdG9tIGNvbHVtblxuXHRcdGlmIChvQ29sdW1uSW5mby50eXBlID09PSBcIkRlZmF1bHRcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQob0NvbHVtbkluZm8sIG1Qcm9wZXJ0eUJhZy52aWV3LCBvTW9kaWZpZXIsIHNUYWJsZUlkKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbHVtbkluZm8udHlwZSA9PT0gXCJTbG90XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudChcblx0XHRcdFx0b0NvbHVtbkluZm8gYXMgQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uPixcblx0XHRcdFx0bVByb3BlcnR5QmFnLnZpZXcsXG5cdFx0XHRcdG9Nb2RpZmllcixcblx0XHRcdFx0c1RhYmxlSWRcblx0XHRcdCk7XG5cdFx0fVxuXHRcdC8vIGZhbGwtYmFja1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cblx0XHRjb25zdCBzUGF0aDogc3RyaW5nID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm1ldGFQYXRoXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoOiBzdHJpbmcgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRcdGNvbnN0IHNSZXRyaWV2ZWRHcm91cElkID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInJlcXVlc3RHcm91cElkXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc0dyb3VwSWQ6IHN0cmluZyA9IHRoaXMuX2dldEdyb3VwSWQoc1JldHJpZXZlZEdyb3VwSWQpO1xuXHRcdGNvbnN0IG9UYWJsZUNvbnRleHQ6IENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKTtcblx0XHRjb25zdCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eShcblx0XHRcdG9UYWJsZSxcblx0XHRcdHNFbnRpdHlUeXBlUGF0aCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XG5cdFx0KTtcblx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gYUZldGNoZWRQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9JbmZvOiBhbnkpIHtcblx0XHRcdHJldHVybiBvSW5mby5uYW1lID09PSBzUHJvcGVydHlJbmZvTmFtZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQ6IENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9Qcm9wZXJ0eUluZm8ubWV0YWRhdGFQYXRoKTtcblx0XHRjb25zdCBhVkhQcm9wZXJ0aWVzID0gdGhpcy5fZ2V0VkhSZWxldmFudEZpZWxkcyhvTWV0YU1vZGVsLCBvUHJvcGVydHlJbmZvLm1ldGFkYXRhUGF0aCwgc1BhdGgpO1xuXHRcdGNvbnN0IG9QYXJhbWV0ZXJzID0ge1xuXHRcdFx0c0JpbmRpbmdQYXRoOiBzUGF0aCxcblx0XHRcdHNWYWx1ZUhlbHBUeXBlOiBcIlRhYmxlVmFsdWVIZWxwXCIsXG5cdFx0XHRvQ29udHJvbDogb1RhYmxlLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9Nb2RpZmllcixcblx0XHRcdG9Qcm9wZXJ0eUluZm9cblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5UZW1wbGF0ZVZhbHVlSGVscCA9IGFzeW5jIChzRnJhZ21lbnROYW1lOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdFx0aWQ6IHNUYWJsZUlkLFxuXHRcdFx0XHRcdHJlcXVlc3RHcm91cElkOiBzR3JvdXBJZFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkOiBvUHJvcGVydHlDb250ZXh0LFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9UYWJsZUNvbnRleHRcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb1ZhbHVlSGVscCA9IGF3YWl0IERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHt9LCBvTW9kaWZpZXIpO1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5faW5zZXJ0QWdncmVnYXRpb24ob1ZhbHVlSGVscCwgb01vZGlmaWVyLCBvVGFibGUpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0Ly9XZSBhbHdheXMgcmVzb2x2ZSB0aGUgcHJvbWlzZSB0byBlbnN1cmUgdGhhdCB0aGUgYXBwIGRvZXMgbm90IGNyYXNoXG5cdFx0XHRcdExvZy5lcnJvcihgVmFsdWVIZWxwIG5vdCBsb2FkZWQgOiAke29FcnJvci5tZXNzYWdlfWApO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5UZW1wbGF0ZUZyYWdtZW50ID0gKG9JblByb3BlcnR5SW5mbzogYW55LCBvVmlldzogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblwiO1xuXG5cdFx0XHRsZXQgYkRpc3BsYXlNb2RlO1xuXHRcdFx0bGV0IHNUYWJsZVR5cGVDdXN0b21EYXRhO1xuXHRcdFx0bGV0IHNPbkNoYW5nZUN1c3RvbURhdGE7XG5cdFx0XHRsZXQgc0NyZWF0aW9uTW9kZUN1c3RvbURhdGE7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJkaXNwbGF5TW9kZVByb3BlcnR5QmluZGluZ1wiLCBvTW9kaWZpZXIpLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwidGFibGVUeXBlXCIsIG9Nb2RpZmllciksXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJvbkNoYW5nZVwiLCBvTW9kaWZpZXIpLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiY3JlYXRpb25Nb2RlXCIsIG9Nb2RpZmllcilcblx0XHRcdF0pLnRoZW4oKGFDdXN0b21EYXRhOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRiRGlzcGxheU1vZGUgPSBhQ3VzdG9tRGF0YVswXTtcblx0XHRcdFx0c1RhYmxlVHlwZUN1c3RvbURhdGEgPSBhQ3VzdG9tRGF0YVsxXTtcblx0XHRcdFx0c09uQ2hhbmdlQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhWzJdO1xuXHRcdFx0XHRzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhWzNdO1xuXHRcdFx0XHQvLyBSZWFkIE9ubHkgYW5kIENvbHVtbiBFZGl0IE1vZGUgY2FuIGJvdGggaGF2ZSB0aHJlZSBzdGF0ZVxuXHRcdFx0XHQvLyBVbmRlZmluZWQgbWVhbnMgdGhhdCB0aGUgZnJhbWV3b3JrIGRlY2lkZXMgd2hhdCB0byBkb1xuXHRcdFx0XHQvLyBUcnVlIC8gRGlzcGxheSBtZWFucyBhbHdheXMgcmVhZCBvbmx5XG5cdFx0XHRcdC8vIEZhbHNlIC8gRWRpdGFibGUgbWVhbnMgZWRpdGFibGUgYnV0IHdoaWxlIHN0aWxsIHJlc3BlY3RpbmcgdGhlIGxvdyBsZXZlbCBwcmluY2lwbGUgKGltbXV0YWJsZSBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBlZGl0YWJsZSlcblx0XHRcdFx0Y29uc3Qgb0Rpc3BsYXlNb2RlcyA9IHRoaXMuX2dldERpc3BsYXlNb2RlKGJEaXNwbGF5TW9kZSk7XG5cdFx0XHRcdGJEaXNwbGF5TW9kZSA9IG9EaXNwbGF5TW9kZXMuZGlzcGxheW1vZGU7XG5cdFx0XHRcdGNvbnN0IGNvbHVtbkVkaXRNb2RlID0gb0Rpc3BsYXlNb2Rlcy5jb2x1bW5FZGl0TW9kZTtcblxuXHRcdFx0XHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRcdFx0ZW5hYmxlQXV0b0NvbHVtbldpZHRoOiAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5lbmFibGVBdXRvQ29sdW1uV2lkdGgsXG5cdFx0XHRcdFx0XHRpc09wdGltaXplZEZvclNtYWxsRGV2aWNlOiAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5pc09wdGltaXplZEZvclNtYWxsRGV2aWNlLFxuXHRcdFx0XHRcdFx0cmVhZE9ubHk6IGJEaXNwbGF5TW9kZSxcblx0XHRcdFx0XHRcdGNvbHVtbkVkaXRNb2RlOiBjb2x1bW5FZGl0TW9kZSxcblx0XHRcdFx0XHRcdHRhYmxlVHlwZTogc1RhYmxlVHlwZUN1c3RvbURhdGEsXG5cdFx0XHRcdFx0XHRvbkNoYW5nZTogc09uQ2hhbmdlQ3VzdG9tRGF0YSxcblx0XHRcdFx0XHRcdGlkOiBzVGFibGVJZCxcblx0XHRcdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNQcm9wZXJ0eUluZm9OYW1lLFxuXHRcdFx0XHRcdFx0Y29sdW1uSW5mbzogb0NvbHVtbkluZm8sXG5cdFx0XHRcdFx0XHRjb2xsZWN0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdHNQYXRoOiBzUGF0aCxcblx0XHRcdFx0XHRcdFx0b01vZGVsOiBvTWV0YU1vZGVsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YVxuXHRcdFx0XHRcdH0gYXMgdGFibGVEZWxlZ2F0ZU1vZGVsKSxcblx0XHRcdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvVGFibGVDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRjb2xsZWN0aW9uOiBvVGFibGVDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRkYXRhRmllbGQ6IG9Qcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRcdFx0Y29sdW1uOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9jb2x1bW5JbmZvXCIpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRcdHRoaXM6IG9UaGlzLFxuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGNvbGxlY3Rpb246IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW46IG9UaGlzXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgeyB2aWV3OiBvVmlldyB9LCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdGFWSFByb3BlcnRpZXMubWFwKGFzeW5jIChzUHJvcGVydHlOYW1lOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBvUGFyYW1ldGVycywgeyBzUHJvcGVydHlOYW1lOiBzUHJvcGVydHlOYW1lIH0pO1xuXG5cdFx0XHRcdGNvbnN0IGFSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdERlbGVnYXRlVXRpbC5pc1ZhbHVlSGVscFJlcXVpcmVkKG1QYXJhbWV0ZXJzKSxcblx0XHRcdFx0XHREZWxlZ2F0ZVV0aWwuZG9lc1ZhbHVlSGVscEV4aXN0KG1QYXJhbWV0ZXJzKVxuXHRcdFx0XHRdKTtcblxuXHRcdFx0XHRjb25zdCBiVmFsdWVIZWxwUmVxdWlyZWQgPSBhUmVzdWx0c1swXSxcblx0XHRcdFx0XHRiVmFsdWVIZWxwRXhpc3RzID0gYVJlc3VsdHNbMV07XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mblRlbXBsYXRlVmFsdWVIZWxwKGZuVGVtcGxhdGVWYWx1ZUhlbHAsIGJWYWx1ZUhlbHBSZXF1aXJlZCwgYlZhbHVlSGVscEV4aXN0cyk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0Ly8gSWYgdmlldyBpcyBub3QgcHJvdmlkZWQgdHJ5IHRvIGdldCBpdCBieSBhY2Nlc3NpbmcgdG8gdGhlIHBhcmVudGFsIGhpZXJhcmNoeVxuXHRcdC8vIElmIGl0IGRvZXNuJ3Qgd29yayAodGFibGUgaW50byBhbiB1bmF0dGFjaGVkIE9QIHNlY3Rpb24pIGdldCB0aGUgdmlldyB2aWEgdGhlIEFwcENvbXBvbmVudFxuXHRcdGNvbnN0IHZpZXcgPVxuXHRcdFx0bVByb3BlcnR5QmFnLnZpZXcgfHxcblx0XHRcdENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhYmxlKSB8fFxuXHRcdFx0KG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgPyBDb21tb25VdGlscy5nZXRDdXJyZW50UGFnZVZpZXcobVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCkgOiB1bmRlZmluZWQpO1xuXHRcdHJldHVybiBmblRlbXBsYXRlRnJhZ21lbnQob1Byb3BlcnR5SW5mbywgdmlldyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByb3ZpZGUgdGhlIFRhYmxlJ3MgZmlsdGVyIGRlbGVnYXRlIHRvIHByb3ZpZGUgYmFzaWMgZmlsdGVyIGZ1bmN0aW9uYWxpdHkgc3VjaCBhcyBhZGRpbmcgRmlsdGVyRmllbGRzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBPYmplY3QgZm9yIHRoZSBUYWJsZXMgZmlsdGVyIHBlcnNvbmFsaXphdGlvbi5cblx0ICovXG5cdGdldEZpbHRlckRlbGVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIEZpbHRlckJhckRlbGVnYXRlLCB7XG5cdFx0XHRhZGRJdGVtOiBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IGFueSwgb1BhcmVudENvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAoc1Byb3BlcnR5SW5mb05hbWUuaW5kZXhPZihcIlByb3BlcnR5OjpcIikgPT09IDApIHtcblx0XHRcdFx0XHQvLyBDb3JyZWN0IHRoZSBuYW1lIG9mIGNvbXBsZXggcHJvcGVydHkgaW5mbyByZWZlcmVuY2VzLlxuXHRcdFx0XHRcdHNQcm9wZXJ0eUluZm9OYW1lID0gc1Byb3BlcnR5SW5mb05hbWUucmVwbGFjZShcIlByb3BlcnR5OjpcIiwgXCJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIEZpbHRlckJhckRlbGVnYXRlLmFkZEl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgVHlwZVV0aWwgYXR0YWNoZWQgdG8gdGhpcyBkZWxlZ2F0ZS5cblx0ICpcblx0ICogQHJldHVybnMgQW55IGluc3RhbmNlIG9mIFR5cGVVdGlsXG5cdCAqL1xuXHRnZXRUeXBlVXRpbDogZnVuY3Rpb24gKC8qb1BheWxvYWQ6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFR5cGVVdGlsO1xuXHR9LFxuXG5cdGZvcm1hdEdyb3VwSGVhZGVyKG9UYWJsZTogYW55LCBvQ29udGV4dDogYW55LCBzUHJvcGVydHk6IGFueSkge1xuXHRcdGNvbnN0IG1Gb3JtYXRJbmZvcyA9IERlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKG9UYWJsZSksXG5cdFx0XHRvRm9ybWF0SW5mbyA9XG5cdFx0XHRcdG1Gb3JtYXRJbmZvcyAmJlxuXHRcdFx0XHRtRm9ybWF0SW5mb3MuZmlsdGVyKChvYmo6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBvYmoubmFtZSA9PT0gc1Byb3BlcnR5O1xuXHRcdFx0XHR9KVswXSxcblx0XHRcdC8qRm9yIGEgRGF0ZSBvciBEYXRlVGltZSBwcm9wZXJ0eSwgdGhlIHZhbHVlIGlzIHJldHVybmVkIGluIGV4dGVybmFsIGZvcm1hdCB1c2luZyBhIFVJNSB0eXBlIGZvciB0aGVcblx0ICAgICAgICBnaXZlbiBwcm9wZXJ0eSBwYXRoIHRoYXQgZm9ybWF0cyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSdzIEVETSB0eXBlIGFuZCBjb25zdHJhaW50cyovXG5cdFx0XHRiRXh0ZXJuYWxGb3JtYXQgPSBvRm9ybWF0SW5mbz8udHlwZUNvbmZpZz8uYmFzZVR5cGUgPT09IFwiRGF0ZVRpbWVcIiB8fCBvRm9ybWF0SW5mbz8udHlwZUNvbmZpZz8uYmFzZVR5cGUgPT09IFwiRGF0ZVwiO1xuXHRcdGxldCBzVmFsdWU7XG5cdFx0aWYgKG9Gb3JtYXRJbmZvICYmIG9Gb3JtYXRJbmZvLm1vZGUpIHtcblx0XHRcdHN3aXRjaCAob0Zvcm1hdEluZm8ubW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRzVmFsdWUgPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby5kZXNjcmlwdGlvblByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdFx0c1ZhbHVlID0gVmFsdWVGb3JtYXR0ZXIuZm9ybWF0V2l0aEJyYWNrZXRzKFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KSxcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLnZhbHVlUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0c1ZhbHVlID0gVmFsdWVGb3JtYXR0ZXIuZm9ybWF0V2l0aEJyYWNrZXRzKFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8udmFsdWVQcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KSxcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLmRlc2NyaXB0aW9uUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVmFsdWUgPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mbz8ucGF0aCwgYkV4dGVybmFsRm9ybWF0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGdldFJlc291cmNlTW9kZWwob1RhYmxlKS5nZXRUZXh0KFwiTV9UQUJMRV9HUk9VUF9IRUFERVJfVElUTEVcIiwgW29Gb3JtYXRJbmZvPy5sYWJlbCwgc1ZhbHVlXSk7XG5cdH1cbn0p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