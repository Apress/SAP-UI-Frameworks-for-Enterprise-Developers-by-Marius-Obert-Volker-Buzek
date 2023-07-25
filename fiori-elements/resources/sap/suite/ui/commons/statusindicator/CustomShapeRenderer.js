/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["../library","sap/suite/ui/commons/util/HtmlElement","sap/ui/core/Renderer"],function(t,e,r){"use strict";var i=r.extend("sap.suite.ui.commons.statusindicator.CustomShapeRenderer");i.apiVersion=2;i.render=function(t,e){var r=this._getHtmlModel(e);r.getRenderer().render(t)};i._getHtmlModel=function(t){var r=new e("svg");r.addControlData(t);r.setAttribute("version","1.1");r.setAttribute("xlmns","http://www.w3.org/2000/svg");var i=t._getInternalViewBox();if(i){r.setAttribute("viewBox",i)}r.setAttribute("preserveAspectRatio",t._buildPreserveAspectRatioAttribute());r.setAttribute("x",t.getX());r.setAttribute("y",t.getY());r.setAttribute("width",t.getWidth());r.setAttribute("height",t.getHeight());t.getShapes().forEach(r.addChild.bind(r));return r};i._updateDomColor=function(t,e){t._aFillableSubShapes.forEach(function(t){var r=t.shape;var i=r.getRenderer();i._updateDomColor(r,e)})};return i},true);