/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";return function(e,n,r){var t=r.modifier;var i=e.getContent();var o=i.targetAggregation;var g=i.index;if(g===undefined){return Promise.resolve().then(t.getAggregation.bind(t,n,o)).then(function(e){return e.length})}return Promise.resolve(g)}});