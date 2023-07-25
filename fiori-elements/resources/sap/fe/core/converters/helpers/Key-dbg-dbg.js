/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["../../helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};
  var getStableIdPartFromDataField = StableIdHelper.getStableIdPartFromDataField;
  /**
   * The KeyHelper is used for dealing with Key in the concern of the flexible programming model
   */
  let KeyHelper = /*#__PURE__*/function () {
    function KeyHelper() {}
    _exports.KeyHelper = KeyHelper;
    /**
     * Returns a generated key for DataFields to be used in the flexible programming model.
     *
     * @param dataField DataField to generate the key for
     * @returns Returns a through StableIdHelper generated key
     */
    KeyHelper.generateKeyFromDataField = function generateKeyFromDataField(dataField) {
      return getStableIdPartFromDataField(dataField, true);
    }

    /**
     * Throws a Error if any other character then aA-zZ, 0-9, ':', '_' or '-' is used.
     *
     * @param key String to check validity on
     */;
    KeyHelper.validateKey = function validateKey(key) {
      const pattern = /[^A-Za-z0-9_\-:]/;
      if (pattern.exec(key)) {
        throw new Error(`Invalid key: ${key} - only 'A-Za-z0-9_-:' are allowed`);
      }
    }

    /**
     * Returns the key for a selection field required for adaption.
     *
     * @param fullPropertyPath The full property path (without entityType)
     * @returns The key of the selection field
     */;
    KeyHelper.getSelectionFieldKeyFromPath = function getSelectionFieldKeyFromPath(fullPropertyPath) {
      return fullPropertyPath.replace(/([*+])?\//g, "::");
    }

    /**
     * Returns the path for a selection field required for adaption.
     *
     * @param selectionFieldKey The key of the selection field
     * @returns The full property path
     */;
    KeyHelper.getPathFromSelectionFieldKey = function getPathFromSelectionFieldKey(selectionFieldKey) {
      return selectionFieldKey.replace(/::/g, "/");
    };
    return KeyHelper;
  }();
  _exports.KeyHelper = KeyHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJkYXRhRmllbGQiLCJnZXRTdGFibGVJZFBhcnRGcm9tRGF0YUZpZWxkIiwidmFsaWRhdGVLZXkiLCJrZXkiLCJwYXR0ZXJuIiwiZXhlYyIsIkVycm9yIiwiZ2V0U2VsZWN0aW9uRmllbGRLZXlGcm9tUGF0aCIsImZ1bGxQcm9wZXJ0eVBhdGgiLCJyZXBsYWNlIiwiZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleSIsInNlbGVjdGlvbkZpZWxkS2V5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJLZXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5cbi8qKlxuICogVGhlIEtleUhlbHBlciBpcyB1c2VkIGZvciBkZWFsaW5nIHdpdGggS2V5IGluIHRoZSBjb25jZXJuIG9mIHRoZSBmbGV4aWJsZSBwcm9ncmFtbWluZyBtb2RlbFxuICovXG5leHBvcnQgY2xhc3MgS2V5SGVscGVyIHtcblx0LyoqXG5cdCAqIFJldHVybnMgYSBnZW5lcmF0ZWQga2V5IGZvciBEYXRhRmllbGRzIHRvIGJlIHVzZWQgaW4gdGhlIGZsZXhpYmxlIHByb2dyYW1taW5nIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBnZW5lcmF0ZSB0aGUga2V5IGZvclxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIGEgdGhyb3VnaCBTdGFibGVJZEhlbHBlciBnZW5lcmF0ZWQga2V5XG5cdCAqL1xuXHRzdGF0aWMgZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGdldFN0YWJsZUlkUGFydEZyb21EYXRhRmllbGQoZGF0YUZpZWxkLCB0cnVlKSE7XG5cdH1cblxuXHQvKipcblx0ICogVGhyb3dzIGEgRXJyb3IgaWYgYW55IG90aGVyIGNoYXJhY3RlciB0aGVuIGFBLXpaLCAwLTksICc6JywgJ18nIG9yICctJyBpcyB1c2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFN0cmluZyB0byBjaGVjayB2YWxpZGl0eSBvblxuXHQgKi9cblx0c3RhdGljIHZhbGlkYXRlS2V5KGtleTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgcGF0dGVybiA9IC9bXkEtWmEtejAtOV9cXC06XS87XG5cdFx0aWYgKHBhdHRlcm4uZXhlYyhrZXkpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQga2V5OiAke2tleX0gLSBvbmx5ICdBLVphLXowLTlfLTonIGFyZSBhbGxvd2VkYCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGtleSBmb3IgYSBzZWxlY3Rpb24gZmllbGQgcmVxdWlyZWQgZm9yIGFkYXB0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gZnVsbFByb3BlcnR5UGF0aCBUaGUgZnVsbCBwcm9wZXJ0eSBwYXRoICh3aXRob3V0IGVudGl0eVR5cGUpXG5cdCAqIEByZXR1cm5zIFRoZSBrZXkgb2YgdGhlIHNlbGVjdGlvbiBmaWVsZFxuXHQgKi9cblx0c3RhdGljIGdldFNlbGVjdGlvbkZpZWxkS2V5RnJvbVBhdGgoZnVsbFByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIGZ1bGxQcm9wZXJ0eVBhdGgucmVwbGFjZSgvKFsqK10pP1xcLy9nLCBcIjo6XCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHBhdGggZm9yIGEgc2VsZWN0aW9uIGZpZWxkIHJlcXVpcmVkIGZvciBhZGFwdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHNlbGVjdGlvbkZpZWxkS2V5IFRoZSBrZXkgb2YgdGhlIHNlbGVjdGlvbiBmaWVsZFxuXHQgKiBAcmV0dXJucyBUaGUgZnVsbCBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHRzdGF0aWMgZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleShzZWxlY3Rpb25GaWVsZEtleTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkS2V5LnJlcGxhY2UoLzo6L2csIFwiL1wiKTtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFHQTtBQUNBO0FBQ0E7RUFGQSxJQUdhQSxTQUFTO0lBQUE7SUFBQTtJQUNyQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFMQyxVQU1PQyx3QkFBd0IsR0FBL0Isa0NBQWdDQyxTQUFpQyxFQUFVO01BQzFFLE9BQU9DLDRCQUE0QixDQUFDRCxTQUFTLEVBQUUsSUFBSSxDQUFDO0lBQ3JEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLFVBS09FLFdBQVcsR0FBbEIscUJBQW1CQyxHQUFXLEVBQUU7TUFDL0IsTUFBTUMsT0FBTyxHQUFHLGtCQUFrQjtNQUNsQyxJQUFJQSxPQUFPLENBQUNDLElBQUksQ0FBQ0YsR0FBRyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJRyxLQUFLLENBQUUsZ0JBQWVILEdBQUksb0NBQW1DLENBQUM7TUFDekU7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFVBTU9JLDRCQUE0QixHQUFuQyxzQ0FBb0NDLGdCQUF3QixFQUFFO01BQzdELE9BQU9BLGdCQUFnQixDQUFDQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztJQUNwRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFVBTU9DLDRCQUE0QixHQUFuQyxzQ0FBb0NDLGlCQUF5QixFQUFFO01BQzlELE9BQU9BLGlCQUFpQixDQUFDRixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztJQUM3QyxDQUFDO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9