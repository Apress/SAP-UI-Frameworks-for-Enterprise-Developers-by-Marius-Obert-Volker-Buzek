/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";const t={scrollTableToRow:function(t,e){const n=t.getRowBinding();const o=function(){if(t.data().tableType==="GridTable"){return n.getContexts(0)}else{return n.getCurrentContexts()}};const i=function(){const n=o().find(function(t){return t&&t.getPath()===e});if(n){t.scrollToIndex(n.getIndex())}};if(n){const t=o();if(t.length===0&&n.getLength()>0||t.some(function(t){return t===undefined})){n.attachEventOnce("dataReceived",i)}else{i()}}}};return t},false);