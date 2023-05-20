/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/p13n/Engine"],function(e){"use strict";return{actions:{settings:function(){return{name:"filterbar.ADAPT_TITLE",handler:function(t,n){return t.initializedWithMetadata().then(function(){return e.getInstance().getRTASettingsActionHandler(t,n,"Item")})}}}},aggregations:{layout:{ignore:true},basicSearchField:{ignore:true},filterItems:{ignore:true}},properties:{showAdaptFiltersButton:{ignore:false},showClearButton:{ignore:false},p13nMode:{ignore:false}}}});