/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/library","sap/ui/core/Element"],function(e,t){"use strict";var a=e.ButtonType;var i=t.extend("sap.ui.integration.ActionDefinition",{metadata:{library:"sap.ui.integration",properties:{type:{type:"sap.ui.integration.CardActionType"},text:{type:"string",defaultValue:""},icon:{type:"sap.ui.core.URI"},buttonType:{type:"sap.m.ButtonType",defaultValue:a.Transparent},enabled:{type:"boolean",defaultValue:true},visible:{type:"boolean",defaultValue:true},parameters:{type:"object"}},events:{press:{}},associations:{_menuButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"}}}});return i});