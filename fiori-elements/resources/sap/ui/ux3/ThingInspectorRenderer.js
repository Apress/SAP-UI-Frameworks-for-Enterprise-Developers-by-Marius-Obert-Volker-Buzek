/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","./OverlayRenderer"],function(e,n){"use strict";var r=e.extend(n);r.renderContent=function(e,n){e.write("<div role='Main' class='sapUiUx3TIContent' id='"+n.getId()+"-content'>");e.renderControl(n._oThingViewer);e.write("</div>")};r.addRootClasses=function(e,n){e.addClass("sapUiUx3TI")};r.addOverlayClasses=function(e,n){e.addClass("sapUiUx3TIOverlay")};return r},true);