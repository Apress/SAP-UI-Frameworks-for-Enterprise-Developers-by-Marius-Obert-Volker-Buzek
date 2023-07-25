/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/ui/mdc/FilterBarDelegate", "sap/ui/model/json/JSONModel"], function (Log, mergeObjects, CommonUtils, FilterBar, MetaModelFunction, ModelHelper, ResourceModelHelper, StableIdHelper, TemplateModel, PropertyFormatters, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterUtils, FilterBarDelegate, JSONModel) {
  "use strict";

  var getModelType = EDM.getModelType;
  var hasValueHelp = PropertyFormatters.hasValueHelp;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var isPropertyFilterable = MetaModelFunction.isPropertyFilterable;
  var processSelectionFields = FilterBar.processSelectionFields;
  const ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  const EDIT_STATE_PROPERTY_NAME = "$editState",
    SEARCH_PROPERTY_NAME = "$search",
    VALUE_HELP_TYPE = "FilterFieldValueHelp",
    FETCHED_PROPERTIES_DATA_KEY = "sap_fe_FilterBarDelegate_propertyInfoMap",
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /[+*]/g;
  function _templateEditState(sIdPrefix, metaModel, oModifier) {
    const oThis = new JSONModel({
        id: sIdPrefix,
        isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
      }),
      oPreprocessorSettings = {
        bindingContexts: {
          this: oThis.createBindingContext("/")
        },
        models: {
          //"this.i18n": ResourceModel.getModel(), TODO: To be checked why this is needed, should not be needed at all
          this: oThis
        }
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.DraftEditState", oPreprocessorSettings, undefined, oModifier).finally(function () {
      oThis.destroy();
    });
  }
  ODataFilterBarDelegate._templateCustomFilter = async function (oFilterBar, sIdPrefix, oSelectionFieldInfo, oMetaModel, oModifier) {
    const sEntityTypePath = await DelegateUtil.getCustomData(oFilterBar, "entityType", oModifier);
    const oThis = new JSONModel({
        id: sIdPrefix
      }),
      oItemModel = new TemplateModel(oSelectionFieldInfo, oMetaModel),
      oPreprocessorSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          this: oThis.createBindingContext("/"),
          item: oItemModel.createBindingContext("/")
        },
        models: {
          contextPath: oMetaModel,
          this: oThis,
          item: oItemModel
        }
      },
      oView = CommonUtils.getTargetView(oFilterBar),
      oController = oView ? oView.getController() : undefined,
      oOptions = {
        controller: oController ? oController : undefined,
        view: oView
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.CustomFilter", oPreprocessorSettings, oOptions, oModifier).finally(function () {
      oThis.destroy();
      oItemModel.destroy();
    });
  };
  function _getPropertyPath(sConditionPath) {
    return sConditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
  }
  ODataFilterBarDelegate._findSelectionField = function (aSelectionFields, sFlexName) {
    return aSelectionFields.find(function (oSelectionField) {
      return (oSelectionField.conditionPath === sFlexName || oSelectionField.conditionPath.replaceAll(/\*/g, "") === sFlexName) && oSelectionField.availability !== "Hidden";
    });
  };
  function _generateIdPrefix(sFilterBarId, sControlType, sNavigationPrefix) {
    return sNavigationPrefix ? generate([sFilterBarId, sControlType, sNavigationPrefix]) : generate([sFilterBarId, sControlType]);
  }
  function _templateValueHelp(oSettings, oParameters) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sVhIdPrefix,
      conditionModel: "$filters",
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      filterFieldValueHelp: true,
      useSemanticDateRange: oParameters.bUseSemanticDateRange
    });
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/")
      },
      models: {
        this: oThis
      }
    });
    return Promise.resolve(DelegateUtil.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp", oPreprocessorSettings, {
      isXML: oSettings.isXML
    })).then(function (aVHElements) {
      if (aVHElements) {
        const sAggregationName = "dependents";
        //Some filter fields have the PersistenceProvider aggregation besides the FVH :
        if (aVHElements.length) {
          aVHElements.forEach(function (elt) {
            if (oParameters.oModifier) {
              oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, elt, 0);
            } else {
              oParameters.oControl.insertAggregation(sAggregationName, elt, 0, false);
            }
          });
        } else if (oParameters.oModifier) {
          oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, aVHElements, 0);
        } else {
          oParameters.oControl.insertAggregation(sAggregationName, aVHElements, 0, false);
        }
      }
    }).catch(function (oError) {
      Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addXMLCustomFilterField(oFilterBar, oModifier, sPropertyPath) {
    try {
      const aDependents = await Promise.resolve(oModifier.getAggregation(oFilterBar, "dependents"));
      let i;
      if (aDependents && aDependents.length > 1) {
        for (i = 0; i <= aDependents.length; i++) {
          const oFilterField = aDependents[i];
          if (oFilterField && oFilterField.isA("sap.ui.mdc.FilterField")) {
            const sDataProperty = oFilterField.getFieldPath(),
              sFilterFieldId = oFilterField.getId();
            if (sPropertyPath === sDataProperty && sFilterFieldId.indexOf("CustomFilterField")) {
              return Promise.resolve(oFilterField);
            }
          }
        }
      }
    } catch (oError) {
      Log.error("Filter Cannot be added", oError);
    }
  }
  function _templateFilterField(oSettings, oParameters, pageModel) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sIdPrefix,
      vhIdPrefix: oParameters.sVhIdPrefix,
      propertyPath: oParameters.sPropertyName,
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      useSemanticDateRange: oParameters.bUseSemanticDateRange,
      settings: oParameters.oSettings,
      visualFilter: oParameters.visualFilter
    });
    const oMetaModel = oParameters.oMetaModel;
    const oVisualFilter = new TemplateModel(oParameters.visualFilter, oMetaModel);
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/"),
        visualFilter: oVisualFilter.createBindingContext("/")
      },
      models: {
        this: oThis,
        visualFilter: oVisualFilter,
        metaModel: oMetaModel,
        converterContext: pageModel
      }
    });
    return DelegateUtil.templateControlFragment("sap.fe.macros.internal.filterField.FilterFieldTemplate", oPreprocessorSettings, {
      isXML: oSettings.isXML
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName) {
    try {
      sPropertyInfoName = sPropertyInfoName.replace("*", "");
      const sPropertyInfoKey = generate([sPropertyInfoName]); //Making sure that navigation property names are generated properly e.g. _Item::Material
      if (mPropertyBag && !mPropertyBag.modifier) {
        throw "FilterBar Delegate method called without modifier.";
      }
      const delegate = await mPropertyBag.modifier.getProperty(oParentControl, "delegate");
      const aPropertyInfo = await mPropertyBag.modifier.getProperty(oParentControl, "propertyInfo");
      //We do not get propertyInfo in case of table filters
      if (aPropertyInfo) {
        const hasPropertyInfo = aPropertyInfo.some(function (prop) {
          return prop.key === sPropertyInfoKey || prop.name === sPropertyInfoKey;
        });
        if (!hasPropertyInfo) {
          const entityTypePath = delegate.payload.entityTypePath;
          const converterContext = FilterUtils.createConverterContext(oParentControl, entityTypePath, oMetaModel, mPropertyBag.appComponent);
          const entityType = converterContext.getEntityType();
          let filterField = FilterUtils.getFilterField(sPropertyInfoName, converterContext, entityType);
          filterField = FilterUtils.buildProperyInfo(filterField, converterContext);
          aPropertyInfo.push(filterField);
          mPropertyBag.modifier.setProperty(oParentControl, "propertyInfo", aPropertyInfo);
        }
      }
    } catch (errorMsg) {
      Log.warning(`${oParentControl.getId()} : ${errorMsg}`);
    }
  }

  /**
   * Method responsible for creating filter field in standalone mode / in the personalization settings of the filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as the filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of the property bag from Flex API
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate.addItem = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    if (!mPropertyBag) {
      // Invoked during runtime.
      return ODataFilterBarDelegate._addP13nItem(sPropertyInfoName, oParentControl);
    }
    const modifier = mPropertyBag.modifier;
    const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
    const oMetaModel = model && model.getMetaModel();
    if (!oMetaModel) {
      return Promise.resolve(null);
    }
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oMetaModel, modifier, mPropertyBag.appComponent);
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param oFilterFieldProperty Object of the filter field property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeItem = async function (oFilterFieldProperty, oParentControl, mPropertyBag) {
    let doRemoveItem = true;
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML && !oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.getFieldPath()) {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty.getFieldPath());
      } else {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty);
      }
    }
    if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.isA && oFilterFieldProperty.isA("sap.ui.mdc.FilterField")) {
      if (oFilterFieldProperty.data("isSlot") === "true" && mPropertyBag) {
        // Inserting into the modifier creates a change from flex also filter is been removed hence promise is resolved to false
        modifier.insertAggregation(oParentControl, "dependents", oFilterFieldProperty);
        doRemoveItem = false;
      }
    }
    return Promise.resolve(doRemoveItem);
  };

  /**
   * Method responsible for creating filter field condition in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.addCondition = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return Promise.resolve();
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeCondition = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const modifier = mPropertyBag.modifier;
      const isXML = modifier && modifier.targets === "xmlTree";
      if (isXML) {
        const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
        const oMetaModel = model && model.getMetaModel();
        if (!oMetaModel) {
          return Promise.resolve(null);
        }
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
      }
    }
    return Promise.resolve();
  };
  /**
   * Clears all input values of visible filter fields in the filter bar.
   *
   * @param oFilterControl Instance of the FilterBar control
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.clearFilters = async function (oFilterControl) {
    return FilterUtils.clearFilterValues(oFilterControl);
  };
  /**
   * Creates the filter field in the table adaptation of the FilterBar.
   *
   * @param sPropertyInfoName The property name of the entity type for which the filter field needs to be created
   * @param oParentControl Instance of the parent control
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate._addP13nItem = function (sPropertyInfoName, oParentControl) {
    return DelegateUtil.fetchModel(oParentControl).then(function (oModel) {
      return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oModel.getMetaModel(), undefined);
    }).catch(function (oError) {
      Log.error("Model could not be resolved", oError);
      return null;
    });
  };
  ODataFilterBarDelegate.fetchPropertiesForEntity = function (sEntityTypePath, oMetaModel, oFilterControl) {
    const oEntityType = oMetaModel.getObject(sEntityTypePath);
    const includeHidden = oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar") ? true : undefined;
    if (!oFilterControl || !oEntityType) {
      return [];
    }
    const oConverterContext = FilterUtils.createConverterContext(oFilterControl, sEntityTypePath);
    const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath);
    const mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath, includeHidden);
    let aFetchedProperties = [];
    mFilterFields.forEach(function (oFilterFieldInfo) {
      const sAnnotationPath = oFilterFieldInfo.annotationPath;
      if (sAnnotationPath) {
        var _entityType$annotatio, _entityType$annotatio2;
        const oPropertyAnnotations = oConverterContext.getConvertedTypes().resolvePath(sAnnotationPath).target;
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, sAnnotationPath);
        const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        const entityType = oConverterContext.getEntityType();
        const selectionFields = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.SelectionFields;
        if (ODataFilterBarDelegate._isFilterAdaptable(oFilterFieldInfo, oPropertyAnnotations, selectionFields) && isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          aFetchedProperties.push(oFilterFieldInfo);
        }
      } else {
        //Custom Filters
        aFetchedProperties.push(oFilterFieldInfo);
      }
    });
    const aParameterFields = [];
    const processedFields = processSelectionFields(aFetchedProperties, oConverterContext);
    const processedFieldsKeys = [];
    processedFields.forEach(function (oProps) {
      if (oProps.key) {
        processedFieldsKeys.push(oProps.key);
      }
    });
    aFetchedProperties = aFetchedProperties.filter(function (oProp) {
      return processedFieldsKeys.includes(oProp.key);
    });
    const oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
      mAllowedExpressions = oFR.FilterAllowedExpressions;
    //Object.keys(processedFields).forEach(function (sFilterFieldKey: string) {
    processedFields.forEach(function (oProp, iFilterFieldIndex) {
      const oSelField = aFetchedProperties[iFilterFieldIndex];
      if (!oSelField || !oSelField.conditionPath) {
        return;
      }
      const sPropertyPath = _getPropertyPath(oSelField.conditionPath);
      //fetchBasic
      oProp = Object.assign(oProp, {
        group: oSelField.group,
        groupLabel: oSelField.groupLabel,
        path: oSelField.conditionPath,
        tooltip: null,
        removeFromAppState: false,
        hasValueHelp: false
      });

      //fetchPropInfo
      if (oSelField.annotationPath) {
        const sAnnotationPath = oSelField.annotationPath;
        const oProperty = oMetaModel.getObject(sAnnotationPath),
          oPropertyAnnotations = oMetaModel.getObject(`${sAnnotationPath}@`),
          oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
        const bRemoveFromAppState = oPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || oPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || oPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"];
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oSelField.annotationPath);
        const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        let oFilterDefaultValueAnnotation;
        let oFilterDefaultValue;
        if (isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
          if (oFilterDefaultValueAnnotation) {
            oFilterDefaultValue = oFilterDefaultValueAnnotation[`$${getModelType(oProperty.$Type)}`];
          }
          oProp = Object.assign(oProp, {
            tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || undefined,
            removeFromAppState: bRemoveFromAppState,
            hasValueHelp: hasValueHelp(oPropertyContext.getObject(), {
              context: oPropertyContext
            }),
            defaultFilterConditions: oFilterDefaultValue ? [{
              fieldPath: oSelField.conditionPath,
              operator: "EQ",
              values: [oFilterDefaultValue]
            }] : undefined
          });
        }
      }

      //base

      if (oProp) {
        if (mAllowedExpressions[sPropertyPath] && mAllowedExpressions[sPropertyPath].length > 0) {
          oProp.filterExpression = CommonUtils.getSpecificAllowedExpression(mAllowedExpressions[sPropertyPath]);
        } else {
          oProp.filterExpression = "auto";
        }
        oProp = Object.assign(oProp, {
          visible: oSelField.availability === "Default"
        });
      }
      processedFields[iFilterFieldIndex] = oProp;
    });
    processedFields.forEach(function (propInfo) {
      if (propInfo.path === "$editState") {
        propInfo.label = getResourceModel(oFilterControl).getText("FILTERBAR_EDITING_STATUS");
      }
      propInfo.typeConfig = TypeUtil.getTypeConfig(propInfo.dataType, propInfo.formatOptions, propInfo.constraints);
      propInfo.label = getLocalizedText(propInfo.label, oFilterControl) || "";
      if (propInfo.isParameter) {
        aParameterFields.push(propInfo.name);
      }
    });
    aFetchedProperties = processedFields;
    DelegateUtil.setCustomData(oFilterControl, "parameters", aParameterFields);
    return aFetchedProperties;
  };
  function getLineItemQualifierFromTable(oControl, oMetaModel) {
    var _oMetaModel$getObject;
    if (oControl.isA("sap.fe.macros.table.TableAPI")) {
      const annotationPaths = oControl.getMetaPath().split("#")[0].split("/");
      switch (annotationPaths[annotationPaths.length - 1]) {
        case `@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`:
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          return (_oMetaModel$getObject = oMetaModel.getObject(oControl.getMetaPath()).Visualizations) === null || _oMetaModel$getObject === void 0 ? void 0 : _oMetaModel$getObject.find(visualization => visualization.$AnnotationPath.includes(`@${"com.sap.vocabularies.UI.v1.LineItem"}`)).$AnnotationPath;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          const metaPaths = oControl.getMetaPath().split("/");
          return metaPaths[metaPaths.length - 1];
      }
    }
    return undefined;
  }
  ODataFilterBarDelegate._isFilterAdaptable = function (filterFieldInfo, propertyAnnotations, selectionFields) {
    var _propertyAnnotations$, _propertyAnnotations$2;
    const isSelectionField = selectionFields === null || selectionFields === void 0 ? void 0 : selectionFields.some(function (selectionField) {
      if (selectionField.value === filterFieldInfo.key) {
        return true;
      }
      return false;
    });
    return isSelectionField || !((_propertyAnnotations$ = propertyAnnotations.annotations) !== null && _propertyAnnotations$ !== void 0 && (_propertyAnnotations$2 = _propertyAnnotations$.UI) !== null && _propertyAnnotations$2 !== void 0 && _propertyAnnotations$2.AdaptationHidden);
  };
  ODataFilterBarDelegate._addFlexItem = function (sFlexPropertyName, oParentControl, oMetaModel, oModifier, oAppComponent) {
    const sFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId(),
      sIdPrefix = oModifier ? "" : "Adaptation",
      aSelectionFields = FilterUtils.getConvertedFilterFields(oParentControl, null, undefined, oMetaModel, oAppComponent, oModifier, oModifier ? undefined : getLineItemQualifierFromTable(oParentControl.getParent(), oMetaModel)),
      oSelectionField = ODataFilterBarDelegate._findSelectionField(aSelectionFields, sFlexPropertyName),
      sPropertyPath = _getPropertyPath(sFlexPropertyName),
      bIsXML = !!oModifier && oModifier.targets === "xmlTree";
    if (sFlexPropertyName === EDIT_STATE_PROPERTY_NAME) {
      return _templateEditState(_generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oMetaModel, oModifier);
    } else if (sFlexPropertyName === SEARCH_PROPERTY_NAME) {
      return Promise.resolve(null);
    } else if (oSelectionField && oSelectionField.template) {
      return ODataFilterBarDelegate._templateCustomFilter(oParentControl, _generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oSelectionField, oMetaModel, oModifier);
    }
    if (oSelectionField.type === "Slot" && oModifier) {
      return _addXMLCustomFilterField(oParentControl, oModifier, sPropertyPath);
    }
    const sNavigationPath = CommonHelper.getNavigationPath(sPropertyPath);
    const sAnnotationPath = oSelectionField.annotationPath;
    let sEntityTypePath;
    let sUseSemanticDateRange;
    let oSettings;
    let sBindingPath;
    let oParameters;
    return Promise.resolve().then(function () {
      if (oSelectionField.isParameter) {
        return sAnnotationPath.substr(0, sAnnotationPath.lastIndexOf("/") + 1);
      }
      return DelegateUtil.getCustomData(oParentControl, "entityType", oModifier);
    }).then(function (sRetrievedEntityTypePath) {
      sEntityTypePath = sRetrievedEntityTypePath;
      return DelegateUtil.getCustomData(oParentControl, "useSemanticDateRange", oModifier);
    }).then(function (sRetrievedUseSemanticDateRange) {
      sUseSemanticDateRange = sRetrievedUseSemanticDateRange;
      const oPropertyContext = oMetaModel.createBindingContext(sEntityTypePath + sPropertyPath);
      const sInFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId();
      oSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          property: oPropertyContext
        },
        models: {
          contextPath: oMetaModel,
          property: oMetaModel
        },
        isXML: bIsXML
      };
      sBindingPath = `/${ModelHelper.getEntitySetPath(sEntityTypePath).split("/").filter(ModelHelper.filterOutNavPropBinding).join("/")}`;
      oParameters = {
        sPropertyName: sPropertyPath,
        sBindingPath: sBindingPath,
        sValueHelpType: sIdPrefix + VALUE_HELP_TYPE,
        oControl: oParentControl,
        oMetaModel: oMetaModel,
        oModifier: oModifier,
        sIdPrefix: _generateIdPrefix(sInFilterBarId, `${sIdPrefix}FilterField`, sNavigationPath),
        sVhIdPrefix: _generateIdPrefix(sInFilterBarId, sIdPrefix + VALUE_HELP_TYPE),
        sNavigationPrefix: sNavigationPath,
        bUseSemanticDateRange: sUseSemanticDateRange,
        oSettings: oSelectionField ? oSelectionField.settings : {},
        visualFilter: oSelectionField ? oSelectionField.visualFilter : undefined
      };
      return DelegateUtil.doesValueHelpExist(oParameters);
    }).then(function (bValueHelpExists) {
      if (!bValueHelpExists) {
        return _templateValueHelp(oSettings, oParameters);
      }
      return Promise.resolve();
    }).then(function () {
      let pageModel;
      if (oParameters.visualFilter) {
        //Need to set the convertercontext as pageModel in settings for BuildingBlock 2.0
        pageModel = CommonUtils.getTargetView(oParentControl).getController()._getPageModel();
      }
      return _templateFilterField(oSettings, oParameters, pageModel);
    });
  };
  function _getCachedProperties(oFilterBar) {
    // properties are not cached during templating
    if (oFilterBar instanceof window.Element) {
      return null;
    }
    return DelegateUtil.getCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY);
  }
  function _setCachedProperties(oFilterBar, aFetchedProperties) {
    // do not cache during templating, else it becomes part of the cached view
    if (oFilterBar instanceof window.Element) {
      return;
    }
    DelegateUtil.setCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
  }
  function _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar) {
    let aFetchedProperties = _getCachedProperties(oFilterBar);
    let localGroupLabel;
    if (!aFetchedProperties) {
      aFetchedProperties = ODataFilterBarDelegate.fetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar);
      aFetchedProperties.forEach(function (oGroup) {
        localGroupLabel = null;
        if (oGroup.groupLabel) {
          localGroupLabel = getLocalizedText(oGroup.groupLabel, oFilterBar);
          oGroup.groupLabel = localGroupLabel === null ? oGroup.groupLabel : localGroupLabel;
        }
      });
      aFetchedProperties.sort(function (a, b) {
        if (a.groupLabel === undefined || a.groupLabel === null) {
          return -1;
        }
        if (b.groupLabel === undefined || b.groupLabel === null) {
          return 1;
        }
        return a.groupLabel.localeCompare(b.groupLabel);
      });
      _setCachedProperties(oFilterBar, aFetchedProperties);
    }
    return aFetchedProperties;
  }
  ODataFilterBarDelegate.fetchProperties = function (oFilterBar) {
    const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
    return DelegateUtil.fetchModel(oFilterBar).then(function (oModel) {
      if (!oModel) {
        return [];
      }
      return _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oModel.getMetaModel(), oFilterBar);
      // var aCleanedProperties = aProperties.concat();
      // var aAllowedAttributes = ["name", "label", "visible", "path", "typeConfig", "maxConditions", "group", "groupLabel"];
      // aCleanedProperties.forEach(function(oProperty) {
      // 	Object.keys(oProperty).forEach(function(sPropName) {
      // 		if (aAllowedAttributes.indexOf(sPropName) === -1) {
      // 			delete oProperty[sPropName];
      // 		}
      // 	});
      // });
      // return aCleanedProperties;
    });
  };

  ODataFilterBarDelegate.getTypeUtil = function () {
    return TypeUtil;
  };
  return ODataFilterBarDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YUZpbHRlckJhckRlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJFRElUX1NUQVRFX1BST1BFUlRZX05BTUUiLCJTRUFSQ0hfUFJPUEVSVFlfTkFNRSIsIlZBTFVFX0hFTFBfVFlQRSIsIkZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSIsIkNPTkRJVElPTl9QQVRIX1RPX1BST1BFUlRZX1BBVEhfUkVHRVgiLCJfdGVtcGxhdGVFZGl0U3RhdGUiLCJzSWRQcmVmaXgiLCJtZXRhTW9kZWwiLCJvTW9kaWZpZXIiLCJvVGhpcyIsIkpTT05Nb2RlbCIsImlkIiwiaXNEcmFmdENvbGxhYm9yYXRpdmUiLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwib1ByZXByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwidGhpcyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibW9kZWxzIiwiRGVsZWdhdGVVdGlsIiwidGVtcGxhdGVDb250cm9sRnJhZ21lbnQiLCJ1bmRlZmluZWQiLCJmaW5hbGx5IiwiZGVzdHJveSIsIl90ZW1wbGF0ZUN1c3RvbUZpbHRlciIsIm9GaWx0ZXJCYXIiLCJvU2VsZWN0aW9uRmllbGRJbmZvIiwib01ldGFNb2RlbCIsInNFbnRpdHlUeXBlUGF0aCIsImdldEN1c3RvbURhdGEiLCJvSXRlbU1vZGVsIiwiVGVtcGxhdGVNb2RlbCIsImNvbnRleHRQYXRoIiwiaXRlbSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwib09wdGlvbnMiLCJjb250cm9sbGVyIiwidmlldyIsIl9nZXRQcm9wZXJ0eVBhdGgiLCJzQ29uZGl0aW9uUGF0aCIsInJlcGxhY2UiLCJfZmluZFNlbGVjdGlvbkZpZWxkIiwiYVNlbGVjdGlvbkZpZWxkcyIsInNGbGV4TmFtZSIsImZpbmQiLCJvU2VsZWN0aW9uRmllbGQiLCJjb25kaXRpb25QYXRoIiwicmVwbGFjZUFsbCIsImF2YWlsYWJpbGl0eSIsIl9nZW5lcmF0ZUlkUHJlZml4Iiwic0ZpbHRlckJhcklkIiwic0NvbnRyb2xUeXBlIiwic05hdmlnYXRpb25QcmVmaXgiLCJnZW5lcmF0ZSIsIl90ZW1wbGF0ZVZhbHVlSGVscCIsIm9TZXR0aW5ncyIsIm9QYXJhbWV0ZXJzIiwiaWRQcmVmaXgiLCJzVmhJZFByZWZpeCIsImNvbmRpdGlvbk1vZGVsIiwibmF2aWdhdGlvblByZWZpeCIsImZpbHRlckZpZWxkVmFsdWVIZWxwIiwidXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJtZXJnZU9iamVjdHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImlzWE1MIiwidGhlbiIsImFWSEVsZW1lbnRzIiwic0FnZ3JlZ2F0aW9uTmFtZSIsImxlbmd0aCIsImZvckVhY2giLCJlbHQiLCJpbnNlcnRBZ2dyZWdhdGlvbiIsIm9Db250cm9sIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIl9hZGRYTUxDdXN0b21GaWx0ZXJGaWVsZCIsInNQcm9wZXJ0eVBhdGgiLCJhRGVwZW5kZW50cyIsImdldEFnZ3JlZ2F0aW9uIiwiaSIsIm9GaWx0ZXJGaWVsZCIsImlzQSIsInNEYXRhUHJvcGVydHkiLCJnZXRGaWVsZFBhdGgiLCJzRmlsdGVyRmllbGRJZCIsImdldElkIiwiaW5kZXhPZiIsIl90ZW1wbGF0ZUZpbHRlckZpZWxkIiwicGFnZU1vZGVsIiwidmhJZFByZWZpeCIsInByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eU5hbWUiLCJzZXR0aW5ncyIsInZpc3VhbEZpbHRlciIsIm9WaXN1YWxGaWx0ZXIiLCJjb252ZXJ0ZXJDb250ZXh0IiwiX2FkZFByb3BlcnR5SW5mbyIsIm9QYXJlbnRDb250cm9sIiwibVByb3BlcnR5QmFnIiwic1Byb3BlcnR5SW5mb05hbWUiLCJzUHJvcGVydHlJbmZvS2V5IiwibW9kaWZpZXIiLCJkZWxlZ2F0ZSIsImdldFByb3BlcnR5IiwiYVByb3BlcnR5SW5mbyIsImhhc1Byb3BlcnR5SW5mbyIsInNvbWUiLCJwcm9wIiwia2V5IiwibmFtZSIsImVudGl0eVR5cGVQYXRoIiwicGF5bG9hZCIsIkZpbHRlclV0aWxzIiwiY3JlYXRlQ29udmVydGVyQ29udGV4dCIsImFwcENvbXBvbmVudCIsImVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwiZmlsdGVyRmllbGQiLCJnZXRGaWx0ZXJGaWVsZCIsImJ1aWxkUHJvcGVyeUluZm8iLCJwdXNoIiwic2V0UHJvcGVydHkiLCJlcnJvck1zZyIsIndhcm5pbmciLCJhZGRJdGVtIiwiX2FkZFAxM25JdGVtIiwibW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsInRhcmdldHMiLCJfYWRkRmxleEl0ZW0iLCJyZW1vdmVJdGVtIiwib0ZpbHRlckZpZWxkUHJvcGVydHkiLCJkb1JlbW92ZUl0ZW0iLCJkYXRhIiwiYWRkQ29uZGl0aW9uIiwicmVtb3ZlQ29uZGl0aW9uIiwiY2xlYXJGaWx0ZXJzIiwib0ZpbHRlckNvbnRyb2wiLCJjbGVhckZpbHRlclZhbHVlcyIsImZldGNoTW9kZWwiLCJvTW9kZWwiLCJmZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJvRW50aXR5VHlwZSIsImdldE9iamVjdCIsImluY2x1ZGVIaWRkZW4iLCJvQ29udmVydGVyQ29udGV4dCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0RW50aXR5U2V0UGF0aCIsIm1GaWx0ZXJGaWVsZHMiLCJnZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMiLCJhRmV0Y2hlZFByb3BlcnRpZXMiLCJvRmlsdGVyRmllbGRJbmZvIiwic0Fubm90YXRpb25QYXRoIiwiYW5ub3RhdGlvblBhdGgiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsImdldENvbnZlcnRlZFR5cGVzIiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJzVGFyZ2V0UHJvcGVydHlQcmVmaXgiLCJDb21tb25IZWxwZXIiLCJnZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eSIsInNlbGVjdGlvbkZpZWxkcyIsImFubm90YXRpb25zIiwiVUkiLCJTZWxlY3Rpb25GaWVsZHMiLCJfaXNGaWx0ZXJBZGFwdGFibGUiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsImFQYXJhbWV0ZXJGaWVsZHMiLCJwcm9jZXNzZWRGaWVsZHMiLCJwcm9jZXNzU2VsZWN0aW9uRmllbGRzIiwicHJvY2Vzc2VkRmllbGRzS2V5cyIsIm9Qcm9wcyIsImZpbHRlciIsIm9Qcm9wIiwiaW5jbHVkZXMiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJtQWxsb3dlZEV4cHJlc3Npb25zIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwiaUZpbHRlckZpZWxkSW5kZXgiLCJvU2VsRmllbGQiLCJncm91cCIsImdyb3VwTGFiZWwiLCJwYXRoIiwidG9vbHRpcCIsInJlbW92ZUZyb21BcHBTdGF0ZSIsImhhc1ZhbHVlSGVscCIsIm9Qcm9wZXJ0eSIsIm9Qcm9wZXJ0eUNvbnRleHQiLCJiUmVtb3ZlRnJvbUFwcFN0YXRlIiwib0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb24iLCJvRmlsdGVyRGVmYXVsdFZhbHVlIiwiZ2V0TW9kZWxUeXBlIiwiJFR5cGUiLCJjb250ZXh0IiwiZGVmYXVsdEZpbHRlckNvbmRpdGlvbnMiLCJmaWVsZFBhdGgiLCJvcGVyYXRvciIsInZhbHVlcyIsImZpbHRlckV4cHJlc3Npb24iLCJnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uIiwidmlzaWJsZSIsInByb3BJbmZvIiwibGFiZWwiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsInR5cGVDb25maWciLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJkYXRhVHlwZSIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsImdldExvY2FsaXplZFRleHQiLCJpc1BhcmFtZXRlciIsInNldEN1c3RvbURhdGEiLCJnZXRMaW5lSXRlbVF1YWxpZmllckZyb21UYWJsZSIsImFubm90YXRpb25QYXRocyIsImdldE1ldGFQYXRoIiwic3BsaXQiLCJWaXN1YWxpemF0aW9ucyIsInZpc3VhbGl6YXRpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJtZXRhUGF0aHMiLCJmaWx0ZXJGaWVsZEluZm8iLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiaXNTZWxlY3Rpb25GaWVsZCIsInNlbGVjdGlvbkZpZWxkIiwidmFsdWUiLCJBZGFwdGF0aW9uSGlkZGVuIiwic0ZsZXhQcm9wZXJ0eU5hbWUiLCJvQXBwQ29tcG9uZW50IiwiZ2V0UGFyZW50IiwiYklzWE1MIiwidGVtcGxhdGUiLCJ0eXBlIiwic05hdmlnYXRpb25QYXRoIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJzVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJzQmluZGluZ1BhdGgiLCJzdWJzdHIiLCJsYXN0SW5kZXhPZiIsInNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aCIsInNSZXRyaWV2ZWRVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNJbkZpbHRlckJhcklkIiwicHJvcGVydHkiLCJmaWx0ZXJPdXROYXZQcm9wQmluZGluZyIsImpvaW4iLCJzVmFsdWVIZWxwVHlwZSIsImRvZXNWYWx1ZUhlbHBFeGlzdCIsImJWYWx1ZUhlbHBFeGlzdHMiLCJfZ2V0UGFnZU1vZGVsIiwiX2dldENhY2hlZFByb3BlcnRpZXMiLCJ3aW5kb3ciLCJFbGVtZW50IiwiX3NldENhY2hlZFByb3BlcnRpZXMiLCJfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJsb2NhbEdyb3VwTGFiZWwiLCJvR3JvdXAiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwiZ2V0VHlwZVV0aWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhckRlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNlbGVjdGlvbkZpZWxkcywgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEZpbHRlckZpZWxkLCBwcm9jZXNzU2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGlzUHJvcGVydHlGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0TG9jYWxpemVkVGV4dCwgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgeyBoYXNWYWx1ZUhlbHAgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCB7IGdldE1vZGVsVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgRmlsdGVyQmFyRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgRmlsdGVyQmFyRGVsZWdhdGUpIGFzIGFueTtcbmNvbnN0IEVESVRfU1RBVEVfUFJPUEVSVFlfTkFNRSA9IFwiJGVkaXRTdGF0ZVwiLFxuXHRTRUFSQ0hfUFJPUEVSVFlfTkFNRSA9IFwiJHNlYXJjaFwiLFxuXHRWQUxVRV9IRUxQX1RZUEUgPSBcIkZpbHRlckZpZWxkVmFsdWVIZWxwXCIsXG5cdEZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSA9IFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiLFxuXHRDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYID0gL1srKl0vZztcblxuZnVuY3Rpb24gX3RlbXBsYXRlRWRpdFN0YXRlKHNJZFByZWZpeDogYW55LCBtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBvTW9kaWZpZXI6IGFueSkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0aWQ6IHNJZFByZWZpeCxcblx0XHRcdGlzRHJhZnRDb2xsYWJvcmF0aXZlOiBNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChtZXRhTW9kZWwpXG5cdFx0fSksXG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0fSxcblx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHQvL1widGhpcy5pMThuXCI6IFJlc291cmNlTW9kZWwuZ2V0TW9kZWwoKSwgVE9ETzogVG8gYmUgY2hlY2tlZCB3aHkgdGhpcyBpcyBuZWVkZWQsIHNob3VsZCBub3QgYmUgbmVlZGVkIGF0IGFsbFxuXHRcdFx0XHR0aGlzOiBvVGhpc1xuXHRcdFx0fVxuXHRcdH07XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuZmlsdGVyLkRyYWZ0RWRpdFN0YXRlXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgdW5kZWZpbmVkLCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdH1cblx0KTtcbn1cblxuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fdGVtcGxhdGVDdXN0b21GaWx0ZXIgPSBhc3luYyBmdW5jdGlvbiAoXG5cdG9GaWx0ZXJCYXI6IGFueSxcblx0c0lkUHJlZml4OiBhbnksXG5cdG9TZWxlY3Rpb25GaWVsZEluZm86IGFueSxcblx0b01ldGFNb2RlbDogYW55LFxuXHRvTW9kaWZpZXI6IGFueVxuKSB7XG5cdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0aWQ6IHNJZFByZWZpeFxuXHRcdH0pLFxuXHRcdG9JdGVtTW9kZWwgPSBuZXcgVGVtcGxhdGVNb2RlbChvU2VsZWN0aW9uRmllbGRJbmZvLCBvTWV0YU1vZGVsKSxcblx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRpdGVtOiBvSXRlbU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0fSxcblx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdGl0ZW06IG9JdGVtTW9kZWxcblx0XHRcdH1cblx0XHR9LFxuXHRcdG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvRmlsdGVyQmFyKSxcblx0XHRvQ29udHJvbGxlciA9IG9WaWV3ID8gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIDogdW5kZWZpbmVkLFxuXHRcdG9PcHRpb25zID0ge1xuXHRcdFx0Y29udHJvbGxlcjogb0NvbnRyb2xsZXIgPyBvQ29udHJvbGxlciA6IHVuZGVmaW5lZCxcblx0XHRcdHZpZXc6IG9WaWV3XG5cdFx0fTtcblxuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFwic2FwLmZlLm1hY3Jvcy5maWx0ZXIuQ3VzdG9tRmlsdGVyXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgb09wdGlvbnMsIG9Nb2RpZmllcikuZmluYWxseShcblx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdFx0XHRvSXRlbU1vZGVsLmRlc3Ryb3koKTtcblx0XHR9XG5cdCk7XG59O1xuZnVuY3Rpb24gX2dldFByb3BlcnR5UGF0aChzQ29uZGl0aW9uUGF0aDogYW55KSB7XG5cdHJldHVybiBzQ29uZGl0aW9uUGF0aC5yZXBsYWNlKENPTkRJVElPTl9QQVRIX1RPX1BST1BFUlRZX1BBVEhfUkVHRVgsIFwiXCIpO1xufVxuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fZmluZFNlbGVjdGlvbkZpZWxkID0gZnVuY3Rpb24gKGFTZWxlY3Rpb25GaWVsZHM6IGFueSwgc0ZsZXhOYW1lOiBhbnkpIHtcblx0cmV0dXJuIGFTZWxlY3Rpb25GaWVsZHMuZmluZChmdW5jdGlvbiAob1NlbGVjdGlvbkZpZWxkOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9TZWxlY3Rpb25GaWVsZC5jb25kaXRpb25QYXRoID09PSBzRmxleE5hbWUgfHwgb1NlbGVjdGlvbkZpZWxkLmNvbmRpdGlvblBhdGgucmVwbGFjZUFsbCgvXFwqL2csIFwiXCIpID09PSBzRmxleE5hbWUpICYmXG5cdFx0XHRvU2VsZWN0aW9uRmllbGQuYXZhaWxhYmlsaXR5ICE9PSBcIkhpZGRlblwiXG5cdFx0KTtcblx0fSk7XG59O1xuZnVuY3Rpb24gX2dlbmVyYXRlSWRQcmVmaXgoc0ZpbHRlckJhcklkOiBhbnksIHNDb250cm9sVHlwZTogYW55LCBzTmF2aWdhdGlvblByZWZpeD86IGFueSkge1xuXHRyZXR1cm4gc05hdmlnYXRpb25QcmVmaXggPyBnZW5lcmF0ZShbc0ZpbHRlckJhcklkLCBzQ29udHJvbFR5cGUsIHNOYXZpZ2F0aW9uUHJlZml4XSkgOiBnZW5lcmF0ZShbc0ZpbHRlckJhcklkLCBzQ29udHJvbFR5cGVdKTtcbn1cbmZ1bmN0aW9uIF90ZW1wbGF0ZVZhbHVlSGVscChvU2V0dGluZ3M6IGFueSwgb1BhcmFtZXRlcnM6IGFueSkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdGlkUHJlZml4OiBvUGFyYW1ldGVycy5zVmhJZFByZWZpeCxcblx0XHRjb25kaXRpb25Nb2RlbDogXCIkZmlsdGVyc1wiLFxuXHRcdG5hdmlnYXRpb25QcmVmaXg6IG9QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4ID8gYC8ke29QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4fWAgOiBcIlwiLFxuXHRcdGZpbHRlckZpZWxkVmFsdWVIZWxwOiB0cnVlLFxuXHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiBvUGFyYW1ldGVycy5iVXNlU2VtYW50aWNEYXRlUmFuZ2Vcblx0fSk7XG5cdGNvbnN0IG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IG1lcmdlT2JqZWN0cyh7fSwgb1NldHRpbmdzLCB7XG5cdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9LFxuXHRcdG1vZGVsczoge1xuXHRcdFx0dGhpczogb1RoaXNcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoXG5cdFx0RGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVIZWxwXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywge1xuXHRcdFx0aXNYTUw6IG9TZXR0aW5ncy5pc1hNTFxuXHRcdH0pXG5cdClcblx0XHQudGhlbihmdW5jdGlvbiAoYVZIRWxlbWVudHM6IGFueSkge1xuXHRcdFx0aWYgKGFWSEVsZW1lbnRzKSB7XG5cdFx0XHRcdGNvbnN0IHNBZ2dyZWdhdGlvbk5hbWUgPSBcImRlcGVuZGVudHNcIjtcblx0XHRcdFx0Ly9Tb21lIGZpbHRlciBmaWVsZHMgaGF2ZSB0aGUgUGVyc2lzdGVuY2VQcm92aWRlciBhZ2dyZWdhdGlvbiBiZXNpZGVzIHRoZSBGVkggOlxuXHRcdFx0XHRpZiAoYVZIRWxlbWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YVZIRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvUGFyYW1ldGVycy5vTW9kaWZpZXIpIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBlbHQsIDApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgZWx0LCAwLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob1BhcmFtZXRlcnMub01vZGlmaWVyKSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBhVkhFbGVtZW50cywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgYVZIRWxlbWVudHMsIDAsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZXZhbHVhdGluZyBEZWxlZ2F0ZVV0aWwuaXNWYWx1ZUhlbHBSZXF1aXJlZFwiLCBvRXJyb3IpO1xuXHRcdH0pXG5cdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gX2FkZFhNTEN1c3RvbUZpbHRlckZpZWxkKG9GaWx0ZXJCYXI6IGFueSwgb01vZGlmaWVyOiBhbnksIHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHR0cnkge1xuXHRcdGNvbnN0IGFEZXBlbmRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG9Nb2RpZmllci5nZXRBZ2dyZWdhdGlvbihvRmlsdGVyQmFyLCBcImRlcGVuZGVudHNcIikpO1xuXHRcdGxldCBpO1xuXHRcdGlmIChhRGVwZW5kZW50cyAmJiBhRGVwZW5kZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDw9IGFEZXBlbmRlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9GaWx0ZXJGaWVsZCA9IGFEZXBlbmRlbnRzW2ldO1xuXHRcdFx0XHRpZiAob0ZpbHRlckZpZWxkICYmIG9GaWx0ZXJGaWVsZC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9GaWx0ZXJGaWVsZC5nZXRGaWVsZFBhdGgoKSxcblx0XHRcdFx0XHRcdHNGaWx0ZXJGaWVsZElkID0gb0ZpbHRlckZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0aWYgKHNQcm9wZXJ0eVBhdGggPT09IHNEYXRhUHJvcGVydHkgJiYgc0ZpbHRlckZpZWxkSWQuaW5kZXhPZihcIkN1c3RvbUZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9GaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdExvZy5lcnJvcihcIkZpbHRlciBDYW5ub3QgYmUgYWRkZWRcIiwgb0Vycm9yKTtcblx0fVxufVxuZnVuY3Rpb24gX3RlbXBsYXRlRmlsdGVyRmllbGQob1NldHRpbmdzOiBhbnksIG9QYXJhbWV0ZXJzOiBhbnksIHBhZ2VNb2RlbD86IEpTT05Nb2RlbCkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdGlkUHJlZml4OiBvUGFyYW1ldGVycy5zSWRQcmVmaXgsXG5cdFx0dmhJZFByZWZpeDogb1BhcmFtZXRlcnMuc1ZoSWRQcmVmaXgsXG5cdFx0cHJvcGVydHlQYXRoOiBvUGFyYW1ldGVycy5zUHJvcGVydHlOYW1lLFxuXHRcdG5hdmlnYXRpb25QcmVmaXg6IG9QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4ID8gYC8ke29QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4fWAgOiBcIlwiLFxuXHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiBvUGFyYW1ldGVycy5iVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0c2V0dGluZ3M6IG9QYXJhbWV0ZXJzLm9TZXR0aW5ncyxcblx0XHR2aXN1YWxGaWx0ZXI6IG9QYXJhbWV0ZXJzLnZpc3VhbEZpbHRlclxuXHR9KTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9QYXJhbWV0ZXJzLm9NZXRhTW9kZWw7XG5cdGNvbnN0IG9WaXN1YWxGaWx0ZXIgPSBuZXcgVGVtcGxhdGVNb2RlbChvUGFyYW1ldGVycy52aXN1YWxGaWx0ZXIsIG9NZXRhTW9kZWwpO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBtZXJnZU9iamVjdHMoe30sIG9TZXR0aW5ncywge1xuXHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0dmlzdWFsRmlsdGVyOiBvVmlzdWFsRmlsdGVyLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdH0sXG5cdFx0bW9kZWxzOiB7XG5cdFx0XHR0aGlzOiBvVGhpcyxcblx0XHRcdHZpc3VhbEZpbHRlcjogb1Zpc3VhbEZpbHRlcixcblx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IHBhZ2VNb2RlbFxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuZmlsdGVyRmllbGQuRmlsdGVyRmllbGRUZW1wbGF0ZVwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRpc1hNTDogb1NldHRpbmdzLmlzWE1MXG5cdH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2w6IEZpbHRlckJhciwgbVByb3BlcnR5QmFnOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZykge1xuXHR0cnkge1xuXHRcdHNQcm9wZXJ0eUluZm9OYW1lID0gc1Byb3BlcnR5SW5mb05hbWUucmVwbGFjZShcIipcIiwgXCJcIik7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5SW5mb0tleSA9IGdlbmVyYXRlKFtzUHJvcGVydHlJbmZvTmFtZV0pOyAvL01ha2luZyBzdXJlIHRoYXQgbmF2aWdhdGlvbiBwcm9wZXJ0eSBuYW1lcyBhcmUgZ2VuZXJhdGVkIHByb3Blcmx5IGUuZy4gX0l0ZW06Ok1hdGVyaWFsXG5cdFx0aWYgKG1Qcm9wZXJ0eUJhZyAmJiAhbVByb3BlcnR5QmFnLm1vZGlmaWVyKSB7XG5cdFx0XHR0aHJvdyBcIkZpbHRlckJhciBEZWxlZ2F0ZSBtZXRob2QgY2FsbGVkIHdpdGhvdXQgbW9kaWZpZXIuXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVsZWdhdGUgPSBhd2FpdCBtUHJvcGVydHlCYWcubW9kaWZpZXIuZ2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwiZGVsZWdhdGVcIik7XG5cdFx0Y29uc3QgYVByb3BlcnR5SW5mbyA9IGF3YWl0IG1Qcm9wZXJ0eUJhZy5tb2RpZmllci5nZXRQcm9wZXJ0eShvUGFyZW50Q29udHJvbCwgXCJwcm9wZXJ0eUluZm9cIik7XG5cdFx0Ly9XZSBkbyBub3QgZ2V0IHByb3BlcnR5SW5mbyBpbiBjYXNlIG9mIHRhYmxlIGZpbHRlcnNcblx0XHRpZiAoYVByb3BlcnR5SW5mbykge1xuXHRcdFx0Y29uc3QgaGFzUHJvcGVydHlJbmZvID0gYVByb3BlcnR5SW5mby5zb21lKGZ1bmN0aW9uIChwcm9wOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHByb3Aua2V5ID09PSBzUHJvcGVydHlJbmZvS2V5IHx8IHByb3AubmFtZSA9PT0gc1Byb3BlcnR5SW5mb0tleTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFoYXNQcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZVBhdGggPSBkZWxlZ2F0ZS5wYXlsb2FkLmVudGl0eVR5cGVQYXRoO1xuXHRcdFx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gRmlsdGVyVXRpbHMuY3JlYXRlQ29udmVydGVyQ29udGV4dChcblx0XHRcdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRlbnRpdHlUeXBlUGF0aCxcblx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnRcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdFx0XHRsZXQgZmlsdGVyRmllbGQgPSBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJGaWVsZChzUHJvcGVydHlJbmZvTmFtZSwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdFx0XHRcdGZpbHRlckZpZWxkID0gRmlsdGVyVXRpbHMuYnVpbGRQcm9wZXJ5SW5mbyhmaWx0ZXJGaWVsZCwgY29udmVydGVyQ29udGV4dCkgYXMgRmlsdGVyRmllbGQgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGFQcm9wZXJ0eUluZm8ucHVzaChmaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdG1Qcm9wZXJ0eUJhZy5tb2RpZmllci5zZXRQcm9wZXJ0eShvUGFyZW50Q29udHJvbCwgXCJwcm9wZXJ0eUluZm9cIiwgYVByb3BlcnR5SW5mbyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChlcnJvck1zZykge1xuXHRcdExvZy53YXJuaW5nKGAke29QYXJlbnRDb250cm9sLmdldElkKCl9IDogJHtlcnJvck1zZ31gKTtcblx0fVxufVxuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgbW9kZSAvIGluIHRoZSBwZXJzb25hbGl6YXRpb24gc2V0dGluZ3Mgb2YgdGhlIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGFkZGVkIGFzIHRoZSBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSB0byB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIGlzIGFkZGVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHRoZSBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgT25jZSByZXNvbHZlZCwgYSBmaWx0ZXIgZmllbGQgZGVmaW5pdGlvbiBpcyByZXR1cm5lZFxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmFkZEl0ZW0gPSBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IEZpbHRlckJhciwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0aWYgKCFtUHJvcGVydHlCYWcpIHtcblx0XHQvLyBJbnZva2VkIGR1cmluZyBydW50aW1lLlxuXHRcdHJldHVybiBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRQMTNuSXRlbShzUHJvcGVydHlJbmZvTmFtZSwgb1BhcmVudENvbnRyb2wpO1xuXHR9XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG1vZGVsICYmIG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG5cdGNvbnN0IGlzWE1MID0gbW9kaWZpZXIgJiYgbW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCI7XG5cdGlmIChpc1hNTCkge1xuXHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgc1Byb3BlcnR5SW5mb05hbWUpO1xuXHR9XG5cdHJldHVybiBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRGbGV4SXRlbShzUHJvcGVydHlJbmZvTmFtZSwgb1BhcmVudENvbnRyb2wsIG9NZXRhTW9kZWwsIG1vZGlmaWVyLCBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50KTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHJlc3BvbnNpYmxlIGZvciByZW1vdmluZyBmaWx0ZXIgZmllbGQgaW4gc3RhbmRhbG9uZSAvIHBlcnNvbmFsaXphdGlvbiBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBvRmlsdGVyRmllbGRQcm9wZXJ0eSBPYmplY3Qgb2YgdGhlIGZpbHRlciBmaWVsZCBwcm9wZXJ0eSBiZWluZyByZW1vdmVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIGZyb20gd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBpcyByZW1vdmVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIEZsZXggQVBJXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLnJlbW92ZUl0ZW0gPSBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckZpZWxkUHJvcGVydHk6IGFueSwgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0bGV0IGRvUmVtb3ZlSXRlbSA9IHRydWU7XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoaXNYTUwgJiYgIW9QYXJlbnRDb250cm9sLmRhdGEoXCJzYXBfZmVfRmlsdGVyQmFyRGVsZWdhdGVfcHJvcGVydHlJbmZvTWFwXCIpKSB7XG5cdFx0Y29uc3QgbW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG1vZGVsICYmIG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvRmlsdGVyRmllbGRQcm9wZXJ0eSAhPT0gXCJzdHJpbmdcIiAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSkge1xuXHRcdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgb0ZpbHRlckZpZWxkUHJvcGVydHkpO1xuXHRcdH1cblx0fVxuXHRpZiAodHlwZW9mIG9GaWx0ZXJGaWVsZFByb3BlcnR5ICE9PSBcInN0cmluZ1wiICYmIG9GaWx0ZXJGaWVsZFByb3BlcnR5LmlzQSAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0aWYgKG9GaWx0ZXJGaWVsZFByb3BlcnR5LmRhdGEoXCJpc1Nsb3RcIikgPT09IFwidHJ1ZVwiICYmIG1Qcm9wZXJ0eUJhZykge1xuXHRcdFx0Ly8gSW5zZXJ0aW5nIGludG8gdGhlIG1vZGlmaWVyIGNyZWF0ZXMgYSBjaGFuZ2UgZnJvbSBmbGV4IGFsc28gZmlsdGVyIGlzIGJlZW4gcmVtb3ZlZCBoZW5jZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGZhbHNlXG5cdFx0XHRtb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvUGFyZW50Q29udHJvbCwgXCJkZXBlbmRlbnRzXCIsIG9GaWx0ZXJGaWVsZFByb3BlcnR5KTtcblx0XHRcdGRvUmVtb3ZlSXRlbSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvUmVtb3ZlSXRlbSk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgZmlsdGVyIGZpZWxkIGNvbmRpdGlvbiBpbiBzdGFuZGFsb25lIC8gcGVyc29uYWxpemF0aW9uIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGFkZGVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIHRvIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgYWRkZWRcbiAqIEBwYXJhbSBtUHJvcGVydHlCYWcgSW5zdGFuY2Ugb2YgcHJvcGVydHkgYmFnIGZyb20gRmxleCBBUElcbiAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBwcm9taXNlXG4gKi9cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuYWRkQ29uZGl0aW9uID0gYXN5bmMgZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoaXNYTUwpIHtcblx0XHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gbW9kZWwgJiYgbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIHNQcm9wZXJ0eUluZm9OYW1lKTtcblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgcmVtb3ZpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgLyBwZXJzb25hbGl6YXRpb24gZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5SW5mb05hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHkgYmVpbmcgcmVtb3ZlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSBmcm9tIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgcmVtb3ZlZFxuICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHByb21pc2VcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5yZW1vdmVDb25kaXRpb24gPSBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0aWYgKCFvUGFyZW50Q29udHJvbC5kYXRhKFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiKSkge1xuXHRcdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRcdGNvbnN0IGlzWE1MID0gbW9kaWZpZXIgJiYgbW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCI7XG5cdFx0aWYgKGlzWE1MKSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtb2RlbCAmJiBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBzUHJvcGVydHlJbmZvTmFtZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn07XG4vKipcbiAqIENsZWFycyBhbGwgaW5wdXQgdmFsdWVzIG9mIHZpc2libGUgZmlsdGVyIGZpZWxkcyBpbiB0aGUgZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gb0ZpbHRlckNvbnRyb2wgSW5zdGFuY2Ugb2YgdGhlIEZpbHRlckJhciBjb250cm9sXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmNsZWFyRmlsdGVycyA9IGFzeW5jIGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogdW5rbm93bikge1xuXHRyZXR1cm4gRmlsdGVyVXRpbHMuY2xlYXJGaWx0ZXJWYWx1ZXMob0ZpbHRlckNvbnRyb2wpO1xufTtcbi8qKlxuICogQ3JlYXRlcyB0aGUgZmlsdGVyIGZpZWxkIGluIHRoZSB0YWJsZSBhZGFwdGF0aW9uIG9mIHRoZSBGaWx0ZXJCYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIFRoZSBwcm9wZXJ0eSBuYW1lIG9mIHRoZSBlbnRpdHkgdHlwZSBmb3Igd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBuZWVkcyB0byBiZSBjcmVhdGVkXG4gKiBAcGFyYW0gb1BhcmVudENvbnRyb2wgSW5zdGFuY2Ugb2YgdGhlIHBhcmVudCBjb250cm9sXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkLCBhIGZpbHRlciBmaWVsZCBkZWZpbml0aW9uIGlzIHJldHVybmVkXG4gKi9cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZFAxM25JdGVtID0gZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG9QYXJlbnRDb250cm9sOiBvYmplY3QpIHtcblx0cmV0dXJuIERlbGVnYXRlVXRpbC5mZXRjaE1vZGVsKG9QYXJlbnRDb250cm9sKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChvTW9kZWw6IGFueSkge1xuXHRcdFx0cmV0dXJuIE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZEZsZXhJdGVtKHNQcm9wZXJ0eUluZm9OYW1lLCBvUGFyZW50Q29udHJvbCwgb01vZGVsLmdldE1ldGFNb2RlbCgpLCB1bmRlZmluZWQpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiTW9kZWwgY291bGQgbm90IGJlIHJlc29sdmVkXCIsIG9FcnJvcik7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KTtcbn07XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmZldGNoUHJvcGVydGllc0ZvckVudGl0eSA9IGZ1bmN0aW9uIChzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvRmlsdGVyQ29udHJvbDogYW55KSB7XG5cdGNvbnN0IG9FbnRpdHlUeXBlID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVR5cGVQYXRoKTtcblx0Y29uc3QgaW5jbHVkZUhpZGRlbiA9IG9GaWx0ZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuZmlsdGVyYmFyLnZoLkZpbHRlckJhclwiKSA/IHRydWUgOiB1bmRlZmluZWQ7XG5cdGlmICghb0ZpbHRlckNvbnRyb2wgfHwgIW9FbnRpdHlUeXBlKSB7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gRmlsdGVyVXRpbHMuY3JlYXRlQ29udmVydGVyQ29udGV4dChvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoKTtcblx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aCk7XG5cblx0Y29uc3QgbUZpbHRlckZpZWxkcyA9IEZpbHRlclV0aWxzLmdldENvbnZlcnRlZEZpbHRlckZpZWxkcyhvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoLCBpbmNsdWRlSGlkZGVuKTtcblx0bGV0IGFGZXRjaGVkUHJvcGVydGllczogYW55W10gPSBbXTtcblx0bUZpbHRlckZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvRmlsdGVyRmllbGRJbmZvOiBhbnkpIHtcblx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoO1xuXHRcdGlmIChzQW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gb0NvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKS5yZXNvbHZlUGF0aChzQW5ub3RhdGlvblBhdGgpLnRhcmdldDtcblx0XHRcdGNvbnN0IHNUYXJnZXRQcm9wZXJ0eVByZWZpeCA9IENvbW1vbkhlbHBlci5nZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aChvTWV0YU1vZGVsLCBzQW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gc0Fubm90YXRpb25QYXRoLnJlcGxhY2UoYCR7c1RhcmdldFByb3BlcnR5UHJlZml4fS9gLCBcIlwiKTtcblx0XHRcdGNvbnN0IGVudGl0eVR5cGUgPSBvQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZHMgPSBlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uU2VsZWN0aW9uRmllbGRzO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9pc0ZpbHRlckFkYXB0YWJsZShvRmlsdGVyRmllbGRJbmZvLCBvUHJvcGVydHlBbm5vdGF0aW9ucywgc2VsZWN0aW9uRmllbGRzKSAmJlxuXHRcdFx0XHRpc1Byb3BlcnR5RmlsdGVyYWJsZShvTWV0YU1vZGVsLCBzVGFyZ2V0UHJvcGVydHlQcmVmaXgsIF9nZXRQcm9wZXJ0eVBhdGgoc1Byb3BlcnR5KSwgdHJ1ZSlcblx0XHRcdCkge1xuXHRcdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMucHVzaChvRmlsdGVyRmllbGRJbmZvKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9DdXN0b20gRmlsdGVyc1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob0ZpbHRlckZpZWxkSW5mbyk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBhUGFyYW1ldGVyRmllbGRzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBwcm9jZXNzZWRGaWVsZHMgPSBwcm9jZXNzU2VsZWN0aW9uRmllbGRzKGFGZXRjaGVkUHJvcGVydGllcywgb0NvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBwcm9jZXNzZWRGaWVsZHNLZXlzOiBhbnlbXSA9IFtdO1xuXHRwcm9jZXNzZWRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BzOiBhbnkpIHtcblx0XHRpZiAob1Byb3BzLmtleSkge1xuXHRcdFx0cHJvY2Vzc2VkRmllbGRzS2V5cy5wdXNoKG9Qcm9wcy5rZXkpO1xuXHRcdH1cblx0fSk7XG5cblx0YUZldGNoZWRQcm9wZXJ0aWVzID0gYUZldGNoZWRQcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbiAob1Byb3A6IGFueSkge1xuXHRcdHJldHVybiBwcm9jZXNzZWRGaWVsZHNLZXlzLmluY2x1ZGVzKG9Qcm9wLmtleSk7XG5cdH0pO1xuXG5cdGNvbnN0IG9GUiA9IENvbW1vblV0aWxzLmdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aChzRW50aXR5U2V0UGF0aCwgb01ldGFNb2RlbCksXG5cdFx0bUFsbG93ZWRFeHByZXNzaW9ucyA9IG9GUi5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM7XG5cdC8vT2JqZWN0LmtleXMocHJvY2Vzc2VkRmllbGRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzRmlsdGVyRmllbGRLZXk6IHN0cmluZykge1xuXHRwcm9jZXNzZWRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3AsIGlGaWx0ZXJGaWVsZEluZGV4OiBudW1iZXIpIHtcblx0XHRjb25zdCBvU2VsRmllbGQgPSBhRmV0Y2hlZFByb3BlcnRpZXNbaUZpbHRlckZpZWxkSW5kZXggYXMgYW55XTtcblx0XHRpZiAoIW9TZWxGaWVsZCB8fCAhb1NlbEZpZWxkLmNvbmRpdGlvblBhdGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IF9nZXRQcm9wZXJ0eVBhdGgob1NlbEZpZWxkLmNvbmRpdGlvblBhdGgpO1xuXHRcdC8vZmV0Y2hCYXNpY1xuXHRcdG9Qcm9wID0gT2JqZWN0LmFzc2lnbihvUHJvcCwge1xuXHRcdFx0Z3JvdXA6IG9TZWxGaWVsZC5ncm91cCxcblx0XHRcdGdyb3VwTGFiZWw6IG9TZWxGaWVsZC5ncm91cExhYmVsLFxuXHRcdFx0cGF0aDogb1NlbEZpZWxkLmNvbmRpdGlvblBhdGgsXG5cdFx0XHR0b29sdGlwOiBudWxsLFxuXHRcdFx0cmVtb3ZlRnJvbUFwcFN0YXRlOiBmYWxzZSxcblx0XHRcdGhhc1ZhbHVlSGVscDogZmFsc2Vcblx0XHR9KTtcblxuXHRcdC8vZmV0Y2hQcm9wSW5mb1xuXHRcdGlmIChvU2VsRmllbGQuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IG9TZWxGaWVsZC5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNBbm5vdGF0aW9uUGF0aCksXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0Fubm90YXRpb25QYXRofUBgKSxcblx0XHRcdFx0b1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Fubm90YXRpb25QYXRoKTtcblxuXHRcdFx0Y29uc3QgYlJlbW92ZUZyb21BcHBTdGF0ZSA9XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCJdIHx8XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHRcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLk1lYXN1cmVcIl07XG5cblx0XHRcdGNvbnN0IHNUYXJnZXRQcm9wZXJ0eVByZWZpeCA9IENvbW1vbkhlbHBlci5nZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aChvTWV0YU1vZGVsLCBvU2VsRmllbGQuYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gc0Fubm90YXRpb25QYXRoLnJlcGxhY2UoYCR7c1RhcmdldFByb3BlcnR5UHJlZml4fS9gLCBcIlwiKTtcblx0XHRcdGxldCBvRmlsdGVyRGVmYXVsdFZhbHVlQW5ub3RhdGlvbjtcblx0XHRcdGxldCBvRmlsdGVyRGVmYXVsdFZhbHVlO1xuXHRcdFx0aWYgKGlzUHJvcGVydHlGaWx0ZXJhYmxlKG9NZXRhTW9kZWwsIHNUYXJnZXRQcm9wZXJ0eVByZWZpeCwgX2dldFByb3BlcnR5UGF0aChzUHJvcGVydHkpLCB0cnVlKSkge1xuXHRcdFx0XHRvRmlsdGVyRGVmYXVsdFZhbHVlQW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJEZWZhdWx0VmFsdWVcIl07XG5cdFx0XHRcdGlmIChvRmlsdGVyRGVmYXVsdFZhbHVlQW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdG9GaWx0ZXJEZWZhdWx0VmFsdWUgPSBvRmlsdGVyRGVmYXVsdFZhbHVlQW5ub3RhdGlvbltgJCR7Z2V0TW9kZWxUeXBlKG9Qcm9wZXJ0eS4kVHlwZSl9YF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvUHJvcCA9IE9iamVjdC5hc3NpZ24ob1Byb3AsIHtcblx0XHRcdFx0XHR0b29sdGlwOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUXVpY2tJbmZvXCJdIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRyZW1vdmVGcm9tQXBwU3RhdGU6IGJSZW1vdmVGcm9tQXBwU3RhdGUsXG5cdFx0XHRcdFx0aGFzVmFsdWVIZWxwOiBoYXNWYWx1ZUhlbHAob1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKSwgeyBjb250ZXh0OiBvUHJvcGVydHlDb250ZXh0IH0pLFxuXHRcdFx0XHRcdGRlZmF1bHRGaWx0ZXJDb25kaXRpb25zOiBvRmlsdGVyRGVmYXVsdFZhbHVlXG5cdFx0XHRcdFx0XHQ/IFtcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWVsZFBhdGg6IG9TZWxGaWVsZC5jb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0b3BlcmF0b3I6IFwiRVFcIixcblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlczogW29GaWx0ZXJEZWZhdWx0VmFsdWVdXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ICBdXG5cdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL2Jhc2VcblxuXHRcdGlmIChvUHJvcCkge1xuXHRcdFx0aWYgKG1BbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5UGF0aF0gJiYgbUFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHlQYXRoXS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdG9Qcm9wLmZpbHRlckV4cHJlc3Npb24gPSBDb21tb25VdGlscy5nZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uKG1BbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5UGF0aF0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1Byb3AuZmlsdGVyRXhwcmVzc2lvbiA9IFwiYXV0b1wiO1xuXHRcdFx0fVxuXG5cdFx0XHRvUHJvcCA9IE9iamVjdC5hc3NpZ24ob1Byb3AsIHtcblx0XHRcdFx0dmlzaWJsZTogb1NlbEZpZWxkLmF2YWlsYWJpbGl0eSA9PT0gXCJEZWZhdWx0XCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHByb2Nlc3NlZEZpZWxkc1tpRmlsdGVyRmllbGRJbmRleF0gPSBvUHJvcDtcblx0fSk7XG5cdHByb2Nlc3NlZEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wSW5mbzogYW55KSB7XG5cdFx0aWYgKHByb3BJbmZvLnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRwcm9wSW5mby5sYWJlbCA9IGdldFJlc291cmNlTW9kZWwob0ZpbHRlckNvbnRyb2wpLmdldFRleHQoXCJGSUxURVJCQVJfRURJVElOR19TVEFUVVNcIik7XG5cdFx0fVxuXHRcdHByb3BJbmZvLnR5cGVDb25maWcgPSBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKHByb3BJbmZvLmRhdGFUeXBlLCBwcm9wSW5mby5mb3JtYXRPcHRpb25zLCBwcm9wSW5mby5jb25zdHJhaW50cyk7XG5cdFx0cHJvcEluZm8ubGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KHByb3BJbmZvLmxhYmVsLCBvRmlsdGVyQ29udHJvbCkgfHwgXCJcIjtcblx0XHRpZiAocHJvcEluZm8uaXNQYXJhbWV0ZXIpIHtcblx0XHRcdGFQYXJhbWV0ZXJGaWVsZHMucHVzaChwcm9wSW5mby5uYW1lKTtcblx0XHR9XG5cdH0pO1xuXG5cdGFGZXRjaGVkUHJvcGVydGllcyA9IHByb2Nlc3NlZEZpZWxkcztcblx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEob0ZpbHRlckNvbnRyb2wsIFwicGFyYW1ldGVyc1wiLCBhUGFyYW1ldGVyRmllbGRzKTtcblxuXHRyZXR1cm4gYUZldGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuZnVuY3Rpb24gZ2V0TGluZUl0ZW1RdWFsaWZpZXJGcm9tVGFibGUob0NvbnRyb2w6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdGlmIChvQ29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGhzID0gb0NvbnRyb2wuZ2V0TWV0YVBhdGgoKS5zcGxpdChcIiNcIilbMF0uc3BsaXQoXCIvXCIpO1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvblBhdGhzW2Fubm90YXRpb25QYXRocy5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3Qob0NvbnRyb2wuZ2V0TWV0YVBhdGgoKSlcblx0XHRcdFx0XHQuVmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpc3VhbGl6YXRpb246IGFueSkgPT4gdmlzdWFsaXphdGlvbi4kQW5ub3RhdGlvblBhdGguaW5jbHVkZXMoYEAke1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtfWApKVxuXHRcdFx0XHRcdC4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gOlxuXHRcdFx0XHRjb25zdCBtZXRhUGF0aHMgPSBvQ29udHJvbC5nZXRNZXRhUGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0cmV0dXJuIG1ldGFQYXRoc1ttZXRhUGF0aHMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2lzRmlsdGVyQWRhcHRhYmxlID0gZnVuY3Rpb24gKGZpbHRlckZpZWxkSW5mbzogYW55LCBwcm9wZXJ0eUFubm90YXRpb25zOiBhbnksIHNlbGVjdGlvbkZpZWxkczogU2VsZWN0aW9uRmllbGRzKSB7XG5cdGNvbnN0IGlzU2VsZWN0aW9uRmllbGQgPSBzZWxlY3Rpb25GaWVsZHM/LnNvbWUoZnVuY3Rpb24gKHNlbGVjdGlvbkZpZWxkOiBhbnkpIHtcblx0XHRpZiAoc2VsZWN0aW9uRmllbGQudmFsdWUgPT09IGZpbHRlckZpZWxkSW5mby5rZXkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXHRyZXR1cm4gaXNTZWxlY3Rpb25GaWVsZCB8fCAhcHJvcGVydHlBbm5vdGF0aW9ucy5hbm5vdGF0aW9ucz8uVUk/LkFkYXB0YXRpb25IaWRkZW47XG59O1xuXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRGbGV4SXRlbSA9IGZ1bmN0aW9uIChcblx0c0ZsZXhQcm9wZXJ0eU5hbWU6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0b01ldGFNb2RlbDogYW55LFxuXHRvTW9kaWZpZXI6IGFueSxcblx0b0FwcENvbXBvbmVudDogYW55XG4pIHtcblx0Y29uc3Qgc0ZpbHRlckJhcklkID0gb01vZGlmaWVyID8gb01vZGlmaWVyLmdldElkKG9QYXJlbnRDb250cm9sKSA6IG9QYXJlbnRDb250cm9sLmdldElkKCksXG5cdFx0c0lkUHJlZml4ID0gb01vZGlmaWVyID8gXCJcIiA6IFwiQWRhcHRhdGlvblwiLFxuXHRcdGFTZWxlY3Rpb25GaWVsZHMgPSBGaWx0ZXJVdGlscy5nZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMoXG5cdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdG51bGwsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdG9Nb2RpZmllcixcblx0XHRcdG9Nb2RpZmllciA/IHVuZGVmaW5lZCA6IGdldExpbmVJdGVtUXVhbGlmaWVyRnJvbVRhYmxlKG9QYXJlbnRDb250cm9sLmdldFBhcmVudCgpLCBvTWV0YU1vZGVsKVxuXHRcdCksXG5cdFx0b1NlbGVjdGlvbkZpZWxkID0gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fZmluZFNlbGVjdGlvbkZpZWxkKGFTZWxlY3Rpb25GaWVsZHMsIHNGbGV4UHJvcGVydHlOYW1lKSxcblx0XHRzUHJvcGVydHlQYXRoID0gX2dldFByb3BlcnR5UGF0aChzRmxleFByb3BlcnR5TmFtZSksXG5cdFx0YklzWE1MID0gISFvTW9kaWZpZXIgJiYgb01vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoc0ZsZXhQcm9wZXJ0eU5hbWUgPT09IEVESVRfU1RBVEVfUFJPUEVSVFlfTkFNRSkge1xuXHRcdHJldHVybiBfdGVtcGxhdGVFZGl0U3RhdGUoX2dlbmVyYXRlSWRQcmVmaXgoc0ZpbHRlckJhcklkLCBgJHtzSWRQcmVmaXh9RmlsdGVyRmllbGRgKSwgb01ldGFNb2RlbCwgb01vZGlmaWVyKTtcblx0fSBlbHNlIGlmIChzRmxleFByb3BlcnR5TmFtZSA9PT0gU0VBUkNIX1BST1BFUlRZX05BTUUpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9IGVsc2UgaWYgKG9TZWxlY3Rpb25GaWVsZCAmJiBvU2VsZWN0aW9uRmllbGQudGVtcGxhdGUpIHtcblx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fdGVtcGxhdGVDdXN0b21GaWx0ZXIoXG5cdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdF9nZW5lcmF0ZUlkUHJlZml4KHNGaWx0ZXJCYXJJZCwgYCR7c0lkUHJlZml4fUZpbHRlckZpZWxkYCksXG5cdFx0XHRvU2VsZWN0aW9uRmllbGQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KTtcblx0fVxuXG5cdGlmIChvU2VsZWN0aW9uRmllbGQudHlwZSA9PT0gXCJTbG90XCIgJiYgb01vZGlmaWVyKSB7XG5cdFx0cmV0dXJuIF9hZGRYTUxDdXN0b21GaWx0ZXJGaWVsZChvUGFyZW50Q29udHJvbCwgb01vZGlmaWVyLCBzUHJvcGVydHlQYXRoKTtcblx0fVxuXG5cdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzUHJvcGVydHlQYXRoKTtcblx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb1NlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRoO1xuXHRsZXQgc0VudGl0eVR5cGVQYXRoOiBzdHJpbmc7XG5cdGxldCBzVXNlU2VtYW50aWNEYXRlUmFuZ2U7XG5cdGxldCBvU2V0dGluZ3M6IGFueTtcblx0bGV0IHNCaW5kaW5nUGF0aDtcblx0bGV0IG9QYXJhbWV0ZXJzOiBhbnk7XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9TZWxlY3Rpb25GaWVsZC5pc1BhcmFtZXRlcikge1xuXHRcdFx0XHRyZXR1cm4gc0Fubm90YXRpb25QYXRoLnN1YnN0cigwLCBzQW5ub3RhdGlvblBhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1BhcmVudENvbnRyb2wsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aDogYW55KSB7XG5cdFx0XHRzRW50aXR5VHlwZVBhdGggPSBzUmV0cmlldmVkRW50aXR5VHlwZVBhdGg7XG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1BhcmVudENvbnRyb2wsIFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIiwgb01vZGlmaWVyKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChzUmV0cmlldmVkVXNlU2VtYW50aWNEYXRlUmFuZ2U6IGFueSkge1xuXHRcdFx0c1VzZVNlbWFudGljRGF0ZVJhbmdlID0gc1JldHJpZXZlZFVzZVNlbWFudGljRGF0ZVJhbmdlO1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoICsgc1Byb3BlcnR5UGF0aCk7XG5cdFx0XHRjb25zdCBzSW5GaWx0ZXJCYXJJZCA9IG9Nb2RpZmllciA/IG9Nb2RpZmllci5nZXRJZChvUGFyZW50Q29udHJvbCkgOiBvUGFyZW50Q29udHJvbC5nZXRJZCgpO1xuXHRcdFx0b1NldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5VHlwZVBhdGgpLFxuXHRcdFx0XHRcdHByb3BlcnR5OiBvUHJvcGVydHlDb250ZXh0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5OiBvTWV0YU1vZGVsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGlzWE1MOiBiSXNYTUxcblx0XHRcdH07XG5cdFx0XHRzQmluZGluZ1BhdGggPSBgLyR7TW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpXG5cdFx0XHRcdC5zcGxpdChcIi9cIilcblx0XHRcdFx0LmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZylcblx0XHRcdFx0LmpvaW4oXCIvXCIpfWA7XG5cdFx0XHRvUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0c1Byb3BlcnR5TmFtZTogc1Byb3BlcnR5UGF0aCxcblx0XHRcdFx0c0JpbmRpbmdQYXRoOiBzQmluZGluZ1BhdGgsXG5cdFx0XHRcdHNWYWx1ZUhlbHBUeXBlOiBzSWRQcmVmaXggKyBWQUxVRV9IRUxQX1RZUEUsXG5cdFx0XHRcdG9Db250cm9sOiBvUGFyZW50Q29udHJvbCxcblx0XHRcdFx0b01ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0b01vZGlmaWVyOiBvTW9kaWZpZXIsXG5cdFx0XHRcdHNJZFByZWZpeDogX2dlbmVyYXRlSWRQcmVmaXgoc0luRmlsdGVyQmFySWQsIGAke3NJZFByZWZpeH1GaWx0ZXJGaWVsZGAsIHNOYXZpZ2F0aW9uUGF0aCksXG5cdFx0XHRcdHNWaElkUHJlZml4OiBfZ2VuZXJhdGVJZFByZWZpeChzSW5GaWx0ZXJCYXJJZCwgc0lkUHJlZml4ICsgVkFMVUVfSEVMUF9UWVBFKSxcblx0XHRcdFx0c05hdmlnYXRpb25QcmVmaXg6IHNOYXZpZ2F0aW9uUGF0aCxcblx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlOiBzVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdG9TZXR0aW5nczogb1NlbGVjdGlvbkZpZWxkID8gb1NlbGVjdGlvbkZpZWxkLnNldHRpbmdzIDoge30sXG5cdFx0XHRcdHZpc3VhbEZpbHRlcjogb1NlbGVjdGlvbkZpZWxkID8gb1NlbGVjdGlvbkZpZWxkLnZpc3VhbEZpbHRlciA6IHVuZGVmaW5lZFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIERlbGVnYXRlVXRpbC5kb2VzVmFsdWVIZWxwRXhpc3Qob1BhcmFtZXRlcnMpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGJWYWx1ZUhlbHBFeGlzdHM6IGFueSkge1xuXHRcdFx0aWYgKCFiVmFsdWVIZWxwRXhpc3RzKSB7XG5cdFx0XHRcdHJldHVybiBfdGVtcGxhdGVWYWx1ZUhlbHAob1NldHRpbmdzLCBvUGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRsZXQgcGFnZU1vZGVsO1xuXHRcdFx0aWYgKG9QYXJhbWV0ZXJzLnZpc3VhbEZpbHRlcikge1xuXHRcdFx0XHQvL05lZWQgdG8gc2V0IHRoZSBjb252ZXJ0ZXJjb250ZXh0IGFzIHBhZ2VNb2RlbCBpbiBzZXR0aW5ncyBmb3IgQnVpbGRpbmdCbG9jayAyLjBcblx0XHRcdFx0cGFnZU1vZGVsID0gKENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1BhcmVudENvbnRyb2wpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2dldFBhZ2VNb2RlbCgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIF90ZW1wbGF0ZUZpbHRlckZpZWxkKG9TZXR0aW5ncywgb1BhcmFtZXRlcnMsIHBhZ2VNb2RlbCk7XG5cdFx0fSk7XG59O1xuZnVuY3Rpb24gX2dldENhY2hlZFByb3BlcnRpZXMob0ZpbHRlckJhcjogYW55KSB7XG5cdC8vIHByb3BlcnRpZXMgYXJlIG5vdCBjYWNoZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0aWYgKG9GaWx0ZXJCYXIgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkpO1xufVxuZnVuY3Rpb24gX3NldENhY2hlZFByb3BlcnRpZXMob0ZpbHRlckJhcjogYW55LCBhRmV0Y2hlZFByb3BlcnRpZXM6IGFueSkge1xuXHQvLyBkbyBub3QgY2FjaGUgZHVyaW5nIHRlbXBsYXRpbmcsIGVsc2UgaXQgYmVjb21lcyBwYXJ0IG9mIHRoZSBjYWNoZWQgdmlld1xuXHRpZiAob0ZpbHRlckJhciBpbnN0YW5jZW9mIHdpbmRvdy5FbGVtZW50KSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIEZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSwgYUZldGNoZWRQcm9wZXJ0aWVzKTtcbn1cbmZ1bmN0aW9uIF9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eShzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvRmlsdGVyQmFyOiBhbnkpIHtcblx0bGV0IGFGZXRjaGVkUHJvcGVydGllcyA9IF9nZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXIpO1xuXHRsZXQgbG9jYWxHcm91cExhYmVsO1xuXG5cdGlmICghYUZldGNoZWRQcm9wZXJ0aWVzKSB7XG5cdFx0YUZldGNoZWRQcm9wZXJ0aWVzID0gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoLCBvTWV0YU1vZGVsLCBvRmlsdGVyQmFyKTtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAob0dyb3VwOiBhbnkpIHtcblx0XHRcdGxvY2FsR3JvdXBMYWJlbCA9IG51bGw7XG5cdFx0XHRpZiAob0dyb3VwLmdyb3VwTGFiZWwpIHtcblx0XHRcdFx0bG9jYWxHcm91cExhYmVsID0gZ2V0TG9jYWxpemVkVGV4dChvR3JvdXAuZ3JvdXBMYWJlbCwgb0ZpbHRlckJhcik7XG5cdFx0XHRcdG9Hcm91cC5ncm91cExhYmVsID0gbG9jYWxHcm91cExhYmVsID09PSBudWxsID8gb0dyb3VwLmdyb3VwTGFiZWwgOiBsb2NhbEdyb3VwTGFiZWw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRpZiAoYS5ncm91cExhYmVsID09PSB1bmRlZmluZWQgfHwgYS5ncm91cExhYmVsID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHRcdGlmIChiLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBiLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYS5ncm91cExhYmVsLmxvY2FsZUNvbXBhcmUoYi5ncm91cExhYmVsKTtcblx0XHR9KTtcblx0XHRfc2V0Q2FjaGVkUHJvcGVydGllcyhvRmlsdGVyQmFyLCBhRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHR9XG5cdHJldHVybiBhRmV0Y2hlZFByb3BlcnRpZXM7XG59XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmZldGNoUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvRmlsdGVyQmFyOiBhbnkpIHtcblx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0ZpbHRlckJhciwgXCJlbnRpdHlUeXBlXCIpO1xuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwob0ZpbHRlckJhcikudGhlbihmdW5jdGlvbiAob01vZGVsOiBhbnkpIHtcblx0XHRpZiAoIW9Nb2RlbCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KHNFbnRpdHlUeXBlUGF0aCwgb01vZGVsLmdldE1ldGFNb2RlbCgpLCBvRmlsdGVyQmFyKTtcblx0XHQvLyB2YXIgYUNsZWFuZWRQcm9wZXJ0aWVzID0gYVByb3BlcnRpZXMuY29uY2F0KCk7XG5cdFx0Ly8gdmFyIGFBbGxvd2VkQXR0cmlidXRlcyA9IFtcIm5hbWVcIiwgXCJsYWJlbFwiLCBcInZpc2libGVcIiwgXCJwYXRoXCIsIFwidHlwZUNvbmZpZ1wiLCBcIm1heENvbmRpdGlvbnNcIiwgXCJncm91cFwiLCBcImdyb3VwTGFiZWxcIl07XG5cdFx0Ly8gYUNsZWFuZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ob1Byb3BlcnR5KSB7XG5cdFx0Ly8gXHRPYmplY3Qua2V5cyhvUHJvcGVydHkpLmZvckVhY2goZnVuY3Rpb24oc1Byb3BOYW1lKSB7XG5cdFx0Ly8gXHRcdGlmIChhQWxsb3dlZEF0dHJpYnV0ZXMuaW5kZXhPZihzUHJvcE5hbWUpID09PSAtMSkge1xuXHRcdC8vIFx0XHRcdGRlbGV0ZSBvUHJvcGVydHlbc1Byb3BOYW1lXTtcblx0XHQvLyBcdFx0fVxuXHRcdC8vIFx0fSk7XG5cdFx0Ly8gfSk7XG5cdFx0Ly8gcmV0dXJuIGFDbGVhbmVkUHJvcGVydGllcztcblx0fSk7XG59O1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5nZXRUeXBlVXRpbCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIFR5cGVVdGlsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7RUFzQkEsTUFBTUEsc0JBQXNCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxpQkFBaUIsQ0FBUTtFQUMxRSxNQUFNQyx3QkFBd0IsR0FBRyxZQUFZO0lBQzVDQyxvQkFBb0IsR0FBRyxTQUFTO0lBQ2hDQyxlQUFlLEdBQUcsc0JBQXNCO0lBQ3hDQywyQkFBMkIsR0FBRywwQ0FBMEM7SUFDeEVDLHFDQUFxQyxHQUFHLE9BQU87RUFFaEQsU0FBU0Msa0JBQWtCLENBQUNDLFNBQWMsRUFBRUMsU0FBeUIsRUFBRUMsU0FBYyxFQUFFO0lBQ3RGLE1BQU1DLEtBQUssR0FBRyxJQUFJQyxTQUFTLENBQUM7UUFDMUJDLEVBQUUsRUFBRUwsU0FBUztRQUNiTSxvQkFBb0IsRUFBRUMsV0FBVyxDQUFDQyw2QkFBNkIsQ0FBQ1AsU0FBUztNQUMxRSxDQUFDLENBQUM7TUFDRlEscUJBQXFCLEdBQUc7UUFDdkJDLGVBQWUsRUFBRTtVQUNoQkMsSUFBSSxFQUFFUixLQUFLLENBQUNTLG9CQUFvQixDQUFDLEdBQUc7UUFDckMsQ0FBQztRQUNEQyxNQUFNLEVBQUU7VUFDUDtVQUNBRixJQUFJLEVBQUVSO1FBQ1A7TUFDRCxDQUFDO0lBRUYsT0FBT1csWUFBWSxDQUFDQyx1QkFBdUIsQ0FBQyxxQ0FBcUMsRUFBRU4scUJBQXFCLEVBQUVPLFNBQVMsRUFBRWQsU0FBUyxDQUFDLENBQUNlLE9BQU8sQ0FDdEksWUFBWTtNQUNYZCxLQUFLLENBQUNlLE9BQU8sRUFBRTtJQUNoQixDQUFDLENBQ0Q7RUFDRjtFQUVBNUIsc0JBQXNCLENBQUM2QixxQkFBcUIsR0FBRyxnQkFDOUNDLFVBQWUsRUFDZnBCLFNBQWMsRUFDZHFCLG1CQUF3QixFQUN4QkMsVUFBZSxFQUNmcEIsU0FBYyxFQUNiO0lBQ0QsTUFBTXFCLGVBQWUsR0FBRyxNQUFNVCxZQUFZLENBQUNVLGFBQWEsQ0FBQ0osVUFBVSxFQUFFLFlBQVksRUFBRWxCLFNBQVMsQ0FBQztJQUM3RixNQUFNQyxLQUFLLEdBQUcsSUFBSUMsU0FBUyxDQUFDO1FBQzFCQyxFQUFFLEVBQUVMO01BQ0wsQ0FBQyxDQUFDO01BQ0Z5QixVQUFVLEdBQUcsSUFBSUMsYUFBYSxDQUFDTCxtQkFBbUIsRUFBRUMsVUFBVSxDQUFDO01BQy9EYixxQkFBcUIsR0FBRztRQUN2QkMsZUFBZSxFQUFFO1VBQ2hCaUIsV0FBVyxFQUFFTCxVQUFVLENBQUNWLG9CQUFvQixDQUFDVyxlQUFlLENBQUM7VUFDN0RaLElBQUksRUFBRVIsS0FBSyxDQUFDUyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7VUFDckNnQixJQUFJLEVBQUVILFVBQVUsQ0FBQ2Isb0JBQW9CLENBQUMsR0FBRztRQUMxQyxDQUFDO1FBQ0RDLE1BQU0sRUFBRTtVQUNQYyxXQUFXLEVBQUVMLFVBQVU7VUFDdkJYLElBQUksRUFBRVIsS0FBSztVQUNYeUIsSUFBSSxFQUFFSDtRQUNQO01BQ0QsQ0FBQztNQUNESSxLQUFLLEdBQUdDLFdBQVcsQ0FBQ0MsYUFBYSxDQUFDWCxVQUFVLENBQUM7TUFDN0NZLFdBQVcsR0FBR0gsS0FBSyxHQUFHQSxLQUFLLENBQUNJLGFBQWEsRUFBRSxHQUFHakIsU0FBUztNQUN2RGtCLFFBQVEsR0FBRztRQUNWQyxVQUFVLEVBQUVILFdBQVcsR0FBR0EsV0FBVyxHQUFHaEIsU0FBUztRQUNqRG9CLElBQUksRUFBRVA7TUFDUCxDQUFDO0lBRUYsT0FBT2YsWUFBWSxDQUFDQyx1QkFBdUIsQ0FBQyxtQ0FBbUMsRUFBRU4scUJBQXFCLEVBQUV5QixRQUFRLEVBQUVoQyxTQUFTLENBQUMsQ0FBQ2UsT0FBTyxDQUNuSSxZQUFZO01BQ1hkLEtBQUssQ0FBQ2UsT0FBTyxFQUFFO01BQ2ZPLFVBQVUsQ0FBQ1AsT0FBTyxFQUFFO0lBQ3JCLENBQUMsQ0FDRDtFQUNGLENBQUM7RUFDRCxTQUFTbUIsZ0JBQWdCLENBQUNDLGNBQW1CLEVBQUU7SUFDOUMsT0FBT0EsY0FBYyxDQUFDQyxPQUFPLENBQUN6QyxxQ0FBcUMsRUFBRSxFQUFFLENBQUM7RUFDekU7RUFDQVIsc0JBQXNCLENBQUNrRCxtQkFBbUIsR0FBRyxVQUFVQyxnQkFBcUIsRUFBRUMsU0FBYyxFQUFFO0lBQzdGLE9BQU9ELGdCQUFnQixDQUFDRSxJQUFJLENBQUMsVUFBVUMsZUFBb0IsRUFBRTtNQUM1RCxPQUNDLENBQUNBLGVBQWUsQ0FBQ0MsYUFBYSxLQUFLSCxTQUFTLElBQUlFLGVBQWUsQ0FBQ0MsYUFBYSxDQUFDQyxVQUFVLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLSixTQUFTLEtBQ2pIRSxlQUFlLENBQUNHLFlBQVksS0FBSyxRQUFRO0lBRTNDLENBQUMsQ0FBQztFQUNILENBQUM7RUFDRCxTQUFTQyxpQkFBaUIsQ0FBQ0MsWUFBaUIsRUFBRUMsWUFBaUIsRUFBRUMsaUJBQXVCLEVBQUU7SUFDekYsT0FBT0EsaUJBQWlCLEdBQUdDLFFBQVEsQ0FBQyxDQUFDSCxZQUFZLEVBQUVDLFlBQVksRUFBRUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHQyxRQUFRLENBQUMsQ0FBQ0gsWUFBWSxFQUFFQyxZQUFZLENBQUMsQ0FBQztFQUM5SDtFQUNBLFNBQVNHLGtCQUFrQixDQUFDQyxTQUFjLEVBQUVDLFdBQWdCLEVBQUU7SUFDN0QsTUFBTXBELEtBQUssR0FBRyxJQUFJQyxTQUFTLENBQUM7TUFDM0JvRCxRQUFRLEVBQUVELFdBQVcsQ0FBQ0UsV0FBVztNQUNqQ0MsY0FBYyxFQUFFLFVBQVU7TUFDMUJDLGdCQUFnQixFQUFFSixXQUFXLENBQUNKLGlCQUFpQixHQUFJLElBQUdJLFdBQVcsQ0FBQ0osaUJBQWtCLEVBQUMsR0FBRyxFQUFFO01BQzFGUyxvQkFBb0IsRUFBRSxJQUFJO01BQzFCQyxvQkFBb0IsRUFBRU4sV0FBVyxDQUFDTztJQUNuQyxDQUFDLENBQUM7SUFDRixNQUFNckQscUJBQXFCLEdBQUdzRCxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUVULFNBQVMsRUFBRTtNQUN6RDVDLGVBQWUsRUFBRTtRQUNoQkMsSUFBSSxFQUFFUixLQUFLLENBQUNTLG9CQUFvQixDQUFDLEdBQUc7TUFDckMsQ0FBQztNQUNEQyxNQUFNLEVBQUU7UUFDUEYsSUFBSSxFQUFFUjtNQUNQO0lBQ0QsQ0FBQyxDQUFDO0lBRUYsT0FBTzZELE9BQU8sQ0FBQ0MsT0FBTyxDQUNyQm5ELFlBQVksQ0FBQ0MsdUJBQXVCLENBQUMsNENBQTRDLEVBQUVOLHFCQUFxQixFQUFFO01BQ3pHeUQsS0FBSyxFQUFFWixTQUFTLENBQUNZO0lBQ2xCLENBQUMsQ0FBQyxDQUNGLENBQ0NDLElBQUksQ0FBQyxVQUFVQyxXQUFnQixFQUFFO01BQ2pDLElBQUlBLFdBQVcsRUFBRTtRQUNoQixNQUFNQyxnQkFBZ0IsR0FBRyxZQUFZO1FBQ3JDO1FBQ0EsSUFBSUQsV0FBVyxDQUFDRSxNQUFNLEVBQUU7VUFDdkJGLFdBQVcsQ0FBQ0csT0FBTyxDQUFDLFVBQVVDLEdBQVEsRUFBRTtZQUN2QyxJQUFJakIsV0FBVyxDQUFDckQsU0FBUyxFQUFFO2NBQzFCcUQsV0FBVyxDQUFDckQsU0FBUyxDQUFDdUUsaUJBQWlCLENBQUNsQixXQUFXLENBQUNtQixRQUFRLEVBQUVMLGdCQUFnQixFQUFFRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsTUFBTTtjQUNOakIsV0FBVyxDQUFDbUIsUUFBUSxDQUFDRCxpQkFBaUIsQ0FBQ0osZ0JBQWdCLEVBQUVHLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO1lBQ3hFO1VBQ0QsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxNQUFNLElBQUlqQixXQUFXLENBQUNyRCxTQUFTLEVBQUU7VUFDakNxRCxXQUFXLENBQUNyRCxTQUFTLENBQUN1RSxpQkFBaUIsQ0FBQ2xCLFdBQVcsQ0FBQ21CLFFBQVEsRUFBRUwsZ0JBQWdCLEVBQUVELFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDaEcsQ0FBQyxNQUFNO1VBQ05iLFdBQVcsQ0FBQ21CLFFBQVEsQ0FBQ0QsaUJBQWlCLENBQUNKLGdCQUFnQixFQUFFRCxXQUFXLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNoRjtNQUNEO0lBQ0QsQ0FBQyxDQUFDLENBQ0RPLEtBQUssQ0FBQyxVQUFVQyxNQUFXLEVBQUU7TUFDN0JDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLHlEQUF5RCxFQUFFRixNQUFNLENBQUM7SUFDN0UsQ0FBQyxDQUFDLENBQ0QzRCxPQUFPLENBQUMsWUFBWTtNQUNwQmQsS0FBSyxDQUFDZSxPQUFPLEVBQUU7SUFDaEIsQ0FBQyxDQUFDO0VBQ0o7RUFDQSxlQUFlNkQsd0JBQXdCLENBQUMzRCxVQUFlLEVBQUVsQixTQUFjLEVBQUU4RSxhQUFrQixFQUFFO0lBQzVGLElBQUk7TUFDSCxNQUFNQyxXQUFXLEdBQUcsTUFBTWpCLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDL0QsU0FBUyxDQUFDZ0YsY0FBYyxDQUFDOUQsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO01BQzdGLElBQUkrRCxDQUFDO01BQ0wsSUFBSUYsV0FBVyxJQUFJQSxXQUFXLENBQUNYLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDMUMsS0FBS2EsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJRixXQUFXLENBQUNYLE1BQU0sRUFBRWEsQ0FBQyxFQUFFLEVBQUU7VUFDekMsTUFBTUMsWUFBWSxHQUFHSCxXQUFXLENBQUNFLENBQUMsQ0FBQztVQUNuQyxJQUFJQyxZQUFZLElBQUlBLFlBQVksQ0FBQ0MsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7WUFDL0QsTUFBTUMsYUFBYSxHQUFHRixZQUFZLENBQUNHLFlBQVksRUFBRTtjQUNoREMsY0FBYyxHQUFHSixZQUFZLENBQUNLLEtBQUssRUFBRTtZQUN0QyxJQUFJVCxhQUFhLEtBQUtNLGFBQWEsSUFBSUUsY0FBYyxDQUFDRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFBRTtjQUNuRixPQUFPMUIsT0FBTyxDQUFDQyxPQUFPLENBQUNtQixZQUFZLENBQUM7WUFDckM7VUFDRDtRQUNEO01BQ0Q7SUFDRCxDQUFDLENBQUMsT0FBT1IsTUFBVyxFQUFFO01BQ3JCQyxHQUFHLENBQUNDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRUYsTUFBTSxDQUFDO0lBQzVDO0VBQ0Q7RUFDQSxTQUFTZSxvQkFBb0IsQ0FBQ3JDLFNBQWMsRUFBRUMsV0FBZ0IsRUFBRXFDLFNBQXFCLEVBQUU7SUFDdEYsTUFBTXpGLEtBQUssR0FBRyxJQUFJQyxTQUFTLENBQUM7TUFDM0JvRCxRQUFRLEVBQUVELFdBQVcsQ0FBQ3ZELFNBQVM7TUFDL0I2RixVQUFVLEVBQUV0QyxXQUFXLENBQUNFLFdBQVc7TUFDbkNxQyxZQUFZLEVBQUV2QyxXQUFXLENBQUN3QyxhQUFhO01BQ3ZDcEMsZ0JBQWdCLEVBQUVKLFdBQVcsQ0FBQ0osaUJBQWlCLEdBQUksSUFBR0ksV0FBVyxDQUFDSixpQkFBa0IsRUFBQyxHQUFHLEVBQUU7TUFDMUZVLG9CQUFvQixFQUFFTixXQUFXLENBQUNPLHFCQUFxQjtNQUN2RGtDLFFBQVEsRUFBRXpDLFdBQVcsQ0FBQ0QsU0FBUztNQUMvQjJDLFlBQVksRUFBRTFDLFdBQVcsQ0FBQzBDO0lBQzNCLENBQUMsQ0FBQztJQUNGLE1BQU0zRSxVQUFVLEdBQUdpQyxXQUFXLENBQUNqQyxVQUFVO0lBQ3pDLE1BQU00RSxhQUFhLEdBQUcsSUFBSXhFLGFBQWEsQ0FBQzZCLFdBQVcsQ0FBQzBDLFlBQVksRUFBRTNFLFVBQVUsQ0FBQztJQUM3RSxNQUFNYixxQkFBcUIsR0FBR3NELFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRVQsU0FBUyxFQUFFO01BQ3pENUMsZUFBZSxFQUFFO1FBQ2hCQyxJQUFJLEVBQUVSLEtBQUssQ0FBQ1Msb0JBQW9CLENBQUMsR0FBRyxDQUFDO1FBQ3JDcUYsWUFBWSxFQUFFQyxhQUFhLENBQUN0RixvQkFBb0IsQ0FBQyxHQUFHO01BQ3JELENBQUM7TUFDREMsTUFBTSxFQUFFO1FBQ1BGLElBQUksRUFBRVIsS0FBSztRQUNYOEYsWUFBWSxFQUFFQyxhQUFhO1FBQzNCakcsU0FBUyxFQUFFcUIsVUFBVTtRQUNyQjZFLGdCQUFnQixFQUFFUDtNQUNuQjtJQUNELENBQUMsQ0FBQztJQUVGLE9BQU85RSxZQUFZLENBQUNDLHVCQUF1QixDQUFDLHdEQUF3RCxFQUFFTixxQkFBcUIsRUFBRTtNQUM1SHlELEtBQUssRUFBRVosU0FBUyxDQUFDWTtJQUNsQixDQUFDLENBQUMsQ0FBQ2pELE9BQU8sQ0FBQyxZQUFZO01BQ3RCZCxLQUFLLENBQUNlLE9BQU8sRUFBRTtJQUNoQixDQUFDLENBQUM7RUFDSDtFQUVBLGVBQWVrRixnQkFBZ0IsQ0FBQ0MsY0FBeUIsRUFBRUMsWUFBaUIsRUFBRWhGLFVBQWUsRUFBRWlGLGlCQUF5QixFQUFFO0lBQ3pILElBQUk7TUFDSEEsaUJBQWlCLEdBQUdBLGlCQUFpQixDQUFDaEUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7TUFDdEQsTUFBTWlFLGdCQUFnQixHQUFHcEQsUUFBUSxDQUFDLENBQUNtRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN4RCxJQUFJRCxZQUFZLElBQUksQ0FBQ0EsWUFBWSxDQUFDRyxRQUFRLEVBQUU7UUFDM0MsTUFBTSxvREFBb0Q7TUFDM0Q7TUFFQSxNQUFNQyxRQUFRLEdBQUcsTUFBTUosWUFBWSxDQUFDRyxRQUFRLENBQUNFLFdBQVcsQ0FBQ04sY0FBYyxFQUFFLFVBQVUsQ0FBQztNQUNwRixNQUFNTyxhQUFhLEdBQUcsTUFBTU4sWUFBWSxDQUFDRyxRQUFRLENBQUNFLFdBQVcsQ0FBQ04sY0FBYyxFQUFFLGNBQWMsQ0FBQztNQUM3RjtNQUNBLElBQUlPLGFBQWEsRUFBRTtRQUNsQixNQUFNQyxlQUFlLEdBQUdELGFBQWEsQ0FBQ0UsSUFBSSxDQUFDLFVBQVVDLElBQVMsRUFBRTtVQUMvRCxPQUFPQSxJQUFJLENBQUNDLEdBQUcsS0FBS1IsZ0JBQWdCLElBQUlPLElBQUksQ0FBQ0UsSUFBSSxLQUFLVCxnQkFBZ0I7UUFDdkUsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDSyxlQUFlLEVBQUU7VUFDckIsTUFBTUssY0FBYyxHQUFHUixRQUFRLENBQUNTLE9BQU8sQ0FBQ0QsY0FBYztVQUN0RCxNQUFNZixnQkFBZ0IsR0FBR2lCLFdBQVcsQ0FBQ0Msc0JBQXNCLENBQzFEaEIsY0FBYyxFQUNkYSxjQUFjLEVBQ2Q1RixVQUFVLEVBQ1ZnRixZQUFZLENBQUNnQixZQUFZLENBQ3pCO1VBQ0QsTUFBTUMsVUFBVSxHQUFHcEIsZ0JBQWdCLENBQUNxQixhQUFhLEVBQUU7VUFDbkQsSUFBSUMsV0FBVyxHQUFHTCxXQUFXLENBQUNNLGNBQWMsQ0FBQ25CLGlCQUFpQixFQUFFSixnQkFBZ0IsRUFBRW9CLFVBQVUsQ0FBQztVQUM3RkUsV0FBVyxHQUFHTCxXQUFXLENBQUNPLGdCQUFnQixDQUFDRixXQUFXLEVBQUV0QixnQkFBZ0IsQ0FBNEI7VUFDcEdTLGFBQWEsQ0FBQ2dCLElBQUksQ0FBQ0gsV0FBVyxDQUFDO1VBQy9CbkIsWUFBWSxDQUFDRyxRQUFRLENBQUNvQixXQUFXLENBQUN4QixjQUFjLEVBQUUsY0FBYyxFQUFFTyxhQUFhLENBQUM7UUFDakY7TUFDRDtJQUNELENBQUMsQ0FBQyxPQUFPa0IsUUFBUSxFQUFFO01BQ2xCakQsR0FBRyxDQUFDa0QsT0FBTyxDQUFFLEdBQUUxQixjQUFjLENBQUNaLEtBQUssRUFBRyxNQUFLcUMsUUFBUyxFQUFDLENBQUM7SUFDdkQ7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0F4SSxzQkFBc0IsQ0FBQzBJLE9BQU8sR0FBRyxnQkFBZ0J6QixpQkFBeUIsRUFBRUYsY0FBeUIsRUFBRUMsWUFBaUIsRUFBRTtJQUN6SCxJQUFJLENBQUNBLFlBQVksRUFBRTtNQUNsQjtNQUNBLE9BQU9oSCxzQkFBc0IsQ0FBQzJJLFlBQVksQ0FBQzFCLGlCQUFpQixFQUFFRixjQUFjLENBQUM7SUFDOUU7SUFDQSxNQUFNSSxRQUFRLEdBQUdILFlBQVksQ0FBQ0csUUFBUTtJQUN0QyxNQUFNeUIsS0FBSyxHQUFHNUIsWUFBWSxJQUFJQSxZQUFZLENBQUNnQixZQUFZLElBQUloQixZQUFZLENBQUNnQixZQUFZLENBQUNhLFFBQVEsRUFBRTtJQUMvRixNQUFNN0csVUFBVSxHQUFHNEcsS0FBSyxJQUFJQSxLQUFLLENBQUNFLFlBQVksRUFBRTtJQUNoRCxJQUFJLENBQUM5RyxVQUFVLEVBQUU7TUFDaEIsT0FBTzBDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM3QjtJQUNBLE1BQU1DLEtBQUssR0FBR3VDLFFBQVEsSUFBSUEsUUFBUSxDQUFDNEIsT0FBTyxLQUFLLFNBQVM7SUFDeEQsSUFBSW5FLEtBQUssRUFBRTtNQUNWLE1BQU1rQyxnQkFBZ0IsQ0FBQ0MsY0FBYyxFQUFFQyxZQUFZLEVBQUVoRixVQUFVLEVBQUVpRixpQkFBaUIsQ0FBQztJQUNwRjtJQUNBLE9BQU9qSCxzQkFBc0IsQ0FBQ2dKLFlBQVksQ0FBQy9CLGlCQUFpQixFQUFFRixjQUFjLEVBQUUvRSxVQUFVLEVBQUVtRixRQUFRLEVBQUVILFlBQVksQ0FBQ2dCLFlBQVksQ0FBQztFQUMvSCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQWhJLHNCQUFzQixDQUFDaUosVUFBVSxHQUFHLGdCQUFnQkMsb0JBQXlCLEVBQUVuQyxjQUFtQixFQUFFQyxZQUFpQixFQUFFO0lBQ3RILElBQUltQyxZQUFZLEdBQUcsSUFBSTtJQUN2QixNQUFNaEMsUUFBUSxHQUFHSCxZQUFZLENBQUNHLFFBQVE7SUFDdEMsTUFBTXZDLEtBQUssR0FBR3VDLFFBQVEsSUFBSUEsUUFBUSxDQUFDNEIsT0FBTyxLQUFLLFNBQVM7SUFDeEQsSUFBSW5FLEtBQUssSUFBSSxDQUFDbUMsY0FBYyxDQUFDcUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLEVBQUU7TUFDOUUsTUFBTVIsS0FBSyxHQUFHNUIsWUFBWSxJQUFJQSxZQUFZLENBQUNnQixZQUFZLElBQUloQixZQUFZLENBQUNnQixZQUFZLENBQUNhLFFBQVEsRUFBRTtNQUMvRixNQUFNN0csVUFBVSxHQUFHNEcsS0FBSyxJQUFJQSxLQUFLLENBQUNFLFlBQVksRUFBRTtNQUNoRCxJQUFJLENBQUM5RyxVQUFVLEVBQUU7UUFDaEIsT0FBTzBDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztNQUM3QjtNQUNBLElBQUksT0FBT3VFLG9CQUFvQixLQUFLLFFBQVEsSUFBSUEsb0JBQW9CLENBQUNqRCxZQUFZLEVBQUUsRUFBRTtRQUNwRixNQUFNYSxnQkFBZ0IsQ0FBQ0MsY0FBYyxFQUFFQyxZQUFZLEVBQUVoRixVQUFVLEVBQUVrSCxvQkFBb0IsQ0FBQ2pELFlBQVksRUFBRSxDQUFDO01BQ3RHLENBQUMsTUFBTTtRQUNOLE1BQU1hLGdCQUFnQixDQUFDQyxjQUFjLEVBQUVDLFlBQVksRUFBRWhGLFVBQVUsRUFBRWtILG9CQUFvQixDQUFDO01BQ3ZGO0lBQ0Q7SUFDQSxJQUFJLE9BQU9BLG9CQUFvQixLQUFLLFFBQVEsSUFBSUEsb0JBQW9CLENBQUNuRCxHQUFHLElBQUltRCxvQkFBb0IsQ0FBQ25ELEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO01BQy9ILElBQUltRCxvQkFBb0IsQ0FBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE1BQU0sSUFBSXBDLFlBQVksRUFBRTtRQUNuRTtRQUNBRyxRQUFRLENBQUNoQyxpQkFBaUIsQ0FBQzRCLGNBQWMsRUFBRSxZQUFZLEVBQUVtQyxvQkFBb0IsQ0FBQztRQUM5RUMsWUFBWSxHQUFHLEtBQUs7TUFDckI7SUFDRDtJQUNBLE9BQU96RSxPQUFPLENBQUNDLE9BQU8sQ0FBQ3dFLFlBQVksQ0FBQztFQUNyQyxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQW5KLHNCQUFzQixDQUFDcUosWUFBWSxHQUFHLGdCQUFnQnBDLGlCQUF5QixFQUFFRixjQUF5QixFQUFFQyxZQUFpQixFQUFFO0lBQzlILE1BQU1HLFFBQVEsR0FBR0gsWUFBWSxDQUFDRyxRQUFRO0lBQ3RDLE1BQU12QyxLQUFLLEdBQUd1QyxRQUFRLElBQUlBLFFBQVEsQ0FBQzRCLE9BQU8sS0FBSyxTQUFTO0lBQ3hELElBQUluRSxLQUFLLEVBQUU7TUFDVixNQUFNZ0UsS0FBSyxHQUFHNUIsWUFBWSxJQUFJQSxZQUFZLENBQUNnQixZQUFZLElBQUloQixZQUFZLENBQUNnQixZQUFZLENBQUNhLFFBQVEsRUFBRTtNQUMvRixNQUFNN0csVUFBVSxHQUFHNEcsS0FBSyxJQUFJQSxLQUFLLENBQUNFLFlBQVksRUFBRTtNQUNoRCxJQUFJLENBQUM5RyxVQUFVLEVBQUU7UUFDaEIsT0FBTzBDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztNQUM3QjtNQUNBLE1BQU1tQyxnQkFBZ0IsQ0FBQ0MsY0FBYyxFQUFFQyxZQUFZLEVBQUVoRixVQUFVLEVBQUVpRixpQkFBaUIsQ0FBQztJQUNwRjtJQUNBLE9BQU92QyxPQUFPLENBQUNDLE9BQU8sRUFBRTtFQUN6QixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQTNFLHNCQUFzQixDQUFDc0osZUFBZSxHQUFHLGdCQUFnQnJDLGlCQUF5QixFQUFFRixjQUFtQixFQUFFQyxZQUFpQixFQUFFO0lBQzNILElBQUksQ0FBQ0QsY0FBYyxDQUFDcUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLEVBQUU7TUFDckUsTUFBTWpDLFFBQVEsR0FBR0gsWUFBWSxDQUFDRyxRQUFRO01BQ3RDLE1BQU12QyxLQUFLLEdBQUd1QyxRQUFRLElBQUlBLFFBQVEsQ0FBQzRCLE9BQU8sS0FBSyxTQUFTO01BQ3hELElBQUluRSxLQUFLLEVBQUU7UUFDVixNQUFNZ0UsS0FBSyxHQUFHNUIsWUFBWSxJQUFJQSxZQUFZLENBQUNnQixZQUFZLElBQUloQixZQUFZLENBQUNnQixZQUFZLENBQUNhLFFBQVEsRUFBRTtRQUMvRixNQUFNN0csVUFBVSxHQUFHNEcsS0FBSyxJQUFJQSxLQUFLLENBQUNFLFlBQVksRUFBRTtRQUNoRCxJQUFJLENBQUM5RyxVQUFVLEVBQUU7VUFDaEIsT0FBTzBDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM3QjtRQUNBLE1BQU1tQyxnQkFBZ0IsQ0FBQ0MsY0FBYyxFQUFFQyxZQUFZLEVBQUVoRixVQUFVLEVBQUVpRixpQkFBaUIsQ0FBQztNQUNwRjtJQUNEO0lBQ0EsT0FBT3ZDLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO0VBQ3pCLENBQUM7RUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQTNFLHNCQUFzQixDQUFDdUosWUFBWSxHQUFHLGdCQUFnQkMsY0FBdUIsRUFBRTtJQUM5RSxPQUFPMUIsV0FBVyxDQUFDMkIsaUJBQWlCLENBQUNELGNBQWMsQ0FBQztFQUNyRCxDQUFDO0VBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQXhKLHNCQUFzQixDQUFDMkksWUFBWSxHQUFHLFVBQVUxQixpQkFBeUIsRUFBRUYsY0FBc0IsRUFBRTtJQUNsRyxPQUFPdkYsWUFBWSxDQUFDa0ksVUFBVSxDQUFDM0MsY0FBYyxDQUFDLENBQzVDbEMsSUFBSSxDQUFDLFVBQVU4RSxNQUFXLEVBQUU7TUFDNUIsT0FBTzNKLHNCQUFzQixDQUFDZ0osWUFBWSxDQUFDL0IsaUJBQWlCLEVBQUVGLGNBQWMsRUFBRTRDLE1BQU0sQ0FBQ2IsWUFBWSxFQUFFLEVBQUVwSCxTQUFTLENBQUM7SUFDaEgsQ0FBQyxDQUFDLENBQ0QyRCxLQUFLLENBQUMsVUFBVUMsTUFBVyxFQUFFO01BQzdCQyxHQUFHLENBQUNDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRUYsTUFBTSxDQUFDO01BQ2hELE9BQU8sSUFBSTtJQUNaLENBQUMsQ0FBQztFQUNKLENBQUM7RUFDRHRGLHNCQUFzQixDQUFDNEosd0JBQXdCLEdBQUcsVUFBVTNILGVBQW9CLEVBQUVELFVBQWUsRUFBRXdILGNBQW1CLEVBQUU7SUFDdkgsTUFBTUssV0FBVyxHQUFHN0gsVUFBVSxDQUFDOEgsU0FBUyxDQUFDN0gsZUFBZSxDQUFDO0lBQ3pELE1BQU04SCxhQUFhLEdBQUdQLGNBQWMsQ0FBQ3pELEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxHQUFHLElBQUksR0FBR3JFLFNBQVM7SUFDaEcsSUFBSSxDQUFDOEgsY0FBYyxJQUFJLENBQUNLLFdBQVcsRUFBRTtNQUNwQyxPQUFPLEVBQUU7SUFDVjtJQUNBLE1BQU1HLGlCQUFpQixHQUFHbEMsV0FBVyxDQUFDQyxzQkFBc0IsQ0FBQ3lCLGNBQWMsRUFBRXZILGVBQWUsQ0FBQztJQUM3RixNQUFNZ0ksY0FBYyxHQUFHaEosV0FBVyxDQUFDaUosZ0JBQWdCLENBQUNqSSxlQUFlLENBQUM7SUFFcEUsTUFBTWtJLGFBQWEsR0FBR3JDLFdBQVcsQ0FBQ3NDLHdCQUF3QixDQUFDWixjQUFjLEVBQUV2SCxlQUFlLEVBQUU4SCxhQUFhLENBQUM7SUFDMUcsSUFBSU0sa0JBQXlCLEdBQUcsRUFBRTtJQUNsQ0YsYUFBYSxDQUFDbEYsT0FBTyxDQUFDLFVBQVVxRixnQkFBcUIsRUFBRTtNQUN0RCxNQUFNQyxlQUFlLEdBQUdELGdCQUFnQixDQUFDRSxjQUFjO01BQ3ZELElBQUlELGVBQWUsRUFBRTtRQUFBO1FBQ3BCLE1BQU1FLG9CQUFvQixHQUFHVCxpQkFBaUIsQ0FBQ1UsaUJBQWlCLEVBQUUsQ0FBQ0MsV0FBVyxDQUFDSixlQUFlLENBQUMsQ0FBQ0ssTUFBTTtRQUN0RyxNQUFNQyxxQkFBcUIsR0FBR0MsWUFBWSxDQUFDQywwQkFBMEIsQ0FBQy9JLFVBQVUsRUFBRXVJLGVBQWUsQ0FBQztRQUNsRyxNQUFNUyxTQUFTLEdBQUdULGVBQWUsQ0FBQ3RILE9BQU8sQ0FBRSxHQUFFNEgscUJBQXNCLEdBQUUsRUFBRSxFQUFFLENBQUM7UUFDMUUsTUFBTTVDLFVBQVUsR0FBRytCLGlCQUFpQixDQUFDOUIsYUFBYSxFQUFFO1FBQ3BELE1BQU0rQyxlQUFlLDRCQUFHaEQsVUFBVSxDQUFDaUQsV0FBVyxvRkFBdEIsc0JBQXdCQyxFQUFFLDJEQUExQix1QkFBNEJDLGVBQWU7UUFDbkUsSUFDQ3BMLHNCQUFzQixDQUFDcUwsa0JBQWtCLENBQUNmLGdCQUFnQixFQUFFRyxvQkFBb0IsRUFBRVEsZUFBZSxDQUFDLElBQ2xHSyxvQkFBb0IsQ0FBQ3RKLFVBQVUsRUFBRTZJLHFCQUFxQixFQUFFOUgsZ0JBQWdCLENBQUNpSSxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDekY7VUFDRFgsa0JBQWtCLENBQUMvQixJQUFJLENBQUNnQyxnQkFBZ0IsQ0FBQztRQUMxQztNQUNELENBQUMsTUFBTTtRQUNOO1FBQ0FELGtCQUFrQixDQUFDL0IsSUFBSSxDQUFDZ0MsZ0JBQWdCLENBQUM7TUFDMUM7SUFDRCxDQUFDLENBQUM7SUFFRixNQUFNaUIsZ0JBQXVCLEdBQUcsRUFBRTtJQUNsQyxNQUFNQyxlQUFlLEdBQUdDLHNCQUFzQixDQUFDcEIsa0JBQWtCLEVBQUVMLGlCQUFpQixDQUFDO0lBQ3JGLE1BQU0wQixtQkFBMEIsR0FBRyxFQUFFO0lBQ3JDRixlQUFlLENBQUN2RyxPQUFPLENBQUMsVUFBVTBHLE1BQVcsRUFBRTtNQUM5QyxJQUFJQSxNQUFNLENBQUNqRSxHQUFHLEVBQUU7UUFDZmdFLG1CQUFtQixDQUFDcEQsSUFBSSxDQUFDcUQsTUFBTSxDQUFDakUsR0FBRyxDQUFDO01BQ3JDO0lBQ0QsQ0FBQyxDQUFDO0lBRUYyQyxrQkFBa0IsR0FBR0Esa0JBQWtCLENBQUN1QixNQUFNLENBQUMsVUFBVUMsS0FBVSxFQUFFO01BQ3BFLE9BQU9ILG1CQUFtQixDQUFDSSxRQUFRLENBQUNELEtBQUssQ0FBQ25FLEdBQUcsQ0FBQztJQUMvQyxDQUFDLENBQUM7SUFFRixNQUFNcUUsR0FBRyxHQUFHdkosV0FBVyxDQUFDd0osMkJBQTJCLENBQUMvQixjQUFjLEVBQUVqSSxVQUFVLENBQUM7TUFDOUVpSyxtQkFBbUIsR0FBR0YsR0FBRyxDQUFDRyx3QkFBd0I7SUFDbkQ7SUFDQVYsZUFBZSxDQUFDdkcsT0FBTyxDQUFDLFVBQVU0RyxLQUFLLEVBQUVNLGlCQUF5QixFQUFFO01BQ25FLE1BQU1DLFNBQVMsR0FBRy9CLGtCQUFrQixDQUFDOEIsaUJBQWlCLENBQVE7TUFDOUQsSUFBSSxDQUFDQyxTQUFTLElBQUksQ0FBQ0EsU0FBUyxDQUFDN0ksYUFBYSxFQUFFO1FBQzNDO01BQ0Q7TUFDQSxNQUFNbUMsYUFBYSxHQUFHM0MsZ0JBQWdCLENBQUNxSixTQUFTLENBQUM3SSxhQUFhLENBQUM7TUFDL0Q7TUFDQXNJLEtBQUssR0FBRzVMLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDMkwsS0FBSyxFQUFFO1FBQzVCUSxLQUFLLEVBQUVELFNBQVMsQ0FBQ0MsS0FBSztRQUN0QkMsVUFBVSxFQUFFRixTQUFTLENBQUNFLFVBQVU7UUFDaENDLElBQUksRUFBRUgsU0FBUyxDQUFDN0ksYUFBYTtRQUM3QmlKLE9BQU8sRUFBRSxJQUFJO1FBQ2JDLGtCQUFrQixFQUFFLEtBQUs7UUFDekJDLFlBQVksRUFBRTtNQUNmLENBQUMsQ0FBQzs7TUFFRjtNQUNBLElBQUlOLFNBQVMsQ0FBQzVCLGNBQWMsRUFBRTtRQUM3QixNQUFNRCxlQUFlLEdBQUc2QixTQUFTLENBQUM1QixjQUFjO1FBQ2hELE1BQU1tQyxTQUFTLEdBQUczSyxVQUFVLENBQUM4SCxTQUFTLENBQUNTLGVBQWUsQ0FBQztVQUN0REUsb0JBQW9CLEdBQUd6SSxVQUFVLENBQUM4SCxTQUFTLENBQUUsR0FBRVMsZUFBZ0IsR0FBRSxDQUFDO1VBQ2xFcUMsZ0JBQWdCLEdBQUc1SyxVQUFVLENBQUNWLG9CQUFvQixDQUFDaUosZUFBZSxDQUFDO1FBRXBFLE1BQU1zQyxtQkFBbUIsR0FDeEJwQyxvQkFBb0IsQ0FBQyw4REFBOEQsQ0FBQyxJQUNwRkEsb0JBQW9CLENBQUMsMERBQTBELENBQUMsSUFDaEZBLG9CQUFvQixDQUFDLDRDQUE0QyxDQUFDO1FBRW5FLE1BQU1JLHFCQUFxQixHQUFHQyxZQUFZLENBQUNDLDBCQUEwQixDQUFDL0ksVUFBVSxFQUFFb0ssU0FBUyxDQUFDNUIsY0FBYyxDQUFDO1FBQzNHLE1BQU1RLFNBQVMsR0FBR1QsZUFBZSxDQUFDdEgsT0FBTyxDQUFFLEdBQUU0SCxxQkFBc0IsR0FBRSxFQUFFLEVBQUUsQ0FBQztRQUMxRSxJQUFJaUMsNkJBQTZCO1FBQ2pDLElBQUlDLG1CQUFtQjtRQUN2QixJQUFJekIsb0JBQW9CLENBQUN0SixVQUFVLEVBQUU2SSxxQkFBcUIsRUFBRTlILGdCQUFnQixDQUFDaUksU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7VUFDL0Y4Qiw2QkFBNkIsR0FBR3JDLG9CQUFvQixDQUFDLG9EQUFvRCxDQUFDO1VBQzFHLElBQUlxQyw2QkFBNkIsRUFBRTtZQUNsQ0MsbUJBQW1CLEdBQUdELDZCQUE2QixDQUFFLElBQUdFLFlBQVksQ0FBQ0wsU0FBUyxDQUFDTSxLQUFLLENBQUUsRUFBQyxDQUFDO1VBQ3pGO1VBRUFwQixLQUFLLEdBQUc1TCxNQUFNLENBQUNDLE1BQU0sQ0FBQzJMLEtBQUssRUFBRTtZQUM1QlcsT0FBTyxFQUFFL0Isb0JBQW9CLENBQUMsMkNBQTJDLENBQUMsSUFBSS9JLFNBQVM7WUFDdkYrSyxrQkFBa0IsRUFBRUksbUJBQW1CO1lBQ3ZDSCxZQUFZLEVBQUVBLFlBQVksQ0FBQ0UsZ0JBQWdCLENBQUM5QyxTQUFTLEVBQUUsRUFBRTtjQUFFb0QsT0FBTyxFQUFFTjtZQUFpQixDQUFDLENBQUM7WUFDdkZPLHVCQUF1QixFQUFFSixtQkFBbUIsR0FDekMsQ0FDQTtjQUNDSyxTQUFTLEVBQUVoQixTQUFTLENBQUM3SSxhQUFhO2NBQ2xDOEosUUFBUSxFQUFFLElBQUk7Y0FDZEMsTUFBTSxFQUFFLENBQUNQLG1CQUFtQjtZQUM3QixDQUFDLENBQ0EsR0FDRHJMO1VBQ0osQ0FBQyxDQUFDO1FBQ0g7TUFDRDs7TUFFQTs7TUFFQSxJQUFJbUssS0FBSyxFQUFFO1FBQ1YsSUFBSUksbUJBQW1CLENBQUN2RyxhQUFhLENBQUMsSUFBSXVHLG1CQUFtQixDQUFDdkcsYUFBYSxDQUFDLENBQUNWLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDeEY2RyxLQUFLLENBQUMwQixnQkFBZ0IsR0FBRy9LLFdBQVcsQ0FBQ2dMLDRCQUE0QixDQUFDdkIsbUJBQW1CLENBQUN2RyxhQUFhLENBQUMsQ0FBQztRQUN0RyxDQUFDLE1BQU07VUFDTm1HLEtBQUssQ0FBQzBCLGdCQUFnQixHQUFHLE1BQU07UUFDaEM7UUFFQTFCLEtBQUssR0FBRzVMLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDMkwsS0FBSyxFQUFFO1VBQzVCNEIsT0FBTyxFQUFFckIsU0FBUyxDQUFDM0ksWUFBWSxLQUFLO1FBQ3JDLENBQUMsQ0FBQztNQUNIO01BRUErSCxlQUFlLENBQUNXLGlCQUFpQixDQUFDLEdBQUdOLEtBQUs7SUFDM0MsQ0FBQyxDQUFDO0lBQ0ZMLGVBQWUsQ0FBQ3ZHLE9BQU8sQ0FBQyxVQUFVeUksUUFBYSxFQUFFO01BQ2hELElBQUlBLFFBQVEsQ0FBQ25CLElBQUksS0FBSyxZQUFZLEVBQUU7UUFDbkNtQixRQUFRLENBQUNDLEtBQUssR0FBR0MsZ0JBQWdCLENBQUNwRSxjQUFjLENBQUMsQ0FBQ3FFLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQztNQUN0RjtNQUNBSCxRQUFRLENBQUNJLFVBQVUsR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUNOLFFBQVEsQ0FBQ08sUUFBUSxFQUFFUCxRQUFRLENBQUNRLGFBQWEsRUFBRVIsUUFBUSxDQUFDUyxXQUFXLENBQUM7TUFDN0dULFFBQVEsQ0FBQ0MsS0FBSyxHQUFHUyxnQkFBZ0IsQ0FBQ1YsUUFBUSxDQUFDQyxLQUFLLEVBQUVuRSxjQUFjLENBQUMsSUFBSSxFQUFFO01BQ3ZFLElBQUlrRSxRQUFRLENBQUNXLFdBQVcsRUFBRTtRQUN6QjlDLGdCQUFnQixDQUFDakQsSUFBSSxDQUFDb0YsUUFBUSxDQUFDL0YsSUFBSSxDQUFDO01BQ3JDO0lBQ0QsQ0FBQyxDQUFDO0lBRUYwQyxrQkFBa0IsR0FBR21CLGVBQWU7SUFDcENoSyxZQUFZLENBQUM4TSxhQUFhLENBQUM5RSxjQUFjLEVBQUUsWUFBWSxFQUFFK0IsZ0JBQWdCLENBQUM7SUFFMUUsT0FBT2xCLGtCQUFrQjtFQUMxQixDQUFDO0VBRUQsU0FBU2tFLDZCQUE2QixDQUFDbkosUUFBYSxFQUFFcEQsVUFBZSxFQUFFO0lBQUE7SUFDdEUsSUFBSW9ELFFBQVEsQ0FBQ1csR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQUU7TUFDakQsTUFBTXlJLGVBQWUsR0FBR3BKLFFBQVEsQ0FBQ3FKLFdBQVcsRUFBRSxDQUFDQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDdkUsUUFBUUYsZUFBZSxDQUFDQSxlQUFlLENBQUN4SixNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELEtBQU0sSUFBQyx5REFBaUQsRUFBQztRQUN6RCxLQUFNLElBQUMsZ0RBQXdDLEVBQUM7VUFDL0MsZ0NBQU9oRCxVQUFVLENBQ2Y4SCxTQUFTLENBQUMxRSxRQUFRLENBQUNxSixXQUFXLEVBQUUsQ0FBQyxDQUNqQ0UsY0FBYywwREFGVCxzQkFFV3RMLElBQUksQ0FBRXVMLGFBQWtCLElBQUtBLGFBQWEsQ0FBQ0MsZUFBZSxDQUFDL0MsUUFBUSxDQUFFLElBQUMscUNBQTZCLEVBQUMsQ0FBQyxDQUFDLENBQ3RIK0MsZUFBZTtRQUNsQixLQUFNLElBQUMscUNBQTZCLEVBQUM7VUFDcEMsTUFBTUMsU0FBUyxHQUFHMUosUUFBUSxDQUFDcUosV0FBVyxFQUFFLENBQUNDLEtBQUssQ0FBQyxHQUFHLENBQUM7VUFDbkQsT0FBT0ksU0FBUyxDQUFDQSxTQUFTLENBQUM5SixNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQUM7SUFFMUM7SUFDQSxPQUFPdEQsU0FBUztFQUNqQjtFQUVBMUIsc0JBQXNCLENBQUNxTCxrQkFBa0IsR0FBRyxVQUFVMEQsZUFBb0IsRUFBRUMsbUJBQXdCLEVBQUUvRCxlQUFnQyxFQUFFO0lBQUE7SUFDdkksTUFBTWdFLGdCQUFnQixHQUFHaEUsZUFBZSxhQUFmQSxlQUFlLHVCQUFmQSxlQUFlLENBQUV6RCxJQUFJLENBQUMsVUFBVTBILGNBQW1CLEVBQUU7TUFDN0UsSUFBSUEsY0FBYyxDQUFDQyxLQUFLLEtBQUtKLGVBQWUsQ0FBQ3JILEdBQUcsRUFBRTtRQUNqRCxPQUFPLElBQUk7TUFDWjtNQUNBLE9BQU8sS0FBSztJQUNiLENBQUMsQ0FBQztJQUNGLE9BQU91SCxnQkFBZ0IsSUFBSSwyQkFBQ0QsbUJBQW1CLENBQUM5RCxXQUFXLDRFQUEvQixzQkFBaUNDLEVBQUUsbURBQW5DLHVCQUFxQ2lFLGdCQUFnQjtFQUNsRixDQUFDO0VBRURwUCxzQkFBc0IsQ0FBQ2dKLFlBQVksR0FBRyxVQUNyQ3FHLGlCQUFzQixFQUN0QnRJLGNBQW1CLEVBQ25CL0UsVUFBZSxFQUNmcEIsU0FBYyxFQUNkME8sYUFBa0IsRUFDakI7SUFDRCxNQUFNM0wsWUFBWSxHQUFHL0MsU0FBUyxHQUFHQSxTQUFTLENBQUN1RixLQUFLLENBQUNZLGNBQWMsQ0FBQyxHQUFHQSxjQUFjLENBQUNaLEtBQUssRUFBRTtNQUN4RnpGLFNBQVMsR0FBR0UsU0FBUyxHQUFHLEVBQUUsR0FBRyxZQUFZO01BQ3pDdUMsZ0JBQWdCLEdBQUcyRSxXQUFXLENBQUNzQyx3QkFBd0IsQ0FDdERyRCxjQUFjLEVBQ2QsSUFBSSxFQUNKckYsU0FBUyxFQUNUTSxVQUFVLEVBQ1ZzTixhQUFhLEVBQ2IxTyxTQUFTLEVBQ1RBLFNBQVMsR0FBR2MsU0FBUyxHQUFHNk0sNkJBQTZCLENBQUN4SCxjQUFjLENBQUN3SSxTQUFTLEVBQUUsRUFBRXZOLFVBQVUsQ0FBQyxDQUM3RjtNQUNEc0IsZUFBZSxHQUFHdEQsc0JBQXNCLENBQUNrRCxtQkFBbUIsQ0FBQ0MsZ0JBQWdCLEVBQUVrTSxpQkFBaUIsQ0FBQztNQUNqRzNKLGFBQWEsR0FBRzNDLGdCQUFnQixDQUFDc00saUJBQWlCLENBQUM7TUFDbkRHLE1BQU0sR0FBRyxDQUFDLENBQUM1TyxTQUFTLElBQUlBLFNBQVMsQ0FBQ21JLE9BQU8sS0FBSyxTQUFTO0lBQ3hELElBQUlzRyxpQkFBaUIsS0FBS2pQLHdCQUF3QixFQUFFO01BQ25ELE9BQU9LLGtCQUFrQixDQUFDaUQsaUJBQWlCLENBQUNDLFlBQVksRUFBRyxHQUFFakQsU0FBVSxhQUFZLENBQUMsRUFBRXNCLFVBQVUsRUFBRXBCLFNBQVMsQ0FBQztJQUM3RyxDQUFDLE1BQU0sSUFBSXlPLGlCQUFpQixLQUFLaFAsb0JBQW9CLEVBQUU7TUFDdEQsT0FBT3FFLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM3QixDQUFDLE1BQU0sSUFBSXJCLGVBQWUsSUFBSUEsZUFBZSxDQUFDbU0sUUFBUSxFQUFFO01BQ3ZELE9BQU96UCxzQkFBc0IsQ0FBQzZCLHFCQUFxQixDQUNsRGtGLGNBQWMsRUFDZHJELGlCQUFpQixDQUFDQyxZQUFZLEVBQUcsR0FBRWpELFNBQVUsYUFBWSxDQUFDLEVBQzFENEMsZUFBZSxFQUNmdEIsVUFBVSxFQUNWcEIsU0FBUyxDQUNUO0lBQ0Y7SUFFQSxJQUFJMEMsZUFBZSxDQUFDb00sSUFBSSxLQUFLLE1BQU0sSUFBSTlPLFNBQVMsRUFBRTtNQUNqRCxPQUFPNkUsd0JBQXdCLENBQUNzQixjQUFjLEVBQUVuRyxTQUFTLEVBQUU4RSxhQUFhLENBQUM7SUFDMUU7SUFFQSxNQUFNaUssZUFBZSxHQUFHN0UsWUFBWSxDQUFDOEUsaUJBQWlCLENBQUNsSyxhQUFhLENBQUM7SUFDckUsTUFBTTZFLGVBQWUsR0FBR2pILGVBQWUsQ0FBQ2tILGNBQWM7SUFDdEQsSUFBSXZJLGVBQXVCO0lBQzNCLElBQUk0TixxQkFBcUI7SUFDekIsSUFBSTdMLFNBQWM7SUFDbEIsSUFBSThMLFlBQVk7SUFDaEIsSUFBSTdMLFdBQWdCO0lBRXBCLE9BQU9TLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFLENBQ3RCRSxJQUFJLENBQUMsWUFBWTtNQUNqQixJQUFJdkIsZUFBZSxDQUFDK0ssV0FBVyxFQUFFO1FBQ2hDLE9BQU85RCxlQUFlLENBQUN3RixNQUFNLENBQUMsQ0FBQyxFQUFFeEYsZUFBZSxDQUFDeUYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUN2RTtNQUNBLE9BQU94TyxZQUFZLENBQUNVLGFBQWEsQ0FBQzZFLGNBQWMsRUFBRSxZQUFZLEVBQUVuRyxTQUFTLENBQUM7SUFDM0UsQ0FBQyxDQUFDLENBQ0RpRSxJQUFJLENBQUMsVUFBVW9MLHdCQUE2QixFQUFFO01BQzlDaE8sZUFBZSxHQUFHZ08sd0JBQXdCO01BQzFDLE9BQU96TyxZQUFZLENBQUNVLGFBQWEsQ0FBQzZFLGNBQWMsRUFBRSxzQkFBc0IsRUFBRW5HLFNBQVMsQ0FBQztJQUNyRixDQUFDLENBQUMsQ0FDRGlFLElBQUksQ0FBQyxVQUFVcUwsOEJBQW1DLEVBQUU7TUFDcERMLHFCQUFxQixHQUFHSyw4QkFBOEI7TUFDdEQsTUFBTXRELGdCQUFnQixHQUFHNUssVUFBVSxDQUFDVixvQkFBb0IsQ0FBQ1csZUFBZSxHQUFHeUQsYUFBYSxDQUFDO01BQ3pGLE1BQU15SyxjQUFjLEdBQUd2UCxTQUFTLEdBQUdBLFNBQVMsQ0FBQ3VGLEtBQUssQ0FBQ1ksY0FBYyxDQUFDLEdBQUdBLGNBQWMsQ0FBQ1osS0FBSyxFQUFFO01BQzNGbkMsU0FBUyxHQUFHO1FBQ1g1QyxlQUFlLEVBQUU7VUFDaEJpQixXQUFXLEVBQUVMLFVBQVUsQ0FBQ1Ysb0JBQW9CLENBQUNXLGVBQWUsQ0FBQztVQUM3RG1PLFFBQVEsRUFBRXhEO1FBQ1gsQ0FBQztRQUNEckwsTUFBTSxFQUFFO1VBQ1BjLFdBQVcsRUFBRUwsVUFBVTtVQUN2Qm9PLFFBQVEsRUFBRXBPO1FBQ1gsQ0FBQztRQUNENEMsS0FBSyxFQUFFNEs7TUFDUixDQUFDO01BQ0RNLFlBQVksR0FBSSxJQUFHN08sV0FBVyxDQUFDaUosZ0JBQWdCLENBQUNqSSxlQUFlLENBQUMsQ0FDOUR5TSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQ1Y5QyxNQUFNLENBQUMzSyxXQUFXLENBQUNvUCx1QkFBdUIsQ0FBQyxDQUMzQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBRSxFQUFDO01BQ2JyTSxXQUFXLEdBQUc7UUFDYndDLGFBQWEsRUFBRWYsYUFBYTtRQUM1Qm9LLFlBQVksRUFBRUEsWUFBWTtRQUMxQlMsY0FBYyxFQUFFN1AsU0FBUyxHQUFHSixlQUFlO1FBQzNDOEUsUUFBUSxFQUFFMkIsY0FBYztRQUN4Qi9FLFVBQVUsRUFBRUEsVUFBVTtRQUN0QnBCLFNBQVMsRUFBRUEsU0FBUztRQUNwQkYsU0FBUyxFQUFFZ0QsaUJBQWlCLENBQUN5TSxjQUFjLEVBQUcsR0FBRXpQLFNBQVUsYUFBWSxFQUFFaVAsZUFBZSxDQUFDO1FBQ3hGeEwsV0FBVyxFQUFFVCxpQkFBaUIsQ0FBQ3lNLGNBQWMsRUFBRXpQLFNBQVMsR0FBR0osZUFBZSxDQUFDO1FBQzNFdUQsaUJBQWlCLEVBQUU4TCxlQUFlO1FBQ2xDbkwscUJBQXFCLEVBQUVxTCxxQkFBcUI7UUFDNUM3TCxTQUFTLEVBQUVWLGVBQWUsR0FBR0EsZUFBZSxDQUFDb0QsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUMxREMsWUFBWSxFQUFFckQsZUFBZSxHQUFHQSxlQUFlLENBQUNxRCxZQUFZLEdBQUdqRjtNQUNoRSxDQUFDO01BRUQsT0FBT0YsWUFBWSxDQUFDZ1Asa0JBQWtCLENBQUN2TSxXQUFXLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQ0RZLElBQUksQ0FBQyxVQUFVNEwsZ0JBQXFCLEVBQUU7TUFDdEMsSUFBSSxDQUFDQSxnQkFBZ0IsRUFBRTtRQUN0QixPQUFPMU0sa0JBQWtCLENBQUNDLFNBQVMsRUFBRUMsV0FBVyxDQUFDO01BQ2xEO01BQ0EsT0FBT1MsT0FBTyxDQUFDQyxPQUFPLEVBQUU7SUFDekIsQ0FBQyxDQUFDLENBQ0RFLElBQUksQ0FBQyxZQUFZO01BQ2pCLElBQUl5QixTQUFTO01BQ2IsSUFBSXJDLFdBQVcsQ0FBQzBDLFlBQVksRUFBRTtRQUM3QjtRQUNBTCxTQUFTLEdBQUk5RCxXQUFXLENBQUNDLGFBQWEsQ0FBQ3NFLGNBQWMsQ0FBQyxDQUFDcEUsYUFBYSxFQUFFLENBQW9CK04sYUFBYSxFQUFFO01BQzFHO01BQ0EsT0FBT3JLLG9CQUFvQixDQUFDckMsU0FBUyxFQUFFQyxXQUFXLEVBQUVxQyxTQUFTLENBQUM7SUFDL0QsQ0FBQyxDQUFDO0VBQ0osQ0FBQztFQUNELFNBQVNxSyxvQkFBb0IsQ0FBQzdPLFVBQWUsRUFBRTtJQUM5QztJQUNBLElBQUlBLFVBQVUsWUFBWThPLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFO01BQ3pDLE9BQU8sSUFBSTtJQUNaO0lBQ0EsT0FBT3JQLFlBQVksQ0FBQ1UsYUFBYSxDQUFDSixVQUFVLEVBQUV2QiwyQkFBMkIsQ0FBQztFQUMzRTtFQUNBLFNBQVN1USxvQkFBb0IsQ0FBQ2hQLFVBQWUsRUFBRXVJLGtCQUF1QixFQUFFO0lBQ3ZFO0lBQ0EsSUFBSXZJLFVBQVUsWUFBWThPLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFO01BQ3pDO0lBQ0Q7SUFDQXJQLFlBQVksQ0FBQzhNLGFBQWEsQ0FBQ3hNLFVBQVUsRUFBRXZCLDJCQUEyQixFQUFFOEosa0JBQWtCLENBQUM7RUFDeEY7RUFDQSxTQUFTMEcsb0NBQW9DLENBQUM5TyxlQUFvQixFQUFFRCxVQUFlLEVBQUVGLFVBQWUsRUFBRTtJQUNyRyxJQUFJdUksa0JBQWtCLEdBQUdzRyxvQkFBb0IsQ0FBQzdPLFVBQVUsQ0FBQztJQUN6RCxJQUFJa1AsZUFBZTtJQUVuQixJQUFJLENBQUMzRyxrQkFBa0IsRUFBRTtNQUN4QkEsa0JBQWtCLEdBQUdySyxzQkFBc0IsQ0FBQzRKLHdCQUF3QixDQUFDM0gsZUFBZSxFQUFFRCxVQUFVLEVBQUVGLFVBQVUsQ0FBQztNQUM3R3VJLGtCQUFrQixDQUFDcEYsT0FBTyxDQUFDLFVBQVVnTSxNQUFXLEVBQUU7UUFDakRELGVBQWUsR0FBRyxJQUFJO1FBQ3RCLElBQUlDLE1BQU0sQ0FBQzNFLFVBQVUsRUFBRTtVQUN0QjBFLGVBQWUsR0FBRzVDLGdCQUFnQixDQUFDNkMsTUFBTSxDQUFDM0UsVUFBVSxFQUFFeEssVUFBVSxDQUFDO1VBQ2pFbVAsTUFBTSxDQUFDM0UsVUFBVSxHQUFHMEUsZUFBZSxLQUFLLElBQUksR0FBR0MsTUFBTSxDQUFDM0UsVUFBVSxHQUFHMEUsZUFBZTtRQUNuRjtNQUNELENBQUMsQ0FBQztNQUNGM0csa0JBQWtCLENBQUM2RyxJQUFJLENBQUMsVUFBVUMsQ0FBTSxFQUFFQyxDQUFNLEVBQUU7UUFDakQsSUFBSUQsQ0FBQyxDQUFDN0UsVUFBVSxLQUFLNUssU0FBUyxJQUFJeVAsQ0FBQyxDQUFDN0UsVUFBVSxLQUFLLElBQUksRUFBRTtVQUN4RCxPQUFPLENBQUMsQ0FBQztRQUNWO1FBQ0EsSUFBSThFLENBQUMsQ0FBQzlFLFVBQVUsS0FBSzVLLFNBQVMsSUFBSTBQLENBQUMsQ0FBQzlFLFVBQVUsS0FBSyxJQUFJLEVBQUU7VUFDeEQsT0FBTyxDQUFDO1FBQ1Q7UUFDQSxPQUFPNkUsQ0FBQyxDQUFDN0UsVUFBVSxDQUFDK0UsYUFBYSxDQUFDRCxDQUFDLENBQUM5RSxVQUFVLENBQUM7TUFDaEQsQ0FBQyxDQUFDO01BQ0Z3RSxvQkFBb0IsQ0FBQ2hQLFVBQVUsRUFBRXVJLGtCQUFrQixDQUFDO0lBQ3JEO0lBQ0EsT0FBT0Esa0JBQWtCO0VBQzFCO0VBQ0FySyxzQkFBc0IsQ0FBQ3NSLGVBQWUsR0FBRyxVQUFVeFAsVUFBZSxFQUFFO0lBQ25FLE1BQU1HLGVBQWUsR0FBR1QsWUFBWSxDQUFDVSxhQUFhLENBQUNKLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDNUUsT0FBT04sWUFBWSxDQUFDa0ksVUFBVSxDQUFDNUgsVUFBVSxDQUFDLENBQUMrQyxJQUFJLENBQUMsVUFBVThFLE1BQVcsRUFBRTtNQUN0RSxJQUFJLENBQUNBLE1BQU0sRUFBRTtRQUNaLE9BQU8sRUFBRTtNQUNWO01BQ0EsT0FBT29ILG9DQUFvQyxDQUFDOU8sZUFBZSxFQUFFMEgsTUFBTSxDQUFDYixZQUFZLEVBQUUsRUFBRWhILFVBQVUsQ0FBQztNQUMvRjtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtJQUNELENBQUMsQ0FBQztFQUNILENBQUM7O0VBQ0Q5QixzQkFBc0IsQ0FBQ3VSLFdBQVcsR0FBRyxZQUFZO0lBQ2hELE9BQU94RCxRQUFRO0VBQ2hCLENBQUM7RUFBQyxPQUVhL04sc0JBQXNCO0FBQUEifQ==