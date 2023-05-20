/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(t){"use strict";var i=function(i){i=i||{};t.call(this,i);this.type="Line";this.x1=i.x1||0;this.y1=i.y1||0;this.x2=i.x2||0;this.y2=i.y2||0;this.setMaterial(i.material)};i.prototype=Object.assign(Object.create(t.prototype),{constructor:i});i.prototype.tagName=function(){return"line"};i.prototype.setFillStyle=function(t,i){};i.prototype._expandBoundingBox=function(t,i){var e=isNaN(this.strokeWidth)?0:this.strokeWidth*.5;this._expandBoundingBoxCE(t,i,this.x1,this.y1,e,e);this._expandBoundingBoxCE(t,i,this.x2,this.y2,e,e)};i.prototype._setSpecificAttributes=function(t){t("x1",this.x1);t("y1",this.y1);t("x2",this.x2);t("y2",this.y2)};i.prototype._getParametricShape=function(i,e,s){var o=t.prototype._getParametricShape.call(this,i,e,s);o.type="line";o.x1=this.x1;o.y1=this.y1;o.x2=this.x2;o.y2=this.y2;return o};i.prototype.copy=function(i,e){t.prototype.copy.call(this,i,e);this.x1=i.x1;this.y1=i.y1;this.x2=i.x2;this.y2=i.y2;return this};return i});