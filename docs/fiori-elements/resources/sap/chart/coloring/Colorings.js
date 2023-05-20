/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/chart/coloring/criticality/Criticality","sap/chart/coloring/emphasis/Emphasis","sap/chart/coloring/gradation/Gradation","sap/chart/ChartLog","sap/ui/thirdparty/jquery"],function(e,i,t,r,n){"use strict";var a=["Criticality","Emphasis","Gradation"];function o(e,i,t){var n=t.aInResultDim,o=i.coloring||null;if(n&&n.length){throw new r("error","","Semantic coloring could not be applied if inResult Dimensions exist.")}if(!i||!i.coloring){throw new r("error","activeColoring","The activeColoring is mandatory.")}if(a.indexOf(o)<0){throw new r("error","activeColoring","The active coloring type, "+o+", is not supported.")}else if(Object.keys(e).indexOf(o)<0){throw new r("error","activeColoring","The active coloring type, "+o+", should be configured in Coloring.")}}function l(e){if(e.length<=1){return false}if(e.length>2){return true}var i,t,r=false;e.forEach(function(e){var n=e.getSemantics();if(n==="actual"&&!i){i=e}else if(n==="reference"&&!t){t=e}else{r=true}});r=r||i&&t&&i.getSemanticallyRelatedMeasures()!==t.getName();return r}return{getCandidateSetting:function(r,a,s,c,f,u,d,g){o(r,a||{},c);var h,p={},b={Criticality:e,Emphasis:i,Gradation:t};h=b[a.coloring];p.bMBC=u==="heatmap";p.bShowUnmentionedMsr=!(u&&u.indexOf("scatter")>-1||u&&u.indexOf("bubble")>-1);p.bIsScatter=u&&u.indexOf("scatter")>-1||u&&u.indexOf("bubble")>-1;p.bIsPie=u&&(u==="pie"||u.indexOf("donut")>-1);p.bWaterfall=u&&u.indexOf("waterfall")>-1;p.bTimeChart=u&&u.indexOf("timeseries")>-1;p.bIsLine=u&&u.indexOf("line")>-1;n.extend(true,p,g);if(u==="timeseries_bullet"&&l(c.aMsr)){return{}}if(h){var m=h.getCandidateSetting(r,a,s,c,f,p,d);m.type=a.coloring;return m}else{return{}}}}});