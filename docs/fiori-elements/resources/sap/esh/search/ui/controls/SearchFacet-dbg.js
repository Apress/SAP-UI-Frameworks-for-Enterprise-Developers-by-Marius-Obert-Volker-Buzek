/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/esh/search/ui/controls/SearchFacetItem", "sap/m/List", "sap/m/library", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (__i18n, SearchFacetItem, List, sap_m_library, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  var ListMode = sap_m_library["ListMode"];
  var ListSeparators = sap_m_library["ListSeparators"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacet = List.extend("sap.esh.search.ui.controls.SearchFacet", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        eshRole: {
          type: "string",
          defaultValue: "datasource" // "datasource" or "attribute"
        }
      }
    },

    init: function _init() {
      // ToDo
      // define group for F6 handling
      this.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
    },

    constructor: function _constructor(sId, settings) {
      var _this = this;
      List.prototype.constructor.call(this, sId, settings);
      this.setMode(ListMode.SingleSelectMaster);
      this.setShowSeparators(ListSeparators.None);
      this.setIncludeItemInSelection(true);
      this.attachSelectionChange(function (oEvent) {
        if (_this.getProperty("eshRole") === "attribute") {
          _this.handleItemPress(oEvent);
        }
      });
      this.attachItemPress(function (oEvent) {
        var oModel = _this.getModel();
        if (oModel.config.searchScopeWithoutAll) {
          return;
        }
        if (_this.getProperty("eshRole") === "datasource") {
          _this.handleItemPress(oEvent);
        }
      });
      this.addStyleClass("sapUshellSearchFacet");
    },
    handleItemPress: function _handleItemPress(oEvent) {
      var listItem = oEvent.getParameter("listItem");
      var oSelectedItem = listItem.getBindingContext().getObject();
      var oModel = this.getModel();
      var filterCondition = oSelectedItem.filterCondition;
      if (listItem.getSelected()) {
        // DWC exit for handling SearchIn facets
        if (typeof oModel.config.cleanUpSpaceFilters === "function") {
          oModel.config.cleanUpSpaceFilters(oModel, filterCondition);
        }
        oModel.addFilterCondition(filterCondition);
        oModel.eventLogger.logEvent({
          type: UserEventType.FACET_FILTER_ADD,
          referencedAttribute: oSelectedItem.facetAttribute,
          clickedValue: oSelectedItem.value,
          clickedPosition: listItem.getList().getItems().indexOf(listItem)
        });
      } else {
        oModel.removeFilterCondition(oSelectedItem.filterCondition);
        oModel.eventLogger.logEvent({
          type: UserEventType.FACET_FILTER_DEL,
          referencedAttribute: oSelectedItem.facetAttribute,
          clickedValue: oSelectedItem.value,
          clickedPosition: listItem.getList().getItems().indexOf(listItem)
        });
      }
    },
    onAfterRendering: function _onAfterRendering() {
      var infoZeile = jQuery(this.getDomRef()).closest(".sapUshellSearchFacetIconTabBar").find(".sapUshellSearchFacetInfoZeile")[0];
      if (infoZeile) {
        var oInfoZeile = sap.ui.getCore().byId(infoZeile.id); // ToDo 'any cast'
        oInfoZeile.setVisible(false);
      }
      var oModel = this.getModel();
      if (oModel.config.searchInAreaOverwriteMode && typeof oModel.config.setQuickSelectDataSourceAllAppearsNotSelected === "function") {
        oModel.config.setQuickSelectDataSourceAllAppearsNotSelected(oModel, this);
      }
    },
    setEshRole: function _setEshRole(role) {
      var items = {
        path: "items",
        // children of "/facets" (see SearchModel "/facets/items")
        template: new SearchFacetItem("", {
          isDataSource: role.toLowerCase() === "datasource"
        })
      };
      switch (role.toLowerCase()) {
        case "attribute":
          {
            var oModel = this.getModel();
            var listMode;
            if (oModel.config && typeof oModel.config.getSearchInFacetListMode === "function") {
              var currentItemData = oModel.getProperty(this.getBindingContext().getPath());
              listMode = oModel.config.getSearchInFacetListMode(currentItemData);
            }
            this.setMode(listMode || ListMode.MultiSelect);
            this.setHeaderText("");
            break;
          }
        default:
          // case "datasource": // is default case anyway
          this.setMode(ListMode.SingleSelectMaster);
          this.setHeaderText(i18n.getText("searchIn"));
          break;
      }
      this.bindItems(items);
      this.setProperty("eshRole", role, true); // this validates and stores the new value
      return this; // return "this" to allow method chaining
    }
  });

  return SearchFacet;
});
})();