/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/integration/library","sap/ui/core/Control","sap/m/HBox","sap/m/Image","sap/m/ToggleButton","./Card","sap/ui/core/Core","sap/ui/dom/includeStylesheet","sap/ui/integration/util/CardMerger"],function(e,t,i,o,r,s,a,n,l){"use strict";var g=e.CardDataMode,d=e.CardPreviewMode;var u=t.extend("sap.ui.integration.designtime.editor.CardPreview",{metadata:{library:"sap.ui.integration",properties:{settings:{type:"any"},card:{type:"object"},parentWidth:{type:"sap.ui.core.CSSSize"},parentHeight:{type:"sap.ui.core.CSSSize"}},aggregations:{cardPreview:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},associations:{_editor:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}}},renderer:{apiVersion:2,render:function(e,t){if(t._getCurrentMode()==="None"){e.openStart("div",t);e.openEnd();e.close("div");return}e.openStart("div",t);e.class("sapUiIntegrationDTPreview");if(h()){e.class("sapUiIntegrationDTPreviewDark")}var i=t.getSettings().preview.position;if(i==="separate"){e.class("sapUiIntegrationDTPreviewSeparate");document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth","100%");document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight","100%")}e.openEnd();e.openStart("div",t.getId()+"-before");e.attr("tabindex","-1");e.openEnd();e.close("div");e.renderControl(t._getCardPreview());e.openStart("div",t.getId()+"-after");e.attr("tabindex","-1");e.openEnd();e.close("div");var o=t._getModes();if(o.indexOf("Abstract")>-1&&(o.indexOf("Live")>-1||o.indexOf("Mock")>-1||o.indexOf("MockData")>-1)){e.renderControl(t._getModeToggleButton())}if(o!=="Abstract"&&(!i||i==="right"||i==="left")){e.renderControl(t._getResizeToggleButton())}if(i==="top"||i==="bottom"){document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth",t.getParentWidth());document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight",t.getParentHeight())}e.close("div")}}});u.prototype.init=function(){this._oResourceBundle=a.getLibraryResourceBundle("sap.ui.integration");a.attachThemeChanged(function(){if(this.getDomRef()){if(h()){this.getDomRef().classList.add("sapUiIntegrationDTPreviewDark")}else{this.getDomRef().classList.remove("sapUiIntegrationDTPreviewDark")}}else{this.update()}}.bind(this))};u.prototype.destroy=function(){if(this._oModeToggleButton){this._oModeToggleButton.destroy()}if(this._oCardPreview){this._oCardPreview.destroy()}if(this._oImagePlaceholder){this._oImagePlaceholder.destroy()}if(this._oCardPlaceholder){this._oCardPlaceholder.destroy()}t.prototype.destroy.apply(this,arguments);document.body.style.removeProperty("--sapUiIntegrationEditorPreviewWidth");document.body.style.removeProperty("--sapUiIntegrationEditorPreviewHeight")};u.prototype.onAfterRendering=function(){var e=this.getAggregation("cardPreview"),t=this._getModes();if((t.indexOf("Live")>-1||t.indexOf("Mock")>-1||t.indexOf("MockData")>-1)&&e&&e.getDomRef()&&e.getDomRef().getElementsByClassName("sapVizFrame")){window.setTimeout(function(){try{var t=e.getDomRef().getElementsByClassName("sapVizFrame")[0].id;var i=a.byId(t);if(i.getVizProperties()&&i.getVizProperties().legendGroup.layout.position==="bottom"&&i.getVizProperties().legendGroup.layout.alignment==="center"){e.getDomRef().getElementsByClassName("v-m-legend")[0].transform.baseVal[0].matrix.e=110}}catch(e){}},500)}};u.prototype.getEditor=function(){var e=this.getAssociation("_editor");return a.byId(e)};u.prototype._getCardPreview=function(){var e=null;if(this._getCurrentMode()==="Abstract"&&this.getSettings().preview.src){e=this._getImagePlaceholder()}else if(this._getCurrentMode()!=="None"){e=this._getCardRealPreview()}if(e){this.setAggregation("cardPreview",e);if(!this.getSettings().preview||this.getSettings().preview.scaled!==false){e.removeStyleClass("sapUiIntegrationDTPreviewScale");e.removeStyleClass("sapUiIntegrationDTPreviewScaleSpec");var t=a.getConfiguration().getLanguage().replaceAll("_","-");if(this._getCurrentSize()!=="Full"){if(t.startsWith("ar")||t.startsWith("he")){e.addStyleClass("sapUiIntegrationDTPreviewScaleSpec")}else{e.addStyleClass("sapUiIntegrationDTPreviewScale")}}}else{e.addStyleClass("sapUiIntegrationDTPreviewNoScale")}}return e};u.prototype.getTransformContentInfo=function(){return{transformStyle:"scale3d(0.45, 0.45, 1)",transformFactor:.45,transformOriginStyle:"0 0",widthStyle:"400px + 10rem",heightStyle:"700px - 1.5rem",zIndex:this.getEditor()._iZIndex}};u.prototype._getCardRealPreview=function(){if(!this._oCardPreview){var e=!this.getSettings().preview.interactive;this._oCardPreview=new s({dataMode:g.Active,readonly:e,readonlyZIndex:this.getEditor()._iZIndex+1});this._oCardPreview.setBaseUrl(this.getCard().getBaseUrl());if(e){this._oCardPreview.onfocusin=this._onfocusin.bind(this)}}if(this._currentMode==="MockData"){this._oCardPreview.setProperty("useMockData",true);this._oCardPreview.setPreviewMode(d.MockData)}else if(this._currentMode==="Abstract"){this._oCardPreview.setPreviewMode(d.Abstract)}else if(this._currentMode==="Live"){this._oCardPreview.setPreviewMode(d.Off)}this._initalChanges=this._initalChanges||this._oCardPreview.getManifestChanges()||[];var t=this._initalChanges.concat([this.getEditor().getCurrentSettings()]);this._oCardPreview.setManifestChanges(t);this._oCardPreview.setManifest(this.getCard()._oCardManifest._oManifest.getRawJson());this._oCardPreview.setHost(this.getCard().getHost());this._oCardPreview.refresh();this._oCardPreview.editor=this._oCardPreview.editor||{};this._oCardPreview.preview=this._oCardPreview.editor.preview=this;return this._oCardPreview};u.prototype._getImagePlaceholder=function(){var e=this.getSettings();if(e.preview.src){if(!this._oImagePlaceholder){var t=new i;t.addStyleClass("sapFCard");var r=this.getCard().getBaseUrl();if(!r&&typeof this.getCard().getManifest()==="string"){r=this.getCard().getManifest();r=r.substring(0,r.lastIndexOf("/")+1)}var s=r+"/"+e.preview.src;var a=new o({src:s});a.addStyleClass("sapUiIntegrationDTPreviewImg");t.addItem(a);this._oImagePlaceholder=t}}return this._oImagePlaceholder};u.prototype._onfocusin=function(e){if(this._oModeToggleButton){if(e.srcControl!==this._oModeToggleButton&&e.relatedTarget!==this._oModeToggleButton.getDomRef()&&e.relatedTarget!==this.getDomRef("after")){this.getDomRef("after").focus()}else{this.getDomRef("before").focus()}}else if(this._oSizeToggleButton){if(e.srcControl!==this._oSizeToggleButton&&e.relatedTarget!==this._oSizeToggleButton.getDomRef()&&e.relatedTarget!==this.getDomRef("after")){this.getDomRef("after").focus()}else{this.getDomRef("before").focus()}}else if(e.srcControl.isA("sap.f.cards.BaseHeader")){this.getDomRef("after").focus()}else{this.getDomRef("before").focus()}};u.prototype._getModes=function(){var e=this.getSettings();e.preview=e.preview||{};e.preview.modes=e.preview.modes||"Abstract";var t=this.getCard().getManifestEntry("/sap.card/type");if(t!=="Component"){e.preview.modes=e.preview.modes.replace("MockData","Live");e.preview.modes=e.preview.modes.replace("Mock","Live")}return e.preview.modes};u.prototype._getCurrentMode=function(){var e=this._getModes();if(!this._currentMode){switch(e){case"Abstract":case"AbstractLive":case"AbstractMock":case"AbstractMockData":this._currentMode="Abstract";break;case"Live":case"LiveAbstract":this._currentMode="Live";break;case"Mock":case"MockAbstract":case"MockData":case"MockDataAbstract":this._currentMode="MockData";break;default:this._currentMode="None"}}return this._currentMode};u.prototype._toggleCurrentMode=function(){var e=this._getModes();if(e.indexOf("Abstract")>-1){if(e.indexOf("Live")>-1){this._currentMode=this._getCurrentMode()==="Abstract"?"Live":"Abstract"}else if(e.indexOf("Mock")>-1||e.indexOf("MockData")>-1){this._currentMode=this._getCurrentMode()==="Abstract"?"MockData":"Abstract"}}};u.prototype._getModeToggleButton=function(){var e=a.getLibraryResourceBundle("sap.ui.integration");if(!this._oModeToggleButton){this._oModeToggleButton=new r;this._oModeToggleButton.setTooltip();this._oModeToggleButton.attachPress(function(){this._toggleCurrentMode();this.update()}.bind(this))}this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButton");this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonSpec");this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonFull");this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonFullSpec");this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFull");this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFullSpec");var t=a.getConfiguration().getLanguage().replaceAll("_","-");if(this._getCurrentSize()==="Full"){var i=this.getSettings().preview.position;if(t.startsWith("ar")||t.startsWith("he")){if(i==="top"||i==="bottom"||i==="separate"){this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFullSpec")}else{this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonFullSpec")}}else if(i==="top"||i==="bottom"||i==="separate"){this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFull")}else{this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonFull")}}else if(t.startsWith("ar")||t.startsWith("he")){this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonSpec")}else{this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButton")}var o=this._oModeToggleButton,s=this._getCurrentMode();if(s==="None"){o.setVisible(false)}if(s==="Abstract"){o.setIcon("sap-icon://media-play");o.setPressed(false);if(this._getModes().indexOf("Mock")>-1||this._getModes().indexOf("MockData")>-1){o.setTooltip(e.getText("CARDEDITOR_PREVIEW_BTN_MOCKDATAPREVIEW"))}else{o.setTooltip(e.getText("CARDEDITOR_PREVIEW_BTN_LIVEPREVIEW"))}}else if(s==="Live"||s==="MockData"){o.setIcon("sap-icon://media-pause");o.setPressed(true);o.setTooltip(e.getText("CARDEDITOR_PREVIEW_BTN_SAMPLEPREVIEW"))}return this._oModeToggleButton};u.prototype._getCurrentSize=function(){this._currentSize=this._currentSize||"Normal";var e=this.getSettings();if(e.preview.position&&(e.preview.position==="top"||e.preview.position==="bottom"||e.preview.position==="separate")){this._currentSize="Full"}return this._currentSize};u.prototype._toggleCurrentSize=function(){this._currentSize=this._currentSize!=="Normal"?"Normal":"Full";if(this._currentSize==="Normal"){this.getEditor().setWidth(this.getParentWidth());document.body.style.removeProperty("--sapUiIntegrationEditorPreviewWidth");document.body.style.removeProperty("--sapUiIntegrationEditorPreviewHeight")}else{this.getEditor().setWidth("0");document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth",this.getParentWidth());document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight",this.getParentHeight())}};u.prototype._getResizeToggleButton=function(){var e=a.getLibraryResourceBundle("sap.ui.integration");if(!this._oSizeToggleButton){this._oSizeToggleButton=new r;this._oSizeToggleButton.setTooltip();this._oSizeToggleButton.attachPress(function(){this._toggleCurrentSize();this.update();this.getDomRef("before").focus()}.bind(this))}this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButton");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonSpec");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonFull");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonFullSpec");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnly");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlySpec");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFull");this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFullSpec");var t=a.getConfiguration().getLanguage().replaceAll("_","-");if(this._getModes()==="Mock"||this._getModes()==="MockData"||this._getModes()==="Live"){if(this._getCurrentSize()==="Full"){if(t.startsWith("ar")||t.startsWith("he")){this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFullSpec")}else{this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFull")}}else if(t.startsWith("ar")||t.startsWith("he")){this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlySpec")}else{this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnly")}}else{if(this._getCurrentSize()==="Full"){if(t.startsWith("ar")||t.startsWith("he")){this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonFullSpec")}else{this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonFull")}}else if(t.startsWith("ar")||t.startsWith("he")){this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonSpec")}else{this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButton")}}var i=this._oSizeToggleButton,o=this._getCurrentMode(),s=this._getCurrentSize();if(o==="None"){i.setVisible(false)}if(s==="Normal"){i.setIcon("sap-icon://full-screen");i.setPressed(false);i.setTooltip(e.getText("CARDEDITOR_PREVIEW_BTN_FULLSIZE"))}else if(s==="Full"){i.setIcon("sap-icon://exit-full-screen");i.setPressed(true);i.setTooltip(e.getText("CARDEDITOR_PREVIEW_BTN_NORMALSIZE"))}return this._oSizeToggleButton};u.prototype.update=function(){this.invalidate()};function h(e){e=e||window.getComputedStyle(document.body).backgroundColor;var t=/rgb\((\d+).*?(\d+).*?(\d+)\)/.exec(e);if(!t){return false}var i=parseInt(t[1]),o=parseInt(t[2]),r=parseInt(t[3]),s=(i*299+o*587+r*114)/1e3;return s<=128}u.init=function(){var e=sap.ui.require.toUrl("sap.ui.integration.designtime.editor.css.CardPreview".replace(/\./g,"/")+".css");n(e);this.init=function(){}};u.init();return u});