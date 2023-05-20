/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element"],function(t){"use strict";var e=t.extend("sap.suite.ui.commons.networkgraph.Coordinate",{metadata:{library:"sap.suite.ui.commons",properties:{x:{type:"float",group:"Misc",defaultValue:undefined},y:{type:"float",group:"Misc",defaultValue:undefined}}}});e.prototype.setX=function(t){this.setProperty("x",t,true);return this};e.prototype.setY=function(t){this.setProperty("y",t,true);return this};return e});