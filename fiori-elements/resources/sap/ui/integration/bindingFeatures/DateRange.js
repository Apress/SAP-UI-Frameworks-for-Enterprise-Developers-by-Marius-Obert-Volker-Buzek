/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/date/UniversalDateUtils","sap/base/Log"],function(e,n){"use strict";var r={start:function(e,n){var r=this._getRange(e,n);if(!r){return null}return r[0]},end:function(e,n){var r=this._getRange(e,n);if(!r){return null}return r[1]},_getRange:function(r,t){var a=e.ranges[r];if(!a){n.error("The requested date range type '"+r+"' is not found","sap.ui.integration.widgets.Card");return null}return a(t)}};return r});