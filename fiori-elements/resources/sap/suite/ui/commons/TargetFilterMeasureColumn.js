/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./library","sap/ui/core/Element","sap/ui/model/type/Integer","sap/ui/model/SimpleType","sap/base/Log"],function(e,t,i,p,r){"use strict";var s=t.extend("sap.suite.ui.commons.TargetFilterMeasureColumn",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{path:{type:"string",group:"Misc",defaultValue:null},type:{type:"any",group:"Misc",defaultValue:null}}}});s.prototype.init=function(){this.setType(new i({groupingEnabled:true}))};s.prototype.setType=function(e,t){if(!(e instanceof p)){r.error(e+" is not instance of sap.ui.model.SimpleType",this)}this.setProperty("type",e,t);return this};return s});