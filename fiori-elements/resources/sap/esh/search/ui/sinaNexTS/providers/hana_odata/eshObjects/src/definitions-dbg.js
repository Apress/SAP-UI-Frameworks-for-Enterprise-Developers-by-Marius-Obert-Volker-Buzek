/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  /* eslint-disable max-classes-per-file */
  /** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */

  var reservedCharacters = ["\\", "-", "(", ")", "~", "^", "?", "\"", ":", "'", "[", "]"]; //add new elements at the end of the array
  var reservedWords = ["AND", "OR", "NOT"];
  function replaceAll(original, search, replacement) {
    return original.split(search).join(replacement);
  }
  var escapeSingleQuote = function escapeSingleQuote(value) {
    return value.replace(/'/g, "''");
  };
  var escapeDoubleQuoteAndBackslash = function escapeDoubleQuoteAndBackslash(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  };
  function escapeQuery(query) {
    var escapedQuery = query ? query.trim() : "";
    if (escapedQuery !== "") {
      var _iterator = _createForOfIteratorHelper(reservedCharacters),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var specialCharacter = _step.value;
          if (specialCharacter) {
            if (specialCharacter === "'") {
              escapedQuery = escapeSingleQuote(escapedQuery);
            } else {
              escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
            }
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
            escapedQuery = "\"" + specialWord + "\"";
          }
          if (escapedQuery.startsWith(specialWord + " ")) {
            escapedQuery = "\"" + specialWord + "\" " + escapedQuery.substring(specialWord.length + 1);
          }
          if (escapedQuery.endsWith(" " + specialWord)) {
            escapedQuery = escapedQuery.substring(0, escapedQuery.length - (specialWord.length + 1)) + " \"" + specialWord + "\"";
          }
          //escapedQuery = replaceAll(escapedQuery, " " + specialWord + " ", " \"" + specialWord + "\" ");
          escapedQuery = escapedQuery.replace(new RegExp(" ".concat(specialWord, " "), 'g'), " \"".concat(specialWord, "\" "));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    //if (escapedQuery === "") {
    //  escapedQuery = " ";
    //}
    return escapedQuery;
  }
  function escapeQueryWithCustomLength(query, length) {
    return escapeQuery(query).substring(0, length);
  }
  function escapeQueryWithDefaultLength(query) {
    return escapeQuery(query).substring(0, 1500);
  }
  function existValueInEnum(type, value) {
    return Object.keys(type).filter(function (k) {
      return isNaN(Number(k));
    }).filter(function (k) {
      return type[k] === value;
    }).length > 0;
  }
  var NearOrdering;
  (function (NearOrdering) {
    NearOrdering["Ordered"] = "O";
    NearOrdering["Unordered"] = "U";
  })(NearOrdering || (NearOrdering = {}));
  var ListValues = /*#__PURE__*/function () {
    function ListValues(item) {
      _classCallCheck(this, ListValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.values = item.values;
    }
    _createClass(ListValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "[".concat(this.values.map(function (value) {
          return typeof value === "string" ? "'" + escapeSingleQuote(value) + "'" : value.toStatement();
        }).join(","), "]");
      }
    }]);
    return ListValues;
  }();
  var NullValue = /*#__PURE__*/function () {
    function NullValue() {
      _classCallCheck(this, NullValue);
      _defineProperty(this, "clazz", this.constructor.name);
    }
    _createClass(NullValue, [{
      key: "toStatement",
      value: function toStatement() {
        return "null";
      }
    }]);
    return NullValue;
  }();
  var BooleanValue = /*#__PURE__*/function () {
    function BooleanValue(item) {
      _classCallCheck(this, BooleanValue);
      _defineProperty(this, "clazz", this.constructor.name);
      this.value = item.value;
    }
    _createClass(BooleanValue, [{
      key: "toStatement",
      value: function toStatement() {
        return this.value.toString();
      }
    }]);
    return BooleanValue;
  }();
  var NumberValue = /*#__PURE__*/function () {
    function NumberValue(item) {
      _classCallCheck(this, NumberValue);
      _defineProperty(this, "clazz", this.constructor.name);
      this.value = item.value;
    }
    _createClass(NumberValue, [{
      key: "toStatement",
      value: function toStatement() {
        return String(this.value);
      }
    }]);
    return NumberValue;
  }();
  var StringValue = /*#__PURE__*/function () {
    function StringValue(item) {
      _classCallCheck(this, StringValue);
      _defineProperty(this, "clazz", this.constructor.name);
      this.value = item.value;
      this.isQuoted = item.isQuoted;
      this.isSingleQuoted = item.isSingleQuoted;
      this.withoutEnclosing = item.withoutEnclosing;
    }
    _createClass(StringValue, [{
      key: "toStatement",
      value: function toStatement() {
        if (this.withoutEnclosing) {
          return String(Number.parseFloat(this.value));
        }
        if (this.isQuoted) {
          return "\"".concat(escapeDoubleQuoteAndBackslash(this.value), "\"");
        }
        if (this.isSingleQuoted) {
          return "'".concat(escapeSingleQuote(this.value), "'");
        }
        return this.value;
      }
    }]);
    return StringValue;
  }();
  var ViewParameter = /*#__PURE__*/function () {
    function ViewParameter(item) {
      _classCallCheck(this, ViewParameter);
      _defineProperty(this, "clazz", this.constructor.name);
      this.param = item.param;
    }
    _createClass(ViewParameter, [{
      key: "toStatement",
      value: function toStatement() {
        return "param \"".concat(escapeDoubleQuoteAndBackslash(this.param), "\"");
      }
    }]);
    return ViewParameter;
  }();
  var HierarchyFacet = /*#__PURE__*/function () {
    function HierarchyFacet(item) {
      _classCallCheck(this, HierarchyFacet);
      _defineProperty(this, "clazz", this.constructor.name);
      this.facetColumn = item.facetColumn;
      this.rootIds = item.rootIds;
      this.levels = item.levels;
    }
    _createClass(HierarchyFacet, [{
      key: "toStatement",
      value: function toStatement() {
        return "(".concat(this.facetColumn, ",(").concat(this.rootIds.map(function (id) {
          return id ? "'" + id + "'" : "null";
        }).join(","), "),").concat(this.levels, ")");
      }
    }]);
    return HierarchyFacet;
  }();
  var NearOperator = /*#__PURE__*/function () {
    function NearOperator(item) {
      _classCallCheck(this, NearOperator);
      _defineProperty(this, "clazz", this.constructor.name);
      this.distance = item.distance;
      this.ordering = item.ordering;
    }
    _createClass(NearOperator, [{
      key: "toStatement",
      value: function toStatement() {
        return ":NEAR(".concat(this.distance).concat(this.ordering ? "," + this.ordering : "", "):");
      }
    }]);
    return NearOperator;
  }();
  var InListOperator;
  (function (InListOperator) {
    InListOperator["AND"] = "AND";
    InListOperator["OR"] = "OR";
  })(InListOperator || (InListOperator = {}));
  var InList = /*#__PURE__*/function () {
    function InList(item) {
      _classCallCheck(this, InList);
      _defineProperty(this, "clazz", this.constructor.name);
      this.operator = item.operator;
      this.values = item.values;
    }
    _createClass(InList, [{
      key: "toStatement",
      value: function toStatement() {
        return "".concat(this.operator, "(").concat(this.values.join(" "), ")");
      }
    }]);
    return InList;
  }();
  var SpatialReferenceSystemsOperatorBase = /*#__PURE__*/function () {
    function SpatialReferenceSystemsOperatorBase(functionName, id) {
      _classCallCheck(this, SpatialReferenceSystemsOperatorBase);
      _defineProperty(this, "clazz", this.constructor.name);
      this.functionName = functionName;
      this.id = id;
    }
    _createClass(SpatialReferenceSystemsOperatorBase, [{
      key: "toStatement",
      value: function toStatement() {
        return ":".concat(this.functionName).concat(this.id ? "(" + this.id + ")" : "", ":");
      }
    }]);
    return SpatialReferenceSystemsOperatorBase;
  }();
  var SpatialReferenceSystemsOperator = /*#__PURE__*/function () {
    function SpatialReferenceSystemsOperator(item) {
      _classCallCheck(this, SpatialReferenceSystemsOperator);
      _defineProperty(this, "clazz", this.constructor.name);
      this.id = item.id;
    }
    _createClass(SpatialReferenceSystemsOperator, [{
      key: "toStatement",
      value: function toStatement() {
        return ":".concat(this.id ? "(" + this.id + "):" : "");
      }
    }]);
    return SpatialReferenceSystemsOperator;
  }();
  var WithinOperator = /*#__PURE__*/function (_SpatialReferenceSyst) {
    _inherits(WithinOperator, _SpatialReferenceSyst);
    var _super = _createSuper(WithinOperator);
    function WithinOperator(item) {
      _classCallCheck(this, WithinOperator);
      return _super.call(this, "WITHIN", item.id);
    }
    return _createClass(WithinOperator);
  }(SpatialReferenceSystemsOperatorBase);
  var CoveredByOperator = /*#__PURE__*/function (_SpatialReferenceSyst2) {
    _inherits(CoveredByOperator, _SpatialReferenceSyst2);
    var _super2 = _createSuper(CoveredByOperator);
    function CoveredByOperator(item) {
      _classCallCheck(this, CoveredByOperator);
      return _super2.call(this, "COVERED_BY", item.id);
    }
    return _createClass(CoveredByOperator);
  }(SpatialReferenceSystemsOperatorBase);
  var IntersectsOperator = /*#__PURE__*/function (_SpatialReferenceSyst3) {
    _inherits(IntersectsOperator, _SpatialReferenceSyst3);
    var _super3 = _createSuper(IntersectsOperator);
    function IntersectsOperator(item) {
      _classCallCheck(this, IntersectsOperator);
      return _super3.call(this, "INTERSECTS", item.id);
    }
    return _createClass(IntersectsOperator);
  }(SpatialReferenceSystemsOperatorBase);
  var pointCoordinates = function pointCoordinates(item) {
    return "".concat(item.x, " ").concat(item.y);
  };
  var PointValues = /*#__PURE__*/function () {
    function PointValues(point) {
      _classCallCheck(this, PointValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.point = point;
    }
    _createClass(PointValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "POINT(".concat(pointCoordinates(this.point), ")");
      }
    }]);
    return PointValues;
  }();
  var MultiPointValues = /*#__PURE__*/function () {
    function MultiPointValues(points) {
      _classCallCheck(this, MultiPointValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.points = points;
    }
    _createClass(MultiPointValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "MULTIPOINT(".concat(this.points.map(function (point) {
          return "(" + pointCoordinates(point) + ")";
        }).join(","), ")");
      }
    }]);
    return MultiPointValues;
  }();
  var LineStringValues = /*#__PURE__*/function () {
    function LineStringValues(points) {
      _classCallCheck(this, LineStringValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.points = points;
    }
    _createClass(LineStringValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "LINESTRING".concat(LineStringValues.toLineStringArray(this.points));
      }
    }], [{
      key: "toLineStringArray",
      value: function toLineStringArray(points) {
        return "(".concat(points.map(function (point) {
          return pointCoordinates(point);
        }).join(", "), ")");
      }
    }]);
    return LineStringValues;
  }();
  var CircularStringValues = /*#__PURE__*/function (_LineStringValues) {
    _inherits(CircularStringValues, _LineStringValues);
    var _super4 = _createSuper(CircularStringValues);
    function CircularStringValues(points) {
      _classCallCheck(this, CircularStringValues);
      return _super4.call(this, points);
    }
    _createClass(CircularStringValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "CIRCULARSTRING".concat(LineStringValues.toLineStringArray(this.points));
      }
    }]);
    return CircularStringValues;
  }(LineStringValues);
  var MultiLineStringValues = /*#__PURE__*/function () {
    function MultiLineStringValues(points) {
      _classCallCheck(this, MultiLineStringValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.lineStrings = points;
    }
    _createClass(MultiLineStringValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "MULTILINESTRING(".concat(this.lineStrings.map(function (lineString) {
          return LineStringValues.toLineStringArray(lineString);
        }).join(", "), ")");
      }
    }]);
    return MultiLineStringValues;
  }();
  var PolygonValues = /*#__PURE__*/function (_MultiLineStringValue) {
    _inherits(PolygonValues, _MultiLineStringValue);
    var _super5 = _createSuper(PolygonValues);
    function PolygonValues(points) {
      _classCallCheck(this, PolygonValues);
      return _super5.call(this, points);
    }
    _createClass(PolygonValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "POLYGON".concat(PolygonValues.toPolygonStringArray(this.lineStrings));
      }
    }], [{
      key: "toPolygonStringArray",
      value: function toPolygonStringArray(polygon) {
        return "(".concat(polygon.map(function (lineString) {
          return LineStringValues.toLineStringArray(lineString);
        }).join(", "), ")");
      }
    }]);
    return PolygonValues;
  }(MultiLineStringValues);
  var MultiPolygonValues = /*#__PURE__*/function () {
    function MultiPolygonValues(polygons) {
      _classCallCheck(this, MultiPolygonValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.polygons = polygons;
    }
    _createClass(MultiPolygonValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "MULTIPOLYGON(".concat(this.polygons.map(function (polygon) {
          return PolygonValues.toPolygonStringArray(polygon);
        }).join(", "), ")");
      }
    }]);
    return MultiPolygonValues;
  }();
  var GeometryCollectionValues = /*#__PURE__*/function () {
    function GeometryCollectionValues(geometryCollection) {
      _classCallCheck(this, GeometryCollectionValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.geometryCollection = geometryCollection;
    }
    _createClass(GeometryCollectionValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "GEOMETRYCOLLECTION(".concat(this.geometryCollection.map(function (geometry) {
          return geometry.toStatement();
        }).join(", "), ")");
      }
    }]);
    return GeometryCollectionValues;
  }();
  var RangeValues = /*#__PURE__*/function () {
    function RangeValues(item) {
      _classCallCheck(this, RangeValues);
      _defineProperty(this, "clazz", this.constructor.name);
      this.start = item.start;
      this.end = item.end;
      this.excludeStart = item.excludeStart;
      this.excludeEnd = item.excludeEnd;
    }
    _createClass(RangeValues, [{
      key: "toStatement",
      value: function toStatement() {
        return "".concat(this.excludeStart ? "]" : "[").concat(escapeQuery(this.start.toString()), " ").concat(escapeQuery(this.end.toString())).concat(this.excludeEnd ? "[" : "]");
      }
    }]);
    return RangeValues;
  }();
  var Comparison = /*#__PURE__*/function () {
    function Comparison(item) {
      _classCallCheck(this, Comparison);
      _defineProperty(this, "clazz", this.constructor.name);
      this.property = item.property;
      this.operator = item.operator;
      this.value = item.value;
      this.valueAsReservedWord = item.valueAsReservedWord;
      this.searchOptions = item.searchOptions;
    }
    _createClass(Comparison, [{
      key: "toStatement",
      value: function toStatement() {
        var escapeValueCharStart = "";
        var escapeValueCharEnd = "";
        /* 
        if (existValueInEnum(ComparisonOperator, this.operator)) {
          if (this.valueAsReservedWord) {
            escapeValueCharStart = "";
            escapeValueCharEnd = "";
          } else {
            escapeValueCharStart = "'";
            escapeValueCharEnd = "'";
          }
        } else if (this.operator === SearchQueryComparisonOperator.Fuzzy) {
          escapeValueCharStart = "(";
          escapeValueCharEnd = ")";
        } */
        var isODataComparison = false;
        if (existValueInEnum(ComparisonOperator, this.operator)) {
          isODataComparison = true;
          if (this.value && (this.value instanceof NullValue || this.value instanceof BooleanValue || this.value instanceof NumberValue || this.value instanceof ListValues || this.value instanceof ViewParameter)) {
            this.valueAsReservedWord = true;
          }
          if (this.valueAsReservedWord) {
            escapeValueCharStart = "";
            escapeValueCharEnd = "";
          } else {
            escapeValueCharStart = "'";
            escapeValueCharEnd = "'";
          }
        }
        var propertyValues = typeof this.property === "string" ? this.property : this.property.toStatement();
        var valueQuery = "";
        if (this.value) {
          if (typeof this.value === "string") {
            if (isODataComparison) {
              valueQuery = escapeSingleQuote(this.value);
            } else {
              valueQuery = escapeQuery(this.value.toString());
            }
          } else {
            valueQuery = this.value.toStatement();
          }
          // valueQuery = typeof (this.value) === "string" ? escapeQuery(this.value.toString()) : this.value.toStatement();
        }

        var comparisonOperator = typeof this.operator === "string" ? this.operator : this.operator.toStatement();
        var comparisonStatement = propertyValues + comparisonOperator + escapeValueCharStart + valueQuery + escapeValueCharEnd;
        return addFuzzySearchOptions(comparisonStatement, this.searchOptions);
      }
    }]);
    return Comparison;
  }();
  var ScopeComparison = /*#__PURE__*/function () {
    function ScopeComparison(item) {
      _classCallCheck(this, ScopeComparison);
      _defineProperty(this, "clazz", this.constructor.name);
      this.values = item.values;
    }
    _createClass(ScopeComparison, [{
      key: "toStatement",
      value: function toStatement() {
        if (this.values.length === 0) {
          throw new Error("ScopeComparison values cannot be empty");
        }
        return this.values.length > 1 ? "SCOPE:(".concat(this.values.join(" OR "), ")") : "SCOPE:".concat(this.values[0]);
      }
    }]);
    return ScopeComparison;
  }();
  var Term = /*#__PURE__*/function () {
    function Term(item) {
      _classCallCheck(this, Term);
      _defineProperty(this, "clazz", this.constructor.name);
      this.term = item.term;
      this.searchOptions = item.searchOptions;
      this.isQuoted = item.isQuoted;
      if (typeof item.doEshEscaping != 'undefined' && item.doEshEscaping != null) {
        this.doEshEscaping = item.doEshEscaping;
      } else {
        this.doEshEscaping = true;
      }
    }
    _createClass(Term, [{
      key: "toStatement",
      value: function toStatement() {
        var finalTerm;
        if (this.doEshEscaping) {
          finalTerm = this.isQuoted ? '"' + escapePhrase(this.term) + '"' : escapeQuery(this.term);
        } else {
          finalTerm = this.isQuoted ? '"' + this.term + '"' : this.term;
        }
        return addFuzzySearchOptions(finalTerm, this.searchOptions);
      }
    }]);
    return Term;
  }();
  var escapePhrase = function escapePhrase(value) {
    var returnValue = value.replace(/\\/g, '\\\\');
    returnValue = returnValue.replace(/"/g, '\\"');
    // returnValue = returnValue.replace(/\*/g, '\\*'); // do not escape *
    returnValue = returnValue.replace(/\?/g, '\\?');
    returnValue = returnValue.replace(/\'/g, "''");
    return returnValue;
  };
  var Phrase = /*#__PURE__*/function () {
    function Phrase(item) {
      _classCallCheck(this, Phrase);
      _defineProperty(this, "clazz", this.constructor.name);
      this.phrase = item.phrase;
      this.searchOptions = item.searchOptions;
      if (typeof item.doEshEscaping != 'undefined' && item.doEshEscaping != null) {
        this.doEshEscaping = item.doEshEscaping;
      } else {
        this.doEshEscaping = true;
      }
    }
    _createClass(Phrase, [{
      key: "toStatement",
      value: function toStatement() {
        var finalPhrase;
        if (this.doEshEscaping) {
          finalPhrase = escapePhrase(this.phrase);
        } else {
          finalPhrase = this.phrase;
        }
        // return addFuzzySearchOptions("\"" + replaceAll(this.phrase, '"', '\\"') + "\"", this.searchOptions);
        // return addFuzzySearchOptions("\"" + this.phrase.replace(/"/g, '\\"') + "\"", this.searchOptions);
        // return addFuzzySearchOptions("\"" + escapePhrase(this.phrase) + "\"", this.searchOptions);
        return addFuzzySearchOptions("\"" + finalPhrase + "\"", this.searchOptions);
      }
    }]);
    return Phrase;
  }();
  var Near = /*#__PURE__*/function () {
    function Near(item) {
      _classCallCheck(this, Near);
      _defineProperty(this, "clazz", this.constructor.name);
      this.terms = item.terms;
      this.distance = item.distance;
      this.ordering = item.ordering;
      this.searchOptions = item.searchOptions;
    }
    _createClass(Near, [{
      key: "toStatement",
      value: function toStatement() {
        var values = [];
        this.terms.forEach(function (value) {
          values.push(typeof value === "string" ? value : value.toStatement());
        });
        var nearStatement = "NEAR(".concat(this.distance).concat(this.ordering ? "," + this.ordering : "", "):(").concat(values.join(" "), ")");
        return addFuzzySearchOptions(nearStatement, this.searchOptions);
      }
    }]);
    return Near;
  }();
  var Property = /*#__PURE__*/function () {
    // searchOptions: ISearchOptions

    function Property(item) {
      _classCallCheck(this, Property);
      _defineProperty(this, "clazz", this.constructor.name);
      this.property = item.property;
      this.prefixOperator = item.prefixOperator;
    }
    _createClass(Property, [{
      key: "toStatement",
      value: function toStatement() {
        if (this.prefixOperator) {
          return this.prefixOperator + " " + this.property;
        }
        return this.property;
      }
    }]);
    return Property;
  }();
  var LogicalOperator;
  (function (LogicalOperator) {
    LogicalOperator["and"] = "and";
    LogicalOperator["or"] = "or";
    LogicalOperator["not"] = "not";
  })(LogicalOperator || (LogicalOperator = {}));
  var SearchQueryLogicalOperator;
  (function (SearchQueryLogicalOperator) {
    SearchQueryLogicalOperator["AND"] = "AND";
    SearchQueryLogicalOperator["TIGHT_AND"] = "";
    SearchQueryLogicalOperator["OR"] = "OR";
    SearchQueryLogicalOperator["NOT"] = "NOT";
    SearchQueryLogicalOperator["ROW"] = "ROW";
    SearchQueryLogicalOperator["AUTH"] = "AUTH";
    SearchQueryLogicalOperator["FILTER"] = "FILTER";
    SearchQueryLogicalOperator["FILTERWF"] = "FILTERWF";
    SearchQueryLogicalOperator["BOOST"] = "BOOST";
  })(SearchQueryLogicalOperator || (SearchQueryLogicalOperator = {}));
  var SearchQueryPrefixOperator;
  (function (SearchQueryPrefixOperator) {
    SearchQueryPrefixOperator["AND"] = "AND";
    SearchQueryPrefixOperator["OR"] = "OR";
    SearchQueryPrefixOperator["NOT"] = "NOT";
    SearchQueryPrefixOperator["AND_NOT"] = "AND NOT";
    SearchQueryPrefixOperator["OR_NOT"] = "OR NOT";
  })(SearchQueryPrefixOperator || (SearchQueryPrefixOperator = {}));
  function addFuzzySearchOptions(item, searchOptions) {
    var returnStatement = item;
    if (searchOptions) {
      if (searchOptions.fuzzinessThreshold) {
        returnStatement = returnStatement + "~" + searchOptions.fuzzinessThreshold.toString();
      }
      if (searchOptions.fuzzySearchOptions) {
        if (!searchOptions.fuzzinessThreshold) {
          returnStatement = returnStatement + "~0.8"; //default fuzzinessThreshold
        }

        returnStatement = returnStatement + "[" + searchOptions.fuzzySearchOptions + "]";
      }
      if (searchOptions.weight !== undefined) {
        returnStatement = "".concat(returnStatement, "^").concat(searchOptions.weight);
      }
    }
    return returnStatement;
  }
  var Expression = /*#__PURE__*/function () {
    function Expression(item) {
      _classCallCheck(this, Expression);
      _defineProperty(this, "clazz", this.constructor.name);
      this.operator = item.operator;
      this.items = item.items;
      this.searchOptions = item.searchOptions;
    }
    _createClass(Expression, [{
      key: "toStatement",
      value: function toStatement() {
        var returnStatement = "";
        switch (this.operator) {
          case SearchQueryLogicalOperator.ROW:
          case SearchQueryLogicalOperator.AUTH:
          case SearchQueryLogicalOperator.FILTER:
          case SearchQueryLogicalOperator.FILTERWF:
          case SearchQueryLogicalOperator.BOOST:
            var operatorValue = this.items.map(function (i) {
              return i.toStatement();
            }).join(" " + this.operator + " ");
            if (!operatorValue.startsWith("(")) {
              operatorValue = "(" + operatorValue + ")";
            }
            returnStatement = this.operator + ":" + operatorValue;
            break;
          case SearchQueryLogicalOperator.NOT:
            if (this.items.length > 1) {
              throw new Error("Invalid operator. NOT operator is allowed only on a single item.");
            }
            returnStatement = "(NOT " + this.items[0].toStatement() + ")";
            break;
          case LogicalOperator.not:
            if (this.items.length > 1) {
              throw new Error("Invalid operator. 'not' operator is allowed only on a single item.");
            }
            returnStatement = "not " + this.items[0].toStatement();
            break;
          default:
            if (!this.items || this.items.length == 0) {
              return "";
            } else if (this.items.length > 1) {
              var itemsScopes = this.items.filter(function (i) {
                return i instanceof ScopeComparison;
              });
              if (itemsScopes.length > 0) {
                returnStatement = this.items.map(function (i) {
                  return i.toStatement();
                }).join("".concat(this.operator === "" ? " " : " " + this.operator + " "));
              } else {
                returnStatement = "(" + this.items.map(function (i) {
                  return i.toStatement();
                }).join("".concat(this.operator === "" ? " " : " " + this.operator + " ")) + ")";
              }
            } else {
              returnStatement = this.items[0].toStatement();
            }
            break;
        }
        return addFuzzySearchOptions(returnStatement, this.searchOptions);
      }
    }]);
    return Expression;
  }();
  var SearchQueryComparisonOperator;
  (function (SearchQueryComparisonOperator) {
    SearchQueryComparisonOperator["Search"] = ":";
    SearchQueryComparisonOperator["EqualCaseInsensitive"] = ":EQ:";
    SearchQueryComparisonOperator["NotEqualCaseInsensitive"] = ":NE:";
    SearchQueryComparisonOperator["LessThanCaseInsensitive"] = ":LT:";
    SearchQueryComparisonOperator["LessThanOrEqualCaseInsensitive"] = ":LE:";
    SearchQueryComparisonOperator["GreaterThanCaseInsensitive"] = ":GT:";
    SearchQueryComparisonOperator["GreaterThanOrEqualCaseInsensitive"] = ":GE:";
    SearchQueryComparisonOperator["EqualCaseSensitive"] = ":EQ(S):";
    SearchQueryComparisonOperator["NotEqualCaseSensitive"] = ":NE(S):";
    SearchQueryComparisonOperator["LessThanCaseSensitive"] = ":LT(S):";
    SearchQueryComparisonOperator["LessThanOrEqualCaseSensitive"] = ":LE(S):";
    SearchQueryComparisonOperator["GreaterThanCaseSensitive"] = ":GT(S):";
    SearchQueryComparisonOperator["GreaterThanOrEqualCaseSensitive"] = ":GE(S):";
    SearchQueryComparisonOperator["IsNull"] = ":IS:NULL";
    SearchQueryComparisonOperator["BetweenCaseInsensitive"] = ":BT:";
    SearchQueryComparisonOperator["BetweenCaseSensitive"] = ":BT(S):";
    SearchQueryComparisonOperator["DescendantOf"] = ":DESCENDANT_OF:";
    SearchQueryComparisonOperator["ChildOf"] = ":CHILD_OF:";
  })(SearchQueryComparisonOperator || (SearchQueryComparisonOperator = {}));
  var ComparisonOperator;
  (function (ComparisonOperator) {
    ComparisonOperator["Equal"] = " eq ";
    ComparisonOperator["NotEqual"] = " ne ";
    ComparisonOperator["GreaterThan"] = " gt ";
    ComparisonOperator["LessThan"] = " lt ";
    ComparisonOperator["GreaterThanOrEqualTo"] = " ge ";
    ComparisonOperator["LessThanOrEqualTo"] = " le ";
    ComparisonOperator["Is"] = " is ";
    ComparisonOperator["In"] = " in ";
    ComparisonOperator["IsNot"] = " is not ";
  })(ComparisonOperator || (ComparisonOperator = {}));
  var ESOrderType;
  (function (ESOrderType) {
    ESOrderType["Ascending"] = "ASC";
    ESOrderType["Descending"] = "DESC";
  })(ESOrderType || (ESOrderType = {}));
  var SEARCH_DEFAULTS = {
    query: "",
    scope: ""
  };
  var PropertyAlias = /*#__PURE__*/function () {
    function PropertyAlias(item) {
      _classCallCheck(this, PropertyAlias);
      _defineProperty(this, "clazz", this.constructor.name);
      this.path = item.path;
      this.alias = item.alias;
    }
    _createClass(PropertyAlias, [{
      key: "toStatement",
      value: function toStatement() {
        return "".concat(this.path.join("."), " ").concat(this.alias);
        // return `${this.path.map((item)=> "\"" + escapeDoubleQuoteAndBackslash(item) + "\"").join(".")} ${this.alias}`;
      }
    }]);

    return PropertyAlias;
  }();
  var Alias = /*#__PURE__*/function () {
    function Alias(item) {
      _classCallCheck(this, Alias);
      _defineProperty(this, "clazz", this.constructor.name);
      this.type = item.type;
      this.alias = item.alias;
    }
    _createClass(Alias, [{
      key: "toStatement",
      value: function toStatement() {
        return "".concat(this.type, " ").concat(this.alias);
        // return `"${escapeDoubleQuoteAndBackslash(this.type)}" ${this.alias}`;
      }
    }]);

    return Alias;
  }();
  var DynamicView = /*#__PURE__*/function () {
    function DynamicView(item) {
      _classCallCheck(this, DynamicView);
      _defineProperty(this, "clazz", this.constructor.name);
      this.name = item.name;
      this.select = item.select;
      this.aliases = item.aliases;
      this.properties = item.properties;
      this.paths = item.paths;
      this.conditions = item.conditions;
    }
    _createClass(DynamicView, [{
      key: "toStatement",
      value: function toStatement() {
        var returnValue = {
          name: this.name,
          select: this.select.join(", ")
        };
        var listOfAliases = [];
        if (this.aliases) {
          returnValue.aliases = this.aliases.map(function (alias) {
            return alias.toStatement();
          }).join(", ");
          listOfAliases = this.aliases.map(function (item) {
            return item.alias;
          });
        }
        returnValue.properties = this.properties.map(function (property) {
          return property.toStatement();
        }).join(", ");
        returnValue.paths = this.paths.map(function (paths) {
          return paths.map(function (path) {
            return typeof path === 'string' ? path : path.join(".");
          }).join('/');
        }).join(", ");
        if (this.conditions) {
          returnValue.conditions = this.conditions.map(function (condition) {
            return condition.toStatement();
          }).join(", ");
        }
        return Object.keys(returnValue).map(function (key) {
          return "".concat(key, ": ").concat(returnValue[key]);
        }).join("; ") + ";";
      }
    }]);
    return DynamicView;
  }();
  var CustomFunction = /*#__PURE__*/function () {
    function CustomFunction(item) {
      _classCallCheck(this, CustomFunction);
      _defineProperty(this, "clazz", this.constructor.name);
      this.name = item.name;
      this.arguments = item.arguments;
    }
    _createClass(CustomFunction, [{
      key: "toStatement",
      value: function toStatement() {
        var _this = this;
        var argumentsValue = '';
        if (this.arguments) {
          argumentsValue = Object.keys(this.arguments).map(function (key) {
            var singleArgumentValue = "".concat(key, "=");
            if (_this.arguments && typeof _this.arguments[key] === 'string') {
              singleArgumentValue = "'".concat(escapeSingleQuote(_this.arguments[key]), "'");
            } else if (_this.arguments && _this.arguments[key] && _typeof(_this.arguments[key]) === 'object') {
              if (typeof _this.arguments[key].toStatement === "function") {
                if (_this.arguments[key] instanceof CustomFunction || _this.arguments[key] instanceof FilterFunction) {
                  singleArgumentValue = _this.arguments[key].toStatement();
                } else {
                  if (_this.arguments[key] instanceof NumberValue) {
                    singleArgumentValue = _this.arguments[key].toStatement();
                  } else {
                    singleArgumentValue = "'".concat(_this.arguments[key].toStatement(), "'");
                  }
                }
              } else if (Array.isArray(_this.arguments[key])) {
                singleArgumentValue = "[" + _this.arguments[key].map(function (element) {
                  if (element instanceof NumberValue) {
                    return element.toStatement();
                  } else if (typeof element === 'string') {
                    return "'".concat(escapeSingleQuote(element), "'");
                  } else {
                    return String(element);
                  }
                }).join(",") + "]";
              } else {
                throw new Error("Unexpected object: " + _this.arguments[key]);
              }
            } else {
              singleArgumentValue = String(_this.arguments ? String(_this.arguments[key]) : '');
            }
            return "".concat(key, "=").concat(singleArgumentValue);
          }).join(",");
        }
        return "".concat(typeof this.name === "string" ? this.name : this.name.join("."), "(").concat(argumentsValue, ")");
      }
    }]);
    return CustomFunction;
  }();
  var FilterFunction = /*#__PURE__*/function () {
    function FilterFunction(item) {
      _classCallCheck(this, FilterFunction);
      _defineProperty(this, "clazz", this.constructor.name);
      this.customFunction = item.customFunction;
      this.oDataFilter = item.oDataFilter;
    }
    _createClass(FilterFunction, [{
      key: "toStatement",
      value: function toStatement() {
        var returnStatement;
        if (this.customFunction instanceof Expression) {
          var expressionStatement = "Search.search(query='".concat(this.customFunction.toStatement(), "')");
          if (this.oDataFilter) {
            expressionStatement += " and ".concat(this.oDataFilter.toStatement());
          }
          returnStatement = "filter(".concat(expressionStatement, ")");
        } else {
          returnStatement = "filter(".concat(this.customFunction.toStatement());
          if (this.oDataFilter) {
            returnStatement += " and ".concat(this.oDataFilter.toStatement());
          }
          returnStatement += ")";
        }
        return returnStatement;
      }
    }]);
    return FilterFunction;
  }();
  var deserialize = function deserialize(jsonO) {
    //const jsonO = JSON.parse(jsonStr);
    if (_typeof(jsonO) === "object") {
      switch (jsonO.clazz) {
        case "Property":
          return new Property(jsonO);
        case "Near":
          jsonO.terms = jsonO.terms.map(function (item) {
            return deserialize(item);
          });
          return new Near(jsonO);
        case "Phrase":
          return new Phrase(jsonO);
        case "RangeValues":
          return new RangeValues(jsonO);
        case "GeometryCollectionValues":
          return new GeometryCollectionValues(jsonO.geometryCollection.map(function (item) {
            return deserialize(item);
          }));
        case "MultiPolygonValues":
          return new MultiPolygonValues(jsonO.polygons);
        case "MultiLineStringValues":
          return new MultiLineStringValues(jsonO.lineStrings);
        case "CircularStringValues":
          return new CircularStringValues(jsonO.points);
        case "LineStringValues":
          return new LineStringValues(jsonO.points);
        case "MultiPointValues":
          return new MultiPointValues(jsonO.points);
        case "PointValues":
          return new PointValues(jsonO.point);
        case "SpatialReferenceSystemsOperator":
          return new SpatialReferenceSystemsOperator(jsonO);
        case "SpatialReferenceSystemsOperatorBase":
          return new SpatialReferenceSystemsOperatorBase(jsonO);
        case "InList":
          return new InList(jsonO);
        case "NearOperator":
          return new NearOperator(jsonO);
        case "Term":
          return new Term(jsonO);
        case "HierarchyFacet":
          return new HierarchyFacet(jsonO);
        case "Comparison":
          var deserializedComparison = new Comparison(jsonO);
          if (_typeof(deserializedComparison.property) === "object") {
            deserializedComparison.property = deserialize(deserializedComparison.property);
          }
          if (deserializedComparison.operator && _typeof(deserializedComparison.operator) === "object") {
            deserializedComparison.operator = deserialize(deserializedComparison.operator);
          }
          if (deserializedComparison.value && _typeof(deserializedComparison.value) === "object") {
            deserializedComparison.value = deserialize(deserializedComparison.value);
          }
          return deserializedComparison;
        case "ScopeComparison":
          return new ScopeComparison(jsonO);
        case "WithinOperator":
          return new WithinOperator(jsonO);
        case "PolygonValues":
          return new PolygonValues(jsonO.lineStrings);
        case "CoveredByOperator":
          return new CoveredByOperator(jsonO);
        case "IntersectsOperator":
          return new IntersectsOperator(jsonO);
        case "Expression":
          var returnExpression = new Expression(jsonO);
          returnExpression.items = returnExpression.items.map(function (item) {
            return deserialize(item);
          });
          return returnExpression;
        case "DynamicView":
          var returnDynamicView = new DynamicView(jsonO);
          returnDynamicView.properties = returnDynamicView.properties.map(function (property) {
            return deserialize(property);
          });
          if (returnDynamicView.aliases) {
            returnDynamicView.aliases = returnDynamicView.aliases.map(function (alias) {
              return deserialize(alias);
            });
          }
          if (returnDynamicView.conditions) {
            if (Array.isArray(returnDynamicView.conditions)) {
              returnDynamicView.conditions = returnDynamicView.conditions.map(function (condition) {
                return deserialize(condition);
              });
            } else {
              returnDynamicView.conditions = deserialize(returnDynamicView.conditions);
            }
          }
          return returnDynamicView;
        case "Alias":
          return new Alias(jsonO);
        case "PropertyAlias":
          return new PropertyAlias(jsonO);
        case "ListValues":
          var returnValue = new ListValues(jsonO);
          returnValue.values = returnValue.values.map(function (element) {
            return deserialize(element);
          });
          return returnValue;
        case "ViewParameter":
          return new ViewParameter(jsonO);
        case "NullValue":
          return new NullValue();
        case "BooleanValue":
          return new BooleanValue(jsonO);
        case "NumberValue":
          return new NumberValue(jsonO);
        case "StringValue":
          return new StringValue(jsonO);
        case "CustomFunction":
          var returnCustomFunction = new CustomFunction(jsonO);
          if (returnCustomFunction.arguments) {
            Object.keys(returnCustomFunction.arguments).map(function (key) {
              if (returnCustomFunction.arguments && _typeof(returnCustomFunction.arguments[key]) === 'object' && typeof returnCustomFunction.arguments[key].clazz === "string") {
                if (["CustomFunction", "FilterFunction"].includes(returnCustomFunction.arguments[key].clazz)) {
                  returnCustomFunction.arguments[key] = deserialize(returnCustomFunction.arguments[key]);
                } else {
                  throw new Error("Invalid statement in: ".concat(key, " = ").concat(returnCustomFunction.arguments[key]));
                }
              }
            });
          }
          return returnCustomFunction;
        case "FilterFunction":
          var returnFilterFunction = new FilterFunction(jsonO);
          returnFilterFunction.customFunction = deserialize(returnFilterFunction.customFunction);
          if (returnFilterFunction.oDataFilter) {
            returnFilterFunction.oDataFilter = deserialize(returnFilterFunction.oDataFilter);
          }
          return returnFilterFunction;
        default:
          throw new Error("not implemented: " + JSON.stringify(jsonO));
      }
    }
    return jsonO;
  };
  var __exports = {
    __esModule: true
  };
  __exports.escapeSingleQuote = escapeSingleQuote;
  __exports.escapeDoubleQuoteAndBackslash = escapeDoubleQuoteAndBackslash;
  __exports.escapeQuery = escapeQuery;
  __exports.escapeQueryWithCustomLength = escapeQueryWithCustomLength;
  __exports.escapeQueryWithDefaultLength = escapeQueryWithDefaultLength;
  __exports.existValueInEnum = existValueInEnum;
  __exports.NearOrdering = NearOrdering;
  __exports.ListValues = ListValues;
  __exports.NullValue = NullValue;
  __exports.BooleanValue = BooleanValue;
  __exports.NumberValue = NumberValue;
  __exports.StringValue = StringValue;
  __exports.ViewParameter = ViewParameter;
  __exports.HierarchyFacet = HierarchyFacet;
  __exports.NearOperator = NearOperator;
  __exports.InListOperator = InListOperator;
  __exports.InList = InList;
  __exports.SpatialReferenceSystemsOperator = SpatialReferenceSystemsOperator;
  __exports.WithinOperator = WithinOperator;
  __exports.CoveredByOperator = CoveredByOperator;
  __exports.IntersectsOperator = IntersectsOperator;
  __exports.PointValues = PointValues;
  __exports.MultiPointValues = MultiPointValues;
  __exports.LineStringValues = LineStringValues;
  __exports.CircularStringValues = CircularStringValues;
  __exports.MultiLineStringValues = MultiLineStringValues;
  __exports.PolygonValues = PolygonValues;
  __exports.MultiPolygonValues = MultiPolygonValues;
  __exports.GeometryCollectionValues = GeometryCollectionValues;
  __exports.RangeValues = RangeValues;
  __exports.Comparison = Comparison;
  __exports.ScopeComparison = ScopeComparison;
  __exports.Term = Term;
  __exports.escapePhrase = escapePhrase;
  __exports.Phrase = Phrase;
  __exports.Near = Near;
  __exports.Property = Property;
  __exports.LogicalOperator = LogicalOperator;
  __exports.SearchQueryLogicalOperator = SearchQueryLogicalOperator;
  __exports.SearchQueryPrefixOperator = SearchQueryPrefixOperator;
  __exports.Expression = Expression;
  __exports.SearchQueryComparisonOperator = SearchQueryComparisonOperator;
  __exports.ComparisonOperator = ComparisonOperator;
  __exports.ESOrderType = ESOrderType;
  __exports.SEARCH_DEFAULTS = SEARCH_DEFAULTS;
  __exports.PropertyAlias = PropertyAlias;
  __exports.Alias = Alias;
  __exports.DynamicView = DynamicView;
  __exports.CustomFunction = CustomFunction;
  __exports.FilterFunction = FilterFunction;
  __exports.deserialize = deserialize;
  return __exports;
});
})();