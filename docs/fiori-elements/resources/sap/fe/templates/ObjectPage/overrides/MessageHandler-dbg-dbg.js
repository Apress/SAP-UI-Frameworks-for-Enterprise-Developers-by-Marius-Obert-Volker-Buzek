/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  const MessageHandlerExtension = {
    getShowBoundMessagesInMessageDialog: function () {
      // in case of edit mode we show the messages in the message popover
      return !this.base.getModel("ui").getProperty("/isEditable") || this.base.getView().getBindingContext("internal").getProperty("isActionParameterDialogOpen") || this.base.getView().getBindingContext("internal").getProperty("getBoundMessagesForMassEdit");
    }
  };
  return MessageHandlerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlSGFuZGxlckV4dGVuc2lvbiIsImdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nIiwiYmFzZSIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJnZXRWaWV3IiwiZ2V0QmluZGluZ0NvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1lc3NhZ2VIYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5cbmNvbnN0IE1lc3NhZ2VIYW5kbGVyRXh0ZW5zaW9uID0ge1xuXHRnZXRTaG93Qm91bmRNZXNzYWdlc0luTWVzc2FnZURpYWxvZzogZnVuY3Rpb24gKHRoaXM6IE1lc3NhZ2VIYW5kbGVyKSB7XG5cdFx0Ly8gaW4gY2FzZSBvZiBlZGl0IG1vZGUgd2Ugc2hvdyB0aGUgbWVzc2FnZXMgaW4gdGhlIG1lc3NhZ2UgcG9wb3ZlclxuXHRcdHJldHVybiAoXG5cdFx0XHQhdGhpcy5iYXNlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSB8fFxuXHRcdFx0KHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuZ2V0UHJvcGVydHkoXCJpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW5cIikgfHxcblx0XHRcdCh0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLmdldFByb3BlcnR5KFwiZ2V0Qm91bmRNZXNzYWdlc0Zvck1hc3NFZGl0XCIpXG5cdFx0KTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUhhbmRsZXJFeHRlbnNpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFHQSxNQUFNQSx1QkFBdUIsR0FBRztJQUMvQkMsbUNBQW1DLEVBQUUsWUFBZ0M7TUFDcEU7TUFDQSxPQUNDLENBQUMsSUFBSSxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUNuRCxJQUFJLENBQUNGLElBQUksQ0FBQ0csT0FBTyxFQUFFLENBQUNDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUEwQkYsV0FBVyxDQUFDLDZCQUE2QixDQUFDLElBQ3JILElBQUksQ0FBQ0YsSUFBSSxDQUFDRyxPQUFPLEVBQUUsQ0FBQ0MsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQTBCRixXQUFXLENBQUMsNkJBQTZCLENBQUM7SUFFeEg7RUFDRCxDQUFDO0VBQUMsT0FFYUosdUJBQXVCO0FBQUEifQ==