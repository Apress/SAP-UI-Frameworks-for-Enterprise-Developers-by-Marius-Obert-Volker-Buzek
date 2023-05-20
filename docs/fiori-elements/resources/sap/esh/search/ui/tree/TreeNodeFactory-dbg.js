/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
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
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
sap.ui.define(["../BusyIndicator"], function (___BusyIndicator) {
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
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
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
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var DummyBusyIndicator = ___BusyIndicator["DummyBusyIndicator"];
  var BaseTreeNodeFactory = /*#__PURE__*/_createClass(function BaseTreeNodeFactory(rootTreeNodePath, testMode) {
    _classCallCheck(this, BaseTreeNodeFactory);
    this.rootTreeNodePath = rootTreeNodePath;
    this.testMode = testMode;
  });
  var TreeNodeFactory = /*#__PURE__*/function (_BaseTreeNodeFactory) {
    _inherits(TreeNodeFactory, _BaseTreeNodeFactory);
    var _super = _createSuper(TreeNodeFactory);
    function TreeNodeFactory(props) {
      var _props$busyIndicator;
      var _this;
      _classCallCheck(this, TreeNodeFactory);
      _this = _super.call(this, props.rootTreeNodePath, props.testMode);
      _defineProperty(_assertThisInitialized(_this), "treeNodeMap", {});
      _defineProperty(_assertThisInitialized(_this), "treeViews", []);
      _this.rootTreeNodePath = props.rootTreeNodePath;
      _this.model = props.model;
      _this.treeNodeConstructor = props.treeNodeConstructor;
      _this.busyIndicator = (_props$busyIndicator = props.busyIndicator) !== null && _props$busyIndicator !== void 0 ? _props$busyIndicator : new DummyBusyIndicator();
      return _this;
    }
    _createClass(TreeNodeFactory, [{
      key: "createRootTreeNode",
      value: function createRootTreeNode() {
        for (var _len = arguments.length, props = new Array(_len), _key = 0; _key < _len; _key++) {
          props[_key] = arguments[_key];
        }
        props[0].expandable = true;
        props[0].expanded = true;
        this.rootTreeNode = this.createTreeNode.apply(this, props);
        this.registerTreeNode(this.rootTreeNode);
        return this.rootTreeNode;
      }
    }, {
      key: "createTreeNode",
      value: function createTreeNode() {
        for (var _len2 = arguments.length, props = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          props[_key2] = arguments[_key2];
        }
        var treeNode = _construct(this.treeNodeConstructor, props);
        return treeNode;
      }
    }, {
      key: "createTempTreeNode",
      value: function createTempTreeNode() {
        for (var _len3 = arguments.length, props = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          props[_key3] = arguments[_key3];
        }
        // only to be called from TreeNode.fetchChildTreeNodes
        var treeNode = _construct(this.treeNodeConstructor, props);
        return treeNode;
      }
    }, {
      key: "registerTreeNode",
      value: function registerTreeNode(treeNode) {
        if (this.treeNodeMap[treeNode.id]) {
          throw "duplicate tree id" + treeNode.id;
        }
        treeNode.setTreeNodeFactory(this);
        this.treeNodeMap[treeNode.id] = treeNode;
      }
    }, {
      key: "deRegisterTreeNode",
      value: function deRegisterTreeNode(treeNode) {
        treeNode.setTreeNodeFactory(null);
        delete this.treeNodeMap[treeNode.id];
      }
    }, {
      key: "getTreeNode",
      value: function getTreeNode(id) {
        return this.treeNodeMap[id];
      }
    }, {
      key: "setRootTreeNodePath",
      value: function setRootTreeNodePath(rootTreeNodePath) {
        this.rootTreeNodePath = rootTreeNodePath;
      }
    }, {
      key: "updateUI",
      value: function updateUI() {
        this.model.setProperty(this.rootTreeNodePath, {
          childTreeNodes: []
        });
        this.model.setProperty(this.rootTreeNodePath, this.rootTreeNode);
        var _iterator = _createForOfIteratorHelper(this.treeViews),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var treeView = _step.value;
            treeView.expandTreeNodes();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "setBusy",
      value: function setBusy(isBusy) {
        this.busyIndicator.setBusy(isBusy);
      }
    }, {
      key: "registerTreeView",
      value: function registerTreeView(treeView) {
        this.treeViews.push(treeView);
      }
    }, {
      key: "deRegisterTreeView",
      value: function deRegisterTreeView(treeView) {
        var index = this.treeViews.indexOf(treeView);
        if (index >= 0) {
          this.treeViews.splice(index, 1);
        }
      }
    }, {
      key: "getRootTreeNode",
      value: function getRootTreeNode() {
        return this.rootTreeNode;
      }
    }, {
      key: "updateRecursively",
      value: function updateRecursively(updateUI) {
        try {
          const _this2 = this;
          return _await(_continueIgnored(_finallyRethrows(function () {
            _this2.setBusy(true);
            return _await(_this2.rootTreeNode.updateRecursively(), function () {
              return _invokeIgnored(function () {
                if (updateUI) {
                  return _awaitIgnored(_this2.updateUI());
                }
              });
            });
          }, function (_wasThrown, _result) {
            _this2.setBusy(false);
            return _rethrow(_wasThrown, _result);
          })));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "delete",
      value: function _delete() {
        this.getRootTreeNode()["delete"]();
      }
    }], [{
      key: "create",
      value: function create(props) {
        var treeNodeFactory = new TreeNodeFactory(props);
        return treeNodeFactory;
      }
    }]);
    return TreeNodeFactory;
  }(BaseTreeNodeFactory);
  TreeNodeFactory.BaseTreeNodeFactory = BaseTreeNodeFactory;
  return TreeNodeFactory;
});
})();