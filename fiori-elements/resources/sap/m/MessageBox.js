/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Button","./Dialog","./Text","./FormattedText","./Link","./MessageStrip","./VBox","sap/ui/core/IconPool","sap/ui/core/ElementMetadata","sap/ui/core/library","sap/ui/core/Control","sap/m/library","sap/ui/thirdparty/jquery"],function(e,t,i,n,s,o,a,l,r,c,u,d,f){"use strict";var g=d.DialogType;var O=d.DialogRoleType;var p=d.ButtonType;var I=d.TitleAlignment;var T=d.FlexRendertype;var R=d.FlexAlignItems;var S=d.LinkAccessibleRole;var E=c.MessageType;var y=c.TextDirection;var x={};x.Action={OK:"OK",CANCEL:"CANCEL",YES:"YES",NO:"NO",ABORT:"ABORT",RETRY:"RETRY",IGNORE:"IGNORE",CLOSE:"CLOSE",DELETE:"DELETE"};x.Icon={NONE:undefined,INFORMATION:"INFORMATION",WARNING:"WARNING",ERROR:"ERROR",SUCCESS:"SUCCESS",QUESTION:"QUESTION"};var A=x.Action,C=x.Icon;function N(){if(x._rb!==sap.ui.getCore().getLibraryResourceBundle("sap.m")){x._rb=sap.ui.getCore().getLibraryResourceBundle("sap.m")}}function M(e){if(typeof e==="object"){return"<pre>"+JSON.stringify(e,null,"\t").replace(/{/gi,"&#x007B;")+"</pre>"}return e}function h(e,t,i,l){var r,c,u,d,f=false,g=new a({renderType:T.Bare,alignItems:R.Start,items:[t]});if(!e.details){return g}function O(e){r.setHtmlText(M(e));var t=i.getInitialFocus();i.addAriaLabelledBy(r);r.setVisible(true);c.setVisible(false);i._setInitialFocus();if(!t||t===c.getId()){l.focus()}}function p(){c.setBusyIndicatorDelay(0).setBusy(true);c.getDomRef("busyIndicator").focus();e.details().then(function(e){if(i.isDestroyed()){return}O(e)}).catch(function(){if(i.isDestroyed()){return}if(document.activeElement===c.getDomRef("busyIndicator")){f=true}c.setVisible(false);u.setVisible(true)})}r=new n({visible:false});c=new s({accessibleRole:S.Button,text:x._rb.getText("MSGBOX_LINK_TITLE"),press:function(){if(typeof e.details==="function"){p()}else{O(e.details)}}});d=new s({text:x._rb.getText("MSGBOX_DETAILS_RETRY_LOADING"),accessibleRole:S.Button,press:function(){c.setVisible(true);u.setVisible(false);var e={onAfterRendering:function(){c.removeEventDelegate(e);p()}};c.addEventDelegate(e)}});d.addEventDelegate({onAfterRendering:function(){if(f){d.focus()}f=false}});u=new o({text:x._rb.getText("MSGBOX_DETAILS_LOAD_ERROR"),type:E.Error,visible:false,link:d});c.addStyleClass("sapMMessageBoxLinkText");u.addStyleClass("sapMMessageBoxErrorText");r.addStyleClass("sapMMessageBoxDetails");g.addItem(c);g.addItem(u);g.addItem(r);return g}x.show=function(n,s){var o,a,c,d=null,T=[],R,S,E,M,b,v,B,m={id:r.uid("mbox"),initialFocus:null,textDirection:y.Inherit,verticalScrolling:true,horizontalScrolling:true,details:"",contentWidth:null},_={INFORMATION:"sapMMessageBoxInfo",WARNING:"sapMMessageBoxWarning",ERROR:"sapMMessageBoxError",SUCCESS:"sapMMessageBoxSuccess",QUESTION:"sapMMessageBoxQuestion",STANDARD:"sapMMessageBoxStandard"},L={INFORMATION:l.getIconURI("information"),WARNING:l.getIconURI("alert"),ERROR:l.getIconURI("error"),SUCCESS:l.getIconURI("sys-enter-2"),QUESTION:l.getIconURI("sys-help-2")};N();if(typeof s==="string"||arguments.length>2){S=arguments[1];E=arguments[2];M=arguments[3];b=arguments[4];v=arguments[5];B=arguments[6];s={icon:S,title:E,actions:M,onClose:b,id:v,styleClass:B}}if(s&&s.hasOwnProperty("details")){m.icon=C.INFORMATION;m.emphasizedAction=A.OK;m.actions=[A.OK,A.CANCEL];s=f.extend({},m,s)}s=f.extend({},m,s);if(typeof s.actions!=="undefined"&&!Array.isArray(s.actions)){if(s.emphasizedAction!==null){s.emphasizedAction=s.actions}s.actions=[s.actions]}if(!s.actions||s.actions.length===0){s.emphasizedAction=A.OK;s.actions=[A.OK]}function D(t,i){var n;if(x.Action.hasOwnProperty(t)){n=x._rb.getText("MSGBOX_"+t)}var s=new e({id:r.uid("mbox-btn-"),text:n||t,type:i,press:function(){d=t;o.close()}});return s}var F;for(R=0;R<s.actions.length;R++){F=s.emphasizedAction===s.actions[R]?p.Emphasized:p.Default;T.push(D(s.actions[R],F))}function w(){if(typeof s.onClose==="function"){s.onClose(d)}o.detachAfterClose(w);o.destroy()}function G(){var e=0;var t=null;if(s.initialFocus){if(s.initialFocus instanceof u){t=s.initialFocus}if(typeof s.initialFocus==="string"){for(e=0;e<T.length;e++){if(x.Action.hasOwnProperty(s.initialFocus)){if(x._rb.getText("MSGBOX_"+s.initialFocus).toLowerCase()===T[e].getText().toLowerCase()){t=T[e];break}}else{if(s.initialFocus.toLowerCase()===T[e].getText().toLowerCase()){t=T[e];break}}}}}return t}if(typeof n==="string"){c=new i({textDirection:s.textDirection}).setText(n).addStyleClass("sapMMsgBoxText");a=c}else if(n instanceof u){c=n.addStyleClass("sapMMsgBoxText")}o=new t({id:s.id,type:g.Message,title:s.title,titleAlignment:I.Auto,icon:L[s.icon],initialFocus:G(),verticalScrolling:s.verticalScrolling,horizontalScrolling:s.horizontalScrolling,afterClose:w,buttons:T,ariaLabelledBy:a?a.getId():undefined,contentWidth:s.contentWidth,closeOnNavigation:s.closeOnNavigation}).addStyleClass("sapMMessageBox");if(s.hasOwnProperty("details")&&s.details!==""){c=h(s,c,o,T[0])}o.addContent(c);o.setProperty("role",O.AlertDialog);if(_[s.icon]){o.addStyleClass(_[s.icon])}else{o.addStyleClass(_.STANDARD)}if(s.styleClass){o.addStyleClass(s.styleClass)}o.open()};x.alert=function(e,t){N();var i={icon:C.NONE,title:x._rb.getText("MSGBOX_TITLE_ALERT"),emphasizedAction:t&&t.actions?null:A.OK,actions:A.OK,id:r.uid("alert"),initialFocus:null},n,s,o,a;if(typeof t==="function"||arguments.length>2){n=arguments[1];s=arguments[2];o=arguments[3];a=arguments[4];t={onClose:n,title:s,id:o,styleClass:a}}t=f.extend({},i,t);x.show(e,t)};x.confirm=function(e,t){N();var i={icon:C.QUESTION,title:x._rb.getText("MSGBOX_TITLE_CONFIRM"),emphasizedAction:t&&t.actions?null:A.OK,actions:[A.OK,A.CANCEL],id:r.uid("confirm"),initialFocus:null},n,s,o,a;if(typeof t==="function"||arguments.length>2){n=arguments[1];s=arguments[2];o=arguments[3];a=arguments[4];t={onClose:n,title:s,id:o,styleClass:a}}t=f.extend({},i,t);x.show(e,t)};x.error=function(e,t){N();var i={icon:C.ERROR,title:x._rb.getText("MSGBOX_TITLE_ERROR"),emphasizedAction:null,actions:A.CLOSE,id:r.uid("error"),initialFocus:null};t=f.extend({},i,t);x.show(e,t)};x.information=function(e,t){N();var i={icon:C.INFORMATION,title:x._rb.getText("MSGBOX_TITLE_INFO"),emphasizedAction:t&&t.actions?null:A.OK,actions:A.OK,id:r.uid("info"),initialFocus:null};t=f.extend({},i,t);x.show(e,t)};x.warning=function(e,t){N();var i={icon:C.WARNING,title:x._rb.getText("MSGBOX_TITLE_WARNING"),emphasizedAction:t&&t.actions?null:A.OK,actions:A.OK,id:r.uid("warning"),initialFocus:null};t=f.extend({},i,t);x.show(e,t)};x.success=function(e,t){N();var i={icon:C.SUCCESS,title:x._rb.getText("MSGBOX_TITLE_SUCCESS"),emphasizedAction:t&&t.actions?null:A.OK,actions:A.OK,id:r.uid("success"),initialFocus:null};t=f.extend({},i,t);x.show(e,t)};return x},true);