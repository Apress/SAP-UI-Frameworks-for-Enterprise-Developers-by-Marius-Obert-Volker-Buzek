/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var t={apiVersion:2};t.render=function(e,i){if(!i.getVisible()){return}if(i.getShowToolbar()||i.getShowThumbnails){var r=i.getWidth()!=="auto"?i.getWidth():"100%";var n=i.getHeight()!=="auto"?i.getHeight():"auto";e.openStart("div",i);e.style("width",r);e.style("height",n);e.class("sapVizKitStepNavigation");var o=i.getTooltip_AsString();if(o){e.attr("title",o)}if(!i.getVisible()){e.style("visibility","hidden")}e.openEnd();e.renderControl(i.getAggregation("layout"));if(i.getShowThumbnails()){t._renderScrollerDiv(e,i)}e.close("div")}};t._renderScrollerDiv=function(t,e){t.renderControl(e.getAggregation("thumbnailsContainer"))};return t},true);