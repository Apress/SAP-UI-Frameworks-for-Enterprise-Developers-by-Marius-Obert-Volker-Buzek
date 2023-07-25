/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);e.class("sapVizKitViewport");e.attr("tabindex",0);e.attr("aria-label","Image");e.attr("role","figure");e.style("width",t.getWidth());e.style("height",t.getHeight());e.openEnd();if(t.getSafeArea()){e.renderControl(t.getSafeArea())}t.renderTools(e);t.renderContent(e);var n=t.getAnnotations();if(n&&n.length>0){e.openStart("div");e.class("sapUiVizKitAnnotationContainer");e.openEnd();n.forEach(function(t){e.renderControl(t)});e.close("div")}e.close("div")};return e},true);