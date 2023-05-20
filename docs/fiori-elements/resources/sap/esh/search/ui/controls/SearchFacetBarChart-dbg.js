/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/ComparisonMicroChartData", "sap/ui/core/Control", "sap/m/library"], function (__i18n, ComparisonMicroChart, ComparisonMicroChartData, Control, sap_m_library) {
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
  "sap/suite/ui/microchart/ComparisonMicroChart";
  var ValueColor = sap_m_library["ValueColor"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetBarChart = Control.extend("sap.esh.search.ui.controls.SearchFacetBarChart", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        var _oControl$options;
        // render start of tile container
        oRm.openStart("div", oControl);
        oRm.openEnd();
        var oComparisonMicroChart = new ComparisonMicroChart("", {
          width: "90%",
          colorPalette: [],
          // the colorPalette merely stops the evaluation of the bar with 'neutral', 'good' etc
          /* press: (): void => {}, */
          tooltip: "",
          shrinkable: true
        }); // ToDo: UI5 type files (d.ts) seem to be no complete (i.e. width), 2nd 'any' for functions like setwidth and setStyleClass

        if ((_oControl$options = oControl.options) !== null && _oControl$options !== void 0 && _oControl$options.oSearchFacetDialog) {
          oComparisonMicroChart.setWidth("95%");
          oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChartLarge");
        } else {
          oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChart");
        }
        oComparisonMicroChart.addEventDelegate({
          onAfterRendering: function () {
            $("#" + this.getId()).has(".Good").addClass("sapUshellSearchFacetBarChartSelected");
          }.bind(oControl)
        });
        var barItems = oControl.getAggregation("items");
        var barItems2 = oControl.getProperty("aItems");
        if (barItems.length === 0 && barItems2) {
          barItems = barItems2;
        }
        var iMissingCnt = 0;
        var _iterator = _createForOfIteratorHelper(barItems),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var barItem = _step.value;
            if (!oControl.options.oSearchFacetDialog) {
              if (barItem.getProperty("value")) {
                oComparisonMicroChart.addData(barItem);
              } else {
                iMissingCnt++;
              }
            } else {
              oComparisonMicroChart.addData(barItem);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        oControl.iMissingCnt = iMissingCnt;
        oRm.renderControl(oComparisonMicroChart);

        // render end of tile container
        oRm.close("div");
      }
    },
    metadata: {
      properties: {
        /* lastUpdated: {
            type: "string",
        }, */
        aItems: {
          type: "object"
        },
        oSearchFacetDialog: {
          type: "sap.esh.search.ui.controls.SearchFacetDialog"
        }
      },
      aggregations: {
        items: {
          type: "sap.suite.ui.microchart.ComparisonMicroChartData",
          multiple: true
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      Control.prototype.constructor.call(this, sId, settings);
      this.options = settings || {};
      this.bindAggregation("items", {
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
              formatter: function formatter(isSelected) {
                var res;
                if (isSelected) {
                  res = ValueColor.Good;
                } else {
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
              var context = oEvent.getSource().getBindingContext();
              var model = context.getModel();
              var data = context.getObject();
              var isSelected = data.selected;
              var filterCondition = data.filterCondition; // ToDo

              if (isSelected) {
                // deselect (remove filter)
                if (_this.options.oSearchFacetDialog) {
                  _this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                } else {
                  model.removeFilterCondition(filterCondition, true);
                }
              } else if (_this.options.oSearchFacetDialog) {
                // select (set filter), first for searchFacetDialog
                _this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
              } else {
                // select (set filter), without searchFacetDialog / for small facets
                model.addFilterCondition(filterCondition, true);
              }
            }
          });
          return oComparisonMicroChartData;
        }
      });
    },
    setEshRole: function _setEshRole(role) {
      //
    },
    onAfterRendering: function _onAfterRendering() {
      var infoZeile = $(this.getDomRef()).closest(".sapUshellSearchFacetIconTabBar").find(".sapUshellSearchFacetInfoZeile")[0];
      var oInfoZeile = sap.ui.getCore().byId(infoZeile.id); // ToDo 'any cast'
      if (this.iMissingCnt > 0) {
        oInfoZeile.setVisible(true);
        var message = i18n.getText("infoZeileNumberMoreSelected", [this.iMissingCnt]);
        oInfoZeile.setText(message);
        oInfoZeile.rerender();
      } else {
        oInfoZeile.setVisible(false);
      }
    }
  });
  return SearchFacetBarChart;
});
})();