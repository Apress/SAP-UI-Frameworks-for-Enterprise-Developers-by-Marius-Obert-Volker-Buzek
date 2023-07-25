/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Describes the main information of the entity. This annotation is read for the navigation entity of the property, if present.
       * It is displayed in the header of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with HeaderInfo Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *	  &lt;Annotation Term="UI.HeaderInfo"&gt
       *		 &lt;Record Type="UI.HeaderInfoType"&gt
       *			 &lt;PropertyValue Property="Description"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="CustomerName"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="Title"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="Customer"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="TypeName" String="Customer"/&gt
       *			 &lt;PropertyValue Property="TypeNamePlural" String="Customers"/&gt
       *			 &lt;PropertyValue Property="ImageUrl" Path="ImageUrl"/&gt
       *			 &lt;PropertyValue Property="Initials" Path="Initials"/&gt
       *		 &lt;/Record&gt
       *	 &lt;/Annotation&gt
       *	 &lt;/Annotations&gt
       * </pre>
       *
       * <br>
       * <i>HeaderInfo Type properties evaluated by this macro :</i>
       *
       * <ul>
       *   <li>Property <b>Title</b> <br/&gt
       *	   The title to be displayed in the pop up
       *   </li>
       *   <li>Property <b>Description</b><br/>
       *     Will be displayed below the title
       *   </li>
       *   <li>Property <b>ImageUrl</b><br/>
       *     The image in pop up header
       *   </li>
       *   <li>Property <b>Initials</b><br/>
       *     If the image is unavailable, the initials will be displayed
       *   </li>
       * </ul>
       * <br>
       * <i><b><u>Contact Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HeaderInfoType  com.sap.vocabularies.UI.v1.HeaderInfo}
       *   </li>
       * </ul>
       */

      headerInfo: {
        namespace: "com.sap.vocabularies.UI.v1.HeaderInfo",
        annotation: "HeaderInfo",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Describes the facets that may be used for a quick overview of the object
       * It is displayed in the content of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with QuickViewFacets Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="UI.QuickViewFacets"&gt
       *         &lt;Collection&gt
       *             &lt;Record Type="UI.ReferenceFacet"&gt
       *                 &lt;PropertyValue Property="Label" String="Address"/&gt
       *                 &lt;PropertyValue Property="Target" AnnotationPath="@Communication.Contact"/&gt
       *                 &lt;Annotation Term="UI.Hidden" Bool="false"/&gt
       *             &lt;/Record&gt
       *            &lt;Record Type="UI.ReferenceFacet"&gt
       *               &lt;PropertyValue Property="Label" String="Address"/&gt
       *                &lt;PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#SoldToQuickView"/&gt
       *            &lt;/Record&gt
       *         &lt;/Collection&gt
       *     &lt;/Annotation&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>QuickViewFacets Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#QuickViewFacets com.sap.vocabularies.UI.v1.QuickViewFacets}
       *   </li>
       * </ul>
       */
      quickViewFacets: {
        namespace: "com.sap.vocabularies.UI.v1.QuickViewFacets",
        annotation: "QuickViewFacets",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * This tag defines if the entity is represented a natural person and not a product/object entitty
       * It is read to decide the shape of the image in quiview card header - circular if true, otherwise square
       * It is also read to decide the fallback icon of the image : if no image and no initials are available, then a fallback icon will be displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with isNaturalPerson Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="Common.IsNaturalPerson" Bool="true"/&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>IsNaturalPerson Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#IsNaturalPerson com.sap.vocabularies.Common.v1.IsNaturalPerson}
       *   </li>
       * </ul>
       */
      isNaturalPerson: {
        namespace: "com.sap.vocabularies.Common.v1.IsNaturalPerson",
        annotation: "IsNaturalPerson",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines a name of the <code>SemanticObject</code> represented as this entity type or identified by this property and is rendered as a link.
       *
       * <b>Note:</b> Navigation targets are determined using {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} of the unified shell service.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObject annotation</i>
       * <pre>
       *   &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;Product&quot; /&gt;
       *   &lt;/Annotations&gt;
       * </pre>
       */
      semanticObject: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObject",
        target: ["EntitySet", "EntityType", "Property"],
        since: "1.75"
      },
      /**
       * Maps properties of the annotated <code>EntityType</code> or sibling properties of the annotated property to properties of the
       * Semantic Object. This allows "renaming" of properties in the current context to match property names of the Semantic Object, e.g. SenderPartyID to PartyID.
       * Only properties explicitly listed in the mapping are renamed, all other properties are available for intent-based navigation with their "local" name.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObjectMapping on Product/Name</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;SemanticObjectName&quot; /&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectMapping&quot;&gt;
       * 		    &lt;Collection&gt;
       * 			    &lt;Record&gt;
       * 				    &lt;PropertyValue Property=&quot;LocalProperty&quot; PropertyPath=&quot;SupplierId&quot; /&gt;
       * 					&lt;PropertyValue Property=&quot;SemanticObjectProperty&quot; String=&quot;SupplierIdOfSemanticObjectName&quot; /&gt;
       * 				&lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectMapping",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * List of actions that are not available in the current state of the instance of the Semantic Object
       * The actions of this list will not be displayed in the list of links in the quick view cad.
       *
       * <br>
       * <i>XML Example of OData with SemanticObjectUnavailableActions on Product/CustomerId</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/CustomerId&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;CustomerSO&quot; /&gt;
       * 		&lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions&quot;&gt;
       * 			&lt;Collection&gt;
       * 				&lt;String&gt;DeleteCustomer&lt;String/&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectUnavailableActions: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectUnavailableActions",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImhlYWRlckluZm8iLCJuYW1lc3BhY2UiLCJhbm5vdGF0aW9uIiwidGFyZ2V0Iiwic2luY2UiLCJxdWlja1ZpZXdGYWNldHMiLCJpc05hdHVyYWxQZXJzb24iLCJzZW1hbnRpY09iamVjdCIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsImRlZmF1bHRWYWx1ZSIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJRdWlja1ZpZXcuZGVzaWdudGltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG5cdGFubm90YXRpb25zOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVzY3JpYmVzIHRoZSBtYWluIGluZm9ybWF0aW9uIG9mIHRoZSBlbnRpdHkuIFRoaXMgYW5ub3RhdGlvbiBpcyByZWFkIGZvciB0aGUgbmF2aWdhdGlvbiBlbnRpdHkgb2YgdGhlIHByb3BlcnR5LCBpZiBwcmVzZW50LlxuXHRcdCAqIEl0IGlzIGRpc3BsYXllZCBpbiB0aGUgaGVhZGVyIG9mIHRoZSBxdWlja1ZpZXcgY2FyZC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHdpdGggSGVhZGVySW5mbyBEYXRhIGZvciBDdXN0b21lcjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogJmx0O0Fubm90YXRpb25zIFRhcmdldD1cImNvbS5jX3NhbGVzb3JkZXJtYW5hZ2Vfc2QuQ3VzdG9tZXJcIiZndDtcblx0XHQgKlx0ICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiVUkuSGVhZGVySW5mb1wiJmd0XG5cdFx0ICpcdFx0ICZsdDtSZWNvcmQgVHlwZT1cIlVJLkhlYWRlckluZm9UeXBlXCImZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkRlc2NyaXB0aW9uXCImZ3Rcblx0XHQgKlx0XHRcdFx0ICZsdDtSZWNvcmQgVHlwZT1cIlVJLkRhdGFGaWVsZFwiJmd0XG5cdFx0ICpcdFx0XHRcdCBcdCZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVcIiBQYXRoPVwiQ3VzdG9tZXJOYW1lXCIvJmd0XG5cdFx0ICpcdFx0XHRcdCAmbHQ7L1JlY29yZCZndFxuXHRcdCAqXHRcdFx0ICZsdDsvUHJvcGVydHlWYWx1ZSZndFxuXHRcdCAqXHRcdFx0ICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGl0bGVcIiZndFxuXHRcdCAqXHRcdFx0XHQgJmx0O1JlY29yZCBUeXBlPVwiVUkuRGF0YUZpZWxkXCImZ3Rcblx0XHQgKlx0XHRcdFx0IFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJWYWx1ZVwiIFBhdGg9XCJDdXN0b21lclwiLyZndFxuXHRcdCAqXHRcdFx0XHQgJmx0Oy9SZWNvcmQmZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlR5cGVOYW1lXCIgU3RyaW5nPVwiQ3VzdG9tZXJcIi8mZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlR5cGVOYW1lUGx1cmFsXCIgU3RyaW5nPVwiQ3VzdG9tZXJzXCIvJmd0XG5cdFx0ICpcdFx0XHQgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJJbWFnZVVybFwiIFBhdGg9XCJJbWFnZVVybFwiLyZndFxuXHRcdCAqXHRcdFx0ICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSW5pdGlhbHNcIiBQYXRoPVwiSW5pdGlhbHNcIi8mZ3Rcblx0XHQgKlx0XHQgJmx0Oy9SZWNvcmQmZ3Rcblx0XHQgKlx0ICZsdDsvQW5ub3RhdGlvbiZndFxuXHRcdCAqXHQgJmx0Oy9Bbm5vdGF0aW9ucyZndFxuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkhlYWRlckluZm8gVHlwZSBwcm9wZXJ0aWVzIGV2YWx1YXRlZCBieSB0aGlzIG1hY3JvIDo8L2k+XG5cdFx0ICpcblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+UHJvcGVydHkgPGI+VGl0bGU8L2I+IDxici8mZ3Rcblx0XHQgKlx0ICAgVGhlIHRpdGxlIHRvIGJlIGRpc3BsYXllZCBpbiB0aGUgcG9wIHVwXG5cdFx0ICogICA8L2xpPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPkRlc2NyaXB0aW9uPC9iPjxici8+XG5cdFx0ICogICAgIFdpbGwgYmUgZGlzcGxheWVkIGJlbG93IHRoZSB0aXRsZVxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj5JbWFnZVVybDwvYj48YnIvPlxuXHRcdCAqICAgICBUaGUgaW1hZ2UgaW4gcG9wIHVwIGhlYWRlclxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj5Jbml0aWFsczwvYj48YnIvPlxuXHRcdCAqICAgICBJZiB0aGUgaW1hZ2UgaXMgdW5hdmFpbGFibGUsIHRoZSBpbml0aWFscyB3aWxsIGJlIGRpc3BsYXllZFxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Db250YWN0IERvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+TmFtZXNwYWNlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjSGVhZGVySW5mb1R5cGUgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm99XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cblx0XHRoZWFkZXJJbmZvOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGVhZGVySW5mb1wiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJIZWFkZXJJbmZvXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlc2NyaWJlcyB0aGUgZmFjZXRzIHRoYXQgbWF5IGJlIHVzZWQgZm9yIGEgcXVpY2sgb3ZlcnZpZXcgb2YgdGhlIG9iamVjdFxuXHRcdCAqIEl0IGlzIGRpc3BsYXllZCBpbiB0aGUgY29udGVudCBvZiB0aGUgcXVpY2tWaWV3IGNhcmQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB3aXRoIFF1aWNrVmlld0ZhY2V0cyBEYXRhIGZvciBDdXN0b21lcjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogJmx0O0Fubm90YXRpb25zIFRhcmdldD1cImNvbS5jX3NhbGVzb3JkZXJtYW5hZ2Vfc2QuQ3VzdG9tZXJcIiZndDtcblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cIlVJLlF1aWNrVmlld0ZhY2V0c1wiJmd0XG5cdFx0ICogICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndFxuXHRcdCAqICAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT1cIlVJLlJlZmVyZW5jZUZhY2V0XCImZ3Rcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkFkZHJlc3NcIi8mZ3Rcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUYXJnZXRcIiBBbm5vdGF0aW9uUGF0aD1cIkBDb21tdW5pY2F0aW9uLkNvbnRhY3RcIi8mZ3Rcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cIlVJLkhpZGRlblwiIEJvb2w9XCJmYWxzZVwiLyZndFxuXHRcdCAqICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0XG5cdFx0ICogICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJVSS5SZWZlcmVuY2VGYWNldFwiJmd0XG5cdFx0ICogICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiQWRkcmVzc1wiLyZndFxuXHRcdCAqICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0XCIgQW5ub3RhdGlvblBhdGg9XCJAVUkuRmllbGRHcm91cCNTb2xkVG9RdWlja1ZpZXdcIi8mZ3Rcblx0XHQgKiAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0XG5cdFx0ICogICAgICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Rcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0XG5cdFx0ICogJmx0Oy9Bbm5vdGF0aW9ucyZndFxuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGk+PGI+PHU+UXVpY2tWaWV3RmFjZXRzIERvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+TmFtZXNwYWNlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjUXVpY2tWaWV3RmFjZXRzIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrVmlld0ZhY2V0c31cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRxdWlja1ZpZXdGYWNldHM6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5RdWlja1ZpZXdGYWNldHNcIixcblx0XHRcdGFubm90YXRpb246IFwiUXVpY2tWaWV3RmFjZXRzXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoaXMgdGFnIGRlZmluZXMgaWYgdGhlIGVudGl0eSBpcyByZXByZXNlbnRlZCBhIG5hdHVyYWwgcGVyc29uIGFuZCBub3QgYSBwcm9kdWN0L29iamVjdCBlbnRpdHR5XG5cdFx0ICogSXQgaXMgcmVhZCB0byBkZWNpZGUgdGhlIHNoYXBlIG9mIHRoZSBpbWFnZSBpbiBxdWl2aWV3IGNhcmQgaGVhZGVyIC0gY2lyY3VsYXIgaWYgdHJ1ZSwgb3RoZXJ3aXNlIHNxdWFyZVxuXHRcdCAqIEl0IGlzIGFsc28gcmVhZCB0byBkZWNpZGUgdGhlIGZhbGxiYWNrIGljb24gb2YgdGhlIGltYWdlIDogaWYgbm8gaW1hZ2UgYW5kIG5vIGluaXRpYWxzIGFyZSBhdmFpbGFibGUsIHRoZW4gYSBmYWxsYmFjayBpY29uIHdpbGwgYmUgZGlzcGxheWVkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBpc05hdHVyYWxQZXJzb24gRGF0YSBmb3IgQ3VzdG9tZXI8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJjb20uY19zYWxlc29yZGVybWFuYWdlX3NkLkN1c3RvbWVyXCImZ3Q7XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJDb21tb24uSXNOYXR1cmFsUGVyc29uXCIgQm9vbD1cInRydWVcIi8mZ3Rcblx0XHQgKiAmbHQ7L0Fubm90YXRpb25zJmd0XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8aT48Yj48dT5Jc05hdHVyYWxQZXJzb24gRG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5OYW1lc3BhY2Uge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjSXNOYXR1cmFsUGVyc29uIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc05hdHVyYWxQZXJzb259XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0aXNOYXR1cmFsUGVyc29uOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzTmF0dXJhbFBlcnNvblwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJJc05hdHVyYWxQZXJzb25cIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5VHlwZVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyBhIG5hbWUgb2YgdGhlIDxjb2RlPlNlbWFudGljT2JqZWN0PC9jb2RlPiByZXByZXNlbnRlZCBhcyB0aGlzIGVudGl0eSB0eXBlIG9yIGlkZW50aWZpZWQgYnkgdGhpcyBwcm9wZXJ0eSBhbmQgaXMgcmVuZGVyZWQgYXMgYSBsaW5rLlxuXHRcdCAqXG5cdFx0ICogPGI+Tm90ZTo8L2I+IE5hdmlnYXRpb24gdGFyZ2V0cyBhcmUgZGV0ZXJtaW5lZCB1c2luZyB7QGxpbmsgc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbn0gb2YgdGhlIHVuaWZpZWQgc2hlbGwgc2VydmljZS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCB3aXRoIFNlbWFudGljT2JqZWN0IGFubm90YXRpb248L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7UHJvZHVjdENvbGxlY3Rpb24uUHJvZHVjdC9OYW1lJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0JnF1b3Q7IFN0cmluZz0mcXVvdDtQcm9kdWN0JnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqL1xuXHRcdHNlbWFudGljT2JqZWN0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlNlbWFudGljT2JqZWN0XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogTWFwcyBwcm9wZXJ0aWVzIG9mIHRoZSBhbm5vdGF0ZWQgPGNvZGU+RW50aXR5VHlwZTwvY29kZT4gb3Igc2libGluZyBwcm9wZXJ0aWVzIG9mIHRoZSBhbm5vdGF0ZWQgcHJvcGVydHkgdG8gcHJvcGVydGllcyBvZiB0aGVcblx0XHQgKiBTZW1hbnRpYyBPYmplY3QuIFRoaXMgYWxsb3dzIFwicmVuYW1pbmdcIiBvZiBwcm9wZXJ0aWVzIGluIHRoZSBjdXJyZW50IGNvbnRleHQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgb2YgdGhlIFNlbWFudGljIE9iamVjdCwgZS5nLiBTZW5kZXJQYXJ0eUlEIHRvIFBhcnR5SUQuXG5cdFx0ICogT25seSBwcm9wZXJ0aWVzIGV4cGxpY2l0bHkgbGlzdGVkIGluIHRoZSBtYXBwaW5nIGFyZSByZW5hbWVkLCBhbGwgb3RoZXIgcHJvcGVydGllcyBhcmUgYXZhaWxhYmxlIGZvciBpbnRlbnQtYmFzZWQgbmF2aWdhdGlvbiB3aXRoIHRoZWlyIFwibG9jYWxcIiBuYW1lLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggU2VtYW50aWNPYmplY3RNYXBwaW5nIG9uIFByb2R1Y3QvTmFtZTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7UHJvZHVjdENvbGxlY3Rpb24uUHJvZHVjdC9OYW1lJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiBcdCAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdCZxdW90OyBTdHJpbmc9JnF1b3Q7U2VtYW50aWNPYmplY3ROYW1lJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogXHQgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nJnF1b3Q7Jmd0O1xuXHRcdCAqIFx0XHQgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdFx0ICAgICZsdDtSZWNvcmQmZ3Q7XG5cdFx0ICogXHRcdFx0XHQgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7TG9jYWxQcm9wZXJ0eSZxdW90OyBQcm9wZXJ0eVBhdGg9JnF1b3Q7U3VwcGxpZXJJZCZxdW90OyAvJmd0O1xuXHRcdCAqIFx0XHRcdFx0XHQmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtTZW1hbnRpY09iamVjdFByb3BlcnR5JnF1b3Q7IFN0cmluZz0mcXVvdDtTdXBwbGllcklkT2ZTZW1hbnRpY09iamVjdE5hbWUmcXVvdDsgLyZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqIFx0XHRcdCZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0Jmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqL1xuXHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZW1hbnRpY09iamVjdE1hcHBpbmdcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiLCBcIlByb3BlcnR5XCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiBudWxsLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBMaXN0IG9mIGFjdGlvbnMgdGhhdCBhcmUgbm90IGF2YWlsYWJsZSBpbiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW5zdGFuY2Ugb2YgdGhlIFNlbWFudGljIE9iamVjdFxuXHRcdCAqIFRoZSBhY3Rpb25zIG9mIHRoaXMgbGlzdCB3aWxsIG5vdCBiZSBkaXNwbGF5ZWQgaW4gdGhlIGxpc3Qgb2YgbGlua3MgaW4gdGhlIHF1aWNrIHZpZXcgY2FkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIHdpdGggU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgb24gUHJvZHVjdC9DdXN0b21lcklkPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L0N1c3RvbWVySWQmcXVvdDsgeG1sbnM9JnF1b3Q7aHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtJnF1b3Q7Jmd0O1xuXHRcdCAqIFx0ICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0JnF1b3Q7IFN0cmluZz0mcXVvdDtDdXN0b21lclNPJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogXHRcdCZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zJnF1b3Q7Jmd0O1xuXHRcdCAqIFx0XHRcdCZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0O1N0cmluZyZndDtEZWxldGVDdXN0b21lciZsdDtTdHJpbmcvJmd0O1xuXHRcdCAqIFx0XHRcdCZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0Jmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqL1xuXHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH1cblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztTQUFlO0lBQ2RBLFdBQVcsRUFBRTtNQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7TUFFRUMsVUFBVSxFQUFFO1FBQ1hDLFNBQVMsRUFBRSx1Q0FBdUM7UUFDbERDLFVBQVUsRUFBRSxZQUFZO1FBQ3hCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFQyxlQUFlLEVBQUU7UUFDaEJKLFNBQVMsRUFBRSw0Q0FBNEM7UUFDdkRDLFVBQVUsRUFBRSxpQkFBaUI7UUFDN0JDLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQztRQUN0QkMsS0FBSyxFQUFFO01BQ1IsQ0FBQztNQUNEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUUsZUFBZSxFQUFFO1FBQ2hCTCxTQUFTLEVBQUUsZ0RBQWdEO1FBQzNEQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFRyxjQUFjLEVBQUU7UUFDZk4sU0FBUyxFQUFFLGdDQUFnQztRQUMzQ0MsVUFBVSxFQUFFLGdCQUFnQjtRQUM1QkMsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUM7UUFDL0NDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFSSxxQkFBcUIsRUFBRTtRQUN0QlAsU0FBUyxFQUFFLGdDQUFnQztRQUMzQ0MsVUFBVSxFQUFFLHVCQUF1QjtRQUNuQ0MsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUM7UUFDL0NNLFlBQVksRUFBRSxJQUFJO1FBQ2xCTCxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VNLGdDQUFnQyxFQUFFO1FBQ2pDVCxTQUFTLEVBQUUsZ0NBQWdDO1FBQzNDQyxVQUFVLEVBQUUsa0NBQWtDO1FBQzlDQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQztRQUMvQ00sWUFBWSxFQUFFLElBQUk7UUFDbEJMLEtBQUssRUFBRTtNQUNSO0lBQ0Q7RUFDRCxDQUFDO0FBQUEifQ==