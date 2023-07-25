/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/Control","sap/ui/base/Event","sap/m/SelectionDetails","sap/m/SelectionDetailsItem","sap/m/SelectionDetailsItemLine","sap/suite/ui/commons/ChartContainer","./ChartContainerContentRenderer"],function(e,t,i,a,n,o,s,r){"use strict";var l=t.extend("sap.suite.ui.commons.ChartContainerContent",{metadata:{library:"sap.suite.ui.commons",properties:{icon:{type:"string",group:"Misc",defaultValue:null},title:{type:"string",group:"Misc",defaultValue:null}},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}}}});l.prototype.init=function(){this._oSelectionDetails=new a;this._oSelectionDetails.registerSelectionDetailsItemFactory(l._selectionDetailsItemFactory)};l.prototype.onBeforeRendering=function(){var e=this.getParent(),t;this._oSelectionDetails.detachSelectionHandler("_selectionDetails");t=this.getContent();if(t&&t.getMetadata().getName()==="sap.viz.ui5.controls.VizFrame"){this._oSelectionDetails.attachSelectionHandler("_selectionDetails",t)}if(e instanceof s){this._oSelectionDetails.setWrapLabels(e.getWrapLabels())}};l.prototype.exit=function(){if(this._oSelectionDetails){this._oSelectionDetails.destroy();this._oSelectionDetails=null}};l.prototype.getSelectionDetails=function(){l._addEventMapping(this._oSelectionDetails);return this._oSelectionDetails.getFacade()};l.prototype._getSelectionDetails=function(){var e=this.getContent();if(e&&e.getMetadata().getName()==="sap.viz.ui5.controls.VizFrame"){return this._oSelectionDetails}};l._selectionDetailsItemFactory=function(e,t,i,a,s){s=s||"";var r=[],l,c=typeof s==="string";for(var u=0;u<e.length;u++){l=new o({label:e[u].label,value:e[u].value,unit:e[u].unit});if(!c){l.setLineMarker(s[e[u].id])}else if(u===0){l.setLineMarker(s)}r.push(l)}return new n({lines:r})};l._aProxyEvent=["beforeOpen","beforeClose","navigate","actionPress"];l._addEventMapping=function(t){var a=t.attachEvent;t.attachEvent=function(n,o,s,r){if(l._aProxyEvent.indexOf(n)===-1){a.apply(this,arguments);return}else if(e.type(o)==="function"){r=s;s=o;o=null}a.apply(t,[n,o,c,r||t.getFacade()]);function c(e){var a=new i(n,e.oSource,e.mParameters);a.getSource=t.getFacade;if(n==="actionPress"){e.getParameters().items=u(e)}else if(n==="navigate"){e.getParameters().item=e.getParameter("item").getFacade()}s.call(r||t.getFacade(),a,o)}function u(e){var t=e.getParameter("items"),i=[];for(var a=0;a<t.length;a++){i.push(t[a].getFacade())}return i}}};return l});