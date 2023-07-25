/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/thirdparty/jquery"],function(e,t){"use strict";var a={};var o=e.extend("sap.suite.ui.commons.statusindicator.shapes.ShapeFactory");o.prototype.getShapeById=function(e){var a=this._getLoadedShapes(),o=a[e]||null;if(!o){return new Promise(function(o,r){t.ajax({url:sap.ui.require.toUrl("sap/suite/ui/commons/statusindicator")+"/shapes/"+e+".svg",dataType:"text"}).done(function(t){a[e]=t;o(t)}).fail(function(e){r(e)})})}return Promise.resolve(o)};o.prototype._getLoadedShapes=function(){return a};o.prototype._removeAllLoadedShapes=function(){a={}};return o});