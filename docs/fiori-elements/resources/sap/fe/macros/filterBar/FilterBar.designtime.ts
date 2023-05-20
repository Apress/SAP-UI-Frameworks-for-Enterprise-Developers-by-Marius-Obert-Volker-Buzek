export default {
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
