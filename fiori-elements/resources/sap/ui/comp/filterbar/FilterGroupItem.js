/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["./FilterItem","sap/ui/comp/library"],function(t,e){"use strict";var r=t.extend("sap.ui.comp.filterbar.FilterGroupItem",{metadata:{library:"sap.ui.comp",properties:{groupTitle:{type:"string",group:"Misc",defaultValue:null},groupName:{type:"string",group:"Misc",defaultValue:null},visibleInAdvancedArea:{type:"boolean",group:"Misc",defaultValue:false}}}});r.prototype.init=function(){this.setVisibleInAdvancedArea(false);this._setParameter(false)};r.prototype._setParameter=function(t){this._bIsParameter=t};r.prototype.setGroupTitle=function(t){this.setProperty("groupTitle",t);this.fireChange({propertyName:"groupTitle"});return this};r.prototype.setVisibleInAdvancedArea=function(t){this.setVisibleInFilterBar(t);return this};r.prototype.getVisibleInAdvancedArea=function(){return this.getVisibleInFilterBar()};r.prototype._getControl=function(){return this.getControl.apply(this,arguments)};r.prototype.destroy=function(){t.prototype.destroy.apply(this,arguments)};return r});