/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(function(){"use strict";var e={apiVersion:2};e.render=function(e,n){var r=n._oPanel;r.addStyleClass("sapUiVkListPanel");e.openStart("div",n);e.attr("role",sap.ui.core.AccessibleRole.Presentation);e.openEnd();e.renderControl(r);e.close("div")};return e},true);