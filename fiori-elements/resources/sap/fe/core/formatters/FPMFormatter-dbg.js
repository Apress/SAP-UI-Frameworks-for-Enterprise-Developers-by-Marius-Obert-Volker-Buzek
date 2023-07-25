/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const t=function(t,e,n){const o=t.getController().getExtensionAPI();const r=e.split(".");const s=r.pop();const i=r.join("/");return new Promise(t=>{sap.ui.require([i],e=>{t(e[s].bind(o)(this.getBindingContext(),n||[]))})})};t.__functionName="sap.fe.core.formatters.FPMFormatter#customBooleanPropertyCheck";const e=function(t){if(e.hasOwnProperty(t)){for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++){o[r-1]=arguments[r]}return e[t].apply(this,o)}else{return""}};e.customBooleanPropertyCheck=t;return e},true);