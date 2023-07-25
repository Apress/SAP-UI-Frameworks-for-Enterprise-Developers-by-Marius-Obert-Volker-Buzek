/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(function(){"use strict";return{domRef:function(e){if(e._getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode")){return e.$("sapUiTableCnt").get(0)}return e.getDomRef()},aggregations:{columns:{domRef:".sapUiTableCHA"},rows:{ignore:true},hScroll:{ignore:false,domRef:function(e){return e.$("hsb").get(0)}},scrollContainers:[{domRef:function(e){return e.$("sapUiTableCnt").get(0)},aggregations:["rows"]}]}}});