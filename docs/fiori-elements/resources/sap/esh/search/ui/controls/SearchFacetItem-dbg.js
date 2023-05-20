/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/ui/core/CustomData", "sap/m/library", "sap/m/StandardListItem"], function (SearchHelper, CustomData, sap_m_library, StandardListItem) {
  var ListType = sap_m_library["ListType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetItem = StandardListItem.extend("sap.esh.search.ui.controls.SearchFacetItem", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        isDataSource: {
          type: "boolean",
          defaultValue: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      StandardListItem.prototype.constructor.call(this, sId, settings);
      this.setType(ListType.Active);
      this.bindProperty("title", {
        path: "label"
      });
      this.bindProperty("tooltip", {
        parts: [{
          path: "label"
        }, {
          path: "valueLabel"
        }],
        formatter: function formatter(label, valueLabel) {
          return valueLabel ? "".concat(label, ": ").concat(valueLabel) : "";
        }
      });
      if (!settings.isDataSource) {
        this.bindProperty("icon", {
          path: "icon"
        });
      }
      this.bindProperty("info", {
        parts: [{
          path: "value"
        }, {
          path: "valueLabel"
        }],
        formatter: function formatter(value, valueLabel) {
          if (typeof value === "number") {
            return SearchHelper.formatInteger(value);
          } else if (typeof value === "string") {
            return value;
          } else if (typeof valueLabel !== "undefined" && valueLabel !== "") {
            return valueLabel;
          } else {
            return "";
          }
        }
      });
      this.bindProperty("selected", {
        path: "selected"
      });
      this.insertCustomData(new CustomData({
        key: "test-id-facet-dimension-value",
        value: {
          parts: [{
            path: "facetTitle"
          }, {
            path: "label"
          }],
          formatter: function formatter(facetTitle, label) {
            return "".concat(facetTitle, "-").concat(label);
          }
        },
        writeToDom: true
      }), 0);
      this.addStyleClass("sapUshellSearchFacetItem");
      this.addEventDelegate({
        onAfterRendering: function onAfterRendering() {
          var _this$getBindingConte;
          if (_this !== null && _this !== void 0 && (_this$getBindingConte = _this.getBindingContext()) !== null && _this$getBindingConte !== void 0 && _this$getBindingConte.getObject()) {
            var level = _this.getBindingContext().getObject().level;
            if (jQuery("html").attr("dir") === "rtl") {
              // ToDo: JQuery
              jQuery(_this.getDomRef()) // ToDo: JQuery
              .children(".sapMLIBContent").css("padding-right", level + "rem");
            } else {
              jQuery(_this.getDomRef()) // ToDo: JQuery
              .children(".sapMLIBContent").css("padding-left", level + "rem");
            }
          }
        }
      });
    }
  });
  return SearchFacetItem;
});
})();