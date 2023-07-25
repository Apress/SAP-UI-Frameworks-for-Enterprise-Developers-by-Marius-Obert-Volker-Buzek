/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/util/changePropertyValueByPath","sap/ui/fl/util/DescriptorChangeCheck"],function(e,t){"use strict";var a=["UPDATE","UPSERT"];var r=["uri","settings/maxAge"];var n={applyChange:function(n,o){var i=n["sap.app"].dataSources;var u=o.getContent();t.checkEntityPropertyChange(u,r,a);if(i){var s=i[u.dataSourceId];if(s){e(u.entityPropertyChange,s)}else{throw new Error('Nothing to update. DataSource with ID "'+u.dataSourceId+'" does not exist.')}}else{throw Error("No sap.app/dataSource found in manifest.json")}return n}};return n});