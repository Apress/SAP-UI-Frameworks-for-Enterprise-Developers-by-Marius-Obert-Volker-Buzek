/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/SemanticObjectHelper"], function (TypeGuards, SemanticObjectHelper) {
  "use strict";

  var _exports = {};
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  /**
   * Check whether the property has the Core.Computed annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if the property is computed
   */
  const isComputed = function (oProperty) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    return !!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Core) !== null && _oProperty$annotation2 !== void 0 && (_oProperty$annotation3 = _oProperty$annotation2.Computed) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.valueOf());
  };

  /**
   * Check whether the property has the Core.Immutable annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's immutable
   */
  _exports.isComputed = isComputed;
  const isImmutable = function (oProperty) {
    var _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
    return !!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Immutable) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.valueOf());
  };

  /**
   * Check whether the property is a key or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's a key
   */
  _exports.isImmutable = isImmutable;
  const isKey = function (oProperty) {
    return !!oProperty.isKey;
  };

  /**
   * Check whether the property is a semanticKey for the context entity.
   *
   * @param property
   * @param contextDataModelObject The DataModelObject that holds the context
   * @returns `true`if it's a semantic key
   */
  _exports.isKey = isKey;
  const isSemanticKey = function (property, contextDataModelObject) {
    var _contextDataModelObje, _contextDataModelObje2, _contextDataModelObje3, _contextDataModelObje4;
    const semanticKeys = (_contextDataModelObje = contextDataModelObject.contextLocation) === null || _contextDataModelObje === void 0 ? void 0 : (_contextDataModelObje2 = _contextDataModelObje.targetEntityType) === null || _contextDataModelObje2 === void 0 ? void 0 : (_contextDataModelObje3 = _contextDataModelObje2.annotations) === null || _contextDataModelObje3 === void 0 ? void 0 : (_contextDataModelObje4 = _contextDataModelObje3.Common) === null || _contextDataModelObje4 === void 0 ? void 0 : _contextDataModelObje4.SemanticKey;
    return (semanticKeys === null || semanticKeys === void 0 ? void 0 : semanticKeys.some(function (key) {
      var _key$$target;
      return (key === null || key === void 0 ? void 0 : (_key$$target = key.$target) === null || _key$$target === void 0 ? void 0 : _key$$target.fullyQualifiedName) === property.fullyQualifiedName;
    })) ?? false;
  };

  /**
   * Checks whether the property has a date time or not.
   *
   * @param oProperty
   * @returns `true` if it is of type date / datetime / datetimeoffset
   */
  _exports.isSemanticKey = isSemanticKey;
  const hasDateType = function (oProperty) {
    return ["Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oProperty.type) !== -1;
  };

  /**
   * Retrieve the label annotation.
   *
   * @param oProperty The target property
   * @returns The label string
   */
  _exports.hasDateType = hasDateType;
  const getLabel = function (oProperty) {
    var _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9;
    return ((_oProperty$annotation7 = oProperty.annotations) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.Common) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Label) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.toString()) || "";
  };

  /**
   * Check whether the property has a semantic object defined or not.
   *
   * @param property The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getLabel = getLabel;
  const hasSemanticObject = function (property) {
    return SemanticObjectHelper.hasSemanticObject(property);
  };

  /**
   * Retrieves the timezone property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property, if it exists
   */
  _exports.hasSemanticObject = hasSemanticObject;
  const getAssociatedTimezoneProperty = function (oProperty) {
    var _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Common) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Timezone) ? (_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Common) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Timezone.$target : undefined;
  };

  /**
   * Retrieves the timezone property path associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property path, if it exists
   */
  _exports.getAssociatedTimezoneProperty = getAssociatedTimezoneProperty;
  const getAssociatedTimezonePropertyPath = function (oProperty) {
    var _oProperty$annotation14, _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Common) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Timezone) ? oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation16 = oProperty.annotations) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.Common) === null || _oProperty$annotation17 === void 0 ? void 0 : (_oProperty$annotation18 = _oProperty$annotation17.Timezone) === null || _oProperty$annotation18 === void 0 ? void 0 : _oProperty$annotation18.path : undefined;
  };

  /**
   * Retrieves the associated text property for that property, if it exists.
   *
   * @param oProperty The target property
   * @returns The text property, if it exists
   */
  _exports.getAssociatedTimezonePropertyPath = getAssociatedTimezonePropertyPath;
  const getAssociatedTextProperty = function (oProperty) {
    var _oProperty$annotation19, _oProperty$annotation20, _oProperty$annotation21, _oProperty$annotation22;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation19 = oProperty.annotations) === null || _oProperty$annotation19 === void 0 ? void 0 : (_oProperty$annotation20 = _oProperty$annotation19.Common) === null || _oProperty$annotation20 === void 0 ? void 0 : _oProperty$annotation20.Text) ? (_oProperty$annotation21 = oProperty.annotations) === null || _oProperty$annotation21 === void 0 ? void 0 : (_oProperty$annotation22 = _oProperty$annotation21.Common) === null || _oProperty$annotation22 === void 0 ? void 0 : _oProperty$annotation22.Text.$target : undefined;
  };

  /**
   * Retrieves the unit property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedTextProperty = getAssociatedTextProperty;
  const getAssociatedUnitProperty = function (oProperty) {
    var _oProperty$annotation23, _oProperty$annotation24, _oProperty$annotation25, _oProperty$annotation26;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation23 = oProperty.annotations) === null || _oProperty$annotation23 === void 0 ? void 0 : (_oProperty$annotation24 = _oProperty$annotation23.Measures) === null || _oProperty$annotation24 === void 0 ? void 0 : _oProperty$annotation24.Unit) ? (_oProperty$annotation25 = oProperty.annotations) === null || _oProperty$annotation25 === void 0 ? void 0 : (_oProperty$annotation26 = _oProperty$annotation25.Measures) === null || _oProperty$annotation26 === void 0 ? void 0 : _oProperty$annotation26.Unit.$target : undefined;
  };
  _exports.getAssociatedUnitProperty = getAssociatedUnitProperty;
  const getAssociatedUnitPropertyPath = function (oProperty) {
    var _oProperty$annotation27, _oProperty$annotation28, _oProperty$annotation29, _oProperty$annotation30;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation27 = oProperty.annotations) === null || _oProperty$annotation27 === void 0 ? void 0 : (_oProperty$annotation28 = _oProperty$annotation27.Measures) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.Unit) ? (_oProperty$annotation29 = oProperty.annotations) === null || _oProperty$annotation29 === void 0 ? void 0 : (_oProperty$annotation30 = _oProperty$annotation29.Measures) === null || _oProperty$annotation30 === void 0 ? void 0 : _oProperty$annotation30.Unit.path : undefined;
  };

  /**
   * Retrieves the associated currency property for that property if it exists.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedUnitPropertyPath = getAssociatedUnitPropertyPath;
  const getAssociatedCurrencyProperty = function (oProperty) {
    var _oProperty$annotation31, _oProperty$annotation32, _oProperty$annotation33, _oProperty$annotation34;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation31 = oProperty.annotations) === null || _oProperty$annotation31 === void 0 ? void 0 : (_oProperty$annotation32 = _oProperty$annotation31.Measures) === null || _oProperty$annotation32 === void 0 ? void 0 : _oProperty$annotation32.ISOCurrency) ? (_oProperty$annotation33 = oProperty.annotations) === null || _oProperty$annotation33 === void 0 ? void 0 : (_oProperty$annotation34 = _oProperty$annotation33.Measures) === null || _oProperty$annotation34 === void 0 ? void 0 : _oProperty$annotation34.ISOCurrency.$target : undefined;
  };
  _exports.getAssociatedCurrencyProperty = getAssociatedCurrencyProperty;
  const getAssociatedCurrencyPropertyPath = function (oProperty) {
    var _oProperty$annotation35, _oProperty$annotation36, _oProperty$annotation37, _oProperty$annotation38;
    return isPathAnnotationExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation35 = oProperty.annotations) === null || _oProperty$annotation35 === void 0 ? void 0 : (_oProperty$annotation36 = _oProperty$annotation35.Measures) === null || _oProperty$annotation36 === void 0 ? void 0 : _oProperty$annotation36.ISOCurrency) ? (_oProperty$annotation37 = oProperty.annotations) === null || _oProperty$annotation37 === void 0 ? void 0 : (_oProperty$annotation38 = _oProperty$annotation37.Measures) === null || _oProperty$annotation38 === void 0 ? void 0 : _oProperty$annotation38.ISOCurrency.path : undefined;
  };

  /**
   * Retrieves the Common.Text property path if it exists.
   *
   * @param oProperty The target property
   * @returns The Common.Text property path or undefined if it does not exist
   */
  _exports.getAssociatedCurrencyPropertyPath = getAssociatedCurrencyPropertyPath;
  const getAssociatedTextPropertyPath = function (oProperty) {
    var _oProperty$annotation39, _oProperty$annotation40, _oProperty$annotation41, _oProperty$annotation42;
    return isPathAnnotationExpression((_oProperty$annotation39 = oProperty.annotations) === null || _oProperty$annotation39 === void 0 ? void 0 : (_oProperty$annotation40 = _oProperty$annotation39.Common) === null || _oProperty$annotation40 === void 0 ? void 0 : _oProperty$annotation40.Text) ? (_oProperty$annotation41 = oProperty.annotations) === null || _oProperty$annotation41 === void 0 ? void 0 : (_oProperty$annotation42 = _oProperty$annotation41.Common) === null || _oProperty$annotation42 === void 0 ? void 0 : _oProperty$annotation42.Text.path : undefined;
  };

  /**
   * Check whether the property has a value help annotation defined or not.
   *
   * @param property The target property to be checked
   * @returns `true` if it has a value help
   */
  _exports.getAssociatedTextPropertyPath = getAssociatedTextPropertyPath;
  const hasValueHelp = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8;
    return !!((_property$annotations = property.annotations) !== null && _property$annotations !== void 0 && (_property$annotations2 = _property$annotations.Common) !== null && _property$annotations2 !== void 0 && _property$annotations2.ValueList) || !!((_property$annotations3 = property.annotations) !== null && _property$annotations3 !== void 0 && (_property$annotations4 = _property$annotations3.Common) !== null && _property$annotations4 !== void 0 && _property$annotations4.ValueListReferences) || !!((_property$annotations5 = property.annotations) !== null && _property$annotations5 !== void 0 && (_property$annotations6 = _property$annotations5.Common) !== null && _property$annotations6 !== void 0 && _property$annotations6.ValueListWithFixedValues) || !!((_property$annotations7 = property.annotations) !== null && _property$annotations7 !== void 0 && (_property$annotations8 = _property$annotations7.Common) !== null && _property$annotations8 !== void 0 && _property$annotations8.ValueListMapping);
  };

  /**
   * Check whether the property has a value help with fixed value annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelp = hasValueHelp;
  const hasValueHelpWithFixedValues = function (oProperty) {
    var _oProperty$annotation43, _oProperty$annotation44, _oProperty$annotation45;
    return !!(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation43 = oProperty.annotations) !== null && _oProperty$annotation43 !== void 0 && (_oProperty$annotation44 = _oProperty$annotation43.Common) !== null && _oProperty$annotation44 !== void 0 && (_oProperty$annotation45 = _oProperty$annotation44.ValueListWithFixedValues) !== null && _oProperty$annotation45 !== void 0 && _oProperty$annotation45.valueOf());
  };

  /**
   * Check whether the property has a value help for validation annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelpWithFixedValues = hasValueHelpWithFixedValues;
  const hasValueListForValidation = function (oProperty) {
    var _oProperty$annotation46, _oProperty$annotation47;
    return ((_oProperty$annotation46 = oProperty.annotations) === null || _oProperty$annotation46 === void 0 ? void 0 : (_oProperty$annotation47 = _oProperty$annotation46.Common) === null || _oProperty$annotation47 === void 0 ? void 0 : _oProperty$annotation47.ValueListForValidation) !== undefined;
  };
  _exports.hasValueListForValidation = hasValueListForValidation;
  const hasTimezone = function (oProperty) {
    var _oProperty$annotation48, _oProperty$annotation49;
    return ((_oProperty$annotation48 = oProperty.annotations) === null || _oProperty$annotation48 === void 0 ? void 0 : (_oProperty$annotation49 = _oProperty$annotation48.Common) === null || _oProperty$annotation49 === void 0 ? void 0 : _oProperty$annotation49.Timezone) !== undefined;
  };
  /**
   * Checks whether the property is a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a unit
   */
  _exports.hasTimezone = hasTimezone;
  const isUnit = function (property) {
    var _property$annotations9, _property$annotations10, _property$annotations11;
    return !!((_property$annotations9 = property.annotations) !== null && _property$annotations9 !== void 0 && (_property$annotations10 = _property$annotations9.Common) !== null && _property$annotations10 !== void 0 && (_property$annotations11 = _property$annotations10.IsUnit) !== null && _property$annotations11 !== void 0 && _property$annotations11.valueOf());
  };

  /**
   * Checks whether the property has a text property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Text
   */
  _exports.isUnit = isUnit;
  const hasText = function (property) {
    var _property$annotations12, _property$annotations13, _property$annotations14;
    return !!((_property$annotations12 = property.annotations) !== null && _property$annotations12 !== void 0 && (_property$annotations13 = _property$annotations12.Common) !== null && _property$annotations13 !== void 0 && (_property$annotations14 = _property$annotations13.Text) !== null && _property$annotations14 !== void 0 && _property$annotations14.valueOf());
  };

  /**
   * Checks whether the property has an ImageURL.
   *
   * @param property The property to be checked
   * @returns `true` if it is an ImageURL
   */
  _exports.hasText = hasText;
  const isImageURL = function (property) {
    var _property$annotations15, _property$annotations16, _property$annotations17;
    return !!((_property$annotations15 = property.annotations) !== null && _property$annotations15 !== void 0 && (_property$annotations16 = _property$annotations15.UI) !== null && _property$annotations16 !== void 0 && (_property$annotations17 = _property$annotations16.IsImageURL) !== null && _property$annotations17 !== void 0 && _property$annotations17.valueOf());
  };

  /**
   * Checks whether the property is a currency property.
   *
   * @param oProperty The property to be checked
   * @returns `true` if it is a currency
   */
  _exports.isImageURL = isImageURL;
  const isCurrency = function (oProperty) {
    var _oProperty$annotation50, _oProperty$annotation51, _oProperty$annotation52;
    return !!((_oProperty$annotation50 = oProperty.annotations) !== null && _oProperty$annotation50 !== void 0 && (_oProperty$annotation51 = _oProperty$annotation50.Common) !== null && _oProperty$annotation51 !== void 0 && (_oProperty$annotation52 = _oProperty$annotation51.IsCurrency) !== null && _oProperty$annotation52 !== void 0 && _oProperty$annotation52.valueOf());
  };

  /**
   * Checks whether the property has a currency property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a currency
   */
  _exports.isCurrency = isCurrency;
  const hasCurrency = function (property) {
    var _property$annotations18, _property$annotations19;
    return ((_property$annotations18 = property.annotations) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Measures) === null || _property$annotations19 === void 0 ? void 0 : _property$annotations19.ISOCurrency) !== undefined;
  };

  /**
   * Checks whether the property has a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a unit
   */
  _exports.hasCurrency = hasCurrency;
  const hasUnit = function (property) {
    var _property$annotations20, _property$annotations21;
    return ((_property$annotations20 = property.annotations) === null || _property$annotations20 === void 0 ? void 0 : (_property$annotations21 = _property$annotations20.Measures) === null || _property$annotations21 === void 0 ? void 0 : _property$annotations21.Unit) !== undefined;
  };

  /**
   * Checks whether the property type has Edm.Guid.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Guid
   */
  _exports.hasUnit = hasUnit;
  const isGuid = function (property) {
    return property.type === "Edm.Guid";
  };
  _exports.isGuid = isGuid;
  const hasStaticPercentUnit = function (oProperty) {
    var _oProperty$annotation53, _oProperty$annotation54, _oProperty$annotation55;
    return (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation53 = oProperty.annotations) === null || _oProperty$annotation53 === void 0 ? void 0 : (_oProperty$annotation54 = _oProperty$annotation53.Measures) === null || _oProperty$annotation54 === void 0 ? void 0 : (_oProperty$annotation55 = _oProperty$annotation54.Unit) === null || _oProperty$annotation55 === void 0 ? void 0 : _oProperty$annotation55.toString()) === "%";
  };
  _exports.hasStaticPercentUnit = hasStaticPercentUnit;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0NvbXB1dGVkIiwib1Byb3BlcnR5IiwiYW5ub3RhdGlvbnMiLCJDb3JlIiwiQ29tcHV0ZWQiLCJ2YWx1ZU9mIiwiaXNJbW11dGFibGUiLCJJbW11dGFibGUiLCJpc0tleSIsImlzU2VtYW50aWNLZXkiLCJwcm9wZXJ0eSIsImNvbnRleHREYXRhTW9kZWxPYmplY3QiLCJzZW1hbnRpY0tleXMiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiQ29tbW9uIiwiU2VtYW50aWNLZXkiLCJzb21lIiwia2V5IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImhhc0RhdGVUeXBlIiwiaW5kZXhPZiIsInR5cGUiLCJnZXRMYWJlbCIsIkxhYmVsIiwidG9TdHJpbmciLCJoYXNTZW1hbnRpY09iamVjdCIsIlNlbWFudGljT2JqZWN0SGVscGVyIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsIlRpbWV6b25lIiwidW5kZWZpbmVkIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwicGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkiLCJUZXh0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIk1lYXN1cmVzIiwiVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJJU09DdXJyZW5jeSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiaGFzVmFsdWVIZWxwIiwiVmFsdWVMaXN0IiwiVmFsdWVMaXN0UmVmZXJlbmNlcyIsIlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsIlZhbHVlTGlzdE1hcHBpbmciLCJoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJoYXNWYWx1ZUxpc3RGb3JWYWxpZGF0aW9uIiwiVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiIsImhhc1RpbWV6b25lIiwiaXNVbml0IiwiSXNVbml0IiwiaGFzVGV4dCIsImlzSW1hZ2VVUkwiLCJVSSIsIklzSW1hZ2VVUkwiLCJpc0N1cnJlbmN5IiwiSXNDdXJyZW5jeSIsImhhc0N1cnJlbmN5IiwiaGFzVW5pdCIsImlzR3VpZCIsImhhc1N0YXRpY1BlcmNlbnRVbml0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQcm9wZXJ0eUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFNlbWFudGljT2JqZWN0SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIHRoZSBDb3JlLkNvbXB1dGVkIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBpcyBjb21wdXRlZFxuICovXG5leHBvcnQgY29uc3QgaXNDb21wdXRlZCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29yZT8uQ29tcHV0ZWQ/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIHRoZSBDb3JlLkltbXV0YWJsZSBhbm5vdGF0aW9uIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCdzIGltbXV0YWJsZVxuICovXG5leHBvcnQgY29uc3QgaXNJbW11dGFibGUgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvcmU/LkltbXV0YWJsZT8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIGtleSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQncyBhIGtleVxuICovXG5leHBvcnQgY29uc3QgaXNLZXkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuaXNLZXk7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEgc2VtYW50aWNLZXkgZm9yIHRoZSBjb250ZXh0IGVudGl0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlcbiAqIEBwYXJhbSBjb250ZXh0RGF0YU1vZGVsT2JqZWN0IFRoZSBEYXRhTW9kZWxPYmplY3QgdGhhdCBob2xkcyB0aGUgY29udGV4dFxuICogQHJldHVybnMgYHRydWVgaWYgaXQncyBhIHNlbWFudGljIGtleVxuICovXG5leHBvcnQgY29uc3QgaXNTZW1hbnRpY0tleSA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHksIGNvbnRleHREYXRhTW9kZWxPYmplY3Q6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0Y29uc3Qgc2VtYW50aWNLZXlzID0gY29udGV4dERhdGFNb2RlbE9iamVjdC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVR5cGU/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljS2V5O1xuXHRyZXR1cm4gKFxuXHRcdHNlbWFudGljS2V5cz8uc29tZShmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5Py4kdGFyZ2V0Py5mdWxseVF1YWxpZmllZE5hbWUgPT09IHByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0XHR9KSA/PyBmYWxzZVxuXHQpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgZGF0ZSB0aW1lIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgb2YgdHlwZSBkYXRlIC8gZGF0ZXRpbWUgLyBkYXRldGltZW9mZnNldFxuICovXG5leHBvcnQgY29uc3QgaGFzRGF0ZVR5cGUgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gW1wiRWRtLkRhdGVcIiwgXCJFZG0uRGF0ZVRpbWVcIiwgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIl0uaW5kZXhPZihvUHJvcGVydHkudHlwZSkgIT09IC0xO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgbGFiZWwgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBsYWJlbCBzdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGdldExhYmVsID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpIHx8IFwiXCI7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIHNlbWFudGljIG9iamVjdCBkZWZpbmVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGhhcyBhIHNlbWFudGljIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgaGFzU2VtYW50aWNPYmplY3QgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBTZW1hbnRpY09iamVjdEhlbHBlci5oYXNTZW1hbnRpY09iamVjdChwcm9wZXJ0eSk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdGltZXpvbmUgcHJvcGVydHkgYXNzb2NpYXRlZCB0byB0aGUgcHJvcGVydHksIGlmIGFwcGxpY2FibGUuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdGltZXpvbmUgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpXG5cdFx0PyAob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lLiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB0aW1lem9uZSBwcm9wZXJ0eSBwYXRoIGFzc29jaWF0ZWQgdG8gdGhlIHByb3BlcnR5LCBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHRpbWV6b25lIHByb3BlcnR5IHBhdGgsIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSlcblx0XHQ/IG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU/LnBhdGhcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBhc3NvY2lhdGVkIHRleHQgcHJvcGVydHkgZm9yIHRoYXQgcHJvcGVydHksIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dClcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dC4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdW5pdCBwcm9wZXJ0eSBhc3NvY2lhdGVkIHRvIHRoZSBwcm9wZXJ0eSwgaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB1bml0IHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0KVxuXHRcdD8gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQuJHRhcmdldCBhcyB1bmtub3duIGFzIFByb3BlcnR5KVxuXHRcdDogdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpID8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdC5wYXRoIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFzc29jaWF0ZWQgY3VycmVuY3kgcHJvcGVydHkgZm9yIHRoYXQgcHJvcGVydHkgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHVuaXQgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSlcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeS4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpXG5cdFx0OiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5KVxuXHRcdD8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kucGF0aFxuXHRcdDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIENvbW1vbi5UZXh0IHByb3BlcnR5IHBhdGggaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIENvbW1vbi5UZXh0IHByb3BlcnR5IHBhdGggb3IgdW5kZWZpbmVkIGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0KSA/IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LnBhdGggOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIHZhbHVlIGhlbHAgYW5ub3RhdGlvbiBkZWZpbmVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdmFsdWUgaGVscFxuICovXG5leHBvcnQgY29uc3QgaGFzVmFsdWVIZWxwID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gKFxuXHRcdCEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0IHx8XG5cdFx0ISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RSZWZlcmVuY2VzIHx8XG5cdFx0ISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgfHxcblx0XHQhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdE1hcHBpbmdcblx0KTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCB3aXRoIGZpeGVkIHZhbHVlIGFubm90YXRpb24gZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdmFsdWUgaGVscFxuICovXG5leHBvcnQgY29uc3QgaGFzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBmb3IgdmFsaWRhdGlvbiBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGhhcyBhIHZhbHVlIGhlbHBcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1ZhbHVlTGlzdEZvclZhbGlkYXRpb24gPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdEZvclZhbGlkYXRpb24gIT09IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNUaW1lem9uZSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUgIT09IHVuZGVmaW5lZDtcbn07XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIHVuaXQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgYSB1bml0XG4gKi9cbmV4cG9ydCBjb25zdCBpc1VuaXQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzVW5pdD8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdGV4dCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIFRleHRcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1RleHQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQ/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhbiBJbWFnZVVSTC5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhbiBJbWFnZVVSTFxuICovXG5leHBvcnQgY29uc3QgaXNJbWFnZVVSTCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5Jc0ltYWdlVVJMPy52YWx1ZU9mKCk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIGN1cnJlbmN5IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIGN1cnJlbmN5XG4gKi9cbmV4cG9ydCBjb25zdCBpc0N1cnJlbmN5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzQ3VycmVuY3k/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIGN1cnJlbmN5IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGhhcyBhIGN1cnJlbmN5XG4gKi9cbmV4cG9ydCBjb25zdCBoYXNDdXJyZW5jeSA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIHByb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgIT09IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIHVuaXQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdW5pdFxuICovXG5cbmV4cG9ydCBjb25zdCBoYXNVbml0ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0ICE9PSB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSB0eXBlIGhhcyBFZG0uR3VpZC5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIEd1aWRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3VpZCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIHByb3BlcnR5LnR5cGUgPT09IFwiRWRtLkd1aWRcIjtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNTdGF0aWNQZXJjZW50VW5pdCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdD8udG9TdHJpbmcoKSA9PT0gXCIlXCI7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxVQUFVLEdBQUcsVUFBVUMsU0FBbUIsRUFBVztJQUFBO0lBQ2pFLE9BQU8sQ0FBQywyQkFBQ0EsU0FBUyxDQUFDQyxXQUFXLDRFQUFyQixzQkFBdUJDLElBQUksNkVBQTNCLHVCQUE2QkMsUUFBUSxtREFBckMsdUJBQXVDQyxPQUFPLEVB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