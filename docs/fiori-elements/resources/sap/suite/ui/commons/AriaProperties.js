/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./library","sap/ui/core/Element"],function(e,a){"use strict";var l=a.extend("sap.suite.ui.commons.AriaProperties",{metadata:{library:"sap.suite.ui.commons",properties:{label:{type:"string",defaultValue:null},labelledBy:{type:"string",defaultValue:null},describedBy:{type:"string",defaultValue:null},role:{type:"string",defaultValue:null},hasPopup:{type:"string",defaultValue:null}}}});l.writeAriaProperties=function(e,a,l){var t=l&&l.getLabel()||a.label;if(t){e.attr("aria-label",t)}var r=l&&l.getLabelledBy()||a.labelledBy;if(r){e.attr("aria-labelledby",r)}var i=l&&l.getDescribedBy()||a.describedBy;if(i){e.attr("aria-describedby",i)}var u=l&&l.getRole()||a.role;if(u){e.attr("role",u)}var s=l&&l.getHasPopup()||a.hasPopup;if(s){e.attr("aria-haspopup",s)}};return l});