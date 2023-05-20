/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","./RepeaterViewConfigurationRenderer"],function(e,t){"use strict";var u=e.extend("sap.suite.ui.commons.RepeaterViewConfiguration",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{title:{type:"string",group:"Misc",defaultValue:null},icon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},iconHovered:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},path:{type:"string",group:"Misc",defaultValue:null},itemMinWidth:{type:"int",group:"Misc",defaultValue:-1},numberOfTiles:{type:"int",group:"Misc",defaultValue:-1},responsive:{type:"any",group:"Misc",defaultValue:false},external:{type:"boolean",group:"Misc",defaultValue:false},iconSelected:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},itemHeight:{type:"int",group:"Misc",defaultValue:null}},aggregations:{template:{type:"sap.ui.core.Control",multiple:false},externalRepresentation:{type:"sap.ui.core.Control",multiple:false}}}});return u});