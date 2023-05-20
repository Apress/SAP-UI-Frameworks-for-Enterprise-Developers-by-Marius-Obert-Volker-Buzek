/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/Control","sap/m/Text","sap/m/Toolbar","sap/m/Link","sap/m/TextArea","sap/m/Popover","sap/m/ToolbarSpacer","sap/m/Avatar","sap/m/Button","sap/ui/Device","sap/suite/ui/commons/util/ManagedObjectRegister","sap/suite/ui/commons/util/DateUtils","sap/ui/core/Icon","sap/m/library","sap/ui/core/format/DateFormat","sap/ui/base/Object","sap/ui/dom/containsOrEquals","sap/base/security/encodeXML","./TimelineItemRenderer","sap/ui/events/KeyCodes"],function(e,t,i,s,r,o,n,a,l,p,u,c,h,g,d,f,m,_,y,T,x){"use strict";var C=d.PlacementType;var I=d.ToolbarDesign;var v=d.AvatarShape;var b=d.AvatarSize;var S=t.extend("sap.suite.ui.commons.TimelineItem",{metadata:{library:"sap.suite.ui.commons",properties:{dateTime:{type:"any",group:"Misc",defaultValue:null},filterValue:{type:"string",group:"Misc",defaultValue:null},icon:{type:"string",group:"Misc",defaultValue:null},iconDisplayShape:{type:"sap.m.AvatarShape",defaultValue:v.Circle},iconInitials:{type:"string",defaultValue:""},iconSize:{type:"sap.m.AvatarSize",defaultValue:b.XS},iconTooltip:{type:"string",group:"Misc",defaultValue:null},useIconTooltip:{type:"boolean",group:"Accessibility",defaultValue:true},maxCharacters:{type:"int",group:"Behavior",defaultValue:null},replyCount:{type:"int",group:"Misc",defaultValue:null},status:{type:"string",group:"Misc",defaultValue:null},title:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null},userName:{type:"string",group:"Misc",defaultValue:null},userNameClickable:{type:"boolean",group:"Misc",defaultValue:false},userPicture:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null}},defaultAggregation:"embeddedControl",aggregations:{customAction:{type:"sap.ui.core.CustomData",multiple:true,singularName:"customAction"},customReply:{type:"sap.ui.core.Control",multiple:false},embeddedControl:{type:"sap.ui.core.Control",multiple:false},replyList:{type:"sap.m.List",multiple:false},suggestionItems:{type:"sap.m.StandardListItem",multiple:true,singularName:"suggestionItem",deprecated:true}},events:{userNameClicked:{parameters:{uiElement:{type:"sap.ui.core.Control"}}},select:{},press:{},replyPost:{parameters:{value:{type:"string"}}},replyListOpen:{},customActionClicked:{parameters:{value:{type:"string"},key:{type:"string"},linkObj:{type:"sap.m.Link"}}},suggest:{deprecated:true,parameters:{suggestValue:{type:"string"}}},suggestionItemSelected:{deprecated:true,parameters:{selectedItem:{type:"sap.ui.core.Item"}}}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}}}});var L=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons"),E={Warning:"sapSuiteUiCommonsTimelineStatusWarning",Error:"sapSuiteUiCommonsTimelineStatusError",Success:"sapSuiteUiCommonsTimelineStatusSuccess",Information:"sapSuiteUiCommonsTimelineStatusInformation"};S.prototype.init=function(){this._customReply=false;this._objects=new c;this._nMaxCharactersMobile=500;this._nMaxCharactersDesktop=800;this._sTextShowMore=L.getText("TIMELINE_TEXT_SHOW_MORE");this._registerControls();this._registerPopup();this._orientation="V"};S.prototype.setCustomMessage=function(e){this._objects.getInfoText().setText(e);this._objects.getInfoBar().setVisible(e&&e.length>0);this.invalidate()};S.prototype.setDateTime=function(e){var t="";var i=RegExp(/^(?:[0-9]{4}-[0-9]{2}-[0-9]{2})?(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2})(?:[.][0-9]{1,12})?[Z]/);var s=RegExp(/^(?:[0-9]{4}-[0-9]{2}-[0-9]{2})?(?:[ T][0-9]{2}:[0-9]{2}:[0-9]{2})/);if(i.test(e)){if(e.indexOf(".")>0&&e.split(".")[1]){var r=e.split(".")[1].length-1;for(var o=0;o<r;o++){t=t+"S"}var n="yyyy-MM-dd'T'HH:mm:ss."+t+"X";var a=f.getDateTimeInstance({pattern:n});var l=a.parse(e);if(l instanceof Date){e=l}}else{e=e?h.parseDate(e):e}}else if(s.test(e)){e=e?h.parseDate(e):e}this.setProperty("dateTime",e);return this};S.prototype.applyFocusInfo=function(){this.focus();this.getParent()._moveScrollBar(true)};S.prototype.getFocusDomRef=function(){return this.$("outline")[0]};S.prototype._replyPost=function(){var e=this._objects.getReplyInputArea().getValue();this.fireReplyPost({value:e})};S.prototype._registerPopup=function(){var e=this;this._objects.register("fullText",function(){var t=new i(e.getId()+"-fullText",{text:e.getText()});t.addStyleClass("sapSuiteUiCommonsTimelineItemPopoverText");return t});this._objects.register("fullTextPopover",function(){var t=new n({placement:C.Bottom,showArrow:false,showHeader:false,contentMinWidth:"300px",contentWidth:"450px",resizable:true,content:[e._objects.getFullText()]});t.addStyleClass("sapSuiteUiCommonsTimelineItemShowMorePopover");return t})};S.prototype._openReplyDialog=function(){if(this._customReply){this.getCustomReply().openBy(this._objects.getReplyLink());this.fireReplyListOpen()}else{this.fireReplyListOpen();this._objects.getReplyInputArea().setValue("");this._oldReplyInputArea="";this._list=this.getReplyList();if(this._list!==null){this.setAggregation("replyList",null,true);this._objects.getReplyPop().addContent(this._list)}this._objects.getReplyPop().addContent(this._objects.getReplyInputArea());this._objects.getReplyPop().openBy(this._objects.getReplyLink())}};S.prototype._callParentFn=function(){var e=Array.prototype.slice.call(arguments),t=e.shift(),i=this.getParent();if(i&&typeof i[t]==="function"){return i[t].apply(i,e)}};S.prototype._getCorrectGroupIcon=function(){var e="",t=function(){return this.getParent()&&this.getParent()._renderDblSided}.bind(this),i=this._isGroupCollapsed();if(this._orientation==="H"){e="sap-icon://navigation-right-arrow";if(!i){e=this._callParentFn("_isLeftAlignment")||t()?"sap-icon://navigation-down-arrow":"sap-icon://navigation-up-arrow"}}else{e="sap-icon://navigation-down-arrow";if(i){e=this._callParentFn("_isLeftAlignment")||t()?"sap-icon://navigation-right-arrow":"sap-icon://navigation-left-arrow"}}return e};S.prototype.onclick=function(e){var t=this;var i=e.srcControl;if(_(this.$("outline").get(0),e.target)){if(this._isGroupHeader){t._performExpandCollapse(t._groupID)}}if(i&&(i instanceof g||i.getId().indexOf("userNameLink")>-1)||i instanceof sap.m.Avatar){return}if(i instanceof r){this.firePress()}else{this.fireSelect()}};S.prototype.onkeydown=function(e){if(e.which===x.ENTER||e.which===x.SPACE){if(e.srcControl.getId().indexOf("userNameLink")>-1){return}else if(e.srcControl instanceof r){this.firePress()}else{this.fireSelect()}}};S.prototype._performExpandCollapse=function(e){var t=false,i=this._isGroupCollapsed(e);var s=function(e,t){var i=e.find(".sapSuiteUiCommonsTimelineItemBarV"),s,r;if(t.get(0)){s=t.attr("groupId");r=!this._isGroupCollapsed(s);if(r){i.addClass("sapSuiteUiCommonsTimelineGroupNextExpanded")}else{i.removeClass("sapSuiteUiCommonsTimelineGroupNextExpanded")}}}.bind(this),r=function(){var e,i,s;if(!t){e=this._objects.getGroupCollapseIcon&&this._objects.getGroupCollapseIcon();i=this.$();s=this._isGroupCollapsed();if(!s){i.removeClass("sapSuiteUiCommonsTimelineGroupCollapsed");i.addClass("sapSuiteUiCommonsTimelineGroupExpanded")}else{i.addClass("sapSuiteUiCommonsTimelineGroupCollapsed");i.removeClass("sapSuiteUiCommonsTimelineGroupExpanded")}e.setSrc(this._getCorrectGroupIcon());t=true}}.bind(this),o=function(){if(this.getParent()){this.getParent()._collapsedGroups[e]=!i}}.bind(this),n=this.$(),a=this,l=n.parent(),p,u,c,h,g,d;o();if(this._orientation==="H"){p=this.$("line")}else{p=n.find(".sapSuiteUiCommonsTimelineGroupHeaderBarWrapper");u=l.next().children("li").first();c=l.prev().children(":visible:last");if(c.get(0)){s(c,n)}if(i){h=l.children().last();s(h,u)}else{s(n,u)}}if(i){p.hide()}else{p.show()}d=n.find(".sapSuiteUiCommonsTimelineGroupHeaderMainWrapper");d.attr("aria-expanded",!!i);n.attr("aria-expanded",!!i);if(i){d.attr("aria-label",L.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER")+": "+d.prevObject[0].outerText+" "+L.getText("TIMELINE_ACCESSIBILITY_GROUP_EXPAND"),true)}else{d.attr("aria-label",L.getText("TIMELINE_ACCESSIBILITY_GROUP_HEADER")+": "+d.prevObject[0].outerText+" "+L.getText("TIMELINE_ACCESSIBILITY_GROUP_COLLAPSE"),true)}if(this._orientation!=="H"||i){r()}g=this._callParentFn("_performExpandCollapse",e,i,this);if(g){return new Promise(function(e,t){g.then(function(){r();a._callParentFn("_performUiChanges");e()})})}};S.prototype._getStatusColorClass=function(){var e=this.getStatus();return E[e]||""};S.prototype._getLineIcon=function(){var e=this,t;this._objects.register("lineIcon",function(){var i="sap-icon://circle-task",s=e.getText()==="GroupHeader";if(!s){i=e.getIcon()?e.getIcon():"sap-icon://activity-items"}t=new g(e.getId()+"-icon",{src:i,tooltip:e.getIconTooltip(),useIconTooltip:e.getUseIconTooltip()});t.addStyleClass("sapSuiteUiCommonsTimelineBarIcon");return t});return this._objects.getLineIcon()};S.prototype._isGroupCollapsed=function(e){var t=this.getParent();e=e||this._groupID;return t&&t._collapsedGroups&&t._collapsedGroups[e]};S.prototype._getCollapsedText=function(){var e=this.getText().substring(0,this._nMaxCollapsedLength);var t=e.lastIndexOf(" ");if(t>0){this._sShortText=e.substr(0,t)}else{this._sShortText=e}return this._sShortText};S.prototype._toggleTextExpanded=function(t){var i=this,s=t.getSource(),r=s.$(),o=this.$("realtext"),n=r.height(),a=r.position().top,l=o.parent().position().top,p=r.parent().prev(),u,c,h=this.getParent()&&this.getParent()._noAnimation,g=8,d=function(){return i.getParent()&&i.getParent()._renderDblSided},f=function(e,t,s){p.css("-webkit-line-clamp",s+"px");if(d()||h){p.css("height",e+"px");i._callParentFn("_performUiChanges")}else{p.animate({height:t},250,i._callParentFn("_performUiChanges"))}};if(this._orientation==="V"){c=this.$("threeDots");u=p.children().first();if(!this._expanded){this._textProperties={height:p.css("height"),clamp:p.css("-webkit-line-clamp"),text:u.html()};p.attr("expanded",true);c.hide();u.html(this._encodeHTMLAndLineBreak(this.getText()));var m=L.getText("TIMELINE_TEXT_SHOW_LESS");s.setText(m);s.rerender();f("",u.height(),"")}else{p.attr("expanded",false);s.setText(this._sTextShowMore);s.rerender();c.show();u.html(this._textProperties.text);f(this._textProperties.height,this._textProperties.height,this._textProperties.clamp)}i._expanded=!i._expanded}else{var _=l-a-n-g,y=e(window).height()-r.offset().top,T=200;if(y<T){_-=T-y}this._objects.getFullText().setText(this.getText());this._objects.getFullTextPopover().setOffsetY(Math.floor(_));this._objects.getFullTextPopover().openBy(this._objects.getExpandButton())}};S.prototype._getButtonExpandCollapse=function(){var e=this;this._objects.register("expandButton",function(){return new r(e.getId()+"-fullTextBtn",{text:e._sTextShowMore,press:e._toggleTextExpanded.bind(e)})});return this._objects.getExpandButton()};S.prototype._checkTextIsExpandable=function(){this._nMaxCollapsedLength=this.getMaxCharacters();if(this._nMaxCollapsedLength===0){this._nMaxCollapsedLength=u.system.phone?this._nMaxCharactersMobile:this._nMaxCharactersDesktop}return this.getText().length>this._nMaxCollapsedLength};S.prototype.onBeforeRendering=function(){var e=this;if(!this._list){this._list=this.getReplyList()}if(this.getReplyCount()>0){this._objects.getReplyLink().setText(L.getText("TIMELINE_REPLY")+" ("+this.getReplyCount()+")")}else if(this._list&&this._list.getItems().length>0){this._objects.getReplyLink().setText(L.getText("TIMELINE_REPLY")+" ("+this._list.getItems().length+")")}this._objects.getSocialBar().removeAllContent();if(this._callParentFn("getEnableSocial")){this._objects.getSocialBar().addContent(this._objects.getReplyLink())}this._actionList=this.getCustomAction();function t(t,i){e.fireCustomActionClicked({value:i.value,key:i.key,linkObj:this})}for(var i=0;i<this._actionList.length;i++){var s=this._actionList[i].getKey();var o=this._actionList[i].getValue();var n=new r({text:o});n.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");n.attachPress({value:o,key:s},t);this._objects.getSocialBar().addContent(n)}};S.prototype._encodeHTMLAndLineBreak=function(e){return y(e).replace(/&#xa;/g,"<br>")};S.prototype._getUserPictureControl=function(){var e=this.getId()+"-userPictureControl",t=this.getUserPicture(),i=this.getIconInitials(),s=this.getIconDisplayShape(),r=this.getIconSize();if(!t){return null}this._objects.register("userPictureControl",function(){var o=new l({id:e,src:t,initials:i,displayShape:s,displaySize:r,tooltip:L.getText("TIMELINE_USER_PICTURE")});return o});return this._objects.getUserPictureControl()};S.prototype._getUserNameLinkControl=function(){var e=this;if(this.getUserNameClickable()){this._objects.register("userNameLink",function(){var t=new r(e.getId()+"-userNameLink",{text:e.getUserName(),press:function(t){e.fireUserNameClicked({uiElement:this})}});t.addStyleClass("sapUiSelectable");return t});return this._objects.getUserNameLink()}};S.prototype.onAfterRendering=function(){this._expanded=false;this._callParentFn("_itemRendered")};S.prototype._registerControls=function(){var e=this;this._objects.register("infoText",new i(this.getId()+"-infoText",{maxLines:1,width:"100%"}));this._objects.register("infoBar",new s(this.getId()+"-infoBar",{id:this.getId()+"-customMessageInfoBar",content:[this._objects.getInfoText()],design:I.Info,visible:false}));this._objects.register("replyLink",function(){var t=new r(e.getId()+"-replyLink",{text:L.getText("TIMELINE_REPLY"),press:[e._openReplyDialog,e]});t.addStyleClass("sapSuiteUiCommonsTimelineItemActionLink");return t});this._objects.register("socialBar",function(){var t=new s(e.getId()+"-socialBar",{});t.data("sap-ui-fastnavgroup",null);return t});this._objects.register("replyInputArea",new o(this.getId()+"-replyInputArea",{height:"4rem",width:"100%"}));this._objects.register("replyPop",function(){return new n(e.getId()+"-replyPop",{initialFocus:e._objects.getReplyInputArea(),title:L.getText("TIMELINE_REPLIES"),placement:C.Vertical,footer:new s({content:[new a,new p(e.getId()+"-replyButton",{text:L.getText("TIMELINE_REPLY"),press:function(){e._replyPost();e._objects.getReplyPop().close()}})]}),contentHeight:"15rem",contentWidth:"20rem"})})};S.prototype.exit=function(){this._objects.destroyAll()};S.prototype.getDateTimeWithoutStringParse=function(){var e=this.getProperty("dateTime");return h.parseDate(e,false)||""};S.prototype.setCustomReply=function(e){if(e){this._customReply=true;this.setAggregation("customReply",e,true)}else{this._customReply=false}return this};S.prototype.setReplyList=function(t){if(t===null){return this}this.setAggregation("replyList",t,true);var i=this;this.getReplyList().attachUpdateFinished(function(t){var s=i._objects.getReplyInputArea().getDomRef("inner");if(s){e(s.id).focus()}});return this};S.prototype.getDateTime=function(){var e=this.getProperty("dateTime");e=h.parseDate(e);if(typeof e==="string"&&this instanceof sap.suite.ui.commons.TimelineItem&&this.getBinding("dateTime")){var t=this.getBinding("dateTime").getValue();if(t instanceof Date){return t}else{return h.parseDate(t)}}else{return e}};S.prototype.onkeyup=function(e){if(e.which==x.ENTER||e.which==x.SPACE){if(_(this.$("outline").get(0),e.target)){if(this._isGroupHeader){this._performExpandCollapse(this._groupID)}}}};return S});