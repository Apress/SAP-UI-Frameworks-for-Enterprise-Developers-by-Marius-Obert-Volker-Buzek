/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/each","sap/base/util/isPlainObject","sap/base/util/ObjectPath","sap/base/Log","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/core/Core","sap/ui/fl/changeHandler/condenser/Classification","sap/ui/fl/apply/_internal/changes/Utils","sap/ui/fl/apply/_internal/flexObjects/UIChange","sap/ui/fl/apply/_internal/flexObjects/States","sap/ui/fl/write/_internal/condenser/classifications/LastOneWins","sap/ui/fl/write/_internal/condenser/classifications/Reverse","sap/ui/fl/write/_internal/condenser/classifications/Update","sap/ui/fl/write/_internal/condenser/UIReconstruction","sap/ui/fl/write/_internal/condenser/Utils","sap/ui/fl/Utils","sap/ui/performance/Measurement","sap/base/util/restricted/_isEqual"],function(e,n,t,r,a,i,o,s,f,c,u,d,l,p,g,h,C,v){"use strict";var E={};var y="unclassified";var _={lastOneWins:u,reverse:d,update:l};var S=["affectedControl","sourceContainer","targetContainer","updateControl"];function I(e,n){var t=e[o.Move];return n.classification===o.Create&&t&&t[t.length-1].targetContainer===n.targetContainer}function N(e,n){return n.classification===o.Move&&e[o.Destroy]}function T(e,n){return n.classification===o.Create&&e[o.Destroy]}function m(e,n,t,r){if(!N(e,t)&&!T(e,t)){var a=t.classification;if(!e[a]){t.change=r;r.condenserState="select";e[a]=[t]}else{r.condenserState="delete"}e[a][0].updateChange=r}else{r.condenserState="delete"}if(I(e,t)||T(e,t)){if(e[o.Move]){e[o.Move].forEach(function(e){e.change.condenserState="delete"});delete e[o.Move]}if(e[o.Destroy]){e[o.Destroy].forEach(function(e){e.change.condenserState="delete"});delete e[o.Destroy]}}return p.addChange(n,t)}function A(e,n,t){if(!e[n.classification]){e[n.classification]={}}var r=e[n.classification];_[n.classification].addToChangesMap(r,n,t);return Promise.resolve()}function O(e,n,t,r,a){if(!e[r.type]){e[r.type]={}}var i=e[r.type];if(r.type===g.NOT_INDEX_RELEVANT){return A(i,r,a)}t.push(a);if(!i[r.targetAggregation]){i[r.targetAggregation]={}}return m(i[r.targetAggregation],n,r,a)}function D(e,n,t){if(!e[n]){e[n]=[]}e[n].push(t);t.condenserState="select"}function b(e,n){var t=a.getControlIdBySelector(n.getSelector(),e);var r=i.byId(t);if(r){var o={modifier:a,appComponent:e,view:h.getViewForControl(r)};var f=s.getControlIfTemplateAffected(n,r,o);return Promise.resolve(s.getChangeHandler(n,f,o)).then(function(e){if(e&&typeof e.getCondenserInfo==="function"){return e.getCondenserInfo(n,o)}return undefined}).then(function(e){if(e&&f.bTemplateAffected){x(e,n)}return e}).catch(function(){return undefined})}return Promise.resolve()}function x(e,n){var t=n.getOriginalSelector();var r=n.getSelector();S.forEach(function(n){if(e[n]&&e[n]===r){e[n]=t}})}function L(e,n,r,i){var s=n!==undefined?n.affectedControl:a.getControlIdBySelector(r.getSelector(),i);if(!e[s]){e[s]={}}if(n&&n.updateControl){var f=n.updateControl;var c=[g.NOT_INDEX_RELEVANT,o.Update,n.uniqueKey];var u=t.get(c,e[f]);if(u){t.set(c,u,e[s]);delete e[f][g.NOT_INDEX_RELEVANT][o.Update][n.uniqueKey]}}return e[s]}function R(e,n,t,r,a){return a.reduce(function(a,i){return a.then(M.bind(this,e,n,t,r,i))}.bind(this),Promise.resolve())}function M(e,n,t,r,a){return b(e,a).then(function(i){w(i,e);var o=L(n,i,a,e);if(i!==undefined){U(i);return O(o,t,r,i,a).then(function(){if(i.update){V(o,i,a)}})}D(o,y,a);n[y]=true;return undefined})}function U(e){if(_[e.classification]){e.type=g.NOT_INDEX_RELEVANT}else{e.type=g.INDEX_RELEVANT}}function w(e,n){S.forEach(function(t){if(e&&e[t]){e[t]=a.getControlIdBySelector(e[t],n)}})}function V(e,n,r){var a=[g.NOT_INDEX_RELEVANT,o.Update,n.uniqueKey];var i=t.get(a,e);if(i){i.change.condenserState="delete";if(r.condenserState==="delete"){return}n.update(r,i.updateContent);delete e[g.NOT_INDEX_RELEVANT][o.Update][n.uniqueKey];if(r.isPersisted()){r.condenserState="update"}}}function P(t,r){e(t,function(e,a){if(_[e]&&_[e].getChangesFromMap){_[e].getChangesFromMap(t,e).forEach(function(e){r.push(e)})}else if(n(a)){return P(a,r)}else if(Array.isArray(a)){a.forEach(function(e){if(e instanceof f){r.push(e)}else{r.push(e.change)}})}});return r}function X(e){return P(e,[])}function q(t,r){e(t,function(e,t){if(n(t)){q(t,r)}else if(Array.isArray(t)){t.forEach(function(e){if(!(e instanceof f)){r.push(e)}})}});return r}function j(e,n){n.sort(function(n,t){return e.indexOf(n)-e.indexOf(t)})}function K(e,n){n.sort(function(n,t){return e.indexOf(n.change)-e.indexOf(t.change)})}function B(e,n){var t=e.map(function(e){return e.getId()});n.forEach(function(n){if(t.indexOf(n.getId())===-1){e.push(n)}})}function F(e,n){e.forEach(function(e){var t=e.updateChange;if(t&&!v(t.getContent(),e.change.getContent())&&t.getState()!==c.LifecycleState.NEW){var r=e.change;if(t.getId()!==r.getId()){var a=r.getContent();t.setContent(a);r.condenserState="delete";n=n.map(function(e){if(e.getId()===r.getId()){return t}return e})}else{t.setState(c.LifecycleState.DIRTY)}t.condenserState="update"}});return n}E.condense=function(e,n){C.start("Condenser_overall","Condenser overall - CondenserClass",["sap.ui.fl","Condenser"]);var t={};var a={};var i=[];var o=[];var s=[];n.slice(0).reverse().forEach(function(e){if(e instanceof f){if(e.getState()===c.LifecycleState.DELETED){e.condenserState="delete"}else if(e.isSuccessfullyApplied()){s.push(e)}else{o.push(e)}}else{o.push(e)}});C.start("Condenser_defineMaps","defining of maps - CondenserClass",["sap.ui.fl","Condenser"]);return R(e,t,a,i,s).then(function(){C.end("Condenser_defineMaps");var e=t[y];if(!e){p.compareAndUpdate(t,a)}var s=X(t);if(e){i.forEach(function(e){e.condenserState="select"});B(s,i)}s=s.concat(o);j(n,s);if(!e){C.start("Condenser_handleIndexRelatedChanges","handle index related changes - CondenserClass",["sap.ui.fl","Condenser"]);var f=true;var c=q(t,[]);K(n,c);var u;try{C.start("Condenser_sort","sort index related changes - CondenserClass",["sap.ui.fl","Condenser"]);u=p.sortIndexRelatedChanges(a,c)}catch(e){r.error("Error during Condensing: "+e.message,"No Condensing performed for index-relevant changes.");f=false}C.end("Condenser_sort");if(f){s=F(c,s);j(n,s);u.forEach(function(e){p.swapChanges(e,s)})}else{i.forEach(function(e){e.condenserState="select"});B(s,i);j(n,s)}C.end("Condenser_handleIndexRelatedChanges")}C.end("Condenser_overall");return s})};return E});