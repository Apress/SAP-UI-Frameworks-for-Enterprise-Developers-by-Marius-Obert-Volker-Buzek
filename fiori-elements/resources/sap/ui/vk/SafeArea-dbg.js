/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.SafeArea

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/vk/SafeAreaRenderer"
], function(
	Control,
	SafeAreaRenderer
) {
	"use strict";

	/**
	 * Constructor for a new SafeArea.
	 *
	 * @class
	 * SafeArea allows applications to define area of viewport which will be initially displayed regardless of viewing device and its screen resolution or orientation.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.SafeArea
	 */
	var SafeArea = Control.extend("sap.ui.vk.SafeArea", /** @lends sap.ui.vk.SafeArea.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			aggregations: {
				/**
				 * Application defined setting control which can be used to control SafeArea and aspect ratio settings
				 */
				settingsControl: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
		}
	});

	SafeArea.prototype.onAfterRendering = function() {
		this.resize();
	};

	SafeArea.prototype.resize = function() {
		var sa = this.getDomRef();
		var vp = this.getParent();
		if (!sa || !vp) {
			return;
		}

		var viewportRect = vp.getDomRef().getBoundingClientRect();
		var viewportAspectRatio = viewportRect.width / viewportRect.height;
		var viewAspectRatio = viewportAspectRatio;
		var currentView = vp.getCurrentView();
		if (currentView && currentView.getAspectRatio() && currentView.getAspectRatio() > 0 && currentView.getAspectRatio() < 25) {
			viewAspectRatio = currentView.getAspectRatio();
		}

		var height = viewportRect.height;
		var width = viewportRect.width;
		if (viewportAspectRatio > viewAspectRatio) {
			sa.style.height = (height - 4) + "px";
			sa.style.width = (height * viewAspectRatio - 4) + "px";
			sa.style.left = (width - (height * viewAspectRatio - 4)) / 2 + "px";
			sa.style.top = "";
		} else if (viewportAspectRatio < viewAspectRatio) {
			sa.style.height = (width / viewAspectRatio - 4) + "px";
			sa.style.width = (width - 4) + "px";
			sa.style.top = (height - (width / viewAspectRatio - 4)) / 2 + "px";
			sa.style.left = "";
		} else {
			sa.style.height = (height - 4) + "px";
			sa.style.width = (width - 4) + "px";
		}
		if (this.getSettingsControl()) {
			var settings = this.getSettingsControl().getDomRef();
			var computedStyle = window.getComputedStyle(document.getElementById(this.getSettingsControl().sId));
			var settingsHeight = computedStyle.height;
			settings.style.position = "absolute";
			if (viewportAspectRatio < viewAspectRatio && ((height - parseFloat(sa.style.height)) / 2) > parseFloat(settingsHeight)) {
				settings.style.bottom = (parseFloat(sa.style.height) + 2) + "px";
				settings.style.left = "-2px";
				settings.style.top = "";
			} else {
				settings.style.top = "0px";
				settings.style.left = "0px";
				settings.style.bottom = "";
			}
		}
	};

	return SafeArea;
});
