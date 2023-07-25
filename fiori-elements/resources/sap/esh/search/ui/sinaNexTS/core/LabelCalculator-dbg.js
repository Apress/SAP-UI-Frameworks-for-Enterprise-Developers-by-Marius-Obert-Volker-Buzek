/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./errors"], function (___errors) {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var ESHClientError = ___errors["ESHClientError"];
  var DuplicateException = /*#__PURE__*/function (_ESHClientError) {
    _inherits(DuplicateException, _ESHClientError);
    var _super = _createSuper(DuplicateException);
    function DuplicateException(properties) {
      var _properties$message;
      var _this;
      _classCallCheck(this, DuplicateException);
      properties.message = (_properties$message = properties.message) !== null && _properties$message !== void 0 ? _properties$message : "Duplicate node";
      _this = _super.call(this, {
        message: properties.message,
        name: "DuplicateException"
      });
      _this.node = properties.node;
      return _this;
    }
    return _createClass(DuplicateException);
  }(ESHClientError);
  /**
   * Creates unique labels for system data sources.
   * 
   * examples:
   * datasource     system client    --> calculated label
   * Purchase Order CER    002           Purchase Order
   * Sales Order    CER    002           Sales Order
  
   * datasource     system client    --> calculated label         include system to make label unique
   * Purchase Order CER    002           Purchase Order CER
   * Purchase Order CES    003           Purchase Order CES
  
   * datasource     system client    --> calculated label        include system and client to make label unique
   * Purchase Order CES    002           Purchase Order CES 002
   * Purchase Order CES    003           Purchase Order CES 003
  
   * datasource     system client    --> calculated label
   * Purchase Order CER    002           Purchase Order duplicate ...
   * Purchase Order CER    002           Purchase Order duplicate ...
   */
  var Node = /*#__PURE__*/function () {
    function Node(parent, nodeId, labelCalculator) {
      _classCallCheck(this, Node);
      this.parent = parent;
      this.nodeId = nodeId;
      this.labelCalculator = labelCalculator;
      this.childMap = {};
      this.children = [];
    }
    _createClass(Node, [{
      key: "insert",
      value: function insert(keyPath, obj) {
        // check for end of recursion
        if (keyPath.length === 0) {
          this.data = this.labelCalculator.options.data(obj);
          this.obj = obj;
          this.calculateLabel();
          return;
        }

        // insert recursively into tree
        var key = keyPath[0];
        var subNode = this.childMap[key];
        if (keyPath.length === 1 && subNode) {
          throw new DuplicateException({
            node: subNode
          });
        }
        if (!subNode) {
          subNode = new Node(this, key, this.labelCalculator);
          this.childMap[key] = subNode;
          this.children.push(subNode);
          if (this.children.length === 2) {
            this.children[0].recalculateLabels();
            // whenever a node gets a sibling -> recalculate labels of node because due to
            // the sibling we need to add more keys to the label to make the label unique
          }
        }

        subNode.insert(keyPath.slice(1), obj);
      }
    }, {
      key: "recalculateLabels",
      value: function recalculateLabels() {
        var leafs = [];
        this.collectLeafs(leafs);
        for (var i = 0; i < leafs.length; ++i) {
          leafs[i].calculateLabel();
        }
      }
    }, {
      key: "collectLeafs",
      value: function collectLeafs(leafs) {
        if (this.isLeaf()) {
          leafs.push(this);
          return;
        }
        for (var i = 0; i < this.children.length; ++i) {
          this.children[i].collectLeafs(leafs);
        }
      }
    }, {
      key: "isLeaf",
      value: function isLeaf() {
        return this.children.length === 0;
      }
    }, {
      key: "hasSibling",
      value: function hasSibling() {
        return this.parent && this.parent.children.length >= 2;
      }
    }, {
      key: "isChildOfRoot",
      value: function isChildOfRoot() {
        return this.parent && this.parent.nodeId === "__ROOT";
      }
    }, {
      key: "collectPath",
      value: function collectPath(keyPath, force) {
        if (!this.parent) {
          return;
        }
        if (force || this.hasSibling() || this.isChildOfRoot()) {
          keyPath.push(this.nodeId);
          force = true;
        }
        if (this.parent) {
          this.parent.collectPath(keyPath, force);
        }
      }
    }, {
      key: "calculateLabel",
      value: function calculateLabel() {
        // collect keys = labels
        var keyPath = [];
        this.collectPath(keyPath);
        keyPath.reverse();

        // calculate label
        this.labelCalculator.options.setLabel(this.obj, keyPath, this.data);
      }
    }]);
    return Node;
  }();
  var LabelCalculator = /*#__PURE__*/function () {
    function LabelCalculator(options) {
      _classCallCheck(this, LabelCalculator);
      this.options = options;
      this.rootNode = new Node(null, "__ROOT", this);
    }
    _createClass(LabelCalculator, [{
      key: "calculateLabel",
      value: function calculateLabel(obj) {
        var key = this.options.key(obj);
        try {
          // insert datasource into datasource tree
          // for the inserted datasource a unique label is calculated
          // for datasource in sibling tree branches the label is recalculated
          this.rootNode.insert(key, obj);
        } catch (e) {
          if (e.name === "DuplicateException") {
            this.options.setFallbackLabel(e.node.obj, e.node.data); // set fallback label for already existing node
            this.options.setFallbackLabel(obj, this.options.data(obj)); // and for duplicate node
            return;
          }
          throw e;
        }
      }
    }]);
    return LabelCalculator;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.LabelCalculator = LabelCalculator;
  return __exports;
});
})();