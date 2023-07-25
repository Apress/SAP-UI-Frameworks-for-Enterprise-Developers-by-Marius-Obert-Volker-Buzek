/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(t){"use strict";var o=function(o){o=o||{};t.call(this,o);this.type="Polyline";this.points=new Float32Array(o.points||[0,0,100,100]);this.closed=o.closed||false;this.setMaterial(o.material)};o.prototype=Object.assign(Object.create(t.prototype),{constructor:o});o.prototype.tagName=function(){return this.closed?"polygon":"polyline"};o.prototype._expandBoundingBox=function(t,o){var i=isNaN(this.strokeWidth)?0:this.strokeWidth*.5;var e=this.points;for(var s=0,n=e.length;s<n;s+=2){this._expandBoundingBoxCE(t,o,e[s],e[s+1],i,i)}};o.prototype._setSpecificAttributes=function(t){t("points",this.points.join(" "))};o.prototype._getParametricShape=function(o,i,e){var s=t.prototype._getParametricShape.call(this,o,i,e);s.type="polyline";s.points=Array.from(this.points);s.closed=this.closed;s.dim=2;return s};o.prototype.copy=function(o,i){t.prototype.copy.call(this,o,i);this.points=o.points.slice();this.closed=o.closed;return this};return o});