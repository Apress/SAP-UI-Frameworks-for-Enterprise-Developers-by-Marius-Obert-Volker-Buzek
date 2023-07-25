/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/integration/util/Utils"],function(t,r){"use strict";var n={currency:function(n,e,o,a){var s=r.processFormatArguments(o,a),c=t.getCurrencyInstance(s.formatOptions,s.locale);return c.format(n,e)},float:function(n,e,o){var a=r.processFormatArguments(e,o),s=t.getFloatInstance(a.formatOptions,a.locale);return s.format(n)},integer:function(n,e,o){var a=r.processFormatArguments(e,o),s=t.getIntegerInstance(a.formatOptions,a.locale);return s.format(n)},percent:function(n,e,o){var a=r.processFormatArguments(e,o),s=t.getPercentInstance(a.formatOptions,a.locale);return s.format(n)},unit:function(n,e,o,a){var s=r.processFormatArguments(o,a),c=t.getUnitInstance(s.formatOptions,s.locale);return c.format(n,e)}};return n});