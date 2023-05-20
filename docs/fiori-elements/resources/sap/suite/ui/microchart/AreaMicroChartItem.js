/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["./library","sap/ui/core/Element"],function(t,e){"use strict";var i=e.extend("sap.suite.ui.microchart.AreaMicroChartItem",{metadata:{library:"sap.suite.ui.microchart",properties:{color:{group:"Misc",type:"sap.m.ValueCSSColor",defaultValue:"Neutral"},title:{type:"string",group:"Misc",defaultValue:null}},defaultAggregation:"points",aggregations:{points:{multiple:true,type:"sap.suite.ui.microchart.AreaMicroChartPoint",bindable:"bindable"}}}});i.prototype.init=function(){this.setAggregation("tooltip","((AltText))",true)};return i});