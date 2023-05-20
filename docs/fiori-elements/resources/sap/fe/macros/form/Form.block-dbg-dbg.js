/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/form/FormHelper", "sap/ui/core/library", "sap/ui/model/odata/v4/AnnotationHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, Form, BindingHelper, ID, MetaModelConverter, BindingToolkit, DataModelPathHelper, FormHelper, library, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var _exports = {};
  var TitleLevel = library.TitleLevel;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getFormContainerID = ID.getFormContainerID;
  var UI = BindingHelper.UI;
  var createFormDefinition = Form.createFormDefinition;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FormBlock = (
  /**
   * Building block for creating a Form based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Form
   * @public
   */
  _dec = defineBuildingBlock({
    name: "Form",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.FieldGroupType", "com.sap.vocabularies.UI.v1.CollectionFacet", "com.sap.vocabularies.UI.v1.ReferenceFacet"],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
  }), _dec5 = blockAttribute({
    type: "array"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec12 = blockEvent(), _dec13 = blockAggregation({
    type: "sap.fe.macros.form.FormElement",
    isPublic: true,
    slot: "formElements",
    isDefault: true
  }), _dec14 = blockAttribute({
    type: "object",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormBlock, _BuildingBlockBase);
    /**
     * The identifier of the form control.
     *
     * @public
     */

    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */

    /**
     * The manifest defined form containers to be shown in the action area of the table
     */

    /**
     * Control the rendering of the form container labels
     */

    /**
     * Toggle Preview: Part of Preview / Preview via 'Show More' Button
     */

    /**
     * The title of the form control.
     *
     * @public
     */

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * 	If set to false, the Form is not rendered.
     */

    // Independent from the form title, can be a bit confusing in standalone usage at is not showing anything by default

    // Just proxied down to the Field may need to see if needed or not

    /**
     * Defines the layout to be used within the form.
     * It defaults to the ColumnLayout, but you can also use a ResponsiveGridLayout.
     * All the properties of the ResponsiveGridLayout can be added to the configuration.
     */

    function FormBlock(props, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formContainers", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useFormContainerLabels", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "partOfPreview", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isVisible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "layout", _descriptor13, _assertThisInitialized(_this));
      if (_this.metaPath && _this.contextPath && (_this.formContainers === undefined || _this.formContainers === null)) {
        const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        const mExtraSettings = {};
        let oFacetDefinition = oContextObjectPath.targetObject;
        let hasFieldGroup = false;
        if (oFacetDefinition && oFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          // Wrap the facet in a fake Facet annotation
          hasFieldGroup = true;
          oFacetDefinition = {
            $Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
            Label: oFacetDefinition.Label,
            Target: {
              $target: oFacetDefinition,
              fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
              path: "",
              term: "",
              type: "AnnotationPath",
              value: getContextRelativeTargetObjectPath(oContextObjectPath)
            },
            annotations: {},
            fullyQualifiedName: oFacetDefinition.fullyQualifiedName
          };
          mExtraSettings[oFacetDefinition.Target.value] = {
            fields: _this.formElements
          };
        }
        const oConverterContext = _this.getConverterContext(oContextObjectPath, /*this.contextPath*/undefined, mSettings, mExtraSettings);
        const oFormDefinition = createFormDefinition(oFacetDefinition, _this.isVisible, oConverterContext);
        if (hasFieldGroup) {
          oFormDefinition.formContainers[0].annotationPath = _this.metaPath.getPath();
        }
        _this.formContainers = oFormDefinition.formContainers;
        _this.useFormContainerLabels = oFormDefinition.useFormContainerLabels;
        _this.facetType = oFacetDefinition && oFacetDefinition.$Type;
      } else {
        var _this$metaPath$getObj;
        _this.facetType = (_this$metaPath$getObj = _this.metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type;
      }
      if (!_this.isPublic) {
        _this._apiId = _this.createId("Form");
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = `${_this.id}-content`;
      }
      // if displayMode === true -> _editable = false
      // if displayMode === false -> _editable = true
      //  => if displayMode === {myBindingValue} -> _editable = {myBindingValue} === true ? true : false
      // if DisplayMode === undefined -> _editable = {ui>/isEditable}
      if (_this.displayMode !== undefined) {
        _this._editable = compileExpression(ifElse(equal(resolveBindingString(_this.displayMode, "boolean"), false), true, false));
      } else {
        _this._editable = compileExpression(UI.IsEditable);
      }
      return _this;
    }
    _exports = FormBlock;
    var _proto = FormBlock.prototype;
    _proto.getDataFieldCollection = function getDataFieldCollection(formContainer, facetContext) {
      const facet = getInvolvedDataModelObjects(facetContext).targetObject;
      let navigationPath;
      let idPart;
      if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        navigationPath = AnnotationHelper.getNavigationPath(facet.Target.value);
        idPart = facet;
      } else {
        const contextPathPath = this.contextPath.getPath();
        let facetPath = facetContext.getPath();
        if (facetPath.startsWith(contextPathPath)) {
          facetPath = facetPath.substring(contextPathPath.length);
        }
        navigationPath = AnnotationHelper.getNavigationPath(facetPath);
        idPart = facetPath;
      }
      const titleLevel = FormHelper.getFormContainerTitleLevel(this.title, this.titleLevel);
      const title = this.useFormContainerLabels && facet ? AnnotationHelper.label(facet, {
        context: facetContext
      }) : "";
      const id = this.id ? getFormContainerID(idPart) : undefined;
      return xml`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id", id)}
					title="${title}"
					titleLevel="${titleLevel}"
					contextPath="${navigationPath ? formContainer.entitySet : this.contextPath}"
					metaPath="${facetContext}"
					dataFieldCollection="${formContainer.formElements}"
					navigationPath="${navigationPath}"
					visible="${formContainer.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${formContainer.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`;
    };
    _proto.getFormContainers = function getFormContainers() {
      if (this.formContainers.length === 0) {
        return "";
      }
      if (this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet") >= 0) {
        return this.formContainers.map((formContainer, formContainerIdx) => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            const facet = facetContext.getObject();
            if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && FormHelper.isReferenceFacetPartOfPreview(facet, this.partOfPreview)) {
              if (facet.Target.$AnnotationPath.$Type === "com.sap.vocabularies.Communication.v1.AddressType") {
                return xml`<template:with path="formContainers>${formContainerIdx}" var="formContainer">
											<template:with path="formContainers>${formContainerIdx}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`;
              }
              return this.getDataFieldCollection(formContainer, facetContext);
            }
          }
          return "";
        });
      } else if (this.facetType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        return this.formContainers.map(formContainer => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            return this.getDataFieldCollection(formContainer, facetContext);
          } else {
            return "";
          }
        });
      }
      return xml``;
    }

    /**
     * Create the proper layout information based on the `layout` property defined externally.
     *
     * @returns The layout information for the xml.
     */;
    _proto.getLayoutInformation = function getLayoutInformation() {
      switch (this.layout.type) {
        case "ResponsiveGridLayout":
          return xml`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${this.layout.columnsL}"
													columnsM="${this.layout.columnsM}"
													columnsXL="${this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;
        case "ColumnLayout":
        default:
          return xml`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      const onChangeStr = this.onChange && this.onChange.replace("{", "\\{").replace("}", "\\}") || "";
      const metaPathPath = this.metaPath.getPath();
      const contextPathPath = this.contextPath.getPath();
      if (!this.isVisible) {
        return xml``;
      } else {
        return xml`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${metaPathPath}"
					contextPath="${contextPathPath}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					id="${this._contentId}"
					editable="${this._editable}"
					macrodata:entitySet="{contextPath>@sapui.name}"
					visible="${this.isVisible}"
					class="sapUxAPObjectPageSubSectionAlignContent"
					macrodata:navigationPath="${contextPathPath}"
					macrodata:onChange="${onChangeStr}"
				>
					${this.addConditionally(this.title !== undefined, xml`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`;
      }
    };
    return FormBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formContainers", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useFormContainerLabels", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "partOfPreview", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "titleLevel", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "isVisible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "true";
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "layout", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {
        type: "ColumnLayout",
        columnsM: 2,
        columnsXL: 6,
        columnsL: 3,
        labelCellsLarge: 12
      };
    }
  })), _class2)) || _class);
  _exports = FormBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXMiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsInNsb3QiLCJpc0RlZmF1bHQiLCJwcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJtU2V0dGluZ3MiLCJtZXRhUGF0aCIsImNvbnRleHRQYXRoIiwiZm9ybUNvbnRhaW5lcnMiLCJ1bmRlZmluZWQiLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJtRXh0cmFTZXR0aW5ncyIsIm9GYWNldERlZmluaXRpb24iLCJ0YXJnZXRPYmplY3QiLCJoYXNGaWVsZEdyb3VwIiwiJFR5cGUiLCJMYWJlbCIsIlRhcmdldCIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJwYXRoIiwidGVybSIsInZhbHVlIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImFubm90YXRpb25zIiwiZmllbGRzIiwiZm9ybUVsZW1lbnRzIiwib0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Iiwib0Zvcm1EZWZpbml0aW9uIiwiY3JlYXRlRm9ybURlZmluaXRpb24iLCJpc1Zpc2libGUiLCJhbm5vdGF0aW9uUGF0aCIsImdldFBhdGgiLCJ1c2VGb3JtQ29udGFpbmVyTGFiZWxzIiwiZmFjZXRUeXBlIiwiZ2V0T2JqZWN0IiwiX2FwaUlkIiwiY3JlYXRlSWQiLCJfY29udGVudElkIiwiaWQiLCJkaXNwbGF5TW9kZSIsIl9lZGl0YWJsZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiaWZFbHNlIiwiZXF1YWwiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsIlVJIiwiSXNFZGl0YWJsZSIsImdldERhdGFGaWVsZENvbGxlY3Rpb24iLCJmb3JtQ29udGFpbmVyIiwiZmFjZXRDb250ZXh0IiwiZmFjZXQiLCJuYXZpZ2F0aW9uUGF0aCIsImlkUGFydCIsIkFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImNvbnRleHRQYXRoUGF0aCIsImZhY2V0UGF0aCIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJ0aXRsZUxldmVsIiwiRm9ybUhlbHBlciIsImdldEZvcm1Db250YWluZXJUaXRsZUxldmVsIiwidGl0bGUiLCJsYWJlbCIsImNvbnRleHQiLCJnZXRGb3JtQ29udGFpbmVySUQiLCJ4bWwiLCJhdHRyIiwiZW50aXR5U2V0Iiwib25DaGFuZ2UiLCJhY3Rpb25zIiwiZ2V0Rm9ybUNvbnRhaW5lcnMiLCJpbmRleE9mIiwibWFwIiwiZm9ybUNvbnRhaW5lcklkeCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc1JlZmVyZW5jZUZhY2V0UGFydE9mUHJldmlldyIsInBhcnRPZlByZXZpZXciLCIkQW5ub3RhdGlvblBhdGgiLCJnZXRMYXlvdXRJbmZvcm1hdGlvbiIsImxheW91dCIsImFkanVzdExhYmVsU3BhbiIsImJyZWFrcG9pbnRMIiwiYnJlYWtwb2ludE0iLCJicmVha3BvaW50WEwiLCJjb2x1bW5zTCIsImNvbHVtbnNNIiwiY29sdW1uc1hMIiwiZW1wdHlTcGFuTCIsImVtcHR5U3Bhbk0iLCJlbXB0eVNwYW5TIiwiZW1wdHlTcGFuWEwiLCJsYWJlbFNwYW5MIiwibGFiZWxTcGFuTSIsImxhYmVsU3BhblMiLCJsYWJlbFNwYW5YTCIsInNpbmdsZUNvbnRhaW5lckZ1bGxTaXplIiwibGFiZWxDZWxsc0xhcmdlIiwiZW1wdHlDZWxsc0xhcmdlIiwiZ2V0VGVtcGxhdGUiLCJvbkNoYW5nZVN0ciIsInJlcGxhY2UiLCJtZXRhUGF0aFBhdGgiLCJhZGRDb25kaXRpb25hbGx5IiwiQnVpbGRpbmdCbG9ja0Jhc2UiLCJUaXRsZUxldmVsIiwiQXV0byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybS5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IEZhY2V0VHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSB7IEZvcm1Db250YWluZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgY3JlYXRlRm9ybURlZmluaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IGdldEZvcm1Db250YWluZXJJRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZXF1YWwsIGlmRWxzZSwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgRm9ybUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9mb3JtL0Zvcm1IZWxwZXJcIjtcbmltcG9ydCB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgeyAkQ29sdW1uTGF5b3V0U2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL2xheW91dC9mb3JtL0NvbHVtbkxheW91dFwiO1xuaW1wb3J0IHR5cGUgeyAkUmVzcG9uc2l2ZUdyaWRMYXlvdXRTZXR0aW5ncyB9IGZyb20gXCJzYXAvdWkvbGF5b3V0L2Zvcm0vUmVzcG9uc2l2ZUdyaWRMYXlvdXRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcblxudHlwZSBDb2x1bW5MYXlvdXQgPSAkQ29sdW1uTGF5b3V0U2V0dGluZ3MgJiB7XG5cdHR5cGU6IFwiQ29sdW1uTGF5b3V0XCI7XG59O1xudHlwZSBSZXNwb25zaXZlR3JpZExheW91dCA9ICRSZXNwb25zaXZlR3JpZExheW91dFNldHRpbmdzICYge1xuXHR0eXBlOiBcIlJlc3BvbnNpdmVHcmlkTGF5b3V0XCI7XG59O1xudHlwZSBGb3JtTGF5b3V0SW5mb3JtYXRpb24gPSBDb2x1bW5MYXlvdXQgfCBSZXNwb25zaXZlR3JpZExheW91dDtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGb3JtIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIEl0IGlzIGRlc2lnbmVkIHRvIHdvcmsgYmFzZWQgb24gYSBGaWVsZEdyb3VwIGFubm90YXRpb24gYnV0IGNhbiBhbHNvIHdvcmsgaWYgeW91IHByb3ZpZGUgYSBSZWZlcmVuY2VGYWNldCBvciBhIENvbGxlY3Rpb25GYWNldFxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGb3JtIGlkPVwiTXlGb3JtXCIgbWV0YVBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cCNHZW5lcmFsSW5mb3JtYXRpb25cIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRm9ybVxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRm9ybVwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybUJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIGZvcm0gY29udHJvbC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHVzZWQgaW4gdGhlIGN1cnJlbnQgcGFnZSBvciBibG9jay5cblx0ICogVGhpcyBzZXR0aW5nIGlzIGRlZmluZWQgYnkgdGhlIGZyYW1ld29yay5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiU2luZ2xldG9uXCIsIFwiRW50aXR5VHlwZVwiXVxuXHR9KVxuXHRjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBtZXRhbW9kZWwsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZEFubm90YXRpb25UeXBlczogW1xuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwVHlwZVwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db2xsZWN0aW9uRmFjZXRcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIlxuXHRcdF0sXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoZSBtYW5pZmVzdCBkZWZpbmVkIGZvcm0gY29udGFpbmVycyB0byBiZSBzaG93biBpbiB0aGUgYWN0aW9uIGFyZWEgb2YgdGhlIHRhYmxlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImFycmF5XCIgfSlcblx0Zm9ybUNvbnRhaW5lcnM/OiBGb3JtQ29udGFpbmVyW107XG5cblx0LyoqXG5cdCAqIENvbnRyb2wgdGhlIHJlbmRlcmluZyBvZiB0aGUgZm9ybSBjb250YWluZXIgbGFiZWxzXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHR1c2VGb3JtQ29udGFpbmVyTGFiZWxzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVG9nZ2xlIFByZXZpZXc6IFBhcnQgb2YgUHJldmlldyAvIFByZXZpZXcgdmlhICdTaG93IE1vcmUnIEJ1dHRvblxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cGFydE9mUHJldmlldzogYm9vbGVhbiA9IHRydWU7XG5cblx0LyoqXG5cdCAqIFRoZSB0aXRsZSBvZiB0aGUgZm9ybSBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHR0aXRsZT86IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgXCJhcmlhLWxldmVsXCIgb2YgdGhlIGZvcm0gdGl0bGUsIHRpdGxlcyBvZiBpbnRlcm5hbGx5IHVzZWQgZm9ybSBjb250YWluZXJzIGFyZSBuZXN0ZWQgc3Vic2VxdWVudGx5XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5jb3JlLlRpdGxlTGV2ZWxcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dGl0bGVMZXZlbDogVGl0bGVMZXZlbCA9IFRpdGxlTGV2ZWwuQXV0bztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGRpc3BsYXlNb2RlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIFx0SWYgc2V0IHRvIGZhbHNlLCB0aGUgRm9ybSBpcyBub3QgcmVuZGVyZWQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlzVmlzaWJsZTogc3RyaW5nID0gXCJ0cnVlXCI7XG5cdC8vIEluZGVwZW5kZW50IGZyb20gdGhlIGZvcm0gdGl0bGUsIGNhbiBiZSBhIGJpdCBjb25mdXNpbmcgaW4gc3RhbmRhbG9uZSB1c2FnZSBhdCBpcyBub3Qgc2hvd2luZyBhbnl0aGluZyBieSBkZWZhdWx0XG5cblx0Ly8gSnVzdCBwcm94aWVkIGRvd24gdG8gdGhlIEZpZWxkIG1heSBuZWVkIHRvIHNlZSBpZiBuZWVkZWQgb3Igbm90XG5cdEBibG9ja0V2ZW50KClcblx0b25DaGFuZ2U/OiBzdHJpbmc7XG5cblx0QGJsb2NrQWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtRWxlbWVudFwiLCBpc1B1YmxpYzogdHJ1ZSwgc2xvdDogXCJmb3JtRWxlbWVudHNcIiwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGZvcm1FbGVtZW50cz86IGFueTtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbGF5b3V0IHRvIGJlIHVzZWQgd2l0aGluIHRoZSBmb3JtLlxuXHQgKiBJdCBkZWZhdWx0cyB0byB0aGUgQ29sdW1uTGF5b3V0LCBidXQgeW91IGNhbiBhbHNvIHVzZSBhIFJlc3BvbnNpdmVHcmlkTGF5b3V0LlxuXHQgKiBBbGwgdGhlIHByb3BlcnRpZXMgb2YgdGhlIFJlc3BvbnNpdmVHcmlkTGF5b3V0IGNhbiBiZSBhZGRlZCB0byB0aGUgY29uZmlndXJhdGlvbi5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGxheW91dDogRm9ybUxheW91dEluZm9ybWF0aW9uID0geyB0eXBlOiBcIkNvbHVtbkxheW91dFwiLCBjb2x1bW5zTTogMiwgY29sdW1uc1hMOiA2LCBjb2x1bW5zTDogMywgbGFiZWxDZWxsc0xhcmdlOiAxMiB9O1xuXG5cdC8vIFVzZWZ1bCBmb3Igb3VyIGR5bmFtaWMgdGhpbmcgYnV0IGFsc28gZGVwZW5kcyBvbiB0aGUgbWV0YWRhdGEgLT4gbWFrZSBzdXJlIHRoaXMgaXMgdGFrZW4gaW50byBhY2NvdW50XG5cdF9lZGl0YWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0X2FwaUlkOiBzdHJpbmc7XG5cblx0X2NvbnRlbnRJZDogc3RyaW5nO1xuXG5cdGZhY2V0VHlwZTogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8Rm9ybUJsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKHByb3BzLCBjb25maWd1cmF0aW9uLCBtU2V0dGluZ3MpO1xuXHRcdGlmICh0aGlzLm1ldGFQYXRoICYmIHRoaXMuY29udGV4dFBhdGggJiYgKHRoaXMuZm9ybUNvbnRhaW5lcnMgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmZvcm1Db250YWluZXJzID09PSBudWxsKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdFx0Y29uc3QgbUV4dHJhU2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblx0XHRcdGxldCBvRmFjZXREZWZpbml0aW9uID0gb0NvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0XHRcdGxldCBoYXNGaWVsZEdyb3VwID0gZmFsc2U7XG5cdFx0XHRpZiAob0ZhY2V0RGVmaW5pdGlvbiAmJiBvRmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZSkge1xuXHRcdFx0XHQvLyBXcmFwIHRoZSBmYWNldCBpbiBhIGZha2UgRmFjZXQgYW5ub3RhdGlvblxuXHRcdFx0XHRoYXNGaWVsZEdyb3VwID0gdHJ1ZTtcblx0XHRcdFx0b0ZhY2V0RGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0XHQkVHlwZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiLFxuXHRcdFx0XHRcdExhYmVsOiBvRmFjZXREZWZpbml0aW9uLkxhYmVsLFxuXHRcdFx0XHRcdFRhcmdldDoge1xuXHRcdFx0XHRcdFx0JHRhcmdldDogb0ZhY2V0RGVmaW5pdGlvbixcblx0XHRcdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogb0ZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdFx0XHRwYXRoOiBcIlwiLFxuXHRcdFx0XHRcdFx0dGVybTogXCJcIixcblx0XHRcdFx0XHRcdHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIixcblx0XHRcdFx0XHRcdHZhbHVlOiBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Db250ZXh0T2JqZWN0UGF0aClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGFubm90YXRpb25zOiB7fSxcblx0XHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IG9GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHRcdH07XG5cdFx0XHRcdG1FeHRyYVNldHRpbmdzW29GYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlXSA9IHsgZmllbGRzOiB0aGlzLmZvcm1FbGVtZW50cyB9O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChcblx0XHRcdFx0b0NvbnRleHRPYmplY3RQYXRoLFxuXHRcdFx0XHQvKnRoaXMuY29udGV4dFBhdGgqLyB1bmRlZmluZWQsXG5cdFx0XHRcdG1TZXR0aW5ncyxcblx0XHRcdFx0bUV4dHJhU2V0dGluZ3Ncblx0XHRcdCk7XG5cdFx0XHRjb25zdCBvRm9ybURlZmluaXRpb24gPSBjcmVhdGVGb3JtRGVmaW5pdGlvbihvRmFjZXREZWZpbml0aW9uLCB0aGlzLmlzVmlzaWJsZSwgb0NvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0aWYgKGhhc0ZpZWxkR3JvdXApIHtcblx0XHRcdFx0b0Zvcm1EZWZpbml0aW9uLmZvcm1Db250YWluZXJzWzBdLmFubm90YXRpb25QYXRoID0gdGhpcy5tZXRhUGF0aC5nZXRQYXRoKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmZvcm1Db250YWluZXJzID0gb0Zvcm1EZWZpbml0aW9uLmZvcm1Db250YWluZXJzO1xuXHRcdFx0dGhpcy51c2VGb3JtQ29udGFpbmVyTGFiZWxzID0gb0Zvcm1EZWZpbml0aW9uLnVzZUZvcm1Db250YWluZXJMYWJlbHM7XG5cdFx0XHR0aGlzLmZhY2V0VHlwZSA9IG9GYWNldERlZmluaXRpb24gJiYgb0ZhY2V0RGVmaW5pdGlvbi4kVHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5mYWNldFR5cGUgPSB0aGlzLm1ldGFQYXRoLmdldE9iamVjdCgpPy4kVHlwZTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuaXNQdWJsaWMpIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5jcmVhdGVJZChcIkZvcm1cIikhO1xuXHRcdFx0dGhpcy5fY29udGVudElkID0gdGhpcy5pZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSB0aGlzLmlkO1xuXHRcdFx0dGhpcy5fY29udGVudElkID0gYCR7dGhpcy5pZH0tY29udGVudGA7XG5cdFx0fVxuXHRcdC8vIGlmIGRpc3BsYXlNb2RlID09PSB0cnVlIC0+IF9lZGl0YWJsZSA9IGZhbHNlXG5cdFx0Ly8gaWYgZGlzcGxheU1vZGUgPT09IGZhbHNlIC0+IF9lZGl0YWJsZSA9IHRydWVcblx0XHQvLyAgPT4gaWYgZGlzcGxheU1vZGUgPT09IHtteUJpbmRpbmdWYWx1ZX0gLT4gX2VkaXRhYmxlID0ge215QmluZGluZ1ZhbHVlfSA9PT0gdHJ1ZSA/IHRydWUgOiBmYWxzZVxuXHRcdC8vIGlmIERpc3BsYXlNb2RlID09PSB1bmRlZmluZWQgLT4gX2VkaXRhYmxlID0ge3VpPi9pc0VkaXRhYmxlfVxuXHRcdGlmICh0aGlzLmRpc3BsYXlNb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX2VkaXRhYmxlID0gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGVxdWFsKHJlc29sdmVCaW5kaW5nU3RyaW5nKHRoaXMuZGlzcGxheU1vZGUsIFwiYm9vbGVhblwiKSwgZmFsc2UpLCB0cnVlLCBmYWxzZSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9lZGl0YWJsZSA9IGNvbXBpbGVFeHByZXNzaW9uKFVJLklzRWRpdGFibGUpO1xuXHRcdH1cblx0fVxuXG5cdGdldERhdGFGaWVsZENvbGxlY3Rpb24oZm9ybUNvbnRhaW5lcjogRm9ybUNvbnRhaW5lciwgZmFjZXRDb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgZmFjZXQgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoZmFjZXRDb250ZXh0KS50YXJnZXRPYmplY3QgYXMgRmFjZXRUeXBlcztcblx0XHRsZXQgbmF2aWdhdGlvblBhdGg7XG5cdFx0bGV0IGlkUGFydDtcblx0XHRpZiAoZmFjZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0KSB7XG5cdFx0XHRuYXZpZ2F0aW9uUGF0aCA9IEFubm90YXRpb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoZmFjZXQuVGFyZ2V0LnZhbHVlKTtcblx0XHRcdGlkUGFydCA9IGZhY2V0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aFBhdGggPSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRcdGxldCBmYWNldFBhdGggPSBmYWNldENvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0aWYgKGZhY2V0UGF0aC5zdGFydHNXaXRoKGNvbnRleHRQYXRoUGF0aCkpIHtcblx0XHRcdFx0ZmFjZXRQYXRoID0gZmFjZXRQYXRoLnN1YnN0cmluZyhjb250ZXh0UGF0aFBhdGgubGVuZ3RoKTtcblx0XHRcdH1cblx0XHRcdG5hdmlnYXRpb25QYXRoID0gQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChmYWNldFBhdGgpO1xuXHRcdFx0aWRQYXJ0ID0gZmFjZXRQYXRoO1xuXHRcdH1cblx0XHRjb25zdCB0aXRsZUxldmVsID0gRm9ybUhlbHBlci5nZXRGb3JtQ29udGFpbmVyVGl0bGVMZXZlbCh0aGlzLnRpdGxlLCB0aGlzLnRpdGxlTGV2ZWwpO1xuXHRcdGNvbnN0IHRpdGxlID0gdGhpcy51c2VGb3JtQ29udGFpbmVyTGFiZWxzICYmIGZhY2V0ID8gKEFubm90YXRpb25IZWxwZXIubGFiZWwoZmFjZXQsIHsgY29udGV4dDogZmFjZXRDb250ZXh0IH0pIGFzIHN0cmluZykgOiBcIlwiO1xuXHRcdGNvbnN0IGlkID0gdGhpcy5pZCA/IGdldEZvcm1Db250YWluZXJJRChpZFBhcnQpIDogdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHhtbGBcblx0XHRcdFx0XHQ8bWFjcm86Rm9ybUNvbnRhaW5lclxuXHRcdFx0XHRcdHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiXG5cdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJpZFwiLCBpZCl9XG5cdFx0XHRcdFx0dGl0bGU9XCIke3RpdGxlfVwiXG5cdFx0XHRcdFx0dGl0bGVMZXZlbD1cIiR7dGl0bGVMZXZlbH1cIlxuXHRcdFx0XHRcdGNvbnRleHRQYXRoPVwiJHtuYXZpZ2F0aW9uUGF0aCA/IGZvcm1Db250YWluZXIuZW50aXR5U2V0IDogdGhpcy5jb250ZXh0UGF0aH1cIlxuXHRcdFx0XHRcdG1ldGFQYXRoPVwiJHtmYWNldENvbnRleHR9XCJcblx0XHRcdFx0XHRkYXRhRmllbGRDb2xsZWN0aW9uPVwiJHtmb3JtQ29udGFpbmVyLmZvcm1FbGVtZW50c31cIlxuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoPVwiJHtuYXZpZ2F0aW9uUGF0aH1cIlxuXHRcdFx0XHRcdHZpc2libGU9XCIke2Zvcm1Db250YWluZXIuaXNWaXNpYmxlfVwiXG5cdFx0XHRcdFx0ZGlzcGxheU1vZGU9XCIke3RoaXMuZGlzcGxheU1vZGV9XCJcblx0XHRcdFx0XHRvbkNoYW5nZT1cIiR7dGhpcy5vbkNoYW5nZX1cIlxuXHRcdFx0XHRcdGFjdGlvbnM9XCIke2Zvcm1Db250YWluZXIuYWN0aW9uc31cIlxuXHRcdFx0XHQ+XG5cdFx0XHRcdDxtYWNybzpmb3JtRWxlbWVudHM+XG5cdFx0XHRcdFx0PHNsb3QgbmFtZT1cImZvcm1FbGVtZW50c1wiIC8+XG5cdFx0XHRcdDwvbWFjcm86Zm9ybUVsZW1lbnRzPlxuXHRcdFx0PC9tYWNybzpGb3JtQ29udGFpbmVyPmA7XG5cdH1cblxuXHRnZXRGb3JtQ29udGFpbmVycygpIHtcblx0XHRpZiAodGhpcy5mb3JtQ29udGFpbmVycyEubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdFx0aWYgKHRoaXMuZmFjZXRUeXBlLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db2xsZWN0aW9uRmFjZXRcIikgPj0gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZm9ybUNvbnRhaW5lcnMhLm1hcCgoZm9ybUNvbnRhaW5lciwgZm9ybUNvbnRhaW5lcklkeCkgPT4ge1xuXHRcdFx0XHRpZiAoZm9ybUNvbnRhaW5lci5pc1Zpc2libGUpIHtcblx0XHRcdFx0XHRjb25zdCBmYWNldENvbnRleHQgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoZm9ybUNvbnRhaW5lci5hbm5vdGF0aW9uUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgZmFjZXQgPSBmYWNldENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZmFjZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0ICYmXG5cdFx0XHRcdFx0XHRGb3JtSGVscGVyLmlzUmVmZXJlbmNlRmFjZXRQYXJ0T2ZQcmV2aWV3KGZhY2V0LCB0aGlzLnBhcnRPZlByZXZpZXcpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRpZiAoZmFjZXQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5BZGRyZXNzVHlwZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4geG1sYDx0ZW1wbGF0ZTp3aXRoIHBhdGg9XCJmb3JtQ29udGFpbmVycz4ke2Zvcm1Db250YWluZXJJZHh9XCIgdmFyPVwiZm9ybUNvbnRhaW5lclwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDx0ZW1wbGF0ZTp3aXRoIHBhdGg9XCJmb3JtQ29udGFpbmVycz4ke2Zvcm1Db250YWluZXJJZHh9L2Fubm90YXRpb25QYXRoXCIgdmFyPVwiZmFjZXRcIj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuZm9ybS5BZGRyZXNzU2VjdGlvblwiIHR5cGU9XCJYTUxcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvdGVtcGxhdGU6d2l0aD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTp3aXRoPmA7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXREYXRhRmllbGRDb2xsZWN0aW9uKGZvcm1Db250YWluZXIsIGZhY2V0Q29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBcIlwiO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmZhY2V0VHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5mb3JtQ29udGFpbmVycyEubWFwKChmb3JtQ29udGFpbmVyKSA9PiB7XG5cdFx0XHRcdGlmIChmb3JtQ29udGFpbmVyLmlzVmlzaWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IGZhY2V0Q29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChmb3JtQ29udGFpbmVyLmFubm90YXRpb25QYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXREYXRhRmllbGRDb2xsZWN0aW9uKGZvcm1Db250YWluZXIsIGZhY2V0Q29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBwcm9wZXIgbGF5b3V0IGluZm9ybWF0aW9uIGJhc2VkIG9uIHRoZSBgbGF5b3V0YCBwcm9wZXJ0eSBkZWZpbmVkIGV4dGVybmFsbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBsYXlvdXQgaW5mb3JtYXRpb24gZm9yIHRoZSB4bWwuXG5cdCAqL1xuXHRnZXRMYXlvdXRJbmZvcm1hdGlvbigpIHtcblx0XHRzd2l0Y2ggKHRoaXMubGF5b3V0LnR5cGUpIHtcblx0XHRcdGNhc2UgXCJSZXNwb25zaXZlR3JpZExheW91dFwiOlxuXHRcdFx0XHRyZXR1cm4geG1sYDxmOlJlc3BvbnNpdmVHcmlkTGF5b3V0IGFkanVzdExhYmVsU3Bhbj1cIiR7dGhpcy5sYXlvdXQuYWRqdXN0TGFiZWxTcGFufVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrcG9pbnRMPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50TH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVha3BvaW50TT1cIiR7dGhpcy5sYXlvdXQuYnJlYWtwb2ludE19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtwb2ludFhMPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50WEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sdW1uc0w9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNNPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5zWEw9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNYTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5MPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5MfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3Bhbk09XCIke3RoaXMubGF5b3V0LmVtcHR5U3Bhbk19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZW1wdHlTcGFuUz1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuU31cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5YTD1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuTD1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5NPVwiJHt0aGlzLmxheW91dC5sYWJlbFNwYW5NfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsU3BhblM9XCIke3RoaXMubGF5b3V0LmxhYmVsU3BhblN9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuWEw9XCIke3RoaXMubGF5b3V0LmxhYmVsU3BhblhMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNpbmdsZUNvbnRhaW5lckZ1bGxTaXplPVwiJHt0aGlzLmxheW91dC5zaW5nbGVDb250YWluZXJGdWxsU2l6ZX1cIiAvPmA7XG5cdFx0XHRjYXNlIFwiQ29sdW1uTGF5b3V0XCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4geG1sYDxmOkNvbHVtbkxheW91dFxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNNPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTX1cIlxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNMPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTH1cIlxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNYTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc1hMfVwiXG5cdFx0XHRcdFx0XHRcdFx0bGFiZWxDZWxsc0xhcmdlPVwiJHt0aGlzLmxheW91dC5sYWJlbENlbGxzTGFyZ2V9XCJcblx0XHRcdFx0XHRcdFx0XHRlbXB0eUNlbGxzTGFyZ2U9XCIke3RoaXMubGF5b3V0LmVtcHR5Q2VsbHNMYXJnZX1cIiAvPmA7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3Qgb25DaGFuZ2VTdHIgPSAodGhpcy5vbkNoYW5nZSAmJiB0aGlzLm9uQ2hhbmdlLnJlcGxhY2UoXCJ7XCIsIFwiXFxcXHtcIikucmVwbGFjZShcIn1cIiwgXCJcXFxcfVwiKSkgfHwgXCJcIjtcblx0XHRjb25zdCBtZXRhUGF0aFBhdGggPSB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRjb25zdCBjb250ZXh0UGF0aFBhdGggPSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRpZiAoIXRoaXMuaXNWaXNpYmxlKSB7XG5cdFx0XHRyZXR1cm4geG1sYGA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgPG1hY3JvOkZvcm1BUEkgeG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zLmZvcm1cIlxuXHRcdFx0XHRcdHhtbG5zOm1hY3JvZGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdFx0XHRcdHhtbG5zOmY9XCJzYXAudWkubGF5b3V0LmZvcm1cIlxuXHRcdFx0XHRcdHhtbG5zOmZsPVwic2FwLnVpLmZsXCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5fYXBpSWR9XCJcblx0XHRcdFx0XHRtZXRhUGF0aD1cIiR7bWV0YVBhdGhQYXRofVwiXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg9XCIke2NvbnRleHRQYXRoUGF0aH1cIj5cblx0XHRcdFx0PGY6Rm9ybVxuXHRcdFx0XHRcdGZsOmRlbGVnYXRlPSd7XG5cdFx0XHRcdFx0XHRcIm5hbWVcIjogXCJzYXAvZmUvbWFjcm9zL2Zvcm0vRm9ybURlbGVnYXRlXCIsXG5cdFx0XHRcdFx0XHRcImRlbGVnYXRlVHlwZVwiOiBcImNvbXBsZXRlXCJcblx0XHRcdFx0XHR9J1xuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLl9jb250ZW50SWR9XCJcblx0XHRcdFx0XHRlZGl0YWJsZT1cIiR7dGhpcy5fZWRpdGFibGV9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZW50aXR5U2V0PVwie2NvbnRleHRQYXRoPkBzYXB1aS5uYW1lfVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy5pc1Zpc2libGV9XCJcblx0XHRcdFx0XHRjbGFzcz1cInNhcFV4QVBPYmplY3RQYWdlU3ViU2VjdGlvbkFsaWduQ29udGVudFwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOm5hdmlnYXRpb25QYXRoPVwiJHtjb250ZXh0UGF0aFBhdGh9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6b25DaGFuZ2U9XCIke29uQ2hhbmdlU3RyfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0XHQke3RoaXMuYWRkQ29uZGl0aW9uYWxseShcblx0XHRcdFx0XHRcdHRoaXMudGl0bGUgIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdHhtbGA8Zjp0aXRsZT5cblx0XHRcdFx0XHRcdFx0PGNvcmU6VGl0bGUgbGV2ZWw9XCIke3RoaXMudGl0bGVMZXZlbH1cIiB0ZXh0PVwiJHt0aGlzLnRpdGxlfVwiIC8+XG5cdFx0XHRcdFx0XHQ8L2Y6dGl0bGU+YFxuXHRcdFx0XHRcdCl9XG5cdFx0XHRcdFx0PGY6bGF5b3V0PlxuXHRcdFx0XHRcdCR7dGhpcy5nZXRMYXlvdXRJbmZvcm1hdGlvbigpfVxuXG5cdFx0XHRcdFx0PC9mOmxheW91dD5cblx0XHRcdFx0XHQ8Zjpmb3JtQ29udGFpbmVycz5cblx0XHRcdFx0XHRcdCR7dGhpcy5nZXRGb3JtQ29udGFpbmVycygpfVxuXHRcdFx0XHRcdDwvZjpmb3JtQ29udGFpbmVycz5cblx0XHRcdFx0PC9mOkZvcm0+XG5cdFx0XHQ8L21hY3JvOkZvcm1BUEk+YDtcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BaURxQkEsU0FBUztFQW5COUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLE9BY0NDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsTUFBTTtJQUNaQyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DQyxlQUFlLEVBQUU7RUFDbEIsQ0FBQyxDQUFDLFVBT0FDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFTbEVILGNBQWMsQ0FBQztJQUNmQyxJ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