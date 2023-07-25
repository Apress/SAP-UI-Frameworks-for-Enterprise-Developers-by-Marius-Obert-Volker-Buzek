/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../sina/AttributeSemanticsType", "../sina/SearchResultSetItemAttribute", "./errors"], function (___sina_AttributeSemanticsType, ___sina_SearchResultSetItemAttribute, ___errors) {
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
  /* eslint-disable no-useless-escape */
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var AttributeSemanticsType = ___sina_AttributeSemanticsType["AttributeSemanticsType"];
  var SearchResultSetItemAttribute = ___sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var NoJSONDateError = ___errors["NoJSONDateError"];
  var TimeOutError = ___errors["TimeOutError"]; // eslint-disable-next-line @typescript-eslint/ban-types
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.apply(obj, prop);
  }
  function timeoutDecorator(originalFunction, timeout) {
    var decoratedFunction = function decoratedFunction() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      // eslint-disable-next-line prefer-rest-params
      var args = arguments;
      return new Promise(function (resolve, reject) {
        var outTimed = false;
        var timer = setTimeout(function () {
          outTimed = true;
          reject(new TimeOutError());
        }, timeout);
        return originalFunction.apply(that, args).then(function (response) {
          // success
          if (outTimed) {
            return;
          }
          clearTimeout(timer);
          resolve(response);
        }, function (error) {
          // error
          if (outTimed) {
            return;
          }
          clearTimeout(timer);
          reject(error);
        });
      });
    };
    return decoratedFunction;
  }
  function refuseOutdatedResponsesDecorator(originalFunction) {
    var maxRequestId = 0;
    var decoratedFunction = function decoratedFunction() {
      var requestId = ++maxRequestId;
      // eslint-disable-next-line prefer-rest-params
      return originalFunction.apply(this, arguments).then(function (response) {
        // success
        return new Promise(function (resolve) {
          if (requestId !== maxRequestId) {
            return; // --> ignore
          }

          resolve(response); // --> forward
        });
      }, function (error) {
        // error
        return new Promise(function (resolve, reject) {
          if (requestId !== maxRequestId) {
            return; // --> ignore
          }

          reject(error); // --> forward
        });
      });
    };

    decoratedFunction.abort = function () {
      ++maxRequestId;
    };
    return decoratedFunction;
  }
  function getUrlParameter(name, url) {
    if (typeof window === "undefined") {
      return null;
    }
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  function filterString(text, removeStrings) {
    for (var i = 0; i < removeStrings.length; ++i) {
      var removeString = removeStrings[i];
      var index = 0;
      while (index >= 0) {
        index = text.indexOf(removeString);
        if (index >= 0) {
          text = text.slice(0, index) + text.slice(index + removeString.length);
        }
      }
    }
    return text;
  }
  function generateTimestamp() {
    var pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length - size);
    };
    var d = new Date();
    return "" + d.getUTCFullYear() + pad(d.getUTCMonth() + 1, 2) + pad(d.getUTCDate(), 2) + pad(d.getUTCHours(), 2) + pad(d.getUTCMinutes(), 2) + pad(d.getUTCSeconds(), 2) + pad(d.getUTCMilliseconds(), 3);
  }
  var DelayedConsumer = /*#__PURE__*/function () {
    function DelayedConsumer(properties) {
      _classCallCheck(this, DelayedConsumer);
      properties = properties || {};
      this.timeDelay = properties.timeDelay || 1000;
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.consumer = properties.consumer || function () {};
      this.consumerContext = properties.consumerContext || null;
      this.objects = [];
    }
    _createClass(DelayedConsumer, [{
      key: "add",
      value: function add(obj) {
        this.objects.push(obj);
        if (this.objects.length === 1) {
          setTimeout(this.consume.bind(this), this.timeDelay);
        }
      }
    }, {
      key: "consume",
      value: function consume() {
        this.consumer.apply(this.consumerContext, [this.objects]);
        this.objects = [];
      }
    }]);
    return DelayedConsumer;
  }();
  function dateToJson(date) {
    return {
      type: "Timestamp",
      value: date.toJSON()
    };
  }
  function dateFromJson(jsonDate) {
    if (jsonDate.type !== "Timestamp") {
      throw new NoJSONDateError("Not a timestampe " + jsonDate);
    }
    return new Date(jsonDate.value);
  }
  function addPotentialNavTargetsToAttribute(resultSet) {
    if (resultSet.items) {
      //not avilable with sample provider
      var items = resultSet.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        //the idea of nav targets extended to geo data preparation!
        item = this.addGeoDataIfAvailable(item);
        var attributes = item.detailAttributes;
        for (var j = 0; j < attributes.length; j++) {
          var attribute = attributes[j];
          if (attribute instanceof SearchResultSetItemAttribute) {
            var sina = attribute.sina;
            var value = attribute.value;
            var metadata = attribute.metadata;
            if (typeof value === "string" && attribute.metadata.type !== "ImageUrl") {
              var emails = value.match(/^[^\0-\x20,:;<>@\[\\\]^_`]+@[^\0-,.-@\[\\\]^_`\{\|\}~]+\.[^\0-,.-@\[\\\]^_`\{\|\}~]+$/g);
              var url = value.match(/^https?:\/\/(?=[^\/])\S+$/gi);
              if (metadata.semantics == AttributeSemanticsType.EmailAddress) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                  label: value,
                  targetUrl: "mailto:" + value
                });
              } else if (metadata.semantics == AttributeSemanticsType.PhoneNr) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                  label: value,
                  targetUrl: "tel:" + value
                });
              } else if (metadata.semantics == AttributeSemanticsType.HTTPURL) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                  label: value,
                  targetUrl: value,
                  target: "_blank"
                });
              } else if (emails !== null && emails.length === 1) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                  label: emails[0],
                  targetUrl: "mailto:" + emails[0]
                });
              } else if (url !== null && url[0].match(/\w\w\w/) !== null) {
                attribute.defaultNavigationTarget = sina._createNavigationTarget({
                  label: url[0],
                  targetUrl: url[0],
                  target: "_blank"
                });
              }
            }
          }
        }
      }
    }
    return resultSet;
  }
  function removePureAdvancedSearchFacets(resultSet) {
    var dataSource = resultSet.sina.getDataSource(resultSet.query.filter.dataSource.id);
    for (var i = 0; i < resultSet.facets.length; i++) {
      var attributeId = resultSet.facets[i].query.dimension;
      var attributeMetaData = dataSource.attributeMetadataMap[attributeId];
      if (attributeMetaData && attributeMetaData.usage.AdvancedSearch && attributeMetaData.usage.Facet === undefined) {
        resultSet.facets.splice(i, 1);
        i = i - 1;
      }
    }
    return resultSet;
  }
  function isMapsAttribute(attribute, returnOnlyBool, i) {
    var res = false;
    var lat, lon, latIndex, lonIndex, latAttribName, lonAttribName;
    var name = attribute.id;
    var val = attribute.value;
    if (name.match(/latitude/i) !== null) {
      if (!isNaN(val)) {
        latAttribName = name;
        lat = val;
        latIndex = i;
      }
      res = true;
    } else if (name.match(/longitude/i) !== null) {
      if (!isNaN(val)) {
        lonAttribName = name;
        lon = val;
        lonIndex = i;
      }
      res = true;
    } else if (name.match(/LOC_4326/)) {
      lonIndex = i;
      latIndex = i;
      var oLoc4326 = JSON.parse(val);
      var aCoordinates = oLoc4326.coordinates;
      if (aCoordinates && aCoordinates.length > 1) {
        lon = aCoordinates[0];
        lat = aCoordinates[1];
      }
      res = true;
    }
    if (returnOnlyBool === undefined || returnOnlyBool === true) {
      return res;
    }
    return {
      lat: lat,
      lon: lon,
      latAttribName: latAttribName,
      lonAttribName: lonAttribName,
      latIndex: latIndex,
      lonIndex: lonIndex
    };
  }
  function addGeoDataIfAvailable(itemData) {
    //augment with new geodata attribute
    var res, lat, lon, dataSource, latIndex, lonIndex;
    var attributes = itemData.detailAttributes;
    for (var i = 0; i < attributes.length; i++) {
      res = this.isMapsAttribute(attributes[i], false, i);
      lat = res.lat ? res.lat : lat;
      lon = res.lon ? res.lon : lon;
      latIndex = res.latIndex ? res.latIndex : latIndex;
      lonIndex = res.lonIndex ? res.lonIndex : lonIndex;
      if (lat && lon) {
        break;
      }
    }
    if (lat && lon) {
      //remove lat and long from searchRsultITems

      if (latIndex === lonIndex) {
        attributes.splice(latIndex, 1);
      } else if (latIndex > lonIndex) {
        attributes.splice(latIndex, 1);
        attributes.splice(lonIndex, 1);
      } else {
        attributes.splice(lonIndex, 1);
        attributes.splice(latIndex, 1);
      }
      var newMetadata = {
        sina: itemData.sina,
        type: "GeoJson",
        id: "LOC_4326",
        label: "LOC_4326",
        isCurrency: false,
        IsBoolean: false,
        IsKey: false,
        IsSortable: true,
        isUnitOfMeasure: false,
        semanticObjectType: [],
        usage: {
          Map: "coordinates"
        }
      };
      //creaate new attribute and check whtether geojson metadata exists
      var valStr = '{ "type": "Point", "coordinates": [' + lon + ", " + lat + ", 0] }";
      var newAttribute = {
        id: "LOC_4326",
        label: "LOC_4326",
        isHighlighted: false,
        value: valStr,
        valueFormatted: valStr,
        valueHighlighted: itemData.sina,
        metadata: newMetadata,
        sina: itemData.sina
      };
      attributes.push(newAttribute);
      dataSource = itemData.sina.getDataSource(itemData.dataSource.id);
      if (!dataSource.attributeMetadataMap.LOC_4326) {
        dataSource.attributesMetadata.push(newMetadata);
        dataSource.attributeMetadataMap.LOC_4326 = newMetadata;
      } else {
        dataSource.attributeMetadataMap.LOC_4326.type = "GeoJson";
        dataSource.attributeMetadataMap.LOC_4326.usage = {
          Map: "coordinates"
        };
      }
    }
    return itemData;
  }
  function cacheDecorator(originalFunction) {
    var map = {};
    return function (id) {
      if (Object.prototype.hasOwnProperty.call(map, id)) {
        return map[id];
      }
      var value = originalFunction.apply(this, [id]);
      map[id] = value;
      return value;
    };
  }
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
  function evaluateTemplate(template, obj) {
    var placeholderRegExp = new RegExp("{{([^{}]*)}}");
    var getProperty = function getProperty(template) {
      var match = placeholderRegExp.exec(template);
      if (!match) {
        return null;
      }
      return match[1];
    };
    var replaceProperty = function replaceProperty(template, property, value) {
      var propertyRegExp = new RegExp("{{" + escapeRegExp(property) + "}}", "g");
      template = template.replace(propertyRegExp, value);
      return template;
    };
    var execute = function execute(template) {
      var property = getProperty(template);
      if (!property) {
        return template;
      }
      template = replaceProperty(template, property, obj[property]);
      return execute(template);
    };
    return execute(template);
  }
  var extractRegExp = new RegExp("<b>(.*?)<\\/b>", "g");
  function extractHighlightedTerms(text) {
    var match;
    var result = [];
    do {
      match = extractRegExp.exec(text);
      if (match) {
        result.push(match[1]);
      }
    } while (match);
    return result;
  }
  function appendRemovingDuplicates(list1, list2) {
    for (var i = 0; i < list2.length; ++i) {
      var element = list2[i];
      if (list1.indexOf(element) < 0) {
        list1.push(element);
      }
    }
  }
  var reservedCharacters = ["\\", "-", "(", ")", "~", "^", "?", '"', ":", "'", "[", "]"];
  var reservedWords = ["AND", "OR", "NOT"];
  var reservedCharacters4FilterCondition = ["\\", '"', "*", "?", "'"];
  function replaceAll(original, search, replacement) {
    return original.split(search).join(replacement);
  }
  function escapeQuery(query) {
    var escapedQuery = query.trim();
    var _iterator = _createForOfIteratorHelper(reservedCharacters),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var specialCharacter = _step.value;
        if (specialCharacter === "'") {
          escapedQuery = replaceAll(escapedQuery, specialCharacter, "''");
        } else {
          escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var _iterator2 = _createForOfIteratorHelper(reservedWords),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var specialWord = _step2.value;
        if (escapedQuery === specialWord) {
          escapedQuery = '"' + specialWord + '"';
        }
        if (escapedQuery.startsWith(specialWord + " ")) {
          escapedQuery = '"' + specialWord + '" ' + escapedQuery.substring(specialWord.length + 1);
        }
        if (escapedQuery.endsWith(" " + specialWord)) {
          escapedQuery = escapedQuery.substring(0, escapedQuery.length - (specialWord.length + 1)) + ' "' + specialWord + '"';
        }
        escapedQuery = replaceAll(escapedQuery, " " + specialWord + " ", ' "' + specialWord + '" ');
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    if (escapedQuery === "") {
      escapedQuery = "*";
    }
    return escapedQuery;
  }
  function escapeFilterCondition(query) {
    var escapedQuery = query.trim();
    var _iterator3 = _createForOfIteratorHelper(reservedCharacters4FilterCondition),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var specialCharacter = _step3.value;
        if (specialCharacter === "'") {
          escapedQuery = replaceAll(escapedQuery, specialCharacter, "''");
        } else {
          escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    if (escapedQuery === "") {
      escapedQuery = "*";
    }
    return escapedQuery;
  }
  var __exports = {
    __esModule: true
  };
  __exports.hasOwnProperty = hasOwnProperty;
  __exports.timeoutDecorator = timeoutDecorator;
  __exports.refuseOutdatedResponsesDecorator = refuseOutdatedResponsesDecorator;
  __exports.getUrlParameter = getUrlParameter;
  __exports.filterString = filterString;
  __exports.generateTimestamp = generateTimestamp;
  __exports.DelayedConsumer = DelayedConsumer;
  __exports.dateToJson = dateToJson;
  __exports.dateFromJson = dateFromJson;
  __exports.addPotentialNavTargetsToAttribute = addPotentialNavTargetsToAttribute;
  __exports.removePureAdvancedSearchFacets = removePureAdvancedSearchFacets;
  __exports.isMapsAttribute = isMapsAttribute;
  __exports.addGeoDataIfAvailable = addGeoDataIfAvailable;
  __exports.cacheDecorator = cacheDecorator;
  __exports.escapeRegExp = escapeRegExp;
  __exports.evaluateTemplate = evaluateTemplate;
  __exports.extractRegExp = extractRegExp;
  __exports.extractHighlightedTerms = extractHighlightedTerms;
  __exports.appendRemovingDuplicates = appendRemovingDuplicates;
  __exports.escapeQuery = escapeQuery;
  __exports.escapeFilterCondition = escapeFilterCondition;
  return __exports;
});
})();