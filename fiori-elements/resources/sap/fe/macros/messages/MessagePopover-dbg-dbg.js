/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/MessageItem", "sap/m/MessagePopover"], function (ClassSupport, MessageItem, MessagePopover) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let FeMessagePopover = (_dec = defineUI5Class("sap.fe.macros.messages.MessagePopover"), _dec(_class = /*#__PURE__*/function (_MessagePopover) {
    _inheritsLoose(FeMessagePopover, _MessagePopover);
    function FeMessagePopover() {
      return _MessagePopover.apply(this, arguments) || this;
    }
    var _proto = FeMessagePopover.prototype;
    _proto.init = function init() {
      MessagePopover.prototype.init.apply(this);
      this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
      this.bindAggregation("items", {
        path: "message>/",
        length: 9999,
        template: new MessageItem({
          type: "{message>type}",
          title: "{message>message}",
          description: "{message>description}",
          markupDescription: true,
          longtextUrl: "{message>descriptionUrl}",
          subtitle: "{message>additionalText}",
          activeTitle: "{= ${message>controlIds}.length > 0 ? true : false}"
        })
      });
      this.setGroupItems(true);
    };
    return FeMessagePopover;
  }(MessagePopover)) || _class);
  return FeMessagePopover;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGZU1lc3NhZ2VQb3BvdmVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbml0IiwiTWVzc2FnZVBvcG92ZXIiLCJwcm90b3R5cGUiLCJhcHBseSIsInNldE1vZGVsIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTW9kZWwiLCJiaW5kQWdncmVnYXRpb24iLCJwYXRoIiwibGVuZ3RoIiwidGVtcGxhdGUiLCJNZXNzYWdlSXRlbSIsInR5cGUiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWFya3VwRGVzY3JpcHRpb24iLCJsb25ndGV4dFVybCIsInN1YnRpdGxlIiwiYWN0aXZlVGl0bGUiLCJzZXRHcm91cEl0ZW1zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXNzYWdlUG9wb3Zlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1lc3NhZ2VJdGVtIGZyb20gXCJzYXAvbS9NZXNzYWdlSXRlbVwiO1xuaW1wb3J0IE1lc3NhZ2VQb3BvdmVyIGZyb20gXCJzYXAvbS9NZXNzYWdlUG9wb3ZlclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLm1lc3NhZ2VzLk1lc3NhZ2VQb3BvdmVyXCIpXG5jbGFzcyBGZU1lc3NhZ2VQb3BvdmVyIGV4dGVuZHMgTWVzc2FnZVBvcG92ZXIge1xuXHRpbml0KCkge1xuXHRcdE1lc3NhZ2VQb3BvdmVyLnByb3RvdHlwZS5pbml0LmFwcGx5KHRoaXMpO1xuXHRcdHRoaXMuc2V0TW9kZWwoc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLCBcIm1lc3NhZ2VcIik7XG5cblx0XHR0aGlzLmJpbmRBZ2dyZWdhdGlvbihcIml0ZW1zXCIsIHtcblx0XHRcdHBhdGg6IFwibWVzc2FnZT4vXCIsXG5cdFx0XHRsZW5ndGg6IDk5OTksXG5cdFx0XHR0ZW1wbGF0ZTogbmV3IChNZXNzYWdlSXRlbSBhcyBhbnkpKHtcblx0XHRcdFx0dHlwZTogXCJ7bWVzc2FnZT50eXBlfVwiLFxuXHRcdFx0XHR0aXRsZTogXCJ7bWVzc2FnZT5tZXNzYWdlfVwiLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogXCJ7bWVzc2FnZT5kZXNjcmlwdGlvbn1cIixcblx0XHRcdFx0bWFya3VwRGVzY3JpcHRpb246IHRydWUsXG5cdFx0XHRcdGxvbmd0ZXh0VXJsOiBcInttZXNzYWdlPmRlc2NyaXB0aW9uVXJsfVwiLFxuXHRcdFx0XHRzdWJ0aXRsZTogXCJ7bWVzc2FnZT5hZGRpdGlvbmFsVGV4dH1cIixcblx0XHRcdFx0YWN0aXZlVGl0bGU6IFwiez0gJHttZXNzYWdlPmNvbnRyb2xJZHN9Lmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2V9XCJcblx0XHRcdH0pXG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRHcm91cEl0ZW1zKHRydWUpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZlTWVzc2FnZVBvcG92ZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O01BS01BLGdCQUFnQixXQURyQkMsY0FBYyxDQUFDLHVDQUF1QyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRXZEQyxJQUFJLEdBQUosZ0JBQU87TUFDTkMsY0FBYyxDQUFDQyxTQUFTLENBQUNGLElBQUksQ0FBQ0csS0FBSyxDQUFDLElBQUksQ0FBQztNQUN6QyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsR0FBRyxDQUFDQyxFQUFFLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxpQkFBaUIsRUFBRSxDQUFDQyxlQUFlLEVBQUUsRUFBRSxTQUFTLENBQUM7TUFFaEYsSUFBSSxDQUFDQyxlQUFlLENBQUMsT0FBTyxFQUFFO1FBQzdCQyxJQUFJLEVBQUUsV0FBVztRQUNqQkMsTUFBTSxFQUFFLElBQUk7UUFDWkMsUUFBUSxFQUFFLElBQUtDLFdBQVcsQ0FBUztVQUNsQ0MsSUFBSSxFQUFFLGdCQUFnQjtVQUN0QkMsS0FBSyxFQUFFLG1CQUFtQjtVQUMxQkMsV0FBVyxFQUFFLHVCQUF1QjtVQUNwQ0MsaUJBQWlCLEVBQUUsSUFBSTtVQUN2QkMsV0FBVyxFQUFFLDBCQUEwQjtVQUN2Q0MsUUFBUSxFQUFFLDBCQUEwQjtVQUNwQ0MsV0FBVyxFQUFFO1FBQ2QsQ0FBQztNQUNGLENBQUMsQ0FBQztNQUNGLElBQUksQ0FBQ0MsYUFBYSxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBQUE7RUFBQSxFQW5CNkJyQixjQUFjO0VBQUEsT0FzQjlCSCxnQkFBZ0I7QUFBQSJ9