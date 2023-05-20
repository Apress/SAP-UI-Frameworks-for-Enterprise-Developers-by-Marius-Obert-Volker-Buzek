/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../../sina/SinaObject"], function (_____sina_SinaObject) {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  /* global $ */
  var SinaObject = _____sina_SinaObject["SinaObject"];
  /*
  var curTheme = "";
  var getCurrentTheme = function () {
      if (!curTheme) {
          curTheme = getTheme();
      }
      return curTheme;
  };
  */
  var getTheme = function getTheme() {
    var themes = [];
    $.each(document.styleSheets, function (index, cssFile) {
      if (cssFile.href) {
        var fname = cssFile.href.toString();
        var regex = /themes\/(.+)\/library.css/;
        var matches = regex.exec(fname);
        if (matches !== null) {
          themes.push(matches[1]);
          return false; //jquery syntax for 'break'
        }
      }

      return true;
    });
    return themes[0];
  };
  var addThemeToURL = function addThemeToURL(url) {
    var res = url;
    var theme = getTheme();
    if (!theme) {
      return res;
    }
    theme = "sap-theme=" + theme + "&";
    if (url.indexOf("sap-theme=") === -1) {
      if (url.indexOf("?") !== -1) {
        res = url.replace("?", "?" + theme);
      }
    }
    return res;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  var SuvNavTargetResolver = /*#__PURE__*/function (_SinaObject) {
    _inherits(SuvNavTargetResolver, _SinaObject);
    var _super = _createSuper(SuvNavTargetResolver);
    function SuvNavTargetResolver(properties) {
      var _this;
      _classCallCheck(this, SuvNavTargetResolver);
      _this = _super.call(this, properties);
      _this.suvMimeType = "application/vnd.sap.universal-viewer+suv";
      _this.suvViewerBasePath = "/sap/bc/ui5_ui5/ui2/ushell/resources/sap/fileviewer/viewer/web/viewer.html?file=";
      return _this;
    }
    _createClass(SuvNavTargetResolver, [{
      key: "addHighlightTermsToUrl",
      value: function addHighlightTermsToUrl(url, highlightTerms) {
        if (!highlightTerms) {
          return url;
        }
        url += "&searchTerms=" + encodeURIComponent(JSON.stringify({
          terms: highlightTerms
        }));
        return url;
      }
    }, {
      key: "resolveSuvNavTargets",
      value: function resolveSuvNavTargets(dataSource, suvAttributes, suvHighlightTerms) {
        for (var suvAttributeName in suvAttributes) {
          var openSuvInFileViewerUrl = void 0;
          var suvAttribute = suvAttributes[suvAttributeName];
          var thumbnailAttribute = suvAttribute.suvThumbnailAttribute;
          if (suvAttribute.suvTargetMimeTypeAttribute.value === this.suvMimeType) {
            openSuvInFileViewerUrl = this.suvViewerBasePath + encodeURIComponent(suvAttribute.suvTargetUrlAttribute.value);
            openSuvInFileViewerUrl = this.addHighlightTermsToUrl(openSuvInFileViewerUrl, suvHighlightTerms);
            openSuvInFileViewerUrl = addThemeToURL(openSuvInFileViewerUrl);
            thumbnailAttribute.defaultNavigationTarget = this.sina._createNavigationTarget({
              label: suvAttribute.suvTargetUrlAttribute.value,
              targetUrl: openSuvInFileViewerUrl,
              target: "_blank"
            });
          } else {
            openSuvInFileViewerUrl = suvAttribute.suvTargetUrlAttribute.value;
            thumbnailAttribute.defaultNavigationTarget = this.sina._createNavigationTarget({
              label: suvAttribute.suvTargetUrlAttribute.value,
              targetUrl: openSuvInFileViewerUrl,
              target: "_blank"
            });
          }
        }
      }
    }]);
    return SuvNavTargetResolver;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.SuvNavTargetResolver = SuvNavTargetResolver;
  return __exports;
});
})();