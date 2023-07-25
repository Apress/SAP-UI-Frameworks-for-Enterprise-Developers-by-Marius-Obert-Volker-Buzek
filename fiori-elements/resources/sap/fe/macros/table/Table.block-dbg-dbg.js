/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/CommonUtils", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/internal/helpers/TableTemplating", "sap/ui/core/library", "../CommonHelper", "../internal/helpers/ActionHelper", "../MacroAPI", "./TableHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, CommonUtils, DataField, DataVisualization, ManifestSettings, MetaModelConverter, StableIdHelper, TypeGuards, DataModelPathHelper, TableTemplating, library, CommonHelper, ActionHelper, MacroAPI, TableHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40, _descriptor41, _descriptor42, _descriptor43, _descriptor44, _descriptor45, _descriptor46, _descriptor47, _descriptor48, _descriptor49, _descriptor50, _descriptor51, _descriptor52, _descriptor53, _descriptor54, _descriptor55, _descriptor56, _descriptor57, _descriptor58, _descriptor59, _descriptor60, _descriptor61, _descriptor62, _descriptor63, _descriptor64;
  var _exports = {};
  var TitleLevel = library.TitleLevel;
  var buildExpressionForHeaderVisible = TableTemplating.buildExpressionForHeaderVisible;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var isSingleton = TypeGuards.isSingleton;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var CreationMode = ManifestSettings.CreationMode;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var isDataFieldForAnnotation = DataField.isDataFieldForAnnotation;
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
  const setCustomActionProperties = function (childAction) {
    var _act$getAttribute;
    let menuContentActions = null;
    const act = childAction;
    let menuActions = [];
    const actionKey = (_act$getAttribute = act.getAttribute("key")) === null || _act$getAttribute === void 0 ? void 0 : _act$getAttribute.replace("InlineXML_", "");
    if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI === "sap.fe.macros") {
      const actionsToAdd = Array.prototype.slice.apply(act.children);
      let actionIdx = 0;
      menuContentActions = actionsToAdd.reduce((acc, actToAdd) => {
        var _actToAdd$getAttribut;
        const actionKeyAdd = ((_actToAdd$getAttribut = actToAdd.getAttribute("key")) === null || _actToAdd$getAttribut === void 0 ? void 0 : _actToAdd$getAttribut.replace("InlineXML_", "")) || actionKey + "_Menu_" + actionIdx;
        const curOutObject = {
          key: actionKeyAdd,
          text: actToAdd.getAttribute("text"),
          __noWrap: true,
          press: actToAdd.getAttribute("press"),
          requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
          enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
        };
        acc[curOutObject.key] = curOutObject;
        actionIdx++;
        return acc;
      }, {});
      menuActions = Object.values(menuContentActions).slice(-act.children.length).map(function (menuItem) {
        return menuItem.key;
      });
    }
    return {
      key: actionKey,
      text: act.getAttribute("text"),
      position: {
        placement: act.getAttribute("placement"),
        anchor: act.getAttribute("anchor")
      },
      __noWrap: true,
      press: act.getAttribute("press"),
      requiresSelection: act.getAttribute("requiresSelection") === "true",
      enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
      menu: menuActions.length ? menuActions : null,
      menuContentActions: menuContentActions
    };
  };
  const setCustomColumnProperties = function (childColumn, aggregationObject) {
    var _childColumn$children, _childColumn$getAttri;
    aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
    childColumn.setAttribute("key", aggregationObject.key);
    return {
      // Defaults are to be defined in Table.ts
      key: aggregationObject.key,
      type: "Slot",
      width: childColumn.getAttribute("width"),
      importance: childColumn.getAttribute("importance"),
      horizontalAlign: childColumn.getAttribute("horizontalAlign"),
      availability: childColumn.getAttribute("availability"),
      header: childColumn.getAttribute("header"),
      template: ((_childColumn$children = childColumn.children[0]) === null || _childColumn$children === void 0 ? void 0 : _childColumn$children.outerHTML) || "",
      properties: childColumn.getAttribute("properties") ? (_childColumn$getAttri = childColumn.getAttribute("properties")) === null || _childColumn$getAttri === void 0 ? void 0 : _childColumn$getAttri.split(",") : undefined,
      position: {
        placement: childColumn.getAttribute("placement") || childColumn.getAttribute("positionPlacement"),
        //positionPlacement is kept for backwards compatibility
        anchor: childColumn.getAttribute("anchor") || childColumn.getAttribute("positionAnchor") //positionAnchor is kept for backwards compatibility
      }
    };
  };
  let TableBlock = (_dec = defineBuildingBlock({
    name: "Table",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec11 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec12 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec14 = blockAttribute({
    type: "string|boolean",
    isPublic: true
  }), _dec15 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec16 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec17 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec18 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec19 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec20 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: false,
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton"]
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "boolean"
  }), _dec23 = blockAttribute({
    type: "EntitySet|NavigationProperty"
  }), _dec24 = blockAttribute({
    type: "string"
  }), _dec25 = blockAttribute({
    type: "boolean"
  }), _dec26 = blockAttribute({
    type: "string"
  }), _dec27 = blockAttribute({
    type: "string"
  }), _dec28 = blockAttribute({
    type: "string"
  }), _dec29 = blockAttribute({
    type: "string"
  }), _dec30 = blockAttribute({
    type: "string"
  }), _dec31 = blockAttribute({
    type: "string"
  }), _dec32 = blockAttribute({
    type: "boolean"
  }), _dec33 = blockAttribute({
    type: "boolean"
  }), _dec34 = blockAttribute({
    type: "boolean"
  }), _dec35 = blockAttribute({
    type: "string"
  }), _dec36 = blockAttribute({
    type: "string"
  }), _dec37 = blockAttribute({
    type: "number"
  }), _dec38 = blockAttribute({
    type: "boolean"
  }), _dec39 = blockAttribute({
    type: "boolean"
  }), _dec40 = blockAttribute({
    type: "boolean"
  }), _dec41 = blockAttribute({
    type: "string"
  }), _dec42 = blockAttribute({
    type: "string"
  }), _dec43 = blockAttribute({
    type: "string"
  }), _dec44 = blockAttribute({
    type: "string"
  }), _dec45 = blockAttribute({
    type: "string"
  }), _dec46 = blockAttribute({
    type: "string"
  }), _dec47 = blockAttribute({
    type: "boolean"
  }), _dec48 = blockAttribute({
    type: "boolean"
  }), _dec49 = blockAttribute({
    type: "number"
  }), _dec50 = blockAttribute({
    type: "string"
  }), _dec51 = blockAttribute({
    type: "object",
    isPublic: true
  }), _dec52 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec53 = blockAttribute({
    type: "string"
  }), _dec54 = blockAttribute({
    type: "string"
  }), _dec55 = blockAttribute({
    type: "boolean"
  }), _dec56 = blockAggregation({
    type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
    isPublic: true,
    processAggregations: setCustomActionProperties
  }), _dec57 = blockAggregation({
    type: "sap.fe.macros.internal.table.Column",
    isPublic: true,
    hasVirtualNode: true,
    processAggregations: setCustomColumnProperties
  }), _dec58 = blockEvent(), _dec59 = blockEvent(), _dec60 = blockEvent(), _dec61 = blockEvent(), _dec62 = blockEvent(), _dec63 = blockEvent(), _dec64 = blockEvent(), _dec65 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(TableBlock, _BuildingBlockBase);
    //  *************** Public & Required Attributes ********************

    //  *************** Public Attributes ********************
    /**
     *The `busy` mode of table
     */

    /**
     * Parameter used to show the fullScreen button on the table.
     */

    /**
     * Enable export to file
     */

    /**
     * Enable export to file
     */

    /**
     * The control ID of the FilterBar that is used to filter the rows of the table.
     */

    /**
     * Specifies header text that is shown in table.
     */

    /**
     * Defines the "aria-level" of the table header
     */

    /**
     * Controls if the header text should be shown or not
     */

    /**
     * Personalization Mode
     */

    /**
     * Specifies whether the table should be read-only or not.
     */

    /**
     * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
     */

    /**
     * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
     */

    /**
     * Specifies the selection mode (None,Single,Multi,Auto)
     */

    //  *************** Private & Required Attributes ********************

    //  *************** Private Attributes ********************

    /**
     * Setting to determine if the new row should be created at the end or beginning
     */

    /**
     * Creation Mode to be passed to the onCreate handler. Values: ["Inline", "NewPage"]
     */

    /**
     * Specifies the full path and function name of a custom validation function.
     */

    /**
     * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
     */

    /**
     * The control ID of the FilterBar that is used internally to filter the rows of the table.
     */

    /**
     * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
     */

    /**
     * Used for binding the table to a navigation path. Only the path is used for binding rows.
     */

    /**
     * Parameter which sets the noDataText for the mdc table
     */

    /**
     * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
     */

    /**
     * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
     */

    // We require tableDefinition to be there even though it is not formally required

    /**
     * Event handler to react when the user chooses a row
     */

    /**
     * Event handler to react to the contextChange event of the table.
     */

    /**
     *  Event handler for change event.
     */

    /**
     * Event handler called when the user chooses an option of the segmented button in the ALP View
     */

    /**
     * Event handler to react to the stateChange event of the table.
     */

    /**
     * Event handler to react when the table selection changes
     */

    function TableBlock(props, controlConfiguration, settings) {
      var _this$tableDefinition2, _this$tableDefinition3;
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerLevel", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useCondensedLayout", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collection", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_apiId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "autoBindOnInit", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collectionEntity", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columnEditMode", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createAtEnd", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createNewAction", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "creationMode", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createOutbound", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createOutboundDetail", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "customValidationFunction", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataStateIndicatorFilter", _descriptor30, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "disableAddRowButtonForEmptyData", _descriptor31, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor32, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoScroll", _descriptor33, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fieldMode", _descriptor34, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarId", _descriptor35, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inlineCreationRowCount", _descriptor36, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isAlp", _descriptor37, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isCompactType", _descriptor38, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isOptimizedForSmallDevice", _descriptor39, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "multiSelectMode", _descriptor40, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor41, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noDataText", _descriptor42, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowAction", _descriptor43, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableType", _descriptor44, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "updatablePropertyPath", _descriptor45, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useBasicSearch", _descriptor46, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "searchable", _descriptor47, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionLimit", _descriptor48, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showCreate", _descriptor49, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor50, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinitionContext", _descriptor51, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDelegate", _descriptor52, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tabTitle", _descriptor53, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor54, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor55, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columns", _descriptor56, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor57, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onContextChange", _descriptor58, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor59, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onSegmentedButtonPressed", _descriptor60, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSaved", _descriptor61, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor62, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor63, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSelected", _descriptor64, _assertThisInitialized(_this));
      _this.getTableType = () => {
        const collection = _this.collection.getObject();
        switch (_this.tableType) {
          case "GridTable":
            return xml`<mdcTable:GridTableType
                rowCountMode="${_this.tableDefinition.control.rowCountMode}"
                rowCount="${_this.tableDefinition.control.rowCount}"
                selectionLimit="${_this.selectionLimit}"
            />`;
          case "TreeTable":
            return xml`<mdcTable:TreeTableType
                rowCountMode="${_this.tableDefinition.control.rowCountMode}"
                rowCount="${_this.tableDefinition.control.rowCount}"
            />`;
          default:
            const growingMode = collection.$kind === "EntitySet" ? "Scroll" : undefined;
            return xml`<mdcTable:ResponsiveTableType
                showDetailsButton="true"
                detailsButtonSetting="{=['Low', 'Medium', 'None']}"
                growingMode="${growingMode}"
            />`;
        }
      };
      _this.getDependents = () => {
        var _this$tableDefinition;
        let dependents = ``;
        if (!_this.readOnly && (_this$tableDefinition = _this.tableDefinition) !== null && _this$tableDefinition !== void 0 && _this$tableDefinition.columns) {
          for (const column of _this.tableDefinition.columns) {
            if (column.availability === "Default" && "annotationPath" in column) {
              dependents += _this.getValueHelp(column);
            }
          }
        }
        const standardActions = _this.tableDefinition.annotation.standardActions.actions;
        if (_this.tableDefinition.annotation.standardActions.isInsertUpdateTemplated && standardActions.create.isTemplated === "true") {
          dependents += xml`<control:CommandExecution
                                execute="${TableHelper.pressEventForCreateButton(_assertThisInitialized(_this), true)}"
                                visible="${standardActions.create.visible}"
                                enabled="${standardActions.create.enabled}"
                                command="Create"
                            />`;
        }
        if (standardActions.delete.isTemplated === "true") {
          var _ref, _ref$annotations, _ref$annotations$UI, _this$collectionEntit, _this$collectionEntit2;
          const headerInfo = (_ref = ((_this$collectionEntit = _this.collectionEntity) === null || _this$collectionEntit === void 0 ? void 0 : _this$collectionEntit.entityType) || ((_this$collectionEntit2 = _this.collectionEntity) === null || _this$collectionEntit2 === void 0 ? void 0 : _this$collectionEntit2.targetType)) === null || _ref === void 0 ? void 0 : (_ref$annotations = _ref.annotations) === null || _ref$annotations === void 0 ? void 0 : (_ref$annotations$UI = _ref$annotations.UI) === null || _ref$annotations$UI === void 0 ? void 0 : _ref$annotations$UI.HeaderInfo;
          dependents += xml`<control:CommandExecution
                        execute="${TableHelper.pressEventForDeleteButton(_assertThisInitialized(_this), _this.collectionEntity.name, headerInfo, _this.contextObjectPath)}"
                        visible="${standardActions.delete.visible}"
                        enabled="${standardActions.delete.enabled}"
                        command="DeleteEntry"
                        />`;
        }
        for (const actionName in _this.tableDefinition.commandActions) {
          const action = _this.tableDefinition.commandActions[actionName];
          dependents += `${_this.getActionCommand(actionName, action)}`;
        }
        dependents += `<control:CommandExecution execute="TableRuntime.displayTableSettings" command="TableSettings" />`;
        if (_this.variantManagement === "None") {
          dependents += `<!-- Persistence provider offers persisting personalization changes without variant management -->
			<p13n:PersistenceProvider id="${generate([_this.id, "PersistenceProvider"])}" for="${_this.id}" />`;
        }
        return xml`${dependents}`;
      };
      _this.getActions = () => {
        let dependents = "";
        if (_this.onSegmentedButtonPressed) {
          dependents = `<mdcat:ActionToolbarAction
            layoutInformation="{
                    aggregationName: 'end',
                    alignment: 'End'
                }"
            visible="{= \${pageInternal>alpContentView} === 'Table' }"
        >
            <SegmentedButton
                id="${generate([_this.id, "SegmentedButton", "TemplateContentView"])}"
                select="${_this.onSegmentedButtonPressed}"
                selectedKey="{pageInternal>alpContentView}"
            >
                <items>`;
          if (CommonHelper.isDesktop()) {
            dependents += `<SegmentedButtonItem
                            tooltip="{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
							key = "Hybrid"
							icon = "sap-icon://chart-table-view"
							/>`;
          }
          dependents += `<SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Chart"
                        icon="sap-icon://bar-chart"
                    />
                    <SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Table"
                        icon="sap-icon://table-view"
                    />
                </items>
            </SegmentedButton>
        </mdcat:ActionToolbarAction>`;
        }
        dependents += `<core:Fragment fragmentName="sap.fe.macros.table.Actions" type="XML" />`;
        return xml`${dependents}`;
      };
      const contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      _this.contextObjectPath = contextObjectPath;
      const pageContext = settings.bindingContexts.converterContext;
      _this.pageTemplateType = pageContext === null || pageContext === void 0 ? void 0 : pageContext.getObject("/templateType");
      const tableDefinition = TableBlock.setUpTableDefinition(_assertThisInitialized(_this), settings);
      _this.collection = settings.models.metaModel.createBindingContext(tableDefinition.annotation.collection);
      _this.convertedMetaData = _this.contextObjectPath.convertedTypes;
      _this.collectionEntity = _this.convertedMetaData.resolvePath(_this.tableDefinition.annotation.collection).target;
      _this.setUpId();
      _this.selectionMode = _this.tableDefinition.annotation.selectionMode;
      _this.enableFullScreen = _this.tableDefinition.control.enableFullScreen;
      _this.enableExport = _this.tableDefinition.control.enableExport;
      _this.enablePaste = _this.tableDefinition.annotation.standardActions.actions.paste.enabled;
      _this.updatablePropertyPath = _this.tableDefinition.annotation.standardActions.updatablePropertyPath;
      _this.type = _this.tableDefinition.control.type;
      _this.disableAddRowButtonForEmptyData ??= _this.tableDefinition.control.disableAddRowButtonForEmptyData;
      _this.customValidationFunction ??= _this.tableDefinition.control.customValidationFunction;
      _this.headerVisible ??= _this.tableDefinition.control.headerVisible;
      _this.searchable ??= _this.tableDefinition.annotation.searchable;
      _this.inlineCreationRowCount ??= _this.tableDefinition.control.inlineCreationRowCount;
      _this.header ??= _this.tableDefinition.annotation.title;
      _this.selectionLimit ??= _this.tableDefinition.control.selectionLimit;
      _this.isCompactType ??= _this.tableDefinition.control.isCompactType;
      _this.creationMode ??= _this.tableDefinition.annotation.create.mode;
      _this.createAtEnd ??= _this.tableDefinition.annotation.create.append;
      _this.createOutbound ??= _this.tableDefinition.annotation.create.outbound;
      _this.createNewAction ??= _this.tableDefinition.annotation.create.newAction;
      _this.createOutboundDetail ??= _this.tableDefinition.annotation.create.outboundDetail;
      _this.personalization ??= _this.tableDefinition.annotation.p13nMode;
      _this.variantManagement ??= _this.tableDefinition.annotation.variantManagement;
      _this.enableAutoColumnWidth ??= true;
      _this.dataStateIndicatorFilter ??= _this.tableDefinition.control.dataStateIndicatorFilter;
      _this.isOptimizedForSmallDevice ??= CommonUtils.isSmallDevice();
      _this.navigationPath = tableDefinition.annotation.navigationPath;
      if (tableDefinition.annotation.collection.startsWith("/") && isSingleton(contextObjectPath.startingEntitySet)) {
        tableDefinition.annotation.collection = _this.navigationPath;
      }
      _this.convertedMetaData = _this.contextObjectPath.convertedTypes;
      _this.setReadOnly();
      if (_this.rowPress) {
        _this.rowAction = "Navigation";
      }
      _this.rowPress ??= (_this$tableDefinition2 = _this.tableDefinition.annotation.row) === null || _this$tableDefinition2 === void 0 ? void 0 : _this$tableDefinition2.press;
      _this.rowAction ??= (_this$tableDefinition3 = _this.tableDefinition.annotation.row) === null || _this$tableDefinition3 === void 0 ? void 0 : _this$tableDefinition3.action;
      if (_this.personalization === "false") {
        _this.personalization = undefined;
      } else if (_this.personalization === "true") {
        _this.personalization = "Sort,Column,Filter";
      }
      switch (_this.personalization) {
        case "false":
          _this.personalization = undefined;
          break;
        case "true":
          _this.personalization = "Sort,Column,Filter";
          break;
        default:
      }
      if (_this.isSearchable === false) {
        _this.searchable = false;
      } else {
        _this.searchable = _this.tableDefinition.annotation.searchable;
      }
      let useBasicSearch = false;

      // Note for the 'filterBar' property:
      // 1. ID relative to the view of the Table.
      // 2. Absolute ID.
      // 3. ID would be considered in association to TableAPI's ID.
      if (!_this.filterBar && !_this.filterBarId && _this.searchable) {
        // filterBar: Public property for building blocks
        // filterBarId: Only used as Internal private property for FE templates
        _this.filterBarId = generate([_this.id, "StandardAction", "BasicSearch"]);
        useBasicSearch = true;
      }
      // Internal properties
      _this.useBasicSearch = useBasicSearch;
      _this.tableType = _this.type;
      _this.showCreate = _this.tableDefinition.annotation.standardActions.actions.create.visible || true;
      _this.autoBindOnInit = _this.tableDefinition.annotation.autoBindOnInit;
      switch (_this.readOnly) {
        case true:
          _this.columnEditMode = "Display";
          break;
        case false:
          _this.columnEditMode = "Editable";
          break;
        default:
          _this.columnEditMode = undefined;
      }
      return _this;
    }

    /**
     * Returns the annotation path pointing to the visualization annotation (LineItem).
     *
     * @param contextObjectPath The datamodel object path for the table
     * @param converterContext The converter context
     * @returns The annotation path
     */
    _exports = TableBlock;
    TableBlock.getVisualizationPath = function getVisualizationPath(contextObjectPath, converterContext) {
      const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);

      // fallback to default LineItem if metapath is not set
      if (!metaPath) {
        Log.error(`Missing meta path parameter for LineItem`);
        return `@${"com.sap.vocabularies.UI.v1.LineItem"}`;
      }
      if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.LineItem") {
        return metaPath; // MetaPath is already pointing to a LineItem
      }
      //Need to switch to the context related the PV or SPV
      const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
      let visualizations = [];
      switch (contextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          if (contextObjectPath.targetObject.PresentationVariant) {
            visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext, true);
          }
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext, true);
          break;
        default:
          Log.error(`Bad metapath parameter for table : ${contextObjectPath.targetObject.term}`);
      }
      const lineItemViz = visualizations.find(viz => {
        return viz.visualization.term === "com.sap.vocabularies.UI.v1.LineItem";
      });
      if (lineItemViz) {
        return lineItemViz.annotationPath;
      } else {
        // fallback to default LineItem if annotation missing in PV
        Log.error(`Bad meta path parameter for LineItem: ${contextObjectPath.targetObject.term}`);
        return `@${"com.sap.vocabularies.UI.v1.LineItem"}`; // Fallback
      }
    };
    TableBlock.getPresentationPath = function getPresentationPath(contextObjectPath) {
      var _contextObjectPath$ta;
      let presentationPath;
      switch ((_contextObjectPath$ta = contextObjectPath.targetObject) === null || _contextObjectPath$ta === void 0 ? void 0 : _contextObjectPath$ta.term) {
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(contextObjectPath);
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(contextObjectPath) + "/PresentationVariant";
          break;
      }
      return presentationPath;
    };
    TableBlock.setUpTableDefinition = function setUpTableDefinition(table, settings) {
      let tableDefinition = table.tableDefinition;
      if (!tableDefinition) {
        var _table$contextPath, _table$contextPath2;
        const initialConverterContext = table.getConverterContext(table.contextObjectPath, (_table$contextPath = table.contextPath) === null || _table$contextPath === void 0 ? void 0 : _table$contextPath.getPath(), settings);
        const visualizationPath = TableBlock.getVisualizationPath(table.contextObjectPath, initialConverterContext);
        const presentationPath = TableBlock.getPresentationPath(table.contextObjectPath);

        //Check if we have ActionGroup and add nested actions

        const extraParams = {};
        const tableSettings = {
          enableExport: table.enableExport,
          enableFullScreen: table.enableFullScreen,
          enablePaste: table.enablePaste,
          selectionMode: table.selectionMode,
          type: table.type
        };
        if (table.actions) {
          var _Object$values;
          (_Object$values = Object.values(table.actions)) === null || _Object$values === void 0 ? void 0 : _Object$values.forEach(item => {
            table.actions = {
              ...table.actions,
              ...item.menuContentActions
            };
            delete item.menuContentActions;
          });
        }

        // table actions and columns as {} if not provided to allow merge with manifest settings
        extraParams[visualizationPath] = {
          actions: table.actions || {},
          columns: table.columns || {},
          tableSettings: tableSettings
        };
        const converterContext = table.getConverterContext(table.contextObjectPath, (_table$contextPath2 = table.contextPath) === null || _table$contextPath2 === void 0 ? void 0 : _table$contextPath2.getPath(), settings, extraParams);
        const visualizationDefinition = getDataVisualizationConfiguration(visualizationPath, table.useCondensedLayout, converterContext, undefined, undefined, presentationPath, true);
        tableDefinition = visualizationDefinition.visualizations[0];
        table.tableDefinition = tableDefinition;
      }
      table.tableDefinitionContext = MacroAPI.createBindingContext(table.tableDefinition, settings);
      return tableDefinition;
    };
    var _proto = TableBlock.prototype;
    _proto.setUpId = function setUpId() {
      if (this.id) {
        // The given ID shall be assigned to the TableAPI and not to the MDC Table
        this._apiId = this.id;
        this.id = this.getContentId(this.id);
      } else {
        // We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
        // the ID with a ::Table suffix to the TableAPI
        const tableDefinition = this.tableDefinition;
        this.id ??= tableDefinition.annotation.id;
        this._apiId = generate([tableDefinition.annotation.id, "Table"]);
      }
    };
    _proto.setReadOnly = function setReadOnly() {
      // Special code for readOnly
      // readonly = false -> Force editable
      // readonly = true -> Force display mode
      // readonly = undefined -> Bound to edit flow
      if (this.readOnly === undefined && this.tableDefinition.annotation.displayMode === true) {
        this.readOnly = true;
      }
    };
    _proto._getEntityType = function _getEntityType() {
      var _this$collectionEntit3, _this$collectionEntit4;
      return ((_this$collectionEntit3 = this.collectionEntity) === null || _this$collectionEntit3 === void 0 ? void 0 : _this$collectionEntit3.entityType) || ((_this$collectionEntit4 = this.collectionEntity) === null || _this$collectionEntit4 === void 0 ? void 0 : _this$collectionEntit4.targetType);
    }

    /**
     * Generates the template string for the valueHelp based on the dataField path.
     *
     * @param datFieldPath DatFieldPath to be evaluated
     * @returns The xml string representation of the valueHelp
     */;
    _proto.getValueHelpTemplateFromPath = function getValueHelpTemplateFromPath(datFieldPath) {
      return datFieldPath ? `<macros:ValueHelp
        idPrefix="${generate([this.id, "TableValueHelp"])}"
        property="${datFieldPath}/Value"
    />` : "";
    }

    /**
     * Generates the template string for the valueHelp based on column.
     *
     * @param column Column to be evaluated
     * @returns The xml string representation of the valueHelp
     */;
    _proto.getValueHelp = function getValueHelp(column) {
      const dataFieldObject = this.convertedMetaData.resolvePath(column.annotationPath).target;
      if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === "com.sap.vocabularies.UI.v1.Chart") {
        return ``;
      } else if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === "com.sap.vocabularies.UI.v1.FieldGroup") {
        let template = ``;
        for (const index in dataFieldObject.Target.$target.Data) {
          template += this.getValueHelpTemplateFromPath(column.annotationPath + "/Target/$AnnotationPath/Data/" + index);
        }
        return xml`${template}`;
      } else {
        return xml`${this.getValueHelpTemplateFromPath(column.annotationPath)}`;
      }
    };
    /**
     * Generates the template string for the actionCommand.
     *
     * @param actionName The name of the action
     * @param action Action to be evaluated
     * @returns The xml string representation of the actionCommand
     */
    _proto.getActionCommand = function getActionCommand(actionName, action) {
      var _dataField$ActionTarg, _dataField$ActionTarg2, _dataField$ActionTarg3, _dataField$ActionTarg4, _dataField$ActionTarg5;
      const dataField = action.annotationPath ? this.convertedMetaData.resolvePath(action.annotationPath).target : undefined;
      const actionContext = action.annotationPath ? CommonHelper.getActionContext(this.metaPath.getModel().createBindingContext(action.annotationPath + "/Action")) : undefined;
      const isBound = dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg = dataField.ActionTarget) === null || _dataField$ActionTarg === void 0 ? void 0 : _dataField$ActionTarg.isBound;
      const isOperationAvailable = (dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : (_dataField$ActionTarg3 = _dataField$ActionTarg2.annotations) === null || _dataField$ActionTarg3 === void 0 ? void 0 : (_dataField$ActionTarg4 = _dataField$ActionTarg3.Core) === null || _dataField$ActionTarg4 === void 0 ? void 0 : (_dataField$ActionTarg5 = _dataField$ActionTarg4.OperationAvailable) === null || _dataField$ActionTarg5 === void 0 ? void 0 : _dataField$ActionTarg5.valueOf()) !== false;
      const displayCommandAction = action.type === "ForAction" ? isBound !== true || isOperationAvailable : true;
      if (displayCommandAction) {
        var _NavigationAvailable;
        return xml`<internalMacro:ActionCommand
							action="{tableDefinition>commandActions/${actionName}}"
							onExecuteAction="${TableHelper.pressEventDataFieldForActionButton(this, dataField, this.collectionEntity.name, this.tableDefinition.operationAvailableMap, actionContext, action.isNavigable, action.enableAutoScroll, action.defaultValuesExtensionFunction)}"
							onExecuteIBN="${CommonHelper.getPressHandlerForDataFieldForIBN(dataField, "${internal>selectedContexts}", !this.tableDefinition.enableAnalytics)}"
							onExecuteManifest="${action.noWrap ? action.press : CommonHelper.buildActionWrapper(action, this)}"
							isIBNEnabled="${action.enabled ?? TableHelper.isDataFieldForIBNEnabled(this, dataField, !!dataField.RequiresContext, (_NavigationAvailable = dataField.NavigationAvailable) === null || _NavigationAvailable === void 0 ? void 0 : _NavigationAvailable.valueOf())}"
							isActionEnabled="${action.enabled ?? TableHelper.isDataFieldForActionEnabled(this, dataField, !!isBound, actionContext, action.enableOnSelect)}"
							/>`;
      }
      return ``;
    };
    /**
     * Generates the template string for the CreationRow.
     *
     * @returns The xml string representation of the CreationRow
     */
    _proto.getCreationRow = function getCreationRow() {
      if (this.creationMode === "CreationRow") {
        const creationRowAction = this.tableDefinition.annotation.standardActions.actions.creationRow;
        if (creationRowAction.isTemplated) {
          return xml`<mdc:creationRow>
							<mdcTable:CreationRow
								id="${generate([this.id, "CreationRow"])}"
								visible="${creationRowAction.visible}"
								apply="${TableHelper.pressEventForCreateButton(this, false)}"
								applyEnabled="${creationRowAction.enabled}"
								macrodata:disableAddRowButtonForEmptyData="${this.disableAddRowButtonForEmptyData}"
								macrodata:customValidationFunction="${this.customValidationFunction}"
							/>
					   	   </mdc:creationRow>`;
        }
      }
      return "";
    };
    _proto.getRowSetting = function getRowSetting() {
      var _this$tableDefinition4, _this$tableDefinition5;
      let rowSettingsTemplate = `<mdcTable:RowSettings
        navigated="${(_this$tableDefinition4 = this.tableDefinition.annotation.row) === null || _this$tableDefinition4 === void 0 ? void 0 : _this$tableDefinition4.rowNavigated}"
        highlight="${(_this$tableDefinition5 = this.tableDefinition.annotation.row) === null || _this$tableDefinition5 === void 0 ? void 0 : _this$tableDefinition5.rowHighlighting}"
        >`;
      if (this.rowAction === "Navigation") {
        var _this$tableDefinition6;
        rowSettingsTemplate += `<mdcTable:rowActions>
                <mdcTable:RowActionItem
                    type = "${this.rowAction}"
                    press = "${this.tableType === "ResponsiveTable" ? "" : this.rowPress}"
                    visible = "${(_this$tableDefinition6 = this.tableDefinition.annotation.row) === null || _this$tableDefinition6 === void 0 ? void 0 : _this$tableDefinition6.visible}"
                    />
                </mdcTable:rowActions>`;
      }
      rowSettingsTemplate += `</mdcTable:RowSettings>`;
      return xml`${rowSettingsTemplate}`;
    };
    _proto.getVariantManagement = function getVariantManagement() {
      if (this.variantManagement === "Control") {
        return xml`<mdc:variant>
                        <variant:VariantManagement
                            id="${generate([this.id, "VM"])}"
                            for="{this>id}"
                            showSetAsDefault="true"
                            select="{this>variantSelected}"
                            headerLevel="${this.headerLevel}"
                            save="${this.variantSaved}"
                        />
                    </mdc:variant>`;
      }
      return "";
    };
    _proto.getQuickFilter = function getQuickFilter() {
      var _this$tableDefinition7;
      if ((_this$tableDefinition7 = this.tableDefinition.control.filters) !== null && _this$tableDefinition7 !== void 0 && _this$tableDefinition7.quickFilters) {
        var _this$tableDefinition8;
        const quickFilters = this.tableDefinition.control.filters.quickFilters;
        return xml`<template:with path="tableDefinition>control/filters/quickFilters" var="quickFilters">
                        <mdc:quickFilter>
                            <macroTable:QuickFilterContainer
                                id="${generate([this.id, "QuickFilterContainer"])}"
                                entitySet="${CommonHelper.getContextPath(null, {
          context: this.collection
        })}"
                                parentEntityType="{contextPath>$Type}"
                                showCounts="${quickFilters.showCounts === true}"
                                macrodata:filters="${TableHelper.formatHiddenFilters((_this$tableDefinition8 = this.tableDefinition.control.filters) === null || _this$tableDefinition8 === void 0 ? void 0 : _this$tableDefinition8.quickFilters)}"
                                batchGroupId="$auto.Workers"
                            />
                        </mdc:quickFilter>
                    </template:with>`;
      }
      return "";
    };
    _proto.getEmptyRowsEnabled = function getEmptyRowsEnabled() {
      return this.creationMode === CreationMode.InlineCreationRows ? this.tableDefinition.annotation.standardActions.actions.create.enabled : undefined;
    };
    _proto.getTemplate = function getTemplate() {
      var _this$tableDefinition9, _annotations$Capabili, _annotations$Capabili2, _annotations$Capabili3, _TableHelper$getDeleg, _this$isAlp, _annotations$Common, _this$metaPath, _this$contextPath, _this$tableDefinition10;
      const headerBindingExpression = buildExpressionForHeaderVisible(this);
      if (this.rowPress) {
        this.rowAction = "Navigation";
      }
      this.rowPress ??= (_this$tableDefinition9 = this.tableDefinition.annotation.row) === null || _this$tableDefinition9 === void 0 ? void 0 : _this$tableDefinition9.press;
      const collectionDeletablePath = (_annotations$Capabili = this.collectionEntity.annotations.Capabilities) === null || _annotations$Capabili === void 0 ? void 0 : (_annotations$Capabili2 = _annotations$Capabili.DeleteRestrictions) === null || _annotations$Capabili2 === void 0 ? void 0 : (_annotations$Capabili3 = _annotations$Capabili2.Deletable) === null || _annotations$Capabili3 === void 0 ? void 0 : _annotations$Capabili3.path;
      const lineItem = TableHelper.getUiLineItemObject(this.metaPath, this.convertedMetaData);
      const delegate = (_TableHelper$getDeleg = TableHelper.getDelegate) === null || _TableHelper$getDeleg === void 0 ? void 0 : _TableHelper$getDeleg.call(TableHelper, this.tableDefinition, (_this$isAlp = this.isAlp) === null || _this$isAlp === void 0 ? void 0 : _this$isAlp.toString(), this.tableDefinition.annotation.entityName);
      const selectionChange = `TableRuntime.setContexts(\${$source>/}, '${collectionDeletablePath}', '${(_annotations$Common = this.collectionEntity.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : _annotations$Common.DraftRoot}', '${this.tableDefinition.operationAvailableMap}', '${TableHelper.getNavigationAvailableMap(lineItem)}', '${ActionHelper.getMultiSelectDisabledActions(lineItem)}', '${this.updatablePropertyPath}')`;
      const entityType = this._getEntityType();
      return xml`
            <macroTable:TableAPI
                xmlns="sap.m"
                xmlns:mdc="sap.ui.mdc"
                xmlns:plugins="sap.m.plugins"
                xmlns:mdcTable="sap.ui.mdc.table"
                xmlns:macroTable="sap.fe.macros.table"
                xmlns:mdcat="sap.ui.mdc.actiontoolbar"
                xmlns:core="sap.ui.core"
                xmlns:control="sap.fe.core.controls"
                xmlns:dt="sap.ui.dt"
                xmlns:fl="sap.ui.fl"
                xmlns:variant="sap.ui.fl.variants"
                xmlns:p13n="sap.ui.mdc.p13n"
                xmlns:internalMacro="sap.fe.macros.internal"
                xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                id="${this._apiId}"
                tableDefinition="{_pageModel>${this.tableDefinitionContext.getPath()}}"
                entityTypeFullyQualifiedName="${entityType === null || entityType === void 0 ? void 0 : entityType.fullyQualifiedName}"
                metaPath="${(_this$metaPath = this.metaPath) === null || _this$metaPath === void 0 ? void 0 : _this$metaPath.getPath()}"
                contextPath="${(_this$contextPath = this.contextPath) === null || _this$contextPath === void 0 ? void 0 : _this$contextPath.getPath()}"
                stateChange="${this.stateChange}"
                selectionChange="${this.selectionChange}"
                readOnly="${this.readOnly}"
                filterBar="${this.filterBar}"
                macrodata:tableAPILocalId="${this._apiId}"
                emptyRowsEnabled="${this.getEmptyRowsEnabled()}"
                enableAutoColumnWidth="${this.enableAutoColumnWidth}"
                isOptimizedForSmallDevice="${this.isOptimizedForSmallDevice}"
            >
				<template:with path="collection>${CommonHelper.getTargetCollectionPath(this.collection)}" var="targetCollection">
                <macroTable:layoutData>
                    <FlexItemData maxWidth="100%" />
                </macroTable:layoutData>
                <!-- macrodata has to be an expression binding if it needs to be set as attribute via change handler during templating -->
                    <mdc:Table
                        binding="{internal>controls/${this.id}}"
                        unittest:id="TableMacroFragment"
                        core:require="{TableRuntime: 'sap/fe/macros/table/TableRuntime', API: 'sap/fe/macros/table/TableAPI'}"
                        fl:flexibility="{this>fl:flexibility}"
                        sortConditions="${this.tableDefinition.annotation.sortConditions}"
                        groupConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.groupConditions)}"
                        aggregateConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.aggregateConditions)}"
                        dt:designtime="${this.variantManagement === "None" ? "not-adaptable" : undefined}"
                        macrodata:kind="${this.collectionEntity._type}"
                        macrodata:navigationPath="${this.navigationPath}"
                        id="${this.id}"
                        busy="${this.busy}"
                        busyIndicatorDelay="0"
                        enableExport="${this.enableExport}"
                        delegate="${delegate}"
                        rowPress="${this.rowPress}"
                        height="100%"
                        autoBindOnInit="${this.autoBindOnInit && !this.filterBar}"
                        selectionMode="${this.selectionMode || "None"}"
                        selectionChange="${selectionChange}"
                        showRowCount="${this.tableDefinition.control.showRowCount}"
                        ${this.attr("header", this.header)}
                        headerVisible="${headerBindingExpression}"
                        headerLevel="${this.headerLevel}"
                        threshold="${this.tableDefinition.annotation.threshold}"
                        noData="${this.noDataText}"
                        p13nMode="${this.personalization}"
                        filter="${this.filterBarId}"
                        paste="API.onPaste($event, $controller)"
                        beforeExport="API.onBeforeExport($event)"
                        class="${this.tableDefinition.control.useCondensedTableLayout === true ? "sapUiSizeCondensed" : undefined}"
                        multiSelectMode="${this.tableDefinition.control.multiSelectMode}"
                        showPasteButton="${this.tableDefinition.annotation.standardActions.actions.paste.visible}"
                        enablePaste="${this.tableDefinition.annotation.standardActions.actions.paste.enabled}"
                        macrodata:rowsBindingInfo="${TableHelper.getRowsBindingInfo(this)}"
                        macrodata:enableAnalytics="${this.tableDefinition.enableAnalytics}"
                        macrodata:creationMode="${this.creationMode}"
                        macrodata:inlineCreationRowCount="${this.inlineCreationRowCount}"
                        macrodata:showCreate="${this.showCreate}"
                        macrodata:createAtEnd="${this.createAtEnd}"
                        macrodata:enableAutoScroll="${this.enableAutoScroll}"
                        macrodata:displayModePropertyBinding="${this.readOnly}"
                        macrodata:tableType="${this.tableType}"
                        macrodata:targetCollectionPath="${CommonHelper.getContextPath(null, {
        context: this.collection
      })}"
                        macrodata:entityType="${CommonHelper.getContextPath(null, {
        context: this.collection
      }) + "/"}"
                        macrodata:metaPath="${CommonHelper.getContextPath(null, {
        context: this.collection
      })}"
                        macrodata:onChange="${this.onChange}"
                        macrodata:hiddenFilters="${TableHelper.formatHiddenFilters((_this$tableDefinition10 = this.tableDefinition.control.filters) === null || _this$tableDefinition10 === void 0 ? void 0 : _this$tableDefinition10.hiddenFilters)}"
                        macrodata:requestGroupId="$auto.Workers"
                        macrodata:segmentedButtonId="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
                        macrodata:enablePaste="${this.enablePaste}"
                        macrodata:operationAvailableMap="${CommonHelper.stringifyCustomData(this.tableDefinition.operationAvailableMap)}"
                        visible="${this.visible}"
                    >
                        <mdc:dataStateIndicator>
                            <plugins:DataStateIndicator
                                filter="${this.dataStateIndicatorFilter}"
                                enableFiltering="true"
                                dataStateChange="API.onDataStateChange"
                            />
                        </mdc:dataStateIndicator>
                        <mdc:type>
                            ${this.getTableType()}
                        </mdc:type>
                        <mdc:dependents>
                            ${this.getDependents()}
                        </mdc:dependents>
                        <mdc:actions>
                            ${this.getActions()}
                        </mdc:actions>
                        <mdc:rowSettings>
                        ${this.getRowSetting()}
                        </mdc:rowSettings>
                        <mdc:columns>
                            <core:Fragment fragmentName="sap.fe.macros.table.Columns" type="XML" />
                        </mdc:columns>
                        ${this.getCreationRow()}
                        ${this.getVariantManagement()}
                        ${this.getQuickFilter()}
                    </mdc:Table>
				</template:with>
            </macroTable:TableAPI>
        `;
    };
    return TableBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "headerLevel", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "useCondensedLayout", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "_apiId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "autoBindOnInit", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "collectionEntity", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "columnEditMode", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "createAtEnd", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "createNewAction", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "creationMode", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "createOutbound", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "createOutboundDetail", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "customValidationFunction", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "dataStateIndicatorFilter", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "disableAddRowButtonForEmptyData", [_dec32], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec33], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoScroll", [_dec34], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "fieldMode", [_dec35], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor35 = _applyDecoratedDescriptor(_class2.prototype, "filterBarId", [_dec36], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor36 = _applyDecoratedDescriptor(_class2.prototype, "inlineCreationRowCount", [_dec37], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor37 = _applyDecoratedDescriptor(_class2.prototype, "isAlp", [_dec38], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor38 = _applyDecoratedDescriptor(_class2.prototype, "isCompactType", [_dec39], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor39 = _applyDecoratedDescriptor(_class2.prototype, "isOptimizedForSmallDevice", [_dec40], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor40 = _applyDecoratedDescriptor(_class2.prototype, "multiSelectMode", [_dec41], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor41 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec42], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor42 = _applyDecoratedDescriptor(_class2.prototype, "noDataText", [_dec43], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor43 = _applyDecoratedDescriptor(_class2.prototype, "rowAction", [_dec44], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return undefined;
    }
  }), _descriptor44 = _applyDecoratedDescriptor(_class2.prototype, "tableType", [_dec45], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor45 = _applyDecoratedDescriptor(_class2.prototype, "updatablePropertyPath", [_dec46], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor46 = _applyDecoratedDescriptor(_class2.prototype, "useBasicSearch", [_dec47], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor47 = _applyDecoratedDescriptor(_class2.prototype, "searchable", [_dec48], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor48 = _applyDecoratedDescriptor(_class2.prototype, "selectionLimit", [_dec49], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor49 = _applyDecoratedDescriptor(_class2.prototype, "showCreate", [_dec50], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor50 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec51], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor51 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinitionContext", [_dec52], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor52 = _applyDecoratedDescriptor(_class2.prototype, "tableDelegate", [_dec53], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor53 = _applyDecoratedDescriptor(_class2.prototype, "tabTitle", [_dec54], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor54 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec55], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor55 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec56], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor56 = _applyDecoratedDescriptor(_class2.prototype, "columns", [_dec57], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor57 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec58], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor58 = _applyDecoratedDescriptor(_class2.prototype, "onContextChange", [_dec59], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor59 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec60], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor60 = _applyDecoratedDescriptor(_class2.prototype, "onSegmentedButtonPressed", [_dec61], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor61 = _applyDecoratedDescriptor(_class2.prototype, "variantSaved", [_dec62], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor62 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec63], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor63 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec64], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor64 = _applyDecoratedDescriptor(_class2.prototype, "variantSelected", [_dec65], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = TableBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzIiwiY2hpbGRBY3Rpb24iLCJtZW51Q29udGVudEFjdGlvbnMiLCJhY3QiLCJtZW51QWN0aW9ucyIsImFjdGlvbktleSIsImdldEF0dHJpYnV0ZSIsInJlcGxhY2UiLCJjaGlsZHJlbiIsImxlbmd0aCIsImxvY2FsTmFtZSIsIm5hbWVzcGFjZVVSSSIsImFjdGlvbnNUb0FkZCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJhcHBseSIsImFjdGlvbklkeCIsInJlZHVjZSIsImFjYyIsImFjdFRvQWRkIiwiYWN0aW9uS2V5QWRkIiwiY3VyT3V0T2JqZWN0Iiwia2V5IiwidGV4dCIsIl9fbm9XcmFwIiwicHJlc3MiLCJyZXF1aXJlc1NlbGVjdGlvbiIsImVuYWJsZWQiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJtZW51SXRlbSIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiYW5jaG9yIiwibWVudSIsInNldEN1c3RvbUNvbHVtblByb3BlcnRpZXMiLCJjaGlsZENvbHVtbiIsImFnZ3JlZ2F0aW9uT2JqZWN0Iiwic2V0QXR0cmlidXRlIiwidHlwZSIsIndpZHRoIiwiaW1wb3J0YW5jZSIsImhvcml6b250YWxBbGlnbiIsImF2YWlsYWJpbGl0eSIsImhlYWRlciIsInRlbXBsYXRlIiwib3V0ZXJIVE1MIiwicHJvcGVydGllcyIsInNwbGl0IiwidW5kZWZpbmVkIiwiVGFibGVCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJpc1B1YmxpYyIsInJlcXVpcmVkIiwiZXhwZWN0ZWRUeXBlcyIsImJsb2NrQWdncmVnYXRpb24iLCJwcm9jZXNzQWdncmVnYXRpb25zIiwiaGFzVmlydHVhbE5vZGUiLCJibG9ja0V2ZW50IiwicHJvcHMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwiZ2V0VGFibGVUeXBlIiwiY29sbGVjdGlvbiIsImdldE9iamVjdCIsInRhYmxlVHlwZSIsInhtbCIsInRhYmxlRGVmaW5pdGlvbiIsImNvbnRyb2wiLCJyb3dDb3VudE1vZGUiLCJyb3dDb3VudCIsInNlbGVjdGlvbkxpbWl0IiwiZ3Jvd2luZ01vZGUiLCIka2luZCIsImdldERlcGVuZGVudHMiLCJkZXBlbmRlbnRzIiwicmVhZE9ubHkiLCJjb2x1bW5zIiwiY29sdW1uIiwiZ2V0VmFsdWVIZWxwIiwic3RhbmRhcmRBY3Rpb25zIiwiYW5ub3RhdGlvbiIsImFjdGlvbnMiLCJpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCIsImNyZWF0ZSIsImlzVGVtcGxhdGVkIiwiVGFibGVIZWxwZXIiLCJwcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uIiwidmlzaWJsZSIsImRlbGV0ZSIsImhlYWRlckluZm8iLCJjb2xsZWN0aW9uRW50aXR5IiwiZW50aXR5VHlwZSIsInRhcmdldFR5cGUiLCJhbm5vdGF0aW9ucyIsIlVJIiwiSGVhZGVySW5mbyIsInByZXNzRXZlbnRGb3JEZWxldGVCdXR0b24iLCJjb250ZXh0T2JqZWN0UGF0aCIsImFjdGlvbk5hbWUiLCJjb21tYW5kQWN0aW9ucyIsImFjdGlvbiIsImdldEFjdGlvbkNvbW1hbmQiLCJ2YXJpYW50TWFuYWdlbWVudCIsImdlbmVyYXRlIiwiaWQiLCJnZXRBY3Rpb25zIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiQ29tbW9uSGVscGVyIiwiaXNEZXNrdG9wIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwibWV0YVBhdGgiLCJjb250ZXh0UGF0aCIsInBhZ2VDb250ZXh0IiwiYmluZGluZ0NvbnRleHRzIiwiY29udmVydGVyQ29udGV4dCIsInBhZ2VUZW1wbGF0ZVR5cGUiLCJzZXRVcFRhYmxlRGVmaW5pdGlvbiIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udmVydGVkTWV0YURhdGEiLCJjb252ZXJ0ZWRUeXBlcyIsInJlc29sdmVQYXRoIiwidGFyZ2V0Iiwic2V0VXBJZCIsInNlbGVjdGlvbk1vZGUiLCJlbmFibGVGdWxsU2NyZWVuIiwiZW5hYmxlRXhwb3J0IiwiZW5hYmxlUGFzdGUiLCJwYXN0ZSIsInVwZGF0YWJsZVByb3BlcnR5UGF0aCIsImRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJoZWFkZXJWaXNpYmxlIiwic2VhcmNoYWJsZSIsImlubGluZUNyZWF0aW9uUm93Q291bnQiLCJ0aXRsZSIsImlzQ29tcGFjdFR5cGUiLCJjcmVhdGlvbk1vZGUiLCJtb2RlIiwiY3JlYXRlQXRFbmQiLCJhcHBlbmQiLCJjcmVhdGVPdXRib3VuZCIsIm91dGJvdW5kIiwiY3JlYXRlTmV3QWN0aW9uIiwibmV3QWN0aW9uIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJvdXRib3VuZERldGFpbCIsInBlcnNvbmFsaXphdGlvbiIsInAxM25Nb2RlIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyIiwiaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSIsIkNvbW1vblV0aWxzIiwiaXNTbWFsbERldmljZSIsIm5hdmlnYXRpb25QYXRoIiwic3RhcnRzV2l0aCIsImlzU2luZ2xldG9uIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJzZXRSZWFkT25seSIsInJvd1ByZXNzIiwicm93QWN0aW9uIiwicm93IiwiaXNTZWFyY2hhYmxlIiwidXNlQmFzaWNTZWFyY2giLCJmaWx0ZXJCYXIiLCJmaWx0ZXJCYXJJZCIsInNob3dDcmVhdGUiLCJhdXRvQmluZE9uSW5pdCIsImNvbHVtbkVkaXRNb2RlIiwiZ2V0VmlzdWFsaXphdGlvblBhdGgiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiTG9nIiwiZXJyb3IiLCJ0YXJnZXRPYmplY3QiLCJ0ZXJtIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsInZpc3VhbGl6YXRpb25zIiwiUHJlc2VudGF0aW9uVmFyaWFudCIsImdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQiLCJsaW5lSXRlbVZpeiIsImZpbmQiLCJ2aXoiLCJ2aXN1YWxpemF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRQcmVzZW50YXRpb25QYXRoIiwicHJlc2VudGF0aW9uUGF0aCIsInRhYmxlIiwiaW5pdGlhbENvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0UGF0aCIsInZpc3VhbGl6YXRpb25QYXRoIiwiZXh0cmFQYXJhbXMiLCJ0YWJsZVNldHRpbmdzIiwiZm9yRWFjaCIsIml0ZW0iLCJ2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZExheW91dCIsInRhYmxlRGVmaW5pdGlvbkNvbnRleHQiLCJNYWNyb0FQSSIsIl9hcGlJZCIsImdldENvbnRlbnRJZCIsImRpc3BsYXlNb2RlIiwiX2dldEVudGl0eVR5cGUiLCJnZXRWYWx1ZUhlbHBUZW1wbGF0ZUZyb21QYXRoIiwiZGF0RmllbGRQYXRoIiwiZGF0YUZpZWxkT2JqZWN0IiwiaXNEYXRhRmllbGRGb3JBbm5vdGF0aW9uIiwiVGFyZ2V0IiwiJHRhcmdldCIsImluZGV4IiwiRGF0YSIsImRhdGFGaWVsZCIsImFjdGlvbkNvbnRleHQiLCJnZXRBY3Rpb25Db250ZXh0IiwiZ2V0TW9kZWwiLCJpc0JvdW5kIiwiQWN0aW9uVGFyZ2V0IiwiaXNPcGVyYXRpb25BdmFpbGFibGUiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwidmFsdWVPZiIsImRpc3BsYXlDb21tYW5kQWN0aW9uIiwicHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbiIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImlzTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsImVuYWJsZUFuYWx5dGljcyIsIm5vV3JhcCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsImlzRGF0YUZpZWxkRm9ySUJORW5hYmxlZCIsIlJlcXVpcmVzQ29udGV4dCIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQiLCJlbmFibGVPblNlbGVjdCIsImdldENyZWF0aW9uUm93IiwiY3JlYXRpb25Sb3dBY3Rpb24iLCJjcmVhdGlvblJvdyIsImdldFJvd1NldHRpbmciLCJyb3dTZXR0aW5nc1RlbXBsYXRlIiwicm93TmF2aWdhdGVkIiwicm93SGlnaGxpZ2h0aW5nIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJoZWFkZXJMZXZlbCIsInZhcmlhbnRTYXZlZCIsImdldFF1aWNrRmlsdGVyIiwiZmlsdGVycyIsInF1aWNrRmlsdGVycyIsImdldENvbnRleHRQYXRoIiwiY29udGV4dCIsInNob3dDb3VudHMiLCJmb3JtYXRIaWRkZW5GaWx0ZXJzIiwiZ2V0RW1wdHlSb3dzRW5hYmxlZCIsIkNyZWF0aW9uTW9kZSIsIklubGluZUNyZWF0aW9uUm93cyIsImdldFRlbXBsYXRlIiwiaGVhZGVyQmluZGluZ0V4cHJlc3Npb24iLCJidWlsZEV4cHJlc3Npb25Gb3JIZWFkZXJWaXNpYmxlIiwiY29sbGVjdGlvbkRlbGV0YWJsZVBhdGgiLCJDYXBhYmlsaXRpZXMiLCJEZWxldGVSZXN0cmljdGlvbnMiLCJEZWxldGFibGUiLCJwYXRoIiwibGluZUl0ZW0iLCJnZXRVaUxpbmVJdGVtT2JqZWN0IiwiZGVsZWdhdGUiLCJnZXREZWxlZ2F0ZSIsImlzQWxwIiwidG9TdHJpbmciLCJlbnRpdHlOYW1lIiwic2VsZWN0aW9uQ2hhbmdlIiwiQ29tbW9uIiwiRHJhZnRSb290IiwiZ2V0TmF2aWdhdGlvbkF2YWlsYWJsZU1hcCIsIkFjdGlvbkhlbHBlciIsImdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwic3RhdGVDaGFuZ2UiLCJnZXRUYXJnZXRDb2xsZWN0aW9uUGF0aCIsInNvcnRDb25kaXRpb25zIiwic3RyaW5naWZ5T2JqZWN0IiwiZ3JvdXBDb25kaXRpb25zIiwiYWdncmVnYXRlQ29uZGl0aW9ucyIsIl90eXBlIiwiYnVzeSIsInNob3dSb3dDb3VudCIsImF0dHIiLCJ0aHJlc2hvbGQiLCJub0RhdGFUZXh0IiwidXNlQ29uZGVuc2VkVGFibGVMYXlvdXQiLCJtdWx0aVNlbGVjdE1vZGUiLCJnZXRSb3dzQmluZGluZ0luZm8iLCJvbkNoYW5nZSIsImhpZGRlbkZpbHRlcnMiLCJzdHJpbmdpZnlDdXN0b21EYXRhIiwiQnVpbGRpbmdCbG9ja0Jhc2UiLCJUaXRsZUxldmVsIiwiQXV0byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGUuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29udmVydGVkTWV0YWRhdGEsIEVudGl0eVNldCwgTmF2aWdhdGlvblByb3BlcnR5LCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7XG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZEZvckFjdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRVSUFubm90YXRpb25UZXJtc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB7IEN1c3RvbUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCxcblx0VmlzdWFsaXphdGlvbkFuZFBhdGhcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdFRhYmxlVmlzdWFsaXphdGlvbixcblx0dHlwZSBDcmVhdGVCZWhhdmlvcixcblx0dHlwZSBDcmVhdGVCZWhhdmlvckV4dGVybmFsXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQ3JlYXRpb25Nb2RlLCBUZW1wbGF0ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNTaW5nbGV0b24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgYnVpbGRFeHByZXNzaW9uRm9ySGVhZGVyVmlzaWJsZSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvVGFibGVUZW1wbGF0aW5nXCI7XG5pbXBvcnQgeyBUaXRsZUxldmVsIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwiLi4vQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCIuLi9pbnRlcm5hbC9oZWxwZXJzL0FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Hcm91cCwgQ29sdW1uIH0gZnJvbSBcIi4vVGFibGVBUElcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwiLi9UYWJsZUhlbHBlclwiO1xudHlwZSBFeHRlbmRlZEFjdGlvbkdyb3VwID0gQWN0aW9uR3JvdXAgJiB7IG1lbnVDb250ZW50QWN0aW9ucz86IFJlY29yZDxzdHJpbmcsIEFjdGlvbj4gfTtcbnR5cGUgQWN0aW9uT3JBY3Rpb25Hcm91cCA9IFJlY29yZDxzdHJpbmcsIEFjdGlvbiB8IEV4dGVuZGVkQWN0aW9uR3JvdXA+O1xuXG5jb25zdCBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGNoaWxkQWN0aW9uOiBFbGVtZW50KSB7XG5cdGxldCBtZW51Q29udGVudEFjdGlvbnMgPSBudWxsO1xuXHRjb25zdCBhY3QgPSBjaGlsZEFjdGlvbjtcblx0bGV0IG1lbnVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBhY3Rpb25LZXkgPSBhY3QuZ2V0QXR0cmlidXRlKFwia2V5XCIpPy5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKTtcblx0aWYgKGFjdC5jaGlsZHJlbi5sZW5ndGggJiYgYWN0LmxvY2FsTmFtZSA9PT0gXCJBY3Rpb25Hcm91cFwiICYmIGFjdC5uYW1lc3BhY2VVUkkgPT09IFwic2FwLmZlLm1hY3Jvc1wiKSB7XG5cdFx0Y29uc3QgYWN0aW9uc1RvQWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFjdC5jaGlsZHJlbik7XG5cdFx0bGV0IGFjdGlvbklkeCA9IDA7XG5cdFx0bWVudUNvbnRlbnRBY3Rpb25zID0gYWN0aW9uc1RvQWRkLnJlZHVjZSgoYWNjLCBhY3RUb0FkZCkgPT4ge1xuXHRcdFx0Y29uc3QgYWN0aW9uS2V5QWRkID0gYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwia2V5XCIpPy5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKSB8fCBhY3Rpb25LZXkgKyBcIl9NZW51X1wiICsgYWN0aW9uSWR4O1xuXHRcdFx0Y29uc3QgY3VyT3V0T2JqZWN0ID0ge1xuXHRcdFx0XHRrZXk6IGFjdGlvbktleUFkZCxcblx0XHRcdFx0dGV4dDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRcdFx0X19ub1dyYXA6IHRydWUsXG5cdFx0XHRcdHByZXNzOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJwcmVzc1wiKSxcblx0XHRcdFx0cmVxdWlyZXNTZWxlY3Rpb246IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInJlcXVpcmVzU2VsZWN0aW9uXCIpID09PSBcInRydWVcIixcblx0XHRcdFx0ZW5hYmxlZDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSA9PT0gbnVsbCA/IHRydWUgOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpXG5cdFx0XHR9O1xuXHRcdFx0YWNjW2N1ck91dE9iamVjdC5rZXldID0gY3VyT3V0T2JqZWN0O1xuXHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH0sIHt9KTtcblx0XHRtZW51QWN0aW9ucyA9IE9iamVjdC52YWx1ZXMobWVudUNvbnRlbnRBY3Rpb25zKVxuXHRcdFx0LnNsaWNlKC1hY3QuY2hpbGRyZW4ubGVuZ3RoKVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAobWVudUl0ZW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVudUl0ZW0ua2V5O1xuXHRcdFx0fSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRrZXk6IGFjdGlvbktleSxcblx0XHR0ZXh0OiBhY3QuZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRwb3NpdGlvbjoge1xuXHRcdFx0cGxhY2VtZW50OiBhY3QuZ2V0QXR0cmlidXRlKFwicGxhY2VtZW50XCIpLFxuXHRcdFx0YW5jaG9yOiBhY3QuZ2V0QXR0cmlidXRlKFwiYW5jaG9yXCIpXG5cdFx0fSxcblx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRwcmVzczogYWN0LmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdHJlcXVpcmVzU2VsZWN0aW9uOiBhY3QuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdGVuYWJsZWQ6IGFjdC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpLFxuXHRcdG1lbnU6IG1lbnVBY3Rpb25zLmxlbmd0aCA/IG1lbnVBY3Rpb25zIDogbnVsbCxcblx0XHRtZW51Q29udGVudEFjdGlvbnM6IG1lbnVDb250ZW50QWN0aW9uc1xuXHR9O1xufTtcblxuY29uc3Qgc2V0Q3VzdG9tQ29sdW1uUHJvcGVydGllcyA9IGZ1bmN0aW9uIChjaGlsZENvbHVtbjogRWxlbWVudCwgYWdncmVnYXRpb25PYmplY3Q6IGFueSkge1xuXHRhZ2dyZWdhdGlvbk9iamVjdC5rZXkgPSBhZ2dyZWdhdGlvbk9iamVjdC5rZXkucmVwbGFjZShcIklubGluZVhNTF9cIiwgXCJcIik7XG5cdGNoaWxkQ29sdW1uLnNldEF0dHJpYnV0ZShcImtleVwiLCBhZ2dyZWdhdGlvbk9iamVjdC5rZXkpO1xuXHRyZXR1cm4ge1xuXHRcdC8vIERlZmF1bHRzIGFyZSB0byBiZSBkZWZpbmVkIGluIFRhYmxlLnRzXG5cdFx0a2V5OiBhZ2dyZWdhdGlvbk9iamVjdC5rZXksXG5cdFx0dHlwZTogXCJTbG90XCIsXG5cdFx0d2lkdGg6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpLFxuXHRcdGltcG9ydGFuY2U6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImltcG9ydGFuY2VcIiksXG5cdFx0aG9yaXpvbnRhbEFsaWduOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJob3Jpem9udGFsQWxpZ25cIiksXG5cdFx0YXZhaWxhYmlsaXR5OiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJhdmFpbGFiaWxpdHlcIiksXG5cdFx0aGVhZGVyOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJoZWFkZXJcIiksXG5cdFx0dGVtcGxhdGU6IGNoaWxkQ29sdW1uLmNoaWxkcmVuWzBdPy5vdXRlckhUTUwgfHwgXCJcIixcblx0XHRwcm9wZXJ0aWVzOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwcm9wZXJ0aWVzXCIpID8gY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicHJvcGVydGllc1wiKT8uc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkLFxuXHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRwbGFjZW1lbnQ6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcInBsYWNlbWVudFwiKSB8fCBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblBsYWNlbWVudFwiKSwgLy9wb3NpdGlvblBsYWNlbWVudCBpcyBrZXB0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHRcdFx0YW5jaG9yOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJhbmNob3JcIikgfHwgY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25BbmNob3JcIikgLy9wb3NpdGlvbkFuY2hvciBpcyBrZXB0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHRcdH1cblx0fTtcbn07XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJUYWJsZVwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0Ly8gICoqKioqKioqKioqKioqKiBQdWJsaWMgJiBSZXF1aXJlZCBBdHRyaWJ1dGVzICoqKioqKioqKioqKioqKioqKioqXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdG1ldGFQYXRoITogQ29udGV4dDtcblxuXHQvLyAgKioqKioqKioqKioqKioqIFB1YmxpYyBBdHRyaWJ1dGVzICoqKioqKioqKioqKioqKioqKioqXG5cdC8qKlxuXHQgKlRoZSBgYnVzeWAgbW9kZSBvZiB0YWJsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGJ1c3k/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0Y29udGV4dFBhdGg/OiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgdXNlZCB0byBzaG93IHRoZSBmdWxsU2NyZWVuIGJ1dHRvbiBvbiB0aGUgdGFibGUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0ZW5hYmxlRnVsbFNjcmVlbj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEVuYWJsZSBleHBvcnQgdG8gZmlsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGVuYWJsZUV4cG9ydD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEVuYWJsZSBleHBvcnQgdG8gZmlsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGVuYWJsZVBhc3RlPzogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udHJvbCBJRCBvZiB0aGUgRmlsdGVyQmFyIHRoYXQgaXMgdXNlZCB0byBmaWx0ZXIgdGhlIHJvd3Mgb2YgdGhlIHRhYmxlLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0ZmlsdGVyQmFyPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0YWJsZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGhlYWRlcj86IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgXCJhcmlhLWxldmVsXCIgb2YgdGhlIHRhYmxlIGhlYWRlclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGhlYWRlckxldmVsOiBUaXRsZUxldmVsID0gVGl0bGVMZXZlbC5BdXRvO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyBpZiB0aGUgaGVhZGVyIHRleHQgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGhlYWRlclZpc2libGU/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRpc1NlYXJjaGFibGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQZXJzb25hbGl6YXRpb24gTW9kZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmd8Ym9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRwZXJzb25hbGl6YXRpb24/OiBzdHJpbmcgfCBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgd2hldGhlciB0aGUgdGFibGUgc2hvdWxkIGJlIHJlYWQtb25seSBvciBub3QuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0cmVhZE9ubHk/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBbGxvd3MgdG8gY2hvb3NlIHRoZSBUYWJsZSB0eXBlLiBBbGxvd2VkIHZhbHVlcyBhcmUgYFJlc3BvbnNpdmVUYWJsZWAgb3IgYEdyaWRUYWJsZWAuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHR0eXBlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgd2hldGhlciB0aGUgdGFibGUgaXMgZGlzcGxheWVkIHdpdGggY29uZGVuc2VkIGxheW91dCAodHJ1ZS9mYWxzZSkuIFRoZSBkZWZhdWx0IHNldHRpbmcgaXMgYGZhbHNlYC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHR1c2VDb25kZW5zZWRMYXlvdXQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHNlbGVjdGlvbiBtb2RlIChOb25lLFNpbmdsZSxNdWx0aSxBdXRvKVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0c2VsZWN0aW9uTW9kZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHR2YXJpYW50TWFuYWdlbWVudD86IHN0cmluZztcblxuXHQvLyAgKioqKioqKioqKioqKioqIFByaXZhdGUgJiBSZXF1aXJlZCBBdHRyaWJ1dGVzICoqKioqKioqKioqKioqKioqKioqXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiBmYWxzZSxcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0Y29sbGVjdGlvbiE6IENvbnRleHQ7XG5cblx0Ly8gICoqKioqKioqKioqKioqKiBQcml2YXRlIEF0dHJpYnV0ZXMgKioqKioqKioqKioqKioqKioqKipcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRfYXBpSWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0YXV0b0JpbmRPbkluaXQ/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiRW50aXR5U2V0fE5hdmlnYXRpb25Qcm9wZXJ0eVwiIH0pXG5cdGNvbGxlY3Rpb25FbnRpdHk/OiBFbnRpdHlTZXQgfCBOYXZpZ2F0aW9uUHJvcGVydHk7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjb2x1bW5FZGl0TW9kZT86IHN0cmluZztcblxuXHQvKipcblx0ICogU2V0dGluZyB0byBkZXRlcm1pbmUgaWYgdGhlIG5ldyByb3cgc2hvdWxkIGJlIGNyZWF0ZWQgYXQgdGhlIGVuZCBvciBiZWdpbm5pbmdcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGNyZWF0ZUF0RW5kPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGNyZWF0ZU5ld0FjdGlvbj86IHN0cmluZztcblxuXHQvKipcblx0ICogQ3JlYXRpb24gTW9kZSB0byBiZSBwYXNzZWQgdG8gdGhlIG9uQ3JlYXRlIGhhbmRsZXIuIFZhbHVlczogW1wiSW5saW5lXCIsIFwiTmV3UGFnZVwiXVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjcmVhdGlvbk1vZGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjcmVhdGVPdXRib3VuZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGNyZWF0ZU91dGJvdW5kRGV0YWlsPzoge1xuXHRcdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdFx0YWN0aW9uOiBzdHJpbmc7XG5cdFx0cGFyYW1ldGVycz86IGFueTtcblx0fTtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBmdWxsIHBhdGggYW5kIGZ1bmN0aW9uIG5hbWUgb2YgYSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbi5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgd2hldGhlciB0aGUgYnV0dG9uIGlzIGhpZGRlbiB3aGVuIG5vIGRhdGEgaGFzIGJlZW4gZW50ZXJlZCB5ZXQgaW4gdGhlIHJvdyAodHJ1ZS9mYWxzZSkuIFRoZSBkZWZhdWx0IHNldHRpbmcgaXMgYGZhbHNlYC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGE/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVuYWJsZUF1dG9Db2x1bW5XaWR0aD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0ZW5hYmxlQXV0b1Njcm9sbD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRmaWVsZE1vZGU6IHN0cmluZyA9IFwiXCI7XG5cblx0LyoqXG5cdCAqIFRoZSBjb250cm9sIElEIG9mIHRoZSBGaWx0ZXJCYXIgdGhhdCBpcyB1c2VkIGludGVybmFsbHkgdG8gZmlsdGVyIHRoZSByb3dzIG9mIHRoZSB0YWJsZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmlsdGVyQmFySWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJudW1iZXJcIiB9KVxuXHRpbmxpbmVDcmVhdGlvblJvd0NvdW50PzogbnVtYmVyO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGlzQWxwPzogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGlzQ29tcGFjdFR5cGU/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2U/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBPTkxZIEZPUiBSRVNQT05TSVZFIFRBQkxFOiBTZXR0aW5nIHRvIGRlZmluZSB0aGUgY2hlY2tib3ggaW4gdGhlIGNvbHVtbiBoZWFkZXI6IEFsbG93ZWQgdmFsdWVzIGFyZSBgRGVmYXVsdGAgb3IgYENsZWFyQWxsYC4gSWYgc2V0IHRvIGBEZWZhdWx0YCwgdGhlIHNhcC5tLlRhYmxlIGNvbnRyb2wgcmVuZGVycyB0aGUgU2VsZWN0IEFsbCBjaGVja2JveCwgb3RoZXJ3aXNlIHRoZSBEZXNlbGVjdCBBbGwgYnV0dG9uIGlzIHJlbmRlcmVkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtdWx0aVNlbGVjdE1vZGU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFVzZWQgZm9yIGJpbmRpbmcgdGhlIHRhYmxlIHRvIGEgbmF2aWdhdGlvbiBwYXRoLiBPbmx5IHRoZSBwYXRoIGlzIHVzZWQgZm9yIGJpbmRpbmcgcm93cy5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bmF2aWdhdGlvblBhdGg/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSBub0RhdGFUZXh0IGZvciB0aGUgbWRjIHRhYmxlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5vRGF0YVRleHQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgcG9zc2libGUgYWN0aW9ucyBhdmFpbGFibGUgb24gdGhlIHRhYmxlIHJvdyAoTmF2aWdhdGlvbixudWxsKS4gVGhlIGRlZmF1bHQgc2V0dGluZyBpcyBgdW5kZWZpbmVkYFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRyb3dBY3Rpb24/OiBzdHJpbmcgPSB1bmRlZmluZWQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR0YWJsZVR5cGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR1cGRhdGFibGVQcm9wZXJ0eVBhdGg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dXNlQmFzaWNTZWFyY2g/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHNlYXJjaGFibGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBPTkxZIEZPUiBHUklEIFRBQkxFOiBOdW1iZXIgb2YgaW5kaWNlcyB3aGljaCBjYW4gYmUgc2VsZWN0ZWQgaW4gYSByYW5nZS4gSWYgc2V0IHRvIDAsIHRoZSBzZWxlY3Rpb24gbGltaXQgaXMgZGlzYWJsZWQsIGFuZCB0aGUgU2VsZWN0IEFsbCBjaGVja2JveCBhcHBlYXJzIGluc3RlYWQgb2YgdGhlIERlc2VsZWN0IEFsbCBidXR0b24uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm51bWJlclwiIH0pXG5cdHNlbGVjdGlvbkxpbWl0PzogbnVtYmVyO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c2hvd0NyZWF0ZT86IHN0cmluZyB8IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dGFibGVEZWZpbml0aW9uITogVGFibGVWaXN1YWxpemF0aW9uOyAvLyBXZSByZXF1aXJlIHRhYmxlRGVmaW5pdGlvbiB0byBiZSB0aGVyZSBldmVuIHRob3VnaCBpdCBpcyBub3QgZm9ybWFsbHkgcmVxdWlyZWRcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0dGFibGVEZWZpbml0aW9uQ29udGV4dD86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR0YWJsZURlbGVnYXRlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGFiVGl0bGU6IHN0cmluZyA9IFwiXCI7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dmlzaWJsZT86IGJvb2xlYW47XG5cblx0QGJsb2NrQWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC50YWJsZS5BY3Rpb24gfCBzYXAuZmUubWFjcm9zLmludGVybmFsLnRhYmxlLkFjdGlvbkdyb3VwXCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0cHJvY2Vzc0FnZ3JlZ2F0aW9uczogc2V0Q3VzdG9tQWN0aW9uUHJvcGVydGllc1xuXHR9KVxuXHRhY3Rpb25zPzogQWN0aW9uT3JBY3Rpb25Hcm91cDtcblxuXHRAYmxvY2tBZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLnRhYmxlLkNvbHVtblwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdGhhc1ZpcnR1YWxOb2RlOiB0cnVlLFxuXHRcdHByb2Nlc3NBZ2dyZWdhdGlvbnM6IHNldEN1c3RvbUNvbHVtblByb3BlcnRpZXNcblx0fSlcblx0Y29sdW1ucz86IFJlY29yZDxzdHJpbmcsIENvbHVtbj47XG5cblx0Y29udmVydGVkTWV0YURhdGE6IENvbnZlcnRlZE1ldGFkYXRhO1xuXG5cdGNvbnRleHRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoO1xuXG5cdHBhZ2VUZW1wbGF0ZVR5cGU6IFRlbXBsYXRlVHlwZTtcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB3aGVuIHRoZSB1c2VyIGNob29zZXMgYSByb3dcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0cm93UHJlc3M/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGNvbnRleHRDaGFuZ2UgZXZlbnQgb2YgdGhlIHRhYmxlLlxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNvbnRleHRDaGFuZ2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqICBFdmVudCBoYW5kbGVyIGZvciBjaGFuZ2UgZXZlbnQuXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdG9uQ2hhbmdlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNob29zZXMgYW4gb3B0aW9uIG9mIHRoZSBzZWdtZW50ZWQgYnV0dG9uIGluIHRoZSBBTFAgVmlld1xuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrRXZlbnQoKVxuXHR2YXJpYW50U2F2ZWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIHN0YXRlQ2hhbmdlIGV2ZW50IG9mIHRoZSB0YWJsZS5cblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0c3RhdGVDaGFuZ2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3Qgd2hlbiB0aGUgdGFibGUgc2VsZWN0aW9uIGNoYW5nZXNcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0c2VsZWN0aW9uQ2hhbmdlPzogc3RyaW5nO1xuXG5cdEBibG9ja0V2ZW50KClcblx0dmFyaWFudFNlbGVjdGVkPzogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8VGFibGVCbG9jaz4sIGNvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIHNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0Y29uc3QgY29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCBhcyBDb250ZXh0KTtcblx0XHR0aGlzLmNvbnRleHRPYmplY3RQYXRoID0gY29udGV4dE9iamVjdFBhdGg7XG5cdFx0Y29uc3QgcGFnZUNvbnRleHQgPSBzZXR0aW5ncy5iaW5kaW5nQ29udGV4dHMuY29udmVydGVyQ29udGV4dDtcblx0XHR0aGlzLnBhZ2VUZW1wbGF0ZVR5cGUgPSBwYWdlQ29udGV4dD8uZ2V0T2JqZWN0KFwiL3RlbXBsYXRlVHlwZVwiKTtcblxuXHRcdGNvbnN0IHRhYmxlRGVmaW5pdGlvbiA9IFRhYmxlQmxvY2suc2V0VXBUYWJsZURlZmluaXRpb24odGhpcywgc2V0dGluZ3MpO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQodGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbik7XG5cdFx0dGhpcy5jb252ZXJ0ZWRNZXRhRGF0YSA9IHRoaXMuY29udGV4dE9iamVjdFBhdGguY29udmVydGVkVHlwZXM7XG5cdFx0dGhpcy5jb2xsZWN0aW9uRW50aXR5ID0gdGhpcy5jb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aCh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24pLnRhcmdldCBhcyBFbnRpdHlTZXQ7XG5cblx0XHR0aGlzLnNldFVwSWQoKTtcblxuXHRcdHRoaXMuc2VsZWN0aW9uTW9kZSA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc2VsZWN0aW9uTW9kZTtcblx0XHR0aGlzLmVuYWJsZUZ1bGxTY3JlZW4gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUZ1bGxTY3JlZW47XG5cdFx0dGhpcy5lbmFibGVFeHBvcnQgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUV4cG9ydDtcblx0XHR0aGlzLmVuYWJsZVBhc3RlID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5wYXN0ZS5lbmFibGVkO1xuXHRcdHRoaXMudXBkYXRhYmxlUHJvcGVydHlQYXRoID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMudXBkYXRhYmxlUHJvcGVydHlQYXRoO1xuXHRcdHRoaXMudHlwZSA9IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wudHlwZTtcblx0XHR0aGlzLmRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YTtcblx0XHR0aGlzLmN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb247XG5cdFx0dGhpcy5oZWFkZXJWaXNpYmxlID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmhlYWRlclZpc2libGU7XG5cdFx0dGhpcy5zZWFyY2hhYmxlID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNlYXJjaGFibGU7XG5cdFx0dGhpcy5pbmxpbmVDcmVhdGlvblJvd0NvdW50ID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmlubGluZUNyZWF0aW9uUm93Q291bnQ7XG5cdFx0dGhpcy5oZWFkZXIgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24udGl0bGU7XG5cdFx0dGhpcy5zZWxlY3Rpb25MaW1pdCA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5zZWxlY3Rpb25MaW1pdDtcblx0XHR0aGlzLmlzQ29tcGFjdFR5cGUgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuaXNDb21wYWN0VHlwZTtcblx0XHR0aGlzLmNyZWF0aW9uTW9kZSA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUubW9kZTtcblx0XHR0aGlzLmNyZWF0ZUF0RW5kID8/PSAodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUgYXMgQ3JlYXRlQmVoYXZpb3IpLmFwcGVuZDtcblx0XHR0aGlzLmNyZWF0ZU91dGJvdW5kID8/PSAodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUgYXMgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbCkub3V0Ym91bmQ7XG5cdFx0dGhpcy5jcmVhdGVOZXdBY3Rpb24gPz89ICh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZSBhcyBDcmVhdGVCZWhhdmlvcikubmV3QWN0aW9uO1xuXHRcdHRoaXMuY3JlYXRlT3V0Ym91bmREZXRhaWwgPz89ICh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZSBhcyBDcmVhdGVCZWhhdmlvckV4dGVybmFsKS5vdXRib3VuZERldGFpbDtcblxuXHRcdHRoaXMucGVyc29uYWxpemF0aW9uID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnAxM25Nb2RlO1xuXHRcdHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24udmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0dGhpcy5lbmFibGVBdXRvQ29sdW1uV2lkdGggPz89IHRydWU7XG5cdFx0dGhpcy5kYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyO1xuXHRcdHRoaXMuaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSA/Pz0gQ29tbW9uVXRpbHMuaXNTbWFsbERldmljZSgpO1xuXHRcdHRoaXMubmF2aWdhdGlvblBhdGggPSB0YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5uYXZpZ2F0aW9uUGF0aDtcblx0XHRpZiAodGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbi5zdGFydHNXaXRoKFwiL1wiKSAmJiBpc1NpbmdsZXRvbihjb250ZXh0T2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCkpIHtcblx0XHRcdHRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24gPSB0aGlzLm5hdmlnYXRpb25QYXRoO1xuXHRcdH1cblx0XHR0aGlzLmNvbnZlcnRlZE1ldGFEYXRhID0gdGhpcy5jb250ZXh0T2JqZWN0UGF0aC5jb252ZXJ0ZWRUeXBlcztcblx0XHR0aGlzLnNldFJlYWRPbmx5KCk7XG5cdFx0aWYgKHRoaXMucm93UHJlc3MpIHtcblx0XHRcdHRoaXMucm93QWN0aW9uID0gXCJOYXZpZ2F0aW9uXCI7XG5cdFx0fVxuXHRcdHRoaXMucm93UHJlc3MgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93Py5wcmVzcztcblx0XHR0aGlzLnJvd0FjdGlvbiA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5yb3c/LmFjdGlvbjtcblxuXHRcdGlmICh0aGlzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHR0aGlzLnBlcnNvbmFsaXphdGlvbiA9IHVuZGVmaW5lZDtcblx0XHR9IGVsc2UgaWYgKHRoaXMucGVyc29uYWxpemF0aW9uID09PSBcInRydWVcIikge1xuXHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSBcIlNvcnQsQ29sdW1uLEZpbHRlclwiO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAodGhpcy5wZXJzb25hbGl6YXRpb24pIHtcblx0XHRcdGNhc2UgXCJmYWxzZVwiOlxuXHRcdFx0XHR0aGlzLnBlcnNvbmFsaXphdGlvbiA9IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidHJ1ZVwiOlxuXHRcdFx0XHR0aGlzLnBlcnNvbmFsaXphdGlvbiA9IFwiU29ydCxDb2x1bW4sRmlsdGVyXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHR9XG5cblx0XHRpZiAodGhpcy5pc1NlYXJjaGFibGUgPT09IGZhbHNlKSB7XG5cdFx0XHR0aGlzLnNlYXJjaGFibGUgPSBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZWFyY2hhYmxlID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zZWFyY2hhYmxlO1xuXHRcdH1cblxuXHRcdGxldCB1c2VCYXNpY1NlYXJjaCA9IGZhbHNlO1xuXG5cdFx0Ly8gTm90ZSBmb3IgdGhlICdmaWx0ZXJCYXInIHByb3BlcnR5OlxuXHRcdC8vIDEuIElEIHJlbGF0aXZlIHRvIHRoZSB2aWV3IG9mIHRoZSBUYWJsZS5cblx0XHQvLyAyLiBBYnNvbHV0ZSBJRC5cblx0XHQvLyAzLiBJRCB3b3VsZCBiZSBjb25zaWRlcmVkIGluIGFzc29jaWF0aW9uIHRvIFRhYmxlQVBJJ3MgSUQuXG5cdFx0aWYgKCF0aGlzLmZpbHRlckJhciAmJiAhdGhpcy5maWx0ZXJCYXJJZCAmJiB0aGlzLnNlYXJjaGFibGUpIHtcblx0XHRcdC8vIGZpbHRlckJhcjogUHVibGljIHByb3BlcnR5IGZvciBidWlsZGluZyBibG9ja3Ncblx0XHRcdC8vIGZpbHRlckJhcklkOiBPbmx5IHVzZWQgYXMgSW50ZXJuYWwgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgRkUgdGVtcGxhdGVzXG5cdFx0XHR0aGlzLmZpbHRlckJhcklkID0gZ2VuZXJhdGUoW3RoaXMuaWQsIFwiU3RhbmRhcmRBY3Rpb25cIiwgXCJCYXNpY1NlYXJjaFwiXSk7XG5cdFx0XHR1c2VCYXNpY1NlYXJjaCA9IHRydWU7XG5cdFx0fVxuXHRcdC8vIEludGVybmFsIHByb3BlcnRpZXNcblx0XHR0aGlzLnVzZUJhc2ljU2VhcmNoID0gdXNlQmFzaWNTZWFyY2g7XG5cdFx0dGhpcy50YWJsZVR5cGUgPSB0aGlzLnR5cGU7XG5cdFx0dGhpcy5zaG93Q3JlYXRlID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5jcmVhdGUudmlzaWJsZSB8fCB0cnVlO1xuXHRcdHRoaXMuYXV0b0JpbmRPbkluaXQgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmF1dG9CaW5kT25Jbml0O1xuXG5cdFx0c3dpdGNoICh0aGlzLnJlYWRPbmx5KSB7XG5cdFx0XHRjYXNlIHRydWU6XG5cdFx0XHRcdHRoaXMuY29sdW1uRWRpdE1vZGUgPSBcIkRpc3BsYXlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGZhbHNlOlxuXHRcdFx0XHR0aGlzLmNvbHVtbkVkaXRNb2RlID0gXCJFZGl0YWJsZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMuY29sdW1uRWRpdE1vZGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFubm90YXRpb24gcGF0aCBwb2ludGluZyB0byB0aGUgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uIChMaW5lSXRlbSkuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0T2JqZWN0UGF0aCBUaGUgZGF0YW1vZGVsIG9iamVjdCBwYXRoIGZvciB0aGUgdGFibGVcblx0ICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSBhbm5vdGF0aW9uIHBhdGhcblx0ICovXG5cdHN0YXRpYyBnZXRWaXN1YWxpemF0aW9uUGF0aChjb250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbWV0YVBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGNvbnRleHRPYmplY3RQYXRoKSBhcyBzdHJpbmc7XG5cblx0XHQvLyBmYWxsYmFjayB0byBkZWZhdWx0IExpbmVJdGVtIGlmIG1ldGFwYXRoIGlzIG5vdCBzZXRcblx0XHRpZiAoIW1ldGFQYXRoKSB7XG5cdFx0XHRMb2cuZXJyb3IoYE1pc3NpbmcgbWV0YSBwYXRoIHBhcmFtZXRlciBmb3IgTGluZUl0ZW1gKTtcblx0XHRcdHJldHVybiBgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YDtcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtKSB7XG5cdFx0XHRyZXR1cm4gbWV0YVBhdGg7IC8vIE1ldGFQYXRoIGlzIGFscmVhZHkgcG9pbnRpbmcgdG8gYSBMaW5lSXRlbVxuXHRcdH1cblx0XHQvL05lZWQgdG8gc3dpdGNoIHRvIHRoZSBjb250ZXh0IHJlbGF0ZWQgdGhlIFBWIG9yIFNQVlxuXHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihtZXRhUGF0aCk7XG5cblx0XHRsZXQgdmlzdWFsaXphdGlvbnM6IFZpc3VhbGl6YXRpb25BbmRQYXRoW10gPSBbXTtcblx0XHRzd2l0Y2ggKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QuUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb25zID0gZ2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudChcblx0XHRcdFx0XHRcdGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC5QcmVzZW50YXRpb25WYXJpYW50LFxuXHRcdFx0XHRcdFx0bWV0YVBhdGgsXG5cdFx0XHRcdFx0XHRyZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdCxcblx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRyZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdExvZy5lcnJvcihgQmFkIG1ldGFwYXRoIHBhcmFtZXRlciBmb3IgdGFibGUgOiAke2NvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtfWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxpbmVJdGVtVml6ID0gdmlzdWFsaXphdGlvbnMuZmluZCgodml6KSA9PiB7XG5cdFx0XHRyZXR1cm4gdml6LnZpc3VhbGl6YXRpb24udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW07XG5cdFx0fSk7XG5cblx0XHRpZiAobGluZUl0ZW1WaXopIHtcblx0XHRcdHJldHVybiBsaW5lSXRlbVZpei5hbm5vdGF0aW9uUGF0aDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZmFsbGJhY2sgdG8gZGVmYXVsdCBMaW5lSXRlbSBpZiBhbm5vdGF0aW9uIG1pc3NpbmcgaW4gUFZcblx0XHRcdExvZy5lcnJvcihgQmFkIG1ldGEgcGF0aCBwYXJhbWV0ZXIgZm9yIExpbmVJdGVtOiAke2NvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtfWApO1xuXHRcdFx0cmV0dXJuIGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gOyAvLyBGYWxsYmFja1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBnZXRQcmVzZW50YXRpb25QYXRoKGNvbnRleHRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgcHJlc2VudGF0aW9uUGF0aDtcblxuXHRcdHN3aXRjaCAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py50ZXJtKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHByZXNlbnRhdGlvblBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGNvbnRleHRPYmplY3RQYXRoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHByZXNlbnRhdGlvblBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGNvbnRleHRPYmplY3RQYXRoKSArIFwiL1ByZXNlbnRhdGlvblZhcmlhbnRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByZXNlbnRhdGlvblBhdGg7XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBUYWJsZURlZmluaXRpb24odGFibGU6IFRhYmxlQmxvY2ssIHNldHRpbmdzOiBhbnkpOiBUYWJsZVZpc3VhbGl6YXRpb24ge1xuXHRcdGxldCB0YWJsZURlZmluaXRpb24gPSB0YWJsZS50YWJsZURlZmluaXRpb247XG5cdFx0aWYgKCF0YWJsZURlZmluaXRpb24pIHtcblx0XHRcdGNvbnN0IGluaXRpYWxDb252ZXJ0ZXJDb250ZXh0ID0gdGFibGUuZ2V0Q29udmVydGVyQ29udGV4dCh0YWJsZS5jb250ZXh0T2JqZWN0UGF0aCwgdGFibGUuY29udGV4dFBhdGg/LmdldFBhdGgoKSwgc2V0dGluZ3MpO1xuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvblBhdGggPSBUYWJsZUJsb2NrLmdldFZpc3VhbGl6YXRpb25QYXRoKHRhYmxlLmNvbnRleHRPYmplY3RQYXRoLCBpbml0aWFsQ29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25QYXRoID0gVGFibGVCbG9jay5nZXRQcmVzZW50YXRpb25QYXRoKHRhYmxlLmNvbnRleHRPYmplY3RQYXRoKTtcblxuXHRcdFx0Ly9DaGVjayBpZiB3ZSBoYXZlIEFjdGlvbkdyb3VwIGFuZCBhZGQgbmVzdGVkIGFjdGlvbnNcblxuXHRcdFx0Y29uc3QgZXh0cmFQYXJhbXM6IGFueSA9IHt9O1xuXHRcdFx0Y29uc3QgdGFibGVTZXR0aW5ncyA9IHtcblx0XHRcdFx0ZW5hYmxlRXhwb3J0OiB0YWJsZS5lbmFibGVFeHBvcnQsXG5cdFx0XHRcdGVuYWJsZUZ1bGxTY3JlZW46IHRhYmxlLmVuYWJsZUZ1bGxTY3JlZW4sXG5cdFx0XHRcdGVuYWJsZVBhc3RlOiB0YWJsZS5lbmFibGVQYXN0ZSxcblx0XHRcdFx0c2VsZWN0aW9uTW9kZTogdGFibGUuc2VsZWN0aW9uTW9kZSxcblx0XHRcdFx0dHlwZTogdGFibGUudHlwZVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKHRhYmxlLmFjdGlvbnMpIHtcblx0XHRcdFx0T2JqZWN0LnZhbHVlcyh0YWJsZS5hY3Rpb25zKT8uZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdHRhYmxlLmFjdGlvbnMgPSB7IC4uLnRhYmxlLmFjdGlvbnMsIC4uLihpdGVtIGFzIEV4dGVuZGVkQWN0aW9uR3JvdXApLm1lbnVDb250ZW50QWN0aW9ucyB9O1xuXHRcdFx0XHRcdGRlbGV0ZSAoaXRlbSBhcyBFeHRlbmRlZEFjdGlvbkdyb3VwKS5tZW51Q29udGVudEFjdGlvbnM7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0YWJsZSBhY3Rpb25zIGFuZCBjb2x1bW5zIGFzIHt9IGlmIG5vdCBwcm92aWRlZCB0byBhbGxvdyBtZXJnZSB3aXRoIG1hbmlmZXN0IHNldHRpbmdzXG5cdFx0XHRleHRyYVBhcmFtc1t2aXN1YWxpemF0aW9uUGF0aF0gPSB7XG5cdFx0XHRcdGFjdGlvbnM6IHRhYmxlLmFjdGlvbnMgfHwge30sXG5cdFx0XHRcdGNvbHVtbnM6IHRhYmxlLmNvbHVtbnMgfHwge30sXG5cdFx0XHRcdHRhYmxlU2V0dGluZ3M6IHRhYmxlU2V0dGluZ3Ncblx0XHRcdH07XG5cdFx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gdGFibGUuZ2V0Q29udmVydGVyQ29udGV4dChcblx0XHRcdFx0dGFibGUuY29udGV4dE9iamVjdFBhdGgsXG5cdFx0XHRcdHRhYmxlLmNvbnRleHRQYXRoPy5nZXRQYXRoKCksXG5cdFx0XHRcdHNldHRpbmdzLFxuXHRcdFx0XHRleHRyYVBhcmFtc1xuXHRcdFx0KTtcblxuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdFx0XHR0YWJsZS51c2VDb25kZW5zZWRMYXlvdXQsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpO1xuXG5cdFx0XHR0YWJsZURlZmluaXRpb24gPSB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG5cdFx0XHR0YWJsZS50YWJsZURlZmluaXRpb24gPSB0YWJsZURlZmluaXRpb247XG5cdFx0fVxuXHRcdHRhYmxlLnRhYmxlRGVmaW5pdGlvbkNvbnRleHQgPSBNYWNyb0FQSS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0YWJsZS50YWJsZURlZmluaXRpb24gYXMgb2JqZWN0LCBzZXR0aW5ncyk7XG5cblx0XHRyZXR1cm4gdGFibGVEZWZpbml0aW9uO1xuXHR9XG5cblx0c2V0VXBJZCgpIHtcblx0XHRpZiAodGhpcy5pZCkge1xuXHRcdFx0Ly8gVGhlIGdpdmVuIElEIHNoYWxsIGJlIGFzc2lnbmVkIHRvIHRoZSBUYWJsZUFQSSBhbmQgbm90IHRvIHRoZSBNREMgVGFibGVcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuaWQgPSB0aGlzLmdldENvbnRlbnRJZCh0aGlzLmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gV2UgZ2VuZXJhdGUgdGhlIElELiBEdWUgdG8gY29tcGF0aWJpbGl0eSByZWFzb25zIHdlIGtlZXAgaXQgb24gdGhlIE1EQyBUYWJsZSBidXQgcHJvdmlkZSBhc3NpZ25cblx0XHRcdC8vIHRoZSBJRCB3aXRoIGEgOjpUYWJsZSBzdWZmaXggdG8gdGhlIFRhYmxlQVBJXG5cdFx0XHRjb25zdCB0YWJsZURlZmluaXRpb24gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbjtcblx0XHRcdHRoaXMuaWQgPz89IHRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmlkO1xuXHRcdFx0dGhpcy5fYXBpSWQgPSBnZW5lcmF0ZShbdGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uaWQsIFwiVGFibGVcIl0pO1xuXHRcdH1cblx0fVxuXG5cdHNldFJlYWRPbmx5KCkge1xuXHRcdC8vIFNwZWNpYWwgY29kZSBmb3IgcmVhZE9ubHlcblx0XHQvLyByZWFkb25seSA9IGZhbHNlIC0+IEZvcmNlIGVkaXRhYmxlXG5cdFx0Ly8gcmVhZG9ubHkgPSB0cnVlIC0+IEZvcmNlIGRpc3BsYXkgbW9kZVxuXHRcdC8vIHJlYWRvbmx5ID0gdW5kZWZpbmVkIC0+IEJvdW5kIHRvIGVkaXQgZmxvd1xuXHRcdGlmICh0aGlzLnJlYWRPbmx5ID09PSB1bmRlZmluZWQgJiYgdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5kaXNwbGF5TW9kZSA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5yZWFkT25seSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VGFibGVUeXBlID0gKCkgPT4ge1xuXHRcdGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24uZ2V0T2JqZWN0KCk7XG5cdFx0c3dpdGNoICh0aGlzLnRhYmxlVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkdyaWRUYWJsZVwiOlxuXHRcdFx0XHRyZXR1cm4geG1sYDxtZGNUYWJsZTpHcmlkVGFibGVUeXBlXG4gICAgICAgICAgICAgICAgcm93Q291bnRNb2RlPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50TW9kZX1cIlxuICAgICAgICAgICAgICAgIHJvd0NvdW50PVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50fVwiXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uTGltaXQ9XCIke3RoaXMuc2VsZWN0aW9uTGltaXR9XCJcbiAgICAgICAgICAgIC8+YDtcblx0XHRcdGNhc2UgXCJUcmVlVGFibGVcIjpcblx0XHRcdFx0cmV0dXJuIHhtbGA8bWRjVGFibGU6VHJlZVRhYmxlVHlwZVxuICAgICAgICAgICAgICAgIHJvd0NvdW50TW9kZT1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5yb3dDb3VudE1vZGV9XCJcbiAgICAgICAgICAgICAgICByb3dDb3VudD1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5yb3dDb3VudH1cIlxuICAgICAgICAgICAgLz5gO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc3QgZ3Jvd2luZ01vZGUgPSBjb2xsZWN0aW9uLiRraW5kID09PSBcIkVudGl0eVNldFwiID8gXCJTY3JvbGxcIiA6IHVuZGVmaW5lZDtcblx0XHRcdFx0cmV0dXJuIHhtbGA8bWRjVGFibGU6UmVzcG9uc2l2ZVRhYmxlVHlwZVxuICAgICAgICAgICAgICAgIHNob3dEZXRhaWxzQnV0dG9uPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgZGV0YWlsc0J1dHRvblNldHRpbmc9XCJ7PVsnTG93JywgJ01lZGl1bScsICdOb25lJ119XCJcbiAgICAgICAgICAgICAgICBncm93aW5nTW9kZT1cIiR7Z3Jvd2luZ01vZGV9XCJcbiAgICAgICAgICAgIC8+YDtcblx0XHR9XG5cdH07XG5cblx0X2dldEVudGl0eVR5cGUoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmNvbGxlY3Rpb25FbnRpdHkgYXMgRW50aXR5U2V0KT8uZW50aXR5VHlwZSB8fCAodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIE5hdmlnYXRpb25Qcm9wZXJ0eSk/LnRhcmdldFR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgZm9yIHRoZSB2YWx1ZUhlbHAgYmFzZWQgb24gdGhlIGRhdGFGaWVsZCBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0RmllbGRQYXRoIERhdEZpZWxkUGF0aCB0byBiZSBldmFsdWF0ZWRcblx0ICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlSGVscFxuXHQgKi9cblx0Z2V0VmFsdWVIZWxwVGVtcGxhdGVGcm9tUGF0aChkYXRGaWVsZFBhdGg/OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gZGF0RmllbGRQYXRoXG5cdFx0XHQ/IGA8bWFjcm9zOlZhbHVlSGVscFxuICAgICAgICBpZFByZWZpeD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiVGFibGVWYWx1ZUhlbHBcIl0pfVwiXG4gICAgICAgIHByb3BlcnR5PVwiJHtkYXRGaWVsZFBhdGh9L1ZhbHVlXCJcbiAgICAvPmBcblx0XHRcdDogXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIHN0cmluZyBmb3IgdGhlIHZhbHVlSGVscCBiYXNlZCBvbiBjb2x1bW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb2x1bW4gQ29sdW1uIHRvIGJlIGV2YWx1YXRlZFxuXHQgKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWVIZWxwXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHAoY29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4pIHtcblx0XHRjb25zdCBkYXRhRmllbGRPYmplY3QgPSB0aGlzLmNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKGNvbHVtbi5hbm5vdGF0aW9uUGF0aCkudGFyZ2V0IGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0aWYgKGlzRGF0YUZpZWxkRm9yQW5ub3RhdGlvbihkYXRhRmllbGRPYmplY3QpICYmIGRhdGFGaWVsZE9iamVjdC5UYXJnZXQuJHRhcmdldC50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydCkge1xuXHRcdFx0cmV0dXJuIGBgO1xuXHRcdH0gZWxzZSBpZiAoaXNEYXRhRmllbGRGb3JBbm5vdGF0aW9uKGRhdGFGaWVsZE9iamVjdCkgJiYgZGF0YUZpZWxkT2JqZWN0LlRhcmdldC4kdGFyZ2V0LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXApIHtcblx0XHRcdGxldCB0ZW1wbGF0ZSA9IGBgO1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBkYXRhRmllbGRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuRGF0YSkge1xuXHRcdFx0XHR0ZW1wbGF0ZSArPSB0aGlzLmdldFZhbHVlSGVscFRlbXBsYXRlRnJvbVBhdGgoY29sdW1uLmFubm90YXRpb25QYXRoICsgXCIvVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhL1wiICsgaW5kZXgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHhtbGAke3RlbXBsYXRlfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgJHt0aGlzLmdldFZhbHVlSGVscFRlbXBsYXRlRnJvbVBhdGgoY29sdW1uLmFubm90YXRpb25QYXRoKX1gO1xuXHRcdH1cblx0fVxuXG5cdGdldERlcGVuZGVudHMgPSAoKSA9PiB7XG5cdFx0bGV0IGRlcGVuZGVudHMgPSBgYDtcblx0XHRpZiAoIXRoaXMucmVhZE9ubHkgJiYgdGhpcy50YWJsZURlZmluaXRpb24/LmNvbHVtbnMpIHtcblx0XHRcdGZvciAoY29uc3QgY29sdW1uIG9mIHRoaXMudGFibGVEZWZpbml0aW9uLmNvbHVtbnMpIHtcblx0XHRcdFx0aWYgKGNvbHVtbi5hdmFpbGFiaWxpdHkgPT09IFwiRGVmYXVsdFwiICYmIFwiYW5ub3RhdGlvblBhdGhcIiBpbiBjb2x1bW4pIHtcblx0XHRcdFx0XHRkZXBlbmRlbnRzICs9IHRoaXMuZ2V0VmFsdWVIZWxwKGNvbHVtbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgc3RhbmRhcmRBY3Rpb25zID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucztcblxuXHRcdGlmICh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnN0YW5kYXJkQWN0aW9ucy5pc0luc2VydFVwZGF0ZVRlbXBsYXRlZCAmJiBzdGFuZGFyZEFjdGlvbnMuY3JlYXRlLmlzVGVtcGxhdGVkID09PSBcInRydWVcIikge1xuXHRcdFx0ZGVwZW5kZW50cyArPSB4bWxgPGNvbnRyb2w6Q29tbWFuZEV4ZWN1dGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlPVwiJHtUYWJsZUhlbHBlci5wcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uKHRoaXMsIHRydWUpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU9XCIke3N0YW5kYXJkQWN0aW9ucy5jcmVhdGUudmlzaWJsZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkPVwiJHtzdGFuZGFyZEFjdGlvbnMuY3JlYXRlLmVuYWJsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZD1cIkNyZWF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5gO1xuXHRcdH1cblx0XHRpZiAoc3RhbmRhcmRBY3Rpb25zLmRlbGV0ZS5pc1RlbXBsYXRlZCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdGNvbnN0IGhlYWRlckluZm8gPSAoXG5cdFx0XHRcdCh0aGlzLmNvbGxlY3Rpb25FbnRpdHkgYXMgRW50aXR5U2V0KT8uZW50aXR5VHlwZSB8fCAodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIE5hdmlnYXRpb25Qcm9wZXJ0eSk/LnRhcmdldFR5cGVcblx0XHRcdCk/LmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbztcblx0XHRcdGRlcGVuZGVudHMgKz0geG1sYDxjb250cm9sOkNvbW1hbmRFeGVjdXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGU9XCIke1RhYmxlSGVscGVyLnByZXNzRXZlbnRGb3JEZWxldGVCdXR0b24oXG5cdFx0XHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbkVudGl0eSEubmFtZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVySW5mbyxcblx0XHRcdFx0XHRcdFx0dGhpcy5jb250ZXh0T2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZT1cIiR7c3RhbmRhcmRBY3Rpb25zLmRlbGV0ZS52aXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkPVwiJHtzdGFuZGFyZEFjdGlvbnMuZGVsZXRlLmVuYWJsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ9XCJEZWxldGVFbnRyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPmA7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBhY3Rpb25OYW1lIGluIHRoaXMudGFibGVEZWZpbml0aW9uLmNvbW1hbmRBY3Rpb25zKSB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb21tYW5kQWN0aW9uc1thY3Rpb25OYW1lXTtcblx0XHRcdGRlcGVuZGVudHMgKz0gYCR7dGhpcy5nZXRBY3Rpb25Db21tYW5kKGFjdGlvbk5hbWUsIGFjdGlvbil9YDtcblx0XHR9XG5cdFx0ZGVwZW5kZW50cyArPSBgPGNvbnRyb2w6Q29tbWFuZEV4ZWN1dGlvbiBleGVjdXRlPVwiVGFibGVSdW50aW1lLmRpc3BsYXlUYWJsZVNldHRpbmdzXCIgY29tbWFuZD1cIlRhYmxlU2V0dGluZ3NcIiAvPmA7XG5cdFx0aWYgKHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPT09IFwiTm9uZVwiKSB7XG5cdFx0XHRkZXBlbmRlbnRzICs9IGA8IS0tIFBlcnNpc3RlbmNlIHByb3ZpZGVyIG9mZmVycyBwZXJzaXN0aW5nIHBlcnNvbmFsaXphdGlvbiBjaGFuZ2VzIHdpdGhvdXQgdmFyaWFudCBtYW5hZ2VtZW50IC0tPlxuXHRcdFx0PHAxM246UGVyc2lzdGVuY2VQcm92aWRlciBpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiUGVyc2lzdGVuY2VQcm92aWRlclwiXSl9XCIgZm9yPVwiJHt0aGlzLmlkfVwiIC8+YDtcblx0XHR9XG5cblx0XHRyZXR1cm4geG1sYCR7ZGVwZW5kZW50c31gO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIHN0cmluZyBmb3IgdGhlIGFjdGlvbkNvbW1hbmQuXG5cdCAqXG5cdCAqIEBwYXJhbSBhY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGFjdGlvbiBBY3Rpb24gdG8gYmUgZXZhbHVhdGVkXG5cdCAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY3Rpb25Db21tYW5kXG5cdCAqL1xuXHRnZXRBY3Rpb25Db21tYW5kKGFjdGlvbk5hbWU6IHN0cmluZywgYWN0aW9uOiBDdXN0b21BY3Rpb24pIHtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBhY3Rpb24uYW5ub3RhdGlvblBhdGhcblx0XHRcdD8gKHRoaXMuY29udmVydGVkTWV0YURhdGEucmVzb2x2ZVBhdGgoYWN0aW9uLmFubm90YXRpb25QYXRoKS50YXJnZXQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgYWN0aW9uQ29udGV4dCA9IGFjdGlvbi5hbm5vdGF0aW9uUGF0aFxuXHRcdFx0PyBDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dCh0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoICsgXCIvQWN0aW9uXCIpISlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGlzQm91bmQgPSBkYXRhRmllbGQ/LkFjdGlvblRhcmdldD8uaXNCb3VuZDtcblx0XHRjb25zdCBpc09wZXJhdGlvbkF2YWlsYWJsZSA9IGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlPy52YWx1ZU9mKCkgIT09IGZhbHNlO1xuXHRcdGNvbnN0IGRpc3BsYXlDb21tYW5kQWN0aW9uID0gYWN0aW9uLnR5cGUgPT09IFwiRm9yQWN0aW9uXCIgPyBpc0JvdW5kICE9PSB0cnVlIHx8IGlzT3BlcmF0aW9uQXZhaWxhYmxlIDogdHJ1ZTtcblx0XHRpZiAoZGlzcGxheUNvbW1hbmRBY3Rpb24pIHtcblx0XHRcdHJldHVybiB4bWxgPGludGVybmFsTWFjcm86QWN0aW9uQ29tbWFuZFxuXHRcdFx0XHRcdFx0XHRhY3Rpb249XCJ7dGFibGVEZWZpbml0aW9uPmNvbW1hbmRBY3Rpb25zLyR7YWN0aW9uTmFtZX19XCJcblx0XHRcdFx0XHRcdFx0b25FeGVjdXRlQWN0aW9uPVwiJHtUYWJsZUhlbHBlci5wcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbkVudGl0eSEubmFtZSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRhYmxlRGVmaW5pdGlvbi5vcGVyYXRpb25BdmFpbGFibGVNYXAsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZUF1dG9TY3JvbGwsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHRcdFx0XHQpfVwiXG5cdFx0XHRcdFx0XHRcdG9uRXhlY3V0ZUlCTj1cIiR7Q29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihcblx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRcdFx0XCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9XCIsXG5cdFx0XHRcdFx0XHRcdFx0IXRoaXMudGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljc1xuXHRcdFx0XHRcdFx0XHQpfVwiXG5cdFx0XHRcdFx0XHRcdG9uRXhlY3V0ZU1hbmlmZXN0PVwiJHthY3Rpb24ubm9XcmFwID8gYWN0aW9uLnByZXNzIDogQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihhY3Rpb24sIHRoaXMpfVwiXG5cdFx0XHRcdFx0XHRcdGlzSUJORW5hYmxlZD1cIiR7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZWQgPz9cblx0XHRcdFx0XHRcdFx0XHRUYWJsZUhlbHBlci5pc0RhdGFGaWVsZEZvcklCTkVuYWJsZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLFxuXHRcdFx0XHRcdFx0XHRcdFx0ISEoZGF0YUZpZWxkIGFzIGFueSkuUmVxdWlyZXNDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0KGRhdGFGaWVsZCBhcyBhbnkpLk5hdmlnYXRpb25BdmFpbGFibGU/LnZhbHVlT2YoKVxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0fVwiXG5cdFx0XHRcdFx0XHRcdGlzQWN0aW9uRW5hYmxlZD1cIiR7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZWQgPz9cblx0XHRcdFx0XHRcdFx0XHRUYWJsZUhlbHBlci5pc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQodGhpcywgZGF0YUZpZWxkLCAhIWlzQm91bmQsIGFjdGlvbkNvbnRleHQsIGFjdGlvbi5lbmFibGVPblNlbGVjdClcblx0XHRcdFx0XHRcdFx0fVwiXG5cdFx0XHRcdFx0XHRcdC8+YDtcblx0XHR9XG5cdFx0cmV0dXJuIGBgO1xuXHR9XG5cdGdldEFjdGlvbnMgPSAoKSA9PiB7XG5cdFx0bGV0IGRlcGVuZGVudHMgPSBcIlwiO1xuXHRcdGlmICh0aGlzLm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCkge1xuXHRcdFx0ZGVwZW5kZW50cyA9IGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvblxuICAgICAgICAgICAgbGF5b3V0SW5mb3JtYXRpb249XCJ7XG4gICAgICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uTmFtZTogJ2VuZCcsXG4gICAgICAgICAgICAgICAgICAgIGFsaWdubWVudDogJ0VuZCdcbiAgICAgICAgICAgICAgICB9XCJcbiAgICAgICAgICAgIHZpc2libGU9XCJ7PSBcXCR7cGFnZUludGVybmFsPmFscENvbnRlbnRWaWV3fSA9PT0gJ1RhYmxlJyB9XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPFNlZ21lbnRlZEJ1dHRvblxuICAgICAgICAgICAgICAgIGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJTZWdtZW50ZWRCdXR0b25cIiwgXCJUZW1wbGF0ZUNvbnRlbnRWaWV3XCJdKX1cIlxuICAgICAgICAgICAgICAgIHNlbGVjdD1cIiR7dGhpcy5vblNlZ21lbnRlZEJ1dHRvblByZXNzZWR9XCJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEtleT1cIntwYWdlSW50ZXJuYWw+YWxwQ29udGVudFZpZXd9XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aXRlbXM+YDtcblxuXHRcdFx0aWYgKENvbW1vbkhlbHBlci5pc0Rlc2t0b3AoKSkge1xuXHRcdFx0XHRkZXBlbmRlbnRzICs9IGA8U2VnbWVudGVkQnV0dG9uSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fSFlCUklEX1NFR01FTlRFRF9CVVRUT05fSVRFTV9UT09MVElQfVwiXG5cdFx0XHRcdFx0XHRcdGtleSA9IFwiSHlicmlkXCJcblx0XHRcdFx0XHRcdFx0aWNvbiA9IFwic2FwLWljb246Ly9jaGFydC10YWJsZS12aWV3XCJcblx0XHRcdFx0XHRcdFx0Lz5gO1xuXHRcdFx0fVxuXHRcdFx0ZGVwZW5kZW50cyArPSBgPFNlZ21lbnRlZEJ1dHRvbkl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fQ0hBUlRfU0VHTUVOVEVEX0JVVFRPTl9JVEVNX1RPT0xUSVB9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIkNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb249XCJzYXAtaWNvbjovL2Jhci1jaGFydFwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxTZWdtZW50ZWRCdXR0b25JdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwPVwie3NhcC5mZS5pMThuPk1fQ09NTU9OX1RBQkxFX1NFR01FTlRFRF9CVVRUT05fSVRFTV9UT09MVElQfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJUYWJsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPVwic2FwLWljb246Ly90YWJsZS12aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2l0ZW1zPlxuICAgICAgICAgICAgPC9TZWdtZW50ZWRCdXR0b24+XG4gICAgICAgIDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH1cblx0XHRkZXBlbmRlbnRzICs9IGA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLnRhYmxlLkFjdGlvbnNcIiB0eXBlPVwiWE1MXCIgLz5gO1xuXHRcdHJldHVybiB4bWxgJHtkZXBlbmRlbnRzfWA7XG5cdH07XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgc3RyaW5nIGZvciB0aGUgQ3JlYXRpb25Sb3cuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDcmVhdGlvblJvd1xuXHQgKi9cblx0Z2V0Q3JlYXRpb25Sb3coKSB7XG5cdFx0aWYgKHRoaXMuY3JlYXRpb25Nb2RlID09PSBcIkNyZWF0aW9uUm93XCIpIHtcblx0XHRcdGNvbnN0IGNyZWF0aW9uUm93QWN0aW9uID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5jcmVhdGlvblJvdztcblx0XHRcdGlmIChjcmVhdGlvblJvd0FjdGlvbi5pc1RlbXBsYXRlZCkge1xuXHRcdFx0XHRyZXR1cm4geG1sYDxtZGM6Y3JlYXRpb25Sb3c+XG5cdFx0XHRcdFx0XHRcdDxtZGNUYWJsZTpDcmVhdGlvblJvd1xuXHRcdFx0XHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJDcmVhdGlvblJvd1wiXSl9XCJcblx0XHRcdFx0XHRcdFx0XHR2aXNpYmxlPVwiJHtjcmVhdGlvblJvd0FjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHRcdFx0XHRcdFx0YXBwbHk9XCIke1RhYmxlSGVscGVyLnByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b24odGhpcywgZmFsc2UpfVwiXG5cdFx0XHRcdFx0XHRcdFx0YXBwbHlFbmFibGVkPVwiJHtjcmVhdGlvblJvd0FjdGlvbi5lbmFibGVkfVwiXG5cdFx0XHRcdFx0XHRcdFx0bWFjcm9kYXRhOmRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGE9XCIke3RoaXMuZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YX1cIlxuXHRcdFx0XHRcdFx0XHRcdG1hY3JvZGF0YTpjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb249XCIke3RoaXMuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9ufVwiXG5cdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0ICAgXHQgICA8L21kYzpjcmVhdGlvblJvdz5gO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdGdldFJvd1NldHRpbmcoKSB7XG5cdFx0bGV0IHJvd1NldHRpbmdzVGVtcGxhdGUgPSBgPG1kY1RhYmxlOlJvd1NldHRpbmdzXG4gICAgICAgIG5hdmlnYXRlZD1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5yb3c/LnJvd05hdmlnYXRlZH1cIlxuICAgICAgICBoaWdobGlnaHQ9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93Py5yb3dIaWdobGlnaHRpbmd9XCJcbiAgICAgICAgPmA7XG5cdFx0aWYgKHRoaXMucm93QWN0aW9uID09PSBcIk5hdmlnYXRpb25cIikge1xuXHRcdFx0cm93U2V0dGluZ3NUZW1wbGF0ZSArPSBgPG1kY1RhYmxlOnJvd0FjdGlvbnM+XG4gICAgICAgICAgICAgICAgPG1kY1RhYmxlOlJvd0FjdGlvbkl0ZW1cbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IFwiJHt0aGlzLnJvd0FjdGlvbn1cIlxuICAgICAgICAgICAgICAgICAgICBwcmVzcyA9IFwiJHt0aGlzLnRhYmxlVHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIiA/IFwiXCIgOiB0aGlzLnJvd1ByZXNzfVwiXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGUgPSBcIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5yb3c/LnZpc2libGV9XCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L21kY1RhYmxlOnJvd0FjdGlvbnM+YDtcblx0XHR9XG5cdFx0cm93U2V0dGluZ3NUZW1wbGF0ZSArPSBgPC9tZGNUYWJsZTpSb3dTZXR0aW5ncz5gO1xuXHRcdHJldHVybiB4bWxgJHtyb3dTZXR0aW5nc1RlbXBsYXRlfWA7XG5cdH1cblxuXHRnZXRWYXJpYW50TWFuYWdlbWVudCgpIHtcblx0XHRpZiAodGhpcy52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpIHtcblx0XHRcdHJldHVybiB4bWxgPG1kYzp2YXJpYW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHZhcmlhbnQ6VmFyaWFudE1hbmFnZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiVk1cIl0pfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yPVwie3RoaXM+aWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93U2V0QXNEZWZhdWx0PVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0PVwie3RoaXM+dmFyaWFudFNlbGVjdGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTGV2ZWw9XCIke3RoaXMuaGVhZGVyTGV2ZWx9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlPVwiJHt0aGlzLnZhcmlhbnRTYXZlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9tZGM6dmFyaWFudD5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdGdldFF1aWNrRmlsdGVyKCkge1xuXHRcdGlmICh0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmZpbHRlcnM/LnF1aWNrRmlsdGVycykge1xuXHRcdFx0Y29uc3QgcXVpY2tGaWx0ZXJzID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5maWx0ZXJzLnF1aWNrRmlsdGVycztcblx0XHRcdHJldHVybiB4bWxgPHRlbXBsYXRlOndpdGggcGF0aD1cInRhYmxlRGVmaW5pdGlvbj5jb250cm9sL2ZpbHRlcnMvcXVpY2tGaWx0ZXJzXCIgdmFyPVwicXVpY2tGaWx0ZXJzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bWRjOnF1aWNrRmlsdGVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtYWNyb1RhYmxlOlF1aWNrRmlsdGVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJRdWlja0ZpbHRlckNvbnRhaW5lclwiXSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5U2V0PVwiJHtDb21tb25IZWxwZXIuZ2V0Q29udGV4dFBhdGgobnVsbCwgeyBjb250ZXh0OiB0aGlzLmNvbGxlY3Rpb24gfSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RW50aXR5VHlwZT1cIntjb250ZXh0UGF0aD4kVHlwZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93Q291bnRzPVwiJHtxdWlja0ZpbHRlcnMuc2hvd0NvdW50cyA9PT0gdHJ1ZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6ZmlsdGVycz1cIiR7VGFibGVIZWxwZXIuZm9ybWF0SGlkZGVuRmlsdGVycyh0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmZpbHRlcnM/LnF1aWNrRmlsdGVycyl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmF0Y2hHcm91cElkPVwiJGF1dG8uV29ya2Vyc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbWRjOnF1aWNrRmlsdGVyPlxuICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlOndpdGg+YDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0Z2V0RW1wdHlSb3dzRW5hYmxlZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3Ncblx0XHRcdD8gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5jcmVhdGUuZW5hYmxlZFxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBoZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUodGhpcyk7XG5cdFx0aWYgKHRoaXMucm93UHJlc3MpIHtcblx0XHRcdHRoaXMucm93QWN0aW9uID0gXCJOYXZpZ2F0aW9uXCI7XG5cdFx0fVxuXHRcdHRoaXMucm93UHJlc3MgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93Py5wcmVzcztcblx0XHRjb25zdCBjb2xsZWN0aW9uRGVsZXRhYmxlUGF0aCA9IChcblx0XHRcdCh0aGlzLmNvbGxlY3Rpb25FbnRpdHkgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LkRlbGV0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0XHQ/LkRlbGV0YWJsZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHQpPy5wYXRoO1xuXHRcdGNvbnN0IGxpbmVJdGVtID0gVGFibGVIZWxwZXIuZ2V0VWlMaW5lSXRlbU9iamVjdCh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnZlcnRlZE1ldGFEYXRhKSBhc1xuXHRcdFx0fCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25bXVxuXHRcdFx0fCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgZGVsZWdhdGUgPSBUYWJsZUhlbHBlci5nZXREZWxlZ2F0ZT8uKFxuXHRcdFx0dGhpcy50YWJsZURlZmluaXRpb24sXG5cdFx0XHQodGhpcy5pc0FscCBhcyBib29sZWFuKT8udG9TdHJpbmcoKSxcblx0XHRcdHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uZW50aXR5TmFtZVxuXHRcdCk7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uQ2hhbmdlID0gYFRhYmxlUnVudGltZS5zZXRDb250ZXh0cyhcXCR7JHNvdXJjZT4vfSwgJyR7Y29sbGVjdGlvbkRlbGV0YWJsZVBhdGh9JywgJyR7XG5cdFx0XHQodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Rcblx0XHR9JywgJyR7dGhpcy50YWJsZURlZmluaXRpb24ub3BlcmF0aW9uQXZhaWxhYmxlTWFwfScsICcke1RhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVNYXAoXG5cdFx0XHRsaW5lSXRlbVxuXHRcdCl9JywgJyR7QWN0aW9uSGVscGVyLmdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zKGxpbmVJdGVtKX0nLCAnJHt0aGlzLnVwZGF0YWJsZVByb3BlcnR5UGF0aH0nKWA7XG5cblx0XHRjb25zdCBlbnRpdHlUeXBlID0gdGhpcy5fZ2V0RW50aXR5VHlwZSgpO1xuXHRcdHJldHVybiB4bWxgXG4gICAgICAgICAgICA8bWFjcm9UYWJsZTpUYWJsZUFQSVxuICAgICAgICAgICAgICAgIHhtbG5zPVwic2FwLm1cIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuICAgICAgICAgICAgICAgIHhtbG5zOnBsdWdpbnM9XCJzYXAubS5wbHVnaW5zXCJcbiAgICAgICAgICAgICAgICB4bWxuczptZGNUYWJsZT1cInNhcC51aS5tZGMudGFibGVcIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1hY3JvVGFibGU9XCJzYXAuZmUubWFjcm9zLnRhYmxlXCJcbiAgICAgICAgICAgICAgICB4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiXG4gICAgICAgICAgICAgICAgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcbiAgICAgICAgICAgICAgICB4bWxuczpjb250cm9sPVwic2FwLmZlLmNvcmUuY29udHJvbHNcIlxuICAgICAgICAgICAgICAgIHhtbG5zOmR0PVwic2FwLnVpLmR0XCJcbiAgICAgICAgICAgICAgICB4bWxuczpmbD1cInNhcC51aS5mbFwiXG4gICAgICAgICAgICAgICAgeG1sbnM6dmFyaWFudD1cInNhcC51aS5mbC52YXJpYW50c1wiXG4gICAgICAgICAgICAgICAgeG1sbnM6cDEzbj1cInNhcC51aS5tZGMucDEzblwiXG4gICAgICAgICAgICAgICAgeG1sbnM6aW50ZXJuYWxNYWNybz1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxuICAgICAgICAgICAgICAgIHhtbG5zOnVuaXR0ZXN0PVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCJcbiAgICAgICAgICAgICAgICB4bWxuczptYWNyb2RhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcbiAgICAgICAgICAgICAgICBpZD1cIiR7dGhpcy5fYXBpSWR9XCJcbiAgICAgICAgICAgICAgICB0YWJsZURlZmluaXRpb249XCJ7X3BhZ2VNb2RlbD4ke3RoaXMudGFibGVEZWZpbml0aW9uQ29udGV4dCEuZ2V0UGF0aCgpfX1cIlxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGVGdWxseVF1YWxpZmllZE5hbWU9XCIke2VudGl0eVR5cGU/LmZ1bGx5UXVhbGlmaWVkTmFtZX1cIlxuICAgICAgICAgICAgICAgIG1ldGFQYXRoPVwiJHt0aGlzLm1ldGFQYXRoPy5nZXRQYXRoKCl9XCJcbiAgICAgICAgICAgICAgICBjb250ZXh0UGF0aD1cIiR7dGhpcy5jb250ZXh0UGF0aD8uZ2V0UGF0aCgpfVwiXG4gICAgICAgICAgICAgICAgc3RhdGVDaGFuZ2U9XCIke3RoaXMuc3RhdGVDaGFuZ2V9XCJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25DaGFuZ2U9XCIke3RoaXMuc2VsZWN0aW9uQ2hhbmdlfVwiXG4gICAgICAgICAgICAgICAgcmVhZE9ubHk9XCIke3RoaXMucmVhZE9ubHl9XCJcbiAgICAgICAgICAgICAgICBmaWx0ZXJCYXI9XCIke3RoaXMuZmlsdGVyQmFyfVwiXG4gICAgICAgICAgICAgICAgbWFjcm9kYXRhOnRhYmxlQVBJTG9jYWxJZD1cIiR7dGhpcy5fYXBpSWR9XCJcbiAgICAgICAgICAgICAgICBlbXB0eVJvd3NFbmFibGVkPVwiJHt0aGlzLmdldEVtcHR5Um93c0VuYWJsZWQoKX1cIlxuICAgICAgICAgICAgICAgIGVuYWJsZUF1dG9Db2x1bW5XaWR0aD1cIiR7dGhpcy5lbmFibGVBdXRvQ29sdW1uV2lkdGh9XCJcbiAgICAgICAgICAgICAgICBpc09wdGltaXplZEZvclNtYWxsRGV2aWNlPVwiJHt0aGlzLmlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2V9XCJcbiAgICAgICAgICAgID5cblx0XHRcdFx0PHRlbXBsYXRlOndpdGggcGF0aD1cImNvbGxlY3Rpb24+JHtDb21tb25IZWxwZXIuZ2V0VGFyZ2V0Q29sbGVjdGlvblBhdGgodGhpcy5jb2xsZWN0aW9uKX1cIiB2YXI9XCJ0YXJnZXRDb2xsZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPG1hY3JvVGFibGU6bGF5b3V0RGF0YT5cbiAgICAgICAgICAgICAgICAgICAgPEZsZXhJdGVtRGF0YSBtYXhXaWR0aD1cIjEwMCVcIiAvPlxuICAgICAgICAgICAgICAgIDwvbWFjcm9UYWJsZTpsYXlvdXREYXRhPlxuICAgICAgICAgICAgICAgIDwhLS0gbWFjcm9kYXRhIGhhcyB0byBiZSBhbiBleHByZXNzaW9uIGJpbmRpbmcgaWYgaXQgbmVlZHMgdG8gYmUgc2V0IGFzIGF0dHJpYnV0ZSB2aWEgY2hhbmdlIGhhbmRsZXIgZHVyaW5nIHRlbXBsYXRpbmcgLS0+XG4gICAgICAgICAgICAgICAgICAgIDxtZGM6VGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc9XCJ7aW50ZXJuYWw+Y29udHJvbHMvJHt0aGlzLmlkfX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdHRlc3Q6aWQ9XCJUYWJsZU1hY3JvRnJhZ21lbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY29yZTpyZXF1aXJlPVwie1RhYmxlUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVSdW50aW1lJywgQVBJOiAnc2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSSd9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsOmZsZXhpYmlsaXR5PVwie3RoaXM+Zmw6ZmxleGliaWxpdHl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRDb25kaXRpb25zPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNvcnRDb25kaXRpb25zfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cENvbmRpdGlvbnM9XCIke0NvbW1vbkhlbHBlci5zdHJpbmdpZnlPYmplY3QodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5ncm91cENvbmRpdGlvbnMgYXMgc3RyaW5nKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlQ29uZGl0aW9ucz1cIiR7Q29tbW9uSGVscGVyLnN0cmluZ2lmeU9iamVjdCh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmFnZ3JlZ2F0ZUNvbmRpdGlvbnMgYXMgc3RyaW5nKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZHQ6ZGVzaWdudGltZT1cIiR7dGhpcy52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJOb25lXCIgPyBcIm5vdC1hZGFwdGFibGVcIiA6IHVuZGVmaW5lZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmtpbmQ9XCIke3RoaXMuY29sbGVjdGlvbkVudGl0eSEuX3R5cGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpuYXZpZ2F0aW9uUGF0aD1cIiR7dGhpcy5uYXZpZ2F0aW9uUGF0aH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCIke3RoaXMuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9XCIke3RoaXMuYnVzeX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYnVzeUluZGljYXRvckRlbGF5PVwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVFeHBvcnQ9XCIke3RoaXMuZW5hYmxlRXhwb3J0fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZT1cIiR7ZGVsZWdhdGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd1ByZXNzPVwiJHt0aGlzLnJvd1ByZXNzfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9CaW5kT25Jbml0PVwiJHt0aGlzLmF1dG9CaW5kT25Jbml0ICYmICF0aGlzLmZpbHRlckJhcn1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uTW9kZT1cIiR7dGhpcy5zZWxlY3Rpb25Nb2RlIHx8IFwiTm9uZVwifVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25DaGFuZ2U9XCIke3NlbGVjdGlvbkNoYW5nZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Jvd0NvdW50PVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnNob3dSb3dDb3VudH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmF0dHIoXCJoZWFkZXJcIiwgdGhpcy5oZWFkZXIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyVmlzaWJsZT1cIiR7aGVhZGVyQmluZGluZ0V4cHJlc3Npb259XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlckxldmVsPVwiJHt0aGlzLmhlYWRlckxldmVsfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJlc2hvbGQ9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24udGhyZXNob2xkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBub0RhdGE9XCIke3RoaXMubm9EYXRhVGV4dH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcDEzbk1vZGU9XCIke3RoaXMucGVyc29uYWxpemF0aW9ufVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI9XCIke3RoaXMuZmlsdGVyQmFySWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3RlPVwiQVBJLm9uUGFzdGUoJGV2ZW50LCAkY29udHJvbGxlcilcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYmVmb3JlRXhwb3J0PVwiQVBJLm9uQmVmb3JlRXhwb3J0KCRldmVudClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wudXNlQ29uZGVuc2VkVGFibGVMYXlvdXQgPT09IHRydWUgPyBcInNhcFVpU2l6ZUNvbmRlbnNlZFwiIDogdW5kZWZpbmVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdE1vZGU9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wubXVsdGlTZWxlY3RNb2RlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93UGFzdGVCdXR0b249XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnMucGFzdGUudmlzaWJsZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlUGFzdGU9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnMucGFzdGUuZW5hYmxlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOnJvd3NCaW5kaW5nSW5mbz1cIiR7VGFibGVIZWxwZXIuZ2V0Um93c0JpbmRpbmdJbmZvKHRoaXMpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6ZW5hYmxlQW5hbHl0aWNzPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5lbmFibGVBbmFseXRpY3N9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpjcmVhdGlvbk1vZGU9XCIke3RoaXMuY3JlYXRpb25Nb2RlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6aW5saW5lQ3JlYXRpb25Sb3dDb3VudD1cIiR7dGhpcy5pbmxpbmVDcmVhdGlvblJvd0NvdW50fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6c2hvd0NyZWF0ZT1cIiR7dGhpcy5zaG93Q3JlYXRlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6Y3JlYXRlQXRFbmQ9XCIke3RoaXMuY3JlYXRlQXRFbmR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTplbmFibGVBdXRvU2Nyb2xsPVwiJHt0aGlzLmVuYWJsZUF1dG9TY3JvbGx9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpkaXNwbGF5TW9kZVByb3BlcnR5QmluZGluZz1cIiR7dGhpcy5yZWFkT25seX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOnRhYmxlVHlwZT1cIiR7dGhpcy50YWJsZVR5cGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTp0YXJnZXRDb2xsZWN0aW9uUGF0aD1cIiR7Q29tbW9uSGVscGVyLmdldENvbnRleHRQYXRoKG51bGwsIHsgY29udGV4dDogdGhpcy5jb2xsZWN0aW9uIH0pfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6ZW50aXR5VHlwZT1cIiR7Q29tbW9uSGVscGVyLmdldENvbnRleHRQYXRoKG51bGwsIHsgY29udGV4dDogdGhpcy5jb2xsZWN0aW9uIH0pICsgXCIvXCJ9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTptZXRhUGF0aD1cIiR7Q29tbW9uSGVscGVyLmdldENvbnRleHRQYXRoKG51bGwsIHsgY29udGV4dDogdGhpcy5jb2xsZWN0aW9uIH0pfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6b25DaGFuZ2U9XCIke3RoaXMub25DaGFuZ2V9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpoaWRkZW5GaWx0ZXJzPVwiJHtUYWJsZUhlbHBlci5mb3JtYXRIaWRkZW5GaWx0ZXJzKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZmlsdGVycz8uaGlkZGVuRmlsdGVycyl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpyZXF1ZXN0R3JvdXBJZD1cIiRhdXRvLldvcmtlcnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOnNlZ21lbnRlZEJ1dHRvbklkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJTZWdtZW50ZWRCdXR0b25cIiwgXCJUZW1wbGF0ZUNvbnRlbnRWaWV3XCJdKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmVuYWJsZVBhc3RlPVwiJHt0aGlzLmVuYWJsZVBhc3RlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6b3BlcmF0aW9uQXZhaWxhYmxlTWFwPVwiJHtDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YSh0aGlzLnRhYmxlRGVmaW5pdGlvbi5vcGVyYXRpb25BdmFpbGFibGVNYXApfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlPVwiJHt0aGlzLnZpc2libGV9XCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpkYXRhU3RhdGVJbmRpY2F0b3I+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBsdWdpbnM6RGF0YVN0YXRlSW5kaWNhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj1cIiR7dGhpcy5kYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXJ9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRmlsdGVyaW5nPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFTdGF0ZUNoYW5nZT1cIkFQSS5vbkRhdGFTdGF0ZUNoYW5nZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbWRjOmRhdGFTdGF0ZUluZGljYXRvcj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZGM6dHlwZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMuZ2V0VGFibGVUeXBlKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzp0eXBlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpkZXBlbmRlbnRzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXREZXBlbmRlbnRzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzpkZXBlbmRlbnRzPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzphY3Rpb25zPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRBY3Rpb25zKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzphY3Rpb25zPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpyb3dTZXR0aW5ncz5cbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRSb3dTZXR0aW5nKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzpyb3dTZXR0aW5ncz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZGM6Y29sdW1ucz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtbnNcIiB0eXBlPVwiWE1MXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbWRjOmNvbHVtbnM+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMuZ2V0Q3JlYXRpb25Sb3coKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRWYXJpYW50TWFuYWdlbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmdldFF1aWNrRmlsdGVyKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvbWRjOlRhYmxlPlxuXHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+XG4gICAgICAgICAgICA8L21hY3JvVGFibGU6VGFibGVBUEk+XG4gICAgICAgIGA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNENBLE1BQU1BLHlCQUF5QixHQUFHLFVBQVVDLFdBQW9CLEVBQUU7SUFBQTtJQUNqRSxJQUFJQyxrQkFBa0IsR0FBRyxJQUFJO0lBQzdCLE1BQU1DLEdBQUcsR0FBR0YsV0FBVztJQUN2QixJQUFJRyxXQUFrQixHQUFHLEVBQUU7SUFDM0IsTUFBTUMsU0FBUyx3QkFBR0YsR0FBRyxDQUFDRyxZQUFZLENBQUMsS0FBSyxDQUFDLHNEQUF2QixrQkFBeUJDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO0lBQ3BFLElBQUlKLEdBQUcsQ0FBQ0ssUUFBUSxDQUFDQyxNQUFNLElBQUlOLEdBQUcsQ0FBQ08sU0FBUyxLQUFLLGFBQWEsSUFBSVAsR0FBRyxDQUFDUSxZQUFZLEtBQUssZUFBZSxFQUFFO01BQ25HLE1BQU1DLFlBQVksR0FBR0MsS0FBSyxDQUFDQyxTQUFTLENBQUNDLEtBQUssQ0FBQ0MsS0FBSyxDQUFDYixHQUFHLENBQUNLLFFBQVEsQ0FBQztNQUM5RCxJQUFJUyxTQUFTLEdBQUcsQ0FBQztNQUNqQmYsa0JBQWtCLEdBQUdVLFlBQVksQ0FBQ00sTUFBTSxDQUFDLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxLQUFLO1FBQUE7UUFDM0QsTUFBTUMsWUFBWSxHQUFHLDBCQUFBRCxRQUFRLENBQUNkLFlBQVksQ0FBQyxLQUFLLENBQUMsMERBQTVCLHNCQUE4QkMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsS0FBSUYsU0FBUyxHQUFHLFFBQVEsR0FBR1ksU0FBUztRQUNoSCxNQUFNSyxZQUFZLEdB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QTtJQUFBO0lBQUE7TUFBQSxPQWlEOUJDLFVBQVUsQ0FBQ0MsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9Bb0hyQixFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQVlKLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BOEJGalEsU0FBUztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BaUNYLEVBQUU7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==