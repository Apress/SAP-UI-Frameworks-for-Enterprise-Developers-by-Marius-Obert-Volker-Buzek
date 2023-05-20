/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["./BaseContent","./ObjectContentRenderer","sap/ui/integration/library","sap/m/library","sap/m/IllustratedMessageType","sap/m/FlexItemData","sap/m/HBox","sap/m/VBox","sap/m/Text","sap/m/Avatar","sap/m/Link","sap/m/Label","sap/m/RatingIndicator","sap/m/Image","sap/ui/integration/controls/ObjectStatus","sap/m/ComboBox","sap/m/TextArea","sap/m/Input","sap/base/Log","sap/base/util/isEmptyObject","sap/base/util/isPlainObject","sap/base/util/merge","sap/ui/core/ResizeHandler","sap/ui/layout/AlignedFlowLayout","sap/ui/dom/units/Rem","sap/ui/integration/util/BindingHelper","sap/ui/integration/util/BindingResolver","sap/ui/integration/util/Utils","sap/ui/integration/util/Form","sap/f/AvatarGroup","sap/f/AvatarGroupItem","sap/f/cards/NumericIndicators","sap/f/cards/NumericSideIndicator","sap/f/library","sap/m/OverflowToolbar","sap/m/OverflowToolbarButton","sap/ui/core/ListItem"],function(e,t,a,i,r,n,o,s,l,u,p,c,d,m,f,g,h,v,b,y,I,C,_,w,S,x,F,A,B,G,O,T,R,L,j,P,V){"use strict";var k=i.AvatarSize;var z=i.AvatarColor;var D=i.ButtonType;var E=i.FlexRendertype;var M=i.FlexJustifyContent;var N=a.CardActionArea;var U=L.AvatarGroupType;var W=i.ToolbarStyle;var q=e.extend("sap.ui.integration.cards.ObjectContent",{metadata:{library:"sap.ui.integration",aggregations:{_form:{type:"sap.ui.integration.util.Form",multiple:false,visibility:"hidden"}}},renderer:t});q.prototype.exit=function(){e.prototype.exit.apply(this,arguments);if(this._sResizeListenerId){_.deregister(this._sResizeListenerId);this._sResizeListenerId=""}};q.prototype.onDataChanged=function(){var e=this.getCardInstance();if(this._hasData()){this.destroyAggregation("_noDataMessage")}else{this.showNoDataMessage({type:r.NoData,title:this.getCardInstance().getTranslatedText("CARD_NO_ITEMS_ERROR_CHART")})}this._getForm().updateModel();if(e.isReady()){this.validateControls(false)}};q.prototype._getForm=function(){var e=this.getAggregation("_form");if(!e){e=new B(this.getCardInstance());this.setAggregation("_form",e)}return e};q.prototype.validateControls=function(e,t){this._getForm().validate(e,t)};q.prototype._hasData=function(){var e=this.getConfiguration();if(!e.hasOwnProperty("hasData")){return true}var t=F.resolveValue(e.hasData,this,this.getBindingContext().getPath());if(Array.isArray(t)&&!t.length||I(t)&&y(t)){return false}return!!t};q.prototype.applyConfiguration=function(){var e=this.getParsedConfiguration();if(!e){return}if(e.groups){this._addGroups(e)}};q.prototype.getStaticConfiguration=function(){var e=this.getParsedConfiguration(),t;if(!this.getBindingContext()){return e}else{t=this.getBindingContext().getPath()}if(e.groups){e.groups.forEach(function(e){var a=[];if(e.items){e.items.forEach(function(e){var i=this._resolveGroupItem(e,e.path,t);a.push(i)}.bind(this))}e.items=a}.bind(this))}return e};q.prototype._resolveGroupItem=function(e,t,a){var i=C({},e),r=[],n=a+t,o=["TextArea","Input","ComboBox"].includes(e.type),s=["ButtonGroup","IconGroup"].includes(e.type);if(o){i=C(i,this._getForm().resolveControl(e))}if(e.type==="ComboBox"){if(e.item){s=true;n=a+e.item.path.substring(1);e.template=e.item.template;delete i.item}else{s=false}}if(s){var l=e.template,u=this.getModel().getProperty(n);u.forEach(function(e,t){var a=F.resolveValue(l,this,n+"/"+t+"/");r.push(a)}.bind(this));i.items=r;delete i.path;delete i.template}return i};q.prototype._getRootContainer=function(){var e=this.getAggregation("_content");if(!e){e=new s({renderType:E.Bare});this.setAggregation("_content",e);this._sResizeListenerId=_.register(e,this._onResize.bind(this))}return e};q.prototype._addGroups=function(e){var t=this._getRootContainer(),a,i=true,r=e.groups||[];r.forEach(function(e,o){var s=this._createGroup(e,"/sap.card/content/groups/"+o);if(e.alignment==="Stretch"){s.setLayoutData(new n({growFactor:1}));t.addItem(s);i=true}else{if(i){a=this._createAFLayout();t.addItem(a);i=false}a.addContent(s)}if(o===r.length-1){s.addStyleClass("sapFCardObjectGroupLastInColumn")}},this);this._oActions.attach({area:N.Content,actions:e.actions,control:this})};q.prototype._createGroup=function(e,t){var a;if(typeof e.visible=="string"){a=!A.hasFalsyValueAsString(e.visible)}else{a=e.visible}var i=new s({visible:a,renderType:E.Bare}).addStyleClass("sapFCardObjectGroup");if(e.title){i.addItem(new l({text:e.title,maxLines:e.titleMaxLines||1}).addStyleClass("sapFCardObjectItemTitle sapMTitle sapMTitleStyleAuto"));i.addStyleClass("sapFCardObjectGroupWithTitle")}e.items.forEach(function(a,r){a.labelWrapping=e.labelWrapping;this._createGroupItems(a,t+"/items/"+r).forEach(i.addItem,i)},this);return i};q.prototype._createGroupItems=function(e,t){var a=e.label,i,r,n;if(typeof e.visible=="string"){r=!A.hasFalsyValueAsString(e.visible)}else{r=e.visible}if(a){a=x.formattedProperty(a,function(e){return e&&(e[e.length-1]===":"?e:e+":")});i=new c({text:a,visible:r,wrapping:e.labelWrapping}).addStyleClass("sapFCardObjectItemLabel");i.addEventDelegate({onBeforeRendering:function(){i.setVisible(i.getVisible()&&!!i.getText())}})}n=this._createItem(e,r,i,t);if(n&&!n.isA("sap.m.Image")){n.addStyleClass("sapFCardObjectItemValue")}if(e.icon){var l=new s({renderType:E.Bare,justifyContent:M.Center,items:[i,n]}).addStyleClass("sapFCardObjectItemPairContainer");var u=new o({visible:r,renderType:E.Bare,items:[this._createGroupItemAvatar(e.icon),l]}).addStyleClass("sapFCardObjectItemLabel");return[u]}else{return[i,n]}};q.prototype._createGroupItemAvatar=function(e){var t=x.formattedProperty(e.src,function(e){return this._oIconFormatter.formatSrc(e)}.bind(this));var a=e.initials||e.text;var i=new u({displaySize:e.size||k.XS,src:t,initials:a,displayShape:e.shape,tooltip:e.alt,backgroundColor:e.backgroundColor||(a?undefined:z.Transparent),visible:e.visible}).addStyleClass("sapFCardObjectItemAvatar sapFCardIcon");return i};q.prototype._createItem=function(e,t,a,i){var r,n=e.value,o=e.tooltip,s;switch(e.type){case"NumericData":r=this._createNumericDataItem(e,t);break;case"Status":r=this._createStatusItem(e,t);break;case"IconGroup":r=this._createIconGroupItem(e,t);break;case"ButtonGroup":r=this._createButtonGroupItem(e,t);break;case"ComboBox":r=this._createComboBoxItem(e,t,a,i);break;case"TextArea":r=this._createTextAreaItem(e,t,a,i);break;case"RatingIndicator":r=this._createRatingIndicatorItem(e,t);break;case"Image":r=this._createImage(e,t);break;case"Input":r=this._createInputItem(e,t,a,i);break;case"link":b.warning("Usage of Object Group Item property 'type' with value 'link' is deprecated. Use Card Actions for navigation instead.",null,"sap.ui.integration.widgets.Card");r=new p({href:e.url||n,text:n,tooltip:o,target:e.target||"_blank",visible:x.reuse(t)});break;case"email":b.warning("Usage of Object Group Item property 'type' with value 'email' is deprecated. Use Card Actions for navigation instead.",null,"sap.ui.integration.widgets.Card");var l=[];if(e.value){l.push(e.value)}if(e.emailSubject){l.push(e.emailSubject)}s=x.formattedProperty(l,function(e,t){if(t){return"mailto:"+e+"?subject="+t}else{return"mailto:"+e}});r=new p({href:s,text:n,tooltip:o,visible:x.reuse(t)});break;case"phone":b.warning("Usage of Object Group Item property 'type' with value 'phone' is deprecated. Use Card Actions for navigation instead.",null,"sap.ui.integration.widgets.Card");s=x.formattedProperty(n,function(e){return"tel:"+e});r=new p({href:s,text:n,tooltip:o,visible:x.reuse(t)});break;default:r=this._createTextItem(e,t,a)}return r};q.prototype._createNumericDataItem=function(e,t){var a=new s({visible:x.reuse(t)});var i=new T({number:e.mainIndicator.number,numberSize:e.mainIndicator.size,scale:e.mainIndicator.unit,trend:e.mainIndicator.trend,state:e.mainIndicator.state}).addStyleClass("sapUiIntOCNumericIndicators");a.addItem(i);if(e.sideIndicators){e.sideIndicators.forEach(function(e){i.addSideIndicator(new R({title:e.title,number:e.number,unit:e.unit,state:e.state}))})}if(e.details){a.addItem(new l({text:e.details,maxLines:1}).addStyleClass("sapUiIntOCNumericIndicatorsDetails"))}return a};q.prototype._createStatusItem=function(e,t){var a=new f({text:e.value,visible:x.reuse(t),state:e.state,showStateIcon:e.showStateIcon,icon:e.customStateIcon});return a};q.prototype._createTextItem=function(e,t,a){var i=e.value,r=e.tooltip,n;if(i&&e.actions){n=new p({text:i,tooltip:r,visible:x.reuse(t)});if(a){n.addAriaLabelledBy(a)}else{b.warning("Missing label for Object group item with actions.",null,"sap.ui.integration.widgets.Card")}this._oActions.attach({area:N.ContentItemDetail,actions:e.actions,control:this,actionControl:n,enabledPropertyName:"enabled"});n=new o({renderType:E.Bare,items:n})}else if(i){n=new l({text:i,visible:x.reuse(t),maxLines:e.maxLines})}return n};q.prototype._createButtonGroupItem=function(e,t){var a=e.template;if(!a){return null}var i=new j({visible:x.reuse(t),style:W.Clear});i.addStyleClass("sapUiIntCardObjectButtonGroup");var r=new P({icon:x.formattedProperty(a.icon,function(e){return this._oIconFormatter.formatSrc(e)}.bind(this)),text:a.text||a.tooltip,tooltip:a.tooltip||a.text,type:D.Transparent,visible:a.visible});if(a.actions){r.attachPress(function(e){this._onButtonGroupPress(e,a.actions)}.bind(this))}i.bindAggregation("content",{path:e.path||"/",template:r,templateShareable:false});return i};q.prototype._onButtonGroupPress=function(e,t){var a=e.getSource();var i=F.resolveValue(t,a,a.getBindingContext().getPath());var r=i[0];this.getActions().fireAction(this,r.type,r.parameters)};q.prototype._createIconGroupItem=function(e,t){var a=e.template;if(!a){return null}var i=new G({avatarDisplaySize:e.size||k.XS,groupType:U.Individual,visible:x.reuse(t)});i._oShowMoreButton.setType(D.Transparent);i._oShowMoreButton.setEnabled(false);if(a.actions){i.attachPress(function(e){this._onIconGroupPress(e,a.actions)}.bind(this))}else{i._setInteractive(false)}var r=new O({src:x.formattedProperty(a.icon.src,function(e){return this._oIconFormatter.formatSrc(e)}.bind(this)),initials:a.icon.initials||a.icon.text,tooltip:a.icon.alt});i.bindAggregation("items",{path:e.path||"/",template:r,templateShareable:false});return i};q.prototype._onIconGroupPress=function(e,t){if(e.getParameter("overflowButtonPressed")){}else{var a=e.getParameter("eventSource");var i=F.resolveValue(t,a,a.getBindingContext().getPath());var r=i[0];this.getActions().fireAction(this,r.type,r.parameters)}};q.prototype._createComboBoxItem=function(e,t,a,i){var r=this._getForm(),n={visible:x.reuse(t),placeholder:e.placeholder,required:r.getRequiredValidationValue(e)},o,s;if(e.selectedKey){n.selectedKey=e.selectedKey}else if(e.value){n.value=e.value}o=new g(n);if(a){a.setLabelFor(o)}if(e.item){s=new V({key:e.item.template.key,text:e.item.template.title});o.bindItems({path:e.item.path||"/",template:s,templateShareable:false})}r.addControl("change",o,e,i);return o};q.prototype.setFormFieldValue=function(e){this._getForm().setControlValue(e)};q.prototype._createTextAreaItem=function(e,t,a,i){var r=this._getForm(),n=new h({required:r.getRequiredValidationValue(e),value:e.value,visible:x.reuse(t),rows:e.rows,placeholder:e.placeholder});if(a){a.setLabelFor(n)}r.addControl("liveChange",n,e,i);return n};q.prototype._createInputItem=function(e,t,a,i){var r=this._getForm(),n=new v({required:r.getRequiredValidationValue(e),value:e.value,visible:x.reuse(t),placeholder:e.placeholder});if(a){a.setLabelFor(n)}r.addControl("liveChange",n,e,i);return n};q.prototype._createRatingIndicatorItem=function(e,t){var a=new d({editable:false,displayOnly:true,maxValue:e.maxValue,value:e.value,visualMode:e.visualMode,visible:x.reuse(t)});return a};q.prototype._createImage=function(e,t){var a=x.formattedProperty(e.src,function(e){return this._oIconFormatter.formatSrc(e)}.bind(this));var i=new m({src:a,alt:e.alt,tooltip:e.tooltip,visible:x.reuse(t)}).addStyleClass("sapFCardObjectImage");if(e.fullWidth){i.addStyleClass("sapFCardObjectImageFullWidth")}return i};q.prototype._createAFLayout=function(){var e=new w;e.addEventDelegate({onAfterRendering:function(){this.getContent().forEach(function(e){if(!e.getVisible()){document.getElementById("sap-ui-invisible-"+e.getId()).parentElement.classList.add("sapFCardInvisibleContent")}})}},e);return e};q.prototype._onResize=function(e){if(e.size.width===e.oldSize.width){return}var t=this._getRootContainer().getItems();t.forEach(function(a,i){if(a.isA("sap.ui.layout.AlignedFlowLayout")){this._onAlignedFlowLayoutResize(a,e,i===t.length-1)}}.bind(this))};q.prototype._onAlignedFlowLayoutResize=function(e,t,a){var i=e.getMinItemWidth(),r,n=e.getContent().filter(function(e){return e.getVisible()}).length;if(i.lastIndexOf("rem")!==-1){r=S.toPx(i)}else if(i.lastIndexOf("px")!==-1){r=parseFloat(i)}var o=Math.floor(t.size.width/r);if(o>n){o=n}var s=o-1,l=Math.ceil(n/o);e.getContent().forEach(function(e,t){e.addStyleClass("sapFCardObjectSpaceBetweenGroup");if(s===t&&s<n){e.removeStyleClass("sapFCardObjectSpaceBetweenGroup");s+=o}if(a&&t+1>(l-1)*o){e.addStyleClass("sapFCardObjectGroupLastInColumn")}else{e.removeStyleClass("sapFCardObjectGroupLastInColumn")}})};return q});