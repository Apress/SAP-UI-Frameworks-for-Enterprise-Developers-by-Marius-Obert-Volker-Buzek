/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const t={onBeforeBinding:function(t,e){this.getView().getController()._onBeforeBinding(t,e)},onAfterBinding:function(t,e){this.getView().getController()._onAfterBinding(t,e)},closeColumn:function(){const t=this.getView().getBindingContext("internal");t.setProperty("fclColumnClosed",true);const e=this.getView().getBindingContext();const n=e&&e.getPath()||"";const o=e.getModel().getMetaModel();const i=o.getMetaPath(n);const s=o.getObject(`${i}/$Type/$Key`);const c=e===null||e===void 0?void 0:e.getObject();const g={};for(const t in s){const e=s[t];if(!g[e]){g[e]=c[e]}}t.setProperty("technicalKeysOfLastSeenRecord",g)}};return t},false);