/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Gizmo","../svg/HotspotHelper"],function(t,e){"use strict";var i=t.extend("sap.ui.vk.tools.CreateParametricGizmo",{metadata:{library:"sap.ui.vk"}});i.prototype.init=function(){if(t.prototype.init){t.prototype.init.apply(this)}this._viewport=null;this._tool=null;this._activeElement=null};i.prototype.updateParentNode=function(){if(!this._tool||!this._viewport){return}var t=this._tool.getParentNode();if(!t){t=this._viewport._scene.getRootElement();while(t.userData.skipIt&&t.children.length>0){t=t.children[0]}}this._root=t};i.prototype._createRequest=function(t){return(new e).createRequest(t,this._viewport)};return i});