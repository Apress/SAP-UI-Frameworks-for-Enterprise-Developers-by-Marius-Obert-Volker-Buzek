/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/changes/descriptor/ApplyUtil","sap/base/util/ObjectPath"],function(e,t){"use strict";var s={applyChange:function(s,n){var i=n.getContent().modelId;var a=e.formatBundleName(s["sap.app"].id,n.getTexts().i18n);var p=s["sap.ui5"].models[i];if(p){if(p.type&&p.type==="sap.ui.model.resource.ResourceModel"){if(!(p.settings&&p.settings.enhanceWith)){t.set("settings.enhanceWith",[],p)}var r=p.settings.enhanceWith;r.push({bundleName:a})}}return s},skipPostprocessing:true};return s});