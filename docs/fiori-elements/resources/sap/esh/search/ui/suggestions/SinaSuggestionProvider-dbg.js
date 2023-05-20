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
sap.ui.define(["../i18n", "./SinaBaseSuggestionProvider", "./SinaObjectSuggestionFormatter", "./SuggestionType", "sap/esh/search/ui/SearchHelper", "../sinaNexTS/sina/SearchResultSetItemAttribute"], function (__i18n, __SinaBaseSuggestionProvider, __SinaObjectSuggestionFormatter, ___SuggestionType, SearchHelper, ___sinaNexTS_sina_SearchResultSetItemAttribute) {
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
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  var i18n = _interopRequireDefault(__i18n);
  var SinaBaseSuggestionProvider = _interopRequireDefault(__SinaBaseSuggestionProvider);
  var SinaObjectSuggestionFormatter = _interopRequireDefault(__SinaObjectSuggestionFormatter);
  var UISuggestionType = ___SuggestionType["Type"];
  var UISuggestionTypeProperties = ___SuggestionType["SuggestionType"];
  var SearchResultSetItemAttribute = ___sinaNexTS_sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var SinaSuggestionProvider = /*#__PURE__*/function (_SinaBaseSuggestionPr) {
    _inherits(SinaSuggestionProvider, _SinaBaseSuggestionPr);
    var _super = _createSuper(SinaSuggestionProvider);
    // init
    // ===================================================================
    function SinaSuggestionProvider(options) {
      var _this;
      _classCallCheck(this, SinaSuggestionProvider);
      // call super constructor
      _this = _super.call(this, options.sinaNext);
      _this.model = options.model;
      _this.suggestionTypes = options.suggestionTypes;
      _this.suggestionHandler = options.suggestionHandler;
      _this.suggestionLimit = sap.ui.Device.system.phone ? 5 : 7;
      _this.suggestionStartingCharacters = _this.model.config.suggestionStartingCharacters;
      // this.dataSourceDeferred = null;
      _this.sinaObjectSuggestionFormatter = new SinaObjectSuggestionFormatter();
      return _this;
    }

    // abort suggestions
    // ===================================================================
    _createClass(SinaSuggestionProvider, [{
      key: "abortSuggestions",
      value: function abortSuggestions() {
        this.suggestionQuery.abort();
      }

      // get suggestions
      // ===================================================================
    }, {
      key: "getSuggestions",
      value: function getSuggestions(filter) {
        try {
          const _this2 = this;
          // reset global fields
          _this2.suggestions = [];
          _this2.firstObjectDataSuggestion = true;
          _this2.numberSuggestionsByType = {};
          for (var i = 0; i < UISuggestionTypeProperties.types.length; ++i) {
            var suggestionType = UISuggestionTypeProperties.types[i];
            _this2.numberSuggestionsByType[suggestionType] = 0;
          }

          // data based search term suggestions only starting by default from 3. character
          var suggestionTerm = filter.searchTerm;
          if (_this2.suggestionTypes.length === 1 && _this2.suggestionTypes.indexOf(UISuggestionType.SearchTermData) >= 0 && suggestionTerm.length < _this2.suggestionStartingCharacters) {
            return Promise.resolve(_this2.suggestions);
          }

          // object suggestions only starting by default from 3. character
          if (_this2.suggestionTypes.length === 1 && _this2.suggestionTypes.indexOf(UISuggestionType.Object) >= 0 && suggestionTerm.length < _this2.suggestionStartingCharacters) {
            return Promise.resolve(_this2.suggestions);
          }

          // data source suggestions only for ds=all and My Favorites
          if (_this2.suggestionTypes.length === 1 && _this2.suggestionTypes.indexOf(UISuggestionType.DataSource) >= 0 && _this2.model.getDataSource() !== _this2.model.sinaNext.allDataSource && _this2.model.getDataSource() !== _this2.model.favDataSource) {
            return Promise.resolve(_this2.suggestions);
          }

          // handle client side datasource-suggestions for all and apps
          _this2.createAllAndAppDsSuggestions();

          // check that BO search is enabled
          if (!_this2.model.config.searchBusinessObjects) {
            return Promise.resolve(_this2.suggestions);
          }

          // no server request for ds = apps
          if (_this2.model.getDataSource() === _this2.model.appDataSource) {
            return Promise.resolve(_this2.suggestions);
          }

          // prepare sina suggestion query
          _this2.prepareSuggestionQuery(filter);

          // fire sina suggestion query
          return _await(_this2.suggestionQuery.getResultSetAsync(), function (resultSet) {
            // concatenate searchterm + suggestion term
            var sinaSuggestions = resultSet.items;

            // assemble items from result set
            _this2.formatSinaSuggestions(sinaSuggestions);
            return _this2.suggestions;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }

      // client side datasource suggestions for all and apps
      // ===================================================================
    }, {
      key: "createAllAndAppDsSuggestions",
      value: function createAllAndAppDsSuggestions() {
        if (this.suggestionTypes.indexOf(UISuggestionType.DataSource) < 0) {
          return;
        }
        if (this.model.getDataSource() !== this.model.allDataSource && this.model.getDataSource() !== this.model.favDataSource) {
          return;
        }
        var dataSources = [];
        if (this.model.getDataSource() === this.model.allDataSource) {
          dataSources.unshift(this.model.appDataSource);
          dataSources.unshift(this.model.allDataSource);
        }
        if (this.model.getDataSource() === this.model.favDataSource) {
          if (this.model.favDataSource.includeApps) {
            dataSources.unshift(this.model.appDataSource);
          }
          dataSources.unshift(this.model.favDataSource);
        }
        var suggestionTerms = this.model.getProperty("/uiFilter/searchTerm");
        var suggestionTermsIgnoreStar = suggestionTerms.replace(/\*/g, "");
        var oTester = new SearchHelper.Tester(suggestionTermsIgnoreStar);
        for (var i = 0; i < dataSources.length; ++i) {
          var dataSource = dataSources[i];
          if (dataSource.id === this.model.getDataSource().id) {
            continue;
          }
          var oTestResult = oTester.test(dataSource.label);
          if (oTestResult.bMatch === true) {
            // limit number of suggestions
            if (this.isSuggestionLimitReached(UISuggestionType.DataSource)) {
              return;
            }

            // create suggestion
            var suggestion = {
              sina: this.sinaNext,
              label: "<i>" + i18n.getText("searchInPlaceholder", [""]) + "</i> " + oTestResult.sHighlightedText,
              dataSource: dataSource,
              position: UISuggestionTypeProperties.properties.DataSource.position,
              type: this.sinaNext.SuggestionType.DataSource,
              calculationMode: this.sinaNext.SuggestionCalculationMode.Data,
              uiSuggestionType: UISuggestionType.DataSource
            };
            this.addSuggestion(suggestion);
          }
        }
      }

      // check suggestion limit
      // ===================================================================
    }, {
      key: "isSuggestionLimitReached",
      value: function isSuggestionLimitReached(suggestionType) {
        var limit = this.suggestionHandler.getSuggestionLimit(suggestionType);
        var numberSuggestions = this.numberSuggestionsByType[suggestionType];
        if (numberSuggestions >= limit) {
          return true;
        }
        return false;
      }

      // preformat of suggestions: add ui position and ui suggestion type
      // ===================================================================
    }, {
      key: "preFormatSuggestions",
      value: function preFormatSuggestions(sinaSuggestions) {
        for (var i = 0; i < sinaSuggestions.length; ++i) {
          var sinaSuggestion = sinaSuggestions[i];
          var uiSuggestion = sinaSuggestion;
          // suggestion type
          uiSuggestion.uiSuggestionType = this.getSuggestionType(sinaSuggestion);
          // set position
          uiSuggestion.position = UISuggestionTypeProperties.properties[uiSuggestion.uiSuggestionType].position;
          // key
          this.assembleKey(uiSuggestion);
          // process children
          if (uiSuggestion.childSuggestions) {
            this.preFormatSuggestions(uiSuggestion.childSuggestions);
          }
        }
      }

      // assemble key
      // ===================================================================
    }, {
      key: "assembleKey",
      value: function assembleKey(sinaSuggestion) {
        switch (sinaSuggestion.uiSuggestionType) {
          case UISuggestionType.DataSource:
            sinaSuggestion.key = UISuggestionType.DataSource + sinaSuggestion.dataSource.id;
            break;
          case UISuggestionType.SearchTermData:
            sinaSuggestion.key = UISuggestionType.SearchTermData + sinaSuggestion.searchTerm;
            if (sinaSuggestion.dataSource) {
              sinaSuggestion.key += sinaSuggestion.dataSource.id;
            }
            break;
          case UISuggestionType.SearchTermHistory:
            sinaSuggestion.key = UISuggestionType.SearchTermData + sinaSuggestion.searchTerm; // use type SearchTermData : in ui history and data based suggestions are identical
            if (sinaSuggestion.dataSource) {
              sinaSuggestion.key += sinaSuggestion.dataSource.id;
            }
            break;
          case UISuggestionType.Object:
            {
              // const objKey = sinaSuggestion.object.title
              //     ? sinaSuggestion.object.title
              //     : sinaSuggestion.object.detailAttributes[0].value;
              // Does an object really have a title??
              var detailAttr = sinaSuggestion.object.detailAttributes[0];
              if (detailAttr instanceof SearchResultSetItemAttribute) {
                var objKey = detailAttr.value;
                sinaSuggestion.key = UISuggestionType.Object + objKey;
              }
              break;
            }
        }
      }

      // add sina suggestions
      // ===================================================================
    }, {
      key: "formatSinaSuggestions",
      value: function formatSinaSuggestions(sinaSuggestions) {
        // preprocess add ui position and key to all suggestions
        this.preFormatSuggestions(sinaSuggestions);

        // process suggestions
        for (var i = 0; i < sinaSuggestions.length; ++i) {
          var sinaSuggestion = sinaSuggestions[i];

          // limit number of suggestions
          if (this.isSuggestionLimitReached(sinaSuggestion.uiSuggestionType)) {
            continue;
          }

          // format according to type
          switch (sinaSuggestion.uiSuggestionType) {
            case UISuggestionType.DataSource:
              if (this.model.getDataSource() !== this.model.allDataSource && this.model.getDataSource() !== this.model.favDataSource) {
                continue;
              }
              //sinaSuggestion.label = /*<i>' + i18n.getText("searchInPlaceholder", [""]) + '</i> ' +*/ sinaSuggestion.label;
              this.addSuggestion(sinaSuggestion);
              break;
            case UISuggestionType.SearchTermData:
              this.formatSearchTermDataSuggestion(sinaSuggestion);
              break;
            case UISuggestionType.SearchTermHistory:
              this.addSuggestion(sinaSuggestion);
              break;
            case UISuggestionType.Object:
            case UISuggestionType.Transaction:
              {
                var sinaObjectSuggestion = _objectSpread(_objectSpread({}, sinaSuggestion), {}, {
                  dataSource: sinaSuggestion.object.dataSource,
                  object: sinaSuggestion.object
                });
                this.sinaObjectSuggestionFormatter.format(this, sinaObjectSuggestion);
                break;
              }
            default:
              break;
          }
        }
        return this.suggestions;
      }

      // add suggestion
      // ===================================================================
    }, {
      key: "addSuggestion",
      value: function addSuggestion(suggestion) {
        this.suggestions.push(suggestion);
        this.numberSuggestionsByType[suggestion.uiSuggestionType] += 1;
      }

      // format search term suggestion
      // ===================================================================
    }, {
      key: "formatSearchTermDataSuggestion",
      value: function formatSearchTermDataSuggestion(sinaSuggestion) {
        if (this.model.getDataSource() === this.model.allDataSource) {
          // 1. model datasource is all
          if (this.firstObjectDataSuggestion) {
            // 1.1 first suggestion (display also child suggestions)
            this.firstObjectDataSuggestion = false;
            if (sinaSuggestion.childSuggestions.length > 0) {
              sinaSuggestion.label = this.assembleSearchInSuggestionLabel(sinaSuggestion);
              sinaSuggestion.grouped = true;
              this.addSuggestion(sinaSuggestion);
              this.addChildSuggestions(sinaSuggestion);
            } else {
              this.addSuggestion(sinaSuggestion);
            }
          } else {
            // 1.2 subsequent suggestions (ignore child suggestions)
            this.addSuggestion(sinaSuggestion);
          }
        } else {
          // 2. model datasource is a connector
          this.addSuggestion(sinaSuggestion);
        }
      }

      // add child suggestions
      // ===================================================================
    }, {
      key: "addChildSuggestions",
      value: function addChildSuggestions(sinaSuggestion) {
        // max 2 child suggestions
        for (var i = 0; i < Math.min(2, sinaSuggestion.childSuggestions.length); ++i) {
          // check limit
          if (this.isSuggestionLimitReached(UISuggestionType.SearchTermData)) {
            return;
          }

          // add suggestion
          var sinaChildSuggestion = sinaSuggestion.childSuggestions[i];
          sinaChildSuggestion.label = this.assembleSearchInSuggestionLabel(sinaChildSuggestion);
          sinaChildSuggestion.grouped = true;
          this.addSuggestion(sinaChildSuggestion);
        }
      }

      // assemble search in suggestion label
      // ===================================================================
    }, {
      key: "assembleSearchInSuggestionLabel",
      value: function assembleSearchInSuggestionLabel(sinaSuggestion) {
        return i18n.getText("resultsIn", ["<span>" + sinaSuggestion.label + "</span>", sinaSuggestion.filter.dataSource.labelPlural]);
      }

      // get type of sina suggestion
      // ===================================================================
    }, {
      key: "getSuggestionType",
      value: function getSuggestionType(sinaSuggestion) {
        switch (sinaSuggestion.type) {
          case this.sinaNext.SuggestionType.SearchTerm:
            if (sinaSuggestion.calculationMode === this.sinaNext.SuggestionCalculationMode.History) {
              return UISuggestionType.SearchTermHistory;
            }
            return UISuggestionType.SearchTermData;
          case this.sinaNext.SuggestionType.SearchTermAndDataSource:
            if (sinaSuggestion.calculationMode === this.sinaNext.SuggestionCalculationMode.History) {
              return UISuggestionType.SearchTermHistory;
            }
            return UISuggestionType.SearchTermData;
          case this.sinaNext.SuggestionType.DataSource:
            return UISuggestionType.DataSource;
          case this.sinaNext.SuggestionType.Object:
            return UISuggestionType.Object;
        }
      }
    }]);
    return SinaSuggestionProvider;
  }(SinaBaseSuggestionProvider);
  return SinaSuggestionProvider;
});
})();