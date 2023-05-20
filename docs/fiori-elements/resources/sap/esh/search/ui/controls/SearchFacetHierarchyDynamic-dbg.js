/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/m/List", "sap/m/GroupHeaderListItem", "sap/m/CustomTreeItem", "sap/m/Label", "sap/m/CheckBox", "sap/m/library", "sap/ui/model/BindingMode", "../tree/TreeView", "sap/m/CustomListItem", "sap/m/Link", "sap/m/VBox"], function (__i18n, List, GroupHeaderListItem, CustomTreeItem, Label, CheckBox, sap_m_library, BindingMode, __TreeView, CustomListItem, Link, VBox) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  /*!
   * The SearchFacetHierarchyDynamic control is used for displaying dynamic hierarchy facets.
   * The corresponding model objects are
   * - hierarchydynamic/SearchHierarchyDynamicFacet.js : facet with pointer to root hierarchy node
   * - hierarchydynamic/SearchHierarchyDynamicNode.js  : hierarchy node
   */
  var i18n = _interopRequireDefault(__i18n);
  var ListSeparators = sap_m_library["ListSeparators"];
  var ListMode = sap_m_library["ListMode"];
  var TreeView = _interopRequireDefault(__TreeView);
  // import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
  /**
   * @namespace sap.esh.search.ui.controls
   */
  /* export interface $SearchFacetHierarchyDynamic extends $ListSettings {
      showTitle: boolean | PropertyBindingInfo | `{${string}}`;
      openShowMoreDialogFunction: any; // ToDo
  } */
  // activating above 'export interface...' leads to this runtime error even if not used at all ?!?
  // -> Assertion failed: ManagedObject.apply: encountered unknown setting 'openShowMoreDialogFunction' for class 'sap.m.List'
  var SearchFacetHierarchyDynamic = List.extend("sap.esh.search.ui.controls.SearchFacetHierarchyDynamic", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        showTitle: {
          type: "boolean",
          defaultValue: true
        },
        openShowMoreDialogFunction: {
          type: "function"
        }
      }
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      List.prototype.constructor.call(this, sId, options);
      this.setShowSeparators(ListSeparators.None);
      this.setMode(ListMode.None);
      var treeView = new TreeView("", {
        treeNodeFactory: "{treeNodeFactory}",
        items: {
          path: "rootTreeNode/childTreeNodes",
          factory: function factory(sId, oContext) {
            return _this.createTreeItem(sId, oContext);
          }
        }
      });

      // heading
      if (this.getShowTitle()) {
        this.addItem(new GroupHeaderListItem({
          title: "{title}"
        }));
      }

      // tree
      this.addItem(new CustomListItem({
        content: treeView
      }));

      // show more link
      this.createShowMoreLink();
    },
    getOpenShowMoreDialogFunction: function _getOpenShowMoreDialogFunction() {
      return this.getProperty("openShowMoreDialogFunction");
    },
    createShowMoreLink: function _createShowMoreLink() {
      var _this2 = this;
      var oShowMore = new Link("", {
        text: i18n.getText("showMore"),
        press: function press() {
          var facet = _this2.getBindingContext().getObject();
          var openShowMoreDialog = _this2.getOpenShowMoreDialogFunction();
          openShowMoreDialog(_this2.getModel(), facet.attributeId);
        }
      });
      oShowMore.addStyleClass("sapUshellSearchFacetShowMoreLink");
      var oShowMoreSlot = new VBox("", {
        items: [oShowMore]
      });
      var oShowMoreItem = new CustomListItem("", {
        content: oShowMoreSlot,
        visible: {
          parts: [{
            path: "isShowMoreDialog"
          }],
          formatter: function formatter(isShowMoreDialog) {
            return !isShowMoreDialog;
          }
        }
      });
      oShowMoreItem.addStyleClass("sapUshellSearchFacetShowMoreItem");
      this.addItem(oShowMoreItem);
    },
    getShowTitle: function _getShowTitle() {
      return this.getProperty("showTitle");
    },
    createTreeItem: function _createTreeItem(sId, oContext) {
      var treeNode = oContext.getObject();
      var checkBox = new CheckBox({
        selected: {
          path: "selected",
          mode: BindingMode.OneWay
        },
        partiallySelected: {
          path: "partiallySelected",
          mode: BindingMode.OneWay
        },
        select: function select(event) {
          var treeNode = event.getSource().getBindingContext().getObject(); // ToDo
          treeNode.toggleFilter();
        }
      });
      var label = new Label({
        text: {
          parts: [{
            path: "label"
          }, {
            path: "count"
          }],
          formatter: function formatter(label, count) {
            return count ? label + " (" + count + ")" : label;
          }
        }
      });
      label.attachBrowserEvent("click", function () {
        treeNode.toggleFilter();
      });
      return new CustomTreeItem({
        content: [checkBox, label]
      });
    }
  });
  return SearchFacetHierarchyDynamic;
});
})();