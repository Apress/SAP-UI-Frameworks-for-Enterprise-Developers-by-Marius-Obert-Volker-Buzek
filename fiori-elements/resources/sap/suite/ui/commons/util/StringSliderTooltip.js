/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/m/SliderTooltipBase"],function(t){"use strict";var e=t.extend("sap.suite.ui.commons.util.StringSliderTooltip",{metadata:{library:"sap.suite.ui.commons.util",properties:{mapFunction:{type:"any",group:"Misc"},fetchValue2:{type:"boolean",group:"Misc",defaultValue:false}}},renderer:{apiVersion:2,render:function(t,e){var i=e.getStringValue();if(!i){return}t.openStart("div",e);t.class("sapMSliderTooltip").class("sapSuiteUiCommonsStringSliderTooltip");t.openEnd();t.text(i);t.close("div")}}});e.prototype.getStringValue=function(){var t=this.getParent();if(!t){return null}var e=this.getFetchValue2()?t.getValue2():t.getValue();var i=this.getMapFunction()||String;return i(e)};e.prototype.sliderValueChanged=function(t){var e=this.getMapFunction()||String,i=e(t);this.$().text(i)};return e});