/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Generates the ID from an IBN.
   *
   * The ID contains the value, the potential action and context.
   *
   * @param dataField The IBN annotation
   * @returns The ID
   */
  const _getStableIdPartFromIBN = dataField => {
    var _dataField$Action;
    const idParts = [dataField.SemanticObject.valueOf(), (_dataField$Action = dataField.Action) === null || _dataField$Action === void 0 ? void 0 : _dataField$Action.valueOf()];
    if (dataField.RequiresContext) {
      idParts.push("RequiresContext");
    }
    return idParts.filter(id => id).join("::");
  };

  /**
   * Generates the ID part related to the value of the DataField.
   *
   * @param dataField The DataField
   * @returns String related to the DataField value
   */
  const _getStableIdPartFromValue = dataField => {
    const value = dataField.Value;
    if (value.path) {
      return value.path;
    } else if (value.Apply && value.Function === "odata.concat") {
      return value.Apply.map(app => app.$Path).join("::");
    }
    return replaceSpecialChars(value.replace(/ /g, "_"));
  };

  /**
   * Copy for the Core.isValid function to be independent.
   *
   * @param value String to validate
   * @returns Whether the value is valid or not
   */
  const _isValid = value => {
    return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(value);
  };

  /**
   * Removes the annotation namespaces.
   *
   * @param id String to manipulate
   * @returns String without the annotation namespaces
   */
  const _removeNamespaces = id => {
    id = id.replace("com.sap.vocabularies.UI.v1.", "");
    id = id.replace("com.sap.vocabularies.Communication.v1.", "");
    return id;
  };

  /**
   * Generates the ID from an annotation.
   *
   * @param annotation The annotation
   * @param idPreparation Determines whether the ID needs to be prepared for final usage
   * @returns The ID
   */
  const createIdForAnnotation = function (annotation) {
    var _id;
    let idPreparation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let id;
    switch (annotation.$Type) {
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        id = annotation.ID ?? annotation.Target.value;
        break;
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        id = annotation.ID ?? "undefined"; // CollectionFacet without Id is not supported but doesn't necessary fail right now
        break;
      case "com.sap.vocabularies.UI.v1.FieldGroupType":
        id = annotation.Label;
        break;
      default:
        id = getStableIdPartFromDataField(annotation);
        break;
    }
    id = (_id = id) === null || _id === void 0 ? void 0 : _id.toString();
    return id && idPreparation ? prepareId(id) : id;
  };

  /**
   * Generates a stable ID based on the given parameters.
   *
   * Parameters are combined in the same order in which they are provided and are separated by '::'.
   * Generate(['Stable', 'Id']) would result in 'Stable::Id' as the stable ID.
   * Currently supported annotations are Facets, FieldGroup and all kinds of DataField.
   *
   * @param stableIdParts Array of strings, undefined, dataModelObjectPath or annotations
   * @returns Stable ID constructed from the provided parameters
   */
  _exports.createIdForAnnotation = createIdForAnnotation;
  const generate = stableIdParts => {
    const ids = stableIdParts.map(element => {
      if (typeof element === "string" || !element) {
        return element;
      }
      return createIdForAnnotation(element.targetObject || element, false);
    });
    const result = ids.filter(id => id).join("::");
    return prepareId(result);
  };

  /**
   * Generates the ID from a DataField.
   *
   * @param dataField The DataField
   * @param ignoreForCompatibility Ignore a part of the ID on the DataFieldWithNavigationPath to be aligned with previous versions
   * @returns The ID
   */
  _exports.generate = generate;
  const getStableIdPartFromDataField = function (dataField) {
    let ignoreForCompatibility = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let id = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        id = `DataFieldForAction::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        id = `DataFieldForIntentBasedNavigation::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        id = `DataFieldForAnnotation::${dataField.Target.value}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        id = `DataFieldWithAction::${_getStableIdPartFromValue(dataField)}::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
        id = `DataField::${_getStableIdPartFromValue(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        id = `DataFieldWithIntentBasedNavigation::${_getStableIdPartFromValue(dataField)}::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        id = `DataFieldWithNavigationPath::${_getStableIdPartFromValue(dataField)}`;
        if (dataField.Target.type === "NavigationPropertyPath" && !ignoreForCompatibility) {
          id = `${id}::${dataField.Target.value}`;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        id = `DataFieldWithUrl::${_getStableIdPartFromValue(dataField)}`;
        break;
      default:
        break;
    }
    return id ? prepareId(id) : undefined;
  };

  /**
   * Removes or replaces with "::" some special characters.
   * Special characters (@, /, #) are replaced by '::' if they are in the middle of the stable ID and removed altogether if they are at the beginning or end.
   *
   * @param id String to manipulate
   * @returns String without the special characters
   */
  _exports.getStableIdPartFromDataField = getStableIdPartFromDataField;
  const replaceSpecialChars = id => {
    if (id.indexOf(" ") >= 0) {
      throw Error(`${id} - Spaces are not allowed in ID parts.`);
    }
    id = id.replace(/^\/|^@|^#|^\*/, "") // remove special characters from the beginning of the string
    .replace(/\/$|@$|#$|\*$/, "") // remove special characters from the end of the string
    .replace(/\/|@|\(|\)|#|\*/g, "::"); // replace special characters with ::

    // Replace double occurrences of the separator with a single separator
    while (id.indexOf("::::") > -1) {
      id = id.replace("::::", "::");
    }

    // If there is a :: at the end of the ID remove it
    if (id.slice(-2) == "::") {
      id = id.slice(0, -2);
    }
    return id;
  };

  /**
   * Prepares the ID.
   *
   * Removes namespaces and special characters and checks the validity of this ID.
   *
   * @param id The ID
   * @returns The ID or throws an error
   */
  _exports.replaceSpecialChars = replaceSpecialChars;
  const prepareId = function (id) {
    id = replaceSpecialChars(_removeNamespaces(id));
    if (_isValid(id)) {
      return id;
    } else {
      throw Error(`${id} - Stable Id could not be generated due to insufficient information.`);
    }
  };
  _exports.prepareId = prepareId;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0U3RhYmxlSWRQYXJ0RnJvbUlCTiIsImRhdGFGaWVsZCIsImlkUGFydHMiLCJTZW1hbnRpY09iamVjdCIsInZhbHVlT2YiLCJBY3Rpb24iLCJSZXF1aXJlc0NvbnRleHQiLCJwdXNoIiwiZmlsdGVyIiwiaWQiLCJqb2luIiwiX2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZSIsInZhbHVlIiwiVmFsdWUiLCJwYXRoIiwiQXBwbHkiLCJGdW5jdGlvbiIsIm1hcCIsImFwcCIsIiRQYXRoIiwicmVwbGFjZVNwZWNpYWxDaGFycyIsInJlcGxhY2UiLCJfaXNWYWxpZCIsInRlc3QiLCJfcmVtb3ZlTmFtZXNwYWNlcyIsImNyZWF0ZUlkRm9yQW5ub3RhdGlvbiIsImFubm90YXRpb24iLCJpZFByZXBhcmF0aW9uIiwiJFR5cGUiLCJJRCIsIlRhcmdldCIsIkxhYmVsIiwiZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCIsInRvU3RyaW5nIiwicHJlcGFyZUlkIiwiZ2VuZXJhdGUiLCJzdGFibGVJZFBhcnRzIiwiaWRzIiwiZWxlbWVudCIsInRhcmdldE9iamVjdCIsInJlc3VsdCIsImlnbm9yZUZvckNvbXBhdGliaWxpdHkiLCJ0eXBlIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsIkVycm9yIiwic2xpY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN0YWJsZUlkSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRXaXRoQWN0aW9uLFxuXHREYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgsXG5cdERhdGFGaWVsZFdpdGhVcmwsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdFVJQW5ub3RhdGlvblR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwiLi4vdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5cbmV4cG9ydCB0eXBlIEF1dGhvcml6ZWRJZEFubm90YXRpb25zVHlwZSA9IEZhY2V0VHlwZXMgfCBGaWVsZEdyb3VwIHwgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIElEIGZyb20gYW4gSUJOLlxuICpcbiAqIFRoZSBJRCBjb250YWlucyB0aGUgdmFsdWUsIHRoZSBwb3RlbnRpYWwgYWN0aW9uIGFuZCBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIElCTiBhbm5vdGF0aW9uXG4gKiBAcmV0dXJucyBUaGUgSURcbiAqL1xuY29uc3QgX2dldFN0YWJsZUlkUGFydEZyb21JQk4gPSAoZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uKSA9PiB7XG5cdGNvbnN0IGlkUGFydHMgPSBbZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0LnZhbHVlT2YoKSwgZGF0YUZpZWxkLkFjdGlvbj8udmFsdWVPZigpXTtcblx0aWYgKChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKS5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRpZFBhcnRzLnB1c2goXCJSZXF1aXJlc0NvbnRleHRcIik7XG5cdH1cblx0cmV0dXJuIGlkUGFydHMuZmlsdGVyKChpZCkgPT4gaWQpLmpvaW4oXCI6OlwiKTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJRCBwYXJ0IHJlbGF0ZWQgdG8gdGhlIHZhbHVlIG9mIHRoZSBEYXRhRmllbGQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgRGF0YUZpZWxkXG4gKiBAcmV0dXJucyBTdHJpbmcgcmVsYXRlZCB0byB0aGUgRGF0YUZpZWxkIHZhbHVlXG4gKi9cbmNvbnN0IF9nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUgPSAoXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkIHwgRGF0YUZpZWxkV2l0aEFjdGlvbiB8IERhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBEYXRhRmllbGRXaXRoVXJsIHwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXG4pOiBzdHJpbmcgPT4ge1xuXHRjb25zdCB2YWx1ZSA9IGRhdGFGaWVsZC5WYWx1ZTtcblx0aWYgKHZhbHVlLnBhdGgpIHtcblx0XHRyZXR1cm4gdmFsdWUucGF0aCBhcyBzdHJpbmc7XG5cdH0gZWxzZSBpZiAodmFsdWUuQXBwbHkgJiYgdmFsdWUuRnVuY3Rpb24gPT09IFwib2RhdGEuY29uY2F0XCIpIHtcblx0XHRyZXR1cm4gdmFsdWUuQXBwbHkubWFwKChhcHA6IGFueSkgPT4gYXBwLiRQYXRoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkuam9pbihcIjo6XCIpO1xuXHR9XG5cdHJldHVybiByZXBsYWNlU3BlY2lhbENoYXJzKHZhbHVlLnJlcGxhY2UoLyAvZywgXCJfXCIpKTtcbn07XG5cbi8qKlxuICogQ29weSBmb3IgdGhlIENvcmUuaXNWYWxpZCBmdW5jdGlvbiB0byBiZSBpbmRlcGVuZGVudC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgU3RyaW5nIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB2YWx1ZSBpcyB2YWxpZCBvciBub3RcbiAqL1xuY29uc3QgX2lzVmFsaWQgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuXHRyZXR1cm4gL14oW0EtWmEtel9dWy1BLVphLXowLTlfLjpdKikkLy50ZXN0KHZhbHVlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgYW5ub3RhdGlvbiBuYW1lc3BhY2VzLlxuICpcbiAqIEBwYXJhbSBpZCBTdHJpbmcgdG8gbWFuaXB1bGF0ZVxuICogQHJldHVybnMgU3RyaW5nIHdpdGhvdXQgdGhlIGFubm90YXRpb24gbmFtZXNwYWNlc1xuICovXG5jb25zdCBfcmVtb3ZlTmFtZXNwYWNlcyA9IChpZDogc3RyaW5nKSA9PiB7XG5cdGlkID0gaWQucmVwbGFjZShcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlwiLCBcIlwiKTtcblx0aWQgPSBpZC5yZXBsYWNlKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5cIiwgXCJcIik7XG5cdHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJRCBmcm9tIGFuIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGFubm90YXRpb24gVGhlIGFubm90YXRpb25cbiAqIEBwYXJhbSBpZFByZXBhcmF0aW9uIERldGVybWluZXMgd2hldGhlciB0aGUgSUQgbmVlZHMgdG8gYmUgcHJlcGFyZWQgZm9yIGZpbmFsIHVzYWdlXG4gKiBAcmV0dXJucyBUaGUgSURcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUlkRm9yQW5ub3RhdGlvbiA9IChhbm5vdGF0aW9uOiBBdXRob3JpemVkSWRBbm5vdGF0aW9uc1R5cGUsIGlkUHJlcGFyYXRpb24gPSB0cnVlKSA9PiB7XG5cdGxldCBpZDtcblx0c3dpdGNoIChhbm5vdGF0aW9uLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGlkID0gYW5ub3RhdGlvbi5JRCA/PyBhbm5vdGF0aW9uLlRhcmdldC52YWx1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0aWQgPSBhbm5vdGF0aW9uLklEID8/IFwidW5kZWZpbmVkXCI7IC8vIENvbGxlY3Rpb25GYWNldCB3aXRob3V0IElkIGlzIG5vdCBzdXBwb3J0ZWQgYnV0IGRvZXNuJ3QgbmVjZXNzYXJ5IGZhaWwgcmlnaHQgbm93XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlOlxuXHRcdFx0aWQgPSBhbm5vdGF0aW9uLkxhYmVsO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlkID0gZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZChhbm5vdGF0aW9uIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpO1xuXHRcdFx0YnJlYWs7XG5cdH1cblx0aWQgPSBpZD8udG9TdHJpbmcoKTtcblx0cmV0dXJuIGlkICYmIGlkUHJlcGFyYXRpb24gPyBwcmVwYXJlSWQoaWQpIDogaWQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHN0YWJsZSBJRCBiYXNlZCBvbiB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAqXG4gKiBQYXJhbWV0ZXJzIGFyZSBjb21iaW5lZCBpbiB0aGUgc2FtZSBvcmRlciBpbiB3aGljaCB0aGV5IGFyZSBwcm92aWRlZCBhbmQgYXJlIHNlcGFyYXRlZCBieSAnOjonLlxuICogR2VuZXJhdGUoWydTdGFibGUnLCAnSWQnXSkgd291bGQgcmVzdWx0IGluICdTdGFibGU6OklkJyBhcyB0aGUgc3RhYmxlIElELlxuICogQ3VycmVudGx5IHN1cHBvcnRlZCBhbm5vdGF0aW9ucyBhcmUgRmFjZXRzLCBGaWVsZEdyb3VwIGFuZCBhbGwga2luZHMgb2YgRGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBzdGFibGVJZFBhcnRzIEFycmF5IG9mIHN0cmluZ3MsIHVuZGVmaW5lZCwgZGF0YU1vZGVsT2JqZWN0UGF0aCBvciBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgU3RhYmxlIElEIGNvbnN0cnVjdGVkIGZyb20gdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnNcbiAqL1xuZXhwb3J0IGNvbnN0IGdlbmVyYXRlID0gKHN0YWJsZUlkUGFydHM6IEFycmF5PHN0cmluZyB8IHVuZGVmaW5lZCB8IERhdGFNb2RlbE9iamVjdFBhdGggfCBBdXRob3JpemVkSWRBbm5vdGF0aW9uc1R5cGU+KSA9PiB7XG5cdGNvbnN0IGlkczogKHN0cmluZyB8IHVuZGVmaW5lZClbXSA9IHN0YWJsZUlkUGFydHMubWFwKChlbGVtZW50KSA9PiB7XG5cdFx0aWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiIHx8ICFlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudDtcblx0XHR9XG5cdFx0cmV0dXJuIGNyZWF0ZUlkRm9yQW5ub3RhdGlvbigoZWxlbWVudCBhcyBEYXRhTW9kZWxPYmplY3RQYXRoKS50YXJnZXRPYmplY3QgfHwgZWxlbWVudCwgZmFsc2UpO1xuXHR9KTtcblx0Y29uc3QgcmVzdWx0ID0gaWRzLmZpbHRlcigoaWQpID0+IGlkKS5qb2luKFwiOjpcIik7XG5cdHJldHVybiBwcmVwYXJlSWQocmVzdWx0KTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJRCBmcm9tIGEgRGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIERhdGFGaWVsZFxuICogQHBhcmFtIGlnbm9yZUZvckNvbXBhdGliaWxpdHkgSWdub3JlIGEgcGFydCBvZiB0aGUgSUQgb24gdGhlIERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCB0byBiZSBhbGlnbmVkIHdpdGggcHJldmlvdXMgdmVyc2lvbnNcbiAqIEByZXR1cm5zIFRoZSBJRFxuICovXG5leHBvcnQgY29uc3QgZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCA9IChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGlnbm9yZUZvckNvbXBhdGliaWxpdHkgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG5cdGxldCBpZCA9IFwiXCI7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JBY3Rpb246OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWQgPSBgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoQWN0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGQ6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLlRhcmdldC50eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIiAmJiAhaWdub3JlRm9yQ29tcGF0aWJpbGl0eSkge1xuXHRcdFx0XHRpZCA9IGAke2lkfTo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoVXJsOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBpZCA/IHByZXBhcmVJZChpZCkgOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgb3IgcmVwbGFjZXMgd2l0aCBcIjo6XCIgc29tZSBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gKiBTcGVjaWFsIGNoYXJhY3RlcnMgKEAsIC8sICMpIGFyZSByZXBsYWNlZCBieSAnOjonIGlmIHRoZXkgYXJlIGluIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWJsZSBJRCBhbmQgcmVtb3ZlZCBhbHRvZ2V0aGVyIGlmIHRoZXkgYXJlIGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kLlxuICpcbiAqIEBwYXJhbSBpZCBTdHJpbmcgdG8gbWFuaXB1bGF0ZVxuICogQHJldHVybnMgU3RyaW5nIHdpdGhvdXQgdGhlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICovXG5leHBvcnQgY29uc3QgcmVwbGFjZVNwZWNpYWxDaGFycyA9IChpZDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0aWYgKGlkLmluZGV4T2YoXCIgXCIpID49IDApIHtcblx0XHR0aHJvdyBFcnJvcihgJHtpZH0gLSBTcGFjZXMgYXJlIG5vdCBhbGxvd2VkIGluIElEIHBhcnRzLmApO1xuXHR9XG5cdGlkID0gaWRcblx0XHQucmVwbGFjZSgvXlxcL3xeQHxeI3xeXFwqLywgXCJcIikgLy8gcmVtb3ZlIHNwZWNpYWwgY2hhcmFjdGVycyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuXHRcdC5yZXBsYWNlKC9cXC8kfEAkfCMkfFxcKiQvLCBcIlwiKSAvLyByZW1vdmUgc3BlY2lhbCBjaGFyYWN0ZXJzIGZyb20gdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG5cdFx0LnJlcGxhY2UoL1xcL3xAfFxcKHxcXCl8I3xcXCovZywgXCI6OlwiKTsgLy8gcmVwbGFjZSBzcGVjaWFsIGNoYXJhY3RlcnMgd2l0aCA6OlxuXG5cdC8vIFJlcGxhY2UgZG91YmxlIG9jY3VycmVuY2VzIG9mIHRoZSBzZXBhcmF0b3Igd2l0aCBhIHNpbmdsZSBzZXBhcmF0b3Jcblx0d2hpbGUgKGlkLmluZGV4T2YoXCI6Ojo6XCIpID4gLTEpIHtcblx0XHRpZCA9IGlkLnJlcGxhY2UoXCI6Ojo6XCIsIFwiOjpcIik7XG5cdH1cblxuXHQvLyBJZiB0aGVyZSBpcyBhIDo6IGF0IHRoZSBlbmQgb2YgdGhlIElEIHJlbW92ZSBpdFxuXHRpZiAoaWQuc2xpY2UoLTIpID09IFwiOjpcIikge1xuXHRcdGlkID0gaWQuc2xpY2UoMCwgLTIpO1xuXHR9XG5cblx0cmV0dXJuIGlkO1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgSUQuXG4gKlxuICogUmVtb3ZlcyBuYW1lc3BhY2VzIGFuZCBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIGNoZWNrcyB0aGUgdmFsaWRpdHkgb2YgdGhpcyBJRC5cbiAqXG4gKiBAcGFyYW0gaWQgVGhlIElEXG4gKiBAcmV0dXJucyBUaGUgSUQgb3IgdGhyb3dzIGFuIGVycm9yXG4gKi9cbmV4cG9ydCBjb25zdCBwcmVwYXJlSWQgPSBmdW5jdGlvbiAoaWQ6IHN0cmluZykge1xuXHRpZCA9IHJlcGxhY2VTcGVjaWFsQ2hhcnMoX3JlbW92ZU5hbWVzcGFjZXMoaWQpKTtcblx0aWYgKF9pc1ZhbGlkKGlkKSkge1xuXHRcdHJldHVybiBpZDtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBFcnJvcihgJHtpZH0gLSBTdGFibGUgSWQgY291bGQgbm90IGJlIGdlbmVyYXRlZCBkdWUgdG8gaW5zdWZmaWNpZW50IGluZm9ybWF0aW9uLmApO1xuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsdUJBQXVCLEdBQUlDLFNBQWlGLElBQUs7SUFBQTtJQUN0SCxNQUFNQyxPQUFPLEdBQUcsQ0FBQ0QsU0FBUyxDQUFDRSxjQUFjLENBQUNDLE9BQU8sRUFBRSx1QkFBRUgsU0FBUyxDQUFDSSxNQUFNLHNEQUFoQixrQkFBa0JELE9BQU8sRUFBRSxDQUFDO0lBQ2pGLElBQUtILFNBQVMsQ0FBdUNLLGVBQWUsRUFBRTtNQUNyRUosT0FBTyxDQUFDSyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDaEM7SUFDQSxPQUFPTCxPQUFPLENBQUNNLE1BQU0sQ0FBRUMsRUFBRSxJQUFLQSxFQUFFLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQztFQUM3QyxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1DLHlCQUF5QixHQUM5QlYsU0FBZ0ksSUFDcEg7SUFDWixNQUFNVyxLQUFLLEdBQUdYLFNBQVMsQ0FBQ1ksS0FBSztJQUM3QixJQUFJRCxLQUFLLENBQUNFLElBQUksRUFBRTtNQUNmLE9BQU9GLEtBQUssQ0FBQ0UsSUFBSTtJQUNsQixDQUFDLE1BQU0sSUFBSUYsS0FBSyxDQUFDRyxLQUFLLElBQUlILEtBQUssQ0FBQ0ksUUFBUSxLQUFLLGNBQWMsRUFBRTtNQUM1RCxPQUFPSixLQUFLLENBQUNHLEtBQUssQ0FBQ0UsR0FBRyxDQUFFQyxHQUFRLElBQUtBLEdBQUcsQ0FBQ0MsS0FBMkIsQ0FBQyxDQUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2pGO0lBQ0EsT0FBT1UsbUJBQW1CLENBQUNSLEtB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