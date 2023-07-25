/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../BaseNodeProxy"],function(e){"use strict";var t=e.extend("sap.ui.vk.svg.BaseNodeProxy",{metadata:{library:"sap.ui.vk"}});t.prototype.init=function(e,t){this._element=t};t.prototype.reset=function(){this._element=null};t.prototype.getNodeRef=function(){return this._element};t.prototype.getNodeId=function(){return this._element};t.prototype.getName=function(){return this._element.name||"<"+this._element.type+">"};t.prototype.getNodeMetadata=function(){return this._element.userData.metadata||{}};t.prototype.getSceneRef=function(){return this._element};return t});