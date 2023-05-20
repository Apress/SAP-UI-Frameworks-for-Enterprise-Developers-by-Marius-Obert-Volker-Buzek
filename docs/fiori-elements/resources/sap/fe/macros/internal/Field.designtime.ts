export default {
	annotations: {
		/**
		 * Defines that a property is not displayed.
		 *
		 * <br>
		 * <i>Example in OData V4 notation with hidden ProductUUID</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID &quot;&gt;
		 *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot;/&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden  com.sap.vocabularies.UI.v1.Hidden}</b><br/>
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
		 * This annotation specifies that a property is rendered as a regular data field.
		 *
		 * <br>
		 * <i>XML Example for OData V4 DataField type</i>
		 *
		 * <pre>
		 *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
		 *      &lt;PropertyValue Property="Value" String="Name"/&gt;
		 *    &lt;/Record&gt;
		 * </pre>
		 *
		 *  Supported properties are: <code>Criticality, CriticalityRepresentation, Label</code> and <code>Value</code>.
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataField  com.sap.vocabularies.UI.v1.DataField}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataField: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataField",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * This annotation specifies that a property is rendered as a link, if a URL parameter path is present.
		 *
		 * <br>
		 * <i>XML Example for OData V4 DataFieldWithUrl annotation</i>
		 * <pre>
		 *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl"&gt;
		 *      &lt;PropertyValue Property="Label" String="Link to"/&gt;
		 *      &lt;PropertyValue Property="Value" String="Google Maps"/&gt;
		 *      &lt;PropertyValue Property="Url" String="https://www.google.de/maps"/&gt;
		 *    &lt;/Record&gt;
		 * </pre>
		 *
		 *  Supported properties are: <code>Url, Label</code> and <code>Value</code>.
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldWithUrl  com.sap.vocabularies.UI.v1.DataFieldWithUrl}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataFieldWithUrl: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataFieldWithUrl",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * This annotation specifies that a property is rendered as a data field for annotation, e.g. DataPoint or Contact.
		 *
		 * <br>
		 * <i>XML Example for OData V4 DataFieldForAnnotation annotation</i>
		 * <pre>
		 *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&gt;
		 *      &lt;PropertyValue Property="Label" String="SoldToParty"/&gt;
		 *      &lt;PropertyValue Property="Target" AnnotationPath="_SoldToParty/@Communication.Contact"/&gt;
		 *    &lt;/Record&gt;
		 * </pre>
		 *
		 *  Supported properties are: <code>Target, Label</code>.
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldForAnnotation  com.sap.vocabularies.UI.v1.DataFieldForAnnotation}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataFieldForAnnotation: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataFieldForAnnotation",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * This annotation specifies that a property is rendered as a button.
		 * An action can be classified as bound or unbound. A bound action needs a context to be invoked, only then the button will be enabled.
		 * The context is usually set by the user, e.g. by selecting an item in a table.
		 * A button for an unbound action will always be enabled.
		 * An action can have associated parameters which have to be defined in the backend.
		 *
		 * <br>
		 * <i>XML Example for OData V4 DataFieldForAction annotation</i>
		 * <pre>
		 *    &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAction"&gt;
		 *      &lt;PropertyValue Property="Label" String="Bound Action with params"/&gt;
		 *      &lt;PropertyValue Property="Action" String="com.c_salesordermanage_sd.ChangeOrderType"/&gt;
		 *    &lt;/Record&gt;
		 * </pre>
		 *
		 *  Supported properties are: <code>Label, Action, Determining, Inline</code> and <code>InvocationGrouping</code>.
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldForAction  com.sap.vocabularies.UI.v1.DataFieldForAction}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataFieldForAction: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataFieldForAction",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * This annotation can be used along with the <code>DataFieldForAnnotation</code> annotation in order to specify that a property
		 * is rendered as a DataPoint, e. g. Rating, Progress.
		 * Via the Visualization property the VisualizationType can be defined - supported values for EnumMember are <code>Rating</code> and <code>Progress</code>.
		 *
		 * <br>
		 * <i>XML Example for OData V4 DataPoint annotation</i>
		 * <pre>
		 *     &lt;Record Type="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&gt;
		 *      &lt;PropertyValue Property="Label" String="Rating" /&gt;
		 *      &lt;PropertyValue Property="Target" AnnotationPath="@com.sap.vocabularies.UI.v1.DataPoint#Rating" /&gt;
		 *     &lt;/Record&gt;
		 *
		 *    &lt;Annotation Term="com.sap.vocabularies.UI.v1.DataPoint" Qualifier="Rating"&gt;
		 *      &lt;Record&gt;
		 *          &lt;PropertyValue Property="Value" Path="to_Customer/RatingCount"/&gt;
		 *          &lt;PropertyValue Property="TargetValue" Decimal="4"/&gt;
		 *          &lt;PropertyValue Property="Visualization" EnumMember="com.sap.vocabularies.UI.v1.VisualizationType/Rating"/&gt;
		 *      &lt;/Record&gt;
		 *    &lt;/Annotation&gt;
		 * </pre>
		 *
		 *  Supported properties are: <code>Value, TargetValue, Visualization</code>.
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataPoint  com.sap.vocabularies.UI.v1.DataPoint}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataPoint: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataPoint",
			target: ["Property"],
			since: "1.75"
		},
		/**
		 * This annotation is used to define a default data field,
		 * e.g. when a property is added as a table column or form field via personalization.
		 *
		 * <br>
		 * <i>XML Example of OData V4 DataFieldDefault annotation</i>
		 * <pre>
		 *     &lt;Annotations Target="SalesOrder.SalesOrderItemType/NetAmount"&gt;
		 *      &lt;Annotation Term="com.sap.vocabularies.UI.v1.DataFieldDefault"&gt;
		 *          &lt;Record Type="com.sap.vocabularies.UI.v1.DataField"&gt;
		 *              &lt;PropertyValue Property="Value" Path="NetAmount" /&gt;
		 *          &lt;/Record&gt;
		 *      &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataFieldDefault  com.sap.vocabularies.UI.v1.DataFieldDefault}</b><br/>
		 *   </li>
		 * </ul>
		 */
		dataFieldDefault: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "DataFieldDefault",
			target: ["Property"],
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
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObject  com.sap.vocabularies.Common.v1.SemanticObject}</b><br/>
		 *   </li>
		 * </ul>
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
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObjectMapping  com.sap.vocabularies.Common.v1.SemanticObjectMapping}</b><br/>
		 *   </li>
		 * </ul>
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
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticObjectUnavailableActions  com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions}</b><br/>
		 *   </li>
		 * </ul>
		 */
		semanticObjectUnavailableActions: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "SemanticObjectUnavailableActions",
			target: ["EntitySet", "EntityType", "Property"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Defines whether a property is a semantic key which is used for key columns and rendered in bold.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with SemanticKey annotation</i>
		 * <pre>
		 *    &lt;Annotations Target="SalesOrderType" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
		 *      &lt;Annotation Term="com.sap.vocabularies.Common.v1.SemanticKey"&gt;
		 *        &lt;Collection&gt;
		 *          &lt;PropertyPath&gt;SalesOrderID&lt;/PropertyPath&gt;
		 *          &lt;PropertyPath&gt;SalesOrderItemID&lt;/PropertyPath&gt;
		 *        &lt;/Collection&gt;
		 *      &lt;/Annotation&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SemanticKey  com.sap.vocabularies.Common.v1.SemanticKey}</b><br/>
		 *   </li>
		 * </ul>
		 */
		semanticKey: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "SemanticKey",
			target: ["EntityType"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Renders an image, if the annotation is present.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with the IsImageURL annotation</i>
		 * <pre>
		 *    &lt;Annotations Target="SalesOrderItemType/ProductPictureURL" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
		 *      &lt;Annotation Term="com.sap.vocabularies.Common.v1.IsImageURL" Bool="true" /&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#IsImageURL  com.sap.vocabularies.UI.v1.IsImageURL}</b><br/>
		 *   </li>
		 * </ul>
		 */
		isImageURL: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "IsImageURL",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		},
		/**
		 * Defines whether a field is mandatory, or in read-only/editable mode.
		 *
		 * An Entity Data Model (EDM) property can be <b>dynamically</b> annotated with the
		 * <code>com.sap.vocabularies.Common.v1.FieldControl</code> annotation in OData V4 models by providing a binding path to
		 * another EDM property typed as <code>Edm.Byte</code>. Or it can be <b>statically</b> annotated
		 * with a fixed value provided by as an enumeration member (<code>EnumMember</code>) of the
		 * <code>FieldControlType</code> enumeration.
		 *
		 * <br>
		 * Overview of the FieldControlType:
		 *
		 * <table border = 1>
		 *     <tr>
		 *      <th>EnumMember</th>
		 *      <th>Value</th>
		 *      <th>Description</th>
		 *     </tr>
		 *     <tr>
		 *         <td>Mandatory</td>
		 *         <td>7</td>
		 *         <td>The field is mandatory from a business perspective.
		 *         This value does not imply any restrictions on the value range of an EDM property.
		 *         For restricting the value range use, for example, the standard type facet <code>Nullable</code> with a
		 *         value of <code>false</code> must be used to exclude the <code>null</code> value, or terms from the
		 *         <code>Org.OData.Validation.V1</code> vocabulary must be used.</td>
		 *     </tr>
		 *     <tr>
		 *         <td>Optional</td>
		 *         <td>3</td>
		 *         <td>The field is editable and optional (default). This value does not make sense as a static annotation value.</td>
		 *     </tr>
		 *     <tr>
		 *         <td>ReadOnly</td>
		 *         <td>1</td>
		 *         <td>The field is in read-only mode and the value cannot be changed. <br>
		 *           To statically annotate an EDM property as read-only, use the <code>Org.OData.Core.V1.Computed</code>
		 *          annotation instead.</td>
		 *     </tr>
		 *     <tr>
		 *         <td>Inapplicable</td>
		 *         <td>0</td>
		 *         <td>The field has no meaning in the current entity state. This value does not make sense as a static annotation value.
		 *     </tr>
		 *     <tr>
		 *         <td>Hidden</td>
		 *         <td>0</td>
		 *         <td>Deprecated synonym for Inapplicable, do not use. To statically hide a property on the UI use
		 *         <code>com.sap.vocabularies.UI.v1.Hidden</code> annotation instead</td>
		 *     </tr>
		 * </table>
		 *
		 * Supported values are: ReadOnly (1) and Mandatory (7).
		 *
		 * <br>
		 * Example for dynamic use: in a travel expense report the EDM property <code>DestinationCountry</code> is
		 * is not applicable if the trip type is domestic, and mandatory if the trip type is international.
		 * Whenever the value in the data model of the referenced EDM property changes, the field adapts its state
		 * accordingly.
		 *
		 * <br>
		 * <i>XML Example of an EDM Property annotated with the dynamic <code>FieldControl</code> OData V4 annotation
		 * in a Service Metadata Document</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
		 *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; Path=&quot;CompanyCodeFC&quot;/&gt;
		 *     &lt;/Annotations&gt;
		 *    &lt;Property Name=&quot;CompanyCodeFC&quot; type=&quot;Edm.Byte&quot;/&gt;
		 * </pre>
		 *
		 * <br>
		 * <i>XML Example of an EDM Property statically annotated as Read-only</i>
		 *
		 * <pre>
		 *     &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
		 *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; EnumMember=&quot;com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly&quot;/&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i>XML Example of OData V4 with static mandatory CompanyCode property</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target=&quot;SalesOrder/CompanyCode&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
		 *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControl&quot; EnumMember=&quot;com.sap.vocabularies.Common.v1.FieldControlType/Mandatory&quot;/&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#FieldControl  com.sap.vocabularies.Common.v1.FieldControl}</b><br/>
		 *   </li>
		 * </ul>
		 */
		fieldControl: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "FieldControl",
			target: ["Property", "Record"],
			defaultValue: 3,
			since: "1.75"
		},
		/**
		 * Defines a currency code for an amount according to the ISO 4217 standard. <code>ISOCurrency</code> annotation can point to a
		 * <code>Property</code>, which can also be <code>null</code>.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with Price and CurrencyCode as ISOCurrency</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target=&quot;SalesOrderItem/Price&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
		 *      &lt;Annotation Term=&quot;Org.OData.Measures.V1.ISOCurrency&quot; Path=&quot;CurrencyCode&quot; /&gt;
		 *    &lt;/Annotations&gt;
		 *    &lt;Property Name=&quot;CurrencyCode&quot; type=&quot;Edm.String&quot; /&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#ISOCurrency  Org.OData.Measures.V1.ISOCurrency}</b><br/>
		 *   </li>
		 * </ul>
		 */
		currencyCode: {
			namespace: "Org.OData.Measures.V1",
			annotation: "ISOCurrency",
			target: ["Property"],
			defaultValue: null,
			since: "1.75"
		},

		/**
		 * The unit of measure for this measured quantity, for example, cm for centimeters. Renders the value associated with the unit annotation
		 * of a <code>Property</code>, which can be <code>null</code>.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with OrderedQuantity and OrderedUnit as Unit</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target=&quot;SalesOrderItem/OrderedQuantity&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
		 *      &lt;Annotation Term=&quot;Org.OData.Measures.V1.Unit&quot; Path=&quot;OrderedUnit&quot; /&gt;
		 *    &lt;/Annotations&gt;
		 *    &lt;Property Name=&quot;OrderedUnit&quot; type=&quot;Edm.String&quot; /&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#Unit  Org.OData.Measures.V1.Unit}</b><br/>
		 *   </li>
		 * </ul>
		 */
		unitOfMeasure: {
			namespace: "Org.OData.Measures.V1",
			annotation: "Unit",
			target: ["Property"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Properties annotated with this annotation are rendered as multi-line text, e.g. text area.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with multi-line text Description property</i>
		 *
		 * <pre>
		 *    &lt;Property Name=&quot;Description&quot; /&gt;
		 *    &lt;Annotations Target=&quot;Description&quot;&gt;
		 *      &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.MultiLineText&quot; /&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#MultiLineText  com.sap.vocabularies.UI.v1.MultiLineText}</b><br/>
		 *   </li>
		 * </ul>
		 */
		multiLineText: {
			namespace: "com.sap.vocabularies.UI.v1",
			annotation: "MultiLineText",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		},
		/**
		 * Defines whether a <code>Property</code> can be created. A value for this <code>Property</code> is generated on both insert and
		 * update actions.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with computed CreatedBy property</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target=&quot;SalesOrder.SalesOrderItemType/CreatedBy&quot;&gt;
		 *      &lt;Annotation Term=&quot;Org.OData.Core.V1.Computed&quot;/&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Core.V1.md#Computed  Org.OData.Core.V1.Computed}</b><br/>
		 *   </li>
		 * </ul>
		 */
		computed: {
			namespace: "Org.OData.Core.V1",
			annotation: "Computed",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		},
		/**
		 * A value for this non-key property can be provided on <code>insert</code> and cannot be changed on update actions.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with immutable CreatedBy property</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target=&quot;SalesOrder.SalesOrderItemType/CreatedBy&quot;&gt;
		 *      &lt;Annotation Term=&quot;Org.OData.Core.V1.Immutable&quot;/&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Core.V1.md#Immutable  Org.OData.Core.V1.Immutable}</b><br/>
		 *   </li>
		 * </ul>
		 */
		immutable: {
			namespace: "Org.OData.Core.V1",
			annotation: "Immutable",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		},
		/**
		 * Changes to the source properties may have side-effects on the target properties or entities. If neither TargetProperties nor
		 * TargetEntities are specified, a change to the source property values may have unforeseeable side-effects as the corresponding
		 * changes in the background will not be reflected in the UI. An empty
		 * NavigationPropertyPath may be used in TargetEntities to specify that any property of the annotated entity type may be affected. Actions
		 * are a special case: here the change trigger is the action invocation, so SourceProperties and SourceEntities have no meaning, only
		 * TargetProperties and TargetEntities are relevant. They are addressed via the binding parameter of the action. <code>SideEffects</code>
		 * can be associated with the given entity, which can be a complex type, entity type or entity set. In addition to this,
		 * <code>SideEffects</code> can also be applied to a <code>PropertyPath</code> or a <code>NavigationPropertyPath</code> of the given
		 * entity.
		 *
		 * <br>
		 * <i>XML Example of OData V4 with Side Effect when user changes a source property and the system refreshes the price</i>
		 *
		 * <pre>
		 *   &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SideEffects&quot; Qualifier=&quot;PriceChanged&quot;&gt;
		 *     &lt;Record&gt;
		 *       &lt;PropertyValue Property=&quot;SourceProperties&quot;&gt;
		 *         &lt;Collection&gt;
		 *           &lt;PropertyPath&gt;Amount&lt;/PropertyPath&gt;
		 *           &lt;PropertyPath&gt;Discount&lt;/PropertyPath&gt;
		 *           &lt;PropertyPath&gt;Product&lt;/PropertyPath&gt;
		 *         &lt;/Collection&gt;
		 *       &lt;/PropertyValue&gt;
		 *       &lt;PropertyValue Property=&quot;TargetProperties&quot;&gt;
		 *         &lt;Collection&gt;
		 *           &lt;PropertyPath&gt;Price&lt;/PropertyPath&gt;
		 *         &lt;/Collection&gt;
		 *       &lt;/PropertyValue&gt;
		 *     &lt;/Record&gt;
		 *   &lt;/Annotation&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#SideEffects  com.sap.vocabularies.Common.v1.SideEffects}</b><br/>
		 *   </li>
		 * </ul>
		 */
		sideEffects: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "SideEffects",
			target: ["EntitySet", "EntityType", "ComplexType"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Specifies how to get a list of acceptable values for a property or parameter. Provides the value help dialog and type-ahead function.
		 *
		 * <br>
		 * <i>XML Example of OData V4 Value List on Category Property</i>
		 *
		 * <pre>
		 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.ValueList&quot;&gt;
		 *      &lt;Record&gt;
		 *        &lt;PropertyValue Property=&quot;Label&quot; String=&quot;Category&quot; /&gt;
		 *        &lt;PropertyValue Property=&quot;CollectionPath&quot; String=&quot;Category&quot; /&gt;
		 *        &lt;PropertyValue Property=&quot;SearchSupported&quot; Bool=&quot;true&quot; /&gt;
		 *        &lt;PropertyValue Property=&quot;Parameters&quot;&gt;
		 *          &lt;Collection&gt;
		 *            &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterOut&quot;&gt;
		 *              &lt;PropertyValue Property=&quot;LocalDataProperty&quot; PropertyPath=&quot;Category&quot; /&gt;
		 *              &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;Description&quot; /&gt;
		 *            &lt;/Record&gt;
		 *            &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly&quot;&gt;
		 *              &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;CategoryName&quot; /&gt;
		 *            &lt;/Record&gt;
		 *          &lt;/Collection&gt;
		 *        &lt;/PropertyValue&gt;
		 *      &lt;/Record&gt;
		 *    &lt;/Annotation&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueList  com.sap.vocabularies.Common.v1.ValueList}</b><br/>
		 *   </li>
		 * </ul>
		 */
		valueList: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueList",
			target: ["Property", "Parameter"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * A list of URLs of CSDL documents containing value list mappings for this parameter or property.
		 * Using this annotation, the OData service only contains an annotation with the property as target
		 * and the term com.sap.vocabularies.Common.v1.ValueListReferences pointing to the metadata of the value list service.
		 * The ValueList annotation itself is in the referenced service.
		 *
		 * <br>
		 * <i>XML Example of OData V4 Value List References on OriginalArtist Property</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target="sample.TitlesType/OriginalArtist"&gt;
		 *         &lt;Annotation Term="com.sap.vocabularies.Common.v1.ValueListReferences"&gt;
		 *             &lt;Collection&gt;
		 *                 &lt;String&gt;../i_v4_artistname/$metadata&lt;/String&gt;
		 *                 &lt;String&gt;../i_v4_artistperson/$metadata&lt;/String&gt;
		 *             &lt;/Collection&gt;
		 *         &lt;/Annotation&gt;
		 *     &lt;/Annotations&gt;
		 * </pre>
		 *
		 * <br>
		 * <i><b><u>Documentation links</u></b></i>
		 * <ul>
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListReferences  com.sap.vocabularies.Common.v1.ValueListReferences}</b><br/>
		 *   </li>
		 * </ul>
		 */
		valueListReferences: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListReferences",
			target: ["Property", "Parameter"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Specifies the mapping between data service properties and value list properties.
		 * The value list can be filtered based on user input. It can be used for type-ahead and classical pick lists.
		 *
		 * <br>
		 * <i>XML Example of OData V4 Value List Mapping on Country Property</i>
		 *
		 * <pre>
		 *   &lt;Annotations Target="sample.I_AIVS_RegionType/Country"&gt;
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
		 *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#ValueListMapping  com.sap.vocabularies.Common.v1.ValueListMapping}</b><br/>
		 *   </li>
		 * </ul>
		 */
		valueListMapping: {
			namespace: "com.sap.vocabularies.Common.v1",
			annotation: "ValueListMapping",
			target: ["Property", "Parameter"],
			defaultValue: null,
			since: "1.75"
		},
		/**
		 * Specifies if a DataField is rendered as a email link. The link launches the browser email action.
		 *
		 * <br>
		 * <i>XML Example of OData V4 DataField with email link content</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target="sap.fe.manageitems.TechnicalTestingService.LineItems/emailAddress"&gt;
		 *      &lt;Annotation Term="Common.Label" String="Email"/&gt;
		 *      &lt;Annotation Term="Communication.IsEmailAddress" Bool="true"/&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 */
		isEmailAddress: {
			namespace: "com.sap.vocabularies.Communication.v1",
			annotation: "IsEmailAddress",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		},
		/**
		 * Specifies if a DataField is rendered as a phone link. The link launches the browser phone action.
		 *
		 * <br>
		 * <i>XML Example of OData V4 DataField with phone link content</i>
		 *
		 * <pre>
		 *    &lt;Annotations Target="sap.fe.manageitems.TechnicalTestingService.LineItems/phoneNumber"&gt;
		 *      &lt;Annotation Term="Common.Label" String="Mobile"/&gt;
		 *      &lt;Annotation Term="Communication.IsPhoneNumber" Bool="true"/&gt;
		 *    &lt;/Annotations&gt;
		 * </pre>
		 */
		isPhoneNumber: {
			namespace: "com.sap.vocabularies.Communication.v1",
			annotation: "IsPhoneNumber",
			target: ["Property"],
			defaultValue: true,
			since: "1.75"
		}
	}
};
