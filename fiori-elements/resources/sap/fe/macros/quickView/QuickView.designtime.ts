export default {
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
