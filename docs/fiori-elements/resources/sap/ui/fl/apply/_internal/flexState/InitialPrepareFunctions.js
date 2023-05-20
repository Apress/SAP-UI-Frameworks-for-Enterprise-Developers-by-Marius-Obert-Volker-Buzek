/*
 * ! OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/includes","sap/ui/core/Core","sap/ui/fl/apply/_internal/controlVariants/Utils","sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"],function(e,a,n,r){"use strict";var t={};t.variants=function(t){var i=(t.storageResponse.changes.variants||[]).map(function(e){return e.fileName});var s={};(t.storageResponse.changes.variants||[]).some(function(t){var u=t.variantReference;if(u&&!e(i,u)){var c=a.getLibraryResourceBundle("sap.ui.fl");var f=r.createFlVariant({id:u,variantManagementReference:t.variantManagementReference,variantName:c.getText("STANDARD_VARIANT_TITLE"),user:n.DEFAULT_AUTHOR,reference:t.reference});s.runtimePersistence={runtimeOnlyData:{flexObjects:[f]}};return true}return false});return s};t.uiChanges=function(){};return t});