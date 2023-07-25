/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object"],function(e){"use strict";var t=e.extend("sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant",{_sServiceUri:null,_mBindingInfo:null,_mServiceInfo:null,constructor:function(e,t,n){this._sServiceUri=e;this._mBindingInfo=n;this._mServiceInfo=t;this._oExtensionDataPromise=this._determineExtensionData()},getExtensionData:function(){return Promise.resolve(null)},getMetadata:function(){return this.getMetadata()},getNavigationUri:function(){return Promise.resolve(null)},getTexts:function(){return Promise.resolve(null)},isActive:function(){return Promise.resolve(true)}});t.prototype._determineExtensionData=function(){return Promise.resolve(null)};return t});