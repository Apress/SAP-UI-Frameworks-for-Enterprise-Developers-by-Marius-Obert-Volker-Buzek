/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/MoveControls"],function(e){"use strict";const n={moveControls:{changeHandler:{applyChange:function(n,t,a){return e.applyChange(n,t,{...a,sourceAggregation:"content",targetAggregation:"content"})},revertChange:e.revertChange,completeChangeContent:e.completeChangeContent}}};return n},false);