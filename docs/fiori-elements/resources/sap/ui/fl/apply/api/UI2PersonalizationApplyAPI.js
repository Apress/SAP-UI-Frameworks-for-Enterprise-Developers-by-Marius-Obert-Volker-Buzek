/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState","sap/ui/fl/apply/_internal/flexState/FlexState","sap/ui/fl/apply/_internal/ChangesController"],function(e,n,t){"use strict";var r={load:function(r){var a=t.getFlexControllerInstance(r.selector);r.reference=a.getComponentName();if(!r.reference||!r.containerKey){return Promise.reject(new Error("not all mandatory properties were provided for the loading of the personalization"))}return n.initialize({componentId:r.selector.getId()}).then(function(){return e.getPersonalization(r.reference,r.containerKey,r.itemName)})}};return r});