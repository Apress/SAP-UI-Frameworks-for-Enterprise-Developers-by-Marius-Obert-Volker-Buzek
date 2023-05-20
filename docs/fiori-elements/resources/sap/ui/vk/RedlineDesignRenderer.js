/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./RedlineSurfaceRenderer","sap/ui/core/Renderer"],function(e,n){"use strict";var r=n.extend(e);r.apiVersion=2;r.render=function(n,r){e.render.call(this,n,r)};r.renderAfterRedlineElements=function(e,n){if(n._activeElementInstance&&n._isDrawingOn){n._activeElementInstance.render(e)}};return r},true);