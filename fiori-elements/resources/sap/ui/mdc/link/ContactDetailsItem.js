/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element"],function(e){"use strict";var t=e.extend("sap.ui.mdc.link.ContactDetailsItem",{metadata:{library:"sap.ui.mdc",properties:{sectionTitle:{type:"string",defaultValue:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE")},photo:{type:"string"},formattedName:{type:"string"},role:{type:"string"},title:{type:"string"},org:{type:"string"},parameters:{type:"object"}},defaultAggregation:"emails",aggregations:{emails:{type:"sap.ui.mdc.link.ContactDetailsEmailItem",multiple:true,singularName:"email"},phones:{type:"sap.ui.mdc.link.ContactDetailsPhoneItem",multiple:true,singularName:"phone"},addresses:{type:"sap.ui.mdc.link.ContactDetailsAddressItem",multiple:true,singularName:"address"}}}});return t});