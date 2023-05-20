/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/ColumnListItem","sap/m/ColumnListItemRenderer","sap/m/Label"],function(t,e,i){"use strict";var l=t.extend("sap.ui.mdc.filterbar.p13n.FilterColumnLayout",{metadata:{library:"sap.ui.mdc"},renderer:e});l.prototype._getFieldPath=function(){return this._sFieldPath};l.prototype.setFilterField=function(t){this._sLabel=t.getLabel();this._oFilterField=t;this._sFieldPath=t.getFieldPath()};l.prototype.getCells=function(){var t=[];var e=new i({text:this._sLabel});e.setParent(this);t.push(e);t.push(this._oFilterField);return t};l.prototype.exit=function(){t.prototype.exit.apply(this,arguments);this._oFilterField=null;this._sFieldPath=null};return l});