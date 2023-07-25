/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Defines a property set as Contact Data like adress or phone number.
       *
       * <br>
       * <i>Example in OData V4 notation with Contact Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *   &lt;Annotation Property="Common.Label" String="Sold-to Party"/&gt;
       *   &lt;Annotation Property="com.sap.vocabularies.Communication.v1.Contact"&gt;
       *     &lt;Record Type="com.sap.vocabularies.Communication.v1.ContactType"&gt;
       *       &lt;PropertyValue Property="email"&gt;
       *         &lt;Collection&gt;
       *           &lt;Record Type="com.sap.vocabularies.Communication.v1.EmailAddressType"&gt;
       *             &lt;PropertyValue Property="type" EnumMember="com.sap.vocabularies.Communication.v1.ContactInformationType/work"/&gt;
       *             &lt;PropertyValue Property="address" Path="EmailAddress"/&gt;
       *           &lt;/Record&gt;
       *         &lt;/Collection&gt;
       *       &lt;/PropertyValue&gt;
       *         &lt;PropertyValue Property="fn" Path="CustomerName"/&gt;
       *         &lt;PropertyValue Property="tel"&gt;
       *           &lt;Collection&gt;
       *             &lt;Record Type="com.sap.vocabularies.Communication.v1.PhoneNumberType"&gt;
       *               &lt;PropertyValue Property="type" EnumMember="com.sap.vocabularies.Communication.v1.PhoneType/fax"/&gt;
       *               &lt;PropertyValue Property="uri" Path="InternationalPhoneNumber"/&gt;
       *             &lt;/Record&gt;
       *           &lt;/Collection&gt;
       *         &lt;/PropertyValue&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i>Contact Type properties evaluated by this macro :</i>
       *
       * <ul>
       *   <li>Property <b>fn</b> <br/>
       *	   The Full name for the contact
       *   </li>
       *   <li>Property <b>title</b><br/>
       *     The title of the contact
       *   </li>
       *   <li>Property <b>role</b><br/>
       *     The role of the contact
       *   </li>
       *   <li>Property <b>org</b><br/>
       *     The organization of the contact
       *   </li>
       *   <li>Property <b>photo</b><br/>
       *     The photo of the contact
       *   </li>
       *   <li>Property <b>adr</b><br/>
       *     Array of addresses of the contact
       *   </li>
       *   <li>Property <b>email</b><br/>
       *     Array of email addresses of the contact
       *   </li>
       *   <li>Property <b>tel</b><br/>
       *     Array of telephone numbers of the contact
       *   </li>
       * </ul>
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Communication.md#contact com.sap.vocabularies.Communication.v1.Contact}</b><br/>
       *   </li>
       * </ul>
       */
      contact: {
        namespace: "com.sap.vocabularies.Communication.v1",
        annotation: "Contact",
        target: ["EntityType"],
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImNvbnRhY3QiLCJuYW1lc3BhY2UiLCJhbm5vdGF0aW9uIiwidGFyZ2V0Iiwic2luY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnRhY3QuZGVzaWdudGltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG5cdGFubm90YXRpb25zOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyBhIHByb3BlcnR5IHNldCBhcyBDb250YWN0IERhdGEgbGlrZSBhZHJlc3Mgb3IgcGhvbmUgbnVtYmVyLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBDb250YWN0IERhdGEgZm9yIEN1c3RvbWVyPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwiY29tLmNfc2FsZXNvcmRlcm1hbmFnZV9zZC5DdXN0b21lclwiJmd0O1xuXHRcdCAqICAgJmx0O0Fubm90YXRpb24gUHJvcGVydHk9XCJDb21tb24uTGFiZWxcIiBTdHJpbmc9XCJTb2xkLXRvIFBhcnR5XCIvJmd0O1xuXHRcdCAqICAgJmx0O0Fubm90YXRpb24gUHJvcGVydHk9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIiZndDtcblx0XHQgKiAgICAgJmx0O1JlY29yZCBUeXBlPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Db250YWN0VHlwZVwiJmd0O1xuXHRcdCAqICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiZW1haWxcIiZndDtcblx0XHQgKiAgICAgICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkVtYWlsQWRkcmVzc1R5cGVcIiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cInR5cGVcIiBFbnVtTWVtYmVyPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Db250YWN0SW5mb3JtYXRpb25UeXBlL3dvcmtcIi8mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJhZGRyZXNzXCIgUGF0aD1cIkVtYWlsQWRkcmVzc1wiLyZndDtcblx0XHQgKiAgICAgICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJmblwiIFBhdGg9XCJDdXN0b21lck5hbWVcIi8mZ3Q7XG5cdFx0ICogICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cInRlbFwiJmd0O1xuXHRcdCAqICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLlBob25lTnVtYmVyVHlwZVwiJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJ0eXBlXCIgRW51bU1lbWJlcj1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuUGhvbmVUeXBlL2ZheFwiLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwidXJpXCIgUGF0aD1cIkludGVybmF0aW9uYWxQaG9uZU51bWJlclwiLyZndDtcblx0XHQgKiAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkNvbnRhY3QgVHlwZSBwcm9wZXJ0aWVzIGV2YWx1YXRlZCBieSB0aGlzIG1hY3JvIDo8L2k+XG5cdFx0ICpcblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+UHJvcGVydHkgPGI+Zm48L2I+IDxici8+XG5cdFx0ICpcdCAgIFRoZSBGdWxsIG5hbWUgZm9yIHRoZSBjb250YWN0XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPnRpdGxlPC9iPjxici8+XG5cdFx0ICogICAgIFRoZSB0aXRsZSBvZiB0aGUgY29udGFjdFxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj5yb2xlPC9iPjxici8+XG5cdFx0ICogICAgIFRoZSByb2xlIG9mIHRoZSBjb250YWN0XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPm9yZzwvYj48YnIvPlxuXHRcdCAqICAgICBUaGUgb3JnYW5pemF0aW9uIG9mIHRoZSBjb250YWN0XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPnBob3RvPC9iPjxici8+XG5cdFx0ICogICAgIFRoZSBwaG90byBvZiB0aGUgY29udGFjdFxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj5hZHI8L2I+PGJyLz5cblx0XHQgKiAgICAgQXJyYXkgb2YgYWRkcmVzc2VzIG9mIHRoZSBjb250YWN0XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPmVtYWlsPC9iPjxici8+XG5cdFx0ICogICAgIEFycmF5IG9mIGVtYWlsIGFkZHJlc3NlcyBvZiB0aGUgY29udGFjdFxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj50ZWw8L2I+PGJyLz5cblx0XHQgKiAgICAgQXJyYXkgb2YgdGVsZXBob25lIG51bWJlcnMgb2YgdGhlIGNvbnRhY3Rcblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbXVuaWNhdGlvbi5tZCNjb250YWN0IGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdH08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRjb250YWN0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJDb250YWN0XCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7U0FBZTtJQUNkQSxXQUFXLEVBQUU7TUFDWjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsT0FBTyxFQUFFO1FBQ1JDLFNBQVMsRUFBRSx1Q0FBdUM7UUFDbERDLFVBQVUsRUFBRSxTQUFTO1FBQ3JCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSO0lBQ0Q7RUFDRCxDQUFDO0FBQUEifQ==