/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log"],function(t){"use strict";var e=function(t){this._context=t!=null&&"context"in t?t.context:null;this._featureId=t!=null&&"featureId"in t?t.featureId:null};e.prototype.isFeature=true;e._classMap=new Map;e.prototype.setContext=function(t){this._context=t;return this};e.prototype.getContext=function(){return this._context};e.prototype.setFeatureId=function(t){this._featureId=t;return this};e.prototype.getFeatureId=function(){return this._featureId};e.prototype.toJSON=function(){return{}};e.createFromJSON=function(n){if(n!=null){var r=e._classMap.get(n.type);if(r){return new r(n)}t.warning("Unknown feature type:",n.type)}return null};e.prototype.clone=function(){return e.createFromJSON(this.toJSON(true))};return e});