/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./library","sap/ui/Device"],function(e,t){"use strict";var i={apiVersion:2};i.render=function(e,t){e.openStart("div",t);e.style("height",t.getThumbnailHeight());e.style("width",t.getThumbnailWidth());e.style("background-image","url("+t.getSource()+")");e.class("sapVizKitViewGalleryThumbnail");e.attr("tabindex",0);var i=t.getTooltip();if(i){e.attr("title",i)}e.openEnd();var a=t._getIndex()+1;if(a>0){e.openStart("div");e.class("sapVizKitViewGalleryStepNumberText");e.openEnd();e.text(a.toString());e.close("div")}e.close("div")};return i},true);