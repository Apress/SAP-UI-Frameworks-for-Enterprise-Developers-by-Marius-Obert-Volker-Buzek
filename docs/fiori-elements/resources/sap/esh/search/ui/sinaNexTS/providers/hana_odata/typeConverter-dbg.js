/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../sina/util", "../../sina/AttributeType", "../../core/errors"], function (sinaUtil, ____sina_AttributeType, ____core_errors) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var UnknownAttributeTypeError = ____core_errors["UnknownAttributeTypeError"];
  function sina2Odata(attributeType, value, context) {
    switch (attributeType) {
      case AttributeType.Double:
        return value.toString();
      case AttributeType.Integer:
        return value.toString();
      case AttributeType.String:
        return this.sina2OdataString(value, context);
      case AttributeType.ImageUrl:
      case AttributeType.ImageBlob:
        return value;
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
  function sina2OdataString(value, context) {
    return sinaUtil.convertOperator2Wildcards(value, context.operator);
  }
  function odata2Sina(attributeType, value) {
    switch (attributeType) {
      case AttributeType.Double:
        if (!value) {
          return 0.0;
        }
        return parseFloat(value);
      case AttributeType.Integer:
        if (!value) {
          return 0;
        }
        return parseInt(value, 10);
      case AttributeType.String:
        if (!value) {
          return "";
        }
        if (Array.isArray(value)) {
          var collectionValue = "";
          for (var i = 0; i < value.length; i++) {
            if (_typeof(value[i]) === "object") {
              value[i] = JSON.stringify(value[i]);
            } else {
              value[i] = value[i].toString();
            }
            if (i === 0) {
              collectionValue = value[i];
            } else {
              collectionValue = collectionValue + "; " + value[i];
            }
          }
          return collectionValue;
        }
        return value;
      case AttributeType.ImageUrl:
      case AttributeType.ImageBlob:
        if (!value) {
          return "";
        }
        return value;
      case AttributeType.GeoJson:
        if (!value) {
          return {};
        }
        return value;
      case AttributeType.Date:
        if (!value) {
          return null; // type is object, not string
        }

        return this.odata2SinaDate(value);
      case AttributeType.Time:
        if (!value) {
          return null; // type is object, not string
        }

        return this.odata2SinaTime(value);
      case AttributeType.Timestamp:
        if (!value) {
          return null; // type is object, not string
        }

        return this.odata2SinaTimestamp(value);
      default:
        throw new UnknownAttributeTypeError("unknown attribute type " + attributeType);
    }
  }
  function odata2SinaTimestamp(value) {
    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object of UTC

    return new Date(Date.parse(value));

    /*
    value = value.trim();
     var year, month, day, hour, minute, seconds;
    year = parseInt(value.slice(0, 4), 10);
    month = parseInt(value.slice(5, 7), 10);
    day = parseInt(value.slice(8, 10), 10);
    hour = parseInt(value.slice(11, 13), 10);
    minute = parseInt(value.slice(14, 16), 10);
    seconds = parseInt(value.slice(17, 19), 10);
     return new Date(Date.UTC(year, month - 1, day, hour, minute, seconds));
    */
  }

  function sina2OdataTimestamp(value) {
    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object

    if (typeof value === "string") {
      if (value.length === 0) {
        return "";
      }
      if (value === "$$now$$") {
        value = new Date();
      }
    }
    var year = value.getUTCFullYear();
    var month = value.getUTCMonth() + 1;
    var day = value.getUTCDate();
    var hour = value.getUTCHours();
    var minute = value.getUTCMinutes();
    var seconds = value.getUTCSeconds();
    var result = this.addLeadingZeros(year.toString(), 4) + "-" + this.addLeadingZeros(month.toString(), 2) + "-" + this.addLeadingZeros(day.toString(), 2) + "T" + this.addLeadingZeros(hour.toString(), 2) + ":" + this.addLeadingZeros(minute.toString(), 2) + ":" + this.addLeadingZeros(seconds.toString(), 2) + "Z";
    // this.addLeadingZeros(microseconds.toString(), 7) + 'Z';

    return result;
  }
  function odata2SinaTime(value) {
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    value = value.trim();
    return value;
    //            if(value.indexOf(":") === 2){
    //                return value;
    //            }else{
    //                return value.slice(0, 2) + ':' + value.slice(2, 4) + ':' + value.slice(4, 6);
    //            }
  }

  function sina2OdataTime(value) {
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    return value;
    //            return value.slice(0, 2) + value.slice(3, 5) + value.slice(6, 8);
  }

  function odata2SinaDate(value) {
    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    value = value.trim();
    return value.slice(0, 4) + "/" + value.slice(5, 7) + "/" + value.slice(8, 10);
    //return value.slice(0, 4) + '/' + value.slice(4, 6) + '/' + value.slice(6, 8);
  }

  function sina2OdataDate(value) {
    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    return value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
    //return value.slice(0, 4) + value.slice(5, 7) + value.slice(8, 10);
  }

  function addLeadingZeros(value, length) {
    return "00000000000000".slice(0, length - value.length) + value;
  }
  var __exports = {
    __esModule: true
  };
  __exports.sina2Odata = sina2Odata;
  __exports.sina2OdataString = sina2OdataString;
  __exports.odata2Sina = odata2Sina;
  __exports.odata2SinaTimestamp = odata2SinaTimestamp;
  __exports.sina2OdataTimestamp = sina2OdataTimestamp;
  __exports.odata2SinaTime = odata2SinaTime;
  __exports.sina2OdataTime = sina2OdataTime;
  __exports.odata2SinaDate = odata2SinaDate;
  __exports.sina2OdataDate = sina2OdataDate;
  __exports.addLeadingZeros = addLeadingZeros;
  return __exports;
});
})();