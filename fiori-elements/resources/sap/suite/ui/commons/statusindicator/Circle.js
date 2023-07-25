/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/suite/ui/commons/statusindicator/Shape","sap/suite/ui/commons/util/HtmlElement","sap/suite/ui/commons/statusindicator/SimpleShape","sap/suite/ui/commons/statusindicator/SimpleShapeRenderer"],function(t,e,i,s){"use strict";var r=i.extend("sap.suite.ui.commons.statusindicator.Circle",{metadata:{library:"sap.suite.ui.commons",properties:{cx:{type:"float",defaultValue:0},cy:{type:"float",defaultValue:0},r:{type:"float",defaultValue:0}}},renderer:s});r.prototype._getSimpleShapeElement=function(t){var i=new e("circle");i.setId(this._buildIdString(t));i.setAttribute("cx",this.getCx());i.setAttribute("cy",this.getCy());i.setAttribute("r",this.getR());i.setAttribute("stroke-width",this.getStrokeWidth());i.setAttribute("stroke",this._getCssStrokeColor());return i};return r});