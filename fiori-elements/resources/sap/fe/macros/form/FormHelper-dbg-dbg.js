/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/library"], function (library) {
  "use strict";

  var TitleLevel = library.TitleLevel;
  /**
   * Helper class used by MDC controls for OData(V4) specific handling
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const FormHelper = {
    /**
     * Method that checks, if a reference facet needs to be assigned to either "blocks" or "moreBlocks" (tagged by subsection property "partOfPreview!).
     *
     * @param referenceFacet Reference facet that needs to be assigned
     * @param partOfPreview Subsection property "partOfPreview" that needs to aligned with the reference facet's annotation "PartOfPreview!
     * @param partOfPreview.toString
     * @returns True, if the ReferenceFacet has the same annotation as the subsection's property "partOfPreview"
     */
    isReferenceFacetPartOfPreview: function (referenceFacet, partOfPreview) {
      partOfPreview = partOfPreview.toString();
      if (referenceFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        const annotatedTerm = referenceFacet["@com.sap.vocabularies.UI.v1.PartOfPreview"];
        return partOfPreview === "true" && annotatedTerm !== false || partOfPreview === "false" && annotatedTerm === false;
      }
      return false;
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters passed.
     *
     * @param semanticKeys SemanticKeys included in the entity set
     * @returns The fields to be included in the select query
     */
    create$Select: function (semanticKeys) {
      return (semanticKeys || []).map(key => key.$PropertyPath).join(",");
    },
    /**
     * Generates the binding expression for the form.
     *
     * @param navigationPath The navigation path defined for the entity
     * @param semanticKeys SemanticKeys included in the entity set
     * @returns The Binding expression including path and $select query as parameter depending on the function parameters
     */
    generateBindingExpression: function (navigationPath, semanticKeys) {
      if (!navigationPath && !semanticKeys) {
        return "";
      }
      const binding = {
        path: navigationPath || ""
      };
      if (semanticKeys) {
        binding.parameters = {
          $select: FormHelper.create$Select(semanticKeys)
        };
      }
      return JSON.stringify(binding);
    },
    /**
     * Calculates the title level for the containers in this form.
     *
     * If there is no form title, the form containers get the same header level as the form, otherwise the levels are incremented to reflect the deeper nesting.
     *
     * @param [title] The title of the form
     * @param [titleLevel] The title level of the form
     * @returns The title level of the form containers
     */
    getFormContainerTitleLevel: function (title, titleLevel) {
      if (!title) {
        return titleLevel;
      }
      switch (titleLevel) {
        case TitleLevel.H1:
          return TitleLevel.H2;
        case TitleLevel.H2:
          return TitleLevel.H3;
        case TitleLevel.H3:
          return TitleLevel.H4;
        case TitleLevel.H4:
          return TitleLevel.H5;
        case TitleLevel.H5:
        case TitleLevel.H6:
          return TitleLevel.H6;
        default:
          return TitleLevel.Auto;
      }
    }
  };
  return FormHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtSGVscGVyIiwiaXNSZWZlcmVuY2VGYWNldFBhcnRPZlByZXZpZXciLCJyZWZlcmVuY2VGYWNldCIsInBhcnRPZlByZXZpZXciLCJ0b1N0cmluZyIsIiRUeXBlIiwiYW5ub3RhdGVkVGVybSIsImNyZWF0ZSRTZWxlY3QiLCJzZW1hbnRpY0tleXMiLCJtYXAiLCJrZXkiLCIkUHJvcGVydHlQYXRoIiwiam9pbiIsImdlbmVyYXRlQmluZGluZ0V4cHJlc3Npb24iLCJuYXZpZ2F0aW9uUGF0aCIsImJpbmRpbmciLCJwYXRoIiwicGFyYW1ldGVycyIsIiRzZWxlY3QiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0Rm9ybUNvbnRhaW5lclRpdGxlTGV2ZWwiLCJ0aXRsZSIsInRpdGxlTGV2ZWwiLCJUaXRsZUxldmVsIiwiSDEiLCJIMiIsIkgzIiwiSDQiLCJINSIsIkg2IiwiQXV0byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFBhdGhJbk1vZGVsRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBUaXRsZUxldmVsIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcblxuLyoqXG4gKiBJbnRlcm5hbGx5IHVzZXMgc3RydWN0dXJlIG9mIGEgc2VtYW50aWMga2V5IG9iamVjdFxuICovXG5pbnRlcmZhY2UgU2VtYW50aWNLZXkge1xuXHQkUHJvcGVydHlQYXRoPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIElucHV0IHBhcmFtZXRlciB0eXBlIGZvciBpc1JlZmVyZW5jZUZhY2V0UGFydE9mUHJldmlld1xuICovXG5pbnRlcmZhY2UgUmVmZXJlbmNlRmFjZXQge1xuXHQkVHlwZT86IHN0cmluZztcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFydE9mUHJldmlld1wiPzogYm9vbGVhbiB8IHVua25vd247XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHVzZWQgYnkgTURDIGNvbnRyb2xzIGZvciBPRGF0YShWNCkgc3BlY2lmaWMgaGFuZGxpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICovXG5jb25zdCBGb3JtSGVscGVyID0ge1xuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgY2hlY2tzLCBpZiBhIHJlZmVyZW5jZSBmYWNldCBuZWVkcyB0byBiZSBhc3NpZ25lZCB0byBlaXRoZXIgXCJibG9ja3NcIiBvciBcIm1vcmVCbG9ja3NcIiAodGFnZ2VkIGJ5IHN1YnNlY3Rpb24gcHJvcGVydHkgXCJwYXJ0T2ZQcmV2aWV3ISkuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWZlcmVuY2VGYWNldCBSZWZlcmVuY2UgZmFjZXQgdGhhdCBuZWVkcyB0byBiZSBhc3NpZ25lZFxuXHQgKiBAcGFyYW0gcGFydE9mUHJldmlldyBTdWJzZWN0aW9uIHByb3BlcnR5IFwicGFydE9mUHJldmlld1wiIHRoYXQgbmVlZHMgdG8gYWxpZ25lZCB3aXRoIHRoZSByZWZlcmVuY2UgZmFjZXQncyBhbm5vdGF0aW9uIFwiUGFydE9mUHJldmlldyFcblx0ICogQHBhcmFtIHBhcnRPZlByZXZpZXcudG9TdHJpbmdcblx0ICogQHJldHVybnMgVHJ1ZSwgaWYgdGhlIFJlZmVyZW5jZUZhY2V0IGhhcyB0aGUgc2FtZSBhbm5vdGF0aW9uIGFzIHRoZSBzdWJzZWN0aW9uJ3MgcHJvcGVydHkgXCJwYXJ0T2ZQcmV2aWV3XCJcblx0ICovXG5cdGlzUmVmZXJlbmNlRmFjZXRQYXJ0T2ZQcmV2aWV3OiBmdW5jdGlvbiAocmVmZXJlbmNlRmFjZXQ6IFJlZmVyZW5jZUZhY2V0LCBwYXJ0T2ZQcmV2aWV3OiB7IHRvU3RyaW5nKCk6IHN0cmluZyB9KTogYm9vbGVhbiB7XG5cdFx0cGFydE9mUHJldmlldyA9IHBhcnRPZlByZXZpZXcudG9TdHJpbmcoKTtcblx0XHRpZiAocmVmZXJlbmNlRmFjZXQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIikge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGVkVGVybSA9IHJlZmVyZW5jZUZhY2V0W1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlBhcnRPZlByZXZpZXdcIl07XG5cdFx0XHRyZXR1cm4gKHBhcnRPZlByZXZpZXcgPT09IFwidHJ1ZVwiICYmIGFubm90YXRlZFRlcm0gIT09IGZhbHNlKSB8fCAocGFydE9mUHJldmlldyA9PT0gXCJmYWxzZVwiICYmIGFubm90YXRlZFRlcm0gPT09IGZhbHNlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgc2VsZWN0IHF1ZXJ5IHdpdGggdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZC5cblx0ICpcblx0ICogQHBhcmFtIHNlbWFudGljS2V5cyBTZW1hbnRpY0tleXMgaW5jbHVkZWQgaW4gdGhlIGVudGl0eSBzZXRcblx0ICogQHJldHVybnMgVGhlIGZpZWxkcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgc2VsZWN0IHF1ZXJ5XG5cdCAqL1xuXHRjcmVhdGUkU2VsZWN0OiBmdW5jdGlvbiAoc2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleVtdKSB7XG5cdFx0cmV0dXJuIChzZW1hbnRpY0tleXMgfHwgW10pLm1hcCgoa2V5KSA9PiBrZXkuJFByb3BlcnR5UGF0aCkuam9pbihcIixcIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgZm9ybS5cblx0ICpcblx0ICogQHBhcmFtIG5hdmlnYXRpb25QYXRoIFRoZSBuYXZpZ2F0aW9uIHBhdGggZGVmaW5lZCBmb3IgdGhlIGVudGl0eVxuXHQgKiBAcGFyYW0gc2VtYW50aWNLZXlzIFNlbWFudGljS2V5cyBpbmNsdWRlZCBpbiB0aGUgZW50aXR5IHNldFxuXHQgKiBAcmV0dXJucyBUaGUgQmluZGluZyBleHByZXNzaW9uIGluY2x1ZGluZyBwYXRoIGFuZCAkc2VsZWN0IHF1ZXJ5IGFzIHBhcmFtZXRlciBkZXBlbmRpbmcgb24gdGhlIGZ1bmN0aW9uIHBhcmFtZXRlcnNcblx0ICovXG5cdGdlbmVyYXRlQmluZGluZ0V4cHJlc3Npb246IGZ1bmN0aW9uIChuYXZpZ2F0aW9uUGF0aD86IHN0cmluZywgc2VtYW50aWNLZXlzPzogU2VtYW50aWNLZXlbXSkge1xuXHRcdGlmICghbmF2aWdhdGlvblBhdGggJiYgIXNlbWFudGljS2V5cykge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdGNvbnN0IGJpbmRpbmc6IFBhcnRpYWw8UGF0aEluTW9kZWxFeHByZXNzaW9uPHVuZGVmaW5lZD4+ID0ge1xuXHRcdFx0cGF0aDogbmF2aWdhdGlvblBhdGggfHwgXCJcIlxuXHRcdH07XG5cdFx0aWYgKHNlbWFudGljS2V5cykge1xuXHRcdFx0YmluZGluZy5wYXJhbWV0ZXJzID0geyAkc2VsZWN0OiBGb3JtSGVscGVyLmNyZWF0ZSRTZWxlY3Qoc2VtYW50aWNLZXlzKSB9O1xuXHRcdH1cblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoYmluZGluZyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHRpdGxlIGxldmVsIGZvciB0aGUgY29udGFpbmVycyBpbiB0aGlzIGZvcm0uXG5cdCAqXG5cdCAqIElmIHRoZXJlIGlzIG5vIGZvcm0gdGl0bGUsIHRoZSBmb3JtIGNvbnRhaW5lcnMgZ2V0IHRoZSBzYW1lIGhlYWRlciBsZXZlbCBhcyB0aGUgZm9ybSwgb3RoZXJ3aXNlIHRoZSBsZXZlbHMgYXJlIGluY3JlbWVudGVkIHRvIHJlZmxlY3QgdGhlIGRlZXBlciBuZXN0aW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gW3RpdGxlXSBUaGUgdGl0bGUgb2YgdGhlIGZvcm1cblx0ICogQHBhcmFtIFt0aXRsZUxldmVsXSBUaGUgdGl0bGUgbGV2ZWwgb2YgdGhlIGZvcm1cblx0ICogQHJldHVybnMgVGhlIHRpdGxlIGxldmVsIG9mIHRoZSBmb3JtIGNvbnRhaW5lcnNcblx0ICovXG5cdGdldEZvcm1Db250YWluZXJUaXRsZUxldmVsOiBmdW5jdGlvbiAodGl0bGU/OiBzdHJpbmcsIHRpdGxlTGV2ZWw/OiBUaXRsZUxldmVsKTogVGl0bGVMZXZlbCB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCF0aXRsZSkge1xuXHRcdFx0cmV0dXJuIHRpdGxlTGV2ZWw7XG5cdFx0fVxuXHRcdHN3aXRjaCAodGl0bGVMZXZlbCkge1xuXHRcdFx0Y2FzZSBUaXRsZUxldmVsLkgxOlxuXHRcdFx0XHRyZXR1cm4gVGl0bGVMZXZlbC5IMjtcblx0XHRcdGNhc2UgVGl0bGVMZXZlbC5IMjpcblx0XHRcdFx0cmV0dXJuIFRpdGxlTGV2ZWwuSDM7XG5cdFx0XHRjYXNlIFRpdGxlTGV2ZWwuSDM6XG5cdFx0XHRcdHJldHVybiBUaXRsZUxldmVsLkg0O1xuXHRcdFx0Y2FzZSBUaXRsZUxldmVsLkg0OlxuXHRcdFx0XHRyZXR1cm4gVGl0bGVMZXZlbC5INTtcblx0XHRcdGNhc2UgVGl0bGVMZXZlbC5INTpcblx0XHRcdGNhc2UgVGl0bGVMZXZlbC5INjpcblx0XHRcdFx0cmV0dXJuIFRpdGxlTGV2ZWwuSDY7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gVGl0bGVMZXZlbC5BdXRvO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9ybUhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsVUFBVSxHQUFHO0lBQ2xCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsNkJBQTZCLEVBQUUsVUFBVUMsY0FBOEIsRUFBRUMsYUFBcUMsRUFBVztNQUN4SEEsYUFBYSxHQUFHQSxhQUFhLENBQUNDLFFBQVEsRUFBRTtNQUN4QyxJQUFJRixjQUFjLENBQUNHLEtBQUssS0FBSywyQ0FBMkMsRUFBRTtRQUN6RSxNQUFNQyxhQUFhLEdBQUdKLGNBQWMsQ0FBQywyQ0FBMkMsQ0FBQztRQUNqRixPQUFRQyxhQUFhLEtBQUssTUFBTSxJQUFJRyxhQUFhLEtBQUssS0FBSyxJQUFNSCxhQUFhLEtBQUssT0FBTyxJQUFJRyxhQUFhLEtBQUssS0FBTTtNQUN2SDtNQUNBLE9BQU8sS0FBSztJQUNiLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsYUFBYSxFQUFFLFVBQVVDLFlBQTJCLEVBQUU7TUFDckQsT0FBTyxDQUFDQSxZQUFZLElBQUksRUFBRSxFQUFFQyxHQUFHLENBQUVDLEdBQUcsSUFBS0EsR0FBRyxDQUFDQyxhQUFhLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUN0RSxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MseUJBQXlCLEVBQUUsVUFBVUMsY0FBdUIsRUFBRU4sWUFBNEIsRUFBRTtNQUMzRixJQUFJLENBQUNNLGNBQWMsSUFBSSxDQUFDTixZQUFZLEVBQUU7UUFDckMsT0FBTyxFQUFFO01BQ1Y7TUFDQSxNQUFNTyxPQUFrRCxHQUFHO1FBQzFEQyxJQUFJLEVBQUVGLGNBQWMsSUFBSTtNQUN6QixDQUFDO01BQ0QsSUFBSU4sWUFBWSxFQUFFO1FBQ2pCTyxPQUFPLENBQUNFLFVBQVUsR0FBRztVQUFFQyxPQUFPLEVBQUVsQixVQUFVLENBQUNPLGFBQWEsQ0FBQ0MsWUFBWTtRQUFFLENBQUM7TUFDekU7TUFDQSxPQUFPVyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0wsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ00sMEJBQTBCLEVBQUUsVUFBVUMsS0FBYyxFQUFFQyxVQUF1QixFQUEwQjtNQUN0RyxJQUFJLENBQUNELEtBQUssRUFBRTtRQUNYLE9BQU9DLFVBQVU7TUFDbEI7TUFDQSxRQUFRQSxVQUFVO1FBQ2pCLEtBQUtDLFVBQVUsQ0FBQ0MsRUFBRTtVQUNqQixPQUFPRCxVQUFVLENBQUNFLEVBQUU7UUFDckIsS0FBS0YsVUFBVSxDQUFDRSxFQUFFO1VBQ2pCLE9BQU9GLFVBQVUsQ0FBQ0csRUFBRTtRQUNyQixLQUFLSCxVQUFVLENBQUNHLEVBQUU7VUFDakIsT0FBT0gsVUFBVSxDQUFDSSxFQUFFO1FBQ3JCLEtBQUtKLFVBQVUsQ0FBQ0ksRUFBRTtVQUNqQixPQUFPSixVQUFVLENBQUNLLEVBQUU7UUFDckIsS0FBS0wsVUFBVSxDQUFDSyxFQUFFO1FBQ2xCLEtBQUtMLFVBQVUsQ0FBQ00sRUFBRTtVQUNqQixPQUFPTixVQUFVLENBQUNNLEVBQUU7UUFDckI7VUFDQyxPQUFPTixVQUFVLENBQUNPLElBQUk7TUFBQztJQUUxQjtFQUNELENBQUM7RUFBQyxPQUVhL0IsVUFBVTtBQUFBIn0=