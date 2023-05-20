/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../library","sap/ui/core/Element","sap/ui/core/dnd/DragDropInfo"],function(t,e,o){"use strict";var n=t.TableP13nMode;var r=e.extend("sap.ui.mdc.table.TableTypeBase",{metadata:{library:"sap.ui.mdc",properties:{}}});r.prototype.getSupportedP13nModes=function(){return Object.keys(n)};r.prototype.callHook=function(t,e,o){var n="_on"+t;if(!e||!(e[n]instanceof Function)){throw new Error(this+": Hook '"+t+"' does not exist on "+e)}e[n].call(e,o)};r.prototype.getTable=function(){var t=this.getParent();return t&&t.isA("sap.ui.mdc.Table")?t:null};r.prototype.getInnerTable=function(){var t=this.getTable();return t?t._oTable:null};r.prototype.setProperty=function(t,o){e.prototype.setProperty.apply(this,arguments);this.updateTableByProperty(t,o);return this};r.prototype.updateTable=function(){for(var t in this.getMetadata().getAllProperties()){this.updateTableByProperty(t,this.getProperty(t))}};r.prototype.getTableSettings=function(){var t=this.getTable();if(!t){return{}}var e=new o({sourceAggregation:"columns",targetAggregation:"columns",dropPosition:"Between",enabled:t.getActiveP13nModes().includes(n.Column),drop:[this._onColumnMove,this]});e.bIgnoreMetadataCheck=true;return{dragDropConfig:[e],busyIndicatorDelay:t.getBusyIndicatorDelay(),paste:[this._onPaste,this]}};r.prototype.getThreshold=function(){var t=this.getTable();var e=t?t.getThreshold():-1;return e>-1?e:undefined};r.prototype.getRowSettingsConfig=function(){var t=this.getTable();var e=t?t.getRowSettings():null;return e?e.getAllSettings():null};r.prototype.getRowActionsConfig=function(){var t=this.getTable();var e=t?t.getRowSettings():null;return e?e.getAllActions():null};r.prototype._onColumnMove=function(t){var e=this.getTable();var o=this.getInnerTable();var n=t.getParameter("draggedControl");var r=t.getParameter("droppedControl");if(n===r){return}var i=t.getParameter("dropPosition");var a=o.indexOfColumn(n);var p=o.indexOfColumn(r);var u=p+(i=="Before"?0:1)+(a<p?-1:0);this.callHook("ColumnMove",e,{column:e.getColumns()[a],newIndex:u})};r.prototype._onPaste=function(t){this.callHook("Paste",this.getTable(),{data:t.getParameter("data")})};r.prototype._onColumnInsert=function(t){};r.prototype.loadModules=function(){return Promise.reject()};r.prototype.updateTableByProperty=function(t,e){};r.prototype.removeToolbar=function(){};r.prototype.scrollToIndex=function(t){return Promise.reject()};r.prototype.updateRowSettings=function(){};r.prototype.createTable=function(t){};r.prototype.getRowBinding=function(){};r.prototype.bindRows=function(t){};r.prototype.isTableBound=function(){};r.prototype.createRowTemplate=function(t){};r.prototype.updateSelectionSettings=function(){};r.prototype.insertFilterInfoBar=function(t,e){};r.prototype.enableColumnResize=function(){};r.prototype.disableColumnResize=function(){};r.prototype.createColumnResizeMenuItem=function(){};r.prototype.updateRowActions=function(){};r.prototype.updateSortIndicator=function(t,e){};r.prototype.getSelectedContexts=function(){};r.prototype.clearSelection=function(){};return r});