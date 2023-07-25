/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);e.class("sapVizKitViewport");e.attr("tabindex",0);e.attr("aria-label","Image");e.attr("role","figure");var r=t.getWidth();if(r){e.style("width",r)}var i=t.getHeight();if(i){e.style("height",i)}e.openEnd();t.renderTools(e);t.renderContent(e);e.close("div")};return e},true);