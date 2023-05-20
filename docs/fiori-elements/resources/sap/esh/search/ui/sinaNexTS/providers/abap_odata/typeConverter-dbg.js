/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/AttributeType", "../../sina/util", "../../core/errors"], function (____sina_AttributeType, sinaUtil, ____core_errors) {
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var NotImplementedError = ____core_errors["NotImplementedError"];
  var UnknownAttributeTypeError = ____core_errors["UnknownAttributeTypeError"];
  function sina2Odata(attributeType, value) {
    var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    switch (attributeType) {
      case AttributeType.Double:
        return value.toString();
      case AttributeType.Integer:
        return value.toString();
      case AttributeType.String:
        return this.sina2OdataString(value, context);
      case AttributeType.ImageUrl:
        return value;
      case AttributeType.ImageBlob:
        throw new NotImplementedError();
      case AttributeType.GeoJson:
        return value;
      case AttributeType.Date:
        return this.sina2OdataDate(value);
      case AttributeType.Time:
        return this.sina2OdataTime(value);
      case AttributeType.Timestamp:
        return this.sina2OdataTimestamp(value);
      default:
        throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
    }
  }
  function odata2Sina(attributeType, value) {
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
        return this.odata2SinaDate(value);
      case AttributeType.Time:
        return this.odata2SinaTime(value);
      case AttributeType.Timestamp:
        return this.odata2SinaTimestamp(value);
      default:
        throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
    }
  }

  /*export function isDynamicValue(attributeType: AttributeType, value) {
      switch (attributeType) {
          case AttributeType.Double:
              return false; // not supported
          case AttributeType.Integer:
              return false; // not supported
          case AttributeType.String:
              return false; // not supported
          case AttributeType.ImageUrl:
              return false; // not supported
          case AttributeType.ImageBlob:
              throw new NotImplementedError();
          case AttributeType.GeoJson:
              return false; // not supported
          case AttributeType.Date:
              return this.isDynamicValueDate(value);
          case AttributeType.Time:
              return this.isDynamicValueTime(value);
          case AttributeType.Timestamp:
              return this.isDynamicValueTimestamp(value);
          default:
              throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
      }
  }
  
  export function isDynamicValueDate(value: string) {
      if (!value) {
          return false;
      }
      // odata date: YYYY-MM-DD
      // check for "-"
      value = value.trim();
      return value[4] !== "-" || value[7] !== "-";
  }
  
  export function isDynamicValueTime(value: string) {
      if (!value) {
          return false;
      }
      // odata time format: hh:mm:ss
      // check for ":"
      value = value.trim();
      return value[2] !== ":" || value[5] !== ":";
  }
  
  export function isDynamicValueTimestamp(value: string): boolean {
      if (!value) {
          return false;
      }
      // odata timestamp: 2017-12-31T23:59:59.0000000Z
      // check for "-"
      value = value.trim();
      return value[4] !== "-" || value[7] !== "-";
  }*/

  function odata2SinaTimestamp() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    if (value.length === 0) {
      return "";
    }

    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object
    value = value.trim();
    var year = parseInt(value.slice(0, 4), 10);
    var month = parseInt(value.slice(5, 7), 10);
    var day = parseInt(value.slice(8, 10), 10);
    var hour = parseInt(value.slice(11, 13), 10);
    var minute = parseInt(value.slice(14, 16), 10);
    var seconds = parseInt(value.slice(17, 19), 10);
    var microseconds = parseInt(value.slice(20, 20 + 6), 10);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, seconds, microseconds / 1000));
  }
  function sina2OdataTimestamp(value) {
    if (typeof value === "string") {
      if (value.length === 0) {
        return "";
      }
      if (value === "$$now$$") {
        value = new Date();
      }
    }

    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object
    var year = value.getUTCFullYear();
    var month = value.getUTCMonth() + 1;
    var day = value.getUTCDate();
    var hour = value.getUTCHours();
    var minute = value.getUTCMinutes();
    var seconds = value.getUTCSeconds();
    var microseconds = value.getUTCMilliseconds() * 1000;
    var result = this.addLeadingZeros(year.toString(), 4) + "-" + this.addLeadingZeros(month.toString(), 2) + "-" + this.addLeadingZeros(day.toString(), 2) + "T" + this.addLeadingZeros(hour.toString(), 2) + ":" + this.addLeadingZeros(minute.toString(), 2) + ":" + this.addLeadingZeros(seconds.toString(), 2) + "." + this.addLeadingZeros(microseconds.toString(), 7) + "Z";
    return result;
  }
  function odata2SinaTime(value) {
    if (value.length === 0) {
      return "";
    }
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    value = value.trim();
    return value;
  }
  function sina2OdataTime(value) {
    if (value.length === 0) {
      return "";
    }
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    return value;
  }
  function odata2SinaDate(value) {
    if (value.length === 0) {
      return "";
    }

    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    value = value.trim();
    return value.slice(0, 4) + "/" + value.slice(5, 7) + "/" + value.slice(8, 10);
  }
  function sina2OdataDate(value) {
    if (value.length === 0) {
      return "";
    }

    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    return value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
  }
  function sina2OdataString(value, context) {
    return sinaUtil.convertOperator2Wildcards(value, context.operator);
  }
  function addLeadingZeros(value, length) {
    return "00000000000000".slice(0, length - value.length) + value;
  }
  var __exports = {
    __esModule: true
  };
  __exports.sina2Odata = sina2Odata;
  __exports.odata2Sina = odata2Sina;
  __exports.odata2SinaTimestamp = odata2SinaTimestamp;
  __exports.sina2OdataTimestamp = sina2OdataTimestamp;
  __exports.odata2SinaTime = odata2SinaTime;
  __exports.sina2OdataTime = sina2OdataTime;
  __exports.odata2SinaDate = odata2SinaDate;
  __exports.sina2OdataDate = sina2OdataDate;
  __exports.sina2OdataString = sina2OdataString;
  __exports.addLeadingZeros = addLeadingZeros;
  return __exports;
});
})();