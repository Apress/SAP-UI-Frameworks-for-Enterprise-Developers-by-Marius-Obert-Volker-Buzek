/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./CatalogSearch"], function (__CatalogSearch) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var CatalogSearch = _interopRequireDefault(__CatalogSearch);
  var AppSearch = /*#__PURE__*/function () {
    function AppSearch() {
      _classCallCheck(this, AppSearch);
      this.catalogSearch = new CatalogSearch();
      this.searchProviders = [this.catalogSearch]; // deactivate transaction search
    }

    _createClass(AppSearch, [{
      key: "prefetch",
      value: function prefetch() {
        for (var i = 0; i < this.searchProviders.length; i++) {
          var searchProvider = this.searchProviders[i];
          searchProvider.prefetch();
        }
      }
    }, {
      key: "search",
      value: function search(query) {
        try {
          const _this = this;
          var queryPromises = [];
          for (var i = 0; i < _this.searchProviders.length; i++) {
            var searchProvider = _this.searchProviders[i];
            queryPromises.push(searchProvider.search(query));
          }
          return Promise.all(queryPromises).then(function (subResults) {
            var result = {
              totalCount: 0,
              tiles: []
            };
            for (var _i = 0; _i < subResults.length; _i++) {
              var _result$tiles;
              var subResult = subResults[_i];
              result.totalCount += subResult.totalCount;
              (_result$tiles = result.tiles).push.apply(_result$tiles, _toConsumableArray(subResult.tiles));
            }
            return result;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return AppSearch;
  }();
  return AppSearch;
});
})();