/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/fl/Utils"],function(e,r){"use strict";var t={};t.CHANGE_TYPE="moveElements";function n(e,r,t,n){if(!e){return Promise.reject(new Error("No change instance"))}var o=e.getContent();if(!o||!o.movedElements||o.movedElements.length===0){return Promise.reject(new Error("Change format invalid"))}if(!e.getSelector().aggregation){return Promise.reject(new Error("No source aggregation supplied via selector for move"))}if(!o.target||!o.target.selector){return Promise.reject(new Error("No target supplied for move"))}if(!r.bySelector(o.target.selector,n,t)){return Promise.reject(new Error("Move target parent not found"))}if(!o.target.selector.aggregation){return Promise.reject(new Error("No target aggregation supplied for move"))}return Promise.resolve()}function o(e,r,t,n){if(!e.selector&&!e.id){return Promise.reject(new Error("Change format invalid - moveElements element has no id attribute"))}if(typeof e.targetIndex!=="number"){return Promise.reject(new Error("Missing targetIndex for element with id '"+e.selector.id+"' in movedElements supplied"))}return Promise.resolve().then(function(){return r.bySelector(e.selector||e.id,t,n)})}function i(r,t,n,i,a,g,s,u){var c;return o(r,t,n,i).then(function(n){c=n;if(!c){e.warning("Element to move not found");return Promise.reject()}return Promise.resolve().then(t.removeAggregation.bind(t,a,s,c)).then(t.insertAggregation.bind(t,g,u,c,r.targetIndex,i))})}t.applyChange=function(e,t,o){var a=o.modifier;var g=o.view;var s=o.appComponent;var u=e.getContent();var c;var l;var m;return n(e,a,g,s).then(function(){c=e.getSelector().aggregation;l=u.target.selector.aggregation;return a.bySelector(u.target.selector,s,g)}).then(function(e){m=e;var n=[];u.movedElements.forEach(function(e){n.push(i.bind(null,e,a,s,g,t,m,c,l))});return r.execPromiseQueueSequentially(n,true,true)})};t.completeChangeContent=function(){throw new Error("Using deprecated change handler. Please consider using 'MoveControls' instead")};t.getSpecificChangeInfo=function(e,r){var t=r.source.parent||e.bySelector(r.source.id);var n=r.target.parent||e.bySelector(r.target.id);var o=r.source.aggregation;var i=r.target.aggregation;var a={source:{id:t.getId(),aggregation:o,type:e.getControlType(t)},target:{id:n.getId(),aggregation:i,type:e.getControlType(n)},movedElements:r.movedElements};return a};return t},true);