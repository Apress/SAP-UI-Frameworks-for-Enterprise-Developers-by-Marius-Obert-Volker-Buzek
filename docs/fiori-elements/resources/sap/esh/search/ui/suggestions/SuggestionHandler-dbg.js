/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/base/Log", "../i18n", "./AppSuggestionProvider", "./RecentlyUsedSuggestionProvider", "./SinaSuggestionProvider", "./SuggestionType", "./TimeMerger", "./TransactionSuggestionProvider", "sap/esh/search/ui/SearchHelper", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (Log, __i18n, __AppSuggestionProvider, __RecentlyUsedSuggestionProvider, __SinaSuggestionProvider, ___SuggestionType, __TimeMerger, __TransactionSuggestionProvider, SearchHelper, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
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
  var i18n = _interopRequireDefault(__i18n);
  var AppSuggestionProvider = _interopRequireDefault(__AppSuggestionProvider);
  var RecentlyUsedSuggestionProvider = _interopRequireDefault(__RecentlyUsedSuggestionProvider);
  var SinaSuggestionProvider = _interopRequireDefault(__SinaSuggestionProvider);
  var SuggestionType = ___SuggestionType["Type"];
  var SuggestionTypeProperties = ___SuggestionType["SuggestionType"];
  var TimeMerger = _interopRequireDefault(__TimeMerger);
  var TransactionSuggestionProvider = _interopRequireDefault(__TransactionSuggestionProvider);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var SuggestionHandler = /*#__PURE__*/function () {
    // init
    // ===================================================================
    function SuggestionHandler(params) {
      _classCallCheck(this, SuggestionHandler);
      _defineProperty(this, "uiUpdateInterval", 500);
      _defineProperty(this, "uiClearOldSuggestionsTimeOut", 1000);
      // members
      this._oLogger = Log.getLogger("sap.esh.search.ui.suggestions.SuggestionHandler");
      this.model = params.model;
      this.suggestionProviders = [];

      // times
      this.keyboardRelaxationTime = this.model.config.suggestionKeyboardRelaxationTime;

      // recently used suggestion provider
      if (this.supportsRecentlyUsedSuggestions()) {
        this.recentlyUsedSuggestionProvider = new RecentlyUsedSuggestionProvider({
          model: this.model,
          suggestionHandler: this
        });
      }

      // apps suggestion provider
      this.appSuggestionProvider = new AppSuggestionProvider({
        model: this.model,
        suggestionHandler: this
      });

      // decorator for delayed suggestion execution, make delayed by default 400ms
      this.doSuggestionInternalDelayed = SearchHelper.delayedExecution(this.doSuggestionInternal.bind(this), this.keyboardRelaxationTime);

      // time merger for merging returning suggestions callbacks
      this.timeMerger = new TimeMerger();
      this.performanceLoggerSuggestionMethods = []; // performance logging: Remember all method names of (open) suggestion calls (needed for 'abortSuggestion -> leaveMethod')
    }

    _createClass(SuggestionHandler, [{
      key: "supportsRecentlyUsedSuggestions",
      value: function supportsRecentlyUsedSuggestions() {
        if (!this.model.config.bRecentSearches) return false;
        return true;
      }
    }, {
      key: "supportsTransactionSuggestions",
      value: function supportsTransactionSuggestions() {
        return false; // deactivate until S4 decides to activate it
        if (window.sap.cf) return false; // no transaction suggestions in cFLP/multiprovider
        if (!this.model.config.isUshell) return false; // transaction suggestions are only shown in ushell
        if (this.model.sinaNext.provider.serverInfo && this.model.sinaNext.provider.serverInfo.Services && this.model.sinaNext.provider.serverInfo.Services.results && this.model.sinaNext.provider.serverInfo.Services.results.length > 0) {
          var _iterator = _createForOfIteratorHelper(this.model.sinaNext.provider.serverInfo.Services.results),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var capability = _step.value;
              if (capability.Id === "TransactionSuggestions") return true;
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
        return false;
      }

      // abort suggestions
      // ===================================================================
    }, {
      key: "abortSuggestions",
      value: function abortSuggestions(clearSuggestions) {
        var _this = this;
        if (clearSuggestions === undefined || clearSuggestions === true) {
          this.model.setProperty("/suggestions", []);
        }
        if (this.clearSuggestionTimer) {
          clearTimeout(this.clearSuggestionTimer);
          this.clearSuggestionTimer = null;
        }
        this.doSuggestionInternalDelayed.abort(); // abort time delayed calls
        this.getSuggestionProviders().then(function (suggestionProviders) {
          for (var i = 0; i < suggestionProviders.length; ++i) {
            var suggestionProvider = suggestionProviders[i];
            suggestionProvider.abortSuggestions();
          }
          _this.timeMerger.abort();
          var _iterator2 = _createForOfIteratorHelper(_this.performanceLoggerSuggestionMethods),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var method = _step2.value;
              _this.model.config.performanceLogger.leaveMethod({
                name: method
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          _this.performanceLoggerSuggestionMethods = [];
        });
      }

      // get suggestion providers dependend on server capabilities
      // ===================================================================
    }, {
      key: "getSuggestionProviders",
      value: function getSuggestionProviders() {
        var _this2 = this;
        // check cache
        if (this.suggestionProvidersPromise) {
          return this.suggestionProvidersPromise;
        }

        // this.suggestionProvidersPromise = this.model.initBusinessObjSearch().then(function () {
        this.suggestionProvidersPromise = this.model.initBusinessObjSearch().then(function () {
          // link to sina
          _this2.sinaNext = _this2.model.sinaNext;

          // init list of suggestion providers (app suggestions are always available)
          var suggestionProviders = [];
          if (_this2.model.config.isUshell) {
            suggestionProviders.push(_this2.appSuggestionProvider);
          }
          if (_this2.supportsRecentlyUsedSuggestions()) {
            suggestionProviders.push(_this2.recentlyUsedSuggestionProvider);
          }

          // if no business obj search configured -> just use app suggestion provider
          if (!_this2.model.config.searchBusinessObjects) {
            return Promise.resolve(suggestionProviders);
          }

          // create sina suggestion providers
          suggestionProviders.push.apply(suggestionProviders, _toConsumableArray(_this2.createSinaSuggestionProviders()));

          // transactions suggestion provider
          if (_this2.supportsTransactionSuggestions()) {
            _this2.transactionSuggestionProvider = new TransactionSuggestionProvider({
              model: _this2.model,
              suggestionHandler: _this2
            });
            suggestionProviders.push(_this2.transactionSuggestionProvider);
          }
          return Promise.resolve(suggestionProviders);
        });
        return this.suggestionProvidersPromise;
      }

      // create sina suggestion providers
      // ===================================================================
    }, {
      key: "createSinaSuggestionProviders",
      value: function createSinaSuggestionProviders() {
        // provider configuration
        var providerConfigurations = [{
          suggestionTypes: [SuggestionType.SearchTermHistory]
        }, {
          suggestionTypes: [SuggestionType.SearchTermData]
        }, {
          suggestionTypes: [SuggestionType.DataSource]
        }];
        if (this.model.config.boSuggestions) {
          providerConfigurations.push({
            suggestionTypes: [SuggestionType.Object]
          });
        }

        // create suggestion providers
        var suggestionProviders = [];
        for (var k = 0; k < providerConfigurations.length; ++k) {
          var providerConfiguration = providerConfigurations[k];
          suggestionProviders.push(new SinaSuggestionProvider({
            model: this.model,
            sinaNext: this.sinaNext,
            suggestionTypes: providerConfiguration.suggestionTypes,
            suggestionHandler: this
          }));
        }
        return suggestionProviders;
      }

      // check if suggestions are visible
      // ===================================================================
    }, {
      key: "isSuggestionPopupVisible",
      value: function isSuggestionPopupVisible() {
        return jQuery(".searchSuggestion").filter(":visible").length > 0;
      }

      // do suggestions
      // ===================================================================
    }, {
      key: "doSuggestion",
      value: function doSuggestion(filter) {
        this.abortSuggestions(false);
        this.doSuggestionInternalDelayed(filter); // time delayed
      }

      // auto select app suggestion
      // ===================================================================
    }, {
      key: "autoSelectAppSuggestion",
      value: function autoSelectAppSuggestion(filter) {
        return this.appSuggestionProvider.getSuggestions(filter).then(function (suggestions) {
          return suggestions[0];
        });
      }
    }, {
      key: "autoSelectTransactionSuggestion",
      value: function autoSelectTransactionSuggestion() {
        var _this$transactionSugg;
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        key = key.toUpperCase();
        return (_this$transactionSugg = this.transactionSuggestionProvider) === null || _this$transactionSugg === void 0 ? void 0 : _this$transactionSugg.transactionSuggestions.find(function (suggestion) {
          return suggestion.key === key;
        });
      }

      // do suggestion internal
      // ===================================================================
    }, {
      key: "doSuggestionInternal",
      value: function doSuggestionInternal(filter) {
        var _this3 = this;
        /* eslint no-loop-func:0 */

        // don't suggest if there is no search term
        this.firstInsertion = true;
        this.busyIndicator = false;
        var suggestionTerm = this.model.getProperty("/uiFilter/searchTerm");
        if (suggestionTerm.length === 0) {
          // Show recently used suggestions also for empty search input:
          if (this.supportsRecentlyUsedSuggestions()) {
            this.recentlyUsedSuggestionProvider.getSuggestions().then(function (suggestions) {
              _this3.insertSuggestions(suggestions, 0);
            });
          }
          return;
        }

        // no suggestions for "" or *
        if (suggestionTerm.trim() === "" || suggestionTerm.trim() === "*") {
          this.insertSuggestions([], 0);
          return;
        }
        var method = "Suggestions for term ".concat(suggestionTerm);
        this.performanceLoggerSuggestionMethods.push(method);
        this.model.config.performanceLogger.enterMethod({
          name: method
        }, {
          isSearch: true,
          comments: "suggestion term: ".concat(suggestionTerm)
        });

        // log suggestion request
        this.model.eventLogger.logEvent({
          type: UserEventType.SUGGESTION_REQUEST,
          suggestionTerm: this.model.getProperty("/uiFilter/searchTerm"),
          dataSourceKey: this.model.getProperty("/uiFilter/dataSource").id
        });

        // get suggestion providers
        this.getSuggestionProviders().then(function (suggestionProviders) {
          // get suggestion promises from all providers
          var promises = [];
          var pending = suggestionProviders.length;
          for (var i = 0; i < suggestionProviders.length; ++i) {
            var suggestionProvider = suggestionProviders[i];
            promises.push(suggestionProvider.getSuggestions(filter));
          }

          // display empty suggestions list just with busy indicator
          if (_this3.isSuggestionPopupVisible()) {
            // do this time delayed in order to avoid flickering
            // otherwise we would have: old suggestions/busy indicator/new suggestions
            if (_this3.clearSuggestionTimer) {
              clearTimeout(_this3.clearSuggestionTimer);
            }
            _this3.clearSuggestionTimer = window.setTimeout(function () {
              _this3.clearSuggestionTimer = null;
              _this3.insertSuggestions([], pending);
            }, _this3.uiClearOldSuggestionsTimeOut);
          } else {
            // immediately display busy indicator
            _this3.insertSuggestions([], pending);
          }

          // process suggestions using time merger
          // (merge returning suggestion callbacks happening within a time slot
          // in order to reduce number of UI updates)
          _this3.timeMerger.abort();
          _this3.timeMerger = new TimeMerger(promises, _this3.uiUpdateInterval);
          _this3.timeMerger.process(function (results) {
            pending -= results.length;
            var suggestions = [];
            for (var j = 0; j < results.length; ++j) {
              var result = results[j];
              if (result && result instanceof Error) {
                _this3._oLogger.error("A suggestion provider reported an error while getting suggestions for term '" + filter.searchTerm + "'\n" + result.stack || result + "");
                continue;
              }
              suggestions.push.apply(suggestions, _toConsumableArray(result));
            }
            if (pending > 0 && suggestions.length === 0) {
              return; // empty result -> return and don't update (flicker) suggestions on UI
            }

            if (_this3.clearSuggestionTimer) {
              clearTimeout(_this3.clearSuggestionTimer);
              _this3.clearSuggestionTimer = null;
            }
            _this3.insertSuggestions(suggestions, pending);
            if (pending === 0) {
              var _iterator3 = _createForOfIteratorHelper(_this3.performanceLoggerSuggestionMethods),
                _step3;
              try {
                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  var _method = _step3.value;
                  _this3.model.config.performanceLogger.leaveMethod({
                    name: _method
                  });
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }
              _this3.performanceLoggerSuggestionMethods = [];
            }
          });
        })["catch"](function () {
          var _iterator4 = _createForOfIteratorHelper(_this3.performanceLoggerSuggestionMethods),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var _method2 = _step4.value;
              _this3.model.config.performanceLogger.leaveMethod({
                name: _method2
              });
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          _this3.performanceLoggerSuggestionMethods = [];
        });
      }

      // generate suggestion header
      // ===================================================================
    }, {
      key: "generateSuggestionHeader",
      value: function generateSuggestionHeader(insertSuggestion) {
        var header = {};
        switch (insertSuggestion.uiSuggestionType) {
          case SuggestionType.Transaction:
            header.label = i18n.getText("label_transactions");
            break;
          case SuggestionType.Recent:
            header.label = i18n.getText("label_recently_used");
            break;
          case SuggestionType.App:
            header.label = i18n.getText("label_apps");
            break;
          case SuggestionType.DataSource:
            header.label = i18n.getText("searchIn");
            break;
          case SuggestionType.SearchTermData:
          case SuggestionType.SearchTermHistory:
            header.label = i18n.getText("searchFor");
            break;
          case SuggestionType.Object:
            header.label = insertSuggestion.dataSource.labelPlural; // default label
            /* if (this.model.config.FF_bOptimizedQuickSelectDataSourceLabels) {
                if (this.model.getDataSource().subType === this.sinaNext.DataSourceSubType.Filtered) {
                    header.label = this.model.getDataSource().labelPlural; // filtered data sources (DWC example: Quick-Select DS "Shared")
                } else {
                    if (typeof this.model.config.getFirstSpaceCondition === "function") {
                        // currently there can be only one space selected at the same time
                        const firstSpaceCondition = this.model.config.getFirstSpaceCondition(
                            this.model.getProperty("/uiFilter")
                        );
                        if (firstSpaceCondition && firstSpaceCondition.attributeLabel) {
                            header.label = i18n.getText("suggestionFacetLabelWithValue", [
                                firstSpaceCondition.attributeLabel,
                                firstSpaceCondition.valueLabel || firstSpaceCondition.value,
                            ]);
                        }
                    }
                }
            } */
            header.dataSource = insertSuggestion.dataSource;
            break;
        }
        header.position = SuggestionTypeProperties.properties[insertSuggestion.uiSuggestionType].position;
        header.suggestionResultSetCounter = this.suggestionResultSetCounter;
        header.uiSuggestionType = SuggestionType.Header;
        return header;
      }

      // enable busy indicator suggestion (waiting for suggestions)
      // ===================================================================
    }, {
      key: "enableBusyIndicator",
      value: function enableBusyIndicator(suggestions, enabled) {
        if (enabled) {
          // enable -> add busy indicator suggestions
          suggestions.push({
            position: SuggestionTypeProperties.properties[SuggestionType.BusyIndicator].position,
            uiSuggestionType: SuggestionType.BusyIndicator
          });
          return;
        }
        // disable -> remove busy indicator suggestion
        for (var i = 0; i < suggestions.length; ++i) {
          var suggestion = suggestions[i];
          if (suggestion.uiSuggestionType === SuggestionType.BusyIndicator) {
            suggestions.splice(i, 1);
            return;
          }
        }
      }

      // check for duplicate suggestion
      // ===================================================================
    }, {
      key: "checkDuplicate",
      value: function checkDuplicate(suggestions, insertSuggestion) {
        var checkRelevancy = function checkRelevancy(insertSuggestion) {
          return insertSuggestion.uiSuggestionType === SuggestionType.SearchTermHistory || insertSuggestion.uiSuggestionType === SuggestionType.SearchTermData && !insertSuggestion.dataSource;
        };
        if (!checkRelevancy(insertSuggestion)) {
          return {
            action: "append"
          };
        }
        for (var i = 0; i < suggestions.length; ++i) {
          var suggestion = suggestions[i];
          if (!checkRelevancy(suggestion)) {
            continue;
          }
          if (insertSuggestion.searchTerm === suggestion.searchTerm) {
            if (insertSuggestion.grouped && insertSuggestion.uiSuggestionType === SuggestionType.SearchTermData && suggestion.uiSuggestionType === SuggestionType.SearchTermHistory) {
              // for the top grouped suggestions: prefer data based suggestion
              // over history based suggestions because
              // - upper lower case of history and data based suggestions may differ
              // - upper lower case should be identical for all grouped suggestions
              return {
                action: "replace",
                index: i
              };
            }
            return {
              action: "skip"
            };
          }
        }
        return {
          action: "append"
        };
      }

      // insert suggestions
      // ===================================================================
    }, {
      key: "insertSuggestions",
      value: function insertSuggestions(_insertSuggestions, pending) {
        // get suggestions from model
        var suggestions = this.model.getProperty("/suggestions").slice(); // copy list (updateSuggestions needs to access old list via data binding)

        // unsorted insert of suggestions
        suggestions = this.insertIntoSuggestionList(_insertSuggestions, suggestions);

        // adjust busy indicator
        if (!this.busyIndicator && pending > 0) {
          this.enableBusyIndicator(suggestions, true);
          this.busyIndicator = true;
        }
        if (this.busyIndicator && pending === 0) {
          this.enableBusyIndicator(suggestions, false);
          this.busyIndicator = false;
        }

        // sort
        this.sortSuggestions(suggestions);

        // remove suggestions if over limit
        // (limit needs to be done here because history and search term suggestions are merged)
        this.limitSuggestions(suggestions);

        // set suggestions in model
        this.updateSuggestions(suggestions);
        //this.model.setProperty('/suggestions', suggestions);
      }

      // insert into suggestion list
      // ===================================================================
    }, {
      key: "insertIntoSuggestionList",
      value: function insertIntoSuggestionList(insertSuggestions, suggestions) {
        // do we need to replace?
        var flagReplace = false;
        if (this.firstInsertion) {
          this.firstInsertion = false;
          flagReplace = true;
        }

        // reset global fields
        if (flagReplace) {
          suggestions = [];
          this.suggestionHeaders = {};
          this.suggestionResultSetCounter = 0;
          this.generatedPositions = {
            maxPosition: SuggestionTypeProperties.properties[SuggestionType.Object].position,
            position: {}
          };
        }

        // increase result set counter (used for sorting)
        this.suggestionResultSetCounter += 1;

        // add sorting information to the suggestions
        for (var i = 0; i < insertSuggestions.length; ++i) {
          var insertSuggestion = insertSuggestions[i];

          // for object suggestions: overwrite position by a generated position
          // object suggestion with identical datasource are grouped by position
          if (insertSuggestion.uiSuggestionType === SuggestionType.Object) {
            var position = this.generatedPositions.position[insertSuggestion.dataSource.id];
            if (!position) {
              this.generatedPositions.maxPosition += 1;
              position = this.generatedPositions.maxPosition;
              this.generatedPositions.position[insertSuggestion.dataSource.id] = position;
            }
            insertSuggestion.position = position;
          }

          // set fields used in sorting
          insertSuggestion.suggestionResultSetCounter = this.suggestionResultSetCounter;
          insertSuggestion.resultSetPosition = i;

          // additional duplicate check for search term suggestions
          var duplicateCheckResult = this.checkDuplicate(suggestions, insertSuggestion);
          switch (duplicateCheckResult.action) {
            case "append":
              suggestions.push(insertSuggestion);
              break;
            case "skip":
              continue;
            case "replace":
              //var toBeReplacedSuggestion = suggestions[duplicateCheckResult.index];
              suggestions.splice(duplicateCheckResult.index, 1, insertSuggestion);
              //insertSuggestion.suggestionResultSetCounter = toBeReplacedSuggestion.suggestionResultSetCounter;
              //insertSuggestion.resultSetPosition = toBeReplacedSuggestion.resultSetPosition;
              break;
          }
          if (this.isHeaderGenerationEnabled() && !this.suggestionHeaders[insertSuggestion.position]) {
            suggestions.push(this.generateSuggestionHeader(insertSuggestion));
            this.suggestionHeaders[insertSuggestion.position] = true;
          }
        }
        return suggestions;
      }

      // check whether we need to generate headers
      // ===================================================================
    }, {
      key: "isHeaderGenerationEnabled",
      value: function isHeaderGenerationEnabled() {
        // no headings for app datsource
        if (this.model.getDataSource() === this.model.appDataSource) {
          return false;
        }

        // no headings if bo suggestions are deactivated datasource is businessobject (connector)
        if (!this.model.config.boSuggestions && this.model.getDataSource().type === this.sinaNext.DataSourceType.BusinessObject) {
          return false;
        }
        return true;
      }

      // sort suggestions
      // ===================================================================
    }, {
      key: "sortSuggestions",
      value: function sortSuggestions(suggestions) {
        suggestions.sort(function (s1, s2) {
          // position is main sort field
          var cmp = s1.position - s2.position;
          if (cmp !== 0) {
            return cmp;
          }

          // headers are always on top of each section
          if (s1.uiSuggestionType === SuggestionType.Header) {
            return -1;
          }
          if (s2.uiSuggestionType === SuggestionType.Header) {
            return 1;
          }

          // special: grouped search term suggestions on top
          // grouped: the first search term suggestion with sub suggestions by datasource
          // for instance: sally in All
          //               sally in Employees
          //               sally in Customers
          if (s1.grouped && !s2.grouped) {
            return -1;
          }
          if (!s1.grouped && s2.grouped) {
            return 1;
          }

          // sort by result set
          cmp = s1.suggestionResultSetCounter - s2.suggestionResultSetCounter;
          if (cmp !== 0) {
            return cmp;
          }

          // sort by position in result set
          cmp = s1.resultSetPosition - s2.resultSetPosition;
          return cmp;
        });
      }

      // get suggestion limit
      // ===================================================================
    }, {
      key: "getSuggestionLimit",
      value: function getSuggestionLimit(uiSuggestionType) {
        var suggestionTypeData = SuggestionTypeProperties.properties[uiSuggestionType];
        if (typeof suggestionTypeData === "undefined") {
          return Infinity;
        }
        var limit;
        if (this.model.getDataSource() === this.model.sinaNext.allDataSource || this.model.getDataSource() === this.model.favDataSource) {
          limit = suggestionTypeData.limitDsAll;
        } else {
          limit = suggestionTypeData.limit;
        }
        return limit;
      }

      // limit suggestions
      // ===================================================================
    }, {
      key: "limitSuggestions",
      value: function limitSuggestions(suggestions) {
        var numberSuggestions = {};
        for (var i = 0; i < suggestions.length; ++i) {
          var suggestion = suggestions[i];
          var suggestionType = suggestion.uiSuggestionType;
          if (suggestionType === SuggestionType.SearchTermHistory) {
            suggestionType = SuggestionType.SearchTermData; // history and data suggestions are merged
          }

          var limit = this.getSuggestionLimit(suggestionType);
          var number = numberSuggestions[suggestionType];
          if (typeof number === "undefined") {
            number = 0;
            numberSuggestions[suggestionType] = number;
          }
          if (number >= limit) {
            suggestions.splice(i, 1);
            --i;
            continue;
          }
          numberSuggestions[suggestionType] = number + 1;
        }
      }

      // update suggestions with restore old selected suggestion
      // ===================================================================
    }, {
      key: "updateSuggestions",
      value: function updateSuggestions(suggestions) {
        var searchFieldInShellId = "searchFieldInShell-input";
        var input = sap.ui.getCore().byId(searchFieldInShellId);
        if (!input) {
          input = this.model.getProperty("/inputHelp");
        }

        // get selected entry in old suggestion list
        var suggestionRows = input.getSuggestionRows();
        var suggestionKey;
        for (var i = 0; i < suggestionRows.length; ++i) {
          var suggestionRow = suggestionRows[i];
          var suggestion = suggestionRow.getBindingContext().getObject();
          if (suggestionRow.getSelected()) {
            suggestionKey = suggestion.key;
          }
        }

        // update suggestions
        this.model.setProperty("/suggestions", suggestions);
        if (this.supportsRecentlyUsedSuggestions()) {
          // Also show recent suggestions if search term is empty:
          input.showItems(); // UI5 types demands a filter function which is optional
        }

        // restore selected entry (ugly time delayed logic)
        if (!suggestionKey) {
          return;
        }
        window.setTimeout(function () {
          var suggestionRows = input.getSuggestionRows();
          for (var j = 0; j < suggestionRows.length; ++j) {
            var _suggestionRow = suggestionRows[j];
            var _suggestion = _suggestionRow.getBindingContext().getObject();
            if (_suggestion.key === suggestionKey) {
              input["_oSuggPopover"]._iPopupListSelectedIndex = j; // ugly
              _suggestionRow.setSelected(true);
              _suggestionRow.rerender();
            }
          }
        }, 100);
      }
    }]);
    return SuggestionHandler;
  }();
  return SuggestionHandler;
});
})();