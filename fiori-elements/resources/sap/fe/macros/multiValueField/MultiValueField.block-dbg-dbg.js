/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/valuehelp/ValueHelpTemplating"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingHelper, MetaModelConverter, BindingToolkit, ID, TypeGuards, DataModelPathHelper, PropertyFormatters, UIFormatters, FieldHelper, FieldTemplating, ValueHelpTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getValueBinding = FieldTemplating.getValueBinding;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isPropertyPathExpression = TypeGuards.isPropertyPathExpression;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MultiValueFieldBlock = (
  /**
   * Building block for creating a MultiValueField based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:MultiValueField
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
    name: "MultiValueField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["com.sap.vocabularies.UI.v1.DataField"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultiValueFieldBlock, _BuildingBlockBase);
    /**
     * Prefix added to the generated ID of the field
     */
    /**
     * Prefix added to the generated ID of the value help used for the field
     */
    /**
     * Metadata path to the MultiValueField.
     * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
     */
    /**
     * Mandatory context to the MultiValueField
     */
    /**
     * Property added to associate the label with the MultiValueField
     */
    /**
     * The format options
     */
    /**
     * Function to get the correct settings for the multi input.
     *
     * @param propertyDataModelObjectPath The corresponding datamodelobjectpath.
     * @param formatOptions The format options to calculate the result
     * @returns MultiInputSettings
     */
    MultiValueFieldBlock._getMultiInputSettings = function _getMultiInputSettings(propertyDataModelObjectPath, formatOptions) {
      var _propertyDefinition$a;
      const {
        collectionPath,
        itemDataModelObjectPath
      } = MultiValueFieldBlock._getPathStructure(propertyDataModelObjectPath);
      const collectionBindingDisplay = `{path:'${collectionPath}', templateShareable: false}`;
      const collectionBindingEdit = `{path:'${collectionPath}', parameters: {$$ownRequest : true}, templateShareable: false}`;
      const propertyPathOrProperty = propertyDataModelObjectPath.targetObject;
      const propertyDefinition = isPropertyPathExpression(propertyPathOrProperty) ? propertyPathOrProperty.$target : propertyPathOrProperty;
      const commonText = (_propertyDefinition$a = propertyDefinition.annotations.Common) === null || _propertyDefinition$a === void 0 ? void 0 : _propertyDefinition$a.Text;
      const relativeLocation = getRelativePaths(propertyDataModelObjectPath);
      const textExpression = commonText ? compileExpression(getExpressionFromAnnotation(commonText, relativeLocation)) : getValueBinding(itemDataModelObjectPath, formatOptions, true);
      return {
        text: textExpression,
        collectionBindingDisplay: collectionBindingDisplay,
        collectionBindingEdit: collectionBindingEdit,
        key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
      };
    }

    // Process the dataModelPath to find the collection and the relative DataModelPath for the item.
    ;
    MultiValueFieldBlock._getPathStructure = function _getPathStructure(dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      let firstCollectionPath = "";
      const currentEntitySet = (_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.targetEntitySet ? dataModelObjectPath.contextLocation.targetEntitySet : dataModelObjectPath.startingEntitySet;
      const navigatedPaths = [];
      const contextNavsForItem = ((_dataModelObjectPath$2 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.navigationProperties) || [];
      for (const navProp of dataModelObjectPath.navigationProperties) {
        if (dataModelObjectPath.contextLocation === undefined || !dataModelObjectPath.contextLocation.navigationProperties.some(contextNavProp => contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName)) {
          // in case of relative entitySetPath we don't consider navigationPath that are already in the context
          navigatedPaths.push(navProp.name);
          contextNavsForItem.push(navProp);
        }
        if (currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
          if (isMultipleNavigationProperty(navProp)) {
            break;
          }
        }
      }
      firstCollectionPath = `${navigatedPaths.join("/")}`;
      const itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
      if (itemDataModelObjectPath.contextLocation) {
        itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
      }
      return {
        collectionPath: firstCollectionPath,
        itemDataModelObjectPath: itemDataModelObjectPath
      };
    };
    function MultiValueFieldBlock(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      let dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const dataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.metaPath);
      let extraPath;
      if (isPathAnnotationExpression(dataFieldConverted.Value)) {
        extraPath = dataFieldConverted.Value.path;
      }
      _this.visible = getVisibleExpression(dataModelPath, _this.formatOptions);
      if (extraPath && extraPath.length > 0) {
        dataModelPath = enhanceDataModelPath(dataModelPath, extraPath);
      }
      const insertable = isPathInsertable(dataModelPath);
      const deleteNavigationRestriction = isPathDeletable(dataModelPath, {
        ignoreTargetCollection: true,
        authorizeUnresolvable: true
      });
      const deletePath = isPathDeletable(dataModelPath);
      // deletable:
      //		if restrictions come from Navigation we apply it
      //		otherwise we apply restrictions defined on target collection only if it's a constant
      //      otherwise it's true!
      const deletable = ifElse(deleteNavigationRestriction._type === "Unresolvable", or(not(isConstant(deletePath)), deletePath), deletePath);
      _this.editMode = _this.formatOptions.displayOnly === "true" ? "Display" : compileExpression(ifElse(and(insertable, deletable, UI.IsEditable), constant("Editable"), constant("Display")));
      _this.displayMode = getDisplayMode(dataModelPath);
      const multiInputSettings = MultiValueFieldBlock._getMultiInputSettings(dataModelPath, _this.formatOptions);
      _this.text = multiInputSettings.text;
      _this.collection = _this.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
      _this.key = multiInputSettings.key;
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = MultiValueFieldBlock;
    var _proto = MultiValueFieldBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      //prepare settings for further processing
      const internalDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const internalDataFieldConverted = internalDataModelPath.targetObject;
      const enhancedDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataFieldConverted.Value.path); // PathAnnotationExpression was checked in the templating
      //calculate the id settings for this block
      const id = this.idPrefix ? ID.generate([this.idPrefix, "MultiValueField"]) : undefined;
      //create a new binding context for the value help
      const valueHelpProperty = FieldHelper.valueHelpProperty(this.metaPath);
      const valueHelpPropertyContext = this.metaPath.getModel().createBindingContext(valueHelpProperty, this.metaPath);
      //calculate fieldHelp
      const fieldHelp = ValueHelpTemplating.generateID(undefined, this.vhIdPrefix, PropertyFormatters.getRelativePropertyPath(valueHelpPropertyContext, {
        context: this.contextPath
      }), getContextRelativeTargetObjectPath(enhancedDataModelPath) ?? "");
      //compute the correct label
      const label = FieldHelper.computeLabelText(internalDataFieldConverted.Value, {
        context: this.metaPath
      });
      return xml`
		<mdc:MultiValueField
				xmlns:mdc="sap.ui.mdc"
				delegate="{name: 'sap/fe/macros/multiValueField/MultiValueFieldDelegate'}"
				id="${id}"
				items="${this.collection}"
				display="${this.displayMode}"
				width="100%"
				editMode="${this.editMode}"
				fieldHelp="${fieldHelp}"
				ariaLabelledBy = "${this.ariaLabelledBy}"
				showEmptyIndicator = "${this.formatOptions.showEmptyIndicator}"
				label = "${label}"
		>
		<mdcField:MultiValueFieldItem xmlns:mdcField="sap.ui.mdc.field" key="${this.key}" description="${this.text}" />
		</mdc:MultiValueField>`;
    };
    return MultiValueFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FieldValueHelp";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  })), _class2)) || _class);
  _exports = MultiValueFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aVZhbHVlRmllbGRCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwidmFsaWRhdGUiLCJmb3JtYXRPcHRpb25zSW5wdXQiLCJkaXNwbGF5TW9kZSIsImluY2x1ZGVzIiwiRXJyb3IiLCJfZ2V0TXVsdGlJbnB1dFNldHRpbmdzIiwicHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwiZm9ybWF0T3B0aW9ucyIsImNvbGxlY3Rpb25QYXRoIiwiaXRlbURhdGFNb2RlbE9iamVjdFBhdGgiLCJfZ2V0UGF0aFN0cnVjdHVyZSIsImNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSIsImNvbGxlY3Rpb25CaW5kaW5nRWRpdCIsInByb3BlcnR5UGF0aE9yUHJvcGVydHkiLCJ0YXJnZXRPYmplY3QiLCJwcm9wZXJ0eURlZmluaXRpb24iLCJpc1Byb3BlcnR5UGF0aEV4cHJlc3Npb24iLCIkdGFyZ2V0IiwiY29tbW9uVGV4dCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInJlbGF0aXZlTG9jYXRpb24iLCJnZXRSZWxhdGl2ZVBhdGhzIiwidGV4dEV4cHJlc3Npb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImdldFZhbHVlQmluZGluZyIsInRleHQiLCJrZXkiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiZmlyc3RDb2xsZWN0aW9uUGF0aCIsImN1cnJlbnRFbnRpdHlTZXQiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsIm5hdmlnYXRlZFBhdGhzIiwiY29udGV4dE5hdnNGb3JJdGVtIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJuYXZQcm9wIiwidW5kZWZpbmVkIiwic29tZSIsImNvbnRleHROYXZQcm9wIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwicHVzaCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJoYXNPd25Qcm9wZXJ0eSIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIiwicHJvcHMiLCJkYXRhTW9kZWxQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwibWV0YVBhdGgiLCJjb250ZXh0UGF0aCIsImRhdGFGaWVsZENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwiZXh0cmFQYXRoIiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCJWYWx1ZSIsInBhdGgiLCJ2aXNpYmxlIiwiZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJsZW5ndGgiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsImluc2VydGFibGUiLCJpc1BhdGhJbnNlcnRhYmxlIiwiZGVsZXRlTmF2aWdhdGlvblJlc3RyaWN0aW9uIiwiaXNQYXRoRGVsZXRhYmxlIiwiaWdub3JlVGFyZ2V0Q29sbGVjdGlvbiIsImF1dGhvcml6ZVVucmVzb2x2YWJsZSIsImRlbGV0ZVBhdGgiLCJkZWxldGFibGUiLCJpZkVsc2UiLCJfdHlwZSIsIm9yIiwibm90IiwiaXNDb25zdGFudCIsImVkaXRNb2RlIiwiZGlzcGxheU9ubHkiLCJhbmQiLCJVSSIsIklzRWRpdGFibGUiLCJjb25zdGFudCIsImdldERpc3BsYXlNb2RlIiwibXVsdGlJbnB1dFNldHRpbmdzIiwiY29sbGVjdGlvbiIsImdldFRlbXBsYXRlIiwiaW50ZXJuYWxEYXRhTW9kZWxQYXRoIiwiaW50ZXJuYWxEYXRhRmllbGRDb252ZXJ0ZWQiLCJlbmhhbmNlZERhdGFNb2RlbFBhdGgiLCJpZCIsImlkUHJlZml4IiwiSUQiLCJnZW5lcmF0ZSIsInZhbHVlSGVscFByb3BlcnR5IiwiRmllbGRIZWxwZXIiLCJ2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQiLCJnZXRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiZmllbGRIZWxwIiwiVmFsdWVIZWxwVGVtcGxhdGluZyIsImdlbmVyYXRlSUQiLCJ2aElkUHJlZml4IiwiUHJvcGVydHlGb3JtYXR0ZXJzIiwiZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgiLCJjb250ZXh0IiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImxhYmVsIiwiY29tcHV0ZUxhYmVsVGV4dCIsInhtbCIsImFyaWFMYWJlbGxlZEJ5Iiwic2hvd0VtcHR5SW5kaWNhdG9yIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk11bHRpVmFsdWVGaWVsZC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5LCBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9FZG1cIjtcbmltcG9ydCB0eXBlIHsgRGF0YUZpZWxkIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbnN0YW50LFxuXHRub3QsXG5cdG9yXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0ICogYXMgSUQgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHksIGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBpc1Byb3BlcnR5UGF0aEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRlbmhhbmNlRGF0YU1vZGVsUGF0aCxcblx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCxcblx0Z2V0UmVsYXRpdmVQYXRocyxcblx0aXNQYXRoRGVsZXRhYmxlLFxuXHRpc1BhdGhJbnNlcnRhYmxlXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFByb3BlcnR5Rm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUsIE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFZhbHVlQmluZGluZywgZ2V0VmlzaWJsZUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFRlbXBsYXRpbmdcIjtcbmltcG9ydCAqIGFzIFZhbHVlSGVscFRlbXBsYXRpbmcgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlSGVscFRlbXBsYXRpbmdcIjtcbmltcG9ydCB0eXBlIEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbnR5cGUgTXVsdGlJbnB1dFNldHRpbmdzID0ge1xuXHR0ZXh0OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0VkaXQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRrZXk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0c2hvd0VtcHR5SW5kaWNhdG9yPzogYm9vbGVhbjtcblx0ZGlzcGxheU9ubHk/OiBib29sZWFuIHwgc3RyaW5nO1xuXHRkaXNwbGF5TW9kZT86IHN0cmluZztcblx0bWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nO1xuXHRpc0FuYWx5dGljcz86IGJvb2xlYW47XG59PjtcblxudHlwZSBNdWx0aVZhbHVlRmllbGRQYXRoU3RydWN0dXJlID0ge1xuXHRjb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aDtcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgTXVsdGlWYWx1ZUZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgRGF0YUZpZWxkIGFubm90YXRpb24gaXMgZXhwZWN0ZWRcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqIDxpbnRlcm5hbE1hY3JvOk11bHRpVmFsdWVGaWVsZFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICBjb250ZXh0UGF0aD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIG1ldGFQYXRoPVwie2RhdGFGaWVsZD59XCJcbiAqIC8+XG4gKiA8L3ByZT5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuOTQuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiTXVsdGlWYWx1ZUZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aVZhbHVlRmllbGRCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIFByZWZpeCBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBpZFByZWZpeD86IHN0cmluZztcblxuXHQvKipcblx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIHZhbHVlIGhlbHAgdXNlZCBmb3IgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIHZoSWRQcmVmaXggPSBcIkZpZWxkVmFsdWVIZWxwXCI7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIE11bHRpVmFsdWVGaWVsZC5cblx0ICogVGhpcyBwcm9wZXJ0eSBpcyB1c3VhbGx5IGEgbWV0YWRhdGFDb250ZXh0IHBvaW50aW5nIHRvIGEgRGF0YUZpZWxkIGhhdmluZyBhIFZhbHVlIHRoYXQgdXNlcyBhIDE6biBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIl1cblx0fSlcblx0cHVibGljIG1ldGFQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogTWFuZGF0b3J5IGNvbnRleHQgdG8gdGhlIE11bHRpVmFsdWVGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiXVxuXHR9KVxuXHRwdWJsaWMgY29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIE11bHRpVmFsdWVGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBhcmlhTGFiZWxsZWRCeT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHJpdmF0ZSBrZXk/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHByaXZhdGUgdGV4dD86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIEVkaXQgTW9kZSBvZiB0aGUgZmllbGQuXG5cdCAqIElmIHRoZSBlZGl0TW9kZSBpcyB1bmRlZmluZWQgdGhlbiB3ZSBjb21wdXRlIGl0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YVxuXHQgKiBPdGhlcndpc2Ugd2UgdXNlIHRoZSB2YWx1ZSBwcm92aWRlZCBoZXJlLlxuXHQgKi9cblx0cHJpdmF0ZSBlZGl0TW9kZSE6IEVkaXRNb2RlIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIFRoZSBkaXNwbGF5IG1vZGUgYWRkZWQgdG8gdGhlIGNvbGxlY3Rpb24gZmllbGRcblx0ICovXG5cdHByaXZhdGUgZGlzcGxheU1vZGUhOiBEaXNwbGF5TW9kZTtcblxuXHQvKipcblx0ICogVGhlIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHRoYXQgaXMgY2FsY3VsYXRlZCBpbnRlcm5hbGx5XG5cdCAqL1xuXHRwcml2YXRlIGNvbGxlY3Rpb24hOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogVGhlIGZvcm1hdCBvcHRpb25zXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChmb3JtYXRPcHRpb25zSW5wdXQ6IE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlICYmXG5cdFx0XHRcdCFbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZX0gZm9yIGRpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc0lucHV0O1xuXHRcdH1cblx0fSlcblx0cHVibGljIGZvcm1hdE9wdGlvbnM6IE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnMgPSB7fTtcblxuXHRwcml2YXRlIHZpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBnZXQgdGhlIGNvcnJlY3Qgc2V0dGluZ3MgZm9yIHRoZSBtdWx0aSBpbnB1dC5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgY29ycmVzcG9uZGluZyBkYXRhbW9kZWxvYmplY3RwYXRoLlxuXHQgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBUaGUgZm9ybWF0IG9wdGlvbnMgdG8gY2FsY3VsYXRlIHRoZSByZXN1bHRcblx0ICogQHJldHVybnMgTXVsdGlJbnB1dFNldHRpbmdzXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfZ2V0TXVsdGlJbnB1dFNldHRpbmdzKFxuXHRcdHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRmb3JtYXRPcHRpb25zOiBNdWx0aVZhbHVlRmllbGRGb3JtYXRPcHRpb25zXG5cdCk6IE11bHRpSW5wdXRTZXR0aW5ncyB7XG5cdFx0Y29uc3QgeyBjb2xsZWN0aW9uUGF0aCwgaXRlbURhdGFNb2RlbE9iamVjdFBhdGggfSA9IE11bHRpVmFsdWVGaWVsZEJsb2NrLl9nZXRQYXRoU3RydWN0dXJlKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0Y29uc3QgY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5ID0gYHtwYXRoOicke2NvbGxlY3Rpb25QYXRofScsIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb25CaW5kaW5nRWRpdCA9IGB7cGF0aDonJHtjb2xsZWN0aW9uUGF0aH0nLCBwYXJhbWV0ZXJzOiB7JCRvd25SZXF1ZXN0IDogdHJ1ZX0sIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoT3JQcm9wZXJ0eSA9IHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHlQYXRoIHwgUHJvcGVydHk7XG5cdFx0Y29uc3QgcHJvcGVydHlEZWZpbml0aW9uOiBQcm9wZXJ0eSA9IGlzUHJvcGVydHlQYXRoRXhwcmVzc2lvbihwcm9wZXJ0eVBhdGhPclByb3BlcnR5KVxuXHRcdFx0PyBwcm9wZXJ0eVBhdGhPclByb3BlcnR5LiR0YXJnZXRcblx0XHRcdDogcHJvcGVydHlQYXRoT3JQcm9wZXJ0eTtcblx0XHRjb25zdCBjb21tb25UZXh0ID0gcHJvcGVydHlEZWZpbml0aW9uLmFubm90YXRpb25zLkNvbW1vbj8uVGV4dDtcblx0XHRjb25zdCByZWxhdGl2ZUxvY2F0aW9uID0gZ2V0UmVsYXRpdmVQYXRocyhwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXG5cdFx0Y29uc3QgdGV4dEV4cHJlc3Npb24gPSBjb21tb25UZXh0XG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdGNvbW1vblRleHQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxQcm9wZXJ0eT4sXG5cdFx0XHRcdFx0XHRyZWxhdGl2ZUxvY2F0aW9uXG5cdFx0XHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPlxuXHRcdFx0ICApXG5cdFx0XHQ6IGdldFZhbHVlQmluZGluZyhpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCwgZm9ybWF0T3B0aW9ucywgdHJ1ZSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRleHQ6IHRleHRFeHByZXNzaW9uLFxuXHRcdFx0Y29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5OiBjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXksXG5cdFx0XHRjb2xsZWN0aW9uQmluZGluZ0VkaXQ6IGNvbGxlY3Rpb25CaW5kaW5nRWRpdCxcblx0XHRcdGtleTogZ2V0VmFsdWVCaW5kaW5nKGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKVxuXHRcdH07XG5cdH1cblxuXHQvLyBQcm9jZXNzIHRoZSBkYXRhTW9kZWxQYXRoIHRvIGZpbmQgdGhlIGNvbGxlY3Rpb24gYW5kIHRoZSByZWxhdGl2ZSBEYXRhTW9kZWxQYXRoIGZvciB0aGUgaXRlbS5cblx0cHJpdmF0ZSBzdGF0aWMgX2dldFBhdGhTdHJ1Y3R1cmUoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IE11bHRpVmFsdWVGaWVsZFBhdGhTdHJ1Y3R1cmUge1xuXHRcdGxldCBmaXJzdENvbGxlY3Rpb25QYXRoID0gXCJcIjtcblx0XHRjb25zdCBjdXJyZW50RW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldFxuXHRcdFx0PyBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi50YXJnZXRFbnRpdHlTZXRcblx0XHRcdDogZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldDtcblx0XHRjb25zdCBuYXZpZ2F0ZWRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBjb250ZXh0TmF2c0Zvckl0ZW0gPSBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXMgfHwgW107XG5cdFx0Zm9yIChjb25zdCBuYXZQcm9wIG9mIGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24gPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMuc29tZShcblx0XHRcdFx0XHQoY29udGV4dE5hdlByb3ApID0+IGNvbnRleHROYXZQcm9wLmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gbmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdFx0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIGluIGNhc2Ugb2YgcmVsYXRpdmUgZW50aXR5U2V0UGF0aCB3ZSBkb24ndCBjb25zaWRlciBuYXZpZ2F0aW9uUGF0aCB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBjb250ZXh0XG5cdFx0XHRcdG5hdmlnYXRlZFBhdGhzLnB1c2gobmF2UHJvcC5uYW1lKTtcblx0XHRcdFx0Y29udGV4dE5hdnNGb3JJdGVtLnB1c2gobmF2UHJvcCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLmhhc093blByb3BlcnR5KG5hdlByb3AubmFtZSkpIHtcblx0XHRcdFx0aWYgKGlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkobmF2UHJvcCkpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmaXJzdENvbGxlY3Rpb25QYXRoID0gYCR7bmF2aWdhdGVkUGF0aHMuam9pbihcIi9cIil9YDtcblx0XHRjb25zdCBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdGlmIChpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24pIHtcblx0XHRcdGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi5uYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbnRleHROYXZzRm9ySXRlbTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBjb2xsZWN0aW9uUGF0aDogZmlyc3RDb2xsZWN0aW9uUGF0aCwgaXRlbURhdGFNb2RlbE9iamVjdFBhdGg6IGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoIH07XG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPE11bHRpVmFsdWVGaWVsZEJsb2NrPikge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHRsZXQgZGF0YU1vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgZGF0YUZpZWxkQ29udmVydGVkID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMubWV0YVBhdGgpIGFzIERhdGFGaWVsZDtcblx0XHRsZXQgZXh0cmFQYXRoO1xuXHRcdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihkYXRhRmllbGRDb252ZXJ0ZWQuVmFsdWUpKSB7XG5cdFx0XHRleHRyYVBhdGggPSBkYXRhRmllbGRDb252ZXJ0ZWQuVmFsdWUucGF0aDtcblx0XHR9XG5cblx0XHR0aGlzLnZpc2libGUgPSBnZXRWaXNpYmxlRXhwcmVzc2lvbihkYXRhTW9kZWxQYXRoLCB0aGlzLmZvcm1hdE9wdGlvbnMpO1xuXHRcdGlmIChleHRyYVBhdGggJiYgZXh0cmFQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRcdGRhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxQYXRoLCBleHRyYVBhdGgpO1xuXHRcdH1cblx0XHRjb25zdCBpbnNlcnRhYmxlID0gaXNQYXRoSW5zZXJ0YWJsZShkYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBkZWxldGVOYXZpZ2F0aW9uUmVzdHJpY3Rpb24gPSBpc1BhdGhEZWxldGFibGUoZGF0YU1vZGVsUGF0aCwge1xuXHRcdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRcdGF1dGhvcml6ZVVucmVzb2x2YWJsZTogdHJ1ZVxuXHRcdH0pO1xuXHRcdGNvbnN0IGRlbGV0ZVBhdGggPSBpc1BhdGhEZWxldGFibGUoZGF0YU1vZGVsUGF0aCk7XG5cdFx0Ly8gZGVsZXRhYmxlOlxuXHRcdC8vXHRcdGlmIHJlc3RyaWN0aW9ucyBjb21lIGZyb20gTmF2aWdhdGlvbiB3ZSBhcHBseSBpdFxuXHRcdC8vXHRcdG90aGVyd2lzZSB3ZSBhcHBseSByZXN0cmljdGlvbnMgZGVmaW5lZCBvbiB0YXJnZXQgY29sbGVjdGlvbiBvbmx5IGlmIGl0J3MgYSBjb25zdGFudFxuXHRcdC8vICAgICAgb3RoZXJ3aXNlIGl0J3MgdHJ1ZSFcblx0XHRjb25zdCBkZWxldGFibGUgPSBpZkVsc2UoXG5cdFx0XHRkZWxldGVOYXZpZ2F0aW9uUmVzdHJpY3Rpb24uX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCIsXG5cdFx0XHRvcihub3QoaXNDb25zdGFudChkZWxldGVQYXRoKSksIGRlbGV0ZVBhdGgpLFxuXHRcdFx0ZGVsZXRlUGF0aFxuXHRcdCk7XG5cdFx0dGhpcy5lZGl0TW9kZSA9XG5cdFx0XHR0aGlzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU9ubHkgPT09IFwidHJ1ZVwiXG5cdFx0XHRcdD8gXCJEaXNwbGF5XCJcblx0XHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbihpZkVsc2UoYW5kKGluc2VydGFibGUsIGRlbGV0YWJsZSwgVUkuSXNFZGl0YWJsZSksIGNvbnN0YW50KFwiRWRpdGFibGVcIiksIGNvbnN0YW50KFwiRGlzcGxheVwiKSkpO1xuXHRcdHRoaXMuZGlzcGxheU1vZGUgPSBnZXREaXNwbGF5TW9kZShkYXRhTW9kZWxQYXRoKTtcblxuXHRcdGNvbnN0IG11bHRpSW5wdXRTZXR0aW5ncyA9IE11bHRpVmFsdWVGaWVsZEJsb2NrLl9nZXRNdWx0aUlucHV0U2V0dGluZ3MoZGF0YU1vZGVsUGF0aCwgdGhpcy5mb3JtYXRPcHRpb25zKTtcblx0XHR0aGlzLnRleHQgPSBtdWx0aUlucHV0U2V0dGluZ3MudGV4dDtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPVxuXHRcdFx0dGhpcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIgPyBtdWx0aUlucHV0U2V0dGluZ3MuY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5IDogbXVsdGlJbnB1dFNldHRpbmdzLmNvbGxlY3Rpb25CaW5kaW5nRWRpdDtcblx0XHR0aGlzLmtleSA9IG11bHRpSW5wdXRTZXR0aW5ncy5rZXk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdC8vcHJlcGFyZSBzZXR0aW5ncyBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG5cdFx0Y29uc3QgaW50ZXJuYWxEYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBpbnRlcm5hbERhdGFGaWVsZENvbnZlcnRlZCA9IGludGVybmFsRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkO1xuXHRcdGNvbnN0IGVuaGFuY2VkRGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKFxuXHRcdFx0aW50ZXJuYWxEYXRhTW9kZWxQYXRoLFxuXHRcdFx0KGludGVybmFsRGF0YUZpZWxkQ29udmVydGVkLlZhbHVlIGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxzdHJpbmc+KS5wYXRoXG5cdFx0KTsgLy8gUGF0aEFubm90YXRpb25FeHByZXNzaW9uIHdhcyBjaGVja2VkIGluIHRoZSB0ZW1wbGF0aW5nXG5cdFx0Ly9jYWxjdWxhdGUgdGhlIGlkIHNldHRpbmdzIGZvciB0aGlzIGJsb2NrXG5cdFx0Y29uc3QgaWQgPSB0aGlzLmlkUHJlZml4ID8gSUQuZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIFwiTXVsdGlWYWx1ZUZpZWxkXCJdKSA6IHVuZGVmaW5lZDtcblx0XHQvL2NyZWF0ZSBhIG5ldyBiaW5kaW5nIGNvbnRleHQgZm9yIHRoZSB2YWx1ZSBoZWxwXG5cdFx0Y29uc3QgdmFsdWVIZWxwUHJvcGVydHkgPSBGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCB2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgPSB0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQodmFsdWVIZWxwUHJvcGVydHksIHRoaXMubWV0YVBhdGgpO1xuXHRcdC8vY2FsY3VsYXRlIGZpZWxkSGVscFxuXHRcdGNvbnN0IGZpZWxkSGVscCA9IFZhbHVlSGVscFRlbXBsYXRpbmcuZ2VuZXJhdGVJRChcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHRoaXMudmhJZFByZWZpeCxcblx0XHRcdFByb3BlcnR5Rm9ybWF0dGVycy5nZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCh2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgYXMgdW5rbm93biBhcyBNZXRhTW9kZWxDb250ZXh0LCB7XG5cdFx0XHRcdGNvbnRleHQ6IHRoaXMuY29udGV4dFBhdGhcblx0XHRcdH0pLFxuXHRcdFx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChlbmhhbmNlZERhdGFNb2RlbFBhdGgpID8/IFwiXCJcblx0XHQpO1xuXHRcdC8vY29tcHV0ZSB0aGUgY29ycmVjdCBsYWJlbFxuXHRcdGNvbnN0IGxhYmVsID0gRmllbGRIZWxwZXIuY29tcHV0ZUxhYmVsVGV4dChpbnRlcm5hbERhdGFGaWVsZENvbnZlcnRlZC5WYWx1ZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248c3RyaW5nPiwge1xuXHRcdFx0Y29udGV4dDogdGhpcy5tZXRhUGF0aFxuXHRcdH0pIGFzIHN0cmluZztcblxuXHRcdHJldHVybiB4bWxgXG5cdFx0PG1kYzpNdWx0aVZhbHVlRmllbGRcblx0XHRcdFx0eG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiXG5cdFx0XHRcdGRlbGVnYXRlPVwie25hbWU6ICdzYXAvZmUvbWFjcm9zL211bHRpVmFsdWVGaWVsZC9NdWx0aVZhbHVlRmllbGREZWxlZ2F0ZSd9XCJcblx0XHRcdFx0aWQ9XCIke2lkfVwiXG5cdFx0XHRcdGl0ZW1zPVwiJHt0aGlzLmNvbGxlY3Rpb259XCJcblx0XHRcdFx0ZGlzcGxheT1cIiR7dGhpcy5kaXNwbGF5TW9kZX1cIlxuXHRcdFx0XHR3aWR0aD1cIjEwMCVcIlxuXHRcdFx0XHRlZGl0TW9kZT1cIiR7dGhpcy5lZGl0TW9kZX1cIlxuXHRcdFx0XHRmaWVsZEhlbHA9XCIke2ZpZWxkSGVscH1cIlxuXHRcdFx0XHRhcmlhTGFiZWxsZWRCeSA9IFwiJHt0aGlzLmFyaWFMYWJlbGxlZEJ5fVwiXG5cdFx0XHRcdHNob3dFbXB0eUluZGljYXRvciA9IFwiJHt0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0VtcHR5SW5kaWNhdG9yfVwiXG5cdFx0XHRcdGxhYmVsID0gXCIke2xhYmVsfVwiXG5cdFx0PlxuXHRcdDxtZGNGaWVsZDpNdWx0aVZhbHVlRmllbGRJdGVtIHhtbG5zOm1kY0ZpZWxkPVwic2FwLnVpLm1kYy5maWVsZFwiIGtleT1cIiR7dGhpcy5rZXl9XCIgZGVzY3JpcHRpb249XCIke3RoaXMudGV4dH1cIiAvPlxuXHRcdDwvbWRjOk11bHRpVmFsdWVGaWVsZD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Ba0ZxQkEsb0JBQW9CO0VBdkJ6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWxCQSxPQW1CQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxpQkFBaUI7SUFDdkJDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBTURELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFPREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLHNDQUFzQztFQUN2RCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFB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