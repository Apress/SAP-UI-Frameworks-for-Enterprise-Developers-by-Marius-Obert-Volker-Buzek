/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/write/_internal/condenser/Utils"],function(e){"use strict";return{addToReconstructionMap:function(t,n){return e.getContainerElementIds(n.targetContainer,n.targetAggregation,n.customAggregation,n.affectedControlIdProperty).then(function(r){var i=e.getInitialUIContainerElementIds(t,n.targetContainer,n.targetAggregation,r);if(i.length-1<n.sourceIndex){while(i.length-1<n.sourceIndex){var o=i.length;i.splice(i.length,0,e.PLACEHOLDER+o)}i[n.sourceIndex]=n.affectedControl}else{i.splice(n.sourceIndex,0,n.affectedControl)}})},simulate:function(t,n,r){var i=t.indexOf(n.affectedControl);if(i===-1){var o=e.PLACEHOLDER+r.indexOf(n.affectedControl);i=t.indexOf(o)}if(i>-1){t.splice(i,1)}}}});