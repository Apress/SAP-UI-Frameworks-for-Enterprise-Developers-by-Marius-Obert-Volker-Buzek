/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/controls/SearchFacetTabBar", "./SearchFacet", "./SearchFacetBarChart", "./SearchFacetPieChart"], function (SearchFacetTabBar, __SearchFacet, __SearchFacetBarChart, __SearchFacetPieChart) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var SearchFacet = _interopRequireDefault(__SearchFacet);
  var SearchFacetBarChart = _interopRequireDefault(__SearchFacetBarChart);
  var SearchFacetPieChart = _interopRequireDefault(__SearchFacetPieChart);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetTabBarRoles = SearchFacetTabBar.extend("sap.esh.search.ui.controls.SearchFacetTabBarRoles", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, settings) {
      SearchFacetTabBar.prototype.constructor.call(this, sId, settings);
    },
    setEshRole: function _setEshRole(role) {
      var aIconTabFilter = this.getAggregation("items");
      var _iterator = _createForOfIteratorHelper(aIconTabFilter),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var iconTabFilter = _step.value;
          var facet = iconTabFilter.getContent()[0];
          if (facet instanceof SearchFacet || facet instanceof SearchFacetPieChart || facet instanceof SearchFacetBarChart) {
            facet.setEshRole(role);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    getEshRole: function _getEshRole() {
      var tabBarItems = this.getAggregation("items");
      var tabBarItem = tabBarItems[0];
      var facet = tabBarItem.getContent()[0];
      return facet.getProperty("eshRole");
    },
    attachSelectionChange: function _attachSelectionChange() {
      //
    }
  });
  return SearchFacetTabBarRoles;
});
})();