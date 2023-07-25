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
  var SearchResultSetItemMemory = /*#__PURE__*/function () {
    function SearchResultSetItemMemory() {
      _classCallCheck(this, SearchResultSetItemMemory);
      _defineProperty(this, "items", {});
    }
    _createClass(SearchResultSetItemMemory, [{
      key: "reset",
      value: function reset() {
        this.items = {};
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        var item = this.items[key];
        if (!item) {
          item = {};
          this.items[key] = item;
        }
        return item;
      }
    }, {
      key: "setExpanded",
      value: function setExpanded(key, expanded) {
        var item = this.getItem(key);
        item.expanded = expanded;
      }
    }, {
      key: "getExpanded",
      value: function getExpanded(key) {
        return this.getItem(key).expanded;
      }
    }]);
    return SearchResultSetItemMemory;
  }();
  return SearchResultSetItemMemory;
});
})();