/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../i18n", "sap/m/IconTabFilter", "sap/m/Button", "sap/m/VBox", "sap/m/GroupHeaderListItem", "./../error/errors", "sap/esh/search/ui/controls/SearchFacetQuickSelectDataSource", "sap/esh/search/ui/controls/SearchFacetHierarchyDynamic", "sap/esh/search/ui/controls/SearchFacetHierarchyStatic", "sap/esh/search/ui/controls/SearchFacet", "sap/esh/search/ui/controls/SearchFacetBarChart", "sap/esh/search/ui/controls/SearchFacetPieChart", "sap/ui/core/Control", "./SearchFacetTabBarRoles", "../sinaNexTS/providers/abap_odata/UserEventLogger", "./OpenShowMoreDialog", "sap/m/Toolbar", "sap/m/List", "sap/m/library", "sap/m/Title", "sap/m/ToolbarSpacer"], function (__i18n, IconTabFilter, Button, VBox, GroupHeaderListItem, __errors, SearchFacetQuickSelectDataSource, SearchFacetHierarchyDynamic, SearchFacetHierarchyStatic, SearchFacet, SearchFacetBarChart, SearchFacetPieChart, Control, __SearchFacetTabBarRoles, ___sinaNexTS_providers_abap_odata_UserEventLogger, ___OpenShowMoreDialog, Toolbar, List, sap_m_library, Title, ToolbarSpacer) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  var errors = _interopRequireDefault(__errors);
  var SearchFacetTabBarRoles = _interopRequireDefault(__SearchFacetTabBarRoles);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var openShowMoreDialog = ___OpenShowMoreDialog["openShowMoreDialog"];
  var ButtonType = sap_m_library["ButtonType"];
  var ListSeparators = sap_m_library["ListSeparators"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetFilter = Control.extend("sap.esh.search.ui.controls.SearchFacetFilter", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        var _oSearchModel$getData;
        var oSearchModel = oControl.getModel();

        // outer div
        oRm.openStart("div", oControl);
        oRm["class"]("sapUshellSearchFacetFilter");
        oRm.openEnd();
        var isFirstAttributeFacet = true;
        for (var i = 0, len = oControl.getAggregation("facets").length; i < len; i++) {
          // ToDo
          var facet = oControl.getAggregation("facets")[i];
          var facetModel = facet.getBindingContext().getObject();
          switch (facetModel.facetType) {
            case "attribute":
              facet.setEshRole("attribute");
              facet.attachSelectionChange(null, function () {
                // dont show the showAllBtn while the facet pane is empty
                var showAllBtn = oControl._getShowAllButton();
                var showAllBtnDomref = showAllBtn.getDomRef();
                if (showAllBtnDomref) {
                  jQuery(showAllBtnDomref).hide();
                } else {
                  // robustness
                }
              });
              if (facetModel.position > 999) {
                // Conventional facets without positions in config
                if (isFirstAttributeFacet) {
                  facet.setHeaderText(i18n.getText("filterBy"));
                  isFirstAttributeFacet = false;
                }
              } else {
                // DWC Exit
                facet.setHeaderText(facetModel.title);
                facet.addStyleClass("sapUshellSearchFacetSearchInAttribute");
              }
              oRm.renderControl(facet);
              break;
            case "datasource":
              facet.setEshRole("datasource");
              facet.addStyleClass("sapUshellSearchFacetDataSource");
              oRm.renderControl(facet);
              break;
            case "quickSelectDataSource":
              if (typeof facet.setHeaderText === "function") {
                facet.setHeaderText(i18n.getText("quickSelectDataSourcesHeader"));
              }
              facet.addStyleClass("sapUshellSearchFacetQuickSelectDataSource");
              oRm.renderControl(facet);
              break;
            case "hierarchy":
              if (facetModel.position > 999) {
                // Conventional facets without positions in config
                if (isFirstAttributeFacet) {
                  // facet.setHeaderText(i18n.getText("filterBy"));
                  facet.setHeaderToolbar(oControl._headToolBar4FirstFacet(oSearchModel));
                  isFirstAttributeFacet = false;
                }
              } else {
                // DWC Exit
                facet.setHeaderText(facetModel.title);
                facet.addStyleClass("sapUshellSearchFacetSearchInAttribute");
              }
              oRm.renderControl(facet);
              break;
            case "hierarchyStatic":
              oRm.renderControl(facet);
              break;
            default:
              throw "program error: unknown facet type :" + facetModel.facetType;
          }
        }

        // show all filters button
        if (((_oSearchModel$getData = oSearchModel.getDataSource()) === null || _oSearchModel$getData === void 0 ? void 0 : _oSearchModel$getData.type) === "BusinessObject") {
          var hasDialogFacets = oSearchModel.oFacetFormatter.hasDialogFacetsFromMetaData(oSearchModel);
          var hasResultItems = oControl.getModel().getProperty("/boCount") > 0;
          if (hasDialogFacets && hasResultItems) {
            var showAllButton = oControl._getShowAllButton();
            if (showAllButton !== null) {
              oRm.openStart("div", oControl.getId() + "-showAllFilters");
              oRm.openEnd();
              showAllButton.setModel(oControl.getModel("i18n"));
              showAllButton.addStyleClass("sapUshellSearchFacetFilterShowAllFilterBtn");
              oRm.renderControl(showAllButton);
              oRm.close("div");
            }
          }
        }

        // close searchfacetfilter div
        oRm.close("div");
      }
    },
    metadata: {
      aggregations: {
        facets: {
          singularName: "facet",
          bindable: "bindable",
          // -->> shorthand function 'bindFacets' generated -> leads to TS syntax errors and thus 'this.bindFacets' cannot be used
          multiple: true
          // visibility: "hidden", -->> bindAggregation is failing after activation of this line ?!?
        },

        _showAllBtn: {
          type: "sap.m.Button",
          multiple: false,
          visibility: "hidden"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);

      // define group for F6 handling
      this.data("sap-ui-fastnavgroup", "true", true /* write into DOM */);

      this._bindMyFacets();
    },
    onAfterRendering: function _onAfterRendering() {
      var $dataSource = $(".searchFacetFilter .searchFacet").first().find("ul"); // ToDo: JQuery
      var $dataSourceItems = $dataSource.find("li");
      $dataSource.attr("role", "tree");
      $dataSourceItems.attr("role", "treeitem");
    },
    _bindMyFacets: function _bindMyFacets() {
      if (!this.getBindingInfo("facets")) {
        this.bindAggregation("facets", {
          path: "/facets",
          factory: function factory(id, oContext) {
            var facet = oContext.getObject();
            var oModel = oContext.getModel();
            var config = oModel.config;
            switch (facet.facetType) {
              case "attribute":
                {
                  var sId = "".concat(id, "-attribute_facet");
                  // DWC exit
                  if (typeof (config === null || config === void 0 ? void 0 : config.getSpaceFacetId) === "function") {
                    sId = config.getSpaceFacetId(facet.dimension, sId);
                  }
                  var oIconTabBar = new SearchFacetTabBarRoles(sId, {
                    items: [new IconTabFilter({
                      text: i18n.getText("facetList"),
                      icon: "sap-icon://list",
                      key: "list".concat(id),
                      content: new SearchFacet("list".concat(id), {})
                    }), new IconTabFilter({
                      text: i18n.getText("facetBarChart"),
                      icon: "sap-icon://horizontal-bar-chart",
                      key: "barChart".concat(id),
                      content: new SearchFacetBarChart("barChart".concat(id))
                    }), new IconTabFilter({
                      text: i18n.getText("facetPieChart"),
                      icon: "sap-icon://pie-chart",
                      key: "pieChart".concat(id),
                      content: new SearchFacetPieChart("pieChart".concat(id))
                    })]
                  });
                  oIconTabBar.addStyleClass("sapUshellSearchFacetIconTabBar");
                  return oIconTabBar;
                }
              case "datasource":
                // do not use '${id}' for ID-generation, only one such facet exists
                return new SearchFacet((config !== null && config !== void 0 && config.id ? config.id + "-" : "") + "dataSourceFacet");
              case "quickSelectDataSource":
                {
                  // do not use '${id}' for ID-generation, only one such facet exists
                  var quickSelectDataSourceList = new SearchFacetQuickSelectDataSource((config !== null && config !== void 0 && config.id ? config.id + "-" : "") + "sapUshellSearchFacetQuickSelectDataSource", {});
                  var oGroupHeaderListItem = new GroupHeaderListItem("".concat(id, "-quickSelectDataSource_facetGroupHeader"), {
                    title: i18n.getText("quickSelectDataSourcesHeader")
                  });
                  oGroupHeaderListItem.addStyleClass("sapUshellSearchFacetTabBarHeader");
                  oGroupHeaderListItem.addStyleClass("sapElisaSearchFacetTabBarHeaderUl");
                  return new VBox("".concat(id, "-quickSelectDataSource_container"), {
                    items: [oGroupHeaderListItem, quickSelectDataSourceList]
                  });
                  return quickSelectDataSourceList;
                }
              case "hierarchy":
                {
                  var hierarchyId = "".concat(id, "-hierarchy_facet");
                  var _facet = new SearchFacetHierarchyDynamic(hierarchyId, {
                    openShowMoreDialogFunction: openShowMoreDialog // inject function because otherwise we have circular dependencies
                  });

                  return _facet;
                }
              case "hierarchyStatic":
                {
                  var hierarchyStaticId = "".concat(id, "-hierarchyStatic_facet");
                  return new SearchFacetHierarchyStatic(hierarchyStaticId, {});
                }
              default:
                {
                  var internalError = new Error("Program error: Unknown facet type: '".concat(facet.facetType, "'"));
                  throw new errors.UnknownFacetType(internalError);
                }
            }
          }
        });
      }
    },
    _getShowAllButton: function _getShowAllButton() {
      var _this = this;
      if (this.getAggregation("_showAllBtn") === null) {
        var createOpenFacetDialogFn = function createOpenFacetDialogFn(
          /* oEvent: Event */
        ) {
          try {
            var oSearchModel = _this.getModel();
            return _await(_awaitIgnored(openShowMoreDialog(oSearchModel)));
          } catch (e) {
            return Promise.reject(e);
          }
        };
        var showAllBtn = new Button("".concat(this.getId(), "-ShowMoreAll"), {
          text: "{showAllFilters}",
          press: createOpenFacetDialogFn,
          visible: true
        });
        this.setAggregation("_showAllBtn", showAllBtn);
      }
      return this.getAggregation("_showAllBtn");
    },
    _headToolBar4FirstFacet: function _headToolBar4FirstFacet(searchModel) {
      var _this2 = this;
      // heading
      // FilterBy
      var oHeader = new List("", {});
      oHeader.setShowNoData(false);
      oHeader.setShowSeparators(ListSeparators.None);
      oHeader.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);

      var oResetButton = new Button("", {
        icon: "sap-icon://clear-filter",
        tooltip: i18n.getText("resetFilterButton_tooltip"),
        type: ButtonType.Transparent,
        enabled: {
          parts: [{
            path: "/uiFilter/rootCondition"
          }],
          formatter: function formatter(rootCondition) {
            var bFiltersExist = false;
            if (rootCondition.hasFilters()) {
              bFiltersExist = true;
              if (searchModel.filterWithoutFilterByConditions()) {
                bFiltersExist = false;
              }
              // DWC exit, remove after replacing space facet by folder
              if (typeof searchModel.config.hasSpaceFiltersOnly === "function") {
                if (searchModel.config.hasSpaceFiltersOnly(rootCondition) === true) {
                  bFiltersExist = false;
                }
              }
            } else {
              bFiltersExist = false;
            }
            return bFiltersExist;
          }
        },
        press: function press() {
          var oSearchModel = searchModel;
          oSearchModel.eventLogger.logEvent({
            type: UserEventType.CLEAR_ALL_FILTERS
          });
          searchModel.resetFilterByFilterConditions(true);
        }
      });

      // if (oSearchModel?.config?.searchInAttibuteFacetPostion[dimension]) {
      //     oResetButton.addStyleClass("sapUshellSearchFilterByResetButtonHidden");
      // } else {
      oResetButton.addStyleClass("sapUshellSearchFilterByResetButton");
      // }

      oResetButton.onAfterRendering = function () {
        $(_this2.getDomRef()).attr("aria-label", i18n.getText("resetFilterButton_tooltip"));
      };
      var oLabel = new Title("", {
        text: i18n.getText("filterBy")
      });
      var oSpacer = new ToolbarSpacer();
      var oHeaderToolbar = new Toolbar("", {
        content: [oLabel, oSpacer, oResetButton]
      });
      oHeaderToolbar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
      oHeaderToolbar.addStyleClass("sapUshellSearchFilterByHeaderListToolbarinToolbar");
      oHeader.setHeaderToolbar(oHeaderToolbar);
      oHeader.addStyleClass("sapUshellSearchFilterByHeaderList");
      oHeader.onAfterRendering = function () {
        $(".sapUshellSearchFilterByHeaderList").find("ul").attr("tabindex", "-1");
        $(".sapUshellSearchFilterByHeaderList").find("div").attr("tabindex", "-1");
      };
      var oFacetHeaderToolbar = new Toolbar("", {
        content: oHeader
      });
      oFacetHeaderToolbar.addStyleClass("sapUshellSearchFilterByHeaderListToolbar");
      return oFacetHeaderToolbar;
    }
  });
  return SearchFacetFilter;
});
})();