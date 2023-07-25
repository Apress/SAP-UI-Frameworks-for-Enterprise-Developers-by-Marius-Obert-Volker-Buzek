/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/util", "../../sina/AttributeType", "../../sina/ComparisonOperator", "../../core/errors"], function (sinaUtil, ____sina_AttributeType, ____sina_ComparisonOperator, ____core_errors) {
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var DateConversionError = ____core_errors["DateConversionError"];
  var NotImplementedError = ____core_errors["NotImplementedError"];
  var TimeConversionError = ____core_errors["TimeConversionError"];
  var UnknownAttributeTypeError = ____core_errors["UnknownAttributeTypeError"];
  function sina2Ina(attributeType, value, context) {
    context = context || {};
    switch (attributeType) {
      case AttributeType.Double:
        return value.toString();
      case AttributeType.Integer:
        return value.toString();
      case AttributeType.String:
        return this.sina2InaString(value, context);
      case AttributeType.ImageUrl:
        return value;
      case AttributeType.ImageBlob:
        throw new NotImplementedError();
      case AttributeType.GeoJson:
        return value;
      case AttributeType.Date:
        return this.sina2InaDate(value, context);
      case AttributeType.Time:
        return this.sina2InaTime(value);
      case AttributeType.Timestamp:
        return this.sina2InaTimestamp(value);
      default:
        throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
    }
  }
  function ina2Sina(attributeType, value) {
    // TODO: actually the return type is Value but it leads to a lot of type issues
    switch (attributeType) {
      case AttributeType.Double:
        return parseFloat(value);
      case AttributeType.Integer:
        return parseInt(value, 10);
      case AttributeType.String:
        return value;
      case AttributeType.ImageUrl:
        return value;
      case AttributeType.ImageBlob:
        throw new NotImplementedError();
      case AttributeType.GeoJson:
        return value;
      case AttributeType.Date:
        return this.ina2SinaDate(value);
      case AttributeType.Time:
        return this.ina2SinaTime(value);
      case AttributeType.Timestamp:
        return this.ina2SinaTimestamp(value);
      default:
        throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
    }
  }
  function ina2SinaTimestamp(value) {
    value = value.trim();
    var year, month, day, hour, minute, seconds, microseconds;
    if (value.indexOf("-") >= 0) {
      // ina:2017-01-01 00:00:00.0000000
      // sina: Date object
      year = parseInt(value.slice(0, 4), 10);
      month = parseInt(value.slice(5, 7), 10);
      day = parseInt(value.slice(8, 10), 10);
      hour = parseInt(value.slice(11, 13), 10);
      minute = parseInt(value.slice(14, 16), 10);
      seconds = parseInt(value.slice(17, 19), 10);
      microseconds = parseInt(value.slice(20, 20 + 6), 10);
    } else {
      // ina:20170201105936.0000000
      // sina: Date object
      year = parseInt(value.slice(0, 4), 10);
      month = parseInt(value.slice(4, 6), 10);
      day = parseInt(value.slice(6, 8), 10);
      hour = parseInt(value.slice(8, 10), 10);
      minute = parseInt(value.slice(10, 12), 10);
      seconds = parseInt(value.slice(12, 14), 10);
      microseconds = parseInt(value.slice(15, 15 + 6), 10);
    }
    var d = new Date(Date.UTC(year, month - 1, day, hour, minute, seconds, microseconds / 1000));
    return d;
  }
  function sina2InaTimestamp(value) {
    // ina:2017-01-01 00:00:00.0000000
    // sina: Date object
    var year = value.getUTCFullYear();
    var month = value.getUTCMonth() + 1;
    var day = value.getUTCDate();
    var hour = value.getUTCHours();
    var minute = value.getUTCMinutes();
    var seconds = value.getUTCSeconds();
    var microseconds = value.getUTCMilliseconds() * 1000;
    var result = this.addLeadingZeros(year.toString(), 4) + "-" + this.addLeadingZeros(month.toString(), 2) + "-" + this.addLeadingZeros(day.toString(), 2) + " " + this.addLeadingZeros(hour.toString(), 2) + ":" + this.addLeadingZeros(minute.toString(), 2) + ":" + this.addLeadingZeros(seconds.toString(), 2) + "." + this.addLeadingZeros(microseconds.toString(), 6);
    return result;
  }
  function ina2SinaTime(value) {
    value = value.trim();
    if (value.length === 6) {
      // conversion for result list
      // ina: hhmmss
      // sina: hh:mm:ss
      return value.slice(0, 2) + ":" + value.slice(2, 4) + ":" + value.slice(4, 6);
    }
    if (value.length === 8) {
      // conversion for facet item
      // ina: hh:mm:ss
      // sina: hh:mm:ss
      return value.slice(0, 2) + ":" + value.slice(3, 5) + ":" + value.slice(6, 8);
    }
    throw new TimeConversionError("time conversion error " + value);
  }
  function sina2InaTime(value) {
    // conversion for filter condition
    // ina: hhmmss
    // sina: hh:mm:ss
    return value.slice(0, 2) + ":" + value.slice(3, 5) + ":" + value.slice(6, 8);
  }
  function ina2SinaDate(value) {
    value = value.trim();
    if (value.length === 8) {
      // conversion for result list
      // ina: YYYYMMDD
      // sina: YYYY/MM/DD
      return value.slice(0, 4) + "/" + value.slice(4, 6) + "/" + value.slice(6, 8);
    }
    if (value.length === 27) {
      // conversion for facet item
      // ina: YYYY-MM-DD HH:MM:SS.SSSSSSS
      // sina: YYYY/MM/DD
      return value.slice(0, 4) + "/" + value.slice(5, 7) + "/" + value.slice(8, 10);
    }
    throw new DateConversionError("date conversion error " + value);
  }
  function sina2InaDate(value, context) {
    // conversion for filter condition
    // ina: YYYY-MM-DD HH:MM:SS.SSSSSSS
    // sina: YYYY/MM/DD
    var result = value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
    if (context.operator === ComparisonOperator.Lt || context.operator === ComparisonOperator.Le) {
      result += " 23:59:59.0000000";
    } else {
      result += " 00:00:00.0000000";
    }
    return result;
  }
  function sina2InaString(value, context) {
    return sinaUtil.convertOperator2Wildcards(value, context.operator);
  }
  function addLeadingZeros(value, length) {
    return "00000000000000".slice(0, length - value.length) + value;
  }
  var __exports = {
    __esModule: true
  };
  __exports.sina2Ina = sina2Ina;
  __exports.ina2Sina = ina2Sina;
  __exports.ina2SinaTimestamp = ina2SinaTimestamp;
  __exports.sina2InaTimestamp = sina2InaTimestamp;
  __exports.ina2SinaTime = ina2SinaTime;
  __exports.sina2InaTime = sina2InaTime;
  __exports.ina2SinaDate = ina2SinaDate;
  __exports.sina2InaDate = sina2InaDate;
  __exports.sina2InaString = sina2InaString;
  __exports.addLeadingZeros = addLeadingZeros;
  return __exports;
});
})();