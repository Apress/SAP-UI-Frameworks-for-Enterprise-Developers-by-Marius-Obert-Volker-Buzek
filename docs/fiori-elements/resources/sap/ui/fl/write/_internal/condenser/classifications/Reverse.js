/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/each"],function(e){"use strict";return{addToChangesMap:function(e,n,t){if(!e[n.uniqueKey]){e[n.uniqueKey]=[]}e[n.uniqueKey].push(t)},getChangesFromMap:function(n,t){var u=[];e(n[t],function(e,n){n.reverse();var t;n.forEach(function(e,u){if(t&&t.getChangeType()!==e.getChangeType()){t=null;n[u].condenserState="delete";n[u-1].condenserState="delete"}else{t=e;if(u>0){n[u-1].condenserState="delete"}n[u].condenserState="select"}});if(t){u.push(t)}});return u}}});