/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library"],function(t){"use strict";var e=t.VisibleItemCountMode;var i={};i.render=function(t,i){var r=i.getVisibleItemCountMode()===e.Auto;t.write("<div");t.writeControlData(i);t.addClass("sapUiUx3FacetFilter");t.writeClasses();if(r){t.writeAttribute("style","height:100%")}t.write(">");var s=i.getLists();if(s){for(var a=0;a<s.length;a++){s[a].sWidth=100/s.length+"%";s[a].bFullHeight=r;t.renderControl(s[a])}}t.write("</div>")};return i},true);