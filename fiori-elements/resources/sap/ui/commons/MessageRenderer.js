/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Link"],function(e){"use strict";var i={};i.render=function(i,t){i.write('<div class="sapUiMsg" tabindex="0"');i.writeControlData(t);i.write(">");i.write('<div class="sapUiMsgIcon sapUiMsgIcon'+t.getType()+'"></div>');if(typeof t.fnCallBack==="function"){i.write('<span class="sapUiMsgLnk">');if(!t.oLink){t.oLink=new e;var s=sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");t.oLink.setText(s.getText("MSGLIST_DETAILS"));t.oLink.attachPress(function(){t.openDetails()})}i.renderControl(t.oLink);i.write(" - </span>")}i.write('<span class="sapUiMsgTxt">');i.writeEscaped(t.getText());i.write("</span>");i.write("</div>")};return i},true);