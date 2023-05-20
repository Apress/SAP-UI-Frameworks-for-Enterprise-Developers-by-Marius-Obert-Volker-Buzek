/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
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
window.onload = function () {
  sap.ui.loader.config({
    baseUrl: "../../../../../../resources/",
    paths: {
      "sap/esh/search/ui": "/resources/sap/esh/search/ui"
    }
  });
  sap.ui.require(["sap/esh/search/ui/SearchCompositeControl",
  // "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter",
  "sap/ui/core/dnd/DragDropInfo",
  // "sap/ui/core/dnd/DragInfo",
  "sap/ui/core/dnd/DropInfo", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/ListMode", "sap/m/Button", "sap/m/OverflowToolbar", "sap/m/MessageBox"], function (SearchCompositeControl,
  // Formatter,
  DragDropInfo,
  // DragInfo,
  DropInfo, Table, Column, ColumnListItem, Label, ListMode, Button, OverflowToolbar, MessageBox) {
    // pane left
    // - add search composite control
    var quickSelectDataSources = [];
    var assembleFilteredDataSources = function assembleFilteredDataSources(sina) {
      var sinaNext = sina.sinaNext;
      return new Promise(function (resolve) {
        // quick select data source
        for (var dsKey in sinaNext.dataSourceMap) {
          var ds = sinaNext.dataSourceMap[dsKey];
          if (ds.id === "$$APPS$$") {
            continue;
          }
          quickSelectDataSources.push(sinaNext.createDataSource({
            id: ds.id + "1",
            label: ds.labelPlural,
            icon: ds.icon,
            type: sinaNext.DataSourceType.BusinessObject,
            subType: sinaNext.DataSourceSubType.Filtered,
            dataSource: ds
          }));
        }
        // filtered data source
        var dsUrbanLegendsSummaryTheId = sinaNext.dataSourceMap["Urban_Legends"].id + "_desc_the";
        var dsUrbanLegendsSummaryThe = sinaNext.createDataSource({
          id: dsUrbanLegendsSummaryTheId,
          label: "Urban Legends -> Summary(DESC) '...the...'",
          icon: "sap-icon://thumb-up",
          type: sinaNext.DataSourceType.BusinessObject,
          subType: sinaNext.DataSourceSubType.Filtered,
          dataSource: sinaNext.dataSourceMap["Urban_Legends"],
          filterCondition: sinaNext.createSimpleCondition({
            operator: sinaNext.ComparisonOperator.Co,
            attribute: "DESC",
            value: "the"
          })
        });
        quickSelectDataSources.push(dsUrbanLegendsSummaryThe);
        resolve();
      });
    };

    // eslint-disable-next-line no-unused-vars
    var onDragStartSearch = function onDragStartSearch(oEvent) {
      // nothing to do here
    };
    var onDragEndTable = function onDragEndTable(oEvent) {
      var oDraggedItem = oEvent.getParameter("draggedControl");
      if (oDraggedItem) {
        var oDraggedItemContext = oDraggedItem.getBindingContext();
        if (!oDraggedItemContext) {
          return;
        }
        var droppedResultItemObject = oDraggedItemContext.getObject();
        // add new row
        var oDroppedControl = oEvent.getParameter("droppedControl"); // table or item
        var oTable;
        if (oDroppedControl instanceof ColumnListItem) {
          oTable = oDroppedControl.getParent();
        } else {
          oTable = oDroppedControl;
        }
        var cells = [];
        cells.push(new Label({
          text: droppedResultItemObject.title.replace("<b>", "").replace("</b>", "")
        }));
        for (var i = 0; i < 3; i++) {
          if (droppedResultItemObject.itemattributes[i]) {
            cells.push(new Label({
              text: droppedResultItemObject.itemattributes[i].valueWithoutWhyfound
            }));
          }
        }
        oTable.addItem(new ColumnListItem({
          cells: cells
        }));
      }
    };
    var addDragToSearch = function addDragToSearch(searchCompControl) {
      searchCompControl.addDragDropConfig(new DragDropInfo({
        sourceAggregation: "items",
        dragStart: onDragStartSearch.bind(this)
        // dragEnd: // drop on 'Search', nothing to do
      }));
    };

    var addDropToTable = function addDropToTable(tableControl) {
      tableControl.addDragDropConfig(new DropInfo({
        targetAggregation: "items",
        // dropPosition: "Between",
        drop: onDragEndTable.bind(this)
      }));
    };
    var SearchResultSetFormatter /* extends Formatter.Formatter */ = /*#__PURE__*/function () {
      function SearchResultSetFormatter() {
        _classCallCheck(this, SearchResultSetFormatter);
      }
      _createClass(SearchResultSetFormatter, [{
        key: "formatAsync",
        value: function formatAsync(resultSet) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (var i = 0; i < resultSet.items.length; ++i) {
            var item = resultSet.items[i];
            // show info
            var targetFunctionShowInfo = this.createTargetFunctionShowInfo(item);
            if (targetFunctionShowInfo) {
              if (typeof item.navigationTargets === "undefined") {
                item.navigationTargets = [];
              }
              // eslint-disable-next-line no-underscore-dangle
              item.navigationTargets.push(resultSet.sina._createNavigationTarget({
                label: "Info",
                targetFunction: targetFunctionShowInfo
              }));
            }
            // lookup at Wikipedia
            var targetFunctionLookupAtWikipedia = this.createTargetFunctionLookupAtWikipedia(item);
            if (targetFunctionLookupAtWikipedia) {
              if (typeof item.navigationTargets === "undefined") {
                item.navigationTargets = [];
              }
              // eslint-disable-next-line no-underscore-dangle
              item.navigationTargets.push(resultSet.sina._createNavigationTarget({
                label: "Lookup at Wikipedia",
                targetFunction: targetFunctionLookupAtWikipedia
              }));
            }
          }
          return Promise.resolve(resultSet);
        }
        // eslint-disable-next-line no-unused-vars
      }, {
        key: "createTargetFunctionShowInfo",
        value: function createTargetFunctionShowInfo(item) {
          var _this = this;
          // eslint-disable-next-line no-unused-vars
          var targetFunction = function targetFunction(event) {
            _this.showInfo(item);
          };
          return targetFunction;
        }
      }, {
        key: "showInfo",
        value: function showInfo(item) {
          MessageBox.information("'Show Info' not yet implemented for item '".concat(item.titleAttributes[0].valueFormatted, "'"));
        }
      }, {
        key: "lookupAtWikipedia",
        value: function lookupAtWikipedia(item) {
          window.open("https://wikipedia.org/wiki/".concat(item.titleAttributes[0].valueFormatted));
        }
        // eslint-disable-next-line no-unused-vars
      }, {
        key: "createTargetFunctionLookupAtWikipedia",
        value: function createTargetFunctionLookupAtWikipedia(item) {
          var _this2 = this;
          // eslint-disable-next-line no-unused-vars
          var targetFunction = function targetFunction(event) {
            _this2.lookupAtWikipedia(item);
          };
          return targetFunction;
        }
      }]);
      return SearchResultSetFormatter;
    }();
    var optionsControlPaneLeft = {
      // see SearchCompositeControl.ts and SearchConfigurationSettings.ts for available options
      optimizeForValueHelp: true,
      facetPanelWidthInPercent: 0,
      // facetVisibility: true,
      pageSize: 15,
      updateUrl: false,
      sinaConfiguration: {
        provider: "sample",
        searchResultSetFormatters: [new SearchResultSetFormatter()]
      },
      quickSelectDataSources: quickSelectDataSources,
      initAsync: assembleFilteredDataSources
    };
    var controlPaneLeft = new SearchCompositeControl("ValueHelpEshComp", optionsControlPaneLeft);
    window.addEventListener("hashchange", function () {
      controlPaneLeft.getModel().parseURL();
    }, false);
    controlPaneLeft.attachSearchFinished(function () {
      controlPaneLeft.setResultViewTypes(["searchResultList"]);
      controlPaneLeft.setResultViewType("searchResultList");
    });
    controlPaneLeft.placeAt("panelLeft");

    // pane left
    // - add search composite control
    var columns = [];
    columns.push(new Column({
      header: new Label({
        text: "Title",
        width: "8rem"
      })
    }));
    columns.push(new Column({
      header: new Label({
        text: "Attribute 1",
        width: "8rem"
      })
    }));
    columns.push(new Column({
      header: new Label({
        text: "Attribute 2",
        width: "8rem"
      })
    }));
    columns.push(new Column({
      header: new Label({
        text: "Attribute 3",
        width: "8rem"
      })
    }));
    var optionsControlPaneRight = {
      headerToolbar: new OverflowToolbar({
        content: [new Label({
          text: "Drag&Drop from Result List to 'Shopping Cart' ..."
        }), new Button({
          text: "Delete",
          press: function press() {
            return alert("'Delete' not implemented");
          }
        }), new Button({
          text: "Proceed to Checkout",
          icon: "sap-icon://cart",
          press: function press() {
            return alert("'Proceed to Checkout' not implemented");
          }
        })]
      }),
      mode: ListMode.MultiSelect,
      columns: columns,
      "delete": function _delete() {
        return alert("'Delete' not implemented");
      }
    };
    var controlPaneRight = new Table("ValueHelpDropTarget", optionsControlPaneRight);

    // add drag&drop
    addDragToSearch(controlPaneLeft); // search comp. control (left pane)
    addDropToTable(controlPaneRight); // table (right pane)
    controlPaneRight.placeAt("panelRight");
  });
  jQuery("html").css("overflow-y", "auto");
  jQuery("html").css("height", "100%");
};
})();