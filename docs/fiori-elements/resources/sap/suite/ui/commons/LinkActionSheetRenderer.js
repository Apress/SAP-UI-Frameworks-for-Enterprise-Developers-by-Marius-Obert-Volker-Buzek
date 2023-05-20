/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/m/ActionSheetRenderer","sap/ui/core/Renderer","sap/m/Dialog","sap/ui/Device"],function(e,t,n,i){"use strict";var s=t.extend(e);s.render=function(e,t){var s=t.getItems(),r,a=false;for(r=0;r<s.length;r++){if(s[r].getIcon&&s[r].getIcon()){a=true;break}}e.write("<div");e.writeControlData(t);e.addClass("sapMActionSheet");e.addClass("sapUILinkActionSheet");if(a){e.addClass("sapMActionSheetMixedButtons")}e.writeClasses();var o=t.getTooltip_AsString();if(o){e.writeAttributeEscaped("title",o)}e.write(">");for(r=0;r<s.length;r++){if(s[r].getType){var d=s[r];d.addStyleClass("sapMActionSheetButton");d.addStyleClass("sapUILinkActionSheetButton");e.renderControl(d)}else if(s[r].getHref){e.renderControl(s[r].addStyleClass("sapUILinkActionSheetLink"))}}if((i.os.ios&&i.system.phone||n._bOneDesign&&i.system.phone)&&t.getShowCancelButton()){e.renderControl(t._getCancelButton())}e.write("</div>")};return s},true);