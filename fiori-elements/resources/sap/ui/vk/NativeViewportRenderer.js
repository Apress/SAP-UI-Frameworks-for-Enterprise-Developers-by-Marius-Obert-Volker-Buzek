/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,r){e.openStart("div",r);e.class("sapVizKitNativeViewport");e.attr("tabindex",0);e.style("background-image","linear-gradient("+r.getBackgroundColorTop()+","+r.getBackgroundColorBottom()+")");e.openEnd();r.renderTools(e);r.renderContent(e);e.close("div")};return e},true);