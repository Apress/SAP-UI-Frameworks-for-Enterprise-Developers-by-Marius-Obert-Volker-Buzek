/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./library","sap/ui/core/Element","sap/m/library"],function(a,r,e,t){"use strict";var u=t.ValueCSSColor;var l=e.extend("sap.suite.ui.microchart.StackedBarMicroChartBar",{metadata:{library:"sap.suite.ui.microchart",properties:{value:{type:"float",group:"Data",defaultValue:"0"},valueColor:{type:"sap.m.ValueCSSColor",group:"Appearance",defaultValue:null},displayValue:{type:"string",group:"Data",defaultValue:null}}}});l.prototype.setValue=function(r,e){var t=a.isNumeric(r);return this.setProperty("value",t?r:NaN,e)};l.prototype.setValueColor=function(a,r){var e=u.isValid(a);return this.setProperty("valueColor",e?a:null,r)};return l});