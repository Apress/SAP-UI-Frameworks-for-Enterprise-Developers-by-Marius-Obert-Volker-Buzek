/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/SuggestionCalculationMode"], function (____sina_SuggestionCalculationMode) {
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
    function SuggestionParser(provider, itemParser) {
      _classCallCheck(this, SuggestionParser);
      this.provider = provider;
      this.sina = provider.sina;
      this.itemParser = itemParser;
    }
    _createClass(SuggestionParser, [{
      key: "parseObjectSuggestions",
      value: function parseObjectSuggestions(query, data) {
        if (!data.d.ObjectSuggestions || !data.d.ObjectSuggestions.SearchResults || !data.d.ObjectSuggestions.SearchResults.results) {
          return [];
        }
        var suggestionPromises = [];
        var objectSuggestions = data.d.ObjectSuggestions.SearchResults.results;
        for (var i = 0; i < objectSuggestions.length; ++i) {
          var objectSuggestion = objectSuggestions[i];
          suggestionPromises.push(this.parseObjectSuggestion(objectSuggestion));
        }
        return Promise.all(suggestionPromises);
      }
    }, {
      key: "parseObjectSuggestion",
      value: function parseObjectSuggestion(objectSuggestion) {
        return this.itemParser.parseItem(objectSuggestion).then(function (object) {
          // fill highlighted value: actually it would be better to call
          // the search result set formatter like for a regular result
          // set
          this.fillValueHighlighted(object);
          var title = object.titleAttributes.map(function (attribute) {
            return attribute.valueFormatted;
          }).join(" ");
          return this.sina._createObjectSuggestion({
            calculationMode: SuggestionCalculationMode.Data,
            label: title,
            object: object
          });
        }.bind(this));
      }
    }, {
      key: "fillValueHighlighted",
      value: function fillValueHighlighted(object) {
        var doFillValueHighlighted = function doFillValueHighlighted(attributes) {
          if (!attributes) {
            return;
          }
          for (var i = 0; i < attributes.length; ++i) {
            var attribute = attributes[i];
            if (!attribute.valueHighlighted) {
              attribute.valueHighlighted = attribute.valueFormatted;
            }
          }
        };
        doFillValueHighlighted(object.detailAttributes);
        doFillValueHighlighted(object.titleAttributes);
      }
    }, {
      key: "parseRegularSuggestions",
      value: function parseRegularSuggestions(query, data) {
        var suggestions = [];
        var suggestion;
        var parentSuggestion;
        var parentSuggestions = [];
        var cell;
        var parentCell;
        if (!data.d.Suggestions || !data.d.Suggestions.results) {
          return [];
        }
        var results = data.d.Suggestions.results;
        for (var i = 0; i < results.length; i++) {
          suggestion = null;
          cell = results[i];
          switch (cell.Type) {
            case "H":
              suggestion = this.parseSearchTermSuggestion(query, cell);
              break;
            case "A":
              suggestion = this.parseSearchTermAndDataSourceSuggestion(query, cell);
              // attach type and cell information
              // suggestion.type = "A";
              suggestion.cell = cell;
              break;
            case "M":
              suggestion = this.parseDataSourceSuggestion(query, cell);
              break;
          }
          if (suggestion) {
            if (suggestion.type === this.sina.SuggestionType.SearchTermAndDataSource) {
              // set parent sugestion
              if (parentSuggestions[suggestion.searchTerm] === undefined) {
                parentCell = this._getParentCell(suggestion.cell);
                parentSuggestion = this.parseSearchTermSuggestion(query, parentCell);
                parentSuggestions[suggestion.searchTerm] = parentSuggestion;
              }
              // remove type and cell information
              delete suggestion.cell;
              // attach children
              parentSuggestions[suggestion.searchTerm].childSuggestions.push(suggestion);
            } else {
              // push non-attribute suggestion
              suggestions.push(suggestion);
            }
          }
        }

        // push attribute suggestion
        Object.keys(parentSuggestions).forEach(function (key) {
          suggestions.push(parentSuggestions[key]);
        });
        return suggestions;
      }
    }, {
      key: "parseDataSourceSuggestion",
      value: function parseDataSourceSuggestion(query, cell) {
        var calculationMode = SuggestionCalculationMode.Data; // always data suggestion
        var dataSource = this.sina.getDataSource(cell.FromDataSource);
        if (!dataSource) {
          return null;
        }
        var filter = query.filter.clone();
        filter.setDataSource(dataSource);
        return this.sina._createDataSourceSuggestion({
          calculationMode: calculationMode,
          dataSource: dataSource,
          label: cell.SearchTermsHighlighted
        });
      }
    }, {
      key: "parseSearchTermSuggestion",
      value: function parseSearchTermSuggestion(query, cell) {
        var calculationMode = this.parseCalculationMode(cell.Type);
        var filter = query.filter.clone();
        filter.setSearchTerm(cell.SearchTerms);
        return this.sina._createSearchTermSuggestion({
          searchTerm: cell.SearchTerms,
          calculationMode: calculationMode,
          filter: filter,
          label: cell.SearchTermsHighlighted
        });
      }
    }, {
      key: "parseSearchTermAndDataSourceSuggestion",
      value: function parseSearchTermAndDataSourceSuggestion(query, cell) {
        var calculationMode = this.parseCalculationMode(cell.Type);
        var filter = query.filter.clone();
        filter.setSearchTerm(cell.SearchTerms);
        var dataSource = this.sina.getDataSource(cell.FromDataSource);
        if (!dataSource) {
          return null;
        }
        filter.setDataSource(dataSource);
        return this.sina._createSearchTermAndDataSourceSuggestion({
          searchTerm: cell.SearchTerms,
          dataSource: dataSource,
          calculationMode: calculationMode,
          // ToDo
          filter: filter,
          label: cell.SearchTermsHighlighted
        });
      }
    }, {
      key: "parseCalculationMode",
      value: function parseCalculationMode(scope) {
        switch (scope) {
          case "H":
            return SuggestionCalculationMode.History;
          case "A":
          case "M":
            return SuggestionCalculationMode.Data;
        }
      }
    }, {
      key: "_getParentCell",
      value: function _getParentCell(cell) {
        var parentCell = cell;
        parentCell.FromDataSource = "<All>";
        parentCell.FromDataSourceAttribute = "";
        parentCell.Type = "A";
        return parentCell;
      }
    }]);
    return SuggestionParser;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.SuggestionParser = SuggestionParser;
  return __exports;
});
})();