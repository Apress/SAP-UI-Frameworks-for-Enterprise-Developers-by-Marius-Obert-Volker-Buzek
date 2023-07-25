/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.threejs.AnimationTimeSlider
sap.ui.define([
	"sap/m/Slider",
	"./AnimationTimeSliderRenderer"
], function(
	Slider,
	AnimationTimeSliderRenderer
) {
	"use strict";

	/**
	 * Constructor for a new slider for animation time.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Shows the progress of playing playbacks in a view. The slider may be dragged to a certain time point.
	 * @extends sap.m.Slider
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.AnimationTimeSlider
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationTimeSlider = Slider.extend("sap.ui.vk.AnimationTimeSlider", /** @lends sap.ui.vk.AnimationTimeSlider.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	AnimationTimeSlider.prototype.init = function() {
		if (Slider.prototype.init) {
			Slider.prototype.init.call(this);
		}
	};

	AnimationTimeSlider.prototype.handleAnimationStarted = function(event) {
		this.setProgress(true);
		this.setValue(0);
		this.setStep(0.1);
	};

	AnimationTimeSlider.prototype.handleAnimationUpdated = function(event) {
		var value = event.getParameter("value");
		this.setValue(value);
	};

	AnimationTimeSlider.prototype.handleAnimationFinished = function(event) {
		this.setValue(100);
	};

	return AnimationTimeSlider;

});
