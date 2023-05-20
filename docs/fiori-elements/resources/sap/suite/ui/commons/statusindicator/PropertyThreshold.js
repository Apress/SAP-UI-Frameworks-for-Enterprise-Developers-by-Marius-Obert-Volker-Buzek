/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","sap/suite/ui/commons/statusindicator/util/ThemingUtil"],function(t,l){"use strict";var e=t.extend("sap.suite.ui.commons.statusindicator.PropertyThreshold",{metadata:{library:"sap.suite.ui.commons",properties:{fillColor:{type:"sap.m.ValueCSSColor",defaultValue:"Neutral"},toValue:{type:"int",defaultValue:0},ariaLabel:{type:"string",defaultValue:null}}},renderer:null});e.prototype._getCssFillColor=function(){if(!this._cssFillColor){this._cssFillColor=l.resolveColor(this.getFillColor())}return this._cssFillColor};return e});