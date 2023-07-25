/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/variants/context/Component","sap/ui/core/ComponentContainer","sap/ui/fl/Layer","sap/ui/fl/registry/Settings"],function(e,n,t,r){"use strict";var o;var i={createComponent:function(i){if(i.layer!==t.CUSTOMER){return Promise.resolve()}return r.getInstance().then(function(e){return e.isContextSharingEnabled()}).then(function(t){if(t){if(!o||o.bIsDestroyed){var r=new e("contextSharing");r.showMessageStrip(true);r.setSelectedContexts({role:[]});o=new n("contextSharingContainer",{component:r});return r.getRootControl().oAsyncState.promise.then(function(){return o})}return o}})}};return i});