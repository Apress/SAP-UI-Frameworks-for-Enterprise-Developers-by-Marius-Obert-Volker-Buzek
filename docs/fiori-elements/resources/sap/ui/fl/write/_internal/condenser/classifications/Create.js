/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/fl/write/_internal/condenser/Utils"],function(e,t){"use strict";return{addToReconstructionMap:function(n,r){var a=e.byId(r.affectedControl);var i=r.targetAggregation||a&&a.sParentAggregationName;return t.getContainerElementIds(r.targetContainer,i,r.customAggregation,r.affectedControlIdProperty).then(function(e){var a=t.getInitialUIContainerElementIds(n,r.targetContainer,r.targetAggregation,e);var i=a.indexOf(r.affectedControl);if(i>-1){a.splice(i,1)}})},simulate:function(e,t){e.splice(t.getTargetIndex(t.change),0,t.affectedControl)}}});