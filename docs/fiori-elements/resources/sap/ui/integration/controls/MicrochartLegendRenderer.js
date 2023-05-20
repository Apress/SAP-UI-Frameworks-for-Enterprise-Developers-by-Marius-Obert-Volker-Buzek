/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/library","sap/ui/core/Core"],function(e,r){"use strict";var n=e.ValueColor;var o={apiVersion:2};o.render=function(e,n){var t=r.byId(n.getChart()),a=[],i=n.getAggregation("_titles");if(t){a=t._calculateChartData().map(function(e){return e.color})}e.openStart("div",n).class("sapUiIntMicrochartLegend").openEnd();a.forEach(function(r,t){e.openStart("div").class("sapUiIntMicrochartLegendItem").openEnd();e.openStart("div");o.addColor(e,n,r);e.openEnd().close("div");e.renderControl(i[t]);e.close("div")});e.close("div")};o.addColor=function(e,r,o){if(n[o]){e.class("sapUiIntMicrochartLegendItem"+o)}else{var t=r._mLegendColors[o]||o;e.style("background",t)}};return o},true);