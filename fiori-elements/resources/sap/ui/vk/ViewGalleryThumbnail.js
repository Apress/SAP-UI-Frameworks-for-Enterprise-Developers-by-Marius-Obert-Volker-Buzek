/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/Image","./Core","./ViewGalleryThumbnailRenderer"],function(e,t,a){"use strict";var l=e.extend("sap.ui.vk.ViewGalleryThumbnail",{metadata:{library:"sap.ui.vk",associations:{viewGallery:{type:"sap.ui.vk.ViewGallery"}},properties:{enabled:{type:"boolean",defaultValue:true},thumbnailWidth:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},thumbnailHeight:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},source:{type:"string",defaultValue:""},tooltip:{type:"string",defaultValue:""},selected:{type:"boolean",defaultValue:false},processing:{type:"boolean",defaultValue:false},animated:{type:"boolean",defaultValue:false}}},constructor:function(a,l){e.apply(this,arguments);this._viewGallery=null;t.observeAssociations(this)}});l.prototype.onSetViewGallery=function(e){this._viewGallery=e};l.prototype.onUnsetViewGallery=function(e){this._viewGallery=null};l.prototype._getIndex=function(){return this._viewGallery?this._viewGallery._viewItems.indexOf(this):-1};return l});