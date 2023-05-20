/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const t={onBeforeContextUpdate:function(t,e){const n=this.getView(),o=n&&n.getBindingContext(),i=t&&t.getCurrentContexts(),r=i[e];if(r&&o&&r.getPath()!==o.getPath()){return true}},onContextUpdate:function(t){this.base._routing.navigateToContext(t,{callExtension:true})}};return t},false);