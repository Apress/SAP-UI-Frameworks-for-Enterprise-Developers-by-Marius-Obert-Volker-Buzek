/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/TextArea", "sap/ui/core/library"], function (ClassSupport, ResourceModelHelper, _TextArea, library) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var ValueState = library.ValueState;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let TextAreaEx = (
  /**
   * Extension of the TextArea control to add a check for the maximum length when setting the value.
   *
   * @extends sap.m.TextArea
   * @public
   */
  _dec = defineUI5Class("sap.fe.macros.field.TextAreaEx"), _dec(_class = /*#__PURE__*/function (_TextArea2) {
    _inheritsLoose(TextAreaEx, _TextArea2);
    function TextAreaEx() {
      return _TextArea2.apply(this, arguments) || this;
    }
    _exports = TextAreaEx;
    var _proto = TextAreaEx.prototype;
    /**
     * Fires live change event.
     *
     * @param {object} [parameters] Parameters to pass along with the event
     * @param parameters.value
     * @returns Reference to `this` in order to allow method chaining
     */
    _proto.fireLiveChange = function fireLiveChange(parameters) {
      _TextArea2.prototype.fireLiveChange.call(this, parameters);
      this._validateTextLength(parameters === null || parameters === void 0 ? void 0 : parameters.value);
      return this;
    }

    /**
     * Sets the value for the text area.
     *
     * @param {string} value New value for the property `value`
     * @returns Reference to `this` in order to allow method chaining
     * @private
     */;
    _proto.setValue = function setValue(value) {
      _TextArea2.prototype.setValue.call(this, value);
      this._validateTextLength(value);
      return this;
    }

    /**
     * Sets an error message for the value state if the maximum length is specified and the new value exceeds this maximum length.
     *
     * @param {string} [value] New value for property `value`
     * @private
     */;
    _proto._validateTextLength = function _validateTextLength(value) {
      const maxLength = this.getMaxLength();
      if (!maxLength || value === undefined) {
        return;
      }
      if (value.length > maxLength) {
        const valueStateText = getResourceModel(this).getText("M_FIELD_TEXTAREA_TEXT_TOO_LONG");
        this.setValueState(ValueState.Error);
        this.setValueStateText(valueStateText);
      } else {
        this.setValueState(ValueState.None);
      }
    };
    return TextAreaEx;
  }(_TextArea)) || _class);
  _exports = TextAreaEx;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0QXJlYUV4IiwiZGVmaW5lVUk1Q2xhc3MiLCJmaXJlTGl2ZUNoYW5nZSIsInBhcmFtZXRlcnMiLCJfdmFsaWRhdGVUZXh0TGVuZ3RoIiwidmFsdWUiLCJzZXRWYWx1ZSIsIm1heExlbmd0aCIsImdldE1heExlbmd0aCIsInVuZGVmaW5lZCIsImxlbmd0aCIsInZhbHVlU3RhdGVUZXh0IiwiZ2V0UmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJzZXRWYWx1ZVN0YXRlIiwiVmFsdWVTdGF0ZSIsIkVycm9yIiwic2V0VmFsdWVTdGF0ZVRleHQiLCJOb25lIiwiX1RleHRBcmVhIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUZXh0QXJlYUV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IF9UZXh0QXJlYSBmcm9tIFwic2FwL20vVGV4dEFyZWFcIjtcbmltcG9ydCB7IFZhbHVlU3RhdGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgVGV4dEFyZWEgY29udHJvbCB0byBhZGQgYSBjaGVjayBmb3IgdGhlIG1heGltdW0gbGVuZ3RoIHdoZW4gc2V0dGluZyB0aGUgdmFsdWUuXG4gKlxuICogQGV4dGVuZHMgc2FwLm0uVGV4dEFyZWFcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5UZXh0QXJlYUV4XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0QXJlYUV4IGV4dGVuZHMgX1RleHRBcmVhIHtcblx0LyoqXG5cdCAqIEZpcmVzIGxpdmUgY2hhbmdlIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtZXRlcnNdIFBhcmFtZXRlcnMgdG8gcGFzcyBhbG9uZyB3aXRoIHRoZSBldmVudFxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy52YWx1ZVxuXHQgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gYHRoaXNgIGluIG9yZGVyIHRvIGFsbG93IG1ldGhvZCBjaGFpbmluZ1xuXHQgKi9cblx0ZmlyZUxpdmVDaGFuZ2UocGFyYW1ldGVycz86IHsgdmFsdWU/OiBzdHJpbmcgfSk6IHRoaXMge1xuXHRcdHN1cGVyLmZpcmVMaXZlQ2hhbmdlKHBhcmFtZXRlcnMpO1xuXHRcdHRoaXMuX3ZhbGlkYXRlVGV4dExlbmd0aChwYXJhbWV0ZXJzPy52YWx1ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgZm9yIHRoZSB0ZXh0IGFyZWEuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBOZXcgdmFsdWUgZm9yIHRoZSBwcm9wZXJ0eSBgdmFsdWVgXG5cdCAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byBgdGhpc2AgaW4gb3JkZXIgdG8gYWxsb3cgbWV0aG9kIGNoYWluaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzZXRWYWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG5cdFx0c3VwZXIuc2V0VmFsdWUodmFsdWUpO1xuXHRcdHRoaXMuX3ZhbGlkYXRlVGV4dExlbmd0aCh2YWx1ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhbiBlcnJvciBtZXNzYWdlIGZvciB0aGUgdmFsdWUgc3RhdGUgaWYgdGhlIG1heGltdW0gbGVuZ3RoIGlzIHNwZWNpZmllZCBhbmQgdGhlIG5ldyB2YWx1ZSBleGNlZWRzIHRoaXMgbWF4aW11bSBsZW5ndGguXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbdmFsdWVdIE5ldyB2YWx1ZSBmb3IgcHJvcGVydHkgYHZhbHVlYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3ZhbGlkYXRlVGV4dExlbmd0aCh2YWx1ZT86IHN0cmluZykge1xuXHRcdGNvbnN0IG1heExlbmd0aCA9IHRoaXMuZ2V0TWF4TGVuZ3RoKCk7XG5cdFx0aWYgKCFtYXhMZW5ndGggfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAodmFsdWUubGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG5cdFx0XHRjb25zdCB2YWx1ZVN0YXRlVGV4dCA9IGdldFJlc291cmNlTW9kZWwodGhpcykuZ2V0VGV4dChcIk1fRklFTERfVEVYVEFSRUFfVEVYVF9UT09fTE9OR1wiKTtcblx0XHRcdHRoaXMuc2V0VmFsdWVTdGF0ZShWYWx1ZVN0YXRlLkVycm9yKTtcblx0XHRcdHRoaXMuc2V0VmFsdWVTdGF0ZVRleHQodmFsdWVTdGF0ZVRleHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlU3RhdGUoVmFsdWVTdGF0ZS5Ob25lKTtcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7TUFZcUJBLFVBQVU7RUFQL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsT0FNQ0MsY0FBYyxDQUFDLGdDQUFnQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBRWhEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTkMsT0FPQUMsY0FBYyxHQUFkLHdCQUFlQyxVQUErQixFQUFRO01BQ3JELHFCQUFNRCxjQUFjLFlBQUNDLFVBQVU7TUFDL0IsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ0QsVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQUVFLEtBQUssQ0FBQztNQUMzQyxPQUFPLElBQUk7SUFDWjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQUMsUUFBUSxHQUFSLGtCQUFTRCxLQUFhLEVBQUU7TUFDdkIscUJBQU1DLFFBQVEsWUFBQ0QsS0FBSztNQUNwQixJQUFJLENBQUNELG1CQUFtQixDQUFDQyxLQUFLLENBQUM7TUFDL0IsT0FBTyxJQUFJO0lBQ1o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRCxtQkFBbUIsR0FBbkIsNkJBQW9CQyxLQUFjLEVBQUU7TUFDbkMsTUFBTUUsU0FBUyxHQUFHLElBQUksQ0FBQ0MsWUFBWSxFQUFFO01BQ3JDLElBQUksQ0FBQ0QsU0FBUyxJQUFJRixLQUFLLEtBQUtJLFNBQVMsRUFBRTtRQUN0QztNQUNEO01BQ0EsSUFBSUosS0FBSyxDQUFDSyxNQUFNLEdBQUdILFNBQVMsRUFBRTtRQUM3QixNQUFNSSxjQUFjLEdBQUdDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDQyxPQUFPLENBQUMsZ0NBQWdDLENBQUM7UUFDdkYsSUFBSSxDQUFDQyxhQUFhLENBQUNDLFVBQVUsQ0FBQ0MsS0FBSyxDQUFDO1FBQ3BDLElBQUksQ0FBQ0MsaUJBQWlCLENBQUNOLGNBQWMsQ0FBQztNQUN2QyxDQUFDLE1BQU07UUFDTixJQUFJLENBQUNHLGFBQWEsQ0FBQ0MsVUFBVSxDQUFDRyxJQUFJLENBQUM7TUFDcEM7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQTdDc0NDLFNBQVM7RUFBQTtFQUFBO0FBQUEifQ==