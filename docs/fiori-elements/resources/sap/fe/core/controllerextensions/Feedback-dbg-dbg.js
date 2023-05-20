/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  var _exports = {};
  let TriggerType;
  (function (TriggerType) {
    TriggerType["action"] = "actions";
    TriggerType["standardAction"] = "standardActions";
  })(TriggerType || (TriggerType = {}));
  _exports.TriggerType = TriggerType;
  let StandardActions;
  /**
   * Asking user for feedback
   *
   * @alias sap.fe.core.controllerextensions.Feedback
   * @private
   */
  (function (StandardActions) {
    StandardActions["save"] = "save";
  })(StandardActions || (StandardActions = {}));
  _exports.StandardActions = StandardActions;
  const channel = "sap.feedback";
  const feature = "inapp.feature";

  /**
   * Triggers a feedback survey.
   *
   * @memberof sap.fe.core.controllerextensions.Feedback
   * @param areaId The area id of the application.
   * @param triggerName The name of the trigger.
   * @param payload A flat list of key/values to be passed to the survey.
   * @alias sap.fe.core.controllerextensions.Feedback#triggerSurvey
   * @private
   */
  function triggerSurvey(areaId, triggerName, payload) {
    const parameters = {
      areaId: areaId,
      triggerName: triggerName,
      payload: payload
    };
    Core.getEventBus().publish(channel, feature, parameters);
  }

  /**
   * Triggers a feedback survey configured for a given action on the current page.
   *
   * @memberof sap.fe.core.controllerextensions.Feedback
   * @param view The view which is checked for a feedback configuration.
   * @param action The name of the action.
   * @param triggerType The trigger type of the action (actions|standardActions)
   * @alias sap.fe.core.controllerextensions.Feedback#triggerConfiguredSurvey
   * @private
   */
  _exports.triggerSurvey = triggerSurvey;
  function triggerConfiguredSurvey(view, action, triggerType) {
    var _view$getViewData, _view$getViewData$con, _feedbackConfig$trigg;
    const feedbackConfig = (_view$getViewData = view.getViewData()) === null || _view$getViewData === void 0 ? void 0 : (_view$getViewData$con = _view$getViewData.content) === null || _view$getViewData$con === void 0 ? void 0 : _view$getViewData$con.feedback;
    const surveyConfig = feedbackConfig === null || feedbackConfig === void 0 ? void 0 : (_feedbackConfig$trigg = feedbackConfig[triggerType]) === null || _feedbackConfig$trigg === void 0 ? void 0 : _feedbackConfig$trigg[action];
    if (surveyConfig) {
      triggerSurvey(surveyConfig.areaId, surveyConfig.triggerName, surveyConfig.payload);
    }
  }
  _exports.triggerConfiguredSurvey = triggerConfiguredSurvey;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUcmlnZ2VyVHlwZSIsIlN0YW5kYXJkQWN0aW9ucyIsImNoYW5uZWwiLCJmZWF0dXJlIiwidHJpZ2dlclN1cnZleSIsImFyZWFJZCIsInRyaWdnZXJOYW1lIiwicGF5bG9hZCIsInBhcmFtZXRlcnMiLCJDb3JlIiwiZ2V0RXZlbnRCdXMiLCJwdWJsaXNoIiwidHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkiLCJ2aWV3IiwiYWN0aW9uIiwidHJpZ2dlclR5cGUiLCJmZWVkYmFja0NvbmZpZyIsImdldFZpZXdEYXRhIiwiY29udGVudCIsImZlZWRiYWNrIiwic3VydmV5Q29uZmlnIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGZWVkYmFjay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcblxudHlwZSBTdXJ2ZXlDb25maWcgPSB7XG5cdGFyZWFJZDogc3RyaW5nO1xuXHR0cmlnZ2VyTmFtZTogc3RyaW5nO1xuXHRwYXlsb2FkPzogb2JqZWN0O1xufTtcblxuZXhwb3J0IGVudW0gVHJpZ2dlclR5cGUge1xuXHRhY3Rpb24gPSBcImFjdGlvbnNcIixcblx0c3RhbmRhcmRBY3Rpb24gPSBcInN0YW5kYXJkQWN0aW9uc1wiXG59XG5cbmV4cG9ydCBlbnVtIFN0YW5kYXJkQWN0aW9ucyB7XG5cdHNhdmUgPSBcInNhdmVcIlxufVxuXG4vKipcbiAqIEFza2luZyB1c2VyIGZvciBmZWVkYmFja1xuICpcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5GZWVkYmFja1xuICogQHByaXZhdGVcbiAqL1xuXG5jb25zdCBjaGFubmVsID0gXCJzYXAuZmVlZGJhY2tcIjtcbmNvbnN0IGZlYXR1cmUgPSBcImluYXBwLmZlYXR1cmVcIjtcblxuLyoqXG4gKiBUcmlnZ2VycyBhIGZlZWRiYWNrIHN1cnZleS5cbiAqXG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRmVlZGJhY2tcbiAqIEBwYXJhbSBhcmVhSWQgVGhlIGFyZWEgaWQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIHRyaWdnZXJOYW1lIFRoZSBuYW1lIG9mIHRoZSB0cmlnZ2VyLlxuICogQHBhcmFtIHBheWxvYWQgQSBmbGF0IGxpc3Qgb2Yga2V5L3ZhbHVlcyB0byBiZSBwYXNzZWQgdG8gdGhlIHN1cnZleS5cbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5GZWVkYmFjayN0cmlnZ2VyU3VydmV5XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclN1cnZleShhcmVhSWQ6IHN0cmluZywgdHJpZ2dlck5hbWU6IHN0cmluZywgcGF5bG9hZDogYW55KSB7XG5cdGNvbnN0IHBhcmFtZXRlcnMgPSB7XG5cdFx0YXJlYUlkOiBhcmVhSWQsXG5cdFx0dHJpZ2dlck5hbWU6IHRyaWdnZXJOYW1lLFxuXHRcdHBheWxvYWQ6IHBheWxvYWRcblx0fTtcblx0Q29yZS5nZXRFdmVudEJ1cygpLnB1Ymxpc2goY2hhbm5lbCwgZmVhdHVyZSwgcGFyYW1ldGVycyk7XG59XG5cbi8qKlxuICogVHJpZ2dlcnMgYSBmZWVkYmFjayBzdXJ2ZXkgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBhY3Rpb24gb24gdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRmVlZGJhY2tcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHdoaWNoIGlzIGNoZWNrZWQgZm9yIGEgZmVlZGJhY2sgY29uZmlndXJhdGlvbi5cbiAqIEBwYXJhbSBhY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGFjdGlvbi5cbiAqIEBwYXJhbSB0cmlnZ2VyVHlwZSBUaGUgdHJpZ2dlciB0eXBlIG9mIHRoZSBhY3Rpb24gKGFjdGlvbnN8c3RhbmRhcmRBY3Rpb25zKVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkZlZWRiYWNrI3RyaWdnZXJDb25maWd1cmVkU3VydmV5XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkodmlldzogVmlldywgYWN0aW9uOiBzdHJpbmcsIHRyaWdnZXJUeXBlOiBUcmlnZ2VyVHlwZSkge1xuXHRjb25zdCBmZWVkYmFja0NvbmZpZyA9ICh2aWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KT8uY29udGVudD8uZmVlZGJhY2s7XG5cdGNvbnN0IHN1cnZleUNvbmZpZyA9IGZlZWRiYWNrQ29uZmlnPy5bdHJpZ2dlclR5cGVdPy5bYWN0aW9uXSBhcyBTdXJ2ZXlDb25maWc7XG5cdGlmIChzdXJ2ZXlDb25maWcpIHtcblx0XHR0cmlnZ2VyU3VydmV5KHN1cnZleUNvbmZpZy5hcmVhSWQsIHN1cnZleUNvbmZpZy50cmlnZ2VyTmFtZSwgc3VydmV5Q29uZmlnLnBheWxvYWQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O01BU1lBLFdBQVc7RUFBQSxXQUFYQSxXQUFXO0lBQVhBLFdBQVc7SUFBWEEsV0FBVztFQUFBLEdBQVhBLFdBQVcsS0FBWEEsV0FBVztFQUFBO0VBQUEsSUFLWEMsZUFBZTtFQUkzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxXQUpZQSxlQUFlO0lBQWZBLGVBQWU7RUFBQSxHQUFmQSxlQUFlLEtBQWZBLGVBQWU7RUFBQTtFQVczQixNQUFNQyxPQUFPLEdBQUcsY0FBYztFQUM5QixNQUFNQyxPQUFPLEdBQUcsZUFBZTs7RUFFL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxhQUFhLENBQUNDLE1BQWMsRUFBRUMsV0FBbUIsRUFBRUMsT0FBWSxFQUFFO0lBQ2hGLE1BQU1DLFVBQVUsR0FBRztNQUNsQkgsTUFBTSxFQUFFQSxNQUFNO01BQ2RDLFdBQVcsRUFBRUEsV0FBVztNQUN4QkMsT0FBTyxFQUFFQTtJQUNWLENBQUM7SUFDREUsSUFBSSxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDVCxPQUFPLEVBQUVDLE9BQU8sRUFBRUssVUFBVSxDQUFDO0VBQ3pEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEE7RUFVTyxTQUFTSSx1QkFBdUIsQ0FBQ0MsSUFBVSxFQUFFQyxNQUFjLEVBQUVDLFdBQXdCLEVBQUU7SUFBQTtJQUM3RixNQUFNQyxjQUFjLHdCQUFJSCxJQUFJLENBQUNJLFdBQVcsRUFBRSwrRUFBbkIsa0JBQTZCQyxPQUFPLDBEQUFwQyxzQkFBc0NDLFFBQVE7SUFDckUsTUFBTUMsWUFBWSxHQUFHSixjQUFjLGFBQWRBLGNBQWMsZ0RBQWRBLGNBQWMsQ0FBR0QsV0FBVyxDQUFDLDBEQUE3QixzQkFBZ0NELE1BQU0sQ0FBaUI7SUFDNUUsSUFBSU0sWUFBWSxFQUFFO01BQ2pCaEIsYUFBYSxDQUFDZ0IsWUFBWSxDQUFDZixNQUFNLEVBQUVlLFlBQVksQ0FBQ2QsV0FBVyxFQUFFYyxZQUFZLENBQUNiLE9BQU8sQ0FBQztJQUNuRjtFQUNEO0VBQUM7RUFBQTtBQUFBIn0=