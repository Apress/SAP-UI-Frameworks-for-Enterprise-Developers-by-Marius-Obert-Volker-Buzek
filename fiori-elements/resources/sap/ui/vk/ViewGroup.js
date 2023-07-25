/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/ManagedObject","./findIndexInArray"],function(i,t){"use strict";var e=i.extend("sap.ui.vk.ViewGroup",{metadata:{library:"sap.ui.vk",properties:{viewGroupId:{type:"string"},name:{type:"string"},description:{type:"string"}},associations:{}}});e.prototype.init=function(){this._views=[]};e.prototype.exit=function(){this._views=null};e.prototype.getViews=function(){return this._views};e.prototype.addView=function(i){this._views.push(i);return this};e.prototype.insertView=function(i,t){if(t<0){t=0}else if(t!==0&&t>=this._views.length){t=this._views.length}this._views.splice(t,0,i);return this};e.prototype.indexOfView=function(i){return t(this._views,function(t){return t==i})};e.prototype.removeView=function(i){var t=this.indexOfView(i);if(t>=0){this._views.splice(t,1)}return this};e.prototype.removeViews=function(){if(this._views){this._views.splice(0)}return this};return e});