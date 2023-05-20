/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";function t(){this._count=0;this._total=0;var t;this.setOnValueChanged=function(n){t=n};this.callOnValueChanged=function(){if(t){t()}}}var n=t.prototype;Object.defineProperty(n,"count",{get:function(){return this._count},set:function(t){if(t!==this._count){this._count=t;this.callOnValueChanged()}}});Object.defineProperty(n,"total",{get:function(){return this._total},set:function(t){if(t!==this._total){this._total=t;this.callOnValueChanged()}}});var e=function(){var n;function e(){if(n){n(this)}}this.mesh=new t;this.geometry=new t;this.mesh.setOnValueChanged(e);this.geometry.setOnValueChanged(e);this.setOnProgressChanged=function(t){n=t}};return e});