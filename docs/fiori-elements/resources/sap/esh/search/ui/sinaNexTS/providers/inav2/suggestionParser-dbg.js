/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/SuggestionCalculationMode", "./pivotTableParser"], function (____sina_SuggestionCalculationMode, pivotTableParser) {
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
  var SuggestionCalculationMode = ____sina_SuggestionCalculationMode["SuggestionCalculationMode"];
  var SuggestionParser = /*#__PURE__*/function () {
    function SuggestionParser(provider) {
      _classCallCheck(this, SuggestionParser);
      this.provider = provider;
      this.sina = provider.sina;
    }
    _createClass(SuggestionParser, [{
      key: "parseSuggestions",
      value: function parseSuggestions(query, data) {
        data = pivotTableParser.parse(data);
        var suggestions = [];
        var suggestion;
        var parentSuggestion;
        for (var i = 0; i < data.cells.length; i++) {
          suggestion = null;
          var cell = data.cells[i];
          if (cell.$$Attribute$$ !== "$$AllAttributes$$") {
            continue;
          }
          switch (cell.$$Term$$.Scope) {
            case "SearchHistory":
              if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                suggestion = this.parseSearchTermSuggestion(query, cell);
              }
              break;
            case "ObjectData":
              if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                suggestion = this.parseSearchTermSuggestion(query, cell);
                parentSuggestion = suggestion;
              } else {
                suggestion = this.parseSearchTermAndDataSourceSuggestion(query, cell);
                if (suggestion && suggestion.filter.dataSource !== parentSuggestion.filter.dataSource) {
                  parentSuggestion.childSuggestions.push(suggestion);
                }
                suggestion = null;
              }
              break;
            case "DataSources":
              if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                suggestion = this.parseDataSourceSuggestion(query, cell);
              }
              break;
          }
          if (suggestion) {
            suggestions.push(suggestion);
          }
        }
        return suggestions;
      }
    }, {
      key: "parseDataSourceSuggestion",
      value: function parseDataSourceSuggestion(query, cell) {
        var dataSource = this.sina.getDataSource(cell.$$Term$$.Value);
        if (!dataSource) {
          return null;
        }
        var filter = query.filter.clone();
        filter.setDataSource(dataSource);
        return this.sina._createDataSourceSuggestion({
          calculationMode: SuggestionCalculationMode.Data,
          dataSource: dataSource,
          label: cell.$$Term$$.ValueFormatted
        });
      }
    }, {
      key: "parseSearchTermSuggestion",
      value: function parseSearchTermSuggestion(query, cell) {
        var calculationMode = this.parseCalculationMode(cell.$$Term$$.Scope);
        var filter = query.filter.clone();
        filter.setSearchTerm(cell.$$Term$$.Value);
        return this.sina._createSearchTermSuggestion({
          searchTerm: cell.$$Term$$.Value,
          calculationMode: calculationMode,
          filter: filter,
          label: cell.$$Term$$.ValueFormatted
        });
      }
    }, {
      key: "parseSearchTermAndDataSourceSuggestion",
      value: function parseSearchTermAndDataSourceSuggestion(query, cell) {
        var calculationMode = this.parseCalculationMode(cell.$$Term$$.Scope);
        var filter = query.filter.clone();
        filter.setSearchTerm(cell.$$Term$$.Value);
        var dataSource = this.sina.getDataSource(cell.$$DataSource$$);
        if (!dataSource) {
          return null;
        }
        filter.setDataSource(dataSource);
        return this.sina._createSearchTermAndDataSourceSuggestion({
          searchTerm: cell.$$Term$$.Value,
          dataSource: dataSource,
          calculationMode: calculationMode,
          filter: filter,
          label: cell.$$Term$$.ValueFormatted
        });
      }
    }, {
      key: "parseCalculationMode",
      value: function parseCalculationMode(scope) {
        switch (scope) {
          case "SearchHistory":
            return SuggestionCalculationMode.History;
          case "ObjectData":
            return SuggestionCalculationMode.Data;
        }
      }
    }]);
    return SuggestionParser;
  }();
  function parse(provider, suggestionQuery, data) {
    var suggestionParser = new SuggestionParser(provider);
    return suggestionParser.parseSuggestions(suggestionQuery, data);
  }
  var __exports = {
    __esModule: true
  };
  __exports.parse = parse;
  return __exports;
});
})();