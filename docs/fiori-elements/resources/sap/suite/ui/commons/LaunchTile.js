/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","sap/m/library","./LaunchTileRenderer"],function(e,t,i){"use strict";var r=e.extend("sap.suite.ui.commons.LaunchTile",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{title:{type:"string",group:"Misc",defaultValue:null},icon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},link:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null}},events:{press:{}}}});r.prototype.exit=function(){if(this._iconImage){this._iconImage.destroy();this._iconImage=undefined}};r.prototype.setIcon=function(e){if(!e){return this}this.setProperty("icon",e,true);var i=this.getId()+"-img";var r="72px";var s={src:e,height:r,width:r,size:r};this._iconImage=t.ImageHelper.getImageControl(i,this._iconImage,this,s);return this};r.prototype.onclick=function(){this.firePress({title:this.getTitle(),link:this.getLink()})};return r});