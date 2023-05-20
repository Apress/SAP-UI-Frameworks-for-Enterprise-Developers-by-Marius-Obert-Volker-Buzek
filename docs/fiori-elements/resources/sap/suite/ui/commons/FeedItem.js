/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./library","sap/ui/core/Element","sap/base/security/URLListValidator","sap/base/Log"],function(e,t,r,i){"use strict";var a=t.extend("sap.suite.ui.commons.FeedItem",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{title:{type:"string",group:"Misc",defaultValue:null},image:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},link:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},source:{type:"string",group:"Misc",defaultValue:null},publicationDate:{type:"object",group:"Misc",defaultValue:null}}}});a.prototype.setImage=function(e){if(e){var t=r.validate(e);if(t){this.setProperty("image",e)}else{i.error("Invalid Url:'"+e+"'. Property 'image' of FeedItem not set")}}return this};a.prototype.setLink=function(e){if(e){var t=r.validate(e);if(t){this.setProperty("link",e)}else{i.error("Invalid Url:'"+e+"'. Property 'link' of FeedItem not set")}}return this};return a});