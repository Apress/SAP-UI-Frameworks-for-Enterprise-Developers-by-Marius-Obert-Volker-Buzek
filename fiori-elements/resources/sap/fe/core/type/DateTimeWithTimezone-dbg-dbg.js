/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/model/odata/type/DateTimeWithTimezone"], function (ClassSupport, _DateTimeWithTimezone) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let DateTimeWithTimezone = (_dec = defineUI5Class("sap.fe.core.type.DateTimeWithTimezone"), _dec(_class = /*#__PURE__*/function (_DateTimeWithTimezone2) {
    _inheritsLoose(DateTimeWithTimezone, _DateTimeWithTimezone2);
    function DateTimeWithTimezone(oFormatOptions, oConstraints) {
      var _this;
      _this = _DateTimeWithTimezone2.call(this, oFormatOptions, oConstraints) || this;
      _this.bShowTimezoneForEmptyValues = (oFormatOptions === null || oFormatOptions === void 0 ? void 0 : oFormatOptions.showTimezoneForEmptyValues) ?? true;
      return _this;
    }
    var _proto = DateTimeWithTimezone.prototype;
    _proto.formatValue = function formatValue(aValues, sTargetType) {
      const oTimestamp = aValues && aValues[0];
      if (oTimestamp === undefined ||
      // data is not yet available
      // if time zone is not shown falsy timestamps cannot be formatted -> return null
      !oTimestamp && !this.bShowTimezoneForEmptyValues) {
        return null;
      }
      return _DateTimeWithTimezone2.prototype.formatValue.call(this, aValues, sTargetType);
    };
    return DateTimeWithTimezone;
  }(_DateTimeWithTimezone)) || _class);
  return DateTimeWithTimezone;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRlVGltZVdpdGhUaW1lem9uZSIsImRlZmluZVVJNUNsYXNzIiwib0Zvcm1hdE9wdGlvbnMiLCJvQ29uc3RyYWludHMiLCJiU2hvd1RpbWV6b25lRm9yRW1wdHlWYWx1ZXMiLCJzaG93VGltZXpvbmVGb3JFbXB0eVZhbHVlcyIsImZvcm1hdFZhbHVlIiwiYVZhbHVlcyIsInNUYXJnZXRUeXBlIiwib1RpbWVzdGFtcCIsInVuZGVmaW5lZCIsIl9EYXRlVGltZVdpdGhUaW1lem9uZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0ZVRpbWVXaXRoVGltZXpvbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBfRGF0ZVRpbWVXaXRoVGltZXpvbmUgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS90eXBlL0RhdGVUaW1lV2l0aFRpbWV6b25lXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnR5cGUuRGF0ZVRpbWVXaXRoVGltZXpvbmVcIilcbmNsYXNzIERhdGVUaW1lV2l0aFRpbWV6b25lIGV4dGVuZHMgX0RhdGVUaW1lV2l0aFRpbWV6b25lIHtcblx0cHJpdmF0ZSBiU2hvd1RpbWV6b25lRm9yRW1wdHlWYWx1ZXM6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3Iob0Zvcm1hdE9wdGlvbnM/OiBhbnksIG9Db25zdHJhaW50cz86IGFueSkge1xuXHRcdHN1cGVyKG9Gb3JtYXRPcHRpb25zLCBvQ29uc3RyYWludHMpO1xuXHRcdHRoaXMuYlNob3dUaW1lem9uZUZvckVtcHR5VmFsdWVzID0gb0Zvcm1hdE9wdGlvbnM/LnNob3dUaW1lem9uZUZvckVtcHR5VmFsdWVzID8/IHRydWU7XG5cdH1cblxuXHRmb3JtYXRWYWx1ZShhVmFsdWVzOiBhbnlbXSwgc1RhcmdldFR5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IG9UaW1lc3RhbXAgPSBhVmFsdWVzICYmIGFWYWx1ZXNbMF07XG5cdFx0aWYgKFxuXHRcdFx0b1RpbWVzdGFtcCA9PT0gdW5kZWZpbmVkIHx8IC8vIGRhdGEgaXMgbm90IHlldCBhdmFpbGFibGVcblx0XHRcdC8vIGlmIHRpbWUgem9uZSBpcyBub3Qgc2hvd24gZmFsc3kgdGltZXN0YW1wcyBjYW5ub3QgYmUgZm9ybWF0dGVkIC0+IHJldHVybiBudWxsXG5cdFx0XHQoIW9UaW1lc3RhbXAgJiYgIXRoaXMuYlNob3dUaW1lem9uZUZvckVtcHR5VmFsdWVzKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiBzdXBlci5mb3JtYXRWYWx1ZShhVmFsdWVzLCBzVGFyZ2V0VHlwZSk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IERhdGVUaW1lV2l0aFRpbWV6b25lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztNQUlNQSxvQkFBb0IsV0FEekJDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQztJQUFBO0lBSXZELDhCQUFZQyxjQUFvQixFQUFFQyxZQUFrQixFQUFFO01BQUE7TUFDckQsMENBQU1ELGNBQWMsRUFBRUMsWUFBWSxDQUFDO01BQ25DLE1BQUtDLDJCQUEyQixHQUFHLENBQUFGLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFRywwQkFBMEIsS0FBSSxJQUFJO01BQUM7SUFDdkY7SUFBQztJQUFBLE9BRURDLFdBQVcsR0FBWCxxQkFBWUMsT0FBYyxFQUFFQyxXQUFtQixFQUFFO01BQ2hELE1BQU1DLFVBQVUsR0FBR0YsT0FBTyxJQUFJQSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ3hDLElBQ0NFLFVBQVUsS0FBS0MsU0FBUztNQUFJO01BQzVCO01BQ0MsQ0FBQ0QsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDTCwyQkFBNEIsRUFDakQ7UUFDRCxPQUFPLElBQUk7TUFDWjtNQUNBLHdDQUFhRSxXQUFXLFlBQUNDLE9BQU8sRUFBRUMsV0FBVztJQUM5QyxDQUFDO0lBQUE7RUFBQSxFQWxCaUNHLHFCQUFxQjtFQUFBLE9Bb0J6Q1gsb0JBQW9CO0FBQUEifQ==