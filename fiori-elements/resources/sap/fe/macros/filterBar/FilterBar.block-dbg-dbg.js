/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/FilterHelper", "sap/fe/macros/CommonHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataVisualization, FilterBar, MetaModelConverter, MetaModelFunction, ModelHelper, StableIdHelper, TemplateModel, FilterHelper, CommonHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30;
  var _exports = {};
  var getFilterConditions = FilterHelper.getFilterConditions;
  var generate = StableIdHelper.generate;
  var getSearchRestrictions = MetaModelFunction.getSearchRestrictions;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
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
  const setCustomFilterFieldProperties = function (childFilterField, aggregationObject) {
    aggregationObject.slotName = aggregationObject.key;
    aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
    aggregationObject.label = childFilterField.getAttribute("label");
    aggregationObject.required = childFilterField.getAttribute("required") === "true";
    return aggregationObject;
  };

  /**
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar
   *   id="SomeID"
   *   showAdaptFiltersButton="true"
   *   p13nMode=["Item","Value"]
   *   listBindingNames = "sap.fe.tableBinding"
   *   liveMode="true"
   *   search=".handlers.onSearch"
   *   filterChanged=".handlers.onFiltersChanged"
   * /&gt;
   * </pre>
   *
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   *
   * @since 1.94.0
   */
  let FilterBarBlock = (_dec = defineBuildingBlock({
    name: "FilterBar",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean"
  }), _dec12 = blockAttribute({
    type: "boolean"
  }), _dec13 = blockAttribute({
    type: "sap.ui.mdc.FilterBarP13nMode[]"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "boolean"
  }), _dec16 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec17 = blockAttribute({
    type: "string",
    required: false
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockEvent(), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockEvent(), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec31 = blockAggregation({
    type: "sap.fe.macros.FilterField",
    isPublic: true,
    hasVirtualNode: true,
    processAggregations: setCustomFilterFieldProperties
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterBarBlock, _BuildingBlockBase);
    /**
     * ID of the FilterBar
     */

    /**
     * selectionFields to be displayed
     */

    /**
     * Displays possible errors during the search in a message box
     */

    /**
     * ID of the assigned variant management
     */

    /**
     * Don't show the basic search field
     */

    /**
     * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
     */

    /**
     * Handles visibility of the 'Adapt Filters' button on the FilterBar
     */

    /**
     * Specifies the personalization options for the filter bar.
     */

    /**
     * Specifies the Sematic Date Range option for the filter bar.
     */

    /**
     * If set the search will be automatically triggered, when a filter value was changed.
     */

    /**
     * Filter conditions to be applied to the filter bar
     */

    /**
     * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
     * a search is triggered immediately if one or more search requests have been triggered in the meantime
     * but were ignored based on the setting.
     */

    /**
     * Id of control that will allow for switching between normal and visual filter
     */

    /**
     * Handles the visibility of the 'Clear' button on the FilterBar.
     */

    /**
     * Event handler to react to the search event of the FilterBar
     */

    /**
     * Event handler to react to the filterChange event of the FilterBar
     */

    /**
     * Event handler to react to the stateChange event of the FilterBar.
     */

    /**
     * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
     */

    /**
     * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
     */

    /**
     * Event handler to react to the afterClear event of the FilterBar
     */

    function FilterBarBlock(props, configuration, mSettings) {
      var _targetDataModelObjec, _targetDataModelObjec2, _targetDataModelObjec3, _targetDataModelObjec4;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionFields", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarDelegate", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantBackreference", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideBasicSearch", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFallback", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showAdaptFiltersButton", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "p13nMode", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyInfo", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterConditions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "suspendSelection", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showDraftEditState", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isDraftCollaborative", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "toggleControlId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "initialLayout", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor30, _assertThisInitialized(_this));
      _this.checkIfCollaborationDraftSupported = oMetaModel => {
        if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
          _this.isDraftCollaborative = true;
        }
      };
      _this.getEntityTypePath = metaPathParts => {
        return metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
      };
      _this.getSearch = () => {
        if (!_this.hideBasicSearch) {
          return xml`<control:basicSearchField>
			<mdc:FilterField
				id="${generate([_this.id, "BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`;
        }
        return xml``;
      };
      _this.processSelectionFields = () => {
        var _this$_filterFields, _this$selectionFields, _this$_filterFields2, _this$_valueHelps;
        let draftEditState = xml``;
        if (_this.showDraftEditState) {
          draftEditState = `<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`;
        }
        _this._valueHelps = [];
        _this._filterFields = [];
        (_this$_filterFields = _this._filterFields) === null || _this$_filterFields === void 0 ? void 0 : _this$_filterFields.push(draftEditState);
        if (!Array.isArray(_this.selectionFields)) {
          _this.selectionFields = _this.selectionFields.getObject();
        }
        (_this$selectionFields = _this.selectionFields) === null || _this$selectionFields === void 0 ? void 0 : _this$selectionFields.forEach((selectionField, selectionFieldIdx) => {
          if (selectionField.availability === "Default") {
            _this.setFilterFieldsAndValueHelps(selectionField, selectionFieldIdx);
          }
        });
        _this._filterFields = ((_this$_filterFields2 = _this._filterFields) === null || _this$_filterFields2 === void 0 ? void 0 : _this$_filterFields2.length) > 0 ? _this._filterFields : "";
        _this._valueHelps = ((_this$_valueHelps = _this._valueHelps) === null || _this$_valueHelps === void 0 ? void 0 : _this$_valueHelps.length) > 0 ? _this._valueHelps : "";
      };
      _this.setFilterFieldsAndValueHelps = (selectionField, selectionFieldIdx) => {
        if (selectionField.template === undefined && selectionField.type !== "Slot") {
          _this.pushFilterFieldsAndValueHelps(selectionField);
        } else if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields3;
          (_this$_filterFields3 = _this._filterFields) === null || _this$_filterFields3 === void 0 ? void 0 : _this$_filterFields3.push(xml`<template:with path="selectionFields>${selectionFieldIdx}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`);
        }
      };
      _this.pushFilterFieldsAndValueHelps = selectionField => {
        if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields4;
          (_this$_filterFields4 = _this._filterFields) === null || _this$_filterFields4 === void 0 ? void 0 : _this$_filterFields4.push(xml`<internalMacro:FilterField
			idPrefix="${generate([_this.id, "FilterField", CommonHelper.getNavigationPath(selectionField.annotationPath)])}"
			vhIdPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			useSemanticDateRange="${_this.useSemanticDateRange}"
			settings="${CommonHelper.stringifyCustomData(selectionField.settings)}"
			visualFilter="${selectionField.visualFilter}"
			/>`);
        }
        if (Array.isArray(_this._valueHelps)) {
          var _this$_valueHelps2;
          (_this$_valueHelps2 = _this._valueHelps) === null || _this$_valueHelps2 === void 0 ? void 0 : _this$_valueHelps2.push(xml`<macro:ValueHelp
			idPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${_this.useSemanticDateRange}"
		/>`);
        }
      };
      const oContext = _this.contextPath;
      const oMetaPathContext = _this.metaPath;
      if (!oMetaPathContext) {
        Log.error("Context Path not available for FilterBar Macro.");
        return _assertThisInitialized(_this);
      }
      const sMetaPath = oMetaPathContext === null || oMetaPathContext === void 0 ? void 0 : oMetaPathContext.getPath();
      let entityTypePath = "";
      const _metaPathParts = (sMetaPath === null || sMetaPath === void 0 ? void 0 : sMetaPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")) || []; // [0]: entityTypePath, [1]: SF Qualifier.
      if (_metaPathParts.length > 0) {
        entityTypePath = _this.getEntityTypePath(_metaPathParts);
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
      const _oMetaModel = oContext === null || oContext === void 0 ? void 0 : oContext.getModel();
      _this._internalContextPath = _oMetaModel === null || _oMetaModel === void 0 ? void 0 : _oMetaModel.createBindingContext(entityTypePath);
      const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
      const annotationPath = "@com.sap.vocabularies.UI.v1.SelectionFields" + (_metaPathParts.length && _metaPathParts[1] || "");
      const oExtraParams = {};
      oExtraParams[sObjectPath] = {
        filterFields: _this.filterFields
      };
      const oVisualizationObjectPath = getInvolvedDataModelObjects(_this._internalContextPath);
      const oConverterContext = _this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
      if (!_this.propertyInfo) {
        _this.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
      }

      //Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
      if (!_this.selectionFields) {
        const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
        _this.selectionFields = new TemplateModel(oSelectionFields, _oMetaModel).createBindingContext("/");
        const oEntityType = oConverterContext.getEntityType(),
          oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
          oEntitySetContext = _oMetaModel.getContext(sEntitySetPath),
          oFilterConditions = getFilterConditions(oEntitySetContext, {
            selectionVariant: oSelectionVariant
          });
        _this.filterConditions = oFilterConditions;
      }
      _this._processPropertyInfos(_this.propertyInfo);
      const targetDataModelObject = getInvolvedDataModelObjects(oContext).targetObject;
      if ((_targetDataModelObjec = targetDataModelObject.annotations) !== null && _targetDataModelObjec !== void 0 && (_targetDataModelObjec2 = _targetDataModelObjec.Common) !== null && _targetDataModelObjec2 !== void 0 && _targetDataModelObjec2.DraftRoot || (_targetDataModelObjec3 = targetDataModelObject.annotations) !== null && _targetDataModelObjec3 !== void 0 && (_targetDataModelObjec4 = _targetDataModelObjec3.Common) !== null && _targetDataModelObjec4 !== void 0 && _targetDataModelObjec4.DraftNode) {
        _this.showDraftEditState = true;
        _this.checkIfCollaborationDraftSupported(_oMetaModel);
      }
      if (_this._applyIdToContent) {
        _this._apiId = _this.id + "::FilterBar";
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = _this.getContentId(_this.id + "");
      }
      if (_this.hideBasicSearch !== true) {
        const oSearchRestrictionAnnotation = getSearchRestrictions(sEntitySetPath, _oMetaModel);
        _this.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
      }
      _this.processSelectionFields();
      return _this;
    }
    _exports = FilterBarBlock;
    var _proto = FilterBarBlock.prototype;
    _proto._processPropertyInfos = function _processPropertyInfos(propertyInfo) {
      const aParameterFields = [];
      if (propertyInfo) {
        const sFetchedProperties = propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
        const aFetchedProperties = JSON.parse(sFetchedProperties);
        const editStateLabel = this.getTranslatedText("FILTERBAR_EDITING_STATUS");
        aFetchedProperties.forEach(function (propInfo) {
          if (propInfo.isParameter) {
            aParameterFields.push(propInfo.name);
          }
          if (propInfo.path === "$editState") {
            propInfo.label = editStateLabel;
          }
        });
        this.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
      }
      this._parameters = JSON.stringify(aParameterFields);
    };
    _proto._getContextPathForFilterField = function _getContextPathForFilterField(selectionField, filterBarContextPath) {
      let contextPath = filterBarContextPath;
      if (selectionField.isParameter) {
        // Example:
        // FilterBarContextPath: /Customer/Set
        // ParameterPropertyPath: /Customer/P_CC
        // ContextPathForFilterField: /Customer
        const annoPath = selectionField.annotationPath;
        contextPath = annoPath.substring(0, annoPath.lastIndexOf("/") + 1);
      }
      return contextPath;
    };
    _proto.getTemplate = function getTemplate() {
      var _this$_internalContex;
      const internalContextPath = (_this$_internalContex = this._internalContextPath) === null || _this$_internalContex === void 0 ? void 0 : _this$_internalContex.getPath();
      let filterDelegate = "";
      if (this.filterBarDelegate) {
        filterDelegate = this.filterBarDelegate;
      } else {
        filterDelegate = "{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '" + internalContextPath + "'}}";
      }
      return xml`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${filterDelegate}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${internalContextPath}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`;
    };
    return FilterBarBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "selectionFields", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filterBarDelegate", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "variantBackreference", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "hideBasicSearch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enableFallback", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showAdaptFiltersButton", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "p13nMode", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "Item,Value";
    }
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "propertyInfo", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "filterConditions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "suspendSelection", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showDraftEditState", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "isDraftCollaborative", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "toggleControlId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "initialLayout", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "compact";
    }
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FilterBarBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXMiLCJjaGlsZEZpbHRlckZpZWxkIiwiYWdncmVnYXRpb25PYmplY3QiLCJzbG90TmFtZSIsImtleSIsInJlcGxhY2UiLCJsYWJlbCIsImdldEF0dHJpYnV0ZSIsInJlcXVpcmVkIiwiRmlsdGVyQmFyQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwiYmxvY2tFdmVudCIsImJsb2NrQWdncmVnYXRpb24iLCJoYXNWaXJ0dWFsTm9kZSIsInByb2Nlc3NBZ2dyZWdhdGlvbnMiLCJwcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJtU2V0dGluZ3MiLCJjaGVja0lmQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwib01ldGFNb2RlbCIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJpc0RyYWZ0Q29sbGFib3JhdGl2ZSIsImdldEVudGl0eVR5cGVQYXRoIiwibWV0YVBhdGhQYXJ0cyIsImVuZHNXaXRoIiwiZ2V0U2VhcmNoIiwiaGlkZUJhc2ljU2VhcmNoIiwieG1sIiwiZ2VuZXJhdGUiLCJpZCIsInByb2Nlc3NTZWxlY3Rpb25GaWVsZHMiLCJkcmFmdEVkaXRTdGF0ZSIsInNob3dEcmFmdEVkaXRTdGF0ZSIsIl92YWx1ZUhlbHBzIiwiX2ZpbHRlckZpZWxkcyIsInB1c2giLCJBcnJheSIsImlzQXJyYXkiLCJzZWxlY3Rpb25GaWVsZHMiLCJnZXRPYmplY3QiLCJmb3JFYWNoIiwic2VsZWN0aW9uRmllbGQiLCJzZWxlY3Rpb25GaWVsZElkeCIsImF2YWlsYWJpbGl0eSIsInNldEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMiLCJsZW5ndGgiLCJ0ZW1wbGF0ZSIsInVuZGVmaW5lZCIsInB1c2hGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzIiwiQ29tbW9uSGVscGVyIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJhbm5vdGF0aW9uUGF0aCIsIl9nZXRDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkIiwiX2ludGVybmFsQ29udGV4dFBhdGgiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJzZXR0aW5ncyIsInZpc3VhbEZpbHRlciIsIm9Db250ZXh0IiwiY29udGV4dFBhdGgiLCJvTWV0YVBhdGhDb250ZXh0IiwibWV0YVBhdGgiLCJMb2ciLCJlcnJvciIsInNNZXRhUGF0aCIsImdldFBhdGgiLCJlbnRpdHlUeXBlUGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXRQYXRoIiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNPYmplY3RQYXRoIiwib0V4dHJhUGFyYW1zIiwiZmlsdGVyRmllbGRzIiwib1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwib0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0IiwicHJvcGVydHlJbmZvIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwic1Byb3BlcnR5SW5mbyIsIm9TZWxlY3Rpb25GaWVsZHMiLCJUZW1wbGF0ZU1vZGVsIiwib0VudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwib1NlbGVjdGlvblZhcmlhbnQiLCJnZXRTZWxlY3Rpb25WYXJpYW50Iiwib0VudGl0eVNldENvbnRleHQiLCJnZXRDb250ZXh0Iiwib0ZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwic2VsZWN0aW9uVmFyaWFudCIsImZpbHRlckNvbmRpdGlvbnMiLCJfcHJvY2Vzc1Byb3BlcnR5SW5mb3MiLCJ0YXJnZXREYXRhTW9kZWxPYmplY3QiLCJ0YXJnZXRPYmplY3QiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkRyYWZ0Um9vdCIsIkRyYWZ0Tm9kZSIsIl9hcHBseUlkVG9Db250ZW50IiwiX2FwaUlkIiwiX2NvbnRlbnRJZCIsImdldENvbnRlbnRJZCIsIm9TZWFyY2hSZXN0cmljdGlvbkFubm90YXRpb24iLCJnZXRTZWFyY2hSZXN0cmljdGlvbnMiLCJCb29sZWFuIiwiU2VhcmNoYWJsZSIsImFQYXJhbWV0ZXJGaWVsZHMiLCJzRmV0Y2hlZFByb3BlcnRpZXMiLCJhRmV0Y2hlZFByb3BlcnRpZXMiLCJKU09OIiwicGFyc2UiLCJlZGl0U3RhdGVMYWJlbCIsImdldFRyYW5zbGF0ZWRUZXh0IiwicHJvcEluZm8iLCJpc1BhcmFtZXRlciIsInBhdGgiLCJzdHJpbmdpZnkiLCJfcGFyYW1ldGVycyIsImZpbHRlckJhckNvbnRleHRQYXRoIiwiYW5ub1BhdGgiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldFRlbXBsYXRlIiwiaW50ZXJuYWxDb250ZXh0UGF0aCIsImZpbHRlckRlbGVnYXRlIiwiZmlsdGVyQmFyRGVsZWdhdGUiLCJzZWFyY2giLCJmaWx0ZXJDaGFuZ2VkIiwiYWZ0ZXJDbGVhciIsImludGVybmFsU2VhcmNoIiwiaW50ZXJuYWxGaWx0ZXJDaGFuZ2VkIiwic3RhdGVDaGFuZ2UiLCJsaXZlTW9kZSIsInZhcmlhbnRCYWNrcmVmZXJlbmNlIiwic2hvd0FkYXB0RmlsdGVyc0J1dHRvbiIsInNob3dDbGVhckJ1dHRvbiIsInAxM25Nb2RlIiwic3VzcGVuZFNlbGVjdGlvbiIsInNob3dNZXNzYWdlcyIsInRvZ2dsZUNvbnRyb2xJZCIsImluaXRpYWxMYXlvdXQiLCJ2aXNpYmxlIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhci5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZWxlY3Rpb25GaWVsZHMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25GaWVsZHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0U2VhcmNoUmVzdHJpY3Rpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IFRlbXBsYXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlTW9kZWxcIjtcbmltcG9ydCB7IEZpbHRlckNvbmRpdGlvbnMsIGdldEZpbHRlckNvbmRpdGlvbnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwiLi4vRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgeyBGaWx0ZXJGaWVsZCB9IGZyb20gXCIuL0ZpbHRlckJhckFQSVwiO1xuXG5jb25zdCBzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoY2hpbGRGaWx0ZXJGaWVsZDogRWxlbWVudCwgYWdncmVnYXRpb25PYmplY3Q6IGFueSk6IEZpbHRlckZpZWxkIHtcblx0YWdncmVnYXRpb25PYmplY3Quc2xvdE5hbWUgPSBhZ2dyZWdhdGlvbk9iamVjdC5rZXk7XG5cdGFnZ3JlZ2F0aW9uT2JqZWN0LmtleSA9IGFnZ3JlZ2F0aW9uT2JqZWN0LmtleS5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKTtcblx0YWdncmVnYXRpb25PYmplY3QubGFiZWwgPSBjaGlsZEZpbHRlckZpZWxkLmdldEF0dHJpYnV0ZShcImxhYmVsXCIpO1xuXHRhZ2dyZWdhdGlvbk9iamVjdC5yZXF1aXJlZCA9IGNoaWxkRmlsdGVyRmllbGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZWRcIikgPT09IFwidHJ1ZVwiO1xuXHRyZXR1cm4gYWdncmVnYXRpb25PYmplY3Q7XG59O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZpbHRlckJhciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckJhclxuICogICBpZD1cIlNvbWVJRFwiXG4gKiAgIHNob3dBZGFwdEZpbHRlcnNCdXR0b249XCJ0cnVlXCJcbiAqICAgcDEzbk1vZGU9W1wiSXRlbVwiLFwiVmFsdWVcIl1cbiAqICAgbGlzdEJpbmRpbmdOYW1lcyA9IFwic2FwLmZlLnRhYmxlQmluZGluZ1wiXG4gKiAgIGxpdmVNb2RlPVwidHJ1ZVwiXG4gKiAgIHNlYXJjaD1cIi5oYW5kbGVycy5vblNlYXJjaFwiXG4gKiAgIGZpbHRlckNoYW5nZWQ9XCIuaGFuZGxlcnMub25GaWx0ZXJzQ2hhbmdlZFwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyQmFyIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKiBAc2luY2UgMS45NC4wXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJGaWx0ZXJCYXJcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbHRlckJhckJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0dmlzaWJsZT86IHN0cmluZztcblxuXHQvKipcblx0ICogc2VsZWN0aW9uRmllbGRzIHRvIGJlIGRpc3BsYXllZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0c2VsZWN0aW9uRmllbGRzPzogU2VsZWN0aW9uRmllbGRzIHwgQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhckRlbGVnYXRlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoPzogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRjb250ZXh0UGF0aD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHBvc3NpYmxlIGVycm9ycyBkdXJpbmcgdGhlIHNlYXJjaCBpbiBhIG1lc3NhZ2UgYm94XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHNob3dNZXNzYWdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgYXNzaWduZWQgdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFyaWFudEJhY2tyZWZlcmVuY2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERvbid0IHNob3cgdGhlIGJhc2ljIHNlYXJjaCBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRoaWRlQmFzaWNTZWFyY2g/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBmYWxsYmFjayB0byBzaG93IGFsbCBmaWVsZHMgb2YgdGhlIEVudGl0eVR5cGUgYXMgZmlsdGVyIGZpZWxkcyBpZiBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHMgYXJlIG5vdCBwcmVzZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGVuYWJsZUZhbGxiYWNrOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdmlzaWJpbGl0eSBvZiB0aGUgJ0FkYXB0IEZpbHRlcnMnIGJ1dHRvbiBvbiB0aGUgRmlsdGVyQmFyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dBZGFwdEZpbHRlcnNCdXR0b246IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubWRjLkZpbHRlckJhclAxM25Nb2RlW11cIlxuXHR9KVxuXHRwMTNuTW9kZTogc3RyaW5nID0gXCJJdGVtLFZhbHVlXCI7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHByb3BlcnR5SW5mbz86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0dXNlU2VtYW50aWNEYXRlUmFuZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdGhlIHNlYXJjaCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdHJpZ2dlcmVkLCB3aGVuIGEgZmlsdGVyIHZhbHVlIHdhcyBjaGFuZ2VkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRsaXZlTW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgY29uZGl0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdH0pXG5cdGZpbHRlckNvbmRpdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+O1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdG8gPGNvZGU+dHJ1ZTwvY29kZT4sIGFsbCBzZWFyY2ggcmVxdWVzdHMgYXJlIGlnbm9yZWQuIE9uY2UgaXQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPmZhbHNlPC9jb2RlPixcblx0ICogYSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5IGlmIG9uZSBvciBtb3JlIHNlYXJjaCByZXF1ZXN0cyBoYXZlIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBtZWFudGltZVxuXHQgKiBidXQgd2VyZSBpZ25vcmVkIGJhc2VkIG9uIHRoZSBzZXR0aW5nLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzdXNwZW5kU2VsZWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzaG93RHJhZnRFZGl0U3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGlzRHJhZnRDb2xsYWJvcmF0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIElkIG9mIGNvbnRyb2wgdGhhdCB3aWxsIGFsbG93IGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBub3JtYWwgYW5kIHZpc3VhbCBmaWx0ZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHR0b2dnbGVDb250cm9sSWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGluaXRpYWxMYXlvdXQ6IHN0cmluZyA9IFwiY29tcGFjdFwiO1xuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnQ2xlYXInIGJ1dHRvbiBvbiB0aGUgRmlsdGVyQmFyLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRzaG93Q2xlYXJCdXR0b246IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdF9hcHBseUlkVG9Db250ZW50OiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIFRlbXBvcmFyeSB3b3JrYXJvdW5kIG9ubHlcblx0ICogcGF0aCB0byBjb250ZXh0UGF0aCB0byBiZSB1c2VkIGJ5IGNoaWxkIGZpbHRlcmZpZWxkc1xuXHQgKi9cblx0X2ludGVybmFsQ29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdF9wYXJhbWV0ZXJzOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIHNlYXJjaCBldmVudCBvZiB0aGUgRmlsdGVyQmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHNlYXJjaD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgZmlsdGVyQ2hhbmdlIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0ZmlsdGVyQ2hhbmdlZD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc3RhdGVDaGFuZ2UgZXZlbnQgb2YgdGhlIEZpbHRlckJhci5cblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0c3RhdGVDaGFuZ2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGZpbHRlckNoYW5nZWQgZXZlbnQgb2YgdGhlIEZpbHRlckJhci4gRXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdGludGVybmFsRmlsdGVyQ2hhbmdlZD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc2VhcmNoIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXIuIEV4cG9zZXMgcGFyYW1ldGVyZXMgZnJvbSB0aGUgTURDIGZpbHRlciBiYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0aW50ZXJuYWxTZWFyY2g/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGFmdGVyQ2xlYXIgZXZlbnQgb2YgdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRhZnRlckNsZWFyPzogc3RyaW5nO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRoYXNWaXJ0dWFsTm9kZTogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXNcblx0fSlcblx0ZmlsdGVyRmllbGRzPzogRmlsdGVyRmllbGQ7XG5cblx0X2FwaUlkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0X2NvbnRlbnRJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF92YWx1ZUhlbHBzOiBBcnJheTxzdHJpbmc+IHwgXCJcIiB8IHVuZGVmaW5lZDtcblxuXHRfZmlsdGVyRmllbGRzOiBBcnJheTxzdHJpbmc+IHwgXCJcIiB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZpbHRlckJhckJsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKHByb3BzLCBjb25maWd1cmF0aW9uLCBtU2V0dGluZ3MpO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aDtcblx0XHRjb25zdCBvTWV0YVBhdGhDb250ZXh0ID0gdGhpcy5tZXRhUGF0aDtcblx0XHRpZiAoIW9NZXRhUGF0aENvbnRleHQpIHtcblx0XHRcdExvZy5lcnJvcihcIkNvbnRleHQgUGF0aCBub3QgYXZhaWxhYmxlIGZvciBGaWx0ZXJCYXIgTWFjcm8uXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzTWV0YVBhdGggPSBvTWV0YVBhdGhDb250ZXh0Py5nZXRQYXRoKCk7XG5cdFx0bGV0IGVudGl0eVR5cGVQYXRoID0gXCJcIjtcblx0XHRjb25zdCBtZXRhUGF0aFBhcnRzID0gc01ldGFQYXRoPy5zcGxpdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpIHx8IFtdOyAvLyBbMF06IGVudGl0eVR5cGVQYXRoLCBbMV06IFNGIFF1YWxpZmllci5cblx0XHRpZiAobWV0YVBhdGhQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRlbnRpdHlUeXBlUGF0aCA9IHRoaXMuZ2V0RW50aXR5VHlwZVBhdGgobWV0YVBhdGhQYXJ0cyk7XG5cdFx0fVxuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChlbnRpdHlUeXBlUGF0aCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0Py5nZXRNb2RlbCgpO1xuXHRcdHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGggPSBvTWV0YU1vZGVsPy5jcmVhdGVCaW5kaW5nQ29udGV4dChlbnRpdHlUeXBlUGF0aCkgYXMgQ29udGV4dDtcblx0XHRjb25zdCBzT2JqZWN0UGF0aCA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiO1xuXHRcdGNvbnN0IGFubm90YXRpb25QYXRoOiBzdHJpbmcgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIiArICgobWV0YVBhdGhQYXJ0cy5sZW5ndGggJiYgbWV0YVBhdGhQYXJ0c1sxXSkgfHwgXCJcIik7XG5cdFx0Y29uc3Qgb0V4dHJhUGFyYW1zOiBhbnkgPSB7fTtcblx0XHRvRXh0cmFQYXJhbXNbc09iamVjdFBhdGhdID0ge1xuXHRcdFx0ZmlsdGVyRmllbGRzOiB0aGlzLmZpbHRlckZpZWxkc1xuXHRcdH07XG5cdFx0Y29uc3Qgb1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCwgdW5kZWZpbmVkLCBtU2V0dGluZ3MsIG9FeHRyYVBhcmFtcyk7XG5cdFx0aWYgKCF0aGlzLnByb3BlcnR5SW5mbykge1xuXHRcdFx0dGhpcy5wcm9wZXJ0eUluZm8gPSBnZXRTZWxlY3Rpb25GaWVsZHMob0NvbnZlcnRlckNvbnRleHQsIFtdLCBhbm5vdGF0aW9uUGF0aCkuc1Byb3BlcnR5SW5mbztcblx0XHR9XG5cblx0XHQvL0ZpbHRlciBGaWVsZHMgYW5kIHZhbHVlcyB0byB0aGUgZmllbGQgYXJlIGZpbGxlZCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uRmllbGRzIGFuZCB0aGlzIHdvdWxkIGJlIGVtcHR5IGluIGNhc2Ugb2YgbWFjcm8gb3V0c2lkZSB0aGUgRkUgdGVtcGxhdGVcblx0XHRpZiAoIXRoaXMuc2VsZWN0aW9uRmllbGRzKSB7XG5cdFx0XHRjb25zdCBvU2VsZWN0aW9uRmllbGRzID0gZ2V0U2VsZWN0aW9uRmllbGRzKG9Db252ZXJ0ZXJDb250ZXh0LCBbXSwgYW5ub3RhdGlvblBhdGgpLnNlbGVjdGlvbkZpZWxkcztcblx0XHRcdHRoaXMuc2VsZWN0aW9uRmllbGRzID0gbmV3IFRlbXBsYXRlTW9kZWwob1NlbGVjdGlvbkZpZWxkcywgb01ldGFNb2RlbCBhcyBPRGF0YU1ldGFNb2RlbCkuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHRcdFx0Y29uc3Qgb0VudGl0eVR5cGUgPSBvQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksXG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gZ2V0U2VsZWN0aW9uVmFyaWFudChvRW50aXR5VHlwZSwgb0NvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IChvTWV0YU1vZGVsIGFzIE9EYXRhTWV0YU1vZGVsKS5nZXRDb250ZXh0KHNFbnRpdHlTZXRQYXRoKSxcblx0XHRcdFx0b0ZpbHRlckNvbmRpdGlvbnMgPSBnZXRGaWx0ZXJDb25kaXRpb25zKG9FbnRpdHlTZXRDb250ZXh0LCB7IHNlbGVjdGlvblZhcmlhbnQ6IG9TZWxlY3Rpb25WYXJpYW50IH0pO1xuXHRcdFx0dGhpcy5maWx0ZXJDb25kaXRpb25zID0gb0ZpbHRlckNvbmRpdGlvbnM7XG5cdFx0fVxuXHRcdHRoaXMuX3Byb2Nlc3NQcm9wZXJ0eUluZm9zKHRoaXMucHJvcGVydHlJbmZvKTtcblxuXHRcdGNvbnN0IHRhcmdldERhdGFNb2RlbE9iamVjdCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvQ29udGV4dCEpLnRhcmdldE9iamVjdDtcblx0XHRpZiAodGFyZ2V0RGF0YU1vZGVsT2JqZWN0LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCB8fCB0YXJnZXREYXRhTW9kZWxPYmplY3QuYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnROb2RlKSB7XG5cdFx0XHR0aGlzLnNob3dEcmFmdEVkaXRTdGF0ZSA9IHRydWU7XG5cdFx0XHR0aGlzLmNoZWNrSWZDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2FwcGx5SWRUb0NvbnRlbnQpIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZCArIFwiOjpGaWx0ZXJCYXJcIjtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuaWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuZ2V0Q29udGVudElkKHRoaXMuaWQgKyBcIlwiKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5oaWRlQmFzaWNTZWFyY2ggIT09IHRydWUpIHtcblx0XHRcdGNvbnN0IG9TZWFyY2hSZXN0cmljdGlvbkFubm90YXRpb24gPSBnZXRTZWFyY2hSZXN0cmljdGlvbnMoc0VudGl0eVNldFBhdGgsIG9NZXRhTW9kZWwgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRcdFx0dGhpcy5oaWRlQmFzaWNTZWFyY2ggPSBCb29sZWFuKG9TZWFyY2hSZXN0cmljdGlvbkFubm90YXRpb24gJiYgIW9TZWFyY2hSZXN0cmljdGlvbkFubm90YXRpb24uU2VhcmNoYWJsZSk7XG5cdFx0fVxuXHRcdHRoaXMucHJvY2Vzc1NlbGVjdGlvbkZpZWxkcygpO1xuXHR9XG5cblx0X3Byb2Nlc3NQcm9wZXJ0eUluZm9zKHByb3BlcnR5SW5mbzogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYVBhcmFtZXRlckZpZWxkczogc3RyaW5nW10gPSBbXTtcblx0XHRpZiAocHJvcGVydHlJbmZvKSB7XG5cdFx0XHRjb25zdCBzRmV0Y2hlZFByb3BlcnRpZXMgPSBwcm9wZXJ0eUluZm8ucmVwbGFjZSgvXFxcXHsvZywgXCJ7XCIpLnJlcGxhY2UoL1xcXFx9L2csIFwifVwiKTtcblx0XHRcdGNvbnN0IGFGZXRjaGVkUHJvcGVydGllcyA9IEpTT04ucGFyc2Uoc0ZldGNoZWRQcm9wZXJ0aWVzKTtcblx0XHRcdGNvbnN0IGVkaXRTdGF0ZUxhYmVsID0gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkZJTFRFUkJBUl9FRElUSU5HX1NUQVRVU1wiKTtcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wSW5mbzogUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdGlmIChwcm9wSW5mby5pc1BhcmFtZXRlcikge1xuXHRcdFx0XHRcdGFQYXJhbWV0ZXJGaWVsZHMucHVzaChwcm9wSW5mby5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocHJvcEluZm8ucGF0aCA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0XHRwcm9wSW5mby5sYWJlbCA9IGVkaXRTdGF0ZUxhYmVsO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5wcm9wZXJ0eUluZm8gPSBKU09OLnN0cmluZ2lmeShhRmV0Y2hlZFByb3BlcnRpZXMpLnJlcGxhY2UoL1xcey9nLCBcIlxcXFx7XCIpLnJlcGxhY2UoL1xcfS9nLCBcIlxcXFx9XCIpO1xuXHRcdH1cblx0XHR0aGlzLl9wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkoYVBhcmFtZXRlckZpZWxkcyk7XG5cdH1cblxuXHRjaGVja0lmQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkID0gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsIHwgdW5kZWZpbmVkKSA9PiB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwpKSB7XG5cdFx0XHR0aGlzLmlzRHJhZnRDb2xsYWJvcmF0aXZlID0gdHJ1ZTtcblx0XHR9XG5cdH07XG5cblx0Z2V0RW50aXR5VHlwZVBhdGggPSAobWV0YVBhdGhQYXJ0czogc3RyaW5nW10pID0+IHtcblx0XHRyZXR1cm4gbWV0YVBhdGhQYXJ0c1swXS5lbmRzV2l0aChcIi9cIikgPyBtZXRhUGF0aFBhcnRzWzBdIDogbWV0YVBhdGhQYXJ0c1swXSArIFwiL1wiO1xuXHR9O1xuXG5cdGdldFNlYXJjaCA9ICgpID0+IHtcblx0XHRpZiAoIXRoaXMuaGlkZUJhc2ljU2VhcmNoKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb250cm9sOmJhc2ljU2VhcmNoRmllbGQ+XG5cdFx0XHQ8bWRjOkZpbHRlckZpZWxkXG5cdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJCYXNpY1NlYXJjaEZpZWxkXCJdKX1cIlxuXHRcdFx0XHRwbGFjZWhvbGRlcj1cIntzYXAuZmUuaTE4bj5NX0ZJTFRFUkJBUl9TRUFSQ0h9XCJcblx0XHRcdFx0Y29uZGl0aW9ucz1cInskZmlsdGVycz4vY29uZGl0aW9ucy8kc2VhcmNofVwiXG5cdFx0XHRcdGRhdGFUeXBlPVwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCJcblx0XHRcdFx0bWF4Q29uZGl0aW9ucz1cIjFcIlxuXHRcdFx0Lz5cblx0XHQ8L2NvbnRyb2w6YmFzaWNTZWFyY2hGaWVsZD5gO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH07XG5cblx0cHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9ICgpID0+IHtcblx0XHRsZXQgZHJhZnRFZGl0U3RhdGUgPSB4bWxgYDtcblx0XHRpZiAodGhpcy5zaG93RHJhZnRFZGl0U3RhdGUpIHtcblx0XHRcdGRyYWZ0RWRpdFN0YXRlID0gYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuZmlsdGVyLkRyYWZ0RWRpdFN0YXRlXCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9XG5cdFx0dGhpcy5fdmFsdWVIZWxwcyA9IFtdO1xuXHRcdHRoaXMuX2ZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuX2ZpbHRlckZpZWxkcz8ucHVzaChkcmFmdEVkaXRTdGF0ZSk7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2VsZWN0aW9uRmllbGRzKSkge1xuXHRcdFx0dGhpcy5zZWxlY3Rpb25GaWVsZHMgPSB0aGlzLnNlbGVjdGlvbkZpZWxkcyEuZ2V0T2JqZWN0KCkgYXMgU2VsZWN0aW9uRmllbGRzO1xuXHRcdH1cblx0XHR0aGlzLnNlbGVjdGlvbkZpZWxkcz8uZm9yRWFjaCgoc2VsZWN0aW9uRmllbGQ6IGFueSwgc2VsZWN0aW9uRmllbGRJZHgpID0+IHtcblx0XHRcdGlmIChzZWxlY3Rpb25GaWVsZC5hdmFpbGFiaWxpdHkgPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRcdHRoaXMuc2V0RmlsdGVyRmllbGRzQW5kVmFsdWVIZWxwcyhzZWxlY3Rpb25GaWVsZCwgc2VsZWN0aW9uRmllbGRJZHgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX2ZpbHRlckZpZWxkcyA9IHRoaXMuX2ZpbHRlckZpZWxkcz8ubGVuZ3RoID4gMCA/IHRoaXMuX2ZpbHRlckZpZWxkcyA6IFwiXCI7XG5cdFx0dGhpcy5fdmFsdWVIZWxwcyA9IHRoaXMuX3ZhbHVlSGVscHM/Lmxlbmd0aCA+IDAgPyB0aGlzLl92YWx1ZUhlbHBzIDogXCJcIjtcblx0fTtcblxuXHRzZXRGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzID0gKHNlbGVjdGlvbkZpZWxkOiBhbnksIHNlbGVjdGlvbkZpZWxkSWR4OiBudW1iZXIpID0+IHtcblx0XHRpZiAoc2VsZWN0aW9uRmllbGQudGVtcGxhdGUgPT09IHVuZGVmaW5lZCAmJiBzZWxlY3Rpb25GaWVsZC50eXBlICE9PSBcIlNsb3RcIikge1xuXHRcdFx0dGhpcy5wdXNoRmlsdGVyRmllbGRzQW5kVmFsdWVIZWxwcyhzZWxlY3Rpb25GaWVsZCk7XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2ZpbHRlckZpZWxkcykpIHtcblx0XHRcdHRoaXMuX2ZpbHRlckZpZWxkcz8ucHVzaChcblx0XHRcdFx0eG1sYDx0ZW1wbGF0ZTp3aXRoIHBhdGg9XCJzZWxlY3Rpb25GaWVsZHM+JHtzZWxlY3Rpb25GaWVsZElkeH1cIiB2YXI9XCJpdGVtXCI+XG5cdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5maWx0ZXIuQ3VzdG9tRmlsdGVyXCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHRcdDwvdGVtcGxhdGU6d2l0aD5gXG5cdFx0XHQpO1xuXHRcdH1cblx0fTtcblxuXHRfZ2V0Q29udGV4dFBhdGhGb3JGaWx0ZXJGaWVsZChzZWxlY3Rpb25GaWVsZDogYW55LCBmaWx0ZXJCYXJDb250ZXh0UGF0aDogQ29udGV4dCk6IHN0cmluZyB8IENvbnRleHQge1xuXHRcdGxldCBjb250ZXh0UGF0aDogc3RyaW5nIHwgQ29udGV4dCA9IGZpbHRlckJhckNvbnRleHRQYXRoO1xuXHRcdGlmIChzZWxlY3Rpb25GaWVsZC5pc1BhcmFtZXRlcikge1xuXHRcdFx0Ly8gRXhhbXBsZTpcblx0XHRcdC8vIEZpbHRlckJhckNvbnRleHRQYXRoOiAvQ3VzdG9tZXIvU2V0XG5cdFx0XHQvLyBQYXJhbWV0ZXJQcm9wZXJ0eVBhdGg6IC9DdXN0b21lci9QX0NDXG5cdFx0XHQvLyBDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkOiAvQ3VzdG9tZXJcblx0XHRcdGNvbnN0IGFubm9QYXRoID0gc2VsZWN0aW9uRmllbGQuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRjb250ZXh0UGF0aCA9IGFubm9QYXRoLnN1YnN0cmluZygwLCBhbm5vUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbnRleHRQYXRoO1xuXHR9XG5cblx0cHVzaEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMgPSAoc2VsZWN0aW9uRmllbGQ6IGFueSkgPT4ge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2ZpbHRlckZpZWxkcykpIHtcblx0XHRcdHRoaXMuX2ZpbHRlckZpZWxkcz8ucHVzaChcblx0XHRcdFx0eG1sYDxpbnRlcm5hbE1hY3JvOkZpbHRlckZpZWxkXG5cdFx0XHRpZFByZWZpeD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiRmlsdGVyRmllbGRcIiwgQ29tbW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRoKV0pfVwiXG5cdFx0XHR2aElkUHJlZml4PVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiXSl9XCJcblx0XHRcdHByb3BlcnR5PVwiJHtzZWxlY3Rpb25GaWVsZC5hbm5vdGF0aW9uUGF0aH1cIlxuXHRcdFx0Y29udGV4dFBhdGg9XCIke3RoaXMuX2dldENvbnRleHRQYXRoRm9yRmlsdGVyRmllbGQoc2VsZWN0aW9uRmllbGQsIHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGgpfVwiXG5cdFx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZT1cIiR7dGhpcy51c2VTZW1hbnRpY0RhdGVSYW5nZX1cIlxuXHRcdFx0c2V0dGluZ3M9XCIke0NvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHNlbGVjdGlvbkZpZWxkLnNldHRpbmdzKX1cIlxuXHRcdFx0dmlzdWFsRmlsdGVyPVwiJHtzZWxlY3Rpb25GaWVsZC52aXN1YWxGaWx0ZXJ9XCJcblx0XHRcdC8+YFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodGhpcy5fdmFsdWVIZWxwcykpIHtcblx0XHRcdHRoaXMuX3ZhbHVlSGVscHM/LnB1c2goXG5cdFx0XHRcdHhtbGA8bWFjcm86VmFsdWVIZWxwXG5cdFx0XHRpZFByZWZpeD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIl0pfVwiXG5cdFx0XHRjb25kaXRpb25Nb2RlbD1cIiRmaWx0ZXJzXCJcblx0XHRcdHByb3BlcnR5PVwiJHtzZWxlY3Rpb25GaWVsZC5hbm5vdGF0aW9uUGF0aH1cIlxuXHRcdFx0Y29udGV4dFBhdGg9XCIke3RoaXMuX2dldENvbnRleHRQYXRoRm9yRmlsdGVyRmllbGQoc2VsZWN0aW9uRmllbGQsIHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGgpfVwiXG5cdFx0XHRmaWx0ZXJGaWVsZFZhbHVlSGVscD1cInRydWVcIlxuXHRcdFx0dXNlU2VtYW50aWNEYXRlUmFuZ2U9XCIke3RoaXMudXNlU2VtYW50aWNEYXRlUmFuZ2V9XCJcblx0XHQvPmBcblx0XHRcdCk7XG5cdFx0fVxuXHR9O1xuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGludGVybmFsQ29udGV4dFBhdGggPSB0aGlzLl9pbnRlcm5hbENvbnRleHRQYXRoPy5nZXRQYXRoKCk7XG5cdFx0bGV0IGZpbHRlckRlbGVnYXRlID0gXCJcIjtcblx0XHRpZiAodGhpcy5maWx0ZXJCYXJEZWxlZ2F0ZSkge1xuXHRcdFx0ZmlsdGVyRGVsZWdhdGUgPSB0aGlzLmZpbHRlckJhckRlbGVnYXRlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWx0ZXJEZWxlZ2F0ZSA9IFwie25hbWU6J3NhcC9mZS9tYWNyb3MvZmlsdGVyQmFyL0ZpbHRlckJhckRlbGVnYXRlJywgcGF5bG9hZDoge2VudGl0eVR5cGVQYXRoOiAnXCIgKyBpbnRlcm5hbENvbnRleHRQYXRoICsgXCInfX1cIjtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGA8bWFjcm9GaWx0ZXJCYXI6RmlsdGVyQmFyQVBJXG4gICAgICAgIHhtbG5zOnRlbXBsYXRlPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLnRlbXBsYXRlLzFcIlxuICAgICAgICB4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuICAgICAgICB4bWxuczptZGM9XCJzYXAudWkubWRjXCJcbiAgICAgICAgeG1sbnM6Y29udHJvbD1cInNhcC5mZS5jb3JlLmNvbnRyb2xzXCJcbiAgICAgICAgeG1sbnM6bWFjcm9GaWx0ZXJCYXI9XCJzYXAuZmUubWFjcm9zLmZpbHRlckJhclwiXG4gICAgICAgIHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiXG4gICAgICAgIHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbiAgICAgICAgeG1sbnM6Y3VzdG9tRGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdGlkPVwiJHt0aGlzLl9hcGlJZH1cIlxuXHRcdHNlYXJjaD1cIiR7dGhpcy5zZWFyY2h9XCJcblx0XHRmaWx0ZXJDaGFuZ2VkPVwiJHt0aGlzLmZpbHRlckNoYW5nZWR9XCJcblx0XHRhZnRlckNsZWFyPVwiJHt0aGlzLmFmdGVyQ2xlYXJ9XCJcblx0XHRpbnRlcm5hbFNlYXJjaD1cIiR7dGhpcy5pbnRlcm5hbFNlYXJjaH1cIlxuXHRcdGludGVybmFsRmlsdGVyQ2hhbmdlZD1cIiR7dGhpcy5pbnRlcm5hbEZpbHRlckNoYW5nZWR9XCJcblx0XHRzdGF0ZUNoYW5nZT1cIiR7dGhpcy5zdGF0ZUNoYW5nZX1cIlxuXHQ+XG5cdFx0PGNvbnRyb2w6RmlsdGVyQmFyXG5cdFx0XHRjb3JlOnJlcXVpcmU9XCJ7QVBJOiAnc2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyQVBJJ31cIlxuXHRcdFx0aWQ9XCIke3RoaXMuX2NvbnRlbnRJZH1cIlxuXHRcdFx0bGl2ZU1vZGU9XCIke3RoaXMubGl2ZU1vZGV9XCJcblx0XHRcdGRlbGVnYXRlPVwiJHtmaWx0ZXJEZWxlZ2F0ZX1cIlxuXHRcdFx0dmFyaWFudEJhY2tyZWZlcmVuY2U9XCIke3RoaXMudmFyaWFudEJhY2tyZWZlcmVuY2V9XCJcblx0XHRcdHNob3dBZGFwdEZpbHRlcnNCdXR0b249XCIke3RoaXMuc2hvd0FkYXB0RmlsdGVyc0J1dHRvbn1cIlxuXHRcdFx0c2hvd0NsZWFyQnV0dG9uPVwiJHt0aGlzLnNob3dDbGVhckJ1dHRvbn1cIlxuXHRcdFx0cDEzbk1vZGU9XCIke3RoaXMucDEzbk1vZGV9XCJcblx0XHRcdHNlYXJjaD1cIkFQSS5oYW5kbGVTZWFyY2goJGV2ZW50KVwiXG5cdFx0XHRmaWx0ZXJzQ2hhbmdlZD1cIkFQSS5oYW5kbGVGaWx0ZXJDaGFuZ2VkKCRldmVudClcIlxuXHRcdFx0ZmlsdGVyQ29uZGl0aW9ucz1cIiR7dGhpcy5maWx0ZXJDb25kaXRpb25zfVwiXG5cdFx0XHRzdXNwZW5kU2VsZWN0aW9uPVwiJHt0aGlzLnN1c3BlbmRTZWxlY3Rpb259XCJcblx0XHRcdHNob3dNZXNzYWdlcz1cIiR7dGhpcy5zaG93TWVzc2FnZXN9XCJcblx0XHRcdHRvZ2dsZUNvbnRyb2w9XCIke3RoaXMudG9nZ2xlQ29udHJvbElkfVwiXG5cdFx0XHRpbml0aWFsTGF5b3V0PVwiJHt0aGlzLmluaXRpYWxMYXlvdXR9XCJcblx0XHRcdHByb3BlcnR5SW5mbz1cIiR7dGhpcy5wcm9wZXJ0eUluZm99XCJcblx0XHRcdGN1c3RvbURhdGE6bG9jYWxJZD1cIiR7dGhpcy5pZH1cIlxuXHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRjdXN0b21EYXRhOmhpZGVCYXNpY1NlYXJjaD1cIiR7dGhpcy5oaWRlQmFzaWNTZWFyY2h9XCJcblx0XHRcdGN1c3RvbURhdGE6c2hvd0RyYWZ0RWRpdFN0YXRlPVwiJHt0aGlzLnNob3dEcmFmdEVkaXRTdGF0ZX1cIlxuXHRcdFx0Y3VzdG9tRGF0YTp1c2VTZW1hbnRpY0RhdGVSYW5nZT1cIiR7dGhpcy51c2VTZW1hbnRpY0RhdGVSYW5nZX1cIlxuXHRcdFx0Y3VzdG9tRGF0YTplbnRpdHlUeXBlPVwiJHtpbnRlcm5hbENvbnRleHRQYXRofVwiXG5cdFx0XHRjdXN0b21EYXRhOnBhcmFtZXRlcnM9XCIke3RoaXMuX3BhcmFtZXRlcnN9XCJcblx0XHQ+XG5cdFx0XHQ8Y29udHJvbDpkZXBlbmRlbnRzPlxuXHRcdFx0XHQke3RoaXMuX3ZhbHVlSGVscHN9XG5cdFx0XHQ8L2NvbnRyb2w6ZGVwZW5kZW50cz5cblx0XHRcdCR7dGhpcy5nZXRTZWFyY2goKX1cblx0XHRcdDxjb250cm9sOmZpbHRlckl0ZW1zPlxuXHRcdFx0XHQke3RoaXMuX2ZpbHRlckZpZWxkc31cblx0XHRcdDwvY29udHJvbDpmaWx0ZXJJdGVtcz5cblx0XHQ8L2NvbnRyb2w6RmlsdGVyQmFyPlxuXHQ8L21hY3JvRmlsdGVyQmFyOkZpbHRlckJhckFQST5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBb0JBLE1BQU1BLDhCQUE4QixHQUFHLFVBQVVDLGdCQUF5QixFQUFFQyxpQkFBc0IsRUFBZTtJQUNoSEEsaUJBQWlCLENBQUNDLFFBQVEsR0FBR0QsaUJBQWlCLENBQUNFLEdBQUc7SUFDbERGLGlCQUFpQixDQUFDRSxHQUFHLEdBQUdGLGlCQUFpQixDQUFDRSxHQUFHLENBQUNDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO0lBQ3ZFSCxpQkFBaUIsQ0FBQ0ksS0FBSyxHQUFHTCxnQkFBZ0IsQ0FBQ00sWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUNoRUwsaUJBQWlCLENBQUNNLFFBQVEsR0FBR1AsZ0JBQWdCLENBQUNNLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxNQUFNO0lBQ2pGLE9BQU9MLGlCQUFpQjtFQUN6QixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQXBCQSxJQTBCcUJPLGNBQWMsV0FMbENDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsV0FBVztJQUNqQkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0Ms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bUJHLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQUtILEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQUtILEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FhYixTQUFTO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FTTixLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FLSCxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==