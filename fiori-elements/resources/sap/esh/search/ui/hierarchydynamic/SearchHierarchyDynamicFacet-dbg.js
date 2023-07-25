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
sap.ui.define(["../tree/TreeNodeFactory", "./SearchHierarchyDynamicTreeNode", "./StructureTree"], function (__TreeNodeFactory, __SearchHierarchyDynamicTreeNode, __StructureTree) {
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
   * The SearchHierarchyDynamicFacet class is used for the model representation of dynamic hierarchy facets.
   * * The corresponding UI control is SearchFacetHierarchyDynamic.
   */
  var TreeNodeFactory = _interopRequireDefault(__TreeNodeFactory);
  var SearchHierarchyDynamicTreeNode = _interopRequireDefault(__SearchHierarchyDynamicTreeNode);
  var StructureTree = _interopRequireDefault(__StructureTree);
  var SearchHierarchyDynamicFacet = /*#__PURE__*/function () {
    function SearchHierarchyDynamicFacet(properties) {
      _classCallCheck(this, SearchHierarchyDynamicFacet);
      this.model = properties.model;
      this.sina = properties.sina;
      this.dataSource = properties.dataSource;
      this.attributeId = properties.attributeId;
      this.dimension = this.attributeId; // alias for compatability with the simple attribute facets
      this.title = properties.title;
      this.filter = properties.filter;
      this.modelPathPrefix = properties.modelPathPrefix;
      this.isShowMoreDialog = properties.isShowMoreDialog;
      this.handleSetFilter = properties.handleSetFilter;
      this.filterCount = this.filter.rootCondition.getAttributeConditions(this.attributeId).length;
      this.facetType = "hierarchy";
      this.facetIndex = -1;
      this.structureTree = new StructureTree({
        rootNode: {
          id: SearchHierarchyDynamicFacet.rootNodeId,
          label: "root"
        }
      });
      this.notDisplayedFilterConditions = [];
      this.treeNodeFactory = TreeNodeFactory.create({
        model: this.model,
        rootTreeNodePath: "/facets/".concat(this.facetIndex, "/rootTreeNode"),
        // updated in setFacetIndex
        treeNodeConstructor: SearchHierarchyDynamicTreeNode,
        busyIndicator: this.model.busyIndicator
      });
      this.rootTreeNode = this.treeNodeFactory.createRootTreeNode({
        id: SearchHierarchyDynamicFacet.rootNodeId,
        label: "Root",
        count: 0,
        facet: this
      });
    }
    _createClass(SearchHierarchyDynamicFacet, [{
      key: "setFilter",
      value: function setFilter(filter) {
        this.filter = filter;
      }
    }, {
      key: "setHandleSetFilter",
      value: function setHandleSetFilter(handleSetFilter) {
        this.handleSetFilter = handleSetFilter;
      }
    }, {
      key: "setFacetIndex",
      value: function setFacetIndex(index) {
        this.facetIndex = index;
        this.treeNodeFactory.setRootTreeNodePath("".concat(this.modelPathPrefix, "/").concat(this.facetIndex, "/rootTreeNode"));
      }
    }, {
      key: "updateStructureTree",
      value: function updateStructureTree(sinaNode) {
        this.structureTree.update(sinaNode);
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
      key: "updateFromResultSet",
      value: function updateFromResultSet(resultSet) {
        var childTreeNodes = [];
        var _iterator = _createForOfIteratorHelper(resultSet.node.childNodes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var childNode = _step.value;
            childTreeNodes.push(this.treeNodeFactory.createTempTreeNode({
              id: childNode.id,
              label: childNode.label,
              count: childNode.count,
              facet: this,
              expandable: childNode.hasChildren
            }));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.rootTreeNode.updateChildren(childTreeNodes);
        this.updateStructureTree(resultSet.node);
        return Promise.resolve();
      }
    }, {
      key: "getComplexConditionOfFacet",
      value: function getComplexConditionOfFacet() {
        for (var i = 0; i < this.filter.rootCondition.conditions.length; ++i) {
          var complexCondition = this.filter.rootCondition.conditions[i];
          if (complexCondition.containsAttribute(this.attributeId)) {
            return complexCondition;
          }
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
        for (var i = 0; i < complexCondition.conditions.length; ++i) {
          var condition = complexCondition.conditions[i];
          filterConditions.push(condition);
        }
        return filterConditions;
      }
    }, {
      key: "mixinFilterNodes",
      value: function mixinFilterNodes() {
        // reset filter flag for complete tree
        this.rootTreeNode.hasFilter = false;
        this.rootTreeNode.visitChildNodesRecursively(function (treeNode) {
          treeNode.hasFilter = false;
        });
        // update filter flag from filter conditions
        var treeNodeId;
        var notDisplayedFilterConditions = [];
        var filterConditions = this.getFilterConditions();
        for (var i = 0; i < filterConditions.length; ++i) {
          var filterCondition = filterConditions[i];
          treeNodeId = filterCondition.value; // ToDo
          var treeNode = this.treeNodeFactory.getTreeNode(treeNodeId);
          if (treeNode) {
            treeNode.hasFilter = true;
          } else {
            notDisplayedFilterConditions.push(filterCondition);
          }
        }
        // add tree nodes for filters not in tree
        for (var j = 0; j < notDisplayedFilterConditions.length; ++j) {
          var notDisplayedFilterCondition = notDisplayedFilterConditions[j];
          treeNodeId = notDisplayedFilterCondition.value;
          // try to add filter node via structure tree
          if (this.addMissingFilterNode(treeNodeId)) {
            // in case of success delete from notDisplayedFilterConditions list
            notDisplayedFilterConditions.splice(j, 1);
            j--;
          }
        }
        this.notDisplayedFilterConditions = notDisplayedFilterConditions;
        this.calculateCheckboxStatus();
        this.calculateFilterCount();
      }
    }, {
      key: "calculateFilterCount",
      value: function calculateFilterCount() {
        var filterCount = this.filter.rootCondition.getAttributeConditions(this.attributeId).length;
        this.model.setProperty("".concat(this.modelPathPrefix, "/").concat(this.facetIndex, "/filterCount"), filterCount);
      }
    }, {
      key: "addMissingFilterNode",
      value: function addMissingFilterNode(id) {
        var _this = this;
        var getOrCreateTreeNode = function getOrCreateTreeNode(structureTreeNode) {
          var treeNode = _this.treeNodeFactory.getTreeNode(structureTreeNode.id);
          if (treeNode) {
            if (treeNode.isVisible()) {
              return treeNode;
            } else {
              return null;
            }
          }
          if (!structureTreeNode.parentNode) {
            throw new Error("program error parent node missing for " + structureTreeNode.id);
          }
          var parentTreeNode = getOrCreateTreeNode(structureTreeNode.parentNode);
          if (!parentTreeNode) {
            return null;
          }
          treeNode = _this.treeNodeFactory.createTreeNode({
            id: structureTreeNode.id,
            label: structureTreeNode.label,
            count: 0,
            facet: _this
          });
          parentTreeNode.addChildTreeNode(treeNode);
          return treeNode;
        };
        var structureTreeNode = this.structureTree.getNode(id);
        if (!structureTreeNode) {
          return false;
        }
        var treeNode = getOrCreateTreeNode(structureTreeNode);
        if (!treeNode) {
          return false;
        }
        treeNode.hasFilter = true;
        return true;
      }
    }, {
      key: "calculateCheckboxStatus",
      value: function calculateCheckboxStatus() {
        // reset
        this.rootTreeNode.selected = false;
        this.rootTreeNode.partiallySelected = false;
        this.rootTreeNode.visitChildNodesRecursively(function (node) {
          node.selected = false;
          node.partiallySelected = false;
        });
        // collect leafs
        var leafNodes = [];
        if (!this.rootTreeNode.hasChildNodes()) {
          leafNodes.push(this.rootTreeNode);
        }
        this.rootTreeNode.visitChildNodesRecursively(function (node) {
          if (!node.hasChildNodes()) {
            leafNodes.push(node);
          }
        });
        // calculate selected and partiallySelected
        for (var i = 0; i < leafNodes.length; ++i) {
          var leafNode = leafNodes[i];
          this.calculateCheckboxStatusFromLeafNode(leafNode);
        }
      }
    }, {
      key: "calculateCheckboxStatusFromLeafNode",
      value: function calculateCheckboxStatusFromLeafNode(leafNode) {
        var node = leafNode;
        var markPartiallySelected = false;
        while (node) {
          if (node.selected && node.partiallySelected) {
            return;
          }
          if (node.hasFilter) {
            node.selected = true;
            node.partiallySelected = false;
            markPartiallySelected = true;
          } else {
            if (markPartiallySelected) {
              node.selected = true;
              node.partiallySelected = true;
            }
          }
          node = node.getParentTreeNode();
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
      key: "updateNodesFromHierarchyNodePaths",
      value: function updateNodesFromHierarchyNodePaths(hierarchyNodePaths) {
        var _iterator2 = _createForOfIteratorHelper(hierarchyNodePaths),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var hierarchyNodePath = _step2.value;
            if (hierarchyNodePath.name !== this.attributeId) {
              continue;
            }
            this.structureTree.updateFromHierarchyNodePath(hierarchyNodePath);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }]);
    return SearchHierarchyDynamicFacet;
  }();
  _defineProperty(SearchHierarchyDynamicFacet, "rootNodeId", "$$ROOT$$");
  return SearchHierarchyDynamicFacet;
});
})();