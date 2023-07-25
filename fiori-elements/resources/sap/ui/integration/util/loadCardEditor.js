/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";function i(){return new Promise(function(i,n){sap.ui.require(["sap/ui/integration/designtime/cardEditor/BASEditor"],i,n)})}return function(){return sap.ui.loader._.loadJSResourceAsync("sap-ui-integration-cardEditor.js").then(i).catch(i)}});