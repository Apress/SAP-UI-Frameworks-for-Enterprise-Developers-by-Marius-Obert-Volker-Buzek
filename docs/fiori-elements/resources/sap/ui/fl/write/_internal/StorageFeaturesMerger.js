/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge"],function(e){"use strict";var n={isKeyUser:false,isKeyUserTranslationEnabled:false,isVariantSharingEnabled:false,isPublicFlVariantEnabled:false,isVariantPersonalizationEnabled:true,isContextSharingEnabled:true,isAtoAvailable:false,isAtoEnabled:false,versioning:{},isProductiveSystem:true,isPublicLayerAvailable:false,isLocalResetEnabled:false,isZeroDowntimeUpgradeRunning:false,system:"",client:""};function i(e){var n={};var i=!!e.features.isVersioningEnabled;e.layers.forEach(function(e){n[e]=i});return n}return{mergeResults:function(a){var s=n;a.forEach(function(n){Object.keys(n.features).forEach(function(e){if(e!=="isVersioningEnabled"){s[e]=n.features[e]}});s.versioning=e(s.versioning,i(n));if(n.isContextSharingEnabled!==undefined){s.isContextSharingEnabled=n.isContextSharingEnabled}});return s}}});