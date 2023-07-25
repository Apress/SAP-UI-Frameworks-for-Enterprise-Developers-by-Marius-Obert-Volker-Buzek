/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../i18n", "sap/esh/search/ui/SearchHelper", "./SuggestionType"], function (__i18n, SearchHelper, ___SuggestionType) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
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
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
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
  var i18n = _interopRequireDefault(__i18n);
  var UISuggestionType = ___SuggestionType["Type"];
  var UISuggestionTypeProperties = ___SuggestionType["SuggestionType"];
  var AppSuggestionProvider = /*#__PURE__*/function () {
    function AppSuggestionProvider(options) {
      _classCallCheck(this, AppSuggestionProvider);
      this.model = options.model;
      this.suggestionHandler = options.suggestionHandler;
      // decorate suggestion methods (decorator prevents request overtaking)
      this.suggestApplications = SearchHelper.refuseOutdatedRequests(this.suggestApplicationsNotDecorated);
    }
    _createClass(AppSuggestionProvider, [{
      key: "abortSuggestions",
      value: function abortSuggestions() {
        this.suggestApplications.abort();
      }
    }, {
      key: "combineSuggestionsWithIdenticalTitle",
      value: function combineSuggestionsWithIdenticalTitle(suggestions) {
        //            function JSONStringifyReplacer(key, value) {
        //                if (key === "sina") {
        //                    return undefined;
        //                }
        //                return value;
        //            }

        // collect suggestions in suggestionsTitleDict + create combined suggestions
        var suggestion;
        var suggestionsTitleDict = {};
        for (var i = 0; i < suggestions.length; i++) {
          suggestion = suggestions[i];
          var firstAppSuggestion = suggestionsTitleDict[suggestion.title + suggestion.subtitle];
          if (firstAppSuggestion) {
            if (!firstAppSuggestion.combinedSuggestionExists) {
              var combinedSuggestion = {
                title: "combinedAppSuggestion" + i,
                subtitle: suggestion.subtitle,
                sortIndex: firstAppSuggestion.sortIndex,
                url: this.model.searchUrlParser.renderFromParameters(this.model.appTopDefault, this.model.sinaNext.createFilter({
                  dataSource: this.model.appDataSource,
                  searchTerm: suggestion.title
                }), false),
                label: i18n.getText("suggestion_in_apps", suggestion.label),
                icon: "sap-icon://none",
                keywords: "",
                uiSuggestionType: UISuggestionType.App
              };
              var inApps = i18n.getText("suggestion_in_apps", [""]);
              combinedSuggestion.label = combinedSuggestion.label.replace(inApps, "<i>" + inApps + "</i>");
              suggestionsTitleDict[combinedSuggestion.title + combinedSuggestion.subtitle] = combinedSuggestion;
              firstAppSuggestion.combinedSuggestionExists = true;
            }
          } else {
            suggestion.sortIndex = i;
            suggestionsTitleDict[suggestion.title + suggestion.subtitle] = suggestion;
          }
        }

        // filter out combined suggestions
        suggestions = [];
        for (var suggestionTitle in suggestionsTitleDict) {
          if (Object.prototype.hasOwnProperty.call(suggestionsTitleDict, suggestionTitle)) {
            // eslint-disable-line no-prototype-builtins
            suggestion = suggestionsTitleDict[suggestionTitle];
            if (!suggestion.combinedSuggestionExists) {
              suggestions.push(suggestion);
            }
          }
        }
        suggestions.sort(function (s1, s2) {
          return s1.sortIndex - s2.sortIndex;
        });
        return suggestions;
      }
    }, {
      key: "addAsterisk4ShowAllApps",
      value: function addAsterisk4ShowAllApps(searchTerms) {
        var searchTermsMatches = searchTerms.match(/\S+/g);
        if (searchTermsMatches.length > 0) {
          var searchTerm;
          var searchTermsArray = [];
          for (var i = 0; i < searchTermsMatches.length; i++) {
            searchTerm = searchTermsMatches[i];
            if (searchTerm && searchTerm.lastIndexOf("*") !== searchTerm.length - 1) {
              searchTermsArray.push(searchTerm + "*");
            } else {
              searchTermsArray.push(searchTerm);
            }
          }
          searchTerms = searchTermsArray.join(" ");
        }
        return searchTerms;
      }
    }, {
      key: "createShowMoreSuggestion",
      value: function createShowMoreSuggestion(totalResults) {
        var title = i18n.getText("showAllNApps", [totalResults]);
        title = title.replace(/"/g, ""); //remove trailing ""
        var tooltip = title;
        var label = "<i>" + title + "</i>";
        return {
          title: title,
          tooltip: tooltip,
          label: label,
          dataSource: this.model.appDataSource,
          labelRaw: this.model.getProperty("/uiFilter/searchTerm"),
          uiSuggestionType: UISuggestionType.SearchTermData,
          searchTerm: this.model.getProperty("/uiFilter/searchTerm") || ""
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
      key: "getSuggestions",
      value: function getSuggestions(filter) {
        try {
          const _this = this;
          var _userCategoryManager$;
          // check that datasource is all or apps
          var dataSource = _this.model.getDataSource();
          var userCategoryManager = _this.model.userCategoryManager;
          var favoritesIncludeApps = (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : userCategoryManager.isFavActive()) && (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : (_userCategoryManager$ = userCategoryManager.getCategory("MyFavorites")) === null || _userCategoryManager$ === void 0 ? void 0 : _userCategoryManager$.includeApps);
          // check that datasource is all, apps or my favorites and my favorites include apps:
          if (dataSource !== _this.model.allDataSource && dataSource !== _this.model.appDataSource && !(dataSource === _this.model.favDataSource && favoritesIncludeApps)) {
            return Promise.resolve([]);
          }

          // get suggestions
          var suggestionTerm = _this.model.getProperty("/uiFilter/searchTerm");
          return _await(_this.suggestApplications(suggestionTerm), function (resultset) {
            // combine suggestions with identical title
            var flpAppSuggestions = resultset.getElements();
            flpAppSuggestions = _this.combineSuggestionsWithIdenticalTitle(flpAppSuggestions);
            var uiAppSuggestions = [];

            // set type, datasource and position
            var _iterator = _createForOfIteratorHelper(flpAppSuggestions),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var flpAppSuggestion = _step.value;
                var uiAppSuggestion = _objectSpread(_objectSpread({}, flpAppSuggestion), {}, {
                  uiSuggestionType: UISuggestionType.App,
                  dataSource: _this.model.appDataSource,
                  position: UISuggestionTypeProperties.properties.App.position,
                  key: UISuggestionTypeProperties.App + flpAppSuggestion.url + flpAppSuggestion.icon
                });
                uiAppSuggestions.push(uiAppSuggestion);
              }

              // limit app suggestions
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            var appSuggestionLimit = _this.suggestionHandler.getSuggestionLimit(UISuggestionType.App);
            uiAppSuggestions = uiAppSuggestions.slice(0, appSuggestionLimit);

            // if there are more apps available, add a "show all apps" suggestion at the end
            // but only if datasource is apps (nestle changes)
            if (resultset.totalResults > appSuggestionLimit && dataSource === _this.model.appDataSource) {
              uiAppSuggestions.push(_this.createShowMoreSuggestion(resultset.totalResults));
            }
            return uiAppSuggestions;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "suggestApplicationsNotDecorated",
      value: function suggestApplicationsNotDecorated(searchTerm) {
        return sap.ushell.Container.getServiceAsync("Search").then(function (service) {
          return service.queryApplications({
            searchTerm: searchTerm,
            suggestion: true
          });
        });
      }
    }]);
    return AppSuggestionProvider;
  }();
  return AppSuggestionProvider;
});
})();