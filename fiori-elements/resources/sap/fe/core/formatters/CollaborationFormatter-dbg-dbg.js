/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  var _exports = {};
  const collaborationFormatters = function (sName) {
    if (collaborationFormatters.hasOwnProperty(sName)) {
      for (var _len = arguments.length, oArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        oArgs[_key - 1] = arguments[_key];
      }
      return collaborationFormatters[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };
  const hasCollaborationActivity = function (activities) {
    for (var _len2 = arguments.length, keys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      keys[_key2 - 1] = arguments[_key2];
    }
    return !!getCollaborationActivity(activities, ...keys);
  };
  hasCollaborationActivity.__functionName = "sap.fe.core.formatters.CollaborationFormatter#hasCollaborationActivity";
  _exports.hasCollaborationActivity = hasCollaborationActivity;
  const getCollaborationActivityInitials = function (activities) {
    for (var _len3 = arguments.length, keys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      keys[_key3 - 1] = arguments[_key3];
    }
    const activity = getCollaborationActivity(activities, ...keys);
    return (activity === null || activity === void 0 ? void 0 : activity.initials) || undefined;
  };
  getCollaborationActivityInitials.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityInitials";
  _exports.getCollaborationActivityInitials = getCollaborationActivityInitials;
  const getCollaborationActivityColor = function (activities) {
    for (var _len4 = arguments.length, keys = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      keys[_key4 - 1] = arguments[_key4];
    }
    const activity = getCollaborationActivity(activities, ...keys);
    return activity !== null && activity !== void 0 && activity.color ? `Accent${activity.color}` : undefined;
  };
  getCollaborationActivityColor.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityColor";
  _exports.getCollaborationActivityColor = getCollaborationActivityColor;
  function getCollaborationActivity(activities) {
    for (var _len5 = arguments.length, keys = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      keys[_key5 - 1] = arguments[_key5];
    }
    if (activities && activities.length > 0) {
      return activities.find(function (activity) {
        var _activity$key;
        const activityKeys = (activity === null || activity === void 0 ? void 0 : (_activity$key = activity.key) === null || _activity$key === void 0 ? void 0 : _activity$key.split(",")) || [];
        let compareKey = "";
        let splitKeys;
        for (let i = 0; i < activityKeys.length; i++) {
          var _keys$i;
          // take care on short and full notation
          splitKeys = activityKeys[i].split("=");
          compareKey = (splitKeys[1] || splitKeys[0]).split("'").join("");
          if (compareKey !== ((_keys$i = keys[i]) === null || _keys$i === void 0 ? void 0 : _keys$i.toString())) {
            return false;
          }
        }
        return true;
      });
    }
  }

  /**
   * Compute the Invitation dialog title based on the underlying resource bundle.
   *
   * @param args The inner function parameters
   * @returns The dialog title
   */
  const getFormattedText = function () {
    const textId = arguments.length <= 0 ? undefined : arguments[0];
    const resourceModel = Core.getLibraryResourceBundle("sap.fe.core");
    const params = [];
    for (let i = 1; i < arguments.length; i++) {
      params.push(i < 0 || arguments.length <= i ? undefined : arguments[i]);
    }
    return resourceModel.getText(textId, params);
  };
  getFormattedText.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getFormattedText";
  _exports.getFormattedText = getFormattedText;
  collaborationFormatters.hasCollaborationActivity = hasCollaborationActivity;
  collaborationFormatters.getCollaborationActivityInitials = getCollaborationActivityInitials;
  collaborationFormatters.getCollaborationActivityColor = getCollaborationActivityColor;
  collaborationFormatters.getFormattedText = getFormattedText;
  /**
   * @global
   */
  return collaborationFormatters;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb2xsYWJvcmF0aW9uRm9ybWF0dGVycyIsInNOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJvQXJncyIsImFwcGx5IiwiaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5IiwiYWN0aXZpdGllcyIsImtleXMiLCJnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHkiLCJfX2Z1bmN0aW9uTmFtZSIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzIiwiYWN0aXZpdHkiLCJpbml0aWFscyIsInVuZGVmaW5lZCIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yIiwiY29sb3IiLCJsZW5ndGgiLCJmaW5kIiwiYWN0aXZpdHlLZXlzIiwia2V5Iiwic3BsaXQiLCJjb21wYXJlS2V5Iiwic3BsaXRLZXlzIiwiaSIsImpvaW4iLCJ0b1N0cmluZyIsImdldEZvcm1hdHRlZFRleHQiLCJ0ZXh0SWQiLCJyZXNvdXJjZU1vZGVsIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInBhcmFtcyIsInB1c2giLCJnZXRUZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2xsYWJvcmF0aW9uRm9ybWF0dGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29sbGVjdGlvbiBvZiBmb3JtYXR0ZXJzIG5lZWRlZCBmb3IgdGhlIGNvbGxhYm9yYXRpb24gZHJhZnQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHRoaXMgVGhlIGNvbnRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBzTmFtZSBUaGUgaW5uZXIgZnVuY3Rpb24gbmFtZVxuICogQHBhcmFtIHtvYmplY3RbXX0gb0FyZ3MgVGhlIGlubmVyIGZ1bmN0aW9uIHBhcmFtZXRlcnNcbiAqIEByZXR1cm5zIHtvYmplY3R9IFRoZSB2YWx1ZSBmcm9tIHRoZSBpbm5lciBmdW5jdGlvblxuICovXG5cbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5cbmNvbnN0IGNvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzID0gZnVuY3Rpb24gKHRoaXM6IG9iamVjdCwgc05hbWU6IHN0cmluZywgLi4ub0FyZ3M6IGFueVtdKTogYW55IHtcblx0aWYgKGNvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KHNOYW1lKSkge1xuXHRcdHJldHVybiAoY29sbGFib3JhdGlvbkZvcm1hdHRlcnMgYXMgYW55KVtzTmFtZV0uYXBwbHkodGhpcywgb0FyZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG59O1xuZXhwb3J0IGNvbnN0IGhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eSA9IChhY3Rpdml0aWVzOiBhbnksIC4uLmtleXM6IGFueVtdKTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9PiB7XG5cdHJldHVybiAhIWdldENvbGxhYm9yYXRpb25BY3Rpdml0eShhY3Rpdml0aWVzLCAuLi5rZXlzKTtcbn07XG5oYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHkuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuQ29sbGFib3JhdGlvbkZvcm1hdHRlciNoYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHlcIjtcblxuZXhwb3J0IGNvbnN0IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzID0gKGFjdGl2aXRpZXM6IGFueSwgLi4ua2V5czogYW55W10pOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuXHRjb25zdCBhY3Rpdml0eSA9IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eShhY3Rpdml0aWVzLCAuLi5rZXlzKTtcblx0cmV0dXJuIGFjdGl2aXR5Py5pbml0aWFscyB8fCB1bmRlZmluZWQ7XG59O1xuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5SW5pdGlhbHMuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuQ29sbGFib3JhdGlvbkZvcm1hdHRlciNnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlJbml0aWFsc1wiO1xuXG5leHBvcnQgY29uc3QgZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IgPSAoYWN0aXZpdGllczogYW55LCAuLi5rZXlzOiBhbnlbXSk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG5cdGNvbnN0IGFjdGl2aXR5ID0gZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5KGFjdGl2aXRpZXMsIC4uLmtleXMpO1xuXHRyZXR1cm4gYWN0aXZpdHk/LmNvbG9yID8gYEFjY2VudCR7YWN0aXZpdHkuY29sb3J9YCA6IHVuZGVmaW5lZDtcbn07XG5nZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlDb2xvci5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5Db2xsYWJvcmF0aW9uRm9ybWF0dGVyI2dldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yXCI7XG5cbmZ1bmN0aW9uIGdldENvbGxhYm9yYXRpb25BY3Rpdml0eShhY3Rpdml0aWVzOiBhbnksIC4uLmtleXM6IGFueVtdKSB7XG5cdGlmIChhY3Rpdml0aWVzICYmIGFjdGl2aXRpZXMubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBhY3Rpdml0aWVzLmZpbmQoZnVuY3Rpb24gKGFjdGl2aXR5OiBhbnkpIHtcblx0XHRcdGNvbnN0IGFjdGl2aXR5S2V5cyA9IGFjdGl2aXR5Py5rZXk/LnNwbGl0KFwiLFwiKSB8fCBbXTtcblx0XHRcdGxldCBjb21wYXJlS2V5ID0gXCJcIjtcblx0XHRcdGxldCBzcGxpdEtleXM6IHN0cmluZ1tdO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFjdGl2aXR5S2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyB0YWtlIGNhcmUgb24gc2hvcnQgYW5kIGZ1bGwgbm90YXRpb25cblx0XHRcdFx0c3BsaXRLZXlzID0gYWN0aXZpdHlLZXlzW2ldLnNwbGl0KFwiPVwiKTtcblx0XHRcdFx0Y29tcGFyZUtleSA9IChzcGxpdEtleXNbMV0gfHwgc3BsaXRLZXlzWzBdKS5zcGxpdChcIidcIikuam9pbihcIlwiKTtcblx0XHRcdFx0aWYgKGNvbXBhcmVLZXkgIT09IGtleXNbaV0/LnRvU3RyaW5nKCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0pO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgSW52aXRhdGlvbiBkaWFsb2cgdGl0bGUgYmFzZWQgb24gdGhlIHVuZGVybHlpbmcgcmVzb3VyY2UgYnVuZGxlLlxuICpcbiAqIEBwYXJhbSBhcmdzIFRoZSBpbm5lciBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBUaGUgZGlhbG9nIHRpdGxlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGb3JtYXR0ZWRUZXh0ID0gKC4uLmFyZ3M6IHN0cmluZ1tdKTogc3RyaW5nID0+IHtcblx0Y29uc3QgdGV4dElkID0gYXJnc1swXTtcblx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGNvbnN0IHBhcmFtcyA9IFtdO1xuXHRmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRwYXJhbXMucHVzaChhcmdzW2ldKTtcblx0fVxuXHRyZXR1cm4gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KHRleHRJZCwgcGFyYW1zKTtcbn07XG5cbmdldEZvcm1hdHRlZFRleHQuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuQ29sbGFib3JhdGlvbkZvcm1hdHRlciNnZXRGb3JtYXR0ZWRUZXh0XCI7XG5cbmNvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eSA9IGhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eTtcbmNvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzID0gZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5SW5pdGlhbHM7XG5jb2xsYWJvcmF0aW9uRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlDb2xvciA9IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yO1xuY29sbGFib3JhdGlvbkZvcm1hdHRlcnMuZ2V0Rm9ybWF0dGVkVGV4dCA9IGdldEZvcm1hdHRlZFRleHQ7XG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY29sbGFib3JhdGlvbkZvcm1hdHRlcnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBV0EsTUFBTUEsdUJBQXVCLEdBQUcsVUFBd0JDLEtBQWEsRUFBd0I7SUFDNUYsSUFBSUQsdUJBQXVCLENBQUNFLGNBQWMsQ0FBQ0QsS0FBSyxDQUFDLEVBQUU7TUFBQSxrQ0FEc0JFLEtBQUs7UUFBTEEsS0FBSztNQUFBO01BRTdFLE9BQVFILHVCQUF1QixDQUFTQyxLQUFLLENBQUMsQ0FBQ0csS0FBSyxDQUFDLElBQUksRUFBRUQsS0FBSyxDQUFDO0lBQ2xFLENBQUMsTUFBTTtNQUNOLE9BQU8sRUFBRTtJQUNWO0VBQ0QsQ0FBQztFQUNNLE1BQU1FLHdCQUF3QixHQUFHLFVBQUNDLFVBQWUsRUFBMEM7SUFBQSxtQ0FBckNDLElBQUk7TUFBSkEsSUFBSTtJQUFBO0lBQ2hFLE9BQU8sQ0FBQyxDQUFDQyx3QkFBd0IsQ0FBQ0YsVUFBVSxFQUFFLEdBQUdDLElBQUksQ0FBQztFQUN2RCxDQUFDO0VBQ0RGLHdCQUF3QixDQUFDSSxjQUFjLEdBQUcsd0VBQXdFO0VBQUM7RUFFNUcsTUFBTUMsZ0NBQWdDLEdBQUcsVUFBQ0osVUFBZSxFQUF5QztJQUFBLG1DQUFwQ0MsSUFBSTtNQUFKQSxJQUFJO0lBQUE7SUFDeEUsTUFBTUksUUFBUSxHQUFHSCx3QkFBd0IsQ0FBQ0YsVUFBVSxFQUFFLEdBQUdDLElBQUksQ0FBQztJQUM5RCxPQUFPLENBQUFJLFFBQVEsYUFBUkEsUUFBUSx1QkFBUkEsUUFBUSxDQUFFQyxRQUFRLEtBQUlDLFNBQVM7RUFDdkMsQ0FBQztFQUNESCxn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