/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepEqual", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/DelegateUtil", "sap/ui/core/Core", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, deepEqual, CommonUtils, FilterBar, MetaModelConverter, MetaModelFunction, ModelHelper, TypeGuards, DataModelPathHelper, DisplayModeFormatter, PropertyHelper, EDM, TypeUtil, MacrosDelegateUtil, Core, TableDelegate, DelegateUtil, FilterUtil, Filter, FilterOperator, Sorter) {
  "use strict";

  var isTypeFilterable = EDM.isTypeFilterable;
  var getLabel = PropertyHelper.getLabel;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var isMultiValueFilterExpression = MetaModelFunction.isMultiValueFilterExpression;
  var getSortRestrictionsInfo = MetaModelFunction.getSortRestrictionsInfo;
  var getFilterRestrictionsInfo = MetaModelFunction.getFilterRestrictionsInfo;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var fetchTypeConfig = FilterBar.fetchTypeConfig;
  /**
   * Test delegate for OData V4.
   */
  const ODataTableDelegate = Object.assign({}, TableDelegate);
  ODataTableDelegate.fetchProperties = function (table) {
    const model = this._getModel(table);
    let createPropertyInfos;
    if (!model) {
      createPropertyInfos = new Promise(resolve => {
        table.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, this);
      }).then(oSubModel => {
        return this._createPropertyInfos(table, oSubModel);
      });
    } else {
      createPropertyInfos = this._createPropertyInfos(table, model);
    }
    return createPropertyInfos.then(function (properties) {
      MacrosDelegateUtil.setCachedProperties(table, properties);
      table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
      return properties;
    });
  };
  ODataTableDelegate.createInternalBindingContext = function (table) {
    let dialog = table;
    while (dialog && !dialog.isA("sap.ui.mdc.valuehelp.Dialog")) {
      dialog = dialog.getParent();
    }
    const internalModel = table.getModel("internal");
    if (dialog && internalModel) {
      const newInternalBindingContextPath = dialog.getBindingContext("internal").getPath() + `::VHDialog::${dialog.getId()}::table`;
      const newInternalBindingContext = internalModel.bindContext(newInternalBindingContextPath).getBoundContext();
      table.setBindingContext(newInternalBindingContext, "internal");
    }
  };
  function onModelContextChange(event, data) {
    const table = event.getSource();
    ODataTableDelegate.createInternalBindingContext(table);
    const model = this._getModel(table);
    if (model) {
      table.detachModelContextChange(onModelContextChange);
      data.resolver(model);
    }
  }
  /**
   * Collect related properties from a property's annotations.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The related properties that were identified.
   * @private
   */
  function collectRelatedProperties(dataModelPropertyPath) {
    const dataModelAdditionalPropertyPath = getAdditionalProperty(dataModelPropertyPath);
    const relatedProperties = {};
    if (dataModelAdditionalPropertyPath !== null && dataModelAdditionalPropertyPath !== void 0 && dataModelAdditionalPropertyPath.targetObject) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3;
      const additionalProperty = dataModelAdditionalPropertyPath.targetObject;
      const additionalPropertyPath = getTargetObjectPath(dataModelAdditionalPropertyPath, true);
      const property = dataModelPropertyPath.targetObject;
      const propertyPath = getTargetObjectPath(dataModelPropertyPath, true);
      const textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        displayMode = textAnnotation && textArrangement && getDisplayMode(property);
      if (displayMode === "Description") {
        relatedProperties[additionalPropertyPath] = additionalProperty;
      } else if (displayMode && displayMode !== "Value" || !textAnnotation) {
        relatedProperties[propertyPath] = property;
        relatedProperties[additionalPropertyPath] = additionalProperty;
      }
    }
    return relatedProperties;
  }
  ODataTableDelegate._createPropertyInfos = function (table, model) {
    const metadataInfo = table.getDelegate().payload;
    const properties = [];
    const entitySetPath = `/${metadataInfo.collectionName}`;
    const metaModel = model.getMetaModel();
    return metaModel.requestObject(`${entitySetPath}@`).then(function (entitySetAnnotations) {
      const sortRestrictionsInfo = getSortRestrictionsInfo(entitySetAnnotations);
      const filterRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
      const filterRestrictionsInfo = getFilterRestrictionsInfo(filterRestrictions);
      const customDataForColumns = MacrosDelegateUtil.getCustomData(table, "columns");
      const propertiesToBeCreated = {};
      const dataModelEntityPath = getInvolvedDataModelObjects(table.getModel().getMetaModel().getContext(entitySetPath));
      customDataForColumns.customData.forEach(function (columnDef) {
        const propertyInfo = {
          name: columnDef.path,
          label: columnDef.label,
          sortable: isSortableProperty(sortRestrictionsInfo, columnDef),
          filterable: isFilterableProperty(filterRestrictions, columnDef),
          maxConditions: getPropertyMaxConditions(filterRestrictionsInfo, columnDef),
          typeConfig: isTypeFilterable(columnDef.$Type) ? table.getTypeUtil().getTypeConfig(columnDef.$Type) : undefined
        };
        const dataModelPropertyPath = enhanceDataModelPath(dataModelEntityPath, columnDef.path);
        const property = dataModelPropertyPath.targetObject;
        if (property) {
          const targetPropertyPath = getTargetObjectPath(dataModelPropertyPath, true);
          let typeConfig;
          if (isTypeFilterable(property.type)) {
            const propertyTypeConfig = fetchTypeConfig(property);
            typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints) ?? table.getTypeUtil().getTypeConfig(columnDef.$Type);
          }
          //Check if there is an additional property linked to the property as a Unit, Currency, Timezone or textArrangement
          const relatedPropertiesInfo = collectRelatedProperties(dataModelPropertyPath);
          const relatedPropertyPaths = Object.keys(relatedPropertiesInfo);
          if (relatedPropertyPaths.length) {
            propertyInfo.propertyInfos = relatedPropertyPaths;
            //Complex properties must be hidden for sorting and filtering
            propertyInfo.sortable = false;
            propertyInfo.filterable = false;
            // Collect information of related columns to be created.
            relatedPropertyPaths.forEach(path => {
              propertiesToBeCreated[path] = relatedPropertiesInfo[path];
            });
            // Also add property for the inOut Parameters on the ValueHelp when textArrangement is set to #TextOnly
            // It will not be linked to the complex Property (BCP 2270141154)
            if (!relatedPropertyPaths.find(path => relatedPropertiesInfo[path] === property)) {
              propertiesToBeCreated[targetPropertyPath] = property;
            }
          } else {
            propertyInfo.path = columnDef.path;
          }
          propertyInfo.typeConfig = propertyInfo.typeConfig ? typeConfig : undefined;
        } else {
          propertyInfo.path = columnDef.path;
        }
        properties.push(propertyInfo);
      });
      const relatedColumns = createRelatedProperties(propertiesToBeCreated, properties, sortRestrictionsInfo, filterRestrictionsInfo);
      return properties.concat(relatedColumns);
    });
  };

  /**
   * Updates the binding info with the relevant path and model from the metadata.
   *
   * @param oMDCTable The MDCTable instance
   * @param oBindingInfo The bindingInfo of the table
   */
  ODataTableDelegate.updateBindingInfo = function (oMDCTable, oBindingInfo) {
    TableDelegate.updateBindingInfo.apply(this, [oMDCTable, oBindingInfo]);
    if (!oMDCTable) {
      return;
    }
    const oMetadataInfo = oMDCTable.getDelegate().payload;
    if (oMetadataInfo && oBindingInfo) {
      oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || `/${oMetadataInfo.collectionName}`;
      oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
    }
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    const oFilter = Core.byId(oMDCTable.getFilter()),
      bFilterEnabled = oMDCTable.isFilteringEnabled();
    let mConditions;
    let oInnerFilterInfo, oOuterFilterInfo;
    const aFilters = [];
    const tableProperties = MacrosDelegateUtil.getCachedProperties(oMDCTable);

    //TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
    if (bFilterEnabled) {
      mConditions = oMDCTable.getConditions();
      oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, tableProperties, []);
      if (oInnerFilterInfo.filters) {
        aFilters.push(oInnerFilterInfo.filters);
      }
    }
    if (oFilter) {
      mConditions = oFilter.getConditions();
      if (mConditions) {
        const aParameterNames = DelegateUtil.getParameterNames(oFilter);
        // The table properties needs to updated with the filter field if no Selectionfierlds are annotated and not part as value help parameter
        ODataTableDelegate._updatePropertyInfo(tableProperties, oMDCTable, mConditions, oMetadataInfo);
        oOuterFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, tableProperties, aParameterNames);
        if (oOuterFilterInfo.filters) {
          aFilters.push(oOuterFilterInfo.filters);
        }
        const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
        if (sParameterPath) {
          oBindingInfo.path = sParameterPath;
        }
      }

      // get the basic search
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilter.getSearch()) || undefined;
    }
    this._applyDefaultSorting(oBindingInfo, oMDCTable.getDelegate().payload);
    // add select to oBindingInfo (BCP 2170163012)
    oBindingInfo.parameters.$select = tableProperties === null || tableProperties === void 0 ? void 0 : tableProperties.reduce(function (sQuery, oProperty) {
      // Navigation properties (represented by X/Y) should not be added to $select.
      // ToDo : They should be added as $expand=X($select=Y) instead
      if (oProperty.path && oProperty.path.indexOf("/") === -1) {
        sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
      }
      return sQuery;
    }, "");

    // Add $count
    oBindingInfo.parameters.$count = true;

    //If the entity is DraftEnabled add a DraftFilter
    if (ModelHelper.isDraftSupported(oMDCTable.getModel().getMetaModel(), oBindingInfo.path)) {
      aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
    }
    oBindingInfo.filters = new Filter(aFilters, true);
  };
  ODataTableDelegate.getTypeUtil = function /*oPayload*/
  () {
    return TypeUtil;
  };
  ODataTableDelegate._getModel = function (oTable) {
    const oMetadataInfo = oTable.getDelegate().payload;
    return oTable.getModel(oMetadataInfo.model);
  };

  /**
   * Applies a default sort order if needed. This is only the case if the request is not a $search request
   * (means the parameter $search of the bindingInfo is undefined) and if not already a sort order is set,
   * e.g. via presentation variant or manual by the user.
   *
   * @param oBindingInfo The bindingInfo of the table
   * @param oPayload The payload of the TableDelegate
   */
  ODataTableDelegate._applyDefaultSorting = function (oBindingInfo, oPayload) {
    if (oBindingInfo.parameters && oBindingInfo.parameters.$search == undefined && oBindingInfo.sorter && oBindingInfo.sorter.length == 0) {
      const defaultSortPropertyName = oPayload ? oPayload.defaultSortPropertyName : undefined;
      if (defaultSortPropertyName) {
        oBindingInfo.sorter.push(new Sorter(defaultSortPropertyName, false));
      }
    }
  };

  /**
   * Updates the table properties with filter field infos.
   *
   * @param aTableProperties Array with table properties
   * @param oMDCTable The MDCTable instance
   * @param mConditions The conditions of the table
   * @param oMetadataInfo The metadata info of the filter field
   */
  ODataTableDelegate._updatePropertyInfo = function (aTableProperties, oMDCTable, mConditions, oMetadataInfo) {
    const aConditionKey = Object.keys(mConditions),
      oMetaModel = oMDCTable.getModel().getMetaModel();
    aConditionKey.forEach(function (conditionKey) {
      if (aTableProperties.findIndex(function (tableProperty) {
        return tableProperty.path === conditionKey;
      }) === -1) {
        const oColumnDef = {
          path: conditionKey,
          typeConfig: oMDCTable.getTypeUtil().getTypeConfig(oMetaModel.getObject(`/${oMetadataInfo.collectionName}/${conditionKey}`).$Type)
        };
        aTableProperties.push(oColumnDef);
      }
    });
  };
  ODataTableDelegate.updateBinding = function (oTable, oBindingInfo, oBinding) {
    let bNeedManualRefresh = false;
    const oInternalBindingContext = oTable.getBindingContext("internal");
    const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
    const bPendingManualUpdate = oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
    let oRowBinding = oTable.getRowBinding();

    //oBinding=null means that a rebinding needs to be forced via updateBinding in mdc TableDelegate
    TableDelegate.updateBinding.apply(ODataTableDelegate, [oTable, oBindingInfo, oBinding]);
    //get row binding after rebind from TableDelegate.updateBinding in case oBinding was null
    if (!oRowBinding) {
      oRowBinding = oTable.getRowBinding();
    }
    if (oRowBinding) {
      /**
       * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
       * is not enough to trigger a batch request.
       * Removing columns creates one batch request that was not executed before
       */
      const oldFilters = oRowBinding.getFilters("Application");
      bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate;
    }
    if (bNeedManualRefresh && oTable.getFilter()) {
      oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
      oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
        oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
      }).catch(function (oError) {
        Log.error("Error while refreshing a filterBar VH table", oError);
      });
    }
    oTable.fireEvent("bindingUpdated");
    //no need to check for semantic targets here since we are in a VH and don't want to allow further navigation
  };

  /**
   * Creates a simple property for each identified complex property.
   *
   * @param propertiesToBeCreated Identified properties.
   * @param existingColumns The list of columns created for properties defined on the Value List.
   * @param sortRestrictionsInfo An object containing the sort restriction information
   * @param filterRestrictionsInfo An object containing the filter restriction information
   * @returns The array of properties created.
   * @private
   */
  function createRelatedProperties(propertiesToBeCreated, existingColumns, sortRestrictionsInfo, filterRestrictionsInfo) {
    const relatedPropertyNameMap = {},
      relatedColumns = [];
    Object.keys(propertiesToBeCreated).forEach(path => {
      const property = propertiesToBeCreated[path],
        relatedColumn = existingColumns.find(column => column.path === path); // Complex properties doesn't get path so only simple column are found
      if (!relatedColumn) {
        const newName = `Property::${path}`;
        relatedPropertyNameMap[path] = newName;
        const valueHelpTableColumn = {
          name: newName,
          label: getLabel(property),
          path: path,
          sortable: isSortableProperty(sortRestrictionsInfo, property),
          filterable: isFilterableProperty(filterRestrictionsInfo, property)
        };
        valueHelpTableColumn.maxConditions = getPropertyMaxConditions(filterRestrictionsInfo, valueHelpTableColumn);
        if (isTypeFilterable(property.type)) {
          const propertyTypeConfig = fetchTypeConfig(property);
          valueHelpTableColumn.typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
        }
        relatedColumns.push(valueHelpTableColumn);
      }
    });
    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      if (column.propertyInfos) {
        var _column$propertyInfos;
        column.propertyInfos = (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.map(columnName => relatedPropertyNameMap[columnName] ?? columnName);
      }
    });
    return relatedColumns;
  }

  /**
   * Identifies if the given property is sortable based on the sort restriction information.
   *
   * @param sortRestrictionsInfo The sort restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is sortable.
   * @private
   */
  function isSortableProperty(sortRestrictionsInfo, property) {
    const propertyPath = getPath(property);
    return propertyPath && sortRestrictionsInfo.propertyInfo[propertyPath] ? sortRestrictionsInfo.propertyInfo[propertyPath].sortable : property.sortable ?? true;
  }

  /**
   * Identifies if the given property is filterable based on the sort restriction information.
   *
   * @param filterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is filterable.
   * @private
   */
  function isFilterableProperty(filterRestrictionsInfo, property) {
    const propertyPath = getPath(property);
    return propertyPath && filterRestrictionsInfo !== null && filterRestrictionsInfo !== void 0 && filterRestrictionsInfo.propertyInfo.hasOwnProperty(propertyPath) ? filterRestrictionsInfo.propertyInfo[propertyPath].filterable : property.filterable ?? true;
  }

  /**
   * Identifies the maxConditions for a given property.
   *
   * @param filterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `-1` or `1` if the property is a MultiValueFilterExpression.
   * @private
   */

  function getPropertyMaxConditions(filterRestrictionsInfo, property) {
    var _filterRestrictionsIn;
    const propertyPath = getPath(property);
    return (_filterRestrictionsIn = filterRestrictionsInfo.propertyInfo) !== null && _filterRestrictionsIn !== void 0 && _filterRestrictionsIn.hasOwnProperty(propertyPath) && propertyPath && isMultiValueFilterExpression(filterRestrictionsInfo.propertyInfo[propertyPath]) ? -1 : 1;
  }

  /**
   * Provides the property path of a given property or custom data from the ValueHelp.
   *
   * @param property The target property or custom data from the ValueHelp.
   * @returns The property path.
   */
  function getPath(property) {
    return isProperty(property) ? property.name : property.path;
  }

  /**
   * Identifies the additional property which references to the unit, timezone, textArrangement or currency.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The additional property.
   * @private
   */
  function getAdditionalProperty(dataModelPropertyPath) {
    const property = dataModelPropertyPath.targetObject;
    const additionalPropertyPath = getAssociatedTextPropertyPath(property) || getAssociatedCurrencyPropertyPath(property) || getAssociatedUnitPropertyPath(property) || getAssociatedTimezonePropertyPath(property);
    if (!additionalPropertyPath) {
      return undefined;
    }
    const dataModelAdditionalProperty = enhanceDataModelPath(dataModelPropertyPath, additionalPropertyPath);

    //Additional Property could refer to a navigation property, keep the name and path as navigation property
    const additionalProperty = dataModelAdditionalProperty.targetObject;
    if (!additionalProperty) {
      return undefined;
    }
    return dataModelAdditionalProperty;
  }
  return ODataTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YVRhYmxlRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwidGFibGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImNyZWF0ZVByb3BlcnR5SW5mb3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInJlc29sdmVyIiwib25Nb2RlbENvbnRleHRDaGFuZ2UiLCJ0aGVuIiwib1N1Yk1vZGVsIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3MiLCJwcm9wZXJ0aWVzIiwiTWFjcm9zRGVsZWdhdGVVdGlsIiwic2V0Q2FjaGVkUHJvcGVydGllcyIsImdldEJpbmRpbmdDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJjcmVhdGVJbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiZGlhbG9nIiwiaXNBIiwiZ2V0UGFyZW50IiwiaW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwibmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGgiLCJnZXRQYXRoIiwiZ2V0SWQiLCJuZXdJbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJzZXRCaW5kaW5nQ29udGV4dCIsImV2ZW50IiwiZGF0YSIsImdldFNvdXJjZSIsImRldGFjaE1vZGVsQ29udGV4dENoYW5nZSIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyIsImRhdGFNb2RlbFByb3BlcnR5UGF0aCIsImRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgiLCJnZXRBZGRpdGlvbmFsUHJvcGVydHkiLCJyZWxhdGVkUHJvcGVydGllcyIsInRhcmdldE9iamVjdCIsImFkZGl0aW9uYWxQcm9wZXJ0eSIsImFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwicHJvcGVydHkiLCJwcm9wZXJ0eVBhdGgiLCJ0ZXh0QW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInRleHRBcnJhbmdlbWVudCIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwidG9TdHJpbmciLCJkaXNwbGF5TW9kZSIsImdldERpc3BsYXlNb2RlIiwibWV0YWRhdGFJbmZvIiwiZ2V0RGVsZWdhdGUiLCJwYXlsb2FkIiwiZW50aXR5U2V0UGF0aCIsImNvbGxlY3Rpb25OYW1lIiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwicmVxdWVzdE9iamVjdCIsImVudGl0eVNldEFubm90YXRpb25zIiwic29ydFJlc3RyaWN0aW9uc0luZm8iLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsImZpbHRlclJlc3RyaWN0aW9ucyIsImZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvIiwiY3VzdG9tRGF0YUZvckNvbHVtbnMiLCJnZXRDdXN0b21EYXRhIiwicHJvcGVydGllc1RvQmVDcmVhdGVkIiwiZGF0YU1vZGVsRW50aXR5UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImdldENvbnRleHQiLCJjdXN0b21EYXRhIiwiZm9yRWFjaCIsImNvbHVtbkRlZiIsInByb3BlcnR5SW5mbyIsIm5hbWUiLCJwYXRoIiwibGFiZWwiLCJzb3J0YWJsZSIsImlzU29ydGFibGVQcm9wZXJ0eSIsImZpbHRlcmFibGUiLCJpc0ZpbHRlcmFibGVQcm9wZXJ0eSIsIm1heENvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eU1heENvbmRpdGlvbnMiLCJ0eXBlQ29uZmlnIiwiaXNUeXBlRmlsdGVyYWJsZSIsIiRUeXBlIiwiZ2V0VHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwidW5kZWZpbmVkIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJ0YXJnZXRQcm9wZXJ0eVBhdGgiLCJ0eXBlIiwicHJvcGVydHlUeXBlQ29uZmlnIiwiZmV0Y2hUeXBlQ29uZmlnIiwiVHlwZVV0aWwiLCJmb3JtYXRPcHRpb25zIiwiY29uc3RyYWludHMiLCJyZWxhdGVkUHJvcGVydGllc0luZm8iLCJyZWxhdGVkUHJvcGVydHlQYXRocyIsImtleXMiLCJsZW5ndGgiLCJwcm9wZXJ0eUluZm9zIiwiZmluZCIsInB1c2giLCJyZWxhdGVkQ29sdW1ucyIsImNyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzIiwiY29uY2F0IiwidXBkYXRlQmluZGluZ0luZm8iLCJvTURDVGFibGUiLCJvQmluZGluZ0luZm8iLCJhcHBseSIsIm9NZXRhZGF0YUluZm8iLCJjb2xsZWN0aW9uUGF0aCIsIm9GaWx0ZXIiLCJDb3JlIiwiYnlJZCIsImdldEZpbHRlciIsImJGaWx0ZXJFbmFibGVkIiwiaXNGaWx0ZXJpbmdFbmFibGVkIiwibUNvbmRpdGlvbnMiLCJvSW5uZXJGaWx0ZXJJbmZvIiwib091dGVyRmlsdGVySW5mbyIsImFGaWx0ZXJzIiwidGFibGVQcm9wZXJ0aWVzIiwiZ2V0Q2FjaGVkUHJvcGVydGllcyIsImdldENvbmRpdGlvbnMiLCJGaWx0ZXJVdGlsIiwiZ2V0RmlsdGVySW5mbyIsImZpbHRlcnMiLCJhUGFyYW1ldGVyTmFtZXMiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRQYXJhbWV0ZXJOYW1lcyIsIl91cGRhdGVQcm9wZXJ0eUluZm8iLCJzUGFyYW1ldGVyUGF0aCIsImdldFBhcmFtZXRlcnNJbmZvIiwicGFyYW1ldGVycyIsIiRzZWFyY2giLCJDb21tb25VdGlscyIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iLCJnZXRTZWFyY2giLCJfYXBwbHlEZWZhdWx0U29ydGluZyIsIiRzZWxlY3QiLCJyZWR1Y2UiLCJzUXVlcnkiLCJvUHJvcGVydHkiLCJpbmRleE9mIiwiJGNvdW50IiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwiRmlsdGVyIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsIm9UYWJsZSIsIm9QYXlsb2FkIiwic29ydGVyIiwiZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUiLCJTb3J0ZXIiLCJhVGFibGVQcm9wZXJ0aWVzIiwiYUNvbmRpdGlvbktleSIsIm9NZXRhTW9kZWwiLCJjb25kaXRpb25LZXkiLCJmaW5kSW5kZXgiLCJ0YWJsZVByb3BlcnR5Iiwib0NvbHVtbkRlZiIsImdldE9iamVjdCIsInVwZGF0ZUJpbmRpbmciLCJvQmluZGluZyIsImJOZWVkTWFudWFsUmVmcmVzaCIsIm9JbnRlcm5hbEJpbmRpbmdDb250ZXh0Iiwic01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5IiwiYlBlbmRpbmdNYW51YWxVcGRhdGUiLCJnZXRQcm9wZXJ0eSIsIm9Sb3dCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsIm9sZEZpbHRlcnMiLCJnZXRGaWx0ZXJzIiwiZGVlcEVxdWFsIiwiZ2V0UXVlcnlPcHRpb25zRnJvbVBhcmFtZXRlcnMiLCJyZXF1ZXN0UmVmcmVzaCIsImdldEdyb3VwSWQiLCJmaW5hbGx5IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImZpcmVFdmVudCIsImV4aXN0aW5nQ29sdW1ucyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXAiLCJyZWxhdGVkQ29sdW1uIiwiY29sdW1uIiwibmV3TmFtZSIsInZhbHVlSGVscFRhYmxlQ29sdW1uIiwiZ2V0TGFiZWwiLCJtYXAiLCJjb2x1bW5OYW1lIiwiaGFzT3duUHJvcGVydHkiLCJpc011bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uIiwiaXNQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgiLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGgiLCJkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGZldGNoVHlwZUNvbmZpZyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdGdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8sXG5cdGdldFNvcnRSZXN0cmljdGlvbnNJbmZvLFxuXHRpc011bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uLFxuXHRTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCxcblx0Z2V0TGFiZWxcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IERlZmF1bHRUeXBlRm9yRWRtVHlwZSwgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgTWFjcm9zRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVGFibGVEZWxlZ2F0ZVwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC91dGlsL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3V0aWwvRmlsdGVyVXRpbFwiO1xuaW1wb3J0IE1EQ1RhYmxlIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L01EQ1RhYmxlXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5cbmV4cG9ydCB0eXBlIFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0c29ydGFibGU/OiBib29sZWFuO1xuXHRwYXRoPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0ZmlsdGVyYWJsZT86IGJvb2xlYW47XG5cdHR5cGVDb25maWc/OiBPYmplY3Q7XG5cdG1heENvbmRpdGlvbnM/OiBudW1iZXI7XG59O1xudHlwZSBDb21wbGV4UHJvcGVydHlNYXAgPSBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT47XG5cbi8qKlxuICogVGVzdCBkZWxlZ2F0ZSBmb3IgT0RhdGEgVjQuXG4gKi9cbmNvbnN0IE9EYXRhVGFibGVEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIFRhYmxlRGVsZWdhdGUpO1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKHRhYmxlKTtcblx0bGV0IGNyZWF0ZVByb3BlcnR5SW5mb3M7XG5cdGlmICghbW9kZWwpIHtcblx0XHRjcmVhdGVQcm9wZXJ0eUluZm9zID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRhYmxlLmF0dGFjaE1vZGVsQ29udGV4dENoYW5nZShcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc29sdmVyOiByZXNvbHZlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uTW9kZWxDb250ZXh0Q2hhbmdlIGFzIGFueSxcblx0XHRcdFx0dGhpc1xuXHRcdFx0KTtcblx0XHR9KS50aGVuKChvU3ViTW9kZWwpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKHRhYmxlLCBvU3ViTW9kZWwpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNyZWF0ZVByb3BlcnR5SW5mb3MgPSB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKHRhYmxlLCBtb2RlbCk7XG5cdH1cblxuXHRyZXR1cm4gY3JlYXRlUHJvcGVydHlJbmZvcy50aGVuKGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRNYWNyb3NEZWxlZ2F0ZVV0aWwuc2V0Q2FjaGVkUHJvcGVydGllcyh0YWJsZSwgcHJvcGVydGllcyk7XG5cdFx0KHRhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgQ29udGV4dCkuc2V0UHJvcGVydHkoXCJ0YWJsZVByb3BlcnRpZXNBdmFpbGFibGVcIiwgdHJ1ZSk7XG5cdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdH0pO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmNyZWF0ZUludGVybmFsQmluZGluZ0NvbnRleHQgPSBmdW5jdGlvbiAodGFibGU6IFRhYmxlKSB7XG5cdGxldCBkaWFsb2c6IE1hbmFnZWRPYmplY3QgfCBudWxsID0gdGFibGU7XG5cdHdoaWxlIChkaWFsb2cgJiYgIWRpYWxvZy5pc0EoXCJzYXAudWkubWRjLnZhbHVlaGVscC5EaWFsb2dcIikpIHtcblx0XHRkaWFsb2cgPSAoZGlhbG9nIGFzIE1hbmFnZWRPYmplY3QpLmdldFBhcmVudCgpO1xuXHR9XG5cblx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRhYmxlLmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cblx0aWYgKGRpYWxvZyAmJiBpbnRlcm5hbE1vZGVsKSB7XG5cdFx0Y29uc3QgbmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGggPSBkaWFsb2cuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSEuZ2V0UGF0aCgpICsgYDo6VkhEaWFsb2c6OiR7ZGlhbG9nLmdldElkKCl9Ojp0YWJsZWA7XG5cdFx0Y29uc3QgbmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IGludGVybmFsTW9kZWwuYmluZENvbnRleHQobmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGgpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdHRhYmxlLnNldEJpbmRpbmdDb250ZXh0KG5ld0ludGVybmFsQmluZGluZ0NvbnRleHQhLCBcImludGVybmFsXCIpO1xuXHR9XG59O1xuXG5mdW5jdGlvbiBvbk1vZGVsQ29udGV4dENoYW5nZSh0aGlzOiB0eXBlb2YgT0RhdGFUYWJsZURlbGVnYXRlLCBldmVudDogRXZlbnQsIGRhdGE6IGFueSkge1xuXHRjb25zdCB0YWJsZSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIFRhYmxlO1xuXHRPRGF0YVRhYmxlRGVsZWdhdGUuY3JlYXRlSW50ZXJuYWxCaW5kaW5nQ29udGV4dCh0YWJsZSk7XG5cdGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwodGFibGUpO1xuXG5cdGlmIChtb2RlbCkge1xuXHRcdHRhYmxlLmRldGFjaE1vZGVsQ29udGV4dENoYW5nZShvbk1vZGVsQ29udGV4dENoYW5nZSBhcyBhbnkpO1xuXHRcdGRhdGEucmVzb2x2ZXIobW9kZWwpO1xuXHR9XG59XG4vKipcbiAqIENvbGxlY3QgcmVsYXRlZCBwcm9wZXJ0aWVzIGZyb20gYSBwcm9wZXJ0eSdzIGFubm90YXRpb25zLlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGggVGhlIG1vZGVsIG9iamVjdCBwYXRoIG9mIHRoZSBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgdGhhdCB3ZXJlIGlkZW50aWZpZWQuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoZGF0YU1vZGVsUHJvcGVydHlQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdGNvbnN0IGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eVBhdGggPSBnZXRBZGRpdGlvbmFsUHJvcGVydHkoZGF0YU1vZGVsUHJvcGVydHlQYXRoKTtcblx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eU1hcCA9IHt9O1xuXHRpZiAoZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5UGF0aD8udGFyZ2V0T2JqZWN0KSB7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5ID0gZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5UGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5UGF0aCwgdHJ1ZSk7XG5cblx0XHRjb25zdCBwcm9wZXJ0eSA9IGRhdGFNb2RlbFByb3BlcnR5UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIHRydWUpO1xuXG5cdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LFxuXHRcdFx0dGV4dEFycmFuZ2VtZW50ID0gdGV4dEFubm90YXRpb24/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50Py50b1N0cmluZygpLFxuXHRcdFx0ZGlzcGxheU1vZGUgPSB0ZXh0QW5ub3RhdGlvbiAmJiB0ZXh0QXJyYW5nZW1lbnQgJiYgZ2V0RGlzcGxheU1vZGUocHJvcGVydHkpO1xuXG5cdFx0aWYgKGRpc3BsYXlNb2RlID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzW2FkZGl0aW9uYWxQcm9wZXJ0eVBhdGhdID0gYWRkaXRpb25hbFByb3BlcnR5O1xuXHRcdH0gZWxzZSBpZiAoKGRpc3BsYXlNb2RlICYmIGRpc3BsYXlNb2RlICE9PSBcIlZhbHVlXCIpIHx8ICF0ZXh0QW5ub3RhdGlvbikge1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXNbcHJvcGVydHlQYXRoXSA9IHByb3BlcnR5O1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXNbYWRkaXRpb25hbFByb3BlcnR5UGF0aF0gPSBhZGRpdGlvbmFsUHJvcGVydHk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuT0RhdGFUYWJsZURlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zID0gZnVuY3Rpb24gKHRhYmxlOiBhbnksIG1vZGVsOiBhbnkpIHtcblx0Y29uc3QgbWV0YWRhdGFJbmZvID0gdGFibGUuZ2V0RGVsZWdhdGUoKS5wYXlsb2FkO1xuXHRjb25zdCBwcm9wZXJ0aWVzOiBWYWx1ZUhlbHBUYWJsZUNvbHVtbltdID0gW107XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBgLyR7bWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfWA7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXG5cdHJldHVybiBtZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBgKS50aGVuKGZ1bmN0aW9uIChlbnRpdHlTZXRBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgc29ydFJlc3RyaWN0aW9uc0luZm8gPSBnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhlbnRpdHlTZXRBbm5vdGF0aW9ucyk7XG5cdFx0Y29uc3QgZmlsdGVyUmVzdHJpY3Rpb25zID0gZW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnNcIl07XG5cdFx0Y29uc3QgZmlsdGVyUmVzdHJpY3Rpb25zSW5mbyA9IGdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8oZmlsdGVyUmVzdHJpY3Rpb25zKTtcblxuXHRcdGNvbnN0IGN1c3RvbURhdGFGb3JDb2x1bW5zID0gTWFjcm9zRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGFibGUsIFwiY29sdW1uc1wiKTtcblx0XHRjb25zdCBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5PiA9IHt9O1xuXHRcdGNvbnN0IGRhdGFNb2RlbEVudGl0eVBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRDb250ZXh0KGVudGl0eVNldFBhdGgpKTtcblx0XHRjdXN0b21EYXRhRm9yQ29sdW1ucy5jdXN0b21EYXRhLmZvckVhY2goZnVuY3Rpb24gKGNvbHVtbkRlZjogYW55KSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eUluZm86IFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRcdFx0XHRuYW1lOiBjb2x1bW5EZWYucGF0aCxcblx0XHRcdFx0bGFiZWw6IGNvbHVtbkRlZi5sYWJlbCxcblx0XHRcdFx0c29ydGFibGU6IGlzU29ydGFibGVQcm9wZXJ0eShzb3J0UmVzdHJpY3Rpb25zSW5mbywgY29sdW1uRGVmKSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogaXNGaWx0ZXJhYmxlUHJvcGVydHkoZmlsdGVyUmVzdHJpY3Rpb25zLCBjb2x1bW5EZWYpLFxuXHRcdFx0XHRtYXhDb25kaXRpb25zOiBnZXRQcm9wZXJ0eU1heENvbmRpdGlvbnMoZmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgY29sdW1uRGVmKSxcblx0XHRcdFx0dHlwZUNvbmZpZzogaXNUeXBlRmlsdGVyYWJsZShjb2x1bW5EZWYuJFR5cGUpID8gdGFibGUuZ2V0VHlwZVV0aWwoKS5nZXRUeXBlQ29uZmlnKGNvbHVtbkRlZi4kVHlwZSkgOiB1bmRlZmluZWRcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IGRhdGFNb2RlbFByb3BlcnR5UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbEVudGl0eVBhdGgsIGNvbHVtbkRlZi5wYXRoKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5ID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRcdGlmIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRjb25zdCB0YXJnZXRQcm9wZXJ0eVBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFByb3BlcnR5UGF0aCwgdHJ1ZSk7XG5cdFx0XHRcdGxldCB0eXBlQ29uZmlnO1xuXHRcdFx0XHRpZiAoaXNUeXBlRmlsdGVyYWJsZShwcm9wZXJ0eS50eXBlIGFzIGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGUpKSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gZmV0Y2hUeXBlQ29uZmlnKHByb3BlcnR5KTtcblx0XHRcdFx0XHR0eXBlQ29uZmlnID1cblx0XHRcdFx0XHRcdFR5cGVVdGlsLmdldFR5cGVDb25maWcocHJvcGVydHlUeXBlQ29uZmlnLnR5cGUsIHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLCBwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHMpID8/XG5cdFx0XHRcdFx0XHR0YWJsZS5nZXRUeXBlVXRpbCgpLmdldFR5cGVDb25maWcoY29sdW1uRGVmLiRUeXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvL0NoZWNrIGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgcHJvcGVydHkgbGlua2VkIHRvIHRoZSBwcm9wZXJ0eSBhcyBhIFVuaXQsIEN1cnJlbmN5LCBUaW1lem9uZSBvciB0ZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKGRhdGFNb2RlbFByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0eVBhdGhzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyk7XG5cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0eVBhdGhzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gcmVsYXRlZFByb3BlcnR5UGF0aHM7XG5cdFx0XHRcdFx0Ly9Db21wbGV4IHByb3BlcnRpZXMgbXVzdCBiZSBoaWRkZW4gZm9yIHNvcnRpbmcgYW5kIGZpbHRlcmluZ1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5zb3J0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5maWx0ZXJhYmxlID0gZmFsc2U7XG5cdFx0XHRcdFx0Ly8gQ29sbGVjdCBpbmZvcm1hdGlvbiBvZiByZWxhdGVkIGNvbHVtbnMgdG8gYmUgY3JlYXRlZC5cblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydHlQYXRocy5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbcGF0aF0gPSByZWxhdGVkUHJvcGVydGllc0luZm9bcGF0aF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gQWxzbyBhZGQgcHJvcGVydHkgZm9yIHRoZSBpbk91dCBQYXJhbWV0ZXJzIG9uIHRoZSBWYWx1ZUhlbHAgd2hlbiB0ZXh0QXJyYW5nZW1lbnQgaXMgc2V0IHRvICNUZXh0T25seVxuXHRcdFx0XHRcdC8vIEl0IHdpbGwgbm90IGJlIGxpbmtlZCB0byB0aGUgY29tcGxleCBQcm9wZXJ0eSAoQkNQIDIyNzAxNDExNTQpXG5cdFx0XHRcdFx0aWYgKCFyZWxhdGVkUHJvcGVydHlQYXRocy5maW5kKChwYXRoKSA9PiByZWxhdGVkUHJvcGVydGllc0luZm9bcGF0aF0gPT09IHByb3BlcnR5KSkge1xuXHRcdFx0XHRcdFx0cHJvcGVydGllc1RvQmVDcmVhdGVkW3RhcmdldFByb3BlcnR5UGF0aF0gPSBwcm9wZXJ0eTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cHJvcGVydHlJbmZvLnBhdGggPSBjb2x1bW5EZWYucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRwcm9wZXJ0eUluZm8udHlwZUNvbmZpZyA9IHByb3BlcnR5SW5mby50eXBlQ29uZmlnID8gdHlwZUNvbmZpZyA6IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHByb3BlcnR5SW5mby5wYXRoID0gY29sdW1uRGVmLnBhdGg7XG5cdFx0XHR9XG5cdFx0XHRwcm9wZXJ0aWVzLnB1c2gocHJvcGVydHlJbmZvKTtcblx0XHR9KTtcblx0XHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IGNyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzKHByb3BlcnRpZXNUb0JlQ3JlYXRlZCwgcHJvcGVydGllcywgc29ydFJlc3RyaWN0aW9uc0luZm8sIGZpbHRlclJlc3RyaWN0aW9uc0luZm8pO1xuXHRcdHJldHVybiBwcm9wZXJ0aWVzLmNvbmNhdChyZWxhdGVkQ29sdW1ucyk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBiaW5kaW5nIGluZm8gd2l0aCB0aGUgcmVsZXZhbnQgcGF0aCBhbmQgbW9kZWwgZnJvbSB0aGUgbWV0YWRhdGEuXG4gKlxuICogQHBhcmFtIG9NRENUYWJsZSBUaGUgTURDVGFibGUgaW5zdGFuY2VcbiAqIEBwYXJhbSBvQmluZGluZ0luZm8gVGhlIGJpbmRpbmdJbmZvIG9mIHRoZSB0YWJsZVxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8gPSBmdW5jdGlvbiAob01EQ1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdFRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8uYXBwbHkodGhpcywgW29NRENUYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdGlmICghb01EQ1RhYmxlKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IG9NRENUYWJsZS5nZXREZWxlZ2F0ZSgpLnBheWxvYWQ7XG5cblx0aWYgKG9NZXRhZGF0YUluZm8gJiYgb0JpbmRpbmdJbmZvKSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBvQmluZGluZ0luZm8ucGF0aCB8fCBvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25QYXRoIHx8IGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfWA7XG5cdFx0b0JpbmRpbmdJbmZvLm1vZGVsID0gb0JpbmRpbmdJbmZvLm1vZGVsIHx8IG9NZXRhZGF0YUluZm8ubW9kZWw7XG5cdH1cblxuXHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdG9CaW5kaW5nSW5mbyA9IHt9O1xuXHR9XG5cblx0Y29uc3Qgb0ZpbHRlciA9IENvcmUuYnlJZChvTURDVGFibGUuZ2V0RmlsdGVyKCkpIGFzIGFueSxcblx0XHRiRmlsdGVyRW5hYmxlZCA9IG9NRENUYWJsZS5pc0ZpbHRlcmluZ0VuYWJsZWQoKTtcblx0bGV0IG1Db25kaXRpb25zOiBhbnk7XG5cdGxldCBvSW5uZXJGaWx0ZXJJbmZvLCBvT3V0ZXJGaWx0ZXJJbmZvOiBhbnk7XG5cdGNvbnN0IGFGaWx0ZXJzID0gW107XG5cdGNvbnN0IHRhYmxlUHJvcGVydGllcyA9IE1hY3Jvc0RlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKG9NRENUYWJsZSk7XG5cblx0Ly9UT0RPOiBjb25zaWRlciBhIG1lY2hhbmlzbSAoJ0ZpbHRlck1lcmdlVXRpbCcgb3IgZW5oYW5jZSAnRmlsdGVyVXRpbCcpIHRvIGFsbG93IHRoZSBjb25uZWN0aW9uIGJldHdlZW4gZGlmZmVyZW50IGZpbHRlcnMpXG5cdGlmIChiRmlsdGVyRW5hYmxlZCkge1xuXHRcdG1Db25kaXRpb25zID0gb01EQ1RhYmxlLmdldENvbmRpdGlvbnMoKTtcblx0XHRvSW5uZXJGaWx0ZXJJbmZvID0gRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9NRENUYWJsZSwgbUNvbmRpdGlvbnMsIHRhYmxlUHJvcGVydGllcyEsIFtdKSBhcyBhbnk7XG5cdFx0aWYgKG9Jbm5lckZpbHRlckluZm8uZmlsdGVycykge1xuXHRcdFx0YUZpbHRlcnMucHVzaChvSW5uZXJGaWx0ZXJJbmZvLmZpbHRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChvRmlsdGVyKSB7XG5cdFx0bUNvbmRpdGlvbnMgPSBvRmlsdGVyLmdldENvbmRpdGlvbnMoKTtcblx0XHRpZiAobUNvbmRpdGlvbnMpIHtcblx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJOYW1lcyA9IERlbGVnYXRlVXRpbC5nZXRQYXJhbWV0ZXJOYW1lcyhvRmlsdGVyKTtcblx0XHRcdC8vIFRoZSB0YWJsZSBwcm9wZXJ0aWVzIG5lZWRzIHRvIHVwZGF0ZWQgd2l0aCB0aGUgZmlsdGVyIGZpZWxkIGlmIG5vIFNlbGVjdGlvbmZpZXJsZHMgYXJlIGFubm90YXRlZCBhbmQgbm90IHBhcnQgYXMgdmFsdWUgaGVscCBwYXJhbWV0ZXJcblx0XHRcdE9EYXRhVGFibGVEZWxlZ2F0ZS5fdXBkYXRlUHJvcGVydHlJbmZvKHRhYmxlUHJvcGVydGllcywgb01EQ1RhYmxlLCBtQ29uZGl0aW9ucywgb01ldGFkYXRhSW5mbyk7XG5cdFx0XHRvT3V0ZXJGaWx0ZXJJbmZvID0gRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXIsIG1Db25kaXRpb25zLCB0YWJsZVByb3BlcnRpZXMhLCBhUGFyYW1ldGVyTmFtZXMpO1xuXG5cdFx0XHRpZiAob091dGVyRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRcdGFGaWx0ZXJzLnB1c2gob091dGVyRmlsdGVySW5mby5maWx0ZXJzKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0UGFyYW1ldGVyc0luZm8ob0ZpbHRlciwgbUNvbmRpdGlvbnMpO1xuXHRcdFx0aWYgKHNQYXJhbWV0ZXJQYXRoKSB7XG5cdFx0XHRcdG9CaW5kaW5nSW5mby5wYXRoID0gc1BhcmFtZXRlclBhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gZ2V0IHRoZSBiYXNpYyBzZWFyY2hcblx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvRmlsdGVyLmdldFNlYXJjaCgpKSB8fCB1bmRlZmluZWQ7XG5cdH1cblxuXHR0aGlzLl9hcHBseURlZmF1bHRTb3J0aW5nKG9CaW5kaW5nSW5mbywgb01EQ1RhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZCk7XG5cdC8vIGFkZCBzZWxlY3QgdG8gb0JpbmRpbmdJbmZvIChCQ1AgMjE3MDE2MzAxMilcblx0b0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlbGVjdCA9IHRhYmxlUHJvcGVydGllcz8ucmVkdWNlKGZ1bmN0aW9uIChzUXVlcnk6IHN0cmluZywgb1Byb3BlcnR5OiBhbnkpIHtcblx0XHQvLyBOYXZpZ2F0aW9uIHByb3BlcnRpZXMgKHJlcHJlc2VudGVkIGJ5IFgvWSkgc2hvdWxkIG5vdCBiZSBhZGRlZCB0byAkc2VsZWN0LlxuXHRcdC8vIFRvRG8gOiBUaGV5IHNob3VsZCBiZSBhZGRlZCBhcyAkZXhwYW5kPVgoJHNlbGVjdD1ZKSBpbnN0ZWFkXG5cdFx0aWYgKG9Qcm9wZXJ0eS5wYXRoICYmIG9Qcm9wZXJ0eS5wYXRoLmluZGV4T2YoXCIvXCIpID09PSAtMSkge1xuXHRcdFx0c1F1ZXJ5ID0gc1F1ZXJ5ID8gYCR7c1F1ZXJ5fSwke29Qcm9wZXJ0eS5wYXRofWAgOiBvUHJvcGVydHkucGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHNRdWVyeTtcblx0fSwgXCJcIik7XG5cblx0Ly8gQWRkICRjb3VudFxuXHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kY291bnQgPSB0cnVlO1xuXG5cdC8vSWYgdGhlIGVudGl0eSBpcyBEcmFmdEVuYWJsZWQgYWRkIGEgRHJhZnRGaWx0ZXJcblx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01EQ1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksIG9CaW5kaW5nSW5mby5wYXRoKSkge1xuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIEZpbHRlck9wZXJhdG9yLkVRLCB0cnVlKSk7XG5cdH1cblxuXHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG5ldyBGaWx0ZXIoYUZpbHRlcnMsIHRydWUpO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKC8qb1BheWxvYWQqLykge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuX2dldE1vZGVsID0gZnVuY3Rpb24gKG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IChvVGFibGUuZ2V0RGVsZWdhdGUoKSBhcyBhbnkpLnBheWxvYWQ7XG5cdHJldHVybiBvVGFibGUuZ2V0TW9kZWwob01ldGFkYXRhSW5mby5tb2RlbCk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgYSBkZWZhdWx0IHNvcnQgb3JkZXIgaWYgbmVlZGVkLiBUaGlzIGlzIG9ubHkgdGhlIGNhc2UgaWYgdGhlIHJlcXVlc3QgaXMgbm90IGEgJHNlYXJjaCByZXF1ZXN0XG4gKiAobWVhbnMgdGhlIHBhcmFtZXRlciAkc2VhcmNoIG9mIHRoZSBiaW5kaW5nSW5mbyBpcyB1bmRlZmluZWQpIGFuZCBpZiBub3QgYWxyZWFkeSBhIHNvcnQgb3JkZXIgaXMgc2V0LFxuICogZS5nLiB2aWEgcHJlc2VudGF0aW9uIHZhcmlhbnQgb3IgbWFudWFsIGJ5IHRoZSB1c2VyLlxuICpcbiAqIEBwYXJhbSBvQmluZGluZ0luZm8gVGhlIGJpbmRpbmdJbmZvIG9mIHRoZSB0YWJsZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBUYWJsZURlbGVnYXRlXG4gKi9cbk9EYXRhVGFibGVEZWxlZ2F0ZS5fYXBwbHlEZWZhdWx0U29ydGluZyA9IGZ1bmN0aW9uIChvQmluZGluZ0luZm86IGFueSwgb1BheWxvYWQ6IGFueSkge1xuXHRpZiAob0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMgJiYgb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCA9PSB1bmRlZmluZWQgJiYgb0JpbmRpbmdJbmZvLnNvcnRlciAmJiBvQmluZGluZ0luZm8uc29ydGVyLmxlbmd0aCA9PSAwKSB7XG5cdFx0Y29uc3QgZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgPSBvUGF5bG9hZCA/IG9QYXlsb2FkLmRlZmF1bHRTb3J0UHJvcGVydHlOYW1lIDogdW5kZWZpbmVkO1xuXHRcdGlmIChkZWZhdWx0U29ydFByb3BlcnR5TmFtZSkge1xuXHRcdFx0b0JpbmRpbmdJbmZvLnNvcnRlci5wdXNoKG5ldyBTb3J0ZXIoZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUsIGZhbHNlKSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHRhYmxlIHByb3BlcnRpZXMgd2l0aCBmaWx0ZXIgZmllbGQgaW5mb3MuXG4gKlxuICogQHBhcmFtIGFUYWJsZVByb3BlcnRpZXMgQXJyYXkgd2l0aCB0YWJsZSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gb01EQ1RhYmxlIFRoZSBNRENUYWJsZSBpbnN0YW5jZVxuICogQHBhcmFtIG1Db25kaXRpb25zIFRoZSBjb25kaXRpb25zIG9mIHRoZSB0YWJsZVxuICogQHBhcmFtIG9NZXRhZGF0YUluZm8gVGhlIG1ldGFkYXRhIGluZm8gb2YgdGhlIGZpbHRlciBmaWVsZFxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUuX3VwZGF0ZVByb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChcblx0YVRhYmxlUHJvcGVydGllczogYW55W10sXG5cdG9NRENUYWJsZTogTURDVGFibGUsXG5cdG1Db25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRvTWV0YWRhdGFJbmZvOiBhbnlcbikge1xuXHRjb25zdCBhQ29uZGl0aW9uS2V5ID0gT2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLFxuXHRcdG9NZXRhTW9kZWwgPSBvTURDVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSE7XG5cdGFDb25kaXRpb25LZXkuZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uS2V5OiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHRhVGFibGVQcm9wZXJ0aWVzLmZpbmRJbmRleChmdW5jdGlvbiAodGFibGVQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdHJldHVybiB0YWJsZVByb3BlcnR5LnBhdGggPT09IGNvbmRpdGlvbktleTtcblx0XHRcdH0pID09PSAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0NvbHVtbkRlZiA9IHtcblx0XHRcdFx0cGF0aDogY29uZGl0aW9uS2V5LFxuXHRcdFx0XHR0eXBlQ29uZmlnOiBvTURDVGFibGVcblx0XHRcdFx0XHQuZ2V0VHlwZVV0aWwoKVxuXHRcdFx0XHRcdC5nZXRUeXBlQ29uZmlnKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfS8ke2NvbmRpdGlvbktleX1gKS4kVHlwZSlcblx0XHRcdH07XG5cdFx0XHRhVGFibGVQcm9wZXJ0aWVzLnB1c2gob0NvbHVtbkRlZik7XG5cdFx0fVxuXHR9KTtcbn07XG5cbk9EYXRhVGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nID0gZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSwgb0JpbmRpbmc6IGFueSkge1xuXHRsZXQgYk5lZWRNYW51YWxSZWZyZXNoID0gZmFsc2U7XG5cdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdGNvbnN0IHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSA9IFwicGVuZGluZ01hbnVhbEJpbmRpbmdVcGRhdGVcIjtcblx0Y29uc3QgYlBlbmRpbmdNYW51YWxVcGRhdGUgPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dD8uZ2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5KTtcblx0bGV0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblxuXHQvL29CaW5kaW5nPW51bGwgbWVhbnMgdGhhdCBhIHJlYmluZGluZyBuZWVkcyB0byBiZSBmb3JjZWQgdmlhIHVwZGF0ZUJpbmRpbmcgaW4gbWRjIFRhYmxlRGVsZWdhdGVcblx0VGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nLmFwcGx5KE9EYXRhVGFibGVEZWxlZ2F0ZSwgW29UYWJsZSwgb0JpbmRpbmdJbmZvLCBvQmluZGluZ10pO1xuXHQvL2dldCByb3cgYmluZGluZyBhZnRlciByZWJpbmQgZnJvbSBUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcgaW4gY2FzZSBvQmluZGluZyB3YXMgbnVsbFxuXHRpZiAoIW9Sb3dCaW5kaW5nKSB7XG5cdFx0b1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cdGlmIChvUm93QmluZGluZykge1xuXHRcdC8qKlxuXHRcdCAqIE1hbnVhbCByZWZyZXNoIGlmIGZpbHRlcnMgYXJlIG5vdCBjaGFuZ2VkIGJ5IGJpbmRpbmcucmVmcmVzaCgpIHNpbmNlIHVwZGF0aW5nIHRoZSBiaW5kaW5nSW5mb1xuXHRcdCAqIGlzIG5vdCBlbm91Z2ggdG8gdHJpZ2dlciBhIGJhdGNoIHJlcXVlc3QuXG5cdFx0ICogUmVtb3ZpbmcgY29sdW1ucyBjcmVhdGVzIG9uZSBiYXRjaCByZXF1ZXN0IHRoYXQgd2FzIG5vdCBleGVjdXRlZCBiZWZvcmVcblx0XHQgKi9cblx0XHRjb25zdCBvbGRGaWx0ZXJzID0gb1Jvd0JpbmRpbmcuZ2V0RmlsdGVycyhcIkFwcGxpY2F0aW9uXCIpO1xuXHRcdGJOZWVkTWFudWFsUmVmcmVzaCA9XG5cdFx0XHRkZWVwRXF1YWwob0JpbmRpbmdJbmZvLmZpbHRlcnMsIG9sZEZpbHRlcnNbMF0pICYmXG5cdFx0XHRvUm93QmluZGluZy5nZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycygpLiRzZWFyY2ggPT09IG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggJiZcblx0XHRcdCFiUGVuZGluZ01hbnVhbFVwZGF0ZTtcblx0fVxuXG5cdGlmIChiTmVlZE1hbnVhbFJlZnJlc2ggJiYgb1RhYmxlLmdldEZpbHRlcigpKSB7XG5cdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQ/LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgdHJ1ZSk7XG5cdFx0b1Jvd0JpbmRpbmdcblx0XHRcdC5yZXF1ZXN0UmVmcmVzaChvUm93QmluZGluZy5nZXRHcm91cElkKCkpXG5cdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0Py5zZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXksIGZhbHNlKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgYSBmaWx0ZXJCYXIgVkggdGFibGVcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cdG9UYWJsZS5maXJlRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiKTtcblx0Ly9ubyBuZWVkIHRvIGNoZWNrIGZvciBzZW1hbnRpYyB0YXJnZXRzIGhlcmUgc2luY2Ugd2UgYXJlIGluIGEgVkggYW5kIGRvbid0IHdhbnQgdG8gYWxsb3cgZnVydGhlciBuYXZpZ2F0aW9uXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzaW1wbGUgcHJvcGVydHkgZm9yIGVhY2ggaWRlbnRpZmllZCBjb21wbGV4IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQgSWRlbnRpZmllZCBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIGV4aXN0aW5nQ29sdW1ucyBUaGUgbGlzdCBvZiBjb2x1bW5zIGNyZWF0ZWQgZm9yIHByb3BlcnRpZXMgZGVmaW5lZCBvbiB0aGUgVmFsdWUgTGlzdC5cbiAqIEBwYXJhbSBzb3J0UmVzdHJpY3Rpb25zSW5mbyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuICogQHBhcmFtIGZpbHRlclJlc3RyaWN0aW9uc0luZm8gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZpbHRlciByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuICogQHJldHVybnMgVGhlIGFycmF5IG9mIHByb3BlcnRpZXMgY3JlYXRlZC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5Pixcblx0ZXhpc3RpbmdDb2x1bW5zOiBWYWx1ZUhlbHBUYWJsZUNvbHVtbltdLFxuXHRzb3J0UmVzdHJpY3Rpb25zSW5mbzogU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlLFxuXHRmaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnlcbik6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge30sXG5cdFx0cmVsYXRlZENvbHVtbnM6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10gPSBbXTtcblx0T2JqZWN0LmtleXMocHJvcGVydGllc1RvQmVDcmVhdGVkKS5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbcGF0aF0sXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLnBhdGggPT09IHBhdGgpOyAvLyBDb21wbGV4IHByb3BlcnRpZXMgZG9lc24ndCBnZXQgcGF0aCBzbyBvbmx5IHNpbXBsZSBjb2x1bW4gYXJlIGZvdW5kXG5cdFx0aWYgKCFyZWxhdGVkQ29sdW1uKSB7XG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke3BhdGh9YDtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcGF0aF0gPSBuZXdOYW1lO1xuXHRcdFx0Y29uc3QgdmFsdWVIZWxwVGFibGVDb2x1bW46IFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRcdFx0XHRuYW1lOiBuZXdOYW1lLFxuXHRcdFx0XHRsYWJlbDogZ2V0TGFiZWwocHJvcGVydHkpLFxuXHRcdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogaXNTb3J0YWJsZVByb3BlcnR5KHNvcnRSZXN0cmljdGlvbnNJbmZvLCBwcm9wZXJ0eSksXG5cdFx0XHRcdGZpbHRlcmFibGU6IGlzRmlsdGVyYWJsZVByb3BlcnR5KGZpbHRlclJlc3RyaWN0aW9uc0luZm8sIHByb3BlcnR5KVxuXHRcdFx0fTtcblx0XHRcdHZhbHVlSGVscFRhYmxlQ29sdW1uLm1heENvbmRpdGlvbnMgPSBnZXRQcm9wZXJ0eU1heENvbmRpdGlvbnMoZmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgdmFsdWVIZWxwVGFibGVDb2x1bW4pO1xuXHRcdFx0aWYgKGlzVHlwZUZpbHRlcmFibGUocHJvcGVydHkudHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSkge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVR5cGVDb25maWcgPSBmZXRjaFR5cGVDb25maWcocHJvcGVydHkpO1xuXHRcdFx0XHR2YWx1ZUhlbHBUYWJsZUNvbHVtbi50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcudHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHJlbGF0ZWRDb2x1bW5zLnB1c2godmFsdWVIZWxwVGFibGVDb2x1bW4pO1xuXHRcdH1cblx0fSk7XG5cdC8vIFRoZSBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHk6OicgZm9yIHVuaXF1ZW5lc3MuXG5cdC8vIFVwZGF0ZSB0aGUgc2FtZSBpbiBvdGhlciBwcm9wZXJ0eUluZm9zW10gcmVmZXJlbmNlcyB3aGljaCBwb2ludCB0byB0aGlzIHByb3BlcnR5LlxuXHRleGlzdGluZ0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0aWYgKGNvbHVtbi5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb2x1bW4ucHJvcGVydHlJbmZvcyA9IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5tYXAoKGNvbHVtbk5hbWUpID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbY29sdW1uTmFtZV0gPz8gY29sdW1uTmFtZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJlbGF0ZWRDb2x1bW5zO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIHNvcnRhYmxlIGJhc2VkIG9uIHRoZSBzb3J0IHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSBzb3J0UmVzdHJpY3Rpb25zSW5mbyBUaGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvbiBmcm9tIHRoZSByZXN0cmljdGlvbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIHNvcnRhYmxlLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNTb3J0YWJsZVByb3BlcnR5KFxuXHRzb3J0UmVzdHJpY3Rpb25zSW5mbzogU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlLFxuXHRwcm9wZXJ0eTogVmFsdWVIZWxwVGFibGVDb2x1bW4gfCBQcm9wZXJ0eVxuKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHByb3BlcnR5UGF0aCA9IGdldFBhdGgocHJvcGVydHkpO1xuXHRyZXR1cm4gcHJvcGVydHlQYXRoICYmIHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1twcm9wZXJ0eVBhdGhdXG5cdFx0PyBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlQYXRoXS5zb3J0YWJsZVxuXHRcdDogKHByb3BlcnR5IGFzIFZhbHVlSGVscFRhYmxlQ29sdW1uKS5zb3J0YWJsZSA/PyB0cnVlO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIGZpbHRlcmFibGUgYmFzZWQgb24gdGhlIHNvcnQgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIGZpbHRlclJlc3RyaWN0aW9uc0luZm8gVGhlIGZpbHRlciByZXN0cmljdGlvbiBpbmZvcm1hdGlvbiBmcm9tIHRoZSByZXN0cmljdGlvbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIGZpbHRlcmFibGUuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0ZpbHRlcmFibGVQcm9wZXJ0eShmaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksIHByb3BlcnR5OiBWYWx1ZUhlbHBUYWJsZUNvbHVtbiB8IFByb3BlcnR5KTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHByb3BlcnR5UGF0aCA9IGdldFBhdGgocHJvcGVydHkpO1xuXHRyZXR1cm4gcHJvcGVydHlQYXRoICYmIGZpbHRlclJlc3RyaWN0aW9uc0luZm8/LnByb3BlcnR5SW5mby5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eVBhdGgpXG5cdFx0PyBmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1twcm9wZXJ0eVBhdGhdLmZpbHRlcmFibGVcblx0XHQ6IChwcm9wZXJ0eSBhcyBWYWx1ZUhlbHBUYWJsZUNvbHVtbikuZmlsdGVyYWJsZSA/PyB0cnVlO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgdGhlIG1heENvbmRpdGlvbnMgZm9yIGEgZ2l2ZW4gcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGZpbHRlclJlc3RyaWN0aW9uc0luZm8gVGhlIGZpbHRlciByZXN0cmljdGlvbiBpbmZvcm1hdGlvbiBmcm9tIHRoZSByZXN0cmljdGlvbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBgLTFgIG9yIGAxYCBpZiB0aGUgcHJvcGVydHkgaXMgYSBNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbi5cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlNYXhDb25kaXRpb25zKGZpbHRlclJlc3RyaWN0aW9uc0luZm86IGFueSwgcHJvcGVydHk6IFZhbHVlSGVscFRhYmxlQ29sdW1uIHwgUHJvcGVydHkpOiBudW1iZXIge1xuXHRjb25zdCBwcm9wZXJ0eVBhdGggPSBnZXRQYXRoKHByb3BlcnR5KTtcblx0cmV0dXJuIGZpbHRlclJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvPy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eVBhdGgpICYmXG5cdFx0cHJvcGVydHlQYXRoICYmXG5cdFx0aXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1twcm9wZXJ0eVBhdGhdKVxuXHRcdD8gLTFcblx0XHQ6IDE7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIHByb3BlcnR5IHBhdGggb2YgYSBnaXZlbiBwcm9wZXJ0eSBvciBjdXN0b20gZGF0YSBmcm9tIHRoZSBWYWx1ZUhlbHAuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHkgb3IgY3VzdG9tIGRhdGEgZnJvbSB0aGUgVmFsdWVIZWxwLlxuICogQHJldHVybnMgVGhlIHByb3BlcnR5IHBhdGguXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGgocHJvcGVydHk6IFZhbHVlSGVscFRhYmxlQ29sdW1uIHwgUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQcm9wZXJ0eShwcm9wZXJ0eSkgPyBwcm9wZXJ0eS5uYW1lIDogcHJvcGVydHkucGF0aDtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSBhZGRpdGlvbmFsIHByb3BlcnR5IHdoaWNoIHJlZmVyZW5jZXMgdG8gdGhlIHVuaXQsIHRpbWV6b25lLCB0ZXh0QXJyYW5nZW1lbnQgb3IgY3VycmVuY3kuXG4gKlxuICogQHBhcmFtIGRhdGFNb2RlbFByb3BlcnR5UGF0aCBUaGUgbW9kZWwgb2JqZWN0IHBhdGggb2YgdGhlIHByb3BlcnR5LlxuICogQHJldHVybnMgVGhlIGFkZGl0aW9uYWwgcHJvcGVydHkuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBnZXRBZGRpdGlvbmFsUHJvcGVydHkoZGF0YU1vZGVsUHJvcGVydHlQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHByb3BlcnR5ID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdDtcblx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5UGF0aCA9XG5cdFx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgocHJvcGVydHkpIHx8XG5cdFx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoKHByb3BlcnR5KSB8fFxuXHRcdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoKHByb3BlcnR5KSB8fFxuXHRcdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5UGF0aChwcm9wZXJ0eSk7XG5cdGlmICghYWRkaXRpb25hbFByb3BlcnR5UGF0aCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0Y29uc3QgZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5ID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLCBhZGRpdGlvbmFsUHJvcGVydHlQYXRoKTtcblxuXHQvL0FkZGl0aW9uYWwgUHJvcGVydHkgY291bGQgcmVmZXIgdG8gYSBuYXZpZ2F0aW9uIHByb3BlcnR5LCBrZWVwIHRoZSBuYW1lIGFuZCBwYXRoIGFzIG5hdmlnYXRpb24gcHJvcGVydHlcblx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5ID0gZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5LnRhcmdldE9iamVjdDtcblx0aWYgKCFhZGRpdGlvbmFsUHJvcGVydHkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9EYXRhVGFibGVEZWxlZ2F0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1EQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxrQkFBa0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGFBQWEsQ0FBQztFQUUzREgsa0JBQWtCLENBQUNJLGVBQWUsR0FBRyxVQUFVQyxLQUFZLEVBQUU7SUFDNUQsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsU0FBUyxDQUFDRixLQUFLLENBQUM7SUFDbkMsSUFBSUcsbUJBQW1CO0lBQ3ZCLElBQUksQ0FBQ0YsS0FBSyxFQUFFO01BQ1hFLG1CQUFtQixHQUFHLElBQUlDLE9BQU8sQ0FBRUMsT0FBTyxJQUFLO1FBQzlDTCxLQUFLLENBQUNNLHdCQUF3QixDQUM3QjtVQUNDQyxRQUFRLEVBQUVGO1FBQ1gsQ0FBQyxFQUNERyxvQkFBb0IsRUFDcEIsSUFBSSxDQUNKO01BQ0YsQ0FBQyxDQUFDLENBQUNDLElBQUksQ0FBRUMsU0FBUyxJQUFLO1FBQ3RCLE9BQU8sSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQ1gsS0FBSyxFQUFFVSxTQUFTLENBQUM7TUFDbkQsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxNQUFNO01BQ05QLG1CQUFtQixHQUFHLElBQUksQ0FBQ1Esb0JBQW9CLENBQUNYLEtBQUssRUFBRUMsS0FBSyxDQUFDO0lBQzlEO0lBRUEsT0FBT0UsbUJBQW1CLENBQUNNLElBQUksQ0FBQyxVQUFVRyxVQUFlLEVBQUU7TUFDMURDLGtCQUFrQixDQUFDQyxtQkFBbUIs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