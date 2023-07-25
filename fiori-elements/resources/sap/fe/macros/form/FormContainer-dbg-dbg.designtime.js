/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines that the FormContainer is not displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden ProductUUID</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID&quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot;/&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b><br/>
       *   </li>
       * </ul>
       */
      hidden: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Hidden",
        target: ["Property", "Record"],
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImhpZGRlbiIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUNvbnRhaW5lci5kZXNpZ250aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcblx0YW5ub3RhdGlvbnM6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoYXQgdGhlIEZvcm1Db250YWluZXIgaXMgbm90IGRpc3BsYXllZC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHdpdGggaGlkZGVuIFByb2R1Y3RVVUlEPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L1Byb2R1Y3RVVUlEJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4mcXVvdDsvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNIaWRkZW4gY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVufTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGhpZGRlbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkhpZGRlblwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlJlY29yZFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH1cblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztTQUFlO0lBQ2RBLFdBQVcsRUFBRTtNQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFQyxNQUFNLEVBQUU7UUFDUEMsU0FBUyxFQUFFLDRCQUE0QjtRQUN2Q0MsVUFBVSxFQUFFLFFBQVE7UUFDcEJDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDOUJDLEtBQUssRUFBRTtNQUNSO0lBQ0Q7RUFDRCxDQUFDO0FBQUEifQ==