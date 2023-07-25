/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/FakeLrepConnector","sap/ui/fl/write/_internal/connectors/LocalStorageConnector"],function(n,e){"use strict";return{enableFakeConnector:function(e){var o=e?e.sInitialComponentJsonPath:undefined;n.setFlexibilityServicesAndClearCache("LocalStorageConnector",o)},disableFakeConnector:function(){n.disableFakeConnector()},forTesting:{spyWrite:function(o,t){return n.forTesting.spyMethod(o,t,e,"write")},getNumberOfChanges:function(o){return n.forTesting.getNumberOfChanges(e,o)},synchronous:{clearAll:function(){n.forTesting.synchronous.clearAll(window.localStorage)},store:function(e,o){n.forTesting.synchronous.store(window.localStorage,e,o)}}}}},true);