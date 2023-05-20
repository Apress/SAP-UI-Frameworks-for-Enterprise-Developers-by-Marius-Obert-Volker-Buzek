/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/List", "sap/m/GroupHeaderListItem", "sap/m/CustomListItem", "./SearchFacetHierarchyStaticTreeItem", "sap/m/Label", "sap/m/library", "sap/ui/core/Icon", "sap/m/FlexBox", "../tree/TreeView", "sap/m/FlexItemData"], function (List, GroupHeaderListItem, CustomListItem, __SearchFacetHierarchyStaticTreeItem, Label, sap_m_library, Icon, FlexBox, __TreeView, FlexItemData) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var SearchFacetHierarchyStaticTreeItem = _interopRequireDefault(__SearchFacetHierarchyStaticTreeItem);
  var ListSeparators = sap_m_library["ListSeparators"];
  var ListMode = sap_m_library["ListMode"];
  var TreeView = _interopRequireDefault(__TreeView);
  var SearchFacetHierarchyStatic = /*#__PURE__*/function (_List) {
    _inherits(SearchFacetHierarchyStatic, _List);
    var _super = _createSuper(SearchFacetHierarchyStatic);
    function SearchFacetHierarchyStatic(sId, options) {
      var _this;
      _classCallCheck(this, SearchFacetHierarchyStatic);
      _this = _super.call(this, sId, options);
      _this.setShowSeparators(ListSeparators.None);
      _this.setMode(ListMode.SingleSelectMaster);
      // heading
      _this.addItem(new GroupHeaderListItem("", {
        title: "{title}"
      }));
      // tree
      var treeView = new TreeView("", {
        treeNodeFactory: "{treeNodeFactory}",
        items: {
          path: "rootTreeNode/childTreeNodes",
          factory: _this.createTreeItem.bind(_assertThisInitialized(_this))
        }
      });
      _this.addItem(new CustomListItem({
        content: treeView
      }));
      return _this;
    }
    _createClass(SearchFacetHierarchyStatic, [{
      key: "createTreeItem",
      value: function createTreeItem(sId, oContext) {
        // label
        var treeItemLabel = new Label({
          text: "{label}",
          width: "100%"
        });
        treeItemLabel.setLayoutData(new FlexItemData({
          growFactor: 1
        }));
        treeItemLabel.addStyleClass("sapUshellSearchHierarchyFacetItemLabel");
        var treeNode = oContext.getObject();
        treeItemLabel.attachBrowserEvent("click", function () {
          treeNode.toggleFilter();
        });
        // icon
        var treeItemIcon = new Icon("", {
          src: "{icon}"
        });
        treeItemIcon.addStyleClass("sapUshellSearchHierarchyFacetItemIcon");
        treeItemIcon.setLayoutData(new FlexItemData({
          growFactor: 0
        }));
        treeItemIcon.attachBrowserEvent("click", function () {
          treeNode.toggleFilter();
        });
        // flex box containing label + icon
        var treeItemFlex = new FlexBox("", {
          items: [treeItemIcon, treeItemLabel],
          width: "100%"
        });
        // tree item containing flex box
        var treeItem = new SearchFacetHierarchyStaticTreeItem("", {
          content: treeItemFlex,
          selectLine: "{hasFilter}"
        });
        return treeItem;
      }
    }, {
      key: "onAfterRendering",
      value: function onAfterRendering() {
        var oModel = this.getModel();
        if (oModel.config.searchInAreaOverwriteMode && typeof oModel.config.setQuickSelectDataSourceAllAppearsNotSelected === "function") {
          oModel.config.setQuickSelectDataSourceAllAppearsNotSelected(oModel);
        }
      }
    }]);
    return SearchFacetHierarchyStatic;
  }(List);
  _defineProperty(SearchFacetHierarchyStatic, "renderer", {
    apiVersion: 2
  });
  return SearchFacetHierarchyStatic;
});
})();