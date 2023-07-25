/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "sap/ui/model/Sorter", "sap/ui/core/library", "./hierarchydynamic/SearchHierarchyDynamicFacet", "./SearchFacetDialogHelperDynamicHierarchy", "./sinaNexTS/sina/SimpleCondition"], function (__i18n, Sorter, sap_ui_core_library, __SearchHierarchyDynamicFacet, ___SearchFacetDialogHelperDynamicHierarchy, ___sinaNexTS_sina_SimpleCondition) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var i18n = _interopRequireDefault(__i18n);
  var MessageType = sap_ui_core_library["MessageType"];
  var SearchHierarchyDynamicFacet = _interopRequireDefault(__SearchHierarchyDynamicFacet);
  var updateDetailPageforDynamicHierarchy = ___SearchFacetDialogHelperDynamicHierarchy["updateDetailPageforDynamicHierarchy"];
  var SimpleCondition = ___sinaNexTS_sina_SimpleCondition["SimpleCondition"]; // ToDo, static?  -> alt3ernative: create instances instead of singleton
  var SearchFacetDialogHelper = /*#__PURE__*/function () {
    function SearchFacetDialogHelper() {
      _classCallCheck(this, SearchFacetDialogHelper);
      throw new Error("Cannot instantiate static class 'SearchFacetDialogHelper'");
    }
    _createClass(SearchFacetDialogHelper, null, [{
      key: "injectSearchAdvancedCondition",
      value:
      // ToDo class SearchAdvancedCondition

      function injectSearchAdvancedCondition(_SearchAdvancedCondition) {
        // ToDo SearchAdvancedCondition (the class, not an instance)
        SearchFacetDialogHelper.searchAdvancedCondition = _SearchAdvancedCondition;
      }
    }, {
      key: "init",
      value: function init(dialog) {
        // ToDo, support multiple instances and merge init into constructor
        // ToDo: add type SearchFacetDialog when converted to TS
        // the position index of elements in parent aggregation:
        // first masterPage: masterPages[0]->scrollContainer->content[]
        SearchFacetDialogHelper.POS_FACET_LIST = 0;
        // every detailPage->subHeader->content[]
        SearchFacetDialogHelper.POS_TOOLBAR_SEARCHFIELD = 0;
        SearchFacetDialogHelper.POS_TOOLBAR_TOGGLEBUTTON = 1;
        // every detailPage->content[]
        // old layout (number, date facet)
        SearchFacetDialogHelper.POS_SETTING_CONTAINER = 0;
        SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER = 1;
        // new layout (string, text facet)
        SearchFacetDialogHelper.POS_ICONTABBAR = 0;
        // tabBar->items[]
        SearchFacetDialogHelper.POS_TABBAR_LIST = 0;
        SearchFacetDialogHelper.POS_TABBAR_CONDITION = 1;
        // settingContainer->content[]
        SearchFacetDialogHelper.POS_SORTING_SELECT = 0;
        SearchFacetDialogHelper.POS_SHOWONTOP_CHECKBOX = 1;
        // advancedCondition->content[]
        SearchFacetDialogHelper.POS_ADVANCED_CHECKBOX = 0;
        SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT = 1;
        SearchFacetDialogHelper.POS_ADVANCED_BUTTON = 2;
        SearchFacetDialogHelper.bResetFilterIsActive = false;
        var oNumberFormatOptions = {
          decimals: 2
        };
        SearchFacetDialogHelper.oFloatNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oNumberFormatOptions);
        SearchFacetDialogHelper.oIntegernumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance();
        //format: 2015-07-14 00:00:00.0000000
        SearchFacetDialogHelper.oDateFormatOptions = {
          pattern: "yyyy/MM/dd",
          UTC: false
        };
        SearchFacetDialogHelper.oTimestampFormatOptions = {
          pattern: "yyyy-MM-dd HH:mm:ss.SSSSSSS",
          UTC: true
        };
        SearchFacetDialogHelper.oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(SearchFacetDialogHelper.oDateFormatOptions);
        SearchFacetDialogHelper.oTimestampFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(SearchFacetDialogHelper.oTimestampFormatOptions);
        SearchFacetDialogHelper.dialog = dialog;
      }

      // get the facet list in masterPage
    }, {
      key: "getFacetList",
      value: function getFacetList() {
        // ToDo
        var facetListPage = SearchFacetDialogHelper.dialog.oSplitContainer.getMasterPages()[0];
        return facetListPage.getContent()[SearchFacetDialogHelper.POS_FACET_LIST];
      }

      //according masterPageListItem, send a single facet pespective call, update the detail page
    }, {
      key: "updateDetailPage",
      value: function updateDetailPage(oListItem, sFilterTerm, bInitialFilters) {
        var oModel = SearchFacetDialogHelper.dialog.getModel();
        var oSearchModel = SearchFacetDialogHelper.dialog.getModel("searchModel");
        var sBindingPath = oListItem.getBindingContext().sPath;
        var oSelectedListItem = oModel.getProperty(sBindingPath);
        var sDataType = oModel.getAttributeDataType(oSelectedListItem);
        var index = SearchFacetDialogHelper.getFacetList().indexOfAggregation("items", oListItem);
        var oDetailPage = SearchFacetDialogHelper.dialog.oSplitContainer.getDetailPages()[index];
        var facet = oDetailPage.getBindingContext().getObject();
        if (facet.facetType === "hierarchy") {
          var dynamicHierarchyFacet = facet;
          updateDetailPageforDynamicHierarchy(oModel, dynamicHierarchyFacet, oModel.aFilters);
          SearchFacetDialogHelper.dialog.oSplitContainer.toDetail(oDetailPage.getId(), "show", null, null); // ToDo 'null, null'
          return;
        }
        var oDetailPageAttributeListContainer, oDetailPageAttributeList, oAdvancedContainer, oSettings;
        if (sDataType === "string" || sDataType === "text") {
          oDetailPageAttributeListContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER];
          oDetailPageAttributeList = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
          oAdvancedContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_CONDITION].getContent()[0];
          oSettings = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getContent()[SearchFacetDialogHelper.POS_SETTING_CONTAINER];
        } else {
          oDetailPageAttributeListContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER];
          oDetailPageAttributeList = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER]
          // ToDo 'any'
          .getContent()[0];
          oAdvancedContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER]; //from index 1
          oSettings = oDetailPage.getContent()[SearchFacetDialogHelper.POS_SETTING_CONTAINER];
        }
        var sNaviId = oDetailPage.getId();
        SearchFacetDialogHelper.dialog.oSplitContainer.toDetail(sNaviId, "show", null, null); // ToDo 'null, null'
        SearchFacetDialogHelper.dialog.resetIcons(oModel, sBindingPath, SearchFacetDialogHelper.dialog);
        oDetailPageAttributeListContainer.setBusy(true);
        var properties = {
          sAttribute: oSelectedListItem.dimension,
          sBindingPath: sBindingPath,
          sAttributeLimit: 1000,
          bInitialFilters: bInitialFilters
        };
        if (sDataType === "number") {
          properties.sAttributeLimit = 20;
        }
        if (!oModel.chartQuery) {
          oModel.chartQuery = oModel.sinaNext.createChartQuery({
            filter: oModel.getProperty("/uiFilter").clone(),
            dimension: oSelectedListItem.dimension,
            top: 1000
          });
        }
        // apply the facet query filter, except itself
        SearchFacetDialogHelper.applyChartQueryFilter(index); // TODO
        // add the filter term in search field
        if (sFilterTerm) {
          var filterCondition = oModel.sinaNext.createSimpleCondition({
            attribute: oSelectedListItem.dimension,
            operator: oModel.sinaNext.ComparisonOperator.Bw,
            value: sFilterTerm
          });
          if (!SearchFacetDialogHelper.bResetFilterIsActive) {
            oModel.chartQuery.filter.autoInsertCondition(filterCondition);
          }
        } else {
          if (sFilterTerm === undefined && (sDataType === "string" || sDataType === "text")) {
            oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getSubHeader().getContent()[SearchFacetDialogHelper.POS_TOOLBAR_SEARCHFIELD].setValue("");
          }
        }
        oModel.chartQuery.filter.searchTerm = oSearchModel.getSearchBoxTerm();
        // send the single call
        oModel.facetDialogSingleCall(properties).then(function () {
          var aItems = oModel.getProperty(oDetailPage.getBindingContext().getPath()).items;
          // initiate advanced container
          if (oAdvancedContainer.data("initial")) {
            SearchFacetDialogHelper.initiateAdvancedConditions(oAdvancedContainer, aItems, oAdvancedContainer.data("dataType"));
          }
          // enable setting check box
          var oCheckbox = oSettings.getItems()[SearchFacetDialogHelper.POS_SHOWONTOP_CHECKBOX];
          if (oDetailPageAttributeList.getSelectedContexts().length > 0) {
            oCheckbox.setEnabled(true);
          }
          // update detail page list items select
          SearchFacetDialogHelper.updateDetailPageListItemsSelected(oDetailPageAttributeList, oAdvancedContainer);
          // update possible charts avr
          SearchFacetDialogHelper.dialog.updateDetailPageCharts(aItems);
        });
      }
      // collect all filters in dialog for single facet call
    }, {
      key: "applyChartQueryFilter",
      value: function applyChartQueryFilter(excludedIndex) {
        var oFacetModel = SearchFacetDialogHelper.dialog.getModel();
        oFacetModel.resetChartQueryFilterConditions();
        var aDetailPages = SearchFacetDialogHelper.dialog.oSplitContainer.getDetailPages();
        for (var i = 0; i < aDetailPages.length; i++) {
          var detailPage = aDetailPages[i];
          if (i === excludedIndex || detailPage.getContent().length === 0) {
            continue;
          }
          var facet = detailPage.getBindingContext().getObject();
          if (facet instanceof SearchHierarchyDynamicFacet) {
            this.applyDynamicHierarchyChartQueryFilter(facet, oFacetModel);
            continue;
          }
          var oList = void 0;
          if (!detailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER]) {
            // new layout
            oList = detailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
          } else {
            // old layout
            oList = detailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
          }
          for (var j = 0; j < oList.getItems().length; j++) {
            var oListItem = oList.getItems()[j];
            var oListItemBindingObject = oListItem.getBindingContext().getObject();
            var filterCondition = oListItemBindingObject.filterCondition;
            if (filterCondition.attribute || filterCondition.conditions) {
              if (oListItem.getSelected() && !SearchFacetDialogHelper.bResetFilterIsActive) {
                oFacetModel.chartQuery.filter.autoInsertCondition(filterCondition);
              }
            }
          }
          SearchFacetDialogHelper.applyAdvancedCondition(detailPage, SearchFacetDialogHelper.getFacetList().getItems()[i].getBindingContext().getObject(), SearchFacetDialogHelper.dialog.getModel());
        }
      }
    }, {
      key: "applyDynamicHierarchyChartQueryFilter",
      value: function applyDynamicHierarchyChartQueryFilter(facet, model) {
        var _iterator = _createForOfIteratorHelper(model.aFilters),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var filter = _step.value;
            var facetItem = filter;
            var filterCondition = facetItem.filterCondition;
            if (filterCondition instanceof SimpleCondition && filterCondition.attribute === facet.attributeId) {
              model.chartQuery.filter.autoInsertCondition(filterCondition.clone());
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      // removes all filters in dialog for single facet call
    }, {
      key: "resetChartQueryFilters",
      value: function resetChartQueryFilters() {
        var oFacetModel = SearchFacetDialogHelper.dialog.getModel();
        oFacetModel.resetChartQueryFilterConditions();
        var aDetailPages = SearchFacetDialogHelper.dialog.oSplitContainer.getDetailPages();
        for (var i = 0; i < aDetailPages.length; i++) {
          if (aDetailPages[i].getContent().length === 0) {
            continue;
          }
          var facet = aDetailPages[i].getBindingContext().getObject();
          if (facet instanceof SearchHierarchyDynamicFacet) {
            continue;
          }
          var oList = void 0;
          if (!aDetailPages[i].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER]) {
            // new layout
            oList = aDetailPages[i].getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getAggregation("items")[SearchFacetDialogHelper.POS_TABBAR_LIST].getContent()[0].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
          } else {
            // old layout
            oList = aDetailPages[i].getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
          }
          for (var j = 0; j < oList.getItems().length; j++) {
            var oListItem = oList.getItems()[j];
            var oListItemBindingObject = oListItem.getBindingContext().getObject();
            var filterCondition = oListItemBindingObject.filterCondition;
            if (filterCondition.attribute || filterCondition.conditions) {
              if (oListItem.getSelected()) {
                oListItem.setSelected(false);
              }
            }
          }
        }
      }

      // collect all advanced filter condition in a detail page
    }, {
      key: "applyAdvancedCondition",
      value: function applyAdvancedCondition(oDetailPage, oFacetItemBinding, oAppliedObject) {
        var oFacetModel = SearchFacetDialogHelper.dialog.getModel();
        var sDataType, oAdvancedConditionList, k, oAdvancedCondition, oAdvancedCheckBox, fromCondition, toCondition, oConditionGroup;
        if (oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER]) {
          // old layout, number and date layout
          var oListAndConditionContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER];
          sDataType = oListAndConditionContainer.data("dataType");
          oAdvancedConditionList = oListAndConditionContainer.getContent(); // from index 1
          switch (sDataType) {
            case "timestamp":
            case "date":
              SearchFacetDialogHelper.oDateTimeFormat = sDataType === "timestamp" ? SearchFacetDialogHelper.oTimestampFormat : SearchFacetDialogHelper.oDateFormat;
              for (k = 1; k < oAdvancedConditionList.length; k++) {
                oAdvancedCondition = oAdvancedConditionList[k];
                oAdvancedCheckBox = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_CHECKBOX];
                var oDateRangeSelection = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT];
                if (oAdvancedCheckBox.getSelected() && oDateRangeSelection.getDateValue() && oDateRangeSelection.getSecondDateValue()) {
                  var secondDateObject = new Date(oDateRangeSelection.getSecondDateValue().getFullYear(), oDateRangeSelection.getSecondDateValue().getMonth(), oDateRangeSelection.getSecondDateValue().getDate(), 23, 59, 59);
                  var dateValue = SearchFacetDialogHelper.oDateTimeFormat.format(oDateRangeSelection.getDateValue());
                  var secondDateValue = SearchFacetDialogHelper.oDateTimeFormat.format(secondDateObject);
                  fromCondition = oFacetModel.sinaNext.createSimpleCondition({
                    attribute: oFacetItemBinding.dimension,
                    attributeLabel: oFacetItemBinding.title,
                    operator: oFacetModel.sinaNext.ComparisonOperator.Ge,
                    value: sDataType === "timestamp" ? oDateRangeSelection.getDateValue() : dateValue,
                    valueLabel: dateValue
                  });
                  toCondition = oFacetModel.sinaNext.createSimpleCondition({
                    attribute: oFacetItemBinding.dimension,
                    attributeLabel: oFacetItemBinding.title,
                    operator: oFacetModel.sinaNext.ComparisonOperator.Le,
                    value: sDataType === "timestamp" ? secondDateObject : secondDateValue,
                    valueLabel: secondDateValue
                  });
                  oConditionGroup = oFacetModel.sinaNext.createComplexCondition({
                    valueLabel: oDateRangeSelection.getValue(),
                    operator: oFacetModel.sinaNext.LogicalOperator.And,
                    conditions: [fromCondition, toCondition],
                    userDefined: true
                  });
                  if (!SearchFacetDialogHelper.bResetFilterIsActive) {
                    oAppliedObject.addFilterCondition(oConditionGroup, false);
                  }
                }
              }
              break;
            case "integer":
            case "number":
              SearchFacetDialogHelper.oNumberFormat = sDataType === "integer" ? SearchFacetDialogHelper.oIntegernumberFormat : SearchFacetDialogHelper.oFloatNumberFormat;
              for (k = 1; k < oAdvancedConditionList.length; k++) {
                oAdvancedCondition = oAdvancedConditionList[k];
                oAdvancedCheckBox = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_CHECKBOX];
                var oAdvancedInputLeft = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[0];
                var oAdvancedInputRight = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[2];
                var oAdvancedLebel = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[1];
                var oAdvancedInputLeftValue = SearchFacetDialogHelper.oNumberFormat.parse(oAdvancedInputLeft.getValue());
                var oAdvancedInputRightValue = SearchFacetDialogHelper.oNumberFormat.parse(oAdvancedInputRight.getValue());
                if (oAdvancedCheckBox.getSelected()) {
                  if (!isNaN(oAdvancedInputLeftValue) &&
                  // ToDo
                  !isNaN(oAdvancedInputRightValue) &&
                  // ToDo
                  oAdvancedInputRightValue >= oAdvancedInputLeftValue) {
                    fromCondition = oFacetModel.sinaNext.createSimpleCondition({
                      attribute: oFacetItemBinding.dimension,
                      attributeLabel: oFacetItemBinding.title,
                      operator: oFacetModel.sinaNext.ComparisonOperator.Ge,
                      value: oAdvancedInputLeftValue,
                      // ToDo
                      valueLabel: SearchFacetDialogHelper.oNumberFormat.format(oAdvancedInputLeftValue),
                      // ToDo
                      userDefined: true
                    });
                    toCondition = oFacetModel.sinaNext.createSimpleCondition({
                      attribute: oFacetItemBinding.dimension,
                      attributeLabel: oFacetItemBinding.title,
                      operator: oFacetModel.sinaNext.ComparisonOperator.Le,
                      value: oAdvancedInputRightValue,
                      // ToDo
                      valueLabel: SearchFacetDialogHelper.oNumberFormat.format(oAdvancedInputRightValue),
                      // ToDo
                      userDefined: true
                    });
                    oConditionGroup = oFacetModel.sinaNext.createComplexCondition({
                      valueLabel: SearchFacetDialogHelper.oNumberFormat.format(oAdvancedInputLeftValue) +
                      // ToDo
                      oAdvancedLebel.getText() + SearchFacetDialogHelper.oNumberFormat.format(oAdvancedInputRightValue),
                      // ToDo
                      operator: oFacetModel.sinaNext.LogicalOperator.And,
                      conditions: [fromCondition, toCondition],
                      userDefined: true
                    });
                    if (!SearchFacetDialogHelper.bResetFilterIsActive) {
                      oAppliedObject.addFilterCondition(oConditionGroup, false);
                    }
                  } else {
                    var oSearchModel = SearchFacetDialogHelper.dialog.getModel("searchModel");
                    var messageItem = {
                      type: MessageType.Error,
                      title: i18n.getText("filterInputErrorTitle"),
                      description: i18n.getText("filterInputError")
                    };
                    oSearchModel.pushUIMessage(messageItem);
                    SearchFacetDialogHelper.dialog.bConditionValidateError = true;
                  }
                }
              }
              break;
            default:
              break;
          }
        } else {
          // new layout, string and text facet
          var oAdvancedContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getItems()[SearchFacetDialogHelper.POS_TABBAR_CONDITION].getContent()[0];
          sDataType = oAdvancedContainer.data("dataType");
          oAdvancedConditionList = oAdvancedContainer.getContent();
          var oAdvancedSelect, oAdvancedInput, sConditionTerm, oFilterCondition, sOperator;
          switch (sDataType) {
            case "string":
              for (k = 0; k < oAdvancedConditionList.length - 1; k++) {
                oAdvancedCondition = oAdvancedConditionList[k];
                oAdvancedSelect = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[0];
                oAdvancedInput = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[1];
                sConditionTerm = oAdvancedInput.getValue();
                switch (oAdvancedSelect.getSelectedKey()) {
                  case "eq":
                    // sConditionTerm = oAdvancedInput.getValue();
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Eq;
                    break;
                  case "ew":
                    // sConditionTerm = "*" + oAdvancedInput.getValue();
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Ew;
                    break;
                  case "bw":
                    // sConditionTerm = oAdvancedInput.getValue() + "*";
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Bw;
                    break;
                  case "co":
                    // sConditionTerm = "*" + oAdvancedInput.getValue() + "*";
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Co;
                    break;
                  default:
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Eq;
                    break;
                }
                if (oAdvancedInput.getValue()) {
                  oFilterCondition = oFacetModel.sinaNext.createSimpleCondition({
                    attribute: oFacetItemBinding.dimension,
                    attributeLabel: oFacetItemBinding.title,
                    operator: sOperator,
                    value: sConditionTerm,
                    valueLabel: sConditionTerm,
                    userDefined: true
                  });
                  if (!SearchFacetDialogHelper.bResetFilterIsActive) {
                    oAppliedObject.addFilterCondition(oFilterCondition, false);
                  }
                }
              }
              break;
            case "text":
              for (k = 0; k < oAdvancedConditionList.length - 1; k++) {
                oAdvancedCondition = oAdvancedConditionList[k];
                oAdvancedSelect = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[0];
                oAdvancedInput = oAdvancedCondition.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[1];
                sConditionTerm = oAdvancedInput.getValue();
                switch (oAdvancedSelect.getSelectedKey()) {
                  case "co":
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Co;
                    break;
                  default:
                    sOperator = oFacetModel.sinaNext.ComparisonOperator.Eq;
                }
                if (oAdvancedInput.getValue()) {
                  oFilterCondition = oFacetModel.sinaNext.createSimpleCondition({
                    attribute: oFacetItemBinding.dimension,
                    attributeLabel: oFacetItemBinding.title,
                    operator: sOperator,
                    value: sConditionTerm,
                    valueLabel: sConditionTerm,
                    userDefined: true
                  });
                  if (!SearchFacetDialogHelper.bResetFilterIsActive) {
                    oAppliedObject.addFilterCondition(oFilterCondition, false);
                  }
                }
              }
              break;
            default:
              break;
          }
        }
      }

      // update advanced conditions after detail page factory
    }, {
      key: "initiateAdvancedConditions",
      value: function initiateAdvancedConditions(oAdvancedContainer, aItems, type) {
        var aConditions, oConditionLayout, oCheckBox, oInputLayout, operator;
        var oFacetModel = SearchFacetDialogHelper.dialog.getModel();
        for (var i = aItems.length; i > 0; i--) {
          var item = aItems[i - 1];
          if (item.advanced) {
            aConditions = oAdvancedContainer.getContent();
            if (type === "string" || type === "text") {
              oConditionLayout = aConditions[aConditions.length - 2];
            } else {
              oConditionLayout = aConditions[aConditions.length - 1];
            }
            oCheckBox = oConditionLayout.getContent()[SearchFacetDialogHelper.POS_ADVANCED_CHECKBOX];
            oCheckBox.setSelected(true);
            oInputLayout = oConditionLayout.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT];
            switch (type) {
              case "integer":
              case "number":
                {
                  var oInputBoxLeft = oInputLayout.getContent()[0];
                  var oInputBoxRight = oInputLayout.getContent()[2];
                  if (item.filterCondition.conditions) {
                    for (var j = 0; j < item.filterCondition.conditions.length; j++) {
                      var condition = item.filterCondition.conditions[j];
                      if (condition.operator === "Ge") {
                        oInputBoxLeft.setValue(condition.valueLabel || SearchFacetDialogHelper.oNumberFormat.format(condition.value));
                      }
                      if (condition.operator === "Le") {
                        oInputBoxRight.setValue(condition.valueLabel || SearchFacetDialogHelper.oNumberFormat.format(condition.value));
                      }
                    }
                  }
                  break;
                }
              case "string":
                operator = item.filterCondition.operator;
                if (operator === "Co") {
                  oInputLayout.getContent()[0].setSelectedKey("co");
                } else if (operator === "Ew") {
                  oInputLayout.getContent()[0].setSelectedKey("ew");
                } else if (operator === "Bw") {
                  oInputLayout.getContent()[0].setSelectedKey("bw");
                }
                oInputLayout.getContent()[1].setValue(item.filterCondition.valueLabel);
                break;
              case "text":
                operator = item.filterCondition.operator;
                if (operator === "Co") {
                  oInputLayout.getContent()[0].setSelectedKey("co");
                }
                oInputLayout.getContent()[1].setValue(item.filterCondition.valueLabel);
                break;
              default:
                oInputLayout.setValue(item.label);
                break;
            }
            SearchFacetDialogHelper.insertNewAdvancedCondition(oConditionLayout, type);
            oFacetModel.changeFilterAdvaced(item, true);
          }
        }
        oAdvancedContainer.data("initial", false);
      }

      // callback function, update selected property after model changed
    }, {
      key: "updateDetailPageListItemsSelected",
      value: function updateDetailPageListItemsSelected(oDetailPageAttributeList, oAdvancedContainer) {
        var sDataType = oAdvancedContainer.data("dataType");
        SearchFacetDialogHelper.sortingAttributeList(oDetailPageAttributeList.getParent().getParent());
        oDetailPageAttributeList.getParent().setBusy(false);
        if (sDataType === "date" || sDataType === "timestamp" || sDataType === "number" || sDataType === "integer") {
          oDetailPageAttributeList.focus();
        }
      }

      // remove duplicate advanced condition
    }, {
      key: "removeAdvancedCondition",
      value: function removeAdvancedCondition(oAdvancedContainer, oListItem, type) {
        var aConditions = oAdvancedContainer.getContent();
        var oConditionLayout, oInputBox, index;
        if (type === "string" || type === "text") {
          for (var i = 0; i < aConditions.length - 1; i++) {
            oConditionLayout = aConditions[i];
            oInputBox = oConditionLayout.getContent()[SearchFacetDialogHelper.POS_ADVANCED_INPUT_LAYOUT].getContent()[1];
            if (oInputBox.getProperty("value")) {
              var value = oInputBox.getValue();
              var oListItemBindingObject = oListItem.getBindingContext().getObject();
              if (value === oListItemBindingObject.filterCondition.value) {
                index = i;
                break;
              }
            }
          }
        }
        oAdvancedContainer.removeContent(index);
      }

      // sorting the attribute list
    }, {
      key: "sortingAttributeList",
      value: function sortingAttributeList(oDetailPage) {
        var oSettings = oDetailPage.getContent()[SearchFacetDialogHelper.POS_SETTING_CONTAINER];
        var oSelect = oSettings.getItems()[SearchFacetDialogHelper.POS_SORTING_SELECT].getItems()[0];
        var oCheckBox = oSettings.getItems()[SearchFacetDialogHelper.POS_SHOWONTOP_CHECKBOX];
        var oList = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER].getContent()[0];
        var sDataType = oList.data("dataType");
        var oBinding = oList.getBinding("items");
        var aSorters = [];
        if (oCheckBox.getSelected()) {
          aSorters.push(new Sorter("selected", true, false));
        }
        switch (oSelect.getSelectedKey()) {
          case "sortName":
            aSorters.push(new Sorter("label", false, false));
            break;
          case "sortCount":
            aSorters.push(new Sorter("value", true, false));
            if (sDataType === "string" || sDataType === "text") {
              aSorters.push(new Sorter("label", false, false));
            }
            break;
          default:
            break;
        }
        oBinding.sort(aSorters);
      }

      // insert new advanced condition
    }, {
      key: "insertNewAdvancedCondition",
      value: function insertNewAdvancedCondition(oAdvancedCondition, type) {
        var oAdvancedContainer = oAdvancedCondition.getParent();
        var oNewAdvancedCondition = new SearchFacetDialogHelper.searchAdvancedCondition("", {
          // ToDo 'any'
          type: type
        });
        if (type === "string" || type === "text") {
          var insertIndex = oAdvancedContainer.getContent().length - 1;
          oAdvancedContainer.insertContent(oNewAdvancedCondition, insertIndex);
        } else {
          var index = oAdvancedContainer.indexOfContent(oAdvancedCondition);
          if (index === oAdvancedContainer.getContent().length - 1) {
            oAdvancedContainer.addContent(oNewAdvancedCondition);
          }
        }
      }

      // helper function
    }, {
      key: "deleteAdvancedCondition",
      value: function deleteAdvancedCondition(oAdvancedCondition) {
        var oAdvancedContainer = oAdvancedCondition.getParent();
        var oDetailPage = oAdvancedCondition.getParent().getParent().getParent().getParent().getParent();
        oAdvancedContainer.removeContent(oAdvancedCondition);
        SearchFacetDialogHelper.updateCountInfo(oDetailPage);
      }

      // set count info in master page facet list
    }, {
      key: "updateCountInfo",
      value: function updateCountInfo(oDetailPage) {
        var oMasterPageList = SearchFacetDialogHelper.getFacetList();
        var oMasterPageListItem = oMasterPageList.getSelectedItem();
        if (!oMasterPageListItem) {
          oMasterPageListItem = oMasterPageList.getItems()[0];
        }
        var oFacetModel = oMasterPageListItem.getBindingContext().getModel();
        var sMasterBindingPath = oMasterPageListItem.getBindingContext().getPath();
        var sDimension = oFacetModel.getProperty(sMasterBindingPath).dimension;
        var aFilters = oFacetModel.aFilters;
        var countNormalCondition = 0;
        var _iterator2 = _createForOfIteratorHelper(aFilters),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var filter = _step2.value;
            if (!filter.advanced && filter.facetAttribute === sDimension) {
              countNormalCondition++;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        var oAdvancedContainer;
        var sDataType = oFacetModel.getAttributeDataType(oFacetModel.getProperty(sMasterBindingPath));
        if (sDataType === "string" || sDataType === "text") {
          oAdvancedContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ICONTABBAR].getItems()[SearchFacetDialogHelper.POS_TABBAR_CONDITION].getContent()[0];
        } else {
          oAdvancedContainer = oDetailPage.getContent()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER];
        }
        var advancedConditions = oAdvancedContainer.getContent();
        var countAdvancedCondition = 0;
        var _iterator3 = _createForOfIteratorHelper(advancedConditions),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var advancedCondition = _step3.value;
            if (typeof advancedCondition.getContent === "function" /* skip first item (list of ranges) */) {
              var oAdvancedConditionCheckbox = advancedCondition.getContent()[0];
              if (oAdvancedConditionCheckbox.getSelected()) {
                countAdvancedCondition++;
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        var sFacetType = oFacetModel.getProperty(sMasterBindingPath).facetType;
        if (sFacetType === "attribute") {
          var count = countNormalCondition + countAdvancedCondition;
          oFacetModel.setProperty(sMasterBindingPath + "/count", count);
          SearchFacetDialogHelper.dialog.resetEnabledForFilterResetButton();
        }
      }
    }]);
    return SearchFacetDialogHelper;
  }();
  return SearchFacetDialogHelper;
});
})();