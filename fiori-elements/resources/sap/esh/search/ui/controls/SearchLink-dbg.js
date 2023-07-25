/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/m/Link"], function (SearchHelper, Link) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchLink = Link.extend("sap.esh.search.ui.controls.SearchLink", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      aggregations: {
        icon: {
          type: "sap.ui.core.Icon",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Link.prototype.constructor.call(this, sId, settings);
    },
    onAfterRendering: function _onAfterRendering() {
      var d = this.getDomRef(); // ToDo, getDomRef return type is 'Element'

      // recover bold tag with the help of text() in a safe way
      SearchHelper.boldTagUnescaper(d);
      var icon = this.getAggregation("icon");
      if (icon) {
        var oRm = sap.ui.getCore().createRenderManager();
        var iconContainer = document.createElement("span");
        d.prepend(" ");
        d.prepend(iconContainer);
        oRm.render(icon, iconContainer); // ToDo: 'as any'
        oRm.destroy();
      }
    }
  });
  return SearchLink;
});
})();