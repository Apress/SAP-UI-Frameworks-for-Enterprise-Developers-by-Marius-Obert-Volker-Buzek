/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
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
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null) it["return"]();
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
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
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
window.onload = function () {
  sap.ui.loader.config({
    baseUrl: "../../../../../../resources/",
    paths: {
      "sap/esh/search/ui": "/resources/sap/esh/search/ui"
    }
  });
  sap.ui.getCore().attachInit(function () {
    sap.ui.require(["sap/esh/search/ui/SearchCompositeControl", "sap/m/Button", "sap/m/library", "sap/m/OverflowToolbarButton", "sap/m/ToolbarSeparator", "sap/m/MessageBox"], function (SearchCompositeControl, Button, sapmlibrary, OverflowToolbarButton, ToolbarSeparator, MessageBox) {
      var SearchResultSetFormatter /* extends Formatter.Formatter */ = /*#__PURE__*/function () {
        function SearchResultSetFormatter() {
          _classCallCheck(this, SearchResultSetFormatter);
        }
        _createClass(SearchResultSetFormatter, [{
          key: "formatAsync",
          value: function formatAsync(resultSet) {
            var _iterator = _createForOfIteratorHelper(resultSet.items),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var item = _step.value;
                var salary = item.detailAttributes.filter(function (attr) {
                  return attr.id === "SALARY";
                });
                if (salary.length > 0) {
                  var salaryAttr = salary[0];
                  if (salaryAttr.value > 2900) {
                    salaryAttr["infoIconUrl"] = "sap-icon://loan";
                    item.titleAttributes.push(salaryAttr);
                  }
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          }
        }]);
        return SearchResultSetFormatter;
      }();
      var options = {
        // see SearchCompositeControl.ts and SearchConfigurationSettings.ts for available options
        sinaConfiguration: {
          provider: "sample",
          searchResultSetFormatters: [new SearchResultSetFormatter()]
        },
        getCustomToolbar: function getCustomToolbar() {
          return [new OverflowToolbarButton({
            text: "Search Dev. Guide",
            tooltip: "SAP HANA Search Developer Guide",
            type: sapmlibrary.ButtonType.Transparent,
            press: function press() {
              return window.open("https://help.sap.com/viewer/691cb949c1034198800afde3e5be6570/2.0.05/en-US/ce86ef2fd97610149eaaaa0244ca4d36.html");
            }
          }), new Button({
            text: "Search (help.sap)",
            tooltip: "Search and Operational Analytics",
            press: function press() {
              return window.open("https://help.sap.com/viewer/6522d0462aeb4909a79c3462b090ec51/1709%20002/en-US");
            }
          }), new ToolbarSeparator(), new OverflowToolbarButton({
            icon: "sap-icon://hint",
            text: "About",
            tooltip: "About this Sample UI",
            type: sapmlibrary.ButtonType.Transparent,
            press: function press() {
              return MessageBox.information("This is SAP Search UI, based on UI5 control 'sap.esh.search.ui.SearchCompositeControl' and 'Sample Data Provider'.");
            }
          })];
        }
        /* extendTableColumn: {    // extending columns does not work, needs refactoring
        column: {
            name: "ExtendTableCol",
            attributeId: "EXTEND_TABLE_COL",
            width: "500px",
        },
        // eslint-disable-next-line no-unused-vars
        assembleCell: (data) => {
            const itemId = "EXTEND_TABLE_COL";
            const cell = {
                isExtendTableColumnCell: true,
                itemId: itemId,
            };
            return cell;
        },
        // eslint-disable-next-line no-unused-vars
        bindingFunction: (bindingObject) => {
            new sap.m.Text({ text: "This is cell content of custom column" });
        },
        }, */
      };

      var control = new SearchCompositeControl(options);
      window.addEventListener("hashchange", function () {
        control.getModel().parseURL();
      }, false);
      control.placeAt("content");
    });
    jQuery("html").css("overflow-y", "auto");
    jQuery("html").css("height", "100%");
  });
};
})();