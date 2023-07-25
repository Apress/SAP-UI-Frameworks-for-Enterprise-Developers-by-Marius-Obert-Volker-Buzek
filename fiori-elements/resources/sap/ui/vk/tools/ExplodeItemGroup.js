/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/Element","../thirdparty/three"],function(t,e){"use strict";var i=t.extend("sap.ui.vk.tools.ExplodeItemGroup",{metadata:{library:"sap.ui.vk",properties:{name:{type:"string"},magnitudeAdjustmentMultiplier:{type:"float",defaultValue:0}},aggregations:{items:{type:"sap.ui.vk.NodeProxy",multiple:true}}}});i.prototype.init=function(){this._magnitude=0;this._offset=0;this._deltaOffset=0;this._center=new e.Vector3};i.prototype.getBoundingBox=function(){var t=new e.Box3;this.getItems().forEach(function(e){e.getNodeRef()._expandBoundingBox(t,false,true,true)});return t};i.prototype.getMagnitude=function(){return this._magnitude*(this._offset+this._deltaOffset*this.getMagnitudeAdjustmentMultiplier())};return i});