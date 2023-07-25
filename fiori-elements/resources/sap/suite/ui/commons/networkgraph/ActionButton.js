/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element"],function(t){"use strict";var e=t.extend("sap.suite.ui.commons.networkgraph.ActionButton",{metadata:{library:"sap.suite.ui.commons",properties:{icon:{type:"string",group:"Appearance",defaultValue:null},title:{type:"string",group:"Appearance",defaultValue:null},enabled:{type:"boolean",group:"Appearance",defaultValue:true},position:{type:"sap.suite.ui.commons.networkgraph.ActionButtonPosition",group:"Appearance",defaultValue:"Right"}},events:{press:{parameters:{buttonElement:{type:"object"}}}}}});e.prototype.invalidate=function(){var t=this.getParent();if(t&&t._bActionButtonsRendered&&!this._bTimeoutRunning){this._bTimeoutRunning=true;setTimeout(function(){this._bTimeoutRunning=false;t._bActionButtonsRendered=false;t.showActionButtons(true)}.bind(this),0)}};return e});