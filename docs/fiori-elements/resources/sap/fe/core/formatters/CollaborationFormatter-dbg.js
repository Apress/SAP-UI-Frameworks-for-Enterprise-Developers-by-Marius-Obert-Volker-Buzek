/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"],function(t){"use strict";var o={};const r=function(t){if(r.hasOwnProperty(t)){for(var o=arguments.length,n=new Array(o>1?o-1:0),e=1;e<o;e++){n[e-1]=arguments[e]}return r[t].apply(this,n)}else{return""}};const n=function(t){for(var o=arguments.length,r=new Array(o>1?o-1:0),n=1;n<o;n++){r[n-1]=arguments[n]}return!!a(t,...r)};n.__functionName="sap.fe.core.formatters.CollaborationFormatter#hasCollaborationActivity";o.hasCollaborationActivity=n;const e=function(t){for(var o=arguments.length,r=new Array(o>1?o-1:0),n=1;n<o;n++){r[n-1]=arguments[n]}const e=a(t,...r);return(e===null||e===void 0?void 0:e.initials)||undefined};e.__functionName="sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityInitials";o.getCollaborationActivityInitials=e;const i=function(t){for(var o=arguments.length,r=new Array(o>1?o-1:0),n=1;n<o;n++){r[n-1]=arguments[n]}const e=a(t,...r);return e!==null&&e!==void 0&&e.color?`Accent${e.color}`:undefined};i.__functionName="sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityColor";o.getCollaborationActivityColor=i;function a(t){for(var o=arguments.length,r=new Array(o>1?o-1:0),n=1;n<o;n++){r[n-1]=arguments[n]}if(t&&t.length>0){return t.find(function(t){var o;const n=(t===null||t===void 0?void 0:(o=t.key)===null||o===void 0?void 0:o.split(","))||[];let e="";let i;for(let t=0;t<n.length;t++){var a;i=n[t].split("=");e=(i[1]||i[0]).split("'").join("");if(e!==((a=r[t])===null||a===void 0?void 0:a.toString())){return false}}return true})}}const l=function(){const o=arguments.length<=0?undefined:arguments[0];const r=t.getLibraryResourceBundle("sap.fe.core");const n=[];for(let t=1;t<arguments.length;t++){n.push(t<0||arguments.length<=t?undefined:arguments[t])}return r.getText(o,n)};l.__functionName="sap.fe.core.formatters.CollaborationFormatter#getFormattedText";o.getFormattedText=l;r.hasCollaborationActivity=n;r.getCollaborationActivityInitials=e;r.getCollaborationActivityColor=i;r.getFormattedText=l;return r},true);