/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/commons/Toolbar","sap/ui/core/Control","./library","./ExactAreaRenderer","sap/ui/core/Element"],function(e,t,a,r,o){"use strict";var u=t.extend("sap.ui.ux3.ExactArea",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{toolbarVisible:{type:"boolean",group:"Appearance",defaultValue:true}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},toolbarItems:{type:"sap.ui.commons.ToolbarItem",multiple:true,singularName:"toolbarItem"}}}});o.extend("sap.ui.ux3.ExactAreaToolbarTitle",{metadata:{interfaces:["sap.ui.commons.ToolbarItem"],properties:{text:{type:"string",group:"Appearance",defaultValue:""}}}});return u});