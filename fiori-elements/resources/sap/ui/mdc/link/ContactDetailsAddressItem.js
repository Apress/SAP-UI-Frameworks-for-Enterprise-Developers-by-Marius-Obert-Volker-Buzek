/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element"],function(t){"use strict";var e=t.extend("sap.ui.mdc.link.ContactDetailsAddressItem",{metadata:{library:"sap.ui.mdc",properties:{street:{type:"string"},code:{type:"string"},locality:{type:"string"},region:{type:"string"},country:{type:"string"},types:{type:"sap.ui.mdc.ContactDetailsAddressType[]",defaultValue:[]}}}});return e});