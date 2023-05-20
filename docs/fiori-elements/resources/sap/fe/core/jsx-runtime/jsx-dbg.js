/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/jsx-runtime/jsx-control","sap/fe/core/jsx-runtime/jsx-xml"],function(e,t){"use strict";let n=false;const r=function(r,u,o){if(!n){return e(r,u,o,s)}else{return t(r,u,o)}};r.renderAsXML=function(e){n=true;const t=e();n=false;return t};let s={};r.getContext=function(){return s};r.withContext=function(e,t){s=e;const n=t();s={};return n};return r},false);