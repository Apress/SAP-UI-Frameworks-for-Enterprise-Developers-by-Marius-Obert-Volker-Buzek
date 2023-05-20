/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/formatters/TableFormatterTypes", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/EntitySetHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/internal/helpers/ActionHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../ManifestSettings", "./Criticality", "./table/StandardActions"], function (DataField, Action, BindingHelper, ConfigurableObject, IssueManager, Key, tableFormatters, TableFormatterTypes, BindingToolkit, ModelHelper, StableIdHelper, TypeGuards, DataModelPathHelper, DisplayModeFormatter, EntitySetHelper, PropertyHelper, UIFormatters, ActionHelper, Core, Aggregation, DataFieldHelper, ID, ManifestSettings, Criticality, StandardActions) {
  "use strict";

  var _exports = {};
  var isInDisplayMode = StandardActions.isInDisplayMode;
  var isDraftOrStickySupported = StandardActions.isDraftOrStickySupported;
  var getStandardActionPaste = StandardActions.getStandardActionPaste;
  var getStandardActionMassEdit = StandardActions.getStandardActionMassEdit;
  var getStandardActionDelete = StandardActions.getStandardActionDelete;
  var getStandardActionCreate = StandardActions.getStandardActionCreate;
  var getRestrictions = StandardActions.getRestrictions;
  var getMassEditVisibility = StandardActions.getMassEditVisibility;
  var getInsertUpdateActionsTemplating = StandardActions.getInsertUpdateActionsTemplating;
  var getDeleteVisibility = StandardActions.getDeleteVisibility;
  var getCreationRow = StandardActions.getCreationRow;
  var generateStandardActionsContext = StandardActions.generateStandardActionsContext;
  var getMessageTypeFromCriticalityType = Criticality.getMessageTypeFromCriticalityType;
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var SelectionMode = ManifestSettings.SelectionMode;
  var Importance = ManifestSettings.Importance;
  var HorizontalAlign = ManifestSettings.HorizontalAlign;
  var CreationMode = ManifestSettings.CreationMode;
  var ActionType = ManifestSettings.ActionType;
  var getTableID = ID.getTableID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var AggregationHelper = Aggregation.AggregationHelper;
  var isMultiValueField = UIFormatters.isMultiValueField;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getNonSortablePropertiesRestrictions = EntitySetHelper.getNonSortablePropertiesRestrictions;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathSearchable = DataModelPathHelper.isPathSearchable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isTypeDefinition = TypeGuards.isTypeDefinition;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isAnnotationOfType = TypeGuards.isAnnotationOfType;
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var EDM_TYPE_MAPPING = BindingToolkit.EDM_TYPE_MAPPING;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var MessageType = TableFormatterTypes.MessageType;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getCopyAction = Action.getCopyAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var dataFieldIsCopyAction = Action.dataFieldIsCopyAction;
  var isDataPointFromDataFieldDefault = DataField.isDataPointFromDataFieldDefault;
  var isDataFieldTypes = DataField.isDataFieldTypes;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var getTargetValueOnDataPoint = DataField.getTargetValueOnDataPoint;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  var getDataFieldDataType = DataField.getDataFieldDataType;
  var collectRelatedPropertiesRecursively = DataField.collectRelatedPropertiesRecursively;
  var collectRelatedProperties = DataField.collectRelatedProperties;
  var ColumnType; // Custom Column from Manifest
  (function (ColumnType) {
    ColumnType["Default"] = "Default";
    ColumnType["Annotation"] = "Annotation";
    ColumnType["Slot"] = "Slot";
  })(ColumnType || (ColumnType = {}));
  /**
   * Returns an array of all annotation-based and manifest-based table actions.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns The complete table actions
   */
  function getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    const aTableActions = getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext);
    const aAnnotationActions = aTableActions.tableActions;
    const aHiddenActions = aTableActions.hiddenTableActions;
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions, navigationSettings, true, aHiddenActions);
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enableOnSelect: OverrideType.overwrite,
      enableAutoScroll: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const actions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions,
      commandActions: manifestActions.commandActions
    };
  }

  /**
   * Returns an array of all columns, annotation-based as well as manifest based.
   * They are sorted and some properties can be overwritten via the manifest (check out the keys that can be overwritten).
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns Returns all table columns that should be available, regardless of templating or personalization or their origin
   */
  _exports.getTableActions = getTableActions;
  function getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    const annotationColumns = getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext);
    const manifestColumns = getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, annotationColumns, converterContext, converterContext.getAnnotationEntityType(lineItemAnnotation), navigationSettings);
    return insertCustomElements(annotationColumns, manifestColumns, {
      width: OverrideType.overwrite,
      importance: OverrideType.overwrite,
      horizontalAlign: OverrideType.overwrite,
      availability: OverrideType.overwrite,
      isNavigable: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      formatOptions: OverrideType.overwrite
    });
  }

  /**
   * Retrieve the custom aggregation definitions from the entityType.
   *
   * @param entityType The target entity type.
   * @param tableColumns The array of columns for the entity type.
   * @param converterContext The converter context.
   * @returns The aggregate definitions from the entityType, or undefined if the entity doesn't support analytical queries.
   */
  _exports.getTableColumns = getTableColumns;
  const getAggregateDefinitionsFromEntityType = function (entityType, tableColumns, converterContext) {
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    function findColumnFromPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    if (!aggregationHelper.isAnalyticsSupported()) {
      return undefined;
    }

    // Keep a set of all currency/unit properties, as we don't want to consider them as aggregates
    // They are aggregates for technical reasons (to manage multi-units situations) but it doesn't make sense from a user standpoint
    const currencyOrUnitProperties = new Set();
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.unit) {
        currencyOrUnitProperties.add(tableColumn.unit);
      }
    });
    const customAggregateAnnotations = aggregationHelper.getCustomAggregateDefinitions();
    const definitions = {};
    customAggregateAnnotations.forEach(annotation => {
      const aggregatedProperty = aggregationHelper._entityType.entityProperties.find(property => {
        return property.name === annotation.qualifier;
      });
      if (aggregatedProperty) {
        var _annotation$annotatio, _annotation$annotatio2;
        const contextDefiningProperties = (_annotation$annotatio = annotation.annotations) === null || _annotation$annotatio === void 0 ? void 0 : (_annotation$annotatio2 = _annotation$annotatio.Aggregation) === null || _annotation$annotatio2 === void 0 ? void 0 : _annotation$annotatio2.ContextDefiningProperties;
        definitions[aggregatedProperty.name] = contextDefiningProperties ? contextDefiningProperties.map(ctxDefProperty => {
          return ctxDefProperty.value;
        }) : [];
      }
    });
    const result = {};
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.propertyInfos === undefined && tableColumn.relativePath) {
        const rawContextDefiningProperties = definitions[tableColumn.relativePath];

        // Ignore aggregates corresponding to currencies or units of measure
        if (rawContextDefiningProperties && !currencyOrUnitProperties.has(tableColumn.name)) {
          result[tableColumn.name] = {
            defaultAggregate: {},
            relativePath: tableColumn.relativePath
          };
          const contextDefiningProperties = [];
          rawContextDefiningProperties.forEach(contextDefiningPropertyName => {
            const foundColumn = findColumnFromPath(contextDefiningPropertyName);
            if (foundColumn) {
              contextDefiningProperties.push(foundColumn.name);
            }
          });
          if (contextDefiningProperties.length) {
            result[tableColumn.name].defaultAggregate.contextDefiningProperties = contextDefiningProperties;
          }
        }
      }
    });
    return result;
  };

  /**
   * Updates a table visualization for analytical use cases.
   *
   * @param tableVisualization The visualization to be updated
   * @param entityType The entity type displayed in the table
   * @param converterContext The converter context
   * @param presentationVariantAnnotation The presentationVariant annotation (if any)
   */
  _exports.getAggregateDefinitionsFromEntityType = getAggregateDefinitionsFromEntityType;
  function updateTableVisualizationForType(tableVisualization, entityType, converterContext, presentationVariantAnnotation) {
    if (tableVisualization.control.type === "AnalyticalTable") {
      const aggregatesDefinitions = getAggregateDefinitionsFromEntityType(entityType, tableVisualization.columns, converterContext),
        aggregationHelper = new AggregationHelper(entityType, converterContext);
      if (aggregatesDefinitions) {
        tableVisualization.enableAnalytics = true;
        tableVisualization.enable$select = false;
        tableVisualization.enable$$getKeepAliveContext = false;
        tableVisualization.aggregates = aggregatesDefinitions;
        _updatePropertyInfosWithAggregatesDefinitions(tableVisualization);
        const allowedTransformations = aggregationHelper.getAllowedTransformations();
        tableVisualization.enableBasicSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;

        // Add group and sort conditions from the presentation variant
        tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
        tableVisualization.annotation.aggregateConditions = getAggregateConditions(presentationVariantAnnotation, tableVisualization.columns);
      }
      tableVisualization.control.type = "GridTable"; // AnalyticalTable isn't a real type for the MDC:Table, so we always switch back to Grid
    } else if (tableVisualization.control.type === "ResponsiveTable") {
      tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
    } else if (tableVisualization.control.type === "TreeTable") {
      const aggregationHelper = new AggregationHelper(entityType, converterContext);
      const allowedTransformations = aggregationHelper.getAllowedTransformations();
      tableVisualization.enableBasicSearch = allowedTransformations ? allowedTransformations.includes("search") : true;
      tableVisualization.enable$$getKeepAliveContext = false;
    }
  }

  /**
   * Get the navigation target path from manifest settings.
   *
   * @param converterContext The converter context
   * @param navigationPropertyPath The navigation path to check in the manifest settings
   * @returns Navigation path from manifest settings
   */
  _exports.updateTableVisualizationForType = updateTableVisualizationForType;
  function getNavigationTargetPath(converterContext, navigationPropertyPath) {
    const manifestWrapper = converterContext.getManifestWrapper();
    if (navigationPropertyPath && manifestWrapper.getNavigationConfiguration(navigationPropertyPath)) {
      const navConfig = manifestWrapper.getNavigationConfiguration(navigationPropertyPath);
      if (Object.keys(navConfig).length > 0) {
        return navigationPropertyPath;
      }
    }
    const dataModelPath = converterContext.getDataModelObjectPath();
    const contextPath = converterContext.getContextPath();
    const navConfigForContextPath = manifestWrapper.getNavigationConfiguration(contextPath);
    if (navConfigForContextPath && Object.keys(navConfigForContextPath).length > 0) {
      return contextPath;
    }
    return dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
  }

  /**
   * Sets the 'unit' and 'textArrangement' properties in columns when necessary.
   *
   * @param entityType The entity type displayed in the table
   * @param tableColumns The columns to be updated
   */
  function updateLinkedProperties(entityType, tableColumns) {
    function findColumnByPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    tableColumns.forEach(oColumn => {
      const oTableColumn = oColumn;
      if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
        const oProperty = entityType.entityProperties.find(oProp => oProp.name === oTableColumn.relativePath);
        if (oProperty) {
          var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation7;
          const oUnit = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
          const oTimezone = getAssociatedTimezoneProperty(oProperty);
          const sTimezone = oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Timezone;
          if (oUnit) {
            const oUnitColumn = findColumnByPath(oUnit.name);
            oTableColumn.unit = oUnitColumn === null || oUnitColumn === void 0 ? void 0 : oUnitColumn.name;
          } else {
            var _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
            const sUnit = (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) || (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation5 = oProperty.annotations) === null || _oProperty$annotation5 === void 0 ? void 0 : (_oProperty$annotation6 = _oProperty$annotation5.Measures) === null || _oProperty$annotation6 === void 0 ? void 0 : _oProperty$annotation6.Unit);
            if (sUnit) {
              oTableColumn.unitText = `${sUnit}`;
            }
          }
          if (oTimezone) {
            const oTimezoneColumn = findColumnByPath(oTimezone.name);
            oTableColumn.timezone = oTimezoneColumn === null || oTimezoneColumn === void 0 ? void 0 : oTimezoneColumn.name;
          } else if (sTimezone) {
            oTableColumn.timezoneText = sTimezone.toString();
          }
          const displayMode = getDisplayMode(oProperty),
            textAnnotation = (_oProperty$annotation7 = oProperty.annotations.Common) === null || _oProperty$annotation7 === void 0 ? void 0 : _oProperty$annotation7.Text;
          if (isPathAnnotationExpression(textAnnotation) && displayMode !== "Value") {
            const oTextColumn = findColumnByPath(textAnnotation.path);
            if (oTextColumn && oTextColumn.name !== oTableColumn.name) {
              oTableColumn.textArrangement = {
                textProperty: oTextColumn.name,
                mode: displayMode
              };
            }
          }
        }
      }
    });
  }
  _exports.updateLinkedProperties = updateLinkedProperties;
  function getSemanticKeysAndTitleInfo(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4, _converterContext$get5, _converterContext$get6, _converterContext$get7, _converterContext$get8, _converterContext$get9, _converterContext$get10, _converterContext$get11, _converterContext$get12, _converterContext$get13;
    const headerInfoTitlePath = (_converterContext$get = converterContext.getAnnotationEntityType()) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.UI) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.HeaderInfo) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.Title) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Value) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.path;
    const semanticKeyAnnotations = (_converterContext$get7 = converterContext.getAnnotationEntityType()) === null || _converterContext$get7 === void 0 ? void 0 : (_converterContext$get8 = _converterContext$get7.annotations) === null || _converterContext$get8 === void 0 ? void 0 : (_converterContext$get9 = _converterContext$get8.Common) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.SemanticKey;
    const headerInfoTypeName = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get10 = converterContext.getAnnotationEntityType()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.UI) === null || _converterContext$get12 === void 0 ? void 0 : (_converterContext$get13 = _converterContext$get12.HeaderInfo) === null || _converterContext$get13 === void 0 ? void 0 : _converterContext$get13.TypeName;
    const semanticKeyColumns = [];
    if (semanticKeyAnnotations) {
      semanticKeyAnnotations.forEach(function (oColumn) {
        semanticKeyColumns.push(oColumn.value);
      });
    }
    return {
      headerInfoTitlePath,
      semanticKeyColumns,
      headerInfoTypeName
    };
  }
  function createTableVisualization(lineItemAnnotation, visualizationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration) {
    const tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext, isCondensedTableLayoutCompliant);
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationTargetPath);
    const columns = getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    const operationAvailableMap = getOperationAvailableMap(lineItemAnnotation, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const tableActions = getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfig, columns, presentationVariantAnnotation, viewConfiguration),
      control: tableManifestConfig,
      actions: removeDuplicateActions(tableActions.actions),
      commandActions: tableActions.commandActions,
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getAnnotationEntityType(lineItemAnnotation), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getAnnotationEntityType(lineItemAnnotation), converterContext, presentationVariantAnnotation);
    return oVisualization;
  }
  _exports.createTableVisualization = createTableVisualization;
  function createDefaultTableVisualization(converterContext, isBlankTable) {
    const tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext, false);
    const columns = getColumnsFromEntityType({}, converterContext.getEntityType(), [], [], converterContext, tableManifestConfig.type, []);
    const operationAvailableMap = getOperationAvailableMap(undefined, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig, isBlankTable ? [] : columns),
      control: tableManifestConfig,
      actions: [],
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getEntityType(), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getEntityType(), converterContext);
    return oVisualization;
  }

  /**
   * Gets the map of Core.OperationAvailable property paths for all DataFieldForActions.
   *
   * @param lineItemAnnotation The instance of the line item
   * @param converterContext The instance of the converter context
   * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
   */
  _exports.createDefaultTableVisualization = createDefaultTableVisualization;
  function getOperationAvailableMap(lineItemAnnotation, converterContext) {
    return ActionHelper.getOperationAvailableMap(lineItemAnnotation, "table", converterContext);
  }

  /**
   * Gets updatable propertyPath for the current entityset if valid.
   *
   * @param converterContext The instance of the converter context
   * @returns The updatable property for the rows
   */
  function getCurrentEntitySetUpdatablePath(converterContext) {
    var _entitySet$annotation, _entitySet$annotation2;
    const restrictions = getRestrictions(converterContext);
    const entitySet = converterContext.getEntitySet();
    const updatable = restrictions.isUpdatable;
    const isOnlyDynamicOnCurrentEntity = !isConstant(updatable.expression) && updatable.navigationExpression._type === "Unresolvable";
    const updatableExpression = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.UpdateRestrictions) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.Updatable;
    const updatablePropertyPath = isPathAnnotationExpression(updatableExpression) && updatableExpression.path;
    return isOnlyDynamicOnCurrentEntity ? updatablePropertyPath : "";
  }

  /**
   * Method to retrieve all property paths assigned to the Core.OperationAvailable annotation.
   *
   * @param operationAvailableMap The record consisting of actions and their Core.OperationAvailable property paths
   * @param converterContext The instance of the converter context
   * @returns The CSV string of all property paths associated with the Core.OperationAvailable annotation
   */
  function getOperationAvailableProperties(operationAvailableMap, converterContext) {
    const properties = new Set();
    for (const actionName in operationAvailableMap) {
      const propertyName = operationAvailableMap[actionName];
      if (propertyName === null) {
        // Annotation configured with explicit 'null' (action advertisement relevant)
        properties.add(actionName);
      } else if (typeof propertyName === "string") {
        // Add property paths and not Constant values.
        properties.add(propertyName);
      }
    }
    if (properties.size) {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5;
      // Some actions have an operation available based on property --> we need to load the HeaderInfo.Title property
      // so that the dialog on partial actions is displayed properly (BCP 2180271425)
      const entityType = converterContext.getEntityType();
      const titleProperty = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.HeaderInfo) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.Title) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.Value) === null || _entityType$annotatio5 === void 0 ? void 0 : _entityType$annotatio5.path;
      if (titleProperty) {
        properties.add(titleProperty);
      }
    }
    return Array.from(properties).join(",");
  }

  /**
   * Iterates over the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * returns all the UI.Hidden annotation expressions.
   *
   * @param lineItemAnnotation Collection of data fields used for representation in a table or list
   * @param currentEntityType Current entity type
   * @param contextDataModelObjectPath Object path of the data model
   * @param isEntitySet
   * @returns All the `UI.Hidden` path expressions found in the relevant actions
   */
  function getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, currentEntityType, contextDataModelObjectPath, isEntitySet) {
    const aUiHiddenPathExpressions = [];
    lineItemAnnotation.forEach(dataField => {
      var _dataField$ActionTarg, _dataField$Inline;
      // Check if the lineItem context is the same as that of the action:
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField !== null && dataField !== void 0 && (_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType) || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && dataField.RequiresContext && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) !== true) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (typeof ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === "object") {
          aUiHiddenPathExpressions.push(equal(getBindingExpFromContext(dataField, contextDataModelObjectPath, isEntitySet), false));
        }
      }
    });
    return aUiHiddenPathExpressions;
  }

  /**
   * This method is used to change the context currently referenced by this binding by removing the last navigation property.
   *
   * It is used (specifically in this case), to transform a binding made for a NavProp context /MainObject/NavProp1/NavProp2,
   * into a binding on the previous context /MainObject/NavProp1.
   *
   * @param source DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction
   * @param contextDataModelObjectPath DataModelObjectPath
   * @param isEntitySet
   * @returns The binding expression
   */
  function getBindingExpFromContext(source, contextDataModelObjectPath, isEntitySet) {
    let sExpression;
    if ((source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || (source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
      var _annotations, _annotations$UI;
      sExpression = source === null || source === void 0 ? void 0 : (_annotations = source.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$UI = _annotations.UI) === null || _annotations$UI === void 0 ? void 0 : _annotations$UI.Hidden;
    } else {
      sExpression = source === null || source === void 0 ? void 0 : source.visible;
    }
    let sPath;
    if (isPathAnnotationExpression(sExpression)) {
      sPath = sExpression.path;
    } else {
      sPath = sExpression;
    }
    if (sPath) {
      if (source !== null && source !== void 0 && source.visible) {
        sPath = sPath.substring(1, sPath.length - 1);
      }
      if (sPath.indexOf("/") > 0) {
        //check if the navigation property is correct:
        const aSplitPath = sPath.split("/");
        const sNavigationPath = aSplitPath[0];
        if (isNavigationProperty(contextDataModelObjectPath === null || contextDataModelObjectPath === void 0 ? void 0 : contextDataModelObjectPath.targetObject) && contextDataModelObjectPath.targetObject.partner === sNavigationPath) {
          return pathInModel(aSplitPath.slice(1).join("/"));
        } else {
          return constant(true);
        }
        // In case there is no navigation property, if it's an entitySet, the expression binding has to be returned:
      } else if (isEntitySet) {
        return pathInModel(sPath);
        // otherwise the expression binding cannot be taken into account for the selection mode evaluation:
      } else {
        return constant(true);
      }
    }
    return constant(true);
  }

  /**
   * Loop through the manifest actions and check the following:
   *
   * If the data field is also referenced as a custom action.
   * If the underlying manifest action is either a bound action or has the 'RequiresContext' property set to true.
   *
   * If so, the 'requiresSelection' property is forced to 'true' in the manifest.
   *
   * @param dataFieldId Id of the DataField evaluated
   * @param dataField DataField evaluated
   * @param manifestActions The actions defined in the manifest
   * @returns `true` if the DataField is found among the manifest actions
   */
  function updateManifestActionAndTagIt(dataFieldId, dataField, manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      if (actionKey === dataFieldId) {
        var _ActionTarget;
        if (dataField !== null && dataField !== void 0 && (_ActionTarget = dataField.ActionTarget) !== null && _ActionTarget !== void 0 && _ActionTarget.isBound || dataField !== null && dataField !== void 0 && dataField.RequiresContext) {
          manifestActions[dataFieldId].requiresSelection = true;
        }
        return true;
      }
      return false;
    });
  }

  /**
   * Loop through the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * check the following:
   * If at least one of them is always visible in the table toolbar and requires a context
   * If an action is also defined in the manifest, it is set aside and will be considered
   * when going through the manifest.
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param manifestActions The actions defined in the manifest
   * @param currentEntityType Current Entity Type
   * @returns `true` if there is at least 1 action that meets the criteria
   */
  function hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions, currentEntityType) {
    return lineItemAnnotation.some(dataField => {
      var _dataField$Inline2, _dataField$annotation4, _dataField$annotation5, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9;
      if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline2 = dataField.Inline) === null || _dataField$Inline2 === void 0 ? void 0 : _dataField$Inline2.valueOf()) !== true && (((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : (_dataField$annotation6 = _dataField$annotation5.Hidden) === null || _dataField$annotation6 === void 0 ? void 0 : _dataField$annotation6.valueOf()) === false || ((_dataField$annotation7 = dataField.annotations) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.UI) === null || _dataField$annotation8 === void 0 ? void 0 : (_dataField$annotation9 = _dataField$annotation8.Hidden) === null || _dataField$annotation9 === void 0 ? void 0 : _dataField$annotation9.valueOf()) === undefined)) {
        if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          var _dataField$ActionTarg2;
          const manifestActionId = generate(["DataFieldForAction", dataField.Action]);
          // if the DataFieldForActon from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(manifestActionId, dataField, manifestActions)) {
            return false;
          }
          // Check if the lineItem context is the same as that of the action:
          return (dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : _dataField$ActionTarg2.isBound) && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType);
        } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
          // if the DataFieldForIntentBasedNavigation from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(`DataFieldForIntentBasedNavigation::${dataField.SemanticObject}::${dataField.Action}`, dataField, manifestActions)) {
            return false;
          }
          return dataField.RequiresContext;
        }
      }
      return false;
    });
  }
  function hasCustomActionsAlwaysVisibleInToolBar(manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      var _action$visible;
      const action = manifestActions[actionKey];
      if (action.requiresSelection && ((_action$visible = action.visible) === null || _action$visible === void 0 ? void 0 : _action$visible.toString()) === "true") {
        return true;
      }
      return false;
    });
  }

  /**
   * Iterates over the custom actions (with key requiresSelection) declared in the manifest for the current line item and returns all the
   * visible key values as an expression.
   *
   * @param manifestActions The actions defined in the manifest
   * @returns Array<Expression<boolean>> All the visible path expressions of the actions that meet the criteria
   */
  function getVisibleExpForCustomActionsRequiringContext(manifestActions) {
    const aVisiblePathExpressions = [];
    if (manifestActions) {
      Object.keys(manifestActions).forEach(actionKey => {
        const action = manifestActions[actionKey];
        if (action.requiresSelection === true && action.visible !== undefined) {
          if (typeof action.visible === "string") {
            var _action$visible2;
            /*The final aim would be to check if the path expression depends on the parent context
            and considers only those expressions for the expression evaluation,
            but currently not possible from the manifest as the visible key is bound on the parent entity.
            Tricky to differentiate the path as it's done for the Hidden annotation.
            For the time being we consider all the paths of the manifest*/

            aVisiblePathExpressions.push(resolveBindingString(action === null || action === void 0 ? void 0 : (_action$visible2 = action.visible) === null || _action$visible2 === void 0 ? void 0 : _action$visible2.valueOf()));
          }
        }
      });
    }
    return aVisiblePathExpressions;
  }

  /**
   * Evaluate if the path is statically deletable or updatable.
   *
   * @param converterContext
   * @returns The table capabilities
   */
  function getCapabilityRestriction(converterContext) {
    const isDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
    const isUpdatable = isPathUpdatable(converterContext.getDataModelObjectPath());
    return {
      isDeletable: !(isConstant(isDeletable) && isDeletable.value === false),
      isUpdatable: !(isConstant(isUpdatable) && isUpdatable.value === false)
    };
  }
  _exports.getCapabilityRestriction = getCapabilityRestriction;
  function getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet, targetCapabilities, deleteButtonVisibilityExpression) {
    var _tableManifestSetting;
    let massEditVisibilityExpression = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : constant(false);
    if (!lineItemAnnotation) {
      return SelectionMode.None;
    }
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    let selectionMode = (_tableManifestSetting = tableManifestSettings.tableSettings) === null || _tableManifestSetting === void 0 ? void 0 : _tableManifestSetting.selectionMode;
    let aHiddenBindingExpressions = [],
      aVisibleBindingExpressions = [];
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, [], undefined, false);
    let isParentDeletable, parentEntitySetDeletable;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      isParentDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
      parentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable, true) : isParentDeletable;
    }
    const bMassEditEnabled = !isConstant(massEditVisibilityExpression) || massEditVisibilityExpression.value !== false;
    if (selectionMode && selectionMode === SelectionMode.None && deleteButtonVisibilityExpression) {
      if (converterContext.getTemplateType() === TemplateType.ObjectPage && bMassEditEnabled) {
        // Mass Edit in OP is enabled only in edit mode.
        return compileExpression(ifElse(and(UI.IsEditable, massEditVisibilityExpression), constant("Multi"), ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None"))));
      } else if (bMassEditEnabled) {
        return SelectionMode.Multi;
      }
      return compileExpression(ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None")));
    }
    if (!selectionMode || selectionMode === SelectionMode.Auto) {
      selectionMode = SelectionMode.Multi;
    }
    if (bMassEditEnabled) {
      // Override default selection mode when mass edit is visible
      selectionMode = selectionMode === SelectionMode.Single ? SelectionMode.Single : SelectionMode.Multi;
    }
    if (hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions.actions, converterContext.getEntityType()) || hasCustomActionsAlwaysVisibleInToolBar(manifestActions.actions)) {
      return selectionMode;
    }
    aHiddenBindingExpressions = getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, converterContext.getEntityType(), converterContext.getDataModelObjectPath(), isEntitySet);
    aVisibleBindingExpressions = getVisibleExpForCustomActionsRequiringContext(manifestActions.actions);

    // No action requiring a context:
    if (aHiddenBindingExpressions.length === 0 && aVisibleBindingExpressions.length === 0 && (deleteButtonVisibilityExpression || bMassEditEnabled)) {
      if (!isEntitySet) {
        // Example: OP case
        if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
          // Building expression for delete and mass edit
          const buttonVisibilityExpression = or(deleteButtonVisibilityExpression || true,
          // default delete visibility as true
          massEditVisibilityExpression);
          return compileExpression(ifElse(and(UI.IsEditable, buttonVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
        } else {
          return SelectionMode.None;
        }
        // EntitySet deletable:
      } else if (bMassEditEnabled) {
        // example: LR scenario
        return selectionMode;
      } else if (targetCapabilities.isDeletable && deleteButtonVisibilityExpression) {
        return compileExpression(ifElse(deleteButtonVisibilityExpression, constant(selectionMode), constant("None")));
        // EntitySet not deletable:
      } else {
        return SelectionMode.None;
      }
      // There are actions requiring a context:
    } else if (!isEntitySet) {
      // Example: OP case
      if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
        // Use selectionMode in edit mode if delete is enabled or mass edit is visible
        const editModebuttonVisibilityExpression = ifElse(bMassEditEnabled && !targetCapabilities.isDeletable, massEditVisibilityExpression, constant(true));
        return compileExpression(ifElse(and(UI.IsEditable, editModebuttonVisibilityExpression), constant(selectionMode), ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None))));
      } else {
        return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None)));
      }
      //EntitySet deletable:
    } else if (targetCapabilities.isDeletable || bMassEditEnabled) {
      // Example: LR scenario
      return selectionMode;
      //EntitySet not deletable:
    } else {
      return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions), massEditVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
    }
  }

  /**
   * Method to retrieve all table actions from annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  _exports.getSelectionMode = getSelectionMode;
  function getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext) {
    const tableActions = [];
    const hiddenTableActions = [];
    const copyDataField = getCopyAction(lineItemAnnotation.filter(dataField => {
      return dataFieldIsCopyAction(dataField);
    }));
    const sEntityType = converterContext.getEntityType().fullyQualifiedName;
    if (copyDataField) {
      var _copyDataField$annota, _copyDataField$annota2, _copyDataField$Label;
      tableActions.push({
        type: ActionType.Copy,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(copyDataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(copyDataField),
        enabled: compileExpression(equal(pathInModel("numberOfSelectedContexts", "internal"), 1)),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_copyDataField$annota = copyDataField.annotations) === null || _copyDataField$annota === void 0 ? void 0 : (_copyDataField$annota2 = _copyDataField$annota.UI) === null || _copyDataField$annota2 === void 0 ? void 0 : _copyDataField$annota2.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
        text: ((_copyDataField$Label = copyDataField.Label) === null || _copyDataField$Label === void 0 ? void 0 : _copyDataField$Label.toString()) ?? Core.getLibraryResourceBundle("sap.fe.core").getText("C_COMMON_COPY"),
        isNavigable: true
      });
    }
    lineItemAnnotation.filter(dataField => {
      return !dataFieldIsCopyAction(dataField);
    }).forEach(dataField => {
      var _dataField$annotation10, _dataField$annotation11, _dataField$annotation12, _dataField$Inline3, _dataField$Determinin, _dataField$ActionTarg3, _dataField$ActionTarg4, _dataField$ActionTarg5, _dataField$annotation13, _dataField$annotation14, _dataField$annotation15, _dataField$annotation16;
      if (((_dataField$annotation10 = dataField.annotations) === null || _dataField$annotation10 === void 0 ? void 0 : (_dataField$annotation11 = _dataField$annotation10.UI) === null || _dataField$annotation11 === void 0 ? void 0 : (_dataField$annotation12 = _dataField$annotation11.Hidden) === null || _dataField$annotation12 === void 0 ? void 0 : _dataField$annotation12.valueOf()) === true) {
        hiddenTableActions.push({
          type: ActionType.Default,
          key: KeyHelper.generateKeyFromDataField(dataField)
        });
      } else if (isDataFieldForActionAbstract(dataField) && ((_dataField$Inline3 = dataField.Inline) === null || _dataField$Inline3 === void 0 ? void 0 : _dataField$Inline3.valueOf()) !== true && ((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) !== true) {
        switch (dataField.$Type) {
          case "com.sap.vocabularies.UI.v1.DataFieldForAction":
            // There are three cases when a table action has an OperationAvailable that leads to an enablement expression
            // and is not dependent upon the table entries.
            // 1. An action with an overload, that is executed against a parent entity.
            // 2. An unbound action
            // 3. A static action (that is, bound to a collection)
            let useEnabledExpression = false;
            if (((_dataField$ActionTarg3 = dataField.ActionTarget) === null || _dataField$ActionTarg3 === void 0 ? void 0 : (_dataField$ActionTarg4 = _dataField$ActionTarg3.annotations) === null || _dataField$ActionTarg4 === void 0 ? void 0 : (_dataField$ActionTarg5 = _dataField$ActionTarg4.Core) === null || _dataField$ActionTarg5 === void 0 ? void 0 : _dataField$ActionTarg5.OperationAvailable) !== undefined) {
              var _dataField$ActionTarg6, _dataField$ActionTarg7, _dataField$ActionTarg8, _dataField$ActionTarg9;
              if (!((_dataField$ActionTarg6 = dataField.ActionTarget) !== null && _dataField$ActionTarg6 !== void 0 && _dataField$ActionTarg6.isBound)) {
                // Unbound action. Is recognised, but getExpressionFromAnnotation checks for isBound = true, so not generated.
                useEnabledExpression = true;
              } else if ((_dataField$ActionTarg7 = dataField.ActionTarget) !== null && _dataField$ActionTarg7 !== void 0 && _dataField$ActionTarg7.isBound && ((_dataField$ActionTarg8 = dataField.ActionTarget) === null || _dataField$ActionTarg8 === void 0 ? void 0 : _dataField$ActionTarg8.sourceType) !== sEntityType) {
                // Overload action
                useEnabledExpression = true;
              } else if ((_dataField$ActionTarg9 = dataField.ActionTarget) !== null && _dataField$ActionTarg9 !== void 0 && _dataField$ActionTarg9.parameters[0].isCollection) {
                // Static action
                useEnabledExpression = true;
              }
            }
            const tableAction = {
              type: ActionType.DataFieldForAction,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation13 = dataField.annotations) === null || _dataField$annotation13 === void 0 ? void 0 : (_dataField$annotation14 = _dataField$annotation13.UI) === null || _dataField$annotation14 === void 0 ? void 0 : _dataField$annotation14.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
              isNavigable: true
            };
            if (useEnabledExpression) {
              tableAction.enabled = getEnabledForAnnotationAction(converterContext, dataField.ActionTarget);
            }
            tableActions.push(tableAction);
            break;
          case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
            tableActions.push({
              type: ActionType.DataFieldForIntentBasedNavigation,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation15 = dataField.annotations) === null || _dataField$annotation15 === void 0 ? void 0 : (_dataField$annotation16 = _dataField$annotation15.UI) === null || _dataField$annotation16 === void 0 ? void 0 : _dataField$annotation16.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)))
            });
            break;
          default:
            break;
        }
      }
    });
    return {
      tableActions,
      hiddenTableActions
    };
  }

  /**
   * Generate the bindingExpression for the highlight rowSetting parameter.
   *
   * @param criticalityAnnotation Path or value of the criticality
   * @param isDraftRootOrNode  Is the current entitySet an Draft root or a node
   * @param targetEntityType The targeted entityType
   * @returns An expressionBinding
   * @private
   */
  function getHighlightRowBinding(criticalityAnnotation, isDraftRootOrNode, targetEntityType) {
    let defaultHighlightRowDefinition = MessageType.None;
    if (criticalityAnnotation) {
      if (typeof criticalityAnnotation === "object") {
        defaultHighlightRowDefinition = getExpressionFromAnnotation(criticalityAnnotation);
      } else {
        // Enum Value so we get the corresponding static part
        defaultHighlightRowDefinition = getMessageTypeFromCriticalityType(criticalityAnnotation);
      }
    }
    const aMissingKeys = [];
    targetEntityType === null || targetEntityType === void 0 ? void 0 : targetEntityType.keys.forEach(key => {
      if (key.name !== "IsActiveEntity") {
        aMissingKeys.push(pathInModel(key.name, undefined));
      }
    });
    return formatResult([defaultHighlightRowDefinition, pathInModel(`filteredMessages`, "internal"), isDraftRootOrNode && Entity.HasActive, isDraftRootOrNode && Entity.IsActive, `${isDraftRootOrNode}`, ...aMissingKeys], tableFormatters.rowHighlighting, targetEntityType);
  }
  function _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath) {
    var _newAction2;
    const navigation = (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create) || (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.detail);
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const originalTableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    // cross-app
    if (navigation !== null && navigation !== void 0 && navigation.outbound && navigation.outboundDetail && navigationSettings !== null && navigationSettings !== void 0 && navigationSettings.create) {
      return {
        mode: "External",
        outbound: navigation.outbound,
        outboundDetail: navigation.outboundDetail,
        navigationSettings: navigationSettings
      };
    }
    let newAction;
    if (lineItemAnnotation) {
      var _converterContext$get14, _targetAnnotationsCom, _targetAnnotationsSes;
      // in-app
      const targetAnnotations = (_converterContext$get14 = converterContext.getEntitySet()) === null || _converterContext$get14 === void 0 ? void 0 : _converterContext$get14.annotations;
      const targetAnnotationsCommon = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Common,
        targetAnnotationsSession = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Session;
      newAction = (targetAnnotationsCommon === null || targetAnnotationsCommon === void 0 ? void 0 : (_targetAnnotationsCom = targetAnnotationsCommon.DraftRoot) === null || _targetAnnotationsCom === void 0 ? void 0 : _targetAnnotationsCom.NewAction) || (targetAnnotationsSession === null || targetAnnotationsSession === void 0 ? void 0 : (_targetAnnotationsSes = targetAnnotationsSession.StickySessionSupported) === null || _targetAnnotationsSes === void 0 ? void 0 : _targetAnnotationsSes.NewAction);
      if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
        // A combination of 'CreationRow' and 'NewAction' does not make sense
        throw Error(`Creation mode '${CreationMode.CreationRow}' can not be used with a custom 'new' action (${newAction})`);
      }
      if (navigation !== null && navigation !== void 0 && navigation.route) {
        var _newAction;
        // route specified
        return {
          mode: tableManifestConfiguration.creationMode,
          append: tableManifestConfiguration.createAtEnd,
          newAction: (_newAction = newAction) === null || _newAction === void 0 ? void 0 : _newAction.toString(),
          navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
        };
      }
    }

    // no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
    if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
      var _originalTableSetting;
      tableManifestConfiguration.creationMode = CreationMode.Inline;
      // In case there was no specific configuration for the createAtEnd we force it to false
      if (((_originalTableSetting = originalTableSettings.creationMode) === null || _originalTableSetting === void 0 ? void 0 : _originalTableSetting.createAtEnd) === undefined) {
        tableManifestConfiguration.createAtEnd = false;
      }
    }
    return {
      mode: tableManifestConfiguration.creationMode,
      append: tableManifestConfiguration.createAtEnd,
      newAction: (_newAction2 = newAction) === null || _newAction2 === void 0 ? void 0 : _newAction2.toString()
    };
  }
  const _getRowConfigurationProperty = function (lineItemAnnotation, converterContext, navigationSettings, targetPath, tableType) {
    let pressProperty, navigationTarget;
    let criticalityProperty = constant(MessageType.None);
    const targetEntityType = converterContext.getEntityType();
    if (navigationSettings && lineItemAnnotation) {
      var _navigationSettings$d, _navigationSettings$d2;
      navigationTarget = ((_navigationSettings$d = navigationSettings.display) === null || _navigationSettings$d === void 0 ? void 0 : _navigationSettings$d.target) || ((_navigationSettings$d2 = navigationSettings.detail) === null || _navigationSettings$d2 === void 0 ? void 0 : _navigationSettings$d2.outbound);
      if (navigationTarget) {
        pressProperty = ".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
      } else if (targetEntityType) {
        var _navigationSettings$d3, _lineItemAnnotation$a, _lineItemAnnotation$a2;
        const targetEntitySet = converterContext.getEntitySet();
        navigationTarget = (_navigationSettings$d3 = navigationSettings.detail) === null || _navigationSettings$d3 === void 0 ? void 0 : _navigationSettings$d3.route;
        criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a === void 0 ? void 0 : (_lineItemAnnotation$a2 = _lineItemAnnotation$a.UI) === null || _lineItemAnnotation$a2 === void 0 ? void 0 : _lineItemAnnotation$a2.Criticality, !!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet), targetEntityType);
        if (navigationTarget && TypeGuards.isEntitySet(targetEntitySet)) {
          pressProperty = "API.onTableRowPress($event, $controller, ${$parameters>bindingContext}, { callExtension: true, targetPath: '" + targetPath + "', editable : " + (ModelHelper.getDraftRoot(targetEntitySet) || ModelHelper.getDraftNode(targetEntitySet) ? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')" : "undefined") + (tableType === "AnalyticalTable" || tableType === "TreeTable" ? ", bRecreateContext: true" : "") + "})"; //Need to access to DraftRoot and DraftNode !!!!!!!
        }
      }
    }

    const rowNavigatedExpression = formatResult([pathInModel("/deepestPath", "internal")], tableFormatters.navigatedRow, targetEntityType);
    return {
      press: pressProperty,
      action: pressProperty ? "Navigation" : undefined,
      rowHighlighting: compileExpression(criticalityProperty),
      rowNavigated: compileExpression(rowNavigatedExpression),
      visible: compileExpression(not(UI.IsInactive))
    };
  };

  /**
   * Retrieve the columns from the entityType.
   *
   * @param columnsToBeCreated The columns to be created.
   * @param entityType The target entity type.
   * @param annotationColumns The array of columns created based on LineItem annotations.
   * @param nonSortableColumns The array of all non sortable column names.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The column from the entityType
   */
  const getColumnsFromEntityType = function (columnsToBeCreated, entityType) {
    let annotationColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let nonSortableColumns = arguments.length > 3 ? arguments[3] : undefined;
    let converterContext = arguments.length > 4 ? arguments[4] : undefined;
    let tableType = arguments.length > 5 ? arguments[5] : undefined;
    let textOnlyColumnsFromTextAnnotation = arguments.length > 6 ? arguments[6] : undefined;
    const tableColumns = annotationColumns;
    // Catch already existing columns - which were added before by LineItem Annotations
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    entityType.entityProperties.forEach(property => {
      // Catch already existing columns - which were added before by LineItem Annotations
      const exists = annotationColumns.some(column => {
        return column.name === property.name;
      });

      // if target type exists, it is a complex property and should be ignored
      if (!property.targetType && !exists) {
        const relatedPropertiesInfo = collectRelatedProperties(property.name, property, converterContext, true, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          // Include text properties found during analysis on getColumnsFromAnnotations
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        const columnInfo = getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, true, true, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
        const oColumnDraftIndicator = getDefaultDraftIndicatorForColumn(columnInfo.name, semanticKeys, false, null);
        if (Object.keys(oColumnDraftIndicator).length > 0) {
          columnInfo.formatOptions = {
            ...oColumnDraftIndicator
          };
        }
        if (relatedPropertyNames.length > 0) {
          columnInfo.propertyInfos = relatedPropertyNames;
          columnInfo.exportSettings = {
            ...columnInfo.exportSettings,
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping
          };
          columnInfo.exportSettings.type = _getExportDataType(property.type, relatedPropertyNames.length > 1);
          if (relatedPropertiesInfo.exportUnitName) {
            columnInfo.exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            columnInfo.exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            columnInfo.exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            columnInfo.exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
            columnInfo.exportSettings.utc = false;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            columnInfo.exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
          if (relatedPropertiesInfo.exportDataPointTargetValue) {
            columnInfo.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
            columnInfo.exportSettings.type = "String";
          }

          // Collect information of related columns to be created.
          relatedPropertyNames.forEach(name => {
            columnsToBeCreated[name] = relatedPropertiesInfo.properties[name];
          });
        }
        if (additionalPropertyNames.length > 0) {
          columnInfo.additionalPropertyInfos = additionalPropertyNames;
          // Create columns for additional properties identified for ALP use case.
          additionalPropertyNames.forEach(name => {
            // Intentional overwrite as we require only one new PropertyInfo for a related Property.
            columnsToBeCreated[name] = relatedPropertiesInfo.additionalProperties[name];
          });
        }
        tableColumns.push(columnInfo);
      }
      // In case a property has defined a #TextOnly text arrangement don't only create the complex property with the text property as a child property,
      // but also the property itself as it can be used as within the sortConditions or on custom columns.
      // This step must be valide also from the columns added via LineItems or from a column available on the p13n.
      if (getDisplayMode(property) === "Description") {
        nonSortableColumns = nonSortableColumns.concat(property.name);
        tableColumns.push(getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, false, false, nonSortableColumns, aggregationHelper, converterContext, []));
      }
    });

    // Create a propertyInfo for each related property.
    const relatedColumns = _createRelatedColumns(columnsToBeCreated, tableColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation);
    return tableColumns.concat(relatedColumns);
  };

  /**
   * Create a column definition from a property.
   *
   * @param property Entity type property for which the column is created
   * @param fullPropertyPath The full path to the target property
   * @param relativePath The relative path to the target property based on the context
   * @param useDataFieldPrefix Should be prefixed with "DataField::", else it will be prefixed with "Property::"
   * @param availableForAdaptation Decides whether the column should be available for adaptation
   * @param nonSortableColumns The array of all non-sortable column names
   * @param aggregationHelper The aggregationHelper for the entity
   * @param converterContext The converter context
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The annotation column definition
   */
  _exports.getColumnsFromEntityType = getColumnsFromEntityType;
  const getColumnDefinitionFromProperty = function (property, fullPropertyPath, relativePath, useDataFieldPrefix, availableForAdaptation, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations10, _property$annotations11;
    const name = useDataFieldPrefix ? relativePath : `Property::${relativePath}`;
    const key = (useDataFieldPrefix ? "DataField::" : "Property::") + replaceSpecialChars(relativePath);
    const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, property);
    const isHidden = ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) === true;
    const groupPath = property.name ? _sliceAtSlash(property.name, true, false) : undefined;
    const isGroup = groupPath != property.name;
    const exportType = _getExportDataType(property.type);
    const sDateInputFormat = property.type === "Edm.Date" ? "YYYY-MM-DD" : undefined;
    const dataType = getDataFieldDataType(property);
    const propertyTypeConfig = getTypeConfig(property, dataType);
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    const isAPropertyFromTextOnlyAnnotation = textOnlyColumnsFromTextAnnotation && textOnlyColumnsFromTextAnnotation.indexOf(relativePath) >= 0;
    const sortable = (!isHidden || isAPropertyFromTextOnlyAnnotation) && nonSortableColumns.indexOf(relativePath) === -1;
    const typeConfig = {
      className: property.type || dataType,
      formatOptions: propertyTypeConfig.formatOptions,
      constraints: propertyTypeConfig.constraints
    };
    let exportSettings = null;
    if (_isExportableColumn(property)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _property$annotations9;
      const unitProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
      const timezoneProperty = getAssociatedTimezoneProperty(property);
      const unitText = ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Measures) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.ISOCurrency) || ((_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Measures) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.Unit);
      const timezoneText = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Timezone;
      exportSettings = {
        type: exportType,
        inputFormat: sDateInputFormat,
        scale: property.scale,
        delimiter: property.type === "Edm.Int64"
      };
      if (unitProperty) {
        exportSettings.unitProperty = unitProperty.name;
        exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
      } else if (unitText) {
        exportSettings.unit = `${unitText}`;
      }
      if (timezoneProperty) {
        exportSettings.timezoneProperty = timezoneProperty.name;
        exportSettings.utc = false;
      } else if (timezoneText) {
        exportSettings.timezone = timezoneText.toString();
      }
    }
    const collectedNavigationPropertyLabels = _getCollectedNavigationPropertyLabels(relativePath, converterContext);
    const column = {
      key: key,
      type: ColumnType.Annotation,
      label: getLabel(property, isGroup),
      groupLabel: isGroup ? getLabel(property) : undefined,
      group: isGroup ? groupPath : undefined,
      annotationPath: fullPropertyPath,
      semanticObjectPath: semanticObjectAnnotationPath,
      availability: !availableForAdaptation || isHidden ? "Hidden" : "Adaptation",
      name: name,
      relativePath: relativePath,
      sortable: sortable,
      isGroupable: aggregationHelper.isAnalyticsSupported() ? !!aggregationHelper.isPropertyGroupable(property) : sortable,
      isKey: property.isKey,
      exportSettings: exportSettings,
      caseSensitive: isFilteringCaseSensitive(converterContext),
      typeConfig: typeConfig,
      importance: getImportance((_property$annotations10 = property.annotations) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.UI) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.DataFieldDefault, semanticKeys),
      additionalLabels: collectedNavigationPropertyLabels
    };
    const sTooltip = _getTooltip(property);
    if (sTooltip) {
      column.tooltip = sTooltip;
    }
    const targetValuefromDP = getTargetValueOnDataPoint(property);
    if (isDataPointFromDataFieldDefault(property) && typeof targetValuefromDP === "string" && column.exportSettings) {
      column.exportDataPointTargetValue = targetValuefromDP;
      column.exportSettings.template = "{0}/" + targetValuefromDP;
    }
    return column;
  };

  /**
   * Returns Boolean true for exportable columns, false for non exportable columns.
   *
   * @param source The dataField or property to be evaluated
   * @returns True for exportable column, false for non exportable column
   * @private
   */

  function _isExportableColumn(source) {
    var _annotations$UI2;
    let propertyType, property;
    const dataFieldDefaultProperty = (_annotations$UI2 = source.annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : _annotations$UI2.DataFieldDefault;
    if (isProperty(source) && dataFieldDefaultProperty !== null && dataFieldDefaultProperty !== void 0 && dataFieldDefaultProperty.$Type) {
      if (isReferencePropertyStaticallyHidden(dataFieldDefaultProperty) === true) {
        return false;
      }
      propertyType = dataFieldDefaultProperty === null || dataFieldDefaultProperty === void 0 ? void 0 : dataFieldDefaultProperty.$Type;
    } else if (isReferencePropertyStaticallyHidden(source) === true) {
      return false;
    } else {
      var _Target, _Target$$target, _Value, _Value$$target, _Value$$target$annota, _Value$$target$annota2, _Value$$target$annota3, _Value2, _Value2$$target, _Value2$$target$annot, _Value2$$target$annot2;
      property = source;
      propertyType = property.$Type;
      if (propertyType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_Target = property.Target) !== null && _Target !== void 0 && (_Target$$target = _Target.$target) !== null && _Target$$target !== void 0 && _Target$$target.$Type) {
        var _Target2, _Target2$$target;
        //For Chart
        propertyType = (_Target2 = property.Target) === null || _Target2 === void 0 ? void 0 : (_Target2$$target = _Target2.$target) === null || _Target2$$target === void 0 ? void 0 : _Target2$$target.$Type;
        return "com.sap.vocabularies.UI.v1.ChartDefinitionType".indexOf(propertyType) === -1;
      } else if (((_Value = property.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : (_Value$$target$annota = _Value$$target.annotations) === null || _Value$$target$annota === void 0 ? void 0 : (_Value$$target$annota2 = _Value$$target$annota.Core) === null || _Value$$target$annota2 === void 0 ? void 0 : (_Value$$target$annota3 = _Value$$target$annota2.MediaType) === null || _Value$$target$annota3 === void 0 ? void 0 : _Value$$target$annota3.term) === "Org.OData.Core.V1.MediaType" && ((_Value2 = property.Value) === null || _Value2 === void 0 ? void 0 : (_Value2$$target = _Value2.$target) === null || _Value2$$target === void 0 ? void 0 : (_Value2$$target$annot = _Value2$$target.annotations) === null || _Value2$$target$annot === void 0 ? void 0 : (_Value2$$target$annot2 = _Value2$$target$annot.Core) === null || _Value2$$target$annot2 === void 0 ? void 0 : _Value2$$target$annot2.isURL) !== true) {
        //For Stream
        return false;
      }
    }
    return propertyType ? ["com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldForActionGroup"].indexOf(propertyType) === -1 : true;
  }

  /**
   * Returns Boolean true for valid columns, false for invalid columns.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns True for valid columns, false for invalid columns
   * @private
   */
  const _isValidColumn = function (dataField) {
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        return !!dataField.Inline;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        return true;
      default:
      // Todo: Replace with proper Log statement once available
      //  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
    }
  };
  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation that is evaluated by SAP Fiori elements.
   * @returns An expression that you can bind to the UI.
   */
  const _getVisibleExpression = function (dataFieldModelPath) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat, _targetObject$annotat2, _propertyValue$annota, _propertyValue$annota2;
    const targetObject = dataFieldModelPath.targetObject;
    let propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    // FIXME Prove me wrong that this is useless
    const isAnalyticalGroupHeaderExpanded = /*formatOptions?.isAnalytics ? UI.IsExpanded :*/constant(false);
    const isAnalyticalLeaf = /*formatOptions?.isAnalytics ? equal(UI.NodeLevel, 0) :*/constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat = targetObject.annotations) === null || _targetObject$annotat === void 0 ? void 0 : (_targetObject$annotat2 = _targetObject$annotat.UI) === null || _targetObject$annotat2 === void 0 ? void 0 : _targetObject$annotat2.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]);
  };

  /**
   * Returns hidden binding expressions for a field group.
   *
   * @param dataFieldGroup DataField defined in the annotations
   * @returns Compile binding of field group expressions.
   * @private
   */
  _exports._getVisibleExpression = _getVisibleExpression;
  const _getFieldGroupHiddenExpressions = function (dataFieldGroup) {
    var _dataFieldGroup$Targe, _dataFieldGroup$Targe2;
    const fieldGroupHiddenExpressions = [];
    if (dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe = dataFieldGroup.Target) === null || _dataFieldGroup$Targe === void 0 ? void 0 : (_dataFieldGroup$Targe2 = _dataFieldGroup$Targe.$target) === null || _dataFieldGroup$Targe2 === void 0 ? void 0 : _dataFieldGroup$Targe2.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$annot, _dataFieldGroup$annot2;
      if (dataFieldGroup !== null && dataFieldGroup !== void 0 && (_dataFieldGroup$annot = dataFieldGroup.annotations) !== null && _dataFieldGroup$annot !== void 0 && (_dataFieldGroup$annot2 = _dataFieldGroup$annot.UI) !== null && _dataFieldGroup$annot2 !== void 0 && _dataFieldGroup$annot2.Hidden) {
        return compileExpression(not(equal(getExpressionFromAnnotation(dataFieldGroup.annotations.UI.Hidden), true)));
      } else {
        var _dataFieldGroup$Targe3;
        (_dataFieldGroup$Targe3 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe3 === void 0 ? void 0 : _dataFieldGroup$Targe3.forEach(innerDataField => {
          fieldGroupHiddenExpressions.push(_getVisibleExpression({
            targetObject: innerDataField
          }));
        });
        return compileExpression(ifElse(or(...fieldGroupHiddenExpressions), constant(true), constant(false)));
      }
    } else {
      return undefined;
    }
  };

  /**
   * Returns the label for the property and dataField.
   *
   * @param [property] Property, DataField or Navigation Property defined in the annotations
   * @param isGroup
   * @returns Label of the property or DataField
   * @private
   */
  const getLabel = function (property) {
    let isGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!property) {
      return undefined;
    }
    if (isProperty(property) || isNavigationProperty(property)) {
      var _annotations2, _annotations2$UI, _dataFieldDefault$Lab, _property$annotations12, _property$annotations13;
      const dataFieldDefault = (_annotations2 = property.annotations) === null || _annotations2 === void 0 ? void 0 : (_annotations2$UI = _annotations2.UI) === null || _annotations2$UI === void 0 ? void 0 : _annotations2$UI.DataFieldDefault;
      if (dataFieldDefault && !dataFieldDefault.qualifier && (_dataFieldDefault$Lab = dataFieldDefault.Label) !== null && _dataFieldDefault$Lab !== void 0 && _dataFieldDefault$Lab.valueOf()) {
        var _dataFieldDefault$Lab2;
        return compileExpression(getExpressionFromAnnotation((_dataFieldDefault$Lab2 = dataFieldDefault.Label) === null || _dataFieldDefault$Lab2 === void 0 ? void 0 : _dataFieldDefault$Lab2.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$annotations12 = property.annotations.Common) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.Label) === null || _property$annotations13 === void 0 ? void 0 : _property$annotations13.valueOf()) || property.name));
    } else if (isDataFieldTypes(property)) {
      var _property$Label2, _property$Value, _property$Value$$targ, _property$Value$$targ2, _property$Value$$targ3, _property$Value$$targ4, _property$Value2, _property$Value2$$tar;
      if (!!isGroup && property.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation") {
        var _property$Label;
        return compileExpression(getExpressionFromAnnotation((_property$Label = property.Label) === null || _property$Label === void 0 ? void 0 : _property$Label.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$Label2 = property.Label) === null || _property$Label2 === void 0 ? void 0 : _property$Label2.valueOf()) || ((_property$Value = property.Value) === null || _property$Value === void 0 ? void 0 : (_property$Value$$targ = _property$Value.$target) === null || _property$Value$$targ === void 0 ? void 0 : (_property$Value$$targ2 = _property$Value$$targ.annotations) === null || _property$Value$$targ2 === void 0 ? void 0 : (_property$Value$$targ3 = _property$Value$$targ2.Common) === null || _property$Value$$targ3 === void 0 ? void 0 : (_property$Value$$targ4 = _property$Value$$targ3.Label) === null || _property$Value$$targ4 === void 0 ? void 0 : _property$Value$$targ4.valueOf()) || ((_property$Value2 = property.Value) === null || _property$Value2 === void 0 ? void 0 : (_property$Value2$$tar = _property$Value2.$target) === null || _property$Value2$$tar === void 0 ? void 0 : _property$Value2$$tar.name)));
    } else if (property.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _property$Label3, _property$Target, _property$Target$$tar, _property$Target$$tar2, _property$Target$$tar3, _property$Target$$tar4, _property$Target$$tar5, _property$Target$$tar6;
      return compileExpression(getExpressionFromAnnotation(((_property$Label3 = property.Label) === null || _property$Label3 === void 0 ? void 0 : _property$Label3.valueOf()) || ((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : (_property$Target$$tar2 = _property$Target$$tar.Value) === null || _property$Target$$tar2 === void 0 ? void 0 : (_property$Target$$tar3 = _property$Target$$tar2.$target) === null || _property$Target$$tar3 === void 0 ? void 0 : (_property$Target$$tar4 = _property$Target$$tar3.annotations) === null || _property$Target$$tar4 === void 0 ? void 0 : (_property$Target$$tar5 = _property$Target$$tar4.Common) === null || _property$Target$$tar5 === void 0 ? void 0 : (_property$Target$$tar6 = _property$Target$$tar5.Label) === null || _property$Target$$tar6 === void 0 ? void 0 : _property$Target$$tar6.valueOf())));
    } else {
      var _property$Label4;
      return compileExpression(getExpressionFromAnnotation((_property$Label4 = property.Label) === null || _property$Label4 === void 0 ? void 0 : _property$Label4.valueOf()));
    }
  };
  const _getTooltip = function (source) {
    var _source$annotations, _source$annotations$C;
    if (!source) {
      return undefined;
    }
    if (isProperty(source) || (_source$annotations = source.annotations) !== null && _source$annotations !== void 0 && (_source$annotations$C = _source$annotations.Common) !== null && _source$annotations$C !== void 0 && _source$annotations$C.QuickInfo) {
      var _source$annotations2, _source$annotations2$;
      return (_source$annotations2 = source.annotations) !== null && _source$annotations2 !== void 0 && (_source$annotations2$ = _source$annotations2.Common) !== null && _source$annotations2$ !== void 0 && _source$annotations2$.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (isDataFieldTypes(source)) {
      var _source$Value, _source$Value$$target, _source$Value$$target2, _source$Value$$target3;
      return (_source$Value = source.Value) !== null && _source$Value !== void 0 && (_source$Value$$target = _source$Value.$target) !== null && _source$Value$$target !== void 0 && (_source$Value$$target2 = _source$Value$$target.annotations) !== null && _source$Value$$target2 !== void 0 && (_source$Value$$target3 = _source$Value$$target2.Common) !== null && _source$Value$$target3 !== void 0 && _source$Value$$target3.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (source.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _source$Target, _datapointTarget$Valu, _datapointTarget$Valu2, _datapointTarget$Valu3, _datapointTarget$Valu4;
      const datapointTarget = (_source$Target = source.Target) === null || _source$Target === void 0 ? void 0 : _source$Target.$target;
      return datapointTarget !== null && datapointTarget !== void 0 && (_datapointTarget$Valu = datapointTarget.Value) !== null && _datapointTarget$Valu !== void 0 && (_datapointTarget$Valu2 = _datapointTarget$Valu.$target) !== null && _datapointTarget$Valu2 !== void 0 && (_datapointTarget$Valu3 = _datapointTarget$Valu2.annotations) !== null && _datapointTarget$Valu3 !== void 0 && (_datapointTarget$Valu4 = _datapointTarget$Valu3.Common) !== null && _datapointTarget$Valu4 !== void 0 && _datapointTarget$Valu4.QuickInfo ? compileExpression(getExpressionFromAnnotation(datapointTarget.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else {
      return undefined;
    }
  };
  function getRowStatusVisibility(colName, isSemanticKeyInFieldGroup) {
    return formatResult([pathInModel(`semanticKeyHasDraftIndicator`, "internal"), pathInModel(`filteredMessages`, "internal"), colName, isSemanticKeyInFieldGroup], tableFormatters.getErrorStatusTextVisibilityFormatter);
  }

  /**
   * Creates a PropertyInfo for each identified property consumed by a LineItem.
   *
   * @param columnsToBeCreated Identified properties.
   * @param existingColumns The list of columns created for LineItems and Properties of entityType.
   * @param nonSortableColumns The array of column names which cannot be sorted.
   * @param converterContext The converter context.
   * @param entityType The entity type for the LineItem
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The array of columns created.
   */
  _exports.getRowStatusVisibility = getRowStatusVisibility;
  const _createRelatedColumns = function (columnsToBeCreated, existingColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation) {
    const relatedColumns = [];
    const relatedPropertyNameMap = {};
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    Object.keys(columnsToBeCreated).forEach(name => {
      const property = columnsToBeCreated[name],
        annotationPath = converterContext.getAbsoluteAnnotationPath(name),
        // Check whether the related column already exists.
        relatedColumn = existingColumns.find(column => column.name === name);
      if (relatedColumn === undefined) {
        // Case 1: Key contains DataField prefix to ensure all property columns have the same key format.
        // New created property column is set to hidden.
        const column = getColumnDefinitionFromProperty(property, annotationPath, name, true, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        column.isPartOfLineItem = existingColumns.some(existingColumn => {
          var _existingColumn$prope;
          return ((_existingColumn$prope = existingColumn.propertyInfos) === null || _existingColumn$prope === void 0 ? void 0 : _existingColumn$prope.includes(name)) && existingColumn.isPartOfLineItem;
        });
        relatedColumns.push(column);
      } else if (relatedColumn.annotationPath !== annotationPath || relatedColumn.propertyInfos) {
        // Case 2: The existing column points to a LineItem (or)
        // Case 3: This is a self reference from an existing column

        const newName = `Property::${name}`;

        // Checking whether the related property column has already been created in a previous iteration.
        if (!existingColumns.some(column => column.name === newName)) {
          // Create a new property column with 'Property::' prefix,
          // Set it to hidden as it is only consumed by Complex property infos.
          const column = getColumnDefinitionFromProperty(property, annotationPath, name, false, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
          column.isPartOfLineItem = relatedColumn.isPartOfLineItem;
          relatedColumns.push(column);
          relatedPropertyNameMap[name] = newName;
        } else if (existingColumns.some(column => column.name === newName) && existingColumns.some(column => {
          var _column$propertyInfos;
          return (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.includes(name);
        })) {
          relatedPropertyNameMap[name] = newName;
        }
      }
    });

    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      var _column$propertyInfos2, _column$additionalPro;
      column.propertyInfos = (_column$propertyInfos2 = column.propertyInfos) === null || _column$propertyInfos2 === void 0 ? void 0 : _column$propertyInfos2.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
      column.additionalPropertyInfos = (_column$additionalPro = column.additionalPropertyInfos) === null || _column$additionalPro === void 0 ? void 0 : _column$additionalPro.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
    });
    return relatedColumns;
  };

  /**
   * Getting the Column Name
   * If it points to a DataField with one property or DataPoint with one property, it will use the property name
   * here to be consistent with the existing flex changes.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns The name of annotation columns
   * @private
   */
  const _getAnnotationColumnName = function (dataField) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    // This is needed as we have flexibility changes already that we have to check against
    if (isDataFieldTypes(dataField)) {
      var _dataField$Value;
      return (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.path;
    } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_dataField$Target = dataField.Target) !== null && _dataField$Target !== void 0 && (_dataField$Target$$ta = _dataField$Target.$target) !== null && _dataField$Target$$ta !== void 0 && (_dataField$Target$$ta2 = _dataField$Target$$ta.Value) !== null && _dataField$Target$$ta2 !== void 0 && _dataField$Target$$ta2.path) {
      var _dataField$Target2, _dataField$Target2$$t;
      // This is for removing duplicate properties. For example, 'Progress' Property is removed if it is already defined as a DataPoint
      return (_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : _dataField$Target2$$t.Value.path;
    } else {
      return KeyHelper.generateKeyFromDataField(dataField);
    }
  };

  /**
   * Creates a PropertyInfo for the identified additional property for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this technical property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param name The name of the property to be created.
   * @param columns The list of columns created for LineItems and Properties of entityType from the table visualization.
   * @returns The propertyInfo of the technical property to be added to the list of columns.
   * @private
   */

  const createTechnicalProperty = function (name, columns, relatedAdditionalPropertyNameMap) {
    const key = `Property_Technical::${name}`;
    // Validate if the technical property hasn't yet been created on previous iterations.
    const columnExists = columns.find(column => column.key === key);
    // Retrieve the simple property used by the hidden annotation, it will be used as a base for the mandatory attributes of newly created technical property. For e.g. relativePath
    const additionalProperty = !columnExists && columns.find(column => column.name === name && !column.propertyInfos);
    if (additionalProperty) {
      const technicalColumn = {
        key: key,
        type: ColumnType.Annotation,
        label: additionalProperty.label,
        annotationPath: additionalProperty.annotationPath,
        availability: "Hidden",
        name: key,
        relativePath: additionalProperty.relativePath,
        sortable: false,
        isGroupable: false,
        isKey: false,
        exportSettings: null,
        caseSensitive: false,
        aggregatable: false,
        extension: {
          technicallyGroupable: true,
          technicallyAggregatable: true
        }
      };
      columns.push(technicalColumn);
      relatedAdditionalPropertyNameMap[name] = technicalColumn.name;
    }
  };

  /**
   * Determines if the data field labels have to be displayed in the table.
   *
   * @param fieldGroupName The `DataField` name being processed.
   * @param visualizationPath
   * @param converterContext
   * @returns `showDataFieldsLabel` value from the manifest
   * @private
   */
  const _getShowDataFieldsLabel = function (fieldGroupName, visualizationPath, converterContext) {
    var _converterContext$get15;
    const oColumns = (_converterContext$get15 = converterContext.getManifestControlConfiguration(visualizationPath)) === null || _converterContext$get15 === void 0 ? void 0 : _converterContext$get15.columns;
    const aColumnKeys = oColumns && Object.keys(oColumns);
    return aColumnKeys && !!aColumnKeys.find(function (key) {
      return key === fieldGroupName && oColumns[key].showDataFieldsLabel;
    });
  };

  /**
   * Determines the relative path of the property with respect to the root entity.
   *
   * @param dataField The `DataField` being processed.
   * @returns The relative path
   */
  const _getRelativePath = function (dataField) {
    var _Value3, _dataField$Target3;
    let relativePath = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_Value3 = dataField.Value) === null || _Value3 === void 0 ? void 0 : _Value3.path;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target3 = dataField.Target) === null || _dataField$Target3 === void 0 ? void 0 : _dataField$Target3.value;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
        relativePath = KeyHelper.generateKeyFromDataField(dataField);
        break;
    }
    return relativePath;
  };
  const _sliceAtSlash = function (path, isLastSlash, isLastPart) {
    const iSlashIndex = isLastSlash ? path.lastIndexOf("/") : path.indexOf("/");
    if (iSlashIndex === -1) {
      return path;
    }
    return isLastPart ? path.substring(iSlashIndex + 1, path.length) : path.substring(0, iSlashIndex);
  };

  /**
   * Determines if the column contains a multi-value field.
   *
   * @param dataField The DataField being processed
   * @param converterContext The converter context
   * @returns True if the DataField corresponds to a multi-value field.
   */
  const _isColumnMultiValued = function (dataField, converterContext) {
    if (isDataFieldTypes(dataField) && isPathAnnotationExpression(dataField.Value)) {
      const propertyObjectPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), dataField.Value.path);
      return isMultiValueField(propertyObjectPath);
    } else {
      return false;
    }
  };

  /**
   * Determine whether a column is sortable.
   *
   * @param dataField The data field being processed
   * @param propertyPath The property path
   * @param nonSortableColumns Collection of non-sortable column names as per annotation
   * @returns True if the column is sortable
   */
  const _isColumnSortable = function (dataField, propertyPath, nonSortableColumns) {
    return nonSortableColumns.indexOf(propertyPath) === -1 && (
    // Column is not marked as non-sortable via annotation
    dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction");
  };

  /**
   * Returns whether filtering on the table is case sensitive.
   *
   * @param converterContext The instance of the converter context
   * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
   */
  const isFilteringCaseSensitive = function (converterContext) {
    const filterFunctions = _getFilterFunctions(converterContext);
    return Array.isArray(filterFunctions) ? filterFunctions.indexOf("tolower") === -1 : true;
  };
  _exports.isFilteringCaseSensitive = isFilteringCaseSensitive;
  function _getFilterFunctions(ConverterContext) {
    const entitySet = ConverterContext.getEntitySet();
    if (TypeGuards.isEntitySet(entitySet)) {
      var _entitySet$annotation3, _ConverterContext$get;
      return ((_entitySet$annotation3 = entitySet.annotations.Capabilities) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.FilterFunctions) ?? ((_ConverterContext$get = ConverterContext.getEntityContainer().annotations.Capabilities) === null || _ConverterContext$get === void 0 ? void 0 : _ConverterContext$get.FilterFunctions);
    }
    return undefined;
  }

  /**
   * Returns default format options for text fields in a table.
   *
   * @param formatOptions
   * @returns Collection of format options with default values
   */
  function _getDefaultFormatOptionsForTable(formatOptions) {
    return formatOptions === undefined ? undefined : {
      textLinesEdit: 4,
      ...formatOptions
    };
  }
  function _findSemanticKeyValues(semanticKeys, name) {
    const aSemanticKeyValues = [];
    let bSemanticKeyFound = false;
    for (let i = 0; i < semanticKeys.length; i++) {
      aSemanticKeyValues.push(semanticKeys[i].value);
      if (semanticKeys[i].value === name) {
        bSemanticKeyFound = true;
      }
    }
    return {
      values: aSemanticKeyValues,
      semanticKeyFound: bSemanticKeyFound
    };
  }
  function _findProperties(semanticKeyValues, fieldGroupProperties) {
    let semanticKeyHasPropertyInFieldGroup = false;
    let sPropertyPath;
    if (semanticKeyValues && semanticKeyValues.length >= 1 && fieldGroupProperties && fieldGroupProperties.length >= 1) {
      for (let i = 0; i < semanticKeyValues.length; i++) {
        if ([semanticKeyValues[i]].some(tmp => fieldGroupProperties.indexOf(tmp) >= 0)) {
          semanticKeyHasPropertyInFieldGroup = true;
          sPropertyPath = semanticKeyValues[i];
          break;
        }
      }
    }
    return {
      semanticKeyHasPropertyInFieldGroup: semanticKeyHasPropertyInFieldGroup,
      fieldGroupPropertyPath: sPropertyPath
    };
  }
  function _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKeyValues) {
    var _dataFieldGroup$Targe4, _dataFieldGroup$Targe5;
    const aProperties = [];
    let _propertiesFound = {
      semanticKeyHasPropertyInFieldGroup: false,
      fieldGroupPropertyPath: undefined
    };
    if (dataFieldGroup && dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe4 = dataFieldGroup.Target) === null || _dataFieldGroup$Targe4 === void 0 ? void 0 : (_dataFieldGroup$Targe5 = _dataFieldGroup$Targe4.$target) === null || _dataFieldGroup$Targe5 === void 0 ? void 0 : _dataFieldGroup$Targe5.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$Targe6;
      (_dataFieldGroup$Targe6 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe6 === void 0 ? void 0 : _dataFieldGroup$Targe6.forEach(innerDataField => {
        if ((innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && innerDataField.Value) {
          aProperties.push(innerDataField.Value.path);
        }
        _propertiesFound = _findProperties(semanticKeyValues, aProperties);
      });
    }
    return {
      semanticKeyHasPropertyInFieldGroup: _propertiesFound.semanticKeyHasPropertyInFieldGroup,
      propertyPath: _propertiesFound.fieldGroupPropertyPath
    };
  }

  /**
   * Returns default format options with draftIndicator for a column.
   *
   * @param name
   * @param semanticKeys
   * @param isFieldGroupColumn
   * @param dataFieldGroup
   * @returns Collection of format options with default values
   */
  function getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, dataFieldGroup) {
    if (!semanticKeys) {
      return {};
    }
    const semanticKey = _findSemanticKeyValues(semanticKeys, name);
    const semanticKeyInFieldGroup = _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKey.values);
    if (semanticKey.semanticKeyFound) {
      const formatOptionsObj = {
        hasDraftIndicator: true,
        semantickeys: semanticKey.values,
        showErrorObjectStatus: compileExpression(getRowStatusVisibility(name, false))
      };
      if (isFieldGroupColumn && semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
        formatOptionsObj.showErrorObjectStatus = compileExpression(getRowStatusVisibility(name, true));
        formatOptionsObj.fieldGroupDraftIndicatorPropertyPath = semanticKeyInFieldGroup.propertyPath;
      }
      return formatOptionsObj;
    } else if (!semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
      return {};
    } else {
      // Semantic Key has a property in a FieldGroup
      return {
        fieldGroupDraftIndicatorPropertyPath: semanticKeyInFieldGroup.propertyPath,
        fieldGroupName: name,
        showErrorObjectStatus: compileExpression(getRowStatusVisibility(name, true))
      };
    }
  }
  function _getImpNumber(dataField) {
    var _dataField$annotation17, _dataField$annotation18;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation17 = dataField.annotations) === null || _dataField$annotation17 === void 0 ? void 0 : (_dataField$annotation18 = _dataField$annotation17.UI) === null || _dataField$annotation18 === void 0 ? void 0 : _dataField$annotation18.Importance;
    if (importance && importance.includes("UI.ImportanceType/High")) {
      return 3;
    }
    if (importance && importance.includes("UI.ImportanceType/Medium")) {
      return 2;
    }
    if (importance && importance.includes("UI.ImportanceType/Low")) {
      return 1;
    }
    return 0;
  }
  function _getDataFieldImportance(dataField) {
    var _dataField$annotation19, _dataField$annotation20;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation19 = dataField.annotations) === null || _dataField$annotation19 === void 0 ? void 0 : (_dataField$annotation20 = _dataField$annotation19.UI) === null || _dataField$annotation20 === void 0 ? void 0 : _dataField$annotation20.Importance;
    return importance ? importance.split("/")[1] : Importance.None;
  }
  function _getMaxImportance(fields) {
    if (fields && fields.length > 0) {
      let maxImpNumber = -1;
      let impNumber = -1;
      let DataFieldWithMaxImportance;
      for (const field of fields) {
        impNumber = _getImpNumber(field);
        if (impNumber > maxImpNumber) {
          maxImpNumber = impNumber;
          DataFieldWithMaxImportance = field;
        }
      }
      return _getDataFieldImportance(DataFieldWithMaxImportance);
    }
    return Importance.None;
  }

  /**
   * Returns the importance value for a column.
   *
   * @param dataField
   * @param semanticKeys
   * @returns The importance value
   */
  function getImportance(dataField, semanticKeys) {
    var _Value6;
    //Evaluate default Importance is not set explicitly
    let fieldsWithImportance,
      mapSemanticKeys = [];
    //Check if semanticKeys are defined at the EntitySet level
    if (semanticKeys && semanticKeys.length > 0) {
      mapSemanticKeys = semanticKeys.map(function (key) {
        return key.value;
      });
    }
    if (!dataField) {
      return undefined;
    }
    if (isAnnotationOfType(dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
      const dataFieldTarget = dataField.Target.$target;
      if (isAnnotationOfType(dataFieldTarget, "com.sap.vocabularies.UI.v1.FieldGroupType")) {
        const fieldGroupData = dataFieldTarget.Data;
        const fieldGroupHasSemanticKey = fieldGroupData && fieldGroupData.some(function (fieldGroupDataField) {
          var _Value4, _Value5;
          return (fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value4 = fieldGroupDataField.Value) === null || _Value4 === void 0 ? void 0 : _Value4.path) && fieldGroupDataField.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && mapSemanticKeys.includes(fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value5 = fieldGroupDataField.Value) === null || _Value5 === void 0 ? void 0 : _Value5.path);
        });
        //If a FieldGroup contains a semanticKey, importance set to High
        if (fieldGroupHasSemanticKey) {
          return Importance.High;
        } else {
          var _dataField$annotation21, _dataField$annotation22;
          //If the DataFieldForAnnotation has an Importance we take it
          if (dataField !== null && dataField !== void 0 && (_dataField$annotation21 = dataField.annotations) !== null && _dataField$annotation21 !== void 0 && (_dataField$annotation22 = _dataField$annotation21.UI) !== null && _dataField$annotation22 !== void 0 && _dataField$annotation22.Importance) {
            return _getDataFieldImportance(dataField);
          }
          // else the highest importance (if any) is returned
          fieldsWithImportance = fieldGroupData && fieldGroupData.filter(function (item) {
            var _item$annotations, _item$annotations$UI;
            return item === null || item === void 0 ? void 0 : (_item$annotations = item.annotations) === null || _item$annotations === void 0 ? void 0 : (_item$annotations$UI = _item$annotations.UI) === null || _item$annotations$UI === void 0 ? void 0 : _item$annotations$UI.Importance;
          });
          return _getMaxImportance(fieldsWithImportance);
        }
        //If the current field is a semanticKey, importance set to High
      }
    }

    return dataField.Value && dataField !== null && dataField !== void 0 && (_Value6 = dataField.Value) !== null && _Value6 !== void 0 && _Value6.path && mapSemanticKeys.includes(dataField.Value.path) ? Importance.High : _getDataFieldImportance(dataField);
  }

  /**
   * Returns line items from metadata annotations.
   *
   * @param lineItemAnnotation Collection of data fields with their annotations
   * @param visualizationPath The visualization path
   * @param converterContext The converter context
   * @returns The columns from the annotations
   */
  _exports.getImportance = getImportance;
  const getColumnsFromAnnotations = function (lineItemAnnotation, visualizationPath, converterContext) {
    var _tableManifestSetting2;
    const entityType = converterContext.getAnnotationEntityType(lineItemAnnotation),
      annotationColumns = [],
      columnsToBeCreated = {},
      nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet()),
      tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath),
      tableType = (tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting2 = tableManifestSettings.tableSettings) === null || _tableManifestSetting2 === void 0 ? void 0 : _tableManifestSetting2.type) || "ResponsiveTable";
    const textOnlyColumnsFromTextAnnotation = [];
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    if (lineItemAnnotation) {
      const tableConverterContext = converterContext.getConverterContextFor(getTargetObjectPath(converterContext.getDataModelObjectPath()));
      lineItemAnnotation.forEach(lineItem => {
        var _lineItem$Value, _lineItem$Value$$targ, _lineItem$Target, _lineItem$Target$$tar, _propertyTypeConfig, _propertyTypeConfig2, _lineItem$annotations, _lineItem$annotations2, _lineItem$annotations3, _lineItem$annotations4, _exportSettings;
        if (!_isValidColumn(lineItem)) {
          return;
        }
        let exportSettings = null;
        const semanticObjectAnnotationPath = isDataFieldTypes(lineItem) && (_lineItem$Value = lineItem.Value) !== null && _lineItem$Value !== void 0 && (_lineItem$Value$$targ = _lineItem$Value.$target) !== null && _lineItem$Value$$targ !== void 0 && _lineItem$Value$$targ.fullyQualifiedName ? getSemanticObjectPath(converterContext, lineItem) : undefined;
        const relativePath = _getRelativePath(lineItem);

        // Determine properties which are consumed by this LineItem.
        const relatedPropertiesInfo = collectRelatedPropertiesRecursively(lineItem, converterContext, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        const groupPath = _sliceAtSlash(relativePath, true, false);
        const isGroup = groupPath != relativePath;
        const sLabel = getLabel(lineItem, isGroup);
        const name = _getAnnotationColumnName(lineItem);
        const isFieldGroupColumn = groupPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) > -1;
        const showDataFieldsLabel = isFieldGroupColumn ? _getShowDataFieldsLabel(name, visualizationPath, converterContext) : false;
        const dataType = getDataFieldDataType(lineItem);
        const sDateInputFormat = dataType === "Edm.Date" ? "YYYY-MM-DD" : undefined;
        const formatOptions = _getDefaultFormatOptionsForTable(getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, lineItem));
        let fieldGroupHiddenExpressions;
        if (lineItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_lineItem$Target = lineItem.Target) === null || _lineItem$Target === void 0 ? void 0 : (_lineItem$Target$$tar = _lineItem$Target.$target) === null || _lineItem$Target$$tar === void 0 ? void 0 : _lineItem$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          fieldGroupHiddenExpressions = _getFieldGroupHiddenExpressions(lineItem);
        }
        if (_isExportableColumn(lineItem)) {
          //exclude the types listed above for the Export (generates error on Export as PDF)
          exportSettings = {
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping,
            type: dataType ? _getExportDataType(dataType, relatedPropertyNames.length > 1) : undefined,
            inputFormat: sDateInputFormat,
            delimiter: dataType === "Edm.Int64"
          };
          if (relatedPropertiesInfo.exportUnitName) {
            exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
        }
        let propertyTypeConfig;
        if (dataType) {
          propertyTypeConfig = getTypeConfig(lineItem, dataType);
        }
        const typeConfig = {
          className: dataType,
          formatOptions: {
            ...formatOptions,
            ...((_propertyTypeConfig = propertyTypeConfig) === null || _propertyTypeConfig === void 0 ? void 0 : _propertyTypeConfig.formatOptions)
          },
          constraints: {
            ...((_propertyTypeConfig2 = propertyTypeConfig) === null || _propertyTypeConfig2 === void 0 ? void 0 : _propertyTypeConfig2.constraints)
          }
        };
        const visualSettings = {};
        if (!dataType || !typeConfig) {
          // for charts
          visualSettings.widthCalculation = null;
        }
        const isMultiValue = _isColumnMultiValued(lineItem, tableConverterContext);
        const sortable = !isMultiValue && _isColumnSortable(lineItem, relativePath, nonSortableColumns);
        const column = {
          key: KeyHelper.generateKeyFromDataField(lineItem),
          type: ColumnType.Annotation,
          label: sLabel,
          groupLabel: isGroup ? getLabel(lineItem) : undefined,
          group: isGroup ? groupPath : undefined,
          FieldGroupHiddenExpressions: fieldGroupHiddenExpressions,
          annotationPath: converterContext.getEntitySetBasedAnnotationPath(lineItem.fullyQualifiedName),
          semanticObjectPath: semanticObjectAnnotationPath,
          availability: isReferencePropertyStaticallyHidden(lineItem) ? "Hidden" : "Default",
          name: name,
          showDataFieldsLabel: showDataFieldsLabel,
          relativePath: relativePath,
          sortable: sortable,
          propertyInfos: relatedPropertyNames.length ? relatedPropertyNames : undefined,
          additionalPropertyInfos: additionalPropertyNames.length > 0 ? additionalPropertyNames : undefined,
          exportSettings: exportSettings,
          width: ((_lineItem$annotations = lineItem.annotations) === null || _lineItem$annotations === void 0 ? void 0 : (_lineItem$annotations2 = _lineItem$annotations.HTML5) === null || _lineItem$annotations2 === void 0 ? void 0 : (_lineItem$annotations3 = _lineItem$annotations2.CssDefaults) === null || _lineItem$annotations3 === void 0 ? void 0 : (_lineItem$annotations4 = _lineItem$annotations3.width) === null || _lineItem$annotations4 === void 0 ? void 0 : _lineItem$annotations4.valueOf()) || undefined,
          importance: getImportance(lineItem, semanticKeys),
          isNavigable: true,
          formatOptions: formatOptions,
          caseSensitive: isFilteringCaseSensitive(converterContext),
          typeConfig: typeConfig,
          visualSettings: visualSettings,
          timezoneText: (_exportSettings = exportSettings) === null || _exportSettings === void 0 ? void 0 : _exportSettings.timezone,
          isPartOfLineItem: true
        };
        const sTooltip = _getTooltip(lineItem);
        if (sTooltip) {
          column.tooltip = sTooltip;
        }
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        if (relatedPropertiesInfo.exportDataPointTargetValue && column.exportSettings) {
          column.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
          column.exportSettings.type = "String";
        }
        annotationColumns.push(column);

        // Collect information of related columns to be created.
        relatedPropertyNames.forEach(relatedPropertyName => {
          columnsToBeCreated[relatedPropertyName] = relatedPropertiesInfo.properties[relatedPropertyName];

          // In case of a multi-value, related properties cannot be sorted as we go through a 1-n relation
          if (isMultiValue) {
            nonSortableColumns.push(relatedPropertyName);
          }
        });

        // Create columns for additional properties identified for ALP use case.
        additionalPropertyNames.forEach(additionalPropertyName => {
          // Intentional overwrite as we require only one new PropertyInfo for a related Property.
          columnsToBeCreated[additionalPropertyName] = relatedPropertiesInfo.additionalProperties[additionalPropertyName];
        });
      });
    }

    // Get columns from the Properties of EntityType
    return getColumnsFromEntityType(columnsToBeCreated, entityType, annotationColumns, nonSortableColumns, converterContext, tableType, textOnlyColumnsFromTextAnnotation);
  };

  /**
   * Gets the property names from the manifest and checks against existing properties already added by annotations.
   * If a not yet stored property is found it adds it for sorting and filtering only to the annotationColumns.
   *
   * @param properties
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @returns The columns from the annotations
   */
  const _getPropertyNames = function (properties, annotationColumns, converterContext, entityType) {
    let matchedProperties;
    if (properties) {
      matchedProperties = properties.map(function (propertyPath) {
        const annotationColumn = annotationColumns.find(function (annotationColumn) {
          return annotationColumn.relativePath === propertyPath && annotationColumn.propertyInfos === undefined;
        });
        if (annotationColumn) {
          return annotationColumn.name;
        } else {
          const relatedColumns = _createRelatedColumns({
            [propertyPath]: entityType.resolvePath(propertyPath)
          }, annotationColumns, [], converterContext, entityType, []);
          annotationColumns.push(relatedColumns[0]);
          return relatedColumns[0].name;
        }
      });
    }
    return matchedProperties;
  };
  const _appendCustomTemplate = function (properties) {
    return properties.map(property => {
      return `{${properties.indexOf(property)}}`;
    }).join(`${"\n"}`);
  };

  /**
   * Returns table column definitions from manifest.
   *
   * These may be custom columns defined in the manifest, slot columns coming through
   * a building block, or annotation columns to overwrite annotation-based columns.
   *
   * @param columns
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @param navigationSettings
   * @returns The columns from the manifest
   */
  const getColumnsFromManifest = function (columns, annotationColumns, converterContext, entityType, navigationSettings) {
    const internalColumns = {};
    function isAnnotationColumn(column, key) {
      return annotationColumns.some(annotationColumn => annotationColumn.key === key);
    }
    function isSlotColumn(manifestColumn) {
      return manifestColumn.type === ColumnType.Slot;
    }
    function isCustomColumn(manifestColumn) {
      return manifestColumn.type === undefined && !!manifestColumn.template;
    }
    function _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationTableColumns) {
      const nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
      propertyInfos.forEach(property => {
        annotationTableColumns.forEach(prop => {
          if (prop.name === property) {
            prop.sortable = nonSortableColumns.indexOf(property.replace("Property::", "")) === -1;
            prop.isGroupable = prop.sortable;
          }
        });
      });
    }
    for (const key in columns) {
      var _manifestColumn$posit;
      const manifestColumn = columns[key];
      KeyHelper.validateKey(key);

      // BaseTableColumn
      const baseTableColumn = {
        key: key,
        width: manifestColumn.width || undefined,
        position: {
          anchor: (_manifestColumn$posit = manifestColumn.position) === null || _manifestColumn$posit === void 0 ? void 0 : _manifestColumn$posit.anchor,
          placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
        },
        caseSensitive: isFilteringCaseSensitive(converterContext)
      };
      if (isAnnotationColumn(manifestColumn, key)) {
        const propertiesToOverwriteAnnotationColumn = {
          ...baseTableColumn,
          importance: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance,
          horizontalAlign: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign,
          availability: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability,
          type: ColumnType.Annotation,
          isNavigable: isAnnotationColumn(manifestColumn, key) ? undefined : isActionNavigable(manifestColumn, navigationSettings, true),
          settings: manifestColumn.settings,
          formatOptions: _getDefaultFormatOptionsForTable(manifestColumn.formatOptions)
        };
        internalColumns[key] = propertiesToOverwriteAnnotationColumn;
      } else {
        const propertyInfos = _getPropertyNames(manifestColumn.properties, annotationColumns, converterContext, entityType);
        const baseManifestColumn = {
          ...baseTableColumn,
          header: manifestColumn.header,
          importance: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance) || Importance.None,
          horizontalAlign: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign) || HorizontalAlign.Begin,
          availability: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability) || "Default",
          template: manifestColumn.template,
          propertyInfos: propertyInfos,
          exportSettings: propertyInfos ? {
            template: _appendCustomTemplate(propertyInfos),
            wrap: !!(propertyInfos.length > 1)
          } : null,
          id: `CustomColumn::${key}`,
          name: `CustomColumn::${key}`,
          //Needed for MDC:
          formatOptions: {
            textLinesEdit: 4
          },
          isGroupable: false,
          isNavigable: false,
          sortable: false,
          visualSettings: {
            widthCalculation: null
          },
          properties: manifestColumn.properties
        };
        if (propertyInfos) {
          _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationColumns);
        }
        if (isSlotColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Slot
          };
          internalColumns[key] = customTableColumn;
        } else if (isCustomColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Default
          };
          internalColumns[key] = customTableColumn;
        } else {
          var _IssueCategoryType$An;
          const message = `The annotation column '${key}' referenced in the manifest is not found`;
          converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, message, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.AnnotationColumns) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.InvalidKey);
        }
      }
    }
    return internalColumns;
  };
  function getP13nMode(visualizationPath, converterContext, tableManifestConfiguration) {
    var _tableManifestSetting3;
    const manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const variantManagement = manifestWrapper.getVariantManagement();
    const aPersonalization = [];
    const isAnalyticalTable = tableManifestConfiguration.type === "AnalyticalTable";
    const isResponsiveTable = tableManifestConfiguration.type === "ResponsiveTable";
    if ((tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting3 = tableManifestSettings.tableSettings) === null || _tableManifestSetting3 === void 0 ? void 0 : _tableManifestSetting3.personalization) !== undefined) {
      // Personalization configured in manifest.
      const personalization = tableManifestSettings.tableSettings.personalization;
      if (personalization === true) {
        // Table personalization fully enabled.
        switch (tableManifestConfiguration.type) {
          case "AnalyticalTable":
            return "Sort,Column,Filter,Group,Aggregate";
          case "ResponsiveTable":
            return "Sort,Column,Filter,Group";
          default:
            return "Sort,Column,Filter";
        }
      } else if (typeof personalization === "object") {
        // Specific personalization options enabled in manifest. Use them as is.
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        if (personalization.column) {
          aPersonalization.push("Column");
        }
        if (personalization.filter) {
          aPersonalization.push("Filter");
        }
        if (personalization.group && (isAnalyticalTable || isResponsiveTable)) {
          aPersonalization.push("Group");
        }
        if (personalization.aggregate && isAnalyticalTable) {
          aPersonalization.push("Aggregate");
        }
        return aPersonalization.length > 0 ? aPersonalization.join(",") : undefined;
      }
    } else {
      // No personalization configured in manifest.
      aPersonalization.push("Sort");
      aPersonalization.push("Column");
      if (converterContext.getTemplateType() === TemplateType.ListReport) {
        if (variantManagement === VariantManagementType.Control || _isFilterBarHidden(manifestWrapper, converterContext)) {
          // Feature parity with V2.
          // Enable table filtering by default only in case of Control level variant management.
          // Or when the LR filter bar is hidden via manifest setting
          aPersonalization.push("Filter");
        }
      } else {
        aPersonalization.push("Filter");
      }
      if (isAnalyticalTable) {
        aPersonalization.push("Group");
        aPersonalization.push("Aggregate");
      }
      if (isResponsiveTable) {
        aPersonalization.push("Group");
      }
      return aPersonalization.join(",");
    }
    return undefined;
  }

  /**
   * Returns a Boolean value suggesting if a filter bar is being used on the page.
   *
   * Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
   * Until then, hiding filter bar is now allowed if a chart is being used on LR.
   *
   * @param manifestWrapper Manifest settings getter for the page
   * @param converterContext The instance of the converter context
   * @returns Boolean suggesting if a filter bar is being used on the page.
   */
  _exports.getP13nMode = getP13nMode;
  function _isFilterBarHidden(manifestWrapper, converterContext) {
    return manifestWrapper.isFilterBarHidden() && !converterContext.getManifestWrapper().hasMultipleVisualizations() && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage;
  }

  /**
   * Returns a JSON string containing the sort conditions for the presentation variant.
   *
   * @param converterContext The instance of the converter context
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Table columns processed by the converter
   * @returns Sort conditions for a presentation variant.
   */
  function getSortConditions(converterContext, presentationVariantAnnotation, columns) {
    // Currently navigation property is not supported as sorter
    const nonSortableProperties = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
    let sortConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.SortOrder) {
      const sorters = [];
      const conditions = {
        sorters: sorters
      };
      presentationVariantAnnotation.SortOrder.forEach(condition => {
        var _conditionProperty$$t;
        const conditionProperty = condition.Property;
        if (conditionProperty && nonSortableProperties.indexOf((_conditionProperty$$t = conditionProperty.$target) === null || _conditionProperty$$t === void 0 ? void 0 : _conditionProperty$$t.name) === -1) {
          const infoName = convertPropertyPathsToInfoNames([conditionProperty], columns)[0];
          if (infoName) {
            conditions.sorters.push({
              name: infoName,
              descending: !!condition.Descending
            });
          }
        }
      });
      sortConditions = conditions.sorters.length ? JSON.stringify(conditions) : undefined;
    }
    return sortConditions;
  }
  function getInitialExpansionLevel(presentationVariantAnnotation) {
    var _presentationVariantA;
    if (!presentationVariantAnnotation) {
      return undefined;
    }
    const level = (_presentationVariantA = presentationVariantAnnotation.InitialExpansionLevel) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.valueOf();
    return typeof level === "number" ? level : undefined;
  }
  /**
   * Converts an array of propertyPath to an array of propertyInfo names.
   *
   * @param paths the array to be converted
   * @param columns the array of propertyInfos
   * @returns an array of propertyInfo names
   */

  function convertPropertyPathsToInfoNames(paths, columns) {
    const infoNames = [];
    let propertyInfo, annotationColumn;
    paths.forEach(currentPath => {
      if (currentPath !== null && currentPath !== void 0 && currentPath.value) {
        propertyInfo = columns.find(column => {
          annotationColumn = column;
          return !annotationColumn.propertyInfos && annotationColumn.relativePath === (currentPath === null || currentPath === void 0 ? void 0 : currentPath.value);
        });
        if (propertyInfo) {
          infoNames.push(propertyInfo.name);
        }
      }
    });
    return infoNames;
  }

  /**
   * Returns a JSON string containing Presentation Variant group conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @param tableType The table type.
   * @returns Group conditions for a Presentation variant.
   */
  function getGroupConditions(presentationVariantAnnotation, columns, tableType) {
    let groupConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.GroupBy) {
      let aGroupBy = presentationVariantAnnotation.GroupBy;
      if (tableType === "ResponsiveTable") {
        aGroupBy = aGroupBy.slice(0, 1);
      }
      const aGroupLevels = convertPropertyPathsToInfoNames(aGroupBy, columns).map(infoName => {
        return {
          name: infoName
        };
      });
      groupConditions = aGroupLevels.length ? JSON.stringify({
        groupLevels: aGroupLevels
      }) : undefined;
    }
    return groupConditions;
  }
  /**
   * Updates the column's propertyInfos of a analytical table integrating all extensions and binding-relevant property info part.
   *
   * @param tableVisualization The visualization to be updated
   */

  function _updatePropertyInfosWithAggregatesDefinitions(tableVisualization) {
    const relatedAdditionalPropertyNameMap = {};
    tableVisualization.columns.forEach(column => {
      var _column$additionalPro2;
      column = column;
      const aggregatablePropertyName = Object.keys(tableVisualization.aggregates).find(aggregate => aggregate === column.name);
      if (aggregatablePropertyName) {
        const aggregatablePropertyDefinition = tableVisualization.aggregates[aggregatablePropertyName];
        column.aggregatable = true;
        column.extension = {
          customAggregate: aggregatablePropertyDefinition.defaultAggregate ?? {}
        };
      }
      if ((_column$additionalPro2 = column.additionalPropertyInfos) !== null && _column$additionalPro2 !== void 0 && _column$additionalPro2.length) {
        column.additionalPropertyInfos.forEach(additionalPropertyInfo => {
          // Create propertyInfo for each additional property.
          // The new property 'name' has been prefixed with 'Property_Technical::' for uniqueness and it has been named technical property as it requires dedicated MDC attributes (technicallyGroupable and technicallyAggregatable).
          createTechnicalProperty(additionalPropertyInfo, tableVisualization.columns, relatedAdditionalPropertyNameMap);
        });
      }
    });
    tableVisualization.columns.forEach(column => {
      column = column;
      if (column.additionalPropertyInfos) {
        var _column$propertyInfos3;
        column.additionalPropertyInfos = column.additionalPropertyInfos.map(propertyInfo => relatedAdditionalPropertyNameMap[propertyInfo] ?? propertyInfo);
        // Add additional properties to the complex property using the hidden annotation.
        column.propertyInfos = (_column$propertyInfos3 = column.propertyInfos) === null || _column$propertyInfos3 === void 0 ? void 0 : _column$propertyInfos3.concat(column.additionalPropertyInfos);
      }
    });
  }

  /**
   * Returns a JSON string containing Presentation Variant aggregate conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @returns Group conditions for a Presentation variant.
   */
  function getAggregateConditions(presentationVariantAnnotation, columns) {
    let aggregateConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.Total) {
      const aTotals = presentationVariantAnnotation.Total;
      const aggregates = {};
      convertPropertyPathsToInfoNames(aTotals, columns).forEach(infoName => {
        aggregates[infoName] = {};
      });
      aggregateConditions = JSON.stringify(aggregates);
    }
    return aggregateConditions;
  }
  function getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfiguration, columns, presentationVariantAnnotation, viewConfiguration) {
    var _converterContext$get16, _converterContext$get17, _converterContext$get18;
    // Need to get the target
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const typeNamePlural = (_converterContext$get16 = converterContext.getDataModelObjectPath().targetEntityType.annotations) === null || _converterContext$get16 === void 0 ? void 0 : (_converterContext$get17 = _converterContext$get16.UI) === null || _converterContext$get17 === void 0 ? void 0 : (_converterContext$get18 = _converterContext$get17.HeaderInfo) === null || _converterContext$get18 === void 0 ? void 0 : _converterContext$get18.TypeNamePlural;
    const title = typeNamePlural && compileExpression(getExpressionFromAnnotation(typeNamePlural));
    const entitySet = converterContext.getDataModelObjectPath().targetEntitySet;
    const pageManifestSettings = converterContext.getManifestWrapper();
    const hasAbsolutePath = navigationPropertyPath.length === 0,
      p13nMode = getP13nMode(visualizationPath, converterContext, tableManifestConfiguration),
      id = navigationPropertyPath ? getTableID(visualizationPath) : getTableID(converterContext.getContextPath(), "LineItem");
    const targetCapabilities = getCapabilityRestriction(converterContext);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationTargetPath);
    const creationBehaviour = _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath);
    const standardActionsContext = generateStandardActionsContext(converterContext, creationBehaviour.mode, tableManifestConfiguration, viewConfiguration);
    const deleteButtonVisibilityExpression = getDeleteVisibility(converterContext, standardActionsContext);
    const massEditButtonVisibilityExpression = getMassEditVisibility(converterContext, standardActionsContext);
    const isInsertUpdateTemplated = getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrStickySupported(converterContext));
    const selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, hasAbsolutePath, targetCapabilities, deleteButtonVisibilityExpression, massEditButtonVisibilityExpression);
    let threshold = navigationPropertyPath ? 10 : 30;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.MaxItems) {
      threshold = presentationVariantAnnotation.MaxItems.valueOf();
    }
    const variantManagement = pageManifestSettings.getVariantManagement();
    const isSearchable = isPathSearchable(converterContext.getDataModelObjectPath());
    const standardActions = {
      create: getStandardActionCreate(converterContext, standardActionsContext),
      delete: getStandardActionDelete(converterContext, standardActionsContext),
      paste: getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateTemplated),
      massEdit: getStandardActionMassEdit(converterContext, standardActionsContext),
      creationRow: getCreationRow(converterContext, standardActionsContext)
    };
    return {
      id: id,
      entityName: entitySet ? entitySet.name : "",
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      navigationPath: navigationPropertyPath,
      row: _getRowConfigurationProperty(lineItemAnnotation, converterContext, navigationSettings, navigationTargetPath, tableManifestConfiguration.type),
      p13nMode: p13nMode,
      standardActions: {
        actions: standardActions,
        isInsertUpdateTemplated: isInsertUpdateTemplated,
        updatablePropertyPath: getCurrentEntitySetUpdatablePath(converterContext)
      },
      displayMode: isInDisplayMode(converterContext, viewConfiguration),
      create: creationBehaviour,
      selectionMode: selectionMode,
      autoBindOnInit: _isFilterBarHidden(pageManifestSettings, converterContext) || converterContext.getTemplateType() !== TemplateType.ListReport && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage && !(viewConfiguration && pageManifestSettings.hasMultipleVisualizations(viewConfiguration)),
      variantManagement: variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement,
      threshold: threshold,
      sortConditions: getSortConditions(converterContext, presentationVariantAnnotation, columns),
      title: title,
      searchable: tableManifestConfiguration.type !== "AnalyticalTable" && !(isConstant(isSearchable) && isSearchable.value === false),
      initialExpansionLevel: getInitialExpansionLevel(presentationVariantAnnotation)
    };
  }
  _exports.getTableAnnotationConfiguration = getTableAnnotationConfiguration;
  function _getExportDataType(dataType) {
    let isComplexProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let exportDataType = "String";
    if (isComplexProperty) {
      if (dataType === "Edm.DateTimeOffset") {
        exportDataType = "DateTime";
      }
      return exportDataType;
    } else {
      switch (dataType) {
        case "Edm.Decimal":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.Double":
        case "Edm.Byte":
          exportDataType = "Number";
          break;
        case "Edm.DateOfTime":
        case "Edm.Date":
          exportDataType = "Date";
          break;
        case "Edm.DateTimeOffset":
          exportDataType = "DateTime";
          break;
        case "Edm.TimeOfDay":
          exportDataType = "Time";
          break;
        case "Edm.Boolean":
          exportDataType = "Boolean";
          break;
        default:
          exportDataType = "String";
      }
    }
    return exportDataType;
  }

  /**
   * Split the visualization path into the navigation property path and annotation.
   *
   * @param visualizationPath
   * @returns The split path
   */
  function splitPath(visualizationPath) {
    const [targetNavigationPropertyPath, annotationPath] = visualizationPath.split("@");
    let navigationPropertyPath = targetNavigationPropertyPath;
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    return {
      navigationPropertyPath,
      annotationPath
    };
  }
  _exports.splitPath = splitPath;
  function getSelectionVariantConfiguration(selectionVariantPath, converterContext) {
    const resolvedTarget = converterContext.getEntityTypeAnnotation(selectionVariantPath);
    const selection = resolvedTarget.annotation;
    if (selection) {
      var _selection$SelectOpti, _selection$Text;
      const propertyNames = [];
      (_selection$SelectOpti = selection.SelectOptions) === null || _selection$SelectOpti === void 0 ? void 0 : _selection$SelectOpti.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const propertyPath = (propertyName === null || propertyName === void 0 ? void 0 : propertyName.value) ?? "";
        if (propertyNames.indexOf(propertyPath) === -1) {
          propertyNames.push(propertyPath);
        }
      });
      return {
        text: selection === null || selection === void 0 ? void 0 : (_selection$Text = selection.Text) === null || _selection$Text === void 0 ? void 0 : _selection$Text.toString(),
        propertyNames: propertyNames
      };
    }
    return undefined;
  }
  _exports.getSelectionVariantConfiguration = getSelectionVariantConfiguration;
  function _getFullScreenBasedOnDevice(tableSettings, converterContext, isIphone) {
    // If enableFullScreen is not set, use as default true on phone and false otherwise
    let enableFullScreen = tableSettings.enableFullScreen ?? isIphone;
    // Make sure that enableFullScreen is not set on ListReport for desktop or tablet
    if (!isIphone && enableFullScreen && converterContext.getTemplateType() === TemplateType.ListReport) {
      enableFullScreen = false;
      converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, IssueType.FULLSCREENMODE_NOT_ON_LISTREPORT);
    }
    return enableFullScreen;
  }
  function _getMultiSelectMode(tableSettings, tableType, converterContext) {
    let multiSelectMode;
    if (tableType !== "ResponsiveTable") {
      return undefined;
    }
    switch (converterContext.getTemplateType()) {
      case TemplateType.ListReport:
      case TemplateType.AnalyticalListPage:
        multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        break;
      case TemplateType.ObjectPage:
        multiSelectMode = tableSettings.selectAll === false ? "ClearAll" : "Default";
        if (converterContext.getManifestWrapper().useIconTabBar()) {
          multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        }
        break;
      default:
    }
    return multiSelectMode;
  }
  function _getTableType(tableSettings, aggregationHelper, converterContext) {
    let tableType = (tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.type) || "ResponsiveTable";
    /*  Now, we keep the configuration in the manifest, even if it leads to errors.
    	We only change if we're not on desktop from Analytical/Tree to Responsive.
     */
    if ((tableType === "AnalyticalTable" || tableType === "TreeTable") && !converterContext.getManifestWrapper().isDesktop()) {
      tableType = "ResponsiveTable";
    }
    return tableType;
  }
  function _getGridTableMode(tableType, tableSettings, isTemplateListReport) {
    if (tableType === "GridTable") {
      if (isTemplateListReport) {
        return {
          rowCountMode: "Auto",
          rowCount: 3
        };
      } else {
        return {
          rowCountMode: tableSettings.rowCountMode ?? "Fixed",
          rowCount: tableSettings.rowCount ? tableSettings.rowCount : 5
        };
      }
    } else {
      return {};
    }
  }
  function _getCondensedTableLayout(_tableType, _tableSettings) {
    return _tableSettings.condensedTableLayout !== undefined && _tableType !== "ResponsiveTable" ? _tableSettings.condensedTableLayout : false;
  }
  function _getTableSelectionLimit(_tableSettings) {
    return _tableSettings.selectAll === true || _tableSettings.selectionLimit === 0 ? 0 : _tableSettings.selectionLimit || 200;
  }
  function _getTableInlineCreationRowCount(_tableSettings) {
    var _tableSettings$creati, _tableSettings$creati2;
    return (_tableSettings$creati = _tableSettings.creationMode) !== null && _tableSettings$creati !== void 0 && _tableSettings$creati.inlineCreationRowCount ? (_tableSettings$creati2 = _tableSettings.creationMode) === null || _tableSettings$creati2 === void 0 ? void 0 : _tableSettings$creati2.inlineCreationRowCount : 2;
  }
  function _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext) {
    var _tableSettings$quickV;
    if (quickSelectionVariant) {
      quickFilterPaths.push({
        annotationPath: path.annotationPath
      });
    }
    return {
      quickFilters: {
        enabled: converterContext.getTemplateType() !== TemplateType.ListReport,
        showCounts: tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV = tableSettings.quickVariantSelection) === null || _tableSettings$quickV === void 0 ? void 0 : _tableSettings$quickV.showCounts,
        paths: quickFilterPaths
      }
    };
  }
  function _getEnableExport(tableSettings, converterContext, enablePaste) {
    return tableSettings.enableExport !== undefined ? tableSettings.enableExport : converterContext.getTemplateType() !== "ObjectPage" || enablePaste;
  }
  function _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext) {
    var _tableSettings$quickV2, _tableSettings$quickV3, _tableSettings$quickV4;
    if (!lineItemAnnotation) {
      return {};
    }
    const quickFilterPaths = [];
    const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
    let quickSelectionVariant;
    let filters;
    tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV2 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV2 === void 0 ? void 0 : (_tableSettings$quickV3 = _tableSettings$quickV2.paths) === null || _tableSettings$quickV3 === void 0 ? void 0 : _tableSettings$quickV3.forEach(path => {
      quickSelectionVariant = targetEntityType.resolvePath(path.annotationPath);
      filters = _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext);
    });
    let hideTableTitle = false;
    hideTableTitle = !!((_tableSettings$quickV4 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV4 !== void 0 && _tableSettings$quickV4.hideTableTitle);
    return {
      filters: filters,
      headerVisible: !(quickSelectionVariant && hideTableTitle)
    };
  }
  function _getCollectedNavigationPropertyLabels(relativePath, converterContext) {
    const navigationProperties = enhanceDataModelPath(converterContext.getDataModelObjectPath(), relativePath).navigationProperties;
    if ((navigationProperties === null || navigationProperties === void 0 ? void 0 : navigationProperties.length) > 0) {
      const collectedNavigationPropertyLabels = [];
      navigationProperties.forEach(navProperty => {
        collectedNavigationPropertyLabels.push(getLabel(navProperty) || navProperty.name);
      });
      return collectedNavigationPropertyLabels;
    }
  }
  function getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext) {
    var _tableSettings$creati3, _tableSettings$creati4, _tableSettings$creati5, _tableSettings$creati6, _tableSettings$creati7, _tableSettings$creati8, _tableSettings$quickV5, _manifestWrapper$getV;
    let checkCondensedLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const _manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const tableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    const creationMode = ((_tableSettings$creati3 = tableSettings.creationMode) === null || _tableSettings$creati3 === void 0 ? void 0 : _tableSettings$creati3.name) || CreationMode.NewPage;
    const enableAutoColumnWidth = !_manifestWrapper.isPhone();
    const enablePaste = tableSettings.enablePaste !== undefined ? tableSettings.enablePaste : converterContext.getTemplateType() === "ObjectPage"; // Paste is disabled by default excepted for OP
    const templateType = converterContext.getTemplateType();
    const dataStateIndicatorFilter = templateType === TemplateType.ListReport ? "API.dataStateIndicatorFilter" : undefined;
    const isCondensedTableLayoutCompliant = checkCondensedLayout && _manifestWrapper.isCondensedLayoutCompliant();
    const oFilterConfiguration = _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext);
    const customValidationFunction = (_tableSettings$creati4 = tableSettings.creationMode) === null || _tableSettings$creati4 === void 0 ? void 0 : _tableSettings$creati4.customValidationFunction;
    const entityType = converterContext.getEntityType();
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    const tableType = _getTableType(tableSettings, aggregationHelper, converterContext);
    const gridTableRowMode = _getGridTableMode(tableType, tableSettings, templateType === TemplateType.ListReport);
    const condensedTableLayout = _getCondensedTableLayout(tableType, tableSettings);
    const oConfiguration = {
      // If no createAtEnd is specified it will be false for Inline create and true otherwise
      createAtEnd: ((_tableSettings$creati5 = tableSettings.creationMode) === null || _tableSettings$creati5 === void 0 ? void 0 : _tableSettings$creati5.createAtEnd) !== undefined ? (_tableSettings$creati6 = tableSettings.creationMode) === null || _tableSettings$creati6 === void 0 ? void 0 : _tableSettings$creati6.createAtEnd : creationMode !== CreationMode.Inline,
      creationMode: creationMode,
      customValidationFunction: customValidationFunction,
      dataStateIndicatorFilter: dataStateIndicatorFilter,
      // if a custom validation function is provided, disableAddRowButtonForEmptyData should not be considered, i.e. set to false
      disableAddRowButtonForEmptyData: !customValidationFunction ? !!((_tableSettings$creati7 = tableSettings.creationMode) !== null && _tableSettings$creati7 !== void 0 && _tableSettings$creati7.disableAddRowButtonForEmptyData) : false,
      enableAutoColumnWidth: enableAutoColumnWidth,
      enableExport: _getEnableExport(tableSettings, converterContext, enablePaste),
      enableFullScreen: _getFullScreenBasedOnDevice(tableSettings, converterContext, _manifestWrapper.isPhone()),
      enableMassEdit: tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.enableMassEdit,
      enablePaste: enablePaste,
      headerVisible: true,
      multiSelectMode: _getMultiSelectMode(tableSettings, tableType, converterContext),
      selectionLimit: _getTableSelectionLimit(tableSettings),
      inlineCreationRowCount: _getTableInlineCreationRowCount(tableSettings),
      inlineCreationRowsHiddenInEditMode: (tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$creati8 = tableSettings.creationMode) === null || _tableSettings$creati8 === void 0 ? void 0 : _tableSettings$creati8.inlineCreationRowsHiddenInEditMode) ?? false,
      showRowCount: !(tableSettings !== null && tableSettings !== void 0 && (_tableSettings$quickV5 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV5 !== void 0 && _tableSettings$quickV5.showCounts) && !((_manifestWrapper$getV = _manifestWrapper.getViewConfiguration()) !== null && _manifestWrapper$getV !== void 0 && _manifestWrapper$getV.showCounts),
      type: tableType,
      useCondensedTableLayout: condensedTableLayout && isCondensedTableLayoutCompliant,
      isCompactType: _manifestWrapper.isCompactType()
    };
    const tableConfiguration = {
      ...oConfiguration,
      ...gridTableRowMode,
      ...oFilterConfiguration
    };
    if (tableType === "TreeTable") {
      tableConfiguration.hierarchyQualifier = tableSettings.hierarchyQualifier;
    }
    return tableConfiguration;
  }
  _exports.getTableManifestConfiguration = getTableManifestConfiguration;
  function getTypeConfig(oProperty, dataType) {
    var _oTargetMapping, _propertyTypeConfig$t, _propertyTypeConfig$t2, _propertyTypeConfig$t3, _propertyTypeConfig$t4;
    let oTargetMapping;
    if (isProperty(oProperty)) {
      oTargetMapping = isTypeDefinition(oProperty.targetType) ? EDM_TYPE_MAPPING[oProperty.targetType.underlyingType] : EDM_TYPE_MAPPING[oProperty.type];
    }
    if (oTargetMapping === undefined && dataType !== undefined) {
      oTargetMapping = EDM_TYPE_MAPPING[dataType];
    }
    const propertyTypeConfig = {
      type: (_oTargetMapping = oTargetMapping) === null || _oTargetMapping === void 0 ? void 0 : _oTargetMapping.type,
      constraints: {},
      formatOptions: {}
    };
    if (isProperty(oProperty) && oTargetMapping !== undefined) {
      var _oTargetMapping$const, _oTargetMapping$const2, _oTargetMapping$const3, _oTargetMapping$const4, _oTargetMapping$const5, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oTargetMapping$const6, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oTargetMapping$const7, _oProperty$annotation16, _oProperty$annotation17;
      propertyTypeConfig.constraints = {
        scale: (_oTargetMapping$const = oTargetMapping.constraints) !== null && _oTargetMapping$const !== void 0 && _oTargetMapping$const.$Scale ? oProperty.scale : undefined,
        precision: (_oTargetMapping$const2 = oTargetMapping.constraints) !== null && _oTargetMapping$const2 !== void 0 && _oTargetMapping$const2.$Precision ? oProperty.precision : undefined,
        maxLength: (_oTargetMapping$const3 = oTargetMapping.constraints) !== null && _oTargetMapping$const3 !== void 0 && _oTargetMapping$const3.$MaxLength ? oProperty.maxLength : undefined,
        nullable: (_oTargetMapping$const4 = oTargetMapping.constraints) !== null && _oTargetMapping$const4 !== void 0 && _oTargetMapping$const4.$Nullable ? oProperty.nullable : undefined,
        minimum: (_oTargetMapping$const5 = oTargetMapping.constraints) !== null && _oTargetMapping$const5 !== void 0 && _oTargetMapping$const5["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_oProperty$annotation8 = oProperty.annotations) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Validation) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.Minimum) ? `${(_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Validation) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Minimum}` : undefined,
        maximum: (_oTargetMapping$const6 = oTargetMapping.constraints) !== null && _oTargetMapping$const6 !== void 0 && _oTargetMapping$const6["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Validation) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Maximum) ? `${(_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Validation) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Maximum}` : undefined,
        isDigitSequence: propertyTypeConfig.type === "sap.ui.model.odata.type.String" && (_oTargetMapping$const7 = oTargetMapping.constraints) !== null && _oTargetMapping$const7 !== void 0 && _oTargetMapping$const7[`@${"com.sap.vocabularies.Common.v1.IsDigitSequence"}`] && (_oProperty$annotation16 = oProperty.annotations) !== null && _oProperty$annotation16 !== void 0 && (_oProperty$annotation17 = _oProperty$annotation16.Common) !== null && _oProperty$annotation17 !== void 0 && _oProperty$annotation17.IsDigitSequence ? true : undefined
      };
    }
    propertyTypeConfig.formatOptions = {
      parseAsString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t = propertyTypeConfig.type) === null || _propertyTypeConfig$t === void 0 ? void 0 : _propertyTypeConfig$t.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t2 = propertyTypeConfig.type) === null || _propertyTypeConfig$t2 === void 0 ? void 0 : _propertyTypeConfig$t2.indexOf("sap.ui.model.odata.type.Double")) === 0 ? false : undefined,
      emptyString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t3 = propertyTypeConfig.type) === null || _propertyTypeConfig$t3 === void 0 ? void 0 : _propertyTypeConfig$t3.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t4 = propertyTypeConfig.type) === null || _propertyTypeConfig$t4 === void 0 ? void 0 : _propertyTypeConfig$t4.indexOf("sap.ui.model.odata.type.Double")) === 0 ? "" : undefined,
      parseKeepsEmptyString: propertyTypeConfig.type === "sap.ui.model.odata.type.String" ? true : undefined
    };
    return propertyTypeConfig;
  }
  _exports.getTypeConfig = getTypeConfig;
  return {
    getTableActions,
    getTableColumns,
    getColumnsFromEntityType,
    updateLinkedProperties,
    createTableVisualization,
    createDefaultTableVisualization,
    getCapabilityRestriction,
    getSelectionMode,
    getRowStatusVisibility,
    getImportance,
    getP13nMode,
    getTableAnnotationConfiguration,
    isFilteringCaseSensitive,
    splitPath,
    getSelectionVariantConfiguration,
    getTableManifestConfiguration,
    getTypeConfig,
    updateTableVisualizationForType
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2x1bW5UeXBlIiwiZ2V0VGFibGVBY3Rpb25zIiwibGluZUl0ZW1Bbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvblBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0IiwibmF2aWdhdGlvblNldHRpbmdzIiwiYVRhYmxlQWN0aW9ucyIsImdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMiLCJhQW5ub3RhdGlvbkFjdGlvbnMiLCJ0YWJsZUFjdGlvbnMiLCJhSGlkZGVuQWN0aW9ucyIsImhpZGRlblRhYmxlQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImlzTmF2aWdhYmxlIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZW5hYmxlT25TZWxlY3QiLCJlbmFibGVBdXRvU2Nyb2xsIiwiZW5hYmxlZCIsInZpc2libGUiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJjb21tYW5kIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJjb21tYW5kQWN0aW9ucyIsImdldFRhYmxlQ29sdW1ucyIsImFubm90YXRpb25Db2x1bW5zIiwiZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyIsIm1hbmlmZXN0Q29sdW1ucyIsImdldENvbHVtbnNGcm9tTWFuaWZlc3QiLCJjb2x1bW5zIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJ3aWR0aCIsImltcG9ydGFuY2UiLCJob3Jpem9udGFsQWxpZ24iLCJhdmFpbGFiaWxpdHkiLCJzZXR0aW5ncyIsImZvcm1hdE9wdGlvbnMiLCJnZXRBZ2dyZWdhdGVEZWZpbml0aW9uc0Zyb21FbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsInRhYmxlQ29sdW1ucyIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJmaW5kQ29sdW1uRnJvbVBhdGgiLCJwYXRoIiwiZmluZCIsImNvbHVtbiIsImFubm90YXRpb25Db2x1bW4iLCJwcm9wZXJ0eUluZm9zIiwidW5kZWZpbmVkIiwicmVsYXRpdmVQYXRoIiwiaXNBbmFseXRpY3NTdXBwb3J0ZWQiLCJjdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMiLCJTZXQiLCJmb3JFYWNoIiwidGFibGVDb2x1bW4iLCJ1bml0IiwiYWRkIiwiY3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsImRlZmluaXRpb25zIiwiYW5ub3RhdGlvbiIsImFnZ3JlZ2F0ZWRQcm9wZXJ0eSIsIl9lbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsInByb3BlcnR5IiwibmFtZSIsInF1YWxpZmllciIsImNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiQ29udGV4dERlZmluaW5nUHJvcGVydGllcyIsIm1hcCIsImN0eERlZlByb3BlcnR5IiwidmFsdWUiLCJyZXN1bHQiLCJyYXdDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwiaGFzIiwiZGVmYXVsdEFnZ3JlZ2F0ZSIsImNvbnRleHREZWZpbmluZ1Byb3BlcnR5TmFtZSIsImZvdW5kQ29sdW1uIiwicHVzaCIsImxlbmd0aCIsInVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGUiLCJ0YWJsZVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsImNvbnRyb2wiLCJ0eXBlIiwiYWdncmVnYXRlc0RlZmluaXRpb25zIiwiZW5hYmxlQW5hbHl0aWNzIiwiZW5hYmxlJHNlbGVjdCIsImVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCIsImFnZ3JlZ2F0ZXMiLCJfdXBkYXRlUHJvcGVydHlJbmZvc1dpdGhBZ2dyZWdhdGVzRGVmaW5pdGlvbnMiLCJhbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImVuYWJsZUJhc2ljU2VhcmNoIiwiaW5kZXhPZiIsImdyb3VwQ29uZGl0aW9ucyIsImdldEdyb3VwQ29uZGl0aW9ucyIsImFnZ3JlZ2F0ZUNvbmRpdGlvbnMiLCJnZXRBZ2dyZWdhdGVDb25kaXRpb25zIiwiaW5jbHVkZXMiLCJnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsIm5hdkNvbmZpZyIsIk9iamVjdCIsImtleXMiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImNvbnRleHRQYXRoIiwiZ2V0Q29udGV4dFBhdGgiLCJuYXZDb25maWdGb3JDb250ZXh0UGF0aCIsInRhcmdldEVudGl0eVNldCIsInN0YXJ0aW5nRW50aXR5U2V0IiwidXBkYXRlTGlua2VkUHJvcGVydGllcyIsImZpbmRDb2x1bW5CeVBhdGgiLCJvQ29sdW1uIiwib1RhYmxlQ29sdW1uIiwib1Byb3BlcnR5Iiwib1Byb3AiLCJvVW5pdCIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIm9UaW1lem9uZSIsImdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5Iiwic1RpbWV6b25lIiwiQ29tbW9uIiwiVGltZXpvbmUiLCJvVW5pdENvbHVtbiIsInNVbml0IiwiTWVhc3VyZXMiLCJJU09DdXJyZW5jeSIsIlVuaXQiLCJ1bml0VGV4dCIsIm9UaW1lem9uZUNvbHVtbiIsInRpbWV6b25lIiwidGltZXpvbmVUZXh0IiwidG9TdHJpbmciLCJkaXNwbGF5TW9kZSIsImdldERpc3BsYXlNb2RlIiwidGV4dEFubm90YXRpb24iLCJUZXh0IiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCJvVGV4dENvbHVtbiIsInRleHRBcnJhbmdlbWVudCIsInRleHRQcm9wZXJ0eSIsIm1vZGUiLCJnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8iLCJoZWFkZXJJbmZvVGl0bGVQYXRoIiwiVUkiLCJIZWFkZXJJbmZvIiwiVGl0bGUiLCJWYWx1ZSIsInNlbWFudGljS2V5QW5ub3RhdGlvbnMiLCJTZW1hbnRpY0tleSIsImhlYWRlckluZm9UeXBlTmFtZSIsIlR5cGVOYW1lIiwic2VtYW50aWNLZXlDb2x1bW5zIiwiY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uIiwiaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCIsInZpZXdDb25maWd1cmF0aW9uIiwidGFibGVNYW5pZmVzdENvbmZpZyIsImdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uIiwic3BsaXRQYXRoIiwibmF2aWdhdGlvblRhcmdldFBhdGgiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUiLCJvVmlzdWFsaXphdGlvbiIsIlZpc3VhbGl6YXRpb25UeXBlIiwiVGFibGUiLCJnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uIiwicmVtb3ZlRHVwbGljYXRlQWN0aW9ucyIsIkpTT04iLCJzdHJpbmdpZnkiLCJvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyIsImhlYWRlckluZm9UaXRsZSIsInNlbWFudGljS2V5cyIsImNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24iLCJpc0JsYW5rVGFibGUiLCJnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwiQWN0aW9uSGVscGVyIiwiZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgiLCJyZXN0cmljdGlvbnMiLCJnZXRSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJ1cGRhdGFibGUiLCJpc1VwZGF0YWJsZSIsImlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkiLCJpc0NvbnN0YW50IiwiZXhwcmVzc2lvbiIsIm5hdmlnYXRpb25FeHByZXNzaW9uIiwiX3R5cGUiLCJ1cGRhdGFibGVFeHByZXNzaW9uIiwiQ2FwYWJpbGl0aWVzIiwiVXBkYXRlUmVzdHJpY3Rpb25zIiwiVXBkYXRhYmxlIiwidXBkYXRhYmxlUHJvcGVydHlQYXRoIiwicHJvcGVydGllcyIsImFjdGlvbk5hbWUiLCJwcm9wZXJ0eU5hbWUiLCJzaXplIiwidGl0bGVQcm9wZXJ0eSIsIkFycmF5IiwiZnJvbSIsImpvaW4iLCJnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0IiwiY3VycmVudEVudGl0eVR5cGUiLCJjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImlzRW50aXR5U2V0IiwiYVVpSGlkZGVuUGF0aEV4cHJlc3Npb25zIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJBY3Rpb25UYXJnZXQiLCJpc0JvdW5kIiwic291cmNlRW50aXR5VHlwZSIsIlJlcXVpcmVzQ29udGV4dCIsIklubGluZSIsInZhbHVlT2YiLCJIaWRkZW4iLCJlcXVhbCIsImdldEJpbmRpbmdFeHBGcm9tQ29udGV4dCIsInNvdXJjZSIsInNFeHByZXNzaW9uIiwic1BhdGgiLCJzdWJzdHJpbmciLCJhU3BsaXRQYXRoIiwic3BsaXQiLCJzTmF2aWdhdGlvblBhdGgiLCJpc05hdmlnYXRpb25Qcm9wZXJ0eSIsInRhcmdldE9iamVjdCIsInBhcnRuZXIiLCJwYXRoSW5Nb2RlbCIsInNsaWNlIiwiY29uc3RhbnQiLCJ1cGRhdGVNYW5pZmVzdEFjdGlvbkFuZFRhZ0l0IiwiZGF0YUZpZWxkSWQiLCJzb21lIiwiYWN0aW9uS2V5IiwicmVxdWlyZXNTZWxlY3Rpb24iLCJoYXNCb3VuZEFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyIiwibWFuaWZlc3RBY3Rpb25JZCIsImdlbmVyYXRlIiwiQWN0aW9uIiwiU2VtYW50aWNPYmplY3QiLCJoYXNDdXN0b21BY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhciIsImFjdGlvbiIsImdldFZpc2libGVFeHBGb3JDdXN0b21BY3Rpb25zUmVxdWlyaW5nQ29udGV4dCIsImFWaXNpYmxlUGF0aEV4cHJlc3Npb25zIiwicmVzb2x2ZUJpbmRpbmdTdHJpbmciLCJnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24iLCJpc0RlbGV0YWJsZSIsImlzUGF0aERlbGV0YWJsZSIsImlzUGF0aFVwZGF0YWJsZSIsImdldFNlbGVjdGlvbk1vZGUiLCJ0YXJnZXRDYXBhYmlsaXRpZXMiLCJkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsIm1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24iLCJTZWxlY3Rpb25Nb2RlIiwiTm9uZSIsInRhYmxlTWFuaWZlc3RTZXR0aW5ncyIsInNlbGVjdGlvbk1vZGUiLCJ0YWJsZVNldHRpbmdzIiwiYUhpZGRlbkJpbmRpbmdFeHByZXNzaW9ucyIsImFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zIiwiaXNQYXJlbnREZWxldGFibGUiLCJwYXJlbnRFbnRpdHlTZXREZWxldGFibGUiLCJnZXRUZW1wbGF0ZVR5cGUiLCJUZW1wbGF0ZVR5cGUiLCJPYmplY3RQYWdlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJiTWFzc0VkaXRFbmFibGVkIiwiaWZFbHNlIiwiYW5kIiwiSXNFZGl0YWJsZSIsIk11bHRpIiwiQXV0byIsIlNpbmdsZSIsImJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwib3IiLCJlZGl0TW9kZWJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwiY29uY2F0IiwiY29weURhdGFGaWVsZCIsImdldENvcHlBY3Rpb24iLCJmaWx0ZXIiLCJkYXRhRmllbGRJc0NvcHlBY3Rpb24iLCJzRW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsIkFjdGlvblR5cGUiLCJDb3B5IiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwia2V5IiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwibm90IiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiZ2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbiIsInRleHQiLCJMYWJlbCIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJnZXRUZXh0IiwiRGVmYXVsdCIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QiLCJEZXRlcm1pbmluZyIsInVzZUVuYWJsZWRFeHByZXNzaW9uIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwic291cmNlVHlwZSIsInBhcmFtZXRlcnMiLCJpc0NvbGxlY3Rpb24iLCJ0YWJsZUFjdGlvbiIsIkRhdGFGaWVsZEZvckFjdGlvbiIsImdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0SGlnaGxpZ2h0Um93QmluZGluZyIsImNyaXRpY2FsaXR5QW5ub3RhdGlvbiIsImlzRHJhZnRSb290T3JOb2RlIiwidGFyZ2V0RW50aXR5VHlwZSIsImRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uIiwiTWVzc2FnZVR5cGUiLCJnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUiLCJhTWlzc2luZ0tleXMiLCJmb3JtYXRSZXN1bHQiLCJFbnRpdHkiLCJIYXNBY3RpdmUiLCJJc0FjdGl2ZSIsInRhYmxlRm9ybWF0dGVycyIsInJvd0hpZ2hsaWdodGluZyIsIl9nZXRDcmVhdGlvbkJlaGF2aW91ciIsInRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uIiwibmF2aWdhdGlvbiIsImNyZWF0ZSIsImRldGFpbCIsIm9yaWdpbmFsVGFibGVTZXR0aW5ncyIsIm91dGJvdW5kIiwib3V0Ym91bmREZXRhaWwiLCJuZXdBY3Rpb24iLCJ0YXJnZXRBbm5vdGF0aW9ucyIsInRhcmdldEFubm90YXRpb25zQ29tbW9uIiwidGFyZ2V0QW5ub3RhdGlvbnNTZXNzaW9uIiwiU2Vzc2lvbiIsIkRyYWZ0Um9vdCIsIk5ld0FjdGlvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvbk1vZGUiLCJDcmVhdGlvblJvdyIsIkVycm9yIiwicm91dGUiLCJhcHBlbmQiLCJjcmVhdGVBdEVuZCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJOZXdQYWdlIiwiX2dldFJvd0NvbmZpZ3VyYXRpb25Qcm9wZXJ0eSIsInRhcmdldFBhdGgiLCJ0YWJsZVR5cGUiLCJwcmVzc1Byb3BlcnR5IiwibmF2aWdhdGlvblRhcmdldCIsImNyaXRpY2FsaXR5UHJvcGVydHkiLCJkaXNwbGF5IiwidGFyZ2V0IiwiQ3JpdGljYWxpdHkiLCJNb2RlbEhlbHBlciIsImdldERyYWZ0Um9vdCIsImdldERyYWZ0Tm9kZSIsIlR5cGVHdWFyZHMiLCJyb3dOYXZpZ2F0ZWRFeHByZXNzaW9uIiwibmF2aWdhdGVkUm93IiwicHJlc3MiLCJyb3dOYXZpZ2F0ZWQiLCJJc0luYWN0aXZlIiwiY29sdW1uc1RvQmVDcmVhdGVkIiwibm9uU29ydGFibGVDb2x1bW5zIiwidGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uIiwiZXhpc3RzIiwidGFyZ2V0VHlwZSIsInJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWVzIiwiYWRkaXRpb25hbFByb3BlcnR5TmFtZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbiIsImNvbHVtbkluZm8iLCJnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5IiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJvQ29sdW1uRHJhZnRJbmRpY2F0b3IiLCJnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4iLCJleHBvcnRTZXR0aW5ncyIsInRlbXBsYXRlIiwiZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSIsIndyYXAiLCJleHBvcnRTZXR0aW5nc1dyYXBwaW5nIiwiX2dldEV4cG9ydERhdGFUeXBlIiwiZXhwb3J0VW5pdE5hbWUiLCJ1bml0UHJvcGVydHkiLCJleHBvcnRVbml0U3RyaW5nIiwiZXhwb3J0VGltZXpvbmVOYW1lIiwidGltZXpvbmVQcm9wZXJ0eSIsInV0YyIsImV4cG9ydFRpbWV6b25lU3RyaW5nIiwiZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUiLCJhZGRpdGlvbmFsUHJvcGVydHlJbmZvcyIsInJlbGF0ZWRDb2x1bW5zIiwiX2NyZWF0ZVJlbGF0ZWRDb2x1bW5zIiwiZnVsbFByb3BlcnR5UGF0aCIsInVzZURhdGFGaWVsZFByZWZpeCIsImF2YWlsYWJsZUZvckFkYXB0YXRpb24iLCJyZXBsYWNlU3BlY2lhbENoYXJzIiwic2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCIsImdldFNlbWFudGljT2JqZWN0UGF0aCIsImlzSGlkZGVuIiwiZ3JvdXBQYXRoIiwiX3NsaWNlQXRTbGFzaCIsImlzR3JvdXAiLCJleHBvcnRUeXBlIiwic0RhdGVJbnB1dEZvcm1hdCIsImRhdGFUeXBlIiwiZ2V0RGF0YUZpZWxkRGF0YVR5cGUiLCJwcm9wZXJ0eVR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwiaXNBUHJvcGVydHlGcm9tVGV4dE9ubHlBbm5vdGF0aW9uIiwic29ydGFibGUiLCJ0eXBlQ29uZmlnIiwiY2xhc3NOYW1lIiwiY29uc3RyYWludHMiLCJfaXNFeHBvcnRhYmxlQ29sdW1uIiwiaW5wdXRGb3JtYXQiLCJzY2FsZSIsImRlbGltaXRlciIsImNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscyIsIl9nZXRDb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMiLCJBbm5vdGF0aW9uIiwibGFiZWwiLCJnZXRMYWJlbCIsImdyb3VwTGFiZWwiLCJncm91cCIsInNlbWFudGljT2JqZWN0UGF0aCIsImlzR3JvdXBhYmxlIiwiaXNQcm9wZXJ0eUdyb3VwYWJsZSIsImlzS2V5IiwiY2FzZVNlbnNpdGl2ZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsImdldEltcG9ydGFuY2UiLCJEYXRhRmllbGREZWZhdWx0IiwiYWRkaXRpb25hbExhYmVscyIsInNUb29sdGlwIiwiX2dldFRvb2x0aXAiLCJ0b29sdGlwIiwidGFyZ2V0VmFsdWVmcm9tRFAiLCJnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50IiwiaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdCIsInByb3BlcnR5VHlwZSIsImRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eSIsImlzUHJvcGVydHkiLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIlRhcmdldCIsIiR0YXJnZXQiLCJNZWRpYVR5cGUiLCJ0ZXJtIiwiaXNVUkwiLCJfaXNWYWxpZENvbHVtbiIsIl9nZXRWaXNpYmxlRXhwcmVzc2lvbiIsImRhdGFGaWVsZE1vZGVsUGF0aCIsInByb3BlcnR5VmFsdWUiLCJpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkIiwiaXNBbmFseXRpY2FsTGVhZiIsIl9nZXRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJkYXRhRmllbGRHcm91cCIsImZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsIkRhdGEiLCJpbm5lckRhdGFGaWVsZCIsImRhdGFGaWVsZERlZmF1bHQiLCJpc0RhdGFGaWVsZFR5cGVzIiwiUXVpY2tJbmZvIiwiZGF0YXBvaW50VGFyZ2V0IiwiZ2V0Um93U3RhdHVzVmlzaWJpbGl0eSIsImNvbE5hbWUiLCJpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwIiwiZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlciIsImV4aXN0aW5nQ29sdW1ucyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXAiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwicmVsYXRlZENvbHVtbiIsImlzUGFydE9mTGluZUl0ZW0iLCJleGlzdGluZ0NvbHVtbiIsIm5ld05hbWUiLCJwcm9wZXJ0eUluZm8iLCJfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUiLCJjcmVhdGVUZWNobmljYWxQcm9wZXJ0eSIsInJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwIiwiY29sdW1uRXhpc3RzIiwiYWRkaXRpb25hbFByb3BlcnR5IiwidGVjaG5pY2FsQ29sdW1uIiwiYWdncmVnYXRhYmxlIiwiZXh0ZW5zaW9uIiwidGVjaG5pY2FsbHlHcm91cGFibGUiLCJ0ZWNobmljYWxseUFnZ3JlZ2F0YWJsZSIsIl9nZXRTaG93RGF0YUZpZWxkc0xhYmVsIiwiZmllbGRHcm91cE5hbWUiLCJvQ29sdW1ucyIsImFDb2x1bW5LZXlzIiwic2hvd0RhdGFGaWVsZHNMYWJlbCIsIl9nZXRSZWxhdGl2ZVBhdGgiLCJpc0xhc3RTbGFzaCIsImlzTGFzdFBhcnQiLCJpU2xhc2hJbmRleCIsImxhc3RJbmRleE9mIiwiX2lzQ29sdW1uTXVsdGlWYWx1ZWQiLCJwcm9wZXJ0eU9iamVjdFBhdGgiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsImlzTXVsdGlWYWx1ZUZpZWxkIiwiX2lzQ29sdW1uU29ydGFibGUiLCJwcm9wZXJ0eVBhdGgiLCJmaWx0ZXJGdW5jdGlvbnMiLCJfZ2V0RmlsdGVyRnVuY3Rpb25zIiwiaXNBcnJheSIsIkNvbnZlcnRlckNvbnRleHQiLCJGaWx0ZXJGdW5jdGlvbnMiLCJnZXRFbnRpdHlDb250YWluZXIiLCJfZ2V0RGVmYXVsdEZvcm1hdE9wdGlvbnNGb3JUYWJsZSIsInRleHRMaW5lc0VkaXQiLCJfZmluZFNlbWFudGljS2V5VmFsdWVzIiwiYVNlbWFudGljS2V5VmFsdWVzIiwiYlNlbWFudGljS2V5Rm91bmQiLCJpIiwidmFsdWVzIiwic2VtYW50aWNLZXlGb3VuZCIsIl9maW5kUHJvcGVydGllcyIsInNlbWFudGljS2V5VmFsdWVzIiwiZmllbGRHcm91cFByb3BlcnRpZXMiLCJzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwIiwic1Byb3BlcnR5UGF0aCIsInRtcCIsImZpZWxkR3JvdXBQcm9wZXJ0eVBhdGgiLCJfZmluZFNlbWFudGljS2V5VmFsdWVzSW5GaWVsZEdyb3VwIiwiYVByb3BlcnRpZXMiLCJfcHJvcGVydGllc0ZvdW5kIiwiaXNGaWVsZEdyb3VwQ29sdW1uIiwic2VtYW50aWNLZXkiLCJzZW1hbnRpY0tleUluRmllbGRHcm91cCIsImZvcm1hdE9wdGlvbnNPYmoiLCJoYXNEcmFmdEluZGljYXRvciIsInNlbWFudGlja2V5cyIsInNob3dFcnJvck9iamVjdFN0YXR1cyIsImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCIsIl9nZXRJbXBOdW1iZXIiLCJJbXBvcnRhbmNlIiwiX2dldERhdGFGaWVsZEltcG9ydGFuY2UiLCJfZ2V0TWF4SW1wb3J0YW5jZSIsImZpZWxkcyIsIm1heEltcE51bWJlciIsImltcE51bWJlciIsIkRhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlIiwiZmllbGQiLCJmaWVsZHNXaXRoSW1wb3J0YW5jZSIsIm1hcFNlbWFudGljS2V5cyIsImlzQW5ub3RhdGlvbk9mVHlwZSIsImRhdGFGaWVsZFRhcmdldCIsImZpZWxkR3JvdXBEYXRhIiwiZmllbGRHcm91cEhhc1NlbWFudGljS2V5IiwiZmllbGRHcm91cERhdGFGaWVsZCIsIkhpZ2giLCJpdGVtIiwiZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zIiwidGFibGVDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dEZvciIsImdldFRhcmdldE9iamVjdFBhdGgiLCJsaW5lSXRlbSIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5Iiwic0xhYmVsIiwidmlzdWFsU2V0dGluZ3MiLCJ3aWR0aENhbGN1bGF0aW9uIiwiaXNNdWx0aVZhbHVlIiwiRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwiSFRNTDUiLCJDc3NEZWZhdWx0cyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWUiLCJhZGRpdGlvbmFsUHJvcGVydHlOYW1lIiwiX2dldFByb3BlcnR5TmFtZXMiLCJtYXRjaGVkUHJvcGVydGllcyIsInJlc29sdmVQYXRoIiwiX2FwcGVuZEN1c3RvbVRlbXBsYXRlIiwiaW50ZXJuYWxDb2x1bW5zIiwiaXNBbm5vdGF0aW9uQ29sdW1uIiwiaXNTbG90Q29sdW1uIiwibWFuaWZlc3RDb2x1bW4iLCJTbG90IiwiaXNDdXN0b21Db2x1bW4iLCJfdXBkYXRlTGlua2VkUHJvcGVydGllc09uQ3VzdG9tQ29sdW1ucyIsImFubm90YXRpb25UYWJsZUNvbHVtbnMiLCJwcm9wIiwicmVwbGFjZSIsInZhbGlkYXRlS2V5IiwiYmFzZVRhYmxlQ29sdW1uIiwicG9zaXRpb24iLCJhbmNob3IiLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsInByb3BlcnRpZXNUb092ZXJ3cml0ZUFubm90YXRpb25Db2x1bW4iLCJpc0FjdGlvbk5hdmlnYWJsZSIsImJhc2VNYW5pZmVzdENvbHVtbiIsImhlYWRlciIsIkhvcml6b250YWxBbGlnbiIsIkJlZ2luIiwiaWQiLCJjdXN0b21UYWJsZUNvbHVtbiIsIm1lc3NhZ2UiLCJnZXREaWFnbm9zdGljcyIsImFkZElzc3VlIiwiSXNzdWVDYXRlZ29yeSIsIk1hbmlmZXN0IiwiSXNzdWVTZXZlcml0eSIsIkxvdyIsIklzc3VlQ2F0ZWdvcnlUeXBlIiwiQW5ub3RhdGlvbkNvbHVtbnMiLCJJbnZhbGlkS2V5IiwiZ2V0UDEzbk1vZGUiLCJ2YXJpYW50TWFuYWdlbWVudCIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiYVBlcnNvbmFsaXphdGlvbiIsImlzQW5hbHl0aWNhbFRhYmxlIiwiaXNSZXNwb25zaXZlVGFibGUiLCJwZXJzb25hbGl6YXRpb24iLCJzb3J0IiwiYWdncmVnYXRlIiwiTGlzdFJlcG9ydCIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNvbnRyb2wiLCJfaXNGaWx0ZXJCYXJIaWRkZW4iLCJpc0ZpbHRlckJhckhpZGRlbiIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJBbmFseXRpY2FsTGlzdFBhZ2UiLCJnZXRTb3J0Q29uZGl0aW9ucyIsIm5vblNvcnRhYmxlUHJvcGVydGllcyIsInNvcnRDb25kaXRpb25zIiwiU29ydE9yZGVyIiwic29ydGVycyIsImNvbmRpdGlvbnMiLCJjb25kaXRpb24iLCJjb25kaXRpb25Qcm9wZXJ0eSIsIlByb3BlcnR5IiwiaW5mb05hbWUiLCJjb252ZXJ0UHJvcGVydHlQYXRoc1RvSW5mb05hbWVzIiwiZGVzY2VuZGluZyIsIkRlc2NlbmRpbmciLCJnZXRJbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJsZXZlbCIsIkluaXRpYWxFeHBhbnNpb25MZXZlbCIsInBhdGhzIiwiaW5mb05hbWVzIiwiY3VycmVudFBhdGgiLCJHcm91cEJ5IiwiYUdyb3VwQnkiLCJhR3JvdXBMZXZlbHMiLCJncm91cExldmVscyIsImFnZ3JlZ2F0YWJsZVByb3BlcnR5TmFtZSIsImFnZ3JlZ2F0YWJsZVByb3BlcnR5RGVmaW5pdGlvbiIsImN1c3RvbUFnZ3JlZ2F0ZSIsImFkZGl0aW9uYWxQcm9wZXJ0eUluZm8iLCJUb3RhbCIsImFUb3RhbHMiLCJ0eXBlTmFtZVBsdXJhbCIsIlR5cGVOYW1lUGx1cmFsIiwidGl0bGUiLCJwYWdlTWFuaWZlc3RTZXR0aW5ncyIsImhhc0Fic29sdXRlUGF0aCIsInAxM25Nb2RlIiwiZ2V0VGFibGVJRCIsImNyZWF0aW9uQmVoYXZpb3VyIiwic3RhbmRhcmRBY3Rpb25zQ29udGV4dCIsImdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dCIsImdldERlbGV0ZVZpc2liaWxpdHkiLCJtYXNzRWRpdEJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwiZ2V0TWFzc0VkaXRWaXNpYmlsaXR5IiwiaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQiLCJnZXRJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGluZyIsImlzRHJhZnRPclN0aWNreVN1cHBvcnRlZCIsInRocmVzaG9sZCIsIk1heEl0ZW1zIiwiaXNTZWFyY2hhYmxlIiwiaXNQYXRoU2VhcmNoYWJsZSIsInN0YW5kYXJkQWN0aW9ucyIsImdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlIiwiZGVsZXRlIiwiZ2V0U3RhbmRhcmRBY3Rpb25EZWxldGUiLCJwYXN0ZSIsImdldFN0YW5kYXJkQWN0aW9uUGFzdGUiLCJtYXNzRWRpdCIsImdldFN0YW5kYXJkQWN0aW9uTWFzc0VkaXQiLCJjcmVhdGlvblJvdyIsImdldENyZWF0aW9uUm93IiwiZW50aXR5TmFtZSIsImNvbGxlY3Rpb24iLCJuYXZpZ2F0aW9uUGF0aCIsInJvdyIsImlzSW5EaXNwbGF5TW9kZSIsImF1dG9CaW5kT25Jbml0Iiwic2VhcmNoYWJsZSIsImluaXRpYWxFeHBhbnNpb25MZXZlbCIsImlzQ29tcGxleFByb3BlcnR5IiwiZXhwb3J0RGF0YVR5cGUiLCJ0YXJnZXROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwic3Vic3RyIiwiZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24iLCJzZWxlY3Rpb25WYXJpYW50UGF0aCIsInJlc29sdmVkVGFyZ2V0IiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJzZWxlY3Rpb24iLCJwcm9wZXJ0eU5hbWVzIiwiU2VsZWN0T3B0aW9ucyIsInNlbGVjdE9wdGlvbiIsIlByb3BlcnR5TmFtZSIsIl9nZXRGdWxsU2NyZWVuQmFzZWRPbkRldmljZSIsImlzSXBob25lIiwiZW5hYmxlRnVsbFNjcmVlbiIsIklzc3VlVHlwZSIsIkZVTExTQ1JFRU5NT0RFX05PVF9PTl9MSVNUUkVQT1JUIiwiX2dldE11bHRpU2VsZWN0TW9kZSIsIm11bHRpU2VsZWN0TW9kZSIsInNlbGVjdEFsbCIsInVzZUljb25UYWJCYXIiLCJfZ2V0VGFibGVUeXBlIiwiaXNEZXNrdG9wIiwiX2dldEdyaWRUYWJsZU1vZGUiLCJpc1RlbXBsYXRlTGlzdFJlcG9ydCIsInJvd0NvdW50TW9kZSIsInJvd0NvdW50IiwiX2dldENvbmRlbnNlZFRhYmxlTGF5b3V0IiwiX3RhYmxlVHlwZSIsIl90YWJsZVNldHRpbmdzIiwiY29uZGVuc2VkVGFibGVMYXlvdXQiLCJfZ2V0VGFibGVTZWxlY3Rpb25MaW1pdCIsInNlbGVjdGlvbkxpbWl0IiwiX2dldFRhYmxlSW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsImlubGluZUNyZWF0aW9uUm93Q291bnQiLCJfZ2V0RmlsdGVycyIsInF1aWNrRmlsdGVyUGF0aHMiLCJxdWlja1NlbGVjdGlvblZhcmlhbnQiLCJxdWlja0ZpbHRlcnMiLCJzaG93Q291bnRzIiwicXVpY2tWYXJpYW50U2VsZWN0aW9uIiwiX2dldEVuYWJsZUV4cG9ydCIsImVuYWJsZVBhc3RlIiwiZW5hYmxlRXhwb3J0IiwiX2dldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJmaWx0ZXJzIiwiaGlkZVRhYmxlVGl0bGUiLCJoZWFkZXJWaXNpYmxlIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJuYXZQcm9wZXJ0eSIsImNoZWNrQ29uZGVuc2VkTGF5b3V0IiwiX21hbmlmZXN0V3JhcHBlciIsImVuYWJsZUF1dG9Db2x1bW5XaWR0aCIsImlzUGhvbmUiLCJ0ZW1wbGF0ZVR5cGUiLCJkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIiLCJpc0NvbmRlbnNlZExheW91dENvbXBsaWFudCIsIm9GaWx0ZXJDb25maWd1cmF0aW9uIiwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwiZ3JpZFRhYmxlUm93TW9kZSIsIm9Db25maWd1cmF0aW9uIiwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSIsImVuYWJsZU1hc3NFZGl0IiwiaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSIsInNob3dSb3dDb3VudCIsImdldFZpZXdDb25maWd1cmF0aW9uIiwidXNlQ29uZGVuc2VkVGFibGVMYXlvdXQiLCJpc0NvbXBhY3RUeXBlIiwidGFibGVDb25maWd1cmF0aW9uIiwiaGllcmFyY2h5UXVhbGlmaWVyIiwib1RhcmdldE1hcHBpbmciLCJpc1R5cGVEZWZpbml0aW9uIiwiRURNX1RZUEVfTUFQUElORyIsInVuZGVybHlpbmdUeXBlIiwiJFNjYWxlIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsIm1heExlbmd0aCIsIiRNYXhMZW5ndGgiLCJudWxsYWJsZSIsIiROdWxsYWJsZSIsIm1pbmltdW0iLCJpc05hTiIsIlZhbGlkYXRpb24iLCJNaW5pbXVtIiwibWF4aW11bSIsIk1heGltdW0iLCJpc0RpZ2l0U2VxdWVuY2UiLCJJc0RpZ2l0U2VxdWVuY2UiLCJwYXJzZUFzU3RyaW5nIiwiZW1wdHlTdHJpbmciLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0RW50aXR5VHlwZSxcblx0RW51bVZhbHVlLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0UHJvcGVydHksXG5cdFByb3BlcnR5QW5ub3RhdGlvblZhbHVlLFxuXHRQcm9wZXJ0eVBhdGhcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckZ1bmN0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljS2V5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldEFubm90YXRpb25zX0NvbW1vbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19TZXNzaW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9TZXNzaW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUge1xuXHRDcml0aWNhbGl0eVR5cGUsXG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhRmllbGRGb3JBY3Rpb25UeXBlcyxcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YVBvaW50LFxuXHREYXRhUG9pbnRUeXBlVHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGUsXG5cdFNlbGVjdE9wdGlvblR5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBDb21wbGV4UHJvcGVydHlJbmZvIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQge1xuXHRjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMsXG5cdGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5LFxuXHRnZXREYXRhRmllbGREYXRhVHlwZSxcblx0Z2V0U2VtYW50aWNPYmplY3RQYXRoLFxuXHRnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50LFxuXHRpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0LFxuXHRpc0RhdGFGaWVsZFR5cGVzLFxuXHRpc0RhdGFQb2ludEZyb21EYXRhRmllbGREZWZhdWx0XG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlQWN0aW9uLCBDb21iaW5lZEFjdGlvbiwgQ3VzdG9tQWN0aW9uLCBPdmVycmlkZVR5cGVBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQge1xuXHRkYXRhRmllbGRJc0NvcHlBY3Rpb24sXG5cdGdldEFjdGlvbnNGcm9tTWFuaWZlc3QsXG5cdGdldENvcHlBY3Rpb24sXG5cdGlzQWN0aW9uTmF2aWdhYmxlLFxuXHRyZW1vdmVEdXBsaWNhdGVBY3Rpb25zXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IEVudGl0eSwgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUsIFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZUNhdGVnb3J5VHlwZSwgSXNzdWVTZXZlcml0eSwgSXNzdWVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Jc3N1ZU1hbmFnZXJcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgdGFibGVGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyVHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgUGF0aEluTW9kZWxFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRFRE1fVFlQRV9NQVBQSU5HLFxuXHRlcXVhbCxcblx0Zm9ybWF0UmVzdWx0LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0bm90LFxuXHRvcixcblx0cGF0aEluTW9kZWwsXG5cdHJlc29sdmVCaW5kaW5nU3RyaW5nXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlLCByZXBsYWNlU3BlY2lhbENoYXJzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFR5cGVHdWFyZHMgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHtcblx0aXNBbm5vdGF0aW9uT2ZUeXBlLFxuXHRpc05hdmlnYXRpb25Qcm9wZXJ0eSxcblx0aXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdGlzUHJvcGVydHksXG5cdGlzVHlwZURlZmluaXRpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHtcblx0ZW5oYW5jZURhdGFNb2RlbFBhdGgsXG5cdGdldFRhcmdldE9iamVjdFBhdGgsXG5cdGlzUGF0aERlbGV0YWJsZSxcblx0aXNQYXRoU2VhcmNoYWJsZSxcblx0aXNQYXRoVXBkYXRhYmxlXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlLCB0eXBlIERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCB7IGdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0VudGl0eVNldEhlbHBlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5XG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgeyBpc011bHRpVmFsdWVGaWVsZCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEZWZhdWx0VHlwZUZvckVkbVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9FRE1cIjtcbmltcG9ydCBBY3Rpb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvaGVscGVycy9BY3Rpb25IZWxwZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkhlbHBlciB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0RhdGFGaWVsZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0VGFibGVJRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEF2YWlsYWJpbGl0eVR5cGUsXG5cdEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbixcblx0Q3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdEZvcm1hdE9wdGlvbnNUeXBlLFxuXHROYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHROYXZpZ2F0aW9uVGFyZ2V0Q29uZmlndXJhdGlvbixcblx0VGFibGVDb2x1bW5TZXR0aW5ncyxcblx0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdFZpZXdQYXRoQ29uZmlndXJhdGlvblxufSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHtcblx0QWN0aW9uVHlwZSxcblx0Q3JlYXRpb25Nb2RlLFxuXHRIb3Jpem9udGFsQWxpZ24sXG5cdEltcG9ydGFuY2UsXG5cdFNlbGVjdGlvbk1vZGUsXG5cdFRlbXBsYXRlVHlwZSxcblx0VmFyaWFudE1hbmFnZW1lbnRUeXBlLFxuXHRWaXN1YWxpemF0aW9uVHlwZVxufSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgTWFuaWZlc3RXcmFwcGVyIGZyb20gXCIuLi8uLi9NYW5pZmVzdFdyYXBwZXJcIjtcbmltcG9ydCB7IGdldE1lc3NhZ2VUeXBlRnJvbUNyaXRpY2FsaXR5VHlwZSB9IGZyb20gXCIuL0NyaXRpY2FsaXR5XCI7XG5pbXBvcnQgdHlwZSB7IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB9IGZyb20gXCIuL3RhYmxlL1N0YW5kYXJkQWN0aW9uc1wiO1xuaW1wb3J0IHtcblx0Z2VuZXJhdGVTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRnZXRDcmVhdGlvblJvdyxcblx0Z2V0RGVsZXRlVmlzaWJpbGl0eSxcblx0Z2V0SW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRpbmcsXG5cdGdldE1hc3NFZGl0VmlzaWJpbGl0eSxcblx0Z2V0UmVzdHJpY3Rpb25zLFxuXHRnZXRTdGFuZGFyZEFjdGlvbkNyZWF0ZSxcblx0Z2V0U3RhbmRhcmRBY3Rpb25EZWxldGUsXG5cdGdldFN0YW5kYXJkQWN0aW9uTWFzc0VkaXQsXG5cdGdldFN0YW5kYXJkQWN0aW9uUGFzdGUsXG5cdGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZCxcblx0aXNJbkRpc3BsYXlNb2RlXG59IGZyb20gXCIuL3RhYmxlL1N0YW5kYXJkQWN0aW9uc1wiO1xuXG5pbXBvcnQgeyBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcblxuZXhwb3J0IHR5cGUgVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IHtcblx0YXV0b0JpbmRPbkluaXQ6IGJvb2xlYW47XG5cdGNvbGxlY3Rpb246IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZTtcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdGlkOiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmc7XG5cdHAxM25Nb2RlPzogc3RyaW5nO1xuXHRyb3c/OiB7XG5cdFx0YWN0aW9uPzogc3RyaW5nO1xuXHRcdHByZXNzPzogc3RyaW5nO1xuXHRcdHJvd0hpZ2hsaWdodGluZzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0cm93TmF2aWdhdGVkOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdH07XG5cdHNlbGVjdGlvbk1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c3RhbmRhcmRBY3Rpb25zOiB7XG5cdFx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlPjtcblx0XHRpc0luc2VydFVwZGF0ZVRlbXBsYXRlZDogYm9vbGVhbjtcblx0XHR1cGRhdGFibGVQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0fTtcblx0ZGlzcGxheU1vZGU/OiBib29sZWFuO1xuXHR0aHJlc2hvbGQ6IG51bWJlcjtcblx0ZW50aXR5TmFtZTogc3RyaW5nO1xuXHRzb3J0Q29uZGl0aW9ucz86IHN0cmluZztcblx0Z3JvdXBDb25kaXRpb25zPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGVDb25kaXRpb25zPzogc3RyaW5nO1xuXHRpbml0aWFsRXhwYW5zaW9uTGV2ZWw/OiBudW1iZXI7XG5cblx0LyoqIENyZWF0ZSBuZXcgZW50cmllcyAqL1xuXHRjcmVhdGU6IENyZWF0ZUJlaGF2aW9yIHwgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbDtcblx0dGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c2VhcmNoYWJsZTogYm9vbGVhbjtcblxuXHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogTmV3IGVudHJpZXMgYXJlIGNyZWF0ZWQgd2l0aGluIHRoZSBhcHAgKGRlZmF1bHQgY2FzZSlcbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlQmVoYXZpb3IgPSB7XG5cdG1vZGU6IENyZWF0aW9uTW9kZTtcblx0YXBwZW5kOiBib29sZWFuO1xuXHRuZXdBY3Rpb24/OiBzdHJpbmc7XG5cdG5hdmlnYXRlVG9UYXJnZXQ/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIE5ldyBlbnRyaWVzIGFyZSBjcmVhdGVkIGJ5IG5hdmlnYXRpbmcgdG8gc29tZSB0YXJnZXRcbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbCA9IHtcblx0bW9kZTogXCJFeHRlcm5hbFwiO1xuXHRvdXRib3VuZDogc3RyaW5nO1xuXHRvdXRib3VuZERldGFpbDogTmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb25bXCJvdXRib3VuZERldGFpbFwiXTtcblx0bmF2aWdhdGlvblNldHRpbmdzOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDYXBhYmlsaXR5UmVzdHJpY3Rpb24gPSB7XG5cdGlzRGVsZXRhYmxlOiBib29sZWFuO1xuXHRpc1VwZGF0YWJsZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlRmlsdGVyc0NvbmZpZ3VyYXRpb24gPSB7XG5cdGVuYWJsZWQ/OiBzdHJpbmcgfCBib29sZWFuO1xuXHRwYXRoczogW1xuXHRcdHtcblx0XHRcdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdFx0fVxuXHRdO1xuXHRzaG93Q291bnRzPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uID0ge1xuXHRwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXTtcblx0dGV4dD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24gPSB7XG5cdGNyZWF0ZUF0RW5kOiBib29sZWFuO1xuXHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZTtcblx0ZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YTogYm9vbGVhbjtcblx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiBib29sZWFuO1xuXHRlbmFibGVFeHBvcnQ6IGJvb2xlYW47XG5cdGhlYWRlclZpc2libGU6IGJvb2xlYW47XG5cdGZpbHRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uPjtcblx0dHlwZTogVGFibGVUeXBlO1xuXHRyb3dDb3VudE1vZGU/OiBHcmlkVGFibGVSb3dDb3VudE1vZGU7XG5cdHJvd0NvdW50PzogbnVtYmVyO1xuXHRzZWxlY3RBbGw/OiBib29sZWFuO1xuXHRzZWxlY3Rpb25MaW1pdDogbnVtYmVyO1xuXHRtdWx0aVNlbGVjdE1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0ZW5hYmxlUGFzdGU6IGJvb2xlYW47XG5cdGVuYWJsZUZ1bGxTY3JlZW46IGJvb2xlYW47XG5cdHNob3dSb3dDb3VudDogYm9vbGVhbjtcblx0aW5saW5lQ3JlYXRpb25Sb3dDb3VudD86IG51bWJlcjtcblx0aW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZT86IGJvb2xlYW47XG5cdGVuYWJsZU1hc3NFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IGJvb2xlYW47XG5cdGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpc0NvbXBhY3RUeXBlPzogYm9vbGVhbjtcblx0aGllcmFyY2h5UXVhbGlmaWVyPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVUeXBlID0gXCJHcmlkVGFibGVcIiB8IFwiUmVzcG9uc2l2ZVRhYmxlXCIgfCBcIkFuYWx5dGljYWxUYWJsZVwiIHwgXCJUcmVlVGFibGVcIjtcbmV4cG9ydCB0eXBlIEdyaWRUYWJsZVJvd0NvdW50TW9kZSA9IFwiQXV0b1wiIHwgXCJGaXhlZFwiO1xuXG5lbnVtIENvbHVtblR5cGUge1xuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsIC8vIERlZmF1bHQgVHlwZSAoQ3VzdG9tIENvbHVtbilcblx0QW5ub3RhdGlvbiA9IFwiQW5ub3RhdGlvblwiLFxuXHRTbG90ID0gXCJTbG90XCJcbn1cblxuLy8gQ3VzdG9tIENvbHVtbiBmcm9tIE1hbmlmZXN0XG5leHBvcnQgdHlwZSBNYW5pZmVzdERlZmluZWRDdXN0b21Db2x1bW4gPSBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gJiB7XG5cdHR5cGU/OiBDb2x1bW5UeXBlLkRlZmF1bHQ7XG59O1xuXG4vLyBTbG90IENvbHVtbiBmcm9tIEJ1aWxkaW5nIEJsb2NrXG5leHBvcnQgdHlwZSBGcmFnbWVudERlZmluZWRTbG90Q29sdW1uID0gQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uICYge1xuXHR0eXBlOiBDb2x1bW5UeXBlLlNsb3Q7XG59O1xuXG4vLyBQcm9wZXJ0aWVzIGFsbCBDb2x1bW5UeXBlcyBoYXZlOlxuZXhwb3J0IHR5cGUgQmFzZVRhYmxlQ29sdW1uID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHR0eXBlOiBDb2x1bW5UeXBlOyAvL09yaWdpbiBvZiB0aGUgc291cmNlIHdoZXJlIHdlIGFyZSBnZXR0aW5nIHRoZSB0ZW1wbGF0ZWQgaW5mb3JtYXRpb24gZnJvbVxuXHR3aWR0aD86IHN0cmluZztcblx0aW1wb3J0YW5jZT86IEltcG9ydGFuY2U7XG5cdGhvcml6b250YWxBbGlnbj86IEhvcml6b250YWxBbGlnbjtcblx0YXZhaWxhYmlsaXR5PzogQXZhaWxhYmlsaXR5VHlwZTtcblx0aXNOYXZpZ2FibGU/OiBib29sZWFuO1xuXHRjYXNlU2Vuc2l0aXZlOiBib29sZWFuO1xufTtcblxuLy8gUHJvcGVydGllcyBvbiBDdXN0b20gQ29sdW1ucyBhbmQgU2xvdCBDb2x1bW5zXG5leHBvcnQgdHlwZSBDdXN0b21CYXNlZFRhYmxlQ29sdW1uID0gQmFzZVRhYmxlQ29sdW1uICYge1xuXHRpZDogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGhlYWRlcj86IHN0cmluZztcblx0dGVtcGxhdGU6IHN0cmluZztcblx0cHJvcGVydHlJbmZvcz86IHN0cmluZ1tdO1xuXHRleHBvcnRTZXR0aW5ncz86IHtcblx0XHR0ZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdHdyYXA6IGJvb2xlYW47XG5cdH0gfCBudWxsO1xuXHRmb3JtYXRPcHRpb25zOiB7IHRleHRMaW5lc0VkaXQ6IG51bWJlciB9O1xuXHRpc0dyb3VwYWJsZTogYm9vbGVhbjtcblx0aXNOYXZpZ2FibGU6IGJvb2xlYW47XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHR2aXN1YWxTZXR0aW5nczogeyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH07XG5cdHByb3BlcnRpZXM/OiBzdHJpbmdbXTsgLy9XZSBuZWVkIHRoZSBwcm9wZXJ0aWVzIHJlbGF0aXZlUGF0aCB0byBiZSBhZGRlZCB0byB0aGUgJFNlbGVjdCByZXF1ZXN0IGZvciBleHBvcnRpbmdcbn07XG5cbi8vIFByb3BlcnRpZXMgZGVyaXZlZCBmcm9tIE1hbmlmZXN0IHRvIG92ZXJyaWRlIEFubm90YXRpb24gY29uZmlndXJhdGlvbnNcbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbkZvck92ZXJyaWRlID0gQmFzZVRhYmxlQ29sdW1uICYge1xuXHRzZXR0aW5ncz86IFRhYmxlQ29sdW1uU2V0dGluZ3M7XG5cdGZvcm1hdE9wdGlvbnM/OiBGb3JtYXRPcHRpb25zVHlwZTtcbn07XG5cbmV4cG9ydCB0eXBlIFByb3BlcnR5VHlwZUNvbnN0cmFpbnRzID0gUGFydGlhbDx7XG5cdHNjYWxlOiBudW1iZXI7XG5cdHByZWNpc2lvbjogbnVtYmVyO1xuXHRtYXhMZW5ndGg6IG51bWJlcjtcblx0bnVsbGFibGU6IGJvb2xlYW47XG5cdG1pbmltdW06IHN0cmluZztcblx0bWF4aW11bTogc3RyaW5nO1xuXHRpc0RpZ2l0U2VxdWVuY2U6IGJvb2xlYW47XG59PjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlUeXBlRm9ybWF0T3B0aW9ucyA9IFBhcnRpYWw8e1xuXHRwYXJzZUFzU3RyaW5nOiBib29sZWFuO1xuXHRlbXB0eVN0cmluZzogc3RyaW5nO1xuXHRwYXJzZUtlZXBzRW1wdHlTdHJpbmc6IGJvb2xlYW47XG59PjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlUeXBlQ29uZmlnID0ge1xuXHR0eXBlPzogc3RyaW5nO1xuXHRjb25zdHJhaW50czogUHJvcGVydHlUeXBlQ29uc3RyYWludHM7XG5cdGZvcm1hdE9wdGlvbnM6IFByb3BlcnR5VHlwZUZvcm1hdE9wdGlvbnM7XG5cdHR5cGVJbnN0YW5jZT86IHVua25vd247XG5cdGJhc2VUeXBlPzogc3RyaW5nO1xuXHRjbGFzc05hbWU/OiBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlO1xufTtcblxuZXhwb3J0IHR5cGUgY29sdW1uRXhwb3J0U2V0dGluZ3MgPSBQYXJ0aWFsPHtcblx0dGVtcGxhdGU6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0d3JhcDogYm9vbGVhbjtcblx0dHlwZTogc3RyaW5nO1xuXHRpbnB1dEZvcm1hdDogc3RyaW5nO1xuXHRmb3JtYXQ6IHN0cmluZztcblx0c2NhbGU6IG51bWJlcjtcblx0ZGVsaW1pdGVyOiBib29sZWFuO1xuXHR1bml0OiBzdHJpbmc7XG5cdHVuaXRQcm9wZXJ0eTogc3RyaW5nO1xuXHR0aW1lem9uZTogc3RyaW5nO1xuXHR0aW1lem9uZVByb3BlcnR5OiBzdHJpbmc7XG5cdHV0YzogYm9vbGVhbjtcbn0+O1xuXG4vLyBQcm9wZXJ0aWVzIGZvciBBbm5vdGF0aW9uIENvbHVtbnNcbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbiA9IEFubm90YXRpb25UYWJsZUNvbHVtbkZvck92ZXJyaWRlICYge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0cmVsYXRpdmVQYXRoOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0b29sdGlwPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xuXHRncm91cD86IHN0cmluZztcblx0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHNob3dEYXRhRmllbGRzTGFiZWw/OiBib29sZWFuO1xuXHRpc0tleT86IGJvb2xlYW47XG5cdGlzR3JvdXBhYmxlPzogYm9vbGVhbjtcblx0dW5pdD86IHN0cmluZztcblx0dW5pdFRleHQ/OiBzdHJpbmc7XG5cdHRpbWV6b25lVGV4dD86IHN0cmluZztcblx0dGltZXpvbmU/OiBzdHJpbmc7XG5cdHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdGV4cG9ydFNldHRpbmdzPzogY29sdW1uRXhwb3J0U2V0dGluZ3MgfCBudWxsO1xuXHR0ZXh0QXJyYW5nZW1lbnQ/OiB7XG5cdFx0dGV4dFByb3BlcnR5OiBzdHJpbmc7XG5cdFx0bW9kZTogRGlzcGxheU1vZGU7XG5cdH07XG5cdGFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zPzogc3RyaW5nW107XG5cdHZpc3VhbFNldHRpbmdzPzogVmlzdWFsU2V0dGluZ3M7XG5cdHR5cGVDb25maWc/OiBQcm9wZXJ0eVR5cGVDb25maWc7XG5cdGlzUGFydE9mTGluZUl0ZW0/OiBib29sZWFuOyAvLyB0ZW1wb3JhcnkgaW5kaWNhdG9yIHRvIG9ubHkgYWxsb3cgZmlsdGVyaW5nIG9uIG5hdmlnYXRpb24gcHJvcGVydGllcyB3aGVuIHRoZXkncmUgcGFydCBvZiBhIGxpbmUgaXRlbVxuXHRhZGRpdGlvbmFsTGFiZWxzPzogc3RyaW5nW107XG5cdGV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGFibGU/OiBib29sZWFuO1xuXHRleHRlbnNpb24/OiBFeHRlbnNpb25Gb3JBbmFseXRpY3M7XG59O1xuXG5leHBvcnQgdHlwZSBFeHRlbnNpb25Gb3JBbmFseXRpY3MgPSB7XG5cdGN1c3RvbUFnZ3JlZ2F0ZT86IHtcblx0XHRjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdH07XG59O1xuXG5leHBvcnQgdHlwZSBUZWNobmljYWxDb2x1bW4gPSBBbm5vdGF0aW9uVGFibGVDb2x1bW4gJiB7XG5cdGV4dGVuc2lvbj86IHtcblx0XHR0ZWNobmljYWxseUdyb3VwYWJsZTogYm9vbGVhbjtcblx0XHR0ZWNobmljYWxseUFnZ3JlZ2F0YWJsZTogYm9vbGVhbjtcblx0fTtcbn07XG5cbmV4cG9ydCB0eXBlIFZpc3VhbFNldHRpbmdzID0ge1xuXHR3aWR0aENhbGN1bGF0aW9uPzogV2lkdGhDYWxjdWxhdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFdpZHRoQ2FsY3VsYXRpb24gPSBudWxsIHwge1xuXHRtaW5XaWR0aD86IG51bWJlcjtcblx0bWF4V2lkdGg/OiBudW1iZXI7XG5cdGRlZmF1bHRXaWR0aD86IG51bWJlcjtcblx0aW5jbHVkZUxhYmVsPzogYm9vbGVhbjtcblx0Z2FwPzogbnVtYmVyO1xuXHQvLyBvbmx5IHJlbGV2YW50IGZvciBjb21wbGV4IHR5cGVzXG5cdGV4Y2x1ZGVQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdHZlcnRpY2FsQXJyYW5nZW1lbnQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDb2x1bW4gPSBDdXN0b21CYXNlZFRhYmxlQ29sdW1uIHwgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb2x1bW4gPSBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4gfCBBbm5vdGF0aW9uVGFibGVDb2x1bW5Gb3JPdmVycmlkZT47XG5cbmV4cG9ydCB0eXBlIEFnZ3JlZ2F0ZURhdGEgPSB7XG5cdGRlZmF1bHRBZ2dyZWdhdGU6IHtcblx0XHRjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdH07XG5cdHJlbGF0aXZlUGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVWaXN1YWxpemF0aW9uID0ge1xuXHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZTtcblx0YW5ub3RhdGlvbjogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbjtcblx0Y29udHJvbDogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbjtcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXTtcblx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRjb21tYW5kQWN0aW9ucz86IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG5cdGFnZ3JlZ2F0ZXM/OiBSZWNvcmQ8c3RyaW5nLCBBZ2dyZWdhdGVEYXRhPjtcblx0ZW5hYmxlQW5hbHl0aWNzPzogYm9vbGVhbjtcblx0ZW5hYmxlQmFzaWNTZWFyY2g/OiBib29sZWFuO1xuXHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZztcblx0b3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllczogc3RyaW5nO1xuXHRoZWFkZXJJbmZvVGl0bGU6IHN0cmluZztcblx0c2VtYW50aWNLZXlzOiBzdHJpbmdbXTtcblx0aGVhZGVySW5mb1R5cGVOYW1lOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxTdHJpbmc+IHwgdW5kZWZpbmVkO1xuXHRlbmFibGUkc2VsZWN0OiBib29sZWFuO1xuXHRlbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQ6IGJvb2xlYW47XG59O1xuXG50eXBlIFNvcnRlclR5cGUgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0ZGVzY2VuZGluZzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgYW5ub3RhdGlvbi1iYXNlZCBhbmQgbWFuaWZlc3QtYmFzZWQgdGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyBUaGUgY29tcGxldGUgdGFibGUgYWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBY3Rpb25zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBDb21iaW5lZEFjdGlvbiB7XG5cdGNvbnN0IGFUYWJsZUFjdGlvbnMgPSBnZXRUYWJsZUFubm90YXRpb25BY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLnRhYmxlQWN0aW9ucztcblx0Y29uc3QgYUhpZGRlbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLmhpZGRlblRhYmxlQWN0aW9ucztcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnMsXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdHRydWUsXG5cdFx0YUhpZGRlbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgYWN0aW9uT3ZlcndyaXRlQ29uZmlnOiBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdFx0aXNOYXZpZ2FibGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlT25TZWxlY3Q6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlQXV0b1Njcm9sbDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgYWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIGFjdGlvbk92ZXJ3cml0ZUNvbmZpZyk7XG5cblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBjb2x1bW5zLCBhbm5vdGF0aW9uLWJhc2VkIGFzIHdlbGwgYXMgbWFuaWZlc3QgYmFzZWQuXG4gKiBUaGV5IGFyZSBzb3J0ZWQgYW5kIHNvbWUgcHJvcGVydGllcyBjYW4gYmUgb3ZlcndyaXR0ZW4gdmlhIHRoZSBtYW5pZmVzdCAoY2hlY2sgb3V0IHRoZSBrZXlzIHRoYXQgY2FuIGJlIG92ZXJ3cml0dGVuKS5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgZm9yIHJlcHJlc2VudGF0aW9uIGluIGEgdGFibGUgb3IgbGlzdFxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHJldHVybnMgUmV0dXJucyBhbGwgdGFibGUgY29sdW1ucyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUsIHJlZ2FyZGxlc3Mgb2YgdGVtcGxhdGluZyBvciBwZXJzb25hbGl6YXRpb24gb3IgdGhlaXIgb3JpZ2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJsZUNvbHVtbnMoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbik6IFRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCBhbm5vdGF0aW9uQ29sdW1ucyA9IGdldENvbHVtbnNGcm9tQW5ub3RhdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG1hbmlmZXN0Q29sdW1ucyA9IGdldENvbHVtbnNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKS5jb2x1bW5zLFxuXHRcdGFubm90YXRpb25Db2x1bW5zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pLFxuXHRcdG5hdmlnYXRpb25TZXR0aW5nc1xuXHQpO1xuXG5cdHJldHVybiBpbnNlcnRDdXN0b21FbGVtZW50cyhhbm5vdGF0aW9uQ29sdW1ucyBhcyBUYWJsZUNvbHVtbltdLCBtYW5pZmVzdENvbHVtbnMgYXMgUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudDxUYWJsZUNvbHVtbj4+LCB7XG5cdFx0d2lkdGg6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0aW1wb3J0YW5jZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRob3Jpem9udGFsQWxpZ246IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0YXZhaWxhYmlsaXR5OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGlzTmF2aWdhYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHNldHRpbmdzOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGZvcm1hdE9wdGlvbnM6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fSk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGN1c3RvbSBhZ2dyZWdhdGlvbiBkZWZpbml0aW9ucyBmcm9tIHRoZSBlbnRpdHlUeXBlLlxuICpcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSB0YXJnZXQgZW50aXR5IHR5cGUuXG4gKiBAcGFyYW0gdGFibGVDb2x1bW5zIFRoZSBhcnJheSBvZiBjb2x1bW5zIGZvciB0aGUgZW50aXR5IHR5cGUuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcmV0dXJucyBUaGUgYWdncmVnYXRlIGRlZmluaXRpb25zIGZyb20gdGhlIGVudGl0eVR5cGUsIG9yIHVuZGVmaW5lZCBpZiB0aGUgZW50aXR5IGRvZXNuJ3Qgc3VwcG9ydCBhbmFseXRpY2FsIHF1ZXJpZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBZ2dyZWdhdGVEZWZpbml0aW9uc0Zyb21FbnRpdHlUeXBlID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHR0YWJsZUNvbHVtbnM6IFRhYmxlQ29sdW1uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEFnZ3JlZ2F0ZURhdGE+IHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0ZnVuY3Rpb24gZmluZENvbHVtbkZyb21QYXRoKHBhdGg6IHN0cmluZyk6IFRhYmxlQ29sdW1uIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGFibGVDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4ge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQgJiYgYW5ub3RhdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IHBhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHRpZiAoIWFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gS2VlcCBhIHNldCBvZiBhbGwgY3VycmVuY3kvdW5pdCBwcm9wZXJ0aWVzLCBhcyB3ZSBkb24ndCB3YW50IHRvIGNvbnNpZGVyIHRoZW0gYXMgYWdncmVnYXRlc1xuXHQvLyBUaGV5IGFyZSBhZ2dyZWdhdGVzIGZvciB0ZWNobmljYWwgcmVhc29ucyAodG8gbWFuYWdlIG11bHRpLXVuaXRzIHNpdHVhdGlvbnMpIGJ1dCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgZnJvbSBhIHVzZXIgc3RhbmRwb2ludFxuXHRjb25zdCBjdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG5cdHRhYmxlQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcblx0XHRjb25zdCB0YWJsZUNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0aWYgKHRhYmxlQ29sdW1uLnVuaXQpIHtcblx0XHRcdGN1cnJlbmN5T3JVbml0UHJvcGVydGllcy5hZGQodGFibGVDb2x1bW4udW5pdCk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBjdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdGNvbnN0IGRlZmluaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcblxuXHRjdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uKSA9PiB7XG5cdFx0Y29uc3QgYWdncmVnYXRlZFByb3BlcnR5ID0gYWdncmVnYXRpb25IZWxwZXIuX2VudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5maW5kKChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIHByb3BlcnR5Lm5hbWUgPT09IGFubm90YXRpb24ucXVhbGlmaWVyO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGFnZ3JlZ2F0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0Y29uc3QgY29udGV4dERlZmluaW5nUHJvcGVydGllcyA9IGFubm90YXRpb24uYW5ub3RhdGlvbnM/LkFnZ3JlZ2F0aW9uPy5Db250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzO1xuXHRcdFx0ZGVmaW5pdGlvbnNbYWdncmVnYXRlZFByb3BlcnR5Lm5hbWVdID0gY29udGV4dERlZmluaW5nUHJvcGVydGllc1xuXHRcdFx0XHQ/IGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMubWFwKChjdHhEZWZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGN0eERlZlByb3BlcnR5LnZhbHVlO1xuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogW107XG5cdFx0fVxuXHR9KTtcblx0Y29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBBZ2dyZWdhdGVEYXRhPiA9IHt9O1xuXG5cdHRhYmxlQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcblx0XHRjb25zdCB0YWJsZUNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0aWYgKHRhYmxlQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiB0YWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGgpIHtcblx0XHRcdGNvbnN0IHJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBkZWZpbml0aW9uc1t0YWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGhdO1xuXG5cdFx0XHQvLyBJZ25vcmUgYWdncmVnYXRlcyBjb3JyZXNwb25kaW5nIHRvIGN1cnJlbmNpZXMgb3IgdW5pdHMgb2YgbWVhc3VyZVxuXHRcdFx0aWYgKHJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgJiYgIWN1cnJlbmN5T3JVbml0UHJvcGVydGllcy5oYXModGFibGVDb2x1bW4ubmFtZSkpIHtcblx0XHRcdFx0cmVzdWx0W3RhYmxlQ29sdW1uLm5hbWVdID0ge1xuXHRcdFx0XHRcdGRlZmF1bHRBZ2dyZWdhdGU6IHt9LFxuXHRcdFx0XHRcdHJlbGF0aXZlUGF0aDogdGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbnN0IGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcdHJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMuZm9yRWFjaCgoY29udGV4dERlZmluaW5nUHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZm91bmRDb2x1bW4gPSBmaW5kQ29sdW1uRnJvbVBhdGgoY29udGV4dERlZmluaW5nUHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHRpZiAoZm91bmRDb2x1bW4pIHtcblx0XHRcdFx0XHRcdGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMucHVzaChmb3VuZENvbHVtbi5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHJlc3VsdFt0YWJsZUNvbHVtbi5uYW1lXS5kZWZhdWx0QWdncmVnYXRlLmNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIGEgdGFibGUgdmlzdWFsaXphdGlvbiBmb3IgYW5hbHl0aWNhbCB1c2UgY2FzZXMuXG4gKlxuICogQHBhcmFtIHRhYmxlVmlzdWFsaXphdGlvbiBUaGUgdmlzdWFsaXphdGlvbiB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgZGlzcGxheWVkIGluIHRoZSB0YWJsZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24gVGhlIHByZXNlbnRhdGlvblZhcmlhbnQgYW5ub3RhdGlvbiAoaWYgYW55KVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yVHlwZShcblx0dGFibGVWaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcbikge1xuXHRpZiAodGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIikge1xuXHRcdGNvbnN0IGFnZ3JlZ2F0ZXNEZWZpbml0aW9ucyA9IGdldEFnZ3JlZ2F0ZURlZmluaXRpb25zRnJvbUVudGl0eVR5cGUoZW50aXR5VHlwZSwgdGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0YWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0XHRpZiAoYWdncmVnYXRlc0RlZmluaXRpb25zKSB7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlQW5hbHl0aWNzID0gdHJ1ZTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5lbmFibGUkc2VsZWN0ID0gZmFsc2U7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0ID0gZmFsc2U7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYWdncmVnYXRlcyA9IGFnZ3JlZ2F0ZXNEZWZpbml0aW9ucztcblx0XHRcdF91cGRhdGVQcm9wZXJ0eUluZm9zV2l0aEFnZ3JlZ2F0ZXNEZWZpbml0aW9ucyh0YWJsZVZpc3VhbGl6YXRpb24pO1xuXG5cdFx0XHRjb25zdCBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucygpO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZUJhc2ljU2VhcmNoID0gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA/IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMuaW5kZXhPZihcInNlYXJjaFwiKSA+PSAwIDogdHJ1ZTtcblxuXHRcdFx0Ly8gQWRkIGdyb3VwIGFuZCBzb3J0IGNvbmRpdGlvbnMgZnJvbSB0aGUgcHJlc2VudGF0aW9uIHZhcmlhbnRcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmdyb3VwQ29uZGl0aW9ucyA9IGdldEdyb3VwQ29uZGl0aW9ucyhcblx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLFxuXHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlXG5cdFx0XHQpO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uYWdncmVnYXRlQ29uZGl0aW9ucyA9IGdldEFnZ3JlZ2F0ZUNvbmRpdGlvbnMoXG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1uc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlID0gXCJHcmlkVGFibGVcIjsgLy8gQW5hbHl0aWNhbFRhYmxlIGlzbid0IGEgcmVhbCB0eXBlIGZvciB0aGUgTURDOlRhYmxlLCBzbyB3ZSBhbHdheXMgc3dpdGNoIGJhY2sgdG8gR3JpZFxuXHR9IGVsc2UgaWYgKHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5ncm91cENvbmRpdGlvbnMgPSBnZXRHcm91cENvbmRpdGlvbnMoXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLFxuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZVxuXHRcdCk7XG5cdH0gZWxzZSBpZiAodGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJUcmVlVGFibGVcIikge1xuXHRcdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdGNvbnN0IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zKCk7XG5cdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZUJhc2ljU2VhcmNoID0gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA/IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMuaW5jbHVkZXMoXCJzZWFyY2hcIikgOiB0cnVlO1xuXHRcdHRhYmxlVmlzdWFsaXphdGlvbi5lbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQgPSBmYWxzZTtcblx0fVxufVxuXG4vKipcbiAqIEdldCB0aGUgbmF2aWdhdGlvbiB0YXJnZXQgcGF0aCBmcm9tIG1hbmlmZXN0IHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggVGhlIG5hdmlnYXRpb24gcGF0aCB0byBjaGVjayBpbiB0aGUgbWFuaWZlc3Qgc2V0dGluZ3NcbiAqIEByZXR1cm5zIE5hdmlnYXRpb24gcGF0aCBmcm9tIG1hbmlmZXN0IHNldHRpbmdzXG4gKi9cbmZ1bmN0aW9uIGdldE5hdmlnYXRpb25UYXJnZXRQYXRoKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aCAmJiBtYW5pZmVzdFdyYXBwZXIuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24obmF2aWdhdGlvblByb3BlcnR5UGF0aCkpIHtcblx0XHRjb25zdCBuYXZDb25maWcgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24obmF2aWdhdGlvblByb3BlcnR5UGF0aCk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKG5hdkNvbmZpZykubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRjb25zdCBjb250ZXh0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblx0Y29uc3QgbmF2Q29uZmlnRm9yQ29udGV4dFBhdGggPSBtYW5pZmVzdFdyYXBwZXIuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24oY29udGV4dFBhdGgpO1xuXHRpZiAobmF2Q29uZmlnRm9yQ29udGV4dFBhdGggJiYgT2JqZWN0LmtleXMobmF2Q29uZmlnRm9yQ29udGV4dFBhdGgpLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gY29udGV4dFBhdGg7XG5cdH1cblxuXHRyZXR1cm4gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgPyBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldC5uYW1lIDogZGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lO1xufVxuXG4vKipcbiAqIFNldHMgdGhlICd1bml0JyBhbmQgJ3RleHRBcnJhbmdlbWVudCcgcHJvcGVydGllcyBpbiBjb2x1bW5zIHdoZW4gbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBlbnRpdHkgdHlwZSBkaXNwbGF5ZWQgaW4gdGhlIHRhYmxlXG4gKiBAcGFyYW0gdGFibGVDb2x1bW5zIFRoZSBjb2x1bW5zIHRvIGJlIHVwZGF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUxpbmtlZFByb3BlcnRpZXMoZW50aXR5VHlwZTogRW50aXR5VHlwZSwgdGFibGVDb2x1bW5zOiBUYWJsZUNvbHVtbltdKSB7XG5cdGZ1bmN0aW9uIGZpbmRDb2x1bW5CeVBhdGgocGF0aDogc3RyaW5nKTogVGFibGVDb2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0YWJsZUNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiB7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiBhbm5vdGF0aW9uQ29sdW1uLnJlbGF0aXZlUGF0aCA9PT0gcGF0aDtcblx0XHR9KTtcblx0fVxuXG5cdHRhYmxlQ29sdW1ucy5mb3JFYWNoKChvQ29sdW1uKSA9PiB7XG5cdFx0Y29uc3Qgb1RhYmxlQ29sdW1uID0gb0NvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0aWYgKG9UYWJsZUNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQgJiYgb1RhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aCkge1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZpbmQoKG9Qcm9wOiBQcm9wZXJ0eSkgPT4gb1Byb3AubmFtZSA9PT0gb1RhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aCk7XG5cdFx0XHRpZiAob1Byb3BlcnR5KSB7XG5cdFx0XHRcdGNvbnN0IG9Vbml0ID0gZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkob1Byb3BlcnR5KSB8fCBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KG9Qcm9wZXJ0eSk7XG5cdFx0XHRcdGNvbnN0IG9UaW1lem9uZSA9IGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5KG9Qcm9wZXJ0eSk7XG5cdFx0XHRcdGNvbnN0IHNUaW1lem9uZSA9IG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cdFx0XHRcdGlmIChvVW5pdCkge1xuXHRcdFx0XHRcdGNvbnN0IG9Vbml0Q29sdW1uID0gZmluZENvbHVtbkJ5UGF0aChvVW5pdC5uYW1lKTtcblx0XHRcdFx0XHRvVGFibGVDb2x1bW4udW5pdCA9IG9Vbml0Q29sdW1uPy5uYW1lO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHNVbml0ID0gb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0O1xuXHRcdFx0XHRcdGlmIChzVW5pdCkge1xuXHRcdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnVuaXRUZXh0ID0gYCR7c1VuaXR9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9UaW1lem9uZSkge1xuXHRcdFx0XHRcdGNvbnN0IG9UaW1lem9uZUNvbHVtbiA9IGZpbmRDb2x1bW5CeVBhdGgob1RpbWV6b25lLm5hbWUpO1xuXHRcdFx0XHRcdG9UYWJsZUNvbHVtbi50aW1lem9uZSA9IG9UaW1lem9uZUNvbHVtbj8ubmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChzVGltZXpvbmUpIHtcblx0XHRcdFx0XHRvVGFibGVDb2x1bW4udGltZXpvbmVUZXh0ID0gc1RpbWV6b25lLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IGdldERpc3BsYXlNb2RlKG9Qcm9wZXJ0eSksXG5cdFx0XHRcdFx0dGV4dEFubm90YXRpb24gPSBvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29tbW9uPy5UZXh0O1xuXHRcdFx0XHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24odGV4dEFubm90YXRpb24pICYmIGRpc3BsYXlNb2RlICE9PSBcIlZhbHVlXCIpIHtcblx0XHRcdFx0XHRjb25zdCBvVGV4dENvbHVtbiA9IGZpbmRDb2x1bW5CeVBhdGgodGV4dEFubm90YXRpb24ucGF0aCk7XG5cdFx0XHRcdFx0aWYgKG9UZXh0Q29sdW1uICYmIG9UZXh0Q29sdW1uLm5hbWUgIT09IG9UYWJsZUNvbHVtbi5uYW1lKSB7XG5cdFx0XHRcdFx0XHRvVGFibGVDb2x1bW4udGV4dEFycmFuZ2VtZW50ID0ge1xuXHRcdFx0XHRcdFx0XHR0ZXh0UHJvcGVydHk6IG9UZXh0Q29sdW1uLm5hbWUsXG5cdFx0XHRcdFx0XHRcdG1vZGU6IGRpc3BsYXlNb2RlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdGNvbnN0IGhlYWRlckluZm9UaXRsZVBhdGggPSAoY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZSgpPy5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWVcblx0XHQ/LnBhdGg7XG5cdGNvbnN0IHNlbWFudGljS2V5QW5ub3RhdGlvbnMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKCk/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljS2V5O1xuXHRjb25zdCBoZWFkZXJJbmZvVHlwZU5hbWUgPSBjb252ZXJ0ZXJDb250ZXh0Py5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZSgpPy5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlR5cGVOYW1lO1xuXHRjb25zdCBzZW1hbnRpY0tleUNvbHVtbnM6IHN0cmluZ1tdID0gW107XG5cdGlmIChzZW1hbnRpY0tleUFubm90YXRpb25zKSB7XG5cdFx0c2VtYW50aWNLZXlBbm5vdGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29sdW1uKSB7XG5cdFx0XHRzZW1hbnRpY0tleUNvbHVtbnMucHVzaChvQ29sdW1uLnZhbHVlKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7IGhlYWRlckluZm9UaXRsZVBhdGgsIHNlbWFudGljS2V5Q29sdW1ucywgaGVhZGVySW5mb1R5cGVOYW1lIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdGlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnQ/OiBib29sZWFuLFxuXHR2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvblxuKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnRcblx0KTtcblx0Y29uc3QgeyBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIH0gPSBzcGxpdFBhdGgodmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGFyZ2V0UGF0aCA9IGdldE5hdmlnYXRpb25UYXJnZXRQYXRoKGNvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRjb25zdCBuYXZpZ2F0aW9uU2V0dGluZ3MgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25UYXJnZXRQYXRoKTtcblx0Y29uc3QgY29sdW1ucyA9IGdldFRhYmxlQ29sdW1ucyhsaW5lSXRlbUFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uU2V0dGluZ3MpO1xuXHRjb25zdCBvcGVyYXRpb25BdmFpbGFibGVNYXAgPSBnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAobGluZUl0ZW1Bbm5vdGF0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3Qgc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlID0gZ2V0U2VtYW50aWNLZXlzQW5kVGl0bGVJbmZvKGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCB0YWJsZUFjdGlvbnMgPSBnZXRUYWJsZUFjdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKTtcblxuXHRjb25zdCBvVmlzdWFsaXphdGlvbjogVGFibGVWaXN1YWxpemF0aW9uID0ge1xuXHRcdHR5cGU6IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlLFxuXHRcdGFubm90YXRpb246IGdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHR0YWJsZU1hbmlmZXN0Q29uZmlnLFxuXHRcdFx0Y29sdW1ucyxcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0dmlld0NvbmZpZ3VyYXRpb25cblx0XHQpLFxuXHRcdGNvbnRyb2w6IHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0YWN0aW9uczogcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyh0YWJsZUFjdGlvbnMuYWN0aW9ucyksXG5cdFx0Y29tbWFuZEFjdGlvbnM6IHRhYmxlQWN0aW9ucy5jb21tYW5kQWN0aW9ucyxcblx0XHRjb2x1bW5zOiBjb2x1bW5zLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogSlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzOiBnZXRPcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzKG9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0aGVhZGVySW5mb1RpdGxlOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1RpdGxlUGF0aCxcblx0XHRzZW1hbnRpY0tleXM6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5zZW1hbnRpY0tleUNvbHVtbnMsXG5cdFx0aGVhZGVySW5mb1R5cGVOYW1lOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1R5cGVOYW1lLFxuXHRcdGVuYWJsZSRzZWxlY3Q6IHRydWUsXG5cdFx0ZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0OiB0cnVlXG5cdH07XG5cblx0dXBkYXRlTGlua2VkUHJvcGVydGllcyhjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksIGNvbHVtbnMpO1xuXHR1cGRhdGVUYWJsZVZpc3VhbGl6YXRpb25Gb3JUeXBlKFxuXHRcdG9WaXN1YWxpemF0aW9uLFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uXG5cdCk7XG5cblx0cmV0dXJuIG9WaXN1YWxpemF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVmYXVsdFRhYmxlVmlzdWFsaXphdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBpc0JsYW5rVGFibGU/OiBib29sZWFuKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKHVuZGVmaW5lZCwgXCJcIiwgY29udmVydGVyQ29udGV4dCwgZmFsc2UpO1xuXHRjb25zdCBjb2x1bW5zID0gZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlKHt9LCBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgW10sIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCB0YWJsZU1hbmlmZXN0Q29uZmlnLnR5cGUsIFtdKTtcblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKHVuZGVmaW5lZCwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSA9IGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3Qgb1Zpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSxcblx0XHRhbm5vdGF0aW9uOiBnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uKHVuZGVmaW5lZCwgXCJcIiwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZywgaXNCbGFua1RhYmxlID8gW10gOiBjb2x1bW5zKSxcblx0XHRjb250cm9sOiB0YWJsZU1hbmlmZXN0Q29uZmlnLFxuXHRcdGFjdGlvbnM6IFtdLFxuXHRcdGNvbHVtbnM6IGNvbHVtbnMsXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBKU09OLnN0cmluZ2lmeShvcGVyYXRpb25BdmFpbGFibGVNYXApLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXM6IGdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRoZWFkZXJJbmZvVGl0bGU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVGl0bGVQYXRoLFxuXHRcdHNlbWFudGljS2V5czogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLnNlbWFudGljS2V5Q29sdW1ucyxcblx0XHRoZWFkZXJJbmZvVHlwZU5hbWU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVHlwZU5hbWUsXG5cdFx0ZW5hYmxlJHNlbGVjdDogdHJ1ZSxcblx0XHRlbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQ6IHRydWVcblx0fTtcblxuXHR1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb2x1bW5zKTtcblx0dXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yVHlwZShvVmlzdWFsaXphdGlvbiwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdHJldHVybiBvVmlzdWFsaXphdGlvbjtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgb2YgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aHMgZm9yIGFsbCBEYXRhRmllbGRGb3JBY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb24gVGhlIGluc3RhbmNlIG9mIHRoZSBsaW5lIGl0ZW1cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSByZWNvcmQgY29udGFpbmluZyBhbGwgYWN0aW9uIG5hbWVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzXG4gKi9cbmZ1bmN0aW9uIGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuXHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb24sIFwidGFibGVcIiwgY29udmVydGVyQ29udGV4dCk7XG59XG5cbi8qKlxuICogR2V0cyB1cGRhdGFibGUgcHJvcGVydHlQYXRoIGZvciB0aGUgY3VycmVudCBlbnRpdHlzZXQgaWYgdmFsaWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHVwZGF0YWJsZSBwcm9wZXJ0eSBmb3IgdGhlIHJvd3NcbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc3RyaWN0aW9ucyA9IGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgdXBkYXRhYmxlID0gcmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlO1xuXHRjb25zdCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5ID0gIWlzQ29uc3RhbnQodXBkYXRhYmxlLmV4cHJlc3Npb24pICYmIHVwZGF0YWJsZS5uYXZpZ2F0aW9uRXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIjtcblx0Y29uc3QgdXBkYXRhYmxlRXhwcmVzc2lvbiA9IGVudGl0eVNldD8uYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5VcGRhdGVSZXN0cmljdGlvbnM/LlVwZGF0YWJsZTtcblx0Y29uc3QgdXBkYXRhYmxlUHJvcGVydHlQYXRoID0gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24odXBkYXRhYmxlRXhwcmVzc2lvbikgJiYgdXBkYXRhYmxlRXhwcmVzc2lvbi5wYXRoO1xuXG5cdHJldHVybiBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5ID8gKHVwZGF0YWJsZVByb3BlcnR5UGF0aCBhcyBzdHJpbmcpIDogXCJcIjtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIHByb3BlcnR5IHBhdGhzIGFzc2lnbmVkIHRvIHRoZSBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBvcGVyYXRpb25BdmFpbGFibGVNYXAgVGhlIHJlY29yZCBjb25zaXN0aW5nIG9mIGFjdGlvbnMgYW5kIHRoZWlyIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgQ1NWIHN0cmluZyBvZiBhbGwgcHJvcGVydHkgcGF0aHMgYXNzb2NpYXRlZCB3aXRoIHRoZSBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG5cblx0Zm9yIChjb25zdCBhY3Rpb25OYW1lIGluIG9wZXJhdGlvbkF2YWlsYWJsZU1hcCkge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IG9wZXJhdGlvbkF2YWlsYWJsZU1hcFthY3Rpb25OYW1lXTtcblx0XHRpZiAocHJvcGVydHlOYW1lID09PSBudWxsKSB7XG5cdFx0XHQvLyBBbm5vdGF0aW9uIGNvbmZpZ3VyZWQgd2l0aCBleHBsaWNpdCAnbnVsbCcgKGFjdGlvbiBhZHZlcnRpc2VtZW50IHJlbGV2YW50KVxuXHRcdFx0cHJvcGVydGllcy5hZGQoYWN0aW9uTmFtZSk7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgcHJvcGVydHlOYW1lID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvLyBBZGQgcHJvcGVydHkgcGF0aHMgYW5kIG5vdCBDb25zdGFudCB2YWx1ZXMuXG5cdFx0XHRwcm9wZXJ0aWVzLmFkZChwcm9wZXJ0eU5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChwcm9wZXJ0aWVzLnNpemUpIHtcblx0XHQvLyBTb21lIGFjdGlvbnMgaGF2ZSBhbiBvcGVyYXRpb24gYXZhaWxhYmxlIGJhc2VkIG9uIHByb3BlcnR5IC0tPiB3ZSBuZWVkIHRvIGxvYWQgdGhlIEhlYWRlckluZm8uVGl0bGUgcHJvcGVydHlcblx0XHQvLyBzbyB0aGF0IHRoZSBkaWFsb2cgb24gcGFydGlhbCBhY3Rpb25zIGlzIGRpc3BsYXllZCBwcm9wZXJseSAoQkNQIDIxODAyNzE0MjUpXG5cdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdGNvbnN0IHRpdGxlUHJvcGVydHkgPSAoZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGg7XG5cdFx0aWYgKHRpdGxlUHJvcGVydHkpIHtcblx0XHRcdHByb3BlcnRpZXMuYWRkKHRpdGxlUHJvcGVydHkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBBcnJheS5mcm9tKHByb3BlcnRpZXMpLmpvaW4oXCIsXCIpO1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIG9mIGEgbGluZSBpdGVtIGFuZFxuICogcmV0dXJucyBhbGwgdGhlIFVJLkhpZGRlbiBhbm5vdGF0aW9uIGV4cHJlc3Npb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb24gQ29sbGVjdGlvbiBvZiBkYXRhIGZpZWxkcyB1c2VkIGZvciByZXByZXNlbnRhdGlvbiBpbiBhIHRhYmxlIG9yIGxpc3RcbiAqIEBwYXJhbSBjdXJyZW50RW50aXR5VHlwZSBDdXJyZW50IGVudGl0eSB0eXBlXG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdFBhdGggT2JqZWN0IHBhdGggb2YgdGhlIGRhdGEgbW9kZWxcbiAqIEBwYXJhbSBpc0VudGl0eVNldFxuICogQHJldHVybnMgQWxsIHRoZSBgVUkuSGlkZGVuYCBwYXRoIGV4cHJlc3Npb25zIGZvdW5kIGluIHRoZSByZWxldmFudCBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFVJSGlkZGVuRXhwRm9yQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0aXNFbnRpdHlTZXQ6IGJvb2xlYW5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdIHtcblx0Y29uc3QgYVVpSGlkZGVuUGF0aEV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRsaW5lSXRlbUFubm90YXRpb24uZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIGxpbmVJdGVtIGNvbnRleHQgaXMgdGhlIHNhbWUgYXMgdGhhdCBvZiB0aGUgYWN0aW9uOlxuXHRcdGlmIChcblx0XHRcdChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiAmJlxuXHRcdFx0XHRkYXRhRmllbGQ/LkFjdGlvblRhcmdldD8uaXNCb3VuZCAmJlxuXHRcdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9PT0gZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQuc291cmNlRW50aXR5VHlwZSkgfHxcblx0XHRcdChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiAmJlxuXHRcdFx0XHRkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0ICYmXG5cdFx0XHRcdGRhdGFGaWVsZD8uSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUpXG5cdFx0KSB7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGFVaUhpZGRlblBhdGhFeHByZXNzaW9ucy5wdXNoKGVxdWFsKGdldEJpbmRpbmdFeHBGcm9tQ29udGV4dChkYXRhRmllbGQsIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLCBpc0VudGl0eVNldCksIGZhbHNlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFVaUhpZGRlblBhdGhFeHByZXNzaW9ucztcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGNoYW5nZSB0aGUgY29udGV4dCBjdXJyZW50bHkgcmVmZXJlbmNlZCBieSB0aGlzIGJpbmRpbmcgYnkgcmVtb3ZpbmcgdGhlIGxhc3QgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cbiAqXG4gKiBJdCBpcyB1c2VkIChzcGVjaWZpY2FsbHkgaW4gdGhpcyBjYXNlKSwgdG8gdHJhbnNmb3JtIGEgYmluZGluZyBtYWRlIGZvciBhIE5hdlByb3AgY29udGV4dCAvTWFpbk9iamVjdC9OYXZQcm9wMS9OYXZQcm9wMixcbiAqIGludG8gYSBiaW5kaW5nIG9uIHRoZSBwcmV2aW91cyBjb250ZXh0IC9NYWluT2JqZWN0L05hdlByb3AxLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHwgQ3VzdG9tQWN0aW9uXG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdFBhdGggRGF0YU1vZGVsT2JqZWN0UGF0aFxuICogQHBhcmFtIGlzRW50aXR5U2V0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGdldEJpbmRpbmdFeHBGcm9tQ29udGV4dChcblx0c291cmNlOiBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBDdXN0b21BY3Rpb24sXG5cdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRpc0VudGl0eVNldDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+IHtcblx0bGV0IHNFeHByZXNzaW9uO1xuXHRpZiAoXG5cdFx0KHNvdXJjZSBhcyBEYXRhRmllbGRGb3JBY3Rpb24pPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uIHx8XG5cdFx0KHNvdXJjZSBhcyBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXG5cdCkge1xuXHRcdHNFeHByZXNzaW9uID0gKHNvdXJjZSBhcyBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbjtcblx0fSBlbHNlIHtcblx0XHRzRXhwcmVzc2lvbiA9IChzb3VyY2UgYXMgQ3VzdG9tQWN0aW9uKT8udmlzaWJsZTtcblx0fVxuXHRsZXQgc1BhdGg6IHN0cmluZztcblx0aWYgKGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKHNFeHByZXNzaW9uKSkge1xuXHRcdHNQYXRoID0gc0V4cHJlc3Npb24ucGF0aDtcblx0fSBlbHNlIHtcblx0XHRzUGF0aCA9IHNFeHByZXNzaW9uIGFzIHN0cmluZztcblx0fVxuXHRpZiAoc1BhdGgpIHtcblx0XHRpZiAoKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxLCBzUGF0aC5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly9jaGVjayBpZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBpcyBjb3JyZWN0OlxuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFTcGxpdFBhdGhbMF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGlzTmF2aWdhdGlvblByb3BlcnR5KGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRPYmplY3QpICYmXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXJ0bmVyID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYVNwbGl0UGF0aC5zbGljZSgxKS5qb2luKFwiL1wiKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIG5vIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIGl0J3MgYW4gZW50aXR5U2V0LCB0aGUgZXhwcmVzc2lvbiBiaW5kaW5nIGhhcyB0byBiZSByZXR1cm5lZDpcblx0XHR9IGVsc2UgaWYgKGlzRW50aXR5U2V0KSB7XG5cdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoc1BhdGgpO1xuXHRcdFx0Ly8gb3RoZXJ3aXNlIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgY2Fubm90IGJlIHRha2VuIGludG8gYWNjb3VudCBmb3IgdGhlIHNlbGVjdGlvbiBtb2RlIGV2YWx1YXRpb246XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCB0aGUgbWFuaWZlc3QgYWN0aW9ucyBhbmQgY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiBJZiB0aGUgZGF0YSBmaWVsZCBpcyBhbHNvIHJlZmVyZW5jZWQgYXMgYSBjdXN0b20gYWN0aW9uLlxuICogSWYgdGhlIHVuZGVybHlpbmcgbWFuaWZlc3QgYWN0aW9uIGlzIGVpdGhlciBhIGJvdW5kIGFjdGlvbiBvciBoYXMgdGhlICdSZXF1aXJlc0NvbnRleHQnIHByb3BlcnR5IHNldCB0byB0cnVlLlxuICpcbiAqIElmIHNvLCB0aGUgJ3JlcXVpcmVzU2VsZWN0aW9uJyBwcm9wZXJ0eSBpcyBmb3JjZWQgdG8gJ3RydWUnIGluIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkSWQgSWQgb2YgdGhlIERhdGFGaWVsZCBldmFsdWF0ZWRcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGV2YWx1YXRlZFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBEYXRhRmllbGQgaXMgZm91bmQgYW1vbmcgdGhlIG1hbmlmZXN0IGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlTWFuaWZlc3RBY3Rpb25BbmRUYWdJdChcblx0ZGF0YUZpZWxkSWQ6IHN0cmluZyxcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPlxuKTogYm9vbGVhbiB7XG5cdHJldHVybiBPYmplY3Qua2V5cyhtYW5pZmVzdEFjdGlvbnMpLnNvbWUoKGFjdGlvbktleSkgPT4ge1xuXHRcdGlmIChhY3Rpb25LZXkgPT09IGRhdGFGaWVsZElkKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKT8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kIHx8XG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKT8uUmVxdWlyZXNDb250ZXh0XG5cdFx0XHQpIHtcblx0XHRcdFx0bWFuaWZlc3RBY3Rpb25zW2RhdGFGaWVsZElkXS5yZXF1aXJlc1NlbGVjdGlvbiA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIG9mIGEgbGluZSBpdGVtIGFuZFxuICogY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqIElmIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGlzIGFsd2F5cyB2aXNpYmxlIGluIHRoZSB0YWJsZSB0b29sYmFyIGFuZCByZXF1aXJlcyBhIGNvbnRleHRcbiAqIElmIGFuIGFjdGlvbiBpcyBhbHNvIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LCBpdCBpcyBzZXQgYXNpZGUgYW5kIHdpbGwgYmUgY29uc2lkZXJlZFxuICogd2hlbiBnb2luZyB0aHJvdWdoIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgZm9yIHJlcHJlc2VudGF0aW9uIGluIGEgdGFibGUgb3IgbGlzdFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGN1cnJlbnRFbnRpdHlUeXBlIEN1cnJlbnQgRW50aXR5IFR5cGVcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCAxIGFjdGlvbiB0aGF0IG1lZXRzIHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBoYXNCb3VuZEFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIGxpbmVJdGVtQW5ub3RhdGlvbi5zb21lKChkYXRhRmllbGQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pICYmXG5cdFx0XHRkYXRhRmllbGQ/LklubGluZT8udmFsdWVPZigpICE9PSB0cnVlICYmXG5cdFx0XHQoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IGZhbHNlIHx8IGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB1bmRlZmluZWQpXG5cdFx0KSB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRcdFx0Y29uc3QgbWFuaWZlc3RBY3Rpb25JZCA9IGdlbmVyYXRlKFtcIkRhdGFGaWVsZEZvckFjdGlvblwiLCBkYXRhRmllbGQuQWN0aW9uIGFzIHN0cmluZ10pO1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9yQWN0b24gZnJvbSBhbm5vdGF0aW9uIGFsc28gZXhpc3RzIGluIHRoZSBtYW5pZmVzdCwgaXRzIHZpc2liaWxpdHkgd2lsbCBiZSBldmFsdWF0ZWQgbGF0ZXIgb25cblx0XHRcdFx0aWYgKHVwZGF0ZU1hbmlmZXN0QWN0aW9uQW5kVGFnSXQobWFuaWZlc3RBY3Rpb25JZCwgZGF0YUZpZWxkLCBtYW5pZmVzdEFjdGlvbnMpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBsaW5lSXRlbSBjb250ZXh0IGlzIHRoZSBzYW1lIGFzIHRoYXQgb2YgdGhlIGFjdGlvbjpcblx0XHRcdFx0cmV0dXJuIGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kICYmIGN1cnJlbnRFbnRpdHlUeXBlID09PSBkYXRhRmllbGQ/LkFjdGlvblRhcmdldC5zb3VyY2VFbnRpdHlUeXBlO1xuXHRcdFx0fSBlbHNlIGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gYW5ub3RhdGlvbiBhbHNvIGV4aXN0cyBpbiB0aGUgbWFuaWZlc3QsIGl0cyB2aXNpYmlsaXR5IHdpbGwgYmUgZXZhbHVhdGVkIGxhdGVyIG9uXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHR1cGRhdGVNYW5pZmVzdEFjdGlvbkFuZFRhZ0l0KFxuXHRcdFx0XHRcdFx0YERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjo6JHtkYXRhRmllbGQuU2VtYW50aWNPYmplY3R9Ojoke2RhdGFGaWVsZC5BY3Rpb259YCxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdG1hbmlmZXN0QWN0aW9uc1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYXNDdXN0b21BY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhcihtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4pOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuc29tZSgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9uID0gbWFuaWZlc3RBY3Rpb25zW2FjdGlvbktleV07XG5cdFx0aWYgKGFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiAmJiBhY3Rpb24udmlzaWJsZT8udG9TdHJpbmcoKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgdGhlIGN1c3RvbSBhY3Rpb25zICh3aXRoIGtleSByZXF1aXJlc1NlbGVjdGlvbikgZGVjbGFyZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgY3VycmVudCBsaW5lIGl0ZW0gYW5kIHJldHVybnMgYWxsIHRoZVxuICogdmlzaWJsZSBrZXkgdmFsdWVzIGFzIGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgQXJyYXk8RXhwcmVzc2lvbjxib29sZWFuPj4gQWxsIHRoZSB2aXNpYmxlIHBhdGggZXhwcmVzc2lvbnMgb2YgdGhlIGFjdGlvbnMgdGhhdCBtZWV0IHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQobWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10ge1xuXHRjb25zdCBhVmlzaWJsZVBhdGhFeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0aWYgKG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuZm9yRWFjaCgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRcdGlmIChhY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHRydWUgJiYgYWN0aW9uLnZpc2libGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGFjdGlvbi52aXNpYmxlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0LypUaGUgZmluYWwgYWltIHdvdWxkIGJlIHRvIGNoZWNrIGlmIHRoZSBwYXRoIGV4cHJlc3Npb24gZGVwZW5kcyBvbiB0aGUgcGFyZW50IGNvbnRleHRcblx0XHRcdFx0XHRhbmQgY29uc2lkZXJzIG9ubHkgdGhvc2UgZXhwcmVzc2lvbnMgZm9yIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb24sXG5cdFx0XHRcdFx0YnV0IGN1cnJlbnRseSBub3QgcG9zc2libGUgZnJvbSB0aGUgbWFuaWZlc3QgYXMgdGhlIHZpc2libGUga2V5IGlzIGJvdW5kIG9uIHRoZSBwYXJlbnQgZW50aXR5LlxuXHRcdFx0XHRcdFRyaWNreSB0byBkaWZmZXJlbnRpYXRlIHRoZSBwYXRoIGFzIGl0J3MgZG9uZSBmb3IgdGhlIEhpZGRlbiBhbm5vdGF0aW9uLlxuXHRcdFx0XHRcdEZvciB0aGUgdGltZSBiZWluZyB3ZSBjb25zaWRlciBhbGwgdGhlIHBhdGhzIG9mIHRoZSBtYW5pZmVzdCovXG5cblx0XHRcdFx0XHRhVmlzaWJsZVBhdGhFeHByZXNzaW9ucy5wdXNoKHJlc29sdmVCaW5kaW5nU3RyaW5nKGFjdGlvbj8udmlzaWJsZT8udmFsdWVPZigpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVZpc2libGVQYXRoRXhwcmVzc2lvbnM7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIHBhdGggaXMgc3RhdGljYWxseSBkZWxldGFibGUgb3IgdXBkYXRhYmxlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgY2FwYWJpbGl0aWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uIHtcblx0Y29uc3QgaXNEZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRjb25zdCBpc1VwZGF0YWJsZSA9IGlzUGF0aFVwZGF0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdHJldHVybiB7XG5cdFx0aXNEZWxldGFibGU6ICEoaXNDb25zdGFudChpc0RlbGV0YWJsZSkgJiYgaXNEZWxldGFibGUudmFsdWUgPT09IGZhbHNlKSxcblx0XHRpc1VwZGF0YWJsZTogIShpc0NvbnN0YW50KGlzVXBkYXRhYmxlKSAmJiBpc1VwZGF0YWJsZS52YWx1ZSA9PT0gZmFsc2UpXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3Rpb25Nb2RlKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0VudGl0eVNldDogYm9vbGVhbixcblx0dGFyZ2V0Q2FwYWJpbGl0aWVzOiBUYWJsZUNhcGFiaWxpdHlSZXN0cmljdGlvbixcblx0ZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IGNvbnN0YW50KGZhbHNlKVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHR9XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5ncyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGxldCBzZWxlY3Rpb25Nb2RlID0gdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3M/LnNlbGVjdGlvbk1vZGU7XG5cdGxldCBhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdLFxuXHRcdGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuYWN0aW9ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFtdLFxuXHRcdHVuZGVmaW5lZCxcblx0XHRmYWxzZVxuXHQpO1xuXHRsZXQgaXNQYXJlbnREZWxldGFibGUsIHBhcmVudEVudGl0eVNldERlbGV0YWJsZTtcblx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlKSB7XG5cdFx0aXNQYXJlbnREZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRcdHBhcmVudEVudGl0eVNldERlbGV0YWJsZSA9IGlzUGFyZW50RGVsZXRhYmxlID8gY29tcGlsZUV4cHJlc3Npb24oaXNQYXJlbnREZWxldGFibGUsIHRydWUpIDogaXNQYXJlbnREZWxldGFibGU7XG5cdH1cblxuXHRjb25zdCBiTWFzc0VkaXRFbmFibGVkOiBib29sZWFuID0gIWlzQ29uc3RhbnQobWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbikgfHwgbWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbi52YWx1ZSAhPT0gZmFsc2U7XG5cdGlmIChzZWxlY3Rpb25Nb2RlICYmIHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuTm9uZSAmJiBkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbikge1xuXHRcdGlmIChjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZSAmJiBiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0XHQvLyBNYXNzIEVkaXQgaW4gT1AgaXMgZW5hYmxlZCBvbmx5IGluIGVkaXQgbW9kZS5cblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdGFuZChVSS5Jc0VkaXRhYmxlLCBtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uKSxcblx0XHRcdFx0XHRjb25zdGFudChcIk11bHRpXCIpLFxuXHRcdFx0XHRcdGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoXCJNdWx0aVwiKSwgY29uc3RhbnQoXCJOb25lXCIpKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoYk1hc3NFZGl0RW5hYmxlZCkge1xuXHRcdFx0cmV0dXJuIFNlbGVjdGlvbk1vZGUuTXVsdGk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoXCJNdWx0aVwiKSwgY29uc3RhbnQoXCJOb25lXCIpKSk7XG5cdH1cblx0aWYgKCFzZWxlY3Rpb25Nb2RlIHx8IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuQXV0bykge1xuXHRcdHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cdGlmIChiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0Ly8gT3ZlcnJpZGUgZGVmYXVsdCBzZWxlY3Rpb24gbW9kZSB3aGVuIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0c2VsZWN0aW9uTW9kZSA9IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2luZ2xlID8gU2VsZWN0aW9uTW9kZS5TaW5nbGUgOiBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cblx0aWYgKFxuXHRcdGhhc0JvdW5kQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobGluZUl0ZW1Bbm5vdGF0aW9uLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpIHx8XG5cdFx0aGFzQ3VzdG9tQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMpXG5cdCkge1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHR9XG5cdGFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMgPSBnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0KFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSxcblx0XHRpc0VudGl0eVNldFxuXHQpO1xuXHRhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyA9IGdldFZpc2libGVFeHBGb3JDdXN0b21BY3Rpb25zUmVxdWlyaW5nQ29udGV4dChtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucyk7XG5cblx0Ly8gTm8gYWN0aW9uIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdGlmIChcblx0XHRhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdChkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCBiTWFzc0VkaXRFbmFibGVkKVxuXHQpIHtcblx0XHRpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0XHQvLyBFeGFtcGxlOiBPUCBjYXNlXG5cdFx0XHRpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IHBhcmVudEVudGl0eVNldERlbGV0YWJsZSAhPT0gXCJmYWxzZVwiIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdFx0Ly8gQnVpbGRpbmcgZXhwcmVzc2lvbiBmb3IgZGVsZXRlIGFuZCBtYXNzIGVkaXRcblx0XHRcdFx0Y29uc3QgYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBvcihcblx0XHRcdFx0XHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCB0cnVlLCAvLyBkZWZhdWx0IGRlbGV0ZSB2aXNpYmlsaXR5IGFzIHRydWVcblx0XHRcdFx0XHRtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRpZkVsc2UoYW5kKFVJLklzRWRpdGFibGUsIGJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSkpXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRW50aXR5U2V0IGRlbGV0YWJsZTpcblx0XHR9IGVsc2UgaWYgKGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdC8vIGV4YW1wbGU6IExSIHNjZW5hcmlvXG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0XHR9IGVsc2UgaWYgKHRhcmdldENhcGFiaWxpdGllcy5pc0RlbGV0YWJsZSAmJiBkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFwiTm9uZVwiKSkpO1xuXHRcdFx0Ly8gRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdFx0fVxuXHRcdC8vIFRoZXJlIGFyZSBhY3Rpb25zIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdH0gZWxzZSBpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0Ly8gRXhhbXBsZTogT1AgY2FzZVxuXHRcdGlmICh0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUgfHwgcGFyZW50RW50aXR5U2V0RGVsZXRhYmxlICE9PSBcImZhbHNlXCIgfHwgYk1hc3NFZGl0RW5hYmxlZCkge1xuXHRcdFx0Ly8gVXNlIHNlbGVjdGlvbk1vZGUgaW4gZWRpdCBtb2RlIGlmIGRlbGV0ZSBpcyBlbmFibGVkIG9yIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0XHRjb25zdCBlZGl0TW9kZWJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gaWZFbHNlKFxuXHRcdFx0XHRiTWFzc0VkaXRFbmFibGVkICYmICF0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUsXG5cdFx0XHRcdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24sXG5cdFx0XHRcdGNvbnN0YW50KHRydWUpXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0YW5kKFVJLklzRWRpdGFibGUsIGVkaXRNb2RlYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRcdGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0XHRcdGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSlcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoc2VsZWN0aW9uTW9kZSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL0VudGl0eVNldCBkZWxldGFibGU6XG5cdH0gZWxzZSBpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHQvLyBFeGFtcGxlOiBMUiBzY2VuYXJpb1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHRcdC8vRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRvciguLi5hSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmNvbmNhdChhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyksIG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIHRhYmxlIGFjdGlvbnMgZnJvbSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCB0YWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRjb25zdCBoaWRkZW5UYWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXG5cdGNvbnN0IGNvcHlEYXRhRmllbGQgPSBnZXRDb3B5QWN0aW9uKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIGRhdGFGaWVsZElzQ29weUFjdGlvbihkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMpO1xuXHRcdH0pIGFzIERhdGFGaWVsZEZvckFjdGlvblR5cGVzW11cblx0KTtcblxuXHRjb25zdCBzRW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmZ1bGx5UXVhbGlmaWVkTmFtZTtcblxuXHRpZiAoY29weURhdGFGaWVsZCkge1xuXHRcdHRhYmxlQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuQ29weSxcblx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoY29weURhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGNvcHlEYXRhRmllbGQpLFxuXHRcdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSkpLFxuXHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdG5vdChcblx0XHRcdFx0XHRlcXVhbChcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0Y29weURhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0dGV4dDogY29weURhdGFGaWVsZC5MYWJlbD8udG9TdHJpbmcoKSA/PyBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0NPTU1PTl9DT1BZXCIpLFxuXHRcdFx0aXNOYXZpZ2FibGU6IHRydWVcblx0XHR9KTtcblx0fVxuXG5cdGxpbmVJdGVtQW5ub3RhdGlvblxuXHRcdC5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuICFkYXRhRmllbGRJc0NvcHlBY3Rpb24oZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbik7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpIHtcblx0XHRcdFx0aGlkZGVuVGFibGVBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdCxcblx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkKSAmJlxuXHRcdFx0XHRkYXRhRmllbGQuSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUgJiZcblx0XHRcdFx0ZGF0YUZpZWxkLkRldGVybWluaW5nPy52YWx1ZU9mKCkgIT09IHRydWVcblx0XHRcdCkge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0Ly8gVGhlcmUgYXJlIHRocmVlIGNhc2VzIHdoZW4gYSB0YWJsZSBhY3Rpb24gaGFzIGFuIE9wZXJhdGlvbkF2YWlsYWJsZSB0aGF0IGxlYWRzIHRvIGFuIGVuYWJsZW1lbnQgZXhwcmVzc2lvblxuXHRcdFx0XHRcdFx0Ly8gYW5kIGlzIG5vdCBkZXBlbmRlbnQgdXBvbiB0aGUgdGFibGUgZW50cmllcy5cblx0XHRcdFx0XHRcdC8vIDEuIEFuIGFjdGlvbiB3aXRoIGFuIG92ZXJsb2FkLCB0aGF0IGlzIGV4ZWN1dGVkIGFnYWluc3QgYSBwYXJlbnQgZW50aXR5LlxuXHRcdFx0XHRcdFx0Ly8gMi4gQW4gdW5ib3VuZCBhY3Rpb25cblx0XHRcdFx0XHRcdC8vIDMuIEEgc3RhdGljIGFjdGlvbiAodGhhdCBpcywgYm91bmQgdG8gYSBjb2xsZWN0aW9uKVxuXHRcdFx0XHRcdFx0bGV0IHVzZUVuYWJsZWRFeHByZXNzaW9uID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uaXNCb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFVuYm91bmQgYWN0aW9uLiBJcyByZWNvZ25pc2VkLCBidXQgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIGNoZWNrcyBmb3IgaXNCb3VuZCA9IHRydWUsIHNvIG5vdCBnZW5lcmF0ZWQuXG5cdFx0XHRcdFx0XHRcdFx0dXNlRW5hYmxlZEV4cHJlc3Npb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQ/LmlzQm91bmQgJiYgZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uc291cmNlVHlwZSAhPT0gc0VudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBPdmVybG9hZCBhY3Rpb25cblx0XHRcdFx0XHRcdFx0XHR1c2VFbmFibGVkRXhwcmVzc2lvbiA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkLkFjdGlvblRhcmdldD8ucGFyYW1ldGVyc1swXS5pc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBTdGF0aWMgYWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0dXNlRW5hYmxlZEV4cHJlc3Npb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IHRhYmxlQWN0aW9uOiBCYXNlQWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0XHRcdG5vdChcblx0XHRcdFx0XHRcdFx0XHRcdGVxdWFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aWYgKHVzZUVuYWJsZWRFeHByZXNzaW9uKSB7XG5cdFx0XHRcdFx0XHRcdHRhYmxlQWN0aW9uLmVuYWJsZWQgPSBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbihjb252ZXJ0ZXJDb250ZXh0LCBkYXRhRmllbGQuQWN0aW9uVGFyZ2V0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRhYmxlQWN0aW9ucy5wdXNoKHRhYmxlQWN0aW9uKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdFx0XHR0YWJsZUFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRcdFx0bm90KFxuXHRcdFx0XHRcdFx0XHRcdFx0ZXF1YWwoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHR0YWJsZUFjdGlvbnMsXG5cdFx0aGlkZGVuVGFibGVBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIGJpbmRpbmdFeHByZXNzaW9uIGZvciB0aGUgaGlnaGxpZ2h0IHJvd1NldHRpbmcgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBjcml0aWNhbGl0eUFubm90YXRpb24gUGF0aCBvciB2YWx1ZSBvZiB0aGUgY3JpdGljYWxpdHlcbiAqIEBwYXJhbSBpc0RyYWZ0Um9vdE9yTm9kZSAgSXMgdGhlIGN1cnJlbnQgZW50aXR5U2V0IGFuIERyYWZ0IHJvb3Qgb3IgYSBub2RlXG4gKiBAcGFyYW0gdGFyZ2V0RW50aXR5VHlwZSBUaGUgdGFyZ2V0ZWQgZW50aXR5VHlwZVxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbkJpbmRpbmdcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdGNyaXRpY2FsaXR5QW5ub3RhdGlvbjogUGF0aEFubm90YXRpb25FeHByZXNzaW9uPENyaXRpY2FsaXR5VHlwZT4gfCBFbnVtVmFsdWU8Q3JpdGljYWxpdHlUeXBlPiB8IHVuZGVmaW5lZCxcblx0aXNEcmFmdFJvb3RPck5vZGU6IGJvb2xlYW4sXG5cdHRhcmdldEVudGl0eVR5cGU/OiBFbnRpdHlUeXBlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248TWVzc2FnZVR5cGU+IHtcblx0bGV0IGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uOiBNZXNzYWdlVHlwZSB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxNZXNzYWdlVHlwZT4gPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRpZiAoY3JpdGljYWxpdHlBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiBjcml0aWNhbGl0eUFubm90YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNyaXRpY2FsaXR5QW5ub3RhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRW51bSBWYWx1ZSBzbyB3ZSBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3RhdGljIHBhcnRcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0TWVzc2FnZVR5cGVGcm9tQ3JpdGljYWxpdHlUeXBlKGNyaXRpY2FsaXR5QW5ub3RhdGlvbik7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYU1pc3NpbmdLZXlzOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248c3RyaW5nPltdID0gW107XG5cdHRhcmdldEVudGl0eVR5cGU/LmtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0aWYgKGtleS5uYW1lICE9PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdGFNaXNzaW5nS2V5cy5wdXNoKHBhdGhJbk1vZGVsKGtleS5uYW1lLCB1bmRlZmluZWQpKTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBmb3JtYXRSZXN1bHQoXG5cdFx0W1xuXHRcdFx0ZGVmYXVsdEhpZ2hsaWdodFJvd0RlZmluaXRpb24sXG5cdFx0XHRwYXRoSW5Nb2RlbChgZmlsdGVyZWRNZXNzYWdlc2AsIFwiaW50ZXJuYWxcIiksXG5cdFx0XHRpc0RyYWZ0Um9vdE9yTm9kZSAmJiBFbnRpdHkuSGFzQWN0aXZlLFxuXHRcdFx0aXNEcmFmdFJvb3RPck5vZGUgJiYgRW50aXR5LklzQWN0aXZlLFxuXHRcdFx0YCR7aXNEcmFmdFJvb3RPck5vZGV9YCxcblx0XHRcdC4uLmFNaXNzaW5nS2V5c1xuXHRcdF0sXG5cdFx0dGFibGVGb3JtYXR0ZXJzLnJvd0hpZ2hsaWdodGluZyxcblx0XHR0YXJnZXRFbnRpdHlUeXBlXG5cdCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRDcmVhdGlvbkJlaGF2aW91cihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZ1xuKTogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbltcImNyZWF0ZVwiXSB7XG5cdGNvbnN0IG5hdmlnYXRpb24gPSBuYXZpZ2F0aW9uU2V0dGluZ3M/LmNyZWF0ZSB8fCBuYXZpZ2F0aW9uU2V0dGluZ3M/LmRldGFpbDtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IG9yaWdpbmFsVGFibGVTZXR0aW5ncyA9ICh0YWJsZU1hbmlmZXN0U2V0dGluZ3MgJiYgdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MpIHx8IHt9O1xuXHQvLyBjcm9zcy1hcHBcblx0aWYgKG5hdmlnYXRpb24/Lm91dGJvdW5kICYmIG5hdmlnYXRpb24ub3V0Ym91bmREZXRhaWwgJiYgbmF2aWdhdGlvblNldHRpbmdzPy5jcmVhdGUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bW9kZTogXCJFeHRlcm5hbFwiLFxuXHRcdFx0b3V0Ym91bmQ6IG5hdmlnYXRpb24ub3V0Ym91bmQsXG5cdFx0XHRvdXRib3VuZERldGFpbDogbmF2aWdhdGlvbi5vdXRib3VuZERldGFpbCxcblx0XHRcdG5hdmlnYXRpb25TZXR0aW5nczogbmF2aWdhdGlvblNldHRpbmdzXG5cdFx0fTtcblx0fVxuXG5cdGxldCBuZXdBY3Rpb247XG5cdGlmIChsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHQvLyBpbi1hcHBcblx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9ucyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IHRhcmdldEFubm90YXRpb25zQ29tbW9uID0gdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19Db21tb24sXG5cdFx0XHR0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24gPSB0YXJnZXRBbm5vdGF0aW9ucz8uU2Vzc2lvbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19TZXNzaW9uO1xuXHRcdG5ld0FjdGlvbiA9IHRhcmdldEFubm90YXRpb25zQ29tbW9uPy5EcmFmdFJvb3Q/Lk5ld0FjdGlvbiB8fCB0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvbjtcblxuXHRcdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBuZXdBY3Rpb24pIHtcblx0XHRcdC8vIEEgY29tYmluYXRpb24gb2YgJ0NyZWF0aW9uUm93JyBhbmQgJ05ld0FjdGlvbicgZG9lcyBub3QgbWFrZSBzZW5zZVxuXHRcdFx0dGhyb3cgRXJyb3IoYENyZWF0aW9uIG1vZGUgJyR7Q3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93fScgY2FuIG5vdCBiZSB1c2VkIHdpdGggYSBjdXN0b20gJ25ldycgYWN0aW9uICgke25ld0FjdGlvbn0pYCk7XG5cdFx0fVxuXHRcdGlmIChuYXZpZ2F0aW9uPy5yb3V0ZSkge1xuXHRcdFx0Ly8gcm91dGUgc3BlY2lmaWVkXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRtb2RlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUsXG5cdFx0XHRcdGFwcGVuZDogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQsXG5cdFx0XHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpLFxuXHRcdFx0XHRuYXZpZ2F0ZVRvVGFyZ2V0OiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlID8gbmF2aWdhdGlvbi5yb3V0ZSA6IHVuZGVmaW5lZCAvLyBuYXZpZ2F0ZSBvbmx5IGluIE5ld1BhZ2UgbW9kZVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvLyBubyBuYXZpZ2F0aW9uIG9yIG5vIHJvdXRlIHNwZWNpZmllZCAtIGZhbGxiYWNrIHRvIGlubGluZSBjcmVhdGUgaWYgb3JpZ2luYWwgY3JlYXRpb24gbW9kZSB3YXMgJ05ld1BhZ2UnXG5cdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID0gQ3JlYXRpb25Nb2RlLklubGluZTtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIHdhcyBubyBzcGVjaWZpYyBjb25maWd1cmF0aW9uIGZvciB0aGUgY3JlYXRlQXRFbmQgd2UgZm9yY2UgaXQgdG8gZmFsc2Vcblx0XHRpZiAob3JpZ2luYWxUYWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1vZGU6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSxcblx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpXG5cdH07XG59XG5cbmNvbnN0IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dGFyZ2V0UGF0aDogc3RyaW5nLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZVxuKSB7XG5cdGxldCBwcmVzc1Byb3BlcnR5LCBuYXZpZ2F0aW9uVGFyZ2V0O1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPiA9IGNvbnN0YW50KE1lc3NhZ2VUeXBlLk5vbmUpO1xuXHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGlmIChuYXZpZ2F0aW9uU2V0dGluZ3MgJiYgbGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0bmF2aWdhdGlvblRhcmdldCA9IG5hdmlnYXRpb25TZXR0aW5ncy5kaXNwbGF5Py50YXJnZXQgfHwgbmF2aWdhdGlvblNldHRpbmdzLmRldGFpbD8ub3V0Ym91bmQ7XG5cdFx0aWYgKG5hdmlnYXRpb25UYXJnZXQpIHtcblx0XHRcdHByZXNzUHJvcGVydHkgPVxuXHRcdFx0XHRcIi5oYW5kbGVycy5vbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQoICRjb250cm9sbGVyICwnXCIgKyBuYXZpZ2F0aW9uVGFyZ2V0ICsgXCInLCAkeyRwYXJhbWV0ZXJzPmJpbmRpbmdDb250ZXh0fSlcIjtcblx0XHR9IGVsc2UgaWYgKHRhcmdldEVudGl0eVR5cGUpIHtcblx0XHRcdGNvbnN0IHRhcmdldEVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdFx0XHRuYXZpZ2F0aW9uVGFyZ2V0ID0gbmF2aWdhdGlvblNldHRpbmdzLmRldGFpbD8ucm91dGU7XG5cdFx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gZ2V0SGlnaGxpZ2h0Um93QmluZGluZyhcblx0XHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmFubm90YXRpb25zPy5VST8uQ3JpdGljYWxpdHksXG5cdFx0XHRcdCEhTW9kZWxIZWxwZXIuZ2V0RHJhZnRSb290KHRhcmdldEVudGl0eVNldCkgfHwgISFNb2RlbEhlbHBlci5nZXREcmFmdE5vZGUodGFyZ2V0RW50aXR5U2V0KSxcblx0XHRcdFx0dGFyZ2V0RW50aXR5VHlwZVxuXHRcdFx0KTtcblx0XHRcdGlmIChuYXZpZ2F0aW9uVGFyZ2V0ICYmIFR5cGVHdWFyZHMuaXNFbnRpdHlTZXQodGFyZ2V0RW50aXR5U2V0KSkge1xuXHRcdFx0XHRwcmVzc1Byb3BlcnR5ID1cblx0XHRcdFx0XHRcIkFQSS5vblRhYmxlUm93UHJlc3MoJGV2ZW50LCAkY29udHJvbGxlciwgJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0sIHsgY2FsbEV4dGVuc2lvbjogdHJ1ZSwgdGFyZ2V0UGF0aDogJ1wiICtcblx0XHRcdFx0XHR0YXJnZXRQYXRoICtcblx0XHRcdFx0XHRcIicsIGVkaXRhYmxlIDogXCIgK1xuXHRcdFx0XHRcdChNb2RlbEhlbHBlci5nZXREcmFmdFJvb3QodGFyZ2V0RW50aXR5U2V0KSB8fCBNb2RlbEhlbHBlci5nZXREcmFmdE5vZGUodGFyZ2V0RW50aXR5U2V0KVxuXHRcdFx0XHRcdFx0PyBcIiEkeyRwYXJhbWV0ZXJzPmJpbmRpbmdDb250ZXh0fS5nZXRQcm9wZXJ0eSgnSXNBY3RpdmVFbnRpdHknKVwiXG5cdFx0XHRcdFx0XHQ6IFwidW5kZWZpbmVkXCIpICtcblx0XHRcdFx0XHQodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiIHx8IHRhYmxlVHlwZSA9PT0gXCJUcmVlVGFibGVcIiA/IFwiLCBiUmVjcmVhdGVDb250ZXh0OiB0cnVlXCIgOiBcIlwiKSArXG5cdFx0XHRcdFx0XCJ9KVwiOyAvL05lZWQgdG8gYWNjZXNzIHRvIERyYWZ0Um9vdCBhbmQgRHJhZnROb2RlICEhISEhISFcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Y29uc3Qgcm93TmF2aWdhdGVkRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+ID0gZm9ybWF0UmVzdWx0KFxuXHRcdFtwYXRoSW5Nb2RlbChcIi9kZWVwZXN0UGF0aFwiLCBcImludGVybmFsXCIpXSxcblx0XHR0YWJsZUZvcm1hdHRlcnMubmF2aWdhdGVkUm93LFxuXHRcdHRhcmdldEVudGl0eVR5cGVcblx0KTtcblx0cmV0dXJuIHtcblx0XHRwcmVzczogcHJlc3NQcm9wZXJ0eSxcblx0XHRhY3Rpb246IHByZXNzUHJvcGVydHkgPyBcIk5hdmlnYXRpb25cIiA6IHVuZGVmaW5lZCxcblx0XHRyb3dIaWdobGlnaHRpbmc6IGNvbXBpbGVFeHByZXNzaW9uKGNyaXRpY2FsaXR5UHJvcGVydHkpLFxuXHRcdHJvd05hdmlnYXRlZDogY29tcGlsZUV4cHJlc3Npb24ocm93TmF2aWdhdGVkRXhwcmVzc2lvbiksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24obm90KFVJLklzSW5hY3RpdmUpKVxuXHR9O1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY29sdW1ucyBmcm9tIHRoZSBlbnRpdHlUeXBlLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zVG9CZUNyZWF0ZWQgVGhlIGNvbHVtbnMgdG8gYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSB0YXJnZXQgZW50aXR5IHR5cGUuXG4gKiBAcGFyYW0gYW5ub3RhdGlvbkNvbHVtbnMgVGhlIGFycmF5IG9mIGNvbHVtbnMgY3JlYXRlZCBiYXNlZCBvbiBMaW5lSXRlbSBhbm5vdGF0aW9ucy5cbiAqIEBwYXJhbSBub25Tb3J0YWJsZUNvbHVtbnMgVGhlIGFycmF5IG9mIGFsbCBub24gc29ydGFibGUgY29sdW1uIG5hbWVzLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICogQHBhcmFtIHRhYmxlVHlwZSBUaGUgdGFibGUgdHlwZS5cbiAqIEBwYXJhbSB0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24gVGhlIGFycmF5IG9mIGNvbHVtbnMgZnJvbSBhIHByb3BlcnR5IHVzaW5nIGEgdGV4dCBhbm5vdGF0aW9uIHdpdGggdGV4dE9ubHkgYXMgdGV4dCBhcnJhbmdlbWVudC5cbiAqIEByZXR1cm5zIFRoZSBjb2x1bW4gZnJvbSB0aGUgZW50aXR5VHlwZVxuICovXG5leHBvcnQgY29uc3QgZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5Pixcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0YW5ub3RhdGlvbkNvbHVtbnM6IEFubm90YXRpb25UYWJsZUNvbHVtbltdID0gW10sXG5cdG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdXG4pOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSB7XG5cdGNvbnN0IHRhYmxlQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBhbm5vdGF0aW9uQ29sdW1ucztcblx0Ly8gQ2F0Y2ggYWxyZWFkeSBleGlzdGluZyBjb2x1bW5zIC0gd2hpY2ggd2VyZSBhZGRlZCBiZWZvcmUgYnkgTGluZUl0ZW0gQW5ub3RhdGlvbnNcblx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0ZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRcdC8vIENhdGNoIGFscmVhZHkgZXhpc3RpbmcgY29sdW1ucyAtIHdoaWNoIHdlcmUgYWRkZWQgYmVmb3JlIGJ5IExpbmVJdGVtIEFubm90YXRpb25zXG5cdFx0Y29uc3QgZXhpc3RzID0gYW5ub3RhdGlvbkNvbHVtbnMuc29tZSgoY29sdW1uKSA9PiB7XG5cdFx0XHRyZXR1cm4gY29sdW1uLm5hbWUgPT09IHByb3BlcnR5Lm5hbWU7XG5cdFx0fSk7XG5cblx0XHQvLyBpZiB0YXJnZXQgdHlwZSBleGlzdHMsIGl0IGlzIGEgY29tcGxleCBwcm9wZXJ0eSBhbmQgc2hvdWxkIGJlIGlnbm9yZWRcblx0XHRpZiAoIXByb3BlcnR5LnRhcmdldFR5cGUgJiYgIWV4aXN0cykge1xuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvOiBDb21wbGV4UHJvcGVydHlJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dGFibGVUeXBlXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvLnByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKTtcblx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Ly8gSW5jbHVkZSB0ZXh0IHByb3BlcnRpZXMgZm91bmQgZHVyaW5nIGFuYWx5c2lzIG9uIGdldENvbHVtbnNGcm9tQW5ub3RhdGlvbnNcblx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uLnB1c2goLi4ucmVsYXRlZFByb3BlcnRpZXNJbmZvLnRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBjb2x1bW5JbmZvID0gZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRub25Tb3J0YWJsZUNvbHVtbnMsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb25cblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IHNlbWFudGljS2V5cyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJDb21tb25cIiwgQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljS2V5LCBbXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdFx0XHRdKVswXTtcblx0XHRcdGNvbnN0IG9Db2x1bW5EcmFmdEluZGljYXRvciA9IGdldERlZmF1bHREcmFmdEluZGljYXRvckZvckNvbHVtbihjb2x1bW5JbmZvLm5hbWUsIHNlbWFudGljS2V5cywgZmFsc2UsIG51bGwpO1xuXHRcdFx0aWYgKE9iamVjdC5rZXlzKG9Db2x1bW5EcmFmdEluZGljYXRvcikubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0Li4ub0NvbHVtbkRyYWZ0SW5kaWNhdG9yXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVsYXRlZFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb2x1bW5JbmZvLnByb3BlcnR5SW5mb3MgPSByZWxhdGVkUHJvcGVydHlOYW1lcztcblx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHQuLi5jb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLFxuXHRcdFx0XHRcdHRlbXBsYXRlOiByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSxcblx0XHRcdFx0XHR3cmFwOiByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0U2V0dGluZ3NXcmFwcGluZ1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBfZ2V0RXhwb3J0RGF0YVR5cGUocHJvcGVydHkudHlwZSwgcmVsYXRlZFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMSk7XG5cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0TmFtZSkge1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudW5pdFByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lO1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudHlwZSA9IFwiQ3VycmVuY3lcIjsgLy8gRm9yY2UgdG8gYSBjdXJyZW5jeSBiZWNhdXNlIHRoZXJlJ3MgYSB1bml0UHJvcGVydHkgKG90aGVyd2lzZSB0aGUgdmFsdWUgaXNuJ3QgcHJvcGVybHkgZm9ybWF0dGVkIHdoZW4gZXhwb3J0ZWQpXG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXRTdHJpbmcpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnVuaXQgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdFN0cmluZztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lTmFtZSkge1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWU7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy51dGMgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmcpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnRpbWV6b25lID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlO1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDb2xsZWN0IGluZm9ybWF0aW9uIG9mIHJlbGF0ZWQgY29sdW1ucyB0byBiZSBjcmVhdGVkLlxuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29sdW1uc1RvQmVDcmVhdGVkW25hbWVdID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLnByb3BlcnRpZXNbbmFtZV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYWRkaXRpb25hbFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb2x1bW5JbmZvLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zID0gYWRkaXRpb25hbFByb3BlcnR5TmFtZXM7XG5cdFx0XHRcdC8vIENyZWF0ZSBjb2x1bW5zIGZvciBhZGRpdGlvbmFsIHByb3BlcnRpZXMgaWRlbnRpZmllZCBmb3IgQUxQIHVzZSBjYXNlLlxuXHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydHlOYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG5cdFx0XHRcdFx0Ly8gSW50ZW50aW9uYWwgb3ZlcndyaXRlIGFzIHdlIHJlcXVpcmUgb25seSBvbmUgbmV3IFByb3BlcnR5SW5mbyBmb3IgYSByZWxhdGVkIFByb3BlcnR5LlxuXHRcdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFtuYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5hZGRpdGlvbmFsUHJvcGVydGllc1tuYW1lXTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0YWJsZUNvbHVtbnMucHVzaChjb2x1bW5JbmZvKTtcblx0XHR9XG5cdFx0Ly8gSW4gY2FzZSBhIHByb3BlcnR5IGhhcyBkZWZpbmVkIGEgI1RleHRPbmx5IHRleHQgYXJyYW5nZW1lbnQgZG9uJ3Qgb25seSBjcmVhdGUgdGhlIGNvbXBsZXggcHJvcGVydHkgd2l0aCB0aGUgdGV4dCBwcm9wZXJ0eSBhcyBhIGNoaWxkIHByb3BlcnR5LFxuXHRcdC8vIGJ1dCBhbHNvIHRoZSBwcm9wZXJ0eSBpdHNlbGYgYXMgaXQgY2FuIGJlIHVzZWQgYXMgd2l0aGluIHRoZSBzb3J0Q29uZGl0aW9ucyBvciBvbiBjdXN0b20gY29sdW1ucy5cblx0XHQvLyBUaGlzIHN0ZXAgbXVzdCBiZSB2YWxpZGUgYWxzbyBmcm9tIHRoZSBjb2x1bW5zIGFkZGVkIHZpYSBMaW5lSXRlbXMgb3IgZnJvbSBhIGNvbHVtbiBhdmFpbGFibGUgb24gdGhlIHAxM24uXG5cdFx0aWYgKGdldERpc3BsYXlNb2RlKHByb3BlcnR5KSA9PT0gXCJEZXNjcmlwdGlvblwiKSB7XG5cdFx0XHRub25Tb3J0YWJsZUNvbHVtbnMgPSBub25Tb3J0YWJsZUNvbHVtbnMuY29uY2F0KHByb3BlcnR5Lm5hbWUpO1xuXHRcdFx0dGFibGVDb2x1bW5zLnB1c2goXG5cdFx0XHRcdGdldENvbHVtbkRlZmluaXRpb25Gcm9tUHJvcGVydHkoXG5cdFx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0cHJvcGVydHkubmFtZSxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRub25Tb3J0YWJsZUNvbHVtbnMsXG5cdFx0XHRcdFx0YWdncmVnYXRpb25IZWxwZXIsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRbXVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gQ3JlYXRlIGEgcHJvcGVydHlJbmZvIGZvciBlYWNoIHJlbGF0ZWQgcHJvcGVydHkuXG5cdGNvbnN0IHJlbGF0ZWRDb2x1bW5zID0gX2NyZWF0ZVJlbGF0ZWRDb2x1bW5zKFxuXHRcdGNvbHVtbnNUb0JlQ3JlYXRlZCxcblx0XHR0YWJsZUNvbHVtbnMsXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0ZW50aXR5VHlwZSxcblx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb25cblx0KTtcblxuXHRyZXR1cm4gdGFibGVDb2x1bW5zLmNvbmNhdChyZWxhdGVkQ29sdW1ucyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIGNvbHVtbiBkZWZpbml0aW9uIGZyb20gYSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgRW50aXR5IHR5cGUgcHJvcGVydHkgZm9yIHdoaWNoIHRoZSBjb2x1bW4gaXMgY3JlYXRlZFxuICogQHBhcmFtIGZ1bGxQcm9wZXJ0eVBhdGggVGhlIGZ1bGwgcGF0aCB0byB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIFRoZSByZWxhdGl2ZSBwYXRoIHRvIHRoZSB0YXJnZXQgcHJvcGVydHkgYmFzZWQgb24gdGhlIGNvbnRleHRcbiAqIEBwYXJhbSB1c2VEYXRhRmllbGRQcmVmaXggU2hvdWxkIGJlIHByZWZpeGVkIHdpdGggXCJEYXRhRmllbGQ6OlwiLCBlbHNlIGl0IHdpbGwgYmUgcHJlZml4ZWQgd2l0aCBcIlByb3BlcnR5OjpcIlxuICogQHBhcmFtIGF2YWlsYWJsZUZvckFkYXB0YXRpb24gRGVjaWRlcyB3aGV0aGVyIHRoZSBjb2x1bW4gc2hvdWxkIGJlIGF2YWlsYWJsZSBmb3IgYWRhcHRhdGlvblxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgYWxsIG5vbi1zb3J0YWJsZSBjb2x1bW4gbmFtZXNcbiAqIEBwYXJhbSBhZ2dyZWdhdGlvbkhlbHBlciBUaGUgYWdncmVnYXRpb25IZWxwZXIgZm9yIHRoZSBlbnRpdHlcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGFubm90YXRpb24gY29sdW1uIGRlZmluaXRpb25cbiAqL1xuY29uc3QgZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eSA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHk6IFByb3BlcnR5LFxuXHRmdWxsUHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdHJlbGF0aXZlUGF0aDogc3RyaW5nLFxuXHR1c2VEYXRhRmllbGRQcmVmaXg6IGJvb2xlYW4sXG5cdGF2YWlsYWJsZUZvckFkYXB0YXRpb246IGJvb2xlYW4sXG5cdG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10sXG5cdGFnZ3JlZ2F0aW9uSGVscGVyOiBBZ2dyZWdhdGlvbkhlbHBlcixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXVxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uIHtcblx0Y29uc3QgbmFtZSA9IHVzZURhdGFGaWVsZFByZWZpeCA/IHJlbGF0aXZlUGF0aCA6IGBQcm9wZXJ0eTo6JHtyZWxhdGl2ZVBhdGh9YDtcblx0Y29uc3Qga2V5ID0gKHVzZURhdGFGaWVsZFByZWZpeCA/IFwiRGF0YUZpZWxkOjpcIiA6IFwiUHJvcGVydHk6OlwiKSArIHJlcGxhY2VTcGVjaWFsQ2hhcnMocmVsYXRpdmVQYXRoKTtcblx0Y29uc3Qgc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCA9IGdldFNlbWFudGljT2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBwcm9wZXJ0eSk7XG5cdGNvbnN0IGlzSGlkZGVuID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZTtcblx0Y29uc3QgZ3JvdXBQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBwcm9wZXJ0eS5uYW1lID8gX3NsaWNlQXRTbGFzaChwcm9wZXJ0eS5uYW1lLCB0cnVlLCBmYWxzZSkgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IGlzR3JvdXA6IGJvb2xlYW4gPSBncm91cFBhdGggIT0gcHJvcGVydHkubmFtZTtcblx0Y29uc3QgZXhwb3J0VHlwZTogc3RyaW5nID0gX2dldEV4cG9ydERhdGFUeXBlKHByb3BlcnR5LnR5cGUpO1xuXHRjb25zdCBzRGF0ZUlucHV0Rm9ybWF0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBwcm9wZXJ0eS50eXBlID09PSBcIkVkbS5EYXRlXCIgPyBcIllZWVktTU0tRERcIiA6IHVuZGVmaW5lZDtcblx0Y29uc3QgZGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldERhdGFGaWVsZERhdGFUeXBlKHByb3BlcnR5KTtcblx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eSwgZGF0YVR5cGUpO1xuXHRjb25zdCBzZW1hbnRpY0tleXM6IFNlbWFudGljS2V5ID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkNvbW1vblwiLCBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNLZXksIFtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRdKVswXTtcblx0Y29uc3QgaXNBUHJvcGVydHlGcm9tVGV4dE9ubHlBbm5vdGF0aW9uID1cblx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24gJiYgdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uLmluZGV4T2YocmVsYXRpdmVQYXRoKSA+PSAwO1xuXHRjb25zdCBzb3J0YWJsZSA9ICghaXNIaWRkZW4gfHwgaXNBUHJvcGVydHlGcm9tVGV4dE9ubHlBbm5vdGF0aW9uKSAmJiBub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihyZWxhdGl2ZVBhdGgpID09PSAtMTtcblx0Y29uc3QgdHlwZUNvbmZpZyA9IHtcblx0XHRjbGFzc05hbWU6IHByb3BlcnR5LnR5cGUgfHwgZGF0YVR5cGUsXG5cdFx0Zm9ybWF0T3B0aW9uczogcHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMsXG5cdFx0Y29uc3RyYWludHM6IHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50c1xuXHR9O1xuXHRsZXQgZXhwb3J0U2V0dGluZ3M6IGNvbHVtbkV4cG9ydFNldHRpbmdzIHwgbnVsbCA9IG51bGw7XG5cdGlmIChfaXNFeHBvcnRhYmxlQ29sdW1uKHByb3BlcnR5KSkge1xuXHRcdGNvbnN0IHVuaXRQcm9wZXJ0eSA9IGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5KHByb3BlcnR5KSB8fCBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRjb25zdCB0aW1lem9uZVByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkocHJvcGVydHkpO1xuXHRcdGNvbnN0IHVuaXRUZXh0ID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSB8fCBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ7XG5cdFx0Y29uc3QgdGltZXpvbmVUZXh0ID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cblx0XHRleHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdHR5cGU6IGV4cG9ydFR5cGUsXG5cdFx0XHRpbnB1dEZvcm1hdDogc0RhdGVJbnB1dEZvcm1hdCxcblx0XHRcdHNjYWxlOiBwcm9wZXJ0eS5zY2FsZSxcblx0XHRcdGRlbGltaXRlcjogcHJvcGVydHkudHlwZSA9PT0gXCJFZG0uSW50NjRcIlxuXHRcdH07XG5cblx0XHRpZiAodW5pdFByb3BlcnR5KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy51bml0UHJvcGVydHkgPSB1bml0UHJvcGVydHkubmFtZTtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdH0gZWxzZSBpZiAodW5pdFRleHQpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnVuaXQgPSBgJHt1bml0VGV4dH1gO1xuXHRcdH1cblx0XHRpZiAodGltZXpvbmVQcm9wZXJ0eSkge1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IHRpbWV6b25lUHJvcGVydHkubmFtZTtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnV0YyA9IGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAodGltZXpvbmVUZXh0KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy50aW1lem9uZSA9IHRpbWV6b25lVGV4dC50b1N0cmluZygpO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVsczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSBfZ2V0Q29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzKHJlbGF0aXZlUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cblx0Y29uc3QgY29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4gPSB7XG5cdFx0a2V5OiBrZXksXG5cdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdGxhYmVsOiBnZXRMYWJlbChwcm9wZXJ0eSwgaXNHcm91cCksXG5cdFx0Z3JvdXBMYWJlbDogaXNHcm91cCA/IGdldExhYmVsKHByb3BlcnR5KSA6IHVuZGVmaW5lZCxcblx0XHRncm91cDogaXNHcm91cCA/IGdyb3VwUGF0aCA6IHVuZGVmaW5lZCxcblx0XHRhbm5vdGF0aW9uUGF0aDogZnVsbFByb3BlcnR5UGF0aCxcblx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGgsXG5cdFx0YXZhaWxhYmlsaXR5OiAhYXZhaWxhYmxlRm9yQWRhcHRhdGlvbiB8fCBpc0hpZGRlbiA/IFwiSGlkZGVuXCIgOiBcIkFkYXB0YXRpb25cIixcblx0XHRuYW1lOiBuYW1lLFxuXHRcdHJlbGF0aXZlUGF0aDogcmVsYXRpdmVQYXRoLFxuXHRcdHNvcnRhYmxlOiBzb3J0YWJsZSxcblx0XHRpc0dyb3VwYWJsZTogYWdncmVnYXRpb25IZWxwZXIuaXNBbmFseXRpY3NTdXBwb3J0ZWQoKSA/ICEhYWdncmVnYXRpb25IZWxwZXIuaXNQcm9wZXJ0eUdyb3VwYWJsZShwcm9wZXJ0eSkgOiBzb3J0YWJsZSxcblx0XHRpc0tleTogcHJvcGVydHkuaXNLZXksXG5cdFx0ZXhwb3J0U2V0dGluZ3M6IGV4cG9ydFNldHRpbmdzLFxuXHRcdGNhc2VTZW5zaXRpdmU6IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHR0eXBlQ29uZmlnOiB0eXBlQ29uZmlnIGFzIFByb3BlcnR5VHlwZUNvbmZpZyxcblx0XHRpbXBvcnRhbmNlOiBnZXRJbXBvcnRhbmNlKHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCwgc2VtYW50aWNLZXlzKSxcblx0XHRhZGRpdGlvbmFsTGFiZWxzOiBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHNcblx0fTtcblx0Y29uc3Qgc1Rvb2x0aXAgPSBfZ2V0VG9vbHRpcChwcm9wZXJ0eSk7XG5cdGlmIChzVG9vbHRpcCkge1xuXHRcdGNvbHVtbi50b29sdGlwID0gc1Rvb2x0aXA7XG5cdH1cblx0Y29uc3QgdGFyZ2V0VmFsdWVmcm9tRFAgPSBnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50KHByb3BlcnR5KTtcblx0aWYgKGlzRGF0YVBvaW50RnJvbURhdGFGaWVsZERlZmF1bHQocHJvcGVydHkpICYmIHR5cGVvZiB0YXJnZXRWYWx1ZWZyb21EUCA9PT0gXCJzdHJpbmdcIiAmJiBjb2x1bW4uZXhwb3J0U2V0dGluZ3MpIHtcblx0XHRjb2x1bW4uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgPSB0YXJnZXRWYWx1ZWZyb21EUDtcblx0XHRjb2x1bW4uZXhwb3J0U2V0dGluZ3MudGVtcGxhdGUgPSBcInswfS9cIiArIHRhcmdldFZhbHVlZnJvbURQO1xuXHR9XG5cdHJldHVybiBjb2x1bW47XG59O1xuXG4vKipcbiAqIFJldHVybnMgQm9vbGVhbiB0cnVlIGZvciBleHBvcnRhYmxlIGNvbHVtbnMsIGZhbHNlIGZvciBub24gZXhwb3J0YWJsZSBjb2x1bW5zLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgVGhlIGRhdGFGaWVsZCBvciBwcm9wZXJ0eSB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFRydWUgZm9yIGV4cG9ydGFibGUgY29sdW1uLCBmYWxzZSBmb3Igbm9uIGV4cG9ydGFibGUgY29sdW1uXG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIF9pc0V4cG9ydGFibGVDb2x1bW4oc291cmNlOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkpOiBib29sZWFuIHtcblx0bGV0IHByb3BlcnR5VHlwZSwgcHJvcGVydHk7XG5cdGNvbnN0IGRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eSA9IChzb3VyY2UgYXMgUHJvcGVydHkpLmFubm90YXRpb25zLlVJPy5EYXRhRmllbGREZWZhdWx0O1xuXHRpZiAoaXNQcm9wZXJ0eShzb3VyY2UpICYmIGRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eT8uJFR5cGUpIHtcblx0XHRpZiAoaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5KSA9PT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRwcm9wZXJ0eVR5cGUgPSBkYXRhRmllbGREZWZhdWx0UHJvcGVydHk/LiRUeXBlO1xuXHR9IGVsc2UgaWYgKGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKHNvdXJjZSBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRwcm9wZXJ0eSA9IHNvdXJjZSBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzO1xuXHRcdHByb3BlcnR5VHlwZSA9IHByb3BlcnR5LiRUeXBlO1xuXHRcdGlmIChwcm9wZXJ0eVR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiYgKHByb3BlcnR5IGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pLlRhcmdldD8uJHRhcmdldD8uJFR5cGUpIHtcblx0XHRcdC8vRm9yIENoYXJ0XG5cdFx0XHRwcm9wZXJ0eVR5cGUgPSAocHJvcGVydHkgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZTtcblx0XHRcdHJldHVybiBVSUFubm90YXRpb25UeXBlcy5DaGFydERlZmluaXRpb25UeXBlLmluZGV4T2YocHJvcGVydHlUeXBlKSA9PT0gLTE7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdChwcm9wZXJ0eSBhcyBEYXRhRmllbGQpLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uTWVkaWFUeXBlPy50ZXJtID09PSBcIk9yZy5PRGF0YS5Db3JlLlYxLk1lZGlhVHlwZVwiICYmXG5cdFx0XHQocHJvcGVydHkgYXMgRGF0YUZpZWxkKS5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/LmlzVVJMICE9PSB0cnVlXG5cdFx0KSB7XG5cdFx0XHQvL0ZvciBTdHJlYW1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHByb3BlcnR5VHlwZVxuXHRcdD8gW1xuXHRcdFx0XHRVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0VUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uR3JvdXBcblx0XHQgIF0uaW5kZXhPZihwcm9wZXJ0eVR5cGUpID09PSAtMVxuXHRcdDogdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIEJvb2xlYW4gdHJ1ZSBmb3IgdmFsaWQgY29sdW1ucywgZmFsc2UgZm9yIGludmFsaWQgY29sdW1ucy5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERpZmZlcmVudCBEYXRhRmllbGQgdHlwZXMgZGVmaW5lZCBpbiB0aGUgYW5ub3RhdGlvbnNcbiAqIEByZXR1cm5zIFRydWUgZm9yIHZhbGlkIGNvbHVtbnMsIGZhbHNlIGZvciBpbnZhbGlkIGNvbHVtbnNcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9pc1ZhbGlkQ29sdW1uID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykge1xuXHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0cmV0dXJuICEhZGF0YUZpZWxkLklubGluZTtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRkZWZhdWx0OlxuXHRcdC8vIFRvZG86IFJlcGxhY2Ugd2l0aCBwcm9wZXIgTG9nIHN0YXRlbWVudCBvbmNlIGF2YWlsYWJsZVxuXHRcdC8vICB0aHJvdyBuZXcgRXJyb3IoXCJVbmhhbmRsZWQgRGF0YUZpZWxkIEFic3RyYWN0IHR5cGU6IFwiICsgZGF0YUZpZWxkLiRUeXBlKTtcblx0fVxufTtcbi8qKlxuICogUmV0dXJucyB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uLlxuICpcbiAqIFNBUCBGaW9yaSBlbGVtZW50cyB3aWxsIGV2YWx1YXRlIGVpdGhlciB0aGUgVUkuSGlkZGVuIGFubm90YXRpb24gZGVmaW5lZCBvbiB0aGUgYW5ub3RhdGlvbiBpdHNlbGYgb3Igb24gdGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkTW9kZWxQYXRoIFRoZSBtZXRhcGF0aCByZWZlcnJpbmcgdG8gdGhlIGFubm90YXRpb24gdGhhdCBpcyBldmFsdWF0ZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiB0aGF0IHlvdSBjYW4gYmluZCB0byB0aGUgVUkuXG4gKi9cbmV4cG9ydCBjb25zdCBfZ2V0VmlzaWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAoZGF0YUZpZWxkTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgdGFyZ2V0T2JqZWN0OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgRGF0YVBvaW50VHlwZVR5cGVzID0gZGF0YUZpZWxkTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0bGV0IHByb3BlcnR5VmFsdWU7XG5cdGlmICh0YXJnZXRPYmplY3QpIHtcblx0XHRzd2l0Y2ggKHRhcmdldE9iamVjdC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHRhcmdldE9iamVjdC5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0Ly8gaWYgaXQgaXMgYSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHBvaW50aW5nIHRvIGEgRGF0YVBvaW50IHdlIGxvb2sgYXQgdGhlIGRhdGFQb2ludCdzIHZhbHVlXG5cdFx0XHRcdGlmICh0YXJnZXRPYmplY3Q/LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0Py5WYWx1ZS4kdGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdC8vIEZJWE1FIFByb3ZlIG1lIHdyb25nIHRoYXQgdGhpcyBpcyB1c2VsZXNzXG5cdGNvbnN0IGlzQW5hbHl0aWNhbEdyb3VwSGVhZGVyRXhwYW5kZWQgPSAvKmZvcm1hdE9wdGlvbnM/LmlzQW5hbHl0aWNzID8gVUkuSXNFeHBhbmRlZCA6Ki8gY29uc3RhbnQoZmFsc2UpO1xuXHRjb25zdCBpc0FuYWx5dGljYWxMZWFmID0gLypmb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/IGVxdWFsKFVJLk5vZGVMZXZlbCwgMCkgOiovIGNvbnN0YW50KGZhbHNlKTtcblxuXHQvLyBBIGRhdGEgZmllbGQgaXMgdmlzaWJsZSBpZjpcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIG9yaWdpbmFsIGFubm90YXRpb24gZG9lcyBub3QgZXZhbHVhdGUgdG8gJ3RydWUnXG5cdC8vIC0gdGhlIFVJLkhpZGRlbiBleHByZXNzaW9uIGluIHRoZSB0YXJnZXQgcHJvcGVydHkgZG9lcyBub3QgZXZhbHVhdGUgdG8gJ3RydWUnXG5cdC8vIC0gaW4gY2FzZSBvZiBBbmFseXRpY3MgaXQncyBub3QgdmlzaWJsZSBmb3IgYW4gZXhwYW5kZWQgR3JvdXBIZWFkZXJcblx0cmV0dXJuIGFuZChcblx0XHQuLi5bXG5cdFx0XHRub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdCEhcHJvcGVydHlWYWx1ZSxcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSAmJiBub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdHRydWVcblx0XHRcdCksXG5cdFx0XHRvcihub3QoaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCksIGlzQW5hbHl0aWNhbExlYWYpXG5cdFx0XVxuXHQpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGhpZGRlbiBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciBhIGZpZWxkIGdyb3VwLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRHcm91cCBEYXRhRmllbGQgZGVmaW5lZCBpbiB0aGUgYW5ub3RhdGlvbnNcbiAqIEByZXR1cm5zIENvbXBpbGUgYmluZGluZyBvZiBmaWVsZCBncm91cCBleHByZXNzaW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9nZXRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgPSBmdW5jdGlvbiAoZGF0YUZpZWxkR3JvdXA6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGVcblx0KSB7XG5cdFx0aWYgKGRhdGFGaWVsZEdyb3VwPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkR3JvdXAuYW5ub3RhdGlvbnMuVUkuSGlkZGVuKSwgdHJ1ZSkpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0LiR0YXJnZXQuRGF0YT8uZm9yRWFjaCgoaW5uZXJEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMpID0+IHtcblx0XHRcdFx0ZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zLnB1c2goX2dldFZpc2libGVFeHByZXNzaW9uKHsgdGFyZ2V0T2JqZWN0OiBpbm5lckRhdGFGaWVsZCB9IGFzIERhdGFNb2RlbE9iamVjdFBhdGgpKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShvciguLi5maWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMpLCBjb25zdGFudCh0cnVlKSwgY29uc3RhbnQoZmFsc2UpKSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFiZWwgZm9yIHRoZSBwcm9wZXJ0eSBhbmQgZGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBbcHJvcGVydHldIFByb3BlcnR5LCBEYXRhRmllbGQgb3IgTmF2aWdhdGlvbiBQcm9wZXJ0eSBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGlzR3JvdXBcbiAqIEByZXR1cm5zIExhYmVsIG9mIHRoZSBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGdldExhYmVsID0gZnVuY3Rpb24gKHByb3BlcnR5OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHksIGlzR3JvdXAgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghcHJvcGVydHkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChpc1Byb3BlcnR5KHByb3BlcnR5KSB8fCBpc05hdmlnYXRpb25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcblx0XHRjb25zdCBkYXRhRmllbGREZWZhdWx0ID0gKHByb3BlcnR5IGFzIFByb3BlcnR5KS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdFx0aWYgKGRhdGFGaWVsZERlZmF1bHQgJiYgIWRhdGFGaWVsZERlZmF1bHQucXVhbGlmaWVyICYmIGRhdGFGaWVsZERlZmF1bHQuTGFiZWw/LnZhbHVlT2YoKSkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGREZWZhdWx0LkxhYmVsPy52YWx1ZU9mKCkpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsPy52YWx1ZU9mKCkgfHwgcHJvcGVydHkubmFtZSkpO1xuXHR9IGVsc2UgaWYgKGlzRGF0YUZpZWxkVHlwZXMocHJvcGVydHkpKSB7XG5cdFx0aWYgKCEhaXNHcm91cCAmJiBwcm9wZXJ0eS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0cHJvcGVydHkuTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8ubmFtZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSBpZiAocHJvcGVydHkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdHByb3BlcnR5LkxhYmVsPy52YWx1ZU9mKCkgfHwgKHByb3BlcnR5LlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdH1cbn07XG5cbmNvbnN0IF9nZXRUb29sdGlwID0gZnVuY3Rpb24gKHNvdXJjZTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFzb3VyY2UpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKGlzUHJvcGVydHkoc291cmNlKSB8fCBzb3VyY2UuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUXVpY2tJbmZvKSB7XG5cdFx0cmV0dXJuIHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5hbm5vdGF0aW9ucy5Db21tb24uUXVpY2tJbmZvLnZhbHVlT2YoKSkpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChpc0RhdGFGaWVsZFR5cGVzKHNvdXJjZSkpIHtcblx0XHRyZXR1cm4gc291cmNlLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNvdXJjZS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdGNvbnN0IGRhdGFwb2ludFRhcmdldCA9IHNvdXJjZS5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50O1xuXHRcdHJldHVybiBkYXRhcG9pbnRUYXJnZXQ/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFwb2ludFRhcmdldC5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3dTdGF0dXNWaXNpYmlsaXR5KGNvbE5hbWU6IHN0cmluZywgaXNTZW1hbnRpY0tleUluRmllbGRHcm91cD86IEJvb2xlYW4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gZm9ybWF0UmVzdWx0KFxuXHRcdFtcblx0XHRcdHBhdGhJbk1vZGVsKGBzZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdHBhdGhJbk1vZGVsKGBmaWx0ZXJlZE1lc3NhZ2VzYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdGNvbE5hbWUsXG5cdFx0XHRpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwXG5cdFx0XSxcblx0XHR0YWJsZUZvcm1hdHRlcnMuZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlclxuXHQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eUluZm8gZm9yIGVhY2ggaWRlbnRpZmllZCBwcm9wZXJ0eSBjb25zdW1lZCBieSBhIExpbmVJdGVtLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zVG9CZUNyZWF0ZWQgSWRlbnRpZmllZCBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIGV4aXN0aW5nQ29sdW1ucyBUaGUgbGlzdCBvZiBjb2x1bW5zIGNyZWF0ZWQgZm9yIExpbmVJdGVtcyBhbmQgUHJvcGVydGllcyBvZiBlbnRpdHlUeXBlLlxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1uIG5hbWVzIHdoaWNoIGNhbm5vdCBiZSBzb3J0ZWQuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgZm9yIHRoZSBMaW5lSXRlbVxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGFycmF5IG9mIGNvbHVtbnMgY3JlYXRlZC5cbiAqL1xuY29uc3QgX2NyZWF0ZVJlbGF0ZWRDb2x1bW5zID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5Pixcblx0ZXhpc3RpbmdDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXVxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXTtcblx0Y29uc3QgcmVsYXRlZFByb3BlcnR5TmFtZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRPYmplY3Qua2V5cyhjb2x1bW5zVG9CZUNyZWF0ZWQpLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IGNvbHVtbnNUb0JlQ3JlYXRlZFtuYW1lXSxcblx0XHRcdGFubm90YXRpb25QYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKG5hbWUpLFxuXHRcdFx0Ly8gQ2hlY2sgd2hldGhlciB0aGUgcmVsYXRlZCBjb2x1bW4gYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5hbWUpO1xuXHRcdGlmIChyZWxhdGVkQ29sdW1uID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENhc2UgMTogS2V5IGNvbnRhaW5zIERhdGFGaWVsZCBwcmVmaXggdG8gZW5zdXJlIGFsbCBwcm9wZXJ0eSBjb2x1bW5zIGhhdmUgdGhlIHNhbWUga2V5IGZvcm1hdC5cblx0XHRcdC8vIE5ldyBjcmVhdGVkIHByb3BlcnR5IGNvbHVtbiBpcyBzZXQgdG8gaGlkZGVuLlxuXHRcdFx0Y29uc3QgY29sdW1uID0gZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRuYW1lLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRhZ2dyZWdhdGlvbkhlbHBlcixcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHQpO1xuXHRcdFx0Y29sdW1uLmlzUGFydE9mTGluZUl0ZW0gPSBleGlzdGluZ0NvbHVtbnMuc29tZShcblx0XHRcdFx0KGV4aXN0aW5nQ29sdW1uKSA9PiBleGlzdGluZ0NvbHVtbi5wcm9wZXJ0eUluZm9zPy5pbmNsdWRlcyhuYW1lKSAmJiBleGlzdGluZ0NvbHVtbi5pc1BhcnRPZkxpbmVJdGVtXG5cdFx0XHQpO1xuXHRcdFx0cmVsYXRlZENvbHVtbnMucHVzaChjb2x1bW4pO1xuXHRcdH0gZWxzZSBpZiAocmVsYXRlZENvbHVtbi5hbm5vdGF0aW9uUGF0aCAhPT0gYW5ub3RhdGlvblBhdGggfHwgcmVsYXRlZENvbHVtbi5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHQvLyBDYXNlIDI6IFRoZSBleGlzdGluZyBjb2x1bW4gcG9pbnRzIHRvIGEgTGluZUl0ZW0gKG9yKVxuXHRcdFx0Ly8gQ2FzZSAzOiBUaGlzIGlzIGEgc2VsZiByZWZlcmVuY2UgZnJvbSBhbiBleGlzdGluZyBjb2x1bW5cblxuXHRcdFx0Y29uc3QgbmV3TmFtZSA9IGBQcm9wZXJ0eTo6JHtuYW1lfWA7XG5cblx0XHRcdC8vIENoZWNraW5nIHdoZXRoZXIgdGhlIHJlbGF0ZWQgcHJvcGVydHkgY29sdW1uIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZCBpbiBhIHByZXZpb3VzIGl0ZXJhdGlvbi5cblx0XHRcdGlmICghZXhpc3RpbmdDb2x1bW5zLnNvbWUoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5ld05hbWUpKSB7XG5cdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBwcm9wZXJ0eSBjb2x1bW4gd2l0aCAnUHJvcGVydHk6OicgcHJlZml4LFxuXHRcdFx0XHQvLyBTZXQgaXQgdG8gaGlkZGVuIGFzIGl0IGlzIG9ubHkgY29uc3VtZWQgYnkgQ29tcGxleCBwcm9wZXJ0eSBpbmZvcy5cblx0XHRcdFx0Y29uc3QgY29sdW1uID0gZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRcdFx0XHRhZ2dyZWdhdGlvbkhlbHBlcixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb2x1bW4uaXNQYXJ0T2ZMaW5lSXRlbSA9IHJlbGF0ZWRDb2x1bW4uaXNQYXJ0T2ZMaW5lSXRlbTtcblx0XHRcdFx0cmVsYXRlZENvbHVtbnMucHVzaChjb2x1bW4pO1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lTWFwW25hbWVdID0gbmV3TmFtZTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdGV4aXN0aW5nQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IGNvbHVtbi5uYW1lID09PSBuZXdOYW1lKSAmJlxuXHRcdFx0XHRleGlzdGluZ0NvbHVtbnMuc29tZSgoY29sdW1uKSA9PiBjb2x1bW4ucHJvcGVydHlJbmZvcz8uaW5jbHVkZXMobmFtZSkpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmVsYXRlZFByb3BlcnR5TmFtZU1hcFtuYW1lXSA9IG5ld05hbWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBUaGUgcHJvcGVydHkgJ25hbWUnIGhhcyBiZWVuIHByZWZpeGVkIHdpdGggJ1Byb3BlcnR5OjonIGZvciB1bmlxdWVuZXNzLlxuXHQvLyBVcGRhdGUgdGhlIHNhbWUgaW4gb3RoZXIgcHJvcGVydHlJbmZvc1tdIHJlZmVyZW5jZXMgd2hpY2ggcG9pbnQgdG8gdGhpcyBwcm9wZXJ0eS5cblx0ZXhpc3RpbmdDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuXHRcdGNvbHVtbi5wcm9wZXJ0eUluZm9zID0gY29sdW1uLnByb3BlcnR5SW5mb3M/Lm1hcCgocHJvcGVydHlJbmZvKSA9PiByZWxhdGVkUHJvcGVydHlOYW1lTWFwW3Byb3BlcnR5SW5mb10gPz8gcHJvcGVydHlJbmZvKTtcblx0XHRjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MgPSBjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3M/Lm1hcChcblx0XHRcdChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcHJvcGVydHlJbmZvXSA/PyBwcm9wZXJ0eUluZm9cblx0XHQpO1xuXHR9KTtcblxuXHRyZXR1cm4gcmVsYXRlZENvbHVtbnM7XG59O1xuXG4vKipcbiAqIEdldHRpbmcgdGhlIENvbHVtbiBOYW1lXG4gKiBJZiBpdCBwb2ludHMgdG8gYSBEYXRhRmllbGQgd2l0aCBvbmUgcHJvcGVydHkgb3IgRGF0YVBvaW50IHdpdGggb25lIHByb3BlcnR5LCBpdCB3aWxsIHVzZSB0aGUgcHJvcGVydHkgbmFtZVxuICogaGVyZSB0byBiZSBjb25zaXN0ZW50IHdpdGggdGhlIGV4aXN0aW5nIGZsZXggY2hhbmdlcy5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERpZmZlcmVudCBEYXRhRmllbGQgdHlwZXMgZGVmaW5lZCBpbiB0aGUgYW5ub3RhdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIGFubm90YXRpb24gY29sdW1uc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2dldEFubm90YXRpb25Db2x1bW5OYW1lID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykge1xuXHQvLyBUaGlzIGlzIG5lZWRlZCBhcyB3ZSBoYXZlIGZsZXhpYmlsaXR5IGNoYW5nZXMgYWxyZWFkeSB0aGF0IHdlIGhhdmUgdG8gY2hlY2sgYWdhaW5zdFxuXHRpZiAoaXNEYXRhRmllbGRUeXBlcyhkYXRhRmllbGQpKSB7XG5cdFx0cmV0dXJuIGRhdGFGaWVsZC5WYWx1ZT8ucGF0aDtcblx0fSBlbHNlIGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiYgKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmFsdWU/LnBhdGgpIHtcblx0XHQvLyBUaGlzIGlzIGZvciByZW1vdmluZyBkdXBsaWNhdGUgcHJvcGVydGllcy4gRm9yIGV4YW1wbGUsICdQcm9ncmVzcycgUHJvcGVydHkgaXMgcmVtb3ZlZCBpZiBpdCBpcyBhbHJlYWR5IGRlZmluZWQgYXMgYSBEYXRhUG9pbnRcblx0XHRyZXR1cm4gKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmFsdWUucGF0aDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHR9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eUluZm8gZm9yIHRoZSBpZGVudGlmaWVkIGFkZGl0aW9uYWwgcHJvcGVydHkgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG4gKlxuICogRm9yIGUuZy4gSWYgVUkuSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5LCBpbmNsdWRlIHRoaXMgdGVjaG5pY2FsIHByb3BlcnR5IGluIHRoZSBhZGRpdGlvbmFsUHJvcGVydGllcyBvZiBDb21wbGV4UHJvcGVydHlJbmZvIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSBjb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgTGluZUl0ZW1zIGFuZCBQcm9wZXJ0aWVzIG9mIGVudGl0eVR5cGUgZnJvbSB0aGUgdGFibGUgdmlzdWFsaXphdGlvbi5cbiAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eUluZm8gb2YgdGhlIHRlY2huaWNhbCBwcm9wZXJ0eSB0byBiZSBhZGRlZCB0byB0aGUgbGlzdCBvZiBjb2x1bW5zLlxuICogQHByaXZhdGVcbiAqL1xuXG5jb25zdCBjcmVhdGVUZWNobmljYWxQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lOiBzdHJpbmcsIGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sIHJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG5cdGNvbnN0IGtleSA9IGBQcm9wZXJ0eV9UZWNobmljYWw6OiR7bmFtZX1gO1xuXHQvLyBWYWxpZGF0ZSBpZiB0aGUgdGVjaG5pY2FsIHByb3BlcnR5IGhhc24ndCB5ZXQgYmVlbiBjcmVhdGVkIG9uIHByZXZpb3VzIGl0ZXJhdGlvbnMuXG5cdGNvbnN0IGNvbHVtbkV4aXN0cyA9IGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ua2V5ID09PSBrZXkpO1xuXHQvLyBSZXRyaWV2ZSB0aGUgc2ltcGxlIHByb3BlcnR5IHVzZWQgYnkgdGhlIGhpZGRlbiBhbm5vdGF0aW9uLCBpdCB3aWxsIGJlIHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgbWFuZGF0b3J5IGF0dHJpYnV0ZXMgb2YgbmV3bHkgY3JlYXRlZCB0ZWNobmljYWwgcHJvcGVydHkuIEZvciBlLmcuIHJlbGF0aXZlUGF0aFxuXHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPVxuXHRcdCFjb2x1bW5FeGlzdHMgJiYgKGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmFtZSAmJiAhY29sdW1uLnByb3BlcnR5SW5mb3MpIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbikhO1xuXHRpZiAoYWRkaXRpb25hbFByb3BlcnR5KSB7XG5cdFx0Y29uc3QgdGVjaG5pY2FsQ29sdW1uOiBUZWNobmljYWxDb2x1bW4gPSB7XG5cdFx0XHRrZXk6IGtleSxcblx0XHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRcdGxhYmVsOiBhZGRpdGlvbmFsUHJvcGVydHkubGFiZWwsXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogYWRkaXRpb25hbFByb3BlcnR5LmFubm90YXRpb25QYXRoLFxuXHRcdFx0YXZhaWxhYmlsaXR5OiBcIkhpZGRlblwiLFxuXHRcdFx0bmFtZToga2V5LFxuXHRcdFx0cmVsYXRpdmVQYXRoOiBhZGRpdGlvbmFsUHJvcGVydHkucmVsYXRpdmVQYXRoLFxuXHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0aXNHcm91cGFibGU6IGZhbHNlLFxuXHRcdFx0aXNLZXk6IGZhbHNlLFxuXHRcdFx0ZXhwb3J0U2V0dGluZ3M6IG51bGwsXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBmYWxzZSxcblx0XHRcdGFnZ3JlZ2F0YWJsZTogZmFsc2UsXG5cdFx0XHRleHRlbnNpb246IHtcblx0XHRcdFx0dGVjaG5pY2FsbHlHcm91cGFibGU6IHRydWUsXG5cdFx0XHRcdHRlY2huaWNhbGx5QWdncmVnYXRhYmxlOiB0cnVlXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb2x1bW5zLnB1c2godGVjaG5pY2FsQ29sdW1uKTtcblx0XHRyZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcFtuYW1lXSA9IHRlY2huaWNhbENvbHVtbi5uYW1lO1xuXHR9XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGRhdGEgZmllbGQgbGFiZWxzIGhhdmUgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gZmllbGRHcm91cE5hbWUgVGhlIGBEYXRhRmllbGRgIG5hbWUgYmVpbmcgcHJvY2Vzc2VkLlxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgYHNob3dEYXRhRmllbGRzTGFiZWxgIHZhbHVlIGZyb20gdGhlIG1hbmlmZXN0XG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbCA9IGZ1bmN0aW9uIChmaWVsZEdyb3VwTmFtZTogc3RyaW5nLCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IG9Db2x1bW5zID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKT8uY29sdW1ucztcblx0Y29uc3QgYUNvbHVtbktleXMgPSBvQ29sdW1ucyAmJiBPYmplY3Qua2V5cyhvQ29sdW1ucyk7XG5cdHJldHVybiAoXG5cdFx0YUNvbHVtbktleXMgJiZcblx0XHQhIWFDb2x1bW5LZXlzLmZpbmQoZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4ga2V5ID09PSBmaWVsZEdyb3VwTmFtZSAmJiBvQ29sdW1uc1trZXldLnNob3dEYXRhRmllbGRzTGFiZWw7XG5cdFx0fSlcblx0KTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgd2l0aCByZXNwZWN0IHRvIHRoZSByb290IGVudGl0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBgRGF0YUZpZWxkYCBiZWluZyBwcm9jZXNzZWQuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgcGF0aFxuICovXG5jb25zdCBfZ2V0UmVsYXRpdmVQYXRoID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IHN0cmluZyB7XG5cdGxldCByZWxhdGl2ZVBhdGggPSBcIlwiO1xuXG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZCk/LlZhbHVlPy5wYXRoO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBkYXRhRmllbGQ/LlRhcmdldD8udmFsdWU7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uR3JvdXA6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uR3JvdXA6XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiByZWxhdGl2ZVBhdGg7XG59O1xuXG5jb25zdCBfc2xpY2VBdFNsYXNoID0gZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgaXNMYXN0U2xhc2g6IGJvb2xlYW4sIGlzTGFzdFBhcnQ6IGJvb2xlYW4pIHtcblx0Y29uc3QgaVNsYXNoSW5kZXggPSBpc0xhc3RTbGFzaCA/IHBhdGgubGFzdEluZGV4T2YoXCIvXCIpIDogcGF0aC5pbmRleE9mKFwiL1wiKTtcblxuXHRpZiAoaVNsYXNoSW5kZXggPT09IC0xKSB7XG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblx0cmV0dXJuIGlzTGFzdFBhcnQgPyBwYXRoLnN1YnN0cmluZyhpU2xhc2hJbmRleCArIDEsIHBhdGgubGVuZ3RoKSA6IHBhdGguc3Vic3RyaW5nKDAsIGlTbGFzaEluZGV4KTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgY29sdW1uIGNvbnRhaW5zIGEgbXVsdGktdmFsdWUgZmllbGQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBEYXRhRmllbGQgY29ycmVzcG9uZHMgdG8gYSBtdWx0aS12YWx1ZSBmaWVsZC5cbiAqL1xuY29uc3QgX2lzQ29sdW1uTXVsdGlWYWx1ZWQgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGlmIChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkgJiYgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oZGF0YUZpZWxkLlZhbHVlKSkge1xuXHRcdGNvbnN0IHByb3BlcnR5T2JqZWN0UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCBkYXRhRmllbGQuVmFsdWUucGF0aCk7XG5cdFx0cmV0dXJuIGlzTXVsdGlWYWx1ZUZpZWxkKHByb3BlcnR5T2JqZWN0UGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGV0aGVyIGEgY29sdW1uIGlzIHNvcnRhYmxlLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGRhdGEgZmllbGQgYmVpbmcgcHJvY2Vzc2VkXG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIENvbGxlY3Rpb24gb2Ygbm9uLXNvcnRhYmxlIGNvbHVtbiBuYW1lcyBhcyBwZXIgYW5ub3RhdGlvblxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29sdW1uIGlzIHNvcnRhYmxlXG4gKi9cbmNvbnN0IF9pc0NvbHVtblNvcnRhYmxlID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgcHJvcGVydHlQYXRoOiBzdHJpbmcsIG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10pOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihwcm9wZXJ0eVBhdGgpID09PSAtMSAmJiAvLyBDb2x1bW4gaXMgbm90IG1hcmtlZCBhcyBub24tc29ydGFibGUgdmlhIGFubm90YXRpb25cblx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uIHx8XG5cdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb24pXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFJldHVybnMgJ2ZhbHNlJyBpZiBGaWx0ZXJGdW5jdGlvbnMgYW5ub3RhdGlvbiBzdXBwb3J0cyAndG9sb3dlcicsIGVsc2UgJ3RydWUnXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRjb25zdCBmaWx0ZXJGdW5jdGlvbnM6IEZpbHRlckZ1bmN0aW9ucyB8IHVuZGVmaW5lZCA9IF9nZXRGaWx0ZXJGdW5jdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiBBcnJheS5pc0FycmF5KGZpbHRlckZ1bmN0aW9ucykgPyAoZmlsdGVyRnVuY3Rpb25zIGFzIFN0cmluZ1tdKS5pbmRleE9mKFwidG9sb3dlclwiKSA9PT0gLTEgOiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2dldEZpbHRlckZ1bmN0aW9ucyhDb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogRmlsdGVyRnVuY3Rpb25zIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0aWYgKFR5cGVHdWFyZHMuaXNFbnRpdHlTZXQoZW50aXR5U2V0KSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5GaWx0ZXJGdW5jdGlvbnMgPz9cblx0XHRcdENvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCkuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5GaWx0ZXJGdW5jdGlvbnNcblx0XHQpO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIGZvciB0ZXh0IGZpZWxkcyBpbiBhIHRhYmxlLlxuICpcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zXG4gKiBAcmV0dXJucyBDb2xsZWN0aW9uIG9mIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9uc1R5cGUgfCB1bmRlZmluZWQpOiBGb3JtYXRPcHRpb25zVHlwZSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBmb3JtYXRPcHRpb25zID09PSB1bmRlZmluZWRcblx0XHQ/IHVuZGVmaW5lZFxuXHRcdDoge1xuXHRcdFx0XHR0ZXh0TGluZXNFZGl0OiA0LFxuXHRcdFx0XHQuLi5mb3JtYXRPcHRpb25zXG5cdFx0ICB9O1xufVxuXG5mdW5jdGlvbiBfZmluZFNlbWFudGljS2V5VmFsdWVzKHNlbWFudGljS2V5czogU2VtYW50aWNLZXksIG5hbWU6IHN0cmluZykge1xuXHRjb25zdCBhU2VtYW50aWNLZXlWYWx1ZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBiU2VtYW50aWNLZXlGb3VuZCA9IGZhbHNlO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IHNlbWFudGljS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGFTZW1hbnRpY0tleVZhbHVlcy5wdXNoKHNlbWFudGljS2V5c1tpXS52YWx1ZSk7XG5cdFx0aWYgKHNlbWFudGljS2V5c1tpXS52YWx1ZSA9PT0gbmFtZSkge1xuXHRcdFx0YlNlbWFudGljS2V5Rm91bmQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4ge1xuXHRcdHZhbHVlczogYVNlbWFudGljS2V5VmFsdWVzLFxuXHRcdHNlbWFudGljS2V5Rm91bmQ6IGJTZW1hbnRpY0tleUZvdW5kXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9maW5kUHJvcGVydGllcyhzZW1hbnRpY0tleVZhbHVlczogc3RyaW5nW10sIGZpZWxkR3JvdXBQcm9wZXJ0aWVzOiBzdHJpbmdbXSkge1xuXHRsZXQgc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCA9IGZhbHNlO1xuXHRsZXQgc1Byb3BlcnR5UGF0aDtcblx0aWYgKHNlbWFudGljS2V5VmFsdWVzICYmIHNlbWFudGljS2V5VmFsdWVzLmxlbmd0aCA+PSAxICYmIGZpZWxkR3JvdXBQcm9wZXJ0aWVzICYmIGZpZWxkR3JvdXBQcm9wZXJ0aWVzLmxlbmd0aCA+PSAxKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZW1hbnRpY0tleVZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKFtzZW1hbnRpY0tleVZhbHVlc1tpXV0uc29tZSgodG1wKSA9PiBmaWVsZEdyb3VwUHJvcGVydGllcy5pbmRleE9mKHRtcCkgPj0gMCkpIHtcblx0XHRcdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCA9IHRydWU7XG5cdFx0XHRcdHNQcm9wZXJ0eVBhdGggPSBzZW1hbnRpY0tleVZhbHVlc1tpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7XG5cdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cDogc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCxcblx0XHRmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiBzUHJvcGVydHlQYXRoXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9maW5kU2VtYW50aWNLZXlWYWx1ZXNJbkZpZWxkR3JvdXAoZGF0YUZpZWxkR3JvdXA6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBudWxsLCBzZW1hbnRpY0tleVZhbHVlczogc3RyaW5nW10pIHtcblx0Y29uc3QgYVByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBfcHJvcGVydGllc0ZvdW5kOiB7IHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXA6IGJvb2xlYW47IGZpZWxkR3JvdXBQcm9wZXJ0eVBhdGg/OiBzdHJpbmcgfSA9IHtcblx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBmYWxzZSxcblx0XHRmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiB1bmRlZmluZWRcblx0fTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZVxuXHQpIHtcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoaW5uZXJEYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fCBpbm5lckRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCkgJiZcblx0XHRcdFx0aW5uZXJEYXRhRmllbGQuVmFsdWVcblx0XHRcdCkge1xuXHRcdFx0XHRhUHJvcGVydGllcy5wdXNoKGlubmVyRGF0YUZpZWxkLlZhbHVlLnBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0X3Byb3BlcnRpZXNGb3VuZCA9IF9maW5kUHJvcGVydGllcyhzZW1hbnRpY0tleVZhbHVlcywgYVByb3BlcnRpZXMpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cDogX3Byb3BlcnRpZXNGb3VuZC5zZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwLFxuXHRcdHByb3BlcnR5UGF0aDogX3Byb3BlcnRpZXNGb3VuZC5maWVsZEdyb3VwUHJvcGVydHlQYXRoXG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIHdpdGggZHJhZnRJbmRpY2F0b3IgZm9yIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gc2VtYW50aWNLZXlzXG4gKiBAcGFyYW0gaXNGaWVsZEdyb3VwQ29sdW1uXG4gKiBAcGFyYW0gZGF0YUZpZWxkR3JvdXBcbiAqIEByZXR1cm5zIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4oXG5cdG5hbWU6IHN0cmluZyxcblx0c2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSxcblx0aXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuLFxuXHRkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IG51bGxcbikge1xuXHRpZiAoIXNlbWFudGljS2V5cykge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHRjb25zdCBzZW1hbnRpY0tleSA9IF9maW5kU2VtYW50aWNLZXlWYWx1ZXMoc2VtYW50aWNLZXlzLCBuYW1lKTtcblx0Y29uc3Qgc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAgPSBfZmluZFNlbWFudGljS2V5VmFsdWVzSW5GaWVsZEdyb3VwKGRhdGFGaWVsZEdyb3VwLCBzZW1hbnRpY0tleS52YWx1ZXMpO1xuXHRpZiAoc2VtYW50aWNLZXkuc2VtYW50aWNLZXlGb3VuZCkge1xuXHRcdGNvbnN0IGZvcm1hdE9wdGlvbnNPYmo6IEZvcm1hdE9wdGlvbnNUeXBlID0ge1xuXHRcdFx0aGFzRHJhZnRJbmRpY2F0b3I6IHRydWUsXG5cdFx0XHRzZW1hbnRpY2tleXM6IHNlbWFudGljS2V5LnZhbHVlcyxcblx0XHRcdHNob3dFcnJvck9iamVjdFN0YXR1czogY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCBmYWxzZSkpXG5cdFx0fTtcblx0XHRpZiAoaXNGaWVsZEdyb3VwQ29sdW1uICYmIHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXApIHtcblx0XHRcdGZvcm1hdE9wdGlvbnNPYmouc2hvd0Vycm9yT2JqZWN0U3RhdHVzID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCB0cnVlKSk7XG5cdFx0XHRmb3JtYXRPcHRpb25zT2JqLmZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCA9IHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnByb3BlcnR5UGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnNPYmo7XG5cdH0gZWxzZSBpZiAoIXNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXApIHtcblx0XHRyZXR1cm4ge307XG5cdH0gZWxzZSB7XG5cdFx0Ly8gU2VtYW50aWMgS2V5IGhhcyBhIHByb3BlcnR5IGluIGEgRmllbGRHcm91cFxuXHRcdHJldHVybiB7XG5cdFx0XHRmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGg6IHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnByb3BlcnR5UGF0aCxcblx0XHRcdGZpZWxkR3JvdXBOYW1lOiBuYW1lLFxuXHRcdFx0c2hvd0Vycm9yT2JqZWN0U3RhdHVzOiBjb21waWxlRXhwcmVzc2lvbihnZXRSb3dTdGF0dXNWaXNpYmlsaXR5KG5hbWUsIHRydWUpKVxuXHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gX2dldEltcE51bWJlcihkYXRhRmllbGQ6IERhdGFGaWVsZFR5cGVzKTogbnVtYmVyIHtcblx0Y29uc3QgaW1wb3J0YW5jZSA9IGRhdGFGaWVsZD8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlIGFzIHN0cmluZztcblxuXHRpZiAoaW1wb3J0YW5jZSAmJiBpbXBvcnRhbmNlLmluY2x1ZGVzKFwiVUkuSW1wb3J0YW5jZVR5cGUvSGlnaFwiKSkge1xuXHRcdHJldHVybiAzO1xuXHR9XG5cdGlmIChpbXBvcnRhbmNlICYmIGltcG9ydGFuY2UuaW5jbHVkZXMoXCJVSS5JbXBvcnRhbmNlVHlwZS9NZWRpdW1cIikpIHtcblx0XHRyZXR1cm4gMjtcblx0fVxuXHRpZiAoaW1wb3J0YW5jZSAmJiBpbXBvcnRhbmNlLmluY2x1ZGVzKFwiVUkuSW1wb3J0YW5jZVR5cGUvTG93XCIpKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblx0cmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKGRhdGFGaWVsZDogRGF0YUZpZWxkVHlwZXMpOiBJbXBvcnRhbmNlIHtcblx0Y29uc3QgaW1wb3J0YW5jZSA9IGRhdGFGaWVsZD8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlIGFzIHN0cmluZztcblx0cmV0dXJuIGltcG9ydGFuY2UgPyAoaW1wb3J0YW5jZS5zcGxpdChcIi9cIilbMV0gYXMgSW1wb3J0YW5jZSkgOiBJbXBvcnRhbmNlLk5vbmU7XG59XG5cbmZ1bmN0aW9uIF9nZXRNYXhJbXBvcnRhbmNlKGZpZWxkczogRGF0YUZpZWxkVHlwZXNbXSk6IEltcG9ydGFuY2Uge1xuXHRpZiAoZmllbGRzICYmIGZpZWxkcy5sZW5ndGggPiAwKSB7XG5cdFx0bGV0IG1heEltcE51bWJlciA9IC0xO1xuXHRcdGxldCBpbXBOdW1iZXIgPSAtMTtcblx0XHRsZXQgRGF0YUZpZWxkV2l0aE1heEltcG9ydGFuY2U7XG5cdFx0Zm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcblx0XHRcdGltcE51bWJlciA9IF9nZXRJbXBOdW1iZXIoZmllbGQpO1xuXHRcdFx0aWYgKGltcE51bWJlciA+IG1heEltcE51bWJlcikge1xuXHRcdFx0XHRtYXhJbXBOdW1iZXIgPSBpbXBOdW1iZXI7XG5cdFx0XHRcdERhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlID0gZmllbGQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBfZ2V0RGF0YUZpZWxkSW1wb3J0YW5jZShEYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZSBhcyBEYXRhRmllbGRUeXBlcyk7XG5cdH1cblx0cmV0dXJuIEltcG9ydGFuY2UuTm9uZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbXBvcnRhbmNlIHZhbHVlIGZvciBhIGNvbHVtbi5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkXG4gKiBAcGFyYW0gc2VtYW50aWNLZXlzXG4gKiBAcmV0dXJucyBUaGUgaW1wb3J0YW5jZSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1wb3J0YW5jZShkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCB1bmRlZmluZWQsIHNlbWFudGljS2V5czogU2VtYW50aWNLZXkpOiBJbXBvcnRhbmNlIHwgdW5kZWZpbmVkIHtcblx0Ly9FdmFsdWF0ZSBkZWZhdWx0IEltcG9ydGFuY2UgaXMgbm90IHNldCBleHBsaWNpdGx5XG5cdGxldCBmaWVsZHNXaXRoSW1wb3J0YW5jZSxcblx0XHRtYXBTZW1hbnRpY0tleXM6IHN0cmluZ1tdID0gW107XG5cdC8vQ2hlY2sgaWYgc2VtYW50aWNLZXlzIGFyZSBkZWZpbmVkIGF0IHRoZSBFbnRpdHlTZXQgbGV2ZWxcblx0aWYgKHNlbWFudGljS2V5cyAmJiBzZW1hbnRpY0tleXMubGVuZ3RoID4gMCkge1xuXHRcdG1hcFNlbWFudGljS2V5cyA9IHNlbWFudGljS2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGtleS52YWx1ZTtcblx0XHR9KTtcblx0fVxuXHRpZiAoIWRhdGFGaWVsZCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAoaXNBbm5vdGF0aW9uT2ZUeXBlPERhdGFGaWVsZEZvckFubm90YXRpb24+KGRhdGFGaWVsZCwgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikpIHtcblx0XHRjb25zdCBkYXRhRmllbGRUYXJnZXQgPSBkYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQ7XG5cdFx0aWYgKGlzQW5ub3RhdGlvbk9mVHlwZTxGaWVsZEdyb3VwPihkYXRhRmllbGRUYXJnZXQsIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlKSkge1xuXHRcdFx0Y29uc3QgZmllbGRHcm91cERhdGEgPSBkYXRhRmllbGRUYXJnZXQuRGF0YTtcblx0XHRcdGNvbnN0IGZpZWxkR3JvdXBIYXNTZW1hbnRpY0tleSA9XG5cdFx0XHRcdGZpZWxkR3JvdXBEYXRhICYmXG5cdFx0XHRcdGZpZWxkR3JvdXBEYXRhLnNvbWUoZnVuY3Rpb24gKGZpZWxkR3JvdXBEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0KGZpZWxkR3JvdXBEYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoICYmXG5cdFx0XHRcdFx0XHRmaWVsZEdyb3VwRGF0YUZpZWxkLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdFx0XHRtYXBTZW1hbnRpY0tleXMuaW5jbHVkZXMoKGZpZWxkR3JvdXBEYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0Ly9JZiBhIEZpZWxkR3JvdXAgY29udGFpbnMgYSBzZW1hbnRpY0tleSwgaW1wb3J0YW5jZSBzZXQgdG8gSGlnaFxuXHRcdFx0aWYgKGZpZWxkR3JvdXBIYXNTZW1hbnRpY0tleSkge1xuXHRcdFx0XHRyZXR1cm4gSW1wb3J0YW5jZS5IaWdoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9JZiB0aGUgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBoYXMgYW4gSW1wb3J0YW5jZSB3ZSB0YWtlIGl0XG5cdFx0XHRcdGlmIChkYXRhRmllbGQ/LmFubm90YXRpb25zPy5VST8uSW1wb3J0YW5jZSkge1xuXHRcdFx0XHRcdHJldHVybiBfZ2V0RGF0YUZpZWxkSW1wb3J0YW5jZShkYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gZWxzZSB0aGUgaGlnaGVzdCBpbXBvcnRhbmNlIChpZiBhbnkpIGlzIHJldHVybmVkXG5cdFx0XHRcdGZpZWxkc1dpdGhJbXBvcnRhbmNlID1cblx0XHRcdFx0XHRmaWVsZEdyb3VwRGF0YSAmJlxuXHRcdFx0XHRcdGZpZWxkR3JvdXBEYXRhLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGl0ZW0/LmFubm90YXRpb25zPy5VST8uSW1wb3J0YW5jZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIF9nZXRNYXhJbXBvcnRhbmNlKGZpZWxkc1dpdGhJbXBvcnRhbmNlIGFzIERhdGFGaWVsZFR5cGVzW10pO1xuXHRcdFx0fVxuXHRcdFx0Ly9JZiB0aGUgY3VycmVudCBmaWVsZCBpcyBhIHNlbWFudGljS2V5LCBpbXBvcnRhbmNlIHNldCB0byBIaWdoXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLlZhbHVlICYmXG5cdFx0KGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoICYmXG5cdFx0bWFwU2VtYW50aWNLZXlzLmluY2x1ZGVzKChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLlZhbHVlLnBhdGgpXG5cdFx0PyBJbXBvcnRhbmNlLkhpZ2hcblx0XHQ6IF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKGRhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGxpbmUgaXRlbXMgZnJvbSBtZXRhZGF0YSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgd2l0aCB0aGVpciBhbm5vdGF0aW9uc1xuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoIFRoZSB2aXN1YWxpemF0aW9uIHBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgYW5ub3RhdGlvbnNcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pLFxuXHRcdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IFtdLFxuXHRcdGNvbHVtbnNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+ID0ge30sXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSA9IGdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKSxcblx0XHR0YWJsZU1hbmlmZXN0U2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKSxcblx0XHR0YWJsZVR5cGU6IFRhYmxlVHlwZSA9IHRhYmxlTWFuaWZlc3RTZXR0aW5ncz8udGFibGVTZXR0aW5ncz8udHlwZSB8fCBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHRjb25zdCB0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IHNlbWFudGljS2V5czogU2VtYW50aWNLZXkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQ29tbW9uXCIsIENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY0tleSwgW1xuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdF0pWzBdO1xuXHRpZiAobGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgdGFibGVDb252ZXJ0ZXJDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKFxuXHRcdFx0Z2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSlcblx0XHQpO1xuXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmZvckVhY2goKGxpbmVJdGVtKSA9PiB7XG5cdFx0XHRpZiAoIV9pc1ZhbGlkQ29sdW1uKGxpbmVJdGVtKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRsZXQgZXhwb3J0U2V0dGluZ3M6IGNvbHVtbkV4cG9ydFNldHRpbmdzIHwgbnVsbCA9IG51bGw7XG5cdFx0XHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID1cblx0XHRcdFx0aXNEYXRhRmllbGRUeXBlcyhsaW5lSXRlbSkgJiYgbGluZUl0ZW0uVmFsdWU/LiR0YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHRcdD8gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIGxpbmVJdGVtKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVQYXRoID0gX2dldFJlbGF0aXZlUGF0aChsaW5lSXRlbSk7XG5cblx0XHRcdC8vIERldGVybWluZSBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBjb25zdW1lZCBieSB0aGlzIExpbmVJdGVtLlxuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvOiBDb21wbGV4UHJvcGVydHlJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkobGluZUl0ZW0sIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlVHlwZSk7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3QgZ3JvdXBQYXRoOiBzdHJpbmcgPSBfc2xpY2VBdFNsYXNoKHJlbGF0aXZlUGF0aCwgdHJ1ZSwgZmFsc2UpO1xuXHRcdFx0Y29uc3QgaXNHcm91cDogYm9vbGVhbiA9IGdyb3VwUGF0aCAhPSByZWxhdGl2ZVBhdGg7XG5cdFx0XHRjb25zdCBzTGFiZWw6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldExhYmVsKGxpbmVJdGVtLCBpc0dyb3VwKTtcblx0XHRcdGNvbnN0IG5hbWUgPSBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUobGluZUl0ZW0pO1xuXHRcdFx0Y29uc3QgaXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuID0gZ3JvdXBQYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXB9YCkgPiAtMTtcblx0XHRcdGNvbnN0IHNob3dEYXRhRmllbGRzTGFiZWw6IGJvb2xlYW4gPSBpc0ZpZWxkR3JvdXBDb2x1bW5cblx0XHRcdFx0PyBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbChuYW1lLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dClcblx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdGNvbnN0IGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXREYXRhRmllbGREYXRhVHlwZShsaW5lSXRlbSk7XG5cdFx0XHRjb25zdCBzRGF0ZUlucHV0Rm9ybWF0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBkYXRhVHlwZSA9PT0gXCJFZG0uRGF0ZVwiID8gXCJZWVlZLU1NLUREXCIgOiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBmb3JtYXRPcHRpb25zID0gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoXG5cdFx0XHRcdGdldERlZmF1bHREcmFmdEluZGljYXRvckZvckNvbHVtbihuYW1lLCBzZW1hbnRpY0tleXMsIGlzRmllbGRHcm91cENvbHVtbiwgbGluZUl0ZW0pXG5cdFx0XHQpO1xuXHRcdFx0bGV0IGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGxpbmVJdGVtLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdGxpbmVJdGVtLlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlXG5cdFx0XHQpIHtcblx0XHRcdFx0ZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zID0gX2dldEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyhsaW5lSXRlbSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoX2lzRXhwb3J0YWJsZUNvbHVtbihsaW5lSXRlbSkpIHtcblx0XHRcdFx0Ly9leGNsdWRlIHRoZSB0eXBlcyBsaXN0ZWQgYWJvdmUgZm9yIHRoZSBFeHBvcnQgKGdlbmVyYXRlcyBlcnJvciBvbiBFeHBvcnQgYXMgUERGKVxuXHRcdFx0XHRleHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUsXG5cdFx0XHRcdFx0d3JhcDogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzV3JhcHBpbmcsXG5cdFx0XHRcdFx0dHlwZTogZGF0YVR5cGUgPyBfZ2V0RXhwb3J0RGF0YVR5cGUoZGF0YVR5cGUsIHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDEpIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdGlucHV0Rm9ybWF0OiBzRGF0ZUlucHV0Rm9ybWF0LFxuXHRcdFx0XHRcdGRlbGltaXRlcjogZGF0YVR5cGUgPT09IFwiRWRtLkludDY0XCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdFByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lO1xuXHRcdFx0XHRcdGV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdCA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmUgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IHByb3BlcnR5VHlwZUNvbmZpZzogUHJvcGVydHlUeXBlQ29uZmlnIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKGRhdGFUeXBlKSB7XG5cdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZyA9IGdldFR5cGVDb25maWcobGluZUl0ZW0sIGRhdGFUeXBlKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHR5cGVDb25maWc6IFByb3BlcnR5VHlwZUNvbmZpZyA9IHtcblx0XHRcdFx0Y2xhc3NOYW1lOiBkYXRhVHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiB7XG5cdFx0XHRcdFx0Li4uZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHQuLi5wcm9wZXJ0eVR5cGVDb25maWc/LmZvcm1hdE9wdGlvbnNcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29uc3RyYWludHM6IHsgLi4ucHJvcGVydHlUeXBlQ29uZmlnPy5jb25zdHJhaW50cyB9XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3QgdmlzdWFsU2V0dGluZ3M6IFZpc3VhbFNldHRpbmdzID0ge307XG5cdFx0XHRpZiAoIWRhdGFUeXBlIHx8ICF0eXBlQ29uZmlnKSB7XG5cdFx0XHRcdC8vIGZvciBjaGFydHNcblx0XHRcdFx0dmlzdWFsU2V0dGluZ3Mud2lkdGhDYWxjdWxhdGlvbiA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpc011bHRpVmFsdWUgPSBfaXNDb2x1bW5NdWx0aVZhbHVlZChsaW5lSXRlbSwgdGFibGVDb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGNvbnN0IHNvcnRhYmxlID0gIWlzTXVsdGlWYWx1ZSAmJiBfaXNDb2x1bW5Tb3J0YWJsZShsaW5lSXRlbSwgcmVsYXRpdmVQYXRoLCBub25Tb3J0YWJsZUNvbHVtbnMpO1xuXHRcdFx0Y29uc3QgY29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4gPSB7XG5cdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChsaW5lSXRlbSksXG5cdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0bGFiZWw6IHNMYWJlbCxcblx0XHRcdFx0Z3JvdXBMYWJlbDogaXNHcm91cCA/IGdldExhYmVsKGxpbmVJdGVtKSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0Z3JvdXA6IGlzR3JvdXAgPyBncm91cFBhdGggOiB1bmRlZmluZWQsXG5cdFx0XHRcdEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGxpbmVJdGVtLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdHNlbWFudGljT2JqZWN0UGF0aDogc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0YXZhaWxhYmlsaXR5OiBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihsaW5lSXRlbSkgPyBcIkhpZGRlblwiIDogXCJEZWZhdWx0XCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdHNob3dEYXRhRmllbGRzTGFiZWw6IHNob3dEYXRhRmllbGRzTGFiZWwsXG5cdFx0XHRcdHJlbGF0aXZlUGF0aDogcmVsYXRpdmVQYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogc29ydGFibGUsXG5cdFx0XHRcdHByb3BlcnR5SW5mb3M6IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA/IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydHlJbmZvczogYWRkaXRpb25hbFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMCA/IGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRleHBvcnRTZXR0aW5nczogZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHRcdHdpZHRoOiAobGluZUl0ZW0uYW5ub3RhdGlvbnM/LkhUTUw1Py5Dc3NEZWZhdWx0cz8ud2lkdGg/LnZhbHVlT2YoKSBhcyBzdHJpbmcpIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0aW1wb3J0YW5jZTogZ2V0SW1wb3J0YW5jZShsaW5lSXRlbSBhcyBEYXRhRmllbGRUeXBlcywgc2VtYW50aWNLZXlzKSxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IHRydWUsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IGZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0dHlwZUNvbmZpZzogdHlwZUNvbmZpZyxcblx0XHRcdFx0dmlzdWFsU2V0dGluZ3M6IHZpc3VhbFNldHRpbmdzLFxuXHRcdFx0XHR0aW1lem9uZVRleHQ6IGV4cG9ydFNldHRpbmdzPy50aW1lem9uZSxcblx0XHRcdFx0aXNQYXJ0T2ZMaW5lSXRlbTogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IHNUb29sdGlwID0gX2dldFRvb2x0aXAobGluZUl0ZW0pO1xuXHRcdFx0aWYgKHNUb29sdGlwKSB7XG5cdFx0XHRcdGNvbHVtbi50b29sdGlwID0gc1Rvb2x0aXA7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLnRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbi5wdXNoKC4uLnJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSAmJiBjb2x1bW4uZXhwb3J0U2V0dGluZ3MpIHtcblx0XHRcdFx0Y29sdW1uLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlO1xuXHRcdFx0XHRjb2x1bW4uZXhwb3J0U2V0dGluZ3MudHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHR9XG5cblx0XHRcdGFubm90YXRpb25Db2x1bW5zLnB1c2goY29sdW1uKTtcblxuXHRcdFx0Ly8gQ29sbGVjdCBpbmZvcm1hdGlvbiBvZiByZWxhdGVkIGNvbHVtbnMgdG8gYmUgY3JlYXRlZC5cblx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmZvckVhY2goKHJlbGF0ZWRQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdFx0Y29sdW1uc1RvQmVDcmVhdGVkW3JlbGF0ZWRQcm9wZXJ0eU5hbWVdID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLnByb3BlcnRpZXNbcmVsYXRlZFByb3BlcnR5TmFtZV07XG5cblx0XHRcdFx0Ly8gSW4gY2FzZSBvZiBhIG11bHRpLXZhbHVlLCByZWxhdGVkIHByb3BlcnRpZXMgY2Fubm90IGJlIHNvcnRlZCBhcyB3ZSBnbyB0aHJvdWdoIGEgMS1uIHJlbGF0aW9uXG5cdFx0XHRcdGlmIChpc011bHRpVmFsdWUpIHtcblx0XHRcdFx0XHRub25Tb3J0YWJsZUNvbHVtbnMucHVzaChyZWxhdGVkUHJvcGVydHlOYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIENyZWF0ZSBjb2x1bW5zIGZvciBhZGRpdGlvbmFsIHByb3BlcnRpZXMgaWRlbnRpZmllZCBmb3IgQUxQIHVzZSBjYXNlLlxuXHRcdFx0YWRkaXRpb25hbFByb3BlcnR5TmFtZXMuZm9yRWFjaCgoYWRkaXRpb25hbFByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHQvLyBJbnRlbnRpb25hbCBvdmVyd3JpdGUgYXMgd2UgcmVxdWlyZSBvbmx5IG9uZSBuZXcgUHJvcGVydHlJbmZvIGZvciBhIHJlbGF0ZWQgUHJvcGVydHkuXG5cdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFthZGRpdGlvbmFsUHJvcGVydHlOYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5hZGRpdGlvbmFsUHJvcGVydGllc1thZGRpdGlvbmFsUHJvcGVydHlOYW1lXTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gR2V0IGNvbHVtbnMgZnJvbSB0aGUgUHJvcGVydGllcyBvZiBFbnRpdHlUeXBlXG5cdHJldHVybiBnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUoXG5cdFx0Y29sdW1uc1RvQmVDcmVhdGVkLFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0YW5ub3RhdGlvbkNvbHVtbnMsXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0dGFibGVUeXBlLFxuXHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHQpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBwcm9wZXJ0eSBuYW1lcyBmcm9tIHRoZSBtYW5pZmVzdCBhbmQgY2hlY2tzIGFnYWluc3QgZXhpc3RpbmcgcHJvcGVydGllcyBhbHJlYWR5IGFkZGVkIGJ5IGFubm90YXRpb25zLlxuICogSWYgYSBub3QgeWV0IHN0b3JlZCBwcm9wZXJ0eSBpcyBmb3VuZCBpdCBhZGRzIGl0IGZvciBzb3J0aW5nIGFuZCBmaWx0ZXJpbmcgb25seSB0byB0aGUgYW5ub3RhdGlvbkNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlXG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBhbm5vdGF0aW9uc1xuICovXG5jb25zdCBfZ2V0UHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydGllczogc3RyaW5nW10gfCB1bmRlZmluZWQsXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZVxuKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuXHRsZXQgbWF0Y2hlZFByb3BlcnRpZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXHRpZiAocHJvcGVydGllcykge1xuXHRcdG1hdGNoZWRQcm9wZXJ0aWVzID0gcHJvcGVydGllcy5tYXAoZnVuY3Rpb24gKHByb3BlcnR5UGF0aCkge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbiA9IGFubm90YXRpb25Db2x1bW5zLmZpbmQoZnVuY3Rpb24gKGFubm90YXRpb25Db2x1bW4pIHtcblx0XHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwcm9wZXJ0eVBhdGggJiYgYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQ7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChhbm5vdGF0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLm5hbWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IF9jcmVhdGVSZWxhdGVkQ29sdW1ucyhcblx0XHRcdFx0XHR7IFtwcm9wZXJ0eVBhdGhdOiBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCkgfSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRcdFx0W11cblx0XHRcdFx0KTtcblx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbnMucHVzaChyZWxhdGVkQ29sdW1uc1swXSk7XG5cdFx0XHRcdHJldHVybiByZWxhdGVkQ29sdW1uc1swXS5uYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG1hdGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuY29uc3QgX2FwcGVuZEN1c3RvbVRlbXBsYXRlID0gZnVuY3Rpb24gKHByb3BlcnRpZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcblx0cmV0dXJuIHByb3BlcnRpZXNcblx0XHQubWFwKChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGB7JHtwcm9wZXJ0aWVzLmluZGV4T2YocHJvcGVydHkpfX1gO1xuXHRcdH0pXG5cdFx0LmpvaW4oYCR7XCJcXG5cIn1gKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0YWJsZSBjb2x1bW4gZGVmaW5pdGlvbnMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBUaGVzZSBtYXkgYmUgY3VzdG9tIGNvbHVtbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QsIHNsb3QgY29sdW1ucyBjb21pbmcgdGhyb3VnaFxuICogYSBidWlsZGluZyBibG9jaywgb3IgYW5ub3RhdGlvbiBjb2x1bW5zIHRvIG92ZXJ3cml0ZSBhbm5vdGF0aW9uLWJhc2VkIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIGNvbHVtbnNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlXG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBtYW5pZmVzdFxuICovXG5jb25zdCBnZXRDb2x1bW5zRnJvbU1hbmlmZXN0ID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZT4sXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvblxuKTogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RDb2x1bW4+IHtcblx0Y29uc3QgaW50ZXJuYWxDb2x1bW5zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdENvbHVtbj4gPSB7fTtcblxuXHRmdW5jdGlvbiBpc0Fubm90YXRpb25Db2x1bW4oXG5cdFx0Y29sdW1uOiBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSxcblx0XHRrZXk6IHN0cmluZ1xuXHQpOiBjb2x1bW4gaXMgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUge1xuXHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1ucy5zb21lKChhbm5vdGF0aW9uQ29sdW1uKSA9PiBhbm5vdGF0aW9uQ29sdW1uLmtleSA9PT0ga2V5KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGlzU2xvdENvbHVtbihtYW5pZmVzdENvbHVtbjogQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uKTogbWFuaWZlc3RDb2x1bW4gaXMgRnJhZ21lbnREZWZpbmVkU2xvdENvbHVtbiB7XG5cdFx0cmV0dXJuIG1hbmlmZXN0Q29sdW1uLnR5cGUgPT09IENvbHVtblR5cGUuU2xvdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGlzQ3VzdG9tQ29sdW1uKG1hbmlmZXN0Q29sdW1uOiBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4pOiBtYW5pZmVzdENvbHVtbiBpcyBNYW5pZmVzdERlZmluZWRDdXN0b21Db2x1bW4ge1xuXHRcdHJldHVybiBtYW5pZmVzdENvbHVtbi50eXBlID09PSB1bmRlZmluZWQgJiYgISFtYW5pZmVzdENvbHVtbi50ZW1wbGF0ZTtcblx0fVxuXG5cdGZ1bmN0aW9uIF91cGRhdGVMaW5rZWRQcm9wZXJ0aWVzT25DdXN0b21Db2x1bW5zKHByb3BlcnR5SW5mb3M6IHN0cmluZ1tdLCBhbm5vdGF0aW9uVGFibGVDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSkge1xuXHRcdGNvbnN0IG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10gPSBnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSk7XG5cdFx0cHJvcGVydHlJbmZvcy5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0YW5ub3RhdGlvblRhYmxlQ29sdW1ucy5mb3JFYWNoKChwcm9wKSA9PiB7XG5cdFx0XHRcdGlmIChwcm9wLm5hbWUgPT09IHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0cHJvcC5zb3J0YWJsZSA9IG5vblNvcnRhYmxlQ29sdW1ucy5pbmRleE9mKHByb3BlcnR5LnJlcGxhY2UoXCJQcm9wZXJ0eTo6XCIsIFwiXCIpKSA9PT0gLTE7XG5cdFx0XHRcdFx0cHJvcC5pc0dyb3VwYWJsZSA9IHByb3Auc29ydGFibGU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gY29sdW1ucykge1xuXHRcdGNvbnN0IG1hbmlmZXN0Q29sdW1uID0gY29sdW1uc1trZXldO1xuXHRcdEtleUhlbHBlci52YWxpZGF0ZUtleShrZXkpO1xuXG5cdFx0Ly8gQmFzZVRhYmxlQ29sdW1uXG5cdFx0Y29uc3QgYmFzZVRhYmxlQ29sdW1uID0ge1xuXHRcdFx0a2V5OiBrZXksXG5cdFx0XHR3aWR0aDogbWFuaWZlc3RDb2x1bW4ud2lkdGggfHwgdW5kZWZpbmVkLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0YW5jaG9yOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbj8uYW5jaG9yLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IG1hbmlmZXN0Q29sdW1uLnBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBQbGFjZW1lbnQuQWZ0ZXIgOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbi5wbGFjZW1lbnRcblx0XHRcdH0sXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dClcblx0XHR9O1xuXG5cdFx0aWYgKGlzQW5ub3RhdGlvbkNvbHVtbihtYW5pZmVzdENvbHVtbiwga2V5KSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydGllc1RvT3ZlcndyaXRlQW5ub3RhdGlvbkNvbHVtbjogQ3VzdG9tRWxlbWVudDxBbm5vdGF0aW9uVGFibGVDb2x1bW5Gb3JPdmVycmlkZT4gPSB7XG5cdFx0XHRcdC4uLmJhc2VUYWJsZUNvbHVtbixcblx0XHRcdFx0aW1wb3J0YW5jZTogbWFuaWZlc3RDb2x1bW4/LmltcG9ydGFuY2UsXG5cdFx0XHRcdGhvcml6b250YWxBbGlnbjogbWFuaWZlc3RDb2x1bW4/Lmhvcml6b250YWxBbGlnbixcblx0XHRcdFx0YXZhaWxhYmlsaXR5OiBtYW5pZmVzdENvbHVtbj8uYXZhaWxhYmlsaXR5LFxuXHRcdFx0XHR0eXBlOiBDb2x1bW5UeXBlLkFubm90YXRpb24sXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiBpc0Fubm90YXRpb25Db2x1bW4obWFuaWZlc3RDb2x1bW4sIGtleSlcblx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdDogaXNBY3Rpb25OYXZpZ2FibGUobWFuaWZlc3RDb2x1bW4sIG5hdmlnYXRpb25TZXR0aW5ncywgdHJ1ZSksXG5cdFx0XHRcdHNldHRpbmdzOiBtYW5pZmVzdENvbHVtbi5zZXR0aW5ncyxcblx0XHRcdFx0Zm9ybWF0T3B0aW9uczogX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUobWFuaWZlc3RDb2x1bW4uZm9ybWF0T3B0aW9ucylcblx0XHRcdH07XG5cdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IHByb3BlcnRpZXNUb092ZXJ3cml0ZUFubm90YXRpb25Db2x1bW47XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5SW5mb3M6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gX2dldFByb3BlcnR5TmFtZXMoXG5cdFx0XHRcdG1hbmlmZXN0Q29sdW1uLnByb3BlcnRpZXMsXG5cdFx0XHRcdGFubm90YXRpb25Db2x1bW5zLFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRlbnRpdHlUeXBlXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgYmFzZU1hbmlmZXN0Q29sdW1uID0ge1xuXHRcdFx0XHQuLi5iYXNlVGFibGVDb2x1bW4sXG5cdFx0XHRcdGhlYWRlcjogbWFuaWZlc3RDb2x1bW4uaGVhZGVyLFxuXHRcdFx0XHRpbXBvcnRhbmNlOiBtYW5pZmVzdENvbHVtbj8uaW1wb3J0YW5jZSB8fCBJbXBvcnRhbmNlLk5vbmUsXG5cdFx0XHRcdGhvcml6b250YWxBbGlnbjogbWFuaWZlc3RDb2x1bW4/Lmhvcml6b250YWxBbGlnbiB8fCBIb3Jpem9udGFsQWxpZ24uQmVnaW4sXG5cdFx0XHRcdGF2YWlsYWJpbGl0eTogbWFuaWZlc3RDb2x1bW4/LmF2YWlsYWJpbGl0eSB8fCBcIkRlZmF1bHRcIixcblx0XHRcdFx0dGVtcGxhdGU6IG1hbmlmZXN0Q29sdW1uLnRlbXBsYXRlLFxuXHRcdFx0XHRwcm9wZXJ0eUluZm9zOiBwcm9wZXJ0eUluZm9zLFxuXHRcdFx0XHRleHBvcnRTZXR0aW5nczogcHJvcGVydHlJbmZvc1xuXHRcdFx0XHRcdD8ge1xuXHRcdFx0XHRcdFx0XHR0ZW1wbGF0ZTogX2FwcGVuZEN1c3RvbVRlbXBsYXRlKHByb3BlcnR5SW5mb3MpLFxuXHRcdFx0XHRcdFx0XHR3cmFwOiAhIShwcm9wZXJ0eUluZm9zLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRpZDogYEN1c3RvbUNvbHVtbjo6JHtrZXl9YCxcblx0XHRcdFx0bmFtZTogYEN1c3RvbUNvbHVtbjo6JHtrZXl9YCxcblx0XHRcdFx0Ly9OZWVkZWQgZm9yIE1EQzpcblx0XHRcdFx0Zm9ybWF0T3B0aW9uczogeyB0ZXh0TGluZXNFZGl0OiA0IH0sXG5cdFx0XHRcdGlzR3JvdXBhYmxlOiBmYWxzZSxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IGZhbHNlLFxuXHRcdFx0XHRzb3J0YWJsZTogZmFsc2UsXG5cdFx0XHRcdHZpc3VhbFNldHRpbmdzOiB7IHdpZHRoQ2FsY3VsYXRpb246IG51bGwgfSxcblx0XHRcdFx0cHJvcGVydGllczogbWFuaWZlc3RDb2x1bW4ucHJvcGVydGllc1xuXHRcdFx0fTtcblx0XHRcdGlmIChwcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRcdF91cGRhdGVMaW5rZWRQcm9wZXJ0aWVzT25DdXN0b21Db2x1bW5zKHByb3BlcnR5SW5mb3MsIGFubm90YXRpb25Db2x1bW5zKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzU2xvdENvbHVtbihtYW5pZmVzdENvbHVtbikpIHtcblx0XHRcdFx0Y29uc3QgY3VzdG9tVGFibGVDb2x1bW46IEN1c3RvbUVsZW1lbnQ8Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbj4gPSB7XG5cdFx0XHRcdFx0Li4uYmFzZU1hbmlmZXN0Q29sdW1uLFxuXHRcdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuU2xvdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IGN1c3RvbVRhYmxlQ29sdW1uO1xuXHRcdFx0fSBlbHNlIGlmIChpc0N1c3RvbUNvbHVtbihtYW5pZmVzdENvbHVtbikpIHtcblx0XHRcdFx0Y29uc3QgY3VzdG9tVGFibGVDb2x1bW46IEN1c3RvbUVsZW1lbnQ8Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbj4gPSB7XG5cdFx0XHRcdFx0Li4uYmFzZU1hbmlmZXN0Q29sdW1uLFxuXHRcdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuRGVmYXVsdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IGN1c3RvbVRhYmxlQ29sdW1uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IGBUaGUgYW5ub3RhdGlvbiBjb2x1bW4gJyR7a2V5fScgcmVmZXJlbmNlZCBpbiB0aGUgbWFuaWZlc3QgaXMgbm90IGZvdW5kYDtcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0LmFkZElzc3VlKFxuXHRcdFx0XHRcdFx0SXNzdWVDYXRlZ29yeS5NYW5pZmVzdCxcblx0XHRcdFx0XHRcdElzc3VlU2V2ZXJpdHkuTG93LFxuXHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnlUeXBlLFxuXHRcdFx0XHRcdFx0SXNzdWVDYXRlZ29yeVR5cGU/LkFubm90YXRpb25Db2x1bW5zPy5JbnZhbGlkS2V5XG5cdFx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGludGVybmFsQ29sdW1ucztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMTNuTW9kZShcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb25cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlcjogTWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgYVBlcnNvbmFsaXphdGlvbjogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgaXNBbmFseXRpY2FsVGFibGUgPSB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiO1xuXHRjb25zdCBpc1Jlc3BvbnNpdmVUYWJsZSA9IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdGlmICh0YWJsZU1hbmlmZXN0U2V0dGluZ3M/LnRhYmxlU2V0dGluZ3M/LnBlcnNvbmFsaXphdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gUGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdFx0Y29uc3QgcGVyc29uYWxpemF0aW9uID0gdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MucGVyc29uYWxpemF0aW9uO1xuXHRcdGlmIChwZXJzb25hbGl6YXRpb24gPT09IHRydWUpIHtcblx0XHRcdC8vIFRhYmxlIHBlcnNvbmFsaXphdGlvbiBmdWxseSBlbmFibGVkLlxuXHRcdFx0c3dpdGNoICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJBbmFseXRpY2FsVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXAsQWdncmVnYXRlXCI7XG5cdFx0XHRcdGNhc2UgXCJSZXNwb25zaXZlVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXBcIjtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXJcIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdC8vIFNwZWNpZmljIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGVuYWJsZWQgaW4gbWFuaWZlc3QuIFVzZSB0aGVtIGFzIGlzLlxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5zb3J0KSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmNvbHVtbikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmZpbHRlcikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJGaWx0ZXJcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmdyb3VwICYmIChpc0FuYWx5dGljYWxUYWJsZSB8fCBpc1Jlc3BvbnNpdmVUYWJsZSkpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmFnZ3JlZ2F0ZSAmJiBpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5sZW5ndGggPiAwID8gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKSA6IHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gTm8gcGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KSB7XG5cdFx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sIHx8IF9pc0ZpbHRlckJhckhpZGRlbihtYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQpKSB7XG5cdFx0XHRcdC8vIEZlYXR1cmUgcGFyaXR5IHdpdGggVjIuXG5cdFx0XHRcdC8vIEVuYWJsZSB0YWJsZSBmaWx0ZXJpbmcgYnkgZGVmYXVsdCBvbmx5IGluIGNhc2Ugb2YgQ29udHJvbCBsZXZlbCB2YXJpYW50IG1hbmFnZW1lbnQuXG5cdFx0XHRcdC8vIE9yIHdoZW4gdGhlIExSIGZpbHRlciBiYXIgaXMgaGlkZGVuIHZpYSBtYW5pZmVzdCBzZXR0aW5nXG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkZpbHRlclwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiRmlsdGVyXCIpO1xuXHRcdH1cblxuXHRcdGlmIChpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0fVxuXHRcdGlmIChpc1Jlc3BvbnNpdmVUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0fVxuXHRcdHJldHVybiBhUGVyc29uYWxpemF0aW9uLmpvaW4oXCIsXCIpO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIEJvb2xlYW4gdmFsdWUgc3VnZ2VzdGluZyBpZiBhIGZpbHRlciBiYXIgaXMgYmVpbmcgdXNlZCBvbiB0aGUgcGFnZS5cbiAqXG4gKiBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuICogVW50aWwgdGhlbiwgaGlkaW5nIGZpbHRlciBiYXIgaXMgbm93IGFsbG93ZWQgaWYgYSBjaGFydCBpcyBiZWluZyB1c2VkIG9uIExSLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdFdyYXBwZXIgTWFuaWZlc3Qgc2V0dGluZ3MgZ2V0dGVyIGZvciB0aGUgcGFnZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQm9vbGVhbiBzdWdnZXN0aW5nIGlmIGEgZmlsdGVyIGJhciBpcyBiZWluZyB1c2VkIG9uIHRoZSBwYWdlLlxuICovXG5mdW5jdGlvbiBfaXNGaWx0ZXJCYXJIaWRkZW4obWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRtYW5pZmVzdFdyYXBwZXIuaXNGaWx0ZXJCYXJIaWRkZW4oKSAmJlxuXHRcdCFjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSAmJlxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyB0aGUgc29ydCBjb25kaXRpb25zIGZvciB0aGUgcHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25cbiAqIEBwYXJhbSBjb2x1bW5zIFRhYmxlIGNvbHVtbnMgcHJvY2Vzc2VkIGJ5IHRoZSBjb252ZXJ0ZXJcbiAqIEByZXR1cm5zIFNvcnQgY29uZGl0aW9ucyBmb3IgYSBwcmVzZW50YXRpb24gdmFyaWFudC5cbiAqL1xuZnVuY3Rpb24gZ2V0U29ydENvbmRpdGlvbnMoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Ly8gQ3VycmVudGx5IG5hdmlnYXRpb24gcHJvcGVydHkgaXMgbm90IHN1cHBvcnRlZCBhcyBzb3J0ZXJcblx0Y29uc3Qgbm9uU29ydGFibGVQcm9wZXJ0aWVzID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpO1xuXHRsZXQgc29ydENvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Tb3J0T3JkZXIpIHtcblx0XHRjb25zdCBzb3J0ZXJzOiBTb3J0ZXJUeXBlW10gPSBbXTtcblx0XHRjb25zdCBjb25kaXRpb25zID0ge1xuXHRcdFx0c29ydGVyczogc29ydGVyc1xuXHRcdH07XG5cdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uU29ydE9yZGVyLmZvckVhY2goKGNvbmRpdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uUHJvcGVydHkgPSBjb25kaXRpb24uUHJvcGVydHk7XG5cdFx0XHRpZiAoY29uZGl0aW9uUHJvcGVydHkgJiYgbm9uU29ydGFibGVQcm9wZXJ0aWVzLmluZGV4T2YoY29uZGl0aW9uUHJvcGVydHkuJHRhcmdldD8ubmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdGNvbnN0IGluZm9OYW1lID0gY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhbY29uZGl0aW9uUHJvcGVydHldLCBjb2x1bW5zKVswXTtcblx0XHRcdFx0aWYgKGluZm9OYW1lKSB7XG5cdFx0XHRcdFx0Y29uZGl0aW9ucy5zb3J0ZXJzLnB1c2goe1xuXHRcdFx0XHRcdFx0bmFtZTogaW5mb05hbWUsXG5cdFx0XHRcdFx0XHRkZXNjZW5kaW5nOiAhIWNvbmRpdGlvbi5EZXNjZW5kaW5nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRzb3J0Q29uZGl0aW9ucyA9IGNvbmRpdGlvbnMuc29ydGVycy5sZW5ndGggPyBKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSA6IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gc29ydENvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxFeHBhbnNpb25MZXZlbChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRpZiAoIXByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IGxldmVsID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uSW5pdGlhbEV4cGFuc2lvbkxldmVsPy52YWx1ZU9mKCk7XG5cblx0cmV0dXJuIHR5cGVvZiBsZXZlbCA9PT0gXCJudW1iZXJcIiA/IGxldmVsIDogdW5kZWZpbmVkO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBwcm9wZXJ0eVBhdGggdG8gYW4gYXJyYXkgb2YgcHJvcGVydHlJbmZvIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwYXRocyB0aGUgYXJyYXkgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0gY29sdW1ucyB0aGUgYXJyYXkgb2YgcHJvcGVydHlJbmZvc1xuICogQHJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHlJbmZvIG5hbWVzXG4gKi9cblxuZnVuY3Rpb24gY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhwYXRoczogUHJvcGVydHlQYXRoW10sIGNvbHVtbnM6IFRhYmxlQ29sdW1uW10pOiBzdHJpbmdbXSB7XG5cdGNvbnN0IGluZm9OYW1lczogc3RyaW5nW10gPSBbXTtcblx0bGV0IHByb3BlcnR5SW5mbzogVGFibGVDb2x1bW4gfCB1bmRlZmluZWQsIGFubm90YXRpb25Db2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0cGF0aHMuZm9yRWFjaCgoY3VycmVudFBhdGgpID0+IHtcblx0XHRpZiAoY3VycmVudFBhdGg/LnZhbHVlKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8gPSBjb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4ge1xuXHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRcdFx0cmV0dXJuICFhbm5vdGF0aW9uQ29sdW1uLnByb3BlcnR5SW5mb3MgJiYgYW5ub3RhdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IGN1cnJlbnRQYXRoPy52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRpbmZvTmFtZXMucHVzaChwcm9wZXJ0eUluZm8ubmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gaW5mb05hbWVzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IGdyb3VwIGNvbmRpdGlvbnMuXG4gKlxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25cbiAqIEBwYXJhbSBjb2x1bW5zIENvbnZlcnRlciBwcm9jZXNzZWQgdGFibGUgY29sdW1uc1xuICogQHBhcmFtIHRhYmxlVHlwZSBUaGUgdGFibGUgdHlwZS5cbiAqIEByZXR1cm5zIEdyb3VwIGNvbmRpdGlvbnMgZm9yIGEgUHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEdyb3VwQ29uZGl0aW9ucyhcblx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlIHwgdW5kZWZpbmVkLFxuXHRjb2x1bW5zOiBUYWJsZUNvbHVtbltdLFxuXHR0YWJsZVR5cGU6IHN0cmluZ1xuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IGdyb3VwQ29uZGl0aW9uczogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpZiAocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/Lkdyb3VwQnkpIHtcblx0XHRsZXQgYUdyb3VwQnkgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5Hcm91cEJ5O1xuXHRcdGlmICh0YWJsZVR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRcdGFHcm91cEJ5ID0gYUdyb3VwQnkuc2xpY2UoMCwgMSk7XG5cdFx0fVxuXHRcdGNvbnN0IGFHcm91cExldmVscyA9IGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMoYUdyb3VwQnksIGNvbHVtbnMpLm1hcCgoaW5mb05hbWUpID0+IHtcblx0XHRcdHJldHVybiB7IG5hbWU6IGluZm9OYW1lIH07XG5cdFx0fSk7XG5cblx0XHRncm91cENvbmRpdGlvbnMgPSBhR3JvdXBMZXZlbHMubGVuZ3RoID8gSlNPTi5zdHJpbmdpZnkoeyBncm91cExldmVsczogYUdyb3VwTGV2ZWxzIH0pIDogdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiBncm91cENvbmRpdGlvbnM7XG59XG4vKipcbiAqIFVwZGF0ZXMgdGhlIGNvbHVtbidzIHByb3BlcnR5SW5mb3Mgb2YgYSBhbmFseXRpY2FsIHRhYmxlIGludGVncmF0aW5nIGFsbCBleHRlbnNpb25zIGFuZCBiaW5kaW5nLXJlbGV2YW50IHByb3BlcnR5IGluZm8gcGFydC5cbiAqXG4gKiBAcGFyYW0gdGFibGVWaXN1YWxpemF0aW9uIFRoZSB2aXN1YWxpemF0aW9uIHRvIGJlIHVwZGF0ZWRcbiAqL1xuXG5mdW5jdGlvbiBfdXBkYXRlUHJvcGVydHlJbmZvc1dpdGhBZ2dyZWdhdGVzRGVmaW5pdGlvbnModGFibGVWaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24pIHtcblx0Y29uc3QgcmVsYXRlZEFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRjb25zdCBhZ2dyZWdhdGFibGVQcm9wZXJ0eU5hbWUgPSBPYmplY3Qua2V5cyh0YWJsZVZpc3VhbGl6YXRpb24uYWdncmVnYXRlcyEpLmZpbmQoKGFnZ3JlZ2F0ZSkgPT4gYWdncmVnYXRlID09PSBjb2x1bW4ubmFtZSk7XG5cdFx0aWYgKGFnZ3JlZ2F0YWJsZVByb3BlcnR5TmFtZSkge1xuXHRcdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlEZWZpbml0aW9uID0gdGFibGVWaXN1YWxpemF0aW9uLmFnZ3JlZ2F0ZXMhW2FnZ3JlZ2F0YWJsZVByb3BlcnR5TmFtZV07XG5cdFx0XHRjb2x1bW4uYWdncmVnYXRhYmxlID0gdHJ1ZTtcblx0XHRcdGNvbHVtbi5leHRlbnNpb24gPSB7XG5cdFx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZTogYWdncmVnYXRhYmxlUHJvcGVydHlEZWZpbml0aW9uLmRlZmF1bHRBZ2dyZWdhdGUgPz8ge31cblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3M/Lmxlbmd0aCkge1xuXHRcdFx0Y29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zLmZvckVhY2goKGFkZGl0aW9uYWxQcm9wZXJ0eUluZm8pID0+IHtcblx0XHRcdFx0Ly8gQ3JlYXRlIHByb3BlcnR5SW5mbyBmb3IgZWFjaCBhZGRpdGlvbmFsIHByb3BlcnR5LlxuXHRcdFx0XHQvLyBUaGUgbmV3IHByb3BlcnR5ICduYW1lJyBoYXMgYmVlbiBwcmVmaXhlZCB3aXRoICdQcm9wZXJ0eV9UZWNobmljYWw6OicgZm9yIHVuaXF1ZW5lc3MgYW5kIGl0IGhhcyBiZWVuIG5hbWVkIHRlY2huaWNhbCBwcm9wZXJ0eSBhcyBpdCByZXF1aXJlcyBkZWRpY2F0ZWQgTURDIGF0dHJpYnV0ZXMgKHRlY2huaWNhbGx5R3JvdXBhYmxlIGFuZCB0ZWNobmljYWxseUFnZ3JlZ2F0YWJsZSkuXG5cdFx0XHRcdGNyZWF0ZVRlY2huaWNhbFByb3BlcnR5KGFkZGl0aW9uYWxQcm9wZXJ0eUluZm8sIHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLCByZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHR0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcblx0XHRjb2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdGlmIChjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MpIHtcblx0XHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcy5tYXAoXG5cdFx0XHRcdChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwW3Byb3BlcnR5SW5mb10gPz8gcHJvcGVydHlJbmZvXG5cdFx0XHQpO1xuXHRcdFx0Ly8gQWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byB0aGUgY29tcGxleCBwcm9wZXJ0eSB1c2luZyB0aGUgaGlkZGVuIGFubm90YXRpb24uXG5cdFx0XHRjb2x1bW4ucHJvcGVydHlJbmZvcyA9IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5jb25jYXQoY29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zKTtcblx0XHR9XG5cdH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IGFnZ3JlZ2F0ZSBjb25kaXRpb25zLlxuICpcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBDb252ZXJ0ZXIgcHJvY2Vzc2VkIHRhYmxlIGNvbHVtbnNcbiAqIEByZXR1cm5zIEdyb3VwIGNvbmRpdGlvbnMgZm9yIGEgUHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEFnZ3JlZ2F0ZUNvbmRpdGlvbnMoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IGFnZ3JlZ2F0ZUNvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Ub3RhbCkge1xuXHRcdGNvbnN0IGFUb3RhbHMgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5Ub3RhbDtcblx0XHRjb25zdCBhZ2dyZWdhdGVzOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+ID0ge307XG5cdFx0Y29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhhVG90YWxzLCBjb2x1bW5zKS5mb3JFYWNoKChpbmZvTmFtZSkgPT4ge1xuXHRcdFx0YWdncmVnYXRlc1tpbmZvTmFtZV0gPSB7fTtcblx0XHR9KTtcblxuXHRcdGFnZ3JlZ2F0ZUNvbmRpdGlvbnMgPSBKU09OLnN0cmluZ2lmeShhZ2dyZWdhdGVzKTtcblx0fVxuXG5cdHJldHVybiBhZ2dyZWdhdGVDb25kaXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uXG4pOiBUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uIHtcblx0Ly8gTmVlZCB0byBnZXQgdGhlIHRhcmdldFxuXHRjb25zdCB7IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggfSA9IHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHR5cGVOYW1lUGx1cmFsID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0RW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlR5cGVOYW1lUGx1cmFsO1xuXHRjb25zdCB0aXRsZSA9IHR5cGVOYW1lUGx1cmFsICYmIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih0eXBlTmFtZVBsdXJhbCkpO1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRFbnRpdHlTZXQ7XG5cdGNvbnN0IHBhZ2VNYW5pZmVzdFNldHRpbmdzOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBoYXNBYnNvbHV0ZVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCA9PT0gMCxcblx0XHRwMTNuTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKSxcblx0XHRpZCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPyBnZXRUYWJsZUlEKHZpc3VhbGl6YXRpb25QYXRoKSA6IGdldFRhYmxlSUQoY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpLCBcIkxpbmVJdGVtXCIpO1xuXHRjb25zdCB0YXJnZXRDYXBhYmlsaXRpZXMgPSBnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24oY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG5hdmlnYXRpb25UYXJnZXRQYXRoID0gZ2V0TmF2aWdhdGlvblRhcmdldFBhdGgoY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aCk7XG5cdGNvbnN0IG5hdmlnYXRpb25TZXR0aW5ncyA9IHBhZ2VNYW5pZmVzdFNldHRpbmdzLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25UYXJnZXRQYXRoKTtcblx0Y29uc3QgY3JlYXRpb25CZWhhdmlvdXIgPSBfZ2V0Q3JlYXRpb25CZWhhdmlvdXIoXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdHZpc3VhbGl6YXRpb25QYXRoXG5cdCk7XG5cdGNvbnN0IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQgPSBnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQoXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRjcmVhdGlvbkJlaGF2aW91ci5tb2RlIGFzIENyZWF0aW9uTW9kZSxcblx0XHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0XHR2aWV3Q29uZmlndXJhdGlvblxuXHQpO1xuXG5cdGNvbnN0IGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gZ2V0RGVsZXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0Y29uc3QgbWFzc0VkaXRCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiA9IGdldE1hc3NFZGl0VmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0Y29uc3QgaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQgPSBnZXRJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGluZyhzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQoY29udmVydGVyQ29udGV4dCkpO1xuXG5cdGNvbnN0IHNlbGVjdGlvbk1vZGUgPSBnZXRTZWxlY3Rpb25Nb2RlKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGhhc0Fic29sdXRlUGF0aCxcblx0XHR0YXJnZXRDYXBhYmlsaXRpZXMsXG5cdFx0ZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24sXG5cdFx0bWFzc0VkaXRCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvblxuXHQpO1xuXHRsZXQgdGhyZXNob2xkID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aCA/IDEwIDogMzA7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj8uTWF4SXRlbXMpIHtcblx0XHR0aHJlc2hvbGQgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5NYXhJdGVtcy52YWx1ZU9mKCkgYXMgbnVtYmVyO1xuXHR9XG5cblx0Y29uc3QgdmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZSA9IHBhZ2VNYW5pZmVzdFNldHRpbmdzLmdldFZhcmlhbnRNYW5hZ2VtZW50KCk7XG5cdGNvbnN0IGlzU2VhcmNoYWJsZSA9IGlzUGF0aFNlYXJjaGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRjb25zdCBzdGFuZGFyZEFjdGlvbnMgPSB7XG5cdFx0Y3JlYXRlOiBnZXRTdGFuZGFyZEFjdGlvbkNyZWF0ZShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KSxcblx0XHRkZWxldGU6IGdldFN0YW5kYXJkQWN0aW9uRGVsZXRlKGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdHBhc3RlOiBnZXRTdGFuZGFyZEFjdGlvblBhc3RlKGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkKSxcblx0XHRtYXNzRWRpdDogZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KSxcblx0XHRjcmVhdGlvblJvdzogZ2V0Q3JlYXRpb25Sb3coY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dClcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBpZCxcblx0XHRlbnRpdHlOYW1lOiBlbnRpdHlTZXQgPyBlbnRpdHlTZXQubmFtZSA6IFwiXCIsXG5cdFx0Y29sbGVjdGlvbjogZ2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSksXG5cdFx0bmF2aWdhdGlvblBhdGg6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0cm93OiBfZ2V0Um93Q29uZmlndXJhdGlvblByb3BlcnR5KFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdG5hdmlnYXRpb25TZXR0aW5ncyxcblx0XHRcdG5hdmlnYXRpb25UYXJnZXRQYXRoLFxuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24udHlwZVxuXHRcdCksXG5cdFx0cDEzbk1vZGU6IHAxM25Nb2RlLFxuXHRcdHN0YW5kYXJkQWN0aW9uczoge1xuXHRcdFx0YWN0aW9uczogc3RhbmRhcmRBY3Rpb25zLFxuXHRcdFx0aXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQ6IGlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkLFxuXHRcdFx0dXBkYXRhYmxlUHJvcGVydHlQYXRoOiBnZXRDdXJyZW50RW50aXR5U2V0VXBkYXRhYmxlUGF0aChjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdH0sXG5cdFx0ZGlzcGxheU1vZGU6IGlzSW5EaXNwbGF5TW9kZShjb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29uZmlndXJhdGlvbiksXG5cdFx0Y3JlYXRlOiBjcmVhdGlvbkJlaGF2aW91cixcblx0XHRzZWxlY3Rpb25Nb2RlOiBzZWxlY3Rpb25Nb2RlLFxuXHRcdGF1dG9CaW5kT25Jbml0OlxuXHRcdFx0X2lzRmlsdGVyQmFySGlkZGVuKHBhZ2VNYW5pZmVzdFNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0KSB8fFxuXHRcdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0ICYmXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UgJiZcblx0XHRcdFx0ISh2aWV3Q29uZmlndXJhdGlvbiAmJiBwYWdlTWFuaWZlc3RTZXR0aW5ncy5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKHZpZXdDb25maWd1cmF0aW9uKSkpLFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIgJiYgIXAxM25Nb2RlID8gVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmUgOiB2YXJpYW50TWFuYWdlbWVudCxcblx0XHR0aHJlc2hvbGQ6IHRocmVzaG9sZCxcblx0XHRzb3J0Q29uZGl0aW9uczogZ2V0U29ydENvbmRpdGlvbnMoY29udmVydGVyQ29udGV4dCwgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIGNvbHVtbnMpLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHRzZWFyY2hhYmxlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlICE9PSBcIkFuYWx5dGljYWxUYWJsZVwiICYmICEoaXNDb25zdGFudChpc1NlYXJjaGFibGUpICYmIGlzU2VhcmNoYWJsZS52YWx1ZSA9PT0gZmFsc2UpLFxuXHRcdGluaXRpYWxFeHBhbnNpb25MZXZlbDogZ2V0SW5pdGlhbEV4cGFuc2lvbkxldmVsKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uKVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0RXhwb3J0RGF0YVR5cGUoZGF0YVR5cGU6IHN0cmluZywgaXNDb21wbGV4UHJvcGVydHkgPSBmYWxzZSk6IHN0cmluZyB7XG5cdGxldCBleHBvcnREYXRhVHlwZSA9IFwiU3RyaW5nXCI7XG5cdGlmIChpc0NvbXBsZXhQcm9wZXJ0eSkge1xuXHRcdGlmIChkYXRhVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkRhdGVUaW1lXCI7XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnREYXRhVHlwZTtcblx0fSBlbHNlIHtcblx0XHRzd2l0Y2ggKGRhdGFUeXBlKSB7XG5cdFx0XHRjYXNlIFwiRWRtLkRlY2ltYWxcIjpcblx0XHRcdGNhc2UgXCJFZG0uSW50MzJcIjpcblx0XHRcdGNhc2UgXCJFZG0uSW50NjRcIjpcblx0XHRcdGNhc2UgXCJFZG0uRG91YmxlXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkJ5dGVcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIk51bWJlclwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZU9mVGltZVwiOlxuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJEYXRlXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiRGF0ZVRpbWVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiVGltZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiQm9vbGVhblwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJTdHJpbmdcIjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGV4cG9ydERhdGFUeXBlO1xufVxuXG4vKipcbiAqIFNwbGl0IHRoZSB2aXN1YWxpemF0aW9uIHBhdGggaW50byB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBwYXRoIGFuZCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHJldHVybnMgVGhlIHNwbGl0IHBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IFt0YXJnZXROYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBhbm5vdGF0aW9uUGF0aF0gPSB2aXN1YWxpemF0aW9uUGF0aC5zcGxpdChcIkBcIik7XG5cdGxldCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gdGFyZ2V0TmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHQvLyBEcm9wIHRyYWlsaW5nIHNsYXNoXG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGguc3Vic3RyKDAsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSk7XG5cdH1cblx0cmV0dXJuIHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgYW5ub3RhdGlvblBhdGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uKFxuXHRzZWxlY3Rpb25WYXJpYW50UGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzZWxlY3Rpb25WYXJpYW50UGF0aCk7XG5cdGNvbnN0IHNlbGVjdGlvbjogU2VsZWN0aW9uVmFyaWFudFR5cGUgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIFNlbGVjdGlvblZhcmlhbnRUeXBlO1xuXG5cdGlmIChzZWxlY3Rpb24pIHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdHNlbGVjdGlvbi5TZWxlY3RPcHRpb25zPy5mb3JFYWNoKChzZWxlY3RPcHRpb246IFNlbGVjdE9wdGlvblR5cGUpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWU7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGg6IHN0cmluZyA9IHByb3BlcnR5TmFtZT8udmFsdWUgPz8gXCJcIjtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWVzLmluZGV4T2YocHJvcGVydHlQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0cHJvcGVydHlOYW1lcy5wdXNoKHByb3BlcnR5UGF0aCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRleHQ6IHNlbGVjdGlvbj8uVGV4dD8udG9TdHJpbmcoKSxcblx0XHRcdHByb3BlcnR5TmFtZXM6IHByb3BlcnR5TmFtZXNcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9nZXRGdWxsU2NyZWVuQmFzZWRPbkRldmljZShcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNJcGhvbmU6IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuXHQvLyBJZiBlbmFibGVGdWxsU2NyZWVuIGlzIG5vdCBzZXQsIHVzZSBhcyBkZWZhdWx0IHRydWUgb24gcGhvbmUgYW5kIGZhbHNlIG90aGVyd2lzZVxuXHRsZXQgZW5hYmxlRnVsbFNjcmVlbiA9IHRhYmxlU2V0dGluZ3MuZW5hYmxlRnVsbFNjcmVlbiA/PyBpc0lwaG9uZTtcblx0Ly8gTWFrZSBzdXJlIHRoYXQgZW5hYmxlRnVsbFNjcmVlbiBpcyBub3Qgc2V0IG9uIExpc3RSZXBvcnQgZm9yIGRlc2t0b3Agb3IgdGFibGV0XG5cdGlmICghaXNJcGhvbmUgJiYgZW5hYmxlRnVsbFNjcmVlbiAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCkge1xuXHRcdGVuYWJsZUZ1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERpYWdub3N0aWNzKCkuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5NYW5pZmVzdCwgSXNzdWVTZXZlcml0eS5Mb3csIElzc3VlVHlwZS5GVUxMU0NSRUVOTU9ERV9OT1RfT05fTElTVFJFUE9SVCk7XG5cdH1cblx0cmV0dXJuIGVuYWJsZUZ1bGxTY3JlZW47XG59XG5cbmZ1bmN0aW9uIF9nZXRNdWx0aVNlbGVjdE1vZGUoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRsZXQgbXVsdGlTZWxlY3RNb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGlmICh0YWJsZVR5cGUgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHN3aXRjaCAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSkge1xuXHRcdGNhc2UgVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQ6XG5cdFx0Y2FzZSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlOlxuXHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gIXRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlOlxuXHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gdGFibGVTZXR0aW5ncy5zZWxlY3RBbGwgPT09IGZhbHNlID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS51c2VJY29uVGFiQmFyKCkpIHtcblx0XHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gIXRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHR9XG5cblx0cmV0dXJuIG11bHRpU2VsZWN0TW9kZTtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlVHlwZShcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0YWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBUYWJsZVR5cGUge1xuXHRsZXQgdGFibGVUeXBlID0gdGFibGVTZXR0aW5ncz8udHlwZSB8fCBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHQvKiAgTm93LCB3ZSBrZWVwIHRoZSBjb25maWd1cmF0aW9uIGluIHRoZSBtYW5pZmVzdCwgZXZlbiBpZiBpdCBsZWFkcyB0byBlcnJvcnMuXG5cdFx0V2Ugb25seSBjaGFuZ2UgaWYgd2UncmUgbm90IG9uIGRlc2t0b3AgZnJvbSBBbmFseXRpY2FsL1RyZWUgdG8gUmVzcG9uc2l2ZS5cblx0ICovXG5cdGlmICgodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiIHx8IHRhYmxlVHlwZSA9PT0gXCJUcmVlVGFibGVcIikgJiYgIWNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaXNEZXNrdG9wKCkpIHtcblx0XHR0YWJsZVR5cGUgPSBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHR9XG5cdHJldHVybiB0YWJsZVR5cGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRHcmlkVGFibGVNb2RlKFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0aXNUZW1wbGF0ZUxpc3RSZXBvcnQ6IGJvb2xlYW5cbik6IHsgcm93Q291bnRNb2RlPzogR3JpZFRhYmxlUm93Q291bnRNb2RlOyByb3dDb3VudD86IG51bWJlciB9IHtcblx0aWYgKHRhYmxlVHlwZSA9PT0gXCJHcmlkVGFibGVcIikge1xuXHRcdGlmIChpc1RlbXBsYXRlTGlzdFJlcG9ydCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cm93Q291bnRNb2RlOiBcIkF1dG9cIixcblx0XHRcdFx0cm93Q291bnQ6IDNcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJvd0NvdW50TW9kZTogdGFibGVTZXR0aW5ncy5yb3dDb3VudE1vZGUgPz8gXCJGaXhlZFwiLFxuXHRcdFx0XHRyb3dDb3VudDogdGFibGVTZXR0aW5ncy5yb3dDb3VudCA/IHRhYmxlU2V0dGluZ3Mucm93Q291bnQgOiA1XG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge307XG5cdH1cbn1cblxuZnVuY3Rpb24gX2dldENvbmRlbnNlZFRhYmxlTGF5b3V0KF90YWJsZVR5cGU6IFRhYmxlVHlwZSwgX3RhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24pOiBib29sZWFuIHtcblx0cmV0dXJuIF90YWJsZVNldHRpbmdzLmNvbmRlbnNlZFRhYmxlTGF5b3V0ICE9PSB1bmRlZmluZWQgJiYgX3RhYmxlVHlwZSAhPT0gXCJSZXNwb25zaXZlVGFibGVcIlxuXHRcdD8gX3RhYmxlU2V0dGluZ3MuY29uZGVuc2VkVGFibGVMYXlvdXRcblx0XHQ6IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfZ2V0VGFibGVTZWxlY3Rpb25MaW1pdChfdGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbik6IG51bWJlciB7XG5cdHJldHVybiBfdGFibGVTZXR0aW5ncy5zZWxlY3RBbGwgPT09IHRydWUgfHwgX3RhYmxlU2V0dGluZ3Muc2VsZWN0aW9uTGltaXQgPT09IDAgPyAwIDogX3RhYmxlU2V0dGluZ3Muc2VsZWN0aW9uTGltaXQgfHwgMjAwO1xufVxuXG5mdW5jdGlvbiBfZ2V0VGFibGVJbmxpbmVDcmVhdGlvblJvd0NvdW50KF90YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uKTogbnVtYmVyIHtcblx0cmV0dXJuIF90YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uaW5saW5lQ3JlYXRpb25Sb3dDb3VudCA/IF90YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uaW5saW5lQ3JlYXRpb25Sb3dDb3VudCA6IDI7XG59XG5cbmZ1bmN0aW9uIF9nZXRGaWx0ZXJzKFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRxdWlja0ZpbHRlclBhdGhzOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfVtdLFxuXHRxdWlja1NlbGVjdGlvblZhcmlhbnQ6IHVua25vd24sXG5cdHBhdGg6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9LFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pIHtcblx0aWYgKHF1aWNrU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHF1aWNrRmlsdGVyUGF0aHMucHVzaCh7IGFubm90YXRpb25QYXRoOiBwYXRoLmFubm90YXRpb25QYXRoIH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0cXVpY2tGaWx0ZXJzOiB7XG5cdFx0XHRlbmFibGVkOiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCxcblx0XHRcdHNob3dDb3VudHM6IHRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uc2hvd0NvdW50cyxcblx0XHRcdHBhdGhzOiBxdWlja0ZpbHRlclBhdGhzXG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0RW5hYmxlRXhwb3J0KFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRlbmFibGVQYXN0ZTogYm9vbGVhblxuKTogYm9vbGVhbiB7XG5cdHJldHVybiB0YWJsZVNldHRpbmdzLmVuYWJsZUV4cG9ydCAhPT0gdW5kZWZpbmVkXG5cdFx0PyB0YWJsZVNldHRpbmdzLmVuYWJsZUV4cG9ydFxuXHRcdDogY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSAhPT0gXCJPYmplY3RQYWdlXCIgfHwgZW5hYmxlUGFzdGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRGaWx0ZXJDb25maWd1cmF0aW9uKFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pIHtcblx0aWYgKCFsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0Y29uc3QgcXVpY2tGaWx0ZXJQYXRoczogeyBhbm5vdGF0aW9uUGF0aDogc3RyaW5nIH1bXSA9IFtdO1xuXHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pO1xuXHRsZXQgcXVpY2tTZWxlY3Rpb25WYXJpYW50O1xuXHRsZXQgZmlsdGVycztcblx0dGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5wYXRocz8uZm9yRWFjaCgocGF0aDogeyBhbm5vdGF0aW9uUGF0aDogc3RyaW5nIH0pID0+IHtcblx0XHRxdWlja1NlbGVjdGlvblZhcmlhbnQgPSB0YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdGZpbHRlcnMgPSBfZ2V0RmlsdGVycyh0YWJsZVNldHRpbmdzLCBxdWlja0ZpbHRlclBhdGhzLCBxdWlja1NlbGVjdGlvblZhcmlhbnQsIHBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9KTtcblxuXHRsZXQgaGlkZVRhYmxlVGl0bGUgPSBmYWxzZTtcblx0aGlkZVRhYmxlVGl0bGUgPSAhIXRhYmxlU2V0dGluZ3MucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5oaWRlVGFibGVUaXRsZTtcblx0cmV0dXJuIHtcblx0XHRmaWx0ZXJzOiBmaWx0ZXJzLFxuXHRcdGhlYWRlclZpc2libGU6ICEocXVpY2tTZWxlY3Rpb25WYXJpYW50ICYmIGhpZGVUYWJsZVRpdGxlKVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0Q29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzKHJlbGF0aXZlUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksIHJlbGF0aXZlUGF0aCkubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydGllcz8ubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVsczogc3RyaW5nW10gPSBbXTtcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChuYXZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzLnB1c2goZ2V0TGFiZWwobmF2UHJvcGVydHkpIHx8IG5hdlByb3BlcnR5Lm5hbWUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHM7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRjaGVja0NvbmRlbnNlZExheW91dCA9IGZhbHNlXG4pOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uIHtcblx0Y29uc3QgX21hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5nczogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCB0YWJsZVNldHRpbmdzID0gKHRhYmxlTWFuaWZlc3RTZXR0aW5ncyAmJiB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncykgfHwge307XG5cdGNvbnN0IGNyZWF0aW9uTW9kZSA9IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5uYW1lIHx8IENyZWF0aW9uTW9kZS5OZXdQYWdlO1xuXHRjb25zdCBlbmFibGVBdXRvQ29sdW1uV2lkdGggPSAhX21hbmlmZXN0V3JhcHBlci5pc1Bob25lKCk7XG5cdGNvbnN0IGVuYWJsZVBhc3RlID1cblx0XHR0YWJsZVNldHRpbmdzLmVuYWJsZVBhc3RlICE9PSB1bmRlZmluZWQgPyB0YWJsZVNldHRpbmdzLmVuYWJsZVBhc3RlIDogY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gXCJPYmplY3RQYWdlXCI7IC8vIFBhc3RlIGlzIGRpc2FibGVkIGJ5IGRlZmF1bHQgZXhjZXB0ZWQgZm9yIE9QXG5cdGNvbnN0IHRlbXBsYXRlVHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCk7XG5cdGNvbnN0IGRhdGFTdGF0ZUluZGljYXRvckZpbHRlciA9IHRlbXBsYXRlVHlwZSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQgPyBcIkFQSS5kYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXJcIiA6IHVuZGVmaW5lZDtcblx0Y29uc3QgaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCA9IGNoZWNrQ29uZGVuc2VkTGF5b3V0ICYmIF9tYW5pZmVzdFdyYXBwZXIuaXNDb25kZW5zZWRMYXlvdXRDb21wbGlhbnQoKTtcblx0Y29uc3Qgb0ZpbHRlckNvbmZpZ3VyYXRpb24gPSBfZ2V0RmlsdGVyQ29uZmlndXJhdGlvbih0YWJsZVNldHRpbmdzLCBsaW5lSXRlbUFubm90YXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPSB0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCB0YWJsZVR5cGU6IFRhYmxlVHlwZSA9IF9nZXRUYWJsZVR5cGUodGFibGVTZXR0aW5ncywgYWdncmVnYXRpb25IZWxwZXIsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBncmlkVGFibGVSb3dNb2RlID0gX2dldEdyaWRUYWJsZU1vZGUodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzLCB0ZW1wbGF0ZVR5cGUgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KTtcblx0Y29uc3QgY29uZGVuc2VkVGFibGVMYXlvdXQgPSBfZ2V0Q29uZGVuc2VkVGFibGVMYXlvdXQodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzKTtcblx0Y29uc3Qgb0NvbmZpZ3VyYXRpb24gPSB7XG5cdFx0Ly8gSWYgbm8gY3JlYXRlQXRFbmQgaXMgc3BlY2lmaWVkIGl0IHdpbGwgYmUgZmFsc2UgZm9yIElubGluZSBjcmVhdGUgYW5kIHRydWUgb3RoZXJ3aXNlXG5cdFx0Y3JlYXRlQXRFbmQ6XG5cdFx0XHR0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQ/IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jcmVhdGVBdEVuZFxuXHRcdFx0XHQ6IGNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZSxcblx0XHRjcmVhdGlvbk1vZGU6IGNyZWF0aW9uTW9kZSxcblx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb246IGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXI6IGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcixcblx0XHQvLyBpZiBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCwgaS5lLiBzZXQgdG8gZmFsc2Vcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhOiAhY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID8gISF0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSA6IGZhbHNlLFxuXHRcdGVuYWJsZUF1dG9Db2x1bW5XaWR0aDogZW5hYmxlQXV0b0NvbHVtbldpZHRoLFxuXHRcdGVuYWJsZUV4cG9ydDogX2dldEVuYWJsZUV4cG9ydCh0YWJsZVNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0LCBlbmFibGVQYXN0ZSksXG5cdFx0ZW5hYmxlRnVsbFNjcmVlbjogX2dldEZ1bGxTY3JlZW5CYXNlZE9uRGV2aWNlKHRhYmxlU2V0dGluZ3MsIGNvbnZlcnRlckNvbnRleHQsIF9tYW5pZmVzdFdyYXBwZXIuaXNQaG9uZSgpKSxcblx0XHRlbmFibGVNYXNzRWRpdDogdGFibGVTZXR0aW5ncz8uZW5hYmxlTWFzc0VkaXQsXG5cdFx0ZW5hYmxlUGFzdGU6IGVuYWJsZVBhc3RlLFxuXHRcdGhlYWRlclZpc2libGU6IHRydWUsXG5cdFx0bXVsdGlTZWxlY3RNb2RlOiBfZ2V0TXVsdGlTZWxlY3RNb2RlKHRhYmxlU2V0dGluZ3MsIHRhYmxlVHlwZSwgY29udmVydGVyQ29udGV4dCksXG5cdFx0c2VsZWN0aW9uTGltaXQ6IF9nZXRUYWJsZVNlbGVjdGlvbkxpbWl0KHRhYmxlU2V0dGluZ3MpLFxuXHRcdGlubGluZUNyZWF0aW9uUm93Q291bnQ6IF9nZXRUYWJsZUlubGluZUNyZWF0aW9uUm93Q291bnQodGFibGVTZXR0aW5ncyksXG5cdFx0aW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZTogdGFibGVTZXR0aW5ncz8uY3JlYXRpb25Nb2RlPy5pbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlID8/IGZhbHNlLFxuXHRcdHNob3dSb3dDb3VudDogIXRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uc2hvd0NvdW50cyAmJiAhX21hbmlmZXN0V3JhcHBlci5nZXRWaWV3Q29uZmlndXJhdGlvbigpPy5zaG93Q291bnRzLFxuXHRcdHR5cGU6IHRhYmxlVHlwZSxcblx0XHR1c2VDb25kZW5zZWRUYWJsZUxheW91dDogY29uZGVuc2VkVGFibGVMYXlvdXQgJiYgaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCxcblx0XHRpc0NvbXBhY3RUeXBlOiBfbWFuaWZlc3RXcmFwcGVyLmlzQ29tcGFjdFR5cGUoKVxuXHR9O1xuXG5cdGNvbnN0IHRhYmxlQ29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbiA9IHsgLi4ub0NvbmZpZ3VyYXRpb24sIC4uLmdyaWRUYWJsZVJvd01vZGUsIC4uLm9GaWx0ZXJDb25maWd1cmF0aW9uIH07XG5cblx0aWYgKHRhYmxlVHlwZSA9PT0gXCJUcmVlVGFibGVcIikge1xuXHRcdHRhYmxlQ29uZmlndXJhdGlvbi5oaWVyYXJjaHlRdWFsaWZpZXIgPSB0YWJsZVNldHRpbmdzLmhpZXJhcmNoeVF1YWxpZmllcjtcblx0fVxuXG5cdHJldHVybiB0YWJsZUNvbmZpZ3VyYXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlQ29uZmlnKG9Qcm9wZXJ0eTogUHJvcGVydHkgfCBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBkYXRhVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogUHJvcGVydHlUeXBlQ29uZmlnIHtcblx0bGV0IG9UYXJnZXRNYXBwaW5nO1xuXHRpZiAoaXNQcm9wZXJ0eShvUHJvcGVydHkpKSB7XG5cdFx0b1RhcmdldE1hcHBpbmcgPSBpc1R5cGVEZWZpbml0aW9uKG9Qcm9wZXJ0eS50YXJnZXRUeXBlKVxuXHRcdFx0PyBFRE1fVFlQRV9NQVBQSU5HW29Qcm9wZXJ0eS50YXJnZXRUeXBlLnVuZGVybHlpbmdUeXBlXVxuXHRcdFx0OiBFRE1fVFlQRV9NQVBQSU5HW29Qcm9wZXJ0eS50eXBlXTtcblx0fVxuXHRpZiAob1RhcmdldE1hcHBpbmcgPT09IHVuZGVmaW5lZCAmJiBkYXRhVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0b1RhcmdldE1hcHBpbmcgPSBFRE1fVFlQRV9NQVBQSU5HW2RhdGFUeXBlXTtcblx0fVxuXG5cdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZzogUHJvcGVydHlUeXBlQ29uZmlnID0ge1xuXHRcdHR5cGU6IG9UYXJnZXRNYXBwaW5nPy50eXBlLFxuXHRcdGNvbnN0cmFpbnRzOiB7fSxcblx0XHRmb3JtYXRPcHRpb25zOiB7fVxuXHR9O1xuXHRpZiAoaXNQcm9wZXJ0eShvUHJvcGVydHkpICYmIG9UYXJnZXRNYXBwaW5nICE9PSB1bmRlZmluZWQpIHtcblx0XHRwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHMgPSB7XG5cdFx0XHRzY2FsZTogb1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LiRTY2FsZSA/IG9Qcm9wZXJ0eS5zY2FsZSA6IHVuZGVmaW5lZCxcblx0XHRcdHByZWNpc2lvbjogb1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LiRQcmVjaXNpb24gPyBvUHJvcGVydHkucHJlY2lzaW9uIDogdW5kZWZpbmVkLFxuXHRcdFx0bWF4TGVuZ3RoOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJE1heExlbmd0aCA/IG9Qcm9wZXJ0eS5tYXhMZW5ndGggOiB1bmRlZmluZWQsXG5cdFx0XHRudWxsYWJsZTogb1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LiROdWxsYWJsZSA/IG9Qcm9wZXJ0eS5udWxsYWJsZSA6IHVuZGVmaW5lZCxcblx0XHRcdG1pbmltdW06XG5cdFx0XHRcdG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy5bXCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluaW11bS8kRGVjaW1hbFwiXSAmJlxuXHRcdFx0XHQhaXNOYU4ob1Byb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NaW5pbXVtKVxuXHRcdFx0XHRcdD8gYCR7b1Byb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NaW5pbXVtfWBcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdG1heGltdW06XG5cdFx0XHRcdG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy5bXCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWF4aW11bS8kRGVjaW1hbFwiXSAmJlxuXHRcdFx0XHQhaXNOYU4ob1Byb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NYXhpbXVtKVxuXHRcdFx0XHRcdD8gYCR7b1Byb3BlcnR5LmFubm90YXRpb25zPy5WYWxpZGF0aW9uPy5NYXhpbXVtfWBcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdGlzRGlnaXRTZXF1ZW5jZTpcblx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIgJiZcblx0XHRcdFx0b1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LltgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLklzRGlnaXRTZXF1ZW5jZX1gXSAmJlxuXHRcdFx0XHRvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNEaWdpdFNlcXVlbmNlXG5cdFx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdFx0OiB1bmRlZmluZWRcblx0XHR9O1xuXHR9XG5cdHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zID0ge1xuXHRcdHBhcnNlQXNTdHJpbmc6XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgfHxcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiKSA9PT0gMFxuXHRcdFx0XHQ/IGZhbHNlXG5cdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdGVtcHR5U3RyaW5nOlxuXHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnPy50eXBlPy5pbmRleE9mKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50XCIpID09PSAwIHx8XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Eb3VibGVcIikgPT09IDBcblx0XHRcdFx0PyBcIlwiXG5cdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdHBhcnNlS2VlcHNFbXB0eVN0cmluZzogcHJvcGVydHlUeXBlQ29uZmlnLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIgPyB0cnVlIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBwcm9wZXJ0eVR5cGVDb25maWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0Z2V0VGFibGVBY3Rpb25zLFxuXHRnZXRUYWJsZUNvbHVtbnMsXG5cdGdldENvbHVtbnNGcm9tRW50aXR5VHlwZSxcblx0dXBkYXRlTGlua2VkUHJvcGVydGllcyxcblx0Y3JlYXRlVGFibGVWaXN1YWxpemF0aW9uLFxuXHRjcmVhdGVEZWZhdWx0VGFibGVWaXN1YWxpemF0aW9uLFxuXHRnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24sXG5cdGdldFNlbGVjdGlvbk1vZGUsXG5cdGdldFJvd1N0YXR1c1Zpc2liaWxpdHksXG5cdGdldEltcG9ydGFuY2UsXG5cdGdldFAxM25Nb2RlLFxuXHRnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uLFxuXHRpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUsXG5cdHNwbGl0UGF0aCxcblx0Z2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24sXG5cdGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRnZXRUeXBlQ29uZmlnLFxuXHR1cGRhdGVUYWJsZVZpc3VhbGl6YXRpb25Gb3JUeXBlXG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BZ1FLQSxVQUFVLEVBTWY7RUFBQSxXQU5LQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0VBQUEsR0FBVkEsVUFBVSxLQUFWQSxVQUFVO0VBOExmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNDLGVBQWUsQ0FDOUJDLGtCQUE0QixFQUM1QkMsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbENDLGtCQUFvRCxFQUNuQztJQUNqQixNQUFNQyxhQUFhLEdBQUdDLHlCQUF5QixDQUFDTCxrQkFBa0IsRUFBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixDQUFDO0lBQ3hHLE1BQU1JLGtCQUFrQixHQUFHRixhQUFhLENBQUNHLFlBQVk7SUFDckQsTUFBTUMsY0FBYyxHQUFHSixh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