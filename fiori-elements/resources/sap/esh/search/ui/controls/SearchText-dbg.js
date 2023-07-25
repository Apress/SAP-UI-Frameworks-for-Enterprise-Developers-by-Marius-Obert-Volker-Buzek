/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/Text", "sap/esh/search/ui/SearchHelper"], function (Text, SearchHelper) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchText = Text.extend("sap.esh.search.ui.controls.SearchText", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        isForwardEllipsis4Whyfound: {
          type: "boolean",
          defaultValue: false
        }
      },
      aggregations: {
        icon: {
          type: "sap.ui.core.Icon",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Text.prototype.constructor.call(this, sId, settings);
    },
    onAfterRendering: function _onAfterRendering() {
      var d = this.getDomRef();

      // recover bold tag with the help of text() in a safe way
      SearchHelper.boldTagUnescaper(d);

      // emphasize whyfound in case of ellipsis
      // the problem
      // Logic is moved to SearchResultListItem OnAfterrendering()
      // because both offsetWidth and scrollWidth are 0 when parent .searchResultListItemDetails2 display:none
      // searchHelper.forwardEllipsis4Whyfound(d);

      var icon = this.getAggregation("icon");
      if (icon) {
        var oRm = sap.ui.getCore().createRenderManager();
        var iconContainer = document.createElement("span");
        d.prepend(" ");
        d.prepend(iconContainer);
        oRm.render(icon, iconContainer); // ToDo, wait for future UI5 d.ts update
        oRm.destroy();
      }
    }
  });
  return SearchText;
});
})();