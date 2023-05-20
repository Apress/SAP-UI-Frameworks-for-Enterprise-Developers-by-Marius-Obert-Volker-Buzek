/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../error/ErrorHandler","sap/ui/Device","./JsSearchFactory"],function(e,t,r){function i(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function o(e,t){for(var r=0;r<t.length;r++){var i=t[r];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function s(e,t,r){if(t)o(e.prototype,t);if(r)o(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var a=i(e);var l=i(r);var u=function(){function e(){n(this,e);this.errorHandler=new a;this.initPromise=sap.ushell.Container.getServiceAsync("SearchableContent").then(function(e){return e.getApps()},function(e){this.errorHandler.onErrorDeferred(e);return Promise.resolve([])}.bind(this)).then(function(e){e=this.formatApps(e);var r=true;var i=t&&t.browser&&t.browser.msie||false;if(!String.prototype.normalize||i){r=false}this.searchEngine=l.createJsSearch({objects:e,fields:["title","subtitle","keywords"],shouldNormalize:r,algorithm:{id:"contains-ranked",options:[50,49,40,39,5,4,51]}})}.bind(this))}s(e,[{key:"formatApps",value:function e(t){var r=[];t.forEach(function(e){e.visualizations.forEach(function(e){var t=e.title;if(e.subtitle){t=t+" - "+e.subtitle}r.push({title:e.title||"",subtitle:e.subtitle||"",keywords:e.keywords?e.keywords.join(" "):"",icon:e.icon||"",label:t,visualization:e,url:e.targetURL})})});return r}},{key:"prefetch",value:function e(){}},{key:"search",value:function e(t){return this.initPromise.then(function(){var e=this.searchEngine.search({searchFor:t.searchTerm,top:t.top,skip:t.skip});var r=[];for(var i=0;i<e.results.length;++i){var n=e.results[i];var o=Object.assign({},n.object);var s=n.highlighted.title||n.object.title;if(n.highlighted.subtitle){s=s+" - "+n.highlighted.subtitle}else if(n.object.subtitle){s=s+" - "+n.object.subtitle}if(s){o.label=s}r.push(o)}return{totalCount:e.totalCount,tiles:r}}.bind(this))}}]);return e}();return u})})();