/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log","./Feature","../uuidv4"],function(t,e,i){"use strict";var r=function(t){this._id=t&&"id"in t?t.id:i();this._visible=t&&"visible"in t?t.visible:true;this._highlighted=false;this._features=[];if(t.features){t.features.forEach(function(t){this._features.push(e.createFromJSON(t))},this)}};r.prototype.isMeasurement=true;r._classMap=new Map;r.prototype.getId=function(){return this._id};r.prototype.getVisible=function(){return this._visible};r.prototype.setVisible=function(t){this._visible=t;return this};r.prototype.setHighlighted=function(t){this._highlighted=t;return this};r.prototype.getHighlighted=function(){return this._highlighted};r.prototype.setFeatures=function(t){this._features=t.map(function(t){return t!=null?t.clone():null});return this};r.prototype.getFeatures=function(){return this._features};r.createFromJSON=function(e){if(e!=null){var i=r._classMap.get(e.type);if(i){return new i(e)}t.warning("Unknown measurement type:",e.type)}return null};r.prototype.clone=function(){return r.createFromJSON(this.toJSON())};return r});