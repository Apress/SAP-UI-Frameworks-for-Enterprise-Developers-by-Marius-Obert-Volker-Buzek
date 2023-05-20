/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/ui/export/Spreadsheet", "sap/m/MessageBox", "sap/ui/core/mvc/Controller", "sap/esh/search/ui/SearchResultFormatter"], function (__i18n, Spreadsheet, MessageBox, Controller, SearchResultFormatter) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  var MessageBoxAction = MessageBox["Action"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchSpreadsheet = Controller.extend("sap.esh.search.ui.controls.SearchSpreadsheet", {
    onExport: function _onExport() {
      var _this = this;
      if (this.table === undefined) {
        var tableId = document.querySelectorAll('[id$="-ushell-search-result-table"]')[0].id;
        tableId = tableId.replace("sap-ui-invisible-", "");
        this.table = sap.ui.getCore().byId(tableId);
        this.model = this.table.getModel();
      }
      if (this.exportButton === undefined) {
        var dataExportButtonId = document.querySelectorAll('[id$="-dataExportButton"]')[0].id;
        this.exportButton = sap.ui.getCore().byId(dataExportButtonId);
      }
      this.exportButton.setEnabled(false); // deactivate export button

      // fire search
      if (this.model.getProperty("/boCount") > 1000) {
        MessageBox.information(i18n.getText("exportDataInfo"), {
          actions: [MessageBoxAction.OK, MessageBoxAction.CANCEL],
          onClose: function onClose(oAction) {
            if (oAction == MessageBoxAction.OK) {
              _this.startExport();
            }
            if (oAction == MessageBoxAction.CANCEL) {
              _this.restoreUI();
            }
          }
        });
      } else {
        this.startExport();
      }
    },
    startExport: function _startExport() {
      var _this2 = this;
      this.exportColumns = [];
      this.exportRows = [];

      // set busy true, send search query
      this.model.busyIndicator.setBusy(true);

      // search query
      var exportQuery = this.model.query.clone();
      exportQuery.setCalculateFacets(false);
      exportQuery.setTop(1000);

      // success handler
      var successHandler = function successHandler(searchResultSet) {
        _this2.resultsRaw = searchResultSet.items;
        var formatter = new SearchResultFormatter(_this2.model);
        _this2.resultsFormatted = formatter.format(searchResultSet, exportQuery.filter.searchTerm, {
          suppressHighlightedValues: true
        });
        _this2.parseExportColumns();
        _this2.parseExportRows();
        _this2.doExport();
      };

      // error handler
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      var errorHandler = function errorHandler(error) {
        // this.model.normalSearchErrorHandling(error); // ToDo, function does not exist ?!?
        _this2.restoreUI();
      };
      exportQuery.getResultSetAsync().then(successHandler, errorHandler);
    },
    restoreUI: function _restoreUI() {
      // activate export button, set busy false
      this.exportButton.setEnabled(true);
      this.model.busyIndicator.setBusy(false);
    },
    parseExportColumns: function _parseExportColumns() {
      var _this3 = this;
      // first item is sufficient for column parsing
      var itemRaw = this.resultsRaw[0];
      var itemFormatted = this.resultsFormatted[0];
      var exportColumnTitle = {
        label: itemFormatted.dataSource.labelPlural,
        property: "EXPORT_COLUMN_TITLE",
        type: "string"
      };
      var exportColumnTitleDescription = {
        label: itemFormatted.titleDescriptionLabel + " (" + i18n.getText("titleDescription") + ")",
        property: "EXPORT_COLUMN_TITLE_DESCRIPTION",
        type: "string"
      };
      if (this.model.getResultViewType() !== "searchResultTable") {
        // non-table view exports title, title description, and first 12 item attributes (single attributes or children of group attributes)
        if (itemRaw.titleAttributes.length > 0) {
          this.exportColumns.push(exportColumnTitle);
        }
        if (itemRaw.titleDescriptionAttributes.length > 0) {
          this.exportColumns.push(exportColumnTitleDescription);
        }
        for (var i = 0; i < itemFormatted.itemattributes.length && i < 12; i++) {
          // 1. find un-formatted attribute by id of formatted attribute
          var attributeRaw = this.getAttributeRaw(itemFormatted.itemattributes[i].key);
          // 2. find single attributes of group attributes, push to export columns
          this.pushExportColumns(attributeRaw);
        }
      } else {
        // table view exports visible columns (single attributes or children of group attributes)
        var visibleColumns = [];
        this.table.getColumns().forEach(function (column) {
          if (column.getVisible()) {
            visibleColumns.push(column);
          }
        });
        visibleColumns.sort(function (a, b) {
          if (a.getOrder() < b.getOrder()) {
            return -1;
          }
          if (a.getOrder() > b.getOrder()) {
            return 1;
          }
          return 0;
        });
        visibleColumns.forEach(function (column) {
          var id = column.getBindingContext().getObject().attributeId;
          if (id === "TABLE_COLUMN_TITLE") {
            _this3.exportColumns.push(exportColumnTitle);
            return;
          }
          if (id === "TABLE_COLUMN_TITLE_DESCRIPTION") {
            _this3.exportColumns.push(exportColumnTitleDescription);
            return;
          }
          // 1. find un-formatted attribute by id of formatted attribute
          var attributeRaw = _this3.getAttributeRaw(id);
          // 2. find single attributes of group attributes, push to export columns
          _this3.pushExportColumns(attributeRaw);
        });
      }
    },
    getAttributeRaw: function _getAttributeRaw(key) {
      var itemRaw = this.resultsRaw[0];
      var attributeRaw = undefined;
      for (var i = 0; i < itemRaw.detailAttributes.length; i++) {
        if (itemRaw.detailAttributes[i].id === key) {
          attributeRaw = itemRaw.detailAttributes[i];
          break;
        }
      }
      return attributeRaw;
    },
    pushExportColumns: function _pushExportColumns(attributeRaw) {
      var _this4 = this;
      if (attributeRaw === undefined) {
        return;
      }
      if ("value" in attributeRaw) {
        // single attribute
        if (this.formatExportColumn(attributeRaw) !== undefined) {
          this.exportColumns.push(this.formatExportColumn(attributeRaw));
        }
      }
      if ("attributes" in attributeRaw) {
        // group attribute
        attributeRaw.attributes.forEach(function (elem) {
          return _this4.pushExportColumns(elem.attribute);
        });
      }
      return;
    },
    formatExportColumn: function _formatExportColumn(attribute) {
      if ("label" in attribute && "id" in attribute && "metadata" in attribute) {
        var column = {
          label: attribute.label,
          property: attribute.id
        };
        if (attribute.metadata.type === undefined) {
          column.type = "string";
          return column;
        }
        switch (attribute.metadata.type) {
          // case that.model.sinaNext.AttributeType.Timestamp:
          //     column.type = 'timestamp';
          //     break;
          // case that.model.sinaNext.AttributeType.Date:
          //     column.type = 'date';
          //     break;
          // case that.model.sinaNext.AttributeType.Time:
          //     column.type = 'time';
          //     break;
          case this.model.sinaNext.AttributeType.Double:
            column.type = "number";
            column.scale = 2;
            break;
          case this.model.sinaNext.AttributeType.Integer:
            column.type = "number";
            column.scale = 0;
            break;
          default:
            column.type = "string";
        }
        return column;
      }
      return undefined;
    },
    parseExportRows: function _parseExportRows() {
      var exportRows = [];
      for (var i = 0; i < this.resultsRaw.length; i++) {
        var itemRaw = this.resultsRaw[i];
        var itemFormatted = this.resultsFormatted[i];
        var exportRow = {};
        exportRow["EXPORT_COLUMN_TITLE"] = itemFormatted.title;
        exportRow["EXPORT_COLUMN_TITLE_DESCRIPTION"] = itemFormatted.titleDescription;
        for (var j = 0; j < itemRaw.attributes.length; j++) {
          var attribute = itemRaw.attributes[j];
          if (!attribute.metadata) {
            continue;
          }
          // it is workaround. value, valueformatted should be given in whyfoundprocessor.
          if (attribute.valueHighlighted && attribute.valueHighlighted.length > 0) {
            if (attribute.value.length === 0) {
              attribute.value = this.convertValueHighlighted2Value(attribute.valueHighlighted, attribute.metadata.type);
            }
            if (attribute.valueFormatted.length === 0) {
              attribute.valueFormatted = this.convertValueHighlighted2Value(attribute.valueHighlighted, undefined);
            }
          }
          if (attribute.metadata.type === this.model.sinaNext.AttributeType.Double || attribute.metadata.type === this.model.sinaNext.AttributeType.Integer) {
            exportRow[attribute.id] = attribute.value;
          } else {
            exportRow[attribute.id] = attribute.valueFormatted;
          }
        }
        exportRows.push(exportRow);
      }
      this.exportRows = exportRows;
    },
    convertValueHighlighted2Value: function _convertValueHighlighted2Value(valueHighlighted, type) {
      var value = valueHighlighted;
      value = value.replace(/<b>/g, "");
      value = value.replace(/<\/b>/g, "");
      if (type === this.model.sinaNext.AttributeType.Double || type === this.model.sinaNext.AttributeType.Integer) {
        return Number(value);
      } else {
        return value;
      }
    },
    doExport: function _doExport() {
      var _this5 = this;
      var oSettings = {
        workbook: {
          columns: this.exportColumns
        },
        fileName: i18n.getText("exportFileName"),
        dataSource: this.exportRows
      };
      new Spreadsheet(oSettings).build().then(function () {
        _this5.restoreUI();
      }, function () {
        _this5.restoreUI();
      });
    }
  });
  return SearchSpreadsheet;
});
})();