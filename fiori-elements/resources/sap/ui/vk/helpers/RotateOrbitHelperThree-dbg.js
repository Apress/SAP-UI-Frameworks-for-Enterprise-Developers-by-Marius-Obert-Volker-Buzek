/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.helpers.RotateOrbitHelper.
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var RotateOrbitHelperThree = EventProvider.extend("sap.ui.vk.helpers.RotateOrbitHelperThree", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"rotate"
			]
		},
		constructor: function(rotateOrbitTool) {
			this._tool = rotateOrbitTool;
		}
	});

	RotateOrbitHelperThree.prototype.destroy = function() {
		this._tool = null;
	};

	/**
	 * Activates orbit rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperThree} this
	 * @public
	 */
	RotateOrbitHelperThree.prototype.activateOrbitMode = function() {
		this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode = false;
		return this;
	};

	/**
	 * Deactivates orbit rotation mode
	 *
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperThree} this
	 * @public
	 */
	RotateOrbitHelperThree.prototype.deactivateOrbitMode = function() {
		this._tool._viewport._viewportGestureHandler._cameraController.isTurnTableMode = true;
		return this;
	};

	/**
	 * Executes orbit rotation for the target Viewport.
	 *
	 * @param {int} dx The change in x-coordinate used to define the desired rotation.
	 * @param {int} dy The change in y-coordinate used to define the desired rotation.
	 * @returns {sap.ui.vk.helpers.RotateOrbitHelperThree} this
	 * @public
	 */
	RotateOrbitHelperThree.prototype.rotate = function(dx, dy) {
		this._tool._viewport._viewportGestureHandler._cameraController.rotate(dx, dy, false);
		return this;
	};

	return RotateOrbitHelperThree;
});
