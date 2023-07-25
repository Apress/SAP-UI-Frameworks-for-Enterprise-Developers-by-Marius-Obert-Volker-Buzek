/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/core/EnabledPropagator","./FlexibleControlRenderer"],function(e,t,a,r){"use strict";var o=t.extend("sap.ui.vk.FlexibleControl",{metadata:{library:"sap.ui.vk",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},layout:{type:"string",group:"Behavior",defaultValue:"Stacked"},enabled:{type:"boolean",group:"Behavior",defaultValue:true}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}},designTime:true}});a.call(o.prototype);return o});