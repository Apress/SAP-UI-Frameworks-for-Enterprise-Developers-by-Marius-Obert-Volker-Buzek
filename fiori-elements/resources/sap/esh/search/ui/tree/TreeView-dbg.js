/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/Tree", "../SearchHelper"], function (Tree, ___SearchHelper) {
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
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  var delayedExecution = ___SearchHelper["delayedExecution"];
  /**
   * @namespace sap.esh.search.ui.tree.TreeView
   */
  var TreeView = Tree.extend("sap.esh.search.ui.tree.TreeView.TreeView", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        treeNodeFactory: {
          type: "object"
        }
      }
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      if (_typeof(sId) === "object") {
        options = sId;
      }
      options.toggleOpenState = function (event) {
        _this.handleToggleOpenState(event);
      };
      Tree.prototype.constructor.call(this, sId, options);
      this.expandTreeNodes = delayedExecution(this.expandTreeNodes, 200);
      this.setBusyIndicatorDelay(200);
    },
    setTreeNodeFactory: function _setTreeNodeFactory(treeNodeFactory) {
      this.setProperty("treeNodeFactory", treeNodeFactory);
      if (treeNodeFactory) {
        treeNodeFactory.registerTreeView(this);
      }
    },
    getTreeNodeFactory: function _getTreeNodeFactory() {
      return this.getProperty("treeNodeFactory");
    },
    destroy: function _destroy(bSuppressInvalidate) {
      Tree.prototype.destroy.call(this, bSuppressInvalidate);
      this.getTreeNodeFactory().deRegisterTreeView(this);
    },
    handleToggleOpenState: function _handleToggleOpenState(event) {
      var treeNode = event.getParameter("itemContext").getObject();
      treeNode.setExpanded(event.getParameter("expanded"), true);
    },
    expandTreeNodes: function _expandTreeNodes() {
      this.collapseAll();
      this.expandTreeNodeRecursively(this.getTreeNodeFactory().getRootTreeNode());
    },
    expandTreeNodeRecursively: function _expandTreeNodeRecursively(treeNode) {
      if (treeNode.expanded) {
        this.doExpand(treeNode);
      }
      var _iterator = _createForOfIteratorHelper(treeNode.childTreeNodes),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var childTreeNode = _step.value;
          if (childTreeNode.id === "dummy") {
            continue;
          }
          this.expandTreeNodeRecursively(childTreeNode);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    doExpand: function _doExpand(treeNode) {
      var items = this.getItems();
      for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        var context = item.getBindingContext();
        if (!context) {
          continue;
        }
        var itemTreeNode = context.getObject();
        if (itemTreeNode === treeNode) {
          this.expand(i);
          return;
        }
      }
    }
  });
  return TreeView;
});
})();