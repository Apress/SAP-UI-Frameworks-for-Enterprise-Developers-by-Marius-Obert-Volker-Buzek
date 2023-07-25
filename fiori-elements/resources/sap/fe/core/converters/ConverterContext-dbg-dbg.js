/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/ManifestWrapper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper"], function (ManifestWrapper, MetaModelConverter, TypeGuards, DataModelPathHelper) {
  "use strict";

  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isServiceObject = TypeGuards.isServiceObject;
  var getInvolvedDataModelObjectFromPath = MetaModelConverter.getInvolvedDataModelObjectFromPath;
  var convertTypes = MetaModelConverter.convertTypes;
  /**
   * Checks whether an object is an annotation term.
   *
   * @param vAnnotationPath
   * @returns `true` if it's an annotation term
   */
  const isAnnotationTerm = function (vAnnotationPath) {
    return typeof vAnnotationPath === "object";
  };
  const getDataModelPathForEntitySet = function (resolvedMetaPath, convertedTypes) {
    let rootEntitySet;
    let currentEntitySet;
    let previousEntitySet;
    let currentEntityType;
    let navigatedPaths = [];
    const navigationProperties = [];
    resolvedMetaPath.objectPath.forEach(objectPart => {
      var _currentEntitySet;
      if (isServiceObject(objectPart)) {
        switch (objectPart._type) {
          case "NavigationProperty":
            navigatedPaths.push(objectPart.name);
            navigationProperties.push(objectPart);
            currentEntityType = objectPart.targetType;
            if (previousEntitySet && previousEntitySet.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join("/"))) {
              currentEntitySet = previousEntitySet.navigationPropertyBinding[navigatedPaths.join("/")];
              previousEntitySet = currentEntitySet;
              navigatedPaths = [];
            } else {
              currentEntitySet = undefined;
            }
            break;
          case "EntitySet":
            if (rootEntitySet === undefined) {
              rootEntitySet = objectPart;
            }
            currentEntitySet = objectPart;
            previousEntitySet = currentEntitySet;
            currentEntityType = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.entityType;
            break;
          default:
            break;
        }
      }
    });
    const dataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntityType: currentEntityType,
      targetEntitySet: currentEntitySet,
      navigationProperties: navigationProperties,
      contextLocation: undefined,
      targetObject: resolvedMetaPath.target,
      convertedTypes: convertedTypes
    };
    dataModelPath.contextLocation = dataModelPath;
    return dataModelPath;
  };

  /**
   * Create a ConverterContext object that will be used within the converters.
   *
   * @param {ConvertedMetadata} oConvertedTypes The converted annotation and service types
   * @param {BaseManifestSettings} oManifestSettings The manifestSettings that applies to this page
   * @param {TemplateType} templateType The type of template we're looking at right now
   * @param {IDiagnostics} diagnostics The diagnostics shim
   * @param {Function} mergeFn The function to be used to perfom some deep merges between object
   * @param {DataModelObjectPath} targetDataModelPath The global path to reach the entitySet
   * @returns {ConverterContext} A converter context for the converters
   */
  let ConverterContext = /*#__PURE__*/function () {
    function ConverterContext(convertedTypes, manifestSettings, diagnostics, mergeFn, targetDataModelPath) {
      this.convertedTypes = convertedTypes;
      this.manifestSettings = manifestSettings;
      this.diagnostics = diagnostics;
      this.mergeFn = mergeFn;
      this.targetDataModelPath = targetDataModelPath;
      this.manifestWrapper = new ManifestWrapper(this.manifestSettings, mergeFn);
      this.baseContextPath = getTargetObjectPath(this.targetDataModelPath);
    }
    var _proto = ConverterContext.prototype;
    _proto._getEntityTypeFromFullyQualifiedName = function _getEntityTypeFromFullyQualifiedName(fullyQualifiedName) {
      return this.convertedTypes.entityTypes.find(entityType => {
        if (fullyQualifiedName.startsWith(entityType.fullyQualifiedName)) {
          const replaceAnnotation = fullyQualifiedName.replace(entityType.fullyQualifiedName, "");
          return replaceAnnotation.startsWith("/") || replaceAnnotation.startsWith("@");
        }
        return false;
      });
    }

    /**
     * Retrieve the entityType associated with an annotation object.
     *
     * @param annotation The annotation object for which we want to find the entityType
     * @returns The EntityType the annotation refers to
     */;
    _proto.getAnnotationEntityType = function getAnnotationEntityType(annotation) {
      if (annotation) {
        const annotationPath = annotation.fullyQualifiedName;
        const targetEntityType = this._getEntityTypeFromFullyQualifiedName(annotationPath);
        if (!targetEntityType) {
          throw new Error(`Cannot find Entity Type for ${annotation.fullyQualifiedName}`);
        }
        return targetEntityType;
      } else {
        return this.targetDataModelPath.targetEntityType;
      }
    }

    /**
     * Retrieve the manifest settings defined for a specific control within controlConfiguration.
     *
     * @param vAnnotationPath The annotation path or object to evaluate
     * @returns The control configuration for that specific annotation path if it exists
     */;
    _proto.getManifestControlConfiguration = function getManifestControlConfiguration(vAnnotationPath) {
      if (isAnnotationTerm(vAnnotationPath)) {
        return this.manifestWrapper.getControlConfiguration(vAnnotationPath.fullyQualifiedName.replace(this.targetDataModelPath.targetEntityType.fullyQualifiedName, ""));
      }
      // Checking if there are multiple entity set in the manifest, and comparing the entity set of the ControlConfiguration with the one from the annotation.
      const sAnnotationPath = this.manifestWrapper.hasMultipleEntitySets() && this.baseContextPath !== `/${this.manifestWrapper.getEntitySet()}` ? `${this.baseContextPath}/${vAnnotationPath}` : vAnnotationPath;
      return this.manifestWrapper.getControlConfiguration(sAnnotationPath);
    }

    /**
     * Create an absolute annotation path based on the current meta model context.
     *
     * @param sAnnotationPath The relative annotation path
     * @returns The correct annotation path based on the current context
     */;
    _proto.getAbsoluteAnnotationPath = function getAbsoluteAnnotationPath(sAnnotationPath) {
      if (!sAnnotationPath) {
        return sAnnotationPath;
      }
      if (sAnnotationPath[0] === "/") {
        return sAnnotationPath;
      }
      return `${this.baseContextPath}/${sAnnotationPath}`;
    }

    /**
     * Retrieve the current entitySet.
     *
     * @returns The current EntitySet if it exists.
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this.targetDataModelPath.targetEntitySet;
    }

    /**
     * Retrieve the context path.
     *
     * @returns The context path of the converter.
     */;
    _proto.getContextPath = function getContextPath() {
      return this.baseContextPath;
    }

    /**
     * Retrieve the current data model object path.
     *
     * @returns The current data model object path
     */;
    _proto.getDataModelObjectPath = function getDataModelObjectPath() {
      return this.targetDataModelPath;
    }

    /**
     * Get the EntityContainer.
     *
     * @returns The current service EntityContainer
     */;
    _proto.getEntityContainer = function getEntityContainer() {
      return this.convertedTypes.entityContainer;
    }

    /**
     * Get the EntityType based on the fully qualified name.
     *
     * @returns The current EntityType.
     */;
    _proto.getEntityType = function getEntityType() {
      return this.targetDataModelPath.targetEntityType;
    }

    /**
     * Gets the entity type of the parameter in case of a parameterized service.
     *
     * @returns The entity type of the parameter
     */;
    _proto.getParameterEntityType = function getParameterEntityType() {
      var _parameterEntityType$, _parameterEntityType$2;
      const parameterEntityType = this.targetDataModelPath.startingEntitySet.entityType;
      const isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext);
      return isParameterized && parameterEntityType;
    }

    /**
     * Retrieves an annotation from an entity type based on annotation path.
     *
     * @param annotationPath The annotation path to be evaluated
     * @returns The target annotation path as well as a converter context to go with it
     */;
    _proto.getEntityTypeAnnotation = function getEntityTypeAnnotation(annotationPath) {
      if (!annotationPath.includes("@")) {
        throw new Error(`Not an annotation path: '${annotationPath}'`);
      }
      const isAbsolute = annotationPath.startsWith("/");
      let path;
      if (isAbsolute) {
        // path can be used as-is
        path = annotationPath;
      } else {
        // build an absolute path based on the entity type (this function works on the type!)
        const base = this.getContextPath().split("@", 1)[0];
        path = base.endsWith("/") ? base + annotationPath : `${base}/${annotationPath}`;
      }
      const target = this.resolveAbsolutePath(path);
      const dataModelObjectPath = getInvolvedDataModelObjectFromPath({
        target: target.target,
        visitedObjects: target.objectPath
      }, this.convertedTypes, isAbsolute ? undefined : this.targetDataModelPath.contextLocation, true);
      return {
        annotation: target.target,
        converterContext: new ConverterContext(this.convertedTypes, this.manifestSettings, this.diagnostics, this.mergeFn, dataModelObjectPath)
      };
    }

    /**
     * Retrieve the type of template we're working on (e.g. ListReport / ObjectPage / ...).
     *
     * @returns The current tenplate type
     */;
    _proto.getTemplateType = function getTemplateType() {
      return this.manifestWrapper.getTemplateType();
    }

    /**
     * Retrieve the converted types.
     *
     * @returns The current converted types
     */;
    _proto.getConvertedTypes = function getConvertedTypes() {
      return this.convertedTypes;
    }

    /**
     * Retrieve a relative annotation path between an annotation path and an entity type.
     *
     * @param annotationPath
     * @param entityType
     * @returns The relative anntotation path.
     */;
    _proto.getRelativeAnnotationPath = function getRelativeAnnotationPath(annotationPath, entityType) {
      return annotationPath.replace(entityType.fullyQualifiedName, "");
    }

    /**
     * Transform an entityType based path to an entitySet based one (ui5 templating generally expect an entitySetBasedPath).
     *
     * @param annotationPath
     * @returns The EntitySet based annotation path
     */;
    _proto.getEntitySetBasedAnnotationPath = function getEntitySetBasedAnnotationPath(annotationPath) {
      if (!annotationPath) {
        return annotationPath;
      }
      const entityTypeFQN = this.targetDataModelPath.targetEntityType.fullyQualifiedName;
      if (this.targetDataModelPath.targetEntitySet || (this.baseContextPath.startsWith("/") && this.baseContextPath.match(/\//g) || []).length > 1) {
        let replacedAnnotationPath = annotationPath.replace(entityTypeFQN, "/");
        if (replacedAnnotationPath.length > 2 && replacedAnnotationPath[0] === "/" && replacedAnnotationPath[1] === "/") {
          replacedAnnotationPath = replacedAnnotationPath.substr(1);
        }
        return this.baseContextPath + (replacedAnnotationPath.startsWith("/") ? replacedAnnotationPath : `/${replacedAnnotationPath}`);
      } else {
        return `/${annotationPath}`;
      }
    }

    /**
     * Retrieve the manifest wrapper for the current context.
     *
     * @returns The current manifest wrapper
     */;
    _proto.getManifestWrapper = function getManifestWrapper() {
      return this.manifestWrapper;
    };
    _proto.getDiagnostics = function getDiagnostics() {
      return this.diagnostics;
    }

    /**
     * Retrieve the target from an absolute path.
     *
     * @param path The path we want to get the target
     * @returns The absolute path
     */;
    _proto.resolveAbsolutePath = function resolveAbsolutePath(path) {
      return this.convertedTypes.resolvePath(path);
    }

    /**
     * Retrieve a new converter context, scoped for a different context path.
     *
     * @param contextPath The path we want to orchestrate the converter context around
     * @returns The converted context for the sub path
     */;
    _proto.getConverterContextFor = function getConverterContextFor(contextPath) {
      const resolvedMetaPath = this.convertedTypes.resolvePath(contextPath);
      const targetPath = getDataModelPathForEntitySet(resolvedMetaPath, this.convertedTypes);
      return new ConverterContext(this.convertedTypes, this.manifestSettings, this.diagnostics, this.mergeFn, targetPath);
    }

    /**
     * Get all annotations of a given term and vocabulary on an entity type
     * (or on the current entity type if entityType isn't specified).
     *
     * @param vocabularyName
     * @param annotationTerm
     * @param [annotationSources]
     * @returns All the annotation for a specific term and vocabulary from an entity type
     */;
    _proto.getAnnotationsByTerm = function getAnnotationsByTerm(vocabularyName, annotationTerm) {
      let annotationSources = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [this.getEntityType()];
      let outAnnotations = [];
      annotationSources.forEach(annotationSource => {
        if (annotationSource) {
          const annotations = (annotationSource === null || annotationSource === void 0 ? void 0 : annotationSource.annotations[vocabularyName]) || {};
          if (annotations) {
            outAnnotations = Object.keys(annotations).filter(annotation => annotations[annotation].term === annotationTerm).reduce((previousValue, key) => {
              previousValue.push(annotations[key]);
              return previousValue;
            }, outAnnotations);
          }
        }
      });
      return outAnnotations;
    }

    /**
     * Retrieves the relative model path based on the current context path.
     *
     * @returns The relative model path or undefined if the path is not resolveable
     */;
    _proto.getRelativeModelPathFunction = function getRelativeModelPathFunction() {
      const targetDataModelPath = this.targetDataModelPath;
      return function (sPath) {
        const enhancedPath = enhanceDataModelPath(targetDataModelPath, sPath);
        return getContextRelativeTargetObjectPath(enhancedPath, true);
      };
    }

    /**
     * Create the converter context necessary for a macro based on a metamodel context.
     *
     * @param sEntitySetName
     * @param oMetaModelContext
     * @param diagnostics
     * @param mergeFn
     * @param targetDataModelPath
     * @param manifestSettings
     * @returns The current converter context
     */;
    ConverterContext.createConverterContextForMacro = function createConverterContextForMacro(sEntitySetName, oMetaModelContext, diagnostics, mergeFn, targetDataModelPath) {
      let manifestSettings = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      const oMetaModel = oMetaModelContext.isA("sap.ui.model.odata.v4.ODataMetaModel") ? oMetaModelContext : oMetaModelContext.getModel();
      const oConvertedMetadata = convertTypes(oMetaModel);
      let targetEntitySet = oConvertedMetadata.entitySets.find(entitySet => entitySet.name === sEntitySetName);
      if (!targetEntitySet) {
        targetEntitySet = oConvertedMetadata.singletons.find(entitySet => entitySet.name === sEntitySetName);
      }
      if (!targetDataModelPath || targetEntitySet !== targetDataModelPath.startingEntitySet) {
        targetDataModelPath = {
          startingEntitySet: targetEntitySet,
          navigationProperties: [],
          targetEntitySet: targetEntitySet,
          targetEntityType: targetEntitySet.entityType,
          targetObject: targetEntitySet,
          convertedTypes: oConvertedMetadata
        };
      }
      return new ConverterContext(oConvertedMetadata, manifestSettings, diagnostics, mergeFn, targetDataModelPath);
    };
    return ConverterContext;
  }();
  return ConverterContext;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0Fubm90YXRpb25UZXJtIiwidkFubm90YXRpb25QYXRoIiwiZ2V0RGF0YU1vZGVsUGF0aEZvckVudGl0eVNldCIsInJlc29sdmVkTWV0YVBhdGgiLCJjb252ZXJ0ZWRUeXBlcyIsInJvb3RFbnRpdHlTZXQiLCJjdXJyZW50RW50aXR5U2V0IiwicHJldmlvdXNFbnRpdHlTZXQiLCJjdXJyZW50RW50aXR5VHlwZSIsIm5hdmlnYXRlZFBhdGhzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJvYmplY3RQYXRoIiwiZm9yRWFjaCIsIm9iamVjdFBhcnQiLCJpc1NlcnZpY2VPYmplY3QiLCJfdHlwZSIsInB1c2giLCJuYW1lIiwidGFyZ2V0VHlwZSIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJoYXNPd25Qcm9wZXJ0eSIsImpvaW4iLCJ1bmRlZmluZWQiLCJlbnRpdHlUeXBlIiwiZGF0YU1vZGVsUGF0aCIsInN0YXJ0aW5nRW50aXR5U2V0IiwidGFyZ2V0RW50aXR5VHlwZSIsInRhcmdldEVudGl0eVNldCIsImNvbnRleHRMb2NhdGlvbiIsInRhcmdldE9iamVjdCIsInRhcmdldCIsIkNvbnZlcnRlckNvbnRleHQiLCJtYW5pZmVzdFNldHRpbmdzIiwiZGlhZ25vc3RpY3MiLCJtZXJnZUZuIiwidGFyZ2V0RGF0YU1vZGVsUGF0aCIsIm1hbmlmZXN0V3JhcHBlciIsIk1hbmlmZXN0V3JhcHBlciIsImJhc2VDb250ZXh0UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJfZ2V0RW50aXR5VHlwZUZyb21GdWxseVF1YWxpZmllZE5hbWUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJlbnRpdHlUeXBlcyIsImZpbmQiLCJzdGFydHNXaXRoIiwicmVwbGFjZUFubm90YXRpb24iLCJyZXBsYWNlIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJFcnJvciIsImdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24iLCJnZXRDb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImhhc011bHRpcGxlRW50aXR5U2V0cyIsImdldEVudGl0eVNldCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJnZXRDb250ZXh0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRFbnRpdHlDb250YWluZXIiLCJlbnRpdHlDb250YWluZXIiLCJnZXRFbnRpdHlUeXBlIiwiZ2V0UGFyYW1ldGVyRW50aXR5VHlwZSIsInBhcmFtZXRlckVudGl0eVR5cGUiLCJpc1BhcmFtZXRlcml6ZWQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlJlc3VsdENvbnRleHQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsImluY2x1ZGVzIiwiaXNBYnNvbHV0ZSIsInBhdGgiLCJiYXNlIiwic3BsaXQiLCJlbmRzV2l0aCIsInJlc29sdmVBYnNvbHV0ZVBhdGgiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RGcm9tUGF0aCIsInZpc2l0ZWRPYmplY3RzIiwiY29udmVydGVyQ29udGV4dCIsImdldFRlbXBsYXRlVHlwZSIsImdldENvbnZlcnRlZFR5cGVzIiwiZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJlbnRpdHlUeXBlRlFOIiwibWF0Y2giLCJsZW5ndGgiLCJyZXBsYWNlZEFubm90YXRpb25QYXRoIiwic3Vic3RyIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0RGlhZ25vc3RpY3MiLCJyZXNvbHZlUGF0aCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJjb250ZXh0UGF0aCIsInRhcmdldFBhdGgiLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsInZvY2FidWxhcnlOYW1lIiwiYW5ub3RhdGlvblRlcm0iLCJhbm5vdGF0aW9uU291cmNlcyIsIm91dEFubm90YXRpb25zIiwiYW5ub3RhdGlvblNvdXJjZSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJ0ZXJtIiwicmVkdWNlIiwicHJldmlvdXNWYWx1ZSIsImtleSIsImdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24iLCJzUGF0aCIsImVuaGFuY2VkUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInNFbnRpdHlTZXROYW1lIiwib01ldGFNb2RlbENvbnRleHQiLCJvTWV0YU1vZGVsIiwiaXNBIiwiZ2V0TW9kZWwiLCJvQ29udmVydGVkTWV0YWRhdGEiLCJjb252ZXJ0VHlwZXMiLCJlbnRpdHlTZXRzIiwiZW50aXR5U2V0Iiwic2luZ2xldG9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29udmVydGVyQ29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb25UZXJtLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5Q29udGFpbmVyLFxuXHRFbnRpdHlTZXQsXG5cdEVudGl0eVR5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0UmVzb2x1dGlvblRhcmdldCxcblx0U2VydmljZU9iamVjdCxcblx0U2VydmljZU9iamVjdEFuZEFubm90YXRpb24sXG5cdFNpbmdsZXRvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRW50aXR5VHlwZUFubm90YXRpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9FZG1fVHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQmFzZU1hbmlmZXN0U2V0dGluZ3MsIFRlbXBsYXRlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCBNYW5pZmVzdFdyYXBwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RXcmFwcGVyXCI7XG5pbXBvcnQgeyBjb252ZXJ0VHlwZXMsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgSURpYWdub3N0aWNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvVGVtcGxhdGVDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGlzU2VydmljZU9iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmV4cG9ydCB0eXBlIFJlc29sdmVkQW5ub3RhdGlvbkNvbnRleHQgPSB7XG5cdGFubm90YXRpb246IEFubm90YXRpb25UZXJtPGFueT47XG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQ7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBpcyBhbiBhbm5vdGF0aW9uIHRlcm0uXG4gKlxuICogQHBhcmFtIHZBbm5vdGF0aW9uUGF0aFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0J3MgYW4gYW5ub3RhdGlvbiB0ZXJtXG4gKi9cbmNvbnN0IGlzQW5ub3RhdGlvblRlcm0gPSBmdW5jdGlvbiAodkFubm90YXRpb25QYXRoOiBzdHJpbmcgfCBBbm5vdGF0aW9uVGVybTxhbnk+KTogdkFubm90YXRpb25QYXRoIGlzIEFubm90YXRpb25UZXJtPGFueT4ge1xuXHRyZXR1cm4gdHlwZW9mIHZBbm5vdGF0aW9uUGF0aCA9PT0gXCJvYmplY3RcIjtcbn07XG5cbmNvbnN0IGdldERhdGFNb2RlbFBhdGhGb3JFbnRpdHlTZXQgPSBmdW5jdGlvbiAoXG5cdHJlc29sdmVkTWV0YVBhdGg6IFJlc29sdXRpb25UYXJnZXQ8YW55Pixcblx0Y29udmVydGVkVHlwZXM6IENvbnZlcnRlZE1ldGFkYXRhXG4pOiBEYXRhTW9kZWxPYmplY3RQYXRoIHtcblx0bGV0IHJvb3RFbnRpdHlTZXQ6IEVudGl0eVNldCB8IHVuZGVmaW5lZDtcblx0bGV0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IHVuZGVmaW5lZDtcblx0bGV0IHByZXZpb3VzRW50aXR5U2V0OiBFbnRpdHlTZXQgfCB1bmRlZmluZWQ7XG5cdGxldCBjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSB8IHVuZGVmaW5lZDtcblx0bGV0IG5hdmlnYXRlZFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogTmF2aWdhdGlvblByb3BlcnR5W10gPSBbXTtcblx0cmVzb2x2ZWRNZXRhUGF0aC5vYmplY3RQYXRoLmZvckVhY2goKG9iamVjdFBhcnQ6IFNlcnZpY2VPYmplY3RBbmRBbm5vdGF0aW9uKSA9PiB7XG5cdFx0aWYgKGlzU2VydmljZU9iamVjdChvYmplY3RQYXJ0KSkge1xuXHRcdFx0c3dpdGNoIChvYmplY3RQYXJ0Ll90eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIjpcblx0XHRcdFx0XHRuYXZpZ2F0ZWRQYXRocy5wdXNoKG9iamVjdFBhcnQubmFtZSk7XG5cdFx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChvYmplY3RQYXJ0KTtcblx0XHRcdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9IG9iamVjdFBhcnQudGFyZ2V0VHlwZTtcblx0XHRcdFx0XHRpZiAocHJldmlvdXNFbnRpdHlTZXQgJiYgcHJldmlvdXNFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZpZ2F0ZWRQYXRocy5qb2luKFwiL1wiKSkpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBwcmV2aW91c0VudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdmlnYXRlZFBhdGhzLmpvaW4oXCIvXCIpXSBhcyBFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0XHRwcmV2aW91c0VudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0XHRuYXZpZ2F0ZWRQYXRocyA9IFtdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkVudGl0eVNldFwiOlxuXHRcdFx0XHRcdGlmIChyb290RW50aXR5U2V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHJvb3RFbnRpdHlTZXQgPSBvYmplY3RQYXJ0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gb2JqZWN0UGFydDtcblx0XHRcdFx0XHRwcmV2aW91c0VudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBjdXJyZW50RW50aXR5U2V0Py5lbnRpdHlUeXBlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdGNvbnN0IGRhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggPSB7XG5cdFx0c3RhcnRpbmdFbnRpdHlTZXQ6IHJvb3RFbnRpdHlTZXQgYXMgRW50aXR5U2V0LFxuXHRcdHRhcmdldEVudGl0eVR5cGU6IGN1cnJlbnRFbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUsXG5cdFx0dGFyZ2V0RW50aXR5U2V0OiBjdXJyZW50RW50aXR5U2V0LFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBuYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRjb250ZXh0TG9jYXRpb246IHVuZGVmaW5lZCxcblx0XHR0YXJnZXRPYmplY3Q6IHJlc29sdmVkTWV0YVBhdGgudGFyZ2V0LFxuXHRcdGNvbnZlcnRlZFR5cGVzOiBjb252ZXJ0ZWRUeXBlc1xuXHR9O1xuXHRkYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbiA9IGRhdGFNb2RlbFBhdGg7XG5cdHJldHVybiBkYXRhTW9kZWxQYXRoO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBDb252ZXJ0ZXJDb250ZXh0IG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB3aXRoaW4gdGhlIGNvbnZlcnRlcnMuXG4gKlxuICogQHBhcmFtIHtDb252ZXJ0ZWRNZXRhZGF0YX0gb0NvbnZlcnRlZFR5cGVzIFRoZSBjb252ZXJ0ZWQgYW5ub3RhdGlvbiBhbmQgc2VydmljZSB0eXBlc1xuICogQHBhcmFtIHtCYXNlTWFuaWZlc3RTZXR0aW5nc30gb01hbmlmZXN0U2V0dGluZ3MgVGhlIG1hbmlmZXN0U2V0dGluZ3MgdGhhdCBhcHBsaWVzIHRvIHRoaXMgcGFnZVxuICogQHBhcmFtIHtUZW1wbGF0ZVR5cGV9IHRlbXBsYXRlVHlwZSBUaGUgdHlwZSBvZiB0ZW1wbGF0ZSB3ZSdyZSBsb29raW5nIGF0IHJpZ2h0IG5vd1xuICogQHBhcmFtIHtJRGlhZ25vc3RpY3N9IGRpYWdub3N0aWNzIFRoZSBkaWFnbm9zdGljcyBzaGltXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXJnZUZuIFRoZSBmdW5jdGlvbiB0byBiZSB1c2VkIHRvIHBlcmZvbSBzb21lIGRlZXAgbWVyZ2VzIGJldHdlZW4gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGFNb2RlbE9iamVjdFBhdGh9IHRhcmdldERhdGFNb2RlbFBhdGggVGhlIGdsb2JhbCBwYXRoIHRvIHJlYWNoIHRoZSBlbnRpdHlTZXRcbiAqIEByZXR1cm5zIHtDb252ZXJ0ZXJDb250ZXh0fSBBIGNvbnZlcnRlciBjb250ZXh0IGZvciB0aGUgY29udmVydGVyc1xuICovXG5jbGFzcyBDb252ZXJ0ZXJDb250ZXh0IHtcblx0cHJpdmF0ZSBtYW5pZmVzdFdyYXBwZXI6IE1hbmlmZXN0V3JhcHBlcjtcblxuXHRwcml2YXRlIGJhc2VDb250ZXh0UGF0aDogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgY29udmVydGVkVHlwZXM6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHRcdHByaXZhdGUgbWFuaWZlc3RTZXR0aW5nczogQmFzZU1hbmlmZXN0U2V0dGluZ3MsXG5cdFx0cHJpdmF0ZSBkaWFnbm9zdGljczogSURpYWdub3N0aWNzLFxuXHRcdHByaXZhdGUgbWVyZ2VGbjogRnVuY3Rpb24sXG5cdFx0cHJpdmF0ZSB0YXJnZXREYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoXG5cdCkge1xuXHRcdHRoaXMubWFuaWZlc3RXcmFwcGVyID0gbmV3IE1hbmlmZXN0V3JhcHBlcih0aGlzLm1hbmlmZXN0U2V0dGluZ3MsIG1lcmdlRm4pO1xuXHRcdHRoaXMuYmFzZUNvbnRleHRQYXRoID0gZ2V0VGFyZ2V0T2JqZWN0UGF0aCh0aGlzLnRhcmdldERhdGFNb2RlbFBhdGgpO1xuXHR9XG5cblx0cHJpdmF0ZSBfZ2V0RW50aXR5VHlwZUZyb21GdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lOiBzdHJpbmcpOiBFbnRpdHlUeXBlIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0ZWRUeXBlcy5lbnRpdHlUeXBlcy5maW5kKChlbnRpdHlUeXBlKSA9PiB7XG5cdFx0XHRpZiAoZnVsbHlRdWFsaWZpZWROYW1lLnN0YXJ0c1dpdGgoZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUpKSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VBbm5vdGF0aW9uID0gZnVsbHlRdWFsaWZpZWROYW1lLnJlcGxhY2UoZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsIFwiXCIpO1xuXHRcdFx0XHRyZXR1cm4gcmVwbGFjZUFubm90YXRpb24uc3RhcnRzV2l0aChcIi9cIikgfHwgcmVwbGFjZUFubm90YXRpb24uc3RhcnRzV2l0aChcIkBcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIGVudGl0eVR5cGUgYXNzb2NpYXRlZCB3aXRoIGFuIGFubm90YXRpb24gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvbiBUaGUgYW5ub3RhdGlvbiBvYmplY3QgZm9yIHdoaWNoIHdlIHdhbnQgdG8gZmluZCB0aGUgZW50aXR5VHlwZVxuXHQgKiBAcmV0dXJucyBUaGUgRW50aXR5VHlwZSB0aGUgYW5ub3RhdGlvbiByZWZlcnMgdG9cblx0ICovXG5cdGdldEFubm90YXRpb25FbnRpdHlUeXBlKGFubm90YXRpb24/OiBBbm5vdGF0aW9uVGVybTxhbnk+KTogRW50aXR5VHlwZSB7XG5cdFx0aWYgKGFubm90YXRpb24pIHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25QYXRoID0gYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0XHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gdGhpcy5fZ2V0RW50aXR5VHlwZUZyb21GdWxseVF1YWxpZmllZE5hbWUoYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0aWYgKCF0YXJnZXRFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgRW50aXR5IFR5cGUgZm9yICR7YW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWV9YCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFyZ2V0RW50aXR5VHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgbWFuaWZlc3Qgc2V0dGluZ3MgZGVmaW5lZCBmb3IgYSBzcGVjaWZpYyBjb250cm9sIHdpdGhpbiBjb250cm9sQ29uZmlndXJhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHZBbm5vdGF0aW9uUGF0aCBUaGUgYW5ub3RhdGlvbiBwYXRoIG9yIG9iamVjdCB0byBldmFsdWF0ZVxuXHQgKiBAcmV0dXJucyBUaGUgY29udHJvbCBjb25maWd1cmF0aW9uIGZvciB0aGF0IHNwZWNpZmljIGFubm90YXRpb24gcGF0aCBpZiBpdCBleGlzdHNcblx0ICovXG5cdGdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odkFubm90YXRpb25QYXRoOiBzdHJpbmcgfCBBbm5vdGF0aW9uVGVybTxhbnk+KTogYW55IHtcblx0XHRpZiAoaXNBbm5vdGF0aW9uVGVybSh2QW5ub3RhdGlvblBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5tYW5pZmVzdFdyYXBwZXIuZ2V0Q29udHJvbENvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHZBbm5vdGF0aW9uUGF0aC5mdWxseVF1YWxpZmllZE5hbWUucmVwbGFjZSh0aGlzLnRhcmdldERhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsIFwiXCIpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvLyBDaGVja2luZyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgZW50aXR5IHNldCBpbiB0aGUgbWFuaWZlc3QsIGFuZCBjb21wYXJpbmcgdGhlIGVudGl0eSBzZXQgb2YgdGhlIENvbnRyb2xDb25maWd1cmF0aW9uIHdpdGggdGhlIG9uZSBmcm9tIHRoZSBhbm5vdGF0aW9uLlxuXHRcdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9XG5cdFx0XHR0aGlzLm1hbmlmZXN0V3JhcHBlci5oYXNNdWx0aXBsZUVudGl0eVNldHMoKSAmJiB0aGlzLmJhc2VDb250ZXh0UGF0aCAhPT0gYC8ke3RoaXMubWFuaWZlc3RXcmFwcGVyLmdldEVudGl0eVNldCgpfWBcblx0XHRcdFx0PyBgJHt0aGlzLmJhc2VDb250ZXh0UGF0aH0vJHt2QW5ub3RhdGlvblBhdGh9YFxuXHRcdFx0XHQ6IHZBbm5vdGF0aW9uUGF0aDtcblx0XHRyZXR1cm4gdGhpcy5tYW5pZmVzdFdyYXBwZXIuZ2V0Q29udHJvbENvbmZpZ3VyYXRpb24oc0Fubm90YXRpb25QYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW4gYWJzb2x1dGUgYW5ub3RhdGlvbiBwYXRoIGJhc2VkIG9uIHRoZSBjdXJyZW50IG1ldGEgbW9kZWwgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHNBbm5vdGF0aW9uUGF0aCBUaGUgcmVsYXRpdmUgYW5ub3RhdGlvbiBwYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IGFubm90YXRpb24gcGF0aCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0XG5cdCAqL1xuXHRnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKHNBbm5vdGF0aW9uUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAoIXNBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIHNBbm5vdGF0aW9uUGF0aDtcblx0XHR9XG5cdFx0aWYgKHNBbm5vdGF0aW9uUGF0aFswXSA9PT0gXCIvXCIpIHtcblx0XHRcdHJldHVybiBzQW5ub3RhdGlvblBhdGg7XG5cdFx0fVxuXHRcdHJldHVybiBgJHt0aGlzLmJhc2VDb250ZXh0UGF0aH0vJHtzQW5ub3RhdGlvblBhdGh9YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgY3VycmVudCBlbnRpdHlTZXQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IEVudGl0eVNldCBpZiBpdCBleGlzdHMuXG5cdCAqL1xuXHRnZXRFbnRpdHlTZXQoKTogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy50YXJnZXREYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQgfCBTaW5nbGV0b247XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIGNvbnRleHQgcGF0aC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRleHQgcGF0aCBvZiB0aGUgY29udmVydGVyLlxuXHQgKi9cblx0Z2V0Q29udGV4dFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5iYXNlQ29udGV4dFBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIGN1cnJlbnQgZGF0YSBtb2RlbCBvYmplY3QgcGF0aC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgZGF0YSBtb2RlbCBvYmplY3QgcGF0aFxuXHQgKi9cblx0Z2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpOiBEYXRhTW9kZWxPYmplY3RQYXRoIHtcblx0XHRyZXR1cm4gdGhpcy50YXJnZXREYXRhTW9kZWxQYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgRW50aXR5Q29udGFpbmVyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBzZXJ2aWNlIEVudGl0eUNvbnRhaW5lclxuXHQgKi9cblx0Z2V0RW50aXR5Q29udGFpbmVyKCk6IEVudGl0eUNvbnRhaW5lciB7XG5cdFx0cmV0dXJuIHRoaXMuY29udmVydGVkVHlwZXMuZW50aXR5Q29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgRW50aXR5VHlwZSBiYXNlZCBvbiB0aGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IEVudGl0eVR5cGUuXG5cdCAqL1xuXHRnZXRFbnRpdHlUeXBlKCk6IEVudGl0eVR5cGUge1xuXHRcdHJldHVybiB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbnRpdHkgdHlwZSBvZiB0aGUgcGFyYW1ldGVyIGluIGNhc2Ugb2YgYSBwYXJhbWV0ZXJpemVkIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBlbnRpdHkgdHlwZSBvZiB0aGUgcGFyYW1ldGVyXG5cdCAqL1xuXHRnZXRQYXJhbWV0ZXJFbnRpdHlUeXBlKCk6IEVudGl0eVR5cGUge1xuXHRcdGNvbnN0IHBhcmFtZXRlckVudGl0eVR5cGUgPSB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGguc3RhcnRpbmdFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0XHRjb25zdCBpc1BhcmFtZXRlcml6ZWQgPSAhIXBhcmFtZXRlckVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUmVzdWx0Q29udGV4dDtcblx0XHRyZXR1cm4gKGlzUGFyYW1ldGVyaXplZCAmJiBwYXJhbWV0ZXJFbnRpdHlUeXBlKSBhcyBFbnRpdHlUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyBhbiBhbm5vdGF0aW9uIGZyb20gYW4gZW50aXR5IHR5cGUgYmFzZWQgb24gYW5ub3RhdGlvbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblBhdGggVGhlIGFubm90YXRpb24gcGF0aCB0byBiZSBldmFsdWF0ZWRcblx0ICogQHJldHVybnMgVGhlIHRhcmdldCBhbm5vdGF0aW9uIHBhdGggYXMgd2VsbCBhcyBhIGNvbnZlcnRlciBjb250ZXh0IHRvIGdvIHdpdGggaXRcblx0ICovXG5cdGdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGFubm90YXRpb25QYXRoOiBzdHJpbmcpOiBSZXNvbHZlZEFubm90YXRpb25Db250ZXh0IHtcblx0XHRpZiAoIWFubm90YXRpb25QYXRoLmluY2x1ZGVzKFwiQFwiKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBOb3QgYW4gYW5ub3RhdGlvbiBwYXRoOiAnJHthbm5vdGF0aW9uUGF0aH0nYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNBYnNvbHV0ZSA9IGFubm90YXRpb25QYXRoLnN0YXJ0c1dpdGgoXCIvXCIpO1xuXHRcdGxldCBwYXRoOiBzdHJpbmc7XG5cblx0XHRpZiAoaXNBYnNvbHV0ZSkge1xuXHRcdFx0Ly8gcGF0aCBjYW4gYmUgdXNlZCBhcy1pc1xuXHRcdFx0cGF0aCA9IGFubm90YXRpb25QYXRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBidWlsZCBhbiBhYnNvbHV0ZSBwYXRoIGJhc2VkIG9uIHRoZSBlbnRpdHkgdHlwZSAodGhpcyBmdW5jdGlvbiB3b3JrcyBvbiB0aGUgdHlwZSEpXG5cdFx0XHRjb25zdCBiYXNlID0gdGhpcy5nZXRDb250ZXh0UGF0aCgpLnNwbGl0KFwiQFwiLCAxKVswXTtcblx0XHRcdHBhdGggPSBiYXNlLmVuZHNXaXRoKFwiL1wiKSA/IGJhc2UgKyBhbm5vdGF0aW9uUGF0aCA6IGAke2Jhc2V9LyR7YW5ub3RhdGlvblBhdGh9YDtcblx0XHR9XG5cblx0XHRjb25zdCB0YXJnZXQ6IFJlc29sdXRpb25UYXJnZXQ8YW55PiA9IHRoaXMucmVzb2x2ZUFic29sdXRlUGF0aChwYXRoKTtcblxuXHRcdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdEZyb21QYXRoKFxuXHRcdFx0eyB0YXJnZXQ6IHRhcmdldC50YXJnZXQsIHZpc2l0ZWRPYmplY3RzOiB0YXJnZXQub2JqZWN0UGF0aCB9LFxuXHRcdFx0dGhpcy5jb252ZXJ0ZWRUeXBlcyxcblx0XHRcdGlzQWJzb2x1dGUgPyB1bmRlZmluZWQgOiB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0YW5ub3RhdGlvbjogdGFyZ2V0LnRhcmdldCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IG5ldyBDb252ZXJ0ZXJDb250ZXh0KFxuXHRcdFx0XHR0aGlzLmNvbnZlcnRlZFR5cGVzLFxuXHRcdFx0XHR0aGlzLm1hbmlmZXN0U2V0dGluZ3MsXG5cdFx0XHRcdHRoaXMuZGlhZ25vc3RpY3MsXG5cdFx0XHRcdHRoaXMubWVyZ2VGbixcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHRcdFx0KVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIHR5cGUgb2YgdGVtcGxhdGUgd2UncmUgd29ya2luZyBvbiAoZS5nLiBMaXN0UmVwb3J0IC8gT2JqZWN0UGFnZSAvIC4uLikuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHRlbnBsYXRlIHR5cGVcblx0ICovXG5cdGdldFRlbXBsYXRlVHlwZSgpOiBUZW1wbGF0ZVR5cGUge1xuXHRcdHJldHVybiB0aGlzLm1hbmlmZXN0V3JhcHBlci5nZXRUZW1wbGF0ZVR5cGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgY29udmVydGVkIHR5cGVzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb252ZXJ0ZWQgdHlwZXNcblx0ICovXG5cdGdldENvbnZlcnRlZFR5cGVzKCk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0ZWRUeXBlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSBhIHJlbGF0aXZlIGFubm90YXRpb24gcGF0aCBiZXR3ZWVuIGFuIGFubm90YXRpb24gcGF0aCBhbmQgYW4gZW50aXR5IHR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uUGF0aFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZVxuXHQgKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgYW5udG90YXRpb24gcGF0aC5cblx0ICovXG5cdGdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvblBhdGg6IHN0cmluZywgZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGFubm90YXRpb25QYXRoLnJlcGxhY2UoZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyYW5zZm9ybSBhbiBlbnRpdHlUeXBlIGJhc2VkIHBhdGggdG8gYW4gZW50aXR5U2V0IGJhc2VkIG9uZSAodWk1IHRlbXBsYXRpbmcgZ2VuZXJhbGx5IGV4cGVjdCBhbiBlbnRpdHlTZXRCYXNlZFBhdGgpLlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblBhdGhcblx0ICogQHJldHVybnMgVGhlIEVudGl0eVNldCBiYXNlZCBhbm5vdGF0aW9uIHBhdGhcblx0ICovXG5cdGdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvblBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCFhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25QYXRoO1xuXHRcdH1cblx0XHRjb25zdCBlbnRpdHlUeXBlRlFOID0gdGhpcy50YXJnZXREYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lO1xuXHRcdGlmIChcblx0XHRcdHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgfHxcblx0XHRcdCgodGhpcy5iYXNlQ29udGV4dFBhdGguc3RhcnRzV2l0aChcIi9cIikgJiYgdGhpcy5iYXNlQ29udGV4dFBhdGgubWF0Y2goL1xcLy9nKSkgfHwgW10pLmxlbmd0aCA+IDFcblx0XHQpIHtcblx0XHRcdGxldCByZXBsYWNlZEFubm90YXRpb25QYXRoID0gYW5ub3RhdGlvblBhdGgucmVwbGFjZShlbnRpdHlUeXBlRlFOLCBcIi9cIik7XG5cdFx0XHRpZiAocmVwbGFjZWRBbm5vdGF0aW9uUGF0aC5sZW5ndGggPiAyICYmIHJlcGxhY2VkQW5ub3RhdGlvblBhdGhbMF0gPT09IFwiL1wiICYmIHJlcGxhY2VkQW5ub3RhdGlvblBhdGhbMV0gPT09IFwiL1wiKSB7XG5cdFx0XHRcdHJlcGxhY2VkQW5ub3RhdGlvblBhdGggPSByZXBsYWNlZEFubm90YXRpb25QYXRoLnN1YnN0cigxKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmJhc2VDb250ZXh0UGF0aCArIChyZXBsYWNlZEFubm90YXRpb25QYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gcmVwbGFjZWRBbm5vdGF0aW9uUGF0aCA6IGAvJHtyZXBsYWNlZEFubm90YXRpb25QYXRofWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gYC8ke2Fubm90YXRpb25QYXRofWA7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSBtYW5pZmVzdCB3cmFwcGVyIGZvciB0aGUgY3VycmVudCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBtYW5pZmVzdCB3cmFwcGVyXG5cdCAqL1xuXHRnZXRNYW5pZmVzdFdyYXBwZXIoKTogTWFuaWZlc3RXcmFwcGVyIHtcblx0XHRyZXR1cm4gdGhpcy5tYW5pZmVzdFdyYXBwZXI7XG5cdH1cblxuXHRnZXREaWFnbm9zdGljcygpOiBJRGlhZ25vc3RpY3Mge1xuXHRcdHJldHVybiB0aGlzLmRpYWdub3N0aWNzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSB0YXJnZXQgZnJvbSBhbiBhYnNvbHV0ZSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB3ZSB3YW50IHRvIGdldCB0aGUgdGFyZ2V0XG5cdCAqIEByZXR1cm5zIFRoZSBhYnNvbHV0ZSBwYXRoXG5cdCAqL1xuXHRyZXNvbHZlQWJzb2x1dGVQYXRoPFQ+KHBhdGg6IHN0cmluZyk6IFJlc29sdXRpb25UYXJnZXQ8VD4ge1xuXHRcdHJldHVybiB0aGlzLmNvbnZlcnRlZFR5cGVzLnJlc29sdmVQYXRoKHBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGEgbmV3IGNvbnZlcnRlciBjb250ZXh0LCBzY29wZWQgZm9yIGEgZGlmZmVyZW50IGNvbnRleHQgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoIFRoZSBwYXRoIHdlIHdhbnQgdG8gb3JjaGVzdHJhdGUgdGhlIGNvbnZlcnRlciBjb250ZXh0IGFyb3VuZFxuXHQgKiBAcmV0dXJucyBUaGUgY29udmVydGVkIGNvbnRleHQgZm9yIHRoZSBzdWIgcGF0aFxuXHQgKi9cblx0Z2V0Q29udmVydGVyQ29udGV4dEZvcjxUPihjb250ZXh0UGF0aDogc3RyaW5nKTogQ29udmVydGVyQ29udGV4dCB7XG5cdFx0Y29uc3QgcmVzb2x2ZWRNZXRhUGF0aDogUmVzb2x1dGlvblRhcmdldDxUPiA9IHRoaXMuY29udmVydGVkVHlwZXMucmVzb2x2ZVBhdGgoY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IHRhcmdldFBhdGggPSBnZXREYXRhTW9kZWxQYXRoRm9yRW50aXR5U2V0KHJlc29sdmVkTWV0YVBhdGgsIHRoaXMuY29udmVydGVkVHlwZXMpO1xuXHRcdHJldHVybiBuZXcgQ29udmVydGVyQ29udGV4dCh0aGlzLmNvbnZlcnRlZFR5cGVzLCB0aGlzLm1hbmlmZXN0U2V0dGluZ3MsIHRoaXMuZGlhZ25vc3RpY3MsIHRoaXMubWVyZ2VGbiwgdGFyZ2V0UGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFsbCBhbm5vdGF0aW9ucyBvZiBhIGdpdmVuIHRlcm0gYW5kIHZvY2FidWxhcnkgb24gYW4gZW50aXR5IHR5cGVcblx0ICogKG9yIG9uIHRoZSBjdXJyZW50IGVudGl0eSB0eXBlIGlmIGVudGl0eVR5cGUgaXNuJ3Qgc3BlY2lmaWVkKS5cblx0ICpcblx0ICogQHBhcmFtIHZvY2FidWxhcnlOYW1lXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uVGVybVxuXHQgKiBAcGFyYW0gW2Fubm90YXRpb25Tb3VyY2VzXVxuXHQgKiBAcmV0dXJucyBBbGwgdGhlIGFubm90YXRpb24gZm9yIGEgc3BlY2lmaWMgdGVybSBhbmQgdm9jYWJ1bGFyeSBmcm9tIGFuIGVudGl0eSB0eXBlXG5cdCAqL1xuXHRnZXRBbm5vdGF0aW9uc0J5VGVybShcblx0XHR2b2NhYnVsYXJ5TmFtZToga2V5b2YgRW50aXR5VHlwZUFubm90YXRpb25zLFxuXHRcdGFubm90YXRpb25UZXJtOiBzdHJpbmcsXG5cdFx0YW5ub3RhdGlvblNvdXJjZXM6IChTZXJ2aWNlT2JqZWN0IHwgdW5kZWZpbmVkKVtdID0gW3RoaXMuZ2V0RW50aXR5VHlwZSgpXVxuXHQpOiBBbm5vdGF0aW9uVGVybTxhbnk+W10ge1xuXHRcdGxldCBvdXRBbm5vdGF0aW9uczogQW5ub3RhdGlvblRlcm08YW55PltdID0gW107XG5cdFx0YW5ub3RhdGlvblNvdXJjZXMuZm9yRWFjaCgoYW5ub3RhdGlvblNvdXJjZSkgPT4ge1xuXHRcdFx0aWYgKGFubm90YXRpb25Tb3VyY2UpIHtcblx0XHRcdFx0Y29uc3QgYW5ub3RhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25UZXJtPGFueT4+ID0gYW5ub3RhdGlvblNvdXJjZT8uYW5ub3RhdGlvbnNbdm9jYWJ1bGFyeU5hbWVdIHx8IHt9O1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRvdXRBbm5vdGF0aW9ucyA9IE9iamVjdC5rZXlzKGFubm90YXRpb25zKVxuXHRcdFx0XHRcdFx0LmZpbHRlcigoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbnNbYW5ub3RhdGlvbl0udGVybSA9PT0gYW5ub3RhdGlvblRlcm0pXG5cdFx0XHRcdFx0XHQucmVkdWNlKChwcmV2aW91c1ZhbHVlOiBBbm5vdGF0aW9uVGVybTxhbnk+W10sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHByZXZpb3VzVmFsdWUucHVzaChhbm5vdGF0aW9uc1trZXldKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHByZXZpb3VzVmFsdWU7XG5cdFx0XHRcdFx0XHR9LCBvdXRBbm5vdGF0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0QW5ub3RhdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSByZWxhdGl2ZSBtb2RlbCBwYXRoIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHQgcGF0aC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHJlbGF0aXZlIG1vZGVsIHBhdGggb3IgdW5kZWZpbmVkIGlmIHRoZSBwYXRoIGlzIG5vdCByZXNvbHZlYWJsZVxuXHQgKi9cblx0Z2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbigpOiBGdW5jdGlvbiB7XG5cdFx0Y29uc3QgdGFyZ2V0RGF0YU1vZGVsUGF0aCA9IHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aDtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcpIHtcblx0XHRcdGNvbnN0IGVuaGFuY2VkUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKHRhcmdldERhdGFNb2RlbFBhdGgsIHNQYXRoKTtcblx0XHRcdHJldHVybiBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGVuaGFuY2VkUGF0aCwgdHJ1ZSk7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGNvbnZlcnRlciBjb250ZXh0IG5lY2Vzc2FyeSBmb3IgYSBtYWNybyBiYXNlZCBvbiBhIG1ldGFtb2RlbCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWxDb250ZXh0XG5cdCAqIEBwYXJhbSBkaWFnbm9zdGljc1xuXHQgKiBAcGFyYW0gbWVyZ2VGblxuXHQgKiBAcGFyYW0gdGFyZ2V0RGF0YU1vZGVsUGF0aFxuXHQgKiBAcGFyYW0gbWFuaWZlc3RTZXR0aW5nc1xuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb252ZXJ0ZXIgY29udGV4dFxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhcblx0XHRzRW50aXR5U2V0TmFtZTogc3RyaW5nLFxuXHRcdG9NZXRhTW9kZWxDb250ZXh0OiBDb250ZXh0IHwgT0RhdGFNZXRhTW9kZWwsXG5cdFx0ZGlhZ25vc3RpY3M6IElEaWFnbm9zdGljcyxcblx0XHRtZXJnZUZuOiBGdW5jdGlvbixcblx0XHR0YXJnZXREYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRcdG1hbmlmZXN0U2V0dGluZ3M6IEJhc2VNYW5pZmVzdFNldHRpbmdzID0ge30gYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3Ncblx0KTogQ29udmVydGVyQ29udGV4dCB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwgPSBvTWV0YU1vZGVsQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNZXRhTW9kZWxcIilcblx0XHRcdD8gKG9NZXRhTW9kZWxDb250ZXh0IGFzIE9EYXRhTWV0YU1vZGVsKVxuXHRcdFx0OiAoKG9NZXRhTW9kZWxDb250ZXh0IGFzIENvbnRleHQpLmdldE1vZGVsKCkgYXMgdW5rbm93biBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0Y29uc3Qgb0NvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKG9NZXRhTW9kZWwpO1xuXHRcdGxldCB0YXJnZXRFbnRpdHlTZXQ6IFNpbmdsZXRvbiB8IEVudGl0eVNldCA9IG9Db252ZXJ0ZWRNZXRhZGF0YS5lbnRpdHlTZXRzLmZpbmQoXG5cdFx0XHQoZW50aXR5U2V0KSA9PiBlbnRpdHlTZXQubmFtZSA9PT0gc0VudGl0eVNldE5hbWVcblx0XHQpIGFzIEVudGl0eVNldDtcblx0XHRpZiAoIXRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0ID0gb0NvbnZlcnRlZE1ldGFkYXRhLnNpbmdsZXRvbnMuZmluZCgoZW50aXR5U2V0KSA9PiBlbnRpdHlTZXQubmFtZSA9PT0gc0VudGl0eVNldE5hbWUpIGFzIFNpbmdsZXRvbjtcblx0XHR9XG5cdFx0aWYgKCF0YXJnZXREYXRhTW9kZWxQYXRoIHx8IHRhcmdldEVudGl0eVNldCAhPT0gdGFyZ2V0RGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldCkge1xuXHRcdFx0dGFyZ2V0RGF0YU1vZGVsUGF0aCA9IHtcblx0XHRcdFx0c3RhcnRpbmdFbnRpdHlTZXQ6IHRhcmdldEVudGl0eVNldCxcblx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdLFxuXHRcdFx0XHR0YXJnZXRFbnRpdHlTZXQ6IHRhcmdldEVudGl0eVNldCxcblx0XHRcdFx0dGFyZ2V0RW50aXR5VHlwZTogdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUsXG5cdFx0XHRcdHRhcmdldE9iamVjdDogdGFyZ2V0RW50aXR5U2V0LFxuXHRcdFx0XHRjb252ZXJ0ZWRUeXBlczogb0NvbnZlcnRlZE1ldGFkYXRhXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IENvbnZlcnRlckNvbnRleHQob0NvbnZlcnRlZE1ldGFkYXRhLCBtYW5pZmVzdFNldHRpbmdzLCBkaWFnbm9zdGljcywgbWVyZ2VGbiwgdGFyZ2V0RGF0YU1vZGVsUGF0aCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29udmVydGVyQ29udGV4dDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQTRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxnQkFBZ0IsR0FBRyxVQUFVQyxlQUE2QyxFQUEwQztJQUN6SCxPQUFPLE9BQU9BLGVBQWUsS0FBSyxRQUFRO0VBQzNDLENBQUM7RUFFRCxNQUFNQyw0QkFBNEIsR0FBRyxVQUNwQ0MsZ0JBQXVDLEVBQ3ZDQyxjQUFpQyxFQUNYO0lBQ3RCLElBQUlDLGFBQW9DO0lBQ3hDLElBQUlDLGdCQUF1QztJQUMzQyxJQUFJQyxpQkFBd0M7SUFDNUMsSUFBSUMsaUJBQXlDO0lBQzdDLElBQUlDLGNBQXdCLEdBQUcsRUFBRTtJQUNq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