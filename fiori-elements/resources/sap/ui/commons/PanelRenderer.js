/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/security/encodeXML","sap/ui/core/library","sap/ui/core/Configuration"],function(e,t,i){"use strict";var a=t.TitleLevel;var r=function(){};r.render=function(t,r){var s=r.getId();var n=i.getAccessibility();var d=l(r.getHeight());var o=l(r.getWidth());r.getScrollTop();r.getScrollLeft();t.write("<section");t.writeControlData(r);t.addClass("sapUiPanel");t.addStyle("width",r.getWidth());if(!r.getCollapsed()){t.addStyle("height",r.getHeight())}else{t.addClass("sapUiPanelColl");t.addStyle("height","auto")}if(d){t.addClass("sapUiPanelHeightSet")}if(o){t.addClass("sapUiPanelWidthSet")}if(r.getApplyContentPadding()){t.addClass("sapUiPanelWithPadding")}if(!r.getEnabled()){t.addClass("sapUiPanelDis")}if(r.getShowCollapseIcon()){t.addClass("sapUiPanelWithCollapseIcon")}t.addClass("sapUiPanelBorderDesign"+r.getBorderDesign());t.addClass("sapUiPanelAreaDesign"+r.getAreaDesign());t.writeClasses();t.writeStyles();if(n){t.writeAttribute("aria-labelledby",s+"-title ");t.writeAttribute("aria-describedby",s+"-acc");t.writeAttribute("role","region");if(r.getCollapsed()){t.writeAttribute("aria-expanded","false")}else{t.writeAttribute("aria-expanded","true")}t.writeAttribute("tabindex","0")}var p=r.getTooltip_AsString();if(p){t.writeAttributeEscaped("title",p)}t.write("><header id='"+s+"-hdr'");t.addClass("sapUiPanelHdr");var g=r.getTitle();var c;var w=a.H5;var C=true;if(g){c=g.getTooltip_AsString();if(c){t.writeAttributeEscaped("title",c)}if(g.getLevel()!=a.Auto){w=g.getLevel();C=g.getEmphasized()}}if(C){t.addClass("sapUiPanelHdrEmph")}t.writeClasses();t.write(">");if(r.getShowCollapseIcon()&&n){t.write('<span id="'+s+'-acc" style="display:none;">');t.writeEscaped(r._rb.getText("PANEL_HEAD_ACC"));t.write("</span>")}var u=r._rb.getText(r.getCollapsed()?"PANEL_EXPAND":"PANEL_COLLAPSE");if(r.getShowCollapseIcon()){t.write("<a id='"+s+"-collArrow' class='sapUiPanelHdrItem sapUiPanelCollArrow' href='#' tabindex='0' title='"+u+"'");if(n){t.writeAttribute("role","button")}t.write(">&nbsp;</a>")}if(g&&g.getIcon()){var f=g.getIcon();var h=[];var b={};b["id"]=s+"-ico";b["title"]=null;h.push("sapUiPanelIco");h.push("sapUiPanelHdrItem");h.push("sapUiTv"+w);t.writeIcon(f,h,b)}var v=e(r.getText());if(!v){v="&nbsp;"}t.write("<"+w+" ");t.addClass("sapUiTv"+w);t.write(" id='"+s+"-title' ");t.addClass("sapUiPanelHdrItem");t.addClass("sapUiPanelTitle");t.writeClasses();if(n){t.writeAttribute("role","heading")}t.write(">");t.write(v);t.write("</"+w+">");var P=r.getButtons();if(P&&P.length>0){t.write("<div id='"+s+"-tb' class='sapUiPanelHdrItem sapUiPanelTb sapUiTbDesignFlat'>");for(var A=0;A<P.length;A++){t.renderControl(P[A])}t.write("</div>")}if(r.getShowCollapseIcon()){t.write("<a id='"+s+"-collIco' class='sapUiPanelHdrRightItem sapUiPanelCollIco' href='#' tabindex='0' title='"+u+"'");if(n){t.writeAttribute("role","button")}t.write(">&nbsp;</a>")}t.write("</header>");if(!r.getCollapsed()){t.write("<div class='sapUiPanelCont' id='",s,"-cont'>");var U=r.getContent(),I=U.length;for(var A=0;A<I;A++){t.renderControl(U[A])}t.write("</div>")}else{r.getContent().forEach(function(e){t.cleanupControlWithoutRendering(e)})}t.write("</section>")};function l(e){return e&&e!=="auto"&&e!=="inherit"}return r},true);