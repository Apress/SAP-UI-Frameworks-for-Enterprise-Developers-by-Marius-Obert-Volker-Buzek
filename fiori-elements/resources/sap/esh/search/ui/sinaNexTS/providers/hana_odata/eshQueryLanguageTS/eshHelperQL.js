/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../eshObjects/src/index"],function(e){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var t=e["Expression"];var r=e["LogicalOperator"];var a=e["SEARCH_DEFAULTS"];var o=e["parseFreeStyleText"];function s(e){var s=e.resourcePath||"/$all";if(e.metadataCall===true){if(e.metadataObjects){if(e.metadataObjects.entitySets){s+="/EntitySets("+e.metadataObjects.entitySets+")"}}return s}if(e.suggestTerm){s=s+"/".concat(encodeURIComponent("GetSuggestion(term='"+e.suggestTerm.replace(/'/g,"''")+"')"))}var i=new t({operator:r.and,items:[]});if(!e){e={query:a.query,scope:a.scope,$select:[],facets:[]}}else{if(!e.query){e.query=a.query}if(!e.scope){e.scope=a.scope}if(!e.$select){e.$select=[]}if(!e.facets){e.facets=[]}}if(e.oDataFilter){i.items.push(e.oDataFilter)}if(i.items.length>0){e.oDataFilter=i}var c=s;var n="SCOPE:"+e.scope;if(e.searchQueryFilter){var u=e.searchQueryFilter.toStatement().trim();if(u.length>0){if(n!==""){n+=" "}n+=u}}if(e.freeStyleText){if(n!==""){n+=" "}var f=o(e.freeStyleText);n+=f.toStatement()}var l={};for(var p=0,g=Object.keys(e);p<g.length;p++){var y=g[p];switch(y){case"query":if(e.$apply){break}var b=n===""?"":"filter(Search.search(query='"+n+"')";if(e.oDataFilter&&e.oDataFilter.items.length>0){b+=" and "+e.oDataFilter.toStatement()}if(n!==""){b+=")"}if(e.groupby&&e.groupby.properties&&e.groupby.properties.length>0){b+="/groupby((".concat(e.groupby.properties.join(","),")");if(e.groupby.aggregateCountAlias&&e.groupby.aggregateCountAlias!==""){b+=",aggregate($count as ".concat(e.groupby.aggregateCountAlias,")")}b+=")"}if(b!==""){l.$apply=b}break;case"$orderby":if(e.$orderby){l.$orderby=e.$orderby.map(function(e){return e.key+" "+e.order}).join(",")}break;case"facets":case"$select":if(e[y].length>0){l[y]=e[y].join(",")}break;case"$top":case"$skip":case"$count":case"whyfound":case"estimate":case"wherefound":case"language":case"facetlimit":l[y]=e[y];break;case"resourcePath":default:break}}var m=Object.keys(l).map(function(e){return encodeURIComponent(e)+"="+encodeURIComponent(l[e])}).join("&");return m===""?c:c+"?"+m}var i={__esModule:true};i.createEshSearchQueryUrl=s;return i})})();