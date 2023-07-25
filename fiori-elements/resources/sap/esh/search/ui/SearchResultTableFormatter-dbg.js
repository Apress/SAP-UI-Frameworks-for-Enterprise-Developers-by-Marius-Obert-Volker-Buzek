/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "./SearchResultBaseFormatter", "./SearchResultTableColumnType"], function (__i18n, __SearchResultBaseFormatter, ___SearchResultTableColumnType) {
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
  var i18n = _interopRequireDefault(__i18n);
  var SearchResultBaseFormatter = _interopRequireDefault(__SearchResultBaseFormatter);
  var TableColumnType = ___SearchResultTableColumnType["TableColumnType"];
  var SearchResultTableFormatter = /*#__PURE__*/function (_SearchResultBaseForm) {
    _inherits(SearchResultTableFormatter, _SearchResultBaseForm);
    var _super = _createSuper(SearchResultTableFormatter);
    // used in formatColumns and formatRows

    function SearchResultTableFormatter(model) {
      var _this;
      _classCallCheck(this, SearchResultTableFormatter);
      _this = _super.call(this, model);
      _this.model = model;
      _this.config = _this.model.config;
      _this.columns = undefined;
      return _this;
    }

    /*
     * ===================================
     * format columns for table view
     * ===================================
     */
    _createClass(SearchResultTableFormatter, [{
      key: "formatColumns",
      value: function formatColumns(results) {
        var _config$extendTableCo;
        var column;
        var columns = [];
        var firstResult = results[0];

        // detail columns
        for (var i = 0; i < firstResult.itemattributes.length; i++) {
          // if (firstResult.itemattributes[i].whyfound !== true) { // exclude whyfound attributes // unsure whyfound is normal highlighted or extra whyfound
          columns.push({
            attributeId: firstResult.itemattributes[i].key,
            persoColumnId: "TABLE_COLUMN_DETAIL_" + i,
            name: firstResult.itemattributes[i].name,
            type: TableColumnType.DETAIL
          });
          // }
        }

        // title description column
        if (firstResult.titleDescription !== undefined) {
          column = {
            attributeId: "TABLE_COLUMN_TITLE_DESCRIPTION",
            persoColumnId: "TABLE_COLUMN_TITLE_DESCRIPTION",
            name: firstResult.titleDescriptionLabel + " (" + i18n.getText("titleDescription") + ")",
            type: TableColumnType.TITLE_DESCRIPTION
          };
          columns.unshift(column);
        }

        // title column
        if (firstResult.title !== undefined) {
          var _this$config;
          if (typeof this.config.titleColumnName !== "undefined" && ((_this$config = this.config) === null || _this$config === void 0 ? void 0 : _this$config.titleColumnName) !== "") {
            column = {
              attributeId: "TABLE_COLUMN_TITLE",
              persoColumnId: "TABLE_COLUMN_TITLE",
              name: i18n.getText(this.config.titleColumnName),
              type: TableColumnType.TITLE
            };
          } else {
            column = {
              attributeId: "TABLE_COLUMN_TITLE",
              persoColumnId: "TABLE_COLUMN_TITLE",
              name: this.model.getDataSource().label,
              type: TableColumnType.TITLE
            };
          }
          if (this.config.titleColumnWidth && this.config.titleColumnWidth !== "") {
            column.width = this.config.titleColumnWidth;
          }
          columns.unshift(column);
        }

        // related apps column
        if (firstResult.navigationObjects !== undefined && firstResult.navigationObjects.length > 0) {
          columns.push({
            attributeId: "TABLE_COLUMN_RELATED_APPS",
            persoColumnId: "TABLE_COLUMN_RELATED_APPS",
            name: i18n.getText("intents"),
            type: TableColumnType.RELATED_APPS
          });
        }

        // extend column
        var config = this.model.config;
        if (config !== null && config !== void 0 && (_config$extendTableCo = config.extendTableColumn) !== null && _config$extendTableCo !== void 0 && _config$extendTableCo.column) {
          column = {
            attributeId: config.extendTableColumn.column.attributeId,
            persoColumnId: "TABLE_COLUMN_EXTEND",
            name: config.extendTableColumn.column.name,
            width: config.extendTableColumn.column.width,
            type: TableColumnType.EXTEND
          };
          columns.push(column);
        }
        for (var _i = 0; _i < columns.length; _i++) {
          // columns[i].key = columns[i].attributeId;
          columns[_i].index = _i; // to limit visible columns in default table view (SearchCompositeControl)
        }

        /*
        order of columns:
        1. title
        2. title description
        3. detail attributes
        4. related apps
        5. extend column
        */
        this.columns = columns;
        return columns;
      }

      /*
       * ===================================
       * format rows with cells for table view
       * ===================================
       */
    }, {
      key: "formatRows",
      value: function formatRows(results) {
        // format columns
        if (this.columns === undefined) {
          this.formatColumns(results);
        }

        // format rows
        var rows = [];
        for (var i = 0; i < results.length; i++) {
          rows[i] = {
            cells: []
          };
          // detail cells
          var attributes = results[i].itemattributes;
          for (var j = 0; j < this.columns.length; j++) {
            if (this.columns[j].type !== TableColumnType.DETAIL) {
              continue;
            }
            var attribute = this.getAttribute(attributes, this.columns[j].attributeId);
            if (attribute === undefined) {
              rows[i].cells.push({
                value: this.getText(undefined)
              });
            } else {
              if (attribute.iconUrl) {
                rows[i].cells.push({
                  value: this.getText(attribute.value),
                  icon: attribute.iconUrl
                });
              } else {
                rows[i].cells.push({
                  value: this.getText(attribute.value)
                });
              }
            }
          }

          // title description cell
          if (results[i].titleDescription !== undefined) {
            rows[i].cells.unshift({
              value: this.getText(results[i].titleDescription)
              // tooltip: this.getText(results[i].titleDescription), // TODO: exclude <b> tag
            });
          }

          // title cell
          if (results[i].title !== undefined) {
            rows[i].cells.unshift({
              value: this.getText(results[i].title),
              // tooltip: this.getText(results[i].title), // TODO: exclude <b> tag
              // uri: results[i]["uri"], // ToDo: obsolete?
              titleNavigation: results[i].titleNavigation,
              isTitle: true,
              titleIconUrl: results[i].titleIconUrl,
              titleInfoIconUrl: results[i].titleInfoIconUrl
            });
          }

          // related apps cell
          if (results[i].navigationObjects !== undefined && results[i].navigationObjects.length > 0) {
            rows[i].cells.push({
              value: i18n.getText("intents"),
              tooltip: i18n.getText("intents"),
              navigationObjects: results[i].navigationObjects,
              isRelatedApps: true
            });
          }

          // custom table columns (DWC)
          if (this.config.extendTableColumn && typeof this.config.extendTableColumn["assembleCell"] === "function" // ToDo
          ) {
            var data = {
              id: results[i].attributesMap["id"] || results[i].attributesMap["ID"],
              favorites_user_id: results[i].attributesMap["favorites_user_id"] || results[i].attributesMap["FAVORITES_USER_ID"]
            };
            if (typeof data.id !== "undefined" && typeof data.favorites_user_id !== "undefined") {
              // response (see 'responseAttributes') might not contain these attributes
              rows[i].cells.push(this.config.extendTableColumn["assembleCell"](data)); // ToDo
            }
          }
        }

        /*
        order of cells:
        1. title
        2. title description
        3. detail attributes
        4. related apps
        5. extend column content
        */
        return rows;
      }
    }, {
      key: "getAttribute",
      value: function getAttribute(attributes, id) {
        for (var i = 0; i < attributes.length; i++) {
          if (attributes[i].key === id) {
            return attributes[i];
          }
        }
        return undefined;
      }
    }, {
      key: "getText",
      value: function getText(value) {
        if (value === undefined || value === null) {
          return "\u2013";
        }
        if (typeof value !== "string") {
          return value + ""; // convert to string
        }

        if (value.trim().length === 0) {
          return "\u2013";
        }
        return value;
      }
    }]);
    return SearchResultTableFormatter;
  }(SearchResultBaseFormatter);
  return SearchResultTableFormatter;
});
})();