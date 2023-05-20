// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/base/ManagedObject","sap/ui/core/Control","sap/ui/core/Core","sap/ui/thirdparty/jquery","sap/ushell/library","sap/ushell/ui/launchpad/AccessibilityCustomData","./LinkTileWrapperRenderer"],function(e,t,i,s,o,l,a,r){"use strict";var n=i.extend("sap.ushell.ui.launchpad.LinkTileWrapper",{metadata:{library:"sap.ushell",properties:{uuid:{type:"string",group:"Misc",defaultValue:null},tileCatalogId:{type:"string",group:"Misc",defaultValue:null},tileCatalogIdStable:{type:"string",group:"Misc",defaultValue:null},target:{type:"string",group:"Misc",defaultValue:null},visible:{type:"boolean",group:"Misc",defaultValue:true},debugInfo:{type:"string",group:"Misc",defaultValue:null},animationRendered:{type:"boolean",group:"Misc",defaultValue:false},isLocked:{type:"boolean",group:"Misc",defaultValue:false},tileActionModeActive:{type:"boolean",group:"Misc",defaultValue:false},ieHtml5DnD:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{tileViews:{type:"sap.ui.core.Control",multiple:true,singularName:"tileView"},footItems:{type:"sap.ui.core.Control",multiple:true,singularName:"footItem"}},events:{press:{},coverDivPress:{},afterRendering:{},showActions:{}}},renderer:r});n.prototype.destroy=function(e){this.destroyTileViews();i.prototype.destroy.call(this,e)};n.prototype.addTileView=function(e,i){e.setParent(null);e.addCustomData(new a({key:"tabindex",value:"-1",writeToDom:true}));t.prototype.addAggregation.call(this,"tileViews",e,i)};n.prototype.destroyTileViews=function(){if(this.mAggregations.tileViews){this.mAggregations.tileViews.length=0}};n.prototype.onAfterRendering=function(){this.fireAfterRendering()};n.prototype.onclick=n.prototype._onPress;n.prototype.onsapenter=n.prototype._launchTileViaKeyboard;n.prototype.onsapspace=n.prototype._launchTileViaKeyboard;n.prototype._launchTileViaKeyboard=function(t){e.info("Tile pressed:",this.getDebugInfo(),"sap.ushell.ui.launchpad.LinkTileWrapper");s.getEventBus().publish("launchpad","dashboardTileLinkClick");if(this.getTileActionModeActive()){return}else if(this._getTileState()==="Failed"){this._onFailedStatePress()}else if(t.target.tagName!=="BUTTON"){var i=this.getTileViews()[0],o=false;if(i.firePress){i.firePress()}else{while(i.getContent&&!o){i=i.getContent()[0];if(i.firePress){i.firePress();o=true}}}}};n.prototype._onPress=function(t){e.info("Tile pressed:",this.getDebugInfo(),"sap.ushell.ui.launchpad.LinkTileWrapper");s.getEventBus().publish("launchpad","dashboardTileLinkClick");if(!this.getTileActionModeActive()&&this._getTileState()==="Failed"){this._onFailedStatePress()}};n.prototype._onFailedStatePress=function(){if(!this.getTileActionModeActive()&&this._getTileState()==="Failed"){if(!this.FailedTileDialog){sap.ui.require(["sap/ushell/ui/launchpad/FailedTileDialog"],function(e){this.FailedTileDialog=new e;this._onFailedStatePress()}.bind(this))}else{this.FailedTileDialog.openFor(this)}return}};n.prototype._getTileState=function(){var e=this.getTileViews();var t;for(var i=0;i<e.length&&!t;++i){if(e[i].isA("sap.m.GenericTile")){t=e[i]}}if(!t){throw new Error("Could not find the wrapped Tile")}return t.getState()};n.prototype.setVisible=function(e){this.setProperty("visible",e,true);return this.toggleStyleClass("sapUshellHidden",!e)};n.prototype.setAnimationRendered=function(e){this.setProperty("animationRendered",e,true)};n.prototype._handleTileShadow=function(e,t){if(e.length){e.unbind("mouseenter mouseleave");var i,s=e.css("border").split("px")[0],l=this.getModel();if(s>0){i=e.css("border-color")}else{i=this.getRgba()}e.hover(function(){if(!l.getProperty("/tileActionModeActive")){var t=o(e).css("box-shadow"),s=t?t.split(") ")[1]:null,a;if(s){a=s+" "+i;o(this).css("box-shadow",a)}}},function(){o(this).css("box-shadow","")})}};n.prototype.setUuid=function(e){this.setProperty("uuid",e,true);return this};return n});