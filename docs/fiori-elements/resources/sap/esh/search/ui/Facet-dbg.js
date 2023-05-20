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
  var Facet = /*#__PURE__*/function () {
    // ToDo, not really elegant to have pie-chart specific properties here

    function Facet(properties) {
      _classCallCheck(this, Facet);
      this.title = properties.title;
      this.facetType = properties.facetType; //datasource or attribute
      this.dimension = properties.dimension;
      this.dataType = properties.dataType;
      this.matchingStrategy = properties.matchingStrategy;
      this.items = properties.items || [];
      this.totalCount = properties.totalCount;
      this.visible = properties.visible || true;
    }

    /**
     * Checks if the facet has the given filter condition
     * @param   {object}  filterCondition the condition to check for in this facet
     * @returns {Boolean} true if the filtercondition was found in this facet
     */
    _createClass(Facet, [{
      key: "hasFilterCondition",
      value: function hasFilterCondition(filterCondition) {
        for (var i = 0, len = this.items.length; i < len; i++) {
          var fc = this.items[i].filterCondition;
          if (fc.equals && fc.equals(filterCondition)) {
            return true;
          }
        }
        return false;
      }

      /**
       * Checks if this facet has at least one filter condition
       * @returns {Boolean} true if it has at least one filter condition, false otherwise
       */
    }, {
      key: "hasFilterConditions",
      value: function hasFilterConditions() {
        for (var i = 0, len = this.items.length; i < len; i++) {
          if (this.items[i].filterCondition) {
            return true;
          }
        }
        return false;
      }
    }, {
      key: "removeItem",
      value: function removeItem(facetItem) {
        for (var i = 0, len = this.items.length; i < len; i++) {
          var fc = this.items[i].filterCondition;
          if (fc.equals && facetItem.filterCondition && fc.equals(facetItem.filterCondition)) {
            return this.items.splice(i, 1);
          }
        }
      }
    }]);
    return Facet;
  }();
  return Facet;
});
})();