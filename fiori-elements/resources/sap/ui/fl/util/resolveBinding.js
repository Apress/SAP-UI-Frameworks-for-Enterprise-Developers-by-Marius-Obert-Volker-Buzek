/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/fl/Utils"],function(e,t){"use strict";var n=e.extend("sap.ui.fl.util.HelperControl",{metadata:{library:"sap.ui.fl",properties:{resolved:{type:"any"}}}});return function(r,i){if(!t.isBinding(r)){return undefined}var o=t.getViewForControl(i);var a=o&&o.getController();var s=typeof r==="string"?e.bindingParser(r,a):Object.assign({},r);if(!s){return undefined}var d=new n;var l=s.parts||[s];l.forEach(function(e){var t=e.model;if(t){d.setModel(i.getModel(t),t);d.setBindingContext(i.getBindingContext(t),t)}else{d.setModel(i.getModel());d.setBindingContext(i.getBindingContext())}});d.bindProperty("resolved",s);var g=d.getResolved();d.destroy();return g}});