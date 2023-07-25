/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/isPlainObject","sap/base/util/each"],function(t,e){"use strict";return function(i,n){n=n||function(){return true};var r=Array.from(i);var u=typeof r[0]!=="string"&&r[0]!==undefined?0:1;if(t(r[u])){var a=Object.assign({},r[u]);e(a,function(e,i){if(t(i)&&n(i,e)){a[e]=Object.assign({},i,{ui5object:true})}});r[u]=a}return r}});