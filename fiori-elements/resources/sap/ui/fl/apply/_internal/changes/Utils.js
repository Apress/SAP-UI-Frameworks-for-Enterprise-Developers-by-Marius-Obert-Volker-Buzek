/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/changes/FlexCustomData","sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage","sap/ui/fl/requireAsync","sap/ui/fl/Utils"],function(e,r,t,n){"use strict";function a(e,r){if(r||e.hasApplyProcessStarted()){return false}return true}var i={getControlIfTemplateAffected:function(e,r,t){var n=t.modifier;var a={originalControl:r};var i=e.getOriginalSelector();if(e.getContent().boundAggregation&&i){a.control=n.bySelector(i,t.appComponent,t.view);a.controlType=n.getControlType(a.control);a.bTemplateAffected=true}else{a.control=r;a.controlType=n.getControlType(r);a.bTemplateAffected=false}return a},getChangeHandler:function(e,n,a){var i=a.modifier.getLibraryName(n.control);return t("sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration").then(function(e){return e.waitForChangeHandlerRegistration(i)}).then(function(){var t=e.getChangeType();var i=e.getLayer();return r.getChangeHandler(t,n.controlType,n.control,a.modifier,i)})},checkIfDependencyIsStillValid:function(r,t,i,o){var l=n.getChangeFromChangesMap(i.mChanges,o);var c=t.bySelector(l.getSelector(),r);var f=e.hasChangeApplyFinishedCustomData(c,l,t);return a(l,f)},filterChangeByView:function(e,r){var t=e.modifier;var n=e.appComponent;var a=r.getSelector();if(!a){return false}if(a.viewSelector){var i=t.getControlIdBySelector(a.viewSelector,n);return i===e.viewId}var o=a.id;if(o){var l;if(r.getSelector().idIsLocal){if(n){l=n.getLocalId(e.viewId)}}else{l=e.viewId}var c=0;var f;do{c=o.indexOf("--",c);f=o.slice(0,c);c++}while(f!==l&&c>0);return f===l}return false}};return i});