/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "../helpers/DataFieldHelper"], function (TypeGuards, DisplayModeFormatter, PropertyHelper, DataFieldHelper) {
  "use strict";

  var _exports = {};
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForActionAbstract".
   * DataFieldForActionAbstract has an inline action defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForActionAbstractType
   */
  function isDataFieldForActionAbstract(dataField) {
    return dataField.hasOwnProperty("Action");
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "isDataFieldForAnnotation".
   * isDataFieldForAnnotation has an inline $Type property that can be used.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForAnnotation
   */
  _exports.isDataFieldForActionAbstract = isDataFieldForActionAbstract;
  function isDataFieldForAnnotation(dataField) {
    return dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation";
  }
  _exports.isDataFieldForAnnotation = isDataFieldForAnnotation;
  function isDataFieldForAction(dataField) {
    return dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataField".
   * DataField has a value defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validate that dataField is a DataFieldTypes
   */
  _exports.isDataFieldForAction = isDataFieldForAction;
  function isDataFieldTypes(dataField) {
    return dataField.hasOwnProperty("Value");
  }

  /**
   * Determine if the data model object path targeting a dataField for action opens up a dialog.
   *
   * @param dataModelObjectPath DataModelObjectPath
   * @returns `Dialog` | `None` if a dialog is needed
   */
  _exports.isDataFieldTypes = isDataFieldTypes;
  function isDataModelObjectPathForActionWithDialog(dataModelObjectPath) {
    const target = dataModelObjectPath.targetObject;
    return isActionWithDialog(isDataFieldForAction(target) ? target : undefined);
  }

  /**
   * Determine if the dataField for action opens up a dialog.
   *
   * @param dataField DataField for action
   * @returns `Dialog` | `None` if a dialog is needed
   */
  _exports.isDataModelObjectPathForActionWithDialog = isDataModelObjectPathForActionWithDialog;
  function isActionWithDialog(dataField) {
    const action = dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget;
    if (action) {
      var _action$annotations, _action$annotations$C;
      const bCritical = (_action$annotations = action.annotations) === null || _action$annotations === void 0 ? void 0 : (_action$annotations$C = _action$annotations.Common) === null || _action$annotations$C === void 0 ? void 0 : _action$annotations$C.IsActionCritical;
      if (action.parameters.length > 1 || bCritical) {
        return "Dialog";
      } else {
        return "None";
      }
    } else {
      return "None";
    }
  }

  /**
   * Retrieves the TargetValue from a DataPoint.
   *
   * @param source the target property or DataPoint
   * @returns The TargetValue as a decimal or a property path
   */
  _exports.isActionWithDialog = isActionWithDialog;
  function getTargetValueOnDataPoint(source) {
    let targetValue;
    if (isProperty(source)) {
      var _source$annotations, _source$annotations$U, _source$annotations$U2, _source$annotations$U3, _source$annotations$U4, _source$annotations2, _source$annotations2$, _source$annotations2$2, _source$annotations2$3, _source$annotations2$4;
      targetValue = ((_source$annotations = source.annotations) === null || _source$annotations === void 0 ? void 0 : (_source$annotations$U = _source$annotations.UI) === null || _source$annotations$U === void 0 ? void 0 : (_source$annotations$U2 = _source$annotations$U.DataFieldDefault) === null || _source$annotations$U2 === void 0 ? void 0 : (_source$annotations$U3 = _source$annotations$U2.Target) === null || _source$annotations$U3 === void 0 ? void 0 : (_source$annotations$U4 = _source$annotations$U3.$target) === null || _source$annotations$U4 === void 0 ? void 0 : _source$annotations$U4.TargetValue) ?? ((_source$annotations2 = source.annotations) === null || _source$annotations2 === void 0 ? void 0 : (_source$annotations2$ = _source$annotations2.UI) === null || _source$annotations2$ === void 0 ? void 0 : (_source$annotations2$2 = _source$annotations2$.DataFieldDefault) === null || _source$annotations2$2 === void 0 ? void 0 : (_source$annotations2$3 = _source$annotations2$2.Target) === null || _source$annotations2$3 === void 0 ? void 0 : (_source$annotations2$4 = _source$annotations2$3.$target) === null || _source$annotations2$4 === void 0 ? void 0 : _source$annotations2$4.MaximumValue);
    } else {
      targetValue = source.TargetValue ?? source.MaximumValue;
    }
    if (typeof targetValue === "number") {
      return targetValue.toString();
    }
    return isPathAnnotationExpression(targetValue) ? targetValue : "100";
  }

  /**
   * Check if a property uses a DataPoint within a DataFieldDefault.
   *
   * @param property The property to be checked
   * @returns `true` if the referenced property has a DataPoint within the DataFieldDefault, false else
   * @private
   */
  _exports.getTargetValueOnDataPoint = getTargetValueOnDataPoint;
  const isDataPointFromDataFieldDefault = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5;
    return ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.DataFieldDefault) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Target) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.$target) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.$Type) === "com.sap.vocabularies.UI.v1.DataPointType";
  };
  _exports.isDataPointFromDataFieldDefault = isDataPointFromDataFieldDefault;
  function getSemanticObjectPath(converterContext, object) {
    if (typeof object === "object") {
      var _object$Value;
      if (isDataFieldTypes(object) && (_object$Value = object.Value) !== null && _object$Value !== void 0 && _object$Value.$target) {
        var _object$Value2, _property$annotations6, _property$annotations7;
        const property = (_object$Value2 = object.Value) === null || _object$Value2 === void 0 ? void 0 : _object$Value2.$target;
        if ((property === null || property === void 0 ? void 0 : (_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Common) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
        }
      } else if (isProperty(object)) {
        var _object$annotations, _object$annotations$C;
        if ((object === null || object === void 0 ? void 0 : (_object$annotations = object.annotations) === null || _object$annotations === void 0 ? void 0 : (_object$annotations$C = _object$annotations.Common) === null || _object$annotations$C === void 0 ? void 0 : _object$annotations$C.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(object === null || object === void 0 ? void 0 : object.fullyQualifiedName);
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the navigation path prefix for a property path.
   *
   * @param path The property path For e.g. /EntityType/Navigation/Property
   * @returns The navigation path prefix For e.g. /EntityType/Navigation/
   */
  _exports.getSemanticObjectPath = getSemanticObjectPath;
  function _getNavigationPathPrefix(path) {
    return path.indexOf("/") > -1 ? path.substring(0, path.lastIndexOf("/") + 1) : "";
  }

  /**
   * Collect additional properties for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param target Property or DataField being processed
   * @param navigationPathPrefix Navigation path prefix, applicable in case of navigation properties.
   * @param tableType Table type.
   * @param relatedProperties The related properties identified so far.
   * @returns The related properties identified.
   */
  function _collectAdditionalPropertiesForAnalyticalTable(target, navigationPathPrefix, tableType, relatedProperties) {
    if (tableType === "AnalyticalTable") {
      var _target$annotations, _target$annotations$U;
      const hiddenAnnotation = (_target$annotations = target.annotations) === null || _target$annotations === void 0 ? void 0 : (_target$annotations$U = _target$annotations.UI) === null || _target$annotations$U === void 0 ? void 0 : _target$annotations$U.Hidden;
      if (hiddenAnnotation !== null && hiddenAnnotation !== void 0 && hiddenAnnotation.path && isProperty(hiddenAnnotation.$target)) {
        const hiddenAnnotationPropertyPath = navigationPathPrefix + hiddenAnnotation.path;
        // This property should be added to additionalProperties map for the ALP table use-case.
        relatedProperties.additionalProperties[hiddenAnnotationPropertyPath] = hiddenAnnotation.$target;
      }
      const criticality = target.Criticality;
      if (criticality !== null && criticality !== void 0 && criticality.path && isProperty(criticality === null || criticality === void 0 ? void 0 : criticality.$target)) {
        const criticalityPropertyPath = navigationPathPrefix + criticality.path;
        relatedProperties.additionalProperties[criticalityPropertyPath] = criticality === null || criticality === void 0 ? void 0 : criticality.$target;
      }
    }
    return relatedProperties;
  }

  /**
   * Collect related properties from a property's annotations.
   *
   * @param path The property path
   * @param property The property to be considered
   * @param converterContext The converter context
   * @param ignoreSelf Whether to exclude the same property from related properties.
   * @param tableType The table type.
   * @param relatedProperties The related properties identified so far.
   * @param addUnitInTemplate True if the unit/currency property needs to be added in the export template
   * @param isAnnotatedAsHidden True if the DataField or the property are statically hidden
   * @returns The related properties identified.
   */
  function collectRelatedProperties(path, property, converterContext, ignoreSelf, tableType) {
    let relatedProperties = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let addUnitInTemplate = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    let isAnnotatedAsHidden = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    /**
     * Helper to push unique related properties.
     *
     * @param key The property path
     * @param value The properties object containing value property, description property...
     * @returns Index at which the property is available
     */
    function _pushUnique(key, value) {
      if (!relatedProperties.properties.hasOwnProperty(key)) {
        relatedProperties.properties[key] = value;
      }
      return Object.keys(relatedProperties.properties).indexOf(key);
    }

    /**
     * Helper to append the export settings template with a formatted text.
     *
     * @param value Formatted text
     */
    function _appendTemplate(value) {
      relatedProperties.exportSettingsTemplate = relatedProperties.exportSettingsTemplate ? `${relatedProperties.exportSettingsTemplate}${value}` : `${value}`;
    }
    if (path && property) {
      var _property$annotations8, _property$annotations9;
      let valueIndex;
      let targetValue;
      let currencyOrUoMIndex;
      let timezoneOrUoMIndex;
      let dataPointIndex;
      if (isAnnotatedAsHidden) {
        // Collect underlying property
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
        return relatedProperties;
      }
      const navigationPathPrefix = _getNavigationPathPrefix(path);

      // Check for Text annotation.
      const textAnnotation = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Text;
      if (relatedProperties.exportSettingsTemplate) {
        // FieldGroup use-case. Need to add each Field in new line.
        _appendTemplate("\n");
        relatedProperties.exportSettingsWrapping = true;
      }
      if (textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.path && textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.$target) {
        // Check for Text Arrangement.
        const dataModelObjectPath = converterContext.getDataModelObjectPath();
        const textAnnotationPropertyPath = navigationPathPrefix + textAnnotation.path;
        const displayMode = getDisplayMode(property, dataModelObjectPath);
        let descriptionIndex;
        switch (displayMode) {
          case "Value":
            valueIndex = _pushUnique(path, property);
            _appendTemplate(`{${valueIndex}}`);
            break;
          case "Description":
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}}`);
            relatedProperties.textOnlyPropertiesFromTextAnnotation.push(textAnnotationPropertyPath);
            break;
          case "ValueDescription":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${valueIndex}} ({${descriptionIndex}})`);
            break;
          case "DescriptionValue":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}} ({${valueIndex}})`);
            break;
          // no default
        }
      } else {
        var _property$annotations10, _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15, _property$Target, _property$Target$$tar, _property$Target2, _property$Target2$$ta, _property$annotations16, _property$annotations17, _property$annotations18, _property$annotations19, _property$annotations20;
        // Check for field containing Currency Or Unit Properties or Timezone
        const currencyOrUoMProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
        const currencyOrUnitAnnotation = (property === null || property === void 0 ? void 0 : (_property$annotations10 = property.annotations) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.Measures) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.ISOCurrency) || (property === null || property === void 0 ? void 0 : (_property$annotations12 = property.annotations) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.Measures) === null || _property$annotations13 === void 0 ? void 0 : _property$annotations13.Unit);
        const timezoneProperty = getAssociatedTimezoneProperty(property);
        const timezoneAnnotation = property === null || property === void 0 ? void 0 : (_property$annotations14 = property.annotations) === null || _property$annotations14 === void 0 ? void 0 : (_property$annotations15 = _property$annotations14.Common) === null || _property$annotations15 === void 0 ? void 0 : _property$annotations15.Timezone;
        if (currencyOrUoMProperty && currencyOrUnitAnnotation !== null && currencyOrUnitAnnotation !== void 0 && currencyOrUnitAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          currencyOrUoMIndex = _pushUnique(navigationPathPrefix + currencyOrUnitAnnotation.path, currencyOrUnitAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${currencyOrUoMIndex}}`);
          } else {
            relatedProperties.exportUnitName = navigationPathPrefix + currencyOrUnitAnnotation.path;
          }
        } else if (timezoneProperty && timezoneAnnotation !== null && timezoneAnnotation !== void 0 && timezoneAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          timezoneOrUoMIndex = _pushUnique(navigationPathPrefix + timezoneAnnotation.path, timezoneAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${timezoneOrUoMIndex}}`);
          } else {
            relatedProperties.exportTimezoneName = navigationPathPrefix + timezoneAnnotation.path;
          }
        } else if (((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : _property$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" && !((_property$Target2 = property.Target) !== null && _property$Target2 !== void 0 && (_property$Target2$$ta = _property$Target2.$target) !== null && _property$Target2$$ta !== void 0 && _property$Target2$$ta.ValueFormat) || ((_property$annotations16 = property.annotations) === null || _property$annotations16 === void 0 ? void 0 : (_property$annotations17 = _property$annotations16.UI) === null || _property$annotations17 === void 0 ? void 0 : (_property$annotations18 = _property$annotations17.DataFieldDefault) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Target) === null || _property$annotations19 === void 0 ? void 0 : (_property$annotations20 = _property$annotations19.$target) === null || _property$annotations20 === void 0 ? void 0 : _property$annotations20.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
          var _property$Target3, _property$Target3$$ta, _property$Target4, _property$annotations21, _property$annotations22;
          const dataPointProperty = (_property$Target3 = property.Target) === null || _property$Target3 === void 0 ? void 0 : (_property$Target3$$ta = _property$Target3.$target) === null || _property$Target3$$ta === void 0 ? void 0 : _property$Target3$$ta.Value.$target;
          const datapointTarget = (_property$Target4 = property.Target) === null || _property$Target4 === void 0 ? void 0 : _property$Target4.$target;
          // DataPoint use-case using DataFieldDefault.
          const dataPointDefaultProperty = (_property$annotations21 = property.annotations) === null || _property$annotations21 === void 0 ? void 0 : (_property$annotations22 = _property$annotations21.UI) === null || _property$annotations22 === void 0 ? void 0 : _property$annotations22.DataFieldDefault;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + path : path, dataPointDefaultProperty ? property : dataPointProperty);
          targetValue = getTargetValueOnDataPoint(dataPointDefaultProperty ? property : datapointTarget);
          if (isProperty(targetValue.$target)) {
            //in case it's a dynamic targetValue
            targetValue = targetValue;
            dataPointIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + targetValue.$target.name : targetValue.$target.name, targetValue.$target);
            _appendTemplate(`{${valueIndex}}/{${dataPointIndex}}`);
          } else {
            relatedProperties.exportDataPointTargetValue = targetValue;
            _appendTemplate(`{${valueIndex}}/${targetValue}`);
          }
        } else if (property.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
          var _property$fn, _property$fn2;
          const contactProperty = (_property$fn = property.fn) === null || _property$fn === void 0 ? void 0 : _property$fn.$target;
          const contactPropertyPath = (_property$fn2 = property.fn) === null || _property$fn2 === void 0 ? void 0 : _property$fn2.path;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + contactPropertyPath : contactPropertyPath, contactProperty);
          _appendTemplate(`{${valueIndex}}`);
        } else if (!ignoreSelf) {
          // Collect underlying property
          valueIndex = _pushUnique(path, property);
          _appendTemplate(`{${valueIndex}}`);
          if (currencyOrUnitAnnotation) {
            relatedProperties.exportUnitString = `${currencyOrUnitAnnotation}`; // Hard-coded currency/unit
          } else if (timezoneAnnotation) {
            relatedProperties.exportTimezoneString = `${timezoneAnnotation}`; // Hard-coded timezone
          }
        }
      }

      relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(property, navigationPathPrefix, tableType, relatedProperties);
      if (Object.keys(relatedProperties.additionalProperties).length > 0 && Object.keys(relatedProperties.properties).length === 0) {
        // Collect underlying property if not collected already.
        // This is to ensure that additionalProperties are made available only to complex property infos.
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
      }
    }
    return relatedProperties;
  }

  /**
   * Collect properties consumed by a DataField.
   * This is for populating the ComplexPropertyInfos of the table delegate.
   *
   * @param dataField The DataField for which the properties need to be identified.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param relatedProperties The properties identified so far.
   * @param isEmbedded True if the DataField is embedded in another annotation (e.g. FieldGroup).
   * @returns The properties related to the DataField.
   */
  _exports.collectRelatedProperties = collectRelatedProperties;
  function collectRelatedPropertiesRecursively(dataField, converterContext, tableType) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    let relatedProperties = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let isEmbedded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let isStaticallyHidden = false;
    switch (dataField === null || dataField === void 0 ? void 0 : dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (dataField.Value) {
          var _property$$target, _property$$target$ann, _property$$target$ann2;
          const property = dataField.Value;
          isStaticallyHidden = isReferencePropertyStaticallyHidden((_property$$target = property.$target) === null || _property$$target === void 0 ? void 0 : (_property$$target$ann = _property$$target.annotations) === null || _property$$target$ann === void 0 ? void 0 : (_property$$target$ann2 = _property$$target$ann.UI) === null || _property$$target$ann2 === void 0 ? void 0 : _property$$target$ann2.DataFieldDefault) || isReferencePropertyStaticallyHidden(dataField) || false;
          relatedProperties = collectRelatedProperties(property.path, property.$target, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
          const navigationPathPrefix = _getNavigationPathPrefix(property.path);
          relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(dataField, navigationPathPrefix, tableType, relatedProperties);
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(innerDataField => {
              relatedProperties = collectRelatedPropertiesRecursively(innerDataField, converterContext, tableType, relatedProperties, true);
            });
            break;
          case "com.sap.vocabularies.UI.v1.DataPointType":
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.$target.Value.path, dataField, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          case "com.sap.vocabularies.Communication.v1.ContactType":
            const dataFieldContact = dataField.Target.$target;
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.value, dataFieldContact, converterContext, isStaticallyHidden, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return relatedProperties;
  }
  _exports.collectRelatedPropertiesRecursively = collectRelatedPropertiesRecursively;
  const getDataFieldDataType = function (oDataField) {
    var _Value, _Value$$target, _oDataField$Target, _oDataField$Target$$t;
    if (isProperty(oDataField)) {
      return oDataField.type;
    }
    let sDataType;
    switch (oDataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        sDataType = undefined;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        sDataType = oDataField === null || oDataField === void 0 ? void 0 : (_Value = oDataField.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : _Value$$target.type;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      default:
        const sDataTypeForDataFieldForAnnotation = (_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.$Type;
        if (sDataTypeForDataFieldForAnnotation) {
          var _oDataField$Target2;
          const dataFieldTarget = (_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : _oDataField$Target2.$target;
          if (dataFieldTarget.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
            var _dataFieldTarget$fn, _dataFieldTarget$fn$$;
            sDataType = isPathAnnotationExpression(dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : dataFieldTarget.fn) && (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$fn = dataFieldTarget.fn) === null || _dataFieldTarget$fn === void 0 ? void 0 : (_dataFieldTarget$fn$$ = _dataFieldTarget$fn.$target) === null || _dataFieldTarget$fn$$ === void 0 ? void 0 : _dataFieldTarget$fn$$.type) || undefined;
          } else if (dataFieldTarget.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _dataFieldTarget$Valu, _dataFieldTarget$Valu2, _dataFieldTarget$Valu3;
            sDataType = (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$Valu = dataFieldTarget.Value) === null || _dataFieldTarget$Valu === void 0 ? void 0 : (_dataFieldTarget$Valu2 = _dataFieldTarget$Valu.$Path) === null || _dataFieldTarget$Valu2 === void 0 ? void 0 : _dataFieldTarget$Valu2.$Type) || (dataFieldTarget === null || dataFieldTarget === void 0 ? void 0 : (_dataFieldTarget$Valu3 = dataFieldTarget.Value) === null || _dataFieldTarget$Valu3 === void 0 ? void 0 : _dataFieldTarget$Valu3.$target.type);
          } else {
            var _oDataField$Target3;
            // e.g. FieldGroup or Chart
            // FieldGroup Properties have no type, so we define it as a boolean type to prevent exceptions during the calculation of the width
            sDataType = ((_oDataField$Target3 = oDataField.Target) === null || _oDataField$Target3 === void 0 ? void 0 : _oDataField$Target3.$target.$Type) === "com.sap.vocabularies.UI.v1.ChartDefinitionType" ? undefined : "Edm.Boolean";
          }
        } else {
          sDataType = undefined;
        }
        break;
    }
    return sDataType;
  };
  _exports.getDataFieldDataType = getDataFieldDataType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiZGF0YUZpZWxkIiwiaGFzT3duUHJvcGVydHkiLCJpc0RhdGFGaWVsZEZvckFubm90YXRpb24iLCIkVHlwZSIsImlzRGF0YUZpZWxkRm9yQWN0aW9uIiwiaXNEYXRhRmllbGRUeXBlcyIsImlzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2ciLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwidGFyZ2V0IiwidGFyZ2V0T2JqZWN0IiwiaXNBY3Rpb25XaXRoRGlhbG9nIiwidW5kZWZpbmVkIiwiYWN0aW9uIiwiQWN0aW9uVGFyZ2V0IiwiYkNyaXRpY2FsIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJJc0FjdGlvbkNyaXRpY2FsIiwicGFyYW1ldGVycyIsImxlbmd0aCIsImdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQiLCJzb3VyY2UiLCJ0YXJnZXRWYWx1ZSIsImlzUHJvcGVydHkiLCJVSSIsIkRhdGFGaWVsZERlZmF1bHQiLCJUYXJnZXQiLCIkdGFyZ2V0IiwiVGFyZ2V0VmFsdWUiLCJNYXhpbXVtVmFsdWUiLCJ0b1N0cmluZyIsImlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIiwiaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdCIsInByb3BlcnR5IiwiZ2V0U2VtYW50aWNPYmplY3RQYXRoIiwiY29udmVydGVyQ29udGV4dCIsIm9iamVjdCIsIlZhbHVlIiwiU2VtYW50aWNPYmplY3QiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiX2dldE5hdmlnYXRpb25QYXRoUHJlZml4IiwicGF0aCIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsIl9jb2xsZWN0QWRkaXRpb25hbFByb3BlcnRpZXNGb3JBbmFseXRpY2FsVGFibGUiLCJuYXZpZ2F0aW9uUGF0aFByZWZpeCIsInRhYmxlVHlwZSIsInJlbGF0ZWRQcm9wZXJ0aWVzIiwiaGlkZGVuQW5ub3RhdGlvbiIsIkhpZGRlbiIsImhpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGgiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImNyaXRpY2FsaXR5IiwiQ3JpdGljYWxpdHkiLCJjcml0aWNhbGl0eVByb3BlcnR5UGF0aCIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyIsImlnbm9yZVNlbGYiLCJwcm9wZXJ0aWVzIiwidGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uIiwiYWRkVW5pdEluVGVtcGxhdGUiLCJpc0Fubm90YXRlZEFzSGlkZGVuIiwiX3B1c2hVbmlxdWUiLCJrZXkiLCJ2YWx1ZSIsIk9iamVjdCIsImtleXMiLCJfYXBwZW5kVGVtcGxhdGUiLCJleHBvcnRTZXR0aW5nc1RlbXBsYXRlIiwidmFsdWVJbmRleCIsImN1cnJlbmN5T3JVb01JbmRleCIsInRpbWV6b25lT3JVb01JbmRleCIsImRhdGFQb2ludEluZGV4IiwidGV4dEFubm90YXRpb24iLCJUZXh0IiwiZXhwb3J0U2V0dGluZ3NXcmFwcGluZyIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvbkluZGV4IiwicHVzaCIsImN1cnJlbmN5T3JVb01Qcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsImN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbiIsIk1lYXN1cmVzIiwiSVNPQ3VycmVuY3kiLCJVbml0IiwidGltZXpvbmVQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5IiwidGltZXpvbmVBbm5vdGF0aW9uIiwiVGltZXpvbmUiLCJleHBvcnRVbml0TmFtZSIsImV4cG9ydFRpbWV6b25lTmFtZSIsIlZhbHVlRm9ybWF0IiwiZGF0YVBvaW50UHJvcGVydHkiLCJkYXRhcG9pbnRUYXJnZXQiLCJkYXRhUG9pbnREZWZhdWx0UHJvcGVydHkiLCJuYW1lIiwiZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUiLCJjb250YWN0UHJvcGVydHkiLCJmbiIsImNvbnRhY3RQcm9wZXJ0eVBhdGgiLCJleHBvcnRVbml0U3RyaW5nIiwiZXhwb3J0VGltZXpvbmVTdHJpbmciLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSIsImlzRW1iZWRkZWQiLCJpc1N0YXRpY2FsbHlIaWRkZW4iLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIkRhdGEiLCJmb3JFYWNoIiwiaW5uZXJEYXRhRmllbGQiLCJkYXRhRmllbGRDb250YWN0IiwiZ2V0RGF0YUZpZWxkRGF0YVR5cGUiLCJvRGF0YUZpZWxkIiwidHlwZSIsInNEYXRhVHlwZSIsInNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24iLCJkYXRhRmllbGRUYXJnZXQiLCIkUGF0aCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YUZpZWxkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJpbWl0aXZlVHlwZSwgUHJvcGVydHksIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBDb250YWN0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgeyBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgdHlwZSB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JBbm5vdGF0aW9uLFxuXHREYXRhRmllbGRGb3JBbm5vdGF0aW9uVHlwZXMsXG5cdERhdGFGaWVsZFR5cGVzLFxuXHREYXRhUG9pbnRUeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBUYWJsZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5XG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwiLi4vLi4vdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiB9IGZyb20gXCIuLi9oZWxwZXJzL0RhdGFGaWVsZEhlbHBlclwiO1xuXG5leHBvcnQgdHlwZSBDb21wbGV4UHJvcGVydHlJbmZvID0ge1xuXHRwcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT47XG5cdGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT47XG5cdGV4cG9ydFNldHRpbmdzVGVtcGxhdGU/OiBzdHJpbmc7XG5cdGV4cG9ydFNldHRpbmdzV3JhcHBpbmc/OiBib29sZWFuO1xuXHRleHBvcnRVbml0TmFtZT86IHN0cmluZztcblx0ZXhwb3J0VW5pdFN0cmluZz86IHN0cmluZztcblx0ZXhwb3J0VGltZXpvbmVOYW1lPzogc3RyaW5nO1xuXHRleHBvcnRUaW1lem9uZVN0cmluZz86IHN0cmluZztcblx0dGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXTtcblx0ZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWU/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIGRhdGFGaWVsZEFic3RyYWN0IHRoYXQgaXMgcGFzc2VkIGlzIGEgXCJEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFwiLlxuICogRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QgaGFzIGFuIGlubGluZSBhY3Rpb24gZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFZhbGlkYXRlcyB0aGF0IGRhdGFGaWVsZCBpcyBhIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBkYXRhRmllbGQgaXMgRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RUeXBlcyB7XG5cdHJldHVybiAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMpLmhhc093blByb3BlcnR5KFwiQWN0aW9uXCIpO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIGRhdGFGaWVsZEFic3RyYWN0IHRoYXQgaXMgcGFzc2VkIGlzIGEgXCJpc0RhdGFGaWVsZEZvckFubm90YXRpb25cIi5cbiAqIGlzRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBoYXMgYW4gaW5saW5lICRUeXBlIHByb3BlcnR5IHRoYXQgY2FuIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgdG8gYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyBWYWxpZGF0ZXMgdGhhdCBkYXRhRmllbGQgaXMgYSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFGaWVsZEZvckFubm90YXRpb24oZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZEZvckFubm90YXRpb24ge1xuXHRyZXR1cm4gZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhRmllbGRGb3JBY3Rpb24oZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZEZvckFjdGlvbiB7XG5cdHJldHVybiBkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBkYXRhRmllbGRBYnN0cmFjdCB0aGF0IGlzIHBhc3NlZCBpcyBhIFwiRGF0YUZpZWxkXCIuXG4gKiBEYXRhRmllbGQgaGFzIGEgdmFsdWUgZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFZhbGlkYXRlIHRoYXQgZGF0YUZpZWxkIGlzIGEgRGF0YUZpZWxkVHlwZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YUZpZWxkVHlwZXMoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgdW5rbm93bik6IGRhdGFGaWVsZCBpcyBEYXRhRmllbGRUeXBlcyB7XG5cdHJldHVybiAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZFR5cGVzKS5oYXNPd25Qcm9wZXJ0eShcIlZhbHVlXCIpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB0aGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aCB0YXJnZXRpbmcgYSBkYXRhRmllbGQgZm9yIGFjdGlvbiBvcGVucyB1cCBhIGRpYWxvZy5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBEYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcmV0dXJucyBgRGlhbG9nYCB8IGBOb25lYCBpZiBhIGRpYWxvZyBpcyBuZWVkZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2coZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCB0YXJnZXQgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0cmV0dXJuIGlzQWN0aW9uV2l0aERpYWxvZyhpc0RhdGFGaWVsZEZvckFjdGlvbih0YXJnZXQpID8gdGFyZ2V0IDogdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdGhlIGRhdGFGaWVsZCBmb3IgYWN0aW9uIG9wZW5zIHVwIGEgZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGZvciBhY3Rpb25cbiAqIEByZXR1cm5zIGBEaWFsb2dgIHwgYE5vbmVgIGlmIGEgZGlhbG9nIGlzIG5lZWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBY3Rpb25XaXRoRGlhbG9nKGRhdGFGaWVsZD86IERhdGFGaWVsZEZvckFjdGlvbik6IFwiRGlhbG9nXCIgfCBcIk5vbmVcIiB7XG5cdGNvbnN0IGFjdGlvbiA9IGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0O1xuXHRpZiAoYWN0aW9uKSB7XG5cdFx0Y29uc3QgYkNyaXRpY2FsID0gYWN0aW9uLmFubm90YXRpb25zPy5Db21tb24/LklzQWN0aW9uQ3JpdGljYWw7XG5cdFx0aWYgKGFjdGlvbi5wYXJhbWV0ZXJzLmxlbmd0aCA+IDEgfHwgYkNyaXRpY2FsKSB7XG5cdFx0XHRyZXR1cm4gXCJEaWFsb2dcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJOb25lXCI7XG5cdH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIFRhcmdldFZhbHVlIGZyb20gYSBEYXRhUG9pbnQuXG4gKlxuICogQHBhcmFtIHNvdXJjZSB0aGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFQb2ludFxuICogQHJldHVybnMgVGhlIFRhcmdldFZhbHVlIGFzIGEgZGVjaW1hbCBvciBhIHByb3BlcnR5IHBhdGhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludChzb3VyY2U6IFByb3BlcnR5IHwgRGF0YVBvaW50VHlwZSk6IHN0cmluZyB8IFByb3BlcnR5UGF0aCB7XG5cdGxldCB0YXJnZXRWYWx1ZTogc3RyaW5nIHwgUHJvcGVydHlQYXRoIHwgbnVtYmVyO1xuXHRpZiAoaXNQcm9wZXJ0eShzb3VyY2UpKSB7XG5cdFx0dGFyZ2V0VmFsdWUgPVxuXHRcdFx0KChzb3VyY2UuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0IGFzIERhdGFGaWVsZEZvckFubm90YXRpb25UeXBlcyk/LlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnRUeXBlKT8uVGFyZ2V0VmFsdWUgPz9cblx0XHRcdCgoc291cmNlLmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uVHlwZXMpPy5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50VHlwZSk/Lk1heGltdW1WYWx1ZTtcblx0fSBlbHNlIHtcblx0XHR0YXJnZXRWYWx1ZSA9IHNvdXJjZS5UYXJnZXRWYWx1ZSA/PyBzb3VyY2UuTWF4aW11bVZhbHVlO1xuXHR9XG5cdGlmICh0eXBlb2YgdGFyZ2V0VmFsdWUgPT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gdGFyZ2V0VmFsdWUudG9TdHJpbmcoKTtcblx0fVxuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24odGFyZ2V0VmFsdWUpID8gdGFyZ2V0VmFsdWUgOiBcIjEwMFwiO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcHJvcGVydHkgdXNlcyBhIERhdGFQb2ludCB3aXRoaW4gYSBEYXRhRmllbGREZWZhdWx0LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSByZWZlcmVuY2VkIHByb3BlcnR5IGhhcyBhIERhdGFQb2ludCB3aXRoaW4gdGhlIERhdGFGaWVsZERlZmF1bHQsIGZhbHNlIGVsc2VcbiAqIEBwcml2YXRlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGlzRGF0YVBvaW50RnJvbURhdGFGaWVsZERlZmF1bHQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0KHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKT8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbWFudGljT2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBvYmplY3Q6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGlzRGF0YUZpZWxkVHlwZXMob2JqZWN0KSAmJiBvYmplY3QuVmFsdWU/LiR0YXJnZXQpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5ID0gb2JqZWN0LlZhbHVlPy4kdGFyZ2V0O1xuXHRcdFx0aWYgKHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHk/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc1Byb3BlcnR5KG9iamVjdCkpIHtcblx0XHRcdGlmIChvYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChvYmplY3Q/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmF2aWdhdGlvbiBwYXRoIHByZWZpeCBmb3IgYSBwcm9wZXJ0eSBwYXRoLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwcm9wZXJ0eSBwYXRoIEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vUHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIHBhdGggcHJlZml4IEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vXG4gKi9cbmZ1bmN0aW9uIF9nZXROYXZpZ2F0aW9uUGF0aFByZWZpeChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gcGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xID8gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IFwiXCI7XG59XG5cbi8qKlxuICogQ29sbGVjdCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG4gKlxuICogRm9yIGUuZy4gSWYgVUkuSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5LCBpbmNsdWRlIHRoaXMgcHJvcGVydHkgaW4gdGhlIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG9mIENvbXBsZXhQcm9wZXJ0eUluZm8gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgUHJvcGVydHkgb3IgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIG5hdmlnYXRpb25QYXRoUHJlZml4IE5hdmlnYXRpb24gcGF0aCBwcmVmaXgsIGFwcGxpY2FibGUgaW4gY2FzZSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gcmVsYXRlZFByb3BlcnRpZXMgVGhlIHJlbGF0ZWQgcHJvcGVydGllcyBpZGVudGlmaWVkIHNvIGZhci5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZC5cbiAqL1xuZnVuY3Rpb24gX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZShcblx0dGFyZ2V0OiBQcmltaXRpdmVUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aFByZWZpeDogc3RyaW5nLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0cmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eUluZm9cbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHRpZiAodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiKSB7XG5cdFx0Y29uc3QgaGlkZGVuQW5ub3RhdGlvbiA9IHRhcmdldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbjtcblx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvbj8ucGF0aCAmJiBpc1Byb3BlcnR5KGhpZGRlbkFubm90YXRpb24uJHRhcmdldCkpIHtcblx0XHRcdGNvbnN0IGhpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGhpZGRlbkFubm90YXRpb24ucGF0aDtcblx0XHRcdC8vIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIGFkZGVkIHRvIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG1hcCBmb3IgdGhlIEFMUCB0YWJsZSB1c2UtY2FzZS5cblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxQcm9wZXJ0aWVzW2hpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGhdID0gaGlkZGVuQW5ub3RhdGlvbi4kdGFyZ2V0O1xuXHRcdH1cblxuXHRcdGNvbnN0IGNyaXRpY2FsaXR5ID0gdGFyZ2V0LkNyaXRpY2FsaXR5O1xuXHRcdGlmIChjcml0aWNhbGl0eT8ucGF0aCAmJiBpc1Byb3BlcnR5KGNyaXRpY2FsaXR5Py4kdGFyZ2V0KSkge1xuXHRcdFx0Y29uc3QgY3JpdGljYWxpdHlQcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGNyaXRpY2FsaXR5LnBhdGg7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllcy5hZGRpdGlvbmFsUHJvcGVydGllc1tjcml0aWNhbGl0eVByb3BlcnR5UGF0aF0gPSBjcml0aWNhbGl0eT8uJHRhcmdldDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlbGF0ZWRQcm9wZXJ0aWVzO1xufVxuXG4vKipcbiAqIENvbGxlY3QgcmVsYXRlZCBwcm9wZXJ0aWVzIGZyb20gYSBwcm9wZXJ0eSdzIGFubm90YXRpb25zLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNvbnNpZGVyZWRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGlnbm9yZVNlbGYgV2hldGhlciB0byBleGNsdWRlIHRoZSBzYW1lIHByb3BlcnR5IGZyb20gcmVsYXRlZCBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIHRhYmxlVHlwZSBUaGUgdGFibGUgdHlwZS5cbiAqIEBwYXJhbSByZWxhdGVkUHJvcGVydGllcyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgc28gZmFyLlxuICogQHBhcmFtIGFkZFVuaXRJblRlbXBsYXRlIFRydWUgaWYgdGhlIHVuaXQvY3VycmVuY3kgcHJvcGVydHkgbmVlZHMgdG8gYmUgYWRkZWQgaW4gdGhlIGV4cG9ydCB0ZW1wbGF0ZVxuICogQHBhcmFtIGlzQW5ub3RhdGVkQXNIaWRkZW4gVHJ1ZSBpZiB0aGUgRGF0YUZpZWxkIG9yIHRoZSBwcm9wZXJ0eSBhcmUgc3RhdGljYWxseSBoaWRkZW5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhcblx0cGF0aDogc3RyaW5nLFxuXHRwcm9wZXJ0eTogUHJpbWl0aXZlVHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aWdub3JlU2VsZjogYm9vbGVhbixcblx0dGFibGVUeXBlOiBUYWJsZVR5cGUsXG5cdHJlbGF0ZWRQcm9wZXJ0aWVzOiBDb21wbGV4UHJvcGVydHlJbmZvID0geyBwcm9wZXJ0aWVzOiB7fSwgYWRkaXRpb25hbFByb3BlcnRpZXM6IHt9LCB0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb246IFtdIH0sXG5cdGFkZFVuaXRJblRlbXBsYXRlID0gZmFsc2UsXG5cdGlzQW5ub3RhdGVkQXNIaWRkZW4gPSBmYWxzZVxuKTogQ29tcGxleFByb3BlcnR5SW5mbyB7XG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gcHVzaCB1bmlxdWUgcmVsYXRlZCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBwcm9wZXJ0eSBwYXRoXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgcHJvcGVydGllcyBvYmplY3QgY29udGFpbmluZyB2YWx1ZSBwcm9wZXJ0eSwgZGVzY3JpcHRpb24gcHJvcGVydHkuLi5cblx0ICogQHJldHVybnMgSW5kZXggYXQgd2hpY2ggdGhlIHByb3BlcnR5IGlzIGF2YWlsYWJsZVxuXHQgKi9cblx0ZnVuY3Rpb24gX3B1c2hVbmlxdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBQcm9wZXJ0eSk6IG51bWJlciB7XG5cdFx0aWYgKCFyZWxhdGVkUHJvcGVydGllcy5wcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXNba2V5XSA9IHZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXMucHJvcGVydGllcykuaW5kZXhPZihrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBhcHBlbmQgdGhlIGV4cG9ydCBzZXR0aW5ncyB0ZW1wbGF0ZSB3aXRoIGEgZm9ybWF0dGVkIHRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBGb3JtYXR0ZWQgdGV4dFxuXHQgKi9cblx0ZnVuY3Rpb24gX2FwcGVuZFRlbXBsYXRlKHZhbHVlOiBzdHJpbmcpIHtcblx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1RlbXBsYXRlID0gcmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZVxuXHRcdFx0PyBgJHtyZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1RlbXBsYXRlfSR7dmFsdWV9YFxuXHRcdFx0OiBgJHt2YWx1ZX1gO1xuXHR9XG5cdGlmIChwYXRoICYmIHByb3BlcnR5KSB7XG5cdFx0bGV0IHZhbHVlSW5kZXg6IG51bWJlcjtcblx0XHRsZXQgdGFyZ2V0VmFsdWU6IHN0cmluZyB8IFByb3BlcnR5UGF0aDtcblx0XHRsZXQgY3VycmVuY3lPclVvTUluZGV4OiBudW1iZXI7XG5cdFx0bGV0IHRpbWV6b25lT3JVb01JbmRleDogbnVtYmVyO1xuXHRcdGxldCBkYXRhUG9pbnRJbmRleDogbnVtYmVyO1xuXHRcdGlmIChpc0Fubm90YXRlZEFzSGlkZGVuKSB7XG5cdFx0XHQvLyBDb2xsZWN0IHVuZGVybHlpbmcgcHJvcGVydHlcblx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdFx0cmV0dXJuIHJlbGF0ZWRQcm9wZXJ0aWVzO1xuXHRcdH1cblx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aFByZWZpeCA9IF9nZXROYXZpZ2F0aW9uUGF0aFByZWZpeChwYXRoKTtcblxuXHRcdC8vIENoZWNrIGZvciBUZXh0IGFubm90YXRpb24uXG5cdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXG5cdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUpIHtcblx0XHRcdC8vIEZpZWxkR3JvdXAgdXNlLWNhc2UuIE5lZWQgdG8gYWRkIGVhY2ggRmllbGQgaW4gbmV3IGxpbmUuXG5cdFx0XHRfYXBwZW5kVGVtcGxhdGUoXCJcXG5cIik7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1dyYXBwaW5nID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dEFubm90YXRpb24/LnBhdGggJiYgdGV4dEFubm90YXRpb24/LiR0YXJnZXQpIHtcblx0XHRcdC8vIENoZWNrIGZvciBUZXh0IEFycmFuZ2VtZW50LlxuXHRcdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRcdFx0Y29uc3QgdGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHRleHRBbm5vdGF0aW9uLnBhdGg7XG5cdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IGdldERpc3BsYXlNb2RlKHByb3BlcnR5LCBkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdGxldCBkZXNjcmlwdGlvbkluZGV4OiBudW1iZXI7XG5cdFx0XHRzd2l0Y2ggKGRpc3BsYXlNb2RlKSB7XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRkZXNjcmlwdGlvbkluZGV4ID0gX3B1c2hVbmlxdWUodGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgsIHRleHRBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7ZGVzY3JpcHRpb25JbmRleH19YCk7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMudGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uLnB1c2godGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRkZXNjcmlwdGlvbkluZGV4ID0gX3B1c2hVbmlxdWUodGV4dEFubm90YXRpb25Qcm9wZXJ0eVBhdGgsIHRleHRBbm5vdGF0aW9uLiR0YXJnZXQpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19ICh7JHtkZXNjcmlwdGlvbkluZGV4fX0pYCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uSW5kZXggPSBfcHVzaFVuaXF1ZSh0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCwgdGV4dEFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHtkZXNjcmlwdGlvbkluZGV4fX0gKHske3ZhbHVlSW5kZXh9fSlgKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Ly8gbm8gZGVmYXVsdFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBDaGVjayBmb3IgZmllbGQgY29udGFpbmluZyBDdXJyZW5jeSBPciBVbml0IFByb3BlcnRpZXMgb3IgVGltZXpvbmVcblx0XHRcdGNvbnN0IGN1cnJlbmN5T3JVb01Qcm9wZXJ0eSA9IGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5KHByb3BlcnR5KSB8fCBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRcdGNvbnN0IGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbiA9IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ7XG5cdFx0XHRjb25zdCB0aW1lem9uZVByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkocHJvcGVydHkpO1xuXHRcdFx0Y29uc3QgdGltZXpvbmVBbm5vdGF0aW9uID0gcHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lO1xuXG5cdFx0XHRpZiAoY3VycmVuY3lPclVvTVByb3BlcnR5ICYmIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbj8uJHRhcmdldCkge1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRjdXJyZW5jeU9yVW9NSW5kZXggPSBfcHVzaFVuaXF1ZShuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbi5wYXRoLCBjdXJyZW5jeU9yVW5pdEFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdGlmIChhZGRVbml0SW5UZW1wbGF0ZSkge1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19ICB7JHtjdXJyZW5jeU9yVW9NSW5kZXh9fWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFVuaXROYW1lID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyBjdXJyZW5jeU9yVW5pdEFubm90YXRpb24ucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aW1lem9uZVByb3BlcnR5ICYmIHRpbWV6b25lQW5ub3RhdGlvbj8uJHRhcmdldCkge1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHR0aW1lem9uZU9yVW9NSW5kZXggPSBfcHVzaFVuaXF1ZShuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHRpbWV6b25lQW5ub3RhdGlvbi5wYXRoLCB0aW1lem9uZUFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdGlmIChhZGRVbml0SW5UZW1wbGF0ZSkge1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19ICB7JHt0aW1lem9uZU9yVW9NSW5kZXh9fWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFRpbWV6b25lTmFtZSA9IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgdGltZXpvbmVBbm5vdGF0aW9uLnBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdChwcm9wZXJ0eS5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlICYmICFwcm9wZXJ0eS5UYXJnZXQ/LiR0YXJnZXQ/LlZhbHVlRm9ybWF0KSB8fFxuXHRcdFx0XHRwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ/LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGVcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBkYXRhUG9pbnRQcm9wZXJ0eSA9IHByb3BlcnR5LlRhcmdldD8uJHRhcmdldD8uVmFsdWUuJHRhcmdldCBhcyBQcm9wZXJ0eTtcblx0XHRcdFx0Y29uc3QgZGF0YXBvaW50VGFyZ2V0ID0gcHJvcGVydHkuVGFyZ2V0Py4kdGFyZ2V0O1xuXHRcdFx0XHQvLyBEYXRhUG9pbnQgdXNlLWNhc2UgdXNpbmcgRGF0YUZpZWxkRGVmYXVsdC5cblx0XHRcdFx0Y29uc3QgZGF0YVBvaW50RGVmYXVsdFByb3BlcnR5ID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0O1xuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUoXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGhQcmVmaXggPyBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHBhdGggOiBwYXRoLFxuXHRcdFx0XHRcdGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eSA/IHByb3BlcnR5IDogZGF0YVBvaW50UHJvcGVydHlcblx0XHRcdFx0KTtcblx0XHRcdFx0dGFyZ2V0VmFsdWUgPSBnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50KGRhdGFQb2ludERlZmF1bHRQcm9wZXJ0eSA/IHByb3BlcnR5IDogZGF0YXBvaW50VGFyZ2V0KTtcblx0XHRcdFx0aWYgKGlzUHJvcGVydHkoKHRhcmdldFZhbHVlIGFzIFByb3BlcnR5UGF0aCkuJHRhcmdldCkpIHtcblx0XHRcdFx0XHQvL2luIGNhc2UgaXQncyBhIGR5bmFtaWMgdGFyZ2V0VmFsdWVcblx0XHRcdFx0XHR0YXJnZXRWYWx1ZSA9IHRhcmdldFZhbHVlIGFzIFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRkYXRhUG9pbnRJbmRleCA9IF9wdXNoVW5pcXVlKFxuXHRcdFx0XHRcdFx0bmF2aWdhdGlvblBhdGhQcmVmaXggPyBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIHRhcmdldFZhbHVlLiR0YXJnZXQubmFtZSA6IHRhcmdldFZhbHVlLiR0YXJnZXQubmFtZSxcblx0XHRcdFx0XHRcdHRhcmdldFZhbHVlLiR0YXJnZXRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19L3ske2RhdGFQb2ludEluZGV4fX1gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHRhcmdldFZhbHVlIGFzIHN0cmluZztcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fS8ke3RhcmdldFZhbHVlfWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHByb3BlcnR5LiRUeXBlID09PSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkNvbnRhY3RUeXBlKSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRhY3RQcm9wZXJ0eSA9IHByb3BlcnR5LmZuPy4kdGFyZ2V0O1xuXHRcdFx0XHRjb25zdCBjb250YWN0UHJvcGVydHlQYXRoID0gcHJvcGVydHkuZm4/LnBhdGg7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aFByZWZpeCA/IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgY29udGFjdFByb3BlcnR5UGF0aCA6IGNvbnRhY3RQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0Y29udGFjdFByb3BlcnR5XG5cdFx0XHRcdCk7XG5cdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19YCk7XG5cdFx0XHR9IGVsc2UgaWYgKCFpZ25vcmVTZWxmKSB7XG5cdFx0XHRcdC8vIENvbGxlY3QgdW5kZXJseWluZyBwcm9wZXJ0eVxuXHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdFx0XHRpZiAoY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VW5pdFN0cmluZyA9IGAke2N1cnJlbmN5T3JVbml0QW5ub3RhdGlvbn1gOyAvLyBIYXJkLWNvZGVkIGN1cnJlbmN5L3VuaXRcblx0XHRcdFx0fSBlbHNlIGlmICh0aW1lem9uZUFubm90YXRpb24pIHtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRUaW1lem9uZVN0cmluZyA9IGAke3RpbWV6b25lQW5ub3RhdGlvbn1gOyAvLyBIYXJkLWNvZGVkIHRpbWV6b25lXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZWxhdGVkUHJvcGVydGllcyA9IF9jb2xsZWN0QWRkaXRpb25hbFByb3BlcnRpZXNGb3JBbmFseXRpY2FsVGFibGUocHJvcGVydHksIG5hdmlnYXRpb25QYXRoUHJlZml4LCB0YWJsZVR5cGUsIHJlbGF0ZWRQcm9wZXJ0aWVzKTtcblx0XHRpZiAoT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXMuYWRkaXRpb25hbFByb3BlcnRpZXMpLmxlbmd0aCA+IDAgJiYgT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXMucHJvcGVydGllcykubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQvLyBDb2xsZWN0IHVuZGVybHlpbmcgcHJvcGVydHkgaWYgbm90IGNvbGxlY3RlZCBhbHJlYWR5LlxuXHRcdFx0Ly8gVGhpcyBpcyB0byBlbnN1cmUgdGhhdCBhZGRpdGlvbmFsUHJvcGVydGllcyBhcmUgbWFkZSBhdmFpbGFibGUgb25seSB0byBjb21wbGV4IHByb3BlcnR5IGluZm9zLlxuXHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19YCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuLyoqXG4gKiBDb2xsZWN0IHByb3BlcnRpZXMgY29uc3VtZWQgYnkgYSBEYXRhRmllbGQuXG4gKiBUaGlzIGlzIGZvciBwb3B1bGF0aW5nIHRoZSBDb21wbGV4UHJvcGVydHlJbmZvcyBvZiB0aGUgdGFibGUgZGVsZWdhdGUuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGZvciB3aGljaCB0aGUgcHJvcGVydGllcyBuZWVkIHRvIGJlIGlkZW50aWZpZWQuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHJlbGF0ZWRQcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgc28gZmFyLlxuICogQHBhcmFtIGlzRW1iZWRkZWQgVHJ1ZSBpZiB0aGUgRGF0YUZpZWxkIGlzIGVtYmVkZGVkIGluIGFub3RoZXIgYW5ub3RhdGlvbiAoZS5nLiBGaWVsZEdyb3VwKS5cbiAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdGhlIERhdGFGaWVsZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5KFxuXHRkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRyZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5SW5mbyA9IHsgcHJvcGVydGllczoge30sIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiB7fSwgdGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uOiBbXSB9LFxuXHRpc0VtYmVkZGVkID0gZmFsc2Vcbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHRsZXQgaXNTdGF0aWNhbGx5SGlkZGVuID0gZmFsc2U7XG5cdHN3aXRjaCAoZGF0YUZpZWxkPy4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0aWYgKGRhdGFGaWVsZC5WYWx1ZSkge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eSA9IGRhdGFGaWVsZC5WYWx1ZTtcblx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuID1cblx0XHRcdFx0XHRpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihwcm9wZXJ0eS4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQpIHx8XG5cdFx0XHRcdFx0aXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZGF0YUZpZWxkKSB8fFxuXHRcdFx0XHRcdGZhbHNlO1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhcblx0XHRcdFx0XHRwcm9wZXJ0eS5wYXRoLFxuXHRcdFx0XHRcdHByb3BlcnR5LiR0YXJnZXQsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMsXG5cdFx0XHRcdFx0aXNFbWJlZGRlZCxcblx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW5cblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgbmF2aWdhdGlvblBhdGhQcmVmaXggPSBfZ2V0TmF2aWdhdGlvblBhdGhQcmVmaXgocHJvcGVydHkucGF0aCk7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZShcblx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGhQcmVmaXgsXG5cdFx0XHRcdFx0dGFibGVUeXBlLFxuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlKSB7XG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGU6XG5cdFx0XHRcdFx0ZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0LkRhdGE/LmZvckVhY2goKGlubmVyRGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5KFxuXHRcdFx0XHRcdFx0XHRpbm5lckRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0dGFibGVUeXBlLFxuXHRcdFx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuID0gaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZGF0YUZpZWxkKSA/PyBmYWxzZTtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldC5WYWx1ZS5wYXRoLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0dGFibGVUeXBlLFxuXHRcdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRpc0VtYmVkZGVkLFxuXHRcdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMuQ29udGFjdFR5cGU6XG5cdFx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkQ29udGFjdCA9IGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldCBhcyBDb250YWN0O1xuXHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlbiA9IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKGRhdGFGaWVsZCkgPz8gZmFsc2U7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQuVGFyZ2V0LnZhbHVlLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkQ29udGFjdCxcblx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW4sXG5cdFx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdGlzRW1iZWRkZWQsXG5cdFx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG59XG5cbmV4cG9ydCBjb25zdCBnZXREYXRhRmllbGREYXRhVHlwZSA9IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoaXNQcm9wZXJ0eShvRGF0YUZpZWxkKSkge1xuXHRcdHJldHVybiBvRGF0YUZpZWxkLnR5cGU7XG5cdH1cblx0bGV0IHNEYXRhVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRzd2l0Y2ggKG9EYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbkdyb3VwOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbkdyb3VwOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdHNEYXRhVHlwZSA9IChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZCk/LlZhbHVlPy4kdGFyZ2V0Py50eXBlO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNvbnN0IHNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24gPSBvRGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldD8uJFR5cGU7XG5cdFx0XHRpZiAoc0RhdGFUeXBlRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdFx0XHRjb25zdCBkYXRhRmllbGRUYXJnZXQgPSBvRGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldDtcblx0XHRcdFx0aWYgKGRhdGFGaWVsZFRhcmdldC4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZSkge1xuXHRcdFx0XHRcdHNEYXRhVHlwZSA9IChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihkYXRhRmllbGRUYXJnZXQ/LmZuKSAmJiBkYXRhRmllbGRUYXJnZXQ/LmZuPy4kdGFyZ2V0Py50eXBlKSB8fCB1bmRlZmluZWQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkVGFyZ2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0c0RhdGFUeXBlID0gZGF0YUZpZWxkVGFyZ2V0Py5WYWx1ZT8uJFBhdGg/LiRUeXBlIHx8IGRhdGFGaWVsZFRhcmdldD8uVmFsdWU/LiR0YXJnZXQudHlwZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBlLmcuIEZpZWxkR3JvdXAgb3IgQ2hhcnRcblx0XHRcdFx0XHQvLyBGaWVsZEdyb3VwIFByb3BlcnRpZXMgaGF2ZSBubyB0eXBlLCBzbyB3ZSBkZWZpbmUgaXQgYXMgYSBib29sZWFuIHR5cGUgdG8gcHJldmVudCBleGNlcHRpb25zIGR1cmluZyB0aGUgY2FsY3VsYXRpb24gb2YgdGhlIHdpZHRoXG5cdFx0XHRcdFx0c0RhdGFUeXBlID1cblx0XHRcdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGVmaW5pdGlvblR5cGVcIiA/IHVuZGVmaW5lZCA6IFwiRWRtLkJvb2xlYW5cIjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gc0RhdGFUeXBlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsNEJBQTRCLENBQUNDLFNBQWlDLEVBQWdEO0lBQzdILE9BQVFBLFNBQVMsQ0FBcUNDLGNBQWMsQ0FBQyxRQUFRLENBQUM7RUFDL0U7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLFNBQVNDLHdCQUF3QixDQUFDRixTQUFpQyxFQUF1QztJQUNoSCxPQUFPQSxTQUFTLENB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