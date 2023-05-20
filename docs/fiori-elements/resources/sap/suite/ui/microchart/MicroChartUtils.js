/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/m/library","sap/ui/thirdparty/jquery"],function(t,e,i){"use strict";var r=e.Size;var o={extendMicroChart:function(o){o.prototype._isResponsive=function(){return this.getSize()===r.Responsive};o.prototype._digitsAfterDecimalPoint=function(t){var e=(""+t).match(/[.,](\d+)/g);return e?(""+e).length-1:0};o.prototype.getAccessibilityInfo=function(){return{type:this._getAccessibilityControlType(),description:this.getTooltip_AsString()}};o.prototype._isThemeHighContrast=function(){return/(hcw|hcb)/g.test(sap.ui.getCore().getConfiguration().getTheme())};o.prototype.convertRemToPixels=function(t){return t*parseFloat(window.getComputedStyle(document.documentElement).fontSize)};o.prototype._isAnyLabelTruncated=function(t){return t.toArray().some(this._isLabelTruncated)};o.prototype._isAnyLabelVerticallyTruncated=function(t){return t.toArray().some(this._isLabelVerticallyTruncated)};o.prototype._isLabelTruncated=function(t){return t.scrollWidth>t.offsetWidth};o.prototype._isLabelVerticallyTruncated=function(t){return Math.abs(t.scrollHeight-t.offsetHeight)>1};o.prototype._isAnyLabelNumericAndTruncated=function(t){return t.toArray().some(this._isLabelNumericAndTruncated.bind(this))};o.prototype._isLabelNumericAndTruncated=function(t){return!i.isNumeric(t.textContent)?false:this._isLabelTruncated(t)};o.prototype.isColorCorrect=function(t){return e.ValueCSSColor.isValid(t)&&t!==""||e.ValueCSSColor.isValid(t.below)&&t.below!==""&&e.ValueCSSColor.isValid(t.above)&&t.above!==""};o.prototype.getTooltip_AsString=function(e){var i=t.prototype.getTooltip_AsString.apply(this,arguments),r=this._getAltHeaderText(e),o=false;if(i){i=i.split("((AltText))").join(r)}if(!i){i="";o=true}if(this._getAltSubText){i+=this._getAltSubText(o)}return i}}};return o},true);