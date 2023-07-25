/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/chart/ChartDelegate"],function(e){"use strict";const t=Object.assign({},e);t.rebind=function(t,n){const a=t.getBindingContext("pageInternal");const i=a.getProperty(`${a.getPath()}/alpContentView`);if(!i||i!=="Table"){e.rebind(t,n)}};return t},false);