/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/Log","./library","sap/ui/core/Control","sap/ui/core/Popup","./MessageToast","./MessageList","./MessageBarRenderer","sap/ui/core/Configuration","sap/ui/dom/jquery/rect"],function(t,s,e,i,o,r,a,n,h){"use strict";var l=e.MessageType;var u=i.extend("sap.ui.commons.MessageBar",{metadata:{deprecated:true,library:"sap.ui.commons",properties:{anchorID:{type:"string",group:"Appearance",defaultValue:""},visible:{type:"boolean",group:"Behavior",defaultValue:true},maxToasted:{type:"int",group:"Misc",defaultValue:3},maxListed:{type:"int",group:"Misc",defaultValue:7},anchorSnapPoint:{type:"string",group:"Misc",defaultValue:"begin top"}}}});u.prototype.init=function(){this.aErrors=[];this.aWarnings=[];this.aSuccesses=[];this.aToasts=[];this.maxToastsReached=false;this.oPopup=new o(this,false,true,false);this.oList=null;var t=this.getId();this.oToast=new r(t+"__Toast",{anchorId:t+"__sums"});var s=this;this.oToast.attachNext(function(){s.checkForToast()});this.snapPoint=null;this.oHomePosition=null;this.oDropPosition=null;this.bToggleListBackAfterDrag=null};u.prototype.exit=function(){this.onmouseup();this.close();this.oPopup.destroy();this.oPopup=null;this.oToast.destroy();this.oToast=null;if(this.oList){this.oList.destroy();this.oList=null}};u.prototype.ondragstart=function(t){t.preventDefault();t.stopPropagation()};u.prototype.onmousedown=function(s){var e=s.target;var i=t(e);if(i.css("cursor")!="move"){return}this.sDragMode="move";this.oMsgBarDragStartPosition=this.$().rect();this.oMsgBarDragStartPosition.right=Number(this.$().css("right").replace("px",""));if(!this.oHomePosition){this.oHomePosition=this.oMsgBarDragStartPosition}this.mouseDragStartPositionX=s.screenX;this.mouseDragStartPositionY=s.screenY;var o=t(window.document);o.on("mousemove",t.proxy(this.handleMove,this));if(window.parent){t(window.parent.document).on("mousemove",t.proxy(this.handleMove,this),true)}o.on("selectstart",t.proxy(this.ondragstart,this),true)};u.prototype.handleMove=function(t){if(!this.sDragMode){return}if(this.bToggleListBackAfterDrag==null&&this.oList){this.bToggleListBackAfterDrag=this.oList.getVisible();if(this.bToggleListBackAfterDrag){this.toggleList()}}t=t||window.event;var s=this.oMsgBarDragStartPosition.top+t.screenY-this.mouseDragStartPositionY;var e=this.oMsgBarDragStartPosition.left+t.screenX-this.mouseDragStartPositionX;var i=this.oMsgBarDragStartPosition.right-t.screenX+this.mouseDragStartPositionX;this.oPopup._$().css("top",s);if(this.snapPoint.indexOf("right")!=-1){this.oPopup._$().css("right",i)}else{this.oPopup._$().css("left",e)}this.oDropPosition={top:s,left:e,right:i};t.cancelBubble=true;return false};u.prototype.onmouseup=function(s){if(!this.sDragMode){return}if(this.oDropPosition){this.addStyleClass("sapUiMsgBarMoved")}if(this.bToggleListBackAfterDrag){this.toggleList()}this.bToggleListBackAfterDrag=null;var e=t(window.document);e.off("mousemove",t.proxy(this.handleMove,this));if(window.parent){t(window.parent.document).off("mousemove",t.proxy(this.handleMove,this))}e.off("selectstart",t.proxy(this.ondragstart,this));this.sDragMode=null;this.checkForToast()};u.prototype.onclick=function(e){var i=e.target;var o=t(i);if(o.css("cursor")!="pointer"){return}if(o.hasClass("sapUiMsgBarToggle")){this.toggleList()}else if(o.hasClass("sapUiMsgBarHome")){this.backHome()}else{s.debug("Warning: MessageBar unsupported click on "+o.attr("className"))}};u.prototype.checkForToast=function(){if(this.maxToastsReached){return}if(this.aToasts==null||this.aToasts.length==0){return}var t=this.getMaxToasted();if(t==0){return}if(this.sDragMode){return}var s=null;var e="";if(this.aToasts.length>this.getMaxToasted()){this.aToasts=[];this.maxToastsReached=true;e=this.getId()+"__arrowImg"}else{if(!this.oToast.isIdle()){return}s=this.aToasts.splice(0,1)[0];e=this.getId()+"__"+s.getType()+"Img"}this.oToast.toast(s,e)};u.prototype.addToasts=function(t){for(var s=0,e=t.length;s<e;s++){var i=t[s];var o=false;for(var r=this.aToasts.length;r>=0;r--){if(i==this.aToasts[r]){o=true;break}}if(!o){this.aToasts.push(i)}}};u.prototype.deleteToast=function(t){if(!this.aToasts){return}for(var s=0,e=this.aToasts.length;s<e;s++){if(this.aToasts[s].getId()==t){this.aToasts.splice(s,1);return}}};u.prototype.deleteOneMessage=function(t){if(!t){return}for(var s=0,e=this.aErrors.length;s<e;s++){if(this.aErrors[s].getId()==t){this.aErrors[s].closeDetails();this.aErrors.splice(s,1);return}}for(var s=0,e=this.aWarnings.length;s<e;s++){if(this.aWarnings[s].getId()==t){this.aWarnings[s].closeDetails();this.aWarnings.splice(s,1);return}}for(var s=0,e=this.aSuccesses.length;s<e;s++){if(this.aSuccesses[s].getId()==t){this.aSuccesses[s].closeDetails();this.aSuccesses.splice(s,1);return}}};u.prototype.getSnapPoint=function(){if(!this.snapPoint){this.snapPoint=this.getAnchorSnapPoint();if(h.getRTL()){this.snapPoint=this.snapPoint.replace("begin","right").replace("end","left")}else{this.snapPoint=this.snapPoint.replace("begin","left").replace("end","right")}}return this.snapPoint};u.prototype.open=function(){var t=0;var s=this.getSnapPoint();var e=null;var i=this.getAnchorID();if(i){e=document.getElementById(i)}if(!e){e=document.body}this.oPopup.open(t,s,s,e,"0 0");if(this.oDropPosition){this.oPopup._$().css("top",this.oDropPosition.top);if(s.indexOf("right")!=-1){this.oPopup._$().css("right",this.oDropPosition.right)}else{this.oPopup._$().css("left",this.oDropPosition.left)}}if(this.hasStyleClass("sapUiMsgBarOpen")){this.oList.setVisible(true)}};u.prototype.close=function(){if(this.oList&&this.oList.getVisible()){this.oList.setVisible(false)}var t=0;this.oPopup.close(t);this.maxToastsReached=false};u.prototype.updateCountersAndVisibility=function(){if(!this.getProperty("visible")){return}var s=this.getId();var e=document.getElementById(s+"__ErrorCount");if(!e){this.open();e=document.getElementById(s+"__ErrorCount")}var i=this.aErrors.length;var o=e.innerHTML;var r="("+i+")";var a=null;var n=null;if(r!=o){e.innerHTML=r;if(r=="(0)"){a=t(document.getElementById(s+"__ErrorImg"));n=t(document.getElementById(s+"__ErrorCount"));a.addClass("sapUiMsgBarZeroCount");n.addClass("sapUiMsgBarZeroCount")}else if(o=="(0)"){a=t(document.getElementById(s+"__ErrorImg"));n=t(document.getElementById(s+"__ErrorCount"));a.removeClass("sapUiMsgBarZeroCount");n.removeClass("sapUiMsgBarZeroCount")}}e=document.getElementById(s+"__WarningCount");i=this.aWarnings.length;o=e.innerHTML;r="("+i+")";a=null;n=null;if(r!=o){e.innerHTML=r;if(r=="(0)"){a=t(document.getElementById(s+"__WarningImg"));n=t(document.getElementById(s+"__WarningCount"));a.addClass("sapUiMsgBarZeroCount");n.addClass("sapUiMsgBarZeroCount")}else if(o=="(0)"){a=t(document.getElementById(s+"__WarningImg"));n=t(document.getElementById(s+"__WarningCount"));a.removeClass("sapUiMsgBarZeroCount");n.removeClass("sapUiMsgBarZeroCount")}}e=document.getElementById(s+"__SuccessCount");i=this.aSuccesses.length;o=e.innerHTML;r="("+i+")";a=null;n=null;if(r!=o){e.innerHTML=r;if(r=="(0)"){a=t(document.getElementById(s+"__SuccessImg"));n=t(document.getElementById(s+"__SuccessCount"));a.addClass("sapUiMsgBarZeroCount");n.addClass("sapUiMsgBarZeroCount")}else if(o=="(0)"){a=t(document.getElementById(s+"__SuccessImg"));n=t(document.getElementById(s+"__SuccessCount"));a.removeClass("sapUiMsgBarZeroCount");n.removeClass("sapUiMsgBarZeroCount")}}if(this.aErrors.length==0&&this.aWarnings.length==0&&this.aSuccesses.length==0){this.close();return}else{this.open()}if(this.oList&&this.oList.getVisible()){this.oList.setMessages(this.aSuccesses.concat(this.aWarnings).concat(this.aErrors))}this.checkForToast()};u.prototype.toggleList=function(){if(!this.oList){var t=this.getId()+"__List";this.oList=new a(t,{anchorId:this.getId(),maxListed:this.getMaxListed()})}var s=this.oList.getVisible();if(!s){this.oList.setMessages(this.aSuccesses.concat(this.aWarnings).concat(this.aErrors));this.addStyleClass("sapUiMsgBarOpen")}else{this.removeStyleClass("sapUiMsgBarOpen")}this.oList.setVisible(!s)};u.prototype.backHome=function(){var t=this.oPopup._$();if(this.oList&&this.oList.getVisible()){this.toggleList();var s=this;if(this.snapPoint.indexOf("right")!=-1){t.animate({right:this.oHomePosition.right+"px",top:this.oHomePosition.top+"px"},200,function(){s.toggleList()})}else{t.animate({left:this.oHomePosition.left+"px",top:this.oHomePosition.top+"px"},200,function(){s.toggleList()})}}else{if(this.snapPoint.indexOf("right")!=-1){t.animate({right:this.oHomePosition.right+"px",top:this.oHomePosition.top+"px"},200)}else{t.animate({left:this.oHomePosition.left+"px",top:this.oHomePosition.top+"px"},200)}}this.oDropPosition=null;this.removeStyleClass("sapUiMsgBarMoved")};u.prototype.addMessages=function(t){if(!t){return}for(var e=0,i=t.length;e<i;e++){this.deleteOneMessage(t[e].getId());switch(t[e].getType()){case l.Error:this.aErrors.push(t[e]);break;case l.Warning:this.aWarnings.push(t[e]);break;case l.Success:this.aSuccesses.push(t[e]);break;default:s.debug("ERROR: MessageBar supplied messageType="+t[e].getType())}}this.addToasts(t);this.updateCountersAndVisibility();return this};u.prototype.deleteMessages=function(t){if(!t){return}for(var s=0,e=t.length;s<e;s++){this.deleteOneMessage(t[s]);this.deleteToast(t[s])}this.updateCountersAndVisibility();return this};u.prototype.deleteAllMessages=function(){for(var t=this.aErrors.length-1;t>=0;t--){this.aErrors[t].closeDetails()}for(var t=this.aWarnings.length-1;t>=0;t--){this.aWarnings[t].closeDetails()}for(var t=this.aSuccesses.length-1;t>=0;t--){this.aSuccesses[t].closeDetails()}this.aErrors=[];this.aWarnings=[];this.aSuccesses=[];this.aToasts=[];this.updateCountersAndVisibility();return this};u.prototype.setVisible=function(t){this.setProperty("visible",t);if(t){this.updateCountersAndVisibility()}else{this.close()}return this};return u});