/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,n){e.openStart("svg",n);e.class("sapUiVizkitRedlineSurface");e.openEnd();e.openStart("defs");e.openEnd();e.openStart("filter");e.attr("id","halo");e.attr("filterUnits","userSpaceOnUse");e.openEnd();e.openStart("feGaussianBlur");e.attr("in","SourceAlpha");e.attr("stdDeviation","4");e.attr("result","blur");e.openEnd();e.close("feGaussianBlur");e.openStart("feMerge");e.openEnd();e.openStart("feMergeNode");e.attr("in","blur");e.openEnd();e.close("feMergeNode");e.openStart("feMergeNode");e.attr("in","SourceGraphic");e.openEnd();e.close("feMergeNode");e.close("feMerge");e.close("filter");e.close("defs");n.getRedlineElements().forEach(function(n){n.render(e)});this.renderAfterRedlineElements(e,n);e.close("svg")};e.renderAfterRedlineElements=function(e,n){};return e},true);