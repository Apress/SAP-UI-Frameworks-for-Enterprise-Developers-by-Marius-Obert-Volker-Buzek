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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var CharMapper = /*#__PURE__*/function () {
    /**
     *
     * @param {string[]} charsToReplace - List of characters which will be encoded and decoded.
     * The same list of characters will make sure that the decoded string was mapped to the same
     * characters as the to be encoded string. This is needed for ui components which would interpret
     * encoded # or % characters as part of the url instead of an encoded search term.
     */
    function CharMapper(charsToReplace) {
      _classCallCheck(this, CharMapper);
      this.charsToReplace = charsToReplace;
      if (charsToReplace.length === 0) {
        throw new Error("No characters to replace given");
      }
      if (charsToReplace.length > 10) {
        throw new Error("Max number of chars to replace is 10");
      }
      this.charsToReplaceRegExp = [];
      var _iterator = _createForOfIteratorHelper(charsToReplace),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var charToReplace = _step.value;
          this.charsToReplaceRegExp.push(new RegExp(charToReplace, "g"));
        }
        // private UTF-8 characters:
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.replaceWithChars = ["\uF0000", "\uF0001", "\uF0002", "\uF0003", "\uF0004", "\uF0005", "\uF0006", "\uF0007", "\uF0008", "\uF0009"];
      this.replaceWithCharsRegExp = [];
      var _iterator2 = _createForOfIteratorHelper(this.replaceWithChars),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var replaceWithChar = _step2.value;
          this.replaceWithCharsRegExp.push(new RegExp(replaceWithChar, "g"));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    /**
     * @param {string} str - the string component which shall be scanned for chars to replace
     * @returns {string} - the same string without the replaced chars but with placeholders
     */
    _createClass(CharMapper, [{
      key: "map",
      value: function map(str) {
        for (var index = 0; index < this.charsToReplaceRegExp.length; index++) {
          str = str.replace(this.charsToReplaceRegExp[index], this.replaceWithChars[index]);
        }
        return str;
      }
      /**
       * @param {string} str - the string which contains placeholders
       * @returns {string} - the the same string without placeholders but with the original characters
       */
    }, {
      key: "unmap",
      value: function unmap(str) {
        for (var index = 0; index < this.charsToReplaceRegExp.length; index++) {
          str = str.replace(this.replaceWithCharsRegExp[index], this.charsToReplace[index]);
        }
        return str;
      }
    }]);
    return CharMapper;
  }();
  return CharMapper;
});
})();