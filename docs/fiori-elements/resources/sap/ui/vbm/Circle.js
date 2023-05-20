/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["./VoBase","./library"],function(t,e){"use strict";var i=t.extend("sap.ui.vbm.Circle",{metadata:{library:"sap.ui.vbm",properties:{position:{type:"string",group:"Misc",defaultValue:"0;0;0"},radius:{type:"string",group:"Misc",defaultValue:"20"},color:{type:"string",group:"Misc",defaultValue:"RGBA(0,0,128,128)"},colorBorder:{type:"string",group:"Misc",defaultValue:"RGB(0,0,0)"},slices:{type:"string",group:"Misc",defaultValue:null}},events:{}}});i.prototype.openContextMenu=function(t){this.oParent.openContextMenu("Circle",this,t)};i.prototype.getDataElement=function(){var e=t.prototype.getDataElement.apply(this,arguments);var i=this.oParent.mBindInfo;if(i.P){e.P=this.getPosition()}if(i.R){e.R=this.getRadius()}if(i.C){e.C=this.getColor()}if(i.CB){e.CB=this.getColorBorder()}if(i.NS){e.NS=this.getSlices()}return e};i.prototype.handleChangedData=function(t){if(t.P){this.setPosition(t.P)}if(t.R){this.setRadius(t.R)}};return i});