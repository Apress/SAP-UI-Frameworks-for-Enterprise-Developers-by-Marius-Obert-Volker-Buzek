/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView","sap/m/Page","sap/m/List"],function(t,e,s){"use strict";sap.ui.jsview("sap.collaboration.components.fiori.feed.splitApp.GroupMaster",{getControllerName:function(){return"sap.collaboration.components.fiori.feed.splitApp.GroupMaster"},createContent:function(t){this.sPrefixId=this.getViewData().controlId;this.groupMasterPage=new e(this.sPrefixId+"groupPage",{title:this.getViewData().groupMasterpageTitle,showNavButton:true,navButtonPress:t.onNavButtonTap,content:[new s(this.sPrefixId+"groupsList",{inset:true})]});return this.groupMasterPage}})});