/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/designtime/baseEditor/util/binding/ObjectBinding"],function(e){"use strict";return function(n,t,i,o){var c=new e;i=i||{};o=o||[];o.forEach(function(e){c.addToIgnore(e)});Object.keys(t).forEach(function(e){c.setModel(t[e],e===""?undefined:e)});Object.keys(i).forEach(function(e){c.setBindingContext(i[e],e===""?undefined:e)});c.setObject(n);var d=c.getObject();c.destroy();return d}});