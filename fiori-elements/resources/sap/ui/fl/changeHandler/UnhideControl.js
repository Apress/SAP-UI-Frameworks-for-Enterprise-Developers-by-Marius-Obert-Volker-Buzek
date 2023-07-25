/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/fl/changeHandler/condenser/Classification"],function(e,t){"use strict";var n="visible";var r={};r.applyChange=function(e,t,r){var i=r.modifier;return Promise.resolve().then(i.getProperty.bind(i,t,n)).then(function(n){e.setRevertData({originalValue:n});r.modifier.setVisible(t,true)})};r.revertChange=function(t,n,r){var i=t.getRevertData();if(i){r.modifier.setVisible(n,i.originalValue);t.resetRevertData()}else{e.error("Attempt to revert an unapplied change.")}};r.completeChangeContent=function(){};r.getCondenserInfo=function(e){return{affectedControl:e.getSelector(),classification:t.Reverse,uniqueKey:n}};return r},true);