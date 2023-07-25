/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/esh/search/ui/SearchHelper", "sap/esh/search/ui/SearchFacetDialogHelper", "sap/esh/search/ui/SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader", "sap/esh/search/ui/SearchFacetDialogHelperCharts", "sap/esh/search/ui/controls/SearchAdvancedCondition", "sap/esh/search/ui/FacetItem", "sap/m/library", "sap/m/Page", "sap/m/Dialog", "sap/m/Select", "sap/m/CheckBox", "sap/m/SearchField", "sap/m/ToggleButton", "sap/m/Button", "sap/m/StandardListItem", "sap/m/SplitContainer", "sap/ui/core/Item", "sap/m/List", "sap/m/HBox", "sap/m/VBox", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/ScrollContainer", "sap/m/Toolbar", "sap/m/IconTabBar", "sap/m/IconTabFilter", "sap/ui/model/json/JSONModel", "sap/esh/search/ui/SearchModel", "../sinaNexTS/providers/abap_odata/UserEventLogger", "../hierarchydynamic/SearchHierarchyDynamicFacet", "./SearchFacetHierarchyDynamic"], function (__i18n, SearchHelper, SearchFacetDialogHelper, SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader, SearchFacetDialogHelperCharts, SearchAdvancedCondition, FacetItem, sap_m_library, Page, Dialog, Select, CheckBox, SearchField, ToggleButton, Button, StandardListItem, SplitContainer, Item, List, HBox, VBox, Filter, FilterOperator, ScrollContainer, Toolbar, IconTabBar, IconTabFilter, JSONModel, SearchModel, ___sinaNexTS_providers_abap_odata_UserEventLogger, __SearchHierarchyDynamicFacet, __SearchFacetHierarchyDynamic) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  var i18n = _interopRequireDefault(__i18n);
  var ButtonType = sap_m_library["ButtonType"];
  var ListMode = sap_m_library["ListMode"];
  var ListSeparators = sap_m_library["ListSeparators"];
  var FlexAlignItems = sap_m_library["FlexAlignItems"];
  var FlexJustifyContent = sap_m_library["FlexJustifyContent"];
  var BackgroundDesign = sap_m_library["BackgroundDesign"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var SearchHierarchyDynamicFacet = _interopRequireDefault(__SearchHierarchyDynamicFacet);
  var SearchFacetHierarchyDynamic = _interopRequireDefault(__SearchFacetHierarchyDynamic);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetDialog = Dialog.extend("sap.esh.search.ui.controls.SearchFacetDialog", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        tabBarItems: {
          type: "object" // Array<IconTabFilter>
        },

        selectedAttribute: {
          type: "string"
        },
        selectedTabBarIndex: {
          type: "int"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      var loaderDummy = new SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader();
      Dialog.prototype.constructor.call(this, sId, settings);
      var oSettings = _typeof(sId) === "object" ? sId : settings;
      this.bConditionValidateError = false;
      this.bShowCharts = true; // change this to completely turn off charts in show more dialog
      this.bOldPieChart = true;
      this.chartOnDisplayIndex = oSettings.selectedTabBarIndex; // charts
      this.facetOnDisplayIndex = 0; // charts
      this.chartOnDisplayIndexByFilterArray = []; // charts
      this.aItemsForBarChart = []; // charts
      this.SearchFacetDialogHelperCharts = new SearchFacetDialogHelperCharts(this);
      if (!this.getProperty("tabBarItems")) {
        SearchFacetDialogHelperCharts.setDummyTabBarItems(this);
      }
      this.setShowHeader(true);
      this.setTitle(i18n.getText("dialogTitle"));
      this.setHorizontalScrolling(false);
      this.setVerticalScrolling(false);
      this.setContentHeight("35rem");
      this.setBeginButton(new Button({
        text: i18n.getText("okDialogBtn"),
        type: ButtonType.Emphasized,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        press: function press(oEvent) {
          _this.onOkClick();
          _this.close();
          _this.getModel().destroy();
          _this.destroy();
        }
      }));
      this.setEndButton(new Button({
        text: i18n.getText("cancelDialogBtn"),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        press: function press(oEvent) {
          _this.onCancelClick();
          _this.close();
          _this.getModel().destroy();
          _this.destroy();
        }
      }));
      this.addContent(this.createContainer());
      SearchFacetDialogHelper.init(this);
      this.addStyleClass("sapUshellSearchFacetDialog");
      this.onSearchFieldLiveChangeDelayed = SearchHelper.delayedExecution(this.onSearchFieldLiveChange, 1000);
    },
    createContainer: function _createContainer() {
      var _this2 = this;
      // create SplitContainer with masterPages
      this.oSplitContainer = new SplitContainer({
        masterPages: this.createMasterPages()
      });
      // binding detailPages in SplitContainer
      this.oSplitContainer.bindAggregation("detailPages", {
        path: "/facetDialog",
        factory: function factory(sId, oContext) {
          return _this2.createDetailPage(sId, oContext);
        }
      });
      this.oSplitContainer.addStyleClass("sapUshellSearchFacetDialogContainer");
      return this.oSplitContainer;
    },
    setModel: function _setModel(oModel, sName) {
      // this/SearchFacetDialog not working as return type
      Dialog.prototype.setModel.call(this, oModel, sName);
      if (oModel instanceof SearchModel && typeof oModel.config !== "undefined") {
        if (oModel.config.optimizeForValueHelp) {
          this.addStyleClass("sapUshellSearchFacetDialogValueHelp");
        }
      }
      return this;
    },
    createMasterPages: function _createMasterPages() {
      var _this3 = this;
      // create facet list
      var oFacetList = new List({
        mode: "SingleSelectMaster" /*ListMode.SingleSelectMaster*/,

        // ToDo
        selectionChange: function selectionChange(oEvent) {
          _this3.onMasterPageSelectionChange(oEvent);
        }
      });
      oFacetList.addStyleClass("sapUshellSearchFacetDialogFacetList");
      oFacetList.bindItems({
        path: "/facetDialog",
        factory: function factory(sId, oContext) {
          var facet = oContext.getObject();
          if (facet instanceof SearchHierarchyDynamicFacet) {
            var oListItem = new StandardListItem({
              title: {
                path: "title"
              },
              counter: {
                path: "filterCount"
              },
              visible: {
                path: "visible"
              }
            });
            return oListItem;
          } else {
            var _oListItem = new StandardListItem({
              title: {
                path: "title"
              },
              counter: {
                path: "count"
              },
              visible: {
                path: "visible"
              }
            });
            return _oListItem;
          }
        }
      });
      // create a scrollContainer, content is the facet list
      var oResetButton = new Button({
        icon: "sap-icon://clear-filter",
        tooltip: i18n.getText("resetFilterButton_tooltip"),
        type: ButtonType.Transparent,
        enabled: {
          path: "/facetDialogOverallCounter"
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        press: function press(oEvent) {
          _this3.resetAllFilters();
        }
      });
      oResetButton.addStyleClass("sapUshellSearchFacetDialogFilterResetButton");
      var oMasterPage = new Page({
        title: i18n.getText("filters"),
        headerContent: oResetButton,
        content: [oFacetList]
      }).addStyleClass("sapUshellSearchFacetDialogMasterContainer");
      oMasterPage.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          if (_this3.getProperty("selectedAttribute")) {
            for (var i = 0; i < oFacetList.getItems().length; i++) {
              var oListItem = oFacetList.getItems()[i];
              var oBindingObject = oListItem.getBindingContext().getObject(); // ToDo 'any'
              if (_this3.getProperty("selectedAttribute") === oBindingObject.dimension) {
                oFacetList.setSelectedItem(oListItem);
                _this3.facetOnDisplayIndex = i;
                _this3.chartOnDisplayIndexByFilterArray.push(_this3.chartOnDisplayIndex); // initial setting of array
              } else {
                var n = 0;
                /* const ar = (oListItem.getBindingContext().getModel() as SearchFacetDialogModel)
                    .oData.facets; */
                var ar = oListItem.getBindingContext().getModel().getData().facets;
                for (var j = 0; j < ar.length; j++) {
                  if (ar[j].chartIndex && ar[j].dimension === oBindingObject.dimension && !isNaN(ar[j].chartIndex)) {
                    n = ar[j].chartIndex;
                  }
                }
                _this3.chartOnDisplayIndexByFilterArray.push(n); // initial setting of array
              }
            }
          }

          if (!oFacetList.getSelectedItem()) {
            oFacetList.setSelectedItem(oFacetList.getItems()[0]);
          }
          var oSelectedItem = oFacetList.getSelectedItem();
          SearchFacetDialogHelper.updateDetailPage(oSelectedItem, null, true);
          _this3.resetEnabledForFilterResetButton();
        }
      });
      // masterPages has only one page
      return [oMasterPage];
    },
    resetAllFilters: function _resetAllFilters() {
      // if 'show selected on top' is checked, uncheck
      var $checkbox = $(".sapUshellSearchFacetDialogSettingsContainer").find(".sapMCbBg.sapMCbHoverable.sapMCbMark");
      if ($checkbox.length === 1) {
        var id = $checkbox[0].parentNode["id"]; // ToDo
        var oCheckbox = sap.ui.getCore().byId(id); // ToDo
        oCheckbox.setSelected(false);
        oCheckbox.setEnabled(false);
      }
      var oModel = this.getModel();
      oModel.aFilters = [];
      // none of the above work since selections in all lists are physically counted to addFilterCondition
      SearchFacetDialogHelper.bResetFilterIsActive = true;
      var oMasterPageList = SearchFacetDialogHelper.getFacetList();
      var aFacets = oMasterPageList.getItems();
      for (var j = 0; j < aFacets.length; j++) {
        aFacets[j].setCounter(0);
      }
      this.resetAdvancedConditionFilters();
      SearchFacetDialogHelper.resetChartQueryFilters();
      SearchFacetDialogHelper.updateDetailPage(oMasterPageList.getSelectedItem());
      this.resetEnabledForFilterResetButton();
      SearchFacetDialogHelper.bResetFilterIsActive = false;
    },
    resetAdvancedConditionFilters: function _resetAdvancedConditionFilters() {
      var oAdvancedContainer, condition1, n1, n2, oParent, oChild;
      var oDetailPages = this.oSplitContainer.getDetailPages();
      for (var i = 0; i < oDetailPages.length; i++) {
        var oDetailPage = oDetailPages[i];
        var facet = oDetailPage.getBindingContext().getObject();
        if (facet instanceof SearchHierarchyDynamicFacet) {
          continue;
        }
        n1 = SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER;
        oAdvancedContainer = oDetailPage.getContent()[n1]; //for numbers, dates etc, not strings or texts
        if (oAdvancedContainer) {
          for (var j = oAdvancedContainer.getContent().length - 2; j > 0; j--) {
            condition1 = oAdvancedContainer.getContent()[j];
            oParent = condition1.getParent();
            oChild = condition1;
            oParent.removeContent(oChild);
          }
        } else {
          n1 = SearchFacetDialogHelper.POS_ICONTABBAR;
          n2 = SearchFacetDialogHelper.POS_TABBAR_CONDITION;
          oAdvancedContainer = oDetailPage.getContent()[n1].getItems()[n2].getContent()[0]; // for numbers, dates etc, not strings or texts
          if (oAdvancedContainer) {
            for (var _j = oAdvancedContainer.getContent().length - 1; _j > -1; _j--) {
              condition1 = oAdvancedContainer.getContent()[_j];
              if (condition1.getContent && condition1.getContent()[1]) {
                var conditionItem = condition1.getContent()[1].getContent()[1]; //condition1 = [a box, a layout, and an x button]
                var conditionValue = conditionItem.getValue();
                if (conditionValue && ("" + conditionValue).length > 0) {
                  oParent = condition1.getParent();
                  oChild = condition1;
                  oParent.removeContent(oChild);
                }
              }
            }
          }
        }
      }
    },
    resetEnabledForFilterResetButton: function _resetEnabledForFilterResetButton(bForceEnabled) {
      var bFiltersExist = false;
      var overallCounter = 0;
      var oMasterPageList = SearchFacetDialogHelper.getFacetList();
      var aFacets = oMasterPageList.getItems();
      for (var i = 0; i < aFacets.length; i++) {
        overallCounter += aFacets[i].getCounter();
      }
      var oModel = this.getModel();
      if (oModel.aFilters && oModel.aFilters.length > 0 || bForceEnabled || overallCounter > 0) {
        bFiltersExist = true;
      }
      // const id = $(".sapUshellSearchFacetDialogFilterResetButton")[0].id;
      // const oResetButton = sap.ui.getCore().byId(id) as any as Button;
      // oResetButton.setEnabled(bFiltersExist);
      oModel.setProperty("/facetDialogOverallCounter", bFiltersExist);
    },
    onMasterPageSelectionChange: function _onMasterPageSelectionChange(oEvent) {
      var oListItem = oEvent.getParameter("listItem");
      this.facetOnDisplayIndex = oListItem.getParent().indexOfItem(oListItem.getParent().getSelectedItem());
      this.setChartOnDisplayIndexForFacetListItem(this.facetOnDisplayIndex);
      var oModel = oListItem.getParent().getModel();
      var sBindingPath = oListItem.getBindingContext().sPath;
      this.resetIcons(oModel, sBindingPath, this);
      SearchFacetDialogHelper.updateDetailPage(oListItem);
      if (this.oSplitContainer.getMode() === "ShowHideMode") {
        this.oSplitContainer.hideMaster();
      }
      this.controlChartVisibility(this, this.chartOnDisplayIndex);
    },
    createDetailPage: function _createDetailPage(sId, oContext) {
      var facet = oContext.getObject();
      switch (facet.facetType) {
        case "attribute":
          return this.createAttributeDetailPage(sId, oContext);
        case "hierarchy":
          return this.createDynamicHierarchyAttributeDetailPage(sId, oContext);
      }
    },
    createDynamicHierarchyAttributeDetailPage: function _createDynamicHierarchyAttributeDetailPage(sId, oContext) {
      var facetControl = new SearchFacetHierarchyDynamic("", {
        showTitle: false
      });
      var facet = oContext.getObject();
      var page = new Page({
        title: facet.title,
        showHeader: true,
        content: [facetControl]
      }).addStyleClass("sapUshellSearchFacetDialogDetailPage").addStyleClass("sapUshellSearchFacetDialogHierarchyTreeDetailPage");
      return page;
    },
    createAttributeDetailPage: function _createAttributeDetailPage(sId, oContext) {
      var _this4 = this;
      var sFacetType = oContext.getModel().getProperty(oContext.getPath()).facetType;
      var sDataType = oContext.getModel()["getAttributeDataType"](oContext.getModel().getProperty(oContext.getPath()));
      // create a settings container with select and checkBox, initial is not visible
      var oSelect = new Select({
        items: [new Item({
          text: i18n.getText("notSorted"),
          key: "notSorted"
        }), new Item({
          text: i18n.getText("sortByCount"),
          key: "sortCount"
        }), new Item({
          text: i18n.getText("sortByName"),
          key: "sortName"
        })],
        selectedKey: sDataType === "string" || sDataType === "text" ? "sortCount" : "notSorted",
        change: function change(oEvent) {
          _this4.onSelectChange(oEvent);
        }
      }).addStyleClass("sapUshellSearchFacetDialogSettingsSelect");
      var oHBox = new HBox({
        alignItems: FlexAlignItems.End,
        justifyContent: FlexJustifyContent.End,
        items: [oSelect]
      });
      var oCheckBox = new CheckBox({
        text: i18n.getText("showSelectedOnTop"),
        enabled: false,
        select: function select(oEvent) {
          _this4.onCheckBoxSelect(oEvent);
        }
      });
      var oSettings = new VBox({
        items: [oHBox, oCheckBox]
      }).addStyleClass("sapUshellSearchFacetDialogSettingsContainer");
      oSettings.setVisible(false);
      // create the attribute list for each facet
      var oList = new List({
        backgroundDesign: BackgroundDesign.Transparent,
        includeItemInSelection: true,
        showNoData: false,
        showSeparators: ListSeparators.None,
        selectionChange: function selectionChange(oEvent) {
          _this4.onDetailPageSelectionChange(oEvent);
        }
      });
      oList.addStyleClass("sapUshellSearchFacetDialogDetailPageList");
      oList.addStyleClass("largeChart0");
      if (sFacetType === "attribute") {
        oList.setMode(ListMode.MultiSelect);
      }
      var oBindingInfo = {
        path: "items",
        factory: function factory(sId, oContext) {
          var oBinding = oContext.oModel.getProperty(oContext.sPath);
          var oListItem = new StandardListItem({
            title: {
              path: "label"
            },
            tooltip: i18n.getText("facetListTooltip", [oBinding.label, oBinding.valueLabel]),
            info: {
              path: "valueLabel"
            },
            selected: {
              path: "selected"
            }
          });
          // prepare the local filterConditions array in facet dialog
          if (oBinding.selected) {
            oContext.oModel.addFilter(oBinding);
          }
          return oListItem;
        }
      };
      if (sDataType === "number" || sDataType === "integer") {
        oSelect.removeItem(2);
      }
      oBindingInfo["filters"] = new Filter("advanced", FilterOperator.NE, true); // ToDo
      oList.bindAggregation("items", oBindingInfo);
      oList.data("dataType", sDataType);
      if (this.bShowCharts) {
        oList.addEventDelegate({
          onAfterRendering: function onAfterRendering(oEvent) {
            _this4.hideSelectively(oEvent, _this4, 0);
          }
        });
      }
      var oListContainer, oChartPlaceholder2;
      var oChartPlaceholder1 = SearchFacetDialogHelperCharts.getBarChartPlaceholder();
      oChartPlaceholder1.addEventDelegate({
        onAfterRendering: function onAfterRendering(oEvent) {
          _this4.hideSelectively(oEvent, _this4, 1);
        }
      });
      oChartPlaceholder1.data("dataType", sDataType);
      if (this.bOldPieChart) {
        oChartPlaceholder2 = SearchFacetDialogHelperCharts.getPieChartPlaceholder();
      } else {
        oChartPlaceholder2 = {};
      }
      oChartPlaceholder2.addEventDelegate({
        onAfterRendering: function onAfterRendering(oEvent) {
          _this4.hideSelectively(oEvent, _this4, 2);
        }
      });
      if (this.bShowCharts && (sDataType === "string" || sDataType === "text")) {
        oListContainer = new ScrollContainer({
          height: "67.2%",
          horizontal: false,
          vertical: true,
          content: [oList, oChartPlaceholder1, oChartPlaceholder2]
        });
      } else {
        oListContainer = new ScrollContainer({
          height: "calc(100% - 0.25rem)",
          horizontal: false,
          vertical: true,
          content: [oList]
        });
        if (sDataType === "number" || sDataType === "integer") {
          oListContainer.addStyleClass("sapUshellSearchFacetDialogDetailPageListContainerNumber");
        } else {
          oListContainer.addStyleClass("sapUshellSearchFacetDialogDetailPageListContainerDate");
        }
      }
      oListContainer.addStyleClass("sapUshellSearchFacetDialogDetailPageListContainer");
      oListContainer.addStyleClass("searchFacetLargeChartContainer");
      oListContainer.setBusyIndicatorDelay(0);
      // create advanced search
      var oAdvancedCondition = new SearchAdvancedCondition("", {
        type: sDataType
      });
      var oPage;
      if (sDataType === "string" || sDataType === "text") {
        var oAdvancedContainer = new ScrollContainer({
          horizontal: false,
          vertical: true,
          content: [oAdvancedCondition]
        });
        oAdvancedContainer.addStyleClass("sapUshellSearchFacetDialogDetailPageAdvancedContainer");
        var oPlusButton = new Button({
          icon: "sap-icon://add",
          type: ButtonType.Transparent,
          press: function press(oEvent) {
            _this4.onPlusButtonPress(oEvent, sDataType);
          }
        });
        oPlusButton.addStyleClass("sapUshellSearchFacetDialogDetailPageAdvancedContainerPlusButton");
        oAdvancedContainer.addContent(oPlusButton);
        oAdvancedContainer.data("dataType", sDataType);
        oAdvancedContainer.data("initial", true);
        // create a page for type string or text, content include settings container and attribute list, head toolbar has a setting button and a search field
        oListContainer.setHeight("calc(100% - 0.25rem)");
        oAdvancedContainer.setHeight("100%");
        var oChartSelectionButton = SearchFacetDialogHelperCharts.getDropDownButton(this);
        var subheader = new Toolbar({
          content: [new SearchField({
            placeholder: i18n.getText("filterPlaceholder"),
            liveChange: function liveChange(oEvent) {
              _this4.onSearchFieldLiveChangeDelayed(oEvent["oSource"].getValue()); // ToDo
            }
          }), new ToggleButton({
            icon: "sap-icon://sort",
            press: function press(oEvent) {
              _this4.onSettingButtonPress(oEvent);
            }
          }).addStyleClass("sapUshellSearchFacetDialogSortButton")]
        }).addStyleClass("sapUshellSearchFacetDialogSubheaderToolbar");
        subheader.addEventDelegate({
          onAfterRendering: function onAfterRendering() {
            $(".sapUshellSearchFacetDialogSubheaderToolbar").removeClass("sapContrastPlus");
          }
        });
        if (this.bShowCharts) {
          subheader.addContent(oChartSelectionButton);
        }
        var oTabListPage = new Page({
          showHeader: false,
          subHeader: subheader,
          content: [oSettings, oListContainer]
        }).addStyleClass("sapUshellSearchFacetDialogDetailPage");
        var oIconTabBar = new IconTabBar({
          expandable: false,
          stretchContentHeight: true,
          backgroundDesign: BackgroundDesign.Transparent,
          applyContentPadding: false,
          select: function select() {
            _this4.controlChartVisibility(_this4, _this4.chartOnDisplayIndex);
          },
          items: [new IconTabFilter({
            text: i18n.getText("selectFromList"),
            content: [oTabListPage]
          }), new IconTabFilter({
            text: i18n.getText("defineCondition"),
            content: [oAdvancedContainer]
          })]
        });
        oIconTabBar.addStyleClass("sapUshellSearchFacetDialogIconTabBar");
        oPage = new Page({
          showHeader: true,
          title: oContext.getModel().getProperty(oContext.getPath()).title,
          content: [oIconTabBar]
        });
        oPage.addStyleClass("sapUshellSearchFacetDialogDetailPageString");
      } else {
        oListContainer.addContent(oAdvancedCondition);
        oListContainer.data("dataType", sDataType);
        oListContainer.data("initial", true);
        // create a page for type number or date
        if (this.bShowCharts) {
          var title = oContext.getModel().getProperty(oContext.getPath()).title;
          oPage = new Page({
            title: title,
            showHeader: true,
            content: [oSettings, oListContainer]
          });
        } else {
          oPage = new Page({
            showHeader: true,
            title: oContext.getModel().getProperty(oContext.getPath()).title,
            content: [oSettings, oListContainer]
          });
        }
        oPage.addStyleClass("sapUshellSearchFacetDialogDetailPage");
      }
      oPage.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          _this4.controlChartVisibility(_this4, _this4.chartOnDisplayIndex);
        }
      });
      return oPage;
    },
    onDetailPageSelectionChange: function _onDetailPageSelectionChange(oEvent) {
      var oSelectedItem = oEvent.getParameter("listItem");
      // update aFilters
      var oBindingObject = oSelectedItem.getBindingContext().getObject();
      var oModel = this.getModel();
      if (oSelectedItem.getSelected()) {
        oBindingObject.listed = true;
        oModel.addFilter(oBindingObject);
      } else {
        oBindingObject.listed = false;
        oModel.removeFilter(oBindingObject);
      }
      // update the count info in masterPageList
      var oList = oEvent.getSource();
      var oDetailPage;
      if (oList.data("dataType") === "string" || oList.data("dataType") === "text") {
        oDetailPage = oList.getParent().getParent().getParent().getParent().getParent().getParent();
      } else {
        oDetailPage = oList.getParent().getParent();
      }
      SearchFacetDialogHelper.updateCountInfo(oDetailPage);
      // deselect setting check box
      var oSettings = oList.getParent().getParent().getContent()[
      // ToDo
      SearchFacetDialogHelper.POS_SETTING_CONTAINER];
      var oCheckbox = oSettings.getItems()[SearchFacetDialogHelper.POS_SHOWONTOP_CHECKBOX];
      var oSelect = oSettings.getItems()[SearchFacetDialogHelper.POS_SORTING_SELECT].getItems()[0];
      if (oCheckbox.getSelected()) {
        oCheckbox.setSelected(false);
        oSelect.setSelectedKey("notSorted");
      }
      if (oList.getSelectedContexts().length > 0) {
        oCheckbox.setEnabled(true);
      } else {
        oCheckbox.setEnabled(false);
      }
    },
    onSearchFieldLiveChange: function _onSearchFieldLiveChange(value) {
      var oSelectedItem = SearchFacetDialogHelper.getFacetList().getSelectedItem();
      SearchFacetDialogHelper.updateDetailPage(oSelectedItem, value);
    },
    onSettingButtonPress: function _onSettingButtonPress(oEvent) {
      var oSettingsButton = oEvent.getSource();
      var bPressed = oSettingsButton.getPressed();
      var oSettings = oSettingsButton.getParent().getParent()["getContent"]()[SearchFacetDialogHelper.POS_SETTING_CONTAINER];
      var oListContainer = oSettingsButton.getParent().getParent()["getContent"]()[SearchFacetDialogHelper.POS_ATTRIBUTE_LIST_CONTAINER];
      if (bPressed) {
        oSettings.setVisible(true);
        oListContainer.setHeight("calc(100% - 4.25rem)");
      } else {
        oSettings.setVisible(false);
        oListContainer.setHeight("calc(100% - 0.25rem)");
      }
    },
    onSelectChange: function _onSelectChange(oEvent) {
      var oSelect = oEvent.getSource();
      SearchFacetDialogHelper.sortingAttributeList(oSelect.getParent().getParent().getParent());
    },
    onCheckBoxSelect: function _onCheckBoxSelect(oEvent) {
      var oCheckbox = oEvent.getSource();
      SearchFacetDialogHelper.sortingAttributeList(oCheckbox.getParent().getParent());
    },
    onPlusButtonPress: function _onPlusButtonPress(oEvent, type) {
      var oPlusButton = oEvent.getSource();
      var oAdvancedContainer = oPlusButton.getParent();
      var oNewAdvancedCondition = new SearchAdvancedCondition("", {
        type: type
      });
      var insertIndex = oAdvancedContainer.getContent().length - 1;
      oAdvancedContainer.insertContent(oNewAdvancedCondition, insertIndex);
    },
    onOkClick: function _onOkClick() {
      var oModel = this.getModel();
      var oSearchModel = this.getModel("searchModel");
      oSearchModel.resetFilterByFilterConditions(false);
      var aDetailPages = this.oSplitContainer.getDetailPages();
      // no advanced filter
      for (var m = 0; m < oModel.aFilters.length; m++) {
        var item = oModel.aFilters[m];
        if (!item.advanced || item.listed) {
          oSearchModel.addFilterCondition(item.filterCondition, false);
        }
      }
      // advanced filter
      for (var i = 0; i < aDetailPages.length; i++) {
        var detailPage = aDetailPages[i];
        var facet = detailPage.getBindingContext().getObject();
        if (facet instanceof SearchHierarchyDynamicFacet) {
          continue;
        }
        if (SearchFacetDialogHelper.getFacetList().getItems()[i]) {
          SearchFacetDialogHelper.applyAdvancedCondition(detailPage, SearchFacetDialogHelper.getFacetList().getItems()[i].getBindingContext().getObject(), oSearchModel);
        }
      }
      if (!this.bConditionValidateError) {
        oSearchModel.filterChanged = true;
        oSearchModel.invalidateQuery();
        oSearchModel._firePerspectiveQuery();
      }
      oSearchModel.eventLogger.logEvent({
        type: UserEventType.FACET_SHOW_MORE_CLOSE
      });
    },
    onCancelClick: function _onCancelClick() {
      var oSearchModel = this.getModel("searchModel");
      oSearchModel.eventLogger.logEvent({
        type: UserEventType.FACET_SHOW_MORE_CLOSE
      });
    },
    setChartOnDisplayIndexForFacetListItem: function _setChartOnDisplayIndexForFacetListItem(facetOnDisplayIndex) {
      var res = 0;
      try {
        res = this.chartOnDisplayIndexByFilterArray[facetOnDisplayIndex];
      } catch (e) {
        res = 0;
      }
      if (res === undefined) {
        res = 0;
      }
      this.chartOnDisplayIndex = res;
    },
    resetIcons: function _resetIcons(oModel, sPath, oControl) {
      var isTextDataType = false;
      var sDataType = oModel.getAttributeDataType(oModel.getProperty(sPath));
      if (this.bShowCharts && (sDataType === "string" || sDataType === "text")) {
        isTextDataType = true;
      }
      var allDropdownbuttons = $(".sapUshellSearchFacetDialogTabBarButton");
      if (isTextDataType) {
        allDropdownbuttons.css("display", "block");
        for (var i = 0; i < allDropdownbuttons.length; i++) {
          var id = allDropdownbuttons[i].id;
          var oDropDownButton = sap.ui.getCore().byId(id); // ToDo
          // reset the main button
          var btn = oControl.getProperty("tabBarItems")[oControl.chartOnDisplayIndex].getIcon();
          oDropDownButton.setIcon(btn);
          var asWhat = oControl.getProperty("tabBarItems")[oControl.chartOnDisplayIndex].getText();
          // reset the main button tooltip
          var displayAs = i18n.getText("displayAs", [asWhat]); // ToolTipBase
          oDropDownButton.setTooltip(displayAs);
        }
      } else {
        allDropdownbuttons.css("display", "none");
      }
    },
    onDetailPageSelectionChangeCharts: function _onDetailPageSelectionChangeCharts(oEvent) {
      var cnt = 0;
      var context, model, data, isSelected, becomesSelected, oSelectedItem, sSelectedBindingPath, oBindingObject, sPath;
      var itemIndex, ar, oNode, oMasterPageListItem;
      if (oEvent.getSource && oEvent.getId() === "press") {
        context = oEvent.getSource().getBindingContext();
        model = context.getModel();
        data = context.getObject();
        isSelected = data.selected;
        becomesSelected = !isSelected;
        // first set the selected value in model
        oSelectedItem = oEvent.getSource();
        sSelectedBindingPath = oSelectedItem.getBindingContext().sPath + "/selected";
        model.setProperty(sSelectedBindingPath, becomesSelected);
        // update aFilters
        oBindingObject = oSelectedItem.getBindingContext().getObject();
        if (becomesSelected) {
          model.addFilter(oBindingObject);
        } else {
          model.removeFilter(oBindingObject);
        }
        // count the number of selected items in the model
        sPath = sSelectedBindingPath.replace(/\/items.+/, ""); //"/facetDialog/1/items/11/selected"
        sPath += "/items";
        ar = model.getProperty(sPath);
        cnt = 0;
        for (var i = 0; i < ar.length; i++) {
          oNode = ar[i];
          if (oNode.selected === true) {
            cnt++;
          }
        }
      } else if (oEvent.getSource && (oEvent.getId() === "selectData" || oEvent.getId() === "deselectData")) {
        // new pie chart
        context = oEvent.getSource().getBindingContext(); // ToDo
        model = context.getModel();
        data = context.getObject();
        becomesSelected = oEvent.getId() === "selectData";
        // first set the selected value in model
        oSelectedItem = oEvent.getSource();
        sSelectedBindingPath = oSelectedItem.getBindingContext().sPath + "/items/"; // have "/facetDialog/1/", want "/facetDialog/1/items/11/selected"
        for (var j = 0; j < oEvent.getParameter("data").length; j++) {
          itemIndex = oEvent.getParameter("data")[j].data._context_row_number;
          sSelectedBindingPath += itemIndex + "/selected";
          model.setProperty(sSelectedBindingPath, becomesSelected);
          // update aFilters
          oBindingObject = oSelectedItem.getBindingContext().getObject().items[itemIndex];
          if (becomesSelected) {
            model.addFilter(oBindingObject);
          } else {
            model.removeFilter(oBindingObject);
          }
        }
        // count the number of selected items in the model
        sPath = sSelectedBindingPath.replace(/\/items.+/, ""); //"/facetDialog/1/items/11/selected"
        sPath += "/items";
        ar = model.getProperty(sPath);
        cnt = 0;
        for (var _i = 0; _i < ar.length; _i++) {
          if (ar[_i].selected === true) {
            cnt++;
          }
        }
        // if we deselect all at once by clicking the white background then this cnt is incomplete
        // bug! now adjust
        var curCntOfAffectedWedges = oEvent.getParameter("data").length;
        if (!becomesSelected && curCntOfAffectedWedges > 1) {
          cnt = 0;
          for (var _i2 = 0; _i2 < ar.length; _i2++) {
            ar[_i2].selected = false;
          }
        }
      } else {
        // old pie chart
        data = oEvent["dataObject"]; // ToDo
        isSelected = data.selected;
        becomesSelected = !isSelected;
        cnt = oEvent["cnt"]; // ToDo
        model = oEvent["model"]; // ToDo
        oBindingObject = new FacetItem();
        oBindingObject.facetAttribute = data.dimension;
        oBindingObject.filterCondition = data.filterCondition;
        oBindingObject.label = data.label;
        oBindingObject.selected = data.selected;
        oBindingObject.listed = data.selected;
        oBindingObject.value = data.value;
        oBindingObject.valueLabel = data.valueLabel;
        // update aItemsForBarChart
        for (var _j2 = 0; _j2 < this.aItemsForBarChart.length; _j2++) {
          var item = this.aItemsForBarChart[_j2];
          if (item.label === data.label) {
            item.selected = data.selected;
          }
        }
        var oModel = this.getModel();
        if (isSelected) {
          oModel.addFilter(oBindingObject);
        } else {
          oModel.removeFilter(oBindingObject);
        }
      }
      // update the count info in masterPageList
      var oMasterPageList = SearchFacetDialogHelper.getFacetList();
      oMasterPageListItem = oMasterPageList.getSelectedItem();
      if (!oMasterPageListItem) {
        oMasterPageListItem = oMasterPageList.getItems()[0];
      }
      oMasterPageListItem.setCounter(cnt);
      this.resetEnabledForFilterResetButton();
    },
    updateDetailPageCharts: function _updateDetailPageCharts(aItems) {
      if (this.bShowCharts === false) {
        return;
      }
      this.aItemsForBarChart = aItems;
      var listContainers = SearchFacetDialogHelperCharts.getListContainersForDetailPage();
      var oListContainer = listContainers[1];
      if (!oListContainer) {
        return;
      }
      var contents = oListContainer.getContent();
      // update pie chart (only for oPieChart.directUpdate ie old pie)
      if (contents && this.chartOnDisplayIndex === 2) {
        var oPieChart = contents[2];
        var elemChart = listContainers[5];
        var relevantContainerHeight = listContainers[2];
        relevantContainerHeight = 0.9 * relevantContainerHeight;
        if (oPieChart.directUpdate) {
          // == old pie chart
          var piechartOptions = {
            relevantContainerHeight: relevantContainerHeight,
            oSearchFacetDialog: this
          };
          var oModel1 = new JSONModel();
          oModel1.setData(aItems);
          $("#" + elemChart.id).empty(); // elemChart.innerHTML = "";
          oPieChart.directUpdate(aItems, elemChart, oModel1, piechartOptions);
        }
      }
      // take care to adjust visibility of pie and bar chart
      // pie chart
      if (contents && this.chartOnDisplayIndex === 1) {
        // hide pie chart if exits
        var elem2 = contents[2].getDomRef();
        if (elem2) {
          var $elem2 = $("#" + elem2.id);
          $elem2.css("display", "none");
        }
      }
      // bar chart
      if (contents && this.chartOnDisplayIndex === 2) {
        // hide pie chart if exits
        var elem1 = contents[1].getDomRef();
        if (elem1) {
          var $elem1 = $("#" + elem1.id);
          $elem1.css("display", "none");
        }
      }
    },
    controlChartVisibility: function _controlChartVisibility(oControl, chartIndexToShow, forcePie) {
      var elem, $elem, classNames, isChart;
      if (this.bShowCharts === false) return;
      var listContainers = SearchFacetDialogHelperCharts.getListContainersForDetailPage();
      var oListContainer = listContainers[1];
      if (!oListContainer || !oListContainer.getContent) return;
      var contents2 = oListContainer.getContent();
      for (var i = 0; i < contents2.length; i++) {
        elem = contents2[i].getDomRef();
        if (!elem) return;
        classNames = elem.className;
        isChart = false;
        if (classNames.indexOf("largeChart") > -1) {
          isChart = true;
        }
        $elem = $("#" + elem.id);
        if (isChart && i !== chartIndexToShow) {
          $elem.css("display", "none");
        } else {
          $elem.css("display", "block");
        }
      }
      if (oControl.bOldPieChart) {
        if (isChart && chartIndexToShow === 2 && forcePie) {
          var aItems = this.aItemsForBarChart;
          this.updateDetailPageCharts(aItems);
        }
        if (isChart && chartIndexToShow === 2) {
          oListContainer.setVertical(false);
        } else {
          oListContainer.setVertical(true);
        }
      }
      var oSortButtonSet = listContainers[6];
      var oInputFieldForFilterTextSet = listContainers[7];
      if (oSortButtonSet) {
        if (chartIndexToShow === 0) {
          oSortButtonSet.css("display", "block");
          oInputFieldForFilterTextSet.css("visibility", "visible");
        } else {
          oSortButtonSet.css("display", "none");
          oInputFieldForFilterTextSet.css("visibility", "hidden");
        }
      }
    },
    hideSelectively: function _hideSelectively(oEvent, oControl, chartIndex) {
      var elem = $("#" + oEvent["srcControl"].sId);
      var chartIndexToShow = oControl.chartOnDisplayIndex;
      var listContainers = SearchFacetDialogHelperCharts.getListContainersForDetailPage();
      var oListContainer = listContainers[1];
      if (listContainers[0].firstChild.children.length != 3) return;
      if (chartIndexToShow !== undefined) {
        if (oControl.chartOnDisplayIndex !== chartIndex) {
          elem.css("display", "none");
        } else {
          elem.css("display", "block");
        }
      } else {
        elem.css("display", "block");
      }
      if (chartIndexToShow === 2) {
        if (!listContainers[0].firstChild.children[2] || !listContainers[0].firstChild.children[2].firstChild) {
          oControl.controlChartVisibility(oControl, oControl.chartOnDisplayIndex, true);
        }
        if (oControl.bOldPieChart) {
          oListContainer.setVertical(false);
        }
      } else {
        oListContainer.setVertical(true);
      }
      var oSortButton = listContainers[6];
      if (oSortButton) {
        var elemSortButton = $("#" + oSortButton.sId);
        if (chartIndexToShow === 0) {
          elemSortButton.css("display", "block");
        } else {
          elemSortButton.css("display", "none");
        }
      }
    }
  });
  return SearchFacetDialog;
});
})();