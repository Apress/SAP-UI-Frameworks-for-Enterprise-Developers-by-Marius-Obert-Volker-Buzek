/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/util/IFrame"],function(){"use strict";return function(e,t,r,n){var i=t.modifier;var a=e.getContent();var o=t.view;var u=t.appComponent;var s={_settings:{}};["url","width","height"].forEach(function(e){var t=a[e];s[e]=t;s._settings[e]=t});if(n){s.renameInfo=n;s.asContainer=true}return Promise.resolve().then(function(){return i.createControl("sap.ui.fl.util.IFrame",u,o,r,s,false)})}});