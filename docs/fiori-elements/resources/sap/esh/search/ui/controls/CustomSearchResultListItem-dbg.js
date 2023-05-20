/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/controls/SearchResultListItem"], function (SearchResultListItem) {
  var _SearchResultListItem;
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var CustomSearchResultListItem = SearchResultListItem.extend("sap.esh.search.ui.controls.CustomSearchResultListItem", (_SearchResultListItem = {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        content: {
          type: "sap.esh.search.ui.controls.CustomSearchResultListItemContent"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      SearchResultListItem.prototype.constructor.call(this, sId, settings);
    },
    setupCustomContentControl: function _setupCustomContentControl() {
      var content = this.getProperty("content");
      content.setTitle(this.getProperty("title"));
      content.setTitleUrl(this.getProperty("titleUrl"));
      content.setType(this.getProperty("type"));
      content.setImageUrl(this.getProperty("imageUrl"));
      content.setAttributes(this.getProperty("attributes"));
      // content.setIntents(this.getIntents());
    }
  }, _defineProperty(_SearchResultListItem, "renderer", function _renderer(oRm, oControl) {
    oControl.setupCustomContentControl();
    // eslint-disable-next-line prefer-rest-params
    SearchResultListItem.prototype.getRenderer.call(this).render(arguments);
  }), _defineProperty(_SearchResultListItem, "onAfterRendering", function _onAfterRendering() {
    this.getProperty("content").getTitleVisibility();
  }), _SearchResultListItem));
  return CustomSearchResultListItem;
});
})();