/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/MessageBox", "sap/ui/core/format/FileSizeFormat", "sap/ui/core/format/NumberFormat", "./i18n", "./UIUtil"], function (MessageBox, FileSizeFormat, NumberFormat, __i18n, ___UIUtil) {
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
  var i18n = _interopRequireDefault(__i18n);
  var registerHandler = ___UIUtil["registerHandler"]; // =======================================================================
  // Regex Tester
  // =======================================================================
  var Tester = /*#__PURE__*/function () {
    // CSS class

    function Tester(sSearchTerms, highlightStyle,
    // CSS class
    matchContains, bDisjunctionType) {
      _classCallCheck(this, Tester);
      _defineProperty(this, "onlyAsteriskRegExp", new RegExp("^[\\s*]*$"));
      _defineProperty(this, "alphaNumeric", "[a-zA-Z0-9]");
      _defineProperty(this, "nonAlphaNumeric", "[^a-zA-Z0-9]");
      _defineProperty(this, "PL", "(?:[\0-@[-`{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u0560\u0588-\u05CF\u05EB-\u05EF\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u089F\u08B5\u08BE-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B-\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDD\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u170D\u1712-\u171F\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1878-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4C-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C89-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u312E-\u3130\u318F-\u319F\u31BB-\u31EF\u3200-\u33FF\u4DB6-\u4DFF\u9FD6-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7AF\uA7B8-\uA7F6\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FE-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB66-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2F\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE34-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEFF\uDF1A-\uDFFF]|\uD806[\uDC00-\uDC9F\uDCE0-\uDCFE\uDD00-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD834\uD836-\uD839\uD83C-\uD83F\uD874-\uD87D\uD87F-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDEFF\uDF45-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE1-\uDFFF]|\uD821[\uDFED-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDC02-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])");
      _defineProperty(this, "nonepL", "(?:[^A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D])");
      _defineProperty(this, "pL", "(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D])");
      // normalize searchterms in string format
      sSearchTerms = sSearchTerms || "*";

      // check for pure asterisk search terms
      if (this.onlyAsteriskRegExp.test(sSearchTerms)) {
        this.onlyAsterisk = true;
      }

      // escape special chars
      // eslint-disable-next-line no-useless-escape
      sSearchTerms = sSearchTerms.replace(/([.^=!:${}()|\+\-\[\]\/\\])/g, "\\$1");

      // store tokenized search terms array
      this.aSearchTerms = this.tokenizeSearchTerms(sSearchTerms);
      for (var j = 0; j < this.aSearchTerms.length; ++j) {
        // * has special meaning in enterprise search context
        // (use [^\s]* and not [^\s]+ because sap* shall match sap)
        //searchTerm = searchTerm.replace(/\*/g, "[^\\s]*");
        var searchTerm = this.aSearchTerms[j];
        searchTerm = searchTerm.replace(/\?/g, ".");
        searchTerm = searchTerm.replace(/\*/g, ".*?");

        // check if search term is Chinese (in unicode Chinese characters interval).
        var bIsChinese = searchTerm.match(/[\u3400-\u9faf]/) !== null;
        if (bIsChinese || matchContains) {
          // match any place of the word, case insensitive
          // \b \w are evil regarding unicode
          searchTerm = new RegExp(searchTerm, "gi");
        } else {
          // only match beginnings of the word, case insensitive
          // \b \w are evil regarding unicode
          //searchTerm = new RegExp('(?:^|\\s)' + searchTerm, 'gi');

          // if (bSearch === true) {
          //     //Search scenario, no automatic appending of *
          //     //searchTerm = new RegExp('(' + this.nonAlphaNumeric + '|^|\\s)('+searchTerm+')(?:$|' + this.nonAlphaNumeric + ')', 'gi');
          //     //searchTerm = new RegExp('^(.*' + this.PL + '|^|\\s)('+searchTerm+')(?:$|' + this.PL + ')', 'gi');
          //     searchTerm = new RegExp('(' + this.nonepL + '|^|\\s)(' + searchTerm + ')(?:$|' + this.nonepL + ')', 'gi');
          //
          // } else {
          // Suggestion scenario
          //if (j === this.aSearchTerms.length -1 ){
          // last term append *  (for filter)
          if (searchTerm.substr(-3) === ".*?") {
            // if * at end anyway, change matching to get different highlighting
            searchTerm = searchTerm.substr(0, searchTerm.length - 3) + this.pL + "*";
          }
          //searchTerm = new RegExp('(' + this.nonepL +'|^|\\s)('+searchTerm+')(.*)$', 'gi');
          //} else {
          //searchTerm = new RegExp('(' + this.nonepL +'|^|\\s)('+searchTerm+')((?:$|' + this.pL + ').*)$', 'gi');
          //}
          searchTerm = new RegExp("(" + this.nonepL + "|^|\\s)(" + searchTerm + ")()", "gi");
          // }
        }

        this.aSearchTerms[j] = searchTerm;
      }
      this.highlightStyle = highlightStyle;
      if (!bDisjunctionType) {
        bDisjunctionType = "and";
      }
      this.bDisjunctionType = bDisjunctionType; // ("and", "or")
    }

    // If the text to be searched contains all of search terms,
    // return object with match flag and highlighted text or space in case of not match
    _createClass(Tester, [{
      key: "test",
      value: function test(sText2BeSearched) {
        var oReturn = {
          bMatch: false,
          sHighlightedText: ""
        };
        if (!sText2BeSearched) {
          return oReturn;
        }
        this.initializeBoldArray(sText2BeSearched);

        // global flag is there is any bold char
        this.globalBold = false;
        var oRegSearchTerm;
        var aMatchResult;
        for (var j = 0; j < this.aSearchTerms.length; ++j) {
          // only match beginnings of the word, case insensitive
          oRegSearchTerm = this.aSearchTerms[j];

          // match?
          var lastIndex = -1;
          var bLocalMatch = false;
          while ((aMatchResult = oRegSearchTerm.exec(sText2BeSearched)) !== null) {
            bLocalMatch = true;
            // prevent endless loop, should not happen but who knows...
            if (oRegSearchTerm.lastIndex === lastIndex) {
              break;
            }
            lastIndex = oRegSearchTerm.lastIndex;

            //aMatchResult.index: the start position of matching term
            //oRegSearchTerm.lastIndex: the start position of next search
            var startIndex = this.calStartIndex(sText2BeSearched, aMatchResult.index);
            if (startIndex < 0) {
              continue;
            }
            lastIndex = this.calLastIndex(sText2BeSearched, startIndex, oRegSearchTerm.lastIndex);
            this.markBoldArray(startIndex, lastIndex);
          }
          switch (this.bDisjunctionType) {
            case "or":
              if (bLocalMatch) {
                oReturn.bMatch = true;
              }
              break;
            case "and":
            default:
              if (!bLocalMatch) {
                return oReturn;
              }
              break;
          }
        }

        // search terms have logical "and" relation, all of them must be available in text
        oReturn.bMatch = true;

        // generate highligted text
        if (this.onlyAsterisk) {
          oReturn.sHighlightedText = sText2BeSearched;
        } else {
          oReturn.sHighlightedText = this.render(sText2BeSearched);
        }
        return oReturn;
      }
    }, {
      key: "calStartIndex",
      value: function calStartIndex(text, startIndex) {
        text = text.substring(startIndex);
        var reg = new RegExp(this.pL);
        var match = reg.exec(text);
        if (!match) {
          //return -1;
          return startIndex;
        }
        return match.index + startIndex;
      }
    }, {
      key: "calLastIndex",
      value: function calLastIndex(text, startIndex, lastIndex) {
        //text = text.substring(startIndex, lastIndex);
        text = text.substring(lastIndex, lastIndex);
        var reg = new RegExp(this.nonepL);
        var match = reg.exec(text);
        if (!match) {
          return lastIndex;
        }
        return lastIndex - 1;
      }

      // tokenize search terms splitted by spaces
    }, {
      key: "tokenizeSearchTerms",
      value: function tokenizeSearchTerms(terms) {
        var termsSeparatedBySpace = terms.split(" ");
        var newTerms = [];
        // split search terms with space and wildcard into array
        $.each(termsSeparatedBySpace, function (i, termSpace) {
          termSpace = $.trim(termSpace);
          if (termSpace.length > 0 && termSpace !== ".*") {
            newTerms.push(termSpace);
          }
        });
        return newTerms;
      }

      // initialize the bold array
    }, {
      key: "initializeBoldArray",
      value: function initializeBoldArray(sText) {
        // create array which stores flag whether character is bold or not
        this.bold = new Array(sText.length);
        for (var i = 0; i < this.bold.length; ++i) {
          this.bold[i] = false;
        }
      }

      // mark bold array
    }, {
      key: "markBoldArray",
      value: function markBoldArray(nStartIndex, nEndIndexPlus1) {
        // mark bold characters in global array
        for (var i = nStartIndex; i < nEndIndexPlus1; i++) {
          this.bold[i] = true;
          this.globalBold = true;
        }
      }

      // render original text with <b> tag
    }, {
      key: "render",
      value: function render(sOriginalText) {
        // short cut if there is nothing to do
        if (!this.globalBold) {
          return sOriginalText;
        }

        // highlight sOriginalText according to information in this.bold
        var bold = false;
        var result = [];
        var start = 0;
        var i;
        for (i = 0; i < sOriginalText.length; ++i) {
          if (!bold && this.bold[i] ||
          // check for begin of bold sequence
          bold && !this.bold[i]) {
            // check for end of bold sequence
            result.push(sOriginalText.substring(start, i));
            if (bold) {
              // bold section ends
              result.push("</b>");
            } else {
              // bold section starts
              if (this.highlightStyle) {
                result.push('<b class="' + this.highlightStyle + '">');
              } else {
                result.push("<b>");
              }
            }
            bold = !bold;
            start = i;
          }
        }

        // add last part
        result.push(sOriginalText.substring(start, i));
        if (bold) {
          result.push("</b>");
        }
        return result.join("");
      }
    }]);
    return Tester;
  }(); // =======================================================================
  // decorator for delayed execution
  // =======================================================================
  // eslint-disable-next-line @typescript-eslint/ban-types
  function delayedExecution(originalFunction, delay) {
    var timerId = null;
    var decorator = function decorator() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      if (timerId) {
        window.clearTimeout(timerId);
      }
      timerId = window.setTimeout(function () {
        timerId = null;
        originalFunction.apply(that, args);
      }, delay);
    };
    decorator.abort = function () {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
    return decorator;
  }

  // =======================================================================
  // decorator for refusing outdated requests
  // =======================================================================
  // eslint-disable-next-line @typescript-eslint/ban-types
  function refuseOutdatedRequests(originalFunction, requestGroupId) {
    var _this = this;
    /* eslint new-cap:0 */
    var lastRequestId = 0;
    var decorator = function decorator() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var requestId = ++lastRequestId;
      //console.log(requestGroupId + ' start ', requestId);
      var thisPromise = new Promise(function (resolve, reject) {
        originalFunction.apply(_this, args).then(function (result) {
          if (requestId !== lastRequestId) {
            // console.log(requestGroupId + ' throw ', requestId, ' because max', maxRequestId);
            return; // throw away outdated requests
          }
          // console.log(requestGroupId + ' accept ', requestId);
          resolve(result);
        })["catch"](function (error) {
          if (requestId !== lastRequestId) {
            return;
          } // throw away outdated requests
          reject(error);
        });
      });
      return thisPromise;
    };
    decorator.abort = function () {
      ++lastRequestId;
      // console.log(id + ' abort', maxRequestId);
    };

    if (requestGroupId) {
      outdatedRequestAdministration.registerDecorator(requestGroupId, decorator);
    }
    return decorator;
  }

  // =======================================================================
  // abort all requests for a given requestGroupId
  // =======================================================================
  function abortRequests(requestGroupId) {
    var decorators = outdatedRequestAdministration.getDecorators(requestGroupId);
    var _iterator = _createForOfIteratorHelper(decorators),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var decorator = _step.value;
        decorator.abort();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  // =======================================================================
  // administration of outdated request decorators
  // =======================================================================
  var outdatedRequestAdministration = {
    decoratorMap: {},
    registerDecorator: function registerDecorator(requestGroupId, decorator) {
      var decorators = this.decoratorMap[requestGroupId];
      if (!decorators) {
        decorators = [];
        this.decoratorMap[requestGroupId] = decorators;
      }
      decorators.push(decorator);
    },
    getDecorators: function getDecorators(requestGroupId) {
      var decorators = this.decoratorMap[requestGroupId];
      if (!decorators) {
        decorators = [];
      }
      return decorators;
    }
  };

  /**
   * Unescapes previously escaped html so that it can be rendered as html.
   * It only will unescape to "\<b>", "\<i>"" and "\<span>"" elements.
   * @param domref html element to be unescaped
   * @param highlightStyle css class of the to be bold text
   */
  function boldTagUnescaper(domref, highlightStyle) {
    if (!domref) {
      return;
    }
    var innerhtml = domref.innerHTML;
    innerhtml = boldTagUnescaperForStrings(innerhtml, highlightStyle);
    if (domref.innerHTML !== innerhtml) {
      domref.innerHTML = innerhtml;
    }
  }
  function boldTagUnescaperForStrings(innerhtml, highlightStyle) {
    var boldStartES = "";
    var boldStart = "";
    if (highlightStyle) {
      boldStartES = '&lt;b class="' + highlightStyle + '"&gt;';
      boldStart = '<b class="' + highlightStyle + '">';
    } else {
      boldStartES = "&lt;b&gt;";
      boldStart = "<b>";
    }
    var boldEndES = "&lt;/b&gt;";
    var boldEnd = "</b>";
    while (innerhtml.indexOf(boldStartES) + innerhtml.indexOf(boldEndES) >= -1) {
      // while these tags are found
      innerhtml = innerhtml.replace(boldStartES, boldStart);
      innerhtml = innerhtml.replace(boldEndES, boldEnd);
    }
    while (innerhtml.indexOf("&lt;i&gt;") + innerhtml.indexOf("&lt;/i&gt;") >= -1) {
      // while these tags are found
      innerhtml = innerhtml.replace("&lt;i&gt;", "<i>");
      innerhtml = innerhtml.replace("&lt;/i&gt;", "</i>");
    }
    while (innerhtml.indexOf("&lt;span&gt;") + innerhtml.indexOf("&lt;/span&gt;") >= -1) {
      // while these tags are found
      innerhtml = innerhtml.replace("&lt;span&gt;", "<span>");
      innerhtml = innerhtml.replace("&lt;/span&gt;", "</span>");
    }
    return innerhtml;
  }

  // =======================================================================
  // <b> tag unescaper with the help of text()
  // =======================================================================
  function boldTagUnescaperByText(domref) {
    var $d = $(domref);

    // Security check, whether $d.text() contains tags other than <b> and </b>
    var s = $d.text().replace(/<b>/gi, "").replace(/<\/b>/gi, ""); /// Only those two HTML tags are allowed.

    // If not
    if (s.indexOf("<") === -1) {
      $d.html($d.text());
    }
  }

  // =======================================================================
  // emphasize whyfound in case of ellipsis
  // =======================================================================
  function forwardEllipsis4Whyfound(domref) {
    var $d = $(domref);
    var widthOfCell = domref.offsetWidth;
    var offsetOfText = domref.offsetLeft;
    var widthOfText = domref.scrollWidth;
    if (widthOfText > widthOfCell) {
      $d.find("b").each(function () {
        var positionOfHighlightedText = this.offsetLeft - offsetOfText;
        var widthOfHighlightedText = this.offsetWidth;
        var trimmedText;
        if (positionOfHighlightedText + widthOfHighlightedText > widthOfCell) {
          var indexOfHightlightedText = domref.innerHTML.indexOf(this.outerHTML);
          if (widthOfHighlightedText > widthOfCell) {
            if (domref.innerHTML.substring(0, indexOfHightlightedText).trim().length > 0) {
              trimmedText = "... " + domref.innerHTML.substring(indexOfHightlightedText);
              $d.html(trimmedText);
            }
          } else {
            var lastWord;
            var textBeforeHighlightedText = domref.innerHTML.substring(0, indexOfHightlightedText).trim();
            trimmedText = domref.innerHTML.substring(indexOfHightlightedText).trim();
            var previousTrimmedTexts = [];
            while (textBeforeHighlightedText.length > 0) {
              lastWord = textBeforeHighlightedText.match(/\S+$/);
              if (lastWord.length == 0) {
                break; // actually this is just a safety net, as this should not happen
              }

              previousTrimmedTexts.push(trimmedText);
              trimmedText = lastWord[0] + " " + trimmedText;
              domref.innerHTML = "... " + trimmedText;
              if (domref.scrollWidth < widthOfCell) {
                // there's room for more, so add another word
                textBeforeHighlightedText = textBeforeHighlightedText.substring(0, textBeforeHighlightedText.length - lastWord[0].length).trim();
              } else {
                while (domref.scrollWidth > widthOfCell && previousTrimmedTexts.length > 0) {
                  // last word or words were too much, so start to remove words again until it fits
                  var previousTrimmedText = previousTrimmedTexts.pop();
                  domref.innerHTML = "... " + previousTrimmedText;
                }
                break;
              }
            }
          }
        }
        return false; // stop after first occurence
      });
    }
  }

  // =======================================================================
  // get url hash
  // http://stackoverflow.com/questions/1703552/encoding-of-window-location-hash
  // =======================================================================
  function getHashFromUrl() {
    return window.location.href.substring(window.location.href.indexOf("#")) || "#";
  }
  function getUrlParameter(name) {
    if (typeof window !== "undefined") {
      var search = window.location.href;
      var value = (new RegExp(name + "=(.+?)(&|$|#)", "i").exec(search) || [null])[1];
      if (!value) {
        return value;
      }
      value = window.decodeURIComponent(value);
      return value;
    }
    return "";
  }
  function getUrlParameters() {
    var urlParameters = parseUrlParameters(getHashFromUrl());
    return urlParameters;
  }
  function parseUrlParameters(unescapedSearchUrl) {
    // workaround for url ushells broken url escaping if special chars
    // like [] are used in urls (like in app tiles with search filters).
    // restriction of this workaround:
    // - tiles with searchterms like the names of the parameters dont
    //   work (for example a tile with searchterm "top=")
    var oParametersLowerCased = {};
    var knownSearchUrlParameters = [{
      name: "filter",
      pos: -1,
      value: ""
    }, {
      name: "top",
      pos: -1,
      value: ""
    }, {
      name: "datasource",
      pos: -1,
      value: ""
    }, {
      name: "searchterm",
      pos: -1,
      value: ""
    }, {
      name: "orderby",
      pos: -1,
      value: ""
    }, {
      name: "sortorder",
      pos: -1,
      value: ""
    }];
    // find the parameters:
    for (var i = 0; i < knownSearchUrlParameters.length; i++) {
      knownSearchUrlParameters[i].pos = unescapedSearchUrl.toLowerCase().indexOf(knownSearchUrlParameters[i].name + "=");
    }
    knownSearchUrlParameters.sort(function (a, b) {
      return a.pos - b.pos;
    });
    // find the parameter boundaries:
    for (var j = 0; j < knownSearchUrlParameters.length; j++) {
      if (knownSearchUrlParameters[j].pos !== -1) {
        if (knownSearchUrlParameters[j + 1] && knownSearchUrlParameters[j + 1].pos !== -1) {
          knownSearchUrlParameters[j].value = unescapedSearchUrl.substring(knownSearchUrlParameters[j].pos, knownSearchUrlParameters[j + 1].pos);
        } else {
          knownSearchUrlParameters[j].value = unescapedSearchUrl.substring(knownSearchUrlParameters[j].pos);
        }
        // remove the parameter name and "=":
        knownSearchUrlParameters[j].value = knownSearchUrlParameters[j].value.substring(knownSearchUrlParameters[j].name.length + 1);
        if (knownSearchUrlParameters[j].value.charAt(knownSearchUrlParameters[j].value.length - 1) === "&") {
          knownSearchUrlParameters[j].value = knownSearchUrlParameters[j].value.substring(0, knownSearchUrlParameters[j].value.length - 1);
        }
        knownSearchUrlParameters[j].value = window.decodeURIComponent(knownSearchUrlParameters[j].value);
        oParametersLowerCased[knownSearchUrlParameters[j].name] = knownSearchUrlParameters[j].value;
      }
    }
    return oParametersLowerCased;
  }

  // =======================================================================
  // check if search app is running
  // =======================================================================
  function isSearchAppActive() {
    if (getHashFromUrl().substr(1, 13) === "Action-search") {
      return true;
    }
    return false;
  }

  // =======================================================================
  // Hasher
  // using window.hasher does not work because
  // hasher always use encodeURL for the whole hash but for example we need
  // - to encode '=' in a value (of name value pair)
  // but not the '=' separating name and value
  // =======================================================================
  var hasher = {
    hash: null,
    setHash: function setHash(hash) {
      // compare using decodeURIComponent because encoding may slightly differ
      // (Saved tiles scramble the URL. The URL of a saved tile is different
      //  to the URL serialized by search app)
      if (window.decodeURIComponent(getHashFromUrl()) !== window.decodeURIComponent(hash)) {
        try {
          window.location.hash = hash;
        } catch (error) {
          // in IE url cannot be update if longer than 2083 chars -> show error message to the user
          this.showUrlUpdateError(error);
        }
      }
      this.hash = hash;
    },
    init: function init() {
      this.hash = getHashFromUrl();
    },
    reset: function reset() {
      this.hash = null;
    },
    hasChanged: function hasChanged() {
      if (window.decodeURIComponent(this.hash) !== window.decodeURIComponent(getHashFromUrl())) {
        return true;
      }
      return false;
    },
    showUrlUpdateError: function showUrlUpdateError() {
      // display error only one times
      if (this.urlError) {
        return;
      }
      this.urlError = true;

      // show message box
      var message = i18n.getText("searchUrlErrorMessage");
      MessageBox.warning(message, {
        title: i18n.getText("searchUrlErrorTitle")
      });
    }
  };

  // =======================================================================
  // Subscribe the given event only once
  // =======================================================================
  var idMap = {};
  function subscribeOnlyOnce(id, eventName,
  // eslint-disable-next-line @typescript-eslint/ban-types
  callBack,
  // eslint-disable-next-line @typescript-eslint/ban-types
  selfControl) {
    if (idMap[id]) {
      idMap[id].unsubscribe();
    }
    var wrapper = function wrapper() {
      callBack.apply(selfControl);
      sap.ui.getCore().getEventBus().unsubscribe(eventName, wrapper, selfControl);
    };
    sap.ui.getCore().getEventBus().subscribe(eventName, wrapper, selfControl);
    idMap[id] = {
      unsubscribe: function unsubscribe() {
        sap.ui.getCore().getEventBus().unsubscribe(eventName, wrapper, selfControl);
      }
    };
  }

  // =======================================================================
  // check if element is displayed
  // =======================================================================
  function _isDisplayed(element) {
    // element is DOM object
    if (element && element.nodeType) {
      if (jQuery(element).is(":visible")) {
        return true;
      }
    }

    // element if SAPUI5 object
    if (element && element.getMetadata() && element.getMetadata().getName()) {
      if (element.getDomRef && element.getDomRef()) {
        return true;
      }
    }
    return false;
  }

  // =======================================================================
  // Focus Handler
  // =======================================================================
  var SearchFocusHandler = /*#__PURE__*/function () {
    function SearchFocusHandler(oSearchComposite) {
      _classCallCheck(this, SearchFocusHandler);
      this.oSearchComposite = oSearchComposite;
    }

    // get the controlDomRef to be focused
    _createClass(SearchFocusHandler, [{
      key: "get2BeFocusedControlDomRef",
      value: function get2BeFocusedControlDomRef() {
        if (!this.oModel) {
          this.oModel = this.oSearchComposite.getModel(); // ToDo
        }

        var index = 0;
        var control = null;
        var controlDomRef = null;
        var isListDisplayed = false;
        var isTableDisplayed = false;
        var isGridDisplayed = false;
        if (this.oModel.getDataSource() !== this.oModel.appDataSource) {
          // 1. mixed result list
          if (this.oModel.getProperty("/boCount") > 0 && this.oModel.getProperty("/appCount") > 0) {
            // 1.1 bos + apps
            index = this.oModel.getProperty("/focusIndex");
            index = index > 0 ? index + 1 : index;
            control = this.oSearchComposite.searchResultList.getItems()[index];
            if (control && control.getDomRef) {
              controlDomRef = control.getDomRef();
            }
          } else if (this.oModel.getProperty("/boCount") > 0 && this.oModel.getProperty("/appCount") === 0) {
            // 1.2 only bos
            index = this.oModel.getProperty("/focusIndex");
            isListDisplayed = this.oModel.getResultViewType() === "searchResultList";
            isTableDisplayed = this.oModel.getResultViewType() === "searchResultTable";
            isGridDisplayed = this.oModel.getResultViewType() === "searchResultGrid";
            if (isListDisplayed) {
              // 1.2.1 list view
              control = this.oSearchComposite["searchResultList"].getItems()[index];
            } else if (isTableDisplayed) {
              // 1.2.2 table view
              control = this.oSearchComposite["searchResultTable"].getItems()[index];
            } else if (isGridDisplayed) {
              // 1.2.3 grid view
              if (this.oSearchComposite.searchResultGrid.getAggregation("items")) {
                control = this.oSearchComposite.searchResultGrid.getAggregation("items")[index];
              } else if (this.oSearchComposite.searchResultGrid["getContent"]()) {
                control = this.oSearchComposite.searchResultGrid["getContent"]()[index];
              }
            }
            if (control && control.getDomRef) {
              controlDomRef = control.getDomRef();
            }
          } else if (this.oModel.getProperty("/boCount") === 0 && this.oModel.getProperty("/appCount") > 0) {
            // 1.3 only apps
            control = this.oSearchComposite["searchResultList"].getItems()[0];
            if (_isDisplayed(control)) {
              controlDomRef = getFocusableTileDomRef($(control.getDomRef()));
            }
          }
        } else {
          // 2. pure apps result list (tile matrix)

          var oTilesContainer = this.oSearchComposite["appSearchResult"].getContent()[0];
          if (oTilesContainer.getDomRef() === null) {
            return null;
          }
          index = this.oModel.getProperty("/focusIndex");
          oTilesContainer["_oItemNavigation"].setFocusedIndex(index);

          // oTilesContainer dosen't have tiles aggregation
          // don't have oTilesContainer.getTiles(), use jQuery find instead
          // var tileDOM = jQuery(oTilesContainer.getDomRef()).find(".sapUshellSearchTileWrapper")[index];
          var tileDOM = oTilesContainer["getItems"]()[index];
          if (_isDisplayed(tileDOM)) {
            controlDomRef = getFocusableTileDomRef(tileDOM.getDomRef());
          }
        }
        return controlDomRef;
      }

      // set focus
      // ===================================================================
    }, {
      key: "setFocus",
      value: function setFocus() {
        /* eslint no-lonely-if:0 */

        // this method is called
        // 1) after event allSearchFinished (see registration in Search.controller)
        // 2) after event afterNavigate (see registration in searchshellhelper)
        // 3) after event appComponentLoaded (see registration in searchshellhelper)

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        var retries = 20;

        // method for setting the focus with periodic retry
        var doSetFocus = function doSetFocus() {
          that.focusSetter = null;
          var controlDomRef = that.get2BeFocusedControlDomRef();

          // this is a workaround to prevent first app tile and input share the same sapenter event
          // need to fix in better way
          if (retries === 20) {
            controlDomRef = null;
          }
          if (!controlDomRef ||
          // condition 1
          sap.ui.getCore().getUIDirty() ||
          // condition 2
          jQuery(".sapUshellSearchTileContainerDirty").length > 0 ||
          // condition 3
          jQuery(".sapMBusyDialog").length > 0) {
            // condition 4

            /*console.log('--focus failed',
            controlDomRef,
            sap.ui.getCore().getUIDirty(),
            sap.ui.getCore().byId('Fiori2LoadingDialog').isOpen(),
            jQuery('.sapUshellSearchTileContainerDirty').length > 0,
            jQuery('.sapMBusyDialog').length > 0);*/

            if (--retries) {
              that.focusSetter = setTimeout(doSetFocus, 100);
            }
            return;
          }

          // condition 1:
          // control and its domref do need to exist
          // condition 2:
          // no rendering process is running
          // focus can only be set after ui5 rendering is finished because ui5 preserves the focus
          // condition 3:
          // loading dialog (app loading) is closed
          // loading dialog restores old focus (using timeout 300ms) so we need to wait until loading dialog has finished
          // condition 4:
          // wait that app tile container has finished rendering
          // app tile container has two rendering steps. First step is just for calculating number of tiles.
          // condition 5:
          // wait that buys indicators are finished

          // set focus
          controlDomRef.focus();
          //console.log('--set');

          /*var meButton = document.getElementById('meAreaHeaderButton');
          if (!meButton.isDecorated) {
          var originalFocus = meButton.focus;
          meButton.focus = function() {
              //console.log('--reset');
              //   debugger;
              originalFocus.apply(this, arguments);
          };
          meButton.isDecorated = true;
          }*/

          // automatic expand only the first result líst item
          if (that.oModel.getProperty("/focusIndex") === 0) {
            var control = sap.ui.getCore().byId(controlDomRef.getAttribute("id"));
            if (control && control.getAggregation("content") && control.getAggregation("content")[0]) {
              var resultListItem = control.getAggregation("content")[0];
              if (resultListItem.showDetails) {
                resultListItem.showDetails();
              }
            }
          }

          // Fix Result List Keyboard Navigation
          that.oSearchComposite["searchResultList"].collectListItemsForNavigation();
        };

        // cancel any scheduled focusSetter
        if (this.focusSetter) {
          clearTimeout(this.focusSetter);
          this.focusSetter = null;
        }

        // set focus
        doSetFocus();
      }
    }]);
    return SearchFocusHandler;
  }(); // =======================================================================
  // looks into a tile and return the first focusable child element
  // =======================================================================
  function getFocusableTileDomRef(tileDomRef) {
    return jQuery(tileDomRef).find("[tabindex], button")[0]; // find element which has tabindex or is a button
    //return jQuery(tileDomRef).find(".sapUshellTileBase, .sapUiCockpitReportTile, .sapUshellSearchShowMoreTileButton")[0];
  }

  // =======================================================================
  // format integer
  // =======================================================================
  var _integerShortFormatter;
  var _integerStandardFormatter;
  function formatInteger(value) {
    // lazy create integerShortFormatter
    if (!_integerShortFormatter) {
      _integerShortFormatter = NumberFormat.getIntegerInstance({
        style: "short",
        precision: 3,
        groupingEnabled: true
      }, sap.ui.getCore().getConfiguration().getLocale());
    }

    // lazy create integerStandardFormatter
    if (!_integerStandardFormatter) {
      _integerStandardFormatter = NumberFormat.getIntegerInstance({
        style: "standard",
        precision: 3,
        groupingEnabled: true
      }, sap.ui.getCore().getConfiguration().getLocale());
    }

    // 99950 is the first number (with precision 3 rounding) that will map to 100000; same as "parseFloat((Math.abs(number)).toPrecision(3)) >= 100000"
    if (Math.abs(value) >= 99950) {
      return _integerShortFormatter.format(value);
    }
    return _integerStandardFormatter.format(value);
  }

  // =======================================================================
  // format file size humanfriendly
  // =======================================================================
  var _fileSizeFormatter;
  function formatFileSize(value) {
    // lazy create _fileSizeFormatter
    if (!_fileSizeFormatter) {
      _fileSizeFormatter = FileSizeFormat.getInstance({
        style: "short",
        precision: 3,
        groupingEnabled: true,
        binaryFilesize: true
      }, sap.ui.getCore().getConfiguration().getLocale());
    }
    return _fileSizeFormatter.format(value);
  }

  // =======================================================================
  // dynamically add a tooltip to text elements if they are overflown
  // =======================================================================
  function attachEventHandlersForTooltip(element) {
    var $element = $(element);
    registerHandler("tooltip-mouseenter", $element.find(".sapUshellSearchResultListItem-MightOverflow"), "mouseenter", function () {
      var $this = $(this);
      var text = $this.text();
      var title = $this.attr("title");
      var tooltip;
      var tooltippedby = $this.attr("data-tooltippedby");
      if (tooltippedby) {
        var tooltippedbyElement = $element.find("#" + tooltippedby);
        tooltip = tooltippedbyElement.text();
      }
      // var isLongText = $this.attr("data-islongtext") == "true";
      // var isHighlighted = $this.attr("data-ishighlighted") == "true";
      // if (isLongText && isHighlighted) {
      //     var originalText = $this.text().replace(/^(\.\.\.)|\1$/g, "");
      //     originalText = originalText.replace(/<[/]?b>/g, "");
      //
      // }

      // check whether content is overflowing. On IE there's a bug that can cause scrollWidth to be different from
      // offsetWidth by 1 px due to a rounding issue. That's why the check against the bounding client rect is in
      // place as well. Same is true for scrollHeight and offsetHeight obviuosly.
      if (!$this.attr("title") && (this.offsetWidth < this.scrollWidth ||
      // && this.getBoundingClientRect().width == this.offsetWidth ||
      this.offsetHeight < this.scrollHeight) ||
      // && this.getBoundingClientRect().height == this.offsetHeight) ||
      tooltip && text !== tooltip) {
        if (!tooltip) {
          tooltip = $this.text();
        }
        $this.attr("title", tooltip);
      } else if (title === $this.text()) {
        $this.removeAttr("title");
      }
    });
    registerHandler("tooltip-mouseout", $element.find(".sapUshellSearchResultListItem-MightOverflow"), "mouseout", function () {
      var $this = $(this);
      var tooltip;
      var tooltippedby = $this.attr("data-tooltippedby");
      if (tooltippedby) {
        var tooltippedbyElement = $element.find("#" + tooltippedby);
        tooltip = tooltippedbyElement.text();
      }
      if (!tooltip) {
        tooltip = $this.text();
      }
      var title = $this.attr("title");
      if (title === tooltip) {
        $this.removeAttr("title");
      }
    });
  }

  // =======================================================================
  // convert promise to jquery deferred
  // =======================================================================
  function convertPromiseTojQueryDeferred(promise) {
    if (promise["finally"]) {
      // promise has property "finally"
      // is promise, need to convert
      var deferred = jQuery.Deferred();
      promise.then(function () {
        // eslint-disable-next-line
        deferred.resolve.apply(deferred, arguments);
      }, function () {
        // eslint-disable-next-line
        deferred.reject.apply(deferred, arguments);
      });
      return deferred;
    } else {
      // is deferred, don't convert
      return promise;
    }
  }

  // =======================================================================
  // convert jquery to promise
  // =======================================================================
  function convertJQueryDeferredToPromise(deferred) {
    if (deferred.always) {
      // deferred has property "always"
      // is deferred, need to convert
      return new Promise(function (resolve, reject) {
        deferred.then(resolve, reject);
      });
    } else {
      // is promise, don't convert
      return deferred;
    }
  }

  // =======================================================================
  // check the switch of user logging / navigation event requests
  // in url parameter and in configuration
  // =======================================================================
  function isLoggingEnabled() {
    if (this.isLoggingEnabledFlag !== undefined) {
      return this.isLoggingEnabledFlag;
    }
    this.isLoggingEnabledFlag = true;
    try {
      // 1. check searchLogging in url parameter
      var parameterInUrl = this.getUrlParameter("searchLogging");
      if (parameterInUrl === "false") {
        this.isLoggingEnabledFlag = false;
      }
      if (parameterInUrl === undefined) {
        // 2. check searchLogging in configuration
        if (window["sap-ushell-config"] !== undefined) {
          var config = window["sap-ushell-config"].renderers.fiori2.componentData.config;
          if (config !== undefined) {
            if (config.enableSearchLogging === false) {
              this.isLoggingEnabledFlag = false;
            }
          }
        }
      }
    } catch (e) {
      /* do nothing */
    }
    return this.isLoggingEnabledFlag;
  }

  // =======================================================================
  // Async Module Require
  // return Promise
  // =======================================================================
  function requireUI5Modules(modules) {
    return new Promise(function (resolve) {
      sap.ui.require(modules, function () {
        // eslint-disable-next-line prefer-rest-params
        resolve(Array.from(arguments));
      });
    });
  }

  // =======================================================================
  // check one array is subset of another
  // =======================================================================
  function isSubsetOf(subset, superset) {
    if (!Array.isArray(subset) || subset.length === 0) {
      return false;
    }
    if (!Array.isArray(superset) || superset.length === 0) {
      return false;
    }
    var valid = true;
    for (var i = 0; i < subset.length; i++) {
      if (!superset.includes(subset[i])) {
        valid = false;
        break;
      }
    }
    return valid;
  }
  var __exports = {
    __esModule: true
  };
  __exports.Tester = Tester;
  __exports.delayedExecution = delayedExecution;
  __exports.refuseOutdatedRequests = refuseOutdatedRequests;
  __exports.abortRequests = abortRequests;
  __exports.boldTagUnescaper = boldTagUnescaper;
  __exports.boldTagUnescaperForStrings = boldTagUnescaperForStrings;
  __exports.boldTagUnescaperByText = boldTagUnescaperByText;
  __exports.forwardEllipsis4Whyfound = forwardEllipsis4Whyfound;
  __exports.getHashFromUrl = getHashFromUrl;
  __exports.getUrlParameter = getUrlParameter;
  __exports.getUrlParameters = getUrlParameters;
  __exports.parseUrlParameters = parseUrlParameters;
  __exports.isSearchAppActive = isSearchAppActive;
  __exports.hasher = hasher;
  __exports.subscribeOnlyOnce = subscribeOnlyOnce;
  __exports.SearchFocusHandler = SearchFocusHandler;
  __exports.getFocusableTileDomRef = getFocusableTileDomRef;
  __exports.formatInteger = formatInteger;
  __exports.formatFileSize = formatFileSize;
  __exports.attachEventHandlersForTooltip = attachEventHandlersForTooltip;
  __exports.convertPromiseTojQueryDeferred = convertPromiseTojQueryDeferred;
  __exports.convertJQueryDeferredToPromise = convertJQueryDeferredToPromise;
  __exports.isLoggingEnabled = isLoggingEnabled;
  __exports.requireUI5Modules = requireUI5Modules;
  __exports.isSubsetOf = isSubsetOf;
  return __exports;
});
})();