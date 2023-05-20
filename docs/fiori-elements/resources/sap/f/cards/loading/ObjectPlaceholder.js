/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Core","sap/ui/core/ResizeHandler","sap/ui/dom/units/Rem"],function(e,t,i,r){"use strict";var s=400;var o=r.toPx(3.25);var n=e.extend("sap.f.cards.loading.ObjectPlaceholder",{metadata:{library:"sap.f",properties:{groups:{type:"object"},configuration:{type:"object"}},aggregations:{_rootLayout:{multiple:false,visibility:"hidden"}}},renderer:{apiVersion:2,render:function(e,i){var r=t.getLibraryResourceBundle("sap.ui.core"),s=r.getText("BUSY_TEXT");e.openStart("div",i).class("sapFCardContentPlaceholder").class("sapFCardContentObjectPlaceholder").attr("tabindex","0").attr("title",s);e.accessibilityState(i,{role:"progressbar",valuemin:"0",valuemax:"100"});e.openEnd();for(var o=0;o<i._iColsCnt;o++){this.renderColumn(e,i._iRowsCnt)}e.close("div")},renderColumn:function(e,t){e.openStart("div").class("sapFCardObjectPlaceholderColumn").openEnd();for(var i=0;i<t;i++){this.renderRow(e,"First",false);this.renderRow(e,"Second",i===t)}e.close("div")},renderRow:function(e,t,i){e.openStart("div").class("sapFCardLoadingShimmer").class("sapFCardObjectPlaceholderGroup"+t+"Row");if(i){e.class("sapFCardObjectPlaceholderGroupLastRow")}e.openEnd().close("div")}}});n.prototype.init=function(){this._iColsCnt=1;this._iRowsCnt=0};n.prototype.exit=function(){this._deregisterResizeHandler()};n.prototype.onBeforeRendering=function(){this._deregisterResizeHandler()};n.prototype.onAfterRendering=function(){this._sResizeListenerId=i.register(this.getDomRef(),this._handleResize.bind(this));this._handleResize()};n.prototype._handleResize=function(){var e=this.$().height();var t=Math.floor(e/o);var i=this.$().width()>s?2:1;if(this._iRowsCnt!==t||this._iColsCnt!==i){this._iRowsCnt=t;this._iColsCnt=i;this.invalidate()}};n.prototype._deregisterResizeHandler=function(){if(this._sResizeListenerId){i.deregister(this._sResizeListenerId);this._sResizeListenerId=""}};return n});