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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var NlqParser = /*#__PURE__*/function () {
    function NlqParser(provider) {
      _classCallCheck(this, NlqParser);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(NlqParser, [{
      key: "getActiveResult",
      value: function getActiveResult(results) {
        for (var i = 0; i < results.length; ++i) {
          var result = results[i];
          if (result.IsCurrentQuery) {
            return result;
          }
        }
        return null;
      }
    }, {
      key: "parse",
      value: function parse(data) {
        // default result
        var nlqResult = {
          success: false,
          description: ""
        };

        // check input parameters
        if (!data || !data.ResultList || !data.ResultList.NLQQueries || !data.ResultList.NLQQueries.results) {
          return nlqResult;
        }

        // get active result
        var results = data.ResultList.NLQQueries.results;
        var result = this.getActiveResult(results);
        if (!result) {
          return nlqResult;
        }

        // set return parameters
        nlqResult.success = true;
        nlqResult.description = result.Description;
        return nlqResult;
      }
    }]);
    return NlqParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.NlqParser = NlqParser;
  return __exports;
});
})();