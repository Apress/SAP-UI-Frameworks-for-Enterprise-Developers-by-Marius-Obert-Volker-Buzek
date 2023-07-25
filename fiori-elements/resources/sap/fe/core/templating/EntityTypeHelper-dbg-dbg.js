/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/BindingToolkit"], function (Log, BindingToolkit) {
  "use strict";

  var _exports = {};
  var pathInModel = BindingToolkit.pathInModel;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var concat = BindingToolkit.concat;
  // Collection of helper functions to retrieve information from an EntityType.

  // This is still a work in progress

  /**
   * Retrieve the binding expression required to display the title of an entity.
   *
   * This is usually defined as:
   *  - the HeaderInfo.Title value
   *  - the SemanticKeys properties
   *  - the keys properties.
   *
   * @param entityType The target entityType
   * @returns The title binding expression
   */
  const getTitleExpression = entityType => {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5, _entityType$annotatio6, _entityType$annotatio7, _entityType$annotatio8;
    // HeaderInfo can be a [DataField] and any of its children, or a [DataFieldForAnnotation] targeting [ConnectedFields](#ConnectedFields).
    const headerInfoTitle = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.HeaderInfo) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.Title;
    if (headerInfoTitle) {
      switch (headerInfoTitle.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
          return getExpressionFromAnnotation(headerInfoTitle.Value);
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          Log.error("DataFieldForAnnotation with connected fields not supported for HeaderInfo.Title");
          return getExpressionFromAnnotation((_entityType$annotatio4 = entityType.annotations) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.HeaderInfo) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.TypeName);
      }
    }
    const semanticKeys = (_entityType$annotatio7 = entityType.annotations) === null || _entityType$annotatio7 === void 0 ? void 0 : (_entityType$annotatio8 = _entityType$annotatio7.Common) === null || _entityType$annotatio8 === void 0 ? void 0 : _entityType$annotatio8.SemanticKey;
    if (semanticKeys) {
      return concat(...semanticKeys.map(key => pathInModel(key.value)));
    }
  };
  _exports.getTitleExpression = getTitleExpression;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUaXRsZUV4cHJlc3Npb24iLCJlbnRpdHlUeXBlIiwiaGVhZGVySW5mb1RpdGxlIiwiYW5ub3RhdGlvbnMiLCJVSSIsIkhlYWRlckluZm8iLCJUaXRsZSIsIiRUeXBlIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiVmFsdWUiLCJMb2ciLCJlcnJvciIsIlR5cGVOYW1lIiwic2VtYW50aWNLZXlzIiwiQ29tbW9uIiwiU2VtYW50aWNLZXkiLCJjb25jYXQiLCJtYXAiLCJrZXkiLCJwYXRoSW5Nb2RlbCIsInZhbHVlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFbnRpdHlUeXBlSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IERhdGFGaWVsZCwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiwgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgY29uY2F0LCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcblxuLy8gQ29sbGVjdGlvbiBvZiBoZWxwZXIgZnVuY3Rpb25zIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIGZyb20gYW4gRW50aXR5VHlwZS5cblxuLy8gVGhpcyBpcyBzdGlsbCBhIHdvcmsgaW4gcHJvZ3Jlc3NcblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHJlcXVpcmVkIHRvIGRpc3BsYXkgdGhlIHRpdGxlIG9mIGFuIGVudGl0eS5cbiAqXG4gKiBUaGlzIGlzIHVzdWFsbHkgZGVmaW5lZCBhczpcbiAqICAtIHRoZSBIZWFkZXJJbmZvLlRpdGxlIHZhbHVlXG4gKiAgLSB0aGUgU2VtYW50aWNLZXlzIHByb3BlcnRpZXNcbiAqICAtIHRoZSBrZXlzIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIHRhcmdldCBlbnRpdHlUeXBlXG4gKiBAcmV0dXJucyBUaGUgdGl0bGUgYmluZGluZyBleHByZXNzaW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUaXRsZUV4cHJlc3Npb24gPSAoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHwgdW5kZWZpbmVkID0+IHtcblx0Ly8gSGVhZGVySW5mbyBjYW4gYmUgYSBbRGF0YUZpZWxkXSBhbmQgYW55IG9mIGl0cyBjaGlsZHJlbiwgb3IgYSBbRGF0YUZpZWxkRm9yQW5ub3RhdGlvbl0gdGFyZ2V0aW5nIFtDb25uZWN0ZWRGaWVsZHNdKCNDb25uZWN0ZWRGaWVsZHMpLlxuXHRjb25zdCBoZWFkZXJJbmZvVGl0bGUgPSBlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkIHwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjtcblx0aWYgKGhlYWRlckluZm9UaXRsZSkge1xuXHRcdHN3aXRjaCAoaGVhZGVySW5mb1RpdGxlLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdFx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihoZWFkZXJJbmZvVGl0bGUuVmFsdWUpO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHRMb2cuZXJyb3IoXCJEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHdpdGggY29ubmVjdGVkIGZpZWxkcyBub3Qgc3VwcG9ydGVkIGZvciBIZWFkZXJJbmZvLlRpdGxlXCIpO1xuXHRcdFx0XHRyZXR1cm4gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UeXBlTmFtZSk7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHNlbWFudGljS2V5cyA9IGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNLZXk7XG5cdGlmIChzZW1hbnRpY0tleXMpIHtcblx0XHRyZXR1cm4gY29uY2F0KC4uLnNlbWFudGljS2V5cy5tYXAoKGtleSkgPT4gcGF0aEluTW9kZWwoa2V5LnZhbHVlKSkpO1xuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQUtBOztFQUVBOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxrQkFBa0IsR0FBSUMsVUFBc0IsSUFBZ0Q7SUFBQTtJQUN4RztJQUNBLE1BQU1DLGVBQWUsNEJBQUdELFVBQVUsQ0FBQ0UsV0FBVyxvRkFBdEIsc0JBQXdCQyxFQUFFLHFGQUExQix1QkFBNEJDLFVBQVUsMkRBQXRDLHVCQUF3Q0MsS0FBMkM7SUFDM0csSUFBSUosZUFBZSxFQUFFO01BQ3BCLFFBQVFBLGVBQWUsQ0FBQ0ssS0FBSztRQUM1QjtVQUNDLE9BQU9DLDJCQUEyQixDQUFDTixlQUFlLENBQUNPLEtBQUssQ0FBQztRQUMxRDtVQUNDQyxHQUFHLENBQUNDLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQztVQUM1RixPQUFPSCwyQkFBMkIsMkJBQUNQLFVBQVUsQ0FBQ0UsV0FBVyxxRkFBdEIsdUJBQXdCQyxFQUFFLHFGQUExQix1QkFBNEJDLFVBQVUsMkRBQXRDLHVCQUF3Q08sUUFBUSxDQUFDO01BQUM7SUFFeEY7SUFDQSxNQUFNQyxZQUFZLDZCQUFHWixVQUFVLENBQUNFLFdBQVcscUZBQXRCLHVCQUF3QlcsTUFBTSwyREFBOUIsdUJBQWdDQyxXQUFXO0lBQ2hFLElBQUlGLFlBQVksRUFBRTtNQUNqQixPQUFPRyxNQUFNLENBQUMsR0FBR0gsWUFBWSxDQUFDSSxHQUFHLENBQUVDLEdBQUcsSUFBS0MsV0FBVyxDQUFDRCxHQUFHLENBQUNFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEU7RUFDRCxDQUFDO0VBQUM7RUFBQTtBQUFBIn0=