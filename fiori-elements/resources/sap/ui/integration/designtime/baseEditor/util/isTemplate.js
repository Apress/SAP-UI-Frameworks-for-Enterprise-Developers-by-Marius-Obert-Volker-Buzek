/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";function e(t,n){var r=t.sParentAggregationName;var a=t.getParent();if(n&&a===n){return false}if(a&&r){var i=a.getBindingInfo(r);if(i&&t instanceof i.template.getMetadata().getClass()){return false}else{return e(a,n)}}return true}return e});