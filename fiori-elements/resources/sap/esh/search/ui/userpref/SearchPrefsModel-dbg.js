/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/ui/model/json/JSONModel"], function (__i18n, JSONModel) {
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
  // model class for search preferences view
  // =======================================================================
  var SearchPrefsModel = /*#__PURE__*/function (_JSONModel) {
    _inherits(SearchPrefsModel, _JSONModel);
    var _super = _createSuper(SearchPrefsModel);
    function SearchPrefsModel() {
      _classCallCheck(this, SearchPrefsModel);
      return _super.apply(this, arguments);
    }
    _createClass(SearchPrefsModel, [{
      key: "asyncInit",
      value:
      //const path = "sap.esh.search.ui.userpref.SearchPrefsModel";
      function asyncInit() {
        var _this = this;
        // check cache
        if (this.initializePromise) {
          return this.initializePromise;
        }

        // get search model and call init
        this.searchModel = sap.esh.search.ui.getModelSingleton({}, "flp");
        this.initializePromise = this.searchModel.initAsync().then(function () {
          if (!_this.searchModel.config.searchBusinessObjects) {
            _this.setProperty("/isSearchPrefsActive", false);
            _this.setProperty("/isPersonalizedSearchEditable", false);
            _this.setProperty("/personalizedSearch", false);
            _this.setProperty("/resetButtonWasClicked", false);
            return undefined;
          }
          _this.setProperty("/isSearchPrefsActive", true);
          _this.setProperty("/isMyFavoritesAvailable", _this.searchModel.isMyFavoritesAvailable());
          var sinaNext = _this.searchModel.sinaNext;
          if (_this.searchModel.isMyFavoritesAvailable()) {
            _this.initSubDataSources();
          }

          // set property for visibility of Personalized Search area (oPersSearchVBox)
          // not visible in case of cross system search
          _this.setProperty("/isPersonalizedSearchAreaVisible", sinaNext.provider.id === "multi" ? false : true);
          return sinaNext.getConfigurationAsync({
            forceReload: true
          }).then(function (configuration) {
            _this.configuration = configuration;
            _this.setProperty("/isPersonalizedSearchEditable", configuration.isPersonalizedSearchEditable);
            _this.setProperty("/personalizedSearch", configuration.personalizedSearch);
            _this.setProperty("/resetButtonWasClicked", false);
          });
        });
        return this.initializePromise;
      }
    }, {
      key: "reload",
      value: function reload() {
        return this.asyncInit();
      }
    }, {
      key: "initSubDataSources",
      value: function initSubDataSources() {
        var _this2 = this;
        var newDS = [];
        this.searchModel.getUserCategoryManager().then(function (userCategoryManager) {
          _this2.userCategoryManager = userCategoryManager;
          _this2.userCategory = userCategoryManager.getCategory("MyFavorites");
          // get datasources from sina
          var dataSources = _this2.searchModel.sinaNext.dataSources;
          dataSources.filter(function (x) {
            return (x.type === _this2.searchModel.sinaNext.DataSourceType.BusinessObject || x === _this2.searchModel.appDataSource) && x.id !== "CD$ALL~ESH_TRANSACTION~";
          }).forEach(function (x) {
            if (x === _this2.searchModel.appDataSource) {
              newDS.unshift({
                id: x.id,
                label: x.labelPlural,
                selected: _this2.userCategory.isIncludeApps(),
                undefined: false
              });
            } else {
              newDS.push({
                id: x.id,
                label: x.labelPlural,
                selected: _this2.userCategory.hasSubDataSource(x.id),
                undefined: false
              });
            }
          });

          // add undefinedSubDataSources to the top of the list
          var undefinedSubDataSources = _this2.userCategory.getUndefinedSubDataSourceIds().reverse();
          var _iterator = _createForOfIteratorHelper(undefinedSubDataSources),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var undefinedSubDataSource = _step.value;
              newDS.unshift({
                id: undefinedSubDataSource,
                label: undefinedSubDataSource + " " + i18n.getText("sp.connectorNotExists"),
                selected: true,
                undefined: true
              });
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          _this2.setProperty("/favActive", _this2.userCategoryManager.isFavActive());
          _this2.setProperty("/subDataSources", newDS);
          _this2.setProperty("/dataSourceCount", _this2.getNumberSubDataSources());
          _this2.setProperty("/selectedDataSourceCount", _this2.getNumberSelectedSubDataSources());
        });
      }
    }, {
      key: "getNumberSubDataSources",
      value: function getNumberSubDataSources() {
        return this.getProperty("/subDataSources").length;
      }
    }, {
      key: "getNumberSelectedSubDataSources",
      value: function getNumberSelectedSubDataSources() {
        return this.getProperty("/subDataSources").filter(function (x) {
          return x.selected;
        }).length; //x.selected === true)
      }
    }, {
      key: "saveSubDataSources",
      value: function saveSubDataSources() {
        var subDataSources = this.getProperty("/subDataSources");
        this.userCategory.setIncludeApps(false);
        this.userCategoryManager.setFavActive(this.getProperty("/favActive"));
        this.userCategory.clearSubDataSources();
        this.userCategory.clearUndefinedSubDataSourceIds();
        var _iterator2 = _createForOfIteratorHelper(subDataSources),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var subDataSource = _step2.value;
            if (subDataSource.selected === true) {
              if (subDataSource.id === this.searchModel.appDataSource.id) {
                this.userCategory.setIncludeApps(true);
              } else {
                var sinaSubDataSource = this.userCategoryManager.sina.getDataSource(subDataSource.id);
                if (sinaSubDataSource) {
                  this.userCategory.addSubDataSource(sinaSubDataSource);
                } else {
                  this.userCategory.addUndefinedSubDataSourceId(subDataSource.id);
                }
              }
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        this.userCategoryManager.save();
      }

      //not used in future -> delete
    }, {
      key: "shortStatus",
      value: function shortStatus() {
        var _this3 = this;
        return this.asyncInit().then(function () {
          return _this3.getProperty("/personalizedSearch") ? i18n.getText("sp.on") : i18n.getText("sp.off");
        });
      }
    }, {
      key: "isPersonalizedSearchActive",
      value: function isPersonalizedSearchActive() {
        var _this4 = this;
        return this.asyncInit().then(function () {
          return _this4.getProperty("/personalizedSearch");
        });
      }
    }, {
      key: "isSearchPrefsActive",
      value: function isSearchPrefsActive() {
        var _this5 = this;
        return this.asyncInit().then(function () {
          return _this5.getProperty("/isSearchPrefsActive");
        });
      }
    }, {
      key: "isMultiProvider",
      value: function isMultiProvider() {
        var _this6 = this;
        return this.asyncInit().then(function () {
          return _this6.searchModel.sinaNext.provider.id === "multi";
        });
      }
    }, {
      key: "savePreferences",
      value: function savePreferences() {
        var _this7 = this;
        if (this.searchModel.isMyFavoritesAvailable()) {
          this.saveSubDataSources();
        }
        if (this.configuration.isPersonalizedSearchEditable) {
          this.configuration.setPersonalizedSearch(this.getProperty("/personalizedSearch"));
          return this.configuration.saveAsync().then(function () {
            _this7.setProperty("/resetButtonWasClicked", false);
          });
        } else {
          this.setProperty("/resetButtonWasClicked", false);
          return Promise.resolve();
        }
      }
    }, {
      key: "cancelPreferences",
      value: function cancelPreferences() {
        this.setProperty("/personalizedSearch", this.configuration.personalizedSearch);
        this.setProperty("/resetButtonWasClicked", false);
      }
    }, {
      key: "resetProfile",
      value: function resetProfile() {
        var _this8 = this;
        return this.configuration.resetPersonalizedSearchDataAsync().then(function () {
          _this8.setProperty("/resetButtonWasClicked", true);
        });
      }
    }]);
    return SearchPrefsModel;
  }(JSONModel);
  return SearchPrefsModel;
});
})();