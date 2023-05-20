// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/deepExtend","sap/base/util/ObjectPath","sap/ui/thirdparty/jquery","sap/ushell/User","sap/ui/core/Configuration"],function(e,t,r,s,o,i){"use strict";var n=function(n,a,u){var d,l,f,c,p,g;this.load=function(){var e;l=r.get("config.systemProperties.logoutUrl",u);f=r.get("config.systemProperties.logoutMethod",u)||"GET";c=r.get("config.systemProperties.csrfTokenUrl",u);p=r.get("config.systemProperties.sessionKeepAlive.url",u);g=r.get("config.systemProperties.sessionKeepAlive.method",u);e=t({id:""},r.get("config.userProfile.defaults",u));d=new o(e);m(e);return(new s.Deferred).resolve().promise()};this.getSystem=function(){return n};this.getUser=function(){return d};this._getLogoutUrl=function(){return l};this._setWindowLocation=function(e){window.location.href=e};this.logout=function(){var t=new s.Deferred,r=this;if(f==="POST"){e.info("performing logout from system via POST",undefined,"sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");s.ajax({type:"HEAD",url:c,headers:{"X-CSRF-Token":"Fetch"},success:function(o,i,n){s.ajax({type:"POST",url:l,headers:{"X-CSRF-Token":n.getResponseHeader("X-CSRF-Token")},success:function(e){r._setWindowLocation(e);t.resolve()},error:function(){e.error("Logging out via POST failed",undefined,"sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");t.resolve()}})},error:function(){e.error("fetching X-CSRF-Token for logout via POST failed for system: "+n.getAlias(),undefined,"sap.ushell.appRuntime.ui5.services.adapters.ContainerAdapter::logout");t.resolve()}})}else{try{if(typeof l==="string"&&l.length>0){this._logoutViaHiddenIFrame(t,l);setTimeout(t.resolve,4e3)}else{t.resolve()}}catch(r){e.error("logout from iframe "+document.URL+" failed",r,"sap.ushell.appRuntime.ui5.SessionHandlerAgent");t.resolve()}}return t.promise()};this._logoutViaHiddenIFrame=function(e,t){var r=document.createElement("iframe"),s=t.replace(/"/g,'\\"');window.addEventListener("message",function(r){if((r.data&&r.data.url)===t){e.resolve()}});r.style.visibility="hidden";r.setAttribute("src",t);function o(){this.contentWindow.parent.postMessage({url:s,request_id:"dummy-logout-id"},"*")}r.addEventListener("load",o);r.addEventListener("error",o);document.body.appendChild(r)};this.sessionKeepAlive=function(){if(typeof p==="string"&&p.length>0&&typeof g==="string"&&g.length>0){var t=new XMLHttpRequest;t.open(g,p,true);t.onreadystatechange=function(){if(this.readyState===4){e.debug("Server session was extended")}};t.send()}};function m(e){var t=i.getFormatSettings();if(e.sapDateFormat){t.setLegacyDateFormat(e.sapDateFormat)}if(e.sapDateCalendarCustomizing){t.setLegacyDateCalendarCustomizing(e.sapDateCalendarCustomizing)}if(e.sapNumberFormat){t.setLegacyNumberFormat(e.sapNumberFormat)}if(e.sapTimeFormat){t.setLegacyTimeFormat(e.sapTimeFormat)}if(typeof e.currencyFormats==="object"){t.addCustomCurrencies(e.currencyFormats)}}};return n},true);