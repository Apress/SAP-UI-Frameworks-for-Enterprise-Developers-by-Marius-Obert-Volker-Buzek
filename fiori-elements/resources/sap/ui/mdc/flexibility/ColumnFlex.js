/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/p13n/Engine","./ItemBaseFlex"],function(e,n){"use strict";var r=Object.assign({},n);r.findItem=function(e,n,r){return n.reduce(function(n,t){return n.then(function(n){if(!n){return Promise.resolve().then(e.getProperty.bind(e,t,"dataProperty")).then(function(e){if(e===r){return t}})}return n})},Promise.resolve())};r.addColumn=r.createAddChangeHandler();r.removeColumn=r.createRemoveChangeHandler();r.moveColumn=r.createMoveChangeHandler();return r});