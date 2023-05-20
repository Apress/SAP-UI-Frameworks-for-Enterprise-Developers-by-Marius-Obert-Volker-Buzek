/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils","sap/ui/fl/initial/_internal/StorageUtils"],function(e,t){"use strict";function n(t){var n=[];return e.forEachObjectInStorage(t,function(e){n.push(e.changeDefinition)}).then(function(){return n})}var r={oStorage:undefined,layers:["ALL"],loadFlexData:function(e){return n({storage:this.oStorage,reference:e.reference}).then(function(e){var n=t.getGroupedFlexObjects(e);return t.filterAndSortResponses(n)})}};r.storage=r.oStorage;return r});