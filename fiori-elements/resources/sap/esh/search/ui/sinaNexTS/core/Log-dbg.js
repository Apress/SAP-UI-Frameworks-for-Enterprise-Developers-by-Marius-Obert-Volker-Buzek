/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */

  var Severity;

  /**
   * This is equivalent to:
   * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
   */
  (function (Severity) {
    Severity[Severity["ERROR"] = 1] = "ERROR";
    Severity[Severity["WARN"] = 2] = "WARN";
    Severity[Severity["INFO"] = 3] = "INFO";
    Severity[Severity["DEBUG"] = 4] = "DEBUG";
  })(Severity || (Severity = {}));
  var Log = /*#__PURE__*/function () {
    function Log() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default-log";
      _classCallCheck(this, Log);
      this.name = name;
    }
    _createClass(Log, [{
      key: "debug",
      value: function debug(messageOrError) {
        this.printMessageOrError("DEBUG", messageOrError);
      }
    }, {
      key: "info",
      value: function info(messageOrError) {
        this.printMessageOrError("INFO", messageOrError);
      }
    }, {
      key: "warn",
      value: function warn(messageOrError) {
        this.printMessageOrError("WARN", messageOrError);
      }
    }, {
      key: "error",
      value: function error(messageOrError) {
        this.printMessageOrError("ERROR", messageOrError);
      }
    }, {
      key: "printMessageOrError",
      value: function printMessageOrError(severity, messageOrError) {
        if (messageOrError instanceof Error) {
          if (messageOrError.stack) {
            this.printMessage(severity, messageOrError.stack);
          } else {
            this.printMessage(severity, messageOrError + "");
          }
        } else {
          this.printMessage(severity, messageOrError);
        }
      }
    }, {
      key: "printMessage",
      value: function printMessage(severity, text) {
        var num = Severity[severity];
        var msg = "[" + this.name + "]: " + text;
        if (num <= Log.level) {
          switch (num) {
            case Severity.DEBUG:
              {
                if (typeof Log.persistency.debug === "function") {
                  Log.persistency.debug(msg);
                  return;
                }
              }
              break;
            case Severity.INFO:
              {
                if (typeof Log.persistency.info === "function") {
                  Log.persistency.info(msg);
                  return;
                }
              }
              break;
            case Severity.WARN:
              {
                if (typeof Log.persistency.warn === "function") {
                  Log.persistency.warn(msg);
                  return;
                }
              }
              break;
            case Severity.ERROR:
              {
                if (typeof Log.persistency.error === "function") {
                  Log.persistency.error(msg);
                  return;
                }
              }
          }
          console.log(msg);
        }
      }
    }]);
    return Log;
  }();
  _defineProperty(Log, "level", Severity.ERROR);
  _defineProperty(Log, "persistency", console);
  var __exports = {
    __esModule: true
  };
  __exports.Severity = Severity;
  __exports.Log = Log;
  return __exports;
});
})();