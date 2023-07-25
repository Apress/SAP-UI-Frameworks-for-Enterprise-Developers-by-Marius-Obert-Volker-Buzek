/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./ajaxTemplates", "../../core/util", "../abap_odata/UserEventLogger"], function (ajaxTemplates, util, ___abap_odata_UserEventLogger) {
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
  var UserEventType = ___abap_odata_UserEventLogger["UserEventType"];
  var UserEventLogger = /*#__PURE__*/function () {
    function UserEventLogger(provider) {
      _classCallCheck(this, UserEventLogger);
      this.provider = provider;
      this.sina = provider.sina;
      this.eventLoggingActive = false;
      this.clickCounterActive = false;
      this.delayedConsumer = new util.DelayedConsumer({
        timeDelay: 2000,
        consumer: this.processEvents,
        consumerContext: this
      });
    }
    _createClass(UserEventLogger, [{
      key: "delayedInit",
      value: function delayedInit() {
        this.eventLoggingActive = this.provider.supports("SearchInteractionLogging", "SearchInteractionLogging");
        this.clickCounterActive = this.provider.supports("PersonalizedSearch");
      }
    }, {
      key: "logUserEvent",
      value: function logUserEvent(event) {
        event.timeStamp = util.generateTimestamp();

        // regular interaction logging
        if (this.eventLoggingActive && event.type !== UserEventType.ITEM_NAVIGATE) {
          this.delayedConsumer.add(event);
        }

        // special for navigation: additional ina request for incrementing the click counter
        if (this.clickCounterActive && event.type === UserEventType.ITEM_NAVIGATE && event.sourceUrlArray.length !== 0) {
          this.incrementClickCounter(event.sourceUrlArray, event.targetUrl, event.systemAndClient);
        }
      }
    }, {
      key: "processEvents",
      value: function processEvents(events) {
        var request = {
          SearchInteractionLogging: {
            SessionID: this.provider.sessionId,
            EventList: []
          }
        };
        for (var i = 0; i < events.length; ++i) {
          var event = events[i];
          var inaEvent = {
            Type: event.type,
            Timestamp: event.timeStamp,
            ParameterList: []
          };
          for (var name in event) {
            if (name === "type" || name === "timeStamp") {
              continue;
            }
            var value = event[name];
            inaEvent.ParameterList.push({
              Name: name,
              Value: value
            });
          }
          request.SearchInteractionLogging.EventList.push(inaEvent);
        }
        return this.provider.ajaxClient.postJson(this.provider.getResponseUrl, request);
      }
    }, {
      key: "incrementClickCounter",
      value: function incrementClickCounter(sourceUrlArray, targetUrl, systemAndClient) {
        if (!targetUrl) {
          return undefined;
        }
        if (targetUrl.indexOf("#") === -1) {
          return undefined;
        }
        if (!this.provider.supports("PersonalizedSearch", "SetUserStatus")) {
          return undefined;
        }
        var getSemanticObjectType = function getSemanticObjectType(sHash) {
          return sHash.split("-")[0];
        };
        var getIntent = function getIntent(sHash) {
          return sHash.split("-")[1].split("&")[0];
        };
        var getParameterList = function getParameterList(aParameter) {
          var parameterList = aParameter;
          var inaParameterList = [];
          for (var i = 0, len = parameterList.length; i < len; i++) {
            var param = parameterList[i];
            if (param.indexOf("sap-system") !== -1) {
              continue;
            }
            var name = param.split("=")[0];
            var value = param.split("=")[1];
            inaParameterList.push({
              Name: name,
              Value: value
            });
          }
          return inaParameterList;
        };
        var NavigationEventList = ajaxTemplates.incrementClickCounterRequest.SearchConfiguration.ClientEvent.NavigationEventList;

        // source application
        var hashAsArray = sourceUrlArray;
        var semanticObjectType = getSemanticObjectType(hashAsArray[0]);
        NavigationEventList[0].SourceApplication.SemanticObjectType = semanticObjectType;
        var intent = getIntent(hashAsArray[0]);
        NavigationEventList[0].SourceApplication.Intent = intent;
        var sourceParameterList = hashAsArray[1] !== undefined ? getParameterList(hashAsArray[1].split("&")) : [];
        NavigationEventList[0].SourceApplication.ParameterList = sourceParameterList;

        // target application
        hashAsArray = targetUrl.split("?");
        var targetSemanticObjectType = getSemanticObjectType(hashAsArray[0]).split("#")[1];
        NavigationEventList[1].TargetApplication.SemanticObjectType = targetSemanticObjectType;
        var targetIntent = getIntent(hashAsArray[0]);
        NavigationEventList[1].TargetApplication.Intent = targetIntent;
        var targetParameterList = hashAsArray[1] !== undefined ? getParameterList(hashAsArray[1].split("&")) : [];
        NavigationEventList[1].TargetApplication.ParameterList = targetParameterList;
        var oSystemAndClient = {
          System: systemAndClient.systemId,
          Client: systemAndClient.client
        };
        // delete NavigationEventList[1].TargetApplication.System;
        // delete NavigationEventList[1].TargetApplication.Client;
        NavigationEventList[1].TargetApplication = jQuery.extend(NavigationEventList[1].TargetApplication, oSystemAndClient);
        return this.provider.ajaxClient.postJson(this.provider.getResponseUrl, ajaxTemplates.incrementClickCounterRequest);
      }
    }]);
    return UserEventLogger;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.UserEventLogger = UserEventLogger;
  return __exports;
});
})();