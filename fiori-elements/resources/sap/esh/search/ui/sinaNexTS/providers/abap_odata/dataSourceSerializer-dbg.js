/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */

  function serialize(dataSource) {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
      return [{
        Id: "<All>",
        Type: "Category"
      }];
    }

    // convert sina type to abap_odata type
    var type;
    var aReturnValue = [];
    var userCategoryDataSource;
    switch (dataSource.type) {
      case dataSource.sina.DataSourceType.Category:
        type = "Category";
        aReturnValue.push({
          Id: dataSource.id,
          Type: type
        });
        break;
      case dataSource.sina.DataSourceType.BusinessObject:
        type = "View";
        aReturnValue.push({
          Id: dataSource.id,
          Type: type
        });
        break;
      case dataSource.sina.DataSourceType.UserCategory:
        userCategoryDataSource = dataSource;
        if (!userCategoryDataSource.subDataSources || Array.isArray(userCategoryDataSource.subDataSources) === false) {
          break;
        }
        var _iterator = _createForOfIteratorHelper(userCategoryDataSource.subDataSources),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var subDataSource = _step.value;
            switch (subDataSource.type) {
              case subDataSource.sina.DataSourceType.Category:
                type = "Category";
                aReturnValue.push({
                  Id: subDataSource.id,
                  Type: type
                });
                break;
              case subDataSource.sina.DataSourceType.BusinessObject:
                type = "View";
                aReturnValue.push({
                  Id: subDataSource.id,
                  Type: type
                });
                break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
    }
    return aReturnValue;
  }
  var __exports = {
    __esModule: true
  };
  __exports.serialize = serialize;
  return __exports;
});
})();