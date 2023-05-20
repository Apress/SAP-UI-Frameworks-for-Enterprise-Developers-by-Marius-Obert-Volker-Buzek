/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Component","sap/base/Log","../../ServiceContainer"],function(n,o,e){"use strict";var a=o.getLogger("sap.suite.ui.commons.collaboration.flpplugins.msplugin.Component");return n.extend("sap.suite.ui.commons.collaboration.flpplugins.msplugin.Component",{metadata:{properties:{isShareAsLinkEnabled:{name:"isShareAsLinkEnabled",type:"boolean"},isShareAsTabEnabled:{name:"isShareAsTabEnabled",type:"boolean"}}},init:function(){var n=this._loadPluginConfigData();if(n){e.setCollaborationType("COLLABORATION_MSTEAMS",n)}else{a.error("Collaboration configuration for Microsoft Teams Integration could not be loaded.")}},_loadPluginConfigData:function(){if(this.getComponentData()&&this.getComponentData().config){return this.getComponentData().config}}})});