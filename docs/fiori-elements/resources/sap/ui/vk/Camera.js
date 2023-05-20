/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(e){"use strict";var t=e.extend("sap.ui.vk.Camera",{metadata:{library:"sap.ui.vk",properties:{position:{type:"float[]",defaultValue:[0,0,0]},targetDirection:{type:"float[]",defaultValue:[1,0,0]},upDirection:{type:"float[]",defaultValue:[0,1,0]},nearClipPlane:{type:"float",defaultValue:.1},farClipPlane:{type:"float",defaultValue:1}}}});t.prototype.getCameraRef=function(){return null};t.prototype.getIsModified=function(){return!!this._isModified};t.prototype.setIsModified=function(e){this._isModified=e};return t});