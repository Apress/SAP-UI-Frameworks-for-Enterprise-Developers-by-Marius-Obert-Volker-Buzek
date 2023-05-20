/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/IconPool","./AvatarRenderer","sap/ui/events/KeyCodes","sap/base/Log","sap/ui/core/Icon","./library","sap/ui/core/library","sap/ui/core/InvisibleText"],function(e,t,i,a,s,o,r,n,l){"use strict";var p=r.AvatarType;var c=r.AvatarImageFitType;var u=r.AvatarColor;var h=r.AvatarSize;var d=r.AvatarShape;var g=n.aria.HasPopup;var f=Object.keys(u).filter(function(e){return e.indexOf("Accent")!==-1});var I=e.extend("sap.m.Avatar",{metadata:{library:"sap.m",properties:{src:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},initials:{type:"string",group:"Data",defaultValue:null},displayShape:{type:"sap.m.AvatarShape",group:"Appearance",defaultValue:d.Circle},displaySize:{type:"sap.m.AvatarSize",group:"Appearance",defaultValue:h.S},customDisplaySize:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"3rem"},customFontSize:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"1.125rem"},imageFitType:{type:"sap.m.AvatarImageFitType",group:"Appearance",defaultValue:c.Cover},fallbackIcon:{type:"string",group:"Data",defaultValue:null},backgroundColor:{type:"sap.m.AvatarColor",group:"Appearance",defaultValue:u.Accent6},showBorder:{type:"boolean",group:"Appearance",defaultValue:false},badgeIcon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:""},badgeTooltip:{type:"string",group:"Data",defaultValue:null},decorative:{type:"boolean",group:"Accessibility",defaultValue:false},ariaHasPopup:{type:"sap.ui.core.aria.HasPopup",group:"Accessibility",defaultValue:g.None}},aggregations:{detailBox:{type:"sap.m.LightBox",multiple:false,bindable:"bindable"},_badge:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"},_icon:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{press:{}},dnd:{draggable:true,droppable:false},designtime:"sap/m/designtime/Avatar.designtime"},renderer:i});I.DEFAULT_CIRCLE_PLACEHOLDER="sap-icon://person-placeholder";I.DEFAULT_SQUARE_PLACEHOLDER="sap-icon://product";I.AVATAR_BADGE_TOOLTIP={"sap-icon://zoom-in":sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP_ZOOMIN"),"sap-icon://camera":sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP_CAMERA"),"sap-icon://edit":sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP_EDIT")};I.prototype.init=function(){this._sActualType=null;this._bIsDefaultIcon=true;this._sImageFallbackType=null;this._sPickedRandomColor=null;this._badgeRef=null};I.prototype.onAfterRendering=function(){this._checkInitialsHolderWidth()};I.prototype.onThemeChanged=function(){this._checkInitialsHolderWidth()};I.prototype.exit=function(){if(this._fnLightBoxOpen){this._fnLightBoxOpen=null}if(this._badgeRef){this._badgeRef.destroy()}if(this._oInvisibleText){this._oInvisibleText.destroy();this._oInvisibleText=null}this._sPickedRandomColor=null};I.prototype.setDetailBox=function(e){var t=this.getDetailBox();if(e){if(e===t){return this}if(t){this.detachPress(this._fnLightBoxOpen,t)}this._fnLightBoxOpen=e.open;this.attachPress(this._fnLightBoxOpen,e)}else if(this._fnLightBoxOpen){this.detachPress(this._fnLightBoxOpen,t);this._fnLightBoxOpen=null}return this.setAggregation("detailBox",e)};I.prototype.clone=function(){var t=e.prototype.clone.apply(this,arguments),i=t.getDetailBox();if(i){t.detachPress(this._fnLightBoxOpen,this.getDetailBox());t._fnLightBoxOpen=i.open;t.attachPress(t._fnLightBoxOpen,i)}return t};I.prototype.attachPress=function(){Array.prototype.unshift.apply(arguments,["press"]);e.prototype.attachEvent.apply(this,arguments);if(this.hasListeners("press")){this.$().attr("tabindex","0");this.$().attr("role","button")}return this};I.prototype.detachPress=function(){Array.prototype.unshift.apply(arguments,["press"]);e.prototype.detachEvent.apply(this,arguments);if(!this.hasListeners("press")){this.$().removeAttr("tabindex");this.$().attr("role","img")}return this};I.prototype.ontap=function(){this.firePress({})};I.prototype.onkeydown=function(e){if(e.which===a.SHIFT||e.which===a.ESCAPE){this._bShouldInterupt=this._bSpacePressed}if(e.which===a.SPACE){this._bSpacePressed=true;e.preventDefault()}if(e.which===a.ENTER){this.firePress({})}};I.prototype.onkeyup=function(e){if(e.which===a.SPACE){if(!this._bShouldInterupt){this.firePress({})}this._bShouldInterupt=false;this._bSpacePressed=false;e.stopPropagation()}};I.prototype._areInitialsValid=function(e){var t=/^[a-zA-Z\xc0-\xd6\xd8-\xdc\xe0-\xf6\xf8-\xfc]{1,3}$/;if(!t.test(e)){s.warning("Initials should consist of only 1,2 or 3 latin letters",this);this._sActualType=p.Icon;this._bIsDefaultIcon=true;return false}return true};I.prototype._validateSrc=function(e){if(t.isIconURI(e)){this._sActualType=p.Icon;this._bIsDefaultIcon=t.getIconInfo(e)?false:true}else{this._bIsDefaultIcon=true;this._sActualType=p.Image;this.preloadedImage=new window.Image;this.preloadedImage.src=e;this.preloadedImage.onload=this._onImageLoad.bind(this);this.preloadedImage.onerror=this._onImageError.bind(this)}return this};I.prototype._getDisplayIcon=function(e){return t.isIconURI(e)&&t.getIconInfo(e)?t.createControlByURI({src:e}):null};I.prototype._getActualDisplayType=function(){var e=this.getSrc(),t=this.getInitials();if(e){this._validateSrc(e)}else if(t&&this._areInitialsValid(t)){this._sActualType=p.Initials}else{s.warning("No src and initials were provided",this);this._sActualType=p.Icon;this._bIsDefaultIcon=true}return this._sActualType};I.prototype._getImageFallbackType=function(){var e=this.getInitials();this._sImageFallbackType=e&&this._areInitialsValid(e)?p.Initials:p.Icon;return this._sImageFallbackType};I.prototype._getDefaultIconPath=function(e){var i=null,a=this.getFallbackIcon();if(a&&t.isIconURI(a)){i=a}else if(e===d.Circle){i=I.DEFAULT_CIRCLE_PLACEHOLDER}else if(e===d.Square){i=I.DEFAULT_SQUARE_PLACEHOLDER}return i};I.prototype._getIcon=function(){var e=this.getSrc(),i=this.getAggregation("_icon"),a=this.getDisplayShape();if(this._bIsDefaultIcon){e=this._getDefaultIconPath(a)}if(!i){i=t.createControlByURI({alt:"Image placeholder",src:e});this.setAggregation("_icon",i)}else if(i.getSrc()!==e){i.setSrc(e)}return i};I.prototype._getDefaultTooltip=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("AVATAR_TOOLTIP")};I.prototype._getBadgeIconSource=function(){var e;if(this.getDetailBox()){e="sap-icon://zoom-in"}else if(this.getBadgeIcon()!==""){if(this._getDisplayIcon(this.getBadgeIcon())){e=this.getBadgeIcon()}else{s.warning("No valid Icon URI source for badge affordance was provided")}}return e};I.prototype._getBadgeTooltip=function(){var e=this._getDefaultTooltip(),t=this.getBadgeIcon();if(this.getBadgeTooltip()){e=this.getBadgeTooltip()}else if(t&&I.AVATAR_BADGE_TOOLTIP[this.getBadgeIcon()]){e=I.AVATAR_BADGE_TOOLTIP[t]}return e};I.prototype._getBadge=function(){var e=this._getBadgeIconSource(),t=this._getBadgeTooltip();if(!e){return}if(!this._badgeRef){this.setAggregation("_badge",new o({src:e,tooltip:t}))}this._badgeRef=this.getAggregation("_badge");return this._badgeRef};I.prototype._onImageLoad=function(){delete this.preloadedImage};I.prototype._onImageError=function(){var e=this._getImageFallbackType();this.$().removeClass("sapFAvatarImage").addClass("sapFAvatar"+e);delete this.preloadedImage};I.prototype._getActualBackgroundColor=function(){var e=this.getBackgroundColor();if(e===u.Random){if(this._sPickedRandomColor){return this._sPickedRandomColor}e=this._sPickedRandomColor=u[f[f.length*Math.random()<<0]]}else{this._sPickedRandomColor=null}return e};I.prototype._checkInitialsHolderWidth=function(){var e=this.$(),t=this.getInitials().length;this.$oInitialsHolder=e.children(".sapFAvatarInitialsHolder");if(this.$oInitialsHolder.length!==0&&t===3){var i=e[0].offsetWidth,a=this.$oInitialsHolder[0].offsetWidth;if(a>i){this._wideInitialsIcon()}}};I.prototype._wideInitialsIcon=function(){var e=this.$(),t=e.children(".sapFAvatarHiddenIcon");t.removeClass("sapFAvatarHiddenIcon");this.$oInitialsHolder.css("display","none");e.removeClass("sapFAvatarInitials");e.addClass("sapFAvatarIcon")};I.prototype._getInvisibleText=function(){if(!this._oInvisibleText&&this.sInitials){this._oInvisibleText=new l({id:this.getId()+"-InvisibleText"});this._oInvisibleText.setText(this.sInitials).toStatic()}return this._oInvisibleText};I.prototype._getAriaLabelledBy=function(){var e=this.getAriaLabelledBy(),t;this.sInitials=this.getInitials();if(this.sInitials&&e.length>0){t=this._getInvisibleText().getId();e.push(t)}return e};return I});