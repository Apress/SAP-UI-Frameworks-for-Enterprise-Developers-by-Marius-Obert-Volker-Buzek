/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={};e.render=function(e,r){e.write("<div");e.writeControlData(r);e.addClass("sapUiFeed");e.writeClasses();e.write(">");e.renderControl(r.oFeeder);e.write("<header class=sapUiFeedTitle ><h4>");var t=r.getTitle();if(!t||t==""){t=r.rb.getText("FEED_TITLE")}e.writeEscaped(t);if(r.oToolsButton){e.renderControl(r.oToolsButton)}e.renderControl(r.oLiveButton);e.write("</h4>");e.write('<div class="sapUiFeedToolbar" >');e.renderControl(r.oFilter);e.renderControl(r.oSearchField);e.write("</div>");e.write("</header>");e.write("<section>");for(var i=0;i<r.getChunks().length;i++){var o=r.getChunks()[i];e.renderControl(o)}e.write("</section>");e.write("</div>")};return e},true);