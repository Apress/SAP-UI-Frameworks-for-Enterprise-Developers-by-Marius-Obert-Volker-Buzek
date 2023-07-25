/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var t={};t.render=function(t,e){t.write("<a");t.writeControlData(e);t.writeAccessibilityState(e);if(!e.getEnabled()){t.addClass("sapUiLnkDsbl");t.writeAttribute("disabled","true")}else{t.addClass("sapUiLnk")}t.writeClasses();if(e.getTooltip_AsString()){t.writeAttributeEscaped("title",e.getTooltip_AsString())}if(e.getHref()){t.writeAttributeEscaped("href",e.getHref())}else{t.writeAttribute("href","#")}if(e.getTarget()){t.writeAttributeEscaped("target",e.getTarget())}if(!e.getEnabled()){t.writeAttribute("tabindex","-1")}else{t.writeAttribute("tabindex","0")}if(e.getWidth()){t.addStyle("width",e.getWidth())}t.writeStyles();t.write(">");if(e.getText()){t.writeEscaped(e.getText())}t.write("</a>")};return t},true);