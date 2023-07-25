/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../BaseNodeProxy"],function(t){"use strict";var e=t.extend("sap.ui.vk.threejs.BaseNodeProxy",{metadata:{library:"sap.ui.vk"}});e.prototype.init=function(t,e){this._object3D=e};e.prototype.reset=function(){this._object3D=null};e.prototype.getNodeRef=function(){return this._object3D};e.prototype.getNodeId=function(){return this._object3D};e.prototype.getName=function(){return this._object3D.name||"<"+this._object3D.type+">"};e.prototype.getNodeMetadata=function(){return this._object3D.userData.metadata||{}};e.prototype.getHasChildren=function(){return this._object3D.children.length>0};e.prototype.getSceneRef=function(){return this._object3D};return e});