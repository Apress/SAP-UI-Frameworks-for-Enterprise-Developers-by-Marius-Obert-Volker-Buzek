/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","./library","./FacetFilterRenderer"],function(e,t,i){"use strict";var a=t.VisibleItemCountMode;var r=e.extend("sap.ui.ux3.FacetFilter",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{visibleItemCountMode:{type:"sap.ui.ux3.VisibleItemCountMode",group:"Appearance",defaultValue:a.Fixed}},aggregations:{lists:{type:"sap.ui.ux3.FacetFilterList",multiple:true,singularName:"list"}}}});r.prototype.init=function(){this.data("sap-ui-fastnavgroup","true",true)};return r});