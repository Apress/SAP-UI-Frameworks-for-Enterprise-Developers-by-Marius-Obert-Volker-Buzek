/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/GroupHeaderListItem"], function (GroupHeaderListItem) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchGroupHeaderListItem = GroupHeaderListItem.extend("sap.esh.search.ui.controls.SearchGroupHeaderListItem", {
    renderer: {
      apiVersion: 2,
      renderCounter: function renderCounter(oRm, oControl) {
        var btn = oControl.getAggregation("button");
        if (_typeof(btn) === "object") {
          oRm.openStart("div", oControl.getId() + "-groupHeader");
          oRm.openEnd();
          oRm.renderControl(btn);
          oRm.close("div");
        }
      }
    },
    metadata: {
      aggregations: {
        button: {
          type: "sap.m.Button",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      GroupHeaderListItem.prototype.constructor.call(this, sId, settings);
    }
  });
  return SearchGroupHeaderListItem;
});
})();