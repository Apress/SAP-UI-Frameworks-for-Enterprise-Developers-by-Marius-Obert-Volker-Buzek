/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/m/table/Util", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/dom/units/Rem", "sap/ui/mdc/valuehelp/content/Conditions", "sap/ui/mdc/valuehelp/content/MDCTable", "sap/ui/mdc/valuehelp/content/MTable", "sap/ui/model/json/JSONModel"], function (Log, ObjectPath, CommonUtils, MetaModelFunction, PropertyHelper, UIFormatters, Util, Fragment, XMLPreprocessor, XMLTemplateProcessor, Rem, Conditions, MDCTable, MTable, JSONModel) {
  "use strict";

  var _exports = {};
  var getTypeConfig = UIFormatters.getTypeConfig;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedTextProperty = PropertyHelper.getAssociatedTextProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var isPropertyFilterable = MetaModelFunction.isPropertyFilterable;
  var getSortRestrictionsInfo = MetaModelFunction.getSortRestrictionsInfo;
  var Level = Log.Level;
  const columnNotAlreadyDefined = (columnDefs, vhKey) => !columnDefs.some(column => column.path === vhKey);
  const AnnotationLabel = "@com.sap.vocabularies.Common.v1.Label",
    AnnotationText = "@com.sap.vocabularies.Common.v1.Text",
    AnnotationTextUITextArrangement = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement",
    AnnotationValueListParameterIn = "com.sap.vocabularies.Common.v1.ValueListParameterIn",
    AnnotationValueListParameterConstant = "com.sap.vocabularies.Common.v1.ValueListParameterConstant",
    AnnotationValueListParameterOut = "com.sap.vocabularies.Common.v1.ValueListParameterOut",
    AnnotationValueListParameterInOut = "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
    AnnotationValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues";
  _exports.AnnotationLabel = AnnotationLabel;
  _exports.AnnotationValueListWithFixedValues = AnnotationValueListWithFixedValues;
  _exports.AnnotationValueListParameterInOut = AnnotationValueListParameterInOut;
  _exports.AnnotationValueListParameterOut = AnnotationValueListParameterOut;
  _exports.AnnotationValueListParameterConstant = AnnotationValueListParameterConstant;
  _exports.AnnotationValueListParameterIn = AnnotationValueListParameterIn;
  _exports.AnnotationTextUITextArrangement = AnnotationTextUITextArrangement;
  _exports.AnnotationText = AnnotationText;
  function _getDefaultSortPropertyName(valueListInfo) {
    let sortFieldName;
    const metaModel = valueListInfo.$model.getMetaModel();
    const entitySetAnnotations = metaModel.getObject(`/${valueListInfo.CollectionPath}@`) || {};
    const sortRestrictionsInfo = getSortRestrictionsInfo(entitySetAnnotations);
    const foundElement = valueListInfo.Parameters.find(function (element) {
      return (element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterOut" || element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") && !(metaModel.getObject(`/${valueListInfo.CollectionPath}/${element.ValueListProperty}@com.sap.vocabularies.UI.v1.Hidden`) === true);
    });
    if (foundElement) {
      if (metaModel.getObject(`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember`) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        sortFieldName = metaModel.getObject(`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text/$Path`);
      } else {
        sortFieldName = foundElement.ValueListProperty;
      }
    }
    if (sortFieldName && (!sortRestrictionsInfo.propertyInfo[sortFieldName] || sortRestrictionsInfo.propertyInfo[sortFieldName].sortable)) {
      return sortFieldName;
    } else {
      return undefined;
    }
  }
  function _redundantDescription(oVLParameter, aColumnInfo) {
    const oColumnInfo = aColumnInfo.find(function (columnInfo) {
      return oVLParameter.ValueListProperty === columnInfo.textColumnName;
    });
    if (oVLParameter.ValueListProperty === (oColumnInfo === null || oColumnInfo === void 0 ? void 0 : oColumnInfo.textColumnName) && !oColumnInfo.keyColumnHidden && oColumnInfo.keyColumnDisplayFormat !== "Value") {
      return true;
    }
    return undefined;
  }
  function _hasImportanceHigh(oValueListContext) {
    return oValueListContext.Parameters.some(function (oParameter) {
      return oParameter["@com.sap.vocabularies.UI.v1.Importance"] && oParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High";
    });
  }
  function _build$SelectString(control) {
    const oViewData = control.getModel("viewData");
    if (oViewData) {
      const oData = oViewData.getData();
      if (oData) {
        const aColumns = oData.columns;
        if (aColumns) {
          return aColumns.reduce(function (sQuery, oProperty) {
            // Navigation properties (represented by X/Y) should not be added to $select.
            // TODO : They should be added as $expand=X($select=Y) instead
            if (oProperty.path && oProperty.path.indexOf("/") === -1) {
              sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
            }
            return sQuery;
          }, undefined);
        }
      }
    }
    return undefined;
  }
  function _getValueHelpColumnDisplayFormat(oPropertyAnnotations, isValueHelpWithFixedValues) {
    const sDisplayMode = CommonUtils.computeDisplayMode(oPropertyAnnotations, undefined);
    const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
    const oTextArrangementAnnotation = oTextAnnotation && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"];
    if (isValueHelpWithFixedValues) {
      return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.$Path ? sDisplayMode : "Value";
    } else {
      // Only explicit defined TextArrangements in a Value Help with Dialog are considered
      return oTextArrangementAnnotation ? sDisplayMode : "Value";
    }
  }
  const ValueListHelper = {
    getValueListCollectionEntitySet: function (oValueListContext) {
      const mValueList = oValueListContext.getObject();
      return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}`);
    },
    getTableDelegate: function (oValueList) {
      let sDefaultSortPropertyName = _getDefaultSortPropertyName(oValueList);
      if (sDefaultSortPropertyName) {
        sDefaultSortPropertyName = `'${sDefaultSortPropertyName}'`;
      }
      return "{name: 'sap/fe/macros/internal/valuehelp/TableDelegate', payload: {collectionName: '" + oValueList.CollectionPath + "'" + (sDefaultSortPropertyName ? ", defaultSortPropertyName: " + sDefaultSortPropertyName : "") + "}}";
    },
    getSortConditionsFromPresentationVariant: function (valueListInfo, isSuggestion) {
      if (valueListInfo.PresentationVariantQualifier !== undefined) {
        const presentationVariantQualifier = valueListInfo.PresentationVariantQualifier ? `#${valueListInfo.PresentationVariantQualifier}` : "",
          presentationVariantPath = `/${valueListInfo.CollectionPath}/@com.sap.vocabularies.UI.v1.PresentationVariant${presentationVariantQualifier}`;
        const presentationVariant = valueListInfo.$model.getMetaModel().getObject(presentationVariantPath);
        if (presentationVariant !== null && presentationVariant !== void 0 && presentationVariant.SortOrder) {
          const sortConditions = {
            sorters: []
          };
          presentationVariant.SortOrder.forEach(function (condition) {
            var _condition$Property;
            const sorter = {},
              propertyPath = condition === null || condition === void 0 ? void 0 : (_condition$Property = condition.Property) === null || _condition$Property === void 0 ? void 0 : _condition$Property.$PropertyPath;
            if (isSuggestion) {
              sorter.path = propertyPath;
            } else {
              sorter.name = propertyPath;
            }
            if (condition.Descending) {
              sorter.descending = true;
            } else {
              sorter.ascending = true;
            }
            sortConditions.sorters.push(sorter);
          });
          return isSuggestion ? `sorter: ${JSON.stringify(sortConditions.sorters)}` : JSON.stringify(sortConditions);
        }
      }
      return;
    },
    getPropertyPath: function (oParameters) {
      return !oParameters.UnboundAction ? `${oParameters.EntityTypePath}/${oParameters.Action}/${oParameters.Property}` : `/${oParameters.Action.substring(oParameters.Action.lastIndexOf(".") + 1)}/${oParameters.Property}`;
    },
    getValueListProperty: function (oPropertyContext) {
      const oValueListModel = oPropertyContext.getModel();
      const mValueList = oValueListModel.getObject("/");
      return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}/${oPropertyContext.getObject()}`);
    },
    // This function is used for value help m-table and mdc-table
    getColumnVisibility: function (oValueList, oVLParameter, oSource) {
      const isDropDownList = oSource && !!oSource.valueHelpWithFixedValues,
        oColumnInfo = oSource.columnInfo,
        isVisible = !_redundantDescription(oVLParameter, oColumnInfo.columnInfos),
        isDialogTable = oColumnInfo.isDialogTable;
      if (isDropDownList || !isDropDownList && isDialogTable || !isDropDownList && !_hasImportanceHigh(oValueList)) {
        const columnWithHiddenAnnotation = oColumnInfo.columnInfos.find(function (columnInfo) {
          return oVLParameter.ValueListProperty === columnInfo.columnName && columnInfo.hasHiddenAnnotation === true;
        });
        return !columnWithHiddenAnnotation ? isVisible : false;
      } else if (!isDropDownList && _hasImportanceHigh(oValueList)) {
        return oVLParameter && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"] && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High" ? true : false;
      }
      return true;
    },
    getColumnVisibilityInfo: function (oValueList, sPropertyFullPath, bIsDropDownListe, isDialogTable) {
      const oMetaModel = oValueList.$model.getMetaModel();
      const aColumnInfos = [];
      const oColumnInfos = {
        isDialogTable: isDialogTable,
        columnInfos: aColumnInfos
      };
      oValueList.Parameters.forEach(function (oParameter) {
        const oPropertyAnnotations = oMetaModel.getObject(`/${oValueList.CollectionPath}/${oParameter.ValueListProperty}@`);
        const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
        let columnInfo = {};
        if (oTextAnnotation) {
          columnInfo = {
            keyColumnHidden: oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false,
            keyColumnDisplayFormat: oTextAnnotation && _getValueHelpColumnDisplayFormat(oPropertyAnnotations, bIsDropDownListe),
            textColumnName: oTextAnnotation && oTextAnnotation.$Path,
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        } else if (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]) {
          columnInfo = {
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        }
        oColumnInfos.columnInfos.push(columnInfo);
      });
      return oColumnInfos;
    },
    getTableItemsParameters: function (valueListInfo, requestGroupId, isSuggestion, isValueHelpWithFixedValues) {
      const itemParameters = [`path: '/${valueListInfo.CollectionPath}'`];

      // add select to oBindingInfo (BCP 2180255956 / 2170163012)
      const selectString = _build$SelectString(this);
      if (requestGroupId) {
        const selectStringPart = selectString ? `, '${selectString}'` : "";
        itemParameters.push(`parameters: {$$groupId: '${requestGroupId}'${selectStringPart}}`);
      } else if (selectString) {
        itemParameters.push(`parameters: {$select: '${selectString}'}`);
      }
      const isSuspended = valueListInfo.Parameters.some(function (oParameter) {
        return isSuggestion || oParameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn";
      });
      itemParameters.push(`suspended: ${isSuspended}`);
      if (!isValueHelpWithFixedValues) {
        itemParameters.push("length: 10");
      }
      const sortConditionsFromPresentationVariant = ValueListHelper.getSortConditionsFromPresentationVariant(valueListInfo, isSuggestion);
      if (sortConditionsFromPresentationVariant) {
        itemParameters.push(sortConditionsFromPresentationVariant);
      } else if (isValueHelpWithFixedValues) {
        const defaultSortPropertyName = _getDefaultSortPropertyName(valueListInfo);
        if (defaultSortPropertyName) {
          itemParameters.push(`sorter: [{path: '${defaultSortPropertyName}', ascending: true}]`);
        }
      }
      return "{" + itemParameters.join(", ") + "}";
    },
    // Is needed for "external" representation in qunit
    hasImportance: function (oValueListContext) {
      return _hasImportanceHigh(oValueListContext.getObject()) ? "Importance/High" : "None";
    },
    // Is needed for "external" representation in qunit
    getMinScreenWidth: function (oValueList) {
      return _hasImportanceHigh(oValueList) ? "{= ${_VHUI>/minScreenWidth}}" : "416px";
    },
    /**
     * Retrieves the column width for a given property.
     *
     * @param propertyPath The propertyPath
     * @returns The width as a string.
     */
    getColumnWidth: function (propertyPath) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3, _property$annotations3, _property$annotations4, _property$annotations5;
      const property = propertyPath.targetObject;
      let relatedProperty = [property];
      // The additional property could refer to the text, currency, unit or timezone
      const additionalProperty = getAssociatedTextProperty(property) || getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property) || getAssociatedTimezoneProperty(property),
        textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        label = (_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Common) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Label) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.toString(),
        displayMode = textArrangement && getDisplayMode(propertyPath);
      if (additionalProperty) {
        if (displayMode === "Description") {
          relatedProperty = [additionalProperty];
        } else if (!textAnnotation || displayMode && displayMode !== "Value") {
          relatedProperty.push(additionalProperty);
        }
      }
      let size = 0;
      const instances = [];
      relatedProperty.forEach(prop => {
        const propertyTypeConfig = getTypeConfig(prop, undefined);
        const PropertyODataConstructor = ObjectPath.get(propertyTypeConfig.type);
        if (PropertyODataConstructor) {
          instances.push(new PropertyODataConstructor(propertyTypeConfig.formatOptions, propertyTypeConfig.constraints));
        }
      });
      const sWidth = Util.calcColumnWidth(instances, label);
      size = sWidth ? parseFloat(sWidth.replace("rem", "")) : 0;
      if (size === 0) {
        Log.error(`Cannot compute the column width for property: ${property.name}`);
      }
      return size <= 20 ? size.toString() + "rem" : "20rem";
    },
    getOutParameterPaths: function (aParameters) {
      let sPath = "";
      aParameters.forEach(function (oParameter) {
        if (oParameter.$Type.endsWith("Out")) {
          sPath += `{${oParameter.ValueListProperty}}`;
        }
      });
      return sPath;
    },
    entityIsSearchable: function (propertyAnnotations, collectionAnnotations) {
      var _propertyAnnotations$, _collectionAnnotation;
      const searchSupported = (_propertyAnnotations$ = propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.SearchSupported,
        searchable = (_collectionAnnotation = collectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"]) === null || _collectionAnnotation === void 0 ? void 0 : _collectionAnnotation.Searchable;
      if (searchable === undefined && searchSupported === false || searchable === true && searchSupported === false || searchable === false) {
        return false;
      }
      return true;
    },
    /**
     * Returns the condition path required for the condition model.
     * For e.g. <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @param propertyPath The property path
     * @returns The formatted condition path
     * @private
     */
    _getConditionPath: function (metaModel, entitySet, propertyPath) {
      // (see also: sap/fe/core/converters/controls/ListReport/FilterBar.ts)
      const parts = propertyPath.split("/");
      let conditionPath = "",
        partialPath;
      while (parts.length) {
        let part = parts.shift();
        partialPath = partialPath ? `${partialPath}/${part}` : part;
        const property = metaModel.getObject(`${entitySet}/${partialPath}`);
        if (property && property.$kind === "NavigationProperty" && property.$isCollection) {
          part += "*";
        }
        conditionPath = conditionPath ? `${conditionPath}/${part}` : part;
      }
      return conditionPath;
    },
    /**
     * Returns array of column definitions corresponding to properties defined as Selection Fields on the CollectionPath entity set in a ValueHelp.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @returns Array of column definitions
     * @private
     */
    _getColumnDefinitionFromSelectionFields: function (metaModel, entitySet) {
      const columnDefs = [],
        entityTypeAnnotations = metaModel.getObject(`${entitySet}/@`),
        selectionFields = entityTypeAnnotations["@com.sap.vocabularies.UI.v1.SelectionFields"];
      if (selectionFields) {
        selectionFields.forEach(function (selectionField) {
          var _metaModel$getObject;
          const selectionFieldPath = `${entitySet}/${selectionField.$PropertyPath}`,
            conditionPath = ValueListHelper._getConditionPath(metaModel, entitySet, selectionField.$PropertyPath),
            propertyAnnotations = metaModel.getObject(`${selectionFieldPath}@`),
            columnDef = {
              path: conditionPath,
              label: propertyAnnotations[AnnotationLabel] || selectionFieldPath,
              sortable: true,
              filterable: isPropertyFilterable(metaModel, entitySet, selectionField.$PropertyPath, false),
              $Type: (_metaModel$getObject = metaModel.getObject(selectionFieldPath)) === null || _metaModel$getObject === void 0 ? void 0 : _metaModel$getObject.$Type
            };
          columnDefs.push(columnDef);
        });
      }
      return columnDefs;
    },
    _mergeColumnDefinitionsFromProperties: function (columnDefs, valueListInfo, valueListProperty, property, propertyAnnotations) {
      var _propertyAnnotations$2;
      let columnPath = valueListProperty,
        columnPropertyType = property.$Type;
      const label = propertyAnnotations[AnnotationLabel] || columnPath,
        textAnnotation = propertyAnnotations[AnnotationText];
      if (textAnnotation && ((_propertyAnnotations$2 = propertyAnnotations[AnnotationTextUITextArrangement]) === null || _propertyAnnotations$2 === void 0 ? void 0 : _propertyAnnotations$2.$EnumMember) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        // the column property is the one coming from the text annotation
        columnPath = textAnnotation.$Path;
        const textPropertyPath = `/${valueListInfo.CollectionPath}/${columnPath}`;
        columnPropertyType = valueListInfo.$model.getMetaModel().getObject(textPropertyPath).$Type;
      }
      if (columnNotAlreadyDefined(columnDefs, columnPath)) {
        const columnDef = {
          path: columnPath,
          label: label,
          sortable: true,
          filterable: !propertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
          $Type: columnPropertyType
        };
        columnDefs.push(columnDef);
      }
    },
    filterInOutParameters: function (vhParameters, typeFilter) {
      return vhParameters.filter(function (parameter) {
        return typeFilter.indexOf(parameter.parmeterType) > -1;
      });
    },
    getInParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterIn, AnnotationValueListParameterConstant, AnnotationValueListParameterInOut]);
    },
    getOutParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterOut, AnnotationValueListParameterInOut]);
    },
    createVHUIModel: function (valueHelp, propertyPath, metaModel) {
      // setting the _VHUI model evaluated in the ValueListTable fragment
      const vhUIModel = new JSONModel({}),
        propertyAnnotations = metaModel.getObject(`${propertyPath}@`);
      valueHelp.setModel(vhUIModel, "_VHUI");
      // Identifies the "ContextDependent-Scenario"
      vhUIModel.setProperty("/hasValueListRelevantQualifiers", !!propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]);
      /* Property label for dialog title */
      vhUIModel.setProperty("/propertyLabel", propertyAnnotations[AnnotationLabel]);
      return vhUIModel;
    },
    /**
     * Returns the title of the value help dialog.
     * By default, the data field label is used, otherwise either the property label or the value list label is used as a fallback.
     * For context-dependent value helps, by default the value list label is used, otherwise either the property label or the data field label is used as a fallback.
     *
     * @param valueHelp The valueHelp instance
     * @param valuehelpLabel The label in the value help metadata
     * @returns The title for the valueHelp dialog
     * @private
     */
    _getDialogTitle: function (valueHelp, valuehelpLabel) {
      var _valueHelp$getControl;
      const propertyLabel = valueHelp.getModel("_VHUI").getProperty("/propertyLabel");
      const dataFieldLabel = (_valueHelp$getControl = valueHelp.getControl()) === null || _valueHelp$getControl === void 0 ? void 0 : _valueHelp$getControl.getProperty("label");
      return valueHelp.getModel("_VHUI").getProperty("/hasValueListRelevantQualifiers") ? valuehelpLabel || propertyLabel || dataFieldLabel : dataFieldLabel || propertyLabel || valuehelpLabel;
    },
    destroyVHContent: function (valueHelp) {
      if (valueHelp.getDialog()) {
        valueHelp.getDialog().destroyContent();
      }
      if (valueHelp.getTypeahead()) {
        valueHelp.getTypeahead().destroyContent();
      }
    },
    putDefaultQualifierFirst: function (qualifiers) {
      const indexDefaultVH = qualifiers.indexOf("");

      // default ValueHelp without qualifier should be the first
      if (indexDefaultVH > 0) {
        qualifiers.unshift(qualifiers[indexDefaultVH]);
        qualifiers.splice(indexDefaultVH + 1, 1);
      }
      return qualifiers;
    },
    _getContextPrefix: function (bindingContext, propertyBindingParts) {
      if (bindingContext && bindingContext.getPath()) {
        const bindigContextParts = bindingContext.getPath().split("/");
        if (propertyBindingParts.length - bindigContextParts.length > 1) {
          const contextPrefixParts = [];
          for (let i = bindigContextParts.length; i < propertyBindingParts.length - 1; i++) {
            contextPrefixParts.push(propertyBindingParts[i]);
          }
          return `${contextPrefixParts.join("/")}/`;
        }
      }
      return "";
    },
    _getVhParameter: function (conditionModel, valueHelp, contextPrefix, parameter, vhMetaModel, localDataPropertyPath) {
      let valuePath = "";
      const bindingContext = valueHelp.getBindingContext();
      if (conditionModel && conditionModel.length > 0) {
        var _valueHelp$getParent;
        if ((_valueHelp$getParent = valueHelp.getParent()) !== null && _valueHelp$getParent !== void 0 && _valueHelp$getParent.isA("sap.ui.mdc.Table") && bindingContext && ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterIn", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"])) {
          // Special handling for value help used in filter dialog
          const parts = localDataPropertyPath.split("/");
          if (parts.length > 1) {
            const firstNavigationProperty = parts[0];
            const oBoundEntity = vhMetaModel.getMetaContext(bindingContext.getPath());
            const sPathOfTable = valueHelp.getParent().getRowBinding().getPath(); //TODO
            if (oBoundEntity.getObject(`${sPathOfTable}/$Partner`) === firstNavigationProperty) {
              // Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
              // referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
              valuePath = localDataPropertyPath.replace(firstNavigationProperty + "/", "");
            }
          }
        }
        if (!valuePath) {
          valuePath = conditionModel + ">/conditions/" + localDataPropertyPath;
        }
      } else {
        valuePath = contextPrefix + localDataPropertyPath;
      }
      return {
        parmeterType: parameter.$Type,
        source: valuePath,
        helpPath: parameter.ValueListProperty,
        constantValue: parameter.Constant,
        initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
      };
    },
    _parameterIsA(parameter, parameterTypes) {
      return parameterTypes.includes(parameter.$Type);
    },
    _enrichPath: function (path, propertyPath, localDataPropertyPath, parameter, propertyName, propertyAnnotations) {
      if (!path.key && ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && localDataPropertyPath === propertyName) {
        var _propertyAnnotations$3;
        path.fieldPropertyPath = propertyPath;
        path.key = parameter.ValueListProperty;

        //Only the text annotation of the key can specify the description
        path.descriptionPath = ((_propertyAnnotations$3 = propertyAnnotations[AnnotationText]) === null || _propertyAnnotations$3 === void 0 ? void 0 : _propertyAnnotations$3.$Path) || "";
      }
    },
    _enrichKeys: function (vhKeys, parameter) {
      if (ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterIn", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && !vhKeys.includes(parameter.ValueListProperty)) {
        vhKeys.push(parameter.ValueListProperty);
      }
    },
    _processParameters: function (annotationValueListType, propertyName, conditionModel, valueHelp, contextPrefix, vhMetaModel, valueHelpQualifier) {
      const metaModel = annotationValueListType.$model.getMetaModel(),
        entitySetPath = `/${annotationValueListType.CollectionPath}`,
        entityType = metaModel.getObject(`${entitySetPath}/`);
      if (entityType === undefined) {
        Log.error(`Inconsistent value help metadata: Entity ${entitySetPath} is not defined`);
        return;
      }
      const columnDefs = ValueListHelper._getColumnDefinitionFromSelectionFields(metaModel, entitySetPath),
        vhParameters = [],
        vhKeys = entityType.$Key ? [...entityType.$Key] : [];
      const path = {
        fieldPropertyPath: "",
        descriptionPath: "",
        key: ""
      };
      for (const parameter of annotationValueListType.Parameters) {
        var _parameter$LocalDataP;
        //All String fields are allowed for filter
        const propertyPath = `/${annotationValueListType.CollectionPath}/${parameter.ValueListProperty}`,
          property = metaModel.getObject(propertyPath),
          propertyAnnotations = metaModel.getObject(`${propertyPath}@`) || {},
          localDataPropertyPath = ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) || "";

        // If property is undefined, then the property coming for the entry isn't defined in
        // the metamodel, therefore we don't need to add it in the in/out parameters
        if (property) {
          // Search for the *out Parameter mapped to the local property
          ValueListHelper._enrichPath(path, propertyPath, localDataPropertyPath, parameter, propertyName, propertyAnnotations);
          const valueListProperty = parameter.ValueListProperty;
          ValueListHelper._mergeColumnDefinitionsFromProperties(columnDefs, annotationValueListType, valueListProperty, property, propertyAnnotations);
        }

        //In and InOut and Out
        if (ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterIn", "com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && localDataPropertyPath !== propertyName) {
          const vhParameter = ValueListHelper._getVhParameter(conditionModel, valueHelp, contextPrefix, parameter, vhMetaModel, localDataPropertyPath);
          vhParameters.push(vhParameter);
        }

        //Constant as InParamter for filtering
        if (parameter.$Type === AnnotationValueListParameterConstant) {
          vhParameters.push({
            parmeterType: parameter.$Type,
            source: parameter.ValueListProperty,
            helpPath: parameter.ValueListProperty,
            constantValue: parameter.Constant,
            initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
          });
        }

        // Enrich keys with out-parameters
        ValueListHelper._enrichKeys(vhKeys, parameter);
      }

      /* Ensure that vhKeys are part of the columnDefs, otherwise it is not considered in $select (BCP 2270141154) */
      for (const vhKey of vhKeys) {
        if (columnNotAlreadyDefined(columnDefs, vhKey)) {
          var _metaModel$getObject2;
          const columnDef = {
            path: vhKey,
            $Type: (_metaModel$getObject2 = metaModel.getObject(`/${annotationValueListType.CollectionPath}/${path.key}`)) === null || _metaModel$getObject2 === void 0 ? void 0 : _metaModel$getObject2.$Type,
            label: "",
            sortable: false,
            filterable: undefined
          };
          columnDefs.push(columnDef);
        }
      }
      const valuelistInfo = {
        keyPath: path.key,
        descriptionPath: path.descriptionPath,
        fieldPropertyPath: path.fieldPropertyPath,
        vhKeys: vhKeys,
        vhParameters: vhParameters,
        valueListInfo: annotationValueListType,
        columnDefs: columnDefs,
        valueHelpQualifier
      };
      return valuelistInfo;
    },
    _logError: function (propertyPath, error) {
      const status = error ? error.status : undefined;
      const message = error instanceof Error ? error.message : String(error);
      const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;
      Log.error(msg);
    },
    getValueListInfo: async function (valueHelp, propertyPath, payload) {
      const bindingContext = valueHelp.getBindingContext(),
        conditionModel = payload.conditionModel,
        vhMetaModel = valueHelp.getModel().getMetaModel(),
        valueListInfos = [],
        propertyPathParts = propertyPath.split("/");
      try {
        const valueListByQualifier = await vhMetaModel.requestValueListInfo(propertyPath, true, bindingContext);
        const valueHelpQualifiers = ValueListHelper.putDefaultQualifierFirst(Object.keys(valueListByQualifier)),
          propertyName = propertyPathParts.pop();
        const contextPrefix = payload.useMultiValueField ? ValueListHelper._getContextPrefix(bindingContext, propertyPathParts) : "";
        for (const valueHelpQualifier of valueHelpQualifiers) {
          // Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
          const annotationValueListType = valueListByQualifier[valueHelpQualifier];
          const valueListInfo = ValueListHelper._processParameters(annotationValueListType, propertyName, conditionModel, valueHelp, contextPrefix, vhMetaModel, valueHelpQualifier);
          /* Only consistent value help definitions shall be part of the value help */
          if (valueListInfo) {
            valueListInfos.push(valueListInfo);
          }
        }
      } catch (err) {
        this._logError(propertyPath, err);
        ValueListHelper.destroyVHContent(valueHelp);
      }
      return valueListInfos;
    },
    ALLFRAGMENTS: undefined,
    logFragment: undefined,
    _logTemplatedFragments: function (propertyPath, fragmentName, fragmentDefinition) {
      const logInfo = {
        path: propertyPath,
        fragmentName: fragmentName,
        fragment: fragmentDefinition
      };
      if (Log.getLevel() === Level.DEBUG) {
        //In debug mode we log all generated fragments
        ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
        ValueListHelper.ALLFRAGMENTS.push(logInfo);
      }
      if (ValueListHelper.logFragment) {
        //One Tool Subscriber allowed
        setTimeout(function () {
          ValueListHelper.logFragment(logInfo);
        }, 0);
      }
    },
    _templateFragment: async function (fragmentName, valueListInfo, sourceModel, propertyPath) {
      const localValueListInfo = valueListInfo.valueListInfo,
        valueListModel = new JSONModel(localValueListInfo),
        valueListServiceMetaModel = localValueListInfo.$model.getMetaModel(),
        viewData = new JSONModel({
          converterType: "ListReport",
          columns: valueListInfo.columnDefs || null
        });
      const fragmentDefinition = await XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(fragmentName, "fragment"), {
        name: fragmentName
      }, {
        bindingContexts: {
          valueList: valueListModel.createBindingContext("/"),
          contextPath: valueListServiceMetaModel.createBindingContext(`/${localValueListInfo.CollectionPath}/`),
          source: sourceModel.createBindingContext("/")
        },
        models: {
          valueList: valueListModel,
          contextPath: valueListServiceMetaModel,
          source: sourceModel,
          metaModel: valueListServiceMetaModel,
          viewData: viewData
        }
      });
      ValueListHelper._logTemplatedFragments(propertyPath, fragmentName, fragmentDefinition);
      return await Fragment.load({
        definition: fragmentDefinition
      });
    },
    _getContentId: function (valueHelpId, valueHelpQualifier, isTypeahead) {
      const contentType = isTypeahead ? "Popover" : "Dialog";
      return `${valueHelpId}::${contentType}::qualifier::${valueHelpQualifier}`;
    },
    _addInOutParametersToPayload: function (payload, valueListInfo) {
      const valueHelpQualifier = valueListInfo.valueHelpQualifier;
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      if (!payload.qualifiers[valueHelpQualifier]) {
        payload.qualifiers[valueHelpQualifier] = {
          vhKeys: valueListInfo.vhKeys,
          vhParameters: valueListInfo.vhParameters
        };
      }
    },
    _getValueHelpColumnDisplayFormat: function (propertyAnnotations, isValueHelpWithFixedValues) {
      const displayMode = CommonUtils.computeDisplayMode(propertyAnnotations, undefined),
        textAnnotation = propertyAnnotations && propertyAnnotations[AnnotationText],
        textArrangementAnnotation = textAnnotation && propertyAnnotations[AnnotationTextUITextArrangement];
      if (isValueHelpWithFixedValues) {
        return textAnnotation && typeof textAnnotation !== "string" && textAnnotation.$Path ? displayMode : "Value";
      } else {
        // Only explicit defined TextArrangements in a Value Help with Dialog are considered
        return textArrangementAnnotation ? displayMode : "Value";
      }
    },
    _getWidthInRem: function (control, isUnitValueHelp) {
      let width = control.$().width(); // JQuery
      if (isUnitValueHelp && width) {
        width = 0.3 * width;
      }
      const floatWidth = width ? parseFloat(String(Rem.fromPx(width))) : 0;
      return isNaN(floatWidth) ? 0 : floatWidth;
    },
    _getTableWidth: function (table, minWidth) {
      let width;
      const columns = table.getColumns(),
        visibleColumns = columns && columns.filter(function (column) {
          return column && column.getVisible && column.getVisible();
        }) || [],
        sumWidth = visibleColumns.reduce(function (sum, column) {
          width = column.getWidth();
          if (width && width.endsWith("px")) {
            width = String(Rem.fromPx(width));
          }
          const floatWidth = parseFloat(width);
          return sum + (isNaN(floatWidth) ? 9 : floatWidth);
        }, visibleColumns.length);
      return `${Math.max(sumWidth, minWidth)}em`;
    },
    _createValueHelpTypeahead: async function (propertyPath, valueHelp, content, valueListInfo, payload) {
      const contentId = content.getId(),
        propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`),
        valueHelpWithFixedValues = propertyAnnotations[AnnotationValueListWithFixedValues] ?? false,
        isDialogTable = false,
        columnInfo = ValueListHelper.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, valueHelpWithFixedValues, isDialogTable),
        sourceModel = new JSONModel({
          id: contentId,
          groupId: payload.requestGroupId || undefined,
          bSuggestion: true,
          propertyPath: propertyPath,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: valueHelpWithFixedValues
        });
      content.setKeyPath(valueListInfo.keyPath);
      content.setDescriptionPath(valueListInfo.descriptionPath);
      payload.isValueListWithFixedValues = valueHelpWithFixedValues;
      const collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      const table = await ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListTable", valueListInfo, sourceModel, propertyPath);
      table.setModel(valueListInfo.valueListInfo.$model);
      Log.info(`Value List- suggest Table XML content created [${propertyPath}]`, table.getMetadata().getName(), "MDC Templating");
      content.setTable(table);
      const field = valueHelp.getControl();
      if (field !== undefined && (field.isA("sap.ui.mdc.FilterField") || field.isA("sap.ui.mdc.Field") || field.isA("sap.ui.mdc.MultiValueField"))) {
        //Can the filterfield be something else that we need the .isA() check?
        const reduceWidthForUnitValueHelp = Boolean(payload.isUnitValueHelp);
        const tableWidth = ValueListHelper._getTableWidth(table, ValueListHelper._getWidthInRem(field, reduceWidthForUnitValueHelp));
        table.setWidth(tableWidth);
        if (valueHelpWithFixedValues) {
          table.setMode(field.getMaxConditions() === 1 ? "SingleSelectMaster" : "MultiSelect");
        } else {
          table.setMode("SingleSelectMaster");
        }
      }
    },
    _createValueHelpDialog: async function (propertyPath, valueHelp, content, valueListInfo, payload) {
      const propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`),
        isDropDownListe = false,
        isDialogTable = true,
        columnInfo = ValueListHelper.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, isDropDownListe, isDialogTable),
        sourceModel = new JSONModel({
          id: content.getId(),
          groupId: payload.requestGroupId || undefined,
          bSuggestion: false,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: isDropDownListe
        });
      content.setKeyPath(valueListInfo.keyPath);
      content.setDescriptionPath(valueListInfo.descriptionPath);
      const collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      const tablePromise = ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListDialogTable", valueListInfo, sourceModel, propertyPath);
      const filterBarPromise = ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListFilterBar", valueListInfo, sourceModel, propertyPath);
      const [table, filterBar] = await Promise.all([tablePromise, filterBarPromise]);
      table.setModel(valueListInfo.valueListInfo.$model);
      filterBar.setModel(valueListInfo.valueListInfo.$model);
      content.setFilterBar(filterBar);
      content.setTable(table);
      table.setFilter(filterBar.getId());
      table.initialized();
      const field = valueHelp.getControl();
      if (field !== undefined) {
        table.setSelectionMode(field.getMaxConditions() === 1 ? "SingleMaster" : "Multi");
      }
      table.setWidth("100%");

      //This is a temporary workarround - provided by MDC (see FIORITECHP1-24002)
      const mdcTable = table;
      mdcTable._setShowP13nButton(false);
    },
    _getContentById: function (contentList, contentId) {
      return contentList.find(function (item) {
        return item.getId() === contentId;
      });
    },
    _createPopoverContent: function (contentId, caseSensitive, useAsValueHelp) {
      return new MTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive,
        useAsValueHelp: useAsValueHelp
      });
    },
    _createDialogContent: function (contentId, caseSensitive, forceBind) {
      return new MDCTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive,
        forceBind: forceBind
      });
    },
    _showConditionsContent: function (contentList, container) {
      let conditionsContent = contentList.length && contentList[contentList.length - 1].getMetadata().getName() === "sap.ui.mdc.valuehelp.content.Conditions" ? contentList[contentList.length - 1] : undefined;
      if (conditionsContent) {
        conditionsContent.setVisible(true);
      } else {
        conditionsContent = new Conditions();
        container.addContent(conditionsContent);
      }
    },
    _alignOrCreateContent: function (valueListInfo, contentId, caseSensitive, showConditionPanel, container) {
      const contentList = container.getContent();
      let content = ValueListHelper._getContentById(contentList, contentId);
      if (!content) {
        const forceBind = valueListInfo.valueListInfo.FetchValues === 2 ? false : true;
        content = ValueListHelper._createDialogContent(contentId, caseSensitive, forceBind);
        if (!showConditionPanel) {
          container.addContent(content);
        } else {
          container.insertContent(content, contentList.length - 1); // insert content before conditions content
        }
      } else {
        content.setVisible(true);
      }
      return content;
    },
    _prepareValueHelpTypeAhead: function (valueHelp, container, valueListInfos, payload, caseSensitive, firstTypeAheadContent) {
      const contentList = container.getContent();
      let qualifierForTypeahead = valueHelp.data("valuelistForValidation") || ""; // can also be null
      if (qualifierForTypeahead === " ") {
        qualifierForTypeahead = "";
      }
      const valueListInfo = qualifierForTypeahead ? valueListInfos.filter(function (subValueListInfo) {
        return subValueListInfo.valueHelpQualifier === qualifierForTypeahead;
      })[0] : valueListInfos[0];
      ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);
      const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueListInfo.valueHelpQualifier, true);
      let content = ValueListHelper._getContentById(contentList, contentId);
      if (!content) {
        const useAsValueHelp = firstTypeAheadContent.getUseAsValueHelp();
        content = ValueListHelper._createPopoverContent(contentId, caseSensitive, useAsValueHelp);
        container.insertContent(content, 0); // insert content as first content
      } else if (contentId !== contentList[0].getId()) {
        // content already available but not as first content?
        container.removeContent(content);
        container.insertContent(content, 0); // move content to first position
      }

      return {
        valueListInfo,
        content
      };
    },
    _prepareValueHelpDialog: function (valueHelp, container, valueListInfos, payload, selectedContentId, caseSensitive) {
      const showConditionPanel = valueHelp.data("showConditionPanel") && valueHelp.data("showConditionPanel") !== "false";
      const contentList = container.getContent();

      // set all contents to invisible
      for (const contentListItem of contentList) {
        contentListItem.setVisible(false);
      }
      if (showConditionPanel) {
        this._showConditionsContent(contentList, container);
      }
      let selectedInfo, selectedContent;

      // Create or reuse contents for the current context
      for (const valueListInfo of valueListInfos) {
        const valueHelpQualifier = valueListInfo.valueHelpQualifier;
        ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);
        const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueHelpQualifier, false);
        const content = this._alignOrCreateContent(valueListInfo, contentId, caseSensitive, showConditionPanel, container);
        if (valueListInfo.valueListInfo.Label) {
          const title = CommonUtils.getTranslatedTextFromExpBindingString(valueListInfo.valueListInfo.Label, valueHelp.getControl());
          content.setTitle(title);
        }
        if (!selectedContent || selectedContentId && selectedContentId === contentId) {
          selectedContent = content;
          selectedInfo = valueListInfo;
        }
      }
      if (!selectedInfo || !selectedContent) {
        throw new Error("selectedInfo or selectedContent undefined");
      }
      return {
        selectedInfo,
        selectedContent
      };
    },
    showValueList: async function (payload, container, selectedContentId) {
      const valueHelp = container.getParent(),
        isTypeahead = container.isTypeahead(),
        propertyPath = payload.propertyPath,
        metaModel = valueHelp.getModel().getMetaModel(),
        vhUIModel = valueHelp.getModel("_VHUI") || ValueListHelper.createVHUIModel(valueHelp, propertyPath, metaModel);
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      vhUIModel.setProperty("/isSuggestion", isTypeahead);
      vhUIModel.setProperty("/minScreenWidth", !isTypeahead ? "418px" : undefined);
      try {
        const valueListInfos = await ValueListHelper.getValueListInfo(valueHelp, propertyPath, payload);
        const firstTypeAheadContent = valueHelp.getTypeahead().getContent()[0],
          caseSensitive = firstTypeAheadContent.getCaseSensitive(); // take caseSensitive from first Typeahead content

        if (isTypeahead) {
          const {
            valueListInfo,
            content
          } = ValueListHelper._prepareValueHelpTypeAhead(valueHelp, container, valueListInfos, payload, caseSensitive, firstTypeAheadContent);
          payload.valueHelpQualifier = valueListInfo.valueHelpQualifier;
          if (content.getTable() === undefined || content.getTable() === null) {
            await ValueListHelper._createValueHelpTypeahead(propertyPath, valueHelp, content, valueListInfo, payload);
          }
        } else {
          var _selectedInfo$valueLi;
          const {
            selectedInfo,
            selectedContent
          } = ValueListHelper._prepareValueHelpDialog(valueHelp, container, valueListInfos, payload, selectedContentId, caseSensitive);
          payload.valueHelpQualifier = selectedInfo.valueHelpQualifier;
          /* For context depentent value helps the value list label is used for the dialog title */
          const title = CommonUtils.getTranslatedTextFromExpBindingString(ValueListHelper._getDialogTitle(valueHelp, (_selectedInfo$valueLi = selectedInfo.valueListInfo) === null || _selectedInfo$valueLi === void 0 ? void 0 : _selectedInfo$valueLi.Label), valueHelp.getControl());
          container.setTitle(title);
          if (selectedContent.getTable() === undefined || selectedContent.getTable() === null) {
            await ValueListHelper._createValueHelpDialog(propertyPath, valueHelp, selectedContent, selectedInfo, payload);
          }
        }
      } catch (err) {
        this._logError(propertyPath, err);
        ValueListHelper.destroyVHContent(valueHelp);
      }
    }
  };
  return ValueListHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCIsImNvbHVtbkRlZnMiLCJ2aEtleSIsInNvbWUiLCJjb2x1bW4iLCJwYXRoIiwiQW5ub3RhdGlvbkxhYmVsIiwiQW5ub3RhdGlvblRleHQiLCJBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluIiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlck91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJfZ2V0RGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUiLCJ2YWx1ZUxpc3RJbmZvIiwic29ydEZpZWxkTmFtZSIsIm1ldGFNb2RlbCIsIiRtb2RlbCIsImdldE1ldGFNb2RlbCIsImVudGl0eVNldEFubm90YXRpb25zIiwiZ2V0T2JqZWN0IiwiQ29sbGVjdGlvblBhdGgiLCJzb3J0UmVzdHJpY3Rpb25zSW5mbyIsImdldFNvcnRSZXN0cmljdGlvbnNJbmZvIiwiZm91bmRFbGVtZW50IiwiUGFyYW1ldGVycyIsImZpbmQiLCJlbGVtZW50IiwiJFR5cGUiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsInByb3BlcnR5SW5mbyIsInNvcnRhYmxlIiwidW5kZWZpbmVkIiwiX3JlZHVuZGFudERlc2NyaXB0aW9uIiwib1ZMUGFyYW1ldGVyIiwiYUNvbHVtbkluZm8iLCJvQ29sdW1uSW5mbyIsImNvbHVtbkluZm8iLCJ0ZXh0Q29sdW1uTmFtZSIsImtleUNvbHVtbkhpZGRlbiIsImtleUNvbHVtbkRpc3BsYXlGb3JtYXQiLCJfaGFzSW1wb3J0YW5jZUhpZ2giLCJvVmFsdWVMaXN0Q29udGV4dCIsIm9QYXJhbWV0ZXIiLCIkRW51bU1lbWJlciIsIl9idWlsZCRTZWxlY3RTdHJpbmciLCJjb250cm9sIiwib1ZpZXdEYXRhIiwiZ2V0TW9kZWwiLCJvRGF0YSIsImdldERhdGEiLCJhQ29sdW1ucyIsImNvbHVtbnMiLCJyZWR1Y2UiLCJzUXVlcnkiLCJvUHJvcGVydHkiLCJpbmRleE9mIiwiX2dldFZhbHVlSGVscENvbHVtbkRpc3BsYXlGb3JtYXQiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsImlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzIiwic0Rpc3BsYXlNb2RlIiwiQ29tbW9uVXRpbHMiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJvVGV4dEFubm90YXRpb24iLCJvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIiRQYXRoIiwiVmFsdWVMaXN0SGVscGVyIiwiZ2V0VmFsdWVMaXN0Q29sbGVjdGlvbkVudGl0eVNldCIsIm1WYWx1ZUxpc3QiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFRhYmxlRGVsZWdhdGUiLCJvVmFsdWVMaXN0Iiwic0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwiZ2V0U29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsImlzU3VnZ2VzdGlvbiIsIlByZXNlbnRhdGlvblZhcmlhbnRRdWFsaWZpZXIiLCJwcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyIiwicHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiU29ydE9yZGVyIiwic29ydENvbmRpdGlvbnMiLCJzb3J0ZXJzIiwiZm9yRWFjaCIsImNvbmRpdGlvbiIsInNvcnRlciIsInByb3BlcnR5UGF0aCIsIlByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIm5hbWUiLCJEZXNjZW5kaW5nIiwiZGVzY2VuZGluZyIsImFzY2VuZGluZyIsInB1c2giLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0UHJvcGVydHlQYXRoIiwib1BhcmFtZXRlcnMiLCJVbmJvdW5kQWN0aW9uIiwiRW50aXR5VHlwZVBhdGgiLCJBY3Rpb24iLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldFZhbHVlTGlzdFByb3BlcnR5Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9WYWx1ZUxpc3RNb2RlbCIsImdldENvbHVtblZpc2liaWxpdHkiLCJvU291cmNlIiwiaXNEcm9wRG93bkxpc3QiLCJ2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJpc1Zpc2libGUiLCJjb2x1bW5JbmZvcyIsImlzRGlhbG9nVGFibGUiLCJjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiIsImNvbHVtbk5hbWUiLCJoYXNIaWRkZW5Bbm5vdGF0aW9uIiwiZ2V0Q29sdW1uVmlzaWJpbGl0eUluZm8iLCJzUHJvcGVydHlGdWxsUGF0aCIsImJJc0Ryb3BEb3duTGlzdGUiLCJvTWV0YU1vZGVsIiwiYUNvbHVtbkluZm9zIiwib0NvbHVtbkluZm9zIiwiZ2V0VGFibGVJdGVtc1BhcmFtZXRlcnMiLCJyZXF1ZXN0R3JvdXBJZCIsIml0ZW1QYXJhbWV0ZXJzIiwic2VsZWN0U3RyaW5nIiwic2VsZWN0U3RyaW5nUGFydCIsImlzU3VzcGVuZGVkIiwic29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsImRlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwiam9pbiIsImhhc0ltcG9ydGFuY2UiLCJnZXRNaW5TY3JlZW5XaWR0aCIsImdldENvbHVtbldpZHRoIiwicHJvcGVydHkiLCJ0YXJnZXRPYmplY3QiLCJyZWxhdGVkUHJvcGVydHkiLCJhZGRpdGlvbmFsUHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJ0ZXh0QW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInRleHRBcnJhbmdlbWVudCIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwidG9TdHJpbmciLCJsYWJlbCIsIkxhYmVsIiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsInNpemUiLCJpbnN0YW5jZXMiLCJwcm9wIiwicHJvcGVydHlUeXBlQ29uZmlnIiwiZ2V0VHlwZUNvbmZpZyIsIlByb3BlcnR5T0RhdGFDb25zdHJ1Y3RvciIsIk9iamVjdFBhdGgiLCJnZXQiLCJ0eXBlIiwiZm9ybWF0T3B0aW9ucyIsImNvbnN0cmFpbnRzIiwic1dpZHRoIiwiVXRpbCIsImNhbGNDb2x1bW5XaWR0aCIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwiTG9nIiwiZXJyb3IiLCJnZXRPdXRQYXJhbWV0ZXJQYXRocyIsImFQYXJhbWV0ZXJzIiwic1BhdGgiLCJlbmRzV2l0aCIsImVudGl0eUlzU2VhcmNoYWJsZSIsInByb3BlcnR5QW5ub3RhdGlvbnMiLCJjb2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJzZWFyY2hTdXBwb3J0ZWQiLCJTZWFyY2hTdXBwb3J0ZWQiLCJzZWFyY2hhYmxlIiwiU2VhcmNoYWJsZSIsIl9nZXRDb25kaXRpb25QYXRoIiwiZW50aXR5U2V0IiwicGFydHMiLCJzcGxpdCIsImNvbmRpdGlvblBhdGgiLCJwYXJ0aWFsUGF0aCIsImxlbmd0aCIsInBhcnQiLCJzaGlmdCIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsInNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbkZpZWxkIiwic2VsZWN0aW9uRmllbGRQYXRoIiwiY29sdW1uRGVmIiwiZmlsdGVyYWJsZSIsImlzUHJvcGVydHlGaWx0ZXJhYmxlIiwiX21lcmdlQ29sdW1uRGVmaW5pdGlvbnNGcm9tUHJvcGVydGllcyIsInZhbHVlTGlzdFByb3BlcnR5IiwiY29sdW1uUGF0aCIsImNvbHVtblByb3BlcnR5VHlwZSIsInRleHRQcm9wZXJ0eVBhdGgiLCJmaWx0ZXJJbk91dFBhcmFtZXRlcnMiLCJ2aFBhcmFtZXRlcnMiLCJ0eXBlRmlsdGVyIiwiZmlsdGVyIiwicGFyYW1ldGVyIiwicGFybWV0ZXJUeXBlIiwiZ2V0SW5QYXJhbWV0ZXJzIiwiZ2V0T3V0UGFyYW1ldGVycyIsImNyZWF0ZVZIVUlNb2RlbCIsInZhbHVlSGVscCIsInZoVUlNb2RlbCIsIkpTT05Nb2RlbCIsInNldE1vZGVsIiwic2V0UHJvcGVydHkiLCJfZ2V0RGlhbG9nVGl0bGUiLCJ2YWx1ZWhlbHBMYWJlbCIsInByb3BlcnR5TGFiZWwiLCJnZXRQcm9wZXJ0eSIsImRhdGFGaWVsZExhYmVsIiwiZ2V0Q29udHJvbCIsImRlc3Ryb3lWSENvbnRlbnQiLCJnZXREaWFsb2ciLCJkZXN0cm95Q29udGVudCIsImdldFR5cGVhaGVhZCIsInB1dERlZmF1bHRRdWFsaWZpZXJGaXJzdCIsInF1YWxpZmllcnMiLCJpbmRleERlZmF1bHRWSCIsInVuc2hpZnQiLCJzcGxpY2UiLCJfZ2V0Q29udGV4dFByZWZpeCIsImJpbmRpbmdDb250ZXh0IiwicHJvcGVydHlCaW5kaW5nUGFydHMiLCJnZXRQYXRoIiwiYmluZGlnQ29udGV4dFBhcnRzIiwiY29udGV4dFByZWZpeFBhcnRzIiwiaSIsIl9nZXRWaFBhcmFtZXRlciIsImNvbmRpdGlvbk1vZGVsIiwiY29udGV4dFByZWZpeCIsInZoTWV0YU1vZGVsIiwibG9jYWxEYXRhUHJvcGVydHlQYXRoIiwidmFsdWVQYXRoIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJnZXRQYXJlbnQiLCJpc0EiLCJfcGFyYW1ldGVySXNBIiwiZmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkiLCJvQm91bmRFbnRpdHkiLCJnZXRNZXRhQ29udGV4dCIsInNQYXRoT2ZUYWJsZSIsImdldFJvd0JpbmRpbmciLCJzb3VyY2UiLCJoZWxwUGF0aCIsImNvbnN0YW50VmFsdWUiLCJDb25zdGFudCIsImluaXRpYWxWYWx1ZUZpbHRlckVtcHR5IiwiQm9vbGVhbiIsIkluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQiLCJwYXJhbWV0ZXJUeXBlcyIsImluY2x1ZGVzIiwiX2VucmljaFBhdGgiLCJwcm9wZXJ0eU5hbWUiLCJrZXkiLCJmaWVsZFByb3BlcnR5UGF0aCIsImRlc2NyaXB0aW9uUGF0aCIsIl9lbnJpY2hLZXlzIiwidmhLZXlzIiwiX3Byb2Nlc3NQYXJhbWV0ZXJzIiwiYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJlbnRpdHlTZXRQYXRoIiwiZW50aXR5VHlwZSIsIiRLZXkiLCJMb2NhbERhdGFQcm9wZXJ0eSIsInZoUGFyYW1ldGVyIiwidmFsdWVsaXN0SW5mbyIsImtleVBhdGgiLCJfbG9nRXJyb3IiLCJzdGF0dXMiLCJtZXNzYWdlIiwiRXJyb3IiLCJTdHJpbmciLCJtc2ciLCJnZXRWYWx1ZUxpc3RJbmZvIiwicGF5bG9hZCIsInZhbHVlTGlzdEluZm9zIiwicHJvcGVydHlQYXRoUGFydHMiLCJ2YWx1ZUxpc3RCeVF1YWxpZmllciIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwidmFsdWVIZWxwUXVhbGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJwb3AiLCJ1c2VNdWx0aVZhbHVlRmllbGQiLCJlcnIiLCJBTExGUkFHTUVOVFMiLCJsb2dGcmFnbWVudCIsIl9sb2dUZW1wbGF0ZWRGcmFnbWVudHMiLCJmcmFnbWVudE5hbWUiLCJmcmFnbWVudERlZmluaXRpb24iLCJsb2dJbmZvIiwiZnJhZ21lbnQiLCJnZXRMZXZlbCIsIkxldmVsIiwiREVCVUciLCJzZXRUaW1lb3V0IiwiX3RlbXBsYXRlRnJhZ21lbnQiLCJzb3VyY2VNb2RlbCIsImxvY2FsVmFsdWVMaXN0SW5mbyIsInZhbHVlTGlzdE1vZGVsIiwidmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCIsInZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsImJpbmRpbmdDb250ZXh0cyIsInZhbHVlTGlzdCIsImNvbnRleHRQYXRoIiwibW9kZWxzIiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIl9nZXRDb250ZW50SWQiLCJ2YWx1ZUhlbHBJZCIsImlzVHlwZWFoZWFkIiwiY29udGVudFR5cGUiLCJfYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkIiwidGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIl9nZXRXaWR0aEluUmVtIiwiaXNVbml0VmFsdWVIZWxwIiwid2lkdGgiLCIkIiwiZmxvYXRXaWR0aCIsIlJlbSIsImZyb21QeCIsImlzTmFOIiwiX2dldFRhYmxlV2lkdGgiLCJ0YWJsZSIsIm1pbldpZHRoIiwiZ2V0Q29sdW1ucyIsInZpc2libGVDb2x1bW5zIiwiZ2V0VmlzaWJsZSIsInN1bVdpZHRoIiwic3VtIiwiZ2V0V2lkdGgiLCJNYXRoIiwibWF4IiwiX2NyZWF0ZVZhbHVlSGVscFR5cGVhaGVhZCIsImNvbnRlbnQiLCJjb250ZW50SWQiLCJnZXRJZCIsImlkIiwiZ3JvdXBJZCIsImJTdWdnZXN0aW9uIiwic2V0S2V5UGF0aCIsInNldERlc2NyaXB0aW9uUGF0aCIsImlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwic2V0RmlsdGVyRmllbGRzIiwiaW5mbyIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsInNldFRhYmxlIiwiZmllbGQiLCJyZWR1Y2VXaWR0aEZvclVuaXRWYWx1ZUhlbHAiLCJ0YWJsZVdpZHRoIiwic2V0V2lkdGgiLCJzZXRNb2RlIiwiZ2V0TWF4Q29uZGl0aW9ucyIsIl9jcmVhdGVWYWx1ZUhlbHBEaWFsb2ciLCJpc0Ryb3BEb3duTGlzdGUiLCJ0YWJsZVByb21pc2UiLCJmaWx0ZXJCYXJQcm9taXNlIiwiZmlsdGVyQmFyIiwiUHJvbWlzZSIsImFsbCIsInNldEZpbHRlckJhciIsInNldEZpbHRlciIsImluaXRpYWxpemVkIiwic2V0U2VsZWN0aW9uTW9kZSIsIm1kY1RhYmxlIiwiX3NldFNob3dQMTNuQnV0dG9uIiwiX2dldENvbnRlbnRCeUlkIiwiY29udGVudExpc3QiLCJpdGVtIiwiX2NyZWF0ZVBvcG92ZXJDb250ZW50IiwiY2FzZVNlbnNpdGl2ZSIsInVzZUFzVmFsdWVIZWxwIiwiTVRhYmxlIiwiZ3JvdXAiLCJfY3JlYXRlRGlhbG9nQ29udGVudCIsImZvcmNlQmluZCIsIk1EQ1RhYmxlIiwiX3Nob3dDb25kaXRpb25zQ29udGVudCIsImNvbnRhaW5lciIsImNvbmRpdGlvbnNDb250ZW50Iiwic2V0VmlzaWJsZSIsIkNvbmRpdGlvbnMiLCJhZGRDb250ZW50IiwiX2FsaWduT3JDcmVhdGVDb250ZW50Iiwic2hvd0NvbmRpdGlvblBhbmVsIiwiZ2V0Q29udGVudCIsIkZldGNoVmFsdWVzIiwiaW5zZXJ0Q29udGVudCIsIl9wcmVwYXJlVmFsdWVIZWxwVHlwZUFoZWFkIiwiZmlyc3RUeXBlQWhlYWRDb250ZW50IiwicXVhbGlmaWVyRm9yVHlwZWFoZWFkIiwiZGF0YSIsInN1YlZhbHVlTGlzdEluZm8iLCJnZXRVc2VBc1ZhbHVlSGVscCIsInJlbW92ZUNvbnRlbnQiLCJfcHJlcGFyZVZhbHVlSGVscERpYWxvZyIsInNlbGVjdGVkQ29udGVudElkIiwiY29udGVudExpc3RJdGVtIiwic2VsZWN0ZWRJbmZvIiwic2VsZWN0ZWRDb250ZW50IiwidGl0bGUiLCJnZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nIiwic2V0VGl0bGUiLCJzaG93VmFsdWVMaXN0IiwiZ2V0Q2FzZVNlbnNpdGl2ZSIsImdldFRhYmxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWYWx1ZUxpc3RIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB0eXBlIHsgUHJlc2VudGF0aW9uVmFyaWFudCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2csIHsgTGV2ZWwgfSBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGdldFNvcnRSZXN0cmljdGlvbnNJbmZvLCBpc1Byb3BlcnR5RmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlLCBnZXRUeXBlQ29uZmlnIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL20vVGFibGVcIjtcbmltcG9ydCBVdGlsIGZyb20gXCJzYXAvbS90YWJsZS9VdGlsXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IFJlbSBmcm9tIFwic2FwL3VpL2RvbS91bml0cy9SZW1cIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgdHlwZSBGaWVsZEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgdHlwZSBNZGNGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvZmlsdGVyYmFyL0ZpbHRlckJhckJhc2VcIjtcbmltcG9ydCB0eXBlIEZpbHRlckZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckZpZWxkXCI7XG5pbXBvcnQgdHlwZSBNdWx0aVZhbHVlRmllbGQgZnJvbSBcInNhcC91aS9tZGMvTXVsdGlWYWx1ZUZpZWxkXCI7XG5pbXBvcnQgdHlwZSBNZGNJbm5lclRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBWYWx1ZUhlbHAgZnJvbSBcInNhcC91aS9tZGMvVmFsdWVIZWxwXCI7XG5pbXBvcnQgdHlwZSBDb250YWluZXIgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2Jhc2UvQ29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZW50IGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9iYXNlL0NvbnRlbnRcIjtcbmltcG9ydCBDb25kaXRpb25zIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L0NvbmRpdGlvbnNcIjtcbmltcG9ydCBNRENUYWJsZSwgeyB0eXBlICRNRENUYWJsZVNldHRpbmdzIH0gZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTURDVGFibGVcIjtcbmltcG9ydCBNVGFibGUsIHsgdHlwZSAkTVRhYmxlU2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvY29udGVudC9NVGFibGVcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE9EYXRhVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3R5cGUvT0RhdGFUeXBlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgTWV0YU1vZGVsVHlwZSB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbmltcG9ydCB7IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24gfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbmV4cG9ydCB0eXBlIEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXIgPSB7XG5cdCRUeXBlOiBzdHJpbmc7XG5cdFZhbHVlTGlzdFByb3BlcnR5OiBzdHJpbmc7XG5cdExvY2FsRGF0YVByb3BlcnR5Pzoge1xuXHRcdCRQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0fTtcblx0Q29uc3RhbnQ/OiBzdHJpbmc7XG5cdEluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQ/OiBib29sZWFuO1xufTtcblxuLy8gY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFR5cGVcbmV4cG9ydCB0eXBlIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlID0ge1xuXHQkVHlwZTogc3RyaW5nOyAvLyBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0VHlwZTtcblx0TGFiZWw/OiBzdHJpbmc7XG5cdENvbGxlY3Rpb25QYXRoOiBzdHJpbmc7XG5cdENvbGxlY3Rpb25Sb290Pzogc3RyaW5nO1xuXHREaXN0aW5jdFZhbHVlc1N1cHBvcnRlZD86IGJvb2xlYW47XG5cdFNlYXJjaFN1cHBvcnRlZD86IGJvb2xlYW47XG5cdEZldGNoVmFsdWVzPzogbnVtYmVyO1xuXHRQcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyPzogc3RyaW5nO1xuXHRTZWxlY3Rpb25WYXJpYW50UXVhbGlmaWVyPzogc3RyaW5nO1xuXHRQYXJhbWV0ZXJzOiBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyW107XG5cdCRtb2RlbDogT0RhdGFNb2RlbDtcbn07XG5cbmV4cG9ydCB0eXBlIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlQnlRdWFsaWZpZXIgPSBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZT47XG5cbmNvbnN0IGNvbHVtbk5vdEFscmVhZHlEZWZpbmVkID0gKGNvbHVtbkRlZnM6IENvbHVtbkRlZltdLCB2aEtleTogc3RyaW5nKTogYm9vbGVhbiA9PiAhY29sdW1uRGVmcy5zb21lKChjb2x1bW4pID0+IGNvbHVtbi5wYXRoID09PSB2aEtleSk7XG5cbmV4cG9ydCBjb25zdCBBbm5vdGF0aW9uTGFiZWwgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIixcblx0QW5ub3RhdGlvblRleHQgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiLFxuXHRBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50ID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbiA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluXCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudCA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQgPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJPdXRcIixcblx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluT3V0ID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcIixcblx0QW5ub3RhdGlvblZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcIjtcblxudHlwZSBBbm5vdGF0aW9uc0ZvclByb3BlcnR5ID0ge1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCI/OiB7XG5cdFx0U2VhcmNoU3VwcG9ydGVkPzogYm9vbGVhbjtcblx0fTtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCI/OiBzdHJpbmc7IC8vIEFubm90YXRpb25MYWJlbFxuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiPzoge1xuXHRcdC8vIEFubm90YXRpb25UZXh0XG5cdFx0JFBhdGg6IHN0cmluZztcblx0fTtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCI/OiB7XG5cdFx0Ly8gQW5ub3RhdGlvblRleHRVSVRleHRBcnJhbmdlbWVudFxuXHRcdCRFbnVtTWVtYmVyPzogc3RyaW5nO1xuXHR9O1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXJcIj86IGJvb2xlYW47XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcIj86IGJvb2xlYW47IC8vIEFubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVyc1wiPzogc3RyaW5nW107XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiPzogc3RyaW5nO1xufTtcblxudHlwZSBBbm5vdGF0aW9uU2VsZWN0aW9uRmllbGQgPSB7XG5cdCRQcm9wZXJ0eVBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgQW5ub3RhdGlvbnNGb3JFbnRpdHlUeXBlID0ge1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIj86IEFubm90YXRpb25TZWxlY3Rpb25GaWVsZFtdO1xufTtcblxudHlwZSBDb2x1bW5Qcm9wZXJ0eSA9IHtcblx0JFR5cGU6IHN0cmluZztcblx0JGtpbmQ6IHN0cmluZztcblx0JGlzQ29sbGVjdGlvbjogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEluT3V0UGFyYW1ldGVyID0ge1xuXHRwYXJtZXRlclR5cGU6IHN0cmluZztcblx0c291cmNlOiBzdHJpbmc7XG5cdGhlbHBQYXRoOiBzdHJpbmc7XG5cdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBib29sZWFuO1xuXHRjb25zdGFudFZhbHVlPzogc3RyaW5nIHwgYm9vbGVhbjtcbn07XG5cbnR5cGUgVmFsdWVIZWxwUGF5bG9hZEluZm8gPSB7XG5cdHZoS2V5cz86IHN0cmluZ1tdO1xuXHR2aFBhcmFtZXRlcnM/OiBJbk91dFBhcmFtZXRlcltdO1xufTtcblxudHlwZSBWYWx1ZUhlbHBRdWFsaWZpZXJNYXAgPSBSZWNvcmQ8c3RyaW5nLCBWYWx1ZUhlbHBQYXlsb2FkSW5mbz47XG5cbmV4cG9ydCB0eXBlIFZhbHVlSGVscFBheWxvYWQgPSB7XG5cdHByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRxdWFsaWZpZXJzOiBWYWx1ZUhlbHBRdWFsaWZpZXJNYXA7XG5cdHZhbHVlSGVscFF1YWxpZmllcjogc3RyaW5nO1xuXHRjb25kaXRpb25Nb2RlbD86IGFueTtcblx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2c/OiBib29sZWFuO1xuXHRpc1VuaXRWYWx1ZUhlbHA/OiBib29sZWFuO1xuXHRyZXF1ZXN0R3JvdXBJZD86IHN0cmluZztcblx0dXNlTXVsdGlWYWx1ZUZpZWxkPzogYm9vbGVhbjtcblx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM/OiBib29sZWFuO1xufTtcblxudHlwZSBDb2x1bW5EZWYgPSB7XG5cdHBhdGg6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdGZpbHRlcmFibGU6IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0JFR5cGU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFZhbHVlTGlzdEluZm8gPSB7XG5cdGtleVBhdGg6IHN0cmluZztcblx0ZGVzY3JpcHRpb25QYXRoOiBzdHJpbmc7XG5cdGZpZWxkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdHZoS2V5czogc3RyaW5nW107XG5cdHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXTtcblx0dmFsdWVMaXN0SW5mbzogQW5ub3RhdGlvblZhbHVlTGlzdFR5cGU7XG5cdGNvbHVtbkRlZnM6IENvbHVtbkRlZltdO1xuXHR2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZztcbn07XG5cbnR5cGUgRGlzcGxheUZvcm1hdCA9IFwiRGVzY3JpcHRpb25cIiB8IFwiVmFsdWVEZXNjcmlwdGlvblwiIHwgXCJWYWx1ZVwiIHwgXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cbnR5cGUgUGF0aCA9IHtcblx0ZmllbGRQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0ZGVzY3JpcHRpb25QYXRoOiBzdHJpbmc7XG5cdGtleTogc3RyaW5nO1xufTtcblxudHlwZSBTb3J0ZXJUeXBlID0ge1xuXHRhc2NlbmRpbmc/OiBib29sZWFuO1xuXHRkZXNjZW5kaW5nPzogYm9vbGVhbjtcblx0cGF0aD86IHN0cmluZztcblx0bmFtZT86IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIF9nZXREZWZhdWx0U29ydFByb3BlcnR5TmFtZSh2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSkge1xuXHRsZXQgc29ydEZpZWxkTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBtZXRhTW9kZWwgPSB2YWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3QgZW50aXR5U2V0QW5ub3RhdGlvbnMgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofUBgKSB8fCB7fTtcblx0Y29uc3Qgc29ydFJlc3RyaWN0aW9uc0luZm8gPSBnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhlbnRpdHlTZXRBbm5vdGF0aW9ucyk7XG5cdGNvbnN0IGZvdW5kRWxlbWVudCA9IHZhbHVlTGlzdEluZm8uUGFyYW1ldGVycy5maW5kKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdChlbGVtZW50LiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHxcblx0XHRcdFx0ZWxlbWVudC4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlck91dCB8fFxuXHRcdFx0XHRlbGVtZW50LiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHkpICYmXG5cdFx0XHQhKFxuXHRcdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofS8ke2VsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbmApID09PVxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpXG5cdFx0KTtcblx0fSk7XG5cdGlmIChmb3VuZEVsZW1lbnQpIHtcblx0XHRpZiAoXG5cdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgLyR7dmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vJHtmb3VuZEVsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudC8kRW51bU1lbWJlcmBcblx0XHRcdCkgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiXG5cdFx0KSB7XG5cdFx0XHRzb3J0RmllbGROYW1lID0gbWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdFx0YC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7Zm91bmRFbGVtZW50LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dC8kUGF0aGBcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNvcnRGaWVsZE5hbWUgPSBmb3VuZEVsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHk7XG5cdFx0fVxuXHR9XG5cdGlmIChzb3J0RmllbGROYW1lICYmICghc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NvcnRGaWVsZE5hbWVdIHx8IHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1tzb3J0RmllbGROYW1lXS5zb3J0YWJsZSkpIHtcblx0XHRyZXR1cm4gc29ydEZpZWxkTmFtZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9yZWR1bmRhbnREZXNjcmlwdGlvbihvVkxQYXJhbWV0ZXI6IGFueSwgYUNvbHVtbkluZm86IGFueVtdKSB7XG5cdGNvbnN0IG9Db2x1bW5JbmZvID0gYUNvbHVtbkluZm8uZmluZChmdW5jdGlvbiAoY29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuIG9WTFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gY29sdW1uSW5mby50ZXh0Q29sdW1uTmFtZTtcblx0fSk7XG5cdGlmIChcblx0XHRvVkxQYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHkgPT09IG9Db2x1bW5JbmZvPy50ZXh0Q29sdW1uTmFtZSAmJlxuXHRcdCFvQ29sdW1uSW5mby5rZXlDb2x1bW5IaWRkZW4gJiZcblx0XHRvQ29sdW1uSW5mby5rZXlDb2x1bW5EaXNwbGF5Rm9ybWF0ICE9PSBcIlZhbHVlXCJcblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3RDb250ZXh0OiBhbnkpIHtcblx0cmV0dXJuIG9WYWx1ZUxpc3RDb250ZXh0LlBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG9QYXJhbWV0ZXJbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVwiXSAmJlxuXHRcdFx0b1BhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIlxuXHRcdCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBfYnVpbGQkU2VsZWN0U3RyaW5nKGNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvVmlld0RhdGEgPSBjb250cm9sLmdldE1vZGVsKFwidmlld0RhdGFcIik7XG5cdGlmIChvVmlld0RhdGEpIHtcblx0XHRjb25zdCBvRGF0YSA9IG9WaWV3RGF0YS5nZXREYXRhKCk7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRjb25zdCBhQ29sdW1ucyA9IG9EYXRhLmNvbHVtbnM7XG5cdFx0XHRpZiAoYUNvbHVtbnMpIHtcblx0XHRcdFx0cmV0dXJuIGFDb2x1bW5zLnJlZHVjZShmdW5jdGlvbiAoc1F1ZXJ5OiBhbnksIG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0Ly8gTmF2aWdhdGlvbiBwcm9wZXJ0aWVzIChyZXByZXNlbnRlZCBieSBYL1kpIHNob3VsZCBub3QgYmUgYWRkZWQgdG8gJHNlbGVjdC5cblx0XHRcdFx0XHQvLyBUT0RPIDogVGhleSBzaG91bGQgYmUgYWRkZWQgYXMgJGV4cGFuZD1YKCRzZWxlY3Q9WSkgaW5zdGVhZFxuXHRcdFx0XHRcdGlmIChvUHJvcGVydHkucGF0aCAmJiBvUHJvcGVydHkucGF0aC5pbmRleE9mKFwiL1wiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdHNRdWVyeSA9IHNRdWVyeSA/IGAke3NRdWVyeX0sJHtvUHJvcGVydHkucGF0aH1gIDogb1Byb3BlcnR5LnBhdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBzUXVlcnk7XG5cdFx0XHRcdH0sIHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0KG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnksIGlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiBhbnkpIHtcblx0Y29uc3Qgc0Rpc3BsYXlNb2RlID0gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUFubm90YXRpb25zLCB1bmRlZmluZWQpO1xuXHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXTtcblx0Y29uc3Qgb1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPVxuXHRcdG9UZXh0QW5ub3RhdGlvbiAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl07XG5cdGlmIChpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcykge1xuXHRcdHJldHVybiBvVGV4dEFubm90YXRpb24gJiYgdHlwZW9mIG9UZXh0QW5ub3RhdGlvbiAhPT0gXCJzdHJpbmdcIiAmJiBvVGV4dEFubm90YXRpb24uJFBhdGggPyBzRGlzcGxheU1vZGUgOiBcIlZhbHVlXCI7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT25seSBleHBsaWNpdCBkZWZpbmVkIFRleHRBcnJhbmdlbWVudHMgaW4gYSBWYWx1ZSBIZWxwIHdpdGggRGlhbG9nIGFyZSBjb25zaWRlcmVkXG5cdFx0cmV0dXJuIG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID8gc0Rpc3BsYXlNb2RlIDogXCJWYWx1ZVwiO1xuXHR9XG59XG5cbmNvbnN0IFZhbHVlTGlzdEhlbHBlciA9IHtcblx0Z2V0VmFsdWVMaXN0Q29sbGVjdGlvbkVudGl0eVNldDogZnVuY3Rpb24gKG9WYWx1ZUxpc3RDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBtVmFsdWVMaXN0ID0gb1ZhbHVlTGlzdENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0cmV0dXJuIG1WYWx1ZUxpc3QuJG1vZGVsLmdldE1ldGFNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHttVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofWApO1xuXHR9LFxuXG5cdGdldFRhYmxlRGVsZWdhdGU6IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRsZXQgc0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lID0gX2dldERlZmF1bHRTb3J0UHJvcGVydHlOYW1lKG9WYWx1ZUxpc3QpO1xuXHRcdGlmIChzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSA9IGAnJHtzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWV9J2A7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHRcIntuYW1lOiAnc2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVGFibGVEZWxlZ2F0ZScsIHBheWxvYWQ6IHtjb2xsZWN0aW9uTmFtZTogJ1wiICtcblx0XHRcdG9WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGggK1xuXHRcdFx0XCInXCIgK1xuXHRcdFx0KHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSA/IFwiLCBkZWZhdWx0U29ydFByb3BlcnR5TmFtZTogXCIgKyBzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgOiBcIlwiKSArXG5cdFx0XHRcIn19XCJcblx0XHQpO1xuXHR9LFxuXG5cdGdldFNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQ6IGZ1bmN0aW9uICh2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSwgaXNTdWdnZXN0aW9uOiBib29sZWFuKSB7XG5cdFx0aWYgKHZhbHVlTGlzdEluZm8uUHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyID0gdmFsdWVMaXN0SW5mby5QcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyXG5cdFx0XHRcdFx0PyBgIyR7dmFsdWVMaXN0SW5mby5QcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyfWBcblx0XHRcdFx0XHQ6IFwiXCIsXG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRQYXRoID0gYC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QcmVzZW50YXRpb25WYXJpYW50JHtwcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyfWA7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50ID0gdmFsdWVMaXN0SW5mby4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KHByZXNlbnRhdGlvblZhcmlhbnRQYXRoKSBhc1xuXHRcdFx0XHR8IE1ldGFNb2RlbFR5cGU8UHJlc2VudGF0aW9uVmFyaWFudD5cblx0XHRcdFx0fCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAocHJlc2VudGF0aW9uVmFyaWFudD8uU29ydE9yZGVyKSB7XG5cdFx0XHRcdGNvbnN0IHNvcnRDb25kaXRpb25zID0ge1xuXHRcdFx0XHRcdHNvcnRlcnM6IFtdIGFzIFNvcnRlclR5cGVbXVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyLmZvckVhY2goZnVuY3Rpb24gKGNvbmRpdGlvbikge1xuXHRcdFx0XHRcdGNvbnN0IHNvcnRlcjogU29ydGVyVHlwZSA9IHt9LFxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoID0gY29uZGl0aW9uPy5Qcm9wZXJ0eT8uJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAoaXNTdWdnZXN0aW9uKSB7XG5cdFx0XHRcdFx0XHRzb3J0ZXIucGF0aCA9IHByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c29ydGVyLm5hbWUgPSBwcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGNvbmRpdGlvbi5EZXNjZW5kaW5nKSB7XG5cdFx0XHRcdFx0XHRzb3J0ZXIuZGVzY2VuZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNvcnRlci5hc2NlbmRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzb3J0Q29uZGl0aW9ucy5zb3J0ZXJzLnB1c2goc29ydGVyKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIGlzU3VnZ2VzdGlvbiA/IGBzb3J0ZXI6ICR7SlNPTi5zdHJpbmdpZnkoc29ydENvbmRpdGlvbnMuc29ydGVycyl9YCA6IEpTT04uc3RyaW5naWZ5KHNvcnRDb25kaXRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9LFxuXG5cdGdldFByb3BlcnR5UGF0aDogZnVuY3Rpb24gKG9QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRyZXR1cm4gIW9QYXJhbWV0ZXJzLlVuYm91bmRBY3Rpb25cblx0XHRcdD8gYCR7b1BhcmFtZXRlcnMuRW50aXR5VHlwZVBhdGh9LyR7b1BhcmFtZXRlcnMuQWN0aW9ufS8ke29QYXJhbWV0ZXJzLlByb3BlcnR5fWBcblx0XHRcdDogYC8ke29QYXJhbWV0ZXJzLkFjdGlvbi5zdWJzdHJpbmcob1BhcmFtZXRlcnMuQWN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSArIDEpfS8ke29QYXJhbWV0ZXJzLlByb3BlcnR5fWA7XG5cdH0sXG5cblx0Z2V0VmFsdWVMaXN0UHJvcGVydHk6IGZ1bmN0aW9uIChvUHJvcGVydHlDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvVmFsdWVMaXN0TW9kZWwgPSBvUHJvcGVydHlDb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgbVZhbHVlTGlzdCA9IG9WYWx1ZUxpc3RNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHRcdHJldHVybiBtVmFsdWVMaXN0LiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7bVZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aH0vJHtvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpfWApO1xuXHR9LFxuXG5cdC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBmb3IgdmFsdWUgaGVscCBtLXRhYmxlIGFuZCBtZGMtdGFibGVcblx0Z2V0Q29sdW1uVmlzaWJpbGl0eTogZnVuY3Rpb24gKG9WYWx1ZUxpc3Q6IGFueSwgb1ZMUGFyYW1ldGVyOiBhbnksIG9Tb3VyY2U6IGFueSkge1xuXHRcdGNvbnN0IGlzRHJvcERvd25MaXN0ID0gb1NvdXJjZSAmJiAhIW9Tb3VyY2UudmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzLFxuXHRcdFx0b0NvbHVtbkluZm8gPSBvU291cmNlLmNvbHVtbkluZm8sXG5cdFx0XHRpc1Zpc2libGUgPSAhX3JlZHVuZGFudERlc2NyaXB0aW9uKG9WTFBhcmFtZXRlciwgb0NvbHVtbkluZm8uY29sdW1uSW5mb3MpLFxuXHRcdFx0aXNEaWFsb2dUYWJsZSA9IG9Db2x1bW5JbmZvLmlzRGlhbG9nVGFibGU7XG5cblx0XHRpZiAoaXNEcm9wRG93bkxpc3QgfHwgKCFpc0Ryb3BEb3duTGlzdCAmJiBpc0RpYWxvZ1RhYmxlKSB8fCAoIWlzRHJvcERvd25MaXN0ICYmICFfaGFzSW1wb3J0YW5jZUhpZ2gob1ZhbHVlTGlzdCkpKSB7XG5cdFx0XHRjb25zdCBjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiA9IG9Db2x1bW5JbmZvLmNvbHVtbkluZm9zLmZpbmQoZnVuY3Rpb24gKGNvbHVtbkluZm86IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb1ZMUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5ID09PSBjb2x1bW5JbmZvLmNvbHVtbk5hbWUgJiYgY29sdW1uSW5mby5oYXNIaWRkZW5Bbm5vdGF0aW9uID09PSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gIWNvbHVtbldpdGhIaWRkZW5Bbm5vdGF0aW9uID8gaXNWaXNpYmxlIDogZmFsc2U7XG5cdFx0fSBlbHNlIGlmICghaXNEcm9wRG93bkxpc3QgJiYgX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3QpKSB7XG5cdFx0XHRyZXR1cm4gb1ZMUGFyYW1ldGVyICYmXG5cdFx0XHRcdG9WTFBhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdICYmXG5cdFx0XHRcdG9WTFBhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIlxuXHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0OiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0Z2V0Q29sdW1uVmlzaWJpbGl0eUluZm86IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnksIHNQcm9wZXJ0eUZ1bGxQYXRoOiBhbnksIGJJc0Ryb3BEb3duTGlzdGU6IGFueSwgaXNEaWFsb2dUYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WYWx1ZUxpc3QuJG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IGFDb2x1bW5JbmZvczogYW55W10gPSBbXTtcblx0XHRjb25zdCBvQ29sdW1uSW5mb3MgPSB7XG5cdFx0XHRpc0RpYWxvZ1RhYmxlOiBpc0RpYWxvZ1RhYmxlLFxuXHRcdFx0Y29sdW1uSW5mb3M6IGFDb2x1bW5JbmZvc1xuXHRcdH07XG5cblx0XHRvVmFsdWVMaXN0LlBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtvVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofS8ke29QYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHl9QGApO1xuXHRcdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl07XG5cdFx0XHRsZXQgY29sdW1uSW5mbzogYW55ID0ge307XG5cdFx0XHRpZiAob1RleHRBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8gPSB7XG5cdFx0XHRcdFx0a2V5Q29sdW1uSGlkZGVuOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gPyB0cnVlIDogZmFsc2UsXG5cdFx0XHRcdFx0a2V5Q29sdW1uRGlzcGxheUZvcm1hdDogb1RleHRBbm5vdGF0aW9uICYmIF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0KG9Qcm9wZXJ0eUFubm90YXRpb25zLCBiSXNEcm9wRG93bkxpc3RlKSxcblx0XHRcdFx0XHR0ZXh0Q29sdW1uTmFtZTogb1RleHRBbm5vdGF0aW9uICYmIG9UZXh0QW5ub3RhdGlvbi4kUGF0aCxcblx0XHRcdFx0XHRjb2x1bW5OYW1lOiBvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdGhhc0hpZGRlbkFubm90YXRpb246IG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSA/IHRydWUgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIGlmIChvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0pIHtcblx0XHRcdFx0Y29sdW1uSW5mbyA9IHtcblx0XHRcdFx0XHRjb2x1bW5OYW1lOiBvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdGhhc0hpZGRlbkFubm90YXRpb246IG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSA/IHRydWUgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0b0NvbHVtbkluZm9zLmNvbHVtbkluZm9zLnB1c2goY29sdW1uSW5mbyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb0NvbHVtbkluZm9zO1xuXHR9LFxuXG5cdGdldFRhYmxlSXRlbXNQYXJhbWV0ZXJzOiBmdW5jdGlvbiAoXG5cdFx0dmFsdWVMaXN0SW5mbzogQW5ub3RhdGlvblZhbHVlTGlzdFR5cGUsXG5cdFx0cmVxdWVzdEdyb3VwSWQ6IHN0cmluZyxcblx0XHRpc1N1Z2dlc3Rpb246IGJvb2xlYW4sXG5cdFx0aXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM6IGJvb2xlYW5cblx0KSB7XG5cdFx0Y29uc3QgaXRlbVBhcmFtZXRlcnMgPSBbYHBhdGg6ICcvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofSdgXTtcblxuXHRcdC8vIGFkZCBzZWxlY3QgdG8gb0JpbmRpbmdJbmZvIChCQ1AgMjE4MDI1NTk1NiAvIDIxNzAxNjMwMTIpXG5cdFx0Y29uc3Qgc2VsZWN0U3RyaW5nID0gX2J1aWxkJFNlbGVjdFN0cmluZyh0aGlzKTtcblxuXHRcdGlmIChyZXF1ZXN0R3JvdXBJZCkge1xuXHRcdFx0Y29uc3Qgc2VsZWN0U3RyaW5nUGFydCA9IHNlbGVjdFN0cmluZyA/IGAsICcke3NlbGVjdFN0cmluZ30nYCA6IFwiXCI7XG5cblx0XHRcdGl0ZW1QYXJhbWV0ZXJzLnB1c2goYHBhcmFtZXRlcnM6IHskJGdyb3VwSWQ6ICcke3JlcXVlc3RHcm91cElkfScke3NlbGVjdFN0cmluZ1BhcnR9fWApO1xuXHRcdH0gZWxzZSBpZiAoc2VsZWN0U3RyaW5nKSB7XG5cdFx0XHRpdGVtUGFyYW1ldGVycy5wdXNoKGBwYXJhbWV0ZXJzOiB7JHNlbGVjdDogJyR7c2VsZWN0U3RyaW5nfSd9YCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNTdXNwZW5kZWQgPSB2YWx1ZUxpc3RJbmZvLlBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAob1BhcmFtZXRlcikge1xuXHRcdFx0cmV0dXJuIGlzU3VnZ2VzdGlvbiB8fCBvUGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW47XG5cdFx0fSk7XG5cdFx0aXRlbVBhcmFtZXRlcnMucHVzaChgc3VzcGVuZGVkOiAke2lzU3VzcGVuZGVkfWApO1xuXG5cdFx0aWYgKCFpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcykge1xuXHRcdFx0aXRlbVBhcmFtZXRlcnMucHVzaChcImxlbmd0aDogMTBcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCA9IFZhbHVlTGlzdEhlbHBlci5nZXRTb3J0Q29uZGl0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KHZhbHVlTGlzdEluZm8sIGlzU3VnZ2VzdGlvbik7XG5cblx0XHRpZiAoc29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0aXRlbVBhcmFtZXRlcnMucHVzaChzb3J0Q29uZGl0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KTtcblx0XHR9IGVsc2UgaWYgKGlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzKSB7XG5cdFx0XHRjb25zdCBkZWZhdWx0U29ydFByb3BlcnR5TmFtZSA9IF9nZXREZWZhdWx0U29ydFByb3BlcnR5TmFtZSh2YWx1ZUxpc3RJbmZvKTtcblxuXHRcdFx0aWYgKGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdGl0ZW1QYXJhbWV0ZXJzLnB1c2goYHNvcnRlcjogW3twYXRoOiAnJHtkZWZhdWx0U29ydFByb3BlcnR5TmFtZX0nLCBhc2NlbmRpbmc6IHRydWV9XWApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBcIntcIiArIGl0ZW1QYXJhbWV0ZXJzLmpvaW4oXCIsIFwiKSArIFwifVwiO1xuXHR9LFxuXG5cdC8vIElzIG5lZWRlZCBmb3IgXCJleHRlcm5hbFwiIHJlcHJlc2VudGF0aW9uIGluIHF1bml0XG5cdGhhc0ltcG9ydGFuY2U6IGZ1bmN0aW9uIChvVmFsdWVMaXN0Q29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIF9oYXNJbXBvcnRhbmNlSGlnaChvVmFsdWVMaXN0Q29udGV4dC5nZXRPYmplY3QoKSkgPyBcIkltcG9ydGFuY2UvSGlnaFwiIDogXCJOb25lXCI7XG5cdH0sXG5cblx0Ly8gSXMgbmVlZGVkIGZvciBcImV4dGVybmFsXCIgcmVwcmVzZW50YXRpb24gaW4gcXVuaXRcblx0Z2V0TWluU2NyZWVuV2lkdGg6IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRyZXR1cm4gX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3QpID8gXCJ7PSAke19WSFVJPi9taW5TY3JlZW5XaWR0aH19XCIgOiBcIjQxNnB4XCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY29sdW1uIHdpZHRoIGZvciBhIGdpdmVuIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eVBhdGhcblx0ICogQHJldHVybnMgVGhlIHdpZHRoIGFzIGEgc3RyaW5nLlxuXHQgKi9cblx0Z2V0Q29sdW1uV2lkdGg6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnR5UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0bGV0IHJlbGF0ZWRQcm9wZXJ0eTogUHJvcGVydHlbXSA9IFtwcm9wZXJ0eV07XG5cdFx0Ly8gVGhlIGFkZGl0aW9uYWwgcHJvcGVydHkgY291bGQgcmVmZXIgdG8gdGhlIHRleHQsIGN1cnJlbmN5LCB1bml0IG9yIHRpbWV6b25lXG5cdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5ID1cblx0XHRcdFx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eShwcm9wZXJ0eSkgfHxcblx0XHRcdFx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkocHJvcGVydHkpIHx8XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkocHJvcGVydHkpIHx8XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5KHByb3BlcnR5KSxcblx0XHRcdHRleHRBbm5vdGF0aW9uID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCxcblx0XHRcdHRleHRBcnJhbmdlbWVudCA9IHRleHRBbm5vdGF0aW9uPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudD8udG9TdHJpbmcoKSxcblx0XHRcdGxhYmVsID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnRvU3RyaW5nKCksXG5cdFx0XHRkaXNwbGF5TW9kZSA9IHRleHRBcnJhbmdlbWVudCAmJiBnZXREaXNwbGF5TW9kZShwcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChhZGRpdGlvbmFsUHJvcGVydHkpIHtcblx0XHRcdGlmIChkaXNwbGF5TW9kZSA9PT0gXCJEZXNjcmlwdGlvblwiKSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eSA9IFthZGRpdGlvbmFsUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmICghdGV4dEFubm90YXRpb24gfHwgKGRpc3BsYXlNb2RlICYmIGRpc3BsYXlNb2RlICE9PSBcIlZhbHVlXCIpKSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eS5wdXNoKGFkZGl0aW9uYWxQcm9wZXJ0eSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHNpemUgPSAwO1xuXHRcdGNvbnN0IGluc3RhbmNlczogT0RhdGFUeXBlW10gPSBbXTtcblxuXHRcdHJlbGF0ZWRQcm9wZXJ0eS5mb3JFYWNoKChwcm9wOiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhwcm9wLCB1bmRlZmluZWQpO1xuXHRcdFx0Y29uc3QgUHJvcGVydHlPRGF0YUNvbnN0cnVjdG9yID0gT2JqZWN0UGF0aC5nZXQocHJvcGVydHlUeXBlQ29uZmlnLnR5cGUpO1xuXHRcdFx0aWYgKFByb3BlcnR5T0RhdGFDb25zdHJ1Y3Rvcikge1xuXHRcdFx0XHRpbnN0YW5jZXMucHVzaChuZXcgUHJvcGVydHlPRGF0YUNvbnN0cnVjdG9yKHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLCBwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHMpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBzV2lkdGggPSBVdGlsLmNhbGNDb2x1bW5XaWR0aChpbnN0YW5jZXMsIGxhYmVsKTtcblx0XHRzaXplID0gc1dpZHRoID8gcGFyc2VGbG9hdChzV2lkdGgucmVwbGFjZShcInJlbVwiLCBcIlwiKSkgOiAwO1xuXG5cdFx0aWYgKHNpemUgPT09IDApIHtcblx0XHRcdExvZy5lcnJvcihgQ2Fubm90IGNvbXB1dGUgdGhlIGNvbHVtbiB3aWR0aCBmb3IgcHJvcGVydHk6ICR7cHJvcGVydHkubmFtZX1gKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNpemUgPD0gMjAgPyBzaXplLnRvU3RyaW5nKCkgKyBcInJlbVwiIDogXCIyMHJlbVwiO1xuXHR9LFxuXG5cdGdldE91dFBhcmFtZXRlclBhdGhzOiBmdW5jdGlvbiAoYVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cdFx0YVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRpZiAob1BhcmFtZXRlci4kVHlwZS5lbmRzV2l0aChcIk91dFwiKSkge1xuXHRcdFx0XHRzUGF0aCArPSBgeyR7b1BhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eX19YDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gc1BhdGg7XG5cdH0sXG5cblx0ZW50aXR5SXNTZWFyY2hhYmxlOiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRjb2xsZWN0aW9uQW5ub3RhdGlvbnM6IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb25cblx0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgc2VhcmNoU3VwcG9ydGVkID0gcHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdPy5TZWFyY2hTdXBwb3J0ZWQsXG5cdFx0XHRzZWFyY2hhYmxlID0gY29sbGVjdGlvbkFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCJdPy5TZWFyY2hhYmxlO1xuXG5cdFx0aWYgKFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHVuZGVmaW5lZCAmJiBzZWFyY2hTdXBwb3J0ZWQgPT09IGZhbHNlKSB8fFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHRydWUgJiYgc2VhcmNoU3VwcG9ydGVkID09PSBmYWxzZSkgfHxcblx0XHRcdHNlYXJjaGFibGUgPT09IGZhbHNlXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb25kaXRpb24gcGF0aCByZXF1aXJlZCBmb3IgdGhlIGNvbmRpdGlvbiBtb2RlbC5cblx0ICogRm9yIGUuZy4gPDE6Ti1Qcm9wZXJ0eU5hbWU+KlxcLzwxOjEtUHJvcGVydHlOYW1lPi88UHJvcGVydHlOYW1lPi5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgY29uZGl0aW9uIHBhdGhcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb25kaXRpb25QYXRoOiBmdW5jdGlvbiAobWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0OiBzdHJpbmcsIHByb3BlcnR5UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHQvLyAoc2VlIGFsc286IHNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXIudHMpXG5cdFx0Y29uc3QgcGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGxldCBjb25kaXRpb25QYXRoID0gXCJcIixcblx0XHRcdHBhcnRpYWxQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0XHR3aGlsZSAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRsZXQgcGFydCA9IHBhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nO1xuXHRcdFx0cGFydGlhbFBhdGggPSBwYXJ0aWFsUGF0aCA/IGAke3BhcnRpYWxQYXRofS8ke3BhcnR9YCA6IHBhcnQ7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0fS8ke3BhcnRpYWxQYXRofWApO1xuXHRcdFx0aWYgKHByb3BlcnR5ICYmIHByb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIHByb3BlcnR5LiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0cGFydCArPSBcIipcIjtcblx0XHRcdH1cblx0XHRcdGNvbmRpdGlvblBhdGggPSBjb25kaXRpb25QYXRoID8gYCR7Y29uZGl0aW9uUGF0aH0vJHtwYXJ0fWAgOiBwYXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyBhcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnMgY29ycmVzcG9uZGluZyB0byBwcm9wZXJ0aWVzIGRlZmluZWQgYXMgU2VsZWN0aW9uIEZpZWxkcyBvbiB0aGUgQ29sbGVjdGlvblBhdGggZW50aXR5IHNldCBpbiBhIFZhbHVlSGVscC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkczogZnVuY3Rpb24gKG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldDogc3RyaW5nKTogQ29sdW1uRGVmW10ge1xuXHRcdGNvbnN0IGNvbHVtbkRlZnM6IENvbHVtbkRlZltdID0gW10sXG5cdFx0XHRlbnRpdHlUeXBlQW5ub3RhdGlvbnMgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldH0vQGApIGFzIEFubm90YXRpb25zRm9yRW50aXR5VHlwZSxcblx0XHRcdHNlbGVjdGlvbkZpZWxkcyA9IGVudGl0eVR5cGVBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl07XG5cblx0XHRpZiAoc2VsZWN0aW9uRmllbGRzKSB7XG5cdFx0XHRzZWxlY3Rpb25GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoc2VsZWN0aW9uRmllbGQ6IEFubm90YXRpb25TZWxlY3Rpb25GaWVsZCkge1xuXHRcdFx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZFBhdGggPSBgJHtlbnRpdHlTZXR9LyR7c2VsZWN0aW9uRmllbGQuJFByb3BlcnR5UGF0aH1gLFxuXHRcdFx0XHRcdGNvbmRpdGlvblBhdGggPSBWYWx1ZUxpc3RIZWxwZXIuX2dldENvbmRpdGlvblBhdGgobWV0YU1vZGVsLCBlbnRpdHlTZXQsIHNlbGVjdGlvbkZpZWxkLiRQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnMgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NlbGVjdGlvbkZpZWxkUGF0aH1AYCkgYXMgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRcdFx0XHRjb2x1bW5EZWYgPSB7XG5cdFx0XHRcdFx0XHRwYXRoOiBjb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0bGFiZWw6IHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvbkxhYmVsXSB8fCBzZWxlY3Rpb25GaWVsZFBhdGgsXG5cdFx0XHRcdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGZpbHRlcmFibGU6IGlzUHJvcGVydHlGaWx0ZXJhYmxlKG1ldGFNb2RlbCwgZW50aXR5U2V0LCBzZWxlY3Rpb25GaWVsZC4kUHJvcGVydHlQYXRoLCBmYWxzZSksXG5cdFx0XHRcdFx0XHQkVHlwZTogbWV0YU1vZGVsLmdldE9iamVjdChzZWxlY3Rpb25GaWVsZFBhdGgpPy4kVHlwZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGNvbHVtbkRlZnMucHVzaChjb2x1bW5EZWYpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbHVtbkRlZnM7XG5cdH0sXG5cblx0X21lcmdlQ29sdW1uRGVmaW5pdGlvbnNGcm9tUHJvcGVydGllczogZnVuY3Rpb24gKFxuXHRcdGNvbHVtbkRlZnM6IENvbHVtbkRlZltdLFxuXHRcdHZhbHVlTGlzdEluZm86IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHZhbHVlTGlzdFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0cHJvcGVydHk6IENvbHVtblByb3BlcnR5LFxuXHRcdHByb3BlcnR5QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yUHJvcGVydHlcblx0KTogdm9pZCB7XG5cdFx0bGV0IGNvbHVtblBhdGggPSB2YWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdGNvbHVtblByb3BlcnR5VHlwZSA9IHByb3BlcnR5LiRUeXBlO1xuXHRcdGNvbnN0IGxhYmVsID0gcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uTGFiZWxdIHx8IGNvbHVtblBhdGgsXG5cdFx0XHR0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRdO1xuXG5cdFx0aWYgKFxuXHRcdFx0dGV4dEFubm90YXRpb24gJiZcblx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRVSVRleHRBcnJhbmdlbWVudF0/LiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIlxuXHRcdCkge1xuXHRcdFx0Ly8gdGhlIGNvbHVtbiBwcm9wZXJ0eSBpcyB0aGUgb25lIGNvbWluZyBmcm9tIHRoZSB0ZXh0IGFubm90YXRpb25cblx0XHRcdGNvbHVtblBhdGggPSB0ZXh0QW5ub3RhdGlvbi4kUGF0aDtcblx0XHRcdGNvbnN0IHRleHRQcm9wZXJ0eVBhdGggPSBgLyR7dmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vJHtjb2x1bW5QYXRofWA7XG5cdFx0XHRjb2x1bW5Qcm9wZXJ0eVR5cGUgPSB2YWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QodGV4dFByb3BlcnR5UGF0aCkuJFR5cGUgYXMgc3RyaW5nO1xuXHRcdH1cblxuXHRcdGlmIChjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZChjb2x1bW5EZWZzLCBjb2x1bW5QYXRoKSkge1xuXHRcdFx0Y29uc3QgY29sdW1uRGVmOiBDb2x1bW5EZWYgPSB7XG5cdFx0XHRcdHBhdGg6IGNvbHVtblBhdGgsXG5cdFx0XHRcdGxhYmVsOiBsYWJlbCxcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdGZpbHRlcmFibGU6ICFwcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlclwiXSxcblx0XHRcdFx0JFR5cGU6IGNvbHVtblByb3BlcnR5VHlwZVxuXHRcdFx0fTtcblx0XHRcdGNvbHVtbkRlZnMucHVzaChjb2x1bW5EZWYpO1xuXHRcdH1cblx0fSxcblxuXHRmaWx0ZXJJbk91dFBhcmFtZXRlcnM6IGZ1bmN0aW9uICh2aFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10sIHR5cGVGaWx0ZXI6IHN0cmluZ1tdKSB7XG5cdFx0cmV0dXJuIHZoUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuXHRcdFx0cmV0dXJuIHR5cGVGaWx0ZXIuaW5kZXhPZihwYXJhbWV0ZXIucGFybWV0ZXJUeXBlKSA+IC0xO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGdldEluUGFyYW1ldGVyczogZnVuY3Rpb24gKHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdHJldHVybiBWYWx1ZUxpc3RIZWxwZXIuZmlsdGVySW5PdXRQYXJhbWV0ZXJzKHZoUGFyYW1ldGVycywgW1xuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluLFxuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50LFxuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluT3V0XG5cdFx0XSk7XG5cdH0sXG5cblx0Z2V0T3V0UGFyYW1ldGVyczogZnVuY3Rpb24gKHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdHJldHVybiBWYWx1ZUxpc3RIZWxwZXIuZmlsdGVySW5PdXRQYXJhbWV0ZXJzKHZoUGFyYW1ldGVycywgW0Fubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQsIEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dF0pO1xuXHR9LFxuXG5cdGNyZWF0ZVZIVUlNb2RlbDogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGg6IHN0cmluZywgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IEpTT05Nb2RlbCB7XG5cdFx0Ly8gc2V0dGluZyB0aGUgX1ZIVUkgbW9kZWwgZXZhbHVhdGVkIGluIHRoZSBWYWx1ZUxpc3RUYWJsZSBmcmFnbWVudFxuXHRcdGNvbnN0IHZoVUlNb2RlbCA9IG5ldyBKU09OTW9kZWwoe30pLFxuXHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5O1xuXG5cdFx0dmFsdWVIZWxwLnNldE1vZGVsKHZoVUlNb2RlbCwgXCJfVkhVSVwiKTtcblx0XHQvLyBJZGVudGlmaWVzIHRoZSBcIkNvbnRleHREZXBlbmRlbnQtU2NlbmFyaW9cIlxuXHRcdHZoVUlNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdFwiL2hhc1ZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVyc1wiLFxuXHRcdFx0ISFwcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIl1cblx0XHQpO1xuXHRcdC8qIFByb3BlcnR5IGxhYmVsIGZvciBkaWFsb2cgdGl0bGUgKi9cblx0XHR2aFVJTW9kZWwuc2V0UHJvcGVydHkoXCIvcHJvcGVydHlMYWJlbFwiLCBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25MYWJlbF0pO1xuXG5cdFx0cmV0dXJuIHZoVUlNb2RlbDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdGl0bGUgb2YgdGhlIHZhbHVlIGhlbHAgZGlhbG9nLlxuXHQgKiBCeSBkZWZhdWx0LCB0aGUgZGF0YSBmaWVsZCBsYWJlbCBpcyB1c2VkLCBvdGhlcndpc2UgZWl0aGVyIHRoZSBwcm9wZXJ0eSBsYWJlbCBvciB0aGUgdmFsdWUgbGlzdCBsYWJlbCBpcyB1c2VkIGFzIGEgZmFsbGJhY2suXG5cdCAqIEZvciBjb250ZXh0LWRlcGVuZGVudCB2YWx1ZSBoZWxwcywgYnkgZGVmYXVsdCB0aGUgdmFsdWUgbGlzdCBsYWJlbCBpcyB1c2VkLCBvdGhlcndpc2UgZWl0aGVyIHRoZSBwcm9wZXJ0eSBsYWJlbCBvciB0aGUgZGF0YSBmaWVsZCBsYWJlbCBpcyB1c2VkIGFzIGEgZmFsbGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIHZhbHVlSGVscCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gdmFsdWVoZWxwTGFiZWwgVGhlIGxhYmVsIGluIHRoZSB2YWx1ZSBoZWxwIG1ldGFkYXRhXG5cdCAqIEByZXR1cm5zIFRoZSB0aXRsZSBmb3IgdGhlIHZhbHVlSGVscCBkaWFsb2dcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXREaWFsb2dUaXRsZTogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCB2YWx1ZWhlbHBMYWJlbDogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcblx0XHRjb25zdCBwcm9wZXJ0eUxhYmVsID0gdmFsdWVIZWxwLmdldE1vZGVsKFwiX1ZIVUlcIikuZ2V0UHJvcGVydHkoXCIvcHJvcGVydHlMYWJlbFwiKTtcblx0XHRjb25zdCBkYXRhRmllbGRMYWJlbCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCk/LmdldFByb3BlcnR5KFwibGFiZWxcIik7XG5cdFx0cmV0dXJuIHZhbHVlSGVscC5nZXRNb2RlbChcIl9WSFVJXCIpLmdldFByb3BlcnR5KFwiL2hhc1ZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVyc1wiKVxuXHRcdFx0PyB2YWx1ZWhlbHBMYWJlbCB8fCBwcm9wZXJ0eUxhYmVsIHx8IGRhdGFGaWVsZExhYmVsXG5cdFx0XHQ6IGRhdGFGaWVsZExhYmVsIHx8IHByb3BlcnR5TGFiZWwgfHwgdmFsdWVoZWxwTGFiZWw7XG5cdH0sXG5cblx0ZGVzdHJveVZIQ29udGVudDogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwKTogdm9pZCB7XG5cdFx0aWYgKHZhbHVlSGVscC5nZXREaWFsb2coKSkge1xuXHRcdFx0dmFsdWVIZWxwLmdldERpYWxvZygpLmRlc3Ryb3lDb250ZW50KCk7XG5cdFx0fVxuXHRcdGlmICh2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkpIHtcblx0XHRcdHZhbHVlSGVscC5nZXRUeXBlYWhlYWQoKS5kZXN0cm95Q29udGVudCgpO1xuXHRcdH1cblx0fSxcblxuXHRwdXREZWZhdWx0UXVhbGlmaWVyRmlyc3Q6IGZ1bmN0aW9uIChxdWFsaWZpZXJzOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IGluZGV4RGVmYXVsdFZIID0gcXVhbGlmaWVycy5pbmRleE9mKFwiXCIpO1xuXG5cdFx0Ly8gZGVmYXVsdCBWYWx1ZUhlbHAgd2l0aG91dCBxdWFsaWZpZXIgc2hvdWxkIGJlIHRoZSBmaXJzdFxuXHRcdGlmIChpbmRleERlZmF1bHRWSCA+IDApIHtcblx0XHRcdHF1YWxpZmllcnMudW5zaGlmdChxdWFsaWZpZXJzW2luZGV4RGVmYXVsdFZIXSk7XG5cdFx0XHRxdWFsaWZpZXJzLnNwbGljZShpbmRleERlZmF1bHRWSCArIDEsIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gcXVhbGlmaWVycztcblx0fSxcblxuXHRfZ2V0Q29udGV4dFByZWZpeDogZnVuY3Rpb24gKGJpbmRpbmdDb250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkLCBwcm9wZXJ0eUJpbmRpbmdQYXJ0czogc3RyaW5nW10pIHtcblx0XHRpZiAoYmluZGluZ0NvbnRleHQgJiYgYmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRjb25zdCBiaW5kaWdDb250ZXh0UGFydHMgPSBiaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpO1xuXHRcdFx0aWYgKHByb3BlcnR5QmluZGluZ1BhcnRzLmxlbmd0aCAtIGJpbmRpZ0NvbnRleHRQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRleHRQcmVmaXhQYXJ0cyA9IFtdO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gYmluZGlnQ29udGV4dFBhcnRzLmxlbmd0aDsgaSA8IHByb3BlcnR5QmluZGluZ1BhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdFx0XHRcdGNvbnRleHRQcmVmaXhQYXJ0cy5wdXNoKHByb3BlcnR5QmluZGluZ1BhcnRzW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gYCR7Y29udGV4dFByZWZpeFBhcnRzLmpvaW4oXCIvXCIpfS9gO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBcIlwiO1xuXHR9LFxuXG5cdF9nZXRWaFBhcmFtZXRlcjogZnVuY3Rpb24gKFxuXHRcdGNvbmRpdGlvbk1vZGVsOiBzdHJpbmcsXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0Y29udGV4dFByZWZpeDogc3RyaW5nLFxuXHRcdHBhcmFtZXRlcjogQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlcixcblx0XHR2aE1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdFx0bG9jYWxEYXRhUHJvcGVydHlQYXRoOiBzdHJpbmdcblx0KTogSW5PdXRQYXJhbWV0ZXIge1xuXHRcdGxldCB2YWx1ZVBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gdmFsdWVIZWxwLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0aWYgKGNvbmRpdGlvbk1vZGVsICYmIGNvbmRpdGlvbk1vZGVsLmxlbmd0aCA+IDApIHtcblx0XHRcdGlmIChcblx0XHRcdFx0dmFsdWVIZWxwLmdldFBhcmVudCgpPy5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmXG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0ICYmXG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fcGFyYW1ldGVySXNBKHBhcmFtZXRlciwgW1xuXHRcdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJJbixcblx0XHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcblx0XHRcdFx0XSlcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciB2YWx1ZSBoZWxwIHVzZWQgaW4gZmlsdGVyIGRpYWxvZ1xuXHRcdFx0XHRjb25zdCBwYXJ0cyA9IGxvY2FsRGF0YVByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkgPSBwYXJ0c1swXTtcblx0XHRcdFx0XHRjb25zdCBvQm91bmRFbnRpdHkgPSB2aE1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChiaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoT2ZUYWJsZSA9ICh2YWx1ZUhlbHAuZ2V0UGFyZW50KCkgYXMgYW55KS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpOyAvL1RPRE9cblx0XHRcdFx0XHRpZiAob0JvdW5kRW50aXR5LmdldE9iamVjdChgJHtzUGF0aE9mVGFibGV9LyRQYXJ0bmVyYCkgPT09IGZpcnN0TmF2aWdhdGlvblByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHQvLyBVc2luZyB0aGUgY29uZGl0aW9uIG1vZGVsIGRvZXNuJ3QgbWFrZSBhbnkgc2Vuc2UgaW4gY2FzZSBhbiBpbi1wYXJhbWV0ZXIgdXNlcyBhIG5hdmlnYXRpb24gcHJvcGVydHlcblx0XHRcdFx0XHRcdC8vIHJlZmVycmluZyB0byB0aGUgcGFydG5lci4gVGhlcmVmb3JlIHJlZHVjaW5nIHRoZSBwYXRoIGFuZCB1c2luZyB0aGUgRlZIIGNvbnRleHQgaW5zdGVhZCBvZiB0aGUgY29uZGl0aW9uIG1vZGVsXG5cdFx0XHRcdFx0XHR2YWx1ZVBhdGggPSBsb2NhbERhdGFQcm9wZXJ0eVBhdGgucmVwbGFjZShmaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSArIFwiL1wiLCBcIlwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghdmFsdWVQYXRoKSB7XG5cdFx0XHRcdHZhbHVlUGF0aCA9IGNvbmRpdGlvbk1vZGVsICsgXCI+L2NvbmRpdGlvbnMvXCIgKyBsb2NhbERhdGFQcm9wZXJ0eVBhdGg7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbHVlUGF0aCA9IGNvbnRleHRQcmVmaXggKyBsb2NhbERhdGFQcm9wZXJ0eVBhdGg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhcm1ldGVyVHlwZTogcGFyYW1ldGVyLiRUeXBlLFxuXHRcdFx0c291cmNlOiB2YWx1ZVBhdGgsXG5cdFx0XHRoZWxwUGF0aDogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0Y29uc3RhbnRWYWx1ZTogcGFyYW1ldGVyLkNvbnN0YW50LFxuXHRcdFx0aW5pdGlhbFZhbHVlRmlsdGVyRW1wdHk6IEJvb2xlYW4ocGFyYW1ldGVyLkluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQpXG5cdFx0fTtcblx0fSxcblxuXHRfcGFyYW1ldGVySXNBKHBhcmFtZXRlcjogQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlciwgcGFyYW1ldGVyVHlwZXM6IENvbW1vbkFubm90YXRpb25UeXBlc1tdKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHBhcmFtZXRlclR5cGVzLmluY2x1ZGVzKHBhcmFtZXRlci4kVHlwZSBhcyBDb21tb25Bbm5vdGF0aW9uVHlwZXMpO1xuXHR9LFxuXG5cdF9lbnJpY2hQYXRoOiBmdW5jdGlvbiAoXG5cdFx0cGF0aDogUGF0aCxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHRsb2NhbERhdGFQcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHRwYXJhbWV0ZXI6IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXIsXG5cdFx0cHJvcGVydHlOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eVxuXHQpIHtcblx0XHRpZiAoXG5cdFx0XHQhcGF0aC5rZXkgJiZcblx0XHRcdFZhbHVlTGlzdEhlbHBlci5fcGFyYW1ldGVySXNBKHBhcmFtZXRlciwgW1xuXHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVyT3V0LFxuXHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcblx0XHRcdF0pICYmXG5cdFx0XHRsb2NhbERhdGFQcm9wZXJ0eVBhdGggPT09IHByb3BlcnR5TmFtZVxuXHRcdCkge1xuXHRcdFx0cGF0aC5maWVsZFByb3BlcnR5UGF0aCA9IHByb3BlcnR5UGF0aDtcblx0XHRcdHBhdGgua2V5ID0gcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5O1xuXG5cdFx0XHQvL09ubHkgdGhlIHRleHQgYW5ub3RhdGlvbiBvZiB0aGUga2V5IGNhbiBzcGVjaWZ5IHRoZSBkZXNjcmlwdGlvblxuXHRcdFx0cGF0aC5kZXNjcmlwdGlvblBhdGggPSBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0XT8uJFBhdGggfHwgXCJcIjtcblx0XHR9XG5cdH0sXG5cblx0X2VucmljaEtleXM6IGZ1bmN0aW9uICh2aEtleXM6IHN0cmluZ1tdLCBwYXJhbWV0ZXI6IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXIpIHtcblx0XHRpZiAoXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3BhcmFtZXRlcklzQShwYXJhbWV0ZXIsIFtcblx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlck91dCxcblx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluLFxuXHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcblx0XHRcdF0pICYmXG5cdFx0XHQhdmhLZXlzLmluY2x1ZGVzKHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSlcblx0XHQpIHtcblx0XHRcdHZoS2V5cy5wdXNoKHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9wcm9jZXNzUGFyYW1ldGVyczogZnVuY3Rpb24gKFxuXHRcdGFubm90YXRpb25WYWx1ZUxpc3RUeXBlOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRjb25kaXRpb25Nb2RlbDogc3RyaW5nLFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRleHRQcmVmaXg6IHN0cmluZyxcblx0XHR2aE1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdFx0dmFsdWVIZWxwUXVhbGlmaWVyOiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHthbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS5Db2xsZWN0aW9uUGF0aH1gLFxuXHRcdFx0ZW50aXR5VHlwZSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0vYCk7XG5cdFx0aWYgKGVudGl0eVR5cGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0TG9nLmVycm9yKGBJbmNvbnNpc3RlbnQgdmFsdWUgaGVscCBtZXRhZGF0YTogRW50aXR5ICR7ZW50aXR5U2V0UGF0aH0gaXMgbm90IGRlZmluZWRgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBjb2x1bW5EZWZzID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyhtZXRhTW9kZWwsIGVudGl0eVNldFBhdGgpLFxuXHRcdFx0dmhQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdID0gW10sXG5cdFx0XHR2aEtleXM6IHN0cmluZ1tdID0gZW50aXR5VHlwZS4kS2V5ID8gWy4uLmVudGl0eVR5cGUuJEtleV0gOiBbXTtcblxuXHRcdGNvbnN0IHBhdGg6IFBhdGggPSB7XG5cdFx0XHRmaWVsZFByb3BlcnR5UGF0aDogXCJcIixcblx0XHRcdGRlc2NyaXB0aW9uUGF0aDogXCJcIixcblx0XHRcdGtleTogXCJcIlxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS5QYXJhbWV0ZXJzKSB7XG5cdFx0XHQvL0FsbCBTdHJpbmcgZmllbGRzIGFyZSBhbGxvd2VkIGZvciBmaWx0ZXJcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IGAvJHthbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS5Db2xsZWN0aW9uUGF0aH0vJHtwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHl9YCxcblx0XHRcdFx0cHJvcGVydHkgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KHByb3BlcnR5UGF0aCksXG5cdFx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnMgPSAobWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApIHx8IHt9KSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5LFxuXHRcdFx0XHRsb2NhbERhdGFQcm9wZXJ0eVBhdGggPSBwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggfHwgXCJcIjtcblxuXHRcdFx0Ly8gSWYgcHJvcGVydHkgaXMgdW5kZWZpbmVkLCB0aGVuIHRoZSBwcm9wZXJ0eSBjb21pbmcgZm9yIHRoZSBlbnRyeSBpc24ndCBkZWZpbmVkIGluXG5cdFx0XHQvLyB0aGUgbWV0YW1vZGVsLCB0aGVyZWZvcmUgd2UgZG9uJ3QgbmVlZCB0byBhZGQgaXQgaW4gdGhlIGluL291dCBwYXJhbWV0ZXJzXG5cdFx0XHRpZiAocHJvcGVydHkpIHtcblx0XHRcdFx0Ly8gU2VhcmNoIGZvciB0aGUgKm91dCBQYXJhbWV0ZXIgbWFwcGVkIHRvIHRoZSBsb2NhbCBwcm9wZXJ0eVxuXHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX2VucmljaFBhdGgocGF0aCwgcHJvcGVydHlQYXRoLCBsb2NhbERhdGFQcm9wZXJ0eVBhdGgsIHBhcmFtZXRlciwgcHJvcGVydHlOYW1lLCBwcm9wZXJ0eUFubm90YXRpb25zKTtcblxuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3RQcm9wZXJ0eSA9IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLl9tZXJnZUNvbHVtbkRlZmluaXRpb25zRnJvbVByb3BlcnRpZXMoXG5cdFx0XHRcdFx0Y29sdW1uRGVmcyxcblx0XHRcdFx0XHRhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHRcdFx0XHR2YWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRwcm9wZXJ0eUFubm90YXRpb25zXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vSW4gYW5kIEluT3V0IGFuZCBPdXRcblx0XHRcdGlmIChcblx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLl9wYXJhbWV0ZXJJc0EocGFyYW1ldGVyLCBbXG5cdFx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluLFxuXHRcdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQsXG5cdFx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XG5cdFx0XHRcdF0pICYmXG5cdFx0XHRcdGxvY2FsRGF0YVByb3BlcnR5UGF0aCAhPT0gcHJvcGVydHlOYW1lXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgdmhQYXJhbWV0ZXIgPSBWYWx1ZUxpc3RIZWxwZXIuX2dldFZoUGFyYW1ldGVyKFxuXHRcdFx0XHRcdGNvbmRpdGlvbk1vZGVsLFxuXHRcdFx0XHRcdHZhbHVlSGVscCxcblx0XHRcdFx0XHRjb250ZXh0UHJlZml4LFxuXHRcdFx0XHRcdHBhcmFtZXRlcixcblx0XHRcdFx0XHR2aE1ldGFNb2RlbCxcblx0XHRcdFx0XHRsb2NhbERhdGFQcm9wZXJ0eVBhdGhcblx0XHRcdFx0KTtcblx0XHRcdFx0dmhQYXJhbWV0ZXJzLnB1c2godmhQYXJhbWV0ZXIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL0NvbnN0YW50IGFzIEluUGFyYW10ZXIgZm9yIGZpbHRlcmluZ1xuXHRcdFx0aWYgKHBhcmFtZXRlci4kVHlwZSA9PT0gQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50KSB7XG5cdFx0XHRcdHZoUGFyYW1ldGVycy5wdXNoKHtcblx0XHRcdFx0XHRwYXJtZXRlclR5cGU6IHBhcmFtZXRlci4kVHlwZSxcblx0XHRcdFx0XHRzb3VyY2U6IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRoZWxwUGF0aDogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdGNvbnN0YW50VmFsdWU6IHBhcmFtZXRlci5Db25zdGFudCxcblx0XHRcdFx0XHRpbml0aWFsVmFsdWVGaWx0ZXJFbXB0eTogQm9vbGVhbihwYXJhbWV0ZXIuSW5pdGlhbFZhbHVlSXNTaWduaWZpY2FudClcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEVucmljaCBrZXlzIHdpdGggb3V0LXBhcmFtZXRlcnNcblx0XHRcdFZhbHVlTGlzdEhlbHBlci5fZW5yaWNoS2V5cyh2aEtleXMsIHBhcmFtZXRlcik7XG5cdFx0fVxuXG5cdFx0LyogRW5zdXJlIHRoYXQgdmhLZXlzIGFyZSBwYXJ0IG9mIHRoZSBjb2x1bW5EZWZzLCBvdGhlcndpc2UgaXQgaXMgbm90IGNvbnNpZGVyZWQgaW4gJHNlbGVjdCAoQkNQIDIyNzAxNDExNTQpICovXG5cdFx0Zm9yIChjb25zdCB2aEtleSBvZiB2aEtleXMpIHtcblx0XHRcdGlmIChjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZChjb2x1bW5EZWZzLCB2aEtleSkpIHtcblx0XHRcdFx0Y29uc3QgY29sdW1uRGVmOiBDb2x1bW5EZWYgPSB7XG5cdFx0XHRcdFx0cGF0aDogdmhLZXksXG5cdFx0XHRcdFx0JFR5cGU6IG1ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2Fubm90YXRpb25WYWx1ZUxpc3RUeXBlLkNvbGxlY3Rpb25QYXRofS8ke3BhdGgua2V5fWApPy4kVHlwZSxcblx0XHRcdFx0XHRsYWJlbDogXCJcIixcblx0XHRcdFx0XHRzb3J0YWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0ZmlsdGVyYWJsZTogdW5kZWZpbmVkXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbHVtbkRlZnMucHVzaChjb2x1bW5EZWYpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHZhbHVlbGlzdEluZm86IFZhbHVlTGlzdEluZm8gPSB7XG5cdFx0XHRrZXlQYXRoOiBwYXRoLmtleSxcblx0XHRcdGRlc2NyaXB0aW9uUGF0aDogcGF0aC5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRmaWVsZFByb3BlcnR5UGF0aDogcGF0aC5maWVsZFByb3BlcnR5UGF0aCxcblx0XHRcdHZoS2V5czogdmhLZXlzLFxuXHRcdFx0dmhQYXJhbWV0ZXJzOiB2aFBhcmFtZXRlcnMsXG5cdFx0XHR2YWx1ZUxpc3RJbmZvOiBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHRcdGNvbHVtbkRlZnM6IGNvbHVtbkRlZnMsXG5cdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXJcblx0XHR9O1xuXHRcdHJldHVybiB2YWx1ZWxpc3RJbmZvO1xuXHR9LFxuXG5cdF9sb2dFcnJvcjogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogc3RyaW5nLCBlcnJvcj86IHVua25vd24pIHtcblx0XHRjb25zdCBzdGF0dXMgPSBlcnJvciA/IChlcnJvciBhcyBYTUxIdHRwUmVxdWVzdCkuc3RhdHVzIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG5cdFx0Y29uc3QgbXNnID0gc3RhdHVzID09PSA0MDQgPyBgTWV0YWRhdGEgbm90IGZvdW5kICgke3N0YXR1c30pIGZvciB2YWx1ZSBoZWxwIG9mIHByb3BlcnR5ICR7cHJvcGVydHlQYXRofWAgOiBtZXNzYWdlO1xuXG5cdFx0TG9nLmVycm9yKG1zZyk7XG5cdH0sXG5cblx0Z2V0VmFsdWVMaXN0SW5mbzogYXN5bmMgZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGg6IHN0cmluZywgcGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCk6IFByb21pc2U8VmFsdWVMaXN0SW5mb1tdPiB7XG5cdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSB2YWx1ZUhlbHAuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRcdFx0Y29uZGl0aW9uTW9kZWwgPSBwYXlsb2FkLmNvbmRpdGlvbk1vZGVsLFxuXHRcdFx0dmhNZXRhTW9kZWwgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHZhbHVlTGlzdEluZm9zOiBWYWx1ZUxpc3RJbmZvW10gPSBbXSxcblx0XHRcdHByb3BlcnR5UGF0aFBhcnRzID0gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdmFsdWVMaXN0QnlRdWFsaWZpZXIgPSAoYXdhaXQgdmhNZXRhTW9kZWwucmVxdWVzdFZhbHVlTGlzdEluZm8oXG5cdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0YmluZGluZ0NvbnRleHRcblx0XHRcdCkpIGFzIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlQnlRdWFsaWZpZXI7XG5cdFx0XHRjb25zdCB2YWx1ZUhlbHBRdWFsaWZpZXJzID0gVmFsdWVMaXN0SGVscGVyLnB1dERlZmF1bHRRdWFsaWZpZXJGaXJzdChPYmplY3Qua2V5cyh2YWx1ZUxpc3RCeVF1YWxpZmllcikpLFxuXHRcdFx0XHRwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eVBhdGhQYXJ0cy5wb3AoKTtcblxuXHRcdFx0Y29uc3QgY29udGV4dFByZWZpeCA9IHBheWxvYWQudXNlTXVsdGlWYWx1ZUZpZWxkID8gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZXh0UHJlZml4KGJpbmRpbmdDb250ZXh0LCBwcm9wZXJ0eVBhdGhQYXJ0cykgOiBcIlwiO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlSGVscFF1YWxpZmllciBvZiB2YWx1ZUhlbHBRdWFsaWZpZXJzKSB7XG5cdFx0XHRcdC8vIEFkZCBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHByb3BlcnRpZXMgZGVmaW5lZCBhcyBTZWxlY3Rpb24gZmllbGRzIG9uIHRoZSBDb2xsZWN0aW9uUGF0aCBlbnRpdHkgc2V0LlxuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSA9IHZhbHVlTGlzdEJ5UXVhbGlmaWVyW3ZhbHVlSGVscFF1YWxpZmllcl07XG5cblx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9IFZhbHVlTGlzdEhlbHBlci5fcHJvY2Vzc1BhcmFtZXRlcnMoXG5cdFx0XHRcdFx0YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUsXG5cdFx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdGNvbmRpdGlvbk1vZGVsLFxuXHRcdFx0XHRcdHZhbHVlSGVscCxcblx0XHRcdFx0XHRjb250ZXh0UHJlZml4LFxuXHRcdFx0XHRcdHZoTWV0YU1vZGVsLFxuXHRcdFx0XHRcdHZhbHVlSGVscFF1YWxpZmllclxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvKiBPbmx5IGNvbnNpc3RlbnQgdmFsdWUgaGVscCBkZWZpbml0aW9ucyBzaGFsbCBiZSBwYXJ0IG9mIHRoZSB2YWx1ZSBoZWxwICovXG5cdFx0XHRcdGlmICh2YWx1ZUxpc3RJbmZvKSB7XG5cdFx0XHRcdFx0dmFsdWVMaXN0SW5mb3MucHVzaCh2YWx1ZUxpc3RJbmZvKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5fbG9nRXJyb3IocHJvcGVydHlQYXRoLCBlcnIpO1xuXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZGVzdHJveVZIQ29udGVudCh2YWx1ZUhlbHApO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVMaXN0SW5mb3M7XG5cdH0sXG5cblx0QUxMRlJBR01FTlRTOiB1bmRlZmluZWQgYXMgYW55LFxuXHRsb2dGcmFnbWVudDogdW5kZWZpbmVkIGFzIGFueSxcblxuXHRfbG9nVGVtcGxhdGVkRnJhZ21lbnRzOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcsIGZyYWdtZW50TmFtZTogc3RyaW5nLCBmcmFnbWVudERlZmluaXRpb246IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IGxvZ0luZm8gPSB7XG5cdFx0XHRwYXRoOiBwcm9wZXJ0eVBhdGgsXG5cdFx0XHRmcmFnbWVudE5hbWU6IGZyYWdtZW50TmFtZSxcblx0XHRcdGZyYWdtZW50OiBmcmFnbWVudERlZmluaXRpb25cblx0XHR9O1xuXHRcdGlmIChMb2cuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuREVCVUcpIHtcblx0XHRcdC8vSW4gZGVidWcgbW9kZSB3ZSBsb2cgYWxsIGdlbmVyYXRlZCBmcmFnbWVudHNcblx0XHRcdFZhbHVlTGlzdEhlbHBlci5BTExGUkFHTUVOVFMgPSBWYWx1ZUxpc3RIZWxwZXIuQUxMRlJBR01FTlRTIHx8IFtdO1xuXHRcdFx0VmFsdWVMaXN0SGVscGVyLkFMTEZSQUdNRU5UUy5wdXNoKGxvZ0luZm8pO1xuXHRcdH1cblx0XHRpZiAoVmFsdWVMaXN0SGVscGVyLmxvZ0ZyYWdtZW50KSB7XG5cdFx0XHQvL09uZSBUb29sIFN1YnNjcmliZXIgYWxsb3dlZFxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5sb2dGcmFnbWVudChsb2dJbmZvKTtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0fSxcblxuXHRfdGVtcGxhdGVGcmFnbWVudDogYXN5bmMgZnVuY3Rpb24gPFQgZXh0ZW5kcyBUYWJsZSB8IE1kY0lubmVyVGFibGUgfCBNZGNGaWx0ZXJCYXI+KFxuXHRcdGZyYWdtZW50TmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlTGlzdEluZm86IFZhbHVlTGlzdEluZm8sXG5cdFx0c291cmNlTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZ1xuXHQpOiBQcm9taXNlPFQ+IHtcblx0XHRjb25zdCBsb2NhbFZhbHVlTGlzdEluZm8gPSB2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sXG5cdFx0XHR2YWx1ZUxpc3RNb2RlbCA9IG5ldyBKU09OTW9kZWwobG9jYWxWYWx1ZUxpc3RJbmZvKSxcblx0XHRcdHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwgPSBsb2NhbFZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0dmlld0RhdGEgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0Y29udmVydGVyVHlwZTogXCJMaXN0UmVwb3J0XCIsXG5cdFx0XHRcdGNvbHVtbnM6IHZhbHVlTGlzdEluZm8uY29sdW1uRGVmcyB8fCBudWxsXG5cdFx0XHR9KTtcblxuXHRcdGNvbnN0IGZyYWdtZW50RGVmaW5pdGlvbiA9IGF3YWl0IFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0WE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKGZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKSxcblx0XHRcdHsgbmFtZTogZnJhZ21lbnROYW1lIH0sXG5cdFx0XHR7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdHZhbHVlTGlzdDogdmFsdWVMaXN0TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdGNvbnRleHRQYXRoOiB2YWx1ZUxpc3RTZXJ2aWNlTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHtsb2NhbFZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9L2ApLFxuXHRcdFx0XHRcdHNvdXJjZTogc291cmNlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdHZhbHVlTGlzdDogdmFsdWVMaXN0TW9kZWwsXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg6IHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwsXG5cdFx0XHRcdFx0c291cmNlOiBzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRtZXRhTW9kZWw6IHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwsXG5cdFx0XHRcdFx0dmlld0RhdGE6IHZpZXdEYXRhXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQpO1xuXHRcdFZhbHVlTGlzdEhlbHBlci5fbG9nVGVtcGxhdGVkRnJhZ21lbnRzKHByb3BlcnR5UGF0aCwgZnJhZ21lbnROYW1lLCBmcmFnbWVudERlZmluaXRpb24pO1xuXHRcdHJldHVybiAoYXdhaXQgRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IGZyYWdtZW50RGVmaW5pdGlvbiB9KSkgYXMgVDtcblx0fSxcblxuXHRfZ2V0Q29udGVudElkOiBmdW5jdGlvbiAodmFsdWVIZWxwSWQ6IHN0cmluZywgdmFsdWVIZWxwUXVhbGlmaWVyOiBzdHJpbmcsIGlzVHlwZWFoZWFkOiBib29sZWFuKTogc3RyaW5nIHtcblx0XHRjb25zdCBjb250ZW50VHlwZSA9IGlzVHlwZWFoZWFkID8gXCJQb3BvdmVyXCIgOiBcIkRpYWxvZ1wiO1xuXG5cdFx0cmV0dXJuIGAke3ZhbHVlSGVscElkfTo6JHtjb250ZW50VHlwZX06OnF1YWxpZmllcjo6JHt2YWx1ZUhlbHBRdWFsaWZpZXJ9YDtcblx0fSxcblxuXHRfYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkOiBmdW5jdGlvbiAocGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCwgdmFsdWVMaXN0SW5mbzogVmFsdWVMaXN0SW5mbyk6IHZvaWQge1xuXHRcdGNvbnN0IHZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0aWYgKCFwYXlsb2FkLnF1YWxpZmllcnMpIHtcblx0XHRcdHBheWxvYWQucXVhbGlmaWVycyA9IHt9O1xuXHRcdH1cblxuXHRcdGlmICghcGF5bG9hZC5xdWFsaWZpZXJzW3ZhbHVlSGVscFF1YWxpZmllcl0pIHtcblx0XHRcdHBheWxvYWQucXVhbGlmaWVyc1t2YWx1ZUhlbHBRdWFsaWZpZXJdID0ge1xuXHRcdFx0XHR2aEtleXM6IHZhbHVlTGlzdEluZm8udmhLZXlzLFxuXHRcdFx0XHR2aFBhcmFtZXRlcnM6IHZhbHVlTGlzdEluZm8udmhQYXJhbWV0ZXJzXG5cdFx0XHR9O1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0VmFsdWVIZWxwQ29sdW1uRGlzcGxheUZvcm1hdDogZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yUHJvcGVydHksXG5cdFx0aXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM6IGJvb2xlYW5cblx0KTogRGlzcGxheUZvcm1hdCB7XG5cdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUocHJvcGVydHlBbm5vdGF0aW9ucywgdW5kZWZpbmVkKSxcblx0XHRcdHRleHRBbm5vdGF0aW9uID0gcHJvcGVydHlBbm5vdGF0aW9ucyAmJiBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0XSxcblx0XHRcdHRleHRBcnJhbmdlbWVudEFubm90YXRpb24gPSB0ZXh0QW5ub3RhdGlvbiAmJiBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0VUlUZXh0QXJyYW5nZW1lbnRdO1xuXG5cdFx0aWYgKGlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzKSB7XG5cdFx0XHRyZXR1cm4gdGV4dEFubm90YXRpb24gJiYgdHlwZW9mIHRleHRBbm5vdGF0aW9uICE9PSBcInN0cmluZ1wiICYmIHRleHRBbm5vdGF0aW9uLiRQYXRoID8gZGlzcGxheU1vZGUgOiBcIlZhbHVlXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE9ubHkgZXhwbGljaXQgZGVmaW5lZCBUZXh0QXJyYW5nZW1lbnRzIGluIGEgVmFsdWUgSGVscCB3aXRoIERpYWxvZyBhcmUgY29uc2lkZXJlZFxuXHRcdFx0cmV0dXJuIHRleHRBcnJhbmdlbWVudEFubm90YXRpb24gPyBkaXNwbGF5TW9kZSA6IFwiVmFsdWVcIjtcblx0XHR9XG5cdH0sXG5cblx0X2dldFdpZHRoSW5SZW06IGZ1bmN0aW9uIChjb250cm9sOiBDb250cm9sLCBpc1VuaXRWYWx1ZUhlbHA6IGJvb2xlYW4pOiBudW1iZXIge1xuXHRcdGxldCB3aWR0aCA9IGNvbnRyb2wuJCgpLndpZHRoKCk7IC8vIEpRdWVyeVxuXHRcdGlmIChpc1VuaXRWYWx1ZUhlbHAgJiYgd2lkdGgpIHtcblx0XHRcdHdpZHRoID0gMC4zICogd2lkdGg7XG5cdFx0fVxuXHRcdGNvbnN0IGZsb2F0V2lkdGggPSB3aWR0aCA/IHBhcnNlRmxvYXQoU3RyaW5nKFJlbS5mcm9tUHgod2lkdGgpKSkgOiAwO1xuXG5cdFx0cmV0dXJuIGlzTmFOKGZsb2F0V2lkdGgpID8gMCA6IGZsb2F0V2lkdGg7XG5cdH0sXG5cblx0X2dldFRhYmxlV2lkdGg6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIG1pbldpZHRoOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGxldCB3aWR0aDogc3RyaW5nO1xuXHRcdGNvbnN0IGNvbHVtbnMgPSB0YWJsZS5nZXRDb2x1bW5zKCksXG5cdFx0XHR2aXNpYmxlQ29sdW1ucyA9XG5cdFx0XHRcdChjb2x1bW5zICYmXG5cdFx0XHRcdFx0Y29sdW1ucy5maWx0ZXIoZnVuY3Rpb24gKGNvbHVtbikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbHVtbiAmJiBjb2x1bW4uZ2V0VmlzaWJsZSAmJiBjb2x1bW4uZ2V0VmlzaWJsZSgpO1xuXHRcdFx0XHRcdH0pKSB8fFxuXHRcdFx0XHRbXSxcblx0XHRcdHN1bVdpZHRoID0gdmlzaWJsZUNvbHVtbnMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIGNvbHVtbikge1xuXHRcdFx0XHR3aWR0aCA9IGNvbHVtbi5nZXRXaWR0aCgpO1xuXHRcdFx0XHRpZiAod2lkdGggJiYgd2lkdGguZW5kc1dpdGgoXCJweFwiKSkge1xuXHRcdFx0XHRcdHdpZHRoID0gU3RyaW5nKFJlbS5mcm9tUHgod2lkdGgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBmbG9hdFdpZHRoID0gcGFyc2VGbG9hdCh3aWR0aCk7XG5cblx0XHRcdFx0cmV0dXJuIHN1bSArIChpc05hTihmbG9hdFdpZHRoKSA/IDkgOiBmbG9hdFdpZHRoKTtcblx0XHRcdH0sIHZpc2libGVDb2x1bW5zLmxlbmd0aCk7XG5cdFx0cmV0dXJuIGAke01hdGgubWF4KHN1bVdpZHRoLCBtaW5XaWR0aCl9ZW1gO1xuXHR9LFxuXG5cdF9jcmVhdGVWYWx1ZUhlbHBUeXBlYWhlYWQ6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHR2YWx1ZUhlbHA6IFZhbHVlSGVscCxcblx0XHRjb250ZW50OiBNVGFibGUsXG5cdFx0dmFsdWVMaXN0SW5mbzogVmFsdWVMaXN0SW5mbyxcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkXG5cdCkge1xuXHRcdGNvbnN0IGNvbnRlbnRJZCA9IGNvbnRlbnQuZ2V0SWQoKSxcblx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnMgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSEuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1AYCkgYXMgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRcdHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyA9IHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlc10gPz8gZmFsc2UsXG5cdFx0XHRpc0RpYWxvZ1RhYmxlID0gZmFsc2UsXG5cdFx0XHRjb2x1bW5JbmZvID0gVmFsdWVMaXN0SGVscGVyLmdldENvbHVtblZpc2liaWxpdHlJbmZvKFxuXHRcdFx0XHR2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sXG5cdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0dmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzLFxuXHRcdFx0XHRpc0RpYWxvZ1RhYmxlXG5cdFx0XHQpLFxuXHRcdFx0c291cmNlTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0aWQ6IGNvbnRlbnRJZCxcblx0XHRcdFx0Z3JvdXBJZDogcGF5bG9hZC5yZXF1ZXN0R3JvdXBJZCB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdGJTdWdnZXN0aW9uOiB0cnVlLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IHByb3BlcnR5UGF0aCxcblx0XHRcdFx0Y29sdW1uSW5mbzogY29sdW1uSW5mbyxcblx0XHRcdFx0dmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiB2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXNcblx0XHRcdH0pO1xuXG5cdFx0Y29udGVudC5zZXRLZXlQYXRoKHZhbHVlTGlzdEluZm8ua2V5UGF0aCk7XG5cdFx0Y29udGVudC5zZXREZXNjcmlwdGlvblBhdGgodmFsdWVMaXN0SW5mby5kZXNjcmlwdGlvblBhdGgpO1xuXHRcdHBheWxvYWQuaXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgPSB2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM7XG5cblx0XHRjb25zdCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMgPVxuXHRcdFx0dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYC8ke3ZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH1AYCkgfHwge307XG5cblx0XHRjb250ZW50LnNldEZpbHRlckZpZWxkcyhWYWx1ZUxpc3RIZWxwZXIuZW50aXR5SXNTZWFyY2hhYmxlKHByb3BlcnR5QW5ub3RhdGlvbnMsIGNvbGxlY3Rpb25Bbm5vdGF0aW9ucykgPyBcIiRzZWFyY2hcIiA6IFwiXCIpO1xuXG5cdFx0Y29uc3QgdGFibGUgPSBhd2FpdCBWYWx1ZUxpc3RIZWxwZXIuX3RlbXBsYXRlRnJhZ21lbnQ8VGFibGU+KFxuXHRcdFx0XCJzYXAuZmUubWFjcm9zLmludGVybmFsLnZhbHVlaGVscC5WYWx1ZUxpc3RUYWJsZVwiLFxuXHRcdFx0dmFsdWVMaXN0SW5mbyxcblx0XHRcdHNvdXJjZU1vZGVsLFxuXHRcdFx0cHJvcGVydHlQYXRoXG5cdFx0KTtcblxuXHRcdHRhYmxlLnNldE1vZGVsKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwpO1xuXG5cdFx0TG9nLmluZm8oYFZhbHVlIExpc3QtIHN1Z2dlc3QgVGFibGUgWE1MIGNvbnRlbnQgY3JlYXRlZCBbJHtwcm9wZXJ0eVBhdGh9XWAsIHRhYmxlLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpLCBcIk1EQyBUZW1wbGF0aW5nXCIpO1xuXG5cdFx0Y29udGVudC5zZXRUYWJsZSh0YWJsZSk7XG5cblx0XHRjb25zdCBmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCk7XG5cblx0XHRpZiAoXG5cdFx0XHRmaWVsZCAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHQoZmllbGQuaXNBPEZpbHRlckZpZWxkPihcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgfHxcblx0XHRcdFx0ZmllbGQuaXNBPEZpZWxkPihcInNhcC51aS5tZGMuRmllbGRcIikgfHxcblx0XHRcdFx0ZmllbGQuaXNBPE11bHRpVmFsdWVGaWVsZD4oXCJzYXAudWkubWRjLk11bHRpVmFsdWVGaWVsZFwiKSlcblx0XHQpIHtcblx0XHRcdC8vQ2FuIHRoZSBmaWx0ZXJmaWVsZCBiZSBzb21ldGhpbmcgZWxzZSB0aGF0IHdlIG5lZWQgdGhlIC5pc0EoKSBjaGVjaz9cblx0XHRcdGNvbnN0IHJlZHVjZVdpZHRoRm9yVW5pdFZhbHVlSGVscCA9IEJvb2xlYW4ocGF5bG9hZC5pc1VuaXRWYWx1ZUhlbHApO1xuXHRcdFx0Y29uc3QgdGFibGVXaWR0aCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0VGFibGVXaWR0aCh0YWJsZSwgVmFsdWVMaXN0SGVscGVyLl9nZXRXaWR0aEluUmVtKGZpZWxkLCByZWR1Y2VXaWR0aEZvclVuaXRWYWx1ZUhlbHApKTtcblx0XHRcdHRhYmxlLnNldFdpZHRoKHRhYmxlV2lkdGgpO1xuXG5cdFx0XHRpZiAodmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzKSB7XG5cdFx0XHRcdHRhYmxlLnNldE1vZGUoKGZpZWxkIGFzIEZpZWxkQmFzZSkuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxID8gXCJTaW5nbGVTZWxlY3RNYXN0ZXJcIiA6IFwiTXVsdGlTZWxlY3RcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YWJsZS5zZXRNb2RlKFwiU2luZ2xlU2VsZWN0TWFzdGVyXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfY3JlYXRlVmFsdWVIZWxwRGlhbG9nOiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0Y29udGVudDogTURDVGFibGUsXG5cdFx0dmFsdWVMaXN0SW5mbzogVmFsdWVMaXN0SW5mbyxcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHByb3BlcnR5QW5ub3RhdGlvbnMgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSEuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1AYCkgYXMgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRcdGlzRHJvcERvd25MaXN0ZSA9IGZhbHNlLFxuXHRcdFx0aXNEaWFsb2dUYWJsZSA9IHRydWUsXG5cdFx0XHRjb2x1bW5JbmZvID0gVmFsdWVMaXN0SGVscGVyLmdldENvbHVtblZpc2liaWxpdHlJbmZvKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mbywgcHJvcGVydHlQYXRoLCBpc0Ryb3BEb3duTGlzdGUsIGlzRGlhbG9nVGFibGUpLFxuXHRcdFx0c291cmNlTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0aWQ6IGNvbnRlbnQuZ2V0SWQoKSxcblx0XHRcdFx0Z3JvdXBJZDogcGF5bG9hZC5yZXF1ZXN0R3JvdXBJZCB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdGJTdWdnZXN0aW9uOiBmYWxzZSxcblx0XHRcdFx0Y29sdW1uSW5mbzogY29sdW1uSW5mbyxcblx0XHRcdFx0dmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiBpc0Ryb3BEb3duTGlzdGVcblx0XHRcdH0pO1xuXG5cdFx0Y29udGVudC5zZXRLZXlQYXRoKHZhbHVlTGlzdEluZm8ua2V5UGF0aCk7XG5cdFx0Y29udGVudC5zZXREZXNjcmlwdGlvblBhdGgodmFsdWVMaXN0SW5mby5kZXNjcmlwdGlvblBhdGgpO1xuXG5cdFx0Y29uc3QgY29sbGVjdGlvbkFubm90YXRpb25zID1cblx0XHRcdHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9QGApIHx8IHt9O1xuXG5cdFx0Y29udGVudC5zZXRGaWx0ZXJGaWVsZHMoVmFsdWVMaXN0SGVscGVyLmVudGl0eUlzU2VhcmNoYWJsZShwcm9wZXJ0eUFubm90YXRpb25zLCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMpID8gXCIkc2VhcmNoXCIgOiBcIlwiKTtcblxuXHRcdGNvbnN0IHRhYmxlUHJvbWlzZSA9IFZhbHVlTGlzdEhlbHBlci5fdGVtcGxhdGVGcmFnbWVudDxNZGNJbm5lclRhYmxlPihcblx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0RGlhbG9nVGFibGVcIixcblx0XHRcdHZhbHVlTGlzdEluZm8sXG5cdFx0XHRzb3VyY2VNb2RlbCxcblx0XHRcdHByb3BlcnR5UGF0aFxuXHRcdCk7XG5cblx0XHRjb25zdCBmaWx0ZXJCYXJQcm9taXNlID0gVmFsdWVMaXN0SGVscGVyLl90ZW1wbGF0ZUZyYWdtZW50PE1kY0ZpbHRlckJhcj4oXG5cdFx0XHRcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlTGlzdEZpbHRlckJhclwiLFxuXHRcdFx0dmFsdWVMaXN0SW5mbyxcblx0XHRcdHNvdXJjZU1vZGVsLFxuXHRcdFx0cHJvcGVydHlQYXRoXG5cdFx0KTtcblxuXHRcdGNvbnN0IFt0YWJsZSwgZmlsdGVyQmFyXSA9IGF3YWl0IFByb21pc2UuYWxsKFt0YWJsZVByb21pc2UsIGZpbHRlckJhclByb21pc2VdKTtcblxuXHRcdHRhYmxlLnNldE1vZGVsKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwpO1xuXHRcdGZpbHRlckJhci5zZXRNb2RlbCh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsKTtcblxuXHRcdGNvbnRlbnQuc2V0RmlsdGVyQmFyKGZpbHRlckJhcik7XG5cdFx0Y29udGVudC5zZXRUYWJsZSh0YWJsZSk7XG5cblx0XHR0YWJsZS5zZXRGaWx0ZXIoZmlsdGVyQmFyLmdldElkKCkpO1xuXHRcdHRhYmxlLmluaXRpYWxpemVkKCk7XG5cblx0XHRjb25zdCBmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCk7XG5cdFx0aWYgKGZpZWxkICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRhYmxlLnNldFNlbGVjdGlvbk1vZGUoKGZpZWxkIGFzIEZpZWxkQmFzZSkuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxID8gXCJTaW5nbGVNYXN0ZXJcIiA6IFwiTXVsdGlcIik7XG5cdFx0fVxuXHRcdHRhYmxlLnNldFdpZHRoKFwiMTAwJVwiKTtcblxuXHRcdC8vVGhpcyBpcyBhIHRlbXBvcmFyeSB3b3JrYXJyb3VuZCAtIHByb3ZpZGVkIGJ5IE1EQyAoc2VlIEZJT1JJVEVDSFAxLTI0MDAyKVxuXHRcdGNvbnN0IG1kY1RhYmxlID0gdGFibGUgYXMgYW55O1xuXHRcdG1kY1RhYmxlLl9zZXRTaG93UDEzbkJ1dHRvbihmYWxzZSk7XG5cdH0sXG5cblx0X2dldENvbnRlbnRCeUlkOiBmdW5jdGlvbiA8VCBleHRlbmRzIE1UYWJsZSB8IE1EQ1RhYmxlPihjb250ZW50TGlzdDogQ29udGVudFtdLCBjb250ZW50SWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBjb250ZW50TGlzdC5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRyZXR1cm4gaXRlbS5nZXRJZCgpID09PSBjb250ZW50SWQ7XG5cdFx0fSkgYXMgVCB8IHVuZGVmaW5lZDtcblx0fSxcblxuXHRfY3JlYXRlUG9wb3ZlckNvbnRlbnQ6IGZ1bmN0aW9uIChjb250ZW50SWQ6IHN0cmluZywgY2FzZVNlbnNpdGl2ZTogYm9vbGVhbiwgdXNlQXNWYWx1ZUhlbHA6IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gbmV3IE1UYWJsZSh7XG5cdFx0XHRpZDogY29udGVudElkLFxuXHRcdFx0Z3JvdXA6IFwiZ3JvdXAxXCIsXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBjYXNlU2Vuc2l0aXZlLFxuXHRcdFx0dXNlQXNWYWx1ZUhlbHA6IHVzZUFzVmFsdWVIZWxwXG5cdFx0fSBhcyAkTVRhYmxlU2V0dGluZ3MpO1xuXHR9LFxuXG5cdF9jcmVhdGVEaWFsb2dDb250ZW50OiBmdW5jdGlvbiAoY29udGVudElkOiBzdHJpbmcsIGNhc2VTZW5zaXRpdmU6IGJvb2xlYW4sIGZvcmNlQmluZDogYm9vbGVhbikge1xuXHRcdHJldHVybiBuZXcgTURDVGFibGUoe1xuXHRcdFx0aWQ6IGNvbnRlbnRJZCxcblx0XHRcdGdyb3VwOiBcImdyb3VwMVwiLFxuXHRcdFx0Y2FzZVNlbnNpdGl2ZTogY2FzZVNlbnNpdGl2ZSxcblx0XHRcdGZvcmNlQmluZDogZm9yY2VCaW5kXG5cdFx0fSBhcyAkTURDVGFibGVTZXR0aW5ncyk7XG5cdH0sXG5cblx0X3Nob3dDb25kaXRpb25zQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnRMaXN0OiBDb250ZW50W10sIGNvbnRhaW5lcjogQ29udGFpbmVyKSB7XG5cdFx0bGV0IGNvbmRpdGlvbnNDb250ZW50ID1cblx0XHRcdGNvbnRlbnRMaXN0Lmxlbmd0aCAmJiBjb250ZW50TGlzdFtjb250ZW50TGlzdC5sZW5ndGggLSAxXS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50LkNvbmRpdGlvbnNcIlxuXHRcdFx0XHQ/IGNvbnRlbnRMaXN0W2NvbnRlbnRMaXN0Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0aWYgKGNvbmRpdGlvbnNDb250ZW50KSB7XG5cdFx0XHRjb25kaXRpb25zQ29udGVudC5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25kaXRpb25zQ29udGVudCA9IG5ldyBDb25kaXRpb25zKCk7XG5cdFx0XHRjb250YWluZXIuYWRkQ29udGVudChjb25kaXRpb25zQ29udGVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9hbGlnbk9yQ3JlYXRlQ29udGVudDogZnVuY3Rpb24gKFxuXHRcdHZhbHVlTGlzdEluZm86IFZhbHVlTGlzdEluZm8sXG5cdFx0Y29udGVudElkOiBzdHJpbmcsXG5cdFx0Y2FzZVNlbnNpdGl2ZTogYm9vbGVhbixcblx0XHRzaG93Q29uZGl0aW9uUGFuZWw6IGJvb2xlYW4sXG5cdFx0Y29udGFpbmVyOiBDb250YWluZXJcblx0KSB7XG5cdFx0Y29uc3QgY29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdGxldCBjb250ZW50ID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50QnlJZDxNRENUYWJsZT4oY29udGVudExpc3QsIGNvbnRlbnRJZCk7XG5cblx0XHRpZiAoIWNvbnRlbnQpIHtcblx0XHRcdGNvbnN0IGZvcmNlQmluZCA9IHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5GZXRjaFZhbHVlcyA9PT0gMiA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdFx0Y29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fY3JlYXRlRGlhbG9nQ29udGVudChjb250ZW50SWQsIGNhc2VTZW5zaXRpdmUsIGZvcmNlQmluZCk7XG5cblx0XHRcdGlmICghc2hvd0NvbmRpdGlvblBhbmVsKSB7XG5cdFx0XHRcdGNvbnRhaW5lci5hZGRDb250ZW50KGNvbnRlbnQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGFpbmVyLmluc2VydENvbnRlbnQoY29udGVudCwgY29udGVudExpc3QubGVuZ3RoIC0gMSk7IC8vIGluc2VydCBjb250ZW50IGJlZm9yZSBjb25kaXRpb25zIGNvbnRlbnRcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGVudC5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb250ZW50O1xuXHR9LFxuXG5cdF9wcmVwYXJlVmFsdWVIZWxwVHlwZUFoZWFkOiBmdW5jdGlvbiAoXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0Y29udGFpbmVyOiBDb250YWluZXIsXG5cdFx0dmFsdWVMaXN0SW5mb3M6IFZhbHVlTGlzdEluZm9bXSxcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLFxuXHRcdGNhc2VTZW5zaXRpdmU6IGJvb2xlYW4sXG5cdFx0Zmlyc3RUeXBlQWhlYWRDb250ZW50OiBNVGFibGVcblx0KSB7XG5cdFx0Y29uc3QgY29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdGxldCBxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPSB2YWx1ZUhlbHAuZGF0YShcInZhbHVlbGlzdEZvclZhbGlkYXRpb25cIikgfHwgXCJcIjsgLy8gY2FuIGFsc28gYmUgbnVsbFxuXHRcdGlmIChxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPT09IFwiIFwiKSB7XG5cdFx0XHRxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPSBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gcXVhbGlmaWVyRm9yVHlwZWFoZWFkXG5cdFx0XHQ/IHZhbHVlTGlzdEluZm9zLmZpbHRlcihmdW5jdGlvbiAoc3ViVmFsdWVMaXN0SW5mbykge1xuXHRcdFx0XHRcdHJldHVybiBzdWJWYWx1ZUxpc3RJbmZvLnZhbHVlSGVscFF1YWxpZmllciA9PT0gcXVhbGlmaWVyRm9yVHlwZWFoZWFkO1xuXHRcdFx0ICB9KVswXVxuXHRcdFx0OiB2YWx1ZUxpc3RJbmZvc1swXTtcblxuXHRcdFZhbHVlTGlzdEhlbHBlci5fYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkKHBheWxvYWQsIHZhbHVlTGlzdEluZm8pO1xuXG5cdFx0Y29uc3QgY29udGVudElkID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50SWQodmFsdWVIZWxwLmdldElkKCksIHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyLCB0cnVlKTtcblx0XHRsZXQgY29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29udGVudEJ5SWQ8TVRhYmxlPihjb250ZW50TGlzdCwgY29udGVudElkKTtcblxuXHRcdGlmICghY29udGVudCkge1xuXHRcdFx0Y29uc3QgdXNlQXNWYWx1ZUhlbHAgPSBmaXJzdFR5cGVBaGVhZENvbnRlbnQuZ2V0VXNlQXNWYWx1ZUhlbHAoKTtcblx0XHRcdGNvbnRlbnQgPSBWYWx1ZUxpc3RIZWxwZXIuX2NyZWF0ZVBvcG92ZXJDb250ZW50KGNvbnRlbnRJZCwgY2FzZVNlbnNpdGl2ZSwgdXNlQXNWYWx1ZUhlbHApO1xuXG5cdFx0XHRjb250YWluZXIuaW5zZXJ0Q29udGVudChjb250ZW50LCAwKTsgLy8gaW5zZXJ0IGNvbnRlbnQgYXMgZmlyc3QgY29udGVudFxuXHRcdH0gZWxzZSBpZiAoY29udGVudElkICE9PSBjb250ZW50TGlzdFswXS5nZXRJZCgpKSB7XG5cdFx0XHQvLyBjb250ZW50IGFscmVhZHkgYXZhaWxhYmxlIGJ1dCBub3QgYXMgZmlyc3QgY29udGVudD9cblx0XHRcdGNvbnRhaW5lci5yZW1vdmVDb250ZW50KGNvbnRlbnQpO1xuXHRcdFx0Y29udGFpbmVyLmluc2VydENvbnRlbnQoY29udGVudCwgMCk7IC8vIG1vdmUgY29udGVudCB0byBmaXJzdCBwb3NpdGlvblxuXHRcdH1cblxuXHRcdHJldHVybiB7IHZhbHVlTGlzdEluZm8sIGNvbnRlbnQgfTtcblx0fSxcblxuXHRfcHJlcGFyZVZhbHVlSGVscERpYWxvZzogZnVuY3Rpb24gKFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRhaW5lcjogQ29udGFpbmVyLFxuXHRcdHZhbHVlTGlzdEluZm9zOiBWYWx1ZUxpc3RJbmZvW10sXG5cdFx0cGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCxcblx0XHRzZWxlY3RlZENvbnRlbnRJZDogc3RyaW5nLFxuXHRcdGNhc2VTZW5zaXRpdmU6IGJvb2xlYW5cblx0KSB7XG5cdFx0Y29uc3Qgc2hvd0NvbmRpdGlvblBhbmVsID0gdmFsdWVIZWxwLmRhdGEoXCJzaG93Q29uZGl0aW9uUGFuZWxcIikgJiYgdmFsdWVIZWxwLmRhdGEoXCJzaG93Q29uZGl0aW9uUGFuZWxcIikgIT09IFwiZmFsc2VcIjtcblx0XHRjb25zdCBjb250ZW50TGlzdCA9IGNvbnRhaW5lci5nZXRDb250ZW50KCk7XG5cblx0XHQvLyBzZXQgYWxsIGNvbnRlbnRzIHRvIGludmlzaWJsZVxuXHRcdGZvciAoY29uc3QgY29udGVudExpc3RJdGVtIG9mIGNvbnRlbnRMaXN0KSB7XG5cdFx0XHRjb250ZW50TGlzdEl0ZW0uc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0fVxuXG5cdFx0aWYgKHNob3dDb25kaXRpb25QYW5lbCkge1xuXHRcdFx0dGhpcy5fc2hvd0NvbmRpdGlvbnNDb250ZW50KGNvbnRlbnRMaXN0LCBjb250YWluZXIpO1xuXHRcdH1cblxuXHRcdGxldCBzZWxlY3RlZEluZm86IFZhbHVlTGlzdEluZm8gfCB1bmRlZmluZWQsIHNlbGVjdGVkQ29udGVudDogTURDVGFibGUgfCB1bmRlZmluZWQ7XG5cblx0XHQvLyBDcmVhdGUgb3IgcmV1c2UgY29udGVudHMgZm9yIHRoZSBjdXJyZW50IGNvbnRleHRcblx0XHRmb3IgKGNvbnN0IHZhbHVlTGlzdEluZm8gb2YgdmFsdWVMaXN0SW5mb3MpIHtcblx0XHRcdGNvbnN0IHZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX2FkZEluT3V0UGFyYW1ldGVyc1RvUGF5bG9hZChwYXlsb2FkLCB2YWx1ZUxpc3RJbmZvKTtcblxuXHRcdFx0Y29uc3QgY29udGVudElkID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50SWQodmFsdWVIZWxwLmdldElkKCksIHZhbHVlSGVscFF1YWxpZmllciwgZmFsc2UpO1xuXG5cdFx0XHRjb25zdCBjb250ZW50ID0gdGhpcy5fYWxpZ25PckNyZWF0ZUNvbnRlbnQodmFsdWVMaXN0SW5mbywgY29udGVudElkLCBjYXNlU2Vuc2l0aXZlLCBzaG93Q29uZGl0aW9uUGFuZWwsIGNvbnRhaW5lcik7XG5cblx0XHRcdGlmICh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uTGFiZWwpIHtcblx0XHRcdFx0Y29uc3QgdGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5MYWJlbCwgdmFsdWVIZWxwLmdldENvbnRyb2woKSk7XG5cdFx0XHRcdGNvbnRlbnQuc2V0VGl0bGUodGl0bGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXNlbGVjdGVkQ29udGVudCB8fCAoc2VsZWN0ZWRDb250ZW50SWQgJiYgc2VsZWN0ZWRDb250ZW50SWQgPT09IGNvbnRlbnRJZCkpIHtcblx0XHRcdFx0c2VsZWN0ZWRDb250ZW50ID0gY29udGVudDtcblx0XHRcdFx0c2VsZWN0ZWRJbmZvID0gdmFsdWVMaXN0SW5mbztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXNlbGVjdGVkSW5mbyB8fCAhc2VsZWN0ZWRDb250ZW50KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RlZEluZm8gb3Igc2VsZWN0ZWRDb250ZW50IHVuZGVmaW5lZFwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBzZWxlY3RlZEluZm8sIHNlbGVjdGVkQ29udGVudCB9O1xuXHR9LFxuXG5cdHNob3dWYWx1ZUxpc3Q6IGFzeW5jIGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250YWluZXI6IENvbnRhaW5lciwgc2VsZWN0ZWRDb250ZW50SWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHZhbHVlSGVscCA9IGNvbnRhaW5lci5nZXRQYXJlbnQoKSBhcyBWYWx1ZUhlbHAsXG5cdFx0XHRpc1R5cGVhaGVhZCA9IGNvbnRhaW5lci5pc1R5cGVhaGVhZCgpLFxuXHRcdFx0cHJvcGVydHlQYXRoID0gcGF5bG9hZC5wcm9wZXJ0eVBhdGgsXG5cdFx0XHRtZXRhTW9kZWwgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHZoVUlNb2RlbCA9ICh2YWx1ZUhlbHAuZ2V0TW9kZWwoXCJfVkhVSVwiKSBhcyBKU09OTW9kZWwpIHx8IFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWSFVJTW9kZWwodmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCk7XG5cblx0XHRpZiAoIXBheWxvYWQucXVhbGlmaWVycykge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzID0ge307XG5cdFx0fVxuXG5cdFx0dmhVSU1vZGVsLnNldFByb3BlcnR5KFwiL2lzU3VnZ2VzdGlvblwiLCBpc1R5cGVhaGVhZCk7XG5cdFx0dmhVSU1vZGVsLnNldFByb3BlcnR5KFwiL21pblNjcmVlbldpZHRoXCIsICFpc1R5cGVhaGVhZCA/IFwiNDE4cHhcIiA6IHVuZGVmaW5lZCk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdmFsdWVMaXN0SW5mb3MgPSBhd2FpdCBWYWx1ZUxpc3RIZWxwZXIuZ2V0VmFsdWVMaXN0SW5mbyh2YWx1ZUhlbHAsIHByb3BlcnR5UGF0aCwgcGF5bG9hZCk7XG5cdFx0XHRjb25zdCBmaXJzdFR5cGVBaGVhZENvbnRlbnQgPSB2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkuZ2V0Q29udGVudCgpWzBdIGFzIE1UYWJsZSxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZSA9IGZpcnN0VHlwZUFoZWFkQ29udGVudC5nZXRDYXNlU2Vuc2l0aXZlKCk7IC8vIHRha2UgY2FzZVNlbnNpdGl2ZSBmcm9tIGZpcnN0IFR5cGVhaGVhZCBjb250ZW50XG5cblx0XHRcdGlmIChpc1R5cGVhaGVhZCkge1xuXHRcdFx0XHRjb25zdCB7IHZhbHVlTGlzdEluZm8sIGNvbnRlbnQgfSA9IFZhbHVlTGlzdEhlbHBlci5fcHJlcGFyZVZhbHVlSGVscFR5cGVBaGVhZChcblx0XHRcdFx0XHR2YWx1ZUhlbHAsXG5cdFx0XHRcdFx0Y29udGFpbmVyLFxuXHRcdFx0XHRcdHZhbHVlTGlzdEluZm9zLFxuXHRcdFx0XHRcdHBheWxvYWQsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZSxcblx0XHRcdFx0XHRmaXJzdFR5cGVBaGVhZENvbnRlbnRcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0XHRcdGlmIChjb250ZW50LmdldFRhYmxlKCkgPT09IHVuZGVmaW5lZCB8fCBjb250ZW50LmdldFRhYmxlKCkgPT09IG51bGwpIHtcblx0XHRcdFx0XHRhd2FpdCBWYWx1ZUxpc3RIZWxwZXIuX2NyZWF0ZVZhbHVlSGVscFR5cGVhaGVhZChwcm9wZXJ0eVBhdGgsIHZhbHVlSGVscCwgY29udGVudCwgdmFsdWVMaXN0SW5mbywgcGF5bG9hZCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHsgc2VsZWN0ZWRJbmZvLCBzZWxlY3RlZENvbnRlbnQgfSA9IFZhbHVlTGlzdEhlbHBlci5fcHJlcGFyZVZhbHVlSGVscERpYWxvZyhcblx0XHRcdFx0XHR2YWx1ZUhlbHAsXG5cdFx0XHRcdFx0Y29udGFpbmVyLFxuXHRcdFx0XHRcdHZhbHVlTGlzdEluZm9zLFxuXHRcdFx0XHRcdHBheWxvYWQsXG5cdFx0XHRcdFx0c2VsZWN0ZWRDb250ZW50SWQsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdHBheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyID0gc2VsZWN0ZWRJbmZvLnZhbHVlSGVscFF1YWxpZmllcjtcblx0XHRcdFx0LyogRm9yIGNvbnRleHQgZGVwZW50ZW50IHZhbHVlIGhlbHBzIHRoZSB2YWx1ZSBsaXN0IGxhYmVsIGlzIHVzZWQgZm9yIHRoZSBkaWFsb2cgdGl0bGUgKi9cblx0XHRcdFx0Y29uc3QgdGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKFxuXHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fZ2V0RGlhbG9nVGl0bGUodmFsdWVIZWxwLCBzZWxlY3RlZEluZm8udmFsdWVMaXN0SW5mbz8uTGFiZWwpLFxuXHRcdFx0XHRcdHZhbHVlSGVscC5nZXRDb250cm9sKClcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29udGFpbmVyLnNldFRpdGxlKHRpdGxlKTtcblxuXHRcdFx0XHRpZiAoc2VsZWN0ZWRDb250ZW50LmdldFRhYmxlKCkgPT09IHVuZGVmaW5lZCB8fCBzZWxlY3RlZENvbnRlbnQuZ2V0VGFibGUoKSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGF3YWl0IFZhbHVlTGlzdEhlbHBlci5fY3JlYXRlVmFsdWVIZWxwRGlhbG9nKHByb3BlcnR5UGF0aCwgdmFsdWVIZWxwLCBzZWxlY3RlZENvbnRlbnQsIHNlbGVjdGVkSW5mbywgcGF5bG9hZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuX2xvZ0Vycm9yKHByb3BlcnR5UGF0aCwgZXJyKTtcblxuXHRcdFx0VmFsdWVMaXN0SGVscGVyLmRlc3Ryb3lWSENvbnRlbnQodmFsdWVIZWxwKTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZhbHVlTGlzdEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUFzRUEsTUFBTUEsdUJBQXVCLEdBQUcsQ0FBQ0MsVUFBdUIsRUFBRUMsS0FBYSxLQUFjLENBQUNELFVBQVUsQ0FBQ0Us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