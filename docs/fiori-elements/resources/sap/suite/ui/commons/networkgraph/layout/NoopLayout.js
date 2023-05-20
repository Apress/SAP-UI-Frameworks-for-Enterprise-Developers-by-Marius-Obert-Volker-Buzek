/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/suite/ui/commons/library","./LayoutAlgorithm","./LayoutTask"],function(t,e,r){"use strict";var o=t.networkgraph.LayoutRenderType;var i=e.extend("sap.suite.ui.commons.networkgraph.layout.NoopLayout");i.prototype.getLayoutRenderType=function(){return o.LayeredWithGroups};i.prototype.layout=function(){return new r(function(t,e,r){var o=this.getParent();if(r.isTerminated()){t();return}if(!o){e("The algorithm must be associated with a graph.");return}this._normalizeLines();t()}.bind(this))};return i});