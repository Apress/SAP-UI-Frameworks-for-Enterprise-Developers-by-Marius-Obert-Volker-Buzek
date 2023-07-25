/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/m/library","sap/ui/core/library","sap/ui/unified/library"],function(){"use strict";var e=sap.ui.getCore().initLibrary({name:"sap.ui.vbm",types:["sap.ui.vbm.ClusterInfoType","sap.ui.vbm.SemanticType"],controls:["sap.ui.vbm.AnalyticMap","sap.ui.vbm.GeoMap","sap.ui.vbm.VBI","sap.ui.vbm.Cluster","sap.ui.vbm.Viewport"],elements:["sap.ui.vbm.Area","sap.ui.vbm.Areas","sap.ui.vbm.Box","sap.ui.vbm.Boxes","sap.ui.vbm.Circle","sap.ui.vbm.Circles","sap.ui.vbm.Container","sap.ui.vbm.Containers","sap.ui.vbm.DragSource","sap.ui.vbm.DropTarget","sap.ui.vbm.Feature","sap.ui.vbm.FeatureCollection","sap.ui.vbm.GeoJsonLayer","sap.ui.vbm.GeoCircle","sap.ui.vbm.GeoCircles","sap.ui.vbm.Legend","sap.ui.vbm.LegendItem","sap.ui.vbm.Pie","sap.ui.vbm.PieItem","sap.ui.vbm.Pies","sap.ui.vbm.Region","sap.ui.vbm.Resource","sap.ui.vbm.Route","sap.ui.vbm.Routes","sap.ui.vbm.Spot","sap.ui.vbm.Spots","sap.ui.vbm.VoAggregation","sap.ui.vbm.VoBase","sap.ui.vbm.ClusterBase","sap.ui.vbm.ClusterTree","sap.ui.vbm.ClusterGrid","sap.ui.vbm.ClusterDistance","sap.ui.vbm.Heatmap","sap.ui.vbm.HeatPoint","sap.ui.vbm.ClusterContainer","sap.ui.vbm.Adapter","sap.ui.vbm.Adapter3D"],version:"1.113.0"});sap.ui.loader.config({shim:{"sap/ui/vbm/adapter3d/thirdparty/three":{exports:"THREE",amd:true},"sap/ui/vbm/adapter3d/thirdparty/ColladaLoader":{exports:"THREE.ColladaLoader",deps:["sap/ui/vbm/adapter3d/thirdparty/three"]},"sap/ui/vbm/adapter3d/thirdparty/OrbitControls":{exports:"THREE.OrbitControls",deps:["sap/ui/vbm/adapter3d/thirdparty/three"]},"sap/ui/vbm/adapter3d/thirdparty/DecalGeometry":{exports:"DecalGeometry",deps:["sap/ui/vbm/adapter3d/thirdparty/three"]},"sap/ui/vbm/adapter3d/thirdparty/html2canvas":{exports:"html2canvas",amd:true}}});e.SemanticType={None:"None",Error:"Error",Warning:"Warning",Success:"Success",Default:"Default",Inactive:"Inactive",Hidden:"Hidden"};e.ClusterInfoType={ContainedVOs:0,ChildCluster:1,ParentNode:2,NodeInfo:10,Edges:11};e.RouteType={Straight:"Straight",Geodesic:"Geodesic"};e.getResourceBundle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n")};e.findInArray=function(e,a){if(!Array.isArray(e)||typeof a!=="function"){return undefined}for(var r=0,i=e.length;r<i;r++){var s=e[r];if(a(s)){return s}}return undefined};e.findIndexInArray=function(e,a){if(!Array.isArray(e)||typeof a!=="function"){return-1}for(var r=0,i=e.length;r<i;r++){var s=e[r];if(a(s)){return r}}return-1};return e},false);