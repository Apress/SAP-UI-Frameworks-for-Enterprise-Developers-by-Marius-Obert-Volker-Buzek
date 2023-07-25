// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/library","sap/ui/core/Renderer","sap/m/GroupHeaderListItemRenderer","sap/ushell/library"],function(e,t,r,n){"use strict";var i=e.TextDirection;var s=t.extend(r);s.apiVersion=2;s.renderLIAttributes=function(e,t){r.renderLIAttributes(e,t);e.class("sapUshellCGHLIContent")};s.renderLIContent=function(e,t){var r=t.getTitleTextDirection();e.openStart("span");e.class("sapMGHLITitle");if(r!==i.Inherit){e.attr("dir",r.toLowerCase())}e.openEnd();e.renderControl(t.getAggregation("_titleText"));if(t.getDescription()){e.voidStart("br");e.voidEnd();e.openStart("span");e.class("sapUshellCGHLIDescription");e.openEnd();e.renderControl(t.getAggregation("_descriptionText"));e.close("span")}e.close("span")};return s});