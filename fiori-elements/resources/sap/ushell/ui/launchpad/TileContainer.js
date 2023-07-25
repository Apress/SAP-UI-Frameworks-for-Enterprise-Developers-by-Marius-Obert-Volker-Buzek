// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/m/Input","sap/m/library","sap/m/Text","sap/ui/base/ManagedObject","sap/ui/core/Control","sap/ui/core/Core","sap/ui/core/Icon","sap/ushell/override","sap/ushell/library","sap/ushell/resources","sap/ushell/ui/launchpad/PlusTile","sap/ushell/utils","sap/ushell/ui/launchpad/TileContainerRenderer"],function(e,t,i,o,s,r,a,l,n,u,p,d,f,h){"use strict";var g=i.HeaderLevel;var c=r.extend("sap.ushell.ui.launchpad.TileContainer",{metadata:{library:"sap.ushell",properties:{scrollType:{type:"string",group:"Misc",defaultValue:"item"},animationSpeed:{type:"int",group:"Misc",defaultValue:500},groupId:{type:"string",group:"Misc",defaultValue:null},showHeader:{type:"boolean",group:"Misc",defaultValue:true},showPlaceholder:{type:"boolean",group:"Misc",defaultValue:true},defaultGroup:{type:"boolean",group:"Misc",defaultValue:false},isLastGroup:{type:"boolean",group:"Misc",defaultValue:false},headerText:{type:"string",group:"Misc",defaultValue:null},headerLevel:{type:"sap.m.HeaderLevel",group:"Misc",defaultValue:g.H2},groupHeaderLevel:{type:"sap.m.HeaderLevel",group:"Misc",defaultValue:g.H4},showGroupHeader:{type:"boolean",group:"Misc",defaultValue:true},homePageGroupDisplay:{type:"string",defaultValue:null},visible:{type:"boolean",group:"Misc",defaultValue:true},sortable:{type:"boolean",group:"Misc",defaultValue:true},showNoData:{type:"boolean",group:"Misc",defaultValue:false},noDataText:{type:"string",group:"Misc",defaultValue:p.i18n.getText("noFilteredItems")},isGroupLocked:{type:"boolean",group:"Misc",defaultValue:null},isGroupSelected:{type:"boolean",group:"Misc",defaultValue:false},editMode:{type:"boolean",group:"Misc",defaultValue:false},showBackground:{type:"boolean",group:"Misc",defaultValue:false},icon:{type:"string",group:"Misc",defaultValue:"sap-icon://locked"},showIcon:{type:"boolean",group:"Misc",defaultValue:false},deluminate:{type:"boolean",group:"Misc",defaultValue:false},showMobileActions:{type:"boolean",group:"Misc",defaultValue:false},enableHelp:{type:"boolean",group:"Misc",defaultValue:false},tileActionModeActive:{type:"boolean",group:"Misc",defaultValue:false},ieHtml5DnD:{type:"boolean",group:"Misc",defaultValue:false},showEmptyLinksArea:{type:"boolean",group:"Misc",defaultValue:false},showEmptyLinksAreaPlaceHolder:{type:"boolean",group:"Misc",defaultValue:false},hidden:{type:"boolean",group:"Misc",defaultValue:false},transformationError:{type:"boolean",group:"Misc",defaultValue:false},supportLinkPersonalization:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{tiles:{type:"sap.ui.core.Control",multiple:true,singularName:"tile"},links:{type:"sap.ui.core.Control",multiple:true,singularName:"link"},beforeContent:{type:"sap.ui.core.Control",multiple:true,singularName:"beforeContent"},afterContent:{type:"sap.ui.core.Control",multiple:true,singularName:"afterContent"},headerActions:{type:"sap.ui.core.Control",multiple:true,singularName:"headerAction"}},events:{afterRendering:{},add:{},titleChange:{}}},renderer:h});c.prototype.init=function(){this.bIsFirstTitleChange=true;this._sDefaultValue=p.i18n.getText("new_group_name");this.oNoLinksText=new o({text:p.i18n.getText("emptyLinkContainerInEditMode")}).addStyleClass("sapUshellNoLinksAreaPresentTextInner");this.oTransformationErrorText=new o({text:p.i18n.getText("transformationErrorText")}).addStyleClass("sapUshellTransformationErrorText");this.oTransformationErrorIcon=new l({src:"sap-icon://message-error"}).addStyleClass("sapUshellTransformationErrorIcon");this.oIcon=new l({src:this.getIcon()}).addStyleClass("sapUshellContainerIcon");this.oPlusTile=new d({groupId:this.getGroupId(),enableHelp:this.getEnableHelp(),press:[this.fireAdd,this]}).setParent(this);var e=function(){this.getDomRef("groupheader").focus();this._stopEdit();var t=this.oEditInputField.getDomRef();if(t){t.removeEventListener("focusout",e)}}.bind(this);this.oEditInputField=new t({placeholder:this._sDefaultValue,value:this.getHeaderText()}).addEventDelegate({onBeforeRendering:function(){var t=this.oEditInputField.getDomRef();if(t){t.removeEventListener("focusout",e)}}.bind(this),onAfterRendering:function(){var t=this.oEditInputField.$("inner");t.focus();t.selectText(0,t.val().length);var i=this.oEditInputField.getDomRef();if(i){i.addEventListener("focusout",e)}}.bind(this)}).addStyleClass("sapUshellTileContainerTitleInput");if(sap.ushell.Container){sap.ushell.Container.getServiceAsync("LaunchPage").then(function(e){if(e.isLinkPersonalizationSupported()){c.prototype.isLinkPersonalizationOveride()}})}this.fnTitleTextClickHandler=this._titleTextClickHandler.bind(this)};c.prototype.onBeforeRendering=function(){var e=this.getDomRef("titleText");if(e){e.removeEventListener("click",this.fnTitleTextClickHandler)}var t=this.getTiles();var i=this.getLinks();var o=t.concat(i);o.forEach(function(e){var t=e.getDomRef();if(t){var i=t.getAttribute("data-oldTabindex");if(i){t.setAttribute("tabindex",i);t.removeAttribute("data-oldTabindex")}else{t.removeAttribute("tabindex")}}})};c.prototype.onAfterRendering=function(){var e=this.getDomRef("titleText");if(e){e.addEventListener("click",this.fnTitleTextClickHandler)}var t=this.getTiles();var i=this.getLinks();var o=t.concat(i);o.forEach(function(e){var t=e.getDomRef();if(t){var i=t.getAttribute("tabindex");if(i){t.setAttribute("data-oldTabindex",i)}t.setAttribute("tabindex","-1")}});var s=t.filter(function(e){return e.isA("sap.ui.integration.widgets.Card")});this._resizeCards(s);a.getEventBus().publish("launchpad","GroupHeaderVisibility");this.fireAfterRendering()};c.prototype._titleTextClickHandler=function(){var e=this.getModel()&&this.getModel().getProperty("/enableRenameLockedGroup"),t=(e||!this.getIsGroupLocked())&&!this.getDefaultGroup()&&this.getTileActionModeActive();this.setEditMode(t)};c.prototype.updateAggregation=n.updateAggregation;c.prototype.setGroupId=function(e,t){this.setProperty("groupId",e,t);this.oPlusTile.setGroupId(e,t);return this};c.prototype.setShowIcon=function(e,t){this.setProperty("showIcon",e,t);this.oIcon.toggleStyleClass("sapUshellContainerIconHidden",!e);return this};c.prototype.groupHasTiles=function(){var e="",t=this.getTiles(),i=[];if(this.getBindingContext()){e=this.getBindingContext().sPath;t=this.getModel().getProperty(e).tiles}return f.groupHasVisibleTiles(t,i)};c.prototype.getInnerContainersDomRefs=function(){var e=this.getDomRef();if(!e){return null}return[e.querySelector(".sapUshellTilesContainer-sortable"),e.querySelector(".sapUshellLineModeContainer")]};c.prototype.isLinkPersonalizationOveride=function(){c.prototype.updateLinks=function(e){var t=this.getParent(),i=t&&t.getDisplayMode&&t.getDisplayMode()==="tabs";if(i&&!this.getTileActionModeActive()){t.removeLinksFromUnselectedGroups()}if(this.getLinks().length>0){this.removeAllLinks()}s.prototype.updateAggregation.call(this,"links")};c.prototype.destroyLinks=function(t){e.debug("link is destroyed because: "+t,null,"sap.ushell.ui.launchpad.TileContainer")}};c.prototype._resizeCards=function(e){var t,i,o=5.5,s=.4375,r,a,l,n;for(var u=0;u<e.length;u++){t=e[u];i=t.getManifest();r=i["sap.flp"].rows;a=i["sap.flp"].columns;l=a*o+(a-3)*s+"rem";n=r*o+(r-1)*s+"rem";t.setHeight(n);t.setWidth(l)}};c.prototype.setEditMode=function(e,t){this.setProperty("editMode",e,t);if(e){this.oEditInputField.setValue(this.getHeaderText())}var i=this.getModel();if(i){i.setProperty("/editTitle",e)}};c.prototype._stopEdit=function(){var e=this.getHeaderText();var t=this.oEditInputField.getValue(),i;t=t.substring(0,256).trim()||this._sDefaultValue;i=t!==e;if(this.bIsFirstTitleChange&&t===this.oEditInputField.getPlaceholder()){i=true}this.bIsFirstTitleChange=false;if(this.getModel()&&this.getModel().getProperty("/editTitle")){this.getModel().setProperty("/editTitle",false,false)}if(i){this.fireTitleChange({newTitle:t});this.setHeaderText(t)}this.setEditMode(false)};c.prototype.exit=function(){if(this.oNoLinksText){this.oNoLinksText.destroy()}if(this.oTransformationErrorText){this.oTransformationErrorText.destroy()}if(this.oTransformationErrorIcon){this.oTransformationErrorIcon.destroy()}if(this.oIcon){this.oIcon.destroy()}if(this.oPlusTile){this.oPlusTile.destroy()}if(this.oEditInputField){this.oEditInputField.destroy()}var e=this.getDomRef("titleText");if(e){e.removeEventListener("click",this.fnTitleTextClickHandler)}if(r.prototype.exit){r.prototype.exit.apply(this,arguments)}};return c});