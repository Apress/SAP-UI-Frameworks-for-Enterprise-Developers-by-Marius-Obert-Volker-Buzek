/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/CustomTreeItem"], function (CustomTreeItem) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetHierarchyStaticTreeItem = CustomTreeItem.extend("sap.esh.search.ui.controls.SearchFacetHierarchyStaticTreeItem", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        selectLine: {
          type: "boolean",
          defaultValue: false
        }
      }
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      CustomTreeItem.prototype.constructor.call(this, sId, options);
      var delegate = {
        onAfterRendering: function onAfterRendering() {
          var domRef = _this.getDomRef();
          if (_this.getProperty("selectLine")) {
            if (!domRef.classList.contains("sapMLIBSelected")) {
              domRef.classList.add("sapMLIBSelected");
            }
          } else {
            if (domRef.classList.contains("sapMLIBSelected")) {
              domRef.classList.remove("sapMLIBSelected");
            }
          }
        }
      };
      this.addEventDelegate(delegate, this);
    }
  });
  return SearchFacetHierarchyStaticTreeItem;
});
})();