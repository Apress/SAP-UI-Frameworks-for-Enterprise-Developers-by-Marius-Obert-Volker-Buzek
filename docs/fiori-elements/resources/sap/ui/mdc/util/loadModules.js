/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/SyncPromise","sap/base/assert"],function(r,e){"use strict";return function a(n){e(typeof n==="string"||Array.isArray(n),"vModulePaths"+" param either must be a single string or an array of strings. - sap.ui.mdc.util.loadModules");var i;if(typeof n==="string"){i=[n]}else{i=n}var s=new Map;i.forEach(function(r){var e=sap.ui.require(r);s.set(r,e)});var t=i.filter(function(r){return s.get(r)===undefined});if(t.length===0){var u=Array.from(s.values());return r.resolve(u)}return new r(function(r,e){function a(){var e=Array.from(arguments);t.forEach(function(r,a){s.set(r,e[a])});var a=Array.from(s.values());r(a)}sap.ui.require(t,a,e)})}});