/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const t={CLEAN:0,PROCESSED:1,DIRTY:2};let e=t.CLEAN;return{setEditStateDirty:function(){e=t.DIRTY},setEditStateProcessed:function(){e=t.PROCESSED},resetEditState:function(){e=t.CLEAN},isEditStateDirty:function(){return e!==t.CLEAN},cleanProcessedEditState:function(){if(e===t.PROCESSED){e=t.CLEAN}}}},false);