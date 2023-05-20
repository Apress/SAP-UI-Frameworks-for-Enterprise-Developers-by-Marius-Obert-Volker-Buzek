/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object"],function(t){"use strict";var r={};function o(t,r){t.prototype=Object.create(r.prototype);t.prototype.constructor=t;e(t,r)}function e(t,r){e=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(r,o){r.__proto__=o;return r};return e(t,r)}let n=function(t){o(e,t);function e(r){var o;o=t.call(this)||this;o._sErrorCode=r;return o}r.NavError=e;var n=e.prototype;n.getErrorCode=function t(){return this._sErrorCode};return e}(t);r.NavError=n;const c=t.extend("sap.fe.navigation.NavError",n.prototype);return c},false);