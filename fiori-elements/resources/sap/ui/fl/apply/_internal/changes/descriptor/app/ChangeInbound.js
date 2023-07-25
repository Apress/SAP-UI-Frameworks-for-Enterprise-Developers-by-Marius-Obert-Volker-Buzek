/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/util/changePropertyValueByPath","sap/ui/fl/util/DescriptorChangeCheck"],function(n,e){"use strict";var t=["UPDATE","UPSERT"];var a=["title","subTitle","icon","signature/parameters/*"];var i={applyChange:function(i,r){var o=i["sap.app"].crossNavigation;var s=r.getContent();e.checkEntityPropertyChange(s,a,t);if(o&&o.inbounds){var u=o.inbounds[s.inboundId];if(u){n(s.entityPropertyChange,u)}else{throw new Error('Nothing to update. Inbound with ID "'+s.inboundId+'" does not exist.')}}else{throw new Error("sap.app/crossNavigation or sap.app/crossNavigation/inbounds sections have not been found in manifest.json")}return i}};return i});