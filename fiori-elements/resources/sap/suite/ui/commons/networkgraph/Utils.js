/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var n={};n.find=function(n,r,t){var e;if(typeof n.find==="function"){return n.find(r,t)}else{for(e=0;e<n.length;e++){if(r.call(t,n[e],e,n)){return n[e]}}return undefined}};n.trimText=function(n,r){if(n&&n.length>r){return n.substring(0,r)+" ... "}return n};return n},true);