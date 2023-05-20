/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/Select", "sap/ui/core/Item"], function (Select, Item) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchSelectQuickSelectDataSource = Select.extend("sap.esh.search.ui.controls.SearchSelectQuickSelectDataSource", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      Select.prototype.constructor.call(this, sId, options);
      this.attachChange(function (event) {
        var itemControl = event.getParameter("selectedItem");
        var item = itemControl.getBindingContext().getObject();
        _this.handleSelectDataSource(item);
      });
      this.bindItems({
        path: "/config/quickSelectDataSources",
        template: new Item("", {
          key: "{id}",
          text: "{labelPlural}"
        })
      });
      this.bindProperty("maxWidth", {
        parts: [{
          path: "/config/optimizeForValueHelp"
        }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: function formatter(optimizeForValueHelp) {
          if (optimizeForValueHelp) {
            _this.addStyleClass("sapElisaSearchSelectQuickSelectDataSourceValueHelp");
          }
          return "100%";
        }
      });
      this.bindProperty("visible", {
        parts: [{
          path: "/config/optimizeForValueHelp"
        }, {
          path: "/config/quickSelectDataSources"
        }, {
          path: "/count"
        }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        formatter: function formatter(optimizeForValueHelp, qds, count) {
          if (optimizeForValueHelp) {
            // cannot be done in constructor (searchModel n.a.), control has no custom renderer -> thus put it here
            _this.addStyleClass("sapElisaSearchSelectQuickSelectDataSourceValueHelp");
          }
          return (qds === null || qds === void 0 ? void 0 : qds.length) > 0;
        }
      });
    },
    handleSelectDataSource: function _handleSelectDataSource(dataSource) {
      var _this2 = this;
      var oModel = this.getModel();
      // reset search term (even if selected item gets pressed again)
      if (oModel.config.bResetSearchTermOnQuickSelectDataSourceItemPress) {
        oModel.setSearchBoxTerm("", false);
      }
      // DWC exit for handling SearchIn facets
      if (typeof oModel.config.cleanUpSpaceFilters === "function") {
        oModel.config.cleanUpSpaceFilters(oModel);
      }
      oModel.setDataSource(dataSource, false); // true does not trigger search (example: DWC entity list) ?!?
      var searchButtonElements = window.document.querySelectorAll('[id$="-searchInputHelpPageSearchFieldGroup-button"]');
      searchButtonElements.forEach(function (searchButton) {
        if (searchButton.id === _this2.getId().replace("-searchInputHelpPageSearchFieldGroup-selectQsDs", "-searchInputHelpPageSearchFieldGroup-button")) {
          var searchButtonUi5 = sap.ui.getCore().byId(searchButton.id);
          searchButtonUi5["firePress"](); // ToDo - workaround, see above
        }
      });
    }
  });

  return SearchSelectQuickSelectDataSource;
});
})();