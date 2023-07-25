/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/List", "sap/m/StandardListItem", "sap/m/library", "sap/ui/core/CustomData", "sap/m/Tree", "sap/m/CustomListItem", "./SearchFacetHierarchyStaticTreeItem", "sap/m/Label", "sap/ui/core/Icon"], function (List, StandardListItem, sap_m_library, CustomData, Tree, CustomListItem, __SearchFacetHierarchyStaticTreeItem, Label, Icon) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var ListSeparators = sap_m_library["ListSeparators"];
  var ListMode = sap_m_library["ListMode"];
  var ListType = sap_m_library["ListType"];
  var SearchFacetHierarchyStaticTreeItem = _interopRequireDefault(__SearchFacetHierarchyStaticTreeItem);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetQuickSelectDataSource = List.extend("sap.esh.search.ui.controls.SearchFacetQuickSelectDataSource", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      var _this = this;
      List.prototype.constructor.call(this, sId, options);
      this.setShowSeparators(ListSeparators.None);
      this.setMode(ListMode.SingleSelectMaster);
      this.attachItemPress(function (event) {
        var itemControl = event.getParameter("srcControl");
        var item = itemControl.getBindingContext().getObject();
        _this.handleSelectDataSource(item.dataSource);
      });
      this.bindItems({
        path: "items",
        factory: function factory(sId, oContext) {
          var object = oContext.getObject();
          if (object.type === "quickSelectDataSourceTreeNode") {
            // tree display (one catalog)
            return _this.createTree();
          } else {
            // flat list (repo explorer)
            return _this.createListItem();
          }
        }
      });
      this.addStyleClass("sapUshellSearchFacet");
    },
    handleSelectDataSource: function _handleSelectDataSource(dataSource) {
      var oModel = this.getModel();
      // reset search term (even if selected item gets pressed again)
      if (oModel.config.bResetSearchTermOnQuickSelectDataSourceItemPress) {
        oModel.setSearchBoxTerm("", false);
      }
      // DWC exit for handling SearchIn facets
      if (typeof oModel.config.cleanUpSpaceFilters === "function") {
        oModel.config.cleanUpSpaceFilters(oModel);
      }
      oModel.setDataSource(dataSource);
    },
    createTree: function _createTree() {
      this.tree = new Tree({
        mode: ListMode.None,
        includeItemInSelection: true,
        items: {
          path: "children",
          factory: this.createTreeItem.bind(this)
        },
        toggleOpenState: function toggleOpenState(event) {
          event.getParameter("itemContext").getObject().toggleExpand();
        }
      });
      var delegate = {
        onAfterRendering: function () {
          this.expandTreeNodes();
        }.bind(this)
      };
      this.addEventDelegate(delegate, this);
      return new CustomListItem({
        content: this.tree
      });
    },
    expandTreeNodes: function _expandTreeNodes() {
      var facetModel = this.getBindingContext().getObject();
      var rootNode = facetModel.items[0]; // ToDo
      this.expandTreeNodeRecursively(rootNode, true);
    },
    expandTreeNodeRecursively: function _expandTreeNodeRecursively(node, isRootNode) {
      if (node.expanded && !isRootNode) {
        this.doExpandTreeNode(node);
      }
      if (!node.children) {
        return;
      }
      for (var i = 0; i < node.children.length; ++i) {
        var childNode = node.children[i];
        this.expandTreeNodeRecursively(childNode);
      }
    },
    doExpandTreeNode: function _doExpandTreeNode(node) {
      var items = this.tree.getItems();
      for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        var itemNode = item.getBindingContext().getObject();
        if (itemNode === node) {
          this.tree.expand(i);
          return;
        }
      }
    },
    createTreeItem: function _createTreeItem(sId, oContext) {
      var _this2 = this;
      var content = [];
      var iconUrl = oContext.getObject().icon;
      if (iconUrl) {
        var icon = new Icon("", {
          src: "{icon}"
        });
        icon.addStyleClass("sapUiTinyMarginEnd");
        content.push(icon);
      }
      var label = new Label({
        text: "{label}"
      });
      label.attachBrowserEvent("click", function () {
        _this2.handleSelectDataSource(oContext.getObject().getDataSource());
      });
      content.push(label);
      var treeItem = new SearchFacetHierarchyStaticTreeItem("", {
        content: content,
        selectLine: {
          parts: ["/queryFilter", "dataSourceId"],
          formatter: function formatter(queryFilter, dataSourceId) {
            return queryFilter.dataSource.id === dataSourceId;
          }
        }
      });
      return treeItem;
    },
    createListItem: function _createListItem() {
      return new StandardListItem("", {
        type: ListType.Active,
        title: "{dataSource/label}",
        tooltip: "{dataSource/label}",
        icon: "{dataSource/icon}",
        customData: [new CustomData({
          key: "test-id-collection",
          value: "{dataSource/label}",
          writeToDom: true
        })],
        selected: {
          parts: [{
            path: "/queryFilter"
          }, {
            path: "dataSource"
          }],
          formatter: function formatter(queryFilter, dataSource) {
            return queryFilter.dataSource === dataSource;
          }
        }
      });
    }
  });
  return SearchFacetQuickSelectDataSource;
});
})();