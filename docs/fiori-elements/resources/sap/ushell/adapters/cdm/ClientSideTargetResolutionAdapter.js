// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/Version","sap/ui/thirdparty/jquery","sap/base/util/deepExtend","sap/base/Log"],function(e,t,r,s){"use strict";var n=function(n,i,o){this._oAdapterConfig=o&&o.config;var a=sap.ushell.Container,u="";if(a){u=a.getLogonSystem().getProductName()||""}this._oLocalSystemAlias={http:{host:"",port:0,pathPrefix:"/sap/bc/"},https:{host:"",port:0,pathPrefix:"/sap/bc/"},rfc:{systemId:"",host:"",service:0,loginGroup:"",sncNameR3:"",sncQoPR3:""},id:"",label:"local",client:"",language:"",properties:{productName:u}};this.getInbounds=function(){var r=this;if(!this._getInboundsDeferred){this._getInboundsDeferred=new t.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(t){var s=t._version&&e(t._version).getMajor()===3?"sap/ushell/adapters/cdm/v3/utilsCdm":"sap/ushell/utils/utilsCdm";sap.ui.require([s],function(e){var s=e.formatSite(t)||[];r._getInboundsDeferred.resolve(s)})},function(e){r._getInboundsDeferred.reject(e)})}return this._getInboundsDeferred.promise()};this._createSIDMap=function(e){return Object.keys(e).sort().reduce(function(t,r){var s=e[r];var n="SID("+s.systemId+"."+s.client+")";if(!t.hasOwnProperty(n)&&s.hasOwnProperty("systemId")&&s.hasOwnProperty("client")){t[n]=r}return t},{})};this._getSystemAliases=function(){var e=this;if(!this.oSystemAliasesDeferred){this.oSystemAliasesDeferred=new t.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(t){var s=r({},t.systemAliases||{});Object.keys(s).forEach(function(e){s[e].id=e});e.oSystemAliasesDeferred.resolve(s)},function(t){e.oSystemAliasesDeferred.reject(t)})}return this.oSystemAliasesDeferred.promise()};this.resolveSystemAlias=function(e){var n=new t.Deferred,i=this;this._getSystemAliases().done(function(t){var o,a;if(t.hasOwnProperty(e)){a=t[e];if(e===""){a.properties=r({},i._oLocalSystemAlias.properties,a.properties||{})}n.resolve(a);return}if(e===""){n.resolve(i._oLocalSystemAlias);return}e=e.toUpperCase(e);if(!i._oSIDMap){i._oSIDMap=i._createSIDMap(t)}if(i._oSIDMap.hasOwnProperty(e)){var u=t[i._oSIDMap[e]];n.resolve(u);return}o="Cannot resolve system alias "+e;s.warning(o,"The system alias cannot be found in the site response","sap.ushell.adapters.cdm.ClientSideTargetResolutionAdapter");n.reject(o)}).fail(function(e){n.reject(e)});return n.promise()};this.getContentProviderDataOriginsLookup=function(){var e=this;if(!this.oContentProviderDataOriginsDeferred){this.oContentProviderDataOriginsDeferred=new t.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(t){var s=null;if(t.contentProviderDataOrigins){s=r({},t.contentProviderDataOrigins)}e.oContentProviderDataOriginsDeferred.resolve(s)},function(t){e.oContentProviderDataOriginsDeferred.reject(t)})}return this.oContentProviderDataOriginsDeferred.promise()}};return n},false);