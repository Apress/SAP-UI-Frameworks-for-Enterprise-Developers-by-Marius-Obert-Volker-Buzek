/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/ObjectPath","sap/base/util/isPlainObject","sap/base/util/isEmptyObject"],function(e,t,i){"use strict";function a(r,s,n){var l=s.slice(0,-1);var u=l.length>0?e.get(l,r):r;var c=s[s.length-1];if(Array.isArray(u)){u.splice(c,1)}else{delete u[c]}return l.length>0&&!(n<=0)&&(Array.isArray(u)&&u.length===0||t(u)&&i(u))?a(r,l,n?n-1:undefined):r}return a});