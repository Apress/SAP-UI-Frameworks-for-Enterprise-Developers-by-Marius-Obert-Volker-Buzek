/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/controls/SearchResultListSelectionHandler", "./controls/SearchResultListItemNote", "./SearchConfigurationSettings", "sap/base/Log", "sap/base/assert"], function (SearchResultListSelectionHandler, __SearchResultListItemNote, __SearchConfigurationSettings, Log, assert) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  var SearchResultListItemNote = _interopRequireDefault(__SearchResultListItemNote);
  var SearchConfigurationSettings = _interopRequireDefault(__SearchConfigurationSettings);
  var defaultSearchConfigurationSettings = __SearchConfigurationSettings["defaultSearchConfigurationSettings"];
  var deprecatedParameters = __SearchConfigurationSettings["deprecatedParameters"];
  var SearchConfiguration = /*#__PURE__*/function (_SearchConfigurationS) {
    _inherits(SearchConfiguration, _SearchConfigurationS);
    var _super = _createSuper(SearchConfiguration);
    /*private dataSourceConfigurations: {
        noteprocessorurl?: { searchResultListItem?: any; searchResultListSelectionHandler?: any };
    };*/

    /**
     * @this SearchConfiguration
     * @constructor
     */
    function SearchConfiguration(configuration) {
      var _this;
      _classCallCheck(this, SearchConfiguration);
      _this = _super.call(this);
      _defineProperty(_assertThisInitialized(_this), "log", Log.getLogger("sap.esh.search.ui.SearchConfiguration"));
      _defineProperty(_assertThisInitialized(_this), "dataSourceConfigurations_Regexes", []);
      _defineProperty(_assertThisInitialized(_this), "defaultDataSourceConfig", {
        searchResultListItem: undefined,
        searchResultListItemControl: undefined,
        searchResultListItemContent: undefined,
        searchResultListItemContentControl: undefined,
        searchResultListSelectionHandler: SearchResultListSelectionHandler["getMetadata"]().getName(),
        // ToDo
        searchResultListSelectionHandlerControl: SearchResultListSelectionHandler
      });
      jQuery.extend(_assertThisInitialized(_this), configuration);
      if (_this.isUshell) {
        _this.readUshellConfiguration();
        _this.readOutdatedUshellConfiguration();
      }
      _this.updateConfigFromUrlParameters();
      _this.initDataSourceConfig();
      _this.setModulePaths();
      _this.setSinaLanguageDefault();
      _this.checkForDeprecatedParameters();
      return _this;
    }
    _createClass(SearchConfiguration, [{
      key: "checkForDeprecatedParameters",
      value: function checkForDeprecatedParameters() {
        for (var parameter in deprecatedParameters) {
          if (parameter in this) {
            var msg = "You are using a deprecated configuration property for SearchCompositeControl which will be removed in a future release: '" + parameter + "'. ";
            if (deprecatedParameters[parameter] in this) {
              // there is a replacement
              this[deprecatedParameters[parameter]] = this[parameter]; // assign value of deprecated to new
              msg += "Please use '" + deprecatedParameters[parameter] + "' instead.";
            }
            assert(false, msg);
          }
        }
      }
    }, {
      key: "setSinaLanguageDefault",
      value: function setSinaLanguageDefault() {
        if (this.isUshell) {
          return;
        }
        if (this.sinaConfiguration && !this.sinaConfiguration.getLanguage) {
          var getLanguageFunction = function getLanguageFunction() {
            return sap.ui.getCore().getConfiguration().getLanguage();
          };
          this.sinaConfiguration["getLanguage"] = getLanguageFunction;
        }
      }
    }, {
      key: "setModulePaths",
      value: function setModulePaths() {
        if (!this.modulePaths) {
          return;
        }
        for (var i = 0; i < this.modulePaths.length; ++i) {
          var modulePath = this.modulePaths[i];
          var urlPrefix = modulePath.urlPrefix.replace("${host}", window.location.protocol + "//" + window.location.host);
          jQuery.sap.registerModulePath(modulePath.moduleName, urlPrefix);
        }
      }
    }, {
      key: "readUshellConfiguration",
      value: function readUshellConfiguration() {
        // read global config
        try {
          var config = window["sap-ushell-config"].renderers.fiori2.componentData.config.esearch;
          jQuery.extend(true, this, config);
        } catch (e) {
          /* nothing to do.. */
        }
      }
    }, {
      key: "readOutdatedUshellConfiguration",
      value: function readOutdatedUshellConfiguration() {
        try {
          // get config
          var config = window["sap-ushell-config"].renderers.fiori2.componentData.config;

          // due to historical reasons the config parameter searchBusinessObjects is not in esearch but in parent object
          // copy this parameter to config object
          if (typeof config.searchBusinessObjects !== "undefined") {
            if (config.searchBusinessObjects === "hidden" || config.searchBusinessObjects === false) {
              this.searchBusinessObjects = false;
            } else {
              this.searchBusinessObjects = true;
            }
          }
        } catch (e) {
          /* nothing to do.. */
        }
      }
    }, {
      key: "initDataSourceConfig",
      value: function initDataSourceConfig() {
        // Prepare caching map for custom datasource configurations
        this.dataSourceConfigurations = {};
        this.dataSourceConfigurations_Regexes = []; // eslint-disable-line camelcase

        if (this.dataSources) {
          for (var i = 0; i < this.dataSources.length; i++) {
            var dataSourceConfig = this.dataSources[i];
            if (dataSourceConfig.id) {
              this.dataSourceConfigurations[dataSourceConfig.id] = dataSourceConfig;
            } else if (dataSourceConfig.regex) {
              var flags = dataSourceConfig.regexFlags || undefined;
              var regexObject = new RegExp(dataSourceConfig.regex, flags);
              if (regexObject) {
                dataSourceConfig.regexObject = regexObject;
                this.dataSourceConfigurations_Regexes.push(dataSourceConfig);
              }
            } else {
              var message = "Following datasource configuration does neither include a valid id nor a regular expression, therefore it is ignored:\n" + JSON.stringify(dataSourceConfig);
              this.log.warning(message);
            }
          }
        }
        this.dataSources = undefined;

        // Special logic for Document Result List Item
        this.documentDataSourceConfiguration = {
          searchResultListItem: "sap.esh.search.ui.controls.SearchResultListItemDocument"
        };

        // Special logic for Note Result List Item
        var dataSourceConfiguration = this.dataSourceConfigurations.noteprocessorurl || {};
        this.dataSourceConfigurations.noteprocessorurl = dataSourceConfiguration;
        this.dataSourceConfigurations.noteprocessorurl.searchResultListItemControl = this.dataSourceConfigurations.noteprocessorurl.searchResultListItemControl || new SearchResultListItemNote();
        this.dataSourceConfigurations.noteprocessorurl.searchResultListSelectionHandler = this.dataSourceConfigurations.noteprocessorurl.searchResultListSelectionHandler || "sap.esh.search.ui.controls.SearchResultListSelectionHandlerNote";
      }
    }, {
      key: "getParameterType",
      value: function getParameterType(parameterName) {
        if (parameterName in deprecatedParameters) {
          if (deprecatedParameters[parameterName]) {
            // if there a replacement use type from replacement
            parameterName = deprecatedParameters[parameterName];
          } else {
            return "string"; // just return something so that following logic for printing outdated message works.
          }
        }

        // eslint-disable-next-line no-prototype-builtins
        if (!defaultSearchConfigurationSettings.hasOwnProperty(parameterName)) {
          return "";
        }
        return _typeof(defaultSearchConfigurationSettings[parameterName]);
      }
    }, {
      key: "parseBoolean",
      value: function parseBoolean(value) {
        if (value.toLowerCase() === "true") {
          return true;
        }
        return false;
      }
    }, {
      key: "parseEsDevConfig",
      value: function parseEsDevConfig(value) {
        var config = JSON.parse(value);
        jQuery.extend(this, config);
      }
    }, {
      key: "updateConfigFromUrlParameters",
      value: function updateConfigFromUrlParameters() {
        var urlParameters = this.parseUrlParameters();
        for (var parameterName in urlParameters) {
          var parameterValue = urlParameters[parameterName];
          var parameterType = this.getParameterType(parameterName);

          // ignore sina url parameters (these parameters are handled by sina itself, see sinaFactory)
          if (parameterName.startsWith("sina")) {
            continue;
          }

          // special handling for parameter demoMode
          if (parameterName === "demoMode") {
            this.searchBusinessObjects = true;
            continue;
          }

          // special handling for parameter resultViewTypes
          if (parameterName === "resultViewTypes") {
            var resultViewTypes = parameterValue.split(","); // convert to array
            resultViewTypes = resultViewTypes.filter(function (resultViewType) {
              return resultViewType.length > 0;
            }); // remove empty element
            this.resultViewTypes = resultViewTypes;
            continue;
          }

          // special handling for parameter esDevConfig
          if (parameterName === "esDevConfig") {
            this.parseEsDevConfig(parameterValue);
            continue;
          }

          // default parameter handling
          switch (parameterType) {
            case "string":
              this[parameterName] = parameterValue;
              break;
            case "number":
              this[parameterName] = parseInt(parameterValue);
              break;
            case "boolean":
              this[parameterName] = this.parseBoolean(parameterValue);
              break;
            default:
            // ignore
          }
        }
      }
    }, {
      key: "parseUrlParameters",
      value: function parseUrlParameters() {
        if (!URLSearchParams) {
          return {};
        }
        var urlSearchParams = new URLSearchParams(window.location.search);
        return Object.fromEntries(urlSearchParams.entries());
      }

      // use this as an early initialization routine
    }, {
      key: "loadCustomModulesAsync",
      value: function loadCustomModulesAsync() {
        if (this._loadCustomModulesProm) {
          return this._loadCustomModulesProm;
        }
        var dataSourceConfigurationProm;
        var dataSourceConfigurationsProms = [];
        for (var dataSourceId in this.dataSourceConfigurations) {
          dataSourceConfigurationProm = this.loadCustomModulesForDataSourceIdAsync(dataSourceId);
          dataSourceConfigurationsProms.push(dataSourceConfigurationProm);
        }
        this._loadCustomModulesProm = Promise.all(dataSourceConfigurationsProms);
        return this._loadCustomModulesProm;
      }
    }, {
      key: "loadCustomModulesForDataSourcesAsync",
      value: function loadCustomModulesForDataSourcesAsync(dataSources, dataSourcesHints) {
        try {
          const _this2 = this;
          var dataSourcesLoadingProms = [];
          for (var i = 0; i < dataSources.length; i++) {
            var dataSourceHints = Array.isArray(dataSourcesHints) && dataSourcesHints.length > i && dataSourcesHints[i] || {};
            var dataSourceLoadingProm = _this2.loadCustomModulesForDataSourceAsync(dataSources[i], dataSourceHints);
            dataSourcesLoadingProms.push(dataSourceLoadingProm);
          }
          return Promise.all(dataSourcesLoadingProms);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "loadCustomModulesForDataSourceAsync",
      value: function loadCustomModulesForDataSourceAsync(dataSource) {
        var dataSourceHints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        dataSourceHints = dataSourceHints || {};
        return this.loadCustomModulesForDataSourceIdAsync(dataSource.id, dataSourceHints);
      }
    }, {
      key: "loadCustomModulesForDataSourceIdAsync",
      value: function loadCustomModulesForDataSourceIdAsync(dataSourceId, dataSourceHints) {
        if (!dataSourceId) {
          return Promise.resolve();
        }
        this._dataSourceLoadingProms = this._dataSourceLoadingProms || {};
        var dataSourceLoadingProm = this._dataSourceLoadingProms[dataSourceId];
        if (!dataSourceLoadingProm) {
          var customControlAttrNames = [{
            moduleAttrName: "searchResultListItem",
            controlAttrName: "searchResultListItemControl"
          }, {
            moduleAttrName: "searchResultListItemContent",
            controlAttrName: "searchResultListItemContentControl"
          }, {
            moduleAttrName: "searchResultListSelectionHandler",
            controlAttrName: "searchResultListSelectionHandlerControl"
          }];
          var dataSourceConfiguration = this._prepareDataSourceConfigurationForDataSource(dataSourceId, dataSourceHints);
          var customControlProm;
          var customControlProms = [];
          for (var i = 0; i < customControlAttrNames.length; i++) {
            customControlProm = this._doLoadCustomModulesAsync(dataSourceId, dataSourceConfiguration, customControlAttrNames[i].moduleAttrName, customControlAttrNames[i].controlAttrName);
            customControlProms.push(customControlProm);
          }
          dataSourceLoadingProm = Promise.all(customControlProms);
          dataSourceLoadingProm._resolvedOrFailed = false;
          dataSourceLoadingProm.then(function () {
            dataSourceLoadingProm._resolvedOrFailed = true;
          });
          this._dataSourceLoadingProms[dataSourceId] = dataSourceLoadingProm;
        }
        return dataSourceLoadingProm;
      }

      // Helper function to keep 'dataSourceConfiguration' instance unchanged within
      // its scope while the main function loops over all instances
    }, {
      key: "_doLoadCustomModulesAsync",
      value: function _doLoadCustomModulesAsync(dataSourceId, dataSourceConfiguration, moduleAttrName, controlAttrName, defaultModuleName, defaultControl) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        return new Promise(function (resolve) {
          if (dataSourceConfiguration[moduleAttrName] && (!dataSourceConfiguration[controlAttrName] || dataSourceConfiguration[controlAttrName] == that.defaultDataSourceConfig[controlAttrName])) {
            try {
              sap.ui.require([dataSourceConfiguration[moduleAttrName].replace(/[.]/g, "/")], function (customControl) {
                dataSourceConfiguration[controlAttrName] = customControl;
                resolve();
              });
            } catch (e) {
              var message = "Could not load custom module '" + dataSourceConfiguration[moduleAttrName] + "' for data source with id '" + dataSourceId + "'. ";
              message += "Falling back to default data source configuration.";
              that.log.warning(message);
              dataSourceConfiguration[moduleAttrName] = defaultModuleName || that.defaultDataSourceConfig[moduleAttrName];
              dataSourceConfiguration[controlAttrName] = defaultControl || that.defaultDataSourceConfig[controlAttrName];
              resolve();
            }
          } else {
            if (!dataSourceConfiguration[controlAttrName]) {
              dataSourceConfiguration[moduleAttrName] = defaultModuleName || that.defaultDataSourceConfig[moduleAttrName];
              dataSourceConfiguration[controlAttrName] = defaultControl || that.defaultDataSourceConfig[controlAttrName];
            }
            resolve();
          }
        });
      }
    }, {
      key: "getDataSourceConfig",
      value: function getDataSourceConfig(dataSource) {
        if (this._dataSourceLoadingProms && this._dataSourceLoadingProms[dataSource.id] && !this._dataSourceLoadingProms[dataSource.id]._resolvedOrFailed) {
          // Return the default data source if the custom modules
          // for this particular data source aren't loaded yet.
          return this.defaultDataSourceConfig;
        }
        var config = this.dataSourceConfigurations[dataSource.id];
        if (!config) {
          config = this.defaultDataSourceConfig;
          this.dataSourceConfigurations[dataSource.id] = config;
        }
        return config;
      }
    }, {
      key: "_prepareDataSourceConfigurationForDataSource",
      value: function _prepareDataSourceConfigurationForDataSource(dataSourceId, dataSourcesHints) {
        var dataSourceConfiguration = {};
        if (this.dataSourceConfigurations[dataSourceId]) {
          dataSourceConfiguration = this.dataSourceConfigurations[dataSourceId];
        } else {
          for (var i = 0; i < this.dataSourceConfigurations_Regexes.length; i++) {
            if (this.dataSourceConfigurations_Regexes[i].regexObject.test(dataSourceId)) {
              dataSourceConfiguration = this.dataSourceConfigurations_Regexes[i];
              break;
            }
          }
        }

        // Use SearchResultListItemDocument control for document-like objects.
        // Can be overriden by another control in ushell configuration.
        if (dataSourcesHints && dataSourcesHints.isDocumentConnector) {
          if (!dataSourceConfiguration.searchResultListItem) {
            dataSourceConfiguration.searchResultListItem = this.documentDataSourceConfiguration.searchResultListItem;
          } else {
            var message = "Will attempt to load '" + dataSourceConfiguration.searchResultListItem + "' instead of '" + this.documentDataSourceConfiguration.searchResultListItem + "' for data source '" + dataSourceId + "'";
            this.log.warning(message);
          }
        }
        this.dataSourceConfigurations[dataSourceId] = dataSourceConfiguration;
        return dataSourceConfiguration;
      }
    }]);
    return SearchConfiguration;
  }(SearchConfigurationSettings);
  return SearchConfiguration;
});
})();