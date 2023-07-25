/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./library","sap/ui/core/Control","./ContainerContentRenderer"],function(t,e,n){"use strict";var i=e.extend("sap.ui.vk.ContainerContent",{metadata:{library:"sap.ui.vk",properties:{icon:{type:"string",group:"Misc",defaultValue:null},title:{type:"string",group:"Misc",defaultValue:null}},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}}}});i.prototype.setContent=function(t){if(t instanceof sap.ui.vbm.GeoMap){t.setNavcontrolVisible(false);t.setWidth("100%");t.setHeight("100%")}this.setAggregation("content",t);return this};return i});