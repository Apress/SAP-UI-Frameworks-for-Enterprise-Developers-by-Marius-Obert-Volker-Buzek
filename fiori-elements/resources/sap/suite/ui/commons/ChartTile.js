/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./InfoTile","./ChartTileRenderer"],function(t,e){"use strict";var i=t.extend("sap.suite.ui.commons.ChartTile",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{unit:{type:"string",group:"Misc",defaultValue:null}}}});i.prototype.init=function(){t.prototype.init.apply(this)};i.prototype.onAfterRendering=function(){this._addDescriptionMargin()};i.prototype.onBeforeRendering=function(){this._setContentProperty("size",this.getSize())};i.prototype._addDescriptionMargin=function(){if(this.getDescription()&&this.getUnit()){var t=this.$("description").hide();var e=this.$("unit").outerWidth()+1;t.css("margin-right","-"+e+"px").css("padding-right",e+"px").show()}};i.prototype._setContentProperty=function(t,e){var i=this.getContent();if(i){i.setProperty(t,e)}};return i});