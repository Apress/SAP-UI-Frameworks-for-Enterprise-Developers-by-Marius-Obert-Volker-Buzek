/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/VBox", "sap/ui/core/StashedControlSupport"], function (ClassSupport, VBox, StashedControlSupport) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let StashableVBox = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableVBox", {
    designtime: "sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"
  }), _dec(_class = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(StashableVBox, _VBox);
    function StashableVBox() {
      return _VBox.apply(this, arguments) || this;
    }
    return StashableVBox;
  }(VBox)) || _class);
  StashedControlSupport.mixInto(StashableVBox);
  return StashableVBox;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFzaGFibGVWQm94IiwiZGVmaW5lVUk1Q2xhc3MiLCJkZXNpZ250aW1lIiwiVkJveCIsIlN0YXNoZWRDb250cm9sU3VwcG9ydCIsIm1peEludG8iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN0YXNoYWJsZVZCb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBWQm94IGZyb20gXCJzYXAvbS9WQm94XCI7XG5pbXBvcnQgU3Rhc2hlZENvbnRyb2xTdXBwb3J0IGZyb20gXCJzYXAvdWkvY29yZS9TdGFzaGVkQ29udHJvbFN1cHBvcnRcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdGFzaGFibGVWQm94XCIsIHtcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvZGVzaWdudGltZS9TdGFzaGFibGVWQm94LmRlc2lnbnRpbWVcIlxufSlcbmNsYXNzIFN0YXNoYWJsZVZCb3ggZXh0ZW5kcyBWQm94IHt9XG5TdGFzaGVkQ29udHJvbFN1cHBvcnQubWl4SW50byhTdGFzaGFibGVWQm94KTtcblxuZXhwb3J0IGRlZmF1bHQgU3Rhc2hhYmxlVkJveDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7TUFNTUEsYUFBYSxXQUhsQkMsY0FBYyxDQUFDLG9EQUFvRCxFQUFFO0lBQ3JFQyxVQUFVLEVBQUU7RUFDYixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0VBQUEsRUFDMEJDLElBQUk7RUFDaENDLHFCQUFxQixDQUFDQyxPQUFPLENBQUNMLGFBQWEsQ0FBQztFQUFDLE9BRTlCQSxhQUFhO0FBQUEifQ==