/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/initial/_internal/StorageUtils","sap/base/util/LoaderExtensions"],function(e,t){"use strict";return{getFileList:function(){return Promise.reject("not implemented")},layers:[],loadFlexData:function(n){return this.getFileList(n.reference).then(function(n){return Promise.all(n.map(function(e){return t.loadResource({dataType:"json",url:e,async:true})})).then(function(t){var n=e.getGroupedFlexObjects(t);return e.filterAndSortResponses(n)})})}}});