/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/CollaborationFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/situations/SituationsIndicator.block", "sap/ui/mdc/enum/EditMode", "../field/FieldHelper", "./field/FieldStructure"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingHelper, MetaModelConverter, CollaborationFormatters, valueFormatters, BindingToolkit, MetaModelFunction, ModelHelper, StableIdHelper, TypeGuards, DataModelPathHelper, PropertyHelper, UIFormatters, CommonHelper, FieldTemplating, SituationsIndicatorBlock, EditMode, FieldHelper, getFieldStructureTemplate) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28;
  var _exports = {};
  var isSemanticKey = PropertyHelper.isSemanticKey;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var generate = StableIdHelper.generate;
  var getRequiredPropertiesFromUpdateRestrictions = MetaModelFunction.getRequiredPropertiesFromUpdateRestrictions;
  var getRequiredPropertiesFromInsertRestrictions = MetaModelFunction.getRequiredPropertiesFromInsertRestrictions;
  var wrapBindingExpression = BindingToolkit.wrapBindingExpression;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var formatResult = BindingToolkit.formatResult;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var Entity = BindingHelper.Entity;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let InternalFieldBlock = (
  /**
   * Building block for creating a Field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:Field
   *   idPrefix="SomePrefix"
   *   contextPath="{entitySet>}"
   *   metaPath="{dataField>}"
   * />
   * </pre>
   *
   * @hideconstructor
   * @private
   * @experimental
   * @since 1.94.0
   */
  _dec = defineBuildingBlock({
    name: "Field",
    namespace: "sap.fe.macros.internal",
    designtime: "sap/fe/macros/internal/Field.designtime"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string"
  }), _dec9 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["Property"],
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec12 = blockAttribute({
    type: "sap.ui.mdc.enum.EditMode"
  }), _dec13 = blockAttribute({
    type: "boolean"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "string"
  }), _dec16 = blockAttribute({
    type: "sap.ui.core.TextAlign"
  }), _dec17 = blockAttribute({
    type: "string",
    required: false
  }), _dec18 = blockAttribute({
    type: "string"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean"
  }), _dec21 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.textAlignMode && !["Table", "Form"].includes(formatOptionsInput.textAlignMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.textAlignMode} for textAlignMode does not match`);
      }
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput.fieldMode && !["nowrapper", ""].includes(formatOptionsInput.fieldMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.fieldMode} for fieldMode does not match`);
      }
      if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      if (formatOptionsInput.textExpandBehaviorDisplay && !["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)) {
        throw new Error(`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`);
      }
      if (formatOptionsInput.semanticKeyStyle && !["ObjectIdentifier", "Label", ""].includes(formatOptionsInput.semanticKeyStyle)) {
        throw new Error(`Allowed value ${formatOptionsInput.semanticKeyStyle} for semanticKeyStyle does not match`);
      }
      if (typeof formatOptionsInput.isAnalytics === "string") {
        formatOptionsInput.isAnalytics = formatOptionsInput.isAnalytics === "true";
      }

      /*
      Historical default values are currently disabled
      if (!formatOptionsInput.semanticKeyStyle) {
      	formatOptionsInput.semanticKeyStyle = "";
      }
      */

      return formatOptionsInput;
    }
  }), _dec22 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec23 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec24 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec25 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec26 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec27 = blockAttribute({
    type: "boolean"
  }), _dec28 = blockAttribute({
    type: "string"
  }), _dec29 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(InternalFieldBlock, _BuildingBlockBase);
    /**
     * Metadata path to the entity set
     */
    /**
     * Flag indicating whether action will navigate after execution
     */
    /**
     * Metadata path to the dataField.
     * This property is usually a metadataContext pointing to a DataField having
     * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
     * But it can also be a Property with $kind="Property"
     */
    /**
     * Edit Mode of the field.
     *
     * If the editMode is undefined then we compute it based on the metadata
     * Otherwise we use the value provided here.
     */
    /**
     * Wrap field
     */
    /**
     * CSS class for margin
     */
    /**
     * Property added to associate the label with the Field
     */
    /**
     * Option to add a semantic object to a field
     */
    /**
     * Metadata path to the entity set.
     * This is used in inner fragments, so we need to declare it as block attribute context.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * Event handler for change event
     */
    // (start) Computed properties for Link.fragment.xml
    /* Display style common properties start */
    /* Edit style common properties end */
    InternalFieldBlock.getOverrides = function getOverrides(mControlConfiguration, sID) {
      const oProps = {};
      if (mControlConfiguration) {
        const oControlConfig = mControlConfiguration[sID];
        if (oControlConfig) {
          Object.keys(oControlConfig).forEach(function (sConfigKey) {
            oProps[sConfigKey] = oControlConfig[sConfigKey];
          });
        }
      }
      return oProps;
    };
    InternalFieldBlock.getIdentifierTitle = function getIdentifierTitle(fieldFormatOptions, oPropertyDataModelObjectPath, alwaysShowDescriptionAndValue) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _commonText$annotatio, _commonText$annotatio2;
      let propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      let targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      const commonText = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.Text;
      if (commonText === undefined) {
        // there is no property for description
        targetDisplayMode = "Value";
      }
      const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
      const parametersForFormatter = [];
      parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
      parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));
      if (!!((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb !== void 0 && (_oPropertyDataModelOb2 = _oPropertyDataModelOb.annotations) !== null && _oPropertyDataModelOb2 !== void 0 && (_oPropertyDataModelOb3 = _oPropertyDataModelOb2.Common) !== null && _oPropertyDataModelOb3 !== void 0 && _oPropertyDataModelOb3.DraftRoot) || !!((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb4 !== void 0 && (_oPropertyDataModelOb5 = _oPropertyDataModelOb4.annotations) !== null && _oPropertyDataModelOb5 !== void 0 && (_oPropertyDataModelOb6 = _oPropertyDataModelOb5.Common) !== null && _oPropertyDataModelOb6 !== void 0 && _oPropertyDataModelOb6.DraftNode)) {
        parametersForFormatter.push(Entity.HasDraft);
        parametersForFormatter.push(Entity.IsActive);
      } else {
        parametersForFormatter.push(constant(null));
        parametersForFormatter.push(constant(null));
      }
      switch (targetDisplayMode) {
        case "Value":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(constant(null));
          break;
        case "Description":
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          parametersForFormatter.push(constant(null));
          break;
        case "ValueDescription":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          break;
        default:
          if (commonText !== null && commonText !== void 0 && (_commonText$annotatio = commonText.annotations) !== null && _commonText$annotatio !== void 0 && (_commonText$annotatio2 = _commonText$annotatio.UI) !== null && _commonText$annotatio2 !== void 0 && _commonText$annotatio2.TextArrangement) {
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            parametersForFormatter.push(propertyBindingExpression);
          } else {
            // if DescriptionValue is set by default and not by TextArrangement
            // we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            if (alwaysShowDescriptionAndValue) {
              parametersForFormatter.push(propertyBindingExpression);
            } else {
              parametersForFormatter.push(constant(null));
            }
          }
          break;
      }
      return compileExpression(formatResult(parametersForFormatter, valueFormatters.formatIdentifierTitle));
    };
    InternalFieldBlock.getObjectIdentifierText = function getObjectIdentifierText(fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$3, _oPropertyDefinition$4, _commonText$annotatio3, _commonText$annotatio4;
      let propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      const targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      const commonText = (_oPropertyDefinition$3 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$3 === void 0 ? void 0 : (_oPropertyDefinition$4 = _oPropertyDefinition$3.Common) === null || _oPropertyDefinition$4 === void 0 ? void 0 : _oPropertyDefinition$4.Text;
      if (commonText === undefined || commonText !== null && commonText !== void 0 && (_commonText$annotatio3 = commonText.annotations) !== null && _commonText$annotatio3 !== void 0 && (_commonText$annotatio4 = _commonText$annotatio3.UI) !== null && _commonText$annotatio4 !== void 0 && _commonText$annotatio4.TextArrangement) {
        return undefined;
      }
      propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      switch (targetDisplayMode) {
        case "ValueDescription":
          const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
          return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation));
        case "DescriptionValue":
          return compileExpression(formatResult([propertyBindingExpression], valueFormatters.formatToKeepWhitespace));
        default:
          return undefined;
      }
    };
    InternalFieldBlock.setUpDataPointType = function setUpDataPointType(oDataField) {
      // data point annotations need not have $Type defined, so add it if missing
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.term) === "com.sap.vocabularies.UI.v1.DataPoint") {
        oDataField.$Type = oDataField.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
      }
    };
    InternalFieldBlock.setUpVisibleProperties = function setUpVisibleProperties(oFieldProps, oPropertyDataModelObjectPath) {
      // we do this before enhancing the dataModelPath so that it still points at the DataField
      oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
      oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
    };
    InternalFieldBlock.getContentId = function getContentId(sMacroId) {
      return `${sMacroId}-content`;
    };
    InternalFieldBlock.setUpEditableProperties = function setUpEditableProperties(oProps, oDataField, oDataModelPath, oMetaModel) {
      var _oDataModelPath$targe, _oProps$entitySet, _oProps$entitySet2;
      const oPropertyForFieldControl = oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe = oDataModelPath.targetObject) !== null && _oDataModelPath$targe !== void 0 && _oDataModelPath$targe.Value ? oDataModelPath.targetObject.Value : oDataModelPath === null || oDataModelPath === void 0 ? void 0 : oDataModelPath.targetObject;
      if (oProps.editMode !== undefined && oProps.editMode !== null) {
        // Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
        oProps.editModeAsObject = oProps.editMode;
      } else {
        const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode ? oProps.formatOptions.measureDisplayMode === "ReadOnly" : false;
        oProps.editModeAsObject = UIFormatters.getEditMode(oPropertyForFieldControl, oDataModelPath, bMeasureReadOnly, true, oDataField);
        oProps.editMode = compileExpression(oProps.editModeAsObject);
      }
      const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
      const aRequiredPropertiesFromInsertRestrictions = getRequiredPropertiesFromInsertRestrictions((_oProps$entitySet = oProps.entitySet) === null || _oProps$entitySet === void 0 ? void 0 : _oProps$entitySet.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const aRequiredPropertiesFromUpdateRestrictions = getRequiredPropertiesFromUpdateRestrictions((_oProps$entitySet2 = oProps.entitySet) === null || _oProps$entitySet2 === void 0 ? void 0 : _oProps$entitySet2.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const oRequiredProperties = {
        requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
        requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
      };
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel) && oProps.editMode !== EditMode.Display) {
        oProps.collaborationEnabled = true;
        // Expressions needed for Collaboration Visualization
        const collaborationExpression = UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.hasCollaborationActivity);
        oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
        oProps.collaborationInitialsExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials));
        oProps.collaborationColorExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor));
        oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));
        oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
      } else {
        oProps.editableExpression = compileExpression(editableExpression);
      }
      oProps.enabledExpression = UIFormatters.getEnabledExpression(oPropertyForFieldControl, oDataField, false, oDataModelPath);
      oProps.requiredExpression = UIFormatters.getRequiredExpression(oPropertyForFieldControl, oDataField, false, false, oRequiredProperties, oDataModelPath);
      if (oProps.idPrefix) {
        oProps.editStyleId = generate([oProps.idPrefix, "Field-edit"]);
      }
    };
    InternalFieldBlock.setUpFormatOptions = function setUpFormatOptions(oProps, oDataModelPath, oControlConfiguration, mSettings) {
      var _mSettings$models$vie;
      const oOverrideProps = InternalFieldBlock.getOverrides(oControlConfiguration, oProps.dataField.getPath());
      if (!oProps.formatOptions.displayMode) {
        oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
      }
      oProps.formatOptions.textLinesEdit = oOverrideProps.textLinesEdit || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit || oProps.formatOptions.textLinesEdit || 4;
      oProps.formatOptions.textMaxLines = oOverrideProps.textMaxLines || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines || oProps.formatOptions.textMaxLines;

      // Retrieve text from value list as fallback feature for missing text annotation on the property
      if ((_mSettings$models$vie = mSettings.models.viewData) !== null && _mSettings$models$vie !== void 0 && _mSettings$models$vie.getProperty("/retrieveTextFromValueList")) {
        oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(oDataModelPath.targetObject, oProps.formatOptions);
        if (oProps.formatOptions.retrieveTextFromValueList) {
          var _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4;
          // Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
          const hasEntityTextArrangement = !!(oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe2 !== void 0 && (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) !== null && _oDataModelPath$targe3 !== void 0 && (_oDataModelPath$targe4 = _oDataModelPath$targe3.UI) !== null && _oDataModelPath$targe4 !== void 0 && _oDataModelPath$targe4.TextArrangement);
          oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
        }
      }
      if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
        if (oProps._flexId) {
          oProps.noWrapperId = oProps._flexId;
        } else {
          oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
        }
      }
    };
    InternalFieldBlock.setUpDisplayStyle = function setUpDisplayStyle(oProps, oDataField, oDataModelPath) {
      var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation19, _oProperty$annotation20, _oDataField$Target, _oDataField$Target$$t, _oDataField$Target2, _oDataField$Target2$$, _oDataField$ActionTar, _oDataField$ActionTar2, _oProperty$annotation21, _oProperty$annotation22, _oProperty$annotation23, _oProperty$annotation24, _oProperty$annotation25, _oProperty$annotation26, _oProperty$annotation29, _oProperty$annotation30;
      const oProperty = oDataModelPath.targetObject;
      if (!oDataModelPath.targetObject) {
        oProps.displayStyle = "Text";
        return;
      }

      // TODO: This is used across different display style fragments and might be moved to dedicated functions
      oProps.hasUnitOrCurrency = ((_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Measures) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Unit) !== undefined || ((_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) !== undefined;
      oProps.hasValidAnalyticalCurrencyOrUnit = UIFormatters.hasValidAnalyticalCurrencyOrUnit(oDataModelPath);
      oProps.textFromValueList = wrapBindingExpression(compileExpression(fn("FieldRuntime.retrieveTextFromValueList", [pathInModel(getContextRelativeTargetObjectPath(oDataModelPath)), `/${oProperty.fullyQualifiedName}`, oProps.formatOptions.displayMode])), false);
      if (oProperty.type === "Edm.Stream") {
        var _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18;
        // Common
        oProps.displayStyle = "File";
        oProps.fileRelativePropertyPath = getContextRelativeTargetObjectPath(oDataModelPath);
        if ((_oProperty$annotation5 = oProperty.annotations.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.ContentDisposition) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.Filename) {
          var _oProperty$annotation7, _oProperty$annotation8;
          const fileNameDataModelPath = enhanceDataModelPath(oDataModelPath, (_oProperty$annotation7 = oProperty.annotations.Core) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.ContentDisposition) === null || _oProperty$annotation8 === void 0 ? void 0 : _oProperty$annotation8.Filename);
          // This causes an expression parsing error: compileExpression(pathInModel(getContextRelativeTargetObjectPath(fileNameDataModelPath)));
          oProps.fileFilenameExpression = "{ path: '" + getContextRelativeTargetObjectPath(fileNameDataModelPath) + "' }";
        }
        oProps.fileStreamNotEmpty = compileExpression(not(equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null)));

        // FileWrapper
        oProps.fileUploadUrl = FieldTemplating.getValueBinding(oDataModelPath, {});
        oProps.fileFilenamePath = (_oProperty$annotation9 = oProperty.annotations.Core) === null || _oProperty$annotation9 === void 0 ? void 0 : (_oProperty$annotation10 = _oProperty$annotation9.ContentDisposition) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Filename) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.path;
        oProps.fileMediaType = ((_oProperty$annotation12 = oProperty.annotations.Core) === null || _oProperty$annotation12 === void 0 ? void 0 : _oProperty$annotation12.MediaType) && compileExpression(getExpressionFromAnnotation((_oProperty$annotation13 = oProperty.annotations.Core) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.MediaType));

        // template:if
        oProps.fileIsImage = !!((_oProperty$annotation14 = oProperty.annotations.UI) !== null && _oProperty$annotation14 !== void 0 && _oProperty$annotation14.IsImageURL) || !!((_oProperty$annotation15 = oProperty.annotations.UI) !== null && _oProperty$annotation15 !== void 0 && _oProperty$annotation15.IsImage) || /image\//i.test(((_oProperty$annotation16 = oProperty.annotations.Core) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.MediaType) === null || _oProperty$annotation17 === void 0 ? void 0 : _oProperty$annotation17.toString()) ?? "");

        // Avatar
        oProps.fileAvatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});

        // Icon
        oProps.fileIconSrc = FieldHelper.getPathForIconSource(oProps.fileRelativePropertyPath);

        // Link
        oProps.fileLinkText = FieldHelper.getFilenameExpr(oProps.fileFilenameExpression, "{sap.fe.i18n>M_FIELD_FILEUPLOADER_NOFILENAME_TEXT}");
        oProps.fileLinkHref = FieldHelper.getDownloadUrl(oProps.fileUploadUrl ?? "");

        // Text
        oProps.fileTextVisible = compileExpression(equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null));

        // FileUploader
        if ((_oProperty$annotation18 = oProperty.annotations.Core) !== null && _oProperty$annotation18 !== void 0 && _oProperty$annotation18.AcceptableMediaTypes) {
          const acceptedTypes = Array.from(oProperty.annotations.Core.AcceptableMediaTypes).map(type => `'${type}'`);
          oProps.fileAcceptableMediaTypes = `{=odata.collection([${acceptedTypes.join(",")}])}`; // This does not feel right, but follows the logic of AnnotationHelper#value
        }

        oProps.fileMaximumSize = FieldHelper.calculateMBfromByte(oProperty.maxLength);
        return;
      }
      if ((_oProperty$annotation19 = oProperty.annotations) !== null && _oProperty$annotation19 !== void 0 && (_oProperty$annotation20 = _oProperty$annotation19.UI) !== null && _oProperty$annotation20 !== void 0 && _oProperty$annotation20.IsImageURL) {
        oProps.avatarVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
        oProps.avatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});
        oProps.displayStyle = "Avatar";
        return;
      }
      switch (oDataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataPointType":
          oProps.displayStyle = "DataPoint";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            oProps.displayStyle = "DataPoint";
            return;
          } else if (((_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : (_oDataField$Target2$$ = _oDataField$Target2.$target) === null || _oDataField$Target2$$ === void 0 ? void 0 : _oDataField$Target2$$.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            oProps.contactVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
            oProps.displayStyle = "Contact";
            return;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          //Qualms: the getObject is a bad practice, but for now it´s fine as an intermediate step to avoid refactoring of the helper in addition
          const dataFieldObject = oProps.dataField.getObject();
          oProps.buttonPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, dataFieldObject);
          oProps.displayStyle = "Button";

          // Gracefully handle non-existing actions
          if (oDataField.ActionTarget === undefined) {
            oProps.buttonIsBound = true;
            oProps.buttonOperationAvailable = "false";
            oProps.buttonOperationAvailableFormatted = "false";
            Log.warning(`Warning: The action '${oDataField.Action}' does not exist. The corresponding action button will be disabled.`);
            return;
          }
          oProps.buttonIsBound = oDataField.ActionTarget.isBound;
          oProps.buttonOperationAvailable = (_oDataField$ActionTar = oDataField.ActionTarget.annotations) === null || _oDataField$ActionTar === void 0 ? void 0 : (_oDataField$ActionTar2 = _oDataField$ActionTar.Core) === null || _oDataField$ActionTar2 === void 0 ? void 0 : _oDataField$ActionTar2.OperationAvailable;
          oProps.buttonOperationAvailableFormatted = undefined;
          if (oProps.buttonOperationAvailable) {
            const actionTarget = oDataField.ActionTarget;
            const bindingParamName = actionTarget.parameters[0].name;
            //QUALMS, needs to be checked whether this makes sense at that place, might be good in a dedicated helper function
            oProps.buttonOperationAvailableFormatted = compileExpression(getExpressionFromAnnotation(oProps.buttonOperationAvailable, [], undefined, path => {
              if (path.startsWith(bindingParamName)) {
                return path.replace(bindingParamName + "/", "");
              }
              return path;
            }));
          }
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          oProps.buttonPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject(), undefined, undefined);
          InternalFieldBlock.setUpNavigationAvailable(oProps, oDataField);
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
          oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
          oProps.linkIsDataFieldWithIntentBasedNavigation = true;
          oProps.linkPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject());
          oProps.displayStyle = "Link";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
          oProps.linkIsDataFieldWithNavigationPath = true;
          oProps.linkPress = `FieldRuntime.onDataFieldWithNavigationPath(\${$source>/}, $controller, '${oDataField.Target.value}')`;
          oProps.displayStyle = "Link";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          oProps.linkIsDataFieldWithAction = true;
          oProps.linkPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, oProps.dataField.getObject());
          oProps.displayStyle = "Link";
          return;
      }
      const hasQuickView = FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty);
      const hasSemanticObjects = !!FieldTemplating.getPropertyWithSemanticObject(oDataModelPath) || oProps.semanticObject !== undefined && oProps.semanticObject !== "";
      if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
        var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
        oProps.hasQuickView = hasQuickView || hasSemanticObjects;
        oProps.hasSituationsIndicator = SituationsIndicatorBlock.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
        InternalFieldBlock.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
        if ((_oDataModelPath$targe5 = oDataModelPath.targetEntitySet) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.Common) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.DraftRoot) {
          oProps.displayStyle = "SemanticKeyWithDraftIndicator";
          return;
        }
        oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
        return;
      }
      if (oDataField.Criticality) {
        oProps.hasQuickView = hasQuickView || hasSemanticObjects;
        oProps.displayStyle = "ObjectStatus";
        return;
      }
      if ((_oProperty$annotation21 = oProperty.annotations) !== null && _oProperty$annotation21 !== void 0 && (_oProperty$annotation22 = _oProperty$annotation21.Measures) !== null && _oProperty$annotation22 !== void 0 && _oProperty$annotation22.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true" && oProps.formatOptions.measureDisplayMode !== "Hidden") {
        oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(oDataModelPath, oProps.formatOptions, true, true, undefined, true);
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.displayStyle = "AmountWithCurrency";
        return;
      }
      if ((_oProperty$annotation23 = oProperty.annotations) !== null && _oProperty$annotation23 !== void 0 && (_oProperty$annotation24 = _oProperty$annotation23.Communication) !== null && _oProperty$annotation24 !== void 0 && _oProperty$annotation24.IsEmailAddress || (_oProperty$annotation25 = oProperty.annotations) !== null && _oProperty$annotation25 !== void 0 && (_oProperty$annotation26 = _oProperty$annotation25.Communication) !== null && _oProperty$annotation26 !== void 0 && _oProperty$annotation26.IsPhoneNumber) {
        var _oProperty$annotation27, _oProperty$annotation28;
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.linkIsEmailAddress = ((_oProperty$annotation27 = oProperty.annotations.Communication) === null || _oProperty$annotation27 === void 0 ? void 0 : _oProperty$annotation27.IsEmailAddress) !== undefined;
        oProps.linkIsPhoneNumber = ((_oProperty$annotation28 = oProperty.annotations.Communication) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.IsPhoneNumber) !== undefined;
        const propertyValueBinding = FieldTemplating.getValueBinding(oDataModelPath, {});
        if (oProps.linkIsEmailAddress) {
          oProps.linkUrl = `mailto:${propertyValueBinding}`;
        }
        if (oProps.linkIsPhoneNumber) {
          oProps.linkUrl = `tel:${propertyValueBinding}`;
        }
        oProps.displayStyle = "Link";
        return;
      }
      if ((_oProperty$annotation29 = oProperty.annotations) !== null && _oProperty$annotation29 !== void 0 && (_oProperty$annotation30 = _oProperty$annotation29.UI) !== null && _oProperty$annotation30 !== void 0 && _oProperty$annotation30.MultiLineText) {
        oProps.displayStyle = "ExpandableText";
        return;
      }
      if (hasQuickView || hasSemanticObjects) {
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.hasQuickView = true;
        oProps.displayStyle = "LinkWithQuickView";
        return;
      }
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        oProps.iconUrl = oDataField.IconUrl ? compileExpression(getExpressionFromAnnotation(oDataField.IconUrl)) : undefined;
        oProps.linkUrl = compileExpression(getExpressionFromAnnotation(oDataField.Url));
        return;
      }
      oProps.displayStyle = "Text";
    };
    InternalFieldBlock.setUpEditStyle = function setUpEditStyle(oProps, oDataField, oDataModelPath, appComponent) {
      FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
      oProps.fieldGroupIds = InternalFieldBlock.computeFieldGroupIds(oDataModelPath, appComponent);
    }

    /**
     * Calculate the fieldGroupIds for an Inputor other edit control.
     *
     * @param dataModelObjectPath
     * @param appComponent
     * @returns The value for fieldGroupIds
     */;
    InternalFieldBlock.computeFieldGroupIds = function computeFieldGroupIds(dataModelObjectPath, appComponent) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      if (!appComponent) {
        //for ValueHelp / Mass edit Templating the appComponent is not passed to the templating
        return "";
      }
      const sideEffectService = appComponent.getSideEffectsService();
      const fieldGroupIds = sideEffectService.computeFieldGroupIds(((_dataModelObjectPath$ = dataModelObjectPath.targetEntityType) === null || _dataModelObjectPath$ === void 0 ? void 0 : _dataModelObjectPath$.fullyQualifiedName) ?? "", ((_dataModelObjectPath$2 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.fullyQualifiedName) ?? "");
      const result = fieldGroupIds.join(",");
      return result === "" ? undefined : result;
    };
    InternalFieldBlock.setUpObjectIdentifierTitleAndText = function setUpObjectIdentifierTitleAndText(_oProps, oPropertyDataModelObjectPath) {
      var _oProps$formatOptions;
      if (((_oProps$formatOptions = _oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.semanticKeyStyle) === "ObjectIdentifier") {
        // if DescriptionValue is set by default and property has a quickView,  we show description and value in ObjectIdentifier Title
        const alwaysShowDescriptionAndValue = _oProps.hasQuickView;
        _oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath, alwaysShowDescriptionAndValue);
        if (!alwaysShowDescriptionAndValue) {
          _oProps.identifierText = InternalFieldBlock.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
        } else {
          _oProps.identifierText = undefined;
        }
      } else {
        _oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath, true);
        _oProps.identifierText = undefined;
      }
    };
    InternalFieldBlock.getTextWithWhiteSpace = function getTextWithWhiteSpace(formatOptions, oDataModelPath) {
      const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
      return text._type === "PathInModel" || typeof text === "string" ? compileExpression(formatResult([text], "WSR")) : compileExpression(text);
    };
    InternalFieldBlock.setUpNavigationAvailable = function setUpNavigationAvailable(oProps, oDataField) {
      oProps.navigationAvailable = true;
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && oDataField.NavigationAvailable !== undefined && String(oProps.formatOptions.ignoreNavigationAvailable) !== "true") {
        oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
      }
    };
    function InternalFieldBlock(props, controlConfiguration, settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "dataSourcePath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "emptyIndicatorMode", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_apiId", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noWrapperId", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigateAfterAction", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataField", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editMode", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "wrap", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "class", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "textAlign", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredExpression", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showErrorObjectStatus", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entityType", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "annotationPath", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "property", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpProperty", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataPoint", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_vhFlexId", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor28, _assertThisInitialized(_this));
      _this.hasQuickView = false;
      _this.linkUrl = undefined;
      _this.linkIsDataFieldWithIntentBasedNavigation = false;
      _this.linkIsDataFieldWithNavigationPath = false;
      _this.linkIsDataFieldWithAction = false;
      _this.linkIsEmailAddress = false;
      _this.linkIsPhoneNumber = false;
      _this.linkPress = undefined;
      _this.fileFilenameExpression = undefined;
      _this.fileAcceptableMediaTypes = undefined;
      _this.hasUnitOrCurrency = undefined;
      _this.hasValidAnalyticalCurrencyOrUnit = undefined;
      _this.textFromValueList = undefined;
      const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.dataField);
      let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.dataField, _this.entitySet);
      InternalFieldBlock.setUpDataPointType(oDataFieldConverted);
      InternalFieldBlock.setUpVisibleProperties(_assertThisInitialized(_this), oDataModelPath);
      if (_this._flexId) {
        _this._apiId = _this._flexId;
        _this._flexId = InternalFieldBlock.getContentId(_this._flexId);
        _this._vhFlexId = `${_this._flexId}_${_this.vhIdPrefix}`;
      }
      const valueDataModelPath = FieldTemplating.getDataModelObjectPathForValue(oDataModelPath);
      oDataModelPath = valueDataModelPath || oDataModelPath;
      _this.dataSourcePath = getTargetObjectPath(oDataModelPath);
      const oMetaModel = settings.models.metaModel || settings.models.entitySet;
      _this.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);
      InternalFieldBlock.setUpEditableProperties(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath, oMetaModel);
      InternalFieldBlock.setUpFormatOptions(_assertThisInitialized(_this), oDataModelPath, controlConfiguration, settings);
      InternalFieldBlock.setUpDisplayStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath);
      InternalFieldBlock.setUpEditStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath, settings.appComponent);

      // ---------------------------------------- compute bindings----------------------------------------------------
      const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
      if (_this.displayStyle && aDisplayStylesWithoutPropText.indexOf(_this.displayStyle) === -1 && oDataModelPath.targetObject) {
        _this.text = _this.text ?? FieldTemplating.getTextBinding(oDataModelPath, _this.formatOptions);
      } else {
        _this.text = "";
      }
      _this.emptyIndicatorMode = _this.formatOptions.showEmptyIndicator ? "On" : undefined;
      _this.computeFieldContentContexts(oMetaModel, oDataFieldConverted);
      return _this;
    }

    /**
     * Computes and updates metadata contexts that were previously added in FieldContent.fragment.xml using template:with instructions.
     *
     * @param metaModel
     * @param dataFieldConverted
     */
    _exports = InternalFieldBlock;
    var _proto = InternalFieldBlock.prototype;
    _proto.computeFieldContentContexts = function computeFieldContentContexts(metaModel, dataFieldConverted) {
      var _dataFieldConverted$a, _dataFieldConverted$a2, _dataFieldConverted$$;
      if (isProperty(dataFieldConverted) && ((_dataFieldConverted$a = dataFieldConverted.annotations) === null || _dataFieldConverted$a === void 0 ? void 0 : (_dataFieldConverted$a2 = _dataFieldConverted$a.UI) === null || _dataFieldConverted$a2 === void 0 ? void 0 : _dataFieldConverted$a2.DataFieldDefault) !== undefined) {
        // We are looking at a property, so we need to use its default data field
        this.dataField = metaModel.createBindingContext(`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`, this.dataField);
        dataFieldConverted = MetaModelConverter.convertMetaModelContext(this.dataField);
      }
      switch ((_dataFieldConverted$$ = dataFieldConverted.$Type) === null || _dataFieldConverted$$ === void 0 ? void 0 : _dataFieldConverted$$.valueOf()) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          this.property = metaModel.createBindingContext("Value", this.dataField);
          this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property));
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          this.annotationPath = metaModel.createBindingContext("Target/$AnnotationPath", this.dataField);
          this.dataPoint = this.annotationPath;
          this.property = metaModel.createBindingContext("Value", this.annotationPath);
          this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property));
          break;
        case "com.sap.vocabularies.UI.v1.DataPointType":
          this.annotationPath = this.dataField;
          this.dataPoint = this.dataField;
          this.property = metaModel.createBindingContext("Value", this.dataField);
          this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property));
          break;
      }
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      const displayStyles = ["Button", "ExpandableText", "Avatar", "Contact", "File", "DataPoint"];
      const editStyles = ["CheckBox"];
      if (displayStyles.includes(this.displayStyle) || editStyles.includes(this.editStyle)) {
        //intermediate state, will be fixed once everything has been moved out of fieldcontent calculation
        return getFieldStructureTemplate(this);
      }
      if (this.formatOptions.fieldMode === "nowrapper" && this.editMode === EditMode.Display) {
        return xml`<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />`;
      } else {
        let id;
        if (this._apiId) {
          id = this._apiId;
        } else if (this.idPrefix) {
          id = generate([this.idPrefix, "Field"]);
        } else {
          id = undefined;
        }
        if (this.onChange !== null && this.onChange !== "null") {
          return xml`
					<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						change="${this.onChange}"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
				`;
        } else {
          return xml`<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
					`;
        }
      }
    };
    return InternalFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dataSourcePath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "emptyIndicatorMode", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_apiId", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "noWrapperId", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FieldValueHelp";
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigateAfterAction", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "dataField", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "wrap", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "class", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "requiredExpression", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "showErrorObjectStatus", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "entityType", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "annotationPath", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpProperty", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "dataPoint", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "_vhFlexId", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = InternalFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEZpZWxkQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImRlc2lnbnRpbWUiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJleHBlY3RlZEFubm90YXRpb25UeXBlcyIsInZhbGlkYXRlIiwiZm9ybWF0T3B0aW9uc0lucHV0IiwidGV4dEFsaWduTW9kZSIsImluY2x1ZGVzIiwiRXJyb3IiLCJkaXNwbGF5TW9kZSIsImZpZWxkTW9kZSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkiLCJzZW1hbnRpY0tleVN0eWxlIiwiaXNBbmFseXRpY3MiLCJibG9ja0V2ZW50IiwiZ2V0T3ZlcnJpZGVzIiwibUNvbnRyb2xDb25maWd1cmF0aW9uIiwic0lEIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWciLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNDb25maWdLZXkiLCJnZXRJZGVudGlmaWVyVGl0bGUiLCJmaWVsZEZvcm1hdE9wdGlvbnMiLCJvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwiYWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWUiLCJwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwidGFyZ2V0RGlzcGxheU1vZGUiLCJvUHJvcGVydHlEZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsImZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24iLCJjb21tb25UZXh0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwidW5kZWZpbmVkIiwicmVsYXRpdmVMb2NhdGlvbiIsImdldFJlbGF0aXZlUGF0aHMiLCJwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyIiwicHVzaCIsInRhcmdldEVudGl0eVNldCIsIkRyYWZ0Um9vdCIsIkRyYWZ0Tm9kZSIsIkVudGl0eSIsIkhhc0RyYWZ0IiwiSXNBY3RpdmUiLCJjb25zdGFudCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwiY29tcGlsZUV4cHJlc3Npb24iLCJmb3JtYXRSZXN1bHQiLCJ2YWx1ZUZvcm1hdHRlcnMiLCJmb3JtYXRJZGVudGlmaWVyVGl0bGUiLCJnZXRPYmplY3RJZGVudGlmaWVyVGV4dCIsImZvcm1hdFRvS2VlcFdoaXRlc3BhY2UiLCJzZXRVcERhdGFQb2ludFR5cGUiLCJvRGF0YUZpZWxkIiwidGVybSIsIiRUeXBlIiwic2V0VXBWaXNpYmxlUHJvcGVydGllcyIsIm9GaWVsZFByb3BzIiwidmlzaWJsZSIsIkZpZWxkVGVtcGxhdGluZyIsImdldFZpc2libGVFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsImRpc3BsYXlWaXNpYmxlIiwiZ2V0Q29udGVudElkIiwic01hY3JvSWQiLCJzZXRVcEVkaXRhYmxlUHJvcGVydGllcyIsIm9EYXRhTW9kZWxQYXRoIiwib01ldGFNb2RlbCIsIm9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCIsIlZhbHVlIiwiZWRpdE1vZGUiLCJlZGl0TW9kZUFzT2JqZWN0IiwiYk1lYXN1cmVSZWFkT25seSIsIlVJRm9ybWF0dGVycyIsImdldEVkaXRNb2RlIiwiZWRpdGFibGVFeHByZXNzaW9uIiwiZ2V0RWRpdGFibGVFeHByZXNzaW9uQXNPYmplY3QiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJnZXRQYXRoIiwicmVwbGFjZUFsbCIsImFSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyIsIm9SZXF1aXJlZFByb3BlcnRpZXMiLCJyZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwicmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJFZGl0TW9kZSIsIkRpc3BsYXkiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsImNvbGxhYm9yYXRpb25FeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24iLCJDb2xsYWJvcmF0aW9uRm9ybWF0dGVycyIsImhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eSIsImNvbGxhYm9yYXRpb25IYXNBY3Rpdml0eUV4cHJlc3Npb24iLCJjb2xsYWJvcmF0aW9uSW5pdGlhbHNFeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5SW5pdGlhbHMiLCJjb2xsYWJvcmF0aW9uQ29sb3JFeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IiLCJhbmQiLCJub3QiLCJpZkVsc2UiLCJlbmFibGVkRXhwcmVzc2lvbiIsImdldEVuYWJsZWRFeHByZXNzaW9uIiwicmVxdWlyZWRFeHByZXNzaW9uIiwiZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwiaWRQcmVmaXgiLCJlZGl0U3R5bGVJZCIsImdlbmVyYXRlIiwic2V0VXBGb3JtYXRPcHRpb25zIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwib092ZXJyaWRlUHJvcHMiLCJkYXRhRmllbGQiLCJnZXREaXNwbGF5TW9kZSIsInRleHRMaW5lc0VkaXQiLCJ0ZXh0TWF4TGluZXMiLCJtb2RlbHMiLCJ2aWV3RGF0YSIsImdldFByb3BlcnR5IiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQiLCJoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiX2ZsZXhJZCIsIm5vV3JhcHBlcklkIiwic2V0VXBEaXNwbGF5U3R5bGUiLCJvUHJvcGVydHkiLCJkaXNwbGF5U3R5bGUiLCJoYXNVbml0T3JDdXJyZW5jeSIsIk1lYXN1cmVzIiwiVW5pdCIsIklTT0N1cnJlbmN5IiwiaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQiLCJ0ZXh0RnJvbVZhbHVlTGlzdCIsIndyYXBCaW5kaW5nRXhwcmVzc2lvbiIsImZuIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiZmlsZVJlbGF0aXZlUHJvcGVydHlQYXRoIiwiQ29yZSIsIkNvbnRlbnREaXNwb3NpdGlvbiIsIkZpbGVuYW1lIiwiZmlsZU5hbWVEYXRhTW9kZWxQYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJmaWxlRmlsZW5hbWVFeHByZXNzaW9uIiwiZmlsZVN0cmVhbU5vdEVtcHR5IiwiZXF1YWwiLCJmaWxlVXBsb2FkVXJsIiwiZ2V0VmFsdWVCaW5kaW5nIiwiZmlsZUZpbGVuYW1lUGF0aCIsInBhdGgiLCJmaWxlTWVkaWFUeXBlIiwiTWVkaWFUeXBlIiwiZmlsZUlzSW1hZ2UiLCJJc0ltYWdlVVJMIiwiSXNJbWFnZSIsInRlc3QiLCJ0b1N0cmluZyIsImZpbGVBdmF0YXJTcmMiLCJmaWxlSWNvblNyYyIsIkZpZWxkSGVscGVyIiwiZ2V0UGF0aEZvckljb25Tb3VyY2UiLCJmaWxlTGlua1RleHQiLCJnZXRGaWxlbmFtZUV4cHIiLCJmaWxlTGlua0hyZWYiLCJnZXREb3dubG9hZFVybCIsImZpbGVUZXh0VmlzaWJsZSIsIkFjY2VwdGFibGVNZWRpYVR5cGVzIiwiYWNjZXB0ZWRUeXBlcyIsIkFycmF5IiwiZnJvbSIsIm1hcCIsImZpbGVBY2NlcHRhYmxlTWVkaWFUeXBlcyIsImpvaW4iLCJmaWxlTWF4aW11bVNpemUiLCJjYWxjdWxhdGVNQmZyb21CeXRlIiwibWF4TGVuZ3RoIiwiYXZhdGFyVmlzaWJsZSIsImF2YXRhclNyYyIsIlRhcmdldCIsImNvbnRhY3RWaXNpYmxlIiwiZGF0YUZpZWxkT2JqZWN0IiwiZ2V0T2JqZWN0IiwiYnV0dG9uUHJlc3MiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uIiwiQWN0aW9uVGFyZ2V0IiwiYnV0dG9uSXNCb3VuZCIsImJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZSIsImJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZUZvcm1hdHRlZCIsIkxvZyIsIndhcm5pbmciLCJBY3Rpb24iLCJpc0JvdW5kIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwiYWN0aW9uVGFyZ2V0IiwiYmluZGluZ1BhcmFtTmFtZSIsInBhcmFtZXRlcnMiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsIkNvbW1vbkhlbHBlciIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsInNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZSIsInRleHQiLCJnZXRUZXh0V2l0aFdoaXRlU3BhY2UiLCJsaW5rSXNEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwibGlua1ByZXNzIiwibGlua0lzRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoIiwidmFsdWUiLCJsaW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uIiwiaGFzUXVpY2tWaWV3IiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsImhhc1NlbWFudGljT2JqZWN0cyIsImdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3QiLCJpc1NlbWFudGljS2V5IiwiaGFzU2l0dWF0aW9uc0luZGljYXRvciIsIlNpdHVhdGlvbnNJbmRpY2F0b3JCbG9jayIsImdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkiLCJzZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQiLCJDcml0aWNhbGl0eSIsIlN0cmluZyIsImlzQ3VycmVuY3lBbGlnbmVkIiwidmFsdWVBc1N0cmluZ0JpbmRpbmdFeHByZXNzaW9uIiwidW5pdEJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiQ29tbXVuaWNhdGlvbiIsIklzRW1haWxBZGRyZXNzIiwiSXNQaG9uZU51bWJlciIsImxpbmtJc0VtYWlsQWRkcmVzcyIsImxpbmtJc1Bob25lTnVtYmVyIiwicHJvcGVydHlWYWx1ZUJpbmRpbmciLCJsaW5rVXJsIiwiTXVsdGlMaW5lVGV4dCIsImljb25VcmwiLCJJY29uVXJsIiwiVXJsIiwic2V0VXBFZGl0U3R5bGUiLCJhcHBDb21wb25lbnQiLCJzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIiwiZmllbGRHcm91cElkcyIsImNvbXB1dGVGaWVsZEdyb3VwSWRzIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsInNpZGVFZmZlY3RTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVzdWx0IiwiX29Qcm9wcyIsImlkZW50aWZpZXJUaXRsZSIsImlkZW50aWZpZXJUZXh0IiwiZ2V0VGV4dEJpbmRpbmciLCJfdHlwZSIsIm5hdmlnYXRpb25BdmFpbGFibGUiLCJOYXZpZ2F0aW9uQXZhaWxhYmxlIiwiaWdub3JlTmF2aWdhdGlvbkF2YWlsYWJsZSIsInByb3BzIiwiY29udHJvbENvbmZpZ3VyYXRpb24iLCJzZXR0aW5ncyIsIm9EYXRhRmllbGRDb252ZXJ0ZWQiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIl9hcGlJZCIsIl92aEZsZXhJZCIsInZoSWRQcmVmaXgiLCJ2YWx1ZURhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUiLCJkYXRhU291cmNlUGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJtZXRhTW9kZWwiLCJlbnRpdHlUeXBlIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJhRGlzcGxheVN0eWxlc1dpdGhvdXRQcm9wVGV4dCIsImluZGV4T2YiLCJlbXB0eUluZGljYXRvck1vZGUiLCJzaG93RW1wdHlJbmRpY2F0b3IiLCJjb21wdXRlRmllbGRDb250ZW50Q29udGV4dHMiLCJkYXRhRmllbGRDb252ZXJ0ZWQiLCJpc1Byb3BlcnR5IiwiRGF0YUZpZWxkRGVmYXVsdCIsInZhbHVlT2YiLCJwcm9wZXJ0eSIsInZhbHVlSGVscFByb3BlcnR5IiwiYW5ub3RhdGlvblBhdGgiLCJkYXRhUG9pbnQiLCJnZXRUZW1wbGF0ZSIsImRpc3BsYXlTdHlsZXMiLCJlZGl0U3R5bGVzIiwiZWRpdFN0eWxlIiwiZ2V0RmllbGRTdHJ1Y3R1cmVUZW1wbGF0ZSIsInhtbCIsImlkIiwib25DaGFuZ2UiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxGaWVsZC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiwgRW50aXR5U2V0LCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgYmxvY2tFdmVudCwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncywgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgKiBhcyBDb2xsYWJvcmF0aW9uRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9Db2xsYWJvcmF0aW9uRm9ybWF0dGVyXCI7XG5pbXBvcnQgdmFsdWVGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1ZhbHVlRm9ybWF0dGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRmbixcblx0Zm9ybWF0UmVzdWx0LFxuXHRmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uLFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0bm90LFxuXHRwYXRoSW5Nb2RlbCxcblx0d3JhcEJpbmRpbmdFeHByZXNzaW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiwgU3RyaWN0UHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQge1xuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zLFxuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGlzUHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQge1xuXHREYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRlbmhhbmNlRGF0YU1vZGVsUGF0aCxcblx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCxcblx0Z2V0UmVsYXRpdmVQYXRocyxcblx0Z2V0VGFyZ2V0T2JqZWN0UGF0aFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eU9yUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBpc1NlbWFudGljS2V5IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCAqIGFzIFVJRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBGaWVsZFRlbXBsYXRpbmcgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgU2l0dWF0aW9uc0luZGljYXRvckJsb2NrIGZyb20gXCJzYXAvZmUvbWFjcm9zL3NpdHVhdGlvbnMvU2l0dWF0aW9uc0luZGljYXRvci5ibG9ja1wiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcIi4uL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgZ2V0RmllbGRTdHJ1Y3R1cmVUZW1wbGF0ZSBmcm9tIFwiLi9maWVsZC9GaWVsZFN0cnVjdHVyZVwiO1xuXG50eXBlIERpc3BsYXlTdHlsZSA9XG5cdHwgXCJUZXh0XCJcblx0fCBcIkF2YXRhclwiXG5cdHwgXCJGaWxlXCJcblx0fCBcIkRhdGFQb2ludFwiXG5cdHwgXCJDb250YWN0XCJcblx0fCBcIkJ1dHRvblwiXG5cdHwgXCJMaW5rXCJcblx0fCBcIk9iamVjdFN0YXR1c1wiXG5cdHwgXCJBbW91bnRXaXRoQ3VycmVuY3lcIlxuXHR8IFwiU2VtYW50aWNLZXlXaXRoRHJhZnRJbmRpY2F0b3JcIlxuXHR8IFwiT2JqZWN0SWRlbnRpZmllclwiXG5cdHwgXCJMYWJlbFNlbWFudGljS2V5XCJcblx0fCBcIkxpbmtXaXRoUXVpY2tWaWV3XCJcblx0fCBcIkV4cGFuZGFibGVUZXh0XCI7XG5cbnR5cGUgRWRpdFN0eWxlID1cblx0fCBcIklucHV0V2l0aFZhbHVlSGVscFwiXG5cdHwgXCJUZXh0QXJlYVwiXG5cdHwgXCJGaWxlXCJcblx0fCBcIkRhdGVQaWNrZXJcIlxuXHR8IFwiVGltZVBpY2tlclwiXG5cdHwgXCJEYXRlVGltZVBpY2tlclwiXG5cdHwgXCJDaGVja0JveFwiXG5cdHwgXCJJbnB1dFdpdGhVbml0XCJcblx0fCBcIklucHV0XCJcblx0fCBcIlJhdGluZ0luZGljYXRvclwiO1xuXG50eXBlIEZpZWxkRm9ybWF0T3B0aW9ucyA9IFBhcnRpYWw8e1xuXHRkaXNwbGF5TW9kZTogRGlzcGxheU1vZGU7XG5cdGZpZWxkTW9kZTogc3RyaW5nO1xuXHRoYXNEcmFmdEluZGljYXRvcjogYm9vbGVhbjtcblx0aXNBbmFseXRpY3M6IGJvb2xlYW47XG5cdC8qKiBJZiB0cnVlIHRoZW4gbmF2aWdhdGlvbmF2YWlsYWJsZSBwcm9wZXJ0eSB3aWxsIG5vdCBiZSB1c2VkIGZvciBlbmFibGVtZW50IG9mIElCTiBidXR0b24gKi9cblx0aWdub3JlTmF2aWdhdGlvbkF2YWlsYWJsZTogYm9vbGVhbjtcblx0aXNDdXJyZW5jeUFsaWduZWQ6IGJvb2xlYW47XG5cdG1lYXN1cmVEaXNwbGF5TW9kZTogc3RyaW5nO1xuXHQvKiogRW5hYmxlcyB0aGUgZmFsbGJhY2sgZmVhdHVyZSBmb3IgdXNhZ2UgdGhlIHRleHQgYW5ub3RhdGlvbiBmcm9tIHRoZSB2YWx1ZSBsaXN0cyAqL1xuXHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBib29sZWFuO1xuXHRzZW1hbnRpY2tleXM6IHN0cmluZ1tdO1xuXHQvKiogUHJlZmVycmVkIGNvbnRyb2wgdG8gdmlzdWFsaXplIHNlbWFudGljIGtleSBwcm9wZXJ0aWVzICovXG5cdHNlbWFudGljS2V5U3R5bGU6IHN0cmluZztcblx0LyoqIElmIHNldCB0byAndHJ1ZScsIFNBUCBGaW9yaSBlbGVtZW50cyBzaG93cyBhbiBlbXB0eSBpbmRpY2F0b3IgaW4gZGlzcGxheSBtb2RlIGZvciB0aGUgdGV4dCBhbmQgbGlua3MgKi9cblx0c2hvd0VtcHR5SW5kaWNhdG9yOiBib29sZWFuO1xuXHQvKiogSWYgdHJ1ZSB0aGVuIHNldHMgdGhlIGdpdmVuIGljb24gaW5zdGVhZCBvZiB0ZXh0IGluIEFjdGlvbi9JQk4gQnV0dG9uICovXG5cdHNob3dJY29uVXJsOiBib29sZWFuO1xuXHQvKiogRGVzY3JpYmUgaG93IHRoZSBhbGlnbm1lbnQgd29ya3MgYmV0d2VlbiBUYWJsZSBtb2RlIChEYXRlIGFuZCBOdW1lcmljIEVuZCBhbGlnbm1lbnQpIGFuZCBGb3JtIG1vZGUgKG51bWVyaWMgYWxpZ25lZCBFbmQgaW4gZWRpdCBhbmQgQmVnaW4gaW4gZGlzcGxheSkgKi9cblx0dGV4dEFsaWduTW9kZTogc3RyaW5nO1xuXHQvKiogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgZm9yIG11bHRpbGluZSB0ZXh0cyBpbiBlZGl0IG1vZGUgKi9cblx0dGV4dExpbmVzRWRpdDogc3RyaW5nO1xuXHQvKiogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgdGhhdCBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlIGNhbiBncm93IHRvICovXG5cdHRleHRNYXhMaW5lczogc3RyaW5nO1xuXHRjb21wYWN0U2VtYW50aWNLZXk6IHN0cmluZztcblx0ZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdGZpZWxkR3JvdXBOYW1lOiBzdHJpbmc7XG5cdHRleHRNYXhMZW5ndGg6IG51bWJlcjtcblx0LyoqIE1heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0ZXh0IGZpZWxkIHRoYXQgYXJlIHNob3duIGluaXRpYWxseS4gKi9cblx0dGV4dE1heENoYXJhY3RlcnNEaXNwbGF5OiBudW1iZXI7XG5cdC8qKiBEZWZpbmVzIGhvdyB0aGUgZnVsbCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkIC0gSW5QbGFjZSBvciBQb3BvdmVyICovXG5cdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk6IHN0cmluZztcblx0ZGF0ZUZvcm1hdE9wdGlvbnM/OiBVSUZvcm1hdHRlcnMuZGF0ZUZvcm1hdE9wdGlvbnM7IC8vIHNob3dUaW1lIGhlcmUgaXMgdXNlZCBmb3IgdGV4dCBmb3JtYXR0aW5nIG9ubHlcbn0+O1xuXG5leHBvcnQgdHlwZSBGaWVsZFByb3BlcnRpZXMgPSBTdHJpY3RQcm9wZXJ0aWVzT2Y8SW50ZXJuYWxGaWVsZEJsb2NrPjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWVsZCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBVc3VhbGx5LCBhIERhdGFGaWVsZCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiA8aW50ZXJuYWxNYWNybzpGaWVsZFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICBjb250ZXh0UGF0aD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIG1ldGFQYXRoPVwie2RhdGFGaWVsZD59XCJcbiAqIC8+XG4gKiA8L3ByZT5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuOTQuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRmllbGRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ZpZWxkLmRlc2lnbnRpbWVcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVybmFsRmllbGRCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBkYXRhU291cmNlUGF0aD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGVtcHR5SW5kaWNhdG9yTW9kZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIF9mbGV4SWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBpZFByZWZpeD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIF9hcGlJZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIG5vV3JhcHBlcklkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgdmhJZFByZWZpeDogc3RyaW5nID0gXCJGaWVsZFZhbHVlSGVscFwiO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdHB1YmxpYyBlbnRpdHlTZXQhOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciBhY3Rpb24gd2lsbCBuYXZpZ2F0ZSBhZnRlciBleGVjdXRpb25cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cHVibGljIG5hdmlnYXRlQWZ0ZXJBY3Rpb246IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGQuXG5cdCAqIFRoaXMgcHJvcGVydHkgaXMgdXN1YWxseSBhIG1ldGFkYXRhQ29udGV4dCBwb2ludGluZyB0byBhIERhdGFGaWVsZCBoYXZpbmdcblx0ICogJFR5cGUgb2YgRGF0YUZpZWxkLCBEYXRhRmllbGRXaXRoVXJsLCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uLCBEYXRhRmllbGRGb3JBY3Rpb24sIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLCBvciBEYXRhUG9pbnRUeXBlLlxuXHQgKiBCdXQgaXQgY2FuIGFsc28gYmUgYSBQcm9wZXJ0eSB3aXRoICRraW5kPVwiUHJvcGVydHlcIlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiXG5cdFx0XVxuXHR9KVxuXHRwdWJsaWMgZGF0YUZpZWxkITogQ29udGV4dDtcblxuXHQvKipcblx0ICogRWRpdCBNb2RlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogSWYgdGhlIGVkaXRNb2RlIGlzIHVuZGVmaW5lZCB0aGVuIHdlIGNvbXB1dGUgaXQgYmFzZWQgb24gdGhlIG1ldGFkYXRhXG5cdCAqIE90aGVyd2lzZSB3ZSB1c2UgdGhlIHZhbHVlIHByb3ZpZGVkIGhlcmUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1kYy5lbnVtLkVkaXRNb2RlXCJcblx0fSlcblx0cHVibGljIGVkaXRNb2RlPzogRWRpdE1vZGUgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogV3JhcCBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRwdWJsaWMgd3JhcD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENTUyBjbGFzcyBmb3IgbWFyZ2luXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGNsYXNzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIEZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGFyaWFMYWJlbGxlZEJ5Pzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkuY29yZS5UZXh0QWxpZ25cIlxuXHR9KVxuXHRwdWJsaWMgdGV4dEFsaWduPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gdG8gYWRkIGEgc2VtYW50aWMgb2JqZWN0IHRvIGEgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogZmFsc2Vcblx0fSlcblx0cHVibGljIHNlbWFudGljT2JqZWN0Pzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgcmVxdWlyZWRFeHByZXNzaW9uPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cHVibGljIHZpc2libGU/OiBib29sZWFuIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0c2hvd0Vycm9yT2JqZWN0U3RhdHVzPzogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGZvcm1hdE9wdGlvbnNJbnB1dDogRmllbGRGb3JtYXRPcHRpb25zKSB7XG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0LnRleHRBbGlnbk1vZGUgJiYgIVtcIlRhYmxlXCIsIFwiRm9ybVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQudGV4dEFsaWduTW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LnRleHRBbGlnbk1vZGV9IGZvciB0ZXh0QWxpZ25Nb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlICYmXG5cdFx0XHRcdCFbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZX0gZm9yIGRpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQuZmllbGRNb2RlICYmICFbXCJub3dyYXBwZXJcIiwgXCJcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmZpZWxkTW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LmZpZWxkTW9kZX0gZm9yIGZpZWxkTW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSAmJiAhW1wiSGlkZGVuXCIsIFwiUmVhZE9ubHlcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZX0gZm9yIG1lYXN1cmVEaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC50ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5ICYmXG5cdFx0XHRcdCFbXCJJblBsYWNlXCIsIFwiUG9wb3ZlclwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0YEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheX0gZm9yIHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkgZG9lcyBub3QgbWF0Y2hgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSAmJiAhW1wiT2JqZWN0SWRlbnRpZmllclwiLCBcIkxhYmVsXCIsIFwiXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5zZW1hbnRpY0tleVN0eWxlKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZX0gZm9yIHNlbWFudGljS2V5U3R5bGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBmb3JtYXRPcHRpb25zSW5wdXQuaXNBbmFseXRpY3MgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LmlzQW5hbHl0aWNzID0gZm9ybWF0T3B0aW9uc0lucHV0LmlzQW5hbHl0aWNzID09PSBcInRydWVcIjtcblx0XHRcdH1cblxuXHRcdFx0Lypcblx0XHRcdEhpc3RvcmljYWwgZGVmYXVsdCB2YWx1ZXMgYXJlIGN1cnJlbnRseSBkaXNhYmxlZFxuXHRcdFx0aWYgKCFmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSkge1xuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHQqL1xuXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc0lucHV0O1xuXHRcdH1cblx0fSlcblx0cHVibGljIGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0LlxuXHQgKiBUaGlzIGlzIHVzZWQgaW4gaW5uZXIgZnJhZ21lbnRzLCBzbyB3ZSBuZWVkIHRvIGRlY2xhcmUgaXQgYXMgYmxvY2sgYXR0cmlidXRlIGNvbnRleHQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHR9KVxuXHRlbnRpdHlUeXBlPzogQ29udGV4dDtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGFubm90YXRpb25QYXRoPzogQ29udGV4dDtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdHByb3BlcnR5PzogQ29udGV4dDtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdHZhbHVlSGVscFByb3BlcnR5PzogQ29udGV4dDtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGRhdGFQb2ludD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdXNlZCBpbiBpbm5lciBmcmFnbWVudHMsIHNvIHdlIG5lZWQgdG8gZGVjbGFyZSBpdCBhcyBibG9jayBhdHRyaWJ1dGUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGNvbGxhYm9yYXRpb25FbmFibGVkPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRfdmhGbGV4SWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGNoYW5nZSBldmVudFxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNoYW5nZT86IHN0cmluZztcblxuXHQvLyBDb21wdXRlZCBwcm9wZXJ0aWVzXG5cblx0ZWRpdGFibGVFeHByZXNzaW9uOiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRlbmFibGVkRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkhhc0FjdGl2aXR5RXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkNvbG9yRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZGVzY3JpcHRpb25CaW5kaW5nRXhwcmVzc2lvbj86IHN0cmluZztcblxuXHRkaXNwbGF5VmlzaWJsZT86IHN0cmluZyB8IGJvb2xlYW47XG5cblx0ZWRpdE1vZGVBc09iamVjdD86IGFueTtcblxuXHRlZGl0U3R5bGU/OiBFZGl0U3R5bGUgfCBudWxsO1xuXG5cdGhhc1F1aWNrVmlldyA9IGZhbHNlO1xuXG5cdG5hdmlnYXRpb25BdmFpbGFibGU/OiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdHNob3dUaW1lem9uZT86IGJvb2xlYW47XG5cblx0dGV4dD86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0aWRlbnRpZmllclRpdGxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0aWRlbnRpZmllclRleHQ/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHR0ZXh0QmluZGluZ0V4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHR1bml0QmluZGluZ0V4cHJlc3Npb24/OiBzdHJpbmc7XG5cblx0dW5pdEVkaXRhYmxlPzogc3RyaW5nO1xuXG5cdHZhbHVlQmluZGluZ0V4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHR2YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvLyAoc3RhcnQpIENvbXB1dGVkIHByb3BlcnRpZXMgZm9yIExpbmsuZnJhZ21lbnQueG1sXG5cblx0bGlua1VybD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXG5cdGxpbmtJc0RhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRsaW5rSXNEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRsaW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cblx0bGlua0lzRW1haWxBZGRyZXNzOiBib29sZWFuID0gZmFsc2U7XG5cblx0bGlua0lzUGhvbmVOdW1iZXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRsaW5rUHJlc3M/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiA9IHVuZGVmaW5lZDtcblxuXHQvLyAoZW5kKSBDb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBMaW5rLmZyYWdtZW50LnhtbFxuXG5cdGljb25Vcmw/OiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRkaXNwbGF5U3R5bGU/OiBEaXNwbGF5U3R5bGUgfCBudWxsO1xuXG5cdGhhc1NpdHVhdGlvbnNJbmRpY2F0b3I/OiBib29sZWFuO1xuXG5cdGF2YXRhclZpc2libGU/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRhdmF0YXJTcmM/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvLyAoc3RhcnQpIENvbXB1dGVkIHByb3BlcnRpZXMgZm9yIEZpbGUuZnJhZ21lbnQueG1sXG5cblx0ZmlsZVJlbGF0aXZlUHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXG5cdGZpbGVGaWxlbmFtZUV4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiA9IHVuZGVmaW5lZDtcblxuXHRmaWxlU3RyZWFtTm90RW1wdHk/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRmaWxlVXBsb2FkVXJsPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZUZpbGVuYW1lUGF0aD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVNZWRpYVR5cGU/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRmaWxlSXNJbWFnZT86IGJvb2xlYW47XG5cblx0ZmlsZUF2YXRhclNyYz86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVJY29uU3JjPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZUxpbmtUZXh0PzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZUxpbmtIcmVmPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZVRleHRWaXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZUFjY2VwdGFibGVNZWRpYVR5cGVzPzogc3RyaW5nID0gdW5kZWZpbmVkO1xuXG5cdGZpbGVNYXhpbXVtU2l6ZT86IHN0cmluZztcblxuXHQvLyAoZW5kKSBDb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBGaWxlLmZyYWdtZW50LnhtbFxuXG5cdGNvbnRhY3RWaXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0YnV0dG9uUHJlc3M/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRidXR0b25Jc0JvdW5kPzogc3RyaW5nIHwgYm9vbGVhbjtcblxuXHRidXR0b25PcGVyYXRpb25BdmFpbGFibGU/OiBzdHJpbmc7XG5cblx0YnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlRm9ybWF0dGVkPzogc3RyaW5nO1xuXG5cdGZpZWxkR3JvdXBJZHM/OiBzdHJpbmc7XG5cblx0dGV4dEFyZWFQbGFjZWhvbGRlcj86IHN0cmluZztcblxuXHQvKiBEaXNwbGF5IHN0eWxlIGNvbW1vbiBwcm9wZXJ0aWVzIHN0YXJ0ICovXG5cdGhhc1VuaXRPckN1cnJlbmN5PzogYm9vbGVhbiA9IHVuZGVmaW5lZDtcblxuXHRoYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXG5cdHRleHRGcm9tVmFsdWVMaXN0PzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cdC8qIEFtb3VudFdpdGggY3VycmVuY3kgZnJhZ21lbnQgZW5kICovXG5cblx0LyogRWRpdCBzdHlsZSBjb21tb24gcHJvcGVydGllcyBzdGFydCAqL1xuXHRlZGl0U3R5bGVJZD86IHN0cmluZztcblx0LyogRWRpdCBzdHlsZSBjb21tb24gcHJvcGVydGllcyBlbmQgKi9cblxuXHRzdGF0aWMgZ2V0T3ZlcnJpZGVzKG1Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBzSUQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Qcm9wczogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XG5cdFx0aWYgKG1Db250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xDb25maWcgPSBtQ29udHJvbENvbmZpZ3VyYXRpb25bc0lEXTtcblx0XHRcdGlmIChvQ29udHJvbENvbmZpZykge1xuXHRcdFx0XHRPYmplY3Qua2V5cyhvQ29udHJvbENvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoc0NvbmZpZ0tleSkge1xuXHRcdFx0XHRcdG9Qcm9wc1tzQ29uZmlnS2V5XSA9IG9Db250cm9sQ29uZmlnW3NDb25maWdLZXldO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxuXG5cdHN0YXRpYyBnZXRJZGVudGlmaWVyVGl0bGUoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRhbHdheXNTaG93RGVzY3JpcHRpb25BbmRWYWx1ZTogYm9vbGVhblxuXHQpOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdFx0bGV0IHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gcGF0aEluTW9kZWwoXG5cdFx0XHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpXG5cdFx0KTtcblx0XHRsZXQgdGFyZ2V0RGlzcGxheU1vZGUgPSBmaWVsZEZvcm1hdE9wdGlvbnM/LmRpc3BsYXlNb2RlO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eURlZmluaXRpb24gPVxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kdGFyZ2V0IGFzIFByb3BlcnR5KVxuXHRcdFx0XHQ6IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk7XG5cdFx0cHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbiA9IGZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24ob1Byb3BlcnR5RGVmaW5pdGlvbiwgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cblx0XHRjb25zdCBjb21tb25UZXh0ID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRcdGlmIChjb21tb25UZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vIHByb3BlcnR5IGZvciBkZXNjcmlwdGlvblxuXHRcdFx0dGFyZ2V0RGlzcGxheU1vZGUgPSBcIlZhbHVlXCI7XG5cdFx0fVxuXHRcdGNvbnN0IHJlbGF0aXZlTG9jYXRpb24gPSBnZXRSZWxhdGl2ZVBhdGhzKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXG5cdFx0Y29uc3QgcGFyYW1ldGVyc0ZvckZvcm1hdHRlciA9IFtdO1xuXG5cdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHBhdGhJbk1vZGVsKFwiVF9ORVdfT0JKRUNUXCIsIFwic2FwLmZlLmkxOG5cIikpO1xuXHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwYXRoSW5Nb2RlbChcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVfTk9fSEVBREVSX0lORk9cIiwgXCJzYXAuZmUuaTE4blwiKSk7XG5cblx0XHRpZiAoXG5cdFx0XHQhIShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdFJvb3QgfHxcblx0XHRcdCEhKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Tm9kZVxuXHRcdCkge1xuXHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKEVudGl0eS5IYXNEcmFmdCk7XG5cdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goRW50aXR5LklzQWN0aXZlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChjb25zdGFudChudWxsKSk7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICh0YXJnZXREaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPik7XG5cdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChjb25zdGFudChudWxsKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNvbW1vblRleHQsIHJlbGF0aXZlTG9jYXRpb24pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAoY29tbW9uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiBEZXNjcmlwdGlvblZhbHVlIGlzIHNldCBieSBkZWZhdWx0IGFuZCBub3QgYnkgVGV4dEFycmFuZ2VtZW50XG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdyBkZXNjcmlwdGlvbiBpbiBPYmplY3RJZGVudGlmaWVyIFRpdGxlIGFuZCB2YWx1ZSBpbiBPYmplY3RJZGVudGlmaWVyIFRleHRcblx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGlmIChhbHdheXNTaG93RGVzY3JpcHRpb25BbmRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goY29uc3RhbnQobnVsbCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyIGFzIGFueSwgdmFsdWVGb3JtYXR0ZXJzLmZvcm1hdElkZW50aWZpZXJUaXRsZSkpO1xuXHR9XG5cblx0c3RhdGljIGdldE9iamVjdElkZW50aWZpZXJUZXh0KFxuXHRcdGZpZWxkRm9ybWF0T3B0aW9uczogRmllbGRGb3JtYXRPcHRpb25zLFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcblx0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdGxldCBwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiA9IHBhdGhJbk1vZGVsKFxuXHRcdFx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKVxuXHRcdCk7XG5cdFx0Y29uc3QgdGFyZ2V0RGlzcGxheU1vZGUgPSBmaWVsZEZvcm1hdE9wdGlvbnM/LmRpc3BsYXlNb2RlO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eURlZmluaXRpb24gPVxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kdGFyZ2V0IGFzIFByb3BlcnR5KVxuXHRcdFx0XHQ6IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk7XG5cblx0XHRjb25zdCBjb21tb25UZXh0ID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRcdGlmIChjb21tb25UZXh0ID09PSB1bmRlZmluZWQgfHwgY29tbW9uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24gPSBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uKG9Qcm9wZXJ0eURlZmluaXRpb24sIHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXG5cdFx0c3dpdGNoICh0YXJnZXREaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0Y29uc3QgcmVsYXRpdmVMb2NhdGlvbiA9IGdldFJlbGF0aXZlUGF0aHMob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pO1xuXHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChbcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbl0sIHZhbHVlRm9ybWF0dGVycy5mb3JtYXRUb0tlZXBXaGl0ZXNwYWNlKSk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBzZXRVcERhdGFQb2ludFR5cGUob0RhdGFGaWVsZDogYW55KSB7XG5cdFx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdFx0aWYgKG9EYXRhRmllbGQ/LnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpIHtcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPSBvRGF0YUZpZWxkLiRUeXBlIHx8IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHNldFVwVmlzaWJsZVByb3BlcnRpZXMob0ZpZWxkUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdC8vIHdlIGRvIHRoaXMgYmVmb3JlIGVuaGFuY2luZyB0aGUgZGF0YU1vZGVsUGF0aCBzbyB0aGF0IGl0IHN0aWxsIHBvaW50cyBhdCB0aGUgRGF0YUZpZWxkXG5cdFx0b0ZpZWxkUHJvcHMudmlzaWJsZSA9IEZpZWxkVGVtcGxhdGluZy5nZXRWaXNpYmxlRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvRmllbGRQcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRvRmllbGRQcm9wcy5kaXNwbGF5VmlzaWJsZSA9IG9GaWVsZFByb3BzLmZvcm1hdE9wdGlvbnMuZmllbGRNb2RlID09PSBcIm5vd3JhcHBlclwiID8gb0ZpZWxkUHJvcHMudmlzaWJsZSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdHN0YXRpYyBnZXRDb250ZW50SWQoc01hY3JvSWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBgJHtzTWFjcm9JZH0tY29udGVudGA7XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBFZGl0YWJsZVByb3BlcnRpZXMob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhRmllbGQ6IGFueSwgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIG9NZXRhTW9kZWw6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRPYmplY3Q/LlZhbHVlXG5cdFx0XHQ/IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdC5WYWx1ZVxuXHRcdFx0OiBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0O1xuXHRcdGlmIChvUHJvcHMuZWRpdE1vZGUgIT09IHVuZGVmaW5lZCAmJiBvUHJvcHMuZWRpdE1vZGUgIT09IG51bGwpIHtcblx0XHRcdC8vIEV2ZW4gaWYgaXQgcHJvdmlkZWQgYXMgYSBzdHJpbmcgaXQncyBhIHZhbGlkIHBhcnQgb2YgYSBiaW5kaW5nIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgbGF0ZXIgY29tYmluZWQgaW50byBzb21ldGhpbmcgZWxzZS5cblx0XHRcdG9Qcm9wcy5lZGl0TW9kZUFzT2JqZWN0ID0gb1Byb3BzLmVkaXRNb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBiTWVhc3VyZVJlYWRPbmx5ID0gb1Byb3BzLmZvcm1hdE9wdGlvbnMubWVhc3VyZURpc3BsYXlNb2RlXG5cdFx0XHRcdD8gb1Byb3BzLmZvcm1hdE9wdGlvbnMubWVhc3VyZURpc3BsYXlNb2RlID09PSBcIlJlYWRPbmx5XCJcblx0XHRcdFx0OiBmYWxzZTtcblxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlQXNPYmplY3QgPSBVSUZvcm1hdHRlcnMuZ2V0RWRpdE1vZGUoXG5cdFx0XHRcdG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCxcblx0XHRcdFx0b0RhdGFNb2RlbFBhdGgsXG5cdFx0XHRcdGJNZWFzdXJlUmVhZE9ubHksXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdG9EYXRhRmllbGRcblx0XHRcdCk7XG5cdFx0XHRvUHJvcHMuZWRpdE1vZGUgPSBjb21waWxlRXhwcmVzc2lvbihvUHJvcHMuZWRpdE1vZGVBc09iamVjdCk7XG5cdFx0fVxuXHRcdGNvbnN0IGVkaXRhYmxlRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRFZGl0YWJsZUV4cHJlc3Npb25Bc09iamVjdChvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wsIG9EYXRhRmllbGQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyA9IGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMoXG5cdFx0XHRvUHJvcHMuZW50aXR5U2V0Py5nZXRQYXRoKCkucmVwbGFjZUFsbChcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIiwgXCIvXCIpLFxuXHRcdFx0b01ldGFNb2RlbFxuXHRcdCk7XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMgPSBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zKFxuXHRcdFx0b1Byb3BzLmVudGl0eVNldD8uZ2V0UGF0aCgpLnJlcGxhY2VBbGwoXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvXCIsIFwiL1wiKSxcblx0XHRcdG9NZXRhTW9kZWxcblx0XHQpO1xuXHRcdGNvbnN0IG9SZXF1aXJlZFByb3BlcnRpZXMgPSB7XG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zOiBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyxcblx0XHRcdHJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnM6IGFSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zXG5cdFx0fTtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCkgJiYgb1Byb3BzLmVkaXRNb2RlICE9PSBFZGl0TW9kZS5EaXNwbGF5KSB7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkVuYWJsZWQgPSB0cnVlO1xuXHRcdFx0Ly8gRXhwcmVzc2lvbnMgbmVlZGVkIGZvciBDb2xsYWJvcmF0aW9uIFZpc3VhbGl6YXRpb25cblx0XHRcdGNvbnN0IGNvbGxhYm9yYXRpb25FeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25FeHByZXNzaW9uKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0Q29sbGFib3JhdGlvbkZvcm1hdHRlcnMuaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5XG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmNvbGxhYm9yYXRpb25IYXNBY3Rpdml0eUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbik7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRVSUZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgsIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzKVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5jb2xsYWJvcmF0aW9uQ29sb3JFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFVJRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uRXhwcmVzc2lvbihvRGF0YU1vZGVsUGF0aCwgQ29sbGFib3JhdGlvbkZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IpXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmVkaXRhYmxlRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKGFuZChlZGl0YWJsZUV4cHJlc3Npb24sIG5vdChjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbikpKTtcblxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlID0gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGNvbGxhYm9yYXRpb25FeHByZXNzaW9uLCBjb25zdGFudChcIlJlYWRPbmx5XCIpLCBvUHJvcHMuZWRpdE1vZGVBc09iamVjdCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuZWRpdGFibGVFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oZWRpdGFibGVFeHByZXNzaW9uKTtcblx0XHR9XG5cdFx0b1Byb3BzLmVuYWJsZWRFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldEVuYWJsZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdG9Qcm9wcy5yZXF1aXJlZEV4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0UmVxdWlyZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRvUmVxdWlyZWRQcm9wZXJ0aWVzLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdFx0aWYgKG9Qcm9wcy5pZFByZWZpeCkge1xuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZUlkID0gZ2VuZXJhdGUoW29Qcm9wcy5pZFByZWZpeCwgXCJGaWVsZC1lZGl0XCJdKTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBGb3JtYXRPcHRpb25zKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgb0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55KSB7XG5cdFx0Y29uc3Qgb092ZXJyaWRlUHJvcHMgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0T3ZlcnJpZGVzKG9Db250cm9sQ29uZmlndXJhdGlvbiwgb1Byb3BzLmRhdGFGaWVsZC5nZXRQYXRoKCkpO1xuXG5cdFx0aWYgKCFvUHJvcHMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZSkge1xuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgPSBVSUZvcm1hdHRlcnMuZ2V0RGlzcGxheU1vZGUob0RhdGFNb2RlbFBhdGgpO1xuXHRcdH1cblx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TGluZXNFZGl0ID1cblx0XHRcdG9PdmVycmlkZVByb3BzLnRleHRMaW5lc0VkaXQgfHxcblx0XHRcdChvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zICYmIG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMudGV4dExpbmVzRWRpdCkgfHxcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXQgfHxcblx0XHRcdDQ7XG5cdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzID1cblx0XHRcdG9PdmVycmlkZVByb3BzLnRleHRNYXhMaW5lcyB8fFxuXHRcdFx0KG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMgJiYgb092ZXJyaWRlUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGluZXMpIHx8XG5cdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGluZXM7XG5cblx0XHQvLyBSZXRyaWV2ZSB0ZXh0IGZyb20gdmFsdWUgbGlzdCBhcyBmYWxsYmFjayBmZWF0dXJlIGZvciBtaXNzaW5nIHRleHQgYW5ub3RhdGlvbiBvbiB0aGUgcHJvcGVydHlcblx0XHRpZiAobVNldHRpbmdzLm1vZGVscy52aWV3RGF0YT8uZ2V0UHJvcGVydHkoXCIvcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFwiKSkge1xuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9IEZpZWxkVGVtcGxhdGluZy5pc1JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RFbmFibGVkKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QsXG5cdFx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QpIHtcblx0XHRcdFx0Ly8gQ29uc2lkZXIgVGV4dEFycmFuZ2VtZW50IGF0IEVudGl0eVR5cGUgb3RoZXJ3aXNlIHNldCBkZWZhdWx0IGRpc3BsYXkgZm9ybWF0ICdEZXNjcmlwdGlvblZhbHVlJ1xuXHRcdFx0XHRjb25zdCBoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQgPSAhIW9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudDtcblx0XHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgPSBoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQgPyBvUHJvcHMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZSA6IFwiRGVzY3JpcHRpb25WYWx1ZVwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob1Byb3BzLmZvcm1hdE9wdGlvbnMuZmllbGRNb2RlID09PSBcIm5vd3JhcHBlclwiICYmIG9Qcm9wcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIpIHtcblx0XHRcdGlmIChvUHJvcHMuX2ZsZXhJZCkge1xuXHRcdFx0XHRvUHJvcHMubm9XcmFwcGVySWQgPSBvUHJvcHMuX2ZsZXhJZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9wcy5ub1dyYXBwZXJJZCA9IG9Qcm9wcy5pZFByZWZpeCA/IGdlbmVyYXRlKFtvUHJvcHMuaWRQcmVmaXgsIFwiRmllbGQtY29udGVudFwiXSkgOiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHNldFVwRGlzcGxheVN0eWxlKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5OiBQcm9wZXJ0eSA9IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRpZiAoIW9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiVGV4dFwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFRPRE86IFRoaXMgaXMgdXNlZCBhY3Jvc3MgZGlmZmVyZW50IGRpc3BsYXkgc3R5bGUgZnJhZ21lbnRzIGFuZCBtaWdodCBiZSBtb3ZlZCB0byBkZWRpY2F0ZWQgZnVuY3Rpb25zXG5cdFx0b1Byb3BzLmhhc1VuaXRPckN1cnJlbmN5ID1cblx0XHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQgIT09IHVuZGVmaW5lZCB8fCBvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSAhPT0gdW5kZWZpbmVkO1xuXHRcdG9Qcm9wcy5oYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdCA9IFVJRm9ybWF0dGVycy5oYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdChvRGF0YU1vZGVsUGF0aCk7XG5cdFx0b1Byb3BzLnRleHRGcm9tVmFsdWVMaXN0ID0gd3JhcEJpbmRpbmdFeHByZXNzaW9uKFxuXHRcdFx0Y29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGZuKFwiRmllbGRSdW50aW1lLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RcIiwgW1xuXHRcdFx0XHRcdHBhdGhJbk1vZGVsKGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob0RhdGFNb2RlbFBhdGgpKSxcblx0XHRcdFx0XHRgLyR7b1Byb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZX1gLFxuXHRcdFx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlXG5cdFx0XHRcdF0pXG5cdFx0XHQpIGFzIHN0cmluZyxcblx0XHRcdGZhbHNlXG5cdFx0KTtcblxuXHRcdGlmIChvUHJvcGVydHkudHlwZSA9PT0gXCJFZG0uU3RyZWFtXCIpIHtcblx0XHRcdC8vIENvbW1vblxuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRmlsZVwiO1xuXHRcdFx0b1Byb3BzLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aCA9IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlPy5Db250ZW50RGlzcG9zaXRpb24/LkZpbGVuYW1lKSB7XG5cdFx0XHRcdGNvbnN0IGZpbGVOYW1lRGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKFxuXHRcdFx0XHRcdG9EYXRhTW9kZWxQYXRoLFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlPy5Db250ZW50RGlzcG9zaXRpb24/LkZpbGVuYW1lIGFzIFByb3BlcnR5T3JQYXRoPFByb3BlcnR5PlxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyBUaGlzIGNhdXNlcyBhbiBleHByZXNzaW9uIHBhcnNpbmcgZXJyb3I6IGNvbXBpbGVFeHByZXNzaW9uKHBhdGhJbk1vZGVsKGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgoZmlsZU5hbWVEYXRhTW9kZWxQYXRoKSkpO1xuXHRcdFx0XHRvUHJvcHMuZmlsZUZpbGVuYW1lRXhwcmVzc2lvbiA9IFwieyBwYXRoOiAnXCIgKyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGZpbGVOYW1lRGF0YU1vZGVsUGF0aCkgKyBcIicgfVwiO1xuXHRcdFx0fVxuXHRcdFx0b1Byb3BzLmZpbGVTdHJlYW1Ob3RFbXB0eSA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRub3QoZXF1YWwocGF0aEluTW9kZWwoYCR7b1Byb3BzLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aH1Ab2RhdGEubWVkaWFDb250ZW50VHlwZWApLCBudWxsKSlcblx0XHRcdCk7XG5cblx0XHRcdC8vIEZpbGVXcmFwcGVyXG5cdFx0XHRvUHJvcHMuZmlsZVVwbG9hZFVybCA9IEZpZWxkVGVtcGxhdGluZy5nZXRWYWx1ZUJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIHt9KTtcblx0XHRcdG9Qcm9wcy5maWxlRmlsZW5hbWVQYXRoID0gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlPy5Db250ZW50RGlzcG9zaXRpb24/LkZpbGVuYW1lIGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxzdHJpbmc+KT8ucGF0aDtcblx0XHRcdG9Qcm9wcy5maWxlTWVkaWFUeXBlID1cblx0XHRcdFx0b1Byb3BlcnR5LmFubm90YXRpb25zLkNvcmU/Lk1lZGlhVHlwZSAmJlxuXHRcdFx0XHRjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob1Byb3BlcnR5LmFubm90YXRpb25zLkNvcmU/Lk1lZGlhVHlwZSkpO1xuXG5cdFx0XHQvLyB0ZW1wbGF0ZTppZlxuXHRcdFx0b1Byb3BzLmZpbGVJc0ltYWdlID1cblx0XHRcdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnMuVUk/LklzSW1hZ2VVUkwgfHxcblx0XHRcdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnMuVUk/LklzSW1hZ2UgfHxcblx0XHRcdFx0L2ltYWdlXFwvL2kudGVzdChvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29yZT8uTWVkaWFUeXBlPy50b1N0cmluZygpID8/IFwiXCIpO1xuXG5cdFx0XHQvLyBBdmF0YXJcblx0XHRcdG9Qcm9wcy5maWxlQXZhdGFyU3JjID0gRmllbGRUZW1wbGF0aW5nLmdldFZhbHVlQmluZGluZyhvRGF0YU1vZGVsUGF0aCwge30pO1xuXG5cdFx0XHQvLyBJY29uXG5cdFx0XHRvUHJvcHMuZmlsZUljb25TcmMgPSBGaWVsZEhlbHBlci5nZXRQYXRoRm9ySWNvblNvdXJjZShvUHJvcHMuZmlsZVJlbGF0aXZlUHJvcGVydHlQYXRoKTtcblxuXHRcdFx0Ly8gTGlua1xuXHRcdFx0b1Byb3BzLmZpbGVMaW5rVGV4dCA9IEZpZWxkSGVscGVyLmdldEZpbGVuYW1lRXhwcihcblx0XHRcdFx0b1Byb3BzLmZpbGVGaWxlbmFtZUV4cHJlc3Npb24sXG5cdFx0XHRcdFwie3NhcC5mZS5pMThuPk1fRklFTERfRklMRVVQTE9BREVSX05PRklMRU5BTUVfVEVYVH1cIlxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5maWxlTGlua0hyZWYgPSBGaWVsZEhlbHBlci5nZXREb3dubG9hZFVybChvUHJvcHMuZmlsZVVwbG9hZFVybCA/PyBcIlwiKTtcblxuXHRcdFx0Ly8gVGV4dFxuXHRcdFx0b1Byb3BzLmZpbGVUZXh0VmlzaWJsZSA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRlcXVhbChwYXRoSW5Nb2RlbChgJHtvUHJvcHMuZmlsZVJlbGF0aXZlUHJvcGVydHlQYXRofUBvZGF0YS5tZWRpYUNvbnRlbnRUeXBlYCksIG51bGwpXG5cdFx0XHQpO1xuXG5cdFx0XHQvLyBGaWxlVXBsb2FkZXJcblx0XHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29yZT8uQWNjZXB0YWJsZU1lZGlhVHlwZXMpIHtcblx0XHRcdFx0Y29uc3QgYWNjZXB0ZWRUeXBlcyA9IEFycmF5LmZyb20ob1Byb3BlcnR5LmFubm90YXRpb25zLkNvcmUuQWNjZXB0YWJsZU1lZGlhVHlwZXMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkubWFwKFxuXHRcdFx0XHRcdCh0eXBlKSA9PiBgJyR7dHlwZX0nYFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRvUHJvcHMuZmlsZUFjY2VwdGFibGVNZWRpYVR5cGVzID0gYHs9b2RhdGEuY29sbGVjdGlvbihbJHthY2NlcHRlZFR5cGVzLmpvaW4oXCIsXCIpfV0pfWA7IC8vIFRoaXMgZG9lcyBub3QgZmVlbCByaWdodCwgYnV0IGZvbGxvd3MgdGhlIGxvZ2ljIG9mIEFubm90YXRpb25IZWxwZXIjdmFsdWVcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy5maWxlTWF4aW11bVNpemUgPSBGaWVsZEhlbHBlci5jYWxjdWxhdGVNQmZyb21CeXRlKG9Qcm9wZXJ0eS5tYXhMZW5ndGgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5VST8uSXNJbWFnZVVSTCkge1xuXHRcdFx0b1Byb3BzLmF2YXRhclZpc2libGUgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmlzaWJsZUV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmF2YXRhclNyYyA9IEZpZWxkVGVtcGxhdGluZy5nZXRWYWx1ZUJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIHt9KTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkF2YXRhclwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJEYXRhUG9pbnRcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRGF0YVBvaW50XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RUeXBlXCIpIHtcblx0XHRcdFx0XHRvUHJvcHMuY29udGFjdFZpc2libGUgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmlzaWJsZUV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkNvbnRhY3RcIjtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdFx0Ly9RdWFsbXM6IHRoZSBnZXRPYmplY3QgaXMgYSBiYWQgcHJhY3RpY2UsIGJ1dCBmb3Igbm93IGl0wrRzIGZpbmUgYXMgYW4gaW50ZXJtZWRpYXRlIHN0ZXAgdG8gYXZvaWQgcmVmYWN0b3Jpbmcgb2YgdGhlIGhlbHBlciBpbiBhZGRpdGlvblxuXHRcdFx0XHRjb25zdCBkYXRhRmllbGRPYmplY3QgPSBvUHJvcHMuZGF0YUZpZWxkLmdldE9iamVjdCgpO1xuXHRcdFx0XHRvUHJvcHMuYnV0dG9uUHJlc3MgPSBGaWVsZEhlbHBlci5nZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uKG9Qcm9wcywgZGF0YUZpZWxkT2JqZWN0KTtcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiQnV0dG9uXCI7XG5cblx0XHRcdFx0Ly8gR3JhY2VmdWxseSBoYW5kbGUgbm9uLWV4aXN0aW5nIGFjdGlvbnNcblx0XHRcdFx0aWYgKG9EYXRhRmllbGQuQWN0aW9uVGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRvUHJvcHMuYnV0dG9uSXNCb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0b1Byb3BzLmJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IFwiZmFsc2VcIjtcblx0XHRcdFx0XHRvUHJvcHMuYnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlRm9ybWF0dGVkID0gXCJmYWxzZVwiO1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFx0YFdhcm5pbmc6IFRoZSBhY3Rpb24gJyR7b0RhdGFGaWVsZC5BY3Rpb259JyBkb2VzIG5vdCBleGlzdC4gVGhlIGNvcnJlc3BvbmRpbmcgYWN0aW9uIGJ1dHRvbiB3aWxsIGJlIGRpc2FibGVkLmBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG9Qcm9wcy5idXR0b25Jc0JvdW5kID0gb0RhdGFGaWVsZC5BY3Rpb25UYXJnZXQuaXNCb3VuZDtcblx0XHRcdFx0b1Byb3BzLmJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IG9EYXRhRmllbGQuQWN0aW9uVGFyZ2V0LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGU7XG5cdFx0XHRcdG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGVGb3JtYXR0ZWQgPSB1bmRlZmluZWQ7XG5cblx0XHRcdFx0aWYgKG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGUpIHtcblx0XHRcdFx0XHRjb25zdCBhY3Rpb25UYXJnZXQgPSBvRGF0YUZpZWxkLkFjdGlvblRhcmdldCBhcyBBY3Rpb247XG5cdFx0XHRcdFx0Y29uc3QgYmluZGluZ1BhcmFtTmFtZSA9IGFjdGlvblRhcmdldC5wYXJhbWV0ZXJzWzBdLm5hbWU7XG5cdFx0XHRcdFx0Ly9RVUFMTVMsIG5lZWRzIHRvIGJlIGNoZWNrZWQgd2hldGhlciB0aGlzIG1ha2VzIHNlbnNlIGF0IHRoYXQgcGxhY2UsIG1pZ2h0IGJlIGdvb2QgaW4gYSBkZWRpY2F0ZWQgaGVscGVyIGZ1bmN0aW9uXG5cdFx0XHRcdFx0b1Byb3BzLmJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZUZvcm1hdHRlZCA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGUsIFtdLCB1bmRlZmluZWQsIChwYXRoOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKHBhdGguc3RhcnRzV2l0aChiaW5kaW5nUGFyYW1OYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBwYXRoLnJlcGxhY2UoYmluZGluZ1BhcmFtTmFtZSArIFwiL1wiLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGF0aDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0b1Byb3BzLmJ1dHRvblByZXNzID0gQ29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihvUHJvcHMuZGF0YUZpZWxkLmdldE9iamVjdCgpLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcE5hdmlnYXRpb25BdmFpbGFibGUob1Byb3BzLCBvRGF0YUZpZWxkKTtcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiQnV0dG9uXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0b1Byb3BzLnRleHQgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRcdG9Qcm9wcy5saW5rSXNEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRcdFx0b1Byb3BzLmxpbmtQcmVzcyA9IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4ob1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRcdG9Qcm9wcy5saW5rSXNEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGggPSB0cnVlO1xuXHRcdFx0XHRvUHJvcHMubGlua1ByZXNzID0gYEZpZWxkUnVudGltZS5vbkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aChcXCR7JHNvdXJjZT4vfSwgJGNvbnRyb2xsZXIsICcke29EYXRhRmllbGQuVGFyZ2V0LnZhbHVlfScpYDtcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRcdG9Qcm9wcy5saW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0b1Byb3BzLmxpbmtQcmVzcyA9IEZpZWxkSGVscGVyLmdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRBY3Rpb25CdXR0b24ob1Byb3BzLCBvUHJvcHMuZGF0YUZpZWxkLmdldE9iamVjdCgpKTtcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGhhc1F1aWNrVmlldyA9IEZpZWxkVGVtcGxhdGluZy5pc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzKG9EYXRhTW9kZWxQYXRoLCBvUHJvcGVydHkpO1xuXHRcdGNvbnN0IGhhc1NlbWFudGljT2JqZWN0cyA9XG5cdFx0XHQhIUZpZWxkVGVtcGxhdGluZy5nZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdChvRGF0YU1vZGVsUGF0aCkgfHxcblx0XHRcdChvUHJvcHMuc2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZCAmJiBvUHJvcHMuc2VtYW50aWNPYmplY3QgIT09IFwiXCIpO1xuXHRcdGlmIChpc1NlbWFudGljS2V5KG9Qcm9wZXJ0eSwgb0RhdGFNb2RlbFBhdGgpICYmIG9Qcm9wcy5mb3JtYXRPcHRpb25zLnNlbWFudGljS2V5U3R5bGUpIHtcblx0XHRcdG9Qcm9wcy5oYXNRdWlja1ZpZXcgPSBoYXNRdWlja1ZpZXcgfHwgaGFzU2VtYW50aWNPYmplY3RzO1xuXHRcdFx0b1Byb3BzLmhhc1NpdHVhdGlvbnNJbmRpY2F0b3IgPVxuXHRcdFx0XHRTaXR1YXRpb25zSW5kaWNhdG9yQmxvY2suZ2V0U2l0dWF0aW9uc05hdmlnYXRpb25Qcm9wZXJ0eShvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlKSAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwT2JqZWN0SWRlbnRpZmllclRpdGxlQW5kVGV4dChvUHJvcHMsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdGlmICgob0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCkge1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJTZW1hbnRpY0tleVdpdGhEcmFmdEluZGljYXRvclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gb1Byb3BzLmZvcm1hdE9wdGlvbnMuc2VtYW50aWNLZXlTdHlsZSA9PT0gXCJPYmplY3RJZGVudGlmaWVyXCIgPyBcIk9iamVjdElkZW50aWZpZXJcIiA6IFwiTGFiZWxTZW1hbnRpY0tleVwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob0RhdGFGaWVsZC5Dcml0aWNhbGl0eSkge1xuXHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlldyA9IGhhc1F1aWNrVmlldyB8fCBoYXNTZW1hbnRpY09iamVjdHM7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJPYmplY3RTdGF0dXNcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKFxuXHRcdFx0b1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgJiZcblx0XHRcdFN0cmluZyhvUHJvcHMuZm9ybWF0T3B0aW9ucy5pc0N1cnJlbmN5QWxpZ25lZCkgPT09IFwidHJ1ZVwiICYmXG5cdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCJcblx0XHQpIHtcblx0XHRcdG9Qcm9wcy52YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24gPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmFsdWVCaW5kaW5nKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy51bml0QmluZGluZ0V4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5KG9EYXRhTW9kZWxQYXRoKSk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJBbW91bnRXaXRoQ3VycmVuY3lcIjtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcyB8fCBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzUGhvbmVOdW1iZXIpIHtcblx0XHRcdG9Qcm9wcy50ZXh0ID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmxpbmtJc0VtYWlsQWRkcmVzcyA9IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcyAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0b1Byb3BzLmxpbmtJc1Bob25lTnVtYmVyID0gb1Byb3BlcnR5LmFubm90YXRpb25zLkNvbW11bmljYXRpb24/LklzUGhvbmVOdW1iZXIgIT09IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVCaW5kaW5nID0gRmllbGRUZW1wbGF0aW5nLmdldFZhbHVlQmluZGluZyhvRGF0YU1vZGVsUGF0aCwge30pO1xuXHRcdFx0aWYgKG9Qcm9wcy5saW5rSXNFbWFpbEFkZHJlc3MpIHtcblx0XHRcdFx0b1Byb3BzLmxpbmtVcmwgPSBgbWFpbHRvOiR7cHJvcGVydHlWYWx1ZUJpbmRpbmd9YDtcblx0XHRcdH1cblx0XHRcdGlmIChvUHJvcHMubGlua0lzUGhvbmVOdW1iZXIpIHtcblx0XHRcdFx0b1Byb3BzLmxpbmtVcmwgPSBgdGVsOiR7cHJvcGVydHlWYWx1ZUJpbmRpbmd9YDtcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/Lk11bHRpTGluZVRleHQpIHtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkV4cGFuZGFibGVUZXh0XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGhhc1F1aWNrVmlldyB8fCBoYXNTZW1hbnRpY09iamVjdHMpIHtcblx0XHRcdG9Qcm9wcy50ZXh0ID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlldyA9IHRydWU7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV2l0aFF1aWNrVmlld1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsKSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IEludGVybmFsRmllbGRCbG9jay5nZXRUZXh0V2l0aFdoaXRlU3BhY2Uob1Byb3BzLmZvcm1hdE9wdGlvbnMsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdG9Qcm9wcy5pY29uVXJsID0gb0RhdGFGaWVsZC5JY29uVXJsID8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9EYXRhRmllbGQuSWNvblVybCkpIDogdW5kZWZpbmVkO1xuXHRcdFx0b1Byb3BzLmxpbmtVcmwgPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5VcmwpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJUZXh0XCI7XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBFZGl0U3R5bGUoXG5cdFx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGFwcENvbXBvbmVudD86IEFwcENvbXBvbmVudFxuXHQpOiB2b2lkIHtcblx0XHRGaWVsZFRlbXBsYXRpbmcuc2V0RWRpdFN0eWxlUHJvcGVydGllcyhvUHJvcHMsIG9EYXRhRmllbGQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRvUHJvcHMuZmllbGRHcm91cElkcyA9IEludGVybmFsRmllbGRCbG9jay5jb21wdXRlRmllbGRHcm91cElkcyhvRGF0YU1vZGVsUGF0aCwgYXBwQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgdGhlIGZpZWxkR3JvdXBJZHMgZm9yIGFuIElucHV0b3Igb3RoZXIgZWRpdCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgZmllbGRHcm91cElkc1xuXHQgKi9cblx0c3RhdGljIGNvbXB1dGVGaWVsZEdyb3VwSWRzKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGFwcENvbXBvbmVudD86IEFwcENvbXBvbmVudCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCFhcHBDb21wb25lbnQpIHtcblx0XHRcdC8vZm9yIFZhbHVlSGVscCAvIE1hc3MgZWRpdCBUZW1wbGF0aW5nIHRoZSBhcHBDb21wb25lbnQgaXMgbm90IHBhc3NlZCB0byB0aGUgdGVtcGxhdGluZ1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdGNvbnN0IHNpZGVFZmZlY3RTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdGNvbnN0IGZpZWxkR3JvdXBJZHMgPSBzaWRlRWZmZWN0U2VydmljZS5jb21wdXRlRmllbGRHcm91cElkcyhcblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZT8uZnVsbHlRdWFsaWZpZWROYW1lID8/IFwiXCIsXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uZnVsbHlRdWFsaWZpZWROYW1lID8/IFwiXCJcblx0XHQpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IGZpZWxkR3JvdXBJZHMuam9pbihcIixcIik7XG5cdFx0cmV0dXJuIHJlc3VsdCA9PT0gXCJcIiA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQoX29Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0aWYgKF9vUHJvcHMuZm9ybWF0T3B0aW9ucz8uc2VtYW50aWNLZXlTdHlsZSA9PT0gXCJPYmplY3RJZGVudGlmaWVyXCIpIHtcblx0XHRcdC8vIGlmIERlc2NyaXB0aW9uVmFsdWUgaXMgc2V0IGJ5IGRlZmF1bHQgYW5kIHByb3BlcnR5IGhhcyBhIHF1aWNrVmlldywgIHdlIHNob3cgZGVzY3JpcHRpb24gYW5kIHZhbHVlIGluIE9iamVjdElkZW50aWZpZXIgVGl0bGVcblx0XHRcdGNvbnN0IGFsd2F5c1Nob3dEZXNjcmlwdGlvbkFuZFZhbHVlID0gX29Qcm9wcy5oYXNRdWlja1ZpZXc7XG5cdFx0XHRfb1Byb3BzLmlkZW50aWZpZXJUaXRsZSA9IEludGVybmFsRmllbGRCbG9jay5nZXRJZGVudGlmaWVyVGl0bGUoXG5cdFx0XHRcdF9vUHJvcHMuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdFx0YWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWVcblx0XHRcdCk7XG5cdFx0XHRpZiAoIWFsd2F5c1Nob3dEZXNjcmlwdGlvbkFuZFZhbHVlKSB7XG5cdFx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRleHQgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0T2JqZWN0SWRlbnRpZmllclRleHQoX29Qcm9wcy5mb3JtYXRPcHRpb25zLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRpdGxlID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldElkZW50aWZpZXJUaXRsZShfb1Byb3BzLmZvcm1hdE9wdGlvbnMsIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIHRydWUpO1xuXHRcdFx0X29Qcm9wcy5pZGVudGlmaWVyVGV4dCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCB0ZXh0ID0gRmllbGRUZW1wbGF0aW5nLmdldFRleHRCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKTtcblx0XHRyZXR1cm4gKHRleHQgYXMgYW55KS5fdHlwZSA9PT0gXCJQYXRoSW5Nb2RlbFwiIHx8IHR5cGVvZiB0ZXh0ID09PSBcInN0cmluZ1wiXG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChbdGV4dF0sIFwiV1NSXCIpKVxuXHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbih0ZXh0KTtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcE5hdmlnYXRpb25BdmFpbGFibGUob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhRmllbGQ6IGFueSk6IHZvaWQge1xuXHRcdG9Qcm9wcy5uYXZpZ2F0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmXG5cdFx0XHRvRGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0U3RyaW5nKG9Qcm9wcy5mb3JtYXRPcHRpb25zLmlnbm9yZU5hdmlnYXRpb25BdmFpbGFibGUpICE9PSBcInRydWVcIlxuXHRcdCkge1xuXHRcdFx0b1Byb3BzLm5hdmlnYXRpb25BdmFpbGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlKSk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxJbnRlcm5hbEZpZWxkQmxvY2s+LCBjb250cm9sQ29uZmlndXJhdGlvbjogdW5rbm93biwgc2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHRjb25zdCBvRGF0YUZpZWxkQ29udmVydGVkID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMuZGF0YUZpZWxkKTtcblx0XHRsZXQgb0RhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuZGF0YUZpZWxkLCB0aGlzLmVudGl0eVNldCk7XG5cdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwRGF0YVBvaW50VHlwZShvRGF0YUZpZWxkQ29udmVydGVkKTtcblx0XHRJbnRlcm5hbEZpZWxkQmxvY2suc2V0VXBWaXNpYmxlUHJvcGVydGllcyh0aGlzLCBvRGF0YU1vZGVsUGF0aCk7XG5cblx0XHRpZiAodGhpcy5fZmxleElkKSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuX2ZsZXhJZDtcblx0XHRcdHRoaXMuX2ZsZXhJZCA9IEludGVybmFsRmllbGRCbG9jay5nZXRDb250ZW50SWQodGhpcy5fZmxleElkKTtcblx0XHRcdHRoaXMuX3ZoRmxleElkID0gYCR7dGhpcy5fZmxleElkfV8ke3RoaXMudmhJZFByZWZpeH1gO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZURhdGFNb2RlbFBhdGggPSBGaWVsZFRlbXBsYXRpbmcuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRvRGF0YU1vZGVsUGF0aCA9IHZhbHVlRGF0YU1vZGVsUGF0aCB8fCBvRGF0YU1vZGVsUGF0aDtcblx0XHR0aGlzLmRhdGFTb3VyY2VQYXRoID0gZ2V0VGFyZ2V0T2JqZWN0UGF0aChvRGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwgfHwgc2V0dGluZ3MubW9kZWxzLmVudGl0eVNldDtcblx0XHR0aGlzLmVudGl0eVR5cGUgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHtvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZX1gKTtcblxuXHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcEVkaXRhYmxlUHJvcGVydGllcyh0aGlzLCBvRGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwRm9ybWF0T3B0aW9ucyh0aGlzLCBvRGF0YU1vZGVsUGF0aCwgY29udHJvbENvbmZpZ3VyYXRpb24sIHNldHRpbmdzKTtcblx0XHRJbnRlcm5hbEZpZWxkQmxvY2suc2V0VXBEaXNwbGF5U3R5bGUodGhpcywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcEVkaXRTdHlsZSh0aGlzLCBvRGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCwgc2V0dGluZ3MuYXBwQ29tcG9uZW50KTtcblxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gY29tcHV0ZSBiaW5kaW5ncy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0XHRjb25zdCBhRGlzcGxheVN0eWxlc1dpdGhvdXRQcm9wVGV4dCA9IFtcIkF2YXRhclwiLCBcIkFtb3VudFdpdGhDdXJyZW5jeVwiXTtcblx0XHRpZiAodGhpcy5kaXNwbGF5U3R5bGUgJiYgYURpc3BsYXlTdHlsZXNXaXRob3V0UHJvcFRleHQuaW5kZXhPZih0aGlzLmRpc3BsYXlTdHlsZSkgPT09IC0xICYmIG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdFx0dGhpcy50ZXh0ID0gdGhpcy50ZXh0ID8/IEZpZWxkVGVtcGxhdGluZy5nZXRUZXh0QmluZGluZyhvRGF0YU1vZGVsUGF0aCwgdGhpcy5mb3JtYXRPcHRpb25zKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy50ZXh0ID0gXCJcIjtcblx0XHR9XG5cblx0XHR0aGlzLmVtcHR5SW5kaWNhdG9yTW9kZSA9IHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93RW1wdHlJbmRpY2F0b3IgPyBcIk9uXCIgOiB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmNvbXB1dGVGaWVsZENvbnRlbnRDb250ZXh0cyhvTWV0YU1vZGVsLCBvRGF0YUZpZWxkQ29udmVydGVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb21wdXRlcyBhbmQgdXBkYXRlcyBtZXRhZGF0YSBjb250ZXh0cyB0aGF0IHdlcmUgcHJldmlvdXNseSBhZGRlZCBpbiBGaWVsZENvbnRlbnQuZnJhZ21lbnQueG1sIHVzaW5nIHRlbXBsYXRlOndpdGggaW5zdHJ1Y3Rpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0YU1vZGVsXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRDb252ZXJ0ZWRcblx0ICovXG5cdGNvbXB1dGVGaWVsZENvbnRlbnRDb250ZXh0cyhtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBkYXRhRmllbGRDb252ZXJ0ZWQ6IERhdGFGaWVsZCkge1xuXHRcdGlmIChpc1Byb3BlcnR5KGRhdGFGaWVsZENvbnZlcnRlZCkgJiYgZGF0YUZpZWxkQ29udmVydGVkLmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBXZSBhcmUgbG9va2luZyBhdCBhIHByb3BlcnR5LCBzbyB3ZSBuZWVkIHRvIHVzZSBpdHMgZGVmYXVsdCBkYXRhIGZpZWxkXG5cdFx0XHR0aGlzLmRhdGFGaWVsZCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgQCR7VUlBbm5vdGF0aW9uVGVybXMuRGF0YUZpZWxkRGVmYXVsdH1gLCB0aGlzLmRhdGFGaWVsZCk7XG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydE1ldGFNb2RlbENvbnRleHQodGhpcy5kYXRhRmllbGQpO1xuXHRcdH1cblx0XHRzd2l0Y2ggKGRhdGFGaWVsZENvbnZlcnRlZC4kVHlwZT8udmFsdWVPZigpKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0XHR0aGlzLnByb3BlcnR5ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiVmFsdWVcIiwgdGhpcy5kYXRhRmllbGQpO1xuXHRcdFx0XHR0aGlzLnZhbHVlSGVscFByb3BlcnR5ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KEZpZWxkSGVscGVyLnZhbHVlSGVscFByb3BlcnR5KHRoaXMucHJvcGVydHkpKSBhcyBDb250ZXh0O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0dGhpcy5hbm5vdGF0aW9uUGF0aCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIlRhcmdldC8kQW5ub3RhdGlvblBhdGhcIiwgdGhpcy5kYXRhRmllbGQpO1xuXHRcdFx0XHR0aGlzLmRhdGFQb2ludCA9IHRoaXMuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdHRoaXMucHJvcGVydHkgPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCJWYWx1ZVwiLCB0aGlzLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0dGhpcy52YWx1ZUhlbHBQcm9wZXJ0eSA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLnByb3BlcnR5KSkgYXMgQ29udGV4dDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRcdHRoaXMuYW5ub3RhdGlvblBhdGggPSB0aGlzLmRhdGFGaWVsZDtcblx0XHRcdFx0dGhpcy5kYXRhUG9pbnQgPSB0aGlzLmRhdGFGaWVsZDtcblx0XHRcdFx0dGhpcy5wcm9wZXJ0eSA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIlZhbHVlXCIsIHRoaXMuZGF0YUZpZWxkKTtcblx0XHRcdFx0dGhpcy52YWx1ZUhlbHBQcm9wZXJ0eSA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLnByb3BlcnR5KSkgYXMgQ29udGV4dDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBkaXNwbGF5U3R5bGVzID0gW1wiQnV0dG9uXCIsIFwiRXhwYW5kYWJsZVRleHRcIiwgXCJBdmF0YXJcIiwgXCJDb250YWN0XCIsIFwiRmlsZVwiLCBcIkRhdGFQb2ludFwiXTtcblx0XHRjb25zdCBlZGl0U3R5bGVzID0gW1wiQ2hlY2tCb3hcIl07XG5cdFx0aWYgKGRpc3BsYXlTdHlsZXMuaW5jbHVkZXModGhpcy5kaXNwbGF5U3R5bGUgYXMgc3RyaW5nKSB8fCBlZGl0U3R5bGVzLmluY2x1ZGVzKHRoaXMuZWRpdFN0eWxlIGFzIHN0cmluZykpIHtcblx0XHRcdC8vaW50ZXJtZWRpYXRlIHN0YXRlLCB3aWxsIGJlIGZpeGVkIG9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBtb3ZlZCBvdXQgb2YgZmllbGRjb250ZW50IGNhbGN1bGF0aW9uXG5cdFx0XHRyZXR1cm4gZ2V0RmllbGRTdHJ1Y3R1cmVUZW1wbGF0ZSh0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiAmJiB0aGlzLmVkaXRNb2RlID09PSBFZGl0TW9kZS5EaXNwbGF5KSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuZmllbGQuRmllbGRDb250ZW50XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGlkO1xuXHRcdFx0aWYgKHRoaXMuX2FwaUlkKSB7XG5cdFx0XHRcdGlkID0gdGhpcy5fYXBpSWQ7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuaWRQcmVmaXgpIHtcblx0XHRcdFx0aWQgPSBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJGaWVsZFwiXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMub25DaGFuZ2UgIT09IG51bGwgJiYgdGhpcy5vbkNoYW5nZSAhPT0gXCJudWxsXCIpIHtcblx0XHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdFx0XHQ8bWFjcm9GaWVsZDpGaWVsZEFQSVxuXHRcdFx0XHRcdFx0eG1sbnM6bWFjcm9GaWVsZD1cInNhcC5mZS5tYWNyb3MuZmllbGRcIlxuXHRcdFx0XHRcdFx0Y2hhbmdlPVwiJHt0aGlzLm9uQ2hhbmdlfVwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7aWR9XCJcblx0XHRcdFx0XHRcdHJlcXVpcmVkPVwiJHt0aGlzLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdFx0ZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uRW5hYmxlZD1cIiR7dGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZH1cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5maWVsZC5GaWVsZENvbnRlbnRcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHQ8L21hY3JvRmllbGQ6RmllbGRBUEk+XG5cdFx0XHRcdGA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4geG1sYDxtYWNyb0ZpZWxkOkZpZWxkQVBJXG5cdFx0XHRcdFx0XHR4bWxuczptYWNyb0ZpZWxkPVwic2FwLmZlLm1hY3Jvcy5maWVsZFwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7aWR9XCJcblx0XHRcdFx0XHRcdHJlcXVpcmVkPVwiJHt0aGlzLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdFx0ZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uRW5hYmxlZD1cIiR7dGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZH1cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5maWVsZC5GaWVsZENvbnRlbnRcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHQ8L21hY3JvRmllbGQ6RmllbGRBUEk+XG5cdFx0XHRcdFx0YDtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFnSnFCQSxrQkFBa0I7RUF4QnZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbEJBLE9BbUJDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLE9BQU87SUFDYkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0MsVUFBVSxFQUFFO0VBQ2IsQ0FBQyxDQUFDLFVBRUFDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMs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