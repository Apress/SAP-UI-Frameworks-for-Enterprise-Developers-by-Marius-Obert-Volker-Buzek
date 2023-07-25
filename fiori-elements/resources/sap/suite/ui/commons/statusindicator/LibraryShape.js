/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./CustomShape","./CustomShapeRenderer","./shapes/ShapeFactory"],function(e,t,a){"use strict";var r=e.extend("sap.suite.ui.commons.statusindicator.LibraryShape",{metadata:{properties:{shapeId:{type:"string",group:"Misc",defaultValue:null}},events:{afterShapeLoaded:{}}},renderer:t});r.prototype.setShapeId=function(e){e=this._getValidShapeId(e);this.setProperty("shapeId",e,true);(new a).getShapeById(e).then(function(e){this.setDefinition(e);this.fireAfterShapeLoaded()}.bind(this));return this};r.prototype._getValidShapeId=function(e){return e.replace(/[\\\.\/]/g,"")};return r});