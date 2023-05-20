/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SuggestionType"], function (___SuggestionType) {
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
  var SuggestionType = ___SuggestionType["Type"];
  var RecentlyUsedSuggestionProvider = /*#__PURE__*/function () {
    function RecentlyUsedSuggestionProvider(params) {
      _classCallCheck(this, RecentlyUsedSuggestionProvider);
      this.model = params.model;
      this.suggestionHandler = params.suggestionHandler;
    }
    _createClass(RecentlyUsedSuggestionProvider, [{
      key: "abortSuggestions",
      value: function abortSuggestions() {
        return;
      }
    }, {
      key: "getSuggestions",
      value: function getSuggestions() {
        try {
          const _this = this;
          if (_this.model.getSearchBoxTerm().length > 0) {
            return Promise.resolve([]);
          }
          var recentlyUsedSuggestions = JSON.parse(JSON.stringify(_this.model.recentlyUsedStorage.getItems()));

          // limit recent suggestions
          var recentlyUsedSuggestionLimit = _this.suggestionHandler.getSuggestionLimit(SuggestionType.Recent);
          recentlyUsedSuggestions = recentlyUsedSuggestions.slice(0, recentlyUsedSuggestionLimit);
          return Promise.resolve(recentlyUsedSuggestions); // return a copy to not change items in the store
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return RecentlyUsedSuggestionProvider;
  }();
  return RecentlyUsedSuggestionProvider;
});
})();