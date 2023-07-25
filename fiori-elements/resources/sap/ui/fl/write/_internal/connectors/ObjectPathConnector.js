/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/write/connectors/BaseConnector","sap/ui/fl/initial/_internal/StorageUtils","sap/base/util/LoaderExtensions"],function(e,n,t,r){"use strict";var a;return e({},n,{layers:[],setJsonPath:function(e){a=e},loadFlexData:function(e){var n=a||e.path;if(n){return r.loadResource({dataType:"json",url:n,async:true}).then(function(e){return Object.assign(t.getEmptyFlexDataResponse(),e)})}return Promise.resolve()},loadFeatures:function(e){var n=a||e.path;if(n){return r.loadResource({dataType:"json",url:n,async:true}).then(function(e,n){n.componentClassName=e;return n.settings||{}}.bind(null,e.flexReference))}return Promise.resolve({})}})});