/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,r){e.openStart("div",r);e.class("sapVizKitToolbar");e.openEnd();e.renderControl(r.getAggregation("_toolbar"));e.close("div")};return e},true);