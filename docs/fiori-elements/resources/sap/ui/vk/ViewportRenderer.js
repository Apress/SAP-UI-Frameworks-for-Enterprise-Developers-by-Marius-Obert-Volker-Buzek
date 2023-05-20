/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);e.class("sapVizKitViewport");if(t._implementation){e.attr("tabindex",-1)}else{e.attr("tabindex",0);e.attr("aria-label","Image");e.attr("role","figure")}var i=t.getWidth();if(i){e.style("width",i)}var n=t.getHeight();if(n){e.style("height",n)}e.openEnd();if(t._implementation){e.renderControl(t._implementation)}else if(t.getContent()){var r=t.getContent();for(var a=0,o=r.length;a<o;a++){e.renderControl(r[a])}}e.close("div")};return e},true);