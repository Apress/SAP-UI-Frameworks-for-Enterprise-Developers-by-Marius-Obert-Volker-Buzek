/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/suite/ui/commons/util/HtmlElement","sap/suite/ui/commons/statusindicator/SimpleShape","sap/suite/ui/commons/statusindicator/SimpleShapeRenderer"],function(t,e,s){"use strict";var i=e.extend("sap.suite.ui.commons.statusindicator.Path",{metadata:{library:"sap.suite.ui.commons",properties:{d:{type:"string",defaultValue:null}}},renderer:s});i.prototype._getSimpleShapeElement=function(e){var s=new t("path");s.setId(this._buildIdString(e));s.setAttribute("d",this.getD());s.setAttribute("stroke-width",this.getStrokeWidth());s.setAttribute("stroke",this._getCssStrokeColor());if(this.aCustomStyleClasses){this.aCustomStyleClasses.forEach(s.addClass.bind(s))}return s};return i});