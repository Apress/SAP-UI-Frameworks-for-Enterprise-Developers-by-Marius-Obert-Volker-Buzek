/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/base/Log", "sap/esh/search/ui/eventlogging/UsageAnalyticsConsumerSina", "sap/esh/search/ui/flp/UsageAnalyticsConsumerFlp", "sap/esh/search/ui/repositoryexplorer/UsageAnalyticsConsumerDwc", "sap/esh/search/ui/SearchHelper", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (Log, UsageAnalyticsConsumerSina, UsageAnalyticsConsumerFlp, UsageAnalyticsConsumerDwc, SearchHelper, UserEventLogger) {
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
  var EventLogger = /*#__PURE__*/function () {
    function EventLogger(properties) {
      _classCallCheck(this, EventLogger);
      this.init();
      var consumer = new UsageAnalyticsConsumerSina();
      consumer.init(properties.sinaNext);
      this.addConsumer(consumer);
      if (typeof properties["usageCollectionService"] !== "undefined") {
        var consumerDac = new UsageAnalyticsConsumerDwc();
        consumerDac.init({
          usageCollectionService: properties["usageCollectionService"]
        });
        this.addConsumer(consumerDac);
      } else {
        var consumerFlp = new UsageAnalyticsConsumerFlp();
        this.addConsumer(consumerFlp);
      }
    }
    _createClass(EventLogger, [{
      key: "init",
      value: function init() {
        this.consumers = [];
      }
    }, {
      key: "addConsumer",
      value: function addConsumer(consumer) {
        this.consumers.push(consumer);
        consumer.eventLogger = UserEventLogger;
      }
    }, {
      key: "logEvent",
      value: function logEvent(event) {
        // ToDo, use type UserEvent for 'event'
        if (!SearchHelper.isLoggingEnabled()) {
          return;
        }
        for (var i = 0; i < this.consumers.length; ++i) {
          var consumer = this.consumers[i];
          try {
            consumer.logEvent(event);
          } catch (err) {
            var log = Log.getLogger("sap.esh.search.ui.eventlogging.EventLogger");
            log.debug(err);
          }
        }
      }
    }]);
    return EventLogger;
  }();
  return EventLogger;
});
})();