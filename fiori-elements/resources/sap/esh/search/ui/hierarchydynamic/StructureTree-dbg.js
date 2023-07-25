/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  /*!
   * When manipulating the filter conditions (for instance changing the search term) hierarchy nodes may appear/disappear.
   * In case a filter is set for a disappeared hierarchy node we want to show the hierarchy node (without count) anyway.
   * The structure tree is always updated with hierarchy structure information from the server.
   * In case a node is not included in the server response the node may be taken from the structure tree.
   */
  var StructureTreeNode = /*#__PURE__*/function () {
    function StructureTreeNode(properties) {
      _classCallCheck(this, StructureTreeNode);
      this.id = properties.id;
      this.label = properties.label;
      this.tree = properties.tree;
      this.childNodes = [];
      this.childNodeMap = {};
      this.parentNode = null;
    }
    _createClass(StructureTreeNode, [{
      key: "addChildNode",
      value: function addChildNode(node) {
        this.childNodes.push(node);
        this.childNodeMap[node.id] = node;
        node.parentNode = this;
      }
    }, {
      key: "update",
      value: function update(sinaNode) {
        for (var i = 0; i < sinaNode.childNodes.length; ++i) {
          var sinaChildNode = sinaNode.childNodes[i];
          var childNode = this.childNodeMap[sinaChildNode.id];
          if (!childNode) {
            childNode = this.tree.createNode({
              id: sinaChildNode.id,
              label: sinaChildNode.label
            });
            this.addChildNode(childNode);
          }
          childNode.update(sinaChildNode);
        }
      }
    }]);
    return StructureTreeNode;
  }();
  var StructureTree = /*#__PURE__*/function () {
    function StructureTree(options) {
      _classCallCheck(this, StructureTree);
      this.nodeMap = {};
      this.node = this.createNode(options.rootNode);
    }
    _createClass(StructureTree, [{
      key: "createNode",
      value: function createNode(properties) {
        properties.tree = this;
        var node = new StructureTreeNode(properties);
        this.nodeMap[properties.id] = node;
        return node;
      }
    }, {
      key: "getNode",
      value: function getNode(id) {
        return this.nodeMap[id];
      }
    }, {
      key: "update",
      value: function update(sinaNode) {
        var node = this.nodeMap[sinaNode.id];
        if (!node) {
          throw new Error("structure tree update failed, node does not exist: ".concat(sinaNode === null || sinaNode === void 0 ? void 0 : sinaNode.id));
        }
        node.update(sinaNode);
      }
    }, {
      key: "updateFromHierarchyNodePath",
      value: function updateFromHierarchyNodePath(hierarchyNodePath) {
        var parentNode;
        var _iterator = _createForOfIteratorHelper(hierarchyNodePath.path),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var hierarchyNode = _step.value;
            var node = this.getNode(hierarchyNode.id);
            if (!node) {
              node = this.createNode({
                id: hierarchyNode.id,
                label: hierarchyNode.label || hierarchyNode.id
              });
              if (!parentNode) {
                throw "program error, parent node not set";
              }
              parentNode.addChildNode(node);
            }
            parentNode = node;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }]);
    return StructureTree;
  }();
  StructureTree.StructureTreeNode = StructureTreeNode;
  return StructureTree;
});
})();