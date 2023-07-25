/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/JSView","sap/m/App"],function(e,i){"use strict";sap.ui.jsview("sap.collaboration.components.fiori.feed.app.App",{getControllerName:function(){return"sap.collaboration.components.fiori.feed.app.App"},createContent:function(e){this.sPrefixId=this.getViewData().controlId;this.oApp=new i(this.sPrefixId+"app");return this.oApp}})});