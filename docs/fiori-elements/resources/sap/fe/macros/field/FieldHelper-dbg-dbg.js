/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/base/ManagedObject", "sap/ui/core/format/DateFormat", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingHelper, Key, BindingToolkit, ModelHelper, StableIdHelper, FieldControlHelper, UIFormatters, CommonHelper, ValueListHelper, ManagedObject, DateFormat, JSONModel, AnnotationHelper) {
  "use strict";

  var getAlignmentExpression = UIFormatters.getAlignmentExpression;
  var isRequiredExpression = FieldControlHelper.isRequiredExpression;
  var generate = StableIdHelper.generate;
  var or = BindingToolkit.or;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var UI = BindingHelper.UI;
  const ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
    Unit = "@Org.OData.Measures.V1.Unit";
  const FieldHelper = {
    /**
     * Determine how to show the value by analyzing Text and TextArrangement Annotations.
     *
     * @function
     * @name sap.fe.macros.field.FieldHelper#displayMode
     * @memberof sap.fe.macros.field.FieldHelper
     * @static
     * @param oPropertyAnnotations The Property annotations
     * @param oCollectionAnnotations The EntityType annotations
     * @returns The display mode of the field
     * @private
     * @ui5-restricted
     */
    displayMode: function (oPropertyAnnotations, oCollectionAnnotations) {
      const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
        oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
      if (oTextArrangementAnnotation) {
        if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
          return "Description";
        } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
          return "ValueDescription";
        }
        //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
        return "DescriptionValue";
      }
      return oTextAnnotation ? "DescriptionValue" : "Value";
    },
    buildExpressionForTextValue: function (sPropertyPath, oDataField) {
      const oMetaModel = oDataField.context.getModel();
      const sPath = oDataField.context.getPath();
      const oTextAnnotationContext = oMetaModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.Text`);
      const oTextAnnotation = oTextAnnotationContext.getProperty();
      const sTextExpression = oTextAnnotation ? AnnotationHelper.value(oTextAnnotation, {
        context: oTextAnnotationContext
      }) : undefined;
      let sExpression = "";
      sPropertyPath = AnnotationHelper.getNavigationPath(sPropertyPath);
      if (sPropertyPath.indexOf("/") > -1 && sTextExpression) {
        sExpression = sPropertyPath.replace(/[^/]*$/, sTextExpression.substr(1, sTextExpression.length - 2));
      } else {
        sExpression = sTextExpression;
      }
      if (sExpression) {
        sExpression = "{ path : '" + sExpression.replace(/^\{+/g, "").replace(/\}+$/g, "") + "', parameters: {'$$noPatch': true}}";
      }
      return sExpression;
    },
    buildTargetPathFromDataModelObjectPath: function (oDataModelObjectPath) {
      const sSartEntitySet = oDataModelObjectPath.startingEntitySet.name;
      let sPath = `/${sSartEntitySet}`;
      const aNavigationProperties = oDataModelObjectPath.navigationProperties;
      for (let i = 0; i < aNavigationProperties.length; i++) {
        sPath += `/${aNavigationProperties[i].name}`;
      }
      return sPath;
    },
    isNotAlwaysHidden: function (oDataField, oDetails) {
      const oContext = oDetails.context;
      let isAlwaysHidden = false;
      if (oDataField.Value && oDataField.Value.$Path) {
        isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
      }
      if (!isAlwaysHidden || isAlwaysHidden.$Path) {
        isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
        if (!isAlwaysHidden || isAlwaysHidden.$Path) {
          isAlwaysHidden = false;
        }
      }
      return !isAlwaysHidden;
    },
    isDraftIndicatorVisibleInFieldGroup: function (column) {
      if (column && column.formatOptions && column.formatOptions.fieldGroupDraftIndicatorPropertyPath && column.formatOptions.fieldGroupName) {
        return "{parts: [" + "{value: '" + column.formatOptions.fieldGroupName + "'}," + "{path: 'internal>semanticKeyHasDraftIndicator'} , " + "{path: 'HasDraftEntity', targetType: 'any'}, " + "{path: 'IsActiveEntity', targetType: 'any'}, " + "{path: 'pageInternal>hideDraftInfo', targetType: 'any'}], " + "formatter: 'sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible'}";
      } else {
        return false;
      }
    },
    isRequired: function (oFieldControl, sEditMode) {
      if (sEditMode === "Display" || sEditMode === "ReadOnly" || sEditMode === "Disabled") {
        return false;
      }
      if (oFieldControl) {
        if (ManagedObject.bindingParser(oFieldControl)) {
          return "{= %" + oFieldControl + " === 7}";
        } else {
          return oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory";
        }
      }
      return false;
    },
    getActionParameterVisibility: function (oParam, oContext) {
      // To use the UI.Hidden annotation for controlling visibility the value needs to be negated
      if (typeof oParam === "object") {
        if (oParam && oParam.$If && oParam.$If.length === 3) {
          // In case the UI.Hidden contains a dynamic expression we do this
          // by just switching the "then" and "else" part of the erpression
          // oParam.$If[0] <== Condition part
          // oParam.$If[1] <== Then part
          // oParam.$If[2] <== Else part
          const oNegParam = {
            $If: []
          };
          oNegParam.$If[0] = oParam.$If[0];
          oNegParam.$If[1] = oParam.$If[2];
          oNegParam.$If[2] = oParam.$If[1];
          return AnnotationHelper.value(oNegParam, oContext);
        } else {
          return "{= !%{" + oParam.$Path + "} }";
        }
      } else if (typeof oParam === "boolean") {
        return AnnotationHelper.value(!oParam, oContext);
      } else {
        return undefined;
      }
    },
    /**
     * Computed annotation that returns vProperty for a string and @sapui.name for an object.
     *
     * @param vProperty The property
     * @param oInterface The interface instance
     * @returns The property name
     */
    propertyName: function (vProperty, oInterface) {
      let sPropertyName;
      if (typeof vProperty === "string") {
        if (oInterface.context.getPath().indexOf("$Path") > -1 || oInterface.context.getPath().indexOf("$PropertyPath") > -1) {
          // We could end up with a pure string property (no $Path), and this is not a real property in that case
          sPropertyName = vProperty;
        }
      } else if (vProperty.$Path || vProperty.$PropertyPath) {
        const sPath = vProperty.$Path ? "/$Path" : "/$PropertyPath";
        const sContextPath = oInterface.context.getPath();
        sPropertyName = oInterface.context.getObject(`${sContextPath + sPath}/$@sapui.name`);
      } else if (vProperty.Value && vProperty.Value.$Path) {
        sPropertyName = vProperty.Value.$Path;
      } else {
        sPropertyName = oInterface.context.getObject("@sapui.name");
      }
      return sPropertyName;
    },
    fieldControl: function (sPropertyPath, oInterface) {
      const oModel = oInterface && oInterface.context.getModel();
      const sPath = oInterface && oInterface.context.getPath();
      const oFieldControlContext = oModel && oModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.FieldControl`);
      const oFieldControl = oFieldControlContext && oFieldControlContext.getProperty();
      if (oFieldControl) {
        if (oFieldControl.hasOwnProperty("$EnumMember")) {
          return oFieldControl.$EnumMember;
        } else if (oFieldControl.hasOwnProperty("$Path")) {
          return AnnotationHelper.value(oFieldControl, {
            context: oFieldControlContext
          });
        }
      } else {
        return undefined;
      }
    },
    /**
     * Method to get the value help property from a DataField or a PropertyPath (in case a SelectionField is used)
     * Priority from where to get the property value of the field (examples are "Name" and "Supplier"):
     * 1. If oPropertyContext.getObject() has key '$Path', then we take the value at '$Path'.
     * 2. Else, value at oPropertyContext.getObject().
     * If there is an ISOCurrency or if there are Unit annotations for the field property,
     * then the Path at the ISOCurrency or Unit annotations of the field property is considered.
     *
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param oPropertyContext The context from which value help property need to be extracted.
     * @param bInFilterField Whether or not we're in the filter field and should ignore
     * @returns The value help property path
     */
    valueHelpProperty: function (oPropertyContext, bInFilterField) {
      /* For currency (and later Unit) we need to forward the value help to the annotated field */
      const sContextPath = oPropertyContext.getPath();
      const oContent = oPropertyContext.getObject() || {};
      let sPath = oContent.$Path ? `${sContextPath}/$Path` : sContextPath;
      const sAnnoPath = `${sPath}@`;
      const oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath);
      let sAnnotation;
      if (oPropertyAnnotations) {
        sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency || oPropertyAnnotations.hasOwnProperty(Unit) && Unit;
        if (sAnnotation && !bInFilterField) {
          const sUnitOrCurrencyPath = `${sPath + sAnnotation}/$Path`;
          // we check that the currency or unit is a Property and not a fixed value
          if (oPropertyContext.getObject(sUnitOrCurrencyPath)) {
            sPath = sUnitOrCurrencyPath;
          }
        }
      }
      return sPath;
    },
    /**
     * Dedicated method to avoid looking for unit properties.
     *
     * @param oPropertyContext
     * @returns The value help property path
     */
    valueHelpPropertyForFilterField: function (oPropertyContext) {
      return FieldHelper.valueHelpProperty(oPropertyContext, true);
    },
    /**
     * Method to generate the ID for Value Help.
     *
     * @function
     * @name getIDForFieldValueHelp
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param sFlexId Flex ID of the current object
     * @param sIdPrefix Prefix for the ValueHelp ID
     * @param sOriginalPropertyName Name of the property
     * @param sPropertyName Name of the ValueHelp Property
     * @returns The ID generated for the ValueHelp
     */
    getIDForFieldValueHelp: function (sFlexId, sIdPrefix, sOriginalPropertyName, sPropertyName) {
      if (sFlexId) {
        return sFlexId;
      }
      let sProperty = sPropertyName;
      if (sOriginalPropertyName !== sPropertyName) {
        sProperty = `${sOriginalPropertyName}::${sPropertyName}`;
      }
      return generate([sIdPrefix, sProperty]);
    },
    /**
     * Method to get the fieldHelp property of the FilterField.
     *
     * @function
     * @name getFieldHelpPropertyForFilterField
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param propertyContext Property context for filter field
     * @param oProperty The object of the FieldHelp property
     * @param sPropertyType The $Type of the property
     * @param sVhIdPrefix The ID prefix of the value help
     * @param sPropertyName The name of the property
     * @param sValueHelpPropertyName The property name of the value help
     * @param bHasValueListWithFixedValues `true` if there is a value list with a fixed value annotation
     * @param bUseSemanticDateRange `true` if the semantic date range is set to 'true' in the manifest
     * @returns The field help property of the value help
     */
    getFieldHelpPropertyForFilterField: function (propertyContext, oProperty, sPropertyType, sVhIdPrefix, sPropertyName, sValueHelpPropertyName, bHasValueListWithFixedValues, bUseSemanticDateRange) {
      const sProperty = FieldHelper.propertyName(oProperty, {
          context: propertyContext
        }),
        bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
      const oModel = propertyContext.getModel(),
        sPropertyPath = propertyContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
      if ((sPropertyType === "Edm.DateTimeOffset" || sPropertyType === "Edm.Date") && bSemanticDateRange && oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty] && (oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleRange") !== -1 || oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleValue") !== -1) || sPropertyType === "Edm.Boolean" && !bHasValueListWithFixedValues) {
        return undefined;
      }
      return FieldHelper.getIDForFieldValueHelp(null, sVhIdPrefix || "FilterFieldValueHelp", sPropertyName, sValueHelpPropertyName);
    },
    getObjectIdentifierText: function (oTextAnnotation, oTextArrangementAnnotation, sPropertyValueBinding, sDataFieldName) {
      if (oTextAnnotation) {
        // There is a text annotation. In this case, the ObjectIdentifier shows:
        //  - the *text* as the ObjectIdentifier's title
        //  - the *value* as the ObjectIdentifier's text
        //
        // So if the TextArrangement is #TextOnly or #TextSeparate, do not set the ObjectIdentifier's text
        // property
        if (oTextArrangementAnnotation && (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst")) {
          return undefined;
        } else {
          return sPropertyValueBinding || `{${sDataFieldName}}`;
        }
      }

      // no text annotation: the property value is part of the ObjectIdentifier's title already
      return undefined;
    },
    getSemanticObjectsList: function (propertyAnnotations) {
      // look for annotations SemanticObject with and without qualifier
      // returns : list of SemanticObjects
      const annotations = propertyAnnotations;
      const aSemanticObjects = [];
      for (const key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") === -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") === -1) {
          let semanticObjectValue = annotations.getObject()[key];
          if (typeof semanticObjectValue === "object") {
            semanticObjectValue = AnnotationHelper.value(semanticObjectValue, {
              context: propertyAnnotations
            });
          }
          if (aSemanticObjects.indexOf(semanticObjectValue) === -1) {
            aSemanticObjects.push(semanticObjectValue);
          }
        }
      }
      const oSemanticObjectsModel = new JSONModel(aSemanticObjects);
      oSemanticObjectsModel.$$valueAsPromise = true;
      return oSemanticObjectsModel.createBindingContext("/");
    },
    getSemanticObjectsQualifiers: function (propertyAnnotations) {
      // look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
      // returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
      const annotations = propertyAnnotations;
      let qualifiersAnnotations = [];
      const findObject = function (qualifier) {
        return qualifiersAnnotations.find(function (object) {
          return object.qualifier === qualifier;
        });
      };
      for (const key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions#") > -1) {
          const annotationContent = annotations.getObject()[key],
            annotation = key.split("#")[0],
            qualifier = key.split("#")[1];
          let qualifierObject = findObject(qualifier);
          if (!qualifierObject) {
            qualifierObject = {
              qualifier: qualifier
            };
            qualifierObject[annotation] = annotationContent;
            qualifiersAnnotations.push(qualifierObject);
          } else {
            qualifierObject[annotation] = annotationContent;
          }
        }
      }
      qualifiersAnnotations = qualifiersAnnotations.filter(function (oQualifier) {
        return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
      });
      const oQualifiersModel = new JSONModel(qualifiersAnnotations);
      oQualifiersModel.$$valueAsPromise = true;
      return oQualifiersModel.createBindingContext("/");
    },
    hasSemanticObjectsWithPath: function (aSemanticObjects) {
      let bSemanticObjectHasAPath = false;
      if (aSemanticObjects && aSemanticObjects.length) {
        for (let i = 0; i < aSemanticObjects.length; i++) {
          if (aSemanticObjects[i] && aSemanticObjects[i].value && aSemanticObjects[i].value.indexOf("{") === 0) {
            bSemanticObjectHasAPath = true;
            break;
          }
        }
      }
      return bSemanticObjectHasAPath;
    },
    isSemanticKeyHasFieldGroupColumn: function (isFieldGroupColumn) {
      return isFieldGroupColumn;
    },
    /*
     * Method to compute the delegate with payload
     * @function
     * @param {object} delegateName - name of the delegate methode
     * @param {boolean} retrieveTextFromValueList - added to the payload of the delegate methode
     * @return {object} - returns the delegate with payload
     */
    computeFieldBaseDelegate: function (delegateName, retrieveTextFromValueList) {
      if (retrieveTextFromValueList) {
        return JSON.stringify({
          name: delegateName,
          payload: {
            retrieveTextFromValueList: retrieveTextFromValueList
          }
        });
      }
      return `{name: '${delegateName}'}`;
    },
    _getPrimaryIntents: function (aSemanticObjectsList) {
      const aPromises = [];
      if (aSemanticObjectsList) {
        const oUshellContainer = sap.ushell && sap.ushell.Container;
        const oService = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
        aSemanticObjectsList.forEach(function (semObject) {
          if (typeof semObject === "string") {
            aPromises.push(oService.getPrimaryIntent(semObject, {}));
          }
        });
      }
      return Promise.all(aPromises).then(function (aSemObjectPrimaryAction) {
        return aSemObjectPrimaryAction;
      }).catch(function (oError) {
        Log.error("Error fetching primary intents", oError);
        return [];
      });
    },
    _checkIfSemanticObjectsHasPrimaryAction: function (oSemantics, aSemanticObjectsPrimaryActions, appComponent) {
      const _fnIsSemanticObjectActionUnavailable = function (_oSemantics, _oPrimaryAction, _index) {
        for (const unavailableActionsIndex in _oSemantics.semanticObjectUnavailableActions[_index].actions) {
          if (_oPrimaryAction.intent.split("-")[1].indexOf(_oSemantics.semanticObjectUnavailableActions[_index].actions[unavailableActionsIndex]) === 0) {
            return false;
          }
        }
        return true;
      };
      oSemantics.semanticPrimaryActions = aSemanticObjectsPrimaryActions;
      const oPrimaryAction = oSemantics.semanticObjects && oSemantics.mainSemanticObject && oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)];
      const sCurrentHash = appComponent.getShellServices().getHash();
      if (oSemantics.mainSemanticObject && oPrimaryAction !== null && oPrimaryAction.intent !== sCurrentHash) {
        for (const index in oSemantics.semanticObjectUnavailableActions) {
          if (oSemantics.mainSemanticObject.indexOf(oSemantics.semanticObjectUnavailableActions[index].semanticObject) === 0) {
            return _fnIsSemanticObjectActionUnavailable(oSemantics, oPrimaryAction, index);
          }
        }
        return true;
      } else {
        return false;
      }
    },
    checkPrimaryActions: function (oSemantics, bGetTitleLink, appComponent) {
      return this._getPrimaryIntents(oSemantics && oSemantics.semanticObjects).then(aSemanticObjectsPrimaryActions => {
        return bGetTitleLink ? {
          titleLink: aSemanticObjectsPrimaryActions,
          hasTitleLink: this._checkIfSemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions, appComponent)
        } : this._checkIfSemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions, appComponent);
      }).catch(function (oError) {
        Log.error("Error in checkPrimaryActions", oError);
      });
    },
    _getTitleLinkWithParameters: function (_oSemanticObjectModel, _linkIntent) {
      if (_oSemanticObjectModel && _oSemanticObjectModel.titlelink) {
        return _oSemanticObjectModel.titlelink;
      } else {
        return _linkIntent;
      }
    },
    getPrimaryAction: function (oSemantics) {
      return oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent ? FieldHelper._getTitleLinkWithParameters(oSemantics, oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent) : oSemantics.primaryIntentAction;
    },
    /**
     * Method to fetch the filter restrictions. Filter restrictions can be annotated on an entity set or a navigation property.
     * Depending on the path to which the control is bound, we check for filter restrictions on the context path of the control,
     * or on the navigation property (if there is a navigation).
     * Eg. If the table is bound to '/EntitySet', for property path '/EntitySet/_Association/PropertyName', the filter restrictions
     * on '/EntitySet' win over filter restrictions on '/EntitySet/_Association'.
     * If the table is bound to '/EntitySet/_Association', the filter restrictions on '/EntitySet/_Association' win over filter
     * retrictions on '/AssociationEntitySet'.
     *
     * @param oContext Property Context
     * @param oProperty Property object in the metadata
     * @param bUseSemanticDateRange Boolean Suggests if semantic date range should be used
     * @param sSettings Stringified object of the property settings
     * @param contextPath Path to which the parent control (the table or the filter bar) is bound
     * @returns String containing comma-separated list of operators for filtering
     */
    operators: function (oContext, oProperty, bUseSemanticDateRange, sSettings, contextPath) {
      if (!oProperty || !contextPath) {
        return undefined;
      }
      let operators;
      const sProperty = FieldHelper.propertyName(oProperty, {
        context: oContext
      });
      const oModel = oContext.getModel(),
        sPropertyPath = oContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        propertyType = oProperty.$Type;
      if (propertyType === "Edm.Guid") {
        return CommonUtils.getOperatorsForGuidProperty();
      }

      // remove '/'
      contextPath = contextPath.slice(0, -1);
      const isTableBoundToNavigation = contextPath.lastIndexOf("/") > 0;
      const isNavigationPath = isTableBoundToNavigation && contextPath !== sPropertyLocationPath || !isTableBoundToNavigation && sPropertyLocationPath.lastIndexOf("/") > 0;
      const navigationPath = isNavigationPath && sPropertyLocationPath.substr(sPropertyLocationPath.indexOf(contextPath) + contextPath.length + 1) || "";
      const propertyPath = isNavigationPath && navigationPath + "/" + sProperty || sProperty;
      if (!isTableBoundToNavigation) {
        if (!isNavigationPath) {
          // /SalesOrderManage/ID
          operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        } else {
          // /SalesOrderManange/_Item/Material
          //let operators
          operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          if (operators.length === 0) {
            operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          }
        }
      } else if (!isNavigationPath) {
        var _operators;
        // /SalesOrderManage/_Item/Material
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(sProperty, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
        return ((_operators = operators) === null || _operators === void 0 ? void 0 : _operators.length) > 0 ? operators.toString() : undefined;
      } else {
        // /SalesOrderManage/_Item/_Association/PropertyName
        // This is currently not supported for tables
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(propertyPath, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
      }
      if ((!operators || operators.length === 0) && (propertyType === "Edm.Date" || propertyType === "Edm.DateTimeOffset")) {
        operators = CommonUtils.getOperatorsForDateProperty(propertyType);
      }
      return operators.length > 0 ? operators.toString() : undefined;
    },
    /**
     * Return the property context for usage in QuickView.
     *
     * @param oDataFieldContext Context of the data field or associated property
     * @returns Binding context
     */
    getPropertyContextForQuickView: function (oDataFieldContext) {
      if (oDataFieldContext.getObject("Value") !== undefined) {
        // Create a binding context to the property from the data field.
        const oInterface = oDataFieldContext.getInterface(),
          oModel = oInterface.getModel();
        let sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "Value" : "/Value");
        return oModel.createBindingContext(sPath);
      } else {
        // It is a property. Just return the context as it is.
        return oDataFieldContext;
      }
    },
    /**
     * Return the binding context corresponding to the property path.
     *
     * @param oPropertyContext Context of the property
     * @returns Binding context
     */
    getPropertyPathForQuickView: function (oPropertyContext) {
      if (oPropertyContext && oPropertyContext.getObject("$Path")) {
        const oInterface = oPropertyContext.getInterface(),
          oModel = oInterface.getModel();
        let sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "$Path" : "/$Path");
        return oModel.createBindingContext(sPath);
      }
      return oPropertyContext;
    },
    /**
     * Return the path of the DaFieldDefault (if any). Otherwise, the DataField path is returned.
     *
     * @param oDataFieldContext Context of the DataField
     * @returns Object path
     */
    getDataFieldDefault: function (oDataFieldContext) {
      const oDataFieldDefault = oDataFieldContext.getModel().getObject(`${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
      return oDataFieldDefault ? `${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault` : oDataFieldContext.getPath();
    },
    /*
     * Method to get visible expression for DataFieldActionButton
     * @function
     * @name isDataFieldActionButtonVisible
     * @param {object} oThis - Current Object
     * @param {object} oDataField - DataPoint's Value
     * @param {boolean} bIsBound - DataPoint action bound
     * @param {object} oActionContext - ActionContext Value
     * @return {boolean} - returns boolean
     */
    isDataFieldActionButtonVisible: function (oThis, oDataField, bIsBound, oActionContext) {
      return oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true && (bIsBound !== true || oActionContext !== false);
    },
    /**
     * Method to get press event for DataFieldActionButton.
     *
     * @function
     * @name getPressEventForDataFieldActionButton
     * @param oThis Current Object
     * @param oDataField DataPoint's Value
     * @returns The binding expression for the DataFieldActionButton press event
     */
    getPressEventForDataFieldActionButton: function (oThis, oDataField) {
      var _oThis$entitySet;
      let sInvocationGrouping = "Isolated";
      if (oDataField.InvocationGrouping && oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet") {
        sInvocationGrouping = "ChangeSet";
      }
      let bIsNavigable = oThis.navigateAfterAction;
      bIsNavigable = bIsNavigable === "false" ? false : true;
      const entities = oThis === null || oThis === void 0 ? void 0 : (_oThis$entitySet = oThis.entitySet) === null || _oThis$entitySet === void 0 ? void 0 : _oThis$entitySet.getPath().split("/");
      const entitySetName = entities[entities.length - 1];
      const oParams = {
        contexts: "${$source>/}.getBindingContext()",
        invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
        model: "${$source>/}.getModel()",
        label: CommonHelper.addSingleQuotes(oDataField.Label, true),
        isNavigable: bIsNavigable,
        entitySetName: CommonHelper.addSingleQuotes(entitySetName)
      };
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oDataField.Action), CommonHelper.objectToString(oParams));
    },
    isNumericDataType: function (sDataFieldType) {
      const _sDataFieldType = sDataFieldType;
      if (_sDataFieldType !== undefined) {
        const aNumericDataTypes = ["Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.Byte", "Edm.SByte", "Edm.Single", "Edm.Decimal", "Edm.Double"];
        return aNumericDataTypes.indexOf(_sDataFieldType) === -1 ? false : true;
      } else {
        return false;
      }
    },
    isDateOrTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateTimeDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date", "Edm.TimeOfDay", "Edm.Time"];
        return aDateTimeDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateDataType: function (sPropertyType) {
      return sPropertyType === "Edm.Date";
    },
    isTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.TimeOfDay", "Edm.Time"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    /**
     * To display a text arrangement showing text and id, we need a string field on the UI.
     *
     * @param oAnnotations All the annotations of a property
     * @param sType The property data type
     * @returns The type to be used on the UI for the alignment
     * @private
     */
    getDataTypeForVisualization: function (oAnnotations, sType) {
      var _oAnnotations$sTextAr, _oAnnotations$sTextAn;
      const sTextAnnotation = "@com.sap.vocabularies.Common.v1.Text",
        sTextArrangementAnnotation = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement";

      /*
        In case of TextSeparate, the returned is used for the filed itself only showing
         the value of the original property, thus also the type of the property needs to be used.
        In case of TextOnly, we consider it to be Edm.String according to the definition
         in the vocabulary, even if it's not.
        In other cases, we return Edm.String, as the value is build using a text template.
       */
      return (oAnnotations === null || oAnnotations === void 0 ? void 0 : (_oAnnotations$sTextAr = oAnnotations[sTextArrangementAnnotation]) === null || _oAnnotations$sTextAr === void 0 ? void 0 : _oAnnotations$sTextAr.$EnumMember) !== "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" && oAnnotations !== null && oAnnotations !== void 0 && (_oAnnotations$sTextAn = oAnnotations[sTextAnnotation]) !== null && _oAnnotations$sTextAn !== void 0 && _oAnnotations$sTextAn.$Path ? "Edm.String" : sType;
    },
    getColumnAlignment: function (oDataField, oTable) {
      const sEntityPath = oTable.collection.sPath,
        oModel = oTable.collection.oModel;
      if ((oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && oDataField.Inline && oDataField.IconUrl) {
        return "Center";
      }
      // Columns containing a Semantic Key must be Begin aligned
      const aSemanticKeys = oModel.getObject(`${sEntityPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataField") {
        const sPropertyPath = oDataField.Value.$Path;
        const bIsSemanticKey = aSemanticKeys && !aSemanticKeys.every(function (oKey) {
          return oKey.$PropertyPath !== sPropertyPath;
        });
        if (bIsSemanticKey) {
          return "Begin";
        }
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath);
    },
    /**
     * Get alignment based only on the property.
     *
     * @param sType The property's type
     * @param oFormatOptions The field format options
     * @param [oComputedEditMode] The computed Edit mode of the property is empty when directly called from the ColumnProperty fragment
     * @returns The property alignment
     */
    getPropertyAlignment: function (sType, oFormatOptions, oComputedEditMode) {
      let sDefaultAlignment = "Begin";
      const sTextAlignment = oFormatOptions ? oFormatOptions.textAlignMode : "";
      switch (sTextAlignment) {
        case "Form":
          if (this.isNumericDataType(sType)) {
            sDefaultAlignment = "Begin";
            if (oComputedEditMode) {
              sDefaultAlignment = getAlignmentExpression(oComputedEditMode, "Begin", "End");
            }
          }
          break;
        default:
          if (this.isNumericDataType(sType) || this.isDateOrTimeDataType(sType)) {
            sDefaultAlignment = "Right";
          }
          break;
      }
      return sDefaultAlignment;
    },
    getDataFieldAlignment: function (oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode) {
      let sDataFieldPath,
        sDefaultAlignment = "Begin",
        sType,
        oAnnotations;
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldPath = oDataField.Target.$AnnotationPath;
        if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0) {
          const oFieldGroup = oModel.getObject(`${sEntityPath}/${sDataFieldPath}`);
          for (let i = 0; i < oFieldGroup.Data.length; i++) {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path@`);
            sType = this.getDataTypeForVisualization(oAnnotations, sType);
            sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
            if (sDefaultAlignment === "Begin") {
              break;
            }
          }
          return sDefaultAlignment;
        } else if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.DataPoint") >= 0 && oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Visualization/$EnumMember`) === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          return sDefaultAlignment;
        } else {
          sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
          if (sType === "com.sap.vocabularies.UI.v1.DataPointType") {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path@`);
            sType = this.getDataTypeForVisualization(oAnnotations, sType);
          }
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      } else {
        sDataFieldPath = oDataField.Value.$Path;
        sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
        oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}@`);
        sType = this.getDataTypeForVisualization(oAnnotations, sType);
        if (!(oModel.getObject(`${sEntityPath}/`)["$Key"].indexOf(sDataFieldPath) === 0)) {
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      }
      return sDefaultAlignment;
    },
    getTypeAlignment: function (oContext, oDataField, oFormatOptions, sEntityPath, oComputedEditMode, oProperty) {
      const oInterface = oContext.getInterface(0);
      const oModel = oInterface.getModel();
      if (sEntityPath === "/undefined" && oProperty && oProperty.$target) {
        sEntityPath = `/${oProperty.$target.fullyQualifiedName.split("/")[0]}`;
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode);
    },
    /**
     * Method to get enabled expression for DataFieldActionButton.
     *
     * @function
     * @name isDataFieldActionButtonEnabled
     * @param oDataField DataPoint's Value
     * @param bIsBound DataPoint action bound
     * @param oActionContext ActionContext Value
     * @param sActionContextFormat Formatted value of ActionContext
     * @returns A boolean or string expression for enabled property
     */
    isDataFieldActionButtonEnabled: function (oDataField, bIsBound, oActionContext, sActionContextFormat) {
      if (bIsBound !== true) {
        return "true";
      }
      return (oActionContext === null ? "{= !${#" + oDataField.Action + "} ? false : true }" : oActionContext) ? sActionContextFormat : "true";
    },
    /**
     * Method to compute the label for a DataField.
     * If the DataField's label is an empty string, it's not rendered even if a fallback exists.
     *
     * @function
     * @name computeLabelText
     * @param {object} oDataField The DataField being processed
     * @param {object} oInterface The interface for context instance
     * @returns {string} The computed text for the DataField label.
     */

    computeLabelText: function (oDataField, oInterface) {
      const oModel = oInterface.context.getModel();
      let sContextPath = oInterface.context.getPath();
      if (sContextPath.endsWith("/")) {
        sContextPath = sContextPath.slice(0, sContextPath.lastIndexOf("/"));
      }
      const sDataFieldLabel = oModel.getObject(`${sContextPath}/Label`);
      //We do not show an additional label text for a button:
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return undefined;
      }
      if (sDataFieldLabel) {
        return sDataFieldLabel;
      } else if (sDataFieldLabel === "") {
        return "";
      }
      let sDataFieldTargetTitle;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Title`);
        }
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.Communication.v1.Contact") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/fn/$Path@com.sap.vocabularies.Common.v1.Label`);
        }
      }
      if (sDataFieldTargetTitle) {
        return sDataFieldTargetTitle;
      }
      let sDataFieldTargetLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Label`);
      }
      if (sDataFieldTargetLabel) {
        return sDataFieldTargetLabel;
      }
      const sDataFieldValueLabel = oModel.getObject(`${sContextPath}/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      if (sDataFieldValueLabel) {
        return sDataFieldValueLabel;
      }
      let sDataFieldTargetValueLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetValueLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      }
      if (sDataFieldTargetValueLabel) {
        return sDataFieldTargetValueLabel;
      }
      return "";
    },
    /**
     * Method to align the data fields with their label.
     *
     * @function
     * @name buildExpressionForAlignItems
     * @param sVisualization
     * @returns Expression binding for alignItems property
     */
    buildExpressionForAlignItems: function (sVisualization) {
      const fieldVisualizationBindingExpression = constant(sVisualization);
      const progressVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Progress");
      const ratingVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Rating");
      return compileExpression(ifElse(or(equal(fieldVisualizationBindingExpression, progressVisualizationBindingExpression), equal(fieldVisualizationBindingExpression, ratingVisualizationBindingExpression)), constant("Center"), ifElse(UI.IsEditable, constant("Center"), constant("Stretch"))));
    },
    /**
     * Method to check ValueListReferences, ValueListMapping and ValueList inside ActionParameters for FieldHelp.
     *
     * @function
     * @name hasValueHelp
     * @param oPropertyAnnotations Action parameter object
     * @returns `true` if there is a ValueList* annotation defined
     */
    hasValueHelpAnnotation: function (oPropertyAnnotations) {
      if (oPropertyAnnotations) {
        return !!(oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]);
      }
      return false;
    },
    /**
     * Method to get display property for ActionParameter dialog.
     *
     * 	@function
     * @name getAPDialogDisplayFormat
     * @param oProperty The action parameter instance
     * @param oInterface The interface for the context instance
     * @returns The display format  for an action parameter Field
     */
    getAPDialogDisplayFormat: function (oProperty, oInterface) {
      let oAnnotation;
      const oModel = oInterface.context.getModel();
      const sContextPath = oInterface.context.getPath();
      const sPropertyName = oProperty.$Name || oInterface.context.getProperty(`${sContextPath}@sapui.name`);
      const oActionParameterAnnotations = oModel.getObject(`${sContextPath}@`);
      const oValueHelpAnnotation = oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"];
      const getValueListPropertyName = function (oValueList) {
        const oValueListParameter = oValueList.Parameters.find(function (oParameter) {
          return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
        });
        return oValueListParameter && oValueListParameter.ValueListProperty;
      };
      let sValueListPropertyName;
      if (oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.TextArrangement"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) {
        return CommonUtils.computeDisplayMode(oActionParameterAnnotations, undefined);
      } else if (oValueHelpAnnotation) {
        if (oValueHelpAnnotation.CollectionPath) {
          // get the name of the corresponding property in value list collection
          sValueListPropertyName = getValueListPropertyName(oValueHelpAnnotation);
          if (!sValueListPropertyName) {
            return "Value";
          }
          // get text for this property
          oAnnotation = oModel.getObject(`/${oValueHelpAnnotation.CollectionPath}/${sValueListPropertyName}@`);
          return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
        } else {
          return oModel.requestValueListInfo(sContextPath, true).then(function (oValueListInfo) {
            // get the name of the corresponding property in value list collection
            sValueListPropertyName = getValueListPropertyName(oValueListInfo[""]);
            if (!sValueListPropertyName) {
              return "Value";
            }
            // get text for this property
            oAnnotation = oValueListInfo[""].$model.getMetaModel().getObject(`/${oValueListInfo[""]["CollectionPath"]}/${sValueListPropertyName}@`);
            return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
          });
        }
      } else {
        return "Value";
      }
    },
    /**
     * Method to get display property for ActionParameter dialog FieldHelp.
     *
     * @function
     * @name getActionParameterDialogFieldHelp
     * @param oActionParameter Action parameter object
     * @param sSapUIName Action sapui name
     * @param sParamName The parameter name
     * @returns The ID of the fieldHelp used by this action parameter
     */
    getActionParameterDialogFieldHelp: function (oActionParameter, sSapUIName, sParamName) {
      return this.hasValueHelpAnnotation(oActionParameter) ? generate([sSapUIName, sParamName]) : undefined;
    },
    /**
     * Method to get the delegate configuration for ActionParameter dialog.
     *
     * @function
     * @name getValueHelpDelegate
     * @param isBound Action is bound
     * @param entityTypePath The EntityType Path
     * @param sapUIName The name of the Action
     * @param paramName The name of the ActionParameter
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegate: function (isBound, entityTypePath, sapUIName, paramName) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(ValueListHelper.getPropertyPath({
            UnboundAction: !isBound,
            EntityTypePath: entityTypePath,
            Action: sapUIName,
            Property: paramName
          })),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes(""),
          isActionParameterDialog: true
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to get the delegate configuration for NonComputedVisibleKeyField dialog.
     *
     * @function
     * @name getValueHelpDelegateForNonComputedVisibleKeyField
     * @param propertyPath The current property path
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegateForNonComputedVisibleKeyField: function (propertyPath) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(propertyPath),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes("")
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to fetch entity from a path containing multiple associations.
     *
     * @function
     * @name _getEntitySetFromMultiLevel
     * @param oContext The context whose path is to be checked
     * @param sPath The path from which entity has to be fetched
     * @param sSourceEntity The entity path in which nav entity exists
     * @param iStart The start index : beginning parts of the path to be ignored
     * @param iDiff The diff index : end parts of the path to be ignored
     * @returns The path of the entity set
     */
    _getEntitySetFromMultiLevel: function (oContext, sPath, sSourceEntity, iStart, iDiff) {
      let aNavParts = sPath.split("/").filter(Boolean);
      aNavParts = aNavParts.filter(function (sPart) {
        return sPart !== "$NavigationPropertyBinding";
      });
      if (aNavParts.length > 0) {
        for (let i = iStart; i < aNavParts.length - iDiff; i++) {
          sSourceEntity = `/${oContext.getObject(`${sSourceEntity}/$NavigationPropertyBinding/${aNavParts[i]}`)}`;
        }
      }
      return sSourceEntity;
    },
    /**
     * Method to find the entity of the property.
     *
     * @function
     * @name getPropertyCollection
     * @param oProperty The context from which datafield's path needs to be extracted.
     * @param oContextObject The Metadata Context(Not passed when called with template:with)
     * @returns The entity set path of the property
     */
    getPropertyCollection: function (oProperty, oContextObject) {
      const oContext = oContextObject && oContextObject.context || oProperty;
      const sPath = oContext.getPath();
      const aMainEntityParts = sPath.split("/").filter(Boolean);
      const sMainEntity = aMainEntityParts[0];
      const sPropertyPath = oContext.getObject("$Path");
      let sFieldSourceEntity = `/${sMainEntity}`;
      // checking against prefix of annotations, ie. @com.sap.vocabularies.
      // as annotation path can be of a line item, field group or facet
      if (sPath.indexOf("/@com.sap.vocabularies.") > -1) {
        const iAnnoIndex = sPath.indexOf("/@com.sap.vocabularies.");
        const sInnerPath = sPath.substring(0, iAnnoIndex);
        // the facet or line item's entity could be a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sInnerPath, sFieldSourceEntity, 1, 0);
      }
      if (sPropertyPath && sPropertyPath.indexOf("/") > -1) {
        // the field within facet or line item could be from a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sPropertyPath, sFieldSourceEntity, 0, 1);
      }
      return sFieldSourceEntity;
    },
    /**
     * Method used in a template with to retrieve the currency or the unit property inside a templating variable.
     *
     * @param oPropertyAnnotations
     * @returns The annotationPath to be dealt with by template:with
     */
    getUnitOrCurrency: function (oPropertyAnnotations) {
      const oPropertyAnnotationsObject = oPropertyAnnotations.getObject();
      let sAnnotationPath = oPropertyAnnotations.sPath;
      if (oPropertyAnnotationsObject["@Org.OData.Measures.V1.ISOCurrency"]) {
        sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.ISOCurrency`;
      } else {
        sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.Unit`;
      }
      return sAnnotationPath;
    },
    hasStaticUnitOrCurrency: function (oPropertyAnnotations) {
      return oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] ? !oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"].$Path : !oPropertyAnnotations["@Org.OData.Measures.V1.Unit"].$Path;
    },
    getStaticUnitOrCurrency: function (oPropertyAnnotations, oFormatOptions) {
      if (oFormatOptions && oFormatOptions.measureDisplayMode !== "Hidden") {
        const unit = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];
        const dateFormat = DateFormat.getDateInstance();
        const localeData = dateFormat.oLocaleData.mData;
        if (localeData && localeData.units && localeData.units.short && localeData.units.short[unit] && localeData.units.short[unit].displayName) {
          return localeData.units.short[unit].displayName;
        }
        return unit;
      }
    },
    getEmptyIndicatorTrigger: function (bActive, sBinding, sFullTextBinding) {
      if (sFullTextBinding) {
        return bActive ? sFullTextBinding : "inactive";
      }
      return bActive ? sBinding : "inactive";
    },
    /**
     * When the value displayed is in text arrangement TextOnly we also want to retrieve the Text value for tables even if we don't show it.
     * This method will return the value of the original data field.
     *
     * @param oThis The current object
     * @param oDataFieldTextArrangement DataField using text arrangement annotation
     * @param oDataField DataField containing the value using text arrangement annotation
     * @returns The binding to the value
     */
    getBindingInfoForTextArrangement: function (oThis, oDataFieldTextArrangement, oDataField) {
      if (oDataFieldTextArrangement && oDataFieldTextArrangement.$EnumMember && oDataFieldTextArrangement.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && oDataField) {
        return `{${oDataField.Value.$Path}}`;
      }
      return undefined;
    },
    semanticKeyFormat: function (vRaw, oInterface) {
      // The Empty argument ensures that "groupingEnabled" is added to "formatOptions"
      oInterface.arguments = [{}, {
        groupingEnabled: false
      }];
      return AnnotationHelper.format(vRaw, oInterface);
    },
    getPathForIconSource: function (sPropertyPath) {
      return "{= FIELDRUNTIME.getIconForMimeType(%{" + sPropertyPath + "@odata.mediaContentType})}";
    },
    getFilenameExpr: function (sFilename, sNoFilenameText) {
      if (sFilename) {
        if (sFilename.indexOf("{") === 0) {
          // filename is referenced via path, i.e. @Core.ContentDisposition.Filename : path
          return "{= $" + sFilename + " ? $" + sFilename + " : $" + sNoFilenameText + "}";
        }
        // static filename, i.e. @Core.ContentDisposition.Filename : 'someStaticName'
        return sFilename;
      }
      // no @Core.ContentDisposition.Filename
      return sNoFilenameText;
    },
    calculateMBfromByte: function (iByte) {
      return iByte ? (iByte / (1024 * 1024)).toFixed(6) : undefined;
    },
    getDownloadUrl: function (propertyPath) {
      return propertyPath + "{= ${internal>/stickySessionToken} ? ('?SAP-ContextId=' + ${internal>/stickySessionToken}) : '' }";
    },
    getMarginClass: function (compactSemanticKey) {
      return compactSemanticKey === "true" || compactSemanticKey === true ? "sapMTableContentMargin" : undefined;
    },
    getRequired: function (immutableKey, target, requiredProperties) {
      let targetRequiredExpression = constant(false);
      if (target !== null) {
        targetRequiredExpression = isRequiredExpression(target === null || target === void 0 ? void 0 : target.targetObject);
      }
      return compileExpression(or(targetRequiredExpression, requiredProperties.indexOf(immutableKey) > -1));
    },
    /**
     * The method checks if the field is already part of a form.
     *
     * @param dataFieldCollection The list of the fields of the form
     * @param dataFieldObjectPath The data model object path of the field which needs to be checked in the form
     * @returns `true` if the field is already part of the form, `false` otherwise
     */
    isFieldPartOfForm: function (dataFieldCollection, dataFieldObjectPath) {
      //generating key for the received data field
      const connectedDataFieldKey = KeyHelper.generateKeyFromDataField(dataFieldObjectPath.targetObject);
      // trying to find the generated key in already existing form elements
      const isFieldFound = dataFieldCollection.find(field => {
        return field.key === connectedDataFieldKey;
      });
      return isFieldFound ? true : false;
    }
  };
  FieldHelper.buildExpressionForTextValue.requiresIContext = true;
  FieldHelper.fieldControl.requiresIContext = true;
  FieldHelper.getTypeAlignment.requiresIContext = true;
  FieldHelper.getPropertyCollection.requiresIContext = true;
  FieldHelper.getAPDialogDisplayFormat.requiresIContext = true;
  FieldHelper.semanticKeyFormat.requiresIContext = true;
  FieldHelper.computeLabelText.requiresIContext = true;
  FieldHelper.getActionParameterVisibility.requiresIContext = true;
  return FieldHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJU09DdXJyZW5jeSIsIlVuaXQiLCJGaWVsZEhlbHBlciIsImRpc3BsYXlNb2RlIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvQ29sbGVjdGlvbkFubm90YXRpb25zIiwib1RleHRBbm5vdGF0aW9uIiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsImJ1aWxkRXhwcmVzc2lvbkZvclRleHRWYWx1ZSIsInNQcm9wZXJ0eVBhdGgiLCJvRGF0YUZpZWxkIiwib01ldGFNb2RlbCIsImNvbnRleHQiLCJnZXRNb2RlbCIsInNQYXRoIiwiZ2V0UGF0aCIsIm9UZXh0QW5ub3RhdGlvbkNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5Iiwic1RleHRFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsInZhbHVlIiwidW5kZWZpbmVkIiwic0V4cHJlc3Npb24iLCJnZXROYXZpZ2F0aW9uUGF0aCIsImluZGV4T2YiLCJyZXBsYWNlIiwic3Vic3RyIiwibGVuZ3RoIiwiYnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGgiLCJvRGF0YU1vZGVsT2JqZWN0UGF0aCIsInNTYXJ0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYW1lIiwiYU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJpIiwiaXNOb3RBbHdheXNIaWRkZW4iLCJvRGV0YWlscyIsIm9Db250ZXh0IiwiaXNBbHdheXNIaWRkZW4iLCJWYWx1ZSIsIiRQYXRoIiwiZ2V0T2JqZWN0IiwiaXNEcmFmdEluZGljYXRvclZpc2libGVJbkZpZWxkR3JvdXAiLCJjb2x1bW4iLCJmb3JtYXRPcHRpb25zIiwiZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoIiwiZmllbGRHcm91cE5hbWUiLCJpc1JlcXVpcmVkIiwib0ZpZWxkQ29udHJvbCIsInNFZGl0TW9kZSIsIk1hbmFnZWRPYmplY3QiLCJiaW5kaW5nUGFyc2VyIiwiZ2V0QWN0aW9uUGFyYW1ldGVyVmlzaWJpbGl0eSIsIm9QYXJhbSIsIiRJZiIsIm9OZWdQYXJhbSIsInByb3BlcnR5TmFtZSIsInZQcm9wZXJ0eSIsIm9JbnRlcmZhY2UiLCJzUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsInNDb250ZXh0UGF0aCIsImZpZWxkQ29udHJvbCIsIm9Nb2RlbCIsIm9GaWVsZENvbnRyb2xDb250ZXh0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUNvbnRleHQiLCJiSW5GaWx0ZXJGaWVsZCIsIm9Db250ZW50Iiwic0Fubm9QYXRoIiwic0Fubm90YXRpb24iLCJzVW5pdE9yQ3VycmVuY3lQYXRoIiwidmFsdWVIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZCIsImdldElERm9yRmllbGRWYWx1ZUhlbHAiLCJzRmxleElkIiwic0lkUHJlZml4Iiwic09yaWdpbmFsUHJvcGVydHlOYW1lIiwic1Byb3BlcnR5IiwiZ2VuZXJhdGUiLCJnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkIiwicHJvcGVydHlDb250ZXh0Iiwib1Byb3BlcnR5Iiwic1Byb3BlcnR5VHlwZSIsInNWaElkUHJlZml4Iiwic1ZhbHVlSGVscFByb3BlcnR5TmFtZSIsImJIYXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJiU2VtYW50aWNEYXRlUmFuZ2UiLCJzUHJvcGVydHlMb2NhdGlvblBhdGgiLCJDb21tb25IZWxwZXIiLCJnZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aCIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJDb21tb25VdGlscyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCIsIkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyIsImdldE9iamVjdElkZW50aWZpZXJUZXh0Iiwic1Byb3BlcnR5VmFsdWVCaW5kaW5nIiwic0RhdGFGaWVsZE5hbWUiLCJnZXRTZW1hbnRpY09iamVjdHNMaXN0IiwicHJvcGVydHlBbm5vdGF0aW9ucyIsImFubm90YXRpb25zIiwiYVNlbWFudGljT2JqZWN0cyIsImtleSIsInNlbWFudGljT2JqZWN0VmFsdWUiLCJwdXNoIiwib1NlbWFudGljT2JqZWN0c01vZGVsIiwiSlNPTk1vZGVsIiwiJCR2YWx1ZUFzUHJvbWlzZSIsImdldFNlbWFudGljT2JqZWN0c1F1YWxpZmllcnMiLCJxdWFsaWZpZXJzQW5ub3RhdGlvbnMiLCJmaW5kT2JqZWN0IiwicXVhbGlmaWVyIiwiZmluZCIsIm9iamVjdCIsImFubm90YXRpb25Db250ZW50IiwiYW5ub3RhdGlvbiIsInNwbGl0IiwicXVhbGlmaWVyT2JqZWN0IiwiZmlsdGVyIiwib1F1YWxpZmllciIsIm9RdWFsaWZpZXJzTW9kZWwiLCJoYXNTZW1hbnRpY09iamVjdHNXaXRoUGF0aCIsImJTZW1hbnRpY09iamVjdEhhc0FQYXRoIiwiaXNTZW1hbnRpY0tleUhhc0ZpZWxkR3JvdXBDb2x1bW4iLCJpc0ZpZWxkR3JvdXBDb2x1bW4iLCJjb21wdXRlRmllbGRCYXNlRGVsZWdhdGUiLCJkZWxlZ2F0ZU5hbWUiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiSlNPTiIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJfZ2V0UHJpbWFyeUludGVudHMiLCJhU2VtYW50aWNPYmplY3RzTGlzdCIsImFQcm9taXNlcyIsIm9Vc2hlbGxDb250YWluZXIiLCJzYXAiLCJ1c2hlbGwiLCJDb250YWluZXIiLCJvU2VydmljZSIsImdldFNlcnZpY2UiLCJmb3JFYWNoIiwic2VtT2JqZWN0IiwiZ2V0UHJpbWFyeUludGVudCIsIlByb21pc2UiLCJhbGwiLCJ0aGVuIiwiYVNlbU9iamVjdFByaW1hcnlBY3Rpb24iLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiX2NoZWNrSWZTZW1hbnRpY09iamVjdHNIYXNQcmltYXJ5QWN0aW9uIiwib1NlbWFudGljcyIsImFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucyIsImFwcENvbXBvbmVudCIsIl9mbklzU2VtYW50aWNPYmplY3RBY3Rpb25VbmF2YWlsYWJsZSIsIl9vU2VtYW50aWNzIiwiX29QcmltYXJ5QWN0aW9uIiwiX2luZGV4IiwidW5hdmFpbGFibGVBY3Rpb25zSW5kZXgiLCJzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImFjdGlvbnMiLCJpbnRlbnQiLCJzZW1hbnRpY1ByaW1hcnlBY3Rpb25zIiwib1ByaW1hcnlBY3Rpb24iLCJzZW1hbnRpY09iamVjdHMiLCJtYWluU2VtYW50aWNPYmplY3QiLCJzQ3VycmVudEhhc2giLCJnZXRTaGVsbFNlcnZpY2VzIiwiZ2V0SGFzaCIsImluZGV4Iiwic2VtYW50aWNPYmplY3QiLCJjaGVja1ByaW1hcnlBY3Rpb25zIiwiYkdldFRpdGxlTGluayIsInRpdGxlTGluayIsImhhc1RpdGxlTGluayIsIl9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVycyIsIl9vU2VtYW50aWNPYmplY3RNb2RlbCIsIl9saW5rSW50ZW50IiwidGl0bGVsaW5rIiwiZ2V0UHJpbWFyeUFjdGlvbiIsInByaW1hcnlJbnRlbnRBY3Rpb24iLCJvcGVyYXRvcnMiLCJzU2V0dGluZ3MiLCJjb250ZXh0UGF0aCIsInByb3BlcnR5VHlwZSIsIiRUeXBlIiwiZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5Iiwic2xpY2UiLCJpc1RhYmxlQm91bmRUb05hdmlnYXRpb24iLCJsYXN0SW5kZXhPZiIsImlzTmF2aWdhdGlvblBhdGgiLCJuYXZpZ2F0aW9uUGF0aCIsInByb3BlcnR5UGF0aCIsImdldE9wZXJhdG9yc0ZvclByb3BlcnR5IiwiTW9kZWxIZWxwZXIiLCJnZXRFbnRpdHlTZXRQYXRoIiwidG9TdHJpbmciLCJnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHkiLCJnZXRQcm9wZXJ0eUNvbnRleHRGb3JRdWlja1ZpZXciLCJvRGF0YUZpZWxkQ29udGV4dCIsImdldEludGVyZmFjZSIsImVuZHNXaXRoIiwiZ2V0UHJvcGVydHlQYXRoRm9yUXVpY2tWaWV3IiwiZ2V0RGF0YUZpZWxkRGVmYXVsdCIsIm9EYXRhRmllbGREZWZhdWx0IiwiaXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlIiwib1RoaXMiLCJiSXNCb3VuZCIsIm9BY3Rpb25Db250ZXh0IiwiZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvbiIsInNJbnZvY2F0aW9uR3JvdXBpbmciLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJiSXNOYXZpZ2FibGUiLCJuYXZpZ2F0ZUFmdGVyQWN0aW9uIiwiZW50aXRpZXMiLCJlbnRpdHlTZXQiLCJlbnRpdHlTZXROYW1lIiwib1BhcmFtcyIsImNvbnRleHRzIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiYWRkU2luZ2xlUXVvdGVzIiwibW9kZWwiLCJsYWJlbCIsIkxhYmVsIiwiaXNOYXZpZ2FibGUiLCJnZW5lcmF0ZUZ1bmN0aW9uIiwiQWN0aW9uIiwib2JqZWN0VG9TdHJpbmciLCJpc051bWVyaWNEYXRhVHlwZSIsInNEYXRhRmllbGRUeXBlIiwiX3NEYXRhRmllbGRUeXBlIiwiYU51bWVyaWNEYXRhVHlwZXMiLCJpc0RhdGVPclRpbWVEYXRhVHlwZSIsImFEYXRlVGltZURhdGFUeXBlcyIsImlzRGF0ZVRpbWVEYXRhVHlwZSIsImFEYXRlRGF0YVR5cGVzIiwiaXNEYXRlRGF0YVR5cGUiLCJpc1RpbWVEYXRhVHlwZSIsImdldERhdGFUeXBlRm9yVmlzdWFsaXphdGlvbiIsIm9Bbm5vdGF0aW9ucyIsInNUeXBlIiwic1RleHRBbm5vdGF0aW9uIiwic1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCJnZXRDb2x1bW5BbGlnbm1lbnQiLCJvVGFibGUiLCJzRW50aXR5UGF0aCIsImNvbGxlY3Rpb24iLCJJbmxpbmUiLCJJY29uVXJsIiwiYVNlbWFudGljS2V5cyIsImJJc1NlbWFudGljS2V5IiwiZXZlcnkiLCJvS2V5IiwiZ2V0RGF0YUZpZWxkQWxpZ25tZW50IiwiZ2V0UHJvcGVydHlBbGlnbm1lbnQiLCJvRm9ybWF0T3B0aW9ucyIsIm9Db21wdXRlZEVkaXRNb2RlIiwic0RlZmF1bHRBbGlnbm1lbnQiLCJzVGV4dEFsaWdubWVudCIsInRleHRBbGlnbk1vZGUiLCJnZXRBbGlnbm1lbnRFeHByZXNzaW9uIiwic0RhdGFGaWVsZFBhdGgiLCJUYXJnZXQiLCIkQW5ub3RhdGlvblBhdGgiLCJvRmllbGRHcm91cCIsIkRhdGEiLCJnZXRUeXBlQWxpZ25tZW50IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZCIsInNBY3Rpb25Db250ZXh0Rm9ybWF0IiwiY29tcHV0ZUxhYmVsVGV4dCIsInNEYXRhRmllbGRMYWJlbCIsInNEYXRhRmllbGRUYXJnZXRUaXRsZSIsInNEYXRhRmllbGRUYXJnZXRMYWJlbCIsInNEYXRhRmllbGRWYWx1ZUxhYmVsIiwic0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWwiLCJidWlsZEV4cHJlc3Npb25Gb3JBbGlnbkl0ZW1zIiwic1Zpc3VhbGl6YXRpb24iLCJmaWVsZFZpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImNvbnN0YW50IiwicHJvZ3Jlc3NWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJyYXRpbmdWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImlmRWxzZSIsIm9yIiwiZXF1YWwiLCJVSSIsIklzRWRpdGFibGUiLCJoYXNWYWx1ZUhlbHBBbm5vdGF0aW9uIiwiZ2V0QVBEaWFsb2dEaXNwbGF5Rm9ybWF0Iiwib0Fubm90YXRpb24iLCIkTmFtZSIsIm9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9ucyIsIm9WYWx1ZUhlbHBBbm5vdGF0aW9uIiwiZ2V0VmFsdWVMaXN0UHJvcGVydHlOYW1lIiwib1ZhbHVlTGlzdCIsIm9WYWx1ZUxpc3RQYXJhbWV0ZXIiLCJQYXJhbWV0ZXJzIiwib1BhcmFtZXRlciIsIkxvY2FsRGF0YVByb3BlcnR5IiwiVmFsdWVMaXN0UHJvcGVydHkiLCJzVmFsdWVMaXN0UHJvcGVydHlOYW1lIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwiQ29sbGVjdGlvblBhdGgiLCJyZXF1ZXN0VmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RJbmZvIiwiJG1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0QWN0aW9uUGFyYW1ldGVyRGlhbG9nRmllbGRIZWxwIiwib0FjdGlvblBhcmFtZXRlciIsInNTYXBVSU5hbWUiLCJzUGFyYW1OYW1lIiwiZ2V0VmFsdWVIZWxwRGVsZWdhdGUiLCJpc0JvdW5kIiwiZW50aXR5VHlwZVBhdGgiLCJzYXBVSU5hbWUiLCJwYXJhbU5hbWUiLCJkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24iLCJWYWx1ZUxpc3RIZWxwZXIiLCJnZXRQcm9wZXJ0eVBhdGgiLCJVbmJvdW5kQWN0aW9uIiwiRW50aXR5VHlwZVBhdGgiLCJQcm9wZXJ0eSIsInF1YWxpZmllcnMiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJpc0FjdGlvblBhcmFtZXRlckRpYWxvZyIsImdldFZhbHVlSGVscERlbGVnYXRlRm9yTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQiLCJfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWwiLCJzU291cmNlRW50aXR5IiwiaVN0YXJ0IiwiaURpZmYiLCJhTmF2UGFydHMiLCJCb29sZWFuIiwic1BhcnQiLCJnZXRQcm9wZXJ0eUNvbGxlY3Rpb24iLCJvQ29udGV4dE9iamVjdCIsImFNYWluRW50aXR5UGFydHMiLCJzTWFpbkVudGl0eSIsInNGaWVsZFNvdXJjZUVudGl0eSIsImlBbm5vSW5kZXgiLCJzSW5uZXJQYXRoIiwic3Vic3RyaW5nIiwiZ2V0VW5pdE9yQ3VycmVuY3kiLCJvUHJvcGVydHlBbm5vdGF0aW9uc09iamVjdCIsInNBbm5vdGF0aW9uUGF0aCIsImhhc1N0YXRpY1VuaXRPckN1cnJlbmN5IiwiZ2V0U3RhdGljVW5pdE9yQ3VycmVuY3kiLCJtZWFzdXJlRGlzcGxheU1vZGUiLCJ1bml0IiwiZGF0ZUZvcm1hdCIsIkRhdGVGb3JtYXQiLCJnZXREYXRlSW5zdGFuY2UiLCJsb2NhbGVEYXRhIiwib0xvY2FsZURhdGEiLCJtRGF0YSIsInVuaXRzIiwic2hvcnQiLCJkaXNwbGF5TmFtZSIsImdldEVtcHR5SW5kaWNhdG9yVHJpZ2dlciIsImJBY3RpdmUiLCJzQmluZGluZyIsInNGdWxsVGV4dEJpbmRpbmciLCJnZXRCaW5kaW5nSW5mb0ZvclRleHRBcnJhbmdlbWVudCIsIm9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQiLCJzZW1hbnRpY0tleUZvcm1hdCIsInZSYXciLCJhcmd1bWVudHMiLCJncm91cGluZ0VuYWJsZWQiLCJmb3JtYXQiLCJnZXRQYXRoRm9ySWNvblNvdXJjZSIsImdldEZpbGVuYW1lRXhwciIsInNGaWxlbmFtZSIsInNOb0ZpbGVuYW1lVGV4dCIsImNhbGN1bGF0ZU1CZnJvbUJ5dGUiLCJpQnl0ZSIsInRvRml4ZWQiLCJnZXREb3dubG9hZFVybCIsImdldE1hcmdpbkNsYXNzIiwiY29tcGFjdFNlbWFudGljS2V5IiwiZ2V0UmVxdWlyZWQiLCJpbW11dGFibGVLZXkiLCJ0YXJnZXQiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJ0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb24iLCJpc1JlcXVpcmVkRXhwcmVzc2lvbiIsInRhcmdldE9iamVjdCIsImlzRmllbGRQYXJ0T2ZGb3JtIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsImRhdGFGaWVsZE9iamVjdFBhdGgiLCJjb25uZWN0ZWREYXRhRmllbGRLZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJpc0ZpZWxkRm91bmQiLCJmaWVsZCIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBGb3JtRWxlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgZXF1YWwsIGlmRWxzZSwgb3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNSZXF1aXJlZEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWVsZENvbnRyb2xIZWxwZXJcIjtcbmltcG9ydCB7IGdldEFsaWdubWVudEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFZhbHVlSGVscFBheWxvYWQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgRGF0ZUZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L0RhdGVGb3JtYXRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5cbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgQmFzZUNvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBJU09DdXJyZW5jeSA9IFwiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiLFxuXHRVbml0ID0gXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXRcIjtcblxuY29uc3QgRmllbGRIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaG93IHRvIHNob3cgdGhlIHZhbHVlIGJ5IGFuYWx5emluZyBUZXh0IGFuZCBUZXh0QXJyYW5nZW1lbnQgQW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyI2Rpc3BsYXlNb2RlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUFubm90YXRpb25zIFRoZSBQcm9wZXJ0eSBhbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyBUaGUgRW50aXR5VHlwZSBhbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBUaGUgZGlzcGxheSBtb2RlIG9mIHRoZSBmaWVsZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGRpc3BsYXlNb2RlOiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSwgb0NvbGxlY3Rpb25Bbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0sXG5cdFx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9XG5cdFx0XHRcdG9UZXh0QW5ub3RhdGlvbiAmJlxuXHRcdFx0XHQoKG9Qcm9wZXJ0eUFubm90YXRpb25zICYmXG5cdFx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSB8fFxuXHRcdFx0XHRcdChvQ29sbGVjdGlvbkFubm90YXRpb25zICYmIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSk7XG5cblx0XHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24pIHtcblx0XHRcdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRcdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25cIjtcblx0XHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRcdHJldHVybiBcIlZhbHVlRGVzY3JpcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdC8vRGVmYXVsdCBzaG91bGQgYmUgVGV4dEZpcnN0IGlmIHRoZXJlIGlzIGEgVGV4dCBhbm5vdGF0aW9uIGFuZCBuZWl0aGVyIFRleHRPbmx5IG5vciBUZXh0TGFzdCBhcmUgc2V0XG5cdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiBvVGV4dEFubm90YXRpb24gPyBcIkRlc2NyaXB0aW9uVmFsdWVcIiA6IFwiVmFsdWVcIjtcblx0fSxcblx0YnVpbGRFeHByZXNzaW9uRm9yVGV4dFZhbHVlOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogYW55LCBvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0RhdGFGaWVsZC5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvRGF0YUZpZWxkLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbkNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGApO1xuXHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9UZXh0QW5ub3RhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoKTtcblx0XHRjb25zdCBzVGV4dEV4cHJlc3Npb24gPSBvVGV4dEFubm90YXRpb24gPyBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKG9UZXh0QW5ub3RhdGlvbiwgeyBjb250ZXh0OiBvVGV4dEFubm90YXRpb25Db250ZXh0IH0pIDogdW5kZWZpbmVkO1xuXHRcdGxldCBzRXhwcmVzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIjtcblx0XHRzUHJvcGVydHlQYXRoID0gQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzUHJvcGVydHlQYXRoKTtcblx0XHRpZiAoc1Byb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xICYmIHNUZXh0RXhwcmVzc2lvbikge1xuXHRcdFx0c0V4cHJlc3Npb24gPSBzUHJvcGVydHlQYXRoLnJlcGxhY2UoL1teL10qJC8sIHNUZXh0RXhwcmVzc2lvbi5zdWJzdHIoMSwgc1RleHRFeHByZXNzaW9uLmxlbmd0aCAtIDIpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0V4cHJlc3Npb24gPSBzVGV4dEV4cHJlc3Npb247XG5cdFx0fVxuXHRcdGlmIChzRXhwcmVzc2lvbikge1xuXHRcdFx0c0V4cHJlc3Npb24gPSBcInsgcGF0aCA6ICdcIiArIHNFeHByZXNzaW9uLnJlcGxhY2UoL15cXHsrL2csIFwiXCIpLnJlcGxhY2UoL1xcfSskL2csIFwiXCIpICsgXCInLCBwYXJhbWV0ZXJzOiB7JyQkbm9QYXRjaCc6IHRydWV9fVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc0V4cHJlc3Npb247XG5cdH0sXG5cblx0YnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGg6IGZ1bmN0aW9uIChvRGF0YU1vZGVsT2JqZWN0UGF0aDogYW55KSB7XG5cdFx0Y29uc3Qgc1NhcnRFbnRpdHlTZXQgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lO1xuXHRcdGxldCBzUGF0aCA9IGAvJHtzU2FydEVudGl0eVNldH1gO1xuXHRcdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydGllcyA9IG9EYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRzUGF0aCArPSBgLyR7YU5hdmlnYXRpb25Qcm9wZXJ0aWVzW2ldLm5hbWV9YDtcblx0XHR9XG5cdFx0cmV0dXJuIHNQYXRoO1xuXHR9LFxuXHRpc05vdEFsd2F5c0hpZGRlbjogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb0RldGFpbHM6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb0RldGFpbHMuY29udGV4dDtcblx0XHRsZXQgaXNBbHdheXNIaWRkZW46IGFueSA9IGZhbHNlO1xuXHRcdGlmIChvRGF0YUZpZWxkLlZhbHVlICYmIG9EYXRhRmllbGQuVmFsdWUuJFBhdGgpIHtcblx0XHRcdGlzQWx3YXlzSGlkZGVuID0gb0NvbnRleHQuZ2V0T2JqZWN0KFwiVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCIpO1xuXHRcdH1cblx0XHRpZiAoIWlzQWx3YXlzSGlkZGVuIHx8IGlzQWx3YXlzSGlkZGVuLiRQYXRoKSB7XG5cdFx0XHRpc0Fsd2F5c0hpZGRlbiA9IG9Db250ZXh0LmdldE9iamVjdChcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIik7XG5cdFx0XHRpZiAoIWlzQWx3YXlzSGlkZGVuIHx8IGlzQWx3YXlzSGlkZGVuLiRQYXRoKSB7XG5cdFx0XHRcdGlzQWx3YXlzSGlkZGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAhaXNBbHdheXNIaWRkZW47XG5cdH0sXG5cdGlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlSW5GaWVsZEdyb3VwOiBmdW5jdGlvbiAoY29sdW1uOiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHRjb2x1bW4gJiZcblx0XHRcdGNvbHVtbi5mb3JtYXRPcHRpb25zICYmXG5cdFx0XHRjb2x1bW4uZm9ybWF0T3B0aW9ucy5maWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGggJiZcblx0XHRcdGNvbHVtbi5mb3JtYXRPcHRpb25zLmZpZWxkR3JvdXBOYW1lXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcIntwYXJ0czogW1wiICtcblx0XHRcdFx0XCJ7dmFsdWU6ICdcIiArXG5cdFx0XHRcdGNvbHVtbi5mb3JtYXRPcHRpb25zLmZpZWxkR3JvdXBOYW1lICtcblx0XHRcdFx0XCInfSxcIiArXG5cdFx0XHRcdFwie3BhdGg6ICdpbnRlcm5hbD5zZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yJ30gLCBcIiArXG5cdFx0XHRcdFwie3BhdGg6ICdIYXNEcmFmdEVudGl0eScsIHRhcmdldFR5cGU6ICdhbnknfSwgXCIgK1xuXHRcdFx0XHRcIntwYXRoOiAnSXNBY3RpdmVFbnRpdHknLCB0YXJnZXRUeXBlOiAnYW55J30sIFwiICtcblx0XHRcdFx0XCJ7cGF0aDogJ3BhZ2VJbnRlcm5hbD5oaWRlRHJhZnRJbmZvJywgdGFyZ2V0VHlwZTogJ2FueSd9XSwgXCIgK1xuXHRcdFx0XHRcImZvcm1hdHRlcjogJ3NhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRSdW50aW1lLmlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlJ31cIlxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0aXNSZXF1aXJlZDogZnVuY3Rpb24gKG9GaWVsZENvbnRyb2w6IGFueSwgc0VkaXRNb2RlOiBhbnkpIHtcblx0XHRpZiAoc0VkaXRNb2RlID09PSBcIkRpc3BsYXlcIiB8fCBzRWRpdE1vZGUgPT09IFwiUmVhZE9ubHlcIiB8fCBzRWRpdE1vZGUgPT09IFwiRGlzYWJsZWRcIikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAob0ZpZWxkQ29udHJvbCkge1xuXHRcdFx0aWYgKChNYW5hZ2VkT2JqZWN0IGFzIGFueSkuYmluZGluZ1BhcnNlcihvRmllbGRDb250cm9sKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAlXCIgKyBvRmllbGRDb250cm9sICsgXCIgPT09IDd9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkQ29udHJvbCA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL01hbmRhdG9yeVwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0Z2V0QWN0aW9uUGFyYW1ldGVyVmlzaWJpbGl0eTogZnVuY3Rpb24gKG9QYXJhbTogYW55LCBvQ29udGV4dDogYW55KSB7XG5cdFx0Ly8gVG8gdXNlIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBmb3IgY29udHJvbGxpbmcgdmlzaWJpbGl0eSB0aGUgdmFsdWUgbmVlZHMgdG8gYmUgbmVnYXRlZFxuXHRcdGlmICh0eXBlb2Ygb1BhcmFtID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpZiAob1BhcmFtICYmIG9QYXJhbS4kSWYgJiYgb1BhcmFtLiRJZi5sZW5ndGggPT09IDMpIHtcblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGUgVUkuSGlkZGVuIGNvbnRhaW5zIGEgZHluYW1pYyBleHByZXNzaW9uIHdlIGRvIHRoaXNcblx0XHRcdFx0Ly8gYnkganVzdCBzd2l0Y2hpbmcgdGhlIFwidGhlblwiIGFuZCBcImVsc2VcIiBwYXJ0IG9mIHRoZSBlcnByZXNzaW9uXG5cdFx0XHRcdC8vIG9QYXJhbS4kSWZbMF0gPD09IENvbmRpdGlvbiBwYXJ0XG5cdFx0XHRcdC8vIG9QYXJhbS4kSWZbMV0gPD09IFRoZW4gcGFydFxuXHRcdFx0XHQvLyBvUGFyYW0uJElmWzJdIDw9PSBFbHNlIHBhcnRcblx0XHRcdFx0Y29uc3Qgb05lZ1BhcmFtOiBhbnkgPSB7ICRJZjogW10gfTtcblx0XHRcdFx0b05lZ1BhcmFtLiRJZlswXSA9IG9QYXJhbS4kSWZbMF07XG5cdFx0XHRcdG9OZWdQYXJhbS4kSWZbMV0gPSBvUGFyYW0uJElmWzJdO1xuXHRcdFx0XHRvTmVnUGFyYW0uJElmWzJdID0gb1BhcmFtLiRJZlsxXTtcblx0XHRcdFx0cmV0dXJuIEFubm90YXRpb25IZWxwZXIudmFsdWUob05lZ1BhcmFtLCBvQ29udGV4dCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAhJXtcIiArIG9QYXJhbS4kUGF0aCArIFwifSB9XCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygb1BhcmFtID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0cmV0dXJuIEFubm90YXRpb25IZWxwZXIudmFsdWUoIW9QYXJhbSwgb0NvbnRleHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ29tcHV0ZWQgYW5ub3RhdGlvbiB0aGF0IHJldHVybnMgdlByb3BlcnR5IGZvciBhIHN0cmluZyBhbmQgQHNhcHVpLm5hbWUgZm9yIGFuIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHZQcm9wZXJ0eSBUaGUgcHJvcGVydHlcblx0ICogQHBhcmFtIG9JbnRlcmZhY2UgVGhlIGludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBUaGUgcHJvcGVydHkgbmFtZVxuXHQgKi9cblx0cHJvcGVydHlOYW1lOiBmdW5jdGlvbiAodlByb3BlcnR5OiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGxldCBzUHJvcGVydHlOYW1lO1xuXHRcdGlmICh0eXBlb2YgdlByb3BlcnR5ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAob0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKS5pbmRleE9mKFwiJFBhdGhcIikgPiAtMSB8fCBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpLmluZGV4T2YoXCIkUHJvcGVydHlQYXRoXCIpID4gLTEpIHtcblx0XHRcdFx0Ly8gV2UgY291bGQgZW5kIHVwIHdpdGggYSBwdXJlIHN0cmluZyBwcm9wZXJ0eSAobm8gJFBhdGgpLCBhbmQgdGhpcyBpcyBub3QgYSByZWFsIHByb3BlcnR5IGluIHRoYXQgY2FzZVxuXHRcdFx0XHRzUHJvcGVydHlOYW1lID0gdlByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodlByb3BlcnR5LiRQYXRoIHx8IHZQcm9wZXJ0eS4kUHJvcGVydHlQYXRoKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IHZQcm9wZXJ0eS4kUGF0aCA/IFwiLyRQYXRoXCIgOiBcIi8kUHJvcGVydHlQYXRoXCI7XG5cdFx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0c1Byb3BlcnR5TmFtZSA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRoICsgc1BhdGh9LyRAc2FwdWkubmFtZWApO1xuXHRcdH0gZWxzZSBpZiAodlByb3BlcnR5LlZhbHVlICYmIHZQcm9wZXJ0eS5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0c1Byb3BlcnR5TmFtZSA9IHZQcm9wZXJ0eS5WYWx1ZS4kUGF0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1Byb3BlcnR5TmFtZSA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc1Byb3BlcnR5TmFtZTtcblx0fSxcblxuXHRmaWVsZENvbnRyb2w6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbENvbnRleHQgPSBvTW9kZWwgJiYgb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sYCk7XG5cdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbCA9IG9GaWVsZENvbnRyb2xDb250ZXh0ICYmIG9GaWVsZENvbnRyb2xDb250ZXh0LmdldFByb3BlcnR5KCk7XG5cdFx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRcdGlmIChvRmllbGRDb250cm9sLmhhc093blByb3BlcnR5KFwiJEVudW1NZW1iZXJcIikpIHtcblx0XHRcdFx0cmV0dXJuIG9GaWVsZENvbnRyb2wuJEVudW1NZW1iZXI7XG5cdFx0XHR9IGVsc2UgaWYgKG9GaWVsZENvbnRyb2wuaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRyZXR1cm4gQW5ub3RhdGlvbkhlbHBlci52YWx1ZShvRmllbGRDb250cm9sLCB7IGNvbnRleHQ6IG9GaWVsZENvbnRyb2xDb250ZXh0IH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBmcm9tIGEgRGF0YUZpZWxkIG9yIGEgUHJvcGVydHlQYXRoIChpbiBjYXNlIGEgU2VsZWN0aW9uRmllbGQgaXMgdXNlZClcblx0ICogUHJpb3JpdHkgZnJvbSB3aGVyZSB0byBnZXQgdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBmaWVsZCAoZXhhbXBsZXMgYXJlIFwiTmFtZVwiIGFuZCBcIlN1cHBsaWVyXCIpOlxuXHQgKiAxLiBJZiBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpIGhhcyBrZXkgJyRQYXRoJywgdGhlbiB3ZSB0YWtlIHRoZSB2YWx1ZSBhdCAnJFBhdGgnLlxuXHQgKiAyLiBFbHNlLCB2YWx1ZSBhdCBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLlxuXHQgKiBJZiB0aGVyZSBpcyBhbiBJU09DdXJyZW5jeSBvciBpZiB0aGVyZSBhcmUgVW5pdCBhbm5vdGF0aW9ucyBmb3IgdGhlIGZpZWxkIHByb3BlcnR5LFxuXHQgKiB0aGVuIHRoZSBQYXRoIGF0IHRoZSBJU09DdXJyZW5jeSBvciBVbml0IGFubm90YXRpb25zIG9mIHRoZSBmaWVsZCBwcm9wZXJ0eSBpcyBjb25zaWRlcmVkLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dCBUaGUgY29udGV4dCBmcm9tIHdoaWNoIHZhbHVlIGhlbHAgcHJvcGVydHkgbmVlZCB0byBiZSBleHRyYWN0ZWQuXG5cdCAqIEBwYXJhbSBiSW5GaWx0ZXJGaWVsZCBXaGV0aGVyIG9yIG5vdCB3ZSdyZSBpbiB0aGUgZmlsdGVyIGZpZWxkIGFuZCBzaG91bGQgaWdub3JlXG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBoZWxwIHByb3BlcnR5IHBhdGhcblx0ICovXG5cdHZhbHVlSGVscFByb3BlcnR5OiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogQmFzZUNvbnRleHQsIGJJbkZpbHRlckZpZWxkPzogYm9vbGVhbikge1xuXHRcdC8qIEZvciBjdXJyZW5jeSAoYW5kIGxhdGVyIFVuaXQpIHdlIG5lZWQgdG8gZm9yd2FyZCB0aGUgdmFsdWUgaGVscCB0byB0aGUgYW5ub3RhdGVkIGZpZWxkICovXG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb1Byb3BlcnR5Q29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpIHx8IHt9O1xuXHRcdGxldCBzUGF0aCA9IG9Db250ZW50LiRQYXRoID8gYCR7c0NvbnRleHRQYXRofS8kUGF0aGAgOiBzQ29udGV4dFBhdGg7XG5cdFx0Y29uc3Qgc0Fubm9QYXRoID0gYCR7c1BhdGh9QGA7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnMgPSBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdChzQW5ub1BhdGgpO1xuXHRcdGxldCBzQW5ub3RhdGlvbjtcblx0XHRpZiAob1Byb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdHNBbm5vdGF0aW9uID1cblx0XHRcdFx0KG9Qcm9wZXJ0eUFubm90YXRpb25zLmhhc093blByb3BlcnR5KElTT0N1cnJlbmN5KSAmJiBJU09DdXJyZW5jeSkgfHwgKG9Qcm9wZXJ0eUFubm90YXRpb25zLmhhc093blByb3BlcnR5KFVuaXQpICYmIFVuaXQpO1xuXHRcdFx0aWYgKHNBbm5vdGF0aW9uICYmICFiSW5GaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRjb25zdCBzVW5pdE9yQ3VycmVuY3lQYXRoID0gYCR7c1BhdGggKyBzQW5ub3RhdGlvbn0vJFBhdGhgO1xuXHRcdFx0XHQvLyB3ZSBjaGVjayB0aGF0IHRoZSBjdXJyZW5jeSBvciB1bml0IGlzIGEgUHJvcGVydHkgYW5kIG5vdCBhIGZpeGVkIHZhbHVlXG5cdFx0XHRcdGlmIChvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdChzVW5pdE9yQ3VycmVuY3lQYXRoKSkge1xuXHRcdFx0XHRcdHNQYXRoID0gc1VuaXRPckN1cnJlbmN5UGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc1BhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERlZGljYXRlZCBtZXRob2QgdG8gYXZvaWQgbG9va2luZyBmb3IgdW5pdCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHR2YWx1ZUhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkOiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLnZhbHVlSGVscFByb3BlcnR5KG9Qcm9wZXJ0eUNvbnRleHQsIHRydWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2VuZXJhdGUgdGhlIElEIGZvciBWYWx1ZSBIZWxwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0SURGb3JGaWVsZFZhbHVlSGVscFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0gc0ZsZXhJZCBGbGV4IElEIG9mIHRoZSBjdXJyZW50IG9iamVjdFxuXHQgKiBAcGFyYW0gc0lkUHJlZml4IFByZWZpeCBmb3IgdGhlIFZhbHVlSGVscCBJRFxuXHQgKiBAcGFyYW0gc09yaWdpbmFsUHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIFZhbHVlSGVscCBQcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyBUaGUgSUQgZ2VuZXJhdGVkIGZvciB0aGUgVmFsdWVIZWxwXG5cdCAqL1xuXHRnZXRJREZvckZpZWxkVmFsdWVIZWxwOiBmdW5jdGlvbiAoc0ZsZXhJZDogc3RyaW5nIHwgbnVsbCwgc0lkUHJlZml4OiBzdHJpbmcsIHNPcmlnaW5hbFByb3BlcnR5TmFtZTogc3RyaW5nLCBzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoc0ZsZXhJZCkge1xuXHRcdFx0cmV0dXJuIHNGbGV4SWQ7XG5cdFx0fVxuXHRcdGxldCBzUHJvcGVydHkgPSBzUHJvcGVydHlOYW1lO1xuXHRcdGlmIChzT3JpZ2luYWxQcm9wZXJ0eU5hbWUgIT09IHNQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdHNQcm9wZXJ0eSA9IGAke3NPcmlnaW5hbFByb3BlcnR5TmFtZX06OiR7c1Byb3BlcnR5TmFtZX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gZ2VuZXJhdGUoW3NJZFByZWZpeCwgc1Byb3BlcnR5XSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGZpZWxkSGVscCBwcm9wZXJ0eSBvZiB0aGUgRmlsdGVyRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyLmpzXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eUNvbnRleHQgUHJvcGVydHkgY29udGV4dCBmb3IgZmlsdGVyIGZpZWxkXG5cdCAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIG9iamVjdCBvZiB0aGUgRmllbGRIZWxwIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlUeXBlIFRoZSAkVHlwZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHNWaElkUHJlZml4IFRoZSBJRCBwcmVmaXggb2YgdGhlIHZhbHVlIGhlbHBcblx0ICogQHBhcmFtIHNQcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzVmFsdWVIZWxwUHJvcGVydHlOYW1lIFRoZSBwcm9wZXJ0eSBuYW1lIG9mIHRoZSB2YWx1ZSBoZWxwXG5cdCAqIEBwYXJhbSBiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIGB0cnVlYCBpZiB0aGVyZSBpcyBhIHZhbHVlIGxpc3Qgd2l0aCBhIGZpeGVkIHZhbHVlIGFubm90YXRpb25cblx0ICogQHBhcmFtIGJVc2VTZW1hbnRpY0RhdGVSYW5nZSBgdHJ1ZWAgaWYgdGhlIHNlbWFudGljIGRhdGUgcmFuZ2UgaXMgc2V0IHRvICd0cnVlJyBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHJldHVybnMgVGhlIGZpZWxkIGhlbHAgcHJvcGVydHkgb2YgdGhlIHZhbHVlIGhlbHBcblx0ICovXG5cdGdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQ6IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eUNvbnRleHQ6IEJhc2VDb250ZXh0LFxuXHRcdG9Qcm9wZXJ0eTogYW55LFxuXHRcdHNQcm9wZXJ0eVR5cGU6IHN0cmluZyxcblx0XHRzVmhJZFByZWZpeDogc3RyaW5nLFxuXHRcdHNQcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRzVmFsdWVIZWxwUHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0Ykhhc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlczogYm9vbGVhbixcblx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U6IGJvb2xlYW4gfCBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gRmllbGRIZWxwZXIucHJvcGVydHlOYW1lKG9Qcm9wZXJ0eSwgeyBjb250ZXh0OiBwcm9wZXJ0eUNvbnRleHQgfSksXG5cdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UgPSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgPT09IFwidHJ1ZVwiIHx8IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gdHJ1ZTtcblx0XHRjb25zdCBvTW9kZWwgPSBwcm9wZXJ0eUNvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eUNvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9Nb2RlbCwgc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCwgb01vZGVsKTtcblx0XHRpZiAoXG5cdFx0XHQoKHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIgfHwgc1Byb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiKSAmJlxuXHRcdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UgJiZcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucyAmJlxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyAmJlxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldICYmXG5cdFx0XHRcdChvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldLmluZGV4T2YoXCJTaW5nbGVSYW5nZVwiKSAhPT0gLTEgfHxcblx0XHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldLmluZGV4T2YoXCJTaW5nbGVWYWx1ZVwiKSAhPT0gLTEpKSB8fFxuXHRcdFx0KHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkJvb2xlYW5cIiAmJiAhYkhhc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcylcblx0XHQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXRJREZvckZpZWxkVmFsdWVIZWxwKG51bGwsIHNWaElkUHJlZml4IHx8IFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIiwgc1Byb3BlcnR5TmFtZSwgc1ZhbHVlSGVscFByb3BlcnR5TmFtZSk7XG5cdH0sXG5cblx0Z2V0T2JqZWN0SWRlbnRpZmllclRleHQ6IGZ1bmN0aW9uIChcblx0XHRvVGV4dEFubm90YXRpb246IGFueSxcblx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbjogYW55LFxuXHRcdHNQcm9wZXJ0eVZhbHVlQmluZGluZzogYW55LFxuXHRcdHNEYXRhRmllbGROYW1lOiBhbnlcblx0KSB7XG5cdFx0aWYgKG9UZXh0QW5ub3RhdGlvbikge1xuXHRcdFx0Ly8gVGhlcmUgaXMgYSB0ZXh0IGFubm90YXRpb24uIEluIHRoaXMgY2FzZSwgdGhlIE9iamVjdElkZW50aWZpZXIgc2hvd3M6XG5cdFx0XHQvLyAgLSB0aGUgKnRleHQqIGFzIHRoZSBPYmplY3RJZGVudGlmaWVyJ3MgdGl0bGVcblx0XHRcdC8vICAtIHRoZSAqdmFsdWUqIGFzIHRoZSBPYmplY3RJZGVudGlmaWVyJ3MgdGV4dFxuXHRcdFx0Ly9cblx0XHRcdC8vIFNvIGlmIHRoZSBUZXh0QXJyYW5nZW1lbnQgaXMgI1RleHRPbmx5IG9yICNUZXh0U2VwYXJhdGUsIGRvIG5vdCBzZXQgdGhlIE9iamVjdElkZW50aWZpZXIncyB0ZXh0XG5cdFx0XHQvLyBwcm9wZXJ0eVxuXHRcdFx0aWYgKFxuXHRcdFx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiAmJlxuXHRcdFx0XHQob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiIHx8XG5cdFx0XHRcdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0U2VwYXJhdGVcIiB8fFxuXHRcdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dEZpcnN0XCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBzUHJvcGVydHlWYWx1ZUJpbmRpbmcgfHwgYHske3NEYXRhRmllbGROYW1lfX1gO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIG5vIHRleHQgYW5ub3RhdGlvbjogdGhlIHByb3BlcnR5IHZhbHVlIGlzIHBhcnQgb2YgdGhlIE9iamVjdElkZW50aWZpZXIncyB0aXRsZSBhbHJlYWR5XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHRnZXRTZW1hbnRpY09iamVjdHNMaXN0OiBmdW5jdGlvbiAocHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Ly8gbG9vayBmb3IgYW5ub3RhdGlvbnMgU2VtYW50aWNPYmplY3Qgd2l0aCBhbmQgd2l0aG91dCBxdWFsaWZpZXJcblx0XHQvLyByZXR1cm5zIDogbGlzdCBvZiBTZW1hbnRpY09iamVjdHNcblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IHByb3BlcnR5QW5ub3RhdGlvbnM7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0cyA9IFtdO1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGFubm90YXRpb25zLmdldE9iamVjdCgpKSB7XG5cdFx0XHQvLyB2YXIgcXVhbGlmaWVyO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFwiKSA+IC0xICYmXG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZ1wiKSA9PT0gLTEgJiZcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcIikgPT09IC0xXG5cdFx0XHQpIHtcblx0XHRcdFx0bGV0IHNlbWFudGljT2JqZWN0VmFsdWUgPSBhbm5vdGF0aW9ucy5nZXRPYmplY3QoKVtrZXldO1xuXHRcdFx0XHRpZiAodHlwZW9mIHNlbWFudGljT2JqZWN0VmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFZhbHVlID0gQW5ub3RhdGlvbkhlbHBlci52YWx1ZShzZW1hbnRpY09iamVjdFZhbHVlLCB7IGNvbnRleHQ6IHByb3BlcnR5QW5ub3RhdGlvbnMgfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdHMuaW5kZXhPZihzZW1hbnRpY09iamVjdFZhbHVlKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goc2VtYW50aWNPYmplY3RWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgb1NlbWFudGljT2JqZWN0c01vZGVsID0gbmV3IEpTT05Nb2RlbChhU2VtYW50aWNPYmplY3RzKTtcblx0XHQob1NlbWFudGljT2JqZWN0c01vZGVsIGFzIGFueSkuJCR2YWx1ZUFzUHJvbWlzZSA9IHRydWU7XG5cdFx0cmV0dXJuIG9TZW1hbnRpY09iamVjdHNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH0sXG5cdGdldFNlbWFudGljT2JqZWN0c1F1YWxpZmllcnM6IGZ1bmN0aW9uIChwcm9wZXJ0eUFubm90YXRpb25zOiBhbnkpIHtcblx0XHQvLyBsb29rIGZvciBhbm5vdGF0aW9ucyBTZW1hbnRpY09iamVjdCwgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsIFNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdC8vIHJldHVybnMgOiBsaXN0IG9mIHF1YWxpZmllcnMgKGFycmF5IG9mIG9iamVjdHMgd2l0aCBxdWFsaWZpZXJzIDoge3F1YWxpZmllciwgU2VtYW50aWNPYmplY3QsIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLCBTZW1hbnRpY09iamVjdE1hcHBpbmcgZm9yIHRoaXMgcXVhbGlmaWVyfVxuXHRcdGNvbnN0IGFubm90YXRpb25zID0gcHJvcGVydHlBbm5vdGF0aW9ucztcblx0XHRsZXQgcXVhbGlmaWVyc0Fubm90YXRpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbmRPYmplY3QgPSBmdW5jdGlvbiAocXVhbGlmaWVyOiBhbnkpIHtcblx0XHRcdHJldHVybiBxdWFsaWZpZXJzQW5ub3RhdGlvbnMuZmluZChmdW5jdGlvbiAob2JqZWN0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9iamVjdC5xdWFsaWZpZXIgPT09IHF1YWxpZmllcjtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYW5ub3RhdGlvbnMuZ2V0T2JqZWN0KCkpIHtcblx0XHRcdC8vIHZhciBxdWFsaWZpZXI7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0I1wiKSA+IC0xIHx8XG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZyNcIikgPiAtMSB8fFxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyNcIikgPiAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGFubm90YXRpb25Db250ZW50ID0gYW5ub3RhdGlvbnMuZ2V0T2JqZWN0KClba2V5XSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uID0ga2V5LnNwbGl0KFwiI1wiKVswXSxcblx0XHRcdFx0XHRxdWFsaWZpZXIgPSBrZXkuc3BsaXQoXCIjXCIpWzFdO1xuXHRcdFx0XHRsZXQgcXVhbGlmaWVyT2JqZWN0ID0gZmluZE9iamVjdChxdWFsaWZpZXIpO1xuXG5cdFx0XHRcdGlmICghcXVhbGlmaWVyT2JqZWN0KSB7XG5cdFx0XHRcdFx0cXVhbGlmaWVyT2JqZWN0ID0ge1xuXHRcdFx0XHRcdFx0cXVhbGlmaWVyOiBxdWFsaWZpZXJcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHF1YWxpZmllck9iamVjdFthbm5vdGF0aW9uXSA9IGFubm90YXRpb25Db250ZW50O1xuXHRcdFx0XHRcdHF1YWxpZmllcnNBbm5vdGF0aW9ucy5wdXNoKHF1YWxpZmllck9iamVjdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cXVhbGlmaWVyT2JqZWN0W2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cXVhbGlmaWVyc0Fubm90YXRpb25zID0gcXVhbGlmaWVyc0Fubm90YXRpb25zLmZpbHRlcihmdW5jdGlvbiAob1F1YWxpZmllcjogYW55KSB7XG5cdFx0XHRyZXR1cm4gISFvUXVhbGlmaWVyW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFwiXTtcblx0XHR9KTtcblx0XHRjb25zdCBvUXVhbGlmaWVyc01vZGVsID0gbmV3IEpTT05Nb2RlbChxdWFsaWZpZXJzQW5ub3RhdGlvbnMpO1xuXHRcdChvUXVhbGlmaWVyc01vZGVsIGFzIGFueSkuJCR2YWx1ZUFzUHJvbWlzZSA9IHRydWU7XG5cdFx0cmV0dXJuIG9RdWFsaWZpZXJzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9LFxuXHRoYXNTZW1hbnRpY09iamVjdHNXaXRoUGF0aDogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHM6IGFueSkge1xuXHRcdGxldCBiU2VtYW50aWNPYmplY3RIYXNBUGF0aCA9IGZhbHNlO1xuXHRcdGlmIChhU2VtYW50aWNPYmplY3RzICYmIGFTZW1hbnRpY09iamVjdHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZW1hbnRpY09iamVjdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdHNbaV0gJiYgYVNlbWFudGljT2JqZWN0c1tpXS52YWx1ZSAmJiBhU2VtYW50aWNPYmplY3RzW2ldLnZhbHVlLmluZGV4T2YoXCJ7XCIpID09PSAwKSB7XG5cdFx0XHRcdFx0YlNlbWFudGljT2JqZWN0SGFzQVBhdGggPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBiU2VtYW50aWNPYmplY3RIYXNBUGF0aDtcblx0fSxcblx0aXNTZW1hbnRpY0tleUhhc0ZpZWxkR3JvdXBDb2x1bW46IGZ1bmN0aW9uIChpc0ZpZWxkR3JvdXBDb2x1bW46IGFueSkge1xuXHRcdHJldHVybiBpc0ZpZWxkR3JvdXBDb2x1bW47XG5cdH0sXG5cdC8qXG5cdCAqIE1ldGhvZCB0byBjb21wdXRlIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkZWxlZ2F0ZU5hbWUgLSBuYW1lIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCAtIGFkZGVkIHRvIHRoZSBwYXlsb2FkIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEByZXR1cm4ge29iamVjdH0gLSByZXR1cm5zIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICovXG5cdGNvbXB1dGVGaWVsZEJhc2VEZWxlZ2F0ZTogZnVuY3Rpb24gKGRlbGVnYXRlTmFtZTogc3RyaW5nLCByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBib29sZWFuKSB7XG5cdFx0aWYgKHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdG5hbWU6IGRlbGVnYXRlTmFtZSxcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Rcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBge25hbWU6ICcke2RlbGVnYXRlTmFtZX0nfWA7XG5cdH0sXG5cdF9nZXRQcmltYXJ5SW50ZW50czogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHNMaXN0OiBhbnlbXSk6IFByb21pc2U8YW55W10+IHtcblx0XHRjb25zdCBhUHJvbWlzZXM6IGFueVtdID0gW107XG5cdFx0aWYgKGFTZW1hbnRpY09iamVjdHNMaXN0KSB7XG5cdFx0XHRjb25zdCBvVXNoZWxsQ29udGFpbmVyID0gc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lcjtcblx0XHRcdGNvbnN0IG9TZXJ2aWNlID0gb1VzaGVsbENvbnRhaW5lciAmJiBvVXNoZWxsQ29udGFpbmVyLmdldFNlcnZpY2UoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0XHRcdGFTZW1hbnRpY09iamVjdHNMaXN0LmZvckVhY2goZnVuY3Rpb24gKHNlbU9iamVjdCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNlbU9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKG9TZXJ2aWNlLmdldFByaW1hcnlJbnRlbnQoc2VtT2JqZWN0LCB7fSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhU2VtT2JqZWN0UHJpbWFyeUFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gYVNlbU9iamVjdFByaW1hcnlBY3Rpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgcHJpbWFyeSBpbnRlbnRzXCIsIG9FcnJvcik7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH0pO1xuXHR9LFxuXHRfY2hlY2tJZlNlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb246IGZ1bmN0aW9uIChcblx0XHRvU2VtYW50aWNzOiBhbnksXG5cdFx0YVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zOiBhbnksXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnRcblx0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlID0gZnVuY3Rpb24gKF9vU2VtYW50aWNzOiBhbnksIF9vUHJpbWFyeUFjdGlvbjogYW55LCBfaW5kZXg6IHN0cmluZykge1xuXHRcdFx0Zm9yIChjb25zdCB1bmF2YWlsYWJsZUFjdGlvbnNJbmRleCBpbiBfb1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfaW5kZXhdLmFjdGlvbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdF9vUHJpbWFyeUFjdGlvbi5pbnRlbnRcblx0XHRcdFx0XHRcdC5zcGxpdChcIi1cIilbMV1cblx0XHRcdFx0XHRcdC5pbmRleE9mKF9vU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19pbmRleF0uYWN0aW9uc1t1bmF2YWlsYWJsZUFjdGlvbnNJbmRleF0pID09PSAwXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblxuXHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9ucyA9IGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucztcblx0XHRjb25zdCBvUHJpbWFyeUFjdGlvbiA9XG5cdFx0XHRvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cyAmJlxuXHRcdFx0b1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QgJiZcblx0XHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV07XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5nZXRIYXNoKCk7XG5cdFx0aWYgKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0ICYmIG9QcmltYXJ5QWN0aW9uICE9PSBudWxsICYmIG9QcmltYXJ5QWN0aW9uLmludGVudCAhPT0gc0N1cnJlbnRIYXNoKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGluZGV4IGluIG9TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpIHtcblx0XHRcdFx0aWYgKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0LmluZGV4T2Yob1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tpbmRleF0uc2VtYW50aWNPYmplY3QpID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9mbklzU2VtYW50aWNPYmplY3RBY3Rpb25VbmF2YWlsYWJsZShvU2VtYW50aWNzLCBvUHJpbWFyeUFjdGlvbiwgaW5kZXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0Y2hlY2tQcmltYXJ5QWN0aW9uczogZnVuY3Rpb24gKG9TZW1hbnRpY3M6IGFueSwgYkdldFRpdGxlTGluazogYm9vbGVhbiwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UHJpbWFyeUludGVudHMob1NlbWFudGljcyAmJiBvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cylcblx0XHRcdC50aGVuKChhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnM6IGFueVtdKSA9PiB7XG5cdFx0XHRcdHJldHVybiBiR2V0VGl0bGVMaW5rXG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlTGluazogYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRoYXNUaXRsZUxpbms6IHRoaXMuX2NoZWNrSWZTZW1hbnRpY09iamVjdHNIYXNQcmltYXJ5QWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdG9TZW1hbnRpY3MsXG5cdFx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRcdGFwcENvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0OiB0aGlzLl9jaGVja0lmU2VtYW50aWNPYmplY3RzSGFzUHJpbWFyeUFjdGlvbihvU2VtYW50aWNzLCBhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnMsIGFwcENvbXBvbmVudCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3IgaW4gY2hlY2tQcmltYXJ5QWN0aW9uc1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cdF9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVyczogZnVuY3Rpb24gKF9vU2VtYW50aWNPYmplY3RNb2RlbDogYW55LCBfbGlua0ludGVudDogc3RyaW5nKSB7XG5cdFx0aWYgKF9vU2VtYW50aWNPYmplY3RNb2RlbCAmJiBfb1NlbWFudGljT2JqZWN0TW9kZWwudGl0bGVsaW5rKSB7XG5cdFx0XHRyZXR1cm4gX29TZW1hbnRpY09iamVjdE1vZGVsLnRpdGxlbGluaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9saW5rSW50ZW50O1xuXHRcdH1cblx0fSxcblxuXHRnZXRQcmltYXJ5QWN0aW9uOiBmdW5jdGlvbiAob1NlbWFudGljczogYW55KSB7XG5cdFx0cmV0dXJuIG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV0uaW50ZW50XG5cdFx0XHQ/IEZpZWxkSGVscGVyLl9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVycyhcblx0XHRcdFx0XHRvU2VtYW50aWNzLFxuXHRcdFx0XHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV0uaW50ZW50XG5cdFx0XHQgIClcblx0XHRcdDogb1NlbWFudGljcy5wcmltYXJ5SW50ZW50QWN0aW9uO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGZldGNoIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zLiBGaWx0ZXIgcmVzdHJpY3Rpb25zIGNhbiBiZSBhbm5vdGF0ZWQgb24gYW4gZW50aXR5IHNldCBvciBhIG5hdmlnYXRpb24gcHJvcGVydHkuXG5cdCAqIERlcGVuZGluZyBvbiB0aGUgcGF0aCB0byB3aGljaCB0aGUgY29udHJvbCBpcyBib3VuZCwgd2UgY2hlY2sgZm9yIGZpbHRlciByZXN0cmljdGlvbnMgb24gdGhlIGNvbnRleHQgcGF0aCBvZiB0aGUgY29udHJvbCxcblx0ICogb3Igb24gdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgKGlmIHRoZXJlIGlzIGEgbmF2aWdhdGlvbikuXG5cdCAqIEVnLiBJZiB0aGUgdGFibGUgaXMgYm91bmQgdG8gJy9FbnRpdHlTZXQnLCBmb3IgcHJvcGVydHkgcGF0aCAnL0VudGl0eVNldC9fQXNzb2NpYXRpb24vUHJvcGVydHlOYW1lJywgdGhlIGZpbHRlciByZXN0cmljdGlvbnNcblx0ICogb24gJy9FbnRpdHlTZXQnIHdpbiBvdmVyIGZpbHRlciByZXN0cmljdGlvbnMgb24gJy9FbnRpdHlTZXQvX0Fzc29jaWF0aW9uJy5cblx0ICogSWYgdGhlIHRhYmxlIGlzIGJvdW5kIHRvICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbicsIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIG9uICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbicgd2luIG92ZXIgZmlsdGVyXG5cdCAqIHJldHJpY3Rpb25zIG9uICcvQXNzb2NpYXRpb25FbnRpdHlTZXQnLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgUHJvcGVydHkgQ29udGV4dFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFByb3BlcnR5IG9iamVjdCBpbiB0aGUgbWV0YWRhdGFcblx0ICogQHBhcmFtIGJVc2VTZW1hbnRpY0RhdGVSYW5nZSBCb29sZWFuIFN1Z2dlc3RzIGlmIHNlbWFudGljIGRhdGUgcmFuZ2Ugc2hvdWxkIGJlIHVzZWRcblx0ICogQHBhcmFtIHNTZXR0aW5ncyBTdHJpbmdpZmllZCBvYmplY3Qgb2YgdGhlIHByb3BlcnR5IHNldHRpbmdzXG5cdCAqIEBwYXJhbSBjb250ZXh0UGF0aCBQYXRoIHRvIHdoaWNoIHRoZSBwYXJlbnQgY29udHJvbCAodGhlIHRhYmxlIG9yIHRoZSBmaWx0ZXIgYmFyKSBpcyBib3VuZFxuXHQgKiBAcmV0dXJucyBTdHJpbmcgY29udGFpbmluZyBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvcGVyYXRvcnMgZm9yIGZpbHRlcmluZ1xuXHQgKi9cblx0b3BlcmF0b3JzOiBmdW5jdGlvbiAob0NvbnRleHQ6IEJhc2VDb250ZXh0LCBvUHJvcGVydHk6IGFueSwgYlVzZVNlbWFudGljRGF0ZVJhbmdlOiBib29sZWFuLCBzU2V0dGluZ3M6IHN0cmluZywgY29udGV4dFBhdGg6IHN0cmluZykge1xuXHRcdGlmICghb1Byb3BlcnR5IHx8ICFjb250ZXh0UGF0aCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0bGV0IG9wZXJhdG9yczogc3RyaW5nW107XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gRmllbGRIZWxwZXIucHJvcGVydHlOYW1lKG9Qcm9wZXJ0eSwgeyBjb250ZXh0OiBvQ29udGV4dCB9KTtcblx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKSxcblx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aChvTW9kZWwsIHNQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0cHJvcGVydHlUeXBlID0gb1Byb3BlcnR5LiRUeXBlO1xuXG5cdFx0aWYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uR3VpZFwiKSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5KCk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlICcvJ1xuXHRcdGNvbnRleHRQYXRoID0gY29udGV4dFBhdGguc2xpY2UoMCwgLTEpO1xuXHRcdGNvbnN0IGlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbjogYm9vbGVhbiA9IGNvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA+IDA7XG5cdFx0Y29uc3QgaXNOYXZpZ2F0aW9uUGF0aDogYm9vbGVhbiA9XG5cdFx0XHQoaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uICYmIGNvbnRleHRQYXRoICE9PSBzUHJvcGVydHlMb2NhdGlvblBhdGgpIHx8XG5cdFx0XHQoIWlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbiAmJiBzUHJvcGVydHlMb2NhdGlvblBhdGgubGFzdEluZGV4T2YoXCIvXCIpID4gMCk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblBhdGg6IHN0cmluZyA9XG5cdFx0XHQoaXNOYXZpZ2F0aW9uUGF0aCAmJiBzUHJvcGVydHlMb2NhdGlvblBhdGguc3Vic3RyKHNQcm9wZXJ0eUxvY2F0aW9uUGF0aC5pbmRleE9mKGNvbnRleHRQYXRoKSArIGNvbnRleHRQYXRoLmxlbmd0aCArIDEpKSB8fCBcIlwiO1xuXHRcdGNvbnN0IHByb3BlcnR5UGF0aDogc3RyaW5nID0gKGlzTmF2aWdhdGlvblBhdGggJiYgbmF2aWdhdGlvblBhdGggKyBcIi9cIiArIHNQcm9wZXJ0eSkgfHwgc1Byb3BlcnR5O1xuXG5cdFx0aWYgKCFpc1RhYmxlQm91bmRUb05hdmlnYXRpb24pIHtcblx0XHRcdGlmICghaXNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHQvLyAvU2FsZXNPcmRlck1hbmFnZS9JRFxuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoLFxuXHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hbmdlL19JdGVtL01hdGVyaWFsXG5cdFx0XHRcdC8vbGV0IG9wZXJhdG9yc1xuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvcGVyYXRvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0XHRzUHJvcGVydHlMb2NhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaXNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0vTWF0ZXJpYWxcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGNvbnRleHRQYXRoLFxuXHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdCk7XG5cdFx0XHRpZiAob3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRzUHJvcGVydHksXG5cdFx0XHRcdFx0TW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChjb250ZXh0UGF0aCksXG5cdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3BlcmF0b3JzPy5sZW5ndGggPiAwID8gb3BlcmF0b3JzLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIC9TYWxlc09yZGVyTWFuYWdlL19JdGVtL19Bc3NvY2lhdGlvbi9Qcm9wZXJ0eU5hbWVcblx0XHRcdC8vIFRoaXMgaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgZm9yIHRhYmxlc1xuXHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0KTtcblx0XHRcdGlmIChvcGVyYXRvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGNvbnRleHRQYXRoKSxcblx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoKCFvcGVyYXRvcnMgfHwgb3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkgJiYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiIHx8IHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikpIHtcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eShwcm9wZXJ0eVR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcGVyYXRvcnMubGVuZ3RoID4gMCA/IG9wZXJhdG9ycy50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBwcm9wZXJ0eSBjb250ZXh0IGZvciB1c2FnZSBpbiBRdWlja1ZpZXcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkYXRhIGZpZWxkIG9yIGFzc29jaWF0ZWQgcHJvcGVydHlcblx0ICogQHJldHVybnMgQmluZGluZyBjb250ZXh0XG5cdCAqL1xuXHRnZXRQcm9wZXJ0eUNvbnRleHRGb3JRdWlja1ZpZXc6IGZ1bmN0aW9uIChvRGF0YUZpZWxkQ29udGV4dDogYW55KSB7XG5cdFx0aWYgKG9EYXRhRmllbGRDb250ZXh0LmdldE9iamVjdChcIlZhbHVlXCIpICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENyZWF0ZSBhIGJpbmRpbmcgY29udGV4dCB0byB0aGUgcHJvcGVydHkgZnJvbSB0aGUgZGF0YSBmaWVsZC5cblx0XHRcdGNvbnN0IG9JbnRlcmZhY2UgPSBvRGF0YUZpZWxkQ29udGV4dC5nZXRJbnRlcmZhY2UoKSxcblx0XHRcdFx0b01vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXHRcdFx0bGV0IHNQYXRoID0gb0ludGVyZmFjZS5nZXRQYXRoKCk7XG5cdFx0XHRzUGF0aCA9IHNQYXRoICsgKHNQYXRoLmVuZHNXaXRoKFwiL1wiKSA/IFwiVmFsdWVcIiA6IFwiL1ZhbHVlXCIpO1xuXHRcdFx0cmV0dXJuIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzUGF0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEl0IGlzIGEgcHJvcGVydHkuIEp1c3QgcmV0dXJuIHRoZSBjb250ZXh0IGFzIGl0IGlzLlxuXHRcdFx0cmV0dXJuIG9EYXRhRmllbGRDb250ZXh0O1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFJldHVybiB0aGUgYmluZGluZyBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5IHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJvcGVydHlDb250ZXh0IENvbnRleHQgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIEJpbmRpbmcgY29udGV4dFxuXHQgKi9cblx0Z2V0UHJvcGVydHlQYXRoRm9yUXVpY2tWaWV3OiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogYW55KSB7XG5cdFx0aWYgKG9Qcm9wZXJ0eUNvbnRleHQgJiYgb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoXCIkUGF0aFwiKSkge1xuXHRcdFx0Y29uc3Qgb0ludGVyZmFjZSA9IG9Qcm9wZXJ0eUNvbnRleHQuZ2V0SW50ZXJmYWNlKCksXG5cdFx0XHRcdG9Nb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdGxldCBzUGF0aCA9IG9JbnRlcmZhY2UuZ2V0UGF0aCgpO1xuXHRcdFx0c1BhdGggPSBzUGF0aCArIChzUGF0aC5lbmRzV2l0aChcIi9cIikgPyBcIiRQYXRoXCIgOiBcIi8kUGF0aFwiKTtcblx0XHRcdHJldHVybiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvUHJvcGVydHlDb250ZXh0O1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBwYXRoIG9mIHRoZSBEYUZpZWxkRGVmYXVsdCAoaWYgYW55KS4gT3RoZXJ3aXNlLCB0aGUgRGF0YUZpZWxkIHBhdGggaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkQ29udGV4dCBDb250ZXh0IG9mIHRoZSBEYXRhRmllbGRcblx0ICogQHJldHVybnMgT2JqZWN0IHBhdGhcblx0ICovXG5cdGdldERhdGFGaWVsZERlZmF1bHQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb0RhdGFGaWVsZERlZmF1bHQgPSBvRGF0YUZpZWxkQ29udGV4dFxuXHRcdFx0LmdldE1vZGVsKClcblx0XHRcdC5nZXRPYmplY3QoYCR7b0RhdGFGaWVsZENvbnRleHQuZ2V0UGF0aCgpfUBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0YCk7XG5cdFx0cmV0dXJuIG9EYXRhRmllbGREZWZhdWx0XG5cdFx0XHQ/IGAke29EYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKX1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGBcblx0XHRcdDogb0RhdGFGaWVsZENvbnRleHQuZ2V0UGF0aCgpO1xuXHR9LFxuXHQvKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHZpc2libGUgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkQWN0aW9uQnV0dG9uXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvblZpc2libGVcblx0ICogQHBhcmFtIHtvYmplY3R9IG9UaGlzIC0gQ3VycmVudCBPYmplY3Rcblx0ICogQHBhcmFtIHtvYmplY3R9IG9EYXRhRmllbGQgLSBEYXRhUG9pbnQncyBWYWx1ZVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGJJc0JvdW5kIC0gRGF0YVBvaW50IGFjdGlvbiBib3VuZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0FjdGlvbkNvbnRleHQgLSBBY3Rpb25Db250ZXh0IFZhbHVlXG5cdCAqIEByZXR1cm4ge2Jvb2xlYW59IC0gcmV0dXJucyBib29sZWFuXG5cdCAqL1xuXHRpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvblZpc2libGU6IGZ1bmN0aW9uIChvVGhpczogYW55LCBvRGF0YUZpZWxkOiBhbnksIGJJc0JvdW5kOiBhbnksIG9BY3Rpb25Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gb0RhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gIT09IHRydWUgJiYgKGJJc0JvdW5kICE9PSB0cnVlIHx8IG9BY3Rpb25Db250ZXh0ICE9PSBmYWxzZSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHByZXNzIGV2ZW50IGZvciBEYXRhRmllbGRBY3Rpb25CdXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uXG5cdCAqIEBwYXJhbSBvVGhpcyBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhUG9pbnQncyBWYWx1ZVxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgRGF0YUZpZWxkQWN0aW9uQnV0dG9uIHByZXNzIGV2ZW50XG5cdCAqL1xuXHRnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0RhdGFGaWVsZDogYW55KSB7XG5cdFx0bGV0IHNJbnZvY2F0aW9uR3JvdXBpbmcgPSBcIklzb2xhdGVkXCI7XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmcgJiZcblx0XHRcdG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIlxuXHRcdCkge1xuXHRcdFx0c0ludm9jYXRpb25Hcm91cGluZyA9IFwiQ2hhbmdlU2V0XCI7XG5cdFx0fVxuXHRcdGxldCBiSXNOYXZpZ2FibGUgPSBvVGhpcy5uYXZpZ2F0ZUFmdGVyQWN0aW9uO1xuXHRcdGJJc05hdmlnYWJsZSA9IGJJc05hdmlnYWJsZSA9PT0gXCJmYWxzZVwiID8gZmFsc2UgOiB0cnVlO1xuXG5cdFx0Y29uc3QgZW50aXRpZXM6IEFycmF5PHN0cmluZz4gPSBvVGhpcz8uZW50aXR5U2V0Py5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IGVudGl0eVNldE5hbWU6IHN0cmluZyA9IGVudGl0aWVzW2VudGl0aWVzLmxlbmd0aCAtIDFdO1xuXG5cdFx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRcdGNvbnRleHRzOiBcIiR7JHNvdXJjZT4vfS5nZXRCaW5kaW5nQ29udGV4dCgpXCIsXG5cdFx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0ludm9jYXRpb25Hcm91cGluZyksXG5cdFx0XHRtb2RlbDogXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiLFxuXHRcdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZC5MYWJlbCwgdHJ1ZSksXG5cdFx0XHRpc05hdmlnYWJsZTogYklzTmF2aWdhYmxlLFxuXHRcdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhlbnRpdHlTZXROYW1lKVxuXHRcdH07XG5cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXG5cdFx0XHRcIi5lZGl0Rmxvdy5pbnZva2VBY3Rpb25cIixcblx0XHRcdENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdFx0Q29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpXG5cdFx0KTtcblx0fSxcblxuXHRpc051bWVyaWNEYXRhVHlwZTogZnVuY3Rpb24gKHNEYXRhRmllbGRUeXBlOiBhbnkpIHtcblx0XHRjb25zdCBfc0RhdGFGaWVsZFR5cGUgPSBzRGF0YUZpZWxkVHlwZTtcblx0XHRpZiAoX3NEYXRhRmllbGRUeXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGFOdW1lcmljRGF0YVR5cGVzID0gW1xuXHRcdFx0XHRcIkVkbS5JbnQxNlwiLFxuXHRcdFx0XHRcIkVkbS5JbnQzMlwiLFxuXHRcdFx0XHRcIkVkbS5JbnQ2NFwiLFxuXHRcdFx0XHRcIkVkbS5CeXRlXCIsXG5cdFx0XHRcdFwiRWRtLlNCeXRlXCIsXG5cdFx0XHRcdFwiRWRtLlNpbmdsZVwiLFxuXHRcdFx0XHRcIkVkbS5EZWNpbWFsXCIsXG5cdFx0XHRcdFwiRWRtLkRvdWJsZVwiXG5cdFx0XHRdO1xuXHRcdFx0cmV0dXJuIGFOdW1lcmljRGF0YVR5cGVzLmluZGV4T2YoX3NEYXRhRmllbGRUeXBlKSA9PT0gLTEgPyBmYWxzZSA6IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0aXNEYXRlT3JUaW1lRGF0YVR5cGU6IGZ1bmN0aW9uIChzUHJvcGVydHlUeXBlOiBhbnkpIHtcblx0XHRpZiAoc1Byb3BlcnR5VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBhRGF0ZVRpbWVEYXRhVHlwZXMgPSBbXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIiwgXCJFZG0uRGF0ZVRpbWVcIiwgXCJFZG0uRGF0ZVwiLCBcIkVkbS5UaW1lT2ZEYXlcIiwgXCJFZG0uVGltZVwiXTtcblx0XHRcdHJldHVybiBhRGF0ZVRpbWVEYXRhVHlwZXMuaW5kZXhPZihzUHJvcGVydHlUeXBlKSA+IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRpc0RhdGVUaW1lRGF0YVR5cGU6IGZ1bmN0aW9uIChzUHJvcGVydHlUeXBlOiBhbnkpIHtcblx0XHRpZiAoc1Byb3BlcnR5VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBhRGF0ZURhdGFUeXBlcyA9IFtcIkVkbS5EYXRlVGltZU9mZnNldFwiLCBcIkVkbS5EYXRlVGltZVwiXTtcblx0XHRcdHJldHVybiBhRGF0ZURhdGFUeXBlcy5pbmRleE9mKHNQcm9wZXJ0eVR5cGUpID4gLTE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGlzRGF0ZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0cmV0dXJuIHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVcIjtcblx0fSxcblx0aXNUaW1lRGF0YVR5cGU6IGZ1bmN0aW9uIChzUHJvcGVydHlUeXBlOiBhbnkpIHtcblx0XHRpZiAoc1Byb3BlcnR5VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBhRGF0ZURhdGFUeXBlcyA9IFtcIkVkbS5UaW1lT2ZEYXlcIiwgXCJFZG0uVGltZVwiXTtcblx0XHRcdHJldHVybiBhRGF0ZURhdGFUeXBlcy5pbmRleE9mKHNQcm9wZXJ0eVR5cGUpID4gLTE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvIGRpc3BsYXkgYSB0ZXh0IGFycmFuZ2VtZW50IHNob3dpbmcgdGV4dCBhbmQgaWQsIHdlIG5lZWQgYSBzdHJpbmcgZmllbGQgb24gdGhlIFVJLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0Fubm90YXRpb25zIEFsbCB0aGUgYW5ub3RhdGlvbnMgb2YgYSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc1R5cGUgVGhlIHByb3BlcnR5IGRhdGEgdHlwZVxuXHQgKiBAcmV0dXJucyBUaGUgdHlwZSB0byBiZSB1c2VkIG9uIHRoZSBVSSBmb3IgdGhlIGFsaWdubWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uOiBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnksIHNUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBzVGV4dEFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiLFxuXHRcdFx0c1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIjtcblxuXHRcdC8qXG5cdFx0ICBJbiBjYXNlIG9mIFRleHRTZXBhcmF0ZSwgdGhlIHJldHVybmVkIGlzIHVzZWQgZm9yIHRoZSBmaWxlZCBpdHNlbGYgb25seSBzaG93aW5nXG5cdFx0ICAgdGhlIHZhbHVlIG9mIHRoZSBvcmlnaW5hbCBwcm9wZXJ0eSwgdGh1cyBhbHNvIHRoZSB0eXBlIG9mIHRoZSBwcm9wZXJ0eSBuZWVkcyB0byBiZSB1c2VkLlxuXHRcdCAgSW4gY2FzZSBvZiBUZXh0T25seSwgd2UgY29uc2lkZXIgaXQgdG8gYmUgRWRtLlN0cmluZyBhY2NvcmRpbmcgdG8gdGhlIGRlZmluaXRpb25cblx0XHQgICBpbiB0aGUgdm9jYWJ1bGFyeSwgZXZlbiBpZiBpdCdzIG5vdC5cblx0XHQgIEluIG90aGVyIGNhc2VzLCB3ZSByZXR1cm4gRWRtLlN0cmluZywgYXMgdGhlIHZhbHVlIGlzIGJ1aWxkIHVzaW5nIGEgdGV4dCB0ZW1wbGF0ZS5cblx0XHQgKi9cblx0XHRyZXR1cm4gb0Fubm90YXRpb25zPy5bc1RleHRBcnJhbmdlbWVudEFubm90YXRpb25dPy4kRW51bU1lbWJlciAhPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRTZXBhcmF0ZVwiICYmXG5cdFx0XHRvQW5ub3RhdGlvbnM/LltzVGV4dEFubm90YXRpb25dPy4kUGF0aFxuXHRcdFx0PyBcIkVkbS5TdHJpbmdcIlxuXHRcdFx0OiBzVHlwZTtcblx0fSxcblxuXHRnZXRDb2x1bW5BbGlnbm1lbnQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9UYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvVGFibGUuY29sbGVjdGlvbi5zUGF0aCxcblx0XHRcdG9Nb2RlbCA9IG9UYWJsZS5jb2xsZWN0aW9uLm9Nb2RlbDtcblx0XHRpZiAoXG5cdFx0XHQob0RhdGFGaWVsZFtcIiRUeXBlXCJdID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRcdG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIikgJiZcblx0XHRcdG9EYXRhRmllbGQuSW5saW5lICYmXG5cdFx0XHRvRGF0YUZpZWxkLkljb25Vcmxcblx0XHQpIHtcblx0XHRcdHJldHVybiBcIkNlbnRlclwiO1xuXHRcdH1cblx0XHQvLyBDb2x1bW5zIGNvbnRhaW5pbmcgYSBTZW1hbnRpYyBLZXkgbXVzdCBiZSBCZWdpbiBhbGlnbmVkXG5cdFx0Y29uc3QgYVNlbWFudGljS2V5cyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgKTtcblx0XHRpZiAob0RhdGFGaWVsZFtcIiRUeXBlXCJdID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiKSB7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gb0RhdGFGaWVsZC5WYWx1ZS4kUGF0aDtcblx0XHRcdGNvbnN0IGJJc1NlbWFudGljS2V5ID1cblx0XHRcdFx0YVNlbWFudGljS2V5cyAmJlxuXHRcdFx0XHQhYVNlbWFudGljS2V5cy5ldmVyeShmdW5jdGlvbiAob0tleTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9LZXkuJFByb3BlcnR5UGF0aCAhPT0gc1Byb3BlcnR5UGF0aDtcblx0XHRcdFx0fSk7XG5cdFx0XHRpZiAoYklzU2VtYW50aWNLZXkpIHtcblx0XHRcdFx0cmV0dXJuIFwiQmVnaW5cIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLmdldERhdGFGaWVsZEFsaWdubWVudChvRGF0YUZpZWxkLCBvTW9kZWwsIHNFbnRpdHlQYXRoKTtcblx0fSxcblx0LyoqXG5cdCAqIEdldCBhbGlnbm1lbnQgYmFzZWQgb25seSBvbiB0aGUgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVHlwZSBUaGUgcHJvcGVydHkncyB0eXBlXG5cdCAqIEBwYXJhbSBvRm9ybWF0T3B0aW9ucyBUaGUgZmllbGQgZm9ybWF0IG9wdGlvbnNcblx0ICogQHBhcmFtIFtvQ29tcHV0ZWRFZGl0TW9kZV0gVGhlIGNvbXB1dGVkIEVkaXQgbW9kZSBvZiB0aGUgcHJvcGVydHkgaXMgZW1wdHkgd2hlbiBkaXJlY3RseSBjYWxsZWQgZnJvbSB0aGUgQ29sdW1uUHJvcGVydHkgZnJhZ21lbnRcblx0ICogQHJldHVybnMgVGhlIHByb3BlcnR5IGFsaWdubWVudFxuXHQgKi9cblx0Z2V0UHJvcGVydHlBbGlnbm1lbnQ6IGZ1bmN0aW9uIChzVHlwZTogc3RyaW5nLCBvRm9ybWF0T3B0aW9uczogYW55LCBvQ29tcHV0ZWRFZGl0TW9kZT86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KSB7XG5cdFx0bGV0IHNEZWZhdWx0QWxpZ25tZW50ID0gXCJCZWdpblwiIGFzIGFueTtcblx0XHRjb25zdCBzVGV4dEFsaWdubWVudCA9IG9Gb3JtYXRPcHRpb25zID8gb0Zvcm1hdE9wdGlvbnMudGV4dEFsaWduTW9kZSA6IFwiXCI7XG5cdFx0c3dpdGNoIChzVGV4dEFsaWdubWVudCkge1xuXHRcdFx0Y2FzZSBcIkZvcm1cIjpcblx0XHRcdFx0aWYgKHRoaXMuaXNOdW1lcmljRGF0YVR5cGUoc1R5cGUpKSB7XG5cdFx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBcIkJlZ2luXCI7XG5cdFx0XHRcdFx0aWYgKG9Db21wdXRlZEVkaXRNb2RlKSB7XG5cdFx0XHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IGdldEFsaWdubWVudEV4cHJlc3Npb24ob0NvbXB1dGVkRWRpdE1vZGUsIFwiQmVnaW5cIiwgXCJFbmRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHRoaXMuaXNOdW1lcmljRGF0YVR5cGUoc1R5cGUpIHx8IHRoaXMuaXNEYXRlT3JUaW1lRGF0YVR5cGUoc1R5cGUpKSB7XG5cdFx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBcIlJpZ2h0XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0fSxcblxuXHRnZXREYXRhRmllbGRBbGlnbm1lbnQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9Nb2RlbDogYW55LCBzRW50aXR5UGF0aDogYW55LCBvRm9ybWF0T3B0aW9ucz86IGFueSwgb0NvbXB1dGVkRWRpdE1vZGU/OiBhbnkpIHtcblx0XHRsZXQgc0RhdGFGaWVsZFBhdGgsXG5cdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IFwiQmVnaW5cIixcblx0XHRcdHNUeXBlLFxuXHRcdFx0b0Fubm90YXRpb25zO1xuXG5cdFx0aWYgKG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIpIHtcblx0XHRcdHNEYXRhRmllbGRQYXRoID0gb0RhdGFGaWVsZC5UYXJnZXQuJEFubm90YXRpb25QYXRoO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldFtcIiRBbm5vdGF0aW9uUGF0aFwiXSAmJlxuXHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldFtcIiRBbm5vdGF0aW9uUGF0aFwiXS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiKSA+PSAwXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qgb0ZpZWxkR3JvdXAgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofWApO1xuXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb0ZpZWxkR3JvdXAuRGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vRGF0YS8ke2kudG9TdHJpbmcoKX0vVmFsdWUvJFBhdGgvJFR5cGVgKTtcblx0XHRcdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9EYXRhLyR7aS50b1N0cmluZygpfS9WYWx1ZS8kUGF0aEBgKTtcblx0XHRcdFx0XHRzVHlwZSA9IHRoaXMuZ2V0RGF0YVR5cGVGb3JWaXN1YWxpemF0aW9uKG9Bbm5vdGF0aW9ucywgc1R5cGUpO1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gdGhpcy5nZXRQcm9wZXJ0eUFsaWdubWVudChzVHlwZSwgb0Zvcm1hdE9wdGlvbnMsIG9Db21wdXRlZEVkaXRNb2RlKTtcblxuXHRcdFx0XHRcdGlmIChzRGVmYXVsdEFsaWdubWVudCA9PT0gXCJCZWdpblwiKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0gJiZcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+PSAwICYmXG5cdFx0XHRcdG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L1Zpc3VhbGl6YXRpb24vJEVudW1NZW1iZXJgKSA9PT1cblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS8kVHlwZWApO1xuXHRcdFx0XHRpZiAoc1R5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiKSB7XG5cdFx0XHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WYWx1ZS8kUGF0aC8kVHlwZWApO1xuXHRcdFx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L1ZhbHVlLyRQYXRoQGApO1xuXHRcdFx0XHRcdHNUeXBlID0gdGhpcy5nZXREYXRhVHlwZUZvclZpc3VhbGl6YXRpb24ob0Fubm90YXRpb25zLCBzVHlwZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSB0aGlzLmdldFByb3BlcnR5QWxpZ25tZW50KHNUeXBlLCBvRm9ybWF0T3B0aW9ucywgb0NvbXB1dGVkRWRpdE1vZGUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzRGF0YUZpZWxkUGF0aCA9IG9EYXRhRmllbGQuVmFsdWUuJFBhdGg7XG5cdFx0XHRzVHlwZSA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9LyRUeXBlYCk7XG5cdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofUBgKTtcblx0XHRcdHNUeXBlID0gdGhpcy5nZXREYXRhVHlwZUZvclZpc3VhbGl6YXRpb24ob0Fubm90YXRpb25zLCBzVHlwZSk7XG5cdFx0XHRpZiAoIShvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS9gKVtcIiRLZXlcIl0uaW5kZXhPZihzRGF0YUZpZWxkUGF0aCkgPT09IDApKSB7XG5cdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gdGhpcy5nZXRQcm9wZXJ0eUFsaWdubWVudChzVHlwZSwgb0Zvcm1hdE9wdGlvbnMsIG9Db21wdXRlZEVkaXRNb2RlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHR9LFxuXHRnZXRUeXBlQWxpZ25tZW50OiBmdW5jdGlvbiAoXG5cdFx0b0NvbnRleHQ6IGFueSxcblx0XHRvRGF0YUZpZWxkOiBhbnksXG5cdFx0b0Zvcm1hdE9wdGlvbnM6IGFueSxcblx0XHRzRW50aXR5UGF0aDogc3RyaW5nLFxuXHRcdG9Db21wdXRlZEVkaXRNb2RlOiBhbnksXG5cdFx0b1Byb3BlcnR5OiBhbnlcblx0KSB7XG5cdFx0Y29uc3Qgb0ludGVyZmFjZSA9IG9Db250ZXh0LmdldEludGVyZmFjZSgwKTtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmdldE1vZGVsKCk7XG5cblx0XHRpZiAoc0VudGl0eVBhdGggPT09IFwiL3VuZGVmaW5lZFwiICYmIG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuJHRhcmdldCkge1xuXHRcdFx0c0VudGl0eVBhdGggPSBgLyR7b1Byb3BlcnR5LiR0YXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiL1wiKVswXX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gRmllbGRIZWxwZXIuZ2V0RGF0YUZpZWxkQWxpZ25tZW50KG9EYXRhRmllbGQsIG9Nb2RlbCwgc0VudGl0eVBhdGgsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgZW5hYmxlZCBleHByZXNzaW9uIGZvciBEYXRhRmllbGRBY3Rpb25CdXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvbkVuYWJsZWRcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHBhcmFtIGJJc0JvdW5kIERhdGFQb2ludCBhY3Rpb24gYm91bmRcblx0ICogQHBhcmFtIG9BY3Rpb25Db250ZXh0IEFjdGlvbkNvbnRleHQgVmFsdWVcblx0ICogQHBhcmFtIHNBY3Rpb25Db250ZXh0Rm9ybWF0IEZvcm1hdHRlZCB2YWx1ZSBvZiBBY3Rpb25Db250ZXh0XG5cdCAqIEByZXR1cm5zIEEgYm9vbGVhbiBvciBzdHJpbmcgZXhwcmVzc2lvbiBmb3IgZW5hYmxlZCBwcm9wZXJ0eVxuXHQgKi9cblx0aXNEYXRhRmllbGRBY3Rpb25CdXR0b25FbmFibGVkOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBiSXNCb3VuZDogYm9vbGVhbiwgb0FjdGlvbkNvbnRleHQ6IGFueSwgc0FjdGlvbkNvbnRleHRGb3JtYXQ6IHN0cmluZykge1xuXHRcdGlmIChiSXNCb3VuZCAhPT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIFwidHJ1ZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gKG9BY3Rpb25Db250ZXh0ID09PSBudWxsID8gXCJ7PSAhJHsjXCIgKyBvRGF0YUZpZWxkLkFjdGlvbiArIFwifSA/IGZhbHNlIDogdHJ1ZSB9XCIgOiBvQWN0aW9uQ29udGV4dClcblx0XHRcdD8gc0FjdGlvbkNvbnRleHRGb3JtYXRcblx0XHRcdDogXCJ0cnVlXCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjb21wdXRlIHRoZSBsYWJlbCBmb3IgYSBEYXRhRmllbGQuXG5cdCAqIElmIHRoZSBEYXRhRmllbGQncyBsYWJlbCBpcyBhbiBlbXB0eSBzdHJpbmcsIGl0J3Mgbm90IHJlbmRlcmVkIGV2ZW4gaWYgYSBmYWxsYmFjayBleGlzdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBjb21wdXRlTGFiZWxUZXh0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvRGF0YUZpZWxkIFRoZSBEYXRhRmllbGQgYmVpbmcgcHJvY2Vzc2VkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvSW50ZXJmYWNlIFRoZSBpbnRlcmZhY2UgZm9yIGNvbnRleHQgaW5zdGFuY2Vcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbXB1dGVkIHRleHQgZm9yIHRoZSBEYXRhRmllbGQgbGFiZWwuXG5cdCAqL1xuXG5cdGNvbXB1dGVMYWJlbFRleHQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGxldCBzQ29udGV4dFBhdGggPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGlmIChzQ29udGV4dFBhdGguZW5kc1dpdGgoXCIvXCIpKSB7XG5cdFx0XHRzQ29udGV4dFBhdGggPSBzQ29udGV4dFBhdGguc2xpY2UoMCwgc0NvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdFx0fVxuXHRcdGNvbnN0IHNEYXRhRmllbGRMYWJlbCA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9MYWJlbGApO1xuXHRcdC8vV2UgZG8gbm90IHNob3cgYW4gYWRkaXRpb25hbCBsYWJlbCB0ZXh0IGZvciBhIGJ1dHRvbjpcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRpZiAoc0RhdGFGaWVsZExhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZExhYmVsO1xuXHRcdH0gZWxzZSBpZiAoc0RhdGFGaWVsZExhYmVsID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdFx0bGV0IHNEYXRhRmllbGRUYXJnZXRUaXRsZTtcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpID4gLTEgfHxcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIikgPiAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNEYXRhRmllbGRUYXJnZXRUaXRsZSA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoQC9UaXRsZWApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFwiKSA+IC0xKSB7XG5cdFx0XHRcdHNEYXRhRmllbGRUYXJnZXRUaXRsZSA9IG9Nb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0YCR7c0NvbnRleHRQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoQC9mbi8kUGF0aEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzRGF0YUZpZWxkVGFyZ2V0VGl0bGUpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkVGFyZ2V0VGl0bGU7XG5cdFx0fVxuXHRcdGxldCBzRGF0YUZpZWxkVGFyZ2V0TGFiZWw7XG5cdFx0aWYgKG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRzRGF0YUZpZWxkVGFyZ2V0TGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aEAvTGFiZWxgKTtcblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRUYXJnZXRMYWJlbCkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRUYXJnZXRMYWJlbDtcblx0XHR9XG5cblx0XHRjb25zdCBzRGF0YUZpZWxkVmFsdWVMYWJlbCA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9WYWx1ZS8kUGF0aEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKTtcblx0XHRpZiAoc0RhdGFGaWVsZFZhbHVlTGFiZWwpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkVmFsdWVMYWJlbDtcblx0XHR9XG5cblx0XHRsZXQgc0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWw7XG5cdFx0aWYgKG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRzRGF0YUZpZWxkVGFyZ2V0VmFsdWVMYWJlbCA9IG9Nb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9WYWx1ZS8kUGF0aEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRpZiAoc0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWwpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkVGFyZ2V0VmFsdWVMYWJlbDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYWxpZ24gdGhlIGRhdGEgZmllbGRzIHdpdGggdGhlaXIgbGFiZWwuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBidWlsZEV4cHJlc3Npb25Gb3JBbGlnbkl0ZW1zXG5cdCAqIEBwYXJhbSBzVmlzdWFsaXphdGlvblxuXHQgKiBAcmV0dXJucyBFeHByZXNzaW9uIGJpbmRpbmcgZm9yIGFsaWduSXRlbXMgcHJvcGVydHlcblx0ICovXG5cdGJ1aWxkRXhwcmVzc2lvbkZvckFsaWduSXRlbXM6IGZ1bmN0aW9uIChzVmlzdWFsaXphdGlvbjogc3RyaW5nKSB7XG5cdFx0Y29uc3QgZmllbGRWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBjb25zdGFudChzVmlzdWFsaXphdGlvbik7XG5cdFx0Y29uc3QgcHJvZ3Jlc3NWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBjb25zdGFudChcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1Byb2dyZXNzXCIpO1xuXHRcdGNvbnN0IHJhdGluZ1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiA9IGNvbnN0YW50KFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpO1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0b3IoXG5cdFx0XHRcdFx0ZXF1YWwoZmllbGRWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24sIHByb2dyZXNzVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uKSxcblx0XHRcdFx0XHRlcXVhbChmaWVsZFZpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiwgcmF0aW5nVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRjb25zdGFudChcIkNlbnRlclwiKSxcblx0XHRcdFx0aWZFbHNlKFVJLklzRWRpdGFibGUsIGNvbnN0YW50KFwiQ2VudGVyXCIpLCBjb25zdGFudChcIlN0cmV0Y2hcIikpXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNoZWNrIFZhbHVlTGlzdFJlZmVyZW5jZXMsIFZhbHVlTGlzdE1hcHBpbmcgYW5kIFZhbHVlTGlzdCBpbnNpZGUgQWN0aW9uUGFyYW1ldGVycyBmb3IgRmllbGRIZWxwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaGFzVmFsdWVIZWxwXG5cdCAqIEBwYXJhbSBvUHJvcGVydHlBbm5vdGF0aW9ucyBBY3Rpb24gcGFyYW1ldGVyIG9iamVjdFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlcmUgaXMgYSBWYWx1ZUxpc3QqIGFubm90YXRpb24gZGVmaW5lZFxuXHQgKi9cblx0aGFzVmFsdWVIZWxwQW5ub3RhdGlvbjogZnVuY3Rpb24gKG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnkpIHtcblx0XHRpZiAob1Byb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdHJldHVybiAhIShcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXNcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiXVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBkaXNwbGF5IHByb3BlcnR5IGZvciBBY3Rpb25QYXJhbWV0ZXIgZGlhbG9nLlxuXHQgKlxuXHQgKiBcdEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBUERpYWxvZ0Rpc3BsYXlGb3JtYXRcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgYWN0aW9uIHBhcmFtZXRlciBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb0ludGVyZmFjZSBUaGUgaW50ZXJmYWNlIGZvciB0aGUgY29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBUaGUgZGlzcGxheSBmb3JtYXQgIGZvciBhbiBhY3Rpb24gcGFyYW1ldGVyIEZpZWxkXG5cdCAqL1xuXHRnZXRBUERpYWxvZ0Rpc3BsYXlGb3JtYXQ6IGZ1bmN0aW9uIChvUHJvcGVydHk6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0bGV0IG9Bbm5vdGF0aW9uO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IG9Qcm9wZXJ0eS4kTmFtZSB8fCBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UHJvcGVydHkoYCR7c0NvbnRleHRQYXRofUBzYXB1aS5uYW1lYCk7XG5cdFx0Y29uc3Qgb0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9QGApO1xuXHRcdGNvbnN0IG9WYWx1ZUhlbHBBbm5vdGF0aW9uID1cblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdIHx8XG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdcIl0gfHxcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVmZXJlbmNlc1wiXTtcblx0XHRjb25zdCBnZXRWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUgPSBmdW5jdGlvbiAob1ZhbHVlTGlzdDogYW55KSB7XG5cdFx0XHRjb25zdCBvVmFsdWVMaXN0UGFyYW1ldGVyID0gb1ZhbHVlTGlzdC5QYXJhbWV0ZXJzLmZpbmQoZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb1BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eSAmJiBvUGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGggPT09IHNQcm9wZXJ0eU5hbWU7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBvVmFsdWVMaXN0UGFyYW1ldGVyICYmIG9WYWx1ZUxpc3RQYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHk7XG5cdFx0fTtcblx0XHRsZXQgc1ZhbHVlTGlzdFByb3BlcnR5TmFtZTtcblx0XHRpZiAoXG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRBcnJhbmdlbWVudFwiXSB8fFxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiXVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnMsIHVuZGVmaW5lZCk7XG5cdFx0fSBlbHNlIGlmIChvVmFsdWVIZWxwQW5ub3RhdGlvbikge1xuXHRcdFx0aWYgKG9WYWx1ZUhlbHBBbm5vdGF0aW9uLkNvbGxlY3Rpb25QYXRoKSB7XG5cdFx0XHRcdC8vIGdldCB0aGUgbmFtZSBvZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBpbiB2YWx1ZSBsaXN0IGNvbGxlY3Rpb25cblx0XHRcdFx0c1ZhbHVlTGlzdFByb3BlcnR5TmFtZSA9IGdldFZhbHVlTGlzdFByb3BlcnR5TmFtZShvVmFsdWVIZWxwQW5ub3RhdGlvbik7XG5cdFx0XHRcdGlmICghc1ZhbHVlTGlzdFByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdHJldHVybiBcIlZhbHVlXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gZ2V0IHRleHQgZm9yIHRoaXMgcHJvcGVydHlcblx0XHRcdFx0b0Fubm90YXRpb24gPSBvTW9kZWwuZ2V0T2JqZWN0KGAvJHtvVmFsdWVIZWxwQW5ub3RhdGlvbi5Db2xsZWN0aW9uUGF0aH0vJHtzVmFsdWVMaXN0UHJvcGVydHlOYW1lfUBgKTtcblx0XHRcdFx0cmV0dXJuIG9Bbm5vdGF0aW9uICYmIG9Bbm5vdGF0aW9uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdFx0PyBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob0Fubm90YXRpb24sIHVuZGVmaW5lZClcblx0XHRcdFx0XHQ6IFwiVmFsdWVcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvTW9kZWwucmVxdWVzdFZhbHVlTGlzdEluZm8oc0NvbnRleHRQYXRoLCB0cnVlKS50aGVuKGZ1bmN0aW9uIChvVmFsdWVMaXN0SW5mbzogYW55KSB7XG5cdFx0XHRcdFx0Ly8gZ2V0IHRoZSBuYW1lIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGluIHZhbHVlIGxpc3QgY29sbGVjdGlvblxuXHRcdFx0XHRcdHNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUgPSBnZXRWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUob1ZhbHVlTGlzdEluZm9bXCJcIl0pO1xuXHRcdFx0XHRcdGlmICghc1ZhbHVlTGlzdFByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiVmFsdWVcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZ2V0IHRleHQgZm9yIHRoaXMgcHJvcGVydHlcblx0XHRcdFx0XHRvQW5ub3RhdGlvbiA9IG9WYWx1ZUxpc3RJbmZvW1wiXCJdLiRtb2RlbFxuXHRcdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdFx0XHQuZ2V0T2JqZWN0KGAvJHtvVmFsdWVMaXN0SW5mb1tcIlwiXVtcIkNvbGxlY3Rpb25QYXRoXCJdfS8ke3NWYWx1ZUxpc3RQcm9wZXJ0eU5hbWV9QGApO1xuXHRcdFx0XHRcdHJldHVybiBvQW5ub3RhdGlvbiAmJiBvQW5ub3RhdGlvbltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXVxuXHRcdFx0XHRcdFx0PyBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob0Fubm90YXRpb24sIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdDogXCJWYWx1ZVwiO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiVmFsdWVcIjtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRpc3BsYXkgcHJvcGVydHkgZm9yIEFjdGlvblBhcmFtZXRlciBkaWFsb2cgRmllbGRIZWxwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0QWN0aW9uUGFyYW1ldGVyRGlhbG9nRmllbGRIZWxwXG5cdCAqIEBwYXJhbSBvQWN0aW9uUGFyYW1ldGVyIEFjdGlvbiBwYXJhbWV0ZXIgb2JqZWN0XG5cdCAqIEBwYXJhbSBzU2FwVUlOYW1lIEFjdGlvbiBzYXB1aSBuYW1lXG5cdCAqIEBwYXJhbSBzUGFyYW1OYW1lIFRoZSBwYXJhbWV0ZXIgbmFtZVxuXHQgKiBAcmV0dXJucyBUaGUgSUQgb2YgdGhlIGZpZWxkSGVscCB1c2VkIGJ5IHRoaXMgYWN0aW9uIHBhcmFtZXRlclxuXHQgKi9cblx0Z2V0QWN0aW9uUGFyYW1ldGVyRGlhbG9nRmllbGRIZWxwOiBmdW5jdGlvbiAob0FjdGlvblBhcmFtZXRlcjogb2JqZWN0LCBzU2FwVUlOYW1lOiBzdHJpbmcsIHNQYXJhbU5hbWU6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmhhc1ZhbHVlSGVscEFubm90YXRpb24ob0FjdGlvblBhcmFtZXRlcikgPyBnZW5lcmF0ZShbc1NhcFVJTmFtZSwgc1BhcmFtTmFtZV0pIDogdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZGVsZWdhdGUgY29uZmlndXJhdGlvbiBmb3IgQWN0aW9uUGFyYW1ldGVyIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFZhbHVlSGVscERlbGVnYXRlXG5cdCAqIEBwYXJhbSBpc0JvdW5kIEFjdGlvbiBpcyBib3VuZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZVBhdGggVGhlIEVudGl0eVR5cGUgUGF0aFxuXHQgKiBAcGFyYW0gc2FwVUlOYW1lIFRoZSBuYW1lIG9mIHRoZSBBY3Rpb25cblx0ICogQHBhcmFtIHBhcmFtTmFtZSBUaGUgbmFtZSBvZiB0aGUgQWN0aW9uUGFyYW1ldGVyXG5cdCAqIEByZXR1cm5zIFRoZSBkZWxlZ2F0ZSBjb25maWd1cmF0aW9uIG9iamVjdCBhcyBhIHN0cmluZ1xuXHQgKi9cblx0Z2V0VmFsdWVIZWxwRGVsZWdhdGU6IGZ1bmN0aW9uIChpc0JvdW5kOiBib29sZWFuLCBlbnRpdHlUeXBlUGF0aDogc3RyaW5nLCBzYXBVSU5hbWU6IHN0cmluZywgcGFyYW1OYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCBkZWxlZ2F0ZUNvbmZpZ3VyYXRpb246IHsgbmFtZTogc3RyaW5nOyBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkIH0gPSB7XG5cdFx0XHRuYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwic2FwL2ZlL21hY3Jvcy92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIiksXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3Rlcyhcblx0XHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZ2V0UHJvcGVydHlQYXRoKHtcblx0XHRcdFx0XHRcdFVuYm91bmRBY3Rpb246ICFpc0JvdW5kLFxuXHRcdFx0XHRcdFx0RW50aXR5VHlwZVBhdGg6IGVudGl0eVR5cGVQYXRoLFxuXHRcdFx0XHRcdFx0QWN0aW9uOiBzYXBVSU5hbWUsXG5cdFx0XHRcdFx0XHRQcm9wZXJ0eTogcGFyYW1OYW1lXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KSxcblx0XHRcdFx0cXVhbGlmaWVyczoge30sXG5cdFx0XHRcdHZhbHVlSGVscFF1YWxpZmllcjogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIlwiKSxcblx0XHRcdFx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2c6IHRydWVcblx0XHRcdH1cblx0XHR9O1xuXHRcdHJldHVybiBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcoZGVsZWdhdGVDb25maWd1cmF0aW9uKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gZm9yIE5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFZhbHVlSGVscERlbGVnYXRlRm9yTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRcblx0ICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgY3VycmVudCBwcm9wZXJ0eSBwYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBkZWxlZ2F0ZSBjb25maWd1cmF0aW9uIG9iamVjdCBhcyBhIHN0cmluZ1xuXHQgKi9cblx0Z2V0VmFsdWVIZWxwRGVsZWdhdGVGb3JOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZDogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgZGVsZWdhdGVDb25maWd1cmF0aW9uOiB7IG5hbWU6IHN0cmluZzsgcGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCB9ID0ge1xuXHRcdFx0bmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcInNhcC9mZS9tYWNyb3MvdmFsdWVoZWxwL1ZhbHVlSGVscERlbGVnYXRlXCIpLFxuXHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMocHJvcGVydHlQYXRoKSxcblx0XHRcdFx0cXVhbGlmaWVyczoge30sXG5cdFx0XHRcdHZhbHVlSGVscFF1YWxpZmllcjogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIlwiKVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZmV0Y2ggZW50aXR5IGZyb20gYSBwYXRoIGNvbnRhaW5pbmcgbXVsdGlwbGUgYXNzb2NpYXRpb25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB3aG9zZSBwYXRoIGlzIHRvIGJlIGNoZWNrZWRcblx0ICogQHBhcmFtIHNQYXRoIFRoZSBwYXRoIGZyb20gd2hpY2ggZW50aXR5IGhhcyB0byBiZSBmZXRjaGVkXG5cdCAqIEBwYXJhbSBzU291cmNlRW50aXR5IFRoZSBlbnRpdHkgcGF0aCBpbiB3aGljaCBuYXYgZW50aXR5IGV4aXN0c1xuXHQgKiBAcGFyYW0gaVN0YXJ0IFRoZSBzdGFydCBpbmRleCA6IGJlZ2lubmluZyBwYXJ0cyBvZiB0aGUgcGF0aCB0byBiZSBpZ25vcmVkXG5cdCAqIEBwYXJhbSBpRGlmZiBUaGUgZGlmZiBpbmRleCA6IGVuZCBwYXJ0cyBvZiB0aGUgcGF0aCB0byBiZSBpZ25vcmVkXG5cdCAqIEByZXR1cm5zIFRoZSBwYXRoIG9mIHRoZSBlbnRpdHkgc2V0XG5cdCAqL1xuXHRfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWw6IGZ1bmN0aW9uIChvQ29udGV4dDogQ29udGV4dCwgc1BhdGg6IHN0cmluZywgc1NvdXJjZUVudGl0eTogc3RyaW5nLCBpU3RhcnQ6IGFueSwgaURpZmY6IGFueSkge1xuXHRcdGxldCBhTmF2UGFydHMgPSBzUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xuXHRcdGFOYXZQYXJ0cyA9IGFOYXZQYXJ0cy5maWx0ZXIoZnVuY3Rpb24gKHNQYXJ0OiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBzUGFydCAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHRcdH0pO1xuXHRcdGlmIChhTmF2UGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IGlTdGFydDsgaSA8IGFOYXZQYXJ0cy5sZW5ndGggLSBpRGlmZjsgaSsrKSB7XG5cdFx0XHRcdHNTb3VyY2VFbnRpdHkgPSBgLyR7b0NvbnRleHQuZ2V0T2JqZWN0KGAke3NTb3VyY2VFbnRpdHl9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7YU5hdlBhcnRzW2ldfWApfWA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzU291cmNlRW50aXR5O1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGZpbmQgdGhlIGVudGl0eSBvZiB0aGUgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRQcm9wZXJ0eUNvbGxlY3Rpb25cblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgY29udGV4dCBmcm9tIHdoaWNoIGRhdGFmaWVsZCdzIHBhdGggbmVlZHMgdG8gYmUgZXh0cmFjdGVkLlxuXHQgKiBAcGFyYW0gb0NvbnRleHRPYmplY3QgVGhlIE1ldGFkYXRhIENvbnRleHQoTm90IHBhc3NlZCB3aGVuIGNhbGxlZCB3aXRoIHRlbXBsYXRlOndpdGgpXG5cdCAqIEByZXR1cm5zIFRoZSBlbnRpdHkgc2V0IHBhdGggb2YgdGhlIHByb3BlcnR5XG5cdCAqL1xuXHRnZXRQcm9wZXJ0eUNvbGxlY3Rpb246IGZ1bmN0aW9uIChvUHJvcGVydHk6IG9iamVjdCwgb0NvbnRleHRPYmplY3Q6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gKG9Db250ZXh0T2JqZWN0ICYmIG9Db250ZXh0T2JqZWN0LmNvbnRleHQpIHx8IG9Qcm9wZXJ0eTtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBhTWFpbkVudGl0eVBhcnRzID0gc1BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihCb29sZWFuKTtcblx0XHRjb25zdCBzTWFpbkVudGl0eSA9IGFNYWluRW50aXR5UGFydHNbMF07XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9Db250ZXh0LmdldE9iamVjdChcIiRQYXRoXCIpO1xuXHRcdGxldCBzRmllbGRTb3VyY2VFbnRpdHkgPSBgLyR7c01haW5FbnRpdHl9YDtcblx0XHQvLyBjaGVja2luZyBhZ2FpbnN0IHByZWZpeCBvZiBhbm5vdGF0aW9ucywgaWUuIEBjb20uc2FwLnZvY2FidWxhcmllcy5cblx0XHQvLyBhcyBhbm5vdGF0aW9uIHBhdGggY2FuIGJlIG9mIGEgbGluZSBpdGVtLCBmaWVsZCBncm91cCBvciBmYWNldFxuXHRcdGlmIChzUGF0aC5pbmRleE9mKFwiL0Bjb20uc2FwLnZvY2FidWxhcmllcy5cIikgPiAtMSkge1xuXHRcdFx0Y29uc3QgaUFubm9JbmRleCA9IHNQYXRoLmluZGV4T2YoXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlwiKTtcblx0XHRcdGNvbnN0IHNJbm5lclBhdGggPSBzUGF0aC5zdWJzdHJpbmcoMCwgaUFubm9JbmRleCk7XG5cdFx0XHQvLyB0aGUgZmFjZXQgb3IgbGluZSBpdGVtJ3MgZW50aXR5IGNvdWxkIGJlIGEgbmF2aWdhdGlvbiBlbnRpdHlcblx0XHRcdHNGaWVsZFNvdXJjZUVudGl0eSA9IEZpZWxkSGVscGVyLl9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbChvQ29udGV4dCwgc0lubmVyUGF0aCwgc0ZpZWxkU291cmNlRW50aXR5LCAxLCAwKTtcblx0XHR9XG5cdFx0aWYgKHNQcm9wZXJ0eVBhdGggJiYgc1Byb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHQvLyB0aGUgZmllbGQgd2l0aGluIGZhY2V0IG9yIGxpbmUgaXRlbSBjb3VsZCBiZSBmcm9tIGEgbmF2aWdhdGlvbiBlbnRpdHlcblx0XHRcdHNGaWVsZFNvdXJjZUVudGl0eSA9IEZpZWxkSGVscGVyLl9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbChvQ29udGV4dCwgc1Byb3BlcnR5UGF0aCwgc0ZpZWxkU291cmNlRW50aXR5LCAwLCAxKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNGaWVsZFNvdXJjZUVudGl0eTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB1c2VkIGluIGEgdGVtcGxhdGUgd2l0aCB0byByZXRyaWV2ZSB0aGUgY3VycmVuY3kgb3IgdGhlIHVuaXQgcHJvcGVydHkgaW5zaWRlIGEgdGVtcGxhdGluZyB2YXJpYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUFubm90YXRpb25zXG5cdCAqIEByZXR1cm5zIFRoZSBhbm5vdGF0aW9uUGF0aCB0byBiZSBkZWFsdCB3aXRoIGJ5IHRlbXBsYXRlOndpdGhcblx0ICovXG5cdGdldFVuaXRPckN1cnJlbmN5OiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zT2JqZWN0ID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IHNBbm5vdGF0aW9uUGF0aCA9IG9Qcm9wZXJ0eUFubm90YXRpb25zLnNQYXRoO1xuXHRcdGlmIChvUHJvcGVydHlBbm5vdGF0aW9uc09iamVjdFtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIl0pIHtcblx0XHRcdHNBbm5vdGF0aW9uUGF0aCA9IGAke3NBbm5vdGF0aW9uUGF0aH1PcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQW5ub3RhdGlvblBhdGggPSBgJHtzQW5ub3RhdGlvblBhdGh9T3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXRgO1xuXHRcdH1cblxuXHRcdHJldHVybiBzQW5ub3RhdGlvblBhdGg7XG5cdH0sXG5cdGhhc1N0YXRpY1VuaXRPckN1cnJlbmN5OiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdHJldHVybiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIl1cblx0XHRcdD8gIW9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXS4kUGF0aFxuXHRcdFx0OiAhb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXRcIl0uJFBhdGg7XG5cdH0sXG5cdGdldFN0YXRpY1VuaXRPckN1cnJlbmN5OiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSwgb0Zvcm1hdE9wdGlvbnM6IGFueSkge1xuXHRcdGlmIChvRm9ybWF0T3B0aW9ucyAmJiBvRm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIpIHtcblx0XHRcdGNvbnN0IHVuaXQgPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIl0gfHwgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXRcIl07XG5cblx0XHRcdGNvbnN0IGRhdGVGb3JtYXQgPSBEYXRlRm9ybWF0LmdldERhdGVJbnN0YW5jZSgpIGFzIGFueTtcblx0XHRcdGNvbnN0IGxvY2FsZURhdGEgPSBkYXRlRm9ybWF0Lm9Mb2NhbGVEYXRhLm1EYXRhO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGxvY2FsZURhdGEgJiZcblx0XHRcdFx0bG9jYWxlRGF0YS51bml0cyAmJlxuXHRcdFx0XHRsb2NhbGVEYXRhLnVuaXRzLnNob3J0ICYmXG5cdFx0XHRcdGxvY2FsZURhdGEudW5pdHMuc2hvcnRbdW5pdF0gJiZcblx0XHRcdFx0bG9jYWxlRGF0YS51bml0cy5zaG9ydFt1bml0XS5kaXNwbGF5TmFtZVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBsb2NhbGVEYXRhLnVuaXRzLnNob3J0W3VuaXRdLmRpc3BsYXlOYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdW5pdDtcblx0XHR9XG5cdH0sXG5cdGdldEVtcHR5SW5kaWNhdG9yVHJpZ2dlcjogZnVuY3Rpb24gKGJBY3RpdmU6IGFueSwgc0JpbmRpbmc6IGFueSwgc0Z1bGxUZXh0QmluZGluZzogYW55KSB7XG5cdFx0aWYgKHNGdWxsVGV4dEJpbmRpbmcpIHtcblx0XHRcdHJldHVybiBiQWN0aXZlID8gc0Z1bGxUZXh0QmluZGluZyA6IFwiaW5hY3RpdmVcIjtcblx0XHR9XG5cdFx0cmV0dXJuIGJBY3RpdmUgPyBzQmluZGluZyA6IFwiaW5hY3RpdmVcIjtcblx0fSxcblx0LyoqXG5cdCAqIFdoZW4gdGhlIHZhbHVlIGRpc3BsYXllZCBpcyBpbiB0ZXh0IGFycmFuZ2VtZW50IFRleHRPbmx5IHdlIGFsc28gd2FudCB0byByZXRyaWV2ZSB0aGUgVGV4dCB2YWx1ZSBmb3IgdGFibGVzIGV2ZW4gaWYgd2UgZG9uJ3Qgc2hvdyBpdC5cblx0ICogVGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBvcmlnaW5hbCBkYXRhIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGN1cnJlbnQgb2JqZWN0XG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50IERhdGFGaWVsZCB1c2luZyB0ZXh0IGFycmFuZ2VtZW50IGFubm90YXRpb25cblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YUZpZWxkIGNvbnRhaW5pbmcgdGhlIHZhbHVlIHVzaW5nIHRleHQgYXJyYW5nZW1lbnQgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyB0byB0aGUgdmFsdWVcblx0ICovXG5cdGdldEJpbmRpbmdJbmZvRm9yVGV4dEFycmFuZ2VtZW50OiBmdW5jdGlvbiAob1RoaXM6IG9iamVjdCwgb0RhdGFGaWVsZFRleHRBcnJhbmdlbWVudDogYW55LCBvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50ICYmXG5cdFx0XHRvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50LiRFbnVtTWVtYmVyICYmXG5cdFx0XHRvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50LiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIiAmJlxuXHRcdFx0b0RhdGFGaWVsZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGB7JHtvRGF0YUZpZWxkLlZhbHVlLiRQYXRofX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdHNlbWFudGljS2V5Rm9ybWF0OiBmdW5jdGlvbiAodlJhdzogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHQvLyBUaGUgRW1wdHkgYXJndW1lbnQgZW5zdXJlcyB0aGF0IFwiZ3JvdXBpbmdFbmFibGVkXCIgaXMgYWRkZWQgdG8gXCJmb3JtYXRPcHRpb25zXCJcblx0XHRvSW50ZXJmYWNlLmFyZ3VtZW50cyA9IFt7fSwgeyBncm91cGluZ0VuYWJsZWQ6IGZhbHNlIH1dO1xuXHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLmZvcm1hdCh2UmF3LCBvSW50ZXJmYWNlKTtcblx0fSxcblx0Z2V0UGF0aEZvckljb25Tb3VyY2U6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRyZXR1cm4gXCJ7PSBGSUVMRFJVTlRJTUUuZ2V0SWNvbkZvck1pbWVUeXBlKCV7XCIgKyBzUHJvcGVydHlQYXRoICsgXCJAb2RhdGEubWVkaWFDb250ZW50VHlwZX0pfVwiO1xuXHR9LFxuXHRnZXRGaWxlbmFtZUV4cHI6IGZ1bmN0aW9uIChzRmlsZW5hbWU6IGFueSwgc05vRmlsZW5hbWVUZXh0OiBhbnkpIHtcblx0XHRpZiAoc0ZpbGVuYW1lKSB7XG5cdFx0XHRpZiAoc0ZpbGVuYW1lLmluZGV4T2YoXCJ7XCIpID09PSAwKSB7XG5cdFx0XHRcdC8vIGZpbGVuYW1lIGlzIHJlZmVyZW5jZWQgdmlhIHBhdGgsIGkuZS4gQENvcmUuQ29udGVudERpc3Bvc2l0aW9uLkZpbGVuYW1lIDogcGF0aFxuXHRcdFx0XHRyZXR1cm4gXCJ7PSAkXCIgKyBzRmlsZW5hbWUgKyBcIiA/ICRcIiArIHNGaWxlbmFtZSArIFwiIDogJFwiICsgc05vRmlsZW5hbWVUZXh0ICsgXCJ9XCI7XG5cdFx0XHR9XG5cdFx0XHQvLyBzdGF0aWMgZmlsZW5hbWUsIGkuZS4gQENvcmUuQ29udGVudERpc3Bvc2l0aW9uLkZpbGVuYW1lIDogJ3NvbWVTdGF0aWNOYW1lJ1xuXHRcdFx0cmV0dXJuIHNGaWxlbmFtZTtcblx0XHR9XG5cdFx0Ly8gbm8gQENvcmUuQ29udGVudERpc3Bvc2l0aW9uLkZpbGVuYW1lXG5cdFx0cmV0dXJuIHNOb0ZpbGVuYW1lVGV4dDtcblx0fSxcblxuXHRjYWxjdWxhdGVNQmZyb21CeXRlOiBmdW5jdGlvbiAoaUJ5dGU6IGFueSkge1xuXHRcdHJldHVybiBpQnl0ZSA/IChpQnl0ZSAvICgxMDI0ICogMTAyNCkpLnRvRml4ZWQoNikgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdGdldERvd25sb2FkVXJsOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gcHJvcGVydHlQYXRoICsgXCJ7PSAke2ludGVybmFsPi9zdGlja3lTZXNzaW9uVG9rZW59ID8gKCc/U0FQLUNvbnRleHRJZD0nICsgJHtpbnRlcm5hbD4vc3RpY2t5U2Vzc2lvblRva2VufSkgOiAnJyB9XCI7XG5cdH0sXG5cdGdldE1hcmdpbkNsYXNzOiBmdW5jdGlvbiAoY29tcGFjdFNlbWFudGljS2V5OiBzdHJpbmcgfCBib29sZWFuKSB7XG5cdFx0cmV0dXJuIGNvbXBhY3RTZW1hbnRpY0tleSA9PT0gXCJ0cnVlXCIgfHwgY29tcGFjdFNlbWFudGljS2V5ID09PSB0cnVlID8gXCJzYXBNVGFibGVDb250ZW50TWFyZ2luXCIgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdGdldFJlcXVpcmVkOiBmdW5jdGlvbiAoaW1tdXRhYmxlS2V5OiBhbnksIHRhcmdldDogYW55LCByZXF1aXJlZFByb3BlcnRpZXM6IGFueSkge1xuXHRcdGxldCB0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb246IGFueSA9IGNvbnN0YW50KGZhbHNlKTtcblx0XHRpZiAodGFyZ2V0ICE9PSBudWxsKSB7XG5cdFx0XHR0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb24gPSBpc1JlcXVpcmVkRXhwcmVzc2lvbih0YXJnZXQ/LnRhcmdldE9iamVjdCk7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvcih0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb24sIHJlcXVpcmVkUHJvcGVydGllcy5pbmRleE9mKGltbXV0YWJsZUtleSkgPiAtMSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIGNoZWNrcyBpZiB0aGUgZmllbGQgaXMgYWxyZWFkeSBwYXJ0IG9mIGEgZm9ybS5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFGaWVsZENvbGxlY3Rpb24gVGhlIGxpc3Qgb2YgdGhlIGZpZWxkcyBvZiB0aGUgZm9ybVxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkT2JqZWN0UGF0aCBUaGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aCBvZiB0aGUgZmllbGQgd2hpY2ggbmVlZHMgdG8gYmUgY2hlY2tlZCBpbiB0aGUgZm9ybVxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGZpZWxkIGlzIGFscmVhZHkgcGFydCBvZiB0aGUgZm9ybSwgYGZhbHNlYCBvdGhlcndpc2Vcblx0ICovXG5cdGlzRmllbGRQYXJ0T2ZGb3JtOiBmdW5jdGlvbiAoZGF0YUZpZWxkQ29sbGVjdGlvbjogRm9ybUVsZW1lbnRbXSwgZGF0YUZpZWxkT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdC8vZ2VuZXJhdGluZyBrZXkgZm9yIHRoZSByZWNlaXZlZCBkYXRhIGZpZWxkXG5cdFx0Y29uc3QgY29ubmVjdGVkRGF0YUZpZWxkS2V5ID0gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGRPYmplY3RQYXRoLnRhcmdldE9iamVjdCk7XG5cdFx0Ly8gdHJ5aW5nIHRvIGZpbmQgdGhlIGdlbmVyYXRlZCBrZXkgaW4gYWxyZWFkeSBleGlzdGluZyBmb3JtIGVsZW1lbnRzXG5cdFx0Y29uc3QgaXNGaWVsZEZvdW5kID0gZGF0YUZpZWxkQ29sbGVjdGlvbi5maW5kKChmaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIGZpZWxkLmtleSA9PT0gY29ubmVjdGVkRGF0YUZpZWxkS2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiBpc0ZpZWxkRm91bmQgPyB0cnVlIDogZmFsc2U7XG5cdH1cbn07XG4oRmllbGRIZWxwZXIuYnVpbGRFeHByZXNzaW9uRm9yVGV4dFZhbHVlIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZmllbGRDb250cm9sIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZ2V0VHlwZUFsaWdubWVudCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldFByb3BlcnR5Q29sbGVjdGlvbiBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEFQRGlhbG9nRGlzcGxheUZvcm1hdCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLnNlbWFudGljS2V5Rm9ybWF0IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuY29tcHV0ZUxhYmVsVGV4dCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgRmllbGRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBeUJBLE1BQU1BLFdBQVcsR0FBRyxvQ0FBb0M7SUFDdkRDLElBQUksR0FBRyw2QkFBNkI7RUFFckMsTUFBTUMsV0FBVyxHQUFHO0lBQ25CO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFdBQVcsRUFBRSxVQUFVQyxvQkFBeUIsRUFBRUMsc0JBQTJCLEVBQUU7TUFDOUUsTUFBTUMsZUFBZSxHQUFHRixvQkFBb0IsQ0FBQyxzQ0FBc0MsQ0FBQztRQUNuRkcsMEJBQTBCLEdBQ3pCRCxlQUFlLEtBQ2JGLG9CQUFvQixJQUNyQkEsb0JBQW9CLENBQUMsaUZBQWlGLENBQUMsSUFDdEdDLHNCQUFzQixJQUFJQSxzQkFBc0IsQ0FBQyw2Q0FBNkMsQ0FBRSxDQUFDO01BRXJHLElBQUlFLDBCQUEwQixFQUFFO1FBQy9CLElBQUlBLDBCQUEwQixDQUFDQyxXQUFXLEtBQUsseURBQXlELEVBQUU7VUFDekcsT0FBTyxhQUFhO1FBQ3JCLENBQUMsTUFBTSxJQUFJRCwwQkFBMEIsQ0FBQ0MsV0FBVyxLQUFLLHlEQUF5RCxFQUFFO1VBQ2hILE9BQU8sa0JBQWtCO1FBQzFCO1FBQ0E7UUFDQSxPQUFPLGtCQUFrQjtNQUMxQjtNQUNBLE9BQU9GLGVBQWUsR0FBRyxrQkFBa0IsR0FBRyxPQUFPO0lBQ3RELENBQUM7SUFDREcsMkJBQTJCLEVBQUUsVUFBVUMsYUFBa0IsRUFBRUMsVUFBZSxFQUFFO01BQzNFLE1BQU1DLFVBQVUsR0FBR0QsVUFBVSxDQUFDRSxPQUFPLENBQUNDLFFBQVEsRUFBRTtNQUNoRCxNQUFNQyxLQUFLLEdBQUdKLFVBQVUsQ0FBQ0UsT0FBTyxDQUFDRyxPQUFPLEVBQUU7TUFDMUMsTUFBTUMsc0JBQXNCLEdBQUdMLFVBQVUsQ0FBQ00sb0JBQW9CLENBQUUsR0FBRUgsS0FBTSxzQ0FBcUMsQ0FBQztNQUM5RyxNQUFNVCxlQUFlLEdBQUdXLHNCQUFzQixDQUFDRSxXQUFXLEVBQUU7TUFDNUQsTUFBTUMsZUFBZSxHQUFHZCxlQUFlLEdBQUdlLGdCQUFnQixDQUFDQyxLQUFLLENBQUNoQixlQUFlLEVBQUU7UUFBRU8sT0FBTyxFQUFFSTtNQUF1QixDQUFDLENBQUMsR0FBR00sU0FBUztNQUNsSSxJQUFJQyxXQUErQixHQUFHLEVBQUU7TUFDeENkLGFBQWEsR0FBR1csZ0JBQWdCLENBQUNJLGlCQUFpQixDQUFDZixhQUFhLENBQUM7TUFDakUsSUFBSUEsYUFBYSxDQUFDZ0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJTixlQUFlLEVBQUU7UUFDdkRJLFdBQVcsR0FBR2QsYUFBYSxDQUFDaUIsT0FBTyxDQUFDLFFBQVEsRUFBRVAsZUFBZSxDQUFDUSxNQUFNLENBQUMsQ0FBQyxFQUFFUixlQUFlLENBQUNTLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztNQUNyRyxDQUFDLE1BQU07UUFDTkwsV0FBVyxHQUFHSixlQUFlO01BQzlCO01BQ0EsSUFBSUksV0FBVyxFQUFFO1FBQ2hCQSxXQUFXLEdBQUcsWUFBWSxHQUFHQSxXQUFXLENBQUNHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUNBLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcscUNBQXFDO01BQzNIO01BQ0EsT0FBT0gsV0FBVztJQUNuQixDQUFDO0lBRURNLHNDQUFzQyxFQUFFLFVBQVVDLG9CQUF5QixFQUFFO01BQzVFLE1BQU1DLGNBQWMsR0FBR0Qsb0JBQW9CLENBQUNFLGlCQUFpQixDQUFDQyxJQUFJO01BQ2xFLElBQUluQixLQUFLLEdBQUksSUFBR2lCLGNBQWUsRUFBQztNQUNoQyxNQUFNRyxxQkFBcUIsR0FBR0osb0JBQW9CLENBQUNLLG9CQUFvQjtNQUN2RSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YscUJBQXFCLENBQUNOLE1BQU0sRUFBRVEsQ0FBQyxFQUFFLEVBQUU7UUFDdER0QixLQUFLLElBQUssSUFBR29CLHFCQUFxQixDQUFDRSxDQUFDLENBQUMsQ0FBQ0gsSUFBSyxFQUFDO01BQzdDO01BQ0EsT0FBT25CLEtBQUs7SUFDYixDQUFDO0lBQ0R1QixpQkFBaUIsRUFBRSxVQUFVM0IsVUFBZSxFQUFFNEIsUUFBYSxFQUFFO01BQzVELE1BQU1DLFFBQVEsR0FBR0QsUUFBUSxDQUFDMUIsT0FBTztNQUNqQyxJQUFJNEIsY0FBbUIsR0FBRyxLQUFLO01BQy9CLElBQUk5QixVQUFVLENBQUMrQixLQUFLLElBQUkvQixVQUFVLENBQUMrQixLQUFLLENBQUNDLEtBQUssRUFBRTtRQUMvQ0YsY0FBYyxHQUFHRCxRQUFRLENBQUNJLFNBQVMsQ0FBQywrQ0FBK0MsQ0FBQztNQUNyRjtNQUNBLElBQUksQ0FBQ0gsY0FBYyxJQUFJQSxjQUFjLENBQUNFLEtBQUssRUFBRTtRQUM1Q0YsY0FBYyxHQUFHRCxRQUFRLENBQUNJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQztRQUN6RSxJQUFJLENBQUNILGNBQWMsSUFBSUEsY0FBYyxDQUFDRSxLQUFLLEVBQUU7VUFDNUNGLGNBQWMsR0FBRyxLQUFLO1FBQ3ZCO01BQ0Q7TUFDQSxPQUFPLENBQUNBLGNBQWM7SUFDdkIsQ0FBQztJQUNESSxtQ0FBbUMsRUFBRSxVQUFVQyxNQUFXLEVBQUU7TUFDM0QsSUFDQ0EsTUFBTSxJQUNOQSxNQUFNLENBQUNDLGFBQWEsSUFDcEJELE1BQU0sQ0FBQ0MsYUFBYSxDQUFDQyxvQ0FBb0MsSUFDekRGLE1BQU0sQ0FBQ0MsYUFBYSxDQUFDRSxjQUFjLEVBQ2xDO1FBQ0QsT0FDQyxXQUFXLEdBQ1gsV0FBVyxHQUNYSCxNQUFNLENBQUNDLGFBQWEsQ0FBQ0UsY0FBYyxHQUNuQyxLQUFLLEdBQ0wsb0RBQW9ELEdBQ3BELCtDQUErQyxHQUMvQywrQ0FBK0MsR0FDL0MsNERBQTRELEdBQzVELHdFQUF3RTtNQUUxRSxDQUFDLE1BQU07UUFDTixPQUFPLEtBQUs7TUFDYjtJQUNELENBQUM7SUFDREMsVUFBVSxFQUFFLFVBQVVDLGFBQWtCLEVBQUVDLFNBQWMsRUFBRTtNQUN6RCxJQUFJQSxTQUFTLEtBQUssU0FBUyxJQUFJQSxTQUFTLEtBQUssVUFBVSxJQUFJQSxTQUFTLEtBQUssVUFBVSxFQUFFO1FBQ3BGLE9BQU8sS0FBSztNQUNiO01BQ0EsSUFBSUQsYUFBYSxFQUFFO1FBQ2xCLElBQUtFLGFBQWEsQ0FBU0MsYUFBYSxDQUFDSCxhQUFhLENBQUMsRUFBRTtVQUN4RCxPQUFPLE1BQU0sR0FBR0EsYUFBYSxHQUFHLFNBQVM7UUFDMUMsQ0FBQyxNQUFNO1VBQ04sT0FBT0EsYUFBYSxJQUFJLDJEQUEyRDtRQUNwRjtNQUNEO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQztJQUVESSw0QkFBNEIsRUFBRSxVQUFVQyxNQUFXLEVBQUVoQixRQUFhLEVBQUU7TUFDbkU7TUFDQSxJQUFJLE9BQU9nQixNQUFNLEtBQUssUUFBUSxFQUFFO1FBQy9CLElBQUlBLE1BQU0sSUFBSUEsTUFBTSxDQUFDQyxHQUFHLElBQUlELE1BQU0sQ0FBQ0MsR0FBRyxDQUFDNUIsTUFBTSxLQUFLLENBQUMsRUFBRTtVQUNwRDtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EsTUFBTTZCLFNBQWMsR0FBRztZQUFFRCxHQUFHLEVBQUU7VUFBRyxDQUFDO1VBQ2xDQyxTQUFTLENBQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsTUFBTSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1VBQ2hDQyxTQUFTLENBQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsTUFBTSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1VBQ2hDQyxTQUFTLENBQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsTUFBTSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1VBQ2hDLE9BQU9wQyxnQkFBZ0IsQ0FBQ0MsS0FBSyxDQUFDb0MsU0FBUyxFQUFFbEIsUUFBUSxDQUFDO1FBQ25ELENBQUMsTUFBTTtVQUNOLE9BQU8sUUFBUSxHQUFHZ0IsTUFBTSxDQUFDYixLQUFLLEdBQUcsS0FBSztRQUN2QztNQUNELENBQUMsTUFBTSxJQUFJLE9BQU9hLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDdkMsT0FBT25DLGdCQUFnQixDQUFDQyxLQUFLLENBQUMsQ0FBQ2tDLE1BQU0sRUFBRWhCLFFBQVEsQ0FBQztNQUNqRCxDQUFDLE1BQU07UUFDTixPQUFPakIsU0FBUztNQUNqQjtJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDb0MsWUFBWSxFQUFFLFVBQVVDLFNBQWMsRUFBRUMsVUFBZSxFQUFFO01BQ3hELElBQUlDLGFBQWE7TUFDakIsSUFBSSxPQUFPRixTQUFTLEtBQUssUUFBUSxFQUFFO1FBQ2xDLElBQUlDLFVBQVUsQ0FBQ2hELE9BQU8sQ0FBQ0csT0FBTyxFQUFFLENBQUNVLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSW1DLFVBQVUsQ0FBQ2hELE9BQU8sQ0FBQ0csT0FBTyxFQUFFLENBQUNVLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtVQUNySDtVQUNBb0MsYUFBYSxHQUFHRixTQUFTO1FBQzFCO01BQ0QsQ0FBQyxNQUFNLElBQUlBLFNBQVMsQ0FBQ2pCLEtBQUssSUFBSWlCLFNBQVMsQ0FBQ0csYUFBYSxFQUFFO1FBQ3RELE1BQU1oRCxLQUFLLEdBQUc2QyxTQUFTLENBQUNqQixLQUFLLEdBQUcsUUFBUSxHQUFHLGdCQUFnQjtRQUMzRCxNQUFNcUIsWUFBWSxHQUFHSCxVQUFVLENBQUNoRCxPQUFPLENBQUNHLE9BQU8sRUFBRTtRQUNqRDhDLGFBQWEsR0FBR0QsVUFBVSxDQUFDaEQsT0FBTyxDQUFDK0IsU0FBUyxDQUFFLEdBQUVvQixZQUFZLEdBQUdqRCxLQUFNLGVBQWMsQ0FBQztNQUNyRixDQUFDLE1BQU0sSUFBSTZDLFNBQVMsQ0FBQ2xCLEtBQUssSUFBSWtCLFNBQVMsQ0FBQ2xCLEtBQUssQ0FBQ0MsS0FBSyxFQUFFO1FBQ3BEbUIsYUFBYSxHQUFHRixTQUFTLENBQUNsQixLQUFLLENBQUNDLEtBQUs7TUFDdEMsQ0FBQyxNQUFNO1FBQ05tQixhQUFhLEdBQUdELFVBQVUsQ0FBQ2hELE9BQU8sQ0FBQytCLFNBQVMsQ0FBQyxhQUFhLENBQUM7TUFDNUQ7TUFFQSxPQUFPa0IsYUFBYTtJQUNyQixDQUFDO0lBRURHLFlBQVksRUFBRSxVQUFVdkQsYUFBa0IsRUFBRW1ELFVBQWUsRUFBRTtNQUM1RCxNQUFNSyxNQUFNLEdBQUdMLFVBQVUsSUFBSUEsVUFBVSxDQUFDaEQsT0FBTyxDQUFDQyxRQUFRLEVBQUU7TUFDMUQsTUFBTUMsS0FBSyxHQUFHOEMsVUFBVSxJQUFJQSxVQUFVLENBQUNoRCxPQUFPLENBQUNHLE9BQU8sRUFBRTtNQUN4RCxNQUFNbUQsb0JBQW9CLEdBQUdELE1BQU0sSUFBSUEsTUFBTSxDQUFDaEQsb0JBQW9CLENBQUUsR0FBRUgsS0FBTSw4Q0FBNkMsQ0FBQztNQUMxSCxNQUFNb0MsYUFBYSxHQUFHZ0Isb0JBQW9CLElBQUlBLG9CQUFvQixDQUFDaEQsV0FBVyxFQUFFO01BQ2hGLElBQUlnQyxhQUFhLEVBQUU7UUFDbEIsSUFBSUEsYUFBYSxDQUFDaUIsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1VBQ2hELE9BQU9qQixhQUFhLENBQUMzQyxXQUFXO1FBQ2pDLENBQUMsTUFBTSxJQUFJMkMsYUFBYSxDQUFDaUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1VBQ2pELE9BQU8vQyxnQkFBZ0IsQ0FBQ0MsS0FBSyxDQUFDNkIsYUFBYSxFQUFFO1lBQUV0QyxPQUFPLEVBQUVzRDtVQUFxQixDQUFDLENBQUM7UUFDaEY7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPNUMsU0FBUztNQUNqQjtJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDOEMsaUJBQWlCLEVBQUUsVUFBVUMsZ0JBQTZCLEVBQUVDLGNBQXdCLEVBQUU7TUFDckY7TUFDQSxNQUFNUCxZQUFZLEdBQUdNLGdCQUFnQixDQUFDdEQsT0FBTyxFQUFFO01BQy9DLE1BQU13RCxRQUFRLEdBQUdGLGdCQUFnQixDQUFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO01BQ25ELElBQUk3QixLQUFLLEdBQUd5RCxRQUFRLENBQUM3QixLQUFLLEdBQUksR0FBRXFCLFlBQWEsUUFBTyxHQUFHQSxZQUFZO01BQ25FLE1BQU1TLFNBQVMsR0FBSSxHQUFFMUQsS0FBTSxHQUFFO01BQzdCLE1BQU1YLG9CQUFvQixHQUFHa0UsZ0JBQWdCLENBQUMxQixTQUFTLENBQUM2QixTQUFTLENBQUM7TUFDbEUsSUFBSUMsV0FBVztNQUNmLElBQUl0RSxvQkFBb0IsRUFBRTtRQUN6QnNFLFdBQVcsR0FDVHRFLG9CQUFvQixDQUFDZ0UsY0FBYyxDQUFDcEUsV0FBVyxDQUFDLElBQUlBLFdBQVcsSUFBTUksb0JBQW9CLENBQUNnRSxjQUFjLENBQUNuRSxJQUFJLENBQUMsSUFBSUEsSUFBSztRQUN6SCxJQUFJeUUsV0FBVyxJQUFJLENBQUNILGNBQWMsRUFBRTtVQUNuQyxNQUFNSSxtQkFBbUIsR0FBSSxHQUFFNUQsS0FBSyxHQUFHMkQsV0FBWSxRQUFPO1VBQzFEO1VBQ0EsSUFBSUosZ0JBQWdCLENBQUMxQixTQUFTLENBQUMrQixtQkFBbUIsQ0FBQyxFQUFFO1lBQ3BENUQsS0FBSyxHQUFHNEQsbUJBQW1CO1VBQzVCO1FBQ0Q7TUFDRDtNQUNBLE9BQU81RCxLQUFLO0lBQ2IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDNkQsK0JBQStCLEVBQUUsVUFBVU4sZ0JBQXFCLEVBQUU7TUFDakUsT0FBT3BFLFdBQVcsQ0FBQ21FLGlCQUFpQixDQUFDQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTyxzQkFBc0IsRUFBRSxVQUFVQyxPQUFzQixFQUFFQyxTQUFpQixFQUFFQyxxQkFBNkIsRUFBRWxCLGFBQXFCLEVBQUU7TUFDbEksSUFBSWdCLE9BQU8sRUFBRTtRQUNaLE9BQU9BLE9BQU87TUFDZjtNQUNBLElBQUlHLFNBQVMsR0FBR25CLGFBQWE7TUFDN0IsSUFBSWtCLHFCQUFxQixLQUFLbEIsYUFBYSxFQUFFO1FBQzVDbUIsU0FBUyxHQUFJLEdBQUVELHFCQUFzQixLQUFJbEIsYUFBYyxFQUFDO01BQ3pEO01BQ0EsT0FBT29CLFFBQVEsQ0FBQyxDQUFDSCxTQUFTLEVBQUVFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDRSxrQ0FBa0MsRUFBRSxVQUNuQ0MsZUFBNEIsRUFDNUJDLFNBQWMsRUFDZEMsYUFBcUIsRUFDckJDLFdBQW1CLEVBQ25CekIsYUFBcUIsRUFDckIwQixzQkFBOEIsRUFDOUJDLDRCQUFxQyxFQUNyQ0MscUJBQXVDLEVBQ3RDO01BQ0QsTUFBTVQsU0FBUyxHQUFHL0UsV0FBVyxDQUFDeUQsWUFBWSxDQUFDMEIsU0FBUyxFQUFFO1VBQUV4RSxPQUFPLEVBQUV1RTtRQUFnQixDQUFDLENBQUM7UUFDbEZPLGtCQUFrQixHQUFHRCxxQkFBcUIsS0FBSyxNQUFNLElBQUlBLHFCQUFxQixLQUFLLElBQUk7TUFDeEYsTUFBTXhCLE1BQU0sR0FBR2tCLGVBQWUsQ0FBQ3RFLFFBQVEsRUFBb0I7UUFDMURKLGFBQWEsR0FBRzBFLGVBQWUsQ0FBQ3BFLE9BQU8sRUFBRTtRQUN6QzRFLHFCQUFxQixHQUFHQyxZQUFZLENBQUNDLDBCQUEwQixDQUFDNUIsTUFBTSxFQUFFeEQsYUFBYSxDQUFDO1FBQ3RGcUYsbUJBQW1CLEdBQUdDLFdBQVcsQ0FBQ0MsMkJBQTJCLENBQUNMLHFCQUFxQixFQUFFMUIsTUFBTSxDQUFDO01BQzdGLElBQ0UsQ0FBQ29CLGFBQWEsS0FBSyxvQkFBb0IsSUFBSUEsYUFBYSxLQUFLLFVBQVUsS0FDdkVLLGtCQUFrQixJQUNsQkksbUJBQW1CLElBQ25CQSxtQkFBbUIsQ0FBQ0csd0JBQXdCLElBQzVDSCxtQkFBbUIsQ0FBQ0csd0JBQXdCLENBQUNqQixTQUFTLENBQUMsS0FDdERjLG1CQUFtQixDQUFDRyx3QkFBd0IsQ0FBQ2pCLFNBQVMsQ0FBQyxDQUFDdkQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUNyRnFFLG1CQUFtQixDQUFDRyx3QkFBd0IsQ0FBQ2pCLFNBQVMsQ0FBQyxDQUFDdkQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQ3ZGNEQsYUFBYSxLQUFLLGFBQWEsSUFBSSxDQUFDRyw0QkFBNkIsRUFDakU7UUFDRCxPQUFPbEUsU0FBUztNQUNqQjtNQUNBLE9BQU9yQixXQUFXLENBQUMyRSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUVVLFdBQVcsSUFBSSxzQkFBc0IsRUFBRXpCLGFBQWEsRUFBRTBCLHNCQUFzQixDQUFDO0lBQzlILENBQUM7SUFFRFcsdUJBQXVCLEVBQUUsVUFDeEI3RixlQUFvQixFQUNwQkMsMEJBQStCLEVBQy9CNkYscUJBQTBCLEVBQzFCQyxjQUFtQixFQUNsQjtNQUNELElBQUkvRixlQUFlLEVBQUU7UUFDcEI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsSUFDQ0MsMEJBQTBCLEtBQ3pCQSwwQkFBMEIsQ0FBQ0MsV0FBVyxLQUFLLHlEQUF5RCxJQUNwR0QsMEJBQTBCLENBQUNDLFdBQVcsS0FBSyw2REFBNkQsSUFDeEdELDBCQUEwQixDQUFDQyxXQUFXLEtBQUssMERBQTBELENBQUMsRUFDdEc7VUFDRCxPQUFPZSxTQUFTO1FBQ2pCLENBQUMsTUFBTTtVQUNOLE9BQU82RSxxQkFBcUIsSUFBSyxJQUFHQyxjQUFlLEdBQUU7UUFDdEQ7TUFDRDs7TUFFQTtNQUNBLE9BQU85RSxTQUFTO0lBQ2pCLENBQUM7SUFFRCtFLHNCQUFzQixFQUFFLFVBQVVDLG1CQUF3QixFQUFFO01BQzNEO01BQ0E7TUFDQSxNQUFNQyxXQUFXLEdBQUdELG1CQUFtQjtNQUN2QyxNQUFNRSxnQkFBZ0IsR0FBRyxFQUFFO01BQzNCLEtBQUssTUFBTUMsR0FBRyxJQUFJRixXQUFXLENBQUM1RCxTQUFTLEVBQUUsRUFBRTtRQUMxQztRQUNBLElBQ0M4RCxHQUFHLENBQUNoRixPQUFPLENBQUMsK0NBQStDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFDakVnRixHQUFHLENBQUNoRixPQUFPLENBQUMsc0RBQXNELENBQUMsS0FBSyxDQUFDLENBQUMsSUFDMUVnRixHQUFHLENBQUNoRixPQUFPLENBQUMsaUVBQWlFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDcEY7VUFDRCxJQUFJaUYsbUJBQW1CLEdBQUdILFdBQVcsQ0FBQzVELFNBQVMsRUFBRSxDQUFDOEQsR0FBRyxDQUFDO1VBQ3RELElBQUksT0FBT0MsbUJBQW1CLEtBQUssUUFBUSxFQUFFO1lBQzVDQSxtQkFBbUIsR0FBR3RGLGdCQUFnQixDQUFDQyxLQUFLLENBQUNxRixtQkFBbUIsRUFBRTtjQUFFOUYsT0FBTyxFQUFFMEY7WUFBb0IsQ0FBQyxDQUFDO1VBQ3BHO1VBQ0EsSUFBSUUsZ0JBQWdCLENBQUMvRSxPQUFPLENBQUNpRixtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3pERixnQkFBZ0IsQ0FBQ0csSUFBSSxDQUFDRCxtQkFBbUIsQ0FBQztVQUMzQztRQUNEO01BQ0Q7TUFDQSxNQUFNRSxxQkFBcUIsR0FBRyxJQUFJQyxTQUFTLENBQUNMLGdCQUFnQixDQUFDO01BQzVESSxxQkFBcUIsQ0FBU0UsZ0JBQWdCLEdBQUcsSUFBSTtNQUN0RCxPQUFPRixxQkFBcUIsQ0FBQzNGLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztJQUN2RCxDQUFDO0lBQ0Q4Riw0QkFBNEIsRUFBRSxVQUFVVCxtQkFBd0IsRUFBRTtNQUNqRTtNQUNBO01BQ0EsTUFBTUMsV0FBVyxHQUFHRCxtQkFBbUI7TUFDdkMsSUFBSVUscUJBQTRCLEdBQUcsRUFBRTtNQUNyQyxNQUFNQyxVQUFVLEdBQUcsVUFBVUMsU0FBYyxFQUFFO1FBQzVDLE9BQU9GLHFCQUFxQixDQUFDRyxJQUFJLENBQUMsVUFBVUMsTUFBVyxFQUFFO1VBQ3hELE9BQU9BLE1BQU0sQ0FBQ0YsU0FBUyxLQUFLQSxTQUFTO1FBQ3RDLENBQUMsQ0FBQztNQUNILENBQUM7TUFDRCxLQUFLLE1BQU1ULEdBQUcsSUFBSUYsV0FBVyxDQUFDNUQsU0FBUyxFQUFFLEVBQUU7UUFDMUM7UUFDQSxJQUNDOEQsR0FBRyxDQUFDaEYsT0FBTyxDQUFDLGdEQUFnRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQ2xFZ0YsR0FBRyxDQUFDaEYsT0FBTyxDQUFDLHVEQUF1RCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQ3pFZ0YsR0FBRyxDQUFDaEYsT0FBTyxDQUFDLGtFQUFrRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ25GO1VBQ0QsTUFBTTRGLGlCQUFpQixHQUFHZCxXQUFXLENBQUM1RCxTQUFTLEVBQUUsQ0FBQzhELEdBQUcsQ0FBQztZQUNyRGEsVUFBVSxHQUFHYixHQUFHLENBQUNjLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUJMLFNBQVMsR0FBR1QsR0FBRyxDQUFDYyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQzlCLElBQUlDLGVBQWUsR0FBR1AsVUFBVSxDQUFDQyxTQUFTLENBQUM7VUFFM0MsSUFBSSxDQUFDTSxlQUFlLEVBQUU7WUFDckJBLGVBQWUsR0FBRztjQUNqQk4sU0FBUyxFQUFFQTtZQUNaLENBQUM7WUFDRE0sZUFBZSxDQUFDRixVQUFVLENBQUMsR0FBR0QsaUJBQWlCO1lBQy9DTCxxQkFBcUIsQ0FBQ0wsSUFBSSxDQUFDYSxlQUFlLENBQUM7VUFDNUMsQ0FBQyxNQUFNO1lBQ05BLGVBQWUsQ0FBQ0YsVUFBVSxDQUFDLEdBQUdELGlCQUFpQjtVQUNoRDtRQUNEO01BQ0Q7TUFDQUwscUJBQXFCLEdBQUdBLHFCQUFxQixDQUFDUyxNQUFNLENBQUMsVUFBVUMsVUFBZSxFQUFFO1FBQy9FLE9BQU8sQ0FBQyxDQUFDQSxVQUFVLENBQUMsZ0RBQWdELENBQUM7TUFDdEUsQ0FBQyxDQUFDO01BQ0YsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSWQsU0FBUyxDQUFDRyxxQkFBcUIsQ0FBQztNQUM1RFcsZ0JBQWdCLENBQVNiLGdCQUFnQixHQUFHLElBQUk7TUFDakQsT0FBT2EsZ0JBQWdCLENBQUMxRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7SUFDbEQsQ0FBQztJQUNEMkcsMEJBQTBCLEVBQUUsVUFBVXBCLGdCQUFxQixFQUFFO01BQzVELElBQUlxQix1QkFBdUIsR0FBRyxLQUFLO01BQ25DLElBQUlyQixnQkFBZ0IsSUFBSUEsZ0JBQWdCLENBQUM1RSxNQUFNLEVBQUU7UUFDaEQsS0FBSyxJQUFJUSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdvRSxnQkFBZ0IsQ0FBQzVFLE1BQU0sRUFBRVEsQ0FBQyxFQUFFLEVBQUU7VUFDakQsSUFBSW9FLGdCQUFnQixDQUFDcEUsQ0FBQyxDQUFDLElBQUlvRSxnQkFBZ0IsQ0FBQ3BFLENBQUMsQ0FBQyxDQUFDZixLQUFLLElBQUltRixnQkFBZ0IsQ0FBQ3BFLENBQUMsQ0FBQyxDQUFDZixLQUFLLENBQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDckdvRyx1QkFBdUIsR0FBRyxJQUFJO1lBQzlCO1VBQ0Q7UUFDRDtNQUNEO01BQ0EsT0FBT0EsdUJBQXVCO0lBQy9CLENBQUM7SUFDREMsZ0NBQWdDLEVBQUUsVUFBVUMsa0JBQXVCLEVBQUU7TUFDcEUsT0FBT0Esa0JBQWtCO0lBQzFCLENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyx3QkFBd0IsRUFBRSxVQUFVQyxZQUFvQixFQUFFQyx5QkFBa0MsRUFBRTtNQUM3RixJQUFJQSx5QkFBeUIsRUFBRTtRQUM5QixPQUFPQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztVQUNyQm5HLElBQUksRUFBRWdHLFlBQVk7VUFDbEJJLE9BQU8sRUFBRTtZQUNSSCx5QkFBeUIsRUFBRUE7VUFDNUI7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBLE9BQVEsV0FBVUQsWUFBYSxJQUFHO0lBQ25DLENBQUM7SUFDREssa0JBQWtCLEVBQUUsVUFBVUMsb0JBQTJCLEVBQWtCO01BQzFFLE1BQU1DLFNBQWdCLEdBQUcsRUFBRTtNQUMzQixJQUFJRCxvQkFBb0IsRUFBRTtRQUN6QixNQUFNRSxnQkFBZ0IsR0FBR0MsR0FBRyxDQUFDQyxNQUFNLElBQUlELEdBQUcsQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTO1FBQzNELE1BQU1DLFFBQVEsR0FBR0osZ0JBQWdCLElBQUlBLGdCQUFnQixDQUFDSyxVQUFVLENBQUMsNEJBQTRCLENBQUM7UUFDOUZQLG9CQUFvQixDQUFDUSxPQUFPLENBQUMsVUFBVUMsU0FBUyxFQUFFO1VBQ2pELElBQUksT0FBT0EsU0FBUyxLQUFLLFFBQVEsRUFBRTtZQUNsQ1IsU0FBUyxDQUFDN0IsSUFBSSxDQUFDa0MsUUFBUSxDQUFDSSxnQkFBZ0IsQ0FBQ0QsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDekQ7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBLE9BQU9FLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDWCxTQUFTLENBQUMsQ0FDM0JZLElBQUksQ0FBQyxVQUFVQyx1QkFBdUIsRUFBRTtRQUN4QyxPQUFPQSx1QkFBdUI7TUFDL0IsQ0FBQyxDQUFDLENBQ0RDLEtBQUssQ0FBQyxVQUFVQyxNQUFNLEVBQUU7UUFDeEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLGdDQUFnQyxFQUFFRixNQUFNLENBQUM7UUFDbkQsT0FBTyxFQUFFO01BQ1YsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUNERyx1Q0FBdUMsRUFBRSxVQUN4Q0MsVUFBZSxFQUNmQyw4QkFBbUMsRUFDbkNDLFlBQTBCLEVBQ2hCO01BQ1YsTUFBTUMsb0NBQW9DLEdBQUcsVUFBVUMsV0FBZ0IsRUFBRUMsZUFBb0IsRUFBRUMsTUFBYyxFQUFFO1FBQzlHLEtBQUssTUFBTUMsdUJBQXVCLElBQUlILFdBQVcsQ0FBQ0ksZ0NBQWdDLENBQUNGLE1BQU0sQ0FBQyxDQUFDRyxPQUFPLEVBQUU7VUFDbkcsSUFDQ0osZUFBZSxDQUFDSyxNQUFNLENBQ3BCOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiOUYsT0FBTyxDQUFDc0ksV0FBVyxDQUFDSSxnQ0FBZ0MsQ0FBQ0YsTUFBTSxDQUFDLENBQUNHLE9BQU8sQ0FBQ0YsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFDckc7WUFDRCxPQUFPLEtBQUs7VUFDYjtRQUNEO1FBQ0EsT0FBTyxJQUFJO01BQ1osQ0FBQztNQUVEUCxVQUFVLENBQUNXLHNCQUFzQixHQUFHViw4QkFBOEI7TUFDbEUsTUFBTVcsY0FBYyxHQUNuQlosVUFBVSxDQUFDYSxlQUFlLElBQzFCYixVQUFVLENBQUNjLGtCQUFrQixJQUM3QmQsVUFBVSxDQUFDVyxzQkFBc0IsQ0FBQ1gsVUFBVSxDQUFDYSxlQUFlLENBQUMvSSxPQUFPLENBQUNrSSxVQUFVLENBQUNjLGtCQUFrQixDQUFDLENBQUM7TUFDckcsTUFBTUMsWUFBWSxHQUFHYixZQUFZLENBQUNjLGdCQUFnQixFQUFFLENBQUNDLE9BQU8sRUFBRTtNQUM5RCxJQUFJakIsVUFBVSxDQUFDYyxrQkFBa0IsSUFBSUYsY0FBYyxLQUFLLElBQUksSUFBSUEsY0FBYyxDQUFDRixNQUFNLEtBQUtLLFlBQVksRUFBRTtRQUN2RyxLQUFLLE1BQU1HLEtBQUssSUFBSWxCLFVBQVUsQ0FBQ1EsZ0NBQWdDLEVBQUU7VUFDaEUsSUFBSVIsVUFBVSxDQUFDYyxrQkFBa0IsQ0FBQ2hKLE9BQU8sQ0FBQ2tJLFVBQVUsQ0FBQ1EsZ0NBQWdDLENBQUNVLEtBQUssQ0FBQyxDQUFDQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbkgsT0FBT2hCLG9DQUFvQyxDQUFDSCxVQUFVLEVBQUVZLGNBQWMsRUFBRU0sS0FBSyxDQUFDO1VBQy9FO1FBQ0Q7UUFDQSxPQUFPLElBQUk7TUFDWixDQUFDLE1BQU07UUFDTixPQUFPLEtBQUs7TUFDYjtJQUNELENBQUM7SUFDREUsbUJBQW1CLEVBQUUsVUFBVXBCLFVBQWUsRUFBRXFCLGFBQXNCLEVBQUVuQixZQUEwQixFQUFFO01BQ25HLE9BQU8sSUFBSSxDQUFDdkIsa0JBQWtCLENBQUNxQixVQUFVLElBQUlBLFVBQVUsQ0FBQ2EsZUFBZSxDQUFDLENBQ3RFcEIsSUFBSSxDQUFFUSw4QkFBcUMsSUFBSztRQUNoRCxPQUFPb0IsYUFBYSxHQUNqQjtVQUNBQyxTQUFTLEVBQUVyQiw4QkFBOEI7VUFDekNzQixZQUFZLEVBQUUsSUFBSSxDQUFDeEIsdUNBQXVDLENBQ3pEQyxVQUFVLEVBQ1ZDLDhCQUE4QixFQUM5QkMsWUFBWTtRQUViLENBQUMsR0FDRCxJQUFJLENBQUNILHVDQUF1QyxDQUFDQyxVQUFVLEVBQUVDLDhCQUE4QixFQUFFQyxZQUFZLENBQUM7TUFDMUcsQ0FBQyxDQUFDLENBQ0RQLEtBQUssQ0FBQyxVQUFVQyxNQUFNLEVBQUU7UUFDeEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLDhCQUE4QixFQUFFRixNQUFNLENBQUM7TUFDbEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUNENEIsMkJBQTJCLEVBQUUsVUFBVUMscUJBQTBCLEVBQUVDLFdBQW1CLEVBQUU7TUFDdkYsSUFBSUQscUJBQXFCLElBQUlBLHFCQUFxQixDQUFDRSxTQUFTLEVBQUU7UUFDN0QsT0FBT0YscUJBQXFCLENBQUNFLFNBQVM7TUFDdkMsQ0FBQyxNQUFNO1FBQ04sT0FBT0QsV0FBVztNQUNuQjtJQUNELENBQUM7SUFFREUsZ0JBQWdCLEVBQUUsVUFBVTVCLFVBQWUsRUFBRTtNQUM1QyxPQUFPQSxVQUFVLENBQUNXLHNCQUFzQixDQUFDWCxVQUFVLENBQUNhLGVBQWUsQ0FBQy9JLE9BQU8sQ0FBQ2tJLFVBQVUsQ0FBQ2Msa0JBQWtCLENBQUMsQ0FBQyxDQUFDSixNQUFNLEdBQy9HcEssV0FBVyxDQUFDa0wsMkJBQTJCLENBQ3ZDeEIsVUFBVSxFQUNWQSxVQUFVLENBQUNXLHNCQUFzQixDQUFDWCxVQUFVLENBQUNhLGVBQWUsQ0FBQy9JLE9BQU8sQ0FBQ2tJLFVBQVUsQ0FBQ2Msa0JBQWtCLENBQUMsQ0FBQyxDQUFDSixNQUFNLENBQzFHLEdBQ0RWLFVBQVUsQ0FBQzZCLG1CQUFtQjtJQUNsQyxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLFVBQVVsSixRQUFxQixFQUFFNkMsU0FBYyxFQUFFSyxxQkFBOEIsRUFBRWlHLFNBQWlCLEVBQUVDLFdBQW1CLEVBQUU7TUFDbkksSUFBSSxDQUFDdkcsU0FBUyxJQUFJLENBQUN1RyxXQUFXLEVBQUU7UUFDL0IsT0FBT3JLLFNBQVM7TUFDakI7TUFDQSxJQUFJbUssU0FBbUI7TUFDdkIsTUFBTXpHLFNBQVMsR0FBRy9FLFdBQVcsQ0FBQ3lELFlBQVksQ0FBQzBCLFNBQVMsRUFBRTtRQUFFeEUsT0FBTyxFQUFFMkI7TUFBUyxDQUFDLENBQUM7TUFDNUUsTUFBTTBCLE1BQU0sR0FBRzFCLFFBQVEsQ0FBQzFCLFFBQVEsRUFBb0I7UUFDbkRKLGFBQWEsR0FBRzhCLFFBQVEsQ0FBQ3hCLE9BQU8sRUFBRTtRQUNsQzRFLHFCQUFxQixHQUFHQyxZQUFZLENBQUNDLDBCQUEwQixDQUFDNUIsTUFBTSxFQUFFeEQsYUFBYSxDQUFDO1FBQ3RGbUwsWUFBWSxHQUFHeEcsU0FBUyxDQUFDeUcsS0FBSztNQUUvQixJQUFJRCxZQUFZLEtBQUssVUFBVSxFQUFFO1FBQ2hDLE9BQU83RixXQUFXLENBQUMrRiwyQkFBMkIsRUFBRTtNQUNqRDs7TUFFQTtNQUNBSCxXQUFXLEdBQUdBLFdBQVcsQ0FBQ0ksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUN0QyxNQUFNQyx3QkFBaUMsR0FBR0wsV0FBVyxDQUFDTSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztNQUMxRSxNQUFNQyxnQkFBeUIsR0FDN0JGLHdCQUF3QixJQUFJTCxXQUFXLEtBQUtoRyxxQkFBcUIsSUFDakUsQ0FBQ3FHLHdCQUF3QixJQUFJckcscUJBQXFCLENBQUNzRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRTtNQUMxRSxNQUFNRSxjQUFzQixHQUMxQkQsZ0JBQWdCLElBQUl2RyxxQkFBcUIsQ0FBQ2hFLE1BQU0sQ0FBQ2dFLHFCQUFxQixDQUFDbEUsT0FBTyxDQUFDa0ssV0FBVyxDQUFDLEdBQUdBLFdBQVcsQ0FBQy9KLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSyxFQUFFO01BQzlILE1BQU13SyxZQUFvQixHQUFJRixnQkFBZ0IsSUFBSUMsY0FBYyxHQUFHLEdBQUcsR0FBR25ILFNBQVMsSUFBS0EsU0FBUztNQUVoRyxJQUFJLENBQUNnSCx3QkFBd0IsRUFBRTtRQUM5QixJQUFJLENBQUNFLGdCQUFnQixFQUFFO1VBQ3RCO1VBQ0FULFNBQVMsR0FBRzFGLFdBQVcsQ0FBQ3NHLHVCQUF1QixDQUM5Q3JILFNBQVMsRUFDVFcscUJBQXFCLEVBQ3JCMUIsTUFBTSxFQUNOMkgsWUFBWSxFQUNabkcscUJBQXFCLEVBQ3JCaUcsU0FBUyxDQUNUO1FBQ0YsQ0FBQyxNQUFNO1VBQ047VUFDQTtVQUNBRCxTQUFTLEdBQUcxRixXQUFXLENBQUNzRyx1QkFBdUIsQ0FDOUNELFlBQVksRUFDWlQsV0FBVyxFQUNYMUgsTUFBTSxFQUNOMkgsWUFBWSxFQUNabkcscUJBQXFCLEVBQ3JCaUcsU0FBUyxDQUNUO1VBQ0QsSUFBSUQsU0FBUyxDQUFDN0osTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQjZKLFNBQVMsR0FBRzFGLFdBQVcsQ0FBQ3NHLHVCQUF1QixDQUM5Q3JILFNBQVMsRUFDVFcscUJBQXFCLEVBQ3JCMUIsTUFBTSxFQUNOMkgsWUFBWSxFQUNabkcscUJBQXFCLEVBQ3JCaUcsU0FBUyxDQUNUO1VBQ0Y7UUFDRDtNQUNELENBQUMsTUFBTSxJQUFJLENBQUNRLGdCQUFnQixFQUFFO1FBQUE7UUFDN0I7UUFDQVQsU0FBUyxHQUFHMUYsV0FBVyxDQUFDc0csdUJBQXVCLENBQzlDRCxZQUFZLEVBQ1pULFdBQVcsRUFDWDFILE1BQU0sRUFDTjJILFlBQVksRUFDWm5HLHFCQUFxQixFQUNyQmlHLFNBQVMsQ0FDVDtRQUNELElBQUlELFNBQVMsQ0FBQzdKLE1BQU0sS0FBSyxDQUFDLEVBQUU7VUFDM0I2SixTQUFTLEdBQUcxRixXQUFXLENBQUNzRyx1QkFBdUIsQ0FDOUNySCxTQUFTLEVBQ1RzSCxXQUFXLENBQUNDLGdCQUFnQixDQUFDWixXQUFXLENBQUMsRUFDekMxSCxNQUFNLEVBQ04ySCxZQUFZLEVBQ1puRyxxQkFBcUIsRUFDckJpRyxTQUFTLENBQ1Q7UUFDRjtRQUNBLE9BQU8sZUFBQUQsU0FBUywrQ0FBVCxXQUFXN0osTUFBTSxJQUFHLENBQUMsR0FBRzZKLFNBQVMsQ0FBQ2UsUUFBUSxFQUFFLEdBQUdsTCxTQUFTO01BQ2hFLENBQUMsTUFBTTtRQUNOO1FBQ0E7UUFDQW1LLFNBQVMsR0FBRzFGLFdBQVcsQ0FBQ3NHLHVCQUF1QixDQUM5Q0QsWUFBWSxFQUNaVCxXQUFXLEVBQ1gxSCxNQUFNLEVBQ04ySCxZQUFZLEVBQ1puRyxxQkFBcUIsRUFDckJpRyxTQUFTLENBQ1Q7UUFDRCxJQUFJRCxTQUFTLENBQUM3SixNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQzNCNkosU0FBUyxHQUFHMUYsV0FBVyxDQUFDc0csdUJBQXVCLENBQzlDRCxZQUFZLEVBQ1pFLFdBQVcsQ0FBQ0MsZ0JBQWdCLENBQUNaLFdBQVcsQ0FBQyxFQUN6QzFILE1BQU0sRUFDTjJILFlBQVksRUFDWm5HLHFCQUFxQixFQUNyQmlHLFNBQVMsQ0FDVDtRQUNGO01BQ0Q7TUFFQSxJQUFJLENBQUMsQ0FBQ0QsU0FBUyxJQUFJQSxTQUFTLENBQUM3SixNQUFNLEtBQUssQ0FBQyxNQUFNZ0ssWUFBWSxLQUFLLFVBQVUsSUFBSUEsWUFBWSxLQUFLLG9CQUFvQixDQUFDLEVBQUU7UUFDckhILFNBQVMsR0FBRzFGLFdBQVcsQ0FBQzBHLDJCQUEyQixDQUFDYixZQUFZLENBQUM7TUFDbEU7TUFFQSxPQUFPSCxTQUFTLENBQUM3SixNQUFNLEdBQUcsQ0FBQyxHQUFHNkosU0FBUyxDQUFDZSxRQUFRLEVBQUUsR0FBR2xMLFNBQVM7SUFDL0QsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDb0wsOEJBQThCLEVBQUUsVUFBVUMsaUJBQXNCLEVBQUU7TUFDakUsSUFBSUEsaUJBQWlCLENBQUNoSyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUtyQixTQUFTLEVBQUU7UUFDdkQ7UUFDQSxNQUFNc0MsVUFBVSxHQUFHK0ksaUJBQWlCLENBQUNDLFlBQVksRUFBRTtVQUNsRDNJLE1BQU0sR0FBR0wsVUFBVSxDQUFDL0MsUUFBUSxFQUFFO1FBQy9CLElBQUlDLEtBQUssR0FBRzhDLFVBQVUsQ0FBQzdDLE9BQU8sRUFBRTtRQUNoQ0QsS0FBSyxHQUFHQSxLQUFLLElBQUlBLEtBQUssQ0FBQytMLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQzFELE9BQU81SSxNQUFNLENBQUNoRCxvQkFBb0IsQ0FBQ0gsS0FBSyxDQUFDO01BQzFDLENBQUMsTUFBTTtRQUNOO1FBQ0EsT0FBTzZMLGlCQUFpQjtNQUN6QjtJQUNELENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0csMkJBQTJCLEVBQUUsVUFBVXpJLGdCQUFxQixFQUFFO01BQzdELElBQUlBLGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQzFCLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM1RCxNQUFNaUIsVUFBVSxHQUFHUyxnQkFBZ0IsQ0FBQ3VJLFlBQVksRUFBRTtVQUNqRDNJLE1BQU0sR0FBR0wsVUFBVSxDQUFDL0MsUUFBUSxFQUFFO1FBQy9CLElBQUlDLEtBQUssR0FBRzhDLFVBQVUsQ0FBQzdDLE9BQU8sRUFBRTtRQUNoQ0QsS0FBSyxHQUFHQSxLQUFLLElBQUlBLEtBQUssQ0FBQytMLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQzFELE9BQU81SSxNQUFNLENBQUNoRCxvQkFBb0IsQ0FBQ0gsS0FBSyxDQUFDO01BQzFDO01BRUEsT0FBT3VELGdCQUFnQjtJQUN4QixDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0MwSSxtQkFBbUIsRUFBRSxVQUFVSixpQkFBc0IsRUFBRTtNQUN0RCxNQUFNSyxpQkFBaUIsR0FBR0wsaUJBQWlCLENBQ3pDOUwsUUFBUSxFQUFFLENBQ1Y4QixTQUFTLENBQUUsR0FBRWdLLGlCQUFpQixDQUFDNUwsT0FBTyxFQUFHLDhDQUE2QyxDQUFDO01BQ3pGLE9BQU9pTSxpQkFBaUIsR0FDcEIsR0FBRUwsaUJBQWlCLENBQUM1TCxPQUFPLEVBQUcsOENBQTZDLEdBQzVFNEwsaUJBQWlCLENBQUM1TCxPQUFPLEVBQUU7SUFDL0IsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NrTSw4QkFBOEIsRUFBRSxVQUFVQyxLQUFVLEVBQUV4TSxVQUFlLEVBQUV5TSxRQUFhLEVBQUVDLGNBQW1CLEVBQUU7TUFDMUcsT0FBTzFNLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxLQUFLLElBQUksS0FBS3lNLFFBQVEsS0FBSyxJQUFJLElBQUlDLGNBQWMsS0FBSyxLQUFLLENBQUM7SUFDcEgsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxxQ0FBcUMsRUFBRSxVQUFVSCxLQUFVLEVBQUV4TSxVQUFlLEVBQUU7TUFBQTtNQUM3RSxJQUFJNE0sbUJBQW1CLEdBQUcsVUFBVTtNQUNwQyxJQUNDNU0sVUFBVSxDQUFDNk0sa0JBQWtCLElBQzdCN00sVUFBVSxDQUFDNk0sa0JBQWtCLENBQUNoTixXQUFXLEtBQUssNERBQTRELEVBQ3pHO1FBQ0QrTSxtQkFBbUIsR0FBRyxXQUFXO01BQ2xDO01BQ0EsSUFBSUUsWUFBWSxHQUFHTixLQUFLLENBQUNPLG1CQUFtQjtNQUM1Q0QsWUFBWSxHQUFHQSxZQUFZLEtBQUssT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJO01BRXRELE1BQU1FLFFBQXVCLEdBQUdSLEtBQUssYUFBTEEsS0FBSywyQ0FBTEEsS0FBSyxDQUFFUyxTQUFTLHFEQUFoQixpQkFBa0I1TSxPQUFPLEVBQUUsQ0FBQ3dHLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDdEUsTUFBTXFHLGFBQXFCLEdBQUdGLFFBQVEsQ0FBQ0EsUUFBUSxDQUFDOUwsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUUzRCxNQUFNaU0sT0FBTyxHQUFHO1FBQ2ZDLFFBQVEsRUFBRSxrQ0FBa0M7UUFDNUNDLGtCQUFrQixFQUFFbkksWUFBWSxDQUFDb0ksZUFBZSxDQUFDVixtQkFBbUIsQ0FBQztRQUNyRVcsS0FBSyxFQUFFLHlCQUF5QjtRQUNoQ0MsS0FBSyxFQUFFdEksWUFBWSxDQUFDb0ksZUFBZSxDQUFDdE4sVUFBVSxDQUFDeU4sS0FBSyxFQUFFLElBQUksQ0FBQztRQUMzREMsV0FBVyxFQUFFWixZQUFZO1FBQ3pCSSxhQUFhLEVBQUVoSSxZQUFZLENBQUNvSSxlQUFlLENBQUNKLGFBQWE7TUFDMUQsQ0FBQztNQUVELE9BQU9oSSxZQUFZLENBQUN5SSxnQkFBZ0IsQ0FDbkMsd0JBQXdCLEVBQ3hCekksWUFBWSxDQUFDb0ksZUFBZSxDQUFDdE4sVUFBVSxDQUFDNE4sTUFBTSxDQUFDLEVBQy9DMUksWUFBWSxDQUFDMkksY0FBYyxDQUFDVixPQUFPLENBQUMsQ0FDcEM7SUFDRixDQUFDO0lBRURXLGlCQUFpQixFQUFFLFVBQVVDLGNBQW1CLEVBQUU7TUFDakQsTUFBTUMsZUFBZSxHQUFHRCxjQUFjO01BQ3RDLElBQUlDLGVBQWUsS0FBS3BOLFNBQVMsRUFBRTtRQUNsQyxNQUFNcU4saUJBQWlCLEdBQUcsQ0FDekIsV0FBVyxFQUNYLFdBQVcsRUFDWCxXQUFXLEVBQ1gsVUFBVSxFQUNWLFdBQVcsRUFDWCxZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksQ0FDWjtRQUNELE9BQU9BLGlCQUFpQixDQUFDbE4sT0FBTyxDQUFDaU4sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUk7TUFDeEUsQ0FBQyxNQUFNO1FBQ04sT0FBTyxLQUFLO01BQ2I7SUFDRCxDQUFDO0lBRURFLG9CQUFvQixFQUFFLFVBQVV2SixhQUFrQixFQUFFO01BQ25ELElBQUlBLGFBQWEsS0FBSy9ELFNBQVMsRUFBRTtRQUNoQyxNQUFNdU4sa0JBQWtCLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxVQUFVLENBQUM7UUFDMUcsT0FBT0Esa0JBQWtCLENBQUNwTixPQUFPLENBQUM0RCxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDdEQsQ0FBQyxNQUFNO1FBQ04sT0FBTyxLQUFLO01BQ2I7SUFDRCxDQUFDO0lBQ0R5SixrQkFBa0IsRUFBRSxVQUFVekosYUFBa0IsRUFBRTtNQUNqRCxJQUFJQSxhQUFhLEtBQUsvRCxTQUFTLEVBQUU7UUFDaEMsTUFBTXlOLGNBQWMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLGNBQWMsQ0FBQztRQUM3RCxPQUFPQSxjQUFjLENBQUN0TixPQUFPLENBQUM0RCxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDbEQsQ0FBQyxNQUFNO1FBQ04sT0FBTyxLQUFLO01BQ2I7SUFDRCxDQUFDO0lBQ0QySixjQUFjLEVBQUUsVUFBVTNKLGFBQWtCLEVBQUU7TUFDN0MsT0FBT0EsYUFBYSxLQUFLLFVBQVU7SUFDcEMsQ0FBQztJQUNENEosY0FBYyxFQUFFLFVBQVU1SixhQUFrQixFQUFFO01BQzdDLElBQUlBLGFBQWEsS0FBSy9ELFNBQVMsRUFBRTtRQUNoQyxNQUFNeU4sY0FBYyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQztRQUNwRCxPQUFPQSxjQUFjLENBQUN0TixPQUFPLENBQUM0RCxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDbEQsQ0FBQyxNQUFNO1FBQ04sT0FBTyxLQUFLO01BQ2I7SUFDRCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDNkosMkJBQTJCLEVBQUUsVUFBVUMsWUFBaUIsRUFBRUMsS0FBYSxFQUFFO01BQUE7TUFDeEUsTUFBTUMsZUFBZSxHQUFHLHNDQUFzQztRQUM3REMsMEJBQTBCLEdBQUcsaUZBQWlGOztNQUUvRztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE9BQU8sQ0FBQUgsWUFBWSxhQUFaQSxZQUFZLGdEQUFaQSxZQUFZLENBQUdHLDBCQUEwQixDQUFDLDBEQUExQyxzQkFBNEMvTyxXQUFXLE1BQUssNkRBQTZELElBQy9INE8sWUFBWSxhQUFaQSxZQUFZLHdDQUFaQSxZQUFZLENBQUdFLGVBQWUsQ0FBQyxrREFBL0Isc0JBQWlDM00sS0FBSyxHQUNwQyxZQUFZLEdBQ1owTSxLQUFLO0lBQ1QsQ0FBQztJQUVERyxrQkFBa0IsRUFBRSxVQUFVN08sVUFBZSxFQUFFOE8sTUFBVyxFQUFFO01BQzNELE1BQU1DLFdBQVcsR0FBR0QsTUFBTSxDQUFDRSxVQUFVLENBQUM1TyxLQUFLO1FBQzFDbUQsTUFBTSxHQUFHdUwsTUFBTSxDQUFDRSxVQUFVLENBQUN6TCxNQUFNO01BQ2xDLElBQ0MsQ0FBQ3ZELFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSywrQ0FBK0MsSUFDdkVBLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyw4REFBOEQsS0FDdkZBLFVBQVUsQ0FBQ2lQLE1BQU0sSUFDakJqUCxVQUFVLENBQUNrUCxPQUFPLEVBQ2pCO1FBQ0QsT0FBTyxRQUFRO01BQ2hCO01BQ0E7TUFDQSxNQUFNQyxhQUFhLEdBQUc1TCxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRThNLFdBQVksOENBQTZDLENBQUM7TUFDcEcsSUFBSS9PLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxzQ0FBc0MsRUFBRTtRQUNuRSxNQUFNRCxhQUFhLEdBQUdDLFVBQVUsQ0FBQytCLEtBQUssQ0FBQ0MsS0FBSztRQUM1QyxNQUFNb04sY0FBYyxHQUNuQkQsYUFBYSxJQUNiLENBQUNBLGFBQWEsQ0FBQ0UsS0FBSyxDQUFDLFVBQVVDLElBQVMsRUFBRTtVQUN6QyxPQUFPQSxJQUFJLENBQUNsTSxhQUFhLEtBQUtyRCxhQUFhO1FBQzVDLENBQUMsQ0FBQztRQUNILElBQUlxUCxjQUFjLEVBQUU7VUFDbkIsT0FBTyxPQUFPO1FBQ2Y7TUFDRDtNQUNBLE9BQU83UCxXQUFXLENBQUNnUSxxQkFBcUIsQ0FBQ3ZQLFVBQVUsRUFBRXVELE1BQU0sRUFBRXdMLFdBQVcsQ0FBQztJQUMxRSxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUyxvQkFBb0IsRUFBRSxVQUFVZCxLQUFhLEVBQUVlLGNBQW1CLEVBQUVDLGlCQUFvRCxFQUFFO01BQ3pILElBQUlDLGlCQUFpQixHQUFHLE9BQWM7TUFDdEMsTUFBTUMsY0FBYyxHQUFHSCxjQUFjLEdBQUdBLGNBQWMsQ0FBQ0ksYUFBYSxHQUFHLEVBQUU7TUFDekUsUUFBUUQsY0FBYztRQUNyQixLQUFLLE1BQU07VUFDVixJQUFJLElBQUksQ0FBQzlCLGlCQUFpQixDQUFDWSxLQUFLLENBQUMsRUFBRTtZQUNsQ2lCLGlCQUFpQixHQUFHLE9BQU87WUFDM0IsSUFBSUQsaUJBQWlCLEVBQUU7Y0FDdEJDLGlCQUFpQixHQUFHRyxzQkFBc0IsQ0FBQ0osaUJBQWlCLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQztZQUM5RTtVQUNEO1VBQ0E7UUFDRDtVQUNDLElBQUksSUFBSSxDQUFDNUIsaUJBQWlCLENBQUNZLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQ1Isb0JBQW9CLENBQUNRLEtBQUssQ0FBQyxFQUFFO1lBQ3RFaUIsaUJBQWlCLEdBQUcsT0FBTztVQUM1QjtVQUNBO01BQU07TUFFUixPQUFPQSxpQkFBaUI7SUFDekIsQ0FBQztJQUVESixxQkFBcUIsRUFBRSxVQUFVdlAsVUFBZSxFQUFFdUQsTUFBVyxFQUFFd0wsV0FBZ0IsRUFBRVUsY0FBb0IsRUFBRUMsaUJBQXVCLEVBQUU7TUFDL0gsSUFBSUssY0FBYztRQUNqQkosaUJBQWlCLEdBQUcsT0FBTztRQUMzQmpCLEtBQUs7UUFDTEQsWUFBWTtNQUViLElBQUl6TyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssbURBQW1ELEVBQUU7UUFDaEYrUCxjQUFjLEdBQUcvUCxVQUFVLENBQUNnUSxNQUFNLENBQUNDLGVBQWU7UUFDbEQsSUFDQ2pRLFVBQVUsQ0FBQ2dRLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUNwQ2hRLFVBQVUsQ0FBQ2dRLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDalAsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxFQUN6RjtVQUNELE1BQU1tUCxXQUFXLEdBQUczTSxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRThNLFdBQVksSUFBR2dCLGNBQWUsRUFBQyxDQUFDO1VBRXhFLEtBQUssSUFBSXJPLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3dPLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDalAsTUFBTSxFQUFFUSxDQUFDLEVBQUUsRUFBRTtZQUNqRGdOLEtBQUssR0FBR25MLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FBRSxHQUFFOE0sV0FBWSxJQUFHZ0IsY0FBZSxTQUFRck8sQ0FBQyxDQUFDb0ssUUFBUSxFQUFHLG9CQUFtQixDQUFDO1lBQ25HMkMsWUFBWSxHQUFHbEwsTUFBTSxDQUFDdEIsU0FBUyxDQUFFLEdBQUU4TSxXQUFZLElBQUdnQixjQUFlLFNBQVFyTyxDQUFDLENBQUNvSyxRQUFRLEVBQUcsZUFBYyxDQUFDO1lBQ3JHNEMsS0FBSyxHQUFHLElBQUksQ0FBQ0YsMkJBQTJCLENBQUNDLFlBQVksRUFBRUMsS0FBSyxDQUFDO1lBQzdEaUIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDSCxvQkFBb0IsQ0FBQ2QsS0FBSyxFQUFFZSxjQUFjLEVBQUVDLGlCQUFpQixDQUFDO1lBRXZGLElBQUlDLGlCQUFpQixLQUFLLE9BQU8sRUFBRTtjQUNsQztZQUNEO1VBQ0Q7VUFDQSxPQUFPQSxpQkFBaUI7UUFDekIsQ0FBQyxNQUFNLElBQ04zUCxVQUFVLENBQUNnUSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFDcENoUSxVQUFVLENBQUNnUSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQ2pQLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxJQUFJLENBQUMsSUFDekZ3QyxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRThNLFdBQVksSUFBR2dCLGNBQWUsNEJBQTJCLENBQUMsS0FDN0UscURBQXFELEVBQ3JEO1VBQ0QsT0FBT0osaUJBQWlCO1FBQ3pCLENBQUMsTUFBTTtVQUNOakIsS0FBSyxHQUFHbkwsTUFBTSxDQUFDdEIsU0FBUyxDQUFFLEdBQUU4TSxXQUFZLElBQUdnQixjQUFlLFFBQU8sQ0FBQztVQUNsRSxJQUFJckIsS0FBSyxLQUFLLDBDQUEwQyxFQUFFO1lBQ3pEQSxLQUFLLEdBQUduTCxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRThNLFdBQVksSUFBR2dCLGNBQWUsb0JBQW1CLENBQUM7WUFDOUV0QixZQUFZLEdBQUdsTCxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRThNLFdBQVksSUFBR2dCLGNBQWUsZUFBYyxDQUFDO1lBQ2hGckIsS0FBSyxHQUFHLElBQUksQ0FBQ0YsMkJBQTJCLENBQUNDLFlBQVksRUFBRUMsS0FBSyxDQUFDO1VBQzlEO1VBQ0FpQixpQkFBaUIsR0FBRyxJQUFJLENBQUNILG9CQUFvQixDQUFDZCxLQUFLLEVBQUVlLGNBQWMsRUFBRUMsaUJBQWlCLENBQUM7UUFDeEY7TUFDRCxDQUFDLE1BQU07UUFDTkssY0FBYyxHQUFHL1AsVUFBVSxDQUFDK0IsS0FBSyxDQUFDQyxLQUFLO1FBQ3ZDME0sS0FBSyxHQUFHbkwsTUFBTSxDQUFDdEIsU0FBUyxDQUFFLEdBQUU4TSxXQUFZLElBQUdnQixjQUFlLFFBQU8sQ0FBQztRQUNsRXRCLFlBQVksR0FBR2xMLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FBRSxHQUFFOE0sV0FBWSxJQUFHZ0IsY0FBZSxHQUFFLENBQUM7UUFDcEVyQixLQUFLLEdBQUcsSUFBSSxDQUFDRiwyQkFBMkIsQ0FBQ0MsWUFBWSxFQUFFQyxLQUFLLENBQUM7UUFDN0QsSUFBSSxFQUFFbkwsTUFBTSxDQUFDdEIsU0FBUyxDQUFFLEdBQUU4TSxXQUFZLEdBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDaE8sT0FBTyxDQUFDZ1AsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDakZKLGlCQUFpQixHQUFHLElBQUksQ0FBQ0gsb0JBQW9CLENBQUNkLEtBQUssRUFBRWUsY0FBYyxFQUFFQyxpQkFBaUIsQ0FBQztRQUN4RjtNQUNEO01BQ0EsT0FBT0MsaUJBQWlCO0lBQ3pCLENBQUM7SUFDRFMsZ0JBQWdCLEVBQUUsVUFDakJ2TyxRQUFhLEVBQ2I3QixVQUFlLEVBQ2Z5UCxjQUFtQixFQUNuQlYsV0FBbUIsRUFDbkJXLGlCQUFzQixFQUN0QmhMLFNBQWMsRUFDYjtNQUNELE1BQU14QixVQUFVLEdBQUdyQixRQUFRLENBQUNxSyxZQUFZLENBQUMsQ0FBQyxDQUFDO01BQzNDLE1BQU0zSSxNQUFNLEdBQUdMLFVBQVUsQ0FBQy9DLFFBQVEsRUFBRTtNQUVwQyxJQUFJNE8sV0FBVyxLQUFLLFlBQVksSUFBSXJLLFNBQVMsSUFBSUEsU0FBUyxDQUFDMkwsT0FBTyxFQUFFO1FBQ25FdEIsV0FBVyxHQUFJLElBQUdySyxTQUFTLENBQUMyTCxPQUFPLENBQUNDLGtCQUFrQixDQUFDekosS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBRSxFQUFDO01BQ3ZFO01BQ0EsT0FBT3RILFdBQVcsQ0FBQ2dRLHFCQUFxQixDQUFDdlAsVUFBVSxFQUFFdUQsTUFBTSxFQUFFd0wsV0FBVyxFQUFFVSxjQUFjLEVBQUVDLGlCQUFpQixDQUFDO0lBQzdHLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NhLDhCQUE4QixFQUFFLFVBQVV2USxVQUFlLEVBQUV5TSxRQUFpQixFQUFFQyxjQUFtQixFQUFFOEQsb0JBQTRCLEVBQUU7TUFDaEksSUFBSS9ELFFBQVEsS0FBSyxJQUFJLEVBQUU7UUFDdEIsT0FBTyxNQUFNO01BQ2Q7TUFDQSxPQUFPLENBQUNDLGNBQWMsS0FBSyxJQUFJLEdBQUcsU0FBUyxHQUFHMU0sVUFBVSxDQUFDNE4sTUFBTSxHQUFHLG9CQUFvQixHQUFHbEIsY0FBYyxJQUNwRzhELG9CQUFvQixHQUNwQixNQUFNO0lBQ1YsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVDQyxnQkFBZ0IsRUFBRSxVQUFVelEsVUFBZSxFQUFFa0QsVUFBZSxFQUFFO01BQzdELE1BQU1LLE1BQU0sR0FBR0wsVUFBVSxDQUFDaEQsT0FBTyxDQUFDQyxRQUFRLEVBQUU7TUFDNUMsSUFBSWtELFlBQVksR0FBR0gsVUFBVSxDQUFDaEQsT0FBTyxDQUFDRyxPQUFPLEVBQUU7TUFDL0MsSUFBSWdELFlBQVksQ0FBQzhJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMvQjlJLFlBQVksR0FBR0EsWUFBWSxDQUFDZ0ksS0FBSyxDQUFDLENBQUMsRUFBRWhJLFlBQVksQ0FBQ2tJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNwRTtNQUNBLE1BQU1tRixlQUFlLEdBQUduTixNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRW9CLFlBQWEsUUFBTyxDQUFDO01BQ2pFO01BQ0EsSUFDQ3JELFVBQVUsQ0FBQ21MLEtBQUssS0FBSywrQ0FBK0MsSUFDcEVuTCxVQUFVLENBQUNtTCxLQUFLLEtBQUssOERBQThELEVBQ2xGO1FBQ0QsT0FBT3ZLLFNBQVM7TUFDakI7TUFDQSxJQUFJOFAsZUFBZSxFQUFFO1FBQ3BCLE9BQU9BLGVBQWU7TUFDdkIsQ0FBQyxNQUFNLElBQUlBLGVBQWUsS0FBSyxFQUFFLEVBQUU7UUFDbEMsT0FBTyxFQUFFO01BQ1Y7TUFDQSxJQUFJQyxxQkFBcUI7TUFDekIsSUFBSTNRLFVBQVUsQ0FBQ21MLEtBQUssS0FBSyxtREFBbUQsRUFBRTtRQUM3RSxJQUNDbkwsVUFBVSxDQUFDZ1EsTUFBTSxDQUFDQyxlQUFlLENBQUNsUCxPQUFPLENBQUMsdUNBQXVDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFDdkZmLFVBQVUsQ0FBQ2dRLE1BQU0sQ0FBQ0MsZUFBZSxDQUFDbFAsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ2xGO1VBQ0Q0UCxxQkFBcUIsR0FBR3BOLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FBRSxHQUFFb0IsWUFBYSxnQ0FBK0IsQ0FBQztRQUMxRjtRQUNBLElBQUlyRCxVQUFVLENBQUNnUSxNQUFNLENBQUNDLGVBQWUsQ0FBQ2xQLE9BQU8sQ0FBQyxnREFBZ0QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1VBQ3JHNFAscUJBQXFCLEdBQUdwTixNQUFNLENBQUN0QixTQUFTLENBQ3RDLEdBQUVvQixZQUFhLHdFQUF1RSxDQUN2RjtRQUNGO01BQ0Q7TUFDQSxJQUFJc04scUJBQXFCLEVBQUU7UUFDMUIsT0FBT0EscUJBQXFCO01BQzdCO01BQ0EsSUFBSUMscUJBQXFCO01BQ3pCLElBQUk1USxVQUFVLENBQUNtTCxLQUFLLEtBQUssbURBQW1ELEVBQUU7UUFDN0V5RixxQkFBcUIsR0FBR3JOLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FBRSxHQUFFb0IsWUFBYSxnQ0FBK0IsQ0FBQztNQUMxRjtNQUNBLElBQUl1TixxQkFBcUIsRUFBRTtRQUMxQixPQUFPQSxxQkFBcUI7TUFDN0I7TUFFQSxNQUFNQyxvQkFBb0IsR0FBR3ROLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FBRSxHQUFFb0IsWUFBYSxtREFBa0QsQ0FBQztNQUNqSCxJQUFJd04sb0JBQW9CLEVBQUU7UUFDekIsT0FBT0Esb0JBQW9CO01BQzVCO01BRUEsSUFBSUMsMEJBQTBCO01BQzlCLElBQUk5USxVQUFVLENBQUNtTCxLQUFLLEtBQUssbURBQW1ELEVBQUU7UUFDN0UyRiwwQkFBMEIsR0FBR3ZOLE1BQU0sQ0FBQ3RCLFNBQVMsQ0FDM0MsR0FBRW9CLFlBQWEsMEVBQXlFLENBQ3pGO01BQ0Y7TUFDQSxJQUFJeU4sMEJBQTBCLEVBQUU7UUFDL0IsT0FBT0EsMEJBQTBCO01BQ2xDO01BQ0EsT0FBTyxFQUFFO0lBQ1YsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsNEJBQTRCLEVBQUUsVUFBVUMsY0FBc0IsRUFBRTtNQUMvRCxNQUFNQyxtQ0FBbUMsR0FBR0MsUUFBUSxDQUFDRixjQUFjLENBQUM7TUFDcEUsTUFBTUcsc0NBQXNDLEdBQUdELFFBQVEsQ0FBQyx1REFBdUQsQ0FBQztNQUNoSCxNQUFNRSxvQ0FBb0MsR0FBR0YsUUFBUSxDQUFDLHFEQUFxRCxDQUFDO01BQzVHLE9BQU9HLGlCQUFpQixDQUN2QkMsTUFBTSxDQUNMQyxFQUFFLENBQ0RDLEtBQUssQ0FBQ1AsbUNBQW1DLEVBQUVFLHNDQUFzQyxDQUFDLEVBQ2xGSyxLQUFLLENBQUNQLG1DQUFtQyxFQUFFRyxvQ0FBb0MsQ0FBQyxDQUNoRixFQUNERixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQ2xCSSxNQUFNLENBQUNHLEVBQUUsQ0FBQ0MsVUFBVSxFQUFFUixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUVBLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUM5RCxDQUNEO0lBQ0YsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1Msc0JBQXNCLEVBQUUsVUFBVWxTLG9CQUF5QixFQUFFO01BQzVELElBQUlBLG9CQUFvQixFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxFQUNQQSxvQkFBb0IsQ0FBQyxxREFBcUQsQ0FBQyxJQUMzRUEsb0JBQW9CLENBQUMsa0RBQWtELENBQUMsSUFDeEVBLG9CQUFvQixDQUFDLDJDQUEyQyxDQUFDLENBQ2pFO01BQ0Y7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NtUyx3QkFBd0IsRUFBRSxVQUFVbE4sU0FBYyxFQUFFeEIsVUFBZSxFQUFFO01BQ3BFLElBQUkyTyxXQUFXO01BQ2YsTUFBTXRPLE1BQU0sR0FBR0wsVUFBVSxDQUFDaEQsT0FBTyxDQUFDQyxRQUFRLEVBQUU7TUFDNUMsTUFBTWtELFlBQVksR0FBR0gsVUFBVSxDQUFDaEQsT0FBTyxDQUFDRyxPQUFPLEVBQUU7TUFDakQsTUFBTThDLGFBQWEsR0FBR3VCLFNBQVMsQ0FBQ29OLEtBQUssSUFBSTVPLFVBQVUsQ0FBQ2hELE9BQU8sQ0FBQ00sV0FBVyxDQUFFLEdBQUU2QyxZQUFhLGFBQVksQ0FBQztNQUNyRyxNQUFNME8sMkJBQTJCLEdBQUd4TyxNQUFNLENBQUN0QixTQUFTLENBQUUsR0FBRW9CLFlBQWEsR0FBRSxDQUFDO01BQ3hFLE1BQU0yTyxvQkFBb0IsR0FDekJELDJCQUEyQixDQUFDLDJDQUEyQyxDQUFDLElBQ3hFQSwyQkFBMkIsQ0FBQyxrREFBa0QsQ0FBQyxJQUMvRUEsMkJBQTJCLENBQUMscURBQXFELENBQUM7TUFDbkYsTUFBTUUsd0JBQXdCLEdBQUcsVUFBVUMsVUFBZSxFQUFFO1FBQzNELE1BQU1DLG1CQUFtQixHQUFHRCxVQUFVLENBQUNFLFVBQVUsQ0FBQzNMLElBQUksQ0FBQyxVQUFVNEwsVUFBZSxFQUFFO1VBQ2pGLE9BQU9BLFVBQVUsQ0FBQ0MsaUJBQWlCLElBQUlELFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNsUCxhQUFhLEtBQUtELGFBQWE7UUFDcEcsQ0FBQyxDQUFDO1FBQ0YsT0FBT2dQLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQ0ksaUJBQWlCO01BQ3BFLENBQUM7TUFDRCxJQUFJQyxzQkFBc0I7TUFDMUIsSUFDQ1QsMkJBQTJCLENBQUMsaURBQWlELENBQUMsSUFDOUVBLDJCQUEyQixDQUFDLGlGQUFpRixDQUFDLEVBQzdHO1FBQ0QsT0FBTzFNLFdBQVcsQ0FBQ29OLGtCQUFrQixDQUFDViwyQkFBMkIsRUFBRW5SLFNBQVMsQ0FBQztNQUM5RSxDQUFDLE1BQU0sSUFBSW9SLG9CQUFvQixFQUFFO1FBQ2hDLElBQUlBLG9CQUFvQixDQUFDVSxjQUFjLEVBQUU7VUFDeEM7VUFDQUYsc0JBQXNCLEdBQUdQLHdCQUF3QixDQUFDRCxvQkFBb0IsQ0FBQztVQUN2RSxJQUFJLENBQUNRLHNCQUFzQixFQUFFO1lBQzVCLE9BQU8sT0FBTztVQUNmO1VBQ0E7VUFDQVgsV0FBVyxHQUFHdE8sTUFBTSxDQUFDdEIsU0FBUyxDQUFFLElBQUcrUCxvQkFBb0IsQ0FBQ1UsY0FBZSxJQUFHRixzQkFBdUIsR0FBRSxDQUFDO1VBQ3BHLE9BQU9YLFdBQVcsSUFBSUEsV0FBVyxDQUFDLHNDQUFzQyxDQUFDLEdBQ3RFeE0sV0FBVyxDQUFDb04sa0JBQWtCLENBQUNaLFdBQVcsRUFBRWpSLFNBQVMsQ0FBQyxHQUN0RCxPQUFPO1FBQ1gsQ0FBQyxNQUFNO1VBQ04sT0FBTzJDLE1BQU0sQ0FBQ29QLG9CQUFvQixDQUFDdFAsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDcUYsSUFBSSxDQUFDLFVBQVVrSyxjQUFtQixFQUFFO1lBQzFGO1lBQ0FKLHNCQUFzQixHQUFHUCx3QkFBd0IsQ0FBQ1csY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQ0osc0JBQXNCLEVBQUU7Y0FDNUIsT0FBTyxPQUFPO1lBQ2Y7WUFDQTtZQUNBWCxXQUFXLEdBQUdlLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQ0MsTUFBTSxDQUNyQ0MsWUFBWSxFQUFFLENBQ2Q3USxTQUFTLENBQUUsSUFBRzJRLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFHSixzQkFBdUIsR0FBRSxDQUFDO1lBQ2xGLE9BQU9YLFdBQVcsSUFBSUEsV0FBVyxDQUFDLHNDQUFzQyxDQUFDLEdBQ3RFeE0sV0FBVyxDQUFDb04sa0JBQWtCLENBQUNaLFdBQVcsRUFBRWpSLFNBQVMsQ0FBQyxHQUN0RCxPQUFPO1VBQ1gsQ0FBQyxDQUFDO1FBQ0g7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPLE9BQU87TUFDZjtJQUNELENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDbVMsaUNBQWlDLEVBQUUsVUFBVUMsZ0JBQXdCLEVBQUVDLFVBQWtCLEVBQUVDLFVBQWtCLEVBQUU7TUFDOUcsT0FBTyxJQUFJLENBQUN2QixzQkFBc0IsQ0FBQ3FCLGdCQUFnQixDQUFDLEdBQUd6TyxRQUFRLENBQUMsQ0FBQzBPLFVBQVUsRUFBRUMsVUFBVSxDQUFDLENBQUMsR0FBR3RTLFNBQVM7SUFDdEcsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3VTLG9CQUFvQixFQUFFLFVBQVVDLE9BQWdCLEVBQUVDLGNBQXNCLEVBQUVDLFNBQWlCLEVBQUVDLFNBQWlCLEVBQUU7TUFDL0csTUFBTUMscUJBQWtFLEdBQUc7UUFDMUVqUyxJQUFJLEVBQUUyRCxZQUFZLENBQUNvSSxlQUFlLENBQUMsMkNBQTJDLENBQUM7UUFDL0UzRixPQUFPLEVBQUU7VUFDUitELFlBQVksRUFBRXhHLFlBQVksQ0FBQ29JLGVBQWUsQ0FDekNtRyxlQUFlLENBQUNDLGVBQWUsQ0FBQztZQUMvQkMsYUFBYSxFQUFFLENBQUNQLE9BQU87WUFDdkJRLGNBQWMsRUFBRVAsY0FBYztZQUM5QnpGLE1BQU0sRUFBRTBGLFNBQVM7WUFDakJPLFFBQVEsRUFBRU47VUFDWCxDQUFDLENBQUMsQ0FDRjtVQUNETyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1VBQ2RDLGtCQUFrQixFQUFFN08sWUFBWSxDQUFDb0ksZUFBZSxDQUFDLEVBQUUsQ0FBQztVQUNwRDBHLHVCQUF1QixFQUFFO1FBQzFCO01BQ0QsQ0FBQztNQUNELE9BQU85TyxZQUFZLENBQUMySSxjQUFjLENBQUMyRixxQkFBcUIsQ0FBQztJQUMxRCxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUyxpREFBaUQsRUFBRSxVQUFVdkksWUFBb0IsRUFBRTtNQUNsRixNQUFNOEgscUJBQWtFLEdBQUc7UUFDMUVqUyxJQUFJLEVBQUUyRCxZQUFZLENBQUNvSSxlQUFlLENBQUMsMkNBQTJDLENBQUM7UUFDL0UzRixPQUFPLEVBQUU7VUFDUitELFlBQVksRUFBRXhHLFlBQVksQ0FBQ29JLGVBQWUsQ0FBQzVCLFlBQVksQ0FBQztVQUN4RG9JLFVBQVUsRUFBRSxDQUFDLENBQUM7VUFDZEMsa0JBQWtCLEVBQUU3TyxZQUFZLENBQUNvSSxlQUFlLENBQUMsRUFBRTtRQUNwRDtNQUNELENBQUM7TUFDRCxPQUFPcEksWUFBWSxDQUFDMkksY0FBYyxDQUFDMkYscUJBQXFCLENBQUM7SUFDMUQsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDVSwyQkFBMkIsRUFBRSxVQUFVclMsUUFBaUIsRUFBRXpCLEtBQWEsRUFBRStULGFBQXFCLEVBQUVDLE1BQVcsRUFBRUMsS0FBVSxFQUFFO01BQ3hILElBQUlDLFNBQVMsR0FBR2xVLEtBQUssQ0FBQ3lHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQ0UsTUFBTSxDQUFDd04sT0FBTyxDQUFDO01BQ2hERCxTQUFTLEdBQUdBLFNBQVMsQ0FBQ3ZOLE1BQU0sQ0FBQyxVQUFVeU4sS0FBYSxFQUFFO1FBQ3JELE9BQU9BLEtBQUssS0FBSyw0QkFBNEI7TUFDOUMsQ0FBQyxDQUFDO01BQ0YsSUFBSUYsU0FBUyxDQUFDcFQsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN6QixLQUFLLElBQUlRLENBQUMsR0FBRzBTLE1BQU0sRUFBRTFTLENBQUMsR0FBRzRTLFNBQVMsQ0FBQ3BULE1BQU0sR0FBR21ULEtBQUssRUFBRTNTLENBQUMsRUFBRSxFQUFFO1VBQ3ZEeVMsYUFBYSxHQUFJLElBQUd0UyxRQUFRLENBQUNJLFNBQVMsQ0FBRSxHQUFFa1MsYUFBYywrQkFBOEJHLFNBQVMsQ0FBQzVTLENBQUMsQ0FBRSxFQUFDLENBQUUsRUFBQztRQUN4RztNQUNEO01BQ0EsT0FBT3lTLGFBQWE7SUFDckIsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTSxxQkFBcUIsRUFBRSxVQUFVL1AsU0FBaUIsRUFBRWdRLGNBQW1CLEVBQUU7TUFDeEUsTUFBTTdTLFFBQVEsR0FBSTZTLGNBQWMsSUFBSUEsY0FBYyxDQUFDeFUsT0FBTyxJQUFLd0UsU0FBUztNQUN4RSxNQUFNdEUsS0FBSyxHQUFHeUIsUUFBUSxDQUFDeEIsT0FBTyxFQUFFO01BQ2hDLE1BQU1zVSxnQkFBZ0IsR0FBR3ZVLEtBQUssQ0FBQ3lHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQ0UsTUFBTSxDQUFDd04sT0FBTyxDQUFDO01BQ3pELE1BQU1LLFdBQVcsR0FBR0QsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO01BQ3ZDLE1BQU01VSxhQUFhLEdBQUc4QixRQUFRLENBQUNJLFNBQVMsQ0FBQyxPQUFPLENBQUM7TUFDakQsSUFBSTRTLGtCQUFrQixHQUFJLElBQUdELFdBQVksRUFBQztNQUMxQztNQUNBO01BQ0EsSUFBSXhVLEtBQUssQ0FBQ1csT0FBTyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDbEQsTUFBTStULFVBQVUsR0FBRzFVLEtBQUssQ0FBQ1csT0FBTyxDQUFDLHlCQUF5QixDQUFDO1FBQzNELE1BQU1nVSxVQUFVLEdBQUczVSxLQUFLLENBQUM0VSxTQUFTLENBQUMsQ0FBQyxFQUFFRixVQUFVLENBQUM7UUFDakQ7UUFDQUQsa0JBQWtCLEdBQUd0VixXQUFXLENBQUMyVSwyQkFBMkIsQ0FBQ3JTLFFBQVEsRUFBRWtULFVBQVUsRUFBRUYsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUM3RztNQUNBLElBQUk5VSxhQUFhLElBQUlBLGFBQWEsQ0FBQ2dCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUNyRDtRQUNBOFQsa0JBQWtCLEdBQUd0VixXQUFXLENBQUMyVSwyQkFBMkIsQ0FBQ3JTLFFBQVEsRUFBRTlCLGFBQWEsRUFBRThVLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDaEg7TUFDQSxPQUFPQSxrQkFBa0I7SUFDMUIsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDSSxpQkFBaUIsRUFBRSxVQUFVeFYsb0JBQXlCLEVBQUU7TUFDdkQsTUFBTXlWLDBCQUEwQixHQUFHelYsb0JBQW9CLENBQUN3QyxTQUFTLEVBQUU7TUFDbkUsSUFBSWtULGVBQWUsR0FBRzFWLG9CQUFvQixDQUFDVyxLQUFLO01BQ2hELElBQUk4VSwwQkFBMEIsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFO1FBQ3JFQyxlQUFlLEdBQUksR0FBRUEsZUFBZ0IsbUNBQWtDO01BQ3hFLENBQUMsTUFBTTtRQUNOQSxlQUFlLEdBQUksR0FBRUEsZUFBZ0IsNEJBQTJCO01BQ2pFO01BRUEsT0FBT0EsZUFBZTtJQUN2QixDQUFDO0lBQ0RDLHVCQUF1QixFQUFFLFVBQVUzVixvQkFBeUIsRUFBRTtNQUM3RCxPQUFPQSxvQkFBb0IsQ0FBQyxvQ0FBb0MsQ0FBQyxHQUM5RCxDQUFDQSxvQkFBb0IsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDdUMsS0FBSyxHQUNqRSxDQUFDdkMsb0JBQW9CLENBQUMsNkJBQTZCLENBQUMsQ0FBQ3VDLEtBQUs7SUFDOUQsQ0FBQztJQUNEcVQsdUJBQXVCLEVBQUUsVUFBVTVWLG9CQUF5QixFQUFFZ1EsY0FBbUIsRUFBRTtNQUNsRixJQUFJQSxjQUFjLElBQUlBLGNBQWMsQ0FBQzZGLGtCQUFrQixLQUFLLFFBQVEsRUFBRTtRQUNyRSxNQUFNQyxJQUFJLEdBQUc5VixvQkFBb0IsQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJQSxvQkFBb0IsQ0FBQyw2QkFBNkIsQ0FBQztRQUU5SCxNQUFNK1YsVUFBVSxHQUFHQyxVQUFVLENBQUNDLGVBQWUsRUFBUztRQUN0RCxNQUFNQyxVQUFVLEdBQUdILFVBQVUsQ0FBQ0ksV0FBVyxDQUFDQyxLQUFLO1FBRS9DLElBQ0NGLFVBQVUsSUFDVkEsVUFBVSxDQUFDRyxLQUFLLElBQ2hCSCxVQUFVLENBQUNHLEtBQUssQ0FBQ0MsS0FBSyxJQUN0QkosVUFBVSxDQUFDRyxLQUFLLENBQUNDLEtBQUssQ0FBQ1IsSUFBSSxDQUFDLElBQzVCSSxVQUFVLENBQUNHLEtBQUssQ0FBQ0MsS0FBSyxDQUFDUixJQUFJLENBQUMsQ0FBQ1MsV0FBVyxFQUN2QztVQUNELE9BQU9MLFVBQVUsQ0FBQ0csS0FBSyxDQUFDQyxLQUFLLENBQUNSLElBQUksQ0FBQyxDQUFDUyxXQUFXO1FBQ2hEO1FBRUEsT0FBT1QsSUFBSTtNQUNaO0lBQ0QsQ0FBQztJQUNEVSx3QkFBd0IsRUFBRSxVQUFVQyxPQUFZLEVBQUVDLFFBQWEsRUFBRUMsZ0JBQXFCLEVBQUU7TUFDdkYsSUFBSUEsZ0JBQWdCLEVBQUU7UUFDckIsT0FBT0YsT0FBTyxHQUFHRSxnQkFBZ0IsR0FBRyxVQUFVO01BQy9DO01BQ0EsT0FBT0YsT0FBTyxHQUFHQyxRQUFRLEdBQUcsVUFBVTtJQUN2QyxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NFLGdDQUFnQyxFQUFFLFVBQVU3SixLQUFhLEVBQUU4Six5QkFBOEIsRUFBRXRXLFVBQWUsRUFBRTtNQUMzRyxJQUNDc1cseUJBQXlCLElBQ3pCQSx5QkFBeUIsQ0FBQ3pXLFdBQVcsSUFDckN5Vyx5QkFBeUIsQ0FBQ3pXLFdBQVcsS0FBSyx5REFBeUQsSUFDbkdHLFVBQVUsRUFDVDtRQUNELE9BQVEsSUFBR0EsVUFBVSxDQUFDK0IsS0FBSyxDQUFDQyxLQUFNLEdBQUU7TUFDckM7TUFDQSxPQUFPcEIsU0FBUztJQUNqQixDQUFDO0lBRUQyVixpQkFBaUIsRUFBRSxVQUFVQyxJQUFTLEVBQUV0VCxVQUFlLEVBQUU7TUFDeEQ7TUFDQUEsVUFBVSxDQUFDdVQsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFBRUMsZUFBZSxFQUFFO01BQU0sQ0FBQyxDQUFDO01BQ3ZELE9BQU9oVyxnQkFBZ0IsQ0FBQ2lXLE1BQU0sQ0FBQ0gsSUFBSSxFQUFFdFQsVUFBVSxDQUFDO0lBQ2pELENBQUM7SUFDRDBULG9CQUFvQixFQUFFLFVBQVU3VyxhQUFrQixFQUFFO01BQ25ELE9BQU8sdUNBQXVDLEdBQUdBLGFBQWEsR0FBRyw0QkFBNEI7SUFDOUYsQ0FBQztJQUNEOFcsZUFBZSxFQUFFLFVBQVVDLFNBQWMsRUFBRUMsZUFBb0IsRUFBRTtNQUNoRSxJQUFJRCxTQUFTLEVBQUU7UUFDZCxJQUFJQSxTQUFTLENBQUMvVixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1VBQ2pDO1VBQ0EsT0FBTyxNQUFNLEdBQUcrVixTQUFTLEdBQUcsTUFBTSxHQUFHQSxTQUFTLEdBQUcsTUFBTSxHQUFHQyxlQUFlLEdBQUcsR0FBRztRQUNoRjtRQUNBO1FBQ0EsT0FBT0QsU0FBUztNQUNqQjtNQUNBO01BQ0EsT0FBT0MsZUFBZTtJQUN2QixDQUFDO0lBRURDLG1CQUFtQixFQUFFLFVBQVVDLEtBQVUsRUFBRTtNQUMxQyxPQUFPQSxLQUFLLEdBQUcsQ0FBQ0EsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHdFcsU0FBUztJQUM5RCxDQUFDO0lBQ0R1VyxjQUFjLEVBQUUsVUFBVXpMLFlBQW9CLEVBQUU7TUFDL0MsT0FBT0EsWUFBWSxHQUFHLG1HQUFtRztJQUMxSCxDQUFDO0lBQ0QwTCxjQUFjLEVBQUUsVUFBVUMsa0JBQW9DLEVBQUU7TUFDL0QsT0FBT0Esa0JBQWtCLEtBQUssTUFBTSxJQUFJQSxrQkFBa0IsS0FBSyxJQUFJLEdBQUcsd0JBQXdCLEdBQUd6VyxTQUFTO0lBQzNHLENBQUM7SUFDRDBXLFdBQVcsRUFBRSxVQUFVQyxZQUFpQixFQUFFQyxNQUFXLEVBQUVDLGtCQUF1QixFQUFFO01BQy9FLElBQUlDLHdCQUE2QixHQUFHeEcsUUFBUSxDQUFDLEtBQUssQ0FBQztNQUNuRCxJQUFJc0csTUFBTSxLQUFLLElBQUksRUFBRTtRQUNwQkUsd0JBQXdCLEdBQUdDLG9CQUFvQixDQUFDSCxNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBRUksWUFBWSxDQUFDO01BQ3RFO01BQ0EsT0FBT3ZHLGlCQUFpQixDQUFDRSxFQUFFLENBQUNtRyx3QkFBd0IsRUFBRUQsa0JBQWtCLENBQUMxVyxPQUFPLENBQUN3VyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RHLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTSxpQkFBaUIsRUFBRSxVQUFVQyxtQkFBa0MsRUFBRUMsbUJBQXdDLEVBQUU7TUFDMUc7TUFDQSxNQUFNQyxxQkFBcUIsR0FBR0MsU0FBUyxDQUFDQyx3QkFBd0IsQ0FBQ0gsbUJBQW1CLENBQUNILFlBQVksQ0FBQztNQUNsRztNQUNBLE1BQU1PLFlBQVksR0FBR0wsbUJBQW1CLENBQUNyUixJQUFJLENBQUUyUixLQUFLLElBQUs7UUFDeEQsT0FBT0EsS0FBSyxDQUFDclMsR0FBRyxLQUFLaVMscUJBQXFCO01BQzNDLENBQUMsQ0FBQztNQUNGLE9BQU9HLFlBQVksR0FBRyxJQUFJLEdBQUcsS0FBSztJQUNuQztFQUNELENBQUM7RUFDQTVZLFdBQVcsQ0FBQ08sMkJBQTJCLENBQVN1WSxnQkFBZ0IsR0FBRyxJQUFJO0VBQ3ZFOVksV0FBVyxDQUFDK0QsWUFBWSxDQUFTK1UsZ0JBQWdCLEdBQUcsSUFBSTtFQUN4RDlZLFdBQVcsQ0FBQzZRLGdCQUFnQixDQUFTaUksZ0JBQWdCLEdBQUcsSUFBSTtFQUM1RDlZLFdBQVcsQ0FBQ2tWLHFCQUFxQixDQUFTNEQsZ0JBQWdCLEdBQUcsSUFBSTtFQUNqRTlZLFdBQVcsQ0FBQ3FTLHdCQUF3QixDQUFTeUcsZ0JBQWdCLEdBQUcsSUFBSTtFQUNwRTlZLFdBQVcsQ0FBQ2dYLGlCQUFpQixDQUFTOEIsZ0JBQWdCLEdBQUcsSUFBSTtFQUM3RDlZLFdBQVcsQ0FBQ2tSLGdCQUFnQixDQUFTNEgsZ0JBQWdCLEdBQUcsSUFBSTtFQUM1RDlZLFdBQVcsQ0FBQ3FELDRCQUE0QixDQUFTeVYsZ0JBQWdCLEdBQUcsSUFBSTtFQUFDLE9BRTNEOVksV0FBVztBQUFBIn0=