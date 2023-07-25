/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards"], function (BindingToolkit, TypeGuards) {
  "use strict";

  var _exports = {};
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isEntitySet = TypeGuards.isEntitySet;
  var isComplexType = TypeGuards.isComplexType;
  var unresolvableExpression = BindingToolkit.unresolvableExpression;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  /**
   * Function that returns the relative path to the property from the DataModelObjectPath.
   *
   * @param contextPath The DataModelObjectPath object to the property
   * @returns The path from the root entity set
   */
  const getRelativePaths = function (contextPath) {
    return getPathRelativeLocation(contextPath === null || contextPath === void 0 ? void 0 : contextPath.contextLocation, contextPath === null || contextPath === void 0 ? void 0 : contextPath.navigationProperties).map(np => np.name);
  };

  /**
   * Gets the navigation properties from a dataModelObjectPath to the targeted navigation properties.
   *
   * @param contextPath The dataModelObjectPath
   * @param visitedNavProps The targeted navigation properties
   * @returns An array of navigation properties to reach the targeted navigation properties
   */
  _exports.getRelativePaths = getRelativePaths;
  const getPathRelativeLocation = function (contextPath) {
    let visitedNavProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    const cleanUpNavProp = navProps => {
      let currentIdx = 0;
      while (navProps.length > 1 && currentIdx != navProps.length - 1) {
        const currentNav = navProps[currentIdx];
        const nextNavProp = navProps[currentIdx + 1];
        if (isNavigationProperty(currentNav) && currentNav.partner === nextNavProp.name) {
          navProps.splice(0, 2);
        } else {
          currentIdx++;
        }
      }
      return navProps;
    };
    const getAdditionalNavProp = (referenceProps, otherProps, keepReference) => {
      const additionalNavProps = [];
      referenceProps.forEach((navProp, navIndex) => {
        if (otherProps[navIndex] !== navProp) {
          additionalNavProps.push(keepReference ? navProp : otherProps[navIndex]);
        }
      });
      return additionalNavProps;
    };
    if (!contextPath) {
      return visitedNavProps;
    }
    if (visitedNavProps.length >= contextPath.navigationProperties.length) {
      let remainingNavProps = getAdditionalNavProp(contextPath.navigationProperties, visitedNavProps, false);
      remainingNavProps = remainingNavProps.concat(visitedNavProps.slice(contextPath.navigationProperties.length));
      return cleanUpNavProp(remainingNavProps);
    }
    let extraNavProp = getAdditionalNavProp(visitedNavProps, contextPath.navigationProperties, true);
    extraNavProp = extraNavProp.concat(contextPath.navigationProperties.slice(visitedNavProps.length));
    cleanUpNavProp(extraNavProp);
    extraNavProp = extraNavProp.map(navProp => {
      return isNavigationProperty(navProp) ? navProp.targetType.navigationProperties.find(np => np.name === navProp.partner) : navProp;
    });
    return extraNavProp;
  };

  /**
   * Gets a new enhanced dataModelObjectPath matching with the provided property.
   *
   * @param dataModelObjectPath The initial dataModelObjectPath
   * @param propertyPath The property path or property to reach
   * @returns A new dataModelObjectPath
   */
  _exports.getPathRelativeLocation = getPathRelativeLocation;
  const enhanceDataModelPath = function (dataModelObjectPath, propertyPath) {
    let sPropertyPath = "";
    if (isPathAnnotationExpression(propertyPath)) {
      sPropertyPath = propertyPath.path;
    } else if (typeof propertyPath === "string") {
      sPropertyPath = propertyPath;
    }
    let target;
    if (isPathAnnotationExpression(propertyPath)) {
      target = propertyPath.$target;
    } else if (containsAComplexType(dataModelObjectPath)) {
      var _dataModelObjectPath$;
      target = (_dataModelObjectPath$ = dataModelObjectPath.convertedTypes.resolvePath(`${getTargetNavigationPath(dataModelObjectPath)}/${sPropertyPath}`)) === null || _dataModelObjectPath$ === void 0 ? void 0 : _dataModelObjectPath$.target;
    } else {
      if (sPropertyPath.startsWith("/")) {
        // remove the leading "/" because the path is going to be resolved from the entity type, so it should not be absolute
        sPropertyPath = sPropertyPath.substring(1);
      }
      target = dataModelObjectPath.targetEntityType.resolvePath(sPropertyPath);
    }
    const pathSplits = sPropertyPath.split("/");
    let newDataModelObjectPath = dataModelObjectPath;
    for (const pathPart of pathSplits) {
      newDataModelObjectPath = enhanceFromPath(newDataModelObjectPath, pathPart);
    }
    newDataModelObjectPath.targetObject = target;
    return newDataModelObjectPath;
  };

  /**
   * Gets a new enhanced dataModelObjectPath matching with the provided path
   * The targetObject is not updated by this internal function.
   *
   * @param dataModelObjectPath The initial dataModelObjectPath
   * @param path The object path to reach
   * @returns A new dataModelObjectPath
   */
  _exports.enhanceDataModelPath = enhanceDataModelPath;
  const enhanceFromPath = function (dataModelObjectPath, path) {
    let targetEntitySet;
    let targetEntityType;
    const navigationProperties = dataModelObjectPath.navigationProperties.concat();
    const navigationIndex = navigationProperties.length;
    const referenceEntityType = navigationIndex ? navigationProperties[navigationIndex - 1].targetType : dataModelObjectPath.targetEntityType;
    if (!referenceEntityType) {
      return dataModelObjectPath;
    } else if (isEntityType(referenceEntityType) || isComplexType(referenceEntityType)) {
      const currentEntitySet = dataModelObjectPath.targetEntitySet;
      const potentialNavProp = referenceEntityType.navigationProperties.find(navProp => navProp.name === path);
      if (potentialNavProp) {
        navigationProperties.push(potentialNavProp);
        targetEntityType = potentialNavProp.targetType;
        const navigationPathFromPreviousEntitySet = getNavigationBindingFromPreviousEntitySet(navigationProperties);
        if (navigationPathFromPreviousEntitySet && currentEntitySet !== null && currentEntitySet !== void 0 && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navigationPathFromPreviousEntitySet)) {
          targetEntitySet = currentEntitySet.navigationPropertyBinding[navigationPathFromPreviousEntitySet];
        }
      } else {
        const potentialComplexType = (referenceEntityType.entityProperties || referenceEntityType.properties).find(navProp => navProp.name === path);
        if (potentialComplexType !== null && potentialComplexType !== void 0 && potentialComplexType.targetType) {
          navigationProperties.push(potentialComplexType);
        }
      }
    }
    return {
      startingEntitySet: dataModelObjectPath.startingEntitySet,
      navigationProperties: navigationProperties,
      contextLocation: dataModelObjectPath.contextLocation,
      targetEntitySet: targetEntitySet ?? dataModelObjectPath.targetEntitySet,
      targetEntityType: targetEntityType ?? dataModelObjectPath.targetEntityType,
      targetObject: dataModelObjectPath.targetObject,
      convertedTypes: dataModelObjectPath.convertedTypes
    };
  };

  /**
   * Detects if the DataModelObjectPath has navigated threw a complexType.
   *
   * @param dataModelObjectPath The dataModelObjectPath
   * @returns Is there a complexType into the DataModelObjectPath.
   */
  const containsAComplexType = function (dataModelObjectPath) {
    return dataModelObjectPath.navigationProperties.find(navigation => isComplexType(navigation === null || navigation === void 0 ? void 0 : navigation.targetType)) !== undefined;
  };

  /**
   * Gets the navigation binding from the previous entitySet listed into the navigation properties.
   *
   * @param navigationProperties The navigation properties
   * @returns A new dataModelObjectPath.
   */
  const getNavigationBindingFromPreviousEntitySet = function (navigationProperties) {
    const navigationPropertyLength = navigationProperties.length;
    if (navigationPropertyLength) {
      const lastNavigation = navigationProperties[navigationPropertyLength - 1];
      const isComplexTypeLastNavigation = isComplexType(lastNavigation.targetType);
      let navigationPath = "";
      if (navigationPropertyLength > 1 && !isComplexTypeLastNavigation) {
        for (let i = 0; i < navigationPropertyLength - 1; i++) {
          const navigationProperty = navigationProperties[i];
          if (isComplexType(navigationProperty.targetType)) {
            navigationPath += `${navigationProperty.name}/`;
          } else {
            navigationPath = "";
          }
        }
      }
      return isComplexTypeLastNavigation ? "" : `${navigationPath}${lastNavigation.name}`;
    }
    return "";
  };

  /**
   * Gets the path of the targeted entitySet.
   *
   * @param dataModelObjectPath The dataModelObjectPath
   * @returns The path.
   */
  const getTargetEntitySetPath = function (dataModelObjectPath) {
    const initialPath = `/${dataModelObjectPath.startingEntitySet.name}`;
    let targetEntitySetPath = initialPath;
    let currentEntitySet = dataModelObjectPath.startingEntitySet;
    const navigationProperties = dataModelObjectPath.navigationProperties;
    let navigationPath;
    for (let i = 0; i < navigationProperties.length; i++) {
      navigationPath = getNavigationBindingFromPreviousEntitySet(navigationProperties.slice(0, i + 1));
      if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navigationPath)) {
        targetEntitySetPath += `/$NavigationPropertyBinding/${navigationPath.replace("/", "%2F")}`;
        currentEntitySet = currentEntitySet.navigationPropertyBinding[navigationPath];
      }
    }
    targetEntitySetPath += "/$";
    return targetEntitySetPath;
  };

  /**
   * Gets the path of the targeted navigation.
   *
   * @param dataModelObjectPath The dataModelObjectPath
   * @param bRelative
   * @returns The path.
   */
  _exports.getTargetEntitySetPath = getTargetEntitySetPath;
  const getTargetNavigationPath = function (dataModelObjectPath) {
    let bRelative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let path = "";
    if (!dataModelObjectPath.startingEntitySet) {
      return "/";
    }
    if (!bRelative) {
      path += `/${dataModelObjectPath.startingEntitySet.name}`;
    }
    if (dataModelObjectPath.navigationProperties.length > 0) {
      path = setTrailingSlash(path);
      path += dataModelObjectPath.navigationProperties.map(navProp => navProp.name).join("/");
    }
    return path;
  };

  /**
   * Gets the path of the targeted object.
   *
   * @param dataModelObjectPath The dataModelObjectPath
   * @param bRelative
   * @returns The path.
   */
  _exports.getTargetNavigationPath = getTargetNavigationPath;
  const getTargetObjectPath = function (dataModelObjectPath) {
    var _dataModelObjectPath$2, _dataModelObjectPath$3;
    let bRelative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let path = getTargetNavigationPath(dataModelObjectPath, bRelative);
    if ((_dataModelObjectPath$2 = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$2 !== void 0 && _dataModelObjectPath$2.name && !isNavigationProperty(dataModelObjectPath.targetObject) && !isEntityType(dataModelObjectPath.targetObject) && !isEntitySet(dataModelObjectPath.targetObject) && !isComplexType((_dataModelObjectPath$3 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$3 === void 0 ? void 0 : _dataModelObjectPath$3.targetType) && dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet) {
      path = setTrailingSlash(path);
      path += `${dataModelObjectPath.targetObject.name}`;
    } else if (dataModelObjectPath.targetObject && dataModelObjectPath.targetObject.hasOwnProperty("term")) {
      path = setTrailingSlash(path);
      path += `@${dataModelObjectPath.targetObject.term}`;
      if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
        path += `#${dataModelObjectPath.targetObject.qualifier}`;
      }
    }
    return path;
  };
  _exports.getTargetObjectPath = getTargetObjectPath;
  const getContextRelativeTargetObjectPath = function (dataModelObjectPath) {
    var _dataModelObjectPath$4;
    let forBindingExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let forFilterConditionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_dataModelObjectPath$4 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$4 === void 0 ? void 0 : _dataModelObjectPath$4.startingEntitySet) !== dataModelObjectPath.startingEntitySet) {
      return getTargetObjectPath(dataModelObjectPath);
    }
    return _getContextRelativeTargetObjectPath(dataModelObjectPath, forBindingExpression, forFilterConditionPath);
  };
  _exports.getContextRelativeTargetObjectPath = getContextRelativeTargetObjectPath;
  const _getContextRelativeTargetObjectPath = function (dataModelObjectPath) {
    var _dataModelObjectPath$5;
    let forBindingExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let forFilterConditionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (!dataModelObjectPath.targetObject) {
      return undefined;
    }
    const navProperties = getPathRelativeLocation(dataModelObjectPath.contextLocation, dataModelObjectPath.navigationProperties);
    if (forBindingExpression) {
      if (navProperties.some(isMultipleNavigationProperty)) {
        return undefined;
      }
    }
    let path = forFilterConditionPath ? navProperties.map(navProp => {
      const isCollection = isMultipleNavigationProperty(navProp);
      return isCollection ? `${navProp.name}*` : navProp.name;
    }).join("/") : navProperties.map(navProp => navProp.name).join("/");
    if ((dataModelObjectPath.targetObject.name || dataModelObjectPath.targetObject.type === "PropertyPath" && dataModelObjectPath.targetObject.value) && !isNavigationProperty(dataModelObjectPath.targetObject) && !isEntityType(dataModelObjectPath.targetObject) && !isEntitySet(dataModelObjectPath.targetObject) && !isComplexType((_dataModelObjectPath$5 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$5 === void 0 ? void 0 : _dataModelObjectPath$5.targetType) && dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet) {
      path = setTrailingSlash(path);
      path += dataModelObjectPath.targetObject.type === "PropertyPath" ? `${dataModelObjectPath.targetObject.value}` : `${dataModelObjectPath.targetObject.name}`;
    } else if (dataModelObjectPath.targetObject.hasOwnProperty("term")) {
      path = setTrailingSlash(path);
      path += `@${dataModelObjectPath.targetObject.term}`;
      if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
        path += `#${dataModelObjectPath.targetObject.qualifier}`;
      }
    }
    return path;
  };
  const isPathUpdatable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Upd;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Upd = annotationObject.UpdateRestrictions) === null || _annotationObject$Upd === void 0 ? void 0 : _annotationObject$Upd.Updatable;
    }, extractionParametersOnPath);
  };
  _exports.isPathUpdatable = isPathUpdatable;
  const isPathSearchable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Sea;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Sea = annotationObject.SearchRestrictions) === null || _annotationObject$Sea === void 0 ? void 0 : _annotationObject$Sea.Searchable;
    }, extractionParametersOnPath);
  };
  _exports.isPathSearchable = isPathSearchable;
  const isPathDeletable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Del;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Del = annotationObject.DeleteRestrictions) === null || _annotationObject$Del === void 0 ? void 0 : _annotationObject$Del.Deletable;
    }, extractionParametersOnPath);
  };
  _exports.isPathDeletable = isPathDeletable;
  const isPathInsertable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Ins;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Ins = annotationObject.InsertRestrictions) === null || _annotationObject$Ins === void 0 ? void 0 : _annotationObject$Ins.Insertable;
    }, extractionParametersOnPath);
  };
  _exports.isPathInsertable = isPathInsertable;
  const checkFilterExpressionRestrictions = function (dataModelObjectPath, allowedExpression) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      if (annotationObject && "FilterRestrictions" in annotationObject) {
        var _annotationObject$Fil;
        const filterExpressionRestrictions = (annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Fil = annotationObject.FilterRestrictions) === null || _annotationObject$Fil === void 0 ? void 0 : _annotationObject$Fil.FilterExpressionRestrictions) || [];
        const currentObjectRestriction = filterExpressionRestrictions.find(restriction => {
          return restriction.Property.$target === dataModelObjectPath.targetObject;
        });
        if (currentObjectRestriction) {
          var _currentObjectRestric;
          return allowedExpression.indexOf(currentObjectRestriction === null || currentObjectRestriction === void 0 ? void 0 : (_currentObjectRestric = currentObjectRestriction.AllowedExpressions) === null || _currentObjectRestric === void 0 ? void 0 : _currentObjectRestric.toString()) !== -1;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  };
  _exports.checkFilterExpressionRestrictions = checkFilterExpressionRestrictions;
  const checkOnPath = function (dataModelObjectPath, checkFunction, extractionParametersOnPath) {
    if (!dataModelObjectPath || !dataModelObjectPath.startingEntitySet) {
      return constant(true);
    }
    dataModelObjectPath = enhanceDataModelPath(dataModelObjectPath, extractionParametersOnPath === null || extractionParametersOnPath === void 0 ? void 0 : extractionParametersOnPath.propertyPath);
    let currentEntitySet = dataModelObjectPath.startingEntitySet;
    let parentEntitySet = null;
    let visitedNavigationPropsName = [];
    const allVisitedNavigationProps = [];
    let targetEntitySet = currentEntitySet;
    const targetEntityType = dataModelObjectPath.targetEntityType;
    let resetVisitedNavProps = false;
    dataModelObjectPath.navigationProperties.forEach(navigationProperty => {
      if (resetVisitedNavProps) {
        visitedNavigationPropsName = [];
      }
      visitedNavigationPropsName.push(navigationProperty.name);
      allVisitedNavigationProps.push(navigationProperty);
      if (isProperty(navigationProperty) || !navigationProperty.containsTarget) {
        // We should have a navigationPropertyBinding associated with the path so far which can consist of ([ContainmentNavProp]/)*[NavProp]
        const fullNavigationPath = visitedNavigationPropsName.join("/");
        if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(fullNavigationPath)) {
          parentEntitySet = currentEntitySet;
          currentEntitySet = currentEntitySet.navigationPropertyBinding[fullNavigationPath];
          targetEntitySet = currentEntitySet;
          // If we reached a navigation property with a navigationpropertybinding, we need to reset the visited path on the next iteration (if there is one)
          resetVisitedNavProps = true;
        } else {
          // We really should not end up here but at least let's try to avoid incorrect behavior
          parentEntitySet = currentEntitySet;
          currentEntitySet = null;
          resetVisitedNavProps = true;
        }
      } else {
        parentEntitySet = currentEntitySet;
        targetEntitySet = null;
      }
    });

    // At this point we have navigated down all the nav prop and we should have
    // The target entitySet pointing to either null (in case of containment navprop a last part), or the actual target (non containment as target)
    // The parent entitySet pointing to the previous entitySet used in the path
    // VisitedNavigationPath should contain the path up to this property

    // Restrictions should then be evaluated as ParentEntitySet.NavRestrictions[NavPropertyPath] || TargetEntitySet.Restrictions
    const fullNavigationPath = visitedNavigationPropsName.join("/");
    let restrictions, visitedNavProps;
    if (parentEntitySet !== null) {
      var _parentEntitySet$anno, _parentEntitySet$anno2, _parentEntitySet$anno3;
      const _parentEntitySet = parentEntitySet;
      (_parentEntitySet$anno = _parentEntitySet.annotations) === null || _parentEntitySet$anno === void 0 ? void 0 : (_parentEntitySet$anno2 = _parentEntitySet$anno.Capabilities) === null || _parentEntitySet$anno2 === void 0 ? void 0 : (_parentEntitySet$anno3 = _parentEntitySet$anno2.NavigationRestrictions) === null || _parentEntitySet$anno3 === void 0 ? void 0 : _parentEntitySet$anno3.RestrictedProperties.forEach(restrictedNavProp => {
        var _restrictedNavProp$Na;
        if (((_restrictedNavProp$Na = restrictedNavProp.NavigationProperty) === null || _restrictedNavProp$Na === void 0 ? void 0 : _restrictedNavProp$Na.type) === "NavigationPropertyPath") {
          const restrictionDefinition = checkFunction(restrictedNavProp);
          if (fullNavigationPath === restrictedNavProp.NavigationProperty.value && restrictionDefinition !== undefined) {
            var _dataModelObjectPath;
            const _allVisitedNavigationProps = allVisitedNavigationProps.slice(0, -1);
            visitedNavProps = _allVisitedNavigationProps;
            const pathRelativeLocation = getPathRelativeLocation((_dataModelObjectPath = dataModelObjectPath) === null || _dataModelObjectPath === void 0 ? void 0 : _dataModelObjectPath.contextLocation, visitedNavProps).map(np => np.name);
            const pathVisitorFunction = extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.pathVisitor ? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation) : undefined; // send pathVisitor function only when it is defined and only send function or defined as a parameter
            restrictions = equal(getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction), true);
          }
        }
      });
    }
    let targetRestrictions;
    if (!(extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.ignoreTargetCollection)) {
      var _targetEntitySet, _targetEntitySet$anno;
      let restrictionDefinition = checkFunction((_targetEntitySet = targetEntitySet) === null || _targetEntitySet === void 0 ? void 0 : (_targetEntitySet$anno = _targetEntitySet.annotations) === null || _targetEntitySet$anno === void 0 ? void 0 : _targetEntitySet$anno.Capabilities);
      if (targetEntitySet === null && restrictionDefinition === undefined) {
        var _targetEntityType$ann;
        restrictionDefinition = checkFunction(targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : _targetEntityType$ann.Capabilities);
      }
      if (restrictionDefinition !== undefined) {
        const pathRelativeLocation = getPathRelativeLocation(dataModelObjectPath.contextLocation, allVisitedNavigationProps).map(np => np.name);
        const pathVisitorFunction = extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.pathVisitor ? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation) : undefined;
        targetRestrictions = equal(getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction), true);
      }
    }
    return restrictions || targetRestrictions || (extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.authorizeUnresolvable ? unresolvableExpression : constant(true));
  };

  /**
   * Set a trailing slash to a path if not already set.
   *
   * @param path The path
   * @returns The path with a trailing slash
   */
  _exports.checkOnPath = checkOnPath;
  const setTrailingSlash = function (path) {
    if (path.length && !path.endsWith("/")) {
      return `${path}/`;
    }
    return path;
  };

  // This helper method is used to add relative path location argument to singletonPathVisitorFunction i.e. pathVisitor
  // pathVisitor method is used later to get the correct bindings for singleton entity
  // method is invoked later in pathInModel() method to get the correct binding.
  const getPathVisitorForSingleton = function (pathVisitor, pathRelativeLocation) {
    return function (path) {
      return pathVisitor(path, pathRelativeLocation);
    };
  };
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZWxhdGl2ZVBhdGhzIiwiY29udGV4dFBhdGgiLCJnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbiIsImNvbnRleHRMb2NhdGlvbiIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibWFwIiwibnAiLCJuYW1lIiwidmlzaXRlZE5hdlByb3BzIiwiY2xlYW5VcE5hdlByb3AiLCJuYXZQcm9wcyIsImN1cnJlbnRJZHgiLCJsZW5ndGgiLCJjdXJyZW50TmF2IiwibmV4dE5hdlByb3AiLCJpc05hdmlnYXRpb25Qcm9wZXJ0eSIsInBhcnRuZXIiLCJzcGxpY2UiLCJnZXRBZGRpdGlvbmFsTmF2UHJvcCIsInJlZmVyZW5jZVByb3BzIiwib3RoZXJQcm9wcyIsImtlZXBSZWZlcmVuY2UiLCJhZGRpdGlvbmFsTmF2UHJvcHMiLCJmb3JFYWNoIiwibmF2UHJvcCIsIm5hdkluZGV4IiwicHVzaCIsInJlbWFpbmluZ05hdlByb3BzIiwiY29uY2F0Iiwic2xpY2UiLCJleHRyYU5hdlByb3AiLCJ0YXJnZXRUeXBlIiwiZmluZCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsInByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eVBhdGgiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsInBhdGgiLCJ0YXJnZXQiLCIkdGFyZ2V0IiwiY29udGFpbnNBQ29tcGxleFR5cGUiLCJjb252ZXJ0ZWRUeXBlcyIsInJlc29sdmVQYXRoIiwiZ2V0VGFyZ2V0TmF2aWdhdGlvblBhdGgiLCJzdGFydHNXaXRoIiwic3Vic3RyaW5nIiwidGFyZ2V0RW50aXR5VHlwZSIsInBhdGhTcGxpdHMiLCJzcGxpdCIsIm5ld0RhdGFNb2RlbE9iamVjdFBhdGgiLCJwYXRoUGFydCIsImVuaGFuY2VGcm9tUGF0aCIsInRhcmdldE9iamVjdCIsInRhcmdldEVudGl0eVNldCIsIm5hdmlnYXRpb25JbmRleCIsInJlZmVyZW5jZUVudGl0eVR5cGUiLCJpc0VudGl0eVR5cGUiLCJpc0NvbXBsZXhUeXBlIiwiY3VycmVudEVudGl0eVNldCIsInBvdGVudGlhbE5hdlByb3AiLCJuYXZpZ2F0aW9uUGF0aEZyb21QcmV2aW91c0VudGl0eVNldCIsImdldE5hdmlnYXRpb25CaW5kaW5nRnJvbVByZXZpb3VzRW50aXR5U2V0IiwibmF2aWdhdGlvblByb3BlcnR5QmluZGluZyIsImhhc093blByb3BlcnR5IiwicG90ZW50aWFsQ29tcGxleFR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmF2aWdhdGlvbiIsInVuZGVmaW5lZCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUxlbmd0aCIsImxhc3ROYXZpZ2F0aW9uIiwiaXNDb21wbGV4VHlwZUxhc3ROYXZpZ2F0aW9uIiwibmF2aWdhdGlvblBhdGgiLCJpIiwibmF2aWdhdGlvblByb3BlcnR5IiwiZ2V0VGFyZ2V0RW50aXR5U2V0UGF0aCIsImluaXRpYWxQYXRoIiwidGFyZ2V0RW50aXR5U2V0UGF0aCIsInJlcGxhY2UiLCJiUmVsYXRpdmUiLCJzZXRUcmFpbGluZ1NsYXNoIiwiam9pbiIsImdldFRhcmdldE9iamVjdFBhdGgiLCJpc0VudGl0eVNldCIsInRlcm0iLCJxdWFsaWZpZXIiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiZm9yQmluZGluZ0V4cHJlc3Npb24iLCJmb3JGaWx0ZXJDb25kaXRpb25QYXRoIiwiX2dldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJuYXZQcm9wZXJ0aWVzIiwic29tZSIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJpc0NvbGxlY3Rpb24iLCJ0eXBlIiwidmFsdWUiLCJpc1BhdGhVcGRhdGFibGUiLCJleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aCIsImNoZWNrT25QYXRoIiwiYW5ub3RhdGlvbk9iamVjdCIsIlVwZGF0ZVJlc3RyaWN0aW9ucyIsIlVwZGF0YWJsZSIsImlzUGF0aFNlYXJjaGFibGUiLCJTZWFyY2hSZXN0cmljdGlvbnMiLCJTZWFyY2hhYmxlIiwiaXNQYXRoRGVsZXRhYmxlIiwiRGVsZXRlUmVzdHJpY3Rpb25zIiwiRGVsZXRhYmxlIiwiaXNQYXRoSW5zZXJ0YWJsZSIsIkluc2VydFJlc3RyaWN0aW9ucyIsIkluc2VydGFibGUiLCJjaGVja0ZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJhbGxvd2VkRXhwcmVzc2lvbiIsImZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJGaWx0ZXJSZXN0cmljdGlvbnMiLCJGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zIiwiY3VycmVudE9iamVjdFJlc3RyaWN0aW9uIiwicmVzdHJpY3Rpb24iLCJQcm9wZXJ0eSIsImluZGV4T2YiLCJBbGxvd2VkRXhwcmVzc2lvbnMiLCJ0b1N0cmluZyIsImNoZWNrRnVuY3Rpb24iLCJjb25zdGFudCIsInBhcmVudEVudGl0eVNldCIsInZpc2l0ZWROYXZpZ2F0aW9uUHJvcHNOYW1lIiwiYWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcyIsInJlc2V0VmlzaXRlZE5hdlByb3BzIiwiaXNQcm9wZXJ0eSIsImNvbnRhaW5zVGFyZ2V0IiwiZnVsbE5hdmlnYXRpb25QYXRoIiwicmVzdHJpY3Rpb25zIiwiX3BhcmVudEVudGl0eVNldCIsImFubm90YXRpb25zIiwiQ2FwYWJpbGl0aWVzIiwiTmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIlJlc3RyaWN0ZWRQcm9wZXJ0aWVzIiwicmVzdHJpY3RlZE5hdlByb3AiLCJOYXZpZ2F0aW9uUHJvcGVydHkiLCJyZXN0cmljdGlvbkRlZmluaXRpb24iLCJfYWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcyIsInBhdGhSZWxhdGl2ZUxvY2F0aW9uIiwicGF0aFZpc2l0b3JGdW5jdGlvbiIsInBhdGhWaXNpdG9yIiwiZ2V0UGF0aFZpc2l0b3JGb3JTaW5nbGV0b24iLCJlcXVhbCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsInRhcmdldFJlc3RyaWN0aW9ucyIsImlnbm9yZVRhcmdldENvbGxlY3Rpb24iLCJhdXRob3JpemVVbnJlc29sdmFibGUiLCJ1bnJlc29sdmFibGVFeHByZXNzaW9uIiwiZW5kc1dpdGgiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRhdGFNb2RlbFBhdGhIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xuXHRDb21wbGV4VHlwZSxcblx0Q29udmVydGVkTWV0YWRhdGEsXG5cdEVudGl0eVNldCxcblx0RW50aXR5VHlwZSxcblx0TmF2aWdhdGlvblByb3BlcnR5LFxuXHRQcm9wZXJ0eSxcblx0UHJvcGVydHlQYXRoLFxuXHRTaW5nbGV0b25cbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvblR5cGVUeXBlcyxcblx0TmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24sXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9DYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzLFxuXHRFbnRpdHlUeXBlQW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29uc3RhbnQsIGVxdWFsLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIHVucmVzb2x2YWJsZUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0aXNDb21wbGV4VHlwZSxcblx0aXNFbnRpdHlTZXQsXG5cdGlzRW50aXR5VHlwZSxcblx0aXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0aXNOYXZpZ2F0aW9uUHJvcGVydHksXG5cdGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRpc1Byb3BlcnR5XG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydHlPclBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuXG5leHBvcnQgdHlwZSBEYXRhTW9kZWxPYmplY3RQYXRoID0ge1xuXHRzdGFydGluZ0VudGl0eVNldDogU2luZ2xldG9uIHwgRW50aXR5U2V0O1xuXHRjb250ZXh0TG9jYXRpb24/OiBEYXRhTW9kZWxPYmplY3RQYXRoO1xuXHRuYXZpZ2F0aW9uUHJvcGVydGllczogKE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFByb3BlcnR5KVtdO1xuXHR0YXJnZXRFbnRpdHlTZXQ/OiBTaW5nbGV0b24gfCBFbnRpdHlTZXQ7XG5cdHRhcmdldEVudGl0eVR5cGU6IEVudGl0eVR5cGU7XG5cdHRhcmdldE9iamVjdDogYW55O1xuXHRjb252ZXJ0ZWRUeXBlczogQ29udmVydGVkTWV0YWRhdGE7XG59O1xuXG50eXBlIEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoID0ge1xuXHRwcm9wZXJ0eVBhdGg/OiBQcm9wZXJ0eU9yUGF0aDxQcm9wZXJ0eT47XG5cdHBhdGhWaXNpdG9yPzogRnVuY3Rpb247XG5cdGlnbm9yZVRhcmdldENvbGxlY3Rpb24/OiBib29sZWFuO1xuXHRhdXRob3JpemVVbnJlc29sdmFibGU/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHJlbGF0aXZlIHBhdGggdG8gdGhlIHByb3BlcnR5IGZyb20gdGhlIERhdGFNb2RlbE9iamVjdFBhdGguXG4gKlxuICogQHBhcmFtIGNvbnRleHRQYXRoIFRoZSBEYXRhTW9kZWxPYmplY3RQYXRoIG9iamVjdCB0byB0aGUgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBwYXRoIGZyb20gdGhlIHJvb3QgZW50aXR5IHNldFxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVsYXRpdmVQYXRocyA9IGZ1bmN0aW9uIChjb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRyZXR1cm4gZ2V0UGF0aFJlbGF0aXZlTG9jYXRpb24oY29udGV4dFBhdGg/LmNvbnRleHRMb2NhdGlvbiwgY29udGV4dFBhdGg/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzKS5tYXAoKG5wKSA9PiBucC5uYW1lKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGZyb20gYSBkYXRhTW9kZWxPYmplY3RQYXRoIHRvIHRoZSB0YXJnZXRlZCBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIGNvbnRleHRQYXRoIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcGFyYW0gdmlzaXRlZE5hdlByb3BzIFRoZSB0YXJnZXRlZCBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIG5hdmlnYXRpb24gcHJvcGVydGllcyB0byByZWFjaCB0aGUgdGFyZ2V0ZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbiA9IGZ1bmN0aW9uIChcblx0Y29udGV4dFBhdGg/OiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHR2aXNpdGVkTmF2UHJvcHM6IChOYXZpZ2F0aW9uUHJvcGVydHkgfCBQcm9wZXJ0eSlbXSA9IFtdXG4pOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10ge1xuXHRjb25zdCBjbGVhblVwTmF2UHJvcCA9IChuYXZQcm9wczogKE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFByb3BlcnR5KVtdKSA9PiB7XG5cdFx0bGV0IGN1cnJlbnRJZHggPSAwO1xuXHRcdHdoaWxlIChuYXZQcm9wcy5sZW5ndGggPiAxICYmIGN1cnJlbnRJZHggIT0gbmF2UHJvcHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0Y29uc3QgY3VycmVudE5hdiA9IG5hdlByb3BzW2N1cnJlbnRJZHhdO1xuXHRcdFx0Y29uc3QgbmV4dE5hdlByb3AgPSBuYXZQcm9wc1tjdXJyZW50SWR4ICsgMV07XG5cdFx0XHRpZiAoaXNOYXZpZ2F0aW9uUHJvcGVydHkoY3VycmVudE5hdikgJiYgY3VycmVudE5hdi5wYXJ0bmVyID09PSBuZXh0TmF2UHJvcC5uYW1lKSB7XG5cdFx0XHRcdG5hdlByb3BzLnNwbGljZSgwLCAyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRJZHgrKztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG5hdlByb3BzO1xuXHR9O1xuXG5cdGNvbnN0IGdldEFkZGl0aW9uYWxOYXZQcm9wID0gKFxuXHRcdHJlZmVyZW5jZVByb3BzOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10sXG5cdFx0b3RoZXJQcm9wczogKE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFByb3BlcnR5KVtdLFxuXHRcdGtlZXBSZWZlcmVuY2U6IGJvb2xlYW5cblx0KSA9PiB7XG5cdFx0Y29uc3QgYWRkaXRpb25hbE5hdlByb3BzOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10gPSBbXTtcblx0XHRyZWZlcmVuY2VQcm9wcy5mb3JFYWNoKChuYXZQcm9wLCBuYXZJbmRleCkgPT4ge1xuXHRcdFx0aWYgKG90aGVyUHJvcHNbbmF2SW5kZXhdICE9PSBuYXZQcm9wKSB7XG5cdFx0XHRcdGFkZGl0aW9uYWxOYXZQcm9wcy5wdXNoKGtlZXBSZWZlcmVuY2UgPyBuYXZQcm9wIDogb3RoZXJQcm9wc1tuYXZJbmRleF0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhZGRpdGlvbmFsTmF2UHJvcHM7XG5cdH07XG5cblx0aWYgKCFjb250ZXh0UGF0aCkge1xuXHRcdHJldHVybiB2aXNpdGVkTmF2UHJvcHM7XG5cdH1cblx0aWYgKHZpc2l0ZWROYXZQcm9wcy5sZW5ndGggPj0gY29udGV4dFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0bGV0IHJlbWFpbmluZ05hdlByb3BzID0gZ2V0QWRkaXRpb25hbE5hdlByb3AoY29udGV4dFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMsIHZpc2l0ZWROYXZQcm9wcywgZmFsc2UpO1xuXHRcdHJlbWFpbmluZ05hdlByb3BzID0gcmVtYWluaW5nTmF2UHJvcHMuY29uY2F0KHZpc2l0ZWROYXZQcm9wcy5zbGljZShjb250ZXh0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGgpKTtcblx0XHRyZXR1cm4gY2xlYW5VcE5hdlByb3AocmVtYWluaW5nTmF2UHJvcHMpO1xuXHR9XG5cdGxldCBleHRyYU5hdlByb3AgPSBnZXRBZGRpdGlvbmFsTmF2UHJvcCh2aXNpdGVkTmF2UHJvcHMsIGNvbnRleHRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLCB0cnVlKTtcblx0ZXh0cmFOYXZQcm9wID0gZXh0cmFOYXZQcm9wLmNvbmNhdChjb250ZXh0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5zbGljZSh2aXNpdGVkTmF2UHJvcHMubGVuZ3RoKSk7XG5cdGNsZWFuVXBOYXZQcm9wKGV4dHJhTmF2UHJvcCk7XG5cdGV4dHJhTmF2UHJvcCA9IGV4dHJhTmF2UHJvcC5tYXAoKG5hdlByb3ApID0+IHtcblx0XHRyZXR1cm4gaXNOYXZpZ2F0aW9uUHJvcGVydHkobmF2UHJvcClcblx0XHRcdD8gKG5hdlByb3AudGFyZ2V0VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kKChucCkgPT4gbnAubmFtZSA9PT0gbmF2UHJvcC5wYXJ0bmVyKSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpXG5cdFx0XHQ6IG5hdlByb3A7XG5cdH0pO1xuXHRyZXR1cm4gZXh0cmFOYXZQcm9wO1xufTtcblxuLyoqXG4gKiBHZXRzIGEgbmV3IGVuaGFuY2VkIGRhdGFNb2RlbE9iamVjdFBhdGggbWF0Y2hpbmcgd2l0aCB0aGUgcHJvdmlkZWQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggVGhlIGluaXRpYWwgZGF0YU1vZGVsT2JqZWN0UGF0aFxuICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgcHJvcGVydHkgcGF0aCBvciBwcm9wZXJ0eSB0byByZWFjaFxuICogQHJldHVybnMgQSBuZXcgZGF0YU1vZGVsT2JqZWN0UGF0aFxuICovXG5leHBvcnQgY29uc3QgZW5oYW5jZURhdGFNb2RlbFBhdGggPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdHByb3BlcnR5UGF0aD86IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5PlxuKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGxldCBzUHJvcGVydHlQYXRoOiBzdHJpbmcgPSBcIlwiO1xuXHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ocHJvcGVydHlQYXRoKSkge1xuXHRcdHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eVBhdGgucGF0aDtcblx0fSBlbHNlIGlmICh0eXBlb2YgcHJvcGVydHlQYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0c1Byb3BlcnR5UGF0aCA9IHByb3BlcnR5UGF0aDtcblx0fVxuXHRsZXQgdGFyZ2V0O1xuXHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ocHJvcGVydHlQYXRoKSkge1xuXHRcdHRhcmdldCA9IHByb3BlcnR5UGF0aC4kdGFyZ2V0O1xuXHR9IGVsc2UgaWYgKGNvbnRhaW5zQUNvbXBsZXhUeXBlKGRhdGFNb2RlbE9iamVjdFBhdGgpKSB7XG5cdFx0dGFyZ2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5jb252ZXJ0ZWRUeXBlcy5yZXNvbHZlUGF0aChgJHtnZXRUYXJnZXROYXZpZ2F0aW9uUGF0aChkYXRhTW9kZWxPYmplY3RQYXRoKX0vJHtzUHJvcGVydHlQYXRofWApPy50YXJnZXQ7XG5cdH0gZWxzZSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVBhdGguc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdC8vIHJlbW92ZSB0aGUgbGVhZGluZyBcIi9cIiBiZWNhdXNlIHRoZSBwYXRoIGlzIGdvaW5nIHRvIGJlIHJlc29sdmVkIGZyb20gdGhlIGVudGl0eSB0eXBlLCBzbyBpdCBzaG91bGQgbm90IGJlIGFic29sdXRlXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gc1Byb3BlcnR5UGF0aC5zdWJzdHJpbmcoMSk7XG5cdFx0fVxuXHRcdHRhcmdldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5yZXNvbHZlUGF0aChzUHJvcGVydHlQYXRoKTtcblx0fVxuXG5cdGNvbnN0IHBhdGhTcGxpdHMgPSBzUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblxuXHRsZXQgbmV3RGF0YU1vZGVsT2JqZWN0UGF0aCA9IGRhdGFNb2RlbE9iamVjdFBhdGg7XG5cdGZvciAoY29uc3QgcGF0aFBhcnQgb2YgcGF0aFNwbGl0cykge1xuXHRcdG5ld0RhdGFNb2RlbE9iamVjdFBhdGggPSBlbmhhbmNlRnJvbVBhdGgobmV3RGF0YU1vZGVsT2JqZWN0UGF0aCwgcGF0aFBhcnQpO1xuXHR9XG5cdG5ld0RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ID0gdGFyZ2V0O1xuXHRyZXR1cm4gbmV3RGF0YU1vZGVsT2JqZWN0UGF0aDtcbn07XG5cbi8qKlxuICogR2V0cyBhIG5ldyBlbmhhbmNlZCBkYXRhTW9kZWxPYmplY3RQYXRoIG1hdGNoaW5nIHdpdGggdGhlIHByb3ZpZGVkIHBhdGhcbiAqIFRoZSB0YXJnZXRPYmplY3QgaXMgbm90IHVwZGF0ZWQgYnkgdGhpcyBpbnRlcm5hbCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgaW5pdGlhbCBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcGFyYW0gcGF0aCBUaGUgb2JqZWN0IHBhdGggdG8gcmVhY2hcbiAqIEByZXR1cm5zIEEgbmV3IGRhdGFNb2RlbE9iamVjdFBhdGhcbiAqL1xuXG5jb25zdCBlbmhhbmNlRnJvbVBhdGggPSBmdW5jdGlvbiAoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgcGF0aDogc3RyaW5nKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGxldCB0YXJnZXRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IHVuZGVmaW5lZDtcblx0bGV0IHRhcmdldEVudGl0eVR5cGU6IEVudGl0eVR5cGUgfCB1bmRlZmluZWQ7XG5cdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5jb25jYXQoKTtcblx0Y29uc3QgbmF2aWdhdGlvbkluZGV4ID0gbmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoO1xuXHRjb25zdCByZWZlcmVuY2VFbnRpdHlUeXBlID0gbmF2aWdhdGlvbkluZGV4XG5cdFx0PyBuYXZpZ2F0aW9uUHJvcGVydGllc1tuYXZpZ2F0aW9uSW5kZXggLSAxXS50YXJnZXRUeXBlXG5cdFx0OiBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGU7XG5cdGlmICghcmVmZXJlbmNlRW50aXR5VHlwZSkge1xuXHRcdHJldHVybiBkYXRhTW9kZWxPYmplY3RQYXRoO1xuXHR9IGVsc2UgaWYgKGlzRW50aXR5VHlwZShyZWZlcmVuY2VFbnRpdHlUeXBlKSB8fCBpc0NvbXBsZXhUeXBlKHJlZmVyZW5jZUVudGl0eVR5cGUpKSB7XG5cdFx0Y29uc3QgY3VycmVudEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0O1xuXHRcdGNvbnN0IHBvdGVudGlhbE5hdlByb3AgPSByZWZlcmVuY2VFbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoKG5hdlByb3ApID0+IG5hdlByb3AubmFtZSA9PT0gcGF0aCk7XG5cdFx0aWYgKHBvdGVudGlhbE5hdlByb3ApIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gocG90ZW50aWFsTmF2UHJvcCk7XG5cdFx0XHR0YXJnZXRFbnRpdHlUeXBlID0gcG90ZW50aWFsTmF2UHJvcC50YXJnZXRUeXBlO1xuXG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aEZyb21QcmV2aW91c0VudGl0eVNldCA9IGdldE5hdmlnYXRpb25CaW5kaW5nRnJvbVByZXZpb3VzRW50aXR5U2V0KG5hdmlnYXRpb25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmIChcblx0XHRcdFx0bmF2aWdhdGlvblBhdGhGcm9tUHJldmlvdXNFbnRpdHlTZXQgJiZcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldD8ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZpZ2F0aW9uUGF0aEZyb21QcmV2aW91c0VudGl0eVNldClcblx0XHRcdCkge1xuXHRcdFx0XHR0YXJnZXRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2aWdhdGlvblBhdGhGcm9tUHJldmlvdXNFbnRpdHlTZXRdIGFzIEVudGl0eVNldDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgcG90ZW50aWFsQ29tcGxleFR5cGUgPSAoXG5cdFx0XHRcdChyZWZlcmVuY2VFbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUpLmVudGl0eVByb3BlcnRpZXMgfHwgKHJlZmVyZW5jZUVudGl0eVR5cGUgYXMgQ29tcGxleFR5cGUpLnByb3BlcnRpZXNcblx0XHRcdCkuZmluZCgobmF2UHJvcCkgPT4gbmF2UHJvcC5uYW1lID09PSBwYXRoKTtcblx0XHRcdGlmIChwb3RlbnRpYWxDb21wbGV4VHlwZT8udGFyZ2V0VHlwZSkge1xuXHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5wdXNoKHBvdGVudGlhbENvbXBsZXhUeXBlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHtcblx0XHRzdGFydGluZ0VudGl0eVNldDogZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllczogbmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0Y29udGV4dExvY2F0aW9uOiBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbixcblx0XHR0YXJnZXRFbnRpdHlTZXQ6IHRhcmdldEVudGl0eVNldCA/PyBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlUeXBlOiB0YXJnZXRFbnRpdHlUeXBlID8/IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZSxcblx0XHR0YXJnZXRPYmplY3Q6IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LFxuXHRcdGNvbnZlcnRlZFR5cGVzOiBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnZlcnRlZFR5cGVzXG5cdH07XG59O1xuXG4vKipcbiAqIERldGVjdHMgaWYgdGhlIERhdGFNb2RlbE9iamVjdFBhdGggaGFzIG5hdmlnYXRlZCB0aHJldyBhIGNvbXBsZXhUeXBlLlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcmV0dXJucyBJcyB0aGVyZSBhIGNvbXBsZXhUeXBlIGludG8gdGhlIERhdGFNb2RlbE9iamVjdFBhdGguXG4gKi9cbmNvbnN0IGNvbnRhaW5zQUNvbXBsZXhUeXBlID0gZnVuY3Rpb24gKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBib29sZWFuIHtcblx0cmV0dXJuIGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZCgobmF2aWdhdGlvbikgPT4gaXNDb21wbGV4VHlwZShuYXZpZ2F0aW9uPy50YXJnZXRUeXBlKSkgIT09IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgbmF2aWdhdGlvbiBiaW5kaW5nIGZyb20gdGhlIHByZXZpb3VzIGVudGl0eVNldCBsaXN0ZWQgaW50byB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uUHJvcGVydGllcyBUaGUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyBBIG5ldyBkYXRhTW9kZWxPYmplY3RQYXRoLlxuICovXG5jb25zdCBnZXROYXZpZ2F0aW9uQmluZGluZ0Zyb21QcmV2aW91c0VudGl0eVNldCA9IGZ1bmN0aW9uIChuYXZpZ2F0aW9uUHJvcGVydGllczogKE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFByb3BlcnR5KVtdKTogc3RyaW5nIHtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5TGVuZ3RoID0gbmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5TGVuZ3RoKSB7XG5cdFx0Y29uc3QgbGFzdE5hdmlnYXRpb24gPSBuYXZpZ2F0aW9uUHJvcGVydGllc1tuYXZpZ2F0aW9uUHJvcGVydHlMZW5ndGggLSAxXTtcblx0XHRjb25zdCBpc0NvbXBsZXhUeXBlTGFzdE5hdmlnYXRpb24gPSBpc0NvbXBsZXhUeXBlKGxhc3ROYXZpZ2F0aW9uLnRhcmdldFR5cGUpO1xuXHRcdGxldCBuYXZpZ2F0aW9uUGF0aCA9IFwiXCI7XG5cdFx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eUxlbmd0aCA+IDEgJiYgIWlzQ29tcGxleFR5cGVMYXN0TmF2aWdhdGlvbikge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBuYXZpZ2F0aW9uUHJvcGVydHlMZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5ID0gbmF2aWdhdGlvblByb3BlcnRpZXNbaV07XG5cdFx0XHRcdGlmIChpc0NvbXBsZXhUeXBlKG5hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlKSkge1xuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoICs9IGAke25hdmlnYXRpb25Qcm9wZXJ0eS5uYW1lfS9gO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoID0gXCJcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaXNDb21wbGV4VHlwZUxhc3ROYXZpZ2F0aW9uID8gXCJcIiA6IGAke25hdmlnYXRpb25QYXRofSR7bGFzdE5hdmlnYXRpb24ubmFtZX1gO1xuXHR9XG5cdHJldHVybiBcIlwiO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBwYXRoIG9mIHRoZSB0YXJnZXRlZCBlbnRpdHlTZXQuXG4gKlxuICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggVGhlIGRhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEByZXR1cm5zIFRoZSBwYXRoLlxuICovXG5leHBvcnQgY29uc3QgZ2V0VGFyZ2V0RW50aXR5U2V0UGF0aCA9IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0Y29uc3QgaW5pdGlhbFBhdGggPSBgLyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lfWA7XG5cdGxldCB0YXJnZXRFbnRpdHlTZXRQYXRoID0gaW5pdGlhbFBhdGg7XG5cdGxldCBjdXJyZW50RW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldDtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRsZXQgbmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBuYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdG5hdmlnYXRpb25QYXRoID0gZ2V0TmF2aWdhdGlvbkJpbmRpbmdGcm9tUHJldmlvdXNFbnRpdHlTZXQobmF2aWdhdGlvblByb3BlcnRpZXMuc2xpY2UoMCwgaSArIDEpKTtcblx0XHRpZiAoY3VycmVudEVudGl0eVNldCAmJiBjdXJyZW50RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcuaGFzT3duUHJvcGVydHkobmF2aWdhdGlvblBhdGgpKSB7XG5cdFx0XHR0YXJnZXRFbnRpdHlTZXRQYXRoICs9IGAvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtuYXZpZ2F0aW9uUGF0aC5yZXBsYWNlKFwiL1wiLCBcIiUyRlwiKX1gO1xuXHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0aW9uUGF0aF0gYXMgRW50aXR5U2V0O1xuXHRcdH1cblx0fVxuXG5cdHRhcmdldEVudGl0eVNldFBhdGggKz0gXCIvJFwiO1xuXHRyZXR1cm4gdGFyZ2V0RW50aXR5U2V0UGF0aDtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCBvZiB0aGUgdGFyZ2V0ZWQgbmF2aWdhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgZGF0YU1vZGVsT2JqZWN0UGF0aFxuICogQHBhcmFtIGJSZWxhdGl2ZVxuICogQHJldHVybnMgVGhlIHBhdGguXG4gKi9cblxuZXhwb3J0IGNvbnN0IGdldFRhcmdldE5hdmlnYXRpb25QYXRoID0gZnVuY3Rpb24gKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGJSZWxhdGl2ZTogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcblx0bGV0IHBhdGggPSBcIlwiO1xuXHRpZiAoIWRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQpIHtcblx0XHRyZXR1cm4gXCIvXCI7XG5cdH1cblx0aWYgKCFiUmVsYXRpdmUpIHtcblx0XHRwYXRoICs9IGAvJHtkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWV9YDtcblx0fVxuXHRpZiAoZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG5cdFx0cGF0aCA9IHNldFRyYWlsaW5nU2xhc2gocGF0aCk7XG5cdFx0cGF0aCArPSBkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLm1hcCgobmF2UHJvcCkgPT4gbmF2UHJvcC5uYW1lKS5qb2luKFwiL1wiKTtcblx0fVxuXHRyZXR1cm4gcGF0aDtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCBvZiB0aGUgdGFyZ2V0ZWQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcGFyYW0gYlJlbGF0aXZlXG4gKiBAcmV0dXJucyBUaGUgcGF0aC5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRhcmdldE9iamVjdFBhdGggPSBmdW5jdGlvbiAoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgYlJlbGF0aXZlOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuXHRsZXQgcGF0aCA9IGdldFRhcmdldE5hdmlnYXRpb25QYXRoKGRhdGFNb2RlbE9iamVjdFBhdGgsIGJSZWxhdGl2ZSk7XG5cdGlmIChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8ubmFtZSAmJlxuXHRcdCFpc05hdmlnYXRpb25Qcm9wZXJ0eShkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiZcblx0XHQhaXNFbnRpdHlUeXBlKGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KSAmJlxuXHRcdCFpc0VudGl0eVNldChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiZcblx0XHQhaXNDb21wbGV4VHlwZShkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8udGFyZ2V0VHlwZSkgJiZcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCAhPT0gZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldFxuXHQpIHtcblx0XHRwYXRoID0gc2V0VHJhaWxpbmdTbGFzaChwYXRoKTtcblx0XHRwYXRoICs9IGAke2RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Lm5hbWV9YDtcblx0fSBlbHNlIGlmIChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCAmJiBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcInRlcm1cIikpIHtcblx0XHRwYXRoID0gc2V0VHJhaWxpbmdTbGFzaChwYXRoKTtcblx0XHRwYXRoICs9IGBAJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtfWA7XG5cdFx0aWYgKGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Lmhhc093blByb3BlcnR5KFwicXVhbGlmaWVyXCIpICYmICEhZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QucXVhbGlmaWVyKSB7XG5cdFx0XHRwYXRoICs9IGAjJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5xdWFsaWZpZXJ9YDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0Zm9yQmluZGluZ0V4cHJlc3Npb246IGJvb2xlYW4gPSBmYWxzZSxcblx0Zm9yRmlsdGVyQ29uZGl0aW9uUGF0aDogYm9vbGVhbiA9IGZhbHNlXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/LnN0YXJ0aW5nRW50aXR5U2V0ICE9PSBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0KSB7XG5cdFx0cmV0dXJuIGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdH1cblx0cmV0dXJuIF9nZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbE9iamVjdFBhdGgsIGZvckJpbmRpbmdFeHByZXNzaW9uLCBmb3JGaWx0ZXJDb25kaXRpb25QYXRoKTtcbn07XG5cbmNvbnN0IF9nZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmb3JCaW5kaW5nRXhwcmVzc2lvbjogYm9vbGVhbiA9IGZhbHNlLFxuXHRmb3JGaWx0ZXJDb25kaXRpb25QYXRoOiBib29sZWFuID0gZmFsc2Vcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IG5hdlByb3BlcnRpZXMgPSBnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbihkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbiwgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcyk7XG5cdGlmIChmb3JCaW5kaW5nRXhwcmVzc2lvbikge1xuXHRcdGlmIChuYXZQcm9wZXJ0aWVzLnNvbWUoaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSkpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdGxldCBwYXRoID0gZm9yRmlsdGVyQ29uZGl0aW9uUGF0aFxuXHRcdD8gbmF2UHJvcGVydGllc1xuXHRcdFx0XHQubWFwKChuYXZQcm9wKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaXNDb2xsZWN0aW9uID0gaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eShuYXZQcm9wKTtcblx0XHRcdFx0XHRyZXR1cm4gaXNDb2xsZWN0aW9uID8gYCR7bmF2UHJvcC5uYW1lfSpgIDogbmF2UHJvcC5uYW1lO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuam9pbihcIi9cIilcblx0XHQ6IG5hdlByb3BlcnRpZXMubWFwKChuYXZQcm9wKSA9PiBuYXZQcm9wLm5hbWUpLmpvaW4oXCIvXCIpO1xuXG5cdGlmIChcblx0XHQoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QubmFtZSB8fFxuXHRcdFx0KGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnR5cGUgPT09IFwiUHJvcGVydHlQYXRoXCIgJiYgZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudmFsdWUpKSAmJlxuXHRcdCFpc05hdmlnYXRpb25Qcm9wZXJ0eShkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiZcblx0XHQhaXNFbnRpdHlUeXBlKGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KSAmJlxuXHRcdCFpc0VudGl0eVNldChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiZcblx0XHQhaXNDb21wbGV4VHlwZShkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8udGFyZ2V0VHlwZSkgJiZcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCAhPT0gZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldFxuXHQpIHtcblx0XHRwYXRoID0gc2V0VHJhaWxpbmdTbGFzaChwYXRoKTtcblx0XHRwYXRoICs9XG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiXG5cdFx0XHRcdD8gYCR7ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudmFsdWV9YFxuXHRcdFx0XHQ6IGAke2RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Lm5hbWV9YDtcblx0fSBlbHNlIGlmIChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcInRlcm1cIikpIHtcblx0XHRwYXRoID0gc2V0VHJhaWxpbmdTbGFzaChwYXRoKTtcblx0XHRwYXRoICs9IGBAJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtfWA7XG5cdFx0aWYgKGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Lmhhc093blByb3BlcnR5KFwicXVhbGlmaWVyXCIpICYmICEhZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QucXVhbGlmaWVyKSB7XG5cdFx0XHRwYXRoICs9IGAjJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5xdWFsaWZpZXJ9YDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgaXNQYXRoVXBkYXRhYmxlID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY2hlY2tPblBhdGgoXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHQoYW5ub3RhdGlvbk9iamVjdDogTmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24gfCBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0Py5VcGRhdGVSZXN0cmljdGlvbnM/LlVwZGF0YWJsZTtcblx0XHR9LFxuXHRcdGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNQYXRoU2VhcmNoYWJsZSA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCxcblx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/OiBFeHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNoZWNrT25QYXRoKFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0KGFubm90YXRpb25PYmplY3Q6IE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uIHwgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzKSA9PiB7XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdD8uU2VhcmNoUmVzdHJpY3Rpb25zPy5TZWFyY2hhYmxlO1xuXHRcdH0sXG5cdFx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcblx0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1BhdGhEZWxldGFibGUgPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQsXG5cdGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPzogRXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjaGVja09uUGF0aChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdChhbm5vdGF0aW9uT2JqZWN0OiBOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvbiB8IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcykgPT4ge1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25PYmplY3Q/LkRlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlO1xuXHRcdH0sXG5cdFx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcblx0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1BhdGhJbnNlcnRhYmxlID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY2hlY2tPblBhdGgoXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHQoYW5ub3RhdGlvbk9iamVjdDogTmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24gfCBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0Py5JbnNlcnRSZXN0cmljdGlvbnM/Lkluc2VydGFibGU7XG5cdFx0fSxcblx0XHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aFxuXHQpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0YWxsb3dlZEV4cHJlc3Npb246IChzdHJpbmcgfCB1bmRlZmluZWQpW11cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjaGVja09uUGF0aChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdChhbm5vdGF0aW9uT2JqZWN0OiBOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvbiB8IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcyB8IEVudGl0eVR5cGVBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0ICYmIFwiRmlsdGVyUmVzdHJpY3Rpb25zXCIgaW4gYW5ub3RhdGlvbk9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zOiBGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlVHlwZXNbXSA9XG5cdFx0XHRcdFx0KGFubm90YXRpb25PYmplY3Q/LkZpbHRlclJlc3RyaWN0aW9ucz8uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyBhcyBGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlVHlwZXNbXSkgfHwgW107XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRPYmplY3RSZXN0cmljdGlvbiA9IGZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMuZmluZCgocmVzdHJpY3Rpb24pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gKHJlc3RyaWN0aW9uLlByb3BlcnR5IGFzIFByb3BlcnR5UGF0aCkuJHRhcmdldCA9PT0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoY3VycmVudE9iamVjdFJlc3RyaWN0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFsbG93ZWRFeHByZXNzaW9uLmluZGV4T2YoY3VycmVudE9iamVjdFJlc3RyaWN0aW9uPy5BbGxvd2VkRXhwcmVzc2lvbnM/LnRvU3RyaW5nKCkpICE9PSAtMTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tPblBhdGggPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQsXG5cdGNoZWNrRnVuY3Rpb246IEZ1bmN0aW9uLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRpZiAoIWRhdGFNb2RlbE9iamVjdFBhdGggfHwgIWRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdH1cblxuXHRkYXRhTW9kZWxPYmplY3RQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsT2JqZWN0UGF0aCwgZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/LnByb3BlcnR5UGF0aCk7XG5cblx0bGV0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IG51bGwgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0O1xuXHRsZXQgcGFyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCBudWxsID0gbnVsbDtcblx0bGV0IHZpc2l0ZWROYXZpZ2F0aW9uUHJvcHNOYW1lOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBhbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10gPSBbXTtcblx0bGV0IHRhcmdldEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgbnVsbCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdGNvbnN0IHRhcmdldEVudGl0eVR5cGU6IEVudGl0eVR5cGUgfCBudWxsID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlO1xuXHRsZXQgcmVzZXRWaXNpdGVkTmF2UHJvcHMgPSBmYWxzZTtcblxuXHRkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZvckVhY2goKG5hdmlnYXRpb25Qcm9wZXJ0eSkgPT4ge1xuXHRcdGlmIChyZXNldFZpc2l0ZWROYXZQcm9wcykge1xuXHRcdFx0dmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUgPSBbXTtcblx0XHR9XG5cdFx0dmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUucHVzaChuYXZpZ2F0aW9uUHJvcGVydHkubmFtZSk7XG5cdFx0YWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcy5wdXNoKG5hdmlnYXRpb25Qcm9wZXJ0eSk7XG5cdFx0aWYgKGlzUHJvcGVydHkobmF2aWdhdGlvblByb3BlcnR5KSB8fCAhbmF2aWdhdGlvblByb3BlcnR5LmNvbnRhaW5zVGFyZ2V0KSB7XG5cdFx0XHQvLyBXZSBzaG91bGQgaGF2ZSBhIG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcgYXNzb2NpYXRlZCB3aXRoIHRoZSBwYXRoIHNvIGZhciB3aGljaCBjYW4gY29uc2lzdCBvZiAoW0NvbnRhaW5tZW50TmF2UHJvcF0vKSpbTmF2UHJvcF1cblx0XHRcdGNvbnN0IGZ1bGxOYXZpZ2F0aW9uUGF0aCA9IHZpc2l0ZWROYXZpZ2F0aW9uUHJvcHNOYW1lLmpvaW4oXCIvXCIpO1xuXHRcdFx0aWYgKGN1cnJlbnRFbnRpdHlTZXQgJiYgY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLmhhc093blByb3BlcnR5KGZ1bGxOYXZpZ2F0aW9uUGF0aCkpIHtcblx0XHRcdFx0cGFyZW50RW50aXR5U2V0ID0gY3VycmVudEVudGl0eVNldDtcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tmdWxsTmF2aWdhdGlvblBhdGhdO1xuXHRcdFx0XHR0YXJnZXRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0XHQvLyBJZiB3ZSByZWFjaGVkIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eSB3aXRoIGEgbmF2aWdhdGlvbnByb3BlcnR5YmluZGluZywgd2UgbmVlZCB0byByZXNldCB0aGUgdmlzaXRlZCBwYXRoIG9uIHRoZSBuZXh0IGl0ZXJhdGlvbiAoaWYgdGhlcmUgaXMgb25lKVxuXHRcdFx0XHRyZXNldFZpc2l0ZWROYXZQcm9wcyA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBXZSByZWFsbHkgc2hvdWxkIG5vdCBlbmQgdXAgaGVyZSBidXQgYXQgbGVhc3QgbGV0J3MgdHJ5IHRvIGF2b2lkIGluY29ycmVjdCBiZWhhdmlvclxuXHRcdFx0XHRwYXJlbnRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gbnVsbDtcblx0XHRcdFx0cmVzZXRWaXNpdGVkTmF2UHJvcHMgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXJlbnRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0ID0gbnVsbDtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSBuYXZpZ2F0ZWQgZG93biBhbGwgdGhlIG5hdiBwcm9wIGFuZCB3ZSBzaG91bGQgaGF2ZVxuXHQvLyBUaGUgdGFyZ2V0IGVudGl0eVNldCBwb2ludGluZyB0byBlaXRoZXIgbnVsbCAoaW4gY2FzZSBvZiBjb250YWlubWVudCBuYXZwcm9wIGEgbGFzdCBwYXJ0KSwgb3IgdGhlIGFjdHVhbCB0YXJnZXQgKG5vbiBjb250YWlubWVudCBhcyB0YXJnZXQpXG5cdC8vIFRoZSBwYXJlbnQgZW50aXR5U2V0IHBvaW50aW5nIHRvIHRoZSBwcmV2aW91cyBlbnRpdHlTZXQgdXNlZCBpbiB0aGUgcGF0aFxuXHQvLyBWaXNpdGVkTmF2aWdhdGlvblBhdGggc2hvdWxkIGNvbnRhaW4gdGhlIHBhdGggdXAgdG8gdGhpcyBwcm9wZXJ0eVxuXG5cdC8vIFJlc3RyaWN0aW9ucyBzaG91bGQgdGhlbiBiZSBldmFsdWF0ZWQgYXMgUGFyZW50RW50aXR5U2V0Lk5hdlJlc3RyaWN0aW9uc1tOYXZQcm9wZXJ0eVBhdGhdIHx8IFRhcmdldEVudGl0eVNldC5SZXN0cmljdGlvbnNcblx0Y29uc3QgZnVsbE5hdmlnYXRpb25QYXRoID0gdmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUuam9pbihcIi9cIik7XG5cdGxldCByZXN0cmljdGlvbnMsIHZpc2l0ZWROYXZQcm9wcztcblx0aWYgKHBhcmVudEVudGl0eVNldCAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IF9wYXJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCA9IHBhcmVudEVudGl0eVNldDtcblx0XHRfcGFyZW50RW50aXR5U2V0LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/Lk5hdmlnYXRpb25SZXN0cmljdGlvbnM/LlJlc3RyaWN0ZWRQcm9wZXJ0aWVzLmZvckVhY2goXG5cdFx0XHQocmVzdHJpY3RlZE5hdlByb3A6IE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXMpID0+IHtcblx0XHRcdFx0aWYgKHJlc3RyaWN0ZWROYXZQcm9wLk5hdmlnYXRpb25Qcm9wZXJ0eT8udHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIpIHtcblx0XHRcdFx0XHRjb25zdCByZXN0cmljdGlvbkRlZmluaXRpb24gPSBjaGVja0Z1bmN0aW9uKHJlc3RyaWN0ZWROYXZQcm9wKTtcblx0XHRcdFx0XHRpZiAoZnVsbE5hdmlnYXRpb25QYXRoID09PSByZXN0cmljdGVkTmF2UHJvcC5OYXZpZ2F0aW9uUHJvcGVydHkudmFsdWUgJiYgcmVzdHJpY3Rpb25EZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IF9hbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzID0gYWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcy5zbGljZSgwLCAtMSk7XG5cdFx0XHRcdFx0XHR2aXNpdGVkTmF2UHJvcHMgPSBfYWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcztcblx0XHRcdFx0XHRcdGNvbnN0IHBhdGhSZWxhdGl2ZUxvY2F0aW9uID0gZ2V0UGF0aFJlbGF0aXZlTG9jYXRpb24oZGF0YU1vZGVsT2JqZWN0UGF0aD8uY29udGV4dExvY2F0aW9uLCB2aXNpdGVkTmF2UHJvcHMpLm1hcChcblx0XHRcdFx0XHRcdFx0KG5wKSA9PiBucC5uYW1lXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y29uc3QgcGF0aFZpc2l0b3JGdW5jdGlvbiA9IGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPy5wYXRoVmlzaXRvclxuXHRcdFx0XHRcdFx0XHQ/IGdldFBhdGhWaXNpdG9yRm9yU2luZ2xldG9uKGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoLnBhdGhWaXNpdG9yLCBwYXRoUmVsYXRpdmVMb2NhdGlvbilcblx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7IC8vIHNlbmQgcGF0aFZpc2l0b3IgZnVuY3Rpb24gb25seSB3aGVuIGl0IGlzIGRlZmluZWQgYW5kIG9ubHkgc2VuZCBmdW5jdGlvbiBvciBkZWZpbmVkIGFzIGEgcGFyYW1ldGVyXG5cdFx0XHRcdFx0XHRyZXN0cmljdGlvbnMgPSBlcXVhbChcblx0XHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHJlc3RyaWN0aW9uRGVmaW5pdGlvbiwgcGF0aFJlbGF0aXZlTG9jYXRpb24sIHVuZGVmaW5lZCwgcGF0aFZpc2l0b3JGdW5jdGlvbiksXG5cdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXHRsZXQgdGFyZ2V0UmVzdHJpY3Rpb25zO1xuXHRpZiAoIWV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPy5pZ25vcmVUYXJnZXRDb2xsZWN0aW9uKSB7XG5cdFx0bGV0IHJlc3RyaWN0aW9uRGVmaW5pdGlvbiA9IGNoZWNrRnVuY3Rpb24odGFyZ2V0RW50aXR5U2V0Py5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzKTtcblx0XHRpZiAodGFyZ2V0RW50aXR5U2V0ID09PSBudWxsICYmIHJlc3RyaWN0aW9uRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXN0cmljdGlvbkRlZmluaXRpb24gPSBjaGVja0Z1bmN0aW9uKHRhcmdldEVudGl0eVR5cGU/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXMpO1xuXHRcdH1cblx0XHRpZiAocmVzdHJpY3Rpb25EZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IHBhdGhSZWxhdGl2ZUxvY2F0aW9uID0gZ2V0UGF0aFJlbGF0aXZlTG9jYXRpb24oZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24sIGFsbFZpc2l0ZWROYXZpZ2F0aW9uUHJvcHMpLm1hcChcblx0XHRcdFx0KG5wKSA9PiBucC5uYW1lXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgcGF0aFZpc2l0b3JGdW5jdGlvbiA9IGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPy5wYXRoVmlzaXRvclxuXHRcdFx0XHQ/IGdldFBhdGhWaXNpdG9yRm9yU2luZ2xldG9uKGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoLnBhdGhWaXNpdG9yLCBwYXRoUmVsYXRpdmVMb2NhdGlvbilcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHR0YXJnZXRSZXN0cmljdGlvbnMgPSBlcXVhbChcblx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHJlc3RyaWN0aW9uRGVmaW5pdGlvbiwgcGF0aFJlbGF0aXZlTG9jYXRpb24sIHVuZGVmaW5lZCwgcGF0aFZpc2l0b3JGdW5jdGlvbiksXG5cdFx0XHRcdHRydWVcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIChcblx0XHRyZXN0cmljdGlvbnMgfHwgdGFyZ2V0UmVzdHJpY3Rpb25zIHx8IChleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD8uYXV0aG9yaXplVW5yZXNvbHZhYmxlID8gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbiA6IGNvbnN0YW50KHRydWUpKVxuXHQpO1xufTtcblxuLyoqXG4gKiBTZXQgYSB0cmFpbGluZyBzbGFzaCB0byBhIHBhdGggaWYgbm90IGFscmVhZHkgc2V0LlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoXG4gKiBAcmV0dXJucyBUaGUgcGF0aCB3aXRoIGEgdHJhaWxpbmcgc2xhc2hcbiAqL1xuY29uc3Qgc2V0VHJhaWxpbmdTbGFzaCA9IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpIHtcblx0aWYgKHBhdGgubGVuZ3RoICYmICFwYXRoLmVuZHNXaXRoKFwiL1wiKSkge1xuXHRcdHJldHVybiBgJHtwYXRofS9gO1xuXHR9XG5cdHJldHVybiBwYXRoO1xufTtcblxuLy8gVGhpcyBoZWxwZXIgbWV0aG9kIGlzIHVzZWQgdG8gYWRkIHJlbGF0aXZlIHBhdGggbG9jYXRpb24gYXJndW1lbnQgdG8gc2luZ2xldG9uUGF0aFZpc2l0b3JGdW5jdGlvbiBpLmUuIHBhdGhWaXNpdG9yXG4vLyBwYXRoVmlzaXRvciBtZXRob2QgaXMgdXNlZCBsYXRlciB0byBnZXQgdGhlIGNvcnJlY3QgYmluZGluZ3MgZm9yIHNpbmdsZXRvbiBlbnRpdHlcbi8vIG1ldGhvZCBpcyBpbnZva2VkIGxhdGVyIGluIHBhdGhJbk1vZGVsKCkgbWV0aG9kIHRvIGdldCB0aGUgY29ycmVjdCBiaW5kaW5nLlxuY29uc3QgZ2V0UGF0aFZpc2l0b3JGb3JTaW5nbGV0b24gPSBmdW5jdGlvbiAocGF0aFZpc2l0b3I6IEZ1bmN0aW9uLCBwYXRoUmVsYXRpdmVMb2NhdGlvbjogc3RyaW5nW10pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gcGF0aFZpc2l0b3IocGF0aCwgcGF0aFJlbGF0aXZlTG9jYXRpb24pO1xuXHR9O1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxnQkFBZ0IsR0FBRyxVQUFVQyxXQUFnQyxFQUFFO0lBQzNFLE9BQU9DLHVCQUF1QixDQUFDRCxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRUUsZUFBZSxFQUFFRixXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRUcsb0JBQW9CLENBQUMsQ0FBQ0Ms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