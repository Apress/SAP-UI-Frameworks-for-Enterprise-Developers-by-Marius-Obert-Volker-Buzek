/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/ProgressIndicator","./ProgressIndicatorRenderer","sap/base/Log"],function(e,t,a){"use strict";var r=e.extend("sap.ui.vk.ProgressIndicator");r.prototype.setPercentValue=function(e){var t=function e(t){return typeof t==="number"&&!isNaN(t)&&t>=0&&t<=100};var r=this,s,n,i=this.$(),u,l=false;if(!t(e)){e=0;a.warning(this+": percentValue ("+e+") is not correct! Setting the default percentValue:0.")}if(this.getPercentValue()!==e){n=this.getPercentValue()-e;this.setProperty("percentValue",e,true);if(!i.length){return this}["sapMPIValueMax","sapMPIValueMin","sapMPIValueNormal","sapMPIValueGreaterHalf"].forEach(function(e){i.removeClass(e)});i.addClass(this._getCSSClassByPercentValue(e));i.addClass("sapMPIAnimate").attr("aria-valuenow",e).attr("aria-valuetext",this._getAriaValueText({fPercent:e}));u=l?Math.abs(n)*20:0;s=this.$("bar");s.animate({"flex-basis":e+"%"},u,"linear",function(){r._setText.apply(r);r.$().removeClass("sapMPIAnimate")})}return this};return r});