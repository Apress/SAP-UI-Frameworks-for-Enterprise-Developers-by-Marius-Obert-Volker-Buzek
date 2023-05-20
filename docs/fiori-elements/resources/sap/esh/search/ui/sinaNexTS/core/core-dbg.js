/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
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
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */

  // =========================================================================
  // create object with prototype
  // =========================================================================
  function object(prototype) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    var TmpFunction = function TmpFunction() {};
    TmpFunction.prototype = prototype;
    return new TmpFunction();
  }

  // =========================================================================
  // extend object
  // =========================================================================
  function extend(o1, o2) {
    for (var key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

  // =========================================================================
  // first character to upper
  // =========================================================================
  function firstCharToUpper(text, removeUnderscore) {
    if (removeUnderscore) {
      if (text[0] === "_") {
        text = text.slice(1);
      }
    }
    return text[0].toUpperCase() + text.slice(1);
  }

  // =========================================================================
  // is list
  // =========================================================================
  function isList(obj) {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      return true;
    }
    return false;
  }

  // =========================================================================
  // is object (array!=object)
  // =========================================================================
  function isObject(obj) {
    if (isList(obj)) {
      return false;
    }
    return _typeof(obj) === "object";
  }

  // =========================================================================
  // is empty object
  // =========================================================================
  function isEmptyObject(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return JSON.stringify(obj) === JSON.stringify({});
  }

  // =========================================================================
  // is function
  // =========================================================================
  function isFunction(obj) {
    return typeof obj === "function";
  }

  // =========================================================================
  // is string
  // =========================================================================
  function isString(obj) {
    return typeof obj === "string";
  }

  // =========================================================================
  // is simple (= string, number  but not list, object, function)
  // =========================================================================
  function isSimple(obj) {
    return _typeof(obj) !== "object" && typeof obj !== "function";
  }

  // =========================================================================
  // Promise
  // =========================================================================
  // module.Promise = Promise;

  // =========================================================================
  // helper: generate constructor function
  // =========================================================================
  // var generateConstructorFunction = function () {
  //     var cf = (function () {
  //         return function () {
  //             if (arguments[0] === '_suppress_init_') {
  //                 return;
  //             }
  //             this._genericInit.apply(this, arguments);
  //         };
  //     })();
  //     return cf;
  // };

  // =========================================================================
  // helper: generate getter
  // =========================================================================
  // var generateGetter = function (prototype, propertyName) {
  //     var methodName = 'get' + firstCharToUpper(propertyName, true);
  //     if (prototype[methodName]) {
  //         return;
  //     }
  //     prototype[methodName] = function (value) {
  //         return this[propertyName];
  //     };
  // };

  // =========================================================================
  // helper: generate setter
  // =========================================================================
  // var generateSetter = function (prototype, propertyName) {
  //     var methodName = 'set' + firstCharToUpper(propertyName, true);
  //     if (prototype[methodName]) {
  //         return;
  //     }
  //     prototype[methodName] = function (value) {
  //         this[propertyName] = value;
  //     };
  // };

  // =========================================================================
  // helper: define setter/getter according to metadata
  // =========================================================================
  // var generatePrototypeMethods = function (prototype) {

  //     if (!prototype.hasOwnProperty('_meta')) {
  //         return;
  //     }
  //     var properties = prototype._meta.properties;
  //     if (!properties) {
  //         return;
  //     }

  //     for (var property in properties) {
  //         var propertyMetadata = properties[property];
  //         if (propertyMetadata.getter) {
  //             generateGetter(prototype, property);
  //         }
  //         if (propertyMetadata.setter) {
  //             generateSetter(prototype, property);
  //         }
  //     }
  // };

  // =========================================================================
  // helper: define class
  // =========================================================================
  // var defineClassInternal = function (parentClass, prototype) {

  //     var Cls = generateConstructorFunction();
  //     if (!parentClass) {
  //         parentClass = BaseClass;
  //     }
  //     Cls.prototype = extend(new parentClass('_suppress_init_'), prototype); // eslint-disable-line new-cap
  //     Cls.superPrototype = parentClass.prototype;

  //     Cls.prototype.constructor = Cls;
  //     generatePrototypeMethods(Cls.prototype);
  //     Cls.derive = function (derivedPrototype) {
  //         return defineClassInternal(Cls, derivedPrototype);
  //     };
  //     return Cls;
  // };

  // =========================================================================
  // create class
  // =========================================================================
  // export function defineClass(prototype) {
  //     return defineClassInternal(null, prototype);
  // };

  // =========================================================================
  // generic equals
  // =========================================================================
  function equals(o1, o2, ordered) {
    if (isList(o1)) {
      return _equalsList(o1, o2, ordered);
    }
    if (isObject(o1)) {
      return _equalsObject(o1, o2, ordered);
    }
    return o1 === o2;
  }
  function _equalsList(l1, l2, ordered) {
    if (ordered === undefined) {
      ordered = true;
    }
    if (l1.length !== l2.length) {
      return false;
    }
    if (ordered) {
      // 1) consider order
      for (var i = 0; i < l1.length; ++i) {
        if (!equals(l1[i], l2[i], ordered)) {
          return false;
        }
      }
      return true;
    }
    // 2) do not consider order
    var matched = {};
    for (var j = 0; j < l1.length; ++j) {
      var element1 = l1[j];
      var match = false;
      for (var k = 0; k < l2.length; ++k) {
        var element2 = l2[k];
        if (matched[k]) {
          continue;
        }
        if (equals(element1, element2, ordered)) {
          match = true;
          matched[k] = true;
          break;
        }
      }
      if (!match) {
        return false;
      }
    }
    return true;
  }
  function _equalsObject(o1, o2, ordered) {
    if (o1.equals) {
      return o1.equals(o2);
    }
    if (!isObject(o2)) {
      return false;
    }
    for (var property in o1) {
      var propertyValue1 = o1[property];
      var propertyValue2 = o2[property];
      if (!equals(propertyValue1, propertyValue2, ordered)) {
        return false;
      }
    }
    return true;
  }

  // =========================================================================
  // generic clone
  // =========================================================================
  function clone(obj) {
    if (isList(obj)) {
      return _cloneList(obj);
    }
    if (isObject(obj)) {
      return _cloneObject(obj);
    }
    return obj;
  }
  function _cloneList(list) {
    var cloned = [];
    for (var i = 0; i < list.length; ++i) {
      var element = list[i];
      cloned.push(clone(element));
    }
    return cloned;
  }
  function _cloneObject(obj) {
    if (obj.clone) {
      return obj.clone();
    }
    var cloned = {};
    for (var property in obj) {
      var value = obj[property];
      cloned[property] = clone(value);
    }
    return cloned;
  }

  // =========================================================================
  // generate id
  // =========================================================================
  // =========================================================================
  // executeSequentialAsync
  // =========================================================================
  const executeSequentialAsync = _async(function (tasks, caller) {
    if (!tasks) {
      return Promise.resolve(); // eslint-disable-line new-cap
    }

    var execute = function execute(index) {
      if (index >= tasks.length) {
        return undefined;
      }
      var task = tasks[index];
      return Promise.resolve().then(function () {
        if (caller) {
          return caller(task);
        }
        return task();
      }).then(function () {
        return execute(index + 1);
      });
    };
    return execute(0);
  }); // =========================================================================
  // access deep property in object
  // =========================================================================
  var maxId = 0;
  function generateId() {
    return "#" + ++maxId;
  }

  // =========================================================================
  // generate guid
  // =========================================================================
  function generateGuid() {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == "x" ? r : r & 0x3 | 0x8;
      return v.toString(16).toUpperCase();
    });
  }
  function getProperty(obj, path) {
    var result = obj;
    var _iterator = _createForOfIteratorHelper(path),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var pathPart = _step.value;
        result = result[pathPart];
        if (typeof result === "undefined") {
          return undefined;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return result;
  }
  var __exports = {
    __esModule: true
  };
  __exports.object = object;
  __exports.extend = extend;
  __exports.firstCharToUpper = firstCharToUpper;
  __exports.isList = isList;
  __exports.isObject = isObject;
  __exports.isEmptyObject = isEmptyObject;
  __exports.isFunction = isFunction;
  __exports.isString = isString;
  __exports.isSimple = isSimple;
  __exports.equals = equals;
  __exports._equalsList = _equalsList;
  __exports._equalsObject = _equalsObject;
  __exports.clone = clone;
  __exports._cloneList = _cloneList;
  __exports._cloneObject = _cloneObject;
  __exports.generateId = generateId;
  __exports.generateGuid = generateGuid;
  __exports.executeSequentialAsync = executeSequentialAsync;
  __exports.getProperty = getProperty;
  return __exports;
});
})();