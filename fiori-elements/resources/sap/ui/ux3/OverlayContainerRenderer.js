/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","./OverlayRenderer"],function(e,n){"use strict";var r=e.extend(n);r.renderContent=function(e,n){e.write("<div role='Main' class='sapUiUx3OCContent' id='"+n.getId()+"-content'>");var r=n.getContent();for(var t=0;t<r.length;t++){var a=r[t];e.renderControl(a)}e.write("</div>")};r.addRootClasses=function(e,n){e.addClass("sapUiUx3OC")};r.addOverlayClasses=function(e,n){e.addClass("sapUiUx3OCOverlay")};return r},true);