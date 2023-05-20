/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["./ClusterBase","./library"],function(t,e){"use strict";var r=t.extend("sap.ui.vbm.ClusterTree",{metadata:{library:"sap.ui.vbm",properties:{animateClusterSplit:{type:"boolean",group:"Behavior",defaultValue:true}},aggregations:{},events:{}}});r.prototype.getClusterDefinition=function(){var e=t.prototype.getClusterDefinition.apply(this,arguments);e.type="tree";e.animation=this.getAnimateClusterSplit().toString();return e};return r});