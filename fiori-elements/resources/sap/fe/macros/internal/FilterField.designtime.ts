export default {
	annotations: {
		/**
		 * Annotation to set restrictions on filter expressions.
		 * The filter field will not be created, if it is mentioned in a collection of NonFilterableProperties of the entitySet.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.BusinessPartnerType&quot;&gt;
		 *         &lt;Annotation Term=&quot;Org.OData.Capabilities.V1.FilterRestrictions&quot;&gt;
		 *             &lt;Record&gt;
		 *                 &lt;PropertyValue Property=&quot;NonFilterableProperties&quot;&gt;
		 *                     &lt;Collection&gt;
		 *                         &lt;PropertyPath&gt;Region&lt;/PropertyPath&gt;
		 *                         &lt;PropertyPath&gt;Info&lt;/PropertyPath&gt;
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
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#FilterRestrictions Org.OData.Capabilities.V1.FilterRestrictions}</b>
		 *   </li>
		 * </ul>
		 */
		filterRestrictions: {
			namespace: "Org.OData.Capabilities.V1",
			annotation: "FilterRestrictions",
			target: ["EntitySet"],
			since: "1.75"
		},

		/**
		 * Defines that a property is not displayed. As a consequence the filter field will not be created by the macro.
		 * In contrast to <code>HiddenFilter</code>, a property annotated with <code>Hidden</code> is not used as a filter.
		 *
		 * <br>
		 * <i>Example in OData V4 notation with hidden ProductUUID taken form {@link sap.fe.macros.internal.Field#annotations/Hidden}</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.Product/ProductUUID&quot;&gt;
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
		 * Defines that a property is not displayed as a filter. As a consequence the filter field will not be created by the macro.
		 *
		 * <br>
		 * <i>Example in OData V4 notation with invisible, filterable property "LocationName"</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.Address/LocationName&quot;&gt;
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
		 * The label for the filter field.
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
		 * Describes the arrangement of a code or ID value and its text.
		 * If used for a single property the Common.Text annotation is annotated.
		 *
		 * <br>
		 * <i>Example in OData V4 notation</i>
		 * <pre>
		 *     &lt;Annotations Target=&quot;service.Customer/Customer&quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;CustomerName&quot;&gt;
		 *             &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.TextArrangement&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst&quot; /&gt;
		 *         &lt;Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#TextArrangement com.sap.vocabularies.UI.v1.TextArrangement}</b>
		 *   </li>
		 * </ul>
		 */
		textArrangement: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "TextArrangement",
			target: ["Annotation", "EntityType"],
			since: "1.75"
		},
		/**
		 * The currency for this monetary amount as an ISO 4217 currency code.
		 *
		 * <br>
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.internal.Field#annotations/ISOCurrency}</i>
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
		 * The unit of measure for this measured quantity, e.g. cm for centimeters or % for percentages
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
		},
		/**
		 * Specifies how to get a list of acceptable values for a property or parameter.
		 * The value list can be based on user input that is passed in the value list request.
		 * The value list can be used for type-ahead and classical pick lists.
		 *
		 * <br>
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueList}</i>
		 * <pre>
		 *     &lt;Annotations Target="service.HeaderShipToParty/BusinessPartner"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueList"&gt;
		 *             &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListType"&gt;
		 *                 &lt;PropertyValue Property="CollectionPath" String="Customer" /&gt;
		 *                 &lt;PropertyValue Property="Parameters"&gt;
		 *                     &lt;Collection&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterInOut"&gt;
		 *                             &lt;PropertyValue Property="LocalDataProperty" PropertyPath="BusinessPartner" /&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="Customer" /&gt;
		 *                         &lt;/Record&gt;
		 *                         &lt;Record Type="com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"&gt;
		 *                             &lt;PropertyValue Property="ValueListProperty" String="CustomerName" /&gt;
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
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueListMapping}</i>
		 * <pre>
		 *     &lt;Annotations Target="service.I_AIVS_RegionType/Country"&gt;
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
		 * <i>Example in OData V4 notation taken from {@link sap.fe.macros.ValueHelp#annotations/ValueListReferences}</i>
		 * <pre>
		 *     &lt;Annotations Target="service.TitlesType/OriginalArtist"&gt;
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
		}
	}
};
