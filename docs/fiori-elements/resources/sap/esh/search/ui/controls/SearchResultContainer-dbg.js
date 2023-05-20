/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchModel", "sap/ui/core/Control", "./TypeGuardForControls"], function (SearchModel, Control, ___TypeGuardForControls) {
  // import SearchCountBreadcrumbs from "./SearchCountBreadcrumbs";
  var typesafeRender = ___TypeGuardForControls["typesafeRender"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultContainer = Control.extend("sap.esh.search.ui.controls.SearchResultContainer", {
    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        var oSearchModel = oControl.getModel();
        // inner div for results
        oRm.openStart("div", oControl);
        oRm.style("width", "100%");
        oRm.style("height", "100%");
        oRm["class"]("sapUshellSearchResultContainer");
        if (oSearchModel instanceof SearchModel) {
          var _oSearchModel$config;
          if (oSearchModel !== null && oSearchModel !== void 0 && (_oSearchModel$config = oSearchModel.config) !== null && _oSearchModel$config !== void 0 && _oSearchModel$config.optimizeForValueHelp) {
            oRm["class"]("sapUshellSearchResultContainerValueHelp");
          }
        }
        oRm.openEnd();

        // render main header
        var noResultScreenControl = oControl === null || oControl === void 0 ? void 0 : oControl.getNoResultScreen();
        typesafeRender(noResultScreenControl, oRm);
        // render total count bar
        if (oSearchModel instanceof SearchModel) {
          // render center area
          var centerAreaControl = oControl.getCenterArea();
          typesafeRender(centerAreaControl, oRm);
          var countBreadcrumbsHiddenElement = oControl.getCountBreadcrumbsHiddenElement();
          typesafeRender(countBreadcrumbsHiddenElement, oRm);
          // close inner div for results
          oRm.close("div");
        }
      }
    },
    metadata: {
      properties: {
        countBreadcrumbsHiddenElement: {
          // to be used for aria-describedby of search result list items
          type: "sap.ui.core.InvisibleText"
        }
      },
      aggregations: {
        centerArea: {
          type: "sap.ui.core.Control",
          singularName: "content",
          multiple: true
        },
        countBreadcrumbs: {
          type: "sap.ui.core.Control",
          multiple: false
        },
        contextBarContainer: {
          type: "sap.ui.core.Control",
          multiple: false
        },
        noResultScreen: {
          type: "sap.ui.core.Control",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      // define group for F6 handling
      this.data("sap-ui-fastnavgroup", "true", true /* write  into DOM */);
    },

    getCenterArea: function _getCenterArea() {
      return this.getAggregation("centerArea");
    },
    getNoResultScreen: function _getNoResultScreen() {
      return this.getAggregation("noResultScreen");
    },
    setNoResultScreen: function _setNoResultScreen(object) {
      this.setAggregation("noResultScreen", object);
    },
    getCountBreadcrumbs: function _getCountBreadcrumbs() {
      return this.getAggregation("countBreadcrumbs");
    },
    setCountBreadcrumbs: function _setCountBreadcrumbs(object) {
      this.setAggregation("countBreadcrumbs", object);
    },
    getCountBreadcrumbsHiddenElement: function _getCountBreadcrumbsHiddenElement() {
      return this.getAggregation("countBreadcrumbsHiddenElement");
    },
    getContextBarContainer: function _getContextBarContainer() {
      return this.getAggregation("contextBarContainer");
    },
    setContextBarContainer: function _setContextBarContainer(object) {
      this.setAggregation("contextBarContainer", object);
    }
  });
  return SearchResultContainer;
});
})();