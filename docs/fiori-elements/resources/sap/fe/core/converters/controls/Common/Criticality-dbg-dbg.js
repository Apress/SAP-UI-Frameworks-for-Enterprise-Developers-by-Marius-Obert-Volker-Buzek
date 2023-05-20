/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatterTypes"], function (TableFormatterTypes) {
  "use strict";

  var _exports = {};
  var MessageType = TableFormatterTypes.MessageType;
  /**
   * Gets a MessageType enum value from a CriticalityType enum value.
   *
   * @param criticalityEnum The CriticalityType enum value
   * @returns Returns the MessageType enum value
   */
  function getMessageTypeFromCriticalityType(criticalityEnum) {
    let messageType;
    switch (criticalityEnum) {
      case "UI.CriticalityType/Negative":
      case "UI.CriticalityType/VeryNegative":
        messageType = MessageType.Error;
        break;
      case "UI.CriticalityType/Critical":
        messageType = MessageType.Warning;
        break;
      case "UI.CriticalityType/Positive":
      case "UI.CriticalityType/VeryPositive":
        messageType = MessageType.Success;
        break;
      case "UI.CriticalityType/Information":
        messageType = MessageType.Information;
        break;
      case "UI.CriticalityType/Neutral":
      default:
        messageType = MessageType.None;
    }
    return messageType;
  }
  _exports.getMessageTypeFromCriticalityType = getMessageTypeFromCriticalityType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUiLCJjcml0aWNhbGl0eUVudW0iLCJtZXNzYWdlVHlwZSIsIk1lc3NhZ2VUeXBlIiwiRXJyb3IiLCJXYXJuaW5nIiwiU3VjY2VzcyIsIkluZm9ybWF0aW9uIiwiTm9uZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ3JpdGljYWxpdHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnVtVmFsdWUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQ3JpdGljYWxpdHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5cbi8qKlxuICogR2V0cyBhIE1lc3NhZ2VUeXBlIGVudW0gdmFsdWUgZnJvbSBhIENyaXRpY2FsaXR5VHlwZSBlbnVtIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBjcml0aWNhbGl0eUVudW0gVGhlIENyaXRpY2FsaXR5VHlwZSBlbnVtIHZhbHVlXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBNZXNzYWdlVHlwZSBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUoY3JpdGljYWxpdHlFbnVtOiBFbnVtVmFsdWU8Q3JpdGljYWxpdHlUeXBlPik6IE1lc3NhZ2VUeXBlIHtcblx0bGV0IG1lc3NhZ2VUeXBlOiBNZXNzYWdlVHlwZTtcblx0c3dpdGNoIChjcml0aWNhbGl0eUVudW0pIHtcblx0XHRjYXNlIFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCI6XG5cdFx0Y2FzZSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9WZXJ5TmVnYXRpdmVcIjpcblx0XHRcdG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiVUkuQ3JpdGljYWxpdHlUeXBlL0NyaXRpY2FsXCI6XG5cdFx0XHRtZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlLldhcm5pbmc7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiVUkuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCI6XG5cdFx0Y2FzZSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9WZXJ5UG9zaXRpdmVcIjpcblx0XHRcdG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGUuU3VjY2Vzcztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJVSS5Dcml0aWNhbGl0eVR5cGUvSW5mb3JtYXRpb25cIjpcblx0XHRcdG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGUuSW5mb3JtYXRpb247XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiVUkuQ3JpdGljYWxpdHlUeXBlL05ldXRyYWxcIjpcblx0XHRkZWZhdWx0OlxuXHRcdFx0bWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHR9XG5cdHJldHVybiBtZXNzYWdlVHlwZTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsaUNBQWlDLENBQUNDLGVBQTJDLEVBQWU7SUFDM0csSUFBSUMsV0FBd0I7SUFDNUIsUUFBUUQsZUFBZTtNQUN0QixLQUFLLDZCQUE2QjtNQUNsQyxLQUFLLGlDQUFpQztRQUNyQ0MsV0FBVyxHQUFHQyxXQUFXLENBQUNDLEtBQUs7UUFDL0I7TUFDRCxLQUFLLDZCQUE2QjtRQUNqQ0YsV0FBVyxHQUFHQyxXQUFXLENBQUNFLE9BQU87UUFDakM7TUFDRCxLQUFLLDZCQUE2QjtNQUNsQyxLQUFLLGlDQUFpQztRQUNyQ0gsV0FBVyxHQUFHQyxXQUFXLENBQUNHLE9BQU87UUFDakM7TUFDRCxLQUFLLGdDQUFnQztRQUNwQ0osV0FBVyxHQUFHQyxXQUFXLENBQUNJLFdBQVc7UUFDckM7TUFDRCxLQUFLLDRCQUE0QjtNQUNqQztRQUNDTCxXQUFXLEdBQUdDLFdBQVcsQ0FBQ0ssSUFBSTtJQUFDO0lBRWpDLE9BQU9OLFdBQVc7RUFDbkI7RUFBQztFQUFBO0FBQUEifQ==