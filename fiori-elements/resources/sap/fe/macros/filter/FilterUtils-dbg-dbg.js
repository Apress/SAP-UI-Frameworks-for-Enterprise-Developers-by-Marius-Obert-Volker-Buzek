/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/ConverterContext", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/DraftEditState", "sap/ui/core/Core", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/condition/ConditionConverter", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/odata/v4/TypeUtil", "sap/ui/mdc/p13n/StateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/odata/v4/ODataUtils"], function (Log, deepClone, merge, CommonUtils, FilterBarConverter, ConverterContext, MetaModelConverter, MetaModelFunction, ModelHelper, SemanticDateOperators, DisplayModeFormatter, CommonHelper, DelegateUtil, EDITSTATE, Core, Condition, ConditionConverter, ConditionValidated, TypeUtil, StateUtil, FilterUtil, Filter, FilterOperator, ODataUtils) {
  "use strict";

  var ODATA_TYPE_MAPPING = DisplayModeFormatter.ODATA_TYPE_MAPPING;
  var getAllCustomAggregates = MetaModelFunction.getAllCustomAggregates;
  const oFilterUtils = {
    getFilter: function (vIFilter) {
      const aFilters = oFilterUtils.getFilterInfo(vIFilter).filters;
      return aFilters.length ? new Filter(oFilterUtils.getFilterInfo(vIFilter).filters, false) : undefined;
    },
    getFilterField: function (propertyPath, converterContext, entityType) {
      return FilterBarConverter.getFilterField(propertyPath, converterContext, entityType);
    },
    buildProperyInfo: function (propertyInfoField, converterContext) {
      let oPropertyInfo;
      const aTypeConfig = {};
      const propertyConvertyContext = converterContext.getConverterContextFor(propertyInfoField.annotationPath);
      const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
      const oTypeConfig = FilterBarConverter.fetchTypeConfig(propertyTargetObject);
      oPropertyInfo = FilterBarConverter.fetchPropertyInfo(converterContext, propertyInfoField, oTypeConfig);
      aTypeConfig[propertyInfoField.key] = oTypeConfig;
      oPropertyInfo = FilterBarConverter.assignDataTypeToPropertyInfo(oPropertyInfo, converterContext, [], aTypeConfig);
      return oPropertyInfo;
    },
    createConverterContext: function (oFilterControl, sEntityTypePath, metaModel, appComponent) {
      const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
        contextPath = sEntityTypePath || sFilterEntityTypePath;
      const oView = oFilterControl.isA ? CommonUtils.getTargetView(oFilterControl) : null;
      const oMetaModel = metaModel || oFilterControl.getModel().getMetaModel();
      const oAppComponent = appComponent || oView && CommonUtils.getAppComponent(oView);
      const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
      let manifestSettings;
      if (oFilterControl.isA && !oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar")) {
        manifestSettings = oView && oView.getViewData() || {};
      }
      return ConverterContext.createConverterContextForMacro(oVisualizationObjectPath.startingEntitySet.name, oMetaModel, oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getDiagnostics(), merge, oVisualizationObjectPath.contextLocation, manifestSettings);
    },
    getConvertedFilterFields: function (oFilterControl, sEntityTypePath, includeHidden, metaModel, appComponent, oModifier, lineItemTerm) {
      const oMetaModel = this._getFilterMetaModel(oFilterControl, metaModel);
      const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
        contextPath = sEntityTypePath || sFilterEntityTypePath;
      const lrTables = this._getFieldsForTable(oFilterControl, sEntityTypePath);
      const oConverterContext = this.createConverterContext(oFilterControl, sEntityTypePath, metaModel, appComponent);

      //aSelectionFields = FilterBarConverter.getSelectionFields(oConverterContext);
      return this._getSelectionFields(oFilterControl, sEntityTypePath, sFilterEntityTypePath, contextPath, lrTables, oMetaModel, oConverterContext, includeHidden, oModifier, lineItemTerm);
    },
    getBindingPathForParameters: function (oIFilter, mConditions, aFilterPropertiesMetadata, aParameters) {
      const aParams = [];
      aFilterPropertiesMetadata = oFilterUtils.setTypeConfigToProperties(aFilterPropertiesMetadata);
      // Collecting all parameter values from conditions
      for (let i = 0; i < aParameters.length; i++) {
        const sFieldPath = aParameters[i];
        if (mConditions[sFieldPath] && mConditions[sFieldPath].length > 0) {
          // We would be using only the first condition for parameter value.
          const oConditionInternal = merge({}, mConditions[sFieldPath][0]);
          const oProperty = FilterUtil.getPropertyByKey(aFilterPropertiesMetadata, sFieldPath);
          const oTypeConfig = oProperty.typeConfig || TypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
          const mInternalParameterCondition = ConditionConverter.toType(oConditionInternal, oTypeConfig, oIFilter.getTypeUtil());
          const sEdmType = ODATA_TYPE_MAPPING[oTypeConfig.className];
          aParams.push(`${sFieldPath}=${encodeURIComponent(ODataUtils.formatLiteral(mInternalParameterCondition.values[0], sEdmType))}`);
        }
      }

      // Binding path from EntityType
      const sEntityTypePath = oIFilter.data("entityType");
      const sEntitySetPath = sEntityTypePath.substring(0, sEntityTypePath.length - 1);
      const sParameterEntitySet = sEntitySetPath.slice(0, sEntitySetPath.lastIndexOf("/"));
      const sTargetNavigation = sEntitySetPath.substring(sEntitySetPath.lastIndexOf("/") + 1);
      // create parameter context
      return `${sParameterEntitySet}(${aParams.toString()})/${sTargetNavigation}`;
    },
    getEditStateIsHideDraft: function (mConditions) {
      let bIsHideDraft = false;
      if (mConditions && mConditions.$editState) {
        const oCondition = mConditions.$editState.find(function (condition) {
          return condition.operator === "DRAFT_EDIT_STATE";
        });
        if (oCondition && (oCondition.values.includes("ALL_HIDING_DRAFTS") || oCondition.values.includes("SAVED_ONLY"))) {
          bIsHideDraft = true;
        }
      }
      return bIsHideDraft;
    },
    /**
     * Gets all filters that originate from the MDC FilterBar.
     *
     * @param vIFilter String or object instance related to
     *  - MDC_FilterBar/Table/Chart
     * @param mProperties Properties on filters that are to be retrieved. Available parameters:
     * 	 - ignoredProperties: Array of property names which should be not considered for filtering
     *	 - propertiesMetadata: Array with all the property metadata. If not provided, properties will be retrieved from vIFilter.
     *	 - targetControl: MDC_table or chart. If provided, property names which are not relevant for the target control entitySet are not considered.
     * @param mFilterConditions Map with externalized filter conditions.
     * @returns FilterBar filters and basic search
     * @private
     * @ui5-restricted
     */
    getFilterInfo: function (vIFilter, mProperties, mFilterConditions) {
      let aIgnoreProperties = mProperties && mProperties.ignoredProperties || [];
      const oTargetControl = mProperties && mProperties.targetControl,
        sTargetEntityPath = oTargetControl ? oTargetControl.data("entityType") : undefined;
      const mParameters = {};
      let oIFilter = vIFilter,
        sSearch,
        aFilters = [],
        sBindingPath,
        aPropertiesMetadata = mProperties && mProperties.propertiesMetadata;
      if (typeof vIFilter === "string") {
        oIFilter = Core.byId(vIFilter);
      }
      if (oIFilter) {
        sSearch = this._getSearchField(oIFilter, aIgnoreProperties);
        const mConditions = this._getFilterConditions(mProperties, mFilterConditions, oIFilter);
        let aFilterPropertiesMetadata = oIFilter.getPropertyInfoSet ? oIFilter.getPropertyInfoSet() : null;
        aFilterPropertiesMetadata = this._getFilterPropertiesMetadata(aFilterPropertiesMetadata, oIFilter);
        if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
          Object.keys(mConditions).forEach(function (sKey) {
            if (sKey === "$editState") {
              delete mConditions["$editState"];
            }
          });
        }
        let aParameters = oIFilter.data("parameters") || [];
        aParameters = typeof aParameters === "string" ? JSON.parse(aParameters) : aParameters;
        if (aParameters && aParameters.length > 0) {
          // Binding path changes in case of parameters.
          sBindingPath = oFilterUtils.getBindingPathForParameters(oIFilter, mConditions, aFilterPropertiesMetadata, aParameters);
          if (Object.keys(mConditions).length) {
            Object.keys(mConditions).forEach(param => {
              aParameters.forEach(requiredParam => {
                if (param === requiredParam) {
                  const mParametersValue = mConditions[param][0].values;
                  mParameters[requiredParam] = mParametersValue[0];
                }
              });
            });
          }
        }
        if (mConditions) {
          //Exclude Interface Filter properties that are not relevant for the Target control entitySet
          if (sTargetEntityPath && oIFilter.data("entityType") !== sTargetEntityPath) {
            const oMetaModel = oIFilter.getModel().getMetaModel();
            const aTargetPropertiesMetadata = oIFilter.getControlDelegate().fetchPropertiesForEntity(sTargetEntityPath, oMetaModel, oIFilter);
            aPropertiesMetadata = aTargetPropertiesMetadata;
            const mEntityProperties = {};
            for (const i in aTargetPropertiesMetadata) {
              const oEntityProperty = aTargetPropertiesMetadata[i];
              mEntityProperties[oEntityProperty.name] = {
                hasProperty: true,
                dataType: oEntityProperty.dataType
              };
            }
            const _aIgnoreProperties = this._getIgnoredProperties(aFilterPropertiesMetadata, mEntityProperties);
            if (_aIgnoreProperties.length > 0) {
              aIgnoreProperties = aIgnoreProperties.concat(_aIgnoreProperties);
            }
          } else if (!aPropertiesMetadata) {
            aPropertiesMetadata = aFilterPropertiesMetadata;
          }
          // var aParamKeys = [];
          // aParameters.forEach(function (oParam) {
          // 	aParamKeys.push(oParam.key);
          // });
          const oFilter = FilterUtil.getFilterInfo(oIFilter, mConditions, oFilterUtils.setTypeConfigToProperties(aPropertiesMetadata), aIgnoreProperties.concat(aParameters)).filters;
          aFilters = oFilter ? [oFilter] : [];
        }
      }
      return {
        parameters: mParameters,
        filters: aFilters,
        search: sSearch || undefined,
        bindingPath: sBindingPath
      };
    },
    setTypeConfigToProperties: function (aProperties) {
      if (aProperties && aProperties.length) {
        aProperties.forEach(function (oIFilterProperty) {
          if (oIFilterProperty.typeConfig && oIFilterProperty.typeConfig.typeInstance && oIFilterProperty.typeConfig.typeInstance.getConstraints instanceof Function) {
            return;
          }
          if (oIFilterProperty.path === "$editState") {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
          } else if (oIFilterProperty.path === "$search") {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
          } else if (oIFilterProperty.dataType || oIFilterProperty.typeConfig && oIFilterProperty.typeConfig.className) {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig(oIFilterProperty.dataType || oIFilterProperty.typeConfig.className, oIFilterProperty.formatOptions, oIFilterProperty.constraints);
          }
        });
      }
      return aProperties;
    },
    getNotApplicableFilters: function (oFilterBar, oControl) {
      var _oControl$control;
      const sTargetEntityTypePath = oControl.data("entityType"),
        oFilterBarEntityPath = oFilterBar.data("entityType"),
        oFilterBarEntitySetAnnotations = oFilterBar.getModel().getMetaModel().getObject(oFilterBarEntityPath),
        aNotApplicable = [],
        mConditions = oFilterBar.getConditions(),
        oMetaModel = oFilterBar.getModel().getMetaModel(),
        bIsFilterBarEntityType = sTargetEntityTypePath === oFilterBar.data("entityType"),
        bIsChart = oControl.isA("sap.ui.mdc.Chart"),
        bIsAnalyticalTable = !bIsChart && oControl.getParent().getTableDefinition().enableAnalytics,
        bIsTreeTable = !bIsChart && ((_oControl$control = oControl.control) === null || _oControl$control === void 0 ? void 0 : _oControl$control.type) === "TreeTable",
        bEnableSearch = bIsChart ? CommonHelper.parseCustomData(DelegateUtil.getCustomData(oControl, "applySupported")).enableSearch : !(bIsAnalyticalTable || bIsTreeTable) || oControl.getParent().getTableDefinition().enableBasicSearch;
      if (mConditions && (!bIsFilterBarEntityType || bIsAnalyticalTable || bIsChart)) {
        // We don't need to calculate the difference on property Level if entity sets are identical
        const aTargetProperties = bIsFilterBarEntityType ? [] : oFilterBar.getControlDelegate().fetchPropertiesForEntity(sTargetEntityTypePath, oMetaModel, oFilterBar),
          mTargetProperties = aTargetProperties.reduce(function (mProp, oProp) {
            mProp[oProp.name] = oProp;
            return mProp;
          }, {}),
          mTableAggregates = !bIsChart && oControl.getParent().getTableDefinition().aggregates || {},
          mAggregatedProperties = {};
        Object.keys(mTableAggregates).forEach(function (sAggregateName) {
          const oAggregate = mTableAggregates[sAggregateName];
          mAggregatedProperties[oAggregate.relativePath] = oAggregate;
        });
        const chartEntityTypeAnnotations = oControl.getModel().getMetaModel().getObject(oControl.data("targetCollectionPath") + "/");
        if (oControl.isA("sap.ui.mdc.Chart")) {
          const oEntitySetAnnotations = oControl.getModel().getMetaModel().getObject(`${oControl.data("targetCollectionPath")}@`),
            mChartCustomAggregates = getAllCustomAggregates(oEntitySetAnnotations);
          Object.keys(mChartCustomAggregates).forEach(function (sAggregateName) {
            if (!mAggregatedProperties[sAggregateName]) {
              const oAggregate = mChartCustomAggregates[sAggregateName];
              mAggregatedProperties[sAggregateName] = oAggregate;
            }
          });
        }
        for (const sProperty in mConditions) {
          // Need to check the length of mConditions[sProperty] since previous filtered properties are kept into mConditions with empty array as definition
          const aConditionProperty = mConditions[sProperty];
          let typeCheck = true;
          if (chartEntityTypeAnnotations[sProperty] && oFilterBarEntitySetAnnotations[sProperty]) {
            typeCheck = chartEntityTypeAnnotations[sProperty]["$Type"] === oFilterBarEntitySetAnnotations[sProperty]["$Type"];
          }
          if (Array.isArray(aConditionProperty) && aConditionProperty.length > 0 && ((!mTargetProperties[sProperty] || mTargetProperties[sProperty] && !typeCheck) && (!bIsFilterBarEntityType || sProperty === "$editState" && bIsChart) || mAggregatedProperties[sProperty])) {
            aNotApplicable.push(sProperty.replace(/\+|\*/g, ""));
          }
        }
      }
      if (!bEnableSearch && oFilterBar.getSearch()) {
        aNotApplicable.push("$search");
      }
      return aNotApplicable;
    },
    /**
     * Gets the value list information of a property as defined for a given filter bar.
     *
     * @param filterBar The filter bar to get the value list information for
     * @param propertyName The property to get the value list information for
     * @returns The value list information
     */
    async _getValueListInfo(filterBar, propertyName) {
      var _filterBar$getModel;
      const metaModel = (_filterBar$getModel = filterBar.getModel()) === null || _filterBar$getModel === void 0 ? void 0 : _filterBar$getModel.getMetaModel();
      if (!metaModel) {
        return undefined;
      }
      const entityType = filterBar.data("entityType") ?? "";
      const valueListInfos = await metaModel.requestValueListInfo(entityType + propertyName, true, undefined).catch(() => null);
      return valueListInfos === null || valueListInfos === void 0 ? void 0 : valueListInfos[""];
    },
    /**
     * Gets the {@link ConditionValidated} state for a single value. This decides whether the value is treated as a selected value
     * in a value help, meaning that its description is loaded and displayed if existing, or whether it is displayed as a
     * condition (e.g. "=1").
     *
     * Values for properties without value list info are always treated as {@link ConditionValidated.NotValidated}.
     *
     * @param valueListInfo The value list info from the {@link MetaModel}
     * @param conditionPath Path to the property to set the value as condition for
     * @param value The single value to get the state for
     */
    _getConditionValidated: async function (valueListInfo, conditionPath, value) {
      if (!valueListInfo) {
        return ConditionValidated.NotValidated;
      }
      const filter = new Filter({
        path: conditionPath,
        operator: FilterOperator.EQ,
        value1: value
      });
      const listBinding = valueListInfo.$model.bindList(`/${valueListInfo.CollectionPath}`, undefined, undefined, filter, {
        $select: conditionPath
      });
      const valueExists = (await listBinding.requestContexts()).length > 0;
      if (valueExists) {
        return ConditionValidated.Validated;
      } else {
        return ConditionValidated.NotValidated;
      }
    },
    /**
     * Clears all input values of visible filter fields in the filter bar.
     *
     * @param oFilterBar The filter bar that contains the filter field
     */
    clearFilterValues: async function (oFilterBar) {
      var _state$filter$editSta;
      // Do nothing when the filter bar is hidden
      if (!oFilterBar) {
        return;
      }
      const state = await StateUtil.retrieveExternalState(oFilterBar);
      const editStatePath = "$editState";
      const editStateDefaultValue = EDITSTATE.ALL.id;
      const currentEditStateCondition = deepClone((_state$filter$editSta = state.filter[editStatePath]) === null || _state$filter$editSta === void 0 ? void 0 : _state$filter$editSta[0]);
      const currentEditStateIsDefault = (currentEditStateCondition === null || currentEditStateCondition === void 0 ? void 0 : currentEditStateCondition.values[0]) === editStateDefaultValue;

      // Clear all conditions
      for (const conditionPath of Object.keys(state.filter)) {
        if (conditionPath === editStatePath && currentEditStateIsDefault) {
          // Do not clear edit state condition if it is already "ALL"
          continue;
        }
        for (const condition of state.filter[conditionPath]) {
          condition.filtered = false;
        }
      }
      await StateUtil.applyExternalState(oFilterBar, {
        filter: state.filter
      });

      // Set edit state to 'ALL' if it wasn't before
      if (currentEditStateCondition && !currentEditStateIsDefault) {
        currentEditStateCondition.values = [editStateDefaultValue];
        await StateUtil.applyExternalState(oFilterBar, {
          filter: {
            [editStatePath]: [currentEditStateCondition]
          }
        });
      }

      // Allow app developers to update filters after clearing
      oFilterBar.getParent().fireAfterClear();
    },
    /**
     * Clear the filter value for a specific property in the filter bar.
     * This is a prerequisite before new values can be set cleanly.
     *
     * @param filterBar The filter bar that contains the filter field
     * @param conditionPath The path to the property as a condition path
     */
    async _clearFilterValue(filterBar, conditionPath) {
      const oState = await StateUtil.retrieveExternalState(filterBar);
      if (oState.filter[conditionPath]) {
        oState.filter[conditionPath].forEach(oCondition => {
          oCondition.filtered = false;
        });
        await StateUtil.applyExternalState(filterBar, {
          filter: {
            [conditionPath]: oState.filter[conditionPath]
          }
        });
      }
    },
    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param oFilterBar The filter bar that contains the filter field
     * @param sConditionPath The path to the property as a condition path
     * @param args List of optional parameters
     *  [sOperator] The operator to be used - if not set, the default operator (EQ) will be used
     *  [vValues] The values to be applied - if sOperator is missing, vValues is used as 3rd parameter
     */
    setFilterValues: async function (oFilterBar, sConditionPath) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      let sOperator = args === null || args === void 0 ? void 0 : args[0];
      let vValues = args === null || args === void 0 ? void 0 : args[1];

      // Do nothing when the filter bar is hidden
      if (!oFilterBar) {
        return;
      }

      // common filter Operators need a value. Do nothing if this value is undefined
      // BCP: 2270135274
      if (args.length === 2 && (vValues === undefined || vValues === null || vValues === "") && sOperator && Object.keys(FilterOperator).indexOf(sOperator) !== -1) {
        Log.warning(`An empty filter value cannot be applied with the ${sOperator} operator`);
        return;
      }

      // The 4th parameter is optional; if sOperator is missing, vValues is used as 3rd parameter
      // This does not apply for semantic dates, as these do not require vValues (exception: "LASTDAYS", 3)
      if (vValues === undefined && !SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
        vValues = sOperator ?? [];
        sOperator = undefined;
      }

      // If sOperator is not set, use EQ as default
      if (!sOperator) {
        sOperator = FilterOperator.EQ;
      }

      // Supported array types:
      //  - Single Values:	"2" | ["2"]
      //  - Multiple Values:	["2", "3"]
      //  - Ranges:			["2","3"]
      // Unsupported array types:
      //  - Multiple Ranges:	[["2","3"]] | [["2","3"],["4","5"]]
      const supportedValueTypes = ["string", "number", "boolean"];
      if (vValues !== undefined && (!Array.isArray(vValues) && !supportedValueTypes.includes(typeof vValues) || Array.isArray(vValues) && vValues.length > 0 && !supportedValueTypes.includes(typeof vValues[0]))) {
        throw new Error("FilterUtils.js#_setFilterValues: Filter value not supported; only primitive values or an array thereof can be used.");
      }
      let values;
      if (vValues !== undefined) {
        values = Array.isArray(vValues) ? vValues : [vValues];
      }

      // Get the value list info of the property to later check whether the values exist
      const valueListInfo = await this._getValueListInfo(oFilterBar, sConditionPath);
      const filter = {};
      if (sConditionPath) {
        if (values && values.length) {
          if (sOperator === FilterOperator.BT) {
            // The operator BT requires one condition with both thresholds
            filter[sConditionPath] = [Condition.createCondition(sOperator, values, null, null, ConditionValidated.NotValidated)];
          } else {
            // Regular single and multi value conditions, if there are no values, we do not want any conditions
            filter[sConditionPath] = await Promise.all(values.map(async value => {
              // For the EQ case, tell MDC to validate the value (e.g. display the description), if it exists in the associated entity, otherwise never validate
              const conditionValidatedStatus = sOperator === FilterOperator.EQ ? await this._getConditionValidated(valueListInfo, sConditionPath, value) : ConditionValidated.NotValidated;
              return Condition.createCondition(sOperator, [value], null, null, conditionValidatedStatus);
            }));
          }
        } else if (SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
          // vValues is undefined, so the operator is a semantic date that does not need values (see above)
          filter[sConditionPath] = [Condition.createCondition(sOperator, [], null, null, ConditionValidated.NotValidated)];
        }
      }

      // Always clear the current value as we do not want to add filter values but replace them
      await this._clearFilterValue(oFilterBar, sConditionPath);
      if (filter[sConditionPath]) {
        // This is not called in the reset case, i.e. setFilterValue("Property")
        await StateUtil.applyExternalState(oFilterBar, {
          filter
        });
      }
    },
    conditionToModelPath: function (sConditionPath) {
      // make the path usable as model property, therefore slashes become backslashes
      return sConditionPath.replace(/\//g, "\\");
    },
    _getFilterMetaModel: function (oFilterControl, metaModel) {
      return metaModel || oFilterControl.getModel().getMetaModel();
    },
    _getEntitySetPath: function (sEntityTypePath) {
      return sEntityTypePath && ModelHelper.getEntitySetPath(sEntityTypePath);
    },
    _getFieldsForTable: function (oFilterControl, sEntityTypePath) {
      const lrTables = [];
      /**
       * Gets fields from
       * 	- direct entity properties,
       * 	- navigateProperties key in the manifest if these properties are known by the entity
       *  - annotation "SelectionFields"
       */
      if (sEntityTypePath) {
        const oView = CommonUtils.getTargetView(oFilterControl);
        const tableControls = oView && oView.getController() && oView.getController()._getControls && oView.getController()._getControls("table"); //[0].getParent().getTableDefinition();
        if (tableControls) {
          tableControls.forEach(function (oTable) {
            lrTables.push(oTable.getParent().getTableDefinition());
          });
        }
        return lrTables;
      }
      return [];
    },
    _getSelectionFields: function (oFilterControl, sEntityTypePath, sFilterEntityTypePath, contextPath, lrTables, oMetaModel, oConverterContext, includeHidden, oModifier, lineItemTerm) {
      let aSelectionFields = FilterBarConverter.getSelectionFields(oConverterContext, lrTables, undefined, includeHidden, lineItemTerm).selectionFields;
      if ((oModifier ? oModifier.getControlType(oFilterControl) === "sap.ui.mdc.FilterBar" : oFilterControl.isA("sap.ui.mdc.FilterBar")) && sEntityTypePath !== sFilterEntityTypePath) {
        /**
         * We are on multi entity sets scenario so we add annotation "SelectionFields"
         * from FilterBar entity if these properties are known by the entity
         */
        const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
        const oPageContext = oConverterContext.getConverterContextFor(sFilterEntityTypePath);
        const aFilterBarSelectionFieldsAnnotation = oPageContext.getEntityTypeAnnotation("@com.sap.vocabularies.UI.v1.SelectionFields").annotation || [];
        const mapSelectionFields = {};
        aSelectionFields.forEach(function (oSelectionField) {
          mapSelectionFields[oSelectionField.conditionPath] = true;
        });
        aFilterBarSelectionFieldsAnnotation.forEach(function (oFilterBarSelectionFieldAnnotation) {
          const sPath = oFilterBarSelectionFieldAnnotation.value;
          if (!mapSelectionFields[sPath]) {
            const oFilterField = FilterBarConverter.getFilterField(sPath, oConverterContext, oVisualizationObjectPath.startingEntitySet.entityType);
            if (oFilterField) {
              aSelectionFields.push(oFilterField);
            }
          }
        });
      }
      if (aSelectionFields) {
        const fieldNames = [];
        aSelectionFields.forEach(function (oField) {
          fieldNames.push(oField.key);
        });
        aSelectionFields = this._getSelectionFieldsFromPropertyInfos(oFilterControl, fieldNames, aSelectionFields);
      }
      return aSelectionFields;
    },
    _getSelectionFieldsFromPropertyInfos: function (oFilterControl, fieldNames, aSelectionFields) {
      const propertyInfoFields = oFilterControl.getPropertyInfo && oFilterControl.getPropertyInfo() || [];
      propertyInfoFields.forEach(function (oProp) {
        if (oProp.name === "$search" || oProp.name === "$editState") {
          return;
        }
        const selField = aSelectionFields[fieldNames.indexOf(oProp.key)];
        if (fieldNames.indexOf(oProp.key) !== -1 && selField.annotationPath) {
          oProp.group = selField.group;
          oProp.groupLabel = selField.groupLabel;
          oProp.settings = selField.settings;
          oProp.visualFilter = selField.visualFilter;
          oProp.label = selField.label;
          aSelectionFields[fieldNames.indexOf(oProp.key)] = oProp;
        }
        if (fieldNames.indexOf(oProp.key) === -1 && !oProp.annotationPath) {
          aSelectionFields.push(oProp);
        }
      });
      return aSelectionFields;
    },
    _getSearchField: function (oIFilter, aIgnoreProperties) {
      return oIFilter.getSearch && aIgnoreProperties.indexOf("search") === -1 ? oIFilter.getSearch() : null;
    },
    _getFilterConditions: function (mProperties, mFilterConditions, oIFilter) {
      const mConditions = mFilterConditions || oIFilter.getConditions();
      if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
        Object.keys(mConditions).forEach(function (sKey) {
          if (sKey === "$editState") {
            delete mConditions["$editState"];
          }
        });
      }
      return mConditions;
    },
    _getFilterPropertiesMetadata: function (aFilterPropertiesMetadata, oIFilter) {
      if (!(aFilterPropertiesMetadata && aFilterPropertiesMetadata.length)) {
        if (oIFilter.getPropertyInfo) {
          aFilterPropertiesMetadata = oIFilter.getPropertyInfo();
        } else {
          aFilterPropertiesMetadata = null;
        }
      }
      return aFilterPropertiesMetadata;
    },
    _getIgnoredProperties: function (aFilterPropertiesMetadata, mEntityProperties) {
      const aIgnoreProperties = [];
      aFilterPropertiesMetadata.forEach(function (oIFilterProperty) {
        const sIFilterPropertyName = oIFilterProperty.name;
        const mEntityPropertiesCurrent = mEntityProperties[sIFilterPropertyName];
        if (mEntityPropertiesCurrent && (!mEntityPropertiesCurrent["hasProperty"] || mEntityPropertiesCurrent["hasProperty"] && oIFilterProperty.dataType !== mEntityPropertiesCurrent.dataType)) {
          aIgnoreProperties.push(sIFilterPropertyName);
        }
      });
      return aIgnoreProperties;
    },
    getFilters: function (filterBar) {
      const {
        parameters,
        filters,
        search
      } = this.getFilterInfo(filterBar);
      return {
        parameters,
        filters,
        search
      };
    }
  };
  return oFilterUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXIiLCJ2SUZpbHRlciIsImFGaWx0ZXJzIiwiZ2V0RmlsdGVySW5mbyIsImZpbHRlcnMiLCJsZW5ndGgiLCJGaWx0ZXIiLCJ1bmRlZmluZWQiLCJnZXRGaWx0ZXJGaWVsZCIsInByb3BlcnR5UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJlbnRpdHlUeXBlIiwiRmlsdGVyQmFyQ29udmVydGVyIiwiYnVpbGRQcm9wZXJ5SW5mbyIsInByb3BlcnR5SW5mb0ZpZWxkIiwib1Byb3BlcnR5SW5mbyIsImFUeXBlQ29uZmlnIiwicHJvcGVydHlDb252ZXJ0eUNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiYW5ub3RhdGlvblBhdGgiLCJwcm9wZXJ0eVRhcmdldE9iamVjdCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0YXJnZXRPYmplY3QiLCJvVHlwZUNvbmZpZyIsImZldGNoVHlwZUNvbmZpZyIsImZldGNoUHJvcGVydHlJbmZvIiwia2V5IiwiYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHQiLCJvRmlsdGVyQ29udHJvbCIsInNFbnRpdHlUeXBlUGF0aCIsIm1ldGFNb2RlbCIsImFwcENvbXBvbmVudCIsInNGaWx0ZXJFbnRpdHlUeXBlUGF0aCIsIkRlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJjb250ZXh0UGF0aCIsIm9WaWV3IiwiaXNBIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibWFuaWZlc3RTZXR0aW5ncyIsImdldFZpZXdEYXRhIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmFtZSIsImdldERpYWdub3N0aWNzIiwibWVyZ2UiLCJjb250ZXh0TG9jYXRpb24iLCJnZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMiLCJpbmNsdWRlSGlkZGVuIiwib01vZGlmaWVyIiwibGluZUl0ZW1UZXJtIiwiX2dldEZpbHRlck1ldGFNb2RlbCIsImxyVGFibGVzIiwiX2dldEZpZWxkc0ZvclRhYmxlIiwib0NvbnZlcnRlckNvbnRleHQiLCJfZ2V0U2VsZWN0aW9uRmllbGRzIiwiZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzIiwib0lGaWx0ZXIiLCJtQ29uZGl0aW9ucyIsImFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEiLCJhUGFyYW1ldGVycyIsImFQYXJhbXMiLCJzZXRUeXBlQ29uZmlnVG9Qcm9wZXJ0aWVzIiwiaSIsInNGaWVsZFBhdGgiLCJvQ29uZGl0aW9uSW50ZXJuYWwiLCJvUHJvcGVydHkiLCJGaWx0ZXJVdGlsIiwiZ2V0UHJvcGVydHlCeUtleSIsInR5cGVDb25maWciLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJkYXRhVHlwZSIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsIm1JbnRlcm5hbFBhcmFtZXRlckNvbmRpdGlvbiIsIkNvbmRpdGlvbkNvbnZlcnRlciIsInRvVHlwZSIsImdldFR5cGVVdGlsIiwic0VkbVR5cGUiLCJPREFUQV9UWVBFX01BUFBJTkciLCJjbGFzc05hbWUiLCJwdXNoIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiT0RhdGFVdGlscyIsImZvcm1hdExpdGVyYWwiLCJ2YWx1ZXMiLCJkYXRhIiwic0VudGl0eVNldFBhdGgiLCJzdWJzdHJpbmciLCJzUGFyYW1ldGVyRW50aXR5U2V0Iiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsInNUYXJnZXROYXZpZ2F0aW9uIiwidG9TdHJpbmciLCJnZXRFZGl0U3RhdGVJc0hpZGVEcmFmdCIsImJJc0hpZGVEcmFmdCIsIiRlZGl0U3RhdGUiLCJvQ29uZGl0aW9uIiwiZmluZCIsImNvbmRpdGlvbiIsIm9wZXJhdG9yIiwiaW5jbHVkZXMiLCJtUHJvcGVydGllcyIsIm1GaWx0ZXJDb25kaXRpb25zIiwiYUlnbm9yZVByb3BlcnRpZXMiLCJpZ25vcmVkUHJvcGVydGllcyIsIm9UYXJnZXRDb250cm9sIiwidGFyZ2V0Q29udHJvbCIsInNUYXJnZXRFbnRpdHlQYXRoIiwibVBhcmFtZXRlcnMiLCJzU2VhcmNoIiwic0JpbmRpbmdQYXRoIiwiYVByb3BlcnRpZXNNZXRhZGF0YSIsInByb3BlcnRpZXNNZXRhZGF0YSIsIkNvcmUiLCJieUlkIiwiX2dldFNlYXJjaEZpZWxkIiwiX2dldEZpbHRlckNvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJfZ2V0RmlsdGVyUHJvcGVydGllc01ldGFkYXRhIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5IiwiSlNPTiIsInBhcnNlIiwicGFyYW0iLCJyZXF1aXJlZFBhcmFtIiwibVBhcmFtZXRlcnNWYWx1ZSIsImFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGEiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJmZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJtRW50aXR5UHJvcGVydGllcyIsIm9FbnRpdHlQcm9wZXJ0eSIsImhhc1Byb3BlcnR5IiwiX2FJZ25vcmVQcm9wZXJ0aWVzIiwiX2dldElnbm9yZWRQcm9wZXJ0aWVzIiwiY29uY2F0Iiwib0ZpbHRlciIsInBhcmFtZXRlcnMiLCJzZWFyY2giLCJiaW5kaW5nUGF0aCIsImFQcm9wZXJ0aWVzIiwib0lGaWx0ZXJQcm9wZXJ0eSIsInR5cGVJbnN0YW5jZSIsImdldENvbnN0cmFpbnRzIiwiRnVuY3Rpb24iLCJwYXRoIiwiZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMiLCJvRmlsdGVyQmFyIiwib0NvbnRyb2wiLCJzVGFyZ2V0RW50aXR5VHlwZVBhdGgiLCJvRmlsdGVyQmFyRW50aXR5UGF0aCIsIm9GaWx0ZXJCYXJFbnRpdHlTZXRBbm5vdGF0aW9ucyIsImdldE9iamVjdCIsImFOb3RBcHBsaWNhYmxlIiwiZ2V0Q29uZGl0aW9ucyIsImJJc0ZpbHRlckJhckVudGl0eVR5cGUiLCJiSXNDaGFydCIsImJJc0FuYWx5dGljYWxUYWJsZSIsImdldFBhcmVudCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImVuYWJsZUFuYWx5dGljcyIsImJJc1RyZWVUYWJsZSIsImNvbnRyb2wiLCJ0eXBlIiwiYkVuYWJsZVNlYXJjaCIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsImVuYWJsZVNlYXJjaCIsImVuYWJsZUJhc2ljU2VhcmNoIiwiYVRhcmdldFByb3BlcnRpZXMiLCJtVGFyZ2V0UHJvcGVydGllcyIsInJlZHVjZSIsIm1Qcm9wIiwib1Byb3AiLCJtVGFibGVBZ2dyZWdhdGVzIiwiYWdncmVnYXRlcyIsIm1BZ2dyZWdhdGVkUHJvcGVydGllcyIsInNBZ2dyZWdhdGVOYW1lIiwib0FnZ3JlZ2F0ZSIsInJlbGF0aXZlUGF0aCIsImNoYXJ0RW50aXR5VHlwZUFubm90YXRpb25zIiwib0VudGl0eVNldEFubm90YXRpb25zIiwibUNoYXJ0Q3VzdG9tQWdncmVnYXRlcyIsImdldEFsbEN1c3RvbUFnZ3JlZ2F0ZXMiLCJzUHJvcGVydHkiLCJhQ29uZGl0aW9uUHJvcGVydHkiLCJ0eXBlQ2hlY2siLCJBcnJheSIsImlzQXJyYXkiLCJyZXBsYWNlIiwiZ2V0U2VhcmNoIiwiX2dldFZhbHVlTGlzdEluZm8iLCJmaWx0ZXJCYXIiLCJwcm9wZXJ0eU5hbWUiLCJ2YWx1ZUxpc3RJbmZvcyIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwiY2F0Y2giLCJfZ2V0Q29uZGl0aW9uVmFsaWRhdGVkIiwidmFsdWVMaXN0SW5mbyIsImNvbmRpdGlvblBhdGgiLCJ2YWx1ZSIsIkNvbmRpdGlvblZhbGlkYXRlZCIsIk5vdFZhbGlkYXRlZCIsImZpbHRlciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJ2YWx1ZTEiLCJsaXN0QmluZGluZyIsIiRtb2RlbCIsImJpbmRMaXN0IiwiQ29sbGVjdGlvblBhdGgiLCIkc2VsZWN0IiwidmFsdWVFeGlzdHMiLCJyZXF1ZXN0Q29udGV4dHMiLCJWYWxpZGF0ZWQiLCJjbGVhckZpbHRlclZhbHVlcyIsInN0YXRlIiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwiZWRpdFN0YXRlUGF0aCIsImVkaXRTdGF0ZURlZmF1bHRWYWx1ZSIsIkVESVRTVEFURSIsIkFMTCIsImlkIiwiY3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbiIsImRlZXBDbG9uZSIsImN1cnJlbnRFZGl0U3RhdGVJc0RlZmF1bHQiLCJmaWx0ZXJlZCIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsImZpcmVBZnRlckNsZWFyIiwiX2NsZWFyRmlsdGVyVmFsdWUiLCJvU3RhdGUiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsImFyZ3MiLCJzT3BlcmF0b3IiLCJ2VmFsdWVzIiwiaW5kZXhPZiIsIkxvZyIsIndhcm5pbmciLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zIiwic3VwcG9ydGVkVmFsdWVUeXBlcyIsIkVycm9yIiwiQlQiLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiY29uZGl0aW9uVmFsaWRhdGVkU3RhdHVzIiwiY29uZGl0aW9uVG9Nb2RlbFBhdGgiLCJfZ2V0RW50aXR5U2V0UGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0RW50aXR5U2V0UGF0aCIsInRhYmxlQ29udHJvbHMiLCJnZXRDb250cm9sbGVyIiwiX2dldENvbnRyb2xzIiwib1RhYmxlIiwiYVNlbGVjdGlvbkZpZWxkcyIsImdldFNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbkZpZWxkcyIsImdldENvbnRyb2xUeXBlIiwib1BhZ2VDb250ZXh0IiwiYUZpbHRlckJhclNlbGVjdGlvbkZpZWxkc0Fubm90YXRpb24iLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsImFubm90YXRpb24iLCJtYXBTZWxlY3Rpb25GaWVsZHMiLCJvU2VsZWN0aW9uRmllbGQiLCJvRmlsdGVyQmFyU2VsZWN0aW9uRmllbGRBbm5vdGF0aW9uIiwic1BhdGgiLCJvRmlsdGVyRmllbGQiLCJmaWVsZE5hbWVzIiwib0ZpZWxkIiwiX2dldFNlbGVjdGlvbkZpZWxkc0Zyb21Qcm9wZXJ0eUluZm9zIiwicHJvcGVydHlJbmZvRmllbGRzIiwiZ2V0UHJvcGVydHlJbmZvIiwic2VsRmllbGQiLCJncm91cCIsImdyb3VwTGFiZWwiLCJzZXR0aW5ncyIsInZpc3VhbEZpbHRlciIsImxhYmVsIiwic0lGaWx0ZXJQcm9wZXJ0eU5hbWUiLCJtRW50aXR5UHJvcGVydGllc0N1cnJlbnQiLCJnZXRGaWx0ZXJzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnRpdHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0ICogYXMgRmlsdGVyQmFyQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBCYXNlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGdldEFsbEN1c3RvbUFnZ3JlZ2F0ZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuaW1wb3J0IHsgT0RBVEFfVFlQRV9NQVBQSU5HIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEVESVRTVEFURSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRHJhZnRFZGl0U3RhdGVcIjtcbmltcG9ydCB7IEV4dGVybmFsU3RhdGVUeXBlIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvdmFsdWVoZWxwL1ZhbHVlSGVscERlbGVnYXRlXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgQ29uZGl0aW9uQ29udmVydGVyIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25Db252ZXJ0ZXJcIjtcbmltcG9ydCBDb25kaXRpb25WYWxpZGF0ZWQgZnJvbSBcInNhcC91aS9tZGMvZW51bS9Db25kaXRpb25WYWxpZGF0ZWRcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVHlwZVV0aWxcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3V0aWwvRmlsdGVyVXRpbFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9NZXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFVdGlscyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhVXRpbHNcIjtcblxuY29uc3Qgb0ZpbHRlclV0aWxzID0ge1xuXHRnZXRGaWx0ZXI6IGZ1bmN0aW9uICh2SUZpbHRlcjogYW55KSB7XG5cdFx0Y29uc3QgYUZpbHRlcnMgPSBvRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyh2SUZpbHRlcikuZmlsdGVycztcblx0XHRyZXR1cm4gYUZpbHRlcnMubGVuZ3RoID8gbmV3IEZpbHRlcihvRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyh2SUZpbHRlcikuZmlsdGVycywgZmFsc2UpIDogdW5kZWZpbmVkO1xuXHR9LFxuXHRnZXRGaWx0ZXJGaWVsZDogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKSB7XG5cdFx0cmV0dXJuIEZpbHRlckJhckNvbnZlcnRlci5nZXRGaWx0ZXJGaWVsZChwcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xuXHR9LFxuXHRidWlsZFByb3BlcnlJbmZvOiBmdW5jdGlvbiAocHJvcGVydHlJbmZvRmllbGQ6IGFueSwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRcdGxldCBvUHJvcGVydHlJbmZvO1xuXHRcdGNvbnN0IGFUeXBlQ29uZmlnOiBhbnkgPSB7fTtcblx0XHRjb25zdCBwcm9wZXJ0eUNvbnZlcnR5Q29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihwcm9wZXJ0eUluZm9GaWVsZC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0Y29uc3QgcHJvcGVydHlUYXJnZXRPYmplY3QgPSBwcm9wZXJ0eUNvbnZlcnR5Q29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0O1xuXHRcdGNvbnN0IG9UeXBlQ29uZmlnID0gRmlsdGVyQmFyQ29udmVydGVyLmZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eVRhcmdldE9iamVjdCk7XG5cdFx0b1Byb3BlcnR5SW5mbyA9IEZpbHRlckJhckNvbnZlcnRlci5mZXRjaFByb3BlcnR5SW5mbyhjb252ZXJ0ZXJDb250ZXh0LCBwcm9wZXJ0eUluZm9GaWVsZCwgb1R5cGVDb25maWcpO1xuXHRcdGFUeXBlQ29uZmlnW3Byb3BlcnR5SW5mb0ZpZWxkLmtleV0gPSBvVHlwZUNvbmZpZztcblx0XHRvUHJvcGVydHlJbmZvID0gRmlsdGVyQmFyQ29udmVydGVyLmFzc2lnbkRhdGFUeXBlVG9Qcm9wZXJ0eUluZm8ob1Byb3BlcnR5SW5mbyBhcyBhbnksIGNvbnZlcnRlckNvbnRleHQsIFtdLCBhVHlwZUNvbmZpZyk7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH0sXG5cdGNyZWF0ZUNvbnZlcnRlckNvbnRleHQ6IGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogYW55LCBzRW50aXR5VHlwZVBhdGg6IHN0cmluZywgbWV0YU1vZGVsPzogTWV0YU1vZGVsLCBhcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBzRmlsdGVyRW50aXR5VHlwZVBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQ29udHJvbCwgXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0Y29udGV4dFBhdGggPSBzRW50aXR5VHlwZVBhdGggfHwgc0ZpbHRlckVudGl0eVR5cGVQYXRoO1xuXG5cdFx0Y29uc3Qgb1ZpZXcgPSBvRmlsdGVyQ29udHJvbC5pc0EgPyBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9GaWx0ZXJDb250cm9sKSA6IG51bGw7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG1ldGFNb2RlbCB8fCBvRmlsdGVyQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBhcHBDb21wb25lbnQgfHwgKG9WaWV3ICYmIENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldykpO1xuXHRcdGNvbnN0IG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChjb250ZXh0UGF0aCkpO1xuXHRcdGxldCBtYW5pZmVzdFNldHRpbmdzOiBCYXNlTWFuaWZlc3RTZXR0aW5ncyB8IHVuZGVmaW5lZDtcblx0XHRpZiAob0ZpbHRlckNvbnRyb2wuaXNBICYmICFvRmlsdGVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLmZpbHRlcmJhci52aC5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdG1hbmlmZXN0U2V0dGluZ3MgPSAoKG9WaWV3ICYmIG9WaWV3LmdldFZpZXdEYXRhKCkpIHx8IHt9KSBhcyBCYXNlTWFuaWZlc3RTZXR0aW5ncztcblx0XHR9XG5cdFx0cmV0dXJuIENvbnZlcnRlckNvbnRleHQuY3JlYXRlQ29udmVydGVyQ29udGV4dEZvck1hY3JvKFxuXHRcdFx0b1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWUsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b0FwcENvbXBvbmVudD8uZ2V0RGlhZ25vc3RpY3MoKSBhcyBhbnksXG5cdFx0XHRtZXJnZSxcblx0XHRcdG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24sXG5cdFx0XHRtYW5pZmVzdFNldHRpbmdzXG5cdFx0KTtcblx0fSxcblx0Z2V0Q29udmVydGVkRmlsdGVyRmllbGRzOiBmdW5jdGlvbiAoXG5cdFx0b0ZpbHRlckNvbnRyb2w6IGFueSxcblx0XHRzRW50aXR5VHlwZVBhdGg/OiBhbnksXG5cdFx0aW5jbHVkZUhpZGRlbj86IGJvb2xlYW4sXG5cdFx0bWV0YU1vZGVsPzogTWV0YU1vZGVsLFxuXHRcdGFwcENvbXBvbmVudD86IEFwcENvbXBvbmVudCxcblx0XHRvTW9kaWZpZXI/OiBhbnksXG5cdFx0bGluZUl0ZW1UZXJtPzogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLl9nZXRGaWx0ZXJNZXRhTW9kZWwob0ZpbHRlckNvbnRyb2wsIG1ldGFNb2RlbCk7XG5cdFx0Y29uc3Qgc0ZpbHRlckVudGl0eVR5cGVQYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0ZpbHRlckNvbnRyb2wsIFwiZW50aXR5VHlwZVwiKSxcblx0XHRcdGNvbnRleHRQYXRoID0gc0VudGl0eVR5cGVQYXRoIHx8IHNGaWx0ZXJFbnRpdHlUeXBlUGF0aDtcblxuXHRcdGNvbnN0IGxyVGFibGVzOiBhbnlbXSA9IHRoaXMuX2dldEZpZWxkc0ZvclRhYmxlKG9GaWx0ZXJDb250cm9sLCBzRW50aXR5VHlwZVBhdGgpO1xuXG5cdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmNyZWF0ZUNvbnZlcnRlckNvbnRleHQob0ZpbHRlckNvbnRyb2wsIHNFbnRpdHlUeXBlUGF0aCwgbWV0YU1vZGVsLCBhcHBDb21wb25lbnQpO1xuXG5cdFx0Ly9hU2VsZWN0aW9uRmllbGRzID0gRmlsdGVyQmFyQ29udmVydGVyLmdldFNlbGVjdGlvbkZpZWxkcyhvQ29udmVydGVyQ29udGV4dCk7XG5cdFx0cmV0dXJuIHRoaXMuX2dldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdG9GaWx0ZXJDb250cm9sLFxuXHRcdFx0c0VudGl0eVR5cGVQYXRoLFxuXHRcdFx0c0ZpbHRlckVudGl0eVR5cGVQYXRoLFxuXHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRsclRhYmxlcyxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvQ29udmVydGVyQ29udGV4dCxcblx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRvTW9kaWZpZXIsXG5cdFx0XHRsaW5lSXRlbVRlcm1cblx0XHQpO1xuXHR9LFxuXG5cdGdldEJpbmRpbmdQYXRoRm9yUGFyYW1ldGVyczogZnVuY3Rpb24gKG9JRmlsdGVyOiBhbnksIG1Db25kaXRpb25zOiBhbnksIGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGE6IGFueSwgYVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IGFQYXJhbXM6IGFueVtdID0gW107XG5cdFx0YUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSA9IG9GaWx0ZXJVdGlscy5zZXRUeXBlQ29uZmlnVG9Qcm9wZXJ0aWVzKGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEpO1xuXHRcdC8vIENvbGxlY3RpbmcgYWxsIHBhcmFtZXRlciB2YWx1ZXMgZnJvbSBjb25kaXRpb25zXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc0ZpZWxkUGF0aCA9IGFQYXJhbWV0ZXJzW2ldO1xuXHRcdFx0aWYgKG1Db25kaXRpb25zW3NGaWVsZFBhdGhdICYmIG1Db25kaXRpb25zW3NGaWVsZFBhdGhdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gV2Ugd291bGQgYmUgdXNpbmcgb25seSB0aGUgZmlyc3QgY29uZGl0aW9uIGZvciBwYXJhbWV0ZXIgdmFsdWUuXG5cdFx0XHRcdGNvbnN0IG9Db25kaXRpb25JbnRlcm5hbCA9IG1lcmdlKHt9LCBtQ29uZGl0aW9uc1tzRmllbGRQYXRoXVswXSkgYXMgYW55O1xuXHRcdFx0XHRjb25zdCBvUHJvcGVydHkgPSBGaWx0ZXJVdGlsLmdldFByb3BlcnR5QnlLZXkoYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSwgc0ZpZWxkUGF0aCkgYXMgYW55O1xuXHRcdFx0XHRjb25zdCBvVHlwZUNvbmZpZyA9XG5cdFx0XHRcdFx0b1Byb3BlcnR5LnR5cGVDb25maWcgfHwgVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhvUHJvcGVydHkuZGF0YVR5cGUsIG9Qcm9wZXJ0eS5mb3JtYXRPcHRpb25zLCBvUHJvcGVydHkuY29uc3RyYWludHMpO1xuXHRcdFx0XHRjb25zdCBtSW50ZXJuYWxQYXJhbWV0ZXJDb25kaXRpb24gPSBDb25kaXRpb25Db252ZXJ0ZXIudG9UeXBlKG9Db25kaXRpb25JbnRlcm5hbCwgb1R5cGVDb25maWcsIG9JRmlsdGVyLmdldFR5cGVVdGlsKCkpO1xuXHRcdFx0XHRjb25zdCBzRWRtVHlwZSA9IE9EQVRBX1RZUEVfTUFQUElOR1tvVHlwZUNvbmZpZy5jbGFzc05hbWVdO1xuXHRcdFx0XHRhUGFyYW1zLnB1c2goXG5cdFx0XHRcdFx0YCR7c0ZpZWxkUGF0aH09JHtlbmNvZGVVUklDb21wb25lbnQoT0RhdGFVdGlscy5mb3JtYXRMaXRlcmFsKG1JbnRlcm5hbFBhcmFtZXRlckNvbmRpdGlvbi52YWx1ZXNbMF0sIHNFZG1UeXBlKSl9YFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEJpbmRpbmcgcGF0aCBmcm9tIEVudGl0eVR5cGVcblx0XHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBvSUZpbHRlci5kYXRhKFwiZW50aXR5VHlwZVwiKTtcblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IHNFbnRpdHlUeXBlUGF0aC5zdWJzdHJpbmcoMCwgc0VudGl0eVR5cGVQYXRoLmxlbmd0aCAtIDEpO1xuXHRcdGNvbnN0IHNQYXJhbWV0ZXJFbnRpdHlTZXQgPSBzRW50aXR5U2V0UGF0aC5zbGljZSgwLCBzRW50aXR5U2V0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdGNvbnN0IHNUYXJnZXROYXZpZ2F0aW9uID0gc0VudGl0eVNldFBhdGguc3Vic3RyaW5nKHNFbnRpdHlTZXRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdC8vIGNyZWF0ZSBwYXJhbWV0ZXIgY29udGV4dFxuXHRcdHJldHVybiBgJHtzUGFyYW1ldGVyRW50aXR5U2V0fSgke2FQYXJhbXMudG9TdHJpbmcoKX0pLyR7c1RhcmdldE5hdmlnYXRpb259YDtcblx0fSxcblxuXHRnZXRFZGl0U3RhdGVJc0hpZGVEcmFmdDogZnVuY3Rpb24gKG1Db25kaXRpb25zOiBhbnkpIHtcblx0XHRsZXQgYklzSGlkZURyYWZ0ID0gZmFsc2U7XG5cdFx0aWYgKG1Db25kaXRpb25zICYmIG1Db25kaXRpb25zLiRlZGl0U3RhdGUpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBtQ29uZGl0aW9ucy4kZWRpdFN0YXRlLmZpbmQoZnVuY3Rpb24gKGNvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdHJldHVybiBjb25kaXRpb24ub3BlcmF0b3IgPT09IFwiRFJBRlRfRURJVF9TVEFURVwiO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAob0NvbmRpdGlvbiAmJiAob0NvbmRpdGlvbi52YWx1ZXMuaW5jbHVkZXMoXCJBTExfSElESU5HX0RSQUZUU1wiKSB8fCBvQ29uZGl0aW9uLnZhbHVlcy5pbmNsdWRlcyhcIlNBVkVEX09OTFlcIikpKSB7XG5cdFx0XHRcdGJJc0hpZGVEcmFmdCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBiSXNIaWRlRHJhZnQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBmaWx0ZXJzIHRoYXQgb3JpZ2luYXRlIGZyb20gdGhlIE1EQyBGaWx0ZXJCYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB2SUZpbHRlciBTdHJpbmcgb3Igb2JqZWN0IGluc3RhbmNlIHJlbGF0ZWQgdG9cblx0ICogIC0gTURDX0ZpbHRlckJhci9UYWJsZS9DaGFydFxuXHQgKiBAcGFyYW0gbVByb3BlcnRpZXMgUHJvcGVydGllcyBvbiBmaWx0ZXJzIHRoYXQgYXJlIHRvIGJlIHJldHJpZXZlZC4gQXZhaWxhYmxlIHBhcmFtZXRlcnM6XG5cdCAqIFx0IC0gaWdub3JlZFByb3BlcnRpZXM6IEFycmF5IG9mIHByb3BlcnR5IG5hbWVzIHdoaWNoIHNob3VsZCBiZSBub3QgY29uc2lkZXJlZCBmb3IgZmlsdGVyaW5nXG5cdCAqXHQgLSBwcm9wZXJ0aWVzTWV0YWRhdGE6IEFycmF5IHdpdGggYWxsIHRoZSBwcm9wZXJ0eSBtZXRhZGF0YS4gSWYgbm90IHByb3ZpZGVkLCBwcm9wZXJ0aWVzIHdpbGwgYmUgcmV0cmlldmVkIGZyb20gdklGaWx0ZXIuXG5cdCAqXHQgLSB0YXJnZXRDb250cm9sOiBNRENfdGFibGUgb3IgY2hhcnQuIElmIHByb3ZpZGVkLCBwcm9wZXJ0eSBuYW1lcyB3aGljaCBhcmUgbm90IHJlbGV2YW50IGZvciB0aGUgdGFyZ2V0IGNvbnRyb2wgZW50aXR5U2V0IGFyZSBub3QgY29uc2lkZXJlZC5cblx0ICogQHBhcmFtIG1GaWx0ZXJDb25kaXRpb25zIE1hcCB3aXRoIGV4dGVybmFsaXplZCBmaWx0ZXIgY29uZGl0aW9ucy5cblx0ICogQHJldHVybnMgRmlsdGVyQmFyIGZpbHRlcnMgYW5kIGJhc2ljIHNlYXJjaFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEZpbHRlckluZm86IGZ1bmN0aW9uICh2SUZpbHRlcjogc3RyaW5nIHwgb2JqZWN0LCBtUHJvcGVydGllcz86IGFueSwgbUZpbHRlckNvbmRpdGlvbnM/OiBhbnkpIHtcblx0XHRsZXQgYUlnbm9yZVByb3BlcnRpZXMgPSAobVByb3BlcnRpZXMgJiYgbVByb3BlcnRpZXMuaWdub3JlZFByb3BlcnRpZXMpIHx8IFtdO1xuXHRcdGNvbnN0IG9UYXJnZXRDb250cm9sID0gbVByb3BlcnRpZXMgJiYgbVByb3BlcnRpZXMudGFyZ2V0Q29udHJvbCxcblx0XHRcdHNUYXJnZXRFbnRpdHlQYXRoID0gb1RhcmdldENvbnRyb2wgPyBvVGFyZ2V0Q29udHJvbC5kYXRhKFwiZW50aXR5VHlwZVwiKSA6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBtUGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXHRcdGxldCBvSUZpbHRlcjogYW55ID0gdklGaWx0ZXIsXG5cdFx0XHRzU2VhcmNoLFxuXHRcdFx0YUZpbHRlcnM6IGFueVtdID0gW10sXG5cdFx0XHRzQmluZGluZ1BhdGgsXG5cdFx0XHRhUHJvcGVydGllc01ldGFkYXRhID0gbVByb3BlcnRpZXMgJiYgbVByb3BlcnRpZXMucHJvcGVydGllc01ldGFkYXRhO1xuXHRcdGlmICh0eXBlb2YgdklGaWx0ZXIgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdG9JRmlsdGVyID0gQ29yZS5ieUlkKHZJRmlsdGVyKSBhcyBhbnk7XG5cdFx0fVxuXHRcdGlmIChvSUZpbHRlcikge1xuXHRcdFx0c1NlYXJjaCA9IHRoaXMuX2dldFNlYXJjaEZpZWxkKG9JRmlsdGVyLCBhSWdub3JlUHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBtQ29uZGl0aW9ucyA9IHRoaXMuX2dldEZpbHRlckNvbmRpdGlvbnMobVByb3BlcnRpZXMsIG1GaWx0ZXJDb25kaXRpb25zLCBvSUZpbHRlcik7XG5cdFx0XHRsZXQgYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSA9IG9JRmlsdGVyLmdldFByb3BlcnR5SW5mb1NldCA/IG9JRmlsdGVyLmdldFByb3BlcnR5SW5mb1NldCgpIDogbnVsbDtcblx0XHRcdGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEgPSB0aGlzLl9nZXRGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEoYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSwgb0lGaWx0ZXIpO1xuXHRcdFx0aWYgKG1Qcm9wZXJ0aWVzICYmIG1Qcm9wZXJ0aWVzLnRhcmdldENvbnRyb2wgJiYgbVByb3BlcnRpZXMudGFyZ2V0Q29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKG1Db25kaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0XHRpZiAoc0tleSA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBtQ29uZGl0aW9uc1tcIiRlZGl0U3RhdGVcIl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGxldCBhUGFyYW1ldGVycyA9IG9JRmlsdGVyLmRhdGEoXCJwYXJhbWV0ZXJzXCIpIHx8IFtdO1xuXHRcdFx0YVBhcmFtZXRlcnMgPSB0eXBlb2YgYVBhcmFtZXRlcnMgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKGFQYXJhbWV0ZXJzKSA6IGFQYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gQmluZGluZyBwYXRoIGNoYW5nZXMgaW4gY2FzZSBvZiBwYXJhbWV0ZXJzLlxuXHRcdFx0XHRzQmluZGluZ1BhdGggPSBvRmlsdGVyVXRpbHMuZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzKG9JRmlsdGVyLCBtQ29uZGl0aW9ucywgYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSwgYVBhcmFtZXRlcnMpO1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLmxlbmd0aCkge1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG1Db25kaXRpb25zKS5mb3JFYWNoKChwYXJhbSkgPT4ge1xuXHRcdFx0XHRcdFx0YVBhcmFtZXRlcnMuZm9yRWFjaCgocmVxdWlyZWRQYXJhbTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChwYXJhbSA9PT0gcmVxdWlyZWRQYXJhbSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG1QYXJhbWV0ZXJzVmFsdWUgPSBtQ29uZGl0aW9uc1twYXJhbV1bMF0udmFsdWVzO1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzW3JlcXVpcmVkUGFyYW1dID0gbVBhcmFtZXRlcnNWYWx1ZVswXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChtQ29uZGl0aW9ucykge1xuXHRcdFx0XHQvL0V4Y2x1ZGUgSW50ZXJmYWNlIEZpbHRlciBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3IgdGhlIFRhcmdldCBjb250cm9sIGVudGl0eVNldFxuXHRcdFx0XHRpZiAoc1RhcmdldEVudGl0eVBhdGggJiYgb0lGaWx0ZXIuZGF0YShcImVudGl0eVR5cGVcIikgIT09IHNUYXJnZXRFbnRpdHlQYXRoKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9JRmlsdGVyLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdFx0Y29uc3QgYVRhcmdldFByb3BlcnRpZXNNZXRhZGF0YSA9IG9JRmlsdGVyXG5cdFx0XHRcdFx0XHQuZ2V0Q29udHJvbERlbGVnYXRlKClcblx0XHRcdFx0XHRcdC5mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc1RhcmdldEVudGl0eVBhdGgsIG9NZXRhTW9kZWwsIG9JRmlsdGVyKTtcblx0XHRcdFx0XHRhUHJvcGVydGllc01ldGFkYXRhID0gYVRhcmdldFByb3BlcnRpZXNNZXRhZGF0YTtcblxuXHRcdFx0XHRcdGNvbnN0IG1FbnRpdHlQcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYVRhcmdldFByb3BlcnRpZXNNZXRhZGF0YSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0VudGl0eVByb3BlcnR5ID0gYVRhcmdldFByb3BlcnRpZXNNZXRhZGF0YVtpXTtcblx0XHRcdFx0XHRcdG1FbnRpdHlQcm9wZXJ0aWVzW29FbnRpdHlQcm9wZXJ0eS5uYW1lXSA9IHtcblx0XHRcdFx0XHRcdFx0aGFzUHJvcGVydHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGRhdGFUeXBlOiBvRW50aXR5UHJvcGVydHkuZGF0YVR5cGVcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IF9hSWdub3JlUHJvcGVydGllczogYW55ID0gdGhpcy5fZ2V0SWdub3JlZFByb3BlcnRpZXMoYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSwgbUVudGl0eVByb3BlcnRpZXMpO1xuXHRcdFx0XHRcdGlmIChfYUlnbm9yZVByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0YUlnbm9yZVByb3BlcnRpZXMgPSBhSWdub3JlUHJvcGVydGllcy5jb25jYXQoX2FJZ25vcmVQcm9wZXJ0aWVzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoIWFQcm9wZXJ0aWVzTWV0YWRhdGEpIHtcblx0XHRcdFx0XHRhUHJvcGVydGllc01ldGFkYXRhID0gYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyB2YXIgYVBhcmFtS2V5cyA9IFtdO1xuXHRcdFx0XHQvLyBhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFyYW0pIHtcblx0XHRcdFx0Ly8gXHRhUGFyYW1LZXlzLnB1c2gob1BhcmFtLmtleSk7XG5cdFx0XHRcdC8vIH0pO1xuXHRcdFx0XHRjb25zdCBvRmlsdGVyID0gKFxuXHRcdFx0XHRcdEZpbHRlclV0aWwuZ2V0RmlsdGVySW5mbyhcblx0XHRcdFx0XHRcdG9JRmlsdGVyLFxuXHRcdFx0XHRcdFx0bUNvbmRpdGlvbnMsXG5cdFx0XHRcdFx0XHRvRmlsdGVyVXRpbHMuc2V0VHlwZUNvbmZpZ1RvUHJvcGVydGllcyhhUHJvcGVydGllc01ldGFkYXRhKSxcblx0XHRcdFx0XHRcdGFJZ25vcmVQcm9wZXJ0aWVzLmNvbmNhdChhUGFyYW1ldGVycylcblx0XHRcdFx0XHQpIGFzIGFueVxuXHRcdFx0XHQpLmZpbHRlcnM7XG5cdFx0XHRcdGFGaWx0ZXJzID0gb0ZpbHRlciA/IFtvRmlsdGVyXSA6IFtdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4geyBwYXJhbWV0ZXJzOiBtUGFyYW1ldGVycywgZmlsdGVyczogYUZpbHRlcnMsIHNlYXJjaDogc1NlYXJjaCB8fCB1bmRlZmluZWQsIGJpbmRpbmdQYXRoOiBzQmluZGluZ1BhdGggfTtcblx0fSxcblx0c2V0VHlwZUNvbmZpZ1RvUHJvcGVydGllczogZnVuY3Rpb24gKGFQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRpZiAoYVByb3BlcnRpZXMgJiYgYVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRhUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChvSUZpbHRlclByb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZyAmJlxuXHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZy50eXBlSW5zdGFuY2UgJiZcblx0XHRcdFx0XHRvSUZpbHRlclByb3BlcnR5LnR5cGVDb25maWcudHlwZUluc3RhbmNlLmdldENvbnN0cmFpbnRzIGluc3RhbmNlb2YgRnVuY3Rpb25cblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvSUZpbHRlclByb3BlcnR5LnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRcdFx0b0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiLCB7fSwge30pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9JRmlsdGVyUHJvcGVydHkucGF0aCA9PT0gXCIkc2VhcmNoXCIpIHtcblx0XHRcdFx0XHRvSUZpbHRlclByb3BlcnR5LnR5cGVDb25maWcgPSBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIsIHt9LCB7fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0lGaWx0ZXJQcm9wZXJ0eS5kYXRhVHlwZSB8fCAob0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnICYmIG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZy5jbGFzc05hbWUpKSB7XG5cdFx0XHRcdFx0b0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuZGF0YVR5cGUgfHwgb0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnLmNsYXNzTmFtZSxcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuY29uc3RyYWludHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFQcm9wZXJ0aWVzO1xuXHR9LFxuXHRnZXROb3RBcHBsaWNhYmxlRmlsdGVyczogZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSwgb0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRFbnRpdHlUeXBlUGF0aCA9IG9Db250cm9sLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0b0ZpbHRlckJhckVudGl0eVBhdGggPSBvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0b0ZpbHRlckJhckVudGl0eVNldEFubm90YXRpb25zID0gb0ZpbHRlckJhci5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChvRmlsdGVyQmFyRW50aXR5UGF0aCksXG5cdFx0XHRhTm90QXBwbGljYWJsZSA9IFtdLFxuXHRcdFx0bUNvbmRpdGlvbnMgPSBvRmlsdGVyQmFyLmdldENvbmRpdGlvbnMoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvRmlsdGVyQmFyLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRiSXNGaWx0ZXJCYXJFbnRpdHlUeXBlID0gc1RhcmdldEVudGl0eVR5cGVQYXRoID09PSBvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0YklzQ2hhcnQgPSBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpLFxuXHRcdFx0YklzQW5hbHl0aWNhbFRhYmxlID0gIWJJc0NoYXJ0ICYmIG9Db250cm9sLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmVuYWJsZUFuYWx5dGljcyxcblx0XHRcdGJJc1RyZWVUYWJsZSA9ICFiSXNDaGFydCAmJiBvQ29udHJvbC5jb250cm9sPy50eXBlID09PSBcIlRyZWVUYWJsZVwiLFxuXHRcdFx0YkVuYWJsZVNlYXJjaCA9IGJJc0NoYXJ0XG5cdFx0XHRcdD8gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvQ29udHJvbCwgXCJhcHBseVN1cHBvcnRlZFwiKSkuZW5hYmxlU2VhcmNoXG5cdFx0XHRcdDogIShiSXNBbmFseXRpY2FsVGFibGUgfHwgYklzVHJlZVRhYmxlKSB8fCBvQ29udHJvbC5nZXRQYXJlbnQoKS5nZXRUYWJsZURlZmluaXRpb24oKS5lbmFibGVCYXNpY1NlYXJjaDtcblxuXHRcdGlmIChtQ29uZGl0aW9ucyAmJiAoIWJJc0ZpbHRlckJhckVudGl0eVR5cGUgfHwgYklzQW5hbHl0aWNhbFRhYmxlIHx8IGJJc0NoYXJ0KSkge1xuXHRcdFx0Ly8gV2UgZG9uJ3QgbmVlZCB0byBjYWxjdWxhdGUgdGhlIGRpZmZlcmVuY2Ugb24gcHJvcGVydHkgTGV2ZWwgaWYgZW50aXR5IHNldHMgYXJlIGlkZW50aWNhbFxuXHRcdFx0Y29uc3QgYVRhcmdldFByb3BlcnRpZXMgPSBiSXNGaWx0ZXJCYXJFbnRpdHlUeXBlXG5cdFx0XHRcdFx0PyBbXVxuXHRcdFx0XHRcdDogb0ZpbHRlckJhci5nZXRDb250cm9sRGVsZWdhdGUoKS5mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc1RhcmdldEVudGl0eVR5cGVQYXRoLCBvTWV0YU1vZGVsLCBvRmlsdGVyQmFyKSxcblx0XHRcdFx0bVRhcmdldFByb3BlcnRpZXMgPSBhVGFyZ2V0UHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24gKG1Qcm9wOiBhbnksIG9Qcm9wOiBhbnkpIHtcblx0XHRcdFx0XHRtUHJvcFtvUHJvcC5uYW1lXSA9IG9Qcm9wO1xuXHRcdFx0XHRcdHJldHVybiBtUHJvcDtcblx0XHRcdFx0fSwge30pLFxuXHRcdFx0XHRtVGFibGVBZ2dyZWdhdGVzID0gKCFiSXNDaGFydCAmJiBvQ29udHJvbC5nZXRQYXJlbnQoKS5nZXRUYWJsZURlZmluaXRpb24oKS5hZ2dyZWdhdGVzKSB8fCB7fSxcblx0XHRcdFx0bUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblxuXHRcdFx0T2JqZWN0LmtleXMobVRhYmxlQWdncmVnYXRlcykuZm9yRWFjaChmdW5jdGlvbiAoc0FnZ3JlZ2F0ZU5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBvQWdncmVnYXRlID0gbVRhYmxlQWdncmVnYXRlc1tzQWdncmVnYXRlTmFtZV07XG5cdFx0XHRcdG1BZ2dyZWdhdGVkUHJvcGVydGllc1tvQWdncmVnYXRlLnJlbGF0aXZlUGF0aF0gPSBvQWdncmVnYXRlO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBjaGFydEVudGl0eVR5cGVBbm5vdGF0aW9ucyA9IG9Db250cm9sXG5cdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHQuZ2V0T2JqZWN0KG9Db250cm9sLmRhdGEoXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKSArIFwiL1wiKTtcblx0XHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9FbnRpdHlTZXRBbm5vdGF0aW9ucyA9IG9Db250cm9sXG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdFx0XHQuZ2V0T2JqZWN0KGAke29Db250cm9sLmRhdGEoXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKX1AYCksXG5cdFx0XHRcdFx0bUNoYXJ0Q3VzdG9tQWdncmVnYXRlcyA9IGdldEFsbEN1c3RvbUFnZ3JlZ2F0ZXMob0VudGl0eVNldEFubm90YXRpb25zKTtcblx0XHRcdFx0T2JqZWN0LmtleXMobUNoYXJ0Q3VzdG9tQWdncmVnYXRlcykuZm9yRWFjaChmdW5jdGlvbiAoc0FnZ3JlZ2F0ZU5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRcdGlmICghbUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW3NBZ2dyZWdhdGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0FnZ3JlZ2F0ZSA9IG1DaGFydEN1c3RvbUFnZ3JlZ2F0ZXNbc0FnZ3JlZ2F0ZU5hbWVdO1xuXHRcdFx0XHRcdFx0bUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW3NBZ2dyZWdhdGVOYW1lXSA9IG9BZ2dyZWdhdGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yIChjb25zdCBzUHJvcGVydHkgaW4gbUNvbmRpdGlvbnMpIHtcblx0XHRcdFx0Ly8gTmVlZCB0byBjaGVjayB0aGUgbGVuZ3RoIG9mIG1Db25kaXRpb25zW3NQcm9wZXJ0eV0gc2luY2UgcHJldmlvdXMgZmlsdGVyZWQgcHJvcGVydGllcyBhcmUga2VwdCBpbnRvIG1Db25kaXRpb25zIHdpdGggZW1wdHkgYXJyYXkgYXMgZGVmaW5pdGlvblxuXHRcdFx0XHRjb25zdCBhQ29uZGl0aW9uUHJvcGVydHkgPSBtQ29uZGl0aW9uc1tzUHJvcGVydHldO1xuXHRcdFx0XHRsZXQgdHlwZUNoZWNrID0gdHJ1ZTtcblx0XHRcdFx0aWYgKGNoYXJ0RW50aXR5VHlwZUFubm90YXRpb25zW3NQcm9wZXJ0eV0gJiYgb0ZpbHRlckJhckVudGl0eVNldEFubm90YXRpb25zW3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0eXBlQ2hlY2sgPSBjaGFydEVudGl0eVR5cGVBbm5vdGF0aW9uc1tzUHJvcGVydHldW1wiJFR5cGVcIl0gPT09IG9GaWx0ZXJCYXJFbnRpdHlTZXRBbm5vdGF0aW9uc1tzUHJvcGVydHldW1wiJFR5cGVcIl07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdEFycmF5LmlzQXJyYXkoYUNvbmRpdGlvblByb3BlcnR5KSAmJlxuXHRcdFx0XHRcdGFDb25kaXRpb25Qcm9wZXJ0eS5sZW5ndGggPiAwICYmXG5cdFx0XHRcdFx0KCgoIW1UYXJnZXRQcm9wZXJ0aWVzW3NQcm9wZXJ0eV0gfHwgKG1UYXJnZXRQcm9wZXJ0aWVzW3NQcm9wZXJ0eV0gJiYgIXR5cGVDaGVjaykpICYmXG5cdFx0XHRcdFx0XHQoIWJJc0ZpbHRlckJhckVudGl0eVR5cGUgfHwgKHNQcm9wZXJ0eSA9PT0gXCIkZWRpdFN0YXRlXCIgJiYgYklzQ2hhcnQpKSkgfHxcblx0XHRcdFx0XHRcdG1BZ2dyZWdhdGVkUHJvcGVydGllc1tzUHJvcGVydHldKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZS5wdXNoKHNQcm9wZXJ0eS5yZXBsYWNlKC9cXCt8XFwqL2csIFwiXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWJFbmFibGVTZWFyY2ggJiYgb0ZpbHRlckJhci5nZXRTZWFyY2goKSkge1xuXHRcdFx0YU5vdEFwcGxpY2FibGUucHVzaChcIiRzZWFyY2hcIik7XG5cdFx0fVxuXHRcdHJldHVybiBhTm90QXBwbGljYWJsZTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0cyB0aGUgdmFsdWUgbGlzdCBpbmZvcm1hdGlvbiBvZiBhIHByb3BlcnR5IGFzIGRlZmluZWQgZm9yIGEgZ2l2ZW4gZmlsdGVyIGJhci5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlckJhciBUaGUgZmlsdGVyIGJhciB0byBnZXQgdGhlIHZhbHVlIGxpc3QgaW5mb3JtYXRpb24gZm9yXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgVGhlIHByb3BlcnR5IHRvIGdldCB0aGUgdmFsdWUgbGlzdCBpbmZvcm1hdGlvbiBmb3Jcblx0ICogQHJldHVybnMgVGhlIHZhbHVlIGxpc3QgaW5mb3JtYXRpb25cblx0ICovXG5cdGFzeW5jIF9nZXRWYWx1ZUxpc3RJbmZvKGZpbHRlckJhcjogRmlsdGVyQmFyLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gZmlsdGVyQmFyLmdldE1vZGVsKCk/LmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXG5cdFx0aWYgKCFtZXRhTW9kZWwpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW50aXR5VHlwZSA9IGZpbHRlckJhci5kYXRhKFwiZW50aXR5VHlwZVwiKSA/PyBcIlwiO1xuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm9zID0gYXdhaXQgbWV0YU1vZGVsLnJlcXVlc3RWYWx1ZUxpc3RJbmZvKGVudGl0eVR5cGUgKyBwcm9wZXJ0eU5hbWUsIHRydWUsIHVuZGVmaW5lZCkuY2F0Y2goKCkgPT4gbnVsbCk7XG5cdFx0cmV0dXJuIHZhbHVlTGlzdEluZm9zPy5bXCJcIl07XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHtAbGluayBDb25kaXRpb25WYWxpZGF0ZWR9IHN0YXRlIGZvciBhIHNpbmdsZSB2YWx1ZS4gVGhpcyBkZWNpZGVzIHdoZXRoZXIgdGhlIHZhbHVlIGlzIHRyZWF0ZWQgYXMgYSBzZWxlY3RlZCB2YWx1ZVxuXHQgKiBpbiBhIHZhbHVlIGhlbHAsIG1lYW5pbmcgdGhhdCBpdHMgZGVzY3JpcHRpb24gaXMgbG9hZGVkIGFuZCBkaXNwbGF5ZWQgaWYgZXhpc3RpbmcsIG9yIHdoZXRoZXIgaXQgaXMgZGlzcGxheWVkIGFzIGFcblx0ICogY29uZGl0aW9uIChlLmcuIFwiPTFcIikuXG5cdCAqXG5cdCAqIFZhbHVlcyBmb3IgcHJvcGVydGllcyB3aXRob3V0IHZhbHVlIGxpc3QgaW5mbyBhcmUgYWx3YXlzIHRyZWF0ZWQgYXMge0BsaW5rIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWR9LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVMaXN0SW5mbyBUaGUgdmFsdWUgbGlzdCBpbmZvIGZyb20gdGhlIHtAbGluayBNZXRhTW9kZWx9XG5cdCAqIEBwYXJhbSBjb25kaXRpb25QYXRoIFBhdGggdG8gdGhlIHByb3BlcnR5IHRvIHNldCB0aGUgdmFsdWUgYXMgY29uZGl0aW9uIGZvclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHNpbmdsZSB2YWx1ZSB0byBnZXQgdGhlIHN0YXRlIGZvclxuXHQgKi9cblx0X2dldENvbmRpdGlvblZhbGlkYXRlZDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdHZhbHVlTGlzdEluZm86IGFueSxcblx0XHRjb25kaXRpb25QYXRoOiBzdHJpbmcsXG5cdFx0dmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkXG5cdCk6IFByb21pc2U8Q29uZGl0aW9uVmFsaWRhdGVkPiB7XG5cdFx0aWYgKCF2YWx1ZUxpc3RJbmZvKSB7XG5cdFx0XHRyZXR1cm4gQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZDtcblx0XHR9XG5cblx0XHRjb25zdCBmaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdHBhdGg6IGNvbmRpdGlvblBhdGgsXG5cdFx0XHRvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuRVEsXG5cdFx0XHR2YWx1ZTE6IHZhbHVlXG5cdFx0fSk7XG5cdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSB2YWx1ZUxpc3RJbmZvLiRtb2RlbC5iaW5kTGlzdChgLyR7dmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmlsdGVyLCB7XG5cdFx0XHQkc2VsZWN0OiBjb25kaXRpb25QYXRoXG5cdFx0fSk7XG5cblx0XHRjb25zdCB2YWx1ZUV4aXN0cyA9IChhd2FpdCBsaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoKSkubGVuZ3RoID4gMDtcblx0XHRpZiAodmFsdWVFeGlzdHMpIHtcblx0XHRcdHJldHVybiBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZDtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBDbGVhcnMgYWxsIGlucHV0IHZhbHVlcyBvZiB2aXNpYmxlIGZpbHRlciBmaWVsZHMgaW4gdGhlIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIFRoZSBmaWx0ZXIgYmFyIHRoYXQgY29udGFpbnMgdGhlIGZpbHRlciBmaWVsZFxuXHQgKi9cblx0Y2xlYXJGaWx0ZXJWYWx1ZXM6IGFzeW5jIGZ1bmN0aW9uIChvRmlsdGVyQmFyOiBhbnkpIHtcblx0XHQvLyBEbyBub3RoaW5nIHdoZW4gdGhlIGZpbHRlciBiYXIgaXMgaGlkZGVuXG5cdFx0aWYgKCFvRmlsdGVyQmFyKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RhdGU6IEV4dGVybmFsU3RhdGVUeXBlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShvRmlsdGVyQmFyKTtcblx0XHRjb25zdCBlZGl0U3RhdGVQYXRoID0gXCIkZWRpdFN0YXRlXCI7XG5cdFx0Y29uc3QgZWRpdFN0YXRlRGVmYXVsdFZhbHVlID0gRURJVFNUQVRFLkFMTC5pZDtcblx0XHRjb25zdCBjdXJyZW50RWRpdFN0YXRlQ29uZGl0aW9uID0gZGVlcENsb25lKHN0YXRlLmZpbHRlcltlZGl0U3RhdGVQYXRoXT8uWzBdKTtcblx0XHRjb25zdCBjdXJyZW50RWRpdFN0YXRlSXNEZWZhdWx0ID0gY3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbj8udmFsdWVzWzBdID09PSBlZGl0U3RhdGVEZWZhdWx0VmFsdWU7XG5cblx0XHQvLyBDbGVhciBhbGwgY29uZGl0aW9uc1xuXHRcdGZvciAoY29uc3QgY29uZGl0aW9uUGF0aCBvZiBPYmplY3Qua2V5cyhzdGF0ZS5maWx0ZXIpKSB7XG5cdFx0XHRpZiAoY29uZGl0aW9uUGF0aCA9PT0gZWRpdFN0YXRlUGF0aCAmJiBjdXJyZW50RWRpdFN0YXRlSXNEZWZhdWx0KSB7XG5cdFx0XHRcdC8vIERvIG5vdCBjbGVhciBlZGl0IHN0YXRlIGNvbmRpdGlvbiBpZiBpdCBpcyBhbHJlYWR5IFwiQUxMXCJcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvbiBvZiBzdGF0ZS5maWx0ZXJbY29uZGl0aW9uUGF0aF0pIHtcblx0XHRcdFx0Y29uZGl0aW9uLmZpbHRlcmVkID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUob0ZpbHRlckJhciwgeyBmaWx0ZXI6IHN0YXRlLmZpbHRlciB9KTtcblxuXHRcdC8vIFNldCBlZGl0IHN0YXRlIHRvICdBTEwnIGlmIGl0IHdhc24ndCBiZWZvcmVcblx0XHRpZiAoY3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbiAmJiAhY3VycmVudEVkaXRTdGF0ZUlzRGVmYXVsdCkge1xuXHRcdFx0Y3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbi52YWx1ZXMgPSBbZWRpdFN0YXRlRGVmYXVsdFZhbHVlXTtcblx0XHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUob0ZpbHRlckJhciwgeyBmaWx0ZXI6IHsgW2VkaXRTdGF0ZVBhdGhdOiBbY3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbl0gfSB9KTtcblx0XHR9XG5cblx0XHQvLyBBbGxvdyBhcHAgZGV2ZWxvcGVycyB0byB1cGRhdGUgZmlsdGVycyBhZnRlciBjbGVhcmluZ1xuXHRcdG9GaWx0ZXJCYXIuZ2V0UGFyZW50KCkuZmlyZUFmdGVyQ2xlYXIoKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2xlYXIgdGhlIGZpbHRlciB2YWx1ZSBmb3IgYSBzcGVjaWZpYyBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhpcyBpcyBhIHByZXJlcXVpc2l0ZSBiZWZvcmUgbmV3IHZhbHVlcyBjYW4gYmUgc2V0IGNsZWFubHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgVGhlIGZpbHRlciBiYXIgdGhhdCBjb250YWlucyB0aGUgZmlsdGVyIGZpZWxkXG5cdCAqIEBwYXJhbSBjb25kaXRpb25QYXRoIFRoZSBwYXRoIHRvIHRoZSBwcm9wZXJ0eSBhcyBhIGNvbmRpdGlvbiBwYXRoXG5cdCAqL1xuXHRhc3luYyBfY2xlYXJGaWx0ZXJWYWx1ZShmaWx0ZXJCYXI6IEZpbHRlckJhciwgY29uZGl0aW9uUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1N0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIpO1xuXHRcdGlmIChvU3RhdGUuZmlsdGVyW2NvbmRpdGlvblBhdGhdKSB7XG5cdFx0XHRvU3RhdGUuZmlsdGVyW2NvbmRpdGlvblBhdGhdLmZvckVhY2goKG9Db25kaXRpb246IGFueSkgPT4ge1xuXHRcdFx0XHRvQ29uZGl0aW9uLmZpbHRlcmVkID0gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyLCB7IGZpbHRlcjogeyBbY29uZGl0aW9uUGF0aF06IG9TdGF0ZS5maWx0ZXJbY29uZGl0aW9uUGF0aF0gfSB9KTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCB0aGUgZmlsdGVyIHZhbHVlcyBmb3IgdGhlIGdpdmVuIHByb3BlcnR5IGluIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKiBUaGUgZmlsdGVyIHZhbHVlcyBjYW4gYmUgZWl0aGVyIGEgc2luZ2xlIHZhbHVlIG9yIGFuIGFycmF5IG9mIHZhbHVlcy5cblx0ICogRWFjaCBmaWx0ZXIgdmFsdWUgbXVzdCBiZSByZXByZXNlbnRlZCBhcyBhIHByaW1pdGl2ZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG9GaWx0ZXJCYXIgVGhlIGZpbHRlciBiYXIgdGhhdCBjb250YWlucyB0aGUgZmlsdGVyIGZpZWxkXG5cdCAqIEBwYXJhbSBzQ29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKiBAcGFyYW0gYXJncyBMaXN0IG9mIG9wdGlvbmFsIHBhcmFtZXRlcnNcblx0ICogIFtzT3BlcmF0b3JdIFRoZSBvcGVyYXRvciB0byBiZSB1c2VkIC0gaWYgbm90IHNldCwgdGhlIGRlZmF1bHQgb3BlcmF0b3IgKEVRKSB3aWxsIGJlIHVzZWRcblx0ICogIFt2VmFsdWVzXSBUaGUgdmFsdWVzIHRvIGJlIGFwcGxpZWQgLSBpZiBzT3BlcmF0b3IgaXMgbWlzc2luZywgdlZhbHVlcyBpcyB1c2VkIGFzIDNyZCBwYXJhbWV0ZXJcblx0ICovXG5cdHNldEZpbHRlclZhbHVlczogYXN5bmMgZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSwgc0NvbmRpdGlvblBhdGg6IHN0cmluZywgLi4uYXJnczogYW55KSB7XG5cdFx0bGV0IHNPcGVyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gYXJncz8uWzBdO1xuXHRcdGxldCB2VmFsdWVzOiB1bmRlZmluZWQgfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXSA9IGFyZ3M/LlsxXTtcblxuXHRcdC8vIERvIG5vdGhpbmcgd2hlbiB0aGUgZmlsdGVyIGJhciBpcyBoaWRkZW5cblx0XHRpZiAoIW9GaWx0ZXJCYXIpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBjb21tb24gZmlsdGVyIE9wZXJhdG9ycyBuZWVkIGEgdmFsdWUuIERvIG5vdGhpbmcgaWYgdGhpcyB2YWx1ZSBpcyB1bmRlZmluZWRcblx0XHQvLyBCQ1A6IDIyNzAxMzUyNzRcblx0XHRpZiAoXG5cdFx0XHRhcmdzLmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0KHZWYWx1ZXMgPT09IHVuZGVmaW5lZCB8fCB2VmFsdWVzID09PSBudWxsIHx8IHZWYWx1ZXMgPT09IFwiXCIpICYmXG5cdFx0XHRzT3BlcmF0b3IgJiZcblx0XHRcdE9iamVjdC5rZXlzKEZpbHRlck9wZXJhdG9yKS5pbmRleE9mKHNPcGVyYXRvcikgIT09IC0xXG5cdFx0KSB7XG5cdFx0XHRMb2cud2FybmluZyhgQW4gZW1wdHkgZmlsdGVyIHZhbHVlIGNhbm5vdCBiZSBhcHBsaWVkIHdpdGggdGhlICR7c09wZXJhdG9yfSBvcGVyYXRvcmApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFRoZSA0dGggcGFyYW1ldGVyIGlzIG9wdGlvbmFsOyBpZiBzT3BlcmF0b3IgaXMgbWlzc2luZywgdlZhbHVlcyBpcyB1c2VkIGFzIDNyZCBwYXJhbWV0ZXJcblx0XHQvLyBUaGlzIGRvZXMgbm90IGFwcGx5IGZvciBzZW1hbnRpYyBkYXRlcywgYXMgdGhlc2UgZG8gbm90IHJlcXVpcmUgdlZhbHVlcyAoZXhjZXB0aW9uOiBcIkxBU1REQVlTXCIsIDMpXG5cdFx0aWYgKHZWYWx1ZXMgPT09IHVuZGVmaW5lZCAmJiAhU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldFNlbWFudGljRGF0ZU9wZXJhdGlvbnMoKS5pbmNsdWRlcyhzT3BlcmF0b3IgfHwgXCJcIikpIHtcblx0XHRcdHZWYWx1ZXMgPSBzT3BlcmF0b3IgPz8gW107XG5cdFx0XHRzT3BlcmF0b3IgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgc09wZXJhdG9yIGlzIG5vdCBzZXQsIHVzZSBFUSBhcyBkZWZhdWx0XG5cdFx0aWYgKCFzT3BlcmF0b3IpIHtcblx0XHRcdHNPcGVyYXRvciA9IEZpbHRlck9wZXJhdG9yLkVRO1xuXHRcdH1cblxuXHRcdC8vIFN1cHBvcnRlZCBhcnJheSB0eXBlczpcblx0XHQvLyAgLSBTaW5nbGUgVmFsdWVzOlx0XCIyXCIgfCBbXCIyXCJdXG5cdFx0Ly8gIC0gTXVsdGlwbGUgVmFsdWVzOlx0W1wiMlwiLCBcIjNcIl1cblx0XHQvLyAgLSBSYW5nZXM6XHRcdFx0W1wiMlwiLFwiM1wiXVxuXHRcdC8vIFVuc3VwcG9ydGVkIGFycmF5IHR5cGVzOlxuXHRcdC8vICAtIE11bHRpcGxlIFJhbmdlczpcdFtbXCIyXCIsXCIzXCJdXSB8IFtbXCIyXCIsXCIzXCJdLFtcIjRcIixcIjVcIl1dXG5cdFx0Y29uc3Qgc3VwcG9ydGVkVmFsdWVUeXBlcyA9IFtcInN0cmluZ1wiLCBcIm51bWJlclwiLCBcImJvb2xlYW5cIl07XG5cdFx0aWYgKFxuXHRcdFx0dlZhbHVlcyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHQoKCFBcnJheS5pc0FycmF5KHZWYWx1ZXMpICYmICFzdXBwb3J0ZWRWYWx1ZVR5cGVzLmluY2x1ZGVzKHR5cGVvZiB2VmFsdWVzKSkgfHxcblx0XHRcdFx0KEFycmF5LmlzQXJyYXkodlZhbHVlcykgJiYgdlZhbHVlcy5sZW5ndGggPiAwICYmICFzdXBwb3J0ZWRWYWx1ZVR5cGVzLmluY2x1ZGVzKHR5cGVvZiB2VmFsdWVzWzBdKSkpXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFwiRmlsdGVyVXRpbHMuanMjX3NldEZpbHRlclZhbHVlczogRmlsdGVyIHZhbHVlIG5vdCBzdXBwb3J0ZWQ7IG9ubHkgcHJpbWl0aXZlIHZhbHVlcyBvciBhbiBhcnJheSB0aGVyZW9mIGNhbiBiZSB1c2VkLlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRsZXQgdmFsdWVzOiAoc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwpW10gfCB1bmRlZmluZWQ7XG5cdFx0aWYgKHZWYWx1ZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFsdWVzID0gQXJyYXkuaXNBcnJheSh2VmFsdWVzKSA/IHZWYWx1ZXMgOiBbdlZhbHVlc107XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBsaXN0IGluZm8gb2YgdGhlIHByb3BlcnR5IHRvIGxhdGVyIGNoZWNrIHdoZXRoZXIgdGhlIHZhbHVlcyBleGlzdFxuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPSBhd2FpdCB0aGlzLl9nZXRWYWx1ZUxpc3RJbmZvKG9GaWx0ZXJCYXIsIHNDb25kaXRpb25QYXRoKTtcblxuXHRcdGNvbnN0IGZpbHRlcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXHRcdGlmIChzQ29uZGl0aW9uUGF0aCkge1xuXHRcdFx0aWYgKHZhbHVlcyAmJiB2YWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChzT3BlcmF0b3IgPT09IEZpbHRlck9wZXJhdG9yLkJUKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIG9wZXJhdG9yIEJUIHJlcXVpcmVzIG9uZSBjb25kaXRpb24gd2l0aCBib3RoIHRocmVzaG9sZHNcblx0XHRcdFx0XHRmaWx0ZXJbc0NvbmRpdGlvblBhdGhdID0gW0NvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oc09wZXJhdG9yLCB2YWx1ZXMsIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBSZWd1bGFyIHNpbmdsZSBhbmQgbXVsdGkgdmFsdWUgY29uZGl0aW9ucywgaWYgdGhlcmUgYXJlIG5vIHZhbHVlcywgd2UgZG8gbm90IHdhbnQgYW55IGNvbmRpdGlvbnNcblx0XHRcdFx0XHRmaWx0ZXJbc0NvbmRpdGlvblBhdGhdID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0XHR2YWx1ZXMubWFwKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHQvLyBGb3IgdGhlIEVRIGNhc2UsIHRlbGwgTURDIHRvIHZhbGlkYXRlIHRoZSB2YWx1ZSAoZS5nLiBkaXNwbGF5IHRoZSBkZXNjcmlwdGlvbiksIGlmIGl0IGV4aXN0cyBpbiB0aGUgYXNzb2NpYXRlZCBlbnRpdHksIG90aGVyd2lzZSBuZXZlciB2YWxpZGF0ZVxuXHRcdFx0XHRcdFx0XHRjb25zdCBjb25kaXRpb25WYWxpZGF0ZWRTdGF0dXMgPVxuXHRcdFx0XHRcdFx0XHRcdHNPcGVyYXRvciA9PT0gRmlsdGVyT3BlcmF0b3IuRVFcblx0XHRcdFx0XHRcdFx0XHRcdD8gYXdhaXQgdGhpcy5fZ2V0Q29uZGl0aW9uVmFsaWRhdGVkKHZhbHVlTGlzdEluZm8sIHNDb25kaXRpb25QYXRoLCB2YWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRcdDogQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZDtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihzT3BlcmF0b3IhLCBbdmFsdWVdLCBudWxsLCBudWxsLCBjb25kaXRpb25WYWxpZGF0ZWRTdGF0dXMpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCkuaW5jbHVkZXMoc09wZXJhdG9yIHx8IFwiXCIpKSB7XG5cdFx0XHRcdC8vIHZWYWx1ZXMgaXMgdW5kZWZpbmVkLCBzbyB0aGUgb3BlcmF0b3IgaXMgYSBzZW1hbnRpYyBkYXRlIHRoYXQgZG9lcyBub3QgbmVlZCB2YWx1ZXMgKHNlZSBhYm92ZSlcblx0XHRcdFx0ZmlsdGVyW3NDb25kaXRpb25QYXRoXSA9IFtDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKHNPcGVyYXRvciwgW10sIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQpXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBbHdheXMgY2xlYXIgdGhlIGN1cnJlbnQgdmFsdWUgYXMgd2UgZG8gbm90IHdhbnQgdG8gYWRkIGZpbHRlciB2YWx1ZXMgYnV0IHJlcGxhY2UgdGhlbVxuXHRcdGF3YWl0IHRoaXMuX2NsZWFyRmlsdGVyVmFsdWUob0ZpbHRlckJhciwgc0NvbmRpdGlvblBhdGgpO1xuXG5cdFx0aWYgKGZpbHRlcltzQ29uZGl0aW9uUGF0aF0pIHtcblx0XHRcdC8vIFRoaXMgaXMgbm90IGNhbGxlZCBpbiB0aGUgcmVzZXQgY2FzZSwgaS5lLiBzZXRGaWx0ZXJWYWx1ZShcIlByb3BlcnR5XCIpXG5cdFx0XHRhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyIH0pO1xuXHRcdH1cblx0fSxcblx0Y29uZGl0aW9uVG9Nb2RlbFBhdGg6IGZ1bmN0aW9uIChzQ29uZGl0aW9uUGF0aDogc3RyaW5nKSB7XG5cdFx0Ly8gbWFrZSB0aGUgcGF0aCB1c2FibGUgYXMgbW9kZWwgcHJvcGVydHksIHRoZXJlZm9yZSBzbGFzaGVzIGJlY29tZSBiYWNrc2xhc2hlc1xuXHRcdHJldHVybiBzQ29uZGl0aW9uUGF0aC5yZXBsYWNlKC9cXC8vZywgXCJcXFxcXCIpO1xuXHR9LFxuXHRfZ2V0RmlsdGVyTWV0YU1vZGVsOiBmdW5jdGlvbiAob0ZpbHRlckNvbnRyb2w6IGFueSwgbWV0YU1vZGVsPzogTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIG1ldGFNb2RlbCB8fCBvRmlsdGVyQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHR9LFxuXHRfZ2V0RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKHNFbnRpdHlUeXBlUGF0aDogYW55KSB7XG5cdFx0cmV0dXJuIHNFbnRpdHlUeXBlUGF0aCAmJiBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aCk7XG5cdH0sXG5cblx0X2dldEZpZWxkc0ZvclRhYmxlOiBmdW5jdGlvbiAob0ZpbHRlckNvbnRyb2w6IGFueSwgc0VudGl0eVR5cGVQYXRoPzogYW55KSB7XG5cdFx0Y29uc3QgbHJUYWJsZXM6IGFueVtdID0gW107XG5cdFx0LyoqXG5cdFx0ICogR2V0cyBmaWVsZHMgZnJvbVxuXHRcdCAqIFx0LSBkaXJlY3QgZW50aXR5IHByb3BlcnRpZXMsXG5cdFx0ICogXHQtIG5hdmlnYXRlUHJvcGVydGllcyBrZXkgaW4gdGhlIG1hbmlmZXN0IGlmIHRoZXNlIHByb3BlcnRpZXMgYXJlIGtub3duIGJ5IHRoZSBlbnRpdHlcblx0XHQgKiAgLSBhbm5vdGF0aW9uIFwiU2VsZWN0aW9uRmllbGRzXCJcblx0XHQgKi9cblx0XHRpZiAoc0VudGl0eVR5cGVQYXRoKSB7XG5cdFx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0ZpbHRlckNvbnRyb2wpO1xuXHRcdFx0Y29uc3QgdGFibGVDb250cm9scyA9XG5cdFx0XHRcdG9WaWV3ICYmXG5cdFx0XHRcdG9WaWV3LmdldENvbnRyb2xsZXIoKSAmJlxuXHRcdFx0XHQob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX2dldENvbnRyb2xzICYmXG5cdFx0XHRcdChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5fZ2V0Q29udHJvbHMoXCJ0YWJsZVwiKTsgLy9bMF0uZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCk7XG5cdFx0XHRpZiAodGFibGVDb250cm9scykge1xuXHRcdFx0XHR0YWJsZUNvbnRyb2xzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRcdFx0bHJUYWJsZXMucHVzaChvVGFibGUuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBsclRhYmxlcztcblx0XHR9XG5cdFx0cmV0dXJuIFtdO1xuXHR9LFxuXHRfZ2V0U2VsZWN0aW9uRmllbGRzOiBmdW5jdGlvbiAoXG5cdFx0b0ZpbHRlckNvbnRyb2w6IGFueSxcblx0XHRzRW50aXR5VHlwZVBhdGg6IHN0cmluZyxcblx0XHRzRmlsdGVyRW50aXR5VHlwZVBhdGg6IHN0cmluZyxcblx0XHRjb250ZXh0UGF0aDogc3RyaW5nLFxuXHRcdGxyVGFibGVzOiBhbnlbXSxcblx0XHRvTWV0YU1vZGVsOiBhbnksXG5cdFx0b0NvbnZlcnRlckNvbnRleHQ6IGFueSxcblx0XHRpbmNsdWRlSGlkZGVuPzogYm9vbGVhbixcblx0XHRvTW9kaWZpZXI/OiBhbnksXG5cdFx0bGluZUl0ZW1UZXJtPzogc3RyaW5nXG5cdCkge1xuXHRcdGxldCBhU2VsZWN0aW9uRmllbGRzID0gRmlsdGVyQmFyQ29udmVydGVyLmdldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdG9Db252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0bHJUYWJsZXMsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0bGluZUl0ZW1UZXJtXG5cdFx0KS5zZWxlY3Rpb25GaWVsZHM7XG5cdFx0aWYgKFxuXHRcdFx0KG9Nb2RpZmllclxuXHRcdFx0XHQ/IG9Nb2RpZmllci5nZXRDb250cm9sVHlwZShvRmlsdGVyQ29udHJvbCkgPT09IFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJcIlxuXHRcdFx0XHQ6IG9GaWx0ZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpKSAmJlxuXHRcdFx0c0VudGl0eVR5cGVQYXRoICE9PSBzRmlsdGVyRW50aXR5VHlwZVBhdGhcblx0XHQpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogV2UgYXJlIG9uIG11bHRpIGVudGl0eSBzZXRzIHNjZW5hcmlvIHNvIHdlIGFkZCBhbm5vdGF0aW9uIFwiU2VsZWN0aW9uRmllbGRzXCJcblx0XHRcdCAqIGZyb20gRmlsdGVyQmFyIGVudGl0eSBpZiB0aGVzZSBwcm9wZXJ0aWVzIGFyZSBrbm93biBieSB0aGUgZW50aXR5XG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChjb250ZXh0UGF0aCkpO1xuXHRcdFx0Y29uc3Qgb1BhZ2VDb250ZXh0ID0gb0NvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihzRmlsdGVyRW50aXR5VHlwZVBhdGgpO1xuXHRcdFx0Y29uc3QgYUZpbHRlckJhclNlbGVjdGlvbkZpZWxkc0Fubm90YXRpb246IGFueSA9XG5cdFx0XHRcdG9QYWdlQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIikuYW5ub3RhdGlvbiB8fCBbXTtcblx0XHRcdGNvbnN0IG1hcFNlbGVjdGlvbkZpZWxkczogYW55ID0ge307XG5cdFx0XHRhU2VsZWN0aW9uRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9TZWxlY3Rpb25GaWVsZDogYW55KSB7XG5cdFx0XHRcdG1hcFNlbGVjdGlvbkZpZWxkc1tvU2VsZWN0aW9uRmllbGQuY29uZGl0aW9uUGF0aF0gPSB0cnVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFGaWx0ZXJCYXJTZWxlY3Rpb25GaWVsZHNBbm5vdGF0aW9uLmZvckVhY2goZnVuY3Rpb24gKG9GaWx0ZXJCYXJTZWxlY3Rpb25GaWVsZEFubm90YXRpb246IGFueSkge1xuXHRcdFx0XHRjb25zdCBzUGF0aCA9IG9GaWx0ZXJCYXJTZWxlY3Rpb25GaWVsZEFubm90YXRpb24udmFsdWU7XG5cdFx0XHRcdGlmICghbWFwU2VsZWN0aW9uRmllbGRzW3NQYXRoXSkge1xuXHRcdFx0XHRcdGNvbnN0IG9GaWx0ZXJGaWVsZCA9IEZpbHRlckJhckNvbnZlcnRlci5nZXRGaWx0ZXJGaWVsZChcblx0XHRcdFx0XHRcdHNQYXRoLFxuXHRcdFx0XHRcdFx0b0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRvVmlzdWFsaXphdGlvbk9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQuZW50aXR5VHlwZVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0aWYgKG9GaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRcdFx0YVNlbGVjdGlvbkZpZWxkcy5wdXNoKG9GaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKGFTZWxlY3Rpb25GaWVsZHMpIHtcblx0XHRcdGNvbnN0IGZpZWxkTmFtZXM6IGFueVtdID0gW107XG5cdFx0XHRhU2VsZWN0aW9uRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9GaWVsZDogYW55KSB7XG5cdFx0XHRcdGZpZWxkTmFtZXMucHVzaChvRmllbGQua2V5KTtcblx0XHRcdH0pO1xuXHRcdFx0YVNlbGVjdGlvbkZpZWxkcyA9IHRoaXMuX2dldFNlbGVjdGlvbkZpZWxkc0Zyb21Qcm9wZXJ0eUluZm9zKG9GaWx0ZXJDb250cm9sLCBmaWVsZE5hbWVzLCBhU2VsZWN0aW9uRmllbGRzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFTZWxlY3Rpb25GaWVsZHM7XG5cdH0sXG5cdF9nZXRTZWxlY3Rpb25GaWVsZHNGcm9tUHJvcGVydHlJbmZvczogZnVuY3Rpb24gKG9GaWx0ZXJDb250cm9sOiBhbnksIGZpZWxkTmFtZXM6IGFueSwgYVNlbGVjdGlvbkZpZWxkczogYW55KSB7XG5cdFx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzID0gKG9GaWx0ZXJDb250cm9sLmdldFByb3BlcnR5SW5mbyAmJiBvRmlsdGVyQ29udHJvbC5nZXRQcm9wZXJ0eUluZm8oKSkgfHwgW107XG5cdFx0cHJvcGVydHlJbmZvRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wOiBhbnkpIHtcblx0XHRcdGlmIChvUHJvcC5uYW1lID09PSBcIiRzZWFyY2hcIiB8fCBvUHJvcC5uYW1lID09PSBcIiRlZGl0U3RhdGVcIikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZWxGaWVsZCA9IGFTZWxlY3Rpb25GaWVsZHNbZmllbGROYW1lcy5pbmRleE9mKG9Qcm9wLmtleSldO1xuXHRcdFx0aWYgKGZpZWxkTmFtZXMuaW5kZXhPZihvUHJvcC5rZXkpICE9PSAtMSAmJiBzZWxGaWVsZC5hbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRvUHJvcC5ncm91cCA9IHNlbEZpZWxkLmdyb3VwO1xuXHRcdFx0XHRvUHJvcC5ncm91cExhYmVsID0gc2VsRmllbGQuZ3JvdXBMYWJlbDtcblx0XHRcdFx0b1Byb3Auc2V0dGluZ3MgPSBzZWxGaWVsZC5zZXR0aW5ncztcblx0XHRcdFx0b1Byb3AudmlzdWFsRmlsdGVyID0gc2VsRmllbGQudmlzdWFsRmlsdGVyO1xuXHRcdFx0XHRvUHJvcC5sYWJlbCA9IHNlbEZpZWxkLmxhYmVsO1xuXHRcdFx0XHRhU2VsZWN0aW9uRmllbGRzW2ZpZWxkTmFtZXMuaW5kZXhPZihvUHJvcC5rZXkpXSA9IG9Qcm9wO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZmllbGROYW1lcy5pbmRleE9mKG9Qcm9wLmtleSkgPT09IC0xICYmICFvUHJvcC5hbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRhU2VsZWN0aW9uRmllbGRzLnB1c2gob1Byb3ApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhU2VsZWN0aW9uRmllbGRzO1xuXHR9LFxuXHRfZ2V0U2VhcmNoRmllbGQ6IGZ1bmN0aW9uIChvSUZpbHRlcjogYW55LCBhSWdub3JlUHJvcGVydGllczogYW55KSB7XG5cdFx0cmV0dXJuIG9JRmlsdGVyLmdldFNlYXJjaCAmJiBhSWdub3JlUHJvcGVydGllcy5pbmRleE9mKFwic2VhcmNoXCIpID09PSAtMSA/IG9JRmlsdGVyLmdldFNlYXJjaCgpIDogbnVsbDtcblx0fSxcblx0X2dldEZpbHRlckNvbmRpdGlvbnM6IGZ1bmN0aW9uIChtUHJvcGVydGllczogYW55LCBtRmlsdGVyQ29uZGl0aW9uczogYW55LCBvSUZpbHRlcjogYW55KSB7XG5cdFx0Y29uc3QgbUNvbmRpdGlvbnMgPSBtRmlsdGVyQ29uZGl0aW9ucyB8fCBvSUZpbHRlci5nZXRDb25kaXRpb25zKCk7XG5cdFx0aWYgKG1Qcm9wZXJ0aWVzICYmIG1Qcm9wZXJ0aWVzLnRhcmdldENvbnRyb2wgJiYgbVByb3BlcnRpZXMudGFyZ2V0Q29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhtQ29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdGlmIChzS2V5ID09PSBcIiRlZGl0U3RhdGVcIikge1xuXHRcdFx0XHRcdGRlbGV0ZSBtQ29uZGl0aW9uc1tcIiRlZGl0U3RhdGVcIl07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gbUNvbmRpdGlvbnM7XG5cdH0sXG5cdF9nZXRGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGE6IGZ1bmN0aW9uIChhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhOiBhbnksIG9JRmlsdGVyOiBhbnkpIHtcblx0XHRpZiAoIShhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhICYmIGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEubGVuZ3RoKSkge1xuXHRcdFx0aWYgKG9JRmlsdGVyLmdldFByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhID0gb0lGaWx0ZXIuZ2V0UHJvcGVydHlJbmZvKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhID0gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGE7XG5cdH0sXG5cdF9nZXRJZ25vcmVkUHJvcGVydGllczogZnVuY3Rpb24gKGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGE6IGFueSwgbUVudGl0eVByb3BlcnRpZXM6IGFueSkge1xuXHRcdGNvbnN0IGFJZ25vcmVQcm9wZXJ0aWVzOiBhbnkgPSBbXTtcblx0XHRhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhLmZvckVhY2goZnVuY3Rpb24gKG9JRmlsdGVyUHJvcGVydHk6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0lGaWx0ZXJQcm9wZXJ0eU5hbWUgPSBvSUZpbHRlclByb3BlcnR5Lm5hbWU7XG5cdFx0XHRjb25zdCBtRW50aXR5UHJvcGVydGllc0N1cnJlbnQgPSBtRW50aXR5UHJvcGVydGllc1tzSUZpbHRlclByb3BlcnR5TmFtZV07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG1FbnRpdHlQcm9wZXJ0aWVzQ3VycmVudCAmJlxuXHRcdFx0XHQoIW1FbnRpdHlQcm9wZXJ0aWVzQ3VycmVudFtcImhhc1Byb3BlcnR5XCJdIHx8XG5cdFx0XHRcdFx0KG1FbnRpdHlQcm9wZXJ0aWVzQ3VycmVudFtcImhhc1Byb3BlcnR5XCJdICYmIG9JRmlsdGVyUHJvcGVydHkuZGF0YVR5cGUgIT09IG1FbnRpdHlQcm9wZXJ0aWVzQ3VycmVudC5kYXRhVHlwZSkpXG5cdFx0XHQpIHtcblx0XHRcdFx0YUlnbm9yZVByb3BlcnRpZXMucHVzaChzSUZpbHRlclByb3BlcnR5TmFtZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFJZ25vcmVQcm9wZXJ0aWVzO1xuXHR9LFxuXHRnZXRGaWx0ZXJzOiBmdW5jdGlvbiAoZmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRjb25zdCB7IHBhcmFtZXRlcnMsIGZpbHRlcnMsIHNlYXJjaCB9ID0gdGhpcy5nZXRGaWx0ZXJJbmZvKGZpbHRlckJhcik7XG5cblx0XHRyZXR1cm4geyBwYXJhbWV0ZXJzLCBmaWx0ZXJzLCBzZWFyY2ggfTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgb0ZpbHRlclV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFnQ0EsTUFBTUEsWUFBWSxHQUFHO0lBQ3BCQyxTQUFTLEVBQUUsVUFBVUMsUUFBYSxFQUFF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