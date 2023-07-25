/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var t=function(){};t.render=function(t,e){var i=e.getAggregation("content");t.write("<div ");t.writeControlData(e);t.addStyle("width",e.getWidth());t.addStyle("height",e.getHeight());t.writeStyles();t.write(">");if(i){t.renderControl(i)}t.write("<div ");t.addStyle("width","0px");t.addStyle("height","0px");t.addStyle("overflow","hidden");t.writeStyles();t.write(">");e.getRanges().forEach(function(e){t.write("<div ");t.writeElementData(e);t.addStyle("width",e.getWidth());t.addStyle("height",e.getHeight());t.writeStyles();t.write("></div>")});t.write("</div>");t.write("</div>")};return t},true);