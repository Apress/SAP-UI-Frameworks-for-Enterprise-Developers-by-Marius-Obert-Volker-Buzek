/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var e={};e.render=function(e,i){var t=sap.ui.getCore().getConfiguration().getLanguage();var r=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons",t);var s="";e.write("<div");e.writeControlData(i);e.addClass("sapSuiteUiCommonsLaunchTile");e.addClass("sapSuiteUiCommonsPointer");e.writeAttribute("tabindex","0");e.writeClasses();if(i.getTooltip_AsString()){s=i.getTooltip_AsString();e.writeAttributeEscaped("title",i.getTooltip_AsString())}else{s=r.getText("LAUNCHTILE_LAUNCH")+" "+i.getTitle()}e.writeAccessibilityState(i,{role:"link",live:"assertive",label:s});e.write(">");e.write('<div id="'+i.getId()+'-launchTileText"');e.addClass("sapSuiteUiCommonsLaunchTileTitle");e.writeClasses();e.write(">");e.writeEscaped(i.getTitle());e.write("</div>");e.write('<div id="'+i.getId()+'-launchTileIcon"');e.addClass("sapSuiteUiCommonsLaunchTileIcon");e.writeClasses();e.write(">");e.renderControl(i._iconImage);e.write("</div>");e.write("</div>")};return e},true);