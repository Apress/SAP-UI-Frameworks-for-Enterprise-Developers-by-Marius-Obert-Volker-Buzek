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
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    const observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
const _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    const result = new _Pact();
    const state = this.s;
    if (state) {
      const callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        const value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
}
function _empty() {}
function _continueIgnored(value) {
  if (value && value.then) {
    return value.then(_empty);
  }
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _rethrow(thrown, value) {
  if (thrown) throw value;
  return value;
}
function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }
  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }
  return finalizer(false, result);
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
sap.ui.define(["../sinaNexTS/sina/DataSourceType", "./SuggestionType", "./SinaObjectSuggestionFormatter", "../flp/BackendSystem", "../flp/FrontendSystem"], function (___sinaNexTS_sina_DataSourceType, __SuggestionType, __Formatter, __BackendSystem, __FrontendSystem) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var DataSourceType = ___sinaNexTS_sina_DataSourceType["DataSourceType"];
  var SuggestionType = _interopRequireDefault(__SuggestionType);
  var Type = __SuggestionType["Type"];
  var Formatter = _interopRequireDefault(__Formatter);
  var BackendSystem = _interopRequireDefault(__BackendSystem);
  var FrontendSystem = _interopRequireDefault(__FrontendSystem);
  var TransactionSuggestionProvider = /*#__PURE__*/function () {
    function TransactionSuggestionProvider(params) {
      _classCallCheck(this, TransactionSuggestionProvider);
      _defineProperty(this, "suggestionFormatter", new Formatter());
      _defineProperty(this, "transactionSuggestions", []);
      this.model = params.model;
      this.suggestionHandler = params.suggestionHandler;
      this.suggestionLimit = sap.ui.Device.system.phone ? 5 : 7;
      this.sinaNext = this.model.sinaNext;
      this.suggestionQuery = this.sinaNext.createSuggestionQuery();
      this.transactionsDS = this.sinaNext.createDataSource({
        id: "CD$ALL~ESH_TRANSACTION~",
        label: "Transactions",
        type: DataSourceType.BusinessObject
      });
      this.suggestionStartingCharacters = this.model.config.suggestionStartingCharacters;
    }
    _createClass(TransactionSuggestionProvider, [{
      key: "abortSuggestions",
      value: function abortSuggestions() {
        this.suggestionQuery.abort();
      }

      // openTransactionSuggestion(tcode: string, startInNewWindow: boolean): void {
      //     const transactionSuggestion = this.suggestionHandler.autoSelectTransactionSuggestion(tcode);
      //     // const url = "#Shell-startGUI?sap-ui2-tcode=" + tcode;
      //     if (!transactionSuggestion) return;
      //     if (startInNewWindow) {
      //         window.open(transactionSuggestion.url, "_blank", "noopener,noreferrer");
      //     } else {
      //         if (window.hasher) {
      //             window.hasher.setHash(transactionSuggestion.url);
      //         } else {
      //             window.location.href = transactionSuggestion.url;
      //         }
      //     }
      // }
    }, {
      key: "getUrl",
      value: function getUrl(tCode) {
        var tCodeStartUrl = "#Shell-startGUI?sap-ui2-tcode=" + tCode;
        var eshBackendSystemInfo = BackendSystem.getSystem(this.model);
        if (eshBackendSystemInfo && !eshBackendSystemInfo.equals(FrontendSystem.getSystem())) {
          // add sid(XYZ.123) url parameter
          tCodeStartUrl = "#Shell-startGUI?sap-system=sid(".concat(eshBackendSystemInfo.id, ")&sap-ui2-tcode=").concat(tCode);
        }
        return tCodeStartUrl;
      }
    }, {
      key: "getSuggestions",
      value: function getSuggestions(filter) {
        try {
          const _this = this;
          var _userCategoryManager$;
          // check that BO search is enabled
          if (!_this.model.config.searchBusinessObjects) {
            return Promise.resolve([]);
          }
          var dataSource = _this.model.getDataSource();
          var userCategoryManager = _this.model.userCategoryManager;
          var favoritesIncludeApps = (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : userCategoryManager.isFavActive()) && (userCategoryManager === null || userCategoryManager === void 0 ? void 0 : (_userCategoryManager$ = userCategoryManager.getCategory("MyFavorites")) === null || _userCategoryManager$ === void 0 ? void 0 : _userCategoryManager$.includeApps);
          // check that datasource is all, apps or my favorites and my favorites include apps:
          if (dataSource !== _this.model.allDataSource && dataSource !== _this.model.appDataSource && !(dataSource === _this.model.favDataSource && favoritesIncludeApps)) {
            return Promise.resolve([]);
          }
          filter = filter.clone();
          var suggestionTerm = filter.searchTerm;
          if (suggestionTerm.toLowerCase().indexOf("/n") === 0 || suggestionTerm.toLowerCase().indexOf("/o") === 0) {
            suggestionTerm = suggestionTerm.slice(2);
            filter.searchTerm = suggestionTerm;
          }
          _this.transactionSuggestions = [];
          if (suggestionTerm.length < _this.suggestionStartingCharacters) {
            return Promise.resolve([]);
          }

          // prepare sina suggestion query
          _this.prepareSuggestionQuery(filter);
          return _await(_this.suggestionQuery.getResultSetAsync(), function (resultSet) {
            var sinaSuggestions = resultSet.items;

            // const inTransactions = i18n.getText("suggestion_in_transactions", [""]);

            // set type, datasource and position
            var _iterator = _createForOfIteratorHelper(sinaSuggestions),
              _step;
            return _continue(_finallyRethrows(function () {
              return _catch(function () {
                _iterator.s();
                return _continueIgnored(_for(function () {
                  return !(_step = _iterator.n()).done;
                }, void 0, function () {
                  var sinaSuggestion = _step.value;
                  var transactionSuggestion = {
                    uiSuggestionType: Type.Transaction,
                    dataSource: _this.transactionsDS,
                    position: SuggestionType.properties.Transaction.position,
                    key: sinaSuggestion.object.attributesMap.TCODE.value,
                    searchTerm: filter.searchTerm,
                    url: _this.getUrl(sinaSuggestion.object.attributesMap.TCODE.value),
                    icon: "sap-icon://generate-shortcut",
                    label: sinaSuggestion.object.attributesMap.TCDTEXT.valueHighlighted,
                    type: sinaSuggestion.type,
                    calculationMode: sinaSuggestion.calculationMode,
                    object: sinaSuggestion.object,
                    sina: sinaSuggestion.sina
                  };
                  return _await(sap.ushell.Container.getServiceAsync("CrossApplicationNavigation"), function (can) {
                    return _await(can.isNavigationSupported([{
                      target: {
                        shellHash: transactionSuggestion.url
                      }
                    }]), function (isSupported) {
                      if (isSupported[0].supported) {
                        _this.suggestionFormatter.format(_this, transactionSuggestion);
                      }
                    });
                  });
                })); // limit transaction suggestions
              }, function (err) {
                _iterator.e(err);
              });
            }, function (_wasThrown, _result) {
              _iterator.f();
              return _rethrow(_wasThrown, _result);
            }), function () {
              var transactionSuggestionLimit = _this.suggestionHandler.getSuggestionLimit(Type.Transaction);
              _this.transactionSuggestions = _this.transactionSuggestions.slice(0, transactionSuggestionLimit);
              return _this.transactionSuggestions;
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "addSuggestion",
      value: function addSuggestion(transactionSuggestion) {
        this.transactionSuggestions.push(transactionSuggestion);
      }
    }, {
      key: "prepareSuggestionQuery",
      value: function prepareSuggestionQuery(filter) {
        this.suggestionQuery.resetResultSet();
        this.suggestionQuery.setFilter(filter);
        this.suggestionQuery.setDataSource(this.transactionsDS);
        this.suggestionQuery.setTypes([this.sinaNext.SuggestionType.Object]);
        this.suggestionQuery.setCalculationModes([this.sinaNext.SuggestionCalculationMode.Data]);
        this.suggestionQuery.setTop(10);
      }
    }]);
    return TransactionSuggestionProvider;
  }();
  return TransactionSuggestionProvider;
});
})();