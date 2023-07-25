/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "sap/esh/search/ui/controls/SearchFacetPieChart", "sap/base/Log", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/m/IconTabFilter", "sap/m/Button", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/core/ResizeHandler", "sap/suite/ui/microchart/ComparisonMicroChartData", "sap/m/ActionSheet", "sap/m/library"], function (__i18n, SearchFacetPieChart, Log, ComparisonMicroChart, IconTabFilter, Button, Filter, FilterOperator, ResizeHandler, ComparisonMicroChartData, ActionSheet, sap_m_library) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var ValueColor = sap_m_library["ValueColor"];
  var PlacementType = sap_m_library["PlacementType"];
  var SearchFacetDialogHelperCharts = /*#__PURE__*/function () {
    // ToDo: static -> not possible to have two instances of SearchFacetDialog in parallel?

    function SearchFacetDialogHelperCharts(dialog) {
      _classCallCheck(this, SearchFacetDialogHelperCharts);
      SearchFacetDialogHelperCharts.dialog = dialog;
    }

    // create bar chart
    _createClass(SearchFacetDialogHelperCharts, [{
      key: "testWhetherPieWedgeOrLabelIsDummy",
      value: function testWhetherPieWedgeOrLabelIsDummy(oEvent) {
        var res = false;
        try {
          var label = JSON.stringify(oEvent.getParameters().data[0].data).split('"')[3]; // ToDo
          //"75% of data is outside the top 9 shown in pie chart"
          var possibleNumPerc = label.match(/\d+/g)[0];
          var possibleNumTop = label.match(/\d+/g)[1];
          if (label === i18n.getText("facetPieChartOverflowText2", [possibleNumPerc, possibleNumTop])) {
            res = true;
          } else if (label === i18n.getText("facetPieChartOverflowText2", [possibleNumTop, possibleNumPerc])) {
            res = true; //in case order of numbers reversed in foreign language
          }
        } catch (e) {
          // do nothing
        }
        return res;
      }

      // create new pie chart // ToDo: check if obsolete
      /* getPieChartPlaceholder2(): sap.viz.ui5.controls.VizFrame {
          const oChart1 = new sap.viz.ui5.controls.VizFrame("", {
              // TODO: viz globals cannot be replaced, UI loading fails
              width: "100%",
              vizType: "info/pie",
              selectData: (oEvent: sap.ui.base.Event) => {
                  if (!this.testWhetherPieWedgeOrLabelIsDummy(oEvent)) {
                      SearchFacetDialogHelperCharts.dialog.onDetailPageSelectionChangeCharts(oEvent);
                  }
              },
              deselectData: (oEvent: sap.ui.base.Event) => {
                  if (!this.testWhetherPieWedgeOrLabelIsDummy(oEvent)) {
                      SearchFacetDialogHelperCharts.dialog.onDetailPageSelectionChangeCharts(oEvent);
                  }
              },
          });
           oChart1.attachRenderComplete(function (oEvent: sap.ui.base.Event) {
              const points = [];
              let oItem;
              const aSearchFacetItems = this.getBindingContext().getObject().items4pie;
              if (!aSearchFacetItems) {
                  return oChart1;
              }
              for (let i = 0; i < aSearchFacetItems.length; i++) {
                  oItem = aSearchFacetItems[i];
                  if (oItem.selected === true) {
                      points.push({
                          data: {
                              // Label: Item.label,   syntax error after js->ts
                              Label: oItem.label,
                          },
                      });
                  }
              }
              const action = {
                  clearSelection: true,
              };
               oChart1.vizSelection(points, action);
               let indexWedgeItem, $wedgeElement;
              let indexLastLegendItem, allWedgeItems;
               const sIdCurrentComponent = (oEvent.getSource() as any).sId;
              const $legendBullet = $("#" + sIdCurrentComponent + " .v-legend-marker").last();
              const $legendItem = $("#" + sIdCurrentComponent + " .v-legend-item").last();
               if (this.getBindingContext().getObject().items4pie[0].percentageMissingInBigPie > 0) {
                  indexLastLegendItem = $("#" + sIdCurrentComponent + " .v-legend-item").length - 1;
                  allWedgeItems = $("#" + sIdCurrentComponent + " .v-datapoint-group").children();
                   for (let j = 0; j < allWedgeItems.length; j++) {
                      $wedgeElement = allWedgeItems[j];
                      indexWedgeItem = $wedgeElement.getAttribute("data-id");
                      indexWedgeItem = parseInt(indexWedgeItem, 10);
                      if (indexWedgeItem === indexLastLegendItem) {
                          $wedgeElement.remove();
                          break;
                      }
                  }
                  $legendBullet.attr("fill-opacity", "0");
                  $legendBullet.attr("stroke-opacity", "1");
                  $legendBullet.attr("stroke", "black");
                  $legendBullet.attr("stroke-width", "0.5");
                   $legendItem.unbind();
                  $legendItem.off();
              }
               // lastly try to kill any click on background
              const $background = $("#" + sIdCurrentComponent + " .v-background-body");
              $background.unbind();
              $background.off();
          });
           oChart1.setVizProperties({
              legendGroup: {
                  linesOfWrap: 0,
                  layout: {
                      maxWidth: 0.5,
                  },
              },
              title: {
                  visible: false,
              },
              interaction: {
                  selectability: {
                      mode: "multiple",
                  },
              },
          });
           oChart1.addStyleClass("largeChart2piechart");
           const oPiechartFilter1 = new Filter("pieReady", FilterOperator.EQ, true);
          const oDataset = new sap.viz.ui5.data.FlattenedDataset("", {
              // TODO: viz globals cannot be replaced, UI loading fails
              dimensions: [
                  {
                      // DimensionDefinition
                      name: "Label",
                      value: { path: "label" },
                  } as any, // ToDo
              ],
              measures: [
                  {
                      // MeasureDefinition
                      name: "Value",
                      value: { path: "valueLabel" },
                  } as any, // ToDo
              ],
              data: {
                  path: "items4pie",
                  filters: [oPiechartFilter1],
              } as any, // ToDo
          });
           const feedx = new sap.viz.ui5.controls.common.feeds.FeedItem({
              // TODO: viz globals cannot be replaced, UI loading fails
              uid: "size",
              type: "Measure",
              values: ["Value"],
          });
           const feedy = new sap.viz.ui5.controls.common.feeds.FeedItem({
              // TODO: viz globals cannot be replaced, UI loading fails
              uid: "color",
              type: "Dimension",
              values: ["Label"],
          });
           oChart1.setDataset(oDataset);
          oChart1.addFeed(feedx);
          oChart1.addFeed(feedy);
          //oChart1.setBusyIndicatorDelay(0);
          return oChart1;
      } */
    }], [{
      key: "getBarChartPlaceholder",
      value: function getBarChartPlaceholder() {
        var _this = this;
        var chartSettings = {
          height: "90%",
          width: "100%",
          colorPalette: "",
          // the colorPalette merely stops the evaluation of the bar with 'neutral', 'good' etc
          tooltip: ""
        };
        var oChart1 = new ComparisonMicroChart(chartSettings);
        oChart1.addStyleClass("largeChart1barchart");
        var oBarchartFilter1 = new Filter({
          path: "value",
          operator: FilterOperator.GT,
          value1: 0
        });
        var oBindingInfo = {
          path: "items",
          factory: function factory() {
            var oComparisonMicroChartData = new ComparisonMicroChartData({
              title: {
                path: "label"
              },
              value: {
                path: "value"
              },
              color: {
                path: "selected",
                formatter: function formatter(val) {
                  var res = ValueColor.Good;
                  if (!val) {
                    res = ValueColor.Neutral;
                  }
                  return res;
                }
              },
              tooltip: {
                parts: [{
                  path: "label"
                }, {
                  path: "value"
                }],
                formatter: function formatter(label, value) {
                  return label + ": " + value;
                }
              },
              displayValue: {
                path: "valueLabel"
              },
              press: function press(oEvent) {
                _this.dialog.onDetailPageSelectionChangeCharts(oEvent);
              }
            });
            return oComparisonMicroChartData;
          },
          filters: [oBarchartFilter1]
        };
        oChart1.bindAggregation("data", oBindingInfo);
        oChart1.setBusyIndicatorDelay(0);
        return oChart1;
      }
    }, {
      key: "getPieChartPlaceholder",
      value: function getPieChartPlaceholder() {
        var piechartOptions = {
          oSearchFacetDialog: this.dialog
        };
        var oChart2 = new SearchFacetPieChart("", piechartOptions);
        oChart2.addStyleClass("largeChart2piechart");
        ResizeHandler.register(oChart2, function (oEvent) {
          var svgX = 0;
          var marginLeft = 0;
          if (oEvent.target.firstChild) {
            svgX = parseInt(window.getComputedStyle(oEvent.target.firstChild, null).getPropertyValue("transform-origin").split(" ")[0], 10);
            marginLeft = oEvent.size.width / 2 - svgX;
            oEvent.target.firstChild.style.marginLeft = marginLeft + "px";
          }
        });
        return oChart2;
      }
    }, {
      key: "setDummyTabBarItems",
      value: function setDummyTabBarItems(oControl) {
        var dummyTabBarItems = [new IconTabFilter({
          text: i18n.getText("facetList"),
          icon: "sap-icon://list",
          key: "list" + (arguments.length <= 1 ? undefined : arguments[1])
        }), new IconTabFilter({
          text: i18n.getText("facetBarChart"),
          icon: "sap-icon://horizontal-bar-chart",
          key: "barChart" + (arguments.length <= 1 ? undefined : arguments[1])
        }), new IconTabFilter({
          text: i18n.getText("facetPieChart"),
          icon: "sap-icon://pie-chart",
          key: "pieChart" + (arguments.length <= 1 ? undefined : arguments[1])
        })];
        oControl.setProperty("tabBarItems", dummyTabBarItems);
        oControl.chartOnDisplayIndex = 0;
      }

      // create an DropDownButton with an actionsheet
    }, {
      key: "getDropDownButton",
      value: function getDropDownButton(oControl) {
        var aButtons = [];
        var oButton;
        var tabBarItems = oControl.getProperty("tabBarItems");
        var oDropDownButton = new Button({
          icon: tabBarItems[oControl.chartOnDisplayIndex].getIcon()
        });
        for (var i = 0; i < tabBarItems.length; i++) {
          oButton = new Button({
            text: tabBarItems[i].getText(),
            icon: tabBarItems[i].getIcon(),
            press: function press(oEvent) {
              var buttonClickedIndex;
              var buttonClickedId = oEvent.getSource().sId;
              buttonClickedIndex = document.getElementById(buttonClickedId).dataset.facetViewIndex;
              buttonClickedIndex = parseInt(buttonClickedIndex, 10);
              oControl.chartOnDisplayIndex = buttonClickedIndex;
              if (oControl.chartOnDisplayIndex === 0) {
                $(".sapUshellSearchFacetDialogSettingsContainer").css("display", "block");
              } else {
                $(".sapUshellSearchFacetDialogSettingsContainer").css("display", "none");
              }

              // change the chartOnDisplayIndex value for the current filter selection
              oControl.chartOnDisplayIndexByFilterArray[oControl.facetOnDisplayIndex] = buttonClickedIndex;

              // reset the main button
              var btn = tabBarItems[oControl.chartOnDisplayIndex].getIcon();
              oDropDownButton.setIcon(btn);
              var asWhat = tabBarItems[oControl.chartOnDisplayIndex].getText();

              // reset the main button tooltip
              var displayAs = i18n.getText("displayAs", [asWhat]);
              oDropDownButton.setTooltip(displayAs);

              // change what is displayed in the detail page
              var elemFacetList = $(".sapUshellSearchFacetDialogFacetList")[0];
              if (elemFacetList) {
                var oFacetList = sap.ui.getCore().byId(elemFacetList.id);
                if (!oFacetList.getSelectedItem()) {
                  oFacetList.setSelectedItem(oFacetList.getItems()[0]);
                }
                oFacetList.fireSelectionChange({
                  listItem: oFacetList.getSelectedItem()
                });
              }
              oControl.controlChartVisibility(oControl, buttonClickedIndex);
            }
          });
          oButton.data("facet-view-index", "" + i, true);
          aButtons.push(oButton);
        }
        var oActionSheet = new ActionSheet({
          showCancelButton: true,
          buttons: aButtons,
          placement: PlacementType.Bottom,
          cancelButtonPress: function cancelButtonPress() {
            Log.info("sap.m.ActionSheet: cancelButton is pressed");
          }
        });
        oDropDownButton.addStyleClass("sapUshellSearchFacetDialogTabBarButton");
        var asWhat = tabBarItems[oControl.chartOnDisplayIndex].getText();
        var displayAs = i18n.getText("displayAs", [asWhat]);
        oDropDownButton.setTooltip(displayAs);
        oDropDownButton.attachPress(function () {
          oActionSheet.openBy(this);
        });
        return oDropDownButton;
      }
    }, {
      key: "getListContainersForDetailPage",
      value: function getListContainersForDetailPage() {
        // ToDo: static -> not possible to have two instances of SearchFacetDialog in parallel?
        // heuristic due to difficulty of finding what user can see in chaos of 'virtual' fiori elements
        var textChartNode, barChartNode, pieChartNode;
        var res = [];
        var relevantContainerIndex = 0;
        var relevantContainerHeight = 440;
        var searchFacetLargeChartContainer = $(".searchFacetLargeChartContainer");
        for (var i = 0; i < searchFacetLargeChartContainer.length; i++) {
          if (searchFacetLargeChartContainer[i].clientHeight > 0) {
            // the not ui-relevant chartContainers have height of 0
            relevantContainerHeight = searchFacetLargeChartContainer[i].offsetParent.offsetParent.offsetParent.clientHeight; // ToDo
            relevantContainerIndex = i;
            break;
          }
        }
        var chartParent = $(".searchFacetLargeChartContainer")[relevantContainerIndex];
        if (chartParent) {
          var oListContainer = sap.ui.getCore().byId(chartParent.id);
          var oInputFieldForFilterTextSet = $(".sapUshellSearchFacetDialogSubheaderToolbar .sapMSF");
          var oSortButtonSet = $(".sapUshellSearchFacetDialogSortButton");
          var aPotentialCharts = chartParent.firstChild["children"]; // ToDo
          for (var j = 0; j < aPotentialCharts.length; j++) {
            if (aPotentialCharts[j].className) {
              if (aPotentialCharts[j].className.match(/sapMList/)) {
                textChartNode = aPotentialCharts[j];
              } else if (aPotentialCharts[j].className.match(/barchart/)) {
                barChartNode = aPotentialCharts[j];
              } else if (aPotentialCharts[j].className.match(/piechart/)) {
                pieChartNode = aPotentialCharts[j];
              }
            }
          }
          res.push(chartParent);
          res.push(oListContainer);
          res.push(relevantContainerHeight);
          res.push(textChartNode);
          res.push(barChartNode);
          res.push(pieChartNode);
          res.push(oSortButtonSet);
          res.push(oInputFieldForFilterTextSet);
        }
        return res;
      }
    }]);
    return SearchFacetDialogHelperCharts;
  }();
  return SearchFacetDialogHelperCharts;
});
})();