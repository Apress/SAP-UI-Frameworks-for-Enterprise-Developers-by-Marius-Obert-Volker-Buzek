/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../core/ajax","./ajaxTemplates"],function(e,t){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var r=e["Client"];var i=t["isSearchRequest"];var a=t["isNlqSearchRequest"];var n=t["isChartRequest"];var s=t["isValueHelperRequest"];var u=t["isSuggestionRequest"];var l=t["isObjectSuggestionRequest"];var o=t["isNavigationEvent"];var v=function e(t){if(t.SubFilters!==undefined){delete t.ActAsQueryPart;for(var r=0;r<t.SubFilters.length;r++){this._removeActAsQueryPart(t.SubFilters[r])}}};function c(e){var t={csrf:true,requestNormalization:function e(t){if(t===null){return""}if(o(t)){return{NotToRecord:true}}if(i(t)||a(t)||n(t)||s(t)||u(t)||l(t)){delete t.d.QueryOptions.ClientSessionID;delete t.d.QueryOptions.ClientCallTimestamp;delete t.d.QueryOptions.ClientServiceName;delete t.d.QueryOptions.ClientLastExecutionID;var r=JSON.stringify(t);var c='"DataSources":[';var d="]";var f=r.indexOf(c);var S=f+r.substring(f).indexOf(d)+d.length;var g=',"ExcludedDataSources":[]';r=[r.slice(0,S),g,r.slice(S)].join("");t=JSON.parse(r);if(t.d.Filter&&(i(t)||a(t)||n(t)||s(t)||u(t)||l(t))){v(t.d.Filter)}}return t}};e=Object.assign({},t,e);var c=new r(e);return c}var d={__esModule:true};d.createAjaxClient=c;return d})})();