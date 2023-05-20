/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["./ClusterBase","./library"],function(t,e){"use strict";var i=t.extend("sap.ui.vbm.ClusterDistance",{metadata:{library:"sap.ui.vbm",properties:{distance:{type:"int",group:"Behavior",defaultValue:"128"}},aggregations:{},events:{}}});i.prototype.getClusterDefinition=function(){var e=t.prototype.getClusterDefinition.apply(this,arguments);e.type="distance";e.distance=this.getDistance().toString();return e};return i});