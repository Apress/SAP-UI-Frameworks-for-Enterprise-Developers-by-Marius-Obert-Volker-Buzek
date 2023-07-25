/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView","sap/m/SplitApp"],function(i,p){"use strict";sap.ui.jsview("sap.collaboration.components.fiori.feed.splitApp.SplitApp",{getControllerName:function(){return"sap.collaboration.components.fiori.feed.splitApp.SplitApp"},createContent:function(i){this.sPrefixId=this.getViewData().controlId;this.oSplitApp=new p(this.sPrefixId+"splitApp");return this.oSplitApp}})});