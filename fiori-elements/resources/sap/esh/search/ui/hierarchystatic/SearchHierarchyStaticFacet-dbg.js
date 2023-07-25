/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
function _empty() {}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
sap.ui.define(["../tree/TreeNodeFactory", "./SearchHierarchyStaticTreeNode", "../SearchHelperSequentializeDecorator"], function (__TreeNodeFactory, __SearchHierarchyStaticTreeNode, ___SearchHelperSequentializeDecorator) {
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
  /*!
   * The SearchHierarchyStaticFacet class is used for the model representation of static hierarchy facets.
   * The corresponding UI control is SearchFacetHierarchyStatic.
   */
  var TreeNodeFactory = _interopRequireDefault(__TreeNodeFactory);
  var SearchHierarchyStaticTreeNode = _interopRequireDefault(__SearchHierarchyStaticTreeNode);
  var sequentializedExecution = ___SearchHelperSequentializeDecorator["sequentializedExecution"];
  var SearchHierarchyStaticFacet = /*#__PURE__*/function () {
    function SearchHierarchyStaticFacet(properties) {
      _classCallCheck(this, SearchHierarchyStaticFacet);
      this.model = properties.model;
      this.sina = this.model.sinaNext;
      this.attributeId = properties.attributeId;
      this.dataSource = properties.dataSource;
      this.filter = properties.filter;
      this.facetType = "hierarchyStatic";
      this.title = properties.title;
      this.facetIndex = -1;
      this.position = -1;
      this.treeNodeFactory = TreeNodeFactory.create({
        model: this.model,
        rootTreeNodePath: "/facets/".concat(this.facetIndex, "/rootTreeNode"),
        // updated in setFacetIndex
        treeNodeConstructor: SearchHierarchyStaticTreeNode,
        busyIndicator: this.model.busyIndicator
      });
      this.rootTreeNode = this.treeNodeFactory.createRootTreeNode({
        id: SearchHierarchyStaticFacet.rootNodeId,
        label: "Root",
        facet: this
      });
      this.updateTree = sequentializedExecution(this.updateTree);
    }
    _createClass(SearchHierarchyStaticFacet, [{
      key: "setFacetIndex",
      value: function setFacetIndex(index) {
        this.facetIndex = index;
        this.treeNodeFactory.setRootTreeNodePath("/facets/".concat(this.facetIndex, "/rootTreeNode"));
      }
    }, {
      key: "initAsync",
      value: function initAsync() {
        try {
          const _this = this;
          return _await(_this.rootTreeNode.fetchChildTreeNodes(), function (childTreeNodes) {
            _this.rootTreeNode.addChildTreeNodes(childTreeNodes);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "activateFilters",
      value: function activateFilters() {
        try {
          const _this2 = this;
          return _await(_continueIgnored(_finallyRethrows(function () {
            return _await(_this2.model._firePerspectiveQuery({
              preserveFormerResults: false
            }), function () {
              _this2.model.notifyFilterChanged();
            });
          }, function (_wasThrown, _result) {
            return _rethrow(_wasThrown, _result);
          })));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "updateTree",
      value: function updateTree() {
        // not sure whether sequentialized decorator does work on async methods
        // therefore use this wrapper
        return this.doUpdateTree();
      }
    }, {
      key: "doUpdateTree",
      value: function doUpdateTree() {
        try {
          const _this3 = this;
          return _await(_this3.treeNodeFactory.updateRecursively(), function () {
            return _await(_this3.mixinFilterNodes(), function () {
              _this3.treeNodeFactory.updateUI();
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getComplexConditionOfFacet",
      value: function getComplexConditionOfFacet() {
        var _iterator = _createForOfIteratorHelper(this.filter.rootCondition.conditions),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var complexCondition = _step.value;
            if (complexCondition.containsAttribute(this.attributeId)) {
              return complexCondition;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return null;
      }
    }, {
      key: "getFilterConditions",
      value: function getFilterConditions() {
        var filterConditions = [];
        var complexCondition = this.getComplexConditionOfFacet();
        if (!complexCondition) {
          return filterConditions;
        }
        var _iterator2 = _createForOfIteratorHelper(complexCondition.conditions),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var condition = _step2.value;
            filterConditions.push(condition);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return filterConditions;
      }
    }, {
      key: "mixinFilterNodes",
      value: function mixinFilterNodes() {
        try {
          const _this4 = this;
          // reset filter flags for complete tree
          _this4.rootTreeNode.hasFilter = false;
          _this4.rootTreeNode.visitChildNodesRecursively(function (node) {
            node.hasFilter = false;
          });
          // set filter flag from filter conditions
          var filterConditions = _this4.getFilterConditions();
          var _iterator3 = _createForOfIteratorHelper(filterConditions),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var filterCondition = _step3.value;
              var node = _this4.treeNodeFactory.getTreeNode(filterCondition.value);
              if (!node) {
                continue; // TODO shall never happen
              }

              node.hasFilter = true;
            }
            // auto expand first filter
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          return _await(_awaitIgnored(_this4.autoExpandFirstFilterNode()));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "handleModelUpdate",
      value: function handleModelUpdate() {
        this.treeNodeFactory.updateUI();
      }
    }, {
      key: "delete",
      value: function _delete() {
        this.treeNodeFactory["delete"]();
      }
    }, {
      key: "autoExpandFirstFilterNode",
      value: function autoExpandFirstFilterNode() {
        try {
          const _this5 = this;
          // determine first node with filter
          var firstFilterNode = null;
          _this5.rootTreeNode.visitChildNodesRecursively(function (node) {
            if (node.hasFilter && !firstFilterNode) {
              firstFilterNode = node;
            }
          });
          if (!firstFilterNode) {
            return _await();
          }
          if (firstFilterNode.isVisible()) {
            return _await();
          }
          // expand nodes following path to root node
          var node = firstFilterNode.getParentTreeNode();
          while (node) {
            node.expanded = true;
            node = node.getParentTreeNode();
          }
          // update tree
          return _await(_awaitIgnored(_this5.treeNodeFactory.updateRecursively()));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "updateNodesFromHierarchyNodePaths",
      value: function updateNodesFromHierarchyNodePaths(hierarchyNodePaths) {
        for (var i = 0; i < hierarchyNodePaths.length; ++i) {
          var hierarchyNodePath = hierarchyNodePaths[i];
          if (hierarchyNodePath.name !== this.attributeId) {
            continue;
          }
          this.rootTreeNode.updateNodePath(hierarchyNodePath.path, 0);
        }
      }
    }]);
    return SearchHierarchyStaticFacet;
  }();
  _defineProperty(SearchHierarchyStaticFacet, "rootNodeId", "$$ROOT$$");
  return SearchHierarchyStaticFacet;
});
})();