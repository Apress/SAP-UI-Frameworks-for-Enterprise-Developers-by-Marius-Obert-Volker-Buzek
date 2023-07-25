/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../Scene","./NodeHierarchy","sap/base/util/uid"],function(e,t,r){"use strict";var i=e.extend("sap.ui.vk.dvl.Scene",{metadata:{library:"sap.ui.vk"},constructor:function(t,i){e.call(this);this._id=r();this._graphicsCore=t;this._dvlSceneRef=i;this._defaultNodeHierarchy=null}});i.prototype.destroy=function(){if(this._defaultNodeHierarchy){this._defaultNodeHierarchy.destroy();this._defaultNodeHierarchy=null}this._dvlSceneRef=null;this._graphicsCore=null;e.prototype.destroy.call(this)};i.prototype.getId=function(){return this._id};i.prototype.getGraphicsCore=function(){return this._graphicsCore};i.prototype.getDefaultNodeHierarchy=function(){if(!this._defaultNodeHierarchy){this._defaultNodeHierarchy=new t(this)}return this._defaultNodeHierarchy};i.prototype.getSceneRef=function(){return this._dvlSceneRef};i.prototype.setDoubleSided=function(e){this.setProperty("doubleSided",e,true);this._graphicsCore._dvl.Renderer.SetOption(sap.ve.dvl.DVLRENDEROPTION.DVLRENDEROPTION_SHOW_BACKFACING,e);return this};return i});