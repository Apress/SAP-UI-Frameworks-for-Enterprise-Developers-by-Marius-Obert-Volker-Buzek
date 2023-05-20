/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/util/DataProvider","sap/base/Log","sap/ui/model/odata/v4/ODataUtils","sap/ui/core/Core","sap/base/util/fetch","sap/base/util/deepClone"],function(e,t,r,s,i,n){"use strict";var o=[429,503];var a=["no-cors","same-origin","cors"];var u=["GET","POST","HEAD","PUT","PATCH","DELETE","OPTIONS"];var f={json:"application/json, */*",xml:"application/xml, text/xml, */*"};function d(e,t){var r=Object.entries(t).map(function(e){return encodeURIComponent(e[0])+"="+encodeURIComponent(e[1])});return e+(e.indexOf("?")!==-1?"&":"?")+r.join("&")}function h(e){var t=e.headers.get("Content-Type");if(!t){return false}return t.indexOf("application/json")!==-1}function p(e){var t=e.headers.get("Content-Type");if(!t){return false}return t.indexOf("application/xml")!==-1||t.indexOf("text/xml")!==-1}var l=e.extend("sap.ui.integration.util.RequestDataProvider",{metadata:{library:"sap.ui.integration",properties:{allowCustomDataType:{type:"boolean",defaultValue:false}},associations:{host:{type:"sap.ui.integration.Host",multiple:false}}}});l.prototype.destroy=function(){if(this._iRetryAfterTimeout){clearTimeout(this._iRetryAfterTimeout)}e.prototype.destroy.apply(this,arguments)};l.prototype.getLastResponse=function(){return this._lastResponse};l.prototype.getData=function(){var e=this.getSettings().request,t=Promise.resolve(e);if(this._oDestinations){t=this._oDestinations.process(e)}if(this._oCsrfTokenHandler){t=t.then(function(e){return this._oCsrfTokenHandler.resolveToken(e)}.bind(this))}t=t.then(this._fetch.bind(this));if(this._oCsrfTokenHandler){t=t.catch(this._handleExpiredToken.bind(this))}return t};l.prototype._handleExpiredToken=function(e){if(this._oCsrfTokenHandler.isExpiredToken(this.getLastResponse())){this._oCsrfTokenHandler.resetTokenByRequest(this.getSettings().request);return this.getData().catch(function(e){throw e})}throw e};l.prototype._fetch=function(e){var s="Invalid request";if(!e||!e.url){t.error(s);return Promise.reject(s)}if(!this.getAllowCustomDataType()&&e.dataType){t.error("To specify dataType property in the Request Configuration, first set allowCustomDataType to 'true'.")}var i=e.url,n=e.parameters,o=this.getAllowCustomDataType()&&e.dataType||"json",a=e.headers||{},u=e.batch,h,p,l,c=e.method&&e.method.toUpperCase()||"GET",y=this._hasHeader(e,"Content-Type","application/json"),m=["GET","HEAD"].includes(c);if(!i.startsWith("/")){i=this._getRuntimeUrl(e.url)}if(n){if(y){l=JSON.stringify(n)}else if(m){i=d(i,n)}else{l=new URLSearchParams(n)}}if(u){h=r.serializeBatchRequest(Object.values(u));l=h.body;a=Object.assign({},a,h.headers)}p={url:i,options:{mode:e.mode||"cors",method:c,headers:new Headers(a)}};if(l){p.options.body=l}if(e.withCredentials){p.options.credentials="include"}if(!p.options.headers.get("Accept")&&f[o]){p.options.headers.set("Accept",f[o])}p=this._modifyRequestBeforeSent(p,this.getSettings());if(!this._isValidRequest(p)){t.error(s);return Promise.reject(s)}return this._request(p).then(function(e){var t=e[0];if(u){return this._deserializeBatchResponse(u,t)}return t}.bind(this))};l.prototype._request=function(e,t){var r=this._getFetchMethod();return r(e.url,e.options).then(function(r){if(this.bIsDestroyed){return Promise.reject("RequestDataProvider is already destroyed before the response is received.")}this._lastResponse=r;if(!r.ok){return r.text().then(function(s){var i=[r.status+" "+r.statusText,r,s,e];if(t){return Promise.reject(i)}return this._retryRequest(i)}.bind(this))}return r.text().then(function(e){if(h(r)){e=JSON.parse(e!==""?e:null)}else if(p(r)){e=(new window.DOMParser).parseFromString(e,"text/xml")}return[e,r]})}.bind(this),function(t){return Promise.reject([t.toString(),null,null,e])})};l.prototype._retryRequest=function(e){var r=e[1],s=e[3],i=this._getRetryAfter(r);if(!o.includes(r.status)){return Promise.reject(e)}if(!i){t.warning("Request could be retried, but Retry-After header or configuration parameter retryAfter are missing.");return Promise.reject(e)}if(this._iRetryAfterTimeout){e[0]="The retry was already scheduled.";return Promise.reject(e)}return new Promise(function(e,t){this._iRetryAfterTimeout=setTimeout(function(){this._request(s,true).then(e,t);this._iRetryAfterTimeout=null}.bind(this),i*1e3)}.bind(this))};l.prototype._getRetryAfter=function(e){var r=this.getSettings().request,s=e.headers.get("Retry-After")||r.retryAfter;if(!s){return 0}if(Number.isInteger(s)){return s}if(!s.match(/^\d+$/)){t.error("Only number of seconds is supported as value of retry-after. Given '"+s+"'.");return 0}return parseInt(s)};l.prototype._getFetchMethod=function(){var e=this.getSettings().request,t=s.byId(this.getCard()),r=t&&t.getAggregation("_extension"),o=s.byId(this.getHost());if(r){return function(t,s){return r.fetch(t,s,n(e,1e3))}}if(o){return function(r,s){return o.fetch(r,s,n(e,1e3),t)}}return i};l.prototype._hasHeader=function(e,t,r){if(!e.headers){return false}for(var s in e.headers){if(s.toLowerCase()===t.toLowerCase()&&e.headers[s]===r){return true}}return false};l.prototype._isValidRequest=function(e){if(!e){t.error("Request is not valid. Request object is missing.");return false}if(!e.url){t.error("Request is not valid. URL is missing.");return false}if(!e.options){t.error("Request is not valid. Options are missing.");return false}if(a.indexOf(e.options.mode)===-1){t.error("Request is not valid. Mode is not among "+a.toString());return false}if(u.indexOf(e.options.method)===-1){t.error("Request is not valid. Method is not among "+a.toString());return false}if(e.options.headers&&!(e.options.headers instanceof Headers)){t.error("Request is not valid. The headers option is not instance of Headers interface.");return false}if(typeof e.url!=="string"){return false}return true};l.prototype._deserializeBatchResponse=function(e,t){return new Promise(function(s,i){var n=this.getLastResponse().headers.get("Content-Type"),o=r.deserializeBatchResponse(n,t,false),a=Object.keys(e),u={};a.forEach(function(e,t){var r=o[t],s;if(!r){i("Batch responses do not match the batch requests.");return}s=new Response(r.responseText,r);if(!s.ok){i("One of batch requests fails with '"+s.status+" "+s.statusText+"'");return}u[e]=r.responseText?JSON.parse(r.responseText):{}});s(u)}.bind(this))};l.prototype._modifyRequestBeforeSent=function(e,t){var r=s.byId(this.getCard()),i=s.byId(this.getHost()),n;if(!i){return e}if(i.modifyRequestHeaders){n=i.modifyRequestHeaders(Object.fromEntries(e.options.headers),t,r);e.options.headers=new Headers(n)}if(i.modifyRequest){e=i.modifyRequest(e,t,r)}return e};l.prototype.getDetails=function(){return"Backend interaction - load data from URL: "+this.getSettings().request.url};return l});