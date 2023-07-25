/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/Utils"],function(e){"use strict";return function(t,r,n){var o=n.modifier;var i=t.getContent().targetAggregation;var a=n.view||e.getViewForControl(r);var u=n.appComponent;var g=t.getRevertData()||[];return g.reduce(function(e,t){return e.then(function(){var e;if(typeof t==="string"){e=t}else{e=t.id;i=i||t.aggregationName}return o.bySelector(e,u,a)||a&&a.createId&&o.bySelector(a.createId(e))}).then(function(e){if(e.destroy){return e.destroy()}return o.removeAggregation(r,i,e)})},Promise.resolve()).then(function(){t.resetRevertData()})}});