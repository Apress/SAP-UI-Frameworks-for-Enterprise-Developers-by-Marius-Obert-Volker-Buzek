/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/assert","./Feature","./FeatureType"],function(t,e,r){"use strict";var o=[0,0,0];var s=function(t){e.apply(this,arguments);this._vertex=new Float64Array(3);this.setValue(t&&t.vertex||o)};s.prototype=Object.create(e.prototype);s.prototype.constructor=s;s.prototype.isVertex=true;e._classMap.set(r.Vertex,s);s.prototype.setValue=function(e){t(e.length===3,"Vertex array must have 3 elements");this._vertex.set(e);return this};s.prototype.getValue=function(){return this._vertex};s.prototype.toJSON=function(){return{type:r.Vertex,vertex:Array.from(this._vertex)}};return s});