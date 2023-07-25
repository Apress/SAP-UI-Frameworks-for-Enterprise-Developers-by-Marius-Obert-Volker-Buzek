/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./DateUtils"],function(e){"use strict";var t=function(){throw new Error};t.calculateFeedItemAge=function(t){var i="";if(!e.isValidDate(t)){return i}var r=new Date;t.setMilliseconds(0);r.setMilliseconds(0);var a=sap.ui.getCore().getConfiguration().getLanguage();var g=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons",a);var s=6e4;var T=s*60;var n=T*24;if(r.getTime()-t.getTime()>=n){var E=parseInt((r.getTime()-t.getTime())/n,10);if(E===1){i=g.getText("FEEDTILE_DAY_AGO",[E])}else{i=g.getText("FEEDTILE_DAYS_AGO",[E])}}else if(r.getTime()-t.getTime()>=T){var u=parseInt((r.getTime()-t.getTime())/T,10);if(u===1){i=g.getText("FEEDTILE_HOUR_AGO",[u])}else{i=g.getText("FEEDTILE_HOURS_AGO",[u])}}else{var l=parseInt((r.getTime()-t.getTime())/s,10);if(l===1){i=g.getText("FEEDTILE_MINUTE_AGO",[l])}else{i=g.getText("FEEDTILE_MINUTES_AGO",[l])}}return i};return t},true);