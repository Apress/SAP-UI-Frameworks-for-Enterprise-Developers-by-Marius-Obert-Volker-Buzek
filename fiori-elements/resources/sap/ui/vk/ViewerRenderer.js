/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);e.class("sapVizKitViewer");if(t.getWidth()){e.style("width",t.getWidth())}if(t.getHeight()){e.style("height",t.getHeight())}e.openEnd();e.renderControl(t._layout);e.renderControl(t._progressIndicator);e.close("div")};return e},true);