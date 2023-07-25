/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/messageHandler/messageHandling","sap/fe/core/helpers/ClassSupport","sap/ui/core/Core","sap/ui/core/mvc/ControllerExtension","sap/ui/core/mvc/OverrideExecution"],function(e,t,o,s,i,n){"use strict";var r,a,g,c,l,u,p,f,d,h;var v=o.publicExtension;var M=o.privateExtension;var y=o.finalExtension;var m=o.extensible;var b=o.defineUI5Class;function w(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;T(e,t)}function T(e,t){T=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,o){t.__proto__=o;return t};return T(e,t)}function O(e,t,o,s,i){var n={};Object.keys(s).forEach(function(e){n[e]=s[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=o.slice().reverse().reduce(function(o,s){return s(e,t,o)||o},n);if(i&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(i):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}let D=(r=b("sap.fe.core.controllerextensions.MessageHandler"),a=M(),g=m(n.Instead),c=v(),l=y(),u=v(),p=v(),f=y(),r(d=(h=function(o){w(i,o);function i(){return o.apply(this,arguments)||this}var n=i.prototype;n.getShowBoundMessagesInMessageDialog=function e(){return true};n.showMessageDialog=function e(o){const s=o&&o.customMessages?o.customMessages:undefined,i=this.base.getView().getBindingContext("internal");const n=this.base.getView().getViewData().converterType;if(o&&o.isActionParameterDialogOpen&&i){i.setProperty("isActionParameterDialogOpen",true)}const r=this.getShowBoundMessagesInMessageDialog();const a=o&&o.context?o.context:this.getView().getBindingContext();if(i){i.setProperty("isActionParameterDialogOpen",false)}return new Promise(function(e,i){setTimeout(function(){t.showUnboundMessages(s,a,r,o===null||o===void 0?void 0:o.concurrentEditFlag,o===null||o===void 0?void 0:o.control,o===null||o===void 0?void 0:o.sActionName,undefined,o===null||o===void 0?void 0:o.onBeforeShowMessage,n).then(e).catch(i)},0)})};n.removeTransitionMessages=function e(o,s,i){if(!o){t.removeBoundTransitionMessages(i)}if(!s){t.removeUnboundTransitionMessages()}};n._checkNavigationToErrorPage=function o(s){const i=t.getMessages();const n=this.getShowBoundMessagesInMessageDialog();const r=n?t.getMessages(true,true):[];const a=s&&s.customMessages?s.customMessages:[];const g=e.isStickyEditMode(this.base.getView());let c;if(s&&s.isDataReceivedError){c={title:s.title,description:s.description,navigateBackToOrigin:true,errorType:"PageNotFound"}}else if(!g&&!r.length&&!a.length&&(i.length===1||s&&s.isInitialLoad503Error)){const e=i[0],o=e.getTechnicalDetails();let s;if(o&&o.httpStatus===503){if(o.retryAfter){const i=this._getSecondsBeforeRetryAfter(o.retryAfter);if(i>120){s=t.getRetryAfterMessage(e);c={description:s?`${s} ${e.getMessage()}`:e.getMessage(),navigateBackToOrigin:true,errorType:"UnableToLoad"}}}else{s=t.getRetryAfterMessage(e);c={description:s?`${s} ${e.getMessage()}`:e.getMessage(),navigateBackToOrigin:true,errorType:"UnableToLoad"}}}}return c};n._getSecondsBeforeRetryAfter=function e(t){const o=new Date,s=o.getTime(),i=t.getTime(),n=(i-s)/1e3;return n};n.showMessages=async function t(o){const i=e.getAppComponent(this.getView());let n;if(!i._isFclEnabled()){n=this._checkNavigationToErrorPage(o)}if(n){if(o&&o.messagePageNavigationCallback){o.messagePageNavigationCallback()}n.handleShellBack=!(o&&o.shellBack);this.removeTransitionMessages();const e=s.getLibraryResourceBundle("sap.fe.core");if(this.base._routing){return new Promise((t,s)=>{setTimeout(()=>{this.base._routing.navigateToMessagePage(o&&o.isDataReceivedError?e.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"):e.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"),n).then(t).catch(s)},0)})}}else{return this.showMessageDialog(o)}};return i}(i),O(h.prototype,"getShowBoundMessagesInMessageDialog",[a,g],Object.getOwnPropertyDescriptor(h.prototype,"getShowBoundMessagesInMessageDialog"),h.prototype),O(h.prototype,"showMessageDialog",[c,l],Object.getOwnPropertyDescriptor(h.prototype,"showMessageDialog"),h.prototype),O(h.prototype,"removeTransitionMessages",[u],Object.getOwnPropertyDescriptor(h.prototype,"removeTransitionMessages"),h.prototype),O(h.prototype,"showMessages",[p,f],Object.getOwnPropertyDescriptor(h.prototype,"showMessages"),h.prototype),h))||d);return D},false);