/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/Slider","./AnimationTimeSliderRenderer"],function(t,e){"use strict";var i=t.extend("sap.ui.vk.AnimationTimeSlider",{metadata:{library:"sap.ui.vk"}});i.prototype.init=function(){if(t.prototype.init){t.prototype.init.call(this)}};i.prototype.handleAnimationStarted=function(t){this.setProgress(true);this.setValue(0);this.setStep(.1)};i.prototype.handleAnimationUpdated=function(t){var e=t.getParameter("value");this.setValue(e)};i.prototype.handleAnimationFinished=function(t){this.setValue(100)};return i});