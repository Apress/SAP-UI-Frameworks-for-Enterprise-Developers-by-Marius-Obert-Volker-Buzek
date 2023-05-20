/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone","sap/base/util/merge","sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor","sap/fe/core/converters/ConverterContext","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper"],function(e,t,r,n,i,o){"use strict";var a={};var s=o.generate;var l=i.isUndefinedExpression;var u=r.xml;var c=r.unregisterBuildingBlock;var f=r.registerBuildingBlock;function d(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,v(n.key),n)}}function p(e,t,r){if(t)d(e.prototype,t);if(r)d(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function v(e){var t=g(e,"string");return typeof t==="symbol"?t:String(t)}function g(e,t){if(typeof e!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if(typeof n!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}let m=function(){function r(r,i,o){var a;this.isPublic=false;this.getConverterContext=function(r,i,o,a){var s;const l=o.appComponent;const u=(s=o.models.viewData)===null||s===void 0?void 0:s.getData();let c=Object.assign({},u);delete c.resourceModel;delete c.appComponent;c=e(c);c.controlConfiguration=t(c.controlConfiguration,a||{});return n.createConverterContextForMacro(r.startingEntitySet.name,o.models.metaModel,l===null||l===void 0?void 0:l.getDiagnostics(),t,r.contextLocation,c)};Object.keys(r).forEach(e=>{this[e]=r[e]});this.resourceModel=o===null||o===void 0?void 0:(a=o.models)===null||a===void 0?void 0:a["sap.fe.i18n"]}a=r;var i=r.prototype;i.createId=function e(){if(this.id){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++){r[n]=arguments[n]}return s([this.id,...r])}return undefined};i.getContentId=function e(t){return`${t}-content`};i.getTranslatedText=function e(t,r,n){var i;return((i=this.resourceModel)===null||i===void 0?void 0:i.getText(t,r,n))||t};i.getProperties=function e(){const t={};for(const e in this){if(this.hasOwnProperty(e)){t[e]=this[e]}}return t};r.register=function e(){f(this)};r.unregister=function e(){c(this)};i.addConditionally=function e(t,r){if(t){return r}else{return""}};i.attr=function e(t,r){if(r!==undefined&&!l(r)){return()=>u`${t}="${r}"`}else{return()=>""}};p(r,null,[{key:"metadata",get:function(){this.internalMetadata??={namespace:"",name:"",properties:{},aggregations:{},stereotype:"xmlmacro"};return this.internalMetadata}}]);return r}();m.isRuntime=false;a=m;return a},false);