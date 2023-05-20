/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/HierarchyQuery"], function (____sina_HierarchyQuery) {
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
  var HierarchyQuery = ____sina_HierarchyQuery["HierarchyQuery"];
  var HierarchyParser = /*#__PURE__*/function () {
    function HierarchyParser() {
      _classCallCheck(this, HierarchyParser);
    }
    _createClass(HierarchyParser, [{
      key: "parseHierarchyFacet",
      value: function parseHierarchyFacet(query, attributeMetadata, facetData) {
        var nodeId = query instanceof HierarchyQuery ? query.nodeId : "$$ROOT$$";
        var hierarchyQuery = query.sina.createHierarchyQuery({
          filter: query.filter.clone(),
          attributeId: attributeMetadata.id,
          nodeId: nodeId
        });
        var resultSet = query.sina._createHierarchyResultSet({
          query: hierarchyQuery,
          node: null,
          items: [],
          title: facetData["@com.sap.vocabularies.Common.v1.Label"] || ""
        });
        var nodeMap = {};
        var nodes = [];
        var items = facetData.Items || [];
        var _iterator = _createForOfIteratorHelper(items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;
            var id = item[attributeMetadata.id];
            // 1. create or update node
            var _node = nodeMap[id];
            if (!_node) {
              // 1.1 create node
              _node = query.sina.createHierarchyNode({
                id: id,
                label: item[attributeMetadata.id + "@com.sap.vocabularies.Common.v1.Text"],
                count: item._Count,
                hasChildren: item._HasChildren
              });
              nodes.push(_node);
              nodeMap[id] = _node;
            } else {
              // 1.2 update node
              _node.label = item[attributeMetadata.id + "@com.sap.vocabularies.Common.v1.Text"];
              _node.count = item._Count;
            }
            // 2. add node to parent node
            var parentId = JSON.parse(item._Parent)[attributeMetadata.id];
            var parentNode = nodeMap[parentId];
            if (!parentNode) {
              parentNode = query.sina.createHierarchyNode({
                id: parentId
              });
              nodes.push(parentNode);
              nodeMap[parentId] = parentNode;
            }
            parentNode.addChildNode(_node);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        var node = nodes.find(function (node) {
          return node.id === nodeId;
        });
        resultSet.node = node;
        return resultSet;
      }
    }]);
    return HierarchyParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyParser = HierarchyParser;
  return __exports;
});
})();