/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/messageHandler/messageHandling","sap/fe/core/helpers/ResourceModelHelper","sap/m/Button","sap/m/Dialog","sap/m/MessageBox","sap/m/Text","sap/ui/core/Core","../../operationsHelper","./draftDataLossPopup"],function(e,t,n,o,r,i,a,s,c,u,d){"use strict";var f=o.getResourceModel;const l={EDIT:"EditAction",ACTIVATION:"ActivationAction",DISCARD:"DiscardAction",PREPARE:"PreparationAction"};function g(e,t){const n=e.getModel(),o=n.getMetaModel(),r=o.getMetaPath(e.getPath());return o.getObject(`${r}@com.sap.vocabularies.Common.v1.DraftRoot/${t}`)}function h(e,t,n){const o=g(e,t);return e.getModel().bindContext(`${o}(...)`,e,n)}function E(e,t){const n=e.getModel(),o=n.getMetaModel(),r=o.getMetaPath(e.getPath());return o.getObject(`${r}@com.sap.vocabularies.Common.v1.DraftRoot/${t}/$ReturnType`)}function A(e){return!!g(e,l.PREPARE)}async function m(e,t,n){if(e.getProperty("IsActiveEntity")){const o={$$inheritExpandSelect:true};const r=h(e,l.EDIT,o);r.setParameter("PreserveChanges",t);const i="direct";const a=f(n);const s=a.getText("C_COMMON_OBJECT_PAGE_EDIT");const c=r.execute(i,undefined,u.fnOnStrictHandlingFailed.bind(O,i,{label:s,model:e.getModel()},a,null,null,null,undefined,undefined),e.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));r.getModel().submitBatch(i);return await c}else{throw new Error("You cannot edit this draft document")}}async function p(t,n,o){if(O.getMessagesPath(t)&&O.hasPrepareAction(t)){try{const e=await O.executeDraftPreparationAction(t,t.getUpdateGroupId(),true,o);if(e&&!E(t,l.PREPARE)){v(t,n.getSideEffectsService())}return e}catch(t){e.error("Error while requesting messages",t)}}return undefined}async function P(t,n,o){const r=A(t);const i=r;if(!t.getProperty("IsActiveEntity")){const a=h(t,l.ACTIVATION,{$$inheritExpandSelect:true});const s=f(n);const c=s.getText("C_OP_OBJECT_PAGE_SAVE");try{return await a.execute(o,i,o?u.fnOnStrictHandlingFailed.bind(O,o,{label:c,model:t.getModel()},s,null,null,null,undefined,undefined):undefined,t.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"))}catch(o){if(r){const o=g(t,l.PREPARE),r=n.getSideEffectsService(),i=r.getODataActionSideEffects(o,t),a=i&&i.pathExpressions;if(a&&a.length>0){try{await r.requestSideEffects(a,t)}catch(t){e.error("Error while requesting side effects",t)}}else{try{await v(t,r)}catch(t){e.error("Error while requesting messages",t)}}}throw o}}else{throw new Error("The activation action cannot be executed on an active document")}}function D(e){const t=e.getModel().getMetaModel();const n=t.getMetaPath(e.getPath());const o=E(e,l.PREPARE);return o?t.getObject(`${n}/@${"com.sap.vocabularies.Common.v1.Messages"}/$Path`):null}function C(t,n,o,r){if(!t.getProperty("IsActiveEntity")){const i=o?D(t):null;const a=h(t,l.PREPARE,i?{$select:i}:null);a.setParameter("SideEffectsQualifier","");const s=n||a.getGroupId();return a.execute(s,r).then(function(){return a}).catch(function(t){e.error("Error while executing the operation",t)})}else{throw new Error("The preparation action cannot be executed on an active document")}}function w(e){const t=e.getModel(),n=t.getMetaModel(),o=n.getMetaPath(e.getPath());return n.getObject(`${o}/@com.sap.vocabularies.Common.v1.Messages/$Path`)}function v(e,t){const n=O.getMessagesPath(e);if(n){return t.requestSideEffects([n],e)}return Promise.resolve()}async function x(e,t,n){if(!e.getProperty("IsActiveEntity")){const o=O.createOperation(e,l.DISCARD);const r=t&&f(t);const i="direct";const a=(r===null||r===void 0?void 0:r.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"))||"";const s=!n?o.execute(i):o.execute(i,undefined,u.fnOnStrictHandlingFailed.bind(O,i,{label:a,model:e.getModel()},r,null,null,null,undefined,undefined),false);e.getModel().submitBatch(i);return s}else{throw new Error("The discard action cannot be executed on an active document")}}async function M(t,n){if(!n.getPath().startsWith(t.getPath())){e.error("Cannot compute rightmost sibling context");throw new Error("Cannot compute rightmost sibling context")}if(n.getProperty("IsActiveEntity")===false&&n.getProperty("HasActiveEntity")===false){return undefined}const o=t.getModel();try{const e=n.getPath().replace(t.getPath(),"");const r=e?e.substring(1).split("/"):[];r.unshift(t.getPath().substring(1));const i=[];const a=[];let s="";const c=r.map(e=>{s+=`/${e}`;i.unshift(s);if(s.endsWith(")")){const e=o.bindContext(`${s}/SiblingEntity`).getBoundContext();return e.requestCanonicalPath()}else{return Promise.resolve(undefined)}});const u=await Promise.all(c);let d="";u.forEach((e,t)=>{if(t!==0){if(r[t].endsWith(")")){const n=r[t].replace(/\(.*$/,"");const o=e.replace(/.*\(/,"(");d+=`/${n}${o}`}else{d+=`/${r[t]}`}}else{d=e}a.unshift(d)});return{targetContext:o.bindContext(d).getBoundContext(),pathMapping:i.map((e,t)=>({oldPath:e,newPath:a[t]}))}}catch(e){return undefined}}async function b(e,o,r){const i=r||{},s=typeof i.bPreserveChanges==="undefined"||typeof i.bPreserveChanges==="boolean"&&i.bPreserveChanges;async function c(){const t=e.getModel();const o=t.bindContext(`${e.getPath()}/DraftAdministrativeData`).getBoundContext();const i=f(r.oView);const s=await o.requestObject();if(s){n.removeUnboundTransitionMessages();let t=s.InProcessByUserDescription||s.InProcessByUser;const o=r.oView.getViewData().entitySet;if(t){const e=i.getText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER",t,o);a.error(e);throw new Error(e)}else{t=s.CreatedByUserDescription||s.CreatedByUser;const n=i.getText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES",t,o);await O.showEditConfirmationMessageBox(n,e);return O.executeDraftEditAction(e,false,r.oView)}}throw new Error(`Draft creation aborted for document: ${e.getPath()}`)}if(!e){throw new Error("Binding context to active document is required")}let u;try{u=await O.executeDraftEditAction(e,s,r.oView)}catch(o){if(o.status===409||o.status===412||o.status===423){n.removeBoundTransitionMessages();n.removeUnboundTransitionMessages();const o=await O.computeSiblingInformation(e,e);if(o!==null&&o!==void 0&&o.targetContext){await t.waitForContextRequested(o.targetContext);return o.targetContext}else{u=await c()}}else if(!(o&&o.canceled)){throw new Error(o)}}if(u){var d;const e=O.getActionName(u,l.EDIT);const t=o.getSideEffectsService().getODataActionSideEffects(e,u);if(t!==null&&t!==void 0&&(d=t.triggerActions)!==null&&d!==void 0&&d.length){await o.getSideEffectsService().requestSideEffectsForODataAction(t,u);return u}else{return u}}else{return undefined}}async function y(e,t,n,o){const r=n||{};if(!e){throw new Error("Binding context to draft document is required")}const i=r.fnBeforeActivateDocument?await r.fnBeforeActivateDocument(e):true;if(!i){throw new Error(`Activation of the document was aborted by extension for document: ${e.getPath()}`)}let a;if(!A(e)){a=await P(e,t)}else{const n="draft";let r=O.executeDraftPreparationAction(e,n,false);e.getModel().submitBatch(n);const i=O.executeDraftActivationAction(e,t,n);try{const e=await Promise.all([r,i]);a=e[1]}catch(t){const i=D(e);if(i){r=O.executeDraftPreparationAction(e,n,true);e.getModel().submitBatch(n);await r;const t=await e.requestObject();if(t[i].length>0){o===null||o===void 0?void 0:o.removeTransitionMessages(false,false,e.getPath())}}throw t}}return r.fnAfterActivateDocument?r.fnAfterActivateDocument(e,a):a}function T(e,t){const n=c.getLibraryResourceBundle("sap.fe.core");return new Promise(function(o,a){const c=new i({title:n.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),state:"Warning",content:new s({text:e}),beginButton:new r({text:n.getText("C_COMMON_OBJECT_PAGE_EDIT"),type:"Emphasized",press:function(){c.close();o(true)}}),endButton:new r({text:n.getText("C_COMMON_OBJECT_PAGE_CANCEL"),press:function(){c.close();a(`Draft creation aborted for document: ${t.getPath()}`)}}),afterClose:function(){c.destroy()}});c.addStyleClass("sapUiContentPadding");c.open()})}function _(e,t,n){const o=g(e,l.DISCARD),r=e.getObject().IsActiveEntity;if(r||!r&&!o){if(e.hasPendingChanges()){return e.getBinding().resetChanges().then(function(){return e.delete()}).catch(function(e){return Promise.reject(e)})}else{return e.delete()}}else{return x(e,t,n)}}const O={createDraftFromActiveDocument:b,activateDocument:y,deleteDraft:_,executeDraftEditAction:m,executeDraftValidation:p,executeDraftPreparationAction:C,executeDraftActivationAction:P,hasPrepareAction:A,getMessagesPath:w,computeSiblingInformation:M,processDataLossOrDraftDiscardConfirmation:d.processDataLossOrDraftDiscardConfirmation,silentlyKeepDraftOnForwardNavigation:d.silentlyKeepDraftOnForwardNavigation,createOperation:h,executeDraftDiscardAction:x,NavigationType:d.NavigationType,getActionName:g,showEditConfirmationMessageBox:T};return O},false);