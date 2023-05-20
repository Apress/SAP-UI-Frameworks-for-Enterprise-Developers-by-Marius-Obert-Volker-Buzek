/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
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
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImZpbHRlclJlc3RyaWN0aW9ucyIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsImhpZGRlbiIsImhpZGRlbkZpbHRlciIsImxhYmVsIiwidGV4dCIsInRleHRBcnJhbmdlbWVudCIsImlTT0N1cnJlbmN5IiwidW5pdCIsInZhbHVlTGlzdCIsInZhbHVlTGlzdE1hcHBpbmciLCJ2YWx1ZUxpc3RSZWZlcmVuY2VzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJGaWVsZC5kZXNpZ250aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcblx0YW5ub3RhdGlvbnM6IHtcblx0XHQvKipcblx0XHQgKiBBbm5vdGF0aW9uIHRvIHNldCByZXN0cmljdGlvbnMgb24gZmlsdGVyIGV4cHJlc3Npb25zLlxuXHRcdCAqIFRoZSBmaWx0ZXIgZmllbGQgd2lsbCBub3QgYmUgY3JlYXRlZCwgaWYgaXQgaXMgbWVudGlvbmVkIGluIGEgY29sbGVjdGlvbiBvZiBOb25GaWx0ZXJhYmxlUHJvcGVydGllcyBvZiB0aGUgZW50aXR5U2V0LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb248L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuQnVzaW5lc3NQYXJ0bmVyVHlwZSZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7T3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnMmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0O1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7Tm9uRmlsdGVyYWJsZVByb3BlcnRpZXMmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O1JlZ2lvbiZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7SW5mbyZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vb2FzaXMtdGNzL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5tZCNGaWx0ZXJSZXN0cmljdGlvbnMgT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnN9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGZpbHRlclJlc3RyaWN0aW9uczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjFcIixcblx0XHRcdGFubm90YXRpb246IFwiRmlsdGVyUmVzdHJpY3Rpb25zXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoYXQgYSBwcm9wZXJ0eSBpcyBub3QgZGlzcGxheWVkLiBBcyBhIGNvbnNlcXVlbmNlIHRoZSBmaWx0ZXIgZmllbGQgd2lsbCBub3QgYmUgY3JlYXRlZCBieSB0aGUgbWFjcm8uXG5cdFx0ICogSW4gY29udHJhc3QgdG8gPGNvZGU+SGlkZGVuRmlsdGVyPC9jb2RlPiwgYSBwcm9wZXJ0eSBhbm5vdGF0ZWQgd2l0aCA8Y29kZT5IaWRkZW48L2NvZGU+IGlzIG5vdCB1c2VkIGFzIGEgZmlsdGVyLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBoaWRkZW4gUHJvZHVjdFVVSUQgdGFrZW4gZm9ybSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZCNhbm5vdGF0aW9ucy9IaWRkZW59PC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtzZXJ2aWNlLlByb2R1Y3QvUHJvZHVjdFVVSUQmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbiZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hpZGRlbiBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW59PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGhpZGRlbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkhpZGRlblwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlJlY29yZFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB0aGF0IGEgcHJvcGVydHkgaXMgbm90IGRpc3BsYXllZCBhcyBhIGZpbHRlci4gQXMgYSBjb25zZXF1ZW5jZSB0aGUgZmlsdGVyIGZpZWxkIHdpbGwgbm90IGJlIGNyZWF0ZWQgYnkgdGhlIG1hY3JvLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBpbnZpc2libGUsIGZpbHRlcmFibGUgcHJvcGVydHkgXCJMb2NhdGlvbk5hbWVcIjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuQWRkcmVzcy9Mb2NhdGlvbk5hbWUmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlciZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hpZGRlbkZpbHRlciBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXJ9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGhpZGRlbkZpbHRlcjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkhpZGRlbkZpbHRlclwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxhYmVsIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb248L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtzZXJ2aWNlLkN1c3RvbWVyL0N1c3RvbWVyJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWwmcXVvdDsgU3RyaW5nPSZxdW90O0N1c3RvbWVyJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI0xhYmVsIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbH08L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0bGFiZWw6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiTGFiZWxcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQSBkZXNjcmlwdGl2ZSB0ZXh0IGZvciB2YWx1ZXMgb2YgdGhlIGFubm90YXRlZCBwcm9wZXJ0eS4gVmFsdWUgTVVTVCBiZSBhIGR5bmFtaWMgZXhwcmVzc2lvbiB3aGVuIHVzZWQgYXMgbWV0YWRhdGEgYW5ub3RhdGlvbi5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7c2VydmljZS5DdXN0b21lci9DdXN0b21lciZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHQmcXVvdDsgUGF0aD0mcXVvdDtDdXN0b21lck5hbWUmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjVGV4dCBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dH08L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dGV4dDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJUZXh0XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIERlc2NyaWJlcyB0aGUgYXJyYW5nZW1lbnQgb2YgYSBjb2RlIG9yIElEIHZhbHVlIGFuZCBpdHMgdGV4dC5cblx0XHQgKiBJZiB1c2VkIGZvciBhIHNpbmdsZSBwcm9wZXJ0eSB0aGUgQ29tbW9uLlRleHQgYW5ub3RhdGlvbiBpcyBhbm5vdGF0ZWQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbjwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuQ3VzdG9tZXIvQ3VzdG9tZXImcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0JnF1b3Q7IFBhdGg9JnF1b3Q7Q3VzdG9tZXJOYW1lJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50JnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0Rmlyc3QmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI1RleHRBcnJhbmdlbWVudCBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnR9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHRleHRBcnJhbmdlbWVudDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlRleHRBcnJhbmdlbWVudFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJBbm5vdGF0aW9uXCIsIFwiRW50aXR5VHlwZVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVGhlIGN1cnJlbmN5IGZvciB0aGlzIG1vbmV0YXJ5IGFtb3VudCBhcyBhbiBJU08gNDIxNyBjdXJyZW5jeSBjb2RlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gdGFrZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZCNhbm5vdGF0aW9ucy9JU09DdXJyZW5jeX08L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtzZXJ2aWNlLlNhbGVzT3JkZXJJdGVtL05ldEFtb3VudCZxdW90OyZndDtcblx0XHQgKiAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7T3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5JnF1b3Q7IFBhdGg9JnF1b3Q7VHJhbnNhY3Rpb25DdXJyZW5jeSZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNJU09DdXJyZW5jeSBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3l9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGlTT0N1cnJlbmN5OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIklTT0N1cnJlbmN5XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGUgdW5pdCBvZiBtZWFzdXJlIGZvciB0aGlzIG1lYXN1cmVkIHF1YW50aXR5LCBlLmcuIGNtIGZvciBjZW50aW1ldGVycyBvciAlIGZvciBwZXJjZW50YWdlc1xuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gdGFrZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZCNhbm5vdGF0aW9ucy9Vbml0fTwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O3NlcnZpY2UuU2FsZXNPcmRlckl0ZW0vUmVxdWVzdGVkUXVhbnRpdHkmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O09yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0JnF1b3Q7IFBhdGg9JnF1b3Q7UmVxdWVzdGVkUXVhbnRpdHlVbml0JnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vb2FzaXMtdGNzL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLk1lYXN1cmVzLlYxLm1kI1VuaXQgT3JnLk9EYXRhLk1lYXN1cmVzLlYxLlVuaXR9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHVuaXQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVW5pdFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogU3BlY2lmaWVzIGhvdyB0byBnZXQgYSBsaXN0IG9mIGFjY2VwdGFibGUgdmFsdWVzIGZvciBhIHByb3BlcnR5IG9yIHBhcmFtZXRlci5cblx0XHQgKiBUaGUgdmFsdWUgbGlzdCBjYW4gYmUgYmFzZWQgb24gdXNlciBpbnB1dCB0aGF0IGlzIHBhc3NlZCBpbiB0aGUgdmFsdWUgbGlzdCByZXF1ZXN0LlxuXHRcdCAqIFRoZSB2YWx1ZSBsaXN0IGNhbiBiZSB1c2VkIGZvciB0eXBlLWFoZWFkIGFuZCBjbGFzc2ljYWwgcGljayBsaXN0cy5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHRha2VuIGZyb20ge0BsaW5rIHNhcC5mZS5tYWNyb3MuVmFsdWVIZWxwI2Fubm90YXRpb25zL1ZhbHVlTGlzdH08L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD1cInNlcnZpY2UuSGVhZGVyU2hpcFRvUGFydHkvQnVzaW5lc3NQYXJ0bmVyXCImZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiQ29sbGVjdGlvblBhdGhcIiBTdHJpbmc9XCJDdXN0b21lclwiIC8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiUGFyYW1ldGVyc1wiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTG9jYWxEYXRhUHJvcGVydHlcIiBQcm9wZXJ0eVBhdGg9XCJCdXNpbmVzc1BhcnRuZXJcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlTGlzdFByb3BlcnR5XCIgU3RyaW5nPVwiQ3VzdG9tZXJcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDtSZWNvcmQgVHlwZT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJEaXNwbGF5T25seVwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlTGlzdFByb3BlcnR5XCIgU3RyaW5nPVwiQ3VzdG9tZXJOYW1lXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL0NvbW1vbi5tZCNWYWx1ZUxpc3QgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdH08L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlZhbHVlTGlzdFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlBhcmFtZXRlclwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogU3BlY2lmaWVzIHRoZSBtYXBwaW5nIGJldHdlZW4gZGF0YSBzZXJ2aWNlIHByb3BlcnRpZXMgYW5kIHZhbHVlIGxpc3QgcHJvcGVydGllcy5cblx0XHQgKiBUaGUgdmFsdWUgbGlzdCBjYW4gYmUgZmlsdGVyZWQgYmFzZWQgb24gdXNlciBpbnB1dC4gSXQgY2FuIGJlIHVzZWQgZm9yIHR5cGUtYWhlYWQgYW5kIGNsYXNzaWNhbCBwaWNrIGxpc3RzLlxuXHRcdCAqIFRoZXJlIG1heSBiZSBtYW55IGFsdGVybmF0aXZlIG1hcHBpbmdzIHdpdGggZGlmZmVyZW50IHF1YWxpZmllcnMuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB0YWtlbiBmcm9tIHtAbGluayBzYXAuZmUubWFjcm9zLlZhbHVlSGVscCNhbm5vdGF0aW9ucy9WYWx1ZUxpc3RNYXBwaW5nfTwvaT5cblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwic2VydmljZS5JX0FJVlNfUmVnaW9uVHlwZS9Db3VudHJ5XCImZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkNvbGxlY3Rpb25QYXRoXCIgU3RyaW5nPVwiSV9BSVZTX0NvdW50cnlDb2RlXCIgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJQYXJhbWV0ZXJzXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMb2NhbERhdGFQcm9wZXJ0eVwiIFByb3BlcnR5UGF0aD1cIkNvdW50cnlcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlTGlzdFByb3BlcnR5XCIgU3RyaW5nPVwiQ291bnRyeUNvZGVcIiAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1ZhbHVlTGlzdE1hcHBpbmcgY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmd9PC9iPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHZhbHVlTGlzdE1hcHBpbmc6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVmFsdWVMaXN0TWFwcGluZ1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlBhcmFtZXRlclwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQSBsaXN0IG9mIFVSTHMgb2YgQ1NETCBkb2N1bWVudHMgY29udGFpbmluZyB2YWx1ZSBsaXN0IG1hcHBpbmdzIGZvciB0aGlzIHBhcmFtZXRlciBvciBwcm9wZXJ0eS5cblx0XHQgKiBVc2luZyB0aGlzIGFubm90YXRpb24sIHRoZSBPRGF0YSBzZXJ2aWNlIG9ubHkgY29udGFpbnMgYW4gYW5ub3RhdGlvbiB3aXRoIHRoZSBwcm9wZXJ0eSBhcyB0YXJnZXRcblx0XHQgKiBhbmQgdGhlIHRlcm0gY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXMgcG9pbnRpbmcgdG8gdGhlIG1ldGFkYXRhIG9mIHRoZSB2YWx1ZSBsaXN0IHNlcnZpY2UuXG5cdFx0ICogVGhlIFZhbHVlTGlzdCBhbm5vdGF0aW9uIGl0c2VsZiBpcyBpbiB0aGUgcmVmZXJlbmNlZCBzZXJ2aWNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gdGFrZW4gZnJvbSB7QGxpbmsgc2FwLmZlLm1hY3Jvcy5WYWx1ZUhlbHAjYW5ub3RhdGlvbnMvVmFsdWVMaXN0UmVmZXJlbmNlc308L2k+XG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD1cInNlcnZpY2UuVGl0bGVzVHlwZS9PcmlnaW5hbEFydGlzdFwiJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtTdHJpbmcmZ3Q7Li4vaV92NF9hcnRpc3RuYW1lLyRtZXRhZGF0YSZsdDsvU3RyaW5nJmd0O1xuXHRcdCAqICAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9Db21tb24ubWQjVmFsdWVMaXN0UmVmZXJlbmNlcyBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVmZXJlbmNlc308L2I+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0dmFsdWVMaXN0UmVmZXJlbmNlczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJWYWx1ZUxpc3RSZWZlcmVuY2VzXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCIsIFwiUGFyYW1ldGVyXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fVxuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O1NBQWU7SUFDZEEsV0FBVyxFQUFFO01BQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFQyxrQkFBa0IsRUFBRTtRQUNuQkMsU0FBUyxFQUFFLDJCQUEyQjtRQUN0Q0MsVUFBVSxFQUFFLG9CQUFvQjtRQUNoQ0MsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDO1FBQ3JCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFQyxNQUFNLEVBQUU7UUFDUEosU0FBUyxFQUFFLDRCQUE0QjtRQUN2Q0MsVUFBVSxFQUFFLFFBQVE7UUFDcEJDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDOUJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUUsWUFBWSxFQUFFO1FBQ2JMLFNBQVMsRUFBRSw0QkFBNEI7UUFDdkNDLFVBQVUsRUFBRSxjQUFjO1FBQzFCQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDcEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUcsS0FBSyxFQUFFO1FBQ05OLFNBQVMsRUFBRSxnQ0FBZ0M7UUFDM0NDLFVBQVUsRUFBRSxPQUFPO1FBQ25CQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDcEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUksSUFBSSxFQUFFO1FBQ0xQLFNBQVMsRUFBRSxnQ0FBZ0M7UUFDM0NDLFVBQVUsRUFBRSxNQUFNO1FBQ2xCQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDcEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUssZUFBZSxFQUFFO1FBQ2hCUixTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO1FBQ3BDQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VNLFdBQVcsRUFBRTtRQUNaVCxTQUFTLEVBQUUsdUJBQXVCO1FBQ2xDQyxVQUFVLEVBQUUsYUFBYTtRQUN6QkMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQ3BCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VPLElBQUksRUFBRTtRQUNMVixTQUFTLEVBQUUsdUJBQXVCO1FBQ2xDQyxVQUFVLEVBQUUsTUFBTTtRQUNsQkMsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQ3BCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFUSxTQUFTLEVBQUU7UUFDVlgsU0FBUyxFQUFFLGdDQUFnQztRQUMzQ0MsVUFBVSxFQUFFLFdBQVc7UUFDdkJDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDakNDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VTLGdCQUFnQixFQUFFO1FBQ2pCWixTQUFTLEVBQUUsZ0NBQWdDO1FBQzNDQyxVQUFVLEVBQUUsa0JBQWtCO1FBQzlCQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO1FBQ2pDQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRVUsbUJBQW1CLEVBQUU7UUFDcEJiLFNBQVMsRUFBRSxnQ0FBZ0M7UUFDM0NDLFVBQVUsRUFBRSxxQkFBcUI7UUFDakNDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUM7UUFDakNDLEtBQUssRUFBRTtNQUNSO0lBQ0Q7RUFDRCxDQUFDO0FBQUEifQ==