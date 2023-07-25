/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/assert","./Feature","./FeatureType"],function(e,t,r){"use strict";var o=[0,0,0,0,0,0];var s=function(e){t.apply(this,arguments);this._edge=new Float64Array(6);this.setValue(e&&e.edge||o)};s.prototype=Object.create(t.prototype);s.prototype.constructor=s;s.prototype.isEdge=true;t._classMap.set(r.Edge,s);s.prototype.setValue=function(t){e(t.length===6,"Edge array must have 6 elements");this._edge.set(t);return this};s.prototype.getValue=function(){return this._edge};s.prototype.toJSON=function(){return{type:r.Edge,edge:Array.from(this._edge)}};return s});