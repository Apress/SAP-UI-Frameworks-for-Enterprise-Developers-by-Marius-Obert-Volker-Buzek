/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a collection of properties that might be relevant for filtering a collection of entities.
       * These properties are rendered as filter fields on the UI.
       *
       * <br>
       * <i>Example in OData V4 notation defining selection fields in the Filter Bar</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="com.sap.vocabularies.UI.v1"&gt;
       *     &lt;Collection&gt;
       *     &lt;PropertyPath&gt;SalesOrder&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SoldToParty&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;OverallSDProcessStatus&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SalesOrderDate&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;ShippingCondition&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;LastChangedDateTime&lt;/PropertyPath&gt;
       *     &lt;/Collection&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#SelectionFields  com.sap.vocabularies.UI.v1.SelectionFields}</b><br/>
       *   </li>
       * </ul>
       */
      selectionFields: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "SelectionFields",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines if the Search Field in the filter bar is enabled.
       * Property "hideBasicSearch" must not be true.
       *
       * <br>
       * <i>Example in OData V4 Search Field in Filter Bar be rendered.</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
       *     &lt;Record&gt;
       *       &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions org.OData.Capabilities.V1.SearchRestrictions}</b><br/>
       *   </li>
       * </ul>
       */
      searchRestrictions: {
        namespace: "org.OData.Capabilities.V1",
        annotation: "SearchRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsInNlbGVjdGlvbkZpZWxkcyIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsInNlYXJjaFJlc3RyaWN0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLmRlc2lnbnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRhbm5vdGF0aW9uczoge1xuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgYSBjb2xsZWN0aW9uIG9mIHByb3BlcnRpZXMgdGhhdCBtaWdodCBiZSByZWxldmFudCBmb3IgZmlsdGVyaW5nIGEgY29sbGVjdGlvbiBvZiBlbnRpdGllcy5cblx0XHQgKiBUaGVzZSBwcm9wZXJ0aWVzIGFyZSByZW5kZXJlZCBhcyBmaWx0ZXIgZmllbGRzIG9uIHRoZSBVSS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIGRlZmluaW5nIHNlbGVjdGlvbiBmaWVsZHMgaW4gdGhlIEZpbHRlciBCYXI8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJjb20uY19zYWxlc29yZGVybWFuYWdlX3NkLlNhbGVzT3JkZXJNYW5hZ2VcIiZndDtcblx0XHQgKiAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiJmd0O1xuXHRcdCAqICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtTYWxlc09yZGVyJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7U29sZFRvUGFydHkmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtPdmVyYWxsU0RQcm9jZXNzU3RhdHVzJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7U2FsZXNPcmRlckRhdGUmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtTaGlwcGluZ0NvbmRpdGlvbiZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O0xhc3RDaGFuZ2VkRGF0ZVRpbWUmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjU2VsZWN0aW9uRmllbGRzICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHN9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0c2VsZWN0aW9uRmllbGRzOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiU2VsZWN0aW9uRmllbGRzXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgaWYgdGhlIFNlYXJjaCBGaWVsZCBpbiB0aGUgZmlsdGVyIGJhciBpcyBlbmFibGVkLlxuXHRcdCAqIFByb3BlcnR5IFwiaGlkZUJhc2ljU2VhcmNoXCIgbXVzdCBub3QgYmUgdHJ1ZS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IFNlYXJjaCBGaWVsZCBpbiBGaWx0ZXIgQmFyIGJlIHJlbmRlcmVkLjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogJmx0O0Fubm90YXRpb25zIFRhcmdldD1cImNvbS5jX3NhbGVzb3JkZXJtYW5hZ2Vfc2QuU2FsZXNPcmRlck1hbmFnZVwiJmd0O1xuXHRcdCAqICAgJmx0O0Fubm90YXRpb24gVGVybT1cIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCImZ3Q7XG5cdFx0ICogICAgICZsdDtSZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJTZWFyY2hhYmxlXCIgQm9vbD1cInRydWVcIiAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEubWQjU2VhcmNoUmVzdHJpY3Rpb25zIG9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHNlYXJjaFJlc3RyaWN0aW9uczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcIm9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjFcIixcblx0XHRcdGFubm90YXRpb246IFwiU2VhcmNoUmVzdHJpY3Rpb25zXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH1cblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztTQUFlO0lBQ2RBLFdBQVcsRUFBRTtNQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsZUFBZSxFQUFFO1FBQ2hCQyxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsa0JBQWtCLEVBQUU7UUFDbkJKLFNBQVMsRUFBRSwyQkFBMkI7UUFDdENDLFVBQVUsRUFBRSxvQkFBb0I7UUFDaENDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUNyQkMsS0FBSyxFQUFFO01BQ1I7SUFDRDtFQUNELENBQUM7QUFBQSJ9