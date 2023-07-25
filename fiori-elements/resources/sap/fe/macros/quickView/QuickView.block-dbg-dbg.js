/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (MetaModelConverter, BindingToolkit, TypeGuards, SemanticObjectHelper, FieldTemplating, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var isUsedInNavigationWithQuickViewFacets = FieldTemplating.isUsedInNavigationWithQuickViewFacets;
  var getPropertyWithSemanticObject = FieldTemplating.getPropertyWithSemanticObject;
  var getDataModelObjectPathForValue = FieldTemplating.getDataModelObjectPathForValue;
  var getSemanticObjectUnavailableActions = SemanticObjectHelper.getSemanticObjectUnavailableActions;
  var getSemanticObjects = SemanticObjectHelper.getSemanticObjects;
  var getSemanticObjectMappings = SemanticObjectHelper.getSemanticObjectMappings;
  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  var isProperty = TypeGuards.isProperty;
  var pathInModel = BindingToolkit.pathInModel;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let QuickViewBlock = (_dec = defineBuildingBlock({
    name: "QuickView",
    namespace: "sap.fe.macros",
    designtime: "sap/fe/macros/quickView/QuickView.designtime"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["Property"],
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(QuickViewBlock, _BuildingBlockBase);
    /**
     * Metadata path to the dataField.
     * This property is usually a metadataContext pointing to a DataField having
     * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
     * But it can also be a Property with $kind="Property"
     */
    /**
     * Metadata path to the entity set
     */
    /**
     * Custom semantic object
     */
    /**
     * Get the relative path to the entity which quick view Facets we want to display.
     *
     * @param propertyDataModelPath
     * @returns A path if it exists.
     */
    QuickViewBlock.getRelativePathToQuickViewEntity = function getRelativePathToQuickViewEntity(propertyDataModelPath) {
      let relativePathToQuickViewEntity;
      const quickViewNavProp = this.getNavPropToQuickViewEntity(propertyDataModelPath);
      if (quickViewNavProp) {
        relativePathToQuickViewEntity = propertyDataModelPath.navigationProperties.reduce((relativPath, navProp) => {
          var _propertyDataModelPat;
          if (navProp.name !== quickViewNavProp.name && !((_propertyDataModelPat = propertyDataModelPath.contextLocation) !== null && _propertyDataModelPat !== void 0 && _propertyDataModelPat.navigationProperties.find(contextNavProp => contextNavProp.name === navProp.name))) {
            // we keep only navProperties that are part of the relativePath and not the one for quickViewNavProp
            return `${relativPath}${navProp.name}/`;
          }
          return relativPath;
        }, "");
        relativePathToQuickViewEntity = `${relativePathToQuickViewEntity}${quickViewNavProp.name}`;
      }
      return relativePathToQuickViewEntity;
    }

    /**
     * Get the semanticObject compile biding from metadata and a map to the qualifiers.
     *
     * @param propertyWithSemanticObject The property that holds semanticObject annotataions if it exists
     * @returns An object containing semanticObjectList and qualifierMap
     */;
    QuickViewBlock.getSemanticObjectsForPayloadAndQualifierMap = function getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject) {
      const qualifierMap = {};
      const semanticObjectsList = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const semanticObject of getSemanticObjects(propertyWithSemanticObject)) {
          const compiledSemanticObject = compileExpression(getExpressionFromAnnotation(semanticObject));
          // this should not happen, but we make sure not to add twice the semanticObject otherwise the mdcLink crashes
          if (compiledSemanticObject && !semanticObjectsList.includes(compiledSemanticObject)) {
            qualifierMap[semanticObject.qualifier || ""] = compiledSemanticObject;
            semanticObjectsList.push(compiledSemanticObject);
          }
        }
      }
      return {
        semanticObjectsList,
        qualifierMap
      };
    }

    /**
     * Get the semanticObjectMappings from metadata in the payload expected structure.
     *
     * @param propertyWithSemanticObject
     * @param qualifierMap
     * @returns A payload structure for semanticObjectMappings
     */;
    QuickViewBlock.getSemanticObjectMappingsForPayload = function getSemanticObjectMappingsForPayload(propertyWithSemanticObject, qualifierMap) {
      const semanticObjectMappings = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const semanticObjectMapping of getSemanticObjectMappings(propertyWithSemanticObject)) {
          const correspondingSemanticObject = qualifierMap[semanticObjectMapping.qualifier || ""];
          if (correspondingSemanticObject) {
            semanticObjectMappings.push({
              semanticObject: correspondingSemanticObject,
              items: semanticObjectMapping.map(semanticObjectMappingType => {
                return {
                  key: semanticObjectMappingType.LocalProperty.value,
                  value: semanticObjectMappingType.SemanticObjectProperty.valueOf()
                };
              })
            });
          }
        }
      }
      return semanticObjectMappings;
    }

    /**
     * Get the semanticObjectUnavailableActions from metadata in the payload expected structure.
     *
     * @param propertyWithSemanticObject
     * @param qualifierMap
     * @returns A payload structure for semanticObjectUnavailableActions
     */;
    QuickViewBlock.getSemanticObjectUnavailableActionsForPayload = function getSemanticObjectUnavailableActionsForPayload(propertyWithSemanticObject, qualifierMap) {
      const semanticObjectUnavailableActions = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const unavailableActionAnnotation of getSemanticObjectUnavailableActions(propertyWithSemanticObject)) {
          const correspondingSemanticObject = qualifierMap[unavailableActionAnnotation.qualifier || ""];
          if (correspondingSemanticObject) {
            semanticObjectUnavailableActions.push({
              semanticObject: correspondingSemanticObject,
              actions: unavailableActionAnnotation.map(unavailableAction => unavailableAction)
            });
          }
        }
      }
      return semanticObjectUnavailableActions;
    }

    /**
     * Add customObject(s) to the semanticObject list for the payload if it exists.
     *
     * @param semanticObjectsList
     * @param customSemanticObject
     */;
    QuickViewBlock.addCustomSemanticObjectToSemanticObjectListForPayload = function addCustomSemanticObjectToSemanticObjectListForPayload(semanticObjectsList, customSemanticObject) {
      if (customSemanticObject) {
        // the custom semantic objects are either a single string/key to custom data or a stringified array
        if (!customSemanticObject.startsWith("[")) {
          // customSemanticObject = "semanticObject" | "{pathInModel}"
          if (!semanticObjectsList.includes(customSemanticObject)) {
            semanticObjectsList.push(customSemanticObject);
          }
        } else {
          // customSemanticObject = '["semanticObject1","semanticObject2"]'
          for (const semanticObject of JSON.parse(customSemanticObject)) {
            if (!semanticObjectsList.includes(semanticObject)) {
              semanticObjectsList.push(semanticObject);
            }
          }
        }
      }
    }

    /**
     * Get the navigationProperty to an entity with QuickViewFacets that can be linked to the property.
     *
     * @param propertyDataModelPath
     * @returns A navigation property if it exists.
     */;
    QuickViewBlock.getNavPropToQuickViewEntity = function getNavPropToQuickViewEntity(propertyDataModelPath) {
      var _propertyDataModelPat2;
      //TODO we should investigate to put this code as common with FieldTemplating.isUsedInNavigationWithQuickViewFacets
      const property = propertyDataModelPath.targetObject;
      const navigationProperties = propertyDataModelPath.targetEntityType.navigationProperties;
      let quickViewNavProp = navigationProperties.find(navProp => {
        return navProp.referentialConstraint.some(referentialConstraint => {
          var _navProp$targetType$a;
          return referentialConstraint.sourceProperty === property.name && ((_navProp$targetType$a = navProp.targetType.annotations.UI) === null || _navProp$targetType$a === void 0 ? void 0 : _navProp$targetType$a.QuickViewFacets);
        });
      });
      if (!quickViewNavProp && ((_propertyDataModelPat2 = propertyDataModelPath.contextLocation) === null || _propertyDataModelPat2 === void 0 ? void 0 : _propertyDataModelPat2.targetEntitySet) !== propertyDataModelPath.targetEntitySet) {
        var _propertyDataModelPat3, _propertyDataModelPat4;
        const semanticKeys = ((_propertyDataModelPat3 = propertyDataModelPath.targetEntityType.annotations.Common) === null || _propertyDataModelPat3 === void 0 ? void 0 : _propertyDataModelPat3.SemanticKey) || [];
        const isPropertySemanticKey = semanticKeys.some(function (semanticKey) {
          return semanticKey.$target.name === property.name;
        });
        const lastNavProp = propertyDataModelPath.navigationProperties[propertyDataModelPath.navigationProperties.length - 1];
        if ((isPropertySemanticKey || property.isKey) && (_propertyDataModelPat4 = propertyDataModelPath.targetEntityType.annotations.UI) !== null && _propertyDataModelPat4 !== void 0 && _propertyDataModelPat4.QuickViewFacets) {
          quickViewNavProp = lastNavProp;
        }
      }
      return quickViewNavProp;
    };
    function QuickViewBlock(props, controlConfiguration, settings) {
      var _metaPathDataModelPat, _metaPathDataModelPat2, _metaPathDataModelPat3, _valueProperty$annota, _valueProperty$annota2;
      var _this;
      _this = _BuildingBlockBase.call(this, props, controlConfiguration, settings) || this;
      _initializerDefineProperty(_this, "dataField", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor3, _assertThisInitialized(_this));
      let metaPathDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.dataField, _this.contextPath);
      const valueDataModelPath = getDataModelObjectPathForValue(metaPathDataModelPath);
      metaPathDataModelPath = valueDataModelPath || metaPathDataModelPath;
      const valueProperty = isProperty(metaPathDataModelPath.targetObject) ? metaPathDataModelPath.targetObject : undefined;
      const hasQuickViewFacets = valueProperty && isUsedInNavigationWithQuickViewFacets(metaPathDataModelPath, valueProperty) ? "true" : "false";
      const relativePathToQuickViewEntity = QuickViewBlock.getRelativePathToQuickViewEntity(metaPathDataModelPath);
      // it can be that there is no targetEntityset for the context location so we use the targetObjectFullyQualifiedName
      const absoluteContextPath = ((_metaPathDataModelPat = metaPathDataModelPath.contextLocation) === null || _metaPathDataModelPat === void 0 ? void 0 : (_metaPathDataModelPat2 = _metaPathDataModelPat.targetEntitySet) === null || _metaPathDataModelPat2 === void 0 ? void 0 : _metaPathDataModelPat2.name) ?? ((_metaPathDataModelPat3 = metaPathDataModelPath.contextLocation) === null || _metaPathDataModelPat3 === void 0 ? void 0 : _metaPathDataModelPat3.targetObject).fullyQualifiedName;
      const quickViewEntity = relativePathToQuickViewEntity ? `/${absoluteContextPath}/${relativePathToQuickViewEntity}` : undefined;
      const navigationPath = relativePathToQuickViewEntity ? compileExpression(pathInModel(relativePathToQuickViewEntity)) : undefined;
      const propertyWithSemanticObject = getPropertyWithSemanticObject(metaPathDataModelPath);
      let mainSemanticObject;
      const {
        semanticObjectsList,
        qualifierMap
      } = QuickViewBlock.getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject);
      const semanticObjectMappings = QuickViewBlock.getSemanticObjectMappingsForPayload(propertyWithSemanticObject, qualifierMap);
      const semanticObjectUnavailableActions = QuickViewBlock.getSemanticObjectUnavailableActionsForPayload(propertyWithSemanticObject, qualifierMap);
      if (isProperty(propertyWithSemanticObject)) {
        // TODO why should this be different for navigation: when we add this some links disappear
        mainSemanticObject = qualifierMap.main || qualifierMap[""];
      }
      QuickViewBlock.addCustomSemanticObjectToSemanticObjectListForPayload(semanticObjectsList, _this.semanticObject);
      const propertyPathLabel = (valueProperty === null || valueProperty === void 0 ? void 0 : (_valueProperty$annota = valueProperty.annotations.Common) === null || _valueProperty$annota === void 0 ? void 0 : (_valueProperty$annota2 = _valueProperty$annota.Label) === null || _valueProperty$annota2 === void 0 ? void 0 : _valueProperty$annota2.valueOf()) || "";
      _this.payload = {
        semanticObjects: semanticObjectsList,
        entityType: quickViewEntity,
        semanticObjectUnavailableActions: semanticObjectUnavailableActions,
        semanticObjectMappings: semanticObjectMappings,
        mainSemanticObject: mainSemanticObject,
        propertyPathLabel: propertyPathLabel,
        dataField: quickViewEntity === undefined ? _this.dataField.getPath() : undefined,
        contact: undefined,
        navigationPath: navigationPath,
        hasQuickViewFacets: hasQuickViewFacets
      };
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = QuickViewBlock;
    var _proto = QuickViewBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      const delegateConfiguration = {
        name: "sap/fe/macros/quickView/QuickViewDelegate",
        payload: this.payload
      };
      return xml`<mdc:Link xmlns:mdc="sap.ui.mdc" delegate="${JSON.stringify(delegateConfiguration)}">
			${this.writeCustomData(this.payload.semanticObjects)}
			</mdc:Link>`;
    };
    _proto.writeCustomData = function writeCustomData(semanticObjects) {
      let customData = "";
      for (const semanticObject of semanticObjects) {
        const dynamicPath = getDynamicPathFromSemanticObject(semanticObject);
        if (dynamicPath) {
          customData = `${customData}
				<core:CustomData xmlns:core="sap.ui.core" key="${dynamicPath}" value="${semanticObject}" />`;
        }
      }
      if (customData.length) {
        return `<mdc:customData>
				${customData}
			</mdc:customData>`;
      }
      return "";
    };
    return QuickViewBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dataField", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = QuickViewBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWlja1ZpZXdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZGVzaWdudGltZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiZXhwZWN0ZWRUeXBlcyIsImV4cGVjdGVkQW5ub3RhdGlvblR5cGVzIiwiZ2V0UmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkiLCJwcm9wZXJ0eURhdGFNb2RlbFBhdGgiLCJyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eSIsInF1aWNrVmlld05hdlByb3AiLCJnZXROYXZQcm9wVG9RdWlja1ZpZXdFbnRpdHkiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsInJlZHVjZSIsInJlbGF0aXZQYXRoIiwibmF2UHJvcCIsImNvbnRleHRMb2NhdGlvbiIsImZpbmQiLCJjb250ZXh0TmF2UHJvcCIsImdldFNlbWFudGljT2JqZWN0c0ZvclBheWxvYWRBbmRRdWFsaWZpZXJNYXAiLCJwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCIsInF1YWxpZmllck1hcCIsInNlbWFudGljT2JqZWN0c0xpc3QiLCJ1bmRlZmluZWQiLCJzZW1hbnRpY09iamVjdCIsImdldFNlbWFudGljT2JqZWN0cyIsImNvbXBpbGVkU2VtYW50aWNPYmplY3QiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImluY2x1ZGVzIiwicXVhbGlmaWVyIiwicHVzaCIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZ3NGb3JQYXlsb2FkIiwic2VtYW50aWNPYmplY3RNYXBwaW5ncyIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QiLCJpdGVtcyIsIm1hcCIsInNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGUiLCJrZXkiLCJMb2NhbFByb3BlcnR5IiwidmFsdWUiLCJTZW1hbnRpY09iamVjdFByb3BlcnR5IiwidmFsdWVPZiIsImdldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zRm9yUGF5bG9hZCIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwidW5hdmFpbGFibGVBY3Rpb25Bbm5vdGF0aW9uIiwiZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJhY3Rpb25zIiwidW5hdmFpbGFibGVBY3Rpb24iLCJhZGRDdXN0b21TZW1hbnRpY09iamVjdFRvU2VtYW50aWNPYmplY3RMaXN0Rm9yUGF5bG9hZCIsImN1c3RvbVNlbWFudGljT2JqZWN0Iiwic3RhcnRzV2l0aCIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5IiwidGFyZ2V0T2JqZWN0IiwidGFyZ2V0RW50aXR5VHlwZSIsInJlZmVyZW50aWFsQ29uc3RyYWludCIsInNvbWUiLCJzb3VyY2VQcm9wZXJ0eSIsInRhcmdldFR5cGUiLCJhbm5vdGF0aW9ucyIsIlVJIiwiUXVpY2tWaWV3RmFjZXRzIiwidGFyZ2V0RW50aXR5U2V0Iiwic2VtYW50aWNLZXlzIiwiQ29tbW9uIiwiU2VtYW50aWNLZXkiLCJpc1Byb3BlcnR5U2VtYW50aWNLZXkiLCJzZW1hbnRpY0tleSIsIiR0YXJnZXQiLCJsYXN0TmF2UHJvcCIsImxlbmd0aCIsImlzS2V5IiwicHJvcHMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwibWV0YVBhdGhEYXRhTW9kZWxQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZGF0YUZpZWxkIiwiY29udGV4dFBhdGgiLCJ2YWx1ZURhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUiLCJ2YWx1ZVByb3BlcnR5IiwiaXNQcm9wZXJ0eSIsImhhc1F1aWNrVmlld0ZhY2V0cyIsImlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJhYnNvbHV0ZUNvbnRleHRQYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwicXVpY2tWaWV3RW50aXR5IiwibmF2aWdhdGlvblBhdGgiLCJwYXRoSW5Nb2RlbCIsImdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0IiwibWFpblNlbWFudGljT2JqZWN0IiwibWFpbiIsInByb3BlcnR5UGF0aExhYmVsIiwiTGFiZWwiLCJwYXlsb2FkIiwic2VtYW50aWNPYmplY3RzIiwiZW50aXR5VHlwZSIsImdldFBhdGgiLCJjb250YWN0IiwiZ2V0VGVtcGxhdGUiLCJkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24iLCJ4bWwiLCJzdHJpbmdpZnkiLCJ3cml0ZUN1c3RvbURhdGEiLCJjdXN0b21EYXRhIiwiZHluYW1pY1BhdGgiLCJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJRdWlja1ZpZXcuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uVGVybSwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlICogYXMgRWRtIGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9FZG1cIjtcbmltcG9ydCB0eXBlIHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdHBhdGhJbk1vZGVsLFxuXHR0eXBlIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0dHlwZSBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldER5bmFtaWNQYXRoRnJvbVNlbWFudGljT2JqZWN0LFxuXHRnZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRnZXRTZW1hbnRpY09iamVjdHMsXG5cdGdldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUsXG5cdGdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0LFxuXHRpc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzXG59IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuXG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHtcblx0UmVnaXN0ZXJlZFBheWxvYWQsXG5cdFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9xdWlja1ZpZXcvUXVpY2tWaWV3RGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJRdWlja1ZpZXdcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL3F1aWNrVmlldy9RdWlja1ZpZXcuZGVzaWdudGltZVwiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVpY2tWaWV3QmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGQuXG5cdCAqIFRoaXMgcHJvcGVydHkgaXMgdXN1YWxseSBhIG1ldGFkYXRhQ29udGV4dCBwb2ludGluZyB0byBhIERhdGFGaWVsZCBoYXZpbmdcblx0ICogJFR5cGUgb2YgRGF0YUZpZWxkLCBEYXRhRmllbGRXaXRoVXJsLCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uLCBEYXRhRmllbGRGb3JBY3Rpb24sIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLCBvciBEYXRhUG9pbnRUeXBlLlxuXHQgKiBCdXQgaXQgY2FuIGFsc28gYmUgYSBQcm9wZXJ0eSB3aXRoICRraW5kPVwiUHJvcGVydHlcIlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCJcblx0XHRdXG5cdH0pXG5cdHB1YmxpYyBkYXRhRmllbGQhOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIEN1c3RvbSBzZW1hbnRpYyBvYmplY3Rcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgc2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBwYXlsb2FkITogUmVnaXN0ZXJlZFBheWxvYWQ7XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgcmVsYXRpdmUgcGF0aCB0byB0aGUgZW50aXR5IHdoaWNoIHF1aWNrIHZpZXcgRmFjZXRzIHdlIHdhbnQgdG8gZGlzcGxheS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5RGF0YU1vZGVsUGF0aFxuXHQgKiBAcmV0dXJucyBBIHBhdGggaWYgaXQgZXhpc3RzLlxuXHQgKi9cblx0c3RhdGljIGdldFJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5KHByb3BlcnR5RGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IHJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgcXVpY2tWaWV3TmF2UHJvcCA9IHRoaXMuZ2V0TmF2UHJvcFRvUXVpY2tWaWV3RW50aXR5KHByb3BlcnR5RGF0YU1vZGVsUGF0aCk7XG5cdFx0aWYgKHF1aWNrVmlld05hdlByb3ApIHtcblx0XHRcdHJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5ID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnJlZHVjZSgocmVsYXRpdlBhdGg6IHN0cmluZywgbmF2UHJvcCkgPT4ge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0bmF2UHJvcC5uYW1lICE9PSBxdWlja1ZpZXdOYXZQcm9wLm5hbWUgJiZcblx0XHRcdFx0XHQhcHJvcGVydHlEYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZChcblx0XHRcdFx0XHRcdChjb250ZXh0TmF2UHJvcCkgPT4gY29udGV4dE5hdlByb3AubmFtZSA9PT0gbmF2UHJvcC5uYW1lXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHQvLyB3ZSBrZWVwIG9ubHkgbmF2UHJvcGVydGllcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSByZWxhdGl2ZVBhdGggYW5kIG5vdCB0aGUgb25lIGZvciBxdWlja1ZpZXdOYXZQcm9wXG5cdFx0XHRcdFx0cmV0dXJuIGAke3JlbGF0aXZQYXRofSR7bmF2UHJvcC5uYW1lfS9gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZWxhdGl2UGF0aDtcblx0XHRcdH0sIFwiXCIpO1xuXHRcdFx0cmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkgPSBgJHtyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eX0ke3F1aWNrVmlld05hdlByb3AubmFtZX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBzZW1hbnRpY09iamVjdCBjb21waWxlIGJpZGluZyBmcm9tIG1ldGFkYXRhIGFuZCBhIG1hcCB0byB0aGUgcXVhbGlmaWVycy5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0IFRoZSBwcm9wZXJ0eSB0aGF0IGhvbGRzIHNlbWFudGljT2JqZWN0IGFubm90YXRhaW9ucyBpZiBpdCBleGlzdHNcblx0ICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgc2VtYW50aWNPYmplY3RMaXN0IGFuZCBxdWFsaWZpZXJNYXBcblx0ICovXG5cdHN0YXRpYyBnZXRTZW1hbnRpY09iamVjdHNGb3JQYXlsb2FkQW5kUXVhbGlmaWVyTWFwKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHF1YWxpZmllck1hcDogUmVjb3JkPHN0cmluZywgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24+ID0ge307XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RzTGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRpZiAocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yIChjb25zdCBzZW1hbnRpY09iamVjdCBvZiBnZXRTZW1hbnRpY09iamVjdHMocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdGNvbnN0IGNvbXBpbGVkU2VtYW50aWNPYmplY3QgPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdCBhcyB1bmtub3duIGFzIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFByb3BlcnR5PlxuXHRcdFx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5cblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gdGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYnV0IHdlIG1ha2Ugc3VyZSBub3QgdG8gYWRkIHR3aWNlIHRoZSBzZW1hbnRpY09iamVjdCBvdGhlcndpc2UgdGhlIG1kY0xpbmsgY3Jhc2hlc1xuXHRcdFx0XHRpZiAoY29tcGlsZWRTZW1hbnRpY09iamVjdCAmJiAhc2VtYW50aWNPYmplY3RzTGlzdC5pbmNsdWRlcyhjb21waWxlZFNlbWFudGljT2JqZWN0KSkge1xuXHRcdFx0XHRcdHF1YWxpZmllck1hcFtzZW1hbnRpY09iamVjdC5xdWFsaWZpZXIgfHwgXCJcIl0gPSBjb21waWxlZFNlbWFudGljT2JqZWN0O1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0c0xpc3QucHVzaChjb21waWxlZFNlbWFudGljT2JqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4geyBzZW1hbnRpY09iamVjdHNMaXN0LCBxdWFsaWZpZXJNYXAgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHNlbWFudGljT2JqZWN0TWFwcGluZ3MgZnJvbSBtZXRhZGF0YSBpbiB0aGUgcGF5bG9hZCBleHBlY3RlZCBzdHJ1Y3R1cmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdFxuXHQgKiBAcGFyYW0gcXVhbGlmaWVyTWFwXG5cdCAqIEByZXR1cm5zIEEgcGF5bG9hZCBzdHJ1Y3R1cmUgZm9yIHNlbWFudGljT2JqZWN0TWFwcGluZ3Ncblx0ICovXG5cdHN0YXRpYyBnZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzRm9yUGF5bG9hZChcblx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQsXG5cdFx0cXVhbGlmaWVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbj5cblx0KSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1tdID0gW107XG5cdFx0aWYgKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAoY29uc3Qgc2VtYW50aWNPYmplY3RNYXBwaW5nIG9mIGdldFNlbWFudGljT2JqZWN0TWFwcGluZ3MocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdGNvbnN0IGNvcnJlc3BvbmRpbmdTZW1hbnRpY09iamVjdCA9IHF1YWxpZmllck1hcFtzZW1hbnRpY09iamVjdE1hcHBpbmcucXVhbGlmaWVyIHx8IFwiXCJdO1xuXHRcdFx0XHRpZiAoY29ycmVzcG9uZGluZ1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRpdGVtczogc2VtYW50aWNPYmplY3RNYXBwaW5nLm1hcCgoc2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGtleTogc2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZS5Mb2NhbFByb3BlcnR5LnZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBzZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlLlNlbWFudGljT2JqZWN0UHJvcGVydHkudmFsdWVPZigpIGFzIHN0cmluZ1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2VtYW50aWNPYmplY3RNYXBwaW5ncztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIGZyb20gbWV0YWRhdGEgaW4gdGhlIHBheWxvYWQgZXhwZWN0ZWQgc3RydWN0dXJlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Rcblx0ICogQHBhcmFtIHF1YWxpZmllck1hcFxuXHQgKiBAcmV0dXJucyBBIHBheWxvYWQgc3RydWN0dXJlIGZvciBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1xuXHQgKi9cblx0c3RhdGljIGdldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zRm9yUGF5bG9hZChcblx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQsXG5cdFx0cXVhbGlmaWVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbj5cblx0KSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IFtdO1xuXHRcdGlmIChwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHVuYXZhaWxhYmxlQWN0aW9uQW5ub3RhdGlvbiBvZiBnZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyhwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCkgYXMgKHtcblx0XHRcdFx0dGVybTogQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdFx0fSAmIEFubm90YXRpb25UZXJtPEVkbS5TdHJpbmdbXT4pW10pIHtcblx0XHRcdFx0Y29uc3QgY29ycmVzcG9uZGluZ1NlbWFudGljT2JqZWN0ID0gcXVhbGlmaWVyTWFwW3VuYXZhaWxhYmxlQWN0aW9uQW5ub3RhdGlvbi5xdWFsaWZpZXIgfHwgXCJcIl07XG5cdFx0XHRcdGlmIChjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRhY3Rpb25zOiB1bmF2YWlsYWJsZUFjdGlvbkFubm90YXRpb24ubWFwKCh1bmF2YWlsYWJsZUFjdGlvbikgPT4gdW5hdmFpbGFibGVBY3Rpb24gYXMgc3RyaW5nKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgY3VzdG9tT2JqZWN0KHMpIHRvIHRoZSBzZW1hbnRpY09iamVjdCBsaXN0IGZvciB0aGUgcGF5bG9hZCBpZiBpdCBleGlzdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZW1hbnRpY09iamVjdHNMaXN0XG5cdCAqIEBwYXJhbSBjdXN0b21TZW1hbnRpY09iamVjdFxuXHQgKi9cblx0c3RhdGljIGFkZEN1c3RvbVNlbWFudGljT2JqZWN0VG9TZW1hbnRpY09iamVjdExpc3RGb3JQYXlsb2FkKFxuXHRcdHNlbWFudGljT2JqZWN0c0xpc3Q6IHN0cmluZ1tdLFxuXHRcdGN1c3RvbVNlbWFudGljT2JqZWN0OiBzdHJpbmcgfCB1bmRlZmluZWRcblx0KTogdm9pZCB7XG5cdFx0aWYgKGN1c3RvbVNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHQvLyB0aGUgY3VzdG9tIHNlbWFudGljIG9iamVjdHMgYXJlIGVpdGhlciBhIHNpbmdsZSBzdHJpbmcva2V5IHRvIGN1c3RvbSBkYXRhIG9yIGEgc3RyaW5naWZpZWQgYXJyYXlcblx0XHRcdGlmICghY3VzdG9tU2VtYW50aWNPYmplY3Quc3RhcnRzV2l0aChcIltcIikpIHtcblx0XHRcdFx0Ly8gY3VzdG9tU2VtYW50aWNPYmplY3QgPSBcInNlbWFudGljT2JqZWN0XCIgfCBcIntwYXRoSW5Nb2RlbH1cIlxuXHRcdFx0XHRpZiAoIXNlbWFudGljT2JqZWN0c0xpc3QuaW5jbHVkZXMoY3VzdG9tU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RzTGlzdC5wdXNoKGN1c3RvbVNlbWFudGljT2JqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY3VzdG9tU2VtYW50aWNPYmplY3QgPSAnW1wic2VtYW50aWNPYmplY3QxXCIsXCJzZW1hbnRpY09iamVjdDJcIl0nXG5cdFx0XHRcdGZvciAoY29uc3Qgc2VtYW50aWNPYmplY3Qgb2YgSlNPTi5wYXJzZShjdXN0b21TZW1hbnRpY09iamVjdCkgYXMgc3RyaW5nW10pIHtcblx0XHRcdFx0XHRpZiAoIXNlbWFudGljT2JqZWN0c0xpc3QuaW5jbHVkZXMoc2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdHNMaXN0LnB1c2goc2VtYW50aWNPYmplY3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIG5hdmlnYXRpb25Qcm9wZXJ0eSB0byBhbiBlbnRpdHkgd2l0aCBRdWlja1ZpZXdGYWNldHMgdGhhdCBjYW4gYmUgbGlua2VkIHRvIHRoZSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5RGF0YU1vZGVsUGF0aFxuXHQgKiBAcmV0dXJucyBBIG5hdmlnYXRpb24gcHJvcGVydHkgaWYgaXQgZXhpc3RzLlxuXHQgKi9cblx0c3RhdGljIGdldE5hdlByb3BUb1F1aWNrVmlld0VudGl0eShwcm9wZXJ0eURhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHQvL1RPRE8gd2Ugc2hvdWxkIGludmVzdGlnYXRlIHRvIHB1dCB0aGlzIGNvZGUgYXMgY29tbW9uIHdpdGggRmllbGRUZW1wbGF0aW5nLmlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHNcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnR5RGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBwcm9wZXJ0eURhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRsZXQgcXVpY2tWaWV3TmF2UHJvcCA9IG5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoKG5hdlByb3A6IE5hdmlnYXRpb25Qcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIG5hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50LnNvbWUoKHJlZmVyZW50aWFsQ29uc3RyYWludCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcmVmZXJlbnRpYWxDb25zdHJhaW50LnNvdXJjZVByb3BlcnR5ID09PSBwcm9wZXJ0eS5uYW1lICYmIG5hdlByb3AudGFyZ2V0VHlwZS5hbm5vdGF0aW9ucy5VST8uUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0aWYgKCFxdWlja1ZpZXdOYXZQcm9wICYmIHByb3BlcnR5RGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldCAhPT0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0Y29uc3Qgc2VtYW50aWNLZXlzID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUuYW5ub3RhdGlvbnMuQ29tbW9uPy5TZW1hbnRpY0tleSB8fCBbXTtcblx0XHRcdGNvbnN0IGlzUHJvcGVydHlTZW1hbnRpY0tleSA9IHNlbWFudGljS2V5cy5zb21lKGZ1bmN0aW9uIChzZW1hbnRpY0tleSkge1xuXHRcdFx0XHRyZXR1cm4gc2VtYW50aWNLZXkuJHRhcmdldC5uYW1lID09PSBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBsYXN0TmF2UHJvcCA9IHByb3BlcnR5RGF0YU1vZGVsUGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllc1twcm9wZXJ0eURhdGFNb2RlbFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoKGlzUHJvcGVydHlTZW1hbnRpY0tleSB8fCBwcm9wZXJ0eS5pc0tleSkgJiYgcHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LlF1aWNrVmlld0ZhY2V0cykge1xuXHRcdFx0XHRxdWlja1ZpZXdOYXZQcm9wID0gbGFzdE5hdlByb3AgYXMgdW5rbm93biBhcyBOYXZpZ2F0aW9uUHJvcGVydHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBxdWlja1ZpZXdOYXZQcm9wO1xuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxRdWlja1ZpZXdCbG9jaz4sIGNvbnRyb2xDb25maWd1cmF0aW9uOiB1bmtub3duLCBzZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncykge1xuXHRcdHN1cGVyKHByb3BzLCBjb250cm9sQ29uZmlndXJhdGlvbiwgc2V0dGluZ3MpO1xuXHRcdGxldCBtZXRhUGF0aERhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuZGF0YUZpZWxkLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCB2YWx1ZURhdGFNb2RlbFBhdGggPSBnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUobWV0YVBhdGhEYXRhTW9kZWxQYXRoKTtcblx0XHRtZXRhUGF0aERhdGFNb2RlbFBhdGggPSB2YWx1ZURhdGFNb2RlbFBhdGggfHwgbWV0YVBhdGhEYXRhTW9kZWxQYXRoO1xuXG5cdFx0Y29uc3QgdmFsdWVQcm9wZXJ0eSA9IGlzUHJvcGVydHkobWV0YVBhdGhEYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkgPyBtZXRhUGF0aERhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0IDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGhhc1F1aWNrVmlld0ZhY2V0cyA9XG5cdFx0XHR2YWx1ZVByb3BlcnR5ICYmIGlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMobWV0YVBhdGhEYXRhTW9kZWxQYXRoLCB2YWx1ZVByb3BlcnR5KSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xuXG5cdFx0Y29uc3QgcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkgPSBRdWlja1ZpZXdCbG9jay5nZXRSZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eShtZXRhUGF0aERhdGFNb2RlbFBhdGgpO1xuXHRcdC8vIGl0IGNhbiBiZSB0aGF0IHRoZXJlIGlzIG5vIHRhcmdldEVudGl0eXNldCBmb3IgdGhlIGNvbnRleHQgbG9jYXRpb24gc28gd2UgdXNlIHRoZSB0YXJnZXRPYmplY3RGdWxseVF1YWxpZmllZE5hbWVcblx0XHRjb25zdCBhYnNvbHV0ZUNvbnRleHRQYXRoID1cblx0XHRcdG1ldGFQYXRoRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldD8ubmFtZSA/P1xuXHRcdFx0KG1ldGFQYXRoRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldE9iamVjdCBhcyBOYXZpZ2F0aW9uUHJvcGVydHkgfCBFbnRpdHlUeXBlKS5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0Y29uc3QgcXVpY2tWaWV3RW50aXR5ID0gcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkgPyBgLyR7YWJzb2x1dGVDb250ZXh0UGF0aH0vJHtyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eX1gIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoID0gcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkgPyBjb21waWxlRXhwcmVzc2lvbihwYXRoSW5Nb2RlbChyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eSkpIDogdW5kZWZpbmVkO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgPSBnZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdChtZXRhUGF0aERhdGFNb2RlbFBhdGgpO1xuXHRcdGxldCBtYWluU2VtYW50aWNPYmplY3Q7XG5cdFx0Y29uc3QgeyBzZW1hbnRpY09iamVjdHNMaXN0LCBxdWFsaWZpZXJNYXAgfSA9XG5cdFx0XHRRdWlja1ZpZXdCbG9jay5nZXRTZW1hbnRpY09iamVjdHNGb3JQYXlsb2FkQW5kUXVhbGlmaWVyTWFwKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0KTtcblx0XHRjb25zdCBzZW1hbnRpY09iamVjdE1hcHBpbmdzID0gUXVpY2tWaWV3QmxvY2suZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nc0ZvclBheWxvYWQocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QsIHF1YWxpZmllck1hcCk7XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBRdWlja1ZpZXdCbG9jay5nZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc0ZvclBheWxvYWQoXG5cdFx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCxcblx0XHRcdHF1YWxpZmllck1hcFxuXHRcdCk7XG5cdFx0aWYgKGlzUHJvcGVydHkocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHQvLyBUT0RPIHdoeSBzaG91bGQgdGhpcyBiZSBkaWZmZXJlbnQgZm9yIG5hdmlnYXRpb246IHdoZW4gd2UgYWRkIHRoaXMgc29tZSBsaW5rcyBkaXNhcHBlYXJcblx0XHRcdG1haW5TZW1hbnRpY09iamVjdCA9IHF1YWxpZmllck1hcC5tYWluIHx8IHF1YWxpZmllck1hcFtcIlwiXTtcblx0XHR9XG5cdFx0UXVpY2tWaWV3QmxvY2suYWRkQ3VzdG9tU2VtYW50aWNPYmplY3RUb1NlbWFudGljT2JqZWN0TGlzdEZvclBheWxvYWQoc2VtYW50aWNPYmplY3RzTGlzdCwgdGhpcy5zZW1hbnRpY09iamVjdCk7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoTGFiZWwgPSAodmFsdWVQcm9wZXJ0eT8uYW5ub3RhdGlvbnMuQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIGFzIHN0cmluZykgfHwgXCJcIjtcblxuXHRcdHRoaXMucGF5bG9hZCA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0czogc2VtYW50aWNPYmplY3RzTGlzdCxcblx0XHRcdGVudGl0eVR5cGU6IHF1aWNrVmlld0VudGl0eSxcblx0XHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyxcblx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IHNlbWFudGljT2JqZWN0TWFwcGluZ3MsXG5cdFx0XHRtYWluU2VtYW50aWNPYmplY3Q6IG1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdHByb3BlcnR5UGF0aExhYmVsOiBwcm9wZXJ0eVBhdGhMYWJlbCxcblx0XHRcdGRhdGFGaWVsZDogcXVpY2tWaWV3RW50aXR5ID09PSB1bmRlZmluZWQgPyB0aGlzLmRhdGFGaWVsZC5nZXRQYXRoKCkgOiB1bmRlZmluZWQsXG5cdFx0XHRjb250YWN0OiB1bmRlZmluZWQsXG5cdFx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblBhdGgsXG5cdFx0XHRoYXNRdWlja1ZpZXdGYWNldHM6IGhhc1F1aWNrVmlld0ZhY2V0c1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGRlbGVnYXRlQ29uZmlndXJhdGlvbiA9IHtcblx0XHRcdG5hbWU6IFwic2FwL2ZlL21hY3Jvcy9xdWlja1ZpZXcvUXVpY2tWaWV3RGVsZWdhdGVcIixcblx0XHRcdHBheWxvYWQ6IHRoaXMucGF5bG9hZFxuXHRcdH07XG5cblx0XHRyZXR1cm4geG1sYDxtZGM6TGluayB4bWxuczptZGM9XCJzYXAudWkubWRjXCIgZGVsZWdhdGU9XCIke0pTT04uc3RyaW5naWZ5KGRlbGVnYXRlQ29uZmlndXJhdGlvbil9XCI+XG5cdFx0XHQke3RoaXMud3JpdGVDdXN0b21EYXRhKHRoaXMucGF5bG9hZC5zZW1hbnRpY09iamVjdHMpfVxuXHRcdFx0PC9tZGM6TGluaz5gO1xuXHR9XG5cblx0d3JpdGVDdXN0b21EYXRhKHNlbWFudGljT2JqZWN0czogc3RyaW5nW10pIHtcblx0XHRsZXQgY3VzdG9tRGF0YSA9IFwiXCI7XG5cdFx0Zm9yIChjb25zdCBzZW1hbnRpY09iamVjdCBvZiBzZW1hbnRpY09iamVjdHMpIHtcblx0XHRcdGNvbnN0IGR5bmFtaWNQYXRoID0gZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3Qoc2VtYW50aWNPYmplY3QpO1xuXHRcdFx0aWYgKGR5bmFtaWNQYXRoKSB7XG5cdFx0XHRcdGN1c3RvbURhdGEgPSBgJHtjdXN0b21EYXRhfVxuXHRcdFx0XHQ8Y29yZTpDdXN0b21EYXRhIHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiIGtleT1cIiR7ZHluYW1pY1BhdGh9XCIgdmFsdWU9XCIke3NlbWFudGljT2JqZWN0fVwiIC8+YDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGN1c3RvbURhdGEubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gYDxtZGM6Y3VzdG9tRGF0YT5cblx0XHRcdFx0JHtjdXN0b21EYXRhfVxuXHRcdFx0PC9tZGM6Y3VzdG9tRGF0YT5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTBDcUJBLGNBQWMsV0FMbENDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsV0FBVztJQUNqQkMsU0FBUyxFQUFFLGVBQWU7SUFDMUJDLFVBQVUsRUFBRTtFQUNiLENBQUMsQ0FBQyxVQVFBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQzNCQyx1QkFBdUIsRUFBRSxDQUN4QixzQ0FBc0MsRUFDdEMsNkNBQTZDLEVBQzdDLG1EQUFtRCxFQUNuRCwwQ0FBMEM7RUFFNUMsQ0FBQyxDQUFDLFVBTURKLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLFdBQVc7RUFDN0UsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUM7SUFBQTtJQWxDRjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFjQztBQUNEO0FBQ0E7SUFRQztBQUNEO0FBQ0E7SUFRQztBQUNE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