/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,n){e.openStart("div",n);e.openEnd();e.renderControl(n.getAggregation("animationTimeSlider"));e.renderControl(n.getAggregation("toolbar"));e.renderControl(n.getAggregation("container"));e.close("div")};return e},true);