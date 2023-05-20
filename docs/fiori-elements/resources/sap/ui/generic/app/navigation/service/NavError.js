/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/NavError"],function(r){"use strict";var e=r.extend("sap.ui.generic.app.navigation.service.NavError",{metadata:{publicMethods:["getErrorCode"],properties:{},library:"sap.ui.generic.app"},constructor:function(e){r.apply(this);this._sErrorCode=e}});e.prototype.getErrorCode=function(){return this._sErrorCode};return e});