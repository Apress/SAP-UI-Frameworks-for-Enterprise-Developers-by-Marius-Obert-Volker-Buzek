/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../../sina/SinaObject", "../../../sina/AttributeType"], function (_____sina_SinaObject, _____sina_AttributeType) {
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
  /* eslint-disable @typescript-eslint/no-this-alias */
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SinaObject = _____sina_SinaObject["SinaObject"];
  var AttributeType = _____sina_AttributeType["AttributeType"];
  var _launchpadNavigation;
  if (typeof window !== "undefined" && typeof window.sap !== "undefined" && window.sap.ushell && window.sap.ushell.Container && window.sap.ushell.Container.getServiceAsync) {
    var oContainer = window.sap.ushell.Container;
    oContainer.getServiceAsync("SmartNavigation").then(function (service) {
      _launchpadNavigation = service;
    })["catch"](function () {
      oContainer.getServiceAsync("CrossApplicationNavigation").then(function (service) {
        _launchpadNavigation = service;
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  var FioriIntentsResolver = /*#__PURE__*/function (_SinaObject) {
    _inherits(FioriIntentsResolver, _SinaObject);
    var _super = _createSuper(FioriIntentsResolver);
    // private _launchpadNavigation: any;

    function FioriIntentsResolver(properties) {
      var _this;
      _classCallCheck(this, FioriIntentsResolver);
      _this = _super.call(this, properties);
      if (typeof window !== "undefined" && window.sap && window.sap.ushell && window.sap.ushell.Container) {
        _this._fioriFrontendSystemInfo = {
          systemId: window.sap.ushell.Container.getLogonSystem().getName(),
          client: window.sap.ushell.Container.getLogonSystem().getClient()
        };
        _this._primaryIntentAction = "-displayFactSheet";
        _this._suppressInSearchTag = "suppressInEnterpriseSearch".toLowerCase();
      } else {
        _this._fioriFrontendSystemInfo = {
          systemId: _this.getLogonSystem().getName(),
          client: _this.getLogonSystem().getClient()
        };
      }
      return _this;
    }

    /**
     * Resolves the given semantic object and semantic attributes to a list of
     * sap.ushell.renderers.fiori2.search.sinaNext.sina.sina.fiori.NavigationTargetForIntent
     * objects.
     *
     * @param {object|object[]} [vArgs]
     *   An object containing nominal arguments for the method, having the
     *   following structure:
     *   <pre>
     *   {
     *      semanticObjectType: "String",    // semantic object name
     *
     *      semanticObjectTypeAttributes: {  // semantic attributes
     *         A: "B",
     *         C: ["e", "j"]
     *      },
     *
     *      systemId: "String",              // optional: SID of system where the object data is hosted
     *      client: "String",                // optional: client of system where the object data is hosted
     *
     *      fallbackDefaultNavigationTarget: "sap.ushell.renderers.fiori2.search.sinaNext.sina.sina.NavigationTarget",
     *                                       // optional: fallback navigation target
     *   </pre>
     *
     *   This method supports a mass invocation interface to obtain multiple results
     *   with a single call. In this case the method expects an array of objects which
     *   have the same structure as described above.
     *   </pre>
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with an object that has the following structure:
     *   <pre>
     *   {
     *      defaultNavigationTarget: sap.ushell.renderers.fiori2.search.sinaNext.sina.sina.NavigationTarget    //optional
     *      navigationTargets: [ sap.ushell.renderers.fiori2.search.sinaNext.sina.sina.NavigationTarget ]   //optional
     *   }
     *   </pre>
     *
     *   <p>
     *   NOTE: in case the mass invocation interface is used the promise will resolve
     *   to an array of objects which have the same structure as described above. The
     *   objects in the returned array will be in the same order as the corresponding
     *   objects were in the input array.
     *   </p>
     *
     * @public
     */
    _createClass(FioriIntentsResolver, [{
      key: "resolveIntents",
      value: function resolveIntents(vArgs) {
        var that = this;
        if (!_launchpadNavigation || !vArgs) {
          return Promise.resolve({
            defaultNavigationTarget: vArgs.fallbackDefaultNavigationTarget
          });
        }
        if (Array.isArray(vArgs)) {
          var proms = [];
          for (var k = 0; k < vArgs.length; k++) {
            var prom = that._doResolveIntents(vArgs[k]);
            proms.push(prom);
          }
          return Promise.all(proms);
        }
        return that._doResolveIntents(vArgs);
      }
    }, {
      key: "_doResolveIntents",
      value: function _doResolveIntents(vArgs) {
        var that = this;
        var semanticObjectType = vArgs.semanticObjectType;
        var semanticObjectTypeAttrs = vArgs.semanticObjectTypeAttributes;
        var systemId = vArgs.systemId;
        var client = vArgs.client;
        var fallbackDefaultNavigationTarget = vArgs.fallbackDefaultNavigationTarget;
        if (!semanticObjectType || semanticObjectType.length === 0) {
          return Promise.resolve({
            defaultNavigationTarget: fallbackDefaultNavigationTarget
          });
        }
        if (!semanticObjectTypeAttrs || semanticObjectTypeAttrs.length === 0) {
          return Promise.resolve();
        }
        var semanticObjectTypeAttrsAsParams = {};
        var value;
        for (var i = 0; i < semanticObjectTypeAttrs.length; i++) {
          value = this.convertAttributeValueToUI5DataTypeFormats(semanticObjectTypeAttrs[i].value, semanticObjectTypeAttrs[i].type);
          semanticObjectTypeAttrsAsParams[semanticObjectTypeAttrs[i].name] = value;
        }
        var sapSystem = {
          systemId: systemId || that._fioriFrontendSystemInfo && that._fioriFrontendSystemInfo.systemId,
          client: client || that._fioriFrontendSystemInfo.client && that._fioriFrontendSystemInfo.client
        };

        // Set sap-system parameter if:
        // 0) we run on cFLP in the cloud which is indicated by the global variable sap.cf
        // 1) systemId or client from search response are not undefined or empty
        // 2) fioriFrontendSystemInfo is *NOT* set
        // 3) fioriFrontendSystemInfo is set, but it contains different systemId and client info than the search response
        if (window.sap && window.sap.cf || systemId && systemId.trim().length > 0 && client && client.trim().length > 0 && (
        // 1)
        !that._fioriFrontendSystemInfo ||
        // 2)
        !(that._fioriFrontendSystemInfo.systemId === systemId && that._fioriFrontendSystemInfo.client === client))) {
          // 3)
          sapSystem.urlParameter = "sap-system=sid(" + systemId + "." + client + ")";
        }
        var primaryIntentProm = new Promise(function (resolve) {
          if (_launchpadNavigation && _launchpadNavigation.getPrimaryIntent) {
            that.convertJQueryDeferredToPromise(_launchpadNavigation.getPrimaryIntent(semanticObjectType, semanticObjectTypeAttrsAsParams)).then(function (primaryIntent) {
              resolve(primaryIntent);
            })["catch"](function () {
              resolve();
            });
          } else {
            resolve();
          }
        });
        var intentsOuterProm = new Promise(function (resolve) {
          var intentsProm;
          if (_launchpadNavigation && _launchpadNavigation.getLinks) {
            intentsProm = _launchpadNavigation.getLinks({
              semanticObject: semanticObjectType,
              params: semanticObjectTypeAttrsAsParams,
              withAtLeastOneUsedParam: true,
              sortResultOnTexts: true
            });
          } else {
            intentsProm = _launchpadNavigation.getSemanticObjectLinks(semanticObjectType, semanticObjectTypeAttrsAsParams);
          }
          that.convertJQueryDeferredToPromise(intentsProm).then(function (intents) {
            resolve(intents);
          })["catch"](function () {
            resolve();
          });
        });
        return Promise.all([primaryIntentProm, intentsOuterProm]).then(function (values) {
          var i;
          var primaryIntent = values[0];
          var intent;
          var intents = values[1];
          var navigationTarget;
          var result = {
            navigationTargets: []
          };
          var defaultNavigationTarget;
          if (primaryIntent && !that._shallIntentBeSuppressed(primaryIntent)) {
            defaultNavigationTarget = that._getNavigationTargetForIntent(primaryIntent, sapSystem);
            result.defaultNavigationTarget = defaultNavigationTarget;
          }
          var foundPrimaryIntent = result.defaultNavigationTarget !== undefined;
          result.navigationTargets = [];
          if (intents) {
            for (i = 0; i < intents.length; i++) {
              intent = intents[i];
              if (that._shallIntentBeSuppressed(intent)) {
                continue;
              }
              navigationTarget = that._getNavigationTargetForIntent(intent, sapSystem);
              if (!foundPrimaryIntent && intent.intent.substring(intent.intent.indexOf("-"), intent.intent.indexOf("?")) === that._primaryIntentAction) {
                result.defaultNavigationTarget = navigationTarget;
                foundPrimaryIntent = true;
              } else if (!defaultNavigationTarget || !navigationTarget.isEqualTo(defaultNavigationTarget)) {
                result.navigationTargets.push(navigationTarget);
              }
            }
          }
          return result;
        });
      }
    }, {
      key: "_shallIntentBeSuppressed",
      value: function _shallIntentBeSuppressed(intent) {
        if (intent.tags) {
          for (var i = 0; i < intent.tags.length; i++) {
            if (intent.tags[i].toLowerCase() === this._suppressInSearchTag) {
              return true;
            }
          }
        }
        return false;
      }
    }, {
      key: "_getNavigationTargetForIntent",
      value: function _getNavigationTargetForIntent(intent, sapSystem) {
        var that = this;
        var shellHash = intent.intent;
        if (sapSystem.urlParameter) {
          if (shellHash.indexOf("?") === -1) {
            shellHash += "?";
          } else {
            shellHash += "&";
          }
          shellHash += sapSystem.urlParameter;
        }
        var externalTarget = {
          target: {
            shellHash: shellHash
          }
        };
        var externalHash = _launchpadNavigation.hrefForExternal(externalTarget);
        var navigationObject = that.sina._createNavigationTargetForIntent({
          label: intent.text,
          targetUrl: externalHash,
          externalTarget: externalTarget,
          systemId: sapSystem.systemId,
          client: sapSystem.client
        });
        return navigationObject;
      }
    }, {
      key: "convertAttributeValueToUI5DataTypeFormats",
      value: function convertAttributeValueToUI5DataTypeFormats(value, sinaAttributeType) {
        var year, month, day, hour, minute, seconds, microseconds;
        switch (sinaAttributeType) {
          case AttributeType.Timestamp:
            // sina: JavaScript Date object
            // UI5: "YYYY-MM-DDTHH:MM:SS.mmm"
            year = value.getUTCFullYear();
            month = value.getUTCMonth() + 1;
            day = value.getUTCDate();
            hour = value.getUTCHours();
            minute = value.getUTCMinutes();
            seconds = value.getUTCSeconds();
            microseconds = value.getUTCMilliseconds() * 1000;
            value = this.addLeadingZeros(year.toString(), 4) + "-" + this.addLeadingZeros(month.toString(), 2) + "-" + this.addLeadingZeros(day.toString(), 2) + "T" + this.addLeadingZeros(hour.toString(), 2) + ":" + this.addLeadingZeros(minute.toString(), 2) + ":" + this.addLeadingZeros(seconds.toString(), 2) + "." + this.addLeadingZeros(microseconds.toString(), 3);
            break;
          case AttributeType.Date:
            // sina: JavaScript Date object
            // UI5: "YYYY-MM-DD"
            value = value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
            break;
        }
        return value;
      }
    }, {
      key: "addLeadingZeros",
      value: function addLeadingZeros(value, length) {
        return "00000000000000".slice(0, length - value.length) + value;
      }
    }, {
      key: "getLogonSystem",
      value: function getLogonSystem() {
        return {
          getName: function getName() {
            return;
          },
          getClient: function getClient() {
            return;
          },
          getPlatform: function getPlatform() {
            return;
          }
        };
      }

      // =======================================================================
      // convert jquery to promise
      // =======================================================================
    }, {
      key: "convertJQueryDeferredToPromise",
      value: function convertJQueryDeferredToPromise(deferred) {
        if (deferred.always) {
          // is deferred, convert needed
          return new Promise(function (resolve, reject) {
            deferred.then(resolve, reject);
          });
        } else {
          // is promise, convert not needed
          return deferred;
        }
      }
    }]);
    return FioriIntentsResolver;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.FioriIntentsResolver = FioriIntentsResolver;
  return __exports;
});
})();