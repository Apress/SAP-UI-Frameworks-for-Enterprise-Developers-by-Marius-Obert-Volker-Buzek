// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/base/Object","sap/base/Log","sap/ui/thirdparty/jquery"],function(e,r,t){"use strict";var s="sap.ushell.services.UserRecents";var n=e.extend("sap.ushell.services.UserRecentsBase",{constructor:function(e,r,t){this.aRecents=[];this.iMaxItems=r;this._oPersonalizerPromise=sap.ushell.Container.getServiceAsync("Personalization").then(function(r){return r.getPersonalizer({container:s,item:e})});this._compareItems=t}});n.prototype._load=function(){var e=new t.Deferred;this._oPersonalizerPromise.then(function(r){r.getPersData().done(e.resolve).fail(e.reject)}).catch(function(t){r.error("Personalization service does not work:");r.error(t.name+": "+t.message);e.reject(t)});return e.promise()};n.prototype._save=function(e){var s=new t.Deferred;this._oPersonalizerPromise.then(function(r){r.setPersData(e).done(s.resolve).fail(s.reject)}).catch(function(e){r.error("Personalization service does not work:");r.error(e.name+": "+e.message);s.reject(e)});return s.promise()};n._itemSorter=function(e,r){return r.iTimestamp-e.iTimestamp};return n});