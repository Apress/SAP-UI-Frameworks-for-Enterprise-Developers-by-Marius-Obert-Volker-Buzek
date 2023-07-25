/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var t={apiVersion:2};t.render=function(t,e){var i=t;i.openStart("div",e);i.class("sapUiFlexControl");if(e.getWidth()&&e.getWidth()!=""){i.style("width",e.getWidth())}if(e.getHeight()&&e.getHeight()!=""){i.style("height",e.getHeight())}i.openEnd();var g=e.getContent();var a=e.getLayout();var n="sapUiFlexCellStacked";if(a=="Vertical"){n="sapUiFlexCellVertical"}for(var r=0;r<g.length;r++){var o=g[r];i.openStart("div");i.attr("id",e.getId()+"Content_"+r);i.class(n);var l=o.getLayoutData();if(l&&a!="Stacked"){if(l.getSize()&&l.getSize()!=""){i.style("height",l.getSize())}if(l.getMinSize()&&l.getMinSize()!=""){i.style("min-height",l.getMinSize())}if(l.getMarginTop()&&l.getMarginTop()!=""){i.style("margin-top",l.getMarginTop())}if(l.getMarginBottom()&&l.getMarginBottom()!=""){i.style("margin-bottom",l.getMarginBottom())}}i.openEnd();i.renderControl(o);i.close("div")}i.close("div")};return t},true);