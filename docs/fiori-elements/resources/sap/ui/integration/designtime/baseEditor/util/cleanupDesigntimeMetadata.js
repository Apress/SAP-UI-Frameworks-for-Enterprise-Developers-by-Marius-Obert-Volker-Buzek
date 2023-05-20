/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_isNil","sap/base/util/each","sap/base/util/isPlainObject","sap/base/util/isEmptyObject"],function(i,e,t,s){"use strict";function a(n){e(n,function(e,u){if(t(u)){a(u)}if(i(u)||Array.isArray(u)&&u.length===0||t(u)&&s(u)){delete n[e]}})}return a});