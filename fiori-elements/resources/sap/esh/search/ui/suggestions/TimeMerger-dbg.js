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
  var TimeMerger = /*#__PURE__*/function () {
    function TimeMerger() {
      var promiseList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var timeDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
      _classCallCheck(this, TimeMerger);
      _defineProperty(this, "aborted", false);
      _defineProperty(this, "returned", []);
      this.promiseList = promiseList;
      this.timeDelay = timeDelay;
      this.pending = this.promiseList.length;
      this.counter = ++TimeMerger.counter;
    }
    _createClass(TimeMerger, [{
      key: "abort",
      value: function abort() {
        this.aborted = true;
      }
    }, {
      key: "process",
      value: function process(processorCallback) {
        this.processorCallback = processorCallback;
        this.start();
        return this;
      }
    }, {
      key: "start",
      value: function start() {
        // register done callback for all promises
        for (var i = 0; i < this.promiseList.length; ++i) {
          var promise = this.promiseList[i];
          promise.then(this.assembleDoneCallback(), this.assembleErrorCallback());
        }
        // schedule time delayed merging of promise results
        this.scheduleProcessorNotification();
      }
    }, {
      key: "scheduleProcessorNotification",
      value: function scheduleProcessorNotification() {
        var _this = this;
        if (this.processorNotificationSchedule) {
          window.clearTimeout(this.processorNotificationSchedule);
          this.processorNotificationSchedule = null;
        }
        this.processorNotificationSchedule = window.setTimeout(function () {
          _this.notifyProcessor();
        }, this.timeDelay);
      }
    }, {
      key: "notifyProcessor",
      value: function notifyProcessor() {
        //console.log('--notify');
        // check for abortion
        if (this.aborted) {
          return;
        }
        // notify callback if promises have returned
        if (this.returned.length > 0) {
          this.processorCallback(this.returned);
          this.returned = [];
        }
        // check if we need to schedule a new merge
        if (this.pending > 0) {
          this.scheduleProcessorNotification();
        }
      }
    }, {
      key: "assembleDoneCallback",
      value: function assembleDoneCallback() {
        var _this2 = this;
        return function (result) {
          _this2.pending--;
          _this2.returned.push(result);
          if (_this2.pending === 0) {
            if (_this2.processorNotificationSchedule) {
              window.clearTimeout(_this2.processorNotificationSchedule);
              _this2.processorNotificationSchedule = null;
            }
            _this2.notifyProcessor();
          }
        };
      }
    }, {
      key: "assembleErrorCallback",
      value: function assembleErrorCallback() {
        var _this3 = this;
        return function (error) {
          _this3.pending--;
          _this3.returned.push(error);
          if (_this3.pending === 0) {
            if (_this3.processorNotificationSchedule) {
              window.clearTimeout(_this3.processorNotificationSchedule);
              _this3.processorNotificationSchedule = null;
            }
            _this3.notifyProcessor();
          }
        };
      }
    }]);
    return TimeMerger;
  }();
  _defineProperty(TimeMerger, "counter", 0);
  return TimeMerger;
});
})();