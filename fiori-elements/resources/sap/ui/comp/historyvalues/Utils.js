/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(function(){"use strict";return{getAppInfo:function e(){var t=sap.ushell.Container.getService("AppLifeCycle"),i=t.getCurrentApplication(),n,a,p,f={};if(i){n=i.componentInstance;f.homePage=i.homePage}if(n){a=n.getMetadata()}if(a){p=a.getManifest()}if(p){f.id=p["sap.app"].id}return f}}});