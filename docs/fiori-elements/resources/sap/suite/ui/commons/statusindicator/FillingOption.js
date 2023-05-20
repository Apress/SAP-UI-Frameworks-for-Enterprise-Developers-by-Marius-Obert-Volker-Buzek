/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","sap/base/Log"],function(t,e){"use strict";var i=t.extend("sap.suite.ui.commons.statusindicator.FillingOption",{metadata:{library:"sap.suite.ui.commons",properties:{shapeId:{type:"string",defaultValue:null},weight:{type:"int",defaultValue:1},order:{type:"int"}}}});i.prototype.setWeight=function(t){if(t<=0){e.fatal("An invalid weight is passed. Weight should be a positive integer. Given: "+t)}this.setProperty("weight",t)};return i});