/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var r={};r.render=function(r,e){r.write("<div");r.writeControlData(e);r.addClass("sapUiUx3Exact");r.writeClasses();var t=e.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t)}r.write(">");r.renderControl(e._searchArea);if(e._bDetailsVisible){r.renderControl(e._browser);r.renderControl(e._resultText);r.renderControl(e._resultArea)}r.write("</div>")};return r},true);