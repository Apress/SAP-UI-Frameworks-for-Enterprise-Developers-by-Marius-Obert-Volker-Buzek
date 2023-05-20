/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/RadioButton"],function(e){"use strict";var o=e.extend("sap.ui.vk.measurements.ColorRadioButton",{metadata:{library:"sap.ui.vk",properties:{color:"sap.ui.core.CSSColor"}},renderer:{apiVersion:2,render:function(e,o){e.openStart("div",o).class("sapUiVizKitMeasurementColorRb").attr("tabindex",o.hasOwnProperty("_iTabIndex")?o._iTabIndex:0);if(o.getSelected()){e.class("sapUiVizKitMeasurementColorRbSel")}e.openEnd();e.openStart("div").style("background-color",o.getColor()).openEnd().close("div");e.close("div")}}});return o});