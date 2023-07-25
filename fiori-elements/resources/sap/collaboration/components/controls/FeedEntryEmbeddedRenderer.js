/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/HTML","sap/ui/thirdparty/jquery"],function(e,n){"use strict";var t={apiVersion:2};t.render=function(e,n){e.openStart("div",n).openEnd();if(n._shouldTextBeRendered()){var t=n.getId();e.openStart("div").openEnd();if(n._sText.length>n.nMaxCollapsedLength){n.getCollapsedText();e.openStart("div",t+"-collapsed-text");e.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");e.openEnd();this._renderText(e,n,n._sCollapsedTextWithPlaceholders);e.openStart("span");e.class("sapCollaborationEmbeddedTextSpace");e.openEnd();e.close("span");if(n.oExpandLink===undefined){n.oExpandLink=n.createExpandCollapseLink("TE_MORE");e.renderControl(n.oExpandLink)}else{e.renderControl(n.oExpandLink)}e.close("div");e.openStart("div",t+"-expanded-text");e.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");e.openEnd();this._renderText(e,n,n._sTextWithPlaceholders);e.openStart("span");e.class("sapCollaborationEmbeddedTextSpace");e.openEnd();e.close("span");if(n.oCollapseLink===undefined){n.oCollapseLink=n.createExpandCollapseLink("TE_LESS");e.renderControl(n.oCollapseLink)}else{e.renderControl(n.oCollapseLink)}e.close("div")}else{e.openStart("div",t+"-expanded-text");e.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");e.openEnd();this._renderText(e,n,n._sTextWithPlaceholders);e.close("div")}e.close("div")}if(n._shouldContentBeRendered()){e.renderControl(n._oTimelineItemContent)}e.close("div")};t._renderText=function(t,o,a){var r=o._splitByPlaceholders(a);for(var d=0;d<r.length;d++){var s=/@@.\{\d+\}/;if(s.test(r[d])){t.renderControl(o._mAtMentionsLinks[r[d]])}else if(o.getProperty("feedEntry").ContentType==="text/html"){var l="<span>"+r[d]+"</span>";var i=n.parseHTML(l)[0];var p=n(i).find("a");if(p.length!==0){p.attr("target","_blank");l=i.outerHTML}t.renderControl(new e({content:l,sanitizeContent:true}))}else{r[d].split("\n").forEach(function(e,n){if(n>0){t.voidStart("br").voidEnd()}t.text(e)})}}};return t},true);