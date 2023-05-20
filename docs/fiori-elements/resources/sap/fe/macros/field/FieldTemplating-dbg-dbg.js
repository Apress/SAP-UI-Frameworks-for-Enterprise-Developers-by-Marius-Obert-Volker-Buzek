/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/CommonFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/core/templating/UIFormatters", "sap/ui/model/json/JSONModel"], function (BindingHelper, BindingToolkit, TypeGuards, CommonFormatters, DataModelPathHelper, FieldControlHelper, PropertyHelper, SemanticObjectHelper, UIFormatters, JSONModel) {
  "use strict";

  var _exports = {};
  var hasSemanticObject = SemanticObjectHelper.hasSemanticObject;
  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var transformRecursively = BindingToolkit.transformRecursively;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isComplexTypeExpression = BindingToolkit.isComplexTypeExpression;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  /**
   * Recursively add the text arrangement to a binding expression.
   *
   * @param bindingExpressionToEnhance The binding expression to be enhanced
   * @param fullContextPath The current context path we're on (to properly resolve the text arrangement properties)
   * @returns An updated expression containing the text arrangement binding.
   */
  const addTextArrangementToBindingExpression = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelPath, expression);
      }
      return outExpression;
    });
  };
  _exports.addTextArrangementToBindingExpression = addTextArrangementToBindingExpression;
  const formatValueRecursively = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
      }
      return outExpression;
    });
  };
  _exports.formatValueRecursively = formatValueRecursively;
  const getTextBindingExpression = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    return getTextBinding(oPropertyDataModelObjectPath, fieldFormatOptions, true);
  };
  _exports.getTextBindingExpression = getTextBindingExpression;
  const getTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9, _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12, _oPropertyDataModelOb13, _oPropertyDataModelOb14, _oPropertyDataModelOb15;
    let asObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb === void 0 ? void 0 : _oPropertyDataModelOb.$Type) === "com.sap.vocabularies.UI.v1.DataField" || ((_oPropertyDataModelOb2 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb2 === void 0 ? void 0 : _oPropertyDataModelOb2.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" || ((_oPropertyDataModelOb3 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb3 === void 0 ? void 0 : _oPropertyDataModelOb3.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || ((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb4 === void 0 ? void 0 : _oPropertyDataModelOb4.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || ((_oPropertyDataModelOb5 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb5 === void 0 ? void 0 : _oPropertyDataModelOb5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || ((_oPropertyDataModelOb6 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb6 === void 0 ? void 0 : _oPropertyDataModelOb6.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithAction") {
      // If there is no resolved property, the value is returned as a constant
      const fieldValue = getExpressionFromAnnotation(oPropertyDataModelObjectPath.targetObject.Value) ?? "";
      return compileExpression(fieldValue);
    }
    if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      oPropertyDataModelObjectPath = enhanceDataModelPath(oPropertyDataModelObjectPath, oPropertyDataModelObjectPath.targetObject.path);
    }
    const oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
    let oTargetBinding;
    if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Measures) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.Unit || (_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Measures) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.ISOCurrency) {
      oTargetBinding = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression);
      if ((fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.measureDisplayMode) === "Hidden" && isComplexTypeExpression(oTargetBinding)) {
        // TODO: Refactor once types are less generic here
        oTargetBinding.formatOptions = {
          ...oTargetBinding.formatOptions,
          showMeasure: false
        };
      }
    } else if ((_oPropertyDataModelOb13 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb13 !== void 0 && (_oPropertyDataModelOb14 = _oPropertyDataModelOb13.annotations) !== null && _oPropertyDataModelOb14 !== void 0 && (_oPropertyDataModelOb15 = _oPropertyDataModelOb14.Common) !== null && _oPropertyDataModelOb15 !== void 0 && _oPropertyDataModelOb15.Timezone) {
      oTargetBinding = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, false, true, fieldFormatOptions.dateFormatOptions);
    } else {
      oTargetBinding = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelObjectPath, oBindingExpression, fieldFormatOptions);
    }
    if (asObject) {
      return oTargetBinding;
    }
    // We don't include $$nopatch and parseKeepEmptyString as they make no sense in the text binding case
    return compileExpression(oTargetBinding);
  };
  _exports.getTextBinding = getTextBinding;
  const getValueBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    let ignoreUnit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let ignoreFormatting = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let bindingParameters = arguments.length > 4 ? arguments[4] : undefined;
    let targetTypeAny = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    let keepUnit = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    if (isPathAnnotationExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      const oNavPath = oPropertyDataModelObjectPath.targetEntityType.resolvePath(oPropertyDataModelObjectPath.targetObject.path, true);
      oPropertyDataModelObjectPath.targetObject = oNavPath.target;
      oNavPath.visitedObjects.forEach(oNavObj => {
        if (isNavigationProperty(oNavObj)) {
          oPropertyDataModelObjectPath.navigationProperties.push(oNavObj);
        }
      });
    }
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (isProperty(targetObject)) {
      let oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      if (isPathInModelExpression(oBindingExpression)) {
        var _targetObject$annotat, _targetObject$annotat2, _targetObject$annotat3, _targetObject$annotat4, _targetObject$annotat5, _targetObject$annotat6;
        if ((_targetObject$annotat = targetObject.annotations) !== null && _targetObject$annotat !== void 0 && (_targetObject$annotat2 = _targetObject$annotat.Communication) !== null && _targetObject$annotat2 !== void 0 && _targetObject$annotat2.IsEmailAddress) {
          oBindingExpression.type = "sap.fe.core.type.Email";
        } else if (!ignoreUnit && ((_targetObject$annotat3 = targetObject.annotations) !== null && _targetObject$annotat3 !== void 0 && (_targetObject$annotat4 = _targetObject$annotat3.Measures) !== null && _targetObject$annotat4 !== void 0 && _targetObject$annotat4.ISOCurrency || (_targetObject$annotat5 = targetObject.annotations) !== null && _targetObject$annotat5 !== void 0 && (_targetObject$annotat6 = _targetObject$annotat5.Measures) !== null && _targetObject$annotat6 !== void 0 && _targetObject$annotat6.Unit)) {
          oBindingExpression = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression, true, keepUnit ? undefined : {
            showMeasure: false
          });
        } else {
          var _oPropertyDataModelOb16, _oPropertyDataModelOb17;
          const oTimezone = (_oPropertyDataModelOb16 = oPropertyDataModelObjectPath.targetObject.annotations) === null || _oPropertyDataModelOb16 === void 0 ? void 0 : (_oPropertyDataModelOb17 = _oPropertyDataModelOb16.Common) === null || _oPropertyDataModelOb17 === void 0 ? void 0 : _oPropertyDataModelOb17.Timezone;
          if (oTimezone) {
            oBindingExpression = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, true);
          } else {
            oBindingExpression = formatWithTypeInformation(targetObject, oBindingExpression);
          }
          if (isPathInModelExpression(oBindingExpression) && oBindingExpression.type === "sap.ui.model.odata.type.String") {
            oBindingExpression.formatOptions = {
              parseKeepsEmptyString: true
            };
          }
        }
        if (isPathInModelExpression(oBindingExpression)) {
          if (ignoreFormatting) {
            delete oBindingExpression.formatOptions;
            delete oBindingExpression.constraints;
            delete oBindingExpression.type;
          }
          if (bindingParameters) {
            oBindingExpression.parameters = bindingParameters;
          }
          if (targetTypeAny) {
            oBindingExpression.targetType = "any";
          }
        }
        return compileExpression(oBindingExpression);
      } else {
        // if somehow we could not compile the binding -> return empty string
        return "";
      }
    } else if ((targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || (targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") {
      return compileExpression(getExpressionFromAnnotation(targetObject.Value));
    } else {
      return "";
    }
  };
  _exports.getValueBinding = getValueBinding;
  const getAssociatedTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    const textPropertyPath = PropertyHelper.getAssociatedTextPropertyPath(oPropertyDataModelObjectPath.targetObject);
    if (textPropertyPath) {
      const oTextPropertyPath = enhanceDataModelPath(oPropertyDataModelObjectPath, textPropertyPath);
      return getValueBinding(oTextPropertyPath, fieldFormatOptions, true, true, {
        $$noPatch: true
      });
    }
    return undefined;
  };
  _exports.getAssociatedTextBinding = getAssociatedTextBinding;
  const isUsedInNavigationWithQuickViewFacets = function (oDataModelPath, oProperty) {
    var _oDataModelPath$targe, _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4, _oDataModelPath$conte;
    const aNavigationProperties = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe === void 0 ? void 0 : _oDataModelPath$targe.navigationProperties) || [];
    const aSemanticObjects = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe2 === void 0 ? void 0 : (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) === null || _oDataModelPath$targe3 === void 0 ? void 0 : (_oDataModelPath$targe4 = _oDataModelPath$targe3.Common) === null || _oDataModelPath$targe4 === void 0 ? void 0 : _oDataModelPath$targe4.SemanticKey) || [];
    let bIsUsedInNavigationWithQuickViewFacets = false;
    aNavigationProperties.forEach(oNavProp => {
      if (oNavProp.referentialConstraint && oNavProp.referentialConstraint.length) {
        oNavProp.referentialConstraint.forEach(oRefConstraint => {
          if ((oRefConstraint === null || oRefConstraint === void 0 ? void 0 : oRefConstraint.sourceProperty) === oProperty.name) {
            var _oNavProp$targetType, _oNavProp$targetType$, _oNavProp$targetType$2;
            if (oNavProp !== null && oNavProp !== void 0 && (_oNavProp$targetType = oNavProp.targetType) !== null && _oNavProp$targetType !== void 0 && (_oNavProp$targetType$ = _oNavProp$targetType.annotations) !== null && _oNavProp$targetType$ !== void 0 && (_oNavProp$targetType$2 = _oNavProp$targetType$.UI) !== null && _oNavProp$targetType$2 !== void 0 && _oNavProp$targetType$2.QuickViewFacets) {
              bIsUsedInNavigationWithQuickViewFacets = true;
            }
          }
        });
      }
    });
    if (((_oDataModelPath$conte = oDataModelPath.contextLocation) === null || _oDataModelPath$conte === void 0 ? void 0 : _oDataModelPath$conte.targetEntitySet) !== oDataModelPath.targetEntitySet) {
      var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
      const aIsTargetSemanticKey = aSemanticObjects.some(function (oSemantic) {
        var _oSemantic$$target;
        return (oSemantic === null || oSemantic === void 0 ? void 0 : (_oSemantic$$target = oSemantic.$target) === null || _oSemantic$$target === void 0 ? void 0 : _oSemantic$$target.name) === oProperty.name;
      });
      if ((aIsTargetSemanticKey || oProperty.isKey) && oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe5 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.UI) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.QuickViewFacets) {
        bIsUsedInNavigationWithQuickViewFacets = true;
      }
    }
    return bIsUsedInNavigationWithQuickViewFacets;
  };
  _exports.isUsedInNavigationWithQuickViewFacets = isUsedInNavigationWithQuickViewFacets;
  const isRetrieveTextFromValueListEnabled = function (oPropertyPath, fieldFormatOptions) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    const oProperty = isPathAnnotationExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath;
    if (!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Common) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.Text) && !((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.Measures) && PropertyHelper.hasValueHelp(oProperty) && fieldFormatOptions.textAlignMode === "Form") {
      return true;
    }
    return false;
  };

  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation we are evaluating.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is set when using an analytical table.
   * @returns An expression that you can bind to the UI.
   */
  _exports.isRetrieveTextFromValueListEnabled = isRetrieveTextFromValueListEnabled;
  const getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat7, _targetObject$annotat8, _propertyValue$annota, _propertyValue$annota2;
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
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    const isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    const isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return compileExpression(and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat7 = targetObject.annotations) === null || _targetObject$annotat7 === void 0 ? void 0 : (_targetObject$annotat8 = _targetObject$annotat7.UI) === null || _targetObject$annotat8 === void 0 ? void 0 : _targetObject$annotat8.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]));
  };
  _exports.getVisibleExpression = getVisibleExpression;
  const QVTextBinding = function (oPropertyDataModelObjectPath, oPropertyValueDataModelObjectPath, fieldFormatOptions) {
    let asObject = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let returnValue = getValueBinding(oPropertyDataModelObjectPath, fieldFormatOptions, asObject);
    if (returnValue === "") {
      returnValue = getTextBinding(oPropertyValueDataModelObjectPath, fieldFormatOptions, asObject);
    }
    return returnValue;
  };
  _exports.QVTextBinding = QVTextBinding;
  const getQuickViewType = function (oPropertyDataModelObjectPath) {
    var _targetObject$$target, _targetObject$$target2, _targetObject$$target3, _targetObject$$target4, _targetObject$$target5, _targetObject$$target6;
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target = targetObject.$target) !== null && _targetObject$$target !== void 0 && (_targetObject$$target2 = _targetObject$$target.annotations) !== null && _targetObject$$target2 !== void 0 && (_targetObject$$target3 = _targetObject$$target2.Communication) !== null && _targetObject$$target3 !== void 0 && _targetObject$$target3.IsEmailAddress) {
      return "email";
    }
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target4 = targetObject.$target) !== null && _targetObject$$target4 !== void 0 && (_targetObject$$target5 = _targetObject$$target4.annotations) !== null && _targetObject$$target5 !== void 0 && (_targetObject$$target6 = _targetObject$$target5.Communication) !== null && _targetObject$$target6 !== void 0 && _targetObject$$target6.IsPhoneNumber) {
      return "phone";
    }
    return "text";
  };
  _exports.getQuickViewType = getQuickViewType;
  /**
   * Get the customData key value pair of SemanticObjects.
   *
   * @param propertyAnnotations The value of the Common annotation.
   * @param [dynamicSemanticObjectsOnly] Flag for retrieving dynamic Semantic Objects only.
   * @returns The array of the semantic Objects.
   */
  const getSemanticObjectExpressionToResolve = function (propertyAnnotations, dynamicSemanticObjectsOnly) {
    const aSemObjExprToResolve = [];
    let sSemObjExpression;
    let annotation;
    if (propertyAnnotations) {
      const semanticObjectsKeys = Object.keys(propertyAnnotations).filter(function (element) {
        return element === "SemanticObject" || element.startsWith("SemanticObject#");
      });
      for (const semanticObject of semanticObjectsKeys) {
        annotation = propertyAnnotations[semanticObject];
        sSemObjExpression = compileExpression(getExpressionFromAnnotation(annotation));
        if (!dynamicSemanticObjectsOnly || dynamicSemanticObjectsOnly && isPathAnnotationExpression(annotation)) {
          aSemObjExprToResolve.push({
            key: getDynamicPathFromSemanticObject(sSemObjExpression) || sSemObjExpression,
            value: sSemObjExpression
          });
        }
      }
    }
    return aSemObjExprToResolve;
  };
  _exports.getSemanticObjectExpressionToResolve = getSemanticObjectExpressionToResolve;
  const getSemanticObjects = function (aSemObjExprToResolve) {
    if (aSemObjExprToResolve.length > 0) {
      let sCustomDataKey = "";
      let sCustomDataValue = "";
      const aSemObjCustomData = [];
      for (let iSemObjCount = 0; iSemObjCount < aSemObjExprToResolve.length; iSemObjCount++) {
        sCustomDataKey = aSemObjExprToResolve[iSemObjCount].key;
        sCustomDataValue = compileExpression(getExpressionFromAnnotation(aSemObjExprToResolve[iSemObjCount].value));
        aSemObjCustomData.push({
          key: sCustomDataKey,
          value: sCustomDataValue
        });
      }
      const oSemanticObjectsModel = new JSONModel(aSemObjCustomData);
      oSemanticObjectsModel.$$valueAsPromise = true;
      const oSemObjBindingContext = oSemanticObjectsModel.createBindingContext("/");
      return oSemObjBindingContext;
    } else {
      return new JSONModel([]).createBindingContext("/");
    }
  };

  /**
   * Method to get MultipleLines for a DataField.
   *
   * @name getMultipleLinesForDataField
   * @param {any} oThis The current object
   * @param {string} sPropertyType The property type
   * @param {boolean} isMultiLineText The property isMultiLineText
   * @returns {CompiledBindingToolkitExpression<string>} The binding expression to determine if a data field should be a MultiLineText or not
   * @public
   */
  _exports.getSemanticObjects = getSemanticObjects;
  const getMultipleLinesForDataField = function (oThis, sPropertyType, isMultiLineText) {
    if (oThis.wrap === false) {
      return false;
    }
    if (sPropertyType !== "Edm.String") {
      return isMultiLineText;
    }
    if (oThis.editMode === "Display") {
      return true;
    }
    if (oThis.editMode.indexOf("{") > -1) {
      // If the editMode is computed then we just care about the page editMode to determine if the multiline property should be taken into account
      return compileExpression(or(not(UI.IsEditable), isMultiLineText));
    }
    return isMultiLineText;
  };
  _exports.getMultipleLinesForDataField = getMultipleLinesForDataField;
  const _hasValueHelpToShow = function (oProperty, measureDisplayMode) {
    // we show a value help if teh property has one or if its visible unit has one
    const oPropertyUnit = PropertyHelper.getAssociatedUnitProperty(oProperty);
    const oPropertyCurrency = PropertyHelper.getAssociatedCurrencyProperty(oProperty);
    return PropertyHelper.hasValueHelp(oProperty) && oProperty.type !== "Edm.Boolean" || measureDisplayMode !== "Hidden" && (oPropertyUnit && PropertyHelper.hasValueHelp(oPropertyUnit) || oPropertyCurrency && PropertyHelper.hasValueHelp(oPropertyCurrency));
  };

  /**
   * Sets Edit Style properties for Field in case of Macro Field and MassEditDialog fields.
   *
   * @param oProps Field Properties for the Macro Field.
   * @param oDataField DataField Object.
   * @param oDataModelPath DataModel Object Path to the property.
   * @param onlyEditStyle To add only editStyle.
   */
  const setEditStyleProperties = function (oProps, oDataField, oDataModelPath, onlyEditStyle) {
    var _oDataField$Target, _oDataField$Target$$t, _oProps$formatOptions, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12;
    const oProperty = oDataModelPath.targetObject;
    if (!isProperty(oProperty)) {
      oProps.editStyle = null;
      return;
    }
    if (!onlyEditStyle) {
      oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions);
    }
    switch (oDataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataPointType":
        if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        oProps.editStyle = null;
        return;
      default:
    }
    if (_hasValueHelpToShow(oProperty, (_oProps$formatOptions = oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.measureDisplayMode)) {
      if (!onlyEditStyle) {
        var _oProps$formatOptions2;
        oProps.textBindingExpression = getAssociatedTextBinding(oDataModelPath, oProps.formatOptions);
        if (((_oProps$formatOptions2 = oProps.formatOptions) === null || _oProps$formatOptions2 === void 0 ? void 0 : _oProps$formatOptions2.measureDisplayMode) !== "Hidden") {
          // for the MDC Field we need to keep the unit inside the valueBindingExpression
          oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions, false, false, undefined, false, true);
        }
      }
      oProps.editStyle = "InputWithValueHelp";
      return;
    }
    switch (oProperty.type) {
      case "Edm.Date":
        oProps.editStyle = "DatePicker";
        return;
      case "Edm.Time":
      case "Edm.TimeOfDay":
        oProps.editStyle = "TimePicker";
        return;
      case "Edm.DateTime":
      case "Edm.DateTimeOffset":
        oProps.editStyle = "DateTimePicker";
        // No timezone defined. Also for compatibility reasons.
        if (!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Common) !== null && _oProperty$annotation5 !== void 0 && _oProperty$annotation5.Timezone)) {
          oProps.showTimezone = undefined;
        } else {
          oProps.showTimezone = true;
        }
        return;
      case "Edm.Boolean":
        oProps.editStyle = "CheckBox";
        return;
      case "Edm.Stream":
        oProps.editStyle = "File";
        return;
      case "Edm.String":
        if ((_oProperty$annotation6 = oProperty.annotations) !== null && _oProperty$annotation6 !== void 0 && (_oProperty$annotation7 = _oProperty$annotation6.UI) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.MultiLineText) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.valueOf()) {
          oProps.editStyle = "TextArea";
          if (!(onlyEditStyle ?? false)) {
            var _oDataField$annotatio, _oDataField$annotatio2, _oDataField$Value, _oDataField$Value$$ta, _oDataField$Value$$ta2, _oDataField$Value$$ta3;
            const textAreaPlaceholder = ((_oDataField$annotatio = oDataField.annotations) === null || _oDataField$annotatio === void 0 ? void 0 : (_oDataField$annotatio2 = _oDataField$annotatio.UI) === null || _oDataField$annotatio2 === void 0 ? void 0 : _oDataField$annotatio2.Placeholder) || ((_oDataField$Value = oDataField.Value) === null || _oDataField$Value === void 0 ? void 0 : (_oDataField$Value$$ta = _oDataField$Value.$target) === null || _oDataField$Value$$ta === void 0 ? void 0 : (_oDataField$Value$$ta2 = _oDataField$Value$$ta.annotations) === null || _oDataField$Value$$ta2 === void 0 ? void 0 : (_oDataField$Value$$ta3 = _oDataField$Value$$ta2.UI) === null || _oDataField$Value$$ta3 === void 0 ? void 0 : _oDataField$Value$$ta3.Placeholder);
            if (textAreaPlaceholder) {
              oProps.textAreaPlaceholder = compileExpression(getExpressionFromAnnotation(textAreaPlaceholder));
            }
          }
          return;
        }
        break;
      default:
        oProps.editStyle = "Input";
    }
    if ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.Measures) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.ISOCurrency || (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Measures) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.Unit) {
      if (!onlyEditStyle) {
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.descriptionBindingExpression = UIFormatters.ifUnitEditable(oProperty, "", UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        const unitProperty = PropertyHelper.getAssociatedCurrencyProperty(oProperty) || PropertyHelper.getAssociatedUnitProperty(oProperty);
        oProps.unitEditable = compileExpression(not(isReadOnlyExpression(unitProperty)));
      }
      oProps.editStyle = "InputWithUnit";
      return;
    }
    oProps.editStyle = "Input";
  };
  _exports.setEditStyleProperties = setEditStyleProperties;
  const hasSemanticObjectInNavigationOrProperty = propertyDataModelObjectPath => {
    var _propertyDataModelObj, _propertyDataModelObj2, _propertyDataModelObj3, _propertyDataModelObj4;
    const property = propertyDataModelObjectPath.targetObject;
    if (SemanticObjectHelper.hasSemanticObject(property)) {
      return true;
    }
    const lastNavProp = propertyDataModelObjectPath !== null && propertyDataModelObjectPath !== void 0 && (_propertyDataModelObj = propertyDataModelObjectPath.navigationProperties) !== null && _propertyDataModelObj !== void 0 && _propertyDataModelObj.length ? propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : propertyDataModelObjectPath.navigationProperties[(propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : (_propertyDataModelObj2 = propertyDataModelObjectPath.navigationProperties) === null || _propertyDataModelObj2 === void 0 ? void 0 : _propertyDataModelObj2.length) - 1] : null;
    if (!lastNavProp || (_propertyDataModelObj3 = propertyDataModelObjectPath.contextLocation) !== null && _propertyDataModelObj3 !== void 0 && (_propertyDataModelObj4 = _propertyDataModelObj3.navigationProperties) !== null && _propertyDataModelObj4 !== void 0 && _propertyDataModelObj4.find(contextNavProp => contextNavProp.name === lastNavProp.name)) {
      return false;
    }
    return SemanticObjectHelper.hasSemanticObject(lastNavProp);
  };

  /**
   * Get the dataModelObjectPath with the value property as targetObject if it exists
   * for a dataModelObjectPath targeting a DataField or a DataPoint annotation.
   *
   * @param initialDataModelObjectPath
   * @returns The dataModelObjectPath targetiing the value property or undefined
   */
  _exports.hasSemanticObjectInNavigationOrProperty = hasSemanticObjectInNavigationOrProperty;
  const getDataModelObjectPathForValue = initialDataModelObjectPath => {
    if (!initialDataModelObjectPath.targetObject) {
      return undefined;
    }
    let valuePath = "";
    // data point annotations need not have $Type defined, so add it if missing
    if (initialDataModelObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.DataPoint") {
      initialDataModelObjectPath.targetObject.$Type = initialDataModelObjectPath.targetObject.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
    }
    switch (initialDataModelObjectPath.targetObject.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataPointType":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (typeof initialDataModelObjectPath.targetObject.Value === "object") {
          valuePath = initialDataModelObjectPath.targetObject.Value.path;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (initialDataModelObjectPath.targetObject.Target.$target) {
          if (initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataField" || initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
            if (initialDataModelObjectPath.targetObject.Target.value.indexOf("/") > 0) {
              var _initialDataModelObje;
              valuePath = initialDataModelObjectPath.targetObject.Target.value.replace(/\/@.*/, `/${(_initialDataModelObje = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje === void 0 ? void 0 : _initialDataModelObje.path}`);
            } else {
              var _initialDataModelObje2;
              valuePath = (_initialDataModelObje2 = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje2 === void 0 ? void 0 : _initialDataModelObje2.path;
            }
          } else {
            var _initialDataModelObje3;
            valuePath = (_initialDataModelObje3 = initialDataModelObjectPath.targetObject.Target) === null || _initialDataModelObje3 === void 0 ? void 0 : _initialDataModelObje3.path;
          }
        }
        break;
    }
    if (valuePath && valuePath.length > 0) {
      return enhanceDataModelPath(initialDataModelObjectPath, valuePath);
    } else {
      return undefined;
    }
  };

  /**
   * Get the property or the navigation property in  its relative path that holds semanticObject annotation if it exists.
   *
   * @param dataModelObjectPath
   * @returns A property or a NavProperty or undefined
   */
  _exports.getDataModelObjectPathForValue = getDataModelObjectPathForValue;
  const getPropertyWithSemanticObject = dataModelObjectPath => {
    let propertyWithSemanticObject;
    if (hasSemanticObject(dataModelObjectPath.targetObject)) {
      propertyWithSemanticObject = dataModelObjectPath.targetObject;
    } else if (dataModelObjectPath.navigationProperties.length > 0) {
      // there are no semantic objects on the property itself so we look for some on nav properties
      for (const navProperty of dataModelObjectPath.navigationProperties) {
        var _dataModelObjectPath$;
        if (!((_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.navigationProperties.find(contextNavProp => contextNavProp.fullyQualifiedName === navProperty.fullyQualifiedName)) && !propertyWithSemanticObject && hasSemanticObject(navProperty)) {
          propertyWithSemanticObject = navProperty;
        }
      }
    }
    return propertyWithSemanticObject;
  };
  _exports.getPropertyWithSemanticObject = getPropertyWithSemanticObject;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uIiwiYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UiLCJmdWxsQ29udGV4dFBhdGgiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImV4cHJlc3Npb24iLCJvdXRFeHByZXNzaW9uIiwibW9kZWxOYW1lIiwidW5kZWZpbmVkIiwib1Byb3BlcnR5RGF0YU1vZGVsUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwicGF0aCIsIkNvbW1vbkZvcm1hdHRlcnMiLCJnZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudCIsImZvcm1hdFZhbHVlUmVjdXJzaXZlbHkiLCJmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uIiwidGFyZ2V0T2JqZWN0IiwiZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpZWxkRm9ybWF0T3B0aW9ucyIsImdldFRleHRCaW5kaW5nIiwiYXNPYmplY3QiLCIkVHlwZSIsImZpZWxkVmFsdWUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJWYWx1ZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCIkdGFyZ2V0Iiwib0JpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwib1RhcmdldEJpbmRpbmciLCJhbm5vdGF0aW9ucyIsIk1lYXN1cmVzIiwiVW5pdCIsIklTT0N1cnJlbmN5IiwiVUlGb3JtYXR0ZXJzIiwiZ2V0QmluZGluZ1dpdGhVbml0T3JDdXJyZW5jeSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsImlzQ29tcGxleFR5cGVFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsInNob3dNZWFzdXJlIiwiQ29tbW9uIiwiVGltZXpvbmUiLCJnZXRCaW5kaW5nV2l0aFRpbWV6b25lIiwiZGF0ZUZvcm1hdE9wdGlvbnMiLCJnZXRWYWx1ZUJpbmRpbmciLCJpZ25vcmVVbml0IiwiaWdub3JlRm9ybWF0dGluZyIsImJpbmRpbmdQYXJhbWV0ZXJzIiwidGFyZ2V0VHlwZUFueSIsImtlZXBVbml0Iiwib05hdlBhdGgiLCJ0YXJnZXRFbnRpdHlUeXBlIiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJ2aXNpdGVkT2JqZWN0cyIsImZvckVhY2giLCJvTmF2T2JqIiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsInB1c2giLCJpc1Byb3BlcnR5IiwiaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24iLCJDb21tdW5pY2F0aW9uIiwiSXNFbWFpbEFkZHJlc3MiLCJ0eXBlIiwib1RpbWV6b25lIiwicGFyc2VLZWVwc0VtcHR5U3RyaW5nIiwiY29uc3RyYWludHMiLCJwYXJhbWV0ZXJzIiwidGFyZ2V0VHlwZSIsImdldEFzc29jaWF0ZWRUZXh0QmluZGluZyIsInRleHRQcm9wZXJ0eVBhdGgiLCJQcm9wZXJ0eUhlbHBlciIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwib1RleHRQcm9wZXJ0eVBhdGgiLCIkJG5vUGF0Y2giLCJpc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzIiwib0RhdGFNb2RlbFBhdGgiLCJvUHJvcGVydHkiLCJhTmF2aWdhdGlvblByb3BlcnRpZXMiLCJhU2VtYW50aWNPYmplY3RzIiwiU2VtYW50aWNLZXkiLCJiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsIm9OYXZQcm9wIiwicmVmZXJlbnRpYWxDb25zdHJhaW50IiwibGVuZ3RoIiwib1JlZkNvbnN0cmFpbnQiLCJzb3VyY2VQcm9wZXJ0eSIsIm5hbWUiLCJVSSIsIlF1aWNrVmlld0ZhY2V0cyIsImNvbnRleHRMb2NhdGlvbiIsInRhcmdldEVudGl0eVNldCIsImFJc1RhcmdldFNlbWFudGljS2V5Iiwic29tZSIsIm9TZW1hbnRpYyIsImlzS2V5IiwiaXNSZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0RW5hYmxlZCIsIm9Qcm9wZXJ0eVBhdGgiLCJUZXh0IiwiaGFzVmFsdWVIZWxwIiwidGV4dEFsaWduTW9kZSIsImdldFZpc2libGVFeHByZXNzaW9uIiwiZGF0YUZpZWxkTW9kZWxQYXRoIiwicHJvcGVydHlWYWx1ZSIsIlRhcmdldCIsImlzQW5hbHl0aWNhbEdyb3VwSGVhZGVyRXhwYW5kZWQiLCJpc0FuYWx5dGljcyIsIklzRXhwYW5kZWQiLCJjb25zdGFudCIsImlzQW5hbHl0aWNhbExlYWYiLCJlcXVhbCIsIk5vZGVMZXZlbCIsImFuZCIsIm5vdCIsIkhpZGRlbiIsImlmRWxzZSIsIm9yIiwiUVZUZXh0QmluZGluZyIsIm9Qcm9wZXJ0eVZhbHVlRGF0YU1vZGVsT2JqZWN0UGF0aCIsInJldHVyblZhbHVlIiwiZ2V0UXVpY2tWaWV3VHlwZSIsIklzUGhvbmVOdW1iZXIiLCJnZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUiLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiZHluYW1pY1NlbWFudGljT2JqZWN0c09ubHkiLCJhU2VtT2JqRXhwclRvUmVzb2x2ZSIsInNTZW1PYmpFeHByZXNzaW9uIiwiYW5ub3RhdGlvbiIsInNlbWFudGljT2JqZWN0c0tleXMiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwiZWxlbWVudCIsInN0YXJ0c1dpdGgiLCJzZW1hbnRpY09iamVjdCIsImtleSIsImdldER5bmFtaWNQYXRoRnJvbVNlbWFudGljT2JqZWN0IiwidmFsdWUiLCJnZXRTZW1hbnRpY09iamVjdHMiLCJzQ3VzdG9tRGF0YUtleSIsInNDdXN0b21EYXRhVmFsdWUiLCJhU2VtT2JqQ3VzdG9tRGF0YSIsImlTZW1PYmpDb3VudCIsIm9TZW1hbnRpY09iamVjdHNNb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJvU2VtT2JqQmluZGluZ0NvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldE11bHRpcGxlTGluZXNGb3JEYXRhRmllbGQiLCJvVGhpcyIsInNQcm9wZXJ0eVR5cGUiLCJpc011bHRpTGluZVRleHQiLCJ3cmFwIiwiZWRpdE1vZGUiLCJpbmRleE9mIiwiSXNFZGl0YWJsZSIsIl9oYXNWYWx1ZUhlbHBUb1Nob3ciLCJvUHJvcGVydHlVbml0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUN1cnJlbmN5IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIiwib1Byb3BzIiwib0RhdGFGaWVsZCIsIm9ubHlFZGl0U3R5bGUiLCJlZGl0U3R5bGUiLCJ2YWx1ZUJpbmRpbmdFeHByZXNzaW9uIiwiVmlzdWFsaXphdGlvbiIsInRleHRCaW5kaW5nRXhwcmVzc2lvbiIsInNob3dUaW1lem9uZSIsIk11bHRpTGluZVRleHQiLCJ2YWx1ZU9mIiwidGV4dEFyZWFQbGFjZWhvbGRlciIsIlBsYWNlaG9sZGVyIiwidW5pdEJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiZGVzY3JpcHRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImlmVW5pdEVkaXRhYmxlIiwidW5pdFByb3BlcnR5IiwidW5pdEVkaXRhYmxlIiwiaXNSZWFkT25seUV4cHJlc3Npb24iLCJoYXNTZW1hbnRpY09iamVjdEluTmF2aWdhdGlvbk9yUHJvcGVydHkiLCJwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgiLCJwcm9wZXJ0eSIsIlNlbWFudGljT2JqZWN0SGVscGVyIiwiaGFzU2VtYW50aWNPYmplY3QiLCJsYXN0TmF2UHJvcCIsImZpbmQiLCJjb250ZXh0TmF2UHJvcCIsImdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JWYWx1ZSIsImluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoIiwidmFsdWVQYXRoIiwidGVybSIsInJlcGxhY2UiLCJnZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCIsIm5hdlByb3BlcnR5IiwiZnVsbHlRdWFsaWZpZWROYW1lIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZFRlbXBsYXRpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOYXZpZ2F0aW9uUHJvcGVydHksIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIERhdGFGaWVsZFdpdGhVcmwsIERhdGFQb2ludFR5cGVUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbixcblx0aXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24sXG5cdG5vdCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHR0cmFuc2Zvcm1SZWN1cnNpdmVseVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgaXNOYXZpZ2F0aW9uUHJvcGVydHksIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0ICogYXMgQ29tbW9uRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Db21tb25Gb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGlzUmVhZE9ubHlFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmllbGRDb250cm9sSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBQcm9wZXJ0eUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0ICogYXMgU2VtYW50aWNPYmplY3RIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcbmltcG9ydCB7IGdldER5bmFtaWNQYXRoRnJvbVNlbWFudGljT2JqZWN0LCBoYXNTZW1hbnRpY09iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlNb2RlLCBQcm9wZXJ0eU9yUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0ICogYXMgVUlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBGaWVsZFByb3BlcnRpZXMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9JbnRlcm5hbEZpZWxkLmJsb2NrXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBhZGQgdGhlIHRleHQgYXJyYW5nZW1lbnQgdG8gYSBiaW5kaW5nIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gYmUgZW5oYW5jZWRcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGN1cnJlbnQgY29udGV4dCBwYXRoIHdlJ3JlIG9uICh0byBwcm9wZXJseSByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnRpZXMpXG4gKiBAcmV0dXJucyBBbiB1cGRhdGVkIGV4cHJlc3Npb24gY29udGFpbmluZyB0aGUgdGV4dCBhcnJhbmdlbWVudCBiaW5kaW5nLlxuICovXG5leHBvcnQgY29uc3QgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0YmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2U6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+LFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0cmV0dXJuIHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlLCBcIlBhdGhJbk1vZGVsXCIsIChleHByZXNzaW9uKSA9PiB7XG5cdFx0bGV0IG91dEV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gZXhwcmVzc2lvbjtcblx0XHRpZiAoZXhwcmVzc2lvbi5tb2RlbE5hbWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBkZWZhdWx0IG1vZGVsIHdlIHRoZW4gbmVlZCB0byByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnR5XG5cdFx0XHRjb25zdCBvUHJvcGVydHlEYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBleHByZXNzaW9uLnBhdGgpO1xuXHRcdFx0b3V0RXhwcmVzc2lvbiA9IENvbW1vbkZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUZXh0QXJyYW5nZW1lbnQob1Byb3BlcnR5RGF0YU1vZGVsUGF0aCwgZXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5ID0gZnVuY3Rpb24gKFxuXHRiaW5kaW5nRXhwcmVzc2lvblRvRW5oYW5jZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4ge1xuXHRyZXR1cm4gdHJhbnNmb3JtUmVjdXJzaXZlbHkoYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UsIFwiUGF0aEluTW9kZWxcIiwgKGV4cHJlc3Npb24pID0+IHtcblx0XHRsZXQgb3V0RXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBleHByZXNzaW9uO1xuXHRcdGlmIChleHByZXNzaW9uLm1vZGVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRlZmF1bHQgbW9kZWwgd2UgdGhlbiBuZWVkIHRvIHJlc29sdmUgdGhlIHRleHQgYXJyYW5nZW1lbnQgcHJvcGVydHlcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChmdWxsQ29udGV4dFBhdGgsIGV4cHJlc3Npb24ucGF0aCk7XG5cdFx0XHRvdXRFeHByZXNzaW9uID0gZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbihvUHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCwgZXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9KTtcbn07XG5leHBvcnQgY29uc3QgZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgZGlzcGxheU1vZGU/OiBEaXNwbGF5TW9kZTsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH1cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHtcblx0cmV0dXJuIGdldFRleHRCaW5kaW5nKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgdHJ1ZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz47XG59O1xuZXhwb3J0IGNvbnN0IGdldFRleHRCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHtcblx0XHRkaXNwbGF5TW9kZT86IERpc3BsYXlNb2RlO1xuXHRcdG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZztcblx0XHRkYXRlRm9ybWF0T3B0aW9ucz86IHsgc2hvd1RpbWU6IHN0cmluZzsgc2hvd0RhdGU6IHN0cmluZzsgc2hvd1RpbWV6b25lOiBzdHJpbmcgfTtcblx0fSxcblx0YXNPYmplY3Q6IGJvb2xlYW4gPSBmYWxzZVxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmIChcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIiB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiXG5cdCkge1xuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHJlc29sdmVkIHByb3BlcnR5LCB0aGUgdmFsdWUgaXMgcmV0dXJuZWQgYXMgYSBjb25zdGFudFxuXHRcdGNvbnN0IGZpZWxkVmFsdWUgPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWUpID8/IFwiXCI7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZpZWxkVmFsdWUpO1xuXHR9XG5cdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXRoKTtcblx0fVxuXHRjb25zdCBvQmluZGluZ0V4cHJlc3Npb24gPSBwYXRoSW5Nb2RlbChnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpKTtcblx0bGV0IG9UYXJnZXRCaW5kaW5nO1xuXHRpZiAoXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5XG5cdCkge1xuXHRcdG9UYXJnZXRCaW5kaW5nID0gVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdXaXRoVW5pdE9yQ3VycmVuY3kob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgb0JpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRpZiAoZmllbGRGb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiSGlkZGVuXCIgJiYgaXNDb21wbGV4VHlwZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpKSB7XG5cdFx0XHQvLyBUT0RPOiBSZWZhY3RvciBvbmNlIHR5cGVzIGFyZSBsZXNzIGdlbmVyaWMgaGVyZVxuXHRcdFx0b1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0Li4ub1RhcmdldEJpbmRpbmcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0c2hvd01lYXN1cmU6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIGlmIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRpbWV6b25lKFxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbixcblx0XHRcdGZhbHNlLFxuXHRcdFx0dHJ1ZSxcblx0XHRcdGZpZWxkRm9ybWF0T3B0aW9ucy5kYXRlRm9ybWF0T3B0aW9uc1xuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0b1RhcmdldEJpbmRpbmcgPSBDb21tb25Gb3JtYXR0ZXJzLmdldEJpbmRpbmdXaXRoVGV4dEFycmFuZ2VtZW50KFxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbixcblx0XHRcdGZpZWxkRm9ybWF0T3B0aW9uc1xuXHRcdCk7XG5cdH1cblx0aWYgKGFzT2JqZWN0KSB7XG5cdFx0cmV0dXJuIG9UYXJnZXRCaW5kaW5nO1xuXHR9XG5cdC8vIFdlIGRvbid0IGluY2x1ZGUgJCRub3BhdGNoIGFuZCBwYXJzZUtlZXBFbXB0eVN0cmluZyBhcyB0aGV5IG1ha2Ugbm8gc2Vuc2UgaW4gdGhlIHRleHQgYmluZGluZyBjYXNlXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvVGFyZ2V0QmluZGluZyk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VmFsdWVCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH0sXG5cdGlnbm9yZVVuaXQ6IGJvb2xlYW4gPSBmYWxzZSxcblx0aWdub3JlRm9ybWF0dGluZzogYm9vbGVhbiA9IGZhbHNlLFxuXHRiaW5kaW5nUGFyYW1ldGVycz86IG9iamVjdCxcblx0dGFyZ2V0VHlwZUFueSA9IGZhbHNlLFxuXHRrZWVwVW5pdCA9IGZhbHNlXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdGNvbnN0IG9OYXZQYXRoID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnBhdGgsIHRydWUpO1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ID0gb05hdlBhdGgudGFyZ2V0O1xuXHRcdG9OYXZQYXRoLnZpc2l0ZWRPYmplY3RzLmZvckVhY2goKG9OYXZPYmo6IGFueSkgPT4ge1xuXHRcdFx0aWYgKGlzTmF2aWdhdGlvblByb3BlcnR5KG9OYXZPYmopKSB7XG5cdFx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChvTmF2T2JqKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGNvbnN0IHRhcmdldE9iamVjdCA9IG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRpZiAoaXNQcm9wZXJ0eSh0YXJnZXRPYmplY3QpKSB7XG5cdFx0bGV0IG9CaW5kaW5nRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBwYXRoSW5Nb2RlbChcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aClcblx0XHQpO1xuXHRcdGlmIChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pKSB7XG5cdFx0XHRpZiAodGFyZ2V0T2JqZWN0LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcykge1xuXHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24udHlwZSA9IFwic2FwLmZlLmNvcmUudHlwZS5FbWFpbFwiO1xuXHRcdFx0fSBlbHNlIGlmICghaWdub3JlVW5pdCAmJiAodGFyZ2V0T2JqZWN0LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgdGFyZ2V0T2JqZWN0LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCkpIHtcblx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdXaXRoVW5pdE9yQ3VycmVuY3koXG5cdFx0XHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRrZWVwVW5pdCA/IHVuZGVmaW5lZCA6IHsgc2hvd01lYXN1cmU6IGZhbHNlIH1cblx0XHRcdFx0KSBhcyBhbnk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvVGltZXpvbmUgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblx0XHRcdFx0aWYgKG9UaW1lem9uZSkge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRpbWV6b25lKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIG9CaW5kaW5nRXhwcmVzc2lvbiwgdHJ1ZSkgYXMgYW55O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbiA9IGZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24odGFyZ2V0T2JqZWN0LCBvQmluZGluZ0V4cHJlc3Npb24pIGFzIGFueTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKSAmJiBvQmluZGluZ0V4cHJlc3Npb24udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIikge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cGFyc2VLZWVwc0VtcHR5U3RyaW5nOiB0cnVlXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGlzUGF0aEluTW9kZWxFeHByZXNzaW9uKG9CaW5kaW5nRXhwcmVzc2lvbikpIHtcblx0XHRcdFx0aWYgKGlnbm9yZUZvcm1hdHRpbmcpIHtcblx0XHRcdFx0XHRkZWxldGUgb0JpbmRpbmdFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnM7XG5cdFx0XHRcdFx0ZGVsZXRlIG9CaW5kaW5nRXhwcmVzc2lvbi5jb25zdHJhaW50cztcblx0XHRcdFx0XHRkZWxldGUgb0JpbmRpbmdFeHByZXNzaW9uLnR5cGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGJpbmRpbmdQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLnBhcmFtZXRlcnMgPSBiaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGFyZ2V0VHlwZUFueSkge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbi50YXJnZXRUeXBlID0gXCJhbnlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG9CaW5kaW5nRXhwcmVzc2lvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIHNvbWVob3cgd2UgY291bGQgbm90IGNvbXBpbGUgdGhlIGJpbmRpbmcgLT4gcmV0dXJuIGVtcHR5IHN0cmluZ1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKFxuXHRcdHRhcmdldE9iamVjdD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmwgfHxcblx0XHR0YXJnZXRPYmplY3Q/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcblx0KSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbigodGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZFdpdGhVcmwpLlZhbHVlKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGV4dEJpbmRpbmcgPSBmdW5jdGlvbiAoXG5cdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdGZpZWxkRm9ybWF0T3B0aW9uczogeyBtZWFzdXJlRGlzcGxheU1vZGU/OiBzdHJpbmcgfVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCB0ZXh0UHJvcGVydHlQYXRoID0gUHJvcGVydHlIZWxwZXIuZ2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpO1xuXHRpZiAodGV4dFByb3BlcnR5UGF0aCkge1xuXHRcdGNvbnN0IG9UZXh0UHJvcGVydHlQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgdGV4dFByb3BlcnR5UGF0aCk7XG5cdFx0cmV0dXJuIGdldFZhbHVlQmluZGluZyhvVGV4dFByb3BlcnR5UGF0aCwgZmllbGRGb3JtYXRPcHRpb25zLCB0cnVlLCB0cnVlLCB7ICQkbm9QYXRjaDogdHJ1ZSB9KTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMgPSBmdW5jdGlvbiAob0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0Y29uc3QgYU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gb0RhdGFNb2RlbFBhdGg/LnRhcmdldEVudGl0eVR5cGU/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzIHx8IFtdO1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RzID0gb0RhdGFNb2RlbFBhdGg/LnRhcmdldEVudGl0eVR5cGU/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljS2V5IHx8IFtdO1xuXHRsZXQgYklzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMgPSBmYWxzZTtcblx0YU5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZvckVhY2goKG9OYXZQcm9wOiBOYXZpZ2F0aW9uUHJvcGVydHkpID0+IHtcblx0XHRpZiAob05hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50ICYmIG9OYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludC5sZW5ndGgpIHtcblx0XHRcdG9OYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludC5mb3JFYWNoKChvUmVmQ29uc3RyYWludCkgPT4ge1xuXHRcdFx0XHRpZiAob1JlZkNvbnN0cmFpbnQ/LnNvdXJjZVByb3BlcnR5ID09PSBvUHJvcGVydHkubmFtZSkge1xuXHRcdFx0XHRcdGlmIChvTmF2UHJvcD8udGFyZ2V0VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5RdWlja1ZpZXdGYWNldHMpIHtcblx0XHRcdFx0XHRcdGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdGlmIChvRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldCAhPT0gb0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0Y29uc3QgYUlzVGFyZ2V0U2VtYW50aWNLZXkgPSBhU2VtYW50aWNPYmplY3RzLnNvbWUoZnVuY3Rpb24gKG9TZW1hbnRpYykge1xuXHRcdFx0cmV0dXJuIG9TZW1hbnRpYz8uJHRhcmdldD8ubmFtZSA9PT0gb1Byb3BlcnR5Lm5hbWU7XG5cdFx0fSk7XG5cdFx0aWYgKChhSXNUYXJnZXRTZW1hbnRpY0tleSB8fCBvUHJvcGVydHkuaXNLZXkpICYmIG9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlF1aWNrVmlld0ZhY2V0cykge1xuXHRcdFx0YklzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYklzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHM7XG59O1xuXG5leHBvcnQgY29uc3QgaXNSZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0RW5hYmxlZCA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5UGF0aDogUHJvcGVydHlPclBhdGg8UHJvcGVydHk+LFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgZGlzcGxheU1vZGU/OiBEaXNwbGF5TW9kZTsgdGV4dEFsaWduTW9kZT86IHN0cmluZyB9XG4pOiBib29sZWFuIHtcblx0Y29uc3Qgb1Byb3BlcnR5OiBQcm9wZXJ0eSA9IChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihvUHJvcGVydHlQYXRoKSAmJiBvUHJvcGVydHlQYXRoLiR0YXJnZXQpIHx8IChvUHJvcGVydHlQYXRoIGFzIFByb3BlcnR5KTtcblx0aWYgKFxuXHRcdCFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCAmJlxuXHRcdCFvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzICYmXG5cdFx0UHJvcGVydHlIZWxwZXIuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eSkgJiZcblx0XHRmaWVsZEZvcm1hdE9wdGlvbnMudGV4dEFsaWduTW9kZSA9PT0gXCJGb3JtXCJcblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZXZhbHVhdGUgdGhlIHZpc2liaWxpdHkgb2YgYSBEYXRhRmllbGQgb3IgRGF0YVBvaW50IGFubm90YXRpb24uXG4gKlxuICogU0FQIEZpb3JpIGVsZW1lbnRzIHdpbGwgZXZhbHVhdGUgZWl0aGVyIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBkZWZpbmVkIG9uIHRoZSBhbm5vdGF0aW9uIGl0c2VsZiBvciBvbiB0aGUgdGFyZ2V0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRNb2RlbFBhdGggVGhlIG1ldGFwYXRoIHJlZmVycmluZyB0byB0aGUgYW5ub3RhdGlvbiB3ZSBhcmUgZXZhbHVhdGluZy5cbiAqIEBwYXJhbSBbZm9ybWF0T3B0aW9uc10gRm9ybWF0T3B0aW9ucyBvcHRpb25hbC5cbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmlzQW5hbHl0aWNzIFRoaXMgZmxhZyBpcyBzZXQgd2hlbiB1c2luZyBhbiBhbmFseXRpY2FsIHRhYmxlLlxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiB0aGF0IHlvdSBjYW4gYmluZCB0byB0aGUgVUkuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWaXNpYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0ZGF0YUZpZWxkTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmb3JtYXRPcHRpb25zPzogeyBpc0FuYWx5dGljcz86IGJvb2xlYW4gfVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCB0YXJnZXRPYmplY3Q6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMgPSBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRsZXQgcHJvcGVydHlWYWx1ZTtcblx0aWYgKHRhcmdldE9iamVjdCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHQvLyBpZiBpdCBpcyBhIERhdGFGaWVsZEZvckFubm90YXRpb24gcG9pbnRpbmcgdG8gYSBEYXRhUG9pbnQgd2UgbG9vayBhdCB0aGUgZGF0YVBvaW50J3MgdmFsdWVcblx0XHRcdFx0aWYgKHRhcmdldE9iamVjdD8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB0YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQ/LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1mYWxsdGhyb3VnaFxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IGlzQW5hbHl0aWNhbEdyb3VwSGVhZGVyRXhwYW5kZWQgPSBmb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/IFVJLklzRXhwYW5kZWQgOiBjb25zdGFudChmYWxzZSk7XG5cdGNvbnN0IGlzQW5hbHl0aWNhbExlYWYgPSBmb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/IGVxdWFsKFVJLk5vZGVMZXZlbCwgMCkgOiBjb25zdGFudChmYWxzZSk7XG5cblx0Ly8gQSBkYXRhIGZpZWxkIGlzIHZpc2libGUgaWY6XG5cdC8vIC0gdGhlIFVJLkhpZGRlbiBleHByZXNzaW9uIGluIHRoZSBvcmlnaW5hbCBhbm5vdGF0aW9uIGRvZXMgbm90IGV2YWx1YXRlIHRvICd0cnVlJ1xuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgdGFyZ2V0IHByb3BlcnR5IGRvZXMgbm90IGV2YWx1YXRlIHRvICd0cnVlJ1xuXHQvLyAtIGluIGNhc2Ugb2YgQW5hbHl0aWNzIGl0J3Mgbm90IHZpc2libGUgZm9yIGFuIGV4cGFuZGVkIEdyb3VwSGVhZGVyXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRhbmQoXG5cdFx0XHQuLi5bXG5cdFx0XHRcdG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24odGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdCEhcHJvcGVydHlWYWx1ZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlICYmIG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocHJvcGVydHlWYWx1ZS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCksXG5cdFx0XHRcdG9yKG5vdChpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkKSwgaXNBbmFseXRpY2FsTGVhZilcblx0XHRcdF1cblx0XHQpXG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgUVZUZXh0QmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgZGlzcGxheU1vZGU/OiBEaXNwbGF5TW9kZTsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH0sXG5cdGFzT2JqZWN0OiBib29sZWFuID0gZmFsc2Vcbikge1xuXHRsZXQgcmV0dXJuVmFsdWU6IGFueSA9IGdldFZhbHVlQmluZGluZyhvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIGFzT2JqZWN0KTtcblx0aWYgKHJldHVyblZhbHVlID09PSBcIlwiKSB7XG5cdFx0cmV0dXJuVmFsdWUgPSBnZXRUZXh0QmluZGluZyhvUHJvcGVydHlWYWx1ZURhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgYXNPYmplY3QpO1xuXHR9XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRRdWlja1ZpZXdUeXBlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBzdHJpbmcge1xuXHRjb25zdCB0YXJnZXRPYmplY3QgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0aWYgKHRhcmdldE9iamVjdD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzRW1haWxBZGRyZXNzKSB7XG5cdFx0cmV0dXJuIFwiZW1haWxcIjtcblx0fVxuXHRpZiAodGFyZ2V0T2JqZWN0Py4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNQaG9uZU51bWJlcikge1xuXHRcdHJldHVybiBcInBob25lXCI7XG5cdH1cblx0cmV0dXJuIFwidGV4dFwiO1xufTtcblxuZXhwb3J0IHR5cGUgU2VtYW50aWNPYmplY3RDdXN0b21EYXRhID0ge1xuXHRrZXk6IHN0cmluZztcblx0dmFsdWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBjdXN0b21EYXRhIGtleSB2YWx1ZSBwYWlyIG9mIFNlbWFudGljT2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlBbm5vdGF0aW9ucyBUaGUgdmFsdWUgb2YgdGhlIENvbW1vbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIFtkeW5hbWljU2VtYW50aWNPYmplY3RzT25seV0gRmxhZyBmb3IgcmV0cmlldmluZyBkeW5hbWljIFNlbWFudGljIE9iamVjdHMgb25seS5cbiAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiB0aGUgc2VtYW50aWMgT2JqZWN0cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlBbm5vdGF0aW9uczogYW55LFxuXHRkeW5hbWljU2VtYW50aWNPYmplY3RzT25seT86IGJvb2xlYW5cbik6IFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVtdIHtcblx0Y29uc3QgYVNlbU9iakV4cHJUb1Jlc29sdmU6IFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVtdID0gW107XG5cdGxldCBzU2VtT2JqRXhwcmVzc2lvbjogc3RyaW5nO1xuXHRsZXQgYW5ub3RhdGlvbjtcblx0aWYgKHByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRjb25zdCBzZW1hbnRpY09iamVjdHNLZXlzID0gT2JqZWN0LmtleXMocHJvcGVydHlBbm5vdGF0aW9ucykuZmlsdGVyKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCA9PT0gXCJTZW1hbnRpY09iamVjdFwiIHx8IGVsZW1lbnQuc3RhcnRzV2l0aChcIlNlbWFudGljT2JqZWN0I1wiKTtcblx0XHR9KTtcblx0XHRmb3IgKGNvbnN0IHNlbWFudGljT2JqZWN0IG9mIHNlbWFudGljT2JqZWN0c0tleXMpIHtcblx0XHRcdGFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zW3NlbWFudGljT2JqZWN0XTtcblx0XHRcdHNTZW1PYmpFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFubm90YXRpb24pKSBhcyBzdHJpbmc7XG5cdFx0XHRpZiAoIWR5bmFtaWNTZW1hbnRpY09iamVjdHNPbmx5IHx8IChkeW5hbWljU2VtYW50aWNPYmplY3RzT25seSAmJiBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihhbm5vdGF0aW9uKSkpIHtcblx0XHRcdFx0YVNlbU9iakV4cHJUb1Jlc29sdmUucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdChzU2VtT2JqRXhwcmVzc2lvbikgfHwgc1NlbU9iakV4cHJlc3Npb24sXG5cdFx0XHRcdFx0dmFsdWU6IHNTZW1PYmpFeHByZXNzaW9uXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYVNlbU9iakV4cHJUb1Jlc29sdmU7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2VtYW50aWNPYmplY3RzID0gZnVuY3Rpb24gKGFTZW1PYmpFeHByVG9SZXNvbHZlOiBhbnlbXSk6IGFueSB7XG5cdGlmIChhU2VtT2JqRXhwclRvUmVzb2x2ZS5sZW5ndGggPiAwKSB7XG5cdFx0bGV0IHNDdXN0b21EYXRhS2V5OiBzdHJpbmcgPSBcIlwiO1xuXHRcdGxldCBzQ3VzdG9tRGF0YVZhbHVlOiBhbnkgPSBcIlwiO1xuXHRcdGNvbnN0IGFTZW1PYmpDdXN0b21EYXRhOiBhbnlbXSA9IFtdO1xuXHRcdGZvciAobGV0IGlTZW1PYmpDb3VudCA9IDA7IGlTZW1PYmpDb3VudCA8IGFTZW1PYmpFeHByVG9SZXNvbHZlLmxlbmd0aDsgaVNlbU9iakNvdW50KyspIHtcblx0XHRcdHNDdXN0b21EYXRhS2V5ID0gYVNlbU9iakV4cHJUb1Jlc29sdmVbaVNlbU9iakNvdW50XS5rZXk7XG5cdFx0XHRzQ3VzdG9tRGF0YVZhbHVlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFTZW1PYmpFeHByVG9SZXNvbHZlW2lTZW1PYmpDb3VudF0udmFsdWUpKTtcblx0XHRcdGFTZW1PYmpDdXN0b21EYXRhLnB1c2goe1xuXHRcdFx0XHRrZXk6IHNDdXN0b21EYXRhS2V5LFxuXHRcdFx0XHR2YWx1ZTogc0N1c3RvbURhdGFWYWx1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdHNNb2RlbDogYW55ID0gbmV3IEpTT05Nb2RlbChhU2VtT2JqQ3VzdG9tRGF0YSk7XG5cdFx0b1NlbWFudGljT2JqZWN0c01vZGVsLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdGNvbnN0IG9TZW1PYmpCaW5kaW5nQ29udGV4dDogYW55ID0gb1NlbWFudGljT2JqZWN0c01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRyZXR1cm4gb1NlbU9iakJpbmRpbmdDb250ZXh0O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBuZXcgSlNPTk1vZGVsKFtdKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH1cbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGdldCBNdWx0aXBsZUxpbmVzIGZvciBhIERhdGFGaWVsZC5cbiAqXG4gKiBAbmFtZSBnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkXG4gKiBAcGFyYW0ge2FueX0gb1RoaXMgVGhlIGN1cnJlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gc1Byb3BlcnR5VHlwZSBUaGUgcHJvcGVydHkgdHlwZVxuICogQHBhcmFtIHtib29sZWFufSBpc011bHRpTGluZVRleHQgVGhlIHByb3BlcnR5IGlzTXVsdGlMaW5lVGV4dFxuICogQHJldHVybnMge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz59IFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZGV0ZXJtaW5lIGlmIGEgZGF0YSBmaWVsZCBzaG91bGQgYmUgYSBNdWx0aUxpbmVUZXh0IG9yIG5vdFxuICogQHB1YmxpY1xuICovXG5cbmV4cG9ydCBjb25zdCBnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkID0gZnVuY3Rpb24gKG9UaGlzOiBhbnksIHNQcm9wZXJ0eVR5cGU6IHN0cmluZywgaXNNdWx0aUxpbmVUZXh0OiBib29sZWFuKTogYW55IHtcblx0aWYgKG9UaGlzLndyYXAgPT09IGZhbHNlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmIChzUHJvcGVydHlUeXBlICE9PSBcIkVkbS5TdHJpbmdcIikge1xuXHRcdHJldHVybiBpc011bHRpTGluZVRleHQ7XG5cdH1cblx0aWYgKG9UaGlzLmVkaXRNb2RlID09PSBcIkRpc3BsYXlcIikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmIChvVGhpcy5lZGl0TW9kZS5pbmRleE9mKFwie1wiKSA+IC0xKSB7XG5cdFx0Ly8gSWYgdGhlIGVkaXRNb2RlIGlzIGNvbXB1dGVkIHRoZW4gd2UganVzdCBjYXJlIGFib3V0IHRoZSBwYWdlIGVkaXRNb2RlIHRvIGRldGVybWluZSBpZiB0aGUgbXVsdGlsaW5lIHByb3BlcnR5IHNob3VsZCBiZSB0YWtlbiBpbnRvIGFjY291bnRcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob3Iobm90KFVJLklzRWRpdGFibGUpLCBpc011bHRpTGluZVRleHQpKTtcblx0fVxuXHRyZXR1cm4gaXNNdWx0aUxpbmVUZXh0O1xufTtcblxuY29uc3QgX2hhc1ZhbHVlSGVscFRvU2hvdyA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5LCBtZWFzdXJlRGlzcGxheU1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHQvLyB3ZSBzaG93IGEgdmFsdWUgaGVscCBpZiB0ZWggcHJvcGVydHkgaGFzIG9uZSBvciBpZiBpdHMgdmlzaWJsZSB1bml0IGhhcyBvbmVcblx0Y29uc3Qgb1Byb3BlcnR5VW5pdCA9IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0Y29uc3Qgb1Byb3BlcnR5Q3VycmVuY3kgPSBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpO1xuXHRyZXR1cm4gKFxuXHRcdChQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5KSAmJiBvUHJvcGVydHkudHlwZSAhPT0gXCJFZG0uQm9vbGVhblwiKSB8fFxuXHRcdChtZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIgJiZcblx0XHRcdCgob1Byb3BlcnR5VW5pdCAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5VW5pdCkpIHx8XG5cdFx0XHRcdChvUHJvcGVydHlDdXJyZW5jeSAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5Q3VycmVuY3kpKSkpXG5cdCk7XG59O1xuXG4vKipcbiAqIFNldHMgRWRpdCBTdHlsZSBwcm9wZXJ0aWVzIGZvciBGaWVsZCBpbiBjYXNlIG9mIE1hY3JvIEZpZWxkIGFuZCBNYXNzRWRpdERpYWxvZyBmaWVsZHMuXG4gKlxuICogQHBhcmFtIG9Qcm9wcyBGaWVsZCBQcm9wZXJ0aWVzIGZvciB0aGUgTWFjcm8gRmllbGQuXG4gKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhRmllbGQgT2JqZWN0LlxuICogQHBhcmFtIG9EYXRhTW9kZWxQYXRoIERhdGFNb2RlbCBPYmplY3QgUGF0aCB0byB0aGUgcHJvcGVydHkuXG4gKiBAcGFyYW0gb25seUVkaXRTdHlsZSBUbyBhZGQgb25seSBlZGl0U3R5bGUuXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKFxuXHRvUHJvcHM6IEZpZWxkUHJvcGVydGllcyxcblx0b0RhdGFGaWVsZDogYW55LFxuXHRvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b25seUVkaXRTdHlsZT86IGJvb2xlYW5cbik6IHZvaWQge1xuXHRjb25zdCBvUHJvcGVydHkgPSBvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3Q7XG5cdGlmICghaXNQcm9wZXJ0eShvUHJvcGVydHkpKSB7XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IG51bGw7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGlmICghb25seUVkaXRTdHlsZSkge1xuXHRcdG9Qcm9wcy52YWx1ZUJpbmRpbmdFeHByZXNzaW9uID0gZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBvUHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cdH1cblxuXHRzd2l0Y2ggKG9EYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LlZpc3VhbGl6YXRpb24gPT09IFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpIHtcblx0XHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiUmF0aW5nSW5kaWNhdG9yXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdGlmIChvRGF0YUZpZWxkPy5WaXN1YWxpemF0aW9uID09PSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlJhdGluZ0luZGljYXRvclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBudWxsO1xuXHRcdFx0cmV0dXJuO1xuXHRcdGRlZmF1bHQ6XG5cdH1cblx0aWYgKF9oYXNWYWx1ZUhlbHBUb1Nob3cob1Byb3BlcnR5LCBvUHJvcHMuZm9ybWF0T3B0aW9ucz8ubWVhc3VyZURpc3BsYXlNb2RlKSkge1xuXHRcdGlmICghb25seUVkaXRTdHlsZSkge1xuXHRcdFx0b1Byb3BzLnRleHRCaW5kaW5nRXhwcmVzc2lvbiA9IGdldEFzc29jaWF0ZWRUZXh0QmluZGluZyhvRGF0YU1vZGVsUGF0aCwgb1Byb3BzLmZvcm1hdE9wdGlvbnMpO1xuXHRcdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zPy5tZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIpIHtcblx0XHRcdFx0Ly8gZm9yIHRoZSBNREMgRmllbGQgd2UgbmVlZCB0byBrZWVwIHRoZSB1bml0IGluc2lkZSB0aGUgdmFsdWVCaW5kaW5nRXhwcmVzc2lvblxuXHRcdFx0XHRvUHJvcHMudmFsdWVCaW5kaW5nRXhwcmVzc2lvbiA9IGdldFZhbHVlQmluZGluZyhvRGF0YU1vZGVsUGF0aCwgb1Byb3BzLmZvcm1hdE9wdGlvbnMsIGZhbHNlLCBmYWxzZSwgdW5kZWZpbmVkLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIklucHV0V2l0aFZhbHVlSGVscFwiO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHN3aXRjaCAob1Byb3BlcnR5LnR5cGUpIHtcblx0XHRjYXNlIFwiRWRtLkRhdGVcIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkRhdGVQaWNrZXJcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLlRpbWVcIjpcblx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiVGltZVBpY2tlclwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVcIjpcblx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJEYXRlVGltZVBpY2tlclwiO1xuXHRcdFx0Ly8gTm8gdGltZXpvbmUgZGVmaW5lZC4gQWxzbyBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuXHRcdFx0aWYgKCFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpIHtcblx0XHRcdFx0b1Byb3BzLnNob3dUaW1lem9uZSA9IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9wcy5zaG93VGltZXpvbmUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiQ2hlY2tCb3hcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLlN0cmVhbVwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiRmlsZVwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdGNhc2UgXCJFZG0uU3RyaW5nXCI6XG5cdFx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5VST8uTXVsdGlMaW5lVGV4dD8udmFsdWVPZigpKSB7XG5cdFx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlRleHRBcmVhXCI7XG5cdFx0XHRcdGlmICghKG9ubHlFZGl0U3R5bGUgPz8gZmFsc2UpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGV4dEFyZWFQbGFjZWhvbGRlciA9XG5cdFx0XHRcdFx0XHRvRGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uUGxhY2Vob2xkZXIgfHwgb0RhdGFGaWVsZC5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LlVJPy5QbGFjZWhvbGRlcjtcblxuXHRcdFx0XHRcdGlmICh0ZXh0QXJlYVBsYWNlaG9sZGVyKSB7XG5cdFx0XHRcdFx0XHRvUHJvcHMudGV4dEFyZWFQbGFjZWhvbGRlciA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih0ZXh0QXJlYVBsYWNlaG9sZGVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJJbnB1dFwiO1xuXHR9XG5cdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSB8fCBvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0KSB7XG5cdFx0aWYgKCFvbmx5RWRpdFN0eWxlKSB7XG5cdFx0XHRvUHJvcHMudW5pdEJpbmRpbmdFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeShvRGF0YU1vZGVsUGF0aCkpO1xuXHRcdFx0b1Byb3BzLmRlc2NyaXB0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuaWZVbml0RWRpdGFibGUoXG5cdFx0XHRcdG9Qcm9wZXJ0eSxcblx0XHRcdFx0XCJcIixcblx0XHRcdFx0VUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeShvRGF0YU1vZGVsUGF0aClcblx0XHRcdCk7XG5cdFx0XHRjb25zdCB1bml0UHJvcGVydHkgPVxuXHRcdFx0XHRQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpIHx8IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdG9Qcm9wcy51bml0RWRpdGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihub3QoaXNSZWFkT25seUV4cHJlc3Npb24odW5pdFByb3BlcnR5KSkpO1xuXHRcdH1cblx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJJbnB1dFdpdGhVbml0XCI7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRcIjtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNTZW1hbnRpY09iamVjdEluTmF2aWdhdGlvbk9yUHJvcGVydHkgPSAocHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB7XG5cdGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0aWYgKFNlbWFudGljT2JqZWN0SGVscGVyLmhhc1NlbWFudGljT2JqZWN0KHByb3BlcnR5KSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGNvbnN0IGxhc3ROYXZQcm9wID0gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoPy5uYXZpZ2F0aW9uUHJvcGVydGllcz8ubGVuZ3RoXG5cdFx0PyBwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzW3Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aD8ubmF2aWdhdGlvblByb3BlcnRpZXM/Lmxlbmd0aCAtIDFdXG5cdFx0OiBudWxsO1xuXHRpZiAoXG5cdFx0IWxhc3ROYXZQcm9wIHx8XG5cdFx0cHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXM/LmZpbmQoXG5cdFx0XHQoY29udGV4dE5hdlByb3ApID0+IGNvbnRleHROYXZQcm9wLm5hbWUgPT09IGxhc3ROYXZQcm9wLm5hbWVcblx0XHQpXG5cdCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gU2VtYW50aWNPYmplY3RIZWxwZXIuaGFzU2VtYW50aWNPYmplY3QobGFzdE5hdlByb3ApO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGRhdGFNb2RlbE9iamVjdFBhdGggd2l0aCB0aGUgdmFsdWUgcHJvcGVydHkgYXMgdGFyZ2V0T2JqZWN0IGlmIGl0IGV4aXN0c1xuICogZm9yIGEgZGF0YU1vZGVsT2JqZWN0UGF0aCB0YXJnZXRpbmcgYSBEYXRhRmllbGQgb3IgYSBEYXRhUG9pbnQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEByZXR1cm5zIFRoZSBkYXRhTW9kZWxPYmplY3RQYXRoIHRhcmdldGlpbmcgdGhlIHZhbHVlIHByb3BlcnR5IG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlID0gKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCA9PiB7XG5cdGlmICghaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRsZXQgdmFsdWVQYXRoID0gXCJcIjtcblx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdGlmIChpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikge1xuXHRcdGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kVHlwZSA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kVHlwZSB8fCBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlO1xuXHR9XG5cdHN3aXRjaCAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0aWYgKHR5cGVvZiBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0dmFsdWVQYXRoID0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLnBhdGg7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRpZiAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0KSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fFxuXHRcdFx0XHRcdGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQuJHRhcmdldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRpZiAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC52YWx1ZS5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdFx0XHRcdHZhbHVlUGF0aCA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQudmFsdWUucmVwbGFjZShcblx0XHRcdFx0XHRcdFx0L1xcL0AuKi8sXG5cdFx0XHRcdFx0XHRcdGAvJHtpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuVmFsdWU/LnBhdGh9YFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFsdWVQYXRoID0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0LlZhbHVlPy5wYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZVBhdGggPSBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0Py5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGlmICh2YWx1ZVBhdGggJiYgdmFsdWVQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gZW5oYW5jZURhdGFNb2RlbFBhdGgoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgsIHZhbHVlUGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuLyoqXG4gKiBHZXQgdGhlIHByb3BlcnR5IG9yIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGluICBpdHMgcmVsYXRpdmUgcGF0aCB0aGF0IGhvbGRzIHNlbWFudGljT2JqZWN0IGFubm90YXRpb24gaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcmV0dXJucyBBIHByb3BlcnR5IG9yIGEgTmF2UHJvcGVydHkgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB7XG5cdGxldCBwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQ7XG5cdGlmIChoYXNTZW1hbnRpY09iamVjdChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSkpIHtcblx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5O1xuXHR9IGVsc2UgaWYgKGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdC8vIHRoZXJlIGFyZSBubyBzZW1hbnRpYyBvYmplY3RzIG9uIHRoZSBwcm9wZXJ0eSBpdHNlbGYgc28gd2UgbG9vayBmb3Igc29tZSBvbiBuYXYgcHJvcGVydGllc1xuXHRcdGZvciAoY29uc3QgbmF2UHJvcGVydHkgb2YgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHRcdFx0KGNvbnRleHROYXZQcm9wKSA9PiBjb250ZXh0TmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWUgPT09IG5hdlByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHQpICYmXG5cdFx0XHRcdCFwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRoYXNTZW1hbnRpY09iamVjdChuYXZQcm9wZXJ0eSlcblx0XHRcdCkge1xuXHRcdFx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IG5hdlByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Q7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFpQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxxQ0FBcUMsR0FBRyxVQUNwREMsMEJBQXlELEVBQ3pEQyxlQUFvQyxFQUNKO0lBQ2hDLE9BQU9DLG9CQUFvQixDQUFDRiwwQkFBMEIsRUFBRSxhQUFhLEVBQUdHLFVBQVUsSUFBSztNQUN0RixJQUFJQyxhQUE0QyxHQUFHRCxVQUFVO01BQzdELElBQUlBLFVBQVUsQ0FBQ0UsU0FBUyxLQUFLQyxTQUFTLEVBQUU7UUFDdkM7UUFDQSxNQUFNQyxzQkFBc0IsR0FBR0Msb0JBQW9CLENBQUNQLGVBQWUsRUFBRUUsVUFBVSxDQUFDTSxJQUFJLENBQUM7UUFDckZMLGFBQWEsR0FBR00sZ0JBQWdCLENBQUNDLDZCQUE2QixDQUFDSixzQkFBc0IsRUFBRUosVUFBVSxDQUFDO01BQ25HO01BQ0EsT0FBT0MsYUFBYTtJQUNyQixDQUFDLENBQUM7RUFDSCxDQUFDO0VBQUM7RUFFSyxNQUFNUSxzQkFBc0IsR0FBRyxVQUNyQ1osMEJBQXlELEVBQ3pEQyxlQUFvQyxFQUNKO0lBQ2hDLE9BQU9DLG9CQUFvQixDQUFDRiwwQkFBMEIsRUFBRSxhQUFhLEVBQUdHLFVBQVUsSUFBSztNQUN0RixJQUFJQyxhQUE0QyxHQUFHRCxVQUFVO01BQzdELElBQUlBLFVBQVUsQ0FBQ0UsU0FBUyxLQUFLQyxTQUFTLEVBQUU7UUFDdkM7UUFDQSxNQUFNQyxzQkFBc0IsR0FBR0Msb0JBQW9CLENBQUNQLGVBQWUsRUFBRUUsVUFBVSxDQUFDTSxJQUFJLENBQUM7UUFDckZMLGFBQWEsR0FBR1MseUJBQXlCLENBQUNOLHNCQUFzQixDQUFDTyxZQUFZLEVBQUVYLFVBQVUsQ0FBQztNQUMzRjtNQUNBLE9BQU9DLGFBQWE7SUFDckIsQ0FBQyxDQUFDO0VBQ0gsQ0FBQztFQUFDO0VBQ0ssTUFBTVcsd0JBQXdCLEdBQUcsVUFDdkNDLDRCQUFpRCxFQUNqREMsa0JBQThFLEVBQzNDO0lBQ25DLE9BQU9DLGNBQWMsQ0FBQ0YsNEJBQTRCLEVBQUVDLGtCQUFrQixFQUFFLElBQUksQ0FBQztFQUM5RSxDQUFDO0VBQUM7RUFDSyxNQUFNQyxjQUFjLEdBQUcsVUFDN0JGLDRCQUFpRCxFQUNqREMsa0JBSUMsRUFFcUU7SUFBQTtJQUFBLElBRHRFRSxRQUFpQix1RUFBRyxLQUFLO0lBRXpCLElBQ0MsMEJBQUFILDRCQUE0QixDQUFDRixZQUFZLDBEQUF6QyxzQkFBMkNNLEtBQUssTUFBSyxzQ0FBc0MsSUFDM0YsMkJBQUFKLDRCQUE0QixDQUFDRixZQUFZLDJEQUF6Qyx1QkFBMkNNLEtBQUssTUFBSywwQ0FBMEMsSUFDL0YsMkJBQUFKLDRCQUE0QixDQUFDRixZQUFZLDJEQUF6Qyx1QkFBMkNNLEtBQUssTUFBSyx3REFBd0QsSUFDN0csMkJBQUFKLDRCQUE0QixDQUFDRixZQUFZLDJEQUF6Qyx1QkFBMkNNLEtBQUssTUFBSyw2Q0FBNkMsSUFDbEcsMkJBQUFKLDRCQUE0QixDQUFDRixZQUFZLDJEQUF6Qyx1QkFBMkNNLEtBQUssTUFBSywrREFBK0QsSUFDcEgsMkJBQUFKLDRCQUE0QixDQUFDRixZQUFZLDJEQUF6Qyx1QkFBMkNNLEtBQUssTUFBSyxnREFBZ0QsRUFDcEc7TUFDRDtNQUNBLE1BQU1DLFVBQVUsR0FBR0MsMkJBQTJCLENBQUNOLDRCQUE0QixDQUFDRixZQUFZLENBQUNTLEtBQUssQ0FBQyxJQUFJLEVBQUU7TUFDckcsT0FBT0MsaUJBQWlCLENBQUNILFVBQVUsQ0FBQztJQUNyQztJQUNBLElBQUlJLDBCQUEwQixDQUFDVCw0QkFBNEIsQ0FBQ0YsWUFBWSxDQUFDLElBQUlFLDRCQUE0QixDQUFDRixZQUFZLENBQUNZLE9BQU8sRUFBRTtNQUMvSFYsNEJBQTRCLEdBQUdSLG9CQUFvQixDQUFDUSw0QkFBNEIsRUFBRUEsNEJBQTRCLENBQUNGLFlBQVksQ0FBQ0wsSUFBSSxDQUFDO0lBQ2xJO0lBQ0EsTUFBTWtCLGtCQUFrQixHQUFHQyxXQUFXLENBQUNDLGtDQUFrQyxDQUFDYiw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3hHLElBQUljLGNBQWM7SUFDbEIsSUFDQywwQkFBQWQsNEJBQTRCLENBQUNGLFlBQVksNkVBQXpDLHVCQUEyQ2lCLFdBQVcsNkVBQXRELHVCQUF3REMsUUFBUSxtREFBaEUsdUJBQWtFQyxJQUFJLCtCQUN0RWpCLDRCQUE0QixDQUFDRixZQUFZLCtFQUF6Qyx3QkFBMkNpQixXQUFXLCtFQUF0RCx3QkFBd0RDLFFBQVEsb0RBQWhFLHdCQUFrRUUsV0FBVyxFQUM1RTtNQUNESixjQUFjLEdBQUdLLFlBQVksQ0FBQ0MsNEJBQTRCLENBQUNwQiw0QkFBNEIsRUFBRVcsa0JBQWtCLENBQUM7TUFDNUcsSUFBSSxDQUFBVixrQkFBa0IsYUFBbEJBLGtCQUFrQix1QkFBbEJBLGtCQUFrQixDQUFFb0Isa0JBQWtCLE1BQUssUUFBUSxJQUFJQyx1QkFBdUIsQ0FBQ1IsY0FBYyxDQUFDLEVBQUU7UUFDbkc7UUFDQUEsY0FBYyxDQUFDUyxhQUFhLEdBQUc7VUFDOUIsR0FBR1QsY0FBYyxDQUFDUyxhQUFhO1VBQy9CQyxXQUFXLEVBQUU7UUFDZCxDQUFDO01BQ0Y7SUFDRCxDQUFDLE1BQU0sK0JBQUl4Qiw0QkFBNEIsQ0FBQ0YsWUFBWSwrRUFBekMsd0JBQTJDaUIsV0FBVywrRUFBdEQsd0JBQXdEVSxNQUFNLG9EQUE5RCx3QkFBZ0VDLFFBQVEsRUFBRTtNQUNwRlosY0FBYyxHQUFHSyxZQUFZLENBQUNRLHNCQUFzQixDQUNuRDNCLDRCQUE0QixFQUM1Qlcsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxJQUFJLEVBQ0pWLGtCQUFrQixDQUFDMkIsaUJBQWlCLENBQ3BDO0lBQ0YsQ0FBQyxNQUFNO01BQ05kLGNBQWMsR0FBR3BCLGdCQUFnQixDQUFDQyw2QkFBNkIsQ0FDOURLLDRCQUE0QixFQUM1Qlcsa0JBQWtCLEVBQ2xCVixrQkFBa0IsQ0FDbEI7SUFDRjtJQUNBLElBQUlFLFFBQVEsRUFBRTtNQUNiLE9BQU9XLGNBQWM7SUFDdEI7SUFDQTtJQUNBLE9BQU9OLGlCQUFpQixDQUFDTSxjQUFjLENBQUM7RUFDekMsQ0FBQztFQUFDO0VBRUssTUFBTWUsZUFBZSxHQUFHLFVBQzlCN0IsNEJBQWlELEVBQ2pEQyxrQkFBbUQsRUFNaEI7SUFBQSxJQUxuQzZCLFVBQW1CLHVFQUFHLEtBQUs7SUFBQSxJQUMzQkMsZ0JBQXlCLHVFQUFHLEtBQUs7SUFBQSxJQUNqQ0MsaUJBQTBCO0lBQUEsSUFDMUJDLGFBQWEsdUVBQUcsS0FBSztJQUFBLElBQ3JCQyxRQUFRLHVFQUFHLEtBQUs7SUFFaEIsSUFBSXpCLDBCQUEwQixDQUFDVCw0QkFBNEIsQ0FBQ0YsWUFBWSxDQUFDLElBQUlFLDRCQUE0QixDQUFDRixZQUFZLENBQUNZLE9BQU8sRUFBRTtNQUMvSCxNQUFNeUIsUUFBUSxHQUFHbkMsNEJBQTRCLENBQUNvQyxnQkFBZ0IsQ0FBQ0MsV0FBVyxDQUFDckMsNEJBQTRCLENBQUNGLFlBQVksQ0FBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQztNQUNoSU8sNEJBQTRCLENBQUNGLFlBQVksR0FBR3FDLFFBQVEsQ0FBQ0csTUFBTTtNQUMzREgsUUFBUSxDQUFDSSxjQUFjLENBQUNDLE9BQU8sQ0FBRUMsT0FBWSxJQUFLO1FBQ2pELElBQUlDLG9CQUFvQixDQUFDRCxPQUFPLENBQUMsRUFBRTtVQUNsQ3pDLDRCQUE0QixDQUFDMkMsb0JBQW9CLENBQUNDLElBQUksQ0FBQ0gsT0FBTyxDQUFDO1FBQ2hFO01BQ0QsQ0FBQyxDQUFDO0lBQ0g7SUFFQSxNQUFNM0MsWUFBWSxHQUFHRSw0QkFBNEIsQ0FBQ0YsWUFBWTtJQUM5RCxJQUFJK0MsVUFBVSxDQUFDL0MsWUFBWSxDQUFDLEVBQUU7TUFDN0IsSUFBSWEsa0JBQWlELEdBQUdDLFdBQVcsQ0FDbEVDLGtDQUFrQyxDQUFDYiw0QkFBNEIsQ0FBQyxDQUNoRTtNQUNELElBQUk4Qyx1QkFBdUIsQ0FBQ25DLGtCQUFrQixDQUFDLEVBQUU7UUFBQTtRQUNoRCw2QkFBSWIsWUFBWSxDQUFDaUIsV0FBVyw0RUFBeEIsc0JBQTBCZ0MsYUFBYSxtREFBdkMsdUJBQXlDQyxjQUFjLEVBQUU7VUFDNURyQyxrQkFBa0IsQ0FBQ3NDLElBQUksR0FBRyx3QkFBd0I7UUFDbkQsQ0FBQyxNQUFNLElBQUksQ0FBQ25CLFVBQVUsS0FBSywwQkFBQWhDLFlBQVksQ0FBQ2lCLFdBQVcsNkVBQXhCLHVCQUEwQkMsUUFBUSxtREFBbEMsdUJBQW9DRSxXQUFXLDhCQUFJcEIsWUFBWSxDQUFDaUIsV0FBVyw2RUFBeEIsdUJBQTBCQyxRQUFRLG1EQUFsQyx1QkFBb0NDLElBQUksQ0FBQyxFQUFFO1VBQ3hITixrQkFBa0IsR0FBR1EsWUFBWSxDQUFDQyw0QkFBNEIsQ0FDN0RwQiw0QkFBNEIsRUFDNUJXLGtCQUFrQixFQUNsQixJQUFJLEVBQ0p1QixRQUFRLEdBQUc1QyxTQUFTLEdBQUc7WUFBRWtDLFdBQVcsRUFBRTtVQUFNLENBQUMsQ0FDdEM7UUFDVCxDQUFDLE1BQU07VUFBQTtVQUNOLE1BQU0wQixTQUFTLDhCQUFHbEQsNEJBQTRCLENBQUNGLFlBQVksQ0FBQ2lCLFdBQVcsdUZBQXJELHdCQUF1RFUsTUFBTSw0REFBN0Qsd0JBQStEQyxRQUFRO1VBQ3pGLElBQUl3QixTQUFTLEVBQUU7WUFDZHZDLGtCQUFrQixHQUFHUSxZQUFZLENBQUNRLHNCQUFzQixDQUFDM0IsNEJBQTRCLEVBQUVXLGtCQUFrQixFQUFFLElBQUksQ0FBUTtVQUN4SCxDQUFDLE1BQU07WUFDTkEsa0JBQWtCLEdBQUdkLHlCQUF5QixDQUFDQyxZQUFZLEVBQUVhLGtCQUFrQixDQUFRO1VBQ3hGO1VBQ0EsSUFBSW1DLHVCQUF1QixDQUFDbkMsa0JBQWtCLENBQUMsSUFBSUEsa0JBQWtCLENBQUNzQyxJQUFJLEtBQUssZ0NBQWdDLEVBQUU7WUFDaEh0QyxrQkFBa0IsQ0FBQ1ksYUFBYSxHQUFHO2NBQ2xDNEIscUJBQXFCLEVBQUU7WUFDeEIsQ0FBQztVQUNGO1FBQ0Q7UUFDQSxJQUFJTCx1QkFBdUIsQ0FBQ25DLGtCQUFrQixDQUFDLEVBQUU7VUFDaEQsSUFBSW9CLGdCQUFnQixFQUFFO1lBQ3JCLE9BQU9wQixrQkFBa0IsQ0FBQ1ksYUFBYTtZQUN2QyxPQUFPWixrQkFBa0IsQ0FBQ3lDLFdBQVc7WUFDckMsT0FBT3pDLGtCQUFrQixDQUFDc0MsSUFBSTtVQUMvQjtVQUNBLElBQUlqQixpQkFBaUIsRUFBRTtZQUN0QnJCLGtCQUFrQixDQUFDMEMsVUFBVSxHQUFHckIsaUJBQWlCO1VBQ2xEO1VBQ0EsSUFBSUMsYUFBYSxFQUFFO1lBQ2xCdEIsa0JBQWtCLENBQUMyQyxVQUFVLEdBQUcsS0FBSztVQUN0QztRQUNEO1FBQ0EsT0FBTzlDLGlCQUFpQixDQUFDRyxrQkFBa0IsQ0FBQztNQUM3QyxDQUFDLE1BQU07UUFDTjtRQUNBLE9BQU8sRUFBRTtNQUNWO0lBQ0QsQ0FBQyxNQUFNLElBQ04sQ0FBQWIsWUFBWSxhQUFaQSxZQUFZLHVCQUFaQSxZQUFZLENBQUVNLEtBQUssbURBQXVDLElBQzFELENBQUFOLFlBQVksYUFBWkEsWUFBWSx1QkFBWkEsWUFBWSxDQUFFTSxLQUFLLDhEQUFrRCxFQUNwRTtNQUNELE9BQU9JLGlCQUFpQixDQUFDRiwyQkFBMkIsQ0FBRVIsWUFBWSxDQUFzQlMsS0FBSyxDQUFDLENBQUM7SUFDaEcsQ0FBQyxNQUFNO01BQ04sT0FBTyxFQUFFO0lBQ1Y7RUFDRCxDQUFDO0VBQUM7RUFFSyxNQUFNZ0Qsd0JBQXdCLEdBQUcsVUFDdkN2RCw0QkFBaUQsRUFDakRDLGtCQUFtRCxFQUNoQjtJQUNuQyxNQUFNdUQsZ0JBQWdCLEdBQUdDLGNBQWMsQ0FBQ0MsNkJBQTZCLENBQUMxRCw0QkFBNEIsQ0FBQ0YsWUFBWSxDQUFDO0lBQ2hILElBQUkwRCxnQkFBZ0IsRUFBRTtNQUNyQixNQUFNRyxpQkFBaUIsR0FBR25FLG9CQUFvQixDQUFDUSw0QkFBNEIsRUFBRXdELGdCQUFnQixDQUFDO01BQzlGLE9BQU8zQixlQUFlLENBQUM4QixpQkFBaUIsRUFBRTFELGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7UUFBRTJELFNBQVMsRUFBRTtNQUFLLENBQUMsQ0FBQztJQUMvRjtJQUNBLE9BQU90RSxTQUFTO0VBQ2pCLENBQUM7RUFBQztFQUVLLE1BQU11RSxxQ0FBcUMsR0FBRyxVQUFVQyxjQUFtQyxFQUFFQyxTQUFtQixFQUFXO0lBQUE7SUFDakksTUFBTUMscUJBQXFCLEdBQUcsQ0FBQUYsY0FBYyxhQUFkQSxjQUFjLGdEQUFkQSxjQUFjLENBQUUxQixnQkFBZ0IsMERBQWhDLHNCQUFrQ08sb0JBQW9CLEtBQUksRUFBRTtJQUMxRixNQUFNc0IsZ0JBQWdCLEdBQUcsQ0FBQUgsY0FBYyxhQUFkQSxjQUFjLGlEQUFkQSxjQUFjLENBQUUxQixnQkFBZ0IscUZBQWhDLHVCQUFrQ3JCLFdBQVcscUZBQTdDLHVCQUErQ1UsTUFBTSwyREFBckQsdUJBQXVEeUMsV0FBVyxLQUFJLEVBQUU7SUFDakcsSUFBSUMsc0NBQXNDLEdBQUcsS0FBSztJQUNsREgscUJBQXFCLENBQUN4QixPQUFPLENBQUU0QixRQUE0QixJQUFLO01BQy9ELElBQUlBLFFBQVEsQ0FBQ0MscUJBQXFCLElBQUlELFFBQVEsQ0FBQ0MscUJBQXFCLENBQUNDLE1BQU0sRUFBRTtRQUM1RUYsUUFBUSxDQUFDQyxxQkFBcUIsQ0FBQzdCLE9BQU8sQ0FBRStCLGNBQWMsSUFBSztVQUMxRCxJQUFJLENBQUFBLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFQyxjQUFjLE1BQUtULFNBQVMsQ0FBQ1UsSUFBSSxFQUFFO1lBQUE7WUFDdEQsSUFBSUwsUUFBUSxhQUFSQSxRQUFRLHVDQUFSQSxRQUFRLENBQUVkLFVBQVUsMEVBQXBCLHFCQUFzQnZDLFdBQVcsNEVBQWpDLHNCQUFtQzJELEVBQUUsbURBQXJDLHVCQUF1Q0MsZUFBZSxFQUFFO2NBQzNEUixzQ0FBc0MsR0FBRyxJQUFJO1lBQzlDO1VBQ0Q7UUFDRCxDQUFDLENBQUM7TUFDSDtJQUNELENBQUMsQ0FBQztJQUNGLElBQUksMEJBQUFMLGNBQWMsQ0FBQ2MsZUFBZSwwREFBOUIsc0JBQWdDQyxlQUFlLE1BQUtmLGNBQWMsQ0FBQ2UsZUFBZSxFQUFFO01BQUE7TUFDdkYsTUFBTUMsb0JBQW9CLEdBQUdiLGdCQUFnQixDQUFDYyxJQUFJLENBQUMsVUFBVUMsU0FBUyxFQUFFO1FBQUE7UUFDdkUsT0FBTyxDQUFBQSxTQUFTLGFBQVRBLFNBQVMsNkNBQVRBLFNBQVMsQ0FBRXRFLE9BQU8sdURBQWxCLG1CQUFvQitELElBQUksTUFBS1YsU0FBUyxDQUFDVSxJQUFJO01BQ25ELENBQUMsQ0FBQztNQUNGLElBQUksQ0FBQ0ssb0JBQW9CLElBQUlmLFNBQVMsQ0FBQ2tCLEtBQUssS0FBS25CLGNBQWMsYUFBZEEsY0FBYyx5Q0FBZEEsY0FBYyxDQUFFMUIsZ0JBQWdCLDZFQUFoQyx1QkFBa0NyQixXQUFXLDZFQUE3Qyx1QkFBK0MyRCxFQUFFLG1EQUFqRCx1QkFBbURDLGVBQWUsRUFBRTtRQUNwSFIsc0NBQXNDLEdBQUcsSUFBSTtNQUM5QztJQUNEO0lBQ0EsT0FBT0Esc0NBQXNDO0VBQzlDLENBQUM7RUFBQztFQUVLLE1BQU1lLGtDQUFrQyxHQUFHLFVBQ2pEQyxhQUF1QyxFQUN2Q2xGLGtCQUF5RSxFQUMvRDtJQUFBO0lBQ1YsTUFBTThELFNBQW1CLEdBQUl0RCwwQkFBMEIsQ0FBQzBFLGFBQWEsQ0FBQyxJQUFJQSxhQUFhLENBQUN6RSxPQUFPLElBQU15RSxhQUEwQjtJQUMvSCxJQUNDLDJCQUFDcEIsU0FBUyxDQUFDaEQsV0FBVyw0RUFBckIsc0JBQXVCVSxNQUFNLG1EQUE3Qix1QkFBK0IyRCxJQUFJLEtBQ3BDLDRCQUFDckIsU0FBUyxDQUFDaEQsV0FBVyxtREFBckIsdUJBQXVCQyxRQUFRLEtBQ2hDeUMsY0FBYyxDQUFDNEIsWUFBWSxDQUFDdEIsU0FBUyxDQUFDLElBQ3RDOUQsa0JBQWtCLENBQUNxRixhQUFhLEtBQUssTUFBTSxFQUMxQztNQUNELE9BQU8sSUFBSTtJQUNaO0lBQ0EsT0FBTyxLQUFLO0VBQ2IsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVRBO0VBVU8sTUFBTUMsb0JBQW9CLEdBQUcsVUFDbkNDLGtCQUF1QyxFQUN2Q2pFLGFBQXlDLEVBQ047SUFBQTtJQUNuQyxNQUFNekIsWUFBeUQsR0FBRzBGLGtCQUFrQixDQUFDMUYsWUFBWTtJQUNqRyxJQUFJMkYsYUFBYTtJQUNqQixJQUFJM0YsWUFBWSxFQUFFO01BQ2pCLFFBQVFBLFlBQVksQ0FBQ00sS0FBSztRQUN6QjtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7VUFDQ3FGLGFBQWEsR0FBRzNGLFlBQVksQ0FBQ1MsS0FBSyxDQUFDRyxPQUFPO1VBQzFDO1FBQ0Q7VUFDQztVQUNBLElBQUksQ0FBQVosWUFBWSxhQUFaQSxZQUFZLCtDQUFaQSxZQUFZLENBQUU0RixNQUFNLGtGQUFwQixxQkFBc0JoRixPQUFPLDBEQUE3QixzQkFBK0JOLEtBQUssZ0RBQW9DLEVBQUU7WUFBQTtZQUM3RXFGLGFBQWEsNkJBQUczRixZQUFZLENBQUM0RixNQUFNLENBQUNoRixPQUFPLDJEQUEzQix1QkFBNkJILEtBQUssQ0FBQ0csT0FBTztZQUMxRDtVQUNEO1FBQ0Q7UUFDQTtRQUNBO1FBQ0E7VUFDQytFLGFBQWEsR0FBR25HLFNBQVM7TUFBQztJQUU3QjtJQUNBLE1BQU1xRywrQkFBK0IsR0FBR3BFLGFBQWEsYUFBYkEsYUFBYSxlQUFiQSxhQUFhLENBQUVxRSxXQUFXLEdBQUdsQixFQUFFLENBQUNtQixVQUFVLEdBQUdDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDcEcsTUFBTUMsZ0JBQWdCLEdBQUd4RSxhQUFhLGFBQWJBLGFBQWEsZUFBYkEsYUFBYSxDQUFFcUUsV0FBVyxHQUFHSSxLQUFLLENBQUN0QixFQUFFLENBQUN1QixTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUdILFFBQVEsQ0FBQyxLQUFLLENBQUM7O0lBRTlGO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsT0FBT3RGLGlCQUFpQixDQUN2QjBGLEdBQUcsQ0FDRixHQUFHLENBQ0ZDLEdBQUcsQ0FBQ0gsS0FBSyxDQUFDMUYsMkJBQTJCLENBQUNSLFlBQVksYUFBWkEsWUFBWSxpREFBWkEsWUFBWSxDQUFFaUIsV0FBVyxxRkFBekIsdUJBQTJCMkQsRUFBRSwyREFBN0IsdUJBQStCMEIsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFDcEZDLE1BQU0sQ0FDTCxDQUFDLENBQUNaLGFBQWEsRUFDZkEsYUFBYSxJQUFJVSxHQUFHLENBQUNILEtBQUssQ0FBQzFGLDJCQUEyQiwwQkFBQ21GLGFBQWEsQ0FBQzFFLFdBQVcsb0ZBQXpCLHNCQUEyQjJELEVBQUUsMkRBQTdCLHVCQUErQjBCLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ3JHLElBQUksQ0FDSixFQUNERSxFQUFFLENBQUNILEdBQUcsQ0FBQ1IsK0JBQStCLENBQUMsRUFBRUksZ0JBQWdCLENBQUMsQ0FDMUQsQ0FDRCxDQUNEO0VBQ0YsQ0FBQztFQUFDO0VBRUssTUFBTVEsYUFBYSxHQUFHLFVBQzVCdkcsNEJBQWlELEVBQ2pEd0csaUNBQXNELEVBQ3REdkcsa0JBQThFLEVBRTdFO0lBQUEsSUFEREUsUUFBaUIsdUVBQUcsS0FBSztJQUV6QixJQUFJc0csV0FBZ0IsR0FBRzVFLGVBQWUsQ0FBQzdCLDRCQUE0QixFQUFFQyxrQkFBa0IsRUFBRUUsUUFBUSxDQUFDO0lBQ2xHLElBQUlzRyxXQUFXLEtBQUssRUFBRSxFQUFFO01BQ3ZCQSxXQUFXLEdBQUd2RyxjQUFjLENBQUNzRyxpQ0FBaUMsRUFBRXZHLGtCQUFrQixFQUFFRSxRQUFRLENBQUM7SUFDOUY7SUFDQSxPQUFPc0csV0FBVztFQUNuQixDQUFDO0VBQUM7RUFFSyxNQUFNQyxnQkFBZ0IsR0FBRyxVQUFVMUcsNEJBQWlELEVBQVU7SUFBQTtJQUNwRyxNQUFNRixZQUFZLEdBQUdFLDRCQUE0QixDQUFDRixZQUFZO0lBQzlELElBQUlBLFlBQVksYUFBWkEsWUFBWSx3Q0FBWkEsWUFBWSxDQUFFWSxPQUFPLDRFQUFyQixzQkFBdUJLLFdBQVcsNkVBQWxDLHVCQUFvQ2dDLGFBQWEsbURBQWpELHVCQUFtREMsY0FBYyxFQUFFO01BQ3RFLE9BQU8sT0FBTztJQUNmO0lBQ0EsSUFBSWxELFlBQVksYUFBWkEsWUFBWSx5Q0FBWkEsWUFBWSxDQUFFWSxPQUFPLDZFQUFyQix1QkFBdUJLLFdBQVcsNkVBQWxDLHVCQUFvQ2dDLGFBQWEsbURBQWpELHVCQUFtRDRELGFBQWEsRUFBRTtNQUNyRSxPQUFPLE9BQU87SUFDZjtJQUNBLE9BQU8sTUFBTTtFQUNkLENBQUM7RUFBQztFQU9GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTUMsb0NBQW9DLEdBQUcsVUFDbkRDLG1CQUF3QixFQUN4QkMsMEJBQW9DLEVBQ1A7SUFDN0IsTUFBTUMsb0JBQWdELEdBQUcsRUFBRTtJQUMzRCxJQUFJQyxpQkFBeUI7SUFDN0IsSUFBSUMsVUFBVTtJQUNkLElBQUlKLG1CQUFtQixFQUFFO01BQ3hCLE1BQU1LLG1CQUFtQixHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQ1AsbUJBQW1CLENBQUMsQ0FBQ1EsTUFBTSxDQUFDLFVBQVVDLE9BQU8sRUFBRTtRQUN0RixPQUFPQSxPQUFPLEtBQUssZ0JBQWdCLElBQUlBLE9BQU8sQ0FBQ0MsVUFBVSxDQUFDLGlCQUFpQixDQUFDO01BQzdFLENBQUMsQ0FBQztNQUNGLEtBQUssTUFBTUMsY0FBYyxJQUFJTixtQkFBbUIsRUFBRTtRQUNqREQsVUFBVSxHQUFHSixtQkFBbUIsQ0FBQ1csY0FBYyxDQUFDO1FBQ2hEUixpQkFBaUIsR0FBR3hHLGlCQUFpQixDQUFDRiwyQkFBMkIsQ0FBQzJHLFVBQVUsQ0FBQyxDQUFXO1FBQ3hGLElBQUksQ0FBQ0gsMEJBQTBCLElBQUtBLDBCQUEwQixJQUFJckcsMEJBQTBCLENBQUN3RyxVQUFVLENBQUUsRUFBRTtVQUMxR0Ysb0JBQW9CLENBQUNuRSxJQUFJLENBQUM7WUFDekI2RSxHQUFHLEVBQUVDLGdDQUFnQyxDQUFDVixpQkFBaUIsQ0FBQyxJQUFJQSxpQkFBaUI7WUFDN0VXLEtBQUssRUFBRVg7VUFDUixDQUFDLENBQUM7UUFDSDtNQUNEO0lBQ0Q7SUFDQSxPQUFPRCxvQkFBb0I7RUFDNUIsQ0FBQztFQUFDO0VBRUssTUFBTWEsa0JBQWtCLEdBQUcsVUFBVWIsb0JBQTJCLEVBQU87SUFDN0UsSUFBSUEsb0JBQW9CLENBQUN6QyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ3BDLElBQUl1RCxjQUFzQixHQUFHLEVBQUU7TUFDL0IsSUFBSUMsZ0JBQXFCLEdBQUcsRUFBRTtNQUM5QixNQUFNQyxpQkFBd0IsR0FBRyxFQUFFO01BQ25DLEtBQUssSUFBSUMsWUFBWSxHQUFHLENBQUMsRUFBRUEsWUFBWSxHQUFHakIsb0JBQW9CLENBQUN6QyxNQUFNLEVBQUUwRCxZQUFZLEVBQUUsRUFBRTtRQUN0RkgsY0FBYyxHQUFHZCxvQkFBb0IsQ0FBQ2lCLFlBQVksQ0FBQyxDQUFDUCxHQUFHO1FBQ3ZESyxnQkFBZ0IsR0FBR3RILGlCQUFpQixDQUFDRiwyQkFBMkIsQ0FBQ3lHLG9CQUFvQixDQUFDaUIsWUFBWSxDQUFDLENBQUNMLEtBQUssQ0FBQyxDQUFDO1FBQzNHSSxpQkFBaUIsQ0FBQ25GLElBQUksQ0FBQztVQUN0QjZFLEdBQUcsRUFBRUksY0FBYztVQUNuQkYsS0FBSyxFQUFFRztRQUNSLENBQUMsQ0FBQztNQUNIO01BQ0EsTUFBTUcscUJBQTBCLEdBQUcsSUFBSUMsU0FBUyxDQUFDSCxpQkFBaUIsQ0FBQztNQUNuRUUscUJBQXFCLENBQUNFLGdCQUFnQixHQUFHLElBQUk7TUFDN0MsTUFBTUMscUJBQTBCLEdBQUdILHFCQUFxQixDQUFDSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7TUFDbEYsT0FBT0QscUJBQXFCO0lBQzdCLENBQUMsTUFBTTtNQUNOLE9BQU8sSUFBSUYsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7SUFDbkQ7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEE7RUFXTyxNQUFNQyw0QkFBNEIsR0FBRyxVQUFVQyxLQUFVLEVBQUVDLGFBQXFCLEVBQUVDLGVBQXdCLEVBQU87SUFDdkgsSUFBSUYsS0FBSyxDQUFDRyxJQUFJLEtBQUssS0FBSyxFQUFFO01BQ3pCLE9BQU8sS0FBSztJQUNiO0lBQ0EsSUFBSUYsYUFBYSxLQUFLLFlBQVksRUFBRTtNQUNuQyxPQUFPQyxlQUFlO0lBQ3ZCO0lBQ0EsSUFBSUYsS0FBSyxDQUFDSSxRQUFRLEtBQUssU0FBUyxFQUFFO01BQ2pDLE9BQU8sSUFBSTtJQUNaO0lBQ0EsSUFBSUosS0FBSyxDQUFDSSxRQUFRLENBQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtNQUNyQztNQUNBLE9BQU9wSSxpQkFBaUIsQ0FBQzhGLEVBQUUsQ0FBQ0gsR0FBRyxDQUFDekIsRUFBRSxDQUFDbUUsVUFBVSxDQUFDLEVBQUVKLGVBQWUsQ0FBQyxDQUFDO0lBQ2xFO0lBQ0EsT0FBT0EsZUFBZTtFQUN2QixDQUFDO0VBQUM7RUFFRixNQUFNSyxtQkFBbUIsR0FBRyxVQUFVL0UsU0FBbUIsRUFBRTFDLGtCQUFzQyxFQUF1QjtJQUN2SDtJQUNBLE1BQU0wSCxhQUFhLEdBQUd0RixjQUFjLENBQUN1Rix5QkFBeUIsQ0FBQ2pGLFNBQVMsQ0FBQztJQUN6RSxNQUFNa0YsaUJBQWlCLEdBQUd4RixjQUFjLENBQUN5Riw2QkFBNkIsQ0FBQ25GLFNBQVMsQ0FBQztJQUNqRixPQUNFTixjQUFjLENBQUM0QixZQUFZLENBQUN0QixTQUFTLENBQUMsSUFBSUEsU0FBUyxDQUFDZCxJQUFJLEtBQUssYUFBYSxJQUMxRTVCLGtCQUFrQixLQUFLLFFBQVEsS0FDN0IwSCxhQUFhLElBQUl0RixjQUFjLENBQUM0QixZQUFZLENBQUMwRCxhQUFhLENBQUMsSUFDM0RFLGlCQUFpQixJQUFJeEYsY0FBYyxDQUFDNEIsWUFBWSxDQUFDNEQsaUJBQWlCLENBQUUsQ0FBRTtFQUUzRSxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNRSxzQkFBc0IsR0FBRyxVQUNyQ0MsTUFBdUIsRUFDdkJDLFVBQWUsRUFDZnZGLGNBQW1DLEVBQ25Dd0YsYUFBdUIsRUFDaEI7SUFBQTtJQUNQLE1BQU12RixTQUFTLEdBQUdELGNBQWMsQ0FBQ2hFLFlBQVk7SUFDN0MsSUFBSSxDQUFDK0MsVUFBVSxDQUFDa0IsU0FBUyxDQUFDLEVBQUU7TUFDM0JxRixNQUFNLENBQUNHLFNBQVMsR0FBRyxJQUFJO01BQ3ZCO0lBQ0Q7SUFDQSxJQUFJLENBQUNELGFBQWEsRUFBRTtNQUNuQkYsTUFBTSxDQUFDSSxzQkFBc0IsR0FBRzNILGVBQWUsQ0FBQ2lDLGNBQWMsRUFBRXNGLE1BQU0sQ0FBQzdILGFBQWEsQ0FBQztJQUN0RjtJQUVBLFFBQVE4SCxVQUFVLENBQUNqSixLQUFLO01BQ3ZCO1FBQ0MsSUFBSSx1QkFBQWlKLFVBQVUsQ0FBQzNELE1BQU0sZ0ZBQWpCLG1CQUFtQmhGLE9BQU8sMERBQTFCLHNCQUE0QitJLGFBQWEsTUFBSyw2QkFBNkIsRUFBRTtVQUNoRkwsTUFBTSxDQUFDRyxTQUFTLEdBQUcsaUJBQWlCO1VBQ3BDO1FBQ0Q7UUFDQTtNQUNEO1FBQ0MsSUFBSSxDQUFBRixVQUFVLGFBQVZBLFVBQVUsdUJBQVZBLFVBQVUsQ0FBRUksYUFBYSxNQUFLLDZCQUE2QixFQUFFO1VBQ2hFTCxNQUFNLENBQUNHLFNBQVMsR0FBRyxpQkFBaUI7VUFDcEM7UUFDRDtRQUNBO01BQ0Q7TUFDQTtNQUNBO1FBQ0NILE1BQU0sQ0FBQ0csU0FBUyxHQUFHLElBQUk7UUFDdkI7TUFDRDtJQUFRO0lBRVQsSUFBSVQsbUJBQW1CLENBQUMvRSxTQUFTLDJCQUFFcUYsTUFBTSxDQUFDN0gsYUFBYSwwREFBcEIsc0JBQXNCRixrQkFBa0IsQ0FBQyxFQUFFO01BQzdFLElBQUksQ0FBQ2lJLGFBQWEsRUFBRTtRQUFBO1FBQ25CRixNQUFNLENBQUNNLHFCQUFxQixHQUFHbkcsd0JBQXdCLENBQUNPLGNBQWMsRUFBRXNGLE1BQU0sQ0FBQzdILGFBQWEsQ0FBQztRQUM3RixJQUFJLDJCQUFBNkgsTUFBTSxDQUFDN0gsYUFBYSwyREFBcEIsdUJBQXNCRixrQkFBa0IsTUFBSyxRQUFRLEVBQUU7VUFDMUQ7VUFDQStILE1BQU0sQ0FBQ0ksc0JBQXNCLEdBQUczSCxlQUFlLENBQUNpQyxjQUFjLEVBQUVzRixNQUFNLENBQUM3SCxhQUFhLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRWpDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDO1FBQzVIO01BQ0Q7TUFDQThKLE1BQU0sQ0FBQ0csU0FBUyxHQUFHLG9CQUFvQjtNQUN2QztJQUNEO0lBRUEsUUFBUXhGLFNBQVMsQ0FBQ2QsSUFBSTtNQUNyQixLQUFLLFVBQVU7UUFDZG1HLE1BQU0sQ0FBQ0csU0FBUyxHQUFHLFlBQVk7UUFDL0I7TUFDRCxLQUFLLFVBQVU7TUFDZixLQUFLLGVBQWU7UUFDbkJILE1BQU0sQ0FBQ0csU0FBUyxHQUFHLFlBQVk7UUFDL0I7TUFDRCxLQUFLLGNBQWM7TUFDbkIsS0FBSyxvQkFBb0I7UUFDeEJILE1BQU0sQ0FBQ0csU0FBUyxHQUFHLGdCQUFnQjtRQUNuQztRQUNBLElBQUksNEJBQUN4RixTQUFTLENBQUNoRCxXQUFXLDZFQUFyQix1QkFBdUJVLE1BQU0sbURBQTdCLHVCQUErQkMsUUFBUSxHQUFFO1VBQzdDMEgsTUFBTSxDQUFDTyxZQUFZLEdBQUdySyxTQUFTO1FBQ2hDLENBQUMsTUFBTTtVQUNOOEosTUFBTSxDQUFDTyxZQUFZLEdBQUcsSUFBSTtRQUMzQjtRQUNBO01BQ0QsS0FBSyxhQUFhO1FBQ2pCUCxNQUFNLENBQUNHLFNBQVMsR0FBRyxVQUFVO1FBQzdCO01BQ0QsS0FBSyxZQUFZO1FBQ2hCSCxNQUFNLENBQUNHLFNBQVMsR0FBRyxNQUFNO1FBQ3pCO01BQ0QsS0FBSyxZQUFZO1FBQ2hCLDhCQUFJeEYsU0FBUyxDQUFDaEQsV0FBVyw2RUFBckIsdUJBQXVCMkQsRUFBRSw2RUFBekIsdUJBQTJCa0YsYUFBYSxtREFBeEMsdUJBQTBDQyxPQUFPLEVBQUUsRUFBRTtVQUN4RFQsTUFBTSxDQUFDRyxTQUFTLEdBQUcsVUFBVTtVQUM3QixJQUFJLEVBQUVELGFBQWEsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUFBO1lBQzlCLE1BQU1RLG1CQUFtQixHQUN4QiwwQkFBQVQsVUFBVSxDQUFDdEksV0FBVyxvRkFBdEIsc0JBQXdCMkQsRUFBRSwyREFBMUIsdUJBQTRCcUYsV0FBVywyQkFBSVYsVUFBVSxDQUFDOUksS0FBSywrRUFBaEIsa0JBQWtCRyxPQUFPLG9GQUF6QixzQkFBMkJLLFdBQVcscUZBQXRDLHVCQUF3QzJELEVBQUUsMkRBQTFDLHVCQUE0Q3FGLFdBQVc7WUFFbkcsSUFBSUQsbUJBQW1CLEVBQUU7Y0FDeEJWLE1BQU0sQ0FBQ1UsbUJBQW1CLEdBQUd0SixpQkFBaUIsQ0FBQ0YsMkJBQTJCLENBQUN3SixtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pHO1VBQ0Q7VUFDQTtRQUNEO1FBQ0E7TUFDRDtRQUNDVixNQUFNLENBQUNHLFNBQVMsR0FBRyxPQUFPO0lBQUM7SUFFN0IsSUFBSSwwQkFBQXhGLFNBQVMsQ0FBQ2hELFdBQVcsOEVBQXJCLHVCQUF1QkMsUUFBUSxvREFBL0Isd0JBQWlDRSxXQUFXLCtCQUFJNkMsU0FBUyxDQUFDaEQsV0FBVywrRUFBckIsd0JBQXVCQyxRQUFRLG9EQUEvQix3QkFBaUNDLElBQUksRUFBRTtNQUMxRixJQUFJLENBQUNxSSxhQUFhLEVBQUU7UUFDbkJGLE1BQU0sQ0FBQ1kscUJBQXFCLEdBQUd4SixpQkFBaUIsQ0FBQ1csWUFBWSxDQUFDOEksMkJBQTJCLENBQUNuRyxjQUFjLENBQUMsQ0FBQztRQUMxR3NGLE1BQU0sQ0FBQ2MsNEJBQTRCLEdBQUcvSSxZQUFZLENBQUNnSixjQUFjLENBQ2hFcEcsU0FBUyxFQUNULEVBQUUsRUFDRjVDLFlBQVksQ0FBQzhJLDJCQUEyQixDQUFDbkcsY0FBYyxDQUFDLENBQ3hEO1FBQ0QsTUFBTXNHLFlBQVksR0FDakIzRyxjQUFjLENBQUN5Riw2QkFBNkIsQ0FBQ25GLFNBQVMsQ0FBQyxJQUFJTixjQUFjLENBQUN1Rix5QkFBeUIsQ0FBQ2pGLFNBQVMsQ0FBQztRQUMvR3FGLE1BQU0sQ0FBQ2lCLFlBQVksR0FBRzdKLGlCQUFpQixDQUFDMkYsR0FBRyxDQUFDbUUsb0JBQW9CLENBQUNGLFlBQVksQ0FBQyxDQUFDLENBQUM7TUFDakY7TUFDQWhCLE1BQU0sQ0FBQ0csU0FBUyxHQUFHLGVBQWU7TUFDbEM7SUFDRDtJQUVBSCxNQUFNLENBQUNHLFNBQVMsR0FBRyxPQUFPO0VBQzNCLENBQUM7RUFBQztFQUVLLE1BQU1nQix1Q0FBdUMsR0FBSUMsMkJBQWdELElBQUs7SUFBQTtJQUM1RyxNQUFNQyxRQUFRLEdBQUdELDJCQUEyQixDQUFDMUssWUFBd0I7SUFDckUsSUFBSTRLLG9CQUFvQixDQUFDQyxpQkFBaUIsQ0FBQ0YsUUFBUSxDQUFDLEVBQUU7TUFDckQsT0FBTyxJQUFJO0lBQ1o7SUFDQSxNQUFNRyxXQUFXLEdBQUdKLDJCQUEyQixhQUEzQkEsMkJBQTJCLHdDQUEzQkEsMkJBQTJCLENBQUU3SCxvQkFBb0Isa0RBQWpELHNCQUFtRDJCLE1BQU0sR0FDMUVrRywyQkFBMkIsYUFBM0JBLDJCQUEyQix1QkFBM0JBLDJCQUEyQixDQUFFN0gsb0JBQW9CLENBQUMsQ0FBQTZILDJCQUEyQixhQUEzQkEsMkJBQTJCLGlEQUEzQkEsMkJBQTJCLENBQUU3SCxvQkFBb0IsMkRBQWpELHVCQUFtRDJCLE1BQU0sSUFBRyxDQUFDLENBQUMsR0FDaEgsSUFBSTtJQUNQLElBQ0MsQ0FBQ3NHLFdBQVcsOEJBQ1pKLDJCQUEyQixDQUFDNUYsZUFBZSw2RUFBM0MsdUJBQTZDakMsb0JBQW9CLG1EQUFqRSx1QkFBbUVrSSxJQUFJLENBQ3JFQyxjQUFjLElBQUtBLGNBQWMsQ0FBQ3JHLElBQUksS0FBS21HLFdBQVcsQ0FBQ25HLElBQUksQ0FDNUQsRUFDQTtNQUNELE9BQU8sS0FBSztJQUNiO0lBQ0EsT0FBT2lHLG9CQUFvQixDQUFDQyxpQkFBaUIsQ0FBQ0MsV0FBVyxDQUFDO0VBQzNELENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLE1BQU1HLDhCQUE4QixHQUFJQywwQkFBK0MsSUFBc0M7SUFDbkksSUFBSSxDQUFDQSwwQkFBMEIsQ0FBQ2xMLFlBQVksRUFBRTtNQUM3QyxPQUFPUixTQUFTO0lBQ2pCO0lBQ0EsSUFBSTJMLFNBQVMsR0FBRyxFQUFFO0lBQ2xCO0lBQ0EsSUFBSUQsMEJBQTBCLENBQUNsTCxZQUFZLENBQUNvTCxJQUFJLEtBQUssc0NBQXNDLEVBQUU7TUFDNUZGLDBCQUEwQixDQUFDbEwsWUFBWSxDQUFDTSxLQUFLLEdBQUc0SywwQkFBMEIsQ0FBQ2xMLFlBQVksQ0FBQ00sS0FBSyw4Q0FBbUM7SUFDakk7SUFDQSxRQUFRNEssMEJBQTBCLENBQUNsTCxZQUFZLENBQUNNLEtBQUs7TUFDcEQ7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO1FBQ0MsSUFBSSxPQUFPNEssMEJBQTBCLENBQUNsTCxZQUFZLENBQUNTLEtBQUssS0FBSyxRQUFRLEVBQUU7VUFDdEUwSyxTQUFTLEdBQUdELDBCQUEwQixDQUFDbEwsWUFBWSxDQUFDUyxLQUFLLENBQUNkLElBQUk7UUFDL0Q7UUFDQTtNQUNEO1FBQ0MsSUFBSXVMLDBCQUEwQixDQUFDbEwsWUFBWSxDQUFDNEYsTUFBTSxDQUFDaEYsT0FBTyxFQUFFO1VBQzNELElBQ0NzSywwQkFBMEIsQ0FBQ2xMLFlBQVksQ0FBQzRGLE1BQU0sQ0FBQ2hGLE9BQU8sQ0FBQ04sS0FBSywyQ0FBZ0MsSUFDNUY0SywwQkFBMEIsQ0FBQ2xMLFlBQVksQ0FBQzRGLE1BQU0sQ0FBQ2hGLE9BQU8sQ0FBQ04sS0FBSywrQ0FBb0MsRUFDL0Y7WUFDRCxJQUFJNEssMEJBQTBCLENBQUNsTCxZQUFZLENBQUM0RixNQUFNLENBQUNpQyxLQUFLLENBQUNpQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2NBQUE7Y0FDMUVxQyxTQUFTLEdBQUdELDBCQUEwQixDQUFDbEwsWUFBWSxDQUFDNEYsTUFBTSxDQUFDaUMsS0FBSyxDQUFDd0QsT0FBTyxDQUN2RSxPQUFPLEVBQ04sSUFBQyx5QkFBRUgsMEJBQTBCLENBQUNsTCxZQUFZLENBQUM0RixNQUFNLENBQUNoRixPQUFPLENBQUNILEtBQUssMERBQTVELHNCQUE4RGQsSUFBSyxFQUFDLENBQ3hFO1lBQ0YsQ0FBQyxNQUFNO2NBQUE7Y0FDTndMLFNBQVMsNkJBQUdELDBCQUEwQixDQUFDbEwsWUFBWSxDQUFDNEYsTUFBTSxDQUFDaEYsT0FBTyxDQUFDSCxLQUFLLDJEQUE1RCx1QkFBOERkLElBQUk7WUFDL0U7VUFDRCxDQUFDLE1BQU07WUFBQTtZQUNOd0wsU0FBUyw2QkFBR0QsMEJBQTBCLENBQUNsTCxZQUFZLENBQUM0RixNQUFNLDJEQUE5Qyx1QkFBZ0RqRyxJQUFJO1VBQ2pFO1FBQ0Q7UUFDQTtJQUFNO0lBR1IsSUFBSXdMLFNBQVMsSUFBSUEsU0FBUyxDQUFDM0csTUFBTSxHQUFHLENBQUMsRUFBRTtNQUN0QyxPQUFPOUUsb0JBQW9CLENBQUN3TCwwQkFBMEIsRUFBRUMsU0FBUyxDQUFDO0lBQ25FLENBQUMsTUFBTTtNQUNOLE9BQU8zTCxTQUFTO0lBQ2pCO0VBQ0QsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLE1BQU04TCw2QkFBNkIsR0FBSUMsbUJBQXdDLElBQUs7SUFDMUYsSUFBSUMsMEJBQXFFO0lBQ3pFLElBQUlYLGlCQUFpQixDQUFDVSxtQkFBbUIsQ0FBQ3ZMLFlBQVksQ0FBa0MsRUFBRTtNQUN6RndMLDBCQUEwQixHQUFHRCxtQkFBbUIsQ0FBQ3ZMLFlBQTZDO0lBQy9GLENBQUMsTUFBTSxJQUFJdUwsbUJBQW1CLENBQUMxSSxvQkFBb0IsQ0FBQzJCLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDL0Q7TUFDQSxLQUFLLE1BQU1pSCxXQUFXLElBQUlGLG1CQUFtQixDQUFDMUksb0JBQW9CLEVBQUU7UUFBQTtRQUNuRSxJQUNDLDJCQUFDMEksbUJBQW1CLENBQUN6RyxlQUFlLGtEQUFuQyxzQkFBcUNqQyxvQkFBb0IsQ0FBQ2tJLElBQUksQ0FDN0RDLGNBQWMsSUFBS0EsY0FBYyxDQUFDVSxrQkFBa0IsS0FBS0QsV0FBVyxDQUFDQyxrQkFBa0IsQ0FDeEYsS0FDRCxDQUFDRiwwQkFBMEIsSUFDM0JYLGlCQUFpQixDQUFDWSxXQUFXLENBQUMsRUFDN0I7VUFDREQsMEJBQTBCLEdBQUdDLFdBQVc7UUFDekM7TUFDRDtJQUNEO0lBQ0EsT0FBT0QsMEJBQTBCO0VBQ2xDLENBQUM7RUFBQztFQUFBO0FBQUEifQ==