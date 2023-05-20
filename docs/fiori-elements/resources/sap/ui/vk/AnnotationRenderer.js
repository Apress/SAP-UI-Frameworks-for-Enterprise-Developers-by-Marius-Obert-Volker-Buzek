/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var t={apiVersion:2};t.render=function(t,e){t.openStart("div",e);var n=e.getEditable()&&e.getSelected()?"Editing":e.getStyle();t.class("sapUiVizKitAnnotation"+n);if(e._reverse===true){t.class("sapUiVizKitAnnotationReverse")}t.openEnd();for(var i=0;i<8;i++){t.openStart("div");t.class("sapUiVizKitAnnotationElement"+i);t.openEnd();t.close("div")}t.openStart("div");t.class("sapUiVizKitAnnotationNode"+n);t.openEnd();t.close("div");t.openStart("div");t.class("sapUiVizKitAnnotationLeader"+n);t.openEnd();t.close("div");t.openStart("svg");t.attr("xmlns","http://www.w3.org/2000/svg");t.class("sapUiVizKitAnnotationSVG"+n);t.openEnd();t.openStart("path");t.openEnd();t.close("path");t.close("svg");if(e._textDiv){t.renderControl(e._textDiv)}t.close("div")};return t},true);