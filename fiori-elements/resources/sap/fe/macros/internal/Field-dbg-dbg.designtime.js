/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
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
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImhpZGRlbiIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsImRhdGFGaWVsZCIsImRhdGFGaWVsZFdpdGhVcmwiLCJkYXRhRmllbGRGb3JBbm5vdGF0aW9uIiwiZGF0YUZpZWxkRm9yQWN0aW9uIiwiZGF0YVBvaW50IiwiZGF0YUZpZWxkRGVmYXVsdCIsInNlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiZGVmYXVsdFZhbHVlIiwic2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJzZW1hbnRpY0tleSIsImlzSW1hZ2VVUkwiLCJmaWVsZENvbnRyb2wiLCJjdXJyZW5jeUNvZGUiLCJ1bml0T2ZNZWFzdXJlIiwibXVsdGlMaW5lVGV4dCIsImNvbXB1dGVkIiwiaW1tdXRhYmxlIiwic2lkZUVmZmVjdHMiLCJ2YWx1ZUxpc3QiLCJ2YWx1ZUxpc3RSZWZlcmVuY2VzIiwidmFsdWVMaXN0TWFwcGluZyIsImlzRW1haWxBZGRyZXNzIiwiaXNQaG9uZU51bWJlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGQuZGVzaWdudGltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG5cdGFubm90YXRpb25zOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB0aGF0IGEgcHJvcGVydHkgaXMgbm90IGRpc3BsYXllZC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHdpdGggaGlkZGVuIFByb2R1Y3RVVUlEPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L1Byb2R1Y3RVVUlEICZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuJnF1b3Q7LyZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNIaWRkZW4gIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbn08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRoaWRkZW46IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJIaWRkZW5cIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIiwgXCJSZWNvcmRcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoaXMgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhhdCBhIHByb3BlcnR5IGlzIHJlbmRlcmVkIGFzIGEgcmVndWxhciBkYXRhIGZpZWxkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIGZvciBPRGF0YSBWNCBEYXRhRmllbGQgdHlwZTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlXCIgU3RyaW5nPVwiTmFtZVwiLyZndDtcblx0XHQgKiAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqICBTdXBwb3J0ZWQgcHJvcGVydGllcyBhcmU6IDxjb2RlPkNyaXRpY2FsaXR5LCBDcml0aWNhbGl0eVJlcHJlc2VudGF0aW9uLCBMYWJlbDwvY29kZT4gYW5kIDxjb2RlPlZhbHVlPC9jb2RlPi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNEYXRhRmllbGQgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZH08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRkYXRhRmllbGQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJEYXRhRmllbGRcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoaXMgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhhdCBhIHByb3BlcnR5IGlzIHJlbmRlcmVkIGFzIGEgbGluaywgaWYgYSBVUkwgcGFyYW1ldGVyIHBhdGggaXMgcHJlc2VudC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBmb3IgT0RhdGEgVjQgRGF0YUZpZWxkV2l0aFVybCBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aFVybFwiJmd0O1xuXHRcdCAqICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkxpbmsgdG9cIi8mZ3Q7XG5cdFx0ICogICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlXCIgU3RyaW5nPVwiR29vZ2xlIE1hcHNcIi8mZ3Q7XG5cdFx0ICogICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlVybFwiIFN0cmluZz1cImh0dHBzOi8vd3d3Lmdvb2dsZS5kZS9tYXBzXCIvJmd0O1xuXHRcdCAqICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogIFN1cHBvcnRlZCBwcm9wZXJ0aWVzIGFyZTogPGNvZGU+VXJsLCBMYWJlbDwvY29kZT4gYW5kIDxjb2RlPlZhbHVlPC9jb2RlPi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNEYXRhRmllbGRXaXRoVXJsICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGRhdGFGaWVsZFdpdGhVcmw6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJEYXRhRmllbGRXaXRoVXJsXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGlzIGFubm90YXRpb24gc3BlY2lmaWVzIHRoYXQgYSBwcm9wZXJ0eSBpcyByZW5kZXJlZCBhcyBhIGRhdGEgZmllbGQgZm9yIGFubm90YXRpb24sIGUuZy4gRGF0YVBvaW50IG9yIENvbnRhY3QuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgZm9yIE9EYXRhIFY0IERhdGFGaWVsZEZvckFubm90YXRpb24gYW5ub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIiZndDtcblx0XHQgKiAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJTb2xkVG9QYXJ0eVwiLyZndDtcblx0XHQgKiAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0XCIgQW5ub3RhdGlvblBhdGg9XCJfU29sZFRvUGFydHkvQENvbW11bmljYXRpb24uQ29udGFjdFwiLyZndDtcblx0XHQgKiAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqICBTdXBwb3J0ZWQgcHJvcGVydGllcyBhcmU6IDxjb2RlPlRhcmdldCwgTGFiZWw8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0RhdGFGaWVsZEZvckFubm90YXRpb24gIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb259PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0ZGF0YUZpZWxkRm9yQW5ub3RhdGlvbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkRhdGFGaWVsZEZvckFubm90YXRpb25cIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoaXMgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhhdCBhIHByb3BlcnR5IGlzIHJlbmRlcmVkIGFzIGEgYnV0dG9uLlxuXHRcdCAqIEFuIGFjdGlvbiBjYW4gYmUgY2xhc3NpZmllZCBhcyBib3VuZCBvciB1bmJvdW5kLiBBIGJvdW5kIGFjdGlvbiBuZWVkcyBhIGNvbnRleHQgdG8gYmUgaW52b2tlZCwgb25seSB0aGVuIHRoZSBidXR0b24gd2lsbCBiZSBlbmFibGVkLlxuXHRcdCAqIFRoZSBjb250ZXh0IGlzIHVzdWFsbHkgc2V0IGJ5IHRoZSB1c2VyLCBlLmcuIGJ5IHNlbGVjdGluZyBhbiBpdGVtIGluIGEgdGFibGUuXG5cdFx0ICogQSBidXR0b24gZm9yIGFuIHVuYm91bmQgYWN0aW9uIHdpbGwgYWx3YXlzIGJlIGVuYWJsZWQuXG5cdFx0ICogQW4gYWN0aW9uIGNhbiBoYXZlIGFzc29jaWF0ZWQgcGFyYW1ldGVycyB3aGljaCBoYXZlIHRvIGJlIGRlZmluZWQgaW4gdGhlIGJhY2tlbmQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgZm9yIE9EYXRhIFY0IERhdGFGaWVsZEZvckFjdGlvbiBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiQm91bmQgQWN0aW9uIHdpdGggcGFyYW1zXCIvJmd0O1xuXHRcdCAqICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJBY3Rpb25cIiBTdHJpbmc9XCJjb20uY19zYWxlc29yZGVybWFuYWdlX3NkLkNoYW5nZU9yZGVyVHlwZVwiLyZndDtcblx0XHQgKiAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqICBTdXBwb3J0ZWQgcHJvcGVydGllcyBhcmU6IDxjb2RlPkxhYmVsLCBBY3Rpb24sIERldGVybWluaW5nLCBJbmxpbmU8L2NvZGU+IGFuZCA8Y29kZT5JbnZvY2F0aW9uR3JvdXBpbmc8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0RhdGFGaWVsZEZvckFjdGlvbiAgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9ufTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGRhdGFGaWVsZEZvckFjdGlvbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkRhdGFGaWVsZEZvckFjdGlvblwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVGhpcyBhbm5vdGF0aW9uIGNhbiBiZSB1c2VkIGFsb25nIHdpdGggdGhlIDxjb2RlPkRhdGFGaWVsZEZvckFubm90YXRpb248L2NvZGU+IGFubm90YXRpb24gaW4gb3JkZXIgdG8gc3BlY2lmeSB0aGF0IGEgcHJvcGVydHlcblx0XHQgKiBpcyByZW5kZXJlZCBhcyBhIERhdGFQb2ludCwgZS4gZy4gUmF0aW5nLCBQcm9ncmVzcy5cblx0XHQgKiBWaWEgdGhlIFZpc3VhbGl6YXRpb24gcHJvcGVydHkgdGhlIFZpc3VhbGl6YXRpb25UeXBlIGNhbiBiZSBkZWZpbmVkIC0gc3VwcG9ydGVkIHZhbHVlcyBmb3IgRW51bU1lbWJlciBhcmUgPGNvZGU+UmF0aW5nPC9jb2RlPiBhbmQgPGNvZGU+UHJvZ3Jlc3M8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIGZvciBPRGF0YSBWNCBEYXRhUG9pbnQgYW5ub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxhYmVsXCIgU3RyaW5nPVwiUmF0aW5nXCIgLyZndDtcblx0XHQgKiAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0XCIgQW5ub3RhdGlvblBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50I1JhdGluZ1wiIC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqXG5cdFx0ICogICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiIFF1YWxpZmllcj1cIlJhdGluZ1wiJmd0O1xuXHRcdCAqICAgICAgJmx0O1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlXCIgUGF0aD1cInRvX0N1c3RvbWVyL1JhdGluZ0NvdW50XCIvJmd0O1xuXHRcdCAqICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0VmFsdWVcIiBEZWNpbWFsPVwiNFwiLyZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZpc3VhbGl6YXRpb25cIiBFbnVtTWVtYmVyPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIvJmd0O1xuXHRcdCAqICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogIFN1cHBvcnRlZCBwcm9wZXJ0aWVzIGFyZTogPGNvZGU+VmFsdWUsIFRhcmdldFZhbHVlLCBWaXN1YWxpemF0aW9uPC9jb2RlPi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNEYXRhUG9pbnQgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludH08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRkYXRhUG9pbnQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJEYXRhUG9pbnRcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoaXMgYW5ub3RhdGlvbiBpcyB1c2VkIHRvIGRlZmluZSBhIGRlZmF1bHQgZGF0YSBmaWVsZCxcblx0XHQgKiBlLmcuIHdoZW4gYSBwcm9wZXJ0eSBpcyBhZGRlZCBhcyBhIHRhYmxlIGNvbHVtbiBvciBmb3JtIGZpZWxkIHZpYSBwZXJzb25hbGl6YXRpb24uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgRGF0YUZpZWxkRGVmYXVsdCBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJTYWxlc09yZGVyLlNhbGVzT3JkZXJJdGVtVHlwZS9OZXRBbW91bnRcIiZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0XCImZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVcIiBQYXRoPVwiTmV0QW1vdW50XCIgLyZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNEYXRhRmllbGREZWZhdWx0ICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGRhdGFGaWVsZERlZmF1bHQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJEYXRhRmllbGREZWZhdWx0XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIGEgbmFtZSBvZiB0aGUgPGNvZGU+U2VtYW50aWNPYmplY3Q8L2NvZGU+IHJlcHJlc2VudGVkIGFzIHRoaXMgZW50aXR5IHR5cGUgb3IgaWRlbnRpZmllZCBieSB0aGlzIHByb3BlcnR5IGFuZCBpcyByZW5kZXJlZCBhcyBhIGxpbmsuXG5cdFx0ICpcblx0XHQgKiA8Yj5Ob3RlOjwvYj4gTmF2aWdhdGlvbiB0YXJnZXRzIGFyZSBkZXRlcm1pbmVkIHVzaW5nIHtAbGluayBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9ufSBvZiB0aGUgdW5pZmllZCBzaGVsbCBzZXJ2aWNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggU2VtYW50aWNPYmplY3QgYW5ub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L05hbWUmcXVvdDsgeG1sbnM9JnF1b3Q7aHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3QmcXVvdDsgU3RyaW5nPSZxdW90O1Byb2R1Y3QmcXVvdDsgLyZndDtcblx0XHQgKiAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1NlbWFudGljT2JqZWN0ICBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3R9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0c2VtYW50aWNPYmplY3Q6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiU2VtYW50aWNPYmplY3RcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiLCBcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBNYXBzIHByb3BlcnRpZXMgb2YgdGhlIGFubm90YXRlZCA8Y29kZT5FbnRpdHlUeXBlPC9jb2RlPiBvciBzaWJsaW5nIHByb3BlcnRpZXMgb2YgdGhlIGFubm90YXRlZCBwcm9wZXJ0eSB0byBwcm9wZXJ0aWVzIG9mIHRoZVxuXHRcdCAqIFNlbWFudGljIE9iamVjdC4gVGhpcyBhbGxvd3MgXCJyZW5hbWluZ1wiIG9mIHByb3BlcnRpZXMgaW4gdGhlIGN1cnJlbnQgY29udGV4dCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgU2VtYW50aWMgT2JqZWN0LCBlLmcuIFNlbmRlclBhcnR5SUQgdG8gUGFydHlJRC5cblx0XHQgKiBPbmx5IHByb3BlcnRpZXMgZXhwbGljaXRseSBsaXN0ZWQgaW4gdGhlIG1hcHBpbmcgYXJlIHJlbmFtZWQsIGFsbCBvdGhlciBwcm9wZXJ0aWVzIGFyZSBhdmFpbGFibGUgZm9yIGludGVudC1iYXNlZCBuYXZpZ2F0aW9uIHdpdGggdGhlaXIgXCJsb2NhbFwiIG5hbWUuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCBTZW1hbnRpY09iamVjdE1hcHBpbmcgb24gUHJvZHVjdC9OYW1lPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L05hbWUmcXVvdDsgeG1sbnM9JnF1b3Q7aHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtJnF1b3Q7Jmd0O1xuXHRcdCAqIFx0ICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0JnF1b3Q7IFN0cmluZz0mcXVvdDtTZW1hbnRpY09iamVjdE5hbWUmcXVvdDsgLyZndDtcblx0XHQgKiBcdCAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmcmcXVvdDsmZ3Q7XG5cdFx0ICogXHRcdCAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0XHQgICAgJmx0O1JlY29yZCZndDtcblx0XHQgKiBcdFx0XHRcdCAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtMb2NhbFByb3BlcnR5JnF1b3Q7IFByb3BlcnR5UGF0aD0mcXVvdDtTdXBwbGllcklkJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogXHRcdFx0XHRcdCZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1NlbWFudGljT2JqZWN0UHJvcGVydHkmcXVvdDsgU3RyaW5nPSZxdW90O1N1cHBsaWVySWRPZlNlbWFudGljT2JqZWN0TmFtZSZxdW90OyAvJmd0O1xuXHRcdCAqIFx0XHRcdFx0Jmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogXHRcdFx0Jmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHQmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1NlbWFudGljT2JqZWN0TWFwcGluZyAgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZ308L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiU2VtYW50aWNPYmplY3RNYXBwaW5nXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogTGlzdCBvZiBhY3Rpb25zIHRoYXQgYXJlIG5vdCBhdmFpbGFibGUgaW4gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluc3RhbmNlIG9mIHRoZSBTZW1hbnRpYyBPYmplY3Rcblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSB3aXRoIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIG9uIFByb2R1Y3QvQ3VzdG9tZXJJZDwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7UHJvZHVjdENvbGxlY3Rpb24uUHJvZHVjdC9DdXN0b21lcklkJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiBcdCAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdCZxdW90OyBTdHJpbmc9JnF1b3Q7Q3VzdG9tZXJTTyZxdW90OyAvJmd0O1xuXHRcdCAqIFx0XHQmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyZxdW90OyZndDtcblx0XHQgKiBcdFx0XHQmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtTdHJpbmcmZ3Q7RGVsZXRlQ3VzdG9tZXImbHQ7U3RyaW5nLyZndDtcblx0XHQgKiBcdFx0XHQmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdCZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc308L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiUHJvcGVydHlcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgd2hldGhlciBhIHByb3BlcnR5IGlzIGEgc2VtYW50aWMga2V5IHdoaWNoIGlzIHVzZWQgZm9yIGtleSBjb2x1bW5zIGFuZCByZW5kZXJlZCBpbiBib2xkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggU2VtYW50aWNLZXkgYW5ub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJTYWxlc09yZGVyVHlwZVwiIHhtbG5zPVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5XCImZ3Q7XG5cdFx0ICogICAgICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7U2FsZXNPcmRlcklEJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtTYWxlc09yZGVySXRlbUlEJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNTZW1hbnRpY0tleSAgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHNlbWFudGljS2V5OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlNlbWFudGljS2V5XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFJlbmRlcnMgYW4gaW1hZ2UsIGlmIHRoZSBhbm5vdGF0aW9uIGlzIHByZXNlbnQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCB0aGUgSXNJbWFnZVVSTCBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD1cIlNhbGVzT3JkZXJJdGVtVHlwZS9Qcm9kdWN0UGljdHVyZVVSTFwiIHhtbG5zPVwiaHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzSW1hZ2VVUkxcIiBCb29sPVwidHJ1ZVwiIC8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNJc0ltYWdlVVJMICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGlzSW1hZ2VVUkw6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJJc0ltYWdlVVJMXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiB0cnVlLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHdoZXRoZXIgYSBmaWVsZCBpcyBtYW5kYXRvcnksIG9yIGluIHJlYWQtb25seS9lZGl0YWJsZSBtb2RlLlxuXHRcdCAqXG5cdFx0ICogQW4gRW50aXR5IERhdGEgTW9kZWwgKEVETSkgcHJvcGVydHkgY2FuIGJlIDxiPmR5bmFtaWNhbGx5PC9iPiBhbm5vdGF0ZWQgd2l0aCB0aGVcblx0XHQgKiA8Y29kZT5jb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sPC9jb2RlPiBhbm5vdGF0aW9uIGluIE9EYXRhIFY0IG1vZGVscyBieSBwcm92aWRpbmcgYSBiaW5kaW5nIHBhdGggdG9cblx0XHQgKiBhbm90aGVyIEVETSBwcm9wZXJ0eSB0eXBlZCBhcyA8Y29kZT5FZG0uQnl0ZTwvY29kZT4uIE9yIGl0IGNhbiBiZSA8Yj5zdGF0aWNhbGx5PC9iPiBhbm5vdGF0ZWRcblx0XHQgKiB3aXRoIGEgZml4ZWQgdmFsdWUgcHJvdmlkZWQgYnkgYXMgYW4gZW51bWVyYXRpb24gbWVtYmVyICg8Y29kZT5FbnVtTWVtYmVyPC9jb2RlPikgb2YgdGhlXG5cdFx0ICogPGNvZGU+RmllbGRDb250cm9sVHlwZTwvY29kZT4gZW51bWVyYXRpb24uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogT3ZlcnZpZXcgb2YgdGhlIEZpZWxkQ29udHJvbFR5cGU6XG5cdFx0ICpcblx0XHQgKiA8dGFibGUgYm9yZGVyID0gMT5cblx0XHQgKiAgICAgPHRyPlxuXHRcdCAqICAgICAgPHRoPkVudW1NZW1iZXI8L3RoPlxuXHRcdCAqICAgICAgPHRoPlZhbHVlPC90aD5cblx0XHQgKiAgICAgIDx0aD5EZXNjcmlwdGlvbjwvdGg+XG5cdFx0ICogICAgIDwvdHI+XG5cdFx0ICogICAgIDx0cj5cblx0XHQgKiAgICAgICAgIDx0ZD5NYW5kYXRvcnk8L3RkPlxuXHRcdCAqICAgICAgICAgPHRkPjc8L3RkPlxuXHRcdCAqICAgICAgICAgPHRkPlRoZSBmaWVsZCBpcyBtYW5kYXRvcnkgZnJvbSBhIGJ1c2luZXNzIHBlcnNwZWN0aXZlLlxuXHRcdCAqICAgICAgICAgVGhpcyB2YWx1ZSBkb2VzIG5vdCBpbXBseSBhbnkgcmVzdHJpY3Rpb25zIG9uIHRoZSB2YWx1ZSByYW5nZSBvZiBhbiBFRE0gcHJvcGVydHkuXG5cdFx0ICogICAgICAgICBGb3IgcmVzdHJpY3RpbmcgdGhlIHZhbHVlIHJhbmdlIHVzZSwgZm9yIGV4YW1wbGUsIHRoZSBzdGFuZGFyZCB0eXBlIGZhY2V0IDxjb2RlPk51bGxhYmxlPC9jb2RlPiB3aXRoIGFcblx0XHQgKiAgICAgICAgIHZhbHVlIG9mIDxjb2RlPmZhbHNlPC9jb2RlPiBtdXN0IGJlIHVzZWQgdG8gZXhjbHVkZSB0aGUgPGNvZGU+bnVsbDwvY29kZT4gdmFsdWUsIG9yIHRlcm1zIGZyb20gdGhlXG5cdFx0ICogICAgICAgICA8Y29kZT5PcmcuT0RhdGEuVmFsaWRhdGlvbi5WMTwvY29kZT4gdm9jYWJ1bGFyeSBtdXN0IGJlIHVzZWQuPC90ZD5cblx0XHQgKiAgICAgPC90cj5cblx0XHQgKiAgICAgPHRyPlxuXHRcdCAqICAgICAgICAgPHRkPk9wdGlvbmFsPC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD4zPC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD5UaGUgZmllbGQgaXMgZWRpdGFibGUgYW5kIG9wdGlvbmFsIChkZWZhdWx0KS4gVGhpcyB2YWx1ZSBkb2VzIG5vdCBtYWtlIHNlbnNlIGFzIGEgc3RhdGljIGFubm90YXRpb24gdmFsdWUuPC90ZD5cblx0XHQgKiAgICAgPC90cj5cblx0XHQgKiAgICAgPHRyPlxuXHRcdCAqICAgICAgICAgPHRkPlJlYWRPbmx5PC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD4xPC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD5UaGUgZmllbGQgaXMgaW4gcmVhZC1vbmx5IG1vZGUgYW5kIHRoZSB2YWx1ZSBjYW5ub3QgYmUgY2hhbmdlZC4gPGJyPlxuXHRcdCAqICAgICAgICAgICBUbyBzdGF0aWNhbGx5IGFubm90YXRlIGFuIEVETSBwcm9wZXJ0eSBhcyByZWFkLW9ubHksIHVzZSB0aGUgPGNvZGU+T3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWQ8L2NvZGU+XG5cdFx0ICogICAgICAgICAgYW5ub3RhdGlvbiBpbnN0ZWFkLjwvdGQ+XG5cdFx0ICogICAgIDwvdHI+XG5cdFx0ICogICAgIDx0cj5cblx0XHQgKiAgICAgICAgIDx0ZD5JbmFwcGxpY2FibGU8L3RkPlxuXHRcdCAqICAgICAgICAgPHRkPjA8L3RkPlxuXHRcdCAqICAgICAgICAgPHRkPlRoZSBmaWVsZCBoYXMgbm8gbWVhbmluZyBpbiB0aGUgY3VycmVudCBlbnRpdHkgc3RhdGUuIFRoaXMgdmFsdWUgZG9lcyBub3QgbWFrZSBzZW5zZSBhcyBhIHN0YXRpYyBhbm5vdGF0aW9uIHZhbHVlLlxuXHRcdCAqICAgICA8L3RyPlxuXHRcdCAqICAgICA8dHI+XG5cdFx0ICogICAgICAgICA8dGQ+SGlkZGVuPC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD4wPC90ZD5cblx0XHQgKiAgICAgICAgIDx0ZD5EZXByZWNhdGVkIHN5bm9ueW0gZm9yIEluYXBwbGljYWJsZSwgZG8gbm90IHVzZS4gVG8gc3RhdGljYWxseSBoaWRlIGEgcHJvcGVydHkgb24gdGhlIFVJIHVzZVxuXHRcdCAqICAgICAgICAgPGNvZGU+Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuPC9jb2RlPiBhbm5vdGF0aW9uIGluc3RlYWQ8L3RkPlxuXHRcdCAqICAgICA8L3RyPlxuXHRcdCAqIDwvdGFibGU+XG5cdFx0ICpcblx0XHQgKiBTdXBwb3J0ZWQgdmFsdWVzIGFyZTogUmVhZE9ubHkgKDEpIGFuZCBNYW5kYXRvcnkgKDcpLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIEV4YW1wbGUgZm9yIGR5bmFtaWMgdXNlOiBpbiBhIHRyYXZlbCBleHBlbnNlIHJlcG9ydCB0aGUgRURNIHByb3BlcnR5IDxjb2RlPkRlc3RpbmF0aW9uQ291bnRyeTwvY29kZT4gaXNcblx0XHQgKiBpcyBub3QgYXBwbGljYWJsZSBpZiB0aGUgdHJpcCB0eXBlIGlzIGRvbWVzdGljLCBhbmQgbWFuZGF0b3J5IGlmIHRoZSB0cmlwIHR5cGUgaXMgaW50ZXJuYXRpb25hbC5cblx0XHQgKiBXaGVuZXZlciB0aGUgdmFsdWUgaW4gdGhlIGRhdGEgbW9kZWwgb2YgdGhlIHJlZmVyZW5jZWQgRURNIHByb3BlcnR5IGNoYW5nZXMsIHRoZSBmaWVsZCBhZGFwdHMgaXRzIHN0YXRlXG5cdFx0ICogYWNjb3JkaW5nbHkuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgYW4gRURNIFByb3BlcnR5IGFubm90YXRlZCB3aXRoIHRoZSBkeW5hbWljIDxjb2RlPkZpZWxkQ29udHJvbDwvY29kZT4gT0RhdGEgVjQgYW5ub3RhdGlvblxuXHRcdCAqIGluIGEgU2VydmljZSBNZXRhZGF0YSBEb2N1bWVudDwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7U2FsZXNPcmRlci9Db21wYW55Q29kZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2wmcXVvdDsgUGF0aD0mcXVvdDtDb21wYW55Q29kZUZDJnF1b3Q7LyZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiAgICAmbHQ7UHJvcGVydHkgTmFtZT0mcXVvdDtDb21wYW55Q29kZUZDJnF1b3Q7IHR5cGU9JnF1b3Q7RWRtLkJ5dGUmcXVvdDsvJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIGFuIEVETSBQcm9wZXJ0eSBzdGF0aWNhbGx5IGFubm90YXRlZCBhcyBSZWFkLW9ubHk8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1NhbGVzT3JkZXIvQ29tcGFueUNvZGUmcXVvdDsgeG1sbnM9JnF1b3Q7aHR0cDovL2RvY3Mub2FzaXMtb3Blbi5vcmcvb2RhdGEvbnMvZWRtJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sJnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGUvUmVhZE9ubHkmcXVvdDsvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggc3RhdGljIG1hbmRhdG9yeSBDb21wYW55Q29kZSBwcm9wZXJ0eTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtTYWxlc09yZGVyL0NvbXBhbnlDb2RlJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbCZxdW90OyBFbnVtTWVtYmVyPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL01hbmRhdG9yeSZxdW90Oy8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjRmllbGRDb250cm9sICBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGZpZWxkQ29udHJvbDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJGaWVsZENvbnRyb2xcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIiwgXCJSZWNvcmRcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IDMsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgYSBjdXJyZW5jeSBjb2RlIGZvciBhbiBhbW91bnQgYWNjb3JkaW5nIHRvIHRoZSBJU08gNDIxNyBzdGFuZGFyZC4gPGNvZGU+SVNPQ3VycmVuY3k8L2NvZGU+IGFubm90YXRpb24gY2FuIHBvaW50IHRvIGFcblx0XHQgKiA8Y29kZT5Qcm9wZXJ0eTwvY29kZT4sIHdoaWNoIGNhbiBhbHNvIGJlIDxjb2RlPm51bGw8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggUHJpY2UgYW5kIEN1cnJlbmN5Q29kZSBhcyBJU09DdXJyZW5jeTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtTYWxlc09yZGVySXRlbS9QcmljZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O09yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeSZxdW90OyBQYXRoPSZxdW90O0N1cnJlbmN5Q29kZSZxdW90OyAvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogICAgJmx0O1Byb3BlcnR5IE5hbWU9JnF1b3Q7Q3VycmVuY3lDb2RlJnF1b3Q7IHR5cGU9JnF1b3Q7RWRtLlN0cmluZyZxdW90OyAvJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNJU09DdXJyZW5jeSAgT3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGN1cnJlbmN5Q29kZToge1xuXHRcdFx0bmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJJU09DdXJyZW5jeVwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBUaGUgdW5pdCBvZiBtZWFzdXJlIGZvciB0aGlzIG1lYXN1cmVkIHF1YW50aXR5LCBmb3IgZXhhbXBsZSwgY20gZm9yIGNlbnRpbWV0ZXJzLiBSZW5kZXJzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHVuaXQgYW5ub3RhdGlvblxuXHRcdCAqIG9mIGEgPGNvZGU+UHJvcGVydHk8L2NvZGU+LCB3aGljaCBjYW4gYmUgPGNvZGU+bnVsbDwvY29kZT4uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCBPcmRlcmVkUXVhbnRpdHkgYW5kIE9yZGVyZWRVbml0IGFzIFVuaXQ8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7U2FsZXNPcmRlckl0ZW0vT3JkZXJlZFF1YW50aXR5JnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7T3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXQmcXVvdDsgUGF0aD0mcXVvdDtPcmRlcmVkVW5pdCZxdW90OyAvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogICAgJmx0O1Byb3BlcnR5IE5hbWU9JnF1b3Q7T3JkZXJlZFVuaXQmcXVvdDsgdHlwZT0mcXVvdDtFZG0uU3RyaW5nJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vb2FzaXMtdGNzL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLk1lYXN1cmVzLlYxLm1kI1VuaXQgIE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHVuaXRPZk1lYXN1cmU6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVW5pdFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcyBhbm5vdGF0ZWQgd2l0aCB0aGlzIGFubm90YXRpb24gYXJlIHJlbmRlcmVkIGFzIG11bHRpLWxpbmUgdGV4dCwgZS5nLiB0ZXh0IGFyZWEuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCBtdWx0aS1saW5lIHRleHQgRGVzY3JpcHRpb24gcHJvcGVydHk8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtQcm9wZXJ0eSBOYW1lPSZxdW90O0Rlc2NyaXB0aW9uJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtEZXNjcmlwdGlvbiZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTXVsdGlMaW5lVGV4dCZxdW90OyAvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjTXVsdGlMaW5lVGV4dCAgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTXVsdGlMaW5lVGV4dH08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRtdWx0aUxpbmVUZXh0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiTXVsdGlMaW5lVGV4dFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB3aGV0aGVyIGEgPGNvZGU+UHJvcGVydHk8L2NvZGU+IGNhbiBiZSBjcmVhdGVkLiBBIHZhbHVlIGZvciB0aGlzIDxjb2RlPlByb3BlcnR5PC9jb2RlPiBpcyBnZW5lcmF0ZWQgb24gYm90aCBpbnNlcnQgYW5kXG5cdFx0ICogdXBkYXRlIGFjdGlvbnMuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCBjb21wdXRlZCBDcmVhdGVkQnkgcHJvcGVydHk8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7U2FsZXNPcmRlci5TYWxlc09yZGVySXRlbVR5cGUvQ3JlYXRlZEJ5JnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZCZxdW90Oy8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9vYXNpcy10Y3Mvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuQ29yZS5WMS5tZCNDb21wdXRlZCAgT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWR9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0Y29tcHV0ZWQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuQ29yZS5WMVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJDb21wdXRlZFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQSB2YWx1ZSBmb3IgdGhpcyBub24ta2V5IHByb3BlcnR5IGNhbiBiZSBwcm92aWRlZCBvbiA8Y29kZT5pbnNlcnQ8L2NvZGU+IGFuZCBjYW5ub3QgYmUgY2hhbmdlZCBvbiB1cGRhdGUgYWN0aW9ucy5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCB3aXRoIGltbXV0YWJsZSBDcmVhdGVkQnkgcHJvcGVydHk8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7U2FsZXNPcmRlci5TYWxlc09yZGVySXRlbVR5cGUvQ3JlYXRlZEJ5JnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGUmcXVvdDsvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vb2FzaXMtdGNzL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLkNvcmUuVjEubWQjSW1tdXRhYmxlICBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGV9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0aW1tdXRhYmxlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLkNvcmUuVjFcIixcblx0XHRcdGFubm90YXRpb246IFwiSW1tdXRhYmxlXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiB0cnVlLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBDaGFuZ2VzIHRvIHRoZSBzb3VyY2UgcHJvcGVydGllcyBtYXkgaGF2ZSBzaWRlLWVmZmVjdHMgb24gdGhlIHRhcmdldCBwcm9wZXJ0aWVzIG9yIGVudGl0aWVzLiBJZiBuZWl0aGVyIFRhcmdldFByb3BlcnRpZXMgbm9yXG5cdFx0ICogVGFyZ2V0RW50aXRpZXMgYXJlIHNwZWNpZmllZCwgYSBjaGFuZ2UgdG8gdGhlIHNvdXJjZSBwcm9wZXJ0eSB2YWx1ZXMgbWF5IGhhdmUgdW5mb3Jlc2VlYWJsZSBzaWRlLWVmZmVjdHMgYXMgdGhlIGNvcnJlc3BvbmRpbmdcblx0XHQgKiBjaGFuZ2VzIGluIHRoZSBiYWNrZ3JvdW5kIHdpbGwgbm90IGJlIHJlZmxlY3RlZCBpbiB0aGUgVUkuIEFuIGVtcHR5XG5cdFx0ICogTmF2aWdhdGlvblByb3BlcnR5UGF0aCBtYXkgYmUgdXNlZCBpbiBUYXJnZXRFbnRpdGllcyB0byBzcGVjaWZ5IHRoYXQgYW55IHByb3BlcnR5IG9mIHRoZSBhbm5vdGF0ZWQgZW50aXR5IHR5cGUgbWF5IGJlIGFmZmVjdGVkLiBBY3Rpb25zXG5cdFx0ICogYXJlIGEgc3BlY2lhbCBjYXNlOiBoZXJlIHRoZSBjaGFuZ2UgdHJpZ2dlciBpcyB0aGUgYWN0aW9uIGludm9jYXRpb24sIHNvIFNvdXJjZVByb3BlcnRpZXMgYW5kIFNvdXJjZUVudGl0aWVzIGhhdmUgbm8gbWVhbmluZywgb25seVxuXHRcdCAqIFRhcmdldFByb3BlcnRpZXMgYW5kIFRhcmdldEVudGl0aWVzIGFyZSByZWxldmFudC4gVGhleSBhcmUgYWRkcmVzc2VkIHZpYSB0aGUgYmluZGluZyBwYXJhbWV0ZXIgb2YgdGhlIGFjdGlvbi4gPGNvZGU+U2lkZUVmZmVjdHM8L2NvZGU+XG5cdFx0ICogY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gZW50aXR5LCB3aGljaCBjYW4gYmUgYSBjb21wbGV4IHR5cGUsIGVudGl0eSB0eXBlIG9yIGVudGl0eSBzZXQuIEluIGFkZGl0aW9uIHRvIHRoaXMsXG5cdFx0ICogPGNvZGU+U2lkZUVmZmVjdHM8L2NvZGU+IGNhbiBhbHNvIGJlIGFwcGxpZWQgdG8gYSA8Y29kZT5Qcm9wZXJ0eVBhdGg8L2NvZGU+IG9yIGEgPGNvZGU+TmF2aWdhdGlvblByb3BlcnR5UGF0aDwvY29kZT4gb2YgdGhlIGdpdmVuXG5cdFx0ICogZW50aXR5LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggU2lkZSBFZmZlY3Qgd2hlbiB1c2VyIGNoYW5nZXMgYSBzb3VyY2UgcHJvcGVydHkgYW5kIHRoZSBzeXN0ZW0gcmVmcmVzaGVzIHRoZSBwcmljZTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0cyZxdW90OyBRdWFsaWZpZXI9JnF1b3Q7UHJpY2VDaGFuZ2VkJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAmbHQ7UmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1NvdXJjZVByb3BlcnRpZXMmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtBbW91bnQmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgICAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtEaXNjb3VudCZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAgICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O1Byb2R1Y3QmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7VGFyZ2V0UHJvcGVydGllcyZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O1ByaWNlJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjU2lkZUVmZmVjdHMgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0c308L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRzaWRlRWZmZWN0czoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTaWRlRWZmZWN0c1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiQ29tcGxleFR5cGVcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFNwZWNpZmllcyBob3cgdG8gZ2V0IGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcyBmb3IgYSBwcm9wZXJ0eSBvciBwYXJhbWV0ZXIuIFByb3ZpZGVzIHRoZSB2YWx1ZSBoZWxwIGRpYWxvZyBhbmQgdHlwZS1haGVhZCBmdW5jdGlvbi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCBWYWx1ZSBMaXN0IG9uIENhdGVnb3J5IFByb3BlcnR5PC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3QmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7UmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtMYWJlbCZxdW90OyBTdHJpbmc9JnF1b3Q7Q2F0ZWdvcnkmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7Q29sbGVjdGlvblBhdGgmcXVvdDsgU3RyaW5nPSZxdW90O0NhdGVnb3J5JnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1NlYXJjaFN1cHBvcnRlZCZxdW90OyBCb29sPSZxdW90O3RydWUmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7UGFyYW1ldGVycyZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyT3V0JnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtMb2NhbERhdGFQcm9wZXJ0eSZxdW90OyBQcm9wZXJ0eVBhdGg9JnF1b3Q7Q2F0ZWdvcnkmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7VmFsdWVMaXN0UHJvcGVydHkmcXVvdDsgU3RyaW5nPSZxdW90O0Rlc2NyaXB0aW9uJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHkmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1ZhbHVlTGlzdFByb3BlcnR5JnF1b3Q7IFN0cmluZz0mcXVvdDtDYXRlZ29yeU5hbWUmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3QgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3R9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlBhcmFtZXRlclwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQSBsaXN0IG9mIFVSTHMgb2YgQ1NETCBkb2N1bWVudHMgY29udGFpbmluZyB2YWx1ZSBsaXN0IG1hcHBpbmdzIGZvciB0aGlzIHBhcmFtZXRlciBvciBwcm9wZXJ0eS5cblx0XHQgKiBVc2luZyB0aGlzIGFubm90YXRpb24sIHRoZSBPRGF0YSBzZXJ2aWNlIG9ubHkgY29udGFpbnMgYW4gYW5ub3RhdGlvbiB3aXRoIHRoZSBwcm9wZXJ0eSBhcyB0YXJnZXRcblx0XHQgKiBhbmQgdGhlIHRlcm0gY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXMgcG9pbnRpbmcgdG8gdGhlIG1ldGFkYXRhIG9mIHRoZSB2YWx1ZSBsaXN0IHNlcnZpY2UuXG5cdFx0ICogVGhlIFZhbHVlTGlzdCBhbm5vdGF0aW9uIGl0c2VsZiBpcyBpbiB0aGUgcmVmZXJlbmNlZCBzZXJ2aWNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IFZhbHVlIExpc3QgUmVmZXJlbmNlcyBvbiBPcmlnaW5hbEFydGlzdCBQcm9wZXJ0eTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD1cInNhbXBsZS5UaXRsZXNUeXBlL09yaWdpbmFsQXJ0aXN0XCImZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXNcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1N0cmluZyZndDsuLi9pX3Y0X2FydGlzdG5hbWUvJG1ldGFkYXRhJmx0Oy9TdHJpbmcmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtTdHJpbmcmZ3Q7Li4vaV92NF9hcnRpc3RwZXJzb24vJG1ldGFkYXRhJmx0Oy9TdHJpbmcmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3RSZWZlcmVuY2VzICBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVmZXJlbmNlc308L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR2YWx1ZUxpc3RSZWZlcmVuY2VzOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdFJlZmVyZW5jZXNcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIiwgXCJQYXJhbWV0ZXJcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFNwZWNpZmllcyB0aGUgbWFwcGluZyBiZXR3ZWVuIGRhdGEgc2VydmljZSBwcm9wZXJ0aWVzIGFuZCB2YWx1ZSBsaXN0IHByb3BlcnRpZXMuXG5cdFx0ICogVGhlIHZhbHVlIGxpc3QgY2FuIGJlIGZpbHRlcmVkIGJhc2VkIG9uIHVzZXIgaW5wdXQuIEl0IGNhbiBiZSB1c2VkIGZvciB0eXBlLWFoZWFkIGFuZCBjbGFzc2ljYWwgcGljayBsaXN0cy5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCBWYWx1ZSBMaXN0IE1hcHBpbmcgb24gQ291bnRyeSBQcm9wZXJ0eTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwic2FtcGxlLklfQUlWU19SZWdpb25UeXBlL0NvdW50cnlcIiZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1wiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDtSZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiQ29sbGVjdGlvblBhdGhcIiBTdHJpbmc9XCJJX0FJVlNfQ291bnRyeUNvZGVcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlBhcmFtZXRlcnNcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dFwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxvY2FsRGF0YVByb3BlcnR5XCIgUHJvcGVydHlQYXRoPVwiQ291bnRyeVwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVMaXN0UHJvcGVydHlcIiBTdHJpbmc9XCJDb3VudHJ5Q29kZVwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDsvUHJvcGVydHlWYWx1ZSZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjVmFsdWVMaXN0TWFwcGluZyAgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmd9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0TWFwcGluZzoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJWYWx1ZUxpc3RNYXBwaW5nXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCIsIFwiUGFyYW1ldGVyXCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiBudWxsLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBTcGVjaWZpZXMgaWYgYSBEYXRhRmllbGQgaXMgcmVuZGVyZWQgYXMgYSBlbWFpbCBsaW5rLiBUaGUgbGluayBsYXVuY2hlcyB0aGUgYnJvd3NlciBlbWFpbCBhY3Rpb24uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgRGF0YUZpZWxkIHdpdGggZW1haWwgbGluayBjb250ZW50PC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwic2FwLmZlLm1hbmFnZWl0ZW1zLlRlY2huaWNhbFRlc3RpbmdTZXJ2aWNlLkxpbmVJdGVtcy9lbWFpbEFkZHJlc3NcIiZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJDb21tb24uTGFiZWxcIiBTdHJpbmc9XCJFbWFpbFwiLyZndDtcblx0XHQgKiAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJDb21tdW5pY2F0aW9uLklzRW1haWxBZGRyZXNzXCIgQm9vbD1cInRydWVcIi8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKi9cblx0XHRpc0VtYWlsQWRkcmVzczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiSXNFbWFpbEFkZHJlc3NcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IHRydWUsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFNwZWNpZmllcyBpZiBhIERhdGFGaWVsZCBpcyByZW5kZXJlZCBhcyBhIHBob25lIGxpbmsuIFRoZSBsaW5rIGxhdW5jaGVzIHRoZSBicm93c2VyIHBob25lIGFjdGlvbi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCBEYXRhRmllbGQgd2l0aCBwaG9uZSBsaW5rIGNvbnRlbnQ8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJzYXAuZmUubWFuYWdlaXRlbXMuVGVjaG5pY2FsVGVzdGluZ1NlcnZpY2UuTGluZUl0ZW1zL3Bob25lTnVtYmVyXCImZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiQ29tbW9uLkxhYmVsXCIgU3RyaW5nPVwiTW9iaWxlXCIvJmd0O1xuXHRcdCAqICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cIkNvbW11bmljYXRpb24uSXNQaG9uZU51bWJlclwiIEJvb2w9XCJ0cnVlXCIvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICovXG5cdFx0aXNQaG9uZU51bWJlcjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiSXNQaG9uZU51bWJlclwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH1cblx0fVxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFB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