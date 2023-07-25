/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["../../helpers/StableIdHelper"],function(e){"use strict";var t={};var r=e.getStableIdPartFromDataField;let n=function(){function e(){}t.KeyHelper=e;e.generateKeyFromDataField=function e(t){return r(t,true)};e.validateKey=function e(t){const r=/[^A-Za-z0-9_\-:]/;if(r.exec(t)){throw new Error(`Invalid key: ${t} - only 'A-Za-z0-9_-:' are allowed`)}};e.getSelectionFieldKeyFromPath=function e(t){return t.replace(/([*+])?\//g,"::")};e.getPathFromSelectionFieldKey=function e(t){return t.replace(/::/g,"/")};return e}();t.KeyHelper=n;return t},false);