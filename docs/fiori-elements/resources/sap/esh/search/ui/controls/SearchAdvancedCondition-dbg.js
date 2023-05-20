/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/ui/layout/HorizontalLayout", "sap/m/Button", "sap/m/library", "sap/m/Input", "sap/m/Select", "sap/m/CheckBox", "sap/m/DateRangeSelection", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/m/Label", "../SearchFacetDialogHelper"], function (__i18n, HorizontalLayout, Button, sap_m_library, Input, Select, CheckBox, DateRangeSelection, InvisibleText, Item, Label, __SearchFacetDialogHelper) {
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
  var SearchFacetDialogHelper = _interopRequireDefault(__SearchFacetDialogHelper);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchAdvancedCondition = HorizontalLayout.extend("sap.esh.search.ui.controls.SearchAdvancedCondition", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        type: {
          type: "string"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      HorizontalLayout.prototype.constructor.call(this, sId, settings);
      this.setAllowWrapping(settings === null || settings === void 0 ? void 0 : settings.allowWrapping);
      this.addStyleClass("sapUshellSearchFacetDialogDetailPageCondition");
      if (settings !== null && settings !== void 0 && settings.type) {
        var content = this.contentFactory(settings);
        var _iterator = _createForOfIteratorHelper(content),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var contentItem = _step.value;
            this.addContent(contentItem);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    contentFactory: function _contentFactory(options) {
      var _this = this;
      var oAdvancedCheckBox = new CheckBox("", {
        select: function select(oEvent) {
          SearchFacetDialogHelper.updateCountInfo(_this.getDetailPage(oEvent.getSource()));
        }
      }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionCheckBox");
      var oAdvancedCheckBoxLabel = sap.ui.getCore().byId("advancedCheckBoxLabel");
      if (!oAdvancedCheckBoxLabel) {
        oAdvancedCheckBoxLabel = new InvisibleText("advancedCheckBoxLabel", {
          text: i18n.getText("checkBox")
        });
      }
      oAdvancedCheckBox.addAriaLabelledBy("advancedCheckBoxLabel");
      var oOperatorLabel = sap.ui.getCore().byId("operatorLabel");
      if (!oOperatorLabel) {
        oOperatorLabel = new InvisibleText("operatorLabel", {
          text: i18n.getText("operator")
        });
      }
      var oInputArea, oDeleteButton, oInputsingle, oSelect;
      switch (options.type) {
        case "timestamp":
        case "date":
          oInputArea = new DateRangeSelection({
            width: "86%",
            change: function change(oEvent) {
              _this.onDateRangeSelectionChange(oEvent);
            }
          }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
          oInputArea.onAfterRendering = function () {
            var $this = $(this.getDomRef());
            $("input", $this).attr("readonly", "readonly"); // ToDo: JQuery
          };

          break;
        case "string":
          oAdvancedCheckBox.setVisible(false);
          oInputsingle = new Input({
            width: "56%",
            placeholder: i18n.getText("filterCondition"),
            liveChange: function liveChange(oEvent) {
              _this.onAdvancedInputChange(oEvent);
            }
          }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
          oSelect = new Select({
            width: "40%",
            tooltip: i18n.getText("operator"),
            items: [new Item({
              text: i18n.getText("equals"),
              key: "eq"
            }), new Item({
              text: i18n.getText("beginsWith"),
              key: "bw"
            }), new Item({
              text: i18n.getText("endsWith"),
              key: "ew"
            }), new Item({
              text: i18n.getText("contains"),
              key: "co"
            })]
          }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionSelect");
          oSelect.addAriaLabelledBy("operatorLabel");
          oInputArea = new HorizontalLayout({
            allowWrapping: true,
            content: [oSelect, oInputsingle]
          });
          oDeleteButton = new Button({
            icon: "sap-icon://sys-cancel",
            type: ButtonType.Transparent,
            tooltip: i18n.getText("removeButton"),
            press: function press( /*oEvent: Event*/
            ) {
              _this.onDeleteButtonPress( /*oEvent*/);
            }
          });
          break;
        case "text":
          oAdvancedCheckBox.setVisible(false);
          oInputsingle = new Input({
            width: "56%",
            placeholder: i18n.getText("filterCondition"),
            liveChange: function liveChange(oEvent) {
              _this.onAdvancedInputChange(oEvent);
            }
          }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
          oSelect = new Select({
            width: "40%",
            tooltip: i18n.getText("operator"),
            items: [new Item({
              text: i18n.getText("containsWords"),
              key: "co"
            })]
          }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionSelect");
          oSelect.addAriaLabelledBy("operatorLabel");
          oInputArea = new HorizontalLayout({
            allowWrapping: true,
            content: [oSelect, oInputsingle]
          });
          oDeleteButton = new Button({
            icon: "sap-icon://sys-cancel",
            type: ButtonType.Transparent,
            tooltip: i18n.getText("removeButton"),
            press: function press( /*oEvent: Event*/
            ) {
              _this.onDeleteButtonPress( /*oEvent*/);
            }
          });
          break;
        case "integer":
        case "number":
          {
            var oInputRangeFrom = new Input("", {
              width: "46.5%",
              placeholder: i18n.getText("fromPlaceholder"),
              liveChange: function liveChange(oEvent) {
                _this.onAdvancedNumberInputChange(oEvent);
              }
            }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
            var oInputRangeTo = new Input("", {
              width: "46.5%",
              placeholder: i18n.getText("toPlaceholder"),
              liveChange: function liveChange(oEvent) {
                _this.onAdvancedNumberInputChange(oEvent);
              }
            }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
            var oLabelSeparator = new Label("", {
              text: i18n.getText("threeDots")
            }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionLabel");
            oInputArea = new HorizontalLayout("", {
              allowWrapping: true,
              content: [oInputRangeFrom, oLabelSeparator, oInputRangeTo]
            });
            oInputArea.addEventDelegate({
              // workaround to set focus at right end position
              onAfterRendering: function onAfterRendering(oEvent) {
                var length = oEvent.srcControl.getParent().getParent().getContent().length;
                var index = oEvent.srcControl.getParent().getParent().indexOfAggregation("content", oEvent.srcControl.getParent());
                if (index === length - 2) {
                  var value = oEvent.srcControl.getContent()[2].getValue();
                  oEvent.srcControl.getContent()[2].setValue();
                  oEvent.srcControl.getContent()[2].setValue(value);
                }
              }
            });
            break;
          }
        default:
          break;
      }
      return [oAdvancedCheckBox, oInputArea, oDeleteButton];
    },
    getDetailPage: function _getDetailPage(oControl) {
      if (oControl.hasStyleClass && (oControl.hasStyleClass("sapUshellSearchFacetDialogDetailPageString") || oControl.hasStyleClass("sapUshellSearchFacetDialogDetailPage"))) {
        return oControl;
      } else {
        return this.getDetailPage(oControl.getParent()); // ToDo
      }
    },

    onDateRangeSelectionChange: function _onDateRangeSelectionChange(oEvent) {
      var oDateRangeSelection = oEvent.getSource(); // ToDo
      var oAdvancedCondition = oDateRangeSelection.getParent();
      var oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0];
      if (oDateRangeSelection.getDateValue() && oDateRangeSelection.getSecondDateValue()) {
        oAdvancedConditionCheckBox.setSelected(true);
        SearchFacetDialogHelper.insertNewAdvancedCondition(oAdvancedCondition, "date");
        SearchFacetDialogHelper.updateCountInfo(oAdvancedCondition.getParent().getParent());
      } else {
        oAdvancedConditionCheckBox.setSelected(false);
      }
    },
    onAdvancedInputChange: function _onAdvancedInputChange(oEvent) {
      var oInput = oEvent.getSource();
      var oAdvancedCondition = oInput.getParent().getParent(); // ToDo
      var oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0];
      if (oInput.getValue()) {
        oAdvancedConditionCheckBox.setSelected(true);
        SearchFacetDialogHelper.updateCountInfo(this.getDetailPage(oAdvancedConditionCheckBox));
      } else {
        oAdvancedConditionCheckBox.setSelected(false);
      }
    },
    onDeleteButtonPress: function _onDeleteButtonPress() {
      // const oAdvancedCondition = (oEvent.getSource() as Control).getParent();
      //v SearchFacetDialogHelper.deleteAdvancedCondition(oAdvancedCondition);
      SearchFacetDialogHelper.deleteAdvancedCondition(this);
    },
    onAdvancedNumberInputChange: function _onAdvancedNumberInputChange(oEvent) {
      var oInput = oEvent.getSource();
      var oAdvancedCondition = oInput.getParent().getParent();
      var oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0];
      var oAdvancedConditionRange = oInput.getParent();
      var oAdvancedRangeFrom = oAdvancedConditionRange.getContent()[0];
      var oAdvancedRangeTo = oAdvancedConditionRange.getContent()[2];
      if (oAdvancedRangeFrom.getValue() && oAdvancedRangeTo.getValue()) {
        oAdvancedConditionCheckBox.setSelected(true);
        SearchFacetDialogHelper.insertNewAdvancedCondition(oAdvancedCondition, "number");
        SearchFacetDialogHelper.updateCountInfo(oAdvancedCondition.getParent().getParent());
      } else {
        oAdvancedConditionCheckBox.setSelected(false);
      }
    }
  });
  SearchAdvancedCondition.injectSearchFacetDialogHelper = function injectSearchFacetDialogHelper(_SearchFacetDialogHelper) {
    SearchAdvancedCondition.searchFacetDialogHelper = _SearchFacetDialogHelper;
  };
  return SearchAdvancedCondition;
});
})();