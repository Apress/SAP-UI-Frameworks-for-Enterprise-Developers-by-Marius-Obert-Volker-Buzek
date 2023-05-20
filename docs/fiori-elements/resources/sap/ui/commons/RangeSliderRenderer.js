/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./SliderRenderer","sap/ui/core/Renderer"],function(e,t){"use strict";var i=t.extend(e);i.renderGrip=function(e,t){e.write("<div");e.writeAttribute("id",t.getId()+"-grip");if(t.getEnabled()){e.writeAttribute("tabindex","0")}else{e.writeAttribute("tabindex","-1")}e.writeAttribute("class","sapUiSliGrip");e.writeAttribute("title",t.getValue());e.writeAccessibilityState(t,{role:"slider",controls:t.getId()+"-grip2",orientation:"horizontal",valuemin:t.getMin(),valuemax:t.getValue2(),live:"assertive",disabled:!t.getEditable()||!t.getEnabled(),describedby:t.getTooltip_AsString()?t.getId()+"-Descr "+t.getAriaDescribedBy().join(" "):undefined});e.write(">&#9650;</div>");e.write("<div");e.writeAttribute("id",t.getId()+"-grip2");if(t.getEnabled()){e.writeAttribute("tabindex","0")}else{e.writeAttribute("tabindex","-1")}e.writeAttribute("class","sapUiSliGrip");e.writeAttribute("title",t.getValue2());var i="horizontal";if(t.getVertical()){i="vertical"}e.writeAccessibilityState(t,{role:"slider",controls:t.getId()+"-grip",orientation:i,valuemin:t.getValue(),valuemax:t.getMax(),disabled:!t.getEditable()||!t.getEnabled(),describedby:t.getTooltip_AsString()?t.getId()+"-Descr "+t.getAriaDescribedBy().join(" "):undefined});e.write(">&#9650;</div>")};i.controlAdditionalCode=function(e,t){e.addClass("sapUiRSli")};return i},true);