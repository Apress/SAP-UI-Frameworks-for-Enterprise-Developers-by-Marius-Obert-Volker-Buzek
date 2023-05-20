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
  var PerformanceLogger = /*#__PURE__*/function () {
    /**
     * Performance log data
     */

    /**
     * Performance log start date
     */

    function PerformanceLogger() {
      _classCallCheck(this, PerformanceLogger);
      this.performanceLog = [];
      this.performanceLogStartDate = new Date();
    }

    /**
     * Get a unique Id to be used to make 'method name' unique (see enterMethod/leaveMethod)
     * @returns unique ID
     */
    _createClass(PerformanceLogger, [{
      key: "getUniqueId",
      value: function getUniqueId() {
        return new Date().getTime();
      }

      /**
       * start a new step of performance logging
       * @param {*} method name a log step you want to enter
       * @param {*} parameterBag additional properties to log for this step
       */
      // eslint-disable-next-line no-unused-vars
    }, {
      key: "enterMethod",
      value: function enterMethod(method, parameterBag) {
        this.performanceLog.push({
          step: method.name,
          parameterBag: parameterBag,
          startDate: new Date(),
          endDate: null,
          time: null
        });
      }

      /**
       * complete an open step of performance logging
       * @param {*} method name of log step to leave
       */
      // eslint-disable-next-line no-unused-vars
    }, {
      key: "leaveMethod",
      value: function leaveMethod(method) {
        var _iterator = _createForOfIteratorHelper(this.performanceLog),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var logEntry = _step.value;
            if (logEntry.step === method.name) {
              logEntry.endDate = new Date();
              logEntry.time = logEntry.endDate.getTime() - logEntry.startDate.getTime();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      // eslint-disable-next-line no-unused-vars
    }, {
      key: "printLogToBrowserConsole",
      value: function printLogToBrowserConsole() {
        console.table(this.getLogSummary());
      }

      // eslint-disable-next-line no-unused-vars
    }, {
      key: "getLogSummary",
      value: function getLogSummary() {
        var _this = this;
        return this.performanceLog.map(function (logEntry) {
          return {
            step: logEntry.step,
            secFromStart: Math.round((logEntry.startDate.getTime() - _this.performanceLogStartDate.getTime()) / 100) / 10,
            msecTotal: logEntry.time,
            comments: logEntry.parameterBag && logEntry.parameterBag.comments ? logEntry.parameterBag.comments : "-"
          };
        });
      }
    }, {
      key: "clearPerformanceLog",
      value: function clearPerformanceLog() {
        this.performanceLogStartDate = new Date();
        this.performanceLog = [];
      }
    }]);
    return PerformanceLogger;
  }();
  return PerformanceLogger;
});
})();