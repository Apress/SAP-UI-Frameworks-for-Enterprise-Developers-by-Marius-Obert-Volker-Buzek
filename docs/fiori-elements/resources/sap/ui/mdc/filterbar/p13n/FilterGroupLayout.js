/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control"],function(t){"use strict";var e=t.extend("sap.ui.mdc.filterbar.p13n.FilterGroupLayout",{renderer:{apiVersion:2,render:function(t,e){t.openStart("div",e);t.style("height","100%");t.openEnd();t.renderControl(e.getItems()[0]);t.close("div")}}});e.prototype._getFieldPath=function(){return this._sFieldPath};e.prototype.setFilterField=function(t){this._oFilterField=t;this._sFieldPath=t.getFieldPath()};e.prototype.getIdForLabel=function(){return this._oFilterField&&this._oFilterField.getIdForLabel()};e.prototype.getAccessibilityInfo=function(){return{children:this.getItems()}};e.prototype.getItems=function(){var t=[];t.push(this._oFilterField);return t};e.prototype.exit=function(){t.prototype.exit.apply(this,arguments);this._oFilterField=null;this._sFieldPath=null};return e});