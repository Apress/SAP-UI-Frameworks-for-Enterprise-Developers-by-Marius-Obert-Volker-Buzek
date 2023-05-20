/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a CollectionFacet that is a container for other CollectionFacests or a set of ReferenceFacets
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 	    &lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 		  &lt;PropertyValue Property="Label" String="Header"/&gt;
       * 		  &lt;PropertyValue Property="ID" String="HeaderInfo"/&gt;
       * 		  &lt;PropertyValue Property="Facets"&gt;
       * 		    &lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 			    &lt;PropertyValue Property="ID" String="GeneralInfo"/&gt;
       * 			    &lt;PropertyValue Property="Label" String="General Information"/&gt;
       * 			    &lt;PropertyValue Property="Facets"&gt;
       * 				  &lt;Collection&gt;
       * 				    &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 					  &lt;PropertyValue Property="Label" String="Adress"/&gt;
       * 					  &lt;PropertyValue Property="ID" String="Adress"/&gt;
       * 					  &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 				    &lt;/Record&gt;
       * 				    &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 					  &lt;PropertyValue Property="Label" String="Contact"/&gt;
       * 					  &lt;PropertyValue Property="ID" String="Partner"/&gt;
       * 					  &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#Contact"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 					  &lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 				    &lt;/Record&gt;
       * 				  &lt;/Collection&gt;
       * 			    &lt;/PropertyValue&gt;
       * 			    &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 			  &lt;/Record&gt;
       * 		    &lt;/Collection&gt;
       * 		  &lt;/PropertyValue&gt;
       * 	    &lt;/Record&gt;
       * 	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#collectionfacet-facet com.sap.vocabularies.UI.v1.CollectionFacet}</b><br/>
       *   </li>
       * </ul>
       */
      CollectionFacet: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "CollectionFacet",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * Defines a ReferenceFacet
       *
       * <br>
       * <i> Example in OData V4 notation with ReferenceFacets within a QuickViewFacet</i>
       *
       * <pre>
       * &ltAnnotation Term="com.sap.vocabularies.UI.v1.QuickViewFacets"&gt
       *   &ltCollection&gt
       *     &ltRecord Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt
       *       &ltPropertyValue Property="Label" String="Address"/&gt
       *       &ltPropertyValue Property="Target" AnnotationPath="@Communication.Contact"/&gt
       *       &ltAnnotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt
       *     &lt/Record&gt
       *     &ltRecord Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt
       *       &ltPropertyValue Property="Label" String="Address"/&gt
       *       &ltPropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt
       *     /Record&gt&lt
       *   &lt/Collection&gt
       * &lt/Annotation&gt
       * </pre>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#referencefacet-facet com.sap.vocabularies.UI.v1.ReferenceFacet}</b><br/>
       *   </li>
       * </ul>
       */
      ReferenceFacet: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "ReferenceFacet",
        target: ["Property"],
        since: "1.75"
      },
      /**
       * partOfPreview is currently under contruction, so we leave it out in metadata and designtime files for now
       *
       * Defines, if a Facet and all included Facets are part of the header preview
       *
       * <br>
       * <i>Example in OData V4 notation</i>
       *
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 		&lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 			&lt;PropertyValue Property="ID" String="GeneralInfo"/&gt;
       * 			&lt;PropertyValue Property="Label" String="General Information"/&gt;
       * 			&lt;PropertyValue Property="Facets"/&gt;
       * 			&lt;Annotation Term="com.sap.vocabularies.UI.v1.PartOfPreview" Bool="false"/&gt;
       * 			&lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="Adress"/&gt;
       * 				&lt;PropertyValue Property="ID" String="Adress"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 			  &lt;/Record&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="Contact"/&gt;
       * 				&lt;PropertyValue Property="ID" String="Partner"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#Contact"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/&gt;
       * 			  &lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Record&gt;
       *	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
       * </pre>
       */
      // partOfPreview: {
      // 	namespace: "com.sap.vocabularies.UI.v1",
      // 	annotation: "PartOfPreview",
      // 	target: ["Property"],
      // 	since: "1.75"
      // },

      /**
       * Defines that a facet is not displayed. As a consequence the facet will not be created by the macro.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden Reference Facet. Using alias "UI" for namespace "com.sap.vocabularies.UI.v1"</i>
       *
       * <pre>
       * 	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets"&gt;
       * 	  &lt;Collection&gt;
       * 		&lt;Record Type="com.sap.vocabularies.UI.v1.CollectionFacet"&gt;
       * 		...
       * 			&lt;Collection&gt;
       * 			  &lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet"&gt;
       * 				&lt;PropertyValue Property="Label" String="anyLabel"/&gt;
       * 				&lt;PropertyValue Property="ID" String="anyID"/&gt;
       * 				&lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.FieldGroup#SoldToQuickView"/&gt;
       * 				&lt;Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="true"/&gt;
       * 			  &lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Record&gt;
       *	  &lt;/Collection&gt;
       *  &lt;/Annotation&gt;
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
        target: ["Property"],
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsIkNvbGxlY3Rpb25GYWNldCIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsIlJlZmVyZW5jZUZhY2V0IiwiaGlkZGVuIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtLmRlc2lnbnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRhbm5vdGF0aW9uczoge1xuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgYSBDb2xsZWN0aW9uRmFjZXQgdGhhdCBpcyBhIGNvbnRhaW5lciBmb3Igb3RoZXIgQ29sbGVjdGlvbkZhY2VzdHMgb3IgYSBzZXQgb2YgUmVmZXJlbmNlRmFjZXRzXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqIFx0Jmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0c1wiJmd0O1xuXHRcdCAqIFx0ICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdCAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db2xsZWN0aW9uRmFjZXRcIiZndDtcblx0XHQgKiBcdFx0ICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiSGVhZGVyXCIvJmd0O1xuXHRcdCAqIFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSURcIiBTdHJpbmc9XCJIZWFkZXJJbmZvXCIvJmd0O1xuXHRcdCAqIFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiRmFjZXRzXCImZ3Q7XG5cdFx0ICogXHRcdCAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0XHQgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbGxlY3Rpb25GYWNldFwiJmd0O1xuXHRcdCAqIFx0XHRcdCAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIklEXCIgU3RyaW5nPVwiR2VuZXJhbEluZm9cIi8mZ3Q7XG5cdFx0ICogXHRcdFx0ICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJHZW5lcmFsIEluZm9ybWF0aW9uXCIvJmd0O1xuXHRcdCAqIFx0XHRcdCAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkZhY2V0c1wiJmd0O1xuXHRcdCAqIFx0XHRcdFx0ICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0XHRcdCAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJBZHJlc3NcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0XHRcdCAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJJRFwiIFN0cmluZz1cIkFkcmVzc1wiLyZndDtcblx0XHQgKiBcdFx0XHRcdFx0ICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlRhcmdldFwiIEFubm90YXRpb25QYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXAjU29sZFRvUXVpY2tWaWV3XCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCIgRW51bU1lbWJlcj1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0XHRcdCAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiIEJvb2w9XCJmYWxzZVwiLyZndDtcblx0XHQgKiBcdFx0XHRcdCAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiBcdFx0XHRcdCAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJDb250YWN0XCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSURcIiBTdHJpbmc9XCJQYXJ0bmVyXCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0XCIgQW5ub3RhdGlvblBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cCNDb250YWN0XCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCIgRW51bU1lbWJlcj1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0XHRcdCAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiIEJvb2w9XCJmYWxzZVwiLyZndDtcblx0XHQgKiBcdFx0XHRcdCAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiBcdFx0XHRcdCAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHRcdCAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogXHRcdFx0ICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCIgRW51bU1lbWJlcj1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0ICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiBcdFx0ICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0ICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogXHQgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogXHQgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNjb2xsZWN0aW9uZmFjZXQtZmFjZXQgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29sbGVjdGlvbkZhY2V0fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdENvbGxlY3Rpb25GYWNldDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkNvbGxlY3Rpb25GYWNldFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIGEgUmVmZXJlbmNlRmFjZXRcblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT4gRXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB3aXRoIFJlZmVyZW5jZUZhY2V0cyB3aXRoaW4gYSBRdWlja1ZpZXdGYWNldDwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogJmx0QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUXVpY2tWaWV3RmFjZXRzXCImZ3Rcblx0XHQgKiAgICZsdENvbGxlY3Rpb24mZ3Rcblx0XHQgKiAgICAgJmx0UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiJmd0XG5cdFx0ICogICAgICAgJmx0UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiQWRkcmVzc1wiLyZndFxuXHRcdCAqICAgICAgICZsdFByb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUYXJnZXRcIiBBbm5vdGF0aW9uUGF0aD1cIkBDb21tdW5pY2F0aW9uLkNvbnRhY3RcIi8mZ3Rcblx0XHQgKiAgICAgICAmbHRBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIiBCb29sPVwiZmFsc2VcIi8mZ3Rcblx0XHQgKiAgICAgJmx0L1JlY29yZCZndFxuXHRcdCAqICAgICAmbHRSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCImZ3Rcblx0XHQgKiAgICAgICAmbHRQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJBZGRyZXNzXCIvJmd0XG5cdFx0ICogICAgICAgJmx0UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlRhcmdldFwiIEFubm90YXRpb25QYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXAjU29sZFRvUXVpY2tWaWV3XCIvJmd0XG5cdFx0ICogICAgIC9SZWNvcmQmZ3QmbHRcblx0XHQgKiAgICZsdC9Db2xsZWN0aW9uJmd0XG5cdFx0ICogJmx0L0Fubm90YXRpb24mZ3Rcblx0XHQgKiA8L3ByZT5cblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjcmVmZXJlbmNlZmFjZXQtZmFjZXQgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXR9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0UmVmZXJlbmNlRmFjZXQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJSZWZlcmVuY2VGYWNldFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBwYXJ0T2ZQcmV2aWV3IGlzIGN1cnJlbnRseSB1bmRlciBjb250cnVjdGlvbiwgc28gd2UgbGVhdmUgaXQgb3V0IGluIG1ldGFkYXRhIGFuZCBkZXNpZ250aW1lIGZpbGVzIGZvciBub3dcblx0XHQgKlxuXHRcdCAqIERlZmluZXMsIGlmIGEgRmFjZXQgYW5kIGFsbCBpbmNsdWRlZCBGYWNldHMgYXJlIHBhcnQgb2YgdGhlIGhlYWRlciBwcmV2aWV3XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogXHQmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRzXCImZ3Q7XG5cdFx0ICogXHQgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHQmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db2xsZWN0aW9uRmFjZXRcIiZndDtcblx0XHQgKiBcdFx0XHQmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIklEXCIgU3RyaW5nPVwiR2VuZXJhbEluZm9cIi8mZ3Q7XG5cdFx0ICogXHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkdlbmVyYWwgSW5mb3JtYXRpb25cIi8mZ3Q7XG5cdFx0ICogXHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJGYWNldHNcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0Jmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlBhcnRPZlByZXZpZXdcIiBCb29sPVwiZmFsc2VcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0Jmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdFx0ICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkFkcmVzc1wiLyZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSURcIiBTdHJpbmc9XCJBZHJlc3NcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0XHQmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlRhcmdldFwiIEFubm90YXRpb25QYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXAjU29sZFRvUXVpY2tWaWV3XCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VcIiBFbnVtTWVtYmVyPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVR5cGUvSGlnaFwiLyZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIiBCb29sPVwiZmFsc2VcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0ICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiBcdFx0XHQgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCImZ3Q7XG5cdFx0ICogXHRcdFx0XHQmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiQ29udGFjdFwiLyZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSURcIiBTdHJpbmc9XCJQYXJ0bmVyXCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUYXJnZXRcIiBBbm5vdGF0aW9uUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwI0NvbnRhY3RcIi8mZ3Q7XG5cdFx0ICogXHRcdFx0XHQmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVwiIEVudW1NZW1iZXI9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlVHlwZS9IaWdoXCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiIEJvb2w9XCJmYWxzZVwiLyZndDtcblx0XHQgKiBcdFx0XHQgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqIFx0XHRcdCZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0Jmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICpcdCAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICovXG5cdFx0Ly8gcGFydE9mUHJldmlldzoge1xuXHRcdC8vIFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0Ly8gXHRhbm5vdGF0aW9uOiBcIlBhcnRPZlByZXZpZXdcIixcblx0XHQvLyBcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0Ly8gXHRzaW5jZTogXCIxLjc1XCJcblx0XHQvLyB9LFxuXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB0aGF0IGEgZmFjZXQgaXMgbm90IGRpc3BsYXllZC4gQXMgYSBjb25zZXF1ZW5jZSB0aGUgZmFjZXQgd2lsbCBub3QgYmUgY3JlYXRlZCBieSB0aGUgbWFjcm8uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB3aXRoIGhpZGRlbiBSZWZlcmVuY2UgRmFjZXQuIFVzaW5nIGFsaWFzIFwiVUlcIiBmb3IgbmFtZXNwYWNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogXHQmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRzXCImZ3Q7XG5cdFx0ICogXHQgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHQmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db2xsZWN0aW9uRmFjZXRcIiZndDtcblx0XHQgKiBcdFx0Li4uXG5cdFx0ICogXHRcdFx0Jmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdFx0ICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cImFueUxhYmVsXCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJJRFwiIFN0cmluZz1cImFueUlEXCIvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUYXJnZXRcIiBBbm5vdGF0aW9uUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwI1NvbGRUb1F1aWNrVmlld1wiLyZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIiBCb29sPVwidHJ1ZVwiLyZndDtcblx0XHQgKiBcdFx0XHQgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqIFx0XHRcdCZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0Jmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICpcdCAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hpZGRlbiBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW59PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0aGlkZGVuOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiSGlkZGVuXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fVxuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O1NBQWU7SUFDZEEsV0FBVyxFQUFFO01BQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsZUFBZSxFQUFFO1FBQ2hCQyxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDcEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFQyxjQUFjLEVBQUU7UUFDZkosU0FBUyxFQUFFLDRCQUE0QjtRQUN2Q0MsVUFBVSxFQUFFLGdCQUFnQjtRQUM1QkMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQ3BCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VFLE1BQU0sRUFBRTtRQUNQTCxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsUUFBUTtRQUNwQkMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQ3BCQyxLQUFLLEVBQUU7TUFDUjtJQUNEO0VBQ0QsQ0FBQztBQUFBIn0=