/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/fe/templates/ListComponent"],function(t,e){"use strict";var n,o;var r=t.defineUI5Class;function p(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;s(t,e)}function s(t,e){s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,n){e.__proto__=n;return e};return s(t,e)}let a=(n=r("sap.fe.templates.AnalyticalListPage.Component"),n(o=function(t){p(e,t);function e(){return t.apply(this,arguments)||this}return e}(e))||o);return a},false);