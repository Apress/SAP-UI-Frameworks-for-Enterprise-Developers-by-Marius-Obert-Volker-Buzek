/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./sinaNexTS/sina/HierarchyDisplayType"], function (___sinaNexTS_sina_HierarchyDisplayType) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  var HierarchyDisplayType = ___sinaNexTS_sina_HierarchyDisplayType["HierarchyDisplayType"];
  var Formatter = /*#__PURE__*/function () {
    function Formatter(model) {
      _classCallCheck(this, Formatter);
      this.model = model;
    }
    _createClass(Formatter, [{
      key: "formatNodePaths",
      value: function formatNodePaths(searchResultSet) {
        if (searchResultSet) {
          var path = this._selectNodePath(searchResultSet);
          if (path) {
            return path.path;
          }
        }
        return [];
      }
    }, {
      key: "formatHierarchyAttribute",
      value: function formatHierarchyAttribute(searchResultSet) {
        if (searchResultSet) {
          var path = this._selectNodePath(searchResultSet);
          if (path) {
            return path.name;
          }
        }
        return "";
      }
    }, {
      key: "_selectNodePath",
      value: function _selectNodePath(searchResultSet) {
        var paths = searchResultSet.hierarchyNodePaths;
        if (paths && Array.isArray(paths) && paths.length > 0) {
          var _loop = function _loop(i) {
            var path = paths[i];
            var attributeName = path.name;
            if (path && Array.isArray(path.path) && attributeName) {
              var _searchResultSet$quer, _searchResultSet$quer2;
              var attrMetadata = (_searchResultSet$quer = searchResultSet.query.getDataSource()) === null || _searchResultSet$quer === void 0 ? void 0 : (_searchResultSet$quer2 = _searchResultSet$quer.attributesMetadata) === null || _searchResultSet$quer2 === void 0 ? void 0 : _searchResultSet$quer2.find(function (attributeMetadata) {
                return attributeMetadata.id === attributeName;
              });
              if (attrMetadata && attrMetadata.isHierarchy === true && (attrMetadata.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView || attrMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet)) {
                return {
                  v: path
                };
              }
            }
          };
          for (var i = 0; i < paths.length; i++) {
            var _ret = _loop(i);
            if (_typeof(_ret) === "object") return _ret.v;
          }
        }
        return null;
      }
    }]);
    return Formatter;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Formatter = Formatter;
  return __exports;
});
})();