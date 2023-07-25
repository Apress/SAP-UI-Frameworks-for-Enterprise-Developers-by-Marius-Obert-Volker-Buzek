/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/SizeHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/library", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/table/TableSizeHelper", "sap/ui/mdc/enum/EditMode"], function (Log, DataVisualization, MetaModelConverter, TableFormatter, BindingToolkit, SizeHelper, StableIdHelper, TypeGuards, FELibrary, DataModelPathHelper, PropertyHelper, UIFormatters, CommonHelper, FieldTemplating, ActionHelper, TableSizeHelper, EditMode) {
  "use strict";

  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var getEditMode = UIFormatters.getEditMode;
  var isImageURL = PropertyHelper.isImageURL;
  var hasText = PropertyHelper.hasText;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var generate = StableIdHelper.generate;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var fn = BindingToolkit.fn;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getUiControl = DataVisualization.getUiControl;
  const CreationMode = FELibrary.CreationMode;

  /**
   * Helper class used by the control library for OData-specific handling (OData V4)
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const TableHelper = {
    /**
     * Check if a given action is static.
     *
     * @param oActionContext The instance of the action
     * @param sActionName The name of the action
     * @returns Returns 'true' if action is static, else 'false'
     * @private
     * @ui5-restricted
     */
    _isStaticAction: function (oActionContext, sActionName) {
      let oAction;
      if (oActionContext) {
        if (Array.isArray(oActionContext)) {
          const sEntityType = this._getActionOverloadEntityType(sActionName);
          if (sEntityType) {
            oAction = oActionContext.find(function (action) {
              return action.$IsBound && action.$Parameter[0].$Type === sEntityType;
            });
          } else {
            // if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
            // as we used the first one all the time we keep it as it is
            oAction = oActionContext[0];
          }
        } else {
          oAction = oActionContext;
        }
      }
      return !!oAction && oAction.$IsBound && oAction.$Parameter[0].$isCollection;
    },
    /**
     * Get the entity type of an action overload.
     *
     * @param sActionName The name of the action.
     * @returns The entity type used in the action overload.
     * @private
     */
    _getActionOverloadEntityType: function (sActionName) {
      if (sActionName && sActionName.indexOf("(") > -1) {
        const aParts = sActionName.split("(");
        return aParts[aParts.length - 1].replaceAll(")", "");
      }
      return undefined;
    },
    /**
     * Checks whether the action is overloaded on a different entity type.
     *
     * @param sActionName The name of the action.
     * @param sAnnotationTargetEntityType The entity type of the annotation target.
     * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
     * @private
     */
    _isActionOverloadOnDifferentType: function (sActionName, sAnnotationTargetEntityType) {
      const sEntityType = this._getActionOverloadEntityType(sActionName);
      return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
    },
    /**
     * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
     *
     * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
     * @returns The fields.
     * @private
     * @ui5-restricted
     */
    getFieldsRequestedByPresentationVariant: function (oPresentationVariant) {
      var _oPresentationVariant;
      return ((_oPresentationVariant = oPresentationVariant.RequestAtLeast) === null || _oPresentationVariant === void 0 ? void 0 : _oPresentationVariant.map(oRequested => oRequested.value)) || [];
    },
    getNavigationAvailableFieldsFromLineItem: function (aLineItemContext) {
      const aSelectedFieldsArray = [];
      (aLineItemContext.getObject() || []).forEach(function (oRecord) {
        var _oRecord$NavigationAv;
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && !oRecord.Determining && (_oRecord$NavigationAv = oRecord.NavigationAvailable) !== null && _oRecord$NavigationAv !== void 0 && _oRecord$NavigationAv.$Path) {
          aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
        }
      });
      return aSelectedFieldsArray;
    },
    getNavigationAvailableMap: function (lineItemCollection) {
      const oIBNNavigationAvailableMap = {};
      lineItemCollection === null || lineItemCollection === void 0 ? void 0 : lineItemCollection.forEach(record => {
        if ("SemanticObject" in record) {
          const sKey = `${record.SemanticObject}-${record.Action}`;
          if (record.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !record.Inline && record.RequiresContext) {
            if (record.NavigationAvailable !== undefined) {
              oIBNNavigationAvailableMap[sKey] = isPathAnnotationExpression(record.NavigationAvailable) ? record.NavigationAvailable.path : record.NavigationAvailable;
            }
          }
        }
      });
      return JSON.stringify(oIBNNavigationAvailableMap);
    },
    /**
     * Returns the context of the UI.LineItem.
     *
     * @param presentationContext The presentation context (either a presentation variant or a UI.LineItem)
     * @returns The context of the UI.LineItem
     */
    getUiLineItem: function (presentationContext) {
      return getUiControl(presentationContext, `@${"com.sap.vocabularies.UI.v1.LineItem"}`);
    },
    getUiLineItemObject: function (lineItemOrPresentationContext, convertedMetaData) {
      var _visualizations$find;
      const lineItemOrPresentationObject = convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target;
      if (!lineItemOrPresentationObject) return undefined;
      const visualizations = convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target.Visualizations;
      const lineItemObject = visualizations ? visualizations === null || visualizations === void 0 ? void 0 : (_visualizations$find = visualizations.find(item => item.value.indexOf("@" + "com.sap.vocabularies.UI.v1.LineItem") === 0)) === null || _visualizations$find === void 0 ? void 0 : _visualizations$find.$target : lineItemOrPresentationObject;
      return (lineItemObject === null || lineItemObject === void 0 ? void 0 : lineItemObject.term) === "com.sap.vocabularies.UI.v1.LineItem" ? lineItemObject : undefined;
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters that were passed.
     *
     * @param table The instance of the inner model of the table building block
     * @returns The 'select' query that has the selected fields from the parameters that were passed
     */
    create$Select: function (table) {
      const selectedFields = [];
      const lineItemContext = TableHelper.getUiLineItem(table.metaPath);
      function pushField(field) {
        if (field && !selectedFields.includes(field) && field.indexOf("/") !== 0) {
          // Do not add singleton property (with absolute path) to $select
          selectedFields.push(field);
        }
      }
      function pushFieldList(fields) {
        if (fields !== null && fields !== void 0 && fields.length) {
          fields.forEach(pushField);
        }
      }
      const columns = table.tableDefinition.columns;
      const propertiesFromCustomColumns = this.getPropertiesFromCustomColumns(columns);
      if (propertiesFromCustomColumns !== null && propertiesFromCustomColumns !== void 0 && propertiesFromCustomColumns.length) {
        pushFieldList(propertiesFromCustomColumns);
      }
      if (lineItemContext.getPath().indexOf(`@${"com.sap.vocabularies.UI.v1.LineItem"}`) > -1) {
        var _targetCollection$ann, _table$contextObjectP, _table$contextObjectP2, _table$contextObjectP3, _table$contextObjectP4, _table$contextObjectP5, _table$contextObjectP6, _table$contextObjectP7, _table$contextObjectP8, _table$contextObjectP9, _table$contextObjectP10;
        // Don't process EntityType without LineItem
        const presentationAnnotation = getInvolvedDataModelObjects(table.metaPath).targetObject;
        const operationAvailableProperties = (table.tableDefinition.operationAvailableProperties || "").split(",");
        const applicableProperties = TableHelper._filterNonApplicableProperties(operationAvailableProperties, table.collection);
        const targetCollection = table.collectionEntity.entityType || table.collectionEntity.targetType;
        const aSemanticKeys = (((_targetCollection$ann = targetCollection.annotations.Common) === null || _targetCollection$ann === void 0 ? void 0 : _targetCollection$ann.SemanticKey) || []).map(oSemanticKey => oSemanticKey.value);
        if ((presentationAnnotation === null || presentationAnnotation === void 0 ? void 0 : presentationAnnotation.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(presentationAnnotation));
        }
        pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(lineItemContext));
        pushFieldList(applicableProperties);
        pushFieldList(aSemanticKeys);
        pushField((_table$contextObjectP = table.contextObjectPath.targetEntitySet) === null || _table$contextObjectP === void 0 ? void 0 : (_table$contextObjectP2 = _table$contextObjectP.annotations) === null || _table$contextObjectP2 === void 0 ? void 0 : (_table$contextObjectP3 = _table$contextObjectP2.Capabilities) === null || _table$contextObjectP3 === void 0 ? void 0 : (_table$contextObjectP4 = _table$contextObjectP3.DeleteRestrictions) === null || _table$contextObjectP4 === void 0 ? void 0 : (_table$contextObjectP5 = _table$contextObjectP4.Deletable) === null || _table$contextObjectP5 === void 0 ? void 0 : _table$contextObjectP5.path);
        pushField((_table$contextObjectP6 = table.contextObjectPath.targetEntitySet) === null || _table$contextObjectP6 === void 0 ? void 0 : (_table$contextObjectP7 = _table$contextObjectP6.annotations) === null || _table$contextObjectP7 === void 0 ? void 0 : (_table$contextObjectP8 = _table$contextObjectP7.Capabilities) === null || _table$contextObjectP8 === void 0 ? void 0 : (_table$contextObjectP9 = _table$contextObjectP8.UpdateRestrictions) === null || _table$contextObjectP9 === void 0 ? void 0 : (_table$contextObjectP10 = _table$contextObjectP9.Updatable) === null || _table$contextObjectP10 === void 0 ? void 0 : _table$contextObjectP10.path);
      }
      return selectedFields.join(",");
    },
    /**
     * Method to get column's width if defined from manifest or from customization via annotations.
     *
     * @function
     * @name getColumnWidth
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField DataField definition object
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The object path of the data model
     * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
     * @param microChartTitle The object containing title and description of the MicroChart
     * @returns - Column width if defined, otherwise width is set to auto
     */
    getColumnWidth: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, useRemUnit, microChartTitle) {
      if (column.width) {
        return column.width;
      }
      if (oThis.enableAutoColumnWidth === true) {
        let width;
        width = this.getColumnWidthForImage(dataModelObjectPath) || this.getColumnWidthForDataField(oThis, column, dataField, dataFieldActionText, dataModelObjectPath, microChartTitle) || undefined;
        if (width) {
          return useRemUnit ? `${width}rem` : width;
        }
        width = compileExpression(formatResult([pathInModel("/editMode", "ui"), pathInModel("tablePropertiesAvailable", "internal"), column.name, useRemUnit], TableFormatter.getColumnWidth));
        return width;
      }
      return undefined;
    },
    /**
     * Method to get the width of the column containing an image.
     *
     * @function
     * @name getColumnWidthForImage
     * @param dataModelObjectPath The data model object path
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForImage: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7, _dataModelObjectPath$8, _dataModelObjectPath$9, _dataModelObjectPath$10, _annotations$Core2, _annotations$Core2$Me;
      let width = null;
      const annotations = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$ === void 0 ? void 0 : (_dataModelObjectPath$2 = _dataModelObjectPath$.Value) === null || _dataModelObjectPath$2 === void 0 ? void 0 : (_dataModelObjectPath$3 = _dataModelObjectPath$2.$target) === null || _dataModelObjectPath$3 === void 0 ? void 0 : _dataModelObjectPath$3.annotations;
      const dataType = (_dataModelObjectPath$4 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$4 === void 0 ? void 0 : (_dataModelObjectPath$5 = _dataModelObjectPath$4.Value) === null || _dataModelObjectPath$5 === void 0 ? void 0 : (_dataModelObjectPath$6 = _dataModelObjectPath$5.$target) === null || _dataModelObjectPath$6 === void 0 ? void 0 : _dataModelObjectPath$6.type;
      if ((_dataModelObjectPath$7 = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.Value && getEditMode((_dataModelObjectPath$8 = dataModelObjectPath.targetObject.Value) === null || _dataModelObjectPath$8 === void 0 ? void 0 : _dataModelObjectPath$8.$target, dataModelObjectPath, false, false, dataModelObjectPath.targetObject) === EditMode.Display) {
        var _annotations$Core, _annotations$Core$Med;
        const hasTextAnnotation = hasText(dataModelObjectPath.targetObject.Value.$target);
        if (dataType === "Edm.Stream" && !hasTextAnnotation && annotations !== null && annotations !== void 0 && (_annotations$Core = annotations.Core) !== null && _annotations$Core !== void 0 && (_annotations$Core$Med = _annotations$Core.MediaType) !== null && _annotations$Core$Med !== void 0 && _annotations$Core$Med.includes("image/")) {
          width = 6.2;
        }
      } else if (annotations && (isImageURL((_dataModelObjectPath$9 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$9 === void 0 ? void 0 : (_dataModelObjectPath$10 = _dataModelObjectPath$9.Value) === null || _dataModelObjectPath$10 === void 0 ? void 0 : _dataModelObjectPath$10.$target) || annotations !== null && annotations !== void 0 && (_annotations$Core2 = annotations.Core) !== null && _annotations$Core2 !== void 0 && (_annotations$Core2$Me = _annotations$Core2.MediaType) !== null && _annotations$Core2$Me !== void 0 && _annotations$Core2$Me.includes("image/"))) {
        width = 6.2;
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the DataField.
     *
     * @function
     * @name getColumnWidthForDataField
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The data model object path
     * @param oMicroChartTitle The object containing the title and description of the MicroChart
     * @returns - Column width if defined, otherwise null ( the width is treated as a rem value)
     */
    getColumnWidthForDataField: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, oMicroChartTitle) {
      var _dataModelObjectPath$11, _dataModelObjectPath$12;
      const annotations = (_dataModelObjectPath$11 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$11 === void 0 ? void 0 : _dataModelObjectPath$11.annotations;
      const dataType = (_dataModelObjectPath$12 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$12 === void 0 ? void 0 : _dataModelObjectPath$12.$Type;
      let width = null;
      if (dataType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataField.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) === -1) {
        var _dataField$Label;
        let nTmpTextWidth;
        nTmpTextWidth = SizeHelper.getButtonWidth(dataFieldActionText) || SizeHelper.getButtonWidth(dataField === null || dataField === void 0 ? void 0 : (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString()) || SizeHelper.getButtonWidth(annotations === null || annotations === void 0 ? void 0 : annotations.Label);

        // get width for rating or progress bar datafield
        const nTmpVisualizationWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(dataModelObjectPath.targetObject).propertyWidth;
        if (nTmpVisualizationWidth > nTmpTextWidth) {
          width = nTmpVisualizationWidth;
        } else if (dataFieldActionText || annotations && (annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction")) {
          // Add additional 1.8 rem to avoid showing ellipsis in some cases.
          nTmpTextWidth += 1.8;
          width = nTmpTextWidth;
        }
        width = width || this.getColumnWidthForChart(oThis, column, dataField, nTmpTextWidth, oMicroChartTitle);
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the Chart.
     *
     * @function
     * @name getColumnWidthForChart
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param columnLabelWidth The width of the column label or button label
     * @param microChartTitle The object containing the title and the description of the MicroChart
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForChart(oThis, column, dataField, columnLabelWidth, microChartTitle) {
      var _dataField$Target, _dataField$Target$$An;
      let chartSize,
        width = null;
      if (((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$An = _dataField$Target.$AnnotationPath) === null || _dataField$Target$$An === void 0 ? void 0 : _dataField$Target$$An.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`)) !== -1) {
        switch (this.getChartSize(oThis, column)) {
          case "XS":
            chartSize = 4.4;
            break;
          case "S":
            chartSize = 4.6;
            break;
          case "M":
            chartSize = 5.5;
            break;
          case "L":
            chartSize = 6.9;
            break;
          default:
            chartSize = 5.3;
        }
        columnLabelWidth += 1.8;
        if (!this.getShowOnlyChart(oThis, column) && microChartTitle && (microChartTitle.Title.length || microChartTitle.Description.length)) {
          const tmpText = microChartTitle.Title.length > microChartTitle.Description.length ? microChartTitle.Title : microChartTitle.Description;
          const titleSize = SizeHelper.getButtonWidth(tmpText) + 7;
          const tmpWidth = titleSize > columnLabelWidth ? titleSize : columnLabelWidth;
          width = tmpWidth;
        } else if (columnLabelWidth > chartSize) {
          width = columnLabelWidth;
        } else {
          width = chartSize;
        }
      }
      return width;
    },
    /**
     * Method to add a margin class at the control.
     *
     * @function
     * @name getMarginClass
     * @param oCollection Title of the DataPoint
     * @param oDataField Value of the DataPoint
     * @param sVisualization
     * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @returns Adjusting the margin
     */
    getMarginClass: function (oCollection, oDataField, sVisualization, sFieldGroupHiddenExpressions) {
      let sBindingExpression,
        sClass = "";
      if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
        //If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
        if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
        }
      } else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
        //If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
        //only the top margin added by sapMRI class of interactive rating indicator must be nullified.

        sClass = "sapUiNoMarginTop";
      } else {
        sClass = "sapUiTinyMarginBottom";
      }
      if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
        const sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(sFieldGroupHiddenExpressions.indexOf("{=") + 2, sFieldGroupHiddenExpressions.lastIndexOf("}"));
        sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
        return sBindingExpression;
      } else {
        return sClass;
      }
    },
    /**
     * Method to get VBox visibility.
     *
     * @param collection Collection of data fields in VBox
     * @param fieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @param fieldGroup Data field containing the VBox
     * @returns Visibility expression
     */
    getVBoxVisibility: function (collection, fieldGroupHiddenExpressions, fieldGroup) {
      let allStatic = true;
      const hiddenPaths = [];
      if (fieldGroup[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]) {
        return fieldGroupHiddenExpressions;
      }
      for (const dataField of collection) {
        const hiddenAnnotationValue = dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        if (hiddenAnnotationValue === undefined || hiddenAnnotationValue === false) {
          hiddenPaths.push(false);
          continue;
        }
        if (hiddenAnnotationValue === true) {
          hiddenPaths.push(true);
          continue;
        }
        if (hiddenAnnotationValue.$Path) {
          hiddenPaths.push(pathInModel(hiddenAnnotationValue.$Path));
          allStatic = false;
          continue;
        }
        if (typeof hiddenAnnotationValue === "object") {
          // Dynamic expression found in a field
          return fieldGroupHiddenExpressions;
        }
      }
      const hasAnyPathExpressions = constant(hiddenPaths.length > 0 && allStatic !== true);
      const hasAllHiddenStaticExpressions = constant(hiddenPaths.length > 0 && hiddenPaths.indexOf(false) === -1 && allStatic);
      return compileExpression(ifElse(hasAnyPathExpressions, formatResult(hiddenPaths, TableFormatter.getVBoxVisibility), ifElse(hasAllHiddenStaticExpressions, constant(false), constant(true))));
    },
    /**
     * Method to provide hidden filters to the table.
     *
     * @function
     * @name formatHiddenFilters
     * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
     * @returns The string representation of the hidden filters
     */
    formatHiddenFilters: function (oHiddenFilter) {
      if (oHiddenFilter) {
        try {
          return JSON.stringify(oHiddenFilter);
        } catch (ex) {
          return undefined;
        }
      }
      return undefined;
    },
    /**
     * Method to get the stable ID of a table element (column or FieldGroup label).
     *
     * @function
     * @name getElementStableId
     * @param tableId Current object ID
     * @param elementId Element Id or suffix
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getElementStableId: function (tableId, elementId, dataModelObjectPath) {
      var _Value;
      if (!tableId) {
        return undefined;
      }
      const dataField = dataModelObjectPath.targetObject;
      let dataFieldPart;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          dataFieldPart = dataField.Target.value;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          dataFieldPart = dataField;
          break;
        default:
          dataFieldPart = ((_Value = dataField.Value) === null || _Value === void 0 ? void 0 : _Value.path) ?? "";
          break;
      }
      return generate([tableId, elementId, dataFieldPart]);
    },
    /**
     * Method to get the stable ID of the column.
     *
     * @function
     * @name getColumnStableId
     * @param id Current object ID
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getColumnStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "C", dataModelObjectPath);
    },
    getFieldGroupLabelStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "FGLabel", dataModelObjectPath);
    },
    /**
     * Method filters out properties which do not belong to the collection.
     *
     * @param properties The array of properties to be checked.
     * @param collectionContext The collection context to be used.
     * @returns The array of applicable properties.
     * @private
     */
    _filterNonApplicableProperties: function (properties, collectionContext) {
      return properties && properties.filter(function (sPropertyPath) {
        return collectionContext.getObject(`./${sPropertyPath}`);
      });
    },
    /**
     * Method to retreive the listed properties from the custom columns
     *
     * @param columns The table columns
     * @returns The list of available properties from the custom columns
     * @private
     */

    getPropertiesFromCustomColumns: function (columns) {
      // Add properties from the custom columns, this is required for the export of all the properties listed on a custom column
      if (!(columns !== null && columns !== void 0 && columns.length)) {
        return;
      }
      const propertiesFromCustomColumns = [];
      for (const column of columns) {
        var _column$properties;
        if ("properties" in column && (_column$properties = column.properties) !== null && _column$properties !== void 0 && _column$properties.length) {
          for (const property of column.properties) {
            if (propertiesFromCustomColumns.indexOf(property) === -1) {
              // only add property if it doesn't exist
              propertiesFromCustomColumns.push(property);
            }
          }
        }
      }
      return propertiesFromCustomColumns;
    },
    /**
     * Method to generate the binding information for a table row.
     *
     * @param table The instance of the inner model of the table building block
     * @returns - Returns the binding information of a table row
     */
    getRowsBindingInfo: function (table) {
      const dataModelPath = getInvolvedDataModelObjects(table.collection, table.contextPath);
      const path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
      const oRowBinding = {
        ui5object: true,
        suspended: false,
        path: CommonHelper.addSingleQuotes(path),
        parameters: {
          $count: true
        },
        events: {}
      };
      if (table.tableDefinition.enable$select) {
        // Don't add $select parameter in case of an analytical query, this isn't supported by the model
        const sSelect = TableHelper.create$Select(table);
        if (sSelect) {
          oRowBinding.parameters.$select = `'${sSelect}'`;
        }
      }
      if (table.tableDefinition.enable$$getKeepAliveContext) {
        // we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
        oRowBinding.parameters.$$getKeepAliveContext = true;
      }
      oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
      oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
      oRowBinding.parameters.$$ownRequest = true;
      oRowBinding.parameters.$$patchWithoutSideEffects = true;
      oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
      oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
      oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
      // recreate an empty row when one is activated
      oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");
      if (table.onContextChange) {
        oRowBinding.events.change = CommonHelper.addSingleQuotes(table.onContextChange);
      }
      return CommonHelper.objectToString(oRowBinding);
    },
    /**
     * Method to check the validity of the fields in the creation row.
     *
     * @function
     * @name validateCreationRowFields
     * @param oFieldValidityObject Current Object holding the fields
     * @returns `true` if all the fields in the creation row are valid, `false` otherwise
     */
    validateCreationRowFields: function (oFieldValidityObject) {
      if (!oFieldValidityObject) {
        return false;
      }
      return Object.keys(oFieldValidityObject).length > 0 && Object.keys(oFieldValidityObject).every(function (key) {
        return oFieldValidityObject[key]["validity"];
      });
    },
    /**
     * Method to get the expression for the 'press' event for the DataFieldForActionButton.
     *
     * @function
     * @name pressEventDataFieldForActionButton
     * @param table Current object
     * @param dataField Value of the DataPoint
     * @param entitySetName Name of the EntitySet
     * @param operationAvailableMap OperationAvailableMap as stringified JSON object
     * @param actionContext Action object
     * @param isNavigable Action either triggers navigation or not
     * @param enableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
     * @param defaultValuesExtensionFunction Function name to prefill dialog parameters
     * @returns The binding expression
     */
    pressEventDataFieldForActionButton: function (table, dataField, entitySetName, operationAvailableMap, actionContext) {
      let isNavigable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      let enableAutoScroll = arguments.length > 6 ? arguments[6] : undefined;
      let defaultValuesExtensionFunction = arguments.length > 7 ? arguments[7] : undefined;
      if (!dataField) return undefined;
      const sActionName = dataField.Action,
        targetEntityTypeName = table.contextObjectPath.targetEntityType.fullyQualifiedName,
        staticAction = this._isStaticAction(actionContext, sActionName) || this._isActionOverloadOnDifferentType(sActionName, targetEntityTypeName),
        params = {
          contexts: !staticAction ? pathInModel("selectedContexts", "internal") : null,
          bStaticAction: staticAction ? staticAction : undefined,
          entitySetName: entitySetName,
          applicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aApplicable/`, "internal") : null,
          notApplicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aNotApplicable/`, "internal") : null,
          isNavigable: isNavigable,
          enableAutoScroll: enableAutoScroll,
          defaultValuesExtensionFunction: defaultValuesExtensionFunction
        };
      params.invocationGrouping = (dataField.InvocationGrouping && dataField.InvocationGrouping.$EnumMember) === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
      params.controlId = table.id;
      params.operationAvailableMap = operationAvailableMap;
      params.label = dataField.Label;
      return compileExpression(fn("API.onActionPress", [ref("$event"), ref("$controller"), dataField.Action, params]));
      //return ActionHelper.getPressEventDataFieldForActionButton(table.id!, dataField, params, operationAvailableMap);
    },

    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForAction actions.
     *
     * @function
     * @name isDataFieldForActionEnabled
     * @param table The instance of the table control
     * @param dataField The value of the data field
     * @param requiresContext RequiresContext for IBN
     * @param actionContext The instance of the action
     * @param enableOnSelect Define the enabling of the action (single or multiselect)
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForActionEnabled: function (table, dataField, requiresContext, actionContext, enableOnSelect) {
      const actionName = dataField.Action,
        annotationTargetEntityType = table === null || table === void 0 ? void 0 : table.collection.getObject("$Type"),
        isStaticAction = this._isStaticAction(actionContext, actionName);

      // Check for action overload on a different Entity type.
      // If yes, table row selection is not required to enable this action.
      if (this._isActionOverloadOnDifferentType(actionName, annotationTargetEntityType)) {
        // Action overload defined on different entity type
        const oOperationAvailableMap = table.tableDefinition && JSON.parse(table.tableDefinition.operationAvailableMap);
        if (oOperationAvailableMap !== null && oOperationAvailableMap !== void 0 && oOperationAvailableMap.hasOwnProperty(actionName)) {
          // Core.OperationAvailable annotation defined for the action.
          // Need to refer to internal model for enabled property of the dynamic action.
          // return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
          return `{= \${internal>dynamicActions/${actionName}/bEnabled} }`;
        }
        // Consider the action just like any other static DataFieldForAction.
        return true;
      }
      if (!requiresContext || isStaticAction) {
        return true;
      }
      let dataFieldForActionEnabledExpression = "";
      const numberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(enableOnSelect ?? "multiselect");
      const action = `\${internal>dynamicActions/${dataField.Action}/bEnabled}`;
      dataFieldForActionEnabledExpression = numberOfSelectedContexts + " && " + action;
      return "{= " + dataFieldForActionEnabledExpression + "}";
    },
    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForIBN actions.
     *
     * @function
     * @name isDataFieldForIBNEnabled
     * @param table The instance of the table control
     * @param dataField The value of the data field
     * @param requiresContext RequiresContext for IBN
     * @param isNavigationAvailable Define if the navigation is available
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForIBNEnabled: function (table, dataField, requiresContext, isNavigationAvailable) {
      var _table$tableDefinitio;
      const isAnalyticalTable = table === null || table === void 0 ? void 0 : (_table$tableDefinitio = table.tableDefinition) === null || _table$tableDefinitio === void 0 ? void 0 : _table$tableDefinitio.enableAnalytics;
      if (!requiresContext) {
        var _dataField$Navigation;
        const entitySet = table.collection.getPath();
        const metaModel = table.collection.getModel();
        if (isNavigationAvailable === "false" && !isAnalyticalTable) {
          Log.warning("NavigationAvailable as false is incorrect usage");
          return false;
        } else if (isNavigationAvailable && !isAnalyticalTable && dataField !== null && dataField !== void 0 && (_dataField$Navigation = dataField.NavigationAvailable) !== null && _dataField$Navigation !== void 0 && _dataField$Navigation.$Path && metaModel.getObject(entitySet + "/$Partner") === dataField.NavigationAvailable.$Path.split("/")[0]) {
          return `{= \${${isNavigationAvailable.substring(isNavigationAvailable.indexOf("/") + 1, isNavigationAvailable.length)}}`;
        }
        return true;
      }
      let dataFieldForIBNEnabledExpression = "",
        numberOfSelectedContexts,
        action;
      if (isNavigationAvailable === "true" || isAnalyticalTable) {
        dataFieldForIBNEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
      } else if (isNavigationAvailable === "false") {
        Log.warning("NavigationAvailable as false is incorrect usage");
        return false;
      } else {
        numberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
        action = `\${internal>ibn/${dataField.SemanticObject}-${dataField.Action}/bEnabled}`;
        dataFieldForIBNEnabledExpression = numberOfSelectedContexts + " && " + action;
      }
      return `{= ${dataFieldForIBNEnabledExpression}}`;
    },
    /**
     * Method to get press event expression for CreateButton.
     *
     * @function
     * @name pressEventForCreateButton
     * @param oThis Current Object
     * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
     * @returns The binding expression for the press event of the create button
     */
    pressEventForCreateButton: function (oThis, bCmdExecutionFlag) {
      const sCreationMode = oThis.creationMode;
      let oParams;
      const sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
      let sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";
      switch (sCreationMode) {
        case CreationMode.External:
          // navigate to external target for creating new entries
          // TODO: Add required parameters
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
            outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
          };
          break;
        case CreationMode.CreationRow:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
            creationRow: "${$source>}",
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
          };
          sRowBinding = "${$source>}.getParent().getRowBinding()";
          break;
        case CreationMode.NewPage:
        case CreationMode.Inline:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(sCreationMode),
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
            tableId: CommonHelper.addSingleQuotes(oThis.id)
          };
          if (oThis.createNewAction) {
            oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
          }
          break;
        case CreationMode.InlineCreationRows:
          return CommonHelper.generateFunction(".editFlow.createEmptyRowsAndFocus", sMdcTable);
        default:
          // unsupported
          return undefined;
      }
      return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
    },
    getIBNData: function (oThis) {
      const outboundDetail = oThis.createOutboundDetail;
      if (outboundDetail) {
        const oIBNData = {
          semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
          action: CommonHelper.addSingleQuotes(outboundDetail.action)
        };
        return CommonHelper.objectToString(oIBNData);
      }
    },
    _getExpressionForDeleteButton: function (value, fullContextPath) {
      if (typeof value === "string") {
        return CommonHelper.addSingleQuotes(value, true);
      } else {
        const expression = getExpressionFromAnnotation(value);
        if (isConstant(expression) || isPathInModelExpression(expression)) {
          const valueExpression = formatValueRecursively(expression, fullContextPath);
          return compileExpression(valueExpression);
        }
      }
    },
    /**
     * Method to get press event expression for 'Delete' button.
     *
     * @function
     * @name pressEventForDeleteButton
     * @param oThis Current Object
     * @param sEntitySetName EntitySet name
     * @param oHeaderInfo Header Info
     * @param fullcontextPath Context Path
     * @returns The binding expression for the press event of the 'Delete' button
     */
    pressEventForDeleteButton: function (oThis, sEntitySetName, oHeaderInfo, fullcontextPath) {
      const sDeletableContexts = "${internal>deletableContexts}";
      let sTitleExpression, sDescriptionExpression;
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Title) {
        sTitleExpression = this._getExpressionForDeleteButton(oHeaderInfo.Title.Value, fullcontextPath);
      }
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Description) {
        sDescriptionExpression = this._getExpressionForDeleteButton(oHeaderInfo.Description.Value, fullcontextPath);
      }
      const oParams = {
        id: CommonHelper.addSingleQuotes(oThis.id),
        entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
        numberOfSelectedContexts: "${internal>selectedContexts}.length",
        unSavedContexts: "${internal>unSavedContexts}",
        lockedContexts: "${internal>lockedContexts}",
        createModeContexts: "${internal>createModeContexts}",
        draftsWithDeletableActive: "${internal>draftsWithDeletableActive}",
        draftsWithNonDeletableActive: "${internal>draftsWithNonDeletableActive}",
        controlId: "${internal>controlId}",
        title: sTitleExpression,
        description: sDescriptionExpression,
        selectedContexts: "${internal>selectedContexts}"
      };
      return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
    },
    /**
     * Method to set the visibility of the label for the column header.
     *
     * @function
     * @name setHeaderLabelVisibility
     * @param datafield DataField
     * @param dataFieldCollection List of items inside a fieldgroup (if any)
     * @returns `true` if the header label needs to be visible else false.
     */
    setHeaderLabelVisibility: function (datafield, dataFieldCollection) {
      // If Inline button/navigation action, return false, else true;
      if (!dataFieldCollection) {
        if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
          return false;
        }
        if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
          return false;
        }
        return true;
      }

      // In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
      return dataFieldCollection.some(function (oDC) {
        if ((oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" || oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") && oDC[`@${"com.sap.vocabularies.UI.v1.Hidden"}`] !== true) {
          return true;
        }
      });
    },
    /**
     * Method to get the text from the DataFieldForAnnotation into the column.
     *
     * @function
     * @name getTextOnActionField
     * @param oDataField DataPoint's Value
     * @param oContext Context object of the LineItem
     * @returns String from label referring to action text
     */
    getTextOnActionField: function (oDataField, oContext) {
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return oDataField.Label;
      }
      // for FieldGroup containing DataFieldForAnnotation
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oContext.context.getObject("Target/$AnnotationPath").indexOf("@" + "com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
        const sPathDataFields = "Target/$AnnotationPath/Data/";
        const aMultipleLabels = [];
        for (const i in oContext.context.getObject(sPathDataFields)) {
          if (oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            aMultipleLabels.push(oContext.context.getObject(`${sPathDataFields + i}/Label`));
          }
        }
        // In case there are multiple actions inside a Field Group select the largest Action Label
        if (aMultipleLabels.length > 1) {
          return aMultipleLabels.reduce(function (a, b) {
            return a.length > b.length ? a : b;
          });
        } else {
          return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
        }
      }
      return undefined;
    },
    _getResponsiveTableColumnSettings: function (oThis, oColumn) {
      if (oThis.tableType === "ResponsiveTable") {
        return oColumn.settings;
      }
      return null;
    },
    getChartSize: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.microChartSize) {
        return settings.microChartSize;
      }
      return "XS";
    },
    getShowOnlyChart: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.showMicroChartLabel) {
        return !settings.showMicroChartLabel;
      }
      return true;
    },
    getDelegate: function (table, isALP, entityName) {
      let oDelegate;
      if (isALP === "true") {
        // We don't support TreeTable in ALP
        if (table.control.type === "TreeTable") {
          throw new Error("TreeTable not supported in Analytical ListPage");
        }
        oDelegate = {
          name: "sap/fe/macros/table/delegates/ALPTableDelegate",
          payload: {
            collectionName: entityName
          }
        };
      } else if (table.control.type === "TreeTable") {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TreeTableDelegate",
          payload: {
            hierarchyQualifier: table.control.hierarchyQualifier,
            initialExpansionLevel: table.annotation.initialExpansionLevel
          }
        };
      } else {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TableDelegate"
        };
      }
      return JSON.stringify(oDelegate);
    },
    setIBNEnablement: function (oInternalModelContext, oNavigationAvailableMap, aSelectedContexts) {
      for (const sKey in oNavigationAvailableMap) {
        oInternalModelContext.setProperty(`ibn/${sKey}`, {
          bEnabled: false,
          aApplicable: [],
          aNotApplicable: []
        });
        const aApplicable = [],
          aNotApplicable = [];
        const sProperty = oNavigationAvailableMap[sKey];
        for (let i = 0; i < aSelectedContexts.length; i++) {
          const oSelectedContext = aSelectedContexts[i];
          if (oSelectedContext.getObject(sProperty)) {
            oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/bEnabled`, true);
            aApplicable.push(oSelectedContext);
          } else {
            aNotApplicable.push(oSelectedContext);
          }
        }
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aApplicable`, aApplicable);
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aNotApplicable`, aNotApplicable);
      }
    },
    /**
     * @param oFastCreationRow
     * @param sPath
     * @param oContext
     * @param oModel
     * @param oFinalUIState
     */
    enableFastCreationRow: async function (oFastCreationRow, sPath, oContext, oModel, oFinalUIState) {
      let oFastCreationListBinding, oFastCreationContext;
      if (oFastCreationRow) {
        try {
          await oFinalUIState;
          // If a draft is discarded while a message strip filter is active on the table there is a table rebind caused by the DataStateIndicator
          // To prevent a new creation row binding being created at that moment we check if the context is already deleted
          if (oFastCreationRow.getModel("ui").getProperty("/isEditable") && !oContext.isDeleted()) {
            oFastCreationListBinding = oModel.bindList(sPath, oContext, [], [], {
              $$updateGroupId: "doNotSubmit",
              $$groupId: "doNotSubmit"
            });
            // Workaround suggested by OData model v4 colleagues
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oFastCreationListBinding.refreshInternal = function () {
              /* do nothing */
            };
            oFastCreationContext = oFastCreationListBinding.create();
            oFastCreationRow.setBindingContext(oFastCreationContext);

            // this is needed to avoid console error
            try {
              await oFastCreationContext.created();
            } catch (e) {
              Log.trace("transient fast creation context deleted");
            }
          }
        } catch (oError) {
          Log.error("Error while computing the final UI state", oError);
        }
      }
    }
  };
  TableHelper.getNavigationAvailableMap.requiresIContext = true;
  TableHelper.getTextOnActionField.requiresIContext = true;
  return TableHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsIm9BY3Rpb25Db250ZXh0Iiwic0FjdGlvbk5hbWUiLCJvQWN0aW9uIiwiQXJyYXkiLCJpc0FycmF5Iiwic0VudGl0eVR5cGUiLCJfZ2V0QWN0aW9uT3ZlcmxvYWRFbnRpdHlUeXBlIiwiZmluZCIsImFjdGlvbiIsIiRJc0JvdW5kIiwiJFBhcmFtZXRlciIsIiRUeXBlIiwiJGlzQ29sbGVjdGlvbiIsImluZGV4T2YiLCJhUGFydHMiLCJzcGxpdCIsImxlbmd0aCIsInJlcGxhY2VBbGwiLCJ1bmRlZmluZWQiLCJfaXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZSIsInNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSIsImdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudCIsIm9QcmVzZW50YXRpb25WYXJpYW50IiwiUmVxdWVzdEF0TGVhc3QiLCJtYXAiLCJvUmVxdWVzdGVkIiwidmFsdWUiLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlRmllbGRzRnJvbUxpbmVJdGVtIiwiYUxpbmVJdGVtQ29udGV4dCIsImFTZWxlY3RlZEZpZWxkc0FycmF5IiwiZ2V0T2JqZWN0IiwiZm9yRWFjaCIsIm9SZWNvcmQiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCIkUGF0aCIsInB1c2giLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwibGluZUl0ZW1Db2xsZWN0aW9uIiwib0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXAiLCJyZWNvcmQiLCJzS2V5IiwiU2VtYW50aWNPYmplY3QiLCJBY3Rpb24iLCJSZXF1aXJlc0NvbnRleHQiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsInBhdGgiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0VWlMaW5lSXRlbSIsInByZXNlbnRhdGlvbkNvbnRleHQiLCJnZXRVaUNvbnRyb2wiLCJnZXRVaUxpbmVJdGVtT2JqZWN0IiwibGluZUl0ZW1PclByZXNlbnRhdGlvbkNvbnRleHQiLCJjb252ZXJ0ZWRNZXRhRGF0YSIsImxpbmVJdGVtT3JQcmVzZW50YXRpb25PYmplY3QiLCJyZXNvbHZlUGF0aCIsImdldFBhdGgiLCJ0YXJnZXQiLCJ2aXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwibGluZUl0ZW1PYmplY3QiLCJpdGVtIiwiJHRhcmdldCIsInRlcm0iLCJjcmVhdGUkU2VsZWN0IiwidGFibGUiLCJzZWxlY3RlZEZpZWxkcyIsImxpbmVJdGVtQ29udGV4dCIsIm1ldGFQYXRoIiwicHVzaEZpZWxkIiwiZmllbGQiLCJpbmNsdWRlcyIsInB1c2hGaWVsZExpc3QiLCJmaWVsZHMiLCJjb2x1bW5zIiwidGFibGVEZWZpbml0aW9uIiwicHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zIiwiZ2V0UHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zIiwicHJlc2VudGF0aW9uQW5ub3RhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsIm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMiLCJhcHBsaWNhYmxlUHJvcGVydGllcyIsIl9maWx0ZXJOb25BcHBsaWNhYmxlUHJvcGVydGllcyIsImNvbGxlY3Rpb24iLCJ0YXJnZXRDb2xsZWN0aW9uIiwiY29sbGVjdGlvbkVudGl0eSIsImVudGl0eVR5cGUiLCJ0YXJnZXRUeXBlIiwiYVNlbWFudGljS2V5cyIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiU2VtYW50aWNLZXkiLCJvU2VtYW50aWNLZXkiLCJjb250ZXh0T2JqZWN0UGF0aCIsInRhcmdldEVudGl0eVNldCIsIkNhcGFiaWxpdGllcyIsIkRlbGV0ZVJlc3RyaWN0aW9ucyIsIkRlbGV0YWJsZSIsIlVwZGF0ZVJlc3RyaWN0aW9ucyIsIlVwZGF0YWJsZSIsImpvaW4iLCJnZXRDb2x1bW5XaWR0aCIsIm9UaGlzIiwiY29sdW1uIiwiZGF0YUZpZWxkIiwiZGF0YUZpZWxkQWN0aW9uVGV4dCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJ1c2VSZW1Vbml0IiwibWljcm9DaGFydFRpdGxlIiwid2lkdGgiLCJlbmFibGVBdXRvQ29sdW1uV2lkdGgiLCJnZXRDb2x1bW5XaWR0aEZvckltYWdlIiwiZ2V0Q29sdW1uV2lkdGhGb3JEYXRhRmllbGQiLCJjb21waWxlRXhwcmVzc2lvbiIsImZvcm1hdFJlc3VsdCIsInBhdGhJbk1vZGVsIiwibmFtZSIsIlRhYmxlRm9ybWF0dGVyIiwiVmFsdWUiLCJkYXRhVHlwZSIsInR5cGUiLCJnZXRFZGl0TW9kZSIsIkVkaXRNb2RlIiwiRGlzcGxheSIsImhhc1RleHRBbm5vdGF0aW9uIiwiaGFzVGV4dCIsIkNvcmUiLCJNZWRpYVR5cGUiLCJpc0ltYWdlVVJMIiwib01pY3JvQ2hhcnRUaXRsZSIsIlRhcmdldCIsIiRBbm5vdGF0aW9uUGF0aCIsIm5UbXBUZXh0V2lkdGgiLCJTaXplSGVscGVyIiwiZ2V0QnV0dG9uV2lkdGgiLCJMYWJlbCIsInRvU3RyaW5nIiwiblRtcFZpc3VhbGl6YXRpb25XaWR0aCIsIlRhYmxlU2l6ZUhlbHBlciIsImdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsInByb3BlcnR5V2lkdGgiLCJnZXRDb2x1bW5XaWR0aEZvckNoYXJ0IiwiY29sdW1uTGFiZWxXaWR0aCIsImNoYXJ0U2l6ZSIsImdldENoYXJ0U2l6ZSIsImdldFNob3dPbmx5Q2hhcnQiLCJUaXRsZSIsIkRlc2NyaXB0aW9uIiwidG1wVGV4dCIsInRpdGxlU2l6ZSIsInRtcFdpZHRoIiwiZ2V0TWFyZ2luQ2xhc3MiLCJvQ29sbGVjdGlvbiIsIm9EYXRhRmllbGQiLCJzVmlzdWFsaXphdGlvbiIsInNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJzQmluZGluZ0V4cHJlc3Npb24iLCJzQ2xhc3MiLCJzSGlkZGVuRXhwcmVzc2lvblJlc3VsdCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0VkJveFZpc2liaWxpdHkiLCJmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJmaWVsZEdyb3VwIiwiYWxsU3RhdGljIiwiaGlkZGVuUGF0aHMiLCJoaWRkZW5Bbm5vdGF0aW9uVmFsdWUiLCJoYXNBbnlQYXRoRXhwcmVzc2lvbnMiLCJjb25zdGFudCIsImhhc0FsbEhpZGRlblN0YXRpY0V4cHJlc3Npb25zIiwiaWZFbHNlIiwiZm9ybWF0SGlkZGVuRmlsdGVycyIsIm9IaWRkZW5GaWx0ZXIiLCJleCIsImdldEVsZW1lbnRTdGFibGVJZCIsInRhYmxlSWQiLCJlbGVtZW50SWQiLCJkYXRhRmllbGRQYXJ0IiwiZ2VuZXJhdGUiLCJnZXRDb2x1bW5TdGFibGVJZCIsImlkIiwiZ2V0RmllbGRHcm91cExhYmVsU3RhYmxlSWQiLCJwcm9wZXJ0aWVzIiwiY29sbGVjdGlvbkNvbnRleHQiLCJmaWx0ZXIiLCJzUHJvcGVydHlQYXRoIiwicHJvcGVydHkiLCJnZXRSb3dzQmluZGluZ0luZm8iLCJkYXRhTW9kZWxQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsIm9Sb3dCaW5kaW5nIiwidWk1b2JqZWN0Iiwic3VzcGVuZGVkIiwiQ29tbW9uSGVscGVyIiwiYWRkU2luZ2xlUXVvdGVzIiwicGFyYW1ldGVycyIsIiRjb3VudCIsImV2ZW50cyIsImVuYWJsZSRzZWxlY3QiLCJzU2VsZWN0IiwiJHNlbGVjdCIsImVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCIsIiQkZ2V0S2VlcEFsaXZlQ29udGV4dCIsIiQkZ3JvdXBJZCIsIiQkdXBkYXRlR3JvdXBJZCIsIiQkb3duUmVxdWVzdCIsIiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMiLCJwYXRjaFNlbnQiLCJkYXRhUmVjZWl2ZWQiLCJkYXRhUmVxdWVzdGVkIiwiY3JlYXRlQWN0aXZhdGUiLCJvbkNvbnRleHRDaGFuZ2UiLCJjaGFuZ2UiLCJvYmplY3RUb1N0cmluZyIsInZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHMiLCJvRmllbGRWYWxpZGl0eU9iamVjdCIsIk9iamVjdCIsImtleXMiLCJldmVyeSIsImtleSIsInByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJlbnRpdHlTZXROYW1lIiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYWN0aW9uQ29udGV4dCIsImlzTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsInRhcmdldEVudGl0eVR5cGVOYW1lIiwidGFyZ2V0RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInN0YXRpY0FjdGlvbiIsInBhcmFtcyIsImNvbnRleHRzIiwiYlN0YXRpY0FjdGlvbiIsImFwcGxpY2FibGVDb250ZXh0cyIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsImludm9jYXRpb25Hcm91cGluZyIsIkludm9jYXRpb25Hcm91cGluZyIsIiRFbnVtTWVtYmVyIiwiY29udHJvbElkIiwibGFiZWwiLCJmbiIsInJlZiIsImlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZCIsInJlcXVpcmVzQ29udGV4dCIsImVuYWJsZU9uU2VsZWN0IiwiYWN0aW9uTmFtZSIsImFubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlIiwiaXNTdGF0aWNBY3Rpb24iLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwicGFyc2UiLCJoYXNPd25Qcm9wZXJ0eSIsImRhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uIiwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwiQWN0aW9uSGVscGVyIiwiZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24iLCJpc0RhdGFGaWVsZEZvcklCTkVuYWJsZWQiLCJpc05hdmlnYXRpb25BdmFpbGFibGUiLCJpc0FuYWx5dGljYWxUYWJsZSIsImVuYWJsZUFuYWx5dGljcyIsImVudGl0eVNldCIsIm1ldGFNb2RlbCIsImdldE1vZGVsIiwiTG9nIiwid2FybmluZyIsImRhdGFGaWVsZEZvcklCTkVuYWJsZWRFeHByZXNzaW9uIiwicHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvbiIsImJDbWRFeGVjdXRpb25GbGFnIiwic0NyZWF0aW9uTW9kZSIsImNyZWF0aW9uTW9kZSIsIm9QYXJhbXMiLCJzTWRjVGFibGUiLCJzUm93QmluZGluZyIsIkV4dGVybmFsIiwib3V0Ym91bmQiLCJjcmVhdGVPdXRib3VuZCIsIkNyZWF0aW9uUm93IiwiY3JlYXRpb25Sb3ciLCJjcmVhdGVBdEVuZCIsIk5ld1BhZ2UiLCJjcmVhdGVOZXdBY3Rpb24iLCJuZXdBY3Rpb24iLCJJbmxpbmVDcmVhdGlvblJvd3MiLCJnZW5lcmF0ZUZ1bmN0aW9uIiwiZ2V0SUJORGF0YSIsIm91dGJvdW5kRGV0YWlsIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJvSUJORGF0YSIsInNlbWFudGljT2JqZWN0IiwiX2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b24iLCJmdWxsQ29udGV4dFBhdGgiLCJleHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiaXNDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwidmFsdWVFeHByZXNzaW9uIiwiZm9ybWF0VmFsdWVSZWN1cnNpdmVseSIsInByZXNzRXZlbnRGb3JEZWxldGVCdXR0b24iLCJzRW50aXR5U2V0TmFtZSIsIm9IZWFkZXJJbmZvIiwiZnVsbGNvbnRleHRQYXRoIiwic0RlbGV0YWJsZUNvbnRleHRzIiwic1RpdGxlRXhwcmVzc2lvbiIsInNEZXNjcmlwdGlvbkV4cHJlc3Npb24iLCJ1blNhdmVkQ29udGV4dHMiLCJsb2NrZWRDb250ZXh0cyIsImNyZWF0ZU1vZGVDb250ZXh0cyIsImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUiLCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsInNlbGVjdGVkQ29udGV4dHMiLCJzZXRIZWFkZXJMYWJlbFZpc2liaWxpdHkiLCJkYXRhZmllbGQiLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwic29tZSIsIm9EQyIsImdldFRleHRPbkFjdGlvbkZpZWxkIiwib0NvbnRleHQiLCJjb250ZXh0Iiwic1BhdGhEYXRhRmllbGRzIiwiYU11bHRpcGxlTGFiZWxzIiwiaSIsInJlZHVjZSIsImEiLCJiIiwiX2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzIiwib0NvbHVtbiIsInRhYmxlVHlwZSIsInNldHRpbmdzIiwibWljcm9DaGFydFNpemUiLCJzaG93TWljcm9DaGFydExhYmVsIiwiZ2V0RGVsZWdhdGUiLCJpc0FMUCIsImVudGl0eU5hbWUiLCJvRGVsZWdhdGUiLCJjb250cm9sIiwiRXJyb3IiLCJwYXlsb2FkIiwiY29sbGVjdGlvbk5hbWUiLCJoaWVyYXJjaHlRdWFsaWZpZXIiLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJhbm5vdGF0aW9uIiwic2V0SUJORW5hYmxlbWVudCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJzZXRQcm9wZXJ0eSIsImJFbmFibGVkIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInNQcm9wZXJ0eSIsIm9TZWxlY3RlZENvbnRleHQiLCJlbmFibGVGYXN0Q3JlYXRpb25Sb3ciLCJvRmFzdENyZWF0aW9uUm93Iiwic1BhdGgiLCJvTW9kZWwiLCJvRmluYWxVSVN0YXRlIiwib0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nIiwib0Zhc3RDcmVhdGlvbkNvbnRleHQiLCJnZXRQcm9wZXJ0eSIsImlzRGVsZXRlZCIsImJpbmRMaXN0IiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJjcmVhdGVkIiwiZSIsInRyYWNlIiwib0Vycm9yIiwiZXJyb3IiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnZlcnRlZE1ldGFkYXRhLCBFbnRpdHlTZXQsIE5hdmlnYXRpb25Qcm9wZXJ0eSwgUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQge1xuXHREYXRhRmllbGQsXG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZEZvckFjdGlvbixcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRGaWVsZEdyb3VwLFxuXHRMaW5lSXRlbSxcblx0UHJlc2VudGF0aW9uVmFyaWFudCxcblx0UHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdFVJQW5ub3RhdGlvblRlcm1zLFxuXHRVSUFubm90YXRpb25UeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGdldFVpQ29udHJvbCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHtcblx0QW5ub3RhdGlvblRhYmxlQ29sdW1uLFxuXHRUYWJsZUNvbHVtbixcblx0VGFibGVGaWx0ZXJzQ29uZmlndXJhdGlvbixcblx0VGFibGVWaXN1YWxpemF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgVGFibGVGb3JtYXR0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVGFibGVGb3JtYXR0ZXJcIjtcbmltcG9ydCB7XG5cdENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGZuLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbnN0YW50LFxuXHRpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbixcblx0cGF0aEluTW9kZWwsXG5cdHJlZlxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IFNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaGFzVGV4dCwgaXNJbWFnZVVSTCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgeyBnZXRFZGl0TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgdGFibGVEZWxlZ2F0ZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgeyBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgVGFibGVCbG9jayBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZS5ibG9ja1wiO1xuaW1wb3J0IFRhYmxlU2l6ZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZVNpemVIZWxwZXJcIjtcbmltcG9ydCBFZGl0TW9kZSBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0VkaXRNb2RlXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB2NENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxudHlwZSBIaWRkZW4gPSB7IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiOiBib29sZWFuIHwgeyAkUGF0aD86IHN0cmluZyB9IH07XG5cbmNvbnN0IENyZWF0aW9uTW9kZSA9IEZFTGlicmFyeS5DcmVhdGlvbk1vZGU7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHVzZWQgYnkgdGhlIGNvbnRyb2wgbGlicmFyeSBmb3IgT0RhdGEtc3BlY2lmaWMgaGFuZGxpbmcgKE9EYXRhIFY0KVxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbmNvbnN0IFRhYmxlSGVscGVyID0ge1xuXHQvKipcblx0ICogQ2hlY2sgaWYgYSBnaXZlbiBhY3Rpb24gaXMgc3RhdGljLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0FjdGlvbkNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHJldHVybnMgUmV0dXJucyAndHJ1ZScgaWYgYWN0aW9uIGlzIHN0YXRpYywgZWxzZSAnZmFsc2UnXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2lzU3RhdGljQWN0aW9uOiBmdW5jdGlvbiAob0FjdGlvbkNvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCBTdHJpbmcpIHtcblx0XHRsZXQgb0FjdGlvbjtcblx0XHRpZiAob0FjdGlvbkNvbnRleHQpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG9BY3Rpb25Db250ZXh0KSkge1xuXHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZSA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZShzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdGlmIChzRW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uQ29udGV4dC5maW5kKGZ1bmN0aW9uIChhY3Rpb246IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjdGlvbi4kSXNCb3VuZCAmJiBhY3Rpb24uJFBhcmFtZXRlclswXS4kVHlwZSA9PT0gc0VudGl0eVR5cGU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhpcyBpcyBqdXN0IG9uZSAtIE9LIHdlIHRha2UgaXQuIElmIGl0J3MgbW9yZSBpdCdzIGFjdHVhbGx5IGEgd3JvbmcgdXNhZ2UgYnkgdGhlIGFwcFxuXHRcdFx0XHRcdC8vIGFzIHdlIHVzZWQgdGhlIGZpcnN0IG9uZSBhbGwgdGhlIHRpbWUgd2Uga2VlcCBpdCBhcyBpdCBpc1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uQ29udGV4dFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0FjdGlvbiA9IG9BY3Rpb25Db250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAhIW9BY3Rpb24gJiYgb0FjdGlvbi4kSXNCb3VuZCAmJiBvQWN0aW9uLiRQYXJhbWV0ZXJbMF0uJGlzQ29sbGVjdGlvbjtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSBlbnRpdHkgdHlwZSBvZiBhbiBhY3Rpb24gb3ZlcmxvYWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuXHQgKiBAcmV0dXJucyBUaGUgZW50aXR5IHR5cGUgdXNlZCBpbiB0aGUgYWN0aW9uIG92ZXJsb2FkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZTogZnVuY3Rpb24gKHNBY3Rpb25OYW1lOiBhbnkpIHtcblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Y29uc3QgYVBhcnRzID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpO1xuXHRcdFx0cmV0dXJuIGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0ucmVwbGFjZUFsbChcIilcIiwgXCJcIik7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBhY3Rpb24gaXMgb3ZlcmxvYWRlZCBvbiBhIGRpZmZlcmVudCBlbnRpdHkgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG5cdCAqIEBwYXJhbSBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIG9mIHRoZSBhbm5vdGF0aW9uIHRhcmdldC5cblx0ICogQHJldHVybnMgUmV0dXJucyAndHJ1ZScgaWYgdGhlIGFjdGlvbiBpcyBvdmVybG9hZGVkIHdpdGggYSBkaWZmZXJlbnQgZW50aXR5IHR5cGUsIGVsc2UgJ2ZhbHNlJy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9pc0FjdGlvbk92ZXJsb2FkT25EaWZmZXJlbnRUeXBlOiBmdW5jdGlvbiAoc0FjdGlvbk5hbWU6IGFueSwgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlOiBhbnkpIHtcblx0XHRjb25zdCBzRW50aXR5VHlwZSA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZShzQWN0aW9uTmFtZSk7XG5cdFx0cmV0dXJuICEhc0VudGl0eVR5cGUgJiYgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlICE9PSBzRW50aXR5VHlwZTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiB0aGUgZmllbGRzIGxpc3RlZCBieSB0aGUgcHJvcGVydHkgUmVxdWVzdEF0TGVhc3QgaW4gdGhlIFByZXNlbnRhdGlvblZhcmlhbnQgLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ByZXNlbnRhdGlvblZhcmlhbnQgVGhlIGFubm90YXRpb24gcmVsYXRlZCB0byBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QcmVzZW50YXRpb25WYXJpYW50LlxuXHQgKiBAcmV0dXJucyBUaGUgZmllbGRzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudDogZnVuY3Rpb24gKG9QcmVzZW50YXRpb25WYXJpYW50OiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gb1ByZXNlbnRhdGlvblZhcmlhbnQuUmVxdWVzdEF0TGVhc3Q/Lm1hcCgob1JlcXVlc3RlZCkgPT4gb1JlcXVlc3RlZC52YWx1ZSkgfHwgW107XG5cdH0sXG5cdGdldE5hdmlnYXRpb25BdmFpbGFibGVGaWVsZHNGcm9tTGluZUl0ZW06IGZ1bmN0aW9uIChhTGluZUl0ZW1Db250ZXh0OiBDb250ZXh0KTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IGFTZWxlY3RlZEZpZWxkc0FycmF5OiBzdHJpbmdbXSA9IFtdO1xuXHRcdCgoYUxpbmVJdGVtQ29udGV4dC5nZXRPYmplY3QoKSBhcyBBcnJheTxhbnk+KSB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbiAob1JlY29yZDogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9SZWNvcmQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiAmJlxuXHRcdFx0XHQhb1JlY29yZC5JbmxpbmUgJiZcblx0XHRcdFx0IW9SZWNvcmQuRGV0ZXJtaW5pbmcgJiZcblx0XHRcdFx0b1JlY29yZC5OYXZpZ2F0aW9uQXZhaWxhYmxlPy4kUGF0aFxuXHRcdFx0KSB7XG5cdFx0XHRcdGFTZWxlY3RlZEZpZWxkc0FycmF5LnB1c2gob1JlY29yZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLiRQYXRoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYVNlbGVjdGVkRmllbGRzQXJyYXk7XG5cdH0sXG5cblx0Z2V0TmF2aWdhdGlvbkF2YWlsYWJsZU1hcDogZnVuY3Rpb24gKGxpbmVJdGVtQ29sbGVjdGlvbjogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1tdIHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3Qgb0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXA6IGFueSA9IHt9O1xuXHRcdGxpbmVJdGVtQ29sbGVjdGlvbj8uZm9yRWFjaCgocmVjb3JkKSA9PiB7XG5cdFx0XHRpZiAoXCJTZW1hbnRpY09iamVjdFwiIGluIHJlY29yZCkge1xuXHRcdFx0XHRjb25zdCBzS2V5ID0gYCR7cmVjb3JkLlNlbWFudGljT2JqZWN0fS0ke3JlY29yZC5BY3Rpb259YDtcblx0XHRcdFx0aWYgKHJlY29yZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmICFyZWNvcmQuSW5saW5lICYmIHJlY29yZC5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdFx0XHRpZiAocmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0b0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXBbc0tleV0gPSBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihyZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZSlcblx0XHRcdFx0XHRcdFx0PyAocmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUgYXMgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPGJvb2xlYW4+KS5wYXRoXG5cdFx0XHRcdFx0XHRcdDogcmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBVSS5MaW5lSXRlbS5cblx0ICpcblx0ICogQHBhcmFtIHByZXNlbnRhdGlvbkNvbnRleHQgVGhlIHByZXNlbnRhdGlvbiBjb250ZXh0IChlaXRoZXIgYSBwcmVzZW50YXRpb24gdmFyaWFudCBvciBhIFVJLkxpbmVJdGVtKVxuXHQgKiBAcmV0dXJucyBUaGUgY29udGV4dCBvZiB0aGUgVUkuTGluZUl0ZW1cblx0ICovXG5cdGdldFVpTGluZUl0ZW06IGZ1bmN0aW9uIChwcmVzZW50YXRpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0cmV0dXJuIGdldFVpQ29udHJvbChwcmVzZW50YXRpb25Db250ZXh0LCBgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YCk7XG5cdH0sXG5cblx0Z2V0VWlMaW5lSXRlbU9iamVjdDogZnVuY3Rpb24gKFxuXHRcdGxpbmVJdGVtT3JQcmVzZW50YXRpb25Db250ZXh0OiBDb250ZXh0LFxuXHRcdGNvbnZlcnRlZE1ldGFEYXRhOiBDb252ZXJ0ZWRNZXRhZGF0YVxuXHQpOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzW10gfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGxpbmVJdGVtT3JQcmVzZW50YXRpb25PYmplY3QgPSBjb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChsaW5lSXRlbU9yUHJlc2VudGF0aW9uQ29udGV4dC5nZXRQYXRoKCkpLnRhcmdldCBhc1xuXHRcdFx0fCBQcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHR8IExpbmVJdGVtO1xuXHRcdGlmICghbGluZUl0ZW1PclByZXNlbnRhdGlvbk9iamVjdCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IChjb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChsaW5lSXRlbU9yUHJlc2VudGF0aW9uQ29udGV4dC5nZXRQYXRoKCkpLnRhcmdldCBhcyBQcmVzZW50YXRpb25WYXJpYW50VHlwZSlcblx0XHRcdC5WaXN1YWxpemF0aW9ucztcblxuXHRcdGNvbnN0IGxpbmVJdGVtT2JqZWN0ID0gKFxuXHRcdFx0dmlzdWFsaXphdGlvbnNcblx0XHRcdFx0PyB2aXN1YWxpemF0aW9ucz8uZmluZCgoaXRlbSkgPT4gaXRlbS52YWx1ZS5pbmRleE9mKFwiQFwiICsgVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0pID09PSAwKT8uJHRhcmdldFxuXHRcdFx0XHQ6IGxpbmVJdGVtT3JQcmVzZW50YXRpb25PYmplY3Rcblx0XHQpIGFzIExpbmVJdGVtO1xuXHRcdHJldHVybiBsaW5lSXRlbU9iamVjdD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gPyBsaW5lSXRlbU9iamVjdCA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIHNlbGVjdCBxdWVyeSB3aXRoIHRoZSBzZWxlY3RlZCBmaWVsZHMgZnJvbSB0aGUgcGFyYW1ldGVycyB0aGF0IHdlcmUgcGFzc2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHJldHVybnMgVGhlICdzZWxlY3QnIHF1ZXJ5IHRoYXQgaGFzIHRoZSBzZWxlY3RlZCBmaWVsZHMgZnJvbSB0aGUgcGFyYW1ldGVycyB0aGF0IHdlcmUgcGFzc2VkXG5cdCAqL1xuXHRjcmVhdGUkU2VsZWN0OiBmdW5jdGlvbiAodGFibGU6IFRhYmxlQmxvY2spIHtcblx0XHRjb25zdCBzZWxlY3RlZEZpZWxkczogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBsaW5lSXRlbUNvbnRleHQgPSBUYWJsZUhlbHBlci5nZXRVaUxpbmVJdGVtKHRhYmxlLm1ldGFQYXRoKTtcblx0XHRmdW5jdGlvbiBwdXNoRmllbGQoZmllbGQ6IHN0cmluZykge1xuXHRcdFx0aWYgKGZpZWxkICYmICFzZWxlY3RlZEZpZWxkcy5pbmNsdWRlcyhmaWVsZCkgJiYgZmllbGQuaW5kZXhPZihcIi9cIikgIT09IDApIHtcblx0XHRcdFx0Ly8gRG8gbm90IGFkZCBzaW5nbGV0b24gcHJvcGVydHkgKHdpdGggYWJzb2x1dGUgcGF0aCkgdG8gJHNlbGVjdFxuXHRcdFx0XHRzZWxlY3RlZEZpZWxkcy5wdXNoKGZpZWxkKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoRmllbGRMaXN0KGZpZWxkczogc3RyaW5nW10pIHtcblx0XHRcdGlmIChmaWVsZHM/Lmxlbmd0aCkge1xuXHRcdFx0XHRmaWVsZHMuZm9yRWFjaChwdXNoRmllbGQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBjb2x1bW5zID0gdGFibGUudGFibGVEZWZpbml0aW9uLmNvbHVtbnM7XG5cdFx0Y29uc3QgcHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zID0gdGhpcy5nZXRQcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnMoY29sdW1ucyk7XG5cdFx0aWYgKHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucz8ubGVuZ3RoKSB7XG5cdFx0XHRwdXNoRmllbGRMaXN0KHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKGxpbmVJdGVtQ29udGV4dC5nZXRQYXRoKCkuaW5kZXhPZihgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YCkgPiAtMSkge1xuXHRcdFx0Ly8gRG9uJ3QgcHJvY2VzcyBFbnRpdHlUeXBlIHdpdGhvdXQgTGluZUl0ZW1cblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbkFubm90YXRpb24gPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGFibGUubWV0YVBhdGgpLnRhcmdldE9iamVjdDtcblx0XHRcdGNvbnN0IG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMgPSAodGFibGUudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMgfHwgXCJcIikuc3BsaXQoXCIsXCIpO1xuXHRcdFx0Y29uc3QgYXBwbGljYWJsZVByb3BlcnRpZXMgPSBUYWJsZUhlbHBlci5fZmlsdGVyTm9uQXBwbGljYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcywgdGFibGUuY29sbGVjdGlvbik7XG5cdFx0XHRjb25zdCB0YXJnZXRDb2xsZWN0aW9uID1cblx0XHRcdFx0KHRhYmxlLmNvbGxlY3Rpb25FbnRpdHkgYXMgRW50aXR5U2V0KS5lbnRpdHlUeXBlIHx8ICh0YWJsZS5jb2xsZWN0aW9uRW50aXR5IGFzIE5hdmlnYXRpb25Qcm9wZXJ0eSkudGFyZ2V0VHlwZTtcblx0XHRcdGNvbnN0IGFTZW1hbnRpY0tleXM6IHN0cmluZ1tdID0gKHRhcmdldENvbGxlY3Rpb24uYW5ub3RhdGlvbnMuQ29tbW9uPy5TZW1hbnRpY0tleSB8fCBbXSkubWFwKFxuXHRcdFx0XHQob1NlbWFudGljS2V5OiBhbnkpID0+IG9TZW1hbnRpY0tleS52YWx1ZSBhcyBzdHJpbmdcblx0XHRcdCk7XG5cblx0XHRcdGlmIChwcmVzZW50YXRpb25Bbm5vdGF0aW9uPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUHJlc2VudGF0aW9uVmFyaWFudFR5cGUpIHtcblx0XHRcdFx0cHVzaEZpZWxkTGlzdChUYWJsZUhlbHBlci5nZXRGaWVsZHNSZXF1ZXN0ZWRCeVByZXNlbnRhdGlvblZhcmlhbnQocHJlc2VudGF0aW9uQW5ub3RhdGlvbikpO1xuXHRcdFx0fVxuXG5cdFx0XHRwdXNoRmllbGRMaXN0KFRhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVGaWVsZHNGcm9tTGluZUl0ZW0obGluZUl0ZW1Db250ZXh0KSk7XG5cdFx0XHRwdXNoRmllbGRMaXN0KGFwcGxpY2FibGVQcm9wZXJ0aWVzKTtcblx0XHRcdHB1c2hGaWVsZExpc3QoYVNlbWFudGljS2V5cyk7XG5cdFx0XHRwdXNoRmllbGQoXG5cdFx0XHRcdChcblx0XHRcdFx0XHQodGFibGUuY29udGV4dE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/LkRlbGV0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0XHRcdFx0Py5EZWxldGFibGUgYXMgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPGJvb2xlYW4+XG5cdFx0XHRcdCk/LnBhdGhcblx0XHRcdCk7XG5cdFx0XHRwdXNoRmllbGQoXG5cdFx0XHRcdChcblx0XHRcdFx0XHQodGFibGUuY29udGV4dE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/LlVwZGF0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0XHRcdFx0Py5VcGRhdGFibGUgYXMgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPGJvb2xlYW4+XG5cdFx0XHRcdCk/LnBhdGhcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBzZWxlY3RlZEZpZWxkcy5qb2luKFwiLFwiKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBjb2x1bW4ncyB3aWR0aCBpZiBkZWZpbmVkIGZyb20gbWFuaWZlc3Qgb3IgZnJvbSBjdXN0b21pemF0aW9uIHZpYSBhbm5vdGF0aW9ucy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtbldpZHRoXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSBUYWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcGFyYW0gY29sdW1uIERlZmluZWQgd2lkdGggb2YgdGhlIGNvbHVtbiwgd2hpY2ggaXMgdGFrZW4gd2l0aCBwcmlvcml0eSBpZiBub3QgbnVsbCwgdW5kZWZpbmVkIG9yIGVtcHR5XG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGRlZmluaXRpb24gb2JqZWN0XG5cdCAqIEBwYXJhbSBkYXRhRmllbGRBY3Rpb25UZXh0IERhdGFGaWVsZCdzIHRleHQgZnJvbSBidXR0b25cblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggVGhlIG9iamVjdCBwYXRoIG9mIHRoZSBkYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSB1c2VSZW1Vbml0IEluZGljYXRlcyBpZiB0aGUgcmVtIHVuaXQgbXVzdCBiZSBjb25jYXRlbmF0ZWQgd2l0aCB0aGUgY29sdW1uIHdpZHRoIHJlc3VsdFxuXHQgKiBAcGFyYW0gbWljcm9DaGFydFRpdGxlIFRoZSBvYmplY3QgY29udGFpbmluZyB0aXRsZSBhbmQgZGVzY3JpcHRpb24gb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHJldHVybnMgLSBDb2x1bW4gd2lkdGggaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIHdpZHRoIGlzIHNldCB0byBhdXRvXG5cdCAqL1xuXHRnZXRDb2x1bW5XaWR0aDogZnVuY3Rpb24gKFxuXHRcdG9UaGlzOiB0YWJsZURlbGVnYXRlTW9kZWwsXG5cdFx0Y29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdFx0ZGF0YUZpZWxkOiBEYXRhRmllbGQgfCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHwgRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdGRhdGFGaWVsZEFjdGlvblRleHQ6IHN0cmluZyxcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdHVzZVJlbVVuaXQ6IGJvb2xlYW4sXG5cdFx0bWljcm9DaGFydFRpdGxlPzogYW55XG5cdCkge1xuXHRcdGlmIChjb2x1bW4ud2lkdGgpIHtcblx0XHRcdHJldHVybiBjb2x1bW4ud2lkdGg7XG5cdFx0fVxuXHRcdGlmIChvVGhpcy5lbmFibGVBdXRvQ29sdW1uV2lkdGggPT09IHRydWUpIHtcblx0XHRcdGxldCB3aWR0aDtcblx0XHRcdHdpZHRoID1cblx0XHRcdFx0dGhpcy5nZXRDb2x1bW5XaWR0aEZvckltYWdlKGRhdGFNb2RlbE9iamVjdFBhdGgpIHx8XG5cdFx0XHRcdHRoaXMuZ2V0Q29sdW1uV2lkdGhGb3JEYXRhRmllbGQob1RoaXMsIGNvbHVtbiwgZGF0YUZpZWxkLCBkYXRhRmllbGRBY3Rpb25UZXh0LCBkYXRhTW9kZWxPYmplY3RQYXRoLCBtaWNyb0NoYXJ0VGl0bGUpIHx8XG5cdFx0XHRcdHVuZGVmaW5lZDtcblx0XHRcdGlmICh3aWR0aCkge1xuXHRcdFx0XHRyZXR1cm4gdXNlUmVtVW5pdCA/IGAke3dpZHRofXJlbWAgOiB3aWR0aDtcblx0XHRcdH1cblx0XHRcdHdpZHRoID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGZvcm1hdFJlc3VsdChcblx0XHRcdFx0XHRbcGF0aEluTW9kZWwoXCIvZWRpdE1vZGVcIiwgXCJ1aVwiKSwgcGF0aEluTW9kZWwoXCJ0YWJsZVByb3BlcnRpZXNBdmFpbGFibGVcIiwgXCJpbnRlcm5hbFwiKSwgY29sdW1uLm5hbWUsIHVzZVJlbVVuaXRdLFxuXHRcdFx0XHRcdFRhYmxlRm9ybWF0dGVyLmdldENvbHVtbldpZHRoXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gd2lkdGg7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHdpZHRoIG9mIHRoZSBjb2x1bW4gY29udGFpbmluZyBhbiBpbWFnZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtbldpZHRoRm9ySW1hZ2Vcblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggVGhlIGRhdGEgbW9kZWwgb2JqZWN0IHBhdGhcblx0ICogQHJldHVybnMgLSBDb2x1bW4gd2lkdGggaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIG51bGwgKHRoZSB3aWR0aCBpcyB0cmVhdGVkIGFzIGEgcmVtIHZhbHVlKVxuXHQgKi9cblx0Z2V0Q29sdW1uV2lkdGhGb3JJbWFnZTogZnVuY3Rpb24gKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBudW1iZXIgfCBudWxsIHtcblx0XHRsZXQgd2lkdGg6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXHRcdGNvbnN0IGFubm90YXRpb25zID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucztcblx0XHRjb25zdCBkYXRhVHlwZSA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5WYWx1ZT8uJHRhcmdldD8udHlwZTtcblx0XHRpZiAoXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uVmFsdWUgJiZcblx0XHRcdGdldEVkaXRNb2RlKFxuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZT8uJHRhcmdldCxcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFxuXHRcdFx0KSA9PT0gRWRpdE1vZGUuRGlzcGxheVxuXHRcdCkge1xuXHRcdFx0Y29uc3QgaGFzVGV4dEFubm90YXRpb24gPSBoYXNUZXh0KGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQpO1xuXHRcdFx0aWYgKGRhdGFUeXBlID09PSBcIkVkbS5TdHJlYW1cIiAmJiAhaGFzVGV4dEFubm90YXRpb24gJiYgYW5ub3RhdGlvbnM/LkNvcmU/Lk1lZGlhVHlwZT8uaW5jbHVkZXMoXCJpbWFnZS9cIikpIHtcblx0XHRcdFx0d2lkdGggPSA2LjI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdGFubm90YXRpb25zICYmXG5cdFx0XHQoaXNJbWFnZVVSTChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uVmFsdWU/LiR0YXJnZXQpIHx8IGFubm90YXRpb25zPy5Db3JlPy5NZWRpYVR5cGU/LmluY2x1ZGVzKFwiaW1hZ2UvXCIpKVxuXHRcdCkge1xuXHRcdFx0d2lkdGggPSA2LjI7XG5cdFx0fVxuXHRcdHJldHVybiB3aWR0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbiBjb250YWluaW5nIHRoZSBEYXRhRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5XaWR0aEZvckRhdGFGaWVsZFxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgVGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHBhcmFtIGNvbHVtbiBEZWZpbmVkIHdpZHRoIG9mIHRoZSBjb2x1bW4sIHdoaWNoIGlzIHRha2VuIHdpdGggcHJpb3JpdHkgaWYgbm90IG51bGwsIHVuZGVmaW5lZCBvciBlbXB0eVxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIERhdGEgRmllbGRcblx0ICogQHBhcmFtIGRhdGFGaWVsZEFjdGlvblRleHQgRGF0YUZpZWxkJ3MgdGV4dCBmcm9tIGJ1dHRvblxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aFxuXHQgKiBAcGFyYW0gb01pY3JvQ2hhcnRUaXRsZSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHRpdGxlIGFuZCBkZXNjcmlwdGlvbiBvZiB0aGUgTWljcm9DaGFydFxuXHQgKiBAcmV0dXJucyAtIENvbHVtbiB3aWR0aCBpZiBkZWZpbmVkLCBvdGhlcndpc2UgbnVsbCAoIHRoZSB3aWR0aCBpcyB0cmVhdGVkIGFzIGEgcmVtIHZhbHVlKVxuXHQgKi9cblx0Z2V0Q29sdW1uV2lkdGhGb3JEYXRhRmllbGQ6IGZ1bmN0aW9uIChcblx0XHRvVGhpczogdGFibGVEZWxlZ2F0ZU1vZGVsLFxuXHRcdGNvbHVtbjogQW5ub3RhdGlvblRhYmxlQ29sdW1uLFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkIHwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiB8IERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRkYXRhRmllbGRBY3Rpb25UZXh0OiBzdHJpbmcsXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRvTWljcm9DaGFydFRpdGxlPzogYW55XG5cdCk6IG51bWJlciB8IG51bGwge1xuXHRcdGNvbnN0IGFubm90YXRpb25zID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IGRhdGFUeXBlID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlO1xuXHRcdGxldCB3aWR0aDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cdFx0aWYgKFxuXHRcdFx0ZGF0YVR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0ZGF0YVR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8fFxuXHRcdFx0KGRhdGFUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdCgoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pLlRhcmdldCBhcyBhbnkpLiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwfWApID09PSAtMSlcblx0XHQpIHtcblx0XHRcdGxldCBuVG1wVGV4dFdpZHRoO1xuXHRcdFx0blRtcFRleHRXaWR0aCA9XG5cdFx0XHRcdFNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoZGF0YUZpZWxkQWN0aW9uVGV4dCkgfHxcblx0XHRcdFx0U2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChkYXRhRmllbGQ/LkxhYmVsPy50b1N0cmluZygpKSB8fFxuXHRcdFx0XHRTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKGFubm90YXRpb25zPy5MYWJlbCk7XG5cblx0XHRcdC8vIGdldCB3aWR0aCBmb3IgcmF0aW5nIG9yIHByb2dyZXNzIGJhciBkYXRhZmllbGRcblx0XHRcdGNvbnN0IG5UbXBWaXN1YWxpemF0aW9uV2lkdGggPSBUYWJsZVNpemVIZWxwZXIuZ2V0V2lkdGhGb3JEYXRhRmllbGRGb3JBbm5vdGF0aW9uKFxuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFxuXHRcdFx0KS5wcm9wZXJ0eVdpZHRoO1xuXG5cdFx0XHRpZiAoblRtcFZpc3VhbGl6YXRpb25XaWR0aCA+IG5UbXBUZXh0V2lkdGgpIHtcblx0XHRcdFx0d2lkdGggPSBuVG1wVmlzdWFsaXphdGlvbldpZHRoO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0ZGF0YUZpZWxkQWN0aW9uVGV4dCB8fFxuXHRcdFx0XHQoYW5ub3RhdGlvbnMgJiZcblx0XHRcdFx0XHQoYW5ub3RhdGlvbnMuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8fFxuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbnMuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbikpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gQWRkIGFkZGl0aW9uYWwgMS44IHJlbSB0byBhdm9pZCBzaG93aW5nIGVsbGlwc2lzIGluIHNvbWUgY2FzZXMuXG5cdFx0XHRcdG5UbXBUZXh0V2lkdGggKz0gMS44O1xuXHRcdFx0XHR3aWR0aCA9IG5UbXBUZXh0V2lkdGg7XG5cdFx0XHR9XG5cdFx0XHR3aWR0aCA9IHdpZHRoIHx8IHRoaXMuZ2V0Q29sdW1uV2lkdGhGb3JDaGFydChvVGhpcywgY29sdW1uLCBkYXRhRmllbGQsIG5UbXBUZXh0V2lkdGgsIG9NaWNyb0NoYXJ0VGl0bGUpO1xuXHRcdH1cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHdpZHRoIG9mIHRoZSBjb2x1bW4gY29udGFpbmluZyB0aGUgQ2hhcnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5XaWR0aEZvckNoYXJ0XG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSBUYWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcGFyYW0gY29sdW1uIERlZmluZWQgd2lkdGggb2YgdGhlIGNvbHVtbiwgd2hpY2ggaXMgdGFrZW4gd2l0aCBwcmlvcml0eSBpZiBub3QgbnVsbCwgdW5kZWZpbmVkIG9yIGVtcHR5XG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YSBGaWVsZFxuXHQgKiBAcGFyYW0gY29sdW1uTGFiZWxXaWR0aCBUaGUgd2lkdGggb2YgdGhlIGNvbHVtbiBsYWJlbCBvciBidXR0b24gbGFiZWxcblx0ICogQHBhcmFtIG1pY3JvQ2hhcnRUaXRsZSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHRpdGxlIGFuZCB0aGUgZGVzY3JpcHRpb24gb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHJldHVybnMgLSBDb2x1bW4gd2lkdGggaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIG51bGwgKHRoZSB3aWR0aCBpcyB0cmVhdGVkIGFzIGEgcmVtIHZhbHVlKVxuXHQgKi9cblx0Z2V0Q29sdW1uV2lkdGhGb3JDaGFydChvVGhpczogYW55LCBjb2x1bW46IGFueSwgZGF0YUZpZWxkOiBhbnksIGNvbHVtbkxhYmVsV2lkdGg6IG51bWJlciwgbWljcm9DaGFydFRpdGxlOiBhbnkpOiBudW1iZXIgfCBudWxsIHtcblx0XHRsZXQgY2hhcnRTaXplLFxuXHRcdFx0d2lkdGg6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXHRcdGlmIChkYXRhRmllbGQuVGFyZ2V0Py4kQW5ub3RhdGlvblBhdGg/LmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWApICE9PSAtMSkge1xuXHRcdFx0c3dpdGNoICh0aGlzLmdldENoYXJ0U2l6ZShvVGhpcywgY29sdW1uKSkge1xuXHRcdFx0XHRjYXNlIFwiWFNcIjpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA0LjQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJTXCI6XG5cdFx0XHRcdFx0Y2hhcnRTaXplID0gNC42O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiTVwiOlxuXHRcdFx0XHRcdGNoYXJ0U2l6ZSA9IDUuNTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkxcIjpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA2Ljk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y2hhcnRTaXplID0gNS4zO1xuXHRcdFx0fVxuXHRcdFx0Y29sdW1uTGFiZWxXaWR0aCArPSAxLjg7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCF0aGlzLmdldFNob3dPbmx5Q2hhcnQob1RoaXMsIGNvbHVtbikgJiZcblx0XHRcdFx0bWljcm9DaGFydFRpdGxlICYmXG5cdFx0XHRcdChtaWNyb0NoYXJ0VGl0bGUuVGl0bGUubGVuZ3RoIHx8IG1pY3JvQ2hhcnRUaXRsZS5EZXNjcmlwdGlvbi5sZW5ndGgpXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgdG1wVGV4dCA9XG5cdFx0XHRcdFx0bWljcm9DaGFydFRpdGxlLlRpdGxlLmxlbmd0aCA+IG1pY3JvQ2hhcnRUaXRsZS5EZXNjcmlwdGlvbi5sZW5ndGggPyBtaWNyb0NoYXJ0VGl0bGUuVGl0bGUgOiBtaWNyb0NoYXJ0VGl0bGUuRGVzY3JpcHRpb247XG5cdFx0XHRcdGNvbnN0IHRpdGxlU2l6ZSA9IFNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgodG1wVGV4dCkgKyA3O1xuXHRcdFx0XHRjb25zdCB0bXBXaWR0aCA9IHRpdGxlU2l6ZSA+IGNvbHVtbkxhYmVsV2lkdGggPyB0aXRsZVNpemUgOiBjb2x1bW5MYWJlbFdpZHRoO1xuXHRcdFx0XHR3aWR0aCA9IHRtcFdpZHRoO1xuXHRcdFx0fSBlbHNlIGlmIChjb2x1bW5MYWJlbFdpZHRoID4gY2hhcnRTaXplKSB7XG5cdFx0XHRcdHdpZHRoID0gY29sdW1uTGFiZWxXaWR0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpZHRoID0gY2hhcnRTaXplO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYWRkIGEgbWFyZ2luIGNsYXNzIGF0IHRoZSBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0TWFyZ2luQ2xhc3Ncblx0ICogQHBhcmFtIG9Db2xsZWN0aW9uIFRpdGxlIG9mIHRoZSBEYXRhUG9pbnRcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgVmFsdWUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gc1Zpc3VhbGl6YXRpb25cblx0ICogQHBhcmFtIHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgSGlkZGVuIGV4cHJlc3Npb24gY29udGFpbmVkIGluIEZpZWxkR3JvdXBcblx0ICogQHJldHVybnMgQWRqdXN0aW5nIHRoZSBtYXJnaW5cblx0ICovXG5cdGdldE1hcmdpbkNsYXNzOiBmdW5jdGlvbiAob0NvbGxlY3Rpb246IGFueSwgb0RhdGFGaWVsZDogYW55LCBzVmlzdWFsaXphdGlvbjogYW55LCBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zOiBhbnkpIHtcblx0XHRsZXQgc0JpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0c0NsYXNzID0gXCJcIjtcblx0XHRpZiAoSlNPTi5zdHJpbmdpZnkob0NvbGxlY3Rpb25bb0NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0pID09IEpTT04uc3RyaW5naWZ5KG9EYXRhRmllbGQpKSB7XG5cdFx0XHQvL0lmIHJhdGluZyBpbmRpY2F0b3IgaXMgbGFzdCBlbGVtZW50IGluIGZpZWxkZ3JvdXAsIHRoZW4gdGhlIDAuNXJlbSBtYXJnaW4gYWRkZWQgYnkgc2FwTVJJIGNsYXNzIG9mIGludGVyYWN0aXZlIHJhdGluZyBpbmRpY2F0b3Igb24gdG9wIGFuZCBib3R0b20gbXVzdCBiZSBudWxsaWZpZWQuXG5cdFx0XHRpZiAoc1Zpc3VhbGl6YXRpb24gPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0XHRzQ2xhc3MgPSBcInNhcFVpTm9NYXJnaW5Cb3R0b20gc2FwVWlOb01hcmdpblRvcFwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoc1Zpc3VhbGl6YXRpb24gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpIHtcblx0XHRcdC8vSWYgcmF0aW5nIGluZGljYXRvciBpcyBOT1QgdGhlIGxhc3QgZWxlbWVudCBpbiBmaWVsZGdyb3VwLCB0aGVuIHRvIG1haW50YWluIHRoZSAwLjVyZW0gc3BhY2luZyBiZXR3ZWVuIGNvZ2V0TWFyZ2luQ2xhc3NudHJvbHMgKGFzIHBlciBVWCBzcGVjKSxcblx0XHRcdC8vb25seSB0aGUgdG9wIG1hcmdpbiBhZGRlZCBieSBzYXBNUkkgY2xhc3Mgb2YgaW50ZXJhY3RpdmUgcmF0aW5nIGluZGljYXRvciBtdXN0IGJlIG51bGxpZmllZC5cblxuXHRcdFx0c0NsYXNzID0gXCJzYXBVaU5vTWFyZ2luVG9wXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNDbGFzcyA9IFwic2FwVWlUaW55TWFyZ2luQm90dG9tXCI7XG5cdFx0fVxuXG5cdFx0aWYgKHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgJiYgc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyAhPT0gXCJ0cnVlXCIgJiYgc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyAhPT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRjb25zdCBzSGlkZGVuRXhwcmVzc2lvblJlc3VsdCA9IHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMuc3Vic3RyaW5nKFxuXHRcdFx0XHRzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zLmluZGV4T2YoXCJ7PVwiKSArIDIsXG5cdFx0XHRcdHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMubGFzdEluZGV4T2YoXCJ9XCIpXG5cdFx0XHQpO1xuXHRcdFx0c0JpbmRpbmdFeHByZXNzaW9uID0gXCJ7PSBcIiArIHNIaWRkZW5FeHByZXNzaW9uUmVzdWx0ICsgXCIgPyAnXCIgKyBzQ2xhc3MgKyBcIicgOiBcIiArIFwiJydcIiArIFwiIH1cIjtcblx0XHRcdHJldHVybiBzQmluZGluZ0V4cHJlc3Npb247XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzQ2xhc3M7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IFZCb3ggdmlzaWJpbGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGNvbGxlY3Rpb24gQ29sbGVjdGlvbiBvZiBkYXRhIGZpZWxkcyBpbiBWQm94XG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgSGlkZGVuIGV4cHJlc3Npb24gY29udGFpbmVkIGluIEZpZWxkR3JvdXBcblx0ICogQHBhcmFtIGZpZWxkR3JvdXAgRGF0YSBmaWVsZCBjb250YWluaW5nIHRoZSBWQm94XG5cdCAqIEByZXR1cm5zIFZpc2liaWxpdHkgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0VkJveFZpc2liaWxpdHk6IGZ1bmN0aW9uIChcblx0XHRjb2xsZWN0aW9uOiBBcnJheTxEYXRhRmllbGRGb3JBbm5vdGF0aW9uICYgSGlkZGVuPixcblx0XHRmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRcdGZpZWxkR3JvdXA6IEZpZWxkR3JvdXAgJiBIaWRkZW5cblx0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdGxldCBhbGxTdGF0aWMgPSB0cnVlO1xuXHRcdGNvbnN0IGhpZGRlblBhdGhzID0gW107XG5cblx0XHRpZiAoZmllbGRHcm91cFtgQCR7VUlBbm5vdGF0aW9uVGVybXMuSGlkZGVufWBdKSB7XG5cdFx0XHRyZXR1cm4gZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgZGF0YUZpZWxkIG9mIGNvbGxlY3Rpb24pIHtcblx0XHRcdGNvbnN0IGhpZGRlbkFubm90YXRpb25WYWx1ZSA9IGRhdGFGaWVsZFtgQCR7VUlBbm5vdGF0aW9uVGVybXMuSGlkZGVufWBdO1xuXHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0aGlkZGVuUGF0aHMucHVzaChmYWxzZSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRoaWRkZW5QYXRocy5wdXNoKHRydWUpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChoaWRkZW5Bbm5vdGF0aW9uVmFsdWUuJFBhdGgpIHtcblx0XHRcdFx0aGlkZGVuUGF0aHMucHVzaChwYXRoSW5Nb2RlbChoaWRkZW5Bbm5vdGF0aW9uVmFsdWUuJFBhdGgpKTtcblx0XHRcdFx0YWxsU3RhdGljID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBoaWRkZW5Bbm5vdGF0aW9uVmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0Ly8gRHluYW1pYyBleHByZXNzaW9uIGZvdW5kIGluIGEgZmllbGRcblx0XHRcdFx0cmV0dXJuIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBoYXNBbnlQYXRoRXhwcmVzc2lvbnMgPSBjb25zdGFudChoaWRkZW5QYXRocy5sZW5ndGggPiAwICYmIGFsbFN0YXRpYyAhPT0gdHJ1ZSk7XG5cdFx0Y29uc3QgaGFzQWxsSGlkZGVuU3RhdGljRXhwcmVzc2lvbnMgPSBjb25zdGFudChoaWRkZW5QYXRocy5sZW5ndGggPiAwICYmIGhpZGRlblBhdGhzLmluZGV4T2YoZmFsc2UpID09PSAtMSAmJiBhbGxTdGF0aWMpO1xuXG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRoYXNBbnlQYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdGZvcm1hdFJlc3VsdChoaWRkZW5QYXRocywgVGFibGVGb3JtYXR0ZXIuZ2V0VkJveFZpc2liaWxpdHkpLFxuXHRcdFx0XHRpZkVsc2UoaGFzQWxsSGlkZGVuU3RhdGljRXhwcmVzc2lvbnMsIGNvbnN0YW50KGZhbHNlKSwgY29uc3RhbnQodHJ1ZSkpXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHByb3ZpZGUgaGlkZGVuIGZpbHRlcnMgdG8gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZm9ybWF0SGlkZGVuRmlsdGVyc1xuXHQgKiBAcGFyYW0gb0hpZGRlbkZpbHRlciBUaGUgaGlkZGVuRmlsdGVycyB2aWEgY29udGV4dCBuYW1lZCBmaWx0ZXJzIChhbmQga2V5IGhpZGRlbkZpbHRlcnMpIHBhc3NlZCB0byBNYWNybyBUYWJsZVxuXHQgKiBAcmV0dXJucyBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBoaWRkZW4gZmlsdGVyc1xuXHQgKi9cblx0Zm9ybWF0SGlkZGVuRmlsdGVyczogZnVuY3Rpb24gKG9IaWRkZW5GaWx0ZXI6IFRhYmxlRmlsdGVyc0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQpIHtcblx0XHRpZiAob0hpZGRlbkZpbHRlcikge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9IaWRkZW5GaWx0ZXIpO1xuXHRcdFx0fSBjYXRjaCAoZXgpIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgc3RhYmxlIElEIG9mIGEgdGFibGUgZWxlbWVudCAoY29sdW1uIG9yIEZpZWxkR3JvdXAgbGFiZWwpLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RWxlbWVudFN0YWJsZUlkXG5cdCAqIEBwYXJhbSB0YWJsZUlkIEN1cnJlbnQgb2JqZWN0IElEXG5cdCAqIEBwYXJhbSBlbGVtZW50SWQgRWxlbWVudCBJZCBvciBzdWZmaXhcblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggRGF0YU1vZGVsT2JqZWN0UGF0aCBvZiB0aGUgZGF0YUZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBzdGFibGUgSUQgZm9yIGEgZ2l2ZW4gY29sdW1uXG5cdCAqL1xuXHRnZXRFbGVtZW50U3RhYmxlSWQ6IGZ1bmN0aW9uICh0YWJsZUlkOiBzdHJpbmcgfCB1bmRlZmluZWQsIGVsZW1lbnRJZDogc3RyaW5nLCBkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0aWYgKCF0YWJsZUlkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzO1xuXHRcdGxldCBkYXRhRmllbGRQYXJ0OiBzdHJpbmcgfCBEYXRhRmllbGRBYnN0cmFjdFR5cGVzO1xuXHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRcdGRhdGFGaWVsZFBhcnQgPSBkYXRhRmllbGQuVGFyZ2V0LnZhbHVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdGRhdGFGaWVsZFBhcnQgPSBkYXRhRmllbGQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0ZGF0YUZpZWxkUGFydCA9IChkYXRhRmllbGQgYXMgRGF0YUZpZWxkKS5WYWx1ZT8ucGF0aCA/PyBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuIGdlbmVyYXRlKFt0YWJsZUlkLCBlbGVtZW50SWQsIGRhdGFGaWVsZFBhcnRdKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgc3RhYmxlIElEIG9mIHRoZSBjb2x1bW4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5TdGFibGVJZFxuXHQgKiBAcGFyYW0gaWQgQ3VycmVudCBvYmplY3QgSURcblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggRGF0YU1vZGVsT2JqZWN0UGF0aCBvZiB0aGUgZGF0YUZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBzdGFibGUgSUQgZm9yIGEgZ2l2ZW4gY29sdW1uXG5cdCAqL1xuXHRnZXRDb2x1bW5TdGFibGVJZDogZnVuY3Rpb24gKGlkOiBzdHJpbmcsIGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRyZXR1cm4gVGFibGVIZWxwZXIuZ2V0RWxlbWVudFN0YWJsZUlkKGlkLCBcIkNcIiwgZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdH0sXG5cblx0Z2V0RmllbGRHcm91cExhYmVsU3RhYmxlSWQ6IGZ1bmN0aW9uIChpZDogc3RyaW5nLCBkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0cmV0dXJuIFRhYmxlSGVscGVyLmdldEVsZW1lbnRTdGFibGVJZChpZCwgXCJGR0xhYmVsXCIsIGRhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgZmlsdGVycyBvdXQgcHJvcGVydGllcyB3aGljaCBkbyBub3QgYmVsb25nIHRvIHRoZSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBUaGUgYXJyYXkgb2YgcHJvcGVydGllcyB0byBiZSBjaGVja2VkLlxuXHQgKiBAcGFyYW0gY29sbGVjdGlvbkNvbnRleHQgVGhlIGNvbGxlY3Rpb24gY29udGV4dCB0byBiZSB1c2VkLlxuXHQgKiBAcmV0dXJucyBUaGUgYXJyYXkgb2YgYXBwbGljYWJsZSBwcm9wZXJ0aWVzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2ZpbHRlck5vbkFwcGxpY2FibGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAocHJvcGVydGllczogc3RyaW5nW10sIGNvbGxlY3Rpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHByb3BlcnRpZXMgJiZcblx0XHRcdHByb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25Db250ZXh0LmdldE9iamVjdChgLi8ke3NQcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXRyZWl2ZSB0aGUgbGlzdGVkIHByb3BlcnRpZXMgZnJvbSB0aGUgY3VzdG9tIGNvbHVtbnNcblx0ICpcblx0ICogQHBhcmFtIGNvbHVtbnMgVGhlIHRhYmxlIGNvbHVtbnNcblx0ICogQHJldHVybnMgVGhlIGxpc3Qgb2YgYXZhaWxhYmxlIHByb3BlcnRpZXMgZnJvbSB0aGUgY3VzdG9tIGNvbHVtbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cblx0Z2V0UHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zOiBmdW5jdGlvbiAoY29sdW1uczogVGFibGVDb2x1bW5bXSkge1xuXHRcdC8vIEFkZCBwcm9wZXJ0aWVzIGZyb20gdGhlIGN1c3RvbSBjb2x1bW5zLCB0aGlzIGlzIHJlcXVpcmVkIGZvciB0aGUgZXhwb3J0IG9mIGFsbCB0aGUgcHJvcGVydGllcyBsaXN0ZWQgb24gYSBjdXN0b20gY29sdW1uXG5cdFx0aWYgKCFjb2x1bW5zPy5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHVtbnMpIHtcblx0XHRcdGlmIChcInByb3BlcnRpZXNcIiBpbiBjb2x1bW4gJiYgY29sdW1uLnByb3BlcnRpZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIGNvbHVtbi5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucy5pbmRleE9mKHByb3BlcnR5KSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdC8vIG9ubHkgYWRkIHByb3BlcnR5IGlmIGl0IGRvZXNuJ3QgZXhpc3Rcblx0XHRcdFx0XHRcdHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucztcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZW5lcmF0ZSB0aGUgYmluZGluZyBpbmZvcm1hdGlvbiBmb3IgYSB0YWJsZSByb3cuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcmV0dXJucyAtIFJldHVybnMgdGhlIGJpbmRpbmcgaW5mb3JtYXRpb24gb2YgYSB0YWJsZSByb3dcblx0ICovXG5cdGdldFJvd3NCaW5kaW5nSW5mbzogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZUJsb2NrKSB7XG5cdFx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0YWJsZS5jb2xsZWN0aW9uLCB0YWJsZS5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgcGF0aCA9IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUGF0aCkgfHwgZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBvUm93QmluZGluZyA9IHtcblx0XHRcdHVpNW9iamVjdDogdHJ1ZSxcblx0XHRcdHN1c3BlbmRlZDogZmFsc2UsXG5cdFx0XHRwYXRoOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHBhdGgpLFxuXHRcdFx0cGFyYW1ldGVyczoge1xuXHRcdFx0XHQkY291bnQ6IHRydWVcblx0XHRcdH0gYXMgYW55LFxuXHRcdFx0ZXZlbnRzOiB7fSBhcyBhbnlcblx0XHR9O1xuXG5cdFx0aWYgKHRhYmxlLnRhYmxlRGVmaW5pdGlvbi5lbmFibGUkc2VsZWN0KSB7XG5cdFx0XHQvLyBEb24ndCBhZGQgJHNlbGVjdCBwYXJhbWV0ZXIgaW4gY2FzZSBvZiBhbiBhbmFseXRpY2FsIHF1ZXJ5LCB0aGlzIGlzbid0IHN1cHBvcnRlZCBieSB0aGUgbW9kZWxcblx0XHRcdGNvbnN0IHNTZWxlY3QgPSBUYWJsZUhlbHBlci5jcmVhdGUkU2VsZWN0KHRhYmxlKTtcblx0XHRcdGlmIChzU2VsZWN0KSB7XG5cdFx0XHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJHNlbGVjdCA9IGAnJHtzU2VsZWN0fSdgO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0YWJsZS50YWJsZURlZmluaXRpb24uZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0KSB7XG5cdFx0XHQvLyB3ZSBsYXRlciBlbnN1cmUgaW4gdGhlIGRlbGVnYXRlIG9ubHkgb25lIGxpc3QgYmluZGluZyBmb3IgYSBnaXZlbiB0YXJnZXRDb2xsZWN0aW9uUGF0aCBoYXMgdGhlIGZsYWcgJCRnZXRLZWVwQWxpdmVDb250ZXh0XG5cdFx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkZ2V0S2VlcEFsaXZlQ29udGV4dCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kJGdyb3VwSWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiJGF1dG8uV29ya2Vyc1wiKTtcblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkdXBkYXRlR3JvdXBJZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIkYXV0b1wiKTtcblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkb3duUmVxdWVzdCA9IHRydWU7XG5cdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzID0gdHJ1ZTtcblxuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5wYXRjaFNlbnQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiLmVkaXRGbG93LmhhbmRsZVBhdGNoU2VudFwiKTtcblx0XHRvUm93QmluZGluZy5ldmVudHMuZGF0YVJlY2VpdmVkID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIkFQSS5vbkludGVybmFsRGF0YVJlY2VpdmVkXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5kYXRhUmVxdWVzdGVkID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIkFQSS5vbkludGVybmFsRGF0YVJlcXVlc3RlZFwiKTtcblx0XHQvLyByZWNyZWF0ZSBhbiBlbXB0eSByb3cgd2hlbiBvbmUgaXMgYWN0aXZhdGVkXG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmNyZWF0ZUFjdGl2YXRlID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIi5lZGl0Rmxvdy5oYW5kbGVDcmVhdGVBY3RpdmF0ZVwiKTtcblxuXHRcdGlmICh0YWJsZS5vbkNvbnRleHRDaGFuZ2UpIHtcblx0XHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5jaGFuZ2UgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHRhYmxlLm9uQ29udGV4dENoYW5nZSk7XG5cdFx0fVxuXHRcdHJldHVybiBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1Jvd0JpbmRpbmcpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNoZWNrIHRoZSB2YWxpZGl0eSBvZiB0aGUgZmllbGRzIGluIHRoZSBjcmVhdGlvbiByb3cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSB2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzXG5cdCAqIEBwYXJhbSBvRmllbGRWYWxpZGl0eU9iamVjdCBDdXJyZW50IE9iamVjdCBob2xkaW5nIHRoZSBmaWVsZHNcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGFsbCB0aGUgZmllbGRzIGluIHRoZSBjcmVhdGlvbiByb3cgYXJlIHZhbGlkLCBgZmFsc2VgIG90aGVyd2lzZVxuXHQgKi9cblx0dmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkczogZnVuY3Rpb24gKG9GaWVsZFZhbGlkaXR5T2JqZWN0OiBhbnkpIHtcblx0XHRpZiAoIW9GaWVsZFZhbGlkaXR5T2JqZWN0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHRPYmplY3Qua2V5cyhvRmllbGRWYWxpZGl0eU9iamVjdCkubGVuZ3RoID4gMCAmJlxuXHRcdFx0T2JqZWN0LmtleXMob0ZpZWxkVmFsaWRpdHlPYmplY3QpLmV2ZXJ5KGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkVmFsaWRpdHlPYmplY3Rba2V5XVtcInZhbGlkaXR5XCJdO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlICdwcmVzcycgZXZlbnQgZm9yIHRoZSBEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uXG5cdCAqIEBwYXJhbSB0YWJsZSBDdXJyZW50IG9iamVjdFxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIFZhbHVlIG9mIHRoZSBEYXRhUG9pbnRcblx0ICogQHBhcmFtIGVudGl0eVNldE5hbWUgTmFtZSBvZiB0aGUgRW50aXR5U2V0XG5cdCAqIEBwYXJhbSBvcGVyYXRpb25BdmFpbGFibGVNYXAgT3BlcmF0aW9uQXZhaWxhYmxlTWFwIGFzIHN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEBwYXJhbSBhY3Rpb25Db250ZXh0IEFjdGlvbiBvYmplY3Rcblx0ICogQHBhcmFtIGlzTmF2aWdhYmxlIEFjdGlvbiBlaXRoZXIgdHJpZ2dlcnMgbmF2aWdhdGlvbiBvciBub3Rcblx0ICogQHBhcmFtIGVuYWJsZUF1dG9TY3JvbGwgQWN0aW9uIGVpdGhlciB0cmlnZ2VycyBzY3JvbGxpbmcgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgaXRlbXMgaW4gdGhlIHJlbGF0ZWQgdGFibGUgb3Igbm90XG5cdCAqIEBwYXJhbSBkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gRnVuY3Rpb24gbmFtZSB0byBwcmVmaWxsIGRpYWxvZyBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdHByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b246IGZ1bmN0aW9uIChcblx0XHR0YWJsZTogVGFibGVCbG9jayxcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFjdGlvbiB8IHVuZGVmaW5lZCxcblx0XHRlbnRpdHlTZXROYW1lOiBzdHJpbmcsXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcsXG5cdFx0YWN0aW9uQ29udGV4dDogQ29udGV4dCB8IHVuZGVmaW5lZCxcblx0XHRpc05hdmlnYWJsZSA9IGZhbHNlLFxuXHRcdGVuYWJsZUF1dG9TY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uPzogc3RyaW5nXG5cdCkge1xuXHRcdGlmICghZGF0YUZpZWxkKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gZGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdHRhcmdldEVudGl0eVR5cGVOYW1lID0gdGFibGUuY29udGV4dE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRzdGF0aWNBY3Rpb24gPVxuXHRcdFx0XHR0aGlzLl9pc1N0YXRpY0FjdGlvbihhY3Rpb25Db250ZXh0LCBzQWN0aW9uTmFtZSkgfHxcblx0XHRcdFx0dGhpcy5faXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZShzQWN0aW9uTmFtZSwgdGFyZ2V0RW50aXR5VHlwZU5hbWUpLFxuXHRcdFx0cGFyYW1zOiBhbnkgPSB7XG5cdFx0XHRcdGNvbnRleHRzOiAhc3RhdGljQWN0aW9uID8gcGF0aEluTW9kZWwoXCJzZWxlY3RlZENvbnRleHRzXCIsIFwiaW50ZXJuYWxcIikgOiBudWxsLFxuXHRcdFx0XHRiU3RhdGljQWN0aW9uOiBzdGF0aWNBY3Rpb24gPyBzdGF0aWNBY3Rpb24gOiB1bmRlZmluZWQsXG5cdFx0XHRcdGVudGl0eVNldE5hbWU6IGVudGl0eVNldE5hbWUsXG5cdFx0XHRcdGFwcGxpY2FibGVDb250ZXh0czogIXN0YXRpY0FjdGlvbiA/IHBhdGhJbk1vZGVsKGBkeW5hbWljQWN0aW9ucy8ke2RhdGFGaWVsZC5BY3Rpb259L2FBcHBsaWNhYmxlL2AsIFwiaW50ZXJuYWxcIikgOiBudWxsLFxuXHRcdFx0XHRub3RBcHBsaWNhYmxlQ29udGV4dHM6ICFzdGF0aWNBY3Rpb24gPyBwYXRoSW5Nb2RlbChgZHluYW1pY0FjdGlvbnMvJHtkYXRhRmllbGQuQWN0aW9ufS9hTm90QXBwbGljYWJsZS9gLCBcImludGVybmFsXCIpIDogbnVsbCxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IGlzTmF2aWdhYmxlLFxuXHRcdFx0XHRlbmFibGVBdXRvU2Nyb2xsOiBlbmFibGVBdXRvU2Nyb2xsLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0fTtcblx0XHRwYXJhbXMuaW52b2NhdGlvbkdyb3VwaW5nID1cblx0XHRcdChkYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmIChkYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nIGFzIGFueSkuJEVudW1NZW1iZXIpID09PVxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCJcblx0XHRcdFx0PyBcIkNoYW5nZVNldFwiXG5cdFx0XHRcdDogXCJJc29sYXRlZFwiO1xuXG5cdFx0cGFyYW1zLmNvbnRyb2xJZCA9IHRhYmxlLmlkO1xuXHRcdHBhcmFtcy5vcGVyYXRpb25BdmFpbGFibGVNYXAgPSBvcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdFx0cGFyYW1zLmxhYmVsID0gZGF0YUZpZWxkLkxhYmVsO1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmbihcIkFQSS5vbkFjdGlvblByZXNzXCIsIFtyZWYoXCIkZXZlbnRcIiksIHJlZihcIiRjb250cm9sbGVyXCIpLCBkYXRhRmllbGQuQWN0aW9uLCBwYXJhbXNdKSk7XG5cdFx0Ly9yZXR1cm4gQWN0aW9uSGVscGVyLmdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24odGFibGUuaWQhLCBkYXRhRmllbGQsIHBhcmFtcywgb3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBhY3Rpb25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkXG5cdCAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGNvbnRyb2xcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgdmFsdWUgb2YgdGhlIGRhdGEgZmllbGRcblx0ICogQHBhcmFtIHJlcXVpcmVzQ29udGV4dCBSZXF1aXJlc0NvbnRleHQgZm9yIElCTlxuXHQgKiBAcGFyYW0gYWN0aW9uQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gZW5hYmxlT25TZWxlY3QgRGVmaW5lIHRoZSBlbmFibGluZyBvZiB0aGUgYWN0aW9uIChzaW5nbGUgb3IgbXVsdGlzZWxlY3QpXG5cdCAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uIHRvIGRlZmluZSB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBhY3Rpb25cblx0ICovXG5cdGlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZDogZnVuY3Rpb24gKFxuXHRcdHRhYmxlOiBUYWJsZUJsb2NrLFxuXHRcdGRhdGFGaWVsZDogYW55LFxuXHRcdHJlcXVpcmVzQ29udGV4dDogYm9vbGVhbixcblx0XHRhY3Rpb25Db250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRcdGVuYWJsZU9uU2VsZWN0Pzogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IGFjdGlvbk5hbWUgPSBkYXRhRmllbGQuQWN0aW9uLFxuXHRcdFx0YW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgPSB0YWJsZT8uY29sbGVjdGlvbi5nZXRPYmplY3QoXCIkVHlwZVwiKSxcblx0XHRcdGlzU3RhdGljQWN0aW9uID0gdGhpcy5faXNTdGF0aWNBY3Rpb24oYWN0aW9uQ29udGV4dCwgYWN0aW9uTmFtZSk7XG5cblx0XHQvLyBDaGVjayBmb3IgYWN0aW9uIG92ZXJsb2FkIG9uIGEgZGlmZmVyZW50IEVudGl0eSB0eXBlLlxuXHRcdC8vIElmIHllcywgdGFibGUgcm93IHNlbGVjdGlvbiBpcyBub3QgcmVxdWlyZWQgdG8gZW5hYmxlIHRoaXMgYWN0aW9uLlxuXHRcdGlmICh0aGlzLl9pc0FjdGlvbk92ZXJsb2FkT25EaWZmZXJlbnRUeXBlKGFjdGlvbk5hbWUsIGFubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlKSkge1xuXHRcdFx0Ly8gQWN0aW9uIG92ZXJsb2FkIGRlZmluZWQgb24gZGlmZmVyZW50IGVudGl0eSB0eXBlXG5cdFx0XHRjb25zdCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGFibGUudGFibGVEZWZpbml0aW9uICYmIEpTT04ucGFyc2UodGFibGUudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0XHRpZiAob09wZXJhdGlvbkF2YWlsYWJsZU1hcD8uaGFzT3duUHJvcGVydHkoYWN0aW9uTmFtZSkpIHtcblx0XHRcdFx0Ly8gQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiBkZWZpbmVkIGZvciB0aGUgYWN0aW9uLlxuXHRcdFx0XHQvLyBOZWVkIHRvIHJlZmVyIHRvIGludGVybmFsIG1vZGVsIGZvciBlbmFibGVkIHByb3BlcnR5IG9mIHRoZSBkeW5hbWljIGFjdGlvbi5cblx0XHRcdFx0Ly8gcmV0dXJuIGNvbXBpbGVCaW5kaW5nKGJpbmRpbmdFeHByZXNzaW9uKFwiZHluYW1pY0FjdGlvbnMvXCIgKyBzQWN0aW9uTmFtZSArIFwiL2JFbmFibGVkXCIsIFwiaW50ZXJuYWxcIiksIHRydWUpO1xuXHRcdFx0XHRyZXR1cm4gYHs9IFxcJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy8ke2FjdGlvbk5hbWV9L2JFbmFibGVkfSB9YDtcblx0XHRcdH1cblx0XHRcdC8vIENvbnNpZGVyIHRoZSBhY3Rpb24ganVzdCBsaWtlIGFueSBvdGhlciBzdGF0aWMgRGF0YUZpZWxkRm9yQWN0aW9uLlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICghcmVxdWlyZXNDb250ZXh0IHx8IGlzU3RhdGljQWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRsZXQgZGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gPSBcIlwiO1xuXG5cdFx0Y29uc3QgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID0gQWN0aW9uSGVscGVyLmdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uKGVuYWJsZU9uU2VsZWN0ID8/IFwibXVsdGlzZWxlY3RcIik7XG5cdFx0Y29uc3QgYWN0aW9uID0gYFxcJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy8ke2RhdGFGaWVsZC5BY3Rpb259L2JFbmFibGVkfWA7XG5cdFx0ZGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gPSBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgKyBcIiAmJiBcIiArIGFjdGlvbjtcblxuXHRcdHJldHVybiBcIns9IFwiICsgZGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gKyBcIn1cIjtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvcklCTiBhY3Rpb25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkXG5cdCAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGNvbnRyb2xcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgdmFsdWUgb2YgdGhlIGRhdGEgZmllbGRcblx0ICogQHBhcmFtIHJlcXVpcmVzQ29udGV4dCBSZXF1aXJlc0NvbnRleHQgZm9yIElCTlxuXHQgKiBAcGFyYW0gaXNOYXZpZ2F0aW9uQXZhaWxhYmxlIERlZmluZSBpZiB0aGUgbmF2aWdhdGlvbiBpcyBhdmFpbGFibGVcblx0ICogQHJldHVybnMgQSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZGVmaW5lIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlIGFjdGlvblxuXHQgKi9cblx0aXNEYXRhRmllbGRGb3JJQk5FbmFibGVkOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlQmxvY2ssIGRhdGFGaWVsZDogYW55LCByZXF1aXJlc0NvbnRleHQ6IGJvb2xlYW4sIGlzTmF2aWdhdGlvbkF2YWlsYWJsZT86IHN0cmluZykge1xuXHRcdGNvbnN0IGlzQW5hbHl0aWNhbFRhYmxlID0gdGFibGU/LnRhYmxlRGVmaW5pdGlvbj8uZW5hYmxlQW5hbHl0aWNzO1xuXG5cdFx0aWYgKCFyZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IGVudGl0eVNldCA9IHRhYmxlLmNvbGxlY3Rpb24uZ2V0UGF0aCgpO1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGFibGUuY29sbGVjdGlvbi5nZXRNb2RlbCgpO1xuXHRcdFx0aWYgKGlzTmF2aWdhdGlvbkF2YWlsYWJsZSA9PT0gXCJmYWxzZVwiICYmICFpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIk5hdmlnYXRpb25BdmFpbGFibGUgYXMgZmFsc2UgaXMgaW5jb3JyZWN0IHVzYWdlXCIpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRpc05hdmlnYXRpb25BdmFpbGFibGUgJiZcblx0XHRcdFx0IWlzQW5hbHl0aWNhbFRhYmxlICYmXG5cdFx0XHRcdGRhdGFGaWVsZD8uTmF2aWdhdGlvbkF2YWlsYWJsZT8uJFBhdGggJiZcblx0XHRcdFx0bWV0YU1vZGVsLmdldE9iamVjdChlbnRpdHlTZXQgKyBcIi8kUGFydG5lclwiKSA9PT0gZGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGguc3BsaXQoXCIvXCIpWzBdXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGB7PSBcXCR7JHtpc05hdmlnYXRpb25BdmFpbGFibGUuc3Vic3RyaW5nKGlzTmF2aWdhdGlvbkF2YWlsYWJsZS5pbmRleE9mKFwiL1wiKSArIDEsIGlzTmF2aWdhdGlvbkF2YWlsYWJsZS5sZW5ndGgpfX1gO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0bGV0IGRhdGFGaWVsZEZvcklCTkVuYWJsZWRFeHByZXNzaW9uID0gXCJcIixcblx0XHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyxcblx0XHRcdGFjdGlvbjtcblxuXHRcdGlmIChpc05hdmlnYXRpb25BdmFpbGFibGUgPT09IFwidHJ1ZVwiIHx8IGlzQW5hbHl0aWNhbFRhYmxlKSB7XG5cdFx0XHRkYXRhRmllbGRGb3JJQk5FbmFibGVkRXhwcmVzc2lvbiA9IFwiJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDFcIjtcblx0XHR9IGVsc2UgaWYgKGlzTmF2aWdhdGlvbkF2YWlsYWJsZSA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRMb2cud2FybmluZyhcIk5hdmlnYXRpb25BdmFpbGFibGUgYXMgZmFsc2UgaXMgaW5jb3JyZWN0IHVzYWdlXCIpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBcIiV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxXCI7XG5cdFx0XHRhY3Rpb24gPSBgXFwke2ludGVybmFsPmlibi8ke2RhdGFGaWVsZC5TZW1hbnRpY09iamVjdH0tJHtkYXRhRmllbGQuQWN0aW9ufS9iRW5hYmxlZH1gO1xuXHRcdFx0ZGF0YUZpZWxkRm9ySUJORW5hYmxlZEV4cHJlc3Npb24gPSBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgKyBcIiAmJiBcIiArIGFjdGlvbjtcblx0XHR9XG5cblx0XHRyZXR1cm4gYHs9ICR7ZGF0YUZpZWxkRm9ySUJORW5hYmxlZEV4cHJlc3Npb259fWA7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHByZXNzIGV2ZW50IGV4cHJlc3Npb24gZm9yIENyZWF0ZUJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b25cblx0ICogQHBhcmFtIG9UaGlzIEN1cnJlbnQgT2JqZWN0XG5cdCAqIEBwYXJhbSBiQ21kRXhlY3V0aW9uRmxhZyBGbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIENNRCBFeGVjdXRpb25cblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHByZXNzIGV2ZW50IG9mIHRoZSBjcmVhdGUgYnV0dG9uXG5cdCAqL1xuXHRwcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgYkNtZEV4ZWN1dGlvbkZsYWc6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBzQ3JlYXRpb25Nb2RlID0gb1RoaXMuY3JlYXRpb25Nb2RlO1xuXHRcdGxldCBvUGFyYW1zOiBhbnk7XG5cdFx0Y29uc3Qgc01kY1RhYmxlID0gYkNtZEV4ZWN1dGlvbkZsYWcgPyBcIiR7JHNvdXJjZT59LmdldFBhcmVudCgpXCIgOiBcIiR7JHNvdXJjZT59LmdldFBhcmVudCgpLmdldFBhcmVudCgpLmdldFBhcmVudCgpXCI7XG5cdFx0bGV0IHNSb3dCaW5kaW5nID0gc01kY1RhYmxlICsgXCIuZ2V0Um93QmluZGluZygpIHx8IFwiICsgc01kY1RhYmxlICsgXCIuZGF0YSgncm93c0JpbmRpbmdJbmZvJykucGF0aFwiO1xuXG5cdFx0c3dpdGNoIChzQ3JlYXRpb25Nb2RlKSB7XG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5FeHRlcm5hbDpcblx0XHRcdFx0Ly8gbmF2aWdhdGUgdG8gZXh0ZXJuYWwgdGFyZ2V0IGZvciBjcmVhdGluZyBuZXcgZW50cmllc1xuXHRcdFx0XHQvLyBUT0RPOiBBZGQgcmVxdWlyZWQgcGFyYW1ldGVyc1xuXHRcdFx0XHRvUGFyYW1zID0ge1xuXHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhDcmVhdGlvbk1vZGUuRXh0ZXJuYWwpLFxuXHRcdFx0XHRcdG91dGJvdW5kOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmNyZWF0ZU91dGJvdW5kKVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3c6XG5cdFx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyksXG5cdFx0XHRcdFx0Y3JlYXRpb25Sb3c6IFwiJHskc291cmNlPn1cIixcblx0XHRcdFx0XHRjcmVhdGVBdEVuZDogb1RoaXMuY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZCA/IG9UaGlzLmNyZWF0ZUF0RW5kIDogZmFsc2Vcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRzUm93QmluZGluZyA9IFwiJHskc291cmNlPn0uZ2V0UGFyZW50KCkuZ2V0Um93QmluZGluZygpXCI7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5OZXdQYWdlOlxuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuSW5saW5lOlxuXHRcdFx0XHRvUGFyYW1zID0ge1xuXHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzQ3JlYXRpb25Nb2RlKSxcblx0XHRcdFx0XHRjcmVhdGVBdEVuZDogb1RoaXMuY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZCA/IG9UaGlzLmNyZWF0ZUF0RW5kIDogZmFsc2UsXG5cdFx0XHRcdFx0dGFibGVJZDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvVGhpcy5pZClcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAob1RoaXMuY3JlYXRlTmV3QWN0aW9uKSB7XG5cdFx0XHRcdFx0b1BhcmFtcy5uZXdBY3Rpb24gPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmNyZWF0ZU5ld0FjdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93czpcblx0XHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmNyZWF0ZUVtcHR5Um93c0FuZEZvY3VzXCIsIHNNZGNUYWJsZSk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyB1bnN1cHBvcnRlZFxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuZWRpdEZsb3cuY3JlYXRlRG9jdW1lbnRcIiwgc1Jvd0JpbmRpbmcsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG5cdH0sXG5cblx0Z2V0SUJORGF0YTogZnVuY3Rpb24gKG9UaGlzOiBhbnkpIHtcblx0XHRjb25zdCBvdXRib3VuZERldGFpbCA9IG9UaGlzLmNyZWF0ZU91dGJvdW5kRGV0YWlsO1xuXHRcdGlmIChvdXRib3VuZERldGFpbCkge1xuXHRcdFx0Y29uc3Qgb0lCTkRhdGEgPSB7XG5cdFx0XHRcdHNlbWFudGljT2JqZWN0OiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG91dGJvdW5kRGV0YWlsLnNlbWFudGljT2JqZWN0KSxcblx0XHRcdFx0YWN0aW9uOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG91dGJvdW5kRGV0YWlsLmFjdGlvbilcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9JQk5EYXRhKTtcblx0XHR9XG5cdH0sXG5cblx0X2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b246IGZ1bmN0aW9uICh2YWx1ZTogYW55LCBmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXModmFsdWUsIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHZhbHVlKTtcblx0XHRcdGlmIChpc0NvbnN0YW50KGV4cHJlc3Npb24pIHx8IGlzUGF0aEluTW9kZWxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGZvcm1hdFZhbHVlUmVjdXJzaXZlbHkoZXhwcmVzc2lvbiwgZnVsbENvbnRleHRQYXRoKTtcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHByZXNzIGV2ZW50IGV4cHJlc3Npb24gZm9yICdEZWxldGUnIGJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHByZXNzRXZlbnRGb3JEZWxldGVCdXR0b25cblx0ICogQHBhcmFtIG9UaGlzIEN1cnJlbnQgT2JqZWN0XG5cdCAqIEBwYXJhbSBzRW50aXR5U2V0TmFtZSBFbnRpdHlTZXQgbmFtZVxuXHQgKiBAcGFyYW0gb0hlYWRlckluZm8gSGVhZGVyIEluZm9cblx0ICogQHBhcmFtIGZ1bGxjb250ZXh0UGF0aCBDb250ZXh0IFBhdGhcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHByZXNzIGV2ZW50IG9mIHRoZSAnRGVsZXRlJyBidXR0b25cblx0ICovXG5cdHByZXNzRXZlbnRGb3JEZWxldGVCdXR0b246IGZ1bmN0aW9uIChvVGhpczogYW55LCBzRW50aXR5U2V0TmFtZTogc3RyaW5nLCBvSGVhZGVySW5mbzogYW55LCBmdWxsY29udGV4dFBhdGg6IGFueSkge1xuXHRcdGNvbnN0IHNEZWxldGFibGVDb250ZXh0cyA9IFwiJHtpbnRlcm5hbD5kZWxldGFibGVDb250ZXh0c31cIjtcblx0XHRsZXQgc1RpdGxlRXhwcmVzc2lvbiwgc0Rlc2NyaXB0aW9uRXhwcmVzc2lvbjtcblxuXHRcdGlmIChvSGVhZGVySW5mbz8uVGl0bGUpIHtcblx0XHRcdHNUaXRsZUV4cHJlc3Npb24gPSB0aGlzLl9nZXRFeHByZXNzaW9uRm9yRGVsZXRlQnV0dG9uKG9IZWFkZXJJbmZvLlRpdGxlLlZhbHVlLCBmdWxsY29udGV4dFBhdGgpO1xuXHRcdH1cblx0XHRpZiAob0hlYWRlckluZm8/LkRlc2NyaXB0aW9uKSB7XG5cdFx0XHRzRGVzY3JpcHRpb25FeHByZXNzaW9uID0gdGhpcy5fZ2V0RXhwcmVzc2lvbkZvckRlbGV0ZUJ1dHRvbihvSGVhZGVySW5mby5EZXNjcmlwdGlvbi5WYWx1ZSwgZnVsbGNvbnRleHRQYXRoKTtcblx0XHR9XG5cblx0XHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdFx0aWQ6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMuaWQpLFxuXHRcdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSksXG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHM6IFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfS5sZW5ndGhcIixcblx0XHRcdHVuU2F2ZWRDb250ZXh0czogXCIke2ludGVybmFsPnVuU2F2ZWRDb250ZXh0c31cIixcblx0XHRcdGxvY2tlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+bG9ja2VkQ29udGV4dHN9XCIsXG5cdFx0XHRjcmVhdGVNb2RlQ29udGV4dHM6IFwiJHtpbnRlcm5hbD5jcmVhdGVNb2RlQ29udGV4dHN9XCIsXG5cdFx0XHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlOiBcIiR7aW50ZXJuYWw+ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZX1cIixcblx0XHRcdGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmU6IFwiJHtpbnRlcm5hbD5kcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlfVwiLFxuXHRcdFx0Y29udHJvbElkOiBcIiR7aW50ZXJuYWw+Y29udHJvbElkfVwiLFxuXHRcdFx0dGl0bGU6IHNUaXRsZUV4cHJlc3Npb24sXG5cdFx0XHRkZXNjcmlwdGlvbjogc0Rlc2NyaXB0aW9uRXhwcmVzc2lvbixcblx0XHRcdHNlbGVjdGVkQ29udGV4dHM6IFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiXG5cdFx0fTtcblxuXHRcdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5lZGl0Rmxvdy5kZWxldGVNdWx0aXBsZURvY3VtZW50c1wiLCBzRGVsZXRhYmxlQ29udGV4dHMsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBzZXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGxhYmVsIGZvciB0aGUgY29sdW1uIGhlYWRlci5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNldEhlYWRlckxhYmVsVmlzaWJpbGl0eVxuXHQgKiBAcGFyYW0gZGF0YWZpZWxkIERhdGFGaWVsZFxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQ29sbGVjdGlvbiBMaXN0IG9mIGl0ZW1zIGluc2lkZSBhIGZpZWxkZ3JvdXAgKGlmIGFueSlcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBoZWFkZXIgbGFiZWwgbmVlZHMgdG8gYmUgdmlzaWJsZSBlbHNlIGZhbHNlLlxuXHQgKi9cblx0c2V0SGVhZGVyTGFiZWxWaXNpYmlsaXR5OiBmdW5jdGlvbiAoZGF0YWZpZWxkOiBhbnksIGRhdGFGaWVsZENvbGxlY3Rpb246IGFueVtdKSB7XG5cdFx0Ly8gSWYgSW5saW5lIGJ1dHRvbi9uYXZpZ2F0aW9uIGFjdGlvbiwgcmV0dXJuIGZhbHNlLCBlbHNlIHRydWU7XG5cdFx0aWYgKCFkYXRhRmllbGRDb2xsZWN0aW9uKSB7XG5cdFx0XHRpZiAoZGF0YWZpZWxkLiRUeXBlLmluZGV4T2YoXCJEYXRhRmllbGRGb3JBY3Rpb25cIikgPiAtMSAmJiBkYXRhZmllbGQuSW5saW5lKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGlmIChkYXRhZmllbGQuJFR5cGUuaW5kZXhPZihcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiKSA+IC0xICYmIGRhdGFmaWVsZC5JbmxpbmUpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSW4gRmllbGRncm91cCwgSWYgTk9UIGFsbCBkYXRhZmllbGQvZGF0YWZpZWxkRm9yQW5ub3RhdGlvbiBleGlzdHMgd2l0aCBoaWRkZW4sIHJldHVybiB0cnVlO1xuXHRcdHJldHVybiBkYXRhRmllbGRDb2xsZWN0aW9uLnNvbWUoZnVuY3Rpb24gKG9EQzogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvREMuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fCBvREMuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pICYmXG5cdFx0XHRcdG9EQ1tgQCR7VUlBbm5vdGF0aW9uVGVybXMuSGlkZGVufWBdICE9PSB0cnVlXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHRleHQgZnJvbSB0aGUgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBpbnRvIHRoZSBjb2x1bW4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUZXh0T25BY3Rpb25GaWVsZFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhUG9pbnQncyBWYWx1ZVxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvYmplY3Qgb2YgdGhlIExpbmVJdGVtXG5cdCAqIEByZXR1cm5zIFN0cmluZyBmcm9tIGxhYmVsIHJlZmVycmluZyB0byBhY3Rpb24gdGV4dFxuXHQgKi9cblx0Z2V0VGV4dE9uQWN0aW9uRmllbGQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9Db250ZXh0OiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gb0RhdGFGaWVsZC5MYWJlbDtcblx0XHR9XG5cdFx0Ly8gZm9yIEZpZWxkR3JvdXAgY29udGFpbmluZyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uXG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0b0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoXCIpLmluZGV4T2YoXCJAXCIgKyBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwKSA+IC0xXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBzUGF0aERhdGFGaWVsZHMgPSBcIlRhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS9cIjtcblx0XHRcdGNvbnN0IGFNdWx0aXBsZUxhYmVscyA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KHNQYXRoRGF0YUZpZWxkcykpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRhTXVsdGlwbGVMYWJlbHMucHVzaChvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS9MYWJlbGApKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSBhcmUgbXVsdGlwbGUgYWN0aW9ucyBpbnNpZGUgYSBGaWVsZCBHcm91cCBzZWxlY3QgdGhlIGxhcmdlc3QgQWN0aW9uIExhYmVsXG5cdFx0XHRpZiAoYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIGFNdWx0aXBsZUxhYmVscy5yZWR1Y2UoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGEubGVuZ3RoID4gYi5sZW5ndGggPyBhIDogYjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGFNdWx0aXBsZUxhYmVscy50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRfZ2V0UmVzcG9uc2l2ZVRhYmxlQ29sdW1uU2V0dGluZ3M6IGZ1bmN0aW9uIChvVGhpczogYW55LCBvQ29sdW1uOiBhbnkpIHtcblx0XHRpZiAob1RoaXMudGFibGVUeXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5zZXR0aW5ncztcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sXG5cblx0Z2V0Q2hhcnRTaXplOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB0aGlzLl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyhvVGhpcywgb0NvbHVtbik7XG5cdFx0aWYgKHNldHRpbmdzICYmIHNldHRpbmdzLm1pY3JvQ2hhcnRTaXplKSB7XG5cdFx0XHRyZXR1cm4gc2V0dGluZ3MubWljcm9DaGFydFNpemU7XG5cdFx0fVxuXHRcdHJldHVybiBcIlhTXCI7XG5cdH0sXG5cdGdldFNob3dPbmx5Q2hhcnQ6IGZ1bmN0aW9uIChvVGhpczogYW55LCBvQ29sdW1uOiBhbnkpIHtcblx0XHRjb25zdCBzZXR0aW5ncyA9IHRoaXMuX2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzKG9UaGlzLCBvQ29sdW1uKTtcblx0XHRpZiAoc2V0dGluZ3MgJiYgc2V0dGluZ3Muc2hvd01pY3JvQ2hhcnRMYWJlbCkge1xuXHRcdFx0cmV0dXJuICFzZXR0aW5ncy5zaG93TWljcm9DaGFydExhYmVsO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Z2V0RGVsZWdhdGU6IGZ1bmN0aW9uICh0YWJsZTogVGFibGVWaXN1YWxpemF0aW9uLCBpc0FMUDogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgb0RlbGVnYXRlO1xuXHRcdGlmIChpc0FMUCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdC8vIFdlIGRvbid0IHN1cHBvcnQgVHJlZVRhYmxlIGluIEFMUFxuXHRcdFx0aWYgKHRhYmxlLmNvbnRyb2wudHlwZSA9PT0gXCJUcmVlVGFibGVcIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUcmVlVGFibGUgbm90IHN1cHBvcnRlZCBpbiBBbmFseXRpY2FsIExpc3RQYWdlXCIpO1xuXHRcdFx0fVxuXHRcdFx0b0RlbGVnYXRlID0ge1xuXHRcdFx0XHRuYW1lOiBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL0FMUFRhYmxlRGVsZWdhdGVcIixcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdGNvbGxlY3Rpb25OYW1lOiBlbnRpdHlOYW1lXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmICh0YWJsZS5jb250cm9sLnR5cGUgPT09IFwiVHJlZVRhYmxlXCIpIHtcblx0XHRcdG9EZWxlZ2F0ZSA9IHtcblx0XHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UcmVlVGFibGVEZWxlZ2F0ZVwiLFxuXHRcdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdFx0aGllcmFyY2h5UXVhbGlmaWVyOiB0YWJsZS5jb250cm9sLmhpZXJhcmNoeVF1YWxpZmllcixcblx0XHRcdFx0XHRpbml0aWFsRXhwYW5zaW9uTGV2ZWw6IHRhYmxlLmFubm90YXRpb24uaW5pdGlhbEV4cGFuc2lvbkxldmVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9EZWxlZ2F0ZSA9IHtcblx0XHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UYWJsZURlbGVnYXRlXCJcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9EZWxlZ2F0ZSk7XG5cdH0sXG5cdHNldElCTkVuYWJsZW1lbnQ6IGZ1bmN0aW9uIChvSW50ZXJuYWxNb2RlbENvbnRleHQ6IGFueSwgb05hdmlnYXRpb25BdmFpbGFibGVNYXA6IGFueSwgYVNlbGVjdGVkQ29udGV4dHM6IGFueSkge1xuXHRcdGZvciAoY29uc3Qgc0tleSBpbiBvTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBpYm4vJHtzS2V5fWAsIHtcblx0XHRcdFx0YkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHRhQXBwbGljYWJsZTogW10sXG5cdFx0XHRcdGFOb3RBcHBsaWNhYmxlOiBbXVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBhQXBwbGljYWJsZSA9IFtdLFxuXHRcdFx0XHRhTm90QXBwbGljYWJsZSA9IFtdO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gb05hdmlnYXRpb25BdmFpbGFibGVNYXBbc0tleV07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWxlY3RlZENvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZENvbnRleHQgPSBhU2VsZWN0ZWRDb250ZXh0c1tpXTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHNQcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9pYm4vJHtzS2V5fS9iRW5hYmxlZGAsIHRydWUpO1xuXHRcdFx0XHRcdGFBcHBsaWNhYmxlLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGUucHVzaChvU2VsZWN0ZWRDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYUFwcGxpY2FibGVgLCBhQXBwbGljYWJsZSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9pYm4vJHtzS2V5fS9hTm90QXBwbGljYWJsZWAsIGFOb3RBcHBsaWNhYmxlKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSBvRmFzdENyZWF0aW9uUm93XG5cdCAqIEBwYXJhbSBzUGF0aFxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHBhcmFtIG9Nb2RlbFxuXHQgKiBAcGFyYW0gb0ZpbmFsVUlTdGF0ZVxuXHQgKi9cblx0ZW5hYmxlRmFzdENyZWF0aW9uUm93OiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0b0Zhc3RDcmVhdGlvblJvdzogYW55LFxuXHRcdHNQYXRoOiBzdHJpbmcsXG5cdFx0b0NvbnRleHQ6IHY0Q29udGV4dCxcblx0XHRvTW9kZWw6IE9EYXRhTW9kZWwsXG5cdFx0b0ZpbmFsVUlTdGF0ZTogUHJvbWlzZTxhbnk+XG5cdCkge1xuXHRcdGxldCBvRmFzdENyZWF0aW9uTGlzdEJpbmRpbmcsIG9GYXN0Q3JlYXRpb25Db250ZXh0O1xuXG5cdFx0aWYgKG9GYXN0Q3JlYXRpb25Sb3cpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IG9GaW5hbFVJU3RhdGU7XG5cdFx0XHRcdC8vIElmIGEgZHJhZnQgaXMgZGlzY2FyZGVkIHdoaWxlIGEgbWVzc2FnZSBzdHJpcCBmaWx0ZXIgaXMgYWN0aXZlIG9uIHRoZSB0YWJsZSB0aGVyZSBpcyBhIHRhYmxlIHJlYmluZCBjYXVzZWQgYnkgdGhlIERhdGFTdGF0ZUluZGljYXRvclxuXHRcdFx0XHQvLyBUbyBwcmV2ZW50IGEgbmV3IGNyZWF0aW9uIHJvdyBiaW5kaW5nIGJlaW5nIGNyZWF0ZWQgYXQgdGhhdCBtb21lbnQgd2UgY2hlY2sgaWYgdGhlIGNvbnRleHQgaXMgYWxyZWFkeSBkZWxldGVkXG5cdFx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93LmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSAmJiAhb0NvbnRleHQuaXNEZWxldGVkKCkpIHtcblx0XHRcdFx0XHRvRmFzdENyZWF0aW9uTGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3Qoc1BhdGgsIG9Db250ZXh0LCBbXSwgW10sIHtcblx0XHRcdFx0XHRcdCQkdXBkYXRlR3JvdXBJZDogXCJkb05vdFN1Ym1pdFwiLFxuXHRcdFx0XHRcdFx0JCRncm91cElkOiBcImRvTm90U3VibWl0XCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBXb3JrYXJvdW5kIHN1Z2dlc3RlZCBieSBPRGF0YSBtb2RlbCB2NCBjb2xsZWFndWVzXG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRvRmFzdENyZWF0aW9uTGlzdEJpbmRpbmcucmVmcmVzaEludGVybmFsID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0LyogZG8gbm90aGluZyAqL1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkNvbnRleHQgPSBvRmFzdENyZWF0aW9uTGlzdEJpbmRpbmcuY3JlYXRlKCk7XG5cdFx0XHRcdFx0b0Zhc3RDcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChvRmFzdENyZWF0aW9uQ29udGV4dCk7XG5cblx0XHRcdFx0XHQvLyB0aGlzIGlzIG5lZWRlZCB0byBhdm9pZCBjb25zb2xlIGVycm9yXG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IG9GYXN0Q3JlYXRpb25Db250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgZmFzdCBjcmVhdGlvbiBjb250ZXh0IGRlbGV0ZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjb21wdXRpbmcgdGhlIGZpbmFsIFVJIHN0YXRlXCIsIG9FcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuKFRhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVNYXAgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihUYWJsZUhlbHBlci5nZXRUZXh0T25BY3Rpb25GaWVsZCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBeURBLE1BQU1BLFlBQVksR0FBR0MsU0FBUyxDQUFDRCxZQUFZOztFQUUzQztBQUNBO0FBQ0E7QUFD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