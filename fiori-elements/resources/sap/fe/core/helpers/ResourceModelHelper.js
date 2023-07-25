/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log"],function(e){"use strict";var t={};function o(e){if(e.isA("sap.ui.core.mvc.Controller")||e.isA("sap.ui.core.mvc.ControllerExtension")){var t;return(t=e.getView())===null||t===void 0?void 0:t.getModel("sap.fe.i18n")}else{return e.getModel("sap.fe.i18n")}}t.getResourceModel=o;function n(t,o){const n=/{([A-Za-z0-9_.|@]+)>([A-Za-z0-9_.|]+)}/.exec(t);if(n){try{const e=o.getModel(n[1]).getResourceBundle();return e.getText(n[2])}catch(o){e.info(`Unable to retrieve localized text ${t}`)}}return t}t.getLocalizedText=n;return t},false);