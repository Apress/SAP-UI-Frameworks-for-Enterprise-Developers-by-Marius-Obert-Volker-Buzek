/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./library","./util/DateUtils","sap/ui/commons/library","sap/ui/commons/Label","sap/ui/commons/RangeSlider","sap/ui/core/format/DateFormat","sap/ui/commons/Slider","sap/base/Log","./DateRangeSliderInternalRenderer"],function(t,e,i,a,s,r,n,o,h,l){"use strict";var u=r.extend("sap.suite.ui.commons.DateRangeSliderInternal",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{showBubbles:{type:"boolean",group:"Misc",defaultValue:true},pinGrip:{type:"boolean",group:"Misc",defaultValue:false},pinGrip2:{type:"boolean",group:"Misc",defaultValue:false}},events:{change:{},liveChange:{}}}});var p=12;var g="d";var f="m";u.prototype.init=function(){this.setSmallStepWidth(1);this._sGranularity=g;this._oDateFormat=null;var t=new Date;this._dMinDate=i.incrementDateByIndex(t,-365);if(!this.getTotalUnits()){this.setTotalUnits(p)}this.setMin(0);this.setMax(365);this.setValue(0);this.setValue2(365);var e=this.getLabels()&&this.getLabels().length>0;this._bUsingDefaultLabels=this.getStepLabels()&&!e;if(this._bUsingDefaultLabels){u.createRailLabels(this)}if(this.getShowBubbles()){this._oBubble=new s({id:this.getId()+"-bubbleTxt"});this._oBubble2=new s({id:this.getId()+"-bubbleTxt2"});this._oBubble.addStyleClass("sapSuiteUiCommonsDateRangeSliderBubbleLblTxt");this._oBubble2.addStyleClass("sapSuiteUiCommonsDateRangeSliderBubbleLblTxt");this._oBubble.setText(this.getFormattedDate(this.getValueDate()));this._oBubble2.setText(this.getFormattedDate(this.getValue2Date()))}};u.prototype.setVertical=function(t){h.error("DateRangeSliderInternal.setVertical method is not yet supported!");return this};u.prototype.setHeight=function(t){h.error("DateRangeSliderInternal.setHeight method is not yet supported!");return this};u.createRailLabels=function(t){var e=[];var a=t.getTotalUnits();var s=(t.getMax()-t.getMin())/a;for(var r=0;r<=a;r++){var n=Math.round(parseFloat(t.getMin()+r*s));if(n>t.getMax()){n=t.getMax()}var o=null;if(t._sGranularity===g){o=i.incrementDateByIndex(t.getMinDate(),n)}else if(t._sGranularity===f){o=i.incrementMonthByIndex(t.getMinDate(),n)}e[r]=t.getFormattedDate(o)}t.setProperty("labels",e);return e};u.repositionBubbles=function(e){var i=e.getId()+"-grip";var a=i?window.document.getElementById(i):null;var s=a.style.left;var r=s.substring(0,s.length-2);var n=parseInt(r,10);var o=e.getId()+"-grip2";var h=o?window.document.getElementById(o):null;var l=h.style.left;var u=l.substring(0,l.length-2);var p=parseInt(u,10);var g=e.getId()+"-bubble";var f=g?window.document.getElementById(g):null;var b=e.getId()+"-bubble2";var v=b?window.document.getElementById(b):null;var D=null,y=null;var d=f.style.left;if(d){D=d.substring(0,d.length-2)}var c=v.style.left;if(c){y=c.substring(0,c.length-2)}var M=t(f).css("width");var m=parseInt(M,10);var G=41;if(n+m<p||!D&&!y){f.style.left=n-G+"px";v.style.left=p-G+"px"}if(sap.ui.getCore().getConfiguration().getRTL()&&p+m<n){f.style.left=n-G+"px";v.style.left=p-G+"px"}var _=e.getFormattedDate(e.getValueDate());var L=e.getFormattedDate(e.getValue2Date());e._oBubble.setText(_);e._oBubble2.setText(L);if(e.isActive()){e._oBubble.rerender();e._oBubble2.rerender()}};u.prototype.changeGrip=function(t,e,a){o.prototype.changeGrip.apply(this,arguments);if(!isNaN(t)){var s=Math.round(t);var r=null;if(this._sGranularity===g){r=i.incrementDateByIndex(this._dMinDate,s)}else if(this._sGranularity===f){r=i.incrementMonthByIndex(this._dMinDate,s)}a.title=this.getFormattedDate(r)}};u.prototype.setAriaState=function(){var t=this.getFormattedDate(this.getValueDate());var e=this.getFormattedDate(this.getValue2Date());if(this.oMovingGrip===this.oGrip){this.oMovingGrip.setAttribute("aria-valuetext",t);this.oMovingGrip.setAttribute("aria-valuenow",this.getValue());this.oGrip2.setAttribute("aria-valuemin",t)}else{this.oMovingGrip.setAttribute("aria-valuetext",e);this.oMovingGrip.setAttribute("aria-valuenow",this.getValue2());this.oGrip.setAttribute("aria-valuemax",e)}};u.prototype.getFormattedDate=function(t){var e=null;switch(this._sGranularity){case g:e=this._oDateFormat||n.getDateInstance({style:"medium"});break;case f:e=this._oDateFormat||n.getDateInstance({pattern:"MMM YYYY"});break;default:break}return e.format(t)};u.updateLabelBubbleToolTipValues=function(t){if(t._bUsingDefaultLabels){u.createRailLabels(t)}if(t.getShowBubbles()){var e=t.getFormattedDate(t.getValueDate());var i=t.getFormattedDate(t.getValue2Date());t._oBubble.setText(e);t._oBubble2.setText(i)}};u.prototype.getDateFormat=function(){return this._oDateFormat};u.prototype.setDateFormat=function(t){if(t&&t instanceof n){this._oDateFormat=t}else{this._oDateFormat=null}u.updateLabelBubbleToolTipValues(this)};u.prototype.getDateRange=function(){var t=this.getValueDate();var e=this.getValue2Date();var i={valueDate:t,value2Date:e};return i};u.prototype.handleFireChange=function(){if(this.getShowBubbles()){u.repositionBubbles(this)}var t=this.getDateRange();this.fireChange({value:t.valueDate,value2:t.value2Date});this.fireLiveChange({value:t.valueDate,value2:t.value2Date})};u.prototype.handleFireChangeWithoutLive=function(){if(this.getShowBubbles()){u.repositionBubbles(this)}var t=this.getDateRange();this.fireChange({value:t.valueDate,value2:t.value2Date})};u.prototype.fireLiveChangeForGrip=function(t,e,i){if(this.getShowBubbles()&&i!==e){u.repositionBubbles(this)}var a;if(t===this.oGrip){if(i!==e){a=this.getDateRange();this.fireLiveChange({value:a.valueDate,value2:a.value2Date})}}else if(t===this.oGrip2){if(i!==e){a=this.getDateRange();this.fireLiveChange({value:a.valueDate,value2:a.value2Date})}}};u.prototype.onAfterRendering=function(){r.prototype.onAfterRendering.apply(this);if(this.getShowBubbles()){u.repositionBubbles(this)}};u.prototype.onresize=function(t){r.prototype.onresize.apply(this,arguments);if(this.getDomRef()){if(this.getShowBubbles()){u.repositionBubbles(this)}}};u.prototype.setStepLabels=function(t){this.setProperty("stepLabels",t);if(t===true){var e=this.getLabels()&&this.getLabels().length>0;if(!e){u.createRailLabels(this);this._bUsingDefaultLabels=true}}return this};u.prototype.setLabels=function(t){this.setProperty("labels",t);var e=this.getLabels()&&this.getLabels().length>0;if(this.getStepLabels()&&!e){u.createRailLabels(this);this._bUsingDefaultLabels=true}return this};u.prototype.setSmallStepWidth=function(t){this.setProperty("smallStepWidth",Math.round(t));return this};u.prototype.setTotalUnits=function(t){this.setProperty("totalUnits",t);if(this._bUsingDefaultLabels){u.createRailLabels(this)}return this};u.prototype.getMaxDate=function(){var t=null;switch(this._sGranularity){case g:t=i.incrementDateByIndex(this._dMinDate,this.getMax());i.resetDateToEndOfDay(t);break;case f:t=i.incrementMonthByIndex(this._dMinDate,this.getMax());i.resetDateToEndOfMonth(t);break;default:break}return t};u.prototype.setMaxDate=function(t){var e=this.getMinDate();var a=this.getValueDate();var s=this.getValue2Date();var r=false;var n=0,o=0,h=0;switch(this._sGranularity){case g:n=i.numberOfDaysApart(e,t);o=i.numberOfDaysApart(e,a);h=i.numberOfDaysApart(e,s);break;case f:n=i.numberOfMonthsApart(e,t);o=i.numberOfMonthsApart(e,a);h=i.numberOfMonthsApart(e,s);break;default:break}r=o>n||h>n;o=o>n?n:o;h=h>n?n:h;this.setProperty("min",0,true);this.setProperty("max",n,true);this.setProperty("value",o,true);this.setProperty("value2",h,true);if(this._bUsingDefaultLabels){u.createRailLabels(this)}if(r){var l=this.getDateRange();this.fireChange({value:l.valueDate,value2:l.value2Date})}return this};u.prototype.getMinDate=function(){var t=new Date(this._dMinDate);switch(this._sGranularity){case g:i.resetDateToStartOfDay(t);break;case f:i.resetDateToStartOfMonth(t);break;default:break}return t};u.prototype.setMinDate=function(t){var e=this.getMaxDate();var a=this.getValueDate();var s=this.getValue2Date();this._dMinDate=new Date(t);var r=false;var n=0,o=0,h=0;switch(this._sGranularity){case g:n=i.numberOfDaysApart(t,e);o=i.numberOfDaysApart(t,a);h=i.numberOfDaysApart(t,s);break;case f:n=i.numberOfMonthsApart(t,e);o=i.numberOfMonthsApart(t,a);h=i.numberOfMonthsApart(t,s);break;default:break}r=o<0||h<0;o=o<0?0:o;h=h<0?0:h;this.setProperty("min",0,true);this.setProperty("max",n,true);this.setProperty("value",o,true);this.setProperty("value2",h,true);if(this._bUsingDefaultLabels){u.createRailLabels(this)}if(r){var l=this.getDateRange();this.fireChange({value:l.valueDate,value2:l.value2Date})}return this};u.prototype.getValue2Date=function(){var t=null;switch(this._sGranularity){case g:t=i.incrementDateByIndex(this._dMinDate,this.getValue2());i.resetDateToEndOfDay(t);break;case f:t=i.incrementMonthByIndex(this._dMinDate,this.getValue2());i.resetDateToEndOfMonth(t);break;default:break}return t};u.prototype.setValue2Date=function(t){var e=0;switch(this._sGranularity){case g:e=i.numberOfDaysApart(this._dMinDate,t);break;case f:e=i.numberOfMonthsApart(this._dMinDate,t);break;default:break}this.setProperty("value2",e,true);var a=this.getDateRange();this.fireChange({value:a.valueDate,value2:a.value2Date});return this};u.prototype.getValueDate=function(){var t;switch(this._sGranularity){case g:t=i.incrementDateByIndex(this._dMinDate,this.getValue());i.resetDateToStartOfDay(t);break;case f:t=i.incrementMonthByIndex(this._dMinDate,this.getValue());i.resetDateToStartOfMonth(t);break;default:break}return t};u.prototype.setValueDate=function(t){var e=0;switch(this._sGranularity){case g:e=i.numberOfDaysApart(this._dMinDate,t);break;case f:e=i.numberOfMonthsApart(this._dMinDate,t);break;default:break}this.setProperty("value",e,true);var a=this.getDateRange();this.fireChange({value:a.valueDate,value2:a.value2Date});return this};u.prototype.setDayGranularity=function(){var t=this.getMinDate();var e=this.getValueDate();var a=this.getValue2Date();var s=this.getMaxDate();var r=i.numberOfDaysApart(t,e);var n=i.numberOfDaysApart(t,a);var o=i.numberOfDaysApart(t,s);this.setProperty("min",0,true);this.setProperty("value",r,true);this.setProperty("value2",n,true);this.setProperty("max",o,true);this._sGranularity=g;if(this._bUsingDefaultLabels){u.createRailLabels(this)}var h=this.getDateRange();this.fireChange({value:h.valueDate,value2:h.value2Date});return this};u.prototype.setMonthGranularity=function(){var t=this.getMinDate();var e=this.getValueDate();var a=this.getValue2Date();var s=this.getMaxDate();var r=i.numberOfMonthsApart(t,e);var n=i.numberOfMonthsApart(t,a);var o=i.numberOfMonthsApart(t,s);this.setProperty("min",0,true);this.setProperty("value",r,true);this.setProperty("value2",n,true);this.setProperty("max",o,true);this._sGranularity=f;i.resetDateToStartOfMonth(this._dMinDate);if(this._bUsingDefaultLabels){u.createRailLabels(this)}var h=this.getDateRange();this.fireChange({value:h.valueDate,value2:h.value2Date});return this};u.prototype.handleMove=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.handleMove.apply(this,[t])}};u.prototype.onsapend=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsapend.apply(this,[t])}};u.prototype.onsaphome=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsaphome.apply(this,[t])}};u.prototype.onsaprightmodifiers=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsaprightmodifiers.apply(this,[t])}};u.prototype.onsapleftmodifiers=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsapleftmodifiers.apply(this,[t])}};u.prototype.onsapright=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsapright.apply(this,[t])}};u.prototype.onsapleft=function(t){if(this.oMovingGrip===this.oGrip2&&!this.getPinGrip2()||this.oMovingGrip===this.oGrip&&!this.getPinGrip()){r.prototype.onsapleft.apply(this,[t])}};u.prototype.onclick=function(e){var i=this.oMovingGrip;if(this.getEditable()&&this.getEnabled()){var a;var s=e.target.getAttribute("ID");var r=this.getValue();var n=this.getOffsetLeft(this.oGrip)+this.iShiftGrip;switch(s){case this.oBar.id:case this.oHiLi.id:if(this.getVertical()){a=this.getBarWidth()-this.getOffsetX(e)}else{a=this.getOffsetX(e)}if(s===this.oHiLi.id){if(this.getVertical()){a-=this.getOffsetLeft(this.oHiLi)}else{a+=this.getOffsetLeft(this.oHiLi)}}r=this.convertRtlValue(this.getMin()+(this.getMax()-this.getMin())/this.getBarWidth()*a);n=this.getOffsetX(e);if(s===this.oHiLi.id){n+=this.getOffsetLeft(this.oHiLi)}if(this.oStartTarget&&this.targetIsGrip(this.oStartTarget.id)){i=this.oStartTarget}else if(this.targetIsGrip(s)){i=e.target}else{i=this.getNearestGrip(n)}break;case this.getId()+"-left":n=0;if(this.getVertical()){r=this.getMax();i=this.getRightGrip()}else{r=this.getMin();i=this.getLeftGrip()}break;case this.getId()+"-right":n=this.getBarWidth();if(!this.getVertical()){r=this.getMax();i=this.getRightGrip()}else{r=this.getMin();i=this.getLeftGrip()}break;default:if(this.targetIsGrip(s)){return}var o=s.search("-tick");if(o>=0){var h=parseInt(s.slice(this.getId().length+5),10);n=this.fTickDist*h;r=this.convertRtlValue(this.getMin()+(this.getMax()-this.getMin())/this.getTotalUnits()*h);if(this.oStartTarget&&this.targetIsGrip(this.oStartTarget.id)){i=this.oStartTarget}else if(this.targetIsGrip(s)){i=e.target}else{i=this.getNearestGrip(n)}break}var l=t(this.oBar).offset();var u=t(e.target).offset();if(this.getVertical()){n=this.getOffsetX(e)-(l.top-u.top)}else{n=this.getOffsetX(e)-(l.left-u.left)}if(n<=0){n=0;if(this.getVertical()){r=this.getMax()}else{r=this.getMin()}}else if(n>=this.getBarWidth()){n=this.getBarWidth();if(this.getVertical()){r=this.getMin()}else{r=this.getMax()}}else{if(this.getVertical()){a=this.getBarWidth()-n}else{a=n}r=this.getMin()+(this.getMax()-this.getMin())/this.getBarWidth()*a}r=this.convertRtlValue(r);if(this.oStartTarget&&this.targetIsGrip(this.oStartTarget.id)){i=this.oStartTarget}else if(this.targetIsGrip(s)){i=e.target}else{i=this.getNearestGrip(n)}break}if(i===this.oGrip2&&this.getPinGrip2()||i===this.oGrip&&this.getPinGrip()){return}var p=this.validateNewPosition(r,n,i,this.getValueForGrip(i)>r);r=p.fNewValue;n=p.iNewPos;this.changeGrip(r,n,i);this.handleFireChange()}i.focus();this.oMovingGrip=i;this.oStartTarget=null};u.prototype.onkeydown=function(t){this.oMovingGrip.setAttribute("aria-busy","true")};u.prototype.onkeyup=function(t){this.oMovingGrip.setAttribute("aria-busy","false")};return u});