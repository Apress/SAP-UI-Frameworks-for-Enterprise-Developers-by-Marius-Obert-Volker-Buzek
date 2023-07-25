/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var t={};t.render=function(t,e){t.write("<div ");t.writeControlData(e);t.addClass("sapUiUx3FFLst");t.writeClasses();t.writeAttribute("style","width:"+e.sWidth);t.write(">");t.write('<header id="'+e.getId()+'-head"  class="sapUiUx3FFLstHead"');if(e.getTooltip_AsString()){t.writeAttributeEscaped("title",e.getTooltip_AsString())}t.write(">");t.write('<h3 id="'+e.getId()+'-head-txt"  class="sapUiUx3FFLstHeadTxt">');if(e.getTitle()){t.writeEscaped(e.getTitle())}t.write("</h3>");t.write("</header>");t.renderControl(e._oListBox);t.write("</div>")};return t},true);