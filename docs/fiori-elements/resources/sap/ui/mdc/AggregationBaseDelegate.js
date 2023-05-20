/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/BaseDelegate","sap/ui/core/library"],function(e,t){"use strict";var n=Object.assign(e,{fetchProperties:function(e){return Promise.resolve([])},addItem:function(e,t,n){return Promise.resolve()},removeItem:function(e,t,n){return Promise.resolve(true)},validateState:function(e,n){var i=t.MessageType.None;return{validation:i,message:undefined}},onAfterXMLChangeProcessing:function(e,t){},determineValidationState:function(e){return e.checkValidationState?e.checkValidationState():-1},visualizeValidationState:function(e,t){}});return n});