/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Item","./library"],function(e,a){"use strict";var t=e.extend("sap.ui.ux3.NavigationItem",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{visible:{type:"boolean",group:"Appearance",defaultValue:true},href:{type:"sap.ui.core.URI",group:"Behavior",defaultValue:null}},defaultAggregation:"subItems",aggregations:{subItems:{type:"sap.ui.ux3.NavigationItem",multiple:true,singularName:"subItem"}}}});return t});