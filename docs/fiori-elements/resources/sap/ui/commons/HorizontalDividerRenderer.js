/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var i={};i.render=function(i,e){i.write("<hr");i.writeControlData(e);i.writeAttribute("role","separator");if(e.getWidth()){i.writeAttribute("style","width:"+e.getWidth()+";")}i.addClass("sapUiCommonsHoriDiv");i.addClass(e.getType()=="Page"?"sapUiCommonsHoriDivTypePage":"sapUiCommonsHoriDivTypeArea");switch(e.getHeight()){case"Ruleheight":i.addClass("sapUiCommonsHoriDivHeightR");break;case"Small":i.addClass("sapUiCommonsHoriDivHeightS");break;case"Large":i.addClass("sapUiCommonsHoriDivHeightL");break;default:i.addClass("sapUiCommonsHoriDivHeightM")}i.writeClasses();i.write(">")};return i},true);