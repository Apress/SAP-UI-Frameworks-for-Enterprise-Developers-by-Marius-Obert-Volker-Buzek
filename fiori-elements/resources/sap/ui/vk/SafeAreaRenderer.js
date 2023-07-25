/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,t){e.openStart("div",t);var i=t.getParent();if(i){if(i.getShowSafeArea()){e.class("sapVizKitSafeAreaVisible")}else{e.class("sapVizKitSafeAreaNotVisible")}}e.openEnd();if(t.getSettingsControl()){e.renderControl(t.getSettingsControl())}e.close("div")};return e},true);