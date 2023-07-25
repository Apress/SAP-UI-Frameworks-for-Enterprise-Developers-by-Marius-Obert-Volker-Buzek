/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./library","sap/ui/core/Control","./UnifiedThingGroupRenderer"],function(e,i,t){"use strict";var r=i.extend("sap.suite.ui.commons.UnifiedThingGroup",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{title:{type:"string",group:"Misc",defaultValue:null},description:{type:"string",group:"Misc",defaultValue:null},design:{type:"sap.suite.ui.commons.ThingGroupDesign",group:"Misc",defaultValue:"ZeroIndent"}},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}}}});return r});