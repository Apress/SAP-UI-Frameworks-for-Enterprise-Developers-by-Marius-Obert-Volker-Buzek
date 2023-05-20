/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/base/Log", "sap/m/Button", "sap/m/Title", "sap/m/List", "sap/m/CustomListItem", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/ActionSheet", "sap/m/Link", "sap/m/Label", "sap/m/VBox", "sap/m/library", "sap/ui/core/Control", "./SearchFacetDialog", "./SearchGroupHeaderListItem", "./SearchFacet", "./SearchFacetPieChart", "./SearchFacetBarChart", "../SearchFacetDialogModel", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (__i18n, Log, Button, Title, List, CustomListItem, Toolbar, ToolbarSpacer, ActionSheet, Link, Label, VBox, sap_m_library, Control, __SearchFacetDialog, __SearchGroupHeaderListItem, __SearchFacet, __SearchFacetPieChart, __SearchFacetBarChart, __SearchFacetDialogModel, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var i18n = _interopRequireDefault(__i18n);
  var ButtonType = sap_m_library["ButtonType"];
  var ListSeparators = sap_m_library["ListSeparators"];
  var PlacementType = sap_m_library["PlacementType"];
  var SearchFacetDialog = _interopRequireDefault(__SearchFacetDialog);
  var SearchGroupHeaderListItem = _interopRequireDefault(__SearchGroupHeaderListItem);
  var SearchFacet = _interopRequireDefault(__SearchFacet);
  var SearchFacetPieChart = _interopRequireDefault(__SearchFacetPieChart);
  var SearchFacetBarChart = _interopRequireDefault(__SearchFacetBarChart);
  var SearchFacetDialogModel = _interopRequireDefault(__SearchFacetDialogModel);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetTabBar = Control.extend("sap.esh.search.ui.controls.SearchFacetTabBar", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        var _oSearchModel$config6, _oSearchModel$config8;
        var tabBarItems = oControl.getAggregation("items");
        if (tabBarItems.length === 0) {
          return;
        }
        var createOpenFacetDialogFn = function createOpenFacetDialogFn(iSelectedTabBarIndex, aTabBarItems) {
          return function () {
            var dimension;
            // since UI5 reuses the showMore link control, we have to traverse the DOM
            // to find our facets dimension.

            // sapUshellSearchFacetTabBar sapUshellSearchFacet
            var node = $(oControl.getDomRef()).closest(".sapUshellSearchFacetTabBar")[0];
            var facet = sap.ui.getCore().byId($(node).attr("id"));
            var oSearchModel = oControl.getModel();
            var oSearchFacetDialogModel = new SearchFacetDialogModel({
              searchModel: oSearchModel
            });
            oSearchFacetDialogModel.initBusinessObjSearch().then(function () {
              var _facet$getBindingCont, _oSearchModel$config, _oSearchModel$config2;
              oSearchFacetDialogModel.setData(oSearchModel.getData());
              oSearchFacetDialogModel.config = oSearchModel.config;
              oSearchFacetDialogModel.sinaNext = oSearchModel.sinaNext;
              if (facet !== null && facet !== void 0 && (_facet$getBindingCont = facet.getBindingContext()) !== null && _facet$getBindingCont !== void 0 && _facet$getBindingCont.getObject()["dimension"] // ToDo
              ) {
                dimension = facet.getBindingContext().getObject()["dimension"]; // ToDo
              }

              if (dimension === ((_oSearchModel$config = oSearchModel.config) === null || _oSearchModel$config === void 0 ? void 0 : _oSearchModel$config.dimensionNameSpace_Description) && (_oSearchModel$config2 = oSearchModel.config) !== null && _oSearchModel$config2 !== void 0 && _oSearchModel$config2.openSpaceShowMoreDialog) {
                var _oSearchModel$config3;
                return (_oSearchModel$config3 = oSearchModel.config) === null || _oSearchModel$config3 === void 0 ? void 0 : _oSearchModel$config3.openSpaceShowMoreDialog(dimension, oSearchModel);
              }
              oSearchFacetDialogModel.prepareFacetList();
              var oDialog = new SearchFacetDialog("".concat(oSearchModel.config.id, "-SearchFacetDialog"), {
                selectedAttribute: dimension,
                selectedTabBarIndex: iSelectedTabBarIndex,
                tabBarItems: aTabBarItems
              });
              oDialog.setModel(oSearchFacetDialogModel);
              oDialog.setModel(oSearchModel, "searchModel");
              // referece to page, so that dialog can be destroy in onExit()
              var oPage = oControl.getParent().getParent().getParent().getParent(); // ToDo;
              oPage.oFacetDialog = oDialog;
              oDialog.open();
              oSearchModel.eventLogger.logEvent({
                type: UserEventType.FACET_SHOW_MORE,
                referencedAttribute: dimension
              });
            });
          };
        };

        // outer div
        oRm.openStart("div", oControl);
        oRm.attr("tabindex", "0");
        oRm.attr("aria-label", i18n.getText("filterBy"));
        oRm["class"]("sapUshellSearchFacetTabBar");
        oRm.openEnd();
        var dimension = oControl.getBindingContext().getObject()["dimension"]; // ToDo
        var dataType = oControl.getBindingContext().getObject()["dataType"]; // ToDo
        var title = oControl.getBindingContext().getObject()["title"]; // ToDo
        var selectedButtonParameters;
        var oSearchModel = oControl.getModel();
        var clickedTabInformation = oSearchModel.getPersonalizationStorageInstance().getItem("search-facet-panel-chart-state");
        if (clickedTabInformation && Object.prototype.toString.call(clickedTabInformation) === "[object Array]") {
          var _iterator = _createForOfIteratorHelper(clickedTabInformation),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var clickedTabInformationItem = _step.value;
              if (clickedTabInformationItem.dimension === dimension) {
                selectedButtonParameters = clickedTabInformationItem;
                break;
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
        var buttons = [];
        var contents = [];
        var oButton = null;
        var selectedButtonIndex = 0;
        if (selectedButtonParameters && selectedButtonParameters.buttonIndex) {
          var selectedButtonIndexString = selectedButtonParameters.buttonIndex;
          selectedButtonIndex = parseInt(selectedButtonIndexString, 10);
        }
        if (dataType != oSearchModel.sinaNext.AttributeType.String) {
          selectedButtonIndex = 0;
        }

        // also store information in model
        oControl.getBindingContext().getObject()["chartIndex"] = selectedButtonIndex;
        var oDropDownButton = new Button("", {
          icon: tabBarItems[selectedButtonIndex].getIcon(),
          type: ButtonType.Transparent
        });
        var tabBarIndex = 0;
        var _iterator2 = _createForOfIteratorHelper(tabBarItems),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var tabBarItem = _step2.value;
            var oFacet = tabBarItem.getContent()[0];
            if (
            // shall be always true (prevent type-cast)
            oFacet instanceof SearchFacet || oFacet instanceof SearchFacetPieChart || oFacet instanceof SearchFacetBarChart) {
              oButton = new Button("", {
                text: tabBarItem.getText(),
                icon: tabBarItem.getIcon(),
                press: function press(oEvent) {
                  oControl.storeClickedTabInformation(oEvent);
                  oControl.setProperty("selectedButtonParameters", oEvent.getParameters()); // needed to trigger rerender
                }
              });

              oButton.data("facet-view", tabBarItem.getText(), true);
              oButton.data("facet-view-index", "" + tabBarIndex, true);
              oButton.data("dimension", dimension, true);
              buttons.push(oButton);
              contents.push(oFacet);
            }
            tabBarIndex++;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        var oActionSheet = new ActionSheet("", {
          showCancelButton: false,
          buttons: buttons,
          placement: PlacementType.Bottom,
          cancelButtonPress: function cancelButtonPress() {
            Log.info("sap.m.ActionSheet: cancelButton is pressed");
          },
          afterClose: function afterClose() {
            window.setTimeout(function () {
              var dimension = oControl.getFocusDomRef().getAttribute("data-facet-dimension");
              var tabBarButtons = $(".sapUshellSearchFacetTabBarButton");
              for (var i = 0; i < tabBarButtons.length; i++) {
                var tabBarButton = tabBarButtons[i];
                var tabBarButtonDimension = tabBarButton.parentNode.parentNode // ToDo
                .getAttribute("data-facet-dimension"); // TODO: clean-code
                if (tabBarButtonDimension === dimension) {
                  tabBarButton.focus();
                  break;
                }
              }
            }, 100);
            Log.info("=====================");
            Log.info("sap.m.ActionSheet: closed");
          }
        });
        oActionSheet.data("facet-dimension", dimension, true);
        oDropDownButton.addStyleClass("sapUshellSearchFacetTabBarButton");
        var asWhat = tabBarItems[selectedButtonIndex].getText();
        var displayAs = i18n.getText("displayAs", [asWhat]);
        oDropDownButton.setTooltip(displayAs);
        oDropDownButton.attachPress(function () {
          oActionSheet.openBy(oDropDownButton);
        });
        oDropDownButton.onAfterRendering = function () {
          $(oDropDownButton.getDomRef()).attr("aria-label", i18n.getText("dropDown"));
        };

        // RENDERING

        // set 'filter by' header
        if (oControl.getProperty("headerText")) {
          var _oSearchModel$config4, _oSearchModel$config5;
          // ===============================================
          var oHeader = new List("", {});
          oHeader.setShowNoData(false);
          oHeader.setShowSeparators(ListSeparators.None);
          oHeader.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);

          var bFiltersExist = false;
          var rootCondition = oSearchModel.getProperty("/uiFilter/rootCondition");
          if (rootCondition.hasFilters()) {
            bFiltersExist = true;
            if (oSearchModel.filterWithoutFilterByConditions()) {
              bFiltersExist = false;
            }
            // DWC exit, remove after replacing space facet by folder
            if (typeof oSearchModel.config.hasSpaceFiltersOnly === "function") {
              if (oSearchModel.config.hasSpaceFiltersOnly(rootCondition) === true) {
                bFiltersExist = false;
              }
            }
          } else {
            bFiltersExist = false;
          }
          var oResetButton = new Button("", {
            icon: "sap-icon://clear-filter",
            tooltip: i18n.getText("resetFilterButton_tooltip"),
            type: ButtonType.Transparent,
            enabled: bFiltersExist,
            press: function press() {
              oSearchModel.eventLogger.logEvent({
                type: UserEventType.CLEAR_ALL_FILTERS
              });
              oSearchModel.resetFilterByFilterConditions(true);
            }
          });
          if (oSearchModel !== null && oSearchModel !== void 0 && (_oSearchModel$config4 = oSearchModel.config) !== null && _oSearchModel$config4 !== void 0 && _oSearchModel$config4.searchInAttibuteFacetPostion[dimension]) {
            oResetButton.addStyleClass("sapUshellSearchFilterByResetButtonHidden");
          } else {
            oResetButton.addStyleClass("sapUshellSearchFilterByResetButton");
          }
          oResetButton.onAfterRendering = function () {
            $(oControl.getDomRef()).attr("aria-label", i18n.getText("resetFilterButton_tooltip"));
          };
          var oLabel = new Title("", {
            text: oControl.getProperty("headerText")
          });
          var oSpacer = new ToolbarSpacer();
          var oHeaderToolbar = new Toolbar("", {
            content: [oLabel, oSpacer, oResetButton]
          });
          oHeaderToolbar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);

          oHeader.setHeaderToolbar(oHeaderToolbar);
          if (dimension === ((_oSearchModel$config5 = oSearchModel.config) === null || _oSearchModel$config5 === void 0 ? void 0 : _oSearchModel$config5.dimensionNameSpace_Description)) {
            oHeader.setVisible(false);
          } else {
            oHeader.addStyleClass("sapUshellSearchFilterByHeaderList");
          }
          oHeader.onAfterRendering = function () {
            $(".sapUshellSearchFilterByHeaderList").find("ul").attr("tabindex", "-1");
            $(".sapUshellSearchFilterByHeaderList").find("div").attr("tabindex", "-1");
          };
          oRm.renderControl(oHeader);

          //===============================================
        }

        var oListItem = new CustomListItem({
          content: contents[selectedButtonIndex]
          // the above line sadly removes the control from the searchFacetTabBar and relocates it in the ListItem
        });

        oListItem.setModel(oControl.getModel(), "facets");
        oListItem.addStyleClass("sapUshellSearchFacetList");
        var oGroupHeaderListItem;
        if (dataType === oSearchModel.sinaNext.AttributeType.String) {
          oGroupHeaderListItem = new SearchGroupHeaderListItem("", {
            title: title,
            button: oDropDownButton
          });
        } else {
          oGroupHeaderListItem = new SearchGroupHeaderListItem("", {
            title: title
          });
        }
        oGroupHeaderListItem.data("facet-dimension", dimension, true);
        if ((_oSearchModel$config6 = oSearchModel.config) !== null && _oSearchModel$config6 !== void 0 && _oSearchModel$config6.searchInAttibuteFacetPostion[dimension]) {
          var _oSearchModel$config7;
          if (dimension === ((_oSearchModel$config7 = oSearchModel.config) === null || _oSearchModel$config7 === void 0 ? void 0 : _oSearchModel$config7.dimensionNameSpace_Description)) {
            // do not hide
          } else {
            oGroupHeaderListItem.addStyleClass("sapUshellSearchFacetTabBarHeader");
            oGroupHeaderListItem.addStyleClass("sapUshellSearchFacetTabBarHeaderHidden");
          }
        } else {
          oGroupHeaderListItem.addStyleClass("sapUshellSearchFacetTabBarHeader");
        }

        //---------------------
        var linkText = i18n.getText("showMore");
        // DWC space facet
        if (dimension === ((_oSearchModel$config8 = oSearchModel.config) === null || _oSearchModel$config8 === void 0 ? void 0 : _oSearchModel$config8.dimensionNameSpace_Description)) {
          linkText = i18n.getText("showMoreDwcSpace");
        }
        var oShowMore = new Link("", {
          text: linkText,
          press: createOpenFacetDialogFn(selectedButtonIndex, tabBarItems).bind(oControl)
        });
        oShowMore.setModel(oControl.getModel("i18n"));
        oShowMore.addStyleClass("sapUshellSearchFacetShowMoreLink");
        var oInfoZeile = new Label("", {
          text: ""
        });
        oInfoZeile.addStyleClass("sapUshellSearchFacetInfoZeile");
        var oShowMoreSlot = new VBox("", {
          items: [oInfoZeile, oShowMore]
        });
        var oShowMoreItem = new CustomListItem({
          content: oShowMoreSlot,
          // oShowMore,
          visible: {
            parts: [{
              path: "/uiFilter/dataSource"
            }],
            formatter: function formatter(datasource) {
              var oModel = oControl.getModel();
              return datasource.type !== oModel.sinaNext.DataSourceType.Category;
            }
          }
        });
        oShowMoreItem.addStyleClass("sapUshellSearchFacetShowMoreItem");

        //------------------------
        var oList = new List("", {
          showSeparators: ListSeparators.None,
          items: [oGroupHeaderListItem, oListItem, oShowMoreItem]
        });
        oList.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
        oList.setModel(oControl.getModel());
        oRm.renderControl(oList);
        tabBarItems[selectedButtonIndex].addContent(contents[selectedButtonIndex]); // ToDo
        // the above line returns the control to the searchFacetTabBar - otherwise it is lost by being passed to another control

        oRm.close("div");
      }
    },
    metadata: {
      // the Control API
      properties: {
        eshRole: "string",
        // ToDo: needed/obsolete?
        headerText: "string",
        // including data binding and type validation
        selectedButtonParameters: {
          type: "object",
          defaultValue: null
        }
      },
      aggregations: {
        items: {
          type: "sap.m.IconTabFilter",
          multiple: true
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
    },
    getSearchFacetTabBarAndDimensionById: function _getSearchFacetTabBarAndDimensionById(buttonId) {
      var returnOBj = {};
      returnOBj.index = 0;
      var button = document.getElementById(buttonId);
      var view = button.dataset.facetView;
      var buttonIndex = button.dataset.facetViewIndex;
      var actionSheet = $("#" + buttonId).parent()[0];
      var dimension = actionSheet.dataset.facetDimension;
      var ar = $(".sapUshellSearchFacetTabBar");
      for (var i = 0; i < ar.length; i++) {
        var currentHeader = $(".sapUshellSearchFacetTabBar .sapUshellSearchFacetTabBarHeader")[i];
        var headerDimension = currentHeader.dataset.facetDimension;
        if (headerDimension === dimension) {
          returnOBj.index = i;
          returnOBj.control = sap.ui.getCore().byId(ar[i].id);
          returnOBj.view = view;
          returnOBj.buttonIndex = buttonIndex;
          returnOBj.dimension = dimension;
          break;
        }
      }
      return returnOBj;
    },
    storeClickedTabInformation: function _storeClickedTabInformation(oEvent) {
      var tabId = oEvent.getSource()["sId"]; // ToDo
      var searchFacetTabBarInfo = this.getSearchFacetTabBarAndDimensionById(tabId);
      var oSearchModel = searchFacetTabBarInfo.control.getModel();
      var previousClickedTabInformation = oSearchModel.getPersonalizationStorageInstance().getItem("search-facet-panel-chart-state");
      var searchFacetTabBarDimension = searchFacetTabBarInfo.dimension;
      var searchFacetTabBarControl = searchFacetTabBarInfo.control;
      var searchFacetTabBarView = searchFacetTabBarInfo.view;
      var buttonIndex = searchFacetTabBarInfo.buttonIndex;
      var dimension = searchFacetTabBarControl.getBindingContext().getObject()["dimension"]; // ToDo

      var buttonId = oEvent.getParameter("id");
      var clickedTabInformation = [];
      var obj = {};
      obj.tabId = tabId;
      // obj.searchFacetTabBarIndex = searchFacetTabBarInfo.searchFacetTabBarIndex;  // obsolete: property never filled
      obj.buttonId = buttonId;
      obj.buttonIndex = buttonIndex;
      obj.dimension = dimension;
      obj.view = searchFacetTabBarView;
      clickedTabInformation.push(obj);
      if (previousClickedTabInformation && Object.prototype.toString.call(previousClickedTabInformation) === "[object Array]") {
        var _iterator3 = _createForOfIteratorHelper(previousClickedTabInformation),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var previousClickedTabInformationItem = _step3.value;
            if (previousClickedTabInformationItem.dimension !== searchFacetTabBarDimension) {
              clickedTabInformation.push(previousClickedTabInformationItem);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      oSearchModel.getPersonalizationStorageInstance().setItem("search-facet-panel-chart-state", clickedTabInformation);

      // also store information in model
      searchFacetTabBarControl.getBindingContext().getObject()["chartIndex"] = buttonIndex; // ToDo
    }
  });

  return SearchFacetTabBar;
});
})();