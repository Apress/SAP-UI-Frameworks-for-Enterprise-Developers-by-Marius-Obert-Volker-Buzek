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
sap.ui.define(["../tree/TreeNode"], function (__TreeNode) {
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
  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }
        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }
    return object;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  var TreeNode = _interopRequireDefault(__TreeNode);
  var SearchHierarchyDynamicTreeNode = /*#__PURE__*/function (_TreeNode) {
    _inherits(SearchHierarchyDynamicTreeNode, _TreeNode);
    var _super = _createSuper(SearchHierarchyDynamicTreeNode);
    function SearchHierarchyDynamicTreeNode(props) {
      var _this;
      _classCallCheck(this, SearchHierarchyDynamicTreeNode);
      _this = _super.call(this, props);
      _this.count = props.count;
      _this.selected = false;
      _this.partiallySelected = false;
      _this.hasFilter = false;
      _this.getData().facet = props.facet;
      return _this;
    }

    /*wait() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }*/
    _createClass(SearchHierarchyDynamicTreeNode, [{
      key: "fetchChildTreeNodes",
      value: function fetchChildTreeNodes() {
        try {
          const _this2 = this;
          var _resultSet$node;
          var resultChildNodes = [];
          // assemble filter by removing attribute conditions of "own" facet attribute
          // (we want to show all children independend on the selection done in the "own" facet)
          var facet = _this2.getData().facet;
          var filter = _this2.getData().facet.filter.clone();
          filter.rootCondition.removeAttributeConditions(facet.attributeId);
          // fetch sina result set
          return _await(facet.sina.createHierarchyQuery({
            attributeId: facet.attributeId,
            nodeId: _this2.id,
            filter: filter
          }).getResultSetAsync(), function (resultSet) {
            if (!(resultSet !== null && resultSet !== void 0 && (_resultSet$node = resultSet.node) !== null && _resultSet$node !== void 0 && _resultSet$node.childNodes)) {
              return resultChildNodes;
            }
            var treeNodeFactory = _this2.getTreeNodeFactory();
            var _iterator = _createForOfIteratorHelper(resultSet.node.childNodes),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var childNode = _step.value;
                resultChildNodes.push(treeNodeFactory.createTempTreeNode({
                  id: childNode.id,
                  label: childNode.label,
                  count: childNode.count,
                  facet: _this2.getData().facet,
                  expandable: childNode.hasChildren
                }));
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            _this2.getData().facet.updateStructureTree(resultSet.node);
            return resultChildNodes;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "setExpanded",
      value: function setExpanded(expanded, updateUI) {
        try {
          const _this3 = this;
          return _await(_get(_getPrototypeOf(SearchHierarchyDynamicTreeNode.prototype), "setExpanded", _this3).call(_this3, expanded, false), function () {
            _this3.getData().facet.mixinFilterNodes();
            if (updateUI) {
              _this3.getTreeNodeFactory().updateUI();
            }
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "toggleFilter",
      value: function toggleFilter() {
        if (this.selected) {
          if (this.partiallySelected) {
            // 1. checkbox with square
            this.setFilter(true);
            this.visitParentNodesRecursively(function (node) {
              node.setFilter(false);
            });
            this.visitChildNodesRecursively(function (node) {
              node.setFilter(false);
            });
          } else {
            // 2. selected checkbox
            this.setFilter(false);
          }
        } else {
          // 3. not selected checkbox
          this.setFilter(true);
          this.visitParentNodesRecursively(function (node) {
            node.setFilter(false);
          });
        }
        var facet = this.getData().facet;
        if (facet.isShowMoreDialog) {
          facet.mixinFilterNodes();
          facet.treeNodeFactory.updateUI();
        } else {
          facet.activateFilters();
        }
      }
    }, {
      key: "setFilter",
      value: function setFilter(set) {
        var facet = this.getData().facet;
        var filterCondition = facet.sina.createSimpleCondition({
          operator: facet.sina.ComparisonOperator.DescendantOf,
          attribute: facet.attributeId,
          attributeLabel: facet.title,
          value: this.id,
          valueLabel: this.label
        });
        if (set) {
          facet.filter.autoInsertCondition(filterCondition);
          facet.model.setProperty("/facetDialogOverallCounter", true);
        } else {
          var _facet$model$aFilters;
          facet.filter.autoRemoveCondition(filterCondition);
          // TODO: this if condition works for disable reset button in facet dialog, but could be improved
          if (((_facet$model$aFilters = facet.model["aFilters"]) === null || _facet$model$aFilters === void 0 ? void 0 : _facet$model$aFilters.length) === 1 && facet.filterCount === 1) {
            facet.model.setProperty("/facetDialogOverallCounter", false);
          }
        }
        if (facet.handleSetFilter) {
          facet.handleSetFilter(this, set, filterCondition);
        }
      }
    }]);
    return SearchHierarchyDynamicTreeNode;
  }(TreeNode);
  return SearchHierarchyDynamicTreeNode;
});
})();