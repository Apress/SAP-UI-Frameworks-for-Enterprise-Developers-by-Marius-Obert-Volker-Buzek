/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"],function(e){"use strict";var i={};var n=e.resolveBindingString;var r=e.not;var o=e.equal;var s=e.constant;var a=e.compileExpression;var t=e.and;const l=e=>{const i=n(e===null||e===void 0?void 0:e.header);const l=n(e===null||e===void 0?void 0:e.tabTitle);const d=s(e.headerVisible);return a(t(d,r(o(i,l))))};i.buildExpressionForHeaderVisible=l;return i},false);