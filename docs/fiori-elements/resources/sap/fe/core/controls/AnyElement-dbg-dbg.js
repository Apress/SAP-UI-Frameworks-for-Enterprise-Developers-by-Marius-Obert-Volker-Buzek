/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Element"], function (Element) {
  "use strict";

  /**
   * @class
   * A custom element to evaluate the value of Binding.
   * @name sap.fe.core.controls.AnyElement
   * @hideconstructor
   */
  const AnyElement = Element.extend("sap.fe.core.controls.AnyElement", {
    metadata: {
      properties: {
        anyText: "string"
      }
    },
    updateProperty: function (sName) {
      // Avoid Promise processing in Element and set Promise as value directly
      if (sName === "anyText") {
        this.setAnyText(this.getBindingInfo(sName).binding.getExternalValue());
      }
    }
  });
  return AnyElement;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbnlFbGVtZW50IiwiRWxlbWVudCIsImV4dGVuZCIsIm1ldGFkYXRhIiwicHJvcGVydGllcyIsImFueVRleHQiLCJ1cGRhdGVQcm9wZXJ0eSIsInNOYW1lIiwic2V0QW55VGV4dCIsImdldEJpbmRpbmdJbmZvIiwiYmluZGluZyIsImdldEV4dGVybmFsVmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFueUVsZW1lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcblxuZXhwb3J0IHR5cGUgQW55RWxlbWVudFR5cGUgPSBFbGVtZW50ICYge1xuXHRtQmluZGluZ0luZm9zOiBvYmplY3Q7XG5cdGdldEFueVRleHQoKTogYW55O1xuXHRzZXRBbnlUZXh0KHZhbHVlOiBhbnkpOiB2b2lkO1xuXHRnZXRCaW5kaW5nSW5mbyhwcm9wZXJ0eTogc3RyaW5nKTogb2JqZWN0O1xuXHRleHRlbmQoc05hbWU6IHN0cmluZywgc0V4dGVuc2lvbjogYW55KTogQW55RWxlbWVudFR5cGU7XG59O1xuXG4vKipcbiAqIEBjbGFzc1xuICogQSBjdXN0b20gZWxlbWVudCB0byBldmFsdWF0ZSB0aGUgdmFsdWUgb2YgQmluZGluZy5cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xzLkFueUVsZW1lbnRcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqL1xuY29uc3QgQW55RWxlbWVudCA9IEVsZW1lbnQuZXh0ZW5kKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQW55RWxlbWVudFwiLCB7XG5cdG1ldGFkYXRhOiB7XG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0YW55VGV4dDogXCJzdHJpbmdcIlxuXHRcdH1cblx0fSxcblx0dXBkYXRlUHJvcGVydHk6IGZ1bmN0aW9uICh0aGlzOiBBbnlFbGVtZW50VHlwZSwgc05hbWU6IHN0cmluZykge1xuXHRcdC8vIEF2b2lkIFByb21pc2UgcHJvY2Vzc2luZyBpbiBFbGVtZW50IGFuZCBzZXQgUHJvbWlzZSBhcyB2YWx1ZSBkaXJlY3RseVxuXHRcdGlmIChzTmFtZSA9PT0gXCJhbnlUZXh0XCIpIHtcblx0XHRcdHRoaXMuc2V0QW55VGV4dCgodGhpcy5nZXRCaW5kaW5nSW5mbyhzTmFtZSkgYXMgYW55KS5iaW5kaW5nLmdldEV4dGVybmFsVmFsdWUoKSk7XG5cdFx0fVxuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQW55RWxlbWVudCBhcyBhbnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxVQUFVLEdBQUdDLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDLGlDQUFpQyxFQUFFO0lBQ3BFQyxRQUFRLEVBQUU7TUFDVEMsVUFBVSxFQUFFO1FBQ1hDLE9BQU8sRUFBRTtNQUNWO0lBQ0QsQ0FBQztJQUNEQyxjQUFjLEVBQUUsVUFBZ0NDLEtBQWEsRUFBRTtNQUM5RDtNQUNBLElBQUlBLEtBQUssS0FBSyxTQUFTLEVBQUU7UUFDeEIsSUFBSSxDQUFDQyxVQUFVLENBQUUsSUFBSSxDQUFDQyxjQUFjLENBQUNGLEtBQUssQ0FBQyxDQUFTRyxPQUFPLENBQUNDLGdCQUFnQixFQUFFLENBQUM7TUFDaEY7SUFDRDtFQUNELENBQUMsQ0FBQztFQUFDLE9BRVlYLFVBQVU7QUFBQSJ9