/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var t={apiVersion:2};t.render=function(t,n){t.openStart("div",n);t.openEnd();var e=n._tool;var o=e&&e.getButtons&&e.getButtons();if(o&&o.length){t.openStart("div");t.class("sapUiVizKitPoiButtonsContainer");t.openEnd();for(var r=0;r<o.length;++r){t.renderControl(o[r])}t.close("div")}t.close("div")};return t},true);