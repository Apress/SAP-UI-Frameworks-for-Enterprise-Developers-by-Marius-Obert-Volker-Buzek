/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/m/Select", "sap/m/library", "sap/ui/core/Item", "sap/ui/model/BindingMode", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (__i18n, Select, sap_m_library, Item, BindingMode, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  var SelectType = sap_m_library["SelectType"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchSelect = Select.extend("sap.esh.search.ui.controls.SearchSelect", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, settings) {
      var _this = this;
      Select.prototype.constructor.call(this, sId, settings);
      this.bindProperty("visible", {
        path: "/businessObjSearchEnabled"
      });
      this.setAutoAdjustWidth(true);
      this.bindItems({
        path: "/dataSources",
        template: new Item("", {
          key: "{id}",
          text: "{labelPlural}"
        })
      });
      this.bindProperty("selectedKey", {
        path: "/uiFilter/dataSource/id",
        mode: BindingMode.OneWay
      });
      this.bindProperty("tooltip", {
        parts: [{
          path: "/uiFilter/dataSource/labelPlural"
        }],
        formatter: function formatter(labelPlural) {
          return i18n.getText("searchInPlaceholder", [labelPlural]);
        }
      });
      this.attachChange(function () {
        var item = _this.getSelectedItem();
        var context = item.getBindingContext();
        var dataSource = context.getObject();
        var oModel = _this.getModel();
        oModel.setDataSource(dataSource, false);
        oModel.abortSuggestions();
        oModel.eventLogger.logEvent({
          type: UserEventType.DROPDOWN_SELECT_DS,
          dataSourceId: dataSource.id
        });
      });
      this.bindProperty("enabled", {
        parts: [{
          path: "/initializingObjSearch"
        }],
        formatter: function formatter(initializingObjSearch) {
          return !initializingObjSearch;
        }
      });
      this.addStyleClass("searchSelect");
    },
    setDisplayMode: function _setDisplayMode(mode) {
      switch (mode) {
        case "icon":
          this.setType(SelectType.IconOnly);
          this.setIcon("sap-icon://slim-arrow-down");
          break;
        case "default":
          this.setType(SelectType.Default);
          break;
        default:
          break;
      }
    }
  });
  return SearchSelect;
});
})();