/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var n;var r={};r._d3Path=sap.ui.require.toUrl("sap/ui/thirdparty")+"/d3.js";r.run=function(n,t){r.getD3().then(function(r){var i=n.graph;var e=r.layout.force().nodes(i.nodes).links(i.links).alpha(n.alpha).friction(n.friction).charge(n.charge).start();setTimeout(e.stop,n.maximumDuration);e.on("end",function(){t(i)})})};r.layout=function(n){return new Promise(function(t,i){r.run(n,t)})};r.getD3=function(){if(n){return Promise.resolve(n)}else{return new Promise(function(r){sap.ui.require(["sap/ui/thirdparty/d3"],function(t){n=t;r(t)})})}};return r},true);