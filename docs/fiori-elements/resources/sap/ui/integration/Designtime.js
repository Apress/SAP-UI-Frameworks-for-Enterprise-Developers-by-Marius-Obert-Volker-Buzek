/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(t){"use strict";var e=t.extend("sap.ui.integration.Designtime",{metadata:{library:"sap.ui.integration"},constructor:function(e){t.apply(this);this.settings=e||this.create&&this.create()||{}}});e.prototype.init=function(){this._oCard=null};e.prototype.exit=function(){this._oCard=null};e.prototype.onCardReady=function(t,e){this._oCard=t;this._oInternalCardInstance=e};e.prototype._readyPromise=function(t,e){this.onCardReady(t,e);return Promise.resolve()};e.prototype.getCard=function(){return this._oCard};e.prototype.getSettings=function(){return this.settings};return e});