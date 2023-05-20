/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/model/odata/type/String", "sap/ui/model/ValidateException"], function (ClassSupport, Core, ODataStringType, ValidateException) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  const emailW3CRegexp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/;
  let EmailType = (_dec = defineUI5Class("sap.fe.core.type.Email"), _dec(_class = /*#__PURE__*/function (_ODataStringType) {
    _inheritsLoose(EmailType, _ODataStringType);
    function EmailType() {
      return _ODataStringType.apply(this, arguments) || this;
    }
    var _proto = EmailType.prototype;
    _proto.validateValue = function validateValue(sValue) {
      if (!emailW3CRegexp.test(sValue)) {
        throw new ValidateException(Core.getLibraryResourceBundle("sap.fe.core").getText("T_EMAILTYPE_INVALID_VALUE"));
      }
      _ODataStringType.prototype.validateValue.call(this, sValue);
    };
    return EmailType;
  }(ODataStringType)) || _class);
  return EmailType;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbWFpbFczQ1JlZ2V4cCIsIkVtYWlsVHlwZSIsImRlZmluZVVJNUNsYXNzIiwidmFsaWRhdGVWYWx1ZSIsInNWYWx1ZSIsInRlc3QiLCJWYWxpZGF0ZUV4Y2VwdGlvbiIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJnZXRUZXh0IiwiT0RhdGFTdHJpbmdUeXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFbWFpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBPRGF0YVN0cmluZ1R5cGUgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS90eXBlL1N0cmluZ1wiO1xuaW1wb3J0IFZhbGlkYXRlRXhjZXB0aW9uIGZyb20gXCJzYXAvdWkvbW9kZWwvVmFsaWRhdGVFeGNlcHRpb25cIjtcblxuY29uc3QgZW1haWxXM0NSZWdleHAgPSAvXlthLXpBLVowLTkuISMkJSbigJkqKy89P15fYHt8fX4tXStAW2EtekEtWjAtOS1dKyg/Oi5bYS16QS1aMC05LV0rKSokLztcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnR5cGUuRW1haWxcIilcbmNsYXNzIEVtYWlsVHlwZSBleHRlbmRzIE9EYXRhU3RyaW5nVHlwZSB7XG5cdHZhbGlkYXRlVmFsdWUoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRpZiAoIWVtYWlsVzNDUmVnZXhwLnRlc3Qoc1ZhbHVlKSkge1xuXHRcdFx0dGhyb3cgbmV3IFZhbGlkYXRlRXhjZXB0aW9uKENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIlRfRU1BSUxUWVBFX0lOVkFMSURfVkFMVUVcIikpO1xuXHRcdH1cblx0XHRzdXBlci52YWxpZGF0ZVZhbHVlKHNWYWx1ZSk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IEVtYWlsVHlwZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7RUFLQSxNQUFNQSxjQUFjLEdBQUcscUVBQXFFO0VBQUMsSUFFdkZDLFNBQVMsV0FEZEMsY0FBYyxDQUFDLHdCQUF3QixDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRXhDQyxhQUFhLEdBQWIsdUJBQWNDLE1BQWMsRUFBRTtNQUM3QixJQUFJLENBQUNKLGNBQWMsQ0FBQ0ssSUFBSSxDQUFDRCxNQUFNLENBQUMsRUFBRTtRQUNqQyxNQUFNLElBQUlFLGlCQUFpQixDQUFDQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztNQUMvRztNQUNBLDJCQUFNTixhQUFhLFlBQUNDLE1BQU07SUFDM0IsQ0FBQztJQUFBO0VBQUEsRUFOc0JNLGVBQWU7RUFBQSxPQVF4QlQsU0FBUztBQUFBIn0=