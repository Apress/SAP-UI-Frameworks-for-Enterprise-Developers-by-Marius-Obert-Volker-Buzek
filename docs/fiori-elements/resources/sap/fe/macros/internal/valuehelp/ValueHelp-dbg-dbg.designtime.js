/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
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
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsInZhbHVlTGlzdCIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsInZhbHVlTGlzdE1hcHBpbmciLCJ2YWx1ZUxpc3RSZWZlcmVuY2VzIiwidmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHkiLCJ2YWx1ZUxpc3RQYXJhbWV0ZXJJbiIsInZhbHVlTGlzdFBhcmFtZXRlckluT3V0IiwidmFsdWVMaXN0UGFyYW1ldGVyT3V0IiwidmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiaW1wb3J0YW5jZSIsInNlYXJjaFJlc3RyaWN0aW9ucyIsImhpZGRlbiIsImhpZGRlbkZpbHRlciIsImxhYmVsIiwidGV4dCIsImlTT0N1cnJlbmN5IiwidW5pdCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwLmRlc2lnbnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRhbm5vdGF0aW9uczoge1xuXHRcdC8qKlxuXHRcdCAqIFNwZWNpZmllcyBob3cgdG8gZ2V0IGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcyBmb3IgYSBwcm9wZXJ0eSBvciBwYXJhbWV0ZXIuXG5cdFx0ICogVGhlIHZhbHVlIGxpc3QgY2FuIGJlIGJhc2VkIG9uIHVzZXIgaW5wdXQgdGhhdCBpcyBwYXNzZWQgaW4gdGhlIHZhbHVlIGxpc3QgcmVxdWVzdC5cblx0XHQgKiBUaGUgdmFsdWUgbGlzdCBjYW4gYmUgdXNlZCBmb3IgdHlwZS1haGVhZCBhbmQgY2xhc3NpY2FsIHBpY2sgbGlzdHMuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwic2FtcGxlLlNhbGVzT3JkZXJJdGVtLk1hdGVyaWFsXCImZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiQ29sbGVjdGlvblBhdGhcIiBTdHJpbmc9XCJNYXRlcmlhbEJ5U2xzT3JnRGlzdHJDaG5sXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJQYXJhbWV0ZXJzXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMb2NhbERhdGFQcm9wZXJ0eVwiIFByb3BlcnR5UGF0aD1cIk1hdGVyaWFsXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJWYWx1ZUxpc3RQcm9wZXJ0eVwiIFN0cmluZz1cIk1hdGVyaWFsXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5cIiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMb2NhbERhdGFQcm9wZXJ0eVwiIFByb3BlcnR5UGF0aD1cIkRpc3RyaWJ1dGlvbkNoYW5uZWxcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlTGlzdFByb3BlcnR5XCIgU3RyaW5nPVwiRGlzdHJpYnV0aW9uQ2hhbm5lbFwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTG9jYWxEYXRhUHJvcGVydHlcIiBQcm9wZXJ0eVBhdGg9XCJTYWxlc09yZ2FuaXphdGlvblwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVMaXN0UHJvcGVydHlcIiBTdHJpbmc9XCJTYWxlc09yZ2FuaXphdGlvblwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlck91dFwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkxvY2FsRGF0YVByb3BlcnR5XCIgUHJvcGVydHlQYXRoPVwiUmVxdWVzdGVkUXVhbnRpdHlVbml0XCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJWYWx1ZUxpc3RQcm9wZXJ0eVwiIFN0cmluZz1cIlJlcXVlc3RlZFF1YW50aXR5VW5pdFwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckRpc3BsYXlPbmx5XCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVMaXN0UHJvcGVydHlcIiBTdHJpbmc9XCJNYXRlcmlhbE5hbWVcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1ZhbHVlTGlzdCBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0fTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR2YWx1ZUxpc3Q6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVmFsdWVMaXN0XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCIsIFwiUGFyYW1ldGVyXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBTcGVjaWZpZXMgdGhlIG1hcHBpbmcgYmV0d2VlbiBkYXRhIHNlcnZpY2UgcHJvcGVydGllcyBhbmQgdmFsdWUgbGlzdCBwcm9wZXJ0aWVzLlxuXHRcdCAqIFRoZSB2YWx1ZSBsaXN0IGNhbiBiZSBmaWx0ZXJlZCBiYXNlZCBvbiB1c2VyIGlucHV0LiBJdCBjYW4gYmUgdXNlZCBmb3IgdHlwZS1haGVhZCBhbmQgY2xhc3NpY2FsIHBpY2sgbGlzdHMuXG5cdFx0ICogVGhlcmUgbWF5IGJlIG1hbnkgYWx0ZXJuYXRpdmUgbWFwcGluZ3Mgd2l0aCBkaWZmZXJlbnQgcXVhbGlmaWVycy5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJzYW1wbGUuSV9BSVZTX1JlZ2lvblR5cGUvQ291bnRyeVwiJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0O1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJDb2xsZWN0aW9uUGF0aFwiIFN0cmluZz1cIklfQUlWU19Db3VudHJ5Q29kZVwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiUGFyYW1ldGVyc1wiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTG9jYWxEYXRhUHJvcGVydHlcIiBQcm9wZXJ0eVBhdGg9XCJDb3VudHJ5XCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJWYWx1ZUxpc3RQcm9wZXJ0eVwiIFN0cmluZz1cIkNvdW50cnlDb2RlXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3RNYXBwaW5nIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nfTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR2YWx1ZUxpc3RNYXBwaW5nOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdE1hcHBpbmdcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIiwgXCJQYXJhbWV0ZXJcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIEEgbGlzdCBvZiBVUkxzIG9mIENTREwgZG9jdW1lbnRzIGNvbnRhaW5pbmcgdmFsdWUgbGlzdCBtYXBwaW5ncyBmb3IgdGhpcyBwYXJhbWV0ZXIgb3IgcHJvcGVydHkuXG5cdFx0ICogVXNpbmcgdGhpcyBhbm5vdGF0aW9uLCB0aGUgT0RhdGEgc2VydmljZSBvbmx5IGNvbnRhaW5zIGFuIGFubm90YXRpb24gd2l0aCB0aGUgcHJvcGVydHkgYXMgdGFyZ2V0XG5cdFx0ICogYW5kIHRoZSB0ZXJtIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzIHBvaW50aW5nIHRvIHRoZSBtZXRhZGF0YSBvZiB0aGUgdmFsdWUgbGlzdCBzZXJ2aWNlLlxuXHRcdCAqIFRoZSBWYWx1ZUxpc3QgYW5ub3RhdGlvbiBpdHNlbGYgaXMgaW4gdGhlIHJlZmVyZW5jZWQgc2VydmljZS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJzYW1wbGUuVGl0bGVzVHlwZS9PcmlnaW5hbEFydGlzdFwiJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtTdHJpbmcmZ3Q7Li4vaV92NF9hcnRpc3RuYW1lLyRtZXRhZGF0YSZsdDsvU3RyaW5nJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjVmFsdWVMaXN0UmVmZXJlbmNlcyBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVmZXJlbmNlc308L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0UmVmZXJlbmNlczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJWYWx1ZUxpc3RSZWZlcmVuY2VzXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCIsIFwiUGFyYW1ldGVyXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBWYWx1ZSBsaXN0IHByb3BlcnR5IHRoYXQgaXMgbm90IHVzZWQgdG8gZmlsbCB0aGUgZWRpdGVkIGVudGl0eS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uOiBTZWUgZXhhbXBsZSBmb3IgYW5ub3RhdGlvbiBWYWx1ZUxpc3Q8L2k+XG5cdFx0ICogPGJyPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3RQYXJhbWV0ZXJEaXNwbGF5T25seSBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHl9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHZhbHVlTGlzdFBhcmFtZXRlckRpc3BsYXlPbmx5OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdFBhcmFtZXRlckRpc3BsYXlPbmx5XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5UGF0aFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVmFsdWUgbGlzdCBwcm9wZXJ0eSB0aGF0IGlzIHVzZWQgdG8gZmlsdGVyIHRoZSB2YWx1ZSBsaXN0IHdpdGggJ2VxIGNvbXBhcmlzb24nLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb246IFNlZSBleGFtcGxlIGZvciBhbm5vdGF0aW9uIFZhbHVlTGlzdDwvaT5cblx0XHQgKiA8YnI+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UeXBlIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1ZhbHVlTGlzdFBhcmFtZXRlckluIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJJbn08L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0UGFyYW1ldGVySW46IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVmFsdWVMaXN0UGFyYW1ldGVySW5cIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlQYXRoXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBWYWx1ZSBsaXN0IHByb3BlcnR5IHRoYXQgaXMgdXNlZCB0byBmaWx0ZXIgdGhlIHZhbHVlIGxpc3Qgd2l0aCAnc3RhcnRzd2l0aCBjb21wYXJpc29uJyBhbmQgZmlsbGVkIGZyb20gdGhlIHBpY2tlZCB2YWx1ZSBsaXN0IGl0ZW0uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjogU2VlIGV4YW1wbGUgZm9yIGFubm90YXRpb24gVmFsdWVMaXN0PC9pPlxuXHRcdCAqIDxicj5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlR5cGUgPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0fTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR2YWx1ZUxpc3RQYXJhbWV0ZXJJbk91dDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJWYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVBhdGhcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFZhbHVlIGxpc3QgcHJvcGVydHkgdGhhdCBpcyBmaWxsZWQgZnJvbSB0aGUgcmVzcG9uc2UuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjogU2VlIGV4YW1wbGUgZm9yIGFubm90YXRpb24gVmFsdWVMaXN0PC9pPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VHlwZSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3RQYXJhbWV0ZXJPdXQgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlck91dH08L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0UGFyYW1ldGVyT3V0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdFBhcmFtZXRlck91dFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVBhdGhcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIElmIHNwZWNpZmllZCBhcyB0cnVlLCB0aGVyZSBpcyBvbmx5IG9uZSB2YWx1ZSBsaXN0IG1hcHBpbmcgYW5kIGl0cyB2YWx1ZSBsaXN0IGNvbnNpc3RzIG9mIGEgc21hbGwgbnVtYmVyIG9mIGZpeGVkIHZhbHVlcy5cblx0XHQgKiBUaGUgdmFsdWUgbGlzdCBpcyBzaG93biBhcyBhIGRyb3Bkb3duIGxpc3QgYm94IHJhdGhlciB0aGFuIGFuIGlucHV0IGZpZWxkLiBObyB2YWx1ZSBoZWxwIHBvcHVwIGlzIHVzZWQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwic2FtcGxlLlByb2R1Y3RzL3ByaWNlUmFuZ2VfY29kZVwiJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cIkNvbW1vbi5WYWx1ZUxpc3RcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJDb21tb24uVmFsdWVMaXN0VHlwZVwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkNvbGxlY3Rpb25QYXRoXCIgU3RyaW5nPVwiUHJpY2VSYW5nZVwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiUGFyYW1ldGVyc1wiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiQ29tbW9uLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTG9jYWxEYXRhUHJvcGVydHlcIiBQcm9wZXJ0eVBhdGg9XCJwcmljZVJhbmdlX2NvZGVcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlTGlzdFByb3BlcnR5XCIgU3RyaW5nPVwiY29kZVwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiQ29tbW9uLlZhbHVlTGlzdFBhcmFtZXRlckRpc3BsYXlPbmx5XCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVMaXN0UHJvcGVydHlcIiBTdHJpbmc9XCJuYW1lXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cIkNvbW1vbi5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcIiBCb29sPVwidHJ1ZVwiIC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UeXBlIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzfTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR2YWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCIsIFwiUGFyYW1ldGVyXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBFeHByZXNzZXMgdGhlIGltcG9ydGFuY2Ugb2YgYSBEYXRhRmllbGQgb3IgYW4gYW5ub3RhdGlvbiwgZm9yIGV4YW1wbGUuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJzYW1wbGUuUGVyc29uXCImZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkZpcnN0IG5hbWVcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlXCIgU3RyaW5nPVwiRmlyc3ROYW1lXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VcIiBFbnVtTWVtYmVyPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVR5cGUvSGlnaFwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjSW1wb3J0YW5jZSBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlfTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRpbXBvcnRhbmNlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiSW1wb3J0YW5jZVwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJBbm5vdGF0aW9uXCIsIFwiUmVjb3JkXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoYXQgdGhlIHNlYXJjaCBmaWVsZCBpbiB0aGUgZmlsdGVyIGJhciBpcyBlbmFibGVkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gdGFrZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5GaWx0ZXJCYXIjYW5ub3RhdGlvbnMvU2VhcmNoUmVzdHJpY3Rpb25zfTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJzZXJ2aWNlLlNhbGVzT3JkZXJNYW5hZ2VcIiZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc1wiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDtSZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiU2VhcmNoYWJsZVwiIEJvb2w9XCJ0cnVlXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9vYXNpcy10Y3Mvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLm1kI1NlYXJjaFJlc3RyaWN0aW9ucyBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc308L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0c2VhcmNoUmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZWFyY2hSZXN0cmljdGlvbnNcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5U2V0XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoYXQgYSBwcm9wZXJ0eSBpcyBub3QgZGlzcGxheWVkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBoaWRkZW4gUHJvZHVjdFVVSUQgdGFrZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZCNhbm5vdGF0aW9ucy9IaWRkZW59PC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtQcm9kdWN0Q29sbGVjdGlvbi5Qcm9kdWN0L1Byb2R1Y3RVVUlEJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4mcXVvdDsgLyZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNIaWRkZW4gY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVufTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRoaWRkZW46IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJIaWRkZW5cIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIiwgXCJSZWNvcmRcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgdGhhdCBhIHByb3BlcnR5IGlzIG5vdCBkaXNwbGF5ZWQgYXMgYSBmaWx0ZXIuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB3aXRoIGludmlzaWJsZSwgZmlsdGVyYWJsZSBwcm9wZXJ0eSBcIkxvY2F0aW9uTmFtZVwiLCB0YWtlbiBmcm9tIHtAbGluayBzYXAuZmUubWFjcm9zLmludGVybmFsLkZpbHRlckZpZWxkI2Fubm90YXRpb25zL0hpZGRlbkZpbHRlcn08L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtMb2NhdGlvbk5hbWUmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlciZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hpZGRlbkZpbHRlciBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXJ9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGhpZGRlbkZpbHRlcjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkhpZGRlbkZpbHRlclwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQSBzaG9ydCwgaHVtYW4tcmVhZGFibGUgdGV4dCBzdWl0YWJsZSBmb3IgbGFiZWxzIGFuZCBjYXB0aW9ucyBvbiBVSXMuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuQ3VzdG9tZXIvQ3VzdG9tZXImcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbCZxdW90OyBTdHJpbmc9JnF1b3Q7Q3VzdG9tZXImcXVvdDsgLyZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjTGFiZWwgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsfTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRsYWJlbDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJMYWJlbFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQSBkZXNjcmlwdGl2ZSB0ZXh0IGZvciB2YWx1ZXMgb2YgdGhlIGFubm90YXRlZCBwcm9wZXJ0eS4gVmFsdWUgTVVTVCBiZSBhIGR5bmFtaWMgZXhwcmVzc2lvbiB3aGVuIHVzZWQgYXMgbWV0YWRhdGEgYW5ub3RhdGlvbi5cblx0XHQgKiBPbmx5IHRoZSB0ZXh0IGFubm90YXRpb24gb2YgdGhlIGtleSBmb3IgdGhlIFZhbHVlSGVscCBjYW4gc3BlY2lmeSB0aGUgZGVzY3JpcHRpb24uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuQ3VzdG9tZXIvQ3VzdG9tZXImcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0JnF1b3Q7IFBhdGg9JnF1b3Q7Q3VzdG9tZXJOYW1lJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1RleHQgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHR9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHRleHQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVGV4dFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVGhlIGN1cnJlbmN5IGZvciB0aGlzIG1vbmV0YXJ5IGFtb3VudCBhcyBhbiBJU08gNDIxNyBjdXJyZW5jeSBjb2RlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gdGFsZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZCNhbm5vdGF0aW9ucy9JU09DdXJyZW5jeX08L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtzZXJ2aWNlLlNhbGVzT3JkZXJJdGVtL05ldEFtb3VudCZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7T3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5JnF1b3Q7IFBhdGg9JnF1b3Q7VHJhbnNhY3Rpb25DdXJyZW5jeSZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNJU09DdXJyZW5jeSBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3l9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGlTT0N1cnJlbmN5OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIklTT0N1cnJlbmN5XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGUgdW5pdCBvZiBtZWFzdXJlIGZvciB0aGlzIG1lYXN1cmVkIHF1YW50aXR5LCBlLmcuIGNtIGZvciBjZW50aW1ldGVycyBvciAlIGZvciBwZXJjZW50YWdlcy5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHRha2VuIGZyb20ge0BsaW5rIHNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuRmllbGQjYW5ub3RhdGlvbnMvVW5pdH08L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtzZXJ2aWNlLlNhbGVzT3JkZXJJdGVtL1JlcXVlc3RlZFF1YW50aXR5JnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdCZxdW90OyBQYXRoPSZxdW90O1JlcXVlc3RlZFF1YW50aXR5VW5pdCZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNVbml0IE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0fTwvYj5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR1bml0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlVuaXRcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7U0FBZTtJQUNkQSxXQUFXLEVBQUU7TUFDWjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VDLFNBQVMsRUFBRTtRQUNWQyxTQUFTLEVBQUUsZ0NBQWdDO1FBQzNDQyxVQUFVLEVBQUUsV0FBVztRQUN2QkMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztRQUNqQ0MsS0FBSyxFQUFF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