/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  "use strict";

  /**
   * @class
   * A custom element to evaluate the value of Binding.
   * @name sap.fe.core.controls.Any
   * @hideconstructor
   */
  const Any = ManagedObject.extend("sap.fe.core.controls.Any", {
    metadata: {
      properties: {
        any: "any",
        anyText: "string"
      }
    },
    updateProperty: function (sName) {
      // Avoid Promise processing in ManagedObject and set Promise as value directly
      if (sName === "any") {
        this.setAny(this.getBindingInfo(sName).binding.getExternalValue());
      } else {
        this.setAnyText(this.getBindingInfo(sName).binding.getExternalValue());
      }
    }
  });
  return Any;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbnkiLCJNYW5hZ2VkT2JqZWN0IiwiZXh0ZW5kIiwibWV0YWRhdGEiLCJwcm9wZXJ0aWVzIiwiYW55IiwiYW55VGV4dCIsInVwZGF0ZVByb3BlcnR5Iiwic05hbWUiLCJzZXRBbnkiLCJnZXRCaW5kaW5nSW5mbyIsImJpbmRpbmciLCJnZXRFeHRlcm5hbFZhbHVlIiwic2V0QW55VGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQW55LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5cbmV4cG9ydCB0eXBlIEFueVR5cGUgPSBNYW5hZ2VkT2JqZWN0ICYge1xuXHRtQmluZGluZ0luZm9zOiBvYmplY3Q7XG5cdGdldEFueSgpOiBhbnk7XG5cdGdldEFueVRleHQoKTogYW55O1xuXHRzZXRBbnkodmFsdWU6IGFueSk6IHZvaWQ7XG5cdHNldEFueVRleHQodmFsdWU6IGFueSk6IHZvaWQ7XG5cdGdldEJpbmRpbmdJbmZvKHByb3BlcnR5OiBzdHJpbmcpOiBvYmplY3Q7XG5cdGV4dGVuZChzTmFtZTogc3RyaW5nLCBzRXh0ZW5zaW9uOiBhbnkpOiBBbnlUeXBlO1xufTtcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEEgY3VzdG9tIGVsZW1lbnQgdG8gZXZhbHVhdGUgdGhlIHZhbHVlIG9mIEJpbmRpbmcuXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5jb250cm9scy5BbnlcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqL1xuY29uc3QgQW55ID0gTWFuYWdlZE9iamVjdC5leHRlbmQoXCJzYXAuZmUuY29yZS5jb250cm9scy5BbnlcIiwge1xuXHRtZXRhZGF0YToge1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGFueTogXCJhbnlcIixcblx0XHRcdGFueVRleHQ6IFwic3RyaW5nXCJcblx0XHR9XG5cdH0sXG5cdHVwZGF0ZVByb3BlcnR5OiBmdW5jdGlvbiAodGhpczogQW55VHlwZSwgc05hbWU6IHN0cmluZykge1xuXHRcdC8vIEF2b2lkIFByb21pc2UgcHJvY2Vzc2luZyBpbiBNYW5hZ2VkT2JqZWN0IGFuZCBzZXQgUHJvbWlzZSBhcyB2YWx1ZSBkaXJlY3RseVxuXHRcdGlmIChzTmFtZSA9PT0gXCJhbnlcIikge1xuXHRcdFx0dGhpcy5zZXRBbnkoKHRoaXMuZ2V0QmluZGluZ0luZm8oc05hbWUpIGFzIGFueSkuYmluZGluZy5nZXRFeHRlcm5hbFZhbHVlKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldEFueVRleHQoKHRoaXMuZ2V0QmluZGluZ0luZm8oc05hbWUpIGFzIGFueSkuYmluZGluZy5nZXRFeHRlcm5hbFZhbHVlKCkpO1xuXHRcdH1cblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFueSBhcyBhbnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxHQUFHLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLDBCQUEwQixFQUFFO0lBQzVEQyxRQUFRLEVBQUU7TUFDVEMsVUFBVSxFQUFFO1FBQ1hDLEdBQUcsRUFBRSxLQUFLO1FBQ1ZDLE9BQU8sRUFBRTtNQUNWO0lBQ0QsQ0FBQztJQUNEQyxjQUFjLEVBQUUsVUFBeUJDLEtBQWEsRUFBRTtNQUN2RDtNQUNBLElBQUlBLEtBQUssS0FBSyxLQUFLLEVBQUU7UUFDcEIsSUFBSSxDQUFDQyxNQUFNLENBQUUsSUFBSSxDQUFDQyxjQUFjLENBQUNGLEtBQUssQ0FBQyxDQUFTRyxPQUFPLENBQUNDLGdCQUFnQixFQUFFLENBQUM7TUFDNUUsQ0FBQyxNQUFNO1FBQ04sSUFBSSxDQUFDQyxVQUFVLENBQUUsSUFBSSxDQUFDSCxjQUFjLENBQUNGLEtBQUssQ0FBQyxDQUFTRyxPQUFPLENBQUNDLGdCQUFnQixFQUFFLENBQUM7TUFDaEY7SUFDRDtFQUNELENBQUMsQ0FBQztFQUFDLE9BRVlaLEdBQUc7QUFBQSJ9