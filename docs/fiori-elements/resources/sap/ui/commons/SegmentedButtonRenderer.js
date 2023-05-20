/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.render=function(e,t){var i=sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons"),r=i.getText("SEGMENTEDBUTTON_ARIA_SELECT");e.write("<span");e.writeControlData(t);e.addClass("sapUiSegmentedButton");e.writeClasses();e.write(">");e.write('<span id="'+t.getId()+'-radiogroup"');e.writeAccessibilityState(t,{role:"radiogroup",disabled:!t.getEnabled()});if(t.getEnabled()){e.writeAttribute("tabindex","0")}else{e.writeAttribute("tabindex","-1")}e.write(">");this.renderButtons(e,t);e.write("</span>");e.write('<span id="'+t.getId()+'-label" style="visibility: hidden; display: none;">');e.writeEscaped(r);e.write("</span>");e.write("</span>")};e.renderButtons=function(e,t){t.getButtons().forEach(function(t){e.renderControl(t)})};return e},true);