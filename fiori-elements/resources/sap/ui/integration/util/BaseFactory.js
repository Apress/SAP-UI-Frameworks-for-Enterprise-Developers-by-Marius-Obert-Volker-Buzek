/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./BindingHelper","sap/base/util/merge","sap/ui/base/Object"],function(t,e,a){"use strict";var i=a.extend("sap.ui.integration.util.BaseFactory",{constructor:function(t){a.call(this);this._oCard=t}});i.prototype.createBindingInfos=function(a){var i=e({},a),n=i.data;delete i.data;i=t.createBindingInfos(i,this._oCard.getBindingNamespaces());if(n){i.data=n}return i};return i});