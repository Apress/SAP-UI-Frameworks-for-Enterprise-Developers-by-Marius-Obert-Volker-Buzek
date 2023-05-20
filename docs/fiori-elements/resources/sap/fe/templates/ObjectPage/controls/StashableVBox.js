/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/m/VBox","sap/ui/core/StashedControlSupport"],function(t,e,o){"use strict";var r,s;var n=t.defineUI5Class;function p(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;a(t,e)}function a(t,e){a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,o){e.__proto__=o;return e};return a(t,e)}let i=(r=n("sap.fe.templates.ObjectPage.controls.StashableVBox",{designtime:"sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"}),r(s=function(t){p(e,t);function e(){return t.apply(this,arguments)||this}return e}(e))||s);o.mixInto(i);return i},false);