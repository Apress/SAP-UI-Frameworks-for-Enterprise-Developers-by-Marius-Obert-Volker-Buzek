/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/type/EDM"], function (IssueManager, BindingToolkit, ModelHelper, EDM) {
  "use strict";

  var _exports = {};
  var isTypeFilterable = EDM.isTypeFilterable;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var compileExpression = BindingToolkit.compileExpression;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  // From FilterBar.block.ts only
  function getSearchRestrictions(fullPath, metaModel) {
    let searchRestrictions;
    let navigationSearchRestrictions;
    const navigationText = "$NavigationPropertyBinding";
    const searchRestrictionsTerm = "@Org.OData.Capabilities.V1.SearchRestrictions";
    const entityTypePathParts = fullPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entitySetPath = ModelHelper.getEntitySetPath(fullPath, metaModel);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = metaModel.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`) ? true : false;
    const containmentNavPath = isContainment ? entityTypePathParts[entityTypePathParts.length - 1] : "";

    //LEAST PRIORITY - Search restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      searchRestrictions = metaModel.getObject(`${entitySetPath}${searchRestrictionsTerm}`);
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;

      //HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(metaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      navigationSearchRestrictions = navigationRestrictions === null || navigationRestrictions === void 0 ? void 0 : navigationRestrictions.SearchRestrictions;
    }
    return navigationSearchRestrictions ?? searchRestrictions;
  }

  // From CommonUtils
  _exports.getSearchRestrictions = getSearchRestrictions;
  function getNavigationRestrictions(metaModelContext, entitySetPath, navigationPath) {
    const navigationRestrictions = metaModelContext.getObject(`${entitySetPath}@Org.OData.Capabilities.V1.NavigationRestrictions`);
    const restrictedProperties = navigationRestrictions === null || navigationRestrictions === void 0 ? void 0 : navigationRestrictions.RestrictedProperties;
    return restrictedProperties === null || restrictedProperties === void 0 ? void 0 : restrictedProperties.find(function (restrictedProperty) {
      var _restrictedProperty$N;
      return ((_restrictedProperty$N = restrictedProperty.NavigationProperty) === null || _restrictedProperty$N === void 0 ? void 0 : _restrictedProperty$N.$NavigationPropertyPath) === navigationPath;
    });
  }

  // Internal usage only
  _exports.getNavigationRestrictions = getNavigationRestrictions;
  function isInNonFilterableProperties(metamodelContext, entitySetPath, contextPath) {
    let isNotFilterable = false;
    const filterRestrictionsAnnotation = metamodelContext.getObject(`${entitySetPath}@Org.OData.Capabilities.V1.FilterRestrictions`);
    if (filterRestrictionsAnnotation !== null && filterRestrictionsAnnotation !== void 0 && filterRestrictionsAnnotation.NonFilterableProperties) {
      isNotFilterable = filterRestrictionsAnnotation.NonFilterableProperties.some(function (property) {
        return property.$NavigationPropertyPath === contextPath || property.$PropertyPath === contextPath;
      });
    }
    return isNotFilterable;
  }

  // Internal usage only
  function isCustomAggregate(metamodelContext, entitySetPath, contextPath) {
    let interanlIsCustomAggregate = false;
    // eslint-disable-next-line regex/invalid-warn
    const isApplySupported = metamodelContext.getObject(entitySetPath + "@Org.OData.Aggregation.V1.ApplySupported") ? true : false;
    if (isApplySupported) {
      const entitySetAnnotations = metamodelContext.getObject(`${entitySetPath}@`);
      const customAggregatesAnnotations = METAMODEL_FUNCTIONS.getAllCustomAggregates(entitySetAnnotations);
      const customAggregates = customAggregatesAnnotations ? Object.keys(customAggregatesAnnotations) : undefined;
      if (customAggregates !== null && customAggregates !== void 0 && customAggregates.includes(contextPath)) {
        interanlIsCustomAggregate = true;
      }
    }
    return interanlIsCustomAggregate;
  }

  // Internal usage only
  _exports.isCustomAggregate = isCustomAggregate;
  function checkEntitySetIsFilterable(entitySetPath, metaModelContext, property, navigationContext) {
    let isFilterable = entitySetPath.split("/").length === 2 && !property.includes("/") ? !isInNonFilterableProperties(metaModelContext, entitySetPath, property) && !isCustomAggregate(metaModelContext, entitySetPath, property) : !isContextPathFilterable(metaModelContext, entitySetPath, property);
    // check if type can be used for filtering
    if (isFilterable && navigationContext) {
      const propertyDataType = getPropertyDataType(navigationContext);
      if (propertyDataType) {
        isFilterable = propertyDataType ? isTypeFilterable(propertyDataType) : false;
      } else {
        isFilterable = false;
      }
    }
    return isFilterable;
  }

  // Internal usage only
  function isContextPathFilterable(metaModelContext, entitySetPath, contextPath) {
    const fullPath = `${entitySetPath}/${contextPath}`,
      esParts = fullPath.split("/").splice(0, 2),
      contexts = fullPath.split("/").splice(2);
    let isNoFilterable = false,
      context = "";
    entitySetPath = esParts.join("/");
    isNoFilterable = contexts.some(function (item, index, array) {
      if (context.length > 0) {
        context += `/${item}`;
      } else {
        context = item;
      }
      if (index === array.length - 2) {
        // In case of "/Customer/Set/Property" this is to check navigation restrictions of "Customer" for non-filterable properties in "Set"
        const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(metaModelContext, entitySetPath, item);
        const filterRestrictions = navigationRestrictions === null || navigationRestrictions === void 0 ? void 0 : navigationRestrictions.FilterRestrictions;
        const nonFilterableProperties = filterRestrictions === null || filterRestrictions === void 0 ? void 0 : filterRestrictions.NonFilterableProperties;
        const targetPropertyPath = array[array.length - 1];
        if (nonFilterableProperties !== null && nonFilterableProperties !== void 0 && nonFilterableProperties.find(function (propertyPath) {
          return propertyPath.$PropertyPath === targetPropertyPath;
        })) {
          return true;
        }
      }
      if (index === array.length - 1) {
        //last path segment
        isNoFilterable = isInNonFilterableProperties(metaModelContext, entitySetPath, context);
      } else if (metaModelContext.getObject(`${entitySetPath}/$NavigationPropertyBinding/${item}`)) {
        //check existing context path and initialize it
        isNoFilterable = isInNonFilterableProperties(metaModelContext, entitySetPath, context);
        context = "";
        //set the new EntitySet
        entitySetPath = `/${metaModelContext.getObject(`${entitySetPath}/$NavigationPropertyBinding/${item}`)}`;
      }
      return isNoFilterable;
    });
    return isNoFilterable;
  }

  // Internal usage only

  function getPropertyDataType(navigationContext) {
    let dataType = navigationContext.getProperty("$Type");
    // if $kind exists, it's not a DataField and we have the final type already
    if (!navigationContext.getProperty("$kind")) {
      switch (dataType) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          dataType = undefined;
          break;
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          dataType = navigationContext.getProperty("Value/$Path/$Type");
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        default:
          const annotationPath = navigationContext.getProperty("Target/$AnnotationPath");
          if (annotationPath) {
            if (annotationPath.includes("com.sap.vocabularies.Communication.v1.Contact")) {
              dataType = navigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type");
            } else if (annotationPath.includes("com.sap.vocabularies.UI.v1.DataPoint")) {
              dataType = navigationContext.getProperty("Value/$Path/$Type");
            } else {
              // e.g. FieldGroup or Chart
              dataType = undefined;
            }
          } else {
            dataType = undefined;
          }
          break;
      }
    }
    return dataType;
  }

  // From CommonUtils, CommonHelper, FilterBarDelegate, FilterField, ValueListHelper, TableDelegate
  // TODO check used places and rework this
  function isPropertyFilterable(metaModelContext, entitySetPath, property, skipHiddenFilters) {
    if (typeof property !== "string") {
      throw new Error("sProperty parameter must be a string");
    }

    // Parameters should be rendered as filterfields
    if (metaModelContext.getObject(`${entitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
      return true;
    }
    const navigationContext = metaModelContext.createBindingContext(`${entitySetPath}/${property}`);
    if (navigationContext && !skipHiddenFilters) {
      if (navigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true || navigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter") === true) {
        return false;
      }
      const hiddenPath = navigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path");
      const hiddenFilterPath = navigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path");
      if (hiddenPath && hiddenFilterPath) {
        return compileExpression(not(or(pathInModel(hiddenPath), pathInModel(hiddenFilterPath))));
      } else if (hiddenPath) {
        return compileExpression(not(pathInModel(hiddenPath)));
      } else if (hiddenFilterPath) {
        return compileExpression(not(pathInModel(hiddenFilterPath)));
      }
    }
    return checkEntitySetIsFilterable(entitySetPath, metaModelContext, property, navigationContext);
  }

  // From TransactionHelper / EditFlow
  _exports.isPropertyFilterable = isPropertyFilterable;
  function getNonComputedVisibleFields(metaModelContext, path, appComponent) {
    const technicalKeys = metaModelContext.getObject(`${path}/`).$Key;
    const nonComputedVisibleKeys = [];
    const immutableVisibleFields = [];
    const entityType = metaModelContext.getObject(`${path}/`);
    for (const item in entityType) {
      if (entityType[item].$kind && entityType[item].$kind === "Property") {
        const annotations = metaModelContext.getObject(`${path}/${item}@`) || {},
          isKey = technicalKeys.includes(item),
          isImmutable = annotations["@Org.OData.Core.V1.Immutable"],
          isNonComputed = !annotations["@Org.OData.Core.V1.Computed"],
          isVisible = !annotations["@com.sap.vocabularies.UI.v1.Hidden"],
          isComputedDefaultValue = annotations["@Org.OData.Core.V1.ComputedDefaultValue"],
          isKeyComputedDefaultValueWithText = isKey && entityType[item].$Type === "Edm.Guid" ? isComputedDefaultValue && annotations["@com.sap.vocabularies.Common.v1.Text"] : false;
        if ((isKeyComputedDefaultValueWithText || isKey && entityType[item].$Type !== "Edm.Guid") && isNonComputed && isVisible) {
          nonComputedVisibleKeys.push(item);
        } else if (isImmutable && isNonComputed && isVisible) {
          immutableVisibleFields.push(item);
        }
        if (!isNonComputed && isComputedDefaultValue && appComponent) {
          const diagnostics = appComponent.getDiagnostics();
          const message = "Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";
          diagnostics.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, message, IssueCategoryType, IssueCategoryType.Annotations.IgnoredAnnotation);
        }
      }
    }
    const requiredProperties = METAMODEL_FUNCTIONS.getRequiredPropertiesFromInsertRestrictions(path, metaModelContext);
    if (requiredProperties.length) {
      requiredProperties.forEach(function (property) {
        const annotations = metaModelContext.getObject(`${path}/${property}@`),
          isVisible = !(annotations !== null && annotations !== void 0 && annotations["@com.sap.vocabularies.UI.v1.Hidden"]);
        if (isVisible && !nonComputedVisibleKeys.includes(property) && !immutableVisibleFields.includes(property)) {
          nonComputedVisibleKeys.push(property);
        }
      });
    }
    return nonComputedVisibleKeys.concat(immutableVisibleFields);
  }
  // Internal only, exposed for tests
  _exports.getNonComputedVisibleFields = getNonComputedVisibleFields;
  function getRequiredProperties(path, metaModelContext) {
    let checkUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const requiredProperties = [];
    let requiredPropertiesWithPath = [];
    const navigationText = "$NavigationPropertyBinding";
    let entitySetAnnotation = null;
    if (path.endsWith("$")) {
      // if sPath comes with a $ in the end, removing it as it is of no significance
      path = path.replace("/$", "");
    }
    const entityTypePathParts = path.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entitySetPath = ModelHelper.getEntitySetPath(path, metaModelContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = metaModelContext.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`) ? true : false;
    const containmentNavPath = isContainment ? entityTypePathParts[entityTypePathParts.length - 1] : "";

    //Restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      entitySetAnnotation = metaModelContext.getObject(`${entitySetPath}@`);
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
      //Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const navigationRestrictions = METAMODEL_FUNCTIONS.getNavigationRestrictions(metaModelContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      if (navigationRestrictions !== undefined && METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(navigationRestrictions, true, checkUpdateRestrictions)) {
        var _navigationRestrictio, _navigationRestrictio2;
        requiredPropertiesWithPath = checkUpdateRestrictions ? ((_navigationRestrictio = navigationRestrictions.UpdateRestrictions) === null || _navigationRestrictio === void 0 ? void 0 : _navigationRestrictio.RequiredProperties) ?? [] : ((_navigationRestrictio2 = navigationRestrictions.InsertRestrictions) === null || _navigationRestrictio2 === void 0 ? void 0 : _navigationRestrictio2.RequiredProperties) ?? [];
      }
      if (!requiredPropertiesWithPath.length && METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(entitySetAnnotation, false, checkUpdateRestrictions)) {
        requiredPropertiesWithPath = METAMODEL_FUNCTIONS.getRequiredPropertiesFromAnnotations(entitySetAnnotation, checkUpdateRestrictions);
      }
    } else if (METAMODEL_FUNCTIONS.hasRestrictedPropertiesInAnnotations(entitySetAnnotation, false, checkUpdateRestrictions)) {
      requiredPropertiesWithPath = METAMODEL_FUNCTIONS.getRequiredPropertiesFromAnnotations(entitySetAnnotation, checkUpdateRestrictions);
    }
    requiredPropertiesWithPath.forEach(function (requiredProperty) {
      const propertyPath = requiredProperty.$PropertyPath;
      requiredProperties.push(propertyPath);
    });
    return requiredProperties;
  }

  // TransactionHelper // InternalField
  function getRequiredPropertiesFromInsertRestrictions(path, metamodelContext) {
    return METAMODEL_FUNCTIONS.getRequiredProperties(path, metamodelContext);
  }

  // InternalField
  _exports.getRequiredPropertiesFromInsertRestrictions = getRequiredPropertiesFromInsertRestrictions;
  function getRequiredPropertiesFromUpdateRestrictions(path, metamodelContext) {
    return METAMODEL_FUNCTIONS.getRequiredProperties(path, metamodelContext, true);
  }

  // Internal only, exposed for tests
  _exports.getRequiredPropertiesFromUpdateRestrictions = getRequiredPropertiesFromUpdateRestrictions;
  function getRequiredPropertiesFromAnnotations(annotations) {
    var _annotations$OrgODa2;
    let checkUpdateRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (checkUpdateRestrictions) {
      var _annotations$OrgODa;
      return (annotations === null || annotations === void 0 ? void 0 : (_annotations$OrgODa = annotations["@Org.OData.Capabilities.V1.UpdateRestrictions"]) === null || _annotations$OrgODa === void 0 ? void 0 : _annotations$OrgODa.RequiredProperties) ?? [];
    }
    return (annotations === null || annotations === void 0 ? void 0 : (_annotations$OrgODa2 = annotations["@Org.OData.Capabilities.V1.InsertRestrictions"]) === null || _annotations$OrgODa2 === void 0 ? void 0 : _annotations$OrgODa2.RequiredProperties) ?? [];
  }

  // Internal only, exposed for tests
  function hasRestrictedPropertiesInAnnotations(annotations) {
    var _entitytSetAnnotation;
    let isNavigationRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let checkUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (isNavigationRestrictions) {
      var _navAnnotations$Inser;
      const navAnnotations = annotations;
      if (checkUpdateRestrictions) {
        var _navAnnotations$Updat;
        return navAnnotations !== null && navAnnotations !== void 0 && (_navAnnotations$Updat = navAnnotations.UpdateRestrictions) !== null && _navAnnotations$Updat !== void 0 && _navAnnotations$Updat.RequiredProperties ? true : false;
      }
      return navAnnotations !== null && navAnnotations !== void 0 && (_navAnnotations$Inser = navAnnotations.InsertRestrictions) !== null && _navAnnotations$Inser !== void 0 && _navAnnotations$Inser.RequiredProperties ? true : false;
    } else if (checkUpdateRestrictions) {
      var _entityAnnotations$O;
      const entityAnnotations = annotations;
      return entityAnnotations !== null && entityAnnotations !== void 0 && (_entityAnnotations$O = entityAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"]) !== null && _entityAnnotations$O !== void 0 && _entityAnnotations$O.RequiredProperties ? true : false;
    }
    const entitytSetAnnotations = annotations;
    return entitytSetAnnotations !== null && entitytSetAnnotations !== void 0 && (_entitytSetAnnotation = entitytSetAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"]) !== null && _entitytSetAnnotation !== void 0 && _entitytSetAnnotation.RequiredProperties ? true : false;
  }
  // Used in this file and FilterUtils
  /**
   * Returns custom aggregates for a given entitySet.
   *
   * @param annotations A list of annotations of the entity set
   * @returns A map to the custom aggregates keyed by their qualifiers
   */
  function getAllCustomAggregates(annotations) {
    const customAggregates = {};
    let annotation;
    for (const annotationKey in annotations) {
      if (annotationKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
        annotation = annotationKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
        const annotationParts = annotation.split("@");
        if (annotationParts.length == 2) {
          const customAggregate = {};
          //inner annotation that is not part of 	Validation.AggregatableTerms
          if (annotationParts[1] == "Org.OData.Aggregation.V1.ContextDefiningProperties") {
            customAggregate.contextDefiningProperties = annotations[annotationKey];
          }
          if (annotationParts[1] == "com.sap.vocabularies.Common.v1.Label") {
            customAggregate.label = annotations[annotationKey];
          }
          customAggregates[annotationParts[0]] = customAggregate;
        } else if (annotationParts.length == 1) {
          customAggregates[annotationParts[0]] = {
            name: annotationParts[0],
            propertyPath: annotationParts[0],
            label: `Custom Aggregate (${annotation})`,
            sortable: true,
            sortOrder: "both",
            custom: true
          };
        }
      }
    }
    return customAggregates;
  }

  // Used in ValueListHelper, ChartDelegate and ValueHelp-TableDelegate
  _exports.getAllCustomAggregates = getAllCustomAggregates;
  /**
   * Determines the sorting information from the restriction annotation.
   *
   * @param entitySetAnnotations EntitySet or collection annotations with the sort restrictions annotation
   * @returns An object containing the sort restriction information
   */
  function getSortRestrictionsInfo(entitySetAnnotations) {
    const sortRestrictionsInfo = {
      sortable: true,
      propertyInfo: {}
    };
    const sortRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"];
    if (!sortRestrictions) {
      return sortRestrictionsInfo;
    }
    if (sortRestrictions.Sortable === false) {
      sortRestrictionsInfo.sortable = false;
    }
    for (const propertyItem of sortRestrictions.NonSortableProperties || []) {
      const propertyName = propertyItem.$PropertyPath;
      sortRestrictionsInfo.propertyInfo[propertyName] = {
        sortable: false
      };
    }
    for (const propertyItem of sortRestrictions.AscendingOnlyProperties || []) {
      const propertyName = propertyItem.$PropertyPath;
      sortRestrictionsInfo.propertyInfo[propertyName] = {
        sortable: true,
        sortDirection: "asc" // not used, yet
      };
    }

    for (const propertyItem of sortRestrictions.DescendingOnlyProperties || []) {
      const propertyName = propertyItem.$PropertyPath;
      sortRestrictionsInfo.propertyInfo[propertyName] = {
        sortable: true,
        sortDirection: "desc" // not used, yet
      };
    }

    return sortRestrictionsInfo;
  }

  // Used in ChartDelegate and ValueHelp-TableDelegate
  _exports.getSortRestrictionsInfo = getSortRestrictionsInfo;
  /**
   * Determines the filter information based on the filter restrictions annoation.
   *
   * @param filterRestrictions The filter restrictions annotation
   * @returns An object containing the filter restriction information
   */
  function getFilterRestrictionsInfo(filterRestrictions) {
    let i, propertyName;
    const filterRestrictionsInfo = {
      filterable: true,
      requiresFilter: (filterRestrictions === null || filterRestrictions === void 0 ? void 0 : filterRestrictions.RequiresFilter) || false,
      propertyInfo: {},
      requiredProperties: []
    };
    if (!filterRestrictions) {
      return filterRestrictionsInfo;
    }
    if (filterRestrictions.Filterable === false) {
      filterRestrictionsInfo.filterable = false;
    }

    //Hierarchical Case
    if (filterRestrictions.RequiredProperties) {
      for (i = 0; i < filterRestrictions.RequiredProperties.length; i++) {
        propertyName = filterRestrictions.RequiredProperties[i].$PropertyPath;
        filterRestrictionsInfo.requiredProperties.push(propertyName);
      }
    }
    if (filterRestrictions.NonFilterableProperties) {
      for (i = 0; i < filterRestrictions.NonFilterableProperties.length; i++) {
        propertyName = filterRestrictions.NonFilterableProperties[i].$PropertyPath;
        filterRestrictionsInfo.propertyInfo[propertyName] = {
          filterable: false
        };
      }
    }
    if (filterRestrictions.FilterExpressionRestrictions) {
      //TBD
      for (i = 0; i < filterRestrictions.FilterExpressionRestrictions.length; i++) {
        var _filterRestrictions$F;
        propertyName = (_filterRestrictions$F = filterRestrictions.FilterExpressionRestrictions[i].Property) === null || _filterRestrictions$F === void 0 ? void 0 : _filterRestrictions$F.$PropertyPath;
        if (propertyName) {
          filterRestrictionsInfo.propertyInfo[propertyName] = {
            filterable: true,
            allowedExpressions: filterRestrictions.FilterExpressionRestrictions[i].AllowedExpressions
          };
        }
      }
    }
    return filterRestrictionsInfo;
  }

  // Used in ChartDelegate and ValueHelp-TableDelegate
  /**
   * Provides the information if the FilterExpression is a multiValue Filter Expression.
   *
   * @param filterExpression The FilterExpressionType
   * @returns A boolean value wether it is a multiValue Filter Expression or not
   */
  _exports.getFilterRestrictionsInfo = getFilterRestrictionsInfo;
  function isMultiValueFilterExpression(filterExpression) {
    let isMultiValue = true;

    //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
    switch (filterExpression) {
      case "SearchExpression":
      case "SingleRange":
      case "SingleValue":
        isMultiValue = false;
        break;
      default:
        break;
    }
    return isMultiValue;
  }

  // DO NOT USE, only for tests and internally in this file
  _exports.isMultiValueFilterExpression = isMultiValueFilterExpression;
  const METAMODEL_FUNCTIONS = {
    getRequiredProperties,
    getRequiredPropertiesFromAnnotations,
    hasRestrictedPropertiesInAnnotations,
    getRequiredPropertiesFromInsertRestrictions,
    getNavigationRestrictions,
    getAllCustomAggregates
  };
  _exports.METAMODEL_FUNCTIONS = METAMODEL_FUNCTIONS;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRTZWFyY2hSZXN0cmljdGlvbnMiLCJmdWxsUGF0aCIsIm1ldGFNb2RlbCIsInNlYXJjaFJlc3RyaWN0aW9ucyIsIm5hdmlnYXRpb25TZWFyY2hSZXN0cmljdGlvbnMiLCJuYXZpZ2F0aW9uVGV4dCIsInNlYXJjaFJlc3RyaWN0aW9uc1Rlcm0iLCJlbnRpdHlUeXBlUGF0aFBhcnRzIiwicmVwbGFjZUFsbCIsInNwbGl0IiwiZmlsdGVyIiwiTW9kZWxIZWxwZXIiLCJmaWx0ZXJPdXROYXZQcm9wQmluZGluZyIsImVudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXRQYXRoIiwiZW50aXR5U2V0UGF0aFBhcnRzIiwiaXNDb250YWlubWVudCIsImdldE9iamVjdCIsImpvaW4iLCJjb250YWlubWVudE5hdlBhdGgiLCJsZW5ndGgiLCJuYXZQYXRoIiwicGFyZW50RW50aXR5U2V0UGF0aCIsInNsaWNlIiwibmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIk1FVEFNT0RFTF9GVU5DVElPTlMiLCJnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiU2VhcmNoUmVzdHJpY3Rpb25zIiwibWV0YU1vZGVsQ29udGV4dCIsIm5hdmlnYXRpb25QYXRoIiwicmVzdHJpY3RlZFByb3BlcnRpZXMiLCJSZXN0cmljdGVkUHJvcGVydGllcyIsImZpbmQiLCJyZXN0cmljdGVkUHJvcGVydHkiLCJOYXZpZ2F0aW9uUHJvcGVydHkiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImlzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyIsIm1ldGFtb2RlbENvbnRleHQiLCJjb250ZXh0UGF0aCIsImlzTm90RmlsdGVyYWJsZSIsImZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24iLCJOb25GaWx0ZXJhYmxlUHJvcGVydGllcyIsInNvbWUiLCJwcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJpc0N1c3RvbUFnZ3JlZ2F0ZSIsImludGVyYW5sSXNDdXN0b21BZ2dyZWdhdGUiLCJpc0FwcGx5U3VwcG9ydGVkIiwiZW50aXR5U2V0QW5ub3RhdGlvbnMiLCJjdXN0b21BZ2dyZWdhdGVzQW5ub3RhdGlvbnMiLCJnZXRBbGxDdXN0b21BZ2dyZWdhdGVzIiwiY3VzdG9tQWdncmVnYXRlcyIsIk9iamVjdCIsImtleXMiLCJ1bmRlZmluZWQiLCJpbmNsdWRlcyIsImNoZWNrRW50aXR5U2V0SXNGaWx0ZXJhYmxlIiwibmF2aWdhdGlvbkNvbnRleHQiLCJpc0ZpbHRlcmFibGUiLCJpc0NvbnRleHRQYXRoRmlsdGVyYWJsZSIsInByb3BlcnR5RGF0YVR5cGUiLCJnZXRQcm9wZXJ0eURhdGFUeXBlIiwiaXNUeXBlRmlsdGVyYWJsZSIsImVzUGFydHMiLCJzcGxpY2UiLCJjb250ZXh0cyIsImlzTm9GaWx0ZXJhYmxlIiwiY29udGV4dCIsIml0ZW0iLCJpbmRleCIsImFycmF5IiwiZmlsdGVyUmVzdHJpY3Rpb25zIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwibm9uRmlsdGVyYWJsZVByb3BlcnRpZXMiLCJ0YXJnZXRQcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eVBhdGgiLCJkYXRhVHlwZSIsImdldFByb3BlcnR5IiwiYW5ub3RhdGlvblBhdGgiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsInNraXBIaWRkZW5GaWx0ZXJzIiwiRXJyb3IiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImhpZGRlblBhdGgiLCJoaWRkZW5GaWx0ZXJQYXRoIiwiY29tcGlsZUV4cHJlc3Npb24iLCJub3QiLCJvciIsInBhdGhJbk1vZGVsIiwiZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzIiwicGF0aCIsImFwcENvbXBvbmVudCIsInRlY2huaWNhbEtleXMiLCIkS2V5Iiwibm9uQ29tcHV0ZWRWaXNpYmxlS2V5cyIsImltbXV0YWJsZVZpc2libGVGaWVsZHMiLCJlbnRpdHlUeXBlIiwiJGtpbmQiLCJhbm5vdGF0aW9ucyIsImlzS2V5IiwiaXNJbW11dGFibGUiLCJpc05vbkNvbXB1dGVkIiwiaXNWaXNpYmxlIiwiaXNDb21wdXRlZERlZmF1bHRWYWx1ZSIsImlzS2V5Q29tcHV0ZWREZWZhdWx0VmFsdWVXaXRoVGV4dCIsIiRUeXBlIiwicHVzaCIsImRpYWdub3N0aWNzIiwiZ2V0RGlhZ25vc3RpY3MiLCJtZXNzYWdlIiwiYWRkSXNzdWUiLCJJc3N1ZUNhdGVnb3J5IiwiQW5ub3RhdGlvbiIsIklzc3VlU2V2ZXJpdHkiLCJNZWRpdW0iLCJJc3N1ZUNhdGVnb3J5VHlwZSIsIkFubm90YXRpb25zIiwiSWdub3JlZEFubm90YXRpb24iLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwiZm9yRWFjaCIsImNvbmNhdCIsImdldFJlcXVpcmVkUHJvcGVydGllcyIsImNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zIiwicmVxdWlyZWRQcm9wZXJ0aWVzV2l0aFBhdGgiLCJlbnRpdHlTZXRBbm5vdGF0aW9uIiwiZW5kc1dpdGgiLCJyZXBsYWNlIiwiaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zIiwiVXBkYXRlUmVzdHJpY3Rpb25zIiwiUmVxdWlyZWRQcm9wZXJ0aWVzIiwiSW5zZXJ0UmVzdHJpY3Rpb25zIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUFubm90YXRpb25zIiwicmVxdWlyZWRQcm9wZXJ0eSIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMiLCJpc05hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJuYXZBbm5vdGF0aW9ucyIsImVudGl0eUFubm90YXRpb25zIiwiZW50aXR5dFNldEFubm90YXRpb25zIiwiYW5ub3RhdGlvbiIsImFubm90YXRpb25LZXkiLCJzdGFydHNXaXRoIiwiYW5ub3RhdGlvblBhcnRzIiwiY3VzdG9tQWdncmVnYXRlIiwiY29udGV4dERlZmluaW5nUHJvcGVydGllcyIsImxhYmVsIiwibmFtZSIsInNvcnRhYmxlIiwic29ydE9yZGVyIiwiY3VzdG9tIiwiZ2V0U29ydFJlc3RyaWN0aW9uc0luZm8iLCJzb3J0UmVzdHJpY3Rpb25zSW5mbyIsInByb3BlcnR5SW5mbyIsInNvcnRSZXN0cmljdGlvbnMiLCJTb3J0YWJsZSIsInByb3BlcnR5SXRlbSIsIk5vblNvcnRhYmxlUHJvcGVydGllcyIsInByb3BlcnR5TmFtZSIsIkFzY2VuZGluZ09ubHlQcm9wZXJ0aWVzIiwic29ydERpcmVjdGlvbiIsIkRlc2NlbmRpbmdPbmx5UHJvcGVydGllcyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJpIiwiZmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImZpbHRlcmFibGUiLCJyZXF1aXJlc0ZpbHRlciIsIlJlcXVpcmVzRmlsdGVyIiwiRmlsdGVyYWJsZSIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJQcm9wZXJ0eSIsImFsbG93ZWRFeHByZXNzaW9ucyIsIkFsbG93ZWRFeHByZXNzaW9ucyIsImlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24iLCJmaWx0ZXJFeHByZXNzaW9uIiwiaXNNdWx0aVZhbHVlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXRhTW9kZWxGdW5jdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgZ29hbCBvZiB0aGlzIGZpbGUgaXMgdG8gZGlzYXBwZWFyIGFzIHNvb24gYXMgd2UgY2FuLlxuLy8gSXQgaXMgYSB0ZW1wb3Jhcnkgc29sdXRpb24gdG8gbW92ZSBhbGwgbWV0YW1vZGVsIHJlbGF0ZWQgb3BlcmF0aW9uIGZyb20gQ29tbW9uVXRpbHMgdG8gYSBzZXBhcmF0ZSBmaWxlLlxuXG5pbXBvcnQgdHlwZSAqIGFzIEVkbSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvRWRtXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpbHRlclJlc3RyaWN0aW9uc1R5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXMsXG5cdE5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlLFxuXHRTZWFyY2hSZXN0cmljdGlvbnNUeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVDYXRlZ29yeVR5cGUsIElzc3VlU2V2ZXJpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lzc3VlTWFuYWdlclwiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgbm90LCBvciwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERlZmF1bHRUeXBlRm9yRWRtVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IHsgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgRXhwYW5kUGF0aFR5cGUsIE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24sIE1ldGFNb2RlbEVudGl0eVR5cGUsIE1ldGFNb2RlbFR5cGUgfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbi8vIEZyb20gRmlsdGVyQmFyLmJsb2NrLnRzIG9ubHlcbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWFyY2hSZXN0cmljdGlvbnMoZnVsbFBhdGg6IHN0cmluZywgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRsZXQgc2VhcmNoUmVzdHJpY3Rpb25zO1xuXHRsZXQgbmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucztcblx0Y29uc3QgbmF2aWdhdGlvblRleHQgPSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9uc1Rlcm0gPSBcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc1wiO1xuXHRjb25zdCBlbnRpdHlUeXBlUGF0aFBhcnRzID0gZnVsbFBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGZ1bGxQYXRoLCBtZXRhTW9kZWwpO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoUGFydHMgPSBlbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRjb25zdCBpc0NvbnRhaW5tZW50ID0gbWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZVBhdGhQYXJ0cy5qb2luKFwiL1wiKX0vJENvbnRhaW5zVGFyZ2V0YCkgPyB0cnVlIDogZmFsc2U7XG5cdGNvbnN0IGNvbnRhaW5tZW50TmF2UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlUeXBlUGF0aFBhcnRzW2VudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoIC0gMV0gOiBcIlwiO1xuXG5cdC8vTEVBU1QgUFJJT1JJVFkgLSBTZWFyY2ggcmVzdHJpY3Rpb25zIGRpcmVjdGx5IGF0IEVudGl0eSBTZXRcblx0Ly9lLmcuIEZSIGluIFwiTlMuRW50aXR5Q29udGFpbmVyL1NhbGVzT3JkZXJNYW5hZ2VcIiBDb250ZXh0UGF0aDogL1NhbGVzT3JkZXJNYW5hZ2Vcblx0aWYgKCFpc0NvbnRhaW5tZW50KSB7XG5cdFx0c2VhcmNoUmVzdHJpY3Rpb25zID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofSR7c2VhcmNoUmVzdHJpY3Rpb25zVGVybX1gKSBhc1xuXHRcdFx0fCBNZXRhTW9kZWxUeXBlPFNlYXJjaFJlc3RyaWN0aW9uc1R5cGU+XG5cdFx0XHR8IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0Y29uc3QgbmF2UGF0aDogc3RyaW5nID0gaXNDb250YWlubWVudCA/IGNvbnRhaW5tZW50TmF2UGF0aCA6IGVudGl0eVNldFBhdGhQYXJ0c1tlbnRpdHlTZXRQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cdFx0Ly8gSW4gY2FzZSBvZiBjb250YWlubWVudCB3ZSB0YWtlIGVudGl0eVNldCBwcm92aWRlZCBhcyBwYXJlbnQuIEFuZCBpbiBjYXNlIG9mIG5vcm1hbCB3ZSB3b3VsZCByZW1vdmUgdGhlIGxhc3QgbmF2aWdhdGlvbiBmcm9tIGVudGl0eVNldFBhdGguXG5cdFx0Y29uc3QgcGFyZW50RW50aXR5U2V0UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlTZXRQYXRoIDogYC8ke2VudGl0eVNldFBhdGhQYXJ0cy5zbGljZSgwLCAtMSkuam9pbihgLyR7bmF2aWdhdGlvblRleHR9L2ApfWA7XG5cblx0XHQvL0hJR0hFU1QgcHJpb3JpdHkgLSBOYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3QgbmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IE1FVEFNT0RFTF9GVU5DVElPTlMuZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyhcblx0XHRcdG1ldGFNb2RlbCxcblx0XHRcdHBhcmVudEVudGl0eVNldFBhdGgsXG5cdFx0XHRuYXZQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpXG5cdFx0KTtcblx0XHRuYXZpZ2F0aW9uU2VhcmNoUmVzdHJpY3Rpb25zID0gbmF2aWdhdGlvblJlc3RyaWN0aW9ucz8uU2VhcmNoUmVzdHJpY3Rpb25zO1xuXHR9XG5cdHJldHVybiBuYXZpZ2F0aW9uU2VhcmNoUmVzdHJpY3Rpb25zID8/IHNlYXJjaFJlc3RyaWN0aW9ucztcbn1cblxuLy8gRnJvbSBDb21tb25VdGlsc1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMobWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldFBhdGg6IHN0cmluZywgbmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRjb25zdCBuYXZpZ2F0aW9uUmVzdHJpY3Rpb25zID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zYCkgYXNcblx0XHR8IE1ldGFNb2RlbFR5cGU8TmF2aWdhdGlvblJlc3RyaWN0aW9uc1R5cGU+XG5cdFx0fCB1bmRlZmluZWQ7XG5cdGNvbnN0IHJlc3RyaWN0ZWRQcm9wZXJ0aWVzID0gbmF2aWdhdGlvblJlc3RyaWN0aW9ucz8uUmVzdHJpY3RlZFByb3BlcnRpZXM7XG5cdHJldHVybiByZXN0cmljdGVkUHJvcGVydGllcz8uZmluZChmdW5jdGlvbiAocmVzdHJpY3RlZFByb3BlcnR5KSB7XG5cdFx0cmV0dXJuIHJlc3RyaWN0ZWRQcm9wZXJ0eS5OYXZpZ2F0aW9uUHJvcGVydHk/LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSBuYXZpZ2F0aW9uUGF0aDtcblx0fSk7XG59XG5cbi8vIEludGVybmFsIHVzYWdlIG9ubHlcbmZ1bmN0aW9uIGlzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyhtZXRhbW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0UGF0aDogc3RyaW5nLCBjb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGxldCBpc05vdEZpbHRlcmFibGUgPSBmYWxzZTtcblx0Y29uc3QgZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiA9IG1ldGFtb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYCkgYXNcblx0XHR8IE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5cblx0XHR8IHVuZGVmaW5lZDtcblx0aWYgKGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24/Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKSB7XG5cdFx0aXNOb3RGaWx0ZXJhYmxlID0gZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcy5zb21lKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0KHByb3BlcnR5IGFzIHVua25vd24gYXMgRXhwYW5kUGF0aFR5cGU8RWRtLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg+KS4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCA9PT0gY29udGV4dFBhdGggfHxcblx0XHRcdFx0cHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gY29udGV4dFBhdGhcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGlzTm90RmlsdGVyYWJsZTtcbn1cblxuLy8gSW50ZXJuYWwgdXNhZ2Ugb25seVxuZXhwb3J0IGZ1bmN0aW9uIGlzQ3VzdG9tQWdncmVnYXRlKG1ldGFtb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcsIGNvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0bGV0IGludGVyYW5sSXNDdXN0b21BZ2dyZWdhdGUgPSBmYWxzZTtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlZ2V4L2ludmFsaWQtd2FyblxuXHRjb25zdCBpc0FwcGx5U3VwcG9ydGVkID0gbWV0YW1vZGVsQ29udGV4dC5nZXRPYmplY3QoZW50aXR5U2V0UGF0aCArIFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BcHBseVN1cHBvcnRlZFwiKSA/IHRydWUgOiBmYWxzZTtcblx0aWYgKGlzQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRjb25zdCBlbnRpdHlTZXRBbm5vdGF0aW9ucyA9IG1ldGFtb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9QGApIGFzIE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb247XG5cdFx0Y29uc3QgY3VzdG9tQWdncmVnYXRlc0Fubm90YXRpb25zID0gTUVUQU1PREVMX0ZVTkNUSU9OUy5nZXRBbGxDdXN0b21BZ2dyZWdhdGVzKGVudGl0eVNldEFubm90YXRpb25zKSBhcyBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgY3VzdG9tQWdncmVnYXRlcyA9IGN1c3RvbUFnZ3JlZ2F0ZXNBbm5vdGF0aW9ucyA/IE9iamVjdC5rZXlzKGN1c3RvbUFnZ3JlZ2F0ZXNBbm5vdGF0aW9ucykgOiB1bmRlZmluZWQ7XG5cdFx0aWYgKGN1c3RvbUFnZ3JlZ2F0ZXM/LmluY2x1ZGVzKGNvbnRleHRQYXRoKSkge1xuXHRcdFx0aW50ZXJhbmxJc0N1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBpbnRlcmFubElzQ3VzdG9tQWdncmVnYXRlO1xufVxuXG4vLyBJbnRlcm5hbCB1c2FnZSBvbmx5XG5cbmZ1bmN0aW9uIGNoZWNrRW50aXR5U2V0SXNGaWx0ZXJhYmxlKFxuXHRlbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG1ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLFxuXHRwcm9wZXJ0eTogc3RyaW5nLFxuXHRuYXZpZ2F0aW9uQ29udGV4dDogQ29udGV4dCB8IG51bGxcbikge1xuXHRsZXQgaXNGaWx0ZXJhYmxlID1cblx0XHRlbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKS5sZW5ndGggPT09IDIgJiYgIXByb3BlcnR5LmluY2x1ZGVzKFwiL1wiKVxuXHRcdFx0PyAhaXNJbk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKG1ldGFNb2RlbENvbnRleHQsIGVudGl0eVNldFBhdGgsIHByb3BlcnR5KSAmJlxuXHRcdFx0ICAhaXNDdXN0b21BZ2dyZWdhdGUobWV0YU1vZGVsQ29udGV4dCwgZW50aXR5U2V0UGF0aCwgcHJvcGVydHkpXG5cdFx0XHQ6ICFpc0NvbnRleHRQYXRoRmlsdGVyYWJsZShtZXRhTW9kZWxDb250ZXh0LCBlbnRpdHlTZXRQYXRoLCBwcm9wZXJ0eSk7XG5cdC8vIGNoZWNrIGlmIHR5cGUgY2FuIGJlIHVzZWQgZm9yIGZpbHRlcmluZ1xuXHRpZiAoaXNGaWx0ZXJhYmxlICYmIG5hdmlnYXRpb25Db250ZXh0KSB7XG5cdFx0Y29uc3QgcHJvcGVydHlEYXRhVHlwZSA9IGdldFByb3BlcnR5RGF0YVR5cGUobmF2aWdhdGlvbkNvbnRleHQpO1xuXHRcdGlmIChwcm9wZXJ0eURhdGFUeXBlKSB7XG5cdFx0XHRpc0ZpbHRlcmFibGUgPSBwcm9wZXJ0eURhdGFUeXBlID8gaXNUeXBlRmlsdGVyYWJsZShwcm9wZXJ0eURhdGFUeXBlIGFzIGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGUpIDogZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlzRmlsdGVyYWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gaXNGaWx0ZXJhYmxlO1xufVxuXG4vLyBJbnRlcm5hbCB1c2FnZSBvbmx5XG5mdW5jdGlvbiBpc0NvbnRleHRQYXRoRmlsdGVyYWJsZShtZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0UGF0aDogc3RyaW5nLCBjb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IGZ1bGxQYXRoID0gYCR7ZW50aXR5U2V0UGF0aH0vJHtjb250ZXh0UGF0aH1gLFxuXHRcdGVzUGFydHMgPSBmdWxsUGF0aC5zcGxpdChcIi9cIikuc3BsaWNlKDAsIDIpLFxuXHRcdGNvbnRleHRzID0gZnVsbFBhdGguc3BsaXQoXCIvXCIpLnNwbGljZSgyKTtcblx0bGV0IGlzTm9GaWx0ZXJhYmxlID0gZmFsc2UsXG5cdFx0Y29udGV4dCA9IFwiXCI7XG5cblx0ZW50aXR5U2V0UGF0aCA9IGVzUGFydHMuam9pbihcIi9cIik7XG5cblx0aXNOb0ZpbHRlcmFibGUgPSBjb250ZXh0cy5zb21lKGZ1bmN0aW9uIChpdGVtOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGFycmF5OiBzdHJpbmdbXSkge1xuXHRcdGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnRleHQgKz0gYC8ke2l0ZW19YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGV4dCA9IGl0ZW07XG5cdFx0fVxuXHRcdGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoIC0gMikge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBcIi9DdXN0b21lci9TZXQvUHJvcGVydHlcIiB0aGlzIGlzIHRvIGNoZWNrIG5hdmlnYXRpb24gcmVzdHJpY3Rpb25zIG9mIFwiQ3VzdG9tZXJcIiBmb3Igbm9uLWZpbHRlcmFibGUgcHJvcGVydGllcyBpbiBcIlNldFwiXG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUmVzdHJpY3Rpb25zID0gTUVUQU1PREVMX0ZVTkNUSU9OUy5nZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKG1ldGFNb2RlbENvbnRleHQsIGVudGl0eVNldFBhdGgsIGl0ZW0pO1xuXHRcdFx0Y29uc3QgZmlsdGVyUmVzdHJpY3Rpb25zID0gbmF2aWdhdGlvblJlc3RyaWN0aW9ucz8uRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRcdFx0Y29uc3Qgbm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBmaWx0ZXJSZXN0cmljdGlvbnM/Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzO1xuXHRcdFx0Y29uc3QgdGFyZ2V0UHJvcGVydHlQYXRoID0gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzPy5maW5kKGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvcGVydHlQYXRoLiRQcm9wZXJ0eVBhdGggPT09IHRhcmdldFByb3BlcnR5UGF0aDtcblx0XHRcdFx0fSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGluZGV4ID09PSBhcnJheS5sZW5ndGggLSAxKSB7XG5cdFx0XHQvL2xhc3QgcGF0aCBzZWdtZW50XG5cdFx0XHRpc05vRmlsdGVyYWJsZSA9IGlzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyhtZXRhTW9kZWxDb250ZXh0LCBlbnRpdHlTZXRQYXRoLCBjb250ZXh0KTtcblx0XHR9IGVsc2UgaWYgKG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7aXRlbX1gKSkge1xuXHRcdFx0Ly9jaGVjayBleGlzdGluZyBjb250ZXh0IHBhdGggYW5kIGluaXRpYWxpemUgaXRcblx0XHRcdGlzTm9GaWx0ZXJhYmxlID0gaXNJbk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKG1ldGFNb2RlbENvbnRleHQsIGVudGl0eVNldFBhdGgsIGNvbnRleHQpO1xuXHRcdFx0Y29udGV4dCA9IFwiXCI7XG5cdFx0XHQvL3NldCB0aGUgbmV3IEVudGl0eVNldFxuXHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHttZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy8ke2l0ZW19YCkgYXMgc3RyaW5nfWA7XG5cdFx0fVxuXHRcdHJldHVybiBpc05vRmlsdGVyYWJsZTtcblx0fSk7XG5cdHJldHVybiBpc05vRmlsdGVyYWJsZTtcbn1cblxuLy8gSW50ZXJuYWwgdXNhZ2Ugb25seVxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eURhdGFUeXBlKG5hdmlnYXRpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdGxldCBkYXRhVHlwZSA9IG5hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiJFR5cGVcIikgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHQvLyBpZiAka2luZCBleGlzdHMsIGl0J3Mgbm90IGEgRGF0YUZpZWxkIGFuZCB3ZSBoYXZlIHRoZSBmaW5hbCB0eXBlIGFscmVhZHlcblx0aWYgKCFuYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIiRraW5kXCIpKSB7XG5cdFx0c3dpdGNoIChkYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0XHRkYXRhVHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIjpcblx0XHRcdFx0ZGF0YVR5cGUgPSBuYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIlZhbHVlLyRQYXRoLyRUeXBlXCIpIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IG5hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aFwiKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRcdGlmIChhbm5vdGF0aW9uUGF0aC5pbmNsdWRlcyhcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFwiKSkge1xuXHRcdFx0XHRcdFx0ZGF0YVR5cGUgPSBuYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIlRhcmdldC8kQW5ub3RhdGlvblBhdGgvZm4vJFBhdGgvJFR5cGVcIikgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvblBhdGguaW5jbHVkZXMoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikpIHtcblx0XHRcdFx0XHRcdGRhdGFUeXBlID0gbmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJWYWx1ZS8kUGF0aC8kVHlwZVwiKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGUuZy4gRmllbGRHcm91cCBvciBDaGFydFxuXHRcdFx0XHRcdFx0ZGF0YVR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkYXRhVHlwZTtcbn1cblxuLy8gRnJvbSBDb21tb25VdGlscywgQ29tbW9uSGVscGVyLCBGaWx0ZXJCYXJEZWxlZ2F0ZSwgRmlsdGVyRmllbGQsIFZhbHVlTGlzdEhlbHBlciwgVGFibGVEZWxlZ2F0ZVxuLy8gVE9ETyBjaGVjayB1c2VkIHBsYWNlcyBhbmQgcmV3b3JrIHRoaXNcbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3BlcnR5RmlsdGVyYWJsZShcblx0bWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsXG5cdGVudGl0eVNldFBhdGg6IHN0cmluZyxcblx0cHJvcGVydHk6IHN0cmluZyxcblx0c2tpcEhpZGRlbkZpbHRlcnM/OiBib29sZWFuXG4pOiBib29sZWFuIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAodHlwZW9mIHByb3BlcnR5ICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwic1Byb3BlcnR5IHBhcmFtZXRlciBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuXHR9XG5cblx0Ly8gUGFyYW1ldGVycyBzaG91bGQgYmUgcmVuZGVyZWQgYXMgZmlsdGVyZmllbGRzXG5cdGlmIChtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKSA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Y29uc3QgbmF2aWdhdGlvbkNvbnRleHQgPSBtZXRhTW9kZWxDb250ZXh0LmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke2VudGl0eVNldFBhdGh9LyR7cHJvcGVydHl9YCk7XG5cblx0aWYgKG5hdmlnYXRpb25Db250ZXh0ICYmICFza2lwSGlkZGVuRmlsdGVycykge1xuXHRcdGlmIChcblx0XHRcdG5hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiKSA9PT0gdHJ1ZSB8fFxuXHRcdFx0bmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyXCIpID09PSB0cnVlXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IGhpZGRlblBhdGggPSBuYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4vJFBhdGhcIikgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGhpZGRlbkZpbHRlclBhdGggPSBuYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXIvJFBhdGhcIikgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdFx0aWYgKGhpZGRlblBhdGggJiYgaGlkZGVuRmlsdGVyUGF0aCkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChvcihwYXRoSW5Nb2RlbChoaWRkZW5QYXRoKSwgcGF0aEluTW9kZWwoaGlkZGVuRmlsdGVyUGF0aCkpKSk7XG5cdFx0fSBlbHNlIGlmIChoaWRkZW5QYXRoKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KHBhdGhJbk1vZGVsKGhpZGRlblBhdGgpKSk7XG5cdFx0fSBlbHNlIGlmIChoaWRkZW5GaWx0ZXJQYXRoKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KHBhdGhJbk1vZGVsKGhpZGRlbkZpbHRlclBhdGgpKSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjaGVja0VudGl0eVNldElzRmlsdGVyYWJsZShlbnRpdHlTZXRQYXRoLCBtZXRhTW9kZWxDb250ZXh0LCBwcm9wZXJ0eSwgbmF2aWdhdGlvbkNvbnRleHQpO1xufVxuXG4vLyBGcm9tIFRyYW5zYWN0aW9uSGVscGVyIC8gRWRpdEZsb3dcbmV4cG9ydCBmdW5jdGlvbiBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMobWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHBhdGg6IHN0cmluZywgYXBwQ29tcG9uZW50PzogQXBwQ29tcG9uZW50KSB7XG5cdGNvbnN0IHRlY2huaWNhbEtleXM6IHN0cmluZ1tdID0gKG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3BhdGh9L2ApIGFzIE1ldGFNb2RlbEVudGl0eVR5cGUpLiRLZXk7XG5cdGNvbnN0IG5vbkNvbXB1dGVkVmlzaWJsZUtleXM6IHVua25vd25bXSA9IFtdO1xuXHRjb25zdCBpbW11dGFibGVWaXNpYmxlRmllbGRzOiB1bmtub3duW10gPSBbXTtcblx0Y29uc3QgZW50aXR5VHlwZSA9IG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3BhdGh9L2ApIGFzIE1ldGFNb2RlbEVudGl0eVR5cGU7XG5cdGZvciAoY29uc3QgaXRlbSBpbiBlbnRpdHlUeXBlKSB7XG5cdFx0aWYgKGVudGl0eVR5cGVbaXRlbV0uJGtpbmQgJiYgZW50aXR5VHlwZVtpdGVtXS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IChtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtwYXRofS8ke2l0ZW19QGApIHx8IHt9KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRcdFx0aXNLZXkgPSB0ZWNobmljYWxLZXlzLmluY2x1ZGVzKGl0ZW0pLFxuXHRcdFx0XHRpc0ltbXV0YWJsZSA9IGFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXSxcblx0XHRcdFx0aXNOb25Db21wdXRlZCA9ICFhbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXSxcblx0XHRcdFx0aXNWaXNpYmxlID0gIWFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSxcblx0XHRcdFx0aXNDb21wdXRlZERlZmF1bHRWYWx1ZSA9IGFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkRGVmYXVsdFZhbHVlXCJdLFxuXHRcdFx0XHRpc0tleUNvbXB1dGVkRGVmYXVsdFZhbHVlV2l0aFRleHQgPVxuXHRcdFx0XHRcdGlzS2V5ICYmIGVudGl0eVR5cGVbaXRlbV0uJFR5cGUgPT09IFwiRWRtLkd1aWRcIlxuXHRcdFx0XHRcdFx0PyBpc0NvbXB1dGVkRGVmYXVsdFZhbHVlICYmIGFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdFx0XHQ6IGZhbHNlO1xuXHRcdFx0aWYgKChpc0tleUNvbXB1dGVkRGVmYXVsdFZhbHVlV2l0aFRleHQgfHwgKGlzS2V5ICYmIGVudGl0eVR5cGVbaXRlbV0uJFR5cGUgIT09IFwiRWRtLkd1aWRcIikpICYmIGlzTm9uQ29tcHV0ZWQgJiYgaXNWaXNpYmxlKSB7XG5cdFx0XHRcdG5vbkNvbXB1dGVkVmlzaWJsZUtleXMucHVzaChpdGVtKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNJbW11dGFibGUgJiYgaXNOb25Db21wdXRlZCAmJiBpc1Zpc2libGUpIHtcblx0XHRcdFx0aW1tdXRhYmxlVmlzaWJsZUZpZWxkcy5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWlzTm9uQ29tcHV0ZWQgJiYgaXNDb21wdXRlZERlZmF1bHRWYWx1ZSAmJiBhcHBDb21wb25lbnQpIHtcblx0XHRcdFx0Y29uc3QgZGlhZ25vc3RpY3MgPSBhcHBDb21wb25lbnQuZ2V0RGlhZ25vc3RpY3MoKTtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IFwiQ29yZS5Db21wdXRlZERlZmF1bHRWYWx1ZSBpcyBpZ25vcmVkIGFzIENvcmUuQ29tcHV0ZWQgaXMgYWxyZWFkeSBzZXQgdG8gdHJ1ZVwiO1xuXHRcdFx0XHRkaWFnbm9zdGljcy5hZGRJc3N1ZShcblx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sXG5cdFx0XHRcdFx0SXNzdWVTZXZlcml0eS5NZWRpdW0sXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5VHlwZSxcblx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5VHlwZS5Bbm5vdGF0aW9ucy5JZ25vcmVkQW5ub3RhdGlvblxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCByZXF1aXJlZFByb3BlcnRpZXMgPSBNRVRBTU9ERUxfRlVOQ1RJT05TLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMocGF0aCwgbWV0YU1vZGVsQ29udGV4dCk7XG5cdGlmIChyZXF1aXJlZFByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0cmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5OiBzdHJpbmcpIHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25zID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7cGF0aH0vJHtwcm9wZXJ0eX1AYCkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQsXG5cdFx0XHRcdGlzVmlzaWJsZSA9ICFhbm5vdGF0aW9ucz8uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblx0XHRcdGlmIChpc1Zpc2libGUgJiYgIW5vbkNvbXB1dGVkVmlzaWJsZUtleXMuaW5jbHVkZXMocHJvcGVydHkpICYmICFpbW11dGFibGVWaXNpYmxlRmllbGRzLmluY2x1ZGVzKHByb3BlcnR5KSkge1xuXHRcdFx0XHRub25Db21wdXRlZFZpc2libGVLZXlzLnB1c2gocHJvcGVydHkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBub25Db21wdXRlZFZpc2libGVLZXlzLmNvbmNhdChpbW11dGFibGVWaXNpYmxlRmllbGRzKTtcbn1cbi8vIEludGVybmFsIG9ubHksIGV4cG9zZWQgZm9yIHRlc3RzXG5mdW5jdGlvbiBnZXRSZXF1aXJlZFByb3BlcnRpZXMocGF0aDogc3RyaW5nLCBtZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCwgY2hlY2tVcGRhdGVSZXN0cmljdGlvbnMgPSBmYWxzZSkge1xuXHRjb25zdCByZXF1aXJlZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCByZXF1aXJlZFByb3BlcnRpZXNXaXRoUGF0aDogeyAkUHJvcGVydHlQYXRoOiBzdHJpbmcgfVtdID0gW107XG5cdGNvbnN0IG5hdmlnYXRpb25UZXh0ID0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHRsZXQgZW50aXR5U2V0QW5ub3RhdGlvbjogTWV0YU1vZGVsRW50aXR5U2V0QW5ub3RhdGlvbiB8IG51bGwgPSBudWxsO1xuXHRpZiAocGF0aC5lbmRzV2l0aChcIiRcIikpIHtcblx0XHQvLyBpZiBzUGF0aCBjb21lcyB3aXRoIGEgJCBpbiB0aGUgZW5kLCByZW1vdmluZyBpdCBhcyBpdCBpcyBvZiBubyBzaWduaWZpY2FuY2Vcblx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKFwiLyRcIiwgXCJcIik7XG5cdH1cblx0Y29uc3QgZW50aXR5VHlwZVBhdGhQYXJ0cyA9IHBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHBhdGgsIG1ldGFNb2RlbENvbnRleHQpO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoUGFydHMgPSBlbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRjb25zdCBpc0NvbnRhaW5tZW50ID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYC8ke2VudGl0eVR5cGVQYXRoUGFydHMuam9pbihcIi9cIil9LyRDb250YWluc1RhcmdldGApID8gdHJ1ZSA6IGZhbHNlO1xuXHRjb25zdCBjb250YWlubWVudE5hdlBhdGggPSBpc0NvbnRhaW5tZW50ID8gZW50aXR5VHlwZVBhdGhQYXJ0c1tlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCAtIDFdIDogXCJcIjtcblxuXHQvL1Jlc3RyaWN0aW9ucyBkaXJlY3RseSBhdCBFbnRpdHkgU2V0XG5cdC8vZS5nLiBGUiBpbiBcIk5TLkVudGl0eUNvbnRhaW5lci9TYWxlc09yZGVyTWFuYWdlXCIgQ29udGV4dFBhdGg6IC9TYWxlc09yZGVyTWFuYWdlXG5cdGlmICghaXNDb250YWlubWVudCkge1xuXHRcdGVudGl0eVNldEFubm90YXRpb24gPSBtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBgKSBhcyBNZXRhTW9kZWxFbnRpdHlTZXRBbm5vdGF0aW9uO1xuXHR9XG5cdGlmIChlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRjb25zdCBuYXZQYXRoID0gaXNDb250YWlubWVudCA/IGNvbnRhaW5tZW50TmF2UGF0aCA6IGVudGl0eVNldFBhdGhQYXJ0c1tlbnRpdHlTZXRQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cdFx0Y29uc3QgcGFyZW50RW50aXR5U2V0UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlTZXRQYXRoIDogYC8ke2VudGl0eVNldFBhdGhQYXJ0cy5zbGljZSgwLCAtMSkuam9pbihgLyR7bmF2aWdhdGlvblRleHR9L2ApfWA7XG5cdFx0Ly9OYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3QgbmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IE1FVEFNT0RFTF9GVU5DVElPTlMuZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyhcblx0XHRcdG1ldGFNb2RlbENvbnRleHQsXG5cdFx0XHRwYXJlbnRFbnRpdHlTZXRQYXRoLFxuXHRcdFx0bmF2UGF0aC5yZXBsYWNlQWxsKFwiJTJGXCIsIFwiL1wiKVxuXHRcdCk7XG5cblx0XHRpZiAoXG5cdFx0XHRuYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdE1FVEFNT0RFTF9GVU5DVElPTlMuaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zKG5hdmlnYXRpb25SZXN0cmljdGlvbnMsIHRydWUsIGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKVxuXHRcdCkge1xuXHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzV2l0aFBhdGggPSBjaGVja1VwZGF0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0XHQ/IG5hdmlnYXRpb25SZXN0cmljdGlvbnMuVXBkYXRlUmVzdHJpY3Rpb25zPy5SZXF1aXJlZFByb3BlcnRpZXMgPz8gW11cblx0XHRcdFx0OiBuYXZpZ2F0aW9uUmVzdHJpY3Rpb25zLkluc2VydFJlc3RyaWN0aW9ucz8uUmVxdWlyZWRQcm9wZXJ0aWVzID8/IFtdO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHQhcmVxdWlyZWRQcm9wZXJ0aWVzV2l0aFBhdGgubGVuZ3RoICYmXG5cdFx0XHRNRVRBTU9ERUxfRlVOQ1RJT05TLmhhc1Jlc3RyaWN0ZWRQcm9wZXJ0aWVzSW5Bbm5vdGF0aW9ucyhlbnRpdHlTZXRBbm5vdGF0aW9uLCBmYWxzZSwgY2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpXG5cdFx0KSB7XG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXNXaXRoUGF0aCA9IE1FVEFNT0RFTF9GVU5DVElPTlMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUFubm90YXRpb25zKFxuXHRcdFx0XHRlbnRpdHlTZXRBbm5vdGF0aW9uLFxuXHRcdFx0XHRjaGVja1VwZGF0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0KTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoTUVUQU1PREVMX0ZVTkNUSU9OUy5oYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMoZW50aXR5U2V0QW5ub3RhdGlvbiwgZmFsc2UsIGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSkge1xuXHRcdHJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRoID0gTUVUQU1PREVMX0ZVTkNUSU9OUy5nZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tQW5ub3RhdGlvbnMoZW50aXR5U2V0QW5ub3RhdGlvbiwgY2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpO1xuXHR9XG5cdHJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRoLmZvckVhY2goZnVuY3Rpb24gKHJlcXVpcmVkUHJvcGVydHkpIHtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSByZXF1aXJlZFByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0cmVxdWlyZWRQcm9wZXJ0aWVzLnB1c2gocHJvcGVydHlQYXRoKTtcblx0fSk7XG5cdHJldHVybiByZXF1aXJlZFByb3BlcnRpZXM7XG59XG5cbi8vIFRyYW5zYWN0aW9uSGVscGVyIC8vIEludGVybmFsRmllbGRcbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zKHBhdGg6IHN0cmluZywgbWV0YW1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwpIHtcblx0cmV0dXJuIE1FVEFNT0RFTF9GVU5DVElPTlMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzKHBhdGgsIG1ldGFtb2RlbENvbnRleHQpO1xufVxuXG4vLyBJbnRlcm5hbEZpZWxkXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyhwYXRoOiBzdHJpbmcsIG1ldGFtb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdHJldHVybiBNRVRBTU9ERUxfRlVOQ1RJT05TLmdldFJlcXVpcmVkUHJvcGVydGllcyhwYXRoLCBtZXRhbW9kZWxDb250ZXh0LCB0cnVlKTtcbn1cblxuLy8gSW50ZXJuYWwgb25seSwgZXhwb3NlZCBmb3IgdGVzdHNcbmZ1bmN0aW9uIGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uczogTWV0YU1vZGVsRW50aXR5U2V0QW5ub3RhdGlvbiB8IG51bGwsIGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zID0gZmFsc2UpIHtcblx0aWYgKGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSB7XG5cdFx0cmV0dXJuIGFubm90YXRpb25zPy5bXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5VcGRhdGVSZXN0cmljdGlvbnNcIl0/LlJlcXVpcmVkUHJvcGVydGllcyA/PyBbXTtcblx0fVxuXHRyZXR1cm4gYW5ub3RhdGlvbnM/LltcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXT8uUmVxdWlyZWRQcm9wZXJ0aWVzID8/IFtdO1xufVxuXG4vLyBJbnRlcm5hbCBvbmx5LCBleHBvc2VkIGZvciB0ZXN0c1xuZnVuY3Rpb24gaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zKFxuXHRhbm5vdGF0aW9uczogTWV0YU1vZGVsVHlwZTxOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvblR5cGVzPiB8IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24gfCBudWxsLFxuXHRpc05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBmYWxzZSxcblx0Y2hlY2tVcGRhdGVSZXN0cmljdGlvbnMgPSBmYWxzZVxuKSB7XG5cdGlmIChpc05hdmlnYXRpb25SZXN0cmljdGlvbnMpIHtcblx0XHRjb25zdCBuYXZBbm5vdGF0aW9ucyA9IGFubm90YXRpb25zIGFzIE1ldGFNb2RlbFR5cGU8TmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb25UeXBlcz4gfCB1bmRlZmluZWQ7XG5cdFx0aWYgKGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSB7XG5cdFx0XHRyZXR1cm4gbmF2QW5ub3RhdGlvbnM/LlVwZGF0ZVJlc3RyaWN0aW9ucz8uUmVxdWlyZWRQcm9wZXJ0aWVzID8gdHJ1ZSA6IGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gbmF2QW5ub3RhdGlvbnM/Lkluc2VydFJlc3RyaWN0aW9ucz8uUmVxdWlyZWRQcm9wZXJ0aWVzID8gdHJ1ZSA6IGZhbHNlO1xuXHR9IGVsc2UgaWYgKGNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSB7XG5cdFx0Y29uc3QgZW50aXR5QW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9ucyBhcyBNZXRhTW9kZWxFbnRpdHlTZXRBbm5vdGF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdHJldHVybiBlbnRpdHlBbm5vdGF0aW9ucz8uW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdPy5SZXF1aXJlZFByb3BlcnRpZXMgPyB0cnVlIDogZmFsc2U7XG5cdH1cblx0Y29uc3QgZW50aXR5dFNldEFubm90YXRpb25zID0gYW5ub3RhdGlvbnMgYXMgTWV0YU1vZGVsRW50aXR5U2V0QW5ub3RhdGlvbiB8IHVuZGVmaW5lZDtcblx0cmV0dXJuIGVudGl0eXRTZXRBbm5vdGF0aW9ucz8uW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSW5zZXJ0UmVzdHJpY3Rpb25zXCJdPy5SZXF1aXJlZFByb3BlcnRpZXMgPyB0cnVlIDogZmFsc2U7XG59XG5cbmV4cG9ydCB0eXBlIEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb24gPSB7XG5cdGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM/OiBzdHJpbmdbXTtcblx0bGFiZWw/OiBzdHJpbmc7XG5cdG5hbWU/OiBzdHJpbmc7XG5cdHByb3BlcnR5UGF0aD86IHN0cmluZztcblx0c29ydGFibGU/OiBib29sZWFuO1xuXHRzb3J0T3JkZXI/OiBzdHJpbmc7XG5cdGN1c3RvbT86IGJvb2xlYW47XG59O1xuXG4vLyBVc2VkIGluIHRoaXMgZmlsZSBhbmQgRmlsdGVyVXRpbHNcbi8qKlxuICogUmV0dXJucyBjdXN0b20gYWdncmVnYXRlcyBmb3IgYSBnaXZlbiBlbnRpdHlTZXQuXG4gKlxuICogQHBhcmFtIGFubm90YXRpb25zIEEgbGlzdCBvZiBhbm5vdGF0aW9ucyBvZiB0aGUgZW50aXR5IHNldFxuICogQHJldHVybnMgQSBtYXAgdG8gdGhlIGN1c3RvbSBhZ2dyZWdhdGVzIGtleWVkIGJ5IHRoZWlyIHF1YWxpZmllcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbEN1c3RvbUFnZ3JlZ2F0ZXMoYW5ub3RhdGlvbnM6IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24pOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9uPiB7XG5cdGNvbnN0IGN1c3RvbUFnZ3JlZ2F0ZXM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb24+ID0ge307XG5cdGxldCBhbm5vdGF0aW9uO1xuXHRmb3IgKGNvbnN0IGFubm90YXRpb25LZXkgaW4gYW5ub3RhdGlvbnMpIHtcblx0XHRpZiAoYW5ub3RhdGlvbktleS5zdGFydHNXaXRoKFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5DdXN0b21BZ2dyZWdhdGVcIikpIHtcblx0XHRcdGFubm90YXRpb24gPSBhbm5vdGF0aW9uS2V5LnJlcGxhY2UoXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkN1c3RvbUFnZ3JlZ2F0ZSNcIiwgXCJcIik7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uUGFydHMgPSBhbm5vdGF0aW9uLnNwbGl0KFwiQFwiKTtcblxuXHRcdFx0aWYgKGFubm90YXRpb25QYXJ0cy5sZW5ndGggPT0gMikge1xuXHRcdFx0XHRjb25zdCBjdXN0b21BZ2dyZWdhdGU6IEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb24gPSB7fTtcblx0XHRcdFx0Ly9pbm5lciBhbm5vdGF0aW9uIHRoYXQgaXMgbm90IHBhcnQgb2YgXHRWYWxpZGF0aW9uLkFnZ3JlZ2F0YWJsZVRlcm1zXG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uUGFydHNbMV0gPT0gXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQ29udGV4dERlZmluaW5nUHJvcGVydGllc1wiKSB7XG5cdFx0XHRcdFx0Y3VzdG9tQWdncmVnYXRlLmNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBhbm5vdGF0aW9uc1thbm5vdGF0aW9uS2V5XSBhcyBzdHJpbmdbXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uUGFydHNbMV0gPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIikge1xuXHRcdFx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZS5sYWJlbCA9IGFubm90YXRpb25zW2Fubm90YXRpb25LZXldIGFzIHN0cmluZztcblx0XHRcdFx0fVxuXHRcdFx0XHRjdXN0b21BZ2dyZWdhdGVzW2Fubm90YXRpb25QYXJ0c1swXV0gPSBjdXN0b21BZ2dyZWdhdGU7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25QYXJ0cy5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRjdXN0b21BZ2dyZWdhdGVzW2Fubm90YXRpb25QYXJ0c1swXV0gPSB7XG5cdFx0XHRcdFx0bmFtZTogYW5ub3RhdGlvblBhcnRzWzBdLFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aDogYW5ub3RhdGlvblBhcnRzWzBdLFxuXHRcdFx0XHRcdGxhYmVsOiBgQ3VzdG9tIEFnZ3JlZ2F0ZSAoJHthbm5vdGF0aW9ufSlgLFxuXHRcdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHNvcnRPcmRlcjogXCJib3RoXCIsXG5cdFx0XHRcdFx0Y3VzdG9tOiB0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGN1c3RvbUFnZ3JlZ2F0ZXM7XG59XG5cbi8vIFVzZWQgaW4gVmFsdWVMaXN0SGVscGVyLCBDaGFydERlbGVnYXRlIGFuZCBWYWx1ZUhlbHAtVGFibGVEZWxlZ2F0ZVxuZXhwb3J0IHR5cGUgU29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5SW5mb1R5cGUgPSB7XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHRzb3J0RGlyZWN0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlID0ge1xuXHRzb3J0YWJsZTogYm9vbGVhbjtcblx0cHJvcGVydHlJbmZvOiBSZWNvcmQ8c3RyaW5nLCBTb3J0UmVzdHJpY3Rpb25zUHJvcGVydHlJbmZvVHlwZT47XG59O1xuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBzb3J0aW5nIGluZm9ybWF0aW9uIGZyb20gdGhlIHJlc3RyaWN0aW9uIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGVudGl0eVNldEFubm90YXRpb25zIEVudGl0eVNldCBvciBjb2xsZWN0aW9uIGFubm90YXRpb25zIHdpdGggdGhlIHNvcnQgcmVzdHJpY3Rpb25zIGFubm90YXRpb25cbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzb3J0IHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhlbnRpdHlTZXRBbm5vdGF0aW9uczogTWV0YU1vZGVsRW50aXR5U2V0QW5ub3RhdGlvbik6IFNvcnRSZXN0cmljdGlvbnNJbmZvVHlwZSB7XG5cdGNvbnN0IHNvcnRSZXN0cmljdGlvbnNJbmZvOiBTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGUgPSB7XG5cdFx0c29ydGFibGU6IHRydWUsXG5cdFx0cHJvcGVydHlJbmZvOiB7fVxuXHR9O1xuXG5cdGNvbnN0IHNvcnRSZXN0cmljdGlvbnMgPSBlbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNvcnRSZXN0cmljdGlvbnNcIl07XG5cblx0aWYgKCFzb3J0UmVzdHJpY3Rpb25zKSB7XG5cdFx0cmV0dXJuIHNvcnRSZXN0cmljdGlvbnNJbmZvO1xuXHR9XG5cblx0aWYgKHNvcnRSZXN0cmljdGlvbnMuU29ydGFibGUgPT09IGZhbHNlKSB7XG5cdFx0c29ydFJlc3RyaWN0aW9uc0luZm8uc29ydGFibGUgPSBmYWxzZTtcblx0fVxuXG5cdGZvciAoY29uc3QgcHJvcGVydHlJdGVtIG9mIHNvcnRSZXN0cmljdGlvbnMuTm9uU29ydGFibGVQcm9wZXJ0aWVzIHx8IFtdKSB7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlJdGVtLiRQcm9wZXJ0eVBhdGg7XG5cdFx0c29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRzb3J0YWJsZTogZmFsc2Vcblx0XHR9O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwcm9wZXJ0eUl0ZW0gb2Ygc29ydFJlc3RyaWN0aW9ucy5Bc2NlbmRpbmdPbmx5UHJvcGVydGllcyB8fCBbXSkge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5SXRlbS4kUHJvcGVydHlQYXRoO1xuXHRcdHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1twcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRzb3J0RGlyZWN0aW9uOiBcImFzY1wiIC8vIG5vdCB1c2VkLCB5ZXRcblx0XHR9O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwcm9wZXJ0eUl0ZW0gb2Ygc29ydFJlc3RyaWN0aW9ucy5EZXNjZW5kaW5nT25seVByb3BlcnRpZXMgfHwgW10pIHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eUl0ZW0uJFByb3BlcnR5UGF0aDtcblx0XHRzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0c29ydERpcmVjdGlvbjogXCJkZXNjXCIgLy8gbm90IHVzZWQsIHlldFxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gc29ydFJlc3RyaWN0aW9uc0luZm87XG59XG5cbi8vIFVzZWQgaW4gQ2hhcnREZWxlZ2F0ZSBhbmQgVmFsdWVIZWxwLVRhYmxlRGVsZWdhdGVcbmV4cG9ydCB0eXBlIEZpbHRlclJlc3RyaWN0aW9uc1Byb3BlcnR5SW5mb1R5cGUgPSB7XG5cdGZpbHRlcmFibGU6IGJvb2xlYW47XG5cdGFsbG93ZWRFeHByZXNzaW9ucz86IHN0cmluZ1tdO1xufTtcblxuZXhwb3J0IHR5cGUgRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1R5cGUgPSB7XG5cdGZpbHRlcmFibGU6IGJvb2xlYW47XG5cdHJlcXVpcmVzRmlsdGVyOiBib29sZWFuO1xuXHRwcm9wZXJ0eUluZm86IFJlY29yZDxzdHJpbmcsIEZpbHRlclJlc3RyaWN0aW9uc1Byb3BlcnR5SW5mb1R5cGU+O1xuXHRyZXF1aXJlZFByb3BlcnRpZXM6IHN0cmluZ1tdO1xufTtcbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgZmlsdGVyIGluZm9ybWF0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIGFubm9hdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmlsdGVyUmVzdHJpY3Rpb25zIFRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIGFubm90YXRpb25cbiAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8oZmlsdGVyUmVzdHJpY3Rpb25zPzogTWV0YU1vZGVsVHlwZTxGaWx0ZXJSZXN0cmljdGlvbnNUeXBlPik6IEZpbHRlclJlc3RyaWN0aW9uc0luZm9UeXBlIHtcblx0bGV0IGksIHByb3BlcnR5TmFtZTtcblx0Y29uc3QgZmlsdGVyUmVzdHJpY3Rpb25zSW5mbzogRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1R5cGUgPSB7XG5cdFx0ZmlsdGVyYWJsZTogdHJ1ZSxcblx0XHRyZXF1aXJlc0ZpbHRlcjogKGZpbHRlclJlc3RyaWN0aW9ucz8uUmVxdWlyZXNGaWx0ZXIgYXMgYm9vbGVhbikgfHwgZmFsc2UsXG5cdFx0cHJvcGVydHlJbmZvOiB7fSxcblx0XHRyZXF1aXJlZFByb3BlcnRpZXM6IFtdXG5cdH07XG5cblx0aWYgKCFmaWx0ZXJSZXN0cmljdGlvbnMpIHtcblx0XHRyZXR1cm4gZmlsdGVyUmVzdHJpY3Rpb25zSW5mbztcblx0fVxuXG5cdGlmIChmaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyYWJsZSA9PT0gZmFsc2UpIHtcblx0XHRmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLmZpbHRlcmFibGUgPSBmYWxzZTtcblx0fVxuXG5cdC8vSGllcmFyY2hpY2FsIENhc2Vcblx0aWYgKGZpbHRlclJlc3RyaWN0aW9ucy5SZXF1aXJlZFByb3BlcnRpZXMpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZmlsdGVyUmVzdHJpY3Rpb25zLlJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cHJvcGVydHlOYW1lID0gZmlsdGVyUmVzdHJpY3Rpb25zLlJlcXVpcmVkUHJvcGVydGllc1tpXS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0ZmlsdGVyUmVzdHJpY3Rpb25zSW5mby5yZXF1aXJlZFByb3BlcnRpZXMucHVzaChwcm9wZXJ0eU5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChmaWx0ZXJSZXN0cmljdGlvbnMuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZmlsdGVyUmVzdHJpY3Rpb25zLk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSBmaWx0ZXJSZXN0cmljdGlvbnMuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNbaV0uJFByb3BlcnR5UGF0aDtcblx0XHRcdGZpbHRlclJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdGZpbHRlcmFibGU6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGlmIChmaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucykge1xuXHRcdC8vVEJEXG5cdFx0Zm9yIChpID0gMDsgaSA8IGZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwcm9wZXJ0eU5hbWUgPSBmaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9uc1tpXS5Qcm9wZXJ0eT8uJFByb3BlcnR5UGF0aDtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0ZmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0XHRmaWx0ZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdGFsbG93ZWRFeHByZXNzaW9uczogZmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnNbaV0uQWxsb3dlZEV4cHJlc3Npb25zIGFzIHN0cmluZ1tdXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGZpbHRlclJlc3RyaWN0aW9uc0luZm87XG59XG5cbi8vIFVzZWQgaW4gQ2hhcnREZWxlZ2F0ZSBhbmQgVmFsdWVIZWxwLVRhYmxlRGVsZWdhdGVcbi8qKlxuICogUHJvdmlkZXMgdGhlIGluZm9ybWF0aW9uIGlmIHRoZSBGaWx0ZXJFeHByZXNzaW9uIGlzIGEgbXVsdGlWYWx1ZSBGaWx0ZXIgRXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gZmlsdGVyRXhwcmVzc2lvbiBUaGUgRmlsdGVyRXhwcmVzc2lvblR5cGVcbiAqIEByZXR1cm5zIEEgYm9vbGVhbiB2YWx1ZSB3ZXRoZXIgaXQgaXMgYSBtdWx0aVZhbHVlIEZpbHRlciBFeHByZXNzaW9uIG9yIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihmaWx0ZXJFeHByZXNzaW9uOiBTdHJpbmcpIHtcblx0bGV0IGlzTXVsdGlWYWx1ZSA9IHRydWU7XG5cblx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRzd2l0Y2ggKGZpbHRlckV4cHJlc3Npb24pIHtcblx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdGNhc2UgXCJTaW5nbGVSYW5nZVwiOlxuXHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0aXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gaXNNdWx0aVZhbHVlO1xufVxuXG4vLyBETyBOT1QgVVNFLCBvbmx5IGZvciB0ZXN0cyBhbmQgaW50ZXJuYWxseSBpbiB0aGlzIGZpbGVcbmV4cG9ydCBjb25zdCBNRVRBTU9ERUxfRlVOQ1RJT05TID0ge1xuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXMsXG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyxcblx0aGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zLFxuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zLFxuXHRnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zLFxuXHRnZXRBbGxDdXN0b21BZ2dyZWdhdGVzXG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBcUJBO0VBQ08sU0FBU0EscUJBQXFCLENBQUNDLFFBQWdCLEVBQUVDLFNBQXlCLEVBQUU7SUFDbEYsSUFBSUMsa0JBQWtCO0lBQ3RCLElBQUlDLDRCQUE0QjtJQUNoQyxNQUFNQyxjQUFjLEdBQUcsNEJBQTRCO0lBQ25ELE1BQU1DLHNCQUFzQixH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