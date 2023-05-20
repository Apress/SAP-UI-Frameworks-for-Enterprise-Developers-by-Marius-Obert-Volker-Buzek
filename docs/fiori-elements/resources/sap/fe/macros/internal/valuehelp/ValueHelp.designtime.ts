export default {
	annotations: {
		/**
		 * Specifies how to get a list of acceptable values for a property or parameter.
		 * The value list can be based on user input that is passed in the value list request.
		 * The value list can be used for type-ahead and classical pick lists.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target="sample.SalesOrderItem.Material"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueList"&gt;
		 *             &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListType"&gt;
		 *                 &lt;PropertyValue Property="CollectionPath" String="MaterialBySlsOrgDistrChnl" /&gt;
		 *                 &lt;PropertyValue Property="Parameters"&gt;
		 *                     &lt;Collection&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Material" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="Material" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterIn"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="DistributionChannel" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="DistributionChannel" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterIn"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="SalesOrganization" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="SalesOrganization" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterOut"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="RequestedQuantityUnit" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="RequestedQuantityUnit" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="MaterialName" /&gt;
		 *                         &lt;/Record&gt;
		 *                     &lt;/Collection&gt;
		 *                 &lt;/PropertyValue&gt;
		 *             &lt;/Record&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueList com.sap.vocabularies.Common.v1.ValueList}</b>
		 *   </li>
		 * </ul>
		 */
		valueList: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueList",
			target: ["Property", "Parameter"],
			since: "1.75"
		},
		/**
		 * Specifies the mapping between data service properties and value list properties.
		 * The value list can be filtered based on user input. It can be used for type-ahead and classical pick lists.
		 * There may be many alternative mappings with different qualifiers.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target="sample.I_AIVS_RegionType/Country"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListMapping"&gt;
		 *             &lt;Record&gt;
		 *                 &lt;PropertyValue Property="CollectionPath" String="I_AIVS_CountryCode" /&gt;
		 *                 &lt;PropertyValue Property="Parameters"&gt;
		 *                     &lt;Collection&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="Country" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="CountryCode" /&gt;
		 *                         &lt;/Record&gt;
		 *                     &lt;/Collection&gt;
		 *                 &lt;/PropertyValue&gt;
		 *             &lt;/Record&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListMapping com.sap.vocabularies.Common.v1.ValueListMapping}</b>
		 *   </li>
		 * </ul>
		 */
		valueListMapping: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListMapping",
			target: ["Property", "Parameter"],
			since: "1.75"
		},
		/**
		 * A list of URLs of CSDL documents containing value list mappings for this parameter or property.
		 * Using this annotation, the OData service only contains an annotation with the property as target
		 * and the term com.sap.vocabularies.Common.v1.ValueListReferences pointing to the metadata of the value list service.
		 * The ValueList annotation itself is in the referenced service.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target="sample.TitlesType/OriginalArtist"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListReferences"&gt;
		 *             &lt;Collection&gt;
		 *                 &lt;String&gt;../i_v4_artistname/$metadata&lt;/String&gt;
		 *             &lt;/Collection&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListReferences com.sap.vocabularies.Common.v1.ValueListReferences}</b>
		 *   </li>
		 * </ul>
		 */
		valueListReferences: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListReferences",
			target: ["Property", "Parameter"],
			since: "1.75"
		},
		/**
		 * Value list property that is not used to fill the edited entity.
		 *
		 * <br>
		 * <i>Example in OData V4 notation: See example for annotation ValueList</i>
		 * <br>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterDisplayOnly com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly}</b>
		 *   </li>
		 * </ul>
		 */
		valueListParameterDisplayOnly: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListParameterDisplayOnly",
			target: ["PropertyPath"],
			since: "1.75"
		},
		/**
		 * Value list property that is used to filter the value list with 'eq comparison'.
		 *
		 * <br>
		 * <i>Example in OData V4 notation: See example for annotation ValueList</i>
		 * <br>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterIn com.sap.vocabularies.Common.v1.ValueListParameterIn}</b>
		 *   </li>
		 * </ul>
		 */
		valueListParameterIn: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListParameterIn",
			target: ["PropertyPath"],
			since: "1.75"
		},
		/**
		 * Value list property that is used to filter the value list with 'startswith comparison' and filled from the picked value list item.
		 *
		 * <br>
		 * <i>Example in OData V4 notation: See example for annotation ValueList</i>
		 * <br>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterInOut com.sap.vocabularies.Common.v1.ValueListParameterInOut}</b>
		 *   </li>
		 * </ul>
		 */
		valueListParameterInOut: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListParameterInOut",
			target: ["PropertyPath"],
			since: "1.75"
		},
		/**
		 * Value list property that is filled from the response.
		 *
		 * <br>
		 * <i>Example in OData V4 notation: See example for annotation ValueList</i>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListParameterOut com.sap.vocabularies.Common.v1.ValueListParameterOut}</b>
		 *   </li>
		 * </ul>
		 */
		valueListParameterOut: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListParameterOut",
			target: ["PropertyPath"],
			since: "1.75"
		},
		/**
		 * If specified as true, there is only one value list mapping and its value list consists of a small number of fixed values.
		 * The value list is shown as a dropdown list box rather than an input field. No value help popup is used.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target="sample.Products/priceRange_code"&gt;
		 *         &lt;Annotation Term="Common.ValueList"&gt;
		 *             &lt;Record Type="Common.ValueListType"&gt;
		 *                 &lt;PropertyValue Property="CollectionPath" String="PriceRange" /&gt;
		 *                 &lt;PropertyValue Property="Parameters"&gt;
		 *                     &lt;Collection&gt;
		 *                         &lt;Record Type="Common.ValueListParameterInOut"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="priceRange_code" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="code" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="Common.ValueListParameterDisplayOnly"&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="name" /&gt;
		 *                         &lt;/Record&gt;
		 *                     &lt;/Collection&gt;
		 *                 &lt;/PropertyValue&gt;
		 *             &lt;/Record&gt;
		 *         &lt;/Annotation&gt;
		 *         &lt;Annotation Term="Common.ValueListWithFixedValues" Bool="true" /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Type <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListWithFixedValues com.sap.vocabularies.Common.v1.ValueListWithFixedValues}</b>
		 *   </li>
		 * </ul>
		 */
		valueListWithFixedValues: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListWithFixedValues",
			target: ["Property", "Parameter"],
			since: "1.75"
		},
		/**
		 * Expresses the importance of a DataField or an annotation, for example.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target="sample.Person"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.UI.v1.LineItem"&gt;
		 *             &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
		 *                 &lt;PropertyValue Property="Label" String="First name" /&gt;
		 *                 &lt;PropertyValue Property="Value" String="FirstName" /&gt;
		 *                 &lt;Annotation Term="com.sap.vocabularies.UI.v1.Importance" EnumMember="com.sap.vocabularies.UI.v1.ImportanceType/High" /&gt;
		 *             &lt;/Record&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Importance com.sap.vocabularies.UI.v1.Importance}</b>
		 *   </li>
		 * </ul>
		 */
		importance: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "Importance",
			target: ["Annotation", "Record"],
			since: "1.75"
		},
		/**
		 * Defines that the search field in the filter bar is enabled.
		 *
		 * <br>
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.FilterBar#annotations/SearchRestrictions}</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target="service.SalesOrderManage"&gt;
		 *         &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
		 *             &lt;Record&gt;
		 *                 &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
		 *             &lt;/Record&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions Org.OData.Capabilities.V1.SearchRestrictions}</b>
		 *   </li>
		 * </ul>
		 */
		searchRestrictions: {
			namespace: "Org.OData.Capabilities.V1",
			annotation: "SearchRestrictions",
			target: ["EntitySet"],
			since: "1.75"
		},
		/**
		 * Defines that a property is not displayed.
		 *
		 * <br>
		 * <i>Example in OData V4 notation with hidden ProductUUID taken from {@link sap.fe.macros.internal.Field#annotations/Hidden}</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID&quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden com.sap.vocabularies.UI.v1.Hidden}</b>
		 *   </li>
		 * </ul>
		 */
		hidden: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "Hidden",
			target: ["Property", "Record"],
			since: "1.75"
		},
		/**
		 * Defines that a property is not displayed as a filter.
		 *
		 * <br>
		 * <i>Example in OData V4 notation with invisible, filterable property "LocationName", taken from {@link sap.fe.macros.internal.FilterField#annotations/HiddenFilter}</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;LocationName&quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.HiddenFilter&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HiddenFilter com.sap.vocabularies.UI.v1.HiddenFilter}</b>
		 *   </li>
		 * </ul>
		 */
		hiddenFilter: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "HiddenFilter",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * A short, human-readable text suitable for labels and captions on UIs.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Label&quot; String=&quot;Customer&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Label com.sap.vocabularies.Common.v1.Label}</b>
		 *   </li>
		 * </ul>
		 */
		label: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "Label",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * A descriptive text for values of the annotated property. Value MUST be a dynamic expression when used as metadata annotation.
		 * Only the text annotation of the key for the ValueHelp can specify the description.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;CustomerName&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Text com.sap.vocabularies.Common.v1.Text}</b>
		 *   </li>
		 * </ul>
		 */
		text: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "Text",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * The currency for this monetary amount as an ISO 4217 currency code.
		 *
		 * <br>
		 * <i>Example in OData V4 notation talen from {@link sap.fe.macros.internal.Field#annotations/ISOCurrency}</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.SalesOrderItem/NetAmount&quot;&gt;
		 *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.ISOCurrency&quot; Path=&quot;TransactionCurrency&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#ISOCurrency Org.OData.Measures.V1.ISOCurrency}</b>
		 *   </li>
		 * </ul>
		 */
		iSOCurrency: {
			namespace: "Org.OData.Measures.V1",
			annotation: "ISOCurrency",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * The unit of measure for this measured quantity, e.g. cm for centimeters or % for percentages.
		 *
		 * <br>
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.internal.Field#annotations/Unit}</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.SalesOrderItem/RequestedQuantity&quot;&gt;
		 *         &lt;Annotation Term=&quot;Org.OData.Measures.V1.Unit&quot; Path=&quot;RequestedQuantityUnit&quot; /&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#Unit Org.OData.Measures.V1.Unit}</b>
		 *   </li>
		 * </ul>
		 */
		unit: {
			namespace: "Org.OData.Measures.V1",
			annotation: "Unit",
			target: ["Property"],
			since: "1.75"
		}
	}
};
