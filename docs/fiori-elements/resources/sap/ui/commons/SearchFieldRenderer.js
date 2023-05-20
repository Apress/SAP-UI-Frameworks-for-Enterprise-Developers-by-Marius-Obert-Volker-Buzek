/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.render=function(e,a){e.write("<div");e.writeControlData(a);e.addClass("sapUiSearchField");if(!a.getEditable()||!a.getEnabled()){e.addClass("sapUiSearchFieldDsbl")}if(!a.hasListExpander()){e.addClass("sapUiSearchFieldNoExp")}if(a.getEnableClear()){e.addClass("sapUiSearchFieldClear")}if(a.getWidth()){e.addStyle("width",a.getWidth())}if(a.getValue()){e.addClass("sapUiSearchFieldVal")}e.writeClasses();e.writeStyles();e.write(">");e.renderControl(a._ctrl);if(a.getShowExternalButton()){e.renderControl(a._btn)}var t=sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");e.write("<span id='",a.getId(),"-label' style='display:none;' aria-hidden='true'>");e.writeEscaped(t.getText("SEARCHFIELD_BUTTONTEXT"));e.write("</span>");e.write("</div>")};return e},true);