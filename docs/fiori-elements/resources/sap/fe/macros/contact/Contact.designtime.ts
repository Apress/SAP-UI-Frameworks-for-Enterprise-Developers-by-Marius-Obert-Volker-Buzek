export default {
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
