/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/FakeLrepConnectorLocalStorage"],function(e){"use strict";return{deleteChanges:function(){return e.forTesting.synchronous.clearAll()}}},true);