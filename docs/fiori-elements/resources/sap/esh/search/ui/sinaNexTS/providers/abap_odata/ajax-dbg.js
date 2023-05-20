/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/ajax", "./ajaxTemplates"], function (____core_ajax, ___ajaxTemplates) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var Client = ____core_ajax["Client"];
  var isSearchRequest = ___ajaxTemplates["isSearchRequest"];
  var isNlqSearchRequest = ___ajaxTemplates["isNlqSearchRequest"];
  var isChartRequest = ___ajaxTemplates["isChartRequest"];
  var isValueHelperRequest = ___ajaxTemplates["isValueHelperRequest"];
  var isSuggestionRequest = ___ajaxTemplates["isSuggestionRequest"];
  var isObjectSuggestionRequest = ___ajaxTemplates["isObjectSuggestionRequest"];
  var isNavigationEvent = ___ajaxTemplates["isNavigationEvent"];
  var _removeActAsQueryPart = function _removeActAsQueryPart(node) {
    if (node.SubFilters !== undefined) {
      // not a leaf
      delete node.ActAsQueryPart;
      for (var i = 0; i < node.SubFilters.length; i++) {
        this._removeActAsQueryPart(node.SubFilters[i]);
      }
    }
  };
  function createAjaxClient(properties) {
    var defaults = {
      csrf: true,
      requestNormalization: function requestNormalization(payload) {
        if (payload === null) {
          return "";
        }
        if (isNavigationEvent(payload)) {
          return {
            NotToRecord: true
          };
        }
        if (isSearchRequest(payload) || isNlqSearchRequest(payload) || isChartRequest(payload) || isValueHelperRequest(payload) || isSuggestionRequest(payload) || isObjectSuggestionRequest(payload)) {
          delete payload.d.QueryOptions.ClientSessionID;
          delete payload.d.QueryOptions.ClientCallTimestamp;
          delete payload.d.QueryOptions.ClientServiceName;
          delete payload.d.QueryOptions.ClientLastExecutionID;

          // insert "ExcludedDataSources" in payload
          // properties' ordering is important in stringified payload
          // "ExcludedDataSources" should follow "DataSources"
          // find "DataSources":[...], and insert "ExcludedDataSources" after
          var payloadString = JSON.stringify(payload); // object -> string
          // eslint-disable-next-line quotes
          var headString = '"DataSources":[';
          // eslint-disable-next-line quotes
          var endString = "]";
          var headIndex = payloadString.indexOf(headString);
          var endIndex = headIndex + payloadString.substring(headIndex).indexOf(endString) + endString.length;
          // eslint-disable-next-line quotes
          var insertedString = ',"ExcludedDataSources":[]';
          payloadString = [payloadString.slice(0, endIndex), insertedString, payloadString.slice(endIndex)].join("");
          payload = JSON.parse(payloadString); // string -> object
          if (payload.d.Filter && (isSearchRequest(payload) || isNlqSearchRequest(payload) || isChartRequest(payload) || isValueHelperRequest(payload) || isSuggestionRequest(payload) || isObjectSuggestionRequest(payload))) {
            _removeActAsQueryPart(payload.d.Filter);
          }
        }
        return payload;
      }
      //csrfByPassCache: true
    };

    properties = Object.assign({}, defaults, properties);
    var client = new Client(properties);
    return client;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createAjaxClient = createAjaxClient;
  return __exports;
});
})();