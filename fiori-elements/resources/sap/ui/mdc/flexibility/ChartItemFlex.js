/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ItemBaseFlex"],function(e){"use strict";var r=Object.assign({},e);r.beforeAddItem=function(e,r,t,n,a){return e.addItem.call(e,r,t,n,a.role)};r.findItem=function(e,r,t){return r.reduce(function(r,n){return r.then(function(r){if(!r){return Promise.all([e.getProperty(n,"key"),e.getProperty(n,"name")]).then(function(e){if(e[0]===t||e[1]===t){return n}})}return r})},Promise.resolve())};r.addItem=r.createAddChangeHandler();r.removeItem=r.createRemoveChangeHandler();r.moveItem=r.createMoveChangeHandler();return r});