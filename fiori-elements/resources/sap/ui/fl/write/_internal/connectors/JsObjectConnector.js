/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/write/api/connectors/ObjectStorageConnector"],function(e,t){"use strict";var n={_itemsStoredAsObjects:true,_items:{},setItem:function(e,t){n._items[e]=t},removeItem:function(e){delete n._items[e]},clear:function(){n._items={}},getItem:function(e){return n._items[e]},getItems:function(){return n._items}};var i=e({},t,{storage:n});i.loadFeatures=function(){return t.loadFeatures.apply(this,arguments).then(function(t){return e({isPublicLayerAvailable:true,isVariantAdaptationEnabled:true},t)})};return i});