/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BaseContentRenderer","sap/ui/integration/util/BindingResolver"],function(e,t){"use strict";var n="2px";var i=e.extend("sap.ui.integration.cards.WebPageContentRenderer",{apiVersion:2,MIN_WEB_PAGE_CONTENT_HEIGHT:"150px"});i.renderContent=function(e,t){e.openStart("iframe",t.getId()+"-frame").class("sapUiIntWPCFrame");e.style("height","calc("+t.getMinHeight()+" - "+n+")").attr("src",t.getSrc()).attr("tabindex","0").attr("sandbox",t.getSandbox()).openEnd().close("iframe")};i.getMinHeight=function(e,n){if(e.minHeight){return t.resolveValue(e.minHeight,n)}return i.MIN_WEB_PAGE_CONTENT_HEIGHT};return i});