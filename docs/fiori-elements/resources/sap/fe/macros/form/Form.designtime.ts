export default {
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
