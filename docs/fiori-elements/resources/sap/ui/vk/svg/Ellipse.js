/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(t){"use strict";var i=function(i){i=i||{};t.call(this,i);this.type="Ellipse";this.cx=i.cx||0;this.cy=i.cy||0;this.rx=i.major||i.radius||0;this.ry=i.minor||i.radius||0;this.setMaterial(i.material)};i.prototype=Object.assign(Object.create(t.prototype),{constructor:i});i.prototype.tagName=function(){return"ellipse"};i.prototype._expandBoundingBox=function(t,i){var r=isNaN(this.strokeWidth)?0:this.strokeWidth*.5;this._expandBoundingBoxCR(t,i,this.cx,this.cy,this.rx+r,this.ry+r)};i.prototype._setSpecificAttributes=function(t){if(this.cx){t("cx",this.cx)}if(this.cy){t("cy",this.cy)}t("rx",this.rx);t("ry",this.ry)};i.prototype._getParametricShape=function(i,r,s){var e=t.prototype._getParametricShape.call(this,i,r,s);if(this.rx===this.ry){e.type="circle";e.radius=this.rx}else{e.type="ellipse";e.major=this.rx;e.minor=this.ry}return e};i.prototype.copy=function(i,r){t.prototype.copy.call(this,i,r);this.cx=i.cx;this.cy=i.cy;this.rx=i.rx;this.ry=i.ry;return this};return i});