/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";let e=function(){function e(){this._fnResolve=null;this._isResolved=false}var s=e.prototype;s.waitFor=function e(){if(this._isResolved){return Promise.resolve()}else{return new Promise(e=>{this._fnResolve=e})}};s.resolve=function e(){if(!this._isResolved){this._isResolved=true;if(this._fnResolve){this._fnResolve()}}};return e}();return e},false);