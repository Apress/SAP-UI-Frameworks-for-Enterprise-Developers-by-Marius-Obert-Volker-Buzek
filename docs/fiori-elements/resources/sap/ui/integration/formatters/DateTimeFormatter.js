/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/format/DateFormat","sap/ui/core/date/UniversalDate","sap/ui/integration/util/Utils"],function(e,t,a){"use strict";var r={dateTime:function(r,i,n){var s=a.processFormatArguments(i,n),o=e.getDateTimeInstance(s.formatOptions,s.locale),u;if(Array.isArray(r)){u=r.map(function(e){return new t(a.parseJsonDateTime(e))})}else{u=new t(a.parseJsonDateTime(r))}var m=o.format(u);return m},date:function(e,t,a){return r.dateTime.apply(this,arguments)}};return r});