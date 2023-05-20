/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/chart/ChartHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/ui/mdc/library", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/odata/v4/vizChart/ChartDelegate", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "../filterBar/FilterBarDelegate"], function (Log, merge, CommonUtils, MetaModelFunction, ResourceModelHelper, ChartHelper, ChartUtils, CommonHelper, MacrosDelegateUtil, FilterUtils, MDCLib, DelegateUtil, BaseChartDelegate, Filter, FilterOperator, FilterBarDelegate) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  var isMultiValueFilterExpression = MetaModelFunction.isMultiValueFilterExpression;
  var getSortRestrictionsInfo = MetaModelFunction.getSortRestrictionsInfo;
  var getFilterRestrictionsInfo = MetaModelFunction.getFilterRestrictionsInfo;
  const ChartItemRoleType = MDCLib.ChartItemRoleType;
  // /**
  //  * Helper class for sap.ui.mdc.Chart.
  //  * <h3><b>Note:</b></h3>
  //  * The class is experimental and the API/behaviour is not finalised
  //  * and hence this should not be used for productive usage.
  //  * Especially this class is not intended to be used for the FE scenario,
  //  * here we shall use sap.fe.macros.ChartDelegate that is especially tailored for V4
  //  * meta model
  //  *
  //  * @author SAP SE
  //  * @private
  //  * @experimental
  //  * @since 1.62
  //  * @alias sap.fe.macros.ChartDelegate
  //  */
  const ChartDelegate = Object.assign({}, BaseChartDelegate);
  ChartDelegate._setChartNoDataText = function (oChart, oBindingInfo) {
    let sNoDataKey = "";
    const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart),
      suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
    const _getNoDataTextWithFilters = function () {
      if (oChart.data("multiViews")) {
        return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
      } else {
        return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
      }
    };
    if (oChart.getFilter()) {
      if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
      }
    } else if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
      sNoDataKey = _getNoDataTextWithFilters();
    } else {
      sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
    }
    oChart.setNoDataText(getResourceModel(oChart).getText(sNoDataKey, undefined, suffixResourceKey));
  };
  ChartDelegate._handleProperty = function (oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties, sCriticality) {
    const oApplySupported = CommonHelper.parseCustomData(oMDCChart.data("applySupported"));
    const sortRestrictionsInfo = getSortRestrictionsInfo(mEntitySetAnnotations);
    const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
    const oFilterRestrictionsInfo = getFilterRestrictionsInfo(oFilterRestrictions);
    const oObj = this.getModel().getObject(this.getPath());
    const sKey = this.getModel().getObject(`${this.getPath()}@sapui.name`);
    const oMetaModel = this.getModel();
    const aModes = oMDCChart.getP13nMode();
    checkForNonfilterableEntitySet(oMDCChart, aModes);
    if (oObj && oObj.$kind === "Property") {
      // ignore (as for now) all complex properties
      // not clear if they might be nesting (complex in complex)
      // not clear how they are represented in non-filterable annotation
      // etc.
      if (oObj.$isCollection) {
        //Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
        return;
      }
      const oPropertyAnnotations = oMetaModel.getObject(`${this.getPath()}@`);
      const sPath = oMetaModel.getObject("@sapui.name", oMetaModel.getMetaContext(this.getPath()));
      const aGroupableProperties = oApplySupported && oApplySupported.GroupableProperties;
      const aAggregatableProperties = oApplySupported && oApplySupported.AggregatableProperties;
      let bGroupable = aGroupableProperties ? checkPropertyType(aGroupableProperties, sPath) : false;
      let bAggregatable = aAggregatableProperties ? checkPropertyType(aAggregatableProperties, sPath) : false;
      if (!aGroupableProperties || aGroupableProperties && !aGroupableProperties.length) {
        bGroupable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"];
      }
      if (!aAggregatableProperties || aAggregatableProperties && !aAggregatableProperties.length) {
        bAggregatable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"];
      }

      //Right now: skip them, since we can't create a chart from it
      if (!bGroupable && !bAggregatable) {
        return;
      }
      checkPropertyIsBothGroupableAndAggregatable(mCustomAggregates, sKey, bGroupable, bAggregatable);
      if (bAggregatable) {
        const aAggregateProperties = ChartDelegate._createPropertyInfosForAggregatable(oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates);
        aAggregateProperties.forEach(function (oAggregateProperty) {
          aProperties.push(oAggregateProperty);
        });
        //Add transformation aggregated properties to chart properties
        if (aModes && aModes.includes("Filter")) {
          const aKnownAggregatableProps = Object.keys(mKnownAggregatableProps);
          const aGroupablePropertiesValues = aGroupableProperties.map(oProperty => oProperty.$PropertyPath);
          aKnownAggregatableProps.forEach(sProperty => {
            // Add transformation aggregated property to chart so that in the filter dropdown it's visible
            // Also mark visibility false as this property should not come up in under chart section of personalization dialog
            if (!aGroupablePropertiesValues.includes(sProperty)) {
              aProperties = addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, false, true, undefined, true);
            }
          });
        }
      }
      if (bGroupable) {
        const sName = sKey || "",
          sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null;
        let bIsNavigationText = false;
        if (sName && sName.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Property: ${sName} from an association cannot be used`);
          return;
        }
        if (sTextProperty && sTextProperty.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Text Property: ${sTextProperty} from an association cannot be used`);
          bIsNavigationText = true;
        }
        aProperties = addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, true, false, bIsNavigationText);
      }
    }
  };

  // create properties for chart
  function addPropertyToChart(aProperties, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, oMDCChart, sCriticality, oObj, bIsGroupable, bIsAggregatable, bIsNavigationText, bIsHidden) {
    aProperties.push({
      name: "_fe_groupable_" + sKey,
      propertyPath: sKey,
      label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
      sortable: ChartDelegate._getSortable(oMDCChart, sortRestrictionsInfo.propertyInfo[sKey], false),
      filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
      groupable: bIsGroupable,
      aggregatable: bIsAggregatable,
      maxConditions: isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
      sortKey: sKey,
      path: sKey,
      role: ChartItemRoleType.category,
      //standard, normally this should be interpreted from UI.Chart annotation
      criticality: sCriticality,
      //To be implemented by FE
      typeConfig: oObj.typeConfig,
      visible: bIsHidden ? !bIsHidden : true,
      textProperty: !bIsNavigationText && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null,
      //To be implemented by FE
      textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
    });
    return aProperties;
  }

  // If entityset is non filterable,then from p13n modes remove Filter so that on UI filter option doesn't show up
  function checkForNonfilterableEntitySet(oMDCChart, aModes) {
    var _oMDCChart$getModel, _oMDCChart$getModel$g, _oMDCChart$getModel$g2;
    const bEntitySetFilerable = oMDCChart === null || oMDCChart === void 0 ? void 0 : (_oMDCChart$getModel = oMDCChart.getModel()) === null || _oMDCChart$getModel === void 0 ? void 0 : (_oMDCChart$getModel$g = _oMDCChart$getModel.getMetaModel()) === null || _oMDCChart$getModel$g === void 0 ? void 0 : (_oMDCChart$getModel$g2 = _oMDCChart$getModel$g.getObject(`${oMDCChart.data("targetCollectionPath")}@Org.OData.Capabilities.V1.FilterRestrictions`)) === null || _oMDCChart$getModel$g2 === void 0 ? void 0 : _oMDCChart$getModel$g2.Filterable;
    if (bEntitySetFilerable !== undefined && !bEntitySetFilerable) {
      aModes = aModes.filter(item => item !== "Filter");
      oMDCChart.setP13nMode(aModes);
    }
  }

  //  check if Groupable /Aggregatable property is present or not
  function checkPropertyType(aProperties, sPath) {
    if (aProperties.length) {
      for (const element of aProperties) {
        var _element$Property;
        if ((element === null || element === void 0 ? void 0 : element.$PropertyPath) === sPath || (element === null || element === void 0 ? void 0 : (_element$Property = element.Property) === null || _element$Property === void 0 ? void 0 : _element$Property.$PropertyPath) === sPath) {
          return true;
        }
      }
    }
  }

  //If same custom property is configured as groupable and aggregatable throw an error
  function checkPropertyIsBothGroupableAndAggregatable(mCustomAggregates, sKey, bGroupable, bAggregatable) {
    const customProperties = Object.keys(mCustomAggregates);
    if (bGroupable && bAggregatable && customProperties.includes(sKey)) {
      throw new Error("Same property can not be configured as groupable and aggregatable");
    }
  }
  ChartDelegate.formatText = function (oValue1, oValue2) {
    const oTextArrangementAnnotation = this.textFormatter;
    if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
      return `${oValue2} (${oValue1})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
      return `${oValue1} (${oValue2})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
      return oValue2;
    }
    return oValue2 ? oValue2 : oValue1;
  };
  ChartDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
    ChartDelegate._setChartNoDataText(oChart, oBindingInfo);
    const oFilter = sap.ui.getCore().byId(oChart.getFilter());
    const mConditions = oChart.getConditions();
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    if (oFilter) {
      // Search
      const oInfo = FilterUtils.getFilterInfo(oFilter, {});
      const oApplySupported = CommonHelper.parseCustomData(oChart.data("applySupported"));
      if (oApplySupported && oApplySupported.enableSearch && oInfo.search) {
        oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oInfo.search);
      } else if (oBindingInfo.parameters.$search) {
        delete oBindingInfo.parameters.$search;
      }
    }
    const sParameterPath = mConditions ? DelegateUtil.getParametersInfo(oFilter, mConditions) : null;
    if (sParameterPath) {
      oBindingInfo.path = sParameterPath;
    }
    const oFilterInfo = ChartUtils.getAllFilterInfo(oChart);

    // remove prefixes so that entityset will match with the property names with these field
    if (oFilterInfo.filters) {
      oFilterInfo.filters = CommonUtils.getChartPropertiesWithoutPrefixes(oFilterInfo.filters);
    }
    oBindingInfo.filters = oFilterInfo.filters.length > 0 ? new Filter({
      filters: oFilterInfo.filters,
      and: true
    }) : null;
    oBindingInfo.sorter = this.getSorters(oChart);
    ChartDelegate._checkAndAddDraftFilter(oChart, oBindingInfo);
  };
  ChartDelegate.fetchProperties = function (oMDCChart) {
    const oModel = this._getModel(oMDCChart);
    let pCreatePropertyInfos;
    if (!oModel) {
      pCreatePropertyInfos = new Promise(resolve => {
        oMDCChart.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, this);
      }).then(oRetrievedModel => {
        return this._createPropertyInfos(oMDCChart, oRetrievedModel);
      });
    } else {
      pCreatePropertyInfos = this._createPropertyInfos(oMDCChart, oModel);
    }
    return pCreatePropertyInfos.then(function (aProperties) {
      if (oMDCChart.data) {
        oMDCChart.data("$mdcChartPropertyInfo", aProperties);
        // store the properties to fetch during p13n calculation
        MacrosDelegateUtil.setCachedProperties(oMDCChart, aProperties);
      }
      return aProperties;
    });
  };
  function onModelContextChange(oEvent, oData) {
    const oMDCChart = oEvent.getSource();
    const oModel = this._getModel(oMDCChart);
    if (oModel) {
      oMDCChart.detachModelContextChange(onModelContextChange);
      oData.resolver(oModel);
    }
  }
  ChartDelegate._createPropertyInfos = async function (oMDCChart, oModel) {
    const sEntitySetPath = `/${oMDCChart.data("entitySet")}`;
    const oMetaModel = oModel.getMetaModel();
    const aResults = await Promise.all([oMetaModel.requestObject(`${sEntitySetPath}/`), oMetaModel.requestObject(`${sEntitySetPath}@`)]);
    const aProperties = [];
    let oEntityType = aResults[0];
    const mEntitySetAnnotations = aResults[1];
    oEntityType = allowedPropertiesForFilterOption(oEntityType, oMDCChart);
    const mCustomAggregates = CommonHelper.parseCustomData(oMDCChart.data("customAgg"));
    getCustomAggregate(mCustomAggregates, oMDCChart);
    let sAnno;
    const aPropertyPromise = [];
    for (const sAnnoKey in mEntitySetAnnotations) {
      if (sAnnoKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
        sAnno = sAnnoKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
        const aAnno = sAnno.split("@");
        if (aAnno.length == 2 && aAnno[1] == "com.sap.vocabularies.Common.v1.Label") {
          mCustomAggregates[aAnno[0]] = mEntitySetAnnotations[sAnnoKey];
        }
      }
    }
    const mTypeAggregatableProps = CommonHelper.parseCustomData(oMDCChart.data("transAgg"));
    const mKnownAggregatableProps = {};
    for (const sAggregatable in mTypeAggregatableProps) {
      const sPropKey = mTypeAggregatableProps[sAggregatable].propertyPath;
      mKnownAggregatableProps[sPropKey] = mKnownAggregatableProps[sPropKey] || {};
      mKnownAggregatableProps[sPropKey][mTypeAggregatableProps[sAggregatable].aggregationMethod] = {
        name: mTypeAggregatableProps[sAggregatable].name,
        label: mTypeAggregatableProps[sAggregatable].label
      };
    }
    for (const sKey in oEntityType) {
      if (sKey.indexOf("$") !== 0) {
        aPropertyPromise.push(ChartHelper.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(`${sEntitySetPath}/${sKey}`)).then(ChartDelegate._handleProperty.bind(oMetaModel.getMetaContext(`${sEntitySetPath}/${sKey}`), oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties)));
      }
    }
    await Promise.all(aPropertyPromise);
    return aProperties;
  };

  // for every property of chart, configure the typeConfig which we would like to see in the filter dropdrown list
  function allowedPropertiesForFilterOption(oEntityType, oMDCChart) {
    for (const i in oEntityType) {
      if (i == "$Key" || i == "$kind" || i == "SAP_Message") {
        continue;
      } else if (oEntityType[i]["$kind"] == "Property") {
        oEntityType[i]["typeConfig"] = oMDCChart.getTypeUtil().getTypeConfig(oEntityType[i].$Type);
      } else {
        oEntityType[i]["typeConfig"] = null;
      }
    }
    return oEntityType;
  }
  function getCustomAggregate(mCustomAggregates, oMDCChart) {
    const aDimensions = [],
      aMeasures = [];
    if (mCustomAggregates && Object.keys(mCustomAggregates).length >= 1) {
      const aChartItems = oMDCChart.getItems();
      for (const key in aChartItems) {
        if (aChartItems[key].getType() === "groupable") {
          aDimensions.push(ChartDelegate.getInternalChartNameFromPropertyNameAndKind(aChartItems[key].getName(), "groupable"));
        } else if (aChartItems[key].getType() === "aggregatable") {
          aMeasures.push(ChartDelegate.getInternalChartNameFromPropertyNameAndKind(aChartItems[key].getName(), "aggregatable"));
        }
      }
      if (aMeasures.filter(function (val) {
        return aDimensions.indexOf(val) != -1;
      }).length >= 1) {
        Log.error("Dimension and Measure has the sameProperty Configured");
      }
    }
  }
  ChartDelegate._createPropertyInfosForAggregatable = function (oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates) {
    const aAggregateProperties = [];
    if (Object.keys(mKnownAggregatableProps).indexOf(sKey) > -1) {
      for (const sAggregatable in mKnownAggregatableProps[sKey]) {
        aAggregateProperties.push({
          name: "_fe_aggregatable_" + mKnownAggregatableProps[sKey][sAggregatable].name,
          propertyPath: sKey,
          label: mKnownAggregatableProps[sKey][sAggregatable].label || `${oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"]} (${sAggregatable})` || `${sKey} (${sAggregatable})`,
          sortable: sortRestrictionsInfo.propertyInfo[sKey] ? sortRestrictionsInfo.propertyInfo[sKey].sortable : true,
          filterable: false,
          groupable: false,
          aggregatable: true,
          path: sKey,
          aggregationMethod: sAggregatable,
          maxConditions: isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
          role: ChartItemRoleType.axis1,
          datapoint: null //To be implemented by FE
        });
      }
    }

    if (Object.keys(mCustomAggregates).indexOf(sKey) > -1) {
      for (const sCustom in mCustomAggregates) {
        if (sCustom === sKey) {
          const oItem = merge({}, mCustomAggregates[sCustom], {
            name: "_fe_aggregatable_" + sCustom,
            groupable: false,
            aggregatable: true,
            filterable: false,
            role: ChartItemRoleType.axis1,
            propertyPath: sCustom,
            datapoint: null //To be implemented by FE
          });

          aAggregateProperties.push(oItem);
          break;
        }
      }
    }
    return aAggregateProperties;
  };
  ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    const sSearch = oBindingInfo.parameters.$search;
    if (sSearch) {
      delete oBindingInfo.parameters.$search;
    }
    BaseChartDelegate.rebind(oMDCChart, oBindingInfo);
    if (sSearch) {
      const oInnerChart = oMDCChart.getControlDelegate().getInnerChart(oMDCChart),
        oChartBinding = oInnerChart && oInnerChart.getBinding("data");

      // Temporary workaround until this is fixed in MDCChart / UI5 Chart
      // In order to avoid having 2 OData requests, we need to suspend the binding before setting some aggregation properties
      // and resume it once the chart has added other aggregation properties (in onBeforeRendering)
      oChartBinding.suspend();
      oChartBinding.setAggregation({
        search: sSearch
      });
      const oInnerChartDelegate = {
        onBeforeRendering: function () {
          oChartBinding.resume();
          oInnerChart.removeEventDelegate(oInnerChartDelegate);
        }
      };
      oInnerChart.addEventDelegate(oInnerChartDelegate);
    }
    oMDCChart.fireEvent("bindingUpdated");
  };
  ChartDelegate._setChart = function (oMDCChart, oInnerChart) {
    const oChartAPI = oMDCChart.getParent();
    oInnerChart.setVizProperties(oMDCChart.data("vizProperties"));
    oInnerChart.detachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.setSelectionMode(oMDCChart.getPayload().selectionMode.toUpperCase());
    BaseChartDelegate._setChart(oMDCChart, oInnerChart);
  };
  ChartDelegate._getBindingInfo = function (oMDCChart) {
    if (this._getBindingInfoFromState(oMDCChart)) {
      return this._getBindingInfoFromState(oMDCChart);
    }
    const oMetadataInfo = oMDCChart.getDelegate().payload;
    const oMetaModel = oMDCChart.getModel() && oMDCChart.getModel().getMetaModel();
    const sTargetCollectionPath = oMDCChart.data("targetCollectionPath");
    const sEntitySetPath = (oMetaModel.getObject(`${sTargetCollectionPath}/$kind`) !== "NavigationProperty" ? "/" : "") + oMetadataInfo.contextPath;
    const oParams = merge({}, oMetadataInfo.parameters, {
      entitySet: oMDCChart.data("entitySet")
    });
    return {
      path: sEntitySetPath,
      events: {
        dataRequested: oMDCChart.getParent().onInternalDataRequested.bind(oMDCChart.getParent())
      },
      parameters: oParams
    };
  };
  ChartDelegate.removeItemFromInnerChart = function (oMDCChart, oMDCChartItem) {
    BaseChartDelegate.removeItemFromInnerChart.call(this, oMDCChart, oMDCChartItem);
    if (oMDCChartItem.getType() === "groupable") {
      const oInnerChart = this._getChart(oMDCChart);
      oInnerChart.fireDeselectData();
    }
  };
  ChartDelegate._getSortable = function (oMDCChart, sortRestrictionsProperty, bIsTransAggregate) {
    if (bIsTransAggregate) {
      if (oMDCChart.data("draftSupported") === "true") {
        return false;
      } else {
        return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
      }
    }
    return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
  };
  ChartDelegate._checkAndAddDraftFilter = function (oChart, oBindingInfo) {
    if (oChart.data("draftSupported") === "true") {
      if (!oBindingInfo) {
        oBindingInfo = {};
      }
      if (!oBindingInfo.filters) {
        oBindingInfo.filters = [];
        oBindingInfo.filters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      } else {
        var _oBindingInfo$filters, _oBindingInfo$filters2;
        (_oBindingInfo$filters = oBindingInfo.filters) === null || _oBindingInfo$filters === void 0 ? void 0 : (_oBindingInfo$filters2 = _oBindingInfo$filters.aFilters) === null || _oBindingInfo$filters2 === void 0 ? void 0 : _oBindingInfo$filters2.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      }
    }
  };

  /**
   * This function returns an ID which should be used in the internal chart for the measure or dimension.
   * For standard cases, this is just the ID of the property.
   * If it is necessary to use another ID internally inside the chart (e.g. on duplicate property IDs) this method can be overwritten.
   * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
   *
   * @param {string} name ID of the property
   * @param {string} kind Type of the property (measure or dimension)
   * @returns {string} Internal ID for the sap.chart.Chart
   */
  ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function (name, kind) {
    return name.replace("_fe_" + kind + "_", "");
  };

  /**
   * This maps an id of an internal chart dimension or measure & type of a property to its corresponding property entry.
   *
   * @param {string} name ID of internal chart measure or dimension
   * @param {string} kind The kind of property that is used
   * @param {sap.ui.mdc.Chart} mdcChart Reference to the MDC_Chart
   * @returns {object} PropertyInfo object
   */
  ChartDelegate.getPropertyFromNameAndKind = function (name, kind, mdcChart) {
    return mdcChart.getPropertyHelper().getProperty("_fe_" + kind + "_" + name);
  };

  /**
   * Provide the chart's filter delegate to provide basic filter functionality such as adding FilterFields.
   *
   * @returns Object for the personalization of the chart filter
   */
  ChartDelegate.getFilterDelegate = function () {
    return Object.assign({}, FilterBarDelegate, {
      addItem: function (sPropertyInfoName, oParentControl) {
        const prop = ChartDelegate.getInternalChartNameFromPropertyNameAndKind(sPropertyInfoName, "groupable");
        return FilterBarDelegate.addItem(prop, oParentControl).then(oFilterItem => {
          oFilterItem === null || oFilterItem === void 0 ? void 0 : oFilterItem.bindProperty("conditions", {
            path: "$filters>/conditions/" + sPropertyInfoName
          });
          return oFilterItem;
        });
      }
    });
  };
  return ChartDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEl0ZW1Sb2xlVHlwZSIsIk1EQ0xpYiIsIkNoYXJ0RGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJCYXNlQ2hhcnREZWxlZ2F0ZSIsIl9zZXRDaGFydE5vRGF0YVRleHQiLCJvQ2hhcnQiLCJvQmluZGluZ0luZm8iLCJzTm9EYXRhS2V5Iiwib0NoYXJ0RmlsdGVySW5mbyIsIkNoYXJ0VXRpbHMiLCJnZXRBbGxGaWx0ZXJJbmZvIiwic3VmZml4UmVzb3VyY2VLZXkiLCJwYXRoIiwic3RhcnRzV2l0aCIsInN1YnN0ciIsIl9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMiLCJkYXRhIiwiZ2V0RmlsdGVyIiwic2VhcmNoIiwiZmlsdGVycyIsImxlbmd0aCIsInNldE5vRGF0YVRleHQiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsInVuZGVmaW5lZCIsIl9oYW5kbGVQcm9wZXJ0eSIsIm9NRENDaGFydCIsIm1FbnRpdHlTZXRBbm5vdGF0aW9ucyIsIm1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzIiwibUN1c3RvbUFnZ3JlZ2F0ZXMiLCJhUHJvcGVydGllcyIsInNDcml0aWNhbGl0eSIsIm9BcHBseVN1cHBvcnRlZCIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsInNvcnRSZXN0cmljdGlvbnNJbmZvIiwiZ2V0U29ydFJlc3RyaWN0aW9uc0luZm8iLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwib0ZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvIiwib09iaiIsImdldE1vZGVsIiwiZ2V0T2JqZWN0IiwiZ2V0UGF0aCIsInNLZXkiLCJvTWV0YU1vZGVsIiwiYU1vZGVzIiwiZ2V0UDEzbk1vZGUiLCJjaGVja0Zvck5vbmZpbHRlcmFibGVFbnRpdHlTZXQiLCIka2luZCIsIiRpc0NvbGxlY3Rpb24iLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsInNQYXRoIiwiZ2V0TWV0YUNvbnRleHQiLCJhR3JvdXBhYmxlUHJvcGVydGllcyIsIkdyb3VwYWJsZVByb3BlcnRpZXMiLCJhQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJiR3JvdXBhYmxlIiwiY2hlY2tQcm9wZXJ0eVR5cGUiLCJiQWdncmVnYXRhYmxlIiwiY2hlY2tQcm9wZXJ0eUlzQm90aEdyb3VwYWJsZUFuZEFnZ3JlZ2F0YWJsZSIsImFBZ2dyZWdhdGVQcm9wZXJ0aWVzIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3NGb3JBZ2dyZWdhdGFibGUiLCJmb3JFYWNoIiwib0FnZ3JlZ2F0ZVByb3BlcnR5IiwicHVzaCIsImluY2x1ZGVzIiwiYUtub3duQWdncmVnYXRhYmxlUHJvcHMiLCJrZXlzIiwiYUdyb3VwYWJsZVByb3BlcnRpZXNWYWx1ZXMiLCJtYXAiLCJvUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwic1Byb3BlcnR5IiwiYWRkUHJvcGVydHlUb0NoYXJ0Iiwic05hbWUiLCJzVGV4dFByb3BlcnR5IiwiJFBhdGgiLCJiSXNOYXZpZ2F0aW9uVGV4dCIsImluZGV4T2YiLCJMb2ciLCJlcnJvciIsImJJc0dyb3VwYWJsZSIsImJJc0FnZ3JlZ2F0YWJsZSIsImJJc0hpZGRlbiIsIm5hbWUiLCJwcm9wZXJ0eVBhdGgiLCJsYWJlbCIsInNvcnRhYmxlIiwiX2dldFNvcnRhYmxlIiwicHJvcGVydHlJbmZvIiwiZmlsdGVyYWJsZSIsImdyb3VwYWJsZSIsImFnZ3JlZ2F0YWJsZSIsIm1heENvbmRpdGlvbnMiLCJpc011bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uIiwic29ydEtleSIsInJvbGUiLCJjYXRlZ29yeSIsImNyaXRpY2FsaXR5IiwidHlwZUNvbmZpZyIsInZpc2libGUiLCJ0ZXh0UHJvcGVydHkiLCJ0ZXh0Rm9ybWF0dGVyIiwiYkVudGl0eVNldEZpbGVyYWJsZSIsImdldE1ldGFNb2RlbCIsIkZpbHRlcmFibGUiLCJmaWx0ZXIiLCJpdGVtIiwic2V0UDEzbk1vZGUiLCJlbGVtZW50IiwiUHJvcGVydHkiLCJjdXN0b21Qcm9wZXJ0aWVzIiwiRXJyb3IiLCJmb3JtYXRUZXh0Iiwib1ZhbHVlMSIsIm9WYWx1ZTIiLCJvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIiRFbnVtTWVtYmVyIiwidXBkYXRlQmluZGluZ0luZm8iLCJvRmlsdGVyIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiYnlJZCIsIm1Db25kaXRpb25zIiwiZ2V0Q29uZGl0aW9ucyIsIm9JbmZvIiwiRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXJJbmZvIiwiZW5hYmxlU2VhcmNoIiwicGFyYW1ldGVycyIsIiRzZWFyY2giLCJDb21tb25VdGlscyIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iLCJzUGFyYW1ldGVyUGF0aCIsIkRlbGVnYXRlVXRpbCIsImdldFBhcmFtZXRlcnNJbmZvIiwib0ZpbHRlckluZm8iLCJnZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMiLCJGaWx0ZXIiLCJhbmQiLCJzb3J0ZXIiLCJnZXRTb3J0ZXJzIiwiX2NoZWNrQW5kQWRkRHJhZnRGaWx0ZXIiLCJmZXRjaFByb3BlcnRpZXMiLCJvTW9kZWwiLCJfZ2V0TW9kZWwiLCJwQ3JlYXRlUHJvcGVydHlJbmZvcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYXR0YWNoTW9kZWxDb250ZXh0Q2hhbmdlIiwicmVzb2x2ZXIiLCJvbk1vZGVsQ29udGV4dENoYW5nZSIsInRoZW4iLCJvUmV0cmlldmVkTW9kZWwiLCJfY3JlYXRlUHJvcGVydHlJbmZvcyIsIk1hY3Jvc0RlbGVnYXRlVXRpbCIsInNldENhY2hlZFByb3BlcnRpZXMiLCJvRXZlbnQiLCJvRGF0YSIsImdldFNvdXJjZSIsImRldGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInNFbnRpdHlTZXRQYXRoIiwiYVJlc3VsdHMiLCJhbGwiLCJyZXF1ZXN0T2JqZWN0Iiwib0VudGl0eVR5cGUiLCJhbGxvd2VkUHJvcGVydGllc0ZvckZpbHRlck9wdGlvbiIsImdldEN1c3RvbUFnZ3JlZ2F0ZSIsInNBbm5vIiwiYVByb3BlcnR5UHJvbWlzZSIsInNBbm5vS2V5IiwicmVwbGFjZSIsImFBbm5vIiwic3BsaXQiLCJtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzIiwic0FnZ3JlZ2F0YWJsZSIsInNQcm9wS2V5IiwiYWdncmVnYXRpb25NZXRob2QiLCJDaGFydEhlbHBlciIsImZldGNoQ3JpdGljYWxpdHkiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImJpbmQiLCJpIiwiZ2V0VHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwiJFR5cGUiLCJhRGltZW5zaW9ucyIsImFNZWFzdXJlcyIsImFDaGFydEl0ZW1zIiwiZ2V0SXRlbXMiLCJrZXkiLCJnZXRUeXBlIiwiZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZCIsImdldE5hbWUiLCJ2YWwiLCJheGlzMSIsImRhdGFwb2ludCIsInNDdXN0b20iLCJvSXRlbSIsIm1lcmdlIiwicmViaW5kIiwic1NlYXJjaCIsIm9Jbm5lckNoYXJ0IiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiZ2V0SW5uZXJDaGFydCIsIm9DaGFydEJpbmRpbmciLCJnZXRCaW5kaW5nIiwic3VzcGVuZCIsInNldEFnZ3JlZ2F0aW9uIiwib0lubmVyQ2hhcnREZWxlZ2F0ZSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicmVzdW1lIiwicmVtb3ZlRXZlbnREZWxlZ2F0ZSIsImFkZEV2ZW50RGVsZWdhdGUiLCJmaXJlRXZlbnQiLCJfc2V0Q2hhcnQiLCJvQ2hhcnRBUEkiLCJnZXRQYXJlbnQiLCJzZXRWaXpQcm9wZXJ0aWVzIiwiZGV0YWNoU2VsZWN0RGF0YSIsImhhbmRsZVNlbGVjdGlvbkNoYW5nZSIsImRldGFjaERlc2VsZWN0RGF0YSIsImRldGFjaERyaWxsZWRVcCIsImF0dGFjaFNlbGVjdERhdGEiLCJhdHRhY2hEZXNlbGVjdERhdGEiLCJhdHRhY2hEcmlsbGVkVXAiLCJzZXRTZWxlY3Rpb25Nb2RlIiwiZ2V0UGF5bG9hZCIsInNlbGVjdGlvbk1vZGUiLCJ0b1VwcGVyQ2FzZSIsIl9nZXRCaW5kaW5nSW5mbyIsIl9nZXRCaW5kaW5nSW5mb0Zyb21TdGF0ZSIsIm9NZXRhZGF0YUluZm8iLCJnZXREZWxlZ2F0ZSIsInBheWxvYWQiLCJzVGFyZ2V0Q29sbGVjdGlvblBhdGgiLCJjb250ZXh0UGF0aCIsIm9QYXJhbXMiLCJlbnRpdHlTZXQiLCJldmVudHMiLCJkYXRhUmVxdWVzdGVkIiwib25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQiLCJyZW1vdmVJdGVtRnJvbUlubmVyQ2hhcnQiLCJvTURDQ2hhcnRJdGVtIiwiY2FsbCIsIl9nZXRDaGFydCIsImZpcmVEZXNlbGVjdERhdGEiLCJzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHkiLCJiSXNUcmFuc0FnZ3JlZ2F0ZSIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJhRmlsdGVycyIsImtpbmQiLCJnZXRQcm9wZXJ0eUZyb21OYW1lQW5kS2luZCIsIm1kY0NoYXJ0IiwiZ2V0UHJvcGVydHlIZWxwZXIiLCJnZXRQcm9wZXJ0eSIsImdldEZpbHRlckRlbGVnYXRlIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJhZGRJdGVtIiwic1Byb3BlcnR5SW5mb05hbWUiLCJvUGFyZW50Q29udHJvbCIsInByb3AiLCJvRmlsdGVySXRlbSIsImJpbmRQcm9wZXJ0eSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnREZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHtcblx0Z2V0RmlsdGVyUmVzdHJpY3Rpb25zSW5mbyxcblx0Z2V0U29ydFJlc3RyaWN0aW9uc0luZm8sXG5cdGlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24sXG5cdFNvcnRSZXN0cmljdGlvbnNJbmZvVHlwZSxcblx0U29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5SW5mb1R5cGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgQ2hhcnRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRIZWxwZXJcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgTWFjcm9zRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgQ2hhcnQgZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCBNRENMaWIgZnJvbSBcInNhcC91aS9tZGMvbGlicmFyeVwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC91dGlsL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEJhc2VDaGFydERlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L3ZpekNoYXJ0L0NoYXJ0RGVsZWdhdGVcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgRmlsdGVyQmFyRGVsZWdhdGUgZnJvbSBcIi4uL2ZpbHRlckJhci9GaWx0ZXJCYXJEZWxlZ2F0ZVwiO1xuXG5jb25zdCBDaGFydEl0ZW1Sb2xlVHlwZSA9IChNRENMaWIgYXMgYW55KS5DaGFydEl0ZW1Sb2xlVHlwZTtcbi8vIC8qKlxuLy8gICogSGVscGVyIGNsYXNzIGZvciBzYXAudWkubWRjLkNoYXJ0LlxuLy8gICogPGgzPjxiPk5vdGU6PC9iPjwvaDM+XG4vLyAgKiBUaGUgY2xhc3MgaXMgZXhwZXJpbWVudGFsIGFuZCB0aGUgQVBJL2JlaGF2aW91ciBpcyBub3QgZmluYWxpc2VkXG4vLyAgKiBhbmQgaGVuY2UgdGhpcyBzaG91bGQgbm90IGJlIHVzZWQgZm9yIHByb2R1Y3RpdmUgdXNhZ2UuXG4vLyAgKiBFc3BlY2lhbGx5IHRoaXMgY2xhc3MgaXMgbm90IGludGVuZGVkIHRvIGJlIHVzZWQgZm9yIHRoZSBGRSBzY2VuYXJpbyxcbi8vICAqIGhlcmUgd2Ugc2hhbGwgdXNlIHNhcC5mZS5tYWNyb3MuQ2hhcnREZWxlZ2F0ZSB0aGF0IGlzIGVzcGVjaWFsbHkgdGFpbG9yZWQgZm9yIFY0XG4vLyAgKiBtZXRhIG1vZGVsXG4vLyAgKlxuLy8gICogQGF1dGhvciBTQVAgU0Vcbi8vICAqIEBwcml2YXRlXG4vLyAgKiBAZXhwZXJpbWVudGFsXG4vLyAgKiBAc2luY2UgMS42MlxuLy8gICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuQ2hhcnREZWxlZ2F0ZVxuLy8gICovXG5jb25zdCBDaGFydERlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgQmFzZUNoYXJ0RGVsZWdhdGUpO1xuXG5DaGFydERlbGVnYXRlLl9zZXRDaGFydE5vRGF0YVRleHQgPSBmdW5jdGlvbiAob0NoYXJ0OiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdGxldCBzTm9EYXRhS2V5ID0gXCJcIjtcblx0Y29uc3Qgb0NoYXJ0RmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvQ2hhcnQpLFxuXHRcdHN1ZmZpeFJlc291cmNlS2V5ID0gb0JpbmRpbmdJbmZvLnBhdGguc3RhcnRzV2l0aChcIi9cIikgPyBvQmluZGluZ0luZm8ucGF0aC5zdWJzdHIoMSkgOiBvQmluZGluZ0luZm8ucGF0aDtcblx0Y29uc3QgX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAob0NoYXJ0LmRhdGEoXCJtdWx0aVZpZXdzXCIpKSB7XG5cdFx0XHRyZXR1cm4gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfTVVMVElfVklFV1wiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJUX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfV0lUSF9GSUxURVJcIjtcblx0XHR9XG5cdH07XG5cdGlmIChvQ2hhcnQuZ2V0RmlsdGVyKCkpIHtcblx0XHRpZiAob0NoYXJ0RmlsdGVySW5mby5zZWFyY2ggfHwgKG9DaGFydEZpbHRlckluZm8uZmlsdGVycyAmJiBvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSkge1xuXHRcdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c05vRGF0YUtleSA9IFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUXCI7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9DaGFydEZpbHRlckluZm8uc2VhcmNoIHx8IChvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMgJiYgb0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCkpIHtcblx0XHRzTm9EYXRhS2V5ID0gX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycygpO1xuXHR9IGVsc2Uge1xuXHRcdHNOb0RhdGFLZXkgPSBcIk1fVEFCTEVfQU5EX0NIQVJUX05PX0ZJTFRFUlNfTk9fREFUQV9URVhUXCI7XG5cdH1cblx0b0NoYXJ0LnNldE5vRGF0YVRleHQoZ2V0UmVzb3VyY2VNb2RlbChvQ2hhcnQpLmdldFRleHQoc05vRGF0YUtleSwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSkpO1xufTtcblxuQ2hhcnREZWxlZ2F0ZS5faGFuZGxlUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdG9NRENDaGFydDogQ2hhcnQsXG5cdG1FbnRpdHlTZXRBbm5vdGF0aW9uczogYW55LFxuXHRtS25vd25BZ2dyZWdhdGFibGVQcm9wczogYW55LFxuXHRtQ3VzdG9tQWdncmVnYXRlczogYW55LFxuXHRhUHJvcGVydGllczogYW55W10sXG5cdHNDcml0aWNhbGl0eTogc3RyaW5nXG4pIHtcblx0Y29uc3Qgb0FwcGx5U3VwcG9ydGVkID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvTURDQ2hhcnQuZGF0YShcImFwcGx5U3VwcG9ydGVkXCIpKTtcblx0Y29uc3Qgc29ydFJlc3RyaWN0aW9uc0luZm8gPSBnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhtRW50aXR5U2V0QW5ub3RhdGlvbnMpO1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gbUVudGl0eVNldEFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdO1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyA9IGdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8ob0ZpbHRlclJlc3RyaWN0aW9ucyk7XG5cdGNvbnN0IG9PYmogPSB0aGlzLmdldE1vZGVsKCkuZ2V0T2JqZWN0KHRoaXMuZ2V0UGF0aCgpKTtcblx0Y29uc3Qgc0tleSA9IHRoaXMuZ2V0TW9kZWwoKS5nZXRPYmplY3QoYCR7dGhpcy5nZXRQYXRoKCl9QHNhcHVpLm5hbWVgKSBhcyBzdHJpbmc7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLmdldE1vZGVsKCk7XG5cdGNvbnN0IGFNb2Rlczogc3RyaW5nW10gPSBvTURDQ2hhcnQuZ2V0UDEzbk1vZGUoKTtcblx0Y2hlY2tGb3JOb25maWx0ZXJhYmxlRW50aXR5U2V0KG9NRENDaGFydCwgYU1vZGVzKTtcblx0aWYgKG9PYmogJiYgb09iai4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0Ly8gaWdub3JlIChhcyBmb3Igbm93KSBhbGwgY29tcGxleCBwcm9wZXJ0aWVzXG5cdFx0Ly8gbm90IGNsZWFyIGlmIHRoZXkgbWlnaHQgYmUgbmVzdGluZyAoY29tcGxleCBpbiBjb21wbGV4KVxuXHRcdC8vIG5vdCBjbGVhciBob3cgdGhleSBhcmUgcmVwcmVzZW50ZWQgaW4gbm9uLWZpbHRlcmFibGUgYW5ub3RhdGlvblxuXHRcdC8vIGV0Yy5cblx0XHRpZiAob09iai4kaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHQvL0xvZy53YXJuaW5nKFwiQ29tcGxleCBwcm9wZXJ0eSB3aXRoIHR5cGUgXCIgKyBvT2JqLiRUeXBlICsgXCIgaGFzIGJlZW4gaWdub3JlZFwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3RoaXMuZ2V0UGF0aCgpfUBgKTtcblx0XHRjb25zdCBzUGF0aCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIiwgb01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dCh0aGlzLmdldFBhdGgoKSkpO1xuXG5cdFx0Y29uc3QgYUdyb3VwYWJsZVByb3BlcnRpZXMgPSBvQXBwbHlTdXBwb3J0ZWQgJiYgb0FwcGx5U3VwcG9ydGVkLkdyb3VwYWJsZVByb3BlcnRpZXM7XG5cdFx0Y29uc3QgYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMgPSBvQXBwbHlTdXBwb3J0ZWQgJiYgb0FwcGx5U3VwcG9ydGVkLkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM7XG5cdFx0bGV0IGJHcm91cGFibGUgPSBhR3JvdXBhYmxlUHJvcGVydGllcyA/IGNoZWNrUHJvcGVydHlUeXBlKGFHcm91cGFibGVQcm9wZXJ0aWVzLCBzUGF0aCkgOiBmYWxzZTtcblx0XHRsZXQgYkFnZ3JlZ2F0YWJsZSA9IGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID8gY2hlY2tQcm9wZXJ0eVR5cGUoYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMsIHNQYXRoKSA6IGZhbHNlO1xuXG5cdFx0aWYgKCFhR3JvdXBhYmxlUHJvcGVydGllcyB8fCAoYUdyb3VwYWJsZVByb3BlcnRpZXMgJiYgIWFHcm91cGFibGVQcm9wZXJ0aWVzLmxlbmd0aCkpIHtcblx0XHRcdGJHcm91cGFibGUgPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuR3JvdXBhYmxlXCJdO1xuXHRcdH1cblx0XHRpZiAoIWFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIHx8IChhQWdncmVnYXRhYmxlUHJvcGVydGllcyAmJiAhYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMubGVuZ3RoKSkge1xuXHRcdFx0YkFnZ3JlZ2F0YWJsZSA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BZ2dyZWdhdGFibGVcIl07XG5cdFx0fVxuXG5cdFx0Ly9SaWdodCBub3c6IHNraXAgdGhlbSwgc2luY2Ugd2UgY2FuJ3QgY3JlYXRlIGEgY2hhcnQgZnJvbSBpdFxuXHRcdGlmICghYkdyb3VwYWJsZSAmJiAhYkFnZ3JlZ2F0YWJsZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjaGVja1Byb3BlcnR5SXNCb3RoR3JvdXBhYmxlQW5kQWdncmVnYXRhYmxlKG1DdXN0b21BZ2dyZWdhdGVzLCBzS2V5LCBiR3JvdXBhYmxlLCBiQWdncmVnYXRhYmxlKTtcblx0XHRpZiAoYkFnZ3JlZ2F0YWJsZSkge1xuXHRcdFx0Y29uc3QgYUFnZ3JlZ2F0ZVByb3BlcnRpZXMgPSBDaGFydERlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zRm9yQWdncmVnYXRhYmxlKFxuXHRcdFx0XHRvTURDQ2hhcnQsXG5cdFx0XHRcdHNLZXksXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zLFxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyxcblx0XHRcdFx0c29ydFJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzLFxuXHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlc1xuXHRcdFx0KTtcblx0XHRcdGFBZ2dyZWdhdGVQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKG9BZ2dyZWdhdGVQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdGFQcm9wZXJ0aWVzLnB1c2gob0FnZ3JlZ2F0ZVByb3BlcnR5KTtcblx0XHRcdH0pO1xuXHRcdFx0Ly9BZGQgdHJhbnNmb3JtYXRpb24gYWdncmVnYXRlZCBwcm9wZXJ0aWVzIHRvIGNoYXJ0IHByb3BlcnRpZXNcblx0XHRcdGlmIChhTW9kZXMgJiYgYU1vZGVzLmluY2x1ZGVzKFwiRmlsdGVyXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGFLbm93bkFnZ3JlZ2F0YWJsZVByb3BzID0gT2JqZWN0LmtleXMobUtub3duQWdncmVnYXRhYmxlUHJvcHMpO1xuXHRcdFx0XHRjb25zdCBhR3JvdXBhYmxlUHJvcGVydGllc1ZhbHVlcyA9IGFHcm91cGFibGVQcm9wZXJ0aWVzLm1hcChcblx0XHRcdFx0XHQob1Byb3BlcnR5OiB7ICRQcm9wZXJ0eVBhdGg6IHN0cmluZyB9KSA9PiBvUHJvcGVydHkuJFByb3BlcnR5UGF0aFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhS25vd25BZ2dyZWdhdGFibGVQcm9wcy5mb3JFYWNoKChzUHJvcGVydHk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdC8vIEFkZCB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVkIHByb3BlcnR5IHRvIGNoYXJ0IHNvIHRoYXQgaW4gdGhlIGZpbHRlciBkcm9wZG93biBpdCdzIHZpc2libGVcblx0XHRcdFx0XHQvLyBBbHNvIG1hcmsgdmlzaWJpbGl0eSBmYWxzZSBhcyB0aGlzIHByb3BlcnR5IHNob3VsZCBub3QgY29tZSB1cCBpbiB1bmRlciBjaGFydCBzZWN0aW9uIG9mIHBlcnNvbmFsaXphdGlvbiBkaWFsb2dcblx0XHRcdFx0XHRpZiAoIWFHcm91cGFibGVQcm9wZXJ0aWVzVmFsdWVzLmluY2x1ZGVzKHNQcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHRcdGFQcm9wZXJ0aWVzID0gYWRkUHJvcGVydHlUb0NoYXJ0KFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdFx0c0tleSxcblx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvLFxuXHRcdFx0XHRcdFx0XHRzb3J0UmVzdHJpY3Rpb25zSW5mbyxcblx0XHRcdFx0XHRcdFx0b01EQ0NoYXJ0LFxuXHRcdFx0XHRcdFx0XHRzQ3JpdGljYWxpdHksXG5cdFx0XHRcdFx0XHRcdG9PYmosXG5cdFx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGJHcm91cGFibGUpIHtcblx0XHRcdGNvbnN0IHNOYW1lID0gc0tleSB8fCBcIlwiLFxuXHRcdFx0XHRzVGV4dFByb3BlcnR5ID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHQ/IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdLiRQYXRoXG5cdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0bGV0IGJJc05hdmlnYXRpb25UZXh0ID0gZmFsc2U7XG5cdFx0XHRpZiAoc05hbWUgJiYgc05hbWUuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIFByb3BlcnR5OiAke3NOYW1lfSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkYCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChzVGV4dFByb3BlcnR5ICYmIHNUZXh0UHJvcGVydHkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIFRleHQgUHJvcGVydHk6ICR7c1RleHRQcm9wZXJ0eX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZGApO1xuXHRcdFx0XHRiSXNOYXZpZ2F0aW9uVGV4dCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRhUHJvcGVydGllcyA9IGFkZFByb3BlcnR5VG9DaGFydChcblx0XHRcdFx0YVByb3BlcnRpZXMsXG5cdFx0XHRcdHNLZXksXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zLFxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyxcblx0XHRcdFx0c29ydFJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdG9NRENDaGFydCxcblx0XHRcdFx0c0NyaXRpY2FsaXR5LFxuXHRcdFx0XHRvT2JqLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0YklzTmF2aWdhdGlvblRleHRcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBjcmVhdGUgcHJvcGVydGllcyBmb3IgY2hhcnRcbmZ1bmN0aW9uIGFkZFByb3BlcnR5VG9DaGFydChcblx0YVByb3BlcnRpZXM6IGFueVtdLFxuXHRzS2V5OiBzdHJpbmcsXG5cdG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnksXG5cdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksXG5cdHNvcnRSZXN0cmljdGlvbnNJbmZvOiBhbnksXG5cdG9NRENDaGFydDogQ2hhcnQsXG5cdHNDcml0aWNhbGl0eTogc3RyaW5nLFxuXHRvT2JqOiBhbnksXG5cdGJJc0dyb3VwYWJsZTogYm9vbGVhbixcblx0YklzQWdncmVnYXRhYmxlOiBib29sZWFuLFxuXHRiSXNOYXZpZ2F0aW9uVGV4dD86IGJvb2xlYW4sXG5cdGJJc0hpZGRlbj86IGJvb2xlYW5cbik6IGFueVtdIHtcblx0YVByb3BlcnRpZXMucHVzaCh7XG5cdFx0bmFtZTogXCJfZmVfZ3JvdXBhYmxlX1wiICsgc0tleSxcblx0XHRwcm9wZXJ0eVBhdGg6IHNLZXksXG5cdFx0bGFiZWw6IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiXSB8fCBzS2V5LFxuXHRcdHNvcnRhYmxlOiBDaGFydERlbGVnYXRlLl9nZXRTb3J0YWJsZShvTURDQ2hhcnQsIHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1tzS2V5XSwgZmFsc2UpLFxuXHRcdGZpbHRlcmFibGU6IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3NLZXldID8gb0ZpbHRlclJlc3RyaWN0aW9uc0luZm9bc0tleV0uZmlsdGVyYWJsZSA6IHRydWUsXG5cdFx0Z3JvdXBhYmxlOiBiSXNHcm91cGFibGUsXG5cdFx0YWdncmVnYXRhYmxlOiBiSXNBZ2dyZWdhdGFibGUsXG5cdFx0bWF4Q29uZGl0aW9uczogaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0pID8gLTEgOiAxLFxuXHRcdHNvcnRLZXk6IHNLZXksXG5cdFx0cGF0aDogc0tleSxcblx0XHRyb2xlOiBDaGFydEl0ZW1Sb2xlVHlwZS5jYXRlZ29yeSwgLy9zdGFuZGFyZCwgbm9ybWFsbHkgdGhpcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQgZnJvbSBVSS5DaGFydCBhbm5vdGF0aW9uXG5cdFx0Y3JpdGljYWxpdHk6IHNDcml0aWNhbGl0eSwgLy9UbyBiZSBpbXBsZW1lbnRlZCBieSBGRVxuXHRcdHR5cGVDb25maWc6IG9PYmoudHlwZUNvbmZpZyxcblx0XHR2aXNpYmxlOiBiSXNIaWRkZW4gPyAhYklzSGlkZGVuIDogdHJ1ZSxcblx0XHR0ZXh0UHJvcGVydHk6XG5cdFx0XHQhYklzTmF2aWdhdGlvblRleHQgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0PyBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXS4kUGF0aFxuXHRcdFx0XHQ6IG51bGwsIC8vVG8gYmUgaW1wbGVtZW50ZWQgYnkgRkVcblx0XHR0ZXh0Rm9ybWF0dGVyOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl1cblx0fSk7XG5cblx0cmV0dXJuIGFQcm9wZXJ0aWVzO1xufVxuXG4vLyBJZiBlbnRpdHlzZXQgaXMgbm9uIGZpbHRlcmFibGUsdGhlbiBmcm9tIHAxM24gbW9kZXMgcmVtb3ZlIEZpbHRlciBzbyB0aGF0IG9uIFVJIGZpbHRlciBvcHRpb24gZG9lc24ndCBzaG93IHVwXG5mdW5jdGlvbiBjaGVja0Zvck5vbmZpbHRlcmFibGVFbnRpdHlTZXQob01EQ0NoYXJ0OiBDaGFydCwgYU1vZGVzOiBhbnlbXSkge1xuXHRjb25zdCBiRW50aXR5U2V0RmlsZXJhYmxlID0gb01EQ0NoYXJ0XG5cdFx0Py5nZXRNb2RlbCgpXG5cdFx0Py5nZXRNZXRhTW9kZWwoKVxuXHRcdD8uZ2V0T2JqZWN0KGAke29NRENDaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIil9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYCk/LkZpbHRlcmFibGU7XG5cdGlmIChiRW50aXR5U2V0RmlsZXJhYmxlICE9PSB1bmRlZmluZWQgJiYgIWJFbnRpdHlTZXRGaWxlcmFibGUpIHtcblx0XHRhTW9kZXMgPSBhTW9kZXMuZmlsdGVyKChpdGVtOiBhbnkpID0+IGl0ZW0gIT09IFwiRmlsdGVyXCIpO1xuXHRcdG9NRENDaGFydC5zZXRQMTNuTW9kZShhTW9kZXMpO1xuXHR9XG59XG5cbi8vICBjaGVjayBpZiBHcm91cGFibGUgL0FnZ3JlZ2F0YWJsZSBwcm9wZXJ0eSBpcyBwcmVzZW50IG9yIG5vdFxuZnVuY3Rpb24gY2hlY2tQcm9wZXJ0eVR5cGUoYVByb3BlcnRpZXM6IGFueVtdLCBzUGF0aDogc3RyaW5nKSB7XG5cdGlmIChhUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRmb3IgKGNvbnN0IGVsZW1lbnQgb2YgYVByb3BlcnRpZXMpIHtcblx0XHRcdGlmIChlbGVtZW50Py4kUHJvcGVydHlQYXRoID09PSBzUGF0aCB8fCBlbGVtZW50Py5Qcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCA9PT0gc1BhdGgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8vSWYgc2FtZSBjdXN0b20gcHJvcGVydHkgaXMgY29uZmlndXJlZCBhcyBncm91cGFibGUgYW5kIGFnZ3JlZ2F0YWJsZSB0aHJvdyBhbiBlcnJvclxuZnVuY3Rpb24gY2hlY2tQcm9wZXJ0eUlzQm90aEdyb3VwYWJsZUFuZEFnZ3JlZ2F0YWJsZShcblx0bUN1c3RvbUFnZ3JlZ2F0ZXM6IHsgW3Byb3BlcnR5TmFtZTogc3RyaW5nXTogdW5rbm93biB9LFxuXHRzS2V5OiBzdHJpbmcsXG5cdGJHcm91cGFibGU/OiBib29sZWFuLFxuXHRiQWdncmVnYXRhYmxlPzogYm9vbGVhblxuKSB7XG5cdGNvbnN0IGN1c3RvbVByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhtQ3VzdG9tQWdncmVnYXRlcyk7XG5cdGlmIChiR3JvdXBhYmxlICYmIGJBZ2dyZWdhdGFibGUgJiYgY3VzdG9tUHJvcGVydGllcy5pbmNsdWRlcyhzS2V5KSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNhbWUgcHJvcGVydHkgY2FuIG5vdCBiZSBjb25maWd1cmVkIGFzIGdyb3VwYWJsZSBhbmQgYWdncmVnYXRhYmxlXCIpO1xuXHR9XG59XG5cbkNoYXJ0RGVsZWdhdGUuZm9ybWF0VGV4dCA9IGZ1bmN0aW9uIChvVmFsdWUxOiBhbnksIG9WYWx1ZTI6IGFueSkge1xuXHRjb25zdCBvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9IHRoaXMudGV4dEZvcm1hdHRlcjtcblx0aWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dEZpcnN0XCIpIHtcblx0XHRyZXR1cm4gYCR7b1ZhbHVlMn0gKCR7b1ZhbHVlMX0pYDtcblx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRMYXN0XCIpIHtcblx0XHRyZXR1cm4gYCR7b1ZhbHVlMX0gKCR7b1ZhbHVlMn0pYDtcblx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRyZXR1cm4gb1ZhbHVlMjtcblx0fVxuXHRyZXR1cm4gb1ZhbHVlMiA/IG9WYWx1ZTIgOiBvVmFsdWUxO1xufTtcblxuQ2hhcnREZWxlZ2F0ZS51cGRhdGVCaW5kaW5nSW5mbyA9IGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0Q2hhcnREZWxlZ2F0ZS5fc2V0Q2hhcnROb0RhdGFUZXh0KG9DaGFydCwgb0JpbmRpbmdJbmZvKTtcblx0Y29uc3Qgb0ZpbHRlciA9IHNhcC51aS5nZXRDb3JlKCkuYnlJZChvQ2hhcnQuZ2V0RmlsdGVyKCkpIGFzIGFueTtcblx0Y29uc3QgbUNvbmRpdGlvbnMgPSBvQ2hhcnQuZ2V0Q29uZGl0aW9ucygpO1xuXHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdG9CaW5kaW5nSW5mbyA9IHt9O1xuXHR9XG5cdGlmIChvRmlsdGVyKSB7XG5cdFx0Ly8gU2VhcmNoXG5cdFx0Y29uc3Qgb0luZm8gPSBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXIsIHt9KTtcblx0XHRjb25zdCBvQXBwbHlTdXBwb3J0ZWQgPSBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9DaGFydC5kYXRhKFwiYXBwbHlTdXBwb3J0ZWRcIikpO1xuXHRcdGlmIChvQXBwbHlTdXBwb3J0ZWQgJiYgb0FwcGx5U3VwcG9ydGVkLmVuYWJsZVNlYXJjaCAmJiBvSW5mby5zZWFyY2gpIHtcblx0XHRcdG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKG9JbmZvLnNlYXJjaCk7XG5cdFx0fSBlbHNlIGlmIChvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoKSB7XG5cdFx0XHRkZWxldGUgb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaDtcblx0XHR9XG5cdH1cblx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBtQ29uZGl0aW9ucyA/IERlbGVnYXRlVXRpbC5nZXRQYXJhbWV0ZXJzSW5mbyhvRmlsdGVyLCBtQ29uZGl0aW9ucykgOiBudWxsO1xuXHRpZiAoc1BhcmFtZXRlclBhdGgpIHtcblx0XHRvQmluZGluZ0luZm8ucGF0aCA9IHNQYXJhbWV0ZXJQYXRoO1xuXHR9XG5cdGNvbnN0IG9GaWx0ZXJJbmZvID0gQ2hhcnRVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9DaGFydCk7XG5cblx0Ly8gcmVtb3ZlIHByZWZpeGVzIHNvIHRoYXQgZW50aXR5c2V0IHdpbGwgbWF0Y2ggd2l0aCB0aGUgcHJvcGVydHkgbmFtZXMgd2l0aCB0aGVzZSBmaWVsZFxuXHRpZiAob0ZpbHRlckluZm8uZmlsdGVycykge1xuXHRcdG9GaWx0ZXJJbmZvLmZpbHRlcnMgPSBDb21tb25VdGlscy5nZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMob0ZpbHRlckluZm8uZmlsdGVycyk7XG5cdH1cblxuXHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG9GaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoID4gMCA/IG5ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBvRmlsdGVySW5mby5maWx0ZXJzLCBhbmQ6IHRydWUgfSkgOiBudWxsO1xuXHRvQmluZGluZ0luZm8uc29ydGVyID0gdGhpcy5nZXRTb3J0ZXJzKG9DaGFydCk7XG5cdENoYXJ0RGVsZWdhdGUuX2NoZWNrQW5kQWRkRHJhZnRGaWx0ZXIob0NoYXJ0LCBvQmluZGluZ0luZm8pO1xufTtcblxuQ2hhcnREZWxlZ2F0ZS5mZXRjaFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBDaGFydCkge1xuXHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbChvTURDQ2hhcnQpO1xuXHRsZXQgcENyZWF0ZVByb3BlcnR5SW5mb3M7XG5cblx0aWYgKCFvTW9kZWwpIHtcblx0XHRwQ3JlYXRlUHJvcGVydHlJbmZvcyA9IG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnkpID0+IHtcblx0XHRcdG9NRENDaGFydC5hdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNvbHZlcjogcmVzb2x2ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbk1vZGVsQ29udGV4dENoYW5nZSBhcyBhbnksXG5cdFx0XHRcdHRoaXNcblx0XHRcdCk7XG5cdFx0fSkudGhlbigob1JldHJpZXZlZE1vZGVsOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKG9NRENDaGFydCwgb1JldHJpZXZlZE1vZGVsKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRwQ3JlYXRlUHJvcGVydHlJbmZvcyA9IHRoaXMuX2NyZWF0ZVByb3BlcnR5SW5mb3Mob01EQ0NoYXJ0LCBvTW9kZWwpO1xuXHR9XG5cblx0cmV0dXJuIHBDcmVhdGVQcm9wZXJ0eUluZm9zLnRoZW4oZnVuY3Rpb24gKGFQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRpZiAob01EQ0NoYXJ0LmRhdGEpIHtcblx0XHRcdG9NRENDaGFydC5kYXRhKFwiJG1kY0NoYXJ0UHJvcGVydHlJbmZvXCIsIGFQcm9wZXJ0aWVzKTtcblx0XHRcdC8vIHN0b3JlIHRoZSBwcm9wZXJ0aWVzIHRvIGZldGNoIGR1cmluZyBwMTNuIGNhbGN1bGF0aW9uXG5cdFx0XHRNYWNyb3NEZWxlZ2F0ZVV0aWwuc2V0Q2FjaGVkUHJvcGVydGllcyhvTURDQ2hhcnQsIGFQcm9wZXJ0aWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFQcm9wZXJ0aWVzO1xuXHR9KTtcbn07XG5mdW5jdGlvbiBvbk1vZGVsQ29udGV4dENoYW5nZSh0aGlzOiB0eXBlb2YgQ2hhcnREZWxlZ2F0ZSwgb0V2ZW50OiBhbnksIG9EYXRhOiBhbnkpIHtcblx0Y29uc3Qgb01EQ0NoYXJ0ID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbChvTURDQ2hhcnQpO1xuXG5cdGlmIChvTW9kZWwpIHtcblx0XHRvTURDQ2hhcnQuZGV0YWNoTW9kZWxDb250ZXh0Q2hhbmdlKG9uTW9kZWxDb250ZXh0Q2hhbmdlKTtcblx0XHRvRGF0YS5yZXNvbHZlcihvTW9kZWwpO1xuXHR9XG59XG5DaGFydERlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zID0gYXN5bmMgZnVuY3Rpb24gKG9NRENDaGFydDogYW55LCBvTW9kZWw6IGFueSkge1xuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGAvJHtvTURDQ2hhcnQuZGF0YShcImVudGl0eVNldFwiKX1gO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBhUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKFtvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9L2ApLCBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGApXSk7XG5cdGNvbnN0IGFQcm9wZXJ0aWVzOiBhbnlbXSA9IFtdO1xuXHRsZXQgb0VudGl0eVR5cGUgPSBhUmVzdWx0c1swXTtcblx0Y29uc3QgbUVudGl0eVNldEFubm90YXRpb25zID0gYVJlc3VsdHNbMV07XG5cdG9FbnRpdHlUeXBlID0gYWxsb3dlZFByb3BlcnRpZXNGb3JGaWx0ZXJPcHRpb24ob0VudGl0eVR5cGUsIG9NRENDaGFydCk7XG5cdGNvbnN0IG1DdXN0b21BZ2dyZWdhdGVzID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvTURDQ2hhcnQuZGF0YShcImN1c3RvbUFnZ1wiKSk7XG5cdGdldEN1c3RvbUFnZ3JlZ2F0ZShtQ3VzdG9tQWdncmVnYXRlcywgb01EQ0NoYXJ0KTtcblx0bGV0IHNBbm5vO1xuXHRjb25zdCBhUHJvcGVydHlQcm9taXNlID0gW107XG5cdGZvciAoY29uc3Qgc0Fubm9LZXkgaW4gbUVudGl0eVNldEFubm90YXRpb25zKSB7XG5cdFx0aWYgKHNBbm5vS2V5LnN0YXJ0c1dpdGgoXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkN1c3RvbUFnZ3JlZ2F0ZVwiKSkge1xuXHRcdFx0c0Fubm8gPSBzQW5ub0tleS5yZXBsYWNlKFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5DdXN0b21BZ2dyZWdhdGUjXCIsIFwiXCIpO1xuXHRcdFx0Y29uc3QgYUFubm8gPSBzQW5uby5zcGxpdChcIkBcIik7XG5cblx0XHRcdGlmIChhQW5uby5sZW5ndGggPT0gMiAmJiBhQW5ub1sxXSA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiKSB7XG5cdFx0XHRcdG1DdXN0b21BZ2dyZWdhdGVzW2FBbm5vWzBdXSA9IG1FbnRpdHlTZXRBbm5vdGF0aW9uc1tzQW5ub0tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGNvbnN0IG1UeXBlQWdncmVnYXRhYmxlUHJvcHMgPSBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9NRENDaGFydC5kYXRhKFwidHJhbnNBZ2dcIikpO1xuXHRjb25zdCBtS25vd25BZ2dyZWdhdGFibGVQcm9wczogYW55ID0ge307XG5cdGZvciAoY29uc3Qgc0FnZ3JlZ2F0YWJsZSBpbiBtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzKSB7XG5cdFx0Y29uc3Qgc1Byb3BLZXkgPSBtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzW3NBZ2dyZWdhdGFibGVdLnByb3BlcnR5UGF0aDtcblx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzUHJvcEtleV0gPSBtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzUHJvcEtleV0gfHwge307XG5cdFx0bUtub3duQWdncmVnYXRhYmxlUHJvcHNbc1Byb3BLZXldW21UeXBlQWdncmVnYXRhYmxlUHJvcHNbc0FnZ3JlZ2F0YWJsZV0uYWdncmVnYXRpb25NZXRob2RdID0ge1xuXHRcdFx0bmFtZTogbVR5cGVBZ2dyZWdhdGFibGVQcm9wc1tzQWdncmVnYXRhYmxlXS5uYW1lLFxuXHRcdFx0bGFiZWw6IG1UeXBlQWdncmVnYXRhYmxlUHJvcHNbc0FnZ3JlZ2F0YWJsZV0ubGFiZWxcblx0XHR9O1xuXHR9XG5cdGZvciAoY29uc3Qgc0tleSBpbiBvRW50aXR5VHlwZSkge1xuXHRcdGlmIChzS2V5LmluZGV4T2YoXCIkXCIpICE9PSAwKSB7XG5cdFx0XHRhUHJvcGVydHlQcm9taXNlLnB1c2goXG5cdFx0XHRcdENoYXJ0SGVscGVyLmZldGNoQ3JpdGljYWxpdHkob01ldGFNb2RlbCwgb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzRW50aXR5U2V0UGF0aH0vJHtzS2V5fWApKS50aGVuKFxuXHRcdFx0XHRcdENoYXJ0RGVsZWdhdGUuX2hhbmRsZVByb3BlcnR5LmJpbmQoXG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGAke3NFbnRpdHlTZXRQYXRofS8ke3NLZXl9YCksXG5cdFx0XHRcdFx0XHRvTURDQ2hhcnQsXG5cdFx0XHRcdFx0XHRtRW50aXR5U2V0QW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wcyxcblx0XHRcdFx0XHRcdG1DdXN0b21BZ2dyZWdhdGVzLFxuXHRcdFx0XHRcdFx0YVByb3BlcnRpZXNcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdGF3YWl0IFByb21pc2UuYWxsKGFQcm9wZXJ0eVByb21pc2UpO1xuXG5cdHJldHVybiBhUHJvcGVydGllcztcbn07XG5cbi8vIGZvciBldmVyeSBwcm9wZXJ0eSBvZiBjaGFydCwgY29uZmlndXJlIHRoZSB0eXBlQ29uZmlnIHdoaWNoIHdlIHdvdWxkIGxpa2UgdG8gc2VlIGluIHRoZSBmaWx0ZXIgZHJvcGRyb3duIGxpc3RcbmZ1bmN0aW9uIGFsbG93ZWRQcm9wZXJ0aWVzRm9yRmlsdGVyT3B0aW9uKG9FbnRpdHlUeXBlOiBhbnksIG9NRENDaGFydDogYW55KSB7XG5cdGZvciAoY29uc3QgaSBpbiBvRW50aXR5VHlwZSkge1xuXHRcdGlmIChpID09IFwiJEtleVwiIHx8IGkgPT0gXCIka2luZFwiIHx8IGkgPT0gXCJTQVBfTWVzc2FnZVwiKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9IGVsc2UgaWYgKG9FbnRpdHlUeXBlW2ldW1wiJGtpbmRcIl0gPT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0XHRvRW50aXR5VHlwZVtpXVtcInR5cGVDb25maWdcIl0gPSBvTURDQ2hhcnQuZ2V0VHlwZVV0aWwoKS5nZXRUeXBlQ29uZmlnKG9FbnRpdHlUeXBlW2ldLiRUeXBlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0VudGl0eVR5cGVbaV1bXCJ0eXBlQ29uZmlnXCJdID0gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9FbnRpdHlUeXBlO1xufVxuXG5mdW5jdGlvbiBnZXRDdXN0b21BZ2dyZWdhdGUobUN1c3RvbUFnZ3JlZ2F0ZXM6IGFueSwgb01EQ0NoYXJ0OiBhbnkpIHtcblx0Y29uc3QgYURpbWVuc2lvbnM6IGFueVtdID0gW10sXG5cdFx0YU1lYXN1cmVzID0gW107XG5cdGlmIChtQ3VzdG9tQWdncmVnYXRlcyAmJiBPYmplY3Qua2V5cyhtQ3VzdG9tQWdncmVnYXRlcykubGVuZ3RoID49IDEpIHtcblx0XHRjb25zdCBhQ2hhcnRJdGVtcyA9IG9NRENDaGFydC5nZXRJdGVtcygpO1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGFDaGFydEl0ZW1zKSB7XG5cdFx0XHRpZiAoYUNoYXJ0SXRlbXNba2V5XS5nZXRUeXBlKCkgPT09IFwiZ3JvdXBhYmxlXCIpIHtcblx0XHRcdFx0YURpbWVuc2lvbnMucHVzaChDaGFydERlbGVnYXRlLmdldEludGVybmFsQ2hhcnROYW1lRnJvbVByb3BlcnR5TmFtZUFuZEtpbmQoYUNoYXJ0SXRlbXNba2V5XS5nZXROYW1lKCksIFwiZ3JvdXBhYmxlXCIpKTtcblx0XHRcdH0gZWxzZSBpZiAoYUNoYXJ0SXRlbXNba2V5XS5nZXRUeXBlKCkgPT09IFwiYWdncmVnYXRhYmxlXCIpIHtcblx0XHRcdFx0YU1lYXN1cmVzLnB1c2goQ2hhcnREZWxlZ2F0ZS5nZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kKGFDaGFydEl0ZW1zW2tleV0uZ2V0TmFtZSgpLCBcImFnZ3JlZ2F0YWJsZVwiKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGFNZWFzdXJlcy5maWx0ZXIoZnVuY3Rpb24gKHZhbDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBhRGltZW5zaW9ucy5pbmRleE9mKHZhbCkgIT0gLTE7XG5cdFx0XHR9KS5sZW5ndGggPj0gMVxuXHRcdCkge1xuXHRcdFx0TG9nLmVycm9yKFwiRGltZW5zaW9uIGFuZCBNZWFzdXJlIGhhcyB0aGUgc2FtZVByb3BlcnR5IENvbmZpZ3VyZWRcIik7XG5cdFx0fVxuXHR9XG59XG5cbkNoYXJ0RGVsZWdhdGUuX2NyZWF0ZVByb3BlcnR5SW5mb3NGb3JBZ2dyZWdhdGFibGUgPSBmdW5jdGlvbiAoXG5cdG9NRENDaGFydDogQ2hhcnQsXG5cdHNLZXk6IHN0cmluZyxcblx0b1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSxcblx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm86IGFueSxcblx0c29ydFJlc3RyaWN0aW9uc0luZm86IFNvcnRSZXN0cmljdGlvbnNJbmZvVHlwZSxcblx0bUtub3duQWdncmVnYXRhYmxlUHJvcHM6IGFueSxcblx0bUN1c3RvbUFnZ3JlZ2F0ZXM6IGFueVxuKSB7XG5cdGNvbnN0IGFBZ2dyZWdhdGVQcm9wZXJ0aWVzID0gW107XG5cdGlmIChPYmplY3Qua2V5cyhtS25vd25BZ2dyZWdhdGFibGVQcm9wcykuaW5kZXhPZihzS2V5KSA+IC0xKSB7XG5cdFx0Zm9yIChjb25zdCBzQWdncmVnYXRhYmxlIGluIG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NLZXldKSB7XG5cdFx0XHRhQWdncmVnYXRlUHJvcGVydGllcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgbUtub3duQWdncmVnYXRhYmxlUHJvcHNbc0tleV1bc0FnZ3JlZ2F0YWJsZV0ubmFtZSxcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBzS2V5LFxuXHRcdFx0XHRsYWJlbDpcblx0XHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzS2V5XVtzQWdncmVnYXRhYmxlXS5sYWJlbCB8fFxuXHRcdFx0XHRcdGAke29Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiXX0gKCR7c0FnZ3JlZ2F0YWJsZX0pYCB8fFxuXHRcdFx0XHRcdGAke3NLZXl9ICgke3NBZ2dyZWdhdGFibGV9KWAsXG5cdFx0XHRcdHNvcnRhYmxlOiBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0gPyBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0uc29ydGFibGUgOiB0cnVlLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0Z3JvdXBhYmxlOiBmYWxzZSxcblx0XHRcdFx0YWdncmVnYXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRwYXRoOiBzS2V5LFxuXHRcdFx0XHRhZ2dyZWdhdGlvbk1ldGhvZDogc0FnZ3JlZ2F0YWJsZSxcblx0XHRcdFx0bWF4Q29uZGl0aW9uczogaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0pID8gLTEgOiAxLFxuXHRcdFx0XHRyb2xlOiBDaGFydEl0ZW1Sb2xlVHlwZS5heGlzMSxcblx0XHRcdFx0ZGF0YXBvaW50OiBudWxsIC8vVG8gYmUgaW1wbGVtZW50ZWQgYnkgRkVcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRpZiAoT2JqZWN0LmtleXMobUN1c3RvbUFnZ3JlZ2F0ZXMpLmluZGV4T2Yoc0tleSkgPiAtMSkge1xuXHRcdGZvciAoY29uc3Qgc0N1c3RvbSBpbiBtQ3VzdG9tQWdncmVnYXRlcykge1xuXHRcdFx0aWYgKHNDdXN0b20gPT09IHNLZXkpIHtcblx0XHRcdFx0Y29uc3Qgb0l0ZW0gPSBtZXJnZSh7fSwgbUN1c3RvbUFnZ3JlZ2F0ZXNbc0N1c3RvbV0sIHtcblx0XHRcdFx0XHRuYW1lOiBcIl9mZV9hZ2dyZWdhdGFibGVfXCIgKyBzQ3VzdG9tLFxuXHRcdFx0XHRcdGdyb3VwYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0YWdncmVnYXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdGZpbHRlcmFibGU6IGZhbHNlLFxuXHRcdFx0XHRcdHJvbGU6IENoYXJ0SXRlbVJvbGVUeXBlLmF4aXMxLFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aDogc0N1c3RvbSxcblx0XHRcdFx0XHRkYXRhcG9pbnQ6IG51bGwgLy9UbyBiZSBpbXBsZW1lbnRlZCBieSBGRVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0YUFnZ3JlZ2F0ZVByb3BlcnRpZXMucHVzaChvSXRlbSk7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhQWdncmVnYXRlUHJvcGVydGllcztcbn07XG5DaGFydERlbGVnYXRlLnJlYmluZCA9IGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0Y29uc3Qgc1NlYXJjaCA9IG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2g7XG5cblx0aWYgKHNTZWFyY2gpIHtcblx0XHRkZWxldGUgb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaDtcblx0fVxuXG5cdEJhc2VDaGFydERlbGVnYXRlLnJlYmluZChvTURDQ2hhcnQsIG9CaW5kaW5nSW5mbyk7XG5cblx0aWYgKHNTZWFyY2gpIHtcblx0XHRjb25zdCBvSW5uZXJDaGFydCA9IG9NRENDaGFydC5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KG9NRENDaGFydCksXG5cdFx0XHRvQ2hhcnRCaW5kaW5nID0gb0lubmVyQ2hhcnQgJiYgb0lubmVyQ2hhcnQuZ2V0QmluZGluZyhcImRhdGFcIik7XG5cblx0XHQvLyBUZW1wb3Jhcnkgd29ya2Fyb3VuZCB1bnRpbCB0aGlzIGlzIGZpeGVkIGluIE1EQ0NoYXJ0IC8gVUk1IENoYXJ0XG5cdFx0Ly8gSW4gb3JkZXIgdG8gYXZvaWQgaGF2aW5nIDIgT0RhdGEgcmVxdWVzdHMsIHdlIG5lZWQgdG8gc3VzcGVuZCB0aGUgYmluZGluZyBiZWZvcmUgc2V0dGluZyBzb21lIGFnZ3JlZ2F0aW9uIHByb3BlcnRpZXNcblx0XHQvLyBhbmQgcmVzdW1lIGl0IG9uY2UgdGhlIGNoYXJ0IGhhcyBhZGRlZCBvdGhlciBhZ2dyZWdhdGlvbiBwcm9wZXJ0aWVzIChpbiBvbkJlZm9yZVJlbmRlcmluZylcblx0XHRvQ2hhcnRCaW5kaW5nLnN1c3BlbmQoKTtcblx0XHRvQ2hhcnRCaW5kaW5nLnNldEFnZ3JlZ2F0aW9uKHsgc2VhcmNoOiBzU2VhcmNoIH0pO1xuXG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnREZWxlZ2F0ZSA9IHtcblx0XHRcdG9uQmVmb3JlUmVuZGVyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9DaGFydEJpbmRpbmcucmVzdW1lKCk7XG5cdFx0XHRcdG9Jbm5lckNoYXJ0LnJlbW92ZUV2ZW50RGVsZWdhdGUob0lubmVyQ2hhcnREZWxlZ2F0ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRvSW5uZXJDaGFydC5hZGRFdmVudERlbGVnYXRlKG9Jbm5lckNoYXJ0RGVsZWdhdGUpO1xuXHR9XG5cblx0b01EQ0NoYXJ0LmZpcmVFdmVudChcImJpbmRpbmdVcGRhdGVkXCIpO1xufTtcbkNoYXJ0RGVsZWdhdGUuX3NldENoYXJ0ID0gZnVuY3Rpb24gKG9NRENDaGFydDogYW55LCBvSW5uZXJDaGFydDogYW55KSB7XG5cdGNvbnN0IG9DaGFydEFQSSA9IG9NRENDaGFydC5nZXRQYXJlbnQoKTtcblx0b0lubmVyQ2hhcnQuc2V0Vml6UHJvcGVydGllcyhvTURDQ2hhcnQuZGF0YShcInZpelByb3BlcnRpZXNcIikpO1xuXHRvSW5uZXJDaGFydC5kZXRhY2hTZWxlY3REYXRhKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblx0b0lubmVyQ2hhcnQuZGV0YWNoRGVzZWxlY3REYXRhKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblx0b0lubmVyQ2hhcnQuZGV0YWNoRHJpbGxlZFVwKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblx0b0lubmVyQ2hhcnQuYXR0YWNoU2VsZWN0RGF0YShvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cdG9Jbm5lckNoYXJ0LmF0dGFjaERlc2VsZWN0RGF0YShvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cdG9Jbm5lckNoYXJ0LmF0dGFjaERyaWxsZWRVcChvQ2hhcnRBUEkuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQob0NoYXJ0QVBJKSk7XG5cblx0b0lubmVyQ2hhcnQuc2V0U2VsZWN0aW9uTW9kZShvTURDQ2hhcnQuZ2V0UGF5bG9hZCgpLnNlbGVjdGlvbk1vZGUudG9VcHBlckNhc2UoKSk7XG5cdEJhc2VDaGFydERlbGVnYXRlLl9zZXRDaGFydChvTURDQ2hhcnQsIG9Jbm5lckNoYXJ0KTtcbn07XG5DaGFydERlbGVnYXRlLl9nZXRCaW5kaW5nSW5mbyA9IGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSkge1xuXHRpZiAodGhpcy5fZ2V0QmluZGluZ0luZm9Gcm9tU3RhdGUob01EQ0NoYXJ0KSkge1xuXHRcdHJldHVybiB0aGlzLl9nZXRCaW5kaW5nSW5mb0Zyb21TdGF0ZShvTURDQ2hhcnQpO1xuXHR9XG5cblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IG9NRENDaGFydC5nZXREZWxlZ2F0ZSgpLnBheWxvYWQ7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTURDQ2hhcnQuZ2V0TW9kZWwoKSAmJiBvTURDQ2hhcnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3Qgc1RhcmdldENvbGxlY3Rpb25QYXRoID0gb01EQ0NoYXJ0LmRhdGEoXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKTtcblx0Y29uc3Qgc0VudGl0eVNldFBhdGggPVxuXHRcdChvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzVGFyZ2V0Q29sbGVjdGlvblBhdGh9LyRraW5kYCkgIT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgPyBcIi9cIiA6IFwiXCIpICsgb01ldGFkYXRhSW5mby5jb250ZXh0UGF0aDtcblx0Y29uc3Qgb1BhcmFtcyA9IG1lcmdlKHt9LCBvTWV0YWRhdGFJbmZvLnBhcmFtZXRlcnMsIHtcblx0XHRlbnRpdHlTZXQ6IG9NRENDaGFydC5kYXRhKFwiZW50aXR5U2V0XCIpXG5cdH0pO1xuXHRyZXR1cm4ge1xuXHRcdHBhdGg6IHNFbnRpdHlTZXRQYXRoLFxuXHRcdGV2ZW50czoge1xuXHRcdFx0ZGF0YVJlcXVlc3RlZDogb01EQ0NoYXJ0LmdldFBhcmVudCgpLm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkLmJpbmQob01EQ0NoYXJ0LmdldFBhcmVudCgpKVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyczogb1BhcmFtc1xuXHR9O1xufTtcbkNoYXJ0RGVsZWdhdGUucmVtb3ZlSXRlbUZyb21Jbm5lckNoYXJ0ID0gZnVuY3Rpb24gKG9NRENDaGFydDogYW55LCBvTURDQ2hhcnRJdGVtOiBhbnkpIHtcblx0QmFzZUNoYXJ0RGVsZWdhdGUucmVtb3ZlSXRlbUZyb21Jbm5lckNoYXJ0LmNhbGwodGhpcywgb01EQ0NoYXJ0LCBvTURDQ2hhcnRJdGVtKTtcblx0aWYgKG9NRENDaGFydEl0ZW0uZ2V0VHlwZSgpID09PSBcImdyb3VwYWJsZVwiKSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSB0aGlzLl9nZXRDaGFydChvTURDQ2hhcnQpO1xuXHRcdG9Jbm5lckNoYXJ0LmZpcmVEZXNlbGVjdERhdGEoKTtcblx0fVxufTtcbkNoYXJ0RGVsZWdhdGUuX2dldFNvcnRhYmxlID0gZnVuY3Rpb24gKFxuXHRvTURDQ2hhcnQ6IGFueSxcblx0c29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5OiBTb3J0UmVzdHJpY3Rpb25zUHJvcGVydHlJbmZvVHlwZSB8IHVuZGVmaW5lZCxcblx0YklzVHJhbnNBZ2dyZWdhdGU6IGFueVxuKSB7XG5cdGlmIChiSXNUcmFuc0FnZ3JlZ2F0ZSkge1xuXHRcdGlmIChvTURDQ2hhcnQuZGF0YShcImRyYWZ0U3VwcG9ydGVkXCIpID09PSBcInRydWVcIikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5ID8gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5LnNvcnRhYmxlIDogdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eSA/IHNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eS5zb3J0YWJsZSA6IHRydWU7XG59O1xuQ2hhcnREZWxlZ2F0ZS5fY2hlY2tBbmRBZGREcmFmdEZpbHRlciA9IGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0aWYgKG9DaGFydC5kYXRhKFwiZHJhZnRTdXBwb3J0ZWRcIikgPT09IFwidHJ1ZVwiKSB7XG5cdFx0aWYgKCFvQmluZGluZ0luZm8pIHtcblx0XHRcdG9CaW5kaW5nSW5mbyA9IHt9O1xuXHRcdH1cblx0XHRpZiAoIW9CaW5kaW5nSW5mby5maWx0ZXJzKSB7XG5cdFx0XHRvQmluZGluZ0luZm8uZmlsdGVycyA9IFtdO1xuXHRcdFx0b0JpbmRpbmdJbmZvLmZpbHRlcnMucHVzaChuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgRmlsdGVyT3BlcmF0b3IuRVEsIHRydWUpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0JpbmRpbmdJbmZvLmZpbHRlcnM/LmFGaWx0ZXJzPy5wdXNoKG5ldyBGaWx0ZXIoXCJJc0FjdGl2ZUVudGl0eVwiLCBGaWx0ZXJPcGVyYXRvci5FUSwgdHJ1ZSkpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gSUQgd2hpY2ggc2hvdWxkIGJlIHVzZWQgaW4gdGhlIGludGVybmFsIGNoYXJ0IGZvciB0aGUgbWVhc3VyZSBvciBkaW1lbnNpb24uXG4gKiBGb3Igc3RhbmRhcmQgY2FzZXMsIHRoaXMgaXMganVzdCB0aGUgSUQgb2YgdGhlIHByb3BlcnR5LlxuICogSWYgaXQgaXMgbmVjZXNzYXJ5IHRvIHVzZSBhbm90aGVyIElEIGludGVybmFsbHkgaW5zaWRlIHRoZSBjaGFydCAoZS5nLiBvbiBkdXBsaWNhdGUgcHJvcGVydHkgSURzKSB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcndyaXR0ZW4uXG4gKiBJbiB0aGlzIGNhc2UsIDxjb2RlPmdldFByb3BlcnR5RnJvbU5hbWVBbmRLaW5kPC9jb2RlPiBuZWVkcyB0byBiZSBvdmVyd3JpdHRlbiBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIElEIG9mIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIHtzdHJpbmd9IGtpbmQgVHlwZSBvZiB0aGUgcHJvcGVydHkgKG1lYXN1cmUgb3IgZGltZW5zaW9uKVxuICogQHJldHVybnMge3N0cmluZ30gSW50ZXJuYWwgSUQgZm9yIHRoZSBzYXAuY2hhcnQuQ2hhcnRcbiAqL1xuQ2hhcnREZWxlZ2F0ZS5nZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kID0gZnVuY3Rpb24gKG5hbWU6IHN0cmluZywga2luZDogc3RyaW5nKSB7XG5cdHJldHVybiBuYW1lLnJlcGxhY2UoXCJfZmVfXCIgKyBraW5kICsgXCJfXCIsIFwiXCIpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1hcHMgYW4gaWQgb2YgYW4gaW50ZXJuYWwgY2hhcnQgZGltZW5zaW9uIG9yIG1lYXN1cmUgJiB0eXBlIG9mIGEgcHJvcGVydHkgdG8gaXRzIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgZW50cnkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgSUQgb2YgaW50ZXJuYWwgY2hhcnQgbWVhc3VyZSBvciBkaW1lbnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBraW5kIFRoZSBraW5kIG9mIHByb3BlcnR5IHRoYXQgaXMgdXNlZFxuICogQHBhcmFtIHtzYXAudWkubWRjLkNoYXJ0fSBtZGNDaGFydCBSZWZlcmVuY2UgdG8gdGhlIE1EQ19DaGFydFxuICogQHJldHVybnMge29iamVjdH0gUHJvcGVydHlJbmZvIG9iamVjdFxuICovXG5DaGFydERlbGVnYXRlLmdldFByb3BlcnR5RnJvbU5hbWVBbmRLaW5kID0gZnVuY3Rpb24gKG5hbWU6IHN0cmluZywga2luZDogc3RyaW5nLCBtZGNDaGFydDogYW55KSB7XG5cdHJldHVybiBtZGNDaGFydC5nZXRQcm9wZXJ0eUhlbHBlcigpLmdldFByb3BlcnR5KFwiX2ZlX1wiICsga2luZCArIFwiX1wiICsgbmFtZSk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGUgdGhlIGNoYXJ0J3MgZmlsdGVyIGRlbGVnYXRlIHRvIHByb3ZpZGUgYmFzaWMgZmlsdGVyIGZ1bmN0aW9uYWxpdHkgc3VjaCBhcyBhZGRpbmcgRmlsdGVyRmllbGRzLlxuICpcbiAqIEByZXR1cm5zIE9iamVjdCBmb3IgdGhlIHBlcnNvbmFsaXphdGlvbiBvZiB0aGUgY2hhcnQgZmlsdGVyXG4gKi9cbkNoYXJ0RGVsZWdhdGUuZ2V0RmlsdGVyRGVsZWdhdGUgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBGaWx0ZXJCYXJEZWxlZ2F0ZSwge1xuXHRcdGFkZEl0ZW06IGZ1bmN0aW9uIChzUHJvcGVydHlJbmZvTmFtZTogYW55LCBvUGFyZW50Q29udHJvbDogYW55KSB7XG5cdFx0XHRjb25zdCBwcm9wID0gQ2hhcnREZWxlZ2F0ZS5nZXRJbnRlcm5hbENoYXJ0TmFtZUZyb21Qcm9wZXJ0eU5hbWVBbmRLaW5kKHNQcm9wZXJ0eUluZm9OYW1lLCBcImdyb3VwYWJsZVwiKTtcblx0XHRcdHJldHVybiBGaWx0ZXJCYXJEZWxlZ2F0ZS5hZGRJdGVtKHByb3AsIG9QYXJlbnRDb250cm9sKS50aGVuKChvRmlsdGVySXRlbTogYW55KSA9PiB7XG5cdFx0XHRcdG9GaWx0ZXJJdGVtPy5iaW5kUHJvcGVydHkoXCJjb25kaXRpb25zXCIsIHtcblx0XHRcdFx0XHRwYXRoOiBcIiRmaWx0ZXJzPi9jb25kaXRpb25zL1wiICsgc1Byb3BlcnR5SW5mb05hbWVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBvRmlsdGVySXRlbTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDaGFydERlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQXdCQSxNQUFNQSxpQkFBaUIsR0FBSUMsTUFBTSxDQUFTRCxpQkFBaUI7RUFDM0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsTUFBTUUsYUFBYSxHQUFHQyxNQUFNLENB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