/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/library","sap/suite/ui/microchart/LineMicroChartPoint"],function(e,r){"use strict";var t=e.ValueCSSColor;var a=r.extend("sap.suite.ui.microchart.LineMicroChartEmphasizedPoint",{metadata:{properties:{color:{type:"sap.m.ValueCSSColor",group:"Misc",defaultValue:"Neutral"},show:{type:"boolean",group:"Appearance",defaultValue:false}}}});a.prototype.setColor=function(e){this.setProperty("color",t.isValid(e)?e:null);return this};return a});