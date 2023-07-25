/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/PropertyHelper", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "../templating/DataModelPathHelper"], function (Log, MetaModelConverter, TypeGuards, PropertyHelper, Service, ServiceFactory, DataModelPathHelper) {
  "use strict";

  var _exports = {};
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getTargetNavigationPath = DataModelPathHelper.getTargetNavigationPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var isProperty = TypeGuards.isProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isComplexType = TypeGuards.isComplexType;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertTypes = MetaModelConverter.convertTypes;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let SideEffectsService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(SideEffectsService, _Service);
    function SideEffectsService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.SideEffectsService = SideEffectsService;
    var _proto = SideEffectsService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      this.sideEffectsRegistry = {
        oData: {
          entities: {},
          actions: {}
        },
        control: {}
      };
      this.isInitialized = false;
      this.initPromise = Promise.resolve(this);
    }

    /**
     * Adds a SideEffects control
     * SideEffects definition is added by a control to keep data up to date
     * These SideEffects get limited scope compared with SideEffects coming from an OData service:
     * - Only one SideEffects definition can be defined for the combination entity type - control Id
     * - Only SideEffects source properties are recognized and used to trigger SideEffects
     *
     * Ensure the sourceControlId matches the associated SAPUI5 control ID.
     *
     * @ui5-restricted
     * @param entityType Name of the entity type
     * @param sideEffect SideEffects definition
     */;
    _proto.addControlSideEffects = function addControlSideEffects(entityType, sideEffect) {
      if (sideEffect.sourceControlId) {
        const controlSideEffect = {
          ...sideEffect,
          fullyQualifiedName: `${entityType}/SideEffectsForControl/${sideEffect.sourceControlId}`
        };
        const entityControlSideEffects = this.sideEffectsRegistry.control[entityType] || {};
        entityControlSideEffects[controlSideEffect.sourceControlId] = controlSideEffect;
        this.sideEffectsRegistry.control[entityType] = entityControlSideEffects;
      }
    }

    /**
     * Executes SideEffects action.
     *
     * @ui5-restricted
     * @param triggerAction Name of the action
     * @param context Context
     * @param groupId The group ID to be used for the request
     * @returns A promise that is resolved without data or with a return value context when the action call succeeded
     */;
    _proto.executeAction = function executeAction(triggerAction, context, groupId) {
      const action = context.getModel().bindContext(`${triggerAction}(...)`, context);
      return action.execute(groupId || context.getBinding().getUpdateGroupId());
    }

    /**
     * Gets converted OData metaModel.
     *
     * @ui5-restricted
     * @returns Converted OData metaModel
     */;
    _proto.getConvertedMetaModel = function getConvertedMetaModel() {
      return convertTypes(this.getMetaModel(), this.capabilities);
    }

    /**
     * Gets the entity type of a context.
     *
     * @param context Context
     * @returns Entity Type
     */;
    _proto.getEntityTypeFromContext = function getEntityTypeFromContext(context) {
      const metaModel = context.getModel().getMetaModel(),
        metaPath = metaModel.getMetaPath(context.getPath()),
        entityType = metaModel.getObject(metaPath)["$Type"];
      return entityType;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param entityTypeName Name of the entity type
     * @returns SideEffects dictionary
     */;
    _proto.getODataEntitySideEffects = function getODataEntitySideEffects(entityTypeName) {
      return this.sideEffectsRegistry.oData.entities[entityTypeName] || {};
    }

    /**
     * Gets the global SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param entityTypeName Name of the entity type
     * @returns Global SideEffects
     */;
    _proto.getGlobalODataEntitySideEffects = function getGlobalODataEntitySideEffects(entityTypeName) {
      const entitySideEffects = this.getODataEntitySideEffects(entityTypeName);
      const globalSideEffects = [];
      for (const key in entitySideEffects) {
        const sideEffects = entitySideEffects[key];
        if (!sideEffects.sourceEntities && !sideEffects.sourceProperties) {
          globalSideEffects.push(sideEffects);
        }
      }
      return globalSideEffects;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @ui5-restricted
     * @param actionName Name of the action
     * @param context Context
     * @returns SideEffects definition
     */;
    _proto.getODataActionSideEffects = function getODataActionSideEffects(actionName, context) {
      if (context) {
        const entityType = this.getEntityTypeFromContext(context);
        if (entityType) {
          var _this$sideEffectsRegi;
          return (_this$sideEffectsRegi = this.sideEffectsRegistry.oData.actions[entityType]) === null || _this$sideEffectsRegi === void 0 ? void 0 : _this$sideEffectsRegi[actionName];
        }
      }
      return undefined;
    }

    /**
     * Generates the dictionary for the SideEffects.
     *
     * @ui5-restricted
     * @param capabilities The current capabilities
     */;
    _proto.initializeSideEffects = function initializeSideEffects(capabilities) {
      this.capabilities = capabilities;
      if (!this.isInitialized) {
        const sideEffectSources = {
          entities: {},
          properties: {}
        };
        const convertedMetaModel = this.getConvertedMetaModel();
        convertedMetaModel.entityTypes.forEach(entityType => {
          this.sideEffectsRegistry.oData.entities[entityType.fullyQualifiedName] = this.retrieveODataEntitySideEffects(entityType);
          this.sideEffectsRegistry.oData.actions[entityType.fullyQualifiedName] = this.retrieveODataActionsSideEffects(entityType); // only bound actions are analyzed since unbound ones don't get SideEffects
          this.mapSideEffectSources(entityType, sideEffectSources);
        });
        this.sourcesToSideEffectMappings = sideEffectSources;
        this.isInitialized = true;
      }
    }

    /**
     * Removes all SideEffects related to a control.
     *
     * @ui5-restricted
     * @param controlId Control Id
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(controlId) {
      Object.keys(this.sideEffectsRegistry.control).forEach(sEntityType => {
        if (this.sideEffectsRegistry.control[sEntityType][controlId]) {
          delete this.sideEffectsRegistry.control[sEntityType][controlId];
        }
      });
    }

    /**
     * Requests the SideEffects on a specific context.
     *
     * @param pathExpressions Targets of SideEffects to be executed
     * @param context Context where SideEffects need to be executed
     * @param groupId The group ID to be used for the request
     * @returns Promise on SideEffects request
     */;
    _proto.requestSideEffects = function requestSideEffects(pathExpressions, context, groupId) {
      this.logRequest(pathExpressions, context);
      return context.requestSideEffects(pathExpressions, groupId);
    }

    /**
     * Requests the SideEffects for an OData action.
     *
     * @param sideEffects SideEffects definition
     * @param context Context where SideEffects need to be executed
     * @returns Promise on SideEffects requests and action execution
     */;
    _proto.requestSideEffectsForODataAction = function requestSideEffectsForODataAction(sideEffects, context) {
      var _sideEffects$triggerA, _sideEffects$pathExpr;
      let promises;
      if ((_sideEffects$triggerA = sideEffects.triggerActions) !== null && _sideEffects$triggerA !== void 0 && _sideEffects$triggerA.length) {
        promises = sideEffects.triggerActions.map(actionName => {
          return this.executeAction(actionName, context);
        });
      } else {
        promises = [];
      }
      if ((_sideEffects$pathExpr = sideEffects.pathExpressions) !== null && _sideEffects$pathExpr !== void 0 && _sideEffects$pathExpr.length) {
        promises.push(this.requestSideEffects(sideEffects.pathExpressions, context));
      }
      return promises.length ? Promise.all(promises) : Promise.resolve([]);
    }

    /**
     * Requests the SideEffects for a navigation property on a specific context.
     *
     * @function
     * @param navigationProperty Navigation property
     * @param context Context where SideEffects need to be executed
     * @param groupId Batch group for the query
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffectsForNavigationProperty = function requestSideEffectsForNavigationProperty(navigationProperty, context, groupId) {
      const baseEntityType = this.getEntityTypeFromContext(context);
      if (baseEntityType) {
        const navigationPath = `${navigationProperty}/`;
        const entitySideEffects = this.getODataEntitySideEffects(baseEntityType);
        let targetProperties = [];
        let targetEntities = [];
        let sideEffectsTargets = [];
        Object.keys(entitySideEffects).filter(
        // Keep relevant SideEffects
        annotationName => {
          const sideEffects = entitySideEffects[annotationName];
          return (sideEffects.sourceProperties || []).some(propertyPath => propertyPath.startsWith(navigationPath) && propertyPath.replace(navigationPath, "").indexOf("/") === -1) || (sideEffects.sourceEntities || []).some(navigation => navigation.$NavigationPropertyPath === navigationProperty);
        }).forEach(sAnnotationName => {
          const sideEffects = entitySideEffects[sAnnotationName];
          if (sideEffects.triggerAction) {
            this.executeAction(sideEffects.triggerAction, context, groupId);
          }
          targetProperties = targetProperties.concat(sideEffects.targetProperties);
          targetEntities = targetEntities.concat(sideEffects.targetEntities);
        });
        // Remove duplicate targets
        const sideEffectsTargetDefinition = this.removeDuplicateTargets({
          targetProperties: targetProperties,
          targetEntities: targetEntities
        });
        sideEffectsTargets = [...sideEffectsTargetDefinition.targetProperties, ...sideEffectsTargetDefinition.targetEntities];
        if (sideEffectsTargets.length) {
          return this.requestSideEffects(sideEffectsTargets, context, groupId).catch(error => Log.error(`SideEffects - Error while processing SideEffects for Navigation Property ${navigationProperty}`, error));
        }
      }
      return Promise.resolve();
    }

    /**
     * Gets the SideEffects that come from controls.
     *
     * @ui5-restricted
     * @param entityTypeName Entity type Name
     * @returns SideEffects dictionary
     */;
    _proto.getControlEntitySideEffects = function getControlEntitySideEffects(entityTypeName) {
      return this.sideEffectsRegistry.control[entityTypeName] || {};
    }

    /**
     * Gets SideEffects' qualifier and owner entity where this entity is used as source.
     *
     * @param entityTypeName Entity type fully qualified name
     * @returns Array of sideEffects info
     */;
    _proto.getSideEffectWhereEntityIsSource = function getSideEffectWhereEntityIsSource(entityTypeName) {
      return this.sourcesToSideEffectMappings.entities[entityTypeName] || [];
    }

    /**
     * Common method to get the field groupIds for a source entity and a source property.
     *
     * @param sourceEntityType
     * @param sourceProperty
     * @returns A collection of fieldGroupIds
     */;
    _proto.computeFieldGroupIds = function computeFieldGroupIds(sourceEntityType, sourceProperty) {
      const entityFieldGroupIds = this.getSideEffectWhereEntityIsSource(sourceEntityType).map(sideEffectInfo => this.getFieldGroupIdForSideEffect(sideEffectInfo, true));
      return entityFieldGroupIds.concat(this.getSideEffectWherePropertyIsSource(sourceProperty).map(sideEffectInfo => this.getFieldGroupIdForSideEffect(sideEffectInfo)));
    }

    /**
     * Gets SideEffects' qualifier and owner entity where this property is used as source.
     *
     * @param propertyName Property fully qualified name
     * @returns Array of sideEffects info
     */;
    _proto.getSideEffectWherePropertyIsSource = function getSideEffectWherePropertyIsSource(propertyName) {
      return this.sourcesToSideEffectMappings.properties[propertyName] || [];
    }

    /**
     * Adds the text properties required for SideEffects
     * If a property has an associated text then this text needs to be added as targetProperties.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @param entityType Entity type
     * @returns SideEffects definition with added text properties
     */;
    _proto.addTextProperties = function addTextProperties(sideEffectsTargets, entityType) {
      const setOfProperties = new Set(sideEffectsTargets.targetProperties);
      const setOfEntities = new Set(sideEffectsTargets.targetEntities.map(target => target.$NavigationPropertyPath));

      // Generate all dataModelPath for the properties to analyze (cover "*" and /*)
      const propertiesToAnalyze = sideEffectsTargets.targetProperties.reduce((dataModelPropertyPaths, propertyPath) => {
        return dataModelPropertyPaths.concat(this.getDataModelPropertiesFromAPath(propertyPath, entityType));
      }, []);

      // Generate all paths related to the text properties and not already covered by the SideEffects
      for (const dataModelPropertyPath of propertiesToAnalyze) {
        const associatedTextPath = getAssociatedTextPropertyPath(dataModelPropertyPath.targetObject);
        if (associatedTextPath) {
          const dataModelTextPath = enhanceDataModelPath(dataModelPropertyPath, associatedTextPath);
          const relativeNavigation = getTargetNavigationPath(dataModelTextPath, true);
          const targetPath = getTargetObjectPath(dataModelTextPath, true);
          if (isProperty(dataModelTextPath.targetObject) && !setOfProperties.has(targetPath) &&
          // the property is already listed
          !setOfProperties.has(`${relativeNavigation}${dataModelTextPath.navigationProperties.length ? "/" : ""}*`) &&
          // the property is already listed thanks to the "*"
          !setOfEntities.has(`${relativeNavigation}`) // the property is not part of a TargetEntities
          ) {
            // The Text association is added as TargetEntities if
            //  - it's contained on a different entitySet than the SideEffects
            //  -  and it's contained on a different entitySet than the sourced property
            // Otherwise it's added as targetProperties
            if (dataModelPropertyPath.targetEntitySet !== dataModelTextPath.targetEntitySet && dataModelTextPath.navigationProperties && dataModelTextPath.targetEntityType) {
              setOfEntities.add(relativeNavigation);
            } else {
              setOfProperties.add(targetPath);
            }
          }
        }
      }
      return {
        targetProperties: Array.from(setOfProperties),
        targetEntities: Array.from(setOfEntities).map(navigation => {
          return {
            $NavigationPropertyPath: navigation
          };
        })
      };
    }

    /**
     * Converts the SideEffects to expected format
     *  - Set TriggerAction as string
     *  - Converts SideEffects targets to expected format
     *  - Removes binding parameter from SideEffects targets properties
     *  - Adds the text properties
     *  - Replaces TargetProperties having reference to Source Properties for a SideEffects.
     *
     * @ui5-restricted
     * @param sideEffects SideEffects definition
     * @param entityType Entity type
     * @param bindingParameter Name of the binding parameter
     * @returns SideEffects definition
     */;
    _proto.convertSideEffects = function convertSideEffects(sideEffects, entityType, bindingParameter) {
      const triggerAction = sideEffects.TriggerAction;
      const newSideEffects = this.convertSideEffectsFormat(sideEffects);
      let sideEffectsTargets = {
        targetProperties: newSideEffects.targetProperties,
        targetEntities: newSideEffects.targetEntities
      };
      sideEffectsTargets = this.removeBindingParameter(sideEffectsTargets, bindingParameter);
      sideEffectsTargets = this.addTextProperties(sideEffectsTargets, entityType);
      sideEffectsTargets = this.removeDuplicateTargets(sideEffectsTargets);
      return {
        ...newSideEffects,
        ...{
          targetEntities: sideEffectsTargets.targetEntities,
          targetProperties: sideEffectsTargets.targetProperties,
          triggerAction
        }
      };
    }

    /**
     * Converts the SideEffects targets (TargetEntities and TargetProperties) to expected format
     *  - TargetProperties as array of string
     *  - TargetEntities as array of object with property $NavigationPropertyPath.
     *
     * @ui5-restricted
     * @param sideEffects SideEffects definition
     * @returns Converted SideEffects
     */;
    _proto.convertSideEffectsFormat = function convertSideEffectsFormat(sideEffects) {
      const formatProperties = properties => {
        return properties ? properties.reduce((targetProperties, target) => {
          const path = target.type && target.value || target;
          if (path) {
            targetProperties.push(path);
          } else {
            Log.error(`SideEffects - Error while processing TargetProperties for SideEffects ${sideEffects.fullyQualifiedName}`);
          }
          return targetProperties;
        }, []) : properties;
      };
      const formatEntities = entities => {
        return entities ? entities.map(targetEntity => {
          return {
            $NavigationPropertyPath: targetEntity.value
          };
        }) : entities;
      };
      return {
        fullyQualifiedName: sideEffects.fullyQualifiedName,
        sourceProperties: formatProperties(sideEffects.SourceProperties),
        sourceEntities: formatEntities(sideEffects.SourceEntities),
        targetProperties: formatProperties(sideEffects.TargetProperties) ?? [],
        targetEntities: formatEntities(sideEffects.TargetEntities) ?? []
      };
    }

    /**
     * Gets all dataModelObjectPath related to properties listed by a path
     *
     * The path can be:
     *  - a path targeting a property on a complexType or an EntityType
     *  - a path with a star targeting all properties on a complexType or an EntityType.
     *
     * @ui5-restricted
     * @param path The path to analyze
     * @param entityType Entity type
     * @returns Array of dataModelObjectPath representing the properties
     */;
    _proto.getDataModelPropertiesFromAPath = function getDataModelPropertiesFromAPath(path, entityType) {
      let dataModelObjectPaths = [];
      const convertedMetaModel = this.getConvertedMetaModel();
      const entitySet = convertedMetaModel.entitySets.find(relatedEntitySet => relatedEntitySet.entityType === entityType) || convertedMetaModel.singletons.find(singleton => singleton.entityType === entityType);
      if (entitySet) {
        const metaModel = this.getMetaModel(),
          entitySetContext = metaModel.createBindingContext(`/${entitySet.name}`);
        if (entitySetContext) {
          const dataModelEntitySet = getInvolvedDataModelObjects(entitySetContext);
          const dataModelObjectPath = enhanceDataModelPath(dataModelEntitySet, path.replace("*", "") || "/"),
            // "*" is replaced by "/" to target the current EntityType
            targetObject = dataModelObjectPath.targetObject;
          if (isProperty(targetObject)) {
            if (isComplexType(targetObject.targetType)) {
              dataModelObjectPaths = dataModelObjectPaths.concat(targetObject.targetType.properties.map(property => enhanceDataModelPath(dataModelObjectPath, property.name)));
            } else {
              dataModelObjectPaths.push(dataModelObjectPath);
            }
          } else if (isEntityType(targetObject)) {
            dataModelObjectPaths = dataModelObjectPaths.concat(dataModelObjectPath.targetEntityType.entityProperties.map(entityProperty => {
              return enhanceDataModelPath(dataModelObjectPath, entityProperty.name);
            }));
          }
          entitySetContext.destroy();
        }
      }
      return dataModelObjectPaths.filter(dataModelObjectPath => dataModelObjectPath.targetObject);
    }

    /**
     * Gets the Odata metamodel.
     *
     * @ui5-restricted
     * @returns The OData metamodel
     */;
    _proto.getMetaModel = function getMetaModel() {
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      return oComponent.getModel().getMetaModel();
    }

    /**
     * Gets the SideEffects related to an entity type or action that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action
     * and to convert these SideEffects with expected format.
     *
     * @ui5-restricted
     * @param source Entity type or action
     * @returns Array of SideEffects
     */;
    _proto.getSideEffectsFromSource = function getSideEffectsFromSource(source) {
      var _source$annotations;
      let bindingAlias = "";
      const isSourceEntityType = isEntityType(source);
      const entityType = isSourceEntityType ? source : source.sourceEntityType;
      const commonAnnotation = (_source$annotations = source.annotations) === null || _source$annotations === void 0 ? void 0 : _source$annotations.Common;
      if (entityType && commonAnnotation) {
        if (!isSourceEntityType) {
          var _source$parameters;
          const bindingParameter = (_source$parameters = source.parameters) === null || _source$parameters === void 0 ? void 0 : _source$parameters.find(parameter => parameter.type === entityType.fullyQualifiedName);
          bindingAlias = (bindingParameter === null || bindingParameter === void 0 ? void 0 : bindingParameter.fullyQualifiedName.split("/")[1]) ?? "";
        }
        return this.getSideEffectsAnnotationFromSource(source).map(sideEffectAnno => this.convertSideEffects(sideEffectAnno, entityType, bindingAlias));
      }
      return [];
    }
    /**
     * Gets the SideEffects related to an entity type or action that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action.
     *
     * @param source Entity type or action
     * @returns Array of SideEffects
     */;
    _proto.getSideEffectsAnnotationFromSource = function getSideEffectsAnnotationFromSource(source) {
      var _source$annotations2;
      const sideEffects = [];
      const commonAnnotation = (_source$annotations2 = source.annotations) === null || _source$annotations2 === void 0 ? void 0 : _source$annotations2.Common;
      for (const key in commonAnnotation) {
        const annotation = commonAnnotation[key];
        if (this.isSideEffectsAnnotation(annotation)) {
          sideEffects.push(annotation);
        }
      }
      return sideEffects;
    }

    /**
     * Checks if the annotation is a SideEffects annotation.
     *
     * @ui5-restricted
     * @param annotation Annotation
     * @returns Boolean
     */;
    _proto.isSideEffectsAnnotation = function isSideEffectsAnnotation(annotation) {
      return (annotation === null || annotation === void 0 ? void 0 : annotation.$Type) === "com.sap.vocabularies.Common.v1.SideEffectsType";
    }

    /**
     * Logs the SideEffects request.
     *
     * @ui5-restricted
     * @param pathExpressions SideEffects targets
     * @param context Context
     */;
    _proto.logRequest = function logRequest(pathExpressions, context) {
      const targetPaths = pathExpressions.reduce(function (paths, target) {
        return `${paths}\n\t\t${target.$NavigationPropertyPath || target || ""}`;
      }, "");
      Log.debug(`SideEffects - Request:\n\tContext path : ${context.getPath()}\n\tProperty paths :${targetPaths}`);
    }

    /**
     * Removes the name of the binding parameter on the SideEffects targets.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @param bindingParameterName Name of binding parameter
     * @returns SideEffects definition
     */;
    _proto.removeBindingParameter = function removeBindingParameter(sideEffectsTargets, bindingParameterName) {
      if (bindingParameterName) {
        const replaceBindingParameter = function (value) {
          return value.replace(new RegExp(`^${bindingParameterName}/?`), "");
        };
        return {
          targetProperties: sideEffectsTargets.targetProperties.map(targetProperty => replaceBindingParameter(targetProperty)),
          targetEntities: sideEffectsTargets.targetEntities.map(targetEntity => {
            return {
              $NavigationPropertyPath: replaceBindingParameter(targetEntity.$NavigationPropertyPath)
            };
          })
        };
      }
      return {
        targetProperties: sideEffectsTargets.targetProperties,
        targetEntities: sideEffectsTargets.targetEntities
      };
    }

    /**
     * Remove duplicates in SideEffects targets.
     *
     * @ui5-restricted
     * @param sideEffectsTargets SideEffects Targets
     * @returns SideEffects targets without duplicates
     */;
    _proto.removeDuplicateTargets = function removeDuplicateTargets(sideEffectsTargets) {
      const targetEntitiesPaths = sideEffectsTargets.targetEntities.map(targetEntity => targetEntity.$NavigationPropertyPath);
      const uniqueTargetedEntitiesPath = new Set(targetEntitiesPaths);
      const uniqueTargetProperties = new Set(sideEffectsTargets.targetProperties);
      const uniqueTargetedEntities = Array.from(uniqueTargetedEntitiesPath).map(entityPath => {
        return {
          $NavigationPropertyPath: entityPath
        };
      });
      return {
        targetProperties: Array.from(uniqueTargetProperties),
        targetEntities: uniqueTargetedEntities
      };
    }

    /**
     * Gets SideEffects action type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects on actions
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @ui5-restricted
     * @param entityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto.retrieveODataActionsSideEffects = function retrieveODataActionsSideEffects(entityType) {
      const sideEffects = {};
      const actions = entityType.actions;
      if (actions) {
        Object.keys(actions).forEach(actionName => {
          const action = entityType.actions[actionName];
          const triggerActions = new Set();
          let targetProperties = [];
          let targetEntities = [];
          this.getSideEffectsFromSource(action).forEach(oDataSideEffect => {
            const triggerAction = oDataSideEffect.triggerAction;
            targetProperties = targetProperties.concat(oDataSideEffect.targetProperties);
            targetEntities = targetEntities.concat(oDataSideEffect.targetEntities);
            if (triggerAction) {
              triggerActions.add(triggerAction);
            }
          });
          const sideEffectsTargets = this.removeDuplicateTargets({
            targetProperties,
            targetEntities
          });
          sideEffects[actionName] = {
            pathExpressions: [...sideEffectsTargets.targetProperties, ...sideEffectsTargets.targetEntities],
            triggerActions: Array.from(triggerActions)
          };
        });
      }
      return sideEffects;
    }

    /**
     * Gets SideEffects entity type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @ui5-restricted
     * @param entityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto.retrieveODataEntitySideEffects = function retrieveODataEntitySideEffects(entityType) {
      const entitySideEffects = {};
      this.getSideEffectsFromSource(entityType).forEach(sideEffects => {
        entitySideEffects[sideEffects.fullyQualifiedName] = sideEffects;
      });
      return entitySideEffects;
    }

    /**
     * Defines a map for the Sources of sideEffect on the entity to track where those sources are used in SideEffects annotation.
     *
     * @param entityType The entityType we look for side Effects annotation
     * @param sideEffectsSources The mapping object in construction
     * @param sideEffectsSources.entities
     * @param sideEffectsSources.properties
     */;
    _proto.mapSideEffectSources = function mapSideEffectSources(entityType, sideEffectsSources) {
      for (const sideEffectDefinition of this.getSideEffectsAnnotationFromSource(entityType)) {
        var _sideEffectDefinition;
        for (const sourceEntity of sideEffectDefinition.SourceEntities ?? []) {
          var _sourceEntity$$target;
          const targetEntityType = sourceEntity.value ? (_sourceEntity$$target = sourceEntity.$target) === null || _sourceEntity$$target === void 0 ? void 0 : _sourceEntity$$target.targetType : entityType;
          if (targetEntityType) {
            if (!sideEffectsSources.entities[targetEntityType.fullyQualifiedName]) {
              sideEffectsSources.entities[targetEntityType.fullyQualifiedName] = [];
            }
            sideEffectsSources.entities[targetEntityType.fullyQualifiedName].push({
              entity: entityType.fullyQualifiedName,
              qualifier: sideEffectDefinition.qualifier
            });
          }
        }
        const hasUniqueSourceProperty = ((_sideEffectDefinition = sideEffectDefinition.SourceProperties) === null || _sideEffectDefinition === void 0 ? void 0 : _sideEffectDefinition.length) === 1;
        for (const sourceProperty of sideEffectDefinition.SourceProperties ?? []) {
          var _sourceProperty$$targ, _sourceProperty$$targ3;
          if (!sideEffectsSources.properties[(_sourceProperty$$targ = sourceProperty.$target) === null || _sourceProperty$$targ === void 0 ? void 0 : _sourceProperty$$targ.fullyQualifiedName]) {
            var _sourceProperty$$targ2;
            sideEffectsSources.properties[(_sourceProperty$$targ2 = sourceProperty.$target) === null || _sourceProperty$$targ2 === void 0 ? void 0 : _sourceProperty$$targ2.fullyQualifiedName] = [];
          }
          sideEffectsSources.properties[(_sourceProperty$$targ3 = sourceProperty.$target) === null || _sourceProperty$$targ3 === void 0 ? void 0 : _sourceProperty$$targ3.fullyQualifiedName].push({
            entity: entityType.fullyQualifiedName,
            qualifier: sideEffectDefinition.qualifier,
            hasUniqueSourceProperty
          });
        }
      }
    }

    /**
     * Get the fieldGroupId based on the stored information on th side effect.
     *
     * @param sideEffectInfo
     * @param isImmediate
     * @returns A string for the fieldGroupId.
     */;
    _proto.getFieldGroupIdForSideEffect = function getFieldGroupIdForSideEffect(sideEffectInfo) {
      let isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      const sideEffectWithQualifier = sideEffectInfo.qualifier ? `${sideEffectInfo.entity}#${sideEffectInfo.qualifier}` : sideEffectInfo.entity;
      return isImmediate || sideEffectInfo.hasUniqueSourceProperty === true ? `${sideEffectWithQualifier}$$ImmediateRequest` : sideEffectWithQualifier;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return SideEffectsService;
  }(Service);
  _exports.SideEffectsService = SideEffectsService;
  let SideEffectsServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(SideEffectsServiceFactory, _ServiceFactory);
    function SideEffectsServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = SideEffectsServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const SideEffectsServiceService = new SideEffectsService(oServiceContext);
      return SideEffectsServiceService.initPromise;
    };
    return SideEffectsServiceFactory;
  }(ServiceFactory);
  return SideEffectsServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaWRlRWZmZWN0c1NlcnZpY2UiLCJpbml0Iiwic2lkZUVmZmVjdHNSZWdpc3RyeSIsIm9EYXRhIiwiZW50aXRpZXMiLCJhY3Rpb25zIiwiY29udHJvbCIsImlzSW5pdGlhbGl6ZWQiLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWRkQ29udHJvbFNpZGVFZmZlY3RzIiwiZW50aXR5VHlwZSIsInNpZGVFZmZlY3QiLCJzb3VyY2VDb250cm9sSWQiLCJjb250cm9sU2lkZUVmZmVjdCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImVudGl0eUNvbnRyb2xTaWRlRWZmZWN0cyIsImV4ZWN1dGVBY3Rpb24iLCJ0cmlnZ2VyQWN0aW9uIiwiY29udGV4dCIsImdyb3VwSWQiLCJhY3Rpb24iLCJnZXRNb2RlbCIsImJpbmRDb250ZXh0IiwiZXhlY3V0ZSIsImdldEJpbmRpbmciLCJnZXRVcGRhdGVHcm91cElkIiwiZ2V0Q29udmVydGVkTWV0YU1vZGVsIiwiY29udmVydFR5cGVzIiwiZ2V0TWV0YU1vZGVsIiwiY2FwYWJpbGl0aWVzIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwibWV0YU1vZGVsIiwibWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJnZXRPYmplY3QiLCJnZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiZW50aXR5VHlwZU5hbWUiLCJnZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiZW50aXR5U2lkZUVmZmVjdHMiLCJnbG9iYWxTaWRlRWZmZWN0cyIsImtleSIsInNpZGVFZmZlY3RzIiwic291cmNlRW50aXRpZXMiLCJzb3VyY2VQcm9wZXJ0aWVzIiwicHVzaCIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJhY3Rpb25OYW1lIiwidW5kZWZpbmVkIiwiaW5pdGlhbGl6ZVNpZGVFZmZlY3RzIiwic2lkZUVmZmVjdFNvdXJjZXMiLCJwcm9wZXJ0aWVzIiwiY29udmVydGVkTWV0YU1vZGVsIiwiZW50aXR5VHlwZXMiLCJmb3JFYWNoIiwicmV0cmlldmVPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwicmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyIsIm1hcFNpZGVFZmZlY3RTb3VyY2VzIiwic291cmNlc1RvU2lkZUVmZmVjdE1hcHBpbmdzIiwicmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzIiwiY29udHJvbElkIiwiT2JqZWN0Iiwia2V5cyIsInNFbnRpdHlUeXBlIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwicGF0aEV4cHJlc3Npb25zIiwibG9nUmVxdWVzdCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uIiwicHJvbWlzZXMiLCJ0cmlnZ2VyQWN0aW9ucyIsImxlbmd0aCIsIm1hcCIsImFsbCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsImJhc2VFbnRpdHlUeXBlIiwibmF2aWdhdGlvblBhdGgiLCJ0YXJnZXRQcm9wZXJ0aWVzIiwidGFyZ2V0RW50aXRpZXMiLCJzaWRlRWZmZWN0c1RhcmdldHMiLCJmaWx0ZXIiLCJhbm5vdGF0aW9uTmFtZSIsInNvbWUiLCJwcm9wZXJ0eVBhdGgiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsImluZGV4T2YiLCJuYXZpZ2F0aW9uIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzQW5ub3RhdGlvbk5hbWUiLCJjb25jYXQiLCJzaWRlRWZmZWN0c1RhcmdldERlZmluaXRpb24iLCJyZW1vdmVEdXBsaWNhdGVUYXJnZXRzIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsImdldENvbnRyb2xFbnRpdHlTaWRlRWZmZWN0cyIsImdldFNpZGVFZmZlY3RXaGVyZUVudGl0eUlzU291cmNlIiwiY29tcHV0ZUZpZWxkR3JvdXBJZHMiLCJzb3VyY2VFbnRpdHlUeXBlIiwic291cmNlUHJvcGVydHkiLCJlbnRpdHlGaWVsZEdyb3VwSWRzIiwic2lkZUVmZmVjdEluZm8iLCJnZXRGaWVsZEdyb3VwSWRGb3JTaWRlRWZmZWN0IiwiZ2V0U2lkZUVmZmVjdFdoZXJlUHJvcGVydHlJc1NvdXJjZSIsInByb3BlcnR5TmFtZSIsImFkZFRleHRQcm9wZXJ0aWVzIiwic2V0T2ZQcm9wZXJ0aWVzIiwiU2V0Iiwic2V0T2ZFbnRpdGllcyIsInRhcmdldCIsInByb3BlcnRpZXNUb0FuYWx5emUiLCJyZWR1Y2UiLCJkYXRhTW9kZWxQcm9wZXJ0eVBhdGhzIiwiZ2V0RGF0YU1vZGVsUHJvcGVydGllc0Zyb21BUGF0aCIsImRhdGFNb2RlbFByb3BlcnR5UGF0aCIsImFzc29jaWF0ZWRUZXh0UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwidGFyZ2V0T2JqZWN0IiwiZGF0YU1vZGVsVGV4dFBhdGgiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsInJlbGF0aXZlTmF2aWdhdGlvbiIsImdldFRhcmdldE5hdmlnYXRpb25QYXRoIiwidGFyZ2V0UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJpc1Byb3BlcnR5IiwiaGFzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJ0YXJnZXRFbnRpdHlTZXQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiYWRkIiwiQXJyYXkiLCJmcm9tIiwiY29udmVydFNpZGVFZmZlY3RzIiwiYmluZGluZ1BhcmFtZXRlciIsIlRyaWdnZXJBY3Rpb24iLCJuZXdTaWRlRWZmZWN0cyIsImNvbnZlcnRTaWRlRWZmZWN0c0Zvcm1hdCIsInJlbW92ZUJpbmRpbmdQYXJhbWV0ZXIiLCJmb3JtYXRQcm9wZXJ0aWVzIiwicGF0aCIsInR5cGUiLCJ2YWx1ZSIsImZvcm1hdEVudGl0aWVzIiwidGFyZ2V0RW50aXR5IiwiU291cmNlUHJvcGVydGllcyIsIlNvdXJjZUVudGl0aWVzIiwiVGFyZ2V0UHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwiZGF0YU1vZGVsT2JqZWN0UGF0aHMiLCJlbnRpdHlTZXQiLCJlbnRpdHlTZXRzIiwiZmluZCIsInJlbGF0ZWRFbnRpdHlTZXQiLCJzaW5nbGV0b25zIiwic2luZ2xldG9uIiwiZW50aXR5U2V0Q29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibmFtZSIsImRhdGFNb2RlbEVudGl0eVNldCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJpc0NvbXBsZXhUeXBlIiwidGFyZ2V0VHlwZSIsInByb3BlcnR5IiwiaXNFbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsImVudGl0eVByb3BlcnR5IiwiZGVzdHJveSIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsImdldFNpZGVFZmZlY3RzRnJvbVNvdXJjZSIsInNvdXJjZSIsImJpbmRpbmdBbGlhcyIsImlzU291cmNlRW50aXR5VHlwZSIsImNvbW1vbkFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCJzcGxpdCIsImdldFNpZGVFZmZlY3RzQW5ub3RhdGlvbkZyb21Tb3VyY2UiLCJzaWRlRWZmZWN0QW5ubyIsImFubm90YXRpb24iLCJpc1NpZGVFZmZlY3RzQW5ub3RhdGlvbiIsIiRUeXBlIiwidGFyZ2V0UGF0aHMiLCJwYXRocyIsImRlYnVnIiwiYmluZGluZ1BhcmFtZXRlck5hbWUiLCJyZXBsYWNlQmluZGluZ1BhcmFtZXRlciIsIlJlZ0V4cCIsInRhcmdldFByb3BlcnR5IiwidGFyZ2V0RW50aXRpZXNQYXRocyIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXNQYXRoIiwidW5pcXVlVGFyZ2V0UHJvcGVydGllcyIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXMiLCJlbnRpdHlQYXRoIiwib0RhdGFTaWRlRWZmZWN0Iiwic2lkZUVmZmVjdHNTb3VyY2VzIiwic2lkZUVmZmVjdERlZmluaXRpb24iLCJzb3VyY2VFbnRpdHkiLCIkdGFyZ2V0IiwiZW50aXR5IiwicXVhbGlmaWVyIiwiaGFzVW5pcXVlU291cmNlUHJvcGVydHkiLCJpc0ltbWVkaWF0ZSIsInNpZGVFZmZlY3RXaXRoUXVhbGlmaWVyIiwiZ2V0SW50ZXJmYWNlIiwiU2VydmljZSIsIlNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIlNpZGVFZmZlY3RzU2VydmljZVNlcnZpY2UiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiwgQ29udmVydGVkTWV0YWRhdGEsIEVudGl0eVR5cGUsIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTaWRlRWZmZWN0c1R5cGUgYXMgQ29tbW9uU2lkZUVmZmVjdHNUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGNvbnZlcnRUeXBlcywgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgaXNDb21wbGV4VHlwZSwgaXNFbnRpdHlUeXBlLCBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRUYXJnZXROYXZpZ2F0aW9uUGF0aCwgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxudHlwZSBTaWRlRWZmZWN0c1NldHRpbmdzID0ge307XG5cbmV4cG9ydCB0eXBlIFNpZGVFZmZlY3RzRW50aXR5VHlwZSA9IHtcblx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTaWRlRWZmZWN0c1RhcmdldCA9IFNpZGVFZmZlY3RzRW50aXR5VHlwZSB8IHN0cmluZztcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdHNUYXJnZXRUeXBlID0ge1xuXHR0YXJnZXRQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcblx0dGFyZ2V0RW50aXRpZXM6IFNpZGVFZmZlY3RzRW50aXR5VHlwZVtdO1xufTtcblxudHlwZSBCYXNlU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRzb3VyY2VQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdHNvdXJjZUVudGl0aWVzPzogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW107XG5cdGZ1bGx5UXVhbGlmaWVkTmFtZTogc3RyaW5nO1xufSAmIFNpZGVFZmZlY3RzVGFyZ2V0VHlwZTtcblxuZXhwb3J0IHR5cGUgT0RhdGFTaWRlRWZmZWN0c1R5cGUgPSBCYXNlU2lkZUVmZmVjdHNUeXBlICYge1xuXHR0cmlnZ2VyQWN0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQWN0aW9uU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRwYXRoRXhwcmVzc2lvbnM6IFNpZGVFZmZlY3RzVGFyZ2V0W107XG5cdHRyaWdnZXJBY3Rpb25zPzogc3RyaW5nW107XG59O1xuXG5leHBvcnQgdHlwZSBDb250cm9sU2lkZUVmZmVjdHNUeXBlID0gUGFydGlhbDxCYXNlU2lkZUVmZmVjdHNUeXBlPiAmIHtcblx0ZnVsbHlRdWFsaWZpZWROYW1lOiBzdHJpbmc7XG5cdHNvdXJjZVByb3BlcnRpZXM6IHN0cmluZ1tdO1xuXHRzb3VyY2VDb250cm9sSWQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNpZGVFZmZlY3RzVHlwZSA9IENvbnRyb2xTaWRlRWZmZWN0c1R5cGUgfCBPRGF0YVNpZGVFZmZlY3RzVHlwZTtcblxuLy9UT0RPIGZpeCB0aGlzIHR5cGUgaW4gdGhlIHV4IHZvY2FidWxhcmllc1xudHlwZSBDb21tb25TaWRlRWZmZWN0VHlwZVdpdGhRdWFsaWZpZXIgPSBDb21tb25TaWRlRWZmZWN0c1R5cGUgJiB7IHF1YWxpZmllcj86IHN0cmluZyB9O1xuXG5leHBvcnQgdHlwZSBPRGF0YVNpZGVFZmZlY3RzRW50aXR5RGljdGlvbmFyeSA9IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIE9EYXRhU2lkZUVmZmVjdHNBY3Rpb25EaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgQWN0aW9uU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIENvbnRyb2xTaWRlRWZmZWN0c0VudGl0eURpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBDb250cm9sU2lkZUVmZmVjdHNUeXBlPjtcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2UgPSB7IGVudGl0eTogc3RyaW5nOyBxdWFsaWZpZXI/OiBzdHJpbmc7IGhhc1VuaXF1ZVNvdXJjZVByb3BlcnR5PzogYm9vbGVhbiB9O1xuXG50eXBlIFNpZGVFZmZlY3RzT3JpZ2luUmVnaXN0cnkgPSB7XG5cdG9EYXRhOiB7XG5cdFx0ZW50aXRpZXM6IHtcblx0XHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPjtcblx0XHR9O1xuXHRcdGFjdGlvbnM6IHtcblx0XHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIEFjdGlvblNpZGVFZmZlY3RzVHlwZT47XG5cdFx0fTtcblx0fTtcblx0Y29udHJvbDoge1xuXHRcdFtlbnRpdHk6IHN0cmluZ106IFJlY29yZDxzdHJpbmcsIENvbnRyb2xTaWRlRWZmZWN0c1R5cGU+O1xuXHR9O1xufTtcblxuZXhwb3J0IGNsYXNzIFNpZGVFZmZlY3RzU2VydmljZSBleHRlbmRzIFNlcnZpY2U8U2lkZUVmZmVjdHNTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8U2lkZUVmZmVjdHNTZXJ2aWNlPjtcblxuXHRwcml2YXRlIHNpZGVFZmZlY3RzUmVnaXN0cnkhOiBTaWRlRWZmZWN0c09yaWdpblJlZ2lzdHJ5O1xuXG5cdHByaXZhdGUgY2FwYWJpbGl0aWVzITogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBpc0luaXRpYWxpemVkITogYm9vbGVhbjtcblxuXHRwcml2YXRlIHNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncyE6IHtcblx0XHRlbnRpdGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdFx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdH07XG5cblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5ID0ge1xuXHRcdFx0b0RhdGE6IHtcblx0XHRcdFx0ZW50aXRpZXM6IHt9LFxuXHRcdFx0XHRhY3Rpb25zOiB7fVxuXHRcdFx0fSxcblx0XHRcdGNvbnRyb2w6IHt9XG5cdFx0fTtcblx0XHR0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBTaWRlRWZmZWN0cyBjb250cm9sXG5cdCAqIFNpZGVFZmZlY3RzIGRlZmluaXRpb24gaXMgYWRkZWQgYnkgYSBjb250cm9sIHRvIGtlZXAgZGF0YSB1cCB0byBkYXRlXG5cdCAqIFRoZXNlIFNpZGVFZmZlY3RzIGdldCBsaW1pdGVkIHNjb3BlIGNvbXBhcmVkIHdpdGggU2lkZUVmZmVjdHMgY29taW5nIGZyb20gYW4gT0RhdGEgc2VydmljZTpcblx0ICogLSBPbmx5IG9uZSBTaWRlRWZmZWN0cyBkZWZpbml0aW9uIGNhbiBiZSBkZWZpbmVkIGZvciB0aGUgY29tYmluYXRpb24gZW50aXR5IHR5cGUgLSBjb250cm9sIElkXG5cdCAqIC0gT25seSBTaWRlRWZmZWN0cyBzb3VyY2UgcHJvcGVydGllcyBhcmUgcmVjb2duaXplZCBhbmQgdXNlZCB0byB0cmlnZ2VyIFNpZGVFZmZlY3RzXG5cdCAqXG5cdCAqIEVuc3VyZSB0aGUgc291cmNlQ29udHJvbElkIG1hdGNoZXMgdGhlIGFzc29jaWF0ZWQgU0FQVUk1IGNvbnRyb2wgSUQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdCBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkQ29udHJvbFNpZGVFZmZlY3RzKGVudGl0eVR5cGU6IHN0cmluZywgc2lkZUVmZmVjdDogT21pdDxDb250cm9sU2lkZUVmZmVjdHNUeXBlLCBcImZ1bGx5UXVhbGlmaWVkTmFtZVwiPik6IHZvaWQge1xuXHRcdGlmIChzaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZCkge1xuXHRcdFx0Y29uc3QgY29udHJvbFNpZGVFZmZlY3Q6IENvbnRyb2xTaWRlRWZmZWN0c1R5cGUgPSB7XG5cdFx0XHRcdC4uLnNpZGVFZmZlY3QsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZX0vU2lkZUVmZmVjdHNGb3JDb250cm9sLyR7c2lkZUVmZmVjdC5zb3VyY2VDb250cm9sSWR9YFxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGVudGl0eUNvbnRyb2xTaWRlRWZmZWN0cyA9IHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5jb250cm9sW2VudGl0eVR5cGVdIHx8IHt9O1xuXHRcdFx0ZW50aXR5Q29udHJvbFNpZGVFZmZlY3RzW2NvbnRyb2xTaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZF0gPSBjb250cm9sU2lkZUVmZmVjdDtcblx0XHRcdHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5jb250cm9sW2VudGl0eVR5cGVdID0gZW50aXR5Q29udHJvbFNpZGVFZmZlY3RzO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBTaWRlRWZmZWN0cyBhY3Rpb24uXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gdHJpZ2dlckFjdGlvbiBOYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dFxuXHQgKiBAcGFyYW0gZ3JvdXBJZCBUaGUgZ3JvdXAgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3Rcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aG91dCBkYXRhIG9yIHdpdGggYSByZXR1cm4gdmFsdWUgY29udGV4dCB3aGVuIHRoZSBhY3Rpb24gY2FsbCBzdWNjZWVkZWRcblx0ICovXG5cdHB1YmxpYyBleGVjdXRlQWN0aW9uKHRyaWdnZXJBY3Rpb246IHN0cmluZywgY29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGFjdGlvbiA9IGNvbnRleHQuZ2V0TW9kZWwoKS5iaW5kQ29udGV4dChgJHt0cmlnZ2VyQWN0aW9ufSguLi4pYCwgY29udGV4dCk7XG5cdFx0cmV0dXJuIGFjdGlvbi5leGVjdXRlKGdyb3VwSWQgfHwgY29udGV4dC5nZXRCaW5kaW5nKCkuZ2V0VXBkYXRlR3JvdXBJZCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGNvbnZlcnRlZCBPRGF0YSBtZXRhTW9kZWwuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgT0RhdGEgbWV0YU1vZGVsXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0XHRyZXR1cm4gY29udmVydFR5cGVzKHRoaXMuZ2V0TWV0YU1vZGVsKCksIHRoaXMuY2FwYWJpbGl0aWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBlbnRpdHkgdHlwZSBvZiBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHRcblx0ICogQHJldHVybnMgRW50aXR5IFR5cGVcblx0ICovXG5cdHB1YmxpYyBnZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0bWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dC5nZXRQYXRoKCkpLFxuXHRcdFx0ZW50aXR5VHlwZSA9IG1ldGFNb2RlbC5nZXRPYmplY3QobWV0YVBhdGgpW1wiJFR5cGVcIl07XG5cdFx0cmV0dXJuIGVudGl0eVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkaWN0aW9uYXJ5XG5cdCAqL1xuXHRwdWJsaWMgZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlTmFtZTogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgT0RhdGFTaWRlRWZmZWN0c1R5cGU+IHtcblx0XHRyZXR1cm4gdGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5Lm9EYXRhLmVudGl0aWVzW2VudGl0eVR5cGVOYW1lXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBnbG9iYWwgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBOYW1lIG9mIHRoZSBlbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBHbG9iYWwgU2lkZUVmZmVjdHNcblx0ICovXG5cdHB1YmxpYyBnZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzKGVudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBPRGF0YVNpZGVFZmZlY3RzVHlwZVtdIHtcblx0XHRjb25zdCBlbnRpdHlTaWRlRWZmZWN0cyA9IHRoaXMuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlTmFtZSk7XG5cdFx0Y29uc3QgZ2xvYmFsU2lkZUVmZmVjdHM6IE9EYXRhU2lkZUVmZmVjdHNUeXBlW10gPSBbXTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHlTaWRlRWZmZWN0cykge1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHMgPSBlbnRpdHlTaWRlRWZmZWN0c1trZXldO1xuXHRcdFx0aWYgKCFzaWRlRWZmZWN0cy5zb3VyY2VFbnRpdGllcyAmJiAhc2lkZUVmZmVjdHMuc291cmNlUHJvcGVydGllcykge1xuXHRcdFx0XHRnbG9iYWxTaWRlRWZmZWN0cy5wdXNoKHNpZGVFZmZlY3RzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGdsb2JhbFNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gYWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dFxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lOiBzdHJpbmcsIGNvbnRleHQ/OiBDb250ZXh0KTogQWN0aW9uU2lkZUVmZmVjdHNUeXBlIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHRoaXMuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGNvbnRleHQpO1xuXHRcdFx0aWYgKGVudGl0eVR5cGUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5vRGF0YS5hY3Rpb25zW2VudGl0eVR5cGVdPy5bYWN0aW9uTmFtZV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBkaWN0aW9uYXJ5IGZvciB0aGUgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gY2FwYWJpbGl0aWVzIFRoZSBjdXJyZW50IGNhcGFiaWxpdGllc1xuXHQgKi9cblx0cHVibGljIGluaXRpYWxpemVTaWRlRWZmZWN0cyhjYXBhYmlsaXRpZXM/OiBFbnZpcm9ubWVudENhcGFiaWxpdGllcyk6IHZvaWQge1xuXHRcdHRoaXMuY2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuXHRcdGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0U291cmNlczoge1xuXHRcdFx0XHRlbnRpdGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47XG5cdFx0XHRcdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIFNpZGVFZmZlY3RJbmZvRm9yU291cmNlW10+O1xuXHRcdFx0fSA9IHtcblx0XHRcdFx0ZW50aXRpZXM6IHt9LFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFNb2RlbCA9IHRoaXMuZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk7XG5cdFx0XHRjb252ZXJ0ZWRNZXRhTW9kZWwuZW50aXR5VHlwZXMuZm9yRWFjaCgoZW50aXR5VHlwZTogRW50aXR5VHlwZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkub0RhdGEuZW50aXRpZXNbZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWVdID0gdGhpcy5yZXRyaWV2ZU9EYXRhRW50aXR5U2lkZUVmZmVjdHMoZW50aXR5VHlwZSk7XG5cdFx0XHRcdHRoaXMuc2lkZUVmZmVjdHNSZWdpc3RyeS5vRGF0YS5hY3Rpb25zW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRoaXMucmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyhlbnRpdHlUeXBlKTsgLy8gb25seSBib3VuZCBhY3Rpb25zIGFyZSBhbmFseXplZCBzaW5jZSB1bmJvdW5kIG9uZXMgZG9uJ3QgZ2V0IFNpZGVFZmZlY3RzXG5cdFx0XHRcdHRoaXMubWFwU2lkZUVmZmVjdFNvdXJjZXMoZW50aXR5VHlwZSwgc2lkZUVmZmVjdFNvdXJjZXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNvdXJjZXNUb1NpZGVFZmZlY3RNYXBwaW5ncyA9IHNpZGVFZmZlY3RTb3VyY2VzO1xuXHRcdFx0dGhpcy5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gY29udHJvbElkIENvbnRyb2wgSWRcblx0ICovXG5cdHB1YmxpYyByZW1vdmVDb250cm9sU2lkZUVmZmVjdHMoY29udHJvbElkOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRPYmplY3Qua2V5cyh0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkuY29udHJvbCkuZm9yRWFjaCgoc0VudGl0eVR5cGUpID0+IHtcblx0XHRcdGlmICh0aGlzLnNpZGVFZmZlY3RzUmVnaXN0cnkuY29udHJvbFtzRW50aXR5VHlwZV1bY29udHJvbElkXSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5LmNvbnRyb2xbc0VudGl0eVR5cGVdW2NvbnRyb2xJZF07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFNpZGVFZmZlY3RzIG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhFeHByZXNzaW9ucyBUYXJnZXRzIG9mIFNpZGVFZmZlY3RzIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgbmVlZCB0byBiZSBleGVjdXRlZFxuXHQgKiBAcGFyYW0gZ3JvdXBJZCBUaGUgZ3JvdXAgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3Rcblx0ICogQHJldHVybnMgUHJvbWlzZSBvbiBTaWRlRWZmZWN0cyByZXF1ZXN0XG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzKHBhdGhFeHByZXNzaW9uczogU2lkZUVmZmVjdHNUYXJnZXRbXSwgY29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZyk6IFByb21pc2U8dW5kZWZpbmVkPiB7XG5cdFx0dGhpcy5sb2dSZXF1ZXN0KHBhdGhFeHByZXNzaW9ucywgY29udGV4dCk7XG5cdFx0cmV0dXJuIGNvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKHBhdGhFeHByZXNzaW9ucyBhcyBvYmplY3RbXSwgZ3JvdXBJZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFNpZGVFZmZlY3RzIGZvciBhbiBPRGF0YSBhY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0cyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgbmVlZCB0byBiZSBleGVjdXRlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIG9uIFNpZGVFZmZlY3RzIHJlcXVlc3RzIGFuZCBhY3Rpb24gZXhlY3V0aW9uXG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24oc2lkZUVmZmVjdHM6IEFjdGlvblNpZGVFZmZlY3RzVHlwZSwgY29udGV4dDogQ29udGV4dCk6IFByb21pc2U8KHZvaWQgfCB1bmRlZmluZWQpW10+IHtcblx0XHRsZXQgcHJvbWlzZXM6IFByb21pc2U8dm9pZCB8IHVuZGVmaW5lZD5bXTtcblxuXHRcdGlmIChzaWRlRWZmZWN0cy50cmlnZ2VyQWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRwcm9taXNlcyA9IHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb25zLm1hcCgoYWN0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5leGVjdXRlQWN0aW9uKGFjdGlvbk5hbWUsIGNvbnRleHQpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHByb21pc2VzID0gW107XG5cdFx0fVxuXG5cdFx0aWYgKHNpZGVFZmZlY3RzLnBhdGhFeHByZXNzaW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzLnBhdGhFeHByZXNzaW9ucywgY29udGV4dCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9taXNlcy5sZW5ndGggPyBQcm9taXNlLmFsbChwcm9taXNlcykgOiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBTaWRlRWZmZWN0cyBmb3IgYSBuYXZpZ2F0aW9uIHByb3BlcnR5IG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uUHJvcGVydHkgTmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIG5lZWQgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIGdyb3VwSWQgQmF0Y2ggZ3JvdXAgZm9yIHRoZSBxdWVyeVxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyByZXF1ZXN0IG9uIFNBUFVJNSBjb250ZXh0XG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eTogc3RyaW5nLFxuXHRcdGNvbnRleHQ6IENvbnRleHQsXG5cdFx0Z3JvdXBJZD86IHN0cmluZ1xuXHQpOiBQcm9taXNlPHZvaWQgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCBiYXNlRW50aXR5VHlwZSA9IHRoaXMuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGNvbnRleHQpO1xuXHRcdGlmIChiYXNlRW50aXR5VHlwZSkge1xuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblBhdGggPSBgJHtuYXZpZ2F0aW9uUHJvcGVydHl9L2A7XG5cdFx0XHRjb25zdCBlbnRpdHlTaWRlRWZmZWN0cyA9IHRoaXMuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhiYXNlRW50aXR5VHlwZSk7XG5cdFx0XHRsZXQgdGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCB0YXJnZXRFbnRpdGllczogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW10gPSBbXTtcblx0XHRcdGxldCBzaWRlRWZmZWN0c1RhcmdldHM6IFNpZGVFZmZlY3RzVGFyZ2V0W10gPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKGVudGl0eVNpZGVFZmZlY3RzKVxuXHRcdFx0XHQuZmlsdGVyKFxuXHRcdFx0XHRcdC8vIEtlZXAgcmVsZXZhbnQgU2lkZUVmZmVjdHNcblx0XHRcdFx0XHQoYW5ub3RhdGlvbk5hbWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSA9IGVudGl0eVNpZGVFZmZlY3RzW2Fubm90YXRpb25OYW1lXTtcblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdChzaWRlRWZmZWN0cy5zb3VyY2VQcm9wZXJ0aWVzIHx8IFtdKS5zb21lKFxuXHRcdFx0XHRcdFx0XHRcdChwcm9wZXJ0eVBhdGgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9wZXJ0eVBhdGguc3RhcnRzV2l0aChuYXZpZ2F0aW9uUGF0aCkgJiYgcHJvcGVydHlQYXRoLnJlcGxhY2UobmF2aWdhdGlvblBhdGgsIFwiXCIpLmluZGV4T2YoXCIvXCIpID09PSAtMVxuXHRcdFx0XHRcdFx0XHQpIHx8XG5cdFx0XHRcdFx0XHRcdChzaWRlRWZmZWN0cy5zb3VyY2VFbnRpdGllcyB8fCBbXSkuc29tZShcblx0XHRcdFx0XHRcdFx0XHQobmF2aWdhdGlvbikgPT4gbmF2aWdhdGlvbi4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCA9PT0gbmF2aWdhdGlvblByb3BlcnR5XG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHRcdC5mb3JFYWNoKChzQW5ub3RhdGlvbk5hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0cyA9IGVudGl0eVNpZGVFZmZlY3RzW3NBbm5vdGF0aW9uTmFtZV07XG5cdFx0XHRcdFx0aWYgKHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb24pIHtcblx0XHRcdFx0XHRcdHRoaXMuZXhlY3V0ZUFjdGlvbihzaWRlRWZmZWN0cy50cmlnZ2VyQWN0aW9uLCBjb250ZXh0LCBncm91cElkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGFyZ2V0UHJvcGVydGllcyA9IHRhcmdldFByb3BlcnRpZXMuY29uY2F0KHNpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMpO1xuXHRcdFx0XHRcdHRhcmdldEVudGl0aWVzID0gdGFyZ2V0RW50aXRpZXMuY29uY2F0KHNpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBSZW1vdmUgZHVwbGljYXRlIHRhcmdldHNcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzVGFyZ2V0RGVmaW5pdGlvbiA9IHRoaXMucmVtb3ZlRHVwbGljYXRlVGFyZ2V0cyh7XG5cdFx0XHRcdHRhcmdldFByb3BlcnRpZXM6IHRhcmdldFByb3BlcnRpZXMsXG5cdFx0XHRcdHRhcmdldEVudGl0aWVzOiB0YXJnZXRFbnRpdGllc1xuXHRcdFx0fSk7XG5cdFx0XHRzaWRlRWZmZWN0c1RhcmdldHMgPSBbLi4uc2lkZUVmZmVjdHNUYXJnZXREZWZpbml0aW9uLnRhcmdldFByb3BlcnRpZXMsIC4uLnNpZGVFZmZlY3RzVGFyZ2V0RGVmaW5pdGlvbi50YXJnZXRFbnRpdGllc107XG5cdFx0XHRpZiAoc2lkZUVmZmVjdHNUYXJnZXRzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNUYXJnZXRzLCBjb250ZXh0LCBncm91cElkKS5jYXRjaCgoZXJyb3IpID0+XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBTaWRlRWZmZWN0cyAtIEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgU2lkZUVmZmVjdHMgZm9yIE5hdmlnYXRpb24gUHJvcGVydHkgJHtuYXZpZ2F0aW9uUHJvcGVydHl9YCwgZXJyb3IpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBTaWRlRWZmZWN0cyB0aGF0IGNvbWUgZnJvbSBjb250cm9scy5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlTmFtZSBFbnRpdHkgdHlwZSBOYW1lXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIGRpY3Rpb25hcnlcblx0ICovXG5cdHB1YmxpYyBnZXRDb250cm9sRW50aXR5U2lkZUVmZmVjdHMoZW50aXR5VHlwZU5hbWU6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIENvbnRyb2xTaWRlRWZmZWN0c1R5cGU+IHtcblx0XHRyZXR1cm4gdGhpcy5zaWRlRWZmZWN0c1JlZ2lzdHJ5LmNvbnRyb2xbZW50aXR5VHlwZU5hbWVdIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgU2lkZUVmZmVjdHMnIHF1YWxpZmllciBhbmQgb3duZXIgZW50aXR5IHdoZXJlIHRoaXMgZW50aXR5IGlzIHVzZWQgYXMgc291cmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZU5hbWUgRW50aXR5IHR5cGUgZnVsbHkgcXVhbGlmaWVkIG5hbWVcblx0ICogQHJldHVybnMgQXJyYXkgb2Ygc2lkZUVmZmVjdHMgaW5mb1xuXHQgKi9cblx0cHVibGljIGdldFNpZGVFZmZlY3RXaGVyZUVudGl0eUlzU291cmNlKGVudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBTaWRlRWZmZWN0SW5mb0ZvclNvdXJjZVtdIHtcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2VzVG9TaWRlRWZmZWN0TWFwcGluZ3MuZW50aXRpZXNbZW50aXR5VHlwZU5hbWVdIHx8IFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbW1vbiBtZXRob2QgdG8gZ2V0IHRoZSBmaWVsZCBncm91cElkcyBmb3IgYSBzb3VyY2UgZW50aXR5IGFuZCBhIHNvdXJjZSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHNvdXJjZUVudGl0eVR5cGVcblx0ICogQHBhcmFtIHNvdXJjZVByb3BlcnR5XG5cdCAqIEByZXR1cm5zIEEgY29sbGVjdGlvbiBvZiBmaWVsZEdyb3VwSWRzXG5cdCAqL1xuXHRwdWJsaWMgY29tcHV0ZUZpZWxkR3JvdXBJZHMoc291cmNlRW50aXR5VHlwZTogc3RyaW5nLCBzb3VyY2VQcm9wZXJ0eTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IGVudGl0eUZpZWxkR3JvdXBJZHMgPSB0aGlzLmdldFNpZGVFZmZlY3RXaGVyZUVudGl0eUlzU291cmNlKHNvdXJjZUVudGl0eVR5cGUpLm1hcCgoc2lkZUVmZmVjdEluZm8pID0+XG5cdFx0XHR0aGlzLmdldEZpZWxkR3JvdXBJZEZvclNpZGVFZmZlY3Qoc2lkZUVmZmVjdEluZm8sIHRydWUpXG5cdFx0KTtcblx0XHRyZXR1cm4gZW50aXR5RmllbGRHcm91cElkcy5jb25jYXQoXG5cdFx0XHR0aGlzLmdldFNpZGVFZmZlY3RXaGVyZVByb3BlcnR5SXNTb3VyY2Uoc291cmNlUHJvcGVydHkpLm1hcCgoc2lkZUVmZmVjdEluZm8pID0+XG5cdFx0XHRcdHRoaXMuZ2V0RmllbGRHcm91cElkRm9yU2lkZUVmZmVjdChzaWRlRWZmZWN0SW5mbylcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgU2lkZUVmZmVjdHMnIHF1YWxpZmllciBhbmQgb3duZXIgZW50aXR5IHdoZXJlIHRoaXMgcHJvcGVydHkgaXMgdXNlZCBhcyBzb3VyY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgZnVsbHkgcXVhbGlmaWVkIG5hbWVcblx0ICogQHJldHVybnMgQXJyYXkgb2Ygc2lkZUVmZmVjdHMgaW5mb1xuXHQgKi9cblx0cHVibGljIGdldFNpZGVFZmZlY3RXaGVyZVByb3BlcnR5SXNTb3VyY2UocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBTaWRlRWZmZWN0SW5mb0ZvclNvdXJjZVtdIHtcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2VzVG9TaWRlRWZmZWN0TWFwcGluZ3MucHJvcGVydGllc1twcm9wZXJ0eU5hbWVdIHx8IFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgdGhlIHRleHQgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgU2lkZUVmZmVjdHNcblx0ICogSWYgYSBwcm9wZXJ0eSBoYXMgYW4gYXNzb2NpYXRlZCB0ZXh0IHRoZW4gdGhpcyB0ZXh0IG5lZWRzIHRvIGJlIGFkZGVkIGFzIHRhcmdldFByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNUYXJnZXRzIFNpZGVFZmZlY3RzIFRhcmdldHNcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvbiB3aXRoIGFkZGVkIHRleHQgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBhZGRUZXh0UHJvcGVydGllcyhzaWRlRWZmZWN0c1RhcmdldHM6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSwgZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB7XG5cdFx0Y29uc3Qgc2V0T2ZQcm9wZXJ0aWVzID0gbmV3IFNldChzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0UHJvcGVydGllcyk7XG5cdFx0Y29uc3Qgc2V0T2ZFbnRpdGllcyA9IG5ldyBTZXQoc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldEVudGl0aWVzLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpKTtcblxuXHRcdC8vIEdlbmVyYXRlIGFsbCBkYXRhTW9kZWxQYXRoIGZvciB0aGUgcHJvcGVydGllcyB0byBhbmFseXplIChjb3ZlciBcIipcIiBhbmQgLyopXG5cdFx0Y29uc3QgcHJvcGVydGllc1RvQW5hbHl6ZSA9IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzLnJlZHVjZShcblx0XHRcdChkYXRhTW9kZWxQcm9wZXJ0eVBhdGhzOiBEYXRhTW9kZWxPYmplY3RQYXRoW10sIHByb3BlcnR5UGF0aCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZGF0YU1vZGVsUHJvcGVydHlQYXRocy5jb25jYXQodGhpcy5nZXREYXRhTW9kZWxQcm9wZXJ0aWVzRnJvbUFQYXRoKHByb3BlcnR5UGF0aCwgZW50aXR5VHlwZSkpO1xuXHRcdFx0fSxcblx0XHRcdFtdXG5cdFx0KTtcblxuXHRcdC8vIEdlbmVyYXRlIGFsbCBwYXRocyByZWxhdGVkIHRvIHRoZSB0ZXh0IHByb3BlcnRpZXMgYW5kIG5vdCBhbHJlYWR5IGNvdmVyZWQgYnkgdGhlIFNpZGVFZmZlY3RzXG5cdFx0Zm9yIChjb25zdCBkYXRhTW9kZWxQcm9wZXJ0eVBhdGggb2YgcHJvcGVydGllc1RvQW5hbHl6ZSkge1xuXHRcdFx0Y29uc3QgYXNzb2NpYXRlZFRleHRQYXRoID0gZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdCk7XG5cdFx0XHRpZiAoYXNzb2NpYXRlZFRleHRQYXRoKSB7XG5cdFx0XHRcdGNvbnN0IGRhdGFNb2RlbFRleHRQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLCBhc3NvY2lhdGVkVGV4dFBhdGgpO1xuXHRcdFx0XHRjb25zdCByZWxhdGl2ZU5hdmlnYXRpb24gPSBnZXRUYXJnZXROYXZpZ2F0aW9uUGF0aChkYXRhTW9kZWxUZXh0UGF0aCwgdHJ1ZSk7XG5cdFx0XHRcdGNvbnN0IHRhcmdldFBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFRleHRQYXRoLCB0cnVlKTtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGlzUHJvcGVydHkoZGF0YU1vZGVsVGV4dFBhdGgudGFyZ2V0T2JqZWN0KSAmJlxuXHRcdFx0XHRcdCFzZXRPZlByb3BlcnRpZXMuaGFzKHRhcmdldFBhdGgpICYmIC8vIHRoZSBwcm9wZXJ0eSBpcyBhbHJlYWR5IGxpc3RlZFxuXHRcdFx0XHRcdCFzZXRPZlByb3BlcnRpZXMuaGFzKGAke3JlbGF0aXZlTmF2aWdhdGlvbn0ke2RhdGFNb2RlbFRleHRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aCA/IFwiL1wiIDogXCJcIn0qYCkgJiYgLy8gdGhlIHByb3BlcnR5IGlzIGFscmVhZHkgbGlzdGVkIHRoYW5rcyB0byB0aGUgXCIqXCJcblx0XHRcdFx0XHQhc2V0T2ZFbnRpdGllcy5oYXMoYCR7cmVsYXRpdmVOYXZpZ2F0aW9ufWApIC8vIHRoZSBwcm9wZXJ0eSBpcyBub3QgcGFydCBvZiBhIFRhcmdldEVudGl0aWVzXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdC8vIFRoZSBUZXh0IGFzc29jaWF0aW9uIGlzIGFkZGVkIGFzIFRhcmdldEVudGl0aWVzIGlmXG5cdFx0XHRcdFx0Ly8gIC0gaXQncyBjb250YWluZWQgb24gYSBkaWZmZXJlbnQgZW50aXR5U2V0IHRoYW4gdGhlIFNpZGVFZmZlY3RzXG5cdFx0XHRcdFx0Ly8gIC0gIGFuZCBpdCdzIGNvbnRhaW5lZCBvbiBhIGRpZmZlcmVudCBlbnRpdHlTZXQgdGhhbiB0aGUgc291cmNlZCBwcm9wZXJ0eVxuXHRcdFx0XHRcdC8vIE90aGVyd2lzZSBpdCdzIGFkZGVkIGFzIHRhcmdldFByb3BlcnRpZXNcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxQcm9wZXJ0eVBhdGgudGFyZ2V0RW50aXR5U2V0ICE9PSBkYXRhTW9kZWxUZXh0UGF0aC50YXJnZXRFbnRpdHlTZXQgJiZcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFRleHRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzICYmXG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxUZXh0UGF0aC50YXJnZXRFbnRpdHlUeXBlXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRzZXRPZkVudGl0aWVzLmFkZChyZWxhdGl2ZU5hdmlnYXRpb24pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZXRPZlByb3BlcnRpZXMuYWRkKHRhcmdldFBhdGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRQcm9wZXJ0aWVzOiBBcnJheS5mcm9tKHNldE9mUHJvcGVydGllcyksXG5cdFx0XHR0YXJnZXRFbnRpdGllczogQXJyYXkuZnJvbShzZXRPZkVudGl0aWVzKS5tYXAoKG5hdmlnYXRpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIHsgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IG5hdmlnYXRpb24gfTtcblx0XHRcdH0pXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyB0aGUgU2lkZUVmZmVjdHMgdG8gZXhwZWN0ZWQgZm9ybWF0XG5cdCAqICAtIFNldCBUcmlnZ2VyQWN0aW9uIGFzIHN0cmluZ1xuXHQgKiAgLSBDb252ZXJ0cyBTaWRlRWZmZWN0cyB0YXJnZXRzIHRvIGV4cGVjdGVkIGZvcm1hdFxuXHQgKiAgLSBSZW1vdmVzIGJpbmRpbmcgcGFyYW1ldGVyIGZyb20gU2lkZUVmZmVjdHMgdGFyZ2V0cyBwcm9wZXJ0aWVzXG5cdCAqICAtIEFkZHMgdGhlIHRleHQgcHJvcGVydGllc1xuXHQgKiAgLSBSZXBsYWNlcyBUYXJnZXRQcm9wZXJ0aWVzIGhhdmluZyByZWZlcmVuY2UgdG8gU291cmNlIFByb3BlcnRpZXMgZm9yIGEgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHkgdHlwZVxuXHQgKiBAcGFyYW0gYmluZGluZ1BhcmFtZXRlciBOYW1lIG9mIHRoZSBiaW5kaW5nIHBhcmFtZXRlclxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGNvbnZlcnRTaWRlRWZmZWN0cyhcblx0XHRzaWRlRWZmZWN0czogQ29tbW9uU2lkZUVmZmVjdHNUeXBlLFxuXHRcdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdFx0YmluZGluZ1BhcmFtZXRlcj86IHN0cmluZ1xuXHQpOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSB7XG5cdFx0Y29uc3QgdHJpZ2dlckFjdGlvbiA9IHNpZGVFZmZlY3RzLlRyaWdnZXJBY3Rpb24gYXMgc3RyaW5nO1xuXHRcdGNvbnN0IG5ld1NpZGVFZmZlY3RzID0gdGhpcy5jb252ZXJ0U2lkZUVmZmVjdHNGb3JtYXQoc2lkZUVmZmVjdHMpO1xuXHRcdGxldCBzaWRlRWZmZWN0c1RhcmdldHMgPSB7IHRhcmdldFByb3BlcnRpZXM6IG5ld1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMsIHRhcmdldEVudGl0aWVzOiBuZXdTaWRlRWZmZWN0cy50YXJnZXRFbnRpdGllcyB9O1xuXHRcdHNpZGVFZmZlY3RzVGFyZ2V0cyA9IHRoaXMucmVtb3ZlQmluZGluZ1BhcmFtZXRlcihzaWRlRWZmZWN0c1RhcmdldHMsIGJpbmRpbmdQYXJhbWV0ZXIpO1xuXHRcdHNpZGVFZmZlY3RzVGFyZ2V0cyA9IHRoaXMuYWRkVGV4dFByb3BlcnRpZXMoc2lkZUVmZmVjdHNUYXJnZXRzLCBlbnRpdHlUeXBlKTtcblx0XHRzaWRlRWZmZWN0c1RhcmdldHMgPSB0aGlzLnJlbW92ZUR1cGxpY2F0ZVRhcmdldHMoc2lkZUVmZmVjdHNUYXJnZXRzKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Li4ubmV3U2lkZUVmZmVjdHMsXG5cdFx0XHQuLi57IHRhcmdldEVudGl0aWVzOiBzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0RW50aXRpZXMsIHRhcmdldFByb3BlcnRpZXM6IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzLCB0cmlnZ2VyQWN0aW9uIH1cblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSBTaWRlRWZmZWN0cyB0YXJnZXRzIChUYXJnZXRFbnRpdGllcyBhbmQgVGFyZ2V0UHJvcGVydGllcykgdG8gZXhwZWN0ZWQgZm9ybWF0XG5cdCAqICAtIFRhcmdldFByb3BlcnRpZXMgYXMgYXJyYXkgb2Ygc3RyaW5nXG5cdCAqICAtIFRhcmdldEVudGl0aWVzIGFzIGFycmF5IG9mIG9iamVjdCB3aXRoIHByb3BlcnR5ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzIFNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICogQHJldHVybnMgQ29udmVydGVkIFNpZGVFZmZlY3RzXG5cdCAqL1xuXHRwcml2YXRlIGNvbnZlcnRTaWRlRWZmZWN0c0Zvcm1hdChzaWRlRWZmZWN0czogQ29tbW9uU2lkZUVmZmVjdHNUeXBlKTogT0RhdGFTaWRlRWZmZWN0c1R5cGUge1xuXHRcdGNvbnN0IGZvcm1hdFByb3BlcnRpZXMgPSAocHJvcGVydGllcz86IChzdHJpbmcgfCBQcm9wZXJ0eVBhdGgpW10pID0+IHtcblx0XHRcdHJldHVybiBwcm9wZXJ0aWVzXG5cdFx0XHRcdD8gcHJvcGVydGllcy5yZWR1Y2UoKHRhcmdldFByb3BlcnRpZXM6IHN0cmluZ1tdLCB0YXJnZXQpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHBhdGggPSAoKHRhcmdldCBhcyBQcm9wZXJ0eVBhdGgpLnR5cGUgJiYgKHRhcmdldCBhcyBQcm9wZXJ0eVBhdGgpLnZhbHVlKSB8fCAodGFyZ2V0IGFzIHN0cmluZyk7XG5cdFx0XHRcdFx0XHRpZiAocGF0aCkge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRQcm9wZXJ0aWVzLnB1c2gocGF0aCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0XHRcdFx0YFNpZGVFZmZlY3RzIC0gRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBUYXJnZXRQcm9wZXJ0aWVzIGZvciBTaWRlRWZmZWN0cyAke3NpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZX1gXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGFyZ2V0UHJvcGVydGllcztcblx0XHRcdFx0ICB9LCBbXSlcblx0XHRcdFx0OiBwcm9wZXJ0aWVzO1xuXHRcdH07XG5cdFx0Y29uc3QgZm9ybWF0RW50aXRpZXMgPSAoZW50aXRpZXM/OiBOYXZpZ2F0aW9uUHJvcGVydHlQYXRoW10pID0+IHtcblx0XHRcdHJldHVybiBlbnRpdGllc1xuXHRcdFx0XHQ/IGVudGl0aWVzLm1hcCgodGFyZ2V0RW50aXR5KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4geyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogdGFyZ2V0RW50aXR5LnZhbHVlIH07XG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBlbnRpdGllcztcblx0XHR9O1xuXHRcdHJldHVybiB7XG5cdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IHNpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdHNvdXJjZVByb3BlcnRpZXM6IGZvcm1hdFByb3BlcnRpZXMoc2lkZUVmZmVjdHMuU291cmNlUHJvcGVydGllcyksXG5cdFx0XHRzb3VyY2VFbnRpdGllczogZm9ybWF0RW50aXRpZXMoc2lkZUVmZmVjdHMuU291cmNlRW50aXRpZXMpLFxuXHRcdFx0dGFyZ2V0UHJvcGVydGllczogZm9ybWF0UHJvcGVydGllcyhzaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzIGFzIChzdHJpbmcgfCBQcm9wZXJ0eVBhdGgpW10pID8/IFtdLFxuXHRcdFx0dGFyZ2V0RW50aXRpZXM6IGZvcm1hdEVudGl0aWVzKHNpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzKSA/PyBbXVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbGwgZGF0YU1vZGVsT2JqZWN0UGF0aCByZWxhdGVkIHRvIHByb3BlcnRpZXMgbGlzdGVkIGJ5IGEgcGF0aFxuXHQgKlxuXHQgKiBUaGUgcGF0aCBjYW4gYmU6XG5cdCAqICAtIGEgcGF0aCB0YXJnZXRpbmcgYSBwcm9wZXJ0eSBvbiBhIGNvbXBsZXhUeXBlIG9yIGFuIEVudGl0eVR5cGVcblx0ICogIC0gYSBwYXRoIHdpdGggYSBzdGFyIHRhcmdldGluZyBhbGwgcHJvcGVydGllcyBvbiBhIGNvbXBsZXhUeXBlIG9yIGFuIEVudGl0eVR5cGUuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBhbmFseXplXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIEVudGl0eSB0eXBlXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIGRhdGFNb2RlbE9iamVjdFBhdGggcmVwcmVzZW50aW5nIHRoZSBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRwcml2YXRlIGdldERhdGFNb2RlbFByb3BlcnRpZXNGcm9tQVBhdGgocGF0aDogc3RyaW5nLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogRGF0YU1vZGVsT2JqZWN0UGF0aFtdIHtcblx0XHRsZXQgZGF0YU1vZGVsT2JqZWN0UGF0aHM6IERhdGFNb2RlbE9iamVjdFBhdGhbXSA9IFtdO1xuXHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFNb2RlbCA9IHRoaXMuZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgZW50aXR5U2V0ID1cblx0XHRcdGNvbnZlcnRlZE1ldGFNb2RlbC5lbnRpdHlTZXRzLmZpbmQoKHJlbGF0ZWRFbnRpdHlTZXQpID0+IHJlbGF0ZWRFbnRpdHlTZXQuZW50aXR5VHlwZSA9PT0gZW50aXR5VHlwZSkgfHxcblx0XHRcdGNvbnZlcnRlZE1ldGFNb2RlbC5zaW5nbGV0b25zLmZpbmQoKHNpbmdsZXRvbikgPT4gc2luZ2xldG9uLmVudGl0eVR5cGUgPT09IGVudGl0eVR5cGUpO1xuXG5cdFx0aWYgKGVudGl0eVNldCkge1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGhpcy5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0ZW50aXR5U2V0Q29udGV4dCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7ZW50aXR5U2V0Lm5hbWV9YCk7XG5cdFx0XHRpZiAoZW50aXR5U2V0Q29udGV4dCkge1xuXHRcdFx0XHRjb25zdCBkYXRhTW9kZWxFbnRpdHlTZXQgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoZW50aXR5U2V0Q29udGV4dCk7XG5cdFx0XHRcdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxFbnRpdHlTZXQsIHBhdGgucmVwbGFjZShcIipcIiwgXCJcIikgfHwgXCIvXCIpLCAvLyBcIipcIiBpcyByZXBsYWNlZCBieSBcIi9cIiB0byB0YXJnZXQgdGhlIGN1cnJlbnQgRW50aXR5VHlwZVxuXHRcdFx0XHRcdHRhcmdldE9iamVjdCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdFx0XHRpZiAoaXNQcm9wZXJ0eSh0YXJnZXRPYmplY3QpKSB7XG5cdFx0XHRcdFx0aWYgKGlzQ29tcGxleFR5cGUodGFyZ2V0T2JqZWN0LnRhcmdldFR5cGUpKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRocyA9IGRhdGFNb2RlbE9iamVjdFBhdGhzLmNvbmNhdChcblx0XHRcdFx0XHRcdFx0dGFyZ2V0T2JqZWN0LnRhcmdldFR5cGUucHJvcGVydGllcy5tYXAoKHByb3BlcnR5KSA9PiBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxPYmplY3RQYXRoLCBwcm9wZXJ0eS5uYW1lKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGhzLnB1c2goZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGlzRW50aXR5VHlwZSh0YXJnZXRPYmplY3QpKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aHMgPSBkYXRhTW9kZWxPYmplY3RQYXRocy5jb25jYXQoXG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5tYXAoKGVudGl0eVByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxPYmplY3RQYXRoLCBlbnRpdHlQcm9wZXJ0eS5uYW1lKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbnRpdHlTZXRDb250ZXh0LmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGRhdGFNb2RlbE9iamVjdFBhdGhzLmZpbHRlcigoZGF0YU1vZGVsT2JqZWN0UGF0aCkgPT4gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIE9kYXRhIG1ldGFtb2RlbC5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFRoZSBPRGF0YSBtZXRhbW9kZWxcblx0ICovXG5cdHByaXZhdGUgZ2V0TWV0YU1vZGVsKCk6IE9EYXRhTWV0YU1vZGVsIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRyZXR1cm4gb0NvbXBvbmVudC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHJlbGF0ZWQgdG8gYW4gZW50aXR5IHR5cGUgb3IgYWN0aW9uIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIFNlcnZpY2Vcblx0ICogSW50ZXJuYWwgcm91dGluZSB0byBnZXQsIGZyb20gY29udmVydGVkIG9EYXRhIG1ldGFNb2RlbCwgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhIHNwZWNpZmljIGVudGl0eSB0eXBlIG9yIGFjdGlvblxuXHQgKiBhbmQgdG8gY29udmVydCB0aGVzZSBTaWRlRWZmZWN0cyB3aXRoIGV4cGVjdGVkIGZvcm1hdC5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzb3VyY2UgRW50aXR5IHR5cGUgb3IgYWN0aW9uXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIFNpZGVFZmZlY3RzXG5cdCAqL1xuXHRwcml2YXRlIGdldFNpZGVFZmZlY3RzRnJvbVNvdXJjZShzb3VyY2U6IEVudGl0eVR5cGUgfCBBY3Rpb24pOiBPRGF0YVNpZGVFZmZlY3RzVHlwZVtdIHtcblx0XHRsZXQgYmluZGluZ0FsaWFzID0gXCJcIjtcblx0XHRjb25zdCBpc1NvdXJjZUVudGl0eVR5cGUgPSBpc0VudGl0eVR5cGUoc291cmNlKTtcblx0XHRjb25zdCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlIHwgdW5kZWZpbmVkID0gaXNTb3VyY2VFbnRpdHlUeXBlID8gc291cmNlIDogc291cmNlLnNvdXJjZUVudGl0eVR5cGU7XG5cdFx0Y29uc3QgY29tbW9uQW5ub3RhdGlvbiA9IHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uIGFzIHVuZGVmaW5lZCB8IHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgQ29tbW9uQW5ub3RhdGlvblR5cGVzPjtcblx0XHRpZiAoZW50aXR5VHlwZSAmJiBjb21tb25Bbm5vdGF0aW9uKSB7XG5cdFx0XHRpZiAoIWlzU291cmNlRW50aXR5VHlwZSkge1xuXHRcdFx0XHRjb25zdCBiaW5kaW5nUGFyYW1ldGVyID0gc291cmNlLnBhcmFtZXRlcnM/LmZpbmQoKHBhcmFtZXRlcikgPT4gcGFyYW1ldGVyLnR5cGUgPT09IGVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lKTtcblx0XHRcdFx0YmluZGluZ0FsaWFzID0gYmluZGluZ1BhcmFtZXRlcj8uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiL1wiKVsxXSA/PyBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0U2lkZUVmZmVjdHNBbm5vdGF0aW9uRnJvbVNvdXJjZShzb3VyY2UpLm1hcCgoc2lkZUVmZmVjdEFubm8pID0+XG5cdFx0XHRcdHRoaXMuY29udmVydFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RBbm5vLCBlbnRpdHlUeXBlLCBiaW5kaW5nQWxpYXMpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gW107XG5cdH1cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHJlbGF0ZWQgdG8gYW4gZW50aXR5IHR5cGUgb3IgYWN0aW9uIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIFNlcnZpY2Vcblx0ICogSW50ZXJuYWwgcm91dGluZSB0byBnZXQsIGZyb20gY29udmVydGVkIG9EYXRhIG1ldGFNb2RlbCwgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhIHNwZWNpZmljIGVudGl0eSB0eXBlIG9yIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHNvdXJjZSBFbnRpdHkgdHlwZSBvciBhY3Rpb25cblx0ICogQHJldHVybnMgQXJyYXkgb2YgU2lkZUVmZmVjdHNcblx0ICovXG5cdHByaXZhdGUgZ2V0U2lkZUVmZmVjdHNBbm5vdGF0aW9uRnJvbVNvdXJjZShzb3VyY2U6IEVudGl0eVR5cGUgfCBBY3Rpb24pOiBDb21tb25TaWRlRWZmZWN0VHlwZVdpdGhRdWFsaWZpZXJbXSB7XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdHM6IENvbW1vblNpZGVFZmZlY3RzVHlwZVtdID0gW107XG5cdFx0Y29uc3QgY29tbW9uQW5ub3RhdGlvbiA9IHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uIGFzIHVuZGVmaW5lZCB8IHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgQ29tbW9uU2lkZUVmZmVjdFR5cGVXaXRoUXVhbGlmaWVyPjtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBjb21tb25Bbm5vdGF0aW9uKSB7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uID0gY29tbW9uQW5ub3RhdGlvbltrZXldO1xuXHRcdFx0aWYgKHRoaXMuaXNTaWRlRWZmZWN0c0Fubm90YXRpb24oYW5ub3RhdGlvbikpIHtcblx0XHRcdFx0c2lkZUVmZmVjdHMucHVzaChhbm5vdGF0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgYW5ub3RhdGlvbiBpcyBhIFNpZGVFZmZlY3RzIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvbiBBbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIEJvb2xlYW5cblx0ICovXG5cdHByaXZhdGUgaXNTaWRlRWZmZWN0c0Fubm90YXRpb24oYW5ub3RhdGlvbjogdW5rbm93bik6IGFubm90YXRpb24gaXMgQ29tbW9uU2lkZUVmZmVjdHNUeXBlIHtcblx0XHRyZXR1cm4gKGFubm90YXRpb24gYXMgQ29tbW9uU2lkZUVmZmVjdHNUeXBlKT8uJFR5cGUgPT09IENvbW1vbkFubm90YXRpb25UeXBlcy5TaWRlRWZmZWN0c1R5cGU7XG5cdH1cblxuXHQvKipcblx0ICogTG9ncyB0aGUgU2lkZUVmZmVjdHMgcmVxdWVzdC5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBwYXRoRXhwcmVzc2lvbnMgU2lkZUVmZmVjdHMgdGFyZ2V0c1xuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0XG5cdCAqL1xuXHRwcml2YXRlIGxvZ1JlcXVlc3QocGF0aEV4cHJlc3Npb25zOiBTaWRlRWZmZWN0c1RhcmdldFtdLCBjb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgdGFyZ2V0UGF0aHMgPSBwYXRoRXhwcmVzc2lvbnMucmVkdWNlKGZ1bmN0aW9uIChwYXRocywgdGFyZ2V0KSB7XG5cdFx0XHRyZXR1cm4gYCR7cGF0aHN9XFxuXFx0XFx0JHsodGFyZ2V0IGFzIFNpZGVFZmZlY3RzRW50aXR5VHlwZSkuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggfHwgdGFyZ2V0IHx8IFwiXCJ9YDtcblx0XHR9LCBcIlwiKTtcblx0XHRMb2cuZGVidWcoYFNpZGVFZmZlY3RzIC0gUmVxdWVzdDpcXG5cXHRDb250ZXh0IHBhdGggOiAke2NvbnRleHQuZ2V0UGF0aCgpfVxcblxcdFByb3BlcnR5IHBhdGhzIDoke3RhcmdldFBhdGhzfWApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIG5hbWUgb2YgdGhlIGJpbmRpbmcgcGFyYW1ldGVyIG9uIHRoZSBTaWRlRWZmZWN0cyB0YXJnZXRzLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzVGFyZ2V0cyBTaWRlRWZmZWN0cyBUYXJnZXRzXG5cdCAqIEBwYXJhbSBiaW5kaW5nUGFyYW1ldGVyTmFtZSBOYW1lIG9mIGJpbmRpbmcgcGFyYW1ldGVyXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICovXG5cdHByaXZhdGUgcmVtb3ZlQmluZGluZ1BhcmFtZXRlcihzaWRlRWZmZWN0c1RhcmdldHM6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSwgYmluZGluZ1BhcmFtZXRlck5hbWU/OiBzdHJpbmcpOiBTaWRlRWZmZWN0c1RhcmdldFR5cGUge1xuXHRcdGlmIChiaW5kaW5nUGFyYW1ldGVyTmFtZSkge1xuXHRcdFx0Y29uc3QgcmVwbGFjZUJpbmRpbmdQYXJhbWV0ZXIgPSBmdW5jdGlvbiAodmFsdWU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtiaW5kaW5nUGFyYW1ldGVyTmFtZX0vP2ApLCBcIlwiKTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0YXJnZXRQcm9wZXJ0aWVzOiBzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0UHJvcGVydGllcy5tYXAoKHRhcmdldFByb3BlcnR5KSA9PiByZXBsYWNlQmluZGluZ1BhcmFtZXRlcih0YXJnZXRQcm9wZXJ0eSkpLFxuXHRcdFx0XHR0YXJnZXRFbnRpdGllczogc2lkZUVmZmVjdHNUYXJnZXRzLnRhcmdldEVudGl0aWVzLm1hcCgodGFyZ2V0RW50aXR5KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHsgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHJlcGxhY2VCaW5kaW5nUGFyYW1ldGVyKHRhcmdldEVudGl0eS4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCkgfTtcblx0XHRcdFx0fSlcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRQcm9wZXJ0aWVzOiBzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0UHJvcGVydGllcyxcblx0XHRcdHRhcmdldEVudGl0aWVzOiBzaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0RW50aXRpZXNcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBkdXBsaWNhdGVzIGluIFNpZGVFZmZlY3RzIHRhcmdldHMuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNUYXJnZXRzIFNpZGVFZmZlY3RzIFRhcmdldHNcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgdGFyZ2V0cyB3aXRob3V0IGR1cGxpY2F0ZXNcblx0ICovXG5cdHByaXZhdGUgcmVtb3ZlRHVwbGljYXRlVGFyZ2V0cyhzaWRlRWZmZWN0c1RhcmdldHM6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSk6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB7XG5cdFx0Y29uc3QgdGFyZ2V0RW50aXRpZXNQYXRocyA9IHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRFbnRpdGllcy5tYXAoKHRhcmdldEVudGl0eSkgPT4gdGFyZ2V0RW50aXR5LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRjb25zdCB1bmlxdWVUYXJnZXRlZEVudGl0aWVzUGF0aCA9IG5ldyBTZXQ8c3RyaW5nPih0YXJnZXRFbnRpdGllc1BhdGhzKTtcblx0XHRjb25zdCB1bmlxdWVUYXJnZXRQcm9wZXJ0aWVzID0gbmV3IFNldDxzdHJpbmc+KHNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzKTtcblxuXHRcdGNvbnN0IHVuaXF1ZVRhcmdldGVkRW50aXRpZXMgPSBBcnJheS5mcm9tKHVuaXF1ZVRhcmdldGVkRW50aXRpZXNQYXRoKS5tYXAoKGVudGl0eVBhdGgpID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBlbnRpdHlQYXRoXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHsgdGFyZ2V0UHJvcGVydGllczogQXJyYXkuZnJvbSh1bmlxdWVUYXJnZXRQcm9wZXJ0aWVzKSwgdGFyZ2V0RW50aXRpZXM6IHVuaXF1ZVRhcmdldGVkRW50aXRpZXMgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIFNpZGVFZmZlY3RzIGFjdGlvbiB0eXBlIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIFNlcnZpY2Vcblx0ICogSW50ZXJuYWwgcm91dGluZSB0byBnZXQsIGZyb20gY29udmVydGVkIG9EYXRhIG1ldGFNb2RlbCwgU2lkZUVmZmVjdHMgb24gYWN0aW9uc1xuXHQgKiByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgYW5kIHRvIGNvbnZlcnQgdGhlc2UgU2lkZUVmZmVjdHMgd2l0aFxuXHQgKiBleHBlY3RlZCBmb3JtYXQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHkgdHlwZVxuXHQgKiBAcmV0dXJucyBFbnRpdHkgdHlwZSBTaWRlRWZmZWN0cyBkaWN0aW9uYXJ5XG5cdCAqL1xuXHRwcml2YXRlIHJldHJpZXZlT0RhdGFBY3Rpb25zU2lkZUVmZmVjdHMoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IFJlY29yZDxzdHJpbmcsIEFjdGlvblNpZGVFZmZlY3RzVHlwZT4ge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzOiBSZWNvcmQ8c3RyaW5nLCBBY3Rpb25TaWRlRWZmZWN0c1R5cGU+ID0ge307XG5cdFx0Y29uc3QgYWN0aW9ucyA9IGVudGl0eVR5cGUuYWN0aW9ucztcblx0XHRpZiAoYWN0aW9ucykge1xuXHRcdFx0T2JqZWN0LmtleXMoYWN0aW9ucykuZm9yRWFjaCgoYWN0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBhY3Rpb24gPSBlbnRpdHlUeXBlLmFjdGlvbnNbYWN0aW9uTmFtZV07XG5cdFx0XHRcdGNvbnN0IHRyaWdnZXJBY3Rpb25zID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cdFx0XHRcdGxldCB0YXJnZXRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRsZXQgdGFyZ2V0RW50aXRpZXM6IFNpZGVFZmZlY3RzRW50aXR5VHlwZVtdID0gW107XG5cblx0XHRcdFx0dGhpcy5nZXRTaWRlRWZmZWN0c0Zyb21Tb3VyY2UoYWN0aW9uKS5mb3JFYWNoKChvRGF0YVNpZGVFZmZlY3QpID0+IHtcblx0XHRcdFx0XHRjb25zdCB0cmlnZ2VyQWN0aW9uID0gb0RhdGFTaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb247XG5cdFx0XHRcdFx0dGFyZ2V0UHJvcGVydGllcyA9IHRhcmdldFByb3BlcnRpZXMuY29uY2F0KG9EYXRhU2lkZUVmZmVjdC50YXJnZXRQcm9wZXJ0aWVzKTtcblx0XHRcdFx0XHR0YXJnZXRFbnRpdGllcyA9IHRhcmdldEVudGl0aWVzLmNvbmNhdChvRGF0YVNpZGVFZmZlY3QudGFyZ2V0RW50aXRpZXMpO1xuXHRcdFx0XHRcdGlmICh0cmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9ucy5hZGQodHJpZ2dlckFjdGlvbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNUYXJnZXRzID0gdGhpcy5yZW1vdmVEdXBsaWNhdGVUYXJnZXRzKHsgdGFyZ2V0UHJvcGVydGllcywgdGFyZ2V0RW50aXRpZXMgfSk7XG5cdFx0XHRcdHNpZGVFZmZlY3RzW2FjdGlvbk5hbWVdID0ge1xuXHRcdFx0XHRcdHBhdGhFeHByZXNzaW9uczogWy4uLnNpZGVFZmZlY3RzVGFyZ2V0cy50YXJnZXRQcm9wZXJ0aWVzLCAuLi5zaWRlRWZmZWN0c1RhcmdldHMudGFyZ2V0RW50aXRpZXNdLFxuXHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zOiBBcnJheS5mcm9tKHRyaWdnZXJBY3Rpb25zKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBzaWRlRWZmZWN0cztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIFNpZGVFZmZlY3RzIGVudGl0eSB0eXBlIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIFNlcnZpY2Vcblx0ICogSW50ZXJuYWwgcm91dGluZSB0byBnZXQsIGZyb20gY29udmVydGVkIG9EYXRhIG1ldGFNb2RlbCwgU2lkZUVmZmVjdHNcblx0ICogcmVsYXRlZCB0byBhIHNwZWNpZmljIGVudGl0eSB0eXBlIGFuZCB0byBjb252ZXJ0IHRoZXNlIFNpZGVFZmZlY3RzIHdpdGhcblx0ICogZXhwZWN0ZWQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgRW50aXR5IHR5cGUgU2lkZUVmZmVjdHMgZGljdGlvbmFyeVxuXHQgKi9cblx0cHJpdmF0ZSByZXRyaWV2ZU9EYXRhRW50aXR5U2lkZUVmZmVjdHMoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPiB7XG5cdFx0Y29uc3QgZW50aXR5U2lkZUVmZmVjdHM6IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPiA9IHt9O1xuXHRcdHRoaXMuZ2V0U2lkZUVmZmVjdHNGcm9tU291cmNlKGVudGl0eVR5cGUpLmZvckVhY2goKHNpZGVFZmZlY3RzKSA9PiB7XG5cdFx0XHRlbnRpdHlTaWRlRWZmZWN0c1tzaWRlRWZmZWN0cy5mdWxseVF1YWxpZmllZE5hbWVdID0gc2lkZUVmZmVjdHM7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGVudGl0eVNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgYSBtYXAgZm9yIHRoZSBTb3VyY2VzIG9mIHNpZGVFZmZlY3Qgb24gdGhlIGVudGl0eSB0byB0cmFjayB3aGVyZSB0aG9zZSBzb3VyY2VzIGFyZSB1c2VkIGluIFNpZGVFZmZlY3RzIGFubm90YXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBlbnRpdHlUeXBlIHdlIGxvb2sgZm9yIHNpZGUgRWZmZWN0cyBhbm5vdGF0aW9uXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1NvdXJjZXMgVGhlIG1hcHBpbmcgb2JqZWN0IGluIGNvbnN0cnVjdGlvblxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNTb3VyY2VzLmVudGl0aWVzXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1NvdXJjZXMucHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBtYXBTaWRlRWZmZWN0U291cmNlcyhcblx0XHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRcdHNpZGVFZmZlY3RzU291cmNlczogeyBlbnRpdGllczogUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2VbXT47IHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIFNpZGVFZmZlY3RJbmZvRm9yU291cmNlW10+IH1cblx0KTogdm9pZCB7XG5cdFx0Zm9yIChjb25zdCBzaWRlRWZmZWN0RGVmaW5pdGlvbiBvZiB0aGlzLmdldFNpZGVFZmZlY3RzQW5ub3RhdGlvbkZyb21Tb3VyY2UoZW50aXR5VHlwZSkpIHtcblx0XHRcdGZvciAoY29uc3Qgc291cmNlRW50aXR5IG9mIHNpZGVFZmZlY3REZWZpbml0aW9uLlNvdXJjZUVudGl0aWVzID8/IFtdKSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSBzb3VyY2VFbnRpdHkudmFsdWUgPyBzb3VyY2VFbnRpdHkuJHRhcmdldD8udGFyZ2V0VHlwZSA6IGVudGl0eVR5cGU7XG5cdFx0XHRcdGlmICh0YXJnZXRFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0aWYgKCFzaWRlRWZmZWN0c1NvdXJjZXMuZW50aXRpZXNbdGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWVdKSB7XG5cdFx0XHRcdFx0XHRzaWRlRWZmZWN0c1NvdXJjZXMuZW50aXRpZXNbdGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWVdID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNpZGVFZmZlY3RzU291cmNlcy5lbnRpdGllc1t0YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0ucHVzaCh7XG5cdFx0XHRcdFx0XHRlbnRpdHk6IGVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRcdFx0cXVhbGlmaWVyOiBzaWRlRWZmZWN0RGVmaW5pdGlvbi5xdWFsaWZpZXJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaGFzVW5pcXVlU291cmNlUHJvcGVydHkgPSBzaWRlRWZmZWN0RGVmaW5pdGlvbi5Tb3VyY2VQcm9wZXJ0aWVzPy5sZW5ndGggPT09IDE7XG5cdFx0XHRmb3IgKGNvbnN0IHNvdXJjZVByb3BlcnR5IG9mIHNpZGVFZmZlY3REZWZpbml0aW9uLlNvdXJjZVByb3BlcnRpZXMgPz8gW10pIHtcblx0XHRcdFx0aWYgKCFzaWRlRWZmZWN0c1NvdXJjZXMucHJvcGVydGllc1tzb3VyY2VQcm9wZXJ0eS4kdGFyZ2V0Py5mdWxseVF1YWxpZmllZE5hbWVdKSB7XG5cdFx0XHRcdFx0c2lkZUVmZmVjdHNTb3VyY2VzLnByb3BlcnRpZXNbc291cmNlUHJvcGVydHkuJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lXSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNpZGVFZmZlY3RzU291cmNlcy5wcm9wZXJ0aWVzW3NvdXJjZVByb3BlcnR5LiR0YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZV0ucHVzaCh7XG5cdFx0XHRcdFx0ZW50aXR5OiBlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0XHRxdWFsaWZpZXI6IHNpZGVFZmZlY3REZWZpbml0aW9uLnF1YWxpZmllcixcblx0XHRcdFx0XHRoYXNVbmlxdWVTb3VyY2VQcm9wZXJ0eVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBmaWVsZEdyb3VwSWQgYmFzZWQgb24gdGhlIHN0b3JlZCBpbmZvcm1hdGlvbiBvbiB0aCBzaWRlIGVmZmVjdC5cblx0ICpcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RJbmZvXG5cdCAqIEBwYXJhbSBpc0ltbWVkaWF0ZVxuXHQgKiBAcmV0dXJucyBBIHN0cmluZyBmb3IgdGhlIGZpZWxkR3JvdXBJZC5cblx0ICovXG5cdHByaXZhdGUgZ2V0RmllbGRHcm91cElkRm9yU2lkZUVmZmVjdChzaWRlRWZmZWN0SW5mbzogU2lkZUVmZmVjdEluZm9Gb3JTb3VyY2UsIGlzSW1tZWRpYXRlOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RXaXRoUXVhbGlmaWVyID0gc2lkZUVmZmVjdEluZm8ucXVhbGlmaWVyXG5cdFx0XHQ/IGAke3NpZGVFZmZlY3RJbmZvLmVudGl0eX0jJHtzaWRlRWZmZWN0SW5mby5xdWFsaWZpZXJ9YFxuXHRcdFx0OiBzaWRlRWZmZWN0SW5mby5lbnRpdHk7XG5cdFx0cmV0dXJuIGlzSW1tZWRpYXRlIHx8IHNpZGVFZmZlY3RJbmZvLmhhc1VuaXF1ZVNvdXJjZVByb3BlcnR5ID09PSB0cnVlXG5cdFx0XHQ/IGAke3NpZGVFZmZlY3RXaXRoUXVhbGlmaWVyfSQkSW1tZWRpYXRlUmVxdWVzdGBcblx0XHRcdDogc2lkZUVmZmVjdFdpdGhRdWFsaWZpZXI7XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKTogU2lkZUVmZmVjdHNTZXJ2aWNlIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5jbGFzcyBTaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8U2lkZUVmZmVjdHNTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PFNpZGVFZmZlY3RzU2V0dGluZ3M+KTogUHJvbWlzZTxTaWRlRWZmZWN0c1NlcnZpY2U+IHtcblx0XHRjb25zdCBTaWRlRWZmZWN0c1NlcnZpY2VTZXJ2aWNlID0gbmV3IFNpZGVFZmZlY3RzU2VydmljZShvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBTaWRlRWZmZWN0c1NlcnZpY2VTZXJ2aWNlLmluaXRQcm9taXNlO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGVFZmZlY3RzU2VydmljZUZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUF3RWFBLGtCQUFrQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQWM5QjtJQUFBLE9BQ0FDLElBQUksR0FBSixnQkFBTztNQUNOLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUc7UUFDMUJDLEtBQUssRUFBRTtVQUNOQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1VBQ1pDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNEQyxPQUFPLEVBQUUsQ0FBQztNQUNYLENBQUM7TUFDRCxJQUFJLENBQUNDLGFBQWEsR0FBRyxLQUFL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