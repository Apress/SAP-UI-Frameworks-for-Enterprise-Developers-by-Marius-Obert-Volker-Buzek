/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./definitions"], function (___definitions) {
  /** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */
  var Term = ___definitions["Term"];
  var Phrase = ___definitions["Phrase"];
  var Expression = ___definitions["Expression"];
  var SearchQueryLogicalOperator = ___definitions["SearchQueryLogicalOperator"];
  var CustomFunction = ___definitions["CustomFunction"];
  var FilterFunction = ___definitions["FilterFunction"];
  var LogicalOperator = ___definitions["LogicalOperator"];
  var SEARCH_DEFAULTS = ___definitions["SEARCH_DEFAULTS"];
  var escapeQuery = ___definitions["escapeQuery"];
  var States;
  (function (States) {
    States[States["Term"] = 0] = "Term";
    States[States["Phrase"] = 1] = "Phrase";
  })(States || (States = {}));
  var createEshSearchQuery = function createEshSearchQuery() {
    var _options;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (options.metadataCall) {
      var path = options.resourcePath ? options.resourcePath : "/$metadata";
      if (options.metadataObjects) {
        if (options.metadataObjects.entitySets) {
          path += "/EntitySets(" + options.metadataObjects.entitySets + ")";
        } else {
          if (options.metadataObjects.format) {
            path += "?$format=" + options.metadataObjects.format;
          }
          if (options.metadataObjects.collectionReference) {
            path += "#" + options.metadataObjects.collectionReference;
          }
          if (options.metadataObjects.contextEntitySet && options.metadataObjects.primitiveTyp) {
            path += "#" + options.metadataObjects.contextEntitySet + "(" + options.metadataObjects.primitiveTyp + ")";
          } else if (options.metadataObjects.contextEntitySet) {
            path += "#" + options.metadataObjects.contextEntitySet;
          } else if (options.metadataObjects.primitiveTyp) {
            path += "#" + options.metadataObjects.primitiveTyp;
          }
        }
      }
      return {
        path: path,
        parameters: {}
      };
    }
    /*
    let searchPath1 = "";
    if (options?.resourcePath) {
      searchPath1 = options?.resourcePath
    } else {
      searchPath1 = (options && options.suggestTerm) ? `/$all/${encodeURIComponent("GetSuggestion(term='" + options.suggestTerm.replace("'", "''").replace("\\?", "?") + "')")}` : "/$all";
    }*/

    var searchPath = "/$all";
    if (options.resourcePath) {
      searchPath = options.resourcePath;
    }
    if ((_options = options) !== null && _options !== void 0 && _options.suggestTerm) {
      searchPath += "/".concat(encodeURIComponent("GetSuggestion(term='" + options.suggestTerm.replace(/'/g, "''") + "')"));
    }
    if (options.eshParameters) {
      var customParameters = [];
      for (var _i = 0, _Object$keys = Object.keys(options.eshParameters); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        customParameters.push(key + "='" + encodeURIComponent(options.eshParameters[key]) + "'");
      }
      if (customParameters.length > 0) {
        searchPath += "(" + customParameters.join(",") + ")";
      }
    }
    var newODataFilter = new Expression({
      operator: LogicalOperator.and,
      items: []
    });
    if (!options) {
      options = {
        query: SEARCH_DEFAULTS.query,
        scope: SEARCH_DEFAULTS.scope,
        $select: [],
        facets: []
      };
    } else {
      if (!options.query) {
        options.query = SEARCH_DEFAULTS.query;
      }
      /*
      if (!options.scope) {
        options.scope = SEARCH_DEFAULTS.scope;
      }*/
      if (!options.$select) {
        options.$select = [];
      }
      if (!options.facets) {
        options.facets = [];
      }
    }
    if (options.oDataFilter) {
      newODataFilter.items.push(options.oDataFilter);
    }
    if (newODataFilter.items.length > 0) {
      options.oDataFilter = newODataFilter;
    }
    var urlSearchPath = searchPath;
    var query = options.scope ? "SCOPE:" + options.scope : "";
    if (options.searchQueryFilter) {
      var searchQueryFilterStatement = options.searchQueryFilter.toStatement().trim();
      if (searchQueryFilterStatement.length > 0) {
        if (query !== "") {
          query += " ";
        }
        query += searchQueryFilterStatement;
      }
    }
    if (options.freeStyleText) {
      if (query !== "") {
        query += " ";
      }
      var freeStyleTextExpression = parseFreeStyleText(options.freeStyleText);
      query += freeStyleTextExpression.toStatement();
    }
    if (options.query && options.query !== "") {
      if (query !== "") {
        query += " ";
      }
      query += escapeQuery(options.query);
    }
    var parameters = {};
    for (var _i2 = 0, _Object$keys2 = Object.keys(options); _i2 < _Object$keys2.length; _i2++) {
      var optionKey = _Object$keys2[_i2];
      switch (optionKey) {
        case "query":
          if (options.$apply) {
            // it is not allowed to use query and $apply together
            break;
          }
          var filter = query === "" ? "" : "filter(Search.search(query='" + query + "')";
          if (options.oDataFilter && options.oDataFilter.items.length > 0) {
            filter += " and " + options.oDataFilter.toStatement();
          }
          if (query !== "") {
            filter += ")";
          }
          if (options.groupby && options.groupby.properties && options.groupby.properties.length > 0) {
            filter += "/groupby((".concat(options.groupby.properties.join(","), ")");
            if (options.groupby.aggregateCountAlias && options.groupby.aggregateCountAlias !== "") {
              filter += ",aggregate($count as ".concat(options.groupby.aggregateCountAlias, ")");
            }
            filter += ")";
          }
          if (filter !== "") {
            parameters.$apply = filter;
          }
          break;
        case "$orderby":
          if (options.$orderby && options.$orderby.length > 0) {
            parameters.$orderby = options.$orderby.map(function (i) {
              return i.order ? "".concat(i.key, " ").concat(i.order) : i.key;
            }).join(",");
          }
          break;
        case "facets":
          if (options.facets && options.facets.length > 0) {
            parameters[optionKey] = options.facets.join(",");
          }
          break;
        case "$select":
          if (options.$select && options.$select.length > 0) {
            parameters[optionKey] = options.$select.join(",");
          }
          break;
        case "facetroot":
          if (options.facetroot && options.facetroot.length > 0) {
            parameters.facetroot = options.facetroot.map(function (i) {
              return i.toStatement();
            }).join(",");
          }
          break;
        case "$top":
        case "$skip":
        case "$count":
        case "whyfound":
        case "estimate":
        case "wherefound":
        case "facetlimit":
        case "valuehierarchy":
        case "filteredgroupby":
          parameters[optionKey] = options[optionKey];
          break;
        case "dynamicview":
          if (options.dynamicview) {
            parameters[optionKey] = options.dynamicview.map(function (dynamicView) {
              return dynamicView.toStatement();
            }).join(" ");
          }
          break;
        case "$apply":
          if (options[optionKey] instanceof CustomFunction || options[optionKey] instanceof FilterFunction) {
            var apply = options[optionKey].toStatement();
            if (options.groupby && options.groupby.properties && options.groupby.properties.length > 0) {
              apply += "/groupby((".concat(options.groupby.properties.join(","), ")");
              if (options.groupby.aggregateCountAlias && options.groupby.aggregateCountAlias !== "") {
                apply += ",aggregate($count as ".concat(options.groupby.aggregateCountAlias, ")");
              }
              apply += ")";
            }
            ;
            parameters[optionKey] = apply;
          }
          break;
        default:
          break;
      }
    }
    return {
      path: urlSearchPath,
      parameters: parameters
    };
  };
  var getEshSearchQuery = function getEshSearchQuery(options) {
    var createdQuery = createEshSearchQuery(options);
    var stringParams = Object.keys(createdQuery.parameters).map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(createdQuery.parameters[key]);
    }).join("&");
    if (stringParams && stringParams !== "") {
      return "".concat(createdQuery.path, "?").concat(stringParams);
    }
    return createdQuery.path;
  };
  var parseFreeStyleText = function parseFreeStyleText(freeStyleText) {
    var items = [];
    var term = "";
    var state = States.Term;
    for (var i = 0; i < freeStyleText.length; i++) {
      var currentChar = freeStyleText[i];
      if (currentChar === '"') {
        if (state == States.Term) {
          // check if there is closing "
          if (freeStyleText.substring(i + 1).indexOf('"') >= 0) {
            items.push(new Term({
              term: term.trim()
            }));
            state = States.Phrase;
            term = '';
          } else {
            items.push(new Term({
              term: (term + freeStyleText.substring(i)).trim()
            }));
            term = '';
            break;
          }
        } else {
          items.push(new Phrase({
            phrase: term
          }));
          state = States.Term;
          term = '';
        }
      } else {
        term += freeStyleText[i];
      }
    }
    if (term.length > 0) {
      items.push(new Term({
        term: term.trim()
      }));
    }
    return new Expression({
      operator: SearchQueryLogicalOperator.TIGHT_AND,
      items: items
    });
  };
  var __exports = {
    __esModule: true
  };
  __exports.createEshSearchQuery = createEshSearchQuery;
  __exports.getEshSearchQuery = getEshSearchQuery;
  __exports.parseFreeStyleText = parseFreeStyleText;
  return __exports;
});
})();