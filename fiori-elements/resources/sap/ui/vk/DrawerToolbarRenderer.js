/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,r){e.openStart("div",r);e.class("drawerToolbar");if(!r.getExpanded()){e.class("drawerToolbarCollapsed")}else{e.class("drawerToolbarExpanded")}e.openEnd();e.renderControl(r._container);e.close("div")};return e},true);