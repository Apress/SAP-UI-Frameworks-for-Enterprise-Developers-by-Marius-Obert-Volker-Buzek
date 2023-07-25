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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    const observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
const _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    const result = new _Pact();
    const state = this.s;
    if (state) {
      const callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        const value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
sap.ui.define(["./tmpData"], function (___tmpData) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  var createTmpData = ___tmpData["createTmpData"];
  var deleteTmpData = ___tmpData["deleteTmpData"];
  var getTmpData = ___tmpData["getTmpData"];
  var TreeNode = /*#__PURE__*/function () {
    // TODO wrong naming
    function TreeNode(props) {
      var _props$expanded, _props$expandable;
      _classCallCheck(this, TreeNode);
      _defineProperty(this, "childTreeNodes", []);
      this.id = props.id;
      this.label = props.label;
      this.expanded = (_props$expanded = props.expanded) !== null && _props$expanded !== void 0 ? _props$expanded : false;
      this.expandable = (_props$expandable = props.expandable) !== null && _props$expandable !== void 0 ? _props$expandable : false;
      this.adjustPlaceholderChildTreeNode();
    }
    _createClass(TreeNode, [{
      key: "setTreeNodeFactory",
      value: function setTreeNodeFactory(treeNodeFactory) {
        this.getData().treeNodeFactory = treeNodeFactory;
      }
    }, {
      key: "getTreeNodeFactory",
      value: function getTreeNodeFactory() {
        return this.getData().treeNodeFactory;
      }
    }, {
      key: "hasPlaceholderTreeNode",
      value: function hasPlaceholderTreeNode() {
        return this.childTreeNodes.find(function (treeNode) {
          return treeNode.id === "dummy";
        }) !== undefined;
      }
    }, {
      key: "adjustPlaceholderChildTreeNode",
      value: function adjustPlaceholderChildTreeNode() {
        // TODO public/private
        if (this.expandable) {
          if (this.childTreeNodes.length === 0) {
            this.addPlaceholderTreeNode(); // TODO explanation
          }
        } else {
          if (this.hasPlaceholderTreeNode()) {
            this.removePlaceHolderChildTreeNode();
          }
        }
      }
    }, {
      key: "addPlaceholderTreeNode",
      value: function addPlaceholderTreeNode() {
        // TODO rename dummy -> placeholder
        if (this.hasPlaceholderTreeNode()) {
          return;
        }
        this.childTreeNodes.push({
          id: "dummy"
        });
      }
    }, {
      key: "removePlaceHolderChildTreeNode",
      value: function removePlaceHolderChildTreeNode() {
        if (!this.hasPlaceholderTreeNode()) {
          return;
        }
        this.childTreeNodes.splice(0, 1);
      }
    }, {
      key: "getChildTreeNodeById",
      value: function getChildTreeNodeById(id) {
        var _iterator = _createForOfIteratorHelper(this.childTreeNodes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var childTreeNode = _step.value;
            if (childTreeNode.id === id) {
              return childTreeNode;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "addChildTreeNode",
      value: function addChildTreeNode(treeNode) {
        this.expandable = true;
        this.removePlaceHolderChildTreeNode();
        this.childTreeNodes.push(treeNode);
        treeNode.getData().parentTreeNode = this;
        treeNode.register();
      }
    }, {
      key: "addChildTreeNodes",
      value: function addChildTreeNodes(treeNodes) {
        var _iterator2 = _createForOfIteratorHelper(treeNodes),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var treeNode = _step2.value;
            this.addChildTreeNode(treeNode);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }, {
      key: "addChildTreeNodeAtIndex",
      value: function addChildTreeNodeAtIndex(treeNode, insertionIndex) {
        this.expandable = true;
        this.removePlaceHolderChildTreeNode();
        this.childTreeNodes.splice(insertionIndex, 0, treeNode);
        treeNode.getData().parentTreeNode = this;
        treeNode.register();
      }
    }, {
      key: "removeChildTreeNode",
      value: function removeChildTreeNode(treeNode) {
        var index = this.childTreeNodes.indexOf(treeNode);
        if (index < 0) {
          return;
        }
        this.childTreeNodes.splice(index, 1);
        treeNode.getData().parentTreeNode = null;
        treeNode.deRegister();
        this.adjustPlaceholderChildTreeNode();
      }
    }, {
      key: "delete",
      value: function _delete() {
        // delete children
        var _iterator3 = _createForOfIteratorHelper(this.childTreeNodes.slice()),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var childTreeNode = _step3.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            childTreeNode["delete"]();
          }
          // detach from parent (+unregister)
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        var parentTreeNode = this.getData().parentTreeNode;
        if (parentTreeNode) {
          parentTreeNode.removeChildTreeNode(this);
        }
        if (this.tmpDataId) {
          deleteTmpData(this.tmpDataId);
        }
      }
    }, {
      key: "deleteChildTreeNodes",
      value: function deleteChildTreeNodes() {
        var _iterator4 = _createForOfIteratorHelper(this.childTreeNodes.slice()),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var childTreeNode = _step4.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            childTreeNode["delete"]();
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
    }, {
      key: "register",
      value: function register() {
        var parentTreeNode = this.getData().parentTreeNode;
        if (!parentTreeNode.getTreeNodeFactory()) {
          return; // parent node not registered -> registration at the moment not possible TODO explantion
        }

        parentTreeNode.getTreeNodeFactory().registerTreeNode(this);
        var _iterator5 = _createForOfIteratorHelper(this.childTreeNodes),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var childTreeNode = _step5.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            childTreeNode.register();
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }
    }, {
      key: "deRegister",
      value: function deRegister() {
        if (!this.getTreeNodeFactory()) {
          return; // not registered -> nothing todo
        }

        this.getTreeNodeFactory().deRegisterTreeNode(this);
        var _iterator6 = _createForOfIteratorHelper(this.childTreeNodes),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var childTreeNode = _step6.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            childTreeNode.deRegister();
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      }
      /**
       * storage for private data TODO
       * @returns
       */
    }, {
      key: "getData",
      value: function getData() {
        if (!this.tmpDataId) {
          var tmpData = createTmpData();
          this.tmpDataId = tmpData.tmpDataId;
          return tmpData;
        }
        return getTmpData(this.tmpDataId);
      }
    }, {
      key: "setExpanded",
      value: function setExpanded(expanded, updateUI) {
        try {
          const _this = this;
          _this.expanded = expanded;
          if (_this.getTreeNodeFactory().testMode) {
            return _await();
          }
          return _await(_invoke(function () {
            if (_this.expanded) {
              // expand
              return _continueIgnored(_finallyRethrows(function () {
                _this.deleteChildTreeNodes();
                _this.getTreeNodeFactory().setBusy(true);
                return _await(_this.internalFetchChildTreeNodes(), function (childTreeNodes) {
                  if (childTreeNodes.length === 0) {
                    _this.expanded = false;
                    _this.setExpandable(false);
                  } else {
                    _this.addChildTreeNodes(childTreeNodes);
                  }
                });
              }, function (_wasThrown, _result) {
                _this.getTreeNodeFactory().setBusy(false);
                return _rethrow(_wasThrown, _result);
              }));
            } else {
              // collapse
              _this.deleteChildTreeNodes();
            }
          }, function () {
            if (updateUI) {
              _this.getTreeNodeFactory().updateUI();
            }
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "internalFetchChildTreeNodes",
      value: function internalFetchChildTreeNodes() {
        try {
          const _this2 = this;
          return _await(_finallyRethrows(function () {
            return _await(_this2.fetchChildTreeNodes());
          }, function (_wasThrown2, _result2) {
            return _rethrow(_wasThrown2, _result2);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "fetchChildTreeNodes",
      value: function fetchChildTreeNodes() {
        return Promise.resolve([]);
      }
    }, {
      key: "setExpandable",
      value: function setExpandable(expandable) {
        this.expandable = expandable;
        this.adjustPlaceholderChildTreeNode();
      }
    }, {
      key: "updateRecursively",
      value: function updateRecursively() {
        try {
          const _this3 = this;
          return _await(_this3.internalFetchChildTreeNodes(), function (childTreeNodesFromServer) {
            _this3.updateChildren(childTreeNodesFromServer);
            var _iterator7 = _createForOfIteratorHelper(_this3.childTreeNodes),
              _step7;
            return _continueIgnored(_finallyRethrows(function () {
              return _catch(function () {
                _iterator7.s();
                return _continueIgnored(_for(function () {
                  return !(_step7 = _iterator7.n()).done;
                }, void 0, function () {
                  var childTreeNode = _step7.value;
                  if (childTreeNode.id === "dummy") {
                    return;
                  }
                  if (!childTreeNode.expanded) {
                    return;
                  }
                  return _awaitIgnored(childTreeNode.updateRecursively());
                }));
              }, function (err) {
                _iterator7.e(err);
              });
            }, function (_wasThrown3, _result3) {
              _iterator7.f();
              return _rethrow(_wasThrown3, _result3);
            }));
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "updateChildren",
      value: function updateChildren(childTreeNodesFromServer) {
        if (childTreeNodesFromServer.length === 0) {
          this.deleteChildTreeNodes();
          this.expanded = false;
          this.setExpandable(false);
          return;
        }
        this.removePlaceHolderChildTreeNode();
        var childTreeNode;
        for (var i = 0; i < childTreeNodesFromServer.length; ++i) {
          var childTreeNodeFromServer = childTreeNodesFromServer[i];
          if (i <= this.childTreeNodes.length - 1) {
            // 1 node exists at position i
            childTreeNode = this.childTreeNodes[i];
            if (childTreeNode.id === childTreeNodeFromServer.id) {
              // 1.1 correct node at position i
            } else {
              // 1.2 wrong node at position i
              childTreeNode = this.getChildTreeNodeById(childTreeNodeFromServer.id);
              if (childTreeNode) {
                // 1.2.1 correct node at wrong position -> move node
                this.removeChildTreeNode(childTreeNode);
                this.addChildTreeNodeAtIndex(childTreeNode, i);
              } else {
                // 1.2.2 no correct node exists -> create node
                childTreeNode = childTreeNodeFromServer;
                this.addChildTreeNodeAtIndex(childTreeNode, i);
              }
            }
          } else {
            // 2 no node at position i -> create node
            childTreeNode = childTreeNodeFromServer;
            this.addChildTreeNode(childTreeNode);
          }

          // update node properties
          //  childTreeNode.label = childTreeNodeFromServer.label;
          this.updateTreeNodeProperties(childTreeNode, childTreeNodeFromServer);
          Object.assign(childTreeNode.getData(), childTreeNodeFromServer.getData());
          if (childTreeNode.expandable !== childTreeNodeFromServer.expandable) {
            if (childTreeNodeFromServer.expandable) {
              childTreeNode.setExpandable(true);
            } else {
              childTreeNode.deleteChildTreeNodes();
              childTreeNode.setExpandable(false);
              childTreeNode.expanded = false;
            }
          }

          // if server node not used -> delete
          if (childTreeNode !== childTreeNodeFromServer) {
            childTreeNodeFromServer["delete"]();
          }
        }
        // delete superfluous nodes
        while (this.childTreeNodes.length > childTreeNodesFromServer.length) {
          childTreeNode = this.childTreeNodes[this.childTreeNodes.length - 1];
          if (childTreeNode.id === "dummy") {
            this.removePlaceHolderChildTreeNode();
          } else {
            childTreeNode["delete"]();
          }
        }
      }
    }, {
      key: "updateTreeNodeProperties",
      value: function updateTreeNodeProperties(targetTreeNode, sourceTreeNode) {
        var excludeProperties = ["id", "expanded", "expandable", "childTreeNodes", "tmpDataId"];
        for (var propertyName in sourceTreeNode) {
          if (excludeProperties.indexOf(propertyName) >= 0) {
            continue;
          }
          var value = sourceTreeNode[propertyName];
          if (["number", "string", "boolean"].indexOf(_typeof(value)) < 0) {
            continue;
          }
          targetTreeNode[propertyName] = value;
        }
      }
    }, {
      key: "visitChildNodesRecursively",
      value: function visitChildNodesRecursively(callback) {
        var _iterator8 = _createForOfIteratorHelper(this.childTreeNodes),
          _step8;
        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var childTreeNode = _step8.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            callback(childTreeNode);
            childTreeNode.visitChildNodesRecursively(callback);
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      }
    }, {
      key: "visitParentNodesRecursively",
      value: function visitParentNodesRecursively(callback) {
        var parentTreeNode = this.getParentTreeNode();
        if (parentTreeNode) {
          callback(parentTreeNode);
          parentTreeNode.visitParentNodesRecursively(callback);
        }
      }
    }, {
      key: "getParentTreeNode",
      value: function getParentTreeNode() {
        return this.getData().parentTreeNode;
      }
    }, {
      key: "isVisible",
      value: function isVisible() {
        var isExpanded = function isExpanded(node) {
          if (!node.expanded) {
            return false;
          }
          var parentNode = node.getParentTreeNode();
          if (!parentNode) {
            return true;
          }
          return isExpanded(parentNode);
        };
        var parentNode = this.getParentTreeNode();
        if (!parentNode) {
          return true;
        }
        return isExpanded(parentNode);
      }
    }, {
      key: "hasChildNodes",
      value: function hasChildNodes() {
        var _iterator9 = _createForOfIteratorHelper(this.childTreeNodes),
          _step9;
        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var childTreeNode = _step9.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            return true;
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
        return false;
      }
    }, {
      key: "hasExpandedChildNode",
      value: function hasExpandedChildNode() {
        var _iterator10 = _createForOfIteratorHelper(this.childTreeNodes),
          _step10;
        try {
          for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
            var childTreeNode = _step10.value;
            if (childTreeNode.id === "dummy") {
              continue;
            }
            if (childTreeNode.expanded || childTreeNode.hasExpandedChildNode()) {
              return true;
            }
          }
        } catch (err) {
          _iterator10.e(err);
        } finally {
          _iterator10.f();
        }
        return false;
      }
    }]);
    return TreeNode;
  }();
  return TreeNode;
});
})();