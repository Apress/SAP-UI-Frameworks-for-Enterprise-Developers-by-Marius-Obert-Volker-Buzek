/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  var FacetItem = /*#__PURE__*/function () {
    function FacetItem(properties) {
      _classCallCheck(this, FacetItem);
      var oProperties = properties || {};
      this.selected = oProperties.selected || false;
      this.level = oProperties.level || 0;
      this.filterCondition = oProperties.filterCondition;
      this.value = oProperties.value || ""; // value here means count
      this.label = typeof oProperties.label === "undefined" ? "" : oProperties.label + "";
      this.facetTitle = oProperties.facetTitle || "";
      this.facetAttribute = oProperties.facetAttribute || "";
      this.valueLabel = this.value;
      this.advanced = oProperties.advanced || false;
      this.listed = oProperties.listed || false;
      this.icon = oProperties.icon;
      this.visible = oProperties.visible || true;
    }
    _createClass(FacetItem, [{
      key: "equals",
      value: function equals(otherFacetItem) {
        return this.facetTitle === otherFacetItem.facetTitle && this.label === otherFacetItem.label && this.value === otherFacetItem.value && this.filterCondition.equals(otherFacetItem.filterCondition);
      }
    }, {
      key: "clone",
      value: function clone() {
        var newFacetItem = new FacetItem();
        newFacetItem.facetTitle = this.facetTitle;
        newFacetItem.selected = this.selected;
        newFacetItem.label = this.label;
        newFacetItem.icon = this.icon;
        newFacetItem.level = this.level;
        newFacetItem.value = this.value;
        newFacetItem.valueLabel = this.valueLabel;
        newFacetItem.filterCondition = this.filterCondition.clone();
        return newFacetItem;
      }
    }]);
    return FacetItem;
  }();
  return FacetItem;
});
})();