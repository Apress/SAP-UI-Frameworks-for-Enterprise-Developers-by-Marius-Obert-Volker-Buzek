/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(e){"use strict";var t=e.extend("sap.ui.vk.Texture",{metadata:{library:"sap.ui.vk",properties:{id:{type:"string"},filterMode:{type:"int",defaultValue:0},uvRotationAngle:{type:"float",defaultValue:0},uvHorizontalOffset:{type:"float",defaultValue:0},uvVerticalOffset:{type:"float",defaultValue:0},uvHorizontalScale:{type:"float",defaultValue:0},uvVerticalScale:{type:"float",defaultValue:0},uvHorizontalTilingEnabled:{type:"boolean",defaultValue:true},uvVerticalTilingEnabled:{type:"boolean",defaultValue:true}}}});t.prototype.load=function(e){return this};t.prototype.getTextRef=function(){return null};return t});