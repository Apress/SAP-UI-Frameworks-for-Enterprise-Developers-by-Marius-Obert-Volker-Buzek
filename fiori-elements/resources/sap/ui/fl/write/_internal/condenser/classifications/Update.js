/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/each"],function(e){"use strict";return{addToChangesMap:function(e,n,t){if(!e[n.uniqueKey]){n.change=t;e[n.uniqueKey]=n;t.condenserState="select"}else{t.condenserState="delete"}},getChangesFromMap:function(n,t){var a=[];e(n[t],function(e,n){a.push(n.change)});return a}}});