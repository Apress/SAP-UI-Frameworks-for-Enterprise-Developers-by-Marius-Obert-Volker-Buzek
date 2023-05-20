/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/mdc/field/MultiValueFieldDelegate"],function(t){"use strict";const n=Object.assign({},t,{_transformConditions:function(t,n,s){const e=[];for(let i=0;i<t.length;i++){const o={};const c=t[i];o[n]=c.values[0];if(s){o[s]=c.values[1]}e.push(o)}return e},updateItems:function(t,n,s){const e=s.getBinding("items");const i=s.getBindingInfo("items");const o=i.path;const c=i.template;const a=c.getBindingInfo("key");const r=a&&a.parts[0].path;const u=c.getBindingInfo("description");const d=u&&u.parts[0].path;const f=e.getModel();f.setProperty(o,this._transformConditions(n,r,d))}});return n},false);