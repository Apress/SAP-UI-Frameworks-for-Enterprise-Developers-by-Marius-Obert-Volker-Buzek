/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var e={};async function n(e){let n;const r=new Promise(e=>{n=e});if(e.length>0){sap.ui.require(e,function(){for(var e=arguments.length,r=new Array(e),i=0;i<e;i++){r[i]=arguments[i]}n(r)})}else{n([])}return r}e.requireDependencies=n;return e},false);