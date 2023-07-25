/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var s={};s.render=function(s,e){s.write('<div class="'+e.getClasses()+'"');s.writeControlData(e);s.write(">");s.write('<div class="sapUiMsgToastMsg sapUiShd">');if(e.oMessage){s.renderControl(e.oMessage)}else{var i=sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons").getText("MSGTOAST_MULTI_MSGS");s.write('<div class="sapUiMsg" tabindex="0"><span class="sapUiMsgTxt">'+i+"</span></div>")}s.write("</div>");s.write('<div id="'+e.getId()+'Arrow" class="sapUiMsgToastArrow"></div>');s.write("</div>")};return s},true);