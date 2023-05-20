/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/SuggestionType"], function (____sina_SuggestionType) {
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
  var SuggestionType = ____sina_SuggestionType["SuggestionType"]; // sinaDefine(['../../core/core'], function (core) {
  var SuggestionTermSplitter = /*#__PURE__*/function () {
    function SuggestionTermSplitter(provider) {
      _classCallCheck(this, SuggestionTermSplitter);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(SuggestionTermSplitter, [{
      key: "split",
      value: function split(term) {
        // split suggestions term into
        // prefix = which is used as search term filter
        // suffix = which is actually used as thes suggestion term
        // split position is last space
        // reason:
        // document contains: "Sally Spring"
        // search input box: sally  s-> suggestion sally spring
        //                   spring s-> suggestion spring sally
        // last suggestion would not happend when just using
        // "spring s " as suggestion term

        // check for last blank
        var splitPos = term.lastIndexOf(" ");
        if (splitPos < 0) {
          return {
            searchTerm: null,
            suggestionTerm: term
          };
        }

        // split search term
        var searchTerm = term.slice(0, splitPos);
        searchTerm = searchTerm.replace(/\s+$/, ""); // right trim
        if (searchTerm.length === 0) {
          return {
            searchTerm: null,
            suggestionTerm: term
          };
        }

        // split suggestion term
        var suggestionTerm = term.slice(splitPos);
        suggestionTerm = suggestionTerm.replace(/^\s+/, ""); // left trim
        if (suggestionTerm.length === 0) {
          return {
            searchTerm: null,
            suggestionTerm: term
          };
        }

        // return result
        return {
          searchTerm: searchTerm,
          suggestionTerm: suggestionTerm
        };
      }
    }, {
      key: "concatenate",
      value: function concatenate(splittedSuggestionTerm, suggestions) {
        // no search term -> nothing to do
        if (!splittedSuggestionTerm.searchTerm) {
          return;
        }

        // split search terms
        var term;
        var searchTerms = [];
        var splittedSuggestionTerms = splittedSuggestionTerm.searchTerm.split(" ");
        for (var k = 0; k < splittedSuggestionTerms.length; k++) {
          term = splittedSuggestionTerms[k];
          term = term.trim();
          searchTerms.push({
            term: term,
            regExp: new RegExp(this.escapeRegExp(term), "i")
          });
        }

        // process all suggestions
        for (var i = 0; i < suggestions.length; ++i) {
          var suggestion = suggestions[i];

          // process only SearchTerm and SearchTermAndDataSource suggestions
          if (suggestion.suggestionType !== SuggestionType.SearchTerm && suggestion.suggestionType !== SuggestionType.SearchTermAndDataSource) {
            continue;
          }

          // identify all search terms not included in suggestion
          var notFoundSearchTerms = [];
          for (var j = 0; j < searchTerms.length; ++j) {
            var searchTerm = searchTerms[j];
            if (!searchTerm.regExp.test(suggestion.filter.searchTerm)) {
              notFoundSearchTerms.push(searchTerm.term);
            }
          }

          // prefix for suggestion = all search terms not included in suggestions
          var prefixBold = [];
          var prefix = notFoundSearchTerms.join(" ");
          for (var l = 0; l < notFoundSearchTerms.length; l++) {
            term = notFoundSearchTerms[l];
            /* eslint no-loop-func:0 */
            prefixBold.push("<b>" + term + "</b>");
          }
          var prefixBoldStr = prefixBold.join(" ");
          suggestion.label = prefixBoldStr + " " + suggestion.label;
          suggestion.filter.searchTerm = suggestion.searchTerm = prefix + " " + suggestion.filter.searchTerm;

          // process children
          this.concatenate(splittedSuggestionTerm, suggestion.childSuggestions);
        }
      }
    }, {
      key: "escapeRegExp",
      value: function escapeRegExp(str) {
        /* eslint no-useless-escape:0 */
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }
    }]);
    return SuggestionTermSplitter;
  }();
  function split(provider, term) {
    var suggestionTermSplitter = new SuggestionTermSplitter(provider);
    return suggestionTermSplitter.split(term);
  }
  function concatenate(provider, splittedTerm, suggestions) {
    var suggestionTermSplitter = new SuggestionTermSplitter(provider);
    return suggestionTermSplitter.concatenate(splittedTerm, suggestions);
  }
  var __exports = {
    __esModule: true
  };
  __exports.split = split;
  __exports.concatenate = concatenate;
  return __exports;
});
})();