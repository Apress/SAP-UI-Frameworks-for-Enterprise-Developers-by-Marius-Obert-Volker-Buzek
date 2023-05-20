/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/FakeLrepConnector","sap/ui/fl/write/_internal/connectors/SessionStorageConnector"],function(e,n){"use strict";return{enableFakeConnector:function(n){var t=n?n.sInitialComponentJsonPath:undefined;e.setFlexibilityServicesAndClearCache("SessionStorageConnector",t)},disableFakeConnector:function(){e.disableFakeConnector()},forTesting:{spyWrite:function(t,r){return e.forTesting.spyMethod(t,r,n,"write")},getNumberOfChanges:function(t){return e.forTesting.getNumberOfChanges(n,t)},clear:function(t){return e.forTesting.clear(n,t)},setStorage:function(t){e.forTesting.setStorage(n,t)},synchronous:{clearAll:function(){e.forTesting.synchronous.clearAll(window.sessionStorage)},getNumberOfChanges:function(t){return e.forTesting.synchronous.getNumberOfChanges(n.storage,t)}}}}},true);