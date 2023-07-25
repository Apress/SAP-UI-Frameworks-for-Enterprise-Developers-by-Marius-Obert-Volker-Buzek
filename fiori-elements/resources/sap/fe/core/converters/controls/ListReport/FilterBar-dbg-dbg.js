/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Table", "sap/fe/core/converters/controls/ListReport/VisualFilters", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "../Common/DataVisualization"], function (Table, VisualFilters, ConfigurableObject, IssueManager, Key, BindingToolkit, ModelHelper, TypeGuards, DataModelPathHelper, PropertyHelper, DataVisualization) {
  "use strict";

  var _exports = {};
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var isEntitySet = TypeGuards.isEntitySet;
  var isComplexType = TypeGuards.isComplexType;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getVisualFilters = VisualFilters.getVisualFilters;
  var isFilteringCaseSensitive = Table.isFilteringCaseSensitive;
  var getTypeConfig = Table.getTypeConfig;
  var getSelectionVariantConfiguration = Table.getSelectionVariantConfiguration;
  var filterFieldType;
  (function (filterFieldType) {
    filterFieldType["Default"] = "Default";
    filterFieldType["Slot"] = "Slot";
  })(filterFieldType || (filterFieldType = {}));
  const sEdmString = "Edm.String";
  const sStringDataType = "sap.ui.model.odata.type.String";
  /**
   * Enter all DataFields of a given FieldGroup into the filterFacetMap.
   *
   * @param fieldGroup
   * @returns The map of facets for the given FieldGroup
   */
  function getFieldGroupFilterGroups(fieldGroup) {
    const filterFacetMap = {};
    fieldGroup.Data.forEach(dataField => {
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataField") {
        var _fieldGroup$annotatio, _fieldGroup$annotatio2;
        filterFacetMap[dataField.Value.path] = {
          group: fieldGroup.fullyQualifiedName,
          groupLabel: compileExpression(getExpressionFromAnnotation(fieldGroup.Label || ((_fieldGroup$annotatio = fieldGroup.annotations) === null || _fieldGroup$annotatio === void 0 ? void 0 : (_fieldGroup$annotatio2 = _fieldGroup$annotatio.Common) === null || _fieldGroup$annotatio2 === void 0 ? void 0 : _fieldGroup$annotatio2.Label) || fieldGroup.qualifier)) || fieldGroup.qualifier
        };
      }
    });
    return filterFacetMap;
  }
  function getExcludedFilterProperties(selectionVariants) {
    return selectionVariants.reduce((previousValue, selectionVariant) => {
      selectionVariant.propertyNames.forEach(propertyName => {
        previousValue[propertyName] = true;
      });
      return previousValue;
    }, {});
  }

  /**
   * Check that all the tables for a dedicated entity set are configured as analytical tables.
   *
   * @param listReportTables List report tables
   * @param contextPath
   * @returns Is FilterBar search field hidden or not
   */
  function checkAllTableForEntitySetAreAnalytical(listReportTables, contextPath) {
    if (contextPath && listReportTables.length > 0) {
      return listReportTables.every(visualization => {
        return visualization.enableAnalytics && contextPath === visualization.annotation.collection;
      });
    }
    return false;
  }
  function getSelectionVariants(lrTableVisualizations, converterContext) {
    const selectionVariantPaths = [];
    return lrTableVisualizations.map(visualization => {
      const tableFilters = visualization.control.filters;
      const tableSVConfigs = [];
      for (const key in tableFilters) {
        if (Array.isArray(tableFilters[key].paths)) {
          const paths = tableFilters[key].paths;
          paths.forEach(path => {
            if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
              selectionVariantPaths.push(path.annotationPath);
              const selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
              if (selectionVariantConfig) {
                tableSVConfigs.push(selectionVariantConfig);
              }
            }
          });
        }
      }
      return tableSVConfigs;
    }).reduce((svConfigs, selectionVariant) => svConfigs.concat(selectionVariant), []);
  }

  /**
   * Returns the condition path required for the condition model. It looks as follows:
   * <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
   *
   * @param entityType The root EntityType
   * @param propertyPath The full path to the target property
   * @returns The formatted condition path
   */
  const _getConditionPath = function (entityType, propertyPath) {
    const parts = propertyPath.split("/");
    let partialPath;
    let key = "";
    while (parts.length) {
      let part = parts.shift();
      partialPath = partialPath ? `${partialPath}/${part}` : part;
      const property = entityType.resolvePath(partialPath);
      if (isMultipleNavigationProperty(property)) {
        part += "*";
      }
      key = key ? `${key}/${part}` : part;
    }
    return key;
  };
  const _createFilterSelectionField = function (entityType, property, fullPropertyPath, includeHidden, converterContext) {
    var _property$annotations, _property$annotations2, _property$annotations3;
    // ignore complex property types and hidden annotated ones
    if (property && property.targetType === undefined && (includeHidden || ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) !== true)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _targetEntityType$ann, _targetEntityType$ann2, _targetEntityType$ann3;
      const targetEntityType = converterContext.getAnnotationEntityType(property);
      return {
        key: KeyHelper.getSelectionFieldKeyFromPath(fullPropertyPath),
        annotationPath: converterContext.getAbsoluteAnnotationPath(fullPropertyPath),
        conditionPath: _getConditionPath(entityType, fullPropertyPath),
        availability: ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.UI) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.HiddenFilter) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.valueOf()) === true ? "Hidden" : "Adaptation",
        label: compileExpression(getExpressionFromAnnotation(((_property$annotations7 = property.annotations.Common) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Label) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.valueOf()) || property.name)),
        group: targetEntityType.name,
        groupLabel: compileExpression(getExpressionFromAnnotation((targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : (_targetEntityType$ann2 = _targetEntityType$ann.Common) === null || _targetEntityType$ann2 === void 0 ? void 0 : (_targetEntityType$ann3 = _targetEntityType$ann2.Label) === null || _targetEntityType$ann3 === void 0 ? void 0 : _targetEntityType$ann3.valueOf()) || targetEntityType.name))
      };
    }
    return undefined;
  };
  const _getSelectionFields = function (entityType, navigationPath, properties, includeHidden, converterContext) {
    const selectionFieldMap = {};
    if (properties) {
      properties.forEach(property => {
        const propertyPath = property.name;
        const fullPath = (navigationPath ? `${navigationPath}/` : "") + propertyPath;
        const selectionField = _createFilterSelectionField(entityType, property, fullPath, includeHidden, converterContext);
        if (selectionField) {
          selectionFieldMap[fullPath] = selectionField;
        }
      });
    }
    return selectionFieldMap;
  };
  const _getSelectionFieldsByPath = function (entityType, propertyPaths, includeHidden, converterContext) {
    let selectionFields = {};
    if (propertyPaths) {
      propertyPaths.forEach(propertyPath => {
        let localSelectionFields;
        const property = entityType.resolvePath(propertyPath);
        if (property === undefined) {
          return;
        }
        if (isNavigationProperty(property)) {
          // handle navigation properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.entityProperties, includeHidden, converterContext);
        } else if (isComplexType(property.targetType)) {
          // handle ComplexType properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.properties, includeHidden, converterContext);
        } else {
          const navigationPath = propertyPath.includes("/") ? propertyPath.split("/").splice(0, 1).join("/") : "";
          localSelectionFields = _getSelectionFields(entityType, navigationPath, [property], includeHidden, converterContext);
        }
        selectionFields = {
          ...selectionFields,
          ...localSelectionFields
        };
      });
    }
    return selectionFields;
  };
  const _getFilterField = function (filterFields, propertyPath, converterContext, entityType) {
    let filterField = filterFields[propertyPath];
    if (filterField) {
      delete filterFields[propertyPath];
    } else {
      filterField = _createFilterSelectionField(entityType, entityType.resolvePath(propertyPath), propertyPath, true, converterContext);
    }
    if (!filterField) {
      var _converterContext$get;
      (_converterContext$get = converterContext.getDiagnostics()) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.addIssue(IssueCategory.Annotation, IssueSeverity.High, IssueType.MISSING_SELECTIONFIELD);
    }
    // defined SelectionFields are available by default
    if (filterField) {
      var _entityType$annotatio, _entityType$annotatio2;
      filterField.availability = filterField.availability === "Hidden" ? "Hidden" : "Default";
      filterField.isParameter = !!((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.Common) !== null && _entityType$annotatio2 !== void 0 && _entityType$annotatio2.ResultContext);
    }
    return filterField;
  };
  const _getDefaultFilterFields = function (aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields) {
    const selectionFields = [];
    const UISelectionFields = {};
    const properties = entityType.entityProperties;
    // Using entityType instead of entitySet
    annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
      UISelectionFields[SelectionField.value] = true;
    });
    if (aSelectOptions && aSelectOptions.length > 0) {
      aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const sPropertyPath = propertyName === null || propertyName === void 0 ? void 0 : propertyName.value;
        const currentSelectionFields = {};
        annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
          currentSelectionFields[SelectionField.value] = true;
        });
        if (sPropertyPath && !(sPropertyPath in excludedFilterProperties)) {
          if (!(sPropertyPath in currentSelectionFields)) {
            const FilterField = getFilterField(sPropertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    } else if (properties) {
      properties.forEach(property => {
        var _property$annotations9, _property$annotations10;
        const defaultFilterValue = (_property$annotations9 = property.annotations) === null || _property$annotations9 === void 0 ? void 0 : (_property$annotations10 = _property$annotations9.Common) === null || _property$annotations10 === void 0 ? void 0 : _property$annotations10.FilterDefaultValue;
        const propertyPath = property.name;
        if (!(propertyPath in excludedFilterProperties)) {
          if (defaultFilterValue && !(propertyPath in UISelectionFields)) {
            const FilterField = getFilterField(propertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    }
    return selectionFields;
  };

  /**
   * Get all parameter filter fields in case of a parameterized service.
   *
   * @param converterContext
   * @returns An array of parameter FilterFields
   */
  function _getParameterFields(converterContext) {
    var _parameterEntityType$, _parameterEntityType$2;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const parameterEntityType = dataModelObjectPath.startingEntitySet.entityType;
    const isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext) && !dataModelObjectPath.targetEntitySet;
    const parameterConverterContext = isParameterized && converterContext.getConverterContextFor(`/${dataModelObjectPath.startingEntitySet.name}`);
    return parameterConverterContext ? parameterEntityType.entityProperties.map(function (property) {
      return _getFilterField({}, property.name, parameterConverterContext, parameterEntityType);
    }) : [];
  }

  /**
   * Determines if the FilterBar search field is hidden or not.
   *
   * @param listReportTables The list report tables
   * @param charts The ALP charts
   * @param converterContext The converter context
   * @returns The information if the FilterBar search field is hidden or not
   */
  const getFilterBarHideBasicSearch = function (listReportTables, charts, converterContext) {
    // Check if charts allow search
    const noSearchInCharts = charts.length === 0 || charts.every(chart => !chart.applySupported.enableSearch);

    // Check if all tables are analytical and none of them allow for search
    // or all tables are TreeTable and none of them allow for search
    const noSearchInTables = listReportTables.length === 0 || listReportTables.every(table => (table.enableAnalytics || table.control.type === "TreeTable") && !table.enableBasicSearch);
    const contextPath = converterContext.getContextPath();
    if (contextPath && noSearchInCharts && noSearchInTables) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieves filter fields from the manifest.
   *
   * @param entityType The current entityType
   * @param converterContext The converter context
   * @returns The filter fields defined in the manifest
   */
  _exports.getFilterBarHideBasicSearch = getFilterBarHideBasicSearch;
  const getManifestFilterFields = function (entityType, converterContext) {
    const fbConfig = converterContext.getManifestWrapper().getFilterConfiguration();
    const definedFilterFields = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.filterFields) || {};
    const selectionFields = _getSelectionFieldsByPath(entityType, Object.keys(definedFilterFields).map(key => KeyHelper.getPathFromSelectionFieldKey(key)), true, converterContext);
    const filterFields = {};
    for (const sKey in definedFilterFields) {
      const filterField = definedFilterFields[sKey];
      const propertyName = KeyHelper.getPathFromSelectionFieldKey(sKey);
      const selectionField = selectionFields[propertyName];
      const type = filterField.type === "Slot" ? filterFieldType.Slot : filterFieldType.Default;
      const visualFilter = filterField && filterField !== null && filterField !== void 0 && filterField.visualFilter ? getVisualFilters(entityType, converterContext, sKey, definedFilterFields) : undefined;
      filterFields[sKey] = {
        key: sKey,
        type: type,
        slotName: (filterField === null || filterField === void 0 ? void 0 : filterField.slotName) || sKey,
        annotationPath: selectionField === null || selectionField === void 0 ? void 0 : selectionField.annotationPath,
        conditionPath: (selectionField === null || selectionField === void 0 ? void 0 : selectionField.conditionPath) || propertyName,
        template: filterField.template,
        label: filterField.label,
        position: filterField.position || {
          placement: Placement.After
        },
        availability: filterField.availability || "Default",
        settings: filterField.settings,
        visualFilter: visualFilter,
        required: filterField.required
      };
    }
    return filterFields;
  };
  _exports.getManifestFilterFields = getManifestFilterFields;
  const getFilterField = function (propertyPath, converterContext, entityType) {
    return _getFilterField({}, propertyPath, converterContext, entityType);
  };
  _exports.getFilterField = getFilterField;
  const getFilterRestrictions = function (oFilterRestrictionsAnnotation, sRestriction) {
    let aProps = [];
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
      aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
        return oProperty.value;
      });
    }
    return aProps;
  };
  _exports.getFilterRestrictions = getFilterRestrictions;
  const getFilterAllowedExpression = function (oFilterRestrictionsAnnotation) {
    const mAllowedExpressions = {};
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
      oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
        var _oProperty$Property;
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        if ((_oProperty$Property = oProperty.Property) !== null && _oProperty$Property !== void 0 && _oProperty$Property.value && oProperty.AllowedExpressions) {
          var _oProperty$Property2;
          if (mAllowedExpressions[(_oProperty$Property2 = oProperty.Property) === null || _oProperty$Property2 === void 0 ? void 0 : _oProperty$Property2.value]) {
            var _oProperty$Property3;
            mAllowedExpressions[(_oProperty$Property3 = oProperty.Property) === null || _oProperty$Property3 === void 0 ? void 0 : _oProperty$Property3.value].push(oProperty.AllowedExpressions.toString());
          } else {
            var _oProperty$Property4;
            mAllowedExpressions[(_oProperty$Property4 = oProperty.Property) === null || _oProperty$Property4 === void 0 ? void 0 : _oProperty$Property4.value] = [oProperty.AllowedExpressions.toString()];
          }
        }
      });
    }
    return mAllowedExpressions;
  };
  _exports.getFilterAllowedExpression = getFilterAllowedExpression;
  const getSearchFilterPropertyInfo = function () {
    return {
      name: "$search",
      path: "$search",
      dataType: sStringDataType,
      maxConditions: 1
    };
  };
  const getEditStateFilterPropertyInfo = function () {
    return {
      name: "$editState",
      path: "$editState",
      groupLabel: "",
      group: "",
      dataType: sStringDataType,
      hiddenFilter: false
    };
  };
  const getSearchRestrictions = function (converterContext) {
    var _entitySet$annotation;
    const entitySet = converterContext.getEntitySet();
    return isEntitySet(entitySet) ? (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : _entitySet$annotation.SearchRestrictions : undefined;
  };
  const getNavigationRestrictions = function (converterContext, sNavigationPath) {
    var _converterContext$get2, _converterContext$get3, _converterContext$get4;
    const oNavigationRestrictions = (_converterContext$get2 = converterContext.getEntitySet()) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.annotations) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.Capabilities) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.NavigationRestrictions;
    const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && oRestrictedProperty.NavigationProperty.value === sNavigationPath;
    });
  };
  _exports.getNavigationRestrictions = getNavigationRestrictions;
  const _fetchBasicPropertyInfo = function (oFilterFieldInfo) {
    return {
      key: oFilterFieldInfo.key,
      annotationPath: oFilterFieldInfo.annotationPath,
      conditionPath: oFilterFieldInfo.conditionPath,
      name: oFilterFieldInfo.conditionPath,
      label: oFilterFieldInfo.label,
      hiddenFilter: oFilterFieldInfo.availability === "Hidden",
      display: "Value",
      isParameter: oFilterFieldInfo.isParameter,
      caseSensitive: oFilterFieldInfo.caseSensitive,
      availability: oFilterFieldInfo.availability,
      position: oFilterFieldInfo.position,
      type: oFilterFieldInfo.type,
      template: oFilterFieldInfo.template,
      menu: oFilterFieldInfo.menu,
      required: oFilterFieldInfo.required
    };
  };
  const getSpecificAllowedExpression = function (aExpressions) {
    const aAllowedExpressionsPriority = ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"];
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  };
  _exports.getSpecificAllowedExpression = getSpecificAllowedExpression;
  const displayMode = function (oPropertyAnnotations, oCollectionAnnotations) {
    var _oPropertyAnnotations, _oPropertyAnnotations2, _oPropertyAnnotations3, _oPropertyAnnotations4, _oPropertyAnnotations5, _oCollectionAnnotatio;
    const oTextAnnotation = oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations = oPropertyAnnotations.Common) === null || _oPropertyAnnotations === void 0 ? void 0 : _oPropertyAnnotations.Text,
      oTextArrangmentAnnotation = oTextAnnotation && (oPropertyAnnotations && (oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations2 = oPropertyAnnotations.Common) === null || _oPropertyAnnotations2 === void 0 ? void 0 : (_oPropertyAnnotations3 = _oPropertyAnnotations2.Text) === null || _oPropertyAnnotations3 === void 0 ? void 0 : (_oPropertyAnnotations4 = _oPropertyAnnotations3.annotations) === null || _oPropertyAnnotations4 === void 0 ? void 0 : (_oPropertyAnnotations5 = _oPropertyAnnotations4.UI) === null || _oPropertyAnnotations5 === void 0 ? void 0 : _oPropertyAnnotations5.TextArrangement) || oCollectionAnnotations && (oCollectionAnnotations === null || oCollectionAnnotations === void 0 ? void 0 : (_oCollectionAnnotatio = oCollectionAnnotations.UI) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.TextArrangement));
    if (oTextArrangmentAnnotation) {
      if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextLast") {
        return "ValueDescription";
      }
      return "DescriptionValue"; //TextFirst
    }

    return oTextAnnotation ? "DescriptionValue" : "Value";
  };
  _exports.displayMode = displayMode;
  const fetchPropertyInfo = function (converterContext, oFilterFieldInfo, oTypeConfig) {
    var _converterContext$get5;
    let oPropertyInfo = _fetchBasicPropertyInfo(oFilterFieldInfo);
    const sAnnotationPath = oFilterFieldInfo.annotationPath;
    if (!sAnnotationPath) {
      return oPropertyInfo;
    }
    const targetPropertyObject = converterContext.getConverterContextFor(sAnnotationPath).getDataModelObjectPath().targetObject;
    const oPropertyAnnotations = targetPropertyObject === null || targetPropertyObject === void 0 ? void 0 : targetPropertyObject.annotations;
    const oCollectionAnnotations = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get5 = converterContext.getDataModelObjectPath().targetObject) === null || _converterContext$get5 === void 0 ? void 0 : _converterContext$get5.annotations;
    const oFormatOptions = oTypeConfig.formatOptions;
    const oConstraints = oTypeConfig.constraints;
    oPropertyInfo = Object.assign(oPropertyInfo, {
      formatOptions: oFormatOptions,
      constraints: oConstraints,
      display: displayMode(oPropertyAnnotations, oCollectionAnnotations)
    });
    return oPropertyInfo;
  };
  _exports.fetchPropertyInfo = fetchPropertyInfo;
  const isMultiValue = function (oProperty) {
    let bIsMultiValue = true;
    //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
    switch (oProperty.filterExpression) {
      case "SearchExpression":
      case "SingleRange":
      case "SingleValue":
        bIsMultiValue = false;
        break;
      default:
        break;
    }
    if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
      bIsMultiValue = false;
    }
    return bIsMultiValue;
  };
  _exports.isMultiValue = isMultiValue;
  const _isFilterableNavigationProperty = function (entry) {
    return (entry.$Type === "com.sap.vocabularies.UI.v1.DataField" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") && entry.Value.path.includes("/");
  };

  /**
   * Adds the additional property which references to the unit, timezone, textArrangement or currency from a data field.
   *
   * @param dataField The data field to be considered
   * @param converterContext The converter context
   * @param navProperties The list of navigation properties
   */
  const addChildNavigationProperties = function (dataField, converterContext, navProperties) {
    var _Value;
    const targetProperty = (_Value = dataField.Value) === null || _Value === void 0 ? void 0 : _Value.$target;
    if (targetProperty) {
      const additionalPropertyPath = getAssociatedTextPropertyPath(targetProperty) || getAssociatedCurrencyPropertyPath(targetProperty) || getAssociatedUnitPropertyPath(targetProperty) || getAssociatedTimezonePropertyPath(targetProperty);
      const navigationProperty = additionalPropertyPath ? enhanceDataModelPath(converterContext.getDataModelObjectPath(), additionalPropertyPath).navigationProperties : undefined;
      if (navigationProperty !== null && navigationProperty !== void 0 && navigationProperty.length) {
        const navigationPropertyPath = navigationProperty[0].name;
        if (!navProperties.includes(navigationPropertyPath)) {
          navProperties.push(navigationPropertyPath);
        }
      }
    }
  };

  /**
   * Gets used navigation properties for available dataField.
   *
   * @param navProperties The list of navigation properties
   * @param dataField The data field to be considered
   * @param converterContext The converter context
   * @returns The list of navigation properties
   */
  const getNavigationPropertiesRecursively = function (navProperties, dataField, converterContext) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(innerDataField => {
              getNavigationPropertiesRecursively(navProperties, innerDataField, converterContext);
            });
            break;
          default:
            break;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        if (_isFilterableNavigationProperty(dataField)) {
          const navigationPropertyPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), dataField.Value.path).navigationProperties[0].name;
          if (!navProperties.includes(navigationPropertyPath)) {
            navProperties.push(navigationPropertyPath);
          }
        }
        // Additional property from text arrangement/units/currencies/timezone...
        addChildNavigationProperties(dataField, converterContext, navProperties);
        break;
      default:
        break;
    }
    return navProperties;
  };
  const getAnnotatedSelectionFieldData = function (converterContext) {
    var _converterContext$get6, _entityType$annotatio3, _entityType$annotatio4;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    // Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
    const selectionVariants = getSelectionVariants(lrTables, converterContext);

    // create a map of properties to be used in selection variants
    const excludedFilterProperties = getExcludedFilterProperties(selectionVariants);
    const entityType = converterContext.getEntityType();
    //Filters which has to be added which is part of SV/Default annotations but not present in the SelectionFields
    const annotatedSelectionFields = annotationPath && ((_converterContext$get6 = converterContext.getEntityTypeAnnotation(annotationPath)) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.annotation) || ((_entityType$annotatio3 = entityType.annotations) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.SelectionFields) || [];
    let navProperties = [];
    if (lrTables.length === 0 && !!lineItemTerm) {
      var _converterContext$get7;
      (_converterContext$get7 = converterContext.getEntityTypeAnnotation(lineItemTerm).annotation) === null || _converterContext$get7 === void 0 ? void 0 : _converterContext$get7.forEach(dataField => {
        navProperties = getNavigationPropertiesRecursively(navProperties, dataField, converterContext);
      });
    }

    // create a map of all potential filter fields based on...
    const filterFields = {
      // ...non hidden properties of the entity
      ..._getSelectionFields(entityType, "", entityType.entityProperties, includeHidden, converterContext),
      // ... non hidden properties of navigation properties
      ..._getSelectionFieldsByPath(entityType, navProperties, false, converterContext),
      // ...additional manifest defined navigation properties
      ..._getSelectionFieldsByPath(entityType, converterContext.getManifestWrapper().getFilterConfiguration().navigationProperties, includeHidden, converterContext)
    };
    let aSelectOptions = [];
    const selectionVariant = getSelectionVariant(entityType, converterContext);
    if (selectionVariant) {
      aSelectOptions = selectionVariant.SelectOptions;
    }
    const propertyInfoFields = (annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.reduce((selectionFields, selectionField) => {
      const propertyPath = selectionField.value;
      if (!(propertyPath in excludedFilterProperties)) {
        let navigationPath;
        if (annotationPath.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")) {
          navigationPath = "";
        } else {
          navigationPath = annotationPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0];
        }
        const filterPropertyPath = navigationPath ? navigationPath + "/" + propertyPath : propertyPath;
        const filterField = _getFilterField(filterFields, filterPropertyPath, converterContext, entityType);
        if (filterField) {
          filterField.group = "";
          filterField.groupLabel = "";
          selectionFields.push(filterField);
        }
      }
      return selectionFields;
    }, [])) || [];
    const defaultFilterFields = _getDefaultFilterFields(aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields);
    return {
      excludedFilterProperties: excludedFilterProperties,
      entityType: entityType,
      annotatedSelectionFields: annotatedSelectionFields,
      filterFields: filterFields,
      propertyInfoFields: propertyInfoFields,
      defaultFilterFields: defaultFilterFields
    };
  };
  const fetchTypeConfig = function (property) {
    const oTypeConfig = getTypeConfig(property, property === null || property === void 0 ? void 0 : property.type);
    if ((property === null || property === void 0 ? void 0 : property.type) === sEdmString && (oTypeConfig.constraints.nullable === undefined || oTypeConfig.constraints.nullable === true)) {
      oTypeConfig.formatOptions.parseKeepsEmptyString = false;
    }
    return oTypeConfig;
  };
  _exports.fetchTypeConfig = fetchTypeConfig;
  const assignDataTypeToPropertyInfo = function (propertyInfoField, converterContext, aRequiredProps, aTypeConfig) {
    let oPropertyInfo = fetchPropertyInfo(converterContext, propertyInfoField, aTypeConfig[propertyInfoField.key]),
      sPropertyPath = "";
    if (propertyInfoField.conditionPath) {
      sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
    }
    if (oPropertyInfo) {
      oPropertyInfo = Object.assign(oPropertyInfo, {
        maxConditions: !oPropertyInfo.isParameter && isMultiValue(oPropertyInfo) ? -1 : 1,
        required: propertyInfoField.required ?? (oPropertyInfo.isParameter || aRequiredProps.indexOf(sPropertyPath) >= 0),
        caseSensitive: isFilteringCaseSensitive(converterContext),
        dataType: aTypeConfig[propertyInfoField.key].type
      });
    }
    return oPropertyInfo;
  };
  _exports.assignDataTypeToPropertyInfo = assignDataTypeToPropertyInfo;
  const processSelectionFields = function (propertyInfoFields, converterContext, defaultValuePropertyFields) {
    var _entitySet$annotation2;
    //get TypeConfig function
    const selectionFieldTypes = [];
    const aTypeConfig = {};
    if (defaultValuePropertyFields) {
      propertyInfoFields = propertyInfoFields.concat(defaultValuePropertyFields);
    }
    //add typeConfig
    propertyInfoFields.forEach(function (parameterField) {
      if (parameterField.annotationPath) {
        const propertyConvertyContext = converterContext.getConverterContextFor(parameterField.annotationPath);
        const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
        selectionFieldTypes.push(propertyTargetObject === null || propertyTargetObject === void 0 ? void 0 : propertyTargetObject.type);
        const oTypeConfig = fetchTypeConfig(propertyTargetObject);
        aTypeConfig[parameterField.key] = oTypeConfig;
      } else {
        selectionFieldTypes.push(sEdmString);
        aTypeConfig[parameterField.key] = {
          type: sStringDataType
        };
      }
    });

    // filterRestrictions
    const entitySet = converterContext.getEntitySet();
    const oFilterRestrictions = isEntitySet(entitySet) ? (_entitySet$annotation2 = entitySet.annotations.Capabilities) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.FilterRestrictions : undefined;
    const oRet = {};
    oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
    oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
    oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions);
    const sEntitySetPath = converterContext.getContextPath();
    const aPathParts = sEntitySetPath.split("/");
    if (aPathParts.length > 2) {
      const sNavigationPath = aPathParts[aPathParts.length - 1];
      aPathParts.splice(-1, 1);
      const oNavigationRestrictions = getNavigationRestrictions(converterContext, sNavigationPath);
      const oNavigationFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
      oRet.RequiredProperties = oRet.RequiredProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "RequiredProperties") || []);
      oRet.NonFilterableProperties = oRet.NonFilterableProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "NonFilterableProperties") || []);
      oRet.FilterAllowedExpressions = {
        ...(getFilterAllowedExpression(oNavigationFilterRestrictions) || {}),
        ...oRet.FilterAllowedExpressions
      };
    }
    const aRequiredProps = oRet.RequiredProperties;
    const aNonFilterableProps = oRet.NonFilterableProperties;
    const aFetchedProperties = [];

    // process the fields to add necessary properties
    propertyInfoFields.forEach(function (propertyInfoField) {
      const sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
      if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
        const oPropertyInfo = assignDataTypeToPropertyInfo(propertyInfoField, converterContext, aRequiredProps, aTypeConfig);
        aFetchedProperties.push(oPropertyInfo);
      }
    });

    //add edit
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    if (ModelHelper.isObjectPathDraftSupported(dataModelObjectPath)) {
      aFetchedProperties.push(getEditStateFilterPropertyInfo());
    }
    // add search
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (sEntitySetPath && hideBasicSearch !== true) {
      if (!searchRestrictions || searchRestrictions !== null && searchRestrictions !== void 0 && searchRestrictions.Searchable) {
        aFetchedProperties.push(getSearchFilterPropertyInfo());
      }
    }
    return aFetchedProperties;
  };
  _exports.processSelectionFields = processSelectionFields;
  const insertCustomManifestElements = function (filterFields, entityType, converterContext) {
    return insertCustomElements(filterFields, getManifestFilterFields(entityType, converterContext), {
      availability: OverrideType.overwrite,
      label: OverrideType.overwrite,
      type: OverrideType.overwrite,
      position: OverrideType.overwrite,
      slotName: OverrideType.overwrite,
      template: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      visualFilter: OverrideType.overwrite,
      required: OverrideType.overwrite
    });
  };

  /**
   * Retrieve the configuration for the selection fields that will be used within the filter bar
   * This configuration takes into account the annotation and the selection variants.
   *
   * @param converterContext
   * @param lrTables
   * @param annotationPath
   * @param [includeHidden]
   * @param [lineItemTerm]
   * @returns An array of selection fields
   */
  _exports.insertCustomManifestElements = insertCustomManifestElements;
  const getSelectionFields = function (converterContext) {
    var _entityType$annotatio5, _entityType$annotatio6;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 ? arguments[3] : undefined;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    const oAnnotatedSelectionFieldData = getAnnotatedSelectionFieldData(converterContext, lrTables, annotationPath, includeHidden, lineItemTerm);
    const parameterFields = _getParameterFields(converterContext);
    let propertyInfoFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    const entityType = oAnnotatedSelectionFieldData.entityType;
    propertyInfoFields = parameterFields.concat(propertyInfoFields);
    propertyInfoFields = insertCustomManifestElements(propertyInfoFields, entityType, converterContext);
    const aFetchedProperties = processSelectionFields(propertyInfoFields, converterContext, oAnnotatedSelectionFieldData.defaultFilterFields);
    aFetchedProperties.sort(function (a, b) {
      if (a.groupLabel === undefined || a.groupLabel === null) {
        return -1;
      }
      if (b.groupLabel === undefined || b.groupLabel === null) {
        return 1;
      }
      return a.groupLabel.localeCompare(b.groupLabel);
    });
    let sFetchProperties = JSON.stringify(aFetchedProperties);
    sFetchProperties = sFetchProperties.replace(/\{/g, "\\{");
    sFetchProperties = sFetchProperties.replace(/\}/g, "\\}");
    const sPropertyInfo = sFetchProperties;
    // end of propertyFields processing

    // to populate selection fields
    let propSelectionFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    propSelectionFields = parameterFields.concat(propSelectionFields);
    // create a map of properties to be used in selection variants
    const excludedFilterProperties = oAnnotatedSelectionFieldData.excludedFilterProperties;
    const filterFacets = entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.FilterFacets;
    let filterFacetMap = {};
    const aFieldGroups = converterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.FieldGroup");
    if (filterFacets === undefined || filterFacets.length < 0) {
      for (const i in aFieldGroups) {
        filterFacetMap = {
          ...filterFacetMap,
          ...getFieldGroupFilterGroups(aFieldGroups[i])
        };
      }
    } else {
      filterFacetMap = filterFacets.reduce((previousValue, filterFacet) => {
        for (let i = 0; i < (filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target = filterFacet.Target) === null || _filterFacet$Target === void 0 ? void 0 : (_filterFacet$Target$$ = _filterFacet$Target.$target) === null || _filterFacet$Target$$ === void 0 ? void 0 : (_filterFacet$Target$$2 = _filterFacet$Target$$.Data) === null || _filterFacet$Target$$2 === void 0 ? void 0 : _filterFacet$Target$$2.length); i++) {
          var _filterFacet$Target, _filterFacet$Target$$, _filterFacet$Target$$2, _filterFacet$Target2, _filterFacet$Target2$, _filterFacet$Target2$2, _filterFacet$Target2$3, _filterFacet$ID, _filterFacet$Label;
          previousValue[filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target2 = filterFacet.Target) === null || _filterFacet$Target2 === void 0 ? void 0 : (_filterFacet$Target2$ = _filterFacet$Target2.$target) === null || _filterFacet$Target2$ === void 0 ? void 0 : (_filterFacet$Target2$2 = _filterFacet$Target2$.Data[i]) === null || _filterFacet$Target2$2 === void 0 ? void 0 : (_filterFacet$Target2$3 = _filterFacet$Target2$2.Value) === null || _filterFacet$Target2$3 === void 0 ? void 0 : _filterFacet$Target2$3.path] = {
            group: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$ID = filterFacet.ID) === null || _filterFacet$ID === void 0 ? void 0 : _filterFacet$ID.toString(),
            groupLabel: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Label = filterFacet.Label) === null || _filterFacet$Label === void 0 ? void 0 : _filterFacet$Label.toString()
          };
        }
        return previousValue;
      }, {});
    }

    // create a map of all potential filter fields based on...
    const filterFields = oAnnotatedSelectionFieldData.filterFields;

    // finally create final list of filter fields by adding the SelectionFields first (order matters)...
    let allFilters = propSelectionFields

    // ...and adding remaining filter fields, that are not used in a SelectionVariant (order doesn't matter)
    .concat(Object.keys(filterFields).filter(propertyPath => !(propertyPath in excludedFilterProperties)).map(propertyPath => {
      return Object.assign(filterFields[propertyPath], filterFacetMap[propertyPath]);
    }));
    const sContextPath = converterContext.getContextPath();

    //if all tables are analytical tables "aggregatable" properties must be excluded
    if (checkAllTableForEntitySetAreAnalytical(lrTables, sContextPath)) {
      // Currently all agregates are root entity properties (no properties coming from navigation) and all
      // tables with same entitySet gets same aggreagte configuration that's why we can use first table into
      // LR to get aggregates (without currency/unit properties since we expect to be able to filter them).
      const aggregates = lrTables[0].aggregates;
      if (aggregates) {
        const aggregatableProperties = Object.keys(aggregates).map(aggregateKey => aggregates[aggregateKey].relativePath);
        allFilters = allFilters.filter(filterField => {
          return aggregatableProperties.indexOf(filterField.key) === -1;
        });
      }
    }
    const selectionFields = insertCustomManifestElements(allFilters, entityType, converterContext);

    // Add caseSensitive property to all selection fields.
    const isCaseSensitive = isFilteringCaseSensitive(converterContext);
    selectionFields.forEach(filterField => {
      filterField.caseSensitive = isCaseSensitive;
    });
    return {
      selectionFields,
      sPropertyInfo
    };
  };

  /**
   * Determines whether the filter bar inside a value help dialog should be expanded. This is true if one of the following conditions hold:
   * (1) a filter property is mandatory,
   * (2) no search field exists (entity isn't search enabled),
   * (3) when the data isn't loaded by default (annotation FetchValues = 2).
   *
   * @param converterContext The converter context
   * @param filterRestrictionsAnnotation The FilterRestriction annotation
   * @param valueList The ValueList annotation
   * @returns The value for expandFilterFields
   */
  _exports.getSelectionFields = getSelectionFields;
  const getExpandFilterFields = function (converterContext, filterRestrictionsAnnotation, valueList) {
    const requiredProperties = getFilterRestrictions(filterRestrictionsAnnotation, "RequiredProperties");
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (requiredProperties.length > 0 || hideBasicSearch || (valueList === null || valueList === void 0 ? void 0 : valueList.FetchValues) === 2) {
      return true;
    }
    return false;
  };
  _exports.getExpandFilterFields = getExpandFilterFields;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWx0ZXJGaWVsZFR5cGUiLCJzRWRtU3RyaW5nIiwic1N0cmluZ0RhdGFUeXBlIiwiZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyIsImZpZWxkR3JvdXAiLCJmaWx0ZXJGYWNldE1hcCIsIkRhdGEiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJWYWx1ZSIsInBhdGgiLCJncm91cCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdyb3VwTGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIkxhYmVsIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJxdWFsaWZpZXIiLCJnZXRFeGNsdWRlZEZpbHRlclByb3BlcnRpZXMiLCJzZWxlY3Rpb25WYXJpYW50cyIsInJlZHVjZSIsInByZXZpb3VzVmFsdWUiLCJzZWxlY3Rpb25WYXJpYW50IiwicHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZSIsImNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsIiwibGlzdFJlcG9ydFRhYmxlcyIsImNvbnRleHRQYXRoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2aXN1YWxpemF0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwiYW5ub3RhdGlvbiIsImNvbGxlY3Rpb24iLCJnZXRTZWxlY3Rpb25WYXJpYW50cyIsImxyVGFibGVWaXN1YWxpemF0aW9ucyIsImNvbnZlcnRlckNvbnRleHQiLCJzZWxlY3Rpb25WYXJpYW50UGF0aHMiLCJtYXAiLCJ0YWJsZUZpbHRlcnMiLCJjb250cm9sIiwiZmlsdGVycyIsInRhYmxlU1ZDb25maWdzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5IiwicGF0aHMiLCJhbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJwdXNoIiwic2VsZWN0aW9uVmFyaWFudENvbmZpZyIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic3ZDb25maWdzIiwiY29uY2F0IiwiX2dldENvbmRpdGlvblBhdGgiLCJlbnRpdHlUeXBlIiwicHJvcGVydHlQYXRoIiwicGFydHMiLCJzcGxpdCIsInBhcnRpYWxQYXRoIiwicGFydCIsInNoaWZ0IiwicHJvcGVydHkiLCJyZXNvbHZlUGF0aCIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJfY3JlYXRlRmlsdGVyU2VsZWN0aW9uRmllbGQiLCJmdWxsUHJvcGVydHlQYXRoIiwiaW5jbHVkZUhpZGRlbiIsInRhcmdldFR5cGUiLCJ1bmRlZmluZWQiLCJVSSIsIkhpZGRlbiIsInZhbHVlT2YiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJLZXlIZWxwZXIiLCJnZXRTZWxlY3Rpb25GaWVsZEtleUZyb21QYXRoIiwiZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCIsImNvbmRpdGlvblBhdGgiLCJhdmFpbGFiaWxpdHkiLCJIaWRkZW5GaWx0ZXIiLCJsYWJlbCIsIm5hbWUiLCJfZ2V0U2VsZWN0aW9uRmllbGRzIiwibmF2aWdhdGlvblBhdGgiLCJwcm9wZXJ0aWVzIiwic2VsZWN0aW9uRmllbGRNYXAiLCJmdWxsUGF0aCIsInNlbGVjdGlvbkZpZWxkIiwiX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aCIsInByb3BlcnR5UGF0aHMiLCJzZWxlY3Rpb25GaWVsZHMiLCJsb2NhbFNlbGVjdGlvbkZpZWxkcyIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwiZW50aXR5UHJvcGVydGllcyIsImlzQ29tcGxleFR5cGUiLCJpbmNsdWRlcyIsInNwbGljZSIsImpvaW4iLCJfZ2V0RmlsdGVyRmllbGQiLCJmaWx0ZXJGaWVsZHMiLCJmaWx0ZXJGaWVsZCIsImdldERpYWdub3N0aWNzIiwiYWRkSXNzdWUiLCJJc3N1ZUNhdGVnb3J5IiwiQW5ub3RhdGlvbiIsIklzc3VlU2V2ZXJpdHkiLCJIaWdoIiwiSXNzdWVUeXBlIiwiTUlTU0lOR19TRUxFQ1RJT05GSUVMRCIsImlzUGFyYW1ldGVyIiwiUmVzdWx0Q29udGV4dCIsIl9nZXREZWZhdWx0RmlsdGVyRmllbGRzIiwiYVNlbGVjdE9wdGlvbnMiLCJleGNsdWRlZEZpbHRlclByb3BlcnRpZXMiLCJhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHMiLCJVSVNlbGVjdGlvbkZpZWxkcyIsIlNlbGVjdGlvbkZpZWxkIiwidmFsdWUiLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJzUHJvcGVydHlQYXRoIiwiY3VycmVudFNlbGVjdGlvbkZpZWxkcyIsIkZpbHRlckZpZWxkIiwiZ2V0RmlsdGVyRmllbGQiLCJkZWZhdWx0RmlsdGVyVmFsdWUiLCJGaWx0ZXJEZWZhdWx0VmFsdWUiLCJfZ2V0UGFyYW1ldGVyRmllbGRzIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJwYXJhbWV0ZXJFbnRpdHlUeXBlIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJpc1BhcmFtZXRlcml6ZWQiLCJ0YXJnZXRFbnRpdHlTZXQiLCJwYXJhbWV0ZXJDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dEZvciIsImdldEZpbHRlckJhckhpZGVCYXNpY1NlYXJjaCIsImNoYXJ0cyIsIm5vU2VhcmNoSW5DaGFydHMiLCJjaGFydCIsImFwcGx5U3VwcG9ydGVkIiwiZW5hYmxlU2VhcmNoIiwibm9TZWFyY2hJblRhYmxlcyIsInRhYmxlIiwidHlwZSIsImVuYWJsZUJhc2ljU2VhcmNoIiwiZ2V0Q29udGV4dFBhdGgiLCJnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyIsImZiQ29uZmlnIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0RmlsdGVyQ29uZmlndXJhdGlvbiIsImRlZmluZWRGaWx0ZXJGaWVsZHMiLCJPYmplY3QiLCJrZXlzIiwiZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleSIsInNLZXkiLCJTbG90IiwiRGVmYXVsdCIsInZpc3VhbEZpbHRlciIsImdldFZpc3VhbEZpbHRlcnMiLCJzbG90TmFtZSIsInRlbXBsYXRlIiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsInNldHRpbmdzIiwicmVxdWlyZWQiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnMiLCJvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiIsInNSZXN0cmljdGlvbiIsImFQcm9wcyIsIm9Qcm9wZXJ0eSIsImdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJQcm9wZXJ0eSIsIkFsbG93ZWRFeHByZXNzaW9ucyIsInRvU3RyaW5nIiwiZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvIiwiZGF0YVR5cGUiLCJtYXhDb25kaXRpb25zIiwiZ2V0RWRpdFN0YXRlRmlsdGVyUHJvcGVydHlJbmZvIiwiaGlkZGVuRmlsdGVyIiwiZ2V0U2VhcmNoUmVzdHJpY3Rpb25zIiwiZW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0IiwiaXNFbnRpdHlTZXQiLCJDYXBhYmlsaXRpZXMiLCJTZWFyY2hSZXN0cmljdGlvbnMiLCJnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwic05hdmlnYXRpb25QYXRoIiwib05hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJOYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzIiwiUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJmaW5kIiwib1Jlc3RyaWN0ZWRQcm9wZXJ0eSIsIk5hdmlnYXRpb25Qcm9wZXJ0eSIsIl9mZXRjaEJhc2ljUHJvcGVydHlJbmZvIiwib0ZpbHRlckZpZWxkSW5mbyIsImRpc3BsYXkiLCJjYXNlU2Vuc2l0aXZlIiwibWVudSIsImdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24iLCJhRXhwcmVzc2lvbnMiLCJhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkiLCJzb3J0IiwiYSIsImIiLCJkaXNwbGF5TW9kZSIsIm9Qcm9wZXJ0eUFubm90YXRpb25zIiwib0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyIsIm9UZXh0QW5ub3RhdGlvbiIsIlRleHQiLCJvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uIiwiVGV4dEFycmFuZ2VtZW50IiwiZmV0Y2hQcm9wZXJ0eUluZm8iLCJvVHlwZUNvbmZpZyIsIm9Qcm9wZXJ0eUluZm8iLCJzQW5ub3RhdGlvblBhdGgiLCJ0YXJnZXRQcm9wZXJ0eU9iamVjdCIsInRhcmdldE9iamVjdCIsIm9Gb3JtYXRPcHRpb25zIiwiZm9ybWF0T3B0aW9ucyIsIm9Db25zdHJhaW50cyIsImNvbnN0cmFpbnRzIiwiYXNzaWduIiwiaXNNdWx0aVZhbHVlIiwiYklzTXVsdGlWYWx1ZSIsImZpbHRlckV4cHJlc3Npb24iLCJfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5IiwiZW50cnkiLCJhZGRDaGlsZE5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcGVydGllcyIsInRhcmdldFByb3BlcnR5IiwiJHRhcmdldCIsImFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgiLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5IiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJnZXROYXZpZ2F0aW9uUHJvcGVydGllc1JlY3Vyc2l2ZWx5IiwiVGFyZ2V0IiwiaW5uZXJEYXRhRmllbGQiLCJnZXRBbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEiLCJsclRhYmxlcyIsImxpbmVJdGVtVGVybSIsImdldEVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsIlNlbGVjdGlvbkZpZWxkcyIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3RPcHRpb25zIiwicHJvcGVydHlJbmZvRmllbGRzIiwic3RhcnRzV2l0aCIsImZpbHRlclByb3BlcnR5UGF0aCIsImRlZmF1bHRGaWx0ZXJGaWVsZHMiLCJmZXRjaFR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwibnVsbGFibGUiLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciLCJhc3NpZ25EYXRhVHlwZVRvUHJvcGVydHlJbmZvIiwicHJvcGVydHlJbmZvRmllbGQiLCJhUmVxdWlyZWRQcm9wcyIsImFUeXBlQ29uZmlnIiwicmVwbGFjZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsInByb2Nlc3NTZWxlY3Rpb25GaWVsZHMiLCJkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcyIsInNlbGVjdGlvbkZpZWxkVHlwZXMiLCJwYXJhbWV0ZXJGaWVsZCIsInByb3BlcnR5Q29udmVydHlDb250ZXh0IiwicHJvcGVydHlUYXJnZXRPYmplY3QiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwib1JldCIsIlJlcXVpcmVkUHJvcGVydGllcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwic0VudGl0eVNldFBhdGgiLCJhUGF0aFBhcnRzIiwib05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwiTW9kZWxIZWxwZXIiLCJpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZCIsInNlYXJjaFJlc3RyaWN0aW9ucyIsImhpZGVCYXNpY1NlYXJjaCIsIkJvb2xlYW4iLCJTZWFyY2hhYmxlIiwiaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwib0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YSIsInBhcmFtZXRlckZpZWxkcyIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImxvY2FsZUNvbXBhcmUiLCJzRmV0Y2hQcm9wZXJ0aWVzIiwic1Byb3BlcnR5SW5mbyIsInByb3BTZWxlY3Rpb25GaWVsZHMiLCJmaWx0ZXJGYWNldHMiLCJGaWx0ZXJGYWNldHMiLCJhRmllbGRHcm91cHMiLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsImkiLCJmaWx0ZXJGYWNldCIsIklEIiwiYWxsRmlsdGVycyIsImZpbHRlciIsInNDb250ZXh0UGF0aCIsImFnZ3JlZ2F0ZXMiLCJhZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYWdncmVnYXRlS2V5IiwicmVsYXRpdmVQYXRoIiwiaXNDYXNlU2Vuc2l0aXZlIiwiZ2V0RXhwYW5kRmlsdGVyRmllbGRzIiwiZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiIsInZhbHVlTGlzdCIsInJlcXVpcmVkUHJvcGVydGllcyIsIkZldGNoVmFsdWVzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJCYXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uVGVybSwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSwgUHJvcGVydHlQYXRoIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvblR5cGUsXG5cdEZpbHRlckV4cHJlc3Npb25UeXBlLFxuXHRGaWx0ZXJSZXN0cmljdGlvbnMsXG5cdEZpbHRlclJlc3RyaWN0aW9uc1R5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9DYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB0eXBlIHsgRW50aXR5VHlwZUFubm90YXRpb25zLCBQcm9wZXJ0eUFubm90YXRpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9FZG1fVHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLFxuXHREYXRhRmllbGRXaXRoVXJsLFxuXHRGaWVsZEdyb3VwLFxuXHRMaW5lSXRlbSxcblx0UmVmZXJlbmNlRmFjZXRUeXBlcyxcblx0U2VsZWN0T3B0aW9uVHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0VmlzdWFsaXphdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9DaGFydFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eVR5cGVDb25maWcsIFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uLCBnZXRUeXBlQ29uZmlnLCBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB0eXBlIHsgVmlzdWFsRmlsdGVycyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IHsgZ2V0VmlzdWFsRmlsdGVycyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCwgUG9zaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIE92ZXJyaWRlVHlwZSwgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGlzQ29tcGxleFR5cGUsIGlzRW50aXR5U2V0LCBpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5LCBpc05hdmlnYXRpb25Qcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHR5cGUge1xuXHRBdmFpbGFiaWxpdHlUeXBlLFxuXHRGaWx0ZXJGaWVsZE1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0RmlsdGVyTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRGaWx0ZXJTZXR0aW5nc1xufSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgZ2V0U2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCIuLi9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbi8vaW1wb3J0IHsgaGFzVmFsdWVIZWxwIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgRmlsdGVyRmllbGQgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdHR5cGU/OiBzdHJpbmc7XG5cdGNvbmRpdGlvblBhdGg6IHN0cmluZztcblx0YXZhaWxhYmlsaXR5OiBBdmFpbGFiaWxpdHlUeXBlO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0dGVtcGxhdGU/OiBzdHJpbmc7XG5cdGdyb3VwPzogc3RyaW5nO1xuXHRtZW51Pzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xuXHRzZXR0aW5ncz86IEZpbHRlclNldHRpbmdzO1xuXHRpc1BhcmFtZXRlcj86IGJvb2xlYW47XG5cdHZpc3VhbEZpbHRlcj86IFZpc3VhbEZpbHRlcnM7XG5cdGNhc2VTZW5zaXRpdmU/OiBib29sZWFuO1xuXHRyZXF1aXJlZD86IGJvb2xlYW47XG59O1xuXG50eXBlIE1hbmlmZXN0RmlsdGVyRmllbGQgPSBGaWx0ZXJGaWVsZCAmIHtcblx0c2xvdE5hbWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIEZpbHRlckdyb3VwID0ge1xuXHRncm91cD86IHN0cmluZztcblx0Z3JvdXBMYWJlbD86IHN0cmluZztcbn07XG5cbmVudW0gZmlsdGVyRmllbGRUeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHRTbG90ID0gXCJTbG90XCJcbn1cblxuY29uc3Qgc0VkbVN0cmluZyA9IFwiRWRtLlN0cmluZ1wiO1xuY29uc3Qgc1N0cmluZ0RhdGFUeXBlID0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIjtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tRWxlbWVudEZpbHRlckZpZWxkID0gQ3VzdG9tRWxlbWVudDxNYW5pZmVzdEZpbHRlckZpZWxkPjtcblxuLyoqXG4gKiBFbnRlciBhbGwgRGF0YUZpZWxkcyBvZiBhIGdpdmVuIEZpZWxkR3JvdXAgaW50byB0aGUgZmlsdGVyRmFjZXRNYXAuXG4gKlxuICogQHBhcmFtIGZpZWxkR3JvdXBcbiAqIEByZXR1cm5zIFRoZSBtYXAgb2YgZmFjZXRzIGZvciB0aGUgZ2l2ZW4gRmllbGRHcm91cFxuICovXG5mdW5jdGlvbiBnZXRGaWVsZEdyb3VwRmlsdGVyR3JvdXBzKGZpZWxkR3JvdXA6IEZpZWxkR3JvdXApOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJHcm91cD4ge1xuXHRjb25zdCBmaWx0ZXJGYWNldE1hcDogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+ID0ge307XG5cdGZpZWxkR3JvdXAuRGF0YS5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiKSB7XG5cdFx0XHRmaWx0ZXJGYWNldE1hcFtkYXRhRmllbGQuVmFsdWUucGF0aF0gPSB7XG5cdFx0XHRcdGdyb3VwOiBmaWVsZEdyb3VwLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0Z3JvdXBMYWJlbDpcblx0XHRcdFx0XHRjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihmaWVsZEdyb3VwLkxhYmVsIHx8IGZpZWxkR3JvdXAuYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWwgfHwgZmllbGRHcm91cC5xdWFsaWZpZXIpXG5cdFx0XHRcdFx0KSB8fCBmaWVsZEdyb3VwLnF1YWxpZmllclxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gZmlsdGVyRmFjZXRNYXA7XG59XG5cbmZ1bmN0aW9uIGdldEV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyhzZWxlY3Rpb25WYXJpYW50czogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSk6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+IHtcblx0cmV0dXJuIHNlbGVjdGlvblZhcmlhbnRzLnJlZHVjZSgocHJldmlvdXNWYWx1ZTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4sIHNlbGVjdGlvblZhcmlhbnQpID0+IHtcblx0XHRzZWxlY3Rpb25WYXJpYW50LnByb3BlcnR5TmFtZXMuZm9yRWFjaCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRwcmV2aW91c1ZhbHVlW3Byb3BlcnR5TmFtZV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiBwcmV2aW91c1ZhbHVlO1xuXHR9LCB7fSk7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhhdCBhbGwgdGhlIHRhYmxlcyBmb3IgYSBkZWRpY2F0ZWQgZW50aXR5IHNldCBhcmUgY29uZmlndXJlZCBhcyBhbmFseXRpY2FsIHRhYmxlcy5cbiAqXG4gKiBAcGFyYW0gbGlzdFJlcG9ydFRhYmxlcyBMaXN0IHJlcG9ydCB0YWJsZXNcbiAqIEBwYXJhbSBjb250ZXh0UGF0aFxuICogQHJldHVybnMgSXMgRmlsdGVyQmFyIHNlYXJjaCBmaWVsZCBoaWRkZW4gb3Igbm90XG4gKi9cbmZ1bmN0aW9uIGNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsKGxpc3RSZXBvcnRUYWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdLCBjb250ZXh0UGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdGlmIChjb250ZXh0UGF0aCAmJiBsaXN0UmVwb3J0VGFibGVzLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gbGlzdFJlcG9ydFRhYmxlcy5ldmVyeSgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHZpc3VhbGl6YXRpb24uZW5hYmxlQW5hbHl0aWNzICYmIGNvbnRleHRQYXRoID09PSB2aXN1YWxpemF0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbjtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGlvblZhcmlhbnRzKFxuXHRsclRhYmxlVmlzdWFsaXphdGlvbnM6IFRhYmxlVmlzdWFsaXphdGlvbltdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbltdIHtcblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRyZXR1cm4gbHJUYWJsZVZpc3VhbGl6YXRpb25zXG5cdFx0Lm1hcCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgdGFibGVGaWx0ZXJzID0gdmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnM7XG5cdFx0XHRjb25zdCB0YWJsZVNWQ29uZmlnczogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gdGFibGVGaWx0ZXJzKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRhYmxlRmlsdGVyc1trZXldLnBhdGhzKSkge1xuXHRcdFx0XHRcdGNvbnN0IHBhdGhzID0gdGFibGVGaWx0ZXJzW2tleV0ucGF0aHM7XG5cdFx0XHRcdFx0cGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHBhdGggJiYgcGF0aC5hbm5vdGF0aW9uUGF0aCAmJiBzZWxlY3Rpb25WYXJpYW50UGF0aHMuaW5kZXhPZihwYXRoLmFubm90YXRpb25QYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGhzLnB1c2gocGF0aC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRDb25maWcgPSBnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbihwYXRoLmFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdGlvblZhcmlhbnRDb25maWcpIHtcblx0XHRcdFx0XHRcdFx0XHR0YWJsZVNWQ29uZmlncy5wdXNoKHNlbGVjdGlvblZhcmlhbnRDb25maWcpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0YWJsZVNWQ29uZmlncztcblx0XHR9KVxuXHRcdC5yZWR1Y2UoKHN2Q29uZmlncywgc2VsZWN0aW9uVmFyaWFudCkgPT4gc3ZDb25maWdzLmNvbmNhdChzZWxlY3Rpb25WYXJpYW50KSwgW10pO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbmRpdGlvbiBwYXRoIHJlcXVpcmVkIGZvciB0aGUgY29uZGl0aW9uIG1vZGVsLiBJdCBsb29rcyBhcyBmb2xsb3dzOlxuICogPDE6Ti1Qcm9wZXJ0eU5hbWU+KlxcLzwxOjEtUHJvcGVydHlOYW1lPi88UHJvcGVydHlOYW1lPi5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgcm9vdCBFbnRpdHlUeXBlXG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBmdWxsIHBhdGggdG8gdGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBjb25kaXRpb24gcGF0aFxuICovXG5jb25zdCBfZ2V0Q29uZGl0aW9uUGF0aCA9IGZ1bmN0aW9uIChlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCBwcm9wZXJ0eVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHBhcnRzID0gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblx0bGV0IHBhcnRpYWxQYXRoO1xuXHRsZXQga2V5ID0gXCJcIjtcblx0d2hpbGUgKHBhcnRzLmxlbmd0aCkge1xuXHRcdGxldCBwYXJ0ID0gcGFydHMuc2hpZnQoKSBhcyBzdHJpbmc7XG5cdFx0cGFydGlhbFBhdGggPSBwYXJ0aWFsUGF0aCA/IGAke3BhcnRpYWxQYXRofS8ke3BhcnR9YCA6IHBhcnQ7XG5cdFx0Y29uc3QgcHJvcGVydHk6IFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5ID0gZW50aXR5VHlwZS5yZXNvbHZlUGF0aChwYXJ0aWFsUGF0aCk7XG5cdFx0aWYgKGlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkocHJvcGVydHkpKSB7XG5cdFx0XHRwYXJ0ICs9IFwiKlwiO1xuXHRcdH1cblx0XHRrZXkgPSBrZXkgPyBgJHtrZXl9LyR7cGFydH1gIDogcGFydDtcblx0fVxuXHRyZXR1cm4ga2V5O1xufTtcblxuY29uc3QgX2NyZWF0ZUZpbHRlclNlbGVjdGlvbkZpZWxkID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRwcm9wZXJ0eTogUHJvcGVydHksXG5cdGZ1bGxQcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0aW5jbHVkZUhpZGRlbjogYm9vbGVhbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQge1xuXHQvLyBpZ25vcmUgY29tcGxleCBwcm9wZXJ0eSB0eXBlcyBhbmQgaGlkZGVuIGFubm90YXRlZCBvbmVzXG5cdGlmIChwcm9wZXJ0eSAmJiBwcm9wZXJ0eS50YXJnZXRUeXBlID09PSB1bmRlZmluZWQgJiYgKGluY2x1ZGVIaWRkZW4gfHwgcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSAhPT0gdHJ1ZSkpIHtcblx0XHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShwcm9wZXJ0eSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGtleTogS2V5SGVscGVyLmdldFNlbGVjdGlvbkZpZWxkS2V5RnJvbVBhdGgoZnVsbFByb3BlcnR5UGF0aCksXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKGZ1bGxQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0Y29uZGl0aW9uUGF0aDogX2dldENvbmRpdGlvblBhdGgoZW50aXR5VHlwZSwgZnVsbFByb3BlcnR5UGF0aCksXG5cdFx0XHRhdmFpbGFiaWxpdHk6IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uSGlkZGVuRmlsdGVyPy52YWx1ZU9mKCkgPT09IHRydWUgPyBcIkhpZGRlblwiIDogXCJBZGFwdGF0aW9uXCIsXG5cdFx0XHRsYWJlbDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5uYW1lKSksXG5cdFx0XHRncm91cDogdGFyZ2V0RW50aXR5VHlwZS5uYW1lLFxuXHRcdFx0Z3JvdXBMYWJlbDogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih0YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIHx8IHRhcmdldEVudGl0eVR5cGUubmFtZSlcblx0XHRcdClcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBfZ2V0U2VsZWN0aW9uRmllbGRzID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nLFxuXHRwcm9wZXJ0aWVzOiBBcnJheTxQcm9wZXJ0eT4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkTWFwOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7fTtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IChuYXZpZ2F0aW9uUGF0aCA/IGAke25hdmlnYXRpb25QYXRofS9gIDogXCJcIikgKyBwcm9wZXJ0eVBhdGg7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZCA9IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZChlbnRpdHlUeXBlLCBwcm9wZXJ0eSwgZnVsbFBhdGgsIGluY2x1ZGVIaWRkZW4sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0aWYgKHNlbGVjdGlvbkZpZWxkKSB7XG5cdFx0XHRcdHNlbGVjdGlvbkZpZWxkTWFwW2Z1bGxQYXRoXSA9IHNlbGVjdGlvbkZpZWxkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZE1hcDtcbn07XG5cbmNvbnN0IF9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGggPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdHByb3BlcnR5UGF0aHM6IEFycmF5PHN0cmluZz4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGxldCBzZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IHt9O1xuXHRpZiAocHJvcGVydHlQYXRocykge1xuXHRcdHByb3BlcnR5UGF0aHMuZm9yRWFjaCgocHJvcGVydHlQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRcdGxldCBsb2NhbFNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+O1xuXG5cdFx0XHRjb25zdCBwcm9wZXJ0eTogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgPSBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCk7XG5cdFx0XHRpZiAocHJvcGVydHkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNOYXZpZ2F0aW9uUHJvcGVydHkocHJvcGVydHkpKSB7XG5cdFx0XHRcdC8vIGhhbmRsZSBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHRcdFx0bG9jYWxTZWxlY3Rpb25GaWVsZHMgPSBfZ2V0U2VsZWN0aW9uRmllbGRzKFxuXHRcdFx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdHByb3BlcnR5LnRhcmdldFR5cGUuZW50aXR5UHJvcGVydGllcyxcblx0XHRcdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSBpZiAoaXNDb21wbGV4VHlwZShwcm9wZXJ0eS50YXJnZXRUeXBlKSkge1xuXHRcdFx0XHQvLyBoYW5kbGUgQ29tcGxleFR5cGUgcHJvcGVydGllc1xuXHRcdFx0XHRsb2NhbFNlbGVjdGlvbkZpZWxkcyA9IF9nZXRTZWxlY3Rpb25GaWVsZHMoXG5cdFx0XHRcdFx0ZW50aXR5VHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHkudGFyZ2V0VHlwZS5wcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgbmF2aWdhdGlvblBhdGggPSBwcm9wZXJ0eVBhdGguaW5jbHVkZXMoXCIvXCIpID8gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKS5zcGxpY2UoMCwgMSkuam9pbihcIi9cIikgOiBcIlwiO1xuXHRcdFx0XHRsb2NhbFNlbGVjdGlvbkZpZWxkcyA9IF9nZXRTZWxlY3Rpb25GaWVsZHMoZW50aXR5VHlwZSwgbmF2aWdhdGlvblBhdGgsIFtwcm9wZXJ0eV0sIGluY2x1ZGVIaWRkZW4sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxlY3Rpb25GaWVsZHMgPSB7XG5cdFx0XHRcdC4uLnNlbGVjdGlvbkZpZWxkcyxcblx0XHRcdFx0Li4ubG9jYWxTZWxlY3Rpb25GaWVsZHNcblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcbn07XG5cbmNvbnN0IF9nZXRGaWx0ZXJGaWVsZCA9IGZ1bmN0aW9uIChcblx0ZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4sXG5cdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlXG4pOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCB7XG5cdGxldCBmaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBmaWx0ZXJGaWVsZHNbcHJvcGVydHlQYXRoXTtcblx0aWYgKGZpbHRlckZpZWxkKSB7XG5cdFx0ZGVsZXRlIGZpbHRlckZpZWxkc1twcm9wZXJ0eVBhdGhdO1xuXHR9IGVsc2Uge1xuXHRcdGZpbHRlckZpZWxkID0gX2NyZWF0ZUZpbHRlclNlbGVjdGlvbkZpZWxkKGVudGl0eVR5cGUsIGVudGl0eVR5cGUucmVzb2x2ZVBhdGgocHJvcGVydHlQYXRoKSwgcHJvcGVydHlQYXRoLCB0cnVlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0fVxuXHRpZiAoIWZpbHRlckZpZWxkKSB7XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpPy5hZGRJc3N1ZShJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sIElzc3VlU2V2ZXJpdHkuSGlnaCwgSXNzdWVUeXBlLk1JU1NJTkdfU0VMRUNUSU9ORklFTEQpO1xuXHR9XG5cdC8vIGRlZmluZWQgU2VsZWN0aW9uRmllbGRzIGFyZSBhdmFpbGFibGUgYnkgZGVmYXVsdFxuXHRpZiAoZmlsdGVyRmllbGQpIHtcblx0XHRmaWx0ZXJGaWVsZC5hdmFpbGFiaWxpdHkgPSBmaWx0ZXJGaWVsZC5hdmFpbGFiaWxpdHkgPT09IFwiSGlkZGVuXCIgPyBcIkhpZGRlblwiIDogXCJEZWZhdWx0XCI7XG5cdFx0ZmlsdGVyRmllbGQuaXNQYXJhbWV0ZXIgPSAhIWVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUmVzdWx0Q29udGV4dDtcblx0fVxuXHRyZXR1cm4gZmlsdGVyRmllbGQ7XG59O1xuXG5jb25zdCBfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyA9IGZ1bmN0aW9uIChcblx0YVNlbGVjdE9wdGlvbnM6IFNlbGVjdE9wdGlvblR5cGVbXSxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPixcblx0YW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzOiBQcm9wZXJ0eVBhdGhbXVxuKTogRmlsdGVyRmllbGRbXSB7XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXSA9IFtdO1xuXHRjb25zdCBVSVNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblx0Y29uc3QgcHJvcGVydGllcyA9IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcztcblx0Ly8gVXNpbmcgZW50aXR5VHlwZSBpbnN0ZWFkIG9mIGVudGl0eVNldFxuXHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0VUlTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0fSk7XG5cdGlmIChhU2VsZWN0T3B0aW9ucyAmJiBhU2VsZWN0T3B0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0YVNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gc2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eU5hbWU/LnZhbHVlO1xuXHRcdFx0Y29uc3QgY3VycmVudFNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblx0XHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkcz8uZm9yRWFjaCgoU2VsZWN0aW9uRmllbGQpID0+IHtcblx0XHRcdFx0Y3VycmVudFNlbGVjdGlvbkZpZWxkc1tTZWxlY3Rpb25GaWVsZC52YWx1ZV0gPSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoc1Byb3BlcnR5UGF0aCAmJiAhKHNQcm9wZXJ0eVBhdGggaW4gZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRpZiAoIShzUHJvcGVydHlQYXRoIGluIGN1cnJlbnRTZWxlY3Rpb25GaWVsZHMpKSB7XG5cdFx0XHRcdFx0Y29uc3QgRmlsdGVyRmllbGQ6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkID0gZ2V0RmlsdGVyRmllbGQoc1Byb3BlcnR5UGF0aCwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdFx0XHRcdFx0aWYgKEZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25GaWVsZHMucHVzaChGaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAocHJvcGVydGllcykge1xuXHRcdHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IFByb3BlcnR5KSA9PiB7XG5cdFx0XHRjb25zdCBkZWZhdWx0RmlsdGVyVmFsdWUgPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5GaWx0ZXJEZWZhdWx0VmFsdWU7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0aWYgKCEocHJvcGVydHlQYXRoIGluIGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcykpIHtcblx0XHRcdFx0aWYgKGRlZmF1bHRGaWx0ZXJWYWx1ZSAmJiAhKHByb3BlcnR5UGF0aCBpbiBVSVNlbGVjdGlvbkZpZWxkcykpIHtcblx0XHRcdFx0XHRjb25zdCBGaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBnZXRGaWx0ZXJGaWVsZChwcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdGlmIChGaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRcdFx0c2VsZWN0aW9uRmllbGRzLnB1c2goRmlsdGVyRmllbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZHM7XG59O1xuXG4vKipcbiAqIEdldCBhbGwgcGFyYW1ldGVyIGZpbHRlciBmaWVsZHMgaW4gY2FzZSBvZiBhIHBhcmFtZXRlcml6ZWQgc2VydmljZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgcGFyYW1ldGVyIEZpbHRlckZpZWxkc1xuICovXG5mdW5jdGlvbiBfZ2V0UGFyYW1ldGVyRmllbGRzKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBGaWx0ZXJGaWVsZFtdIHtcblx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRjb25zdCBwYXJhbWV0ZXJFbnRpdHlUeXBlID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5lbnRpdHlUeXBlO1xuXHRjb25zdCBpc1BhcmFtZXRlcml6ZWQgPSAhIXBhcmFtZXRlckVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUmVzdWx0Q29udGV4dCAmJiAhZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQ7XG5cdGNvbnN0IHBhcmFtZXRlckNvbnZlcnRlckNvbnRleHQgPVxuXHRcdGlzUGFyYW1ldGVyaXplZCAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3IoYC8ke2RhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZX1gKTtcblxuXHRyZXR1cm4gKFxuXHRcdHBhcmFtZXRlckNvbnZlcnRlckNvbnRleHRcblx0XHRcdD8gcGFyYW1ldGVyRW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLm1hcChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX2dldEZpbHRlckZpZWxkKFxuXHRcdFx0XHRcdFx0e30gYXMgUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+LFxuXHRcdFx0XHRcdFx0cHJvcGVydHkubmFtZSxcblx0XHRcdFx0XHRcdHBhcmFtZXRlckNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJFbnRpdHlUeXBlXG5cdFx0XHRcdFx0KTtcblx0XHRcdCAgfSlcblx0XHRcdDogW11cblx0KSBhcyBGaWx0ZXJGaWVsZFtdO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIEZpbHRlckJhciBzZWFyY2ggZmllbGQgaXMgaGlkZGVuIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gbGlzdFJlcG9ydFRhYmxlcyBUaGUgbGlzdCByZXBvcnQgdGFibGVzXG4gKiBAcGFyYW0gY2hhcnRzIFRoZSBBTFAgY2hhcnRzXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBpbmZvcm1hdGlvbiBpZiB0aGUgRmlsdGVyQmFyIHNlYXJjaCBmaWVsZCBpcyBoaWRkZW4gb3Igbm90XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJCYXJIaWRlQmFzaWNTZWFyY2ggPSBmdW5jdGlvbiAoXG5cdGxpc3RSZXBvcnRUYWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdLFxuXHRjaGFydHM6IENoYXJ0VmlzdWFsaXphdGlvbltdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBib29sZWFuIHtcblx0Ly8gQ2hlY2sgaWYgY2hhcnRzIGFsbG93IHNlYXJjaFxuXHRjb25zdCBub1NlYXJjaEluQ2hhcnRzID0gY2hhcnRzLmxlbmd0aCA9PT0gMCB8fCBjaGFydHMuZXZlcnkoKGNoYXJ0KSA9PiAhY2hhcnQuYXBwbHlTdXBwb3J0ZWQuZW5hYmxlU2VhcmNoKTtcblxuXHQvLyBDaGVjayBpZiBhbGwgdGFibGVzIGFyZSBhbmFseXRpY2FsIGFuZCBub25lIG9mIHRoZW0gYWxsb3cgZm9yIHNlYXJjaFxuXHQvLyBvciBhbGwgdGFibGVzIGFyZSBUcmVlVGFibGUgYW5kIG5vbmUgb2YgdGhlbSBhbGxvdyBmb3Igc2VhcmNoXG5cdGNvbnN0IG5vU2VhcmNoSW5UYWJsZXMgPVxuXHRcdGxpc3RSZXBvcnRUYWJsZXMubGVuZ3RoID09PSAwIHx8XG5cdFx0bGlzdFJlcG9ydFRhYmxlcy5ldmVyeSgodGFibGUpID0+ICh0YWJsZS5lbmFibGVBbmFseXRpY3MgfHwgdGFibGUuY29udHJvbC50eXBlID09PSBcIlRyZWVUYWJsZVwiKSAmJiAhdGFibGUuZW5hYmxlQmFzaWNTZWFyY2gpO1xuXG5cdGNvbnN0IGNvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXHRpZiAoY29udGV4dFBhdGggJiYgbm9TZWFyY2hJbkNoYXJ0cyAmJiBub1NlYXJjaEluVGFibGVzKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyBmaWx0ZXIgZmllbGRzIGZyb20gdGhlIG1hbmlmZXN0LlxuICpcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBjdXJyZW50IGVudGl0eVR5cGVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGZpbHRlciBmaWVsZHMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1hbmlmZXN0RmlsdGVyRmllbGRzID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQ+IHtcblx0Y29uc3QgZmJDb25maWc6IEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0RmlsdGVyQ29uZmlndXJhdGlvbigpO1xuXHRjb25zdCBkZWZpbmVkRmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZE1hbmlmZXN0Q29uZmlndXJhdGlvbj4gPSBmYkNvbmZpZz8uZmlsdGVyRmllbGRzIHx8IHt9O1xuXHRjb25zdCBzZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IF9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGgoXG5cdFx0ZW50aXR5VHlwZSxcblx0XHRPYmplY3Qua2V5cyhkZWZpbmVkRmlsdGVyRmllbGRzKS5tYXAoKGtleSkgPT4gS2V5SGVscGVyLmdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkoa2V5KSksXG5cdFx0dHJ1ZSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdCk7XG5cdGNvbnN0IGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudEZpbHRlckZpZWxkPiA9IHt9O1xuXG5cdGZvciAoY29uc3Qgc0tleSBpbiBkZWZpbmVkRmlsdGVyRmllbGRzKSB7XG5cdFx0Y29uc3QgZmlsdGVyRmllbGQgPSBkZWZpbmVkRmlsdGVyRmllbGRzW3NLZXldO1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IEtleUhlbHBlci5nZXRQYXRoRnJvbVNlbGVjdGlvbkZpZWxkS2V5KHNLZXkpO1xuXHRcdGNvbnN0IHNlbGVjdGlvbkZpZWxkID0gc2VsZWN0aW9uRmllbGRzW3Byb3BlcnR5TmFtZV07XG5cdFx0Y29uc3QgdHlwZSA9IGZpbHRlckZpZWxkLnR5cGUgPT09IFwiU2xvdFwiID8gZmlsdGVyRmllbGRUeXBlLlNsb3QgOiBmaWx0ZXJGaWVsZFR5cGUuRGVmYXVsdDtcblx0XHRjb25zdCB2aXN1YWxGaWx0ZXIgPVxuXHRcdFx0ZmlsdGVyRmllbGQgJiYgZmlsdGVyRmllbGQ/LnZpc3VhbEZpbHRlclxuXHRcdFx0XHQ/IGdldFZpc3VhbEZpbHRlcnMoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCwgc0tleSwgZGVmaW5lZEZpbHRlckZpZWxkcylcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0ZmlsdGVyRmllbGRzW3NLZXldID0ge1xuXHRcdFx0a2V5OiBzS2V5LFxuXHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdHNsb3ROYW1lOiBmaWx0ZXJGaWVsZD8uc2xvdE5hbWUgfHwgc0tleSxcblx0XHRcdGFubm90YXRpb25QYXRoOiBzZWxlY3Rpb25GaWVsZD8uYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRjb25kaXRpb25QYXRoOiBzZWxlY3Rpb25GaWVsZD8uY29uZGl0aW9uUGF0aCB8fCBwcm9wZXJ0eU5hbWUsXG5cdFx0XHR0ZW1wbGF0ZTogZmlsdGVyRmllbGQudGVtcGxhdGUsXG5cdFx0XHRsYWJlbDogZmlsdGVyRmllbGQubGFiZWwsXG5cdFx0XHRwb3NpdGlvbjogZmlsdGVyRmllbGQucG9zaXRpb24gfHwgeyBwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlciB9LFxuXHRcdFx0YXZhaWxhYmlsaXR5OiBmaWx0ZXJGaWVsZC5hdmFpbGFiaWxpdHkgfHwgXCJEZWZhdWx0XCIsXG5cdFx0XHRzZXR0aW5nczogZmlsdGVyRmllbGQuc2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxGaWx0ZXI6IHZpc3VhbEZpbHRlcixcblx0XHRcdHJlcXVpcmVkOiBmaWx0ZXJGaWVsZC5yZXF1aXJlZFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGZpbHRlckZpZWxkcztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJGaWVsZCA9IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZTogRW50aXR5VHlwZSkge1xuXHRyZXR1cm4gX2dldEZpbHRlckZpZWxkKHt9LCBwcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZpbHRlclJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChcblx0b0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IEZpbHRlclJlc3RyaWN0aW9uc1R5cGUgfCB1bmRlZmluZWQsXG5cdHNSZXN0cmljdGlvbjogXCJSZXF1aXJlZFByb3BlcnRpZXNcIiB8IFwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIlxuKSB7XG5cdGxldCBhUHJvcHM6IHN0cmluZ1tdID0gW107XG5cdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dKSB7XG5cdFx0YVByb3BzID0gb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uXS5tYXAoZnVuY3Rpb24gKG9Qcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS52YWx1ZTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVByb3BzO1xufTtcbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbjogRmlsdGVyUmVzdHJpY3Rpb25zVHlwZSB8IHVuZGVmaW5lZCkge1xuXHRjb25zdCBtQWxsb3dlZEV4cHJlc3Npb25zOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJFeHByZXNzaW9uVHlwZVtdPiA9IHt9O1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gJiYgb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucykge1xuXHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BlcnR5OiBGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlKSB7XG5cdFx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0XHRpZiAob1Byb3BlcnR5LlByb3BlcnR5Py52YWx1ZSAmJiBvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zKSB7XG5cdFx0XHRcdGlmIChtQWxsb3dlZEV4cHJlc3Npb25zW29Qcm9wZXJ0eS5Qcm9wZXJ0eT8udmFsdWVdKSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHk/LnZhbHVlXS5wdXNoKG9Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnMudG9TdHJpbmcoKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHk/LnZhbHVlXSA9IFtvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zLnRvU3RyaW5nKCldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG1BbGxvd2VkRXhwcmVzc2lvbnM7XG59O1xuXG5jb25zdCBnZXRTZWFyY2hGaWx0ZXJQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoKTogUHJvcGVydHlJbmZvIHtcblx0cmV0dXJuIHtcblx0XHRuYW1lOiBcIiRzZWFyY2hcIixcblx0XHRwYXRoOiBcIiRzZWFyY2hcIixcblx0XHRkYXRhVHlwZTogc1N0cmluZ0RhdGFUeXBlLFxuXHRcdG1heENvbmRpdGlvbnM6IDFcblx0fTtcbn07XG5cbmNvbnN0IGdldEVkaXRTdGF0ZUZpbHRlclByb3BlcnR5SW5mbyA9IGZ1bmN0aW9uICgpOiBQcm9wZXJ0eUluZm8ge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdHBhdGg6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdGdyb3VwTGFiZWw6IFwiXCIsXG5cdFx0Z3JvdXA6IFwiXCIsXG5cdFx0ZGF0YVR5cGU6IHNTdHJpbmdEYXRhVHlwZSxcblx0XHRoaWRkZW5GaWx0ZXI6IGZhbHNlXG5cdH07XG59O1xuXG5jb25zdCBnZXRTZWFyY2hSZXN0cmljdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRyZXR1cm4gaXNFbnRpdHlTZXQoZW50aXR5U2V0KSA/IGVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LlNlYXJjaFJlc3RyaWN0aW9ucyA6IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHNOYXZpZ2F0aW9uUGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uTmF2aWdhdGlvblJlc3RyaWN0aW9ucztcblx0Y29uc3QgYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzID0gb05hdmlnYXRpb25SZXN0cmljdGlvbnMgJiYgb05hdmlnYXRpb25SZXN0cmljdGlvbnMuUmVzdHJpY3RlZFByb3BlcnRpZXM7XG5cdHJldHVybiAoXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzICYmXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9SZXN0cmljdGVkUHJvcGVydHkpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkgJiZcblx0XHRcdFx0b1Jlc3RyaWN0ZWRQcm9wZXJ0eS5OYXZpZ2F0aW9uUHJvcGVydHkgJiZcblx0XHRcdFx0b1Jlc3RyaWN0ZWRQcm9wZXJ0eS5OYXZpZ2F0aW9uUHJvcGVydHkudmFsdWUgPT09IHNOYXZpZ2F0aW9uUGF0aFxuXHRcdFx0KTtcblx0XHR9KVxuXHQpO1xufTtcblxudHlwZSBQcm9wZXJ0eUluZm8gPSB7XG5cdGtleT86IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG5cdGNvbmRpdGlvblBhdGg/OiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0cGF0aD86IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmc7XG5cdGdyb3VwTGFiZWw/OiBzdHJpbmc7XG5cdG1heENvbmRpdGlvbnM/OiBudW1iZXI7XG5cdGRhdGFUeXBlPzogc3RyaW5nO1xuXHRncm91cD86IHN0cmluZztcblx0aGlkZGVuRmlsdGVyPzogYm9vbGVhbjtcblx0ZGlzcGxheT86IHN0cmluZztcblx0aXNQYXJhbWV0ZXI/OiBib29sZWFuO1xuXHRjYXNlU2Vuc2l0aXZlPzogYm9vbGVhbjtcblx0YXZhaWxhYmlsaXR5PzogQXZhaWxhYmlsaXR5VHlwZTtcblx0cG9zaXRpb24/OiBQb3NpdGlvbjtcblx0dHlwZT86IHN0cmluZztcblx0dGVtcGxhdGU/OiBzdHJpbmc7XG5cdG1lbnU/OiBzdHJpbmc7XG5cdHJlcXVpcmVkPzogYm9vbGVhbjtcblx0ZmlsdGVyRXhwcmVzc2lvbj86IHN0cmluZztcbn07XG5jb25zdCBfZmV0Y2hCYXNpY1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChvRmlsdGVyRmllbGRJbmZvOiBGaWx0ZXJGaWVsZCk6IFByb3BlcnR5SW5mbyB7XG5cdHJldHVybiB7XG5cdFx0a2V5OiBvRmlsdGVyRmllbGRJbmZvLmtleSxcblx0XHRhbm5vdGF0aW9uUGF0aDogb0ZpbHRlckZpZWxkSW5mby5hbm5vdGF0aW9uUGF0aCxcblx0XHRjb25kaXRpb25QYXRoOiBvRmlsdGVyRmllbGRJbmZvLmNvbmRpdGlvblBhdGgsXG5cdFx0bmFtZTogb0ZpbHRlckZpZWxkSW5mby5jb25kaXRpb25QYXRoLFxuXHRcdGxhYmVsOiBvRmlsdGVyRmllbGRJbmZvLmxhYmVsLFxuXHRcdGhpZGRlbkZpbHRlcjogb0ZpbHRlckZpZWxkSW5mby5hdmFpbGFiaWxpdHkgPT09IFwiSGlkZGVuXCIsXG5cdFx0ZGlzcGxheTogXCJWYWx1ZVwiLFxuXHRcdGlzUGFyYW1ldGVyOiBvRmlsdGVyRmllbGRJbmZvLmlzUGFyYW1ldGVyLFxuXHRcdGNhc2VTZW5zaXRpdmU6IG9GaWx0ZXJGaWVsZEluZm8uY2FzZVNlbnNpdGl2ZSxcblx0XHRhdmFpbGFiaWxpdHk6IG9GaWx0ZXJGaWVsZEluZm8uYXZhaWxhYmlsaXR5LFxuXHRcdHBvc2l0aW9uOiBvRmlsdGVyRmllbGRJbmZvLnBvc2l0aW9uLFxuXHRcdHR5cGU6IG9GaWx0ZXJGaWVsZEluZm8udHlwZSxcblx0XHR0ZW1wbGF0ZTogb0ZpbHRlckZpZWxkSW5mby50ZW1wbGF0ZSxcblx0XHRtZW51OiBvRmlsdGVyRmllbGRJbmZvLm1lbnUsXG5cdFx0cmVxdWlyZWQ6IG9GaWx0ZXJGaWVsZEluZm8ucmVxdWlyZWRcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uID0gZnVuY3Rpb24gKGFFeHByZXNzaW9uczogc3RyaW5nW10pIHtcblx0Y29uc3QgYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5ID0gW1xuXHRcdFwiU2luZ2xlVmFsdWVcIixcblx0XHRcIk11bHRpVmFsdWVcIixcblx0XHRcIlNpbmdsZVJhbmdlXCIsXG5cdFx0XCJNdWx0aVJhbmdlXCIsXG5cdFx0XCJTZWFyY2hFeHByZXNzaW9uXCIsXG5cdFx0XCJNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXCJcblx0XTtcblxuXHRhRXhwcmVzc2lvbnMuc29ydChmdW5jdGlvbiAoYTogc3RyaW5nLCBiOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYSkgLSBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihiKTtcblx0fSk7XG5cblx0cmV0dXJuIGFFeHByZXNzaW9uc1swXTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5TW9kZSA9IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogUHJvcGVydHlBbm5vdGF0aW9ucywgb0NvbGxlY3Rpb25Bbm5vdGF0aW9uczogRW50aXR5VHlwZUFubm90YXRpb25zKSB7XG5cdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eUFubm90YXRpb25zPy5Db21tb24/LlRleHQsXG5cdFx0b1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbiA9XG5cdFx0XHRvVGV4dEFubm90YXRpb24gJiZcblx0XHRcdCgob1Byb3BlcnR5QW5ub3RhdGlvbnMgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHx8XG5cdFx0XHRcdChvQ29sbGVjdGlvbkFubm90YXRpb25zICYmIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpKTtcblxuXHRpZiAob1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbikge1xuXHRcdGlmIChvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uLnZhbHVlT2YoKSA9PT0gXCJVSS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRcdHJldHVybiBcIkRlc2NyaXB0aW9uXCI7XG5cdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uLnZhbHVlT2YoKSA9PT0gXCJVSS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRMYXN0XCIpIHtcblx0XHRcdHJldHVybiBcIlZhbHVlRGVzY3JpcHRpb25cIjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25WYWx1ZVwiOyAvL1RleHRGaXJzdFxuXHR9XG5cdHJldHVybiBvVGV4dEFubm90YXRpb24gPyBcIkRlc2NyaXB0aW9uVmFsdWVcIiA6IFwiVmFsdWVcIjtcbn07XG5cbmV4cG9ydCBjb25zdCBmZXRjaFByb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0b0ZpbHRlckZpZWxkSW5mbzogRmlsdGVyRmllbGQsXG5cdG9UeXBlQ29uZmlnOiBQYXJ0aWFsPFByb3BlcnR5VHlwZUNvbmZpZz5cbik6IFByb3BlcnR5SW5mbyB7XG5cdGxldCBvUHJvcGVydHlJbmZvID0gX2ZldGNoQmFzaWNQcm9wZXJ0eUluZm8ob0ZpbHRlckZpZWxkSW5mbyk7XG5cdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IG9GaWx0ZXJGaWVsZEluZm8uYW5ub3RhdGlvblBhdGg7XG5cblx0aWYgKCFzQW5ub3RhdGlvblBhdGgpIHtcblx0XHRyZXR1cm4gb1Byb3BlcnR5SW5mbztcblx0fVxuXHRjb25zdCB0YXJnZXRQcm9wZXJ0eU9iamVjdCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihzQW5ub3RhdGlvblBhdGgpLmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRPYmplY3Q7XG5cblx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnMgPSB0YXJnZXRQcm9wZXJ0eU9iamVjdD8uYW5ub3RhdGlvbnM7XG5cdGNvbnN0IG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgPSBjb252ZXJ0ZXJDb250ZXh0Py5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucztcblxuXHRjb25zdCBvRm9ybWF0T3B0aW9ucyA9IG9UeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnM7XG5cdGNvbnN0IG9Db25zdHJhaW50cyA9IG9UeXBlQ29uZmlnLmNvbnN0cmFpbnRzO1xuXHRvUHJvcGVydHlJbmZvID0gT2JqZWN0LmFzc2lnbihvUHJvcGVydHlJbmZvLCB7XG5cdFx0Zm9ybWF0T3B0aW9uczogb0Zvcm1hdE9wdGlvbnMsXG5cdFx0Y29uc3RyYWludHM6IG9Db25zdHJhaW50cyxcblx0XHRkaXNwbGF5OiBkaXNwbGF5TW9kZShvUHJvcGVydHlBbm5vdGF0aW9ucywgb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucylcblx0fSk7XG5cdHJldHVybiBvUHJvcGVydHlJbmZvO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzTXVsdGlWYWx1ZSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5SW5mbykge1xuXHRsZXQgYklzTXVsdGlWYWx1ZSA9IHRydWU7XG5cdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0c3dpdGNoIChvUHJvcGVydHkuZmlsdGVyRXhwcmVzc2lvbikge1xuXHRcdGNhc2UgXCJTZWFyY2hFeHByZXNzaW9uXCI6XG5cdFx0Y2FzZSBcIlNpbmdsZVJhbmdlXCI6XG5cdFx0Y2FzZSBcIlNpbmdsZVZhbHVlXCI6XG5cdFx0XHRiSXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblx0aWYgKG9Qcm9wZXJ0eS50eXBlICYmIG9Qcm9wZXJ0eS50eXBlLmluZGV4T2YoXCJCb29sZWFuXCIpID4gMCkge1xuXHRcdGJJc011bHRpVmFsdWUgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gYklzTXVsdGlWYWx1ZTtcbn07XG5cbmNvbnN0IF9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdGVudHJ5OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzXG4pOiBlbnRyeSBpcyBBbm5vdGF0aW9uVGVybTxEYXRhRmllbGQgfCBEYXRhRmllbGRXaXRoVXJsIHwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoPiB7XG5cdHJldHVybiAoXG5cdFx0KGVudHJ5LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdGVudHJ5LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsIHx8XG5cdFx0XHRlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoKSAmJlxuXHRcdGVudHJ5LlZhbHVlLnBhdGguaW5jbHVkZXMoXCIvXCIpXG5cdCk7XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGFkZGl0aW9uYWwgcHJvcGVydHkgd2hpY2ggcmVmZXJlbmNlcyB0byB0aGUgdW5pdCwgdGltZXpvbmUsIHRleHRBcnJhbmdlbWVudCBvciBjdXJyZW5jeSBmcm9tIGEgZGF0YSBmaWVsZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBkYXRhIGZpZWxkIHRvIGJlIGNvbnNpZGVyZWRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIG5hdlByb3BlcnRpZXMgVGhlIGxpc3Qgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG4gKi9cbmNvbnN0IGFkZENoaWxkTmF2aWdhdGlvblByb3BlcnRpZXMgPSBmdW5jdGlvbiAoXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bmF2UHJvcGVydGllczogc3RyaW5nW11cbikge1xuXHRjb25zdCB0YXJnZXRQcm9wZXJ0eSA9IChkYXRhRmllbGQgYXMgRGF0YUZpZWxkKS5WYWx1ZT8uJHRhcmdldDtcblx0aWYgKHRhcmdldFByb3BlcnR5KSB7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5UGF0aCA9XG5cdFx0XHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCh0YXJnZXRQcm9wZXJ0eSkgfHxcblx0XHRcdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCh0YXJnZXRQcm9wZXJ0eSkgfHxcblx0XHRcdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoKHRhcmdldFByb3BlcnR5KSB8fFxuXHRcdFx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoKHRhcmdldFByb3BlcnR5KTtcblx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHkgPSBhZGRpdGlvbmFsUHJvcGVydHlQYXRoXG5cdFx0XHQ/IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCBhZGRpdGlvbmFsUHJvcGVydHlQYXRoKS5uYXZpZ2F0aW9uUHJvcGVydGllc1xuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eT8ubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5WzBdLm5hbWU7XG5cdFx0XHRpZiAoIW5hdlByb3BlcnRpZXMuaW5jbHVkZXMobmF2aWdhdGlvblByb3BlcnR5UGF0aCkpIHtcblx0XHRcdFx0bmF2UHJvcGVydGllcy5wdXNoKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBHZXRzIHVzZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGZvciBhdmFpbGFibGUgZGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBuYXZQcm9wZXJ0aWVzIFRoZSBsaXN0IG9mIG5hdmlnYXRpb24gcHJvcGVydGllc1xuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgZGF0YSBmaWVsZCB0byBiZSBjb25zaWRlcmVkXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBsaXN0IG9mIG5hdmlnYXRpb24gcHJvcGVydGllc1xuICovXG5jb25zdCBnZXROYXZpZ2F0aW9uUHJvcGVydGllc1JlY3Vyc2l2ZWx5ID0gZnVuY3Rpb24gKFxuXHRuYXZQcm9wZXJ0aWVzOiBzdHJpbmdbXSxcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pIHtcblx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlKSB7XG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGU6XG5cdFx0XHRcdFx0ZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0LkRhdGE/LmZvckVhY2goKGlubmVyRGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRcdFx0XHRnZXROYXZpZ2F0aW9uUHJvcGVydGllc1JlY3Vyc2l2ZWx5KG5hdlByb3BlcnRpZXMsIGlubmVyRGF0YUZpZWxkLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGlmIChfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5KGRhdGFGaWVsZCkpIHtcblx0XHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCBkYXRhRmllbGQuVmFsdWUucGF0aClcblx0XHRcdFx0XHQubmF2aWdhdGlvblByb3BlcnRpZXNbMF0ubmFtZTtcblx0XHRcdFx0aWYgKCFuYXZQcm9wZXJ0aWVzLmluY2x1ZGVzKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpKSB7XG5cdFx0XHRcdFx0bmF2UHJvcGVydGllcy5wdXNoKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBBZGRpdGlvbmFsIHByb3BlcnR5IGZyb20gdGV4dCBhcnJhbmdlbWVudC91bml0cy9jdXJyZW5jaWVzL3RpbWV6b25lLi4uXG5cdFx0XHRhZGRDaGlsZE5hdmlnYXRpb25Qcm9wZXJ0aWVzKGRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dCwgbmF2UHJvcGVydGllcyk7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblx0cmV0dXJuIG5hdlByb3BlcnRpZXM7XG59O1xuXG5jb25zdCBnZXRBbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGxyVGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSA9IFtdLFxuXHRhbm5vdGF0aW9uUGF0aCA9IFwiXCIsXG5cdGluY2x1ZGVIaWRkZW4gPSBmYWxzZSxcblx0bGluZUl0ZW1UZXJtPzogc3RyaW5nXG4pIHtcblx0Ly8gRmV0Y2ggYWxsIHNlbGVjdGlvblZhcmlhbnRzIGRlZmluZWQgaW4gdGhlIGRpZmZlcmVudCB2aXN1YWxpemF0aW9ucyBhbmQgZGlmZmVyZW50IHZpZXdzIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50czogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IGdldFNlbGVjdGlvblZhcmlhbnRzKGxyVGFibGVzLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgcHJvcGVydGllcyB0byBiZSB1c2VkIGluIHNlbGVjdGlvbiB2YXJpYW50c1xuXHRjb25zdCBleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0gZ2V0RXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKHNlbGVjdGlvblZhcmlhbnRzKTtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHQvL0ZpbHRlcnMgd2hpY2ggaGFzIHRvIGJlIGFkZGVkIHdoaWNoIGlzIHBhcnQgb2YgU1YvRGVmYXVsdCBhbm5vdGF0aW9ucyBidXQgbm90IHByZXNlbnQgaW4gdGhlIFNlbGVjdGlvbkZpZWxkc1xuXHRjb25zdCBhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHMgPSAoKGFubm90YXRpb25QYXRoICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGgpPy5hbm5vdGF0aW9uKSB8fFxuXHRcdGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5TZWxlY3Rpb25GaWVsZHMgfHxcblx0XHRbXSkgYXMgUHJvcGVydHlQYXRoW107XG5cblx0bGV0IG5hdlByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdGlmIChsclRhYmxlcy5sZW5ndGggPT09IDAgJiYgISFsaW5lSXRlbVRlcm0pIHtcblx0XHQoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihsaW5lSXRlbVRlcm0pLmFubm90YXRpb24gYXMgTGluZUl0ZW0pPy5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRcdG5hdlByb3BlcnRpZXMgPSBnZXROYXZpZ2F0aW9uUHJvcGVydGllc1JlY3Vyc2l2ZWx5KG5hdlByb3BlcnRpZXMsIGRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgYWxsIHBvdGVudGlhbCBmaWx0ZXIgZmllbGRzIGJhc2VkIG9uLi4uXG5cdGNvbnN0IGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0ge1xuXHRcdC8vIC4uLm5vbiBoaWRkZW4gcHJvcGVydGllcyBvZiB0aGUgZW50aXR5XG5cdFx0Li4uX2dldFNlbGVjdGlvbkZpZWxkcyhlbnRpdHlUeXBlLCBcIlwiLCBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMsIGluY2x1ZGVIaWRkZW4sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdC8vIC4uLiBub24gaGlkZGVuIHByb3BlcnRpZXMgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Li4uX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aChlbnRpdHlUeXBlLCBuYXZQcm9wZXJ0aWVzLCBmYWxzZSwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Ly8gLi4uYWRkaXRpb25hbCBtYW5pZmVzdCBkZWZpbmVkIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdC4uLl9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGgoXG5cdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRGaWx0ZXJDb25maWd1cmF0aW9uKCkubmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdClcblx0fTtcblx0bGV0IGFTZWxlY3RPcHRpb25zOiBTZWxlY3RPcHRpb25UeXBlW10gPSBbXTtcblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudCA9IGdldFNlbGVjdGlvblZhcmlhbnQoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cdGlmIChzZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0YVNlbGVjdE9wdGlvbnMgPSBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnM7XG5cdH1cblxuXHRjb25zdCBwcm9wZXJ0eUluZm9GaWVsZHM6IEZpbHRlckZpZWxkW10gPVxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkcz8ucmVkdWNlKChzZWxlY3Rpb25GaWVsZHM6IEZpbHRlckZpZWxkW10sIHNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBzZWxlY3Rpb25GaWVsZC52YWx1ZTtcblx0XHRcdGlmICghKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGxldCBuYXZpZ2F0aW9uUGF0aDogc3RyaW5nO1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvblBhdGguc3RhcnRzV2l0aChcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIikpIHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aCA9IFwiXCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGggPSBhbm5vdGF0aW9uUGF0aC5zcGxpdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpWzBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZmlsdGVyUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGggPyBuYXZpZ2F0aW9uUGF0aCArIFwiL1wiICsgcHJvcGVydHlQYXRoIDogcHJvcGVydHlQYXRoO1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBfZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0ZmlsdGVyRmllbGRzLFxuXHRcdFx0XHRcdGZpbHRlclByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKGZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0ZmlsdGVyRmllbGQuZ3JvdXAgPSBcIlwiO1xuXHRcdFx0XHRcdGZpbHRlckZpZWxkLmdyb3VwTGFiZWwgPSBcIlwiO1xuXHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKGZpbHRlckZpZWxkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcblx0XHR9LCBbXSkgfHwgW107XG5cblx0Y29uc3QgZGVmYXVsdEZpbHRlckZpZWxkcyA9IF9nZXREZWZhdWx0RmlsdGVyRmllbGRzKFxuXHRcdGFTZWxlY3RPcHRpb25zLFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXMsXG5cdFx0YW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzXG5cdCk7XG5cblx0cmV0dXJuIHtcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyxcblx0XHRlbnRpdHlUeXBlOiBlbnRpdHlUeXBlLFxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkczogYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzLFxuXHRcdGZpbHRlckZpZWxkczogZmlsdGVyRmllbGRzLFxuXHRcdHByb3BlcnR5SW5mb0ZpZWxkczogcHJvcGVydHlJbmZvRmllbGRzLFxuXHRcdGRlZmF1bHRGaWx0ZXJGaWVsZHM6IGRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBmZXRjaFR5cGVDb25maWcgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KSB7XG5cdGNvbnN0IG9UeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eSwgcHJvcGVydHk/LnR5cGUpO1xuXHRpZiAocHJvcGVydHk/LnR5cGUgPT09IHNFZG1TdHJpbmcgJiYgKG9UeXBlQ29uZmlnLmNvbnN0cmFpbnRzLm51bGxhYmxlID09PSB1bmRlZmluZWQgfHwgb1R5cGVDb25maWcuY29uc3RyYWludHMubnVsbGFibGUgPT09IHRydWUpKSB7XG5cdFx0b1R5cGVDb25maWcuZm9ybWF0T3B0aW9ucy5wYXJzZUtlZXBzRW1wdHlTdHJpbmcgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gb1R5cGVDb25maWc7XG59O1xuXG5leHBvcnQgY29uc3QgYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGQ6IEZpbHRlckZpZWxkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhUmVxdWlyZWRQcm9wczogdW5rbm93bltdLFxuXHRhVHlwZUNvbmZpZzogUmVjb3JkPHN0cmluZywgUGFydGlhbDxQcm9wZXJ0eVR5cGVDb25maWc+PlxuKSB7XG5cdGxldCBvUHJvcGVydHlJbmZvID0gZmV0Y2hQcm9wZXJ0eUluZm8oY29udmVydGVyQ29udGV4dCwgcHJvcGVydHlJbmZvRmllbGQsIGFUeXBlQ29uZmlnW3Byb3BlcnR5SW5mb0ZpZWxkLmtleV0pLFxuXHRcdHNQcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRpZiAocHJvcGVydHlJbmZvRmllbGQuY29uZGl0aW9uUGF0aCkge1xuXHRcdHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eUluZm9GaWVsZC5jb25kaXRpb25QYXRoLnJlcGxhY2UoL1xcK3xcXCovZywgXCJcIik7XG5cdH1cblx0aWYgKG9Qcm9wZXJ0eUluZm8pIHtcblx0XHRvUHJvcGVydHlJbmZvID0gT2JqZWN0LmFzc2lnbihvUHJvcGVydHlJbmZvLCB7XG5cdFx0XHRtYXhDb25kaXRpb25zOiAhb1Byb3BlcnR5SW5mby5pc1BhcmFtZXRlciAmJiBpc011bHRpVmFsdWUob1Byb3BlcnR5SW5mbykgPyAtMSA6IDEsXG5cdFx0XHRyZXF1aXJlZDogcHJvcGVydHlJbmZvRmllbGQucmVxdWlyZWQgPz8gKG9Qcm9wZXJ0eUluZm8uaXNQYXJhbWV0ZXIgfHwgYVJlcXVpcmVkUHJvcHMuaW5kZXhPZihzUHJvcGVydHlQYXRoKSA+PSAwKSxcblx0XHRcdGNhc2VTZW5zaXRpdmU6IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGRhdGFUeXBlOiBhVHlwZUNvbmZpZ1twcm9wZXJ0eUluZm9GaWVsZC5rZXldLnR5cGVcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gb1Byb3BlcnR5SW5mbztcbn07XG5cbmV4cG9ydCBjb25zdCBwcm9jZXNzU2VsZWN0aW9uRmllbGRzID0gZnVuY3Rpb24gKFxuXHRwcm9wZXJ0eUluZm9GaWVsZHM6IEZpbHRlckZpZWxkW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRlZmF1bHRWYWx1ZVByb3BlcnR5RmllbGRzPzogRmlsdGVyRmllbGRbXVxuKSB7XG5cdC8vZ2V0IFR5cGVDb25maWcgZnVuY3Rpb25cblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRUeXBlczogdW5rbm93bltdID0gW107XG5cdGNvbnN0IGFUeXBlQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBQYXJ0aWFsPFByb3BlcnR5VHlwZUNvbmZpZz4+ID0ge307XG5cblx0aWYgKGRlZmF1bHRWYWx1ZVByb3BlcnR5RmllbGRzKSB7XG5cdFx0cHJvcGVydHlJbmZvRmllbGRzID0gcHJvcGVydHlJbmZvRmllbGRzLmNvbmNhdChkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcyk7XG5cdH1cblx0Ly9hZGQgdHlwZUNvbmZpZ1xuXHRwcm9wZXJ0eUluZm9GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW1ldGVyRmllbGQpIHtcblx0XHRpZiAocGFyYW1ldGVyRmllbGQuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29udmVydHlDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKHBhcmFtZXRlckZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VGFyZ2V0T2JqZWN0ID0gcHJvcGVydHlDb252ZXJ0eUNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdDtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChwcm9wZXJ0eVRhcmdldE9iamVjdD8udHlwZSk7XG5cdFx0XHRjb25zdCBvVHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eVRhcmdldE9iamVjdCk7XG5cdFx0XHRhVHlwZUNvbmZpZ1twYXJhbWV0ZXJGaWVsZC5rZXldID0gb1R5cGVDb25maWc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChzRWRtU3RyaW5nKTtcblx0XHRcdGFUeXBlQ29uZmlnW3BhcmFtZXRlckZpZWxkLmtleV0gPSB7IHR5cGU6IHNTdHJpbmdEYXRhVHlwZSB9O1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gZmlsdGVyUmVzdHJpY3Rpb25zXG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IG9GaWx0ZXJSZXN0cmljdGlvbnMgPSBpc0VudGl0eVNldChlbnRpdHlTZXQpID8gZW50aXR5U2V0LmFubm90YXRpb25zLkNhcGFiaWxpdGllcz8uRmlsdGVyUmVzdHJpY3Rpb25zIDogdW5kZWZpbmVkO1xuXHRjb25zdCBvUmV0OiB7XG5cdFx0UmVxdWlyZWRQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdFx0Tm9uRmlsdGVyYWJsZVByb3BlcnRpZXM/OiBzdHJpbmdbXTtcblx0XHRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM/OiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJFeHByZXNzaW9uVHlwZVtdPjtcblx0fSA9IHt9O1xuXHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0b1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9GaWx0ZXJSZXN0cmljdGlvbnMpO1xuXG5cdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXHRjb25zdCBhUGF0aFBhcnRzID0gc0VudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpO1xuXHRpZiAoYVBhdGhQYXJ0cy5sZW5ndGggPiAyKSB7XG5cdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYVBhdGhQYXJ0c1thUGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdGFQYXRoUGFydHMuc3BsaWNlKC0xLCAxKTtcblx0XHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dCwgc05hdmlnYXRpb25QYXRoKTtcblx0XHRjb25zdCBvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucyA9IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICYmIG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zLkZpbHRlclJlc3RyaWN0aW9ucztcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzLmNvbmNhdChcblx0XHRcdGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW11cblx0XHQpO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmNvbmNhdChcblx0XHRcdGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXVxuXHRcdCk7XG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSB7XG5cdFx0XHQuLi4oZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24ob05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMpIHx8IHt9KSxcblx0XHRcdC4uLm9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zXG5cdFx0fTtcblx0fVxuXHRjb25zdCBhUmVxdWlyZWRQcm9wcyA9IG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzO1xuXHRjb25zdCBhTm9uRmlsdGVyYWJsZVByb3BzID0gb1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcztcblx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzOiBQcm9wZXJ0eUluZm9bXSA9IFtdO1xuXG5cdC8vIHByb2Nlc3MgdGhlIGZpZWxkcyB0byBhZGQgbmVjZXNzYXJ5IHByb3BlcnRpZXNcblx0cHJvcGVydHlJbmZvRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5SW5mb0ZpZWxkKSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IHByb3BlcnR5SW5mb0ZpZWxkLmNvbmRpdGlvblBhdGgucmVwbGFjZSgvXFwrfFxcKi9nLCBcIlwiKTtcblx0XHRpZiAoYU5vbkZpbHRlcmFibGVQcm9wcy5pbmRleE9mKHNQcm9wZXJ0eVBhdGgpID09PSAtMSkge1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IGFzc2lnbkRhdGFUeXBlVG9Qcm9wZXJ0eUluZm8ocHJvcGVydHlJbmZvRmllbGQsIGNvbnZlcnRlckNvbnRleHQsIGFSZXF1aXJlZFByb3BzLCBhVHlwZUNvbmZpZyk7XG5cdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMucHVzaChvUHJvcGVydHlJbmZvKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vYWRkIGVkaXRcblx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRpZiAoTW9kZWxIZWxwZXIuaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQoZGF0YU1vZGVsT2JqZWN0UGF0aCkpIHtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMucHVzaChnZXRFZGl0U3RhdGVGaWx0ZXJQcm9wZXJ0eUluZm8oKSk7XG5cdH1cblx0Ly8gYWRkIHNlYXJjaFxuXHRjb25zdCBzZWFyY2hSZXN0cmljdGlvbnMgPSBnZXRTZWFyY2hSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGhpZGVCYXNpY1NlYXJjaCA9IEJvb2xlYW4oc2VhcmNoUmVzdHJpY3Rpb25zICYmICFzZWFyY2hSZXN0cmljdGlvbnMuU2VhcmNoYWJsZSk7XG5cdGlmIChzRW50aXR5U2V0UGF0aCAmJiBoaWRlQmFzaWNTZWFyY2ggIT09IHRydWUpIHtcblx0XHRpZiAoIXNlYXJjaFJlc3RyaWN0aW9ucyB8fCBzZWFyY2hSZXN0cmljdGlvbnM/LlNlYXJjaGFibGUpIHtcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKGdldFNlYXJjaEZpbHRlclByb3BlcnR5SW5mbygpKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYUZldGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydEN1c3RvbU1hbmlmZXN0RWxlbWVudHMgPSBmdW5jdGlvbiAoXG5cdGZpbHRlckZpZWxkczogTWFuaWZlc3RGaWx0ZXJGaWVsZFtdLFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pIHtcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKGZpbHRlckZpZWxkcywgZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCksIHtcblx0XHRhdmFpbGFiaWxpdHk6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0bGFiZWw6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0dHlwZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRwb3NpdGlvbjogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRzbG90TmFtZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR0ZW1wbGF0ZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRzZXR0aW5nczogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR2aXN1YWxGaWx0ZXI6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0cmVxdWlyZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fSk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc2VsZWN0aW9uIGZpZWxkcyB0aGF0IHdpbGwgYmUgdXNlZCB3aXRoaW4gdGhlIGZpbHRlciBiYXJcbiAqIFRoaXMgY29uZmlndXJhdGlvbiB0YWtlcyBpbnRvIGFjY291bnQgdGhlIGFubm90YXRpb24gYW5kIHRoZSBzZWxlY3Rpb24gdmFyaWFudHMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBsclRhYmxlc1xuICogQHBhcmFtIGFubm90YXRpb25QYXRoXG4gKiBAcGFyYW0gW2luY2x1ZGVIaWRkZW5dXG4gKiBAcGFyYW0gW2xpbmVJdGVtVGVybV1cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHNlbGVjdGlvbiBmaWVsZHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlbGVjdGlvbkZpZWxkcyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bHJUYWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdID0gW10sXG5cdGFubm90YXRpb25QYXRoID0gXCJcIixcblx0aW5jbHVkZUhpZGRlbj86IGJvb2xlYW4sXG5cdGxpbmVJdGVtVGVybT86IHN0cmluZ1xuKSB7XG5cdGNvbnN0IG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEgPSBnZXRBbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEoXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRsclRhYmxlcyxcblx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdGxpbmVJdGVtVGVybVxuXHQpO1xuXHRjb25zdCBwYXJhbWV0ZXJGaWVsZHMgPSBfZ2V0UGFyYW1ldGVyRmllbGRzKGNvbnZlcnRlckNvbnRleHQpO1xuXHRsZXQgcHJvcGVydHlJbmZvRmllbGRzOiBGaWx0ZXJGaWVsZFtdID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLnByb3BlcnR5SW5mb0ZpZWxkcykpO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5lbnRpdHlUeXBlO1xuXG5cdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHBhcmFtZXRlckZpZWxkcy5jb25jYXQocHJvcGVydHlJbmZvRmllbGRzKTtcblxuXHRwcm9wZXJ0eUluZm9GaWVsZHMgPSBpbnNlcnRDdXN0b21NYW5pZmVzdEVsZW1lbnRzKHByb3BlcnR5SW5mb0ZpZWxkcywgZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzID0gcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyhcblx0XHRwcm9wZXJ0eUluZm9GaWVsZHMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0KTtcblx0YUZldGNoZWRQcm9wZXJ0aWVzLnNvcnQoZnVuY3Rpb24gKGE6IEZpbHRlckdyb3VwLCBiOiBGaWx0ZXJHcm91cCkge1xuXHRcdGlmIChhLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBhLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0aWYgKGIuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGIuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXHRcdHJldHVybiBhLmdyb3VwTGFiZWwubG9jYWxlQ29tcGFyZShiLmdyb3VwTGFiZWwpO1xuXHR9KTtcblxuXHRsZXQgc0ZldGNoUHJvcGVydGllcyA9IEpTT04uc3RyaW5naWZ5KGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdHNGZXRjaFByb3BlcnRpZXMgPSBzRmV0Y2hQcm9wZXJ0aWVzLnJlcGxhY2UoL1xcey9nLCBcIlxcXFx7XCIpO1xuXHRzRmV0Y2hQcm9wZXJ0aWVzID0gc0ZldGNoUHJvcGVydGllcy5yZXBsYWNlKC9cXH0vZywgXCJcXFxcfVwiKTtcblx0Y29uc3Qgc1Byb3BlcnR5SW5mbyA9IHNGZXRjaFByb3BlcnRpZXM7XG5cdC8vIGVuZCBvZiBwcm9wZXJ0eUZpZWxkcyBwcm9jZXNzaW5nXG5cblx0Ly8gdG8gcG9wdWxhdGUgc2VsZWN0aW9uIGZpZWxkc1xuXHRsZXQgcHJvcFNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5wcm9wZXJ0eUluZm9GaWVsZHMpKTtcblx0cHJvcFNlbGVjdGlvbkZpZWxkcyA9IHBhcmFtZXRlckZpZWxkcy5jb25jYXQocHJvcFNlbGVjdGlvbkZpZWxkcyk7XG5cdC8vIGNyZWF0ZSBhIG1hcCBvZiBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgaW4gc2VsZWN0aW9uIHZhcmlhbnRzXG5cdGNvbnN0IGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSBvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcztcblx0Y29uc3QgZmlsdGVyRmFjZXRzID0gZW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5GaWx0ZXJGYWNldHM7XG5cdGxldCBmaWx0ZXJGYWNldE1hcDogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+ID0ge307XG5cblx0Y29uc3QgYUZpZWxkR3JvdXBzID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIlVJXCIsIFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXApO1xuXG5cdGlmIChmaWx0ZXJGYWNldHMgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXJGYWNldHMubGVuZ3RoIDwgMCkge1xuXHRcdGZvciAoY29uc3QgaSBpbiBhRmllbGRHcm91cHMpIHtcblx0XHRcdGZpbHRlckZhY2V0TWFwID0ge1xuXHRcdFx0XHQuLi5maWx0ZXJGYWNldE1hcCxcblx0XHRcdFx0Li4uZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyhhRmllbGRHcm91cHNbaV0pXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmaWx0ZXJGYWNldE1hcCA9IGZpbHRlckZhY2V0cy5yZWR1Y2UoKHByZXZpb3VzVmFsdWU6IFJlY29yZDxzdHJpbmcsIEZpbHRlckdyb3VwPiwgZmlsdGVyRmFjZXQ6IFJlZmVyZW5jZUZhY2V0VHlwZXMpID0+IHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgKGZpbHRlckZhY2V0Py5UYXJnZXQ/LiR0YXJnZXQgYXMgRmllbGRHcm91cCk/LkRhdGE/Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHByZXZpb3VzVmFsdWVbKChmaWx0ZXJGYWNldD8uVGFyZ2V0Py4kdGFyZ2V0IGFzIEZpZWxkR3JvdXApPy5EYXRhW2ldIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGhdID0ge1xuXHRcdFx0XHRcdGdyb3VwOiBmaWx0ZXJGYWNldD8uSUQ/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0Z3JvdXBMYWJlbDogZmlsdGVyRmFjZXQ/LkxhYmVsPy50b1N0cmluZygpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJldmlvdXNWYWx1ZTtcblx0XHR9LCB7fSk7XG5cdH1cblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgYWxsIHBvdGVudGlhbCBmaWx0ZXIgZmllbGRzIGJhc2VkIG9uLi4uXG5cdGNvbnN0IGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5maWx0ZXJGaWVsZHM7XG5cblx0Ly8gZmluYWxseSBjcmVhdGUgZmluYWwgbGlzdCBvZiBmaWx0ZXIgZmllbGRzIGJ5IGFkZGluZyB0aGUgU2VsZWN0aW9uRmllbGRzIGZpcnN0IChvcmRlciBtYXR0ZXJzKS4uLlxuXHRsZXQgYWxsRmlsdGVycyA9IHByb3BTZWxlY3Rpb25GaWVsZHNcblxuXHRcdC8vIC4uLmFuZCBhZGRpbmcgcmVtYWluaW5nIGZpbHRlciBmaWVsZHMsIHRoYXQgYXJlIG5vdCB1c2VkIGluIGEgU2VsZWN0aW9uVmFyaWFudCAob3JkZXIgZG9lc24ndCBtYXR0ZXIpXG5cdFx0LmNvbmNhdChcblx0XHRcdE9iamVjdC5rZXlzKGZpbHRlckZpZWxkcylcblx0XHRcdFx0LmZpbHRlcigocHJvcGVydHlQYXRoKSA9PiAhKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKVxuXHRcdFx0XHQubWFwKChwcm9wZXJ0eVBhdGgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihmaWx0ZXJGaWVsZHNbcHJvcGVydHlQYXRoXSwgZmlsdGVyRmFjZXRNYXBbcHJvcGVydHlQYXRoXSk7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblx0Y29uc3Qgc0NvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXG5cdC8vaWYgYWxsIHRhYmxlcyBhcmUgYW5hbHl0aWNhbCB0YWJsZXMgXCJhZ2dyZWdhdGFibGVcIiBwcm9wZXJ0aWVzIG11c3QgYmUgZXhjbHVkZWRcblx0aWYgKGNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsKGxyVGFibGVzLCBzQ29udGV4dFBhdGgpKSB7XG5cdFx0Ly8gQ3VycmVudGx5IGFsbCBhZ3JlZ2F0ZXMgYXJlIHJvb3QgZW50aXR5IHByb3BlcnRpZXMgKG5vIHByb3BlcnRpZXMgY29taW5nIGZyb20gbmF2aWdhdGlvbikgYW5kIGFsbFxuXHRcdC8vIHRhYmxlcyB3aXRoIHNhbWUgZW50aXR5U2V0IGdldHMgc2FtZSBhZ2dyZWFndGUgY29uZmlndXJhdGlvbiB0aGF0J3Mgd2h5IHdlIGNhbiB1c2UgZmlyc3QgdGFibGUgaW50b1xuXHRcdC8vIExSIHRvIGdldCBhZ2dyZWdhdGVzICh3aXRob3V0IGN1cnJlbmN5L3VuaXQgcHJvcGVydGllcyBzaW5jZSB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBmaWx0ZXIgdGhlbSkuXG5cdFx0Y29uc3QgYWdncmVnYXRlcyA9IGxyVGFibGVzWzBdLmFnZ3JlZ2F0ZXM7XG5cdFx0aWYgKGFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoYWdncmVnYXRlcykubWFwKChhZ2dyZWdhdGVLZXkpID0+IGFnZ3JlZ2F0ZXNbYWdncmVnYXRlS2V5XS5yZWxhdGl2ZVBhdGgpO1xuXHRcdFx0YWxsRmlsdGVycyA9IGFsbEZpbHRlcnMuZmlsdGVyKChmaWx0ZXJGaWVsZCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYWdncmVnYXRhYmxlUHJvcGVydGllcy5pbmRleE9mKGZpbHRlckZpZWxkLmtleSkgPT09IC0xO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyhhbGxGaWx0ZXJzLCBlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBBZGQgY2FzZVNlbnNpdGl2ZSBwcm9wZXJ0eSB0byBhbGwgc2VsZWN0aW9uIGZpZWxkcy5cblx0Y29uc3QgaXNDYXNlU2Vuc2l0aXZlID0gaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlKGNvbnZlcnRlckNvbnRleHQpO1xuXHRzZWxlY3Rpb25GaWVsZHMuZm9yRWFjaCgoZmlsdGVyRmllbGQpID0+IHtcblx0XHRmaWx0ZXJGaWVsZC5jYXNlU2Vuc2l0aXZlID0gaXNDYXNlU2Vuc2l0aXZlO1xuXHR9KTtcblxuXHRyZXR1cm4geyBzZWxlY3Rpb25GaWVsZHMsIHNQcm9wZXJ0eUluZm8gfTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBmaWx0ZXIgYmFyIGluc2lkZSBhIHZhbHVlIGhlbHAgZGlhbG9nIHNob3VsZCBiZSBleHBhbmRlZC4gVGhpcyBpcyB0cnVlIGlmIG9uZSBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaG9sZDpcbiAqICgxKSBhIGZpbHRlciBwcm9wZXJ0eSBpcyBtYW5kYXRvcnksXG4gKiAoMikgbm8gc2VhcmNoIGZpZWxkIGV4aXN0cyAoZW50aXR5IGlzbid0IHNlYXJjaCBlbmFibGVkKSxcbiAqICgzKSB3aGVuIHRoZSBkYXRhIGlzbid0IGxvYWRlZCBieSBkZWZhdWx0IChhbm5vdGF0aW9uIEZldGNoVmFsdWVzID0gMikuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiBUaGUgRmlsdGVyUmVzdHJpY3Rpb24gYW5ub3RhdGlvblxuICogQHBhcmFtIHZhbHVlTGlzdCBUaGUgVmFsdWVMaXN0IGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgZXhwYW5kRmlsdGVyRmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHBhbmRGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IEZpbHRlclJlc3RyaWN0aW9ucyB8IHVuZGVmaW5lZCxcblx0dmFsdWVMaXN0OiBhbnlcbik6IGJvb2xlYW4ge1xuXHRjb25zdCByZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMoZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIik7XG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9ucyA9IGdldFNlYXJjaFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihzZWFyY2hSZXN0cmljdGlvbnMgJiYgIXNlYXJjaFJlc3RyaWN0aW9ucy5TZWFyY2hhYmxlKTtcblx0aWYgKHJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGggPiAwIHx8IGhpZGVCYXNpY1NlYXJjaCB8fCB2YWx1ZUxpc3Q/LkZldGNoVmFsdWVzID09PSAyKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTJFS0EsZUFBZTtFQUFBLFdBQWZBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBS3BCLE1BQU1DLFVBQVUsR0FBRyxZQUFZO0VBQy9CLE1BQU1DLGVBQWUsR0FBRyxnQ0FBZ0M7RUFJeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0MseUJBQXlCLENBQUNDLFVBQXNCLEVBQStCO0lBQ3ZGLE1BQU1DLGNBQTJDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RERCxVQUFVLENBQUNFLElBQUksQ0FBQ0MsT0FBTyxDQUFFQyxTQUFpQyxJQUFLO01BQzlELElBQUlBLFNBQVMsQ0FBQ0MsS0FBSyxLQUFLLHNDQUFzQyxFQUFFO1FBQUE7UUFDL0RKLGNBQWMsQ0FBQ0csU0FBUyxDQUFDRSxLQUFLLENBQUNDLElBQUksQ0FBQyxHQUFHO1VBQ3RDQyxLQUFLLEVBQUVSLFVBQVUsQ0FBQ1Msa0JBQWtCO1VBQ3BDQyxVQUFVLEVBQ1RDLGlCQUFpQixDQUNoQkMsMkJBQTJCLENBQUNaLFVBQVUsQ0FBQ2EsS0FBSyw4QkFBSWIsVUFBVSxDQUFDYyxXQUFXLG9GQUF0QixzQkFBd0JDLE1BQU0sMkRBQTlCLHVCQUFnQ0YsS0FBSyxLQUFJYixVQUFVLENBQUNnQixTQUFTLENBQUMsQ0FDOUcsSUFBSWhCLFVBQVUsQ0FBQ2dCO1FBQ2xCLENBQUM7TUFDRjtJQUNELENBQUMsQ0FBQztJQUNGLE9BQU9mLGNBQWM7RUFDdEI7RUFFQSxTQUFTZ0IsMkJBQTJCLENBQUNDLGlCQUFrRCxFQUEyQjtJQUNqSCxPQUFPQSxp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