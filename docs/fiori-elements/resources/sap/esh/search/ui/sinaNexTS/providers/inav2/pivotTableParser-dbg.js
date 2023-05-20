/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/core"], function (core) {
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
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
  var ResultSetParser = /*#__PURE__*/function () {
    function ResultSetParser(options) {
      _classCallCheck(this, ResultSetParser);
      this.resultSet = options.resultSet;
    }
    _createClass(ResultSetParser, [{
      key: "parseNamedValue",
      value: function parseNamedValue(namedValue) {
        var value;
        var name;
        var complexValue;
        for (var prop in namedValue) {
          switch (prop) {
            case "Name":
              name = namedValue[prop];
              break;
            case "Value":
              value = namedValue[prop];
              break;
            default:
              if (!complexValue) {
                complexValue = {};
              }
              complexValue[prop] = namedValue[prop];
          }
        }
        if (complexValue) {
          complexValue.Value = value;
          return {
            name: name,
            value: complexValue
          };
        }
        return {
          name: name,
          value: value
        };
      }
    }, {
      key: "formatItem",
      value: function formatItem(item) {
        var list;
        if (item.NamedValues) {
          list = item.NamedValues;
        }
        if (!list) {
          return item;
        }
        var obj = {};
        for (var i = 0; i < list.length; ++i) {
          var namedValue = list[i];
          var parsedNamedValue = this.parseNamedValue(namedValue);
          obj[parsedNamedValue.name] = this.formatItem(parsedNamedValue.value);
        }
        return obj;
      }
    }, {
      key: "formatItems",
      value: function formatItems(items) {
        var result = {};
        for (var i = 0; i < items.length; ++i) {
          var item = items[i];
          var formattedItem = this.formatItem(item);
          core.extend(result, formattedItem);
        }
        return result;
      }
    }, {
      key: "parse",
      value: function parse() {
        // check for data
        if (!this.resultSet.Grids || !this.resultSet.Grids[0] || !this.resultSet.Grids[0].Axes) {
          return {
            cells: [],
            axes: []
          };
        }

        // enhance result set:
        // -> create link to item lists in dimensions of axes
        this.enhance(this.resultSet);

        // get reference to grid,row axis,col axis
        var grid = this.resultSet.Grids[0];

        // parse
        if (grid.Cells.length > 0) {
          return this.parseWithCells(grid);
        }
        return this.parseWithoutCells(grid);
      }
    }, {
      key: "parseWithCells",
      value: function parseWithCells(grid) {
        var result = {
          axes: [],
          cells: []
        };
        for (var i = 0; i < grid.Cells.length; i++) {
          var cell = grid.Cells[i];
          var items = [];
          for (var j = 0; j < cell.Index.length; j++) {
            var index = cell.Index[j];
            var axis = grid.Axes[j];
            var axisItems = this.resolve(axis, index);
            items.push.apply(items, _toConsumableArray(axisItems));
          }
          var measureValue = core.extend({}, cell);
          delete measureValue.Index;
          items.push(measureValue);
          result.cells.push(this.formatItems(items));
        }
        return result;
      }
    }, {
      key: "parseWithoutCells",
      value: function parseWithoutCells(grid) {
        var result = {
          axes: [],
          cells: []
        };
        for (var i = 0; i < grid.Axes.length; ++i) {
          var axis = grid.Axes[i];
          var axisElements = [];
          result.axes.push(axisElements);
          for (var j = 0; j < axis.Tuples.length; ++j) {
            var items = this.resolve(axis, j);
            axisElements.push(this.formatItems(items));
          }
        }
        return result;
      }
    }, {
      key: "resolve",
      value: function resolve(axis, index) {
        var items = [];
        if (axis.Tuples.length === 0) {
          return items;
        }
        var tuples = axis.Tuples[index];
        for (var i = 0; i < tuples.length; ++i) {
          var itemIndex = tuples[i];
          var item = axis.Dimensions[i].ItemList.Items[itemIndex];
          items.push(item);
        }
        return items;
      }
    }, {
      key: "enhance",
      value: function enhance(resultSet) {
        // create dictionary with item lists
        var itemListByName = {};
        for (var i = 0; i < resultSet.ItemLists.length; ++i) {
          var itemList = resultSet.ItemLists[i];
          itemListByName[itemList.Name] = itemList;
        }

        // loop at all dimensions and set link to item list
        for (var h = 0; h < resultSet.Grids.length; ++h) {
          var grid = resultSet.Grids[h];
          for (var j = 0; j < grid.Axes.length; ++j) {
            var axis = grid.Axes[j];
            for (var k = 0; k < axis.Dimensions.length; ++k) {
              var dimension = axis.Dimensions[k];
              dimension.ItemList = itemListByName[dimension.ItemListName];
            }
          }
        }
      }
    }]);
    return ResultSetParser;
  }();
  function parse(resultSet) {
    var parser = new ResultSetParser({
      resultSet: resultSet
    });
    return parser.parse();
  }
  var __exports = {
    __esModule: true
  };
  __exports.ResultSetParser = ResultSetParser;
  __exports.parse = parse;
  return __exports;
});
})();