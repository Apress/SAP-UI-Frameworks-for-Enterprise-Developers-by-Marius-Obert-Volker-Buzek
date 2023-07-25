/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Icon"],function(t,e){"use strict";var n=t.extend("sap.ushell.components.workPageBuilder.controls.WorkPageButton",{metadata:{library:"sap.ushell",properties:{icon:{type:"sap.ui.core.URI",defaultValue:"",bindable:true},tooltip:{type:"string",defaultValue:"",bindable:true}},aggregations:{_icon:{type:"sap.ui.core.Icon",multiple:false,defaultValue:null,visibility:"hidden"}},events:{press:{}}},renderer:{apiVersion:2,render:function(t,e){t.openStart("button",e);t.class("sapCepAddButton");t.attr("title",e.getTooltip());t.openEnd();t.openStart("span");t.class("sapCepAddButtonInner");t.openEnd();t.renderControl(e.getIconControl());t.close("span");t.close("button")}}});n.prototype.init=function(){this._fnHandleClick=this.onClick.bind(this);t.prototype.init.apply(this,arguments)};n.prototype.onClick=function(t){t.preventDefault();t.stopPropagation();this.fireEvent("press")};n.prototype.onBeforeRendering=function(){if(this.getDomRef()){this.getDomRef().removeEventListener("click",this._fnHandleClick)}};n.prototype.onAfterRendering=function(){this.getDomRef().addEventListener("click",this._fnHandleClick)};n.prototype.getIconControl=function(){if(!this.getAggregation("_icon")){this.setAggregation("_icon",new e({src:this.getIcon(),tooltip:this.getTooltip()}).addStyleClass("sapCepAddButtonIcon"))}return this.getAggregation("_icon")};return n});