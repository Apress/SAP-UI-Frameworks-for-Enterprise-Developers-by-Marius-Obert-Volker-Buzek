/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/initial/_internal/connectors/BackendConnector","sap/ui/fl/Layer"],function(a,e,n){"use strict";var i="/flex/personalization";var r="/v1";var t=a({},e,{layers:[n.USER],ROUTES:{DATA:i+r+"/data/"}});return t});